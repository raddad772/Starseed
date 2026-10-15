// A walker where weight points any way (site/fieldWalker.js), inside a spinning sphere: standing on its
// equator's floor at the spin's 1 g, walking round it (its up turning as it goes), a jump curving against the
// spin (Coriolis) and landing, and next to the axis no weight: floating.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { GeometryCollision } from '../../src/understructure/geometryCollision.js';
import { FieldWalker } from '../../src/understructure/site/fieldWalker.js';

const RS = 200, W = Math.sqrt(9.81 / RS);   // (a sphere 200 m across its middle, 1 g at its equator)
// the sphere's inside: its faces turned in (an icosphere's, reversed)
function sphereInside(r) {
  const g = new THREE.IcosahedronGeometry(r, 32).toNonIndexed(), p = g.attributes.position;
  for (let i = 0; i < p.count; i += 3) { const ax = p.getX(i), ay = p.getY(i), az = p.getZ(i); p.setXYZ(i, p.getX(i + 2), p.getY(i + 2), p.getZ(i + 2)); p.setXYZ(i + 2, ax, ay, az); }
  return new THREE.Mesh(g);
}
function spinningSphere() {
  const col = new GeometryCollision([sphereInside(RS)]);
  // (the spin's pull out from the axis (y), the spin itself for the Coriolis force)
  col.fieldAt = (p) => [W * W * p[0], 0, W * W * p[2]];
  col.omega = [0, W, 0];
  return col;
}
const run = (w, s, input = {}) => { for (let t = 0; t < s; t += 1 / 60) w.step(1 / 60, input); };
const rho = (p) => Math.hypot(p[0], p[2]);

test('on the equator\'s floor at the spin\'s 1 g; walking round it, the up turns and the feet stay down', () => {
  const col = spinningSphere();
  const w = new FieldWalker(col, { pos: [RS - 1, 0, 0], up: [-1, 0, 0], fwd: [0, 0, -1] });
  run(w, 2);
  assert.ok(w.grounded, 'grounded');
  assert.ok(Math.abs(rho(w.pos) - RS) < 0.2, `${rho(w.pos)}`);
  assert.ok(Math.abs(w.gravity - 1) < 0.02, `${w.gravity}`);
  // (walking 20 s round the equator: ~64 m on, ~18 degrees round; still on the floor, its up still in to the axis)
  const a0 = Math.atan2(w.pos[2], w.pos[0]);
  run(w, 20, { forward: 1 });
  const a1 = Math.atan2(w.pos[2], w.pos[0]), along = Math.abs(a1 - a0) * RS;
  assert.ok(along > 50 && along < 75, `${along}`);
  assert.ok(w.grounded && Math.abs(rho(w.pos) - RS) < 0.25, `${rho(w.pos)}`);
  const inward = [-w.pos[0] / rho(w.pos), 0, -w.pos[2] / rho(w.pos)];
  assert.ok(w.up[0] * inward[0] + w.up[2] * inward[2] > 0.999, JSON.stringify(w.up));
});

test('a jump straight up curves against the spin and comes down a little behind', () => {
  const col = spinningSphere();
  const w = new FieldWalker(col, { pos: [RS - 0.5, 0, 0], up: [-1, 0, 0], fwd: [0, 0, -1] });
  run(w, 1.5);
  const before = Math.atan2(w.pos[2], w.pos[0]);
  w.step(1 / 60, { jump: true });
  let t = 0;
  while (!w.grounded && t < 5) { w.step(1 / 60, {}); t += 1 / 60; }
  assert.ok(w.grounded && t > 0.4, `${t}`);
  // (the floor turns on under it while it's up: it lands against the spin's way (-z here), a few cm)
  const d = (Math.atan2(w.pos[2], w.pos[0]) - before) * RS;
  assert.ok(d < -0.005 && d > -0.5, `${d}`);
});

test('by the axis next to no weight: floating, the suit\'s jets move you', () => {
  const col = spinningSphere();
  const w = new FieldWalker(col, { pos: [0.3, 0, 0], up: [-1, 0, 0], fwd: [0, 1, 0] });
  run(w, 0.5);
  assert.ok(w.gravity < 0.01 && !w.grounded, `${w.gravity}`);
  const y0 = w.pos[1];
  run(w, 2, { forward: 1 });
  assert.ok(w.pos[1] - y0 > 1, `${w.pos[1] - y0}`);
});

test('a long fall onto the floor hurts: back to the last safe footing', () => {
  const col = spinningSphere();
  const w = new FieldWalker(col, { pos: [RS - 0.5, 0, 0], up: [-1, 0, 0], fwd: [0, 0, -1] });
  run(w, 1);
  const safe = w.pos.slice();
  // (thrown off a stair 60 m in: the floor comes up fast)
  w.pos = [RS - 60, 0, 0]; w.grounded = false; w.vel = [0, 0, 0];
  let said = null;
  for (let t = 0; t < 20 && !said; t += 1 / 60) { w.step(1 / 60, {}); said = w.takeAlert() === 'Returned to last safe footing' ? true : said; }
  assert.ok(said, 'recovered');
  assert.ok(Math.hypot(w.pos[0] - safe[0], w.pos[2] - safe[2]) < 1, JSON.stringify(w.pos));
});
