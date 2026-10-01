// First-person character: pilot seat, walking inside the ship (artificial
// gravity), walking/jetpacking on any surface, and EVA in space.
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

const _v1 = new THREE.Vector3(), _v2 = new THREE.Vector3(), _v3 = new THREE.Vector3(), _v4 = new THREE.Vector3();
const _q1 = new THREE.Quaternion(), _q2 = new THREE.Quaternion();
const _m4 = new THREE.Matrix4();

function lookQuat(up, heading, pitch, out) {
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
    this.env = { pressure: 0, temperature: 290, gravity: 0 };
  }

  get ship() { return this.game.ship; }

  // ------------------------------------------------------------------ frames

  shipFixedPose(outPos, outQuat) {
    // ship pose in its body's fixed frame
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

  sitDown(seat = 0) {
    this.mode = 'seat';
    this.headYaw = 0; this.headPitch = 0;
    this.ship.pilotPresent = true;
    this.game.onModeChange && this.game.onModeChange('seat');
  }

  standUp() {
    this.mode = 'ship';
    this.ship.pilotPresent = false;
    this.sPos.set(-0.75 + 0.75, 0.25, -8.4);
    this.sVel.set(0, 0, 0);
    this.heading.set(0, 0, 1);
    this.pitch = -0.1;
    this.game.onModeChange && this.game.onModeChange('ship');
  }

  // ------------------------------------------------------------------ update

  update(dt, input, mouse) {
    this.prompt = null;
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
    if (input.hit('KeyF')) this.standUp();
  }

  updateShip(dt, input, mouse) {
    const up = _v4.set(0, 1, 0);
    this.lookUpdate(up, mouse);
    const ship = this.ship;
    // movement in ship-local horizontal plane
    const fwd = this.heading.clone(), right = fwd.clone().cross(up).normalize();
    const wish = new THREE.Vector3().addScaledVector(fwd, input.axis('KeyS', 'KeyW')).addScaledVector(right, input.axis('KeyA', 'KeyD'));
    if (wish.lengthSq() > 0) wish.normalize().multiplyScalar(input.down('ShiftLeft') ? SPRINT * 0.7 : WALK);
    const g = 9.81; // artificial gravity plating
    if (this.grounded) {
      const dv = wish.clone().sub(_v1.set(this.sVel.x, 0, this.sVel.z));
      const maxDv = 40 * dt;
      if (dv.length() > maxDv) dv.setLength(maxDv);
      this.sVel.x += dv.x; this.sVel.z += dv.z;
      if (input.hit('Space')) { this.sVel.y = 3.2; this.grounded = false; }
    } else this.sVel.y -= g * dt;
    this.sPos.addScaledVector(this.sVel, dt);
    // floor
    const floorY = this.shipFloorAt(this.sPos.x, this.sPos.z);
    if (this.sPos.y <= floorY + 0.001 || (this.grounded && this.sPos.y - floorY < 0.35)) {
      this.sPos.y = floorY; this.sVel.y = Math.max(0, this.sVel.y); this.grounded = true;
    } else if (this.sPos.y > floorY + 0.05) this.grounded = false;
    // ceiling
    if (this.sPos.y + 1.8 > 2.5 && this.sPos.z < 7.15) { this.sPos.y = Math.min(this.sPos.y, 0.7); if (this.sVel.y > 0) this.sVel.y = 0; }
    this.confineToShip();
    this.bobUpdate(dt, Math.hypot(this.sVel.x, this.sVel.z));
    // interactions
    const seat = SHIP_INTERIOR.seatPos[0];
    const dSeat = Math.hypot(this.sPos.x - seat.x, this.sPos.z - seat.z);
    const nearRampCtl = Math.abs(this.sPos.z - 6.4) < 1.6 && this.sPos.z < 7.4;
    if (dSeat < 1.3) {
      this.prompt = { key: 'F', text: 'Take the pilot seat' };
      if (input.hit('KeyF')) this.sitDown(0);
    } else if (nearRampCtl) {
      this.prompt = { key: 'F', text: ship.rampTarget > 0.5 ? 'Close ramp' : 'Lower ramp' };
      if (input.hit('KeyF')) this.game.toggleRamp();
    }
    // leaving down the ramp
    const rampEndZ = SHIP_INTERIOR.rampHinge.z + SHIP_INTERIOR.rampLength * Math.cos(this.rampAngle()) - 0.2;
    if (this.sPos.z > rampEndZ && ship.ramp > 0.9) this.exitShip();
    // ship destroyed with us inside
  }

  rampAngle() {
    const s = this.ship;
    const t = s.ramp;
    return SHIP_INTERIOR.rampClosed + (SHIP_INTERIOR.rampOpen - SHIP_INTERIOR.rampClosed) * t;
  }

  shipFloorAt(x, z) {
    const h = SHIP_INTERIOR.rampHinge;
    if (z > h.z && Math.abs(x) < SHIP_INTERIOR.rampWidth + 0.1) {
      const a = this.rampAngle();
      return -(z - h.z) * Math.tan(Math.max(a, 0));
    }
    if (z < -6.95) return 0.25;
    return 0;
  }

  confineToShip() {
    const p = this.sPos;
    const I = SHIP_INTERIOR;
    const ship = this.ship;
    const rampOpen = ship.ramp > 0.85;
    const rampMaxZ = I.rampHinge.z + I.rampLength * Math.cos(this.rampAngle()) + 0.5;
    // allowed regions: cabin, cockpit, ramp (when open)
    let inside = false;
    for (const c of I.cells) {
      if (p.x >= c.min[0] + RADIUS - 0.01 && p.x <= c.max[0] - RADIUS + 0.01 && p.z >= c.min[2] + RADIUS - 0.01 && p.z <= c.max[2] - (c.max[2] > 7 ? 0 : RADIUS) + 0.01) inside = true;
    }
    if (rampOpen && p.z >= I.rampHinge.z - 0.3 && p.z <= rampMaxZ && Math.abs(p.x) <= I.rampWidth - RADIUS) inside = true;
    if (!inside) {
      // project to the nearest allowed point
      let best = null, bd = Infinity;
      const cand = (x, z) => { const d = (x - p.x) ** 2 + (z - p.z) ** 2; if (d < bd) { bd = d; best = [x, z]; } };
      for (const c of I.cells) {
        const maxZ = c.max[2] > 7 && rampOpen ? c.max[2] + 0.5 : c.max[2] - RADIUS;
        cand(THREE.MathUtils.clamp(p.x, c.min[0] + RADIUS, c.max[0] - RADIUS), THREE.MathUtils.clamp(p.z, c.min[2] + RADIUS, maxZ));
      }
      if (rampOpen) cand(THREE.MathUtils.clamp(p.x, -I.rampWidth + RADIUS, I.rampWidth - RADIUS), THREE.MathUtils.clamp(p.z, I.rampHinge.z - 0.3, rampMaxZ));
      if (best) {
        if (best[0] !== p.x) this.sVel.x = 0;
        if (best[1] !== p.z) this.sVel.z = 0;
        p.x = best[0]; p.z = best[1];
      }
    }
    // furniture
    for (const s of I.solids) {
      if (p.y + 1.7 < s.min[1] || p.y > s.max[1] - 0.25) continue;
      const ex = Math.max(s.min[0] - RADIUS - p.x, p.x - (s.max[0] + RADIUS), 0);
      const ez = Math.max(s.min[2] - RADIUS - p.z, p.z - (s.max[2] + RADIUS), 0);
      if (ex === 0 && ez === 0) {
        const dl = p.x - (s.min[0] - RADIUS), dr = (s.max[0] + RADIUS) - p.x;
        const df = p.z - (s.min[2] - RADIUS), db = (s.max[2] + RADIUS) - p.z;
        const m = Math.min(dl, dr, df, db);
        if (m === dl) p.x -= dl; else if (m === dr) p.x += dr; else if (m === df) p.z -= df; else p.z += db;
      }
    }
  }

  exitShip() {
    const ship = this.ship;
    const b = ship.body;
    // world (body-centred inertial) state of the player
    const pW = _v1.copy(this.sPos).applyQuaternion(ship.quat).add(ship.pos);
    const vLocal = _v2.copy(ship.angVel).cross(this.sPos).add(this.sVel);
    const vW = _v3.copy(vLocal).applyQuaternion(ship.quat).add(ship.vel);
    const headW = this.heading.clone().applyQuaternion(ship.quat);
    const alt = pW.length() - b.R;
    if (b.solid && alt < 4000) {
      this.mode = 'surface';
      this.body = b;
      this.fPos.copy(pW).applyQuaternion(b.qInv);
      // inertial -> rotating-frame velocity
      const vf = vW.clone().sub(_v4.copy(b.omega).cross(pW)).applyQuaternion(b.qInv);
      this.fVel.copy(vf);
      this.heading.copy(headW).applyQuaternion(b.qInv);
      this.grounded = false;
    } else {
      this.mode = 'eva';
      this.body = b;
      this.ePos.copy(pW);
      this.eVel.copy(vW);
      lookQuat(_v4.set(0, 1, 0).applyQuaternion(ship.quat), headW, this.pitch, this.evaQuat);
    }
    this.game.onModeChange && this.game.onModeChange(this.mode);
  }

  enterShip(sLocal, vLocal, headingLocal) {
    this.mode = 'ship';
    this.sPos.copy(sLocal);
    this.sVel.copy(vLocal);
    this.heading.copy(headingLocal).setY(0);
    if (this.heading.lengthSq() < 1e-6) this.heading.set(0, 0, -1);
    this.heading.normalize();
    this.grounded = false;
    this.game.onModeChange && this.game.onModeChange('ship');
  }

  // Is a ship-local point within the boardable volume (interior or open ramp)?
  boardable(p) {
    const I = SHIP_INTERIOR;
    const ship = this.ship;
    if (ship.ramp > 0.85) {
      const a = this.rampAngle();
      const endZ = I.rampHinge.z + I.rampLength * Math.cos(a);
      if (p.z > I.rampHinge.z - 0.2 && p.z < endZ - 0.3 && Math.abs(p.x) < I.rampWidth - 0.2) {
        const floor = this.shipFloorAt(p.x, p.z);
        if (p.y > floor - 0.6 && p.y < floor + 1.2) return true;
      }
      if (p.z > 5 && p.z < 7.2 && Math.abs(p.x) < 1.8 && p.y > -0.3 && p.y < 2.2) return true;
    }
    return false;
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
    if (ship && ship.body === b && !ship.dead) {
      const sp = new THREE.Vector3(), sq = new THREE.Quaternion();
      this.shipFixedPose(sp, sq);
      const local = this.fPos.clone().sub(sp).applyQuaternion(sq.clone().invert());
      if (this.boardable(local)) {
        const vLocal = this.fVel.clone().applyQuaternion(sq.clone().invert());
        const hLocal = this.heading.clone().applyQuaternion(sq.clone().invert());
        this.enterShip(local, vLocal, hLocal);
        return;
      }
      const dist = local.length();
      if (dist < 16 && ship.ramp < 0.5) this.prompt = { key: 'F', text: 'Lower the ramp' };
      if (dist < 16 && input.hit('KeyF')) this.game.toggleRamp();
      else if (dist > 250 && ship.landed && input.hit('KeyB')) this.game.summonShip();
      if (dist > 250 && ship.landed) this.prompt = { key: 'B', text: 'Summon ship' };
    }
    // leave the surface regime when high up (switch to inertial EVA physics)
    if (this.fPos.length() - b.R > 6000) this.toEva();
  }

  // The lowered ramp is walkable ground: stand on it when inside its footprint
  rampSupport() {
    const ship = this.ship;
    if (!ship || ship.body !== this.body || ship.ramp < 0.85) return;
    const I = SHIP_INTERIOR;
    const sp = _v2, sq = _q1;
    this.shipFixedPose(sp, sq);
    const sqi = _q2.copy(sq).invert();
    const local = _v3.copy(this.fPos).sub(sp).applyQuaternion(sqi);
    const a = this.rampAngle();
    const endZ = I.rampHinge.z + I.rampLength * Math.cos(a);
    if (Math.abs(local.x) > I.rampWidth || local.z < I.rampHinge.z - 0.3 || local.z > endZ + 0.25) return;
    const floor = this.shipFloorAt(local.x, local.z);
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
    const ship = this.ship;
    if (!ship || ship.body !== this.body) return;
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
    // stabiliser: hold X to null velocity relative to the ship
    const ship = this.ship;
    if (input.down('KeyX') && ship && ship.body === b) {
      const rel = this.eVel.clone().sub(ship.vel);
      const dv = Math.min(rel.length(), EVA_ACCEL * dt);
      if (rel.length() > 1e-6) this.eVel.addScaledVector(rel.normalize(), -dv);
    }
    if (atm.density > 0) { const sp = this.eVel.length(); this.eVel.multiplyScalar(Math.max(0, 1 - 0.5 * atm.density * 0.6 * sp / 85 * dt)); }
    this.ePos.addScaledVector(this.eVel, dt);
    this.jetFuel = Math.min(1, this.jetFuel + dt / 60); // suit reserve slowly recharges
    // ship boarding / proximity
    if (ship && ship.body === b && !ship.dead) {
      const local = this.ePos.clone().sub(ship.pos).applyQuaternion(ship.quat.clone().invert());
      if (this.boardable(local)) {
        const vLocal = this.eVel.clone().sub(ship.vel).applyQuaternion(ship.quat.clone().invert());
        const hW = new THREE.Vector3(0, 0, -1).applyQuaternion(this.evaQuat);
        this.enterShip(local, vLocal, hW.applyQuaternion(ship.quat.clone().invert()));
        return;
      }
      if (local.length() < 30 && ship.ramp < 0.5) {
        this.prompt = { key: 'F', text: 'Open the airlock ramp' };
        if (input.hit('KeyF')) this.game.toggleRamp();
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
    const ship = this.ship;
    const bobY = Math.sin(this.bob * 2) * 0.035 - this.landImpact * 0.25;
    if (this.mode === 'seat' || this.mode === 'ship') {
      const local = this._camLocal || (this._camLocal = new THREE.Vector3());
      let lq;
      if (this.mode === 'seat') {
        // g-forces push the head around a little
        local.copy(SHIP_INTERIOR.pilotEye);
        const a = ship.accel.clone().applyQuaternion(ship.quat.clone().invert()).multiplyScalar(-0.004);
        local.add(a.clampLength(0, 0.08));
        lq = _q2.setFromEuler(new THREE.Euler(this.headPitch, this.headYaw, 0, 'YXZ'));
      } else {
        local.copy(this.sPos); local.y += EYE + bobY;
        lq = lookQuat(_v4.set(0, 1, 0), this.heading, this.pitch, _q2);
      }
      outPos.copy(local).applyQuaternion(ship.quat).add(ship.pos).add(ship.body.pos);
      outQuat.copy(ship.quat).multiply(lq);
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
    const ship = this.ship;
    if (this.mode === 'seat' || this.mode === 'ship') return out.copy(this.sPos).applyQuaternion(ship.quat).add(ship.pos).add(ship.body.pos);
    if (this.mode === 'surface') return out.copy(this.fPos).applyQuaternion(this.body.q).add(this.body.pos);
    return out.copy(this.ePos).add(this.body.pos);
  }

  currentBody() { return (this.mode === 'seat' || this.mode === 'ship') ? this.ship.body : this.body; }
}
