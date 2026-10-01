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

import * as THREE from 'three';
import { propagate, orbitInfo } from '../core/kepler.js';
import { SHUTTLE, boxPenetration, deckBelow, insideBox } from './vesselTypes.js';

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
    this.pilotPresent = false;
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
  }

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

  // ------------------------------------------------------------------ helpers

  // Altitude below which time warp and rails must hand control back: terrain
  // clearance plus 1.5x the distance the belly thrusters need to stop the
  // present descent (at half power, net of gravity)
  safeAltitude() {
    const b = this.body;
    const clear = b.data.terrain ? b.data.terrain.relief * 1.6 + 2000 : 2000;
    if (!b.solid) return clear + (this.big ? this.type.radius : 0);
    const vDown = Math.max(0, -this.surfaceVel(_sa1).dot(_sa2.copy(this.pos).normalize()));
    const aStop = Math.max(0.5, 0.5 * this.maxUpAccel());
    return clear + (this.big ? this.type.radius : 0) + vDown * vDown / (2 * aStop) * 1.5;
  }

  // Largest net upward acceleration (m/s^2, gravity included) the thrusters
  // can produce in the present attitude. Each axis is limited on its own, so
  // the best force along a direction u (ship-local) is sum |u_i| * limit_i.
  maxUpAccel() {
    const L = this.limits;
    const u = _sa1.copy(this.pos).normalize().applyQuaternion(_q2.copy(this.quat).invert());
    const F = Math.abs(u.x) * L.lateral + Math.abs(u.y) * (u.y > 0 ? L.belly : L.down) + Math.abs(u.z) * (u.z > 0 ? L.retro : L.main);
    return F / this.mass - this.body.GM / this.pos.lengthSq();
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
    const L = this.limits;
    const back = _sa2.copy(vh).multiplyScalar(-1 / sp).applyQuaternion(_q2.copy(this.quat).invert());
    const aBrake = (Math.abs(back.x) * L.lateral + Math.abs(back.y) * (back.y > 0 ? L.belly : L.down) + Math.abs(back.z) * (back.z > 0 ? L.retro : L.main)) / this.mass;
    const horizon = Math.min(90, Math.max(6, 2 + sp / (0.5 * aBrake)));
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
    env.dynPressure = 0; env.airspeed = 0;
    this.heatGlow *= 0.9;
    const relief = b.data.terrain ? b.data.terrain.relief : 0;
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
      if (Math.abs(up.dot(fwd)) < 0.9) tr.z += THREE.MathUtils.clamp(-up.x * 1.4, -0.8, 0.8);
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
    const c = this.ctrl;
    const L = this.limits;
    const m = this.mass;
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
      // hull radiates away (Sutton-Graves at ~90 kW/m^2, ~1500 K equilibrium)
      const rho = this.env.density;
      const vHeat = rho > 1e-7 ? Math.cbrt(9e4 / (1.7415e-4 * Math.sqrt(rho / 1.5))) : Infinity;
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
      if (isFinite(this.agl)) this.climb = Math.max(this.climb, -Math.max(1.2, this.agl * 0.35));
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
      const aStop = Math.max(0.5, 0.5 * this.maxUpAccel());
      const vProf = Math.sqrt(2 * aStop * Math.max(0, this.agl - 1.5));
      let minUp = -Math.max(1.2, vProf), terrainLimited = false;
      // terrain ahead: climb to clear what the ground track is about to
      // cross, and slow down when even that climb would come too late
      const band = b.data.terrain ? b.data.terrain.relief * 1.6 + 2200 : 2200; // above the highest peaks
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
        if (!terrainLimited && vProf > 1.2) guardFF = aStop;
        this._guardActive = true;
      }
    }
    // required acceleration
    const tau = this.big ? 6 : 0.7;
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

  // ------------------------------------------------------------------ physics step

  step(dt, ctrlForce, ctrlTorque) {
    if (this.dead) return;
    const b = this.body;
    if (this.landed) {
      const lifting = ctrlForce.y > this.mass * 0.4 * G0 || ctrlForce.z < -this.mass * 0.5 * G0 || ctrlForce.lengthSq() > Math.pow(this.mass * 1.2 * G0, 2);
      if (!lifting) { this.syncLanded(); this.thrustLocal.set(0, 0, 0); this.accelW.copy(this.pos).multiplyScalar(-b.GM / Math.pow(this.pos.length(), 3)); return; }
      this.landed = false;
      this.syncLanded();
    }
    const m = this.mass;
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
    if (!this.big) this.contactsVessels(F, T);
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
    if (!b.atm || alt > b.atmHeight * 1.05) {
      env.pressure = 0; env.density = 0; env.airspeed = 0; env.dynPressure = 0; this.heatGlow *= 0.95; this._lastAero = null;
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
    const rho = st.density;
    const vmag = vAir.length();
    env.airspeed = vmag;
    const q = 0.5 * rho * vmag * vmag;
    env.dynPressure = q;
    env.mach = vmag / Math.sqrt(1.3 * 8.314 * st.temperature / Math.max(0.002, (b.atm.mu || 29) / 1000));
    if (this.big && q > this.type.maxDynPressure) { this.destroy(`${this.name} broke up in ${b.data.name}'s atmosphere`); return; }
    if (vmag < 1e-3) { this._lastAero = null; return; }
    const qinv = _q1.copy(this.quat).invert();
    const vl = _v4.copy(vAir).applyQuaternion(qinv); // airspeed vector, ship-local
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
    // Sutton-Graves stagnation heating (W/m^2), nose radius ~1.5 m
    const qh = 1.7415e-4 * Math.sqrt(rho / 1.5) * vmag * vmag * vmag;
    this.heatFlux = qh;
    this.heatGlow = this.heatGlow * 0.9 + Math.min(2, qh / 1.2e6) * 0.1;
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
    const reliefTop = (b.data.terrain ? b.data.terrain.relief * 1.6 + 200 : 200) + (this.big ? this.type.radius : 0);
    const alt0 = center.length() - b.R;
    if (alt0 > reliefTop + 60) {
      const pf0 = _v4.copy(center).applyQuaternion(qInvBody).normalize();
      this.agl = alt0 - b.groundHeight(pf0) - (this.big ? this.type.radius * 0.1 : 2.5);
      for (let i = 0; i < 4; i++) { this.legState[i] = 0; this.legComp[i] = 0; }
      return;
    }
    const omega = b.omega;
    const qShip = this.quat;
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
      const relief = b.data.terrain ? b.data.terrain.relief * 1.6 + 200 : 200;
      if (r - b.R > relief) { minAgl = Math.min(minAgl, r - b.R - relief); return 0; }
      const gh = b.groundHeight(pf);
      const depth = b.R + gh - r;
      minAgl = Math.min(minAgl, -depth);
      if (depth <= 0) return 0;
      if (this.big) { this.destroy(`${this.name} broke apart under its own weight on ${b.data.name}`); return 0; }
      // ground normal (body-fixed -> inertial)
      b.groundNormal(pf, _gn, gh).applyQuaternion(b.q);
      const pv = pointVel(localPt, _att);
      const sv = surfaceVel(pw, this._sv || (this._sv = new THREE.Vector3()));
      pv.sub(sv); // velocity relative to the ground
      const vn = pv.dot(_gn);
      let Fn = kSpring * depth - cDamp * vn;
      if (Fn < 0) Fn = 0;
      const ft = this._ft || (this._ft = new THREE.Vector3());
      ft.copy(pv).addScaledVector(_gn, -vn);
      const vt = ft.length();
      const fMax = mu * Fn;
      const fVisc = vt * this.mass * 6;
      const fMag = Math.min(fMax, fVisc);
      const force = this._pf || (this._pf = new THREE.Vector3());
      force.copy(_gn).multiplyScalar(Fn);
      if (vt > 1e-6) force.addScaledVector(ft, -fMag / vt);
      F.add(force);
      // torque in ship frame: r_local x (q^-1 force)
      const fl = force.applyQuaternion(_q2.copy(qShip).invert());
      T.add(_v3.copy(localPt).cross(fl));
      if (!isLeg && -vn > 3.5) this.impact(-vn);
      if (isLeg) { this.legComp[idx] = depth; }
      this.groundContact = true;
      return depth;
    };
    // landing legs
    if (this.legAttach && gearLen > 0.3) {
      const k = 6.0e5, c = 1.3e5;
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
    for (const p of this.type.probes) { if (this.dead) return; pt.set(p[0], p[1], p[2]); probe(pt, 5e6, 9e5, 0.5, false); }
    this.agl = minAgl;
  }

  // Contact forces from big ships' hull colliders (free flight near them)
  contactsVessels(F, T) {
    const qShip = this.quat;
    const qInvShip = _fq2.copy(qShip).invert();
    for (const h of this.game.vessels) {
      if (!h.big || h === this || h.dead || h.body !== this.body) continue;
      if (h.pos.distanceToSquared(this.pos) > Math.pow(h.type.radius + 40, 2)) continue;
      const qh = h.quat, qhInv = _fq.copy(qh).invert();
      const visit = (localPt, kSpring, cDamp, mu, isLeg, idx) => {
        const pb = _c1.copy(localPt).applyQuaternion(qShip).add(this.pos);   // body frame
        const pl = _c2.copy(pb).sub(h.pos).applyQuaternion(qhInv);         // host local
        const depth = boxPenetration(h.type.colliders, pl, _cn);
        if (depth <= 0) return 0;
        // relative velocity in host axes
        const vS = _c3.copy(this.angVel).cross(localPt).applyQuaternion(qShip).add(this.vel);
        const vH = h.pointVelocity(_c4.copy(pb).sub(h.pos).applyQuaternion(qhInv), _gn);
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
          if (visit(foot, 6.0e5, 1.3e5, 0.9, true, i) > 0) this.legState[i] = 1;
        }
      }
      const pt = this._hp2 || (this._hp2 = new THREE.Vector3());
      for (const p of this.type.probes) { pt.set(p[0], p[1], p[2]); visit(pt, 5e6, 9e5, 0.5, false); }
    }
  }

  // spring-damper + Coulomb/viscous friction; normal and velocity in the
  // same axes; returns the force in those axes (shared scratch vector)
  contactForce(pv, n, depth, kSpring, cDamp, mu, isLeg, idx) {
    const vn = pv.dot(n);
    let Fn = kSpring * depth - cDamp * vn;
    if (Fn < 0) Fn = 0;
    const ft = this._ft2 || (this._ft2 = new THREE.Vector3());
    ft.copy(pv).addScaledVector(n, -vn);
    const vt = ft.length();
    const fMag = Math.min(mu * Fn, vt * this.mass * 6);
    const force = this._pf2 || (this._pf2 = new THREE.Vector3());
    force.copy(n).multiplyScalar(Fn);
    if (vt > 1e-6) force.addScaledVector(ft, -fMag / vt);
    if (!isLeg && -vn > 3.5) this.impact(-vn);
    if (isLeg) this.legComp[idx] = depth;
    this.groundContact = true;
    return force;
  }

  // ------------------------------------------------------------------ inside a host's space

  // Hold position while docked (cheap path: no forces, just ride along)
  holdAttached() {
    this.lvel.set(0, 0, 0); this.lang.set(0, 0, 0);
    this.syncFromParent();
    this.thrustLocal.set(0, 0, 0);
    this.accel.set(0, this.zone ? this.zone.gravity : 0, 0).applyQuaternion(this.parent.quat);
    this.accelW.copy(this.parent.accelW);
    this.zoneEnv();
  }

  zoneEnv() {
    const env = this.env, z = this.zone;
    env.pressure = z ? z.pressure : 0; env.density = 0; env.dynPressure = 0; env.airspeed = 0;
    env.temperature = 290;
    this.heatGlow *= 0.9;
  }

  // Flight controls in the host's deck frame: up is the host's +Y, gravity is
  // its plating, and the host's own motion does not exist
  computeControlLocal(dt, outForce, outTorque) {
    const c = this.ctrl;
    const L = this.limits;
    const m = this.mass;
    const prec = c.precision ? 0.2 : 1;
    const g = this.zone ? this.zone.gravity : 0;
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
      const reqA = _v2.copy(A.lvel).sub(vRel).divideScalar(0.6);
      reqA.y += g;
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
    if (isFinite(this.agl)) this.climb = Math.max(this.climb, -Math.max(0.8, this.agl * 0.35));
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
    const req = _v2.copy(this.targetVel).sub(vRel).divideScalar(0.6);
    req.y += g; // hold against the plating
    const fl = req.multiplyScalar(m).applyQuaternion(qi);
    outForce.set(
      THREE.MathUtils.clamp(fl.x, -L.lateral, L.lateral),
      THREE.MathUtils.clamp(fl.y, -L.down, L.belly),
      THREE.MathUtils.clamp(fl.z, -L.main, L.retro));
  }

  // One physics step inside the host's space
  stepLocal(dt, ctrlForce, ctrlTorque) {
    if (this.dead) return;
    const p = this.parent;
    if (this.attached) {
      const lifting = ctrlForce.y > this.mass * 0.4 * G0 || ctrlForce.lengthSq() > Math.pow(this.mass * 1.2 * G0, 2) || (this.assist < 2 && this.wantsMove());
      if (!lifting) { this.holdAttached(); return; }
      this.attached = false;
      this.idleTime = 0;
      this.game.onUndock && this.game.onUndock(this);
    }
    const m = this.mass;
    const g = this.zone ? this.zone.gravity : 0;
    const F = _v1.set(0, -g * m, 0);
    this.thrustLocal.copy(ctrlForce);
    F.add(_v3.copy(ctrlForce).applyQuaternion(this.lquat));
    const T = _v2.copy(ctrlTorque);
    this.contactsLocal(F, T);
    const ax = F.x / m, ay = F.y / m, az = F.z / m;
    this.lvel.x += ax * dt; this.lvel.y += ay * dt; this.lvel.z += az * dt;
    this.lpos.addScaledVector(this.lvel, dt);
    // felt acceleration: everything but the plating... which is felt like weight
    this.accel.set(ax, ay + g, az).applyQuaternion(p.quat);
    this.integrateRotation(this.lang, this.lquat, T, dt);
    this.syncFromParent();
    this.accelW.copy(p.accelW);
    this.zoneEnv();
  }

  // Legs and hull probes against the host's colliders (host coordinates)
  contactsLocal(F, T) {
    const p = this.parent;
    const boxes = p.type.colliders;
    const q = this.lquat, qi = _fq2.copy(q).invert();
    let minAgl = Infinity;
    this.groundContact = false;
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
    if (this.legAttach && this.gear > 0.3) {
      const gearLen = this.legLength * this.gear;
      for (let i = 0; i < 4; i++) {
        const foot = this._foot3 || (this._foot3 = new THREE.Vector3());
        foot.copy(this.legAttach[i]); foot.y -= gearLen;
        const d = visit(foot, 6.0e5, 1.3e5, 0.9, true, i);
        this.legState[i] = d > 0 ? 1 : 0;
      }
    } else for (let i = 0; i < 4; i++) { this.legState[i] = 0; this.legComp[i] = 0; }
    const pt = this._hp3 || (this._hp3 = new THREE.Vector3());
    for (const pr of this.type.probes) { pt.set(pr[0], pr[1], pr[2]); visit(pt, 5e6, 9e5, 0.5, false); }
    this.agl = minAgl;
  }

  // Settled on the host's deck: dock
  tryLandLocal(dt) {
    if (this.attached || this.dead || !this.type.legs) return;
    const legs = this.legState[0] + this.legState[1] + this.legState[2] + this.legState[3];
    const quiet = this.ctrl.fwd === 0 && this.ctrl.lift <= 0 && this.ctrl.strafe === 0 && Math.abs(this.thrustLocal.y) < this.mass * G0 * 0.35;
    if (legs >= 3 && this.lvel.length() < 0.3 && this.lang.length() < 0.06 && quiet) this.idleTime += dt; else this.idleTime = 0;
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
    if (speed > 22) { this.destroy(`Hull breach on impact at ${speed.toFixed(0)} m/s`); return; }
    if (now - this.lastImpact < 0.25) return;
    this.lastImpact = now;
    const dmg = Math.max(0, speed - 3.5) * Math.max(0, speed - 3.5) * 0.004;
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
  environment(dt) {
    const env = this.env;
    const P = env.pressure;
    const rating = this.hullRating;
    if (P > rating * 0.8) {
      const over = P / rating - 0.8;
      this.hull = Math.max(0, this.hull - over * over * dt * 0.6);
      if (P > rating * 1.25 || this.hull <= 0) this.destroy(`Crushed at ${P.toFixed(0)} bar (${this.body.data.name})`);
    }
    // hull temperature: radiative balance with ambient + aerodynamic heating
    const Tamb = env.temperature || 3;
    const heating = (this.heatFlux || 0) / 900; // K/s per (W/m^2 / 900)
    this.hullTemp += (heating - (this.hullTemp - Tamb) * 0.08) * dt;
    if (env.density === 0) this.hullTemp += (290 - this.hullTemp) * 0.02 * dt;
    if (this.hullTemp > 1900) {
      this.hull = Math.max(0, this.hull - (this.hullTemp - 1900) / 400 * dt * 0.1);
      if (this.hull <= 0) this.destroy('Hull burned through');
    }
  }

  // Whether the ship can rest landed (all legs planted, nearly stationary)
  tryLand(dt) {
    if (this.landed || this.dead || !this.body.solid || !this.type.legs) return;
    const legs = this.legState[0] + this.legState[1] + this.legState[2] + this.legState[3];
    const sv = this.surfaceVel(_v1).length();
    // spin relative to the rotating surface
    const spin = _v2.copy(this.body.omega).applyQuaternion(_q1.copy(this.quat).invert()).sub(this.angVel).length();
    const quiet = this.ctrl.fwd === 0 && this.ctrl.lift <= 0 && this.ctrl.strafe === 0 && Math.abs(this.thrustLocal.y) < this.mass * G0 * 0.35;
    if (legs >= 3 && sv < 0.3 && spin < 0.06 && quiet) this.idleTime += dt; else this.idleTime = 0;
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
