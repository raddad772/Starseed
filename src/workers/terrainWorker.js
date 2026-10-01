// Terrain worker: builds chunk meshes and runs settlement analysis off the
// main thread. Bodies are registered once; generators are built lazily.

import { TerrainGenerator } from '../gen/terrain.js';
import { buildChunk, chunkTransferables } from '../gen/chunkbuilder.js';
import { analyzeSettlements } from '../gen/settlements.js';
import { scatterFlora, floraSpecies, FLORA_KINDS } from '../gen/flora.js';

const params = new Map();
const gens = new Map();

function gen(id) {
  let g = gens.get(id);
  if (!g) {
    g = new TerrainGenerator(params.get(id));
    gens.set(id, g);
  }
  return g;
}

self.onmessage = (e) => {
  const m = e.data;
  try {
    if (m.type === 'bodies') {
      for (const b of m.bodies) params.set(b.id, b.terrain);
      return;
    }
    if (m.type === 'chunk') {
      const r = buildChunk(gen(m.body), m.face, m.level, m.ix, m.iy, m.N);
      r.type = 'chunk'; r.job = m.job;
      self.postMessage(r, chunkTransferables(r));
      return;
    }
    if (m.type === 'flora') {
      const g = gen(m.body);
      if (!g._species) g._species = floraSpecies(params.get(m.body));
      const r = scatterFlora(g, m.face, m.level, m.ix, m.iy, m.maxLevel, g._species);
      r.type = 'flora'; r.job = m.job;
      self.postMessage(r, FLORA_KINDS.map((k) => r[k].buffer));
      return;
    }
    if (m.type === 'analyze') {
      const r = analyzeSettlements(gen(m.body), m.options || {});
      self.postMessage({ type: 'analyze', job: m.job, result: r });
      return;
    }
  } catch (err) {
    self.postMessage({ type: 'error', job: m.job, message: String(err && err.stack || err) });
  }
};
