// Each of a megastructure's three themes shows itself through the site, not only at its gate
// (plan/glitches.js, site/siteGlitches.js): a few glitches of its own kinds spread down the route,
// harmless and out of the way; the weight patches change the walker's weight, a skip folds a passage,
// and near the light, pressure and resonance ones the suit says so.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { planSite } from '../../src/understructure/plan/sitePlan.js';
import { compileSite } from '../../src/understructure/plan/compile.js';
import { GLITCH_KINDS, LULL_G, PRESS_G } from '../../src/understructure/plan/glitches.js';
import { SiteGlitches } from '../../src/understructure/site/siteGlitches.js';
import { AnomalySense } from '../../src/understructure/site/siteMechanisms.js';
import { SiteCollision } from '../../src/understructure/site/siteCollision.js';
import * as G from '../../src/understructure/plan/geom2.js';

const SEEDS = Array.from({ length: 16 }, (_, i) => `MS-${i}`);
const mat = Object.fromEntries(['metal', 'dark', 'rust', 'concrete', 'rock'].map((k) => [k, new THREE.MeshStandardMaterial()]));

test('each site theme has glitches of its own kinds, spread down the route, none in a gate\'s place', () => {
  let big = 0;
  for (const seed of SEEDS) {
    const p = planSite(seed), held = new Set(['staging', 'core', 'access']);
    for (const g of p.gates) { held.add(g.node); held.add(g.link); for (const k of g.keys) held.add(k.node); }
    held.delete(undefined);
    for (const x of p.glitches) {
      assert.ok(p.themes.includes(x.theme), `${seed} ${x.theme}`);
      assert.ok(GLITCH_KINDS[x.theme].includes(x.kind), `${seed} ${x.kind}`);
      assert.ok(!held.has(x.node) && !held.has(x.link), `${seed} ${x.kind} at ${x.node || x.link}`);
    }
    // (no two in one place)
    const at = p.glitches.map((x) => x.node || x.link);
    assert.equal(new Set(at).size, at.length, seed);
    if (p.route.length < 20) continue;
    big++;
    for (const t of p.themes) {
      const mine = p.glitches.filter((x) => x.theme === t);
      assert.ok(mine.length >= 2, `${seed} ${t}: ${mine.length}`);
      // (more than one stretch of the route)
      assert.ok(Math.max(...mine.map((x) => x.at)) - Math.min(...mine.map((x) => x.at)) >= p.route.length * 0.3, `${seed} ${t} bunched`);
    }
  }
  assert.ok(big >= 8, `${big}`);
  // (the same site, the same glitches)
  assert.deepEqual(planSite('MS-3').glitches, planSite('MS-3').glitches);
});

test('a lull or a press is the weight where it is; the doorways and passages beyond keep the planet\'s', () => {
  let seen = 0;
  for (const seed of SEEDS) {
    const site = compileSite(planSite(seed)), col = new SiteCollision([], site.zones);
    for (const x of site.glitches.filter((q) => q.zone)) {
      seen++;
      const c = G.centroid(x.zone.poly);
      assert.equal(col.gravityAt(c[0], x.y0, c[1]), x.kind === 'lull' ? LULL_G : PRESS_G, `${seed} ${x.kind}`);
      // (well out from it: not)
      const far = G.add(c, [x.node ? x.r + 3 : 0, 0]);
      if (x.node) assert.notEqual(col.gravityAt(far[0], x.y0, far[1]), x.kind === 'lull' ? LULL_G : PRESS_G);
    }
  }
  assert.ok(seen >= 4, `${seen}`);
});

test('a skip folds its passage: into the near frame, out past the far one, and back the other way', () => {
  let seen = 0;
  for (const seed of SEEDS) {
    const site = compileSite(planSite(seed));
    for (const x of site.glitches.filter((q) => q.kind === 'skip')) {
      seen++;
      const col = new SiteCollision([], site.zones);
      new SiteGlitches(site, col, new THREE.Group(), mat);
      const [A, B] = x.frames, d = A.dir;
      assert.ok(Math.abs(G.dist([A.pos[0], A.pos[2]], [B.pos[0], B.pos[2]]) - 7) < 0.05, seed);
      // (walking on through A: out just past B)
      const p = [A.pos[0] - d[0] * 0.2, A.pos[1], A.pos[2] - d[1] * 0.2], q = [A.pos[0] + d[0] * 0.2, A.pos[1], A.pos[2] + d[1] * 0.2];
      const j = col.portal(p, q);
      assert.ok(j && G.dist([j.pos[0], j.pos[2]], [B.pos[0] + d[0] * 0.2, B.pos[2] + d[1] * 0.2]) < 0.05, `${seed} ${JSON.stringify(j)}`);
      // (and back through B: out just short of A)
      const k = col.portal([B.pos[0] + d[0] * 0.2, B.pos[1], B.pos[2] + d[1] * 0.2], [B.pos[0] - d[0] * 0.2, B.pos[1], B.pos[2] - d[1] * 0.2]);
      assert.ok(k && G.dist([k.pos[0], k.pos[2]], [A.pos[0] - d[0] * 0.2, A.pos[2] - d[1] * 0.2]) < 0.05, seed);
    }
  }
  assert.ok(seen >= 2, `${seen}`);
});

test('every glitch builds and runs; near the light, pressure and resonance ones the suit says so', () => {
  const says = { light: 'Warning: photonic anomaly detected.', pressure: 'Warning: pressure anomaly detected.', resonance: 'Warning: acoustic anomaly detected.' };
  const heard = new Set();
  for (const seed of SEEDS) {
    const site = compileSite(planSite(seed)), col = new SiteCollision([], site.zones), root = new THREE.Group();
    const gl = new SiteGlitches(site, col, root, mat);
    for (let k = 0; k < 120; k++) gl.update(0.25, site.spawn.pos);
    for (const x of site.glitches.filter((q) => says[q.theme])) {
      // (its own, alone: another nearby would be said first)
      const at = [x.center[0], x.y0, x.center[1]], sense = new AnomalySense(gl.anomalies.filter((a) => a.pos[0] === at[0] && a.pos[2] === at[2]));
      sense.update(10, [at[0] + 300, at[1], at[2]]); sense.takeAlert(); sense.armed.fill(true);
      sense.update(1 / 30, at);
      assert.equal(sense.takeAlert(), says[x.theme], `${seed} ${x.kind}`);
      heard.add(x.theme);
    }
  }
  assert.equal(heard.size, 3, [...heard].join(','));
});
