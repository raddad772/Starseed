// A canyon's walls as its rock stands them: from its floor up to its rim each bed weathers back
// to its own slope (a hard one, sandstone, limestone, a basalt flow's core, granite, nearly sheer;
// a soft one, shale, a flow's broken top, at the angle its debris rests at), so a bedded rock
// steps up in cliffs and benches (the Grand Canyon's), a massive one stands as one wall (the
// Black Canyon's). Read across the canyon at any sampling, averaged over it (minW across): from
// afar the walls' mean slope, close up each cliff.
//
// Its table for a rock column (geology.js: hardness by height, 1 m steps from col.lo): U(z), how
// far back from the floor's edge the wall stands at height z above a floor at the column's foot
// (the sum of each metre's run, 1/tan of its slope); and the inverse, the height at each metre
// back (Z), with its running sum (ZI) so any stretch of it averages in two reads.

import * as dm from '../core/dmath.js';

const tanOf = (hd) => { const s = dm.smoothstep(0.35, 0.8, hd); return 0.6 + 9 * s * s; };

const _tabs = new WeakMap();
export function canyonTable(col) {
  let T = _tabs.get(col);
  if (T) return T;
  const n = col.hard.length, U = new Float64Array(n + 1), UI = new Float64Array(n + 2);
  for (let z = 0; z < n; z++) U[z + 1] = U[z] + 1 / tanOf(col.hard[z]);
  for (let z = 0; z <= n; z++) UI[z + 1] = UI[z] + U[z];
  const m = Math.ceil(U[n]) + 2, Z = new Float32Array(m), ZI = new Float64Array(m + 1);
  for (let s = 0, z = 0; s < m; s++) {
    while (z < n && U[z + 1] < s) z++;
    Z[s] = z >= n ? n : z + (s - U[z]) / Math.max(1e-9, U[z + 1] - U[z]);
    ZI[s + 1] = ZI[s] + Z[s];
  }
  _tabs.set(col, T = { lo: col.lo, n, U, UI, Z, ZI, m, suite: col.suite });
  return T;
}

// U at a height (m above the column's foot), interpolated
function uAt(T, z) {
  if (z <= 0) return z;
  if (z >= T.n) return T.U[T.n] + (z - T.n);
  const i = Math.floor(z);
  return T.U[i] + (z - i) * (T.U[i + 1] - T.U[i]);
}
// the running sum of U up to z
function uiAt(T, z) {
  if (z <= 0) return 0;
  if (z >= T.n) return T.UI[T.n + 1] + (z - T.n) * T.U[T.n];
  const i = Math.floor(z);
  return T.UI[i] + (z - i) * T.U[i];
}
// the running sum of Z up to u (m back from the column's foot)
function ziAt(T, u) {
  if (u <= 0) return 0;
  if (u >= T.m) return T.ZI[T.m] + (u - T.m) * T.n;
  const i = Math.floor(u);
  return T.ZI[i] + (u - i) * T.Z[i];
}

// the sum of a canyon's profile from its line out to s (m): its floor (height F, half width Wf),
// then its walls up to its rim (Rm) and level beyond; heights as the column reads them (z: its
// height plus the beds' offset there, off)
function profSum(T, F, Rm, Wf, off, s) {
  if (s <= Wf) return s * F;
  const zF = F + off - T.lo, zR = Rm + off - T.lo, uF = uAt(T, zF), uR = uAt(T, zR);
  // (from the floor's edge: the wall, the column's heights from uF on, until the rim's)
  const u = uF + (s - Wf), uw = Math.min(u, uR);
  const wall = ziAt(T, uw) - ziAt(T, uF) - (uw - uF) * (off - T.lo);
  return Wf * F + wall + Math.max(0, u - uR) * Rm;
}

// the profile's height at d (m from its line), averaged over a stretch a across: the canyon of
// floor F, rim Rm, floor half width Wf, in the column T (the beds offset off there)
export function canyonAt(T, F, Rm, Wf, off, d, a) {
  d = Math.abs(d);
  const ha = Math.max(0.5, 0.5 * a);
  // (a stretch across the line: both sides of it, folded)
  const lo = d - ha, hi = d + ha;
  const sum = lo >= 0 ? profSum(T, F, Rm, Wf, off, hi) - profSum(T, F, Rm, Wf, off, lo) : profSum(T, F, Rm, Wf, off, hi) + profSum(T, F, Rm, Wf, off, -lo);
  return sum / (hi - lo);
}

// how far from its line the canyon's walls reach its rim
export function canyonHalfWidth(T, F, Rm, Wf, off) {
  return Wf + Math.max(0, uAt(T, Rm + off - T.lo) - uAt(T, F + off - T.lo));
}

// the rock a wall from F up to Tp takes out beside its floor's edge (m², per metre along it): the
// wedge between the wall and the floor's edge, up to Tp
export function canyonWedge(T, F, Tp, off) {
  const zF = F + off - T.lo, zT = Tp + off - T.lo;
  if (zT <= zF) return 0;
  return uiAt(T, zT) - uiAt(T, zF) - (zT - zF) * uAt(T, zF);
}
