// The rock below the ground at scales finer than the world sim's cells: each rock suite's
// column (its beds by height) and each region's structure (the beds' tilt and folds, its faults
// and joints), shared by the terrain's tiles (localsim.js: the rock they wear down as they run)
// and the sampler (terrain.js: the rock it shades where no tile has laid the beds out), so both
// draw the same beds. A suite's column is the world's, the same stack wherever that suite lies;
// the structure is each region's own, blended smoothly between regions' middles (bedAt), so no
// region's square shows where its beds meet the next's.

import { dirFromFaceUV, chunkArcSize } from './cubesphere.js';
import { ROCKS } from './worldsim/lithology.js';
import { Rng, hashInts } from '../core/rng.js';
import * as dm from '../core/dmath.js';

export const REGION_UP = 2;        // a region tile is 2^REGION_UP local tiles across
export function tileLevel(R) { return Math.max(REGION_UP, Math.round(Math.log2(chunkArcSize(0, R) / 2000))); }
export function regionLevel(R) { return tileLevel(R) - REGION_UP; }
// metres per unit of a face's u (or v): its arc over its two units (near enough: the
// gnomonic stretch across a face is no matter to where a fault or a joint runs)
export const faceMetres = (R) => chunkArcSize(0, R) / 2;
const hu = (a, b, c, d) => hashInts(a, b, c, d) / 4294967296;    // a hash in [0, 1)

// ---- the rock column: hardness (0 soft .. 1 hard) by height, for the tile's rock
export const SUITE = { sandstone: 'sed', shale: 'sed', limestone: 'sed', chalk: 'sed', salt: 'sed', basalt: 'volc', andesite: 'volc', granite: 'xtal' };

const RI = Object.fromEntries(ROCKS.map((r, i) => [r.name, i]));
export function rockColumn(rockName, rng) {
  const suite = SUITE[rockName] || 'loose';
  const lo = -3000, n = 15000;                       // 1 m steps, -3 km .. 12 km
  const hard = new Float32Array(n), type = new Uint8Array(n);
  let z = 0;
  while (z < n) {
    let t, hd, ty;
    if (suite === 'sed') {
      // (a bed's rock: sandstone or limestone hard, shale soft, now and then a thick hard one)
      const r = rng.next();
      if (r < 0.4) { t = rng.range(2, 10); hd = rng.range(0.05, 0.25); ty = RI.shale; }        // shale
      else if (r < 0.85) { t = rng.range(3, 14); hd = rng.range(0.6, 0.85); ty = RI.sandstone; }   // sandstone
      else { t = rng.range(10, 28); hd = rng.range(0.8, 0.95); ty = RI.limestone; }            // a massive cap
    } else if (suite === 'volc') {
      // a flow: its broken top soft, its core hard
      const top = rng.range(1, 3), core = rng.range(5, 18);
      for (let k = 0; k < core && z < n; k++) { type[z] = RI.basalt; hard[z++] = 0.9; }
      t = top; hd = 0.25; ty = RI.regolith;
    } else if (suite === 'xtal') { t = rng.range(150, 600); hd = rng.range(0.865, 0.875); ty = RI.granite; }   // (massive: no beds)
    else { t = rng.range(3, 12); hd = rng.range(0.05, 0.3); ty = RI.alluvium; }
    for (let k = 0; k < t && z < n; k++) { type[z] = ty; hard[z++] = hd; }
  }
  const idx = (h) => { const i = Math.round(h - lo); return i < 0 ? 0 : i >= n ? n - 1 : i; };
  return { lo, hard, type, suite, at(h) { return hard[idx(h)]; }, typeAt(h) { return type[idx(h)]; } };
}
// a column as a grid of cells sees it: each height's layers averaged over the height a cell's
// slope lays bare (win m, about half a cell): beds thinner than that blur to their mean hardness
// and show their commonest rock; thicker ones stand out (cliff bands where the cells are fine)
export function smoothColumn(col, win) {
  const n = col.hard.length, w = Math.max(0, Math.round(win / 2));
  if (w < 1) return col;
  const hard = new Float32Array(n), type = new Uint8Array(n), pre = new Float64Array(n + 1);
  for (let z = 0; z < n; z++) pre[z + 1] = pre[z] + col.hard[z];
  const cnt = new Int32Array(32);
  for (let z = -w; z < w && z < n; z++) if (z >= 0) cnt[col.type[z]]++;
  for (let z = 0; z < n; z++) {
    const a = Math.max(0, z - w), b = Math.min(n, z + w + 1);
    hard[z] = (pre[b] - pre[a]) / (b - a);
    if (z + w < n) cnt[col.type[z + w]]++;
    if (z - w - 1 >= 0) cnt[col.type[z - w - 1]]--;
    let best = col.type[z], bc = -1;
    for (let t = 0; t < 32; t++) if (cnt[t] > bc) { bc = cnt[t]; best = t; }
    type[z] = best;
  }
  const lo = col.lo, idx = (h) => { const i = Math.round(h - lo); return i < 0 ? 0 : i >= n ? n - 1 : i; };
  return { lo, hard, type, suite: col.suite, at(h) { return hard[idx(h)]; }, typeAt(h) { return type[idx(h)]; } };
}
export const SUITES = ['sed', 'volc', 'xtal', 'loose'], SUITE_ROCK = { sed: 'sandstone', volc: 'basalt', xtal: 'granite', loose: 'alluvium' };
export const DEPOSITS = new Set(['alluvium', 'salt', 'quartz sand', 'coral sand', 'black sand']);

// ---- a region's structure (in the face's metres): its setting from the world sim there,
// its beds' tilt and folds, its faults, its joint sets. Deterministic from the region.
const _d = [0, 0, 0], _s = new Float64Array(32);
// (the world's surface there, smoothly: the world sim's where there is one, else the generator's
// broad shape (its sample's first slot, the height))
function worldAt(gen, face, u, v) {
  dirFromFaceUV(face, u, v, _d);
  if (gen.snap) return gen.snap.hSmooth(_d[0], _d[1], _d[2]) * gen.hScale;
  gen.sample(_d[0], _d[1], _d[2], 1e9, _s);
  return _s[0];
}

export function regionStructure(gen, face, ri, rj) {
  const R = gen.R, Lr = regionLevel(R), Mu = faceMetres(R), s = 2 / (1 << Lr);
  const uc = -1 + (ri + 0.5) * s, vc = -1 + (rj + 0.5) * s, size = s * Mu;
  const rng = new Rng([hashInts(face, ri), hashInts(rj, Lr), (gen.p.seed && gen.p.seed[0]) | 0, 0x5717c7]);
  dirFromFaceUV(face, uc, vc, _d);
  // (the relief here, real: what the deep time made; the structure is the same whatever the
  // heights are drawn at. The ground below the deep time is at true scale, so its beds' dips and
  // folds are real shapes: a belt's beds tilt 20 degrees whatever its mountains are drawn at
  // (flattened by hScale they lay level, and every hard bed stood as a ring of little cliffs round
  // every knoll, each a few of the 9.6 m level's cells: grid-squared knobs, cones from the ground).
  // A fault's throw is drawn by hScale: at real throws one scarp crossed a whole small range)
  const relReal = gen.snap ? gen.snap.relief(_d[0], _d[1], _d[2]) : (gen.p.relief || 3000) * 0.3, rel = relReal * gen.hScale, hs = gen.hScale;
  const rockName = gen.snap ? ROCKS[gen.snap.rock(_d[0], _d[1], _d[2])].name : 'granite';
  const suite = SUITE[rockName] || 'loose';
  const belt = dm.smoothstep(300, 2000, relReal);   // how much of a mountain belt it is
  // the compression: across the slope of the world's surface (a range's flanks face it);
  // on level ground, wherever the region's history had it
  const e = s * 0.6;
  let cx = worldAt(gen, face, uc + e, vc) - worldAt(gen, face, uc - e, vc), cy = worldAt(gen, face, uc, vc + e) - worldAt(gen, face, uc, vc - e);
  const cl = Math.sqrt(cx * cx + cy * cy), ca = rng.range(0, dm.TWO_PI);
  if (cl < 0.5) { cx = dm.cos(ca); cy = dm.sin(ca); } else { cx /= cl; cy /= cl; }
  // the beds' tilt (a few degrees off a belt, up to ~20 in one) and, in a belt, folds
  // with their axes across the compression
  const dipA = dm.atan2(cy, cx) + rng.range(-0.5, 0.5), dip = rng.range(0, 0.03) + belt * rng.range(0.05, 0.35);
  const fold = belt > 0.15 ? { A: 0, lam: rng.range(700, 2600), ph: rng.range(0, dm.TWO_PI) } : null;
  if (fold) fold.A = belt * rng.range(0.04, 0.12) * fold.lam;
  // faults: long, across the compression, each slipping once (its throw: the scarp and the
  // beds' offset) at its time in the run
  const faults = [];
  const nF = belt > 0.2 ? rng.int(1, 1 + Math.round(3 * belt)) : (rng.chance(0.35) ? 1 : 0);
  for (let k = 0; k < nF; k++) {
    const a = dm.atan2(cy, cx) + dm.HALF_PI + rng.range(-0.35, 0.35);
    faults.push({
      x: (uc + rng.range(-0.45, 0.45) * s) * Mu, y: (vc + rng.range(-0.45, 0.45) * s) * Mu,
      tx: dm.cos(a), ty: dm.sin(a), len: rng.range(0.5, 1.4) * size,
      dz: rng.sign() * (rng.range(4, 25) + belt * rng.range(15, 140)) * hs, t: rng.range(0.15, 0.75), w: rng.range(5, 14),
    });
  }
  // joints: one set along the compression (its planes hold it: their normals across it), one
  // across; spaced by the rock, each joint broken into stretches along its strike
  const sp0 = suite === 'xtal' ? rng.range(18, 45) : suite === 'sed' ? rng.range(8, 24) : suite === 'volc' ? rng.range(10, 25) : 0;
  const joints = [];
  if (sp0) for (let k = 0; k < 2; k++) {
    const a = dm.atan2(cy, cx) + (k ? 0 : dm.HALF_PI) + rng.range(-0.2, 0.2);
    joints.push({ a, sp: sp0 * (k ? rng.range(1, 1.8) : 1), seg: rng.range(60, 320), on: rng.range(0.3, 0.55), key: rng.int(1, 0x7fffffff) });
  }
  return { face, ri, rj, rel, belt, rock: rockName, suite, cx, cy, dipX: dip * dm.cos(dipA), dipY: dip * dm.sin(dipA), fold, faults, joints, x0: uc * Mu, y0: vc * Mu };
}

// how broken the rock is at (X, Y) (face metres) by the joints at a cell size: 0 .. 1. Joints
// are irregular: spaced anywhere from a fraction to twice the set's spacing, each a few degrees
// off the set's strike, broken into stretches along it. Those closer than ~6 cells are the
// rock's grain, not lines water picks out: at a coarse level only every m-th (the master
// joints, longer) counts
export function jointAt(J, X, Y, cell) {
  let w = 0;
  for (const j of J) {
    const m = Math.max(1, Math.ceil(6 * cell / j.sp)), sp = j.sp * m, seg = j.seg * m;
    const nx = j.nx ?? (j.nx = dm.cos(j.a)), ny = j.ny ?? (j.ny = dm.sin(j.a));
    const q = X * nx + Y * ny, t = -X * ny + Y * nx;
    const i0 = Math.floor(q / sp);
    for (let i = i0 - 2; i <= i0 + 2; i++) {
      // (this joint: where it crosses, its own strike, a few degrees off the set's)
      const off = (i + 0.5 + 0.9 * (hu(j.key, i, m, 1) - 0.5)) * sp, tw = 0.12 * (hu(j.key, i, m, 4) - 0.5);
      const dist = Math.abs(q - off - tw * (t - hu(j.key, i, m, 5) * 4000));
      if (dist >= cell) continue;
      const tj = t + hu(j.key, i, m, 2) * seg, k = Math.floor(tj / seg);
      if (hu(j.key, i, k, 3 + m) > j.on) continue;
      w = Math.max(w, 1 - dist / cell);
    }
  }
  return w;
}


// ---- each suite's column for a world (seed: the world's), as cells win m apart see it (made
// once a process for each window)
const _cols = new Map();
export function worldColumn(seed, su, win) {
  // (the window to the nearest power of two: a few of them serve every level and sampling)
  let w2 = 1;
  while (w2 * 1.5 < win) w2 *= 2;
  const key = seed + '|' + su + '|' + (win < 0.75 ? 0 : w2);
  let c = _cols.get(key);
  if (!c) {
    if (_cols.size > 64) _cols.clear();
    const raw = rockColumn(SUITE_ROCK[su], new Rng([hashInts(0x5eb, SUITES.indexOf(su)), seed | 0, 0xc01]));
    _cols.set(key, c = win < 0.75 ? raw : smoothColumn(raw, w2));
  }
  return c;
}

// a region's structure, kept (per generator: its world)
export function structureOf(gen, face, ri, rj) {
  const C = gen._regC || (gen._regC = new Map()), key = (face * 4096 + rj) * 4096 + ri;
  let st = C.get(key);
  if (!st) { if (C.size > 20000) C.clear(); C.set(key, st = regionStructure(gen, face, ri, rj)); }
  return st;
}

// the beds' offset (m: how far a bed stands from where its column has it) at face (u, v) (X, Y
// its face metres), and with cell > 0 how broken the rock is there (joints at that cell size):
// the four regions round it blended by where it stands between their middles, smoothly. Into
// out { bed, weak }
export function bedAt(gen, face, u, v, X, Y, cell, out) {
  const nR = 1 << regionLevel(gen.R), s = 2 / nR;
  const fr = (u + 1) / s - 0.5, fs = (v + 1) / s - 0.5, i0 = Math.floor(fr), j0 = Math.floor(fs);
  const tx = dm.smoothstep(0, 1, fr - i0), ty = dm.smoothstep(0, 1, fs - j0);
  let bed = 0, weak = 0;
  for (let q = 0; q < 2; q++) for (let p = 0; p < 2; p++) {
    const w = (p ? tx : 1 - tx) * (q ? ty : 1 - ty);
    if (w <= 0) continue;
    const ST = structureOf(gen, face, Math.min(nR - 1, Math.max(0, i0 + p)), Math.min(nR - 1, Math.max(0, j0 + q)));
    const x = X - ST.x0, y = Y - ST.y0, f = ST.fold;
    bed += w * (ST.dipX * x + ST.dipY * y + (f ? f.A * dm.sin(dm.TWO_PI * (x * ST.cx + y * ST.cy) / f.lam + f.ph) : 0));
    if (cell > 0) weak += w * jointAt(ST.joints, X, Y, cell);
  }
  out.bed = bed; out.weak = weak;
  return out;
}
