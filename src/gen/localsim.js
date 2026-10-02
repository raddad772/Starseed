// The local terrain simulation: the ground at walking scale, made by its history where a
// player goes. Between the world sim's grid (~3.5 km) and the near field's volume (1 m) the
// ground is simulated at two levels, the same sim at each:
//
//   region  ~16 m cells, ~8 km tiles: hills, valleys and ridges, on the world sim's surface
//   local    ~4 m cells, ~2 km tiles: creeks, gullies, cliff bands and scree, on its region's
//
// each run once (deterministic: a world doesn't change), cached, in the terrain workers.
//
// The history, at each level:
//   rock     a stack of layers suited to the rock the world sim put there: sedimentary beds
//            a few to ~25 m thick, hard and soft; lava flows, hard cores under broken tops;
//            massive granite (no beds: its joints and faults shape it); loose river sands
//            and gravels
//   folding  the beds tilted and, in a mountain belt (where the world sim's relief is high),
//            folded across the compression (its direction: across the world surface's slope)
//   faults   in a belt, a few long faults across the compression, each slipping once at its
//            time in the run (a scarp, the beds offset, a broken zone along it); now and
//            then one off a belt
//   joints   two sets of fractures, along and across the compression, spaced by the rock
//            (granite tens of metres, beds about their thickness): weak lines water finds
//   uplift   the land rises against its base level (the tile's edges, the sea) by as much
//            relief as the world sim has there; water cuts it (stream power, each cell by the
//            rock it's in), soil creeps (fast on soft ground, hardly on hard) and slopes
//            steeper than their rock holds collapse, the rock piling up below as talus
//
// so creeks follow the joints and faults, cliff bands stand where hard beds cap soft ones,
// scree lies under them, soft ground rounds off and hard ground stands in knobs. The only
// noise is a few centimetres of jitter on the starting surface (water needs some unevenness
// to choose a way): every shape is the history's.
//
// A tile is MT x MT cells of its face's (u, v) square, simulated with MARGIN cells round it
// (so its edges drain as the land beyond does); what's kept is the inner square and half the
// margin (the overlap with its neighbours, where the ground cross-fades between them).

import { dirFromFaceUV, chunkArcSize } from './cubesphere.js';
import { S_LEN, S_H } from './terrain.js';
import { Erosion } from './worldsim/erosion.js';
import { ROCKS } from './worldsim/lithology.js';
import { Rng, hashInts } from '../core/rng.js';
import * as dm from '../core/dmath.js';

import { MT, MARGIN, KEEP, TILE_VERSION } from './tileshape.js';
export { MT, MARGIN, KEEP, TILE_VERSION };
export const REGION_UP = 2;        // a region tile is 2^REGION_UP local tiles across
const NG = MT + 2 * MARGIN;        // the simulated grid per side

// the tile level for a world: 2^L tiles across a face, each about 2 km; its regions'
export function tileLevel(R) { return Math.max(REGION_UP, Math.round(Math.log2(chunkArcSize(0, R) / 2000))); }
export function regionLevel(R) { return tileLevel(R) - REGION_UP; }
// the world's refinement: tiles a few times finer than its world sim's grid, over the whole
// world (simulated with the world sim, from orbit down to where the regions take over)
export function refineLevelN(N) { return Math.max(0, Math.round(Math.log2(N * 4 / MT))); }
export function refineLevel(gen) { return refineLevelN(gen.snap.s.N); }

// which tile (of level L) a face position is in, and where in it (cells from its corner)
export function tileAt(face, u, v, L, out = {}) {
  const n = 1 << L, s = 2 / n;
  const ti = Math.min(n - 1, Math.max(0, Math.floor((u + 1) / s))), tj = Math.min(n - 1, Math.max(0, Math.floor((v + 1) / s)));
  out.face = face; out.ti = ti; out.tj = tj;
  out.a = ((u + 1) / s - ti) * MT; out.b = ((v + 1) / s - tj) * MT;
  return out;
}
export const tileKey = (face, ti, tj, region = false) => (region ? 'r' : '') + face + ',' + ti + ',' + tj;

// metres per unit of a face's u (or v): its arc over its two units (near enough: the
// gnomonic stretch across a face is no matter to where a fault or a joint runs)
const faceMetres = (R) => chunkArcSize(0, R) / 2;
const hu = (a, b, c, d) => hashInts(a, b, c, d) / 4294967296;    // a hash in [0, 1)

// ---- the rock column: hardness (0 soft .. 1 hard) by height, for the tile's rock
const SUITE = { sandstone: 'sed', shale: 'sed', limestone: 'sed', chalk: 'sed', salt: 'sed', basalt: 'volc', andesite: 'volc', granite: 'xtal' };

function rockColumn(rockName, rng) {
  const suite = SUITE[rockName] || 'loose';
  const lo = -3000, n = 15000;                       // 1 m steps, -3 km .. 12 km
  const hard = new Float32Array(n);
  let z = 0;
  while (z < n) {
    let t, hd;
    if (suite === 'sed') {
      // (a bed's rock: sandstone or limestone hard, shale soft, now and then a thick hard one)
      const r = rng.next();
      if (r < 0.4) { t = rng.range(2, 10); hd = rng.range(0.05, 0.25); }        // shale
      else if (r < 0.85) { t = rng.range(3, 14); hd = rng.range(0.6, 0.85); }   // sandstone
      else { t = rng.range(10, 28); hd = rng.range(0.8, 0.95); }                // a massive cap
    } else if (suite === 'volc') {
      // a flow: its broken top soft, its core hard
      const top = rng.range(1, 3), core = rng.range(5, 18);
      for (let k = 0; k < core && z < n; k++) hard[z++] = 0.9;
      t = top; hd = 0.25;
    } else if (suite === 'xtal') { t = rng.range(150, 600); hd = rng.range(0.865, 0.875); }   // (massive: no beds)
    else { t = rng.range(3, 12); hd = rng.range(0.05, 0.3); }
    for (let k = 0; k < t && z < n; k++) hard[z++] = hd;
  }
  return { lo, hard, suite, at(h) { const i = Math.round(h - lo); return hard[i < 0 ? 0 : i >= n ? n - 1 : i]; } };
}

// ---- a region's structure (in the face's metres): its setting from the world sim there,
// its beds' tilt and folds, its faults, its joint sets. Deterministic from the region.
const _d = [0, 0, 0], _s = new Float64Array(S_LEN);
function worldAt(gen, face, u, v) { dirFromFaceUV(face, u, v, _d); gen.sample(_d[0], _d[1], _d[2], 1e9, _s); return _s[S_H]; }

export function regionStructure(gen, face, ri, rj) {
  const R = gen.R, Lr = regionLevel(R), Mu = faceMetres(R), s = 2 / (1 << Lr);
  const uc = -1 + (ri + 0.5) * s, vc = -1 + (rj + 0.5) * s, size = s * Mu;
  const rng = new Rng([hashInts(face, ri), hashInts(rj, Lr), (gen.p.seed && gen.p.seed[0]) | 0, 0x5717c7]);
  dirFromFaceUV(face, uc, vc, _d);
  const rel = (gen.snap ? gen.snap.relief(_d[0], _d[1], _d[2]) : (gen.p.relief || 3000) * 0.3) * gen.hScale;
  const rockName = gen.snap ? ROCKS[gen.snap.rock(_d[0], _d[1], _d[2])].name : 'granite';
  const suite = SUITE[rockName] || 'loose';
  const belt = dm.smoothstep(300, 2000, rel);   // how much of a mountain belt it is
  // the compression: across the slope of the world's surface (a range's flanks face it);
  // on level ground, wherever the region's history had it
  const e = s * 0.6;
  let cx = worldAt(gen, face, uc + e, vc) - worldAt(gen, face, uc - e, vc), cy = worldAt(gen, face, uc, vc + e) - worldAt(gen, face, uc, vc - e);
  const cl = Math.hypot(cx, cy), ca = rng.range(0, dm.TWO_PI);
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
      dz: rng.sign() * (rng.range(4, 25) + belt * rng.range(15, 140)), t: rng.range(0.15, 0.75), w: rng.range(5, 14),
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
function jointAt(J, X, Y, cell) {
  let w = 0;
  for (const j of J) {
    const m = Math.max(1, Math.ceil(6 * cell / j.sp)), sp = j.sp * m, seg = j.seg * m;
    const nx = dm.cos(j.a), ny = dm.sin(j.a);
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

// ---- the grid: neighbour lists, cell areas and distances (what Erosion needs)
function tileGrid(face, ti, tj, L, R) {
  const n = NG * NG, du = 2 / (1 << L) / MT;
  const u0 = -1 + ti * 2 / (1 << L) - MARGIN * du, v0 = -1 + tj * 2 / (1 << L) - MARGIN * du;
  const dir = new Float64Array(n * 3), d = [0, 0, 0];
  for (let j = 0; j < NG; j++) for (let i = 0; i < NG; i++) {
    dirFromFaceUV(face, u0 + (i + 0.5) * du, v0 + (j + 0.5) * du, d);
    const c = j * NG + i; dir[c * 3] = d[0]; dir[c * 3 + 1] = d[1]; dir[c * 3 + 2] = d[2];
  }
  const nStart = new Int32Array(n + 1), nbr = new Int32Array(n * 8), nDist = new Float64Array(n * 8), area = new Float64Array(n);
  let e = 0;
  const dist = (a, b) => Math.hypot(dir[a * 3] - dir[b * 3], dir[a * 3 + 1] - dir[b * 3 + 1], dir[a * 3 + 2] - dir[b * 3 + 2]) * R;
  for (let j = 0; j < NG; j++) for (let i = 0; i < NG; i++) {
    const c = j * NG + i;
    nStart[c] = e;
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
      if (!di && !dj) continue;
      const ii = i + di, jj = j + dj;
      if (ii < 0 || jj < 0 || ii >= NG || jj >= NG) continue;
      const o = jj * NG + ii;
      nbr[e] = o; nDist[e] = dist(c, o); e++;
    }
    const iu = i < NG - 1 ? c + 1 : c - 1, iv = j < NG - 1 ? c + NG : c - NG;
    area[c] = dist(c, iu) * dist(c, iv);
  }
  nStart[n] = e;
  let sp = 0;
  for (let c = 0; c < n; c++) sp += Math.sqrt(area[c]);
  return { n, N: NG, nStart, nbr: nbr.subarray(0, e), nDist: nDist.subarray(0, e), area, dir, spacing: sp / n, u0, v0, du };
}

// a kept square's height at face (u, v), bilinear (null outside it)
function tileHeightAt(T, u, v) {
  const K = MT + 2 * KEEP, s = 2 / (1 << T.L), du = s / MT;
  const fi = (u - (-1 + T.ti * s - KEEP * du)) / du - 0.5, fj = (v - (-1 + T.tj * s - KEEP * du)) / du - 0.5;
  if (fi < 0 || fj < 0 || fi > K - 1 || fj > K - 1) return null;
  const i = Math.min(K - 2, Math.floor(fi)), j = Math.min(K - 2, Math.floor(fj)), a = fi - i, b = fj - j, o = j * K + i;
  return (T.h[o] * (1 - a) + T.h[o + 1] * a) * (1 - b) + (T.h[o + K] * (1 - a) + T.h[o + K + 1] * a) * b;
}

// three passes of a box blur (about a Gaussian of sigma r), in place
function blur(a, r, tmp) {
  for (let pass = 0; pass < 3; pass++) for (let axis = 0; axis < 2; axis++) {
    const st = axis ? NG : 1, line = axis ? 1 : NG;
    for (let l = 0; l < NG; l++) {
      const b0 = l * line;
      let acc = 0, cnt = 0;
      for (let k = 0; k <= r && k < NG; k++) { acc += a[b0 + k * st]; cnt++; }
      for (let k = 0; k < NG; k++) {
        tmp[k] = acc / cnt;
        const add = k + r + 1, sub = k - r;
        if (add < NG) { acc += a[b0 + add * st]; cnt++; }
        if (sub >= 0) { acc -= a[b0 + sub * st]; cnt--; }
      }
      for (let k = 0; k < NG; k++) a[b0 + k * st] = tmp[k];
    }
  }
}

// ---- run one tile. gen: the TerrainGenerator (with its world sim). opts.kind:
//   'refine'  the world's refinement (on the world sim's surface, rock by the world sim's)
//   'pyr'     a finer level of it near the player (level opts.L, on opts.parent: a RefineReader
//             over the level above), its water and rock from that level's
//   'region'  a region tile (on the world sim's surface: its refinement's, to come)
//   'local'   a local tile, on opts.parent (its region tile's result)
// Returns the kept square (MT + 2 KEEP per side): heights (m), how hard the rock showing is
// (0..255), talus (0..255), drainage area (log, 0..255: creeks and streams), each cell's way
// downhill (neighbour slot); a refinement tile also the rock showing (the world sim's
// kinds, alluvium where the water lays it down) and the water (1 sea, 2 lake)
export function runTile(gen, face, ti, tj, opts = {}) {
  const T = prepareTile(gen, face, ti, tj, opts);
  T.steps();
  return T.finish();
}

// a tile set up to run: steps() runs its history here (floating point), or ints() hands it to
// the integer sim (gpu/itile.js: here or on a GPU) and fromInts() takes the result back;
// finish() then reads its water and rock and returns the kept square (as runTile)
export function prepareTile(gen, face, ti, tj, opts = {}) {
  const kind = opts.kind || (opts.region ? 'region' : 'local'), region = kind === 'region', refine = kind === 'refine', pyr = kind === 'pyr', rf = refine || pyr;
  const R = gen.R, Mu = faceMetres(R), S = gen.snap;
  const L = pyr ? opts.L : refine ? refineLevel(gen) : region ? regionLevel(R) : tileLevel(R), parent = pyr ? opts.parent : null;
  const G = tileGrid(face, ti, tj, L, R), n = G.n, cell = G.spacing;
  const steps = opts.steps ?? (rf ? 120 : region ? 140 : 100);
  // its region's structure (a local tile's: the region it's in; a refinement's is the world
  // sim's own, its rock by place)
  const rs = 1 << REGION_UP;
  const ST = rf ? { faults: [], joints: [], fold: null, dipX: 0, dipY: 0, x0: 0, y0: 0, rel: 0, rock: 'granite', ri: 0, rj: 0, belt: 0 }
    : opts.structure || regionStructure(gen, face, region ? ti : Math.floor(ti / rs), region ? tj : Math.floor(tj / rs));
  // (faults from the regions round it reach in too)
  const faults = ST.faults.slice();
  if (!opts.structure && !rf) for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
    if (!di && !dj) continue;
    const nr = 1 << regionLevel(R), ri = (region ? ti : Math.floor(ti / rs)) + di, rj = (region ? tj : Math.floor(tj / rs)) + dj;
    if (ri < 0 || rj < 0 || ri >= nr || rj >= nr) continue;
    for (const f of regionStructure(gen, face, ri, rj).faults) faults.push(f);
  }
  // the starting surface: the world sim's (region) or the region's (local); rain; the
  // world's standing water (the sea, its lakes), which stays where it is
  const B = new Float64Array(n), rain = new Float64Array(n), X = new Float64Array(n), Y = new Float64Array(n);
  const wet = new Uint8Array(n), relC = new Float64Array(n), hs = gen.hScale;
  // (the relief over a cell of the level above, from the world sim's: relief grows with scale
  // about as its 0.7th power)
  const relK = rf ? dm.pow(Math.min(1, (pyr ? 4 * cell : S.G.spacing) / S.G.spacing), 0.7) : 1, dd = [0, 0, 0];
  for (let j = 0; j < NG; j++) for (let i = 0; i < NG; i++) {
    const c = j * NG + i, u = G.u0 + (i + 0.5) * G.du, v = G.v0 + (j + 0.5) * G.du;
    X[c] = u * Mu; Y[c] = v * Mu;
    const dx = G.dir[c * 3], dy = G.dir[c * 3 + 1], dz = G.dir[c * 3 + 2];
    if (pyr) {
      // (the level above's surface, its water)
      dd[0] = dx; dd[1] = dy; dd[2] = dz;
      let hb;
      if (parent.sample(dd)) {
        hb = parent.h;
        if (parent.lake > 0.5) wet[c] = 2; else if (parent.sea > 0.5 && hb < 0) wet[c] = 1;
      } else { hb = S.h(dx, dy, dz) * hs; if (hb < 0 && S.seaDist(dx, dy, dz) < 1) wet[c] = 1; }
      B[c] = hb; relC[c] = S.relief(dx, dy, dz) * hs * relK;
    } else if (refine) {
      // (the world sim's own surface, its cells' blend: its rivers are for the water here to find)
      let hb = S.h(dx, dy, dz) * hs;
      // (its rivers' courses, a cell or so wide, for the water here to find)
      const rv = gen._riverAt(dx, dy, dz);
      if (rv && rv.dist < 1.5 * cell) hb = Math.min(hb, (Math.max(rv.hs, 0) + 1 - 0.5 * rv.depth) * hs);
      const lk = gen._lakeAt(dx, dy, dz);
      if (lk && lk.own) { hb = Math.min(hb, (lk.L - 0.5) * hs); wet[c] = 2; }
      else if (hb < 0 && S.seaDist(dx, dy, dz) < 1) wet[c] = 1;
      B[c] = hb; relC[c] = S.relief(dx, dy, dz) * hs;
    } else {
      let hb = !region && opts.parent ? tileHeightAt(opts.parent, u, v) : null;
      if (hb == null) { gen.sample(dx, dy, dz, region ? 1e9 : 1000, _s); hb = _s[S_H]; }
      B[c] = hb;
      if (gen.snap) {
        if (hb < 0) wet[c] = 1;     // (the sea: the generator lifts a dry dip above the datum)
        else { const lk = gen._lakeAt(dx, dy, dz); if (lk && lk.own) wet[c] = 2; }
      } else if (hb < 0) wet[c] = 1;
    }
    const P = gen.snap ? gen.snap.rain(dx, dy, dz) : 800;
    rain[c] = Math.max(0.05, Math.min(3, (P || 800) / 1000));
  }
  const rng = new Rng([hashInts(face, ti), hashInts(tj, region ? 0x7e60 : 0x7e11), (gen.p.seed && gen.p.seed[0]) | 0, 0x10ca1]);
  const col = rockColumn(ST.rock, new Rng([hashInts(face, ST.ri), hashInts(ST.rj, 0xc01), (gen.p.seed && gen.p.seed[0]) | 0, 0x5eb]));
  // the beds' offset (how far a bed is from where the column has it) and how broken the rock
  // is: joints and the faults' zones
  const bedOff = new Float64Array(n), weak = new Float64Array(n);
  const fold = ST.fold;
  for (let c = 0; c < n; c++) {
    const x = X[c] - ST.x0, y = Y[c] - ST.y0;
    bedOff[c] = ST.dipX * x + ST.dipY * y + (fold ? fold.A * dm.sin(dm.TWO_PI * (x * ST.cx + y * ST.cy) / fold.lam + fold.ph) : 0);
    weak[c] = opts.joints === false ? 0 : 0.4 * jointAt(ST.joints, X[c], Y[c], cell);
  }
  // a fault's reach: which side of it a cell is on (+-1, tapering off its ends) and its zone
  const fside = faults.map(() => new Float32Array(n));
  faults.forEach((f, k) => {
    const fs = fside[k];
    for (let c = 0; c < n; c++) {
      const x = X[c] - f.x, y = Y[c] - f.y, along = x * f.tx + y * f.ty, across = -x * f.ty + y * f.tx;
      const taper = 1 - dm.smoothstep(f.len * 0.35, f.len * 0.5, Math.abs(along));
      if (taper <= 0) continue;
      fs[c] = taper * dm.smoothstep(-cell, cell, across) * 2 - taper;
      const zone = 1 - Math.abs(across) / Math.max(f.w, cell);
      if (zone > 0) weak[c] = Math.max(weak[c], zone * taper);
    }
  });
  // (a refinement's rock: the world sim's, read as its cells' stack at each cell's height as it
  // is now: so as valleys cut down, lower rock shows in them)
  const rockC = rf ? new Uint8Array(n) : null, ROCK_HD = ROCKS.map((r) => dm.clamp(1.25 - 0.4 * r.k, 0, 1)), rkOut = {};
  const readRock = () => {
    for (let c = 0; c < n; c++) {
      if (pyr) { dd[0] = G.dir[c * 3]; dd[1] = G.dir[c * 3 + 1]; dd[2] = G.dir[c * 3 + 2]; rockC[c] = parent.sample(dd) ? parent.rockAt(h[c], rkOut) : S.rockAt(dd[0], dd[1], dd[2], h[c] / hs); }
      else rockC[c] = S.rockAt(G.dir[c * 3], G.dir[c * 3 + 1], G.dir[c * 3 + 2], h[c] / hs);
    }
  };
  const hardAt = rf ? (c) => ROCK_HD[rockC[c]] : (c, z) => col.at(z + bedOff[c]) * (1 - 0.7 * weak[c]);
  // the starting surface, with a few centimetres of jitter (so water has a way to choose)
  const h = new Float64Array(n);
  const jk = rng.int(1, 0x7fffffff);
  for (let c = 0; c < n; c++) h[c] = B[c] + 0.04 * (hu(jk, c, 0, 0) - 0.5);
  // where water leaves: the sea and the lakes, and the tile's edges where the land's own
  // drainage leaves it (the starting surface routed with every edge open: the edge cells the
  // big flows leave by). Those outlets are the valley floors, below the land's mean (the
  // starting surface: the world sim's heights are its cells' means) by about half the relief
  // the world sim has there; a local tile's are its region's channels, as they are
  const E = new Erosion(G, h, { sea: true, K: 1, rain, m: 0.45, kd: 0 });
  E.lakeId.fill(-1); E.lakeList = [];
  E.findBase = () => {};
  const edge = (c) => { const i = c % NG, j = (c - i) / NG; return i === 0 || j === 0 || i === NG - 1 || j === NG - 1; };
  for (let c = 0; c < n; c++) E.base[c] = wet[c] || edge(c) ? 1 : 0;
  E.nStep = 0; E.route(); E.drain();
  let aOut = 0;
  for (let c = 0; c < n; c++) if (edge(c) && !wet[c]) aOut = Math.max(aOut, E.A[c]);
  const drop = opts.drop ?? (region ? dm.clamp(ST.rel * 0.3, 5, 700) : 0);
  // (a refinement's sea stood lower through the ice ages, by lowstand m: its rivers ran out
  // across the shelf and cut their valleys down to it; then it rose, and drowned them)
  const lowstand = rf ? (opts.lowstand ?? 100) : 0, rise = Math.floor(steps * 0.85);
  for (let c = 0; c < n; c++) {
    const out = edge(c) && !wet[c] && E.A[c] >= 0.08 * aOut;
    E.base[c] = (wet[c] === 1 && B[c] < -lowstand) || wet[c] === 2 || out ? 1 : 0;
    if (out) h[c] = B[c] - (rf ? dm.clamp(relC[c] * 0.3, pyr ? 1 : 5, 900) : drop);
  }
  // the land's mean held to the starting surface's (over a few cells of the world sim's (a
  // refinement), a few hundred metres to a few km): uplift keeping pace with the wearing down,
  // as the world sim had it
  const sig = rf ? 4 : Math.round(NG / (region ? 10 : 20)), mean = new Float64Array(n), btmp = new Float64Array(NG);
  const K0 = opts.K0 ?? (rf ? 3 : region ? 0.3 : 1.2e-2), kd0 = opts.kd0 ?? (rf ? 0.25 : region ? 0.15 : 0.06);
  if (rf) readRock();
  const talus = new Float32Array(n), hd = new Float64Array(n), tmp = new Float64Array(n);
  const { nStart, nbr, nDist, area } = G;
  const fDone = new Uint8Array(faults.length);
  const stepsFloat = () => {
  for (let st = 0; st < steps; st++) {
    const t = st / steps;
    // a fault slips: the ground and its beds on one side drop (or rise) by its throw
    faults.forEach((f, k) => {
      if (fDone[k] || t < f.t) return;
      fDone[k] = 1;
      const fs = fside[k];
      for (let c = 0; c < n; c++) if (fs[c] && !E.base[c]) { const dz = 0.5 * f.dz * fs[c]; h[c] += dz; bedOff[c] -= dz; }
    });
    if (st % 2 === 1) {
      for (let c = 0; c < n; c++) mean[c] = h[c] - B[c];
      blur(mean, sig, btmp);
      for (let c = 0; c < n; c++) if (!E.base[c]) h[c] -= 0.3 * mean[c];
    }
    if (lowstand && st === rise) for (let c = 0; c < n; c++) if (wet[c] === 1) E.base[c] = 1;
    if (st % 2 === 0) { E.nStep = st; E.route(); E.drain(); }
    if (rf && st % 10 === 9) readRock();
    for (let c = 0; c < n; c++) hd[c] = hardAt(c, h[c]);
    // streams: implicit stream power, downstream first, each cell by the rock it's in
    const fill = E.fill, rcv = E.rcv, rcvD = E.rcvD, A = E.A, order = E.order;
    for (let k = 0; k < n; k++) {
      const c = order[k];
      if (E.base[c]) continue;
      const r = rcv[c];
      if (r < 0 || fill[c] - h[c] > 0.5) continue;              // (a pond: nothing cut)
      const hr = h[r];
      if (h[c] <= hr) continue;
      const soft = 1 - hd[c];
      const f = K0 * (0.1 + 1.6 * soft * soft) * dm.pow(A[c], 0.45) / rcvD[c];
      h[c] = (h[c] + f * hr) / (1 + f);
    }
    // soil creep: fast on soft ground, hardly at all on hard rock
    for (let c = 0; c < n; c++) {
      if (E.base[c]) { tmp[c] = 0; continue; }
      let acc = 0;
      const kc = kd0 * cell * cell * (0.03 + 1.2 * (1 - hd[c]));
      for (let e = nStart[c]; e < nStart[c + 1]; e++) { const o = nbr[e]; acc += (h[o] - h[c]) / (nDist[e] * nDist[e]); }
      tmp[c] = kc * acc * 0.25;
    }
    for (let c = 0; c < n; c++) h[c] += tmp[c];
    // slopes past what their rock holds collapse: the excess falls to the foot as talus
    for (let c = 0; c < n; c++) {
      if (E.base[c]) continue;
      const sc = 0.65 + 3.4 * hd[c] * hd[c];
      for (let e = nStart[c]; e < nStart[c + 1]; e++) {
        const o = nbr[e], dz = h[c] - h[o] - sc * nDist[e];
        if (dz <= 0.01) continue;
        const mv = dz * 0.5 * area[o] / (area[c] + area[o]);
        h[c] -= mv; h[o] += mv * area[c] / area[o]; talus[o] += mv;
      }
    }
  }
  };
  // the integer sim's inputs (gpu/itile.js): the grid's cell sizes, the starting surface, which
  // cells are base level (and which join it when the sea rises), the water each cell sheds, how
  // hard its rock is (as it stands at the start), and the parameters
  const ints = () => {
    const sz = new Uint32Array(n), flags = new Uint8Array(n), a = new Uint32Array(n), hdI = new Uint8Array(n), h0 = new Int32Array(n), BI = new Int32Array(n);
    let aref = 0;
    for (let c = 0; c < n; c++) aref += area[c];
    aref /= n;
    for (let c = 0; c < n; c++) {
      sz[c] = Math.round(Math.sqrt(area[c]) * 1000);
      flags[c] = (E.base[c] ? 1 : 0) | (lowstand && wet[c] === 1 && !E.base[c] ? 2 : 0);
      a[c] = Math.max(1, Math.round(area[c] / aref * rain[c] * 16));
      hdI[c] = Math.round(255 * hardAt(c, h[c]));
      h0[c] = Math.round(h[c] * 4096); BI[c] = Math.round(B[c] * 4096);
    }
    return { NG, n, steps, rise: lowstand ? rise : -1, sz, flags, a, hd: hdI, h0, B: BI, aref, K0, kd0, sig, salt: jk };
  };
  const fromInts = (r) => { for (let c = 0; c < n; c++) { h[c] = r.h[c] / 4096; talus[c] = r.talus[c] / 4096; } };
  const finish = () => {
  E.nStep = steps; E.route(); E.drain();
  // a refinement's water: the sea where it reaches (below the datum and joined to the world
  // sim's sea through ground below it), its lakes; and its rock, with the alluvium laid down
  // where big flows slow on gentle ground
  let water = null;
  if (rf) {
    // the rock showing, as the ground stands now: the world sim's cells round each cell read as
    // a stack (SnapshotSampler.rockAt's rule), and by the ground's own lows and rises here (what
    // its water cut): what was laid down (sand, alluvium, salt) lies in the lows, the upper of
    // two rocks stands on the rises. So on even ground too a contact follows the ground, not the
    // world sim's cells
    {
      // (the lows and rises: against the ground a few cells round, measured by the relief there,
      // so a plain's shallow swales count as a hill country's valleys do)
      const sm = Float64Array.from(h), hl = new Float64Array(n), rl = new Float64Array(n);
      blur(sm, 3, btmp);
      for (let c = 0; c < n; c++) { hl[c] = h[c] - sm[c]; rl[c] = hl[c] * hl[c]; }
      blur(rl, 6, btmp);
      const DEP = new Set(['alluvium', 'salt', 'quartz sand', 'coral sand', 'black sand'].map((x) => ROCKS.findIndex((r) => r.name === x)));
      if (pyr) for (let c = 0; c < n; c++) {
        dd[0] = G.dir[c * 3]; dd[1] = G.dir[c * 3 + 1]; dd[2] = G.dir[c * 3 + 2];
        if (parent.sample(dd)) rockC[c] = parent.rockAt(h[c], rkOut, dm.clamp(hl[c] / (1.5 * Math.sqrt(rl[c]) + 0.05), -1, 1), DEP);
      }
      else {
      const cc = new Int32Array(4), ww = new Float64Array(4), uv = { face: 0, u: 0, v: 0 }, dd = [0, 0, 0], sr = S.s.rock, sh = S.s.h;
      const rk = new Int32Array(4), Wr = new Float64Array(4), Hr = new Float64Array(4);
      for (let c = 0; c < n; c++) {
        dd[0] = G.dir[c * 3]; dd[1] = G.dir[c * 3 + 1]; dd[2] = G.dir[c * 3 + 2];
        S.G.corners(dd, cc, ww, uv);
        const r0 = sr[cc[0]];
        if (r0 === sr[cc[1]] && r0 === sr[cc[2]] && r0 === sr[cc[3]]) { rockC[c] = r0; continue; }
        let hb = 0, lo = 1e9, hi = -1e9, nr = 0;
        for (let k = 0; k < 4; k++) {
          const hk = sh[cc[k]], r = sr[cc[k]];
          hb += ww[k] * hk; lo = Math.min(lo, hk); hi = Math.max(hi, hk);
          let q = 0;
          while (q < nr && rk[q] !== r) q++;
          if (q === nr) { rk[nr] = r; Wr[nr] = 0; Hr[nr] = 0; nr++; }
          Wr[q] += ww[k]; Hr[q] += ww[k] * hk;
        }
        const span = Math.max(60, hi - lo), e = (h[c] / hs - hb) / span, el = dm.clamp(hl[c] / (1.5 * Math.sqrt(rl[c]) + 0.05), -1, 1);
        let best = r0, bs = -1e9;
        for (let q = 0; q < nr; q++) {
          if (Wr[q] < 1e-6) continue;
          const rel = (Hr[q] / Wr[q] - hb) / span, up = DEP.has(rk[q]) ? -1 : dm.clamp(4 * rel, -1, 1);
          const score = Wr[q] + 1.5 * e * rel + 0.45 * el * up;
          if (score > bs) { bs = score; best = rk[q]; }
        }
        rockC[c] = best;
      }
      }
    }
    water = new Uint8Array(n);
    const q = new Int32Array(n);
    let qn = 0;
    for (let c = 0; c < n; c++) { if (wet[c] === 2) water[c] = 2; else if (wet[c] === 1 && h[c] < 0) { water[c] = 1; q[qn++] = c; } }
    for (let i = 0; i < qn; i++) {
      const c = q[i];
      for (let e = nStart[c]; e < nStart[c + 1]; e++) { const o = nbr[e]; if (!water[o] && h[o] < 0) { water[o] = 1; q[qn++] = o; } }
    }
    // since the sea rose, its waves: a thin point of soft rock out in the water is cut away,
    // a shallow cove all but closed in by land fills with sand (beaches, bay bars): the fine
    // fringe of the drowned land wears to a coast; hard headlands stand
    const SAND = ROCKS.findIndex((r) => r.name === 'quartz sand');
    for (let it = 0; it < (opts.waves ?? (pyr ? 3 : 6)); it++) {
      for (let c = 0; c < n; c++) {
        if (edge(c) || wet[c] === 2) continue;
        let ns = 0;
        for (let e = nStart[c]; e < nStart[c + 1]; e++) if (water[nbr[e]] === 1) ns++;
        if (!water[c] && ns >= 5 && h[c] < 10 + 60 * (1 - hardAt(c))) { water[c] = 1; h[c] = Math.min(h[c], -2); }
        else if (water[c] === 1 && ns <= 2 && h[c] > -25) { water[c] = 0; h[c] = 1; rockC[c] = SAND; }
      }
    }
    // (below the datum and cut off from the sea: a dry basin, its floor just above it)
    for (let c = 0; c < n; c++) if (!water[c] && h[c] < 0.5) h[c] = 0.5 - 0.02 * h[c];
    const AL = ROCKS.findIndex((r) => r.name === 'alluvium'), aLay = 4e8 * (cell / 900) * (cell / 900);
    for (let c = 0; c < n; c++) {
      if (water[c] || E.rcv[c] < 0) continue;
      const sl = (h[c] - h[E.rcv[c]]) / E.rcvD[c];
      if (E.A[c] > aLay && sl < 0.004) rockC[c] = AL;
    }
  }
  // the kept square
  const K = MT + 2 * KEEP, off = MARGIN - KEEP;
  const out = { face, ti, tj, L, MT, KEEP, kind, region, cell, version: TILE_VERSION, suite: col.suite, rock: ST.rock, belt: ST.belt, faults: faults.length,
    h: new Float32Array(K * K), hard: new Uint8Array(K * K), talus: new Uint8Array(K * K), flow: new Uint8Array(K * K), rcv: new Uint8Array(K * K) };
  if (rf) { out.rockC = new Uint8Array(K * K); out.water = new Uint8Array(K * K); }
  const amax = dm.log(1e7 * (cell / 4) * (cell / 4));
  for (let j = 0; j < K; j++) for (let i = 0; i < K; i++) {
    const c = (j + off) * NG + (i + off), o = j * K + i;
    out.h[o] = h[c];
    out.hard[o] = Math.round(255 * (rf ? hardAt(c) : col.at(h[c] + bedOff[c])));     // (the rock's: its joints don't show)
    if (rf) { out.rockC[o] = rockC[c]; out.water[o] = water[c]; }
    out.talus[o] = Math.min(255, Math.round(talus[c] * 25));
    out.flow[o] = Math.round(255 * Math.max(0, Math.min(1, dm.log(Math.max(1, E.A[c])) / amax)));
    // (the way down: which of the 8 neighbours, 0..7 as di, dj = -1..1 row by row; 255 none)
    const r = E.rcv[c];
    if (r < 0) out.rcv[o] = 255;
    else { const di = (r % NG) - (c % NG), dj = Math.floor(r / NG) - Math.floor(c / NG); const k = (dj + 1) * 3 + (di + 1); out.rcv[o] = k > 4 ? k - 1 : k; }
  }
  return out;
  };
  return { steps: stepsFloat, ints, fromInts, finish };
}

export function tileTransferables(t) { return [t.h.buffer, t.hard.buffer, t.talus.buffer, t.flow.buffer, t.rcv.buffer, ...(t.rockC ? [t.rockC.buffer, t.water.buffer] : [])]; }
