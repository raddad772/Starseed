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

// ---- the trace the rivers wear (made once by tools/build-meanders.mjs: meanders.data.js),
// with a grid of its segments for finding the nearest: distances in channel widths
export const MEANDER = { P: 240, iters: 6000, seed: 7, version: 1 };
let field = null;
export function meanderField() {
  if (field) return field;
  const D = MEANDER_DATA, same = D && D.P === MEANDER.P && D.iters === MEANDER.iters && D.seed === MEANDER.seed && D.version === MEANDER.version;
  const T = same ? D : meanderTrace({ P: MEANDER.P, iters: MEANDER.iters, seed: MEANDER.seed });
  const P = T.P, lines = [{ x: Array.from(T.x), y: Array.from(T.y), closed: true, age: 0 }];
  // (the oxbows: the more recent kept, as lakes; the rest filled to swales)
  const nOx = T.oxbows.length;
  T.oxbows.forEach((o, k) => lines.push({ x: Array.from(o.x), y: Array.from(o.y), closed: false, age: (nOx - k) / Math.max(1, nOx) }));
  // segments bucketed by the cells (a width a side) they pass through
  const segs = [], grid = new Map(), key = (i, j) => ((((i % P) + P) % P) * 4099) + j + 2048;
  let ymin = 1e9, ymax = -1e9;
  lines.forEach((L, li) => {
    const n = L.x.length, m = L.closed ? n : n - 1;
    for (let k = 0; k < m; k++) {
      const b = (k + 1) % n, x0 = L.x[k], y0 = L.y[k];
      let dx = L.x[b] - x0;
      if (dx < -P / 2) dx += P; if (dx > P / 2) dx -= P;
      const s = segs.length;
      segs.push({ x0, y0, dx, dy: L.y[b] - y0, line: li, age: L.age });
      ymin = Math.min(ymin, y0); ymax = Math.max(ymax, y0);
      const i0 = Math.floor(Math.min(x0, x0 + dx)) - 1, i1 = Math.floor(Math.max(x0, x0 + dx)) + 1, j0 = Math.floor(Math.min(y0, y0 + segs[s].dy)) - 1, j1 = Math.floor(Math.max(y0, y0 + segs[s].dy)) + 1;
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { const kk = key(i, j); let l = grid.get(kk); if (!l) grid.set(kk, l = []); l.push(s); }
    }
  });
  // (the belt's middle: the trace swings about it)
  const mid = 0.5 * (ymin + ymax);
  field = { P, segs, grid, key, mid, half: 0.5 * (ymax - ymin) };
  return field;
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
