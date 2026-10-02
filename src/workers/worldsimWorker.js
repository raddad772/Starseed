// World-sim worker (WORLDSIM.md step 7): runs a body's whole world simulation off the
// main thread and hands back its snapshot. The system is regenerated from its seed
// (deterministic: the same bodies the game has).

import { generateSystem } from '../gen/system.js';
import { worldSim, simOptsFor } from '../gen/worldsim/world.js';
import { packSnapshot, snapshotBuffers } from '../gen/worldsim/snapshot.js';

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
    snap.ms = Math.round(performance.now() - t0);
    self.postMessage({ type: 'snapshot', job: m.job, body: m.body, snap }, snapshotBuffers(snap));
  } catch (err) {
    self.postMessage({ type: 'error', job: m.job, body: m.body, message: String(err && err.stack || err) });
  }
};
