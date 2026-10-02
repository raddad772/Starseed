// World-sim worker (WORLDSIM.md step 7): runs a body's whole world simulation off the
// main thread and hands back its snapshot. The system is regenerated from its seed
// (deterministic: the same bodies the game has).

import { generateSystem } from '../gen/system.js';
import { worldSim, simOptsFor } from '../gen/worldsim/world.js';
import { packSnapshot, snapshotBuffers } from '../gen/worldsim/snapshot.js';
import { findFeatures } from '../gen/worldsim/features.js';
import { nameLandmarks, landmarks } from '../gen/worldsim/landmarks.js';
import { ROCKS } from '../gen/worldsim/lithology.js';

let sys = null, sysSeed = null;

self.onmessage = (e) => {
  const m = e.data;
  try {
    if (m.type !== 'sim') return;
    if (sysSeed !== m.seed) { sys = generateSystem(m.seed); sysSeed = m.seed; }
    const b = sys.bodies[m.body];
    const t0 = performance.now();
    const W = worldSim(b, sys.bodies[0], { N: m.N, myr: m.myr, steps: m.steps, ...simOptsFor(b, sys), log: (msg) => self.postMessage({ type: 'log', job: m.job, body: m.body, msg }) });
    const snap = packSnapshot(W, b);
    // its landmarks, named (the catalog shows them)
    try {
      const F = findFeatures(W.G, W.h, { E: W.E, scale: b.R / b.radiusM, craters: W.craters || [], volcanoes: W.volcanoes, tuyas: W.tuyas, glaciers: W.glaciers, coasts: W.coasts, rock: W.rock, rockNames: ROCKS.map((r) => r.name), climate: W.climate, Gc: W.Gc, dunes: W.dunes, mesas: W.mesas, soil: W.soil, drowned: W.drowned, top: 5 });
      snap.landmarks = landmarks(nameLandmarks(F, `${m.seed}|${m.body}`));
    } catch (err) { self.postMessage({ type: 'log', job: m.job, body: m.body, msg: 'landmarks failed: ' + err }); }
    snap.ms = Math.round(performance.now() - t0);
    self.postMessage({ type: 'snapshot', job: m.job, body: m.body, snap }, snapshotBuffers(snap));
  } catch (err) {
    self.postMessage({ type: 'error', job: m.job, body: m.body, message: String(err && err.stack || err) });
  }
};
