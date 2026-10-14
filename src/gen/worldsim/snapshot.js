// A simulated world, packed for the game (WORLDSIM.md step 7): the world sim's
// results as flat typed arrays (cached, sent to the terrain workers), and a sampler
// the terrain generator reads instead of its noise. 16 bytes a cell (every terrain
// worker holds a copy of every world's):
//
//   on the fine grid   heights (m, the game's convention: real metres on the drawn
//                      sphere; f32), lake surfaces (f32), the exposed rock (or beach
//                      sand; u8), ice thickness (m, u16), rivers (discharge, 0..1 by log,
//                      as 0..255), a fresh melt sheet (0..255), local relief (m, u16:
//                      how rugged the fine detail is), where each cell drains (u8: which
//                      of its neighbours, in GridLite.nbrs order; 255 none)
//   on the climate grid the yearly mean brought to sea level (K), rain (mm/yr), plant
//                      cover and its forest and open shares (life.js), cloud cover, and the
//                      year (season.js: the temperature's swing, the cold half's snow)
//
// Versioned: a cache keyed by seed, body and SIM_VERSION drops stale ones.

import { GridLite } from './grid.js';
import { RefineReader, TileSet, contactW } from './refine.js';
import { MT } from '../tileshape.js';
import * as dm from '../../core/dmath.js';
import { Noise3 } from '../../core/noise.js';
import { dunePatches } from '../dunes.js';
import { ROCK_UP } from './lithology.js';
import { seasonsFor, cloudOf } from './season.js';

export const SIM_VERSION = 72;   // (72: the impactors the air broke up those of its own time (its history's dry air and water vapour), the finer levels' craters each by the air when it was made; 71: the fine epoch in 20 steps of 500 kyr, the climates after the deep time warm-started with 40 rain sweeps, a long wet era in at most ~200 steps; 70: a Titan's overturn resurfaces it, its old basins all but gone; 69: the soil, the water table and the wetlands in the snapshot; 61: the climate's orbit eccentric, its perihelion where it falls in the year; 62: a moon's seasons its tilt to its planet's orbit; 63: a Titan's low latitudes raised as cos^2 of the latitude, not a step, drawn at the world's scale; 64: generation's last Math.sin/cos/hypot... through dmath: the folds' arcs moved an ulp, so every client holds the same bits; 65: the monsoon rain belt, the subtropics' sinking air, summer convection, the air's capacity over its own ground; life's leaps by the room each stage has; 66: life's realms and their family tree in the snapshot; 67: its places, every landmass sized, described and tagged (places.js); 68: a world without a sea, its named features its places)

// the soil's and the water table's depths as bytes (packSnapshot, SnapshotSampler.soil, .wtd)
const SOIL_D0 = 0.02, SOIL_LOG = dm.log(1 + 40 / SOIL_D0), WTD_D0 = 0.1, WTD_LOG = dm.log(1 + 500 / WTD_D0);

// a world's grid size: maxN for an Earth-sized one, finer cells don't help a small one
// (N ~ sqrt(radius): Mars ~210, the Moon ~150, a moonlet 64)
export function simNFor(body, maxN = 288) {
  const k = Math.sqrt(Math.min(1, (body.radiusM || 6.371e6) / 6.371e6));
  return Math.max(64, Math.min(maxN, Math.round(maxN * k / 8) * 8));
}

// W: worldSim's result; body: the body
export function packSnapshot(W, body) {
  const G = W.G, n = G.n;
  const h = Float32Array.from(W.h);
  const water = new Float32Array(n).fill(-1e9);
  if (W.E && W.E.water) for (let c = 0; c < n; c++) if (!W.E.base[c] && W.E.water[c] - W.h[c] > 1) water[c] = W.E.water[c];
  const rock = W.rock ? Uint8Array.from(W.rock) : new Uint8Array(n);
  const u16 = (x) => Math.max(0, Math.min(65535, Math.round(x)));
  const ice = new Uint16Array(n);
  if (W.glaciers) {
    // (the ice as its surface stands: smooth over a few cells, an ice sheet's surface being
    // smooth over many times its thickness; the sim's ice, from the flux through each cell, is
    // thickest along its flow lines, a ridge on each if drawn as it is. The bed and its ice
    // averaged over the ice round each cell a few times, less the bed)
    const gi = W.glaciers.ice;
    let top = new Float64Array(n), t2 = new Float64Array(n);
    // (and no thicker than ice stands so near its edge: Nye's plastic profile, H^2 = 2 (tau / rho
    // g) x, x the real distance in from the nearest ground it leaves bare, a yield stress 100 kPa)
    const hops = new Int32Array(n).fill(-1), q = new Int32Array(n);
    let qn = 0;
    for (let c = 0; c < n; c++) if (!(gi[c] > 0)) { hops[c] = 0; q[qn++] = c; }
    for (let i = 0; i < qn; i++) { const c = q[i]; for (let e = G.nStart[c]; e < G.nStart[c + 1]; e++) { const o = G.nbr[e]; if (hops[o] < 0) { hops[o] = hops[c] + 1; q[qn++] = o; } } }
    const scale = body.radiusM ? G.R / body.radiusM : 0.1, ty = 2 * 100e3 / (917 * (body.gravity || 9.81)) * G.spacing / scale;
    const cap = (c) => hops[c] < 0 ? 1e9 : Math.sqrt(ty * (hops[c] - 0.5));
    for (let c = 0; c < n; c++) top[c] = W.h[c] + Math.min(gi[c], cap(c));
    for (let pass = 0; pass < 6; pass++) {
      for (let c = 0; c < n; c++) {
        if (!(gi[c] > 0)) { t2[c] = top[c]; continue; }
        let s = 2 * top[c], w = 2;
        for (let e = G.nStart[c]; e < G.nStart[c + 1]; e++) { const o = G.nbr[e]; if (gi[o] > 0) { s += top[o]; w++; } }
        t2[c] = s / w;
      }
      const t = top; top = t2; t2 = t;
    }
    for (let c = 0; c < n; c++) if (gi[c] > 0) ice[c] = u16(Math.max(1, Math.min(top[c] - W.h[c], cap(c))));
  }
  const river = new Uint8Array(n);
  let amax = 0;   // (the greatest drainage: the bytes' scale, kept so a tile can know a river's)
  if (W.E && W.E.A) {
    for (let c = 0; c < n; c++) if (!W.E.base[c] && W.E.A[c] > amax) amax = W.E.A[c];
    for (let c = 0; c < n; c++) if (!W.E.base[c] && amax > 0) river[c] = Math.round(255 * Math.min(1, Math.max(0, dm.log(Math.max(W.E.A[c], 1e-30) / (amax * 1e-4)) / dm.log(1e4))));
  }
  const melt = new Uint8Array(n);
  if (W.melt) for (let c = 0; c < n; c++) melt[c] = Math.round(255 * Math.min(1, Math.max(0, W.melt[c])));
  // where each cell's water goes (river lines for channels at walking scale): which neighbour
  const rcv = new Uint8Array(n).fill(255);
  if (W.E && W.E.rcv) {
    const L = new GridLite(G.N, G.R), nb = new Int32Array(8);
    for (let c = 0; c < n; c++) {
      const to = W.E.rcv[c];
      if (to < 0) continue;
      const k = L.nbrs(c, nb);
      for (let e = 0; e < k; e++) if (nb[e] === to) { rcv[c] = e; break; }
    }
  }
  const relief = new Uint16Array(n);
  for (let c = 0; c < n; c++) { let r = 0; for (let e = G.nStart[c]; e < G.nStart[c + 1]; e++) r = Math.max(r, Math.abs(W.h[c] - W.h[G.nbr[e]])); relief[c] = u16(r); }
  // (sea: whether the world has a liquid to stand below the datum; without one, its lows are dry)
  const out = { version: SIM_VERSION, path: W.path, N: G.N, R: G.R, h, water, rock, ice, river, riverMax: amax, melt, relief, rcv, Nc: 0, sea: !!(body.terrain && body.terrain.liquid) };
  // the flat-topped volcanoes eruptions under ice left (world.js)
  out.tuyas = (W.tuyas || []).map((t) => ({ d: t.d.slice(), top: t.top, r: t.r }));
  // the sea itself (the erosion's base: water below the datum joined to a body big enough to be
  // a sea): an inland hollow below the datum is a basin, dry or a lake, not sea
  if (W.E && W.E.sea && W.E.base) { out.ocean = new Uint8Array(n); for (let c = 0; c < n; c++) out.ocean[c] = W.E.base[c] && W.h[c] < 0 ? 1 : 0; }
  else if (W.ocean) out.ocean = Uint8Array.from(W.ocean);
  // the crater record below the grid (barren.js): by cell, log-scaled (20 a decade, 0: none),
  // and the craters' scales (craters.js)
  if (W.crater) {
    const { crat, ...k } = W.crater;
    out.crat = new Uint8Array(n);
    for (let c = 0; c < n; c++) out.crat[c] = crat[c] > 1e-12 ? Math.max(1, Math.min(255, Math.round((dm.log(crat[c]) / dm.log(10) + 12) * 20))) : 0;
    out.crater = k;
  }
  // sand seas (world.js: truly dry, sand to hand, gentle ground) and the dunes the wind builds
  // in them (dunes.js: the same patches for every world, made once)
  if (W.dunes && W.dunes.some((v) => v)) { out.dunes = Uint8Array.from(W.dunes); out.dunePatch = dunePatches(); }
  // canyon country (world.js): how far a great river lies below the dry plateau round it (m)
  if (W.gorge && W.gorge.some((v) => v)) out.gorge = Uint16Array.from(W.gorge);
  // the soil and the ground water (soil.js): its depth (m), the water table's (m), wetlands (0/255); each
  // depth by log, fine near nothing (a soil's first centimetres decide grass from bare rock)
  if (W.soil && W.soil.depth) {
    const sd = W.soil.depth, wt = W.soil.wtd, wl = W.soil.wet;
    out.soil = Uint8Array.from(sd, (v) => Math.max(0, Math.min(255, Math.round(255 * dm.log(1 + Math.max(0, v) / SOIL_D0) / SOIL_LOG))));
    out.wtd = Uint8Array.from(wt, (v) => Math.max(0, Math.min(255, Math.round(255 * dm.log(1 + Math.max(0, v) / WTD_D0) / WTD_LOG))));
    out.wetland = Uint8Array.from(wl, (v) => (v ? 255 : 0));
  }
  // the ground inside each cell (ground.js): local relief (m), youth, grain, glaciation,
  // valley spacing (m real)
  if (W.ground && W.ground.youth) {
    const g = W.ground, b8 = (v) => Math.max(0, Math.min(255, Math.round(128 + 127 * v)));
    out.gLr = Uint16Array.from(g.lr, (v) => u16(v)); out.gVsp = Uint16Array.from(g.vsp, (v) => u16(v));
    out.gYouth = Uint8Array.from(g.youth, b8); out.gGx = Uint8Array.from(g.gx, b8); out.gGy = Uint8Array.from(g.gy, b8);
    out.gGlac = Uint8Array.from(g.glac, (v) => Math.round(255 * Math.max(0, Math.min(1, v))));
  }
  // the maria's lava levels (barren.js floodBasin; m, -32768 none): their edges follow them
  // (a dry world's wet past: how much rain it had, 0..1, for the finer levels' valleys)
  if (W.wetK) { out.wetK = W.wetK; out.wetFrac = W.wetFrac; out.wetRain = W.wetRain; }
  if (W.mareLv) { out.mareLv = new Int16Array(n); for (let c = 0; c < n; c++) out.mareLv[c] = W.mareLv[c] === W.mareLv[c] ? Math.max(-32767, Math.min(32767, Math.round(W.mareLv[c]))) : -32768; }
  // an icy shell's cracks (barren.js crackShell): arcs, for each level to draw its ridges
  if (W.lineae) out.lineae = W.lineae.map((a) => ({ pole: a.pole.slice(), u: a.u.slice(), v: a.v.slice(), start: a.start, len: a.len, H: a.H }));
  // (a squeezed icy lid's folds: arcs the finer levels draw as narrow as they are)
  if (W.folds) out.folds = W.folds.map((a) => ({ pole: a.pole.slice(), u: a.u.slice(), v: a.v.slice(), start: a.start, len: a.len, H: a.H, w: a.w, mid: a.mid.slice() }));
  // and where it broke into rafts over warm spots (chaos: the rafts drawn where the ground is seen)
  if (W.chaos && W.chaos.length) out.chaos = W.chaos.map((c) => ({ at: c.at.slice(), R: c.R, H: c.H }));
  // (fields of small shield volcanoes: drawn where the ground is seen, terrain.js _shieldsAt)
  if (W.shieldFields && W.shieldFields.length) out.shieldFields = W.shieldFields.map((f) => ({ at: f.at.slice(), R: f.R, n: f.n, k: f.k }));
  if (W.climate && W.Gc) {
    const Gc = W.Gc, m = Gc.n, lapse = body.terrain && body.terrain.climate ? body.terrain.climate.lapse ?? 0.0065 : 0.0065;
    out.Nc = Gc.N;
    out.Tsea = new Float32Array(m); out.P = Float32Array.from(W.climate.Pann);
    for (let c = 0; c < m; c++) out.Tsea[c] = W.climate.Tann[c] + (W.climate.sea[c] ? 0 : lapse * Math.max(0, W.climate.h ? W.climate.h[c] : 0));
    if (W.life) { out.cover = Float32Array.from(W.life.cover); out.forest = Float32Array.from(W.life.forest); out.open = Float32Array.from(W.life.open); }
    if (W.life && W.life.realm && W.life.landed) Object.assign(out, realmsOf(W.life, Gc));
    // cloud cover (for the render's clouds: season.js cloudOf, by the year's rain)
    out.cloud = new Float32Array(m);
    for (let c = 0; c < m; c++) out.cloud[c] = cloudOf(W.climate.Pann[c], W.climate.upwell ? W.climate.upwell[c] : 0);
    // and baked for the render here (off the main thread): the map the clouds read
    const cm = cloudMapPixels(out, 512);
    out.cloudPx = cm.px; out.cloudW = cm.w;
  }
  // the year by place (season.js): its swing and its cold half's snow, for the ground's snow through it,
  // and baked for the render as the clouds' are; worked out from the snapshot's own surface, so a world
  // cached before they were kept gets the very same (worldSims.js)
  if (out.Nc && W.climOpts) Object.assign(out, seasonsFor(out, W.climOpts));
  return out;
}

// life's realms on the climate grid (-1: none) and their family tree (life/lineage.js): each realm on
// the land now with its parent and when it began (the plates' tracker's, world.js RealmTracker; one the
// life map made since, an island's colonists, from the nearest realm the tracker knows, across the
// water, when life reached it), the older realms those lead back to, the interchanges between them,
// and each one's share of the land
function realmsOf(L, Gc) {
  const m = Gc.n, realm = new Int16Array(m).fill(-1), area = new Map();
  let land = 0;
  for (let c = 0; c < m; c++) if (L.landed[c] && L.realm[c] >= 0) { realm[c] = Math.min(32767, L.realm[c]); area.set(realm[c], (area.get(realm[c]) || 0) + Gc.area[c]); land += Gc.area[c]; }
  const known = new Map((L.realmTree || []).map((r) => [r.id, r])), nodes = new Map();
  const dist = new Int32Array(m), q = new Int32Array(m);
  for (const [id] of area) {
    if (known.has(id)) continue;
    // (out from its cells, over land and sea, to the nearest of a realm the tracker knows)
    dist.fill(-1);
    let qn = 0, since = 0, parent = -1;
    for (let c = 0; c < m; c++) if (realm[c] === id) { dist[c] = 0; q[qn++] = c; since = Math.max(since, L.since[c]); }
    for (let i = 0; i < qn && parent < 0; i++) {
      const c = q[i];
      for (let e = Gc.nStart[c]; e < Gc.nStart[c + 1]; e++) {
        const o = Gc.nbr[e];
        if (dist[o] >= 0) continue;
        dist[o] = dist[c] + 1; q[qn++] = o;
        if (realm[o] >= 0 && known.has(realm[o])) { parent = realm[o]; break; }
      }
    }
    nodes.set(id, { id, parent, agoMyr: Math.round(since * 10) / 10, how: 'island' });
  }
  // (and the tracker's realms on the land now, with every one they lead back to)
  for (const [id] of area) for (let r = known.get(id); r && !nodes.has(r.id); r = known.get(r.parent)) nodes.set(r.id, { id: r.id, parent: r.parent, agoMyr: r.agoMyr, how: r.how });
  for (const n of nodes.values()) n.land = area.has(n.id) ? +(area.get(n.id) / Math.max(land, 1e-9)).toFixed(5) : 0;
  const interchanges = (L.interchanges || []).filter((x) => nodes.has(x.realms[0]) && nodes.has(x.realms[1])).map((x) => ({ agoMyr: x.agoMyr, realms: x.realms.slice() }));
  return { realm, realms: { tree: [...nodes.values()].sort((a, b) => a.id - b.id), interchanges } };
}

// the arrays a snapshot carries (for transfer lists and caching)
export function snapshotBuffers(s) {
  return ['h', 'water', 'rock', 'ice', 'river', 'melt', 'relief', 'rcv', 'soil', 'wtd', 'wetland', 'Tsea', 'P', 'cover', 'forest', 'open', 'cloud', 'cloudPx', 'cloudYearPx', 'riverYear', 'realm', 'season', 'seasonPx', 'seasonIce', 'seasonIcePx', 'crat', 'dunes', 'gorge', 'ocean', 'mareLv'].filter((k) => s[k]).map((k) => s[k].buffer);
}

// reads a snapshot at any direction
export class SnapshotSampler {
  // s: the snapshot (simulated at its own size, s.R); Rd: the radius it's drawn at (m), its grid
  // laid on that globe, so whatever measures by the grid measures in drawn metres
  constructor(s, Rd = s.R) {
    // (its sizes across the ground in the sim's metres drawn at the drawn globe's: the craters', the
    // tuyas'; the water its rivers bring in by area)
    const k = Rd / s.R;
    if (k !== 1) {
      const c = s.crater;
      s = { ...s, riverMax: s.riverMax && s.riverMax * k * k, tuyas: s.tuyas && s.tuyas.map((t) => ({ ...t, r: t.r * k })),
        crater: c && { ...c, scale: c.scale * k, Dw: c.Dw * k, Dair: c.Dair * k, Dlo: c.Dlo * k, airD: c.airD && c.airD.map((x) => x * k), Drel: c.Drel * k } };
    }
    this.s = s; this.Rd = Rd; this.lenK = k;
    this.ref = null; this.refCell = 0; this._hs = 1; this.pyr = null; this._pyrN = -1; this._pyrR = [];
    this.G = new GridLite(s.N, Rd);
    this.Gc = s.Nc ? new GridLite(s.Nc, Rd) : null;
    this.nb = new Int32Array(8);
    this.cd = [0, 0, 0];
    // (whether there's any glacier ice: most worlds have none to read)
    this.hasIce = false;
    if (s.ice) for (let c = 0; c < s.ice.length; c++) if (s.ice[c] > 0) { this.hasIce = true; break; }
    // tuyas by the cell they stand in (and its neighbours: they reach a few km)
    this.tuyaAt = null;
    if (s.tuyas && s.tuyas.length) {
      this.tuyaAt = new Map();
      const put = (c, t) => { const l = this.tuyaAt.get(c); if (l) l.push(t); else this.tuyaAt.set(c, [t]); };
      for (const t of s.tuyas) {
        const c = this.G.cellAt(t.d[0], t.d[1], t.d[2]);
        put(c, t);
        const k = this.G.nbrs(c, this.nb);
        for (let e = 0; e < k; e++) put(this.nb[e], t);
      }
    }
    this.uv = { face: 0, u: 0, v: 0 };
    this.d = [0, 0, 0];
    // land cells with no sea beside them (where a dip below the datum is still dry land); a
    // sea cell: the world sim's sea where it says (else any cell below the datum not a lake)
    const G = this.G, n = G.n, nb = this.nb, N = s.N;
    const isSea = s.ocean ? (c) => s.ocean[c] === 1 : (c) => s.h[c] < 0 && !(s.water[c] > -1e8);
    this.inland = new Uint8Array(n);
    for (let c = 0; c < n; c++) {
      if (isSea(c)) continue;
      let sea = false;
      const i = c % N, j = Math.floor(c / N) % N;
      if (i > 0 && j > 0 && i < N - 1 && j < N - 1) {   // (inside a face: the 8 round it)
        for (let dj = -N; dj <= N && !sea; dj += N) for (let di = -1; di <= 1; di++) { const q = c + dj + di; if (isSea(q)) { sea = true; break; } }
      } else {
        const k = G.nbrs(c, nb);
        for (let e = 0; e < k; e++) { const q = nb[e]; if (isSea(q)) { sea = true; break; } }
      }
      if (!sea) this.inland[c] = 1;
    }
    if (s.sea === false) this.inland.fill(1);
    // how many cells from the sea's own cells each cell is (0 in the sea, capped at 8)
    this.seaHops = new Uint8Array(n).fill(8);
    const q = new Int32Array(n);
    let qn = 0;
    if (s.sea !== false) for (let c = 0; c < n; c++) if (isSea(c)) { this.seaHops[c] = 0; q[qn++] = c; }
    for (let i = 0; i < qn; i++) {
      const c = q[i], d = this.seaHops[c] + 1;
      if (d >= 8) continue;
      const k = G.nbrs(c, nb);
      for (let e = 0; e < k; e++) { const o = nb[e]; if (this.seaHops[o] > d) { this.seaHops[o] = d; q[qn++] = o; } }
    }
  }
  _d(x, y, z) { const d = this.d; d[0] = x; d[1] = y; d[2] = z; return d; }
  // the world's refinement (refine.js), or null: its cells (m) a few times finer than the grid's
  attachRefine(R) {
    this.ref = R ? new RefineReader(R) : null;
    this.riv = R && R.riv ? R.riv : null;   // (its rivers, refine.js riverIndex)
    this.refCell = R ? (Math.PI / 2) * this.Rd / (R.n * MT) : 0;
    if (this.ref) this.ref.cell = this.refCell;
  }
  // the terrain pyramid's finer levels near the player (gen/terrainTiles.js): a Map of level ->
  // TileSet, filled as tiles come in; their readers, coarse to fine, each with its cell size (m)
  attachPyr(levels) { this.pyr = levels; this._pyrN = -1; }
  pyrReaders() {
    const P = this.pyr;
    if (!P || !P.size) return this._pyrR.length ? (this._pyrR = []) : this._pyrR;
    if (P.size !== this._pyrN) {
      this._pyrN = P.size;
      this._pyrR = [...P.keys()].sort((a, b) => a - b).map((L) => { const r = new RefineReader(P.get(L)); r.cell = (Math.PI / 2) * this.Rd / ((1 << L) * MT); return r; });
    }
    return this._pyrR;
  }
  // smooth (bilinear) fields
  h(x, y, z) { return this.G.sample(this.s.h, this._d(x, y, z), this.uv); }
  // (smoothly: the cells' cubic B-spline blend, no corners where cells meet)
  hSmooth(x, y, z) {
    const c = this._c16 || (this._c16 = new Int32Array(16)), w = this._w16 || (this._w16 = new Float64Array(16)), h = this.s.h;
    this.G.corners16(this._d(x, y, z), c, w, this.uv);
    let s = 0;
    for (let k = 0; k < 16; k++) s += h[c[k]] * w[k];
    return s;
  }
  // the ground inside the cells here (ground.js), smooth as hSmooth: into o { lr (m), youth
  // (-1..1), gx, gy (the grain: s cos 2a, s sin 2a, a from east toward north), glac (0..1),
  // vsp (m real) }; null on a world without it
  ground(x, y, z, o) {
    const s = this.s;
    if (!s.gLr) return null;
    const c = this._c16 || (this._c16 = new Int32Array(16)), w = this._w16 || (this._w16 = new Float64Array(16));
    this.G.corners16(this._d(x, y, z), c, w, this.uv);
    let lr = 0, yo = 0, gx = 0, gy = 0, gl = 0, vs = 0;
    for (let k = 0; k < 16; k++) { const q = c[k], wk = w[k]; lr += s.gLr[q] * wk; yo += s.gYouth[q] * wk; gx += s.gGx[q] * wk; gy += s.gGy[q] * wk; gl += s.gGlac[q] * wk; vs += s.gVsp[q] * wk; }
    o.lr = lr; o.youth = (yo - 128) / 127; o.gx = (gx - 128) / 127; o.gy = (gy - 128) / 127; o.glac = gl / 255; o.vsp = vs;
    return o;
  }
  // canyon country's gorge here (m below the plateau round it), smooth as hSmooth: added to that,
  // the plateau's level where its cell's mean dipped for the gorge (0 elsewhere)
  gorgeSmooth(x, y, z) {
    const g = this.s.gorge;
    if (!g) return 0;
    const c = this._c16 || (this._c16 = new Int32Array(16)), w = this._w16 || (this._w16 = new Float64Array(16));
    this.G.corners16(this._d(x, y, z), c, w, this.uv);
    let s = 0;
    for (let k = 0; k < 16; k++) s += g[c[k]] * w[k];
    return s;
  }
  // the ice's thickness here (H) and the bed it lies on (hb), both smooth (the cells' B-spline
  // blend); null where there's none
  iceTop(x, y, z) {
    const c = this._c16 || (this._c16 = new Int32Array(16)), w = this._w16 || (this._w16 = new Float64Array(16)), h = this.s.h, ice = this.s.ice;
    this.G.corners16(this._d(x, y, z), c, w, this.uv);
    let H = 0, hb = 0;
    for (let k = 0; k < 16; k++) { H += ice[c[k]] * w[k]; hb += h[c[k]] * w[k]; }
    if (!(H > 0.5)) return null;
    const o = this._it || (this._it = { H: 0, hb: 0 });
    o.H = H; o.hb = hb;
    return o;
  }
  relief(x, y, z) { return this.G.sample(this.s.relief, this._d(x, y, z), this.uv); }
  // the soil's depth here (m; soil.js), the water table's (m) and the wetlands' share (0..1); null
  // where the world keeps none (a snapshot before them, an airless world)
  soil(x, y, z) { const a = this.s.soil; return a ? SOIL_D0 * (dm.exp(this.G.sample(a, this._d(x, y, z), this.uv) / 255 * SOIL_LOG) - 1) : null; }
  wtd(x, y, z) { const a = this.s.wtd; return a ? WTD_D0 * (dm.exp(this.G.sample(a, this._d(x, y, z), this.uv) / 255 * WTD_LOG) - 1) : null; }
  // (the cells' smooth blend, as meltSmooth: read bilinearly a wetland's edge ran along the cells, its pools
  // stopping in straight lines and square corners seen from afar)
  wetland(x, y, z) {
    const a = this.s.wetland;
    if (!a) return 0;
    const c = this._c16 || (this._c16 = new Int32Array(16)), w = this._w16 || (this._w16 = new Float64Array(16));
    this.G.corners16(this._d(x, y, z), c, w, this.uv);
    let s = 0;
    for (let k = 0; k < 16; k++) s += a[c[k]] * w[k];
    return s / 255;
  }
  ice(x, y, z) { return this.G.sample(this.s.ice, this._d(x, y, z), this.uv); }
  river(x, y, z) { return this.G.sample(this.s.river, this._d(x, y, z), this.uv) / 255; }
  melt(x, y, z) { return this.G.sample(this.s.melt, this._d(x, y, z), this.uv) / 255; }
  // (the cells' smooth blend: a melt pool one cell across read bilinearly was the cell's square)
  meltSmooth(x, y, z) {
    const m = this.s.melt;
    if (!m) return 0;
    const c = this._c16 || (this._c16 = new Int32Array(16)), w = this._w16 || (this._w16 = new Float64Array(16));
    this.G.corners16(this._d(x, y, z), c, w, this.uv);
    let s = 0;
    for (let k = 0; k < 16; k++) s += m[c[k]] * w[k];
    return s / 255;
  }
  seaDist(x, y, z) { return this.G.sample(this.seaHops, this._d(x, y, z), this.uv); }   // (in cells)
  // the cell cell c drains into (-1 none)
  // a river's flow through the year here (season.js riverYear): out[0], out[1] its swing's two parts
  // against its mean, from the cell round here that carries the most (a river's own, not a neighbouring
  // basin's); null where the world keeps none
  riverYear(x, y, z, out) {
    const ry = this.s.riverYear, rv = this.s.river;
    if (!ry) return null;
    const G = this.G, n = ry.length >> 1;
    let best = G.cellAt(x, y, z);
    const k = G.nbrs(best, this.ryb || (this.ryb = new Int32Array(8)));
    for (let e = 0; e < k; e++) if (rv[this.ryb[e]] > rv[best]) best = this.ryb[e];
    out[0] = ry[best] / 60; out[1] = ry[n + best] / 60;
    return out;
  }
  rcvOf(c) {
    const slot = this.s.rcv[c];
    if (slot === 255) return -1;
    this.G.nbrs(c, this.rb || (this.rb = new Int32Array(8)));
    return this.rb[slot];
  }
  // the nearest cell's (categories, and lakes: a lake's surface is level)
  cell(x, y, z) { return this.G.cellAt(x, y, z); }
  rock(x, y, z) { return this.s.rock[this.G.cellAt(x, y, z)]; }
  // the rock showing at a point whose ground stands at h (m, the sim's heights): the cells
  // round it, where they hold different rock, read as a stack, the rock of the higher cells
  // over that of the lower. Where the ground stands above the cells' blend the upper rock
  // shows, where a valley cuts below it the lower; on even ground, the nearer cells'. So a
  // contact runs along the ground's own contours (up the valleys, round the spurs, along a
  // plain's low rises), as on a geological map, not along the grid. Weathered rock and soil
  // creep and wash across a contact, so where nothing much decides it (even ground) the two
  // grade into each other over a few hundred metres; where the ground does, it's sharp.
  // Returns the rock; this.rock2 the other one there and this.rockMix its share (0..0.5)
  // where (x, y, z) reads the world's rock cells: a little off true, up to about a cell, over a
  // few scales, so a contact the cells would draw straight (along a column of them) is as ragged
  // as real ones are below the grid's scale; the finer levels' rises and hollows bend it further
  // (the refinement's rock rule reads through it too, localsim.js). Into out
  // (two scales: the cells' contacts swung about over several cells, and bent within each cell:
  // with the first alone a contact ran straight along a cell's edge for its whole length, half a
  // km of ruler line across a plain where nothing else bends it)
  rockWarp(x, y, z, out) {
    const nz = this._rnz || (this._rnz = new Noise3(0x70c4 ^ (this.s.N * 7919))), f = this.s.N * 0.16, sp = 0.9 * this.G.spacing / this.G.R;
    const f2 = this.G.R / (1.3 * this.G.spacing), sp2 = 0.6 * this.G.spacing / this.G.R;
    out[0] = x + sp * nz.fbm(x * f, y * f, z * f, 3) + sp2 * nz.fbm(x * f2 + 7.3, y * f2, z * f2, 4);
    out[1] = y + sp * nz.fbm(x * f + 31.7, y * f, z * f, 3) + sp2 * nz.fbm(x * f2, y * f2 + 19.9, z * f2, 4);
    out[2] = z + sp * nz.fbm(x * f, y * f + 57.1, z * f, 3) + sp2 * nz.fbm(x * f2, y * f2, z * f2 + 41.3, 4);
    const l = Math.sqrt(out[0] * out[0] + out[1] * out[1] + out[2] * out[2]);
    out[0] /= l; out[1] /= l; out[2] /= l;
    return out;
  }
  rockAt(x, y, z, h, below = -1) {
    // (from the finest level of the terrain's tiles that covers the point; in a tile's margin,
    // where it fades into the level below, the two levels' rocks blended by how far in, so a
    // tile's own deposits (its beaches, its alluvium) don't stop at a straight line)
    const P = this.pyrReaders();
    for (let i = (below < 0 ? P.length : below) - 1; i >= 0; i--) {
      if (!P[i].sample(this._d(x, y, z)) || P[i].w <= 0.02) continue;
      const w = P[i].w, fine = P[i].rockAt(h * this._hs, this);
      if (w >= 0.98) { this.rockPyr = true; return fine; }
      const fr2 = this.rock2, fmix = this.rockMix, coarse = this.rockAt(x, y, z, h, i);
      this.rockPyr = w >= 0.5;
      if (fine === coarse) { this.rock2 = fr2; this.rockMix = fmix; return fine; }
      this.rock2 = w >= 0.5 ? coarse : fine; this.rockMix = w >= 0.5 ? 1 - w : w;
      return w >= 0.5 ? fine : coarse;
    }
    this.rockPyr = false;
    if (this.ref && this.ref.sample(this._d(x, y, z))) return this.ref.rockAt(h * this._hs, this, NaN);
    return this.rockAtWarped(this.rockWarp(x, y, z, this._wd3 || (this._wd3 = [0, 0, 0])), h);
  }
  // the world sim's own rock at a direction already warped (rockWarp's), for a caller reading the
  // same places over and over as their heights change (a refinement tile's cells); rockSame: the
  // cells round it all hold the one rock (so the answer is that whatever the height)
  rockAtWarped(wd, h) {
    const s = this.s, c = this._rc || (this._rc = new Int32Array(16)), w = this._rw || (this._rw = new Float64Array(16));
    this.G.corners16(wd, c, w, this.uv);
    const r0 = s.rock[c[0]];
    this.rock2 = r0; this.rockMix = 0;
    let same = true;
    for (let k = 1; k < 16 && same; k++) if (s.rock[c[k]] !== r0) same = false;
    this.rockSame = same;
    if (same) return r0;
    let hb = 0, lo = 1e9, hi = -1e9;
    for (let k = 0; k < 16; k++) { const hk = s.h[c[k]]; hb += w[k] * hk; lo = Math.min(lo, hk); hi = Math.max(hi, hk); }
    const span = Math.max(60, hi - lo), e = (h - hb) / span;
    // each rock: its share of the blend, raised where the ground stands on its side of the stack
    let best = -1, bs = -1e9, sec = -1, ss = -1e9;
    const seen = this._seenR || (this._seenR = new Int32Array(16));
    let ns = 0;
    for (let k = 0; k < 16; k++) {
      const r = s.rock[c[k]];
      let dup = false;
      for (let q = 0; q < ns; q++) if (seen[q] === r) { dup = true; break; }
      if (dup) continue;
      seen[ns++] = r;
      let W = 0, H = 0;
      for (let q = 0; q < 16; q++) if (s.rock[c[q]] === r) { W += w[q]; H += w[q] * s.h[c[q]]; }
      if (W < 1e-9) continue;
      // (and on even ground by its rises and hollows: cover holds the rises, the basement shows in
      // the hollows, so a contact snakes along them rather than the cells' blend)
      const score = W + (1.5 * e * (H / W - hb) / span + 0.8 * dm.clamp(2 * e, -1, 1) * ROCK_UP[r]) * Math.min(1, 2.5 * W);
      if (score > bs) { sec = best; ss = bs; bs = score; best = r; } else if (score > ss) { ss = score; sec = r; }
    }
    if (sec >= 0) { this.rock2 = sec; this.rockMix = 0.5 * (1 - dm.smoothstep(0, contactW(this.rockSoft, this.G.spacing / this.G.R * this.Rd), bs - ss)); }
    return best;
  }
  lake(x, y, z) { const w = this.s.water[this.G.cellAt(x, y, z)]; return w > -1e8 ? w : null; }
  // the lake level here: the cell's own lake (own), or a neighbouring cell's lake whose
  // centre is within a cell's spacing (it fills its basin out to where the ground rises
  // above it, so its shore is a contour, not the cells' outline), with q how far out
  // (0 at its centre, 1 a spacing away: the basin's rim); else null
  lakeLevel(x, y, z, out) {
    const G = this.G, s = this.s, c0 = G.cellAt(x, y, z);
    if (s.water[c0] > -1e8) { out.L = s.water[c0]; out.own = true; out.q = 0; return out; }
    let L = -1e9, q2 = 1;
    const lim = G.spacing / G.R, lim2 = lim * lim, nb = this.nb, cd = this.cd, k = G.nbrs(c0, nb);
    for (let e = 0; e < k; e++) {
      const q = nb[e], w = s.water[q];
      if (!(w > L)) continue;
      G.centre(q, cd);
      const dx = x - cd[0], dy = y - cd[1], dz = z - cd[2], d2 = dx * dx + dy * dy + dz * dz;
      if (d2 < lim2) { L = w; q2 = d2 / lim2; }
    }
    if (L < -1e8) return null;
    out.L = L; out.own = false; out.q = Math.sqrt(q2); return out;
  }
  // the climate grid's
  // (the climate grid's fields read smoothly, the cells' cubic B-spline blend: its cells are
  // big, and read bilinearly they showed as squares; the blend's cells and weights kept for
  // the next field read at the same point)
  _gcRead(f, x, y, z) {
    const d = this._d(x, y, z), c = this._gcc || (this._gcc = new Int32Array(16)), w = this._gcw || (this._gcw = new Float64Array(16));
    if (d[0] !== this._gcx || d[1] !== this._gcy || d[2] !== this._gcz) {
      this.Gc.corners16(d, c, w, this._gcuv || (this._gcuv = { face: 0, u: 0, v: 0 }));
      this._gcx = d[0]; this._gcy = d[1]; this._gcz = d[2];
    }
    let s = 0;
    for (let k = 0; k < 16; k++) s += f[c[k]] * w[k];
    return s;
  }
  Tsea(x, y, z) { return this.Gc ? this._gcRead(this.s.Tsea, x, y, z) : null; }
  // the world's coldest (sea-level, the year round): where a thin air's water freezes out
  get TseaMin() {
    if (this._tmin == null) { let m = 1e9; const f = this.s.Tsea; if (f) for (let c = 0; c < f.length; c++) if (f[c] < m) m = f[c]; this._tmin = m < 1e8 ? m : null; }
    return this._tmin;
  }
  rain(x, y, z) { return this.Gc ? this._gcRead(this.s.P, x, y, z) : null; }
  // the year there (season.js): its temperature's swing about the mean (a1, b1, K) and its cold half's
  // precipitation (mm a month) into out; false where the world keeps none
  season(x, y, z, out) { return this._read3('season', x, y, z, out); }
  // the air's year over a frozen sea there (season.js seasonIce): a1, b1 and its mean against the open
  // sea's (K)
  seasonIce(x, y, z, out) { return this._read3('seasonIce', x, y, z, out); }
  _read3(k, x, y, z, out) {
    const f = this.s[k];
    if (!this.Gc || !f) return false;
    const c = this._p3 || (this._p3 = {});
    if (!c[k]) { const m = this.Gc.n; c[k] = [f.subarray(0, m), f.subarray(m, 2 * m), f.subarray(2 * m, 3 * m)]; }
    const F = c[k];
    out[0] = this._gcRead(F[0], x, y, z); out[1] = this._gcRead(F[1], x, y, z); out[2] = this._gcRead(F[2], x, y, z);
    return true;
  }
  // how much of a sand sea it is there (0..1: its cells blended, so the edges thin out)
  duneMask(x, y, z) {
    if (!this.s.dunes) return 0;
    const c = this._c16 || (this._c16 = new Int32Array(16)), w = this._w16 || (this._w16 = new Float64Array(16)), f = this.s.dunes;
    this.G.corners16(this._d(x, y, z), c, w, this.uv);
    let s = 0;
    for (let k = 0; k < 16; k++) s += f[c[k]] * w[k];
    return s / 255;
  }
  // the crater record there (craters.js): N(>= D) per m^2 is this / D^2 (D in m as drawn)
  // (the record blended between the cells, so a resurfaced plain's edge is a contour between
  // them, not their outline)
  crat(x, y, z) { const q = this.s.crat ? this.G.sample(this.s.crat, this._d(x, y, z), this.uv) : 0; return q > 0.5 ? dm.pow(10, q / 20 - 12) : 0; }
  cover(x, y, z) { return this.Gc && this.s.cover ? this._gcRead(this.s.cover, x, y, z) : 0; }
  // (the forest's share where its soil lets trees root: the life map's per climate cell, thinned where the
  // fine grid's soil is under ~half a metre: a wood's knolls and rocky ribs bare, its deep hollows full)
  forest(x, y, z) {
    if (!(this.Gc && this.s.forest)) return 0;
    const f = this._gcRead(this.s.forest, x, y, z), d = this.s.soil ? this.soil(x, y, z) : 1;
    return d >= 0.6 ? f : f * dm.smoothstep(0.12, 0.6, d);
  }
  open(x, y, z) { return this.Gc && this.s.open ? this._gcRead(this.s.open, x, y, z) : 0; }
}

// the cloud cover as an equirectangular map for the render (w x w/2 bytes, the cover):
// smoothed across the climate grid's cells (no seams at its faces' edges), and looked up
// through a warp on the scale of a few cells, so the edges of cloudy country billow
// instead of following the cells
export function cloudMapPixels(s, w = 256) {
  if (!s.cloud || !s.Nc) return null;
  const Gc = new GridLite(s.Nc, s.R), m = Gc.n, nb = new Int32Array(8);
  let a = Float32Array.from(s.cloud), b = new Float32Array(m);
  for (let it = 0; it < 2; it++) {
    for (let c = 0; c < m; c++) { const k = Gc.nbrs(c, nb); let sum = a[c] * 2; for (let e = 0; e < k; e++) sum += a[nb[e]]; b[c] = sum / (k + 2); }
    const t = a; a = b; b = t;
  }
  const hh = w / 2, px = new Uint8Array(w * hh), d = [0, 0, 0], uv = { face: 0, u: 0, v: 0 };
  const nz = new Noise3(0x51c10d ^ Math.round(s.R / 1000)), sp = Gc.spacing / s.R;
  const f = 1 / (2.5 * sp), amp = 0.9 * sp;
  for (let y = 0; y < hh; y++) {
    const lat = (y + 0.5) / hh * Math.PI - Math.PI / 2, cl = dm.cos(lat), sl = dm.sin(lat);
    for (let x = 0; x < w; x++) {
      const lon = (x + 0.5) / w * 2 * Math.PI - Math.PI;
      let dx = cl * dm.cos(lon), dy = sl, dz = cl * dm.sin(lon);
      const wx = nz.noise(dx * f, dy * f, dz * f) + 0.5 * nz.noise(dx * f * 2.1 + 5.2, dy * f * 2.1, dz * f * 2.1);
      const wy = nz.noise(dx * f + 17.1, dy * f, dz * f) + 0.5 * nz.noise(dx * f * 2.1, dy * f * 2.1 + 9.3, dz * f * 2.1);
      const wz = nz.noise(dx * f, dy * f + 31.7, dz * f) + 0.5 * nz.noise(dx * f * 2.1, dy * f * 2.1, dz * f * 2.1 + 3.9);
      dx += amp * wx; dy += amp * wy; dz += amp * wz;
      const l = Math.sqrt(dx * dx + dy * dy + dz * dz);
      d[0] = dx / l; d[1] = dy / l; d[2] = dz / l;
      px[y * w + x] = Math.round(255 * Math.min(1, Math.max(0, Gc.sample(a, d, uv))));
    }
  }
  return { px, w, h: hh };
}
