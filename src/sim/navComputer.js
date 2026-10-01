// Navigation computer: flies your ship to the selected target, door to door.
//
// A trip is a chain of phases. Each frame the active phase steers the ship
// through `ship.auto` (a velocity, an attitude, lift-off / touchdown flags);
// the ship's own flight controller tracks it, with its ground guard and
// touchdown logic still in charge of safety.
//   depart    off the pad, out of the hangar door, or up off the ground
//   climb     straight up out of the world's FTL mass lock (heat-limited in air)
//   align / spool / cruise
//             FTL legs: waypoints around any mass lock in the way, then the
//             destination (a ship: drop 6 km off, matched to it; a world:
//             drop at its lock boundary above the landing site)
//   descend   powered descent to the site; `hop` is the same, low and level,
//             to a site on the world you are already on
//   land      hover over the site and settle on the legs
//   approach  waypoints around a big ship to its pad or hangar door
//   dock      settle on the pad / hangar deck in the host's own frame
// Any flight input hands control back to the pilot.

import * as THREE from 'three';
import { lockRadius } from './ftl.js';

const G0 = 9.81;
const A_CMD = 2.5 * G0;      // commanded acceleration (crew comfort; the engines can do far more)
const TAU = 0.7;             // the FULL assist velocity loop's time constant (s)
const V_SPACE = 2500;        // m/s: top speed near a world outside FTL
const H_HOVER = 40;          // m over the site where the final settle begins
const GLIDE = 0.3;           // descent path: height per metre still to go
const HOP_MAX = 1.2e6;       // m: farther than this along the ground, go by space instead

const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _d = new THREE.Vector3();
const _q = new THREE.Quaternion();

// stagnation-heating speed limit at an air density (as the FULL assist's limiter)
function heatSpeed(rho) {
  return rho > 1e-7 ? Math.cbrt(9e4 / (1.7415e-4 * Math.sqrt(rho / 1.5))) : Infinity;
}

const PHASE_NAMES = {
  depart: 'Departing', climb: 'Climbing out of the mass lock', align: 'Aligning for FTL', spool: 'FTL spooling',
  cruise: 'FTL cruise', descend: 'Descent', hop: 'Low flight', land: 'Landing', approach: 'Approach', dock: 'Docking',
};

export class NavComputer {
  constructor(game, ship) {
    this.game = game;
    this.ship = ship;
    this.active = false;
    this.phase = null;
    this.dest = null;
    this.legs = [];
    this.sites = new Map();   // body id -> chosen landing site { dirF, label } (or 'orbit')
    this.nose = new THREE.Vector3(); this.up = new THREE.Vector3();
    this.lnose = new THREE.Vector3(); this.lup = new THREE.Vector3(); this.lvel = new THREE.Vector3();
    this.aimPos = new THREE.Vector3(); // the point being flown to (HUD marker)
    this._lu = new THREE.Vector3(); this._lh = new THREE.Vector3(); this._va = new THREE.Vector3(); this._vb = new THREE.Vector3();
    this.aimLabel = '';
  }

  // ------------------------------------------------------------ destination

  // where a target means going: a ship's pad or hangar, a site on a world,
  // or an orbit (gas giants, or a world with "stay in orbit" chosen)
  destinationFor(t) {
    const g = this.game;
    if (!t) return null;
    if (t.isVessel) return t.v.big && t.v.type.zones ? { kind: 'vessel', v: t.v, name: t.v.name } : null;
    if (t.isStar) return null;
    if (!t.solid || this.sites.get(t.id) === 'orbit') return { kind: 'orbit', body: t, name: t.data.name };
    const dest = { kind: 'site', body: t, name: t.data.name, dirF: null, label: '' };
    const chosen = this.sites.get(t.id);
    if (chosen) { dest.dirF = chosen.dirF.clone(); dest.label = chosen.label; }
    else if (t === g.startBody && g.startDir) { dest.dirF = g.startDir.clone(); dest.label = 'the landing site'; }
    else {
      // the survey's best site (it may still be running: the trip starts anyway)
      g.requestSurvey(t, 85).then((res) => {
        if (dest.dirF) return;
        const s = res && (res.sites[0] || (res.spots && res.spots[0]));
        if (s) { dest.dirF = new THREE.Vector3(...s.dir); dest.label = s.label ? s.label.toLowerCase() : `the best site (${s.biome})`; }
      });
    }
    return dest;
  }

  // pick where on a world the computer lands (null: the default; 'orbit': none)
  chooseSite(body, site) {
    if (site) this.sites.set(body.id, site); else this.sites.delete(body.id);
    if (this.active && this.dest && this.dest.body === body) {
      const d = this.destinationFor(body);
      if (d) this.dest = d;
      if (this.phase === 'cruise' || this.phase === 'align') this.legs = this.plan();
    }
  }

  // ------------------------------------------------------------ engage

  toggle() { if (this.active) this.disengage('Nav computer off'); else this.engage(); }

  engage() {
    const g = this.game, s = this.ship, p = g.player;
    if (s.dead) return;
    if (!(p.aboard && p.vessel === s)) { g.message('Nav computer: board your ship first', 'caution'); return; }
    const dest = this.destinationFor(g.target);
    if (!dest) { g.message(g.target ? `Nav computer: can't fly to ${g.target.data.name}` : 'Nav computer: pick a destination first (Tab, T, the map or the quick menu)', 'caution'); return; }
    if (dest.kind === 'vessel' && (s.parent === dest.v && s.attached)) { g.message(`Nav computer: already aboard ${dest.v.name}`, 'caution'); return; }
    this.dest = dest;
    this.active = true;
    this.legs = [];
    this.phase = 'depart';
    this.phaseT = 0;
    this.appr = null;
    s.assist = 2;
    g.message(`Nav computer engaged: ${this.destText()} · any flight input takes over`, 'nav');
  }

  disengage(why, kind = 'caution') {
    const s = this.ship;
    if (!this.active) return;
    this.active = false;
    this.phase = null;
    s.auto = null;
    s.targetFrame = 'none'; // the pilot's assist re-bases on the present motion
    if (s.ftl.nav) s.ftl.nav = null;
    if (why) this.game.message(why, kind);
  }

  destText() {
    const d = this.dest;
    if (!d) return '';
    if (d.kind === 'vessel') return d.name;
    if (d.kind === 'orbit') return `orbit of ${d.name}`;
    return `${d.name}${d.label ? ', ' + d.label : ''}`;
  }

  // ------------------------------------------------------------ status (HUD)

  status() {
    if (!this.active) return null;
    let eta = 0;
    const s = this.ship;
    const ph = this.phase;
    const legsLeft = this.legs.length || (['depart', 'climb'].includes(ph) && this.needsFtl() ? 1 : 0);
    if (ph === 'depart') eta += 25;
    if (ph === 'climb' || ph === 'depart') {
      const b = s.body;
      if (this.needsFtl()) eta += Math.max(0, lockRadius(b) * 1.03 - s.pos.length()) / 1500 + 30;
    }
    eta += legsLeft * 28;
    if (this.dest.kind === 'site' && ph !== 'land') eta += ph === 'descend' || ph === 'hop' ? this.descentEta() : 150;
    if (this.dest.kind === 'vessel') eta += ph === 'approach' || ph === 'dock' ? 40 : 120;
    return { phase: PHASE_NAMES[ph] || ph, dest: this.destText(), eta, aim: this.aimLabel ? this.aimPos : null, aimLabel: this.aimLabel };
  }

  descentEta() {
    const s = this.ship, d = this.dest;
    if (!d.dirF || s.body !== d.body) return 150;
    const up = _a.copy(s.pos).normalize();
    const site = _b.copy(d.dirF).applyQuaternion(d.body.q);
    const sH = Math.acos(THREE.MathUtils.clamp(up.dot(site), -1, 1)) * d.body.R;
    const h = s.pos.length() - d.body.R;
    return sH / 1200 + h / 600 + 30;
  }

  needsFtl() {
    const d = this.dest, s = this.ship;
    if (d.kind === 'site' && d.body === s.body && this.hopDistance() < HOP_MAX && s.pos.length() < lockRadius(s.body)) return false;
    return true;
  }

  hopDistance() {
    const d = this.dest, s = this.ship;
    if (!d.dirF) return Infinity;
    const up = _a.copy(s.pos).normalize();
    const site = _b.copy(d.dirF).applyQuaternion(d.body.q);
    return Math.acos(THREE.MathUtils.clamp(up.dot(site), -1, 1)) * d.body.R;
  }

  // ------------------------------------------------------------ each frame

  update(dt) {
    const g = this.game, s = this.ship, p = g.player;
    if (!this.active) { if (s.auto) s.auto = null; return; }
    if (s.dead) { this.disengage(null); return; }
    if (!(p.aboard && p.vessel === s)) { this.disengage('Nav computer off: you left the ship'); return; }
    if (this.dest.kind === 'vessel' && this.dest.v.dead) { this.disengage(`Nav computer off: ${this.dest.name} is gone`); return; }
    if (g.warpIndex > 2 && this.phase !== 'cruise') g.setWarp(2); // powered flight: physics steps only
    s.assist = 2;
    const A = s.auto || (s.auto = {});
    A.vel = A.vel || new THREE.Vector3();
    A.nose = A.up = A.lvel = A.lnose = A.lup = null;
    A.move = A.land = false;
    this.aimLabel = '';
    this.phaseT += dt;
    const fn = this[this.phase];
    if (fn) fn.call(this, A, dt);
    if (this.active && !s.parent && s.ftl.state !== 'cruise') this.avoidHazards(A);
  }

  // Safety net under every command: if the commanded velocity would carry the
  // ship into a world, the star or another big ship within the stopping
  // horizon, the part of it heading into that thing is taken away (the ship
  // slides around it). The world being landed on is the descent's and the
  // ground guard's business; the ship being docked with, the approach's.
  avoidHazards(A) {
    const s = this.ship, g = this.game, d = this.dest;
    const wp = s.getWorldPos(this._vh1 || (this._vh1 = new THREE.Vector3()));
    const vW = this._vh2 || (this._vh2 = new THREE.Vector3());
    const landing = this.phase === 'descend' || this.phase === 'hop' || this.phase === 'land';
    const consider = (pos, vel, R) => {
      vW.copy(A.vel).add(s.body.vel).sub(vel); // our velocity relative to it
      const c = _a.copy(pos).sub(wp);
      const dist = c.length();
      const toward = vW.dot(c) / dist;
      if (toward <= 0) return;
      const T = Math.max(15, vW.length() / (A_CMD * 0.8));
      const t = Math.min(T, vW.dot(c) / vW.lengthSq());
      const miss = _b.copy(c).addScaledVector(vW, -t).length();
      if (miss < R || dist - toward * T < R) A.vel.addScaledVector(c, -toward / dist);
    };
    for (const X of g.universe.bodies) {
      if (landing && X === d.body) continue;
      const R = X.isStar ? X.R * 3 : (X.solid ? X.R + (X.data.terrain ? X.data.terrain.relief * 1.6 : 0) + 1500 : X.R + (X.atmHeight || 0) * 0.6);
      consider(X.pos, X.vel, R);
    }
    for (const h of g.vessels) {
      if (!h.big || h.dead || h === s || h.body !== s.body) continue;
      if (d.kind === 'vessel' && h === d.v && (this.phase === 'approach' || this.phase === 'dock')) continue;
      consider(h.getWorldPos(_c), h.getWorldVel(_d), h.type.radius + 80);
    }
  }

  go(phase) {
    this.phase = phase;
    this.phaseT = 0;
  }

  // velocity command toward an absolute (body-centred inertial) velocity, at
  // most A_CMD of acceleration away from the present one
  slew(A, vAbs) {
    const dv = _d.copy(vAbs).sub(this.ship.vel);
    const lim = A_CMD * TAU;
    if (dv.length() > lim) dv.setLength(lim);
    A.vel.copy(this.ship.vel).add(dv);
    return A.vel;
  }

  hold(A) { A.vel.copy(this.ship.vel); }

  // attitude: nose along dir, up as close to upHint as it allows
  point(A, dir, upHint) {
    const n = this.nose.copy(dir).normalize();
    const u = this.up.copy(upHint);
    u.addScaledVector(n, -u.dot(n));
    if (u.lengthSq() < 1e-6) { u.set(0, 1, 0).applyQuaternion(this.ship.quat); u.addScaledVector(n, -u.dot(n)); }
    if (u.lengthSq() < 1e-6) { u.set(1, 0, 0).applyQuaternion(this.ship.quat); u.addScaledVector(n, -u.dot(n)); }
    u.normalize();
    A.nose = n; A.up = u;
  }

  // level with the local horizon, nose along a horizontal heading (default:
  // the present one; with the nose straight up or down, where the belly faces)
  level(A, heading) {
    const s = this.ship;
    const up = this._lu.copy(s.pos).normalize();
    const h = this._lh;
    if (heading) h.copy(heading); else h.set(0, 0, -1).applyQuaternion(s.quat);
    h.addScaledVector(up, -h.dot(up));
    if (h.lengthSq() < 1e-6) { h.set(0, -1, 0).applyQuaternion(s.quat); h.addScaledVector(up, -h.dot(up)); }
    if (h.lengthSq() < 1e-6) h.set(1, 0, 0).addScaledVector(up, -up.x);
    this.point(A, h.normalize(), up);
  }

  aim(pos, label) { this.aimPos.copy(pos); this.aimLabel = label; }

  // ------------------------------------------------------------ phases

  depart(A) {
    const s = this.ship, g = this.game;
    if (s.parent) {
      // inside a big ship's pad or hangar zone: its deck frame
      const z = s.zone;
      A.move = true;
      this.lup.set(0, 1, 0);
      if (z.kind === 'pad') {
        this.lvel.set(-s.lvel.x * 0.5, 10, -s.lvel.z * 0.5);
        this.lnose.set(0, 0, -1).applyQuaternion(s.lquat).setY(0);
        if (this.lnose.lengthSq() < 1e-6) this.lnose.set(0, 0, -1);
      } else {
        // hangar: up off the deck, then out of the door (port side, -x)
        const zc = (z.door.z0 + z.door.z1) / 2;
        const exit = _a.set(z.min[0] - 40, 30, THREE.MathUtils.clamp(s.lpos.z, zc - 60, zc + 60));
        this.lnose.set(-1, 0, 0);
        if (s.lpos.y < 18 && Math.abs(s.lpos.x - exit.x) > 30) this.lvel.set(0, 5, 0);
        else this.lvel.copy(exit).sub(s.lpos).setLength(Math.min(18, exit.distanceTo(s.lpos) * 0.5 + 6));
      }
      A.lvel = this.lvel; A.lnose = this.lnose; A.lup = this.lup;
      return;
    }
    // close to a big ship: back off clear of its 2 km FTL lock
    for (const h of g.vessels) {
      if (!h.big || h.dead || h.body !== s.body) continue;
      const away = _a.copy(s.pos).sub(h.pos);
      const d = away.length();
      if (d < h.type.radius + 2600) {
        const vHost = h.pointVelocity(h.bodyToLocal(s.pos, _b), _c);
        this.slew(A, this._va.copy(away).setLength(Math.min(160, 30 + this.phaseT * 12)).add(vHost));
        this.point(A, away, this._vb.set(0, 1, 0).applyQuaternion(h.quat));
        return;
      }
    }
    // on (or just above) the ground: straight up to a safe height, gear up
    const b = s.body;
    if (b.solid && (s.landed || (isFinite(s.agl) && s.agl < 40))) {
      A.move = true;
      const up = _a.copy(s.pos).normalize();
      this.slew(A, _b.copy(up).multiplyScalar(8).add(s.frameVel(_c)));
      this.level(A, null);
      if (isFinite(s.agl) && s.agl > 25) s.gearTarget = 0;
      return;
    }
    s.gearTarget = 0;
    if (!this.needsFtl()) this.go('hop');
    else if (s.pos.length() < lockRadius(b) * 1.03 && s.ftl.massLock()) this.go('climb');
    else { this.legs = this.plan(); this.go('align'); }
  }

  climb(A) {
    const s = this.ship, b = s.body;
    const r = s.pos.length();
    const up = _a.copy(s.pos).divideScalar(r);
    const lock = s.ftl.massLock();
    if (r > lockRadius(b) * 1.03 && (!lock || lock.body !== b)) { this.legs = this.plan(); this.go('align'); return; }
    const vHeat = heatSpeed(s.env.density) * 0.9;
    const vUp = Math.min(V_SPACE, vHeat);
    // straight up over the ground, the world's spin carried along
    this.slew(A, _b.copy(up).multiplyScalar(vUp).add(s.frameVel(_c)));
    const head = _c.set(0, 0, -1).applyQuaternion(s.quat);
    this.point(A, up, head.addScaledVector(up, -head.dot(up)).lengthSq() > 1e-4 ? head : _d.set(1, 0, 0));
    this.aim(_d.copy(up).multiplyScalar(lockRadius(b) * 1.03).add(b.pos), 'MASS LOCK EDGE');
  }

  // ---- FTL legs

  // the final leg: what the drive flies at, and the point it aims through
  finalLeg() {
    const d = this.dest;
    if (d.kind === 'vessel') return { final: true, aim: d.v.target, pos: (o) => d.v.getWorldPos(o) };
    const b = d.body;
    if (d.kind === 'orbit' || !d.dirF) return { final: true, aim: b, pos: (o) => o.copy(b.pos) };
    // just inside the lock, straight above the site: the drop is overhead
    return { final: true, aim: b, pos: (o) => o.copy(d.dirF).applyQuaternion(b.q).multiplyScalar(lockRadius(b) * 0.97).add(b.pos) };
  }

  // FTL legs from here: the destination, a point high above the site when it
  // lies on the far side, and detours around any mass lock in between
  plan() {
    const s = this.ship, d = this.dest;
    const P0 = s.getWorldPos(new THREE.Vector3());
    const legs = [this.finalLeg()];
    if (d.kind === 'site' && d.dirF) {
      const b = d.body;
      const up = () => _c.copy(d.dirF).applyQuaternion(b.q);
      if (_a.copy(P0).sub(b.pos).normalize().dot(up()) < 0.65) legs.unshift({ aim: null, pos: (o) => o.copy(up()).multiplyScalar(lockRadius(b) * 2.2).add(b.pos), label: 'ABOVE THE SITE' });
    }
    for (let iter = 0; iter < 6; iter++) {
      let prev = P0, changed = false;
      for (let i = 0; i < legs.length; i++) {
        const end = legs[i].pos(new THREE.Vector3());
        const X = this.blocking(prev, end, legs[i]);
        if (X) {
          // around it: out from its centre past the closest point of the path
          const ab = _a.copy(end).sub(prev);
          const t = THREE.MathUtils.clamp(_b.copy(X.pos).sub(prev).dot(ab) / ab.lengthSq(), 0, 1);
          const n = _c.copy(prev).addScaledVector(ab, t).sub(X.pos);
          if (n.lengthSq() < 1) n.set(0, 1, 0).cross(ab);
          const dir = n.normalize().clone();
          const r = lockRadius(X) * 1.6;
          legs.splice(i, 0, { aim: null, pos: (o) => o.copy(dir).multiplyScalar(r).add(X.pos), label: `AROUND ${X.data.name.toUpperCase()}` });
          changed = true;
          break;
        }
        prev = end;
      }
      if (!changed) break;
    }
    return legs;
  }

  // the first body whose mass lock the straight segment a->b crosses (not
  // the one the leg is flying into)
  blocking(a, b, leg) {
    const ab = _d.copy(b).sub(a);
    const L2 = ab.lengthSq();
    let best = null, bestT = Infinity;
    for (const X of this.game.universe.bodies) {
      if (X === leg.aim) continue;
      const R = lockRadius(X) * 1.02;
      if (a.distanceTo(X.pos) < R) continue; // starting inside (just climbed out of) it
      const t = THREE.MathUtils.clamp(_b.copy(X.pos).sub(a).dot(ab) / L2, 0, 1);
      const dist = _c.copy(a).addScaledVector(ab, t).distanceTo(X.pos);
      if (dist < R && t < bestT) { bestT = t; best = X; }
    }
    return best;
  }

  align(A) {
    const s = this.ship, ftl = s.ftl;
    if (!this.legs.length) this.legs = this.plan();
    const leg = this.legs[0];
    const P = leg.pos(new THREE.Vector3());
    const wp = s.getWorldPos(_b);
    const dir = _a.copy(P).sub(wp);
    const dist = dir.length();
    this.aim(P, leg.final ? this.dest.name.toUpperCase() : leg.label);
    this.hold(A);
    this.point(A, dir, _c.set(0, 1, 0).applyQuaternion(s.quat));
    const nose = _c.set(0, 0, -1).applyQuaternion(s.quat);
    const off = Math.acos(THREE.MathUtils.clamp(nose.dot(dir.normalize()), -1, 1));
    if (off > 0.01 || s.angVel.length() > 0.01) return;
    ftl.nav = { aim: leg.final ? leg.aim : null, legLimit: leg.final ? 0 : dist };
    if (ftl.state === 'cooldown' || ftl.state === 'spool' || ftl.state === 'cruise') { if (ftl.state !== 'cooldown') this.go(ftl.state); return; }
    const lock = ftl.massLock();
    if (lock) {
      if (lock.body.isVessel) { this.go('depart'); return; }
      this.go('climb');
      return;
    }
    if (ftl.pathObstruction()) { this.legs = this.plan(); return; }
    ftl.toggle();
    if (ftl.state === 'spool') this.go('spool');
  }

  spool(A) {
    const s = this.ship, ftl = s.ftl;
    const leg = this.legs[0];
    const P = leg.pos(new THREE.Vector3());
    this.aim(P, leg.final ? this.dest.name.toUpperCase() : leg.label);
    this.hold(A);
    this.point(A, _a.copy(P).sub(s.getWorldPos(_b)), _c.set(0, 1, 0).applyQuaternion(s.quat));
    if (ftl.state === 'cruise') this.go('cruise');
    else if (ftl.state !== 'spool') this.go('align');
  }

  cruise(A) {
    const s = this.ship, ftl = s.ftl, d = this.dest;
    const leg = this.legs[0];
    if (ftl.state !== 'cruise') {
      // dropped out: at the destination, or somewhere to plan again from
      ftl.nav = null;
      this.legs.shift();
      if (leg && leg.final) {
        if (d.kind === 'vessel') { this.go('approach'); this.appr = null; return; }
        if (d.kind === 'orbit') { this.done(`In orbit of ${d.name}`); return; }
        if (s.body === d.body && s.pos.length() < lockRadius(d.body) * 1.02) { this.go('descend'); return; }
      }
      if (!leg || !leg.final) { this.go('align'); return; }
      this.legs = this.plan();
      this.go('align');
      return;
    }
    const P = leg.pos(new THREE.Vector3());
    const wp = s.getWorldPos(_b);
    const dir = _a.copy(P).sub(wp);
    const dist = dir.length();
    this.aim(P, leg.final ? d.name.toUpperCase() : leg.label);
    this.hold(A);
    this.point(A, dir, _c.set(0, 1, 0).applyQuaternion(s.quat));
    if (!leg.final) {
      ftl.nav.legLimit = dist;
      const ns = ftl.nearestSurface();
      const nose = _c.set(0, 0, -1).applyQuaternion(s.quat);
      if (dist < Math.max(20000, ns.dist * 0.04) || dir.dot(nose) < 0) ftl.drop(false);
    }
  }

  // ---- down to a site on a world (from orbit, or a low hop across it)

  descend(A) { this.surfaceFlight(A, Infinity); }

  hop(A) {
    const b = this.ship.body;
    const cruise = b.atm ? Math.max(6000, (b.data.terrain ? b.data.terrain.relief * 1.6 : 0) + 3000) : Math.min(40000, Math.max(5000, b.R * 0.04));
    this.surfaceFlight(A, cruise);
  }

  surfaceFlight(A, cruiseHeight) {
    const s = this.ship, d = this.dest, b = d.body;
    if (s.body !== b) { this.legs = this.plan(); this.go('align'); return; }
    if (!d.dirF) { this.hold(A); this.level(A, null); this.aimLabel = ''; return; } // waiting on the survey
    const p = s.pos, r = p.length();
    const up = _a.copy(p).divideScalar(r);
    const site = _b.copy(d.dirF).applyQuaternion(b.q);
    const gh = b.groundHeight(d.dirF);
    const ang = Math.acos(THREE.MathUtils.clamp(up.dot(site), -1, 1));
    const sH = ang * (b.R + gh);
    const hdir = _c.copy(site).addScaledVector(up, -site.dot(up));
    if (hdir.lengthSq() < 1e-10) hdir.set(0, 0, -1).applyQuaternion(s.quat).addScaledVector(up, -_d.set(0, 0, -1).applyQuaternion(s.quat).dot(up));
    hdir.normalize();
    const hRel = r - b.R - gh;
    const altT = H_HOVER + Math.min(cruiseHeight, sH * GLIDE);
    let vh = Math.min(V_SPACE, Math.sqrt(2 * 0.6 * G0 * sH));
    let vv = hRel > altT ? -Math.min(V_SPACE, Math.sqrt(2 * 0.6 * G0 * (hRel - altT))) : Math.min(120, (altT - hRel) * 0.5);
    // the air ahead (where the descent will be in a few seconds) limits speed
    const aheadAlt = Math.max(0, r - b.R + Math.min(0, vv) * 6);
    const vHeat = b.atm ? heatSpeed(b.atmosphereAt(aheadAlt).density) * 0.85 : Infinity;
    const sp = Math.hypot(vh, vv);
    if (sp > vHeat) { vh *= vHeat / sp; vv *= vHeat / sp; }
    const vAbs = this._va.copy(hdir).multiplyScalar(vh).addScaledVector(up, vv).add(s.frameVel(this._vb));
    this.slew(A, vAbs);
    // attitude: level in air and for small corrections; in vacuum, big
    // velocity changes are made nose-first on the main engine
    const dv = this._vb.copy(vAbs).sub(s.vel);
    if (dv.length() > 80 && s.env.density < 1e-6) this.point(A, dv, up);
    else this.level(A, sH > 30 ? hdir : null);
    s.gearTarget = hRel < 2000 ? 1 : 0;
    this.aim(_d.copy(site).multiplyScalar(b.R + gh).add(b.pos), (d.label || 'site').toUpperCase());
    if (sH < 40 && hRel < 150) this.go('land');
  }

  land(A) {
    const s = this.ship, d = this.dest, b = d.body;
    if (s.landed) { this.done(`Landed on ${d.name}${d.label ? ', ' + d.label : ''}`); return; }
    const p = s.pos, r = p.length();
    const up = _a.copy(p).divideScalar(r);
    const site = _b.copy(d.dirF).applyQuaternion(b.q);
    const gh = b.groundHeight(d.dirF);
    const hoff = _c.copy(site).multiplyScalar(b.R + gh).sub(p);
    hoff.addScaledVector(up, -hoff.dot(up));
    const hd = hoff.length();
    const agl = isFinite(s.agl) ? s.agl : r - b.R - gh;
    const vRel = _d.copy(hoff).setLength(Math.min(3, hd * 0.3)).addScaledVector(up, -THREE.MathUtils.clamp(agl * 0.3, 1.0, 6));
    this.slew(A, vRel.add(s.frameVel(new THREE.Vector3())));
    this.level(A, null);
    s.gearTarget = 1;
    A.land = true;
    this.aim(_c.copy(site).multiplyScalar(b.R + gh).add(b.pos), (d.label || 'site').toUpperCase());
  }

  // ---- to a big ship's pad or hangar

  // waypoints in the host's frame: around its hull, then down onto a free pad
  // or in through the hangar door
  approachPlan() {
    const s = this.ship, host = this.dest.v;
    const zones = host.type.zones;
    const pads = zones.filter((z) => z.kind === 'pad');
    const busy = (z) => host.children.some((c) => c !== s && c.zone === z);
    const pts = [];
    let zone;
    if (pads.length) {
      zone = pads.find((z) => !busy(z)) || pads[0];
      pts.push(new THREE.Vector3(zone.pad[0], 240, zone.pad[2]), new THREE.Vector3(zone.pad[0], 34, zone.pad[2]));
    } else {
      zone = zones[0];
      const zc = (zone.door.z0 + zone.door.z1) / 2;
      pts.push(new THREE.Vector3(zone.min[0] - 650, 32, zc), new THREE.Vector3(zone.min[0] - 14, 32, zc), new THREE.Vector3(zone.min[0] + 25, 32, zc));
    }
    // around the hull first when the straight way to the first point crosses it
    const here = host.bodyToLocal(s.pos, new THREE.Vector3());
    const R = host.type.radius + 300;
    if (this.segmentHitsHull(host, here, pts[0])) {
      const a = here.clone().normalize(), b = pts[0].clone().normalize();
      const mid = a.clone().add(b);
      if (mid.lengthSq() < 1e-3) mid.set(0, 1, 0);
      pts.unshift(a.clone().multiplyScalar(R), mid.normalize().multiplyScalar(R));
    }
    return { zone, pts };
  }

  segmentHitsHull(host, a, b) {
    const box = host._navBox || (host._navBox = (() => {
      const mn = new THREE.Vector3(Infinity, Infinity, Infinity), mx = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
      for (const c of host.type.colliders) { mn.min(_a.fromArray(c.min)); mx.max(_a.fromArray(c.max)); }
      return new THREE.Box3(mn.subScalar(80), mx.addScalar(80));
    })());
    for (let i = 0; i <= 24; i++) if (box.containsPoint(_a.copy(a).lerp(b, i / 24))) return true;
    return false;
  }

  approach(A) {
    const s = this.ship, host = this.dest.v;
    if (s.parent === host) { this.go('dock'); return; }
    if (s.body !== host.body) { this.legs = this.plan(); this.go('align'); return; }
    if (!this.appr) this.appr = this.approachPlan();
    const pts = this.appr.pts;
    const local = host.bodyToLocal(s.pos, new THREE.Vector3());
    const tgt = pts[0];
    const dl = _a.copy(tgt).sub(local);
    const dist = dl.length();
    const last = pts.length === 1;
    if (!last && dist < 40) { pts.shift(); return; }
    const vmax = last ? 8 : 200;
    const v = Math.min(vmax, Math.sqrt(2 * 0.4 * G0 * dist) + (last ? 1 : 4));
    const vW = this._vb.copy(dl).setLength(v).applyQuaternion(host.quat); // relative to the host
    this.slew(A, this._va.copy(vW).add(host.pointVelocity(local, _b)));
    const hostUp = _c.set(0, 1, 0).applyQuaternion(host.quat);
    const near = local.length() < host.type.radius + 500;
    if (near) {
      const into = this.appr.zone.kind === 'pad' ? _d.set(0, 0, -1) : _d.set(1, 0, 0);
      this.point(A, into.applyQuaternion(host.quat), hostUp);
    } else this.point(A, vW.lengthSq() > 1 ? vW : _d.set(0, 0, -1).applyQuaternion(s.quat), hostUp);
    this.aim(host.localToWorld(tgt, new THREE.Vector3()), `${host.name.toUpperCase()} · ${this.appr.zone.name.toUpperCase()}`);
  }

  dock(A) {
    const s = this.ship, host = this.dest.v;
    if (s.attached && s.parent === host) { this.done(`Docked aboard ${host.name} · ${s.zone.name}`); return; }
    if (s.parent !== host) { this.go('approach'); return; }
    const z = s.zone;
    this.lup.set(0, 1, 0);
    A.lup = this.lup; A.lnose = this.lnose; A.lvel = this.lvel;
    let spot;
    if (z.kind === 'pad') { spot = _a.set(z.pad[0], z.pad[1], z.pad[2]); this.lnose.set(0, 0, -1); }
    else { spot = _a.set(-70, 0, -60); this.lnose.set(-1, 0, 0); } // the hangar's parking spot, facing the door
    const hoff = _b.copy(spot).sub(s.lpos).setY(0);
    const hd = hoff.length();
    const agl = isFinite(s.agl) ? s.agl : s.lpos.y - spot.y;
    if (hd > 3) {
      // across the deck at height, slowing into the spot
      const hv = Math.min(z.kind === 'pad' ? 3 : 12, Math.sqrt(2 * 0.25 * G0 * hd));
      this.lvel.copy(hoff).setLength(hv);
      this.lvel.y = THREE.MathUtils.clamp((Math.min(25, spot.y + 25) - s.lpos.y) * 0.4, -3, 3);
      if (z.kind === 'pad') this.lvel.y = -THREE.MathUtils.clamp(agl * 0.2, 0.5, 3);
    } else {
      this.lvel.copy(hoff).multiplyScalar(0.4);
      this.lvel.y = -THREE.MathUtils.clamp(agl * 0.3, 0.8, 4);
      A.land = true;
    }
    s.gearTarget = 1;
    this.aim(host.localToWorld(spot, new THREE.Vector3()), `${host.name.toUpperCase()} · ${z.name.toUpperCase()}`);
  }

  done(msg) {
    this.disengage(null);
    this.game.message(`Nav computer: ${msg}`, 'nav');
    this.game.audio && this.game.audio.clunk && this.game.audio.clunk();
  }
}
