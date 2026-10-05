// Indexes a world's refinement rivers off the main thread (refine.js riverIndex: chaining the
// river records, their phases, the great rivers' winding channels): one job, then done. Given the
// refinement itself (ref), its rivers are made from it whole first (refine.js worldRivers: each
// river's source stream with it)

import { riverIndex, worldRivers } from '../gen/worldsim/refine.js';

self.onmessage = (e) => {
  const { N, R } = e.data;
  try {
    const parts = e.data.ref ? [worldRivers(e.data.ref)] : e.data.parts;
    const riv = riverIndex(parts, N, R), bufs = [riv.rec.buffer, riv.start.buffer, riv.idx.buffer, riv.half.buffer, riv.size.buffer, riv.phase.buffer, riv.rock.buffer];
    if (riv.big) bufs.push(riv.big.seg.buffer, riv.big.start.buffer, riv.big.idx.buffer, riv.big.has.buffer);
    self.postMessage({ riv }, bufs);
  } catch (err) { self.postMessage({ error: String(err && err.stack || err) }); }
};
