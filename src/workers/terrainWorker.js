// Terrain worker: builds chunk meshes and runs settlement analysis off the
// main thread. Bodies are registered once; generators are built lazily.

import { TerrainGenerator } from '../gen/terrain.js';
import { buildChunk, chunkTransferables } from '../gen/chunkbuilder.js';
import { analyzeSettlements } from '../gen/settlements.js';
import { scatterFlora, floraSpecies, FLORA_KINDS } from '../gen/flora.js';
import { terrainPortrait } from '../gen/portrait.js';
import { VolumeField, buildVolumeChunk, volumeTransferables } from '../gen/volume.js';

const params = new Map();
const gens = new Map();
const fields = new Map();   // body|anchor -> VolumeField

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
    if (m.type === 'snapshot') {
      // a simulated world arrived (worldsim/snapshot.js): its generator reads it from now on
      const p = params.get(m.id);
      if (p) { params.set(m.id, { ...p, snapshot: m.snapshot }); gens.delete(m.id); }
      return;
    }
    if (m.type === 'chunk') {
      const r = buildChunk(gen(m.body), m.face, m.level, m.ix, m.iy, m.N);
      r.type = 'chunk'; r.job = m.job;
      self.postMessage(r, chunkTransferables(r));
      return;
    }
    if (m.type === 'vchunk') {
      // the near field's volume (volume.js): one field per body and anchor, its columns cached
      // across the chunks that share them
      const g = gen(m.body), key = m.body + '|' + m.anchor.o.join(',');
      let f = fields.get(key);
      if (!f || f.gen !== g) { f = new VolumeField(g, m.anchor); fields.set(key, f); if (fields.size > 4) fields.delete(fields.keys().next().value); }
      const r = buildVolumeChunk(f, m.ci, m.cj, m.ck, m.level || 0);
      self.postMessage({ type: 'vchunk', job: m.job, mesh: r }, volumeTransferables(r));
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
    if (m.type === 'portrait') {
      // (another system's world comes with its terrain parameters)
      if (m.terrain && !params.has(m.body)) params.set(m.body, m.terrain);
      const r = terrainPortrait(gen(m.body), m.options || {});
      self.postMessage({ type: 'portrait', job: m.job, px: r.px, size: r.size, cover: r.cover }, [r.px.buffer]);
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
