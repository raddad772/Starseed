// Items: things you carry and put down (a basic object system).
//
// World state. Every item is a record in one registry (game.items), and is
// either held by someone (holder: the character; your inventory is simply
// the items you hold) or resting in a frame:
//   vessel   in a ship's own coordinates: put down in a cabin or a bay, it
//            rides along wherever the ship goes (flight, FTL, docked inside
//            a carrier), the same nesting the ships themselves use
//   surface  a planet's body-fixed coordinates: it turns with the ground
//   orbit    let go of on a spacewalk: it coasts on your orbit (analytic)
// The render layer (render/itemVisuals.js) and the inventory screen only
// read it; what you are aiming at and which row is highlighted are the
// player's own.

import * as THREE from 'three';
import { propagate } from '../core/kepler.js';

// size: [width (x), height (y), length (z)] in metres; mass in kg
export const ITEM_TYPES = {
  toolbox: { name: 'Toolbox', size: [0.5, 0.24, 0.22], mass: 9, desc: 'Spanners, a multimeter, a roll of tape' },
  medkit: { name: 'Medkit', size: [0.4, 0.14, 0.3], mass: 2.2, desc: 'Dressings, splints, a stim injector' },
  supplies: { name: 'Supply crate', size: [0.6, 0.42, 0.42], mass: 18, desc: 'Ration packs for a week' },
  canister: { name: 'Fuel canister', size: [0.32, 0.52, 0.32], mass: 14, desc: 'Twenty litres of hydrazine' },
  lamp: { name: 'Field lamp', size: [0.22, 0.44, 0.22], mass: 3, desc: 'Lights up a room', light: { color: 0xffe2b8, intensity: 2.5, range: 8, at: [0, 0.12, 0] } },
  mug: { name: 'Coffee mug', size: [0.12, 0.1, 0.1], mass: 0.35, desc: '"World\'s okayest pilot"' },
};

export const STARTER_KIT = ['toolbox', 'medkit', 'supplies', 'canister', 'lamp', 'mug'];

const REACH = 2.6;          // m: how far you can reach to pick something up
const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _q = new THREE.Quaternion();
const _m = new THREE.Matrix4();

export class Items {
  constructor(game) {
    this.game = game;
    this.list = [];
    this.nextId = 1;
  }

  create(kind, holder = null) {
    const it = { id: this.nextId++, kind, holder, frame: null, vessel: null, body: null, pos: new THREE.Vector3(), quat: new THREE.Quaternion(), r0: null, v0: null, t0: 0 };
    this.list.push(it);
    return it;
  }

  heldBy(who) { return this.list.filter((it) => it.holder === who); }

  // ---------------------------------------------------------------- where it is

  // world-frame position (double precision, like everything in the sim)
  worldPos(it, out) {
    switch (it.frame) {
      case 'vessel': return it.vessel.localToWorld(out.copy(it.pos), out);
      case 'surface': return out.copy(it.pos).applyQuaternion(it.body.q).add(it.body.pos);
      case 'orbit': {
        const r = [0, 0, 0];
        propagate(it.r0, it.v0, this.game.t - it.t0, it.body.GM, r, [0, 0, 0]);
        return out.set(r[0], r[1], r[2]).add(it.body.pos);
      }
      default: return null;
    }
  }

  worldQuat(it, out) {
    switch (it.frame) {
      case 'vessel': return out.copy(it.vessel.quat).multiply(it.quat);
      case 'surface': return out.copy(it.body.q).multiply(it.quat);
      default: return out.copy(it.quat);
    }
  }

  // The resting item nearest along a view ray within reach (eye and dir in
  // world coordinates), or null
  lookAt(eye, dir, reach = REACH) {
    let best = null, bestT = Infinity;
    for (const it of this.list) {
      if (it.holder || !it.frame) continue;
      const p = this.worldPos(it, _a).sub(eye);
      const t = p.dot(dir);
      const s = ITEM_TYPES[it.kind].size;
      const r = Math.max(s[0], s[1], s[2]) / 2 + 0.12;
      if (t < 0.1 || t > reach + r) continue;
      if (p.addScaledVector(dir, -t).length() > r) continue;
      if (t < bestT) { bestT = t; best = it; }
    }
    return best;
  }

  // ---------------------------------------------------------------- moving it

  pickUp(it, who) {
    it.holder = who;
    it.frame = null; it.vessel = null; it.body = null; it.r0 = it.v0 = null;
  }

  // Put an item down in front of a person, wherever they are: on the floor of
  // the ship they walk in, on the ground, or adrift beside them. On top of
  // anything already there. Returns where, or null if they can't (in a seat).
  putDown(it, p) {
    const T = ITEM_TYPES[it.kind], hh = T.size[1] / 2;
    if (p.mode === 'ship') {
      const v = p.vessel, I = v.interior;
      const at = p.sPos.clone().addScaledVector(p.heading, 0.75);
      if (I.spotInside && !I.spotInside(at)) at.copy(p.sPos); // (facing a wall: at your feet)
      const fy = I.floorAt ? I.floorAt(at.x, at.z, p.sPos.y + 0.6) : null;
      at.y = fy !== null && fy !== undefined ? fy : p.sPos.y;
      at.y = this.stackTop('vessel', v, at, T) + hh;
      this.place(it, 'vessel', v, at, _q.setFromUnitVectors(_a.set(0, 0, -1), _b.copy(p.heading).negate().setY(0).normalize()));
      return v.name;
    }
    if (p.mode === 'surface') {
      const b = p.body;
      const up = _c.copy(p.fPos).normalize();
      const fwd = _b.copy(p.heading).addScaledVector(up, -p.heading.dot(up)).normalize();
      const at = p.fPos.clone().addScaledVector(fwd, 0.75);
      const dir = at.clone().normalize();
      at.copy(dir).multiplyScalar(b.R + b.groundHeight(dir)); // (below R in a basin: the ground the walker stands on)
      const lift = this.stackTop('surface', b, at, T, dir) - at.length();
      at.addScaledVector(dir, lift + hh);
      // upright, its front toward the person
      const back = fwd.clone(), right = _a.copy(dir).cross(back).normalize();
      this.place(it, 'surface', b, at, _q.setFromRotationMatrix(_m.makeBasis(right, dir, back.crossVectors(right, dir))));
      return b.data.name;
    }
    if (p.mode === 'eva') {
      const fwd = _a.set(0, 0, -1).applyQuaternion(p.evaQuat);
      it.frame = 'orbit'; it.vessel = null; it.body = p.body; it.holder = null;
      it.r0 = p.ePos.clone().addScaledVector(fwd, 0.75).toArray();
      it.v0 = p.eVel.toArray();
      it.t0 = this.game.t;
      it.quat.copy(p.evaQuat);
      return 'space';
    }
    return null;
  }

  place(it, frame, owner, pos, quat) {
    it.holder = null; it.frame = frame;
    it.vessel = frame === 'vessel' ? owner : null;
    it.body = frame === 'surface' ? owner : null;
    it.pos.copy(pos); it.quat.copy(quat);
  }

  // the top of whatever rests under a footprint at `at` in the same frame
  // (height along `up`: the frame's +Y, or the radial direction on a planet)
  stackTop(frame, owner, at, T, up = null) {
    let top = up ? at.length() : at.y;
    const rA = Math.max(T.size[0], T.size[2]) / 2;
    for (const o of this.list) {
      if (o.holder || o.frame !== frame || (frame === 'vessel' ? o.vessel : o.body) !== owner) continue;
      const S = ITEM_TYPES[o.kind];
      const d = _c.copy(o.pos).sub(at);
      const h = up ? d.dot(up) : d.y;
      d.addScaledVector(up || _b.set(0, 1, 0), -h);
      if (d.length() > rA + Math.max(S.size[0], S.size[2]) / 2 - 0.02) continue;
      const t = (up ? o.pos.dot(up) : o.pos.y) + S.size[1] / 2;
      if (t > top) top = t;
    }
    return top;
  }

  // ---------------------------------------------------------------- upkeep

  // things left in a ship that is destroyed scatter with the wreck (onto its
  // orbit); lights carried by nothing in reach
  update() {
    for (const it of this.list) {
      if (it.frame === 'vessel' && it.vessel.dead) {
        const v = it.vessel;
        it.r0 = v.localToBody(_a.copy(it.pos), _a).toArray();
        it.v0 = v.pointVelocity(_b.copy(it.pos), _b).toArray();
        it.t0 = this.game.t;
        it.quat.premultiply(v.quat);
        it.body = v.body; it.vessel = null; it.frame = 'orbit';
      }
    }
  }

  // lamps put down near the camera, as extra fixtures for the light rig
  lights(camWorld, out = []) {
    out.length = 0;
    for (const it of this.list) {
      const L = ITEM_TYPES[it.kind].light;
      if (!L || it.holder || !it.frame) continue;
      const w = this.worldPos(it, new THREE.Vector3());
      if (w.distanceTo(camWorld) > 120) continue;
      w.add(_a.fromArray(L.at).applyQuaternion(this.worldQuat(it, _q)));
      out.push({ w, color: L.color, intensity: L.intensity, range: L.range });
    }
    return out;
  }
}
