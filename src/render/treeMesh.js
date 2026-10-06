// A grown tree's mesh (gen/life/tree.js growTree): its limbs as tapered tubes in its bark's colour, its
// leaf clusters as crossed cards in its leaves' (lit from above, as the ground under them is: no dark
// backs), a tree fern's fronds as long arching cards; one geometry with vertex colours, the tree's frame
// (y up, its foot at 0). Shared by every tree of its species and variant (instanced).
import * as THREE from 'three';

// split: { bark, leaves } as two geometries (the flora shader's parts), else one with vertex colours
export function treeGeometry(tree, sp, detail = 1, split = false) {
  let pos = [], nrm = [], col = [], idx = [];
  const sides = detail > 0 ? 5 : 4;
  const v = (x, y, z, nx, ny, nz, c) => { pos.push(x, y, z); nrm.push(nx, ny, nz); col.push(c[0], c[1], c[2]); return pos.length / 3 - 1; };
  const geo = () => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); g.computeBoundingSphere(); return g; };
  let bark = null;
  // limbs (the thinnest left out far off)
  for (const s of tree.segs) {
    if (detail === 0 && s.r0 < sp.trunkR * 0.15) continue;
    const a = s.a, b = s.b, d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], L = Math.hypot(d[0], d[1], d[2]) || 1;
    const t = [d[0] / L, d[1] / L, d[2] / L], p = Math.abs(t[1]) < 0.9 ? [t[2], 0, -t[0]] : [0, -t[2], t[1]], pl = Math.hypot(p[0], p[1], p[2]);
    const u = [p[0] / pl, p[1] / pl, p[2] / pl], w = [t[1] * u[2] - t[2] * u[1], t[2] * u[0] - t[0] * u[2], t[0] * u[1] - t[1] * u[0]];
    const base = pos.length / 3, dark = sp.bark.map((x) => x * 0.8);
    for (let k = 0; k <= sides; k++) {
      const ang = (k / sides) * Math.PI * 2, c = Math.cos(ang), sn = Math.sin(ang);
      const nx = u[0] * c + w[0] * sn, ny = u[1] * c + w[1] * sn, nz = u[2] * c + w[2] * sn;
      v(a[0] + nx * s.r0, a[1] + ny * s.r0, a[2] + nz * s.r0, nx, ny, nz, dark);
      v(b[0] + nx * s.r1, b[1] + ny * s.r1, b[2] + nz * s.r1, nx, ny, nz, sp.bark);
    }
    for (let k = 0; k < sides; k++) { const i = base + k * 2; idx.push(i, i + 2, i + 1, i + 1, i + 2, i + 3); }
  }
  if (split) { bark = geo(); pos = []; nrm = []; col = []; idx = []; }
  // leaves: two crossed cards a cluster (one far off), or a frond
  let h = 0x2f6b;
  const rnd = () => { h = (h * 1103515245 + 12345) >>> 0; return h / 4294967296; };
  for (const L of tree.leaves) {
    const c = sp.leaf.map((x) => x * (0.8 + 0.4 * rnd()));
    if (L.frond) {
      // (a frond: a long card from the crown out along its way, drooping at its end)
      const n = L.n, len = L.s, wdt = len * 0.18, side = [n[2], 0, -n[0]], sl = Math.hypot(side[0], side[2]) || 1;
      const sx = side[0] / sl * wdt, sz = side[2] / sl * wdt, base = pos.length / 3;
      for (let k = 0; k <= 3; k++) {
        const f = k / 3, droop = -0.5 * f * f * len, px = L.p[0] + n[0] * len * f, py = L.p[1] + n[1] * len * f + droop, pz = L.p[2] + n[2] * len * f, ww = 1 - 0.7 * f;
        v(px - sx * ww, py, pz - sz * ww, 0, 1, 0, c); v(px + sx * ww, py, pz + sz * ww, 0, 1, 0, c);
      }
      for (let k = 0; k < 3; k++) { const i = base + k * 2; idx.push(i, i + 1, i + 2, i + 1, i + 3, i + 2); }
      continue;
    }
    // (a cluster: a few rounded six-sided cards about it at their own tilts, not two upright squares: a
    // crown that reads as foliage, not as boxes)
    const cards = detail > 0 ? 3 : 1;
    for (let k = 0; k < cards; k++) {
      const s = L.s * (0.55 + 0.25 * rnd()), yaw = rnd() * Math.PI * 2, tilt = (rnd() - 0.5) * 1.4;
      const ox = (rnd() - 0.5) * L.s * 0.6, oy = (rnd() - 0.5) * L.s * 0.4, oz = (rnd() - 0.5) * L.s * 0.6;
      const ax = [Math.cos(yaw), 0, Math.sin(yaw)], ay = [-Math.sin(yaw) * Math.sin(tilt), Math.cos(tilt), Math.cos(yaw) * Math.sin(tilt)];
      const cx = L.p[0] + ox, cy = L.p[1] + oy, cz = L.p[2] + oz, base = pos.length / 3;
      v(cx, cy, cz, 0, 1, 0, c);
      for (let q = 0; q < 6; q++) { const t = q / 6 * Math.PI * 2, u = Math.cos(t) * s, w2 = Math.sin(t) * s * 0.8; v(cx + ax[0] * u + ay[0] * w2, cy + ax[1] * u + ay[1] * w2, cz + ax[2] * u + ay[2] * w2, 0, 1, 0, c); }
      for (let q = 0; q < 6; q++) idx.push(base, base + 1 + q, base + 1 + ((q + 1) % 6));
    }
  }
  return split ? { bark, leaves: geo() } : geo();
}
