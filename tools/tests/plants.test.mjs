// A world's tree species by climate (gen/life/plants.js): Holdridge's biotemperature and PET ratio; a
// pool spread over the world's forests (a cold dry north and a hot wet south give it spires there and
// rain forest giants here); each place's trees the species that suit it, in stands.
import test from 'node:test';
import assert from 'node:assert/strict';
import { biotemp, climX, climY, treePool, suitability, pickSpecies, placeClimate } from '../../src/gen/life/plants.js';

// a made-up world's snapshot sampler: the north cold and dry, the south hot and wet, forest everywhere
const S = {
  Gc: {}, s: { forest: true },
  h: () => 200, ice: () => 0,
  Tsea: (x, y) => 273.15 + (y > 0 ? -2 : 26),
  season: (x, y, z, out) => { out[0] = y > 0 ? 14 : 2; out[1] = 0; out[2] = 0; return true; },
  rain: (x, y) => (y > 0 ? 450 : 3500),
  forest: () => 0.8, cover: () => 1,
};
const base = { seed: 12345, stage: 4, densityTree: 0.8, treeHeight: 20, tree: 'broadleaf' };

test('biotemperature: frozen months count nothing, the hot ones no more than 30', () => {
  assert.equal(biotemp(-20, 5), 0);
  assert.equal(biotemp(40, 2), 30);
  const bt = biotemp(5, 15);
  assert.ok(bt > 5 && bt < 12, `${bt}`);   // (the winter's frost left out: warmer than the mean)
  assert.ok(climY(25, 4000) < climY(25, 500));
  assert.ok(climX(24) > climX(6));
});

test('the pool spans the world\'s forests: spires in the cold, broad crowns in the wet heat', () => {
  const pool = treePool(base, S, 0.0065);
  assert.ok(pool.length >= 2, `${pool.length}`);
  const cold = pool[0], warm = pool[pool.length - 1];
  assert.ok(2 ** cold.x0 < 8 && cold.form === 'conifer', JSON.stringify(cold));
  assert.ok(2 ** warm.x0 > 20 && warm.form === 'broadleaf', JSON.stringify(warm));
  assert.ok(warm.treeHeight > cold.treeHeight, `${warm.treeHeight} ${cold.treeHeight}`);
  // (the same pool every time: world state)
  assert.deepEqual(treePool(base, S, 0.0065), pool);
});

test('each place favours its own species, and its stands are mostly one', () => {
  const pool = treePool(base, S, 0.0065), suit = new Float64Array(pool.length);
  const best = (d) => { const cl = placeClimate(S, 0.0065, d, 200, {}); suitability(pool, cl, 5, 1, suit); let b = 0; for (let i = 1; i < suit.length; i++) if (suit[i] > suit[b]) b = i; return b; };
  const n = best([0, 0.7, 0.7]), s = best([0, -0.7, 0.7]);
  assert.notEqual(n, s);
  assert.equal(pool[n].form, 'conifer');
  // (a stand's draw: the same u1 gives the same dominant; most trees take it)
  const cl = placeClimate(S, 0.0065, [0, -0.7, 0.7], 200, {});
  suitability(pool, cl, 5, 1, suit);
  let same = 0;
  for (let k = 0; k < 400; k++) if (pickSpecies(suit, 0.37, (k * 0.618) % 1, (k * 0.414) % 1) === pickSpecies(suit, 0.37, 0.1, 0.5)) same++;
  assert.ok(same > 250, `${same}`);
});

test('no trees before the world\'s plants have them', () => {
  assert.deepEqual(treePool({ ...base, stage: 2 }, S, 0.0065), []);
  assert.deepEqual(treePool({ ...base, densityTree: 0 }, S, 0.0065), []);
});
