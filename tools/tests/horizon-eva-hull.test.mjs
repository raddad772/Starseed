// Every Horizon ship from outside: a suit flown at any of its skins stops at the skin, wherever the
// ship isn't open; its airlocks' outer doors, its pads, and (ramp down) the hold behind a ramp stay
// reachable. (tools/blender/build_horizon.py: hull_colliders, exterior_physics)
import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { HORIZON_TYPES } from '../../src/sim/layouts/horizon.data.js';
import { sweepSuit } from '../../src/sim/evaContacts.js';

const UP = new THREE.Vector3(0, 1, 0), V = (...p) => new THREE.Vector3(...p);
// (the probes' reach below the eye and the suit's radius: evaContacts.js)
const FEET = 1.38, TOP = 0.06, R = 0.3;
const SHIPS = Object.values(HORIZON_TYPES);

function boxes(t, open) {
  const slabs = (t.doors || []).filter(d => d.min).map(d => ({ min: d.min, max: d.max, hinge: d.hinge, angle: open * d.angle }));
  return t.hullColliders.concat(t.colliders, slabs);
}
const fly = (t, from, to, open = 0) => sweepSuit(V(...from), V(...to), UP, boxes(t, open)).pos;
function section(sk, z) {
  const st = sk.stations;
  if (z < st[0][0] || z > st[st.length - 1][0]) return null;
  for (let i = 0; i + 1 < st.length; i++) if (st[i][0] <= z && z <= st[i + 1][0]) {
    const a = st[i], b = st[i + 1], f = (z - a[0]) / Math.max(b[0] - a[0], 1e-9);
    return [1, 2, 3].map(k => a[k] + (b[k] - a[k]) * f);
  }
}
// (a segment through any of the ship's open parts, sampled)
const inOpen = (t, p, m = 0.6) => t.hullOpen.some(o => [0, 1, 2].every(i => o.min[i] - m <= p[i] && p[i] <= o.max[i] + m));
const crossesOpen = (t, a, b, m) => { for (let i = 0; i <= 40; i++) { const f = i / 40; if (inOpen(t, a.map((v, k) => v + (b[k] - v) * f), m)) return true; } return false; };

for (const t of SHIPS) {
  const name = t.className.split(' —')[0];
  test(`${name} has its own outside collision`, () => {
    assert.ok(Array.isArray(t.hullColliders) && t.hullColliders.length > 50, `${t.hullColliders?.length} boxes`);
    assert.ok(t.skins?.length && t.hullOpen && t.hullStep);
  });

  test(`${name}: a suit flown at a skin stops at it, from above, below and both sides`, () => {
    const tol = t.hullStep * 0.5 + t.hullStep / 3 + 0.08, m = t.hullStep + 0.6;
    let checked = 0;
    for (const sk of t.skins) {
      const st = sk.stations, z0 = st[0][0], z1 = st[st.length - 1][0];
      for (const f of [0.15, 0.35, 0.5, 0.65, 0.85]) {
        const z = z0 + (z1 - z0) * f, [w, low, high] = section(sk, z), mid = (low + high) / 2, x = sk.x, reach = 30 + w;
        // (from above, its lowest probe; from below, its highest; from the sides, its flank)
        const tries = [
          [[x, high + reach, z], [x, high - 0.2, z], p => high - (p.y - FEET - R), [x, mid, z]],
          [[x, low - reach, z], [x, low + 0.2, z], p => (p.y - TOP + R) - low, [x, mid, z]],
          ...[-1, 1].map(sd => [[x + sd * (w + reach), mid + 0.7, z], [x + sd * (w - 0.2), mid + 0.7, z], p => sd * (x + sd * w) - sd * (p.x - sd * R), [x, mid + 0.7, z]]),
        ];
        for (const [from, to, sink, inner] of tries) {
          // (not where the ship is open, nor where another skin or part stands proud of this one)
          if (crossesOpen(t, from, inner, m)) continue;
          const p = fly(t, from, to);
          assert.ok(sink(p) < tol, `${name} skin at x=${x} z=${z.toFixed(1)}: ${from.map(v => v.toFixed(1))} sank ${sink(p).toFixed(2)} m into it`);
          checked++;
        }
      }
    }
    assert.ok(checked >= t.skins.length * 8, `${checked} checked`);
  });

  test(`${name}: its airlocks' outer doors are reachable from outside`, () => {
    for (const e of t.entries.filter(e => e.airlock && !e.internal)) {
      const depth = (t.lockPassages || []).find(p => p.airlock === e.airlock)?.depth || 0;
      const out = V(...e.outside).add(V(0, 1.8, 0)), away = out.clone().add(V(...e.heading).multiplyScalar(-(depth + 8)));
      assert.ok(fly(t, away.toArray(), out.toArray()).distanceTo(out) < 0.25, `${e.label} (${e.airlock}, passage ${depth} m)`);
    }
  });

  test(`${name}: its pads can be flown onto`, () => {
    for (const r of t.rooms.filter(r => r.type === 'exterior')) {
      const c = [(r.min[0] + r.max[0]) / 2, r.min[1] + 3, (r.min[2] + r.max[2]) / 2], size = r.max.map((v, i) => v - r.min[i]);
      const ways = [[0, 1, 0], [0, 0, -1], [0, 0, 1], [-1, 0, 0], [1, 0, 0]];
      assert.ok(ways.some(d => fly(t, c.map((v, i) => v + d[i] * (size[i] / 2 + 40)), c).distanceTo(V(...c)) < 0.25), r.name);
    }
  });

  const holds = t.rooms.filter(r => Object.values(r.gate || {}).some(id => (t.doors || []).some(d => d.id === id && d.ramp)));
  if (holds.length) test(`${name}: the hold behind its ramp is shut with the ramp up and open with it down`, () => {
    for (const r of holds) {
      const side = Object.keys(r.gate)[0], ax = side[1] === 'x' ? 0 : 2, sg = side[0] === '+' ? 1 : -1;
      const c = [(r.min[0] + r.max[0]) / 2, r.min[1] + 2.2, (r.min[2] + r.max[2]) / 2], from = [...c];
      from[ax] = (sg > 0 ? r.max[ax] : r.min[ax]) + sg * 25;
      assert.ok(fly(t, from, c, 1).distanceTo(V(...c)) < 0.25, `${r.name}: ramp down`);
      const shut = fly(t, from, c, 0);
      assert.ok(sg * (shut.getComponent(ax) - (sg > 0 ? r.max[ax] : r.min[ax])) > 0, `${r.name}: ramp up`);
    }
  });
}
