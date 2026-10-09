// The gas falling toward the galaxy's central black hole (render/webgpu/central.js draws it): a cloud
// on its first plunge, torn by the hole's tides into a hooked streamer. Not noise: each of its
// parcels is followed on its own orbit round the hole (two bodies, the hole and the parcel; the gas's
// own pressure and gravity are small over a few centuries next to sixty billion suns), from one cloud
// a few parsecs out on a nearly parabolic orbit, until its head has just swung past pericentre. The
// parcels are then spread into a density on a grid (cloud-in-cell, smoothed over a cell or two): the
// volume the renderer marches. Lengths in parsecs, in the galaxy chart's frame (the hole at the
// origin; campaign/galaxy.js); deterministic, the same gas for everyone and every system.
import { Rng } from '../core/rng.js';

const G = 4.49850215e-15;   // pc^3 / (Msun yr^2)

export const STREAMER = {
  massSun: 6e10,             // the hole's (sim/centralObject.js)
  // the cloud's centre when it set out: on the hole's far side from the survey system (+x), above
  // the galaxy's plane; its orbit's pericentre (pc), semi-major axis (pc, nearly parabolic) and the
  // way it was moving across the line to the hole
  start: [-5.2, 1.6, 2.4], pericentre: 0.3, a: 40, across: [0.2, 0.9, -0.3],
  cloudPc: 0.22,             // the cloud's size (pc, one sigma)
  // clumpy, as molecular clouds are: its gas in clumps (radii log-uniform between these, pc), and a
  // smooth share between them
  clumps: 420, clumpPc: [0.005, 0.04], smooth: 0.15,
  dispersion: 0.01,          // its parcels' spread in speed (share of its own)
  parcels: 90000,
  past: 1.08,                // how far on: the centre's time to pericentre, times this
  voxels: 4.2e6,             // the density grid's cells, in all
  pad: 0.25,                 // pc round the parcels
  shadow: 6.0,               // the ionizing light's opacity through the gas (per pc at full density)
};

let cache = null;

// { min, max (pc), dims [nx, ny, nz], density (Float32Array, 0..1, x fastest) }
export function infallStreamer() {
  if (cache) return cache;
  const S = STREAMER, GM = G * S.massSun, rng = new Rng('nebula/infall/v1');
  const len = v => Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  // (the centre's velocity: radial in, and across the line to the hole for that pericentre)
  const r0 = S.start, rn = len(r0), rh = r0.map(x => x / rn);
  const h = Math.sqrt(GM * S.pericentre * (2 - S.pericentre / S.a));
  const vt = h / rn, vr = -Math.sqrt(GM * (2 / rn - 1 / S.a) - vt * vt);
  const ad = S.across[0] * rh[0] + S.across[1] * rh[1] + S.across[2] * rh[2];
  let t = S.across.map((x, i) => x - rh[i] * ad); const tl = len(t); t = t.map(x => x / tl);
  const v0 = rh.map((x, i) => x * vr + t[i] * vt);
  // leapfrog, its steps a small share of the local orbital time
  const step = (p, v, dt) => {
    let d = len(p), k = -GM / (d * d * d);
    v[0] += k * p[0] * dt / 2; v[1] += k * p[1] * dt / 2; v[2] += k * p[2] * dt / 2;
    p[0] += v[0] * dt; p[1] += v[1] * dt; p[2] += v[2] * dt;
    d = len(p); k = -GM / (d * d * d);
    v[0] += k * p[0] * dt / 2; v[1] += k * p[1] * dt / 2; v[2] += k * p[2] * dt / 2;
  };
  const dtAt = p => { const d = len(p); return Math.min(2, 0.004 * d * Math.sqrt(d / GM)); };
  // (how long the centre takes to reach pericentre)
  let p = [...r0], v = [...v0], tt = 0, best = Infinity, tp = 0;
  while (tt < 20000) {
    const dt = dtAt(p); step(p, v, dt); tt += dt;
    const d = len(p); if (d < best) { best = d; tp = tt; } else if (d > best * 1.5) break;
  }
  const T = tp * S.past, pos = new Float64Array(S.parcels * 3);
  const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  const clumps = Array.from({ length: S.clumps }, () => ({
    at: r0.map(x => x + rng.normal(0, S.cloudPc)), r: S.clumpPc[0] * Math.pow(S.clumpPc[1] / S.clumpPc[0], rng.next()),
  }));
  for (let n = 0; n < S.parcels; n++) {
    // (in a clump, the bigger ones holding more, or in the smooth gas between)
    let q;
    if (rng.next() < S.smooth) q = r0.map(x => x + rng.normal(0, S.cloudPc));
    else { const c = clumps[Math.min(S.clumps - 1, Math.floor(Math.pow(rng.next(), 1.6) * S.clumps))]; q = c.at.map(x => x + rng.normal(0, c.r)); }
    const w = v0.map(x => x * (1 + rng.normal(0, S.dispersion)));
    let tq = 0; while (tq < T) { const dt = Math.min(dtAt(q), T - tq); step(q, w, dt); tq += dt; }
    for (let i = 0; i < 3; i++) { pos[n * 3 + i] = q[i]; lo[i] = Math.min(lo[i], q[i]); hi[i] = Math.max(hi[i], q[i]); }
  }
  for (let i = 0; i < 3; i++) { lo[i] -= S.pad; hi[i] += S.pad; }
  // the grid: cubic cells, as many as the budget allows over the box
  const ext = hi.map((x, i) => x - lo[i]), cell = Math.cbrt(ext[0] * ext[1] * ext[2] / S.voxels);
  const dims = ext.map(e => Math.max(8, Math.ceil(e / cell))), [nx, ny, nz] = dims;
  const rho = new Float32Array(nx * ny * nz);
  // (cloud-in-cell: each parcel shared among the eight cells round it)
  for (let n = 0; n < S.parcels; n++) {
    const g = [0, 1, 2].map(i => (pos[n * 3 + i] - lo[i]) / cell - 0.5);
    const i0 = g.map(Math.floor), f = g.map((x, i) => x - i0[i]);
    for (let c = 0; c < 8; c++) {
      const ix = i0[0] + (c & 1), iy = i0[1] + ((c >> 1) & 1), iz = i0[2] + ((c >> 2) & 1);
      if (ix < 0 || iy < 0 || iz < 0 || ix >= nx || iy >= ny || iz >= nz) continue;
      const wgt = (c & 1 ? f[0] : 1 - f[0]) * ((c >> 1) & 1 ? f[1] : 1 - f[1]) * ((c >> 2) & 1 ? f[2] : 1 - f[2]);
      rho[(iz * ny + iy) * nx + ix] += wgt;
    }
  }
  // (smoothed: two passes of a three-cell box blur each way, near a Gaussian of a cell)
  const tmp = new Float32Array(rho.length);
  const blur = (src, dst, stride, n, count) => {
    for (let base = 0; base < src.length; base++) {
      const k = Math.floor(base / stride) % n;
      const a = k > 0 ? src[base - stride] : src[base], b = k < n - 1 ? src[base + stride] : src[base];
      dst[base] = (a + src[base] + b) / 3;
    }
  };
  blur(rho, tmp, 1, nx); blur(tmp, rho, nx, ny); blur(rho, tmp, nx * ny, nz); rho.set(tmp);
  // (normalised by a high percentile, not the single densest cell, and capped)
  const sorted = Float32Array.from(rho.filter(x => x > 0)).sort(), ref = sorted[Math.floor(sorted.length * 0.995)] || 1;
  for (let i = 0; i < rho.length; i++) rho[i] = Math.min(1, rho[i] / ref);
  // The light that ionizes it comes from the hole: each cell's share of it, through the gas between
  // it and the hole (marched on a coarser grid toward the origin, then read back trilinearly): gas
  // behind a dense knot stays dark and neutral, its face to the hole lit
  const cn = dims.map(n => Math.max(4, Math.ceil(n / 3))), cc = ext.map((e, i) => e / cn[i]);
  const at = (x, y, z) => {   // density at a point (pc), nearest cell
    const ix = Math.floor((x - lo[0]) / cell), iy = Math.floor((y - lo[1]) / cell), iz = Math.floor((z - lo[2]) / cell);
    return ix < 0 || iy < 0 || iz < 0 || ix >= nx || iy >= ny || iz >= nz ? 0 : rho[(iz * ny + iy) * nx + ix];
  };
  const lit = new Float32Array(cn[0] * cn[1] * cn[2]);
  for (let k = 0; k < cn[2]; k++) for (let j = 0; j < cn[1]; j++) for (let i = 0; i < cn[0]; i++) {
    const x = lo[0] + (i + 0.5) * cc[0], y = lo[1] + (j + 0.5) * cc[1], z = lo[2] + (k + 0.5) * cc[2];
    const d = Math.sqrt(x * x + y * y + z * z), n = Math.max(4, Math.ceil(d / cell / 1.5)), ds = d / n;
    let tau = 0; for (let m = 1; m < n; m++) { const f = m / n; tau += at(x * f, y * f, z * f) * ds; }
    lit[(k * cn[1] + j) * cn[0] + i] = Math.exp(-S.shadow * tau);
  }
  const ion = new Float32Array(rho.length);
  for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const g = [(i + 0.5) * cell / cc[0] - 0.5, (j + 0.5) * cell / cc[1] - 0.5, (k + 0.5) * cell / cc[2] - 0.5];
    const g0 = g.map((x, a) => Math.max(0, Math.min(cn[a] - 2, Math.floor(x)))), f = g.map((x, a) => Math.max(0, Math.min(1, x - g0[a])));
    let v = 0;
    for (let c = 0; c < 8; c++) {
      const ix = g0[0] + (c & 1), iy = g0[1] + ((c >> 1) & 1), iz = g0[2] + ((c >> 2) & 1);
      v += lit[(iz * cn[1] + iy) * cn[0] + ix] * (c & 1 ? f[0] : 1 - f[0]) * ((c >> 1) & 1 ? f[1] : 1 - f[1]) * ((c >> 2) & 1 ? f[2] : 1 - f[2]);
    }
    ion[(k * ny + j) * nx + i] = v;
  }
  return cache = { min: lo, max: hi, dims, cell, density: rho, ionized: ion, years: T, pericentre: best };
}

// in the browser: the same, from a worker, once (null until it's ready)
let pending = null, ready = null;
export function infallStreamerAsync() {
  if (ready || pending) return ready;
  if (typeof Worker === 'undefined') return (ready = infallStreamer());
  pending = new Worker(new URL('../workers/nebulaWorker.js', import.meta.url), { type: 'module' });
  pending.onmessage = e => { ready = e.data; pending.terminate(); };
  pending.onerror = () => { pending = null; };
  pending.postMessage(null);
  return null;
}
