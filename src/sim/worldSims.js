// The simulated worlds in the game (WORLDSIM.md step 7): each solid body's world sim,
// run in a background worker (nearest first), cached in IndexedDB by seed, body, sim
// version and grid size, and handed to the terrain (the workers' generators, the
// physics' generator) when it's ready; the body's terrain is then rebuilt from it.
// A world a player visits gets a finer sim after every world has its first (finer rivers,
// coasts and lakes). It is a different run of the same history, so it waits until nobody is
// on or near that world (the land doesn't change under anyone's feet), and is used from the
// cache from then on.
// Opt-in for now: ?worldsim=1 (grid size ?simN=, default 192; the finer ?simHiN=, default
// 288, 0 for none).

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
    this.hiN = opts.hiN ?? 288;
    this.myr = opts.myr || 150;
    this.steps = opts.steps || 40;
    this.status = new Map();   // body id -> 'queued' | 'running' | 'ready' | 'failed'
    this.hi = new Map();       // body id -> the same, for its finer sim
    this.pending = new Map();  // body id -> a finer snapshot waiting for everyone to leave
    this.near = new Set();     // bodies a player is on or near (tick)
    this.queue = [];           // { id, N }
    this.busy = false;
    this.dbP = openDB();
    this.worker = new Worker(new URL('../workers/worldsimWorker.js', import.meta.url), { type: 'module' });
    this.worker.onmessage = (e) => this._onMessage(e.data);
    this.worker.onerror = (e) => { console.error('world-sim worker error', e.message || e); this.busy = false; this._next(); };
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
    const running = [...this.status].find(([, v]) => v === 'running');
    const fine = [...this.hi].find(([, v]) => v === 'running');
    if (fine && ready >= all.length) {
      this.el.style.opacity = '0.75';
      this.el.textContent = `Refining ${this.game.system.bodies[fine[0]].name} (finer rivers and coasts): ${this.phase || 'starting'}…`;
      return;
    }
    if (ready >= all.length) {
      if (this.pending.size) {
        // (said for a few seconds, then gone)
        this.el.textContent = `Finer ${[...this.pending.keys()].map((id) => this.game.system.bodies[id].name).join(', ')} ready: in place when you next arrive`;
        this.el.style.opacity = '0.75';
        clearTimeout(this._fade); this._fade = setTimeout(() => { if (this.el) this.el.style.opacity = '0'; }, 8000);
        return;
      }
      this.el.textContent = `Simulated worlds ready (${ready})`; this.el.style.opacity = '0'; return;
    }
    this.el.style.opacity = '0.75';
    this.el.textContent = `Simulating worlds: ${ready} of ${all.length} ready${running ? ` · ${this.game.system.bodies[running[0]].name}: ${this.phase || 'starting'}…` : ''}`;
  }

  key(id, N = this.N) { return `${this.seed}|${id}|v${SIM_VERSION}|N${N}`; }

  // every solid body with terrain, nearest to `near` (a body id) first
  requestAll(nearId = null) {
    const bodies = this.game.system.bodies.filter((b) => b.terrain && b.solid);
    const order = bodies.map((b) => b.id).sort((a, b) => (a === nearId ? -1 : b === nearId ? 1 : a - b));
    for (const id of order) this.request(id);
  }

  async request(id) {
    if (this.status.has(id)) return;
    this.status.set(id, 'queued');
    const db = await this.dbP;
    // (a finer sim from an earlier visit stands in for the first)
    const fine = this.hiN > this.N ? await dbGet(db, this.key(id, this.hiN)) : null;
    if (fine) { this.hi.set(id, 'ready'); this._apply(id, fine, true); return; }
    const cached = await dbGet(db, this.key(id));
    if (cached) { this._apply(id, cached, true); return; }
    this.queue.push({ id, N: this.N });
    this._next();
  }

  // every few seconds from the game: the bodies a player is on or near (a Set of ids). They
  // get their finer sims; finer ones waiting for worlds nobody is near now go in.
  tick(near) {
    this.near = near;
    for (const id of near) this.visit(id);
    for (const [id, snap] of this.pending) if (!near.has(id)) { this.pending.delete(id); this._apply(id, snap, false); }
  }

  // a player is on or near this world: its finer sim, after every world's first
  async visit(id) {
    if (!(this.hiN > this.N) || this.hi.has(id)) return;
    const b = this.game.system.bodies[id];
    if (!b || !b.terrain || !b.solid) return;
    this.hi.set(id, 'queued');
    const fine = await dbGet(await this.dbP, this.key(id, this.hiN));
    if (fine) { this.hi.set(id, 'ready'); this._fineReady(id, fine); return; }
    this.queue.push({ id, N: this.hiN });
    this._next();
  }

  // a finer sim to put in: now if nobody is near that world, else when they've all left
  _fineReady(id, snap) {
    this.queue = this.queue.filter((q) => !(q.id === id && q.N === this.N));
    if (this.near.has(id)) this.pending.set(id, snap); else this._apply(id, snap, false);
  }

  _next() {
    if (this.busy || !this.queue.length) return;
    // (every world's first sim before any finer one)
    let k = this.queue.findIndex((q) => q.N === this.N);
    if (k < 0) k = 0;
    const { id, N } = this.queue.splice(k, 1)[0];
    this.busy = true;
    (N === this.N ? this.status : this.hi).set(id, 'running');
    this.phase = null;
    this.runningN = N;
    this._progress();
    this.worker.postMessage({ type: 'sim', job: id, seed: this.seed, body: id, N, myr: this.myr, steps: this.steps });
  }

  async _onMessage(m) {
    if (m.type === 'log') {
      if (this.verbose) console.log(`[worldsim ${m.body}] ${m.msg}`);
      // the sim's stages, from its log lines (deep time, the plates, the recent epoch, life)
      const k = /^(worldSim|plates|lakes after|climate now|soil|life)/.exec(m.msg);
      if (k) { this.phase = { worldSim: 'deep time', plates: 'the recent epoch', 'lakes after': 'ice and climate', 'climate now': 'soil and water', soil: 'life', life: 'coasts' }[k[1]]; this._progress(); }
      return;
    }
    if (m.type === 'error') { console.error(`world sim failed for body ${m.body}:`, m.message); (this.runningN === this.N ? this.status : this.hi).set(m.body, 'failed'); this.busy = false; this._next(); return; }
    if (m.type === 'snapshot') {
      this.busy = false;
      const fine = m.snap.N !== this.N;
      dbPut(await this.dbP, this.key(m.body, m.snap.N), m.snap);
      if (fine) { this.hi.set(m.body, 'ready'); this._fineReady(m.body, m.snap); }
      // (a first sim that lands after a finer one is in, or waiting, is cached, not applied)
      else if (this.hi.get(m.body) === 'ready') this.status.set(m.body, 'ready');
      else this._apply(m.body, m.snap, false);
      this._next();
      this._progress();
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

  dispose() { this.worker.terminate(); clearTimeout(this._fade); if (this.el) this.el.remove(); }
}
