// Dev-only browser test helpers (not loaded by the game).
// In the page:  const T = await import('/tools/testkit.js'); await T.ready();

const g = () => window.game;

export async function ready(timeoutMs = 25000) {
  const t0 = performance.now();
  while (!(window.game && window.game.state) && performance.now() - t0 < timeoutMs) await new Promise((r) => setTimeout(r, 200));
  await window.debugRun(timeoutMs, 16, (n, gm) => gm.state !== 'playing' || n < 10);
  window.launch();
  await window.debugRun(300, 16);
  window.debugHold = true; // the free-running loop stays idle between test calls
  return g().state;
}

export function basisQuat(x, y, z) { // rotation-matrix columns -> quaternion
  const Q = g().ship.quat.constructor;
  const m00 = x.x, m01 = y.x, m02 = z.x, m10 = x.y, m11 = y.y, m12 = z.y, m20 = x.z, m21 = y.z, m22 = z.z;
  const tr = m00 + m11 + m22;
  let qw, qx, qy, qz;
  if (tr > 0) { const S = Math.sqrt(tr + 1) * 2; qw = 0.25 * S; qx = (m21 - m12) / S; qy = (m02 - m20) / S; qz = (m10 - m01) / S; }
  else if (m00 > m11 && m00 > m22) { const S = Math.sqrt(1 + m00 - m11 - m22) * 2; qw = (m21 - m12) / S; qx = 0.25 * S; qy = (m01 + m10) / S; qz = (m02 + m20) / S; }
  else if (m11 > m22) { const S = Math.sqrt(1 + m11 - m00 - m22) * 2; qw = (m02 - m20) / S; qx = (m01 + m10) / S; qy = 0.25 * S; qz = (m12 + m21) / S; }
  else { const S = Math.sqrt(1 + m22 - m00 - m11) * 2; qw = (m10 - m01) / S; qx = (m02 + m20) / S; qy = (m12 + m21) / S; qz = 0.25 * S; }
  return new Q(qx, qy, qz, qw).normalize();
}

export function body(name) { return g().universe.bodies.find((b) => b.data.name === name); }

// Float on EVA at a point in a ship's own frame (x starboard, y up, z aft),
// moving with it, looking at another point in that frame. For screenshots
// of a ship from outside, or of its rooms from inside.
export function vantage(v, local, lookLocal) {
  const gm = g(), p = gm.player, V = v.pos.constructor;
  if (p.vessel) p.vessel.pilotPresent = false;
  p.vessel = null; p.mode = 'eva'; p.body = v.body;
  p.ePos.copy(v.localToBody(new V(...local), new V()));
  p.eVel.copy(v.pointVelocity(new V(...local), new V()));
  const fwd = new V(...lookLocal).sub(new V(...local)).normalize().applyQuaternion(v.quat);
  const up = new V(0, 1, 0).applyQuaternion(v.quat);
  const right = fwd.clone().cross(up).normalize();
  const up2 = right.clone().cross(fwd).normalize();
  p.evaQuat.copy(basisQuat(right, up2, fwd.clone().negate()));
  gm.camMode = 'first';
}

// Seat the pilot in a circular, level, prograde orbit altM above a body.
export function orbit(name, altM, dir = [0.3, 0.8, 0.52]) {
  const gm = g(), s = gm.ship, p = gm.player, V = s.pos.constructor;
  const b = body(name);
  if (s.parent) s.leaveParent();
  p.sitDown(0, s); s.rampTarget = 0; s.ramp = 0; s.gearTarget = 0; s.gear = 0;
  s.body = b; s.landed = false; s.rails = false; s.dead = false;
  const r = b.R + altM;
  const radial = new V(...dir).normalize();
  s.pos.copy(radial).multiplyScalar(r);
  const tang = new V(0, 0, 1).cross(radial).normalize();
  s.vel.copy(tang).multiplyScalar(Math.sqrt(b.GM / r));
  s.targetVel.copy(s.vel); s.targetFrame = 'inertial';
  s.quat.copy(basisQuat(tang.clone().cross(radial).normalize(), radial, tang.clone().negate()));
  s.angVel.set(0, 0, 0);
  gm.target = b;
  return b;
}

export function pitchDeg() {
  const s = g().ship, V = s.pos.constructor;
  const up = s.pos.clone().normalize();
  const nose = new V(0, 0, -1).applyQuaternion(s.quat);
  return Math.asin(Math.max(-1, Math.min(1, nose.dot(up)))) * 57.2958;
}

// Simulated mouse: hold the virtual stick so the nose tracks a pitch angle.
export function holdPitch(targetDeg) {
  const s = g().ship;
  const err = (targetDeg - pitchDeg()) / 57.2958;
  s.stick.set(0, -Math.max(-1, Math.min(1, err * 2.5)) / 0.93);
}

// a vessel's place in the nesting: its frames from itself up to the body,
// e.g. "Mule [Container hold, parked] < Container 1 [Cargo cradle, parked] < Atlas < Moadeal"
export function chain(v) {
  const out = [];
  for (let h = v; h; h = h.parent) out.push(h.name + (h.zone ? ` [${h.zone.name}${h.attached ? ', parked' : ''}]` : (h.landed ? ' [landed]' : '')));
  out.push(v.body.data.name);
  return out.join(' < ');
}

// run frames with keys held (and an optional per-frame callback that may
// return false to stop): drive a cart, fly a lifter
export async function hold(ms, codes, onFrame = null) {
  keys(...codes);
  await window.debugRun(ms, 16, (n, gm) => (onFrame ? onFrame(n, gm) : undefined));
  keys();
}

export function keys(...codes) {
  const inp = g().input;
  inp.keys.clear();
  for (const c of codes) inp.keys.add(c);
}

export function telemetry() {
  const s = g().ship, V = s.pos.constructor;
  const up = s.pos.clone().normalize();
  const sv = s.surfaceVel(new V());
  return {
    body: s.body.data.name, alt: Math.round(s.altitude), agl: +s.agl.toFixed(1),
    vUp: +sv.dot(up).toFixed(1), vS: Math.round(sv.length()), fr: s.targetFrame[0],
    cr: Math.round(s.cruise), cl: +s.climb.toFixed(1), pitch: Math.round(pitchDeg()),
    hull: +s.hull.toFixed(2), legs: s.legState.join(''), landed: s.landed, dead: s.dead, warp: g().warp,
  };
}

// Run frames with a per-frame controller; always leaves the game safe
// (keys released, warp x1) so the free-running loop between calls is idle.
export async function fly(ms, controller, every = 60) {
  const log = [];
  const gm = g();
  await window.debugRun(ms, 16, (n) => {
    const r = controller(n, gm);
    if (n % every === 0) log.push(telemetry());
    if (r === false || gm.ship.dead) return false;
  });
  keys();
  gm.ship.stick.set(0, 0);
  if (gm.warp > 1) gm.setWarp(0);
  log.push(telemetry());
  return log;
}

// ---------------------------------------------------------------- stubbed controllers
// Fake standard gamepads for tests (navigator.getGamepads replaced). pads(n)
// connects n of them; pad(i) returns one to drive: press('START'), release,
// tap (press for a few frames), stick(lx, ly, rx, ry). Indices are the
// gamepad indices the game sees (player 2 joins with window.joinP2(i)).
const BTN_I = { A: 0, B: 1, X: 2, Y: 3, LB: 4, RB: 5, LT: 6, RT: 7, VIEW: 8, START: 9, L3: 10, R3: 11, UP: 12, DOWN: 13, LEFT: 14, RIGHT: 15 };
export function pads(n) {
  const list = [];
  for (let i = 0; i < n; i++) {
    const gp = { index: i, id: `Test pad ${i + 1}`, connected: true, mapping: 'standard', timestamp: 0,
      buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })), axes: [0, 0, 0, 0] };
    gp.press = (b) => { gp.buttons[BTN_I[b]].pressed = true; gp.buttons[BTN_I[b]].value = 1; };
    gp.release = (b) => { gp.buttons[BTN_I[b]].pressed = false; gp.buttons[BTN_I[b]].value = 0; };
    gp.tap = async (b, frames = 3) => { gp.press(b); await window.debugRun(frames * 16, 16); gp.release(b); await window.debugRun(48, 16); };
    gp.stick = (lx = 0, ly = 0, rx = 0, ry = 0) => { gp.axes[0] = lx; gp.axes[1] = ly; gp.axes[2] = rx; gp.axes[3] = ry; };
    list.push(gp);
  }
  window._testPads = list;
  navigator.getGamepads = () => window._testPads;
  return list;
}
export function pad(i) { return window._testPads[i]; }
