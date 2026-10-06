// A world's recent fires where you are (gen/life/fire.js): its fire tiles near the camera, asked of the
// terrain workers as they're needed and kept (world state: the same for everyone, from the world's seed
// and its sim). at(dir) gives the fire record under a body-fixed direction, or null while its tile is
// still being worked out (asked for then; onTile is called as each arrives).
import { faceUVFromDir } from '../gen/cubesphere.js';
import { fireCellOf, FIRE_OLD } from '../gen/life/fire.js';

const KEEP = 24;

export class FireField {
  constructor(body, pool) {
    this.body = body; this.pool = pool;
    const d = body.data;
    // (how well its air burns: life.js's fireOK, from the oxygen's share of the air; the terrain params'
    // own, as the workers' chunks read it: the same fires both ways)
    const o2 = (d.terrain && d.terrain.fireO2) || 0, t = Math.max(0, Math.min(1, (o2 - 0.15) / 0.05));
    this.o2K = t * t * (3 - 2 * t);
    this.seed = (d.terrain && d.terrain.seed ? d.terrain.seed[0] : 0x51f15e) >>> 0;
    this.tiles = new Map(); this.jobs = new Map(); this.onTile = null;
    this._uv = { face: 0, u: 0, v: 0 };
    this.out = { ageG: FIRE_OLD, ageC: FIRE_OLD, fires: 0 };
  }
  get active() { return this.o2K > 0.01 && !!(this.body.terrain && this.body.terrain.snap); }
  // the fire record at a body-fixed unit direction d ([x, y, z]): { ageG, ageC, fires } (shared: copy it
  // to keep), or null while its tile is on its way
  at(d) {
    if (!this.active) return null;
    const uv = faceUVFromDir(d, this._uv), c = fireCellOf(this.body.R, uv.face, uv.u, uv.v, this.seed);
    const key = `${c.face}:${c.ti}:${c.tj}`, T = this.tiles.get(key);
    if (!T) { this.ask(key, c); return null; }
    T.used = performance.now();
    const o = c.x * T.n + c.y;
    this.out.ageG = T.ageG[o]; this.out.ageC = T.ageC[o]; this.out.fires = T.fires[o];
    return this.out;
  }
  ask(key, c) {
    if (this.jobs.has(key) || !this.pool) return;
    const job = this.pool.submit({ type: 'fire', body: this.body.id, face: c.face, ti: c.ti, tj: c.tj, o2K: this.o2K, seed: this.seed }, 3.5);   // (an 8 km tile's, rarely asked: after the ground under the camera and the near field's first ring, ahead of the rest)
    this.jobs.set(key, job);
    job.promise.then((r) => {
      this.jobs.delete(key);
      this.tiles.set(key, { n: r.n, ageG: r.ageG, ageC: r.ageC, fires: r.fires, stats: r.stats, used: performance.now() });
      // (the least lately used dropped past a few dozen)
      if (this.tiles.size > KEEP) { let old = null; for (const [k, t] of this.tiles) if (!old || t.used < old[1].used) old = [k, t]; this.tiles.delete(old[0]); }
      if (this.onTile) this.onTile(key);
    }, () => this.jobs.delete(key));
  }
}
