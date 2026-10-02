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

import { Rng } from '../../core/rng.js';
import { TerrainGenerator, S_LEN, S_H, S_MOIST, S_TEMP } from '../terrain.js';
import { SimGrid } from './grid.js';
import { Erosion } from './erosion.js';
import { Tectonics } from './tectonics.js';
import { Impacts } from './impacts.js';
import { barrenWorld } from './barren.js';
import { stagnantWorld } from './stagnant.js';
import { Lithology, R as ROCK, marineRock } from './lithology.js';
import { Glaciers } from './glaciers.js';
import { Coasts } from './coasts.js';
import { climate, biomeOfKoppen } from './climate.js';

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
    const W = barrenWorld(G, { rng: rng.fork('barren'), body, age, scale, volcEnd: 1 + 15 * Math.pow(body.massEarth, 0.6), rate, spike });
    return Object.assign(out, { h: W.h, mare: W.mare, fresh: W.fresh, stats: W.stats, craters: W.impacts.events });
  }
  if (path === 'stagnant') {
    const wet = wetWindow(H);
    const oceanAt = wet ? Math.max(...Array.from(H.series.oceans)) : 0;
    const seaFrac = wet ? Math.min(0.4, Math.max(0, (Math.log10(Math.max(oceanAt * 2.3e-4, 1e-9)) + 5.5) / 3.2) * 0.45) : 0;
    const S = stagnantWorld(G, { rng: rng.fork('stagnant'), body, age, scale, wet, seaFrac, tier: H.tier, volcEnd: 1 + 15 * Math.pow(body.massEarth, 0.6), rate, spike });
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
  const Et = new Erosion(Gt, ht, { sea, K: 3e-6, rain: rainT, m: 0.45, kd: 1 });
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
  log(`climate: ${summarizeKoppen(clim)}`);
  log(`plates: ${myr} Myr, ${T.plates.filter((q) => !q.dead).length} plates, ${T.hot.length} hotspots (${T.activity.name}), ${(T.events || []).length} rifts/welds, ${T.impacts.events.length} impacts`);
  // the finer epoch: the plates' surface and uplift, rivers cutting it finer
  const h = new Float64Array(G.n), U = new Float64Array(G.n), rain = new Float64Array(G.n);
  const d = [0, 0, 0];
  for (let c = 0; c < G.n; c++) {
    d[0] = G.dir[c * 3]; d[1] = G.dir[c * 3 + 1]; d[2] = G.dir[c * 3 + 2];
    h[c] = Gt.sample(ht, d); U[c] = Gt.sample(ut, d);
    rain[c] = Math.max(0.03, Gc.sample(clim.Pann, d) / 1000); // (rain in m/yr, from the climate)
    if (h[c] > 0) h[c] += (hashJitter(c) - 0.5) * 5;
  }
  const h0 = Float64Array.from(h);
  // the rock: each place's layers, from what the plates carried there
  const lith = buildRock(G, Gt, T, rng.fork('rock'));
  const E = new Erosion(G, h, { sea, K: 1e-5, rain, m: 0.45, kd: 1 });
  E.U.set(U);
  const Ef = new Impacts(G, { rng: rng.fork('impacts-fine'), g: body.gravity, pressure, rate, scale });
  const steps = opts.steps ?? 60, dt = opts.dt ?? 2.5e5;
  const hb = new Float64Array(G.n);
  const ice = new Glaciers(G, p.climate, scale);
  const sea2 = new Coasts(G, { corals: H.life && H.life.complex != null && H.life.extinct == null, warm: 0.5 });
  const hMax = 9000 * Math.sqrt(9.81 / body.gravity);
  let iceMax = 0;
  for (let k = 0; k < steps; k++) {
    Ef.step(dt / 1e6, 6 * G.spacing / 1000, (c, dh) => { h[c] += h[c] < 0 ? dh * 0.5 : dh; if (dh < 0) lith.erode(c, -dh); else lith.deposit(c, dh, ROCK.regolith); }, k * dt / 1e6);
    E.rainK = H.at((steps - k) * dt / 1e6, 'rain') || 0.05;
    E.bare = !plantsAt(H, (steps - k) * dt / 1e6);
    E.veg = E.bare ? null : vegFrom(rain, E.rainK, E.veg);
    lith.kField(1e-5, E.K);               // each place wears as its exposed rock does
    // (crust can't hold mountains past ~9 km on an Earth: uplift fades out near the limit)
    for (let c = 0; c < G.n; c++) E.U[c] = U[c] * Math.max(0, Math.min(1, (hMax - h[c]) / (0.15 * hMax)));
    hb.set(h);
    E.step(dt);
    // the ice, where it's cold enough then (the history's climate vs today's)
    const ago = (steps - k) * dt / 1e6;
    iceMax = Math.max(iceMax, ice.step(h, E, rain, dt, (H.at(ago, 'T') ?? H.T) - H.T));
    // the sea's edge: waves, sand, reefs (warm seas reach further from the equator in a warm climate)
    sea2.step(h, lith, E, dt, 1 + ((H.at(ago, 'T') ?? H.T) - 288) / 40);
    // what was cut comes off the layers; what settled goes on as new rock
    for (let c = 0; c < G.n; c++) {
      const dz = h[c] - (hb[c] + E.U[c] * dt);
      if (dz < -0.01) lith.erode(c, -dz);
      else if (dz > 0.01) {
        if (h[c] >= 0) lith.deposit(c, dz, ROCK.alluvium);
        else lith.deposit(c, dz, marineRock(-h[c], Math.abs(G.dir[c * 3 + 1]) < 0.55, H.lifeEver, dz > 5));
      }
    }
  }
  E.findBase(); E.route(); E.drain();
  const volcanoes = T.hot.map((v) => ({ ...latLonOf(v.at), hotspot: true }));
  log(`ice: up to ${iceMax} cells covered; ${ice.everIce.reduce((a, b) => a + b, 0)} cells ever glaciated`);
  // how rivers run now: meandering where plants hold the banks, braided on bare ground
  out.riverStyle = plantsAt(H, 0) ? 'meandering' : 'braided';
  // the climate now, on the finished surface: biomes for the game
  clim = climateOn(Gc, G, h, climOpts);
  log(`climate now: ${summarizeKoppen(clim)}`);
  out.climate = clim; out.Gc = Gc;
  // the beaches' sand shows as the surface rock there
  const rock = lith.exposed();
  for (let c = 0; c < G.n; c++) if (sea2.beach[c] > 2 && h[c] >= 0) rock[c] = sea2.sand[c];
  return Object.assign(out, { h, h0, E, Gt, ht, tect: T, impacts: Ef, craters: T.impacts.events.concat(Ef.events), volcanoes, lith, rock, glaciers: ice, veg: E.veg, coasts: sea2 });
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
// run it on heights from another grid
function climateOn(Gc, Gsrc, hsrc, o) {
  const hc = new Float64Array(Gc.n), d = [0, 0, 0], uv = { face: 0, u: 0, v: 0 };
  for (let c = 0; c < Gc.n; c++) { d[0] = Gc.dir[c * 3]; d[1] = Gc.dir[c * 3 + 1]; d[2] = Gc.dir[c * 3 + 2]; hc[c] = Gsrc.sample(hsrc, d, uv); }
  return climate(Gc, { ...o, h: hc });
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
