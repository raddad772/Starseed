// Stagnant-lid worlds: one rigid shell, no moving plates (Mars; also worlds
// whose plates stopped). With nothing carrying the crust away, a mantle plume
// stays under the same spot for Gyr: volcanoes grow into giants (taller on
// weaker gravity: Olympus Mons) on a broad volcanic rise, and the strain of
// that load can split a great rift canyon off it. The two hemispheres often
// differ (a dichotomy: low northern plains, old southern highlands).
// Impacts follow the lunar chronology (impacts.js). While the history says
// there was water, rain cuts valley networks (erosion.js) and a sea can fill
// the lowlands; then the world dries and they're left as relics.
//
// Heights in metres on a SimGrid; constructed landforms (volcanoes, craters,
// the canyon) are drawn scaled whole with a little vertical exaggeration (as
// impacts.js does).

import * as dm from '../../core/dmath.js';
import { hashInts } from '../../core/rng.js';
import { Impacts, craterFloor, worldCell, WORLD_CELLS } from './impacts.js';
import { resurface } from './barren.js';
import { Erosion, Heap } from './erosion.js';
import { smoothField } from './tectonics.js';

const DT_MYR = 10;
const VEXAG = 2.5;

// opts: { rng, body, age (Gyr), scale (game/real), wet: [t0, t1] Gyr since formation or null,
//         seaFrac: ocean fraction in the wet era, tier: volcanic activity 0..3, volcEnd (Gyr) }
export function stagnantWorld(G, opts) {
  const { rng, body } = opts, n = G.n, d = G.dir;
  const scale = opts.scale, age = opts.age;
  const g = body.gravity;
  const dot = (c, v) => d[c * 3] * v[0] + d[c * 3 + 1] * v[1] + d[c * 3 + 2] * v[2];
  const h = new Float64Array(n), volc = new Float32Array(n), river = new Float32Array(n);
  // ---- the primordial crust: broad swells, and often a dichotomy
  const lump = new Float64Array(n), wob = new Float64Array(n);
  for (let c = 0; c < n; c++) { lump[c] = (hashInts(c, rng.u32()) >>> 0) / 4294967296; wob[c] = (hashInts(c, rng.u32()) >>> 0) / 4294967296; }
  smoothField(G, lump, Math.round(G.N / 6)); smoothField(G, wob, Math.round(G.N / 10));
  const dich = rng.next() < 0.65 ? { pole: rng.unitVector(), drop: rng.range(2500, 6000) * scale * VEXAG * 2 } : null;
  for (let c = 0; c < n; c++) {
    h[c] = (lump[c] - 0.5) * 3000 * scale * VEXAG * 2;
    if (dich) h[c] -= dich.drop * dm.smoothstep(-0.15, 0.2, dot(c, dich.pole) + (wob[c] - 0.5) * 0.5);
  }
  // ---- the volcanic province and its giants
  const tier = opts.tier ?? 1;
  const volcEnd = opts.volcEnd ?? age;
  const nShield = [rng.range(0, 1.5), rng.range(1, 3.5), rng.range(3, 5.5), rng.range(5, 8.5)][tier] | 0;
  const rise = nShield > 0 ? { at: dich ? tilt(rng, dich.pole, rng.range(1.2, 1.9)) : rng.unitVector(), R: rng.range(0.25, 0.45), H: rng.range(4000, 9000) * scale * VEXAG * 1.5 } : null;
  const shields = [];
  for (let i = 0; i < nShield; i++) {
    const giant = i === 0;
    const at = rise && rng.next() < 0.75 ? tilt(rng, rise.at, rng.range(0, rise.R * 1.1)) : rng.unitVector();
    const Hreal = (giant ? 22000 : rng.range(5000, 14000)) * dm.clamp(3.7 / g, 0.35, 2.5); // m: taller on weak gravity
    const Rreal = (giant ? 300e3 : rng.range(80e3, 220e3)) * dm.clamp(3.7 / g, 0.6, 1.6);
    shields.push({ at, H: Hreal * scale * VEXAG, R: Rreal * scale, t0: rng.range(0.1, 0.6) * volcEnd, t1: volcEnd * rng.range(0.6, 1), cells: null });
  }
  const canyon = rise && rng.next() < 0.6 ? makeCanyon(rng, rise, scale) : null;
  // ---- the bombardment, the volcanoes, the wet era, through time
  const imp = new Impacts(G, { rng: rng.fork('impacts'), g, pressure: body.atmosphere ? body.atmosphere.pressure : 0, scale, rate: opts.rate ?? 1, spike: opts.spike });
  // (smaller ones are the finer levels' (craters.js): the grid draws only what it draws round)
  const dMin = craterFloor(worldCell(G.R, G.N), WORLD_CELLS) / 1000;
  // the crater record each place keeps (barren.js): since its ground last kept them (a wet era
  // wears away the small ones everywhere; lava and resurfacing bury them), and the craters
  // the bombardment left after each step
  const since = new Float32Array(n), cum = [0];
  const wet = opts.wet;
  let E = null, sl = 0;
  const hs = new Float64Array(n);
  const stats = { craters: 0, shields: nShield, wetSteps: 0, canyon: !!canyon, dichotomy: !!dich };
  // (the volcanism after an overturn: how many flows and coronae its time since makes)
  const vrng = rng.fork('afterOverturn'), heap = new Heap(n);
  // (and the fields of small shield volcanoes the same magma fed, round many of the flows'
  // vents and most coronae: drawn by the finer levels, shieldField)
  const srng = rng.fork('shieldFields'), shieldFields = [];
  const nFlows = Math.round(vrng.range(60, 160) * (1 + tier) / 2), nCoronae = Math.round(vrng.range(4, 14));
  // (a dichotomy's lowland is a basin: partway through the volcanic era lava and sediment fill
  // it to a flat floor that embays what stood up, and its crater record starts again (Mars'
  // northern plains, far younger and smoother than its southern highlands))
  const fillAt = dich ? rng.fork('lowlandFill').range(0.2, 0.35) * Math.min(age, volcEnd) : null;
  let filled = false;
  // a Titan's organic haze (opts.haze: m a Gyr, real, over the whole ground): what its methane
  // air's photochemistry makes falls out, and its rain and wind carry it into the lows, the
  // crater bowls and basins, filling each toward the ground round it (so a bowl fills ~10 times
  // as fast as the mean: Lorenz & Lunine 1996's few hundred metres over its age lie mostly
  // there). Where it's buried ~200 m deep the crater record starts again: Titan's surface keeps
  // few craters, and those shallow (Neish & Lorenz 2012: 0.2-1 Gyr old)
  const haze = opts.haze || 0, HAZE_EVERY = 5, B0 = 200 * scale * VEXAG;
  const bur = haze ? new Float32Array(n) : null, mean = haze ? new Float64Array(n) : null, mtmp = haze ? new Float64Array(n) : null;
  let step = 0;
  for (let t = 0; t < age; t += DT_MYR / 1000, step++) {
    stats.craters += imp.step(DT_MYR, dMin, (c, dh) => { h[c] += dh; }, t * 1000, t, h).length;
    cum.push(cum[cum.length - 1] + imp.density(DT_MYR, t));
    // the rise swells, the shields build, while the interior is hot
    if (rise && t < volcEnd * 0.7) {
      const k = DT_MYR / 1000 / (volcEnd * 0.7);
      for (let c = 0; c < n; c++) { const a = dm.acos(Math.min(1, dot(c, rise.at))); if (a < rise.R * 1.5) { const u = a / rise.R; h[c] += rise.H * k * dm.exp(-u * u * 1.5); } }
    }
    for (const S of shields) {
      if (t < S.t0 || t > S.t1) continue;
      if (!S.cells) S.cells = near(G, S.at, 1.6 * S.R / G.R);
      const k = DT_MYR / 1000 / (S.t1 - S.t0);
      for (let i = 0; i < S.cells.length; i += 2) {
        const c = S.cells[i], u = S.cells[i + 1] * G.R / S.R;
        if (u < 1.6) { h[c] += S.H * k * dm.pow(Math.max(0, 1 - u / 1.6), 1.6); volc[c] = 1; since[c] = t; }
      }
    }
    if (canyon && t > canyon.t && !canyon.done) { carveCanyon(G, h, canyon); canyon.done = true; }
    if (dich && !filled && t >= fillAt) {
      filled = true;
      const low = [];
      for (let c = 0; c < n; c++) if (dot(c, dich.pole) + (wob[c] - 0.5) * 0.5 > 0.12) low.push(c);
      if (low.length) {
        const hs2 = low.map((c) => h[c]).sort((a, b) => a - b), level = hs2[Math.floor(0.45 * (hs2.length - 1))];
        for (const c of low) if (h[c] < level) { h[c] = level - (level - h[c]) * 0.1; volc[c] = 1; since[c] = t; }
      }
      stats.lowlandFilled = Math.round(t * 1000);
    }
    if (opts.resurfaceAt != null && !stats.resurfaced && t >= opts.resurfaceAt) {
      const level = resurface(G, h, opts.resurfaceShare ?? 0.75, volc);
      // (only the plains it flooded start their crater record again; the highlands it left
      // standing keep theirs)
      for (let c = 0; c < n; c++) if (h[c] < level) since[c] = t;
      stats.resurfaced = true;
    }
    // after an overturn the interior stays hot: lava keeps welling up over the new plains (flow
    // fields from vents, ponding in the lows) and plumes push up coronae (Venus's)
    if (stats.resurfaced && t < age) {
      const span = Math.max(0.05, age - opts.resurfaceAt), kf = DT_MYR / 1000 / span;
      for (let k = poissonDraw(vrng, nFlows * kf); k > 0; k--) {
        const v = lavaFlow(G, h, volc, vrng, scale, heap, since, t); stats.flows = (stats.flows || 0) + 1;
        if (srng.next() < 0.35) shieldFields.push(shieldField(srng, [G.dir[v * 3], G.dir[v * 3 + 1], G.dir[v * 3 + 2]], G.R, scale, 0.6));
      }
      for (let k = poissonDraw(vrng, nCoronae * kf); k > 0; k--) {
        const at = corona(G, h, vrng, scale); stats.coronae = (stats.coronae || 0) + 1;
        if (srng.next() < 0.7) shieldFields.push(shieldField(srng, at, G.R, scale, 1));
      }
    }
    if (haze && step % HAZE_EVERY === HAZE_EVERY - 1) {
      // (the ground round each place: three passes over its neighbours, a few cells)
      mean.set(h);
      for (let it = 0; it < 3; it++) {
        for (let c = 0; c < n; c++) { let sm = 2 * mean[c], w = 2; for (let e = G.nStart[c]; e < G.nStart[c + 1]; e++) { sm += mean[G.nbr[e]]; w++; } mtmp[c] = sm / w; }
        mean.set(mtmp);
      }
      let lows = 0;
      for (let c = 0; c < n; c++) { const l = mean[c] - h[c]; mtmp[c] = l > 0 ? l : 0; lows += mtmp[c]; }
      const V = haze * scale * VEXAG * (HAZE_EVERY * DT_MYR / 1000) * n;   // (cells about equal: the mean thickness times their count)
      if (lows > 0) for (let c = 0; c < n; c++) {
        if (!mtmp[c]) continue;
        const dep = Math.min(mtmp[c], V * mtmp[c] / lows);
        h[c] += dep; bur[c] += dep;
        if (bur[c] > B0) { since[c] = t; bur[c] = 0; }
      }
    }
    // rain while there's water: valleys, lakes in craters, a sea in the lows; as much as the
    // world's history has then (opts.rainAt: its rain through time, ~1 an Earth's), so a cold
    // world's brief warm spells cut a little, now and then
    const rk = opts.rainAt ? opts.rainAt(t) : 1;
    if (wet && t >= wet[0] && t < wet[1] && rk > 2e-3) {
      if (!E) E = new Erosion(G, hs, { sea: opts.seaFrac > 0.02, K: 8e-7, rain: 1, m: 0.45, kd: 1 });
      sl = opts.seaFrac > 0.02 ? quantile(h, opts.seaFrac) : 0;
      for (let c = 0; c < n; c++) hs[c] = h[c] - sl;
      E.rainK = (opts.rainK0 ?? 1) * Math.min(1, (wet[1] - t) / 0.15) * Math.min(1, rk); // drying out toward the end (a methane world's rain is a trickle, in storms)
      E.step(DT_MYR * 1e6);
      for (let c = 0; c < n; c++) { h[c] = hs[c] + sl; if (!E.base[c]) river[c] = Math.max(river[c], E.A[c]); }
      stats.wetSteps++;
      // (lasting rain wears the craters away; brief spells leave them)
      if (rk > 0.2) since.fill(t);
    }
  }
  const crat = new Float32Array(n), all = cum[cum.length - 1], dtG = DT_MYR / 1000;
  for (let c = 0; c < n; c++) crat[c] = all - cum[since[c] > 0 ? Math.min(cum.length - 1, Math.round(since[c] / dtG) + 1) : 0];
  stats.shieldFields = shieldFields.length;
  return { h, volc, river, impacts: imp, stats, seaLevelWet: sl, rise, shields, dich, crat, dMin, shieldFields };
}

// a field of small shield volcanoes round `at` (a unit direction): low lava shields ~1-15 km
// across (real), tens to a couple of hundred of them over 50-300 km (Venus's shield fields);
// R: its reach (radians), n: how many, k: how big the biggest are (0..1 of the most)
function shieldField(rng, at, R0, scale, big) {
  const reach = rng.range(25e3, 150e3) * big;
  return { at, R: reach * scale / R0, n: Math.round(rng.range(20, 200) * big), k: rng.range(0.5, 1) };
}

// a lava flow: from a vent (on the higher ground, mostly), the lava runs to the lowest ground
// beside what it's covered so far, again and again, until it's spent: lobes down the slopes,
// ponds in the lows; thinner toward its toe. Basalt (volc) where it lies
function lavaFlow(G, h, volc, rng, scale, heap, since, t) {
  let c0 = G.cellAt(...rng.unitVector());
  for (let k = 0; k < 3; k++) { const c1 = G.cellAt(...rng.unitVector()); if (h[c1] > h[c0]) c0 = c1; }
  const cells = Math.round(4 + 80 * rng.next() * rng.next()), thick = rng.range(30, 150) * scale * VEXAG;
  const done = new Set([c0]);
  heap.size = 0; heap.push(h[c0], c0);
  for (let k = 0; k < cells && heap.size; k++) {
    const c = heap.pop();
    h[c] += thick * (1 - 0.6 * k / cells); volc[c] = 1; since[c] = t;
    for (let e = G.nStart[c]; e < G.nStart[c + 1]; e++) { const o = G.nbr[e]; if (!done.has(o)) { done.add(o); heap.push(h[o], o); } }
  }
  return c0;
}

// a corona: a plume's head under the lid pushing up a ring (a dome inside, or a sag where it
// has drained), a moat round it, ~100-600 km across (real)
function corona(G, h, rng, scale) {
  const at = rng.unitVector(), R = rng.range(50e3, 300e3) * scale, H = rng.range(500, 1500) * scale * VEXAG, dome = rng.next() < 0.5 ? 0.6 : -0.4;
  const cosR = dm.cos(1.5 * R / G.R);
  for (let c = 0; c < G.n; c++) {
    const cosA = G.dir[c * 3] * at[0] + G.dir[c * 3 + 1] * at[1] + G.dir[c * 3 + 2] * at[2];
    if (cosA < cosR) continue;
    const r = dm.acos(Math.min(1, cosA)) * G.R / R;
    const ring = dm.exp(-((r - 0.85) / 0.12) * ((r - 0.85) / 0.12)), moat = -0.35 * dm.exp(-((r - 1.12) / 0.12) * ((r - 1.12) / 0.12)), mid = dome * (1 - dm.smoothstep(0, 0.75, r));
    h[c] += H * (ring + moat + mid);
  }
  return at;
}

function poissonDraw(rng, lam) {
  if (lam <= 0) return 0;
  const L = dm.exp(-lam);
  let k = 0, p = 1;
  do { k++; p *= rng.next(); } while (p > L);
  return k - 1;
}

function tilt(rng, at, ang) {
  // a direction ang radians from `at`, in a random direction
  const r = rng.unitVector();
  let p = [r[1] * at[2] - r[2] * at[1], r[2] * at[0] - r[0] * at[2], r[0] * at[1] - r[1] * at[0]];
  const l = Math.sqrt(p[0] * p[0] + p[1] * p[1] + p[2] * p[2]) || 1; p = p.map((x) => x / l);
  const c = dm.cos(ang), s = dm.sin(ang);
  return [at[0] * c + p[0] * s, at[1] * c + p[1] * s, at[2] * c + p[2] * s];
}

function near(G, at, ang) {
  const d = G.dir, out = [];
  const c0 = G.cellAt(at[0], at[1], at[2]);
  const seen = new Set([c0]), q = [c0];
  for (let i = 0; i < q.length; i++) {
    const c = q[i];
    const a = dm.acos(Math.min(1, d[c * 3] * at[0] + d[c * 3 + 1] * at[1] + d[c * 3 + 2] * at[2]));
    if (a > ang && c !== c0) continue;
    out.push(c, a);
    for (let e = G.nStart[c]; e < G.nStart[c + 1]; e++) { const o = G.nbr[e]; if (!seen.has(o)) { seen.add(o); q.push(o); } }
  }
  return out;
}

// a great rift canyon running off the rise (Valles Marineris: ~4000 km long,
// up to ~7 km deep), opened when the rise is grown
function makeCanyon(rng, rise, scale) {
  const start = tilt(rng, rise.at, rise.R * 0.9);
  // heading: away from the rise
  const away = [start[0] - rise.at[0], start[1] - rise.at[1], start[2] - rise.at[2]];
  return { start, away, len: rng.range(0.35, 0.7), width: rng.range(80e3, 200e3) * scale, depth: rng.range(4000, 8000) * scale * VEXAG * 1.5, t: rng.range(0.8, 2.0), done: false };
}

function carveCanyon(G, h, C) {
  // walk a great circle from start in the away direction, cutting a trough
  const n = G.n, d = G.dir;
  const s = C.start;
  let t = [C.away[0], C.away[1], C.away[2]];
  const k = t[0] * s[0] + t[1] * s[1] + t[2] * s[2];
  t = [t[0] - s[0] * k, t[1] - s[1] * k, t[2] - s[2] * k];
  const l = Math.sqrt(t[0] * t[0] + t[1] * t[1] + t[2] * t[2]) || 1; t = t.map((x) => x / l);
  const nrm = [s[1] * t[2] - s[2] * t[1], s[2] * t[0] - s[0] * t[2], s[0] * t[1] - s[1] * t[0]]; // the plane's normal
  const halfW = C.width / 2 / G.R;
  for (let c = 0; c < n; c++) {
    const x = d[c * 3], y = d[c * 3 + 1], z = d[c * 3 + 2];
    const off = Math.abs(x * nrm[0] + y * nrm[1] + z * nrm[2]);
    if (off > halfW * 2) continue;
    // along the path: the angle from start toward t
    const along = dm.atan2(x * t[0] + y * t[1] + z * t[2], x * s[0] + y * s[1] + z * s[2]);
    if (along < 0 || along > C.len) continue;
    const ends = dm.smoothstep(0, 0.08, along) * dm.smoothstep(C.len, C.len - 0.12, along);
    const u = off / halfW;
    h[c] -= C.depth * ends * (u < 1 ? 1 : Math.max(0, 1 - (u - 1) * 2)) * (0.7 + 0.3 * dm.cos(along * 9));
  }
}

function quantile(a, q) {
  if (q <= 0) return -Infinity;
  const s = Float64Array.from(a).sort();
  return s[Math.min(s.length - 1, Math.floor(s.length * q))];
}
