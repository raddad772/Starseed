// Big-ship rendering: places the model, fires the drive plumes, raises the
// docking-pad pylons and turns the pad lights green when a craft is clamped,
// shimmers the hangar force field, blinks the strobes. Ships modelled in
// Blender (a type with a .model) also draw only the rooms near you.

import * as THREE from 'three';
import { buildTender } from './bigShips.js';
import { buildGlbShip, visibleRooms } from './glbShip.js';
import { plumeMaterial } from './shipVisual.js';
import { fixtureLit } from './lightRig.js';

const _v = new THREE.Vector3();
const AMBER = new THREE.Color(0xf1b43a).multiplyScalar(2.4);
const CYAN = new THREE.Color(0x4fd6e6).multiplyScalar(2.4);
const GREEN = new THREE.Color(0x6ade8f).multiplyScalar(2.4);

export class BigShipVisual {
  constructor(engine, vessel) {
    this.engine = engine;
    this.v = vessel;
    const reg = vessel.registry || '';
    const m = vessel.type.model ? buildGlbShip(engine, vessel) : buildTender(vessel.name, reg);
    this.model = m;
    engine.scene.add(m.root);
    this.fx = new THREE.Group();
    engine.transparentScene.add(this.fx);
    if (m.field) this.fx.add(m.field);
    m.onLoaded = () => { for (const f of m.fields) this.fx.add(f); };
    // unit plume cone: wide end at the nozzle (y = 0), tip at y = -1, aimed aft (+z)
    const cone = new THREE.ConeGeometry(1, 1, 32, 1, true);
    cone.rotateX(Math.PI);
    cone.translate(0, -0.5, 0);
    this.doorLeaves = vessel.type.slideDoors ? this.buildDoors(vessel.type.slideDoors, m.root) : [];
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
    if (m.fields) for (const f of m.fields) f.material.uniforms.uTime.value = this.time;
    if (m.rooms && m.loaded) this.showRooms();
    if (this.doorLeaves.length) this.updateDoors();
    if (m.turbolift && v.turbolift) this.updateTurbolift();
    // strobes
    this.blink = (this.blink + dt) % 2.0;
    const on = this.blink < 0.1 || (this.blink > 0.3 && this.blink < 0.4);
    for (const n of m.navLights) n.visible = on;
  }

  // Sliding doors: two leaves per doorway, closing in the plane between the
  // two rooms' walls and sliding apart into the wall; a lit strip along each
  // leaf's middle. Drawn with the rooms either side, moved from the door's
  // state (world state on the vessel: the visual only reads it).
  buildDoors(list, root) {
    const panel = fixtureLit(new THREE.MeshStandardMaterial({ color: 0x7d8890, metalness: 0.6, roughness: 0.4 }));
    const strip = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x4fd6e6).multiplyScalar(1.6) });
    const out = [];
    for (const d of list) {
      const half = (d.u1 - d.u0) / 2, h = d.y1 - d.y0, T = 0.08;
      const g = new THREE.Group();
      const leaves = [];
      for (const side of [-1, 1]) {
        const geo = d.axis === 'x' ? new THREE.BoxGeometry(T, h, half) : new THREE.BoxGeometry(half, h, T);
        const leaf = new THREE.Mesh(geo, panel);
        const sg = d.axis === 'x' ? new THREE.BoxGeometry(T + 0.02, 0.06, half * 0.8) : new THREE.BoxGeometry(half * 0.8, 0.06, T + 0.02);
        const st = new THREE.Mesh(sg, strip);
        st.position.y = 0.1;
        leaf.add(st);
        g.add(leaf);
        leaves.push({ mesh: leaf, side });
      }
      g.position.set(d.axis === 'x' ? d.plane : (d.u0 + d.u1) / 2, d.y0 + h / 2, d.axis === 'x' ? (d.u0 + d.u1) / 2 : d.plane);
      g.visible = false;
      root.add(g);
      out.push({ d, g, leaves, half });
    }
    return out;
  }

  updateDoors() {
    const v = this.v;
    for (const L of this.doorLeaves) {
      if (!L.g.visible) continue;
      const o = v.doors[L.d.id].open;
      for (const lf of L.leaves) {
        const u = lf.side * (L.half / 2 + o * L.half * 0.98);
        if (L.d.axis === 'x') lf.mesh.position.z = u; else lf.mesh.position.x = u;
        lf.mesh.visible = o < 0.98; // (fully open: inside the wall)
      }
    }
  }

  // The turbolift where its state has it (world state: the visual only reads
  // it): the car, its doors at the landing it stands at, the landing doors, and
  // the junctions' tongues (horizontal ones slide 3.25 m apart, vertical ones
  // rise 5.2 m into the guideway, for a car going up or down a shaft)
  updateTurbolift() {
    const T = this.model.turbolift, tl = this.v.turbolift, S = tl.spec;
    if (!this._sw) {
      this._sw = {};
      for (const [k, d] of Object.entries(S.switches || {})) this._sw[d.name] = { k, axis: d.axis, at: tl.nodes[k] };
    }
    const car = tl.cars[0], st = tl.stationOf(car);
    if (T.car) T.car.position.copy(car.pos);
    for (const d of T.carDoors) d.o.position.x = d.x0 + d.side * S.car.leaf * (st && st.end === d.end ? car.doors : 0);
    for (const d of T.landing) d.o.position.x = d.x0 + d.side * 1.14 * (tl.landing[d.st] || 0);
    for (const s of T.switches) {
      const w = this._sw[s.name];
      if (!w) continue;
      const u = tl.sw[w.k].at * 3.25 * (w.axis === 2 ? -s.sign : s.sign);
      s.o.position.copy(w.at);
      s.o.position.setComponent(w.axis, w.at.getComponent(w.axis) + u);
    }
    for (const g of T.tongues) {
      const w = this._sw[g.name];
      if (w) g.o.position.set(w.at.x, w.at.y - 5.2 * (1 - tl.sw[w.k].at), w.at.z);
    }
  }

  // the interior near you, and lit windows wherever you can't see in
  showRooms() {
    const v = this.v, m = this.model, I = v.interior;
    const p = v.game.player;
    let room = null;
    if (p.aboard && p.vessel === v) room = I.roomAt(p.mode === 'seat' ? _v.fromArray(v.type.seats[p.seat || 0].pos) : p.sPos, 1.0);
    else if (p.aboard && p.vessel.parent === v) room = I.roomAt(p.vessel.lpos, 3.0);
    // in a turbolift car: the landing beyond its doors where it stands, else nothing but the car
    if (room && room.car) {
      const st = I.tl.stationOf(room.tl);
      if (st) room = I.rooms.find((r) => r.id === st.landing) || room;
    }
    const ri = room ? I.rooms.indexOf(room) : -1;
    if (ri === this._ri) return;
    this._ri = ri;
    const vis = visibleRooms(I, ri);
    for (const [id, n] of m.rooms) n.visible = vis.has(id);
    for (const L of this.doorLeaves) L.g.visible = vis.has(L.d.rooms[0]) || vis.has(L.d.rooms[1]);
    if (m.hall) m.hall.visible = [...vis].some((id) => id.startsWith('eng-') || id === 'reactor-pass');
    for (const [id, n] of m.glows) n.visible = ri < 0 || !vis.has(id);
  }
}
