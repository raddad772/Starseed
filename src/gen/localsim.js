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

import { dirFromFaceUV, chunkArcSize, FACES } from './cubesphere.js';
import { S_LEN, S_H } from './terrain.js';
import { Erosion } from './worldsim/erosion.js';
import { ROCKS, ROCK_UP } from './worldsim/lithology.js';
import { Rng, hashInts } from '../core/rng.js';
import * as dm from '../core/dmath.js';

import { MT, MARGIN, KEEP, TILE_VERSION } from './tileshape.js';
import { stampCraters, stampRidges, stampFolds, ridgeWidth, RIDGE } from './craters.js';
import { craterFloor, worldCell, TILE_CELLS } from './worldsim/impacts.js';
import { REGION_UP, tileLevel, regionLevel, faceMetres, SUITE, SUITES, DEPOSITS, rockColumn, regionStructure, jointAt, worldColumn, bedAt } from './geology.js';
export { MT, MARGIN, KEEP, TILE_VERSION, REGION_UP, tileLevel, regionLevel };
const NG = MT + 2 * MARGIN;        // the simulated grid per side

// the tile level for a world: 2^L tiles across a face, each about 2 km; its regions'
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

const hu = (a, b, c, d) => hashInts(a, b, c, d) / 4294967296;    // a hash in [0, 1)

// how hard each of the world sim's rocks is (0 soft .. 1 hard), from how fast it wears
const ROCK_HD = ROCKS.map((r) => dm.clamp(1.25 - 0.4 * r.k, 0, 1));
// (where a rock stands in a stack, by its kind: cover strata and lava over the old basement)
const UPK = ROCK_UP;

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
  const dist = (a, b) => { const x = dir[a * 3] - dir[b * 3], y = dir[a * 3 + 1] - dir[b * 3 + 1], z = dir[a * 3 + 2] - dir[b * 3 + 2]; return Math.sqrt(x * x + y * y + z * z) * R; };
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

// The great rivers coming in: where the world sim's water crosses into a refinement tile's
// ground from a cell beyond it, the drainage gathered upstream comes in with it (a tile's own
// rain is only its own: without this a great river crossing it is a creek here, and cuts like
// one). Each comes in a cell inside the edge it crosses, and the edge there is shut (the river
// comes in by it, it doesn't leave). Returns { src, shut } (rain-weighted m^2 by cell) or null.
// (A world with no climate now ran its history's drainage on a unit rain: its rivers are scaled
// by the rain the tile has, its history's while it rained.)
const RIVER_IN = 1e8;
function riverInflow(S, G, face, rain) {
  if (!S || !S.s.rcv || !S.s.riverMax) return null;
  const n = G.n, F = FACES[face];
  // (a direction's place on this tile's grid (cell units), past the face's edge too: the tile's
  // margin reaches over)
  const QPI = Math.PI / 4, ij = (d) => {
    const dn = d[0] * F.N[0] + d[1] * F.N[1] + d[2] * F.N[2];
    if (dn <= 0.05) return null;
    const u = Math.atan((d[0] * F.U[0] + d[1] * F.U[1] + d[2] * F.U[2]) / dn) / QPI;
    const v = Math.atan((d[0] * F.V[0] + d[1] * F.V[1] + d[2] * F.V[2]) / dn) / QPI;
    return [(u - G.u0) / G.du - 0.5, (v - G.v0) / G.du - 0.5];
  };
  const on = (g) => g && g[0] >= 0 && g[1] >= 0 && g[0] <= NG - 1 && g[1] <= NG - 1;
  const a = [0, 0, 0], b = [0, 0, 0], q = [0, 0, 0], nb = new Int32Array(8);
  // the world cells whose middles are on the grid
  const near = new Set(), inside = new Set();
  for (let c = 0; c < n; c++) near.add(S.G.cellAt(G.dir[c * 3], G.dir[c * 3 + 1], G.dir[c * 3 + 2]));
  for (const r of near) if (on(ij(S.G.centre(r, a)))) inside.add(r);
  const src = new Float64Array(n), shut = new Uint8Array(n);
  let any = false;
  for (const r of inside) {
    const k = S.G.nbrs(r, nb);
    for (let e = 0; e < k; e++) {
      const p = nb[e];
      if (inside.has(p) || !S.s.river[p] || S.rcvOf(p) !== r) continue;
      const Ap = S.s.riverMax * 1e-4 * Math.pow(10, 4 * S.s.river[p] / 255);
      if (Ap < RIVER_IN) continue;
      // along the line from its middle to the cell it drains into, the first point on the grid
      S.G.centre(p, a); S.G.centre(r, b);
      let hit = null;
      for (let t = 0; t <= 1.0001 && !hit; t += 0.05) {
        q[0] = a[0] + (b[0] - a[0]) * t; q[1] = a[1] + (b[1] - a[1]) * t; q[2] = a[2] + (b[2] - a[2]) * t;
        const g = ij(q);
        if (on(g)) hit = g;
      }
      if (!hit) continue;
      // a cell in from the edge it crossed; that stretch of edge shut
      let i = Math.round(hit[0]), j = Math.round(hit[1]);
      const di = Math.min(i, NG - 1 - i), dj = Math.min(j, NG - 1 - j);
      if (di <= dj) i = i < NG / 2 ? 1 : NG - 2; else j = j < NG / 2 ? 1 : NG - 2;
      i = Math.max(1, Math.min(NG - 2, i)); j = Math.max(1, Math.min(NG - 2, j));
      const ci = j * NG + i;
      src[ci] += Ap * (S.Gc ? 1 : rain[ci]); any = true;
      for (let dj2 = -3; dj2 <= 3; dj2++) for (let di2 = -3; di2 <= 3; di2++) {
        const ii = i + di2, jj = j + dj2;
        if (ii >= 0 && jj >= 0 && ii < NG && jj < NG) shut[jj * NG + ii] = 1;
      }
    }
  }
  return any ? { src, shut } : null;
}

// The same for a pyramid tile, from the level above's own drainage (its fl and rcv: the
// refinement's, or the tile of the level above this one lies in): where that level's water
// crosses into this tile's grid from a cell outside it, carrying more than a small catchment's,
// it comes in a cell inside the edge, and the edge there is shut. So a river keeps cutting its
// own channel down every level (a tile's own rain made it a creek at its entry), and the side
// canyons and gullies running into it have their base level. Returns { src, shut } or null
const K_ = MT + 2 * KEEP, LN_FL = dm.log(1e11), nbDI = (k) => ((k >= 4 ? k + 1 : k) % 3) - 1, nbDJ = (k) => (((k >= 4 ? k + 1 : k) / 3) | 0) - 1;
function pyrInflow(parent, face, ti, tj, cell) {
  const P = parent && parent.src;
  if (!P) return null;
  // (the level above's tile holding this one, and its arrays)
  const pti = ti >> 2, ptj = tj >> 2;
  let fl, rc, off = 0;
  if (parent.sparse) { const t = P.tiles.get((face * P.n + ptj) * P.n + pti); if (!t || !t.fl || !t.rcv) return null; fl = t.fl; rc = t.rcv; }
  else { if (!P.fl || !P.rcv) return null; fl = P.fl; rc = P.rcv; off = ((face * P.n + ptj) * P.n + pti) * K_ * K_; }
  // (this grid in the level above's cells: its NG cells, four to one, from MARGIN / 4 outside
  // this tile's square; a cell (pi, pj) of that span at (pi, pj) + o0 in its tile's kept square)
  const span = NG / 4, o0i = (ti & 3) * (MT / 4) - MARGIN / 4 + KEEP, o0j = (tj & 3) * (MT / 4) - MARGIN / 4 + KEEP;
  const thr = Math.round(255 * dm.log(Math.max(1e5, 400 * cell * cell)) / LN_FL);
  const src = new Float64Array(NG * NG), shut = new Uint8Array(NG * NG), W = 6;
  let any = false;
  const ring = (pi, pj) => pi === 0 || pj === 0 || pi === span - 1 || pj === span - 1;
  for (let pj = -1; pj <= span; pj++) for (let pi = -1; pi <= span; pi++) {
    if (pi >= 0 && pj >= 0 && pi < span && pj < span) continue;   // (only the cells just outside)
    const o = off + (pj + o0j) * K_ + pi + o0i, k = rc[o];
    if (k === 255 || fl[o] < thr) continue;
    const qi = pi + nbDI(k), qj = pj + nbDJ(k);
    if (qi < 0 || qj < 0 || qi >= span || qj >= span || !ring(qi, qj)) continue;
    // (the cell it drains into, in this grid's cells: a cell in from the edge it crosses)
    let i = qi * 4 + 1.5, j = qj * 4 + 1.5;
    if (pi < 0) i = 1; else if (pi >= span) i = NG - 2;
    else if (pj < 0) j = 1; else j = NG - 2;
    i = Math.max(1, Math.min(NG - 2, Math.round(i))); j = Math.max(1, Math.min(NG - 2, Math.round(j)));
    src[j * NG + i] += dm.exp(fl[o] / 255 * LN_FL); any = true;
    for (let dj = -W; dj <= W; dj++) for (let di = -W; di <= W; di++) {
      const ii = i + di, jj = j + dj;
      if (ii >= 0 && jj >= 0 && ii < NG && jj < NG) shut[jj * NG + ii] = 1;
    }
  }
  return any ? { src, shut } : null;
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
  // (a pyramid tile: the region its middle is in)
  const rL = regionLevel(R), regOf = (t) => (L >= rL ? t >> (L - rL) : (t << (rL - L)) + (1 << (rL - L - 1)));
  const rri = pyr ? regOf(ti) : region ? ti : Math.floor(ti / (1 << REGION_UP)), rrj = pyr ? regOf(tj) : region ? tj : Math.floor(tj / (1 << REGION_UP));
  const ST = refine ? { faults: [], joints: [], fold: null, dipX: 0, dipY: 0, x0: 0, y0: 0, rel: 0, rock: 'granite', ri: 0, rj: 0, belt: 0 }
    : opts.structure || regionStructure(gen, face, rri, rrj);
  // (faults from the regions round it reach in too)
  const faults = ST.faults.slice();
  if (!opts.structure && !refine) for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
    if (!di && !dj) continue;
    const nr = 1 << rL, ri = rri + di, rj = rrj + dj;
    if (ri < 0 || rj < 0 || ri >= nr || rj >= nr) continue;
    for (const f of regionStructure(gen, face, ri, rj).faults) faults.push(f);
  }
  // the starting surface: the world sim's (region) or the region's (local); rain; the
  // world's standing water (the sea, its lakes), which stays where it is
  const B = new Float64Array(n), rain = new Float64Array(n), X = new Float64Array(n), Y = new Float64Array(n), U = new Float64Array(n), V = new Float64Array(n);
  const wet = new Uint8Array(n), relC = new Float64Array(n), hs = gen.hScale;
  // (the relief over a cell of the level above, from the world sim's: relief grows with scale
  // about as its 0.7th power)
  const relK = rf ? dm.pow(Math.min(1, (pyr ? 4 * cell : S.G.spacing) / S.G.spacing), 0.7) : 1, dd = [0, 0, 0], ctr = [0, 0, 0];
  for (let j = 0; j < NG; j++) for (let i = 0; i < NG; i++) {
    const c = j * NG + i, u = G.u0 + (i + 0.5) * G.du, v = G.v0 + (j + 0.5) * G.du;
    X[c] = u * Mu; Y[c] = v * Mu; U[c] = u; V[c] = v;
    const dx = G.dir[c * 3], dy = G.dir[c * 3 + 1], dz = G.dir[c * 3 + 2];
    if (pyr) {
      // (the level above's surface, its water)
      dd[0] = dx; dd[1] = dy; dd[2] = dz;
      let hb;
      if (parent.sampleUV(face, u, v) || parent.sample(dd)) {
        hb = parent.h;
        if (parent.lake > 0.5) wet[c] = 2; else if (parent.sea > 0.5 && hb < 0) wet[c] = 1;
      } else { hb = S.h(dx, dy, dz) * hs; if (hb < 0 && S.seaDist(dx, dy, dz) < 1) wet[c] = 1; }
      B[c] = hb; relC[c] = S.relief(dx, dy, dz) * hs * relK;
    } else if (refine) {
      // (the world sim's own surface, its cells' smooth blend (a straight-line blend's facets
      // and a one-cell valley's stairs would stay in the ground here): its rivers are for the
      // water here to find)
      let hb = S.hSmooth(dx, dy, dz) * hs;
      // (canyon country: the plateau's level round a great river's gorge, for it to cut here)
      if (S.s.gorge) hb += S.gorgeSmooth(dx, dy, dz) * hs;
      // (its rivers' courses, a cell or so wide, for the water here to find)
      const rv = gen._riverAt(dx, dy, dz);
      if (rv && rv.dist < 1.5 * cell) hb = Math.min(hb, (Math.max(rv.hs, 0) + 1 - 0.5 * rv.depth) * hs);
      // (a lake: its water wherever this surface lies below its level, in its cells and those
      // round them, so its shore is that surface's contour, not its cells' squares; held under
      // the water round each of its cells' middles, so even a one-cell lake stays)
      const lk = gen._lakeAt(dx, dy, dz);
      if (lk && lk.own) {
        const c0 = S.G.cellAt(dx, dy, dz), m = S.G.centre(c0, ctr), ex = dx - m[0], ey = dy - m[1], ez = dz - m[2];
        const r = Math.sqrt(ex * ex + ey * ey + ez * ez) * R / S.G.spacing;
        hb += (Math.min(hb, (lk.L - 0.5) * hs) - hb) * (1 - dm.smoothstep(0.25, 0.5, r));
      }
      if (lk && hb < lk.L * hs) wet[c] = 2;
      else if (hb < 0 && S.seaDist(dx, dy, dz) < 1) wet[c] = 1;
      B[c] = hb; relC[c] = S.relief(dx, dy, dz) * hs;
    } else {
      let hb = !region && opts.parent ? tileHeightAt(opts.parent, u, v) : null;
      if (hb == null) { gen.sample(dx, dy, dz, region ? 1e9 : 1000, _s); hb = _s[S_H]; }
      B[c] = hb;
      if (gen.snap) {
        if (hb < 0 && gen.p.liquid) wet[c] = 1;     // (the sea: the generator lifts a dry dip above the datum)
        else { const lk = gen._lakeAt(dx, dy, dz); if (lk && lk.own) wet[c] = 2; }
      } else if (hb < 0 && gen.p.liquid) wet[c] = 1;
    }
    // (a world with no climate now: the rain its history had while it rained, below)
    const P = gen.snap ? (gen.snap.Gc ? gen.snap.rain(dx, dy, dz) : (gen.snap.s.wetRain || 0) * 1000) : 800;
    rain[c] = Math.max(0.02, Math.min(3, (P ?? 800) / 1000));
  }
  // the craters the refinement's cells draw round and the world sim's couldn't (craters.js): on
  // the ground it starts from, so the run wears them and the mean is held to them (the finer
  // ones the sampler draws, where the ground is seen: no tile edges among them)
  if (refine && S && S.s.crat && S.s.crater) {
    const K = S.s.crater, cellL = chunkArcSize(L, R) / MT;
    const Dhi = K.Dw, Dlo = Math.max(craterFloor(cellL, TILE_CELLS), K.Dair);
    if (Dlo < Dhi) stampCraters(B, G, face, S, Dlo, Dhi, K, (gen.p.seed && gen.p.seed[0]) | 0, R, hs);
  }
  // (an icy shell's ridges: as wide as they are, or as this level's cells hold, less the level above's)
  if (rf && S && S.s.lineae) {
    const wT = RIDGE.w * (S.s.crater ? S.s.crater.scale : 0.1), cellL = chunkArcSize(L, R) / MT;
    stampRidges(B, G, S.s.lineae, R, ridgeWidth(wT, cellL), ridgeWidth(wT, pyr ? 4 * cellL : worldCell(R, S.s.N)));
  }

  // (a world without air has no rain: nothing but creep and collapse wear it)
  // (or a wet past: a world that's dry now but had rain once keeps the valleys it cut: its rivers
  // as big as its rain was while it rained (snapshot wetRain), cutting for the share of its time
  // it rained (wetFrac))
  const wetK = !S || S.Gc ? 1 : (S.s.wetFrac || 0), fluvial = wetK > 0;
  const rng = new Rng([hashInts(face, ti), hashInts(tj, region ? 0x7e60 : 0x7e11), (gen.p.seed && gen.p.seed[0]) | 0, 0x10ca1]);
  const col = rockColumn(ST.rock, new Rng([hashInts(face, ST.ri), hashInts(ST.rj, 0xc01), (gen.p.seed && gen.p.seed[0]) | 0, 0x5eb]));
  // the beds' offset (how far a bed is from where the column has it) and how broken the rock
  // is: joints and the faults' zones
  const bedOff = new Float64Array(n), weak = new Float64Array(n);
  // (a pyramid tile's: the regions' structures round each cell, blended (geology.js bedAt), as
  // the sampler has them where no tile has run; a local tile's: its region's own)
  const fold = ST.fold, bo = { bed: 0, weak: 0 };
  for (let c = 0; c < n; c++) {
    if (pyr) { bedAt(gen, face, U[c], V[c], X[c], Y[c], opts.joints === false ? 0 : cell, bo); bedOff[c] = bo.bed; weak[c] = 0.4 * bo.weak; continue; }
    const x = X[c] - ST.x0, y = Y[c] - ST.y0;
    bedOff[c] = ST.dipX * x + ST.dipY * y + (fold ? fold.A * dm.sin(dm.TWO_PI * (x * ST.cx + y * ST.cy) / fold.lam + fold.ph) : 0);
    weak[c] = opts.joints === false ? 0 : 0.4 * jointAt(ST.joints, X[c], Y[c], cell);
  }
  // a fault's reach: which side of it a cell is on (+-1, tapering off its ends) and its zone
  const fside = faults.map(() => new Float32Array(n));
  faults.forEach((f, k) => {
    const fs = fside[k];
    for (let c = 0; c < n; c++) {
      const x = X[c] - f.x, y = Y[c] - f.y, along = x * f.tx + y * f.ty;
      // (its trace not ruled straight: bowed gently along its length and wandering a little,
      // as a fault's does through the rock it breaks; from a hash of where it is, the same in
      // every tile)
      const taper = 1 - dm.smoothstep(f.len * 0.35, f.len * 0.5, Math.abs(along));
      if (taper <= 0) continue;
      const fk = f._k ?? (f._k = (hashInts(Math.round(f.x), Math.round(f.y), 0xfa17) >>> 0) / 4294967296);
      const across = -x * f.ty + y * f.tx - (fk - 0.5) * 0.24 * along * along / f.len
        - f.len * (0.008 * dm.sin(dm.TWO_PI * along / (0.53 * f.len) + 6.283 * fk) + 0.002 * dm.sin(dm.TWO_PI * along / (0.19 * f.len) + 12.6 * fk));
      fs[c] = taper * dm.smoothstep(-cell, cell, across) * 2 - taper;
      const zone = 1 - Math.abs(across) / Math.max(f.w, cell);
      if (zone > 0) weak[c] = Math.max(weak[c], zone * taper);
    }
  });
  // (a refinement's rock: the world sim's, read as its cells' stack at each cell's height as it
  // is now: so as valleys cut down, lower rock shows in them)
  const rockC = rf ? new Uint8Array(n) : null, rkOut = {};
  // (a refinement reads its cells' rock from the world sim's again and again as they wear down:
  // each cell's warped place reckoned once, and a cell among cells of one rock answered once)
  let wdC = null, fixC = null;
  const readRock = () => {
    if (refine && !S.ref && !S.pyrReaders().length) {
      const wd = dd;
      if (!wdC) {
        // (the warp is smooth, its finest swirls ~20 cells across: reckoned every fourth cell and
        // laid between them, its offsets bilinear)
        wdC = new Float64Array(3 * n); fixC = new Int16Array(n).fill(-2);
        const S4 = 4, nl = Math.ceil((NG - 1) / S4) + 1, off = new Float64Array(nl * nl * 3);
        for (let lj = 0; lj < nl; lj++) for (let li = 0; li < nl; li++) {
          const c = Math.min(NG - 1, lj * S4) * NG + Math.min(NG - 1, li * S4), o = (lj * nl + li) * 3;
          S.rockWarp(G.dir[c * 3], G.dir[c * 3 + 1], G.dir[c * 3 + 2], wd);
          off[o] = wd[0] - G.dir[c * 3]; off[o + 1] = wd[1] - G.dir[c * 3 + 1]; off[o + 2] = wd[2] - G.dir[c * 3 + 2];
        }
        for (let j = 0; j < NG; j++) {
          const lj = Math.min(nl - 2, Math.floor(j / S4)), fj = Math.min(1, (j - lj * S4) / Math.max(1, Math.min(NG - 1, (lj + 1) * S4) - lj * S4));
          for (let i = 0; i < NG; i++) {
            const li = Math.min(nl - 2, Math.floor(i / S4)), fi = Math.min(1, (i - li * S4) / Math.max(1, Math.min(NG - 1, (li + 1) * S4) - li * S4));
            const c = j * NG + i, a = (lj * nl + li) * 3, b = a + 3, d = a + nl * 3, e = d + 3;
            let x = G.dir[c * 3], y = G.dir[c * 3 + 1], z = G.dir[c * 3 + 2];
            x += (off[a] * (1 - fi) + off[b] * fi) * (1 - fj) + (off[d] * (1 - fi) + off[e] * fi) * fj;
            y += (off[a + 1] * (1 - fi) + off[b + 1] * fi) * (1 - fj) + (off[d + 1] * (1 - fi) + off[e + 1] * fi) * fj;
            z += (off[a + 2] * (1 - fi) + off[b + 2] * fi) * (1 - fj) + (off[d + 2] * (1 - fi) + off[e + 2] * fi) * fj;
            const l = Math.sqrt(x * x + y * y + z * z);
            wdC[c * 3] = x / l; wdC[c * 3 + 1] = y / l; wdC[c * 3 + 2] = z / l;
          }
        }
      }
      for (let c = 0; c < n; c++) {
        if (fixC[c] >= 0) { rockC[c] = fixC[c]; continue; }
        wd[0] = wdC[c * 3]; wd[1] = wdC[c * 3 + 1]; wd[2] = wdC[c * 3 + 2];
        const r = S.rockAtWarped(wd, h[c] / hs);
        rockC[c] = r;
        if (fixC[c] === -2) fixC[c] = S.rockSame ? r : -1;
      }
      return;
    }
    for (let c = 0; c < n; c++) {
      if (pyr) { dd[0] = G.dir[c * 3]; dd[1] = G.dir[c * 3 + 1]; dd[2] = G.dir[c * 3 + 2]; rockC[c] = parent.sampleUV(face, U[c], V[c]) || parent.sample(dd) ? parent.rockAt(h[c], rkOut) : S.rockAt(dd[0], dd[1], dd[2], h[c] / hs); }
      else rockC[c] = S.rockAt(G.dir[c * 3], G.dir[c * 3 + 1], G.dir[c * 3 + 2], h[c] / hs);
    }
  };
  // (a pyramid tile's: each cell's rock's suite of layers (the world's, geology.js), tilted and
  // folded, read at its height as it is now, so as valleys cut down through hard and soft beds,
  // cliff bands stand)
  const suiteC = pyr ? new Uint8Array(n) : null, cols = pyr ? SUITES.map((su) => worldColumn((gen.p.seed && gen.p.seed[0]) | 0, su, 0.5 * cell)) : null;
  const readSuite = () => { for (let c = 0; c < n; c++) { const nm = ROCKS[rockC[c]].name; suiteC[c] = DEPOSITS.has(nm) ? 3 : Math.max(0, SUITES.indexOf(SUITE[nm] || 'loose')); } };
  const hardAt = refine ? (c) => ROCK_HD[rockC[c]] : pyr ? (c, z = h[c]) => cols[suiteC[c]].at(z + bedOff[c]) * (1 - 0.7 * weak[c]) : (c, z) => col.at(z + bedOff[c]) * (1 - 0.7 * weak[c]);
  // the starting surface, with a few centimetres of jitter (so water has a way to choose)
  const h = new Float64Array(n);
  const jk = rng.int(1, 0x7fffffff);
  for (let c = 0; c < n; c++) h[c] = B[c] + 0.04 * (hu(jk, c, 0, 0) - 0.5);
  // (a pyramid tile's faults have slipped before its run: their scarps wear through it)
  if (pyr) faults.forEach((f, k) => {
    f.done = true;
    const fs = fside[k];
    for (let c = 0; c < n; c++) if (fs[c]) { const dz = 0.5 * f.dz * fs[c]; h[c] += dz; bedOff[c] -= dz; }
  });
  // where water leaves: the sea and the lakes, and the tile's edges where the land's own
  // drainage leaves it (the starting surface routed with every edge open: the edge cells the
  // big flows leave by). Those outlets are the valley floors, below the land's mean (the
  // starting surface: the world sim's heights are its cells' means) by about half the relief
  // the world sim has there; a local tile's are its region's channels, as they are
  const E = new Erosion(G, h, { sea: true, K: 1, rain, m: 0.45, kd: 0 });
  // (water finds its own way across a plain, not the grid's straight lines)
  E.flatWander = true; E.flatK = 1 / cell;
  E.lakeId.fill(-1); E.lakeList = [];
  E.findBase = () => {};
  const edge = (c) => { const i = c % NG, j = (c - i) / NG; return i === 0 || j === 0 || i === NG - 1 || j === NG - 1; };
  // (the great rivers coming in from beyond it: a refinement's, from the world sim; a pyramid
  // tile's, from the level above)
  const inflow = refine ? riverInflow(S, G, face, rain) : pyr && opts.inflow !== false ? pyrInflow(parent, face, ti, tj, cell) : null, shut = inflow ? inflow.shut : null;
  if (inflow) E.src = inflow.src;
  for (let c = 0; c < n; c++) E.base[c] = wet[c] || (edge(c) && !(shut && shut[c])) ? 1 : 0;
  E.nStep = 0; E.route(); E.drain();
  let aOut = 0;
  for (let c = 0; c < n; c++) if (edge(c) && !wet[c] && !(shut && shut[c])) aOut = Math.max(aOut, E.A[c]);
  const drop = opts.drop ?? (region ? dm.clamp(ST.rel * 0.3, 5, 700) : 0);
  // (a refinement's sea stood lower through the ice ages, by lowstand m: its rivers ran out
  // across the shelf and cut their valleys down to it; then it rose, and drowned them)
  // (one sea-level history: the refinement cuts its valleys; a finer level, on what it cut,
  // only what its own scale adds, the low sea's fall shrinking with the cells as relief does)
  const lowstand = rf ? (opts.lowstand ?? 100) * (pyr ? dm.pow(Math.min(1, 4 * cell / S.G.spacing), 0.7) : 1) : 0, rise = Math.floor(steps * 0.85);
  for (let c = 0; c < n; c++) {
    const out = edge(c) && !wet[c] && !(shut && shut[c]) && E.A[c] >= 0.08 * aOut;
    E.base[c] = (wet[c] === 1 && B[c] < -lowstand) || wet[c] === 2 || out ? 1 : 0;
    if (out) h[c] = B[c] - (rf ? dm.clamp(relC[c] * 0.3, pyr ? 1 : 5, 900) : drop);
  }
  // the land's mean held to the starting surface's (over a few cells of the world sim's (a
  // refinement), a few hundred metres to a few km): uplift keeping pace with the wearing down,
  // as the world sim had it
  const sig = rf ? 4 : Math.round(NG / (region ? 10 : 20)), mean = new Float64Array(n), btmp = new Float64Array(NG);
  // (stream power's rate by the cell: each level runs the same number of steps, and finer
  // features form proportionally faster; so each level adds about the relief its scale holds)
  const K0 = opts.K0 ?? (!fluvial ? 0 : (rf ? 1.6 * dm.pow(cell / 1000, 0.85) : region ? 0.3 : 1.2e-2) * wetK), kd0 = opts.kd0 ?? (rf ? 0.25 : region ? 0.15 : 0.06);
  // channel heads: water cuts only where enough of it gathers (m^2 of rain-weighted drainage);
  // below that the ground is hillslope, shaped by creep and collapse: smooth between valleys,
  // where real terrain stops being rough at every scale
  // ...and that area by place: denser drainage where it's wet and on impermeable rock (shale),
  // sparse where water sinks in (limestone, chalk, sandstone, lava: dry valleys)
  const AcC = new Float64Array(n), Hc = new Float32Array(n);
  {
    const RF = { shale: 0.3, sandstone: 2, limestone: 4, chalk: 5, basalt: 2, andesite: 1.2, alluvium: 1.5, 'quartz sand': 3, 'coral sand': 3, 'black sand': 3 };
    const rockF = ROCKS.map((r) => RF[r.name] ?? 1);
    // ((1 / rain)^0.7 by a table over rain 0.3 .. 3, read between its entries: the same sums on
    // every machine, without a pow a cell)
    const RT = new Float64Array(272);
    for (let k = 0; k < 272; k++) RT[k] = dm.pow(1 / (0.3 + k * 0.01), 0.7);
    for (let c = 0; c < n; c++) {
      const dx = G.dir[c * 3], dy = G.dir[c * 3 + 1], dz = G.dir[c * 3 + 2];
      const rt = S ? S.s.rock[S.G.cellAt(dx, dy, dz)] : 0, relRaw = rf ? relC[c] / relK : S ? S.relief(dx, dy, dz) * hs : 1000;
      const x = (Math.min(3, Math.max(0.3, rain[c])) - 0.3) * 100, k = Math.min(270, Math.floor(x)), rp = RT[k] + (RT[k + 1] - RT[k]) * (x - k);
      // (and at least a few cells' worth: where a cell is bigger than a channel head every one of
      // them would cut, rills one cell apart combing every slope; a level cuts only where its
      // water gathers, the finer levels' cells the rills between)
      AcC[c] = opts.Ac ?? Math.max(dm.clamp(3e4 * rockF[rt] * rp, 3e3, 1e6), rf ? 3 * G.area[c] : 0);
      // the ground's roughness (Hurst exponent H; its surface's fractal dimension 3 - H): rough
      // where mountains are young and high, the rock hard and the climate dry; smoother where
      // the land is old and worn, soft, and wet enough for soil to creep
      const hard = ROCK_HD[rt], wetness = dm.smoothstep(0.2, 1.5, rain[c]);
      Hc[c] = opts.H ?? dm.clamp(0.8 - 0.14 * dm.smoothstep(400, 3000, relRaw) - 0.1 * (hard - 0.6) + 0.08 * (wetness - 0.5), 0.55, 0.92);
    }
  }
  // (the land's mean held to the starting surface's through the run, or let wear and put back at
  // the end: the restore)
  const holdMean = opts.restore ? false : true;
  if (rf) readRock();
  if (pyr) readSuite();
  const talus = new Float32Array(n), hd = new Float64Array(n), tmp = new Float64Array(n);
  const { nStart, nbr, nDist, area } = G;
  const fDone = new Uint8Array(faults.length);
  const stepsFloat = () => {
  for (let st = 0; st < steps; st++) {
    const t = st / steps;
    // a fault slips: the ground and its beds on one side drop (or rise) by its throw
    faults.forEach((f, k) => {
      if (fDone[k] || f.done || t < f.t) return;
      fDone[k] = 1;
      const fs = fside[k];
      for (let c = 0; c < n; c++) if (fs[c] && !E.base[c]) { const dz = 0.5 * f.dz * fs[c]; h[c] += dz; bedOff[c] -= dz; }
    });
    if (st % 2 === 1 && holdMean) {
      for (let c = 0; c < n; c++) mean[c] = h[c] - B[c];
      blur(mean, sig, btmp);
      for (let c = 0; c < n; c++) if (!E.base[c]) h[c] -= 0.3 * mean[c];
    }
    if (lowstand && st === rise) for (let c = 0; c < n; c++) if (wet[c] === 1) E.base[c] = 1;
    if (K0 > 0 && st % 2 === 0) { E.nStep = st; E.route(); E.drain(); }
    if (rf && st % 10 === 9) { readRock(); if (pyr) readSuite(); }
    for (let c = 0; c < n; c++) hd[c] = hardAt(c, h[c]);
    // streams: implicit stream power, downstream first, each cell by the rock it's in
    const fill = E.fill, rcv = E.rcv, rcvD = E.rcvD, A = E.A, order = E.order;
    if (K0 > 0) for (let k = 0; k < n; k++) {
      const c = order[k];
      if (E.base[c]) continue;
      const r = rcv[c];
      if (r < 0 || fill[c] - h[c] > 0.5 || A[c] < AcC[c]) continue;  // (a pond, or hillslope: nothing cut)
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
      a[c] = Math.max(1, Math.round(area[c] / aref * rain[c] * 16)) + (E.src ? Math.min(2 ** 30, Math.round(E.src[c] / aref * 16)) : 0);   // (and a great river coming in: held well inside 32 bits)
      hdI[c] = Math.round(255 * hardAt(c, h[c]));
      h0[c] = Math.round(h[c] * 4096); BI[c] = Math.round(B[c] * 4096);
    }
    const Acu = new Uint16Array(n);
    for (let c = 0; c < n; c++) Acu[c] = Math.max(1, Math.min(65535, Math.round(AcC[c] / (aref / 16))));
    let geo = null;
    if (pyr) {
      // (each cell's rock's column, read each step at its height: COL[suite x 15000 + metre])
      const colHd = new Uint8Array(4 * 15000), suite = Uint8Array.from(suiteC), bedOffI = new Int32Array(n), weakI = new Uint8Array(n);
      for (let k = 0; k < 4; k++) for (let z = 0; z < 15000; z++) colHd[k * 15000 + z] = Math.round(255 * cols[k].hard[z]);
      for (let c = 0; c < n; c++) { bedOffI[c] = Math.round(bedOff[c]); weakI[c] = Math.round(255 * weak[c]); }
      geo = { colHd, colLo: -3000, suite, bedOff: bedOffI, weak: weakI };
    }
    return { NG, n, steps, rise: lowstand ? rise : -1, sz, flags, a, hd: hdI, h0, B: BI, aref, K0, kd0, sig, salt: jk, Acu, geo };
  };
  const out0 = {};
  const fromInts = (r) => { for (let c = 0; c < n; c++) { h[c] = r.h[c] / 4096; talus[c] = r.talus[c] / 4096; } };
  // the relief this level added, held to the terrain's fractal scaling: what it added below its
  // parent's cell (the history's shapes, all of them) scaled so its roughness over 2 cells is
  // the parent's over 4 (one of its cells) times 2^-2H: each level 4^-H the relief of the one
  // above at a quarter the scale (H = 3 - D, the surface's fractal dimension: ~0.7-0.8 for
  // mountains, smoother for old worn land). Slopes made too steep for their rock then collapse
  const holdFractal = () => {
    // (block by block, ~64 cells a side, each to its own ground's H; the scale eased between
    // blocks' centres, so the roughness changes as the ground does, not in steps)
    const lagP = 4, lag = 2, BS = 64, nb = Math.ceil((NG - 2 * MARGIN) / BS), m = nb * nb;
    const S6 = Array.from({ length: 7 }, () => new Float64Array(m + 1));   // gB, gBl, gD, cBD, nP, nl, H (block m: all)
    for (let j = MARGIN; j < NG - MARGIN; j += 2) for (let i = MARGIN; i < NG - MARGIN; i += 2) {
      const c = j * NG + i;
      if (wet[c] || h[c] < 0) continue;
      const b = Math.min(nb - 1, ((j - MARGIN) / BS) | 0) * nb + Math.min(nb - 1, ((i - MARGIN) / BS) | 0);
      for (const o of [c + lagP, c + lagP * NG]) { const d = B[o] - B[c]; for (const k of [b, m]) { S6[0][k] += d * d; S6[4][k]++; } }
      for (const o of [c + lag, c + lag * NG]) {
        const db = B[o] - B[c], dd2 = (h[o] - B[o]) - (h[c] - B[c]);
        for (const k of [b, m]) { S6[1][k] += db * db; S6[2][k] += dd2 * dd2; S6[3][k] += db * dd2; S6[5][k]++; S6[6][k] += Hc[c]; }
      }
    }
    const solve = (k) => {
      if (S6[4][k] < 100 || S6[2][k] <= 0) return -1;
      const gB = S6[0][k] / S6[4][k], gBl = S6[1][k] / S6[5][k], gD = S6[2][k] / S6[5][k], cBD = S6[3][k] / S6[5][k], H = S6[6][k] / S6[5][k];
      // (gBl + 2 f cBD + f^2 gD = the target: the parent's roughness over a cell, at half the
      // scale, times 2^-2H)
      const target = gB * dm.pow(lag / lagP, 2 * H), disc = cBD * cBD - gD * (gBl - target);
      return Math.max(0.02, Math.min(3, disc > 0 ? (-cBD + Math.sqrt(disc)) / gD : 0.2));
    };
    const fAll = solve(m);
    if (fAll < 0) return 1;
    const fB = new Float64Array(m);
    for (let k = 0; k < m; k++) { const f = solve(k); fB[k] = f < 0 ? fAll : f; }
    let fmax = 0;
    for (let j = 0; j < NG; j++) for (let i = 0; i < NG; i++) {
      const c = j * NG + i;
      if (E.base[c] || wet[c]) continue;
      const x = Math.max(0, Math.min(nb - 1, (i - MARGIN) / BS - 0.5)), y = Math.max(0, Math.min(nb - 1, (j - MARGIN) / BS - 0.5));
      const i0 = Math.min(nb - 2, Math.floor(x)), j0 = Math.min(nb - 2, Math.floor(y)), a = x - i0, bb = y - j0;
      const f = nb < 2 ? fAll : (fB[j0 * nb + i0] * (1 - a) + fB[j0 * nb + i0 + 1] * a) * (1 - bb) + (fB[(j0 + 1) * nb + i0] * (1 - a) + fB[(j0 + 1) * nb + i0 + 1] * a) * bb;
      h[c] = B[c] + f * (h[c] - B[c]);
      if (f > fmax) fmax = f;
    }
    if (fmax > 1) for (let pass = 0; pass < 8; pass++) for (let c = 0; c < n; c++) {
      if (E.base[c]) continue;
      const sc = 0.65 + 3.4 * hardAt(c, h[c]) ** 2;
      for (let e = nStart[c]; e < nStart[c + 1]; e++) {
        const o = nbr[e], dz = h[c] - h[o] - sc * nDist[e];
        if (dz <= 0.01) continue;
        const mv = dz * 0.5 * area[o] / (area[c] + area[o]);
        h[c] -= mv; h[o] += mv * area[c] / area[o]; talus[o] += mv;
      }
    }
    return fAll;
  };
  const finish = () => {
  // (the land's mean put back where the run let it wear: the difference over a cell of the level
  // above, smoothly, as the crust rises back under land worn down)
  if (!holdMean) {
    const dm2 = new Float64Array(n);
    for (let c = 0; c < n; c++) dm2[c] = B[c] - h[c];
    blur(dm2, sig, btmp);
    for (let c = 0; c < n; c++) if (!E.base[c] && !wet[c]) h[c] += dm2[c];
  }
  // (where no water runs, the craters are the history at every scale: nothing to hold)
  if (rf && opts.H !== 0 && K0 > 0) out0.fractal = holdFractal();
  // (folds: a squeezed lid's ridges, a lava plain's wrinkle ridges, laid on the ground the run
  // left (they stand sharp, as the Moon's 3 Gyr-old ones do; the run's creep wore a ridge two
  // cells wide away): each as narrow as it is or as this level's cells hold, less the level
  // above's drawing, the refinement drawing them whole)
  if (rf && S && S.s.folds) {
    const cellL = chunkArcSize(L, R) / MT;
    stampFolds(h, G, S.s.folds, R, cellL, pyr ? 4 * cellL : Infinity);
  }
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
        if (parent.sampleUV(face, U[c], V[c]) || parent.sample(dd)) rockC[c] = parent.rockAt(h[c], rkOut, dm.clamp(hl[c] / (1.5 * Math.sqrt(rl[c]) + 0.05), -1, 1), DEP);
      }
      else {
      const cc = new Int32Array(16), ww = new Float64Array(16), uv = { face: 0, u: 0, v: 0 }, dd = [0, 0, 0], wd = [0, 0, 0], sr = S.s.rock, sh = S.s.h;
      const mLv = S.s.mareLv || null, BAS = ROCKS.findIndex((r) => r.name === 'basalt');
      const rk = new Int32Array(16), Wr = new Float64Array(16), Hr = new Float64Array(16);
      for (let c = 0; c < n; c++) {
        // (each cell's warped place and its one-rock answer, as the steps reckoned them)
        if (wdC) {
          if (fixC[c] >= 0) { rockC[c] = fixC[c]; continue; }
          wd[0] = wdC[c * 3]; wd[1] = wdC[c * 3 + 1]; wd[2] = wdC[c * 3 + 2];
          S.G.corners16(wd, cc, ww, uv);
        } else {
          dd[0] = G.dir[c * 3]; dd[1] = G.dir[c * 3 + 1]; dd[2] = G.dir[c * 3 + 2];
          S.G.corners16(S.rockWarp(dd[0], dd[1], dd[2], wd), cc, ww, uv);
        }
        const r0 = sr[cc[0]];
        let same = true;
        for (let k = 1; k < 16 && same; k++) if (sr[cc[k]] !== r0) same = false;
        if (same) { rockC[c] = r0; continue; }
        let hb = 0, lo = 1e9, hi = -1e9, nr = 0, mw = 0;
        if (mLv) for (let k = 0; k < 16; k++) if (mLv[cc[k]] !== -32768) mw += ww[k];
        for (let k = 0; k < 16; k++) {
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
          // (where it stands in the stack: the rock of the higher cells over the lower's, and by
          // its kind: cover strata and lava hold the rises, the old basement shows where valleys
          // cut down to it, what was laid down lies in the lows. So on even ground a contact
          // follows the land's own swales and rises, not the world sim's cells)
          // (a mare's lava filled the lows of its basin: it lies in them, embaying what stood up)
          const rel = (Hr[q] / Wr[q] - hb) / span, up = DEP.has(rk[q]) || (rk[q] === BAS && mw > 0.02) ? -1 : dm.clamp(4 * rel + UPK[rk[q]], -1, 1);
          const score = Wr[q] + (1.5 * e * rel + 0.8 * el * up) * Math.min(1, 2.5 * Wr[q]);
          if (score > bs) { bs = score; best = rk[q]; }
        }
        rockC[c] = best;
      }
      }
    }
    // (a pyramid tile's bedrock shows the layer of its suite at its height: banded cliffs)
    if (pyr) {
      readSuite();
      for (let c = 0; c < n; c++) if (suiteC[c] !== 3) rockC[c] = cols[suiteC[c]].typeAt(h[c] + bedOff[c]);
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
    const SAND = ROCKS.findIndex((r) => r.name === 'quartz sand'), waveH = dm.pow(Math.min(1, cell / 900), 0.5);   // (what waves cut: less on a finer grid's smaller points)
    for (let it = 0; it < (opts.waves ?? (pyr ? 3 : 6)); it++) {
      for (let c = 0; c < n; c++) {
        if (edge(c) || wet[c] === 2) continue;
        let ns = 0;
        for (let e = nStart[c]; e < nStart[c + 1]; e++) if (water[nbr[e]] === 1) ns++;
        if (!water[c] && ns >= 5 && h[c] < waveH * (10 + 60 * (1 - hardAt(c)))) { water[c] = 1; h[c] = Math.min(h[c], -2); }
        else if (water[c] === 1 && ns <= 2 && h[c] > -25) { water[c] = 0; h[c] = 1; rockC[c] = SAND; }
      }
    }
    // longshore drift: along a soft or sandy shore the waves carry sand down the coast, building
    // spits across bays and filling coves, combing it smooth (its fractal dimension near 1);
    // a hard rock coast keeps its drowned valleys' inlets
    for (let it = 0; it < 4; it++) {
      for (let j = 2; j < NG - 2; j++) for (let i = 2; i < NG - 2; i++) {
        const c = j * NG + i;
        if (wet[c] === 2 || it >= Math.round(4 * (1 - hardAt(c)))) continue;
        let land = 0;
        for (let dj = -2; dj <= 2; dj++) for (let di = -2; di <= 2; di++) if (!water[c + dj * NG + di]) land++;
        if (land === 0 || land === 25) continue;
        if (water[c] === 1 && land >= 16 && h[c] > -15 * waveH) { water[c] = 0; h[c] = 1; rockC[c] = SAND; }
        else if (!water[c] && land <= 9 && h[c] < 8 * waveH) { water[c] = 1; h[c] = Math.min(h[c], -2); }
      }
    }
    // (below the datum and cut off from the sea: a dry basin, its floor just above it; a world
    // with no liquid has no datum, its craters and basins as deep as they are)
    if (gen.p.liquid) for (let c = 0; c < n; c++) if (!water[c] && h[c] < 0.5) h[c] = 0.5 - 0.02 * h[c];
    const AL = ROCKS.findIndex((r) => r.name === 'alluvium'), aLay = 4e8 * (cell / 900) * (cell / 900);
    // (where water runs: on an airless world nothing ever carried it)
    if (K0 > 0) for (let c = 0; c < n; c++) {
      if (water[c] || E.rcv[c] < 0) continue;
      const sl = (h[c] - h[E.rcv[c]]) / E.rcvD[c];
      if (E.A[c] > aLay && sl < 0.004) rockC[c] = AL;
    }
  }
  // the kept square
  const K = MT + 2 * KEEP, off = MARGIN - KEEP;
  const out = { ...out0, face, ti, tj, L, MT, KEEP, kind, region, cell, version: TILE_VERSION, suite: col.suite, rock: ST.rock, belt: ST.belt, faults: faults.length,
    h: new Float32Array(K * K), hard: new Uint8Array(K * K), talus: new Uint8Array(K * K), flow: new Uint8Array(K * K), rcv: new Uint8Array(K * K) };
  if (rf) { out.rockC = new Uint8Array(K * K); out.water = new Uint8Array(K * K); out.fl = new Uint8Array(K * K); }
  const lA = dm.log(1e11);
  const amax = dm.log(1e7 * (cell / 4) * (cell / 4));
  for (let j = 0; j < K; j++) for (let i = 0; i < K; i++) {
    const c = (j + off) * NG + (i + off), o = j * K + i;
    out.h[o] = h[c];
    out.hard[o] = Math.round(255 * (rf ? hardAt(c) : col.at(h[c] + bedOff[c])));     // (the rock's: its joints don't show)
    if (rf) { out.rockC[o] = rockC[c]; out.water[o] = water[c]; }
    out.talus[o] = Math.min(255, Math.round(talus[c] * 25));
    const lgA = K0 > 0 ? dm.log(Math.max(1, E.A[c])) : 0;   // (no water, no creeks)
    out.flow[o] = Math.round(255 * Math.max(0, Math.min(1, lgA / amax)));
    // (the water through it on one scale for every level: log of its rain-weighted area, m^2, to 1e11)
    if (rf) out.fl[o] = Math.round(255 * Math.max(0, Math.min(1, lgA / lA)));
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
