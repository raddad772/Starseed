// Where the craft you fly is coming down: the projected landing spot, so the ground there is
// made first (sim/terrainTiles.js: the finest tiles in a spiral round it, then a strip back
// along the approach, then outward), before the camera is near enough to ask for it. The nav
// computer's site when it flies to one; by hand, where the present course meets the ground,
// falling under gravity over the turning world. A spot that has held still a few seconds is
// `settled`: the near field and the ground's meshes are anchored only there (a hand-flown spot
// wanders; the tiles made on the way are kept all the same).
import * as THREE from 'three';

const MANUAL_ALT = 30000;     // m: lower than this, coming down by hand projects a spot
const MANUAL_T = 300;         // s: no further ahead than this
const SETTLE_M = 150, SETTLE_S = 3;   // a spot within this of where it was this long ago has settled

const _v = new THREE.Vector3(), _w = new THREE.Vector3(), _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _d = new THREE.Vector3();

// where a free fall from inertial (body-centred) position p, velocity v meets body b's ground,
// as a body-fixed unit direction into out, or null within MANUAL_T
function fallsTo(b, p0, v0, t0, out) {
  const p = _p.copy(p0), v = _w.copy(v0), top = b.R + (b.relief || 0) * 1.6 + 300;
  let t = 0;
  for (let k = 0; k < 2000 && t < MANUAL_T; k++) {
    const r = p.length(), speed = Math.max(1, v.length());
    const dt = Math.min(4, Math.max(0.1, (r - b.R) / speed * 0.2));
    v.addScaledVector(p, -b.GM / (r * r * r) * dt); p.addScaledVector(v, dt); t += dt;
    const rr = p.length();
    if (rr > top) continue;
    // (the ground there when the craft is: the world turned on by then)
    if (b.orientationAt) b.orientationAt(t0 + t, _q); else _q.copy(b.q);
    _d.copy(p).applyQuaternion(_q.invert()).normalize();
    if (rr < b.R + b.groundHeight(_d)) return out.copy(_d);
  }
  return null;
}

// { body, dir (body-fixed unit, the spot), back (body-fixed unit tangent at the spot, toward the
// craft; null right over it), range (m over the ground from under the craft to the spot), agl,
// nav (flown there by the nav computer), settled }, or null
export function landingSpot(g, out = {}) {
  const p = g.player, v = p && p.mode === 'seat' ? p.vessel : null;
  if (!v || v.dead || v.landed || !v.body) return null;
  const nav = v.nav, d = nav && nav.active ? nav.dest : null;
  let b = null;
  out.dir = out.dir || new THREE.Vector3();
  out.back = out.back || new THREE.Vector3();
  if (d && d.kind === 'site' && d.dirF && d.body && d.body.solid) {
    b = d.body; out.dir.copy(d.dirF).normalize(); out.nav = true;
  } else {
    // by hand: where its course falls to the ground
    b = v.body;
    if (!b.solid || !(v.agl < MANUAL_ALT)) return null;
    if (!fallsTo(b, v.pos, v.vel, g.universe?.t ?? g.t ?? 0, out.dir)) { out.hist = null; return null; }
    out.nav = false;
  }
  // (settled: within SETTLE_M of where it was SETTLE_S ago; the nav computer's site always is)
  const now = performance.now() / 1000, h = out.hist || (out.hist = []);
  h.push({ t: now, d: out.dir.clone() });
  while (h.length > 2 && now - h[1].t > SETTLE_S) h.shift();
  out.settled = !!out.nav || (now - h[0].t >= SETTLE_S * 0.9 && h[0].d.angleTo(out.dir) * b.R < SETTLE_M);
  if (v.body !== b) return null;
  const here = _v.copy(v.pos).applyQuaternion(b.qInv).normalize();
  const c = THREE.MathUtils.clamp(here.dot(out.dir), -1, 1);
  out.range = Math.acos(c) * b.R;
  out.back.copy(here).addScaledVector(out.dir, -c);
  if (out.back.lengthSq() > 1e-12) out.back.normalize(); else out.back.set(0, 0, 0);
  out.body = b; out.agl = v.agl; out.vessel = v;
  return out;
}
