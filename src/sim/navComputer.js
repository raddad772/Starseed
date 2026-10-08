// Navigation computer: every vessel has one. It carries out orders with or
// without anyone aboard, so several ships can be on different trips at once
// (the Fleet app in your suit gives the orders; N flies the ship you're in
// to the selected target).
//
// Orders (destinations):
//   site    land at a place on a world (small craft)
//   orbit   arrive in orbit of a world
//   dock    settle on a big ship's pad or in its hangar (small craft)
//   meet    come alongside a ship (or you, on a spacewalk) and keep station
//   park    climb into / circularise a parking orbit around the world it's at
//   hold    keep station where it is (hover, or beside a nearby big ship)
// Conventional orders use world-time launch windows, finite engine burns,
// analytic coast arcs, corrections and capture (OrbitalFlight). FTL retains
// its mass-lock detours; the legs before and after it use orbital guidance.
// Final surface and bay approaches retain the contact controller. Navigation
// can be released with N; shared time warp always remains cancellable.

import * as THREE from 'three';
import { floraOf } from './floraField.js';
import { meadowsNear } from '../gen/flora.js';
import { lockRadius } from './ftl.js';
import { hullEnvelope } from './reentry.js';
import { OrbitalFlight, maneuverAuthority } from './orbitalFlight.js';

const G0 = 9.81;
const A_CMD = 2.5 * G0;      // commanded acceleration, small craft (crew comfort; the engines can do far more)
const H_HOVER = 40;          // m over the site where the final settle begins
const GLIDE = 0.12;           // descent path: height per metre still to go
const HOP_MAX = 1.2e6;       // m: farther than this along the ground, go by space instead
const NEAR = 50000;          // m: closer than this to a ship, fly over without FTL

const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _d = new THREE.Vector3();

export const PHASE_NAMES = {
  depart: 'Departing', climb: 'Climbing out of the mass lock', align: 'Aligning for FTL', spool: 'FTL spooling',
  cruise: 'FTL cruise', descend: 'Descent', hop: 'Low flight', land: 'Landing', approach: 'Approach', dock: 'Docking',
  meet: 'Closing in', park: 'Into orbit', station: 'Keeping station', orbital: 'Orbital flight',
};

// phase -> method
const PHASE_FN = {
  depart: 'depart', climb: 'climb', align: 'align', spool: 'spool', cruise: 'cruise', descend: 'descend', hop: 'hop',
  land: 'land', approach: 'approach', dock: 'dock', meet: 'meetPhase', park: 'parkPhase', station: 'station', orbital: 'orbitalPhase',
};

// a rough time to go: "~40 s", "~3 min", "~1 h 20 min"
export function fmtEta(sec) {
  if (!isFinite(sec)) return '—';
  if (sec < 60) return `~${Math.max(5, Math.round(sec / 5) * 5)} s`;
  if (sec < 3600) return `~${Math.round(sec / 60)} min`;
  if (sec >= 86400) return `~${Math.floor(sec / 86400)} d ${Math.floor((sec % 86400) / 3600)} h`;
  return `~${Math.floor(sec / 3600)} h ${Math.round((sec % 3600) / 60)} min`;
}

export class NavComputer {
  constructor(game, ship) {
    this.game = game;
    this.ship = ship;
    this.active = false;
    this.phase = null;
    this.dest = null;
    this.legs = [];
    this.travelMode = 'auto';
    this.flight = null;
    this.nextEventAt = Infinity;
    this.sites = new Map();   // body id -> chosen landing site { dirF, label } (or 'orbit')
    // what this hull can do: big ships turn and accelerate slowly, and their
    // velocity loop is slower (see Ship.computeControl)
    this.aMax = Math.min(A_CMD, 0.5 * ship.limits.main / ship.mass);
    this.tau = ship.big ? 6 : 0.7;
    this.nose = new THREE.Vector3(); this.up = new THREE.Vector3();
    this.lnose = new THREE.Vector3(); this.lup = new THREE.Vector3(); this.lvel = new THREE.Vector3();
    this.aimPos = new THREE.Vector3(); // the point being flown to (HUD marker)
    this._lu = new THREE.Vector3(); this._lh = new THREE.Vector3(); this._va = new THREE.Vector3(); this._vb = new THREE.Vector3();
    this.hold = { ref: null, local: new THREE.Vector3(), posF: new THREE.Vector3() };
    this.aimLabel = '';
  }

  get canLand() { return !!this.ship.type.legs; }

  // messages: plain for the ship you are aboard, signed by the ship otherwise
  say(text, kind = 'nav') {
    const g = this.game, aboard = g.aboardOf(this.ship);
    for (const p of g.players) p.ui.hud.message(aboard.includes(p) ? `Nav computer: ${text}` : `${this.ship.name}: ${text}`, kind);
  }

  // ------------------------------------------------------------ destinations

  // what a target means for this ship: a small craft lands on worlds and
  // docks with big ships; a big ship goes into orbit or alongside
  destinationFor(t) {
    const g = this.game;
    if (!t || t.isStar) return null;
    if (t.isVessel) {
      const v = t.v;
      if (v === this.ship || v.dead) return null;
      if (this.canLand && v.big && v.type.zones) return { kind: 'dock', v, name: v.name };
      return { kind: 'meet', v, name: v.name };
    }
    if (!this.canLand || !t.solid || this.sites.get(t.id) === 'orbit') return { kind: 'orbit', body: t, name: t.data.name };
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

  // pick where on a world this ship lands (null: the default; 'orbit': none)
  chooseSite(body, site) {
    if (site) this.sites.set(body.id, site); else this.sites.delete(body.id);
    if (this.active && this.dest && this.dest.body === body) {
      const d = this.destinationFor(body);
      if (d) this.dest = d;
      if (this.flight) this.order(this.dest);
      if (this.phase === 'cruise' || this.phase === 'align') this.legs = this.plan();
    }
  }

  // ------------------------------------------------------------ orders

  // N: fly the ship you're in to the selected target, or stop
  toggle() {
    if (this.active) { this.cancel('off'); return; }
    const g = this.game;
    const dest = this.destinationFor(g.target);
    if (!dest) { this.say(g.target ? `can't go to ${g.target.data.name}` : 'pick a destination first (Tab, T, the map or the quick menu)', 'caution'); return; }
    this.order(dest);
  }

  // Give an order: { kind: 'site', body, dirF, label } | { kind: 'orbit', body }
  // | { kind: 'dock' | 'meet', v } | { kind: 'meet', point } | { kind: 'park' } | { kind: 'hold' }
  order(dest) {
    const s = this.ship;
    if (s.dead) return false;
    if ((s.landed || s.agl < 100) && dest.kind !== 'hold' && maneuverAuthority(s).acceleration < s.body.GM / s.pos.lengthSq() * 1.04) { this.say('insufficient loaded thrust to lift off from this world', 'caution'); return false; }
    if ((dest.kind === 'site' || dest.kind === 'dock') && !this.canLand) { this.say(`a ${s.type.className} can't ${dest.kind === 'site' ? 'land' : 'dock'}`, 'caution'); return false; }
    if (dest.kind === 'dock' && !dest.v.type.zones?.some(z=>this.fitsBay(z))) { this.say(`no landing bay at ${dest.v.name} can fit ${s.name}`, 'caution'); return false; }
    if (dest.kind === 'dock' && s.parent === dest.v && s.attached) { this.say(`already aboard ${dest.v.name}`, 'caution'); return false; }
    if (this.travelMode === 'ftl' && s.type.ftl === false) { this.say('this hull has no FTL drive; choose conventional flight', 'caution'); return false; }
    if (s.type.atmosphericThrust && (dest.kind === 'park' || dest.kind === 'orbit' || (dest.body && dest.body !== s.body))) { this.say('air-breathing engines cannot execute an orbital transfer', 'caution'); return false; }
    if (!dest.name) dest.name = dest.body ? dest.body.data.name : (dest.v ? dest.v.name : (dest.point ? dest.point.name : ''));
    this.dest = dest;
    this.flight = null;
    this.nextEventAt = Infinity;
    this.active = true;
    this.legs = [];
    this.appr = null;
    this.go('depart');
    s.assist = 2;
    this.say(`${this.orderText()}${s.pilot ? ' · N to take the controls' : ''}`);
    return true;
  }

  // Come to me: wherever the player is, the matching order
  comeToPlayer() {
    const g = this.game, p = g.player, s = this.ship;
    if (p.aboard && p.vessel === s) { this.say("you're aboard", 'caution'); return false; }
    if (p.aboard) {
      const host = p.vessel.root;
      return this.order(this.canLand && host.big && host.type.zones ? { kind: 'dock', v: host } : { kind: 'meet', v: host });
    }
    if (p.mode === 'surface') {
      if (!this.canLand) return this.order({ kind: 'orbit', body: p.body });
      // beside you, 35 m off along your heading
      const up = p.fPos.clone().normalize();
      const dirF = up.multiplyScalar(p.body.R).addScaledVector(p.heading, 35).normalize();
      return this.order({ kind: 'site', body: p.body, dirF, label: 'beside you' });
    }
    // on a spacewalk: alongside you
    const pt = {
      name: 'you', isPoint: true,
      get body() { return p.body; },
      getWorldPos: (o) => o.copy(p.ePos).add(p.body.pos),
      getWorldVel: (o) => o.copy(p.eVel).add(p.body.vel),
    };
    return this.order({ kind: 'meet', point: pt, name: 'you' });
  }

  cancel(why, kind = 'caution') {
    const s = this.ship;
    if (!this.active) return;
    this.active = false;
    this.phase = null;
    this.flight = null;
    this.nextEventAt = Infinity;
    if (s.auto?.orbital && !s.landed && !s.parent) s.assist = 1; // preserve the achieved orbit when guidance releases it
    s.auto = null;
    s.targetFrame = 'none'; // the pilot's assist re-bases on the present motion
    if (s.ftl.nav) s.ftl.nav = null;
    if (why) this.say(why, kind);
  }

  // (the old name)
  disengage(why, kind) { this.cancel(why, kind); }

  orderText() {
    const d = this.dest;
    if (!d) return '';
    if (d.kind === 'dock') return `to ${d.name}, to dock`;
    if (d.kind === 'meet') return d.name === 'you' ? 'to you' : `alongside ${d.name}`;
    if (d.kind === 'orbit') return `to orbit of ${d.name}`;
    if (d.kind === 'park') return 'into a parking orbit';
    if (d.kind === 'hold') return 'holding position';
    return `to ${d.name}${d.label ? ', ' + d.label : ''}`;
  }

  destText() {
    const d = this.dest;
    if (!d) return '';
    if (d.kind === 'dock' || d.kind === 'meet') return d.name;
    if (d.kind === 'orbit') return `orbit of ${d.name}`;
    if (d.kind === 'park') return `orbit of ${this.ship.body.data.name}`;
    if (d.kind === 'hold') return 'here';
    return `${d.name}${d.label ? ', ' + d.label : ''}`;
  }

  // the other ship (or you) for dock / meet
  get other() {
    const d = this.dest;
    return d ? d.v || d.point || null : null;
  }

  // ------------------------------------------------------------ state

  // What the ship is doing, for the fleet list: { state, line, tone }
  describe() {
    const s = this.ship, g = this.game;
    if (s.dead) return { state: 'Lost', line: s.deathCause || 'destroyed', tone: 'warn' };
    if (this.active) {
      if (this.phase === 'station') return { state: 'Holding', line: this.dest.kind === 'hold' ? `position near ${s.body.data.name}` : `alongside ${this.dest.name}`, tone: 'ok' };
      const st = this.status();
      return { state: 'Navigating', line: `${this.destText()} · ${st.phase.toLowerCase()} · ${fmtEta(st.eta)}`, tone: 'nav' };
    }
    if (s.parent) return { state: s.attached ? 'Docked' : 'Flying', line: `aboard ${s.parent.name} · ${s.zone.name}`, tone: 'ok' };
    if (s.landed) return { state: 'Parked', line: `on ${s.body.data.name}`, tone: 'ok' };
    if (s.ftl.state === 'cruise') return { state: 'FTL', line: `cruising · ${(s.ftl.speed / 3e8).toFixed(2)} c`, tone: 'nav' };
    const b = s.body;
    const piloted = !!s.pilot;
    if (b.isStar) return { state: piloted ? 'Flying' : 'Drifting', line: `around ${b.data.name}`, tone: 'caution' };
    const o = s.orbit();
    const safeR = b.R + (b.atm ? b.atmHeight : 0) + (b.relief * 1.6);
    const km = (m) => `${Math.round(m / 1000).toLocaleString()} km`;
    if (piloted) return { state: 'Flying', line: `${s.pilot === g.player ? 'you' : s.pilot.label} · ${km(s.altitude)} over ${b.data.name}`, tone: 'ok' };
    if (!o.bound) return { state: 'Drifting', line: `escaping ${b.data.name}`, tone: 'caution' };
    if (o.rp < safeR) return { state: 'Falling', line: `toward ${b.data.name} · ${km(s.altitude)} up`, tone: 'warn' };
    return { state: 'In orbit', line: `of ${b.data.name} · ${km(o.rp - b.R)} × ${km(o.ra - b.R)}`, tone: 'ok' };
  }

  // ------------------------------------------------------------ status (HUD)

  status() {
    if (!this.active) return null;
    if (this.flight) {
      const f = this.flight;
      return { phase: f.stage, dest: this.destText(), eta: f.eta, wait: f.wait, deltaV: f.deltaV, burnSeconds: f.burnSeconds, route: 'Conventional', aim: null, aimLabel: '' };
    }
    let eta = 0;
    const s = this.ship, d = this.dest;
    const ph = this.phase;
    const travel = d.kind === 'site' || d.kind === 'orbit' || d.kind === 'dock' || d.kind === 'meet';
    if (travel) {
      const legsLeft = this.legs.length || (['depart', 'climb'].includes(ph) && this.needsFtl() ? 1 : 0);
      if (ph === 'depart') eta += 25;
      if ((ph === 'climb' || ph === 'depart') && this.needsFtl()) eta += Math.max(0, lockRadius(s.body) * 1.03 - s.pos.length()) / 1500 + 30;
      eta += legsLeft * (s.big ? 90 : 28);
      if (d.kind === 'site' && ph !== 'land') eta += ph === 'descend' || ph === 'hop' ? this.descentEta() : 150;
      if (d.kind === 'dock') eta += ph === 'approach' || ph === 'dock' ? 40 : 120;
      if (d.kind === 'meet') eta += ph === 'meet' ? 60 : 120;
    } else if (ph === 'park') eta = 120;
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
    if (d.kind === 'park' || d.kind === 'hold') return false;
    if (this.travelMode === 'conventional' || s.type.ftl === false) return false; // (no drive: the long way round, at sublight)
    if (d.kind === 'site' && d.body === s.body && this.hopDistance() < HOP_MAX && s.pos.length() < lockRadius(s.body)) return false;
    if ((d.kind === 'dock' || d.kind === 'meet') && this.otherDistance() < NEAR) return false;
    return true;
  }

  otherDistance() {
    const o = this.other;
    if (!o) return Infinity;
    return o.getWorldPos(_a).distanceTo(this.ship.getWorldPos(_b));
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
    const g = this.game, s = this.ship;
    if (!this.active) { if (s.auto) s.auto = null; return; }
    if (s.dead) { this.cancel(null); return; }
    const o = this.other;
    if (o && o.dead) { this.cancel(`${this.dest.name} is gone`); return; }
    if (o && o.v && o.v.dead) { this.cancel(`${this.dest.name} is gone`); return; }
    // Refresh authority for payload changes; time-warp safety reads the
    // resulting command and its next world-time event after this update.
    this.aMax = Math.min(A_CMD, .5 * maneuverAuthority(s).acceleration);
    this.tau = s.big ? 6 : s.handling.velocityTime;
    s.assist = 2;
    const A = s.auto || (s.auto = {});
    A.vel = (A.vel || new THREE.Vector3()).copy(s.vel);
    A.nose = A.up = A.lvel = A.lnose = A.lup = null;
    A.move = A.land = A.orbital = false;
    A.coast = true; // a phase transition must not apply a stale velocity order
    A.thrust = null;
    A.referenceAccel = null;
    const ref = this.phase === 'station' ? this.hold.ref : (['approach','meet'].includes(this.phase) ? this.other : null);
    if (ref) {
      const acc = this._refAccel || (this._refAccel = new THREE.Vector3());
      if (ref.accelW) acc.copy(ref.accelW);
      else { ref.getWorldPos(acc).sub(s.body.pos); acc.multiplyScalar(-s.body.GM / acc.length() ** 3); }
      A.referenceAccel = acc;
    }
    this.nextEventAt = Infinity;
    this.aimLabel = '';
    this.phaseT += dt;
    const fn = this[PHASE_FN[this.phase]];
    if (fn) fn.call(this, A, dt);
    if (this.active && !s.parent && s.ftl.state !== 'cruise' && s.auto && !A.orbital) this.avoidHazards(A);
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
      // where the straight path comes closest within the stopping horizon
      const T = Math.max(15, vW.length() / (this.aMax * 0.8));
      const t = Math.min(T, vW.dot(c) / vW.lengthSq());
      const miss = _b.copy(c).addScaledVector(vW, -t).length();
      if (miss < R) { A.vel.addScaledVector(c, -toward / dist); A.coast = false; }
    };
    for (const X of g.universe.bodies) {
      if (landing && X === d.body) continue;
      const R = X.isStar ? X.R * 3 : (X.solid ? X.R + (X.relief * 1.6) + 1500 : X.R + (X.atmHeight || 0) * 0.6);
      consider(X.pos, X.vel, R);
    }
    for (const h of g.vessels) {
      if (!h.big || h.dead || h === s || h.body !== s.body) continue;
      if (h.ftl.state === 'cruise') continue; // in its bubble: no Newtonian motion to meet
      if (h === d.v && ['approach', 'dock', 'meet', 'station'].includes(this.phase)) continue;
      consider(h.getWorldPos(_c), h.getWorldVel(_d), h.type.radius + 80);
    }
  }

  go(phase) {
    this.phase = phase;
    this.phaseT = 0;
    this._surfaceCeiling = null;
    this.nextEventAt = this.game.t;
  }

  // velocity command toward an absolute (body-centred inertial) velocity, at
  // most this hull's comfortable acceleration away from the present one
  slew(A, vAbs) {
    A.coast = false;
    const dv = _d.copy(vAbs).sub(this.ship.vel);
    const lim = this.aMax * this.tau;
    if (dv.length() > lim) dv.setLength(lim);
    A.vel.copy(this.ship.vel).add(dv);
    return A.vel;
  }

  // keep going as it is: coasting on its orbit (engines off; the attitude
  // still steered), or with coast false holding this velocity under power
  keepVel(A, coast = true) { A.vel.copy(this.ship.vel); A.coast = coast; }

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
        // a flight bay: up off the deck, then out through its mouth
        const M = z.mouth;
        const n = _b.fromArray(M.normal);
        const mid = (z.min[1] + z.max[1]) / 2;
        // out along the normal from where we are, held clear of the floor and roof
        const exit = _a.set(s.lpos.x, mid, s.lpos.z);
        const along = n.x ? 0 : 2;
        exit.setComponent(along, M.at + (n.x || n.z) * 60);
        if (n.x) exit.z = THREE.MathUtils.clamp(s.lpos.z, z.min[2] + 20, z.max[2] - 20);
        else exit.x = THREE.MathUtils.clamp(s.lpos.x, z.min[0] + 20, z.max[0] - 20);
        this.lnose.copy(n);
        if (s.lpos.y < mid - 3) this.lvel.set(0, 4, 0);
        else this.lvel.copy(exit).sub(s.lpos).setLength(Math.min(18, exit.distanceTo(s.lpos) * 0.5 + 6));
      }
      A.lvel = this.lvel; A.lnose = this.lnose; A.lup = this.lup;
      return;
    }
    // close to a big ship: back off clear of its 2 km FTL lock
    for (const h of g.vessels) {
      if (!h.big || h.dead || h === s || h.body !== s.body || h === this.dest.v || this.dest.kind === 'hold') continue;
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
    if (this.canLand) s.gearTarget = 0;
    this.afterDepart();
  }

  // the next phase once clear of pads, hangars, the ground and big ships
  setTravelMode(mode) {
    if (!['auto', 'conventional', 'ftl'].includes(mode)) return;
    this.travelMode = mode;
    if (this.active && !['hold', 'park'].includes(this.dest.kind)) this.order(this.dest);
  }

  startOrbital(kind, then) {
    this.flight = new OrbitalFlight(this, kind, then);
    this.go('orbital');
  }
  orbitalPhase(A) { this.flight?.update(A); }
  lockOrbitRadius() { return Math.max(this.parkRadius(this.ship.body), lockRadius(this.ship.body) * 1.035); }
  enterRoute() {
    const d = this.dest;
    if (d.kind === 'dock' || d.kind === 'meet') {
      if (this.otherDistance() < NEAR && this.other?.body === this.ship.body) this.go(d.kind === 'dock' ? 'approach' : 'meet');
      else this.startOrbital('rendezvous', () => this.go(d.kind === 'dock' ? 'approach' : 'meet'));
    } else if (d.kind === 'site') this.startOrbital('entry', () => this.go('descend'));
    else this.done(`in orbit of ${this.ship.body.data.name}`);
  }

  afterDepart() {
    const s = this.ship, d = this.dest, b = s.body;
    if (d.kind === 'hold') { this.startStation(); return; }
    if (d.kind === 'park' || (d.kind === 'orbit' && d.body === b)) {
      this.startOrbital('park', () => this.done(`parked in orbit of ${b.data.name}`)); return;
    }
    if (!this.needsFtl()) {
      const destinationBody = d.body || this.other?.body;
      if (destinationBody !== b) { this.startOrbital('journey', () => this.enterRoute()); return; }
      if (d.kind === 'site' && this.hopDistance() < 250000 && s.altitude < 20000 && s.surfaceVel(_a).length() < 600) { this.go('hop'); return; }
      if ((d.kind === 'dock' || d.kind === 'meet') && this.otherDistance() < NEAR) { this.enterRoute(); return; }
      const safe = b.R + Math.max(b.atmHeight * 1.03, b.relief * 1.6 + 1500);
      if (s.orbit().rp < safe) this.startOrbital('park', () => this.enterRoute());
      else this.enterRoute();
      return;
    }
    if (s.pos.length() < lockRadius(b) * 1.03 && s.ftl.massLock()) this.go('climb');
    else { this.legs = this.plan(); this.go('align'); }
  }

  arrive() {
    const s = this.ship, d = this.dest;
    if (d.kind === 'dock') { this.appr = null; this.go('approach'); return; }
    if (d.kind === 'meet') { this.go('meet'); return; }
    if (s.body === d.body) { this.enterRoute(); return; }
    this.legs = this.plan();this.go('align');
  }

  climb(A) {
    this.startOrbital('lock', () => { this.legs = this.plan(); this.go('align'); });
    this.orbitalPhase(A);
  }

  // ---- FTL legs

  // the final leg: what the drive flies at, and the point it aims through
  finalLeg() {
    const d = this.dest;
    if (d.v) return { final: true, aim: d.v.target, pos: (o) => d.v.getWorldPos(o) };
    // someone on a spacewalk: no drive locks onto a person, so a plain leg
    // that ends a few km short
    if (d.point) return { final: false, last: true, aim: null, pos: (o) => d.point.getWorldPos(o), label: 'YOU', stopShort: 3000 };
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
    // a ship parked near a world's mass lock (as an FTL arrival in orbit
    // leaves it) is reached from straight above: the last jump comes down
    // onto it from outside the lock instead of running into the lock first
    if (d.v) {
      const X = this.lockedNear(d.v);
      const fin = legs[legs.length - 1];
      if (X && this.blocking(P0, fin.pos(new THREE.Vector3()), fin) === X) {
        legs.unshift({ aim: null, label: `ABOVE ${d.v.name.toUpperCase()}`, pos: (o) => {
          const vp = d.v.getWorldPos(o);
          const n = _c.copy(vp).sub(X.pos);
          return vp.addScaledVector(n.normalize(), 40000);
        } });
      }
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

  // the world whose mass lock a ship sits within 40% of the lock radius of
  lockedNear(v) {
    const p = v.getWorldPos(_a);
    for (const X of this.game.universe.bodies) if (p.distanceTo(X.pos) < lockRadius(X) * 1.4) return X;
    return null;
  }

  // the first body whose mass lock the straight segment a->b crosses (not
  // the one the leg is flying into; a jump to a ship ends at the 6 km drop)
  blocking(a, b, leg) {
    if (leg.aim && leg.aim.isVessel) {
      const ab0 = _d.copy(b).sub(a), L = ab0.length();
      b = _c.copy(a).addScaledVector(ab0, Math.max(0, L - 7000) / Math.max(1, L)).clone();
    }
    const ab = _d.copy(b).sub(a);
    const L2 = ab.lengthSq();
    let best = null, bestT = Infinity;
    for (const X of this.game.universe.bodies) {
      if (X === leg.aim) continue;
      const R = lockRadius(X) * (leg.aim && leg.aim.isVessel ? 1.0 : 1.02); // (a ship may sit right at the edge)
      if (a.distanceTo(X.pos) < R) continue; // starting inside (just climbed out of) it
      const t = THREE.MathUtils.clamp(_b.copy(X.pos).sub(a).dot(ab) / L2, 0, 1);
      const dist = _c.copy(a).addScaledVector(ab, t).distanceTo(X.pos);
      if (dist < R && t < bestT) { bestT = t; best = X; }
    }
    return best;
  }

  align(A) {
    const s = this.ship, ftl = s.ftl;
    if (!this.legs.length) { if (!this.needsFtl()) { this.afterDepart(); return; } this.legs = this.plan(); }
    const leg = this.legs[0];
    const P = leg.pos(new THREE.Vector3());
    const wp = s.getWorldPos(_b);
    const dir = _a.copy(P).sub(wp);
    const dist = dir.length();
    this.aim(P, leg.final ? this.dest.name.toUpperCase() : leg.label);
    this.keepVel(A);
    this.point(A, dir, _c.set(0, 1, 0).applyQuaternion(s.quat));
    const nose = _c.set(0, 0, -1).applyQuaternion(s.quat);
    const off = Math.acos(THREE.MathUtils.clamp(nose.dot(dir.normalize()), -1, 1));
    // lined up (a big ship trailing a moving aim by a degree or two is fine:
    // under the nav computer the drive holds back until the nose is on)
    if (off > (s.big ? 0.035 : 0.01) || s.angVel.length() > (s.big ? 0.03 : 0.01)) return;
    ftl.nav = { aim: leg.final ? leg.aim : null, legLimit: leg.final ? 0 : dist - (leg.stopShort || 0) };
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
    this.keepVel(A);
    this.point(A, _a.copy(P).sub(s.getWorldPos(_b)), _c.set(0, 1, 0).applyQuaternion(s.quat));
    if (ftl.state === 'cruise') this.go('cruise');
    else if (ftl.state !== 'spool') this.go('align');
  }

  cruise(A) {
    const s = this.ship, ftl = s.ftl, d = this.dest;
    const leg = this.legs[0];
    if (ftl.state !== 'cruise') {
      // dropped out: at the destination, at a waypoint, or somewhere to plan again from
      ftl.nav = null;
      this.legs.shift();
      if (leg && (leg.final || leg.last)) { this.arrive(); return; }
      this.go('align');
      return;
    }
    const P = leg.pos(new THREE.Vector3());
    const wp = s.getWorldPos(_b);
    const dir = _a.copy(P).sub(wp);
    const dist = dir.length();
    this.aim(P, leg.final ? d.name.toUpperCase() : leg.label);
    this.keepVel(A);
    this.point(A, dir, _c.set(0, 1, 0).applyQuaternion(s.quat));
    // full speed only with the nose on the aim: none past 8 degrees off
    const cosErr = _c.set(0, 0, -1).applyQuaternion(s.quat).dot(dir) / Math.max(1e-9, dist);
    ftl.nav.align = THREE.MathUtils.clamp((cosErr - 0.99) / 0.0098, 0, 1);
    if (!leg.final) {
      const short = leg.stopShort || 0;
      ftl.nav.legLimit = dist - short;
      const ns = ftl.nearestSurface();
      const nose = _c.set(0, 0, -1).applyQuaternion(s.quat);
      if (dist - short < Math.max(short ? 2000 : 20000, ns.dist * 0.04) || dir.dot(nose) < 0) ftl.drop(false);
    }
  }

  // ---- down to a site on a world (from orbit, or a low hop across it)

  descend(A) { this.surfaceFlight(A, Infinity); }

  hop(A) {
    const b = this.ship.body;
    const cruise = b.atm ? Math.max(6000, (b.relief * 1.6) + 3000) : Math.min(40000, Math.max(5000, b.R * 0.04));
    this.surfaceFlight(A, cruise);
  }

  surfaceFlight(A, cruiseHeight) {
    const s = this.ship, d = this.dest, b = d.body;
    if (s.body !== b) { this.legs = this.plan(); this.go('align'); return; }
    if (!d.dirF) { this.keepVel(A, false); this.level(A, null); this.aimLabel = ''; return; } // waiting on the survey (hovering)
    const p = s.pos, r = p.length();
    const up = _a.copy(p).divideScalar(r);
    let site = _b.copy(d.dirF).applyQuaternion(b.q);
    let ang = Math.acos(THREE.MathUtils.clamp(up.dot(site), -1, 1));
    // a few km out: settle on the most level ground near the site (a lifter
    // on a crater wall tips, and what it sets down slides away)
    if (!d.levelled && ang * b.R < 3000) {
      d.levelled = true;
      const lv = this.levelSpot(b, d.dirF);
      if (lv.moved > 5) this.say(`level ground ${Math.round(lv.moved)} m from the site (${lv.deg.toFixed(0)} degrees)`);
      d.dirF.copy(lv.dir);
      site = _b.copy(d.dirF).applyQuaternion(b.q);
      ang = Math.acos(THREE.MathUtils.clamp(up.dot(site), -1, 1));
    }
    const gh = b.groundHeight(d.dirF);
    const sH = ang * (b.R + gh);
    const hdir = _c.copy(site).addScaledVector(up, -site.dot(up));
    if (hdir.lengthSq() < 1e-10) hdir.set(0, 0, -1).applyQuaternion(s.quat).addScaledVector(up, -_d.set(0, 0, -1).applyQuaternion(s.quat).dot(up));
    hdir.normalize();
    const hRel = r - b.R - gh;
    if (this._surfaceCeiling == null) this._surfaceCeiling = Math.max(hRel, 1000);
    const altT = H_HOVER + Math.min(cruiseHeight, sH * GLIDE, this.phase === 'descend' ? this._surfaceCeiling : Infinity);
    this._entryPilot ||= new OrbitalFlight(this, 'entry', () => {});
    this._entryPilot.surface(A, {up:up.clone(), heading:hdir.clone(), range:sH, height:hRel, targetHeight:altT});
    s.gearTarget = hRel < 2000 ? 1 : 0;
    this.aim(_d.copy(site).multiplyScalar(b.R + gh).add(b.pos), (d.label || 'site').toUpperCase());
    if (sH < 40 && hRel < 150) this.go('land');
  }

  // The most level spot within ~300 m of a site (body-fixed direction): the
  // steepest rise across the craft's footprint, nearer spots preferred
  levelSpot(b, dirF) {
    const s = this.ship;
    const foot = Math.max(5, Math.min(25, s.type.radius * 0.6));
    const e1 = new THREE.Vector3(0, 1, 0).cross(dirF);
    if (e1.lengthSq() < 1e-6) e1.set(1, 0, 0);
    e1.normalize();
    const e2 = dirF.clone().cross(e1).normalize();
    const at = (base, dx, dz, out) => out.copy(base).multiplyScalar(b.R).addScaledVector(e1, dx).addScaledVector(e2, dz).normalize();
    const c = new THREE.Vector3(), q = new THREE.Vector3();
    const slope = (dir) => {
      const h0 = b.groundHeight(dir);
      let m = 0;
      for (const [dx, dz] of [[foot, 0], [-foot, 0], [0, foot], [0, -foot], [foot * 0.7, foot * 0.7], [-foot * 0.7, -foot * 0.7]]) {
        m = Math.max(m, Math.abs(b.groundHeight(at(dir, dx, dz, q)) - h0) / foot);
      }
      return m;
    };
    // and no trees or boulders under it
    const field = floraOf(b), fl = [];
    const blocked = (dir) => {
      if (!field || !field.active) return 0;
      const p = q.copy(dir).multiplyScalar(b.R + b.groundHeight(dir));
      return field.near(p, foot + 2, fl).length;
    };
    // a craft carrying cargo looks wider and minds the slope more (a container
    // set down on a tilt slides)
    const cargo = !!(s.cargo && !s.cargo.dead);
    const slopeK = cargo ? 2.5 : 1;
    let best = dirF.clone(), bestSlope = slope(dirF), bestScore = bestSlope * slopeK + blocked(dirF) * 0.5, moved = 0;
    // the world's meadows nearby (open flat ground the forest leaves alone: see gen/flora.js)
    if (field && field.species && b.terrain) {
      for (const m of meadowsNear(b.terrain, field.species, [dirF.x, dirF.y, dirF.z], cargo ? 900 : 450)) {
        c.set(m.dir[0], m.dir[1], m.dir[2]);
        const rr = c.distanceTo(dirF) * b.R;
        const sl = slope(c);
        const score = sl * slopeK + blocked(c) * 0.5 + rr / 3000;
        if (score < bestScore) { bestScore = score; bestSlope = sl; best = c.clone(); moved = rr; }
      }
    }
    for (const rr of cargo ? [40, 80, 130, 190, 260, 320, 420, 540, 680] : [40, 80, 130, 190, 260, 320]) {
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 + rr * 0.01;
        at(dirF, Math.cos(a) * rr, Math.sin(a) * rr, c);
        const sl = slope(c);
        const score = sl * slopeK + blocked(c) * 0.5 + rr / 3000; // (a gentler slope is worth a short walk)
        if (score < bestScore) { bestScore = score; bestSlope = sl; best = c.clone(); moved = rr; }
      }
    }
    return { dir: best, moved, deg: Math.atan(bestSlope) * 180 / Math.PI };
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
  fitsBay(zone) { return !zone.maxCraftSize || hullEnvelope(this.ship.type).size.every((size,i)=>size<=zone.maxCraftSize[i]); }

  approachPlan() {
    const s = this.ship, host = this.dest.v;
    const zones = host.type.zones.filter(z=>this.fitsBay(z));
    const pads = zones.filter((z) => z.kind === 'pad');
    const busy = (z) => host.children.some((c) => c !== s && c.zone === z);
    const pts = [];
    let zone;
    if (pads.length) {
      zone = pads.find((z) => !busy(z)) || pads[0];
      pts.push(new THREE.Vector3(zone.pad[0], 240, zone.pad[2]), new THREE.Vector3(zone.pad[0], 34, zone.pad[2]));
    } else {
      // a flight bay: in through its mouth, to a free pad
      const free = (z) => (z.pads || []).filter((p) => !host.children.some((c) => c !== s && c.zone === z && Math.hypot(c.lpos.x - p[0], c.lpos.z - p[2]) < 18)
        && !(host.type.station && this.game.vessels.some(c=>c!==s&&c.nav?.active&&c.nav.dest?.v===host&&c.nav.appr?.zone===z)));
      if(host.type.station&&!zones.some(z=>free(z).length))return null;
      zone = zones.find((z) => free(z).length) || zones[0];
      const pads = free(zone);
      this.pad = pads.length ? pads[0] : [(zone.min[0] + zone.max[0]) / 2, zone.min[1], (zone.min[2] + zone.max[2]) / 2];
      const M = zone.mouth, n = new THREE.Vector3().fromArray(M.normal);
      const mid = (zone.min[1] + zone.max[1]) / 2;
      // lined up with the pad's lane, out in front of the mouth, then just
      // outside, then just inside (the bay's own frame takes over there)
      const lane = new THREE.Vector3(this.pad[0], mid, this.pad[2]);
      const onMouth = (d) => {
        const p = lane.clone();
        if (n.x) p.x = M.at + n.x * d; else p.z = M.at + n.z * d;
        return p;
      };
      pts.push(onMouth(650), onMouth(14), onMouth(-25));
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
    if(!this.appr) {
      this.say(`All bays at ${host.name} are occupied · holding outside`);
      this.dest={kind:'hold',v:host,name:host.name};this.startStation(host);this.station(A);return;
    }
    const pts = this.appr.pts;
    const local = host.bodyToLocal(s.pos, new THREE.Vector3());
    const tgt = pts[0];
    const dl = _a.copy(tgt).sub(local);
    const dist = dl.length();
    const last = pts.length === 1;
    if (!last && dist < (pts.length > 2 ? 25 : 4)) { pts.shift(); return; }
    const vmax = last ? 8 : 200;
    const brake = Math.min(s.limits.retro, s.limits.lateral, s.limits.down) / s.effMass * .35;
    const v = Math.min(vmax, Math.sqrt(2 * brake * dist) * .7, dist * .1);
    const vW = this._vb.copy(dl).setLength(v).applyQuaternion(host.quat); // relative to the host
    this.slew(A, this._va.copy(vW).add(host.pointVelocity(local, _b)));
    const hostUp = _c.set(0, 1, 0).applyQuaternion(host.quat);
    const near = local.length() < host.type.radius + 500;
    if (near) {
      const into = this.appr.zone.kind === 'pad' ? _d.set(0, 0, -1) : _d.fromArray(this.appr.zone.mouth.normal).negate();
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
    else {
      // a flight bay: the pad picked on the way in (or the nearest), nose to the mouth
      const pads = z.pads || [];
      if (!this.pad || !pads.includes(this.pad)) this.pad = pads.reduce((b, p) => (!b || Math.hypot(p[0] - s.lpos.x, p[2] - s.lpos.z) < Math.hypot(b[0] - s.lpos.x, b[2] - s.lpos.z) ? p : b), null) || [s.lpos.x, z.min[1], s.lpos.z];
      spot = _a.set(this.pad[0], this.pad[1], this.pad[2]);
      this.lnose.fromArray(z.mouth ? z.mouth.normal : [0, 0, -1]);
    }
    const hoff = _b.copy(spot).sub(s.lpos).setY(0);
    const hd = hoff.length();
    const agl = isFinite(s.agl) ? s.agl : s.lpos.y - spot.y;
    if (hd > 3) {
      // across the deck at height, slowing into the spot
      const brake = Math.min(s.limits.retro, s.limits.lateral) / s.effMass * .35;
      const hv = Math.min(z.kind === 'pad' ? 3 : 12, Math.sqrt(2 * brake * hd) * .7, hd * .15);
      this.lvel.copy(hoff).setLength(hv);
      this.lvel.y = THREE.MathUtils.clamp((Math.min(z.max[1] - 10, spot.y + 12) - s.lpos.y) * 0.4, -3, 3);
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
    if (['orbit','park'].includes(this.dest?.kind) && !this.ship.landed && !this.ship.parent) this.ship.assist = 1;
    this.cancel(null);
    this.say(msg, 'nav');
    if (this.game.players.some((p) => this.game.focusOf(p) === this.ship) && this.game.audio && this.game.audio.clunk) this.game.audio.clunk();
  }

  // ---- alongside another ship (or you), then keep station

  // stand-off from the other: clear of both hulls (and of a big ship's 2 km FTL lock, for a big ship)
  standOff() {
    const o = this.other, s = this.ship;
    const r = o.type?.radius || o.v?.type.radius || 0;
    return s.big ? r + s.type.radius + 1500 : r + s.type.radius + 60;
  }

  meetPhase(A) {
    const s = this.ship, o = this.other;
    if (o.body !== s.body && o.getWorldPos(_a).distanceTo(s.getWorldPos(_b)) > NEAR) { this.legs = this.plan(); this.go('align'); return; }
    const P = o.getWorldPos(this._va);
    const V = o.getWorldVel(this._vb);
    const rel = _a.copy(s.getWorldPos(_b)).sub(P); // from it to us
    const dist = rel.length();
    const want = this.standOff();
    // to the stand-off point on our side of it
    const goal = _b.copy(rel).setLength(want).add(P);
    const dl = _c.copy(goal).sub(s.getWorldPos(_d));
    const gd = dl.length();
    const aB = Math.min(s.limits.retro, s.limits.lateral, s.limits.down) / s.effMass * .35;
    const v = Math.min(s.big ? 120 : 200, Math.sqrt(2 * aB * gd) * .65, gd / (maneuverAuthority(s).turn * 2 + 25));
    const vAbs = dl.setLength(v).add(V).sub(s.body.vel);
    this.slew(A, vAbs);
    const dv = _d.copy(vAbs).sub(s.vel);
    if (dv.length() > 20) this.point(A, dv, _a.set(0, 1, 0).applyQuaternion(s.quat));
    else this.point(A, _a.copy(P).sub(s.getWorldPos(_d)), _b.set(0, 1, 0).applyQuaternion(s.quat)); // face it
    this.aim(P, o.name.toUpperCase());
    if (gd < Math.max(25, want * 0.05) && s.vel.clone().add(s.body.vel).sub(V).length() < 2) {
      this.say(`alongside ${o.name} · ${Math.round(dist)} m`, 'nav');
      this.startStation(o);
    }
  }

  // keep station: beside a ship / you (its frame), or here (over the ground
  // in a world's frame, or beside the nearest big ship)
  startStation(o = null) {
    const s = this.ship, g = this.game, h = this.hold;
    h.ref = o;
    if (!o) {
      let best = null, bd = 30000;
      for (const v of g.vessels) {
        if (!v.big || v.dead || v === s || v.body !== s.body) continue;
        const d = v.pos.distanceTo(s.pos) - v.type.radius;
        if (d < bd) { bd = d; best = v; }
      }
      if (best) h.ref = best;
    }
    if (h.ref && h.ref.v) h.ref = h.ref.v;
    if (h.ref && h.ref.bodyToLocal) h.ref.bodyToLocal(s.pos, h.local);
    else if (h.ref) h.local.copy(s.getWorldPos(_a)).sub(h.ref.getWorldPos(_b));
    else h.posF.copy(s.pos).applyQuaternion(s.body.qInv);
    if (!h.ref && !s.body.solid) {
      // nothing to hold against over a giant: coast in orbit instead
      this.done(`coasting in orbit of ${s.body.data.name}`);
      return;
    }
    if (!h.ref && s.big) { this.done(`coasting in orbit of ${s.body.data.name}`); return; }
    this.go('station');
  }

  station(A) {
    const s = this.ship, h = this.hold, b = s.body;
    let goal, vRef;
    if (h.ref && h.ref.bodyToLocal) {
      goal = h.ref.localToBody(h.local, this._va);
      vRef = h.ref.pointVelocity(h.local, this._vb);
    } else if (h.ref) {
      goal = h.ref.getWorldPos(this._va).add(h.local).sub(b.pos);
      vRef = h.ref.getWorldVel(this._vb).sub(b.vel);
    } else {
      // over the ground: a fixed point in the world's turning frame
      goal = this._va.copy(h.posF).applyQuaternion(b.q);
      vRef = this._vb.copy(b.omega).cross(goal);
    }
    const err = _a.copy(goal).sub(s.pos);
    const e = err.length();
    const corr = Math.min(s.big ? 20 : 40, e * (s.big ? 0.05 : 0.3));
    this.slew(A, _b.copy(err).setLength(corr).add(vRef));
    if (!h.ref) this.level(A, null);
    this.aimLabel = '';
  }

  // ---- a parking orbit around the world it's at

  parkRadius(b) {
    const s = this.ship;
    const relief = b.relief * 1.6;
    const low = b.R + Math.max((b.atm ? b.atmHeight * 1.3 : 0), relief + 15000, 30000);
    // big ships stay out of the air and the FTL lock, where the fleet parks
    return s.big ? Math.max(low, lockRadius(b) * 1.05) : low;
  }

  parkPhase(A) {
    this.startOrbital('park', () => this.done(`parked in orbit of ${this.ship.body.data.name}`));
    this.orbitalPhase(A);
  }
}
