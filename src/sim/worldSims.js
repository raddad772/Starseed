// The simulated worlds in the game (WORLDSIM.md step 7): each solid body's world sim,
// run in a background worker (nearest first), cached in IndexedDB by seed, body, sim
// version and grid size, and handed to the terrain (the workers' generators, the
// physics' generator) when it's ready; the body's terrain is then rebuilt from it.
// Opt-in for now: ?worldsim=1 (grid size ?simN=, default 192).

import { SIM_VERSION } from '../gen/worldsim/snapshot.js';

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
  // game: the Game; opts: { N, myr, steps }
  constructor(game, opts = {}) {
    this.game = game;
    this.seed = game.seed;
    this.N = opts.N || 192;
    this.myr = opts.myr || 150;
    this.steps = opts.steps || 40;
    this.status = new Map();   // body id -> 'queued' | 'running' | 'ready' | 'failed'
    this.queue = [];
    this.busy = false;
    this.dbP = openDB();
    this.worker = new Worker(new URL('../workers/worldsimWorker.js', import.meta.url), { type: 'module' });
    this.worker.onmessage = (e) => this._onMessage(e.data);
    this.worker.onerror = (e) => { console.error('world-sim worker error', e.message || e); this.busy = false; this._next(); };
    this.onReady = null;   // (bodyId, snap) => void
  }

  key(id) { return `${this.seed}|${id}|v${SIM_VERSION}|N${this.N}`; }

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
    this.queue.push(id);
    this._next();
  }

  _next() {
    if (this.busy || !this.queue.length) return;
    const id = this.queue.shift();
    this.busy = true;
    this.status.set(id, 'running');
    this.worker.postMessage({ type: 'sim', job: id, seed: this.seed, body: id, N: this.N, myr: this.myr, steps: this.steps });
  }

  async _onMessage(m) {
    if (m.type === 'log') { if (this.verbose) console.log(`[worldsim ${m.body}] ${m.msg}`); return; }
    if (m.type === 'error') { console.error(`world sim failed for body ${m.body}:`, m.message); this.status.set(m.body, 'failed'); this.busy = false; this._next(); return; }
    if (m.type === 'snapshot') {
      this.busy = false;
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
    console.log(`world sim ${fromCache ? 'from cache' : `done in ${((snap.ms || 0) / 1000).toFixed(1)} s`}: ${b.name} (${snap.path})`);
    if (this.onReady) this.onReady(id, snap);
  }

  dispose() { this.worker.terminate(); }
}
