// Indexes a world's refinement rivers off the main thread (refine.js riverIndex: chaining the
// tiles' river records, their phases, the great rivers' winding channels): one job, then done.

import { riverIndex } from '../gen/worldsim/refine.js';

self.onmessage = (e) => {
  const { parts, N, R } = e.data;
  try {
    const riv = riverIndex(parts, N, R), bufs = [riv.rec.buffer, riv.start.buffer, riv.idx.buffer, riv.half.buffer, riv.size.buffer, riv.phase.buffer];
    if (riv.big) bufs.push(riv.big.seg.buffer, riv.big.start.buffer, riv.big.idx.buffer, riv.big.has.buffer);
    self.postMessage({ riv }, bufs);
  } catch (err) { self.postMessage({ error: String(err && err.stack || err) }); }
};
