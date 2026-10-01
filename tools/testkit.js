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

// Seat the pilot in a circular, level, prograde orbit altM above a body.
export function orbit(name, altM, dir = [0.3, 0.8, 0.52]) {
  const gm = g(), s = gm.ship, p = gm.player, V = s.pos.constructor;
  const b = body(name);
  p.sitDown(0); s.rampTarget = 0; s.ramp = 0; s.gearTarget = 0; s.gear = 0;
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
