// One terrain driver for every rocky world (WORLDSIM.md U3): the world's
// history (worldsim/evolve.js, on body.history) says what it went through,
// and this runs the processes that fit, as that history has them:
//
//   plates     plates move now and there are seas: the plate sim with erosion
//              coupled each step (tectonics.js) over the last few hundred Myr,
//              rain scaled by the history's climate then; then a finer erosion
//              epoch; impacts at today's rate
//   stagnant   one shell now, with a past of air or water: the plumes stay put
//              (giant volcanoes, a rise, a rift canyon), impacts over the whole
//              age, and rain and a sea while the history had liquid water
//              (stagnant.js)
//   barren     airless or dry: impacts over the whole age, lava into the big
//              basins while the interior was hot (barren.js)
//
// Impacts everywhere scale by the system's debris level (system.js) and, for a
// giant's moons, the giant's pull. (To come: icy-moon shells, Venus-style
// resurfacing, glaciers, climate, regime changes mid-history in one run.)

import * as dm from '../../core/dmath.js';
import { Rng } from '../../core/rng.js';
import { Noise3 } from '../../core/noise.js';
import { TerrainGenerator, S_LEN, S_H, S_MOIST, S_TEMP } from '../terrain.js';
import { SimGrid } from './grid.js';
import { Erosion } from './erosion.js';
import { Tectonics, blur, smoothField } from './tectonics.js';
import { Impacts, craterFloor, worldCell, WORLD_CELLS, airCut } from './impacts.js';
import { barrenWorld } from './barren.js';
import { stagnantWorld } from './stagnant.js';
import { Lithology, R as ROCK, marineRock } from './lithology.js';
import { Glaciers } from './glaciers.js';
import { Coasts } from './coasts.js';
import { climate, biomeOfKoppen } from './climate.js';
import { soilAndWater } from './soil.js';
import { LifeMap } from './life.js';

// river erosion (stream power) constants, deep time and the fine epoch: real K ~1e-6
// m^0.1/yr for m = 0.45, x ~0.8 at the game's 1/10 scale (areas and lengths shrink)
const KD = +(globalThis.process?.env?.WS_KD || 6e-7), KF = +(globalThis.process?.env?.WS_KF || 8e-7);

// the open ocean's tide (m): each moon and the star, by the equilibrium tide (M/Mp)
// Rp^4/d^3 (Earth: Moon 0.36 m, Sun 0.16 m); a world locked to its host feels no tide from it
export function tideOf(body, sys) {
  let a = 0;
  const Rp = body.radiusM, Mp = body.massEarth;
  for (const id of body.moons || []) { const m = sys.bodies[id]; const d = m.orbit && m.orbit.aReal || 0; if (d > 0) a += (m.massEarth / Mp) * Rp ** 4 / d ** 3; }
  if (body.kind === 'moon' && !body.rotation.locked) { const hst = sys.bodies[body.parentId]; const d = body.orbit && body.orbit.aReal || 0; if (d > 0) a += (hst.massEarth / Mp) * Rp ** 4 / d ** 3; }
  if (!(body.rotation.locked && body.kind !== 'moon')) { const d = body.aAU * 1.496e11; a += (sys.bodies[0].mass * 332946 / Mp) * Rp ** 4 / d ** 3; }
  return Math.min(a, 30);
}
// a big moon (over 0.5% of the planet's mass) steadies the tilt: milder ice ages
export function bigMoonOf(body, sys) { return (body.moons || []).some((id) => sys.bodies[id].massEarth / body.massEarth > 0.005); }
// the options a body's world sim takes from its system (the lab's and the game's alike)
export function simOptsFor(body, sys) {
  return { host: body.kind === 'moon' ? sys.bodies[body.parentId] : null, bigMoon: bigMoonOf(body, sys), tide: tideOf(body, sys) };
}

// which process path the history calls for
export function choosePath(body) {
  const H = body.history;
  if (!H) return 'barren';
  if (H.regime === 'mobile' && body.hydrosphere && body.hydrosphere.water === 'liquid') return 'plates';
  // (a rocky world whose plates ran a long while and then stopped: its continents and old
  // mountain belts, worn and cratered under the stagnant lid since)
  if (H.regime === 'stagnant' && H.tPlatesStop > 0.3 && body.comp && body.comp.water < 0.05 && !(body.terrain && body.terrain.icy)) return 'plates';
  // (with air but no liquid water now: a stagnant lid's processes, a Titan's methane rain
  // among them; plates without water at the surface don't build our continents)
  if (wetWindow(H) || H.titanish || (body.atmosphere && body.atmosphere.pressure > 0.05)) return 'stagnant';
  return 'barren';
}

// when the history had liquid water at the surface: [first, last] Gyr since formation, or null
export function wetWindow(H) {
  const s = H.series;
  if (!s || !s.t || !s.t.length) return null;
  let a = -1, b = -1;
  for (let i = 0; i < s.t.length; i++) if (s.rain[i] > 0) { if (a < 0) a = i; b = i; }
  return a < 0 ? null : [s.t[a], s.t[b]];
}

// opts: { N (fine grid), Nt (plate grid), myr (plate epoch), steps, dt (fine epoch), host (a moon's planet), log }
export function worldSim(body, star, opts = {}) {
  const H = body.history, p = body.terrain;
  const log = opts.log || (() => {});
  const N = opts.N ?? 256;
  const G = new SimGrid(N, body.R);
  const scale = body.R / body.radiusM;
  const host = opts.host || null;
  // impacts: the system's clutter, and a giant host's pull on its moons' share
  const focus = host && !host.solid ? 1 + 2 * Math.sqrt(Math.min(host.massEarth / 317.8, 4)) : 1;
  const rate = (star.debris ? star.debris.level : 1) * focus;
  const spike = star.debris ? star.debris.spike : null;
  const path = opts.path || choosePath(body);
  const rng = new Rng(p.seed).fork('worldsim');
  const age = H ? H.age : star.age;
  log(`worldSim: ${path} (impact rate x${rate.toFixed(2)}${spike ? ', late bombardment' : ''})`);
  const out = { path, G, rate, spike };

  // whole-world resurfacing: a hothouse with a stagnant lid and a hot interior overturns
  // (Venus' ~0.5 Gyr ago); a tide-heated icy shell renews itself (the stronger the tides,
  // the younger: Europa's ~60 Myr) and cracks
  const tidal = H ? H.tidal || 0 : 0, icy = !!(p.icy);
  let resurfaceAt = null, resurfaceShare = 0.75, crack = 0;
  if (H && H.regime === 'stagnant' && H.runaway && H.heatNow > 0.3) resurfaceAt = age - rng.fork('resurface').range(0.3, 0.8);
  if (icy && tidal > 0.2) { resurfaceAt = age - dm.clamp(0.06 / (tidal * tidal), 0.01, 2); resurfaceShare = 0.97; crack = tidal; }
  // (a rocky moon its tides melt (Io's) is paved over by its volcanoes every few Myr: no
  // impact crater lasts; its mountains, blocks thrust up through the lava, stand)
  else if (!icy && tidal > 0.6 && p.liquid === 'lava') { resurfaceAt = age - dm.clamp(0.003 / (tidal * tidal), 0.006, 1); resurfaceShare = 0.9; }
  if (resurfaceAt != null) log(`resurfaced ${Math.round((age - resurfaceAt) * 1000)} Myr ago${crack ? ' (an icy shell, cracking under the tides)' : ''}`);
  if (path === 'barren') {
    const W = barrenWorld(G, { rng: rng.fork('barren'), body, age, scale, volcEnd: 1 + 15 * dm.pow(body.massEarth, 0.6), rate, spike, resurfaceAt, resurfaceShare, crack });
    const melt = stampFresh(G, W.h, H, body, scale);
    // (the craters below its grid's: their record by place, for the finer levels to draw)
    const crater = { crat: W.crat, g: body.gravity, scale, Dw: W.dMin * 1000, Dair: airCut(body.atmosphere ? body.atmosphere.pressure : 0, body.gravity) * 1000 * scale };
    // its rock: the old crust (an icy world's old dirty ice; a rocky one's broken regolith: no
    // granite without water and plates to make it), the dark lava of the maria
    const rock = new Uint8Array(G.n), BAS = ROCK.basalt, ICE = ROCK.ice, REG = ROCK.regolith;
    for (let c = 0; c < G.n; c++) rock[c] = W.mare[c] > 0.5 ? BAS : icy ? ICE : REG;
    return Object.assign(out, { h: W.h, mare: W.mare, fresh: W.fresh, stats: W.stats, craters: survivors(G, W.impacts.events, resurfaceAt, W.plains, W.mare), melt, crater, lineae: W.lineae, chaos: W.chaos, mareLv: W.mareLv, rock });
  }
  if (path === 'stagnant') {
    let wet = wetWindow(H);
    const oceanAt = wet ? Math.max(...Array.from(H.series.oceans)) : 0;
    let seaFrac = wet ? Math.min(0.4, Math.max(0, (dm.log10(Math.max(oceanAt * 2.3e-4, 1e-9)) + 5.5) / 3.2) * 0.45) : 0;
    // a Titan: methane rain (a trickle on average, in rare storms) carving channels, lakes
    // at the poles from its hydrocarbon seas (liquids.js)
    // (the rain its history had through time: a cold world's brief warm spells cut less than a
    // warm one's lasting rain; the mean over each sim step's span)
    let rainK0 = 1, rainAt = null;
    if (wet && H.series && H.series.rain && H.series.t.length) {
      const st = H.series.t, sr = H.series.rain;
      rainAt = (tg) => { let s = 0, k = 0; for (let i = 0; i < st.length; i++) if (st[i] >= tg - 0.005 && st[i] < tg + 0.01) { s += sr[i]; k++; } return k ? s / k : 0; };
    }
    if (!wet && H.titanish && (H.mainLiquid === 'methane' || H.mainLiquid === 'ethane')) { wet = [Math.max(0, age - 1), age]; rainK0 = 0.005; seaFrac = Math.min(0.05, (H.mainLiquidDepth || 0) / ((H.mainLiquidDepth || 0) + 100)); log('methane rain: channels and polar lakes'); }
    const S = stagnantWorld(G, { rng: rng.fork('stagnant'), body, age, scale, wet, seaFrac, rainK0, tier: H.tier, volcEnd: 1 + 15 * dm.pow(body.massEarth, 0.6), rate, spike, resurfaceAt, resurfaceShare, rainAt: rainK0 === 1 ? rainAt : null });
    const volcanoes = S.shields.map((v) => ({ ...latLonOf(v.at), heightM: v.H }));
    const melt = stampFresh(G, S.h, H, body, scale);
    const crater = { crat: S.crat, g: body.gravity, scale, Dw: S.dMin * 1000, Dair: airCut(body.atmosphere ? body.atmosphere.pressure : 0, body.gravity) * 1000 * scale };
    // its rock: the old crust, and lava where the volcanoes and floods laid it
    const rock = new Uint8Array(G.n), BAS = ROCK.basalt;
    for (let c = 0; c < G.n; c++) rock[c] = S.volc[c] > 0.5 ? BAS : 0;
    // (a Titan's liquid stands in its polar basins: the methane rains out where it's cold and
    // evaporates from the low latitudes. The datum at the level that holds its share of the
    // world's area in the basins poleward of ~55 degrees; the low latitudes standing a few
    // hundred metres higher (as Titan's do), their basins dry, floored with what wind and rain
    // carried into them, so no crater there reaches down to the liquid's level)
    let ocean = null;
    const hydrocarbon = body.terrain && (body.terrain.liquid === 'methane' || body.terrain.liquid === 'ethane');
    if (hydrocarbon) {
      const share = seaFrac > 0 ? seaFrac : Math.min(0.15, body.terrain.ocean || 0.05);
      const pol = [];
      for (let c = 0; c < G.n; c++) if (Math.abs(G.dir[c * 3 + 1]) > 0.82) pol.push(S.h[c]);
      pol.sort((a, b) => a - b);
      const L = pol.length ? pol[Math.min(pol.length - 1, Math.floor(share * G.n))] : 0;
      ocean = new Uint8Array(G.n);
      for (let c = 0; c < G.n; c++) {
        const pw = dm.smoothstep(0.77, 0.88, Math.abs(G.dir[c * 3 + 1]));
        let hc = S.h[c] - L + 400 * (1 - pw);
        const floor = 2 + 300 * (1 - pw);
        if (hc < floor) hc += (floor - hc) * (1 - pw);
        S.h[c] = hc;
        if (hc < 0) ocean[c] = 1;
      }
    }
    // (how much its past rain cut, for the finer levels' valleys: stream power wears as the
    // water through it to the m = 0.45 (the same as the tiles' own), so a history's rain r for a
    // share f of its time cuts f r^0.45 of what an Earth's lasting rain does; a Titan's methane
    // rain its own rate (rainK0) through its window)
    // (split as the tiles use it: how hard it rained while it rained (wetRain, an Earth's 1: the
    // rivers' sizes) and for what share of the time (wetFrac: how much they cut))
    let wetFrac = 0, wetRain = 0;
    if (rainK0 < 1 && wet) { wetFrac = (wet[1] - wet[0]) / Math.max(age, 0.1); wetRain = rainK0; }
    else if (H.series && H.series.rain) { const st = H.series.t, sr = H.series.rain; let tw = 0, rw = 0; for (let i = 1; i < st.length; i++) if (sr[i] > 0) { const d = st[i] - st[i - 1]; tw += d; rw += d * sr[i]; } wetFrac = tw / Math.max(age, 0.1); wetRain = tw > 0 ? rw / tw : 0; }
    wetFrac = dm.clamp(wetFrac, 0, 1); wetRain = dm.clamp(wetRain, 0, 3);
    const wetK = wetFrac * dm.pow(wetRain, 0.45);
    return Object.assign(out, { h: S.h, volc: S.volc, river: S.river, stats: S.stats, wet, seaFrac, wetK, wetFrac, wetRain, craters: survivors(G, S.impacts.events, resurfaceAt, S.volc), volcanoes, melt, crater, rock, shieldFields: S.shieldFields, ocean });
  }

  // ---- plates: the generator's continents as the starting crust
  const gen = new TerrainGenerator(p);
  const s = new Float64Array(S_LEN);
  const Nt = opts.Nt ?? 128, myr = opts.myr ?? 300, tdt = 0.5;
  const Gt = new SimGrid(Nt, body.R);
  const cont = new Float64Array(Gt.n), relief = new Float64Array(Gt.n), rainT = new Float64Array(Gt.n);
  for (let c = 0; c < Gt.n; c++) {
    gen.sample(Gt.dir[c * 3], Gt.dir[c * 3 + 1], Gt.dir[c * 3 + 2], Gt.spacing, s);
    cont[c] = Math.min(1, Math.max(0, (s[S_H] + 600) / 700));
    relief[c] = Math.min(25, Math.max(0, s[S_H]) / 150 * 0.6);
    rainT[c] = Math.max(0.05, s[S_MOIST]) * (s[S_TEMP] > 263 ? 1 : 0.3);
  }
  const pressure = body.atmosphere ? body.atmosphere.pressure || 0 : 0;
  const T = new Tectonics(Gt, { rng: rng.fork('tectonics'), plates: p.plates, cont, relief, ocean: p.ocean, volcanism: p.volcanism, activity: H.tier, life: H.lifeEver });
  T.impacts = new Impacts(Gt, { rng: rng.fork('impacts'), g: body.gravity, pressure, rate, scale });
  const ht = new Float64Array(Gt.n), ut = new Float64Array(Gt.n);
  T.heights(ht, null);
  const sea = !!p.liquid && p.liquid !== 'lava' && p.ocean > 0;
  const Et = new Erosion(Gt, ht, { sea, K: KD, rain: rainT, m: 0.45, kd: 1 });
  Et.routeEvery = 2;   // (0.5 Myr steps: the drainage hardly changes from one to the next)
  const realms = new RealmTracker(Gt, rng.fork('realms'));
  for (let k = 0; k < myr / tdt; k++) {
    Et.rainK = H.at(myr - k * tdt, 'rain') || 0.05; // the climate then, vs now
    Et.bare = !plantsAt(H, myr - k * tdt);           // no land plants yet: nothing holds the soil
    Et.veg = Et.bare ? null : vegFrom(rainT, Et.rainK, Et.veg);
    T.stepEroded(tdt, Et);
    // life's realms ride the plates (every 10 Myr, while there are land plants)
    if (!Et.bare && k % Math.round(10 / tdt) === 0) realms.check(T, ht, myr - k * tdt);
    if (opts.onPlateStep) opts.onPlateStep(T, ht, k * tdt);
  }
  if (realms.checks) realms.check(T, ht, 0);
  if (realms.checks) log(`realms: ${realms.count()} lineages on the land now; ${realms.interchanges.length} interchanges (landmasses meeting), ${realms.splits} divergences (split apart)`);
  T.heights(ht, ut);
  // the climate on the plates' surface: the fine epoch's rain and snow come from it
  const Gc = new SimGrid(opts.Nc ?? 40, body.R);
  const climOpts = climateOpts(body, star, host);
  // (a world without seas has none in its climate, whatever lies below its datum)
  const drySea = sea ? null : new Uint8Array(Gt.n);
  let clim = climateOn(Gc, Gt, ht, climOpts, drySea);
  // life on the map (life.js), and the climate again with its plant cover (forests darken
  // the land, plants hand rain on inland): the cover then holds the fine epoch's soil
  // (the realms the plates' history left, on the climate grid)
  const realmGc = realms.checks ? realms.onGrid(Gc) : null;
  let life0 = lifeOn(Gc, clim, H, rng.fork('life0'), null, realmGc);
  clim = climateOn(Gc, Gt, ht, climOpts, drySea, life0);
  life0 = lifeOn(Gc, clim, H, rng.fork('life0'), null, realmGc);
  log(`climate: ${summarizeKoppen(clim)}`);
  log(`plates: ${myr} Myr, ${T.plates.filter((q) => !q.dead).length} plates, ${T.hot.length} hotspots (${T.activity.name}), ${(T.events || []).length} rifts/welds, ${T.impacts.events.length} impacts`);
  // the finer epoch: the plates' surface and uplift, rivers cutting it finer
  const h = new Float64Array(G.n), U = new Float64Array(G.n), rain = new Float64Array(G.n), pet = new Float64Array(G.n);
  // the climate's temperatures for the ice and the reefs: the yearly mean brought to sea
  // level (the ice puts its own height back), snowfall, and the sea's coldest month
  const lapse = climOpts.lapse ?? 0.0065;
  const tSea = new Float64Array(Gc.n), tCold = new Float64Array(Gc.n), tmSea = new Float64Array(12 * Gc.n);
  for (let c = 0; c < Gc.n; c++) {
    const up = clim.sea[c] ? 0 : lapse * Math.max(0, clim.h[c]);
    tSea[c] = clim.Tann[c] + up;
    let mn = 1e9; for (let m = 0; m < 12; m++) { mn = Math.min(mn, clim.Tm[m * Gc.n + c]); tmSea[m * Gc.n + c] = clim.Tm[m * Gc.n + c] + up; } tCold[c] = mn;
  }
  const Tsl = new Float32Array(G.n), snow = new Float32Array(G.n), sst = new Float32Array(G.n), TmSL = new Float32Array(12 * G.n), plantCover = new Float32Array(G.n);
  const monthSlice = Array.from({ length: 12 }, (_, m) => tmSea.subarray(m * Gc.n, (m + 1) * Gc.n));
  const d = [0, 0, 0];
  for (let c = 0; c < G.n; c++) {
    d[0] = G.dir[c * 3]; d[1] = G.dir[c * 3 + 1]; d[2] = G.dir[c * 3 + 2];
    h[c] = Gt.sample(ht, d); U[c] = Gt.sample(ut, d);
    rain[c] = Math.max(0.03, Gc.sample(clim.Pann, d) / 1000); // (rain in m/yr, from the climate)
    pet[c] = petOf(Gc.sample(clim.Tann, d), rain[c]);
    Tsl[c] = Gc.sample(tSea, d); snow[c] = rain[c]; sst[c] = Gc.sample(tCold, d);
    plantCover[c] = Gc.sample(life0.plantCover, d);
    for (let m = 0; m < 12; m++) TmSL[m * G.n + c] = Gc.sample(monthSlice[m], d);
    if (h[c] > 0) h[c] += (hashJitter(c) - 0.5) * 5;
  }
  const h0 = Float64Array.from(h);
  const lakeShare = (Ex, hx) => { let lk = 0, land = 0; for (let c = 0; c < hx.length; c++) { if (Ex.base[c]) continue; land += Ex.G.area[c]; if (Ex.fill[c] - hx[c] > 20) lk += Ex.G.area[c]; } return (100 * lk / Math.max(land, 1)).toFixed(1); };
  // the rock: each place's layers, from what the plates carried there
  const lith = buildRock(G, Gt, T, rng.fork('rock'));
  const E = new Erosion(G, h, { sea, K: KF, rain, pet, m: 0.45, kd: 1 });
  E.U.set(U);
  E.findBase(); E.route();
  log(`lakes on the plates' surface: ${lakeShare(E, h)}% of the land under standing water (if every basin filled)`);
  const Ef = new Impacts(G, { rng: rng.fork('impacts-fine'), g: body.gravity, pressure, rate, scale });
  const steps = opts.steps ?? 60, dt = opts.dt ?? 2.5e5;
  const hb = new Float64Array(G.n);
  const ice = new Glaciers(G, p.climate, scale);
  ice.Tsl = Tsl; ice.TmSL = TmSL; ice.lapse = lapse;
  const pH = H.seaPH ?? 8.2;
  const sea2 = new Coasts(G, { corals: H.life && H.life.animals != null && H.lifeStage >= 6, warm: 0.5, pH });
  const hMax = 9000 * Math.sqrt(9.81 / body.gravity);
  let iceMax = 0;
  const iceTop = new Float32Array(G.n);   // (the thickest ice each place carried: tuyas)
  const stopped = H.regime === 'stagnant', sinceStop = stopped ? Math.max(0, H.age - (H.tPlatesStop || H.age)) : 0;
  if (stopped) log(`plates ran until ${H.tPlatesStop.toFixed(2)} Gyr; a stagnant lid since (no uplift in the fine epoch)`);
  // ice ages (the tilt and orbit's slow cycles, with the ice's own feedback): in the epoch's
  // last ~40% the steps alternate glacial and interglacial, ending in an interglacial (now);
  // strongest on cold worlds, and without a big moon to steady the tilt (Mars' wanders)
  const wetWorld = sea && pressure > 0.01;
  const iceAgeK = wetWorld ? 4 * dm.smoothstep(293, 281, H.T) * (opts.bigMoon === false ? 1.8 : 1) : 0;
  const lowRiver = new Uint8Array(G.n);   // river channels on ground the sea gave back at a glacial low
  let maxDrop = 0;
  // (the fine grid's cells on the plates' grid, for the isostasy's regional averaging)
  const fineToT = new Int32Array(G.n), fineReg = new Float64Array(Gt.n), coarseN = new Uint32Array(Gt.n), isoDh = new Float64Array(G.n);
  const lifted = new Float64Array(G.n);   // the uplift (and isostatic rise) each cell got: the rest of its change was wear or fill
  for (let c = 0; c < G.n; c++) fineToT[c] = Gt.cellAt(G.dir[c * 3], G.dir[c * 3 + 1], G.dir[c * 3 + 2]);
  let totalArea = 0, wetArea = 0;
  for (let c = 0; c < G.n; c++) { totalArea += G.area[c]; if (h[c] < 0) wetArea += G.area[c]; }
  const oceanShare = wetArea / totalArea;
  for (let k = 0; k < steps; k++) {
    Ef.step(dt / 1e6, craterFloor(worldCell(G.R, G.N), WORLD_CELLS) / 1000, (c, dh) => { h[c] += h[c] < 0 ? dh * 0.5 : dh; if (dh < 0) lith.erode(c, -dh); else lith.deposit(c, dh, ROCK.regolith); }, k * dt / 1e6, undefined, h);
    E.rainK = H.at((steps - k) * dt / 1e6, 'rain') || 0.05;
    E.petK = dm.exp(0.06 * ((H.at((steps - k) * dt / 1e6, 'T') ?? H.T) - H.T)); // (warmer then: more evaporation)
    E.bare = !plantsAt(H, (steps - k) * dt / 1e6);
    E.veg = E.bare ? null : plantCover;   // (life.js: the plants' cover holds the slopes)
    lith.kField(KF, E.K);                 // each place wears as its exposed rock does
    // (crust can't hold mountains past ~9 km on an Earth: uplift fades out near the limit)
    for (let c = 0; c < G.n; c++) E.U[c] = stopped ? 0 : U[c] * Math.max(0, Math.min(1, (hMax - h[c]) / (0.15 * hMax)));
    hb.set(h);
    E.step(dt);
    // the ice, where it's cold enough then (the history's climate vs today's)
    const ago = (steps - k) * dt / 1e6;
    const glacial = iceAgeK > 0.3 && k >= steps * 0.6 && (steps - 1 - k) % 2 === 1;
    const dTnow = (H.at(ago, 'T') ?? H.T) - H.T - (glacial ? iceAgeK : 0);
    iceMax = Math.max(iceMax, ice.step(h, E, snow, dt, dTnow));
    for (let c = 0; c < G.n; c++) if (ice.ice[c] > iceTop[c]) iceTop[c] = ice.ice[c];
    sea2.sst = sst; sea2.dT = dTnow;
    // the sea's edge: waves, sand, reefs (warm seas reach further from the equator in a warm climate)
    sea2.step(h, lith, E, dt, 1 + ((H.at(ago, 'T') ?? H.T) - 288) / 40);
    // isostasy: the regional part of this step's wear and fill (spread over a few hundred
    // km on the plates' coarser grid) floats back ~85% (worn regions rise, loaded basins sink)
    {
      fineReg.fill(0); coarseN.fill(0);
      for (let c = 0; c < G.n; c++) { const q = fineToT[c]; fineReg[q] += h[c] - (hb[c] + E.U[c] * dt); coarseN[q]++; }
      for (let q = 0; q < Gt.n; q++) fineReg[q] = coarseN[q] ? fineReg[q] / coarseN[q] : 0;
      blur(Gt, fineReg, 9);
      for (let c = 0; c < G.n; c++) { d[0] = G.dir[c * 3]; d[1] = G.dir[c * 3 + 1]; d[2] = G.dir[c * 3 + 2]; isoDh[c] = -0.85 * Gt.sample(fineReg, d); }
    }
    if (opts.onFineStep) opts.onFineStep(k, E, h);
    // what was cut comes off the layers; what settled goes on as new rock (river sand and
    // gravel on land, mud in lakes, salt where closed lakes dried, the sea's own on its floor)
    for (let c = 0; c < G.n; c++) {
      let dz = h[c] - (hb[c] + E.U[c] * dt);
      if (dz < -0.01) { lith.erode(c, -dz); continue; }
      const salt = E.saltDz[c];
      if (salt > 0) { dz -= salt; }
      if (dz > 0.01) {
        if (E.base[c]) lith.deposit(c, dz, marineRock(-h[c], Math.abs(G.dir[c * 3 + 1]) < 0.55, H.lifeEver, dz > 5, pH));
        else lith.deposit(c, dz, E.lakeKind[c] ? ROCK.shale : ROCK.alluvium);
      }
      if (salt > 0) lith.deposit(c, salt, ROCK.salt);
    }
    for (let c = 0; c < G.n; c++) { h[c] += isoDh[c]; lifted[c] += isoDh[c] + E.U[c] * dt; }
    // sea level holds the world's ocean share (as the plates' epoch does): wear moves land
    // into the sea, and low coasts would otherwise slip under it
    {
      let lo = -500, hi = 500;
      for (let it = 0; it < 24; it++) {
        const mid = (lo + hi) / 2;
        let w = 0;
        for (let c = 0; c < G.n; c++) if (h[c] < mid) w += G.area[c];
        if (w / totalArea < oceanShare) lo = mid; else hi = mid;
      }
      const sl = (lo + hi) / 2;
      if (Math.abs(sl) > 0.01) for (let c = 0; c < G.n; c++) h[c] -= sl;
    }
    // a glacial: the ice on land is water out of the sea (Earth's last: ~120 m)
    if (glacial) {
      let vol = 0;
      for (let c = 0; c < G.n; c++) if (h[c] >= 0 && ice.ice[c] > 0) vol += ice.ice[c] * G.area[c];
      const drop = Math.min(250, 0.917 * vol / (oceanShare * totalArea));
      maxDrop = Math.max(maxDrop, drop);
      for (let c = 0; c < G.n; c++) h[c] += drop;
      let amax = 0;
      for (let c = 0; c < G.n; c++) if (!E.base[c] && E.A[c] > amax) amax = E.A[c];
      for (let c = 0; c < G.n; c++) if (h[c] >= 0 && h[c] < drop && E.A[c] > amax * 0.03) lowRiver[c] = 1;
    }
  }
  if (iceAgeK > 0.3) log(`ice ages: swings of ${iceAgeK.toFixed(1)} K; the sea fell up to ${Math.round(maxDrop)} m at the glacials`);
  // plates stopped long ago: the craters of all the time since, on the worn landscape
  if (stopped && sinceStop > 0.01) {
    const made = Ef.step(sinceStop * 1000, craterFloor(worldCell(G.R, G.N), WORLD_CELLS) / 1000, (c, dh) => { h[c] += dh; if (dh < 0) lith.erode(c, -dh); else lith.deposit(c, dh, ROCK.regolith); }, steps * dt / 1e6, undefined, h);
    log(`the plates stopped ${Math.round(sinceStop * 1000)} Myr ago: ${made.length} craters since, on the old continents`);
  }
  E.findBase(); E.route(); E.lakes(); E.drain();
  log(`lakes after the fine epoch: ${lakeShare(E, h)}% of the land below the basins' brims`);
  {
    const LL = E.lakeList, closed = LL.filter((l) => l.closed), k2 = 1 / (scale * scale) / 1e6;
    log(`lakes: ${LL.length}, ${closed.length} closed (${closed.filter((l) => l.kind === 2).length} salt lakes, ${closed.filter((l) => l.kind === 3).length} salt flats)`);
    const big = LL.slice().sort((a, b) => b.area - a.area).slice(0, 5);
    log('  biggest basins: ' + big.map((l) => `${Math.round(l.area * k2)} km2 ${l.closed ? (l.kind === 2 ? 'salt lake' : 'salt flat') : 'open'} (rain ${(l.P / l.area).toFixed(2)}, evap ${(l.E / l.area).toFixed(2)} m/yr, in/out ${(l.inflow / Math.max(1e-9, l.E - l.P)).toFixed(2)})`).join('; '));
  }
  const volcanoes = T.hot.map((v) => ({ ...latLonOf(v.at), hotspot: true }));
  // tuyas (lava meeting ice: materials.js REACTIONS): a hotspot erupting under an ice sheet
  // builds its pile inside the meltwater vault it thaws (pillow lava, glassy rubble) until it
  // breaks the ice's surface, then caps it with lava: flat-topped, steep-sided mountains as
  // tall as the ice was thick (Iceland's Herdubreid), in a field round the hotspot. For the
  // local detail to draw: { d, base, top (m), r (the flat top's radius, m) }
  const tuyas = [];
  {
    const tr = rng.fork('tuyas'), p = [0, 0, 0], e1 = [0, 0, 0], e2 = [0, 0, 0];
    for (const v of T.hot) {
      const a0 = v.at, c0 = G.cellAt(a0[0], a0[1], a0[2]);
      let iced = iceTop[c0] > 300;
      for (let e = G.nStart[c0]; e < G.nStart[c0 + 1] && !iced; e++) if (iceTop[G.nbr[e]] > 300) iced = true;
      if (!iced) continue;
      // (a tangent frame at the hotspot)
      const ref = Math.abs(a0[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
      e1[0] = ref[1] * a0[2] - ref[2] * a0[1]; e1[1] = ref[2] * a0[0] - ref[0] * a0[2]; e1[2] = ref[0] * a0[1] - ref[1] * a0[0];
      const l1 = Math.sqrt(e1[0] * e1[0] + e1[1] * e1[1] + e1[2] * e1[2]); e1[0] /= l1; e1[1] /= l1; e1[2] /= l1;
      e2[0] = a0[1] * e1[2] - a0[2] * e1[1]; e2[1] = a0[2] * e1[0] - a0[0] * e1[2]; e2[2] = a0[0] * e1[1] - a0[1] * e1[0];
      const want = Math.round(2 + 4 * Math.min(1.5, v.s));
      for (let i = 0, made = 0; i < want * 3 && made < want; i++) {
        const ang = tr.range(0, 2 * Math.PI), rr = Math.sqrt(tr.next()) * 1.2 * G.spacing / G.R;
        for (let k = 0; k < 3; k++) p[k] = a0[k] + rr * (dm.cos(ang) * e1[k] + dm.sin(ang) * e2[k]);
        const lp = Math.sqrt(p[0] * p[0] + p[1] * p[1] + p[2] * p[2]);
        const c = G.cellAt(p[0], p[1], p[2]);
        if (iceTop[c] < 300 || h[c] < -50) continue;
        tuyas.push({ d: [p[0] / lp, p[1] / lp, p[2] / lp], base: h[c], top: h[c] + Math.min(1500, iceTop[c]), r: tr.range(700, 2200) });
        made++;
      }
    }
    if (tuyas.length) log(`tuyas: ${tuyas.length} flat-topped volcanoes where hotspots erupted under the ice`);
  }
  log(`ice: up to ${iceMax} cells covered; ${ice.everIce.reduce((a, b) => a + b, 0)} cells ever glaciated`);
  // how rivers run now: meandering where plants hold the banks, braided on bare ground
  out.riverStyle = plantsAt(H, 0) ? 'meandering' : 'braided';
  // the climate now, on the finished surface: biomes for the game
  // (open water for the climate: the sea and the lakes)
  const wetMask = Uint8Array.from(E.base, (b, c) => b || E.water[c] - h[c] >= 1 ? 1 : 0);
  clim = climateOn(Gc, G, h, climOpts, wetMask, life0);
  log(`climate now: ${summarizeKoppen(clim)}`);
  out.climate = clim; out.Gc = Gc;
  // the beaches' sand shows as the surface rock there
  const rock = lith.exposed();
  for (let c = 0; c < G.n; c++) if (sea2.beach[c] > 2 && h[c] >= 0) rock[c] = sea2.sand[c];
  // dune seas and mesa country (for the local detail to draw): sand seas where it's truly
  // dry, sand to hand (loose river sand, sandstone, beach sand) and the ground gentle;
  // mesas and buttes where dry country cut into a hard cap over soft rock stands in steps
  const dunes = new Uint8Array(G.n), mesas = new Uint8Array(G.n);
  for (let c = 0; c < G.n; c++) {
    if (h[c] < 0 || E.base[c] || ice.ice[c] > 0) continue;
    d[0] = G.dir[c * 3]; d[1] = G.dir[c * 3 + 1]; d[2] = G.dir[c * 3 + 2];
    const k = clim.koppen[Gc.cellAt(d[0], d[1], d[2])];
    if (!k || k[0] !== 'B') continue;
    let steep = 0;
    for (let e = G.nStart[c]; e < G.nStart[c + 1]; e++) steep = Math.max(steep, Math.abs(h[c] - h[G.nbr[e]]));
    const top = rock[c];
    const sandy = top === ROCK.alluvium || top === ROCK.sandstone || top === ROCK['quartz sand'];
    if (k[1] === 'W' && sandy && steep < 150) dunes[c] = 1;
    const cap = top === ROCK.sandstone || top === ROCK.basalt || top === ROCK.limestone;
    let softBelow = false;
    for (let i = 1; i < lith.count[c]; i++) if (lith.type[c * lith.L + i] === ROCK.shale) softBelow = true;
    if (cap && softBelow && steep > 150 && steep < 1500) mesas[c] = 1;
  }
  // (a sand sea is wide: its cells' share of the country round them, so a lone sandy cell
  // stays a sand sheet and a sea's edges thin out; 0..255)
  {
    const f = Float64Array.from(dunes);
    smoothField(G, f, 3);
    for (let c = 0; c < G.n; c++) dunes[c] = Math.round(255 * Math.min(1, f[c]));
  }
  // soil and groundwater (soil.js): dust for loess from the deserts and the ice's edges
  const dust = new Uint8Array(G.n), net = new Float64Array(G.n), tNow = new Float64Array(G.n);
  for (let c = 0; c < G.n; c++) {
    net[c] = h[c] - h0[c] - lifted[c];
    tNow[c] = Tsl[c] - lapse * Math.max(h[c], 0);
    if (h[c] < 0) continue;
    d[0] = G.dir[c * 3]; d[1] = G.dir[c * 3 + 1]; d[2] = G.dir[c * 3 + 2];
    const k = clim.koppen[Gc.cellAt(d[0], d[1], d[2])];
    if (k && k.startsWith('BW')) dust[c] = 1;
    else if (ice.ice[c] > 0) for (let e = G.nStart[c]; e < G.nStart[c + 1]; e++) if (ice.ice[G.nbr[e]] <= 0 && h[G.nbr[e]] >= 0) { dust[c] = 1; break; }
  }
  const soil = soilAndWater(G, h, { E, years: steps * dt, net, T: tNow, P: rain, pet, rock, ice: ice.ice, everIce: ice.everIce, plants: E.veg, dust });
  {
    let la = 0, deep = 0, thin = 0, wetA = 0, loessA = 0;
    for (let c = 0; c < G.n; c++) { if (h[c] < 0 || E.base[c] || ice.ice[c] > 0) continue; la += G.area[c]; if (soil.depth[c] > 2) deep += G.area[c]; if (soil.depth[c] < 0.3) thin += G.area[c]; if (soil.wet[c]) wetA += G.area[c]; if (soil.loess[c] > 5) loessA += G.area[c]; }
    log(`soil: ${(deep / la * 100).toFixed(0)}% of ice-free land deeper than 2 m, ${(thin / la * 100).toFixed(0)}% thinner than 0.3 m; wetlands ${(wetA / la * 100).toFixed(1)}%; loess ${(loessA / la * 100).toFixed(1)}%`);
  }
  // life on the map now, with the soil and groundwater (and rivers' nutrients at the coasts)
  const life = lifeOn(Gc, clim, H, rng.fork('life'), { G, soil, E, h }, realmGc);
  life.interchanges = realms.interchanges;
  {
    const S = life.summary(life.env);
    log(`life: land ${(S.landCover * 100).toFixed(0)}% covered (forest ${(S.forest * 100).toFixed(0)}%, open ${(S.open * 100).toFixed(0)}%), sea life ${(S.seaLife * 100).toFixed(0)}%, ${S.realms} realms`);
  }
  out.life = life;
  // tides on the finished coasts (the open ocean's range from the moons and the star)
  if (sea) {
    sea2.survey(h, E.base);
    sea2.tides(h, opts.tide ?? 0.3, sst);
    let mx = 0; for (let c = 0; c < G.n; c++) mx = Math.max(mx, sea2.tide[c]);
    log(`tides: ${(2 * (opts.tide ?? 0.3)).toFixed(1)} m in the open ocean, up to ${mx.toFixed(1)} m at the coast`);
  }
  // drowned river valleys: channels cut across shelves the glacial sea left dry, flooded since
  // (rias, estuaries)
  const drowned = new Uint8Array(G.n);
  for (let c = 0; c < G.n; c++) if (lowRiver[c] && h[c] < 0) drowned[c] = 1;
  const melt = stampFresh(G, h, H, body, scale);
  return Object.assign(out, { h, h0, E, Gt, ht, tect: T, impacts: Ef, craters: T.impacts.events.concat(Ef.events), volcanoes, tuyas, lith, rock, glaciers: ice, veg: E.veg, coasts: sea2, dunes, mesas, soil, drowned, melt });
}

// Each fine cell's layers from the plates' record there: the basement (granite
// under continents, basalt under the sea floor), the sediment cover split into
// beds of sandstone and shale (and limestone and chalk where shelves built
// them), and volcanic rock on top where hotspots and arcs piled it. Beds run
// on for hundreds of km, thickening and thinning gently, so outcrops follow
// the land's contours as on a geological map.
function buildRock(G, Gt, T, rng) {
  const lith = new Lithology(G.n, 10);
  // the plates' record gathered onto the coarse grid, then blended between its cells
  const sedW = new Float64Array(Gt.n), carbW = new Float64Array(Gt.n), contW = new Float64Array(Gt.n), volW = new Float64Array(Gt.n);
  for (let c = 0; c < Gt.n; c++) {
    const P = T.plates[T.owner[c]], q = T.src[c];
    sedW[c] = Math.min(P.sed[q], 8000); carbW[c] = Math.min(P.carb[q], P.sed[q]); contW[c] = P.cont[q]; volW[c] = P.relief[q];
  }
  const beds = [];
  for (let i = 0; i < 24; i++) beds.push({ v: rng.unitVector(), k: rng.range(2, 6), ph: rng.range(0, 6.283), base: rng.range(150, 450), amp: rng.range(80, 400), type: rng.next() < 0.5 ? 'shale' : 'sandstone', carb: rng.next() < 0.5 ? 'limestone' : 'chalk' });
  const d = [0, 0, 0], uv = { face: 0, u: 0, v: 0 };
  // (how thick the cover is varies at every scale, as the ground it filled did: its hollows and
  // old channels, bars and banks; read smoothly from the plates' record, an edge where the
  // cover thins out would run as straight as that record's cells: a few cells of it to a
  // fraction of one, and the edge of the continents' basement under it as ragged)
  const nzS = new Noise3(rng.u32()), nzB = new Noise3(rng.u32()), kq = G.N / 12;
  for (let c = 0; c < G.n; c++) {
    d[0] = G.dir[c * 3]; d[1] = G.dir[c * 3 + 1]; d[2] = G.dir[c * 3 + 2];
    lith.base[c] = Gt.sample(contW, d, uv) + 0.15 * nzB.fbm(d[0] * kq, d[1] * kq, d[2] * kq, 5, 2, 0.6) > 0.5 ? ROCK.granite : ROCK.basalt;
    // (as a share of it and, so that where it thins out the edge wanders too, not only its
    // thickness, by so many metres: outliers of it on the bare basement, inliers through it)
    const vary = Math.max(0, 1 + 0.8 * nzS.fbm(d[0] * kq, d[1] * kq, d[2] * kq, 5, 2, 0.6));
    const sed0 = Gt.sample(sedW, d, uv), add = 180 * nzS.fbm(d[0] * kq + 17.3, d[1] * kq - 4.1, d[2] * kq + 9.7, 5, 2, 0.6);
    let sed = Math.max(0, sed0 * vary + add), carb = Math.min(Gt.sample(carbW, d, uv) * vary * (sed0 > 0 ? sed / Math.max(1, sed0 * vary) : 0), sed);
    // oldest first: each bed's thickness waves gently across the world
    for (let i = 0; i < beds.length && sed > 1; i++) {
      const B = beds[i];
      const bed = Math.min(sed, B.base + B.amp * dm.sin((d[0] * B.v[0] + d[1] * B.v[1] + d[2] * B.v[2]) * B.k + B.ph));
      if (bed <= 0) continue;
      const carbHere = carb > 0 && sed - bed < carb * 1.5;
      lith.deposit(c, bed, carbHere ? ROCK[B.carb] : ROCK[B.type]);
      if (carbHere) carb -= bed;
      sed -= bed;
    }
    const vol = Gt.sample(volW, d, uv);
    if (vol > 150) lith.deposit(c, vol, lith.base[c] === ROCK.granite ? ROCK.andesite : ROCK.basalt);
  }
  return lith;
}

function hash(a, b) { let x = Math.imul(a ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(b, 0xc2b2ae35); x ^= x >>> 13; x = Math.imul(x, 0x27d4eb2f); x ^= x >>> 16; return (x >>> 0) / 4294967296; }

// a fresh strike (exceptional.js; WORLDSIM.md 17) stamped where it hit: an impact winter's
// crater, a just-boiled world's basin (half the world across); its floor a melt sheet,
// glowing while it's young (the render: blackbody from the temperature, no lava bucket)
function stampFresh(G, h, H, body, scale) {
  if (!H || !H.fresh || !H.fresh.at) return null;
  const f = H.fresh, D = f.kind === 'impact-winter' ? f.D : 0.5 * body.radiusM / 1000;
  const imp = new Impacts(G, { rng: new Rng('fresh'), g: body.gravity, scale });
  const melt = new Float32Array(G.n);
  const R = D / 2 * 1000 * scale / G.R;
  imp.stamp(f.at, D, (c, dh) => { h[c] += dh; }, h);
  for (let c = 0; c < G.n; c++) {
    const cosA = G.dir[c * 3] * f.at[0] + G.dir[c * 3 + 1] * f.at[1] + G.dir[c * 3 + 2] * f.at[2];
    if (cosA > dm.cos(R * 0.6)) melt[c] = f.kind === 'impact-winter' ? 1 : Math.max(0.2, f.lavaFrac || 0);
  }
  return melt;
}

// the craters still to be seen after a resurfacing: the younger ones, and older ones on the
// highlands it didn't reach
function survivors(G, events, resurfaceAt, ...marks) {
  if (resurfaceAt == null) return events;
  return events.filter((e) => {
    if (e.t >= resurfaceAt * 1000) return true;
    const c = G.cellAt(e.at[0], e.at[1], e.at[2]);
    return !marks.some((m) => m && m[c] > 0.5);
  });
}

// the climate's inputs from the body and its star
function climateOpts(body, star, host) {
  const cl = body.terrain.climate, r = body.rotation;
  return {
    S: body.insolation * (1 - (body.eclipse || 0)), obliquity: r.obliquity,   // (a moon: less its time in its planet's shadow) ecc: body.orbitE || 0, perihelion: (body.orbit ? body.orbit.w : 0) - (r.tiltAzimuth || 0),
    // (a moon locked to its planet still sees its star rise and set: its day is its orbit)
    locked: !!cl.locked && body.kind !== 'moon', substellar: cl.substellar, rotH: r.locked ? (body.kind === 'moon' && host && body.orbit && body.orbit.aReal ? 2 * Math.PI * Math.sqrt(body.orbit.aReal ** 3 / (6.674e-11 * host.massEarth * 5.972e24)) / 3600 : 1e4) : Math.abs(r.periodRealH || 24), retro: !!r.retrograde, hadley: cl.hadley,
    pressure: body.atmosphere ? body.atmosphere.pressure : 0, Tmean: body.Tsurf, albedo: body.albedo, lapse: cl.lapse,
    yearDays: 365.25 * Math.sqrt(body.aAU * body.aAU * body.aAU / star.mass),
  };
}
// run it on heights from another grid (seaSrc: which source cells are sea, else below sea level)
function climateOn(Gc, Gsrc, hsrc, o, seaSrc, veg) {
  const hc = new Float64Array(Gc.n), d = [0, 0, 0], uv = { face: 0, u: 0, v: 0 };
  const sea = seaSrc ? new Uint8Array(Gc.n) : null;
  for (let c = 0; c < Gc.n; c++) {
    d[0] = Gc.dir[c * 3]; d[1] = Gc.dir[c * 3 + 1]; d[2] = Gc.dir[c * 3 + 2]; hc[c] = Gsrc.sample(hsrc, d, uv);
    if (sea) sea[c] = seaSrc[Gsrc.cellAt(d[0], d[1], d[2])];
  }
  const out = climate(Gc, { ...o, h: hc, sea, cover: veg ? veg.cover : null, forest: veg ? veg.forest : null });
  out.h = hc;
  return out;
}
// Life's realms through deep time (WORLDSIM.md 15b): lineages on the land, riding the
// plates. Each check finds the landmasses: land with none is colonised (a new lineage);
// landmasses that meet mix their realms (an interchange: the Americas'); a realm split
// across landmasses diverges, its smaller pieces becoming lineages of their own over
// ~20 Myr (Australia's). Kept per plate frame cell, so they move with the plates
class RealmTracker {
  constructor(G, rng) { this.G = G; this.rng = rng; this.next = 0; this.checks = 0; this.world = new Int32Array(G.n).fill(-1); this.interchanges = []; this.splits = 0; this._met = new Set(); }
  check(T, h, agoMyr) {
    const G = this.G, n = G.n, w = this.world;
    // where each realm is now: carried by the plates since the last check
    if (this.checks) for (let c = 0; c < n; c++) { const P = T.plates[T.owner[c]]; w[c] = P.realm ? P.realm[T.src[c]] : -1; }
    // the landmasses
    const comp = new Int32Array(n).fill(-1), comps = [];
    for (let c0 = 0; c0 < n; c0++) {
      if (comp[c0] >= 0 || h[c0] < 0) continue;
      const cells = [c0], q = [c0]; comp[c0] = comps.length;
      while (q.length) { const c = q.pop(); for (let e = G.nStart[c]; e < G.nStart[c + 1]; e++) { const o = G.nbr[e]; if (comp[o] < 0 && h[o] >= 0) { comp[o] = comps.length; q.push(o); cells.push(o); } } }
      comps.push(cells);
    }
    const homes = new Map();   // realm -> landmasses it's on (and how much)
    const minCells = Math.max(20, Math.round(n * 0.0005));   // (specks of island don't make lineages)
    comps.forEach((cells, i) => {
      if (cells.length < minCells) { for (const c of cells) w[c] = -1; return; }
      const count = new Map();
      for (const c of cells) if (w[c] >= 0) count.set(w[c], (count.get(w[c]) || 0) + 1);
      if (!count.size) { const id = this.next++; for (const c of cells) w[c] = id; count.set(id, cells.length); }
      else {
        // the land without a lineage takes the landmass's commonest (they spread over it)
        let top = -1, best = 0; for (const [id, k] of count) if (k > best) { best = k; top = id; }
        for (const c of cells) if (w[c] < 0) w[c] = top;
        // realms meeting: an interchange (each pair once)
        const big = [...count].filter(([, k]) => k > Math.max(minCells, 0.05 * cells.length)).map(([id]) => id).sort((a, b) => a - b);
        for (let a = 0; a < big.length; a++) for (let b = a + 1; b < big.length; b++) { const key = big[a] + ':' + big[b]; if (!this._met.has(key)) { this._met.add(key); this.interchanges.push({ agoMyr, realms: [big[a], big[b]] }); } }
      }
      for (const [id, k] of count) { if (!homes.has(id)) homes.set(id, []); homes.get(id).push([i, k]); }
    });
    // a realm on several landmasses: the smaller pieces diverge, a chance per check (~20 Myr)
    for (const [id, list] of homes) {
      if (list.length < 2) continue;
      list.sort((a, b) => b[1] - a[1]);
      for (let j = 1; j < list.length; j++) if (this.rng.next() < 0.5 && list[j][1] >= minCells) { const nid = this.next++; this.splits++; for (const c of comps[list[j][0]]) if (w[c] === id) w[c] = nid; }
    }
    // back into the plates' frames
    for (const P of T.plates) { if (!P.realm || P.realm.length !== n) P.realm = new Int32Array(n); P.realm.fill(-1); }
    for (let c = 0; c < n; c++) { const P = T.plates[T.owner[c]]; P.realm[T.src[c]] = w[c]; }
    this.checks++;
  }
  count() { const k = new Map(); for (const r of this.world) if (r >= 0) k.set(r, (k.get(r) || 0) + 1); const min = Math.max(20, Math.round(this.G.n * 0.0005)); return [...k.values()].filter((x) => x >= min).length; }
  onGrid(Gc) { const out = new Int32Array(Gc.n).fill(-1); for (let c = 0; c < Gc.n; c++) out[c] = this.world[this.G.cellAt(Gc.dir[c * 3], Gc.dir[c * 3 + 1], Gc.dir[c * 3 + 2])]; return out; }
}

// the life map on the climate grid; fine: { G, soil, E, h } to bring the fine epoch's soil,
// groundwater and river nutrients up to it (else soil 1 m and groundwater deep)
function lifeOn(Gc, clim, H, rng, fine, realmInit = null) {
  const n = Gc.n;
  const env = { land: new Uint8Array(n), T: clim.Tann, Tm: clim.Tm, P: clim.Pann, Pm: clim.Pm, pet: new Float64Array(n), soil: new Float64Array(n).fill(1), wtd: new Float64Array(n).fill(30), upwell: clim.upwell, coastNutr: new Float64Array(n) };
  for (let c = 0; c < n; c++) { env.land[c] = clim.sea[c] ? 0 : 1; env.pet[c] = petOf(clim.Tann[c], clim.Pann[c] / 1000); }
  if (fine) {
    const { G, soil, E, h } = fine, sum = new Float64Array(n), wsum = new Float64Array(n), cnt = new Float64Array(n), nut = new Float64Array(n);
    let nmax = 0;
    for (let c = 0; c < G.n; c++) {
      const q = Gc.cellAt(G.dir[c * 3], G.dir[c * 3 + 1], G.dir[c * 3 + 2]);
      if (h[c] >= 0) { sum[q] += soil.depth[c]; wsum[q] += soil.wtd[c]; cnt[q]++; }
      else if (E.qs) { nut[q] += E.qs[c]; }
    }
    for (let q = 0; q < n; q++) { if (cnt[q]) { env.soil[q] = sum[q] / cnt[q]; env.wtd[q] = wsum[q] / cnt[q]; } nmax = Math.max(nmax, nut[q]); }
    for (let q = 0; q < n; q++) env.coastNutr[q] = nmax > 0 ? Math.min(1, 10 * nut[q] / nmax) : 0;
  }
  env.realmInit = realmInit;
  const L = new LifeMap(Gc, H, rng).run(env, 20, 0.5);
  L.env = env;
  L.plantCover = new Float32Array(n);
  for (let c = 0; c < n; c++) L.plantCover[c] = env.land[c] ? L.cover[c] : 0;
  return L;
}

// potential evaporation (m/yr) from the yearly mean temperature (K) and rain (m/yr):
// ~0.7 m/yr in a mild wet climate, 2-3 in a hot desert (its dry air drinks more), little
// in the cold (where frozen ground sheds what falls: the tundra's countless lakes)
function petOf(T, P) {
  const t = Math.max(-30, Math.min(40, T - 273.15));
  return 0.3 * dm.exp(0.06 * t) * (1 + 0.8 * dm.smoothstep(0.8, 0.15, P) * dm.smoothstep(0, 15, t));
}
function summarizeKoppen(clim) {
  const t = {};
  let land = 0;
  for (const k of clim.koppen) { if (k === 'sea') continue; land++; const b = biomeOfKoppen(k); t[b] = (t[b] || 0) + 1; }
  return Object.entries(t).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${(v / land * 100).toFixed(0)}%`).join(', ');
}

// were there land plants this many Myr ago (the history's life)?
function plantsAt(H, agoMyr) {
  const L = H.life;
  if (!L || L.plants == null) return false;
  const t = H.age - agoMyr / 1000;
  return t >= L.plants && (L.extinct == null || t < L.extinct);
}
// plant cover from the rain: wetter, thicker (0..1)
function vegFrom(rain, rainK, out) {
  out = out && out.length === rain.length ? out : new Float32Array(rain.length);
  for (let c = 0; c < rain.length; c++) out[c] = Math.min(1, Math.max(0, rain[c] * rainK * 1.3 - 0.1));
  return out;
}

function latLonOf(d) { return { lat: Math.asin(Math.max(-1, Math.min(1, d[1]))) * 180 / Math.PI, lon: Math.atan2(d[2], d[0]) * 180 / Math.PI }; }

function hashJitter(c) { let x = Math.imul(c ^ 0x9e3779b9, 0x85ebca6b); x ^= x >>> 13; x = Math.imul(x, 0xc2b2ae35); x ^= x >>> 16; return (x >>> 0) / 4294967296; }
