// Limited FTL: a warp-bubble cruise drive (one per vessel).
//
// Limits (what makes it "limited"):
//   - mass lock: cannot spool within ~half a radius (or 2.5 atmosphere
//     heights) of any body's surface or 2 km of a big ship, nor along a path
//     that crosses another body's lock on the way to the target; steering
//     into one during cruise forces an emergency drop
//   - speed is capped by distance to the nearest gravity well (v <= k * d),
//     so approaches decelerate exponentially, and globally at 100 c
//   - spool-up and cooldown times grow with the ship's size
// Inside the bubble the ship's Newtonian state is suspended; on dropping out
// it is given a circular orbit around the local dominant body, prograde along
// the direction of travel, or, when the target is a ship, that ship's
// velocity at a 6 km stand-off.

import * as THREE from 'three';
import { C_LIGHT } from '../core/units.js';

const K_SPEED = 0.9;       // 1/s: v_max = K * distance-to-surface
const V_CAP = 100 * C_LIGHT;
const VESSEL_DROP = 6000;  // m: stand-off from a target ship
const VESSEL_LOCK = 2000;  // m beyond a big ship's radius

const _v = new THREE.Vector3(), _w = new THREE.Vector3(), _t = new THREE.Vector3();

export function lockRadius(b) {
  if (b.isStar) return b.R * 5;
  return b.R + Math.max(b.atmHeight * 2.5, b.R * 0.5, 30000);
}

export class FTL {
  constructor(game, ship) {
    this.game = game;
    this.ship = ship;
    this.state = 'idle';
    this.timer = 0;
    this.speed = 0;
    this.throttle = 1;
    this.effect = 0; // 0..1 visual intensity
    this.spoolTime = ship.big ? 15 : 5;
    this.coolTime = ship.big ? 40 : 12;
    // the nav computer steers the drive at its own aim instead of the
    // selected target: a body, a ship, or null for a waypoint in open space
    // (then legLimit: how far along the nose the leg goes)
    this.nav = null; // { aim, legLimit }
  }

  // where the drive points: the nav computer's aim, else its pilot's target
  get aim() { return this.nav ? this.nav.aim : (this.ship.pilot ? this.ship.pilot.target : this.game.target); }

  // the drive's messages are for whoever is aboard
  say(text, kind) {
    for (const p of this.game.aboardOf(this.ship)) p.ui.hud.message(text, kind);
  }

  // the nearest lock: a body's sphere, or a big ship's
  massLock() {
    const g = this.game;
    const wp = this.ship.getWorldPos(_v);
    let worst = null;
    for (const b of g.universe.bodies) {
      const d = b.pos.distanceTo(wp);
      const lr = lockRadius(b);
      if (d < lr && (!worst || d / lr < worst.ratio)) worst = { body: b, dist: d, lock: lr, ratio: d / lr };
    }
    for (const v of g.vessels) {
      if (!v.big || v === this.ship || v.dead || v.root === this.ship.root) continue;
      const d = v.getWorldPos(_w).distanceTo(wp);
      const lr = v.type.radius + VESSEL_LOCK;
      if (d < lr && (!worst || d / lr < worst.ratio)) worst = { body: v.target, dist: d, lock: lr, ratio: d / lr };
    }
    return worst;
  }

  // distance from the ship to the nearest body surface (any body)
  nearestSurface() {
    const wp = this.ship.getWorldPos(_v);
    let best = Infinity, body = null;
    for (const b of this.game.universe.bodies) {
      const d = b.pos.distanceTo(wp) - b.R;
      if (d < best) { best = d; body = b; }
    }
    return { dist: best, body };
  }

  // First body whose mass-lock sphere the straight path along the nose would
  // enter before reaching the selected target (where dropping is the point).
  // Returns the obstructing body or null.
  pathObstruction() {
    const g = this.game;
    const P = this.ship.getWorldPos(_v);
    const D = _w.set(0, 0, -1).applyQuaternion(this.ship.quat);
    let first = null, firstT = Infinity;
    let targetT = Infinity;
    const aim = this.aim;
    if (aim && aim.isVessel) targetT = Math.max(0, _t.copy(aim.pos).sub(P).dot(D) - VESSEL_DROP);
    if (this.nav && this.nav.legLimit) targetT = Math.min(targetT, this.nav.legLimit);
    for (const b of g.universe.bodies) {
      const L = lockRadius(b);
      const cx = b.pos.x - P.x, cy = b.pos.y - P.y, cz = b.pos.z - P.z;
      const tc = cx * D.x + cy * D.y + cz * D.z;
      if (tc <= 0) continue;
      const d2 = cx * cx + cy * cy + cz * cz - tc * tc;
      if (d2 >= L * L) continue;
      const tEnter = tc - Math.sqrt(L * L - d2);
      if (tEnter < firstT) { firstT = tEnter; first = b; }
    }
    if (!first || first === aim || firstT > targetT) return null;
    if (!aim && !(this.nav && this.nav.legLimit)) return null;
    return first;
  }

  toggle() {
    const g = this.game;
    if (this.ship.type.ftl === false) { this.say(`A ${this.ship.type.className.toLowerCase()} has no FTL drive`, 'caution'); return; }
    if (this.state === 'cruise') { this.drop(false); return; }
    if (this.state === 'spool') { this.state = 'idle'; this.say('FTL spool aborted'); return; }
    if (this.state === 'cooldown') { this.say(`FTL drive cooling (${this.timer.toFixed(0)} s)`, 'caution'); return; }
    if (this.ship.landed) { this.say('FTL unavailable while landed', 'caution'); return; }
    if (this.ship.parent) { this.say(`FTL unavailable aboard ${this.ship.parent.name}`, 'caution'); return; }
    const lock = this.massLock();
    if (lock) {
      const left = lock.lock - lock.dist;
      this.say(`Mass locked by ${lock.body.data.name}: clear ${(left / 1000).toFixed(left < 10000 ? 1 : 0)} km`, 'caution');
      return;
    }
    const obs = this.pathObstruction();
    if (obs) { this.say(`FTL path obstructed by ${obs.data.name}: steer clear of its mass lock`, 'caution'); return; }
    this.state = 'spool';
    this.timer = this.spoolTime;
    g.setWarp(0);
    this.say('FTL drive spooling', 'nav');
  }

  update(dt) {
    const g = this.game;
    const ship = this.ship;
    if (ship.dead) { this.state = 'idle'; this.effect = 0; return; }
    if (this.state === 'cooldown') {
      this.timer -= dt;
      if (this.timer <= 0) this.state = 'idle';
      this.effect = Math.max(0, this.effect - dt);
      return;
    }
    if (this.state === 'spool') {
      this.timer -= dt;
      this.effect = Math.min(0.3, this.effect + dt * 0.06);
      if (this.massLock()) { this.state = 'idle'; this.say('FTL spool interrupted: mass lock', 'caution'); return; }
      if (this.timer <= 0) {
        const obs = this.pathObstruction();
        if (obs) { this.state = 'idle'; this.say(`FTL aborted: path obstructed by ${obs.data.name}`, 'caution'); return; }
        this.state = 'cruise';
        this.speed = Math.max(2000, ship.vel.length());
        ship.rails = false;
        this.say('FTL engaged', 'nav');
      }
      return;
    }
    if (this.state !== 'cruise') { this.effect = Math.max(0, this.effect - dt); return; }
    // throttle
    const c = ship.ctrl;
    if (c.fwd > 0) this.throttle = Math.min(1, this.throttle + dt * 0.5);
    if (c.fwd < 0) this.throttle = Math.max(0.02, this.throttle - dt * 0.5);
    // speed limit from the nearest gravity well, and from a target ship
    const ns = this.nearestSurface();
    let vmax = Math.min(V_CAP, Math.max(1000, K_SPEED * ns.dist));
    const aim = this.aim;
    const tgt = aim && aim.isVessel && aim.v !== ship && !aim.v.dead ? aim : null;
    if (tgt) vmax = Math.min(vmax, Math.max(400, K_SPEED * (_t.copy(tgt.pos).distanceTo(ship.getWorldPos(_v)) - VESSEL_DROP)));
    // the nav computer: no faster than the rest of a waypoint leg allows, and
    // held back while the nose comes round onto its aim (big ships turn slowly)
    if (this.nav) {
      if (this.nav.legLimit) vmax = Math.min(vmax, Math.max(1000, K_SPEED * this.nav.legLimit));
      if (this.nav.align !== undefined) vmax = Math.max(1000, vmax * this.nav.align);
    }
    const target = vmax * this.throttle;
    // slowing takes effect at once (a lagging slow-down overshot the drop
    // point on the way in); speeding up builds
    if (target < this.speed) this.speed = target;
    else this.speed += (target - this.speed) * (1 - Math.exp(-dt * 0.7));
    this.vmax = vmax;
    this.effect = Math.min(1, Math.log10(Math.max(1, this.speed / 1e5)) / 4.5);
    // with a ship as the target the bubble co-moves with it: the approach
    // speed is relative to that ship, not to the planet it orbits
    if (tgt) ship.pos.addScaledVector(_t.copy(tgt.vel).sub(ship.body.vel), dt);
    // move, in small steps so lock boundaries are never jumped over
    const fwd = _w.set(0, 0, -1).applyQuaternion(ship.quat);
    const dir = new THREE.Vector3().copy(fwd);
    let remaining = this.speed * dt;
    let guard = 0;
    while (remaining > 0 && guard++ < 64) {
      const n = this.nearestSurface();
      const step = Math.min(remaining, Math.max(50, n.dist * 0.05));
      // arrive at a target ship's stand-off sphere
      if (tgt) {
        const tp = _t.copy(tgt.pos);
        const wp = ship.getWorldPos(_v);
        const d = tp.distanceTo(wp);
        if (d - step <= VESSEL_DROP) {
          ship.pos.addScaledVector(tp.sub(wp).normalize(), Math.max(0, d - VESSEL_DROP));
          ship.checkSOI();
          this.dropAtVessel(tgt.v);
          return;
        }
      }
      ship.pos.addScaledVector(dir, step);
      remaining -= step;
      ship.checkSOI();
      const lock = this.massLock();
      if (lock && !lock.body.isVessel) {
        // drop at the boundary
        const wp = ship.getWorldPos(_v);
        const out = wp.sub(lock.body.pos).setLength(lock.lock * 1.0005).add(lock.body.pos);
        ship.pos.copy(out).sub(ship.body.pos);
        // only a body other than the selected target interdicts violently
        const t = this.aim;
        this.drop(!!t && t !== lock.body, lock.body);
        return;
      }
    }
    // rotation is handled by the ship's attitude controller (ROT behaviour)
  }

  drop(emergency, nearBody) {
    const g = this.game;
    const ship = this.ship;
    ship.rails = false; // the coast epoch must start from the new state
    this.state = 'cooldown';
    this.timer = this.coolTime * (emergency ? 1.5 : 1);
    ship.checkSOI();
    const b = ship.body;
    // circular prograde orbit around the dominant body
    const r = ship.pos.length();
    const rhat = _v.copy(ship.pos).normalize();
    const fwd = _w.set(0, 0, -1).applyQuaternion(ship.quat);
    const tang = fwd.addScaledVector(rhat, -fwd.dot(rhat));
    if (tang.lengthSq() < 1e-6) tang.copy(rhat).cross(new THREE.Vector3(0, 1, 0));
    if (tang.lengthSq() < 1e-6) tang.copy(rhat).cross(new THREE.Vector3(1, 0, 0));
    tang.normalize();
    ship.vel.copy(tang).multiplyScalar(Math.sqrt(b.GM / r));
    ship.targetVel.copy(ship.vel);
    ship.targetFrame = 'inertial';
    ship.angVel.set(0, 0, 0);
    this.speed = 0;
    if (emergency) {
      ship.hull = Math.max(0.05, ship.hull - 0.04);
      this.say(`Emergency drop: gravity well of ${(nearBody || b).data.name}`, 'warn');
      g.flashFor(ship, 0.6, 0.7, 1.0);
    } else this.say(`Dropped out near ${b.data.name}`, 'nav');
  }

  // Arrive alongside a ship: its velocity, a 6 km stand-off, assist matched to it
  dropAtVessel(tv) {
    const g = this.game;
    const ship = this.ship;
    ship.rails = false;
    this.state = 'cooldown';
    this.timer = this.coolTime;
    if (ship.body !== tv.body) ship.changeBody(tv.body);
    tv.getWorldVel(ship.vel).sub(ship.body.vel);
    ship.angVel.set(0, 0, 0);
    ship.refVessel = tv;
    ship.targetVel.set(0, 0, 0);
    ship.targetFrame = 'vessel:' + tv.name;
    this.speed = 0;
    const km = tv.getWorldPos(_v).distanceTo(ship.getWorldPos(_w)) / 1000;
    this.say(`Dropped out alongside ${tv.name} · ${km.toFixed(1)} km`, 'nav');
  }
}
