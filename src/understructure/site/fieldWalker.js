// A person where weight can point any way (Dave, 2026-10-15: the Hollow Moon): the site's field of gravity
// g(p) (m/s², a vector: a spinning sphere's pull out from its axis, a world's own toward its middle) sets their
// "up", which turns with it, their heading carried round as it does. On the ground they walk the plane under
// it, with momentum; off it they fly ballistically, in a spinning site's frame with the Coriolis force too (a
// jump or a fall curves against the spin); where there's next to no weight they float, pushing with the suit's
// jets. Collision is the site's along that up (geometryCollision.js clearUp, floorAlong). A landing too hard to
// walk away from (over ~11 m/s, a 6 m fall at 1 g) and they're back at their last safe footing.
// (SiteWalker is the same for a site whose weight is all straight down.)
import * as THREE from 'three';

const R = 0.4, STEP = 0.45, STEP_CLEAR = 0.25;
const WALK = 3.2, RUN = 5.6, JUMP = 3.7, G0 = 9.81;
// (below this much weight (in g), floating; and what lands harder than this (m/s) hurts)
const FLOAT_G = 0.012, HURT = 11;

const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const crossV = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];

export class FieldWalker {
  // spawn: { pos, up, fwd }
  constructor(collision, spawn) {
    this.col = collision;
    this.pos = spawn.pos.slice(); this.vel = [0, 0, 0];
    this.up = norm(spawn.up || [0, 1, 0]);
    this.fwd = norm(add(spawn.fwd || [0, 0, -1], this.up, -dot(spawn.fwd || [0, 0, -1], this.up)));
    this.pitch = 0; this.grounded = false; this.gravity = 0;
    this.safe = { pos: this.pos.slice(), up: this.up.slice(), fwd: this.fwd.slice() };
    this.alert = null; this.lastG = null;
  }

  get right() { return crossV(this.fwd, this.up); }
  // (turning: the heading round the up)
  turn(a) { const c = Math.cos(a), s = Math.sin(a), r = this.right; this.fwd = norm([this.fwd[0] * c + r[0] * s, this.fwd[1] * c + r[1] * s, this.fwd[2] * c + r[2] * s]); }
  look(a) { this.pitch = Math.max(-1.5, Math.min(1.5, this.pitch + a)); }

  // the camera's turn: its basis (right, up, back) then the pitch
  cameraQuaternion(out = new THREE.Quaternion()) {
    const r = this.right, b = [-this.fwd[0], -this.fwd[1], -this.fwd[2]];
    const m = new THREE.Matrix4().makeBasis(new THREE.Vector3(...r), new THREE.Vector3(...this.up), new THREE.Vector3(...b));
    return out.setFromRotationMatrix(m).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.pitch));
  }
  eye() { return add(this.pos, this.up, 1.68); }

  step(dt, input) {
    const n = Math.max(1, Math.ceil(dt / (1 / 120)));
    for (let i = 0; i < n; i++) this._step(dt / n, input);
  }

  // (the up turned toward u: the heading carried round with it, its pitch kept)
  _turnUp(u) {
    const f = this.fwd, d = dot(u, this.up);
    if (d > 0.999999) { this.up = u; return; }
    let nf = add(f, u, -dot(f, u));
    if (Math.hypot(...nf) < 1e-4) nf = add(this.up, u, -d);   // (looking straight along the new up: the old up's way)
    this.up = u; this.fwd = norm(nf);
  }

  _step(dt, input) {
    const c = this.col, p = this.pos, v = this.vel;
    const gv = c.fieldAt(p), gm = Math.hypot(gv[0], gv[1], gv[2]), g = gm / G0;
    // (weight's way and amount: said when it changes much)
    const was = this.lastG ?? g;
    if (was >= FLOAT_G && g < FLOAT_G) this.alert = 'Warning: zero gravity detected.';
    else if (was < FLOAT_G && g >= FLOAT_G) this.alert = 'Weight returning.';
    this.lastG = g; this.gravity = g;
    // (floating, your up stays as it was; with weight it turns toward the field's, no faster than ~2 rad/s, so
    // coming into weight near an axis it swings round rather than snapping your heading over)
    if (gm > 1e-6 && g >= FLOAT_G) {
      const t = norm([-gv[0] / gm, -gv[1] / gm, -gv[2] / gm]), d = Math.max(-1, Math.min(1, dot(t, this.up))), ang = Math.acos(d), mx = 2 * dt;
      if (ang <= mx) this._turnUp(t);
      else {
        // (a step of mx toward it, round the axis between them)
        let ax = crossV(this.up, t); const al = Math.hypot(...ax); ax = al > 1e-9 ? ax.map((x) => x / al) : norm(crossV(this.up, Math.abs(this.up[0]) < 0.9 ? [1, 0, 0] : [0, 0, 1]));
        const c = Math.cos(mx), s2 = Math.sin(mx), u = this.up, k = crossV(ax, u), kd = dot(ax, u);
        this._turnUp(norm([u[0] * c + k[0] * s2 + ax[0] * kd * (1 - c), u[1] * c + k[1] * s2 + ax[1] * kd * (1 - c), u[2] * c + k[2] * s2 + ax[2] * kd * (1 - c)]));
      }
    }
    const om = c.omega || null;
    // (the spinning frame's sideways pull on whatever moves through it: -2 w x v)
    const coriolis = (vv) => (om ? crossV(om, vv).map((x) => -2 * x) : [0, 0, 0]);
    if (g < FLOAT_G) return this._float(dt, input, gv, coriolis);
    const up = this.up, f = this.fwd, r = this.right;
    let fi = input.forward || 0, si = input.strafe || 0;
    const len = Math.hypot(fi, si); if (len > 1) { fi /= len; si /= len; }
    const speed = (input.fast ? RUN : WALK) / Math.sqrt(Math.max(1, g));
    const want = add(f.map((x) => x * fi * speed), r, si * speed);
    const vu = dot(v, up), vh = add(v, up, -vu);
    const accel = this.grounded ? 24 : 2.5 * Math.min(1, 1 / Math.max(g, 0.25));
    for (let i = 0; i < 3; i++) { const dv = want[i] - vh[i]; if (this.grounded || len > 0.01) vh[i] += Math.max(-accel * dt, Math.min(accel * dt, dv)); }
    let vNew = add(vh, up, vu);
    if (this.grounded && input.jump) { vNew = add(vNew, up, JUMP); this.grounded = false; }
    if (!this.grounded) { vNew = add(vNew, gv, dt); vNew = add(vNew, coriolis(vNew), dt); }
    v[0] = vNew[0]; v[1] = vNew[1]; v[2] = vNew[2];
    // (along the ground: with sliding)
    const h = add(v, up, -dot(v, up)), tryMove = (q) => c.clearUp(q, up, R, this.grounded ? STEP_CLEAR : 0.05);
    const q = add(p, h, dt);
    if (tryMove(q)) { p[0] = q[0]; p[1] = q[1]; p[2] = q[2]; }
    else {
      const hn = c.lastHit?.normal, nn = hn ? norm(add([hn.x, hn.y, hn.z], up, -(hn.x * up[0] + hn.y * up[1] + hn.z * up[2]))) : null;
      let moved = false;
      if (nn && Math.hypot(...nn) > 0.2) {
        const into = dot(v, nn);
        if (into < 0) { const vv = add(v, nn, -into); v[0] = vv[0]; v[1] = vv[1]; v[2] = vv[2]; }
        const q2 = add(add(p, add(v, up, -dot(v, up)), dt), nn, 0.01);
        if (tryMove(q2)) { p[0] = q2[0]; p[1] = q2[1]; p[2] = q2[2]; moved = true; }
      }
      if (!moved) { const vu2 = dot(v, up); v[0] = up[0] * vu2; v[1] = up[1] * vu2; v[2] = up[2] * vu2; }
    }
    // (up and down: the ground under the feet, the ceiling over the head)
    if (this.grounded) {
      const fl = this._support(p, up, STEP, STEP + 0.5);
      if (fl !== null && fl >= -0.5) { this._lift(fl); const vu3 = dot(v, up); v[0] -= up[0] * vu3; v[1] -= up[1] * vu3; v[2] -= up[2] * vu3; }
      else this.grounded = false;
    }
    if (!this.grounded) {
      const vu4 = dot(v, up), dy = vu4 * dt;
      if (vu4 > 0 && !c.clearUp(add(p, up, dy), up, R, 0)) { v[0] -= up[0] * vu4; v[1] -= up[1] * vu4; v[2] -= up[2] * vu4; }
      else {
        const fl = this._support(p, up, Math.max(0, dy) + 0.05, Math.abs(dy) + 0.6);
        if (vu4 <= 0 && fl !== null && dy <= fl) {
          this._lift(fl);
          const impact = -vu4; v[0] = v[1] = v[2] = 0; this.grounded = true;
          if (impact > HURT) { this.recover(); return; }
        } else { p[0] += up[0] * dy; p[1] += up[1] * dy; p[2] += up[2] * dy; }
      }
    }
    if (this.grounded && g >= 0.3) this.safe = { pos: p.slice(), up: up.slice(), fwd: this.fwd.slice() };
  }

  _lift(h) { const u = this.up; this.pos[0] += u[0] * h; this.pos[1] += u[1] * h; this.pos[2] += u[2] * h; }
  // (the ground under the capsule: its middle and four points round it)
  _support(p, up, top, drop) {
    const c = this.col, f = this.fwd, r = this.right;
    let best = c.floorAlong(p, up, top, drop);
    for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const q = [p[0] + (f[0] * a + r[0] * b) * R * 0.6, p[1] + (f[1] * a + r[1] * b) * R * 0.6, p[2] + (f[2] * a + r[2] * b) * R * 0.6];
      const h = c.floorAlong(q, up, top, drop);
      if (h !== null && (best === null || h > best)) best = h;
    }
    return best;
  }

  // next to no weight: drift with what you have, the suit's jets along the view; a soft bump off what you meet
  _float(dt, input, gv, coriolis) {
    const c = this.col, p = this.pos, v = this.vel;
    const cp = Math.cos(this.pitch), sp = Math.sin(this.pitch), f = this.fwd, u = this.up, r = this.right;
    const look = [f[0] * cp + u[0] * sp, f[1] * cp + u[1] * sp, f[2] * cp + u[2] * sp];
    const fi = input.forward || 0, si = input.strafe || 0, ui = (input.jump || input.up ? 1 : 0) - (input.down ? 1 : 0), a = 2.2;
    for (let i = 0; i < 3; i++) v[i] += (look[i] * fi + r[i] * si + u[i] * ui) * a * dt + gv[i] * dt;
    const cv = coriolis(v); for (let i = 0; i < 3; i++) v[i] += cv[i] * dt;
    if (input.brake) for (let i = 0; i < 3; i++) v[i] *= Math.max(0, 1 - 3 * dt);
    const s = Math.hypot(...v); if (s > 6) for (let i = 0; i < 3; i++) v[i] *= 6 / s;
    for (let i = 0; i < 3; i++) {
      const q = p.slice(); q[i] += v[i] * dt;
      if (c.clearUp(q, u, R, 0)) p[i] = q[i]; else v[i] *= -0.25;
    }
    this.grounded = false;
  }

  recover() {
    const s = this.safe;
    this.pos = s.pos.slice(); this.up = s.up.slice(); this.fwd = s.fwd.slice(); this.vel = [0, 0, 0];
    this.grounded = true; this.alert = 'Returned to last safe footing';
  }
  takeAlert() { const a = this.alert; this.alert = null; return a; }
}
