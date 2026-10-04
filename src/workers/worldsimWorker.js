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
import { packTile, RefineReader, TileSet, tileRivers } from '../gen/worldsim/refine.js';
import { runInt } from '../gpu/itile.js';
import { ITileGPU } from '../gpu/itileGPU.js';

// the GPU for the tile sim (gpu/itileGPU.js), once; without one, the integer reference here
// (the same result, bit for bit, a few dozen times slower)
let gpuP = null;
const gpu = () => gpuP || (gpuP = ITileGPU.create().catch(() => null));

let sys = null, sysSeed = null;
const pyrGens = new Map();   // body -> its generator for the pyramid's tiles
const refGens = new Map();   // body -> its generator for its refinement's tiles (no refinement on it)
const snaps = new Map();     // body -> its world sim's snapshot (sent once)

self.onmessage = async (e) => {
  const m = e.data;
  try {
    if (sysSeed !== m.seed) { sys = generateSystem(m.seed); sysSeed = m.seed; snaps.clear(); pyrGens.clear(); refGens.clear(); }
    if (m.snap) snaps.set(m.body, m.snap);   // (a world's snapshot comes once: kept for its tiles)
    if (m.type === 'refine') {
      // one tile of a world's refinement (localsim.js 'refine'); the world's generator kept
      // between them (its snapshot comes once to each worker)
      let gen = refGens.get(m.body);
      if (!gen) {
        const b = sys.bodies[m.body];
        if (!snaps.has(m.body)) throw new Error(`no snapshot for body ${m.body} in this worker`);
        gen = new TerrainGenerator({ ...b.terrain, snapshot: snaps.get(m.body) });
        refGens.set(m.body, gen);
      }
      const G = m.gpu === false ? null : await gpu(), P = prepareTile(gen, m.face, m.ti, m.tj, { kind: 'refine' }), I = P.ints();
      P.fromInts(G ? await G.run(I) : runInt(I));
      const T = P.finish(), p = packTile(T);
      p.riv = tileRivers(T);
      self.postMessage({ type: 'tile', job: m.job, body: m.body, tile: p }, [p.h.buffer, p.rw.buffer, p.fl.buffer, p.rcv.buffer, p.riv.rec.buffer, p.riv.keys.buffer]);
      self.postMessage({ type: 'refined', job: m.job, body: m.body, face: m.face });
      return;
    }
    if (m.type === 'pyr') {
      // one tile of the terrain pyramid (gen/terrainTiles.js), on the level above's tiles (or
      // the refinement): its heights (m) and rock | water << 5 come back
      // (the world's generator kept between its tiles: its snapshot comes once to each worker)
      // (and its refinement comes once too: kept with the generator)
      let gen = pyrGens.get(m.body);
      if (m.refine || !gen || gen._key !== m.refKey) {
        const b = sys.bodies[m.body];
        if (!snaps.has(m.body)) throw new Error(`no snapshot for body ${m.body} in this worker`);
        if (!m.refine) throw new Error(`no refinement for body ${m.body} in this worker`);
        gen = new TerrainGenerator({ ...b.terrain, snapshot: snaps.get(m.body), refine: m.refine });
        gen._key = m.refKey; gen._ref = m.refine;
        pyrGens.set(m.body, gen);
      }
      let src = gen._ref;
      if (m.parents.length) { src = new TileSet(m.L - 2); for (const p of m.parents) src.put(p.face, p.ti, p.tj, p); }
      // (its time in each part, back with it: WorldSims.tileMs keeps the last few dozen)
      let t = performance.now();
      const P = prepareTile(gen, m.face, m.ti, m.tj, { kind: 'pyr', L: m.L, parent: new RefineReader(src) }), I = P.ints(), G = m.gpu === false ? null : await gpu();
      const ms = { setup: performance.now() - t, gpu: !!G }; t = performance.now();
      P.fromInts(G ? await G.run(I) : runInt(I));
      ms.sim = performance.now() - t; t = performance.now();
      const T = P.finish(), rw = new Uint8Array(T.rockC.length);
      for (let o = 0; o < rw.length; o++) rw[o] = (T.rockC[o] & 31) | (T.water[o] << 5);
      ms.finish = performance.now() - t;
      self.postMessage({ type: 'ptile', job: m.job, body: m.body, L: m.L, face: m.face, ti: m.ti, tj: m.tj, h: T.h, rw, fl: T.fl, rcv: T.rcv, ms }, [T.h.buffer, rw.buffer, T.fl.buffer, T.rcv.buffer]);
      return;
    }
    if (m.type !== 'sim') return;
    const b = sys.bodies[m.body];
    const t0 = performance.now();
    const W = worldSim(b, sys.bodies[0], { N: m.N, myr: m.myr, steps: m.steps, ...simOptsFor(b, sys), log: (msg) => self.postMessage({ type: 'log', job: m.job, body: m.body, msg }) });
    const snap = packSnapshot(W, b);
    // its landmarks, named (the catalog shows them)
    try {
      const F = findFeatures(W.G, W.h, { E: W.E, scale: W.G.R / b.radiusM, craters: W.craters || [], volcanoes: W.volcanoes, tuyas: W.tuyas, glaciers: W.glaciers, coasts: W.coasts, rock: W.rock, rockNames: ROCKS.map((r) => r.name), climate: W.climate, Gc: W.Gc, dunes: W.dunes, mesas: W.mesas, soil: W.soil, drowned: W.drowned, top: 5 });
      const dry = !b.terrain.liquid || b.terrain.liquid === 'lava';
      snap.landmarks = landmarks(nameLandmarks(F, `${m.seed}|${m.body}`, dry), dry);
    } catch (err) { self.postMessage({ type: 'log', job: m.job, body: m.body, msg: 'landmarks failed: ' + err }); }
    snap.ms = Math.round(performance.now() - t0);
    self.postMessage({ type: 'snapshot', job: m.job, body: m.body, snap }, snapshotBuffers(snap));
  } catch (err) {
    self.postMessage({ type: 'error', job: m.job, body: m.body, message: String(err && err.stack || err) });
  }
};
