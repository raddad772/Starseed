// A world's refinement (localsim.js 'refine' tiles over the whole world, a few times finer than
// its world sim's grid): what the world's water cut into its surface, the sea that drowned it
// where it reached, the rock that shows, packed for the game. The arrays are SharedArrayBuffers
// where the page is cross-origin isolated (the terrain workers read one copy), and the reader
// finds a point's value by its place, blending the tiles that overlap there (across the cube's
// faces too: a tile reaches past its face's edge).
//
//   h   heights (m, Int16), per tile its kept square (MT + 2 KEEP a side)
//   rw  rock (the world sim's kinds, lithology.js: the low 5 bits) | water << 5 (1 sea, 2 lake)

import { FACES } from '../cubesphere.js';
import { MT, KEEP, TILE_VERSION } from '../tileshape.js';
import * as dm from '../../core/dmath.js';

const K = MT + 2 * KEEP, KK = K * K, QPI = Math.PI / 4;
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
export function toStorable(R) { return { version: R.version, L: R.L, n: R.n, K: R.K, h: Int16Array.from(R.h), rw: Uint8Array.from(R.rw) }; }
export function fromStorable(o) {
  const R = newRefine(o.L);
  R.h.set(o.h); R.rw.set(o.rw); R.done.fill(1);
  return R;
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
        if (this.sparse) { const t = R.tiles.get(T); if (!t) continue; H = t.h; RW = t.rw; off = 0; }
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
        if (w > this._wb) { this._wb = w; this.tH = H; this.tRW = RW; this.tOff = off; this.ri = i; this.rj = j; this.rbx.set(bx); this.rby.set(by); }
      }
    }
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
      if (el) score += 0.45 * el * (dep && dep.has(rk[k]) ? -1 : dm.clamp(4 * rel, -1, 1));
      if (score > bs) { sec = best; ss = bs; bs = score; best = rk[k]; } else if (score > ss) { ss = score; sec = rk[k]; }
    }
    if (sec >= 0) { out.rock2 = sec; out.rockMix = 0.5 * (1 - dm.smoothstep(0, 0.12, bs - ss)); }
    return best;
  }
}
