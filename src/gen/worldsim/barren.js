// Airless and barren worlds over their whole age (moons, Mercury-likes, small
// worlds, cold or scorched planets outside the habitable zone): nothing flows
// on them, so impacts write the story.
//
//   bombardment   craters from formation on (impacts.js: the heavy early flux
//                 fading to today's steady rain); each new one overprints the
//                 old, so old terrain saturates and young terrain stays sparse
//   maria         while the interior is still hot, lava rises into the big
//                 basins a few hundred Myr after they form: dark, flat plains
//   freshness     new craters and their ejecta are bright; the solar wind and
//                 micrometeorites darken them over ~0.3-1 Gyr (space weathering)
//   (to come: global contraction scarps as the interior cools, Mercury-style;
//    volcanic shields on bigger bodies)
//
// Heights in metres on a SimGrid (game scale, real heights, as impacts.js).

import * as dm from '../../core/dmath.js';
import { hashInts } from '../../core/rng.js';
import { Impacts } from './impacts.js';
import { smoothField } from './tectonics.js';

const DT_MYR = 5;
const WEATHER_MYR = 450;     // space weathering darkens fresh material
const MARE_MIN_KM = 280;     // basins this big (real) can flood (scaled down on small, hot bodies)

// opts: { rng, body, age (Gyr), scale, dMin (game km), volcEnd (Gyr since formation), rate }
export function barrenWorld(G, opts) {
  const rng = opts.rng, n = G.n, body = opts.body;
  const age = opts.age;
  // a primordial crust: broad, gentle swells (and sometimes a lopsided
  // hemisphere: the near and far sides of a moon)
  const h = new Float64Array(n), fresh = new Float32Array(n), mare = new Float32Array(n), plains = new Float32Array(n);
  const lump = new Float64Array(n);
  for (let c = 0; c < n; c++) lump[c] = (hashInts(c, rng.u32()) >>> 0) / 4294967296;
  smoothField(G, lump, Math.round(G.N / 5));
  const lop = rng.next() < 0.5 ? rng.unitVector() : null, lopAmp = rng.range(1000, 3500);
  for (let c = 0; c < n; c++) {
    h[c] = (lump[c] - 0.5) * 2500;
    if (lop) h[c] += lopAmp * (G.dir[c * 3] * lop[0] + G.dir[c * 3 + 1] * lop[1] + G.dir[c * 3 + 2] * lop[2]);
  }
  const imp = new Impacts(G, { rng: rng.fork('impacts'), g: body.gravity, pressure: body.atmosphere ? body.atmosphere.pressure : 0, rate: opts.rate ?? 1, scale: opts.scale, spike: opts.spike });
  const dMin = opts.dMin ?? 6 * G.spacing / 1000; // (smaller ones are the local detail's)
  const basalt = !(body.terrain && body.terrain.icy); // (icy worlds don't make dark lava seas)
  const volcEnd = opts.volcEnd ?? 0;
  const flood = []; // basins waiting for lava: { t, at, R (m, drawn), depth }
  let lastC = null;
  const apply = (c, dh) => { h[c] += dh; fresh[c] = 1; };
  const decay = dm.exp(-DT_MYR / WEATHER_MYR);
  const stats = { craters: 0, basins: 0, flooded: 0, biggest: 0 };
  for (let t = 0; t < age; t += DT_MYR / 1000) {
    const made = imp.step(DT_MYR, dMin, apply, t * 1000, t);
    for (const e of made) {
      stats.craters++;
      stats.biggest = Math.max(stats.biggest, e.D);
      // a big basin in the volcanic age floods later
      const mareMin = MARE_MIN_KM * Math.min(1, dm.pow(body.radiusM / 1.74e6, 0.5));
      if (e.D >= mareMin) {
        stats.basins++;
        const tf = t + rng.range(0.1, 0.8);
        // lava reaches the surface where the crust is thin: the low side, mostly (the Moon's near side)
        const low = lop ? -(e.at[0] * lop[0] + e.at[1] * lop[1] + e.at[2] * lop[2]) : 0;
        const pFlood = lop ? dm.clamp(0.1 + 0.7 * low, 0.03, 0.8) : 0.3;
        if (basalt && tf < volcEnd && rng.next() < pFlood) flood.push({ t: tf, at: e.at, R: e.D / 2 * 1000 * imp.scale, depth: 170 * dm.pow(e.D, 0.43) * dm.pow(9.81 / body.gravity, 0.6) * imp.scale * 2.5 });
      }
    }
    for (let i = flood.length - 1; i >= 0; i--) {
      if (flood[i].t > t) continue;
      floodBasin(G, h, mare, fresh, flood[i]);
      stats.flooded++;
      flood.splice(i, 1);
    }
    for (let c = 0; c < n; c++) fresh[c] *= decay;
    // a whole-world resurfacing (a Venus's overturn, or an icy shell renewing): the lows
    // flood, their craters gone; what came after is all that's cratered there
    if (opts.resurfaceAt != null && !stats.resurfaced && t >= opts.resurfaceAt) { resurface(G, h, opts.resurfaceShare ?? 0.75, basalt ? mare : plains, fresh); stats.resurfaced = true; }
  }
  if (opts.crack) crackShell(G, h, rng.fork('cracks'), opts.crack, opts.scale ?? 0.1, plains);
  return { h, fresh, mare, plains, impacts: imp, stats };
}

// lava fills a basin's floor up to about half its depth: flat dark plains
function floodBasin(G, h, mare, fresh, B) {
  const reach = 0.95 * B.R / G.R;
  const c0 = G.cellAt(B.at[0], B.at[1], B.at[2]);
  const cells = [];
  const seen = new Set([c0]), q = [c0];
  let lo = Infinity;
  for (let i = 0; i < q.length; i++) {
    const c = q[i];
    const a = dm.acos(Math.min(1, G.dir[c * 3] * B.at[0] + G.dir[c * 3 + 1] * B.at[1] + G.dir[c * 3 + 2] * B.at[2]));
    if (a > reach && c !== c0) continue;
    cells.push(c); lo = Math.min(lo, h[c]);
    for (let e = G.nStart[c]; e < G.nStart[c + 1]; e++) { const o = G.nbr[e]; if (!seen.has(o)) { seen.add(o); q.push(o); } }
  }
  const level = lo + B.depth * 0.55;
  for (const c of cells) if (h[c] < level) { h[c] = level; mare[c] = 1; fresh[c] = 0; }
}

// a resurfacing: everything below the share's height floods (lava, or slush on an icy
// world) to a near-level plain, keeping a little of the old slope; marks the plains
export function resurface(G, h, share, marks, fresh) {
  const sorted = Float64Array.from(h).sort();
  const level = sorted[Math.min(G.n - 1, Math.floor(G.n * share))];
  for (let c = 0; c < G.n; c++) if (h[c] < level) { h[c] = level - (level - h[c]) * 0.12; marks[c] = 1; if (fresh) fresh[c] = 0; }
  return level;
}

// an icy shell's cracking under the tides (Europa's lineae, Enceladus' stripes): ridges
// along great-circle arcs (paired ridges a few hundred metres high, drawn at the game's
// scale), and chaos where the shell broke into rafts over a warm spot. tidal: 0..1
export function crackShell(G, h, rng, tidal, scale, marks) {
  const nCracks = Math.round(20 + 120 * tidal), nChaos = Math.round(3 + 10 * tidal);
  const ridgeH = 300 * scale * 2.5, width = 2.5 * G.spacing;
  for (let k = 0; k < nCracks; k++) {
    // an arc: a pole (the great circle's axis) and a stretch of it
    const pole = rng.unitVector(), len = rng.range(0.3, 2.0), start = rng.range(0, 6.283);
    const a0 = Math.abs(pole[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
    let u = [pole[1] * a0[2] - pole[2] * a0[1], pole[2] * a0[0] - pole[0] * a0[2], pole[0] * a0[1] - pole[1] * a0[0]];
    const ul = Math.hypot(u[0], u[1], u[2]); u = u.map((x) => x / ul);
    const v = [pole[1] * u[2] - pole[2] * u[1], pole[2] * u[0] - pole[0] * u[2], pole[0] * u[1] - pole[1] * u[0]];
    const steps = Math.ceil(len * G.R / G.spacing);
    for (let i = 0; i <= steps; i++) {
      const th = start + len * i / steps, cs = dm.cos(th), sn = dm.sin(th);
      const p = [u[0] * cs + v[0] * sn, u[1] * cs + v[1] * sn, u[2] * cs + v[2] * sn];
      const c = G.cellAt(p[0], p[1], p[2]);
      h[c] += ridgeH;
      for (let e = G.nStart[c]; e < G.nStart[c + 1]; e++) h[G.nbr[e]] += ridgeH * 0.35;
    }
  }
  for (let k = 0; k < nChaos; k++) {
    const at = rng.unitVector(), R = rng.range(40e3, 150e3) * scale / G.R;
    for (let c = 0; c < G.n; c++) {
      const cosA = G.dir[c * 3] * at[0] + G.dir[c * 3 + 1] * at[1] + G.dir[c * 3 + 2] * at[2];
      if (cosA < dm.cos(R)) continue;
      h[c] = h[c] * 0.3 - ridgeH * (0.5 + rng.next()); marks[c] = 1;   // (rafts tilted in refrozen slush)
    }
  }
}
