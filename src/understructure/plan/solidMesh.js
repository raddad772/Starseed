// Solids (compile.js) -> triangles. Flat-shaded, outward-facing, with
// world-projected UVs (3 m tiles on the dominant axis, as the survey scene used).
import * as THREE from 'three';

// The corners of an oriented prism, bottom ring then top ring.
export function solidCorners(s) {
  // (a tapered prism scales its top ring by s.taper about the local origin)
  const out = [];
  for (const [w, k] of [[s.w0, 1], [s.w1, s.taper ?? 1]]) for (const [a0, b0] of s.poly) {
    const a = a0 * k, b = b0 * k;
    out.push([s.o[0] + s.u[0] * a + s.v[0] * b + s.w[0] * w, s.o[1] + s.u[1] * a + s.v[1] * b + s.w[1] * w, s.o[2] + s.u[2] * a + s.v[2] * b + s.w[2] * w]);
  }
  return out;
}

function pushTri(pos, nrm, uv, a, b, c, centre) {
  const e1 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], e2 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  let n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
  const l = Math.hypot(...n);
  if (l < 1e-9) return;
  n = n.map((x) => x / l);
  const f = [(a[0] + b[0] + c[0]) / 3 - centre[0], (a[1] + b[1] + c[1]) / 3 - centre[1], (a[2] + b[2] + c[2]) / 3 - centre[2]];
  if (n[0] * f[0] + n[1] * f[1] + n[2] * f[2] < 0) { [b, c] = [c, b]; n = n.map((x) => -x); }
  const ax = Math.abs(n[0]), ay = Math.abs(n[1]), az = Math.abs(n[2]);
  for (const p of [a, b, c]) {
    pos.push(p[0], p[1], p[2]); nrm.push(n[0], n[1], n[2]);
    uv.push((ax > Math.max(ay, az) ? p[2] : p[0]) / 3, (ay > Math.max(ax, az) ? p[2] : p[1]) / 3);
  }
}

export function solidTriangles(s, pos, nrm, uv) {
  const k = s.poly.length, C = solidCorners(s);
  const centre = C.reduce((m, p) => [m[0] + p[0] / C.length, m[1] + p[1] / C.length, m[2] + p[2] / C.length], [0, 0, 0]);
  for (let i = 1; i < k - 1; i++) { pushTri(pos, nrm, uv, C[0], C[i], C[i + 1], centre); pushTri(pos, nrm, uv, C[k], C[k + i], C[k + i + 1], centre); }
  for (let i = 0; i < k; i++) {
    const j = (i + 1) % k;
    pushTri(pos, nrm, uv, C[i], C[j], C[k + j], centre); pushTri(pos, nrm, uv, C[i], C[k + j], C[k + i], centre);
  }
}

// One geometry per material name.
export function solidGeometries(solids, filter = () => true) {
  const by = new Map();
  for (const s of solids) {
    if (!filter(s)) continue;
    if (!by.has(s.mat)) by.set(s.mat, { pos: [], nrm: [], uv: [] });
    const b = by.get(s.mat);
    solidTriangles(s, b.pos, b.nrm, b.uv);
  }
  const out = new Map();
  for (const [mat, b] of by) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(b.pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(b.nrm, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(b.uv, 2));
    out.set(mat, g);
  }
  return out;
}
