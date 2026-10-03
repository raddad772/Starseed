// One of tools/survey.mjs's refinement workers: it takes a world's snapshot once, then runs
// refinement tiles as the game does (the integer tile sim: compiled on the CPU, the GPU's
// results bit for bit), or the floating-point one with float.

import { parentPort, workerData } from 'worker_threads';
import { generateSystem } from '../src/gen/system.js';
import { TerrainGenerator } from '../src/gen/terrain.js';
import { prepareTile } from '../src/gen/localsim.js';
import { packTile, tileRivers } from '../src/gen/worldsim/refine.js';
import { runInt } from '../src/gpu/itile.js';
import { dunePatches } from '../src/gen/dunes.js';

const { seed, body, snap, float, tileOpts } = workerData;
const b = generateSystem(seed).bodies[body];
if (snap.dunes) snap.dunePatch = dunePatches();
const gen = new TerrainGenerator({ ...b.terrain, snapshot: snap, ...(tileOpts && tileOpts.trueScale ? { trueScale: true } : {}) });

parentPort.on('message', ([f, ti, tj]) => {
  const P = prepareTile(gen, f, ti, tj, { kind: 'refine', ...(tileOpts || {}) });
  if (float) P.steps(); else P.fromInts(runInt(P.ints()));
  const T = P.finish(), p = packTile(T), riv = tileRivers(T);
  parentPort.postMessage({ p, riv }, [p.h.buffer, p.rw.buffer, p.fl.buffer, p.rcv.buffer, riv.rec.buffer, riv.keys.buffer]);
});
