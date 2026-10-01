// Big-ship rendering: places the model, fires the drive plumes, raises the
// docking-pad pylons and turns the pad lights green when a craft is clamped,
// shimmers the hangar force field, blinks the strobes.

import * as THREE from 'three';
import { buildTender, buildCarrier } from './bigShips.js';
import { plumeMaterial } from './shipVisual.js';

const _v = new THREE.Vector3();
const AMBER = new THREE.Color(0xf1b43a).multiplyScalar(2.4);
const CYAN = new THREE.Color(0x4fd6e6).multiplyScalar(2.4);
const GREEN = new THREE.Color(0x6ade8f).multiplyScalar(2.4);

export class BigShipVisual {
  constructor(engine, vessel) {
    this.engine = engine;
    this.v = vessel;
    const reg = vessel.registry || '';
    const m = vessel.type.key === 'tender' ? buildTender(vessel.name, reg) : buildCarrier(vessel.name, reg);
    this.model = m;
    engine.scene.add(m.root);
    this.fx = new THREE.Group();
    engine.transparentScene.add(this.fx);
    if (m.field) this.fx.add(m.field);
    // unit plume cone: wide end at the nozzle (y = 0), tip at y = -1, aimed aft (+z)
    const cone = new THREE.ConeGeometry(1, 1, 32, 1, true);
    cone.rotateX(Math.PI);
    cone.translate(0, -0.5, 0);
    this.plumes = vessel.type.engines.map(([x, y, z, r]) => {
      const p = new THREE.Mesh(cone, plumeMaterial([0.45, 0.55, 1.0], 1));
      p.position.set(x, y, z);
      p.rotation.x = -Math.PI / 2;
      p.userData.r = r;
      p.visible = false;
      this.fx.add(p);
      return p;
    });
    this.time = 0;
    this.blink = Math.random() * 2;
    this.heat = 0;
  }

  update(dt, camWorld) {
    const v = this.v, m = this.model;
    this.time += dt;
    m.root.position.copy(v.getWorldPos(_v)).sub(camWorld);
    m.root.quaternion.copy(v.quat);
    this.fx.position.copy(m.root.position);
    this.fx.quaternion.copy(v.quat);
    const d = m.root.position.length();
    const vis = !v.dead && d < v.type.radius * 900;
    m.root.visible = this.fx.visible = vis;
    if (!vis) return;
    // drive
    const mainT = Math.max(0, -v.thrustLocal.z) / v.limits.main;
    this.heat += (mainT - this.heat) * Math.min(1, dt * (mainT > this.heat ? 0.8 : 0.15));
    m.glow.emissiveIntensity = this.heat * 0.8;
    for (const p of this.plumes) {
      const u = p.material.uniforms;
      u.uTime.value = this.time;
      u.uThrottle.value = mainT;
      p.visible = mainT > 0.01;
      const r = p.userData.r;
      p.scale.set(r * 0.85, r * (3 + 8 * mainT), r * 0.85);
    }
    // docking pads: amber = free, cyan = a craft inside the zone, green = clamped
    if (m.pads) for (const p of m.pads) {
      let state = 0;
      for (const c of v.children) if (c.zone === p.zone) state = Math.max(state, c.attached ? 2 : 1);
      p.lightMat.color.copy(state === 2 ? GREEN : (state === 1 ? CYAN : AMBER));
      p.lift += THREE.MathUtils.clamp((state === 2 ? 1 : 0) - p.lift, -dt * 0.6, dt * 0.6);
      p.pylons.scale.y = 0.15 + 0.85 * p.lift;
    }
    if (m.field) m.field.material.uniforms.uTime.value = this.time;
    // strobes
    this.blink = (this.blink + dt) % 2.0;
    const on = this.blink < 0.1 || (this.blink > 0.3 && this.blink < 0.4);
    for (const n of m.navLights) n.visible = on;
  }
}
