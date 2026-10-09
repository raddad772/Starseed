// A rocky world's ring up close (gen/rings.js): its boulders round a point, the same for whoever
// asks (the renderer draws them, the suit and the ships bump into them). Each is on its own circular
// orbit in the ring's plane (the planet's equator), at its own radius, so the inner ones overtake the
// outer (Kepler's shear: a ring is never still), tumbling slowly; how many by the ring's optical depth
// there, their sizes the power law a ring's particles follow (as many again for each halving of size:
// n(a) ~ a^-3), from ~0.4 m (smaller, the haze: webgpu/rings.js) to the odd one of ~10 m, spread
// through its thickness, thickest at the middle. Deterministic from the ring's seed, the place and
// the world's clock: nothing stored.
//
// They're found by cells 40 m square in the ring's plane, each 40 m band of radius going round at its
// own rate with its boulders (the shear between bands: the next band in slides past; within one, its
// boulders keep their places, which over a world's ages would otherwise scatter them from their cells).
import * as THREE from 'three';
import { ringTau } from '../gen/rings.js';
import { evaColliders, ballInBox } from './evaContacts.js';

export const CELL = 40;
const TAU2 = Math.PI * 2;

function hashU(a, b, c) {
  let x = (a ^ Math.imul(b, 0x27d4eb2d) ^ Math.imul(c, 0x165667b1)) >>> 0;
  x = Math.imul(x ^ (x >>> 16), 0x7feb352d) >>> 0; x = Math.imul(x ^ (x >>> 15), 0x846ca68b) >>> 0;
  return (x ^ (x >>> 16)) >>> 0;
}
// (a little generator from a cell's hash)
function stream(seed) { let s = seed >>> 0; return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// the ring's frame: n its normal (the planet's axis), u and w in its plane (w = n x u), world axes
export function ringFrame(b, out = { n: [0, 0, 0], u: [0, 0, 0], w: [0, 0, 0] }) {
  const q = b.qTilt, rot = (v, o) => {
    const [x, y, z] = v, qx = q.x, qy = q.y, qz = q.z, qw = q.w;
    const ix = qw * x + qy * z - qz * y, iy = qw * y + qz * x - qx * z, iz = qw * z + qx * y - qy * x, iw = -qx * x - qy * y - qz * z;
    o[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy; o[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz; o[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
  };
  rot([0, 1, 0], out.n); rot([1, 0, 0], out.u);
  const n = out.n, u = out.u; out.w[0] = n[1] * u[2] - n[2] * u[1]; out.w[1] = n[2] * u[0] - n[0] * u[2]; out.w[2] = n[0] * u[1] - n[1] * u[0];
  return out;
}

// whether rel (from the body's centre, world axes) is within margin of a ring's slab
export function inRing(b, rel, margin) {
  const R = b?.data?.rings;
  if (R?.kind !== 'debris') return false;
  const F = ringFrame(b, _f), y = rel.x * F.n[0] + rel.y * F.n[1] + rel.z * F.n[2];
  if (Math.abs(y) > 0.5 * R.thickness + margin) return false;
  const r = Math.sqrt(Math.max(rel.x * rel.x + rel.y * rel.y + rel.z * rel.z - y * y, 0));
  return r > R.inner - margin && r < R.outer + margin;
}

// The boulders within reach of rel (from the body's centre, world axes) at time t (s): pushed onto
// out as { x, y, z (from the body's centre), vx, vy, vz, a (radius, m), id, spin } and the count
// returned; at most max. lod: the small ones only nearer, in proportion (a 2.5 m one to reach, a
// 0.4 m one to a sixth of it), for drawing; 0 for all of them, for bumping into.
const _f = ringFrame({ qTilt: { x: 0, y: 0, z: 0, w: 1 } });
export function bouldersNear(b, rel, t, reach, out, max = 6000, lod = 0) {
  const R = b.data?.rings || b.rings;
  out.length = 0;
  if (R?.kind !== 'debris') return 0;
  const F = ringFrame(b, _f), H = R.thickness;
  const ry = rel.x * F.n[0] + rel.y * F.n[1] + rel.z * F.n[2];
  if (Math.abs(ry) > 0.5 * H + reach + 10) return 0;
  const ru = rel.x * F.u[0] + rel.y * F.u[1] + rel.z * F.u[2], rw = rel.x * F.w[0] + rel.y * F.w[1] + rel.z * F.w[2];
  const rc = Math.hypot(ru, rw);
  if (rc < R.inner - reach || rc > R.outer + reach) return 0;
  const phic = Math.atan2(rw, ru), GM = b.GM;
  const i0 = Math.floor((rc - reach) / CELL), i1 = Math.floor((rc + reach) / CELL);
  for (let i = i0; i <= i1; i++) {
    const ri = (i + 0.5) * CELL;
    const tau = ringTau(R, ri);
    if (tau <= 0) continue;
    const om = Math.sqrt(GM / (ri * ri * ri)), N = Math.max(1, Math.floor(TAU2 * ri / CELL));
    // (where the point is in this band's own turning frame)
    let rot = (phic - om * t) % TAU2; if (rot < 0) rot += TAU2;
    const jc = Math.floor(rot * ri / CELL), dj = Math.ceil(reach / CELL) + 1;
    // (a cell's boulders: as many as cover tau of its area, at a mean cross-section ~40 m^2)
    const lambda = Math.min(40, tau * CELL * CELL / 40);
    for (let j = jc - dj; j <= jc + dj; j++) {
      const jj = ((j % N) + N) % N, rnd = stream(hashU(R.seed, i, jj));
      // (Poisson, by its waits)
      let k = 0; for (let L = Math.exp(-lambda), p = rnd(); p > L && k < 80; p *= rnd()) k++;
      for (let m = 0; m < k; m++) {
        const dr = (rnd() - 0.5) * CELL, ds = rnd() * CELL, zz = (rnd() + rnd() + rnd() - 1.5) / 1.5 * 0.45 * H;
        const a = 0.4 / Math.sqrt(Math.max(1 - rnd() * 0.9984, 1e-6));   // (0.4 m up to ~10 m)
        const r = ri + dr, ph = (jj * CELL + ds) / ri + (om * t) % TAU2;
        const c = Math.cos(ph), s = Math.sin(ph);
        const x = r * (c * F.u[0] + s * F.w[0]) + zz * F.n[0], y = r * (c * F.u[1] + s * F.w[1]) + zz * F.n[1], z = r * (c * F.u[2] + s * F.w[2]) + zz * F.n[2];
        const dx = x - rel.x, dy = y - rel.y, dz = z - rel.z;
        const lim = lod ? reach * Math.min(1, Math.max(a / 2.5, 0.15)) : reach;
        if (dx * dx + dy * dy + dz * dz > (lim + a) * (lim + a)) { rnd(); continue; }
        const v = om * r;
        out.push({ x, y, z, vx: v * (-s * F.u[0] + c * F.w[0]), vy: v * (-s * F.u[1] + c * F.w[1]), vz: v * (-s * F.u[2] + c * F.w[2]), a, id: hashU(R.seed ^ 0x9e3779b9, i * 131 + m, jj), spin: rnd() });
        if (out.length >= max) return out.length;
      }
    }
  }
  return out.length;
}

// The suit against the boulders round it (a ball of 0.75 m round its middle, 0.66 m below the eye):
// pushed out of one, its speed into it taken (a little bounce). pos, vel: the suit's, from the body's
// centre (world axes); up: the suit's up. Returns the hardest knock (m/s), 0 for none.
const _list = [];
export function collideSuitWithRing(b, pos, vel, up, t) {
  if (b.data?.rings?.kind !== 'debris') return 0;
  const cx = pos.x - up.x * 0.66, cy = pos.y - up.y * 0.66, cz = pos.z - up.z * 0.66, r = 0.75;
  if (!bouldersNear(b, { x: cx, y: cy, z: cz }, t, 14, _list, 400)) return 0;
  let knock = 0;
  for (const o of _list) {
    let nx = cx - o.x, ny = cy - o.y, nz = cz - o.z; const d = Math.hypot(nx, ny, nz);
    if (d >= o.a + r) continue;
    // (out the way the suit's up, from right at its middle)
    if (d < 1e-6) { nx = up.x; ny = up.y; nz = up.z; } else { nx /= d; ny /= d; nz /= d; }
    const push = o.a + r - d;
    pos.x += nx * push; pos.y += ny * push; pos.z += nz * push;
    const vn = (vel.x - o.vx) * nx + (vel.y - o.vy) * ny + (vel.z - o.vz) * nz;
    if (vn < 0) { vel.x -= nx * vn * 1.2; vel.y -= ny * vn * 1.2; vel.z -= nz * vn * 1.2; knock = Math.max(knock, -vn); }
  }
  return knock;
}

// A ship against the boulders round it, by its own outside collision (evaContacts.js): a craft
// that's not hundreds of times a boulder's mass is pushed off it and knocked (Ship.impact: its hull
// takes it, hard enough it breaks); a bigger ship ploughs on, the boulder breaking on it.
const _local = new THREE.Vector3(), _n = new THREE.Vector3(), _vs = new THREE.Vector3();
export function collideShipWithRing(v, t) {
  const b = v.body;
  if (b?.data?.rings?.kind !== 'debris' || v.parent || v.landed || v.dead) return;
  const reach = (v.type.radius || 20) + 12;
  if (!bouldersNear(b, v.pos, t, reach, _list, 2000)) return;
  const rho = b.data.rings.icy ? 900 : 2000, mass = v.type.mass || 1e4;
  for (const o of _list) {
    if (mass > 300 * 4.19 * o.a ** 3 * rho) continue;
    v.bodyToLocal(_n.set(o.x, o.y, o.z), _local);
    let best = null;
    for (const box of evaColliders(v, _local)) { const h = ballInBox(_local, o.a, box); if (h && (!best || h.depth > best.depth)) best = h; }
    if (!best) continue;
    // (the normal from the ship to the boulder, world axes; the ship's point there's speed)
    const nW = _n.copy(best.normal).applyQuaternion(v.quat);
    v.pos.addScaledVector(nW, -best.depth);
    const vs = v.pointVelocity(_local, _vs);
    const vn = (o.vx - vs.x) * nW.x + (o.vy - vs.y) * nW.y + (o.vz - vs.z) * nW.z;
    if (vn < 0) { v.vel.addScaledVector(nW, 1.3 * vn); v.impact(-vn); }
  }
}
