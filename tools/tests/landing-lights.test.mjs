import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { VESSEL_TYPES } from '../../src/sim/vesselTypes.js';
import { LandingLights, hasLandingLights, landingLightSpots } from '../../src/render/landingLights.js';
import { ClusteredLights } from '../../src/render/webgpu/clustered.js';

// a craft over a planet at (0, 0, -1e7) from the star (at the origin); sun: +1 overhead, -1 midnight
function craft(key, { sun = -1, agl = 300, gain = 8192 } = {}) {
 const body = { pos: new THREE.Vector3(0, 0, -1e7), solid: true };
 const universe = { star: { pos: new THREE.Vector3() }, sunIlluminance: () => 1 };
 const v = { type: VESSEL_TYPES[key], body, pos: new THREE.Vector3(0, 0, 6.4e6 * sun), agl, landed: false, gearTarget: 0, dead: false, parent: null,
  game: { universe, world: { sunGain: gain } }, getWorldPos(out) { return out.copy(this.pos).add(this.body.pos); } };
 return v;
}
const step = (L, s, dt = 1 / 60) => { for (let t = 0; t < s; t += dt) L.update(dt); };

test('flyable small and medium craft carry landing lights; big ships and ground vehicles do not', () => {
 const on = Object.keys(VESSEL_TYPES).filter((k) => hasLandingLights(VESSEL_TYPES[k]));
 for (const k of ['shuttle', 'yacht', 'pod', 'fighter', 'dropship', 'lifter', 'tender_yacht', 'horizon_neptune3', 'expedition_kestrel', 'pioneer_firefly']) assert.ok(on.includes(k), k);
 for (const k of ['carrier', 'tender', 'orbital_station', 'horizon_meridian', 'pioneer_caravan', 'cart', 'crate', 'tank', 'runabout', 'pioneer_trail']) assert.ok(!on.includes(k), k);
});

test('no beam falls on the craft\'s own legs, slung load or lowered ramp', () => {
 const cos = Math.cos(1.05);
 for (const [k, t] of Object.entries(VESSEL_TYPES)) {
  if (!hasLandingLights(t) || !t.legAttach) continue;
  const spots = landingLightSpots(t);
  assert.equal(spots.length, 3, k);
  const pts = [];
  for (const a of t.legAttach) for (let q = 0; q <= 8; q++) pts.push([a[0], a[1] - t.legLength * q / 8, a[2]]);
  const c = t.clamp;
  if (c) for (const i of [-1, 0, 1]) for (const j of [-1, 1]) for (const q of [-1, 0, 1]) pts.push([c.pos[0] + i * c.fits[0] / 2, c.pos[1] + j * c.fits[1] / 2, c.pos[2] + q * c.fits[2] / 2]);
  for (const r of t.ramps || []) for (const i of [-1, 0, 1]) for (let q = 0; q <= 6; q++) pts.push([i * r.width / 2, r.hinge[0] - 0.5 * r.length * q / 6, r.hinge[1] + Math.sign(r.hinge[1]) * 0.85 * r.length * q / 6]);
  for (const { pos, dir } of spots) {
   assert.ok(dir[1] < -0.9, `${k} aims down`);
   for (const p of pts) { const d = p.map((x, i) => x - pos[i]), l = Math.hypot(...d); assert.ok((d[0] * dir[0] + d[1] * dir[1] + d[2] * dir[2]) / l < cos, `${k}: [${p}] in the beam from [${pos}]`); }
  }
  assert.ok(spots[0].pos[2] < spots[1].pos[2] && spots[1].pos[0] < spots[2].pos[0], `${k}: nose, port aft, starboard aft`);
 }
});

test('automatic: dark and low, or dark with the gear down; off by day, high, docked or long landed', () => {
 const root = new THREE.Group(), v = craft('yacht'), L = new LandingLights(v, root);
 step(L, 1); assert.ok(L.on && L.level === 1 && L.group.visible, 'night, 300 m');
 v.agl = 2000; step(L, 1); assert.ok(!L.on && L.level === 0 && !L.group.visible, 'night, 2 km, gear up');
 v.gearTarget = 1; step(L, 0.1); assert.ok(L.on, 'night, 2 km, gear down');
 v.agl = 9000; step(L, 0.1); assert.ok(!L.on, 'gear down but 9 km up');
 v.agl = 50; v.pos.z = 6.4e6; step(L, 0.1); assert.ok(!L.on, 'midday');
 v.pos.z = -6.4e6; v.landed = true; step(L, 5); assert.ok(L.on, 'just landed');
 step(L, 20); assert.ok(!L.on, 'landed 25 s');
 v.landed = false; step(L, 0.1); assert.ok(L.on, 'lifted off');
 v.parent = {}; step(L, 0.1); assert.ok(!L.on, 'in a hangar');
 const parked = craft('pod'); parked.landed = true; const P = new LandingLights(parked, new THREE.Group()); step(P, 1); assert.ok(!P.on, 'found landed: not just down');
});

test('L flips them from how they are; the automatic choice takes over once it agrees', () => {
 const v = craft('fighter', { agl: 3000 }), L = new LandingLights(v, new THREE.Group());
 step(L, 0.1); assert.ok(!L.on);
 assert.equal(L.toggle(), true); step(L, 1); assert.ok(L.on && v.lightsForce === true, 'forced on, high up');
 v.agl = 200; step(L, 0.1); assert.ok(L.on && v.lightsForce == null, 'down low: automatic again');
 assert.equal(L.toggle(), false); step(L, 1); assert.ok(!L.on && L.level === 0, 'forced off, low');
 v.agl = 3000; step(L, 0.1); assert.ok(!L.on && v.lightsForce == null, 'climbed out: automatic again');
 v.agl = 200; step(L, 0.1); assert.ok(L.on, 'and back on coming down');
});

test('fade, light units and what the clustered renderer reads', () => {
 const v = craft('shuttle', { gain: 4096 }), root = new THREE.Group(), L = new LandingLights(v, root);
 L.update(0.25); assert.ok(L.level > 0.45 && L.level < 0.55, 'half up after 0.25 s');
 step(L, 1);
 const spot = L.lights[0];
 assert.ok(Math.abs(spot.intensity - L.cd / 1e5 * 4096) < 1e-9, 'candela over 1e5 lux, with the pre-exposure gain');
 assert.ok(spot.distance > 600 && spot.distance < 2000, `range ${spot.distance}`);
 // (the native renderer's light list: three spots, cones as built, gone when off)
 const camera = new THREE.PerspectiveCamera(); camera.position.set(0, 40, 60); camera.lookAt(0, 0, 0); camera.updateMatrixWorld();
 const scene = new THREE.Scene(); scene.add(root);
 const engine = { scene, view: { camera } }, C = Object.create(ClusteredLights.prototype);
 C.shadows = { slots: new WeakMap(), weights: new WeakMap() };
 let out = C.collect(engine);
 assert.equal(out.length, 3);
 for (const l of out) { assert.ok(Math.abs(l[11] - Math.cos(1.05)) < 1e-6 && Math.abs(l[13] - Math.cos(0.525)) < 1e-6 && l[12] === 1, 'spot cone'); assert.ok(l[4] > 0); }
 v.pos.z = 6.4e6; step(L, 1); out = C.collect(engine);
 assert.equal(out.length, 0, 'by day nothing is sent');
});
