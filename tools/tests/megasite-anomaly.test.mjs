// The suit senses a megastructure's glitches: coming near a time span (or a door flickering between
// wrecked and whole) it says "temporal anomaly detected", once, and again only after you've been well
// away; a distance gate's fold is a spatial one. (site/siteMechanisms.js: AnomalySense)
import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { planSite } from '../../src/understructure/plan/sitePlan.js';
import { compileSite } from '../../src/understructure/plan/compile.js';
import { SiteMechanisms, AnomalySense } from '../../src/understructure/site/siteMechanisms.js';

const mat = Object.fromEntries(['metal', 'dark', 'rust'].map((k) => [k, new THREE.MeshStandardMaterial()]));
const collision = { addBlocker() {}, addFloor() {}, addPortal() {} };
// (a player's suit at a site: its sense, over the site's anomalies)
const suitAt = (seed) => new AnomalySense(new SiteMechanisms(compileSite(planSite(seed)), collision, new THREE.Group(), mat).anomalies);
// (steps from far off straight up to an anomaly, and what the suit said on the way)
function approach(m, a, from) {
  const said = [];
  for (let f = 0; f <= 1; f += 0.02) {
    m.update(1 / 30, [from[0] + (a.pos[0] - from[0]) * f, a.pos[1], from[2] + (a.pos[2] - from[2]) * f]);
    const s = m.takeAlert(); if (s) said.push(s);
  }
  return said;
}

test('near a time span or a flickering door, the suit says a temporal anomaly is there', () => {
  let seen = 0;
  for (let i = 0; i < 40 && seen < 4; i++) {
    const m = suitAt(`MS-${i}`), temporal = m.anomalies.filter((a) => a.kind === 'temporal');
    if (!temporal.length) continue;
    seen++;
    const a = temporal[0], far = [a.pos[0] + 200, a.pos[1], a.pos[2]];
    // (far off, nothing; then quiet long enough that nothing just said counts)
    m.update(10, far); assert.equal(m.takeAlert(), null);
    m.armed.fill(true);
    const said = approach(m, a, far);
    assert.deepEqual(said, ['Warning: temporal anomaly detected.'], `MS-${i}`);
    // standing there, it doesn't keep on; walked well away and back, it says so again
    for (let k = 0; k < 60; k++) { m.update(1 / 30, a.pos); assert.equal(m.takeAlert(), null); }
    m.update(10, far); m.takeAlert();
    m.armed.fill(true);
    assert.ok(approach(m, a, far).includes('Warning: temporal anomaly detected.'), `MS-${i}: second approach`);
  }
  assert.ok(seen >= 2, `${seen} sites with a temporal glitch`);
});

test('a glitch a floor away is not sensed; a distance gate is a spatial anomaly', () => {
  let spatial = 0;
  for (let i = 0; i < 40; i++) {
    const m = suitAt(`MS-${i}`);
    for (const a of m.anomalies) {
      m.update(10, [a.pos[0] + 200, a.pos[1], a.pos[2]]); m.takeAlert();
      m.armed.fill(true);
      m.update(1 / 30, [a.pos[0], a.pos[1] - 12, a.pos[2]]);
      assert.equal(m.takeAlert(), null, `MS-${i}: sensed through the floor`);
    }
    if (m.anomalies.some((a) => a.kind === 'spatial')) {
      const a = m.anomalies.find((q) => q.kind === 'spatial');
      m.update(10, [a.pos[0] + 200, a.pos[1], a.pos[2]]); m.takeAlert();
      m.armed.fill(true);
      assert.ok(approach(m, a, [a.pos[0] + 200, a.pos[1], a.pos[2]]).includes('Warning: spatial anomaly detected.'), `MS-${i}`);
      spatial++;
    }
  }
  assert.ok(spatial > 0, 'no site with a distance gate');
});
