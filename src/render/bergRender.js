// Icebergs drawn (gen/icebergs.js: calved where the world's glaciers reach the sea, adrift round there,
// melting where it's warm): each one of BERG_SHAPES shapes, a glacier's broken block (bergShape: steep
// sides, rounded edges, dented, its top worn flat, a keel four times as deep as it stands; finer within
// 4 km), sized and turned as its own,
// in the ice's material (floeRender.js makeIceMaterial: snow on top, glacier blue on its sides), framed
// as gen/icebergs.js bergBasis (the walker's boxes the same). Those within ~25 km of the camera, placed
// again as it moves on (~2 km) or the season does.
import * as THREE from 'three';
import { bergsNear, bergBasis, BERG_SHAPES } from '../gen/icebergs.js';
import { seaTempAt } from '../gen/liquidice.js';
import { makeIceMaterial } from './floeRender.js';
import { SHADOW_LAYER } from './sunShadows.js';

const REACH = 25000, MOVE = 2000, HIGH = 40000;

// the shapes: a unit block of a glacier's ice (x and z -0.5..0.5, its top ~1 over the water, its keel to
// -4): a ball pushed out toward a box with rounded edges (|x|^p + |y|^p + |z|^p = 1, p 3-4.5: its sides
// steep, as a glacier's front breaks), dented in and out, its top worn flat; detail its facets (3 near,
// 1 far off)
function bergShape(k, detail) {
  let h = (Math.imul(k + 1, 0x9e3779b1) ^ 0x51ed27) >>> 0;
  const rnd = () => { h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d) >>> 0; h = Math.imul(h ^ (h >>> 12), 0x297a2d39) >>> 0; h = (h ^ (h >>> 15)) >>> 0; return h / 4294967296; };
  const pw = 3 + 1.5 * rnd(), flat = 0.6 + 0.3 * rnd(), lean = (rnd() - 0.5) * 0.3;
  // (its dents: a few broad bumps, the same at every detail so near and far agree)
  const bumps = Array.from({ length: 6 }, () => [rnd() * 2 - 1, rnd() * 2 - 1, rnd() * 2 - 1, 0.08 + 0.12 * rnd(), rnd() < 0.5 ? -1 : 1]);
  const g = new THREE.IcosahedronGeometry(1, detail), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const kk = Math.pow(Math.pow(Math.abs(x), pw) + Math.pow(Math.abs(y), pw) + Math.pow(Math.abs(z), pw), -1 / pw);
    x *= kk; y *= kk; z *= kk;
    let r = 1;
    for (const [bx, by, bz, a, sg] of bumps) { const dd = (x - bx) ** 2 + (y - by) ** 2 + (z - bz) ** 2; r += sg * a * Math.exp(-dd * 3); }
    x *= r; y *= r; z *= r;
    y = y > 0 ? Math.min(y + lean * x, flat) / flat : y * 4;
    p.setXYZ(i, x * 0.5, y, z * 0.5);
  }
  g.computeVertexNormals();
  return g;
}
const NEAR = 4000;

export class BergSet {
  constructor(body, shared, group) {
    this.body = body; this.group = group;
    this.material = makeIceMaterial(shared, 3);
    this.shapes = Array.from({ length: BERG_SHAPES }, (_, k) => bergShape(k, 3));
    this.far = Array.from({ length: BERG_SHAPES }, (_, k) => bergShape(k, 1));
    this.meshes = []; this.at = null; this.L = 0;
  }
  update(camF) {
    const b = this.body, gen = b.terrain, R = b.R, alt = camF.length() - R;
    for (const m of this.meshes) m.visible = alt < HIGH;
    if (alt > HIGH || !gen || !gen.snap) return;
    const dir = camF.clone().normalize(), L = b.solarLongitude ? b.solarLongitude() : 0;
    if (this.at && this.at.angleTo(dir) * R < MOVE && Math.abs(L - this.L) < 0.02) return;
    this.at = dir; this.L = L;
    // (the bergs about, by shape and by near or far; none too small to see where it is, ~4 px)
    const by = Array.from({ length: 2 * BERG_SHAPES }, () => []);
    const warm = (d) => { const T = seaTempAt(gen, L, [d[0] * R, d[1] * R, d[2] * R]); return T == null ? 0 : Math.min(1, Math.max(0, T / 8)); };
    bergsNear(gen.snap, R, [dir.x, dir.y, dir.z], REACH, warm, (bg) => {
      const dd = Math.hypot(bg.dir[0] - dir.x, bg.dir[1] - dir.y, bg.dir[2] - dir.z) * R;
      if (bg.len < dd / 300) return;
      by[bg.shape + (dd > NEAR ? BERG_SHAPES : 0)].push(bg);
    });
    for (const m of this.meshes) { this.group.remove(m); m.dispose(); }
    this.meshes = [];
    const origin = dir.clone().multiplyScalar(R), m4 = new THREE.Matrix4(), X = [0, 0, 0], Y = [0, 0, 0], Z = [0, 0, 0], vx = new THREE.Vector3(), vy = new THREE.Vector3(), vz = new THREE.Vector3();
    by.forEach((list, k) => {
      if (!list.length) return;
      const im = new THREE.InstancedMesh(k < BERG_SHAPES ? this.shapes[k] : this.far[k - BERG_SHAPES], this.material, list.length);
      list.forEach((bg, i) => {
        bergBasis(bg.dir, bg.yaw, X, Y, Z);
        m4.makeBasis(vx.fromArray(X).multiplyScalar(bg.len), vy.fromArray(Y).multiplyScalar(bg.hgt), vz.fromArray(Z).multiplyScalar(bg.wid));
        m4.setPosition(bg.dir[0] * R - origin.x, bg.dir[1] * R - origin.y, bg.dir[2] * R - origin.z);
        im.setMatrixAt(i, m4);
      });
      im.instanceMatrix.needsUpdate = true;
      im.position.copy(origin);
      im.frustumCulled = false;
      im.layers.enable(SHADOW_LAYER);
      this.group.add(im);
      this.meshes.push(im);
    });
    this.material.uniforms.uOriginF.value.copy(origin);
  }
  dispose() { for (const m of this.meshes) { this.group.remove(m); m.dispose(); } for (const g of [...this.shapes, ...this.far]) g.dispose(); this.material.dispose(); }
}
