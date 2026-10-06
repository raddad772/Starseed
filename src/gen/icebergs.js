// Icebergs: calved where the world's glaciers reach the sea (its snapshot's ice on a cell beside an
// ocean cell: a tidewater front, its weight the ice's thickness there, standing for the ice flowing off),
// adrift through the sea round it (a breadth-first spread through ocean cells, falling off over BERG_SPREAD
// m: a berg's drift of tens to hundreds of km, at the world's 1/64), melting where the sea is warm.
// Placed per cell of a grid on each cube face (BERG_CELL m): how many by the density there, each by its
// cell's hash: size (a power law, 15-250 m long), shape, turn. World state: the seed and the season.
import * as dm from '../core/dmath.js';
import { GridLite } from './worldsim/grid.js';
import { faceUV } from './liquidice.js';

export const BERG_CELL = 512, BERG_SPREAD = 2500, BERG_SHAPES = 16;

// the bergs' density over the world sim's grid (per BERG_CELL cell at a front ~2), cached on the sampler
export function bergDensity(S) {
  if (S._bergs !== undefined) return S._bergs;
  const s = S.s;
  if (!s.ice || !s.ocean) return (S._bergs = null);
  const G = S.G || new GridLite(s.N, s.R), n = G.n, out = new Float32Array(n), nb = new Int32Array(8);
  const q = [], hop = new Int32Array(n).fill(-1), w0 = new Float32Array(n);
  for (let c = 0; c < n; c++) {
    if (!(s.ice[c] > 20) || s.ocean[c]) continue;
    const k = G.nbrs(c, nb);
    for (let e = 0; e < k; e++) {
      const o = nb[e];
      if (!s.ocean[o]) continue;
      // (a front: the ice's thickness, ~ what flows off, against a 300 m glacier's)
      const w = Math.min(2, s.ice[c] / 300);
      if (w > w0[o]) w0[o] = w;
      if (hop[o] < 0) { hop[o] = 0; q.push(o); }
    }
  }
  if (!q.length) return (S._bergs = null);
  // (spread out through the sea, each cell the strongest front's reach)
  const sp = G.spacing, best = new Float32Array(n);
  for (const c of q) best[c] = w0[c];
  for (let i = 0; i < q.length; i++) {
    const c = q[i], k = G.nbrs(c, nb), next = best[c] * dm.exp(-sp / BERG_SPREAD);
    if (next < 0.005) continue;
    for (let e = 0; e < k; e++) {
      const o = nb[e];
      if (!s.ocean[o] || best[o] >= next) continue;
      best[o] = next;
      if (hop[o] < 0) { hop[o] = hop[c] + 1; q.push(o); }
      else q.push(o);
    }
  }
  for (let c = 0; c < n; c++) out[c] = best[c] * 2;
  S._bergs = { G, d: out };
  return S._bergs;
}

// a berg's frame where it floats (up unit), turned by yaw: its long way X, up Y, its width Z (right-
// handed: Z = X x Y), arrays; the drawn bergs' and the walker's boxes alike
export function bergBasis(up, yaw, X, Y, Z) {
  const ax = Math.abs(up[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  let e1 = [ax[1] * up[2] - ax[2] * up[1], ax[2] * up[0] - ax[0] * up[2], ax[0] * up[1] - ax[1] * up[0]];
  const l = dm.hypot(e1[0], e1[1], e1[2]);
  e1 = [e1[0] / l, e1[1] / l, e1[2] / l];
  const e2 = [up[1] * e1[2] - up[2] * e1[1], up[2] * e1[0] - up[0] * e1[2], up[0] * e1[1] - up[1] * e1[0]];
  const c = dm.cos(yaw), s = dm.sin(yaw);
  for (let i = 0; i < 3; i++) { X[i] = e1[i] * c + e2[i] * s; Y[i] = up[i]; }
  Z[0] = X[1] * Y[2] - X[2] * Y[1]; Z[1] = X[2] * Y[0] - X[0] * Y[2]; Z[2] = X[0] * Y[1] - X[1] * Y[0];
}

const hash = (a, b, c, d) => {
  let h = (Math.imul(a, 0x8da6b343) ^ Math.imul(b, 0xd8163841) ^ Math.imul(c, 0xcb1ab31f) ^ Math.imul(d, 0x165667b1)) >>> 0;
  h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d) >>> 0; h = Math.imul(h ^ (h >>> 12), 0x297a2d39) >>> 0;
  return (h ^ (h >>> 15)) >>> 0;
};

// the bergs within radius (m) of centre (unit, body-fixed) on a world of radius R (the sea's), its
// snapshot sampler S; warm(dir) how much the sea's warmth has melted them there (0 none .. 1 all); each to
// put({ dir (unit: where it floats), len, wid, hgt (above the water, m), yaw, shape, id })
export function bergsNear(S, R, centre, radius, warm, put) {
  const B = bergDensity(S);
  if (!B) return;
  const f = faceUV([centre[0] * R, centre[1] * R, centre[2] * R], {}), du = BERG_CELL / R;
  const ax = f.ax, b = (ax + 1) % 3, d = (ax + 2) % 3, span = Math.ceil(radius / BERG_CELL) + 1;
  const i0 = Math.floor(f.u / du), j0 = Math.floor(f.v / du), uv = { face: 0, u: 0, v: 0 }, dir = [0, 0, 0];
  for (let i = i0 - span; i <= i0 + span; i++) for (let j = j0 - span; j <= j0 + span; j++) {
    // (the cell's middle, on its face: a cell of another face is that face's own to place)
    const u = (i + 0.5) * du, v = (j + 0.5) * du;
    if (Math.abs(u) > 1 || Math.abs(v) > 1) continue;
    const l = Math.sqrt(1 + u * u + v * v);
    dir[ax] = f.sg / l; dir[b] = f.sg * u / l; dir[d] = f.sg * v / l;
    const dx = dir[0] - centre[0], dy = dir[1] - centre[1], dz = dir[2] - centre[2];
    if ((dx * dx + dy * dy + dz * dz) * R * R > (radius + BERG_CELL) ** 2) continue;
    const dens = B.G.sample(B.d, dir, uv) * (1 - warm(dir));
    if (!(dens > 0.01)) continue;
    let h = hash(f.face, i + 65536, j + 65536, 0xb3e6);
    const rnd = () => { h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d) >>> 0; h = Math.imul(h ^ (h >>> 12), 0x297a2d39) >>> 0; h = (h ^ (h >>> 15)) >>> 0; return h / 4294967296; };
    const n = Math.floor(dens + rnd());
    for (let k = 0; k < n; k++) {
      const uu = u + (rnd() - 0.5) * du, vv = v + (rnd() - 0.5) * du, ll = Math.sqrt(1 + uu * uu + vv * vv);
      const p = [0, 0, 0];
      p[ax] = f.sg / ll; p[b] = f.sg * uu / ll; p[d] = f.sg * vv / ll;
      // (its size: many small, few big, 15-250 m long; a fifth or so of it above the water)
      const len = Math.min(250, 15 * dm.pow(1 - rnd() * 0.999, -1 / 1.3)), wid = len * (0.45 + 0.5 * rnd()), hgt = len * (0.12 + 0.15 * rnd());
      put({ dir: p, len, wid, hgt, yaw: rnd() * 6.2832, shape: Math.floor(rnd() * BERG_SHAPES), id: h });
    }
  }
}
