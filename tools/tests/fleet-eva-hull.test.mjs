// Every fleet craft from outside (Horizon, Expedition, Pioneer): a suit flown at any of its skins
// stops at the skin, wherever the ship isn't open; its airlocks' outer doors, its pads, and (ramp
// down) the hold behind a ramp stay reachable. (tools/blender/exterior.py: hull_colliders,
// exterior_physics)
import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { HORIZON_TYPES } from '../../src/sim/layouts/horizon.data.js';
import { EXPEDITION_TYPES } from '../../src/sim/layouts/expedition.data.js';
import { PIONEER_TYPES } from '../../src/sim/layouts/pioneer.data.js';
import { sweepSuit } from '../../src/sim/evaContacts.js';

const UP = new THREE.Vector3(0, 1, 0), V = (...p) => new THREE.Vector3(...p);
// (the probes' reach below the eye and the suit's radius: evaContacts.js)
const FEET = 1.38, TOP = 0.06, R = 0.3;
const SHIPS = [...Object.values(HORIZON_TYPES), ...Object.values(EXPEDITION_TYPES), ...Object.values(PIONEER_TYPES)];

function boxes(t, open) {
  const slabs = (t.doors || []).filter(d => d.min).map(d => ({ min: d.min, max: d.max, hinge: d.hinge, angle: open * d.angle }));
  return t.hullColliders.concat(t.colliders, slabs);
}
const fly = (t, from, to, open = 0) => sweepSuit(V(...from), V(...to), UP, boxes(t, open)).pos;

// A skin's section at z as a polygon [[x, y], ...]: a lofted skin's squircle, or its rings between
// stations; and its z range
function zRange(sk) {
  const zs = sk.stations ? sk.stations.map(s => s[0]) : sk.rings.map(r => r[0]);
  return [zs[0], zs[zs.length - 1]];
}
function section(sk, z) {
  const list = sk.stations || sk.rings;
  for (let i = 0; i + 1 < list.length; i++) {
    const a = list[i], b = list[i + 1];
    if (z < a[0] || z > b[0]) continue;
    const f = (z - a[0]) / Math.max(b[0] - a[0], 1e-9);
    if (sk.rings) return a[1].map((p, n) => [p[0] + (b[1][n][0] - p[0]) * f, p[1] + (b[1][n][1] - p[1]) * f]);
    const [w, low, high] = [1, 2, 3].map(k => a[k] + (b[k] - a[k]) * f), mid = (low + high) / 2, half = (high - low) / 2;
    return Array.from({ length: 64 }, (_, n) => {
      const c = Math.cos((n + 0.5) * Math.PI / 32), s = Math.sin((n + 0.5) * Math.PI / 32);
      return [sk.x + w * Math.sign(c) * Math.sqrt(Math.abs(c)), mid + half * Math.sign(s) * Math.sqrt(Math.abs(s))];
    });
  }
  return null;
}
// (where a line across a section meets it: along y at x (axis 0), or along x at y (axis 1))
function across(poly, axis, v) {
  let lo = Infinity, hi = -Infinity;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    if ((a[axis] - v) * (b[axis] - v) > 0 || a[axis] === b[axis]) continue;
    const f = (v - a[axis]) / (b[axis] - a[axis]), u = a[1 - axis] + (b[1 - axis] - a[1 - axis]) * f;
    lo = Math.min(lo, u); hi = Math.max(hi, u);
  }
  return lo < hi ? [lo, hi] : null;
}
// (a segment through any of the ship's open parts, sampled)
const inOpen = (t, p, m) => t.hullOpen.some(o => [0, 1, 2].every(i => o.min[i] - m <= p[i] && p[i] <= o.max[i] + m));
const crossesOpen = (t, a, b, m) => { for (let i = 0; i <= 40; i++) { const f = i / 40; if (inOpen(t, a.map((v, k) => v + (b[k] - v) * f), m)) return true; } return false; };

for (const t of SHIPS) {
  const name = t.className.split(' —')[0];
  test(`${name} has its own outside collision`, () => {
    assert.ok(Array.isArray(t.hullColliders) && t.hullColliders.length > 15, `${t.hullColliders?.length} boxes`);
    assert.ok(t.skins?.length && t.hullOpen && t.hullStep);
  });

  test(`${name}: a suit flown at a skin stops at it, from above, below and both sides`, () => {
    const tol = t.hullStep * 0.5 + Math.min(t.hullStep / 3, 0.25) + Math.min(1, t.hullStep * 0.3) + 0.08, m = t.hullStep + 0.6;
    let checked = 0;
    for (const sk of t.skins) {
      const [z0, z1] = zRange(sk);
      for (const f of [0.15, 0.35, 0.5, 0.65, 0.85]) {
        const z = z0 + (z1 - z0) * f, poly = section(sk, z);
        const xs = poly.map(p => p[0]), ys = poly.map(p => p[1]);
        const x = (Math.min(...xs) + Math.max(...xs)) / 2, mid = (Math.min(...ys) + Math.max(...ys)) / 2;
        const vert = across(poly, 0, x), horiz = across(poly, 1, mid + 0.7);
        if (!vert || !horiz) continue;
        const [low, high] = vert, [left, right] = horiz, reach = 30 + (right - left);
        // (from above, its lowest probe; from below, its highest; from the sides, its flank)
        const tries = [
          [[x, high + reach, z], [x, high - 0.2, z], p => high - (p.y - FEET - R), [x, mid, z]],
          [[x, low - reach, z], [x, low + 0.2, z], p => (p.y - TOP + R) - low, [x, mid, z]],
          [[left - reach, mid + 0.7, z], [left + 0.2, mid + 0.7, z], p => (p.x + R) - left, [x, mid + 0.7, z]],
          [[right + reach, mid + 0.7, z], [right - 0.2, mid + 0.7, z], p => right - (p.x - R), [x, mid + 0.7, z]],
        ];
        for (const [from, to, sink, inner] of tries) {
          // (not where the ship is open)
          if (crossesOpen(t, from, inner, m)) continue;
          const p = fly(t, from, to);
          assert.ok(sink(p) < tol, `${name} skin at z=${z.toFixed(1)}: from ${from.map(v => v.toFixed(1))} sank ${sink(p).toFixed(2)} m into it`);
          checked++;
        }
      }
    }
    assert.ok(checked >= t.skins.length * 8, `${checked} checked`);
  });

  test(`${name}: its airlocks' outer doors are reachable from outside`, () => {
    for (const e of t.entries.filter(e => e.airlock && !e.internal)) {
      const depth = (t.lockPassages || []).find(p => p.airlock === e.airlock)?.depth || 0;
      // (straight in, or along the hull to it from either side or from above, where something stands
      // off the door: a Porter's rocket pod)
      const out = V(...e.outside).add(V(0, 1.8, 0)), h = V(...e.heading), side = V(0, 1, 0).cross(h);
      const ways = [h.clone().multiplyScalar(-(depth + 8)), side.clone().multiplyScalar(8), side.clone().multiplyScalar(-8), V(0, 8, 0)];
      assert.ok(ways.some(w => fly(t, out.clone().add(w).toArray(), out.toArray()).distanceTo(out) < 0.25), `${e.label} (${e.airlock}, passage ${depth} m)`);
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
