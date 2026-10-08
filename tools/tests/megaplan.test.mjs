// The graph-first megastructure planner: every seed plans, nothing overlaps,
// the route climbs, crossings of one volume are separated by other spaces and
// a climb, and there are enough finds to reach the 170 credit cap.
import test from 'node:test';
import assert from 'node:assert/strict';
import { planSite, segs } from '../../src/understructure/plan/sitePlan.js';
import * as G from '../../src/understructure/plan/geom2.js';

const SEEDS = Array.from({ length: 160 }, (_, i) => `MS-${i}`).concat(['SUMP-07', 'HALL-6']);
const SLAB = 1.0;

// Every occupied piece: plan polygon, height band, owner and what it may touch.
export function pieces(plan) {
  const out = [];
  for (const L of [...plan.landmarks, plan.access]) out.push({ id: L.id, kind: 'volume', poly: L.poly, y0: L.y0, y1: L.y1, touch: new Set() });
  for (const n of plan.nodes) {
    if (n.kind === 'crossing' || n.kind === 'access') continue; // inside their volume
    out.push({ id: n.id, kind: n.kind, poly: n.poly, y0: n.y0, y1: n.y1, touch: new Set() });
  }
  for (const l of plan.links) {
    segs(l).forEach((s, i) => {
      const t = new Set([l.a, l.b]);
      // a corridor leaving or entering a crossing passes through that volume's wall
      for (const end of [l.a, l.b]) { const n = plan.nodes.find((q) => q.id === end); if (n?.landmark) t.add(n.landmark); }
      out.push({ id: `${l.id}#${i}`, link: l.id, kind: 'corridor', poly: G.segRect([s.a[0], s.a[2]], [s.b[0], s.b[2]], l.width), y0: s.y0, y1: s.y1, touch: t, ends: [l.a, l.b] });
    });
  }
  return out;
}

export function overlaps(plan) {
  const P = pieces(plan), bad = [];
  for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) {
    const a = P[i], b = P[j];
    if (a.link && a.link === b.link) continue;
    if (a.y1 + SLAB <= b.y0 || b.y1 + SLAB <= a.y0) continue;
    if (a.touch.has(b.id) || b.touch.has(a.id)) continue;
    if (a.ends && b.ends && a.ends.some((e) => b.ends.includes(e))) continue; // corridors meeting at a room
    if (G.polysOverlap(a.poly, b.poly, 0)) bad.push(`${a.id} x ${b.id}`);
  }
  return bad;
}

test('every seed plans without overlaps', () => {
  const failures = [];
  for (const s of SEEDS) {
    const plan = planSite(s);
    const bad = overlaps(plan);
    if (bad.length) failures.push(`${s}: ${bad.slice(0, 4).join(', ')}${bad.length > 4 ? ` (+${bad.length - 4})` : ''}`);
  }
  assert.deepEqual(failures, []);
});

test('the route climbs and revisits volumes only after other spaces and a climb', () => {
  for (const s of SEEDS) {
    const plan = planSite(s);
    const byId = new Map(plan.nodes.map((n) => [n.id, n]));
    const route = plan.route.map((id) => byId.get(id));
    assert.equal(route[0].kind, 'staging', s);
    assert.equal(route.at(-1).id, 'access', s);
    assert.equal(route.at(-2).kind, 'core', s);
    const seen = new Map();
    route.forEach((n, i) => {
      if (n.kind !== 'crossing') return;
      if (seen.has(n.landmark)) {
        const j = seen.get(n.landmark), between = route.slice(j + 1, i);
        assert.ok(between.length >= 2, `${s}: ${n.id} revisits after ${between.length} spaces`);
        assert.ok(between.some((q) => q.kind === 'climb'), `${s}: ${n.id} revisit without a climb`);
        assert.ok(n.y0 - route[j].y0 >= 8, `${s}: ${n.id} revisit only ${n.y0 - route[j].y0} m higher`);
      }
      seen.set(n.landmark, i);
    });
    for (const L of plan.landmarks) assert.ok(route.filter((n) => n.landmark === L.id).length >= 2, `${s}: ${L.id} crossed once`);
  }
});

test('every link joins existing spaces and every space is reachable from the break-in', () => {
  for (const s of SEEDS) {
    const plan = planSite(s);
    const ids = new Set(plan.nodes.map((n) => n.id));
    const adj = new Map([...ids].map((id) => [id, []]));
    for (const l of plan.links) {
      assert.ok(ids.has(l.a) && ids.has(l.b), `${s}: link ${l.id} ${l.a}->${l.b}`);
      adj.get(l.a).push(l.b); adj.get(l.b).push(l.a);
    }
    for (let i = 1; i < plan.route.length; i++) {
      const a = plan.route[i - 1], b = plan.route[i];
      assert.ok(adj.get(a).includes(b), `${s}: route step ${a}->${b} has no link`);
    }
    const seen = new Set(['staging']), q = ['staging'];
    while (q.length) for (const n of adj.get(q.shift())) if (!seen.has(n)) { seen.add(n); q.push(n); }
    assert.equal(seen.size, ids.size, `${s}: unreachable ${[...ids].filter((i) => !seen.has(i))}`);
  }
});

test('not a maze: the route is a line, side branches are single dead ends', () => {
  for (const s of SEEDS) {
    const plan = planSite(s);
    const onRoute = new Set(plan.route);
    for (const n of plan.nodes.filter((q) => !onRoute.has(q.id))) {
      assert.equal(n.kind, 'deadend', `${s}: ${n.id} off-route but not a dead end`);
      assert.equal(plan.links.filter((l) => l.a === n.id || l.b === n.id).length, 1, `${s}: ${n.id} has several ways in`);
    }
  }
});

test('finds: one entry unit, a 90-unit record and enough single units for the 170 cap', () => {
  for (const s of SEEDS) {
    const plan = planSite(s);
    const units = plan.finds.map((f) => f.units).sort((a, b) => b - a);
    assert.equal(units[0], 90, s);
    assert.ok(units.slice(1).every((u) => u === 1), s);
    const raw = units.reduce((a, b) => a + b, 0);
    const credit = Math.min(170, Math.min(raw, 100) + 3 * Math.max(0, raw - 100));
    assert.equal(credit, 170, `${s}: raw ${raw}`);
  }
});

test('passages stay short: no corridor run over 36 m', () => {
  const long = [];
  for (const s of SEEDS) {
    const plan = planSite(s);
    for (const l of plan.links) {
      let L = 0;
      for (let i = 1; i < l.path.length; i++) L += Math.hypot(l.path[i][0] - l.path[i - 1][0], l.path[i][2] - l.path[i - 1][2]);
      if (L > 36) long.push(`${s}:${l.id} ${L.toFixed(0)}m`);
    }
  }
  assert.ok(long.length === 0, `${long.length} long corridors, e.g. ${long.slice(0, 6).join(', ')}`);
});
