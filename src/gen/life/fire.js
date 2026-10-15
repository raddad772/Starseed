// Fire through the recent centuries (LIFE.md; Dave: "a relatively fine near-time sim for some things,
// like forest fires"): the land's stands as the last few hundred years of fires left them, at a scale you
// walk through. A world's country is cut into fire tiles (~8 km, in its cube face's coordinates), each
// simulated over FIRE_YEARS years on 32 m cells with a margin round it, so fires from beyond come in:
//   the regime      from the world sim's climate (the snapshot): the months dry enough to burn (Gaussen:
//                   a month's rain under twice its temperature) or the warm season's want of water,
//                   its drying spells (a boreal summer's), the warm season's storms that light
//                   them (lightning ignitions a km2 a year), its plants' cover (grass and forest), its air
//                   (no fire under ~15% oxygen: life.js's fireOK)
//   each year       a drought of its own, shared across the region (a dry year's fires run far); the
//                   lightning's strikes, lit by the place and the year's own hash on a world-fixed 1 km
//                   lattice (so tiles side by side light the same fires in the land they share); each
//                   fire spreading cell to cell (8 neighbours), a step's chance from the fuel there (grass
//                   back within a year or two, a forest's litter over decades), the year's dryness, the
//                   wind (the latitude's prevailing: the trades, the westerlies) and the slope (uphill
//                   faster); a recent burn holds little to carry the next, so the burns make a mosaic
//   severity        in a forest a dry year's fire crowns and kills the stand; a mild one runs along the
//                   ground and the trees live
// Out: each cell's years since a fire touched its ground and since one replaced its stand (65535: not in
// the window), and how many burned it. World state: the world's seed, its snapshot and the place alone.
import * as dm from '../../core/dmath.js';
import { fmix32 } from '../../core/rng.js';
import { dirFromFaceUV, faceUVFromDir } from '../cubesphere.js';
import { S_LEN, S_H, S_TEMP, S_SAND, S_ICE, S_WDEPTH, S_RIVR } from '../terrain.js';

export const FIRE_TILE = 8192, FIRE_CELL = 32, FIRE_YEARS = 300, FIRE_OLD = 65535;
const MARGIN = 1536, IGN = 1024, SEAM = 22;   // m: the margin simulated round a tile; the ignitions' lattice;
// (cells: how far a seam between tiles wanders, so the two tiles' histories meet along a wavy line, as
// a fire's edge does, not a ruled one)
const H = (a, b, c, d) => fmix32((fmix32((fmix32((a ^ 0x9e3779b9) >>> 0) ^ b) >>> 0) ^ Math.imul(c | 0, 0x85ebca6b) ^ Math.imul(d | 0, 0xc2b2ae35)) >>> 0);
const U = (h) => h / 4294967296;

// how many fire tiles across a face (the face's arc over a tile's side)
export const fireTilesAcross = (R) => Math.max(1, Math.round(Math.PI * 0.5 * R / FIRE_TILE));

// the fire regime at a direction d from a world's snapshot sampler: { dry (0..1: how much of the year
// burns), lam (lightning ignitions a km2 a year), open, forest (their shares of the ground, with cover),
// Tw (the warm season's mean, C) }; null where nothing grows
export function fireRegimeAt(snap, d) {
  const s = snap.s, Gc = snap.Gc;
  if (!Gc || !s.cover || !s.season) return null;
  const c = Gc.cellOf(d), m = Gc.n;
  const cover = Gc.sample(s.cover, d), open = s.open ? Gc.sample(s.open, d) : 0.5, forest = s.forest ? Gc.sample(s.forest, d) : 0;
  if (!(cover > 0.02)) return null;
  const T = s.Tsea[c] - 273.15, a1 = s.season[c], b1 = s.season[m + c], Pc = Math.max(0, s.season[2 * m + c]);
  const Pann = Math.max(0, Gc.sample(s.P, d)), Pw = Math.max(0, (Pann - 6 * Pc) / 6);
  // (its months: the warm six with the warm half's rain, the cold six with the cold half's)
  const ord = [];
  for (let k = 0; k < 12; k++) { const L = dm.TWO_PI * (k + 0.5) / 12; ord.push(T + a1 * dm.cos(L) + b1 * dm.sin(L)); }
  const sorted = ord.slice().sort((x, y) => x - y), cut = sorted[5];
  let dryM = 0, Tw = 0, nw = 0;
  for (let k = 0; k < 12; k++) {
    const warm = ord[k] > cut || (ord[k] === cut && nw < 6), P = warm ? Pw : Pc;
    if (warm) { Tw += ord[k]; nw++; }
    if (ord[k] > 0 && P < 2 * ord[k]) dryM++;
  }
  Tw /= Math.max(nw, 1);
  // (and the warm season's want of water, its spells of drying: what it could evaporate (~6 mm a month
  // a degree: Thornthwaite's order) over the rain it gets, a boreal summer's; a desert's plants too
  // sparse to carry a fire; a rainforest's never dry enough, near enough)
  const pet = 6 * Math.max(0, Tw), deficit = pet > 0 ? dm.clamp((pet - Pw) / pet, 0, 1) : 0;
  const dry = Math.max(dm.clamp(dryM / 6, 0, 1), 0.6 * deficit) * dm.smoothstep(150, 400, Pann);
  const lam = 0.003 + 0.03 * dm.smoothstep(12, 26, Tw) * Math.min(1, Pw / 80);
  return { dry, lam, open: cover * Math.min(1, open), forest: cover * Math.min(1, forest), Tw };
}

// the prevailing wind's way at a direction (body-fixed): toward the west in the trades and the polar
// easterlies, the east in the westerlies (liquid.js windSense)
function windToward(d) {
  const lat = Math.abs(dm.asin(dm.clamp(d[1], -1, 1)));
  return lat < 0.52 || lat > 1.05 ? -1 : 1;
}

// one fire tile: gen (a TerrainGenerator with its snapshot), face, ti, tj (of fireTilesAcross); opts:
// { o2K: 0..1 how well its air burns, seed }. Returns { n (cells a side of the tile itself), ageG,
// ageC (Uint16, years since a fire touched the ground, replaced the stand), fires (Uint8), stats }
export function fireTile(gen, face, ti, tj, opts = {}) {
  const R = gen.R, NT = fireTilesAcross(R), du = 2 / NT, snap = gen.snap;
  const core = Math.round(FIRE_TILE / FIRE_CELL), mc = Math.round(MARGIN / FIRE_CELL), n = core + 2 * mc;
  const cu = du / core, u0 = -1 + ti * du - mc * cu, v0 = -1 + tj * du - mc * cu;
  // (the cells' world-fixed index: a cell's own hash is the same in every tile that holds it)
  const gi0 = Math.round((u0 + 1) / cu), gj0 = Math.round((v0 + 1) / cu);
  const seed = (opts.seed ?? 0x51f15e) >>> 0, o2K = opts.o2K ?? 1;
  const N = n * n, d = [0, 0, 0], s = new Float64Array(S_LEN);
  // the ground: heights and what can't burn (water, ice, sand, the sea, bare steep rock), read every 4
  // cells and spread between; the regime every 32
  const q = 4, nq = Math.ceil(n / q) + 1, hq = new Float64Array(nq * nq), wet = new Uint8Array(nq * nq);
  for (let a = 0; a < nq; a++) for (let b = 0; b < nq; b++) {
    dirFromFaceUV(face, u0 + a * q * cu, v0 + b * q * cu, d);
    gen.sample(d[0], d[1], d[2], 64, s);
    hq[a * nq + b] = s[S_H];
    wet[a * nq + b] = s[S_WDEPTH] > 0.05 || s[S_RIVR] > 0 || s[S_ICE] > 0 || s[S_SAND] > 0.3 || s[S_TEMP] < 263 ? 1 : 0;
  }
  const rq = 32, nr = Math.ceil(n / rq) + 1, reg = [];
  for (let a = 0; a < nr; a++) for (let b = 0; b < nr; b++) { dirFromFaceUV(face, u0 + a * rq * cu, v0 + b * rq * cu, d); reg.push(fireRegimeAt(snap, d)); }
  // (a smooth noise on the world-fixed cells: value noise at ~2 km and ~600 m, ~40 cells' reach)
  const vn = (gx, gy, sc, k) => { const X = gx / sc, Y = gy / sc, x0 = Math.floor(X), y0 = Math.floor(Y), fx = X - x0, fy = Y - y0, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy), v = (a, b) => U(H(seed ^ 0x77a1, face * 4 + k, x0 + a, y0 + b)) - 0.5; return (v(0, 0) * (1 - sx) + v(1, 0) * sx) * (1 - sy) + (v(0, 1) * (1 - sx) + v(1, 1) * sx) * sy; };
  const warp = (gx, gy, k) => 70 * vn(gx, gy, 64, k) + 25 * vn(gx, gy, 19, k + 2);
  const h = new Float32Array(N), burnable = new Uint8Array(N), dry = new Float32Array(N), lam = new Float32Array(N), fo = new Float32Array(N), ff = new Float32Array(N);
  const bil = (A, nn, x, y, k) => { const ia = Math.min(nn - 2, Math.floor(x / k)), ib = Math.min(nn - 2, Math.floor(y / k)), fa = x / k - ia, fb = y / k - ib; return (A[ia * nn + ib] * (1 - fa) + A[(ia + 1) * nn + ib] * fa) * (1 - fb) + (A[ia * nn + ib + 1] * (1 - fa) + A[(ia + 1) * nn + ib + 1] * fa) * fb; };
  for (let x = 0; x < n; x++) for (let y = 0; y < n; y++) {
    const c = x * n + y;
    h[c] = bil(hq, nq, x, y, q);
    const w = wet[Math.round(x / q) * nq + Math.round(y / q)];
    // (the sea by the heights between the points read: its shore not stepped)
    if (w || (gen.p.liquid && h[c] < 0.2)) continue;
    // (the regime spread smoothly between its points, read a little off where the cell is by a smooth
    // noise, so the life map's cells (a few km, their edges along the face's axes) leave no ruled lines)
    const wxp = Math.max(0, Math.min(n - 1, x + warp(gi0 + x, gj0 + y, 0))), wyp = Math.max(0, Math.min(n - 1, y + warp(gi0 + x, gj0 + y, 1)));
    const ia = Math.min(nr - 2, Math.floor(wxp / rq)), ib = Math.min(nr - 2, Math.floor(wyp / rq)), fa = wxp / rq - ia, fb = wyp / rq - ib;
    let sw = 0, sd = 0, sl = 0, so = 0, sf = 0;
    for (const [da, db, wt] of [[0, 0, (1 - fa) * (1 - fb)], [1, 0, fa * (1 - fb)], [0, 1, (1 - fa) * fb], [1, 1, fa * fb]]) {
      const r = reg[(ia + da) * nr + ib + db];
      if (r) { sd += wt * r.dry; sl += wt * r.lam; so += wt * r.open; sf += wt * r.forest; sw += wt; }
    }
    if (sw < 0.05) continue;
    burnable[c] = 1; dry[c] = sd / sw; lam[c] = sl / sw; fo[c] = so; ff[c] = sf;
  }
  // (too steep for fuel to lie: bare rock)
  for (let x = 1; x < n - 1; x++) for (let y = 1; y < n - 1; y++) { const c = x * n + y; if (Math.max(Math.abs(h[c + n] - h[c - n]), Math.abs(h[c + 1] - h[c - 1])) / (2 * FIRE_CELL) > 1.2) burnable[c] = 0; }
  // the wind's way on the tile's grid (east along +u near enough: the face's own axes turned to it)
  dirFromFaceUV(face, u0 + n * cu * 0.5, v0 + n * cu * 0.5, d);
  const toward = windToward(d), e1 = [0, 0, 0], e2 = [0, 0, 0];
  dirFromFaceUV(face, u0 + n * cu * 0.5 + cu, v0 + n * cu * 0.5, e1); dirFromFaceUV(face, u0 + n * cu * 0.5, v0 + n * cu * 0.5 + cu, e2);
  // (east, the way of the westerlies, at d: up x (0,1,0) normalised; its parts along the grid's axes)
  const ex = [d[2], 0, -d[0]], el = Math.hypot(ex[0], ex[2]) || 1;
  const gx = [(e1[0] - d[0]), (e1[1] - d[1]), (e1[2] - d[2])], gy = [(e2[0] - d[0]), (e2[1] - d[1]), (e2[2] - d[2])];
  const gxl = Math.hypot(...gx) || 1, gyl = Math.hypot(...gy) || 1;
  let wx = toward * (ex[0] * gx[0] + ex[2] * gx[2]) / (el * gxl), wy = toward * (ex[0] * gy[0] + ex[2] * gy[2]) / (el * gyl);
  const wl = Math.hypot(wx, wy) || 1; wx /= wl; wy /= wl;
  // the region's years: each a drought of its own (shared by the tiles near: the fire tile's region,
  // ~32 km)
  const regKey = H(seed, face, Math.floor(ti / 4), Math.floor(tj / 4)), drought = new Float32Array(FIRE_YEARS);
  for (let y = 0; y < FIRE_YEARS; y++) { const g1 = U(H(regKey, y, 1, 7)), g2 = U(H(regKey, y, 2, 9)); drought[y] = dm.exp(0.55 * dm.sqrt(-2 * dm.log(g1 + 1e-9)) * dm.cos(dm.TWO_PI * g2)); }
  // the stands at the window's start: as old as the window (their past unknown)
  const ageG = new Uint16Array(N).fill(FIRE_YEARS), ageC = new Uint16Array(N).fill(FIRE_YEARS), fires = new Uint8Array(N);
  const burnYear = new Int32Array(N).fill(-1), front = new Int32Array(N + 2 * N), tries = new Uint8Array(N);
  const NB = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  const fuel = (c) => fo[c] * (1 - dm.exp(-ageG[c] / 1.5)) + ff[c] * (0.35 + 0.65 * (1 - dm.exp(-ageG[c] / 12)));
  const ign = Math.round(IGN / FIRE_CELL), ia0 = Math.floor(gi0 / ign), ja0 = Math.floor(gj0 / ign), ia1 = Math.floor((gi0 + n - 1) / ign), ja1 = Math.floor((gj0 + n - 1) / ign);
  let burned = 0, nFires = 0;
  for (let y = 0; y < FIRE_YEARS; y++) {
    const dY = drought[y];
    // the year's lightning: strikes on the world's 1 km lattice, each lit where its hash puts it
    for (let ia = ia0; ia <= ia1; ia++) for (let ja = ja0; ja <= ja1; ja++) {
      const hk = H(seed ^ face, ia, ja, y);
      // (the cell's middle's regime sets how many)
      const cx = Math.min(n - 1, Math.max(0, ia * ign + (ign >> 1) - gi0)), cy = Math.min(n - 1, Math.max(0, ja * ign + (ign >> 1) - gj0));
      const L = lam[cx * n + cy] * (IGN / 1000) ** 2 * dY;
      if (!(L > 0)) continue;
      let k = 0;
      for (let p = dm.exp(-L), r = U(hk); r > p && k < 6; r *= U(H(hk, k, 3, 5))) k++;
      for (let f = 0; f < k; f++) {
        const hf = H(hk, f, 11, 13), x = ia * ign + Math.floor(U(hf) * ign) - gi0, yy = ja * ign + Math.floor(U(H(hf, 1, 2, 3)) * ign) - gj0;
        if (x < 0 || yy < 0 || x >= n || yy >= n) continue;
        const c0 = x * n + yy;
        if (!burnable[c0] || burnYear[c0] === y || fuel(c0) * o2K < 0.25) continue;
        // its spread, in rounds (a round ~a few hours' run): it burns as long as its weather holds, a few
        // rounds mostly, many in a drought (an exponential's span, longer the drier the year: the few big
        // fires that burn most of the ground)
        let qh = 0, qt = 0;
        front[qt++] = c0; burnYear[c0] = y; nFires++;
        // (how dry the year leaves a place: its own dry season, a drought's stretching it; a place with
        // none dries a little only in the worst)
        const yd = (c) => Math.min(1.2, dry[c] * dm.pow(dY, 0.8) + 0.06 * Math.max(0, dY - 1.6));
        const y0 = yd(c0), rounds = 1 + Math.floor(-dm.log(U(H(hf, 5, 7, 9)) + 1e-9) * (3 + 45 * y0 * y0));
        // (a stand-replacing crown fire in a severe year; a mild one runs along the ground)
        const crownK = dm.smoothstep(1.1, 2.0, dY * (0.5 + dry[c0]));
        for (let rd = 0, end = qt; rd < rounds && qh < qt; rd++, end = qt) {
          while (qh < end) {
            const c = front[qh++], cxx = (c / n) | 0, cyy = c - cxx * n;
            let deferred = false;
            for (let e = 0; e < 8; e++) {
              const ox = cxx + NB[e][0], oy = cyy + NB[e][1];
              if (ox < 0 || oy < 0 || ox >= n || oy >= n) continue;
              const o = ox * n + oy;
              if (!burnable[o] || burnYear[o] === y) continue;
              const dl = e < 4 ? 1 : 1.414, along = (NB[e][0] * wx + NB[e][1] * wy) / dl, rise = (h[o] - h[c]) / (dl * FIRE_CELL);
              // (a fire's head runs with the wind, its flanks at half the pace, its back a third: the
              // egg-shaped burn, longer downwind; up a slope it runs as with the wind)
              const lead = along + 1.5 * rise;
              if ((lead < -0.3 && rd % 3 !== 0) || (lead >= -0.3 && lead < 0.3 && rd % 2 !== 0)) { deferred = true; continue; }
              // (a step's chance: well over the ~0.25 at which a fire on 8 neighbours runs on without end
              // where it's dry and the fuel's there, so its ground burns whole save a few islands; little
              // where it's damp or bare; downwind and uphill more)
              const p = (0.12 + 0.75 * yd(o)) * fuel(o) * o2K * (1 + 0.6 * along) * dm.clamp(1 + 1.8 * rise, 0.5, 2.2) / (e < 4 ? 1 : 1.25);
              if (U(H(seed, gi0 + ox, gj0 + oy, y * 8 + e)) < p) { burnYear[o] = y; front[qt++] = o; }
            }
            // (its slower sides tried again in a later round: twice at most)
            if (deferred && tries[c] < 2 && qt < N) { tries[c]++; front[qt++] = c; }
          }
        }
        // what it did: every cell's ground burned; a forest's stand replaced where the year's dry
        for (let i = 0; i < qt; i++) {
          const c = front[i];
          if (tries[c]) { if (tries[c] === 255) continue; tries[c] = 255; }
          ageG[c] = 0; if (fires[c] < 255) fires[c]++;
          if (ff[c] > 0.15 && U(H(seed ^ 0xc0ffee, gi0 + ((c / n) | 0), gj0 + (c % n), y)) < crownK * Math.min(1, ff[c] * 1.5)) ageC[c] = 0;
        }
        for (let i = 0; i < qt; i++) tries[front[i]] = 0;
        burned += qt;
      }
    }
    // a year on
    for (let c = 0; c < N; c++) { if (ageG[c] < FIRE_OLD - 1) ageG[c]++; if (ageC[c] < FIRE_OLD - 1) ageC[c]++; }
  }
  // the tile and its margin (fireAt reads a margin's cells where the seam wanders into it); ages past the
  // window: not burned in it
  let land = 0, recent = 0;
  for (let c = 0; c < N; c++) {
    if (ageG[c] > FIRE_YEARS) ageG[c] = FIRE_OLD; if (ageC[c] > FIRE_YEARS) ageC[c] = FIRE_OLD;
    const x = (c / n) | 0, y = c - x * n;
    if (burnable[c] && x >= mc && y >= mc && x < mc + core && y < mc + core) { land++; if (ageG[c] < 10) recent++; }
  }
  return { n, core, mc, ageG, ageC, fires, stats: { fires: nFires, burnedCells: burned, land, recent10: land ? recent / land : 0, burnPerYear: land ? burned / (land * FIRE_YEARS) : 0 } };
}

// the seam's wander at a world-fixed cell (gi, gj on a face): cells, each way
function seamWarp(seed, face, gi, gj, k) {
  const X = gi / 48, Y = gj / 48, x0 = Math.floor(X), y0 = Math.floor(Y), fx = X - x0, fy = Y - y0, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  const v = (a, b) => U(H(seed ^ 0x5ea3, face * 2 + k, x0 + a, y0 + b)) * 2 - 1;
  return SEAM * ((v(0, 0) * (1 - sx) + v(1, 0) * sx) * (1 - sy) + (v(0, 1) * (1 - sx) + v(1, 1) * sx) * sy);
}
// which fire tile holds a place, and where in its grid: { ti, tj, x, y } (x, y in its grid with its
// margin) for face coordinates (u, v); the tile whose own part the place falls in once the seam's
// wandered (a cell near a seam read from the neighbour's margin as often as not)
export function fireCellOf(R, face, u, v, seed = 0x51f15e) {
  const NT = fireTilesAcross(R), core = Math.round(FIRE_TILE / FIRE_CELL), mc = Math.round(MARGIN / FIRE_CELL);
  const gi = (u + 1) * 0.5 * NT * core, gj = (v + 1) * 0.5 * NT * core;
  const wi = gi + seamWarp(seed >>> 0, face, gi, gj, 0), wj = gj + seamWarp(seed >>> 0, face, gi, gj, 1);
  const ti = Math.max(0, Math.min(NT - 1, Math.floor(wi / core))), tj = Math.max(0, Math.min(NT - 1, Math.floor(wj / core)));
  return { face, ti, tj, x: Math.max(0, Math.min(core + 2 * mc - 1, Math.floor(gi - ti * core) + mc)), y: Math.max(0, Math.min(core + 2 * mc - 1, Math.floor(gj - tj * core) + mc)) };
}

// the fire record under a unit direction on a generator's world, in the terrain workers (their chunks'
// ground, chunkbuilder.js and volume.js): its fire tiles worked out as the chunks over them are built, kept
// on the generator (a couple of dozen); the same fires as the main thread's (sim/fireField.js: the
// terrain params' fireO2 and seed). { ageG, ageC, n (how many fires burned it) }, or null where its plants don't burn
const _fuv = { face: 0, u: 0, v: 0 }, _fd = [0, 0, 0], _rec = { ageG: FIRE_OLD, ageC: FIRE_OLD, n: 0 };
export function fireAtDir(gen, x, y, z) {
  if (!gen.snap || !(gen.p.life > 0) || !((gen.p.fireO2 || 0) >= 0.15)) return null;
  _fd[0] = x; _fd[1] = y; _fd[2] = z;
  faceUVFromDir(_fd, _fuv);
  const seed = gen.p.seed ? gen.p.seed[0] >>> 0 : 0x51f15e, c = fireCellOf(gen.R, _fuv.face, _fuv.u, _fuv.v, seed);
  const tiles = gen._fireTiles || (gen._fireTiles = new Map()), key = `${c.face}:${c.ti}:${c.tj}`;
  let T = tiles.get(key);
  if (!T) {
    const t = dm.clamp(((gen.p.fireO2 || 0) - 0.15) / 0.05, 0, 1);
    T = fireTile(gen, c.face, c.ti, c.tj, { o2K: t * t * (3 - 2 * t), seed });
    if (tiles.size > 24) tiles.delete(tiles.keys().next().value);
    tiles.set(key, T);
  }
  const o = c.x * T.n + c.y;
  _rec.ageG = T.ageG[o]; _rec.ageC = T.ageC[o]; _rec.n = T.fires[o];
  return _rec;
}
// a fire's mark on the ground's colour (linear RGB, in place): this year's burn charred, last year's
// darkened, a flush of green for the few years after
// (w: how much of it, 0..1: the chunks fade it out as their spacing grows, chunkbuilder.js)
export function fireMark(gen, f, col, w = 1) {
  if (!f || f.ageG >= 6 || !(w > 0)) return;
  const a = f.ageG, P = gen.p.palette;
  if (a <= 1) { const k = 1 - (1 - (a === 0 ? 0.32 : 0.6)) * w; col[0] *= k; col[1] *= k; col[2] *= k * (1 - 0.1 * w); }
  else if (P && P.veg) { const k = 0.45 * (1 - (a - 2) / 4) * w; for (let c = 0; c < 3; c++) col[c] += (P.veg[c] * 1.15 - col[c]) * k; }
}
