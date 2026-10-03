// The ground inside each cell of the world sim (Dave: "a second layer... simulated with the
// history and inform this step"): what the land is like below the grid's scale, evolved with the
// history as the cells' heights are, for the finer levels to draw (localsim.js), far views to
// shade and the catalogue to describe. Per cell:
//
//   lr      local relief (m: the ground's span within ~10 km real, as geomorphologists measure
//           it). It grows toward what the wear here holds: faster wear, deeper valleys, up to
//           what the rock stands before its slopes fail (harder rock stands higher: Montgomery
//           & Brandon 2002). Quickly while rivers cut down into rising land (~2 Myr), slowly as
//           old land wears down (~30 Myr), faster where valleys fill; valley glaciers deepen it,
//           ice sheets scour it down
//   youth   how far it is from that: + young (cut into, a plateau with gorges), 0 graded,
//           - old (worn round, past its wear)
//   vsp     valley spacing (m real: the finest valleys, where hillslopes give way to channels):
//           soil creep against channels cutting (Perron et al. 2008). Wider under plants (roots
//           hold the soil, water soaks in, the soil creeps), tightest on bare soft ground in a
//           dry land that sometimes floods (badlands), wider in hard rock and in frost
//   grain   which way ridges and valleys run, and how strongly (gx, gy: s cos 2a, s sin 2a, the
//           angle a from local east toward north): along the belts the plates raised; along
//           the ice's flow where glaciers ran
//   glac    how long ice lay here in the last epoch (share): U valleys, cirques, lakes
//
// Deterministic: dmath and plain arithmetic.

import * as dm from '../../core/dmath.js';

const EC = 300;   // m/Myr: the wear at which relief reaches ~2/3 of what its rock stands
const lrEq = (E, hd) => (600 + 1600 * hd) * (1 - dm.exp(-Math.max(0, E) / EC)) + 30;
const relax = (lr, eq, dtMyr, agg) => lr + (eq - lr) * (1 - dm.exp(-dtMyr / (eq > lr ? 2 : agg ? 3 : 30)));

export class Ground {
  // Gt: the plates' grid (the long epoch)
  constructor(Gt) {
    this.Gt = Gt;
    this.lrT = new Float64Array(Gt.n).fill(150);
    this.prevT = new Float64Array(Gt.n);
  }
  // a step of the plates' epoch (Et: its erosion, T: the plates, ht: heights, dtMyr)
  plateStep(Et, T, ht, dtMyr) {
    const n = this.Gt.n, lr = this.lrT, prev = this.prevT, er = Et.eroded;
    for (let c = 0; c < n; c++) {
      const E = (er[c] - prev[c]) / dtMyr;
      prev[c] = er[c];
      if (ht[c] < 0) { lr[c] = relax(lr[c], 50, dtMyr, true); continue; }
      const P = T.plates[T.owner[c]], hd = P && P.cont && P.cont[T.src[c]] >= 0.5 ? 0.75 : 0.6;
      lr[c] = relax(lr[c], lrEq(E, hd), dtMyr, false);
    }
  }
  // the fine epoch begins on G: the plates' grid's relief read onto it
  fineStart(G) {
    this.G = G;
    const n = G.n, d = [0, 0, 0];
    this.lr = new Float64Array(n); this.eq = new Float64Array(n); this.glacT = new Float64Array(n);
    this.gcx = new Float64Array(n); this.gcy = new Float64Array(n);
    this.Emean = new Float64Array(n); this.wear = new Float64Array(n).fill(-1); this.myr = 0;
    for (let c = 0; c < n; c++) { d[0] = G.dir[c * 3]; d[1] = G.dir[c * 3 + 1]; d[2] = G.dir[c * 3 + 2]; this.lr[c] = this.Gt.sample(this.lrT, d); }
  }
  // a step of the fine epoch: E (erosion: U, K, rcv), ice (glaciers), h now and hb before the
  // step, dt (years), KF (the erosion's base K: E.K / KF is the exposed rock's)
  fineStep(E, ice, h, hb, dt, KF) {
    const G = this.G, n = G.n, dtMyr = dt / 1e6, lr = this.lr, eq = this.eq;
    this.myr += dtMyr;
    for (let c = 0; c < n; c++) {
      // (the wear here over the last Myr or so: a step's swings with the routing, the lakes and
      // the ice ages aren't the land's)
      const dz = h[c] - (hb[c] + E.U[c] * dt), w0 = Math.max(0, -dz) / dtMyr, wv = this.wear;
      wv[c] = wv[c] < 0 ? w0 : wv[c] + (w0 - wv[c]) * (1 - dm.exp(-dtMyr / 1));
      const wear = wv[c];
      this.Emean[c] += w0 * dtMyr;
      if (h[c] < 0) { eq[c] = 50; lr[c] = relax(lr[c], 50, dtMyr, true); continue; }
      const hd = dm.clamp(1.25 - 0.4 * E.K[c] / KF, 0, 1), gi = ice ? ice.ice[c] : 0;
      eq[c] = lrEq(wear, hd) * (gi > 20 && gi < 1200 ? 1.5 : gi >= 1200 ? 0.6 : 1);
      lr[c] = relax(lr[c], eq[c], dtMyr, dz > 0.01);
      if (gi > 20) {
        this.glacT[c] += dtMyr;
        // (the ice's way: toward the cell it drains to, in the local east-north frame, doubled)
        const r = E.rcv[c];
        if (r >= 0) {
          const f = frame(G.dir, c), dx = G.dir[r * 3] - G.dir[c * 3], dy = G.dir[r * 3 + 1] - G.dir[c * 3 + 1], dzz = G.dir[r * 3 + 2] - G.dir[c * 3 + 2];
          const a = dm.atan2(dx * f[3] + dy * f[4] + dzz * f[5], dx * f[0] + dy * f[1] + dzz * f[2]), w = Math.min(1, gi / 300) * dtMyr;
          this.gcx[c] += w * dm.cos(2 * a); this.gcy[c] += w * dm.sin(2 * a);
        }
      }
    }
  }
  // the end: youth, valley spacing (rain m/yr, Tsl sea-level K and lapse, plant cover 0..1,
  // the erosion's K over KF), grain, glaciation; h the final heights
  finish(h, rain, Tsl, lapse, cover, K, KF) {
    const G = this.G, n = G.n, lr = this.lr, eq = this.eq;
    this.youth = new Float32Array(n); this.vsp = new Float32Array(n); this.glac = new Float32Array(n);
    this.gx = new Float32Array(n); this.gy = new Float32Array(n);
    for (let c = 0; c < n; c++) {
      this.youth[c] = dm.clamp((eq[c] - lr[c]) / Math.max(eq[c], lr[c], 50), -1, 1);
      this.glac[c] = Math.min(1, this.glacT[c] / Math.max(this.myr, 1e-9));
      if (h[c] < 0) { this.vsp[c] = 0; continue; }
      // (creep: soil-mantled under plants, frost-heaved in the cold; channels: soft rock, the
      // rain that runs off, less where plants hold it)
      const T = Tsl[c] - lapse * h[c], cv = cover ? cover[c] : 0, k = K[c] / KF;
      const Dn = (1 + 1.5 * cv) * (T < 273 ? 1.5 : 1), Kn = Math.max(0.05, k) * dm.sqrt(Math.max(0.02, rain[c])) * (1 - 0.6 * cv);
      this.vsp[c] = dm.clamp(150 * dm.pow(Dn / Kn, 0.53), 40, 3000);
    }
    // grain: the ground's slope tensor (its gradient with itself), smoothed over a few cells:
    // its strongest way is across the belts, the grain along them; how much stronger, how much
    // grain. Then along the ice where it ran long
    const Jxx = new Float64Array(n), Jxy = new Float64Array(n), Jyy = new Float64Array(n);
    for (let c = 0; c < n; c++) {
      if (h[c] < 0) continue;
      const f = frame(G.dir, c);
      let gx = 0, gy = 0, w = 0;
      for (let e = G.nStart[c]; e < G.nStart[c + 1]; e++) {
        const o = G.nbr[e], dx = G.dir[o * 3] - G.dir[c * 3], dy = G.dir[o * 3 + 1] - G.dir[c * 3 + 1], dz = G.dir[o * 3 + 2] - G.dir[c * 3 + 2];
        const ex = dx * f[0] + dy * f[1] + dz * f[2], ny = dx * f[3] + dy * f[4] + dz * f[5], L2 = ex * ex + ny * ny;
        if (L2 <= 0) continue;
        const s = (Math.max(0, h[o]) - h[c]) / L2;
        gx += s * ex; gy += s * ny; w++;
      }
      if (w) { gx /= w; gy /= w; }
      Jxx[c] = gx * gx; Jxy[c] = gx * gy; Jyy[c] = gy * gy;
    }
    // (over a region, ~10 cells: the belts' trend, not each valley's)
    for (let pass = 0; pass < 12; pass++) for (const A of [Jxx, Jxy, Jyy]) {
      const t = Float64Array.from(A);
      for (let c = 0; c < n; c++) { let s = 2 * t[c], w = 2; for (let e = G.nStart[c]; e < G.nStart[c + 1]; e++) { s += t[G.nbr[e]]; w++; } A[c] = s / w; }
    }
    const tr = [];
    for (let c = 0; c < n; c++) if (h[c] >= 0) tr.push(Jxx[c] + Jyy[c]);
    tr.sort((a, b) => a - b);
    const lo = tr.length ? tr[Math.floor(0.3 * tr.length)] : 0, hi = tr.length ? tr[Math.floor(0.85 * tr.length)] : 1;
    for (let c = 0; c < n; c++) {
      if (h[c] < 0) continue;
      const a = Jxx[c] - Jyy[c], b = 2 * Jxy[c], t = Jxx[c] + Jyy[c], m = Math.sqrt(a * a + b * b);
      // (the gradient's way doubled is (a, b) / m; the grain is at right angles: its doubled
      // angle opposite)
      const s = t > 0 ? (m / t) * dm.smoothstep(lo, hi, t) : 0;
      let gx = m > 0 ? -s * a / m : 0, gy = m > 0 ? -s * b / m : 0;
      const gw = dm.smoothstep(0.1, 0.5, this.glac[c]), gm = Math.sqrt(this.gcx[c] * this.gcx[c] + this.gcy[c] * this.gcy[c]);
      if (gw > 0 && gm > 0) { gx += (this.gcx[c] / gm - gx) * gw; gy += (this.gcy[c] / gm - gy) * gw; }
      this.gx[c] = dm.clamp(gx, -1, 1); this.gy[c] = dm.clamp(gy, -1, 1);
    }
    for (let c = 0; c < n; c++) this.Emean[c] /= Math.max(this.myr, 1e-9);
    return this;
  }
}

// the local east and north at cell c of a grid's directions (y the spin axis): [ex, ey, ez, nx, ny, nz]
const _f = new Float64Array(6);
export function frame(dir, c) {
  const x = dir[c * 3], y = dir[c * 3 + 1], z = dir[c * 3 + 2];
  let ex = -z, ez = x;
  const el = Math.sqrt(ex * ex + ez * ez) || 1; ex /= el; ez /= el;
  _f[0] = ex; _f[1] = 0; _f[2] = ez;
  _f[3] = -y * ez; _f[4] = x * ez - z * ex; _f[5] = y * ex;
  return _f;
}
