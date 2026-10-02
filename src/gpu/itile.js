// The tile sim (gen/localsim.js) in integers: the same history, step by step, in exact
// arithmetic, so a GPU (gpu/itileGPU.js) runs it bit for bit as this does, on any vendor's
// hardware (integer add, multiply, shift and compare are exact everywhere; floating point on a
// GPU isn't). This is the reference and the fallback; the GPU's kernels mirror each pass here.
//
// Heights are i32 in 1/4096 m. Every pass is a gather over a cell's 8 neighbours from the
// previous pass's values (Jacobi: no pass depends on the order cells are visited in), so each
// is one GPU dispatch:
//   pin       the land's mean held to the starting surface's: block means of (h - B), blurred,
//             taken off (as uplift keeping pace with wear would hold it)
//   fill      lakes' surfaces, relaxed a few passes a step from the last step's (Planchon-Darboux)
//   receivers each cell's way down the filled surface: the steepest, or a slope-weighted draw
//   accum     the water through each cell: the last step's, carried a few cells further a pass
//   erode     stream power (A^0.45 by a log-domain table), implicit: solved down each river at
//             once by pointer jumping
//   creep     soil creep, faster on soft rock
//   collapse  slopes past what their rock holds shed into the cells below (talus)
// Products never overflow 32 bits: every fixed-point multiply is by a 16-bit fraction (mul16).

import * as dm from '../core/dmath.js';
import { hashInts } from '../core/rng.js';

export const Q = 4096;                 // height units a metre
const DI = [-1, 0, 1, -1, 1, -1, 0, 1], DJ = [-1, -1, -1, 0, 0, 1, 1, 1];   // the 8 neighbours (slot k; 7 - k is back)
const DIAG = [1, 0, 1, 0, 0, 1, 0, 1];
const FMAX2 = 0x7fff0000;              // (stream power's f, x65536, at most ~32767)
const PONDQ = 2048;                    // a cell more than 0.5 m under its lake's surface is ponded: nothing cut
export const PASSES = { fill: 8, accum: 16, jump: 12, collapse: 3 };

// (a * b) >> 16 for any i32 a and a 16-bit fraction b (0 .. 65535): exact, no overflow
export function mul16(a, b) { return Math.imul(a >> 16, b) + ((((a & 0xffff) * b) >>> 16) | 0) | 0; }

// A^0.45 (x16) by A's log: index (e << 8 | f) for A ~ 2^e (1 + f / 256)
export function apowTable(m = 0.45) {
  const t = new Uint32Array(32 * 256), ln2 = dm.log(2);
  for (let e = 0; e < 32; e++) for (let f = 0; f < 256; f++) t[(e << 8) | f] = Math.round(16 * dm.exp(m * (e * ln2 + dm.log(1 + f / 256))));
  return t;
}
export function apowIndex(A) {
  const e = 31 - Math.clz32(A);
  return (e << 8) | ((e >= 8 ? A >>> (e - 8) : A << (8 - e)) & 255);
}

// the tables by hardness (0..255): stream power's rock factor (x2048), creep's rate (16-bit
// fraction), the slope a rock holds (x Q/1000 x 64: the drop per 64 mm)
export function hardTables(kd0) {
  const KH = new Uint32Array(256), KD = new Uint32Array(256), SC = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    const hd = i / 255, soft = 1 - hd;
    KH[i] = Math.round(2048 * (0.1 + 1.6 * soft * soft));
    KD[i] = Math.min(5400, Math.round(65536 * kd0 * (0.03 + 1.2 * soft) * 0.25));
    SC[i] = Math.round((0.65 + 3.4 * hd * hd) * Q / 1000 * 64);
  }
  return { KH, KD, SC };
}

// the grid's per-cell constants: each neighbour's distance (mm), creep's weights, and stream
// power's coefficient for a receiver along an axis and on a diagonal (a 16-bit mantissa and a
// power of two: f (x65536) = mul16(KH APOW, CM) shifted by CE)
export function gridTables(T) {
  const { NG, n, sz } = T;
  const D = new Uint32Array(n * 8), W = new Uint16Array(n * 8), CM = new Uint32Array(n * 2), CE = new Int32Array(n * 2);
  const aunit = T.aref / 16;   // m^2 of drainage per unit of A
  const c0 = T.K0 * dm.exp(0.45 * dm.log(aunit)) / (2048 * 16) * 65536;
  for (let j = 0; j < NG; j++) for (let i = 0; i < NG; i++) {
    const c = j * NG + i, s = sz[c];
    for (let k = 0; k < 8; k++) {
      const ii = i + DI[k], jj = j + DJ[k];
      if (ii < 0 || jj < 0 || ii >= NG || jj >= NG) continue;
      const so = sz[jj * NG + ii], d = DIAG[k] ? ((s + so) * 181) >> 8 : (s + so) >> 1;
      D[c * 8 + k] = d;
      const r = Math.floor((s * 256) / d);
      W[c * 8 + k] = Math.min(511, (r * r) >> 8);              // (~256 along an axis, ~128 diagonal)
    }
    // f = K0 kh (A aunit)^0.45 / d(m), kh = KH / 2048, A^0.45 = APOW / 16
    for (let t = 0; t < 2; t++) {
      const d = (t ? s * 181 / 256 : s) / 1000;
      let coef = c0 / d;   // f (x65536) per unit of KH APOW
      let e = 0;
      while (coef >= 1) { coef /= 2; e++; }
      while (coef < 0.5) { coef *= 2; e--; }
      CM[c * 2 + t] = Math.min(65535, Math.round(coef * 65536)); CE[c * 2 + t] = Math.max(-31, Math.min(31, e));
    }
  }
  return { D, W, CM, CE };
}

// runs T (localsim's ints(): NG, n, steps, rise, sz, flags, a, hd, h0, B, aref, K0, kd0, sig,
// salt) here; returns { h, talus } (Int32Arrays: Q units)
export function runInt(T) {
  const { NG, n, a, B } = T;
  const { D, W, CM, CE } = gridTables(T), { KH, KD, SC } = hardTables(T.kd0), AP = apowTable();
  const flags = Uint8Array.from(T.flags), hd = T.hd;
  let h = Int32Array.from(T.h0), h2 = new Int32Array(n);
  let F = Int32Array.from(T.h0), F2 = new Int32Array(n);
  let A = Uint32Array.from(a), A2 = new Uint32Array(n);
  const rcv = new Uint8Array(n).fill(8), talus = new Int32Array(n);
  let al = new Int32Array(n), al2 = new Int32Array(n), be = new Uint32Array(n), be2 = new Uint32Array(n), pt = new Int32Array(n), pt2 = new Int32Array(n);
  const nb = (c, k) => { const i = c % NG + DI[k], j = ((c / NG) | 0) + DJ[k]; return i < 0 || j < 0 || i >= NG || j >= NG ? -1 : j * NG + i; };
  // the pin's blocks: PB cells a side, blurred RB blocks round
  const PB = T.sig <= 6 ? 4 : 8, NB = Math.ceil(NG / PB), RB = Math.max(1, Math.round(T.sig / PB));
  const M = new Int32Array(NB * NB), M2 = new Int32Array(NB * NB);
  for (let st = 0; st < T.steps; st++) {
    // the mean held (every other step)
    if (st % 2 === 1) {
      for (let bj = 0; bj < NB; bj++) for (let bi = 0; bi < NB; bi++) {
        let s = 0, cnt = 0;
        for (let j = bj * PB; j < Math.min(NG, bj * PB + PB); j++) for (let i = bi * PB; i < Math.min(NG, bi * PB + PB); i++) {
          const c = j * NG + i, d = h[c] - B[c];
          s += d > 16777215 ? 16777215 : d < -16777215 ? -16777215 : d; cnt++;
        }
        M[bj * NB + bi] = Math.trunc(s / cnt);
      }
      for (let pass = 0; pass < 3; pass++) for (let ax = 0; ax < 2; ax++) {
        for (let bj = 0; bj < NB; bj++) for (let bi = 0; bi < NB; bi++) {
          let s = 0, cnt = 0;
          for (let r = -RB; r <= RB; r++) {
            const xi = ax ? bi : bi + r, xj = ax ? bj + r : bj;
            if (xi < 0 || xj < 0 || xi >= NB || xj >= NB) continue;
            s += M[xj * NB + xi] >> 4; cnt++;
          }
          M2[bj * NB + bi] = Math.trunc(s / cnt) << 4;
        }
        M.set(M2);
      }
      for (let j = 0; j < NG; j++) for (let i = 0; i < NG; i++) {
        const c = j * NG + i;
        if (flags[c] & 1) continue;
        // (bilinear between the blocks' centres, in PB-ths)
        const x = i * 2 + 1 - PB, y = j * 2 + 1 - PB;          // (2 x position - block width, in half cells)
        let b0i = Math.floor(x / (2 * PB)), b0j = Math.floor(y / (2 * PB));
        let fx = x - b0i * 2 * PB, fy = y - b0j * 2 * PB;          // 0 .. 2PB
        const i0 = Math.max(0, Math.min(NB - 1, b0i)), i1 = Math.max(0, Math.min(NB - 1, b0i + 1)), j0 = Math.max(0, Math.min(NB - 1, b0j)), j1 = Math.max(0, Math.min(NB - 1, b0j + 1));
        const P2 = 2 * PB;
        const top = Math.trunc((M[j0 * NB + i0] * (P2 - fx) + M[j0 * NB + i1] * fx) / P2), bot = Math.trunc((M[j1 * NB + i0] * (P2 - fx) + M[j1 * NB + i1] * fx) / P2);
        const m = Math.trunc((top * (P2 - fy) + bot * fy) / P2);
        h[c] = (h[c] - mul16(m, 19661)) | 0;                  // (0.3 of it)
      }
    }
    if (st === T.rise) for (let c = 0; c < n; c++) if (flags[c] & 2) flags[c] |= 1;
    // lakes' surfaces
    for (let p = 0; p < PASSES.fill; p++) {
      for (let c = 0; c < n; c++) {
        if (flags[c] & 1) { F2[c] = h[c]; continue; }
        let m = 0x7fffffff;
        for (let k = 0; k < 8; k++) { const o = nb(c, k); if (o >= 0 && F[o] < m) m = F[o]; }
        const v = m === 0x7fffffff ? h[c] : m + 1;
        F2[c] = h[c] > v ? h[c] : v;
      }
      const t = F; F = F2; F2 = t;
    }
    // receivers: the steepest way down the filled surface, or a draw weighted by slope
    const salt = hashInts(st, T.salt) >>> 0;
    for (let c = 0; c < n; c++) {
      if (flags[c] & 1) { rcv[c] = 8; continue; }
      let best = 8, bs = 0, sum = 0;
      const sl = rcvSlopes(c);
      for (let k = 0; k < 8; k++) { const s = sl[k]; if (s > 0) sum += s; if (s > bs) { bs = s; best = k; } }
      if (bs >= 1) {
        let x = (hashInts(c, salt) >>> 0) % sum;
        for (let k = 0; k < 8; k++) { const s = sl[k]; if (s <= 0) continue; if (x < s) { best = k; break; } x -= s; }
      }
      rcv[c] = best;
    }
    // the water through each cell
    for (let p = 0; p < PASSES.accum; p++) {
      for (let c = 0; c < n; c++) {
        let s = a[c];
        for (let k = 0; k < 8; k++) { const o = nb(c, k); if (o >= 0 && rcv[o] === 7 - k) s += A[o]; }
        A2[c] = s >>> 0;
      }
      const t = A; A = A2; A2 = t;
    }
    // streams cut: the implicit stream power step (each cell's new height a weighted mean of its
    // own and its receiver's new height: h' = (h + f h_r') / (1 + f)), solved along the drainage
    // all at once: h' = alpha + beta h_r', composed down the chain by pointer jumping, so a fall
    // at the outlet reaches the whole river in a step, as the downstream-first solve does
    for (let c = 0; c < n; c++) {
      al[c] = h[c]; be[c] = 0; pt[c] = c;
      if (flags[c] & 1) continue;
      const k = rcv[c];
      if (k === 8 || F[c] - h[c] > PONDQ || A[c] < T.Acu[c]) continue;
      const r = nb(c, k);
      if (h[c] - h[r] <= 0) continue;
      const X = KH[hd[c]] * AP[apowIndex(A[c])], t = DIAG[k], e = CE[c * 2 + t];
      let f = mul16(X, CM[c * 2 + t]);
      f = e >= 0 ? (f > (FMAX2 >> e) ? FMAX2 : f << e) : f >> -e;
      const b = 65536 - Math.floor(4294967295 / (65536 + f));
      be[c] = b > 65535 ? 65535 : b; pt[c] = r;
      al[c] = h[c] - mul16(h[c], be[c]);
    }
    for (let p = 0; p < PASSES.jump; p++) {
      for (let c = 0; c < n; c++) {
        const q = pt[c];
        if (q === c || be[c] === 0) { al2[c] = al[c]; be2[c] = be[c]; pt2[c] = q; continue; }
        al2[c] = al[c] + mul16(al[q], be[c]);
        be2[c] = (be[c] * be[q]) >>> 16;
        pt2[c] = pt[q];
      }
      let t = al; al = al2; al2 = t; t = be; be = be2; be2 = t; t = pt; pt = pt2; pt2 = t;
    }
    for (let c = 0; c < n; c++) h2[c] = al[c] + mul16(h[pt[c]], be[c]);
    { const t = h; h = h2; h2 = t; }
    // soil creeps
    for (let c = 0; c < n; c++) {
      h2[c] = h[c];
      if (flags[c] & 1) continue;
      let s = 0;
      for (let k = 0; k < 8; k++) {
        const o = nb(c, k);
        if (o < 0) continue;
        let d = h[o] - h[c];
        d = d > 4194304 ? 4194304 : d < -4194304 ? -4194304 : d;
        s += (d * W[c * 8 + k]) >> 8;
      }
      h2[c] = h[c] + mul16(s, KD[hd[c]]);
    }
    { const t = h; h = h2; h2 = t; }
    // slopes collapse: each cell sheds a sixteenth of what's past its rock's angle to each lower
    // neighbour, and takes what its higher neighbours shed (the same sums from either side)
    for (let p = 0; p < PASSES.collapse; p++) {
      for (let c = 0; c < n; c++) {
        let out = 0, inn = 0;
        for (let k = 0; k < 8; k++) {
          const o = nb(c, k);
          if (o < 0) continue;
          const d = D[c * 8 + k] >> 6;
          if (!(flags[c] & 1)) { const ex = h[c] - h[o] - SC[hd[c]] * d; if (ex > 0) out += ex >> 4; }
          if (!(flags[o] & 1)) { const ex = h[o] - h[c] - SC[hd[o]] * d; if (ex > 0) inn += ex >> 4; }
        }
        h2[c] = h[c] - out + inn;
        talus[c] += inn;
      }
      const t = h; h = h2; h2 = t;
    }
  }
  return { h, talus };

  // (the slopes down the filled surface to each neighbour: drop x 1024 / distance, capped)
  function rcvSlopes(c) {
    const sl = rcvSlopes.s || (rcvSlopes.s = new Int32Array(8));
    for (let k = 0; k < 8; k++) {
      const o = nb(c, k);
      if (o < 0) { sl[k] = 0; continue; }
      let d = F[c] - F[o];
      if (d <= 0) { sl[k] = 0; continue; }
      if (d > 1048576) d = 1048576;
      const s = Math.floor((d * 1024) / D[c * 8 + k]);
      sl[k] = s > 134217727 ? 134217727 : s;
    }
    return sl;
  }
}
