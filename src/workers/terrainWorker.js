// Terrain worker: builds chunk meshes and runs settlement analysis off the
// main thread. Bodies are registered once; generators are built lazily.

import { TerrainGenerator } from '../gen/terrain.js';
import { buildChunk, chunkTransferables } from '../gen/chunkbuilder.js';
import { analyzeSettlements } from '../gen/settlements.js';
import { scatterFlora, floraSpecies, FLORA_KINDS } from '../gen/flora.js';
import { terrainPortrait, terrainGlobeMap } from '../gen/portrait.js';
import { VolumeField, buildVolumeChunk, volumeTransferables } from '../gen/volume.js';
import { TileSet } from '../gen/worldsim/refine.js';
import { heightFace } from '../gen/heightmap.js';
import { colourFace } from '../gen/colourmap.js';
import { scatterStones } from '../gen/rocks.js';
import { buildFloes } from '../gen/floeslabs.js';
import { fireTile } from '../gen/life/fire.js';

const params = new Map();
const gens = new Map();
const fields = new Map();   // body|anchor -> VolumeField
const pyrs = new Map();     // body -> its terrain pyramid's levels (L -> TileSet: sim/terrainTiles.js)

function gen(id) {
  let g = gens.get(id);
  if (!g) {
    g = new TerrainGenerator(params.get(id));
    if (g.snap && pyrs.has(id)) g.snap.attachPyr(pyrs.get(id));
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
    if (m.type === 'ptile' || m.type === 'ptileDrop') {
      // a tile of its terrain pyramid (shared memory) in, or gone: the generator reads it at once
      let P = pyrs.get(m.id);
      if (!P) { P = new Map(); pyrs.set(m.id, P); }
      let set = P.get(m.L);
      if (!set) { set = new TileSet(m.L); P.set(m.L, set); }
      if (m.type === 'ptile') set.put(m.face, m.ti, m.tj, m.tile); else set.drop(m.T);
      const g = gens.get(m.id);
      if (g && g.snap && g.snap.pyr !== P) g.snap.attachPyr(P);
      for (const k of [...fields.keys()]) if (k.startsWith(m.id + '|')) fields.delete(k);
      return;
    }
    if (m.type === 'refine') {
      // its refinement (worldsim/refine.js, shared memory): read from now on
      const p = params.get(m.id);
      if (p) { params.set(m.id, { ...p, refine: m.refine }); gens.delete(m.id); }
      for (const k of [...fields.keys()]) if (k.startsWith(m.id + '|')) fields.delete(k);
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
      self.postMessage(r, [...FLORA_KINDS.map((k) => r[k].buffer), r.geo.buffer]);
      return;
    }
    if (m.type === 'portrait') {
      // (another system's world comes with its terrain parameters)
      if (m.terrain && !params.has(m.body)) params.set(m.body, m.terrain);
      const r = terrainPortrait(gen(m.body), m.options || {});
      self.postMessage({ type: 'portrait', job: m.job, px: r.px, size: r.size, cover: r.cover }, [r.px.buffer]);
      return;
    }
    if (m.type === 'globemap') {
      // the nav computer's globe: the whole world's colours and heights (gen/portrait.js)
      const r = terrainGlobeMap(gen(m.body), m.w, m.h);
      self.postMessage({ type: 'globemap', job: m.job, w: r.w, h: r.h, rgb: r.rgb, elev: r.elev }, [r.rgb.buffer, r.elev.buffer]);
      return;
    }
    if (m.type === 'stones') {
      // the small stones near the camera (gen/rocks.js)
      const g = gen(m.body), sp = g._species || (g._species = floraSpecies(params.get(m.body)));
      const r = scatterStones(g, m.face, m.level, m.ix, m.iy, m.maxLevel, sp.seed ^ 0x2545f491);
      self.postMessage({ type: 'stones', job: m.job, origin: r.origin, geo: r.geo }, [r.geo.buffer]);
      return;
    }
    if (m.type === 'floes') {
      // the sea's floes near the camera as slabs (gen/floeslabs.js)
      const r = buildFloes(gen(m.body), m.dir, m.sinSun, m.L, m.reach);
      if (!r) { self.postMessage({ type: 'floes', job: m.job, pos: null }); return; }
      self.postMessage({ type: 'floes', job: m.job, ...r }, [r.pos.buffer, r.nrm.buffer, r.fp.buffer, r.aux.buffer, r.idx.buffer, r.blocks.buffer]);
      return;
    }
    if (m.type === 'fire') {
      // a fire tile's recent centuries (gen/life/fire.js)
      const r = fireTile(gen(m.body), m.face, m.ti, m.tj, { o2K: m.o2K, seed: m.seed });
      self.postMessage({ type: 'fire', job: m.job, ...r }, [r.ageG.buffer, r.ageC.buffer, r.fires.buffer]);
      return;
    }
    if (m.type === 'cface') {
      // a strip of a cube face of the world's colour and water seen from afar (render/colourCube.js)
      const px = colourFace(gen(m.body), m.face, m.size, m.j0, m.j1);
      self.postMessage({ type: 'cface', job: m.job, px }, [px.buffer]);
      return;
    }
    if (m.type === 'hface') {
      // a cube face of the world's coarse heights, for its shadows (render/terrainShadow.js)
      const h = heightFace(gen(m.body), m.face, m.size);
      self.postMessage({ type: 'hface', job: m.job, h }, [h.buffer]);
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
