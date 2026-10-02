// Dunes: sand blown into them (Werner's slab model, 1995). Slabs of sand are lifted where the
// wind reaches the surface, hop downwind, and settle (more readily on sand than on bare ground,
// always in the lee of a dune, where the wind lifts nothing); slopes past the sand's angle of
// repose avalanche. From a flat sheet the dunes grow by themselves: barchans where sand is
// scarce, transverse ridges where it's plentiful, longer and straighter where the wind keeps to
// one quarter (the wind here from the -x side, now and then from either flank).
//
// The field is periodic (it wraps at its edges), so it tiles the ground without seams: each
// sand sea reads it turned to its wind (duneAt), the history once per supply, cached.
//
// Integer arithmetic and hashed randomness only: the same dunes on every machine.

import { hashInts } from '../core/rng.js';

// n x n cells, `supply` slabs a cell to start; returns heights in slabs (Int32Array, wrapped)
export function duneField(n, supply, opts = {}) {
  const iters = opts.iters ?? 400, L = opts.hop ?? 5, seed = opts.seed ?? 1;
  const pSand = opts.pSand ?? 0.6, pBare = opts.pBare ?? 0.4, pLift = opts.pLift ?? 0.25;
  // (a slab a tenth of a cell thick: the sand's angle of repose ~33 deg is 6 slabs a cell, the
  // lee's shadow ~15 deg 2.7)
  const repose = opts.repose ?? 6, shadowK = opts.shadow ?? 2.7;
  const N = n * n, z = new Int32Array(N), shadow = new Uint8Array(N);
  // a flat sheet, a little uneven (each cell's own count: where the first dunes start)
  for (let c = 0; c < N; c++) z[c] = Math.max(0, supply + ((hashInts(c, seed, 0x5a4d) & 3) === 0 ? 1 : 0) - ((hashInts(c, seed, 0x5a4e) & 3) === 0 ? 1 : 0));
  const P = (p) => Math.floor(p * 65536);
  const PL = P(pLift), PS = P(pSand), PB = P(pBare), PX = P(opts.flank ?? 0.15);
  const move = new Int32Array(N);
  // (a cell's draw this round: two multiplies over a salt hashed once a round)
  const draw = (c, salt) => { let h = Math.imul(c ^ salt, 0x9e3779b1); h ^= h >>> 15; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; return h & 0xffff; };
  for (let it = 0; it < iters; it++) {
    // this round's wind: mostly from -x, now and then off either flank
    const wr = hashInts(it, seed, 0x3d) & 0xffff, dj = wr < PX ? 1 : wr < 2 * PX ? -1 : 0;
    const sLift = hashInts(it, seed, 0x11f7) | 0, sHop = hashInts(it, seed, 0x40b) | 0;
    // the lee: cells below the line falling from a crest upwind at the shadow's angle
    for (let j = 0; j < n; j++) {
      // (two passes along the wrapped row: the second sees the crests the first carried round)
      const row = j * n;
      let run = -1e9;
      for (let k = 0; k < 2 * n; k++) {
        const c = row + (k < n ? k : k - n), zi = z[c];
        run -= shadowK;
        if (k >= n) shadow[c] = zi < run ? 1 : 0;
        if (zi > run) run = zi;
      }
    }
    // lift: each unsheltered cell with sand loses a slab, with chance pLift
    move.fill(0);
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const c = j * n + i;
      if (z[c] <= 0 || shadow[c] || draw(c, sLift) >= PL) continue;
      z[c]--;
      // the slab hops downwind until it settles
      let ii = i, jj = j;
      for (let hop = 1; hop <= 24; hop++) {
        ii += L; if (ii >= n) ii -= n;
        jj += dj; if (jj >= n) jj -= n; else if (jj < 0) jj += n;
        const t = jj * n + ii;
        if (shadow[t] || hop === 24 || draw(t, sHop + hop * 0x632be5ab) < (z[t] > 0 ? PS : PB)) { move[t]++; break; }
      }
    }
    for (let c = 0; c < N; c++) z[c] += move[c];
    // slopes past the angle of repose avalanche (a few sweeps, the steepest way down)
    for (let pass = 0; pass < 4; pass++) {
      let moved = 0;
      for (let j = 0; j < n; j++) {
        const row = j * n, up = ((j + 1) % n) * n, dn = ((j + n - 1) % n) * n;
        for (let i = 0; i < n; i++) {
          const c = row + i, zc = z[c];
          const e = row + (i + 1 === n ? 0 : i + 1), w = row + (i === 0 ? n - 1 : i - 1), u = up + i, d = dn + i;
          let best = -1, bd = repose;
          if (zc - z[e] > bd) { bd = zc - z[e]; best = e; }
          if (zc - z[w] > bd) { bd = zc - z[w]; best = w; }
          if (zc - z[u] > bd) { bd = zc - z[u]; best = u; }
          if (zc - z[d] > bd) { bd = zc - z[d]; best = d; }
          if (best >= 0) { z[c]--; z[best]++; moved++; }
        }
      }
      if (!moved) break;
    }
  }
  return z;
}

// ---- the dune patches a world's sand seas read (computed once a process, the same everywhere):
// barchans where the sand is scarce, transverse ridges where it's plentiful; cells CELL m apart
// (a slab a tenth of that), so the dunes stand ~50 cells apart (~150 m) and up to ~25 m tall
export const DUNE = { n: 192, cell: 3, supplies: [5, 14], iters: 3000, version: 1 };
let patches = null;
export function dunePatches() {
  if (patches) return patches;
  const z = DUNE.supplies.map((s, k) => {
    const f = duneField(DUNE.n, s, { iters: DUNE.iters, seed: 0xd0e5 + k });
    let mean = 0;
    for (let c = 0; c < f.length; c++) mean += f[c];
    mean /= f.length;
    const out = new Int16Array(f.length);
    for (let c = 0; c < f.length; c++) out[c] = f[c];
    return { z: out, mean };
  });
  return (patches = { n: DUNE.n, cell: DUNE.cell, slab: DUNE.cell / 10, version: DUNE.version, z: z.map((p) => p.z), mean: z.map((p) => p.mean) });
}

// a patch's height (m) at patch coordinates (a, b) (cells, any size: it wraps), read by a
// Catmull-Rom cubic (smooth between cells, the slip faces' crests kept)
export function patchAt(P, k, a, b) {
  const n = P.n, z = P.z[k];
  const ia = Math.floor(a), ib = Math.floor(b), fa = a - ia, fb = b - ib;
  const wa = cr4(fa), wb = cr4(fb);
  let s = 0;
  for (let q = 0; q < 4; q++) {
    const row = (((ib - 1 + q) % n) + n) % n * n;
    let r = 0;
    for (let p = 0; p < 4; p++) r += wa[p] * z[row + ((((ia - 1 + p) % n) + n) % n)];
    s += wb[q] * r;
  }
  return s * P.slab;
}
const _w = [new Float64Array(4), new Float64Array(4)];
let _wk = 0;
function cr4(t) {
  const w = _w[_wk = 1 - _wk], t2 = t * t, t3 = t2 * t;
  w[0] = 0.5 * (-t3 + 2 * t2 - t); w[1] = 0.5 * (3 * t3 - 5 * t2 + 2); w[2] = 0.5 * (-3 * t3 + 4 * t2 + t); w[3] = 0.5 * (t3 - t2);
  return w;
}
