// Minimal double-precision vector/quaternion helpers on plain arrays.
// Used by generation and simulation code that must not depend on three.js
// (it also runs inside Web Workers).

import * as dm from './dmath.js';

export const v3 = (x = 0, y = 0, z = 0) => [x, y, z];
export const add = (a, b, o = [0, 0, 0]) => { o[0] = a[0] + b[0]; o[1] = a[1] + b[1]; o[2] = a[2] + b[2]; return o; };
export const sub = (a, b, o = [0, 0, 0]) => { o[0] = a[0] - b[0]; o[1] = a[1] - b[1]; o[2] = a[2] - b[2]; return o; };
export const scale = (a, s, o = [0, 0, 0]) => { o[0] = a[0] * s; o[1] = a[1] * s; o[2] = a[2] * s; return o; };
export const addScaled = (a, b, s, o = [0, 0, 0]) => { o[0] = a[0] + b[0] * s; o[1] = a[1] + b[1] * s; o[2] = a[2] + b[2] * s; return o; };
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a, b, o = [0, 0, 0]) => {
  const x = a[1] * b[2] - a[2] * b[1], y = a[2] * b[0] - a[0] * b[2], z = a[0] * b[1] - a[1] * b[0];
  o[0] = x; o[1] = y; o[2] = z; return o;
};
export const len = (a) => Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
export const len2 = (a) => a[0] * a[0] + a[1] * a[1] + a[2] * a[2];
export const dist = (a, b) => { const x = a[0] - b[0], y = a[1] - b[1], z = a[2] - b[2]; return Math.sqrt(x * x + y * y + z * z); };
export const norm = (a, o = [0, 0, 0]) => { const l = len(a) || 1; o[0] = a[0] / l; o[1] = a[1] / l; o[2] = a[2] / l; return o; };
export const copy = (a, o = [0, 0, 0]) => { o[0] = a[0]; o[1] = a[1]; o[2] = a[2]; return o; };
export const lerp3 = (a, b, t, o = [0, 0, 0]) => { o[0] = a[0] + (b[0] - a[0]) * t; o[1] = a[1] + (b[1] - a[1]) * t; o[2] = a[2] + (b[2] - a[2]) * t; return o; };

// Any unit vector perpendicular to n
export function perp(n, o = [0, 0, 0]) {
  const a = Math.abs(n[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
  cross(n, a, o);
  return norm(o, o);
}

// Quaternions [x,y,z,w]
export const qIdentity = () => [0, 0, 0, 1];
export function qAxisAngle(axis, angle, o = [0, 0, 0, 1]) {
  const h = angle * 0.5, s = dm.sin(h);
  o[0] = axis[0] * s; o[1] = axis[1] * s; o[2] = axis[2] * s; o[3] = dm.cos(h);
  return o;
}
export function qMul(a, b, o = [0, 0, 0, 1]) {
  const ax = a[0], ay = a[1], az = a[2], aw = a[3], bx = b[0], by = b[1], bz = b[2], bw = b[3];
  o[0] = ax * bw + aw * bx + ay * bz - az * by;
  o[1] = ay * bw + aw * by + az * bx - ax * bz;
  o[2] = az * bw + aw * bz + ax * by - ay * bx;
  o[3] = aw * bw - ax * bx - ay * by - az * bz;
  return o;
}
export function qConj(q, o = [0, 0, 0, 1]) { o[0] = -q[0]; o[1] = -q[1]; o[2] = -q[2]; o[3] = q[3]; return o; }
export function qRotate(q, v, o = [0, 0, 0]) {
  const x = v[0], y = v[1], z = v[2];
  const qx = q[0], qy = q[1], qz = q[2], qw = q[3];
  const tx = 2 * (qy * z - qz * y), ty = 2 * (qz * x - qx * z), tz = 2 * (qx * y - qy * x);
  o[0] = x + qw * tx + qy * tz - qz * ty;
  o[1] = y + qw * ty + qz * tx - qx * tz;
  o[2] = z + qw * tz + qx * ty - qy * tx;
  return o;
}
export function qNorm(q, o = q) {
  const l = Math.sqrt(q[0] * q[0] + q[1] * q[1] + q[2] * q[2] + q[3] * q[3]) || 1;
  o[0] = q[0] / l; o[1] = q[1] / l; o[2] = q[2] / l; o[3] = q[3] / l;
  return o;
}
// Shortest-arc rotation taking unit vector a to unit vector b
export function qFromTo(a, b, o = [0, 0, 0, 1]) {
  const d = dot(a, b);
  if (d < -0.999999) {
    const ax = perp(a);
    return qAxisAngle(ax, dm.PI, o);
  }
  const c = cross(a, b);
  o[0] = c[0]; o[1] = c[1]; o[2] = c[2]; o[3] = 1 + d;
  return qNorm(o, o);
}
