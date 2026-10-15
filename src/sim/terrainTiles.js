// The terrain pyramid near the player: the world refinement's finer levels (each 4x finer:
// gen/localsim.js 'pyr' tiles), each simulated on the level above, made on the world-sim
// workers' GPU as the camera comes down to where they show and kept while it's near. So the
// smallest feature in view is set by how close it's seen, not by a grid. The tiles live in
// SharedArrayBuffers: the terrain workers and the physics read the same ones. Every tile made is
// kept, here and in the world cache (sim/worldSims.js): none is ever made twice.
//
// A level is wanted once the camera is close enough to make out its cells (within ~1000 of
// them); then the tiles within a few times the camera's height of the point under it, each on
// its parent (the tile of the level above it lies in, or the refinement).

import { TileSet } from '../gen/worldsim/refine.js';
import { MT, KEEP } from '../gen/tileshape.js';
import { faceUVFromDir, FACES } from '../gen/cubesphere.js';
import { landingSpot } from './landingFocus.js';

const LEVELS = 3;          // finer levels over the refinement
// round a landing spot (sim/landingFocus.js), m: the landing area at every level, made first; the
// spread round it per level (k = 1..LEVELS, coarse to fine); the strip back along the way in at most
const AREA = 2700;                 // (the near field's reach round the spot and a little: render/planetTerrain.js)
const SPREAD = [0, 15000, 6000, 3500];
const STRIP_MAX = [0, 60000, 40000, 20000];
// and with all that in, on past it, a tile at a time into the cache only (not held here): round the
// spot out to EXPAND_R, the way in widened EXPAND_SIDE to each side and carried EXPAND_ON past the
// spot, per level (k = 1..LEVELS), so a pilot who strays finds their ground made
const EXPAND_R = [0, 60000, 20000, 6000];
const EXPAND_SIDE = [0, 20000, 6000, 2500];
const EXPAND_ON = [0, 40000, 15000, 5000];
const EXPAND_FPS = 48;
const canShare = typeof SharedArrayBuffer !== 'undefined' && (typeof crossOriginIsolated === 'undefined' || crossOriginIsolated);
const share = (a) => { if (!canShare) return a; const s = new a.constructor(new SharedArrayBuffer(a.byteLength)); s.set(a); return s; };

export class TerrainTiles {
  constructor(game) {
    this.game = game;
    this.pending = new Set();   // keys being made
    // (at once: two, so one's CPU work overlaps the other's on the GPU; more only shared the
    // GPU and made every tile late, the one under the camera with the rest)
    this.maxPending = 2;
    this.missing = 0;           // tiles wanted and not here yet
    this.missingCore = 0;       // of them, those under the camera (the descent waits for these)
    this.missingSite = 0;       // of them, those of the landing area (the nav computer sets down once they're in)
    this.focus = null;          // where the craft's coming down (sim/landingFocus.js)
    this.t = 1;
    this.inval = [];            // patches of ground changed, made again once the tiles stop coming
    this.lastArrive = 0;
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
    this.flush();
    this.missing = 0; this.missingCore = 0; this.missingSite = 0;
    const b = g.universe.dominantBody(g.camPos);
    if (!b || !b.solid || !b.data.terrain) return;
    const st = ws.refine.get(b.data.id);
    if (!st || st.status !== 'ready') return;
    const R = st.R, P = this._p || (this._p = g.camPos.clone());
    b.worldToFixed(g.camPos, P);
    const r = P.length(), alt = Math.max(0, r - b.R - Math.max(0, b.groundHeight(P)));
    const d = this._d; d[0] = P.x / r; d[1] = P.y / r; d[2] = P.z / r;
    const uv = this._uv; faceUVFromDir(d, uv);
    const Mu = (Math.PI / 4) * b.R, pyr = this.levels(b), want = new Map();
    // (a tile wanted, with the order it's made in: lowest first; its parent, which it's made on,
    // just before it)
    const add = (L, face, ti, tj, score, core = false, site = false) => {
      const k = `${L}|${face}|${ti}|${tj}`, o = want.get(k);
      if (!o) want.set(k, { L, face, ti, tj, score, core, site });
      else { if (score < o.score) o.score = score; if (core) o.core = true; if (site) o.site = true; }
      if (L - 2 > R.L) add(L - 2, face, ti >> 2, tj >> 2, score - 1, false, site);
    };
    // the tiles of level L within m metres of unit direction c, each at score(its distance): the ground
    // sampled round it (so a spot by a face's edge has the tiles over the edge too)
    const e1 = this._e1 || (this._e1 = [0, 0, 0]), e2 = this._e2 || (this._e2 = [0, 0, 0]), q = this._q || (this._q = [0, 0, 0]), quv = this._quv || (this._quv = { face: 0, u: 0, v: 0 });
    const round = (L, c, m, score, site = false, sink = add) => {
      const ref = Math.abs(c[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
      e1[0] = ref[1] * c[2] - ref[2] * c[1]; e1[1] = ref[2] * c[0] - ref[0] * c[2]; e1[2] = ref[0] * c[1] - ref[1] * c[0];
      const l1 = Math.hypot(e1[0], e1[1], e1[2]); e1[0] /= l1; e1[1] /= l1; e1[2] /= l1;
      e2[0] = c[1] * e1[2] - c[2] * e1[1]; e2[1] = c[2] * e1[0] - c[0] * e1[2]; e2[2] = c[0] * e1[1] - c[1] * e1[0];
      const n = 1 << L, s = 2 / n, step = Math.max(150, s * Mu * 0.4), k = Math.ceil(m / step);
      for (let j = -k; j <= k; j++) for (let i = -k; i <= k; i++) {
        const dm = Math.hypot(i, j) * step;
        if (dm > m + step * 0.71) continue;
        const x = i * step / b.R, y = j * step / b.R;
        q[0] = c[0] + e1[0] * x + e2[0] * y; q[1] = c[1] + e1[1] * x + e2[1] * y; q[2] = c[2] + e1[2] * x + e2[2] * y;
        const ql = Math.hypot(q[0], q[1], q[2]); q[0] /= ql; q[1] /= ql; q[2] /= ql;
        faceUVFromDir(q, quv);
        sink(L, quv.face, Math.min(n - 1, Math.floor((quv.u + 1) / s)), Math.min(n - 1, Math.floor((quv.v + 1) / s)), score(Math.max(0, dm - step * 0.71)), false, site);
      }
    };
    for (let k = 1; k <= LEVELS; k++) {
      const L = R.L + 2 * k, n = 1 << L, s = 2 / n, cell = 2 * Mu / (n * MT), size = cell * MT;
      if (alt > 1000 * cell) break;
      // (the tiles within reach of the point under the camera, nearest first)
      const reach = Math.min(1.2 * size, Math.max(0.35 * size, 3 * alt)) / Mu;
      const i0 = Math.floor((uv.u + 1) / s), j0 = Math.floor((uv.v + 1) / s);
      for (let tj = j0 - 1; tj <= j0 + 1; tj++) for (let ti = i0 - 1; ti <= i0 + 1; ti++) {
        if (ti < 0 || tj < 0 || ti >= n || tj >= n) continue;
        const u0 = -1 + ti * s, v0 = -1 + tj * s;
        const du = Math.max(u0 - uv.u, 0, uv.u - u0 - s), dv = Math.max(v0 - uv.v, 0, uv.v - v0 - s), dd = Math.hypot(du, dv);
        if (dd <= reach) add(L, uv.face, ti, tj, dd * Mu, dd === 0);
      }
    }
    // where the craft's coming down (sim/landingFocus.js): its ground made before the camera's near
    // enough to ask, so it isn't made again under the craft once it's down. First the landing area at
    // every level, spiralling out from the spot; then a strip back along the way in, each level as
    // far back as the camera will want it there (low enough on the present slope to make out its
    // cells); then outward from the spot, with the rest by distance
    const f = this.focus = landingSpot(g, this._focus || (this._focus = {}));
    if (f && f.body === b) {
      const fd = this._fd || (this._fd = [0, 0, 0]), fc = this._fc || (this._fc = [0, 0, 0]);
      fc[0] = f.dir.x; fc[1] = f.dir.y; fc[2] = f.dir.z;
      const slope = Math.max(0.02, Math.max(f.agl, 1) / Math.max(f.range, 1)), puv = this._puv || (this._puv = { face: 0, u: 0, v: 0 });
      for (let k = 1; k <= LEVELS; k++) {
        const L = R.L + 2 * k, n = 1 << L, s = 2 / n, cell = 2 * Mu / (n * MT), size = cell * MT;
        round(L, fc, AREA, (m) => -3e9 + m, true);
        round(L, fc, SPREAD[k], (m) => m);
        if (!(f.back.lengthSq() > 0.5)) continue;
        const sMax = Math.min(f.range, STRIP_MAX[k], 1000 * cell / slope);
        for (let sm = 0; sm <= sMax; sm += size * 0.5) {
          const a = sm / b.R, ca = Math.cos(a), sa = Math.sin(a);
          fd[0] = f.dir.x * ca + f.back.x * sa; fd[1] = f.dir.y * ca + f.back.y * sa; fd[2] = f.dir.z * ca + f.back.z * sa;
          faceUVFromDir(fd, puv);
          const ti = Math.min(n - 1, Math.floor((puv.u + 1) / s)), tj = Math.min(n - 1, Math.floor((puv.v + 1) / s));
          add(L, puv.face, ti, tj, -2e9 + sm);
        }
      }
    }
    // (all that's wanted in: on past it, into the cache)
    if (f && f.body === b && this.missing === 0 && this.pending.size === 0 && !this.missingAfter(want, pyr)) this.expand(b, R, Mu, f, pyr, want, round);
    const list = [...want.values()].sort((a, c) => a.score - c.score || a.L - c.L);
    const held = new Map();
    for (const t of list) {
      const set = pyr.get(t.L), T = (t.face * (1 << t.L) + t.tj) * (1 << t.L) + t.ti;
      if (set && set.tiles.has(T)) { held.set(t.L, (held.get(t.L) || 0) + 1); continue; }
      this.missing++;
      if (t.core) this.missingCore++;
      if (t.site) this.missingSite++;
      const key = this.key(b.data.id, t.L, t.face, t.ti, t.tj);
      if (this.pending.has(key) || this.pending.size >= this.maxPending) continue;
      // its parent: the refinement, or the tile of the level above it lies in (made first)
      let parents = [];
      if (t.L > R.L + 2) {
        const pl = pyr.get(t.L - 2), pti = t.ti >> 2, ptj = t.tj >> 2, pT = (t.face * (1 << (t.L - 2)) + ptj) * (1 << (t.L - 2)) + pti;
        const p = pl && pl.tiles.get(pT);
        if (!p) continue;
        parents = [{ face: t.face, ti: pti, tj: ptj, h: p.h, rw: p.rw, fl: p.fl, rcv: p.rcv }];
      }
      this.pending.add(key);
      const id = b.data.id, face = t.face;
      ws.requestPyr(id, t.L, face, t.ti, t.tj, parents).then((tile) => {
        this.pending.delete(key);
        this.arrive(b, t.L, face, t.ti, t.tj, { h: share(tile.h), rw: share(tile.rw), fl: share(tile.fl), rcv: share(tile.rcv) });
      }, (err) => { this.pending.delete(key); console.warn('terrain tile failed', key, err && err.message); });
    }
  }

  // whether any wanted tile isn't here yet (counted before the requests below: so the first pass
  // after a want appears doesn't count it in)
  missingAfter(want, pyr) {
    for (const t of want.values()) { const set = pyr.get(t.L); if (!set || !set.tiles.has((t.face * (1 << t.L) + t.tj) * (1 << t.L) + t.ti)) return true; }
    return false;
  }

  // One more tile past what's wanted round a landing spot, made and kept in the cache only: the
  // nearest not yet made, coarse before fine (a tile is made on its parent: held here, or read back
  // from the cache), one at a time
  expand(b, R, Mu, f, pyr, want, round) {
    // (one at a time, and only while frames come easily: a tile's made on the GPU the view's drawn on)
    if (this.expanding || !((this.game.fps || 60) > EXPAND_FPS)) return;
    const id = b.data.id, made = this.made || (this.made = new Set()), failed = this.failed || (this.failed = new Set());
    let best = null;
    const push = (L, face, ti, tj, score) => {
      const k = `${L}|${face}|${ti}|${tj}`, K = this.key(id, L, face, ti, tj);
      if (want.has(k) || made.has(K) || failed.has(K)) return;
      const set = pyr.get(L);
      if (set && set.tiles.has((face * (1 << L) + tj) * (1 << L) + ti)) { made.add(K); return; }
      if (!best || score + L * 1e5 < best.score + best.L * 1e5) best = { L, face, ti, tj, score, K };
    };
    const c = [f.dir.x, f.dir.y, f.dir.z], q = [0, 0, 0], quv = { face: 0, u: 0, v: 0 };
    const fwd = [-f.back.x, -f.back.y, -f.back.z], side = [f.back.y * c[2] - f.back.z * c[1], f.back.z * c[0] - f.back.x * c[2], f.back.x * c[1] - f.back.y * c[0]];
    const haveBack = f.back.lengthSq() > 0.5;
    for (let k = 1; k <= LEVELS; k++) {
      const L = R.L + 2 * k, n = 1 << L, s = 2 / n, size = s * Mu, step = Math.max(200, size * 0.45);
      round(L, c, EXPAND_R[k], (m) => m, false, push);
      if (!haveBack) continue;
      // the way in (back toward the craft) and on past the spot, widened to the sides
      for (let a = -EXPAND_ON[k]; a <= Math.min(f.range, STRIP_MAX[k]); a += step) for (let w = -EXPAND_SIDE[k]; w <= EXPAND_SIDE[k]; w += step) {
        const x = a / b.R, y = w / b.R;
        for (let i = 0; i < 3; i++) q[i] = c[i] * Math.cos(Math.hypot(x, y)) + (x * -fwd[i] + y * side[i]) * (Math.hypot(x, y) > 1e-12 ? Math.sin(Math.hypot(x, y)) / Math.hypot(x, y) : 1);
        const ql = Math.hypot(q[0], q[1], q[2]); q[0] /= ql; q[1] /= ql; q[2] /= ql;
        faceUVFromDir(q, quv);
        push(L, quv.face, Math.min(n - 1, Math.floor((quv.u + 1) / s)), Math.min(n - 1, Math.floor((quv.v + 1) / s)), Math.abs(w) + Math.abs(a) * 0.3);
      }
    }
    if (!best) return;
    const ws = this.game.worldSims, t = best;
    this.expanding = true;
    (async () => {
      try {
        let parents = [];
        if (t.L > R.L + 2) {
          const pti = t.ti >> 2, ptj = t.tj >> 2, pT = (t.face * (1 << (t.L - 2)) + ptj) * (1 << (t.L - 2)) + pti, pl = pyr.get(t.L - 2);
          const p = (pl && pl.tiles.get(pT)) || (made.has(this.key(id, t.L - 2, t.face, pti, ptj)) ? await ws.cachedPyr(id, t.L - 2, t.face, pti, ptj) : null);
          if (!p) { failed.add(t.K); return; }   // (its parent first: it's nearer the front of the list)
          parents = [{ face: t.face, ti: pti, tj: ptj, h: p.h, rw: p.rw, fl: p.fl, rcv: p.rcv }];
        }
        await ws.requestPyr(id, t.L, t.face, t.ti, t.tj, parents);
        made.add(t.K); this.expanded = (this.expanded || 0) + 1;
      } catch (err) { failed.add(t.K); }
      finally { this.expanding = false; }
    })();
  }

  // a tile in: shared with the generators (here and the workers'), the ground under it rebuilt
  arrive(b, L, face, ti, tj, tile) {
    const g = this.game, pyr = this.levels(b);
    let set = pyr.get(L);
    if (!set) { set = new TileSet(L); pyr.set(L, set); }
    set.put(face, ti, tj, tile);
    g.pool.setPyrTile(b.data.id, L, face, ti, tj, tile);
    // (and as far round as its craters' floors reach: the finer craters' floors read the ground at their
    // centres, so one within the tile now lies at its new level, its bowl out past the tile's edge)
    const crR = b.terrain && b.terrain.craterTop ? b.terrain.craterTop() / 2 : 0;
    const s = 2 / (1 << L), m = KEEP * s / MT + crR / ((Math.PI / 4) * b.R);
    // (the chunks over it: made again once the tiles stop coming, those fine enough to show it)
    const cell = (Math.PI / 2) * b.R / ((1 << L) * MT);
    this.inval.push({ id: b.data.id, face, u0: -1 + ti * s - m, v0: -1 + tj * s - m, u1: -1 + (ti + 1) * s + m, v1: -1 + (tj + 1) * s + m, spacing: 8 * cell, near: cell <= 60,
      tile: [-1 + ti * s, -1 + tj * s, -1 + (ti + 1) * s, -1 + (tj + 1) * s] });
    this.lastArrive = performance.now();
  }

  // the ground under the tiles that came: its chunks made again (a moment after the last, so a
  // run of tiles makes them once); a fine level's near field too
  flush(force = false) {
    if (!this.inval.length || (!force && performance.now() - this.lastArrive < 750 && this.pending.size)) return;
    const g = this.game;
    for (const p of this.inval) {
      const terr = g.world.terrainOf(p.id);
      if (terr && terr.invalidate) terr.invalidate(p.face, p.u0, p.v0, p.u1, p.v1, p.spacing);
      const b = g.universe.bodies[p.id];
      // (the near field made again only if the tile's under it: one landing elsewhere along the
      // way in leaves what's been made round the landing spot alone)
      if (p.near && b && b.near && b.near.field && this.under(b, b.near.anchor, p)) b.near.field = null;
      // (and the heights the walker, the animals and the grass read: the finer ground now, not the
      // coarser one they'd kept)
      if (b && b._hcache) b._hcache.clear();
      // (and anything resting on it set on it again: sim/ship.js reseat)
      if (b) b.groundEpoch = (b.groundEpoch || 0) + 1;
    }
    this.inval.length = 0;
  }

  // whether a patch of a face (u0..u1, v0..v1) lies within the near field round anchor a of body b
  // (its rings reach 2.5 km; a landing spot's own tiles, out to AREA, are all in before it's anchored)
  under(b, a, p) {
    if (!a) return true;
    const o = a.o, r = Math.hypot(o[0], o[1], o[2]), d = this._ud || (this._ud = [0, 0, 0]), uv = this._uuv || (this._uuv = { face: 0, u: 0, v: 0 });
    d[0] = o[0] / r; d[1] = o[1] / r; d[2] = o[2] / r; faceUVFromDir(d, uv);
    // (measured as the landing area is, to the tile itself: whatever's within reach of the field was
    // part of the area round the spot, all in before the field was anchored there)
    const Mu = (Math.PI / 4) * b.R, [tu0, tv0, tu1, tv1] = p.tile;
    let u = uv.u, v = uv.v;
    if (uv.face !== p.face) {
      // (across a face's edge: the anchor carried onto the tile's face, past its edge, by the
      // same projection; well round the world from that face, nowhere near it)
      const F = FACES[p.face], dn = d[0] * F.N[0] + d[1] * F.N[1] + d[2] * F.N[2];
      if (dn < 0.5) return false;
      u = Math.atan((d[0] * F.U[0] + d[1] * F.U[1] + d[2] * F.U[2]) / dn) / (Math.PI / 4);
      v = Math.atan((d[0] * F.V[0] + d[1] * F.V[1] + d[2] * F.V[2]) / dn) / (Math.PI / 4);
    }
    return Math.hypot(Math.max(tu0 - u, 0, u - tu1), Math.max(tv0 - v, 0, v - tv1)) * Mu < AREA - 150;
  }
}
