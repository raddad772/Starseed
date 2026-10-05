// Meanders: a river on a gentle floodplain swings from side to side, eroding its outer banks
// and building its inner ones; its bends grow, migrate downstream, and when two loops touch the
// river cuts through and leaves the loop behind as an oxbow lake. Simulated once (the Howard &
// Knutson 1984 kinematic model: each point of the channel's centreline moves sideways at a rate
// set by its curvature and, more, by the curvature upstream of it), on a periodic valley P
// channel widths long, so it can be laid along any river, scaled to its width (rivers.js's
// readers: refine.js and terrain.js).
//
// Lengths in channel widths. Deterministic: plain arithmetic, dmath, a seeded start.

import * as dm from '../core/dmath.js';
import { Rng } from '../core/rng.js';
import { MEANDER_DATA } from './meanders.data.js';
import { ROCKS } from './worldsim/lithology.js';
import { MATERIALS } from './worldsim/materials.js';

// the centreline after `iters` steps: { x, y } (Float64Arrays, along the valley and across it,
// widths; x wraps at P), and the oxbows cut off on the way ({ x, y } each)
export function meanderTrace(opts = {}) {
  const P = opts.P ?? 240, ds = opts.ds ?? 0.5, iters = opts.iters ?? 2500, seed = opts.seed ?? 7;
  const dt = opts.dt ?? 0.04, Omega = -1, Gamma = 2.5, alpha = 0.5;   // (the model's weights; the upstream kernel's decay a width)
  const rng = new Rng([seed, 0x3ea, 0xde5, 0x11]);
  const NECK = opts.neck ?? 1.6;   // (a neck this many widths across breaks through)
  // a nearly straight start, a little uneven
  let x = [], y = [];
  for (let s = 0; s < P; s += ds) { x.push(s); y.push(0.3 * (rng.next() - 0.5)); }
  const oxbows = [];
  for (let it = 0; it < iters; it++) {
    const n = x.length;
    // curvature at each point (signed), and the arc lengths
    const C = new Float64Array(n), nx = new Float64Array(n), ny = new Float64Array(n), L = new Float64Array(n);
    for (let k = 0; k < n; k++) {
      const a = (k + n - 1) % n, b = (k + 1) % n;
      let dxa = x[k] - x[a], dxb = x[b] - x[k];
      if (dxa < -P / 2) dxa += P; if (dxa > P / 2) dxa -= P;
      if (dxb < -P / 2) dxb += P; if (dxb > P / 2) dxb -= P;
      const dya = y[k] - y[a], dyb = y[b] - y[k];
      const la = Math.sqrt(dxa * dxa + dya * dya), lb = Math.sqrt(dxb * dxb + dyb * dyb);
      const ta = dm.atan2(dya, dxa), tb = dm.atan2(dyb, dxb);
      let dth = tb - ta;
      if (dth > dm.PI) dth -= dm.TWO_PI; if (dth < -dm.PI) dth += dm.TWO_PI;
      C[k] = dth / (0.5 * (la + lb));
      const tx = dxa / la + dxb / lb, ty = dya / la + dyb / lb, tl = Math.sqrt(tx * tx + ty * ty) || 1;
      nx[k] = -ty / tl; ny[k] = tx / tl; L[k] = lb;
    }
    // the migration rate: the local curvature, and more the curvature upstream, fading a width
    // or two back (where the faster water hits the outer bank)
    const Rm = new Float64Array(n);
    for (let k = 0; k < n; k++) {
      let s = 0, w = 0, d = 0;
      for (let j = 1; j < 40; j++) { const q = (k - j + n) % n; d += L[q]; const g = dm.exp(-alpha * d); s += C[q] * g; w += g; }
      Rm[k] = Omega * C[k] + Gamma * s / w;
    }
    // (toward the outer bank: away from the bend's centre, which lies on the side the channel
    // turns to, the left normal's for a positive curvature)
    for (let k = 0; k < n; k++) { const mv = Math.max(-0.1, Math.min(0.1, dt * Rm[k])); x[k] -= mv * nx[k]; y[k] -= mv * ny[k]; }
    // (a little smoothing of the line: the point spacing's own jitter)
    {
      const n1 = x.length, sx = new Float64Array(n1), sy = new Float64Array(n1);
      for (let k = 0; k < n1; k++) {
        const a = (k + n1 - 1) % n1, b = (k + 1) % n1;
        let dxa = x[a] - x[k], dxb = x[b] - x[k];
        if (dxa < -P / 2) dxa += P; if (dxa > P / 2) dxa -= P;
        if (dxb < -P / 2) dxb += P; if (dxb > P / 2) dxb -= P;
        sx[k] = x[k] + 0.02 * (dxa + dxb); sy[k] = y[k] + 0.02 * (y[a] + y[b] - 2 * y[k]);
      }
      for (let k = 0; k < n1; k++) { x[k] = sx[k]; y[k] = sy[k]; }
    }
    for (let k = 0; k < n; k++) x[k] = ((x[k] % P) + P) % P;
    // keep the points ds apart along the channel (resampled by arc length round the period)
    {
      const n1 = x.length, cum = new Float64Array(n1 + 1);
      for (let k = 0; k < n1; k++) {
        const b = (k + 1) % n1;
        let dx = x[b] - x[k];
        if (dx < -P / 2) dx += P; if (dx > P / 2) dx -= P;
        const dy = y[b] - y[k];
        cum[k + 1] = cum[k] + Math.sqrt(dx * dx + dy * dy);
      }
      const total = cum[n1], m1 = Math.max(16, Math.round(total / ds)), x2 = [], y2 = [];
      let k = 0;
      for (let i = 0; i < m1; i++) {
        const st = i * total / m1;
        while (k < n1 - 1 && cum[k + 1] < st) k++;
        const b = (k + 1) % n1, f = (st - cum[k]) / Math.max(1e-9, cum[k + 1] - cum[k]);
        let dx = x[b] - x[k];
        if (dx < -P / 2) dx += P; if (dx > P / 2) dx -= P;
        x2.push((((x[k] + dx * f) % P) + P) % P); y2.push(y[k] + (y[b] - y[k]) * f);
      }
      x = x2; y = y2;
    }
    // cutoffs: two points far apart along the channel but within a width of each other: the
    // river breaks through, the loop between left behind (the shorter way round; found by a grid
    // of width-sized buckets over the whole channel)
    if (it % 2 === 0) {
      let cut = true;
      while (cut) {
        cut = false;
        const m = x.length, bk = new Map(), key = (i, j) => (((i % nb) + nb) % nb) * 100003 + j, nb = Math.ceil(P);
        for (let k = 0; k < m; k++) { const kk = key(Math.floor(x[k]), Math.floor(y[k])); let l = bk.get(kk); if (!l) bk.set(kk, l = []); l.push(k); }
        for (let k = 0; k < m && !cut; k++) {
          const i0 = Math.floor(x[k]), j0 = Math.floor(y[k]);
          for (let dj = -1; dj <= 1 && !cut; dj++) for (let di = -1; di <= 1 && !cut; di++) {
            const l = bk.get(key(i0 + di, j0 + dj));
            if (!l) continue;
            for (const j of l) {
              let span = j - k;
              if (span <= 0) continue;
              const around = m - span;
              if (Math.min(span, around) < 8) continue;
              let dx = x[j] - x[k];
              if (dx < -P / 2) dx += P; if (dx > P / 2) dx -= P;
              const dy = y[j] - y[k];
              if (dx * dx + dy * dy >= NECK * NECK) continue;
              // (the loop is the way between them that makes no headway down the valley; the
              // other way round wraps the period)
              let net = 0;
              for (let q = k; q < j; q++) { let d = x[q + 1] - x[q]; if (d < -P / 2) d += P; if (d > P / 2) d -= P; net += d; }
              if (Math.abs(net) < P / 2) {
                oxbows.push({ x: Float64Array.from(x.slice(k, j + 1)), y: Float64Array.from(y.slice(k, j + 1)), at: it });
                x.splice(k + 1, j - k - 1); y.splice(k + 1, j - k - 1);
              } else {
                oxbows.push({ x: Float64Array.from(x.slice(j).concat(x.slice(0, k + 1))), y: Float64Array.from(y.slice(j).concat(y.slice(0, k + 1))), at: it });
                x = x.slice(k, j + 1); y = y.slice(k, j + 1);
              }
              cut = true;
              break;
            }
          }
        }
      }
    }
  }
  return { P, x: Float64Array.from(x), y: Float64Array.from(y), oxbows };
}

// the model's velocity at each point of a closed centreline (x wrapping at P): { x, y }, widths a
// step (meanderTrace's migration, without its cap)
export function migration(x, y, P) {
  const n = x.length, Omega = -1, Gamma = 2.5, alpha = 0.5;
  const C = new Float64Array(n), nx = new Float64Array(n), ny = new Float64Array(n), L = new Float64Array(n);
  for (let k = 0; k < n; k++) {
    const a = (k + n - 1) % n, b = (k + 1) % n;
    let dxa = x[k] - x[a], dxb = x[b] - x[k];
    if (dxa < -P / 2) dxa += P; if (dxa > P / 2) dxa -= P;
    if (dxb < -P / 2) dxb += P; if (dxb > P / 2) dxb -= P;
    const dya = y[k] - y[a], dyb = y[b] - y[k];
    const la = Math.sqrt(dxa * dxa + dya * dya), lb = Math.sqrt(dxb * dxb + dyb * dyb);
    let dth = dm.atan2(dyb, dxb) - dm.atan2(dya, dxa);
    if (dth > dm.PI) dth -= dm.TWO_PI; if (dth < -dm.PI) dth += dm.TWO_PI;
    C[k] = dth / (0.5 * (la + lb));
    const tx = dxa / la + dxb / lb, ty = dya / la + dyb / lb, tl = Math.sqrt(tx * tx + ty * ty) || 1;
    nx[k] = -ty / tl; ny[k] = tx / tl; L[k] = lb;
  }
  const vx = new Float64Array(n), vy = new Float64Array(n);
  for (let k = 0; k < n; k++) {
    let s = 0, w = 0, d = 0;
    for (let j = 1; j < 40; j++) { const q = (k - j + n) % n; d += L[q]; const g = dm.exp(-alpha * d); s += C[q] * g; w += g; }
    const Rm = Omega * C[k] + Gamma * s / w;
    vx[k] = -Rm * nx[k]; vy[k] = -Rm * ny[k];
  }
  return { x: vx, y: vy };
}

// ---- the trace the rivers wear (made once by tools/build-meanders.mjs: meanders.data.js), and the
// gentler ones a river less free to wander wears instead; with a grid of the trace's segments for
// finding the nearest. Lengths in channel widths
export const MEANDER = { P: 240, iters: 6000, seed: 7, version: 1 };
// (the model's widths are MEANDER_U of a river's: its bends come ~18 of its widths apart along the
// valley and turn ~5.4 round at their apexes, a river's ~11 and ~2.4 (Leopold and Wolman 1960: a
// meander's wavelength ~11 widths, the radius at its apex ~a fifth of that). Scaled whole: pressed
// across alone, as they were (0.6), the loops were drawn out along the valley into fingers)
export const MEANDER_U = 0.62;
// (the family: the trace's bends each turned a times as far from the valley's way, a = 0 (straight)
// to 1 (the trace's own), at MEANDER_NL even steps. Langbein and Leopold 1966: a meander is the
// curve whose direction changes most evenly along it, the same curve whether it wanders a little
// or a lot, its angle to the valley's way the measure: a gentle river's bends are a mature one's
// turned less, not squashed across, and its sinuosity follows (1.03 at a = 0.2, 1.24 at 0.5, 1.8 at
// 0.8, the trace's 2.85 at 1). Each at the same points along the channel, laid over the same period,
// so a river's channel can go from one to the next smoothly)
export const MEANDER_NL = 11;
let field = null;
export function meanderField() {
  if (field) return field;
  const D = MEANDER_DATA, same = D && D.P === MEANDER.P && D.iters === MEANDER.iters && D.seed === MEANDER.seed && D.version === MEANDER.version;
  const T = same ? D : meanderTrace({ P: MEANDER.P, iters: MEANDER.iters, seed: MEANDER.seed });
  const P0 = T.P, U = MEANDER_U, P = P0 * U, n = T.x.length;
  // each segment's way (unwound, so it turns continuously) and length
  const th = new Float64Array(n), ds = new Float64Array(n);
  for (let k = 0; k < n; k++) {
    const b = (k + 1) % n;
    let dx = T.x[b] - T.x[k];
    if (dx < -P0 / 2) dx += P0; if (dx > P0 / 2) dx -= P0;
    const dy = T.y[b] - T.y[k];
    th[k] = dm.atan2(dy, dx); ds[k] = Math.sqrt(dx * dx + dy * dy);
    if (k) { while (th[k] - th[k - 1] > dm.PI) th[k] -= dm.TWO_PI; while (th[k] - th[k - 1] < -dm.PI) th[k] += dm.TWO_PI; }
  }
  // (the channel's slow drift across its valley taken out, the loops kept: the belt centred on the
  // valley's line; the moving mean of y over ~25 widths)
  const NB = 120, unDrift = (x, y, m) => {
    const bin = new Float64Array(NB), cnt = new Float64Array(NB), mean = new Float64Array(NB);
    for (let k = 0; k < m; k++) { const i = Math.floor((((x[k] % P0) + P0) % P0) / P0 * NB) % NB; bin[i] += y[k]; cnt[i]++; }
    for (let i = 0; i < NB; i++) { let sm = 0, sw = 0; for (let j = -10; j <= 10; j++) { const q = (i + j + NB) % NB; sm += bin[q]; sw += cnt[q]; } mean[i] = sw ? sm / sw : 0; }
    return (xq) => { const f = (((xq % P0) + P0) % P0) / P0 * NB, i = Math.floor(f) % NB, t = f - Math.floor(f); return mean[i] * (1 - t) + mean[(i + 1) % NB] * t; };
  };
  const levels = [];
  let drift1 = null, mid1 = 0, Ltot = 0;
  for (let k = 0; k < n; k++) Ltot += ds[k];
  for (let l = 0; l < MEANDER_NL; l++) {
    const a = l / (MEANDER_NL - 1), px = new Float64Array(n + 1), py = new Float64Array(n + 1);
    px[0] = T.x[0]; py[0] = T.y[0];
    for (let k = 0; k < n; k++) { px[k + 1] = px[k] + dm.cos(a * th[k]) * ds[k]; py[k + 1] = py[k] + dm.sin(a * th[k]) * ds[k]; }
    // (turned back to run along the valley and stretched over its period: a gentler curve is
    // shorter. The trace's own (a = 1) is itself)
    const X = px[n] - px[0], Y = py[n] - py[0], Lc = Math.sqrt(X * X + Y * Y), c = X / Lc, sn = -Y / Lc, sc = P0 / Lc;
    for (let k = 1; k <= n; k++) { const qx = px[k] - px[0], qy = py[k] - py[0]; px[k] = px[0] + (qx * c - qy * sn) * sc; py[k] = py[0] + (qx * sn + qy * c) * sc; }
    const dr = unDrift(px, py, n);
    const y = new Float64Array(n);
    let lo = 1e9, hi = -1e9;
    for (let k = 0; k < n; k++) { y[k] = py[k] - dr(px[k]); lo = Math.min(lo, y[k]); hi = Math.max(hi, y[k]); }
    const mid = 0.5 * (lo + hi);
    for (let k = 0; k < n; k++) y[k] = (y[k] - mid) * U;
    for (let k = 0; k <= n; k++) px[k] *= U;
    if (l === MEANDER_NL - 1) { drift1 = dr; mid1 = mid; }
    levels.push({ a, xu: px, y, half: 0.5 * (hi - lo) * U, sinuosity: Ltot * sc / P0 });
  }
  // (where each point of the channel is moving, as the model moves it: toward its outer bank, the
  // faster where the bends upstream turn harder; scaled so that the trace's own root mean square is
  // 1 (how far a river's banks have moved while it cut down, its share here), a gentler curve's
  // slower by as much as it turns less)
  let rms = 1;
  for (let l = MEANDER_NL - 1; l >= 0; l--) {
    const L = levels[l], xw = new Float64Array(n);
    for (let k = 0; k < n; k++) xw[k] = ((L.xu[k] % P) + P) % P;
    const mv = migration(xw, L.y, P);
    if (l === MEANDER_NL - 1) { let ss = 0; for (let k = 0; k < n; k++) ss += mv.x[k] * mv.x[k] + mv.y[k] * mv.y[k]; rms = Math.sqrt(ss / n) || 1; }
    // (a few points at the tightest bends run far faster: held to 3)
    for (let k = 0; k < n; k++) { const f = Math.min(1 / rms, 3 / (Math.sqrt(mv.x[k] * mv.x[k] + mv.y[k] * mv.y[k]) || 1)); mv.x[k] *= f; mv.y[k] *= f; }
    L.mx = mv.x; L.my = mv.y;
  }
  // the trace's own as a line, and the oxbows it cut off on the way: the more recent kept, as lakes;
  // the rest filled to swales (in its frame: only the trace's own has them)
  const L1 = levels[MEANDER_NL - 1];
  const lines = [{ x: Array.from(L1.xu.subarray(0, n), (v) => ((v % P) + P) % P), y: Array.from(L1.y), mx: L1.mx, my: L1.my, closed: true, age: 0 }];
  const nOx = T.oxbows.length;
  T.oxbows.forEach((o, k) => lines.push({ x: Array.from(o.x, (v) => v * U), y: Array.from(o.y, (v, q) => (v - drift1(o.x[q]) - mid1) * U), closed: false, age: (nOx - k) / Math.max(1, nOx) }));
  // segments bucketed by the cells (a width a side) they pass through
  const segs = [], grid = new Map(), key = (i, j) => ((((i % P) + P) % P) * 4099) + j + 2048;
  lines.forEach((L, li) => {
    const m = L.x.length, ms = L.closed ? m : m - 1;
    for (let k = 0; k < ms; k++) {
      const b = (k + 1) % m, x0 = L.x[k], y0 = L.y[k];
      let dx = L.x[b] - x0;
      if (dx < -P / 2) dx += P; if (dx > P / 2) dx -= P;
      const s = segs.length;
      segs.push({ x0, y0, dx, dy: L.y[b] - y0, line: li, age: L.age });
      const i0 = Math.floor(Math.min(x0, x0 + dx)) - 1, i1 = Math.floor(Math.max(x0, x0 + dx)) + 1, j0 = Math.floor(Math.min(y0, y0 + segs[s].dy)) - 1, j1 = Math.floor(Math.max(y0, y0 + segs[s].dy)) + 1;
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { const kk = key(i, j); let l = grid.get(kk); if (!l) grid.set(kk, l = []); l.push(s); }
    }
  });
  // (the belt's half width at a: how far the channel swings either side of the valley's line; and
  // the a whose belt is h)
  const halfOf = (a) => { const f = dm.clamp(a, 0, 1) * (MEANDER_NL - 1), i = Math.min(MEANDER_NL - 2, Math.floor(f)), t = f - i; return levels[i].half + (levels[i + 1].half - levels[i].half) * t; };
  const aOfHalf = (h) => {
    if (h >= L1.half) return 1;
    for (let i = 1; i < MEANDER_NL; i++) if (levels[i].half >= h) return (i - 1 + (h - levels[i - 1].half) / Math.max(1e-9, levels[i].half - levels[i - 1].half)) / (MEANDER_NL - 1);
    return 0;
  };
  // (and the a whose channel is P times as long as its valley)
  const aOfSinuosity = (Pq) => {
    if (Pq >= L1.sinuosity) return 1;
    for (let i = 1; i < MEANDER_NL; i++) if (levels[i].sinuosity >= Pq) return (i - 1 + (Pq - levels[i - 1].sinuosity) / Math.max(1e-9, levels[i].sinuosity - levels[i - 1].sinuosity)) / (MEANDER_NL - 1);
    return 0;
  };
  field = { P, U, n, levels, segs, grid, key, mid: 0, half: L1.half, halfOf, aOfHalf, aOfSinuosity, lines };
  return field;
}
// how sinuous a river's channel is (its length over its valley's; 1 straight), from the slope S its
// water runs down, its width W (m) and the rock it runs over (lithology.js's; 255 not known: alluvium):
// its bed's grain (D50, m) and its banks' silt and clay (M, %), materials.js. Its bankfull discharge
// from its width as the rivers' regime has it (W = 4.8 Q^0.5, terrain.js _riverWater; van den Berg's
// own, 4.7), its potential specific stream power omega = 2.1 S Q^0.5 kW/m^2 (van den Berg 1995). Under
// 90 D50^0.42 W/m^2 it can't move its banks: laterally inactive, it keeps the line its valley gave it;
// over 900 D50^0.42 it braids (Kleinhans and van den Berg 2011), its threads over a belt that runs
// nearly straight (~1.1: Rust 1978, under 1.3). Between, it meanders as far as its banks let it,
// the more silt and clay holding them the further: P = 0.94 M^0.25 (Schumm 1963). Each threshold
// crossed over a factor of two either side (their data's scatter about them)
export function riverSinuosity(S, W, rock) { return riverPattern(S, W, rock).P; }
// the same, and whether it braids: braid (0..1, across the threshold's scatter) and its braiding index
// Bi, the threads it splits into, from its bars: the bar mode m^2 = 0.17 g (n - 3) W^3 S / (sqrt(Delta
// D50) C Q) (Crosato and Mosselman 2009: n the nonlinearity of its sediment transport, 4 for sand, 10
// for gravel; C its Chezy, from Manning's n 0.035 (_riverWater's) and its depth D), Bi = (m - 1) / 2 + 1
const _pat = { P: 1, braid: 0, Bi: 1 };
export function riverPattern(S, W, rock, D = 0, out = _pat) {
  const nm = ROCKS[rock] ? ROCKS[rock].name : 'alluvium', Mt = MATERIALS[nm] && MATERIALS[nm].grain ? MATERIALS[nm] : MATERIALS.alluvium;
  const Q = (W / 4.8) * (W / 4.8), om = 2100 * Math.max(S, 0) * Math.sqrt(Q), dk = dm.pow(Mt.grain, 0.42);
  out.P = 1; out.braid = 0; out.Bi = 1;
  if (!(om > 0)) return out;
  const Pm = Math.max(1, 0.94 * dm.pow(Math.max(Mt.fines, 1), 0.25));
  const active = dm.smoothstep(-0.69, 0.69, dm.log(om / (90 * dk))), braid = dm.smoothstep(-0.69, 0.69, dm.log(om / (900 * dk)));
  out.P = 1 + (Pm - 1) * active * (1 - braid) + 0.1 * braid;
  out.braid = braid;
  if (braid > 0) {
    const n = Mt.grain >= 2e-3 ? 10 : 4, Dd = Math.max(0.3, D || 0.3 * Math.sqrt(W)), C = dm.pow(Dd, 1 / 6) / 0.035;
    const m2 = 0.17 * 9.81 * (n - 3) * W * W * W * Math.max(S, 0) / (Math.sqrt(1.65 * Mt.grain) * C * Q);
    out.Bi = Math.max(1, (Math.sqrt(m2) - 1) / 2 + 1);
  }
  return out;
}

// a point of the family's channel (k: its index, 0..n; xu unwound) where it swings a: into o (x, y,
// mx, my: widths, as levels hold them), the two levels round a blended
export function meanderPoint(F, k, a, o) {
  const f = dm.clamp(a, 0, 1) * (MEANDER_NL - 1), i = Math.min(MEANDER_NL - 2, Math.floor(f)), t = f - i, A = F.levels[i], B = F.levels[i + 1];
  const kk = k % F.n;
  o.x = A.xu[k] + (B.xu[k] - A.xu[k]) * t;
  o.y = A.y[kk] + (B.y[kk] - A.y[kk]) * t;
  o.mx = A.mx[kk] + (B.mx[kk] - A.mx[kk]) * t;
  o.my = A.my[kk] + (B.my[kk] - A.my[kk]) * t;
  return o;
}
// the nearest channel and oxbow to (X, Y) (widths along the valley, wrapped, and across it from
// the belt's middle): out.d (to the channel), out.ox (to the nearest oxbow), out.oxAge (0..1)
export function meanderNear(F, X, Y, out) {
  const P = F.P, x = ((X % P) + P) % P, y = Y + F.mid, i0 = Math.floor(x), j0 = Math.floor(y);
  let d = 1e9, ox = 1e9, oxAge = 1;
  for (let j = j0 - 1; j <= j0 + 1; j++) for (let i = i0 - 1; i <= i0 + 1; i++) {
    const l = F.grid.get(F.key(i, j));
    if (!l) continue;
    for (const s of l) {
      const S = F.segs[s];
      let px = x - S.x0;
      if (px < -P / 2) px += P; if (px > P / 2) px -= P;
      const py = y - S.y0, L2 = S.dx * S.dx + S.dy * S.dy, t = L2 > 0 ? Math.max(0, Math.min(1, (px * S.dx + py * S.dy) / L2)) : 0;
      const ex = px - t * S.dx, ey = py - t * S.dy, dd = Math.sqrt(ex * ex + ey * ey);
      if (S.line === 0) { if (dd < d) d = dd; } else if (dd < ox) { ox = dd; oxAge = S.age; }
    }
  }
  out.d = d; out.ox = ox; out.oxAge = oxAge;
  return out;
}

// the same with the trace's swing across scaled by A (0..1: a river kept nearer its valley's line
// swings less, its loops the same length along it): Y in widths across, unscaled. Distances are
// true ones (widths), so a river may swing anything from its full belt to none, smoothly. Only
// what comes within a width or so is found (out.d 1e9 beyond)
export function meanderNearA(F, X, Y, A, out) {
  if (F.ylo === undefined) { let lo = 1e9, hi = -1e9; for (const S of F.segs) { lo = Math.min(lo, S.y0, S.y0 + S.dy); hi = Math.max(hi, S.y0, S.y0 + S.dy); } F.ylo = Math.floor(lo) - 1; F.yhi = Math.ceil(hi) + 1; }
  const P = F.P, x = ((X % P) + P) % P, i0 = Math.floor(x), mid = F.mid, a = Math.max(A, 1e-3);
  // (the trace's rows that, scaled, come within a width of the point)
  const j0 = Math.max(F.ylo, Math.floor(mid + (Y - 1) / a)), j1 = Math.min(F.yhi, Math.floor(mid + (Y + 1) / a));
  let d = 1e9, ox = 1e9, oxAge = 1;
  for (let j = j0; j <= j1; j++) for (let i = i0 - 1; i <= i0 + 1; i++) {
    const l = F.grid.get(F.key(i, j));
    if (!l) continue;
    for (const s of l) {
      const S = F.segs[s];
      let px = x - S.x0;
      if (px < -P / 2) px += P; if (px > P / 2) px -= P;
      const py = Y - a * (S.y0 - mid), sy = a * S.dy, L2 = S.dx * S.dx + sy * sy, t = L2 > 0 ? Math.max(0, Math.min(1, (px * S.dx + py * sy) / L2)) : 0;
      const ex = px - t * S.dx, ey = py - t * sy, dd = Math.sqrt(ex * ex + ey * ey);
      if (S.line === 0) { if (dd < d) d = dd; } else if (dd < ox) { ox = dd; oxAge = S.age; }
    }
  }
  out.d = d; out.ox = ox; out.oxAge = oxAge;
  return out;
}
