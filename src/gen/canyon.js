// A canyon's walls as its rock stands them and its history wore them back. The river cut down
// through the beds (geology.js: hardness by height, 1 m steps from col.lo); each bed stands at
// its own slope where the river laid it bare (a hard one, sandstone, limestone, a basalt flow's
// core, granite, nearly sheer; a soft one, shale, a flow's broken top, at the angle its debris
// rests at), and since then has weathered back, the more the softer it is and the longer it has
// stood: the walls high up, bared first, have gone back furthest. So a bedded rock steps up in
// cliffs and benches that widen upward (the Grand Canyon's), a massive one leans back evenly
// (a V in granite), and the youngest walls, by the river, stand steepest (an inner gorge).
//
// How far it has gone back (mu) is what makes the canyon take out the rock the terrain's coarser
// levels have missing there, so seen from afar it is their valley again.
//
// On the inside of a meander's bend the river has been moving away while it cut down: the ground
// it left is a slope (a slip-off slope) no steeper than its cutting down over its moving across;
// on the outside it cut its bank as it came (a cliff).
//
// Read across the canyon at any sampling, averaged over it (a across): from afar the walls' mean
// slope, close up each cliff. All by tables of the column (prefix sums and their integrals), so a
// wall's place at a height, the height at a place and the average over any stretch each take a
// few reads (the height by bisection on the place).
//
// Units: heights as column indices (i = height + offset - col.lo); places in metres from the
// canyon's line.

import * as dm from '../core/dmath.js';

const tanOf = (hd) => { const s = dm.smoothstep(0.35, 0.8, hd); return 0.6 + 9 * s * s; };

// a column's tables: U (the run of its walls up from its foot: each metre's 1/tan), S (its
// softness: 1 - hardness) and S1 (softness by height), each with its integral (UT, ST, S1T),
// all piecewise linear between whole metres
const _tabs = new WeakMap();
export function canyonTable(col) {
  let T = _tabs.get(col);
  if (T) return T;
  const n = col.hard.length;
  const U = new Float64Array(n + 1), S = new Float64Array(n + 1), S1 = new Float64Array(n + 1);
  for (let z = 0; z < n; z++) {
    const hd = col.hard[z], so = 1 - hd;
    U[z + 1] = U[z] + 1 / tanOf(hd); S[z + 1] = S[z] + so; S1[z + 1] = S1[z] + so * (z + 0.5);
  }
  const integ = (A) => { const I = new Float64Array(n + 1); for (let z = 0; z < n; z++) I[z + 1] = I[z] + 0.5 * (A[z] + A[z + 1]); return I; };
  _tabs.set(col, T = { lo: col.lo, n, U, S, S1, UT: integ(U), ST: integ(S), S1T: integ(S1), suite: col.suite });
  return T;
}

// a table's value at i (piecewise linear), and its integral from 0 to i
function val(A, n, i) {
  if (i <= 0) return A[0] + i * (A[1] - A[0]);
  if (i >= n) return A[n] + (i - n) * (A[n] - A[n - 1]);
  const j = Math.floor(i), f = i - j;
  return A[j] + f * (A[j + 1] - A[j]);
}
function integ(A, I, n, i) {
  if (i <= 0) return i * A[0];
  if (i >= n) { const s = A[n] - A[n - 1], d = i - n; return I[n] + d * A[n] + 0.5 * s * d * d; }
  const j = Math.floor(i), f = i - j;
  return I[j] + f * A[j] + 0.5 * f * f * (A[j + 1] - A[j]);
}

// a canyon's wall: in the column T, its floor F (m) and half width Wf (m), the beds offset there
// (off), worn back by mu. Kept in w (reused)
export function wallSet(w, T, F, Wf, off, mu) {
  const n = T.n, iF = F + off - T.lo;
  w.T = T; w.iF = iF; w.Wf = Wf; w.off = off; w.mu = mu; w.base = T.lo - off;
  w.UF = val(T.U, n, iF); w.SF = val(T.S, n, iF); w.S1F = val(T.S1, n, iF);
  w.UTF = integ(T.U, T.UT, n, iF); w.STF = integ(T.S, T.ST, n, iF); w.S1TF = integ(T.S1, T.S1T, n, iF);
  return w;
}
// how far from the line the wall stands at height index i (m)
export function wallX(w, i) {
  const T = w.T, n = T.n;
  return w.Wf + (val(T.U, n, i) - w.UF) + w.mu * ((val(T.S1, n, i) - w.S1F) - w.iF * (val(T.S, n, i) - w.SF));
}
// the area between the line and the wall from the floor up to height index i (m^2)
function wallA(w, i) {
  const T = w.T, n = T.n, di = i - w.iF;
  const u = integ(T.U, T.UT, n, i) - w.UTF - di * w.UF;
  const e = (integ(T.S1, T.S1T, n, i) - w.S1TF - di * w.S1F) - w.iF * (integ(T.S, T.ST, n, i) - w.STF - di * w.SF);
  return w.Wf * di + u + w.mu * e;
}
// how far it must wear back (mu) for the canyon up to height index iT to take out `gone` (m^2 a
// side), its top no further out than xMax; 0 if it takes out that much as it stands
export function wallFit(w, iT, gone, xMax) {
  const T = w.T, n = T.n, D = iT - w.iF;
  if (D <= 0) return 0;
  const u = integ(T.U, T.UT, n, iT) - w.UTF - D * w.UF;
  const e = (integ(T.S1, T.S1T, n, iT) - w.S1TF - D * w.S1F) - w.iF * (integ(T.S, T.ST, n, iT) - w.STF - D * w.SF);
  const dU = val(T.U, n, iT) - w.UF, dE = (val(T.S1, n, iT) - w.S1F) - w.iF * (val(T.S, n, iT) - w.SF);
  let mu = e > 1e-9 ? (gone - w.Wf * D - u) / e : 0;
  if (dE > 1e-9) mu = Math.min(mu, (xMax - w.Wf - dU) / dE);
  return Math.max(0, mu);
}
// the wall's height index d metres from the line (on up to iTop, level beyond)
function wallI(w, d, iTop) {
  if (d <= w.Wf || iTop <= w.iF) return w.iF;
  const xt = wallX(w, iTop);
  if (d >= xt) return iTop;
  let a = w.iF, xa = w.Wf, b = iTop, xb = xt, lo = Math.ceil(a), hi = Math.floor(b);
  while (lo <= hi) {
    const m = (lo + hi) >> 1, xm = wallX(w, m);
    if (xm <= d) { a = m; xa = xm; lo = m + 1; } else { b = m; xb = xm; hi = m - 1; }
  }
  return xb > xa ? a + (b - a) * (d - xa) / (xb - xa) : a;
}
// the integral of the wall's height index from the line out to s (s >= 0)
function wallG(w, s, iTop) {
  const i = wallI(w, s, iTop);
  return s * i - wallA(w, i);
}
// a slip-off slope's: from the floor's edge rising k (index a metre) to iTop
function rampG(w, s, k, iTop) {
  const iF = w.iF, Wf = w.Wf;
  if (s <= Wf) return s * iF;
  const dt = Wf + (iTop - iF) / k;
  if (s <= dt) { const u = s - Wf; return s * iF + 0.5 * k * u * u; }
  return dt * iF + 0.5 * (iTop - iF) * (dt - Wf) + (s - dt) * iTop;
}

// the canyon's height (m) d metres from its line, averaged over a stretch a across (folded at the
// line), its walls up to iTop. With k > 0 (the inside of a bend: index a metre) no steeper than
// a slip-off slope rising k
export function wallAt(w, d, a, iTop, k = 0) {
  d = Math.abs(d);
  const ha = 0.5 * a;
  if (ha < 0.25) {
    let i = wallI(w, d, iTop);
    if (k > 0) i = Math.min(i, d <= w.Wf ? w.iF : Math.min(iTop, w.iF + (d - w.Wf) * k));
    return i + w.base;
  }
  const lo = d - ha, hi = d + ha;
  const G = (s) => wallG(w, s, iTop), avg = (lo >= 0 ? G(hi) - G(lo) : G(hi) + G(-lo)) / (hi - lo);
  if (!(k > 0)) return avg + w.base;
  const Gr = (s) => rampG(w, s, k, iTop), ar = (lo >= 0 ? Gr(hi) - Gr(lo) : Gr(hi) + Gr(-lo)) / (hi - lo);
  return Math.min(avg, ar) + w.base;
}
// how far from its line the wall reaches height index iTop (m)
export function wallReach(w, iTop) { return iTop <= w.iF ? w.Wf : wallX(w, iTop); }
