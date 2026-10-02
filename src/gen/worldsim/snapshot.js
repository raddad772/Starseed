// A simulated world, packed for the game (WORLDSIM.md step 7): the world sim's
// results as flat typed arrays (cached, sent to the terrain workers), and a sampler
// the terrain generator reads instead of its noise.
//
//   on the fine grid   heights (m, the game's convention: real metres on the drawn
//                      sphere), lake surfaces, the exposed rock (or beach sand), ice
//                      thickness, rivers (discharge, 0..1 by log), a fresh melt sheet,
//                      local relief (for how rugged the fine detail is)
//   on the climate grid the yearly mean brought to sea level (K), rain (mm/yr), plant
//                      cover and its forest and open shares (life.js)
//
// Versioned: a cache keyed by seed, body and SIM_VERSION drops stale ones.

import { SimGrid } from './grid.js';

export const SIM_VERSION = 1;

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
  const relief = new Float32Array(n);
  for (let c = 0; c < n; c++) { let r = 0; for (let e = G.nStart[c]; e < G.nStart[c + 1]; e++) r = Math.max(r, Math.abs(W.h[c] - W.h[G.nbr[e]])); relief[c] = r; }
  const out = { version: SIM_VERSION, path: W.path, N: G.N, R: G.R, h, water, rock, ice, river, melt, relief, Nc: 0 };
  if (W.climate && W.Gc) {
    const Gc = W.Gc, m = Gc.n, lapse = body.terrain && body.terrain.climate ? body.terrain.climate.lapse ?? 0.0065 : 0.0065;
    out.Nc = Gc.N;
    out.Tsea = new Float32Array(m); out.P = Float32Array.from(W.climate.Pann);
    for (let c = 0; c < m; c++) out.Tsea[c] = W.climate.Tann[c] + (W.climate.sea[c] ? 0 : lapse * Math.max(0, W.climate.h ? W.climate.h[c] : 0));
    if (W.life) { out.cover = Float32Array.from(W.life.cover); out.forest = Float32Array.from(W.life.forest); out.open = Float32Array.from(W.life.open); }
  }
  return out;
}

// the arrays a snapshot carries (for transfer lists and caching)
export function snapshotBuffers(s) {
  return ['h', 'water', 'rock', 'ice', 'river', 'melt', 'relief', 'Tsea', 'P', 'cover', 'forest', 'open'].filter((k) => s[k]).map((k) => s[k].buffer);
}

// reads a snapshot at any direction
export class SnapshotSampler {
  constructor(s) {
    this.s = s;
    this.G = new SimGrid(s.N, s.R);
    this.Gc = s.Nc ? new SimGrid(s.Nc, s.R) : null;
    this.uv = { face: 0, u: 0, v: 0 };
    this.d = [0, 0, 0];
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
  // the climate grid's
  Tsea(x, y, z) { return this.Gc ? this.Gc.sample(this.s.Tsea, this._d(x, y, z), this.uv) : null; }
  rain(x, y, z) { return this.Gc ? this.Gc.sample(this.s.P, this._d(x, y, z), this.uv) : null; }
  cover(x, y, z) { return this.Gc && this.s.cover ? this.Gc.sample(this.s.cover, this._d(x, y, z), this.uv) : 0; }
  forest(x, y, z) { return this.Gc && this.s.forest ? this.Gc.sample(this.s.forest, this._d(x, y, z), this.uv) : 0; }
  open(x, y, z) { return this.Gc && this.s.open ? this.Gc.sample(this.s.open, this._d(x, y, z), this.uv) : 0; }
}
