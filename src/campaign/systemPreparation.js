import { resolveSystem, ensureGalaxy } from './galaxy.js';
import { prepareSystem } from '../gen/systemCache.js';

export function prepareOpeningSystems(c) {
  ensureGalaxy(c);
  // Four detailed systems, not the 200-star chart. One lightweight generation
  // worker at a time; no terrain sims, renderers or gameplay state in this queue.
  const ids=[c.galaxy.currentSystemId,c.generation.storyAnchors.receiver.systemId,'star/0/0/2','star/0/0/3'];
  return Promise.allSettled([...new Set(ids)].map(id=>{
    const e=resolveSystem(c,id);return prepareSystem(e.definition||e.seed);
  }));
}
