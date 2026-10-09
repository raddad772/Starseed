// The gas falling toward the central hole (sim/nebula.js): followed on its orbits to just past
// pericentre, then spread on a grid with its share of the hole's light
import test from 'node:test';
import assert from 'node:assert/strict';
import { infallStreamer, STREAMER } from '../../src/sim/nebula.js';

test('the cloud swings past the hole at its pericentre and is caught just after', () => {
  const v = infallStreamer();
  assert.ok(Math.abs(v.pericentre - STREAMER.pericentre) / STREAMER.pericentre < 0.05, `pericentre ${v.pericentre.toFixed(3)} pc`);
  // (decades to centuries of fall: a few hundred years for a 3 pc plunge into sixty billion suns)
  assert.ok(v.years > 50 && v.years < 2000, `${v.years.toFixed(0)} yr`);
  // the box holds the hole: the streamer's head has wrapped round it
  for (let i = 0; i < 3; i++) assert.ok(v.min[i] < 0 && v.max[i] > 0, `axis ${i}: ${v.min[i].toFixed(2)}..${v.max[i].toFixed(2)}`);
});

test('its density fills a grid within budget, normalised, and lit from the hole', () => {
  const v = infallStreamer(), [nx, ny, nz] = v.dims, n = nx * ny * nz;
  assert.equal(v.density.length, n);
  assert.equal(v.ionized.length, n);
  assert.ok(n <= STREAMER.voxels * 1.1, `${n} cells`);
  let filled = 0, max = 0, lo = Infinity, hi = -Infinity;
  for (let i = 0; i < n; i++) {
    const d = v.density[i], l = v.ionized[i];
    if (d > 0.003) filled++;
    max = Math.max(max, d); lo = Math.min(lo, l); hi = Math.max(hi, l);
  }
  assert.equal(max, 1);
  // (a streamer: a thin share of its box holds gas)
  assert.ok(filled > n * 0.002 && filled < n * 0.4, `${(filled / n * 100).toFixed(2)}% filled`);
  // (the light: none negative or above full, and some gas shadowed by gas nearer the hole)
  assert.ok(lo >= 0 && hi <= 1.0001 && lo < 0.9, `lit ${lo.toFixed(3)}..${hi.toFixed(3)}`);
});
