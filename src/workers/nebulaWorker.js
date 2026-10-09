// The infalling gas simulated off the main thread (sim/nebula.js): a few seconds of orbits and a density
// grid, posted back once, its arrays transferred.
import { infallStreamer } from '../sim/nebula.js';

self.onmessage = () => {
  const v = infallStreamer();
  self.postMessage({ min: v.min, max: v.max, dims: v.dims, cell: v.cell, density: v.density, ionized: v.ionized }, [v.density.buffer, v.ionized.buffer]);
};
