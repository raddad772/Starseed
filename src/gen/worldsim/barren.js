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
  const h = new Float64Array(n), fresh = new Float32Array(n), mare = new Float32Array(n);
  const lump = new Float64Array(n);
  for (let c = 0; c < n; c++) lump[c] = (hashInts(c, rng.u32()) >>> 0) / 4294967296;
  smoothField(G, lump, Math.round(G.N / 5));
  const lop = rng.next() < 0.5 ? rng.unitVector() : null, lopAmp = rng.range(1000, 3500);
  for (let c = 0; c < n; c++) {
    h[c] = (lump[c] - 0.5) * 2500;
    if (lop) h[c] += lopAmp * (G.dir[c * 3] * lop[0] + G.dir[c * 3 + 1] * lop[1] + G.dir[c * 3 + 2] * lop[2]);
  }
  const imp = new Impacts(G, { rng: rng.fork('impacts'), g: body.gravity, pressure: body.atmosphere ? body.atmosphere.pressure : 0, rate: opts.rate ?? 1, scale: opts.scale });
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
  }
  return { h, fresh, mare, impacts: imp, stats };
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
