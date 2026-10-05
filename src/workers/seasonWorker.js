// A world's seasons worked out off the main thread, for a snapshot cached before they were kept
// (worldsim/season.js seasonsFor: its climate run again on the finished surface, ~0.7 s): one job, then done
import { seasonsFor } from '../gen/worldsim/season.js';

self.onmessage = (e) => {
  try {
    const r = seasonsFor(e.data.snap, e.data.opts);
    if (r) self.postMessage({ r }, [r.season.buffer, r.seasonPx.buffer]);
    else self.postMessage({ r: null });
  } catch (err) { self.postMessage({ error: String(err && err.stack || err) }); }
};
