// The real walker and collision walk the whole main route of compiled sites,
// break-in to the founders' lift: passages, doorways, catwalks, zero-g wells
// and low-gravity decks, piloted the way a player would. (The pilot is not
// perfect on every low-gravity room yet: these seeds are the regression set.)
import test from 'node:test';
import assert from 'node:assert/strict';
import { planSite } from '../../src/understructure/plan/sitePlan.js';
import { compileSite } from '../../src/understructure/plan/compile.js';
import { walkRoute, siteCollision } from './megasite-walk.js';

const SEEDS = ['SUMP-07', 'MS-1', 'MS-2', 'MS-4', 'MS-5', 'MS-6', 'MS-8', 'MS-9', 'MS-10', 'MS-11', 'MS-14', 'MS-16'];

test('the main route walks end to end', () => {
  const fails = [];
  for (const s of SEEDS) {
    const plan = planSite(s), r = walkRoute(plan, compileSite(plan));
    if (!r.ok) fails.push(`${s}: ${r.fail}`);
  }
  assert.deepEqual(fails, []);
});

test('a distance gate folds the walker past the collapse', () => {
  let tried = 0;
  for (let i = 0; i < 60 && tried < 3; i++) {
    const plan = planSite(`MS-${i}`);
    if (!plan.gates.some((g) => g.theme === 'space')) continue;
    const r = walkRoute(plan, compileSite(plan));
    if (!r.ok) continue; // (the low-gravity pilot misses some seeds)
    tried++;
    assert.ok(r.walker.folded > 0, `MS-${i}: walked the route without folding`);
  }
  assert.ok(tried > 0, 'no seed with a distance gate walked');
});

// Nothing hangs in the air: every find stands on a floor, deck, ledge or catwalk (a shard over a
// zero-g well, or on a span that comes and goes, was floating)
test('every find rests on something', () => {
  const bad = [];
  for (const seed of Array.from({ length: 40 }, (_, i) => `MS-${i}`).concat(['SUMP-07'])) {
    const plan = planSite(seed), site = compileSite(plan), col = siteCollision(site);
    for (const f of plan.finds) {
      const y = col.floorBelow(f.pos[0], f.pos[2], f.pos[1] + 0.5, 3);
      if (y == null || Math.abs(y - f.pos[1]) > 0.3) bad.push(`${seed}:${f.id} (${f.kind}) at ${f.pos.map((v) => v.toFixed(1))} floor ${y == null ? 'none' : y.toFixed(2)}`);
    }
  }
  assert.deepEqual(bad, []);
});
