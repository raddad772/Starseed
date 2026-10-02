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
import { TerrainGenerator, S_LEN, S_H, S_MOIST, S_TEMP } from '../terrain.js';
import { SimGrid } from './grid.js';
import { Erosion } from './erosion.js';
import { Tectonics, blur } from './tectonics.js';
import { Impacts } from './impacts.js';
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

// which process path the history calls for
export function choosePath(body) {
  const H = body.history;
  if (!H) return 'barren';
  if (H.regime === 'mobile' && body.hydrosphere && body.hydrosphere.water === 'liquid') return 'plates';
  if (H.regime === 'stagnant' && (wetWindow(H) || (body.atmosphere && body.atmosphere.pressure > 0.05))) return 'stagnant';
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

  if (path === 'barren') {
    const W = barrenWorld(G, { rng: rng.fork('barren'), body, age, scale, volcEnd: 1 + 15 * dm.pow(body.massEarth, 0.6), rate, spike });
    return Object.assign(out, { h: W.h, mare: W.mare, fresh: W.fresh, stats: W.stats, craters: W.impacts.events });
  }
  if (path === 'stagnant') {
    const wet = wetWindow(H);
    const oceanAt = wet ? Math.max(...Array.from(H.series.oceans)) : 0;
    const seaFrac = wet ? Math.min(0.4, Math.max(0, (Math.log10(Math.max(oceanAt * 2.3e-4, 1e-9)) + 5.5) / 3.2) * 0.45) : 0;
    const S = stagnantWorld(G, { rng: rng.fork('stagnant'), body, age, scale, wet, seaFrac, tier: H.tier, volcEnd: 1 + 15 * dm.pow(body.massEarth, 0.6), rate, spike });
    const volcanoes = S.shields.map((v) => ({ ...latLonOf(v.at), heightM: v.H }));
    return Object.assign(out, { h: S.h, volc: S.volc, river: S.river, stats: S.stats, wet, seaFrac, craters: S.impacts.events, volcanoes });
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
  for (let k = 0; k < myr / tdt; k++) {
    Et.rainK = H.at(myr - k * tdt, 'rain') || 0.05; // the climate then, vs now
    Et.bare = !plantsAt(H, myr - k * tdt);           // no land plants yet: nothing holds the soil
    Et.veg = Et.bare ? null : vegFrom(rainT, Et.rainK, Et.veg);
    T.stepEroded(tdt, Et);
    if (opts.onPlateStep) opts.onPlateStep(T, ht, k * tdt);
  }
  T.heights(ht, ut);
  // the climate on the plates' surface: the fine epoch's rain and snow come from it
  const Gc = new SimGrid(opts.Nc ?? 40, body.R);
  const climOpts = climateOpts(body, star);
  let clim = climateOn(Gc, Gt, ht, climOpts);
  // life on the map (life.js), and the climate again with its plant cover (forests darken
  // the land, plants hand rain on inland): the cover then holds the fine epoch's soil
  let life0 = lifeOn(Gc, clim, H, rng.fork('life0'), null);
  clim = climateOn(Gc, Gt, ht, climOpts, null, life0);
  life0 = lifeOn(Gc, clim, H, rng.fork('life0'), null);
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
  // (the fine grid's cells on the plates' grid, for the isostasy's regional averaging)
  const fineToT = new Int32Array(G.n), fineReg = new Float64Array(Gt.n), coarseN = new Uint32Array(Gt.n), isoDh = new Float64Array(G.n);
  const lifted = new Float64Array(G.n);   // the uplift (and isostatic rise) each cell got: the rest of its change was wear or fill
  for (let c = 0; c < G.n; c++) fineToT[c] = Gt.cellAt(G.dir[c * 3], G.dir[c * 3 + 1], G.dir[c * 3 + 2]);
  let totalArea = 0, wetArea = 0;
  for (let c = 0; c < G.n; c++) { totalArea += G.area[c]; if (h[c] < 0) wetArea += G.area[c]; }
  const oceanShare = wetArea / totalArea;
  for (let k = 0; k < steps; k++) {
    Ef.step(dt / 1e6, 6 * G.spacing / 1000, (c, dh) => { h[c] += h[c] < 0 ? dh * 0.5 : dh; if (dh < 0) lith.erode(c, -dh); else lith.deposit(c, dh, ROCK.regolith); }, k * dt / 1e6);
    E.rainK = H.at((steps - k) * dt / 1e6, 'rain') || 0.05;
    E.petK = dm.exp(0.06 * ((H.at((steps - k) * dt / 1e6, 'T') ?? H.T) - H.T)); // (warmer then: more evaporation)
    E.bare = !plantsAt(H, (steps - k) * dt / 1e6);
    E.veg = E.bare ? null : plantCover;   // (life.js: the plants' cover holds the slopes)
    lith.kField(KF, E.K);                 // each place wears as its exposed rock does
    // (crust can't hold mountains past ~9 km on an Earth: uplift fades out near the limit)
    for (let c = 0; c < G.n; c++) E.U[c] = U[c] * Math.max(0, Math.min(1, (hMax - h[c]) / (0.15 * hMax)));
    hb.set(h);
    E.step(dt);
    // the ice, where it's cold enough then (the history's climate vs today's)
    const ago = (steps - k) * dt / 1e6;
    const dTnow = (H.at(ago, 'T') ?? H.T) - H.T;
    iceMax = Math.max(iceMax, ice.step(h, E, snow, dt, dTnow));
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
  const life = lifeOn(Gc, clim, H, rng.fork('life'), { G, soil, E, h });
  {
    const S = life.summary(life.env);
    log(`life: land ${(S.landCover * 100).toFixed(0)}% covered (forest ${(S.forest * 100).toFixed(0)}%, open ${(S.open * 100).toFixed(0)}%), sea life ${(S.seaLife * 100).toFixed(0)}%, ${S.realms} realms`);
  }
  out.life = life;
  return Object.assign(out, { h, h0, E, Gt, ht, tect: T, impacts: Ef, craters: T.impacts.events.concat(Ef.events), volcanoes, lith, rock, glaciers: ice, veg: E.veg, coasts: sea2, dunes, mesas, soil });
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
  for (let c = 0; c < G.n; c++) {
    d[0] = G.dir[c * 3]; d[1] = G.dir[c * 3 + 1]; d[2] = G.dir[c * 3 + 2];
    lith.base[c] = Gt.sample(contW, d, uv) > 0.5 ? ROCK.granite : ROCK.basalt;
    let sed = Gt.sample(sedW, d, uv), carb = Math.min(Gt.sample(carbW, d, uv), sed);
    // oldest first: each bed's thickness waves gently across the world
    for (let i = 0; i < beds.length && sed > 1; i++) {
      const B = beds[i];
      const bed = Math.min(sed, B.base + B.amp * Math.sin((d[0] * B.v[0] + d[1] * B.v[1] + d[2] * B.v[2]) * B.k + B.ph));
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

// the climate's inputs from the body and its star
function climateOpts(body, star) {
  const cl = body.terrain.climate, r = body.rotation;
  return {
    S: body.insolation, obliquity: r.obliquity, ecc: body.orbitE || 0, perihelion: (body.orbit ? body.orbit.w : 0) - (r.tiltAzimuth || 0),
    locked: !!cl.locked, substellar: cl.substellar, rotH: r.locked ? 1e4 : Math.abs(r.periodRealH || 24), retro: !!r.retrograde, hadley: cl.hadley,
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
// the life map on the climate grid; fine: { G, soil, E, h } to bring the fine epoch's soil,
// groundwater and river nutrients up to it (else soil 1 m and groundwater deep)
function lifeOn(Gc, clim, H, rng, fine) {
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
