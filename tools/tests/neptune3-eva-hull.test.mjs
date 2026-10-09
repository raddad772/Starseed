// Neptune 3 from outside: a suit flown at it stops at its skin, from any side; the airlocks' outer
// doors and (ramp down) the garage stay reachable.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { HORIZON_TYPES } from '../../src/sim/layouts/horizon.data.js';
import { sweepSuit } from '../../src/sim/evaContacts.js';

const t = HORIZON_TYPES.horizon_neptune3;
const UP = new THREE.Vector3(0, 1, 0);
// (the colliders as the ship holds them, its ramp at open: 0 shut, 1 down)
function boxes(open) {
  const slabs = t.doors.filter(d => d.min).map(d => ({ min: d.min, max: d.max, hinge: d.hinge, angle: open * d.angle }));
  return t.hullColliders.concat(t.colliders, slabs);
}
const fly = (from, to, open = 0) => sweepSuit(new THREE.Vector3(...from), new THREE.Vector3(...to), UP, boxes(open)).pos;

test('Neptune 3 has its own outside collision', () => {
  assert.ok(Array.isArray(t.hullColliders) && t.hullColliders.length > 100);
});

test('a suit flown at the hull stops outside it, from above, below, the bow and both sides', () => {
  for (const z of [-22, -12, 0, 10, 20]) {
    assert.ok(fly([0, 14, z], [0, 1, z]).y > 4.4, `roof at z=${z}`);
    assert.ok(fly([0, -10, z], [0, 1, z]).y < -1.2, `belly at z=${z}`);
    for (const side of [-1, 1]) assert.ok(Math.abs(fly([side * 34, 2, z], [0, 2, z]).x) > 9, `side ${side} at z=${z}`);
  }
  assert.ok(fly([0, 2, -45], [0, 2, 0]).z < -24, 'bow');
});

test("the airlocks' outer doors are reachable from outside", () => {
  for (const e of t.entries.filter(e => e.airlock)) {
    const out = new THREE.Vector3(...e.outside).add(new THREE.Vector3(0, 1.5, 0));
    const away = out.clone().add(new THREE.Vector3(...e.heading).multiplyScalar(-8));
    assert.ok(fly(away.toArray(), out.toArray()).distanceTo(out) < 0.25, e.label);
  }
});

test('the garage is shut behind its ramp, and open to fly into with the ramp down', () => {
  assert.ok(fly([0, 2, 45], [0, 2, 18], 0).z > 24.5, 'ramp up');
  assert.ok(fly([0, 2.5, 45], [0, 2.5, 18], 1).z < 22, 'ramp down');
});
