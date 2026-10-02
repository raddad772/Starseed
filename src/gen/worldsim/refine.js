// A world's refinement (localsim.js 'refine' tiles over the whole world, a few times finer than
// its world sim's grid): what the world's water cut into its surface, the sea that drowned it
// where it reached, the rock that shows, packed for the game. The arrays are SharedArrayBuffers
// where the page is cross-origin isolated (the terrain workers read one copy), and the reader
// finds a point's value by its place, blending the tiles that overlap there (across the cube's
// faces too: a tile reaches past its face's edge).
//
//   h   heights (m, Int16), per tile its kept square (MT + 2 KEEP a side)
//   rw  rock (the world sim's kinds, lithology.js: the low 5 bits) | water << 5 (1 sea, 2 lake)

import { FACES, dirFromFaceUV } from '../cubesphere.js';
import { GridLite } from './grid.js';
import { ROCK_UP } from './lithology.js';
import { meanderField } from '../meanders.js';
import { MT, KEEP, TILE_VERSION } from '../tileshape.js';
import * as dm from '../../core/dmath.js';

const K = MT + 2 * KEEP, KK = K * K, QPI = Math.PI / 4, LN_A = 25.328436022934504;   // (ln 1e11: the drainage's scale)
const canShare = typeof SharedArrayBuffer !== 'undefined' && (typeof crossOriginIsolated === 'undefined' || crossOriginIsolated);

function alloc(Type, n, shared) {
  if (shared && canShare) return new Type(new SharedArrayBuffer(n * Type.BYTES_PER_ELEMENT));
  return new Type(n);
}

// an empty refinement of level L (2^L tiles across a face)
export function newRefine(L, shared = true) {
  const n = 1 << L, nt = 6 * n * n;
  return { version: TILE_VERSION, L, n, K, h: alloc(Int16Array, nt * KK, shared), rw: alloc(Uint8Array, nt * KK, shared), done: new Uint8Array(nt) };
}
export const tileIndex = (R, face, ti, tj) => (face * R.n + tj) * R.n + ti;

// a tile's packed arrays (from a runTile result), for posting from a worker
export function packTile(t) {
  const h = new Int16Array(KK), rw = new Uint8Array(KK);
  for (let o = 0; o < KK; o++) {
    h[o] = Math.max(-32767, Math.min(32767, Math.round(t.h[o])));
    rw[o] = (t.rockC[o] & 31) | (t.water[o] << 5);
  }
  return { face: t.face, ti: t.ti, tj: t.tj, h, rw };
}
export function putTile(R, p) {
  const T = tileIndex(R, p.face, p.ti, p.tj);
  R.h.set(p.h, T * KK); R.rw.set(p.rw, T * KK); R.done[T] = 1;
}
export const complete = (R) => R.done.every((x) => x);

// for IndexedDB (a SharedArrayBuffer can't be stored): plain copies, and back
export function toStorable(R) { return { version: R.version, L: R.L, n: R.n, K: R.K, h: Int16Array.from(R.h), rw: Uint8Array.from(R.rw), riv: R.riv || null }; }
export function fromStorable(o) {
  const R = newRefine(o.L);
  R.h.set(o.h); R.rw.set(o.rw); R.done.fill(1);
  R.riv = o.riv || null;
  return R;
}

// ---- the refinement's rivers: where its own water gathers (at least RIVER_A m^2, rain-weighted:
// a stream ~50 m wide; the creeks finer down are the pyramid's), each river cell a smooth curve
// from halfway to its main inflow, through it, to halfway to the cell it drains into (the
// valley its water cut, not the world sim's cell lines), with the ground along it and its water
export const RIVER_A = 1e8, RIVER_REC = 13;   // (a record: 3 points, 3 heights, the water)
export function tileRivers(T) {
  const fl = T.fl, rc = T.rcv, H = T.h, s = 2 / (1 << T.L), du = s / MT;
  const u0 = -1 + T.ti * s - KEEP * du, v0 = -1 + T.tj * s - KEEP * du;
  const thr = Math.max(0, Math.round(255 * dm.log(RIVER_A) / LN_A)), out = [], keys = [], d = [0, 0, 0];
  // (each record's cell and the cell it drains into, by their place in the level's whole grid:
  // so the rivers' records chain from tile to tile)
  const gn = (1 << T.L) * MT, gkey = (i, j) => (T.face * gn + (T.tj * MT + j - KEEP)) * gn + (T.ti * MT + i - KEEP);
  const nbI = (k) => { const kk = k >= 4 ? k + 1 : k; return (kk % 3) - 1; }, nbJ = (k) => { const kk = k >= 4 ? k + 1 : k; return ((kk / 3) | 0) - 1; };
  const at = (fi, fj) => { dirFromFaceUV(T.face, u0 + (fi + 0.5) * du, v0 + (fj + 0.5) * du, d); out.push(d[0], d[1], d[2]); };
  for (let j = KEEP; j < KEEP + MT; j++) for (let i = KEEP; i < KEEP + MT; i++) {
    const o = j * K + i, k = rc[o];
    if (fl[o] < thr || k === 255) continue;
    const ri = i + nbI(k), rj = j + nbJ(k);
    let ui = i, uj = j, uf = -1;
    for (let q = 0; q < 8; q++) {
      const ni = i + nbI(q), nj = j + nbJ(q), no = nj * K + ni, nk = rc[no];
      if (nk === 255 || ni + nbI(nk) !== i || nj + nbJ(nk) !== j || fl[no] < thr) continue;
      if (fl[no] > uf) { uf = fl[no]; ui = ni; uj = nj; }
    }
    at((ui + i) / 2, (uj + j) / 2); at(i, j); at((i + ri) / 2, (j + rj) / 2);
    out.push((H[uj * K + ui] + H[o]) / 2, H[o], (H[o] + H[rj * K + ri]) / 2, dm.exp(fl[o] / 255 * LN_A));
    keys.push(gkey(i, j), gkey(ri, rj));
  }
  return { rec: Float32Array.from(out), keys: Float64Array.from(keys) };
}
// the tiles' rivers gathered and indexed by the world sim's cells (N a face, world radius Rw):
// { rec, start, idx } (the records of cell c: idx[start[c] .. start[c + 1]])
export function riverIndex(parts, N, Rw) {
  let total = 0;
  for (const p of parts) total += p.rec.length;
  const rec = new Float32Array(total), keys = new Float64Array(2 * total / RIVER_REC);
  let o = 0, ok = 0;
  for (const p of parts) { rec.set(p.rec, o); o += p.rec.length; keys.set(p.keys, ok); ok += p.keys.length; }
  const G = new GridLite(N, Rw), m = total / RIVER_REC, cellOf = new Int32Array(m), start = new Int32Array(G.n + 1);
  for (let r = 0; r < m; r++) { const b = r * RIVER_REC + 3; cellOf[r] = G.cellAt(rec[b], rec[b + 1], rec[b + 2]); start[cellOf[r] + 1]++; }
  for (let c = 0; c < G.n; c++) start[c + 1] += start[c];
  const fill = start.slice(0, G.n), idx = new Int32Array(m);
  for (let r = 0; r < m; r++) idx[fill[cellOf[r]]++] = r;
  // (each one's half width, m, as the creeks': a stream of 1e8 m^2 ~25 m, the greatest ~600 m;
  // and its size 0..1)
  const half = new Float32Array(m), size = new Float32Array(m), lo = dm.log(RIVER_A), span = dm.log(1e11) - lo;
  for (let r = 0; r < m; r++) {
    const A = rec[r * RIVER_REC + 12], la = dm.log(A);
    half[r] = 0.5 + 0.9 * dm.exp(0.45 * (la - dm.log(6e4)));
    size[r] = Math.max(0, Math.min(1, (la - lo) / span));
  }
  // (how far up its river each record lies, in its channel's widths from where the river ends:
  // the meanders' phase, continuous down the river whatever its width does; refine.js's readers
  // and terrain.js lay the meander trace along it)
  const byKey = new Map();
  for (let r = 0; r < m; r++) byKey.set(keys[2 * r], r);
  const phase = new Float32Array(m).fill(NaN), stack = [];
  for (let r0 = 0; r0 < m; r0++) {
    if (phase[r0] === phase[r0]) continue;
    // (down the river to a record whose phase is known, or to its end)
    let r = r0;
    stack.length = 0;
    while (r >= 0 && phase[r] !== phase[r]) { stack.push(r); const dn = byKey.get(keys[2 * r + 1]); r = dn === undefined || stack.length > 1e6 ? -1 : dn; if (r >= 0 && stack.includes(r)) r = -1; }
    let ph = r >= 0 ? phase[r] : 0, prev = r;
    for (let k = stack.length - 1; k >= 0; k--) {
      const q = stack[k], b = q * RIVER_REC + 3;
      let len = 0;
      if (prev >= 0) { const c = prev * RIVER_REC + 3, dx = rec[b] - rec[c], dy = rec[b + 1] - rec[c + 1], dz = rec[b + 2] - rec[c + 2]; len = Math.sqrt(dx * dx + dy * dy + dz * dz) * Rw; }
      ph += len / (2 * half[q]);
      phase[q] = ph; prev = q;
    }
  }
  // (each record's next down its river, and its main inflow: the one bringing the most water)
  const dn = new Int32Array(m).fill(-1), up = new Int32Array(m).fill(-1);
  for (let r = 0; r < m; r++) { const d = byKey.get(keys[2 * r + 1]); if (d !== undefined && d !== r) dn[r] = d; }
  for (let r = 0; r < m; r++) { const d = dn[r]; if (d >= 0 && (up[d] < 0 || size[r] > size[up[d]])) up[d] = r; }
  return { rec, start, idx, half, size, phase, big: bigChannels(rec, half, size, phase, dn, up, G, Rw) };
}

// ---- the great rivers' winding channels: a river too wide for its meander belt to be found
// round its valley's line (terrain.js lays smaller ones' meanders as it samples) has its
// channel built here: the meander trace (meanders.js) laid along its records by their phase,
// offset across by its width, as short segments indexed by the world sim's cells. Each segment:
// its ends (directions), the river's half width, size and bank height there; and its kind
// (0 the channel, 1 an oxbow) and the oxbow's age
export const BIG_W = 250, BIG_REC = 11;
function bigChannels(rec, half, size, phase, dn, up, G, Rw) {
  const F = meanderField(), m = half.length, segs = [], P = F.P, has = new Uint8Array(m);
  // (the channel, every other point of it: a segment about a width long; and its younger oxbows)
  const thin = (L) => ({ ...L, x: L.x.filter((v, k) => k % 2 === 0), y: L.y.filter((v, k) => k % 2 === 0) });
  const lines = [thin(F.lines[0]), ...F.lines.slice(1).filter((L) => L.age < 0.5).map(thin)];
  const isBig = (r) => r >= 0 && 2 * half[r] >= BIG_W;
  // (the river's line smoothed over two meander wavelengths along its main stem: the belt
  // follows the valley at its own scale, not every turn of the cells)
  const S = new Float64Array(3 * m), Sok = new Uint8Array(m), W = 2 * 18;
  for (let r = 0; r < m; r++) {
    if (!isBig(r)) continue;
    let sx = 0, sy = 0, sz = 0, sw = 0;
    for (const dir of [dn, up]) {
      let q = dir === dn ? r : up[r];
      while (q >= 0 && Math.abs(phase[q] - phase[r]) <= W / 2) {
        const b = q * RIVER_REC + 3, wt = 1 - Math.abs(phase[q] - phase[r]) / (W / 2 + 1e-9);
        sx += wt * rec[b]; sy += wt * rec[b + 1]; sz += wt * rec[b + 2]; sw += wt;
        q = dir[q];
      }
    }
    if (sw > 0) { const l = Math.sqrt(sx * sx + sy * sy + sz * sz); S[3 * r] = sx / l; S[3 * r + 1] = sy / l; S[3 * r + 2] = sz / l; Sok[r] = 1; }
  }
  // each stem (a chain of great records from where the river grows great down to its end, or to a
  // stem already laid: a tributary meets its trunk), the trace laid along it whole: one channel
  const visited = new Uint8Array(m), tmp = [0, 0, 0];
  for (let r0 = 0; r0 < m; r0++) {
    if (!Sok[r0] || visited[r0] || isBig(up[r0]) && Sok[up[r0]]) continue;
    const nodes = [];
    for (let q = r0; q >= 0 && Sok[q]; q = dn[q]) { nodes.push(q); if (visited[q]) break; visited[q] = 1; }
    if (nodes.length < 2) continue;
    const n = nodes.length, ph = nodes.map((q) => phase[q]);
    // (its heights smoothed along it, so its slope reads the valley's, not the cells')
    const H = nodes.map((q, i) => { let sh = 0, sw = 0; for (let j = Math.max(0, i - 6); j <= Math.min(n - 1, i + 6); j++) { sh += rec[nodes[j] * RIVER_REC + 10]; sw++; } return sh / sw; });
    const Amp = nodes.map((q, i) => {
      const a = nodes[Math.max(0, i - 4)], b = nodes[Math.min(n - 1, i + 4)], ia = 3 * a, ib = 3 * b;
      const dist = Math.sqrt((S[ia] - S[ib]) ** 2 + (S[ia + 1] - S[ib + 1]) ** 2 + (S[ia + 2] - S[ib + 2]) ** 2) * Rw;
      const sl = dist > 0 ? Math.abs(H[Math.max(0, i - 4)] - H[Math.min(n - 1, i + 4)]) / dist : 0;
      return 1 - dm.smoothstep(3e-4, 2e-3, sl);
    });
    for (const q of nodes) has[q] = 1;
    // (the stem's point at a phase: between the nodes whose phases hold it, up the stem)
    const at = (p, o) => {
      let lo = 0, hi = n - 1;   // (phases fall down the stem: ph[0] the highest)
      if (p >= ph[0]) hi = 1; else if (p <= ph[n - 1]) lo = n - 2;
      else { while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (ph[mid] >= p) lo = mid; else hi = mid; } }
      const iu = lo, id = hi, f = ph[iu] > ph[id] ? (p - ph[id]) / (ph[iu] - ph[id]) : 0;
      const u = 3 * nodes[iu], d = 3 * nodes[id];
      o.x = S[d] + f * (S[u] - S[d]); o.y = S[d + 1] + f * (S[u + 1] - S[d + 1]); o.z = S[d + 2] + f * (S[u + 2] - S[d + 2]);
      o.tx = S[u] - S[d]; o.ty = S[u + 1] - S[d + 1]; o.tz = S[u + 2] - S[d + 2];
      o.w = 2 * (half[nodes[id]] + f * (half[nodes[iu]] - half[nodes[id]])); o.k = size[nodes[id]] + f * (size[nodes[iu]] - size[nodes[id]]);
      // (its belt widening from what the sampler's meanders give a river of BIG_W to its full
      // swing by twice that: no step where the one gives way to the other)
      const a0 = Math.min(1, 1800 / (BIG_W * F.half)), aw = Math.min(1, a0 + (1 - a0) * (o.w - BIG_W) / BIG_W);
      o.h = H[id] + f * (H[iu] - H[id]); o.A = (Amp[id] + f * (Amp[iu] - Amp[id])) * aw;
      return o;
    };
    const p0 = ph[n - 1], p1 = ph[0], o = {};
    lines.forEach((L, li) => {
      const nl = L.x.length;
      let prev = null;
      for (let per = Math.floor(p0 / P) - (li ? 1 : 0); per <= Math.floor(p1 / P); per++) for (let k = 0; k < nl; k++) {
        if (li && k === 0) prev = null;   // (an oxbow is a piece of channel, not a loop round the period)
        const pk = per * P + L.x[k];
        if (pk < p0 || pk > p1) { prev = null; continue; }
        at(pk, o);
        const cl = Math.sqrt(o.x * o.x + o.y * o.y + o.z * o.z), cx = o.x / cl, cy = o.y / cl, cz = o.z / cl;
        const ux = cy * o.tz - cz * o.ty, uy = cz * o.tx - cx * o.tz, uz = cx * o.ty - cy * o.tx, ul = Math.sqrt(ux * ux + uy * uy + uz * uz) || 1;
        const off = o.A * o.w * (L.y[k] - F.mid) / Rw;
        let px = cx + off * ux / ul, py = cy + off * uy / ul, pz = cz + off * uz / ul;
        const pl = Math.sqrt(px * px + py * py + pz * pz); px /= pl; py /= pl; pz /= pl;
        if (prev) segs.push(prev[0], prev[1], prev[2], px, py, pz, o.w / 2, o.k, o.h, li ? 1 : 0, L.age);
        prev = [px, py, pz];
      }
    });
  }
  const seg = Float32Array.from(segs), ns = seg.length / BIG_REC;
  if (!ns) return null;
  const cellOf = new Int32Array(ns), start = new Int32Array(G.n + 1);
  for (let q = 0; q < ns; q++) { const b = q * BIG_REC; cellOf[q] = G.cellAt((seg[b] + seg[b + 3]) / 2, (seg[b + 1] + seg[b + 4]) / 2, (seg[b + 2] + seg[b + 5]) / 2); start[cellOf[q] + 1]++; }
  for (let c = 0; c < G.n; c++) start[c + 1] += start[c];
  const fill = start.slice(0, G.n), idx = new Int32Array(ns);
  for (let q = 0; q < ns; q++) idx[fill[cellOf[q]]++] = q;
  return { seg, start, idx, has };
}

// cubic weights at t in [0, 1] for the four samples round it: B-spline (smooth, for a
// boundary: where a rock or the sea gives way to another) and Catmull-Rom (through the values:
// the heights)
function bspline(t, w) { const u = 1 - t, t2 = t * t, t3 = t2 * t; w[0] = u * u * u / 6; w[1] = (3 * t3 - 6 * t2 + 4) / 6; w[2] = (-3 * t3 + 3 * t2 + 3 * t + 1) / 6; w[3] = t3 / 6; }
function catrom(t, w) { const t2 = t * t, t3 = t2 * t; w[0] = (-t3 + 2 * t2 - t) / 2; w[1] = (3 * t3 - 5 * t2 + 2) / 2; w[2] = (-3 * t3 + 4 * t2 + t) / 2; w[3] = (t3 - t2) / 2; }

// a level of the terrain's tiles held sparsely (the pyramid's finer levels, near where the
// player is: gen/terrainTiles.js): tiles by index, each { h (Float32Array, m), rw } of a kept square
export class TileSet {
  constructor(L) { this.L = L; this.n = 1 << L; this.tiles = new Map(); }
  put(face, ti, tj, t) { this.tiles.set((face * this.n + tj) * this.n + ti, t); }
}

// reads a level by place: the refinement (dense, refine.js) or a TileSet. sample(d) sets: h (m),
// sea and lake (0..1: how much of it is under each), w (how fully the level covers the point: it
// fades out at the edges of what's there), and what rockAt reads (the tile weighing most there,
// the cells round the point and their weights). Read as smooth fields, not cells: heights
// through the cells' values, the water's and each rock's extent smoothly, so a coast or a
// contact is a curve, not the cells' outline
export class RefineReader {
  constructor(src) {
    this.src = src;
    this.sparse = src instanceof TileSet;
    this.s = 2 / src.n;
    this.du = this.s / MT;
    this.h = 0; this.sea = 0; this.lake = 0; this.w = 0; this.tH = null; this.tRW = null; this.tOff = 0;
    this.bx = new Float64Array(4); this.by = new Float64Array(4); this.cx = new Float64Array(4); this.cy = new Float64Array(4);
    this.rbx = new Float64Array(4); this.rby = new Float64Array(4); this.ri = 0; this.rj = 0;
  }

  sample(d) {
    this._begin();
    for (let f = 0; f < 6; f++) {
      const F = FACES[f], dn = d[0] * F.N[0] + d[1] * F.N[1] + d[2] * F.N[2];
      if (dn < 0.5) continue;
      this._face(f, dm.atan((d[0] * F.U[0] + d[1] * F.U[1] + d[2] * F.U[2]) / dn) / QPI, dm.atan((d[0] * F.V[0] + d[1] * F.V[1] + d[2] * F.V[2]) / dn) / QPI);
    }
    return this._end();
  }
  // the same at a face's (u, v) (it may run a little past the face's edge, into its tiles'
  // margins), reading only that face's tiles: for a grid laid out on the face (a tile's cells)
  sampleUV(f, u, v) { this._begin(); this._face(f, u, v); return this._end(); }

  _begin() { this._ws = 0; this._hs = 0; this._ss = 0; this._ls = 0; this._wb = -1; }
  _end() {
    if (this._ws <= 0) { this.w = 0; return false; }
    const ws = this._ws;
    this.h = this._hs / ws; this.sea = this._ss / ws; this.lake = this._ls / ws; this.w = Math.min(1, ws);
    return true;
  }
  _face(f, u, v) {
    const R = this.src, n = R.n, s = this.s, du = this.du, reach = (KEEP + 1) * du;
    if (u < -1 - reach || u > 1 + reach || v < -1 - reach || v > 1 + reach) return;
    const bx = this.bx, by = this.by, cx = this.cx, cy = this.cy;
    const i0 = Math.floor((u + 1) / s), j0 = Math.floor((v + 1) / s);
    for (let tj = j0 - 1; tj <= j0 + 1; tj++) {
      if (tj < 0 || tj >= n) continue;
      const fj = (v - (-1 + tj * s - KEEP * du)) / du - 0.5;
      if (fj < 1 || fj > K - 3) continue;
      for (let ti = i0 - 1; ti <= i0 + 1; ti++) {
        if (ti < 0 || ti >= n) continue;
        const fi = (u - (-1 + ti * s - KEEP * du)) / du - 0.5;
        if (fi < 1 || fi > K - 3) continue;
        const T = (f * n + tj) * n + ti;
        let H, RW, off;
        let tile = null;
        if (this.sparse) { tile = R.tiles.get(T); if (!tile) continue; H = tile.h; RW = tile.rw; off = 0; }
        else { if (R.done && !R.done[T]) continue; H = R.h; RW = R.rw; off = T * KK; }
        // (each tile weighs least at the edge of its kept square, fully a margin's width in)
        const w = Math.min(1, (Math.min(fi, K - 1 - fi) - 1) / (2 * KEEP)) * Math.min(1, (Math.min(fj, K - 1 - fj) - 1) / (2 * KEEP));
        if (w <= 0) continue;
        const i = Math.floor(fi), j = Math.floor(fj);
        bspline(fi - i, bx); bspline(fj - j, by); catrom(fi - i, cx); catrom(fj - j, cy);
        let hh = 0, sea = 0, lake = 0;
        for (let q = 0; q < 4; q++) {
          const row = off + (j - 1 + q) * K + i - 1;
          for (let p = 0; p < 4; p++) {
            hh += cx[p] * cy[q] * H[row + p];
            const wt = RW[row + p] >> 5;
            if (wt === 1) sea += bx[p] * by[q]; else if (wt === 2) lake += bx[p] * by[q];
          }
        }
        this._ws += w; this._hs += w * hh; this._ss += w * sea; this._ls += w * lake;
        if (w > this._wb) { this._wb = w; this.tH = H; this.tRW = RW; this.tOff = off; this.ri = i; this.rj = j; this.rbx.set(bx); this.rby.set(by); this.tTile = tile; this.tfi = fi; this.tfj = fj; }
      }
    }
  }

  // the nearest creek to the last sample: this level's drainage (its cells with at least
  // Acut m^2 of rain-weighted water, each a line to the cell it drains into, centre to centre)
  // within two cells: sets cd (distance, in cells), cA (its water, m^2), ch (the ground along it
  // there, m), and returns whether there's one
  creekAt(Acut) {
    const t = this.tTile;
    if (!t || !t.fl || !t.rcv) return false;
    const fi = this.tfi, fj = this.tfj, i0 = Math.floor(fi), j0 = Math.floor(fj);
    const thr = Math.max(0, Math.round(255 * dm.log(Acut) / LN_A)), fl = t.fl, rc = t.rcv, H = t.h;
    // (a cell's neighbour by its slot 0..7: di, dj = -1..1 row by row, skipping itself)
    const nbI = (k) => { const kk = k >= 4 ? k + 1 : k; return (kk % 3) - 1; }, nbJ = (k) => { const kk = k >= 4 ? k + 1 : k; return ((kk / 3) | 0) - 1; };
    let bd = 2, found = false;
    for (let j = j0 - 1; j <= j0 + 2; j++) for (let i = i0 - 1; i <= i0 + 2; i++) {
      if (i < 2 || j < 2 || i >= K - 2 || j >= K - 2) continue;
      const o = j * K + i, k = rc[o];
      if (fl[o] < thr || k === 255) continue;
      // the line through it, smoothly: from halfway to its main inflow (the neighbour draining
      // into it with the most water), round it, to halfway to the cell it drains into
      const ri = i + nbI(k), rj = j + nbJ(k);
      let ui = i, uj = j, uf = -1;
      for (let q = 0; q < 8; q++) {
        const ni = i + nbI(q), nj = j + nbJ(q), no = nj * K + ni, nk = rc[no];
        if (nk === 255 || ni + nbI(nk) !== i || nj + nbJ(nk) !== j || fl[no] < thr) continue;
        if (fl[no] > uf) { uf = fl[no]; ui = ni; uj = nj; }
      }
      const x0 = (ui + i) / 2, y0 = (uj + j) / 2, x2 = (i + ri) / 2, y2 = (j + rj) / 2;
      const h0 = (H[uj * K + ui] + H[o]) / 2, h2 = (H[o] + H[rj * K + ri]) / 2;
      for (let q = 0; q <= 8; q++) {
        const s2 = q / 8, a0 = (1 - s2) * (1 - s2), a1 = 2 * s2 * (1 - s2), a2 = s2 * s2;
        const dx = a0 * x0 + a1 * i + a2 * x2 - fi, dy = a0 * y0 + a1 * j + a2 * y2 - fj, d = Math.sqrt(dx * dx + dy * dy);
        if (d < bd) { bd = d; found = true; this.cd = d; this.cA = dm.exp(fl[o] / 255 * LN_A); this.ch = a0 * h0 + a1 * H[o] + a2 * h2; }
      }
    }
    return found;
  }

  // the rock at the last sample, for ground standing at h (m): each rock among the cells round
  // it by its smooth share there, raised where the ground stands on its side of the stack (the
  // higher cells' rock over the lower's: SnapshotSampler.rockAt's rule, on this level's grid,
  // where valleys are cut). el (-1..1): where the ground stands among its own lows and rises at
  // a finer scale (what was laid down lies in the lows: dep, the rocks that are deposits).
  // Sets rock2 / rockMix as rockAt does
  rockAt(h, out, el = 0, dep = null) {
    const H = this.tH, RW = this.tRW, bx = this.rbx, by = this.rby, base = this.tOff + (this.rj - 1) * K + this.ri - 1;
    const rk = this._rk || (this._rk = new Int32Array(16)), W = this._W || (this._W = new Float64Array(16)), Hs = this._H || (this._H = new Float64Array(16));
    let nr = 0, hb = 0, lo = 1e9, hi = -1e9;
    for (let q = 0; q < 4; q++) for (let p = 0; p < 4; p++) {
      const o = base + q * K + p, w = bx[p] * by[q], r = RW[o] & 31, hk = H[o];
      hb += w * hk; lo = Math.min(lo, hk); hi = Math.max(hi, hk);
      let k = 0;
      while (k < nr && rk[k] !== r) k++;
      if (k === nr) { rk[nr] = r; W[nr] = 0; Hs[nr] = 0; nr++; }
      W[k] += w; Hs[k] += w * hk;
    }
    out.rock2 = rk[0]; out.rockMix = 0;
    if (nr === 1) return rk[0];
    const span = Math.max(20, hi - lo), e = (h - hb) / span;
    let best = -1, bs = -1e9, sec = -1, ss = -1e9;
    for (let k = 0; k < nr; k++) {
      if (W[k] < 1e-6) continue;
      const rel = (Hs[k] / W[k] - hb) / span;
      let score = W[k] + 1.5 * e * rel;
      // (and by where the ground stands among its own lows and rises: cover strata and lava hold
      // the rises, the basement shows where valleys cut to it, deposits lie in the lows)
      if (el) score += 0.8 * el * (dep && dep.has(rk[k]) ? -1 : dm.clamp(4 * rel + ROCK_UP[rk[k]], -1, 1)) * Math.min(1, 2.5 * W[k]);
      if (score > bs) { sec = best; ss = bs; bs = score; best = rk[k]; } else if (score > ss) { ss = score; sec = rk[k]; }
    }
    if (sec >= 0) { out.rock2 = sec; out.rockMix = 0.5 * (1 - dm.smoothstep(0, 0.12, bs - ss)); }
    return best;
  }
}
