// Mars' seasonal CO2 frost (gen/frostcap.js): level ground's caps to ~45-55 degrees in winter; slopes
// facing the pole keep it nearer the equator, to ~34 S on 20-30 degree slopes as observed (Vincendon et
// al. 2010), and none nearer the equator than ~30 (a steep crater wall at 21 N had been white at
// mid-morning); slopes facing the equator lose it first.
import test from 'node:test';
import assert from 'node:assert/strict';
import { generateSystem } from '../../src/gen/system.js';
import { climateOpts } from '../../src/gen/worldsim/climate.js';
import { frostCaps, FROST_NL, FROST_NS, FROST_TILTS } from '../../src/gen/frostcap.js';

const sys = generateSystem('SOL'), mars = sys.bodies[4], a = mars.atmosphere;
const f = frostCaps(climateOpts(mars, sys.bodies[0], null), a.pressure * 1e5 * a.comp.CO2, { tau: 0.51, ssa: 0.885, g: 0.69 });

// the lowest latitude (degrees) at which a tilt holds over 10 kg/m2 some time in the year, each hemisphere
function reach(tilt) {
  const t = FROST_TILTS.indexOf(tilt);
  let n = 90, s = 90;
  for (let j = 0; j < FROST_NL; j++) {
    const la = ((j + 0.5) / FROST_NL - 0.5) * 180;
    let mx = 0;
    for (let k = 0; k < FROST_NS; k++) mx = Math.max(mx, f.kg[(t * FROST_NL + j) * FROST_NS + k]);
    if (mx > 10) { if (la > 0) n = Math.min(n, la); else s = Math.min(s, -la); }
  }
  return { n, s };
}

test('level ground: the seasonal caps reach ~45-55 degrees', () => {
  const r = reach(0);
  for (const x of [r.n, r.s]) assert.ok(x > 44 && x < 56, JSON.stringify(r));
});

test('pole-facing slopes keep frost nearer the equator, never within ~30 degrees of it', () => {
  const r20 = reach(20), r30 = reach(30), r40 = reach(40), r0 = reach(0);
  assert.ok(r20.s < r0.s - 5 && r30.s < r20.s, JSON.stringify({ r0, r20, r30 }));
  assert.ok(r30.s > 30 && r30.s < 38, JSON.stringify(r30));
  for (const r of [r20, r30, r40]) assert.ok(r.n > 30 && r.s > 30, JSON.stringify(r));
});

test('equator-facing slopes lose it first', () => {
  const r0 = reach(0), rm = reach(-30);
  assert.ok(rm.n > r0.n && rm.s > r0.s, JSON.stringify({ r0, rm }));
});
