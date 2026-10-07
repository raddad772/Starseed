// Planetary terrain: a pure, deterministic function from a unit direction (in
// the body-fixed frame, +Y = spin axis) to height, climate and surface material.
//
// Shared verbatim by the chunk workers (meshes), the main thread (physics,
// collision) and settlement analysis, so all three always agree.
//
// Layers, large to small:
//   plates      Voronoi plates (domain-warped) with Euler-pole motions; convergent
//               boundaries raise mountain belts / island arcs, divergent ones
//               make rifts and mid-ocean ridges.
//   continents  warped fBm + plate bias; the coastline threshold is calibrated
//               so the ocean covers exactly the planet's ocean fraction.
//   mountains   ridged multifractal, masked by tectonic belts and old orogens
//   hills       derivative-damped ("eroded") fBm: sharp ridges, soft valleys
//   features    craters (multi-scale lattice, power-law sizes), shield volcanoes,
//               canyons, dunes, mesas, maria, ice lineae, hemispheric dichotomy
//   detail      band-limited fractal detail down to ~1 m
// Octaves shorter than the caller's minimum wavelength are skipped (LOD).

import { Noise3, ROT } from '../core/noise.js';
import { Rng, hash3i } from '../core/rng.js';
import * as dm from '../core/dmath.js';
import { fibonacciSphere, faceUVFromDir, FACES, dirFromFaceUV } from './cubesphere.js';
import { patchAt } from './dunes.js';
import { CraterField, VEXAG } from './craters.js';
import { SUITE, SUITES, DEPOSITS, worldColumn, bedAt, faceMetres } from './geology.js';
import { canyonTable, wallSet, wallFit, wallAt, wallReach } from './canyon.js';
import { buildChannel, chanNearest, chanSwing, chanBraid, nearOut, chanFlow, nfOf, ZONE } from './channels.js';
import { craterFloor, TILE_CELLS } from './worldsim/impacts.js';
import { SnapshotSampler } from './worldsim/snapshot.js';
import { RIVER_REC, BIG_REC } from './worldsim/refine.js';
import { snowYear, snowsBySeason } from './worldsim/season.js';
import { TRUE_SCALE, MT, KEEP } from './tileshape.js';
import { meanderField, riverPattern } from './meanders.js';
import { ROCKS, R as ROCK } from './worldsim/lithology.js';
import { hexToLinear } from './color.js';
import { HEIGHT_SCALE } from '../core/units.js';
import { MC, MAT_W0, MAT_N, LITH_CLASS } from './matclasses.js';
import { MATERIALS } from './worldsim/materials.js';
import { standAt } from './life/stands.js';

// Sample record layout
export const S_H = 0;        // height above sea level / datum (m)
export const S_TEMP = 1;     // annual mean surface temperature (K)
export const S_MOIST = 2;    // moisture 0..1
export const S_INLAND = 3;   // 0 at the coast -> 1 deep inland (continental field above threshold)
export const S_MOUNT = 4;    // mountain belt mask 0..1
export const S_CRATER = 5;   // crater floor darkening 0..1
export const S_MARE = 6;     // mare basalt 0..1
export const S_LAVA = 7;     // molten / glowing 0..1
export const S_LINEAE = 8;   // ice crack stains 0..1
export const S_RAY = 9;      // fresh crater ray brightening 0..1
export const S_VARIANT = 10; // low-frequency mineral variation -1..1
export const S_VOLC = 11;    // volcanic flow darkening 0..1
export const S_ROUGH = 12;   // roughness / rockiness tendency 0..1
export const S_DX = 13, S_DY = 14, S_DZ = 15; // sample direction
export const S_WDEPTH = 16;  // lake or river water over the ground here (m; its surface is S_H + this)
export const S_SAND = 17;    // wind-blown sand (a dune sea's) 0..1
export const S_ICE = 18;     // glacier ice over the ground here (m; S_H is its surface)
export const S_WET = 19;     // a river's wet ground beside it 0..1
export const S_RFADE = 20;   // how far a river's water here has faded out, seen from afar 0..1
export const S_WLVL = 21;    // the water's level nearby, a river's, a creek's or a lake's (m, as S_H; -1e9 none): the shore
export const S_FLX = 22, S_FLY = 23, S_FLZ = 24; // running water's way down (unit, planet-fixed; 0 still)
export const S_FLV = 25;     // and its speed (m/s: Manning's, by its depth and slope)
export const S_RIVR = 26;    // 1 where the water is a world-sim river's channel, 2 a creek's (riverRibbons draws them near)
export const S_RDEP = 27;    // a river's channel depth where its water is (m, drawn: its stage through the year, universe.js)
export const S_LEN = 28;
// (each rock's cohesion as a mass, Pa: how tall a sheer face of it stands: canyon walls)
const FREEZE_MIX = { methane: 20, ethane: 20 };   // (K: a mixture's freezing point under its main liquid's)
const ORGANIC_SAND = [0.075, 0.055, 0.035];   // (linear: tholin sand, dark brown)
const LAG_DUST = [0.13, 0.11, 0.09];           // (linear: an old icy surface's dark lag, ~0.2 albedo)

// creeks from the terrain tiles' drainage: a channel from this much rain-weighted water (m^2),
// water in it from this much
const CREEK_A = 6e4, CREEK_WET = 2.5e5;

// a small body's relief is held to this share of its drawn radius (TerrainGenerator.hScale)
export const RELIEF_MAX = 0.06;

const tmp4 = new Float64Array(4);

// canyons: where their walls' rock is read (side, share of d1 out), and how far a river moves
// across while it cuts down, by its rock (per metre down, at the meander model's mean rate): a
// soft bedded rock's bends grow as they deepen (ingrown meanders, slip-off slopes), a massive
// one's are held where they were (entrenched: both walls steep)
const SUITE_AT = [[1, 0.5], [1, 1], [-1, 0.5], [-1, 1]];
const KAPPA = [1.2, 0.8, 0.3, 1.5];   // (SUITES: sed, volc, xtal, loose)
// what the refinement's cells resolve of a canyon (cells across): its profile averaged that wide
// is the levels' dip
const CANYON_LAM = 1.5;

function smin(a, b, k) { const h = dm.clamp(0.5 + 0.5 * (b - a) / k, 0, 1); return b + (a - b) * h - k * h * (1 - h); }
function smax(a, b, k) { return -smin(-a, -b, k); }

// the refinement's river curves' bounds (for _refRiverAt): each one's middle (x, y, z) and the
// radius round it that holds its three control points (so the curve, inside their hull)
// the nearest point to (x, y, z) on a river record's curve (the quadratic through its three
// points at rec[b..b+8]): over eight chords, each projected onto; [squared distance, t]
const _nc = [0, 0];
export function nearestOnCurve(rec, b, x, y, z) {
  let bd = 1e30, bt = 0, px = rec[b], py = rec[b + 1], pz = rec[b + 2];
  for (let k = 1; k <= 8; k++) {
    const t = k / 8, a0 = (1 - t) * (1 - t), a1 = 2 * t * (1 - t), a2 = t * t;
    const qx = a0 * rec[b] + a1 * rec[b + 3] + a2 * rec[b + 6], qy = a0 * rec[b + 1] + a1 * rec[b + 4] + a2 * rec[b + 7], qz = a0 * rec[b + 2] + a1 * rec[b + 5] + a2 * rec[b + 8];
    const ux = qx - px, uy = qy - py, uz = qz - pz, L2 = ux * ux + uy * uy + uz * uz;
    const f = L2 > 0 ? Math.max(0, Math.min(1, ((x - px) * ux + (y - py) * uy + (z - pz) * uz) / L2)) : 0;
    const dx = px + f * ux - x, dy = py + f * uy - y, dz = pz + f * uz - z, d2 = dx * dx + dy * dy + dz * dz;
    if (d2 < bd) { bd = d2; bt = (k - 1 + f) / 8; }
    px = qx; py = qy; pz = qz;
  }
  _nc[0] = bd; _nc[1] = bt;
  return _nc;
}

// the same, its t then polished on the curve itself (Newton's steps on (P(t) - X).P'(t)): on the
// inside of a bend, off the sketch's chords, the nearest of them jumps from one to the next and
// t with it; on the curve it moves smoothly (out to the bend's own radius)
export function nearestOnCurveFine(rec, b, x, y, z) {
  let t = nearestOnCurve(rec, b, x, y, z)[1];
  const ax = rec[b] - 2 * rec[b + 3] + rec[b + 6], ay = rec[b + 1] - 2 * rec[b + 4] + rec[b + 7], az = rec[b + 2] - 2 * rec[b + 5] + rec[b + 8];
  const bx = rec[b + 3] - rec[b], by = rec[b + 4] - rec[b + 1], bz = rec[b + 5] - rec[b + 2];
  for (let it = 0; it < 3; it++) {
    // (P(t) = P0 + 2t B + t^2 A; P' = 2(B + t A); P'' = 2A)
    const px = rec[b] + 2 * t * bx + t * t * ax - x, py = rec[b + 1] + 2 * t * by + t * t * ay - y, pz = rec[b + 2] + 2 * t * bz + t * t * az - z;
    const dx = 2 * (bx + t * ax), dy = 2 * (by + t * ay), dz = 2 * (bz + t * az);
    const f = px * dx + py * dy + pz * dz, fp = dx * dx + dy * dy + dz * dz + 2 * (px * ax + py * ay + pz * az);
    if (fp <= 0) break;
    t = Math.max(0, Math.min(1, t - f / fp));
  }
  const px = rec[b] + 2 * t * bx + t * t * ax - x, py = rec[b + 1] + 2 * t * by + t * t * ay - y, pz = rec[b + 2] + 2 * t * bz + t * t * az - z;
  _nc[0] = px * px + py * py + pz * pz; _nc[1] = t;
  return _nc;
}

function riverBounds(Rv) {
  const rec = Rv.rec, n = rec.length / RIVER_REC, o = new Float64Array(n * 4);
  for (let r = 0; r < n; r++) {
    const b = r * RIVER_REC;
    const cx = 0.25 * (rec[b] + 2 * rec[b + 3] + rec[b + 6]), cy = 0.25 * (rec[b + 1] + 2 * rec[b + 4] + rec[b + 7]), cz = 0.25 * (rec[b + 2] + 2 * rec[b + 5] + rec[b + 8]);
    let m = 0;
    for (let k = 0; k < 9; k += 3) { const dx = rec[b + k] - cx, dy = rec[b + k + 1] - cy, dz = rec[b + k + 2] - cz; m = Math.max(m, dx * dx + dy * dy + dz * dz); }
    o[r * 4] = cx; o[r * 4 + 1] = cy; o[r * 4 + 2] = cz; o[r * 4 + 3] = Math.sqrt(m) * 1.0001;
  }
  return o;
}

// the great rivers' channel segments (refine.js bigChannels) in groups of eight per cell of the
// index: gs[c] the cell's first group, gb each group's middle (x, y, z), the radius round it
// that holds its segments' ends, and its widest half width
function channelGroups(Bg) {
  const n = Bg.start.length - 1, sg = Bg.seg, gs = new Int32Array(n + 1);
  for (let c = 0; c < n; c++) gs[c + 1] = gs[c] + Math.ceil((Bg.start[c + 1] - Bg.start[c]) / 8);
  const gb = new Float64Array(gs[n] * 5);
  for (let c = 0; c < n; c++) {
    const end = Bg.start[c + 1];
    for (let e0 = Bg.start[c], g = gs[c]; e0 < end; e0 += 8, g++) {
      const e1 = Math.min(e0 + 8, end);
      let cx = 0, cy = 0, cz = 0, m = 0, mh = 0;
      for (let e = e0; e < e1; e++) { const sb = Bg.idx[e] * BIG_REC; cx += sg[sb] + sg[sb + 3]; cy += sg[sb + 1] + sg[sb + 4]; cz += sg[sb + 2] + sg[sb + 5]; mh = Math.max(mh, sg[sb + 6]); }
      const k = 2 * (e1 - e0); cx /= k; cy /= k; cz /= k;
      for (let e = e0; e < e1; e++) {
        const sb = Bg.idx[e] * BIG_REC;
        for (let a = 0; a < 6; a += 3) { const dx = sg[sb + a] - cx, dy = sg[sb + a + 1] - cy, dz = sg[sb + a + 2] - cz; m = Math.max(m, dx * dx + dy * dy + dz * dz); }
      }
      const o = g * 5;
      gb[o] = cx; gb[o + 1] = cy; gb[o + 2] = cz; gb[o + 3] = Math.sqrt(m) * 1.0001; gb[o + 4] = mh;
    }
  }
  return { gs, gb };
}

export class TerrainGenerator {
  constructor(p) {
    this.p = p;
    this.R = p.R;
    // a simulated world (worldsim/snapshot.js): its heights and surfaces instead of noise
    this.snap = p.snapshot ? new SnapshotSampler(p.snapshot, this.R) : null;
    // its refinement (worldsim/refine.js): the surface its water cut, the sea's reach, the rock
    if (this.snap && p.refine) this.snap.attachRefine(p.refine);
    if (this.snap && p.pyr) this.snap.attachPyr(p.pyr);
    // heights drawn at HEIGHT_SCALE of the real ones (units.js: a range drawn narrower can't stand
    // as tall), unless the caller says (the world sim: real); and a small body's relief, a blob at
    // that, held to ~6% of the drawn radius
    let rel = p.relief || 3000;
    if (p.snapshot) { rel = 0; for (const v of p.snapshot.h) { const a = Math.abs(v); if (a > rel) rel = a; } }
    this.hScale = Math.min(p.heightScale ?? HEIGHT_SCALE, RELIEF_MAX * this.R / Math.max(1, rel));
    if (this.snap) this.snap._hs = this.hScale;   // (a refinement's heights are as drawn)
    // whether rivers and lakes hold anything now: a world too hot or cold for a surface liquid
    // keeps the valleys and basins its wetter past carved (dry channels, playas), empty
    this.wetNow = !!p.liquid && p.liquid !== 'lava';
    this.rockLin = ROCKS.map((r) => hexToLinear(r.color));
    const rng = new Rng(p.seed);
    this.nWarp = new Noise3(rng.seed32('warp'));
    this.nWarp2 = new Noise3(rng.seed32('warp2'));
    this.nCont = new Noise3(rng.seed32('cont'));
    this.nMount = new Noise3(rng.seed32('mount'));
    this.nHill = new Noise3(rng.seed32('hill'));
    this.nDetail = new Noise3(rng.seed32('detail'));
    this.nClimate = new Noise3(rng.seed32('climate'));
    this.nMisc = new Noise3(rng.seed32('misc'));
    this.craterSeed = rng.seed32('craters');
    this.coneSeed = rng.seed32('cones');

    // feature wavelengths (m)
    const R = p.R;
    this.lamMount = dm.clamp(R / 5, 15000, 140000);
    this.lamHill = dm.clamp(R / 28, 3000, 22000);
    this.lamDetail = 900;
    this.relief = p.relief;

    // plates
    const pr = rng.fork('plates');
    this.plates = [];
    const nPlates = p.tectonics > 0.05 ? p.plates : 0;
    for (let i = 0; i < nPlates; i++) {
      const c = pr.unitVector();
      const pole = pr.unitVector();
      const speed = pr.range(0.2, 1.0);
      this.plates.push({
        c, continental: pr.chance(0.42) ? 1 : -1,
        w: [pole[0] * speed, pole[1] * speed, pole[2] * speed],
      });
    }
    // shield volcanoes / hot spots
    const vr = rng.fork('volcanoes');
    this.volcanoes = [];
    const nV = Math.round(p.volcanism * vr.range(2, 9));
    for (let i = 0; i < nV; i++) {
      const c = vr.unitVector();
      const rad = vr.range(0.025, 0.09) * (R > 200000 ? 1 : 1.8);
      this.volcanoes.push({ c, rad, cosRad: dm.cos(rad * 1.6), height: this.relief * vr.range(0.5, 1.6), caldera: vr.range(0.12, 0.25) });
    }
    this.dichoAxis = rng.fork('dicho').unitVector();
    this.windAxis = rng.fork('wind').unitVector();
    this.contThreshold = 0;
    this.iceCapCut = 1 - (p.iceCover || 0);
    this.calibrate();
  }

  // Choose the coastline threshold so ocean area == requested fraction.
  calibrate() {
    const p = this.p;
    const N = 4096;
    const pts = fibonacciSphere(N);
    const vals = new Float64Array(N);
    const out = new Float64Array(S_LEN);
    for (let i = 0; i < N; i++) {
      vals[i] = this.continentalness(pts[i * 3], pts[i * 3 + 1], pts[i * 3 + 2], out);
    }
    const sorted = Array.from(vals).sort((a, b) => a - b);
    this.contMedian = sorted[N >> 1];
    this.contSpread = Math.max(1e-3, sorted[Math.floor(N * 0.95)] - sorted[Math.floor(N * 0.05)]);
    const f = p.ocean || 0;
    if (f <= 0) this.contThreshold = -1e9;
    else if (f >= 0.999) this.contThreshold = sorted[N - 1] + 1;
    else this.contThreshold = sorted[Math.min(N - 1, Math.floor(f * N))];
  }

  // Warped continental field (also writes plate info into out[S_MOUNT])
  continentalness(x, y, z, out) {
    const p = this.p;
    // domain warp
    const wf = 1.7;
    const wx = this.nWarp.fbm(x * wf, y * wf, z * wf, 3);
    const wy = this.nWarp.fbm(y * wf + 11.3, z * wf - 4.2, x * wf + 7.7, 3);
    const wz = this.nWarp.fbm(z * wf - 9.1, x * wf + 3.3, y * wf + 1.9, 3);
    const W = 0.22;
    let qx = x + W * wx, qy = y + W * wy, qz = z + W * wz;
    const ql = Math.sqrt(qx * qx + qy * qy + qz * qz);
    qx /= ql; qy /= ql; qz /= ql;
    this._qx = qx; this._qy = qy; this._qz = qz;

    const cf = p.continentFreq;
    let c = this.nCont.fbm(qx * cf, qy * cf, qz * cf, 6, 2.0, 0.52);

    // plates
    let mountMask = 0, plateBias = 0, divergent = 0, trench = 0;
    this._divergent = 0; this._trench = 0;
    const plates = this.plates;
    if (plates.length > 1) {
      let b1 = -2, b2 = -2, i1 = 0, i2 = 0;
      for (let i = 0; i < plates.length; i++) {
        const pc = plates[i].c;
        const d = qx * pc[0] + qy * pc[1] + qz * pc[2];
        if (d > b1) { b2 = b1; i2 = i1; b1 = d; i1 = i; } else if (d > b2) { b2 = d; i2 = i; }
      }
      const P1 = plates[i1], P2 = plates[i2];
      const bd = b1 - b2; // ~distance from the boundary
      // boundary normal: from plate 1 centre toward plate 2 centre (tangent)
      let nx = P2.c[0] - P1.c[0], ny = P2.c[1] - P1.c[1], nz = P2.c[2] - P1.c[2];
      const nd = nx * qx + ny * qy + nz * qz;
      nx -= nd * qx; ny -= nd * qy; nz -= nd * qz;
      const nl = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
      nx /= nl; ny /= nl; nz /= nl;
      // surface velocities v = w x q
      const w1 = P1.w, w2 = P2.w;
      const v1x = w1[1] * qz - w1[2] * qy, v1y = w1[2] * qx - w1[0] * qz, v1z = w1[0] * qy - w1[1] * qx;
      const v2x = w2[1] * qz - w2[2] * qy, v2y = w2[2] * qx - w2[0] * qz, v2z = w2[0] * qy - w2[1] * qx;
      const conv = ((v1x - v2x) * nx + (v1y - v2y) * ny + (v1z - v2z) * nz); // >0: plates collide
      const t = p.tectonics;
      const near = dm.exp(-bd / 0.11);
      const nearTight = dm.exp(-bd / 0.035);
      const bothCont = P1.continental > 0 && P2.continental > 0;
      if (conv > 0) {
        mountMask = Math.min(1, conv * 1.6) * near * t * (bothCont ? 1.0 : 0.75);
        if (!bothCont && (P1.continental < 0)) trench = Math.min(1, conv * 2) * nearTight * t; // subducting ocean plate
      } else divergent = Math.min(1, -conv * 1.6) * nearTight * t;
      // continental plates raise the continental field, blended across boundaries
      const blend = dm.smoothstep(0, 0.12, bd);
      plateBias = (P1.continental * blend + (P1.continental + P2.continental) * 0.5 * (1 - blend)) * 0.22 * t;
    }
    c += plateBias;
    out[S_MOUNT] = mountMask;
    this._divergent = divergent;
    this._trench = trench;
    return c;
  }

  // Full sample. minWavelength (m) band-limits the fine octaves.
  sample(x, y, z, minWavelength, out) {
    this._sampleW = minWavelength;   // (the last sample's detail: shadeSnap's forest stands, near or far)
    const o = this.snap ? this.sampleSnap(x, y, z, minWavelength, out) : this.sampleNoise(x, y, z, minWavelength, out);
    if (this.hScale < 1) { o[S_H] *= this.hScale; o[S_WDEPTH] *= this.hScale; o[S_RDEP] *= this.hScale; if (o[S_WLVL] > -1e8) o[S_WLVL] *= this.hScale; }
    return o;
  }

  sampleNoise(x, y, z, minWavelength, out) {
    const p = this.p;
    const R = this.R;
    const relief = this.relief;
    for (let i = 0; i < S_LEN; i++) out[i] = 0;
    out[S_DX] = x; out[S_DY] = y; out[S_DZ] = z; out[S_WLVL] = -1e9;

    const c = this.continentalness(x, y, z, out);
    const qx = this._qx, qy = this._qy, qz = this._qz;
    const plateMount = out[S_MOUNT], divergent = this._divergent, trench = this._trench;
    const t = this.contThreshold;
    const hasSea = t > -1e8;
    const inland = hasSea ? dm.clamp((c - t) / (this.contSpread * 0.5), 0, 1) : dm.clamp(0.5 + (c - this.contMedian) / this.contSpread, 0, 1);
    out[S_INLAND] = inland;

    // ---- base elevation from the continental field (hypsometry)
    let h;
    const tect = p.tectonics;
    if (hasSea) {
      const dc = c - t;
      if (dc < 0) {
        const deep = dm.smoothstep(0, this.contSpread * 0.35, -dc);
        h = -120 - 4300 * deep * (0.6 + 0.4 * tect);
        h += 1800 * divergent; // mid-ocean ridges
      } else {
        h = 25 + 650 * dm.smoothstep(0, this.contSpread * 0.6, dc);
      }
    } else {
      h = (c - this.contMedian) / this.contSpread * relief * 0.35;
    }
    // hemispheric dichotomy (Mars-like crustal asymmetry)
    if (p.dichotomy > 0) {
      const dd = x * this.dichoAxis[0] + y * this.dichoAxis[1] + z * this.dichoAxis[2];
      h += p.dichotomy * relief * 0.3 * dm.smoothstep(-0.3, 0.4, dd + 0.15 * this.nMisc.noise(x * 3, y * 3, z * 3));
    }

    // ---- mountains: tectonic belts + inherited old orogens
    const mf = R / this.lamMount;
    const oldBelt = dm.smoothstep(0.62, 0.86, 1 - Math.abs(this.nMount.noise(qx * 2.3 + 5, qy * 2.3, qz * 2.3 - 3))) * 0.55;
    let mMask = dm.clamp(plateMount * 1.25 + oldBelt * (0.35 + 0.65 * (1 - tect)), 0, 1);
    if (!hasSea) mMask = Math.max(mMask, dm.smoothstep(0.15, 0.6, this.nMount.fbm(qx * 1.5, qy * 1.5, qz * 1.5, 3)) * 0.8);
    out[S_MOUNT] = mMask;
    if (mMask > 0.01) {
      // ridged multifractal (Musgrave)
      let sum = 0, weight = 1, amp = 1, norm = 0;
      let fx = qx * mf, fy = qy * mf, fz = qz * mf;
      let lam = this.lamMount;
      for (let o = 0; o < 10; o++) {
        if (lam < minWavelength) break;
        const fade = dm.smoothstep(minWavelength, minWavelength * 2, lam);
        let sgn = 1 - Math.abs(this.nMount.noise(fx, fy, fz));
        sgn *= sgn;
        sgn *= weight;
        weight = dm.clamp(sgn * 2.1, 0, 1);
        sum += sgn * amp * fade;
        norm += amp;
        amp *= 0.5;
        lam *= 0.5;
        const nx = ROT[0] * fx + ROT[1] * fy + ROT[2] * fz, ny = ROT[3] * fx + ROT[4] * fy + ROT[5] * fz, nz = ROT[6] * fx + ROT[7] * fy + ROT[8] * fz;
        fx = nx * 2.03 + 3.1; fy = ny * 2.03 - 1.7; fz = nz * 2.03 + 0.9;
      }
      h += relief * 1.05 * mMask * mMask * (sum / Math.max(norm, 1e-9));
    }
    if (hasSea && trench > 0) h -= 4500 * trench;

    // ---- hills: derivative-damped ("eroded") fBm
    {
      const hf = R / this.lamHill;
      let fx = x * hf, fy = y * hf, fz = z * hf;
      let nxs = x, nys = y, nzs = z; // track the radial axis through octave rotations
      let sum = 0, amp = 1, dx = 0, dy = 0, dz = 0;
      let lam = this.lamHill;
      const ero = p.erosion;
      for (let o = 0; o < 8; o++) {
        if (lam < minWavelength) break;
        const fade = dm.smoothstep(minWavelength, minWavelength * 2, lam);
        this.nHill.noised(fx, fy, fz, tmp4);
        // tangent component of the gradient
        const dr = tmp4[1] * nxs + tmp4[2] * nys + tmp4[3] * nzs;
        dx += tmp4[1] - dr * nxs; dy += tmp4[2] - dr * nys; dz += tmp4[3] - dr * nzs;
        const damp = 1 / (1 + ero * 1.6 * (dx * dx + dy * dy + dz * dz));
        sum += amp * tmp4[0] * damp * fade;
        amp *= 0.5;
        lam *= 0.5;
        const nx = ROT[0] * fx + ROT[1] * fy + ROT[2] * fz, ny = ROT[3] * fx + ROT[4] * fy + ROT[5] * fz, nz = ROT[6] * fx + ROT[7] * fy + ROT[8] * fz;
        fx = nx * 2.0 + 1.3; fy = ny * 2.0 + 2.9; fz = nz * 2.0 - 4.1;
        const rx = ROT[0] * nxs + ROT[1] * nys + ROT[2] * nzs, ry = ROT[3] * nxs + ROT[4] * nys + ROT[5] * nzs, rz = ROT[6] * nxs + ROT[7] * nys + ROT[8] * nzs;
        nxs = rx; nys = ry; nzs = rz;
      }
      const landF = hasSea ? (0.35 + 0.65 * dm.smoothstep(-0.02, 0.08, (c - t) / this.contSpread)) : 1;
      h += sum * relief * 0.085 * (0.6 + 0.8 * mMask) * landF * p.roughness;
    }

    // ---- maria: large smooth dark basins (airless rocky bodies)
    if (p.maria > 0) {
      const mn = this.nMisc.fbm(qx * 1.6 + 7, qy * 1.6, qz * 1.6, 4);
      const mare = dm.smoothstep(0.45 - p.maria * 0.4, 0.55 - p.maria * 0.4, mn);
      if (mare > 0) {
        h = h * (1 - 0.8 * mare) - relief * 0.12 * mare;
        out[S_MARE] = mare;
      }
    }

    // ---- canyons: long sinuous rifts
    if (p.canyons > 0) {
      const cn = this.nMisc.fbm(qx * 2.2 - 3, qy * 2.2 + 8, qz * 2.2 + 1, 4);
      const line = 1 - dm.smoothstep(0.0, 0.035, Math.abs(cn));
      const where = dm.smoothstep(0.1, 0.35, this.nMisc.noise(qx * 1.3 + 20, qy * 1.3, qz * 1.3));
      const k = line * where * p.canyons;
      if (k > 0) h -= k * relief * 0.55;
    }

    // ---- shield volcanoes
    for (let i = 0; i < this.volcanoes.length; i++) {
      const v = this.volcanoes[i];
      const dd = x * v.c[0] + y * v.c[1] + z * v.c[2];
      if (dd < v.cosRad) continue;
      const ang = dm.acos(Math.min(1, dd));
      // irregular outline + radial lava-flow ridges
      const wob = 0.28 * this.nMisc.noise(x * 30 + i, y * 30, z * 30) + 0.12 * this.nMisc.noise(x * 140, y * 140 + i, z * 140);
      const r = ang / v.rad * (1 + wob);
      if (r < 1.6) {
        const shield = dm.pow(Math.max(0, 1 - r / 1.6), 1.7);
        const cal = dm.smoothstep(v.caldera, v.caldera * 0.7, r);
        h += v.height * shield - v.height * 0.18 * cal;
        out[S_VOLC] = Math.max(out[S_VOLC], dm.smoothstep(1.6, 0.3, r) * (0.5 + 0.5 * this.nMisc.noise(x * 60, y * 60, z * 60)));
        if (p.liquid === 'lava' && r < v.caldera) out[S_LAVA] = Math.max(out[S_LAVA], 0.8);
      }
    }

    // ---- craters
    if (p.craters > 0.01) h += this.craters(x, y, z, minWavelength, out);

    // ---- dunes (arid regions)
    if (p.dunes > 0) {
      const wa = this.windAxis;
      const along = (x * wa[0] + y * wa[1] + z * wa[2]) * R / 1400;
      if (minWavelength < 700) {
        const ph = along + 2.5 * this.nMisc.noise(x * R / 6000, y * R / 6000, z * R / 6000);
        const s = ph - Math.floor(ph);
        const dune = s < 0.75 ? s / 0.75 : (1 - s) / 0.25; // asymmetric: gentle windward, steep lee
        const field = dm.smoothstep(0.0, 0.3, this.nMisc.noise(x * 9 + 2, y * 9, z * 9 - 5)) * (1 - mMask);
        h += dune * dune * 70 * p.dunes * field * dm.smoothstep(minWavelength, minWavelength * 2, 700);
      }
    }

    // ---- mesas / terraces in arid uplands
    if (p.mesas > 0 && h > 0) {
      const step = 180 + 120 * this.nMisc.noise(x * 4, y * 4, z * 4);
      const k = dm.smoothstep(0.2, 0.5, this.nMisc.noise(qx * 5 + 9, qy * 5, qz * 5)) * p.mesas;
      if (k > 0) {
        const hs = h / step;
        const fl = Math.floor(hs), fr = hs - fl;
        const terr = (fl + dm.smoothstep(0.75, 0.95, fr)) * step;
        h = h + (terr - h) * k;
      }
    }

    // ---- ice lineae (Europa-style double ridges with stained margins)
    if (p.lineae > 0) {
      const ln = this.nMisc.noise(qx * 9, qy * 9, qz * 9) + 0.5 * this.nMisc.noise(qx * 21 + 4, qy * 21, qz * 21);
      const lineF = 1 - dm.smoothstep(0, 0.04, Math.abs(ln));
      h += lineF * 120 * p.lineae;
      out[S_LINEAE] = (1 - dm.smoothstep(0, 0.09, Math.abs(ln))) * p.lineae;
    }

    // ---- fine fractal detail
    const rough = dm.clamp(0.35 + 0.85 * mMask + 0.25 * this.nDetail.noise(x * 37, y * 37, z * 37), 0.1, 1.4) * p.roughness;
    out[S_ROUGH] = rough;
    {
      const df = R / this.lamDetail;
      let fx = x * df, fy = y * df, fz = z * df;
      let lam = this.lamDetail, amp = relief * 0.010 * rough;
      let sum = 0;
      for (let o = 0; o < 11; o++) {
        if (lam < minWavelength) break;
        const fade = dm.smoothstep(minWavelength, minWavelength * 2, lam);
        sum += amp * this.nDetail.noise(fx, fy, fz) * fade;
        amp *= 0.57; // H ~ 0.8
        lam *= 0.5;
        const nx = ROT[0] * fx + ROT[1] * fy + ROT[2] * fz, ny = ROT[3] * fx + ROT[4] * fy + ROT[5] * fz, nz = ROT[6] * fx + ROT[7] * fy + ROT[8] * fz;
        fx = nx * 2.0 - 0.7; fy = ny * 2.0 + 1.1; fz = nz * 2.0 + 2.3;
      }
      // flatten details on coastal plains and sea floors a little
      h += sum * (h < 0 ? 0.5 : 1);
    }

    out[S_H] = h;
    out[S_VARIANT] = this.nClimate.fbm(x * 6 + 3, y * 6, z * 6, 3);
    this.climate(x, y, z, h, inland, out);
    if (p.liquid === 'lava' && h < 0) out[S_LAVA] = 1;
    return out;
  }

  // a locked world's day-side sun where cp is the cosine of the star's angle from overhead, averaged
  // over its libration's swing (climate)
  _lockedLit(cp) {
    const A = this.p.climate.libration || 0;
    if (!(A > 0)) return Math.max(cp, 0);
    const th = dm.acos(dm.clamp(cp, -1, 1)), lo = th - A, hi = Math.min(th + A, dm.PI / 2);
    return hi > lo ? (dm.sin(hi) - dm.sin(lo)) / (2 * A) : 0;
  }

  // Annual-mean temperature and moisture
  climate(x, y, z, h, inland, out) {
    const cl = this.p.climate;
    let rel;
    if (cl.locked) {
      const ss = cl.substellar;
      const cp = x * ss[0] + y * ss[1] + z * ss[2];
      // (its sun averaged over its libration's swing, A either way (system.js): ground near the
      // terminator is lit part of each orbit, so the day side's warmth fades over a band of it; a
      // fixed line had drawn a ruler-straight edge, pole to pole, where an icy world's sublimed lag
      // begins)
      rel = (1 - cl.dayNight) + cl.dayNight * (4 * this._lockedLit(cp) + 0.02);
    } else {
      const P2 = (3 * y * y - 1) / 2;
      rel = 1 + cl.s2 * P2 * cl.transport;
    }
    let T = cl.Tmean * dm.pow(Math.max(rel, 0.002), 0.25);
    T -= cl.lapse * Math.max(h, 0);
    T += 2.5 * this.nClimate.noise(x * 3, y * 3, z * 3);
    out[S_TEMP] = T;
    let W = 0;
    if (cl.wet > 0) {
      let band;
      if (cl.locked) {
        const ss = cl.substellar;
        const cp = x * ss[0] + y * ss[1] + z * ss[2];
        band = 0.25 + 0.75 * dm.smoothstep(-0.2, 0.7, cp);
      } else {
        const lat = Math.abs(dm.asin(dm.clamp(y, -1, 1)));
        band = 0.5 + 0.5 * dm.cos(2 * cl.hadley * lat) * (1 - 0.35 * lat / dm.HALF_PI);
      }
      W = cl.wet * (0.38 + 0.72 * band) * (1 - 0.45 * inland) + 0.22 * this.nClimate.fbm(x * 8 - 2, y * 8, z * 8 + 5, 3);
      W = dm.clamp(W, 0, 1);
    }
    out[S_MOIST] = W;
  }

  // Multi-scale crater field on a 3D lattice around the unit sphere
  craters(x, y, z, minWavelength, out) {
    const p = this.p;
    const R = this.R;
    let dh = 0;
    let floorDark = 0, ray = 0;
    // cell sizes in metres from large basins to small pits
    let cell = Math.min(R * 0.5, 180000);
    for (let level = 0; level < 9; level++, cell *= 0.5) {
      if (cell < minWavelength * 1.5) break;
      if (cell < 6) break;
      const s = cell / R; // cell size in unit-sphere units
      const gx = x / s, gy = y / s, gz = z / s;
      const ix = Math.floor(gx), iy = Math.floor(gy), iz = Math.floor(gz);
      const ox = gx - ix < 0.5 ? -1 : 1, oy = gy - iy < 0.5 ? -1 : 1, oz = gz - iz < 0.5 ? -1 : 1;
      // power-law size frequency: more small craters, density set by surface age
      const prob = p.craters * (0.22 + 0.09 * level);
      for (let k = 0; k < 8; k++) {
        const cx = ix + ((k & 1) ? ox : 0), cy = iy + ((k & 2) ? oy : 0), cz = iz + ((k & 4) ? oz : 0);
        const hsh = hash3i(cx, cy, cz, this.craterSeed + level * 977);
        if ((hsh & 0xffff) / 65536 > prob) continue;
        const h2 = hash3i(cx, cy, cz, this.craterSeed ^ 0x55aa + level);
        const h3 = hash3i(cz, cx, cy, this.craterSeed ^ 0x1234 + level);
        // centre inside the cell, radius <= 0.5 cell incl. ejecta
        const px = (cx + 0.25 + 0.5 * ((h2 & 0xff) / 255)) * s;
        const py = (cy + 0.25 + 0.5 * (((h2 >>> 8) & 0xff) / 255)) * s;
        const pz = (cz + 0.25 + 0.5 * (((h2 >>> 16) & 0xff) / 255)) * s;
        const pl = Math.sqrt(px * px + py * py + pz * pz);
        if (pl < 1e-9) continue;
        const ux = px / pl, uy = py / pl, uz = pz / pl;
        // skip lattice points whose projection is far from the surface
        if (Math.abs(pl - 1) > s * 0.9) continue;
        const rad = s * (0.12 + 0.2 * (((h2 >>> 24) & 0xff) / 255)); // crater radius (unit sphere)
        const ddx = x - ux, ddy = y - uy, ddz = z - uz;
        const dist = Math.sqrt(ddx * ddx + ddy * ddy + ddz * ddz);
        const r = dist / rad;
        if (r > 2.2) continue;
        const radM = rad * R;
        const fresh = (h3 & 0xff) / 255;
        const depth = radM * (radM > 8000 ? 0.12 : 0.36) * (0.4 + 0.6 * fresh);
        // bowl with flat floor + raised rim (smooth min/max blend)
        const cavity = r * r - 1;
        const floorH = -0.55 + 0.25 * (radM > 8000 ? 1 : 0);
        const rimX = Math.min(r - 1 - 0.38, 0);
        const rim = 3.2 * rimX * rimX;
        let shape = smax(cavity, floorH, 0.35);
        shape = smin(shape, rim, 0.25);
        // ejecta blanket fade-out
        const fade = 1 - dm.smoothstep(1.4, 2.2, r);
        dh += shape * depth * fade;
        // central peak for complex craters
        if (radM > 9000 && r < 0.3) dh += depth * 0.45 * (1 - r / 0.3) * (1 - r / 0.3);
        if (r < 1) floorDark = Math.max(floorDark, (1 - r) * (radM > 20000 ? 0.6 : 0.25));
        // rays from fresh craters
        if (fresh > 0.82 && r > 0.9 && r < 5) {
          const ang = (ddx * 13.1 + ddy * 7.7 + ddz * 3.3) / (dist + 1e-9);
          const rr = 0.5 + 0.5 * dm.sin(ang * 23 + (h3 >>> 8));
          ray = Math.max(ray, rr * rr * (1 - dm.smoothstep(1, 4.5, r)) * (fresh - 0.82) * 5);
        }
      }
    }
    out[S_CRATER] = Math.max(out[S_CRATER], floorDark);
    out[S_RAY] = Math.max(out[S_RAY], ray);
    return dh;
  }

  // Surface colour and material weights from a sample and the local slope.
  // slope: 1 - dot(normal, up) (0 flat .. 1 vertical). Writes to col (rgb) and mat:
  // mat[0]=vegetation, mat[1]=snow/ice, mat[2]=rock, mat[3]=sand, mat[4]=water depth (m, >0 = liquid),
  // mat[5]=emissive (lava), mat[6]=wetness/specular. nrm (optional): the surface's normal (body
  // axes), for which way it faces
  shade(s, slope, col, mat, nrm) {
    if (this.snap) return this.shadeSnap(s, slope, col, mat, nrm);
    return this.shadeNoise(s, slope, col, mat);
  }

  // ---- a simulated world (worldsim/snapshot.js): heights from the sim, with detail below
  // its grid's spacing as rugged as the simulated relief there; lakes level at their
  // surfaces; the climate from the sim's (else the generator's)
  sampleSnap(x, y, z, minWavelength, out) {
    const p = this.p, S = this.snap, R = this.R;
    this._minW = minWavelength;   // (the rivers' meanders: only where they can be seen)
    for (let i = 0; i < S_LEN; i++) out[i] = 0;
    out[S_DX] = x; out[S_DY] = y; out[S_DZ] = z; out[S_WLVL] = -1e9;
    // (the world's refinement where it has one: the world sim's surface with what its water cut)
    const ref = S.ref && S.ref.sample(S._d(x, y, z)) ? S.ref : null;
    let h = ref ? ref.h / this.hScale : S.h(x, y, z);
    const hRef = h;
    // (and the finer levels of the terrain's tiles where there are any, each blended in by how
    // fully it covers the point: they fade into the coarser at the edges of what's been made)
    let sea = ref ? ref.sea : -1, lakeF = ref ? ref.lake : -1, finest = ref ? S.refCell : 0, finRd = null;
    // (each level's cut (twice its cell: the wavelengths it simulates) and how fully it covers
    // the point, for the detail below to leave out what it holds by as much: at a tile's edge the
    // detail fades in as the tile fades out, not all at once along a line)
    const cuts = this._cuts || (this._cuts = new Float64Array(8)), cw = this._cw || (this._cw = new Float64Array(8));
    let nc = 0;
    if (ref) { cuts[0] = 2 * S.refCell; cw[0] = 1; nc = 1; }
    if (S.pyr) for (const rd of S.pyrReaders()) {
      // (every level at every sampling, however coarse: a finer level wears down the sharp points
      // the level above leaves at its cells' scale, and read from afar without it they stood as cones)
      if (!rd.sample(S._d(x, y, z))) continue;
      h += (rd.h / this.hScale - h) * rd.w;
      sea = sea < 0 ? rd.sea : sea + (rd.sea - sea) * rd.w;
      lakeF = lakeF < 0 ? rd.lake : lakeF + (rd.lake - lakeF) * rd.w;
      if (rd.w > 0.5) { finest = rd.cell; finRd = rd; }
      if (nc < 8) { cuts[nc] = 2 * rd.cell; cw[nc++] = rd.w; }
    }
    // (how much of the octave at lam the levels leave to the detail: soft, faded over the octave
    // below each cut, as the grain is; else all of those at or past a cut held by it)
    const keep = (lam, soft) => {
      let k = 1;
      for (let i = 0; i < nc; i++) k *= 1 - cw[i] * (soft ? 1 - dm.smoothstep(cuts[i], 0.5 * cuts[i], lam) : lam >= cuts[i] ? 1 : 0);
      return k;
    };
    const h0 = h;
    const rel = S.relief(x, y, z);
    const mMask = dm.smoothstep(400, 2500, rel);
    out[S_MOUNT] = mMask;
    // (at true scale (unless p.trueScale is false), the ground layer's own relief (ground.js: its span in ~20
    // km), at each wavelength by the roughness's scaling; else the world sim's cells' relief)
    const gT = (p.trueScale ?? TRUE_SCALE) && S.s.gLr ? S.ground(x, y, z, this._gro || (this._gro = {})) : null;
    // (the ground layer's relief is drawn metres, as the true scale is: by the height scale here, so
    // it's as much once the heights are drawn)
    const amp = gT ? dm.clamp(gT.lr / 4 * dm.pow(S.G.spacing / 20000, 0.55), 3, 500) / this.hScale : dm.clamp(rel * 0.3, 12, 900);
    let calm = 1;
    // hills from the grid's spacing down (derivative-damped: eroded-looking); with a
    // refinement, only those finer than it resolves
    {
      // (none on a sand sea: blown sand is smooth)
      if (S.s.dunes) calm = 1 - dm.smoothstep(0.15, 0.5, S.duneMask(x, y, z));
      const lam0 = S.G.spacing;
      const hf = R / lam0;
      let fx = x * hf, fy = y * hf, fz = z * hf, nxs = x, nys = y, nzs = z;
      let sum = 0, a = 1, dx = 0, dy = 0, dz = 0, lam = lam0;
      for (let o = 0; o < 9; o++) {
        if (lam < minWavelength) break;
        const fade = dm.smoothstep(minWavelength, minWavelength * 2, lam);
        this.nHill.noised(fx, fy, fz, tmp4);
        const dr = tmp4[1] * nxs + tmp4[2] * nys + tmp4[3] * nzs;
        dx += tmp4[1] - dr * nxs; dy += tmp4[2] - dr * nys; dz += tmp4[3] - dr * nzs;
        const kp = keep(lam, false);
        if (kp > 0) sum += a * tmp4[0] * fade * kp / (1 + 1.6 * (dx * dx + dy * dy + dz * dz));
        a *= 0.5; lam *= 0.5;
        const nx = ROT[0] * fx + ROT[1] * fy + ROT[2] * fz, ny = ROT[3] * fx + ROT[4] * fy + ROT[5] * fz, nz = ROT[6] * fx + ROT[7] * fy + ROT[8] * fz;
        fx = nx * 2.0 + 1.3; fy = ny * 2.0 + 2.9; fz = nz * 2.0 - 4.1;
        const rx = ROT[0] * nxs + ROT[1] * nys + ROT[2] * nzs, ry = ROT[3] * nxs + ROT[4] * nys + ROT[5] * nzs, rz = ROT[6] * nxs + ROT[7] * nys + ROT[8] * nzs;
        nxs = rx; nys = ry; nzs = rz;
      }
      h += sum * amp * (h < 0 ? 0.4 : 1) * calm;
    }
    const rough = dm.clamp(0.3 + 0.9 * mMask, 0.1, 1.4) * (p.roughness ?? 1);
    out[S_ROUGH] = rough;
    {
      // (the ground's grain below what the terrain's levels simulate: none of its features)
      const df = R / this.lamDetail;
      let fx = x * df, fy = y * df, fz = z * df, lam = this.lamDetail, a = (gT ? dm.clamp(gT.lr / 4 * dm.pow(this.lamDetail / 20000, 0.55), 1, 120) / this.hScale : (p.relief || 3000) * 0.006) * rough, sum = 0;
      for (let o = 0; o < 11; o++) {
        if (lam < minWavelength) break;
        const kp = keep(lam, true);
        if (kp > 0) sum += a * this.nDetail.noise(fx, fy, fz) * dm.smoothstep(minWavelength, minWavelength * 2, lam) * kp;
        a *= 0.57; lam *= 0.5;
        const nx = ROT[0] * fx + ROT[1] * fy + ROT[2] * fz, ny = ROT[3] * fx + ROT[4] * fy + ROT[5] * fz, nz = ROT[6] * fx + ROT[7] * fy + ROT[8] * fz;
        fx = nx * 2.0 - 0.7; fy = ny * 2.0 + 1.1; fz = nz * 2.0 + 2.3;
      }
      h += sum * (h < 0 ? 0.5 : 1) * calm;
    }
    // a lake's surface is level and fills its basin out to the contour of its level (looked
    // up a little off true, so shores wander rather than follow the sim's cells), inside a
    // rim where the ground rises above it before the basin ends; the bed under it is the
    // ground, kept below the surface in the lake's own cells (a shallow lake stays one sheet
    // of water). A dip below the datum far from the sea stays dry.
    // (the glaciers' ice here: under it no rivers run and no lakes stand, below)
    const it = S.hasIce ? S.iceTop(x, y, z) : null, iceH = it ? it.H : 0, itHb = it ? it.hb : 0;
    const lk = iceH > 30 ? null : this._lakeAt(x, y, z);
    if (lk) {
      // (in its own cells kept under the water where the terrain's tiles have the lake too: its
      // shore their outline and the ground's contour, not the world sim's cell)
      if (lk.own) h += (Math.min(h, lk.L - 0.5) - h) * (lakeF < 0 ? 1 : dm.smoothstep(0.3, 0.7, lakeF));
      else h += Math.max(0, lk.L + 2 - h) * dm.smoothstep(0.55, 0.95, lk.q);
    }
    const flooded = lk && h < lk.L;
    if (lk && this.wetNow) out[S_WLVL] = lk.L;
    // rivers: a channel along the sim's river lines (meandering), as wide and deep as its
    // water, in a valley that levels off to its banks; the banks (and the water a little
    // below them) follow the sim's heights along the line, so the water only runs downhill
    let wl = -1e9;
    let rv = iceH > 30 ? null : this._riverAt(x, y, z);
    // (where its line runs below the sea it's drowned: the sea's, its valley already cut through
    // the low sea's ages (the refinement's). Its banks held up to the datum built levees out
    // across the shelf, drawn as canals in the sea; it fades out over its last few metres)
    const rvK = rv && this.wetNow && rv.hs < 0 ? 1 - dm.smoothstep(0, 3, -rv.hs) : 1;
    if (rvK <= 0) rv = null;
    // rivers entrenched in a dry land: canyons (_canyons)
    // (inside one, its floor is the river's floodplain: it lays none of its own, nor oxbows)
    let cyK = 0;
    if (S.riv && S.ref && iceH <= 30) { h = this._canyons(h, h0, hRef, minWavelength, x, y, z); cyK = this._cyK; if (finRd) finRd.sample(S._d(x, y, z)); }
    // (the wet ground along it, for the shading: only where water runs now; a dry world's old
    // channels are valleys in its dust, not dark strokes)
    // (a river narrower than the sampling's spacing is drawn as wide as it, below, so it shows as
    // a line from afar, not as the few samples that happen to land in it; but one many times
    // narrower than the line it would make fades out: from orbit the great rivers show, not
    // every stream on the land as a vein of water)
    const rvOwn = rv ? rv.w * 0.5 : 0, rvWide = rv && this.wetNow ? Math.max(rvOwn, 0.75 * minWavelength) : rvOwn;
    const rvFade = rv && this.wetNow ? dm.smoothstep(4, 16, rvWide / Math.max(rvOwn, 1e-3)) : 0;
    let rvWl = -1e9, rvSt = -1e9, ckWl = -1e9, drowned = false;
    const hPreRv = h;
    if (rv) {
      // (a meandering river's floodplain: the belt it has swung across, laid level near its banks;
      // and the loops it cut off, lakes while young, swales once filled)
      // (where it braids, the plain between its threads is the bars', a quarter of its depth under its
      // banks: a little above its usual stage (_riverWater's, ~0.45 of its depth under them), as bars
      // stand at middling flows, not a floodplain at its banks. Barely above its water the shore wandered
      // with every wobble of the ground's heights, in teeth the mesh's size)
      const brK = dm.smoothstep(0, 1, rv.nb || 0), brDrop = brK * 0.25 * (rv.depth0 || rv.depth);
      const bank0 = this._bankOf(rv) - brDrop - 0.5 * brK;
      // (where its line has gone under the sea it builds nothing there: no floodplain or banks laid up
      // to the datum (they stood as levees across the shelf), only its channel cut into the sea's floor)
      drowned = this.wetNow && rv.hs < 0 && !!p.liquid && this.contThreshold > -1e8;
      if (!drowned && rv.belt > 0 && rv.axis < 1.3 * rv.belt && cyK < 1) h += rvK * (1 - cyK) * this._flooded(rv, bank0 + 0.5 - h) * 0.85 * dm.smoothstep(1.3 * rv.belt, 0.85 * rv.belt, rv.axis);
      const oh = 0.5 * (rv.oxW || rv.w);
      if (rv.ox < oh && rv.oxAge < 0.8 && cyK < 0.5) {
        const q = 1 - (rv.ox / oh) * (rv.ox / oh), dep = rv.depth * 0.6 * (1 - rv.oxAge);
        h += rvK * (1 - 2 * cyK) * (Math.min(h, bank0 - dep * q) - h);
        if (this.wetNow && rv.oxAge < 0.5 && rvK >= 1 && cyK < 0.05) wl = Math.max(wl, bank0 - 0.8 - 0.3 * dep);
      }
    }
    if (rv) {
      // (a river narrower than the sampling's spacing drawn as wide as it, so it shows as a line
      // from afar, not as the few samples that happen to land in it; its own width near. A dry
      // world's old channel isn't: it's no wider than it is, a valley you see when you're near,
      // not a one-sample trench that shades as a dark stitched line from afar)
      // (0.75 of the spacing each side: a line at any angle has a sample within that of it, where
      // half the spacing leaves a diagonal one dotted)
      // (and fading out from afar: its channel shallower and its water paler, to nothing)
      const half = rvWide, flank = Math.max(rv.w * 1.5 + S.G.spacing * (0.02 + 0.12 * rv.k), 1.25 * half);
      if (rv.dist < flank) {
        const bank = this._bankOf(rv), brB = dm.smoothstep(0, 1, rv.nb || 0) * 0.25 * (rv.depth0 || rv.depth);
        if (!drowned) h += rvK * (1 - cyK) * this._banked(rv, bank - brB - h, x, y, z, half) * dm.smoothstep(flank, half * 1.2, rv.dist);
        // (its water's level, beside it too: where the shore meets it. A river runs below its banks
        // most of the time: its usual stage about half its channel's depth, so its water fills ~70% of
        // the channel's width, the channel's own banks and bars standing above it)
        const stage = Math.max(bank - 0.45 * (rv.depth0 || rv.depth) - 0.3, 0.3);
        if (this.wetNow) rvSt = stage;
        if (this.wetNow && rvK >= 1) out[S_WLVL] = Math.max(out[S_WLVL], stage);
        if (rv.dist < half && rvFade < 1) {
          h += rvK * (1 - rvFade) * (Math.min(h, bank - rv.depth * this._bedShape(rv, x, y, z, half)) - h);
          if (this.wetNow && rvK >= 1) {
            wl = rvWl = stage;
            out[S_RDEP] = rv.depth0 || rv.depth;
            // (and how it runs: down its channel, at its section's speed: _riverWater)
            out[S_FLX] = rv.fx || 0; out[S_FLY] = rv.fy || 0; out[S_FLZ] = rv.fz || 0;
            out[S_FLV] = this._riverWater(0.5 * rv.w / (1 + 0.12 * (rv.c || 0)), rv.c || 0, rv.hs, rv.slope || 0, this._rwS || (this._rwS = {})).v;
          }
        }
      }
    }
    // (how far the river raised the ground here, its floodplain and banks built up to its level: the
    // creeks crossing them are built up with them, as a floodplain's tributaries are; cut at their own
    // level they stood in trenches metres deep through it. And they give way to it over a width or so
    // beside it (none within its width: switched off at a line, the ground stepped there))
    const rvRise = Math.max(0, h - hPreRv), ckNear = rv ? dm.smoothstep(rv.w, 2 * rv.w, rv.dist) : 1;
    // creeks: where the finest level of the terrain's tiles gathers its own water (finer than the
    // world sim's rivers): a channel along each of its drainage lines, as wide and deep as its
    // water (a creek of ~0.1 km^2 a metre wide, a stream of tens of km^2 ten or more), its banks
    // the ground along the line (the valley the tile's water cut), water in it where it lasts
    // (and first, its own channels read as lines: a channel running diagonally across its cells
    // is read between them as a row of saddles (localsim.js reads the level above's the same
    // way); near one the ground is held to a V from the line, rising as its banks do)
    // (and none under the sea: the finest tiles route their own water across the drowned shelf as across
    // land, and its creeks there, not the sea's floor, left holes along them in the sea's surface, the
    // floor showing through as strips of sand out in the water. The sea where the dips below the datum
    // are its: dryDip's rule, below)
    const seaOver = h < 0 && !lk && p.liquid && this.contThreshold > -1e8 && (sea >= 0 ? sea >= 0.02 : !(h0 > 1.5 * amp || S.seaDist(x, y, z) > 1.5));
    let crk = finRd && finest <= 60 && ckNear > 0 && !seaOver && finRd.creekAt(Math.min(CREEK_A, 30 * finest * finest));
    if (crk) {
      if (finRd.cd < 1.5) h -= Math.max(0, h - (finRd.ch + finRd.cwc * finRd.cd) / this.hScale - rvRise) * ckNear;
      if (finRd.cA < CREEK_A) crk = finRd.creekAt(CREEK_A);
    }
    if (crk) {
      const A = finRd.cA, k = dm.log(A / CREEK_A);
      const own = Math.min(0.45 * finest, 0.5 + 0.9 * dm.exp(0.45 * k)), dep = Math.min(3, 0.25 + 0.3 * dm.exp(0.3 * k));
      // (a creek with water in it drawn at least 0.75 of the sampling's spacing each side, as a
      // river is, so it shows as a line, not as the samples that happen to land in it (a dotted
      // line); one more than 4 times narrower than that isn't drawn at all)
      const wide = this.wetNow && A > CREEK_WET ? Math.max(own, 0.75 * minWavelength) : own, seen = wide <= 4 * own;
      const half = seen ? wide : own;
      const dist = finRd.cd * finest, flank = half * 3, fin = dm.smoothstep(0.5, 0.9, finRd.w);
      if (dist < flank) {
        // (by how fully its level covers the point: at a tile's edge, where the level below takes
        // over, the creek fades out, not stops at a line)
        const h1 = h;
        // (with water in it the banks are laid to the line, so it runs downhill; a dry world's
        // gully only cuts down: two creeks a cell or two apart, their lines at different heights,
        // would otherwise step the ground between them in rungs)
        const bank = finRd.ch / this.hScale + 0.2 + rvRise, pull = bank - h;
        h += (this.wetNow ? pull : Math.min(0, pull)) * dm.smoothstep(flank, half * 1.2, dist);
        const wet = this.wetNow && A > CREEK_WET && seen && fin > 0.5;
        // (its water's level, beside it too: where the shore meets it)
        if (wet) out[S_WLVL] = Math.max(out[S_WLVL], bank - 0.25 - 0.1 * dep);
        if (dist < half) {
          h = Math.min(h, bank - dep * (1 - (dist / half) * (dist / half)));
          // (its water running water: render/liquid.js's river, not a still pond; down its line at
          // Manning's speed for its depth and the fall along it; heights in the sim's metres)
          if (wet) {
            ckWl = bank - 0.25 - 0.1 * dep; wl = Math.max(wl, ckWl); out[S_WET] = Math.max(out[S_WET], 0.5);
            if (finRd.tF !== undefined && finRd.cdi !== undefined) {
              const q0 = this._cq0 || (this._cq0 = [0, 0, 0]), q1 = this._cq1 || (this._cq1 = [0, 0, 0]), e = 0.25 * finRd.du;
              dirFromFaceUV(finRd.tF, finRd.tU, finRd.tV, q0); dirFromFaceUV(finRd.tF, finRd.tU + finRd.cdi * e, finRd.tV + finRd.cdj * e, q1);
              const fx = q1[0] - q0[0], fy = q1[1] - q0[1], fz = q1[2] - q0[2], fl = Math.sqrt(fx * fx + fy * fy + fz * fz) || 1;
              const Rh = Math.max(0.05, 0.6 * dep * this.hScale), sl = Math.max(1e-4, finRd.cfall / Math.max(finest, 1e-3));
              out[S_FLX] = fx / fl; out[S_FLY] = fy / fl; out[S_FLZ] = fz / fl;
              out[S_FLV] = Math.min(9, Math.max(0.05, dm.pow(Rh, 2 / 3) * Math.sqrt(sl) / 0.035));
            }
          }
        }
        h = h1 + (h - h1) * fin * ckNear;
      }
    }
    // (in a lake, its level: a river or a creek that runs into one is at the lake's level there, not
    // standing on it)
    if (flooded && this.wetNow) wl = lk.L;
    // ground below the datum is under the sea where the sea reaches it: within about a cell of
    // the sea's own cells, where the sim's surface is low enough for the ground's dips to reach
    // the datum (the shore then the ground's own contour, not the cells'); a dip below the
    // datum beyond that is dry land
    // (a world with no liquid has no datum to lift a dip to: its craters and basins stay as deep as they are)
    const dryDip = () => !lk && wl < -1e8 && p.liquid && (sea >= 0 ? sea < 0.02 : (h0 > 1.5 * amp || S.seaDist(x, y, z) > 1.5));
    if (!(flooded && this.wetNow) && h < 0 && dryDip()) h = 0.5 - 0.02 * h;
    // tuyas: a flat lava cap where the ice's surface was (a small cone on it), flanks at ~35
    // degrees of glassy rubble down to the ground round it
    if (S.tuyaAt) {
      const ts = S.tuyaAt.get(S.G.cellAt(x, y, z));
      if (ts) for (const t of ts) {
        const dx = x - t.d[0], dy = y - t.d[1], dz = z - t.d[2], dist = Math.sqrt(dx * dx + dy * dy + dz * dz) * R;
        const edge = t.r * (1 + 0.15 * this.nMisc.noise(x * R / 900, y * R / 900, z * R / 900));
        // (its flanks ~35 degrees as drawn: h is the real height, so the drop a drawn metre is
        // 0.7 / hScale of it; at 0.7 the flanks of a world drawn at an eighth of its height ran out
        // a km, past the cells that know the tuya, and stopped there in walls)
        const lift = t.top - Math.max(0, dist - edge) * 0.7 / this.hScale + 40 * dm.smoothstep(edge * 0.35, 0, dist);
        if (lift > h) { h = lift; out[S_VOLC] = Math.max(out[S_VOLC], dist < edge ? 1 : 0.7); }
      }
    }
    // the finer craters (craters.js CraterField): the octaves below the finest level that
    // stamped its own, each where the sampling resolves it
    if (S.s.crat && S.s.crater && !this._bare) {
      const cf = this._craters || (this._craters = new CraterField(S, S.s.crater, (p.seed && p.seed[0]) | 0, R, (at) => {
        // (the ground at a crater's centre before the field's craters: its floor's level)
        this._bare = true;
        const sc = this._bs || (this._bs = new Float64Array(S_LEN)), hb = this.sampleSnap(at[0], at[1], at[2], 30, sc)[S_H];
        this._bare = false;
        return hb * this.hScale;
      }));
      cf.setTop(S.ref ? Math.max(craterFloor(S.refCell, TILE_CELLS), S.s.crater.Dair) : S.s.crater.Dw);
      h = cf.heightAt(x, y, z, minWavelength, h * this.hScale) / this.hScale;
      out[S_RAY] = cf.ray;
    }
    // chaos: where an icy shell broke over a warm spot, rafts of the old ridged plains standing
    // tilted in a refrozen matrix (Europa's Conamara), each raft its own block
    if (S.s.chaos) h += this._chaosAt(x, y, z, minWavelength) / this.hScale;
    if (S.s.shieldFields) h += this._shieldsAt(x, y, z, minWavelength) / this.hScale;
    // (a crater dug below the datum where the sea doesn't reach is as dry as the ground round it)
    if (S.s.crat && h < 0 && dryDip()) h = 0.5 - 0.02 * h;
    // the cracks' stains (Europa's lineae: salts and organics the ridges' warm ice brought up),
    // a band ~1 km wide along each arc, what shows of them from orbit
    if (S.s.lineae) {
      const wS = Math.max(1000, 1.5 * minWavelength), ink = dm.pow(1000 / wS, 0.6);
      let st = 0;
      for (const A of S.s.lineae) {
        const ax = Math.abs(x * A.pole[0] + y * A.pole[1] + z * A.pole[2]) * R;
        if (ax > wS) continue;
        let th = dm.atan2(x * A.v[0] + y * A.v[1] + z * A.v[2], x * A.u[0] + y * A.u[1] + z * A.u[2]) - A.start;
        th -= dm.TWO_PI * Math.floor(th / dm.TWO_PI);
        if (th > A.len) continue;
        const e = Math.min(1, Math.min(th, A.len - th) / (0.05 * A.len));
        st = Math.max(st, (1 - dm.smoothstep(0, wS, ax)) * e * ink);
      }
      out[S_LINEAE] = Math.min(1, st);
    }
    // dunes: a sand sea's, the wind's own work (dunes.js), turned to the wind there; barchans
    // at its thin edges, transverse ridges where the sand is deep; only where they can be seen
    // (their mean sand sheet everywhere, so nothing jumps as they come into view)
    if (S.s.dunePatch && !(wl > h) && h > 0) {
      const m = S.duneMask(x, y, z);
      if (m > 0.15) {
        const P = S.s.dunePatch, f = dm.smoothstep(0.15, 0.9, m), amp = dm.smoothstep(4 * P.cell * 10, 2 * P.cell, minWavelength);
        const mean = (P.mean[0] + (P.mean[1] - P.mean[0]) * f) * P.slab;
        let dh = mean;
        if (amp > 0) {
          const a = this._duneFrame(x, y, z), da = a.a / P.cell, db = a.b / P.cell;
          const z0 = patchAt(P, 0, da, db), z1 = patchAt(P, 1, da, db);
          dh = mean + ((z0 + (z1 - z0) * f) - mean) * amp;
        }
        h += dh * dm.smoothstep(0.15, 0.4, m);
        out[S_SAND] = dm.smoothstep(0.15, 0.5, m);
      }
    }
    // the glaciers: their ice (the world sim's, smooth) filling the ground's lows to a level, as
    // much as it holds: where it thins out it lies only in the valleys (the deepest first:
    // tongues down them, the ridges between bare), on the ground's own shape; ice thicker than
    // the ground's relief buries it under a smooth dome, ridges standing through (nunataks).
    // Over the sea it floats, a tenth of it above the water. No open water on or under it
    if (iceH > 0) {
      {
        const r = dm.clamp(0.5 * rel, 20, 1000), H = iceH;
        let top = itHb + H - r * dm.exp(-H / r);
        if (h < 0 && S.s.sea) top = Math.max(top, 0.1 * (top - h));
        if (top > h) { out[S_ICE] = top - h; h += (top - h) * dm.smoothstep(0.5 * r, 2 * r, H); wl = -1e9; }
      }
    }
    out[S_H] = h;
    // (the ground a river wets: under it, and above it as far as its water reaches up the bank, the
    // capillary fringe in its sand and silt and its level's day-to-day rise, ~half a metre; the banks
    // above dry. Only where water runs now: a dry world's old channels are valleys in its dust)
    if (rvSt > -1e8) out[S_WET] = Math.max(out[S_WET], rvK * (1 - rvFade) * (1 - dm.smoothstep(0.05, 0.6, (h - rvSt) * this.hScale)));
    // (a river's: its water drawn as a surface of its own near, riverRibbons, where it isn't faded)
    if (wl > h) { out[S_WDEPTH] = wl - h; if (wl === rvWl) { out[S_RFADE] = rvFade; out[S_RIVR] = 1; } else if (wl === ckWl) out[S_RIVR] = 2; }
    out[S_INLAND] = h > 0 ? 1 : 0;
    out[S_VARIANT] = this.nClimate.fbm(x * 6 + 3, y * 6, z * 6, 3);
    const Ts = S.Tsea(x, y, z);
    if (Ts != null) {
      const lapse = (p.climate && p.climate.lapse) || 0.0065;
      out[S_TEMP] = Ts - lapse * Math.max(h + out[S_WDEPTH], 0);
      out[S_MOIST] = dm.clamp(S.rain(x, y, z) / 1500, 0, 1);
    } else this.climate(x, y, z, h, out[S_INLAND], out);
    // (a melt sheet's edge: the cells' smooth blend read a little off true, a shore that wanders
    // as a lake's does (_lakeAt's warp), and sharpened so a pool has an edge, not a halo)
    if (S.s.melt) {
      const wk = 0.4 * S.G.spacing / R, wf = R / (S.G.spacing * 1.5);
      let px = x + wk * this.nMisc.noise(x * wf + 3.1, y * wf, z * wf), py = y + wk * this.nMisc.noise(x * wf, y * wf + 5.3, z * wf), pz = z + wk * this.nMisc.noise(x * wf, y * wf, z * wf + 1.7);
      const l = Math.sqrt(px * px + py * py + pz * pz); px /= l; py /= l; pz /= l;
      const m = S.meltSmooth(px, py, pz);
      out[S_LAVA] = m > 0 ? dm.smoothstep(0.15, 0.45, m) * Math.min(1, 1.6 * m + 0.2) : 0;
    }
    if (p.liquid === 'lava' && h < 0) out[S_LAVA] = 1;
    return out;
  }

  // the nearest simulated river line here (this cell's and its neighbours' segments to
  // their downstream cells), the point wiggled so channels meander: { dist (m), w, depth,
  // k (0 a stream .. 1 the greatest river), hs (the sim's height along the line) }
  // a sand sea's frame at (x, y, z): metres along the wind (a) and across it (b), on its cube
  // face's plane. The wind: the trades in the tropics (west and toward the equator), the
  // westerlies in mid-latitudes, easterlies round the poles; toward the sunward point on a
  // world locked to its star
  _duneFrame(x, y, z) {
    const uv = this._duv || (this._duv = { face: 0, u: 0, v: 0 }), d = this._dd || (this._dd = [0, 0, 0]);
    d[0] = x; d[1] = y; d[2] = z;
    faceUVFromDir(d, uv);
    const F = FACES[uv.face], Mq = dm.PI / 4 * this.R, X = uv.u * Mq, Y = uv.v * Mq;
    // (east and north here)
    let ex = -z, ez = x;
    const el = Math.sqrt(ex * ex + ez * ez) || 1; ex /= el; ez /= el;
    const nx = -y * ez, ny = x * ez - z * ex, nz = y * ex;
    let wx, wy, wz;
    const cl = this.p.climate;
    if (cl && cl.locked && cl.substellar) {
      const ss = cl.substellar, k = ss[0] * x + ss[1] * y + ss[2] * z;
      wx = ss[0] - k * x; wy = ss[1] - k * y; wz = ss[2] - k * z;
    } else {
      const lat = Math.abs(y), sg = y >= 0 ? 1 : -1;
      const e = lat < 0.5 ? -0.94 : lat < 0.87 ? 1 : -1, nn = lat < 0.5 ? -0.34 * sg : 0;
      wx = e * ex + nn * nx; wy = nn * ny; wz = e * ez + nn * nz;
    }
    const wu = wx * F.U[0] + wy * F.U[1] + wz * F.U[2], wv = wx * F.V[0] + wy * F.V[1] + wz * F.V[2], wl = Math.sqrt(wu * wu + wv * wv) || 1;
    const cu = wu / wl, cv = wv / wl, o = this._dfr || (this._dfr = { a: 0, b: 0 });
    o.a = X * cu + Y * cv; o.b = -X * cv + Y * cu;
    // (each stretch of a sand sea its own part of the field, shifted smoothly from cell to cell
    // of the world sim: the field's repeat never lines up)
    const S = this.snap, P = S.s.dunePatch, cc = this._dc16 || (this._dc16 = new Int32Array(16)), ww = this._dw16 || (this._dw16 = new Float64Array(16));
    S.G.corners16(d, cc, ww, uv);
    let oa = 0, ob = 0;
    for (let k = 0; k < 16; k++) { const hv = hash3i(cc[k], 0x5d, 0xd0e5, 7); oa += ww[k] * (hv & 0xffff); ob += ww[k] * (hv >>> 16); }
    const span = 0.5 * P.n * P.cell / 65536;
    o.a += oa * span; o.b += ob * span;
    return o;
  }

  // the rivers' water as a surface of its own (terrainMaterial.js's RIBBON) for a chunk of the cube
  // (face f, its u, v square from u0, v0, size across; N quads across it spacing m apart; origin o):
  // along each channel there, a strip at its water's level (its stage: _riverWater, as sampleSnap
  // has it) reaching a little past its channel's edges, under its banks, so where the ground rises
  // out of it is its shore, to the pixel, not along the mesh's triangles. A channel as sampleSnap
  // draws it at this spacing: its loops as far as they can be seen, as wide as the spacing shows it
  // (and none faded from afar: the terrain's own there). Each quad the chunk's whose middle lies in
  // its square, so each is drawn once at a level. Frozen the year round, none: ice, the ground's.
  // tempAt(x, y, z): the air's mean temperature (C) there. Returns { pos (chunk-local), nrm, flow
  // (way down, unit; speed / 9 m/s), liq (as chunkbuilder.js's), rib (across -1..1, mean depth m),
  // index, falls (FALL_STRIDE a fall, as chunkbuilder.js findFalls, with its lip's way across) } or null
  riverRibbons(f, u0, v0, size, N, spacing, ox, oy, oz, tempAt) {
    const S = this.snap;
    if (!S || !S.riv || !this.wetNow) return null;
    const Rv = S.riv, G = S.G, R = this.R, hs = this.hScale, minW = 2 * spacing, frz = this._freezeC();
    // (the world sim's cells under the chunk, and round them: every record its samples could find)
    const cd = [0, 0, 0], nb = new Int32Array(32), core = new Set(), cells = new Set();
    const n = Math.min(48, Math.ceil(spacing * N / G.spacing) + 1);
    for (let a = 0; a <= n; a++) for (let b = 0; b <= n; b++) {
      dirFromFaceUV(f, u0 + size * a / n, v0 + size * b / n, cd);
      const c = G.cellAt(cd[0], cd[1], cd[2]);
      if (core.has(c)) continue;
      core.add(c); cells.add(c);
      const k = G.nbrs(c, nb);
      for (let q = 0; q < k; q++) cells.add(nb[q]);
    }
    const out = { pos: [], nrm: [], flow: [], liq: [], rib: [], index: [], falls: [] };
    const uv = { face: 0, u: 0, v: 0 }, W = this._rwS2 || (this._rwS2 = {});
    const mine = (x, y, z) => {
      cd[0] = x; cd[1] = y; cd[2] = z; faceUVFromDir(cd, uv);
      return uv.face === f && uv.u >= u0 && uv.u < u0 + size && uv.v >= v0 && uv.v < v0 + size;
    };
    // a run of m points along a channel: X its places (unit), ST its stage (the sim's m), HW the half
    // width drawn (m), XW its water's (m), DM its mean depth (m), V its speed (m/s), TT its t (the
    // way down: t grows downstream; NaN for a run laid down its river), ok drawn there
    // (t as the channel keeps it: Float32, ~1e-7)
    const inZone = (Zs, a, b) => { if (Zs) for (let z = 0; z < Zs.length; z += ZONE) if (a >= Zs[z] - 1e-6 && a <= Zs[z + 1] + 1e-6 && b >= Zs[z] - 1e-6 && b <= Zs[z + 1] + 1e-6) return true; return false; };
    // (across a run at point i: up crossed with its way along, its neighbours' either side: the same
    // for the two quads that meet there)
    const acrossAt = (m, X, ST, i, o, TG) => {
      const i0 = Math.max(0, i - 1), i1 = Math.min(m - 1, i + 1), r0 = R + ST[i0] * hs, r1 = R + ST[i1] * hs;
      let tx = X[3 * i1] * r1 - X[3 * i0] * r0, ty = X[3 * i1 + 1] * r1 - X[3 * i0 + 1] * r0, tz = X[3 * i1 + 2] * r1 - X[3 * i0 + 2] * r0;
      // (or its curve's own way along there: two runs that meet carry on with the same edges)
      if (TG) { tx = TG[3 * i]; ty = TG[3 * i + 1]; tz = TG[3 * i + 2]; }
      const ux = X[3 * i], uy = X[3 * i + 1], uz = X[3 * i + 2];
      const ax = uy * tz - uz * ty, ay = uz * tx - ux * tz, az = ux * ty - uy * tx, al = Math.sqrt(ax * ax + ay * ay + az * az) || 1;
      o[0] = ax / al; o[1] = ay / al; o[2] = az / al;
      return o;
    };
    const strip = (m, X, ST, HW, XW, DM, V, TT, ok, Zs, TG) => {
      const P = new Float64Array(3 * m), Ac = new Float64Array(3 * m);
      // (the river's year at each point (snapshot.js riverYear): its flow's swing against its mean,
      // which the ribbon's shader moves its stage by)
      const YA = new Float32Array(m), YB = new Float32Array(m), yr = this._ry || (this._ry = [0, 0]);
      for (let i = 0; i < m; i++) if (S.riverYear(X[3 * i], X[3 * i + 1], X[3 * i + 2], yr)) { YA[i] = yr[0]; YB[i] = yr[1]; }
      for (let i = 0; i < m; i++) { const r = R + ST[i] * hs; P[3 * i] = X[3 * i] * r; P[3 * i + 1] = X[3 * i + 1] * r; P[3 * i + 2] = X[3 * i + 2] * r; }
      const ac = [0, 0, 0];
      for (let i = 0; i < m; i++) { acrossAt(m, X, ST, i, ac, TG); Ac[3 * i] = ac[0]; Ac[3 * i + 1] = ac[1]; Ac[3 * i + 2] = ac[2]; }
      let fall = null;
      const endFall = () => {
        if (fall && fall.top - fall.bot >= 2) out.falls.push(fall.fx - ox, fall.fy - oy, fall.fz - oz, fall.top, fall.bot, fall.w, fall.wd, fall.ax, fall.ay, fall.az);
        fall = null;
      };
      for (let i = 0; i + 1 < m; i++) {
        if (!ok[i] || !ok[i + 1] || inZone(Zs, TT[i], TT[i + 1])) { endFall(); continue; }
        const j = i + 1, mx = X[3 * i] + X[3 * j], my = X[3 * i + 1] + X[3 * j + 1], mz = X[3 * i + 2] + X[3 * j + 2];
        if (!mine(mx, my, mz)) { endFall(); continue; }
        const ml = Math.sqrt(mx * mx + my * my + mz * mz), Tc = tempAt(mx / ml, my / ml, mz / ml);
        if (Tc - frz < -8) { endFall(); continue; }
        let dx = P[3 * j] - P[3 * i], dy = P[3 * j + 1] - P[3 * i + 1], dz = P[3 * j + 2] - P[3 * i + 2];
        const L = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
        // (its way along over the points either side too: a piece cut short where a record's phases end,
        // or where a braid's thread parts, can be a few cm long, its way (and so its surface's tilt) any
        // way at all: read as a fall, a white cap on the water)
        {
          const a0 = Math.max(0, i - 1), a1 = Math.min(m - 1, j + 1);
          const ex = P[3 * a1] - P[3 * a0], ey = P[3 * a1 + 1] - P[3 * a0 + 1], ez = P[3 * a1 + 2] - P[3 * a0 + 2], el = Math.sqrt(ex * ex + ey * ey + ez * ez);
          if (el > 0) { dx = ex / el; dy = ey / el; dz = ez / el; } else { dx /= L; dy /= L; dz /= L; }
        }
        // (its way down: the way its t grows, or for a great river's run, laid up its stem, back)
        const sg = TT[i] === TT[i] ? (TT[j] >= TT[i] ? 1 : -1) : -1;
        // (its surface's normal: along it crossed with across, up)
        const cx = Ac[3 * i] + Ac[3 * j], cy = Ac[3 * i + 1] + Ac[3 * j + 1], cz = Ac[3 * i + 2] + Ac[3 * j + 2];
        let nx = dy * cz - dz * cy, ny = dz * cx - dx * cz, nz = dx * cy - dy * cx;
        const nl = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
        nx /= nl; ny /= nl; nz /= nl;
        if (nx * mx + ny * my + nz * mz < 0) { nx = -nx; ny = -ny; nz = -nz; }
        const up = (nx * mx + ny * my + nz * mz) / ml;
        // (its liquid as the terrain's: a river (kind 0.7), its temperature, its flow by how steep)
        const lq = [65535, Math.round(0.7 * 65535), Math.round(Math.min(1, Math.max(0, (Tc - frz + 60) / 120)) * 65535), Math.round(dm.smoothstep(0.01, 0.2, 1 - up) * 65535)];
        const b = out.pos.length / 3;
        for (const k of [i, j]) for (const sd of [1, -1]) {
          const w = HW[k] * sd;
          out.pos.push(P[3 * k] + Ac[3 * k] * w - ox, P[3 * k + 1] + Ac[3 * k + 1] * w - oy, P[3 * k + 2] + Ac[3 * k + 2] * w - oz);
          out.nrm.push(nx, ny, nz);
          out.flow.push(sg * dx, sg * dy, sg * dz, V[k] / 9);
          out.liq.push(lq[0], lq[1], lq[2], lq[3]);
          out.rib.push(sd, DM[k], YA[k], YB[k]);
        }
        out.index.push(b, b + 1, b + 2, b + 1, b + 3, b + 2);
        // (a fall: where the water drops steeper than ~37 degrees, from the top of a run of such to its foot)
        const drop = Math.abs(ST[j] - ST[i]) * hs;
        if (drop > 0.75 * L * Math.sqrt(1 - Math.min(1, (drop / L) ** 2)) && drop > 0.3) {
          const lo = ST[j] < ST[i] ? j : i, hi = lo === j ? i : j, rl = R + ST[lo] * hs, rh = R + ST[hi] * hs;
          if (!fall) fall = { top: rh, bot: rl, fx: P[3 * lo], fy: P[3 * lo + 1], fz: P[3 * lo + 2], w: 0, wd: 0, ax: Ac[3 * lo], ay: Ac[3 * lo + 1], az: Ac[3 * lo + 2] };
          if (rh > fall.top) fall.top = rh;
          if (rl < fall.bot) { fall.bot = rl; fall.fx = P[3 * lo]; fall.fy = P[3 * lo + 1]; fall.fz = P[3 * lo + 2]; }
          fall.w = Math.max(fall.w, 2 * Math.min(XW[i], XW[j])); fall.wd = Math.max(fall.wd, DM[i], DM[j]);
        } else endFall();
      }
      endFall();
    };
    // a fall's zone (channels.js zones: z into ch.zones) on a run of a channel's points: its lip a
    // horseshoe, drawn as a grid across (its water's width, a little over). Its rows laid along the lip:
    // each column's row at t less its own setback (eased in from the zone's ends), so every column steps
    // at the same row and the grid's rows bow back with the lip (its stage read at t plus the setback,
    // as sampleSnap reads it). Over the face the sheet leaves the rock: each row as far out from the lip
    // as the water has carried in falling to it (v sqrt(2 z / g), from the brink's speed), so it curves
    // over the lip and lands out from the face's foot; the run's ends the strip's own
    const fallGrid = (ch, s0, m, X, ST, DM, V, TT, ok, z) => {
      const Z = ch.zones, ta = Z[z], tb = Z[z + 1], dmax = Z[z + 4], xw = Z[z + 5], A = ch.at, len = Math.max(ch.len, 1);
      let ia = -1, ib = -1;
      for (let i = 0; i < m; i++) { if (Math.abs(TT[i] - ta) < 1e-6) ia = i; if (Math.abs(TT[i] - tb) < 1e-6) ib = i; }
      if (ia < 0 || ib < 0) return;
      const i0 = Math.min(ia, ib), i1 = Math.max(ia, ib);
      for (let i = i0; i <= i1; i++) if (!ok[i]) return;
      const mx = X[3 * i0] + X[3 * i1], my = X[3 * i0 + 1] + X[3 * i1 + 1], mz = X[3 * i0 + 2] + X[3 * i1 + 2];
      if (!mine(mx, my, mz)) return;
      const ml = Math.sqrt(mx * mx + my * my + mz * mz), Tc = tempAt(mx / ml, my / ml, mz / ml);
      if (Tc - frz < -8) return;
      const a0 = acrossAt(m, X, ST, i0, [0, 0, 0]), a1 = acrossAt(m, X, ST, i1, [0, 0, 0]), half = A[(s0 + i0) * 7];
      const t0 = Z[z + 2], t1 = Z[z + 3], vb = Z[z + 6], xl = Z[z + 7], gr = this.p.g || 9.81;
      // (its rows' base t, down the zone: half a metre apart above and below the face, sixteen down it)
      const bases = [], nu = Math.max(4, Math.ceil((t0 - ta) * len / 0.5)), nd = Math.max(4, Math.ceil((tb - t1) * len / 0.5));
      for (let i = 0; i < nu; i++) bases.push(ta + (t0 - ta) * i / nu);
      for (let i = 0; i < 16; i++) bases.push(t0 + (t1 - t0) * i / 16);
      for (let i = 0; i <= nd; i++) bases.push(t1 + (tb - t1) * i / nd);
      if (TT[i1] < TT[i0]) bases.reverse();
      const nr = bases.length - 1, nc = 16, NV = (nr + 1) * (nc + 1), stLip = this._riverWater(half, 0, ch.prof(t0), 0, W).stage, Ld = t0 + xl / len;
      const G = new Float64Array(NV * 3), U = [0, 0, 0];
      let top = -Infinity, bot = Infinity;
      // (row ri: rows the same at every column; e eased in from the zone's ends)
      for (let ri = 0; ri <= nr; ri++) {
        const base = bases[ri];
        const ease = base < t0 ? (base - ta) / Math.max(t0 - ta, 1e-9) : base > t1 ? 1 - (base - t1) / Math.max(tb - t1, 1e-9) : 1;
        // (where the water is along the channel: the lip and over the face as far out as it's carried
        // falling, then from where it lands on to the zone's end)
        let tg = base;
        if (base > t0 && base <= t1) tg = t0 + vb * Math.sqrt(2 * Math.max(0, stLip - this._riverWater(half, 0, ch.prof(base), 0, W).stage) * hs / gr) / len;
        else if (base > t1) tg = Ld + (base - t1) * (tb - Ld) / Math.max(tb - t1, 1e-9);
        for (let ci = 0; ci <= nc; ci++) {
          const sx = -1 + 2 * ci / nc, back = dmax * dm.pow(Math.max(0, 1 - sx * sx), 5 / 3) / len, t = tg - back * ease;
          // (its place on the channel at t, between the run's points; across, the run's ends' blended)
          let k = i0;
          while (k + 1 < i1 && (TT[k + 1] - t) * (TT[i1] - TT[i0]) < 0) k++;
          const g = TT[k + 1] !== TT[k] ? Math.max(0, Math.min(1, (t - TT[k]) / (TT[k + 1] - TT[k]))) : 0;
          U[0] = X[3 * k] + g * (X[3 * k + 3] - X[3 * k]); U[1] = X[3 * k + 1] + g * (X[3 * k + 4] - X[3 * k + 1]); U[2] = X[3 * k + 2] + g * (X[3 * k + 5] - X[3 * k + 2]);
          const ul = Math.sqrt(U[0] * U[0] + U[1] * U[1] + U[2] * U[2]), f = Math.max(0, Math.min(1, (t - TT[i0]) / (TT[i1] - TT[i0])));
          let ax = a0[0] + f * (a1[0] - a0[0]), ay = a0[1] + f * (a1[1] - a0[1]), az = a0[2] + f * (a1[2] - a0[2]);
          const al = Math.sqrt(ax * ax + ay * ay + az * az) || 1; ax /= al; ay /= al; az /= al;
          const st = this._riverWater(half, 0, ch.prof(Math.min(1, base + back * (1 - ease))), 0, W).stage;
          const rr = R + st * hs, w = sx * 1.02 * xw, o = (ri * (nc + 1) + ci) * 3;
          G[o] = U[0] / ul * rr + ax * w; G[o + 1] = U[1] / ul * rr + ay * w; G[o + 2] = U[2] / ul * rr + az * w;
          if (ci === nc >> 1) { top = Math.max(top, rr); bot = Math.min(bot, rr); }
        }
      }
      const b = out.pos.length / 3, sgn = TT[i1] >= TT[i0] ? 1 : -1, d = [0, 0, 0], e = [0, 0, 0];
      let foot = -1;
      for (let ri = 0; ri <= nr; ri++) for (let ci = 0; ci <= nc; ci++) {
        const o = (ri * (nc + 1) + ci) * 3, ra = Math.max(0, ri - 1), rb = Math.min(nr, ri + 1), ca = Math.max(0, ci - 1), cb = Math.min(nc, ci + 1);
        for (let q = 0; q < 3; q++) { d[q] = G[(rb * (nc + 1) + ci) * 3 + q] - G[(ra * (nc + 1) + ci) * 3 + q]; e[q] = G[(ri * (nc + 1) + cb) * 3 + q] - G[(ri * (nc + 1) + ca) * 3 + q]; }
        // (its normal: along it crossed with across, up; its way down along the rows, down the face)
        let nx = d[1] * e[2] - d[2] * e[1], ny = d[2] * e[0] - d[0] * e[2], nz = d[0] * e[1] - d[1] * e[0];
        const nl = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1, gl = Math.sqrt(G[o] ** 2 + G[o + 1] ** 2 + G[o + 2] ** 2);
        nx /= nl; ny /= nl; nz /= nl;
        if (nx * G[o] + ny * G[o + 1] + nz * G[o + 2] < 0) { nx = -nx; ny = -ny; nz = -nz; }
        const up = (nx * G[o] + ny * G[o + 1] + nz * G[o + 2]) / gl, dl = Math.sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]) || 1, f = ri / nr;
        out.pos.push(G[o] - ox, G[o + 1] - oy, G[o + 2] - oz);
        out.nrm.push(nx, ny, nz);
        out.flow.push(sgn * d[0] / dl, sgn * d[1] / dl, sgn * d[2] / dl, (V[i0] + f * (V[i1] - V[i0])) / 9);
        out.liq.push(65535, Math.round(0.7 * 65535), Math.round(Math.min(1, Math.max(0, (Tc - frz + 60) / 120)) * 65535), Math.round(dm.smoothstep(0.01, 0.2, 1 - up) * 65535));
        out.rib.push(-1 + 2 * ci / nc, DM[i0] + f * (DM[i1] - DM[i0]), 0, 0);   // (a fall's sheet: shaped by its flow, not moved with the stage)
        // (its foot: where its middle column lands)
        if (ci === nc >> 1 && foot < 0 && gl < bot + 0.1 * (top - bot) && top - bot > 0.5) foot = o;
      }
      for (let ri = 0; ri < nr; ri++) for (let ci = 0; ci < nc; ci++) {
        const v0 = b + ri * (nc + 1) + ci, v1 = v0 + 1, v2 = v0 + nc + 1, v3 = v2 + 1;
        // (wound as the strips are: facing up)
        out.index.push(v0, v2, v1, v1, v2, v3);
      }
      if (foot >= 0 && top - bot >= 2) out.falls.push(G[foot] - ox, G[foot + 1] - oy, G[foot + 2] - oz, top, bot, 2 * xw, DM[i0], a0[0], a0[1], a0[2]);
    };
    const drawn = (own) => 0.75 * minW <= 4 * own;   // (sampleSnap's rvFade 0)
    // (a lake's water at point i of a run: its own cells', or standing as high as the river)
    const inLake = (X, i, st) => { const lk = this._lakeAt(X[3 * i], X[3 * i + 1], X[3 * i + 2]); return !!lk && (lk.own || lk.L >= st); };
    const halfW = (own) => 1.04 * Math.max(own, 0.75 * minW) + 0.5 * spacing;
    // the rivers' channels (channels.js), each record's once
    const recs = new Set(), big = Rv.big;
    for (const c of cells) for (let e = Rv.start[c]; e < Rv.start[c + 1]; e++) { const r = Rv.idx[e]; if (!(big && big.has[r])) recs.add(r); }
    for (const r of recs) {
      const ch = this._chan(r), P = ch.pts, A = ch.at;
      if (!ch.kind) continue;
      for (let q = 0; q < ch.kind.length; q++) {
        if (ch.kind[q] !== 0) continue;
        const s0 = ch.pc[2 * q], m = ch.pc[2 * q + 1] - s0;
        if (m < 2) continue;
        const X = new Float64Array(3 * m), ST = new Float64Array(m), HW = new Float64Array(m), XW = new Float64Array(m), DM = new Float64Array(m), V = new Float64Array(m), TT = new Float64Array(m), ok = new Uint8Array(m);
        for (let i = 0; i < m; i++) {
          const k = s0 + i, p = k * 6, a = k * 7, nf = nfOf(A[a + 6], minW);
          let x = P[p] + nf * P[p + 3], y = P[p + 1] + nf * P[p + 4], z = P[p + 2] + nf * P[p + 5];
          const l = Math.sqrt(x * x + y * y + z * z); X[3 * i] = x / l; X[3 * i + 1] = y / l; X[3 * i + 2] = z / l;
          TT[i] = A[a + 5];
        }
        // (its slope: the water's over the segments either side, a fall's face left out: the water
        // comes to its lip at its reach's speed, and what it gains falling the pool below takes up)
        const SL = new Float64Array(m);
        for (let i = 0; i + 1 < m; i++) {
          const lh = Math.sqrt((X[3 * i + 3] - X[3 * i]) ** 2 + (X[3 * i + 4] - X[3 * i + 1]) ** 2 + (X[3 * i + 5] - X[3 * i + 2]) ** 2) * R;
          SL[i] = lh > 0 ? Math.abs(A[(s0 + i + 1) * 7 + 1] - A[(s0 + i) * 7 + 1]) * hs / lh : 0;
        }
        for (let i = 0; i < m; i++) {
          const k = s0 + i, a = k * 7;
          const half = A[a], c = dm.cos(dm.TWO_PI * (ch.J0 + (ch.J1 - ch.J0) * A[a + 5]) / 6);
          let sl = 0, ns = 0;
          for (const j of [i - 1, i]) if (j >= 0 && j + 1 < m && SL[j] < 0.75) { sl += SL[j]; ns++; }
          this._riverWater(half, c, A[a + 1], ns ? sl / ns : 0, W);
          const own = half * (1 + 0.12 * c);
          // (over a fall's face the sheet as wide as the water: the ground's face beside it, drawn at the
          // mesh's spacing, is softer than its own)
          const face = (i > 0 && SL[i - 1] >= 0.75) || (i + 1 < m && SL[i] >= 0.75);
          ST[i] = W.stage; HW[i] = face ? Math.max(W.xw, 0.5) : halfW(own); XW[i] = W.xw; DM[i] = W.dm; V[i] = W.v;
          // (none where it's come down to the sea: its level held at the datum's, the sea's water there;
          // nor in a lake: the lake's water, at its own level, sampleSnap's)
          ok[i] = A[a + 1] >= 0 && drawn(own) && W.stage > 0.301 && !inLake(X, i, W.stage) ? 1 : 0;
          // (a fall's zone's ends as wide as its grid: channels.js zones)
          if (ch.zones) for (let z = 0; z < ch.zones.length; z += ZONE) if (A[a + 5] >= ch.zones[z] - 1e-6 && A[a + 5] <= ch.zones[z + 1] + 1e-6) HW[i] = 1.02 * ch.zones[z + 5];
        }
        strip(m, X, ST, HW, XW, DM, V, TT, ok, ch.zones);
        if (ch.zones) for (let z = 0; z < ch.zones.length; z += ZONE) fallGrid(ch, s0, m, X, ST, DM, V, TT, ok, z);
      }
    }
    // the great rivers' (refine.js bigChannels: segments laid up their stems, end to end), in runs
    if (big) {
      const sg = big.seg, segs = [];
      const seen = new Set();
      for (const c of cells) for (let e = big.start[c]; e < big.start[c + 1]; e++) { const q = big.idx[e]; if (sg[q * BIG_REC + 9] === 0 && !seen.has(q)) { seen.add(q); segs.push(q); } }
      segs.sort((a, b) => a - b);
      const joins = (q) => { const a = q * BIG_REC, b = (q + 1) * BIG_REC; return sg[a + 3] === sg[b] && sg[a + 4] === sg[b + 1] && sg[a + 5] === sg[b + 2]; };
      for (let s = 0; s < segs.length;) {
        // (a run: consecutive segments, each ending where the next begins; and one each side beyond,
        // so its ends' edges are shared with the chunks next to it)
        let e = s;
        while (e + 1 < segs.length && segs[e + 1] === segs[e] + 1 && joins(segs[e])) e++;
        let q0 = segs[s], q1 = segs[e];
        const nSeg = (sg.length / BIG_REC) | 0;
        if (q0 > 0 && sg[(q0 - 1) * BIG_REC + 9] === 0 && joins(q0 - 1)) q0--;
        if (q1 + 1 < nSeg && sg[(q1 + 1) * BIG_REC + 9] === 0 && joins(q1)) q1++;
        const m = q1 - q0 + 2;
        const X = new Float64Array(3 * m), ST = new Float64Array(m), HW = new Float64Array(m), XW = new Float64Array(m), DM = new Float64Array(m), V = new Float64Array(m), TT = new Float64Array(m).fill(NaN), ok = new Uint8Array(m);
        for (let i = 0; i < m; i++) {
          // (point i: segment q0 + i's start, the last one's end; its values the two segments' it joins)
          const qa = Math.min(q0 + i, q1), o = qa * BIG_REC + (i === m - 1 ? 3 : 0);
          const l = Math.sqrt(sg[o] ** 2 + sg[o + 1] ** 2 + sg[o + 2] ** 2);
          X[3 * i] = sg[o] / l; X[3 * i + 1] = sg[o + 1] / l; X[3 * i + 2] = sg[o + 2] / l;
          const qs = [q0 + i - 1, q0 + i].filter((qq) => qq >= q0 && qq <= q1);
          let half = 0, hsv = 0;
          for (const qq of qs) { half += sg[qq * BIG_REC + 6] / qs.length; hsv += sg[qq * BIG_REC + 8] / hs / qs.length; }
          this._riverWater(half, 0, hsv, 1e-4, W);
          ST[i] = W.stage; HW[i] = halfW(half); XW[i] = W.xw; DM[i] = W.dm; V[i] = W.v;
          ok[i] = hsv >= 0 && drawn(half) && W.stage > 0.301 && !inLake(X, i, W.stage) ? 1 : 0;
        }
        strip(m, X, ST, HW, XW, DM, V, TT, ok, null);
        s = e + 1;
      }
    }
    // the creeks (sampleSnap's): the finest level of the terrain's tiles holding the ground there (at
    // most 60 m cells), each cell of its drainage with water in it a curve from halfway to its main
    // inflow, round it, to halfway to the cell it drains into (RefineReader.creekAt), at its water's
    // level, as wide as sampleSnap draws it; each cell from the tile whose own square it's in (their
    // margins overlap), none beside a river (sampleSnap's own rule) or where a finer level holds it
    if (S.pyr) {
      const RD = S.pyrReaders().filter((rd) => rd.cell <= 60).sort((a, b) => a.cell - b.cell), K = MT + 2 * KEEP, LN_A = 25.328436022934504;
      const thrOf = (A) => Math.max(0, Math.round(255 * dm.log(A) / LN_A)), thrA = thrOf(CREEK_A), thrW = thrOf(CREEK_WET);
      const nbI = (k) => ((k >= 4 ? k + 1 : k) % 3) - 1, nbJ = (k) => (((k >= 4 ? k + 1 : k) / 3) | 0) - 1;
      const d = [0, 0, 0], d1 = [0, 0, 0], d2 = [0, 0, 0], gr = this.p.g || 9.81, NP = 5;
      this._minW = minW;
      for (const rd of RD) {
        const src = rd.src;
        if (!src || !src.tiles) continue;
        const n = src.n, st = 2 / n, du = st / MT;
        for (let tj = Math.floor((v0 + 1) / st) - 1; tj <= Math.floor((v0 + size + 1) / st) + 1; tj++) for (let ti = Math.floor((u0 + 1) / st) - 1; ti <= Math.floor((u0 + size + 1) / st) + 1; ti++) {
          if (ti < 0 || tj < 0 || ti >= n || tj >= n) continue;
          const tile = src.tiles.get((f * n + tj) * n + ti);
          if (!tile || !tile.fl || !tile.rcv) continue;
          const H = tile.h, fl = tile.fl, rc = tile.rcv, tu0 = -1 + ti * st - KEEP * du, tv0 = -1 + tj * st - KEEP * du;
          const ci0 = Math.max(KEEP, Math.floor((u0 - tu0) / du) - 2), ci1 = Math.min(KEEP + MT - 1, Math.ceil((u0 + size - tu0) / du) + 2);
          const cj0 = Math.max(KEEP, Math.floor((v0 - tv0) / du) - 2), cj1 = Math.min(KEEP + MT - 1, Math.ceil((v0 + size - tv0) / du) + 2);
          for (let j = cj0; j <= cj1; j++) for (let i = ci0; i <= ci1; i++) {
            const o = j * K + i, kr = rc[o];
            if (fl[o] < thrW || kr === 255) continue;
            // (none on the drowned shelf: the sea's floor there, sampleSnap's seaOver)
            if (H[o] < 0 && this.p.liquid && this.contThreshold > -1e8) continue;
            // (this level the finest holding the ground here, as sampleSnap reads it; no river beside it)
            dirFromFaceUV(f, tu0 + (i + 0.5) * du, tv0 + (j + 0.5) * du, d);
            let fin = null;
            for (const r2 of RD) if (r2.sample(d) && r2.w > 0.5) { fin = r2; break; }
            if (fin !== rd) continue;
            const rv = this._refRiverAt(d[0], d[1], d[2]);
            if (rv && rv.dist < rv.w * 1.5) continue;
            // (its size: sampleSnap's, by its water; drawn no narrower than the sampling shows, and not
            // at all a good deal narrower than that; water in it only where it stands above its bed)
            const A = dm.exp(fl[o] / 255 * LN_A), kA = dm.log(A / CREEK_A);
            const own = Math.min(0.45 * rd.cell, 0.5 + 0.9 * dm.exp(0.45 * kA)), dep = Math.min(3, 0.25 + 0.3 * dm.exp(0.3 * kA));
            const half = Math.max(own, 0.75 * minW), dl = 0.25 + 0.1 * dep;
            if (half > 4 * own || dep <= dl) continue;
            const ri = i + nbI(kr), rj = j + nbJ(kr);
            let ui = i, uj = j, uf = -1;
            for (let q = 0; q < 8; q++) {
              const ni = i + nbI(q), nj = j + nbJ(q), no = nj * K + ni, nk = rc[no];
              if (nk === 255 || ni + nbI(nk) !== i || nj + nbJ(nk) !== j || fl[no] < thrA) continue;
              if (fl[no] > uf) { uf = fl[no]; ui = ni; uj = nj; }
            }
            const x0 = (ui + i) / 2, y0 = (uj + j) / 2, x2 = (i + ri) / 2, y2 = (j + rj) / 2;
            const h0 = (H[uj * K + ui] + H[o]) / 2, h2 = (H[o] + H[rj * K + ri]) / 2;
            const lenM = dm.hypot(x2 - x0, y2 - y0) * rd.cell, sl = Math.max(1e-4, (h0 - h2) / Math.max(lenM, 1e-3));
            const DMc = 2 / 3 * (dep - dl) * hs, Vc = Math.min(9, Math.sqrt(gr * Math.max(DMc, 0.02)), Math.max(0.05, dm.pow(Math.max(0.05, DMc), 2 / 3) * Math.sqrt(sl) / 0.035));
            const X = new Float64Array(3 * NP), TG = new Float64Array(3 * NP), ST = new Float64Array(NP), HW = new Float64Array(NP).fill(1.04 * half + 0.5 * spacing);
            const XW = new Float64Array(NP).fill(half * Math.sqrt(1 - dl / dep)), DM = new Float64Array(NP).fill(DMc), V = new Float64Array(NP).fill(Vc), TT = new Float64Array(NP), ok = new Uint8Array(NP).fill(1);
            for (let q = 0; q < NP; q++) {
              const tt = q / (NP - 1), b0 = (1 - tt) * (1 - tt), b1 = 2 * tt * (1 - tt), b2 = tt * tt;
              const cx = b0 * x0 + b1 * i + b2 * x2, cy = b0 * y0 + b1 * j + b2 * y2, uu = tu0 + (cx + 0.5) * du, vv = tv0 + (cy + 0.5) * du;
              dirFromFaceUV(f, uu, vv, d);
              X[3 * q] = d[0]; X[3 * q + 1] = d[1]; X[3 * q + 2] = d[2];
              // (its way along: the curve's own, toward the cell it drains into)
              const gx = 2 * (1 - tt) * (i - x0) + 2 * tt * (x2 - i), gy = 2 * (1 - tt) * (j - y0) + 2 * tt * (y2 - j), e = 0.01 * du;
              dirFromFaceUV(f, uu + gx * e, vv + gy * e, d1); dirFromFaceUV(f, uu - gx * e, vv - gy * e, d2);
              TG[3 * q] = d1[0] - d2[0]; TG[3 * q + 1] = d1[1] - d2[1]; TG[3 * q + 2] = d1[2] - d2[2];
              ST[q] = (b0 * h0 + b1 * H[o] + b2 * h2) / hs + 0.2 - dl;
              TT[q] = tt;
            }
            // (beside a river, where its floodplain and banks are built up to its level and the creek
            // with them (sampleSnap's rvRise): its water at the sampler's level there, not under it)
            if (rv && rv.dist < Math.max(rv.w * 1.5 + S.G.spacing * (0.02 + 0.12 * rv.k), 1.3 * rv.belt + rv.w)) {
              const m = NP >> 1, sv = this._rbS || (this._rbS = new Float64Array(S_LEN));
              this.sample(X[3 * m], X[3 * m + 1], X[3 * m + 2], minW, sv);
              const up = sv[S_WLVL] > -1e8 ? sv[S_WLVL] - ST[m] : 0;
              if (up > 0) for (let q = 0; q < NP; q++) ST[q] += up;
            }
            for (let q = 0; q < NP; q++) if (inLake(X, q, ST[q])) ok[q] = 0;
            strip(NP, X, ST, HW, XW, DM, V, TT, ok, null, TG);
          }
        }
      }
    }
    if (!out.index.length) return null;
    return {
      pos: Float32Array.from(out.pos), nrm: Int8Array.from(out.nrm, (v) => Math.round(v * 127)),
      flow: Float32Array.from(out.flow), liq: Uint16Array.from(out.liq), rib: Float32Array.from(out.rib),
      index: Uint32Array.from(out.index), falls: out.falls.length ? Float32Array.from(out.falls) : null,
    };
  }

  // a river channel's depth at its banks' brim (the sim's metres) for its width w (the ground's m):
  // hydraulic geometry down rivers (Leopold and Maddock 1953): width ~4.8 Q^0.5, depth ~0.3 Q^0.4
  // (m, m^3/s), so depth 0.3 (w / 4.8)^0.8: a 10 m stream ~0.5 m deep, a 50 m river ~2 m, 200 m ~6
  _chanDepth(w) { return 0.3 * dm.pow(Math.max(w, 1) / 4.8, 0.8) / this.hScale; }
  // a river's banks along it: its line's height (on a world with a sea, no lower than the datum it
  // runs out to; a world without one has none, and a channel below the datum stays there); by its
  // depth through riffles and pools alike, so its water's level runs smooth down it
  _bankOf(rv) { return (this.wetNow ? Math.max(rv.hs, 0) : rv.hs) + 1 + 0.05 * (rv.depth0 || rv.depth); }
  // a river's water at a point of its channel (o): its stage (its usual level, the sim's m: about
  // half its channel's depth, so it fills ~70% of the channel's width, its banks and bars standing
  // above it), how far each side it stands (xw, m), its mean depth (dm, m) and how fast it runs (v,
  // m/s). half: the channel's half width (m) before its riffles and pools; c: where it is between
  // them (+1 a riffle: wider, shallower; -1 a pool); hsv: its banks' line (the sim's m); slope: the
  // water's (m/m). The channel's bed a parabola below its banks (sampleSnap), so its wet section is
  // 4/3 xw (D - its stage's depth below the banks). Its speed through the mean section: what its
  // size carries (hydraulic geometry, Leopold and Maddock 1953: a channel w wide full at Q = (w /
  // 4.8)^2 m^3/s, through its section at bankfull; at its usual stage, its depth that fraction of
  // bankfull, as rivers go at a station: depth ~Q^0.40, speed ~Q^0.34), or where it runs steeper
  // than that, Manning's for its slope (v = R^(2/3) S^(1/2) / n, a natural channel's n ~0.035, R ~
  // its mean depth): a torrent's. Through a riffle or a pool by continuity, the same water through
  // a smaller or a larger section
  _riverWater(half, c, hsv, slope, o) {
    const hs = this.hScale, D0 = this._chanDepth(2 * half), D = D0 * (1 - 0.25 * c), h = half * (1 + 0.12 * c);
    const bank = Math.max(hsv, 0) + 1 + 0.05 * D0, stage = Math.max(bank - 0.45 * D0 - 0.3, 0.3), dl = bank - stage;
    const xw0 = half * Math.sqrt(Math.max(0, 1 - dl / D0)), A0 = 4 / 3 * xw0 * Math.max(D0 - dl, 0) * hs;
    const xw = h * Math.sqrt(Math.max(0, 1 - dl / D)), A = 4 / 3 * xw * Math.max(D - dl, 0) * hs;
    const w = 2 * half, vbf = (w / 4.8) ** 2 / (2 / 3 * w * D0 * hs), vHG = vbf * dm.pow(Math.max(0.05, (D0 - dl) / D0), 0.85);
    const dm0 = Math.max(0.05, 2 / 3 * (D0 - dl) * hs), v0 = Math.max(vHG, dm.pow(dm0, 2 / 3) * Math.sqrt(Math.max(1e-5, slope)) / 0.035);
    o.stage = stage; o.xw = xw; o.dm = A > 0 ? A / (2 * xw) : 0; o.D = D;
    // (and no faster than critical for its mean depth: a mobile bed's riffles and bars adjust until the
    // flow over them stays about there, Grant 1997; the shader holds each pixel's alike)
    o.v = Math.min(9, Math.sqrt((this.p.g || 9.81) * Math.max(o.dm, 0.05)), Math.max(0.05, v0 * A0 / Math.max(A, 0.25 * A0, 1e-6)));
    return o;
  }
  // how far ground beside a river is laid to its banks (pull: bank - ground): all the way across
  // its floodplain (ground a few metres above it, or below it: raised, so the water stays in its
  // bed), none of a gorge's or a valley's walls standing far above it: they rise from its banks
  _levelled(rv, pull) { return pull >= 0 ? pull : pull * (1 - dm.smoothstep(2 * rv.depth + 3, 8 * rv.depth + 10, -pull)); }
  // a river's floodplain: ground below its banks raised to them (its water held in its bed), and
  // ground above them laid to them only within a flood's reach (bankfull and a little over: 1.5 m
  // and a tenth of its depth), so the floodplain's edge follows the ground's own contours (ground
  // higher is a terrace, or the valley's side). pull: bank - ground (m)
  _flooded(rv, pull) {
    if (pull >= 0) return pull;
    // (heights in the sim's metres: the ground's are hScale of them)
    const fp = 1.5 / this.hScale + 0.1 * rv.depth;
    return pull * (1 - dm.smoothstep(0.5 * fp, fp, -pull));
  }
  // a river's bed across its channel (0 at its banks, 1 its deepest): a parabola, on a straight reach
  // its deepest in the middle; in a bend toward the outer bank, the one it's cutting into, a point
  // bar shelving up from the inner (the flow round a bend sweeps the bed outward: Dietrich 1987),
  // the more the sharper it bends, read from how fast it's moving there (the meander model's
  // migration grows with the bend's curvature: Ikeda et al. 1981): its deepest half way to the outer
  // bank at a typical bend. half: the channel's half width there (m)
  _bedShape(rv, x, y, z, half) {
    const mig = Math.sqrt((rv.mx || 0) ** 2 + (rv.my || 0) ** 2 + (rv.mz || 0) ** 2);
    let xs = Math.min(rv.dist, half);
    if (mig > 1e-3 && (x - rv.ax) * rv.mx + (y - rv.ay) * rv.my + (z - rv.az) * rv.mz < 0) xs = -xs;
    const xt = 0.5 * half * dm.tanh(mig), q = xs >= xt ? (xs - xt) / (half - xt) : (xt - xs) / (half + xt);
    return 1 - q * q;
  }
  // and its banks: ground above them rising from the channel's edge no steeper than the bank holds:
  // a cut bank where the channel moves into it (cohesive, near sheer: ~58 degrees), a point bar
  // where it moves away (~9), on a straight reach its sediment's rest (~31); beyond that the
  // ground's own. So the bank's top wanders with the ground beside it, high where a hill comes down
  // to the river, low across its floodplain, not a line drawn alongside it. half: the channel's half
  // width there (m)
  _banked(rv, pull, x, y, z, half) {
    if (pull >= 0) return pull;
    // (the side it's moving away from, a point bar's gentle slope; the side it's cutting into, a steep
    // bank; a straight reach between. Graded across: where the bends turn over the side flips, and
    // chosen one or the other the ground there stepped metres at a line, out across the floodplain)
    const mig = Math.sqrt((rv.mx || 0) ** 2 + (rv.my || 0) ** 2 + (rv.mz || 0) ** 2);
    const ex = x - rv.ax, ey = y - rv.ay, ez = z - rv.az, el = Math.sqrt(ex * ex + ey * ey + ez * ez);
    const cosM = mig > 1e-9 && el > 1e-12 ? (ex * rv.mx + ey * rv.my + ez * rv.mz) / (mig * el) : 0;
    const tanB = 0.6 + (0.15 + 1.45 * dm.smoothstep(-0.35, 0.35, cosM) - 0.6) * dm.smoothstep(0, 0.3, mig);
    // (its height above the bank, capped by the bank's slope, then laid level within a flood's reach;
    // heights in the sim's metres, the ground's hScale of them, distances the ground's)
    const upO = -pull, fp = 1.5 / this.hScale + 0.1 * rv.depth;
    let up = Math.min(upO, tanB / this.hScale * Math.max(0, rv.dist - half));
    up *= dm.smoothstep(0.5 * fp, fp, up);
    return up - upO;
  }

  // Rivers entrenched in a dry land (cutting down faster than their walls weather back: an
  // antecedent river through a rising plateau, the Colorado's): canyons, cut along the river's
  // own channel (channels.js: where it winds its canyon winds, entrenched meanders), their walls
  // its rock's (canyon.js: each bed's own slope, worn back the more the softer it is and the
  // longer it has stood, as far as takes out the rock the terrain's levels have missing there; on
  // the inside of a bend, the slope the river left as it moved across while it cut down). The
  // levels hold a canyon as a dip a cell or two across, sharper than its valley's sides: those
  // sides, carried on in to its line, are the ground it's cut into (a V valley's sides meet at its
  // river: no canyon).
  // What a canyon adds to the levels is itself less itself as they see it: its profile averaged
  // over the sampling (minW across: from afar its walls' mean slope, close up each cliff) less
  // its profile averaged over what the refinement's cells resolve (LAM across, along its valley's
  // line). So everything else the levels hold stays (the side valleys running into it), and from
  // afar, where the sampling is as coarse as the cells, it adds nothing: no fading in, no
  // popping. Inside it the pyramid's finer tiles give way to the refinement (their own cut of
  // the river's valley is its walls' to make). Where two meet (a side canyon) the ground is the
  // lower of their cuts. hRef: the refinement's ground here. Sets _cyK: how much the ground here
  // is a canyon's floor or walls (its river lays no floodplain of its own)
  _canyons(h, h0, hRef, minW, x, y, z) {
    const S = this.snap, Rv = S.riv, R = this.R, cell = S.refCell || 1000, d1 = 1.5 * cell, d2 = 2.5 * cell, LAM = CANYON_LAM * cell;
    this._cyK = 0;
    const fadeIn = 1 - dm.smoothstep(0.7 * LAM, LAM, minW);
    if (fadeIn <= 0) return h;
    // (a dry land: weathering slow, the walls standing)
    const P = S.Gc ? S.rain(x, y, z) : 0, dry = fadeIn * (1 - dm.smoothstep(500, 1200, P ?? 0));
    if (dry <= 0) return h;
    const G = S.G, nb = S.nb, hs = this.hScale, Lk = this._rivLinks(), Fr = this._frames(), FB = Fr.B, FF = Fr.F;
    const c0 = G.cellAt(x, y, z), nn = G.nbrs(c0, nb);
    // (the records that may reach, and their rivers: none with a canyon, nothing to do)
    const N = 64, cr = this._ccr || (this._ccr = new Int32Array(N));
    let nr = 0, any = false;
    for (let q = -1; q < nn; q++) {
      const c = q < 0 ? c0 : nb[q];
      for (let e = Rv.start[c]; e < Rv.start[c + 1] && nr < N; e++) {
        const r = Rv.idx[e], o = r * 4, ex = FB[o] - x, ey = FB[o + 1] - y, ez = FB[o + 2] - z;
        if (Rv.big && Rv.big.has[r]) continue;
        if ((Math.sqrt(ex * ex + ey * ey + ez * ez) - FB[o + 3]) * R >= d2) continue;
        if (!this._canyonRec(r)) continue;
        cr[nr++] = r; any = true;
      }
    }
    if (!any) return h;
    const cn = this._ccn || (this._ccn = nearOut()), wl = this._cwl || (this._cwl = {});
    const seed = (this.p.seed && this.p.seed[0]) | 0, off = this._bedOff(x, y, z), MF = this._mf || (this._mf = meanderField());
    let mf = Infinity, mc = Infinity, wc = 0, cyK = 0;
    // each record's canyon, from its own stretch of channel and of valley line, the lowest of them
    // (along a river they carry on into each other; past a record's ends its own rises away)
    for (let i = 0; i < nr; i++) {
      const r = cr[i], cp = this._canyonRec(r);
      if (!cp) continue;
      const ch = this._chan(r);
      chanNearest(ch, x, y, z, minW, cn, 0);
      if (!cn.ch) continue;
      const d = Math.sqrt(cn.d2) * R;
      // (its valley's line, the river's smoothed line: which side of it the point is, and how far)
      const fb = 9 * r, nt = nearestOnCurveFine(FF, fb, x, y, z), ta = nt[1], da = Math.sqrt(nt[0]) * R, ua = 1 - ta;
      if (Math.min(d, da) >= d2) continue;
      const px = ua * ua * FF[fb] + 2 * ta * ua * FF[fb + 3] + ta * ta * FF[fb + 6], py = ua * ua * FF[fb + 1] + 2 * ta * ua * FF[fb + 4] + ta * ta * FF[fb + 7], pz = ua * ua * FF[fb + 2] + 2 * ta * ua * FF[fb + 5] + ta * ta * FF[fb + 8];
      const tx = ua * (FF[fb + 3] - FF[fb]) + ta * (FF[fb + 6] - FF[fb + 3]), ty = ua * (FF[fb + 4] - FF[fb + 1]) + ta * (FF[fb + 7] - FF[fb + 4]), tz = ua * (FF[fb + 5] - FF[fb + 2]) + ta * (FF[fb + 8] - FF[fb + 5]);
      const qx = x - px, qy = y - py, qz = z - pz, sd = (ty * qz - tz * qy) * x + (tz * qx - tx * qz) * y + (tx * qy - ty * qx) * z;
      // (the canyon there: each side's ground carried on in, and what's missing below it; the two
      // sides blended across the belt the river swings over, so where it swings off its line the
      // ground between doesn't step)
      const A = cp.p, kf = ta * 4, k0 = Math.min(3, Math.floor(kf)), f = kf - k0, i0 = k0 * 12, i1 = i0 + 12;
      const lp = (o) => A[i0 + o] + f * (A[i1 + o] - A[i0 + o]);
      const wm = ch.W0 + (ch.W1 - ch.W0) * ta, Bs = Math.max(50, MF.halfOf(chanSwing(ch, ta)) * wm + wm), sg = dm.smoothstep(-Bs, Bs, sd < 0 ? -da : da);
      const sd2 = (o) => lp(4 + o) + sg * (lp(o) - lp(4 + o));
      const h1 = sd2(0), sl = sd2(1), gone = sd2(2), wt = sd2(3);
      // (its floor: the river's banks along its channel)
      const depth = this._chanDepth(2 * cn.half), F = (this.wetNow ? Math.max(cn.hs, 0) : cn.hs) + 1 + 0.05 * depth;
      const top0 = h1 - sl * d1, fade = dry * wt * dm.smoothstep(30, 80, top0 - F);
      if (fade <= 1e-3) continue;
      // (its floor beside the channel: its banks' strip down a straight reach and on a bend's inner
      // side; on its outer side narrower the harder the river is cutting into its wall there (how
      // fast it's moving, the meander model's migration), the wall's foot at the water's edge at a
      // sharp bend: its cut bank the wall itself)
      const mig = Math.sqrt(cn.mx * cn.mx + cn.my * cn.my + cn.mz * cn.mz), inner = (x - cn.x) * cn.mx + (y - cn.y) * cn.my + (z - cn.z) * cn.mz < 0;
      const top = Math.min(h1, top0 + sl * da), Wf = Math.max(4, cn.half * (inner || mig <= 1e-3 ? 1.8 : 1.8 - 0.8 * dm.tanh(mig)));
      // (its walls: the rock suites there, the two weighing most, each worn back to take out what's
      // missing; on the inside of a bend no steeper than the slope the river left moving across)
      let s1 = -1, s2 = -1, w1 = 0, w2 = 0;
      for (let s = 0; s < 4; s++) { const ws = lp(8 + s); if (ws > w1) { s2 = s1; w2 = w1; s1 = s; w1 = ws; } else if (ws > w2) { s2 = s; w2 = ws; } }
      let cv = 0, cc = 0, cw = 0, W = 0;
      for (let si = 0; si < 2; si++) {
        const s = si ? s2 : s1, ws = si ? w2 : w1;
        if (s < 0 || ws <= 0.05 * w1) continue;
        const T = canyonTable(worldColumn(seed, SUITES[s], 0));
        wallSet(wl, T, F * hs, Wf, off, 0);
        const iT = top0 * hs + off - T.lo, iTop = top * hs + off - T.lo;
        wl.mu = wallFit(wl, iT, gone * hs, 0.95 * d1);
        const k = inner && mig > 1e-3 ? hs / (KAPPA[s] * mig) : 0;
        cv += ws * wallAt(wl, d, minW, iTop, k) / hs;
        cc += ws * wallAt(wl, da, LAM, iTop, 0) / hs;
        W += ws * wallReach(wl, iT); cw += ws;
      }
      if (!cw) continue;
      cv /= cw; cc /= cw; W /= cw;
      mf = Math.min(mf, top + fade * (cv - top)); mc = Math.min(mc, top + fade * (cc - top));
      wc = Math.max(wc, fade * (1 - dm.smoothstep(W + 0.5 * LAM, W + LAM, d)));
      if (d < W) cyK = Math.max(cyK, fade);
    }
    this._cyK = cyK;
    if (mf === Infinity) return h;
    return h + wc * (hRef - h0) + (mf - mc);
  }
  // the beds' offset at a place (geology.js bedAt: the regions' structure there)
  _bedOff(x, y, z) {
    const d = this._bd || (this._bd = [0, 0, 0]), uv = this._buv || (this._buv = { face: 0, u: 0, v: 0 }), bo = this._bbo || (this._bbo = { bed: 0, weak: 0 }), Mu = faceMetres(this.R);
    d[0] = x; d[1] = y; d[2] = z;
    faceUVFromDir(d, uv);
    return bedAt(this, uv.face, uv.u, uv.v, uv.u * Mu, uv.v * Mu, 0, bo).bed;
  }

  // a river record's canyon, along it (kept): at five points along its frame, for each side the
  // levels' ground off its line (at d1, and its slope out to d2), the rock missing below that
  // carried on in, and how much it's a canyon there; and the rock suites its walls stand in
  // (p: by point, [h1, slope, gone, wt] the + side then the - side, then the suites' shares).
  // Smoothed along its river over the three records either side (the levels read along a line
  // across a river that turns as its cells do: their reading wanders, and its walls would with
  // it), so where one record gives way to the next both read alike, and it fades out toward its
  // river's source and its mouth. Null where neither it nor any near it along its river is
  // entrenched
  _canyonRec(r) {
    const C = this._cyc || (this._cyc = new Map());
    let cp = C.get(r);
    if (cp !== undefined) return cp;
    if (C.size > 50000) C.clear();
    const raw = this._canyonRaw(r), Bg = this.snap.riv.big;
    cp = null;
    // (not a great river's: its channel winds across a belt round a line its records don't follow)
    if (!(Bg && Bg.has[r])) {
      const L = this._rivLinks(), ch = [raw], at = [0];
      let nUp = 0, nDn = 0, near = raw.any;
      for (let k = 1, u = r; k <= 3 && (u = L.up[u]) >= 0; k++) { const c = this._canyonRaw(u); ch.push(c); at.push(-k); nUp++; near = near || c.any; }
      for (let k = 1, dn = r; k <= 3; k++) { const nx = L.dn[dn]; if (nx < 0 || L.up[nx] !== dn) break; dn = nx; const c = this._canyonRaw(dn); ch.push(c); at.push(k); nDn++; near = near || c.any; }
      if (near) {
        const A = new Float32Array(60);
        for (let k = 0; k <= 4; k++) {
          let sw = 0;
          const o = k * 12;
          for (let c = 0; c < ch.length; c++) for (let k2 = 0; k2 <= 4; k2++) {
            const dj = (at[c] * 4 + k2 - k) / 4, w = dj * dj < 9 ? (1 - dj * dj / 9) ** 2 : 0, B = ch[c].A, ob = k2 * 12;
            if (!w) continue;
            sw += w;
            for (let q = 0; q < 12; q++) A[o + q] += w * B[ob + q];
          }
          for (let q = 0; q < 12; q++) A[o + q] /= sw;
          const taper = (nUp >= 3 ? 1 : dm.smoothstep(0, 3, nUp + k / 4)) * (nDn >= 3 ? 1 : dm.smoothstep(0, 3, nDn + 1 - k / 4));
          A[o + 3] *= taper; A[o + 7] *= taper;
        }
        cp = { p: A };
      }
    }
    C.set(r, cp);
    return cp;
  }
  // the rivers' records' links: each one's next down its river (the record that starts where it
  // ends) and up it (its main inflow's: a side stream ends elsewhere, at its own mouth), or -1;
  // and which river each is on
  _rivLinks() {
    const Rv = this.snap.riv;
    if (Rv._links) return Rv._links;
    const rec = Rv.rec, m = rec.length / RIVER_REC, up = new Int32Array(m).fill(-1), dn = new Int32Array(m).fill(-1), Q = 1048576;
    const key = (o) => Math.round(rec[o] * Q) + ',' + Math.round(rec[o + 1] * Q) + ',' + Math.round(rec[o + 2] * Q);
    const starts = new Map();
    for (let r = 0; r < m; r++) starts.set(key(r * RIVER_REC), r);
    for (let r = 0; r < m; r++) { const n = starts.get(key(r * RIVER_REC + 6)); if (n !== undefined && n !== r) { dn[r] = n; up[n] = r; } }
    // (and each one's river: the last record down its main stem, where it ends or joins another)
    const river = new Int32Array(m).fill(-1), path = [];
    for (let r = 0; r < m; r++) {
      let q = r;
      path.length = 0;
      while (river[q] < 0 && dn[q] >= 0 && up[dn[q]] === q && path.length < m) { path.push(q); q = dn[q]; }
      const id = river[q] >= 0 ? river[q] : q;
      river[q] = id;
      for (const p of path) river[p] = id;
    }
    return (Rv._links = { up, dn, river });
  }
  // a record's canyon as it reads where it is (_canyonRec smooths it), kept
  _canyonRaw(r) {
    const C = this._cyr || (this._cyr = new Map());
    let cr = C.get(r);
    if (cr) return cr;
    if (C.size > 50000) C.clear();
    const S = this.snap, Rv = S.riv, rec = Rv.rec, R = this.R, b = r * RIVER_REC, hs = this.hScale, FF = this._frames().F, fb = 9 * r;
    const cell = S.refCell || 1000, d1 = 1.5 * cell, d2 = 2.5 * cell;
    const A = new Float32Array(60), q = [0, 0, 0];
    let any = false;
    for (let k = 0; k <= 4; k++) {
      const t = k / 4, u = 1 - t, a0 = u * u, a1 = 2 * t * u, a2 = t * t;
      let px = a0 * FF[fb] + a1 * FF[fb + 3] + a2 * FF[fb + 6], py = a0 * FF[fb + 1] + a1 * FF[fb + 4] + a2 * FF[fb + 7], pz = a0 * FF[fb + 2] + a1 * FF[fb + 5] + a2 * FF[fb + 8];
      const pl = Math.sqrt(px * px + py * py + pz * pz); px /= pl; py /= pl; pz /= pl;
      const tx = u * (FF[fb + 3] - FF[fb]) + t * (FF[fb + 6] - FF[fb + 3]), ty = u * (FF[fb + 4] - FF[fb + 1]) + t * (FF[fb + 7] - FF[fb + 4]), tz = u * (FF[fb + 5] - FF[fb + 2]) + t * (FF[fb + 8] - FF[fb + 5]);
      // (across it, on the ground: up crossed with its way down; the + side)
      let nx = py * tz - pz * ty, ny = pz * tx - px * tz, nz = px * ty - py * tx;
      const nl = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
      nx /= nl; ny /= nl; nz /= nl;
      const floor = (a0 * rec[b + 9] + a1 * rec[b + 10] + a2 * rec[b + 11]) / hs, o = k * 12;
      const at = (sg, s) => { q[0] = px + sg * nx * s / R; q[1] = py + sg * ny * s / R; q[2] = pz + sg * nz * s / R; const l = Math.sqrt(q[0] * q[0] + q[1] * q[1] + q[2] * q[2]); q[0] /= l; q[1] /= l; q[2] /= l; return this._levelsH(q, false); };
      // (the rock its walls stand in: the suites either side, near its line and at d1 (the
      // refinement's rock, not whichever finer tiles are made); a canyon's two walls are the
      // same beds, so both sides share them)
      for (const [sg, s] of SUITE_AT) {
        const hq = at(sg, s * d1), rt = S.rockAt(q[0], q[1], q[2], hq, 0), nm = ROCKS[rt] && ROCKS[rt].name;
        A[o + 8 + SUITES.indexOf(nm && !DEPOSITS.has(nm) && SUITE[nm] || 'loose')] += 0.25;
      }
      // (a greater river near, not this one further down: the dip is its valley, this one a side
      // stream in it, no canyon of its own)
      const own = !this._greaterNear(r, px, py, pz, d1);
      for (let si = 0; si < 2; si++) {
        const sg = si ? -1 : 1, oo = o + si * 4;
        const h1 = at(sg, d1), h2 = at(sg, d2), sl = (h2 - h1) / (d2 - d1), slp = Math.max(0, sl), top0 = h1 - slp * d1;
        // (the rock the levels have missing below the side's ground carried in, out to d1)
        let gone = 0;
        for (let j = 0; j < 4; j++) { const s = j * d1 / 4; gone += Math.max(0, top0 + slp * s - at(sg, s)) * (j ? 1 : 0.5); }
        gone *= d1 / 4;
        // (deep, and a plateau's edge, not a ridge's: the ground beyond d1 not falling away)
        const wt = own ? dm.smoothstep(30, 80, top0 - floor) * dm.smoothstep(-0.06, -0.02, sl) : 0;
        A[oo] = h1; A[oo + 1] = slp; A[oo + 2] = gone; A[oo + 3] = wt;
        if (wt > 0) any = true;
      }
    }
    C.set(r, cr = { A, any });
    return cr;
  }
  // whether a river half as wide again as record r's, on another river, comes within reach (m) of
  // the point (x, y, z)
  _greaterNear(r, x, y, z, reach) {
    const S = this.snap, Rv = S.riv, rec = Rv.rec, G = S.G, R = this.R, L = this._rivLinks(), bnd = Rv._bnd || (Rv._bnd = riverBounds(Rv));
    const nb = this._gnb || (this._gnb = new Int32Array(32)), c0 = G.cellAt(x, y, z), nn = G.nbrs(c0, nb), hw = 1.5 * Rv.half[r], me = L.river[r];
    for (let q = -1; q < nn; q++) {
      const c = q < 0 ? c0 : nb[q];
      for (let e = Rv.start[c]; e < Rv.start[c + 1]; e++) {
        const g = Rv.idx[e];
        if (Rv.half[g] <= hw || L.river[g] === me) continue;
        const o = g * 4, ex = bnd[o] - x, ey = bnd[o + 1] - y, ez = bnd[o + 2] - z;
        if ((Math.sqrt(ex * ex + ey * ey + ez * ez) - bnd[o + 3]) * R >= reach) continue;
        if (Math.sqrt(nearestOnCurve(rec, g * RIVER_REC, x, y, z)[0]) * R < reach) return true;
      }
    }
    return false;
  }
  // the terrain's levels' ground at a direction (the refinement, and with pyr its finer tiles)
  _levelsH(q, pyr = true) {
    const S = this.snap;
    let h = S.ref && S.ref.sample(q) ? S.ref.h / this.hScale : S.h(q[0], q[1], q[2]);
    if (pyr && S.pyr) for (const rd of S.pyrReaders()) if (rd.sample(q)) h += (rd.h / this.hScale - h) * rd.w;
    return h;
  }


  _riverAt(x, y, z) {
    const S = this.snap, s = S.s;
    if (S.riv) return this._refRiverAt(x, y, z);
    if (!s.rcv) return null;
    const G = S.G, R = this.R, c0 = G.cellAt(x, y, z);
    // (meanders: the point pushed about on the scale of a few of the world sim's cells, as drawn)
    const lk = S.lenK || 1, mf = R / (6000 * lk), mk = 2500 * lk / R;
    const px = x + mk * this.nMisc.noise(x * mf + 11, y * mf, z * mf), py = y + mk * this.nMisc.noise(x * mf, y * mf + 13, z * mf), pz = z + mk * this.nMisc.noise(x * mf, y * mf, z * mf + 17);
    let best = null;
    const A = this._ra || (this._ra = [0, 0, 0]), B = this._rb || (this._rb = [0, 0, 0]);
    const test = (c) => {
      const r = s.river[c] / 255;
      if (r < 0.55 || s.h[c] < 0) return;
      const to = S.rcvOf(c);
      if (to < 0) return;
      G.centre(c, A); G.centre(to, B);
      const ax = A[0], ay = A[1], az = A[2];
      const bx = B[0] - ax, by = B[1] - ay, bz = B[2] - az;
      const L2 = bx * bx + by * by + bz * bz;
      const t = L2 > 0 ? Math.max(0, Math.min(1, ((px - ax) * bx + (py - ay) * by + (pz - az) * bz) / L2)) : 0;
      const dx = px - (ax + bx * t), dy = py - (ay + by * t), dz = pz - (az + bz * t);
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) * R;
      const k = (r - 0.55) / 0.45;   // (0 a stream, 1 the greatest river)
      // (its width as its water makes it: the world sim's catchments drawn at lenK of their width
      // hold lenK^2 of the water, a river's width going as its root)
      const w = (40 + 1800 * k * k) * lk, depth = 3 + 25 * k;
      if (!best || dist - w < best.dist - best.w) best = { dist, w, depth, k, hs: s.h[c] + (s.h[to] - s.h[c]) * t };
    };
    test(c0);
    const nb = S.nb, k = G.nbrs(c0, nb);
    for (let e = 0; e < k; e++) test(nb[e]);
    return best;
  }

  // a chaos region's rafts at (x, y, z) (m): the shell's fragments ~600 m across (as drawn: ~6
  // km real), each a block from a hashed seed (its own height and tilt), the refrozen matrix low
  // between them; fading in where the sampling resolves them, out at the region's edge
  // small shield volcanoes (Venus's shield fields: the world sim's shieldFields): low lava
  // shields ~1-15 km across (real), half of them with a pit at the summit, thickest in the
  // field's middle; each from a hashed lattice on the field's own plane (the same for every
  // sample and machine), faded in where the sampling resolves it
  _shieldsAt(x, y, z, minW) {
    const S = this.snap, sc = (S.s.crater && S.s.crater.scale) || 0.1;
    let dh = 0, fi = 0;
    for (const F of S.s.shieldFields) {
      fi++;
      // (a lattice cell: room for the field's biggest, ~5-16 km real; they stand packed close)
      const L = 16e3 * sc * (0.35 + 0.65 * F.k);
      if (minW > L) continue;
      const at = F.at, cosA = x * at[0] + y * at[1] + z * at[2];
      if (cosA < dm.cos(1.1 * F.R)) continue;
      const fall = 1 - dm.smoothstep(0.3, 1.1, dm.acos(Math.min(1, cosA)) / F.R);
      // (the field's plane: east and north at its middle, in lattice cells)
      if (!F._e) {
        const ref = Math.abs(at[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
        const e = [ref[1] * at[2] - ref[2] * at[1], ref[2] * at[0] - ref[0] * at[2], ref[0] * at[1] - ref[1] * at[0]], el = Math.sqrt(e[0] * e[0] + e[1] * e[1] + e[2] * e[2]);
        F._e = [e[0] / el, e[1] / el, e[2] / el];
        F._n = [at[1] * F._e[2] - at[2] * F._e[1], at[2] * F._e[0] - at[0] * F._e[2], at[0] * F._e[1] - at[1] * F._e[0]];
      }
      const px = (x * F._e[0] + y * F._e[1] + z * F._e[2]) * this.R / L, py = (x * F._n[0] + y * F._n[1] + z * F._n[2]) * this.R / L;
      // (how likely a cell holds one: most do in the field's middle, fewer toward its edge)
      const pc = 0.85 * fall * dm.clamp(F.n / 100, 0.35, 1);
      const i0 = Math.floor(px), j0 = Math.floor(py);
      for (let j = j0 - 1; j <= j0 + 1; j++) for (let i = i0 - 1; i <= i0 + 1; i++) {
        const hv = hash3i(i, j, 0x5e1d + fi, 11);
        if ((hv & 0xffff) / 65536 >= pc) continue;
        // (mostly small ones)
        const u = ((hv >>> 16) & 0xff) / 255, D = L * (0.2 + 0.7 * u * u);
        const amp = dm.smoothstep(D, D / 4, minW);
        if (amp <= 0) continue;
        const h2 = hash3i(i, j, 0x5e1e + fi, 12), slack = 1 - D / L;
        const cx = i + 0.5 + slack * ((h2 & 0xff) / 255 - 0.5), cy = j + 0.5 + slack * (((h2 >>> 8) & 0xff) / 255 - 0.5);
        const dx = px - cx, dy = py - cy, r = Math.sqrt(dx * dx + dy * dy) * 2 * L / D;
        if (r >= 1) continue;
        // (a low cone, its flanks a few degrees (as the craters, a little exaggerated), its
        // foot flaring out onto the plain)
        const H = D * 0.02 * VEXAG * (0.6 + 0.8 * ((h2 >>> 16) & 0xff) / 255), q = 1 - r;
        let v = H * q * q * (1 + 2 * r);
        if ((h2 >>> 24) & 1 && r < 0.14) v -= 0.4 * H * (1 - (r / 0.14) * (r / 0.14));
        v *= amp;
        if (v > dh) dh = v;
      }
    }
    return dh;
  }

  _chaosAt(x, y, z, minW) {
    const L = 600, amp = dm.smoothstep(L, L / 4, minW);
    if (amp <= 0) return 0;
    let dh = 0, ci = 0;
    for (const C of this.snap.s.chaos) {
      ci++;
      const cosA = x * C.at[0] + y * C.at[1] + z * C.at[2];
      if (cosA < dm.cos(1.1 * C.R)) continue;
      const edge = 1 - dm.smoothstep(0.8, 1.1, dm.acos(Math.min(1, cosA)) / C.R);
      // (the region's own plane: east and north at its middle, m)
      const at = C.at, ref = Math.abs(at[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
      let ex = ref[1] * at[2] - ref[2] * at[1], ey = ref[2] * at[0] - ref[0] * at[2], ez = ref[0] * at[1] - ref[1] * at[0];
      const el = Math.sqrt(ex * ex + ey * ey + ez * ez); ex /= el; ey /= el; ez /= el;
      const nx = at[1] * ez - at[2] * ey, ny = at[2] * ex - at[0] * ez, nz = at[0] * ey - at[1] * ex;
      const px = (x * ex + y * ey + z * ez) * this.R / L, py = (x * nx + y * ny + z * nz) * this.R / L;
      // (the nearest two seeds: which raft, and how far from its edge)
      const i0 = Math.floor(px), j0 = Math.floor(py);
      let d1 = 1e9, d2 = 1e9, hb = 0, s1x = 0, s1y = 0;
      for (let j = j0 - 1; j <= j0 + 1; j++) for (let i = i0 - 1; i <= i0 + 1; i++) {
        const hv = hash3i(i, j, 0xc4a0 + ci, 3), sx = i + 0.15 + 0.7 * (hv & 0xff) / 255, sy = j + 0.15 + 0.7 * ((hv >>> 8) & 0xff) / 255;
        const dx = px - sx, dy = py - sy, d = Math.sqrt(dx * dx + dy * dy);
        if (d < d1) { d2 = d1; d1 = d; hb = hv; s1x = sx; s1y = sy; } else if (d < d2) d2 = d;
      }
      // (a raft: its height and tilt its own, its edge broken back from the next; a third of the
      // shell melted through, all matrix; the matrix low and hummocky, refrozen slush and rubble)
      const tilt = ((hb >>> 16) & 0xff) / 255 - 0.5, tdir = ((hb >>> 24) & 0xff) / 255 * dm.TWO_PI;
      const raft = C.H * (0.6 + 0.8 * ((hb >>> 4) & 0xf) / 15) + C.H * tilt * ((px - s1x) * dm.cos(tdir) + (py - s1y) * dm.sin(tdir));
      const w = ((hb >>> 12) & 7) < 5 ? dm.smoothstep(0.03, 0.1, 0.5 * (d2 - d1)) : 0;
      const qx = px * 6, qy = py * 6, qi = Math.floor(qx), qj = Math.floor(qy), fx = qx - qi, fy = qy - qj;
      const hu = (i, j) => (hash3i(i, j, 0x5a5 + ci, 9) & 0xffff) / 65536;
      const bump = (hu(qi, qj) * (1 - fx) + hu(qi + 1, qj) * fx) * (1 - fy) + (hu(qi, qj + 1) * (1 - fx) + hu(qi + 1, qj + 1) * fx) * fy;
      dh += edge * amp * (raft * w + (-0.35 + 0.25 * bump) * C.H * (1 - w));
    }
    return dh;
  }

  // the nearest river of the world's refinement (its own drainage: refine.js tileRivers), among
  // the world sim's cell here and its neighbours': { dist (m, to its channel), w, depth, k, hs,
  // r, t, axis (m, to its valley's line), belt (the half width it swings across there), ox, oxAge,
  // oxW (its nearest cut-off loop), ax, ay, az (its channel's nearest point) }. A river runs in its
  // channel (channels.js: the meander trace laid along its smoothed line, its loops drawn where
  // the sampling sees them, nearer its line from afar); a great river in its built one (refine.js
  // bigChannels)
  _refRiverAt(x, y, z) {
    const S = this.snap, Rv = S.riv, rec = Rv.rec, G = S.G, R = this.R, nb = S.nb, minW = this._minW || 0;
    const c0 = G.cellAt(x, y, z), nn = G.nbrs(c0, nb);
    const Fr = this._frames(), FB = Fr.B, MF = this._mf || (this._mf = meanderField()), MA = this._meanderA(), Lk = this._rivLinks();
    const cn = this._rcn || (this._rcn = nearOut()), ox = this._rox || (this._rox = nearOut());
    let best = null, bs = 1e30, bch = null;
    ox.d2 = Infinity; ox.ch = null;
    for (let q = -1; q < nn; q++) {
      const c = q < 0 ? c0 : nb[q];
      for (let e = Rv.start[c]; e < Rv.start[c + 1]; e++) {
        const r = Rv.idx[e], wq = 2 * Rv.half[r];
        if (Rv.big && Rv.big.has[r]) continue;   // (a great river's own winding channel, below)
        // (its loops drawn only where the sampling sees them; how far its channel may stand off
        // its line then (its neighbours' widths and swings shared at its ends): its frame's bounds
        // that much wider, so a channel that can't come nearer than the best so far is passed over)
        const loops = Rv.phase && minW < 9 * wq, reach = loops ? 1.5 * wq * (MF.halfOf(MA[r]) + 2) : 2 * wq;
        const o = r * 4, ex = FB[o] - x, ey = FB[o + 1] - y, ez = FB[o + 2] - z;
        if ((Math.sqrt(ex * ex + ey * ey + ez * ez) - FB[o + 3]) * R - reach >= bs) continue;
        if (loops) {
          const ch = this._chan(r);
          chanNearest(ch, x, y, z, minW, cn, 0);
          if (!cn.ch) continue;
          if (ch.nOx) chanNearest(ch, x, y, z, minW, ox, 1, true);
          const dist = Math.sqrt(cn.d2) * R, w = 2 * cn.half;
          if (dist - w < bs) {
            bs = dist - w; bch = ch;
            best = this._rv || (this._rv = { dist: 0, w: 0, depth: 0, depth0: 0, c: 0, k: 0, hs: 0, r: 0, t: 0, axis: 0, belt: 0, ox: 1e9, oxAge: 1, oxW: 0, ax: 0, ay: 0, az: 0 });
            best.dist = dist; best.w = w; best.k = Rv.size[r]; best.depth = this._chanDepth(w); best.hs = cn.hs;
            // (riffles and pools down it, one of each every ~6 widths, along its meander phase (in
            // widths, shared across its records): a riffle wider and shallower, a pool narrower and
            // deeper; the same water through both)
            { const c = dm.cos(dm.TWO_PI * (ch.J0 + (ch.J1 - ch.J0) * cn.t) / 6); best.c = c; best.depth0 = best.depth; best.w *= 1 + 0.12 * c; best.depth *= 1 - 0.25 * c; }
            best.r = r; best.t = cn.t; best.ax = cn.x; best.ay = cn.y; best.az = cn.z;
            best.mx = cn.mx; best.my = cn.my; best.mz = cn.mz;
            // (at a fall, its lip a horseshoe: the step read that much further down the channel the
            // deeper its water there goes over (channels.js zones), back furthest in its middle)
            if (ch.zones) for (let z = 0; z < ch.zones.length; z += ZONE) {
              const Z = ch.zones;
              if (cn.t < Z[z] || cn.t > Z[z + 1]) continue;
              const qd = Math.max(0, 1 - (dist / Z[z + 5]) ** 2);
              best.hs = ch.prof(Math.min(1, cn.t + Z[z + 4] * dm.pow(qd, 5 / 3) / ch.len));
            }
            // (its way down and slope there: the water's running, channels.js chanFlow)
            const fd = this._fd || (this._fd = [0, 0, 0]), sl = chanFlow(cn, R, fd);
            best.fx = sl >= 0 ? fd[0] : 0; best.fy = sl >= 0 ? fd[1] : 0; best.fz = sl >= 0 ? fd[2] : 0; best.slope = sl >= 0 ? sl * this.hScale : 0;
          }
        } else {
          // (from afar, its line: as its channel drawn with no swing)
          const bdt = nearestOnCurveFine(Fr.F, 9 * r, x, y, z), dist = Math.sqrt(bdt[0]) * R, t = bdt[1];
          const w = wq * (Lk.up[r] < 0 ? 0.15 + 0.85 * dm.smoothstep(0, 0.9, t) : 1);
          if (dist - w < bs) {
            bs = dist - w; bch = null;
            const a0 = (1 - t) * (1 - t), a1 = 2 * t * (1 - t), a2 = t * t, b = r * RIVER_REC, fb = 9 * r, F = Fr.F;
            best = this._rv || (this._rv = { dist: 0, w: 0, depth: 0, depth0: 0, c: 0, k: 0, hs: 0, r: 0, t: 0, axis: 0, belt: 0, ox: 1e9, oxAge: 1, oxW: 0, ax: 0, ay: 0, az: 0 });
            best.dist = dist; best.w = w; best.k = Rv.size[r]; best.depth = best.depth0 = this._chanDepth(w); best.c = 0;
            best.hs = (a0 * rec[b + 9] + a1 * rec[b + 10] + a2 * rec[b + 11]) / this.hScale;
            best.r = r; best.t = t;
            best.ax = a0 * F[fb] + a1 * F[fb + 3] + a2 * F[fb + 6]; best.ay = a0 * F[fb + 1] + a1 * F[fb + 4] + a2 * F[fb + 7]; best.az = a0 * F[fb + 2] + a1 * F[fb + 5] + a2 * F[fb + 8];
            best.mx = best.my = best.mz = 0;
            // (its way down: its frame's tangent, the record running downstream; its slope end to end)
            {
              const u = 1 - t, tx = u * (F[fb + 3] - F[fb]) + t * (F[fb + 6] - F[fb + 3]), ty = u * (F[fb + 4] - F[fb + 1]) + t * (F[fb + 7] - F[fb + 4]), tz = u * (F[fb + 5] - F[fb + 2]) + t * (F[fb + 8] - F[fb + 5]);
              const tl = Math.sqrt(tx * tx + ty * ty + tz * tz) || 1, len = Math.sqrt((F[fb + 6] - F[fb]) ** 2 + (F[fb + 7] - F[fb + 1]) ** 2 + (F[fb + 8] - F[fb + 2]) ** 2) * R;
              best.fx = tx / tl; best.fy = ty / tl; best.fz = tz / tl; best.slope = len > 0 ? Math.abs(rec[b + 9] - rec[b + 11]) / len : 0;
            }
          }
        }
      }
    }
    if (best) {
      best.axis = best.dist; best.belt = 0; best.ox = 1e9; best.oxAge = 1; best.oxW = 0; best.nb = 0;
      if (bch) {
        // (its valley's line: how far off it, and the belt its channel swings across there; where it
        // braids, its threads' too, a width wider)
        const nt = nearestOnCurveFine(Fr.F, 9 * best.r, x, y, z), ta = nt[1], wm = bch.W0 + (bch.W1 - bch.W0) * ta, A = chanSwing(bch, ta);
        best.axis = Math.sqrt(nt[0]) * R;
        best.nb = bch.br ? chanBraid(bch, ta) : 0;
        best.belt = (MF.halfOf(A) + Math.min(1, best.nb)) * wm * (minW <= 2 * wm ? 1 : dm.smoothstep(6 * wm, 2 * wm, minW));
        // (its cut-off loops only where it swings freely: a river held nearer its line cuts few,
        // and those soon filled)
        if (ox.ch) { best.ox = Math.sqrt(ox.d2) * R; best.oxW = ox.wm; best.oxAge = 1 - (1 - ox.age) * dm.smoothstep(0.9, 1, A); }
      }
    }
    // (the great rivers' channels, built winding: refine.js bigChannels)
    const Bg = Rv.big;
    let oxD = 1e9, oxA = 1, oxW = 0;
    // (each cell's segments in groups of eight, each group's bounds a circle: passed over whole
    // when none in it can come nearer than the best channel or oxbow so far)
    const grp = Bg && (Bg._grp || (Bg._grp = channelGroups(Bg)));
    if (Bg) for (let q = -1; q < nn; q++) {
      const c = q < 0 ? c0 : nb[q], end = Bg.start[c + 1];
      for (let e0 = Bg.start[c], g = grp.gs[c]; e0 < end; e0 += 8, g++) {
      const o = g * 5, gx = grp.gb[o] - x, gy = grp.gb[o + 1] - y, gz = grp.gb[o + 2] - z, lb = (Math.sqrt(gx * gx + gy * gy + gz * gz) - grp.gb[o + 3]) * R;
      if (lb >= oxD && lb - 2 * grp.gb[o + 4] >= bs) continue;
      for (let e = e0, e1 = Math.min(e0 + 8, end); e < e1; e++) {
        const sb = Bg.idx[e] * BIG_REC, sg = Bg.seg;
        const ax = sg[sb + 3] - sg[sb], ay = sg[sb + 4] - sg[sb + 1], az = sg[sb + 5] - sg[sb + 2], qx = x - sg[sb], qy = y - sg[sb + 1], qz = z - sg[sb + 2];
        const L2 = ax * ax + ay * ay + az * az, t = L2 > 0 ? Math.max(0, Math.min(1, (qx * ax + qy * ay + qz * az) / L2)) : 0;
        const dx = qx - t * ax, dy = qy - t * ay, dz = qz - t * az, dist = Math.sqrt(dx * dx + dy * dy + dz * dz) * R, half = sg[sb + 6];
        if (sg[sb + 9] > 0) {
          // (an oxbow: a lake while young, a swale once filled)
          if (dist < oxD) { oxD = dist; oxA = sg[sb + 10]; oxW = 2 * half; }
          continue;
        }
        if (dist - 2 * half < bs) {
          bs = dist - 2 * half;
          const k = sg[sb + 7];
          best = this._rv || (this._rv = { dist: 0, w: 0, depth: 0, depth0: 0, c: 0, k: 0, hs: 0, r: 0, t: 0, axis: 0, belt: 0, ox: 1e9, oxAge: 1, oxW: 0, ax: 0, ay: 0, az: 0 });
          best.dist = dist; best.w = 2 * half; best.k = k; best.depth = best.depth0 = this._chanDepth(2 * half); best.c = 0; best.hs = sg[sb + 8] / this.hScale;
          best.axis = dist; best.belt = 0; best.ox = 1e9; best.oxW = 0;
          best.ax = sg[sb] + t * ax; best.ay = sg[sb + 1] + t * ay; best.az = sg[sb + 2] + t * az;
          best.mx = best.my = best.mz = 0;
          // (a great river's segments laid up its stem: its way down the other way; its slope a
          // great river's, ~1e-4)
          { const al = Math.sqrt(L2) || 1; best.fx = -ax / al; best.fy = -ay / al; best.fz = -az / al; best.slope = 1e-4; }
        }
      }
      }
    }
    if (best && oxD < (best.ox ?? 1e9)) { best.ox = oxD; best.oxAge = oxA; best.oxW = oxW; }
    return best;
  }

  // a river record's channel (channels.js), kept (the ones near where the ground is sampled)
  _chan(r, building) {
    const C = this._chC || (this._chC = new Map());
    let ch = C.get(r);
    if (ch !== undefined) return ch;
    if (C.size > 12000) C.clear();
    const bset = building || new Set();
    bset.add(r);
    ch = buildChannel(this, r, bset);
    bset.delete(r);
    C.set(r, ch);
    return ch;
  }
  // every river record's frame (_meanderFrame: F, nine a record) and its bounds (B: a circle round
  // its middle holding its three points, four a record), kept
  _frames() {
    const Rv = this.snap.riv;
    if (Rv._fr) return Rv._fr;
    const m = Rv.rec.length / RIVER_REC, F = new Float64Array(9 * m), B = new Float64Array(4 * m), fr = new Float64Array(9);
    for (let r = 0; r < m; r++) {
      this._meanderFrame(r, fr);
      F.set(fr, 9 * r);
      const cx = 0.25 * (fr[0] + 2 * fr[3] + fr[6]), cy = 0.25 * (fr[1] + 2 * fr[4] + fr[7]), cz = 0.25 * (fr[2] + 2 * fr[5] + fr[8]);
      let mm = 0;
      for (let k = 0; k < 9; k += 3) { const dx = fr[k] - cx, dy = fr[k + 1] - cy, dz = fr[k + 2] - cz; mm = Math.max(mm, dx * dx + dy * dy + dz * dz); }
      B[4 * r] = cx; B[4 * r + 1] = cy; B[4 * r + 2] = cz; B[4 * r + 3] = Math.sqrt(mm) * 1.0001;
    }
    return (Rv._fr = { F, B });
  }

  // a river record's frame for its meanders (into fr: three points, as a record's own): its cell's
  // point on its river's smoothed line (_meanderLine), from halfway to the one up its river to
  // halfway to the one down it, so frames carry on into each other smoothly; at its source or
  // mouth, out to its own ends
  _meanderFrame(r, fr) {
    const Rv = this.snap.riv, rec = Rv.rec, b = r * RIVER_REC, C = this._meanderLine(), L = this._rivLinks();
    const u = L.up[r], dn = L.dn[r] >= 0 && L.up[L.dn[r]] === r ? L.dn[r] : -1;
    for (let k = 0; k < 3; k++) {
      const c = C[3 * r + k];
      fr[3 + k] = c;
      fr[k] = u >= 0 ? 0.5 * (C[3 * u + k] + c) : c + rec[b + k] - rec[b + 3 + k];
      fr[6 + k] = dn >= 0 ? 0.5 * (c + C[3 * dn + k]) : c + rec[b + 6 + k] - rec[b + 3 + k];
    }
    return fr;
  }

  // the rivers' smoothed lines (kept): each record's cell's point averaged with those of the three
  // up and down its main stem, the nearer weighing more: the cells' zigzag gone, its bends kept
  _meanderLine() {
    const Rv = this.snap.riv;
    if (Rv._mL) return Rv._mL;
    const rec = Rv.rec, m = rec.length / RIVER_REC, L = this._rivLinks(), C = new Float64Array(3 * m);
    const dnOf = (q) => { const n = L.dn[q]; return n >= 0 && L.up[n] === q ? n : -1; };
    const ups = [0, 0, 0], dns = [0, 0, 0];
    for (let r = 0; r < m; r++) {
      let o = r * RIVER_REC + 3, sx = rec[o], sy = rec[o + 1], sz = rec[o + 2], sw = 1, nu = 0, nd = 0;
      for (let q = r; nu < 3 && (q = L.up[q]) >= 0;) ups[nu++] = q;
      for (let q = r; nd < 3 && (q = dnOf(q)) >= 0;) dns[nd++] = q;
      // (as many each way: toward its source or its mouth the window narrows, so the line keeps
      // to the river there rather than leaning to the side it has more of)
      const n = Math.min(nu, nd);
      for (let k = 1; k <= n; k++) for (const q of [ups[k - 1], dns[k - 1]]) {
        const wk = dm.exp(-k * k / 4);
        o = q * RIVER_REC + 3; sx += wk * rec[o]; sy += wk * rec[o + 1]; sz += wk * rec[o + 2]; sw += wk;
      }
      const l = Math.sqrt(sx * sx + sy * sy + sz * sz);
      C[3 * r] = sx / l; C[3 * r + 1] = sy / l; C[3 * r + 2] = sz / l;
    }
    return (Rv._mL = C);
  }

  // how far each river record's channel swings (0..1: the meander family's a, meanders.js): as far as
  // its sinuosity has it, its belt kept within reach of the valley's line (a great river nearer it);
  // the slope read over three records up and down its river, so it changes along it slowly, not
  // record to record (kept)
  _meanderA() {
    const Rv = this.snap.riv;
    if (Rv._mA) return Rv._mA;
    const rec = Rv.rec, m = rec.length / RIVER_REC, R = this.R, L = this._rivLinks(), F = this._mf || (this._mf = meanderField());
    const A = new Float32Array(m), B = new Float32Array(m), len = new Float32Array(m), bend = new Float32Array(m), fr = new Float64Array(9);
    for (let r = 0; r < m; r++) {
      const b = r * RIVER_REC;
      len[r] = Math.sqrt((rec[b + 6] - rec[b]) ** 2 + (rec[b + 7] - rec[b + 1]) ** 2 + (rec[b + 8] - rec[b + 2]) ** 2) * R;
      // (the radius its smoothed line turns at (_meanderFrame): its way in against its way out,
      // over its length)
      this._meanderFrame(r, fr);
      const ax = fr[3] - fr[0], ay = fr[4] - fr[1], az = fr[5] - fr[2], bx = fr[6] - fr[3], by = fr[7] - fr[4], bz = fr[8] - fr[5];
      const fl = (Math.sqrt(ax * ax + ay * ay + az * az) + Math.sqrt(bx * bx + by * by + bz * bz)) * R;
      const c = (ax * bx + ay * by + az * bz) / (Math.sqrt((ax * ax + ay * ay + az * az) * (bx * bx + by * by + bz * bz)) || 1);
      bend[r] = fl / Math.max(1e-3, dm.acos(Math.max(-1, Math.min(1, c))));
    }
    // (its slope over its valley's reach, ~15 widths up and down it: a river's pattern answers to its
    // valley's fall over several bends, not a cell's (a profile's steps and falls had the slope, and the
    // pattern, flip from record to record); as sinuous as its stream power, its bed's grain and its
    // banks' silt and clay make it, meanders.js riverSinuosity)
    const aS = new Float32Array(m), cap = new Float32Array(m), nbS = new Float32Array(m), pat = {};
    for (let r = 0; r < m; r++) {
      const W = 2 * Rv.half[r], reach = 15 * W;
      let u = r, dn = r, su = 0.5 * len[r], sd = 0.5 * len[r], rad = bend[r];
      for (let k = 0; k < 16 && su < reach && L.up[u] >= 0; k++) { u = L.up[u]; su += len[u]; if (k < 1) rad = Math.min(rad, bend[u]); }
      for (let k = 0; k < 16 && sd < reach && L.dn[dn] >= 0; k++) { dn = L.dn[dn]; sd += len[dn]; if (k < 1) rad = Math.min(rad, bend[dn]); }
      const slope = su + sd > 0 ? (rec[u * RIVER_REC + 9] - rec[dn * RIVER_REC + 11]) / (su + sd) : 0;
      riverPattern(Math.abs(slope), W, Rv.rock ? Rv.rock[r] : 255, this._chanDepth(W) * this.hScale, pat);
      aS[r] = F.aOfSinuosity(pat.P);
      // (and how many threads it splits into past one where it braids: up to three more)
      nbS[r] = Math.min(3, (pat.Bi - 1) * pat.braid);
      // (and no further across than most of the radius its smoothed line turns at, here and either
      // side: laid along a line that turns sharper, its loops would cross from one stretch's reach into
      // the next's, cut off where they met; a great river's belt nearer its valley's line)
      cap[r] = Math.min(F.aOfHalf(1800 / W), F.aOfHalf(0.7 * rad / W));
    }
    // (and that along the river over ~10 widths either side, so it changes as its valley does: a
    // record's rock or a short steep stretch doesn't turn its loops off and on)
    for (let r = 0; r < m; r++) {
      const reach = 20 * Rv.half[r];
      let sw = 1, sa = aS[r], sb = nbS[r];
      for (const dir of [L.up, L.dn]) {
        let q = r, d = 0.5 * len[r];
        for (let k = 0; k < 12 && dir[q] >= 0; k++) { q = dir[q]; const w = 1 - d / reach; if (w <= 0) break; sw += w; sa += w * aS[q]; sb += w * nbS[q]; d += len[q]; }
      }
      A[r] = Math.min(sa / sw, cap[r]);
      B[r] = sb / sw;
    }
    Rv._mB = B;
    return (Rv._mA = A);
  }
  // each record's threads past one where it braids (0..3: _meanderA's, alike smoothed along its river)
  _meanderB() { if (!this.snap.riv._mB) this._meanderA(); return this.snap.riv._mB; }

  // the simulated lake level here ({ L, own } or null: SnapshotSampler.lakeLevel), looked
  // up a little off true (wandering shores)
  _lakeAt(x, y, z) {
    const S = this.snap, R = this.R;
    const wk = 0.4 * S.G.spacing / R, wf = R / (S.G.spacing * 1.5);
    let px = x + wk * this.nMisc.noise(x * wf, y * wf, z * wf), py = y + wk * this.nMisc.noise(x * wf + 7, y * wf, z * wf), pz = z + wk * this.nMisc.noise(x * wf, y * wf + 3, z * wf);
    const l = Math.sqrt(px * px + py * py + pz * pz); px /= l; py /= l; pz /= l;
    return S.lakeLevel(px, py, pz, this._lk || (this._lk = { L: 0, own: false, q: 0 }));
  }

  // a liquid's surface for the shader (render/liquid.js), in the slots the ground's own shading uses
  // and water's doesn't: what water it is (0 the sea, 0.4 a lake, 0.7 a river, 1 a pond), its annual
  // mean temperature over its freezing point ((dT + 60) / 120: the shader freezes it by the season),
  // a river's flow (0..1), how open it is to the wind (0 a pond .. 1 the open sea)
  _liquidSurface(mat, kind, Tc, flow, fetch) {
    mat[0] = kind; mat[1] = Math.min(1, Math.max(0, (Tc - this._freezeC() + 60) / 120)); mat[2] = flow; mat[3] = fetch;
  }
  // (its freezing point, C: materials.js's triple point; a hydrocarbon sea's, a mixture's (methane,
  // ethane and the nitrogen dissolved in them: Titan's), some 20 K under either's own)
  _freezeC() {
    if (this._tf === undefined) { const M = MATERIALS[this.p.liquid]; this._tf = M ? M.Tt - 273.15 - (FREEZE_MIX[this.p.liquid] || 0) : 0; }
    return this._tf;
  }

  // the ground's material classes (matclasses.js) into mat[MAT_W0..] when the caller has room for
  // them: the rock showing (its two rocks by their mix, a dune's or a beach's sand over them), the
  // ground between (soil; an airless world's regolith, or its frost on an icy one), plants' cover,
  // fresh basalt, snow over all
  _matWeights(mat, show, rt, r2, mix, sand, ground, veg, volc, snow) {
    for (let i = MAT_W0; i < MAT_N; i++) mat[i] = 0;
    const keep = 1 - snow, bare = (1 - veg) * (1 - volc) * keep, rock = show * bare;
    mat[MAT_W0 + LITH_CLASS[rt]] += rock * (1 - mix) * (1 - sand);
    mat[MAT_W0 + LITH_CLASS[r2]] += rock * mix * (1 - sand);
    mat[MAT_W0 + MC.sand] += rock * sand;
    mat[MAT_W0 + ground] += (1 - show) * bare;
    mat[MAT_W0 + MC.cover] += veg * (1 - volc) * keep;
    mat[MAT_W0 + MC.basalt] += volc * keep;
    mat[MAT_W0 + MC.snow] += snow;
  }

  // the sim's surfaces: the exposed rock in its own colour (soil over it where gentle),
  // beach sands, ice, lakes, plant cover from the life map (forest in the world's
  // foliage colour, open country drier), wet ground along rivers, a glowing melt sheet
  shadeSnap(s, slope, col, mat, nrm) {
    const p = this.p, P = p.palette, S = this.snap;
    const x = s[S_DX], y = s[S_DY], z = s[S_DZ], h = s[S_H];
    for (let i = 0; i < 7; i++) mat[i] = 0;
    if (mat.length >= MAT_N) for (let i = MAT_W0; i < MAT_N; i++) mat[i] = 0;
    const Tc = s[S_TEMP] - 273.15;
    // lakes and rivers: water over the ground, tinted by its depth (frozen when cold); the sea
    const wd = s[S_WDEPTH];
    // (the sea, unless it's the sea's floor under a surface of its own: chunkbuilder.js's level water)
    if (!(wd > 0.05) && h < 0 && p.liquid && this.contThreshold > -1e8 && !this._bed) return this.shadeNoise(s, slope, col, mat);
    if (wd > 0.05 && s[S_RFADE] > 0) {
      // (a river faded out from afar: its water over the ground's own colour by how far it's faded)
      const fd = s[S_RFADE], c2 = this._fc || (this._fc = [0, 0, 0]), m2 = this._fm || (this._fm = new Float64Array(8));
      s[S_RFADE] = 0; this.shadeSnap(s, slope, c2, m2, nrm);
      s[S_WDEPTH] = 0; this.shadeSnap(s, slope, col, mat, nrm);
      s[S_WDEPTH] = wd; s[S_RFADE] = fd;
      for (let k = 0; k < 3; k++) col[k] = c2[k] + (col[k] - c2[k]) * fd;
      if (fd < 0.5) for (let k = 0; k < 8; k++) mat[k] = m2[k];
      return;
    }
    if (wd > 0.05) {
      const k = dm.smoothstep(0, 60, wd), dim = 0.8 + 0.2 * dm.smoothstep(0, 3, wd);   // (no step at any depth: a lake's bed changing by a metre shows nowhere)
      col[0] = (P.waterShallow[0] + (P.waterDeep[0] - P.waterShallow[0]) * k) * dim;
      col[1] = (P.waterShallow[1] + (P.waterDeep[1] - P.waterShallow[1]) * k) * dim;
      col[2] = (P.waterShallow[2] + (P.waterDeep[2] - P.waterShallow[2]) * k) * dim;
      mat[4] = wd;
      // (frozen the whole year round: ice to stand on; colder than that only in winter, the shader's)
      if (Tc - this._freezeC() < -8) { col[0] = P.snow[0] * 0.92; col[1] = P.snow[1] * 0.95; col[2] = P.snow[2]; mat[1] = 1; mat[4] = 0; return; }
      // (a river: its channel's water where it runs (S_WET's banks), its flow by how steep its valley
      // (a lowland river's smooth, a mountain torrent white); a lake under a few metres deep: a pond)
      // (one come down to the sea, its level held at the datum's: the sea's water, as the sea's)
      const river = s[S_WET] > 0.2 || s[S_RFADE] > 0, atSea = p.liquid && this.contThreshold > -1e8 && s[S_WLVL] > -1e8 && s[S_WLVL] <= 0.301 * this.hScale;
      if (river && atSea) this._liquidSurface(mat, 0, Tc, 0, 1);
      else if (river) this._liquidSurface(mat, 0.7, Tc, dm.smoothstep(0.01, 0.2, slope), 0.2);
      else if (wd < 3) this._liquidSurface(mat, 1, Tc, 0, 0.05);
      else this._liquidSurface(mat, 0.4, Tc, 0, dm.smoothstep(3, 40, wd) * 0.7 + 0.1);
      return;
    }
    // (a glacier's ice: its surface is the ground here, sampleSnap)
    if (s[S_ICE] > 0.5) {
      col[0] = P.snow[0]; col[1] = P.snow[1]; col[2] = P.snow[2]; mat[1] = 1; mat[6] = 0.3;
      // (bare ice where it melts, its ablation zone; firn and snow above)
      if (mat.length >= MAT_N) { for (let i = MAT_W0; i < MAT_N; i++) mat[i] = 0; const ice = dm.smoothstep(-14, -3, Tc); mat[MAT_W0 + MC.ice] = ice; mat[MAT_W0 + MC.snow] = 1 - ice; }
      return;
    }
    // the rock (or sand) showing, and across a contact on even ground the other one, mixed
    // (its contacts as wide as the vertices reading them are apart: chunkbuilder.js's _shadeSp)
    S.rockSoft = this._shadeSp || 0;
    let rt = S.rockAt(x, y, z, h / this.hScale), r2 = S.rock2;
    const mix = S.rockMix;
    S.rockSoft = 0;
    // (where no tile of the terrain's has laid out the beds: the same beds the tiles have)
    if (!S.rockPyr) { rt = this._bedRock(x, y, z, h, rt); r2 = mix > 0 ? this._bedRock(x, y, z, h, r2) : rt; }
    const c1 = this.rockLin[rt] || P.rock, c2 = this.rockLin[r2] || P.rock, rc = this._rcol || (this._rcol = [0, 0, 0]);
    for (let k = 0; k < 3; k++) rc[k] = c1[k] + (c2[k] - c1[k]) * mix;
    // (a dune sea's sand over it)
    // (a hydrocarbon world's dunes are its haze's organics: dark brown sand, Titan's ~0.1 albedo)
    // (where no water weathers the rock, its sand is the rock's own grains, basalt's dark, a little of the
    // world's dust on them: Mars' dunes ~0.1 albedo against its bright dust; quartz is what's left after
    // water has taken the rest)
    if (s[S_SAND] > 0) { const sc = p.liquid === 'methane' || p.liquid === 'ethane' ? ORGANIC_SAND : p.liquid ? this.rockLin[ROCK['quartz sand']] : this._lithicSand(P); if (sc) for (let k = 0; k < 3; k++) rc[k] += (sc[k] - rc[k]) * s[S_SAND]; }
    // (how much of it is sand: quartz, coral, black sand, lithology.js; no bedrock shows there)
    let sandW = Math.max((rt >= 11 ? 1 - mix : 0) + (r2 >= 11 ? mix : 0), s[S_SAND]), sandOver = s[S_SAND];
    // (a beach's runnels stay sand: the fine tiles' rills cut through its few metres of sand to the
    // beds below, and their banks showed soil, plants and rock, dark streaks down every beach face;
    // waves rework a beach faster than that. Where the level below the fine tiles holds beach sand,
    // on low ground by the water, sand)
    if (sandW < 1 && h < 14 && h > -2 && p.liquid === 'water' && S.rockPyr) {
      const rb = S.rockAt(x, y, z, h / this.hScale, 0);
      if (rb >= 11) {
        const k = dm.smoothstep(14, 6, h);
        if (k > sandW) { const sc = this.rockLin[rb]; if (sc) for (let i = 0; i < 3; i++) rc[i] += (sc[i] - rc[i]) * (k - sandW) / (1 - sandW); sandW = k; sandOver = Math.max(sandOver, k); }
      }
    }
    // bare rock on steep ground; soil (or regolith) on gentle; and where the soil's only a few centimetres
    // even on gentle ground (soil.js: a limestone pavement, a shield's ice-scraped rock, a ridge's crest)
    // (a water world's soil, weathered by its rain; a dry world's ground its regolith and dust, as before. Thin
    // where the ground wears faster than it's made, soil.js's floor of 5 cm: mostly deserts (their rock
    // plateaus and stony ground showing), the steep and the high)
    const soilD = S.soil && p.liquid === 'water' ? S.soil(x, y, z) : null, thinSoil = soilD == null ? 0 : 1 - dm.smoothstep(0.03, 0.25, soilD);
    // (a wetland: the water table at the ground on the flat (soil.js: a fen, a marsh, a bog), or under a foot
    // of it: its soil dark and soaked, its plants lush, not straw, whatever the month)
    const wtd = soilD == null ? null : S.wtd(x, y, z);
    const wetK = soilD == null || (h <= 0 && this.contThreshold > -1e8) ? 0 : Math.max(S.wetland(x, y, z), dm.smoothstep(1.2, 0.15, wtd)) * (1 - dm.smoothstep(0.04, 0.14, slope)) * (1 - thinSoil);
    const rockW = (1 - sandW) * dm.clamp(Math.max(dm.smoothstep(0.12, 0.38, slope) + 0.3 * s[S_MOUNT] * dm.smoothstep(0.06, 0.2, slope), 0.6 * thinSoil), 0, 1);
    let ground = P.soil || P.regolith;
    // (old ice warm enough to sublime grows a dark lag: the ice goes, the dust and rock it held
    // stay, and impacts garden in more (Callisto's, ~0.2 albedo; a young surface (Europa's) or a
    // cold one (Rhea's, Triton's, under ~90 K the ice hardly sublimes) stays bright): by its
    // crater record, how long it's been exposed, and its warmth)
    let lag = 0;
    if (p.icy && S.crat) {
      // (near a locked world's terminator a slope facing its star is lit as ground further into its
      // day, one facing away as its night's: the lag's edge follows the ground there)
      let Tl = s[S_TEMP];
      const cl = p.climate;
      if (cl && cl.locked && cl.substellar && nrm && slope > 0.005) {
        const ss = cl.substellar, dn = cl.dayNight;
        const Tof = (c) => cl.Tmean * dm.pow(Math.max((1 - dn) + dn * (4 * this._lockedLit(c) + 0.02), 0.002), 0.25);
        Tl += Tof(nrm[0] * ss[0] + nrm[1] * ss[1] + nrm[2] * ss[2]) - Tof(x * ss[0] + y * ss[1] + z * ss[2]);
      }
      lag = dm.smoothstep(0.02, 0.6, S.crat(x, y, z)) * dm.smoothstep(86, 106, Tl);
    }
    if (lag > 0) for (let k = 0; k < 3; k++) { rc[k] += (LAG_DUST[k] - rc[k]) * 0.85 * lag; }
    // (on an airless world the regolith is its own rock ground up by impacts: a mare's soil is
    // dark basalt, the highlands' pale; not one colour laid over everything)
    if (!p.liquid && !(p.airP > 0.001)) {
      const gb = this._gb || (this._gb = [0, 0, 0]);
      for (let k = 0; k < 3; k++) gb[k] = ground[k] + (rc[k] - ground[k]) * 0.7;
      ground = gb;
    }
    // (on a dusty world (thin dry air: Mars') the dust blankets all but the steep ground, the
    // rock beneath showing only on cliffs and crater walls)
    // (and only once it's had time to make the dust and the soil: weathering, impacts grinding
    // the rock, the wind sorting it, over hundreds of Myr; a newborn world's lava stands bare)
    const aged = p.ageGyr == null ? 1 : dm.smoothstep(0.03, 0.3, p.ageGyr);
    const dusty = !p.liquid && p.airP > 0 ? (1 - dm.smoothstep(0.02, 0.05, p.airP)) * aged : 0;
    // (and not evenly: it settles thickest on high ground, where the thin air's winds are too
    // weak to lift it again (Tharsis, Arabia), and is swept off the low plains and out of the
    // hollows, where dark basalt sand gathers in dunes (Syrtis Major, Acidalia, crater floors);
    // the winds' broad pattern by place)
    if (dusty > 0) {
      const hs = S.hSmooth(x, y, z), high = dm.smoothstep(-3000, 3000, hs), hollow = dm.smoothstep(250, 1500, hs - h);
      const wind = this.nMisc.fbm(x * 1.4 + 3.1, y * 1.4 - 1.7, z * 1.4 + 0.4, 4);
      const dust = dm.clamp(0.35 + 0.5 * high + 1.1 * wind - 0.3 * hollow, 0, 1);
      const bc = this.rockLin[ROCK.basalt] || P.rock2, gd = this._gd || (this._gd = [0, 0, 0]);
      for (let k = 0; k < 3; k++) { const dark = (bc[k] * 0.6 + P.rock[k] * 0.4) * 0.75; gd[k] = ground[k] + (dark + (ground[k] - dark) * dust - ground[k]) * dusty; }
      ground = gd;
    }
    // (and what rock shows wears the same weathered rind as the dust: Mars' basalt reddened)
    if (dusty > 0 && P.rock) for (let k = 0; k < 3; k++) rc[k] += (P.rock[k] - rc[k]) * 0.5 * dusty;
    let show = sandW + (1 - sandW) * ((0.35 - 0.27 * dusty) + (0.65 + 0.27 * dusty) * rockW);
    show += (1 - show) * (1 - aged);
    let r = ground[0] + (rc[0] - ground[0]) * show;
    let g = ground[1] + (rc[1] - ground[1]) * show;
    let b = ground[2] + (rc[2] - ground[2]) * show;
    mat[3] = sandW; mat[2] = rockW;
    // fresh volcanic rock (a tuya's lava cap and its rubble flanks): dark basalt, bare
    const volc = s[S_VOLC];
    if (volc > 0) { const bc = this.rockLin[ROCK.basalt] || rc; r += (bc[0] * 0.8 - r) * volc; g += (bc[1] * 0.8 - g) * volc; b += (bc[2] * 0.75 - b) * volc; mat[2] = Math.max(mat[2], volc); }
    // plants: the life map's cover, forest in the foliage colour, open country drier
    if (P.veg) {
      const cov = S.cover(x, y, z), fo = S.forest(x, y, z), op = S.open(x, y, z);
      // (plants hold where soil does: the rock showing on a slope steeper than ~45 degrees, thinning them
      // to none by ~60, not from the rock's own ~28 degrees: a mountain's flanks drawn ~8x steeper than the
      // world's own (heights at an eighth, distances at a sixty-fourth) had stood bare where its life map
      // has them wooded; the bare rock's colour by slope as before, a plantless world's unchanged)
      const rockV = rockW * dm.smoothstep(0.2, 0.48, slope);
      let vegW = dm.clamp(cov * 1.2, 0, 1) * (1 - rockV) * (1 - 0.8 * sandW) * dm.smoothstep(-6, 2, Tc) * (1 - 0.7 * volc) * (1 - 0.7 * thinSoil);
      if (vegW > 0) {
        // (the forest as its stands (life/stands.js): near, where its trees are drawn, the floor under a
        // stand its litter, the open country's grass between; far off, where they aren't, a stand's dark
        // canopy, and past a stand's own size the stands' share of the ground)
        const share = Math.min(1, cov * 1.2) * fo, sw = this._sampleW || 0, far = dm.smoothstep(20, 60, sw);
        const mix = dm.smoothstep(60, 400, sw);
        const _d = this._sd || (this._sd = [0, 0, 0]); _d[0] = x; _d[1] = y; _d[2] = z;
        const k = share > 0 ? (mix < 1 ? standAt(this, _d, s, share, sw <= 40).k : 0) * (1 - mix) + share * mix : 0;
        const dry = P.vegDry || P.veg, of = Math.max(0.5 * fo / Math.max(1e-3, fo + op), 0.9 * wetK);
        const fl = P.soil || P.veg;
        let vr = dry[0] + (P.veg[0] - dry[0]) * of, vg = dry[1] + (P.veg[1] - dry[1]) * of, vb = dry[2] + (P.veg[2] - dry[2]) * of;
        const sr = (fl[0] + (P.veg[0] - fl[0]) * 0.3) * 0.75 * (1 - far) + P.veg[0] * 0.8 * far;
        const sg = (fl[1] + (P.veg[1] - fl[1]) * 0.3) * 0.75 * (1 - far) + P.veg[1] * 0.8 * far;
        const sb = (fl[2] + (P.veg[2] - fl[2]) * 0.3) * 0.75 * (1 - far) + P.veg[2] * 0.8 * far;
        vr += (sr - vr) * k; vg += (sg - vg) * k; vb += (sb - vb) * k;
        vegW = Math.max(vegW, k * (1 - rockV));
        r += (vr - r) * vegW; g += (vg - g) * vegW; b += (vb - b) * vegW;
        mat[0] = vegW;
        mat[2] = rockW * (1 - vegW);   // (the rock showing through them)
      }
    }
    // (a wetland's ground soaked: darker, glossy)
    if (wetK > 0) { r *= 1 - 0.3 * wetK; g *= 1 - 0.22 * wetK; b *= 1 - 0.15 * wetK; mat[6] = Math.max(mat[6], 0.6 * wetK); }
    // rivers: wet darker ground on the floodplain (the water itself is above)
    if (s[S_WET] > 0) { const k = 0.3 * s[S_WET]; r *= 1 - k; g *= 1 - k * 0.8; b *= 1 - k * 0.6; mat[6] = Math.max(mat[6], k); }
    // (the swash zone: sand the sea's waves wet, darker and glossy, up to two metres above the water)
    if (p.liquid === 'water' && this.contThreshold > -1e8 && h < 2 && sandW > 0) {
      const k = dm.smoothstep(2, 0.3, h) * sandW;
      if (k > 0) { r *= 1 - 0.3 * k; g *= 1 - 0.27 * k; b *= 1 - 0.22 * k; mat[6] = Math.max(mat[6], k); }
    }
    // the cracks' reddish-brown stains
    if (s[S_LINEAE] > 0) { const l = 0.7 * s[S_LINEAE]; r += (0.42 - r) * l; g += (0.25 - g) * l; b += (0.13 - b) * l; }
    // snow where it's cold, if there's water to fall as snow (a water cycle, or an ice inventory);
    // thin frost on an icy moon; an airless rock stays bare
    const waterCycle = p.liquid === 'water' || (p.frozenOcean && p.climate.wet === 0 && p.iceCover > 0.55 && !p.icy);
    // (a slope facing the pole, or away from the star on a world locked to it, gets less sun:
    // colder, its snow lasting; one facing the sun, warmer, bare sooner)
    const Ta = nrm && slope > 0.005 ? Tc - 8 * this._shadeAspect(x, y, z, nrm) : Tc;
    // (snow needs air to carry the water to where it falls: in a thin one it gathers only in the
    // coldest places, Mars' polar caps; the snow line falls with the air's pressure)
    // (in thin air: only where it's nearly as cold as the world's coldest, the cold trap)
    // (the coldest: the climate grid's, or the generator's climate at the poles)
    const thinK = 1 - dm.clamp((dm.log10(Math.max(p.airP ?? 1, 1e-6)) + 2) / 1, 0, 1), cl0 = p.climate;
    const tMinC = S.TseaMin != null ? S.TseaMin - 273.15 : cl0 && !cl0.locked ? cl0.Tmean * dm.pow(Math.max(1 + cl0.s2 * cl0.transport, 0.002), 0.25) - 273.15 : -90;
    const sHi = -2 + (Math.min(-2, tMinC + 14) + 2) * thinK, sLo = -10 + (Math.min(-10, tMinC + 6) + 10) * thinK;
    let snow = 0;
    if (waterCycle || (p.iceCover > 0 && S.Gc)) {
      // (where the world keeps its year, season.js: the year-round snow where a year's thaw can't melt
      // a winter's fall, the seasons' over the rest the shader's, by the date; in thin air, the cold trap)
      const yr = this._yr || (this._yr = [0, 0, 0]);
      if (snowsBySeason(p) && S.season(x, y, z, yr)) snow = dm.smoothstep(1, 1.25, snowYear(Ta, yr[0], yr[1], yr[2], S.s.yearDays || 365)) * (1 - 0.5 * rockW);
      else snow = dm.smoothstep(sHi, sLo, Ta) * (1 - 0.5 * rockW);
    }
    if (p.icy) snow = Math.max(snow, 0.3 * (1 - lag) * (0.5 + 0.5 * s[S_VARIANT]) * (1 - 0.5 * dm.smoothstep(0.3, 0.6, slope)) * (1 - s[S_LINEAE]));
    if (p.iceCover > 0 && !p.icy && !S.Gc) snow = Math.max(snow, dm.smoothstep(this.iceCapCut - 0.03, this.iceCapCut + 0.03, this.iceCapMetric(s)));
    snow = dm.clamp(snow, 0, 1);
    if (snow > 0) { r += (P.snow[0] - r) * snow; g += (P.snow[1] - g) * snow; b += (P.snow[2] - b) * snow; mat[1] = snow; }
    if (mat.length >= MAT_N) {
      const airless = !p.liquid && !(p.airP > 0.001);
      const gc = airless ? (p.icy ? MC.snow : MC.regolith) : dusty > 0.5 ? MC.regolith : MC.soil;
      this._matWeights(mat, show, rt, r2, mix, sandOver, gc, mat[0], volc, snow);
    }
    col[0] = r; col[1] = g; col[2] = b;
    // young craters' ejecta and rays: fresh rock, not yet darkened by the sun's wind
    if (s[S_RAY] > 0) { const k = 0.6 * s[S_RAY]; col[0] += (Math.min(1, col[0] * 1.9 + 0.05) - col[0]) * k; col[1] += (Math.min(1, col[1] * 1.9 + 0.05) - col[1]) * k; col[2] += (Math.min(1, col[2] * 1.9 + 0.05) - col[2]) * k; }
    // a fresh melt sheet glows (blackbody by how hot: the render's job; here, how much)
    const melt = s[S_LAVA];
    if (melt > 0.05) { col[0] *= 1 - melt; col[1] *= 1 - melt; col[2] *= 1 - melt; mat[5] = melt; }
  }

  // how far a surface (normal n) faces away from the sun's mean path at (x, y, z): its normal's
  // part along the ground toward the pole (none at the equator, where the sun passes overhead),
  // or away from the star on a locked world; -1 .. 1
  _shadeAspect(x, y, z, n) {
    const cl = this.p.climate, dn = n[0] * x + n[1] * y + n[2] * z;
    if (cl && cl.locked && cl.substellar) {
      const ss = cl.substellar, k = ss[0] * x + ss[1] * y + ss[2] * z;
      const ax = ss[0] - k * x, ay = ss[1] - k * y, az = ss[2] - k * z, al = Math.sqrt(ax * ax + ay * ay + az * az);
      return al > 1e-6 ? -((n[0] - dn * x) * ax + (n[1] - dn * y) * ay + (n[2] - dn * z) * az) / al : 0;
    }
    const cl2 = 1 - y * y;
    if (cl2 < 1e-6) return 0;
    // (the ground's northward direction is (0, 1, 0) less its part along up, length cos(lat))
    const north = (n[1] - dn * y) / Math.sqrt(cl2);
    return (y >= 0 ? 1 : -1) * north * Math.min(1, 2 * Math.abs(y));
  }

  // the erodibility (lithology.js's k) of the rock a river's bed cuts at (x, y, z), h (m) (channels.js
  // lays its profile by it): the world sim's own rock there and its beds at that height, as the
  // ground shows them (not the finer tiles': they come and go with the camera, and a river's
  // profile mustn't change as they do)
  _channelRockK(x, y, z, h) {
    const S = this.snap;
    const rock = S.rockAtWarped(S.rockWarp(x, y, z, this._cw || (this._cw = [0, 0, 0])), h / this.hScale);
    const mw = this._minW;
    this._minW = 0;
    const r = this._bedRock(x, y, z, h, rock);
    this._minW = mw;
    return ROCKS[r] ? ROCKS[r].k : 1;
  }

  // the rock at (x, y, z), standing at h, where no tile of the terrain's has laid out the beds:
  // a rock of a suite (geology.js) shows its column's bed at this height, tilted and folded as
  // the tiles have it, so a tile's beds carry on past its edge (seen at this sampling's grain);
  // deposits and loose ground as they are
  // a dry world's dune sand: the rock's own grains (black sand's colour), a third of the world's dust over them
  _lithicSand(P) {
    if (this._lsand) return this._lsand;
    const b = this.rockLin[ROCK['black sand']] || [0.03, 0.03, 0.03], d = P.regolith || P.soil || b;
    return (this._lsand = [0, 1, 2].map((k) => b[k] + (d[k] - b[k]) * 0.33));
  }

  _bedRock(x, y, z, h, rock) {
    const nm = ROCKS[rock] && ROCKS[rock].name, su = nm && !DEPOSITS.has(nm) ? SUITE[nm] : null;
    if (!su) return rock;
    const d = this._bd || (this._bd = [0, 0, 0]), uv = this._buv || (this._buv = { face: 0, u: 0, v: 0 });
    d[0] = x; d[1] = y; d[2] = z;
    faceUVFromDir(d, uv);
    const Mu = this._Mu || (this._Mu = faceMetres(this.R));
    const o = bedAt(this, uv.face, uv.u, uv.v, uv.u * Mu, uv.v * Mu, 0, this._bo || (this._bo = { bed: 0, weak: 0 }));
    return worldColumn((this.p.seed && this.p.seed[0]) | 0, su, 0.25 * (this._minW || 0)).typeAt(h + o.bed);
  }

  shadeNoise(s, slope, col, mat) {
    const p = this.p;
    const P = p.palette;
    const h = s[S_H];
    const Tc = s[S_TEMP] - 273.15;
    const W = s[S_MOIST];
    const variant = s[S_VARIANT];
    for (let i = 0; i < 7; i++) mat[i] = 0;
    if (mat.length >= MAT_N) for (let i = MAT_W0; i < MAT_N; i++) mat[i] = 0;

    const hasLiquid = p.liquid && this.contThreshold > -1e8;
    if (hasLiquid && h < 0) {
      const depth = -h;
      if (p.liquid === 'lava') {
        const crust = 0.5 + 0.5 * variant;
        col[0] = 0.05; col[1] = 0.03; col[2] = 0.025;
        mat[5] = dm.clamp(0.6 + 0.4 * s[S_LAVA] - 0.5 * crust * crust, 0.1, 1);
        mat[4] = 0;
        return;
      }
      // (a frozen ocean's shell: ice, the ground's. A sea frozen the year round is still the sea: its pack
      // the shader's floes, closed, its leads refrozen (render/liquid.js seaFloes), as its winter ice is)
      if (p.frozenOcean && p.liquid !== 'methane') {
        col[0] = P.snow[0] * 0.92; col[1] = P.snow[1] * 0.95; col[2] = P.snow[2];
        mat[1] = 1; mat[6] = 0.4;
        return;
      }
      const k = dm.smoothstep(0, 140, depth);
      col[0] = P.waterShallow[0] + (P.waterDeep[0] - P.waterShallow[0]) * k;
      col[1] = P.waterShallow[1] + (P.waterDeep[1] - P.waterShallow[1]) * k;
      col[2] = P.waterShallow[2] + (P.waterDeep[2] - P.waterShallow[2]) * k;
      mat[4] = Math.max(depth, 0.01);
      this._liquidSurface(mat, 0, Tc, 0, 1);
      return;
    }

    // ---- land
    const v = 0.5 + 0.5 * variant;
    let r = P.regolith[0] + (P.rock2[0] - P.regolith[0]) * v * 0.6;
    let g = P.regolith[1] + (P.rock2[1] - P.regolith[1]) * v * 0.6;
    let b = P.regolith[2] + (P.rock2[2] - P.regolith[2]) * v * 0.6;
    // rock exposure: steep slopes, mountains, rough terrain
    const rockW = dm.clamp(dm.smoothstep(0.18, 0.42, slope) + s[S_MOUNT] * 0.5 * dm.smoothstep(0.08, 0.25, slope) + (s[S_ROUGH] - 0.9) * 0.3, 0, 1);
    const rockR = P.rock[0] + (P.rock2[0] - P.rock[0]) * (0.5 + 0.5 * dm.sin(h * 0.004 + variant * 6)) * 0.5;
    const rockG = P.rock[1] + (P.rock2[1] - P.rock[1]) * (0.5 + 0.5 * dm.sin(h * 0.004 + variant * 6)) * 0.5;
    const rockB = P.rock[2] + (P.rock2[2] - P.rock[2]) * (0.5 + 0.5 * dm.sin(h * 0.004 + variant * 6)) * 0.5;

    // sand: arid lowlands + beaches
    let sandW = 0;
    if (p.dunes > 0 || (hasLiquid && h < 12)) {
      const arid = p.climate.wet > 0 ? dm.smoothstep(0.32, 0.12, W) : 0.7 * p.dunes;
      const beach = hasLiquid && p.liquid === 'water' ? dm.smoothstep(14, 2, h) * dm.smoothstep(0.25, 0.1, slope) : 0;
      sandW = dm.clamp(Math.max(arid * dm.smoothstep(0.2, 0.06, slope), beach), 0, 1) * (1 - rockW * 0.8);
    }
    r += (P.sand[0] - r) * sandW; g += (P.sand[1] - g) * sandW; b += (P.sand[2] - b) * sandW;

    // vegetation
    let veg = 0;
    if (P.veg && p.life > 0) {
      veg = p.life * dm.smoothstep(-6, 7, Tc) * (1 - dm.smoothstep(38, 52, Tc)) * dm.smoothstep(0.1, 0.42, W) * (1 - rockW) * (1 - sandW * 0.9);
      veg = dm.clamp(veg, 0, 1);
      if (veg > 0) {
        const lush = dm.smoothstep(0.14, 0.5, W);
        const vr = P.vegDry[0] + (P.veg[0] - P.vegDry[0]) * lush;
        const vg = P.vegDry[1] + (P.veg[1] - P.vegDry[1]) * lush;
        const vb = P.vegDry[2] + (P.veg[2] - P.vegDry[2]) * lush;
        // soil under sparse cover
        r += (P.soil[0] - r) * veg * 0.5; g += (P.soil[1] - g) * veg * 0.5; b += (P.soil[2] - b) * veg * 0.5;
        r += (vr - r) * veg; g += (vg - g) * veg; b += (vb - b) * veg;
      }
    }
    // rock
    r += (rockR - r) * rockW; g += (rockG - g) * rockW; b += (rockB - b) * rockW;

    // volcanic flows, maria, crater floors darken; rays brighten
    const dark = Math.max(s[S_VOLC] * 0.55, s[S_MARE] * 0.6, s[S_CRATER] * 0.55);
    r *= 1 - dark; g *= 1 - dark; b *= 1 - dark;
    const ray = Math.min(1, s[S_RAY] * 0.9);
    r += (P.rock2[0] * 1.6 - r) * ray; g += (P.rock2[1] * 1.6 - g) * ray; b += (P.rock2[2] * 1.6 - b) * ray;
    // ice-crack stains (Europa)
    if (s[S_LINEAE] > 0) {
      const l = s[S_LINEAE];
      r += (0.42 - r) * l * 0.7; g += (0.25 - g) * l * 0.7; b += (0.13 - b) * l * 0.7;
    }

    // snow / ice: needs an active water cycle (or a snowball); polar caps from
    // the ice inventory on dry worlds; thin frost on icy moons
    const waterCycle = p.liquid === 'water' || (p.frozenOcean && p.climate.wet === 0 && p.iceCover > 0.55 && !p.icy);
    let snow = waterCycle ? dm.smoothstep(-2, -11, Tc) * (1 - 0.75 * dm.smoothstep(0.35, 0.65, slope)) : 0;
    if (p.icy) snow = Math.max(snow, 0.3 * (0.5 + 0.5 * variant) * (1 - 0.5 * dm.smoothstep(0.3, 0.6, slope)) * (1 - s[S_LINEAE]));
    if (p.iceCover > 0 && !p.icy) {
      // ice sheets claim the coldest terrain first: polar caps sized so their
      // area equals the ice cover (night side for locked worlds), plus highlands
      const cap = this.iceCapMetric(s);
      snow = Math.max(snow, dm.smoothstep(this.iceCapCut - 0.03, this.iceCapCut + 0.03, cap));
    }
    if (p.liquid === 'lava') snow = 0;
    snow = dm.clamp(snow, 0, 1);
    r += (P.snow[0] - r) * snow; g += (P.snow[1] - g) * snow; b += (P.snow[2] - b) * snow;

    col[0] = r; col[1] = g; col[2] = b;
    mat[0] = veg * (1 - snow);
    mat[1] = snow;
    mat[2] = rockW * (1 - snow);
    mat[3] = sandW * (1 - snow);
    mat[5] = s[S_LAVA] * 0.8;
    mat[6] = hasLiquid && h < 4 ? 0.5 : 0;
    // (a world without a simulated history: its rock one generic hard rock, dark where volcanic)
    if (mat.length >= MAT_N) {
      const airless = !p.liquid && !(p.airP > 0.001), rockShow = Math.min(1, rockW + sandW);
      const lith = Math.max(s[S_VOLC], s[S_MARE]) > 0.3 ? ROCK.basalt : ROCK.granite;
      this._matWeights(mat, rockShow, lith, lith, 0, rockShow > 0 ? sandW / rockShow : 0, airless ? (p.icy ? MC.snow : MC.regolith) : MC.soil, veg * (1 - rockW), 0, snow);
    }
  }

  // 0..1 "coldness" whose area distribution is uniform on the sphere, so a
  // threshold at (1 - iceCover) covers exactly that fraction of the surface.
  iceCapMetric(s) {
    const cl = this.p.climate;
    let m;
    if (cl.locked) {
      const ss = cl.substellar;
      m = 0.5 - 0.5 * (s[S_DX] * ss[0] + s[S_DY] * ss[1] + s[S_DZ] * ss[2]);
    } else m = Math.abs(s[S_DY]);
    return m + Math.max(0, s[S_H]) / 60000 + 0.05 * s[S_VARIANT];
  }

  // Height only (fast path for physics); same band-limit semantics as sample()
  height(x, y, z, minWavelength, scratch) {
    return this.sample(x, y, z, minWavelength, scratch)[S_H];
  }
}

// Sea-level clamped surface height: what physics and rendering treat as "ground"
export function surfaceHeight(gen, h) {
  return (gen.p.liquid && gen.contThreshold > -1e8 && h < 0) ? 0 : h;
}

// the top of whatever is here, from a sample: the sea's surface, a lake's or river's, or the
// ground (what the mesh draws and what you stand or float on)
export function surfaceOf(gen, s) {
  const h = s[S_H];
  if (s[S_WDEPTH] > 0) return h + s[S_WDEPTH];
  return (gen.p.liquid && gen.contThreshold > -1e8 && h < 0) ? 0 : h;
}

// how deep the liquid is here (the sea's, a lake's or a river's), 0 on dry ground
export function liquidDepthOf(gen, s) {
  if (s[S_WDEPTH] > 0) return s[S_WDEPTH];
  return (gen.p.liquid && gen.contThreshold > -1e8 && s[S_H] < 0) ? -s[S_H] : 0;
}
