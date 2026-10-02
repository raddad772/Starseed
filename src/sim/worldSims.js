// The simulated worlds in the game (WORLDSIM.md step 7): each solid body's world sim,
// run in a background worker (nearest first), cached in IndexedDB by seed, body, sim
// version and grid size, and handed to the terrain (the workers' generators, the
// physics' generator) when it's ready; the body's terrain is then rebuilt from it.
// One sim per world, ever (a world doesn't change while you're away): its grid as fine as
// its size merits (snapshot.js simNFor: N 288 for an Earth, coarser for smaller worlds).
// Two sims run at once on a machine with 8+ cores (each takes ~0.5-0.65 GB), else one.
// Opt-in for now: ?worldsim=1 (?simN= the grid for an Earth-sized world, default 288;
// ?simWorkers= how many at once).

import { SIM_VERSION, simNFor } from '../gen/worldsim/snapshot.js';

const DB = 'starseed-worldsim', STORE = 'snap';

function openDB() {
  return new Promise((resolve) => {
    try {
      const r = indexedDB.open(DB, 1);
      r.onupgradeneeded = () => r.result.createObjectStore(STORE);
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => resolve(null);
    } catch { resolve(null); }
  });
}
// snapshots from other sim versions can't be used again: drop them (they're MBs each)
function dbPrune(db) {
  if (!db) return;
  try {
    const keep = `|v${SIM_VERSION}|`;
    const q = db.transaction(STORE, 'readwrite').objectStore(STORE).openKeyCursor();
    q.onsuccess = () => { const c = q.result; if (!c) return; if (!String(c.key).includes(keep)) c.source.delete(c.key); c.continue(); };
  } catch { /* (best effort) */ }
}
function dbGet(db, key) {
  return new Promise((resolve) => {
    if (!db) return resolve(null);
    try { const q = db.transaction(STORE).objectStore(STORE).get(key); q.onsuccess = () => resolve(q.result || null); q.onerror = () => resolve(null); } catch { resolve(null); }
  });
}
function dbPut(db, key, val) {
  return new Promise((resolve) => {
    if (!db) return resolve();
    try { const t = db.transaction(STORE, 'readwrite'); t.objectStore(STORE).put(val, key); t.oncomplete = () => resolve(); t.onerror = () => resolve(); } catch { resolve(); }
  });
}

export class WorldSims {
  // game: the Game; opts: { N (an Earth-sized world's grid), myr, steps, workers }
  constructor(game, opts = {}) {
    this.game = game;
    this.seed = game.seed;
    this.N = opts.N || 288;
    this.myr = opts.myr || 150;
    this.steps = opts.steps || 40;
    this.status = new Map();   // body id -> 'queued' | 'running' | 'ready' | 'failed'
    this.queue = [];           // { id, N }
    this.phase = new Map();    // body id -> the running sim's stage
    this.dbP = openDB();
    this.dbP.then(dbPrune);
    const cores = (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) || 4;
    const nw = Math.max(1, Math.min(4, opts.workers || (cores >= 8 ? 2 : 1)));
    this.workers = [];
    for (let i = 0; i < nw; i++) {
      const w = { worker: new Worker(new URL('../workers/worldsimWorker.js', import.meta.url), { type: 'module' }), job: null };
      w.worker.onmessage = (e) => this._onMessage(w, e.data);
      w.worker.onerror = (e) => { console.error('world-sim worker error', e.message || e); if (w.job) this.status.set(w.job.id, 'failed'); w.job = null; this._next(); };
      this.workers.push(w);
    }
    this.onReady = null;   // (bodyId, snap) => void
    // a quiet progress line in a corner while worlds are being simulated
    this.el = null;
    if (typeof document !== 'undefined') {
      this.el = document.createElement('div');
      this.el.style.cssText = 'position:fixed;left:12px;bottom:10px;font:12px system-ui,sans-serif;color:#cfe3ff;opacity:0.75;pointer-events:none;z-index:5;text-shadow:0 1px 2px #000;transition:opacity 1.5s';
      document.body.appendChild(this.el);
    }
  }

  _progress() {
    if (!this.el) return;
    const all = [...this.status.values()], ready = all.filter((v) => v === 'ready' || v === 'failed').length;
    const name = (id) => this.game.system.bodies[id].name;
    const running = [...this.status].filter(([, v]) => v === 'running').map(([id]) => `${name(id)}: ${this.phase.get(id) || 'starting'}…`);
    if (ready >= all.length) { this.el.textContent = `Simulated worlds ready (${ready})`; this.el.style.opacity = '0'; return; }
    this.el.style.opacity = '0.75';
    this.el.textContent = `Simulating worlds: ${ready} of ${all.length} ready${running.length ? ' · ' + running.join(' · ') : ''}`;
  }

  // a world's grid (its size's: simNFor) and cache key
  nFor(id) { return simNFor(this.game.system.bodies[id], this.N); }
  key(id) { return `${this.seed}|${id}|v${SIM_VERSION}|N${this.nFor(id)}`; }

  // every solid body with terrain, nearest to `near` (a body id) first
  requestAll(nearId = null) {
    const bodies = this.game.system.bodies.filter((b) => b.terrain && b.solid);
    const order = bodies.map((b) => b.id).sort((a, b) => (a === nearId ? -1 : b === nearId ? 1 : a - b));
    for (const id of order) this.request(id);
  }

  async request(id) {
    if (this.status.has(id)) return;
    this.status.set(id, 'queued');
    const cached = await dbGet(await this.dbP, this.key(id));
    if (cached) { this._apply(id, cached, true); return; }
    this.queue.push({ id, N: this.nFor(id) });
    this._next();
  }

  // start queued sims on any free workers
  _next() {
    for (const w of this.workers) {
      if (w.job || !this.queue.length) continue;
      const job = this.queue.shift();
      w.job = job;
      this.status.set(job.id, 'running');
      this.phase.delete(job.id);
      w.worker.postMessage({ type: 'sim', job: job.id, seed: this.seed, body: job.id, N: job.N, myr: this.myr, steps: this.steps });
    }
    this._progress();
  }

  async _onMessage(w, m) {
    if (m.type === 'log') {
      if (this.verbose) console.log(`[worldsim ${m.body}] ${m.msg}`);
      // the sim's stages, from its log lines (deep time, the plates, the recent epoch, life)
      const k = /^(worldSim|plates|lakes after|climate now|soil|life)/.exec(m.msg);
      if (k) { this.phase.set(m.body, { worldSim: 'deep time', plates: 'the recent epoch', 'lakes after': 'ice and climate', 'climate now': 'soil and water', soil: 'life', life: 'coasts' }[k[1]]); this._progress(); }
      return;
    }
    if (m.type === 'error') { console.error(`world sim failed for body ${m.body}:`, m.message); this.status.set(m.body, 'failed'); w.job = null; this._next(); return; }
    if (m.type === 'snapshot') {
      w.job = null;
      dbPut(await this.dbP, this.key(m.body), m.snap);
      this._apply(m.body, m.snap, false);
      this._next();
    }
  }

  _apply(id, snap, fromCache) {
    this.status.set(id, 'ready');
    const g = this.game, b = g.system.bodies[id];
    b.terrain.snapshot = snap;
    const ub = g.universe.bodies.find((x) => x.data && x.data.id === id);
    if (ub) ub._gen = null;                          // (the physics' generator, rebuilt from it)
    g.pool.setSnapshot(id, snap);                    // (the terrain workers')
    if (g.world.rebuildTerrain) g.world.rebuildTerrain(id);
    console.log(`world sim ${fromCache ? 'from cache' : `done in ${((snap.ms || 0) / 1000).toFixed(1)} s`}: ${b.name} (${snap.path}, N ${snap.N})`);
    if (this.onReady) this.onReady(id, snap);
    this._progress();
  }

  dispose() { for (const w of this.workers) w.worker.terminate(); if (this.el) this.el.remove(); }
}
