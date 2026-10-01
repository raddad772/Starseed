// Items as you see them: a small model per kind (plain shapes), placed each
// frame from the item's world state, camera-relative like everything else.
// Held items aren't drawn. Lit by the sun, by ships' fixtures and by field
// lamps (see Items.lights).

import * as THREE from 'three';
import { fixtureLit } from './lightRig.js';

const _p = new THREE.Vector3();

const mat = (color, metal = 0.2, rough = 0.6) => fixtureLit(new THREE.MeshStandardMaterial({ color, metalness: metal, roughness: rough }));
const glow = (color) => new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(1.4) });

function box(g, w, h, l, m, x = 0, y = 0, z = 0) {
  const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, l), m);
  o.position.set(x, y, z);
  g.add(o);
  return o;
}
function cyl(g, r0, r1, h, m, x = 0, y = 0, z = 0, seg = 16) {
  const o = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg), m);
  o.position.set(x, y, z);
  g.add(o);
  return o;
}

// each model centred on its origin, its size as in ITEM_TYPES
const BUILD = {
  toolbox(g) {
    const red = mat(0xb8321d, 0.3, 0.45), steel = mat(0x55595e, 0.8, 0.35);
    box(g, 0.5, 0.2, 0.22, red, 0, -0.02, 0);
    box(g, 0.5, 0.025, 0.225, steel, 0, 0.065, 0);
    box(g, 0.04, 0.05, 0.03, steel, -0.12, 0.1, 0); box(g, 0.04, 0.05, 0.03, steel, 0.12, 0.1, 0);
    box(g, 0.28, 0.025, 0.03, steel, 0, 0.12, 0);
    for (const x of [-0.2, 0.2]) box(g, 0.03, 0.04, 0.012, steel, x, 0.04, 0.115);
  },
  medkit(g) {
    const white = mat(0xe6e7e2, 0.05, 0.5), red = mat(0xc4261c, 0.05, 0.5), grey = mat(0x6f7378, 0.4, 0.4);
    box(g, 0.4, 0.14, 0.3, white);
    box(g, 0.16, 0.008, 0.05, red, 0, 0.074, 0); box(g, 0.05, 0.008, 0.16, red, 0, 0.074, 0);
    box(g, 0.405, 0.02, 0.305, grey, 0, 0.0, 0);
    box(g, 0.12, 0.025, 0.02, grey, 0, 0.0, 0.16);
  },
  supplies(g) {
    const olive = mat(0x5c6143, 0.15, 0.75), strap = mat(0x2c2f2a, 0.2, 0.7), label = mat(0xd8d2b8, 0, 0.8);
    box(g, 0.6, 0.42, 0.42, olive);
    for (const x of [-0.18, 0.18]) box(g, 0.05, 0.425, 0.425, strap, x, 0, 0);
    box(g, 0.22, 0.12, 0.005, label, 0, 0.04, 0.212);
  },
  canister(g) {
    const yel = mat(0xd39a1c, 0.3, 0.5), steel = mat(0x4b4f54, 0.8, 0.35);
    cyl(g, 0.15, 0.15, 0.42, yel, 0, -0.04, 0);
    cyl(g, 0.152, 0.152, 0.03, steel, 0, -0.1, 0); cyl(g, 0.152, 0.152, 0.03, steel, 0, 0.08, 0);
    cyl(g, 0.04, 0.04, 0.06, steel, 0.06, 0.2, 0, 10);
    box(g, 0.03, 0.03, 0.18, steel, -0.05, 0.23, 0);
  },
  lamp(g) {
    const body = mat(0x2b2e33, 0.5, 0.4), cage = mat(0x777b80, 0.8, 0.3);
    cyl(g, 0.1, 0.11, 0.12, body, 0, -0.16, 0);
    cyl(g, 0.065, 0.065, 0.2, glow(0xffe2b8), 0, 0.0, 0, 14);
    for (const a of [0, 1, 2, 3]) box(g, 0.012, 0.22, 0.012, cage, Math.cos(a * Math.PI / 2) * 0.08, 0.0, Math.sin(a * Math.PI / 2) * 0.08);
    cyl(g, 0.09, 0.07, 0.04, body, 0, 0.12, 0);
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.008, 6, 16, Math.PI), cage);
    handle.position.set(0, 0.14, 0);
    g.add(handle);
  },
  mug(g) {
    const blue = mat(0x3f6e9e, 0.05, 0.35), coffee = mat(0x2a170c, 0, 0.2);
    cyl(g, 0.045, 0.04, 0.1, blue, 0, 0, 0, 18);
    cyl(g, 0.04, 0.04, 0.005, coffee, 0, 0.04, 0, 18);
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.008, 6, 14), blue);
    handle.position.set(0.05, 0, 0);
    g.add(handle);
  },
};

export class ItemVisuals {
  constructor(engine, items) {
    this.items = items;
    this.root = new THREE.Group();
    this.root.name = 'items';
    engine.scene.add(this.root);
    this.models = new Map();
  }

  model(it) {
    let g = this.models.get(it);
    if (!g) {
      g = new THREE.Group();
      (BUILD[it.kind] || BUILD.supplies)(g);
      g.traverse((o) => { if (o.isMesh) { o.castShadow = !o.material.isMeshBasicMaterial; o.receiveShadow = true; } });
      this.root.add(g);
      this.models.set(it, g);
    }
    return g;
  }

  update(camWorld) {
    for (const it of this.items.list) {
      const g = this.model(it);
      if (it.holder || !it.frame) { g.visible = false; continue; }
      this.items.worldPos(it, _p).sub(camWorld);
      g.visible = _p.lengthSq() < 2000 * 2000;
      if (!g.visible) continue;
      g.position.copy(_p);
      this.items.worldQuat(it, g.quaternion);
    }
  }
}
