// Priority job scheduler over a small pool of terrain workers.
// Lower priority value = more urgent. Jobs can be cancelled before dispatch;
// results for jobs cancelled in flight are still delivered (the caller may
// cache or drop them).

import { TerrainGenerator } from '../gen/terrain.js';
import { buildChunk } from '../gen/chunkbuilder.js';
import { analyzeSettlements } from '../gen/settlements.js';
import { scatterFlora, floraSpecies } from '../gen/flora.js';
import { fireTile } from '../gen/life/fire.js';
import { terrainPortrait } from '../gen/portrait.js';
import { heightFace } from '../gen/heightmap.js';
import { scatterStones } from '../gen/rocks.js';
import { buildFloes } from '../gen/floeslabs.js';

export class WorkerPool {
  constructor(count, bodies) {
    this.workers = [];
    this.idle = [];
    this.queue = [];
    this.pending = new Map(); // job -> {resolve, reject, msg}
    this.nextJob = 1;
    this.inFlight = 0;
    this.fallback = false;
    this.bodies = bodies;
    try {
      for (let i = 0; i < count; i++) {
        const w = new Worker(new URL('../workers/terrainWorker.js' + location.search, import.meta.url), { type: 'module' });
        w.onmessage = (e) => this._onMessage(w, e.data);
        w.onerror = (e) => { console.error('terrain worker error', e.message || e); };
        w.postMessage({ type: 'bodies', bodies });
        this.workers.push(w);
        this.idle.push(w);
      }
    } catch (err) {
      console.warn('Web Workers unavailable, generating terrain on the main thread', err);
      this.fallback = true;
      this.gens = new Map();
    }
    if (!this.workers.length) { this.fallback = true; this.gens = this.gens || new Map(); }
  }

  // a body's simulated world (worldsim/snapshot.js) for the generators to read
  setSnapshot(id, snap) {
    const b = this.bodies.find((x) => x.id === id);
    if (b) b.terrain = { ...b.terrain, snapshot: snap };
    for (const w of this.workers) w.postMessage({ type: 'snapshot', id, snapshot: snap });
    if (this.gens) this.gens.delete(id);
  }

  // a body's refinement (worldsim/refine.js): its arrays are shared, not copied
  setRefine(id, R) {
    const b = this.bodies.find((x) => x.id === id);
    if (b) b.terrain = { ...b.terrain, refine: R };
    for (const w of this.workers) w.postMessage({ type: 'refine', id, refine: R });
    if (this.gens) this.gens.delete(id);
  }

  // a tile of a body's terrain pyramid (sim/terrainTiles.js), shared: in, or dropped
  setPyrTile(id, L, face, ti, tj, tile) {
    for (const w of this.workers) w.postMessage({ type: 'ptile', id, L, face, ti, tj, tile });
  }
  dropPyrTile(id, L, T) {
    for (const w of this.workers) w.postMessage({ type: 'ptileDrop', id, L, T });
  }

  // msg: { type, ... }, priority number. Returns a handle with .promise and .cancel()
  submit(msg, priority) {
    const job = this.nextJob++;
    const entry = { job, msg: { ...msg, job }, priority, cancelled: false };
    entry.promise = new Promise((resolve, reject) => { entry.resolve = resolve; entry.reject = reject; });
    this.queue.push(entry);
    this.pending.set(job, entry);
    return entry;
  }

  cancel(entry) {
    if (!entry || entry.dispatched) return false;
    entry.cancelled = true;
    this.pending.delete(entry.job);
    return true;
  }

  reprioritize(entry, priority) { if (entry && !entry.dispatched) entry.priority = priority; }

  // Dispatch queued jobs to idle workers (call once per frame)
  pump(mainThreadBudgetMs = 6) {
    if (!this.queue.length) return;
    this.queue = this.queue.filter((e) => !e.cancelled);
    this.queue.sort((a, b) => a.priority - b.priority);
    if (this.fallback) {
      const t0 = performance.now();
      while (this.queue.length && performance.now() - t0 < mainThreadBudgetMs) {
        const e = this.queue.shift();
        e.dispatched = true;
        this._runLocal(e);
      }
      return;
    }
    while (this.idle.length && this.queue.length) {
      const e = this.queue.shift();
      const w = this.idle.pop();
      e.dispatched = true;
      e.worker = w;
      this.inFlight++;
      w.postMessage(e.msg);
    }
  }

  _runLocal(e) {
    const m = e.msg;
    try {
      let g = this.gens.get(m.body);
      if (!g) {
        const b = this.bodies.find((x) => x.id === m.body);
        g = new TerrainGenerator(m.terrain || b.terrain);
        this.gens.set(m.body, g);
      }
      let r;
      if (m.type === 'chunk') { r = buildChunk(g, m.face, m.level, m.ix, m.iy, m.N); r.type = 'chunk'; }
      else if (m.type === 'flora') {
        if (!g._species) g._species = floraSpecies(this.bodies.find((x) => x.id === m.body).terrain);
        r = scatterFlora(g, m.face, m.level, m.ix, m.iy, m.maxLevel, g._species); r.type = 'flora';
      }
      else if (m.type === 'hface') r = { type: 'hface', h: heightFace(g, m.face, m.size) };
      else if (m.type === 'fire') r = { type: 'fire', ...fireTile(g, m.face, m.ti, m.tj, { o2K: m.o2K, seed: m.seed }) };
      else if (m.type === 'floes') r = { type: 'floes', ...(buildFloes(g, m.dir, m.sinSun, m.L, m.reach) || { pos: null }) };
      else if (m.type === 'stones') { const sp = g._species || (g._species = floraSpecies(this.bodies.find((x) => x.id === m.body).terrain)); const st = scatterStones(g, m.face, m.level, m.ix, m.iy, m.maxLevel, sp.seed ^ 0x2545f491); r = { type: 'stones', origin: st.origin, geo: st.geo }; }
      else if (m.type === 'portrait') { const p = terrainPortrait(g, m.options || {}); r = { type: 'portrait', px: p.px, size: p.size, cover: p.cover }; }
      else r = { type: 'analyze', result: analyzeSettlements(g, m.options || {}) };
      this.pending.delete(e.job);
      e.resolve(r);
    } catch (err) {
      this.pending.delete(e.job);
      e.reject(err);
    }
  }

  _onMessage(w, data) {
    this.idle.push(w);
    this.inFlight--;
    const e = this.pending.get(data.job);
    this.pending.delete(data.job);
    if (!e) return;
    if (data.type === 'error') { console.error('worker job failed', data.message); e.reject(new Error(data.message)); }
    else e.resolve(data);
  }

  get busy() { return this.inFlight + this.queue.length; }

  dispose() { for (const w of this.workers) w.terminate(); this.workers = []; }
}
