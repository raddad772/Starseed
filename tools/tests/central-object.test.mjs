// The central black hole's numbers (sim/centralObject.js) and its shader's source (render/webgpu/central.js)
import test from 'node:test';
import assert from 'node:assert/strict';
import { iscoRadius, CENTRAL } from '../../src/sim/centralObject.js';
import { CENTRAL_WGSL } from '../../src/render/webgpu/central.js';

test('innermost stable orbit: Schwarzschild 6M, Thorne\'s limit 1.237M, prograde shrinking with spin', () => {
  assert.ok(Math.abs(iscoRadius(0) - 6) < 1e-9);
  assert.ok(Math.abs(iscoRadius(0.998) - 1.2370) < 2e-3);
  assert.ok(Math.abs(iscoRadius(0.5) - 4.2330) < 2e-3);
  for (let a = 0.1; a < 0.99; a += 0.1) assert.ok(iscoRadius(a) < iscoRadius(a - 0.1));
});

test('the hole sits where its star systems can keep planets, its disk no brighter than they can bear', () => {
  const pc = 3.0857e16, AU = 1.496e11;
  // a sun-like star's Hill sphere at the default distance holds planets out past 30 AU
  const hill = CENTRAL.distancePc * pc * Math.cbrt(1 / (3 * CENTRAL.massSun)) / AU;
  assert.ok(hill / 3 > 30, `planets only to ${(hill / 3).toFixed(0)} AU`);
  // the thin disk's whole light there, against Earth's sunlight (1361 W/m^2)
  const G = 6.674e-11, c = 2.998e8, M = G * CENTRAL.massSun * 1.989e30 / (c * c), sig = 5.670e-8;
  const fmax = Math.pow(36 / 49, 0.75) * Math.pow(1 - Math.sqrt(36 / 49), 0.25);
  const L = 4 * Math.PI * sig * CENTRAL.disk.temperature ** 4 / fmax ** 4 * (iscoRadius(CENTRAL.spin) * M) ** 2 / 3;
  const sun = L / (4 * Math.PI * (CENTRAL.distancePc * pc) ** 2) / 1361;
  assert.ok(sun < 0.5, `the disk gives ${sun.toFixed(2)}x Earth's sunlight`);
});

test('the shader declares one name per let (WGSL has no comma lists; one took the renderer down)', () => {
  for (const m of CENTRAL_WGSL.matchAll(/\b(?:let|var)\s+\w+\s*(?::\s*\w+\s*)?=([^;]*);/g)) {
    let depth = 0;
    for (const ch of m[1]) { if (ch === '(') depth++; else if (ch === ')') depth--; else assert.ok(!(ch === ',' && depth === 0), m[0]); }
  }
  let depth = 0;
  for (const ch of CENTRAL_WGSL) { if (ch === '{') depth++; else if (ch === '}') depth--; assert.ok(depth >= 0); }
  assert.equal(depth, 0);
});

test('the chart keeps its stars clear of the hole, the survey system 3 pc out', async () => {
  const { game } = await import('./campaign-fixture.mjs');
  const { finishIntroduction } = await import('../../src/campaign/tutorial.js');
  const { captureFlight } = await import('../../src/campaign/flight.js');
  const { ensureGalaxy, chart, resolveSystem, CENTRAL_OBJECT } = await import('../../src/campaign/galaxy.js');
  const g = game(); g.players[0].mode = 'ship'; g.players[0].vessel = g.ship; g.campaign = finishIntroduction(g.campaign, 'skipped');
  const c = ensureGalaxy(captureFlight(g, g.campaign));
  const fromHole = s => Math.hypot(...s.position.map((n, i) => n - CENTRAL_OBJECT.position[i]));
  assert.ok(Math.abs(fromHole(resolveSystem(c, c.galaxy.currentSystemId)) - CENTRAL.distancePc) < 1e-9);
  const stars = chart(c);
  for (let x = -3; x <= 3; x++) for (let z = -3; z <= 3; z++) for (let n = 0; n < 8; n++) stars.push(resolveSystem(c, `star/${x}/${z}/${n}`));
  for (const s of stars) assert.ok(fromHole(s) >= 1.5, `${s.id} ${fromHole(s).toFixed(2)} pc from the hole`);
});

test('one sky: each system sees the hole, its spin and its charted neighbours where the chart has them', async () => {
  const THREE = await import('three');
  const { game } = await import('./campaign-fixture.mjs');
  const { finishIntroduction } = await import('../../src/campaign/tutorial.js');
  const { captureFlight } = await import('../../src/campaign/flight.js');
  const { ensureGalaxy, resolveSystem } = await import('../../src/campaign/galaxy.js');
  const { Sky } = await import('../../src/render/sky.js');
  const { centralView, spinAxisChart } = await import('../../src/sim/centralObject.js');
  const g = game(); g.players[0].mode = 'ship'; g.players[0].vessel = g.ship; g.campaign = finishIntroduction(g.campaign, 'skipped');
  const c = ensureGalaxy(captureFlight(g, g.campaign));
  const renderer = { isNativeWebGPU: true, autoClear: true };
  const here = resolveSystem(c, c.galaxy.currentSystemId), rx = resolveSystem(c, c.generation.storyAnchors.receiver.systemId);
  const views = [];
  for (const [sys, seed] of [[here, 'SKY-A'], [rx, 'SKY-B']]) {
    const sky = new Sky(renderer, seed);
    const view = centralView({ sky, campaign: { ...c, galaxy: { ...c.galaxy, currentSystemId: sys.id } } }, {});
    views.push({ sys, sky, view });
    const p = sys.position, d = Math.hypot(...p);
    // (the hole straight down the chart's line, the sky's glow centred on it)
    assert.ok(Math.abs(view.distancePc - d) < 1e-9);
    assert.ok(view.dir.distanceTo(sky.galCenter) < 1e-9);
    // (angles kept: the hole to the spin axis, and the hole to a charted neighbour, as on the chart)
    const S = spinAxisChart(), toHole = p.map(n => -n / d);
    const cosChart = S[0] * toHole[0] + S[1] * toHole[1] + S[2] * toHole[2];
    assert.ok(Math.abs(view.spin.dot(view.dir) - cosChart) < 1e-9);
    const other = sys === here ? rx : here, v = other.position.map((n, i) => n - p[i]), dv = Math.hypot(...v);
    const cosStar = v.reduce((a, n, i) => a + n / dv * toHole[i], 0);
    assert.ok(Math.abs(sky.chartToWorld(p, v.map(n => n / dv), new THREE.Vector3()).dot(view.dir) - cosStar) < 1e-9);
  }
  // (from the survey system, near edge-on: the axis 83 degrees from the line of sight; from the receiver, its own angle)
  const inc = v => Math.acos(-v.view.spin.dot(v.view.dir)) * 180 / Math.PI;
  assert.ok(Math.abs(inc(views[0]) - 83) < 1e-6);
  assert.ok(Math.abs(inc(views[1]) - 83) > 2);
  // (the charted stars are in the sky: the background's 6000 points and the chart's neighbours)
  assert.ok(views[0].sky.points.geometry.attributes.position.count > 6000 + 150);
});

test('the sky star table holds every bright star where a look its way finds it, across face seams too', async () => {
  const { Sky, starFace, STAR_TABLE } = await import('../../src/render/sky.js');
  const sky = new Sky({ isNativeWebGPU: true, autoClear: true }, 'STAR-TABLE');
  const { a, size: N } = sky.starTable, bg = sky.background;
  assert.equal(N, STAR_TABLE);
  assert.equal(sky.points.visible, false);
  // (the shader's search: d's cell on its face and the eight round it)
  const near = (x, y, z) => {
    const [f, px, py] = starFace(x, y, z), found = [];
    const tx = Math.min(N - 1, Math.max(0, Math.floor((px + 1) / 2 * N))), ty = Math.min(N - 1, Math.max(0, Math.floor((py + 1) / 2 * N)));
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const X = tx + dx, Y = ty + dy;
      if (X < 0 || Y < 0 || X >= N || Y >= N) continue;
      const k = ((f * N + Y) * N + X) * 4;
      if (a[k + 3] > 0) found.push([a[k], a[k + 1], a[k + 2]]);
    }
    return found;
  };
  let missing = 0, total = 0;
  for (let i = 0; i < bg.size.length; i++) {
    const r = Math.hypot(bg.pos[i * 3], bg.pos[i * 3 + 1], bg.pos[i * 3 + 2]);
    const d = [bg.pos[i * 3] / r, bg.pos[i * 3 + 1] / r, bg.pos[i * 3 + 2] / r];
    // (looked for from a little way off it, every way, as a pixel beside it would)
    for (const [ox, oy, oz] of [[0, 0, 0], [2e-3, 0, 0], [0, -2e-3, 0], [0, 0, 2e-3]]) {
      total++;
      const q = [d[0] + ox, d[1] + oy, d[2] + oz], l = Math.hypot(...q);
      if (!near(q[0] / l, q[1] / l, q[2] / l).some(s => Math.hypot(s[0] - d[0], s[1] - d[1], s[2] - d[2]) < 1e-6)) missing++;
    }
  }
  // (a few lose their cell to a brighter star sharing it; none to a seam)
  assert.ok(missing / total < 0.02, `${missing} of ${total} looks missed their star`);
});
