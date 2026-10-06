import test from 'node:test';
import assert from 'node:assert/strict';
import { fireTile, fireRegimeAt, fireCellOf, fireTilesAcross, FIRE_OLD } from '../../src/gen/life/fire.js';
import { GridLite } from '../../src/gen/worldsim/grid.js';
import { S_LEN, S_H, S_TEMP } from '../../src/gen/terrain.js';

// a made-up world, the same country everywhere: its climate (annual mean, its swing, its cold half's rain
// a month, its year's rain) and its plants (cover, open, forest)
function world({ T = 26, swing = 4, Pcold = 5, P = 700, cover = 0.8, open = 0.6, forest = 0.25 } = {}) {
  const Nc = 4, Gc = new GridLite(Nc, 1), m = Gc.n, f = (v) => new Float32Array(m).fill(v);
  const season = new Float32Array(3 * m); season.fill(swing, 0, m); season.fill(0, m, 2 * m); season.fill(Pcold, 2 * m, 3 * m);
  const s = { Nc, Tsea: f(T + 273.15), P: f(P), cover: f(cover), open: f(open), forest: f(forest), season };
  return { R: 100000, p: { liquid: null }, snap: { s, Gc }, sample: (x, y, z, w, out) => { out.fill(0); out[S_H] = 50 + 3 * Math.sin(x * 4000) * Math.cos(z * 3000); out[S_TEMP] = T + 273.15; return out; } };
}

test('a tile of fires is the same however often it is run', () => {
  const g = world(), a = fireTile(g, 0, 3, 4, { seed: 7 }), b = fireTile(g, 0, 3, 4, { seed: 7 });
  assert.deepEqual(a.stats, b.stats);
  assert.equal(Buffer.compare(Buffer.from(a.ageG.buffer), Buffer.from(b.ageG.buffer)), 0);
});

test('a savanna burns every few decades at most, a rainforest hardly ever, nothing without the air to burn in', () => {
  const sav = fireTile(world(), 0, 3, 4, { seed: 7 }).stats;
  assert.ok(sav.burnPerYear > 0.02 && sav.burnPerYear < 0.4, `savanna ${sav.burnPerYear}`);
  const wet = world({ Pcold: 250, P: 3500, open: 0, forest: 1, cover: 0.95 });
  assert.equal(fireRegimeAt(wet.snap, [1, 0, 0]).dry, 0);
  const rf = fireTile(wet, 0, 3, 4, { seed: 7 }).stats;
  assert.ok(rf.burnPerYear < 0.002, `rainforest ${rf.burnPerYear}`);
  const none = fireTile(world(), 0, 3, 4, { seed: 7, o2K: 0 }).stats;
  assert.equal(none.burnedCells, 0);
});

test('the ages are years in the window or never', () => {
  const t = fireTile(world(), 0, 3, 4, { seed: 7 });
  for (const a of t.ageG) assert.ok(a === FIRE_OLD || a <= 300);
  for (let i = 0; i < t.ageC.length; i++) assert.ok(t.ageC[i] === FIRE_OLD || t.ageC[i] >= t.ageG[i], 'a stand is replaced only by a fire that burned its ground');
});

test('a place near a seam belongs to one tile, the same each time asked, its cell inside that tile', () => {
  const R = 100000, NT = fireTilesAcross(R);
  for (let k = 0; k < 200; k++) {
    const u = -1 + (5 + (k % 20) / 400) * 2 / NT, v = -1 + (7.5 + k / 800) * 2 / NT;
    const a = fireCellOf(R, 2, u, v, 99), b = fireCellOf(R, 2, u, v, 99);
    assert.deepEqual(a, b);
    assert.ok(a.ti === 4 || a.ti === 5);
    assert.ok(a.x >= 0 && a.x < 352 && a.y >= 0 && a.y < 352);
  }
});
