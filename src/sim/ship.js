// Spacecraft flight dynamics, for every vessel from the shuttle to the carriers.
//
// Coordinate spaces. A vessel's state always exists in the inertial frame of
// its dominant body (patched conics): position/velocity relative to its
// centre, orientation quaternion, body-frame angular velocity. A vessel can
// also live inside a bigger vessel's coordinate space (a docking-pad zone or
// a hangar): it then has a parent and a local state (lpos/lvel/lquat/lang in
// parent coordinates) and its body-frame state is derived from the parent's
// every step, so it rides along wherever the parent goes (rails, time warp,
// FTL). Inside a parent the physics runs in the parent's frame under its
// artificial gravity, unaffected by the parent's own motion, the same way a
// person walks around inside a ship. Docked = rigidly attached in that space.
//
// Forces in free flight: point-mass gravity, thrusters (main drive, retro,
// VTOL belly jets, lateral/down RCS), anisotropic aero drag + wing lift +
// weathervane torque relative to the co-rotating atmosphere (plus zonal winds
// on giants), landing-leg spring-dampers with Coulomb friction against the
// moving ground, stiff hull probes for crashes, and the same contacts against
// big ships' hull colliders.
//
// Flight assist:
//   OFF   pure Newtonian; inputs are raw thrust and torque
//   ROT   rotation damping; inputs command angular rates
//   FULL  ROT + velocity hold: inputs adjust a target velocity in the local
//         frame (surface-fixed inside the atmosphere, body-inertial outside,
//         matched to a nearby big ship, or the host ship's deck frame);
//         with no input the computer hovers / holds course using only the
//         thrust the engines really have (heavy worlds can still win).
// Coasting outside the atmosphere is propagated analytically ("on rails"),
// so orbits never drift and high time warp is exact.
//
// Volumes nest: a craft inside a bay, a cart inside a container inside that
// bay. Any vessel with zones can host. A zone with a number for gravity has
// plating; one with gravity 'host' (a container) has whatever its host feels
// (the bay's plating, the planet's pull on the ground, nothing in free fall,
// a shove when the lifter carrying it accelerates). Craft in the same frame
// collide with each other's colliders (siblings in a bay, free craft on the
// same body). Ground vehicles stand on their legs too: wheels (tyre grip
// across, drive and brakes along, front pair steered) or hover pads (soft
// long springs, thrust to move); see groundControl and wheelForce.

import * as THREE from 'three';
import { applyPropulsion, thrustAvailability, thrustAccelerationAlong } from './propulsion.js';
import { flightHandling } from './flightHandling.js';
import { initAirlocks, updateAirlocks } from './airlocks.js';
import { propagate, orbitInfo } from '../core/kepler.js';
import { SHUTTLE, boxPenetration, boxesNear, deckBelow, insideBox } from './vesselTypes.js';
import { floraOf } from './floraField.js';
import { entryTier, entryGeometry, gasProperties, stagnationHeat, heatSafeSpeed, integrateHullTemperature } from './reentry.js';
import { windAt } from './wind.js';

const G0 = 9.81;
export const ASSIST_NAMES = ['OFF', 'ROT', 'FULL'];

const _v1 = new THREE.Vector3(), _v2 = new THREE.Vector3(), _v3 = new THREE.Vector3(), _v4 = new THREE.Vector3();
const _q1 = new THREE.Quaternion(), _q2 = new THREE.Quaternion();
const _gn = new THREE.Vector3();
const _att = new THREE.Vector3();
const _nose = new THREE.Vector3();
const _sa1 = new THREE.Vector3(), _sa2 = new THREE.Vector3(), _vs = new THREE.Vector3();
const _f1 = new THREE.Vector3(), _f2 = new THREE.Vector3(), _fq = new THREE.Quaternion(), _fq2 = new THREE.Quaternion();
const _c1 = new THREE.Vector3(), _c2 = new THREE.Vector3(), _c3 = new THREE.Vector3(), _c4 = new THREE.Vector3(), _cn = new THREE.Vector3();
const _grav = new THREE.Vector3();
const _m4 = new THREE.Matrix4();
const _gl = new THREE.Vector3(), _fgq = new THREE.Quaternion(), _fq3 = new THREE.Quaternion();
const _w1 = new THREE.Vector3(), _w2 = new THREE.Vector3(), _Y = new THREE.Vector3(0, 1, 0);
const _t1 = new THREE.Vector3(), _t2 = new THREE.Vector3(), _t3 = new THREE.Vector3(), _t4 = new THREE.Vector3(), _t5 = new THREE.Vector3(), _tq = new THREE.Quaternion();
const AHEAD_N = 12; // terrain samples along the ground track

export class Ship {
  constructor(game, type = SHUTTLE, name = 'Wayfarer') {
    this.game = game;
    this.u = game.universe;
    this.type = type;
    this.name = name;
    this.big = !!type.big;
    this.mass = type.mass;
    this.I = new THREE.Vector3(...type.I);
    const w = G0 * this.mass;
    this.limits = {
      main: type.thrust.main * w, retro: type.thrust.retro * w,
      belly: type.thrust.belly * w, down: type.thrust.down * w, lateral: type.thrust.lateral * w,
      alpha: new THREE.Vector3(...type.alpha), // max angular accel (rad/s^2) about x (pitch), y (yaw), z (roll)
      rate: new THREE.Vector3(...type.rate),   // ROT/FULL commanded rate limits
    };
    this.body = null;
    this.pos = new THREE.Vector3();
    this.vel = new THREE.Vector3();
    this.quat = new THREE.Quaternion();
    this.angVel = new THREE.Vector3();
    this.landed = false;
    this.landedPosF = new THREE.Vector3();
    this.landedQuatF = new THREE.Quaternion();
    this.rails = false;
    this.railR0 = [0, 0, 0]; this.railV0 = [0, 0, 0]; this.railT0 = 0;
    // coordinate-space hierarchy
    this.parent = null;      // host vessel whose space we are in
    this.zone = null;        // the host zone (pad / hangar)
    this.attached = false;   // docked: rigid in the host's space
    this.children = [];
    this.lpos = new THREE.Vector3(); this.lvel = new THREE.Vector3();
    this.lquat = new THREE.Quaternion(); this.lang = new THREE.Vector3();
    this.refVessel = null;   // FULL assist matches this big ship's motion
    this.accelW = new THREE.Vector3(); // inertial acceleration incl. gravity (body axes)
    this.assist = 2;
    this.gearTarget = type.legs ? 1 : 0; this.gear = this.gearTarget;
    this.rampTarget = 0; this.ramp = 0;
    this.hull = 1;
    this.hullTemp = 290;
    this.heatGlow = 0;
    this.heatFlux = 0;
    this.entryProfile = entryTier(type);
    this.handling = flightHandling(type);
    this.entry = { ...entryGeometry(type,{x:0,y:0,z:-1}), direction:new THREE.Vector3(0,0,-1), heatLoad:0 };
    this._thermalT = game.t || 0;
    this.dead = false;
    this.deathCause = '';
    this.thrustLocal = new THREE.Vector3();   // applied thrust (N), ship-local
    this.ctrl = { fwd: 0, strafe: 0, lift: 0, pitch: 0, yaw: 0, roll: 0, boost: false, precision: false, brake: false };
    this.stick = new THREE.Vector2();
    this.targetVel = new THREE.Vector3(); // FULL assist target (world axes, reference frame)
    this.targetFrame = 'surface';
    this.cruise = 0; this.slip = 0; this.climb = 0; // FULL assist (surface / deck frame)
    this.legState = [0, 0, 0, 0];
    this.legComp = [0, 0, 0, 0];
    this.groundContact = false;
    this.idleTime = 0;
    this.agl = Infinity;
    this.env = { pressure: 0, density: 0, temperature: 3, airspeed: 0, mach: 0, dynPressure: 0, wind: new THREE.Vector3() };
    this.accel = new THREE.Vector3();      // proper acceleration felt aboard (body axes)
    this.lastImpact = 0;
    this.pilot = null; // the player at the controls (world state: one at a time)
    this.legAttach = null;
    this.legLength = type.legLength || 0;
    this.ftl = null; // set by the game
    // Autopilot command (nav computer), refreshed every frame while engaged:
    //   vel   commanded velocity, body-centred inertial (free flight)
    //   nose / up   wanted attitude, inertial axes
    //   lvel / lnose / lup   the same in a host's deck frame (pads, hangars)
    //   move  lift off the legs / undock;  land  touch down when legs meet ground
    this.auto = null;
    this.hullRating = type.hullRating;
    // contact springs (legs: landing legs, wheels or hover pads; probes: the hull)
    this.legK = type.legK || 6.0e5; this.legC = type.legC || 1.3e5;
    this.probeK = type.probeK || 5e6; this.probeC = type.probeC || 9e5;
    this.effMass = this.mass; // with what it carries attached (summed by the game each frame)
    // world state: its doors (0 shut .. 1 open), what its clamp holds
    this.doors = {};
    for (const d of type.doors || []) this.doors[d.id] = { open: 0, target: 0 };
    for (const d of type.slideDoors || []) this.doors[d.id] = { open: 0, target: 0, hold: 0 };
    initAirlocks(this);
    this.cargo = null;
    this.drive = { throttle: 0, steer: 0, brake: 0 }; // a ground vehicle's wheels
    this._axQ = this.quat; // this vessel's axes in the frame of the contact pass running
  }

  // someone is at the controls (setting false lets go of them)
  get pilotPresent() { return !!this.pilot; }
  set pilotPresent(on) { if (!on) this.pilot = null; }

  get worldPos() { return _v4.copy(this.pos).add(this.body.pos); }
  getWorldPos(out) { return out.copy(this.pos).add(this.body.pos); }
  getWorldVel(out) { return out.copy(this.vel).add(this.body.vel); }
  get altitude() { return this.pos.length() - this.body.R; }
  get depth() { return this.parent ? this.parent.depth + 1 : 0; }
  get root() { return this.parent ? this.parent.root : this; }
  get docked() { return !!this.parent && this.attached; }

  setLegAttach(legs) {
    this.legAttach = legs.map((l) => l.attach.clone());
  }

  // ------------------------------------------------------------------ frames

  // body-frame point of a vessel-local point
  localToBody(local, out) { return out.copy(local).applyQuaternion(this.quat).add(this.pos); }
  bodyToLocal(p, out) { return out.copy(p).sub(this.pos).applyQuaternion(_fq.copy(this.quat).invert()); }
  // world-frame point of a vessel-local point
  localToWorld(local, out) { return this.localToBody(local, out).add(this.body.pos); }
  worldToLocal(w, out) { return out.copy(w).sub(this.body.pos).sub(this.pos).applyQuaternion(_fq.copy(this.quat).invert()); }
  // velocity of a vessel-local point (world axes, relative to the body)
  pointVelocity(local, out) {
    return out.copy(this.angVel).cross(local).applyQuaternion(this.quat).add(this.vel);
  }

  // Derive the body-frame state from the host's state and ours inside it
  syncFromParent() {
    const p = this.parent;
    if (this.body !== p.body) this.body = p.body;
    this.pos.copy(this.lpos).applyQuaternion(p.quat).add(p.pos);
    this.quat.copy(p.quat).multiply(this.lquat);
    _f1.copy(p.angVel).cross(this.lpos).add(this.lvel).applyQuaternion(p.quat);
    this.vel.copy(p.vel).add(_f1);
    this.angVel.copy(p.angVel).applyQuaternion(_fq.copy(this.lquat).invert()).add(this.lang);
    this.landed = false;
    this.rails = false;
  }

  // Move into a host's coordinate space (state carried over exactly)
  enterParent(p, zone) {
    if (this.body !== p.body) this.changeBody(p.body);
    const qi = _fq.copy(p.quat).invert();
    this.lpos.copy(this.pos).sub(p.pos).applyQuaternion(qi);
    this.lvel.copy(this.vel).sub(p.vel).applyQuaternion(qi).sub(_f1.copy(p.angVel).cross(this.lpos));
    this.lquat.copy(qi).multiply(this.quat);
    this.lang.copy(this.angVel).sub(_f2.copy(p.angVel).applyQuaternion(_fq2.copy(this.lquat).invert()));
    this.parent = p; this.zone = zone; this.attached = false;
    this.rails = false; this.landed = false; this.refVessel = null;
    if (!p.children.includes(this)) p.children.push(this);
    this.targetFrame = 'none';
    this.idleTime = 0;
  }

  leaveParent() {
    const p = this.parent;
    if (!p) return;
    this.syncFromParent();
    const i = p.children.indexOf(this);
    if (i >= 0) p.children.splice(i, 1);
    this.parent = null; this.zone = null; this.attached = false;
    this.targetFrame = 'none';
  }

  // Dock rigidly at a pose in the host's space (placement, not physics)
  dockAt(p, zone, lpos, lquat) {
    if (this.parent && this.parent !== p) this.leaveParent();
    if (this.landed) this.landed = false;
    this.parent = p; this.zone = zone;
    if (!p.children.includes(this)) p.children.push(this);
    this.lpos.copy(lpos); this.lquat.copy(lquat);
    this.lvel.set(0, 0, 0); this.lang.set(0, 0, 0);
    this.attached = true;
    this.gear = this.gearTarget = this.type.legs ? 1 : 0;
    this.syncFromParent();
  }

  insideZone(zone, margin = 0) { return insideBox(zone, this.lpos, margin); }

  // its colliders as they stand, doors swung to their state: as seen from
  // outside it, or (inner) by what is inside its volumes, where it has a set
  // of its own (a container's hold: thick walls, see CRATE)
  colliders(inner = false) {
    const t = this.type;
    const base = (inner && t.inner) || t.colliders || [];
    if (!t.doors) return base;
    const key = inner && t.inner ? '_colsIn' : '_cols';
    const slabs = t.doors.filter((d) => d.min); // (a canopy is part of the hull)
    const out = this[key] || (this[key] = [...base, ...slabs.map((d) => ({ min: d.min, max: d.max, hinge: d.hinge, angle: 0 }))]);
    slabs.forEach((d, i) => { out[base.length + i].angle = this.doors[d.id].open * d.angle; });
    return out;
  }

  // Sliding doors (a big ship's doorways): open for anyone walking up to one
  // (within 4.5 m, either side), closing a moment after they've gone.
  // walkers: positions in this ship's frame.
  updateSlideDoors(dt, walkers) {
    updateAirlocks(this, dt, walkers);
    for (const d of this.type.slideDoors) {
      if (d.airlock) continue;
      const st = this.doors[d.id];
      const uc = (d.u0 + d.u1) / 2, half = (d.u1 - d.u0) / 2;
      let near = false;
      for (const w of walkers) {
        if (w.y < d.y0 - 1.5 || w.y > d.y1) continue;
        const along = d.axis === 'x' ? w.x - d.plane : w.z - d.plane;
        const across = (d.axis === 'x' ? w.z : w.x) - uc;
        if (Math.abs(along) < 4.5 && Math.abs(across) < half + 1.5) { near = true; break; }
      }
      // (an airlock's two doors never both open; an outer one stays shut while docked)
      if ((d.interlock && (this.doors[d.interlock].open > 0.02 || this.doors[d.interlock].target > 0)) || (d.whenFree && this.parent)) { near = false; st.hold = 0; }
      st.hold = near ? 1.5 : Math.max(0, st.hold - dt);
      st.target = st.hold > 0 ? 1 : 0;
      const r = (st.target > st.open ? 3.2 : 1.4) * dt; // (quick to open, unhurried to close)
      st.open += THREE.MathUtils.clamp(st.target - st.open, -r, r);
    }
  }

  updateDoors(dt) {
    if (this.boardingT > 0) this.boardingT -= dt;
    for (const d of this.type.doors || []) {
      const st = this.doors[d.id], r = (d.speed || 0.5) * dt;
      if(d.interlock && this.doors[d.interlock]?.open>.001 && st.target>st.open)continue;
      if (d.auto) st.target = this.boardingT > 0 ? 1 : 0; // (a canopy: up while someone climbs in or out)
      st.open += THREE.MathUtils.clamp(st.target - st.open, -r, r);
    }
  }

  // gravity where it is in its host (host axes): plating, or for a volume
  // without any (a container's hold) whatever the host itself feels
  zoneGravity(out) {
    const z = this.zone;
    if (!z) return out.set(0, 0, 0);
    if (typeof z.gravity === 'number') return out.set(0, -z.gravity, 0);
    return this.parent.feltGravity(out);
  }

  // the gravity felt aboard (own axes): what something loose aboard falls along
  feltGravity(out) {
    if (this.parent) this.zoneGravity(out).applyQuaternion(_fgq.copy(this.lquat).invert());
    else if (this.landed) {
      const r = this.pos.length();
      out.copy(this.pos).multiplyScalar(-this.body.GM / (r * r * r)).applyQuaternion(_fgq.copy(this.quat).invert());
    } else out.copy(this.accel).negate().applyQuaternion(_fgq.copy(this.quat).invert());
    return out;
  }

  // ------------------------------------------------------------------ helpers

  // Altitude below which time warp and rails must hand control back: terrain
  // clearance plus 1.5x the distance the belly thrusters need to stop the
  // present descent (at half power, net of gravity)
  safeAltitude() {
    const b = this.body;
    const clear = b.relief * 1.6 + 2000;
    if (!b.solid) return clear + (this.big ? this.type.radius : 0);
    const vDown = Math.max(0, -this.surfaceVel(_sa1).dot(_sa2.copy(this.pos).normalize()));
    const aStop = Math.max(0.5, 0.5 * this.maxUpAccel());
    return clear + (this.big ? this.type.radius : 0) + vDown * vDown / (2 * aStop) * 1.5;
  }

  // Largest net upward acceleration (m/s^2, gravity included) the thrusters
  // can produce in the present attitude. Each axis is limited on its own, so
  // the best force along a direction u (ship-local) is sum |u_i| * limit_i.
  maxUpAccel() {
    const u = _sa1.copy(this.pos).normalize().applyQuaternion(_q2.copy(this.quat).invert());
    return thrustAccelerationAlong(this,u) - this.body.GM / this.pos.lengthSq();
  }

  // Terrain along the present ground track: the vertical speed (m/s, + up)
  // needed to clear it by a margin that grows with speed (none when nearly
  // hovering, so slow touchdowns are unaffected), and the horizontal speed at
  // which a climb at aClimb still clears it in time. The track is sampled out
  // to the time it takes to stop horizontally at half the braking thrust.
  terrainAhead(vSurf, up, aClimb) {
    const res = this._ahead || (this._ahead = { need: -Infinity, vHmax: Infinity });
    res.need = -Infinity; res.vHmax = Infinity;
    const b = this.body;
    if (!b.solid) return res;
    const vh = _sa1.copy(vSurf).addScaledVector(up, -vSurf.dot(up));
    const sp = vh.length();
    if (sp < 8) return res;
    const margin = 3 + Math.min(150, (sp - 8) * 0.3);
    const alt = this.pos.length() - b.R;
    const v0 = vSurf.dot(up);
    const a = Math.max(0.5, aClimb);
    const back = _sa2.copy(vh).multiplyScalar(-1 / sp).applyQuaternion(_q2.copy(this.quat).invert());
    const aBrake = thrustAccelerationAlong(this,back);
    const horizon = Math.min(90, Math.max(6, 2 + sp / Math.max(.01,0.5 * aBrake))) * this.handling.lookAhead;
    for (let i = 0; i < AHEAD_N; i++) {
      const t = 0.3 * Math.pow(horizon / 0.3, i / (AHEAD_N - 1));
      const p = _sa2.copy(this.pos).addScaledVector(vh, t).applyQuaternion(b.qInv).normalize();
      const e = b.groundHeight(p) + margin - alt; // height to gain by then
      res.need = Math.max(res.need, e / t);
      if (e > 0) {
        const tn = (-v0 + Math.sqrt(Math.max(0, v0 * v0 + 2 * a * e))) / a;
        if (tn > t) res.vHmax = Math.min(res.vHmax, sp * t / tn);
      }
    }
    return res;
  }

  // Velocity of the co-rotating frame at the ship (inertial axes)
  frameVel(out) { return out.copy(this.body.omega).cross(this.pos); }

  // Velocity relative to the surface frame
  surfaceVel(out) { return this.frameVel(out).negate().add(this.vel); }

  placeLanded(body, posF, quatF) {
    this.body = body;
    this.landed = true;
    this.rails = false;
    this.landedPosF.copy(posF);
    this.landedQuatF.copy(quatF);
    this.syncLanded();
    this.gear = this.gearTarget = 1;
  }

  syncLanded() {
    const b = this.body;
    this.pos.copy(this.landedPosF).applyQuaternion(b.q);
    this.frameVel(this.vel);
    this.quat.copy(b.q).multiply(this.landedQuatF);
    const st=b.atmosphereAt(this.pos.length()-b.R,this._atmo||(this._atmo={}));
    Object.assign(this.env,{pressure:st.pressure,density:st.density,temperature:st.temperature,airspeed:0,mach:0,dynPressure:0});
    this.heatFlux=0;this._lastAero=null;this.environment();
    // body spin seen in the ship frame
    this.angVel.copy(b.omega).applyQuaternion(_q1.copy(this.quat).invert());
  }

  changeBody(nb) {
    if (nb === this.body) return;
    const ob = this.body;
    this.pos.add(ob.pos).sub(nb.pos);
    this.vel.add(ob.vel).sub(nb.vel);
    this.targetVel.add(ob.vel).sub(nb.vel);
    this.body = nb;
    if (this.rails) this.enterRails();
    this.game.onSoiChange && this.game.onSoiChange(this, ob, nb);
  }

  checkSOI() {
    if (this.parent) return false;
    const b = this.body;
    if (b.parent && this.pos.lengthSq() > b.soi * b.soi) { this.changeBody(b.parent); return true; }
    for (const c of b.children) {
      if (_v1.copy(this.pos).sub(c.relPos).lengthSq() < c.soi * c.soi) { this.changeBody(c); return true; }
    }
    return false;
  }

  enterRails() {
    this.rails = true;
    // coasting: the velocity FULL assist was holding is history; it holds
    // whatever the ship is doing when it comes off the rails (it used to burn
    // back to the pre-warp velocity, km/s away after an orbit's worth of warp)
    this.targetFrame = 'none';
    this.railR0 = this.pos.toArray();
    this.railV0 = this.vel.toArray();
    this.railT0 = this.game.t;
  }

  railsState(t, outP, outV) {
    const r = [0, 0, 0], v = [0, 0, 0];
    propagate(this.railR0, this.railV0, t - this.railT0, this.body.GM, r, v);
    outP.set(r[0], r[1], r[2]);
    if (outV) outV.set(v[0], v[1], v[2]);
  }

  orbit() { return orbitInfo(this.pos.toArray(), this.vel.toArray(), this.body.GM); }

  // environment readings while coasting on rails (no physics step runs)
  coastEnv() {
    const b = this.body;
    const alt = this.pos.length() - b.R;
    const st = b.atmosphereAt(alt, this._atmo || (this._atmo = {}));
    const env = this.env;
    env.pressure = alt > b.atmHeight * 1.05 ? 0 : st.pressure;
    env.density = alt > b.atmHeight * 1.05 ? 0 : st.density;
    env.temperature = st.temperature;
    env.dynPressure = 0; env.airspeed = 0; env.mach = 0;
    this.heatFlux = 0; this._lastAero = null; this.environment();
    const relief = b.relief;
    this.agl = alt - relief;
    this.legState.fill(0);
    this.accel.set(0, 0, 0);
    this.accelW.copy(this.pos).multiplyScalar(-b.GM / Math.pow(this.pos.length(), 3));
  }

  // ------------------------------------------------------------------ controls -> forces

  wantsForce() {
    const c = this.ctrl;
    return c.fwd !== 0 || c.strafe !== 0 || c.lift !== 0 || c.brake || (this.assist === 2 && this.targetFrame !== 'coast');
  }

  // pilot input that should lift a parked / docked ship off its legs
  wantsMove() {
    const c = this.ctrl;
    if (this.type.ground) return c.fwd !== 0 || (this.type.ground.kind === 'hover' && (c.roll !== 0 || c.strafe !== 0));
    return c.lift > 0 || c.fwd !== 0 || c.strafe !== 0 || !!(this.auto && this.auto.move);
  }

  // Body rates (ship axes) that turn the ship toward an attitude: nose and up
  // in the frame q is measured in (inertial with this.quat, a host's with lquat)
  attitudeRates(q, nose, up, out) {
    const back = _f1.copy(nose).negate().normalize();
    const right = _f2.copy(up).cross(back);
    if (right.lengthSq() < 1e-8) right.set(1, 0, 0).cross(back);
    right.normalize();
    const upO = _c1.copy(back).cross(right);
    const qd = _fq2.setFromRotationMatrix(_m4.makeBasis(right, upO, back));
    const qe = _fq.copy(q).invert().multiply(qd); // error rotation, ship axes
    if (qe.w < 0) { qe.x = -qe.x; qe.y = -qe.y; qe.z = -qe.z; qe.w = -qe.w; }
    const sinH = Math.sqrt(qe.x * qe.x + qe.y * qe.y + qe.z * qe.z);
    const ang = 2 * Math.atan2(sinH, qe.w);
    const k = this.big ? 0.12 : 1.1; // 1/s
    if (sinH < 1e-9) return out.set(0, 0, 0);
    out.set(qe.x, qe.y, qe.z).multiplyScalar(ang * k / sinH);
    const L = this.limits.rate;
    out.set(THREE.MathUtils.clamp(out.x, -L.x, L.x), THREE.MathUtils.clamp(out.y, -L.y, L.y), THREE.MathUtils.clamp(out.z, -L.z, L.z));
    return out;
  }

  // The body rates (ship axes, rad/s) the rate-damped assists hold: the
  // pilot's stick, plus under FULL assist near a surface the turn of the
  // local horizon, wing levelling and the landing flare. feedback: false
  // leaves out the terms that steer by the present attitude (unstable over
  // the long rotation steps of time warp)
  rateCommand(out, feedback = true) {
    const c = this.ctrl, L = this.limits;
    const A = this.auto;
    if (A && A.nose && !this.parent) return feedback ? this.attitudeRates(this.quat, A.nose, A.up, out) : out.set(0, 0, 0);
    const prec = c.precision ? 0.2 : 1;
    const tr = out.set(c.pitch * L.rate.x, c.yaw * L.rate.y, c.roll * L.rate.z).multiplyScalar(prec);
    // FULL assist near a surface holds attitude relative to the local
    // horizon, not the stars: add the rate at which the local-level frame
    // turns (planet spin plus the transport rate over the curved surface)
    if (this.assist === 2 && this.targetFrame === 'surface' && !this.landed) {
      const wLL = _sa2.copy(this.pos).cross(this.surfaceVel(_sa1)).divideScalar(this.pos.lengthSq()).add(this.body.omega);
      tr.add(wLL.applyQuaternion(_q2.copy(this.quat).invert()));
    }
    // FULL assist coasting through time warp with a pilot aboard: hold the
    // attitude relative to the flight path as gravity turns it, as the
    // velocity hold does at 1x (point at a planet, warp, still pointing at it)
    if (this.assist === 2 && this.rails && this.pilotPresent) {
      const v2 = this.vel.lengthSq();
      if (v2 > 1) {
        const r = this.pos.length();
        const a = _sa1.copy(this.pos).multiplyScalar(-this.body.GM / (r * r * r));
        tr.add(_sa2.copy(this.vel).cross(a).divideScalar(v2).applyQuaternion(_q2.copy(this.quat).invert()));
      }
    }
    // FULL assist near a surface: auto-level the wings when not rolling
    if (feedback && this.assist === 2 && c.roll === 0 && this.targetFrame === 'surface' && !this.landed) {
      const up = _v2.copy(this.pos).normalize().applyQuaternion(_q1.copy(this.quat).invert());
      const fwd = _v3.set(0, 0, -1);
      if (Math.abs(up.dot(fwd)) < 0.9) tr.z += THREE.MathUtils.clamp(-up.x * this.handling.levelGain, -L.rate.z, L.rate.z);
      // auto-flare: while the ground guard is holding the ship off the
      // terrain, level the nose so the strong belly thrusters face down
      if (this._guardActive && c.pitch === 0) {
        const pitch = Math.asin(THREE.MathUtils.clamp(-up.z, -1, 1));
        tr.x += THREE.MathUtils.clamp(-pitch * 1.6, -0.9, 0.9);
      }
    }
    return tr;
  }

  // Computes this frame's commanded thrust (ship-local, N) and torque (ship-local, N m)
  computeControl(dt, outForce, outTorque) {
    if (this.type.ground) return this.groundControl(dt, outForce, outTorque, false);
    const c = this.ctrl;
    const L = this.limits;
    const m = this.effMass;
    const prec = c.precision ? 0.2 : 1;
    outForce.set(0, 0, 0);
    outTorque.set(0, 0, 0);
    // ---- rotation
    const I = this.I;
    if (this.assist === 0) {
      outTorque.set(c.pitch * L.alpha.x * I.x * prec, c.yaw * L.alpha.y * I.y * prec, c.roll * L.alpha.z * I.z * prec);
    } else {
      const tr = this.rateCommand(_v1);
      const tc = this.big ? 2.5 : 0.18;
      outTorque.set(
        THREE.MathUtils.clamp((tr.x - this.angVel.x) / tc, -L.alpha.x, L.alpha.x) * I.x,
        THREE.MathUtils.clamp((tr.y - this.angVel.y) / tc, -L.alpha.y, L.alpha.y) * I.y,
        THREE.MathUtils.clamp((tr.z - this.angVel.z) / tc, -L.alpha.z, L.alpha.z) * I.z);
    }
    // ---- translation
    if (this.assist < 2) {
      // raw thrust: a gentle default throttle for fine control, Shift for full power
      const k = c.boost ? 1 : 0.35;
      outForce.set(
        c.strafe * L.lateral * prec * (c.boost ? 1 : 0.6),
        (c.lift > 0 ? c.lift * L.belly * k : c.lift * L.down) * prec,
        (c.fwd > 0 ? -c.fwd * L.main * k : -c.fwd * L.retro) * prec);
      return;
    }
    // FULL: velocity hold in the reference frame. A parked ship has nothing
    // to hold: it stays on its legs until the pilot commands a move.
    const A = this.auto;
    if (this.landed && c.lift <= 0 && !c.fwd && !c.strafe && !(A && A.move)) {
      this.cruise = this.slip = this.climb = 0;
      this.heatLimited = false;
      this.targetFrame = 'surface';
      return;
    }
    const b = this.body;
    const alt = this.pos.length() - b.R;
    const surfaceFrame = alt < Math.max(b.atmHeight * 1.3, 25000, b.R * 0.05);
    const ref = !surfaceFrame && this.refVessel && !this.refVessel.dead ? this.refVessel : null;
    const frame = surfaceFrame ? 'surface' : (ref ? 'vessel:' + ref.name : 'inertial');
    const vRel = _v2;
    if (frame === 'surface') this.surfaceVel(vRel);
    else if (ref) vRel.copy(this.vel).sub(ref.getWorldVel(_v3).sub(b.vel));
    else vRel.copy(this.vel);
    const qinv = _q1.copy(this.quat).invert();
    const approach = (x, target, rate) => x + THREE.MathUtils.clamp(target - x, -rate * dt, rate * dt);
    if (A && A.coast) { outForce.set(0, 0, 0); return; } // the nav computer lets it coast
    if (A) {
      // the nav computer: its velocity, carried into this frame
      if (frame === 'surface') this.targetVel.copy(A.vel).sub(this.frameVel(_v3));
      else if (ref) this.targetVel.copy(A.vel).sub(ref.getWorldVel(_v3).sub(b.vel));
      else this.targetVel.copy(A.vel);
      this.targetFrame = frame;
      const legsDown = this.legState[0] + this.legState[1] + this.legState[2] + this.legState[3];
      this.touchdown = false;
      if (A.land && legsDown > 0 && vRel.length() < 4) {
        outForce.set(0, 0, 0);
        outTorque.set(-this.angVel.x * this.I.x * 1.5, -this.angVel.y * this.I.y * 1.5, -this.angVel.z * this.I.z * 1.5);
        this.touchdown = true;
        return;
      }
    } else if (frame === 'surface') {
      // helicopter-style: climb rate and slip spring back to zero, horizontal
      // cruise speed persists and follows the nose as the ship turns
      const up = _v3.copy(this.pos).normalize();
      const fwdH = _v4.set(0, 0, -1).applyQuaternion(this.quat).addScaledVector(up, 0);
      fwdH.addScaledVector(up, -fwdH.dot(up));
      if (fwdH.lengthSq() < 1e-6) fwdH.set(0, -1, 0).applyQuaternion(this.quat).addScaledVector(up, -_att.set(0, -1, 0).applyQuaternion(this.quat).dot(up));
      fwdH.normalize();
      const rightH = _att.copy(fwdH).cross(up).normalize();
      // VTOL-style transition: slow flight is helicopter-like (cruise along the
      // horizon, lift sets the climb rate); at speed the cruise follows the nose
      const cruiseDir = (speed) => {
        const f = THREE.MathUtils.smoothstep(Math.abs(speed), 60, 220);
        return _nose.set(0, 0, -1).applyQuaternion(this.quat).lerp(fwdH, 1 - f).normalize();
      };
      if (this.targetFrame !== 'surface') {
        const h = vRel.dot(fwdH);
        const d0 = cruiseDir(h);
        this.cruise = h / Math.max(0.3, d0.dot(fwdH));
        this.slip = vRel.dot(rightH);
        this.climb = vRel.dot(up) - this.cruise * d0.dot(up);
        this.targetFrame = 'surface';
      }
      const accH = (c.boost ? 4.0 : 1.4) * G0 * prec * (this.big ? 0.05 : 1);
      const prevCruise = this.cruise;
      if (c.fwd) this.cruise += c.fwd * accH * dt;
      // heat limiter: no faster than the speed whose stagnation heating the
      // protection system rejects at its generation-specific safe temperature
      const rho = this.env.density;
      const vHeat = heatSafeSpeed(rho,this.entry.radius,gasProperties(b.atm),this.entryProfile,this.env.temperature);
      // releasing boost keeps the speed reached; W alone cannot exceed 900 m/s
      const cap = c.boost ? 2500 : Math.max(900, prevCruise);
      const maxCruise = Math.min(cap, Math.max(250, vHeat));
      this.heatLimited = vHeat < cap && this.cruise >= maxCruise - 1;
      this.cruise = THREE.MathUtils.clamp(this.cruise, -120, maxCruise);
      const climbMax = (c.boost ? 70 : 24) * prec;
      this.climb = approach(this.climb, c.lift * climbMax, (c.lift ? 1.3 : 1.6) * G0);
      this.slip = approach(this.slip, c.strafe * 30 * prec, 1.0 * G0);
      if (c.brake) { this.cruise = approach(this.cruise, 0, 2.5 * G0); this.climb = approach(this.climb, 0, 2 * G0); this.slip = approach(this.slip, 0, 2 * G0); }
      // soft-landing guard: limit descent rate near the ground
      if (isFinite(this.agl)) this.climb = Math.max(this.climb, -Math.max(this.handling.touchdown, this.agl * 0.35));
      // touchdown: once a foot is down with no climb/cruise command, cut lift
      // and only damp rotation so the suspension rocks the hull onto all legs
      const legsDown = this.legState[0] + this.legState[1] + this.legState[2] + this.legState[3];
      if (legsDown > 0 && c.lift <= 0 && !c.fwd && !c.strafe && Math.abs(this.cruise) < 3 && this.climb <= 0.05 && vRel.length() < 4) {
        this.cruise = this.slip = 0;
        this.climb = Math.min(this.climb, 0);
        outForce.set(0, 0, 0);
        outTorque.set(-this.angVel.x * this.I.x * 1.5, -this.angVel.y * this.I.y * 1.5, -this.angVel.z * this.I.z * 1.5);
        this.touchdown = true;
        return;
      }
      this.touchdown = false;
      this.targetVel.copy(cruiseDir(this.cruise)).multiplyScalar(this.cruise).addScaledVector(rightH, this.slip).addScaledVector(up, this.climb);
    } else {
      if (frame !== this.targetFrame) { this.targetVel.copy(vRel); this.targetFrame = frame; }
      const fwdW = _v3.set(0, 0, -1).applyQuaternion(this.quat);
      const accCmd = (c.boost ? 5.0 : 1.8) * G0 * prec * (this.big ? 0.05 : 1);
      if (c.fwd) this.targetVel.addScaledVector(fwdW, c.fwd * accCmd * dt * (c.fwd < 0 ? 0.8 : 1));
      if (c.strafe) this.targetVel.addScaledVector(_v4.set(1, 0, 0).applyQuaternion(this.quat), c.strafe * 1.0 * G0 * dt * prec * (this.big ? 0.05 : 1));
      if (c.lift) this.targetVel.addScaledVector(_v4.set(0, 1, 0).applyQuaternion(this.quat), c.lift * 1.2 * G0 * dt * prec * (this.big ? 0.05 : 1));
      if (c.brake) {
        const sp = this.targetVel.length();
        const dec = 2.5 * G0 * dt * (this.big ? 0.05 : 1);
        this.targetVel.multiplyScalar(sp > dec ? (sp - dec) / sp : 0);
      }
    }
    // ground guard (both frames): never descend faster than the thrusters, in
    // the present attitude and at half power, can stop before contact. Along
    // that braking curve the target itself decelerates at aStop, which is fed
    // forward so the velocity loop tracks it without lag.
    let guardFF = 0;
    const guardUp = _nose.copy(this.pos).normalize();
    this._guardActive = false;
    if (isFinite(this.agl)) {
      const aStop = Math.max(0.5, this.handling.guardFraction * this.maxUpAccel());
      const vProf = Math.sqrt(2 * aStop * Math.max(0, this.agl - 1.5));
      let minUp = -Math.max(this.handling.touchdown, vProf), terrainLimited = false;
      // terrain ahead: climb to clear what the ground track is about to
      // cross, and slow down when even that climb would come too late
      const band = b.relief * 1.6 + 2200; // above the highest peaks
      if (this.pos.length() - b.R < band) {
        const ah = this.terrainAhead(this.surfaceVel(_vs), guardUp, aStop);
        if (ah.need > minUp) { minUp = ah.need; terrainLimited = true; }
        if (frame === 'surface' && ah.vHmax < Infinity) {
          const vUp0 = this.targetVel.dot(guardUp);
          const th = _sa2.copy(this.targetVel).addScaledVector(guardUp, -vUp0);
          const hl = th.length();
          if (hl > ah.vHmax) this.targetVel.addScaledVector(th, ah.vHmax / hl - 1);
        }
      }
      const vUp = this.targetVel.dot(guardUp);
      if (vUp < minUp) {
        this.targetVel.addScaledVector(guardUp, minUp - vUp);
        if (!terrainLimited && vProf > this.handling.touchdown) guardFF = aStop;
        this._guardActive = true;
      }
    }
    // required acceleration
    const tau = this.big ? 6 : this.handling.velocityTime;
    const req = _v1.copy(this.targetVel).sub(vRel).divideScalar(tau);
    if (guardFF) req.addScaledVector(guardUp, guardFF);
    // cancel gravity and (in the rotating frame) centrifugal + Coriolis
    const rn = this.pos.length();
    req.addScaledVector(this.pos, b.GM / (rn * rn * rn));
    if (frame === 'surface') {
      // rotating frame: a_inertial = a_rel + 2 w x v_rel + w x (w x r)
      const w = b.omega;
      req.add(_v4.copy(w).cross(vRel).multiplyScalar(2));
      const wr = _v3.copy(w).cross(this.pos);
      req.add(_v4.copy(w).cross(wr));
    } else if (ref) {
      // match the reference ship's own acceleration (its gravity, its thrust)
      req.add(ref.accelW);
    }
    // cancel aerodynamic force estimate
    if (this._lastAero) req.addScaledVector(this._lastAero, -1 / m);
    const fl = req.multiplyScalar(m).applyQuaternion(qinv);
    outForce.set(
      THREE.MathUtils.clamp(fl.x, -L.lateral, L.lateral),
      THREE.MathUtils.clamp(fl.y, -L.down, L.belly),
      THREE.MathUtils.clamp(fl.z, -L.main, L.retro));
  }

  // Ground vehicles. Wheels: throttle, brakes and steering for the tyres (the
  // contacts turn them into motion, see wheelForce). Hover pads: hold a
  // commanded speed over the ground with thrust, turn at a commanded rate.
  // local: driving in a host's frame (a bay deck, a container's floor).
  groundControl(dt, outForce, outTorque, local) {
    const c = this.ctrl, G = this.type.ground, d = this.drive;
    outForce.set(0, 0, 0); outTorque.set(0, 0, 0);
    // wheels steer with A/D or the mouse; a hover-tank turns with the mouse
    // alone and strafes on A/D (or Q/E), Battlezone style
    const steer = THREE.MathUtils.clamp((G.kind === 'hover' ? 0 : c.strafe) - c.yaw * 1.5, -1, 1);
    const k = c.boost ? 1 : 0.6;
    if (G.kind === 'wheels') {
      d.steer += THREE.MathUtils.clamp(steer - d.steer, -2.5 * dt, 2.5 * dt);
      d.throttle = c.fwd * k;
      d.brake = c.brake || c.lift > 0 ? 1 : 0;
      return;
    }
    d.throttle = 0; d.brake = 0; d.steer = 0;
    const m = this.effMass;
    const vRel = local ? _v1.copy(this.lvel) : this.surfaceVel(_v1);
    vRel.applyQuaternion(_q1.copy(local ? this.lquat : this.quat).invert()); // vehicle axes
    const vmax = G.vmax * k;
    const pads = this.legState[0] + this.legState[1] + this.legState[2] + this.legState[3];
    if (pads > 0) {
      const aMax = G.drive * G0 * m, sMax = G.strafe * G0 * m;
      outForce.z = THREE.MathUtils.clamp((-c.fwd * vmax - vRel.z) * m / 1.5, -aMax, aMax);
      // sideways: Q / E strafe; otherwise the drift dies away slowly (it carries
      // its momentum through a turn)
      const side = THREE.MathUtils.clamp(c.strafe - c.roll, -1, 1);
      outForce.x = THREE.MathUtils.clamp((side * vmax * 0.4 - vRel.x) * m / (side ? 1 : 1.2), -sMax, sMax);
    }
    // turns spin up and down over about a second
    const wy = local ? this.lang.y : this.angVel.y; // (the planet's own spin: negligible)
    outTorque.y = THREE.MathUtils.clamp((-steer * G.yawRate - wy) / 1.0, -G.yawAccel, G.yawAccel) * this.I.y;
  }

  // ------------------------------------------------------------------ physics step

  step(dt, ctrlForce, ctrlTorque) {
    if (this.dead) return;
    applyPropulsion(this, ctrlForce, ctrlTorque, dt);
    const b = this.body;
    if (this.landed) {
      const lifting = ctrlForce.y > this.mass * 0.4 * G0 || ctrlForce.z < -this.mass * 0.5 * G0 || ctrlForce.lengthSq() > Math.pow(this.mass * 1.2 * G0, 2) || (this.type.ground && this.wantsMove());
      if (!lifting) { this.syncLanded(); this.thrustLocal.set(0, 0, 0); this.accelW.copy(this.pos).multiplyScalar(-b.GM / Math.pow(this.pos.length(), 3)); return; }
      this.landed = false;
      this.syncLanded();
    }
    const m = this.effMass;
    const F = _v1.set(0, 0, 0);
    const T = _v2.set(0, 0, 0);
    const rn = this.pos.length();
    // gravity
    const grav = _grav.copy(this.pos).multiplyScalar(-b.GM / (rn * rn * rn));
    F.addScaledVector(grav, m);
    // thrust
    this.thrustLocal.copy(ctrlForce);
    F.add(_v3.copy(ctrlForce).applyQuaternion(this.quat));
    T.add(ctrlTorque);
    // aerodynamics
    const alt = rn - b.R;
    this.aero(alt, F, T);
    // contacts: terrain, then big ships' hulls
    this.contacts(dt, F, T);
    if (!this.big) { this.contactsVessels(F, T, dt); this.floraContacts(F, T); }
    // integrate translation (semi-implicit Euler)
    this.accelW.copy(F).divideScalar(m);
    this.accel.copy(this.accelW).sub(grav);
    this.vel.addScaledVector(this.accelW, dt);
    this.pos.addScaledVector(this.vel, dt);
    // rotation: Euler's equations in the body frame
    this.integrateRotation(this.angVel, this.quat, T, dt);
  }

  integrateRotation(w, q, T, dt) {
    const I = this.I;
    const Iw = _v3.set(I.x * w.x, I.y * w.y, I.z * w.z);
    const gyro = _v4.copy(w).cross(Iw);
    w.x += (T.x - gyro.x) / I.x * dt;
    w.y += (T.y - gyro.y) / I.y * dt;
    w.z += (T.z - gyro.z) / I.z * dt;
    const wl = w.length();
    if (wl > 1e-9) {
      _q1.setFromAxisAngle(_v3.copy(w).divideScalar(wl), wl * dt);
      q.multiply(_q1).normalize();
    }
  }

  aero(alt, F, T) {
    const b = this.body;
    const env = this.env;
    this.heatFlux=0;env.mach=0;
    if (!b.atm || alt > b.atmHeight * 1.05) {
      env.pressure = 0; env.density = 0; env.airspeed = 0; env.dynPressure = 0; this._lastAero = null; env.wind.set(0,0,0);
      env.temperature = 3;
      return;
    }
    const st = b.atmosphereAt(alt, this._atmo || (this._atmo = {}));
    env.pressure = st.pressure; env.density = st.density; env.temperature = st.temperature;
    // air velocity: co-rotating atmosphere + zonal winds on giants
    const vAir = this.frameVel(_v3).negate().add(this.vel);
    env.wind.set(0, 0, 0);
    if (b.giant) {
      const g = b.giant;
      const pf = _v4.copy(this.pos).applyQuaternion(b.qInv);
      const lat = Math.asin(THREE.MathUtils.clamp(pf.y / pf.length(), -1, 1));
      const U = g.windMax * (Math.sin(lat * g.bands * 2 + g.jetPhase * 6.283) + g.equatorialJet * Math.exp(-lat * lat * 40));
      const depthK = THREE.MathUtils.clamp(1 + alt / -40000, 0.2, 1.3);
      // east = axis x up
      const upF = pf.normalize();
      const eastF = _v4.set(-upF.z, 0, upF.x);
      if (eastF.lengthSq() > 1e-9) {
        eastF.normalize().applyQuaternion(b.q);
        env.wind.copy(eastF).multiplyScalar(U * depthK);
        const tt = this.game.t;
        env.wind.x += Math.sin(tt * 0.31 + lat * 40) * 12; env.wind.y += Math.sin(tt * 0.17 + 2) * 8; env.wind.z += Math.cos(tt * 0.23) * 12;
        vAir.sub(env.wind);
      }
    }
    if(!b.giant){
      const dirF=_v4.copy(this.pos).applyQuaternion(b.qInv).normalize();
      const rotation=Math.abs(b.data.rotation?.rate||0),day=rotation?2*Math.PI/rotation:86400;
      const wind=windAt(b,dirF,this.game.t,b.data.insolation||1,day,this._entryWind||(this._entryWind={dir:new THREE.Vector3(),speed:0,gust:0}));
      // The shared surface-weather field fades above the lower atmosphere;
      // giant jets retain their existing vertical model.
      env.wind.copy(wind.dir).applyQuaternion(b.q).multiplyScalar(wind.speed*Math.exp(-Math.max(0,alt)/12000));vAir.sub(env.wind);
    }
    const rho = st.density;
    const vmag = vAir.length();
    env.airspeed = vmag;
    const q = 0.5 * rho * vmag * vmag;
    env.dynPressure = q;
    const gas=gasProperties(b.atm);
    env.mach = vmag / Math.sqrt(gas.gamma * 8.314462618 * Math.max(3,st.temperature) / gas.molarMass);
    if (this.big && q > this.type.maxDynPressure) { this.destroy(`${this.name} broke up in ${b.data.name}'s atmosphere`); return; }
    if (vmag < 1e-3) { this._lastAero = null; return; }
    const qinv = _q1.copy(this.quat).invert();
    const vl = _v4.copy(vAir).applyQuaternion(qinv); // airspeed vector, ship-local
    this.entry.direction.copy(vl).divideScalar(vmag);
    Object.assign(this.entry,entryGeometry(this.type,this.entry.direction));
    this.heatFlux=stagnationHeat(rho,vmag,this.entry.radius,gas,st.temperature,this.hullTemp);
    // anisotropic drag: CdA per axis (front, side, top)
    const [cdx, cdy, cdz] = this.type.aero.cd;
    const drag = _att.set(-cdx * vl.x * vmag, -cdy * vl.y * vmag, -cdz * vl.z * vmag).multiplyScalar(0.5 * rho);
    // wing lift in the y-z plane
    const vyz = Math.hypot(vl.y, vl.z);
    const S = this.type.aero.wing;
    if (vyz > 1 && S > 0) {
      const alpha = Math.atan2(-vl.y, -vl.z); // >0: airflow from below the nose
      const cl = Math.abs(alpha) < 0.26 ? 2 * Math.PI * alpha * 0.9 : Math.sin(2 * alpha) * 1.1;
      const lift = 0.5 * rho * vyz * vyz * S * cl;
      // lift acts perpendicular to the airspeed in the y-z plane: (0, -vz, vy)/|v_yz|
      drag.y += lift * (-vl.z / vyz);
      drag.z += lift * (vl.y / vyz);
    }
    const aeroW = _v3.copy(drag).applyQuaternion(this.quat);
    F.add(aeroW);
    this._lastAero = (this._lastAeroV || (this._lastAeroV = new THREE.Vector3())).copy(aeroW);
    // weathervane stability + rotational damping
    const vn = _v4.copy(vl).divideScalar(vmag);
    const kStab = 9.0 * q * (this.big ? 0 : 1), kDamp = 2.2e3 * Math.sqrt(q + 1) * (this.big ? 0 : 1);
    T.x += kStab * (-vn.y) * 1.0 - kDamp * this.angVel.x * Math.min(1, q / 2000);
    T.y += kStab * (vn.x) * 1.0 - kDamp * this.angVel.y * Math.min(1, q / 2000);
    T.z += -kDamp * 0.5 * this.angVel.z * Math.min(1, q / 2000);

  }

  contacts(dt, F, T) {
    const b = this.body;
    const qInvBody = b.qInv;
    this.groundContact = false;
    if (!b.solid) { // gas giants and stars have no surface to touch
      this.agl = Infinity;
      for (let i = 0; i < 4; i++) { this.legState[i] = 0; this.legComp[i] = 0; }
      return;
    }
    let minAgl = Infinity;
    const center = this.pos;
    // high above any terrain: one ground sample under the ship, no probes
    const reliefTop = (b.relief * 1.6 + 200) + (this.big ? this.type.radius : 0);
    const alt0 = center.length() - b.R;
    if (alt0 > reliefTop + 60) {
      const pf0 = _v4.copy(center).applyQuaternion(qInvBody).normalize();
      this.agl = alt0 - b.groundHeight(pf0) - (this.big ? this.type.radius * 0.1 : 2.5);
      for (let i = 0; i < 4; i++) { this.legState[i] = 0; this.legComp[i] = 0; }
      return;
    }
    const omega = b.omega;
    const qShip = this.quat;
    this._axQ = qShip;
    const gearLen = this.legLength * this.gear;
    const surfaceVel = (p, out) => out.copy(omega).cross(p);
    const pointVel = (local, out) => {
      // v = v_cm + q * (w x r_local)
      out.copy(this.angVel).cross(local).applyQuaternion(qShip).add(this.vel);
      return out;
    };
    const probe = (localPt, kSpring, cDamp, mu, isLeg, idx) => {
      const pw = _v3.copy(localPt).applyQuaternion(qShip).add(center);   // body-centred inertial
      const pf = _v4.copy(pw).applyQuaternion(qInvBody);                   // body-fixed
      const r = pf.length();
      // cheap reject: far above any terrain
      const relief = b.relief * 1.6 + 200;
      if (r - b.R > relief) { minAgl = Math.min(minAgl, r - b.R - relief); return 0; }
      const gh = b.floorAt(pf, 1.5);   // (the volume's ground in the near field)
      const depth = b.R + gh - r;
      minAgl = Math.min(minAgl, -depth);
      if (depth <= 0) return 0;
      if (this.big) { this.destroy(`${this.name} broke apart under its own weight on ${b.data.name}`); return 0; }
      // ground normal (body-fixed -> inertial)
      b.groundNormal(pf, _gn, gh).applyQuaternion(b.q);
      const pv = pointVel(localPt, _att);
      const sv = surfaceVel(pw, this._sv || (this._sv = new THREE.Vector3()));
      pv.sub(sv); // velocity relative to the ground
      const force = this.contactForce(pv, _gn, depth, kSpring, cDamp, mu, isLeg, idx);
      F.add(force);
      // torque in ship frame: r_local x (q^-1 force)
      const fl = force.applyQuaternion(_q2.copy(qShip).invert());
      T.add(_v3.copy(localPt).cross(fl));
      return depth;
    };
    // hover pads: active, over the ground below
    if (this.type.ground && this.type.ground.kind === 'hover') {
      for (let i = 0; i < 4; i++) {
        const pad = this.legAttach[i];
        const pw = _v3.copy(pad).applyQuaternion(qShip).add(center);
        const pf = _v4.copy(pw).applyQuaternion(qInvBody);
        const r = pf.length(), gh = b.floorAt(pf, 1.5);
        minAgl = Math.min(minAgl, r - b.R - gh);
        b.groundNormal(pf, _gn, gh).applyQuaternion(b.q);
        const pv = pointVel(pad, _att).sub(surfaceVel(pw, this._sv || (this._sv = new THREE.Vector3())));
        const force = this.hoverPad(i, r - b.R - gh, _gn, pv, b.GM / (r * r));
        if (!force) continue;
        F.add(force);
        T.add(_v3.copy(pad).cross(force.applyQuaternion(_q2.copy(qShip).invert())));
      }
    } else
    // landing legs
    if (this.legAttach && gearLen > Math.min(0.3, this.legLength * 0.5)) { // (short fixed feet count too: a container's)
      const k = this.legK, c = this.legC;
      for (let i = 0; i < 4; i++) {
        const foot = this._foot || (this._foot = new THREE.Vector3());
        foot.copy(this.legAttach[i]); foot.y -= gearLen;
        const d = probe(foot, k, c, 0.9, true, i);
        this.legState[i] = d > 0 ? 1 : 0;
        if (d > gearLen * 0.85) this.impact(2 + d * 10); // bottomed out
      }
    } else for (let i = 0; i < 4; i++) { this.legState[i] = 0; this.legComp[i] = 0; }
    // hull probes
    const pt = this._hp || (this._hp = new THREE.Vector3());
    for (const p of this.type.probes) { if (this.dead) return; pt.set(p[0], p[1], p[2]); probe(pt, this.probeK, this.probeC, 0.5, false); }
    this.agl = minAgl;
  }

  // Tree trunks and rocks (the body's flora field) against the hull's boxes
  // (or its probes), and rocks under the legs / wheels. A trunk is an upright
  // cylinder, a rock a sphere; both fixed to the turning ground.
  floraContacts(F, T) {
    const b = this.body;
    if (!b.solid || !(this.agl < this.type.radius + 40)) return;
    const field = floraOf(b);
    if (!field || !field.active) return;
    const pF = _t1.copy(this.pos).applyQuaternion(b.qInv);
    if (!this._fl || this._flBody !== b || this._flAt.distanceToSquared(pF) > 9) {
      this._fl = field.near(pF, this.type.radius + 6, this._fl || []);
      this._flAt = (this._flAt || new THREE.Vector3()).copy(pF);
      this._flBody = b;
    }
    if (!this._fl.length) return;
    // the vessel's frame relative to the ground (body-fixed)
    const qFi = _tq.copy(b.qInv).multiply(this.quat).invert();
    const boxes = this.type.colliders || this.type.hullBoxes || null;
    this._axQ = this.quat;
    const hit = (local, nLocal, depth, isLeg, idx) => {
      // velocity of that point of the hull over the ground, inertial axes
      const pw = _t4.copy(local).applyQuaternion(this.quat).add(this.pos);
      const pv = _t5.copy(this.angVel).cross(local).applyQuaternion(this.quat).add(this.vel).sub(_t3.copy(b.omega).cross(pw));
      const n = _t3.copy(nLocal).applyQuaternion(this.quat);
      const force = this.contactForce(pv, n, depth, isLeg ? this.legK : this.probeK, isLeg ? this.legC : this.probeC, isLeg ? 0.9 : 0.5, isLeg, idx);
      F.add(force);
      T.add(_t4.copy(local).cross(force.applyQuaternion(_fq.copy(this.quat).invert())));
    };
    const base = new THREE.Vector3(), up = new THREE.Vector3(), s = new THREE.Vector3(), q = new THREE.Vector3(), n = new THREE.Vector3();
    for (const it of this._fl) {
      base.set(it.x - pF.x, it.y - pF.y, it.z - pF.z).applyQuaternion(qFi);
      up.set(it.ux, it.uy, it.uz).applyQuaternion(qFi);
      // rocks under the feet / wheels
      if (it.kind === 'rock' && this.legAttach && this.gear > 0.3) {
        for (let i = 0; i < 4; i++) {
          s.copy(this.legAttach[i]); s.y -= this.legLength * this.gear;
          const d = q.copy(s).sub(base), dist = d.length();
          if (dist < it.r && dist > 1e-6) { hit(s, d.divideScalar(dist), it.r - dist, true, i); this.legState[i] = 1; }
        }
      }
      if (boxes) {
        for (const bx of boxesNear(boxes, base.x, base.z, it.r + (it.kind === 'tree' ? it.h : 0))) {
          let best = 0, bestK = 0;
          const steps = it.kind === 'tree' ? 6 : 1;
          for (let k = 0; k < steps; k++) {
            s.copy(base);
            if (it.kind === 'tree') s.addScaledVector(up, it.h * k / (steps - 1));
            q.set(THREE.MathUtils.clamp(s.x, bx.min[0], bx.max[0]), THREE.MathUtils.clamp(s.y, bx.min[1], bx.max[1]), THREE.MathUtils.clamp(s.z, bx.min[2], bx.max[2]));
            const dist = q.distanceTo(s);
            let depth, nx, ny, nz;
            if (dist > 1e-6) {
              depth = it.r - dist;
              nx = (q.x - s.x) / dist; ny = (q.y - s.y) / dist; nz = (q.z - s.z) / dist; // from it toward the hull
            } else {
              // its axis inside the box: out through the nearest side
              const dd = [s.x - bx.min[0], bx.max[0] - s.x, s.z - bx.min[2], bx.max[2] - s.z, s.y - bx.min[1], bx.max[1] - s.y];
              let m = 0;
              for (let j = 1; j < (it.kind === 'tree' ? 4 : 6); j++) if (dd[j] < dd[m]) m = j;
              depth = dd[m] + it.r;
              nx = m === 0 ? 1 : m === 1 ? -1 : 0; nz = m === 2 ? 1 : m === 3 ? -1 : 0; ny = m === 4 ? 1 : m === 5 ? -1 : 0;
            }
            if (depth > best) { best = depth; bestK = k; n.set(nx, ny, nz); this._flq = (this._flq || new THREE.Vector3()).copy(q); }
          }
          if (best > 0) hit(this._flq, n, Math.min(best, 1.5), false);
        }
      } else {
        for (const pr of this.type.probes) {
          s.set(pr[0], pr[1], pr[2]);
          let d, dist;
          if (it.kind === 'tree') {
            d = q.copy(s).sub(base);
            const along = d.dot(up);
            if (along < 0 || along > it.h) continue;
            d.addScaledVector(up, -along);
          } else d = q.copy(s).sub(base);
          dist = d.length();
          if (dist < it.r && dist > 1e-6) hit(s, n.copy(d).divideScalar(dist), it.r - dist, false);
        }
      }
    }
  }

  // Contact forces from other free craft's colliders on the same body: big
  // ships' hulls, a container on the ground, a parked lifter
  contactsVessels(F, T, dt = 0) {
    const qShip = this.quat;
    const qInvShip = _fq2.copy(qShip).invert();
    for (const h of this.game.vessels) {
      if (h === this || h.dead || h.parent || h.body !== this.body || !h.type.colliders) continue;
      if (h.pos.distanceToSquared(this.pos) > Math.pow(h.type.radius + this.type.radius + 30, 2)) continue;
      const qh = h.quat, qhInv = _fq.copy(qh).invert();
      const cols = h.colliders();
      // Where the host was when this step began: a host stepped before us in
      // this step is already a step ahead (a carrier in orbit, 15 m along its
      // track at 1/120 s), and our position isn't integrated yet
      const hp = this._hostAt || (this._hostAt = new THREE.Vector3());
      hp.copy(h.pos);
      if (dt && h._stepT === this.game.t) hp.addScaledVector(h.vel, -dt);
      this._axQ = (this._axq || (this._axq = new THREE.Quaternion())).copy(qhInv).multiply(qShip);
      const visit = (localPt, kSpring, cDamp, mu, isLeg, idx) => {
        const pb = _c1.copy(localPt).applyQuaternion(qShip).add(this.pos);   // body frame
        const pl = _c2.copy(pb).sub(hp).applyQuaternion(qhInv);            // host local
        const depth = boxPenetration(cols, pl, _cn);
        if (depth <= 0) return 0;
        // relative velocity in host axes
        const vS = _c3.copy(this.angVel).cross(localPt).applyQuaternion(qShip).add(this.vel);
        const vH = h.pointVelocity(_c4.copy(pb).sub(hp).applyQuaternion(qhInv), _gn);
        const pv = vS.sub(vH).applyQuaternion(qhInv);
        const force = this.contactForce(pv, _cn, depth, kSpring, cDamp, mu, isLeg, idx);
        force.applyQuaternion(qh); // host axes -> body axes
        F.add(force);
        T.add(_c3.copy(localPt).cross(force.applyQuaternion(qInvShip)));
        return depth;
      };
      if (this.legAttach && this.gear > 0.3) {
        const gearLen = this.legLength * this.gear;
        for (let i = 0; i < 4; i++) {
          const foot = this._foot2 || (this._foot2 = new THREE.Vector3());
          foot.copy(this.legAttach[i]); foot.y -= gearLen;
          if (visit(foot, this.legK, this.legC, 0.9, true, i) > 0) this.legState[i] = 1;
        }
      }
      const pt = this._hp2 || (this._hp2 = new THREE.Vector3());
      for (const p of this.type.probes) { pt.set(p[0], p[1], p[2]); visit(pt, this.probeK, this.probeC, 0.5, false); }
    }
  }

  // spring-damper + Coulomb/viscous friction; normal and velocity in the
  // same axes; returns the force in those axes (shared scratch vector)
  contactForce(pv, n, depth, kSpring, cDamp, mu, isLeg, idx) {
    const vn = pv.dot(n);
    let Fn = kSpring * depth - cDamp * vn;
    if (Fn < 0) Fn = 0;
    const force = this._pf2 || (this._pf2 = new THREE.Vector3());
    force.copy(n).multiplyScalar(Fn);
    if (isLeg && this.type.ground) this.wheelForce(force, pv, n, Fn, idx);
    else {
      const ft = this._ft2 || (this._ft2 = new THREE.Vector3());
      ft.copy(pv).addScaledVector(n, -vn);
      const vt = ft.length();
      const fMag = Math.min(mu * Fn, vt * this.effMass * 6);
      if (vt > 1e-6) force.addScaledVector(ft, -fMag / vt);
    }
    if (!isLeg && -vn > 3.5) this.impact(-vn);
    if (isLeg) this.legComp[idx] = depth;
    this.groundContact = true;
    return force;
  }

  // A hover pad h metres over the ground (normal n, the pad's velocity over
  // it pv, the local pull of gravity g): its share of the weight, plus a spring
  // and damper toward the ride height; on a light world it pulls down too
  // (reverse thrust), within reach. Returns the force (n's axes) or null out of reach.
  hoverPad(i, h, n, pv, g) {
    const G = this.type.ground, share = this.effMass / 4;
    this.legComp[i] = 0;
    // pads only work facing the ground
    const upDot = _w1.set(0, 1, 0).applyQuaternion(this._axQ).dot(n);
    if (h > G.ride + G.reach || h < -1 || upDot < 0.5) { this.legState[i] = 0; return null; }
    const vn = pv.dot(n);
    let f = share * g * upDot + this.legK * (G.ride - h) - this.legC * vn;
    // (pulling down: only what a light world lacks of `feel` g)
    f = THREE.MathUtils.clamp(f, -Math.max(0, G.feel * G0 - g) * share, G.push * G0 * share);
    const force = this._pf2 || (this._pf2 = new THREE.Vector3());
    force.copy(n).multiplyScalar(f);
    if (f > 0) this.wheelForce(force, pv, n, f, i);
    this.legState[i] = 1;
    this.legComp[i] = Math.max(0, G.ride - h);
    this.groundContact = true;
    return force;
  }

  // A tyre (or hover pad) on the ground: grip across it, drive, brakes and
  // rolling drag along it, all limited by the load on it. pv and n are in the
  // contact pass's axes; this._axQ is the vehicle's orientation in them.
  wheelForce(force, pv, n, Fn, idx) {
    const G = this.type.ground, d = this.drive, share = this.effMass / 4;
    const fwd = _w1.set(0, 0, -1);
    if (G.kind === 'wheels' && idx < 2 && d.steer) fwd.applyAxisAngle(_Y, -d.steer * G.steer); // front pair steers
    fwd.applyQuaternion(this._axQ);
    fwd.addScaledVector(n, -fwd.dot(n));
    if (fwd.lengthSq() < 1e-9) return;
    fwd.normalize();
    const lat = _w2.copy(n).cross(fwd);
    const vL = pv.dot(fwd), vS = pv.dot(lat);
    const lim = G.grip * Fn;
    const fS = THREE.MathUtils.clamp(-vS * share * 8, -lim, lim);
    let fL;
    if (G.kind === 'wheels') {
      const vmax = d.throttle >= 0 ? G.vmax : G.vmax * 0.4;
      const fade = d.throttle * vL > 0 ? Math.max(0, 1 - Math.abs(vL) / vmax) : 1; // (the engine runs out of revs)
      fL = d.throttle * G.drive * G0 * share * fade - vL * share * (d.brake ? 6 : d.throttle ? 0.05 : 0.6);
      fL = THREE.MathUtils.clamp(fL, -lim, lim);
    } else fL = THREE.MathUtils.clamp(-vL * share * 0.1, -lim, lim); // pads: a little drag
    force.addScaledVector(fwd, fL).addScaledVector(lat, fS);
  }

  // ------------------------------------------------------------------ inside a host's space

  // Hold position while docked (cheap path: no forces, just ride along)
  holdAttached() {
    this.lvel.set(0, 0, 0); this.lang.set(0, 0, 0);
    this.syncFromParent();
    this.thrustLocal.set(0, 0, 0);
    this.accel.copy(this.zoneGravity(_gl)).negate().applyQuaternion(this.parent.quat);
    this.accelW.copy(this.parent.accelW);
    this.zoneEnv();
  }

  zoneEnv() {
    const env = this.env, z = this.zone;
    env.pressure = z ? z.pressure : 0; env.density = 0; env.dynPressure = 0; env.airspeed = 0;
    env.temperature = 290; env.mach=0;
    this.heatFlux=0;this._lastAero=null;this.environment();
  }

  // Flight controls in the host's deck frame: up is the host's +Y, gravity is
  // its plating, and the host's own motion does not exist
  computeControlLocal(dt, outForce, outTorque) {
    if (this.type.ground) return this.groundControl(dt, outForce, outTorque, true);
    const c = this.ctrl;
    const L = this.limits;
    const m = this.effMass;
    const prec = c.precision ? 0.2 : 1;
    const gv = this.zoneGravity(_gl);
    outForce.set(0, 0, 0);
    outTorque.set(0, 0, 0);
    const qi = _q1.copy(this.lquat).invert();
    const upL = _att.set(0, 1, 0).applyQuaternion(qi); // deck up in ship axes
    const I = this.I;
    if (this.assist === 0) {
      outTorque.set(c.pitch * L.alpha.x * I.x * prec, c.yaw * L.alpha.y * I.y * prec, c.roll * L.alpha.z * I.z * prec);
    } else {
      const A = this.auto;
      const tr = A && A.lnose ? this.attitudeRates(this.lquat, A.lnose, A.lup, _v1) : _v1.set(c.pitch * L.rate.x, c.yaw * L.rate.y, c.roll * L.rate.z).multiplyScalar(prec);
      if (this.assist === 2 && !this.attached && !(A && A.lnose)) {
        // hover mode over a deck: level wings and nose whenever not commanded
        if (c.roll === 0 && Math.abs(upL.z) < 0.9) tr.z += THREE.MathUtils.clamp(-upL.x * 1.4, -0.8, 0.8);
        if (c.pitch === 0) tr.x += THREE.MathUtils.clamp(-Math.asin(THREE.MathUtils.clamp(-upL.z, -1, 1)) * 1.2, -0.7, 0.7);
      }
      const tc = this.big ? 2.5 : 0.18;
      outTorque.set(
        THREE.MathUtils.clamp((tr.x - this.lang.x) / tc, -L.alpha.x, L.alpha.x) * I.x,
        THREE.MathUtils.clamp((tr.y - this.lang.y) / tc, -L.alpha.y, L.alpha.y) * I.y,
        THREE.MathUtils.clamp((tr.z - this.lang.z) / tc, -L.alpha.z, L.alpha.z) * I.z);
    }
    if (this.assist < 2) {
      const k = c.boost ? 1 : 0.35;
      outForce.set(
        c.strafe * L.lateral * prec * (c.boost ? 1 : 0.6),
        (c.lift > 0 ? c.lift * L.belly * k : c.lift * L.down) * prec,
        (c.fwd > 0 ? -c.fwd * L.main * k : -c.fwd * L.retro) * prec);
      return;
    }
    if (this.attached && !this.wantsMove()) {
      this.cruise = this.slip = this.climb = 0;
      this.targetFrame = 'deck';
      return;
    }
    const approach = (x, target, rate) => x + THREE.MathUtils.clamp(target - x, -rate * dt, rate * dt);
    const up = _v3.set(0, 1, 0);
    const fwdH = _v4.set(0, 0, -1).applyQuaternion(this.lquat);
    fwdH.y = 0;
    if (fwdH.lengthSq() < 1e-6) fwdH.set(0, -1, 0).applyQuaternion(this.lquat).setY(0);
    fwdH.normalize();
    const rightH = _nose.copy(fwdH).cross(up).normalize();
    const vRel = this.lvel;
    const A = this.auto;
    if (A && A.lvel) {
      // the nav computer, in the deck frame
      const legsDown = this.legState[0] + this.legState[1] + this.legState[2] + this.legState[3];
      this.targetFrame = 'deck';
      if (A.land && legsDown > 0 && vRel.length() < 3) {
        outTorque.set(-this.lang.x * I.x * 1.5, -this.lang.y * I.y * 1.5, -this.lang.z * I.z * 1.5);
        this.touchdown = true;
        return;
      }
      this.touchdown = false;
      const reqA = _v2.copy(A.lvel).sub(vRel).divideScalar(this.handling.deckTime);
      reqA.sub(gv);
      const flA = reqA.multiplyScalar(m).applyQuaternion(qi);
      outForce.set(THREE.MathUtils.clamp(flA.x, -L.lateral, L.lateral), THREE.MathUtils.clamp(flA.y, -L.down, L.belly), THREE.MathUtils.clamp(flA.z, -L.main, L.retro));
      return;
    }
    if (this.targetFrame !== 'deck') {
      this.cruise = vRel.dot(fwdH); this.slip = vRel.dot(rightH); this.climb = vRel.y;
      this.targetFrame = 'deck';
    }
    // docking speeds: gentle, precise
    if (c.fwd) this.cruise += c.fwd * (c.boost ? 1.5 : 0.6) * G0 * prec * dt;
    this.cruise = THREE.MathUtils.clamp(this.cruise, -30, c.boost ? 120 : 60);
    this.climb = approach(this.climb, c.lift * (c.boost ? 20 : 8) * prec, 1.2 * G0);
    this.slip = approach(this.slip, c.strafe * 12 * prec, 0.8 * G0);
    if (c.brake || (!c.fwd && Math.abs(this.cruise) < 30)) this.cruise = approach(this.cruise, 0, (c.brake ? 1.5 : 0.25) * G0);
    if (isFinite(this.agl)) this.climb = Math.max(this.climb, -Math.max(Math.min(.8,this.handling.touchdown), this.agl * 0.35));
    const legsDown = this.legState[0] + this.legState[1] + this.legState[2] + this.legState[3];
    if (legsDown > 0 && c.lift <= 0 && !c.fwd && !c.strafe && Math.abs(this.cruise) < 2 && this.climb <= 0.05 && vRel.length() < 3) {
      this.cruise = this.slip = 0;
      this.climb = Math.min(this.climb, 0);
      outTorque.set(-this.lang.x * I.x * 1.5, -this.lang.y * I.y * 1.5, -this.lang.z * I.z * 1.5);
      this.touchdown = true;
      return;
    }
    this.touchdown = false;
    this.targetVel.copy(fwdH).multiplyScalar(this.cruise).addScaledVector(rightH, this.slip).addScaledVector(up, this.climb);
    const req = _v2.copy(this.targetVel).sub(vRel).divideScalar(this.handling.deckTime);
    req.sub(gv); // hold against the plating (or the host's pull)
    const fl = req.multiplyScalar(m).applyQuaternion(qi);
    outForce.set(
      THREE.MathUtils.clamp(fl.x, -L.lateral, L.lateral),
      THREE.MathUtils.clamp(fl.y, -L.down, L.belly),
      THREE.MathUtils.clamp(fl.z, -L.main, L.retro));
  }

  // One physics step inside the host's space
  stepLocal(dt, ctrlForce, ctrlTorque) {
    if (this.dead) return;
    applyPropulsion(this, ctrlForce, ctrlTorque, dt);
    const p = this.parent;
    if (this.attached) {
      const lifting = ctrlForce.y > this.mass * 0.4 * G0 || ctrlForce.lengthSq() > Math.pow(this.mass * 1.2 * G0, 2) || ((this.assist < 2 || this.type.ground) && this.wantsMove() && thrustAvailability(this) > 0);
      if (!lifting) { this.holdAttached(); return; }
      this.attached = false;
      this.idleTime = 0;
      this.game.onUndock && this.game.onUndock(this);
    }
    const m = this.effMass;
    const gv = this.zoneGravity(_gl);
    const F = _v1.copy(gv).multiplyScalar(m);
    this.thrustLocal.copy(ctrlForce);
    F.add(_v3.copy(ctrlForce).applyQuaternion(this.lquat));
    const T = _v2.copy(ctrlTorque);
    this.contactsLocal(F, T);
    const ax = F.x / m, ay = F.y / m, az = F.z / m;
    this.lvel.x += ax * dt; this.lvel.y += ay * dt; this.lvel.z += az * dt;
    this.lpos.addScaledVector(this.lvel, dt);
    // felt acceleration: everything but the plating... which is felt like weight
    this.accel.set(ax - gv.x, ay - gv.y, az - gv.z).applyQuaternion(p.quat);
    this.integrateRotation(this.lang, this.lquat, T, dt);
    this.syncFromParent();
    this.accelW.copy(p.accelW);
    this.zoneEnv();
  }

  // Legs and hull probes against the host's colliders (host coordinates)
  contactsLocal(F, T) {
    const p = this.parent;
    const boxes = p.colliders(true);
    const q = this.lquat, qi = _fq2.copy(q).invert();
    let minAgl = Infinity;
    this.groundContact = false;
    this._axQ = q;
    const visit = (localPt, kSpring, cDamp, mu, isLeg, idx) => {
      const pp = _c1.copy(localPt).applyQuaternion(q).add(this.lpos);
      const top = deckBelow(boxes, pp);
      if (top > -Infinity) minAgl = Math.min(minAgl, pp.y - top);
      const depth = boxPenetration(boxes, pp, _cn);
      if (depth <= 0) return 0;
      const pv = _c3.copy(this.lang).cross(localPt).applyQuaternion(q).add(this.lvel);
      const force = this.contactForce(pv, _cn, depth, kSpring, cDamp, mu, isLeg, idx);
      F.add(force);
      T.add(_c4.copy(localPt).cross(force.applyQuaternion(qi)));
      return depth;
    };
    if (this.type.ground && this.type.ground.kind === 'hover') {
      // hover pads over the deck below (host frame: up is +Y)
      const gl = this.zoneGravity(_gl).length();
      for (let i = 0; i < 4; i++) {
        const pad = this.legAttach[i];
        const pp = _c1.copy(pad).applyQuaternion(q).add(this.lpos);
        const top = deckBelow(boxes, pp, 6);
        if (top === -Infinity) { this.legState[i] = 0; continue; }
        minAgl = Math.min(minAgl, pp.y - top);
        const pv = _c3.copy(this.lang).cross(pad).applyQuaternion(q).add(this.lvel);
        const force = this.hoverPad(i, pp.y - top, _cn.set(0, 1, 0), pv, gl);
        if (!force) continue;
        F.add(force);
        T.add(_c4.copy(pad).cross(force.applyQuaternion(qi)));
      }
    } else if (this.legAttach && this.gear > 0.3) {
      const gearLen = this.legLength * this.gear;
      for (let i = 0; i < 4; i++) {
        const foot = this._foot3 || (this._foot3 = new THREE.Vector3());
        foot.copy(this.legAttach[i]); foot.y -= gearLen;
        const d = visit(foot, this.legK, this.legC, 0.9, true, i);
        this.legState[i] = d > 0 ? 1 : 0;
      }
    } else for (let i = 0; i < 4; i++) { this.legState[i] = 0; this.legComp[i] = 0; }
    const pt = this._hp3 || (this._hp3 = new THREE.Vector3());
    for (const pr of this.type.probes) { pt.set(pr[0], pr[1], pr[2]); visit(pt, this.probeK, this.probeC, 0.5, false); }
    this.agl = minAgl;
    this.contactsSiblings(F, T);
  }

  // Craft sharing this host's space: a container on the bay deck, the lifter
  // parked beside it (their colliders in their own frames)
  contactsSiblings(F, T) {
    const p = this.parent;
    const q = this.lquat, qi = _fq2.copy(q).invert();
    for (const s of p.children) {
      if (s === this || s.dead || !s.type.colliders) continue;
      if (s.lpos.distanceToSquared(this.lpos) > Math.pow(s.type.radius + this.type.radius + 2, 2)) continue;
      const cols = s.colliders();
      const sq = s.lquat, sqi = _fq3.copy(sq).invert();
      const visit = (localPt, kSpring, cDamp, mu, isLeg, idx) => {
        const pp = _c1.copy(localPt).applyQuaternion(q).add(this.lpos);   // host frame
        const ps = _c2.copy(pp).sub(s.lpos).applyQuaternion(sqi);       // the sibling's
        const depth = boxPenetration(cols, ps, _cn);
        if (depth <= 0) return 0;
        _cn.applyQuaternion(sq);
        const pv = _c3.copy(this.lang).cross(localPt).applyQuaternion(q).add(this.lvel);
        pv.sub(_c4.copy(s.lang).cross(ps).applyQuaternion(sq).add(s.lvel));
        const force = this.contactForce(pv, _cn, depth, kSpring, cDamp, mu, isLeg, idx);
        F.add(force);
        T.add(_c4.copy(localPt).cross(force.applyQuaternion(qi)));
        return depth;
      };
      if (this.legAttach && this.gear > 0.3) {
        const gearLen = this.legLength * this.gear;
        for (let i = 0; i < 4; i++) {
          const foot = this._foot4 || (this._foot4 = new THREE.Vector3());
          foot.copy(this.legAttach[i]); foot.y -= gearLen;
          if (visit(foot, this.legK, this.legC, 0.9, true, i) > 0) this.legState[i] = 1;
        }
      }
      const pt = this._hp4 || (this._hp4 = new THREE.Vector3());
      for (const pr of this.type.probes) { pt.set(pr[0], pr[1], pr[2]); visit(pt, this.probeK, this.probeC, 0.5, false); }
    }
  }

  // Settled on the host's deck: dock
  tryLandLocal(dt) {
    if (this.attached || this.dead || !this.type.legs) return;
    const legs = this.legState[0] + this.legState[1] + this.legState[2] + this.legState[3];
    const quiet = this.ctrl.fwd === 0 && this.ctrl.lift <= 0 && this.ctrl.strafe === 0 && Math.abs(this.thrustLocal.y) < this.mass * G0 * 0.35;
    if (this.restsOn(legs) && this.lvel.length() < 0.3 && this.lang.length() < 0.06 && quiet) this.idleTime += dt; else this.idleTime = 0;
    if (this.idleTime > 0.6) {
      this.attached = true;
      this.lvel.set(0, 0, 0); this.lang.set(0, 0, 0);
      this.cruise = this.slip = this.climb = 0;
      this.targetFrame = 'deck';
      this.syncFromParent();
      this.game.onDocked && this.game.onDocked(this);
    }
  }

  impact(speed) {
    const now = this.game.t;
    const protection=this.handling;
    if (speed > protection.impactBreak) { this.destroy(`Hull breach on impact at ${speed.toFixed(0)} m/s`); return; }
    if (now - this.lastImpact < 0.25) return;
    this.lastImpact = now;
    const dmg = Math.max(0, speed - protection.impactFree) ** 2 * protection.impactDamage;
    if (dmg > 0) {
      this.hull = Math.max(0, this.hull - dmg);
      this.game.onShipDamage && this.game.onShipDamage(this, dmg, 'impact');
      if (this.hull <= 0) this.destroy('Structural failure after impact');
    }
  }

  destroy(cause) {
    if (this.dead) return;
    this.dead = true;
    this.deathCause = cause;
    // whatever it carries goes with it
    for (const c of this.children.slice()) c.destroy(`Lost aboard ${this.name}: ${cause}`);
    this.game.onShipDestroyed && this.game.onShipDestroyed(this, cause);
  }

  // Environmental damage: pressure and heat
  environment(dt = Math.max(0,(this.game.t||0)-this._thermalT)) {
    // Several hierarchy/render synchronizations can inspect the environment at
    // the same simulation time. Heat and damage advance exactly once.
    dt=Math.max(0,Math.min(dt,(this.game.t||0)-this._thermalT));
    if(!dt)return;
    this._thermalT=this.game.t||0;
    const env = this.env;
    const P = env.pressure;
    const rating = this.hullRating;
    if (P > rating * 0.8) {
      const over = P / rating - 0.8;
      this.hull = Math.max(0, this.hull - over * over * dt * 0.6);
      if (P > rating * 1.25 || this.hull <= 0) this.destroy(`Crushed at ${P.toFixed(0)} bar (${this.body.data.name})`);
    }
    const profile=this.entryProfile;
    this.hullTemp=integrateHullTemperature(this.hullTemp,env.temperature||3,this.heatFlux,profile,dt,env.density);
    this.entry.heatLoad+=this.heatFlux*dt;
    const glow=Math.min(2,this.heatFlux/1.2e6)*THREE.MathUtils.smoothstep(env.mach,2,5);
    this.heatGlow+=(glow-this.heatGlow)*(1-Math.exp(-dt/0.18));
    if(this.hullTemp>profile.limit){
      this.hull=Math.max(0,this.hull-(this.hullTemp-profile.limit)/400*dt*profile.damageRate);
      if(this.hull<=0)this.destroy('Thermal protection failed');
    }
  }

  // Resting on enough of itself to stay put: three legs; cargo and vehicles on
  // rough ground on whatever touches (a container's corner on a hump, two
  // wheels). (The contact friction never quite sticks: anything left
  // unsettled creeps downhill.)
  restsOn(legs) {
    return legs >= 3 || ((this.type.cargo || this.type.ground) && (legs >= 1 || this.groundContact));
  }

  // Whether the ship can rest landed (all legs planted, nearly stationary)
  tryLand(dt) {
    if (this.landed || this.dead || !this.body.solid || !this.type.legs) return;
    const legs = this.legState[0] + this.legState[1] + this.legState[2] + this.legState[3];
    const sv = this.surfaceVel(_v1).length();
    // spin relative to the rotating surface
    const spin = _v2.copy(this.body.omega).applyQuaternion(_q1.copy(this.quat).invert()).sub(this.angVel).length();
    const quiet = this.ctrl.fwd === 0 && this.ctrl.lift <= 0 && this.ctrl.strafe === 0 && Math.abs(this.thrustLocal.y) < this.mass * G0 * 0.35;
    if (this.restsOn(legs) && sv < 0.3 && spin < 0.06 && quiet) this.idleTime += dt; else this.idleTime = 0;
    if (this.idleTime > 0.8) {
      const b = this.body;
      this.landed = true;
      this.landedPosF.copy(this.pos).applyQuaternion(b.qInv);
      this.landedQuatF.copy(b.qInv).multiply(this.quat);
      this.targetVel.set(0, 0, 0); // relative to the surface
      this.targetFrame = 'surface';
      this.cruise = this.slip = this.climb = 0;
      this.syncLanded();
      this.game.onShipLanded && this.game.onShipLanded(this);
    }
  }
}

// A vessel as a navigation target (bodies and vessels share this shape)
export class VesselTarget {
  constructor(v) {
    this.v = v;
    this.isVessel = true;
    this.R = 0;
    this.data = { name: v.name, label: v.type.className };
    this._p = new THREE.Vector3(); this._vel = new THREE.Vector3();
  }
  get pos() { return this.v.getWorldPos(this._p); }
  get vel() { return this.v.getWorldVel(this._vel); }
}
