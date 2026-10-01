// Limited FTL: a warp-bubble cruise drive.
//
// Limits (what makes it "limited"):
//   - mass lock: cannot spool within ~half a radius (or 2.5 atmosphere
//     heights) of any body's surface, nor along a path that crosses another
//     body's lock on the way to the target; steering into one during cruise
//     forces an emergency drop
//   - speed is capped by distance to the nearest gravity well (v <= k * d),
//     so approaches decelerate exponentially, and globally at 100 c
//   - 5 s spool-up, 12 s cooldown after dropping
// Inside the bubble the ship's Newtonian state is suspended; on dropping out
// it is given a circular orbit around the local dominant body, prograde along
// the direction of travel.

import * as THREE from 'three';
import { C_LIGHT } from '../core/units.js';

const K_SPEED = 0.9;       // 1/s: v_max = K * distance-to-surface
const V_CAP = 100 * C_LIGHT;
const SPOOL = 5;
const COOLDOWN = 12;

const _v = new THREE.Vector3(), _w = new THREE.Vector3();

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
  }

  massLock() {
    const g = this.game;
    const wp = this.ship.getWorldPos(_v);
    let worst = null;
    for (const b of g.universe.bodies) {
      const d = b.pos.distanceTo(wp);
      const lr = lockRadius(b);
      if (d < lr && (!worst || d / lr < worst.ratio)) worst = { body: b, dist: d, lock: lr, ratio: d / lr };
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
  // enter, unless that body is the selected target (where dropping is the
  // point). Returns the obstructing body or null.
  pathObstruction() {
    const g = this.game;
    const P = this.ship.getWorldPos(_v);
    const D = _w.set(0, 0, -1).applyQuaternion(this.ship.quat);
    let first = null, firstT = Infinity;
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
    return first && g.target && first !== g.target ? first : null;
  }

  toggle() {
    const g = this.game;
    if (this.state === 'cruise') { this.drop(false); return; }
    if (this.state === 'spool') { this.state = 'idle'; g.message('FTL spool aborted'); return; }
    if (this.state === 'cooldown') { g.message(`FTL drive cooling (${this.timer.toFixed(0)} s)`, 'caution'); return; }
    if (this.ship.landed) { g.message('FTL unavailable while landed', 'caution'); return; }
    const lock = this.massLock();
    if (lock) {
      g.message(`Mass locked by ${lock.body.data.name}: climb ${((lock.lock - lock.dist) / 1000).toFixed(0)} km`, 'caution');
      return;
    }
    const obs = this.pathObstruction();
    if (obs) { g.message(`FTL path obstructed by ${obs.data.name}: steer clear of its mass lock`, 'caution'); return; }
    this.state = 'spool';
    this.timer = SPOOL;
    g.setWarp(0);
    g.message('FTL drive spooling', 'nav');
  }

  update(dt) {
    const g = this.game;
    const ship = this.ship;
    if (this.state === 'cooldown') {
      this.timer -= dt;
      if (this.timer <= 0) this.state = 'idle';
      this.effect = Math.max(0, this.effect - dt);
      return;
    }
    if (this.state === 'spool') {
      this.timer -= dt;
      this.effect = Math.min(0.3, this.effect + dt * 0.06);
      if (this.massLock()) { this.state = 'idle'; g.message('FTL spool interrupted: mass lock', 'caution'); return; }
      if (this.timer <= 0) {
        const obs = this.pathObstruction();
        if (obs) { this.state = 'idle'; g.message(`FTL aborted: path obstructed by ${obs.data.name}`, 'caution'); return; }
        this.state = 'cruise';
        this.speed = Math.max(2000, ship.vel.length());
        ship.rails = false;
        g.message('FTL engaged', 'nav');
      }
      return;
    }
    if (this.state !== 'cruise') { this.effect = Math.max(0, this.effect - dt); return; }
    // throttle
    const c = ship.ctrl;
    if (c.fwd > 0) this.throttle = Math.min(1, this.throttle + dt * 0.5);
    if (c.fwd < 0) this.throttle = Math.max(0.02, this.throttle - dt * 0.5);
    // speed limit from the nearest gravity well
    const ns = this.nearestSurface();
    const vmax = Math.min(V_CAP, Math.max(1000, K_SPEED * ns.dist));
    const target = vmax * this.throttle;
    this.speed += (target - this.speed) * (1 - Math.exp(-dt * (target > this.speed ? 0.7 : 3.0)));
    this.vmax = vmax;
    this.effect = Math.min(1, Math.log10(Math.max(1, this.speed / 1e5)) / 4.5);
    // move, in small steps so lock boundaries are never jumped over
    const fwd = _w.set(0, 0, -1).applyQuaternion(ship.quat);
    let remaining = this.speed * dt;
    let guard = 0;
    while (remaining > 0 && guard++ < 64) {
      const n = this.nearestSurface();
      const step = Math.min(remaining, Math.max(50, n.dist * 0.05));
      ship.pos.addScaledVector(fwd, step);
      remaining -= step;
      ship.checkSOI();
      const lock = this.massLock();
      if (lock) {
        // drop at the boundary
        const wp = ship.getWorldPos(_v);
        const out = wp.sub(lock.body.pos).setLength(lock.lock * 1.0005).add(lock.body.pos);
        ship.pos.copy(out).sub(ship.body.pos);
        // only a body other than the selected target interdicts violently
        const tgt = g.target;
        this.drop(!!tgt && tgt !== lock.body, lock.body);
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
    this.timer = COOLDOWN * (emergency ? 1.5 : 1);
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
      g.message(`Emergency drop: gravity well of ${(nearBody || b).data.name}`, 'warn');
      g.engine.flash.set(0.6, 0.7, 1.0);
    } else g.message(`Dropped out near ${b.data.name}`, 'nav');
  }
}
