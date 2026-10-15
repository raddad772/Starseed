// A sandy coast's bands (gen/terrain.js coastBands): the beach bare up to where the sea reaches, the foredune
// behind it to twice the beach's width, the dunes behind that to four times, by how near the sea is; smooth
// across the bands' edges. On a made-up world: a straight shore along a meridian, the land rising gently from it.
import test from 'node:test';
import assert from 'node:assert/strict';
import { TerrainGenerator, S_LEN, S_H, S_WDEPTH } from '../../src/gen/terrain.js';

const R = 100000, REACH = 4.4, W = REACH / 0.08;
// (x east of the shore in metres, at the equator: the sea west of x = 0, the land rising 1 m in 50 east of it)
function world() {
  const g = Object.create(TerrainGenerator.prototype);
  g.R = R; g.p = { liquid: 'water', seaReach: REACH }; g.contThreshold = 0;
  g.sample = (x, y, z, w, out = new Float64Array(S_LEN)) => {
    const e = Math.atan2(x, z) * R;
    out.fill(0); out[S_H] = e / 50; out[S_WDEPTH] = 0;
    return out;
  };
  return g;
}
const at = (e) => [Math.sin(e / R), 0, Math.cos(e / R)];
const bands = (g, e, h = e / 50) => g.coastBands(...at(e), h, [0, 0, 0]).slice();

test('the beach bare up to where the sea reaches; the foredune, then the dunes, by distance', () => {
  const g = world();
  const near = bands(g, 20, 1);
  assert.ok(near[0] > 0.9, `beach at 20 m, 1 m up: ${near}`);
  const high = bands(g, 20, REACH + 3);
  assert.ok(high[0] < 0.05 && high[1] > 0.9, `over the reach it's the foredune: ${high}`);
  const fore = bands(g, 1.5 * W, 2);
  assert.ok(fore[0] < 0.05 && fore[1] > 0.9, `foredune at 1.5 W: ${fore}`);
  const back = bands(g, 3 * W, 3);
  assert.ok(back[1] < 0.05 && back[2] > 0.9, `back dunes at 3 W: ${back}`);
  const inland = bands(g, 6 * W, 6);
  assert.deepEqual(inland, [0, 0, 0]);
});

test('smooth across the bands\' edges, not stepped at its grid', () => {
  const g = world();
  let last = null, maxStep = 0;
  for (let e = 1.6 * W; e < 2.6 * W; e += 1) {
    const b = bands(g, e, 3)[1];
    if (last != null) maxStep = Math.max(maxStep, Math.abs(b - last));
    last = b;
  }
  assert.ok(maxStep < 0.1, `largest step in a metre: ${maxStep}`);
});

test('none drawn coarser than the beach is wide, nor by a sea of another liquid', () => {
  const g = world();
  g._sampleW = 2 * W;
  assert.deepEqual(bands(g, 20, 1), [0, 0, 0]);
  const m = world(); m.p.liquid = 'methane';
  assert.deepEqual(bands(m, 20, 1), [0, 0, 0]);
});
