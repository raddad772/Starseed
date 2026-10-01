// First-person character: pilot seats, walking inside vessels (artificial
// gravity), walking/jetpacking on any surface, and EVA in space.
//
// Coordinate spaces: seated or walking aboard, the player lives in a vessel's
// local frame (sPos/sVel); on a planet in its body-fixed frame (fPos/fVel); on
// a spacewalk in its body's inertial frame (ePos/eVel). Vessels nest (a
// shuttle docked in a carrier's hangar), so walking down the shuttle's ramp
// hands the player to the carrier's frame, and walking up it hands them back.
//
// Look direction uses a heading vector kept tangent to the local "up" and a
// pitch angle. The heading is re-projected onto the tangent plane every frame,
// which parallel-transports it as you walk around a planet: no lat/long
// angles, so poles are ordinary places. EVA uses a free 6-DOF orientation.

import * as THREE from 'three';
import { SHIP_INTERIOR, SHIP_HULL_BOXES } from '../render/shipModel.js';

const EYE = 1.68;
const RADIUS = 0.3;
const WALK = 4.2, SPRINT = 8.5, SWIM = 1.8;
const JET_ACCEL_SURF = 1.55; // multiples of local g available to the jetpack, min 6 m/s^2
const JET_TIME = 4.5;        // seconds of full burn
const EVA_ACCEL = 1.6;
const PLATING_G = 9.81;

const _v1 = new THREE.Vector3(), _v2 = new THREE.Vector3(), _v3 = new THREE.Vector3(), _v4 = new THREE.Vector3();
const _q1 = new THREE.Quaternion(), _q2 = new THREE.Quaternion();
const _m4 = new THREE.Matrix4();

export function lookQuat(up, heading, pitch, out) {
  const fwd = _v1.copy(heading).multiplyScalar(Math.cos(pitch)).addScaledVector(up, Math.sin(pitch)).normalize();
  const right = _v2.copy(fwd).cross(up).normalize();
  const camUp = _v3.copy(right).cross(fwd).normalize();
  _m4.makeBasis(right, camUp, _v4.copy(fwd).negate());
  return out.setFromRotationMatrix(_m4);
}

export class Player {
  constructor(game) {
    this.game = game;
    this.mode = 'surface'; // 'seat' | 'ship' | 'surface' | 'eva'
    this.body = null;
    this.vessel = null;    // the vessel whose space we are in (seat / ship modes)
    this.seat = 0;
    this.lastSeat = null;  // { vessel, seat } for the recall key
    this.sPos = new THREE.Vector3(); this.sVel = new THREE.Vector3();
    this.fPos = new THREE.Vector3(); this.fVel = new THREE.Vector3();
    this.ePos = new THREE.Vector3(); this.eVel = new THREE.Vector3();
    this.heading = new THREE.Vector3(0, 0, -1);
    this.pitch = 0;
    this.evaQuat = new THREE.Quaternion();
    this.headYaw = 0; this.headPitch = 0;
    this.grounded = false;
    this.jetFuel = 1;
    this.jetOn = false;
    this.swimming = false;
    this.prompt = null;
    this.camPos = new THREE.Vector3();
    this.camQuat = new THREE.Quaternion();
    this.bob = 0;
    this.footstep = 0;
    this.landImpact = 0;
    this.fade = 0;          // lift / recall transitions
    this.env = { pressure: 0, temperature: 290, gravity: 0 };
    this._room = null;
  }

  // the player's own shuttle
  get ship() { return this.game.ship; }
  get aboard() { return this.mode === 'seat' || this.mode === 'ship'; }

  // ------------------------------------------------------------------ frames

  shipFixedPose(outPos, outQuat) {
    // home ship pose in its body's fixed frame
    const s = this.ship, b = s.body;
    outPos.copy(s.pos).applyQuaternion(b.qInv);
    outQuat.copy(b.qInv).multiply(s.quat);
  }

  // ------------------------------------------------------------------ placement

  placeOnSurface(body, dirF, headingF) {
    this.mode = 'surface';
    this.body = body;
    const up = dirF.clone().normalize();
    const gh = body.groundHeight(up);
    this.fPos.copy(up).multiplyScalar(body.R + gh + 0.02);
    this.fVel.set(0, 0, 0);
    this.heading.copy(headingF).addScaledVector(up, -headingF.dot(up)).normalize();
    this.pitch = 0;
    this.grounded = true;
  }

  // standing in a vessel's space at a local point
  placeAboard(v, local, headingLocal) {
    this.mode = 'ship';
    this.vessel = v;
    this.body = v.body;
    this.sPos.copy(local);
    this.sVel.set(0, 0, 0);
    this.heading.copy(headingLocal).setY(0).normalize();
    this.pitch = 0;
    this.grounded = true;
    this._room = null;
  }

  sitDown(seat = 0, vessel = this.vessel) {
    if (this.vessel && this.vessel !== vessel) this.vessel.pilotPresent = false;
    this.vessel = vessel;
    this.mode = 'seat';
    this.seat = seat;
    this.headYaw = 0; this.headPitch = 0;
    vessel.pilotPresent = true;
    this.lastSeat = { vessel, seat };
    this.game.onModeChange && this.game.onModeChange('seat');
  }

  standUp() {
    const v = this.vessel;
    v.pilotPresent = false;
    const s = v.type.seats[this.seat] || v.type.seats[0];
    this.mode = 'ship';
    this.sPos.set(s.stand[0], s.stand[1], s.stand[2]);
    this.sVel.set(0, 0, 0);
    this.heading.set(s.heading[0], 0, s.heading[2]).normalize();
    this.pitch = -0.1;
    this._room = null;
    this.game.onModeChange && this.game.onModeChange('ship');
  }

  // back to the last pilot seat from anywhere
  recallSeat() {
    const ls = this.lastSeat;
    if (!ls || ls.vessel.dead) { this.game.message('No pilot seat to return to', 'caution'); return; }
    if (this.mode === 'seat' && this.vessel === ls.vessel) return;
    this.fade = 1;
    this.sitDown(ls.seat, ls.vessel);
    this.body = ls.vessel.body;
    this.game.message(`Back in the ${ls.vessel.type.seats[ls.seat].label.toLowerCase()} · ${ls.vessel.name}`, 'nav');
  }

  rideLift(to) {
    this.fade = 1;
    this.sPos.set(to[0], to[1], to[2]);
    this.sVel.set(0, 0, 0);
    this.grounded = true;
    this._room = null;
    this.game.audio && this.game.audio.clunk();
  }

  // ------------------------------------------------------------------ update

  update(dt, input, mouse) {
    this.prompt = null;
    this.fade = Math.max(0, this.fade - dt * 1.6);
    // the walking / EVA updates light it while thrusting; a seat never does
    // (it used to stay lit after boarding or a P recall mid-burn: a
    // continuous jet hiss for the rest of the flight)
    this.jetOn = false;
    if (this.mode === 'seat') this.updateSeat(dt, input, mouse);
    else if (this.mode === 'ship') this.updateShip(dt, input, mouse);
    else if (this.mode === 'surface') this.updateSurface(dt, input, mouse);
    else this.updateEva(dt, input, mouse);
    if (this.grounded && this.mode !== 'seat') this.jetFuel = Math.min(1, this.jetFuel + dt / 2.5);
  }

  updateSeat(dt, input, mouse) {
    const freeLook = input.buttons & 2 || input.down('AltLeft');
    if (freeLook) {
      this.headYaw = THREE.MathUtils.clamp(this.headYaw - mouse.dx, -1.9, 1.9);
      this.headPitch = THREE.MathUtils.clamp(this.headPitch - mouse.dy, -1.0, 1.2);
    } else {
      const k = Math.min(1, dt * 4);
      this.headYaw -= this.headYaw * k; this.headPitch -= this.headPitch * k;
    }
    this.body = this.vessel.body;
    if (input.hit('KeyF')) this.standUp();
  }

  // Walking aboard a vessel (its local frame, plating gravity along -Y)
  updateShip(dt, input, mouse) {
    const v = this.vessel;
    const I = v.interior;
    this.body = v.body;
    const up = _v4.set(0, 1, 0);
    this.lookUpdate(up, mouse);
    const fwd = this.heading.clone(), right = fwd.clone().cross(up).normalize();
    const wish = new THREE.Vector3().addScaledVector(fwd, input.axis('KeyS', 'KeyW')).addScaledVector(right, input.axis('KeyA', 'KeyD'));
    if (wish.lengthSq() > 0) wish.normalize().multiplyScalar(input.down('ShiftLeft') ? SPRINT * I.sprint : WALK);
    const vac = I.vacuumAt(this.sPos);
    this.env.gravity = PLATING_G;
    this.env.pressure = vac ? 0 : 1; this.env.temperature = vac ? 3 : 293;
    if (this.grounded) {
      const dv = wish.clone().sub(_v1.set(this.sVel.x, 0, this.sVel.z));
      const maxDv = 40 * dt;
      if (dv.length() > maxDv) dv.setLength(maxDv);
      this.sVel.x += dv.x; this.sVel.z += dv.z;
      if (input.hit('Space')) { this.sVel.y = 3.2; this.grounded = false; }
    } else {
      // air control under plating gravity
      const ac = _v1.set(wish.x - this.sVel.x, 0, wish.z - this.sVel.z).multiplyScalar(0.6 * dt);
      this.sVel.add(ac);
      this.sVel.y -= PLATING_G * dt;
    }
    // jetpack: hold Space once off the floor (a hangar is 70 m tall)
    this.jetOn = false;
    if (input.down('Space') && !this.grounded && this.jetFuel > 0) {
      const a = Math.max(6, PLATING_G * JET_ACCEL_SURF);
      this.sVel.y += a * dt;
      if (wish.lengthSq() > 0) this.sVel.addScaledVector(_v1.copy(wish).normalize(), a * 0.6 * dt);
      this.jetFuel = Math.max(0, this.jetFuel - dt / JET_TIME);
      this.jetOn = true;
    }
    const prevY = this.sPos.y;
    this.sPos.addScaledVector(this.sVel, dt);
    // floor: looked up from where this step started, so a fast fall cannot
    // carry you through it (a long jetpack drop moves metres per step)
    const floorY = I.floorAt(this.sPos.x, this.sPos.z, Math.max(prevY, this.sPos.y));
    if (floorY !== null && (this.sPos.y <= floorY + 0.001 || (this.grounded && this.sPos.y - floorY < 0.35))) {
      if (!this.grounded && this.sVel.y < -6) this.landImpact = Math.min(1, -this.sVel.y / 20);
      this.sPos.y = floorY; this.sVel.y = Math.max(0, this.sVel.y); this.grounded = true;
    } else if (floorY === null || this.sPos.y > floorY + 0.05) this.grounded = false;
    I.ceilingClamp(this);
    if (I.confine(this) === 'exit') { this.exitVessel(); return; }
    // vessels resting in this one: bump into them, board them by the ramp
    for (const c of v.children) if (this.childAboard(c, input)) return;
    this.bobUpdate(dt, Math.hypot(this.sVel.x, this.sVel.z));
    I.interact(this, input);
  }

  // a vessel docked / flying inside the one we walk in
  childAboard(c, input) {
    if (c.dead || !c.interior) return false;
    const qi = _q1.copy(c.lquat).invert();
    const local = _v1.copy(this.sPos).sub(c.lpos).applyQuaternion(qi);
    if (local.lengthSq() > Math.pow(c.type.radius + 4, 2)) return false;
    if (c.interior.boardable(local)) {
      const vLocal = _v2.copy(this.sVel).sub(c.lvel).applyQuaternion(qi);
      const hLocal = _v3.copy(this.heading).applyQuaternion(qi);
      this.enterVessel(c, local.clone(), vLocal.clone(), hLocal.clone());
      return true;
    }
    // hull bump (approx: the craft is roughly upright on the deck)
    let pushed = false;
    for (const off of [0.4, 1.2]) {
      const cc = local.clone(); cc.y += off;
      for (const bx of c.interior.hullBoxes) {
        const ex = Math.max(bx.min[0] - RADIUS - cc.x, cc.x - (bx.max[0] + RADIUS), 0);
        const ey = Math.max(bx.min[1] - RADIUS - cc.y, cc.y - (bx.max[1] + RADIUS), 0);
        const ez = Math.max(bx.min[2] - RADIUS - cc.z, cc.z - (bx.max[2] + RADIUS), 0);
        if (ex === 0 && ey === 0 && ez === 0) {
          const d = [cc.x - (bx.min[0] - RADIUS), (bx.max[0] + RADIUS) - cc.x, cc.y - (bx.min[1] - RADIUS), (bx.max[1] + RADIUS) - cc.y, cc.z - (bx.min[2] - RADIUS), (bx.max[2] + RADIUS) - cc.z];
          let mi = 0;
          for (let i = 1; i < 6; i++) if (d[i] < d[mi]) mi = i;
          if (mi === 2) continue; // never push down through the deck
          const comp = ['x', 'y', 'z'][mi >> 1], sgn = (mi & 1) ? 1 : -1;
          local[comp] += sgn * d[mi]; cc[comp] += sgn * d[mi];
          pushed = true;
        }
      }
    }
    if (pushed) this.sPos.copy(local).applyQuaternion(c.lquat).add(c.lpos);
    if (c.type.ramp && local.length() < 16 && c.ramp < 0.5) {
      this.prompt = { key: 'F', text: `Lower ${c.name}'s ramp` };
      if (input.hit('KeyF')) this.game.toggleRamp(c);
    }
    return false;
  }

  enterVessel(v, local, vLocal, headingLocal) {
    this.mode = 'ship';
    this.vessel = v;
    this.body = v.body;
    this.sPos.copy(local);
    this.sVel.copy(vLocal);
    this.heading.copy(headingLocal).setY(0);
    if (this.heading.lengthSq() < 1e-6) this.heading.set(0, 0, -1);
    this.heading.normalize();
    this.grounded = false;
    this._room = null;
    this.game.onModeChange && this.game.onModeChange('ship');
  }

  // Walked out of a vessel: into its host's space if there is floor there,
  // otherwise onto the planet or into space
  exitVessel() {
    const v = this.vessel;
    const host = v.parent;
    if (host && host.interior) {
      const pl = _v1.copy(this.sPos).applyQuaternion(v.lquat).add(v.lpos);
      if (host.interior.roomAt(pl, 1.0)) {
        const vel = _v2.copy(this.sVel).applyQuaternion(v.lquat).add(v.lvel);
        const hd = _v3.copy(this.heading).applyQuaternion(v.lquat);
        this.enterVessel(host, pl.clone(), vel.clone(), hd.clone());
        return;
      }
    }
    // world (body-centred inertial) state of the player
    const b = v.body;
    const pW = _v1.copy(this.sPos).applyQuaternion(v.quat).add(v.pos);
    const vLocal = _v2.copy(v.angVel).cross(this.sPos).add(this.sVel);
    const vW = _v3.copy(vLocal).applyQuaternion(v.quat).add(v.vel);
    const headW = this.heading.clone().applyQuaternion(v.quat);
    const alt = pW.length() - b.R;
    this.body = b;
    this.vessel = null;
    if (b.solid && alt < 4000) {
      this.mode = 'surface';
      this.fPos.copy(pW).applyQuaternion(b.qInv);
      // inertial -> rotating-frame velocity
      const vf = vW.clone().sub(_v4.copy(b.omega).cross(pW)).applyQuaternion(b.qInv);
      this.fVel.copy(vf);
      this.heading.copy(headW).applyQuaternion(b.qInv);
      this.grounded = false;
    } else {
      this.mode = 'eva';
      this.ePos.copy(pW);
      this.eVel.copy(vW);
      lookQuat(_v4.set(0, 1, 0).applyQuaternion(v.quat), headW, this.pitch, this.evaQuat);
    }
    this.game.onModeChange && this.game.onModeChange(this.mode);
  }

  // Is a ship-local point within the home ship's boardable volume?
  boardable(p) { return this.ship.interior.boardable(p); }

  homeShipHere(b) {
    const ship = this.ship;
    return ship && !ship.dead && ship.body === b && !ship.parent;
  }

  updateSurface(dt, input, mouse) {
    const b = this.body;
    const up = _v4.copy(this.fPos).normalize();
    this.lookUpdate(up, mouse);
    const r = this.fPos.length();
    const g = b.GM / (r * r);
    this.env.gravity = g;
    const atm = b.atmosphereAt(r - b.R);
    this.env.pressure = atm.pressure; this.env.temperature = atm.temperature;
    const fwd = this.heading.clone();
    const right = fwd.clone().cross(up).normalize();
    const mv = new THREE.Vector3().addScaledVector(fwd, input.axis('KeyS', 'KeyW')).addScaledVector(right, input.axis('KeyA', 'KeyD'));
    // ground under us
    const gh = b.groundHeight(up);
    const water = b.isWaterAt(up) && b.data.terrain.liquid === 'water';
    const groundR = b.R + gh;
    this.swimming = water && r < groundR + 0.6;
    let speed = input.down('ShiftLeft') ? SPRINT : WALK;
    if (this.swimming) speed = SWIM;
    if (mv.lengthSq() > 0) mv.normalize().multiplyScalar(speed);
    const vn = this.fVel.dot(up);
    const vt = this.fVel.clone().addScaledVector(up, -vn);
    if (this.grounded) {
      // traction: slopes steeper than ~45 degrees shed you
      const n = b.groundNormal(up, _v2, gh);
      const slopeCos = n.dot(up);
      if (slopeCos < 0.68 && !this.swimming) {
        const down = up.clone().multiplyScalar(-g).addScaledVector(n, g * slopeCos);
        vt.addScaledVector(down, dt);
      } else {
        const dv = mv.clone().sub(vt);
        const maxDv = (this.swimming ? 6 : 30) * dt;
        if (dv.length() > maxDv) dv.setLength(maxDv);
        vt.add(dv);
      }
      this.fVel.copy(vt);
      if (input.hit('Space')) {
        this.fVel.addScaledVector(up, this.swimming ? 2 : Math.max(3.6, Math.sqrt(2 * g * 0.7)));
        this.grounded = false;
      }
    } else {
      // air control + gravity + jetpack
      const ac = mv.clone().sub(vt).multiplyScalar(0.6 * dt);
      this.fVel.add(ac);
      this.fVel.addScaledVector(up, -g * dt);
      // atmospheric drag (human body CdA ~ 0.6 m^2, 85 kg)
      const rho = atm.density;
      if (rho > 0) { const sp = this.fVel.length(); this.fVel.multiplyScalar(Math.max(0, 1 - 0.5 * rho * 0.6 * sp / 85 * dt)); }
    }
    this.jetOn = false;
    if (input.down('Space') && !this.grounded && this.jetFuel > 0) {
      const a = Math.max(6, g * JET_ACCEL_SURF);
      this.fVel.addScaledVector(up, a * dt);
      if (mv.lengthSq() > 0) this.fVel.addScaledVector(mv.clone().normalize(), a * 0.6 * dt);
      this.jetFuel = Math.max(0, this.jetFuel - dt / JET_TIME);
      this.jetOn = true;
    }
    this.fPos.addScaledVector(this.fVel, dt);
    // ground collision
    const up2 = _v1.copy(this.fPos).normalize();
    const gh2 = b.groundHeight(up2);
    const floorR = b.R + gh2 + (this.swimming || (water && b.isWaterAt(up2)) ? -1.3 : 0);
    const rr = this.fPos.length();
    if (rr <= floorR + 0.001 || (this.grounded && rr - floorR < 0.45 && this.fVel.dot(up2) <= 0.5)) {
      const impact = -this.fVel.dot(up2);
      if (!this.grounded && impact > 6) this.landImpact = Math.min(1, impact / 20);
      this.fPos.copy(up2).multiplyScalar(floorR);
      const vn2 = this.fVel.dot(up2);
      if (vn2 < 0) this.fVel.addScaledVector(up2, -vn2);
      this.grounded = true;
    } else if (rr > floorR + 0.5) this.grounded = false;
    this.rampSupport();
    this.collideShipExterior();
    this.bobUpdate(dt, this.grounded ? this.fVel.length() : 0);
    // boarding: inside the ramp / bay volume
    const ship = this.ship;
    if (this.homeShipHere(b)) {
      const sp = new THREE.Vector3(), sq = new THREE.Quaternion();
      this.shipFixedPose(sp, sq);
      const local = this.fPos.clone().sub(sp).applyQuaternion(sq.clone().invert());
      if (this.boardable(local)) {
        // velocity relative to the ship (it may be flying), in its axes
        const shipF = ship.vel.clone().sub(_v2.copy(b.omega).cross(ship.pos)).applyQuaternion(b.qInv);
        const vLocal = this.fVel.clone().sub(shipF).applyQuaternion(sq.clone().invert());
        const hLocal = this.heading.clone().applyQuaternion(sq.clone().invert());
        this.enterVessel(ship, local, vLocal, hLocal);
        return;
      }
      const dist = local.length();
      if (dist < 16 && ship.ramp < 0.5) this.prompt = { key: 'F', text: 'Lower the ramp' };
      if (dist < 16 && input.hit('KeyF')) this.game.toggleRamp(ship);
      else if (dist > 250 && ship.landed && input.hit('KeyB')) this.game.summonShip();
      if (dist > 250 && ship.landed) this.prompt = { key: 'B', text: 'Summon ship' };
    } else if (ship && !ship.dead && input.hit('KeyB')) this.game.summonShip();
    // leave the surface regime when high up (switch to inertial EVA physics)
    if (this.fPos.length() - b.R > 6000) this.toEva();
  }

  // The lowered ramp is walkable ground: stand on it when inside its footprint
  rampSupport() {
    const ship = this.ship;
    // (a parked ship only: a flying one's ramp moves under you, and holding
    // you on it here would cancel your fall the moment you jump)
    if (!this.homeShipHere(this.body) || !ship.landed || ship.ramp < 0.85) return;
    const I = SHIP_INTERIOR;
    const sp = _v2, sq = _q1;
    this.shipFixedPose(sp, sq);
    const sqi = _q2.copy(sq).invert();
    const local = _v3.copy(this.fPos).sub(sp).applyQuaternion(sqi);
    const a = ship.interior.rampAngle();
    const endZ = I.rampHinge.z + I.rampLength * Math.cos(a);
    if (Math.abs(local.x) > I.rampWidth || local.z < I.rampHinge.z - 0.3 || local.z > endZ + 0.25) return;
    const floor = ship.interior.floorAt(local.x, local.z);
    if (local.y < floor + 0.55 && local.y > floor - 1.4) {
      local.y = floor;
      this.fPos.copy(local).applyQuaternion(sq).add(sp);
      const up = _v4.copy(this.fPos).normalize();
      const vn = this.fVel.dot(up);
      if (vn < 0) this.fVel.addScaledVector(up, -vn);
      this.grounded = true;
    }
  }

  collideShipExterior() {
    if (!this.homeShipHere(this.body) || !this.ship.landed) return;
    const sp = _v2, sq = _q1;
    this.shipFixedPose(sp, sq);
    const sqi = _q2.copy(sq).invert();
    const local = _v3.copy(this.fPos).sub(sp).applyQuaternion(sqi);
    if (local.lengthSq() > 30 * 30) return;
    let pushed = false;
    for (const off of [0.4, 1.2]) {
      const c = local.clone(); c.y += off; // approx: ship roughly upright
      for (const bx of SHIP_HULL_BOXES) {
        const ex = Math.max(bx.min[0] - RADIUS - c.x, c.x - (bx.max[0] + RADIUS), 0);
        const ey = Math.max(bx.min[1] - RADIUS - c.y, c.y - (bx.max[1] + RADIUS), 0);
        const ez = Math.max(bx.min[2] - RADIUS - c.z, c.z - (bx.max[2] + RADIUS), 0);
        if (ex === 0 && ey === 0 && ez === 0) {
          const d = [c.x - (bx.min[0] - RADIUS), (bx.max[0] + RADIUS) - c.x, c.y - (bx.min[1] - RADIUS), (bx.max[1] + RADIUS) - c.y, c.z - (bx.min[2] - RADIUS), (bx.max[2] + RADIUS) - c.z];
          let mi = 0;
          for (let i = 1; i < 6; i++) if (d[i] < d[mi]) mi = i;
          const ax = mi >> 1, sgn = (mi & 1) ? 1 : -1;
          const comp = ['x', 'y', 'z'][ax];
          local[comp] += sgn * d[mi];
          c[comp] += sgn * d[mi];
          pushed = true;
          if (ax === 1 && sgn > 0) { this.grounded = true; } // standing on the hull / wing
        }
      }
    }
    if (pushed) {
      this.fPos.copy(local).applyQuaternion(sq).add(sp);
    }
  }

  toEva() {
    const b = this.body;
    this.ePos.copy(this.fPos).applyQuaternion(b.q);
    this.eVel.copy(this.fVel).applyQuaternion(b.q).add(_v1.copy(b.omega).cross(this.ePos));
    const up = this.ePos.clone().normalize();
    const hW = this.heading.clone().applyQuaternion(b.q);
    lookQuat(up, hW, this.pitch, this.evaQuat);
    this.mode = 'eva';
    this.game.onModeChange && this.game.onModeChange('eva');
  }

  // nearest live vessel within reach (EVA stabiliser reference)
  nearestVessel(maxDist) {
    let best = null, bd = maxDist;
    for (const v of this.game.vessels) {
      if (v.dead || v.body !== this.body) continue;
      const d = v.pos.distanceTo(this.ePos) - (v.big ? v.type.radius * 0.5 : 0);
      if (d < bd) { bd = d; best = v; }
    }
    return best;
  }

  updateEva(dt, input, mouse) {
    const b = this.body;
    _q1.setFromAxisAngle(_v1.set(0, 1, 0), -mouse.dx); this.evaQuat.multiply(_q1);
    _q1.setFromAxisAngle(_v1.set(1, 0, 0), -mouse.dy); this.evaQuat.multiply(_q1);
    const roll = input.axis('KeyE', 'KeyQ');
    if (roll) { _q1.setFromAxisAngle(_v1.set(0, 0, 1), roll * dt * 1.4); this.evaQuat.multiply(_q1); }
    this.evaQuat.normalize();
    const r = this.ePos.length();
    this.env.gravity = b.GM / (r * r);
    const atm = b.atmosphereAt(r - b.R);
    this.env.pressure = atm.pressure; this.env.temperature = atm.temperature;
    // gravity
    this.eVel.addScaledVector(this.ePos, -b.GM / (r * r * r) * dt);
    // jetpack 6-DOF
    const t = new THREE.Vector3(input.axis('KeyA', 'KeyD'), input.axis('KeyC', 'Space'), input.axis('KeyW', 'KeyS'));
    this.jetOn = false;
    if (t.lengthSq() > 0 && this.jetFuel > 0) {
      t.normalize().multiplyScalar(EVA_ACCEL * (input.down('ShiftLeft') ? 2.5 : 1) * dt).applyQuaternion(this.evaQuat);
      this.eVel.add(t);
      this.jetFuel = Math.max(0, this.jetFuel - dt / (JET_TIME * 6));
      this.jetOn = true;
    }
    // stabiliser: hold X to null velocity relative to the nearest vessel
    const near = this.nearestVessel(3000);
    if (input.down('KeyX') && near) {
      const rel = this.eVel.clone().sub(near.pointVelocity(near.bodyToLocal(this.ePos, _v2), _v3));
      const dv = Math.min(rel.length(), EVA_ACCEL * dt);
      if (rel.length() > 1e-6) this.eVel.addScaledVector(rel.normalize(), -dv);
    }
    if (atm.density > 0) {
      // drag acts on velocity through the air, which turns with the planet
      const air = _v2.copy(b.omega).cross(this.ePos);
      const rel = _v3.copy(this.eVel).sub(air);
      const sp = rel.length();
      rel.multiplyScalar(Math.max(0, 1 - 0.5 * atm.density * 0.6 * sp / 85 * dt));
      this.eVel.copy(air).add(rel);
    }
    this.ePos.addScaledVector(this.eVel, dt);
    this.jetFuel = Math.min(1, this.jetFuel + dt / 60); // suit reserve slowly recharges
    this.nearShip = near;
    // vessels: board a ramp, or get pulled onto a deck by its plating
    for (const v of this.game.vessels) {
      if (v.dead || v.body !== b || !v.interior) continue;
      if (v.pos.distanceToSquared(this.ePos) > Math.pow(v.type.radius + 30, 2)) continue;
      const local = v.bodyToLocal(this.ePos, new THREE.Vector3());
      const vLocal = this.eVel.clone().sub(v.pointVelocity(local, _v3)).applyQuaternion(_q2.copy(v.quat).invert());
      const hLocal = new THREE.Vector3(0, 0, -1).applyQuaternion(this.evaQuat).applyQuaternion(_q2.copy(v.quat).invert());
      if (v.interior.boardable(local) || v.interior.capture(local)) {
        this.enterVessel(v, local, vLocal, hLocal);
        return;
      }
      if (v.type.ramp && local.length() < 30 && v.ramp < 0.5) {
        this.prompt = { key: 'F', text: `Open ${v.name}'s ramp` };
        if (input.hit('KeyF')) this.game.toggleRamp(v);
      }
    }
    // SOI changes
    if (b.parent && r > b.soi) this.changeBody(b.parent);
    for (const c of b.children) if (this.ePos.clone().sub(c.relPos).length() < c.soi) { this.changeBody(c); break; }
    // drop back to surface physics near the ground
    const bb = this.body;
    if (bb.solid && this.ePos.length() - bb.R < 4000) {
      this.fPos.copy(this.ePos).applyQuaternion(bb.qInv);
      this.fVel.copy(this.eVel).sub(_v1.copy(bb.omega).cross(this.ePos)).applyQuaternion(bb.qInv);
      const up = this.fPos.clone().normalize();
      const fwdW = new THREE.Vector3(0, 0, -1).applyQuaternion(this.evaQuat).applyQuaternion(bb.qInv);
      this.heading.copy(fwdW).addScaledVector(up, -fwdW.dot(up));
      if (this.heading.lengthSq() < 1e-6) this.heading.set(1, 0, 0).addScaledVector(up, -up.x);
      this.heading.normalize();
      this.pitch = Math.asin(THREE.MathUtils.clamp(fwdW.dot(up), -1, 1));
      this.grounded = false;
      this.mode = 'surface';
      this.game.onModeChange && this.game.onModeChange('surface');
    }
  }

  changeBody(nb) {
    const ob = this.body;
    this.ePos.add(ob.pos).sub(nb.pos);
    this.eVel.add(ob.vel).sub(nb.vel);
    this.body = nb;
  }

  lookUpdate(up, mouse) {
    let h = this.heading.addScaledVector(up, -this.heading.dot(up));
    if (h.lengthSq() < 1e-8) {
      h.set(1, 0, 0).addScaledVector(up, -up.x);
      if (h.lengthSq() < 1e-8) h.set(0, 0, 1).addScaledVector(up, -up.z);
    }
    h.normalize();
    if (mouse.dx) {
      const a = -mouse.dx;
      const side = _v1.copy(up).cross(h);
      h.multiplyScalar(Math.cos(a)).addScaledVector(side, Math.sin(a)).normalize();
    }
    this.pitch = THREE.MathUtils.clamp(this.pitch - mouse.dy, -1.52, 1.52);
  }

  bobUpdate(dt, speed) {
    if (speed > 0.5) {
      const prev = Math.floor(this.bob / Math.PI);
      this.bob += dt * speed * 2.2;
      if (Math.floor(this.bob / Math.PI) !== prev) this.footstep++;
    } else this.bob *= 0.9;
    this.landImpact *= Math.exp(-dt * 6);
  }

  // ------------------------------------------------------------------ camera

  computeCamera(outPos, outQuat) {
    const bobY = Math.sin(this.bob * 2) * 0.035 - this.landImpact * 0.25;
    if (this.aboard) {
      const v = this.vessel;
      const local = this._camLocal || (this._camLocal = new THREE.Vector3());
      let lq;
      if (this.mode === 'seat') {
        // g-forces push the head around a little
        const s = v.type.seats[this.seat] || v.type.seats[0];
        local.set(s.eye[0], s.eye[1], s.eye[2]);
        const a = _v1.copy(v.accel).applyQuaternion(_q1.copy(v.quat).invert()).multiplyScalar(-0.004);
        if (v.landed || v.attached) a.set(0, 0, 0); // resting weight is not a lurch
        local.add(a.clampLength(0, 0.08));
        lq = _q2.setFromEuler(new THREE.Euler(this.headPitch, this.headYaw, 0, 'YXZ'));
      } else {
        local.copy(this.sPos); local.y += EYE + bobY;
        lq = lookQuat(_v4.set(0, 1, 0), this.heading, this.pitch, _q2);
      }
      outPos.copy(local).applyQuaternion(v.quat).add(v.pos).add(v.body.pos);
      outQuat.copy(v.quat).multiply(lq);
      return;
    }
    if (this.mode === 'surface') {
      const b = this.body;
      const up = _v4.copy(this.fPos).normalize();
      const eyeF = _v3.copy(this.fPos).addScaledVector(up, this.swimming ? 0.35 : EYE + bobY);
      outPos.copy(eyeF).applyQuaternion(b.q).add(b.pos);
      const lq = lookQuat(up, this.heading, this.pitch, _q2);
      outQuat.copy(b.q).multiply(lq);
      return;
    }
    const b = this.body;
    outPos.copy(this.ePos).add(b.pos);
    outQuat.copy(this.evaQuat);
  }

  // world-space position of the player's feet (for markers, map)
  worldPos(out) {
    if (this.aboard) { const v = this.vessel; return out.copy(this.sPos).applyQuaternion(v.quat).add(v.pos).add(v.body.pos); }
    if (this.mode === 'surface') return out.copy(this.fPos).applyQuaternion(this.body.q).add(this.body.pos);
    return out.copy(this.ePos).add(this.body.pos);
  }

  currentBody() { return this.aboard ? this.vessel.body : this.body; }
}
