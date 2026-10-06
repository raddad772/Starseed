// The animals near the camera (LIFE.md 4): the world's herds about it (sim/fauna.js: their homes, their
// species, where each is at the world's time), each animal walked on the ground as it goes (its gait
// from its speed, its body to the slope under it, its head down while it grazes: render/creatureRender.js).
// What's the viewer's own for now: each herd's flight (from you, within its flight distance, the farther
// the bigger it is: Stankowich 2008; from a hunter that's come for it) and a hunter's dash at a herd it's
// come near; both drift back to the herd's own path when it's over (world state when worlds are shared).
import * as THREE from 'three';
import { faunaOf, herdsNear, herdAt, memberAt, flyerAt, dayClock, activeTime, activityAt } from '../sim/fauna.js';
import { Species, Creature, FlyerSpecies, Flyer } from './creatureRender.js';

const REACH = 1400, HIGH = 3000, CHASE_R = 90, CHASE_T = 12, COOL = 90;
const _p = new THREE.Vector3(), _g = new THREE.Vector3(), _u = new THREE.Vector3(), _f = new THREE.Vector3(), _x = new THREE.Vector3(), _z = new THREE.Vector3();
const _n = new THREE.Vector3(), _a = new THREE.Vector3(), _b = new THREE.Vector3(), _M = new THREE.Matrix4();
const herdO = { x: 0, z: 0, moving: false, speed: 0, hx: 0, hz: 1 }, memO = { x: 0, z: 0, moving: false, speed: 0, hx: 0, hz: 1, graze: 0 };
const fo = [{}, {}, {}], _q0 = new THREE.Vector3(), _q1 = new THREE.Vector3(), _q2 = new THREE.Vector3(), _acc = new THREE.Vector3();

// (how far off it sees you coming and runs: farther the bigger it is; a hunter lets you nearer)
const fleeDist = (sp) => (15 + 25 * Math.pow(sp.massKg / 50, 0.25)) * (sp.level >= 2 ? 0.4 : 1);
// (how far off it's drawn: ~1.5 px at the most)
const visDist = (sp) => Math.min(1200, Math.max(150, sp.design.len * 900));

export class FaunaSet {
  constructor(body, group) {
    this.body = body; this.group = group;
    this.species = new Map(); this.members = new Map(); this.herdState = new Map();
    this.herds = []; this.at = null; this.atT = -1e9; this.lastT = null; this.frame = 0;
    this.origin = new THREE.Vector3(); this.originSet = false;
    this.count = 0;
    this.tame = false;   // (tests: they don't run from you)
  }
  // camF: the camera, body-fixed; t: the world's time (s)
  update(camF, t) {
    const b = this.body, F = faunaOf(b);
    this.frame++;
    const dt = this.lastT == null ? 0 : Math.min(0.1, Math.max(0, t - this.lastT));
    this.lastT = t;
    if (!F || camF.length() - b.R > HIGH) { for (const sp of this.species.values()) sp.hide(); this.count = 0; return; }
    // (the herds about: again as the camera moves on, or a second on)
    if (!this.at || this.at.distanceTo(camF) > 80 || t - this.atT > 1 || t < this.atT) {
      this.at = (this.at || new THREE.Vector3()).copy(camF); this.atT = t;
      herdsNear(F, b, camF, REACH, this.herds);
    }
    // (the world's day now: each herd on its own active time, resting through its quiet hours)
    const clock = F.clock = dayClock(b, t);
    if (!this.originSet || this.origin.distanceTo(camF) > 600) { this.origin.set(Math.round(camF.x / 256) * 256, Math.round(camF.y / 256) * 256, Math.round(camF.z / 256) * 256); this.originSet = true; }
    const R = b.R, camAlt = camF.length() - R - b.groundHeight(_u.copy(camF).normalize());
    // the herds' own movement and flight
    const live = [], flocks = [];
    for (const h of this.herds) {
      if (h.flyer) { flocks.push(h); continue; }
      const sp = h.sp, D = sp.design;
      let st = this.herdState.get(h.id);
      if (!st) { st = { fx: 0, fz: 0, flee: false, chase: null, chaseT: 0, cool: 0, seen: 0, cx: 0, cz: 0, turn: 0, wT: 0 }; this.herdState.set(h.id, st); }
      st.seen = this.frame;
      st.tau = activeTime(clock, h, t); st.act = activityAt(clock, h, t);
      herdAt(b, h, st.tau, herdO);
      st.ox = herdO.x; st.oz = herdO.z; st.cx = herdO.x + st.fx; st.cz = herdO.z + st.fz;
      // (the camera in its frame: metres east and north of its home)
      _a.copy(camF).addScaledVector(_u.fromArray(h.home), -R);
      const kx = _a.x * h.E[0] + _a.y * h.E[1] + _a.z * h.E[2], kz = _a.x * h.N[0] + _a.y * h.N[1] + _a.z * h.N[2];
      const dCam = Math.hypot(kx - st.cx, kz - st.cz);
      if (dCam > visDist(sp) + h.roam * 0.2 + 60) continue;
      st.kx = kx; st.kz = kz; st.dCam = dCam;
      live.push(h);
    }
    // (hunters: one near a herd of the level under it dashes at it; the herd runs)
    for (const h of live) {
      const st = this.herdState.get(h.id);
      st.threat = null;
      if (!this.tame && camAlt < 40 && st.dCam < fleeDist(h.sp)) st.threat = [st.kx, st.kz];
    }
    for (const h of live) {
      if (h.level < 2) continue;
      const st = this.herdState.get(h.id);
      st.cool = Math.max(0, st.cool - dt);
      if (st.chase) {
        const prey = st.chase, ps = this.herdState.get(prey.id);
        st.chaseT += dt;
        if (!ps || ps.seen !== this.frame || st.chaseT > CHASE_T) { st.chase = null; st.cool = COOL; continue; }
        const [px, pz] = this.toFrame(prey, ps.cx, ps.cz, h);
        const dx = px - st.cx, dz = pz - st.cz, d = Math.hypot(dx, dz);
        if (d > 0.5) { const v = h.sp.design.run * dt; st.fx += dx / d * Math.min(v, d); st.fz += dz / d * Math.min(v, d); }
        // (the prey runs from it)
        const [hx, hz] = this.toFrame(h, st.cx, st.cz, prey);
        ps.threat = [hx, hz];
        continue;
      }
      if (st.cool > 0) continue;
      for (const o of live) {
        if (o.level !== h.level - 1) continue;
        const os = this.herdState.get(o.id), [ox, oz] = this.toFrame(o, os.cx, os.cz, h);
        if (Math.hypot(ox - st.cx, oz - st.cz) < CHASE_R) { st.chase = o; st.chaseT = 0; break; }
      }
    }
    for (const h of live) {
      const st = this.herdState.get(h.id), D = h.sp.design;
      if (st.chase) continue;
      const fd = fleeDist(h.sp);
      if (st.threat) {
        // (away from the threat, at a run, till it's twice its flight distance off; turned aside
        // where water's ahead)
        const dx = st.cx - st.threat[0], dz = st.cz - st.threat[1], d = Math.max(0.1, Math.hypot(dx, dz));
        st.flee = d < 2 * fd;
        if (st.flee) {
          const c = Math.cos(st.turn), s = Math.sin(st.turn), ux = (dx * c - dz * s) / d, uz = (dx * s + dz * c) / d;
          if (t >= st.wT || st.wT - t > 1) { st.wT = t + 0.5; if (this.waterAt(h, st.cx + ux * 12, st.cz + uz * 12)) st.turn += st.turn >= 0 ? 1.1 : -1.1; }
          st.fx += ux * D.run * 0.8 * dt; st.fz += uz * D.run * 0.8 * dt;
        }
      } else if (st.flee && Math.hypot(st.cx - st.kx, st.cz - st.kz) > 2 * fd) st.flee = false;
      if (!st.flee) st.turn = 0;
      // (back to its own path, at a walk, when nothing's after it and you're well off it)
      if (!st.threat && !st.flee && Math.hypot(st.ox - st.kx, st.oz - st.kz) > 2.5 * fd) { const l = Math.hypot(st.fx, st.fz), v = D.walk * 0.6 * dt; if (l > 0) { const k = Math.max(0, l - v) / l; st.fx *= k; st.fz *= k; } }
    }
    // each animal: where it is, its heading, its gait, its frame on the ground
    const draw = new Map();
    for (const h of live) {
      const st = this.herdState.get(h.id), sp = h.sp, D = sp.design, vis = visDist(sp);
      for (let i = 0; i < h.n; i++) {
        memberAt(b, h, i, st.tau, memO);
        const x = memO.x + st.fx, z = memO.z + st.fz;
        if (Math.hypot(x - st.kx, z - st.kz) > vis) continue;
        const key = h.id + '#' + i;
        let m = this.members.get(key);
        if (!m) { m = { cr: new Creature(this.speciesOf(sp), (h.key + i * 7919) >>> 0), x, z, hx: memO.hx, hz: memO.hz, v: 0, nT: 0, nrm: new THREE.Vector3(), seen: 0 }; this.members.set(key, m); }
        m.seen = this.frame;
        // (its velocity from where it was: its heading turns toward it, its gait from its speed)
        const vx = dt > 0 ? (x - m.x) / dt : 0, vz = dt > 0 ? (z - m.z) / dt : 0, v = Math.hypot(vx, vz);
        if (v > 25 * D.run || dt === 0) { m.x = x; m.z = z; }
        else {
          m.x = x; m.z = z;
          m.v += (Math.min(v, D.run * 1.2) - m.v) * Math.min(1, dt * 4);
          if (v > 0.05) {
            const want = Math.atan2(vx, vz), cur = Math.atan2(m.hx, m.hz);
            let da = want - cur; da -= Math.round(da / (2 * Math.PI)) * 2 * Math.PI;
            const a = cur + Math.sign(da) * Math.min(Math.abs(da), 4 * dt);
            m.hx = Math.sin(a); m.hz = Math.cos(a);
          }
        }
        m.cr.update(dt, m.v, st.flee || st.chase ? 0 : memO.graze, st.flee || st.chase ? 0 : Math.max(0, 1 - 2 * st.act));
        m.h = h;
        let list = draw.get(sp.key);
        if (!list) draw.set(sp.key, (list = []));
        list.push(m);
      }
    }
    // the flocks: each flyer where its flock's path has it, over the ground under the flock, headed along
    // its flight, banked into its turn
    for (const f of flocks) {
      // (roosting or down from the thermals through the night: not about)
      if (activityAt(clock, f, t) < 0.25) continue;
      const sp = f.sp, D = sp.design, vis = Math.min(1500, Math.max(150, D.span * 900));
      flyerAt(b, f, 0, t, fo[0]);
      this.onSphere(f, fo[0].x, fo[0].z, 0, _p);
      if (_p.distanceTo(camF) > vis + 300) continue;
      _u.copy(_p).normalize();
      const gh = Math.max(0, b.groundHeight(_u));
      for (let i = 0; i < f.n; i++) {
        flyerAt(b, f, i, t - 0.1, fo[0]); flyerAt(b, f, i, t, fo[1]); flyerAt(b, f, i, t + 0.1, fo[2]);
        this.onSphere(f, fo[0].x, fo[0].z, gh + fo[0].y, _q0); this.onSphere(f, fo[1].x, fo[1].z, gh + fo[1].y, _q1); this.onSphere(f, fo[2].x, fo[2].z, gh + fo[2].y, _q2);
        if (_q1.distanceTo(camF) > vis) continue;
        const key = f.id + '#' + i;
        let m = this.members.get(key);
        if (!m) { m = { fl: new Flyer(this.flyerSpeciesOf(sp), (f.key + i * 7919) >>> 0), M: new THREE.Matrix4(), seen: 0 }; this.members.set(key, m); }
        m.seen = this.frame;
        m.fl.update(dt, fo[1].flap);
        // (its frame: forward along its flight; banked as its turn's pull asks, tan(bank) = a / g)
        _f.copy(_q2).sub(_q0).normalize();
        _u.copy(_q1).normalize();
        _acc.copy(_q2).addScaledVector(_q1, -2).add(_q0).divideScalar(0.01);
        _z.copy(_f).negate();
        _x.crossVectors(_u, _z).normalize();
        const bank = Math.max(-0.9, Math.min(0.9, Math.atan2(-_acc.dot(_x), b.data.gravity || 9.81)));
        _g.crossVectors(_z, _x);
        _n.copy(_x).multiplyScalar(Math.cos(bank)).addScaledVector(_g, Math.sin(bank));
        _g.crossVectors(_z, _n);
        m.M.makeBasis(_n, _g, _z).setPosition(_q1.x - this.origin.x, _q1.y - this.origin.y, _q1.z - this.origin.z);
        let list = draw.get(sp.key);
        if (!list) draw.set(sp.key, (list = []));
        list.push(m);
      }
    }
    // (their pieces into each species' meshes)
    let count = 0;
    for (const [key, sp] of this.species) {
      const list = draw.get(key);
      if (!list) { sp.hide(); continue; }
      sp.begin(this.origin, list.length);
      for (const m of list) { if (m.fl) m.fl.write(m.M); else { this.frameOf(m, t); m.cr.write(_M); } }
      sp.end();
      count += list.length;
    }
    this.count = count;
    // (the gone: forgotten)
    if (this.frame % 60 === 0) {
      for (const [k, m] of this.members) if (this.frame - m.seen > 300) this.members.delete(k);
      for (const [k, s] of this.herdState) if (this.frame - s.seen > 600) this.herdState.delete(k);
    }
  }
  // a point (x, z) in herd a's frame into herd b's
  toFrame(a, x, z, b) {
    const R = this.body.R;
    _p.fromArray(a.home).multiplyScalar(R).addScaledVector(_u.fromArray(a.E), x).addScaledVector(_g.fromArray(a.N), z);
    _p.addScaledVector(_u.fromArray(b.home), -R);
    return [_p.x * b.E[0] + _p.y * b.E[1] + _p.z * b.E[2], _p.x * b.N[0] + _p.y * b.N[1] + _p.z * b.N[2]];
  }
  // water at (x, z) in herd h's frame
  waterAt(h, x, z) {
    const R = this.body.R;
    _p.fromArray(h.home).multiplyScalar(R).addScaledVector(_u.fromArray(h.E), x).addScaledVector(_g.fromArray(h.N), z);
    return this.body.isWaterAt(_p);
  }
  // a point (x, z) metres on herd or flock h's tangent plane, carried out to height y over the datum
  onSphere(h, x, z, y, out) {
    const R = this.body.R;
    out.fromArray(h.home).multiplyScalar(R).addScaledVector(_a.fromArray(h.E), x).addScaledVector(_b.fromArray(h.N), z);
    return out.normalize().multiplyScalar(R + y);
  }
  flyerSpeciesOf(sp) {
    let s = this.species.get(sp.key);
    if (!s) { s = new FlyerSpecies(sp.design, this.group); this.species.set(sp.key, s); }
    return s;
  }
  speciesOf(sp) {
    let s = this.species.get(sp.key);
    if (!s) { s = new Species(sp.design, this.group); this.species.set(sp.key, s); }
    return s;
  }
  // an animal's frame into _M: on the ground under it, up the slope's normal (half way to the vertical),
  // facing its heading, from the species' origin
  frameOf(m, t) {
    const b = this.body, h = m.h, D = h.sp.design, R = b.R;
    _p.fromArray(h.home).multiplyScalar(R).addScaledVector(_u.fromArray(h.E), m.x).addScaledVector(_g.fromArray(h.N), m.z);
    _u.copy(_p).normalize();
    // (the ground as it's drawn: the near field's floor where it's built, the heightfield's beyond; asked
    // again as it moves a step, the volume's search not cheap)
    if (!m.gp || m.gp.distanceToSquared(_p) > 0.09 || m.gnf !== (b.near && b.near.field)) {
      const g0 = b.groundHeight(_u);
      m.gh = b.near && b.near.field ? b.floorAt(_g.copy(_u).multiplyScalar(R + g0 + 0.3)) : g0;
      m.gp = (m.gp || new THREE.Vector3()).copy(_p); m.gnf = b.near && b.near.field;
    }
    const gh = m.gh;
    _g.copy(_u).multiplyScalar(R + gh);
    // (its heading on the ground)
    _f.fromArray(h.E).multiplyScalar(m.hx).addScaledVector(_a.fromArray(h.N), m.hz);
    // (the slope under it, now and then: the ground a body's length ahead and to its side)
    if (t >= m.nT || m.nT - t > 1) {
      const e = Math.max(0.3, D.len * 0.6);
      _x.crossVectors(_f, _u).normalize();
      _a.copy(_g).addScaledVector(_f, e).normalize(); const hf = b.groundHeight(_a); _a.multiplyScalar(R + hf).sub(_g);
      _b.copy(_g).addScaledVector(_x, e).normalize(); const hs = b.groundHeight(_b); _b.multiplyScalar(R + hs).sub(_g);
      _n.crossVectors(_b, _a).normalize();
      if (_n.dot(_u) < 0) _n.negate();
      m.nrm.copy(_n).add(_u).normalize();
      m.nT = t + 0.3;
    }
    const Y = _n.copy(m.nrm);
    _z.copy(_f).addScaledVector(Y, -_f.dot(Y)).normalize().negate();
    _x.crossVectors(Y, _z);
    _M.makeBasis(_x, Y, _z);
    _M.setPosition(_g.x + Y.x * D.hipH - this.origin.x, _g.y + Y.y * D.hipH - this.origin.y, _g.z + Y.z * D.hipH - this.origin.z);
  }
  dispose() { for (const sp of this.species.values()) sp.dispose(); this.species.clear(); this.members.clear(); }
}
