// Rocky worlds' rings (gen/rings.js: a moon torn apart near the Roche limit) and their boulders
// (sim/ringField.js): some rocky worlds have them, inside their innermost moon; the same however the
// system was got; a profile with zones and structure; boulders deterministic, in the slab, moving with
// the ring, and solid to a suit.
import test from 'node:test';
import assert from 'node:assert/strict';
import { generateSystem } from '../../src/gen/system.js';
import { addRockyRings, ringTau, ringSamples } from '../../src/gen/rings.js';
import { bouldersNear, ringFrame, collideSuitWithRing, inRing } from '../../src/sim/ringField.js';

const SEEDS = Array.from({ length: 60 }, (_, i) => `RING-${i}`);
const ringed = [];
let rocky = 0;
for (const seed of SEEDS) {
  const s = generateSystem(seed);
  for (const b of s.bodies) if (b.kind === 'planet' && (b.class === 'terrestrial' || b.class === 'dwarf')) { rocky++; if (b.rings) ringed.push({ s, b }); }
}

test('some rocky worlds have rings, inside their innermost moon and outside the planet', () => {
  assert.ok(ringed.length > rocky * 0.05 && ringed.length < rocky * 0.25, `${ringed.length} of ${rocky}`);
  for (const { s, b } of ringed) {
    const R = b.rings;
    assert.equal(R.kind, 'debris');
    assert.ok(R.innerReal > b.radiusM * 1.05 && R.outerReal > R.innerReal * 1.25, `${b.name}`);
    for (const id of b.moons) { const m = s.bodies[id]; assert.ok(m.orbit.aReal * (1 - m.orbitE) > R.outerReal * 1.25, `${b.name}: ${m.name} inside its ring`); }
    assert.match(R.origin, /moon, torn apart/);
  }
});

test('the same rings on a system from the cache or a bundle (added after, deterministic)', () => {
  for (const { s } of ringed.slice(0, 8)) {
    const bare = { ...s, bodies: s.bodies.map((b) => ({ ...b, rings: b.rings?.kind === 'debris' ? null : b.rings })) };
    addRockyRings(bare);
    assert.deepEqual(bare.bodies.map((b) => b.rings), s.bodies.map((b) => b.rings));
  }
});

test('its profile: nothing outside it, a faint inner zone, structure across it', () => {
  for (const { b } of ringed.slice(0, 10)) {
    const R = b.rings, t = ringSamples(R, 512);
    assert.equal(ringTau(R, R.inner * 0.99), 0); assert.equal(ringTau(R, R.outer * 1.01), 0);
    const inner = t.slice(5, 50).reduce((a, x) => a + x, 0) / 45, main = Math.max(...t);
    assert.ok(inner < main * 0.5, `${b.name}: inner zone ${inner.toFixed(3)} of ${main.toFixed(3)}`);
    const mid = Array.from(t.slice(180, 470)).sort((a, x) => a - x);
    assert.ok(mid.at(-15) / Math.max(mid[15], 1e-6) > (R.young > 0.5 ? 2.5 : 1.5), `${b.name}: too even`);
  }
});

const { b } = ringed.find(({ b }) => b.rings.tau0 > 0.2);
const body = { data: { rings: b.rings }, GM: b.GM, qTilt: { x: 0.12, y: 0.05, z: -0.08, w: Math.sqrt(1 - 0.12 ** 2 - 0.05 ** 2 - 0.08 ** 2) } };
const F = ringFrame(body), rr = b.rings.inner + 0.5 * (b.rings.outer - b.rings.inner);
const at = (r, y = 0) => ({ x: r * F.u[0] + y * F.n[0], y: r * F.u[1] + y * F.n[1], z: r * F.u[2] + y * F.n[2] });

test('boulders: the same for whoever asks, in the slab, going round with the ring', () => {
  const a = [], c = [];
  bouldersNear(body, at(rr), 1e6, 150, a); bouldersNear(body, at(rr), 1e6, 150, c);
  assert.ok(a.length > 20, `${a.length}`); assert.deepEqual(a, c);
  for (const o of a) {
    const y = o.x * F.n[0] + o.y * F.n[1] + o.z * F.n[2];
    assert.ok(Math.abs(y) <= 0.5 * b.rings.thickness, `${y}`);
    assert.ok(o.a >= 0.39 && o.a < 11);
  }
  // (a second on, each where its speed took it)
  const later = []; bouldersNear(body, at(rr), 1e6 + 1, 2000, later, 100000);
  const byId = new Map(later.map((o) => [o.id, o]));
  for (const o of a.slice(0, 20)) {
    const q = byId.get(o.id); assert.ok(q, 'found a second later');
    const moved = Math.hypot(q.x - o.x, q.y - o.y, q.z - o.z), v = Math.hypot(o.vx, o.vy, o.vz);
    assert.ok(Math.abs(moved - v) < 0.01 * v + 0.5, `moved ${moved} at ${v} m/s`);
  }
  assert.equal(bouldersNear(body, at(rr, b.rings.thickness + 400), 1e6, 150, []), 0);
  assert.ok(inRing(body, at(rr), 10) && !inRing(body, at(rr, 5000), 10) && !inRing(body, at(b.rings.outer + 1000), 10));
});

test('a suit put inside a boulder comes out of it', () => {
  const list = []; bouldersNear(body, at(rr), 1e6, 300, list);
  const o = list.find((q) => q.a > 1.5);
  const up = { x: F.n[0], y: F.n[1], z: F.n[2] };
  const pos = { x: o.x + up.x * 0.66, y: o.y + up.y * 0.66, z: o.z + up.z * 0.66 }, vel = { x: o.vx - up.x * 3, y: o.vy - up.y * 3, z: o.vz - up.z * 3 };
  collideSuitWithRing(body, pos, vel, up, 1e6);
  const d = Math.hypot(pos.x - up.x * 0.66 - o.x, pos.y - up.y * 0.66 - o.y, pos.z - up.z * 0.66 - o.z);
  assert.ok(d >= o.a + 0.74, `${d} of ${o.a}`);
});
