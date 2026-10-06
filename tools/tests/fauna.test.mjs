import test from 'node:test';
import assert from 'node:assert/strict';
import { herdAt, memberAt, SEG } from '../../src/sim/fauna.js';
import { designCreature } from '../../src/gen/life/creature.js';

const plan = { id: 0, symmetry: 2, skeleton: 'bone', segmented: false, limbs: 4, eyes: 2, receptors: 3 };
const clade = { posture: 'upright', blood: 'warm', limbs: 4, size: 'mid' };
const palette = { veg: [0.1, 0.2, 0.05], dry: [0.4, 0.35, 0.2] };
const design = designCreature(plan, clade, 1, 60, 9.81, palette, 'test');
const land = { R: 100000, isWaterAt: () => false };
const herd = (key) => ({ id: 'h' + key, level: 1, sp: { design, cold: false, herd: 6 }, n: 6, home: [0, 0, 1], E: [1, 0, 0], N: [0, 1, 0], roam: 120, key, spots: new Map() });

test('a design stands on its legs and runs faster than it walks', () => {
  for (const g of [3, 9.81, 25]) {
    const d = designCreature(plan, clade, 1, 60, g, palette, 'g' + g);
    for (const L of d.limbs) assert.ok(L.upper + L.lower >= d.hipH, 'legs reach the ground');
    assert.ok(d.run > 5 * d.walk);
    assert.ok(d.len > 0.3 && d.len < 3, `60 kg is ${d.len} m long`);
  }
});

test('a herd is where it is: the same at the same time, wherever it was asked from', () => {
  const a = herd(1234), b = herd(1234), o1 = {}, o2 = {};
  for (const t of [0, 57.3, 1e6 + 12.5, 3.2e9]) {
    herdAt(land, a, t, o1);
    herdAt(land, b, t + 0, o2);
    assert.deepEqual(o1, o2);
  }
});

test('a herd keeps to its country and moves no faster than it can', () => {
  const h = herd(99), o = {};
  let px = null, pz = null, moved = 0, grazing = 0;
  for (let t = 5e5; t < 5e5 + 20 * SEG; t += 0.5) {
    herdAt(land, h, t, o);
    assert.ok(Math.hypot(o.x, o.z) <= h.roam + 1e-9);
    if (px != null) {
      const v = Math.hypot(o.x - px, o.z - pz) / 0.5;
      assert.ok(v <= Math.max(design.walk, 2 * h.roam / (0.8 * SEG)) + 1e-6, `speed ${v}`);
      if (v > 0) moved++; else grazing++;
    }
    px = o.x; pz = o.z;
  }
  assert.ok(moved > 0 && grazing > moved, `grazes more than it walks (${grazing} : ${moved})`);
});

test("a herd's animals stay round it and step, then graze", () => {
  const h = herd(7), o = {}, c = {};
  let still = 0, n = 0;
  for (let t = 1e5; t < 1e5 + 600; t += 0.25) {
    herdAt(land, h, t, c);
    for (let i = 0; i < h.n; i++) {
      const p = {}, q = {};
      memberAt(land, h, i, t, p); memberAt(land, h, i, t + 0.25, q);
      assert.ok(Math.hypot(p.x, p.z) < h.roam + design.len * 5);
      if (!c.moving) { n++; if (Math.hypot(q.x - p.x, q.z - p.z) < 1e-9) still++; }
    }
  }
  assert.ok(still > 0.5 * n, `standing to graze most of the time (${still} / ${n})`);
});

import { flockAt, flyerAt } from '../../src/sim/fauna.js';
import { designFlyer } from '../../src/gen/life/flyer.js';
import { lineagesOf, islandMass } from '../../src/gen/life/lineage.js';

test('a flyer needs bigger wings on less air or a heavier pull, and beats slower as it grows', () => {
  const a = designFlyer(plan, 'small', 9.81, 1.2, palette, 'f'), thin = designFlyer(plan, 'small', 9.81, 0.4, palette, 'f'), big = designFlyer(plan, 'large', 9.81, 1.2, palette, 'f');
  assert.ok(thin.span / Math.pow(thin.massKg, 0.39) > a.span / Math.pow(a.massKg, 0.39));
  assert.ok(big.massKg > a.massKg && big.flapHz < a.flapHz && big.cruise > a.cruise);
});

test('a flock flies its circuit over its country, the same for everyone', () => {
  const f = { ...herd(42), flyer: true, roam: 250, sp: { design: designFlyer(plan, 'small', 9.81, 1.2, palette, 'fl'), herd: 8 }, n: 8 };
  const o1 = {}, o2 = {};
  for (let t = 1e4; t < 1e4 + 600; t += 0.7) {
    flockAt(land, f, t, o1); flockAt(land, { ...f, spots: new Map() }, t, o2);
    assert.deepEqual(o1, o2);
    assert.ok(Math.hypot(o1.x, o1.z) <= f.roam * 1.2 && o1.y > 3 && o1.y < 60);
    flyerAt(land, f, 5, t, o2);
    assert.ok(Math.hypot(o2.x - o1.x, o2.z - o1.z) < 40);
  }
});

test("realms' lines: sister realms close, long-parted ones far, a fresh split the same species", () => {
  const realms = { tree: [{ id: 0, parent: -1, agoMyr: 200, how: 'first' }, { id: 1, parent: 0, agoMyr: 60, how: 'split' }, { id: 2, parent: 0, agoMyr: 1, how: 'split' }, { id: 3, parent: -1, agoMyr: 200, how: 'first' }], interchanges: [] };
  const L = lineagesOf(realms, 150, 1234), d = (a, b) => Math.hypot(...L.now(a).map((x, i) => x - L.now(b)[i]));
  assert.equal(L.identOf(2), 0);
  assert.equal(L.identOf(1), 1);
  assert.ok(d(0, 2) < d(0, 1) && d(0, 1) < d(0, 3) + 1.5, `${d(0, 2)} ${d(0, 1)} ${d(0, 3)}`);
  assert.ok(islandMass(400, 0.001) < 400 && islandMass(1, 0.001) > 1 && islandMass(400, 0.5) === 400);
});

import { activeTime, activityAt } from '../../src/sim/fauna.js';

test("a day's round: a herd's own clock never runs back or jumps, grazers rest through the night and hunters don't", () => {
  const clock = { t: 0, lonS: 0, sign: 1, P: 86400 }, g = herd(5), hunter = { ...herd(6), level: 2 };
  let prev = activeTime(clock, g, 0), nightRun = 0, dayRun = 0;
  for (let t = 600; t <= 3 * 86400; t += 600) {
    const a = activeTime(clock, g, t), step = a - prev;
    assert.ok(step >= 0 && step <= 600 * 1.3 + 1e-6, `step ${step}`);
    const hr = ((12 - (Math.atan2(g.home[2], g.home[0]) / (2 * Math.PI)) * 24 + t / 3600) % 24 + 24) % 24;
    if (hr > 0 && hr < 4) nightRun += step; else if (hr > 10 && hr < 14) dayRun += step;
    prev = a;
  }
  assert.ok(nightRun < 0.1 * dayRun, `night ${nightRun} day ${dayRun}`);
  // (at the herd's local midnight: the grazer down, the hunter out)
  const lon = Math.atan2(g.home[2], g.home[0]), tMid = ((lon / (2 * Math.PI)) * 24 + 12) * 3600;
  assert.ok(activityAt(clock, g, tMid) < 0.1 && activityAt(clock, hunter, tMid) > 0.8);
});
