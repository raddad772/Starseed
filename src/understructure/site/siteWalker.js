// A person in a site: walking with momentum, jumps that keep their speed,
// ballistic low gravity, floating in zero gravity, and a gentle recovery to
// the last safe footing after a long fall. Collision is SiteCollision's: the
// capsule against the drawn solids, the ground by a downward ray.

const R = 0.4;           // capsule radius
const STEP = 0.45;       // ground this far above the feet is stepped onto
const STEP_CLEAR = 0.25; // the capsule test ignores faces below this (must stay under R, or walls vanish)
const WALK = 3.2, RUN = 5.6;
const JUMP = 3.7;        // m/s: ~0.7 m at 1 g, ~2.8 m at 0.25 g
const G0 = 9.81;

export class SiteWalker {
  constructor(collision, spawn) {
    this.col = collision;
    this.pos = spawn.pos.slice();
    this.vel = [0, 0, 0];
    this.yaw = spawn.yaw ?? 0; this.pitch = 0;
    this.grounded = true;
    this.gravity = 1;
    this.safe = { pos: this.pos.slice(), yaw: this.yaw };
    this.footings = []; this.clock = 0; this.stalled = 0;   // (footings a moment back, for getting out of a wedge)
    this.fallTime = 0;
    this.alert = null;
  }

  step(dt, input) {
    // fixed substeps keep collision honest at speed
    const n = Math.max(1, Math.ceil(dt / (1 / 120)));
    for (let i = 0; i < n; i++) this._step(dt / n, input, i === 0);
  }

  _step(dt, input, first) {
    const c = this.col, p = this.pos, v = this.vel;
    const g = c.gravityAt(p[0], p[1], p[2]);
    if (g !== this.gravity) {
      this.alert = g === 0 ? 'Warning: zero gravity detected.' : g < 1 ? 'Warning: reduced gravity detected.' : g > 1 ? 'Warning: increased gravity detected.' : 'Regular planetary body gravity restored.';
      this.gravity = g;
      if (g > 0 && this.grounded === false) this.fallTime = 0;
    }
    if (first) { this.yaw += (input.turn || 0) * 1.8 * dt; this.pitch = Math.max(-1.45, Math.min(1.45, this.pitch + (input.look || 0) * 1.4 * dt)); }
    if (g === 0) return this._float(dt, input);

    // desired horizontal velocity from the keys, in the direction you face
    let f = input.forward || 0, s = input.strafe || 0;
    const len = Math.hypot(f, s); if (len > 1) { f /= len; s /= len; }
    const speed = (input.fast ? RUN : WALK) / Math.sqrt(Math.max(1, g));
    const sy = Math.sin(this.yaw), cy = Math.cos(this.yaw);
    const want = [(-sy * f + cy * s) * speed, (-cy * f - sy * s) * speed];
    const accel = this.grounded ? 24 : 2.5 * Math.min(1, 1 / Math.max(g, 0.25)); // little air control
    for (let k = 0; k < 2; k++) {
      const idx = k === 0 ? 0 : 2, dv = want[k] - v[idx];
      if (this.grounded || Math.abs(want[k]) > 0.01) v[idx] += Math.max(-accel * dt, Math.min(accel * dt, dv));
    }
    if (this.grounded && input.jump) { v[1] = JUMP; this.grounded = false; }

    // horizontal move with sliding
    const yNow = p[1];
    const tryMove = (x, z) => c.clear(x, yNow, z, R, this.grounded ? STEP_CLEAR : 0.05);
    const before = p.slice();
    // (shoved along by what's passing: a pressure front's, as a drift over the ground, not your own speed)
    const push = c.pushes?.length ? c.pushAt(p) : null;
    const nx = p[0] + (v[0] + (push ? push[0] : 0)) * dt, nz = p[2] + (v[2] + (push ? push[1] : 0)) * dt;
    if (tryMove(nx, nz)) { p[0] = nx; p[2] = nz; }
    else {
      // slide along what was hit: drop the part of the motion into it
      const h = c.lastHit?.normal, hn = h ? Math.hypot(h.x, h.z) : 0;
      let moved = false;
      if (hn > 0.2) {
        const n0 = h.x / hn, n1 = h.z / hn, into = v[0] * n0 + v[2] * n1;
        if (into < 0) { v[0] -= into * n0; v[2] -= into * n1; }
        const sx = p[0] + v[0] * dt + n0 * 0.01, sz = p[2] + v[2] * dt + n1 * 0.01;
        if (tryMove(sx, sz)) { p[0] = sx; p[2] = sz; moved = true; }
      }
      if (!moved) {
        if (tryMove(nx, p[2])) { p[0] = nx; v[2] = 0; }
        else if (tryMove(p[0], nz)) { p[2] = nz; v[0] = 0; }
        else { v[0] = 0; v[2] = 0; }
      }
    }

    // through a fold frame: out of the other one, turned with it
    const jump = c.portals?.length ? c.portal(before, p) : null;
    if (jump) {
      p[0] = jump.pos[0]; p[1] = jump.pos[1]; p[2] = jump.pos[2]; this.yaw -= jump.turn;
      const cs = Math.cos(jump.turn), sn = Math.sin(jump.turn), vx = v[0], vz = v[2];
      v[0] = vx * cs - vz * sn; v[2] = vx * sn + vz * cs;
      this.folded = (this.folded || 0) + 1;
    }
    // wedged (pushing, not moving, and nowhere to go): back to footing from a few seconds ago
    this.clock += dt;
    const pushing = Math.hypot(want[0], want[1]) > 0.5, gone = Math.hypot(p[0] - before[0], p[2] - before[2]);
    this.stalled = pushing && gone < 0.1 * speed * dt ? this.stalled + dt : 0;
    if (this.stalled > 0.6) {
      this.stalled = 0;
      let free = false;
      for (let k = 0; k < 8 && !free; k++) { const a = k * Math.PI / 4; free = tryMove(p[0] + Math.cos(a) * 0.15, p[2] + Math.sin(a) * 0.15); }
      if (!free) { const back = this.footings.find((q) => this.clock - q.t > 2 && Math.hypot(q.pos[0] - p[0], q.pos[2] - p[2]) > 2); if (back) { this.safe = { pos: back.pos.slice(), yaw: back.yaw }; this.recover(); return; } }
    }
    // vertical: gravity, ground, ceiling
    if (this.grounded) {
      const fl = c.supportAt(p[0], p[2], p[1] + STEP, R, STEP + 0.5);
      if (fl !== null && fl >= p[1] - 0.5) { p[1] = fl; v[1] = 0; }
      else { this.grounded = false; }
    }
    if (!this.grounded) {
      v[1] -= G0 * g * dt;
      const ny = p[1] + v[1] * dt;
      if (v[1] > 0 && !c.clear(p[0], ny, p[2], R, 0)) { v[1] = 0; }
      else {
        const fl = c.supportAt(p[0], p[2], Math.max(p[1], ny) + 0.05, R, Math.abs(v[1] * dt) + 0.6);
        if (v[1] <= 0 && fl !== null && ny <= fl) { p[1] = fl; v[1] = 0; this.grounded = true; }
        else p[1] = ny;
      }
    }
    if (this.grounded && this.fallFrom !== undefined && this.fallFrom - p[1] > 6) { this.fallFrom = undefined; this.recover(); return; }
    if (!this.grounded && this.fallFrom === undefined) this.fallFrom = p[1];
    if (this.grounded) {
      this.fallFrom = undefined;
      this.fallTime = 0;
      // remember solid footing (not mid-jump, not on a ledge edge in a low-g room)
      if (g >= 1 && Math.hypot(v[0], v[2]) < RUN + 0.1) { this.safe.pos = p.slice(); this.safe.yaw = this.yaw; }
      // (and every half second, while moving freely, into the few kept for a wedge, newest first)
      if (g >= 1 && this.stalled === 0 && (!this.footings.length || this.clock - this.footings[0].t > 0.5)) { this.footings.unshift({ pos: p.slice(), yaw: this.yaw, t: this.clock }); this.footings.length = Math.min(this.footings.length, 16); }
    } else if (v[1] < -2) {
      this.fallTime += dt;
      if (this.fallTime > 2.2 || p[1] < this.safe.pos[1] - 40) this.recover();
    }
  }

  // Zero gravity: drift with what you have, push with the chamber's tether.
  _float(dt, input) {
    const c = this.col, p = this.pos, v = this.vel;
    const cp = Math.cos(this.pitch), sy = Math.sin(this.yaw), cy = Math.cos(this.yaw);
    const fwd = [-sy * cp, Math.sin(this.pitch), -cy * cp], right = [cy, 0, -sy];
    const f = input.forward || 0, s = input.strafe || 0, u = (input.jump || input.up ? 1 : 0) - (input.down ? 1 : 0);
    const a = 2.2;
    for (let i = 0; i < 3; i++) v[i] += (fwd[i] * f + right[i] * s + (i === 1 ? u : 0)) * a * dt;
    if (input.brake) for (let i = 0; i < 3; i++) v[i] *= Math.max(0, 1 - 3 * dt);
    const sp = Math.hypot(...v); if (sp > 6) for (let i = 0; i < 3; i++) v[i] *= 6 / sp;
    for (let i = 0; i < 3; i++) {
      const q = p.slice(); q[i] += v[i] * dt;
      let ok = c.clear(q[0], q[1], q[2], R, 0);
      if (ok) { const fl = c.floorBelow(q[0], q[2], q[1] + 0.3, 0.6); if (fl !== null && fl > q[1]) ok = false; }
      if (ok) p[i] = q[i]; else v[i] *= -0.25; // a soft bump off walls and ceilings
    }
    this.grounded = false; this.fallTime = 0; this.fallFrom = undefined;
  }

  recover() {
    this.pos = this.safe.pos.slice(); this.yaw = this.safe.yaw;
    this.vel = [0, 0, 0]; this.grounded = true; this.fallTime = 0;
    this.alert = 'Returned to last safe footing';
  }

  takeAlert() { const a = this.alert; this.alert = null; return a; }
}
