// Debug / spectator camera: 6-DOF flight with altitude-scaled speed. Its
// position and orientation live in the body-fixed (co-rotating) frame of a
// reference body, so it rides along with the planet's orbit and spin.

import * as THREE from 'three';

const _q = new THREE.Quaternion();
const X = new THREE.Vector3(1, 0, 0), Y = new THREE.Vector3(0, 1, 0), Z = new THREE.Vector3(0, 0, 1);

export class FreeCam {
  constructor(game) {
    this.game = game;
    this.speedMul = 1;
    this.ref = null;                       // reference body
    this.posF = new THREE.Vector3();       // body-fixed position
    this.quatF = new THREE.Quaternion();   // body-fixed orientation
  }

  setRef(body) {
    const g = this.game;
    this.ref = body;
    this.posF.copy(g.camPos).sub(body.pos).applyQuaternion(body.qInv);
    this.quatF.copy(body.qInv).multiply(g.camQuat);
  }

  placeAbove(body, altitude, sunSide = true) {
    const g = this.game;
    const toSun = body.pos.clone().negate().normalize();
    const side = new THREE.Vector3(0, 1, 0).cross(toSun).normalize();
    const dir = toSun.clone().multiplyScalar(sunSide ? 0.8 : -0.8).addScaledVector(side, 0.6).normalize();
    g.camPos.copy(body.pos).addScaledVector(dir, body.R + altitude);
    const m = new THREE.Matrix4().lookAt(g.camPos, body.pos, new THREE.Vector3(0, 1, 0));
    g.camQuat.setFromRotationMatrix(m);
    this.setRef(body);
  }

  // Place at body-fixed latitude/longitude (deg), altitude above ground (m),
  // looking along heading (deg from north) with pitch (deg above horizon).
  placeAt(body, lat, lon, alt, heading = 0, pitch = 0) {
    const g = this.game;
    const la = THREE.MathUtils.degToRad(lat), lo = THREE.MathUtils.degToRad(lon);
    const dirF = new THREE.Vector3(Math.cos(la) * Math.cos(lo), Math.sin(la), Math.cos(la) * Math.sin(lo));
    const ground = body.solid ? body.groundHeight(dirF) : 0;
    this.ref = body;
    this.posF.copy(dirF).multiplyScalar(body.R + ground + alt);
    const up = dirF.clone();
    const north = new THREE.Vector3(0, 1, 0).addScaledVector(up, -up.y);
    if (north.lengthSq() < 1e-8) north.set(1, 0, 0).addScaledVector(up, -up.x);
    north.normalize();
    const east = new THREE.Vector3().crossVectors(north, up).normalize();
    const h = THREE.MathUtils.degToRad(heading), p = THREE.MathUtils.degToRad(pitch);
    const fwd = north.clone().multiplyScalar(Math.cos(h)).addScaledVector(east, Math.sin(h)).multiplyScalar(Math.cos(p)).addScaledVector(up, Math.sin(p)).normalize();
    const right = new THREE.Vector3().crossVectors(fwd, up).normalize();
    const camUp = new THREE.Vector3().crossVectors(right, fwd).normalize();
    const m = new THREE.Matrix4().makeBasis(right, camUp, fwd.clone().negate());
    this.quatF.setFromRotationMatrix(m);
    this.sync();
    g.engine.adaptReset = true;
  }

  sync() {
    const g = this.game, b = this.ref;
    if (!b) return;
    g.camPos.copy(this.posF).applyQuaternion(b.q).add(b.pos);
    g.camQuat.copy(b.q).multiply(this.quatF);
  }

  update(dtReal, dt, input) {
    const g = this.game;
    if (!this.ref) this.setRef(g.universe.dominantBody(g.camPos));
    const m = input.mouse();
    _q.setFromAxisAngle(Y, -m.dx); this.quatF.multiply(_q);
    _q.setFromAxisAngle(X, -m.dy); this.quatF.multiply(_q);
    const roll = input.axis('KeyE', 'KeyQ');
    if (roll) { _q.setFromAxisAngle(Z, roll * dtReal * 1.2); this.quatF.multiply(_q); }
    this.quatF.normalize();
    if (input.wheel) this.speedMul *= Math.pow(1.4, -input.wheel);
    this.sync();
    const near = g.universe.nearestBody(g.camPos);
    const alt = Math.max(1, near.dist);
    const speed = Math.min(3e9, Math.max(4, alt * 0.6)) * this.speedMul * (input.down('ShiftLeft') ? 6 : 1);
    const v = new THREE.Vector3(input.axis('KeyA', 'KeyD'), input.axis('KeyC', 'Space'), input.axis('KeyW', 'KeyS'));
    if (v.lengthSq() > 0) {
      v.normalize().multiplyScalar(speed * dtReal).applyQuaternion(this.quatF);
      this.posF.add(v);
    }
    // switch reference body when leaving its sphere of influence
    const dom = g.universe.dominantBody(g.camPos);
    if (dom !== this.ref) { this.sync(); this.setRef(dom); }
    this.sync();
  }
}
