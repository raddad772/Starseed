// Spacecraft flight dynamics.
//
// State lives in the inertial frame of the dominant body (patched conics):
// position/velocity relative to its centre, orientation quaternion, body-frame
// angular velocity. Forces: point-mass gravity, thrusters (main fusion drive,
// retro, VTOL belly jets, lateral/down RCS), anisotropic aero drag + wing lift
// + weathervane torque relative to the co-rotating atmosphere (plus zonal winds
// on giants), landing-leg spring-dampers with Coulomb friction against the
// moving ground, and stiff hull probes for crashes.
//
// Flight assist:
//   OFF   pure Newtonian; inputs are raw thrust and torque
//   ROT   rotation damping; inputs command angular rates
//   FULL  ROT + velocity hold: inputs adjust a target velocity in the local
//         frame (surface-fixed inside the atmosphere, body-inertial outside);
//         with no input the computer hovers / holds course using only the
//         thrust the engines really have (heavy worlds can still win).
// Coasting outside the atmosphere is propagated analytically ("on rails"),
// so orbits never drift and high time warp is exact.

import * as THREE from 'three';
import { propagate, orbitInfo } from '../core/kepler.js';
import { HULL_PROBES } from '../render/shipModel.js';

const G0 = 9.81;
export const ASSIST_NAMES = ['OFF', 'ROT', 'FULL'];

const _v1 = new THREE.Vector3(), _v2 = new THREE.Vector3(), _v3 = new THREE.Vector3(), _v4 = new THREE.Vector3();
const _q1 = new THREE.Quaternion(), _q2 = new THREE.Quaternion();
const _gn = new THREE.Vector3();
const _att = new THREE.Vector3();
const _nose = new THREE.Vector3();
const _sa1 = new THREE.Vector3(), _sa2 = new THREE.Vector3(), _vs = new THREE.Vector3();
const AHEAD_N = 12; // terrain samples along the ground track

export class Ship {
  constructor(game) {
    this.game = game;
    this.u = game.universe;
    this.mass = 42000;
    // principal moments (kg m^2): long slender hull with wings
    this.I = new THREE.Vector3(2.6e6, 2.9e6, 0.55e6);
    // fusion torch transport: enough lift to hover in most giants' cloud decks
    this.limits = {
      main: 12.0 * G0 * this.mass, retro: 2.0 * G0 * this.mass,
      belly: 7.0 * G0 * this.mass, down: 1.2 * G0 * this.mass, lateral: 2.0 * G0 * this.mass,
      alpha: new THREE.Vector3(1.4, 1.1, 2.2), // max angular accel (rad/s^2) about x (pitch), y (yaw), z (roll)
      rate: new THREE.Vector3(1.1, 0.85, 1.7),  // ROT/FULL commanded rate limits
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
    this.assist = 2;
    this.gearTarget = 1; this.gear = 1;
    this.rampTarget = 0; this.ramp = 0;
    this.hull = 1;
    this.hullTemp = 290;
    this.heatGlow = 0;
    this.dead = false;
    this.deathCause = '';
    this.thrustLocal = new THREE.Vector3();   // applied thrust (N), ship-local
    this.thrustFrac = { main: 0, retro: 0, belly: 0, down: 0, lat: 0 };
    this.ctrl = { fwd: 0, strafe: 0, lift: 0, pitch: 0, yaw: 0, roll: 0, boost: false, precision: false, brake: false };
    this.stick = new THREE.Vector2();
    this.targetVel = new THREE.Vector3(); // FULL assist target (world axes, reference frame)
    this.targetFrame = 'surface';
    this.cruise = 0; this.slip = 0; this.climb = 0; // FULL assist (surface frame)
    this.legState = [0, 0, 0, 0];
    this.legComp = [0, 0, 0, 0];
    this.groundContact = false;
    this.idleTime = 0;
    this.agl = Infinity;
    this.env = { pressure: 0, density: 0, temperature: 3, airspeed: 0, mach: 0, dynPressure: 0, wind: new THREE.Vector3() };
    this.gLoad = 1;
    this.accel = new THREE.Vector3();
    this.lastImpact = 0;
    this.pilotPresent = false;
    this.legAttach = null;
    this.legLength = 1.75;
    this.ftl = null; // set by the FTL system
    this.hullRating = 100; // bar
  }

  get worldPos() { return _v4.copy(this.pos).add(this.body.pos); }
  getWorldPos(out) { return out.copy(this.pos).add(this.body.pos); }
  getWorldVel(out) { return out.copy(this.vel).add(this.body.vel); }
  get altitude() { return this.pos.length() - this.body.R; }

  setLegAttach(legs) {
    this.legAttach = legs.map((l) => l.attach.clone());
  }

  // Altitude below which time warp and rails must hand control back: terrain
  // clearance plus 1.5x the distance the belly thrusters need to stop the
  // present descent (at half power, net of gravity)
  safeAltitude() {
    const b = this.body;
    const clear = b.data.terrain ? b.data.terrain.relief * 1.6 + 2000 : 2000;
    if (!b.solid) return clear;
    const vDown = Math.max(0, -this.surfaceVel(_sa1).dot(_sa2.copy(this.pos).normalize()));
    const aStop = Math.max(0.5, 0.5 * this.maxUpAccel());
    return clear + vDown * vDown / (2 * aStop) * 1.5;
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
    const b = this.body;
    if (b.parent && this.pos.lengthSq() > b.soi * b.soi) { this.changeBody(b.parent); return true; }
    for (const c of b.children) {
      if (_v1.copy(this.pos).sub(c.relPos).lengthSq() < c.soi * c.soi) { this.changeBody(c); return true; }
    }
    return false;
  }

  enterRails() {
    this.rails = true;
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
  }

  // ------------------------------------------------------------------ controls -> forces

  wantsForce() {
    const c = this.ctrl;
    return c.fwd !== 0 || c.strafe !== 0 || c.lift !== 0 || c.brake || (this.assist === 2 && this.targetFrame !== 'coast');
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
      const tr = _v1.set(c.pitch * L.rate.x, c.yaw * L.rate.y, c.roll * L.rate.z).multiplyScalar(prec);
      // FULL assist near a surface holds attitude relative to the local
      // horizon, not the stars: add the rate at which the local-level frame
      // turns (planet spin plus the transport rate over the curved surface)
      if (this.assist === 2 && this.targetFrame === 'surface' && !this.landed) {
        const wLL = _sa2.copy(this.pos).cross(this.surfaceVel(_sa1)).divideScalar(this.pos.lengthSq()).add(this.body.omega);
        tr.add(wLL.applyQuaternion(_q2.copy(this.quat).invert()));
      }
      // FULL assist near a surface: auto-level the wings when not rolling
      if (this.assist === 2 && c.roll === 0 && this.targetFrame === 'surface' && !this.landed) {
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
      const tc = 0.18;
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
    if (this.landed && c.lift <= 0 && !c.fwd && !c.strafe) {
      this.cruise = this.slip = this.climb = 0;
      this.heatLimited = false;
      this.targetFrame = 'surface';
      return;
    }
    const b = this.body;
    const alt = this.pos.length() - b.R;
    const surfaceFrame = alt < Math.max(b.atmHeight * 1.3, 25000, b.R * 0.05);
    const frame = surfaceFrame ? 'surface' : 'inertial';
    const vRel = _v2;
    if (frame === 'surface') this.surfaceVel(vRel); else vRel.copy(this.vel);
    const qinv = _q1.copy(this.quat).invert();
    const approach = (x, target, rate) => x + THREE.MathUtils.clamp(target - x, -rate * dt, rate * dt);
    if (frame === 'surface') {
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
      const accH = (c.boost ? 4.0 : 1.4) * G0 * prec;
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
      const accCmd = (c.boost ? 5.0 : 1.8) * G0 * prec;
      if (c.fwd) this.targetVel.addScaledVector(fwdW, c.fwd * accCmd * dt * (c.fwd < 0 ? 0.8 : 1));
      if (c.strafe) this.targetVel.addScaledVector(_v4.set(1, 0, 0).applyQuaternion(this.quat), c.strafe * 1.0 * G0 * dt * prec);
      if (c.lift) this.targetVel.addScaledVector(_v4.set(0, 1, 0).applyQuaternion(this.quat), c.lift * 1.2 * G0 * dt * prec);
      if (c.brake) {
        const sp = this.targetVel.length();
        const dec = 2.5 * G0 * dt;
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
    const tau = 0.7;
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
      if (!lifting) { this.syncLanded(); this.thrustLocal.set(0, 0, 0); return; }
      this.landed = false;
      this.syncLanded();
    }
    const m = this.mass;
    const F = _v1.set(0, 0, 0);
    const T = _v2.set(0, 0, 0);
    const rn = this.pos.length();
    // gravity
    F.addScaledVector(this.pos, -b.GM * m / (rn * rn * rn));
    // thrust
    this.thrustLocal.copy(ctrlForce);
    F.add(_v3.copy(ctrlForce).applyQuaternion(this.quat));
    T.add(ctrlTorque);
    // aerodynamics
    const alt = rn - b.R;
    this.aero(alt, F, T);
    // contacts
    this.contacts(dt, F, T);
    // integrate translation (semi-implicit Euler)
    this.accel.copy(F).divideScalar(m);
    this.vel.addScaledVector(this.accel, dt);
    this.pos.addScaledVector(this.vel, dt);
    // rotation: Euler's equations in the body frame
    const w = this.angVel, I = this.I;
    const Iw = _v3.set(I.x * w.x, I.y * w.y, I.z * w.z);
    const gyro = _v4.copy(w).cross(Iw);
    w.x += (T.x - gyro.x) / I.x * dt;
    w.y += (T.y - gyro.y) / I.y * dt;
    w.z += (T.z - gyro.z) / I.z * dt;
    const wl = w.length();
    if (wl > 1e-9) {
      _q1.setFromAxisAngle(_v3.copy(w).divideScalar(wl), wl * dt);
      this.quat.multiply(_q1).normalize();
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
    if (vmag < 1e-3) { this._lastAero = null; return; }
    const qinv = _q1.copy(this.quat).invert();
    const vl = _v4.copy(vAir).applyQuaternion(qinv); // airspeed vector, ship-local
    // anisotropic drag: CdA per axis (front, side, top)
    const cdx = 62, cdy = 120, cdz = 7.5;
    const drag = _att.set(-cdx * vl.x * vmag, -cdy * vl.y * vmag, -cdz * vl.z * vmag).multiplyScalar(0.5 * rho);
    // wing lift in the y-z plane
    const vyz = Math.hypot(vl.y, vl.z);
    if (vyz > 1) {
      const alpha = Math.atan2(-vl.y, -vl.z); // >0: airflow from below the nose
      const cl = Math.abs(alpha) < 0.26 ? 2 * Math.PI * alpha * 0.9 : Math.sin(2 * alpha) * 1.1;
      const S = 48;
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
    const kStab = 9.0 * q, kDamp = 2.2e3 * Math.sqrt(q + 1);
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
    const reliefTop = b.data.terrain ? b.data.terrain.relief * 1.6 + 200 : 200;
    const alt0 = center.length() - b.R;
    if (alt0 > reliefTop + 60) {
      const pf0 = _v4.copy(center).applyQuaternion(qInvBody).normalize();
      this.agl = alt0 - b.groundHeight(pf0) - 2.5;
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
      if (r - b.R > relief) { minAgl = Math.min(minAgl, r - b.R - relief * 0.5); return 0; }
      const gh = b.groundHeight(pf);
      const depth = b.R + gh - r;
      minAgl = Math.min(minAgl, -depth);
      if (depth <= 0) return 0;
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
    for (const p of HULL_PROBES) { pt.set(p[0], p[1], p[2]); probe(pt, 5e6, 9e5, 0.5, false); }
    this.agl = minAgl;
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
    if (this.landed || this.dead || !this.body.solid) return;
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
