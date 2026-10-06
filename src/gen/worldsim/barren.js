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
import { Impacts, craterFloor, worldCell, WORLD_CELLS, VEXAG } from './impacts.js';
import { RIDGE, ridgeWidth, ridgeAt } from '../craters.js';
import { smoothField, blur } from './tectonics.js';
import { Heap } from './erosion.js';

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
  // (smaller ones are the finer levels' (craters.js): the grid draws only what it draws round)
  const dMin = opts.dMin ?? craterFloor(worldCell(G.R, G.N), WORLD_CELLS) / 1000;
  // the crater record each place keeps: since when its ground has kept them (it was flooded
  // or resurfaced then), and the craters the bombardment left after each step (for the finer
  // levels' craters, crat: N(>= D) per m^2 is crat / D^2, D in m as drawn)
  const since = new Float32Array(n), cum = [0];
  // (the level each mare's lava reached: where it ends, the ground rose above it)
  const mareLv = new Float32Array(n).fill(NaN);
  const basalt = !(body.terrain && body.terrain.icy); // (icy worlds don't make dark lava seas)
  const volcEnd = opts.volcEnd ?? 0;
  const flood = []; // basins waiting for lava: { t, at, R (m, drawn), depth }
  let lastC = null;
  const apply = (c, dh) => { h[c] += dh; fresh[c] = 1; };
  const decay = dm.exp(-DT_MYR / WEATHER_MYR);
  const stats = { craters: 0, basins: 0, flooded: 0, biggest: 0 };
  let relaxN = 0;
  const prng = rng.fork('pipe');
  for (let t = 0; t < age; t += DT_MYR / 1000) {
    const made = imp.step(DT_MYR, dMin, apply, t * 1000, t, h);
    cum.push(cum[cum.length - 1] + imp.density(DT_MYR, t));
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
      floodBasin(G, h, mare, fresh, flood[i], since, t, mareLv);
      stats.flooded++;
      flood.splice(i, 1);
    }
    for (let c = 0; c < n; c++) fresh[c] *= decay;
    // (too hot for a lid: its heat piped out through volcanoes, the lava as fast as opts.pipe has it)
    if (opts.pipe) {
      const v = opts.pipe(t);
      if (v > 0) { pave(G, h, v * DT_MYR * imp.scale * VEXAG, mare, fresh, since, t, prng, Math.round(Math.min(40, 4 * v / 20)), 60 * imp.scale * VEXAG); stats.paved = (stats.paved || 0) + v * DT_MYR; }
    }
    // (an icy shell's warm base: its wide relief flows flat, every 250 Myr and at the end)
    if (opts.relax && (++relaxN % 50 === 0 || t + DT_MYR / 1000 >= age)) relaxShell(G, h, opts.relax);
    // a whole-world resurfacing (a Venus's overturn, or an icy shell renewing): the lows
    // flood, their craters gone; what came after is all that's cratered there
    if (opts.resurfaceAt != null && !stats.resurfaced && t >= opts.resurfaceAt) {
      const level = resurface(G, h, opts.resurfaceShare ?? 0.75, basalt ? mare : plains, fresh);
      // (only the lows flooded start their record again; but where the volcanoes repave the
      // world every few Myr (opts.paveAll: a tide-melted moon, Io) the heights' slopes shed as
      // fast as they're cratered: nothing anywhere keeps an old crater)
      for (let c = 0; c < n; c++) if (h[c] < level || opts.paveAll) since[c] = t;
      stats.resurfaced = true;
    }
  }
  const cracks = opts.crack ? crackShell(G, h, rng.fork('cracks'), opts.crack, opts.scale ?? 0.1, plains, since, age) : null;
  // (a heat pipe still running: its vents' fields of small shield volcanoes over the new plains,
  // as many as its lava now feeds (drawn by the finer levels, terrain.js _shieldsAt))
  const shieldFields = [];
  const vNow = opts.pipe ? opts.pipe(age) : 0;
  if (vNow > 0) {
    const frng = rng.fork('ventFields'), nf = Math.round(Math.min(120, 10 + vNow / 3));
    for (let k = 0, tries = 0; k < nf && tries < nf * 20; tries++) {
      const at = frng.unitVector(), c = G.cellAt(at[0], at[1], at[2]);
      if (mare[c] < 0.5) continue;
      shieldFields.push({ at, R: frng.range(25e3, 150e3) * imp.scale / G.R, n: Math.round(frng.range(20, 200)), k: frng.range(0.5, 1) });
      k++;
    }
  }
  const crat = new Float32Array(n), all = cum[cum.length - 1], dtG = DT_MYR / 1000;
  // (a flood at a step's time buries that step's craters too)
  for (let c = 0; c < n; c++) crat[c] = all - cum[since[c] > 0 ? Math.min(cum.length - 1, Math.round(since[c] / dtG) + 1) : 0];
  const folds = wrinkleRidges(G, rng.fork('wrinkles'), mare, imp.scale);
  return { h, fresh, mare, plains, impacts: imp, stats, crat, dMin, lineae: cracks ? cracks.arcs : null, chaos: cracks ? cracks.chaos : null, mareLv: stats.flooded ? mareLv : null, shieldFields, folds };
}

// lava plains settle and shrink as they cool and load the ground under them: wrinkle ridges
// (the Moon's maria, Mars' Hesperia, Mercury's plains), ~100-300 m high, a few km across, tens to
// hundreds long, wandering over the plains. As arcs (snapshot folds) the terrain's levels draw
// (craters.js stampFolds), as many as the plains are wide
export function wrinkleRidges(G, rng, marks, scale) {
  const n = G.n, d = G.dir, R = G.R;
  let m = 0;
  for (let c = 0; c < n; c++) if (marks[c] > 0.5) m++;
  if (m < 20) return null;
  // (one about every 150 x 150 km of plains, real: the Moon's maria, Mars' ridged plains)
  const areaKm2 = 4 * Math.PI * (R / scale / 1000) * (R / scale / 1000) * m / n;
  const nR = Math.round(Math.min(5000, areaKm2 / 22500));
  const out = [];
  for (let k = 0, tries = 0; k < nR && tries < nR * 20; tries++) {
    const at = rng.unitVector();
    if (marks[G.cellAt(at[0], at[1], at[2])] < 0.5) continue;
    const e0 = Math.abs(at[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
    let u0 = [at[1] * e0[2] - at[2] * e0[1], at[2] * e0[0] - at[0] * e0[2], at[0] * e0[1] - at[1] * e0[0]];
    const ul = dm.hypot(...u0); u0 = u0.map((x) => x / ul);
    const v0 = [at[1] * u0[2] - at[2] * u0[1], at[2] * u0[0] - at[0] * u0[2], at[0] * u0[1] - at[1] * u0[0]];
    const a = rng.range(0, Math.PI), hd = [u0[0] * dm.cos(a) + v0[0] * dm.sin(a), u0[1] * dm.cos(a) + v0[1] * dm.sin(a), u0[2] * dm.cos(a) + v0[2] * dm.sin(a)];
    let pole = [at[1] * hd[2] - at[2] * hd[1], at[2] * hd[0] - at[0] * hd[2], at[0] * hd[1] - at[1] * hd[0]];
    const pl = dm.hypot(...pole); pole = pole.map((x) => x / pl);
    const L = rng.range(60e3, 350e3) * scale / R, ca = dm.cos(-L / 2), sa = dm.sin(-L / 2);
    const u = [at[0] * ca + hd[0] * sa, at[1] * ca + hd[1] * sa, at[2] * ca + hd[2] * sa];
    const v = [pole[1] * u[2] - pole[2] * u[1], pole[2] * u[0] - pole[0] * u[2], pole[0] * u[1] - pole[1] * u[0]];
    out.push({ pole, u, v, start: 0, len: L, H: rng.range(100, 350) * scale * VEXAG, w: rng.range(4e3, 10e3) * scale, mid: at });
    k++;
  }
  return out.length ? out : null;
}

// a young world too hot for a rigid lid pipes its heat out through volcanoes (Io's way, and
// likely the early Earth's: Moore & Webb 2013). vol: this step's lava over the whole world (m as
// drawn): it floods the lows to the level that holds it (smooth dark plains embaying what stands
// above them, their crater record starting again), and pours from vents over the ground in
// lobes (each running downhill from where it wells up, thinning to its toe)
export function pave(G, h, vol, marks, fresh, since, t, rng, nVents, ventThick) {
  const n = G.n, s = Float64Array.from(h).sort();
  let pre = 0, L = s[0];
  for (let k = 0; k < n; k++) {
    pre += s[k];
    L = (vol * n / 0.88 + pre) / (k + 1);
    if (k === n - 1 || L <= s[k + 1]) break;
  }
  for (let c = 0; c < n; c++) if (h[c] < L) { h[c] = L - (L - h[c]) * 0.12; marks[c] = 1; if (fresh) fresh[c] = 0; if (since) since[c] = t; }
  const heap = pave._heap && pave._heap.cap >= n ? pave._heap : (pave._heap = new Heap(n));
  heap.cap = n;
  for (let v = 0; v < nVents; v++) {
    let c0 = G.cellAt(...rng.unitVector());
    const cells = Math.round(4 + 60 * rng.next() * rng.next()), thick = ventThick * rng.range(0.4, 1.6), done = new Set([c0]);
    heap.size = 0; heap.push(h[c0], c0);
    for (let k = 0; k < cells && heap.size; k++) {
      const c = heap.pop();
      h[c] += thick * (1 - 0.6 * k / cells); marks[c] = 1; if (since) since[c] = t;
      for (let e = G.nStart[c]; e < G.nStart[c + 1]; e++) { const o = G.nbr[e]; if (!done.has(o)) { done.add(o); heap.push(h[o], o); } }
    }
  }
  return L;
}

// an icy shell's relaxation (world.js shellRelax): the relief wider than about twice its cold
// lid flows down nearly flat (keeps a share: a palimpsest's faint relief)
export function relaxShell(G, h, relax) {
  if (!relax) return;
  const L = Float64Array.from(h);
  blur(G, L, relax.passes);
  let m = 0;
  for (let c = 0; c < G.n; c++) m += L[c];
  m /= G.n;
  for (let c = 0; c < G.n; c++) h[c] -= (1 - relax.keep) * (L[c] - m);
}

// lava fills a basin's floor up to about half its depth: flat dark plains
function floodBasin(G, h, mare, fresh, B, since, t, mareLv) {
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
  for (const c of cells) if (h[c] < level) { h[c] = level; mare[c] = 1; fresh[c] = 0; if (since) since[c] = t; if (mareLv) mareLv[c] = level; }
}

// a resurfacing: everything below the share's height floods (lava, or slush on an icy
// world) to a near-level plain, keeping a little of the old slope; marks the plains
export function resurface(G, h, share, marks, fresh) {
  const sorted = Float64Array.from(h).sort();
  const level = sorted[Math.min(G.n - 1, Math.floor(G.n * share))];
  for (let c = 0; c < G.n; c++) if (h[c] < level) { h[c] = level - (level - h[c]) * 0.12; marks[c] = 1; if (fresh) fresh[c] = 0; }
  return level;
}

// an icy shell's cracking under the tides (Europa's lineae, Enceladus' stripes): double ridges
// along great-circle arcs, and chaos where the shell broke into rafts over a warm spot. tidal:
// 0..1. The arcs are kept (the snapshot's lineae): each finer level draws its ridges as wide as
// they really are, or as its cells can hold (craters.js stampRidges); the grid here, smoothly,
// two of its cells wide
export function crackShell(G, h, rng, tidal, scale, marks, since, age) {
  const nCracks = Math.round(20 + 120 * tidal), nChaos = Math.round(3 + 10 * tidal);
  const ridgeH = RIDGE.H * scale * VEXAG, w = ridgeWidth(RIDGE.w * scale, worldCell(G.R, G.N)), arcs = [];
  for (let k = 0; k < nCracks; k++) {
    // an arc: a pole (the great circle's axis) and a stretch of it
    const pole = rng.unitVector(), len = rng.range(0.3, 2.0), start = rng.range(0, 6.283);
    const a0 = Math.abs(pole[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
    let u = [pole[1] * a0[2] - pole[2] * a0[1], pole[2] * a0[0] - pole[0] * a0[2], pole[0] * a0[1] - pole[1] * a0[0]];
    const ul = Math.sqrt(u[0] * u[0] + u[1] * u[1] + u[2] * u[2]); u = u.map((x) => x / ul);
    const v = [pole[1] * u[2] - pole[2] * u[1], pole[2] * u[0] - pole[0] * u[2], pole[0] * u[1] - pole[1] * u[0]];
    const arc = { pole, u, v, start, len, H: ridgeH };
    arcs.push(arc);
    // (the cells along it, and two rings round them)
    const cells = new Set(), steps = Math.ceil(len * G.R / G.spacing);
    for (let i = 0; i <= steps; i++) {
      const th = start + len * i / steps, cs = dm.cos(th), sn = dm.sin(th);
      let ring = [G.cellAt(u[0] * cs + v[0] * sn, u[1] * cs + v[1] * sn, u[2] * cs + v[2] * sn)];
      for (let r = 0; r < 3; r++) {
        const next = [];
        for (const c of ring) { if (cells.has(c)) continue; cells.add(c); for (let e = G.nStart[c]; e < G.nStart[c + 1]; e++) next.push(G.nbr[e]); }
        ring = next;
      }
    }
    for (const c of cells) h[c] += ridgeAt(arc, G.dir[c * 3], G.dir[c * 3 + 1], G.dir[c * 3 + 2], G.R, w);
  }
  const chaos = [];
  for (let k = 0; k < nChaos; k++) {
    const at = rng.unitVector(), R = rng.range(40e3, 150e3) * scale / G.R;
    chaos.push({ at, R, H: ridgeH });
    for (let c = 0; c < G.n; c++) {
      const cosA = G.dir[c * 3] * at[0] + G.dir[c * 3 + 1] * at[1] + G.dir[c * 3 + 2] * at[2];
      if (cosA < dm.cos(1.15 * R)) continue;
      // (the shell broke and refroze: a low, level matrix, its edge eased over a cell or two;
      // the rafts in it are the finer levels')
      const k2 = 1 - dm.smoothstep(0.85, 1.15, dm.acos(Math.min(1, cosA)) / R);
      h[c] += k2 * (h[c] * 0.3 - ridgeH - h[c]);
      if (k2 > 0.5) { marks[c] = 1; if (since) since[c] = age; }
    }
  }
  return { arcs, chaos };
}
