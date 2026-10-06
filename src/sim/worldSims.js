// The simulated worlds in the game (WORLDSIM.md step 7): each solid body's world sim,
// run in a background worker (nearest first), cached in IndexedDB by seed, body, sim
// version and grid size, and handed to the terrain (the workers' generators, the
// physics' generator) when it's ready; the body's terrain is then rebuilt from it.
// One sim per world, ever (a world doesn't change while you're away): its grid as fine as
// its size merits (snapshot.js simNFor: N 288 for an Earth, coarser for smaller worlds).
// Two sims run at once on a machine with 8+ cores (each takes ~0.5-0.65 GB), else one.
// Opt-in for now: ?worldsim=1 (?simN= the grid for an Earth-sized world, default 288;
// ?simWorkers= how many at once).
// Then each world's refinement (worldsim/refine.js: what its water cut at a few times the
// grid's resolution, its drowned coasts, its rock), a face at a time on the same workers (the
// start world's ahead of the other worlds' sims), cached the same way and shared with the
// terrain workers (one copy: SharedArrayBuffers).

import { SIM_VERSION, simNFor } from '../gen/worldsim/snapshot.js';
import { auroraLandmark } from '../gen/worldsim/landmarks.js';
import { climateOpts } from '../gen/worldsim/climate.js';
import { SEASON_W, SEASON_H, SEASON_V } from '../gen/worldsim/season.js';
import { TILE_VERSION } from '../gen/tileshape.js';
import { refineLevelN } from '../gen/localsim.js';
import { newRefine, putTile, complete, toStorable, fromStorable, RIVER_VERSION } from '../gen/worldsim/refine.js';

// a refinement's rivers made from it whole and indexed (refine.js worldRivers: each river's source
// stream with it), in a worker of their own; its arrays shared, or copied. R: the drawn globe's
// radius (its lengths along the rivers: their meanders' phase in widths; the deep time's, SIM_LEN,
// is 6.4 times it and squeezed every meander as long along its valley into a hairpin across it)
function indexWorld(Rf, N, R) {
  return new Promise((resolve) => {
    const w = new Worker(new URL('../workers/riverIndexWorker.js' + location.search, import.meta.url), { type: 'module' });
    w.onmessage = (e) => { w.terminate(); if (e.data.error) { console.error('river index failed:', e.data.error); resolve(null); } else resolve(e.data.riv); };
    w.onerror = (e) => { w.terminate(); console.error('river index worker:', e.message); resolve(null); };
    w.postMessage({ ref: { L: Rf.L, n: Rf.n, h: Rf.h, rw: Rf.rw, fl: Rf.fl, rcv: Rf.rcv }, N, R });
  });
}

// a world's seasons (worldsim/season.js: its climate's year, for the ground's snow through it) for a
// snapshot cached before they were kept, in a worker of their own: the snapshot's surface and the body's
// orbit and spin
function seasonsOf(snap, opts) {
  return new Promise((resolve) => {
    const w = new Worker(new URL('../workers/seasonWorker.js' + location.search, import.meta.url), { type: 'module' });
    w.onmessage = (e) => { w.terminate(); if (e.data.error) { console.error('seasons failed:', e.data.error); resolve(null); } else resolve(e.data.r); };
    w.onerror = (e) => { w.terminate(); console.error('seasons worker:', e.message); resolve(null); };
    w.postMessage({ snap: { N: snap.N, R: snap.R, Nc: snap.Nc, h: snap.h, water: snap.water, ocean: snap.ocean, cover: snap.cover, forest: snap.forest, Tsea: snap.Tsea }, opts });
  });
}

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
    const keep = `|v${SIM_VERSION}|`, keepR = `|r${TILE_VERSION}`;
    const q = db.transaction(STORE, 'readwrite').objectStore(STORE).openKeyCursor();
    q.onsuccess = () => {
      const c = q.result; if (!c) return;
      const k = String(c.key);
      if (!k.includes(keep) || (k.includes('|r') && !k.endsWith(keepR))) c.source.delete(c.key);
      c.continue();
    };
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
    this.gpu = opts.gpu !== false;   // (the tile sims on the GPU where there is one)
    this.status = new Map();   // body id -> 'queued' | 'running' | 'ready' | 'failed'
    this.queue = [];           // { kind: 'sim', id, N } | { kind: 'refine', id, face, snap }
    this.refine = new Map();   // body id -> { R (refine.js), tiles done of total, status }
    this.phase = new Map();    // body id -> the running sim's stage
    this.dbP = openDB();
    this.dbP.then(dbPrune);
    const cores = (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) || 4;
    const nw = Math.max(1, Math.min(4, opts.workers || (cores >= 8 ? 2 : 1)));
    this.workers = [];
    // (the sims' workers, and two for the GPU's tiles: the terrain pyramid near the player and
    // the refinements, never waiting behind a world's minute-long sim; two, so one's CPU work
    // overlaps the other's on the GPU)
    for (let i = 0; i < nw + 2; i++) {
      const w = { worker: new Worker(new URL('../workers/worldsimWorker.js' + location.search, import.meta.url), { type: 'module' }), job: null, role: i < nw ? 'sim' : 'tile' };
      w.worker.onmessage = (e) => this._onMessage(w, e.data);
      w.worker.onerror = (e) => {
        console.error('world-sim worker error', e.message || e);
        const job = w.job;
        if (job && job.kind === 'pyr') job.reject(new Error(e.message || 'worker error'));
        else if (job && job.kind === 'refine') this.refine.get(job.id).status = 'failed';
        else if (job) this.status.set(job.id, 'failed');
        w.job = null; this._next();
      };
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
    for (const [id, st] of this.refine) if (st.status === 'running') running.push(`${name(id)}: coasts and valleys, ${Math.round(100 * (st.done || 0) / (st.total || 1))}%`);
    if (ready >= all.length && !running.length) { this.el.textContent = `Simulated worlds ready (${ready})`; this.el.style.opacity = '0'; return; }
    this.el.style.opacity = '0.75';
    this.el.textContent = `Simulating worlds: ${ready} of ${all.length} ready${running.length ? ' · ' + running.join(' · ') : ''}`;
  }

  // a world's grid (its size's: simNFor) and cache key
  nFor(id) { return simNFor(this.game.system.bodies[id], this.N); }
  key(id) { return `${this.seed}|${id}|v${SIM_VERSION}|N${this.nFor(id)}`; }
  refKey(id) { return `${this.key(id)}|r${TILE_VERSION}`; }

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
    if (cached) {
      // (one cached before its seasons were kept: worked out once, kept, and the world shown with them)
      if (cached.Nc && cached.seasonV !== SEASON_V) {
        const b = this.game.system.bodies[id], host = b.kind === 'moon' ? this.game.system.bodies[b.parentId] : null;
        const r = await seasonsOf(cached, climateOpts(b, this.game.system.bodies[0], host));
        if (r) { Object.assign(cached, r); dbPut(await this.dbP, this.key(id), cached); }
      }
      this._apply(id, cached, true);
      return;
    }
    this.queue.push({ kind: 'sim', id, N: this.nFor(id) });
    this._next();
  }

  // a tile of a world's terrain pyramid (gen/terrainTiles.js) on a free worker, ahead of the
  // sims and refinements queued: resolves to { h, rw } (or rejects)
  requestPyr(id, L, face, ti, tj, parents) {
    const snap = this.game.system.bodies[id].terrain.snapshot, refine = this.refine.get(id) && this.refine.get(id).R;
    if (!snap || !refine) return Promise.reject(new Error('no refinement yet'));
    return new Promise((resolve, reject) => {
      this.queue.unshift({ kind: 'pyr', id, L, face, ti, tj, parents, snap, refine, resolve, reject, t0: performance.now() });
      this._next();
    });
  }

  // a world's refinement: from the cache, or its six faces queued (the start world's first)
  async requestRefine(id, snap) {
    if (this.refine.has(id)) return;
    const st = { R: null, done: 0, total: 0, status: 'queued' };
    this.refine.set(id, st);
    const cached = await dbGet(await this.dbP, this.refKey(id));
    if (cached && cached.version === TILE_VERSION) {
      st.R = fromStorable(cached);
      // (its rivers made again where they were made another way: the refinement itself kept)
      if (!st.R.riv || st.R.riv.version !== RIVER_VERSION) {
        const bd = this.game.system.bodies[id], snap = bd.terrain.snapshot;
        if (snap) { st.R.riv = await indexWorld(st.R, snap.N, bd.R); dbPut(await this.dbP, this.refKey(id), toStorable(st.R)); }
      }
      this._applyRefine(id, st, true);
      return;
    }
    st.R = newRefine(refineLevelN(snap.N));
    st.t0 = performance.now();
    // (a tile a job: each a second or two, so a worker's soon free for the pyramid's tiles)
    const n = st.R.n, jobs = [];
    for (let face = 0; face < 6; face++) for (let tj = 0; tj < n; tj++) for (let ti = 0; ti < n; ti++) jobs.push({ kind: 'refine', id, face, ti, tj, snap });
    st.total = jobs.length; st.done = 0;
    if (id === this.game.system.startBodyId) this.queue.unshift(...jobs); else this.queue.push(...jobs);
    this._next();
  }

  // start queued sims on any free workers
  // the next job for a worker: the tile workers take the pyramid's tiles, then refinements; a
  // sim worker the pyramid's tiles too before another world's sim (the ground under the camera
  // first), then refinements
  _pick(w) {
    const order = w.role === 'tile' ? ['pyr', 'refine'] : ['pyr', 'sim', 'refine'];
    for (const kind of order) {
      const i = this.queue.findIndex((j) => j.kind === kind);
      if (i >= 0) return this.queue.splice(i, 1)[0];
    }
    return null;
  }

  _next() {
    for (const w of this.workers) {
      if (w.job || !this.queue.length) continue;
      const job = this._pick(w);
      if (!job) continue;
      w.job = job;
      if (job.kind === 'pyr') {
        // (a world's snapshot goes to a worker once: it keeps the world's generator)
        const has = w.hasSnap || (w.hasSnap = new Set());
        const snap = has.has(job.id) ? null : job.snap;
        has.add(job.id);
        // (and its refinement once, without its rivers' index (MBs, which the tiles don't read):
        // its heights and rock are shared memory, so the worker's copy is the same arrays)
        const sent = w.refSent || (w.refSent = new Map()), refKey = this.refKey(job.id), R = job.refine;
        const refine = sent.get(job.id) === R ? null : { version: R.version, L: R.L, n: R.n, K: R.K, h: R.h, rw: R.rw, fl: R.fl, rcv: R.rcv, done: R.done };
        sent.set(job.id, R);
        w.worker.postMessage({ type: 'pyr', job: job.id, seed: this.seed, body: job.id, L: job.L, face: job.face, ti: job.ti, tj: job.tj, snap, refine, refKey, parents: job.parents, gpu: this.gpu });
        continue;
      }
      if (job.kind === 'refine') {
        this.refine.get(job.id).status = 'running';
        const has = w.hasSnap || (w.hasSnap = new Set()), snap = has.has(job.id) ? null : job.snap;
        has.add(job.id);
        w.worker.postMessage({ type: 'refine', job: job.id, seed: this.seed, body: job.id, face: job.face, ti: job.ti, tj: job.tj, snap, gpu: this.gpu });
        continue;
      }
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
    if (m.type === 'error') {
      const job = w.job;
      console.error(`world ${job && job.kind !== 'sim' ? job.kind : 'sim'} failed for body ${m.body}:`, m.message);
      if (job && job.kind === 'pyr') job.reject(new Error(m.message));
      else if (job && job.kind === 'refine') this.refine.get(m.body).status = 'failed'; else this.status.set(m.body, 'failed');
      w.job = null; this._next(); return;
    }
    if (m.type === 'ptile') {
      const job = w.job; w.job = null;
      // (how long the tile took, by part, for tuning: the last few dozen)
      if (m.ms) { (this.tileMs || (this.tileMs = [])).push({ L: m.L, wait: Math.round(performance.now() - job.t0), ...m.ms }); if (this.tileMs.length > 48) this.tileMs.shift(); }
      job.resolve({ h: m.h, rw: m.rw, fl: m.fl, rcv: m.rcv }); this._next(); return;
    }
    if (m.type === 'tile') { const st = this.refine.get(m.body); if (st && st.R) putTile(st.R, m.tile); return; }
    if (m.type === 'refined') {
      w.job = null;
      this._next();   // (the worker's free while the last tile's rivers are indexed)
      const st = this.refine.get(m.body);
      st.done++;
      if (st.done === st.total && complete(st.R)) {
        st.ms = performance.now() - st.t0;
        // (its rivers, indexed by the world sim's cells: in a worker of their own, a few hundred ms;
        // in tile order, not the order they came back in, so every client's index is the same)
        const bd = this.game.system.bodies[m.body], snap = bd.terrain.snapshot;
        if (snap) st.R.riv = await indexWorld(st.R, snap.N, bd.R);
        dbPut(await this.dbP, this.refKey(m.body), toStorable(st.R));
        this._applyRefine(m.body, st, false);
      }
      this._next();
      return;
    }
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
    // (where to watch its aurora: read from the snapshot, so cached worlds have it too)
    if (snap.landmarks && !snap.landmarks.some((l) => l.kind === 'aurora')) {
      // (third in the list: the catalog shows the first few)
      try { const a = auroraLandmark(snap, b, `${this.seed}|${id}`); if (a) snap.landmarks.splice(Math.min(2, snap.landmarks.length), 0, a); } catch (err) { console.warn('aurora landmark:', err); }
    }
    b.terrain.snapshot = snap;
    const ub = g.universe.bodies.find((x) => x.data && x.data.id === id);
    if (ub) ub._gen = null;                          // (the physics' generator, rebuilt from it)
    g.pool.setSnapshot(id, snap);                    // (the terrain workers')
    if (g.world.rebuildTerrain) g.world.rebuildTerrain(id);
    // (and its seasons, kept with it, for its land's snow through the year)
    if (snap.seasonPx && g.world.setSeasonMap) g.world.setSeasonMap(id, { px: snap.seasonPx, icePx: snap.seasonIcePx, w: SEASON_W, h: SEASON_H, yearDays: snap.yearDays || 365 });
    console.log(`world sim ${fromCache ? 'from cache' : `done in ${((snap.ms || 0) / 1000).toFixed(1)} s`}: ${b.name} (${snap.path}, N ${snap.N})`);
    if (this.onReady) this.onReady(id, snap);
    this.requestRefine(id, snap);
    this._progress();
  }

  _applyRefine(id, st, fromCache) {
    st.status = 'ready';
    const g = this.game, b = g.system.bodies[id];
    b.terrain.refine = st.R;
    const ub = g.universe.bodies.find((x) => x.data && x.data.id === id);
    if (ub) ub._gen = null;
    g.pool.setRefine(id, st.R);
    if (g.world.rebuildTerrain) g.world.rebuildTerrain(id);
    console.log(`world refinement ${fromCache ? 'from cache' : `done in ${((st.ms || 0) / 1000).toFixed(1)} s`}: ${b.name} (${6 * st.R.n * st.R.n} tiles)`);
    if (this.onRefined) this.onRefined(id);
    this._progress();
  }

  dispose() { for (const w of this.workers) w.worker.terminate(); if (this.el) this.el.remove(); }
}
