// World-sim worker (WORLDSIM.md step 7): runs a body's whole world simulation off the
// main thread and hands back its snapshot. The system is regenerated from its seed
// (deterministic: the same bodies the game has).

import { generateSystem } from '../gen/system.js';
import { worldSim, simOptsFor } from '../gen/worldsim/world.js';
import { packSnapshot, snapshotBuffers } from '../gen/worldsim/snapshot.js';
import { findFeatures } from '../gen/worldsim/features.js';
import { nameLandmarks, landmarks } from '../gen/worldsim/landmarks.js';
import { ROCKS } from '../gen/worldsim/lithology.js';
import { TerrainGenerator } from '../gen/terrain.js';
import { prepareTile, refineLevel } from '../gen/localsim.js';
import { packTile, RefineReader, TileSet } from '../gen/worldsim/refine.js';
import { runInt } from '../gpu/itile.js';
import { ITileGPU } from '../gpu/itileGPU.js';

// the GPU for the tile sim (gpu/itileGPU.js), once; without one, the integer reference here
// (the same result, bit for bit, a few dozen times slower)
let gpuP = null;
const gpu = () => gpuP || (gpuP = ITileGPU.create().catch(() => null));

let sys = null, sysSeed = null;
const pyrGens = new Map();   // body -> its generator for the pyramid's tiles

self.onmessage = async (e) => {
  const m = e.data;
  try {
    if (sysSeed !== m.seed) { sys = generateSystem(m.seed); sysSeed = m.seed; }
    if (m.type === 'refine') {
      // one face of a world's refinement (localsim.js 'refine' tiles), each tile posted as done
      const b = sys.bodies[m.body], gen = new TerrainGenerator({ ...b.terrain, snapshot: m.snap });
      const n = 1 << refineLevel(gen), G = await gpu();
      for (let tj = 0; tj < n; tj++) for (let ti = 0; ti < n; ti++) {
        const P = prepareTile(gen, m.face, ti, tj, { kind: 'refine' }), I = P.ints();
        P.fromInts(G ? await G.run(I) : runInt(I));
        const p = packTile(P.finish());
        self.postMessage({ type: 'tile', job: m.job, body: m.body, tile: p }, [p.h.buffer, p.rw.buffer]);
      }
      self.postMessage({ type: 'refined', job: m.job, body: m.body, face: m.face });
      return;
    }
    if (m.type === 'pyr') {
      // one tile of the terrain pyramid (gen/terrainTiles.js), on the level above's tiles (or
      // the refinement): its heights (m) and rock | water << 5 come back
      let gen = pyrGens.get(m.body);
      if (!gen || gen._refine !== m.refine) {
        const b = sys.bodies[m.body];
        gen = new TerrainGenerator({ ...b.terrain, snapshot: m.snap, refine: m.refine });
        gen._refine = m.refine;
        pyrGens.set(m.body, gen);
      }
      let src = m.refine;
      if (m.parents.length) { src = new TileSet(m.L - 2); for (const p of m.parents) src.put(p.face, p.ti, p.tj, p); }
      const P = prepareTile(gen, m.face, m.ti, m.tj, { kind: 'pyr', L: m.L, parent: new RefineReader(src) }), I = P.ints(), G = await gpu();
      P.fromInts(G ? await G.run(I) : runInt(I));
      const T = P.finish(), rw = new Uint8Array(T.rockC.length);
      for (let o = 0; o < rw.length; o++) rw[o] = (T.rockC[o] & 31) | (T.water[o] << 5);
      self.postMessage({ type: 'ptile', job: m.job, body: m.body, L: m.L, face: m.face, ti: m.ti, tj: m.tj, h: T.h, rw }, [T.h.buffer, rw.buffer]);
      return;
    }
    if (m.type !== 'sim') return;
    const b = sys.bodies[m.body];
    const t0 = performance.now();
    const W = worldSim(b, sys.bodies[0], { N: m.N, myr: m.myr, steps: m.steps, ...simOptsFor(b, sys), log: (msg) => self.postMessage({ type: 'log', job: m.job, body: m.body, msg }) });
    const snap = packSnapshot(W, b);
    // its landmarks, named (the catalog shows them)
    try {
      const F = findFeatures(W.G, W.h, { E: W.E, scale: b.R / b.radiusM, craters: W.craters || [], volcanoes: W.volcanoes, tuyas: W.tuyas, glaciers: W.glaciers, coasts: W.coasts, rock: W.rock, rockNames: ROCKS.map((r) => r.name), climate: W.climate, Gc: W.Gc, dunes: W.dunes, mesas: W.mesas, soil: W.soil, drowned: W.drowned, top: 5 });
      const dry = !b.terrain.liquid || b.terrain.liquid === 'lava';
      snap.landmarks = landmarks(nameLandmarks(F, `${m.seed}|${m.body}`, dry), dry);
    } catch (err) { self.postMessage({ type: 'log', job: m.job, body: m.body, msg: 'landmarks failed: ' + err }); }
    snap.ms = Math.round(performance.now() - t0);
    self.postMessage({ type: 'snapshot', job: m.job, body: m.body, snap }, snapshotBuffers(snap));
  } catch (err) {
    self.postMessage({ type: 'error', job: m.job, body: m.body, message: String(err && err.stack || err) });
  }
};
