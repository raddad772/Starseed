// Seeded 3D gradient noise (Perlin "improved" lattice) with analytic derivatives.
// Pure double-precision arithmetic: deterministic across engines and threads.

import { Rng } from './rng.js';

const GX = new Int8Array([1, -1, 1, -1, 1, -1, 1, -1, 0, 0, 0, 0, 1, 0, -1, 0]);
const GY = new Int8Array([1, 1, -1, -1, 0, 0, 0, 0, 1, -1, 1, -1, 1, -1, 1, -1]);
const GZ = new Int8Array([0, 0, 0, 0, 1, 1, -1, -1, 1, 1, -1, -1, 0, 1, 0, -1]);

// Octave-to-octave rotation (orthonormal), hides lattice alignment in fBm sums.
export const ROT = [0.00, 0.80, 0.60, -0.80, 0.36, -0.48, -0.60, -0.48, 0.64];

export class Noise3 {
  constructor(seed32) {
    const rng = new Rng([seed32 >>> 0, (seed32 ^ 0x9e3779b9) >>> 0, (~seed32) >>> 0, 0x2545f491]);
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(rng.next() * (i + 1));
      const t = p[i]; p[i] = p[j]; p[j] = t;
    }
    this.perm = new Uint8Array(512);
    for (let i = 0; i < 512; i++) this.perm[i] = p[i & 255];
  }

  noise(x, y, z) {
    const P = this.perm;
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
    const fx = x - xi, fy = y - yi, fz = z - zi;
    const X = xi & 255, Y = yi & 255, Z = zi & 255;
    const ux = fx * fx * fx * (fx * (fx * 6 - 15) + 10);
    const uy = fy * fy * fy * (fy * (fy * 6 - 15) + 10);
    const uz = fz * fz * fz * (fz * (fz * 6 - 15) + 10);
    const A = P[X] + Y, AA = P[A] + Z, AB = P[A + 1] + Z;
    const B = P[X + 1] + Y, BA = P[B] + Z, BB = P[B + 1] + Z;
    let h;
    h = P[AA] & 15; const va = GX[h] * fx + GY[h] * fy + GZ[h] * fz;
    h = P[BA] & 15; const vb = GX[h] * (fx - 1) + GY[h] * fy + GZ[h] * fz;
    h = P[AB] & 15; const vc = GX[h] * fx + GY[h] * (fy - 1) + GZ[h] * fz;
    h = P[BB] & 15; const vd = GX[h] * (fx - 1) + GY[h] * (fy - 1) + GZ[h] * fz;
    h = P[AA + 1] & 15; const ve = GX[h] * fx + GY[h] * fy + GZ[h] * (fz - 1);
    h = P[BA + 1] & 15; const vf = GX[h] * (fx - 1) + GY[h] * fy + GZ[h] * (fz - 1);
    h = P[AB + 1] & 15; const vg = GX[h] * fx + GY[h] * (fy - 1) + GZ[h] * (fz - 1);
    h = P[BB + 1] & 15; const vh = GX[h] * (fx - 1) + GY[h] * (fy - 1) + GZ[h] * (fz - 1);
    const x1 = va + ux * (vb - va), x2 = vc + ux * (vd - vc);
    const x3 = ve + ux * (vf - ve), x4 = vg + ux * (vh - vg);
    const y1 = x1 + uy * (x2 - x1), y2 = x3 + uy * (x4 - x3);
    return y1 + uz * (y2 - y1);
  }

  // Value and gradient. out[0]=n, out[1..3]=dn/dx,dy,dz
  noised(x, y, z, out) {
    const P = this.perm;
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
    const fx = x - xi, fy = y - yi, fz = z - zi;
    const X = xi & 255, Y = yi & 255, Z = zi & 255;
    const ux = fx * fx * fx * (fx * (fx * 6 - 15) + 10);
    const uy = fy * fy * fy * (fy * (fy * 6 - 15) + 10);
    const uz = fz * fz * fz * (fz * (fz * 6 - 15) + 10);
    const dux = 30 * fx * fx * (fx * (fx - 2) + 1);
    const duy = 30 * fy * fy * (fy * (fy - 2) + 1);
    const duz = 30 * fz * fz * (fz * (fz - 2) + 1);
    const A = P[X] + Y, AA = P[A] + Z, AB = P[A + 1] + Z;
    const B = P[X + 1] + Y, BA = P[B] + Z, BB = P[B + 1] + Z;
    const ha = P[AA] & 15, hb = P[BA] & 15, hc = P[AB] & 15, hd = P[BB] & 15;
    const he = P[AA + 1] & 15, hf = P[BA + 1] & 15, hg = P[AB + 1] & 15, hh = P[BB + 1] & 15;
    const gax = GX[ha], gay = GY[ha], gaz = GZ[ha];
    const gbx = GX[hb], gby = GY[hb], gbz = GZ[hb];
    const gcx = GX[hc], gcy = GY[hc], gcz = GZ[hc];
    const gdx = GX[hd], gdy = GY[hd], gdz = GZ[hd];
    const gex = GX[he], gey = GY[he], gez = GZ[he];
    const gfx = GX[hf], gfy = GY[hf], gfz = GZ[hf];
    const ggx = GX[hg], ggy = GY[hg], ggz = GZ[hg];
    const ghx = GX[hh], ghy = GY[hh], ghz = GZ[hh];
    const va = gax * fx + gay * fy + gaz * fz;
    const vb = gbx * (fx - 1) + gby * fy + gbz * fz;
    const vc = gcx * fx + gcy * (fy - 1) + gcz * fz;
    const vd = gdx * (fx - 1) + gdy * (fy - 1) + gdz * fz;
    const ve = gex * fx + gey * fy + gez * (fz - 1);
    const vf = gfx * (fx - 1) + gfy * fy + gfz * (fz - 1);
    const vg = ggx * fx + ggy * (fy - 1) + ggz * (fz - 1);
    const vh = ghx * (fx - 1) + ghy * (fy - 1) + ghz * (fz - 1);
    const k1 = vb - va, k2 = vc - va, k3 = ve - va;
    const k4 = va - vb - vc + vd, k5 = va - vc - ve + vg, k6 = va - vb - ve + vf;
    const k7 = -va + vb + vc - vd + ve - vf - vg + vh;
    out[0] = va + k1 * ux + k2 * uy + k3 * uz + k4 * ux * uy + k5 * uy * uz + k6 * uz * ux + k7 * ux * uy * uz;
    const uxy = ux * uy, uyz = uy * uz, uzx = uz * ux, uxyz = uxy * uz;
    out[1] = gax + ux * (gbx - gax) + uy * (gcx - gax) + uz * (gex - gax) + uxy * (gax - gbx - gcx + gdx) +
      uyz * (gax - gcx - gex + ggx) + uzx * (gax - gbx - gex + gfx) + uxyz * (-gax + gbx + gcx - gdx + gex - gfx - ggx + ghx) +
      dux * (k1 + k4 * uy + k6 * uz + k7 * uyz);
    out[2] = gay + ux * (gby - gay) + uy * (gcy - gay) + uz * (gey - gay) + uxy * (gay - gby - gcy + gdy) +
      uyz * (gay - gcy - gey + ggy) + uzx * (gay - gby - gey + gfy) + uxyz * (-gay + gby + gcy - gdy + gey - gfy - ggy + ghy) +
      duy * (k2 + k5 * uz + k4 * ux + k7 * uzx);
    out[3] = gaz + ux * (gbz - gaz) + uy * (gcz - gaz) + uz * (gez - gaz) + uxy * (gaz - gbz - gcz + gdz) +
      uyz * (gaz - gcz - gez + ggz) + uzx * (gaz - gbz - gez + gfz) + uxyz * (-gaz + gbz + gcz - gdz + gez - gfz - ggz + ghz) +
      duz * (k3 + k6 * ux + k5 * uy + k7 * uxy);
    return out[0];
  }

  // Plain fBm on [-1,1]-ish. octaves may be fractional (last octave faded).
  fbm(x, y, z, octaves, lac = 2.0, gain = 0.5) {
    let sum = 0, amp = 1, norm = 0;
    const n = Math.ceil(octaves);
    for (let i = 0; i < n; i++) {
      const w = (i === n - 1 && octaves !== n) ? (octaves - (n - 1)) : 1;
      sum += amp * w * this.noise(x, y, z);
      norm += amp * w;
      const nx = ROT[0] * x + ROT[1] * y + ROT[2] * z;
      const ny = ROT[3] * x + ROT[4] * y + ROT[5] * z;
      const nz = ROT[6] * x + ROT[7] * y + ROT[8] * z;
      x = nx * lac + 1.7; y = ny * lac - 3.1; z = nz * lac + 5.3;
      amp *= gain;
    }
    return norm > 0 ? sum / norm : 0;
  }
}
