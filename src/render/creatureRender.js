// Creatures drawn and walked (LIFE.md 4): a species' body built once from its design (gen/life/
// creature.js: its trunk's segments or its hub, its head, its eyes; countershaded and patterned in its
// vertex colours) and drawn as a few instanced meshes (its bodies, heads, eyes, leg pieces: four draws a
// species however many there are); each one's legs its own, a thigh and a shin, set every frame by its
// gait (feet planted through stance, lifted and swung through swing, the limb groups alternating) and
// solved to its feet by two-bone IK (a sprawler's knees up and out, an upright one's fore and aft); its
// body bobbing with its stride, a grazer's head down to the ground. In a creature's own frame: x right,
// y up, -z forward, the ground at y = -hipH.
import * as THREE from 'three';
import { SHADOW_LAYER, receiveShadows } from './sunShadows.js';

const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _k = new THREE.Vector3(), _d = new THREE.Vector3(), _h = new THREE.Vector3(), _f = new THREE.Vector3();
const _q = new THREE.Quaternion(), _m = new THREE.Matrix4(), _m2 = new THREE.Matrix4(), _s = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);
const sphereG = new THREE.SphereGeometry(1, 14, 10), eyeG = new THREE.SphereGeometry(1, 8, 6), legG = new THREE.CylinderGeometry(1, 0.7, 1, 7, 1);
legG.translate(0, 0.5, 0);   // (a leg piece from its root at 0 up to 1)

// a body's mesh in its coat's colours: ellipsoids merged, darker above, paler below, its pattern laid
// along it (stripes across, bands round, spots by a hash)
function coatGeometry(parts, coat) {
  const geos = [];
  for (const p of parts) {
    const g = sphereG.clone();
    g.scale(p.sx, p.sy, p.sz); if (p.rx) g.rotateX(p.rx); g.translate(p.x, p.y, p.z);
    const pos = g.attributes.position, nrm = g.attributes.normal, col = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      const up = nrm.getY(i), z = pos.getZ(i), x = pos.getX(i), y = pos.getY(i);
      const k = THREE.MathUtils.smoothstep(up, -0.35, 0.15);
      let c = coat.belly.map((v, j) => v + (coat.back[j] - v) * k);
      let mark = 0;
      if (coat.pattern === 'stripes') mark = Math.sin(z * 9 / p.scale) > 0.55 && up > 0 ? 1 : 0;
      else if (coat.pattern === 'bands') mark = Math.sin(z * 4 / p.scale) > 0.7 ? 1 : 0;
      else if (coat.pattern === 'spots') { const h = Math.sin(Math.floor(x * 12 / p.scale) * 12.9898 + Math.floor(y * 12 / p.scale) * 78.233 + Math.floor(z * 12 / p.scale) * 37.719) * 43758.5; mark = h - Math.floor(h) > 0.8 && up > -0.2 ? 1 : 0; }
      if (mark || p.mark) c = coat.mark;
      col[i * 3] = c[0]; col[i * 3 + 1] = c[1]; col[i * 3 + 2] = c[2];
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geos.push(g);
  }
  return mergeGeos(geos);
}
function mergeGeos(geos) {
  let n = 0, ni = 0;
  for (const g of geos) { n += g.attributes.position.count; ni += g.index.count; }
  const pos = new Float32Array(n * 3), nrm = new Float32Array(n * 3), col = new Float32Array(n * 3), idx = new Uint32Array(ni);
  let o = 0, oi = 0;
  for (const g of geos) {
    pos.set(g.attributes.position.array, o * 3); nrm.set(g.attributes.normal.array, o * 3); col.set(g.attributes.color.array, o * 3);
    for (let i = 0; i < g.index.count; i++) idx[oi + i] = g.index.array[i] + o;
    o += g.attributes.position.count; oi += g.index.count; g.dispose();
  }
  const m = new THREE.BufferGeometry();
  m.setAttribute('position', new THREE.BufferAttribute(pos, 3)); m.setAttribute('normal', new THREE.BufferAttribute(nrm, 3)); m.setAttribute('color', new THREE.BufferAttribute(col, 3));
  m.setIndex(new THREE.BufferAttribute(idx, 1));
  return m;
}

// a species' shared pieces and its instanced meshes (in `group`, placed at an origin near the camera:
// each creature's matrix is from there). begin() before a frame's creatures write themselves, end() after
export class Species {
  constructor(design, group) {
    this.d = design; this.group = group;
    const D = design, parts = [], s = D.len;
    if (D.body.kind === 'trunk') for (const sg of D.body.segs) parts.push({ x: 0, y: 0, z: sg.z, sx: sg.r * 1.05, sy: sg.r * 0.9, sz: s * 0.5 / Math.max(D.body.segs.length - 1, 1) + sg.r * 0.6, scale: s });
    else parts.push({ x: 0, y: 0, z: 0, sx: D.body.r, sy: D.body.h, sz: D.body.r, scale: s });
    for (const e of D.extra || []) parts.push({ ...e, scale: s });
    this.bodyGeo = coatGeometry(parts, D.coat);
    // (its head and neck, from the neck's root: the neck along the way to the head)
    const H = D.head;
    if (H) {
      const L = Math.hypot(H.dy, H.dz);
      this.headGeo = coatGeometry([
        { x: 0, y: H.dy * 0.5, z: H.dz * 0.5, sx: H.nr, sy: H.nr, sz: L * 0.55 + H.nr * 0.4, rx: Math.atan2(-H.dy, H.dz), scale: s },
        { x: 0, y: H.dy, z: H.dz, sx: H.r * 0.9, sy: H.r * 0.85, sz: H.r * 1.25, scale: s }], D.coat);
    } else this.headGeo = null;
    // (in the sun's shadows and the canopy's: sunShadows.js)
    this.mat = receiveShadows(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, metalness: 0 }));
    this.legMat = receiveShadows(new THREE.MeshStandardMaterial({ color: new THREE.Color(...D.coat.back.map((x) => x * 0.9)), roughness: 0.8 }));
    this.eyeMat = receiveShadows(new THREE.MeshStandardMaterial({ color: 0x080808, roughness: 0.15, metalness: 0.1 }));
    this.eyeR = Math.max(0.006, s * 0.02);
    this.cap = 0; this.n = 0;
    this.origin = new THREE.Vector3();
    this.grow(8);
  }
  // (room for cap creatures)
  grow(cap) {
    for (const im of [this.bodies, this.heads, this.eyes, this.legs]) if (im) { this.group.remove(im); im.dispose(); }
    const D = this.d, mk = (geo, mat, k) => {
      if (!geo || !k) return null;
      const im = new THREE.InstancedMesh(geo, mat, cap * k);
      im.count = 0; im.frustumCulled = false; im.layers.enable(SHADOW_LAYER);
      im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      this.group.add(im);
      return im;
    };
    this.bodies = mk(this.bodyGeo, this.mat, 1);
    this.heads = mk(this.headGeo, this.mat, 1);
    this.eyes = mk(eyeG, this.eyeMat, D.eyes.length);
    this.legs = mk(legG, this.legMat, D.limbs.length * 2);
    this.cap = cap;
  }
  begin(origin, n) {
    if (n > this.cap) this.grow(Math.max(n, this.cap * 2));
    this.origin.copy(origin);
    for (const im of [this.bodies, this.heads, this.eyes, this.legs]) if (im) { im.position.copy(origin); im.count = 0; }
    this.n = 0;
  }
  end() {
    for (const im of [this.bodies, this.heads, this.eyes, this.legs]) if (im) { im.instanceMatrix.needsUpdate = true; im.visible = im.count > 0; }
  }
  hide() { for (const im of [this.bodies, this.heads, this.eyes, this.legs]) if (im) { im.count = 0; im.visible = false; } }
  dispose() {
    for (const im of [this.bodies, this.heads, this.eyes, this.legs]) if (im) { this.group.remove(im); im.dispose(); }
    this.bodyGeo.dispose(); if (this.headGeo) this.headGeo.dispose(); this.mat.dispose(); this.legMat.dispose(); this.eyeMat.dispose();
  }
}
const put = (im, m) => { im.setMatrixAt(im.count++, m); };

// one creature's walk: update(dt, speed, grazing) moves its stride and head; write(root) puts its
// pieces in its species' meshes, root its frame (from the species' origin: x right, y up, z back, at its
// hips' height over the ground)
export class Creature {
  constructor(sp, seed = 0) {
    this.sp = sp; const D = sp.d;
    this.feet = D.limbs.map((L) => new THREE.Vector3(L.hip[0] + L.out[0] * L.splay * D.legLen, -D.hipH, L.hip[2] + L.out[2] * L.splay * D.legLen));
    this.phase = (seed % 1000) / 1000;   // (its stride's start)
    this.headDown = 0; this.bob = 0;
  }
  // speed: m/s along its -z; grazing 0..1: its head down to the ground; rest 0..1: lying down (its body
  // let down toward the ground, its legs folding under it, its head down)
  update(dt, speed, grazing, rest = 0) {
    this.rest = (this.rest || 0) + (rest - (this.rest || 0)) * Math.min(1, dt * 0.8);
    const D = this.sp.d, moving = speed > 0.05;
    // (its steps quicken with its speed, then lengthen: a gallop's stride a couple of legs long)
    const rate = moving ? D.stepHz * Math.min(2.5, Math.sqrt(speed / D.walk)) : 0;
    this.phase = (this.phase + rate * dt) % 1;
    const stride = moving ? Math.min(speed / Math.max(rate, 0.1), 2 * D.legLen) : 0;
    this.bob = (moving ? 0.04 * D.legLen * Math.sin(this.phase * Math.PI * 4) : 0) - this.rest * 0.55 * D.hipH;
    this.headDown += ((grazing > 0.5 && !moving ? 1 : 0.7 * this.rest) - this.headDown) * Math.min(1, dt * 2.5);
    D.limbs.forEach((L, i) => {
      const ph = (this.phase + 0.5 * L.group) % 1, swing = ph > D.duty;
      // (its foot's rest, out from its hip by its splay; through stance it slides back under the
      // moving body, through swing it lifts and comes forward)
      const restX = L.hip[0] + L.out[0] * L.splay * D.legLen, restZ = L.hip[2] + L.out[2] * L.splay * D.legLen;
      const u = swing ? (ph - D.duty) / (1 - D.duty) : ph / D.duty;
      const along = moving ? (swing ? -0.5 + u : 0.5 - u) * stride : 0;
      this.feet[i].set(restX, -D.hipH + (swing && moving ? Math.sin(Math.PI * u) * 0.12 * D.legLen : 0), restZ - along);
    });
  }
  write(root) {
    const sp = this.sp, D = sp.d;
    // its body, bobbing
    _m.makeTranslation(0, this.bob, 0).premultiply(root);
    put(sp.bodies, _m);
    // its head, on its pivot at the body's front, lowered to graze
    if (sp.heads) {
      const H = D.head;
      _m2.makeRotationX(-H.down * this.headDown).setPosition(0, H.py, H.pz);
      _m2.premultiply(_m);
      put(sp.heads, _m2);
      for (const e of D.eyes) { _m.makeScale(sp.eyeR, sp.eyeR, sp.eyeR).setPosition(e[0], e[1] + H.dy, e[2] + H.dz); put(sp.eyes, _m.premultiply(_m2)); }
    } else for (const e of D.eyes) { _m2.makeScale(sp.eyeR, sp.eyeR, sp.eyeR).setPosition(e[0], e[1] + this.bob, e[2]); put(sp.eyes, _m2.premultiply(root)); }
    // its legs: two-bone IK, the knee where thigh and shin meet, bent toward its hint
    D.limbs.forEach((L, i) => {
      const foot = this.feet[i];
      _h.set(L.hip[0], this.bob, L.hip[2]);
      _d.copy(foot).sub(_h);
      const a = L.upper, b = L.lower, dist = Math.min(_d.length(), (a + b) * 0.999);
      _d.normalize();
      const cosA = THREE.MathUtils.clamp((a * a + dist * dist - b * b) / (2 * a * dist), -1, 1), sinA = Math.sqrt(1 - cosA * cosA);
      _b.set(L.out[0] * L.splay, L.splay > 0.4 ? 1 : 0.2, L.splay > 0.4 ? 0 : (L.hip[2] > 0 ? 1 : -1));
      _b.addScaledVector(_d, -_b.dot(_d)).normalize();
      _k.copy(_h).addScaledVector(_d, cosA * a).addScaledVector(_b, sinA * a);
      _f.copy(_h).addScaledVector(_d, dist);
      put(sp.legs, legMatrix(_h, _k, L.r, root));
      put(sp.legs, legMatrix(_k, _f, L.r * 0.75, root));
    });
  }
}
// a leg piece from `from` to `to` (creature frame), radius r, into the root's frame
function legMatrix(from, to, r, root) {
  _a.copy(to).sub(from);
  const l = _a.length();
  _q.setFromUnitVectors(UP, _a.divideScalar(l || 1));
  _m.compose(from, _q, _s.set(r, l, r));
  return _m.premultiply(root);
}

// Flyers (gen/life/flyer.js): a body (and a head and tail) in its coat, and its wings, each an inner
// and an outer panel hinged at the shoulder and the wrist, beating (the outer a little behind and
// further) or held out to glide; a radial flyer's ring of flaps round its hub, beating in a wave. Its
// root frame: x right, y up, -z forward
const wingG = new THREE.BoxGeometry(1, 0.06, 1);
wingG.translate(0.5, 0, 0);   // (a panel from its hinge at 0 out to 1)
export class FlyerSpecies {
  constructor(design, group) {
    this.d = design; this.group = group;
    const D = design, parts = [];
    if (D.radial) parts.push({ x: 0, y: 0, z: 0, sx: D.body.r, sy: D.body.h, sz: D.body.r, scale: D.len });
    else {
      parts.push({ x: 0, y: 0, z: 0, sx: D.body.r, sy: D.body.h, sz: D.len * 0.32, scale: D.len });
      parts.push({ x: 0, y: D.body.h * 0.3, z: D.head.z, sx: D.head.r, sy: D.head.r * 0.9, sz: D.head.r * 1.3, scale: D.len });
      if (D.tail > 0) parts.push({ x: 0, y: 0, z: D.len * 0.3 + D.tail * 0.4, sx: D.tail * 0.35, sy: D.body.h * 0.15, sz: D.tail * 0.5, scale: D.len });
    }
    this.bodyGeo = coatGeometry(parts, D.coat);
    this.mat = receiveShadows(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85 }));
    this.wingMat = receiveShadows(new THREE.MeshStandardMaterial({ color: new THREE.Color(...D.coat.back), roughness: 0.9, side: THREE.DoubleSide }));
    this.cap = 0; this.grow(8);
  }
  grow(cap) {
    for (const im of [this.bodies, this.wings]) if (im) { this.group.remove(im); im.dispose(); }
    const mk = (geo, mat, k) => { const im = new THREE.InstancedMesh(geo, mat, cap * k); im.count = 0; im.frustumCulled = false; im.layers.enable(SHADOW_LAYER); im.instanceMatrix.setUsage(THREE.DynamicDrawUsage); this.group.add(im); return im; };
    this.bodies = mk(this.bodyGeo, this.mat, 1);
    this.wings = mk(wingG, this.wingMat, this.d.wings * 2);
    this.cap = cap;
  }
  begin(origin, n) {
    if (n > this.cap) this.grow(Math.max(n, this.cap * 2));
    for (const im of [this.bodies, this.wings]) { im.position.copy(origin); im.count = 0; }
  }
  end() { for (const im of [this.bodies, this.wings]) { im.instanceMatrix.needsUpdate = true; im.visible = im.count > 0; } }
  hide() { for (const im of [this.bodies, this.wings]) { im.count = 0; im.visible = false; } }
  dispose() { for (const im of [this.bodies, this.wings]) { this.group.remove(im); im.dispose(); } this.bodyGeo.dispose(); this.mat.dispose(); this.wingMat.dispose(); }
}
const _w = new THREE.Matrix4(), _w2 = new THREE.Matrix4(), _wr = new THREE.Matrix4();
// one flyer's beat: phase (0..1 of a beat), flap (beating, or 0: held out gliding)
export class Flyer {
  constructor(sp, seed = 0) { this.sp = sp; this.phase = (seed % 997) / 997; this.beat = 0; }
  update(dt, flap) {
    const D = this.sp.d;
    this.beat += ((flap ? 1 : 0) - this.beat) * Math.min(1, dt * 4);
    this.phase = (this.phase + dt * D.flapHz * (0.3 + 0.7 * this.beat)) % 1;
  }
  write(root) {
    const sp = this.sp, D = sp.d, s = Math.sin(this.phase * Math.PI * 2);
    put(sp.bodies, root);
    const half = D.span * 0.5, inner = half * 0.45, outer = half * 0.55;
    if (D.radial) {
      // (a ring of flaps from the hub's rim, the wave running round it)
      for (let k = 0; k < D.wings; k++) {
        const a = Math.PI * 2 * k / D.wings, sk = Math.sin((this.phase + k / D.wings) * Math.PI * 2), lift = 0.1 + 0.7 * this.beat * sk;
        _wr.makeRotationY(-a + Math.PI / 2);
        _w.makeTranslation(D.body.r * 0.9, 0, 0).premultiply(_wr).premultiply(root);
        _w.multiply(_w2.makeRotationZ(lift)); _w.multiply(_w2.makeScale(inner, 1, D.chord * 0.8));
        put(sp.wings, _w);
        _w.multiply(_w2.makeScale(1 / inner, 1, 1 / (D.chord * 0.8))).multiply(_w2.makeTranslation(inner, 0, 0)).multiply(_w2.makeRotationZ(lift * 0.6)).multiply(_w2.makeScale(outer, 1, D.chord * 0.6));
        put(sp.wings, _w);
      }
      return;
    }
    // (two wings: the downstroke deep, the upstroke shallower; held a little up in a glide, a dihedral)
    const up = this.beat * (s > 0 ? 0.9 : 0.6) * s + 0.08;
    for (const side of [1, -1]) {
      _w.makeRotationZ(side * up).setPosition(side * D.body.r * 0.8, D.body.h * 0.2, -D.len * 0.05).premultiply(root);
      if (side < 0) _w.multiply(_w2.makeScale(-1, 1, 1));
      const sh = _w2.makeScale(inner, 1, D.chord);
      _wr.copy(_w).multiply(sh);
      put(sp.wings, _wr);
      _w.multiply(_w2.makeTranslation(inner, 0, 0)).multiply(_w2.makeRotationZ(0.5 * up)).multiply(_w2.makeScale(outer, 1, D.chord * 0.75));
      _w.multiply(_w2.makeTranslation(0, 0, D.chord * 0.1));
      put(sp.wings, _w);
    }
  }
}
