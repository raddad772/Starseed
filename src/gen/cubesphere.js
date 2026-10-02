// Equal-angle cube-sphere: six quadtree faces, no pole singularities.
//
// Face f has outward normal N and tangents U, V with U x V = N, so grid quads
// (i,j)->(i+1,j)->(i+1,j+1)->(i,j+1) are counter-clockwise seen from outside.
// Grid coordinates (u,v) in [-1,1] are warped by tan(u*pi/4): every grid line
// subtends an equal angle, keeping cell areas within ~30% across a face.

import * as dm from '../core/dmath.js';

export const FACES = [
  { N: [1, 0, 0], U: [0, 0, -1], V: [0, 1, 0] },
  { N: [-1, 0, 0], U: [0, 0, 1], V: [0, 1, 0] },
  { N: [0, 1, 0], U: [1, 0, 0], V: [0, 0, -1] },
  { N: [0, -1, 0], U: [1, 0, 0], V: [0, 0, 1] },
  { N: [0, 0, 1], U: [1, 0, 0], V: [0, 1, 0] },
  { N: [0, 0, -1], U: [-1, 0, 0], V: [0, 1, 0] },
];

const QPI = dm.PI / 4;

// Grid (u,v) on face f -> unit direction (written to out)
export function dirFromFaceUV(f, u, v, out) {
  const F = FACES[f];
  const a = dm.tan(u * QPI), b = dm.tan(v * QPI);
  const x = F.N[0] + a * F.U[0] + b * F.V[0];
  const y = F.N[1] + a * F.U[1] + b * F.V[1];
  const z = F.N[2] + a * F.U[2] + b * F.V[2];
  const l = Math.sqrt(x * x + y * y + z * z);
  out[0] = x / l; out[1] = y / l; out[2] = z / l;
  return out;
}

// Unit direction -> { face, u, v } (grid coordinates in [-1,1])
// (the last direction's answer kept: a sample reads many fields at the same point)
let _lx = NaN, _ly = NaN, _lz = NaN, _lf = 0, _lu = 0, _lv = 0;
export function faceUVFromDir(d, out) {
  if (d[0] === _lx && d[1] === _ly && d[2] === _lz) { out.face = _lf; out.u = _lu; out.v = _lv; return out; }
  const ax = Math.abs(d[0]), ay = Math.abs(d[1]), az = Math.abs(d[2]);
  let f;
  if (ax >= ay && ax >= az) f = d[0] >= 0 ? 0 : 1;
  else if (ay >= az) f = d[1] >= 0 ? 2 : 3;
  else f = d[2] >= 0 ? 4 : 5;
  const F = FACES[f];
  const dn = d[0] * F.N[0] + d[1] * F.N[1] + d[2] * F.N[2];
  const a = (d[0] * F.U[0] + d[1] * F.U[1] + d[2] * F.U[2]) / dn;
  const b = (d[0] * F.V[0] + d[1] * F.V[1] + d[2] * F.V[2]) / dn;
  out.face = f;
  out.u = dm.clamp(dm.atan(a) / QPI, -1, 1);
  out.v = dm.clamp(dm.atan(b) / QPI, -1, 1);
  _lx = d[0]; _ly = d[1]; _lz = d[2]; _lf = f; _lu = out.u; _lv = out.v;
  return out;
}

// Chunk addressing: level L, indices (ix, iy) in [0, 2^L)
export function chunkUVBounds(level, ix, iy) {
  const n = 1 << level;
  const s = 2 / n;
  return { u0: -1 + ix * s, v0: -1 + iy * s, size: s };
}

// Approximate arc length of a chunk edge at radius R
export function chunkArcSize(level, R) {
  return (dm.PI / 2) * R / (1 << level);
}

// Fibonacci sphere points (deterministic), for calibration and analysis
export function fibonacciSphere(n) {
  const pts = new Float64Array(n * 3);
  const ga = dm.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i + 0.5) / n * 2;
    const r = Math.sqrt(1 - y * y);
    const th = ga * i;
    pts[i * 3] = dm.cos(th) * r; pts[i * 3 + 1] = y; pts[i * 3 + 2] = dm.sin(th) * r;
  }
  return pts;
}
