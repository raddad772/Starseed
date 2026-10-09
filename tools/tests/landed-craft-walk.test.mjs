// On foot by a landed craft (sim/player.js collideCraft): its hull stops you, a lowered ramp is
// walked up, its roof stood on; every craft, not only shuttles.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { HORIZON_TYPES } from '../../src/sim/layouts/horizon.data.js';
import { Player } from '../../src/sim/player.js';

const R = 1e6, V = (...p) => new THREE.Vector3(...p);
// (a craft landed at the top of a world of radius R, upright; its ramp at open)
function craft(key, open = 0) {
  const t = HORIZON_TYPES[key];
  const slabs = (t.doors || []).filter(d => d.min).map(d => ({ min: d.min, max: d.max, hinge: d.hinge, angle: open * d.angle }));
  return { type: t, landed: true, pos: V(0, R, 0), quat: new THREE.Quaternion(), body: { qInv: new THREE.Quaternion() }, colliders: () => t.colliders.concat(slabs) };
}
// (feet at a point in the craft's frame, walked in steps toward another, as the game would each frame)
function walk(v, from, to, steps = 200) {
  const p = Object.create(Player.prototype);
  p.fPos = V(...from).add(v.pos); p.fVel = V(); p.grounded = true;
  const step = V(...to).sub(V(...from)).divideScalar(steps);
  for (let i = 0; i < steps; i++) { p.fPos.add(step); p.collideCraft(v); }
  return p.fPos.clone().sub(v.pos);
}

test('walking into a landed Lark stops at its hull, either side and at its bow', () => {
  const v = craft('horizon_lark'), ground = -1.2;
  for (const sd of [-1, 1]) {
    const at = walk(v, [sd * 8, ground, 0], [0, ground, 0]);
    assert.ok(Math.abs(at.x) > 3.2 && Math.abs(at.x) < 4.6, `side ${sd}: stopped at x=${at.x.toFixed(2)}`);
  }
  const bow = walk(v, [0, ground, -14], [0, ground, 0]);
  assert.ok(bow.z < -6 && bow.z > -8, `bow: stopped at z=${bow.z.toFixed(2)}`);
});

test("a landed Shorebird's lowered ramp is walked up; raised, it stops you", () => {
  const t = HORIZON_TYPES.horizon_shorebird, ramp = t.ramps[0];
  const ground = -(Math.min(...t.legAttach.map(p => p[1])) - t.legLength + 0.12);
  const up = walk(craft('horizon_shorebird', 1), [0, -ground, ramp.hinge[1] + 7], [0, -ground, ramp.hinge[1] + 0.6]);
  assert.ok(up.z < ramp.hinge[1] + 1.5, `ramp down: got to z=${up.z.toFixed(2)}`);
  assert.ok(up.y > -ground + 0.6, `ramp down: climbed to y=${up.y.toFixed(2)}`);
  const shut = walk(craft('horizon_shorebird', 0), [0, -ground, ramp.hinge[1] + 7], [0, -ground, ramp.hinge[1] + 0.6]);
  assert.ok(shut.z > ramp.hinge[1] + 0.3, `ramp up: stopped at z=${shut.z.toFixed(2)}`);
});

test("standing on a landed Neptune 3's roof", () => {
  // (on its dorsal terrace, whose deck is at 6.8 m: stood on it, not floating over it)
  const v = craft('horizon_neptune3'), p = Object.create(Player.prototype);
  p.fPos = V(0, 6.3, 0).add(v.pos); p.fVel = V(0, -3, 0); p.grounded = false;
  for (let i = 0; i < 20; i++) { p.fPos.y -= 0.05; p.collideCraft(v); }
  const at = p.fPos.clone().sub(v.pos);
  assert.ok(at.y > 6.7 && at.y < 6.85 && p.grounded, `roof: y=${at.y.toFixed(2)} grounded=${p.grounded}`);
});
