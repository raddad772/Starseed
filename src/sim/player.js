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
import { boxesNear, insideBox, pilotSeat } from './vesselTypes.js';
import { floraOf } from './floraField.js';
import { collideEva } from './evaContacts.js';

// what a held view reads as input: nothing pressed, no axis moved
const HELD_INPUT = new Proxy({ padAxes: {} }, { get: (t, k) => (k in t ? t[k] : () => 0) });
const HELD_MOUSE = { dx: 0, dy: 0 };
const EYE = 1.68;
const RADIUS = 0.3;
const WALK = 4.2, SPRINT = 8.5, SWIM = 1.8;
const JET_ACCEL_SURF = 1.55; // multiples of local g available to the jetpack, min 6 m/s^2
const JET_TIME = 4.5;        // seconds of full burn
const JET_UNLIMITED = true;   // (testing: the jetpack never runs dry)
const EVA_ACCEL = 1.6;
const PLATING_G = 9.81;
const EVA_AGL = 4000;        // m above the ground: spacewalk physics above, on-foot falling below
// keys that move you: held across stepping out of a flying ship they count
// only once released (W down the ramp must not become a jetpack burn)
const MOVE_KEYS = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'KeyC', 'KeyQ', 'KeyE', 'ShiftLeft'];

const _v1 = new THREE.Vector3(), _v2 = new THREE.Vector3(), _v3 = new THREE.Vector3(), _v4 = new THREE.Vector3(), _v5 = new THREE.Vector3(), _v6 = new THREE.Vector3();
const _q1 = new THREE.Quaternion(), _q2 = new THREE.Quaternion();
const _m4 = new THREE.Matrix4();
const _x1 = new THREE.Vector3(), _x2 = new THREE.Vector3();
const _fl1 = new THREE.Vector3(), _fl2 = new THREE.Vector3(), _fl3 = new THREE.Vector3(), _fl4 = new THREE.Vector3();
// (the body's capsule against a box: balls of RADIUS this far up its axis from the feet, the lowest a
// little under them so it steps up onto a block)
const BOX_PROBES = [0.15, 0.6, 1.05, 1.4];
// (the highest a block's top may stand over the feet to be stepped up onto, m)
const STEP_UP = 0.55;
const _bx = new THREE.Vector3();
// how far a box (half sizes hx, hy, hz, turned by qb) reaches up along pu from its middle
function boxReach(it, qb, pu) {
  return it.hx * Math.abs(_bx.set(1, 0, 0).applyQuaternion(qb).dot(pu)) + it.hy * Math.abs(_bx.set(0, 1, 0).applyQuaternion(qb).dot(pu)) + it.hz * Math.abs(_bx.set(0, 0, 1).applyQuaternion(qb).dot(pu));
}

export function lookQuat(up, heading, pitch, out) {
  const fwd = _v1.copy(heading).multiplyScalar(Math.cos(pitch)).addScaledVector(up, Math.sin(pitch)).normalize();
  const right = _v2.copy(fwd).cross(up).normalize();
  const camUp = _v3.copy(right).cross(fwd).normalize();
  _m4.makeBasis(right, camUp, _v4.copy(fwd).negate());
  return out.setFromRotationMatrix(_m4);
}

export class Player {
  constructor(game, index = 0) {
    this.game = game;
    this.index = index;
    this.label = `Player ${index + 1}`;
    // what this player sees and handles (player state, not world state):
    // their controls, view, camera mode, target, route, screens (set by the game)
    this.input = null;
    this.ui = null;
    this.view = null;
    this.camMode = 'first';
    this.chaseQuat = new THREE.Quaternion();
    this.orbitCam = null;   // the free view's: { yaw, pitch, dist } round the craft (game.js updateCamera)
    this.target = null;
    this.route = null;
    this.deathShown = false;
    this.respawnT = 0;
    this.ownShip = null;   // their own craft (player 1: the Neptune 2, game.ship)
    this.travelIndex = 0;  // travel compression: their ship's own warp level while others hold the clock
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
  get ship() { return this.ownShip || this.game.ship; }
  get aboard() { return this.mode === 'seat' || this.mode === 'ship'; }
  // flying a craft: in its pilot seat (any other seat only rides along)
  get flying() { return this.mode === 'seat' && !!this.vessel && this.vessel.pilot === this; }

  // ------------------------------------------------------------------ frames

  // a shuttle's pose in its body's fixed frame
  shipFixedPose(outPos, outQuat, s = this.ship) {
    const b = s.body;
    outPos.copy(s.pos).applyQuaternion(b.qInv);
    outQuat.copy(b.qInv).multiply(s.quat);
  }

  // shuttles standing free on body b (anyone's: you bump into them, walk up their ramps)
  shuttlesOn(b) {
    const out = this._shuttles || (this._shuttles = []);
    out.length = 0;
    for (const v of this.game.vessels) if (v.type.key === 'shuttle' && !v.dead && v.body === b && !v.parent) out.push(v);
    return out;
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

  // the other player sitting in seat i of v, if any
  seatHolder(v, i) {
    return this.game.players.find((q) => q !== this && q.mode === 'seat' && q.vessel === v && q.seat === i) || null;
  }

  // How seat i of v is offered: its pilot seat to fly it, any other to ride
  // along, or not at all (taken). A seat holds one player; a craft has one
  // pilot seat, and only whoever sits in it has the controls.
  seatOffer(v, i, verb = 'Take the') {
    const s = v.type.seats[i] || v.type.seats[0];
    const label = s ? s.label.toLowerCase() : 'seat';
    const holder = this.seatHolder(v, i);
    if (holder) return { key: null, text: `${s ? s.label : 'Seat'} · ${holder.label}` };
    if (i === pilotSeat(v.type)) return { key: 'F', text: `${verb} ${label} · fly ${v.name}` };
    return { key: 'F', text: v.pilot && v.pilot !== this ? `${verb} ${label} · ride with ${v.pilot.label}` : `${verb} ${label} · ride along` };
  }

  // false (and a message) when the seat is taken
  sitDown(seat = null, vessel = this.vessel) {
    if (seat === null) seat = pilotSeat(vessel.type);
    const holder = this.seatHolder(vessel, seat);
    if (holder) {
      const s = vessel.type.seats[seat] || vessel.type.seats[0];
      this.game.message(`${vessel.name}: the ${s ? s.label.toLowerCase() : 'seat'} is taken · ${holder.label}`, 'caution');
      return false;
    }
    if (this.vessel && this.vessel !== vessel) this.releaseControls(this.vessel);
    this.vessel = vessel;
    this.mode = 'seat';
    this.seat = seat;
    this.headYaw = 0; this.headPitch = 0;
    // the pilot seat has the controls (P brings you back to it)
    if (seat === pilotSeat(vessel.type)) {
      vessel.pilot = this;
      this.lastSeat = { vessel, seat };
    }
    this.game.onModeChange && this.game.onModeChange('seat');
    return true;
  }

  // out of the pilot seat: nobody flies the craft until someone sits there
  releaseControls(v) {
    if (v && v.pilot === this) v.pilot = null;
  }

  standUp() {
    const v = this.vessel;
    this.releaseControls(v);
    const s = v.type.seats[this.seat] || v.type.seats[0];
    this.mode = 'ship';
    this.sPos.set(s.stand[0], s.stand[1], s.stand[2]);
    this.sVel.set(0, 0, 0);
    this.heading.set(s.heading[0], 0, s.heading[2]).normalize();
    this.pitch = -0.1;
    this._room = null;
    this.game.onModeChange && this.game.onModeChange('ship');
  }

  // out of a craft you only sit in: back through its hatch into the ship
  // carrying it, or out beside it once it has launched
  leaveCraft() {
    const v = this.vessel;
    this.releaseControls(v);
    v.boardingT = 1.6; // (a canopy lifts)
    if (v.parent && v.attached && v.home) {
      const host = v.parent, h = v.home;
      this.fade = 1;
      this.placeAboard(host, new THREE.Vector3(h.hatch[0] - Math.sign(h.hatch[0]) * 1.2, h.hatch[1], h.hatch[2] + (h.hatch[0] ? 0 : 1.6)), new THREE.Vector3(Math.sign(h.hatch[0]) || 0, 0, h.hatch[0] ? 0 : -1));
      this.game.onModeChange && this.game.onModeChange('ship');
      return;
    }
    const s = v.type.seats[0];
    this.mode = 'ship';
    this.sPos.set(s.stand[0], s.stand[1], s.stand[2]);
    this.sVel.set(0, 0, 0);
    this.heading.set(s.heading[0], 0, s.heading[2]).normalize();
    this.exitVessel();
  }

  // back to the last pilot seat from anywhere
  recallSeat() {
    const ls = this.lastSeat;
    if (!ls || ls.vessel.dead) { this.game.message('No pilot seat to return to', 'caution'); return; }
    if (this.mode === 'seat' && this.vessel === ls.vessel) return;
    if (!this.sitDown(ls.seat, ls.vessel)) return;
    this.fade = 1;
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
    // (a held view: the opening's shot, your look and your jets idle until it lets go)
    if (this.heldView) { this.evaQuat.copy(this.heldView); input = HELD_INPUT; mouse = HELD_MOUSE; }
    if (this.moveLatch) {
      const held = MOVE_KEYS.some((k) => input.down(k)) || Object.values(input.padAxes || {}).some((a) => Math.abs(a) > 0.2);
      if (held) input = this.latchedInput(input);
      else this.moveLatch = false;
    }
    this.fade = Math.max(0, this.fade - dt * 1.6);
    // the walking / EVA updates light it while thrusting; a seat never does
    // (it used to stay lit after boarding or a P recall mid-burn: a
    // continuous jet hiss for the rest of the flight)
    this.jetOn = false;
    const wasSeated = this.mode === 'seat';
    if (this.mode === 'seat') this.updateSeat(dt, input, mouse);
    else if (this.mode === 'ship') this.updateShip(dt, input, mouse);
    else if (this.mode === 'surface') this.updateSurface(dt, input, mouse);
    else this.updateEva(dt, input, mouse);
    // on foot: an item you look at, else a vehicle or a door by you (not in
    // the frame you got out of a seat: the same F would put you straight back)
    if (!wasSeated && this.mode !== 'seat' && !this.prompt && this.game.items) {
      if (!this.game.itemInteract(this, input)) this.game.craftInteract(this, input);
    }
    if (this.grounded && this.mode !== 'seat') this.jetFuel = Math.min(1, this.jetFuel + dt / 2.5);
  }

  // input with the movement keys and stick released (see moveLatch)
  latchedInput(input) {
    return {
      axis: () => 0,
      down: (c) => !MOVE_KEYS.includes(c) && input.down(c),
      hit: (c) => c !== 'Space' && input.hit(c),
      get buttons() { return input.buttons; },
    };
  }

  // height of a body-centred point over the ground under it
  heightOverGround(b, p) {
    return p.length() - b.R - Math.max(0, b.groundHeight(_v4.copy(p).applyQuaternion(b.qInv).normalize()));
  }

  updateSeat(dt, input, mouse) {
    // (a passenger looks around freely: the stick is the pilot seat's)
    const freeLook = input.buttons & 2 || input.down('AltLeft') || this.vessel.pilot !== this;
    if (freeLook) {
      this.headYaw = THREE.MathUtils.clamp(this.headYaw - mouse.dx, -1.9, 1.9);
      this.headPitch = THREE.MathUtils.clamp(this.headPitch - mouse.dy, -1.0, 1.2);
    } else {
      const k = Math.min(1, dt * 4);
      this.headYaw -= this.headYaw * k; this.headPitch -= this.headPitch * k;
    }
    this.body = this.vessel.body;
    // (out of a seat into the cabin, or out of a craft with nothing to walk in)
    if (input.hit('KeyF')) { if (this.vessel.type.seatOnly && !this.vessel.type.rooms) this.leaveCraft(); else this.standUp(); }
  }

  // Walking aboard a vessel (its local frame, plating gravity along -Y)
  updateShip(dt, input, mouse) {
    const v = this.vessel;
    const I = v.interior;
    this.body = v.body;
    if(v.frameState && v.frameState.phase!=='open'){this.sVel.set(0,0,0);this.env.pressure=v.frameState.pressure;this.prompt={key:null,text:'Turnover airlock · '+v.frameState.phase};return;}
    if (I.carry) I.carry(this); // (riding a turbolift car: it moved since we looked)
    const felt = v.type.interiorGravity === 'natural' ? v.feltGravity(new THREE.Vector3()) : null;
    if (felt && !(felt.y < -.3 && Math.hypot(felt.x, felt.z) < -felt.y * .3)) { this.updateFreefall(dt, input, mouse, felt); return; }
    const cabinG = felt ? -felt.y : PLATING_G;
    const up = _v4.set(0, 1, 0);
    this.lookUpdate(up, mouse);
    const fwd = this.heading.clone(), right = fwd.clone().cross(up).normalize();
    const wish = new THREE.Vector3().addScaledVector(fwd, input.axis('KeyS', 'KeyW')).addScaledVector(right, input.axis('KeyA', 'KeyD'));
    if (wish.lengthSq() > 0) wish.normalize().multiplyScalar(input.down('ShiftLeft') ? SPRINT * I.sprint : WALK);
    const vac = I.vacuumAt(this.sPos);
    this.env.gravity = cabinG;
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
      this.sVel.y -= cabinG * dt;
    }
    // jetpack: hold Space once off the floor (a hangar is 70 m tall)
    this.jetOn = false;
    if (input.down('Space') && !this.grounded && this.jetFuel > 0) {
      const a = Math.max(6, cabinG * JET_ACCEL_SURF);
      this.sVel.y += a * dt;
      if (wish.lengthSq() > 0) this.sVel.addScaledVector(_v1.copy(wish).normalize(), a * 0.6 * dt);
      if (!JET_UNLIMITED) this.jetFuel = Math.max(0, this.jetFuel - dt / JET_TIME);
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
    // an item you look at comes before the seat or lift you stand by
    if (!(this.game.items && this.game.itemInteract(this, input))) I.interact(this, input);
  }

  // Pioneer pressure cabins: no floor adhesion in orbit. Suit jets add momentum;
  // X deliberately brakes. Proper acceleration pushes loose occupants during burns.
  updateFreefall(dt, input, mouse, felt) {
    const v = this.vessel, I = v.interior, up = new THREE.Vector3(0, 1, 0);
    this.lookUpdate(up, mouse); this.grounded = false;
    const fwd = this.heading.clone().multiplyScalar(Math.cos(this.pitch)).addScaledVector(up, Math.sin(this.pitch));
    const right = this.heading.clone().cross(up).normalize();
    const thrust = fwd.multiplyScalar(input.axis('KeyS','KeyW')).addScaledVector(right, input.axis('KeyA','KeyD'));
    thrust.y += input.axis('KeyC','Space') - (input.down('ControlLeft') ? 1 : 0);
    if (thrust.lengthSq() > 1) thrust.normalize();
    if (input.down('KeyX')) thrust.copy(this.sVel).multiplyScalar(-2).clampLength(0, 1);
    this.jetOn = thrust.lengthSq() > .001 && this.jetFuel > 0;
    this.sVel.addScaledVector(felt, dt);
    if (this.jetOn) { this.sVel.addScaledVector(thrust, EVA_ACCEL * dt); if (!JET_UNLIMITED) this.jetFuel = Math.max(0, this.jetFuel - dt / JET_TIME); }
    const steps = Math.max(1, Math.ceil(this.sVel.length() * dt / .2));
    for (let i = 0; i < steps; i++) {
      const prevY = this.sPos.y; this.sPos.addScaledVector(this.sVel, dt / steps);
      const floor = I.floorAt(this.sPos.x, this.sPos.z, Math.max(prevY, this.sPos.y));
      if (floor !== null && this.sPos.y < floor) { this.sPos.y = floor; this.sVel.y = Math.max(0, this.sVel.y); }
      I.ceilingClamp(this);
      if (I.confine(this) === 'exit') { this.exitVessel(); return; }
    }
    this.env.gravity = felt.length(); this.env.pressure = I.pressureAt ? I.pressureAt(this.sPos) : (I.vacuumAt(this.sPos) ? 0 : 1);
    this.env.temperature = this.env.pressure < .1 ? 3 : 293;
    this.bob = 0;
    if (!(this.game.items && this.game.itemInteract(this, input))) I.interact(this, input);
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
      for (const bx of boxesNear(c.interior.hullBoxes, cc.x, cc.z, RADIUS)) {
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

  // Walked (or climbed) out of a vessel: into the first host up the chain
  // with floor there (out of a cart in a bay: the bay), otherwise onto the
  // planet or into space. Out of something inside a container, you climb
  // out past it through its door.
  exitVessel() {
    const v = this.vessel;
    // body-centred inertial state of the point stepped out to
    const b = v.body;
    const pW = _v1.copy(this.sPos).applyQuaternion(v.quat).add(v.pos);
    const vLocal = _v2.copy(v.angVel).cross(this.sPos).add(this.sVel);
    const vW = _v3.copy(vLocal).applyQuaternion(v.quat).add(v.vel);
    const headW = this.heading.clone().applyQuaternion(v.quat);
    for (let h = v.parent; h; h = h.parent) {
      const local = h.bodyToLocal(pW, _x1);
      if (h.interior && h.interior.roomAt(local, 1.0)) {
        const qi = _q2.copy(h.quat).invert();
        const lv = vW.clone().sub(h.pointVelocity(local, _x2)).applyQuaternion(qi);
        this.enterVessel(h, local.clone(), lv, headW.clone().applyQuaternion(qi));
        return;
      }
      if (h.type.egress && (h.type.zones || []).some((z) => insideBox(z, local, 0.5))) {
        h.localToBody(_x1.fromArray(h.type.egress), pW);
        h.pointVelocity(_x1, vW);
        continue;
      }
    }
    this.body = b;
    this.vessel = null;
    // out of a ship in flight: what you were holding to walk out moves nothing yet
    if (!v.landed) this.moveLatch = true;
    if (b.solid && this.heightOverGround(b, pW) < EVA_AGL) {
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

  // the ground under body-fixed point p (m above datum): in the near field the volume's floor
  // under it (gen/volume.js: a cave's floor, a ledge, the foot of an overhang), else the
  // heightfield's
  groundAt(b, p) { return b.floorAt(p); }

  groundNormalAt(b, up, gh, out) {
    const ng = b.near, p = _v5.copy(up).multiplyScalar(b.R + gh - 0.05);
    if (ng && ng.within(p)) {
      ng.densityAt(p, out);
      out.negate();
      if (out.lengthSq() > 1e-12) { out.normalize(); if (out.dot(up) > -0.2) return out; }
    }
    return b.groundNormal(up, out, gh);
  }

  // out of the volume's rock: walls push the body back (sideways), a roof stops a jump
  pushOutOfRock(b, up) {
    const ng = b.near;
    if (!ng || !ng.within(this.fPos)) return;
    const g = _v5, q = _v6;
    for (const h of [0.5, 1.25]) {
      q.copy(this.fPos).addScaledVector(up, h);
      const d = ng.densityAt(q, g);
      const gl = g.length();
      if (gl < 1e-6) continue;
      const pen = (d + 0.35 * gl) / gl;          // (0.35 m: the body's radius)
      if (pen <= 0) continue;
      g.addScaledVector(up, -g.dot(up));          // sideways only (the floor holds the feet)
      const hl = g.length();
      if (hl < 1e-6) continue;
      g.divideScalar(hl);
      this.fPos.addScaledVector(g, -Math.min(pen, 0.5));
      const into = this.fVel.dot(g);
      if (into > 0) this.fVel.addScaledVector(g, -into);
    }
    q.copy(this.fPos).addScaledVector(up, 1.8);
    if (ng.densityAt(q) > 0 && this.fVel.dot(up) > 0) this.fVel.addScaledVector(up, -this.fVel.dot(up));
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
    const gh = this.groundAt(b, this.fPos);
    // (water: the sea, a lake or a river; afloat where it's deeper than you wade)
    const water = b.data.terrain.liquid === 'water' && b.isWaterAt(up);
    const groundR = b.R + gh;
    this.swimming = water && r < groundR + 0.6 && b.liquidDepthAt(up) > 1.1;
    let speed = input.down('ShiftLeft') ? SPRINT : WALK;
    if (this.swimming) speed = SWIM;
    if (mv.lengthSq() > 0) mv.normalize().multiplyScalar(speed);
    const vn = this.fVel.dot(up);
    const vt = this.fVel.clone().addScaledVector(up, -vn);
    if (this.grounded) {
      // traction: slopes steeper than ~45 degrees shed you
      const n = this.groundNormalAt(b, up, gh, _v2);
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
      // air control (steering a jump against the air: only with input, and
      // none in a vacuum, where the jetpack is all you have) + gravity + jetpack
      const grip = Math.min(1, atm.density / 0.5);
      if (mv.lengthSq() > 0 && grip > 0) {
        const ac = mv.clone().sub(vt).multiplyScalar(0.6 * grip);
        if (ac.length() > 3) ac.setLength(3);
        this.fVel.addScaledVector(ac, dt);
      }
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
      if (!JET_UNLIMITED) this.jetFuel = Math.max(0, this.jetFuel - dt / JET_TIME);
      this.jetOn = true;
    }
    this.fPos.addScaledVector(this.fVel, dt);
    // ground collision
    const up2 = _v1.copy(this.fPos).normalize();
    const gh2 = this.groundAt(b, this.fPos);
    // (afloat: 1.3 m down in the water, or on the bed of a shallow stream)
    const wd2 = water ? b.liquidDepthAt(up2) : 0;
    const floorR = b.R + gh2 - (wd2 > 0.3 ? Math.min(1.3, wd2) : 0);
    const rr = this.fPos.length();
    if (rr <= floorR + 0.001 || (this.grounded && rr - floorR < 0.45 && this.fVel.dot(up2) <= 0.5)) {
      const impact = -this.fVel.dot(up2);
      if (!this.grounded && impact > 6) this.landImpact = Math.min(1, impact / 20);
      this.fPos.copy(up2).multiplyScalar(floorR);
      const vn2 = this.fVel.dot(up2);
      if (vn2 < 0) this.fVel.addScaledVector(up2, -vn2);
      this.grounded = true;
    } else if (rr > floorR + 0.5) this.grounded = false;
    this.pushOutOfRock(b, up2);
    this.rampSupport();
    this.collideShipExterior();
    this.collideFlora(b);
    this.bobUpdate(dt, this.grounded ? this.fVel.length() : 0);
    if (this.boardByRamp(b)) return;
    // boarding a shuttle (yours or anyone's): inside its ramp / bay volume
    let byRamp = false;
    for (const sh of this.shuttlesOn(b)) {
      const sp = new THREE.Vector3(), sq = new THREE.Quaternion();
      this.shipFixedPose(sp, sq, sh);
      const local = this.fPos.clone().sub(sp).applyQuaternion(sq.clone().invert());
      if (sh.interior.boardable(local)) {
        // velocity relative to the ship (it may be flying), in its axes
        const shipF = sh.vel.clone().sub(_v2.copy(b.omega).cross(sh.pos)).applyQuaternion(b.qInv);
        const vLocal = this.fVel.clone().sub(shipF).applyQuaternion(sq.clone().invert());
        const hLocal = this.heading.clone().applyQuaternion(sq.clone().invert());
        this.enterVessel(sh, local, vLocal, hLocal);
        return;
      }
      if (local.length() < 16 && !byRamp) {
        byRamp = true;
        if (sh.ramp < 0.5) this.prompt = { key: 'F', text: sh === this.ship ? 'Lower the ramp' : `Lower ${sh.name}'s ramp` };
        if (input.hit('KeyF')) this.game.toggleRamp(sh);
      }
    }
    // your own ship, far off: summon it
    const ship = this.ship;
    if (!byRamp && ship && !ship.dead) {
      const far = !this.homeShipHere(b) || ship.pos.distanceTo(_v1.copy(this.fPos).applyQuaternion(b.q)) > 250;
      if (this.homeShipHere(b) && far && ship.landed) this.prompt = this.prompt || { key: 'B', text: 'Summon ship' };
      if (input.hit('KeyB') && (!this.homeShipHere(b) || (far && ship.landed))) this.game.summonShip();
    }
    // leave the surface regime when high up (switch to inertial EVA physics)
    if (this.fPos.length() - b.R - Math.max(0, gh2) > EVA_AGL + 2000) this.toEva(); // (hysteresis against the switch back)
  }

  // Tree trunks and boulders (the world's flora field): walk round a trunk,
  // climb onto a boulder. The body is a 0.3 m upright capsule, 1.7 m tall.
  collideFlora(b) {
    const field = floraOf(b);
    if (!field || !field.active) return;
    const p = this.fPos;
    if (!this._fl || this._flBody !== b || this._flAt.distanceToSquared(p) > 4) {
      this._fl = field.near(p, 4, this._fl || []);
      this._flAt = (this._flAt || new THREE.Vector3()).copy(p);
      this._flBody = b;
    }
    for (const it of this._fl) {
      if (it.kind === 'tree') {
        const up = _fl1.set(it.ux, it.uy, it.uz);
        const d = _fl2.set(p.x - it.x, p.y - it.y, p.z - it.z);
        const along = d.dot(up);
        if (along < -1.7 || along > it.h) continue;
        d.addScaledVector(up, -along); // off the trunk's axis
        const dist = d.length(), min = it.r + RADIUS;
        if (dist >= min || dist < 1e-6) continue;
        d.divideScalar(dist);
        p.addScaledVector(d, min - dist);
        const vn = this.fVel.dot(d);
        if (vn < 0) this.fVel.addScaledVector(d, -vn);
      } else if (it.kind === 'box') {
        // (a pressure ridge's block, an oriented box: the body's capsule as four balls up its axis, each
        // against the box's nearest point to it; the deepest pushed out. Inside it: out by its shallowest
        // face)
        const pu = _fl1.copy(p).normalize(), qi = it._qi || (it._qi = new THREE.Quaternion(it.q[0], it.q[1], it.q[2], it.q[3]).invert());
        const qb = it._qb || (it._qb = new THREE.Quaternion(it.q[0], it.q[1], it.q[2], it.q[3]));
        let best = 0;
        const n = _fl4;
        for (const t of BOX_PROBES) {
          const s = _fl2.copy(p).addScaledVector(pu, t);
          s.x -= it.x; s.y -= it.y; s.z -= it.z;
          s.applyQuaternion(qi);
          const cx = Math.max(-it.hx, Math.min(it.hx, s.x)), cy = Math.max(-it.hy, Math.min(it.hy, s.y)), cz = Math.max(-it.hz, Math.min(it.hz, s.z));
          const dx = s.x - cx, dy = s.y - cy, dz = s.z - cz, dist = Math.hypot(dx, dy, dz);
          let pen;
          if (dist > 1e-6) { pen = RADIUS - dist; if (pen > best) { best = pen; n.set(dx / dist, dy / dist, dz / dist).applyQuaternion(qb); } }
          else {
            const fx = it.hx - Math.abs(s.x), fy = it.hy - Math.abs(s.y), fz = it.hz - Math.abs(s.z);
            pen = RADIUS + Math.min(fx, fy, fz);
            if (pen > best) { best = pen; (fx <= fy && fx <= fz ? n.set(Math.sign(s.x) || 1, 0, 0) : fy <= fz ? n.set(0, Math.sign(s.y) || 1, 0) : n.set(0, 0, Math.sign(s.z) || 1)).applyQuaternion(qb); }
          }
        }
        if (best <= 0) continue;
        // (a block whose top's within a step of the feet: stepped up onto, as you scramble over a ridge
        // block by block; a taller one stops you)
        const lift = Math.hypot(it.x, it.y, it.z) + boxReach(it, qb, pu) - p.length();
        if (lift > 0 && lift < STEP_UP) {
          p.addScaledVector(pu, lift);
          const vd = this.fVel.dot(pu);
          if (vd < 0) this.fVel.addScaledVector(pu, -vd);
          this.grounded = true;
          continue;
        }
        p.addScaledVector(n, best);
        const vn = this.fVel.dot(n);
        if (vn < 0) this.fVel.addScaledVector(n, -vn);
        if (n.dot(pu) > 0.6) this.grounded = true; // (stood on it)
      } else {
        const pu = _fl1.copy(p).normalize();
        const c = _fl2.set(it.x, it.y, it.z);
        const t = THREE.MathUtils.clamp(_fl3.copy(c).sub(p).dot(pu), 0, 1.7);
        const d = _fl4.copy(p).addScaledVector(pu, t).sub(c);
        const dist = d.length(), min = it.r + RADIUS;
        if (dist >= min || dist < 1e-6) continue;
        d.divideScalar(dist);
        p.addScaledVector(d, min - dist);
        const vn = this.fVel.dot(d);
        if (vn < 0) this.fVel.addScaledVector(d, -vn);
        if (d.dot(pu) > 0.6) this.grounded = true; // (stood on it)
      }
    }
  }

  // Up the lowered ramp of any craft standing here (a dropship, a container):
  // aboard it, in its own frame
  boardByRamp(b) {
    for (const v of this.game.vessels) {
      if (v.dead || v.big || v.parent || v.body !== b || v.type.key === 'shuttle' || !v.interior || !(v.interior.ramps && v.interior.ramps.length)) continue;
      const sp = _fl1.copy(v.pos).applyQuaternion(b.qInv);
      if (sp.distanceToSquared(this.fPos) > Math.pow(v.type.radius + 10, 2)) continue;
      const qi = _q1.copy(b.qInv).multiply(v.quat).invert();
      const local = _fl2.copy(this.fPos).sub(sp).applyQuaternion(qi);
      if (!v.interior.boardable(local)) continue;
      // (velocities: the craft's over the turning ground, then ours relative to it)
      const vF = _fl3.copy(v.vel).sub(_fl4.copy(b.omega).cross(v.pos)).applyQuaternion(b.qInv);
      const vLocal = this.fVel.clone().sub(vF).applyQuaternion(qi);
      this.enterVessel(v, local.clone(), vLocal, this.heading.clone().applyQuaternion(qi));
      return true;
    }
    return false;
  }

  // A lowered shuttle ramp is walkable ground: stand on it when inside its footprint
  rampSupport() {
    for (const ship of this.shuttlesOn(this.body)) this.rampSupportOf(ship);
  }

  rampSupportOf(ship) {
    // (a parked ship only: a flying one's ramp moves under you, and holding
    // you on it here would cancel your fall the moment you jump)
    if (!ship.landed || ship.ramp < 0.85) return;
    const I = SHIP_INTERIOR;
    const sp = _v2, sq = _q1;
    this.shipFixedPose(sp, sq, ship);
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

  // parked shuttles' hulls (anyone's) are solid
  collideShipExterior() {
    for (const ship of this.shuttlesOn(this.body)) if (ship.landed) this.collideShuttle(ship);
  }

  collideShuttle(ship) {
    const sp = _v2, sq = _q1;
    this.shipFixedPose(sp, sq, ship);
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
      if (!JET_UNLIMITED) this.jetFuel = Math.max(0, this.jetFuel - dt / (JET_TIME * 6));
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
    collideEva(this, dt);
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
    const relief = bb.relief * 1.6;
    if (bb.solid && this.ePos.length() - bb.R < relief + EVA_AGL && this.heightOverGround(bb, this.ePos) < EVA_AGL) {
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
      // (afloat: your eyes just above the water, 1.3 m above where you float)
      const eyeF = _v3.copy(this.fPos).addScaledVector(up, this.swimming ? 1.5 : EYE + bobY);
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
