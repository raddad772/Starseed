// Two-body orbital mechanics: Keplerian element orbits for celestial bodies,
// universal-variable propagation for vessels (handles ellipses, parabolas and
// hyperbolas without special cases), and state -> orbit summaries for the HUD.
//
// Frame convention (three.js style): +Y is "north" of a reference plane.
// Classical element formulas are evaluated in a Z-up maths frame and mapped
// with (X, Y, Z) -> (X, Z, -Y), which preserves handedness.

import * as dm from './dmath.js';
import { qRotate } from './vec.js';

export function solveKepler(M, e) {
  // Elliptic: E - e sin E = M
  M = M - dm.TWO_PI * Math.floor(M / dm.TWO_PI);
  let E = e < 0.8 ? M : dm.PI;
  for (let i = 0; i < 40; i++) {
    const s = dm.sin(E), c = dm.cos(E);
    const d = (E - e * s - M) / (1 - e * c);
    E -= d;
    if (Math.abs(d) < 1e-15) break;
  }
  return E;
}

// Build a reusable orbit description.
// p: { a, e, i, Om, w, M0, epoch?, frame? (quaternion: orbit reference plane -> inertial) }
export function makeOrbit(p, mu) {
  const cO = dm.cos(p.Om), sO = dm.sin(p.Om), cw = dm.cos(p.w), sw = dm.sin(p.w), ci = dm.cos(p.i), si = dm.sin(p.i);
  // maths-frame perifocal basis
  const Pm = [cO * cw - sO * sw * ci, sO * cw + cO * sw * ci, sw * si];
  const Qm = [-cO * sw - sO * cw * ci, -sO * sw + cO * cw * ci, cw * si];
  let P = [Pm[0], Pm[2], -Pm[1]];
  let Q = [Qm[0], Qm[2], -Qm[1]];
  if (p.frame) { P = qRotate(p.frame, P); Q = qRotate(p.frame, Q); }
  const W = [P[1] * Q[2] - P[2] * Q[1], P[2] * Q[0] - P[0] * Q[2], P[0] * Q[1] - P[1] * Q[0]];
  const n = dm.sqrt(mu / (p.a * p.a * p.a));
  return {
    a: p.a, e: p.e, i: p.i, Om: p.Om, w: p.w, M0: p.M0, epoch: p.epoch || 0,
    mu, n, period: dm.TWO_PI / n, P, Q, W, frame: p.frame || null,
    b: p.a * dm.sqrt(1 - p.e * p.e),
  };
}

// Position/velocity relative to the parent at time t
export function orbitState(o, t, pos, vel) {
  const M = o.M0 + o.n * (t - o.epoch);
  const E = solveKepler(M, o.e);
  const cE = dm.cos(E), sE = dm.sin(E);
  const e = o.e, a = o.a;
  const sq = dm.sqrt(1 - e * e);
  const x = a * (cE - e), y = a * sq * sE;
  const r = a * (1 - e * cE);
  const k = dm.sqrt(o.mu * a) / r;
  const vx = -k * sE, vy = k * sq * cE;
  const P = o.P, Q = o.Q;
  pos[0] = x * P[0] + y * Q[0]; pos[1] = x * P[1] + y * Q[1]; pos[2] = x * P[2] + y * Q[2];
  if (vel) { vel[0] = vx * P[0] + vy * Q[0]; vel[1] = vx * P[1] + vy * Q[1]; vel[2] = vx * P[2] + vy * Q[2]; }
  return pos;
}

// Mean longitude-ish phase (radians) used to tidally lock rotation to the orbit
export function meanAnomalyAt(o, t) { return o.M0 + o.n * (t - o.epoch); }

// Point on the orbit at true anomaly nu (for drawing)
export function orbitPointAtTrueAnomaly(o, nu, out) {
  const p = o.a * (1 - o.e * o.e);
  const r = p / (1 + o.e * Math.cos(nu));
  const x = r * Math.cos(nu), y = r * Math.sin(nu);
  out[0] = x * o.P[0] + y * o.Q[0]; out[1] = x * o.P[1] + y * o.Q[1]; out[2] = x * o.P[2] + y * o.Q[2];
  return out;
}

function stumpC(z) {
  if (z > 1e-4) { const s = Math.sqrt(z); return (1 - dm.cos(s)) / z; }
  if (z < -1e-4) { const s = Math.sqrt(-z); return (0.5 * (dm.exp(s) + dm.exp(-s)) - 1) / (-z); }
  return 0.5 - z / 24 + z * z / 720 - z * z * z / 40320;
}
function stumpS(z) {
  if (z > 1e-4) { const s = Math.sqrt(z); return (s - dm.sin(s)) / (s * s * s); }
  if (z < -1e-4) { const s = Math.sqrt(-z); return (0.5 * (dm.exp(s) - dm.exp(-s)) - s) / (s * s * s); }
  return 1 / 6 - z / 120 + z * z / 5040 - z * z * z / 362880;
}

// Universal-variable Kepler propagation (Curtis alg. 3.3/3.4) with a
// safeguarded Newton solve: F(chi) is strictly increasing (F' = r > 0), so a
// bracket + Newton/bisection hybrid always converges.
export function propagate(r0, v0, dt, mu, outR, outV) {
  const r0x = r0[0], r0y = r0[1], r0z = r0[2], v0x = v0[0], v0y = v0[1], v0z = v0[2];
  if (dt === 0) {
    outR[0] = r0x; outR[1] = r0y; outR[2] = r0z; outV[0] = v0x; outV[1] = v0y; outV[2] = v0z;
    return;
  }
  const r0n = Math.sqrt(r0x * r0x + r0y * r0y + r0z * r0z);
  const v0s = v0x * v0x + v0y * v0y + v0z * v0z;
  const rv = r0x * v0x + r0y * v0y + r0z * v0z;
  const sqmu = Math.sqrt(mu);
  const alpha = 2 / r0n - v0s / mu;
  const hx = r0y * v0z - r0z * v0y, hy = r0z * v0x - r0x * v0z, hz = r0x * v0y - r0y * v0x;
  const p = (hx * hx + hy * hy + hz * hz) / mu;
  const ecc = Math.sqrt(Math.max(0, 1 - p * alpha));
  let rp = p / (1 + ecc);
  if (!(rp > r0n * 1e-9)) rp = r0n * 1e-9;

  let t = dt;
  let chiMax = Infinity;
  if (alpha > 1e-15) {
    const T = dm.TWO_PI / (sqmu * alpha * Math.sqrt(alpha));
    t = t - T * Math.floor(t / T);
    chiMax = dm.TWO_PI / Math.sqrt(alpha) * 1.000001;
  }
  const bound = Math.min(sqmu * Math.abs(t) / rp, chiMax);
  let lo, hi;
  if (t >= 0) { lo = 0; hi = bound; } else { lo = -bound; hi = 0; }
  let chi = alpha > 1e-15 ? sqmu * t * alpha : sqmu * t / r0n;
  if (!(chi > lo && chi < hi)) chi = 0.5 * (lo + hi);
  const k1 = rv / sqmu, k2 = 1 - alpha * r0n;
  let C = 0.5, S = 1 / 6, z = 0;
  for (let iter = 0; iter < 200; iter++) {
    z = alpha * chi * chi;
    C = stumpC(z); S = stumpS(z);
    const chi2 = chi * chi;
    const F = k1 * chi2 * C + k2 * chi2 * chi * S + r0n * chi - sqmu * t;
    const Fp = k1 * chi * (1 - z * S) + k2 * chi2 * C + r0n;
    if (F > 0) hi = chi; else lo = chi;
    let next = chi - F / Fp;
    if (!(next > lo && next < hi)) next = 0.5 * (lo + hi);
    if (Math.abs(next - chi) <= 1e-14 * Math.max(1, Math.abs(chi))) { chi = next; break; }
    chi = next;
    if (hi - lo <= 1e-15 * Math.max(1, Math.abs(chi))) break;
  }
  z = alpha * chi * chi;
  C = stumpC(z); S = stumpS(z);
  const chi2 = chi * chi;
  const f = 1 - chi2 / r0n * C;
  const g = t - chi2 * chi / sqmu * S;
  const rx = f * r0x + g * v0x, ry = f * r0y + g * v0y, rz = f * r0z + g * v0z;
  const rn = Math.sqrt(rx * rx + ry * ry + rz * rz);
  const fdot = sqmu / (rn * r0n) * chi * (z * S - 1);
  const gdot = 1 - chi2 / rn * C;
  outR[0] = rx; outR[1] = ry; outR[2] = rz;
  outV[0] = fdot * r0x + gdot * v0x; outV[1] = fdot * r0y + gdot * v0y; outV[2] = fdot * r0z + gdot * v0z;
}

// Orbit summary from a state vector (for HUD / map drawing).
export function orbitInfo(r, v, mu, out = {}) {
  const rn = Math.sqrt(r[0] * r[0] + r[1] * r[1] + r[2] * r[2]);
  const v2 = v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
  const rv = r[0] * v[0] + r[1] * v[1] + r[2] * v[2];
  const hx = r[1] * v[2] - r[2] * v[1], hy = r[2] * v[0] - r[0] * v[2], hz = r[0] * v[1] - r[1] * v[0];
  const hn = Math.sqrt(hx * hx + hy * hy + hz * hz);
  const energy = v2 / 2 - mu / rn;
  const c1 = (v2 - mu / rn) / mu, c2 = rv / mu;
  const ex = c1 * r[0] - c2 * v[0], ey = c1 * r[1] - c2 * v[1], ez = c1 * r[2] - c2 * v[2];
  const e = Math.sqrt(ex * ex + ey * ey + ez * ez);
  const p = hn * hn / mu;
  out.r = rn; out.speed = Math.sqrt(v2);
  out.energy = energy;
  out.e = e;
  out.p = p;
  out.a = Math.abs(energy) > 1e-12 ? -mu / (2 * energy) : Infinity;
  out.rp = p / (1 + e);
  out.ra = e < 1 ? p / (1 - e) : Infinity;
  out.bound = energy < 0;
  out.period = out.bound ? dm.TWO_PI * Math.sqrt(out.a * out.a * out.a / mu) : Infinity;
  out.h = [hx, hy, hz]; out.hn = hn;
  out.evec = [ex, ey, ez];
  // true anomaly
  let nu;
  if (e > 1e-9) {
    let c = (ex * r[0] + ey * r[1] + ez * r[2]) / (e * rn);
    c = Math.max(-1, Math.min(1, c));
    nu = Math.acos(c);
    if (rv < 0) nu = 2 * Math.PI - nu;
  } else nu = 0;
  out.nu = nu;
  // time to periapsis / apoapsis
  out.timeToPe = NaN; out.timeToAp = NaN;
  if (out.bound && e > 1e-6) {
    const E = 2 * Math.atan2(Math.sqrt(1 - e) * Math.sin(nu / 2), Math.sqrt(1 + e) * Math.cos(nu / 2));
    let M = E - e * Math.sin(E);
    if (M < 0) M += 2 * Math.PI;
    const n = Math.sqrt(mu / (out.a * out.a * out.a));
    out.timeToPe = (2 * Math.PI - M) / n;
    out.timeToAp = ((Math.PI - M) + 2 * Math.PI) % (2 * Math.PI) / n;
  } else if (!out.bound && e > 1) {
    const H = 2 * Math.atanh(Math.sqrt((e - 1) / (e + 1)) * Math.tan(nu / 2));
    const M = e * Math.sinh(H) - H;
    const n = Math.sqrt(mu / Math.pow(-out.a, 3));
    out.timeToPe = -M / n;
  }
  return out;
}
