// The terrain pyramid near the player: the world refinement's finer levels (each 4x finer:
// gen/localsim.js 'pyr' tiles), each simulated on the level above, made on the world-sim
// workers' GPU as the camera comes down to where they show and kept while it's near. So the
// smallest feature in view is set by how close it's seen, not by a grid. The tiles live in
// SharedArrayBuffers: the terrain workers and the physics read the same ones.
//
// A level is wanted once the camera is close enough to make out its cells (within ~1000 of
// them); then the tiles within a few times the camera's height of the point under it, each on
// its parent (the tile of the level above it lies in, or the refinement).

import { TileSet } from '../gen/worldsim/refine.js';
import { MT, KEEP } from '../gen/tileshape.js';
import { faceUVFromDir } from '../gen/cubesphere.js';

const LEVELS = 3;          // finer levels over the refinement
const MAX_TILES = 24;      // kept per level (the furthest dropped)
const canShare = typeof SharedArrayBuffer !== 'undefined' && (typeof crossOriginIsolated === 'undefined' || crossOriginIsolated);
const share = (a) => { if (!canShare) return a; const s = new a.constructor(new SharedArrayBuffer(a.byteLength)); s.set(a); return s; };

export class TerrainTiles {
  constructor(game) {
    this.game = game;
    this.pending = new Set();   // keys being made
    this.missing = 0;           // tiles wanted and not here yet (the descent waits for them)
    this.t = 1;
    this._p = null; this._uv = { face: 0, u: 0, v: 0 }; this._d = [0, 0, 0];
  }

  key(id, L, face, ti, tj) { return `${id}|${L}|${face}|${ti}|${tj}`; }

  // the body's levels (on its terrain params, so a generator made later reads them too)
  levels(b) {
    const p = b.data.terrain;
    if (!p.pyr) p.pyr = new Map();
    const gen = b.terrain;
    if (gen && gen.snap && gen.snap.pyr !== p.pyr) gen.snap.attachPyr(p.pyr);
    return p.pyr;
  }

  update(dt, force = false) {
    const g = this.game, ws = g.worldSims;
    this.t += dt;
    if (!ws || (!force && this.t < 0.25)) return;
    this.t = 0;
    this.missing = 0;
    const b = g.universe.dominantBody(g.camPos);
    if (!b || !b.solid || !b.data.terrain) return;
    const st = ws.refine.get(b.data.id);
    if (!st || st.status !== 'ready') return;
    const R = st.R, P = this._p || (this._p = g.camPos.clone());
    b.worldToFixed(g.camPos, P);
    const r = P.length(), alt = Math.max(0, r - b.R - Math.max(0, b.groundHeight(P)));
    const d = this._d; d[0] = P.x / r; d[1] = P.y / r; d[2] = P.z / r;
    const uv = this._uv; faceUVFromDir(d, uv);
    const Mu = (Math.PI / 4) * b.R, pyr = this.levels(b), want = [];
    for (let k = 1; k <= LEVELS; k++) {
      const L = R.L + 2 * k, n = 1 << L, s = 2 / n, cell = 2 * Mu / (n * MT), size = cell * MT;
      if (alt > 1000 * cell) break;
      // (the tiles within reach of the point under the camera, nearest first)
      const reach = Math.min(1.2 * size, Math.max(0.35 * size, 3 * alt)) / Mu;
      const i0 = Math.floor((uv.u + 1) / s), j0 = Math.floor((uv.v + 1) / s);
      const list = [];
      for (let tj = j0 - 1; tj <= j0 + 1; tj++) for (let ti = i0 - 1; ti <= i0 + 1; ti++) {
        if (ti < 0 || tj < 0 || ti >= n || tj >= n) continue;
        const u0 = -1 + ti * s, v0 = -1 + tj * s;
        const du = Math.max(u0 - uv.u, 0, uv.u - u0 - s), dv = Math.max(v0 - uv.v, 0, uv.v - v0 - s);
        if (Math.hypot(du, dv) <= reach) list.push({ L, ti, tj, dist: Math.hypot(du, dv) });
      }
      list.sort((a, c) => a.dist - c.dist);
      for (const t of list) want.push(t);
    }
    for (const t of want) {
      const set = pyr.get(t.L), T = (uv.face * (1 << t.L) + t.tj) * (1 << t.L) + t.ti;
      if (set && set.tiles.has(T)) continue;
      this.missing++;
      const key = this.key(b.data.id, t.L, uv.face, t.ti, t.tj);
      if (this.pending.has(key) || this.pending.size >= 2) continue;
      // its parent: the refinement, or the tile of the level above it lies in (made first)
      let parents = [];
      if (t.L > R.L + 2) {
        const pl = pyr.get(t.L - 2), pti = t.ti >> 2, ptj = t.tj >> 2, pT = (uv.face * (1 << (t.L - 2)) + ptj) * (1 << (t.L - 2)) + pti;
        const p = pl && pl.tiles.get(pT);
        if (!p) continue;
        parents = [{ face: uv.face, ti: pti, tj: ptj, h: p.h, rw: p.rw }];
      }
      this.pending.add(key);
      const id = b.data.id, face = uv.face;
      ws.requestPyr(id, t.L, face, t.ti, t.tj, parents).then((tile) => {
        this.pending.delete(key);
        this.arrive(b, t.L, face, t.ti, t.tj, { h: share(tile.h), rw: share(tile.rw) });
      }, (err) => { this.pending.delete(key); console.warn('terrain tile failed', key, err && err.message); });
    }
    this.prune(b, uv);
  }

  // a tile in: shared with the generators (here and the workers'), the ground under it rebuilt
  arrive(b, L, face, ti, tj, tile) {
    const g = this.game, pyr = this.levels(b);
    let set = pyr.get(L);
    if (!set) { set = new TileSet(L); pyr.set(L, set); }
    set.put(face, ti, tj, tile);
    g.pool.setPyrTile(b.data.id, L, face, ti, tj, tile);
    const s = 2 / (1 << L), m = KEEP * s / MT;
    const terr = g.world.terrainOf(b.data.id);
    if (terr && terr.invalidate) terr.invalidate(face, -1 + ti * s - m, -1 + tj * s - m, -1 + (ti + 1) * s + m, -1 + (tj + 1) * s + m);
    // (the near field's volume reads the ground as the generator draws it: made again)
    if (b.near && b.near.field) b.near.field = null;
  }

  // too many tiles at a level: the furthest from the point under the camera go
  prune(b, uv) {
    const pyr = b.data.terrain.pyr;
    if (!pyr) return;
    for (const [L, set] of pyr) {
      if (set.tiles.size <= MAX_TILES) continue;
      const n = 1 << L, s = 2 / n;
      const far = [...set.tiles.keys()].map((T) => {
        const f = Math.floor(T / (n * n)), r = T - f * n * n, tj = Math.floor(r / n), ti = r - tj * n;
        return { T, d: f !== uv.face ? 1e9 : Math.hypot(-1 + (ti + 0.5) * s - uv.u, -1 + (tj + 0.5) * s - uv.v) };
      }).sort((a, c) => c.d - a.d);
      for (const { T } of far.slice(0, set.tiles.size - MAX_TILES)) {
        set.tiles.delete(T);
        this.game.pool.dropPyrTile(b.data.id, L, T);
      }
    }
  }
}
