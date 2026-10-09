// A rocky world's ring from inside it or close by: its boulders round the camera (sim/ringField.js,
// the same ones the suit and ships bump into), solid, lit and shadowed like any rock; the ring's haze
// and its far reaches the air pass's (webgpu/rings.js). One instanced mesh, its instances written each
// view: they move (the ring goes round), and with the camera.
import * as THREE from 'three';
import { SHADOW_LAYER, receiveShadows } from './sunShadows.js';
import { bouldersNear } from '../sim/ringField.js';

const REACH = 500, MAX = 4000;

// (a lumpy rock: an icosphere pushed in and out by its direction, faceted)
function rockGeometry() {
  const g = new THREE.IcosahedronGeometry(1, 2), p = g.attributes.position, v = new THREE.Vector3();
  const bump = (x, y, z) => 1 + 0.16 * Math.sin(3.1 * x + 1.7 * y) * Math.cos(2.3 * z - 0.6 * x) + 0.09 * Math.sin(7.3 * y + 4.1 * z) + 0.05 * Math.cos(11.9 * x - 6.2 * z);
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const k = bump(v.x, v.y, v.z); p.setXYZ(i, v.x * k, v.y * k * 0.85, v.z * k); }
  g.computeVertexNormals();
  return g;
}

const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _ax = new THREE.Vector3();
export class RingBoulders {
  constructor(scene) {
    this.material = receiveShadows(new THREE.MeshStandardMaterial({ color: 0x777066, roughness: 0.95, metalness: 0 }));
    this.mesh = new THREE.InstancedMesh(rockGeometry(), this.material, MAX);
    this.mesh.count = 0; this.mesh.visible = false; this.mesh.frustumCulled = false;
    this.mesh.layers.enable(SHADOW_LAYER); this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(this.mesh);
    this.list = []; this.rings = null;
  }
  // for this view: the boulders round camWorld, of whichever world's ring it's in or by
  update(items, camWorld, t) {
    let n = 0;
    for (const it of items) {
      const b = it.body, R = b.data.rings;
      if (R?.kind !== 'debris') continue;
      const rel = _p.copy(camWorld).sub(b.pos);
      if (!bouldersNear(b, rel, t, REACH, this.list, MAX, 1)) continue;
      if (this.rings !== R) { this.rings = R; this.material.color.setRGB(...R.color.map((c) => Math.min(1, c * 1.15))); }
      // (from the camera: the body's place from it plus the boulder's from the body, in doubles)
      const ox = b.pos.x - camWorld.x, oy = b.pos.y - camWorld.y, oz = b.pos.z - camWorld.z;
      for (const o of this.list) {
        const h = o.id;
        _ax.set(((h & 255) / 255) - 0.5, (((h >>> 8) & 255) / 255) - 0.5, (((h >>> 16) & 255) / 255) - 0.5).normalize();
        _q.setFromAxisAngle(_ax, (h % 6283) / 1000 + o.spin * 0.05 * (t % 125664));
        _s.set(o.a * (0.8 + 0.4 * ((h >>> 3) & 15) / 15), o.a * (0.6 + 0.4 * ((h >>> 7) & 15) / 15), o.a * (0.8 + 0.4 * ((h >>> 11) & 15) / 15));
        _m.compose(_p.set(ox + o.x, oy + o.y, oz + o.z), _q, _s);
        this.mesh.setMatrixAt(n++, _m);
      }
      break;
    }
    this.mesh.count = n; this.mesh.visible = n > 0;
    if (n) this.mesh.instanceMatrix.needsUpdate = true;
  }
  dispose() { this.mesh.removeFromParent(); this.mesh.geometry.dispose(); this.material.dispose(); }
}
