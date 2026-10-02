// The ground near the player as a volume (terrain beyond the heightmap): within a couple of
// hundred metres the surface is the zero of a 3D density field (positive in rock), meshed by
// surface nets, so it can have true cliffs, overhangs and caves; further out the heightfield
// draws the same world without them.
//
// The field is world state, not the near field's: a pure function of the body-fixed point,
// built on the terrain generator's heightfield and the rock there, so the same cliff stands
// there whoever looks. The near field only chooses where it's meshed, on a lattice of 1 m cells
// in a local frame (an anchor on the datum sphere and its east, up and north): lattice point
// (i, j, k) is anchor + i east + j up + k north, and every column (i, k) reads the heightfield
// once. Workers mesh it; the physics samples the same lattice for collision.
//
//   cliffs   where the ground is steep and the rock hard, the slope steps into treads and
//            risers (near-vertical faces a few metres to a dozen high) wandering along the
//            contours
//   strata   on those faces hard beds stand out and soft ones are cut back (ledges, overhangs),
//            the beds dipping a little; at the sea's level the waves cut a notch (sea caves);
//            faces knobbly, not planed. All sideways: a point reads the terraced surface a
//            little up or down the slope from where it is, by an amount that changes with
//            height, so a face is pushed out or cut back but a tread never rises
//   caves    tunnels where two noise fields are both near zero: karst in limestone, lava tubes
//            in basalt, rare in other rock; opening where they meet hillsides and cliffs

import * as dm from '../core/dmath.js';
import { Noise3 } from '../core/noise.js';
import { Rng, hashInts } from '../core/rng.js';
import { S_LEN, S_H, S_WDEPTH, S_MOUNT, S_ROUGH, S_SAND, S_ICE } from './terrain.js';
import { ROCKS } from './worldsim/lithology.js';

export const VCHUNK = 32;          // cells per chunk side (1 m cells)
const MINW = 2;                    // the heightfield's band limit for the base surface (m)
const B = 2;                       // the density grid's border (cells) round a chunk
const GN = VCHUNK + 1 + 2 * B;     // density samples per axis

// how each rock stands: hardness (cliffs, ledges) and how readily it holds caves
const ROCK_HARD = ROCKS.map((r) => Math.max(0, Math.min(1, 1.25 - 0.4 * r.k)));
const ROCK_CAVE = ROCKS.map((r) => ({ limestone: 1, chalk: 0.6, basalt: 0.5, sandstone: 0.25, andesite: 0.15, granite: 0.06 }[r.name] ?? 0.03));

const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// a local frame on the surface at body-fixed point pos: { o (on the datum sphere), e, u, n },
// right-handed (e x u = n, as the lattice's x, y, z: the mesh's triangles face out of the rock)
export function anchorAt(pos, R) {
  const l = Math.sqrt(pos[0] * pos[0] + pos[1] * pos[1] + pos[2] * pos[2]);
  const u = [pos[0] / l, pos[1] / l, pos[2] / l];
  const ref = Math.abs(u[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  let e = [ref[1] * u[2] - ref[2] * u[1], ref[2] * u[0] - ref[0] * u[2], ref[0] * u[1] - ref[1] * u[0]];
  const el = Math.sqrt(e[0] * e[0] + e[1] * e[1] + e[2] * e[2]); e = [e[0] / el, e[1] / el, e[2] / el];
  const n = [e[1] * u[2] - e[2] * u[1], e[2] * u[0] - e[0] * u[2], e[0] * u[1] - e[1] * u[0]];
  return { o: [u[0] * R, u[1] * R, u[2] * R], e, u, n };
}

export class VolumeField {
  constructor(gen, anchor) {
    this.gen = gen;
    this.a = anchor;
    this.R = gen.R;
    const rng = new Rng(gen.p.seed);
    this.nStep = new Noise3(rng.seed32('vol-step'));
    this.nRub = new Noise3(rng.seed32('vol-rubble'));
    this.nCa = new Noise3(rng.seed32('vol-cave-a'));
    this.nCb = new Noise3(rng.seed32('vol-cave-b'));
    this.nReg = new Noise3(rng.seed32('vol-cave-region'));
    this.bedSeed = rng.seed32('vol-beds');
    this.hasSea = !!gen.p.liquid && gen.contThreshold > -1e8;
    this.s = new Float64Array(S_LEN);
    this.base = new Map();   // column -> { H, hard, cave }
    this.terr = new Map();   // column -> { Hc, wc, s8, cm, dip }
    this.cols = new Map();   // column -> { ...terr, gc }
    this.pts = new Map();    // lattice point -> density (the physics' cache)
  }

  _key(i, k) { return (i + 32768) * 65536 + (k + 32768); }
  _trim() { if (this.base.size > 1500000) { this.base.clear(); this.terr.clear(); this.cols.clear(); } if (this.pts.size > 200000) this.pts.clear(); }

  // the heightfield and the rock under column (i, k)
  baseAt(i, k) {
    const key = this._key(i, k);
    let b = this.base.get(key);
    if (b) return b;
    const a = this.a, g = this.gen, s = this.s;
    let x = a.o[0] + i * a.e[0] + k * a.n[0], y = a.o[1] + i * a.e[1] + k * a.n[1], z = a.o[2] + i * a.e[2] + k * a.n[2];
    const l = Math.sqrt(x * x + y * y + z * z); x /= l; y /= l; z /= l;
    g.sample(x, y, z, MINW, s);
    let hard, cave;
    if (g.snap) {
      const rt = g.snap.rockAt(x, y, z, s[S_H] / g.hScale);
      hard = ROCK_HARD[rt] ?? 0.6; cave = ROCK_CAVE[rt] ?? 0.05;
      if (g.snap.ice(x, y, z) > 10) { hard *= 0.25; cave = 0; }
    } else {
      hard = Math.min(1, 0.45 + 0.4 * s[S_MOUNT] + 0.25 * s[S_ROUGH]); cave = 0.15;
    }
    // (blown sand is loose: no cliffs, no caves in a dune)
    if (s[S_SAND] > 0) { hard *= 1 - s[S_SAND]; cave *= 1 - s[S_SAND]; }
    // (nor on a glacier: its ice is smooth)
    if (s[S_ICE] > 0) { const k = 1 - dm.smoothstep(0, 4, s[S_ICE]); hard *= k; cave *= k; }
    b = { H: s[S_H], hard, cave };
    this.base.set(key, b);
    return b;
  }

  // the column's terraced surface: treads and risers where it's steep and the rock is hard
  terrAt(i, k) {
    const key = this._key(i, k);
    let t = this.terr.get(key);
    if (t) return t;
    const b = this.baseAt(i, k), H = b.H;
    const sx = (this.baseAt(i + 4, k).H - this.baseAt(i - 4, k).H) / 8, sz = (this.baseAt(i, k + 4).H - this.baseAt(i, k - 4).H) / 8;
    const s8 = Math.sqrt(sx * sx + sz * sz);
    const a = this.a, px = a.o[0] + i * a.e[0] + k * a.n[0], py = a.o[1] + i * a.e[1] + k * a.n[1], pz = a.o[2] + i * a.e[2] + k * a.n[2];
    const wc = smooth(0.28, 0.65, s8) * b.hard;
    let Hc = H;
    if (wc > 0) {
      const S = 5 + 9 * (0.5 + 0.5 * this.nStep.noise(px / 420, py / 420, pz / 420));
      const warp = 2 * this.nStep.noise(px / 23 + 31.7, py / 23, pz / 23);
      const tt = (H + warp) / S, fl = Math.floor(tt);
      let Ht = S * (fl + smooth(0.41, 0.59, tt - fl)) - warp;
      Ht += 0.15 * (H - Ht);                 // (treads keep a little of the slope)
      Hc = H + wc * (Ht - H);
    }
    const cm = b.cave * smooth(0.1, 0.45, this.nReg.noise(px / 320, py / 320, pz / 320));
    const dip = 1.2 * this.nStep.noise(px / 180 + 5.3, py / 180, pz / 180);
    t = { Hc, wc, s8, cm, dip };
    this.terr.set(key, t);
    return t;
  }

  // the column with the slope of its terraced surface (how far a face is from vertical)
  colAt(i, k) {
    const key = this._key(i, k);
    let c = this.cols.get(key);
    if (c) return c;
    const t = this.terrAt(i, k);
    const gx = (this.terrAt(i + 1, k).Hc - this.terrAt(i - 1, k).Hc) / 2, gz = (this.terrAt(i, k + 1).Hc - this.terrAt(i, k - 1).Hc) / 2;
    const gc = Math.sqrt(gx * gx + gz * gz);
    c = { Hc: t.Hc, wc: t.wc, s8: t.s8, cm: t.cm, dip: t.dip, gc, ux: gc > 1e-6 ? gx / gc : 0, uz: gc > 1e-6 ? gz / gc : 0 };
    this.cols.set(key, c);
    return c;
  }

  // the terraced surface between columns (bilinear)
  hcAt(x, z) {
    const i = Math.floor(x), k = Math.floor(z), fx = x - i, fz = z - k;
    const a = this.terrAt(i, k).Hc, b = this.terrAt(i + 1, k).Hc, c = this.terrAt(i, k + 1).Hc, d = this.terrAt(i + 1, k + 1).Hc;
    return (a * (1 - fx) + b * fx) * (1 - fz) + (c * (1 - fx) + d * fx) * fz;
  }

  // bedding: +1 a hard bed, -1 a soft one, at radial height r (m)
  strata(r, dip) {
    const z = (r + dip) / 2.7, L = Math.floor(z), f = z - L;
    const h0 = hashInts(L + 1000000, this.bedSeed) / 4294967296, h1 = hashInts(L + 1000001, this.bedSeed) / 4294967296;
    return 2 * (h0 + (h1 - h0) * smooth(0.82, 1, f)) - 1;
  }

  // the bed's shade (for the colour banding on rock faces)
  bedShade(r, dip) { return hashInts(Math.floor((r + dip) / 2.7) + 2000000, this.bedSeed) / 4294967296; }

  // density at lattice point (i, j, k) of cell size s (m): positive in rock. Coarser cells
  // leave out what they can't hold (the finest rubble at 2 m, the rest and the beds' ledges
  // fading by 8 m, caves past 2 m), so far rings don't shimmer
  density(i, j, k, s = 1) {
    if (s !== 1) { i *= s; j *= s; k *= s; }
    const a = this.a, c = this.colAt(i, k);
    const px = a.o[0] + i * a.e[0] + j * a.u[0] + k * a.n[0];
    const py = a.o[1] + i * a.e[1] + j * a.u[1] + k * a.n[1];
    const pz = a.o[2] + i * a.e[2] + j * a.u[2] + k * a.n[2];
    const r = Math.sqrt(px * px + py * py + pz * pz) - this.R;
    let d = c.Hc - r;
    // (far from the column's surface its sign is the column's: the faces below stand out at most
    // ~10 m from it, and caves only hollow rock within ~95 m of the top; there, no more to read)
    const far = 14 + 2 * s;
    if (d < -far || (d > far && !(c.cm > 0.02 && s <= 2 && d < 97))) return d;
    if (c.wc > 0.01 && c.gc > 0.05 && s < 8) {
      // how far this height's face stands out (m): hard beds out, soft in, knobbly, the notch
      const fine = s < 2 ? 0.5 * this.nRub.noise(px / 2.3 + 7.1, py / 2.3, pz / 2.3) : 0;
      const coarse = s < 4 ? this.nRub.noise(px / 4.7, py / 4.7, pz / 4.7) : 0;
      let out = (s < 4 ? 1.5 : 0.75) * this.strata(r, c.dip) + 0.8 * (coarse + fine);
      if (this.hasSea) out -= 3 * dm.exp(-((r - 0.8) / 1.3) * ((r - 0.8) / 1.3));
      out *= c.wc;
      // ...by reading the terraced surface that far up the slope (into the cliff)
      d = this.hcAt(i + out * c.ux, k + out * c.uz) - r;
    }
    if (c.cm > 0.02 && s <= 2) {
      const depth = c.Hc - r;
      if (depth > -2 && depth < 95) {
        const q = 1 / 34;
        const n1 = this.nCa.noise(px * q, py * q, pz * q), n2 = this.nCb.noise(px * q + 17.3, py * q + 5.1, pz * q + 9.7);
        const open = Math.min(1, smooth(2, 7, depth) + smooth(0.35, 0.8, c.s8)) * smooth(95, 70, depth);
        const gk = c.cm * open;
        const tun = (0.085 - Math.max(Math.abs(n1), Math.abs(n2))) * 34 * gk - (1 - gk) * 40;
        if (-tun < d) d = -tun;
      }
    }
    return d;
  }

  // density anywhere in the local frame (trilinear between lattice points, as the mesh is)
  densityLocal(x, y, z) {
    const i = Math.floor(x), j = Math.floor(y), k = Math.floor(z), fx = x - i, fy = y - j, fz = z - k;
    const P = this.pts, at = (a, b, c) => {
      const key = ((a + 4096) * 8192 + (b + 4096)) * 8192 + (c + 4096);
      let v = P.get(key);
      if (v === undefined) { v = this.density(a, b, c); P.set(key, v); }
      return v;
    };
    this._trim();
    const c00 = at(i, j, k) * (1 - fx) + at(i + 1, j, k) * fx, c10 = at(i, j + 1, k) * (1 - fx) + at(i + 1, j + 1, k) * fx;
    const c01 = at(i, j, k + 1) * (1 - fx) + at(i + 1, j, k + 1) * fx, c11 = at(i, j + 1, k + 1) * (1 - fx) + at(i + 1, j + 1, k + 1) * fx;
    return (c00 * (1 - fy) + c10 * fy) * (1 - fz) + (c01 * (1 - fy) + c11 * fy) * fz;
  }

  // body-fixed point -> local frame coordinates (out: [x, y, z])
  toLocal(px, py, pz, out) {
    const a = this.a, dx = px - a.o[0], dy = py - a.o[1], dz = pz - a.o[2];
    out[0] = dx * a.e[0] + dy * a.e[1] + dz * a.e[2];
    out[1] = dx * a.u[0] + dy * a.u[1] + dz * a.u[2];
    out[2] = dx * a.n[0] + dy * a.n[1] + dz * a.n[2];
    return out;
  }
}

// the cliff weight at a direction (for what stands on the ground: flora keeps off the faces)
export function cliffWeightAt(gen, d, s) {
  const R = gen.R, k = 4 / R;
  const ref = Math.abs(d[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  let e = [ref[1] * d[2] - ref[2] * d[1], ref[2] * d[0] - ref[0] * d[2], ref[0] * d[1] - ref[1] * d[0]];
  const el = Math.sqrt(e[0] * e[0] + e[1] * e[1] + e[2] * e[2]); e = [e[0] / el, e[1] / el, e[2] / el];
  const n = [d[1] * e[2] - d[2] * e[1], d[2] * e[0] - d[0] * e[2], d[0] * e[1] - d[1] * e[0]];
  const h = (u, v) => gen.sample(d[0] + k * (u * e[0] + v * n[0]), d[1] + k * (u * e[1] + v * n[1]), d[2] + k * (u * e[2] + v * n[2]), MINW, s)[S_H];
  const sx = (h(1, 0) - h(-1, 0)) / 8, sz = (h(0, 1) - h(0, -1)) / 8;
  let hard = 0.8;
  if (gen.snap) hard = ROCK_HARD[gen.snap.rock(d[0], d[1], d[2])] ?? 0.6;
  return smooth(0.28, 0.65, Math.sqrt(sx * sx + sz * sz)) * hard;
}

// a gentle place to set a ship down within `range` m of direction d (nearest first): a
// direction, or null
export function gentleNear(gen, d, range = 600) {
  const s = new Float64Array(S_LEN), R = gen.R;
  const ref = Math.abs(d[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  let e = [ref[1] * d[2] - ref[2] * d[1], ref[2] * d[0] - ref[0] * d[2], ref[0] * d[1] - ref[1] * d[0]];
  const el = Math.sqrt(e[0] * e[0] + e[1] * e[1] + e[2] * e[2]); e = [e[0] / el, e[1] / el, e[2] / el];
  const n = [d[1] * e[2] - d[2] * e[1], d[2] * e[0] - d[0] * e[2], d[0] * e[1] - d[1] * e[0]];
  for (let r = 40; r <= range; r += 20) {
    for (let a = 0; a < 24; a++) {
      const th = a / 24 * 2 * Math.PI, u = r * dm.cos(th) / R, v = r * dm.sin(th) / R;
      let q = [d[0] + u * e[0] + v * n[0], d[1] + u * e[1] + v * n[1], d[2] + u * e[2] + v * n[2]];
      const l = Math.sqrt(q[0] * q[0] + q[1] * q[1] + q[2] * q[2]); q = [q[0] / l, q[1] / l, q[2] / l];
      const h = gen.sample(q[0], q[1], q[2], MINW, s)[S_H];
      if (h < 5 || s[S_WDEPTH] > 0) continue;
      if (cliffWeightAt(gen, q, s) > 0.01) continue;
      const k = 6 / R, hh = (uu, vv) => gen.sample(q[0] + k * (uu * e[0] + vv * n[0]), q[1] + k * (uu * e[1] + vv * n[1]), q[2] + k * (uu * e[2] + vv * n[2]), MINW, s)[S_H];
      { const gx = hh(1, 0) - hh(-1, 0), gz = hh(0, 1) - hh(0, -1); if (Math.sqrt(gx * gx + gz * gz) / 12 < 0.12) return q; }
    }
  }
  return null;
}

// the steepest hard-rock country on a world (a testing launch spot: the volume's cliffs,
// overhangs and caves): the lowest place below maxH with the highest cliff weight. A direction
export function findCliffCountry(gen, maxH = 2500) {
  const s = new Float64Array(S_LEN);
  let best = null;
  for (let i = 0; i < 12000; i++) {
    const z = 1 - (i + 0.5) / 6000, r = Math.sqrt(Math.max(0, 1 - z * z)), th = i * 2.399963, d = [dm.cos(th) * r, z, dm.sin(th) * r];
    const h = gen.sample(d[0], d[1], d[2], MINW, s)[S_H];
    if (h < 30 || h > maxH) continue;
    const w = cliffWeightAt(gen, d, s);
    if (!best || w > best.w + 0.05 || (w > best.w - 0.05 && h < best.h)) best = { d, w, h };
  }
  return best ? best.d : null;
}

function encodeColor(c) { return Math.max(0, Math.min(255, Math.round(Math.sqrt(Math.max(c, 0)) * 255))); }

// mesh chunk (ci, cj, ck) of the field by surface nets: one vertex per cell the surface crosses
// (the mean of its edge crossings), a quad per lattice edge it crosses. Vertices are relative to
// the chunk's corner (body-fixed axes); null when the chunk holds no surface
// level: the cell size 2^level m (the near field's rings: finest nearest)
export function buildVolumeChunk(field, ci, cj, ck, level = 0) {
  const N = VCHUNK, a = field.a, gen = field.gen, R = field.R, S = 1 << level;
  const i0 = ci * N, j0 = cj * N, k0 = ck * N;
  // (a chunk wholly above its columns' ground, or wholly in their rock where no cave reaches,
  // holds no surface: known from the columns and the chunk's corners, without its lattice)
  {
    let hlo = Infinity, hhi = -Infinity, cave = false;
    for (let z = 0; z < GN; z++) for (let x = 0; x < GN; x++) {
      const c = field.colAt((i0 + x - B) * S, (k0 + z - B) * S);
      if (c.Hc < hlo) hlo = c.Hc; if (c.Hc > hhi) hhi = c.Hc;
      if (c.cm > 0.02 && S <= 2) cave = true;
    }
    let rlo = Infinity, rhi = -Infinity;
    for (let q = 0; q < 8; q++) {
      const ii = (i0 - B + (q & 1 ? GN - 1 : 0)) * S, jj = (j0 - B + (q & 2 ? GN - 1 : 0)) * S, kk = (k0 - B + (q & 4 ? GN - 1 : 0)) * S;
      const px = a.o[0] + ii * a.e[0] + jj * a.u[0] + kk * a.n[0], py = a.o[1] + ii * a.e[1] + jj * a.u[1] + kk * a.n[1], pz = a.o[2] + ii * a.e[2] + jj * a.u[2] + kk * a.n[2];
      const r = Math.sqrt(px * px + py * py + pz * pz) - R;
      if (r < rlo) rlo = r; if (r > rhi) rhi = r;
    }
    const far = 14 + 2 * S + 2;
    if (rlo - hhi > far || (hlo - rhi > (cave ? 97 : far))) return null;
  }
  // density on the lattice, with a border (normals, the quads at the low edges)
  const D = new Float64Array(GN * GN * GN);
  let dmin = Infinity, dmax = -Infinity;
  for (let z = 0; z < GN; z++) for (let y = 0; y < GN; y++) for (let x = 0; x < GN; x++) {
    const v = field.density(i0 + x - B, j0 + y - B, k0 + z - B, S);
    D[(z * GN + y) * GN + x] = v;
    if (v < dmin) dmin = v; if (v > dmax) dmax = v;
  }
  if (dmin > 0 || dmax < 0) return null;
  const at = (x, y, z) => D[((z + B) * GN + (y + B)) * GN + (x + B)];
  // gradient at a lattice point (central differences)
  const grad = (x, y, z, o) => { o[0] = at(x + 1, y, z) - at(x - 1, y, z); o[1] = at(x, y + 1, z) - at(x, y - 1, z); o[2] = at(x, y, z + 1) - at(x, y, z - 1); };
  // cells -1..N-1 on each axis
  const CN = N + 1, cell = new Int32Array(CN * CN * CN).fill(-1);
  const P = [], Nr = [];
  const corner = new Float64Array(8), gtmp = [0, 0, 0];
  const EDGES = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
  const CO = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]];
  for (let z = -1; z < N; z++) for (let y = -1; y < N; y++) for (let x = -1; x < N; x++) {
    let mask = 0;
    for (let c = 0; c < 8; c++) { const v = at(x + CO[c][0], y + CO[c][1], z + CO[c][2]); corner[c] = v; if (v > 0) mask |= 1 << c; }
    if (mask === 0 || mask === 255) continue;
    let sx = 0, sy = 0, sz = 0, cnt = 0;
    for (const [p, q] of EDGES) {
      const vp = corner[p], vq = corner[q];
      if ((vp > 0) === (vq > 0)) continue;
      const t = vp / (vp - vq);
      sx += CO[p][0] + (CO[q][0] - CO[p][0]) * t; sy += CO[p][1] + (CO[q][1] - CO[p][1]) * t; sz += CO[p][2] + (CO[q][2] - CO[p][2]) * t;
      cnt++;
    }
    const fx = sx / cnt, fy = sy / cnt, fz = sz / cnt;
    // normal: the gradient, trilinear between the cell's corners' (pointing out of the rock)
    let gx = 0, gy = 0, gz = 0;
    for (let c = 0; c < 8; c++) {
      const w = (CO[c][0] ? fx : 1 - fx) * (CO[c][1] ? fy : 1 - fy) * (CO[c][2] ? fz : 1 - fz);
      grad(x + CO[c][0], y + CO[c][1], z + CO[c][2], gtmp);
      gx += w * gtmp[0]; gy += w * gtmp[1]; gz += w * gtmp[2];
    }
    cell[((z + 1) * CN + (y + 1)) * CN + (x + 1)] = P.length / 3;
    P.push(x + fx, y + fy, z + fz);
    Nr.push(-gx, -gy, -gz);
  }
  const nv = P.length / 3;
  if (!nv) return null;
  // quads: lattice edges from the chunk's own points (0..N-1) that the surface crosses
  const idx = [];
  const ci3 = (x, y, z) => cell[((z + 1) * CN + (y + 1)) * CN + (x + 1)];
  for (let z = 0; z < N; z++) for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const v0 = at(x, y, z), s0 = v0 > 0;
    for (let ax = 0; ax < 3; ax++) {
      const v1 = ax === 0 ? at(x + 1, y, z) : ax === 1 ? at(x, y + 1, z) : at(x, y, z + 1);
      if ((v1 > 0) === s0) continue;
      // the four cells round the edge (in the plane of the other two axes)
      let q;
      if (ax === 0) q = [ci3(x, y - 1, z - 1), ci3(x, y, z - 1), ci3(x, y, z), ci3(x, y - 1, z)];
      else if (ax === 1) q = [ci3(x - 1, y, z - 1), ci3(x - 1, y, z), ci3(x, y, z), ci3(x, y, z - 1)];
      else q = [ci3(x - 1, y - 1, z), ci3(x, y - 1, z), ci3(x, y, z), ci3(x - 1, y, z)];
      if (q[0] < 0 || q[1] < 0 || q[2] < 0 || q[3] < 0) continue;
      // wound to face out of the rock (toward the edge's empty end): the cells go round the
      // edge counterclockwise seen from its +axis end, so as listed the quad faces +axis
      if (s0) idx.push(q[0], q[1], q[2], q[0], q[2], q[3]);
      else idx.push(q[0], q[2], q[1], q[0], q[3], q[2]);
    }
  }
  if (!idx.length) return null;
  // to body-fixed axes, relative to the chunk's corner; colour and occlusion per vertex
  const ox = a.o[0] + S * (i0 * a.e[0] + j0 * a.u[0] + k0 * a.n[0]), oy = a.o[1] + S * (i0 * a.e[1] + j0 * a.u[1] + k0 * a.n[1]), oz = a.o[2] + S * (i0 * a.e[2] + j0 * a.u[2] + k0 * a.n[2]);
  const position = new Float32Array(nv * 3), nrm = new Int8Array(nv * 4), col = new Uint8Array(nv * 4), mat = new Uint8Array(nv * 4), ext = new Uint8Array(nv * 4), occ = new Uint8Array(nv);
  const s = new Float64Array(S_LEN), cc = [0, 0, 0], mm = new Float64Array(8), nrmV = [0, 0, 0];
  let minR = Infinity, maxR = -Infinity;
  for (let v = 0; v < nv; v++) {
    const lx = P[v * 3] * S, ly = P[v * 3 + 1] * S, lz = P[v * 3 + 2] * S;
    const bx = lx * a.e[0] + ly * a.u[0] + lz * a.n[0], by = lx * a.e[1] + ly * a.u[1] + lz * a.n[1], bz = lx * a.e[2] + ly * a.u[2] + lz * a.n[2];
    position[v * 3] = bx; position[v * 3 + 1] = by; position[v * 3 + 2] = bz;
    const Px = ox + bx, Py = oy + by, Pz = oz + bz, Pl = Math.sqrt(Px * Px + Py * Py + Pz * Pz);
    const r = Pl - R, ux = Px / Pl, uy = Py / Pl, uz = Pz / Pl;
    if (r < minR) minR = r; if (r > maxR) maxR = r;
    // normal to body-fixed axes
    const gx = Nr[v * 3], gy = Nr[v * 3 + 1], gz = Nr[v * 3 + 2];
    let nx = gx * a.e[0] + gy * a.u[0] + gz * a.n[0], ny = gx * a.e[1] + gy * a.u[1] + gz * a.n[1], nz = gx * a.e[2] + gy * a.u[2] + gz * a.n[2];
    const nl = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1; nx /= nl; ny /= nl; nz /= nl;
    nrm[v * 4] = Math.round(nx * 127); nrm[v * 4 + 1] = Math.round(ny * 127); nrm[v * 4 + 2] = Math.round(nz * 127);
    // the surface's colour and materials: the generator's, at this height, by this face's slope
    gen.sample(ux, uy, uz, MINW, s);
    s[S_H] = Math.max(r, 1); s[S_WDEPTH] = 0;
    const slope = Math.max(0, Math.min(1, 1 - (nx * ux + ny * uy + nz * uz)));
    nrmV[0] = nx; nrmV[1] = ny; nrmV[2] = nz;
    gen.shade(s, slope, cc, mm, nrmV);
    // rock faces banded by their beds
    const colm = field.colAt(Math.round(i0 * S + lx), Math.round(k0 * S + lz));
    if (mm[2] > 0.15 && colm.wc > 0.05) {
      const b = field.bedShade(r, colm.dip), k = 1 + (0.86 + 0.28 * b - 1) * Math.min(1, mm[2] * 1.5);
      cc[0] *= k * (1 + 0.05 * (b - 0.5)); cc[1] *= k; cc[2] *= k * (1 - 0.05 * (b - 0.5));
    }
    col[v * 4] = encodeColor(cc[0]); col[v * 4 + 1] = encodeColor(cc[1]); col[v * 4 + 2] = encodeColor(cc[2]); col[v * 4 + 3] = 0;
    mat[v * 4] = Math.round(mm[0] * 255); mat[v * 4 + 1] = Math.round(mm[1] * 255); mat[v * 4 + 2] = Math.round(mm[2] * 255); mat[v * 4 + 3] = Math.round(mm[3] * 255);
    ext[v * 4] = Math.round(Math.min(1, mm[5]) * 255); ext[v * 4 + 1] = Math.round(Math.min(1, mm[6]) * 255);
    ext[v * 4 + 2] = Math.round(Math.min(1, s[12] / 1.4) * 255); ext[v * 4 + 3] = Math.round((0.5 + 0.5 * s[10]) * 255);
    // sky: how much rock overhangs this point (probes straight up; caves and overhangs dark;
    // the far rings hold neither)
    let o = 0;
    if (S <= 2) {
      const W = [[2.5, 0.25], [6, 0.35], [14, 0.4]];
      for (const [h, w] of W) {
        const d = field.densityLocal(i0 * S + lx, j0 * S + ly + h, k0 * S + lz);
        o += w * smooth(-0.5, 0.5, d);
      }
    }
    occ[v] = Math.round(Math.min(1, o) * 255);
  }
  return {
    origin: [ox, oy, oz], position, nrm, col, mat, ext, occ,
    index: nv < 65536 ? Uint16Array.from(idx) : Uint32Array.from(idx),
    minH: minR, maxH: maxR,
  };
}

export function volumeTransferables(r) {
  return r ? [r.position.buffer, r.nrm.buffer, r.col.buffer, r.mat.buffer, r.ext.buffer, r.occ.buffer, r.index.buffer] : [];
}
