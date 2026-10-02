// A simulated world, packed for the game (WORLDSIM.md step 7): the world sim's
// results as flat typed arrays (cached, sent to the terrain workers), and a sampler
// the terrain generator reads instead of its noise.
//
//   on the fine grid   heights (m, the game's convention: real metres on the drawn
//                      sphere), lake surfaces, the exposed rock (or beach sand), ice
//                      thickness, rivers (discharge, 0..1 by log), a fresh melt sheet,
//                      local relief (for how rugged the fine detail is)
//   on the climate grid the yearly mean brought to sea level (K), rain (mm/yr), plant
//                      cover and its forest and open shares (life.js), cloud cover
//
// Versioned: a cache keyed by seed, body and SIM_VERSION drops stale ones.

import { GridLite } from './grid.js';
import { Noise3 } from '../../core/noise.js';

export const SIM_VERSION = 3;

// W: worldSim's result; body: the body
export function packSnapshot(W, body) {
  const G = W.G, n = G.n;
  const h = Float32Array.from(W.h);
  const water = new Float32Array(n).fill(-1e9);
  if (W.E && W.E.water) for (let c = 0; c < n; c++) if (!W.E.base[c] && W.E.water[c] - W.h[c] > 1) water[c] = W.E.water[c];
  const rock = W.rock ? Uint8Array.from(W.rock) : new Uint8Array(n);
  const ice = W.glaciers ? Float32Array.from(W.glaciers.ice) : new Float32Array(n);
  const river = new Float32Array(n);
  if (W.E && W.E.A) {
    let amax = 0;
    for (let c = 0; c < n; c++) if (!W.E.base[c] && W.E.A[c] > amax) amax = W.E.A[c];
    for (let c = 0; c < n; c++) if (!W.E.base[c] && amax > 0) river[c] = Math.max(0, Math.log(Math.max(W.E.A[c], 1e-30) / (amax * 1e-4)) / Math.log(1e4));
  }
  const melt = W.melt ? Float32Array.from(W.melt) : new Float32Array(n);
  // where each cell's water goes (river lines for channels at walking scale)
  const rcv = W.E && W.E.rcv ? Int32Array.from(W.E.rcv) : new Int32Array(n).fill(-1);
  const relief = new Float32Array(n);
  for (let c = 0; c < n; c++) { let r = 0; for (let e = G.nStart[c]; e < G.nStart[c + 1]; e++) r = Math.max(r, Math.abs(W.h[c] - W.h[G.nbr[e]])); relief[c] = r; }
  const out = { version: SIM_VERSION, path: W.path, N: G.N, R: G.R, h, water, rock, ice, river, melt, relief, rcv, Nc: 0 };
  // the flat-topped volcanoes eruptions under ice left (world.js)
  out.tuyas = (W.tuyas || []).map((t) => ({ d: t.d.slice(), top: t.top, r: t.r }));
  if (W.climate && W.Gc) {
    const Gc = W.Gc, m = Gc.n, lapse = body.terrain && body.terrain.climate ? body.terrain.climate.lapse ?? 0.0065 : 0.0065;
    out.Nc = Gc.N;
    out.Tsea = new Float32Array(m); out.P = Float32Array.from(W.climate.Pann);
    for (let c = 0; c < m; c++) out.Tsea[c] = W.climate.Tann[c] + (W.climate.sea[c] ? 0 : lapse * Math.max(0, W.climate.h ? W.climate.h[c] : 0));
    if (W.life) { out.cover = Float32Array.from(W.life.cover); out.forest = Float32Array.from(W.life.forest); out.open = Float32Array.from(W.life.open); }
    // cloud cover (for the render's clouds): more where it rains (rising air), clear over
    // deserts and the sinking subtropics, stratocumulus decks over cold-current seas
    out.cloud = new Float32Array(m);
    for (let c = 0; c < m; c++) out.cloud[c] = Math.min(0.95, Math.max(0.05, 0.1 + 0.8 * Math.sqrt(Math.max(0, W.climate.Pann[c]) / 2500) + 0.35 * (W.climate.upwell ? W.climate.upwell[c] : 0)));
    // and baked for the render here (off the main thread): the map the clouds read
    const cm = cloudMapPixels(out, 512);
    out.cloudPx = cm.px; out.cloudW = cm.w;
  }
  return out;
}

// the arrays a snapshot carries (for transfer lists and caching)
export function snapshotBuffers(s) {
  return ['h', 'water', 'rock', 'ice', 'river', 'melt', 'relief', 'rcv', 'Tsea', 'P', 'cover', 'forest', 'open', 'cloud', 'cloudPx'].filter((k) => s[k]).map((k) => s[k].buffer);
}

// reads a snapshot at any direction
export class SnapshotSampler {
  constructor(s) {
    this.s = s;
    this.G = new GridLite(s.N, s.R);
    this.Gc = s.Nc ? new GridLite(s.Nc, s.R) : null;
    this.nb = new Int32Array(8);
    this.cd = [0, 0, 0];
    // tuyas by the cell they stand in (and its neighbours: they reach a few km)
    this.tuyaAt = null;
    if (s.tuyas && s.tuyas.length) {
      this.tuyaAt = new Map();
      const put = (c, t) => { const l = this.tuyaAt.get(c); if (l) l.push(t); else this.tuyaAt.set(c, [t]); };
      for (const t of s.tuyas) {
        const c = this.G.cellAt(t.d[0], t.d[1], t.d[2]);
        put(c, t);
        const k = this.G.nbrs(c, this.nb);
        for (let e = 0; e < k; e++) put(this.nb[e], t);
      }
    }
    this.uv = { face: 0, u: 0, v: 0 };
    this.d = [0, 0, 0];
    // land cells with no sea beside them (where a dip below the datum is still dry land)
    const G = this.G, n = G.n, nb = this.nb, N = s.N;
    this.inland = new Uint8Array(n);
    for (let c = 0; c < n; c++) {
      if (s.h[c] < 0 && !(s.water[c] > -1e8)) continue;
      let sea = false;
      const i = c % N, j = Math.floor(c / N) % N;
      if (i > 0 && j > 0 && i < N - 1 && j < N - 1) {   // (inside a face: the 8 round it)
        for (let dj = -N; dj <= N && !sea; dj += N) for (let di = -1; di <= 1; di++) { const q = c + dj + di; if (s.h[q] < 0 && !(s.water[q] > -1e8)) { sea = true; break; } }
      } else {
        const k = G.nbrs(c, nb);
        for (let e = 0; e < k; e++) { const q = nb[e]; if (s.h[q] < 0 && !(s.water[q] > -1e8)) { sea = true; break; } }
      }
      if (!sea) this.inland[c] = 1;
    }
  }
  _d(x, y, z) { const d = this.d; d[0] = x; d[1] = y; d[2] = z; return d; }
  // smooth (bilinear) fields
  h(x, y, z) { return this.G.sample(this.s.h, this._d(x, y, z), this.uv); }
  relief(x, y, z) { return this.G.sample(this.s.relief, this._d(x, y, z), this.uv); }
  ice(x, y, z) { return this.G.sample(this.s.ice, this._d(x, y, z), this.uv); }
  river(x, y, z) { return this.G.sample(this.s.river, this._d(x, y, z), this.uv); }
  melt(x, y, z) { return this.G.sample(this.s.melt, this._d(x, y, z), this.uv); }
  // the nearest cell's (categories, and lakes: a lake's surface is level)
  cell(x, y, z) { return this.G.cellAt(x, y, z); }
  rock(x, y, z) { return this.s.rock[this.G.cellAt(x, y, z)]; }
  lake(x, y, z) { const w = this.s.water[this.G.cellAt(x, y, z)]; return w > -1e8 ? w : null; }
  // the lake level here: the cell's own lake (own), or a neighbouring cell's lake whose
  // centre is within a cell's spacing (it fills its basin out to where the ground rises
  // above it, so its shore is a contour, not the cells' outline), with q how far out
  // (0 at its centre, 1 a spacing away: the basin's rim); else null
  lakeLevel(x, y, z, out) {
    const G = this.G, s = this.s, c0 = G.cellAt(x, y, z);
    if (s.water[c0] > -1e8) { out.L = s.water[c0]; out.own = true; out.q = 0; return out; }
    let L = -1e9, q2 = 1;
    const lim = G.spacing / G.R, lim2 = lim * lim, nb = this.nb, cd = this.cd, k = G.nbrs(c0, nb);
    for (let e = 0; e < k; e++) {
      const q = nb[e], w = s.water[q];
      if (!(w > L)) continue;
      G.centre(q, cd);
      const dx = x - cd[0], dy = y - cd[1], dz = z - cd[2], d2 = dx * dx + dy * dy + dz * dz;
      if (d2 < lim2) { L = w; q2 = d2 / lim2; }
    }
    if (L < -1e8) return null;
    out.L = L; out.own = false; out.q = Math.sqrt(q2); return out;
  }
  // the climate grid's
  Tsea(x, y, z) { return this.Gc ? this.Gc.sample(this.s.Tsea, this._d(x, y, z), this.uv) : null; }
  rain(x, y, z) { return this.Gc ? this.Gc.sample(this.s.P, this._d(x, y, z), this.uv) : null; }
  cover(x, y, z) { return this.Gc && this.s.cover ? this.Gc.sample(this.s.cover, this._d(x, y, z), this.uv) : 0; }
  forest(x, y, z) { return this.Gc && this.s.forest ? this.Gc.sample(this.s.forest, this._d(x, y, z), this.uv) : 0; }
  open(x, y, z) { return this.Gc && this.s.open ? this.Gc.sample(this.s.open, this._d(x, y, z), this.uv) : 0; }
}

// the cloud cover as an equirectangular map for the render (w x w/2 bytes, the cover):
// smoothed across the climate grid's cells (no seams at its faces' edges), and looked up
// through a warp on the scale of a few cells, so the edges of cloudy country billow
// instead of following the cells
export function cloudMapPixels(s, w = 256) {
  if (!s.cloud || !s.Nc) return null;
  const Gc = new GridLite(s.Nc, s.R), m = Gc.n, nb = new Int32Array(8);
  let a = Float32Array.from(s.cloud), b = new Float32Array(m);
  for (let it = 0; it < 2; it++) {
    for (let c = 0; c < m; c++) { const k = Gc.nbrs(c, nb); let sum = a[c] * 2; for (let e = 0; e < k; e++) sum += a[nb[e]]; b[c] = sum / (k + 2); }
    const t = a; a = b; b = t;
  }
  const hh = w / 2, px = new Uint8Array(w * hh), d = [0, 0, 0], uv = { face: 0, u: 0, v: 0 };
  const nz = new Noise3(0x51c10d ^ Math.round(s.R / 1000)), sp = Gc.spacing / s.R;
  const f = 1 / (2.5 * sp), amp = 0.9 * sp;
  for (let y = 0; y < hh; y++) {
    const lat = (y + 0.5) / hh * Math.PI - Math.PI / 2, cl = Math.cos(lat), sl = Math.sin(lat);
    for (let x = 0; x < w; x++) {
      const lon = (x + 0.5) / w * 2 * Math.PI - Math.PI;
      let dx = cl * Math.cos(lon), dy = sl, dz = cl * Math.sin(lon);
      const wx = nz.noise(dx * f, dy * f, dz * f) + 0.5 * nz.noise(dx * f * 2.1 + 5.2, dy * f * 2.1, dz * f * 2.1);
      const wy = nz.noise(dx * f + 17.1, dy * f, dz * f) + 0.5 * nz.noise(dx * f * 2.1, dy * f * 2.1 + 9.3, dz * f * 2.1);
      const wz = nz.noise(dx * f, dy * f + 31.7, dz * f) + 0.5 * nz.noise(dx * f * 2.1, dy * f * 2.1, dz * f * 2.1 + 3.9);
      dx += amp * wx; dy += amp * wy; dz += amp * wz;
      const l = Math.sqrt(dx * dx + dy * dy + dz * dz);
      d[0] = dx / l; d[1] = dy / l; d[2] = dz / l;
      px[y * w + x] = Math.round(255 * Math.min(1, Math.max(0, Gc.sample(a, d, uv))));
    }
  }
  return { px, w, h: hh };
}
