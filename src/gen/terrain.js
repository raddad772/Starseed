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
import { fibonacciSphere, faceUVFromDir, FACES } from './cubesphere.js';
import { patchAt } from './dunes.js';
import { CraterField, VEXAG } from './craters.js';
import { SUITE, DEPOSITS, worldColumn, bedAt, faceMetres } from './geology.js';
import { craterFloor, TILE_CELLS } from './worldsim/impacts.js';
import { SnapshotSampler } from './worldsim/snapshot.js';
import { RIVER_REC, BIG_REC } from './worldsim/refine.js';
import { meanderField, meanderNear } from './meanders.js';
import { ROCKS, R as ROCK } from './worldsim/lithology.js';
import { hexToLinear } from './color.js';

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
export const S_LEN = 20;

// creeks from the terrain tiles' drainage: a channel from this much rain-weighted water (m^2),
// water in it from this much
const CREEK_A = 6e4, CREEK_WET = 2.5e5;

// a small body's relief is held to this share of its drawn radius (TerrainGenerator.hScale)
export const RELIEF_MAX = 0.06;

const tmp4 = new Float64Array(4);

function smin(a, b, k) { const h = dm.clamp(0.5 + 0.5 * (b - a) / k, 0, 1); return b + (a - b) * h - k * h * (1 - h); }
function smax(a, b, k) { return -smin(-a, -b, k); }

// the refinement's river curves' bounds (for _refRiverAt): each one's middle (x, y, z) and the
// radius round it that holds its three control points (so the curve, inside their hull)
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
    this.snap = p.snapshot ? new SnapshotSampler(p.snapshot) : null;
    // its refinement (worldsim/refine.js): the surface its water cut, the sea's reach, the rock
    if (this.snap && p.refine) this.snap.attachRefine(p.refine);
    if (this.snap && p.pyr) this.snap.attachPyr(p.pyr);
    // heights are real on worlds drawn at a tenth of their size, which makes a small body's real
    // relief a blob: it's held to ~6% of the drawn radius (no change for an Earth's or a Moon's)
    let rel = p.relief || 3000;
    if (p.snapshot) { rel = 0; for (const v of p.snapshot.h) { const a = Math.abs(v); if (a > rel) rel = a; } }
    this.hScale = Math.min(1, RELIEF_MAX * this.R / Math.max(1, rel));
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
    const o = this.snap ? this.sampleSnap(x, y, z, minWavelength, out) : this.sampleNoise(x, y, z, minWavelength, out);
    if (this.hScale < 1) { o[S_H] *= this.hScale; o[S_WDEPTH] *= this.hScale; }
    return o;
  }

  sampleNoise(x, y, z, minWavelength, out) {
    const p = this.p;
    const R = this.R;
    const relief = this.relief;
    for (let i = 0; i < S_LEN; i++) out[i] = 0;
    out[S_DX] = x; out[S_DY] = y; out[S_DZ] = z;

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

  // Annual-mean temperature and moisture
  climate(x, y, z, h, inland, out) {
    const cl = this.p.climate;
    let rel;
    if (cl.locked) {
      const ss = cl.substellar;
      const cp = x * ss[0] + y * ss[1] + z * ss[2];
      rel = (1 - cl.dayNight) + cl.dayNight * (4 * Math.max(cp, 0) + 0.02);
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
          const rr = 0.5 + 0.5 * Math.sin(ang * 23 + (h3 >>> 8));
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
    out[S_DX] = x; out[S_DY] = y; out[S_DZ] = z;
    // (the world's refinement where it has one: the world sim's surface with what its water cut)
    const ref = S.ref && S.ref.sample(S._d(x, y, z)) ? S.ref : null;
    let h = ref ? ref.h / this.hScale : S.h(x, y, z);
    // (and the finer levels of the terrain's tiles where there are any, each blended in by how
    // fully it covers the point: they fade into the coarser at the edges of what's been made)
    let sea = ref ? ref.sea : -1, lakeF = ref ? ref.lake : -1, finest = ref ? S.refCell : 0, finRd = null;
    if (S.pyr) for (const rd of S.pyrReaders()) {
      if (!rd.sample(S._d(x, y, z))) continue;
      h += (rd.h / this.hScale - h) * rd.w;
      sea = sea < 0 ? rd.sea : sea + (rd.sea - sea) * rd.w;
      lakeF = lakeF < 0 ? rd.lake : lakeF + (rd.lake - lakeF) * rd.w;
      if (rd.w > 0.5) { finest = rd.cell; finRd = rd; }
    }
    const h0 = h;
    const rel = S.relief(x, y, z);
    const mMask = dm.smoothstep(400, 2500, rel);
    out[S_MOUNT] = mMask;
    const amp = dm.clamp(rel * 0.3, 12, 900);
    let calm = 1;
    // hills from the grid's spacing down (derivative-damped: eroded-looking); with a
    // refinement, only those finer than it resolves
    {
      // (none on a sand sea: blown sand is smooth)
      if (S.s.dunes) calm = 1 - dm.smoothstep(0.15, 0.5, S.duneMask(x, y, z));
      const lam0 = S.G.spacing, lamCut = finest ? 2 * finest : 1e30;
      const hf = R / lam0;
      let fx = x * hf, fy = y * hf, fz = z * hf, nxs = x, nys = y, nzs = z;
      let sum = 0, a = 1, dx = 0, dy = 0, dz = 0, lam = lam0;
      for (let o = 0; o < 9; o++) {
        if (lam < minWavelength) break;
        const fade = dm.smoothstep(minWavelength, minWavelength * 2, lam);
        this.nHill.noised(fx, fy, fz, tmp4);
        const dr = tmp4[1] * nxs + tmp4[2] * nys + tmp4[3] * nzs;
        dx += tmp4[1] - dr * nxs; dy += tmp4[2] - dr * nys; dz += tmp4[3] - dr * nzs;
        if (lam < lamCut) sum += a * tmp4[0] * fade / (1 + 1.6 * (dx * dx + dy * dy + dz * dz));
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
      const df = R / this.lamDetail, lamCut = finest ? 2 * finest : 1e30;
      let fx = x * df, fy = y * df, fz = z * df, lam = this.lamDetail, a = (p.relief || 3000) * 0.006 * rough, sum = 0;
      for (let o = 0; o < 11; o++) {
        if (lam < minWavelength) break;
        if (lam < lamCut) sum += a * this.nDetail.noise(fx, fy, fz) * dm.smoothstep(minWavelength, minWavelength * 2, lam) * dm.smoothstep(lamCut, 0.5 * lamCut, lam);
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
    // rivers: a channel along the sim's river lines (meandering), as wide and deep as its
    // water, in a valley that levels off to its banks; the banks (and the water a little
    // below them) follow the sim's heights along the line, so the water only runs downhill
    let wl = -1e9;
    const rv = iceH > 30 ? null : this._riverAt(x, y, z);
    // (the wet ground along it, for the shading)
    if (rv && rv.dist < rv.w * 2.5) out[S_WET] = dm.smoothstep(rv.w * 2.5, rv.w * 0.6, rv.dist);
    if (rv) {
      // (a meandering river's floodplain: the belt it has swung across, laid level near its banks;
      // and the loops it cut off, lakes while young, swales once filled)
      const bank0 = Math.max(rv.hs, 0) + 1 + 0.05 * rv.depth;
      if (rv.belt > 0 && rv.axis < 1.3 * rv.belt) h += (bank0 + 0.5 - h) * 0.85 * dm.smoothstep(1.3 * rv.belt, 0.85 * rv.belt, rv.axis);
      const oh = 0.5 * (rv.oxW || rv.w);
      if (rv.ox < oh && rv.oxAge < 0.8) {
        const q = 1 - (rv.ox / oh) * (rv.ox / oh), dep = rv.depth * 0.6 * (1 - rv.oxAge);
        h = Math.min(h, bank0 - dep * q);
        if (this.wetNow && rv.oxAge < 0.5) wl = Math.max(wl, bank0 - 0.8 - 0.3 * dep);
      }
    }
    if (rv) {
      // (a river narrower than the sampling's spacing drawn as wide as it, so it shows as a line
      // from afar, not as the few samples that happen to land in it; its own width near)
      const half = Math.max(rv.w * 0.5, 0.5 * minWavelength), flank = Math.max(rv.w * 1.5 + S.G.spacing * (0.02 + 0.12 * rv.k), 1.25 * half);
      if (rv.dist < flank) {
        const bank = Math.max(rv.hs, 0) + 1 + 0.05 * rv.depth;
        h += (bank - h) * dm.smoothstep(flank, half * 1.2, rv.dist);
        if (rv.dist < half) {
          h = Math.min(h, bank - rv.depth * (1 - (rv.dist / half) * (rv.dist / half)));
          if (this.wetNow) wl = Math.max(bank - 0.6 - 0.03 * rv.depth, 0.3);
        }
      }
    }
    // creeks: where the finest level of the terrain's tiles gathers its own water (finer than the
    // world sim's rivers): a channel along each of its drainage lines, as wide and deep as its
    // water (a creek of ~0.1 km^2 a metre wide, a stream of tens of km^2 ten or more), its banks
    // the ground along the line (the valley the tile's water cut), water in it where it lasts
    if (finRd && finest <= 60 && !(rv && rv.dist < rv.w * 1.5) && finRd.creekAt(CREEK_A)) {
      const A = finRd.cA, k = dm.log(A / CREEK_A);
      const half = Math.min(0.45 * finest, 0.5 + 0.9 * dm.exp(0.45 * k)), dep = Math.min(3, 0.25 + 0.3 * dm.exp(0.3 * k));
      const dist = finRd.cd * finest, flank = half * 3;
      if (dist < flank) {
        const bank = finRd.ch / this.hScale + 0.2;
        h += (bank - h) * dm.smoothstep(flank, half * 1.2, dist);
        if (dist < half) {
          h = Math.min(h, bank - dep * (1 - (dist / half) * (dist / half)));
          if (this.wetNow && A > CREEK_WET) wl = Math.max(wl, bank - 0.25 - 0.1 * dep);
        }
      }
    }
    if (flooded && this.wetNow && lk.L > wl) wl = lk.L;
    // ground below the datum is under the sea where the sea reaches it: within about a cell of
    // the sea's own cells, where the sim's surface is low enough for the ground's dips to reach
    // the datum (the shore then the ground's own contour, not the cells'); a dip below the
    // datum beyond that is dry land
    // (a world with no liquid has no datum to lift a dip to: its craters and basins stay as deep as they are)
    const dryDip = () => !lk && wl < -1e8 && p.liquid && (sea >= 0 ? sea < 0.02 : (h0 > 1.5 * amp || S.seaDist(x, y, z) > 1.5));
    if (!(flooded && this.wetNow && lk.L > wl) && h < 0 && dryDip()) h = 0.5 - 0.02 * h;
    // tuyas: a flat lava cap where the ice's surface was (a small cone on it), flanks at ~35
    // degrees of glassy rubble down to the ground round it
    if (S.tuyaAt) {
      const ts = S.tuyaAt.get(S.G.cellAt(x, y, z));
      if (ts) for (const t of ts) {
        const dx = x - t.d[0], dy = y - t.d[1], dz = z - t.d[2], dist = Math.sqrt(dx * dx + dy * dy + dz * dz) * R;
        const edge = t.r * (1 + 0.15 * this.nMisc.noise(x * R / 900, y * R / 900, z * R / 900));
        const lift = t.top - Math.max(0, dist - edge) * 0.7 + 40 * dm.smoothstep(edge * 0.35, 0, dist);
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
    if (wl > h) out[S_WDEPTH] = wl - h;
    out[S_INLAND] = h > 0 ? 1 : 0;
    out[S_VARIANT] = this.nClimate.fbm(x * 6 + 3, y * 6, z * 6, 3);
    const Ts = S.Tsea(x, y, z);
    if (Ts != null) {
      const lapse = (p.climate && p.climate.lapse) || 0.0065;
      out[S_TEMP] = Ts - lapse * Math.max(h + out[S_WDEPTH], 0);
      out[S_MOIST] = dm.clamp(S.rain(x, y, z) / 1500, 0, 1);
    } else this.climate(x, y, z, h, out[S_INLAND], out);
    out[S_LAVA] = S.melt(x, y, z);
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

  _riverAt(x, y, z) {
    const S = this.snap, s = S.s;
    if (S.riv) return this._refRiverAt(x, y, z);
    if (!s.rcv) return null;
    const G = S.G, R = this.R, c0 = G.cellAt(x, y, z);
    // (meanders: the point pushed about on a few-km scale)
    const mf = R / 6000, mk = 2500 / R;
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
      const w = 40 + 1800 * k * k, depth = 3 + 25 * k;
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
  // the world sim's cell here and its neighbours': { dist (m), w, depth, k, hs } as _riverAt's
  _refRiverAt(x, y, z) {
    const S = this.snap, Rv = S.riv, rec = Rv.rec, G = S.G, R = this.R, nb = S.nb;
    const c0 = G.cellAt(x, y, z), nn = G.nbrs(c0, nb);
    // (each curve's bounds: a circle round its middle holding its control points, so a curve
    // that can't come nearer than the best so far is passed over)
    const bnd = Rv._bnd || (Rv._bnd = riverBounds(Rv));
    let best = null, bs = 1e30;
    for (let q = -1; q < nn; q++) {
      const c = q < 0 ? c0 : nb[q];
      for (let e = Rv.start[c]; e < Rv.start[c + 1]; e++) {
        const r = Rv.idx[e], b = r * RIVER_REC, half = Rv.half[r];
        if (Rv.big && Rv.big.has[r]) continue;   // (a great river's own winding channel, below)
        const o = r * 4, ex = bnd[o] - x, ey = bnd[o + 1] - y, ez = bnd[o + 2] - z;
        if ((Math.sqrt(ex * ex + ey * ey + ez * ez) - bnd[o + 3]) * R - 2 * half >= bs) continue;
        // (its curve: from halfway to its main inflow, through its cell, to halfway on)
        let bd = 1e30, bt = 0;
        for (let k = 0; k <= 8; k++) {
          const t = k / 8, a0 = (1 - t) * (1 - t), a1 = 2 * t * (1 - t), a2 = t * t;
          const dx = a0 * rec[b] + a1 * rec[b + 3] + a2 * rec[b + 6] - x, dy = a0 * rec[b + 1] + a1 * rec[b + 4] + a2 * rec[b + 7] - y, dz = a0 * rec[b + 2] + a1 * rec[b + 5] + a2 * rec[b + 8] - z;
          const d2 = dx * dx + dy * dy + dz * dz;
          if (d2 < bd) { bd = d2; bt = t; }
        }
        const dist = Math.sqrt(bd) * R, w = 2 * half;
        if (dist - w < bs) {
          bs = dist - w;
          const a0 = (1 - bt) * (1 - bt), a1 = 2 * bt * (1 - bt), a2 = bt * bt, k = Rv.size[r];
          best = this._rv || (this._rv = { dist: 0, w: 0, depth: 0, k: 0, hs: 0, r: 0, t: 0, axis: 0, belt: 0, ox: 1e9, oxAge: 1 });
          best.dist = dist; best.w = w; best.k = k; best.depth = 3 + 25 * k;
          best.hs = (a0 * rec[b + 9] + a1 * rec[b + 10] + a2 * rec[b + 11]) / this.hScale;
          best.r = r; best.t = bt;
        }
      }
    }
    if (best && Rv.phase) this._meander(best, x, y, z);
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
          best = this._rv || (this._rv = { dist: 0, w: 0, depth: 0, k: 0, hs: 0, r: 0, t: 0, axis: 0, belt: 0, ox: 1e9, oxAge: 1 });
          best.dist = dist; best.w = 2 * half; best.k = k; best.depth = 3 + 25 * k; best.hs = sg[sb + 8] / this.hScale;
          best.axis = dist; best.belt = 0; best.ox = 1e9; best.oxW = 0;
        }
      }
      }
    }
    if (best && oxD < (best.ox ?? 1e9)) { best.ox = oxD; best.oxAge = oxA; best.oxW = oxW; }
    return best;
  }

  // a river on a gentle floodplain winds through its belt (meanders.js: a simulated meander
  // trace laid along it by its phase, scaled to its width; the oxbows it cut off beside it):
  // rv.dist becomes the distance to the winding channel, rv.axis the distance to the valley's
  // line and rv.belt the belt's half width (0 where the river runs straight)
  _meander(rv, x, y, z) {
    const Rv = this.snap.riv, rec = Rv.rec, R = this.R, b = rv.r * RIVER_REC, w = rv.w;
    rv.axis = rv.dist; rv.belt = 0; rv.ox = 1e9; rv.oxW = 0;
    const F = this._mf || (this._mf = meanderField());
    // (how far it may swing: on a gentle slope fully, its belt kept within reach of the valley's
    // line; a steep or great river keeps nearer it)
    const len = Math.sqrt((rec[b + 6] - rec[b]) ** 2 + (rec[b + 7] - rec[b + 1]) ** 2 + (rec[b + 8] - rec[b + 2]) ** 2) * R;
    const slope = len > 0 ? (rec[b + 9] - rec[b + 11]) / len : 0;
    // (and only where the ground is sampled finely enough to show its loops: from afar it runs
    // along its valley's line)
    const A = Math.min(1 - dm.smoothstep(3e-4, 2e-3, slope), 1800 / (w * F.half)) * dm.smoothstep(6 * w, 2 * w, this._minW || 0);
    if (A < 0.35) return;
    // (the nearest point of its curve, more finely)
    const P = (t, o) => { const a0 = (1 - t) * (1 - t), a1 = 2 * t * (1 - t), a2 = t * t; o[0] = a0 * rec[b] + a1 * rec[b + 3] + a2 * rec[b + 6]; o[1] = a0 * rec[b + 1] + a1 * rec[b + 4] + a2 * rec[b + 7]; o[2] = a0 * rec[b + 2] + a1 * rec[b + 5] + a2 * rec[b + 8]; return o; };
    const pa = this._ma || (this._ma = [0, 0, 0]), pb = this._mb || (this._mb = [0, 0, 0]);
    const d2 = (t) => { P(t, pa); return (pa[0] - x) ** 2 + (pa[1] - y) ** 2 + (pa[2] - z) ** 2; };
    let lo = Math.max(0, rv.t - 0.125), hi = Math.min(1, rv.t + 0.125);
    for (let it = 0; it < 12; it++) { const m1 = lo + (hi - lo) / 3, m2 = hi - (hi - lo) / 3; if (d2(m1) < d2(m2)) hi = m2; else lo = m1; }
    const t = 0.5 * (lo + hi);
    P(t, pa);
    // (which side: the curve's direction there against the way to the point, about up)
    const a0 = 1 - t, tx = 2 * a0 * (rec[b + 3] - rec[b]) + 2 * t * (rec[b + 6] - rec[b + 3]), ty = 2 * a0 * (rec[b + 4] - rec[b + 1]) + 2 * t * (rec[b + 7] - rec[b + 4]), tz = 2 * a0 * (rec[b + 5] - rec[b + 2]) + 2 * t * (rec[b + 8] - rec[b + 5]);
    const qx = x - pa[0], qy = y - pa[1], qz = z - pa[2], side = (ty * qz - tz * qy) * x + (tz * qx - tx * qz) * y + (tx * qy - ty * qx) * z;
    const across = Math.sqrt(qx * qx + qy * qy + qz * qz) * R * (side < 0 ? -1 : 1);
    // (its phase there: up the river, in widths, from the record's cell)
    const ph = Rv.phase[rv.r] + (0.5 - t) * len / w;
    const mn = meanderNear(F, ph, across / (w * A), this._mn || (this._mn = { d: 0, ox: 0, oxAge: 0 }));
    rv.dist = mn.d * w * A; rv.belt = A * F.half * w;
    rv.ox = mn.ox * w * A; rv.oxAge = mn.oxAge;
  }

  // the simulated lake level here ({ L, own } or null: SnapshotSampler.lakeLevel), looked
  // up a little off true (wandering shores)
  _lakeAt(x, y, z) {
    const S = this.snap, R = this.R;
    const wk = 0.4 * S.G.spacing / R, wf = R / (S.G.spacing * 1.5);
    let px = x + wk * this.nMisc.noise(x * wf, y * wf, z * wf), py = y + wk * this.nMisc.noise(x * wf + 7, y * wf, z * wf), pz = z + wk * this.nMisc.noise(x * wf, y * wf + 3, z * wf);
    const l = Math.sqrt(px * px + py * py + pz * pz); px /= l; py /= l; pz /= l;
    return S.lakeLevel(px, py, pz, this._lk || (this._lk = { L: 0, own: false, q: 0 }));
  }

  // the sim's surfaces: the exposed rock in its own colour (soil over it where gentle),
  // beach sands, ice, lakes, plant cover from the life map (forest in the world's
  // foliage colour, open country drier), wet ground along rivers, a glowing melt sheet
  shadeSnap(s, slope, col, mat, nrm) {
    const p = this.p, P = p.palette, S = this.snap;
    const x = s[S_DX], y = s[S_DY], z = s[S_DZ], h = s[S_H];
    for (let i = 0; i < 7; i++) mat[i] = 0;
    const Tc = s[S_TEMP] - 273.15;
    // lakes and rivers: water over the ground, tinted by its depth (frozen when cold); the sea
    const wd = s[S_WDEPTH];
    if (!(wd > 0.05) && h < 0 && p.liquid && this.contThreshold > -1e8) return this.shadeNoise(s, slope, col, mat);
    if (wd > 0.05) {
      const k = dm.smoothstep(0, 60, wd), dim = 0.8 + 0.2 * dm.smoothstep(0, 3, wd);   // (no step at any depth: a lake's bed changing by a metre shows nowhere)
      col[0] = (P.waterShallow[0] + (P.waterDeep[0] - P.waterShallow[0]) * k) * dim;
      col[1] = (P.waterShallow[1] + (P.waterDeep[1] - P.waterShallow[1]) * k) * dim;
      col[2] = (P.waterShallow[2] + (P.waterDeep[2] - P.waterShallow[2]) * k) * dim;
      mat[4] = wd;
      if (Tc < -2) { col[0] = P.snow[0] * 0.92; col[1] = P.snow[1] * 0.95; col[2] = P.snow[2]; mat[1] = 1; mat[4] = 0; }
      return;
    }
    // (a glacier's ice: its surface is the ground here, sampleSnap)
    if (s[S_ICE] > 0.5) { col[0] = P.snow[0]; col[1] = P.snow[1]; col[2] = P.snow[2]; mat[1] = 1; mat[6] = 0.3; return; }
    // the rock (or sand) showing, and across a contact on even ground the other one, mixed
    let rt = S.rockAt(x, y, z, h / this.hScale), r2 = S.rock2;
    const mix = S.rockMix;
    // (where no tile of the terrain's has laid out the beds: the same beds the tiles have)
    if (!S.rockPyr) { rt = this._bedRock(x, y, z, h, rt); r2 = mix > 0 ? this._bedRock(x, y, z, h, r2) : rt; }
    const c1 = this.rockLin[rt] || P.rock, c2 = this.rockLin[r2] || P.rock, rc = this._rcol || (this._rcol = [0, 0, 0]);
    for (let k = 0; k < 3; k++) rc[k] = c1[k] + (c2[k] - c1[k]) * mix;
    // (a dune sea's sand over it)
    if (s[S_SAND] > 0) { const sc = this.rockLin[ROCK['quartz sand']]; if (sc) for (let k = 0; k < 3; k++) rc[k] += (sc[k] - rc[k]) * s[S_SAND]; }
    // (how much of it is sand: quartz, coral, black sand, lithology.js; no bedrock shows there)
    const sandW = Math.max((rt >= 11 ? 1 - mix : 0) + (r2 >= 11 ? mix : 0), s[S_SAND]);
    // bare rock on steep ground; soil (or regolith) on gentle
    const rockW = (1 - sandW) * dm.clamp(dm.smoothstep(0.12, 0.38, slope) + 0.3 * s[S_MOUNT] * dm.smoothstep(0.06, 0.2, slope), 0, 1);
    const ground = P.soil || P.regolith;
    // (on a dusty world (thin dry air: Mars') the dust blankets all but the steep ground, the
    // rock beneath showing only on cliffs and crater walls)
    const dusty = !p.liquid && p.airP > 0 ? 1 - dm.smoothstep(0.02, 0.05, p.airP) : 0;
    // (and what rock shows wears the same weathered rind as the dust: Mars' basalt reddened)
    if (dusty > 0 && P.rock) for (let k = 0; k < 3; k++) rc[k] += (P.rock[k] - rc[k]) * 0.5 * dusty;
    const show = sandW + (1 - sandW) * ((0.35 - 0.27 * dusty) + (0.65 + 0.27 * dusty) * rockW);
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
      const vegW = dm.clamp(cov * 1.2, 0, 1) * (1 - rockW) * (1 - 0.8 * sandW) * dm.smoothstep(-6, 2, Tc) * (1 - 0.7 * volc);
      if (vegW > 0) {
        const f = fo / Math.max(1e-3, fo + op), dry = P.vegDry || P.veg;
        const vr = dry[0] + (P.veg[0] - dry[0]) * f, vg = dry[1] + (P.veg[1] - dry[1]) * f, vb = dry[2] + (P.veg[2] - dry[2]) * f;
        r += (vr - r) * vegW; g += (vg - g) * vegW; b += (vb - b) * vegW;
        mat[0] = vegW;
      }
    }
    // rivers: wet darker ground on the floodplain (the water itself is above)
    if (s[S_WET] > 0) { const k = 0.3 * s[S_WET]; r *= 1 - k; g *= 1 - k * 0.8; b *= 1 - k * 0.6; mat[6] = Math.max(mat[6], k); }
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
    let snow = waterCycle || (p.iceCover > 0 && S.Gc) ? dm.smoothstep(sHi, sLo, Ta) * (1 - 0.5 * rockW) : 0;
    if (p.icy) snow = Math.max(snow, 0.3 * (0.5 + 0.5 * s[S_VARIANT]) * (1 - 0.5 * dm.smoothstep(0.3, 0.6, slope)) * (1 - s[S_LINEAE]));
    if (p.iceCover > 0 && !p.icy && !S.Gc) snow = Math.max(snow, dm.smoothstep(this.iceCapCut - 0.03, this.iceCapCut + 0.03, this.iceCapMetric(s)));
    snow = dm.clamp(snow, 0, 1);
    if (snow > 0) { r += (P.snow[0] - r) * snow; g += (P.snow[1] - g) * snow; b += (P.snow[2] - b) * snow; mat[1] = snow; }
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

  // the rock at (x, y, z), standing at h, where no tile of the terrain's has laid out the beds:
  // a rock of a suite (geology.js) shows its column's bed at this height, tilted and folded as
  // the tiles have it, so a tile's beds carry on past its edge (seen at this sampling's grain);
  // deposits and loose ground as they are
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
      const frozen = p.liquid === 'water' && Tc < -2;
      if (frozen || (p.frozenOcean && p.liquid !== 'methane')) {
        col[0] = P.snow[0] * 0.92; col[1] = P.snow[1] * 0.95; col[2] = P.snow[2];
        mat[1] = 1; mat[6] = 0.4;
        return;
      }
      const k = dm.smoothstep(0, 140, depth);
      col[0] = P.waterShallow[0] + (P.waterDeep[0] - P.waterShallow[0]) * k;
      col[1] = P.waterShallow[1] + (P.waterDeep[1] - P.waterShallow[1]) * k;
      col[2] = P.waterShallow[2] + (P.waterDeep[2] - P.waterShallow[2]) * k;
      mat[4] = Math.max(depth, 0.01);
      // sea ice at the poles
      if (p.liquid === 'water' && Tc < 1) {
        const ice = dm.smoothstep(1, -4, Tc);
        col[0] += (0.85 - col[0]) * ice; col[1] += (0.88 - col[1]) * ice; col[2] += (0.92 - col[2]) * ice;
        mat[1] = ice;
        if (ice > 0.5) mat[4] = 0;
      }
      return;
    }

    // ---- land
    const v = 0.5 + 0.5 * variant;
    let r = P.regolith[0] + (P.rock2[0] - P.regolith[0]) * v * 0.6;
    let g = P.regolith[1] + (P.rock2[1] - P.regolith[1]) * v * 0.6;
    let b = P.regolith[2] + (P.rock2[2] - P.regolith[2]) * v * 0.6;
    // rock exposure: steep slopes, mountains, rough terrain
    const rockW = dm.clamp(dm.smoothstep(0.18, 0.42, slope) + s[S_MOUNT] * 0.5 * dm.smoothstep(0.08, 0.25, slope) + (s[S_ROUGH] - 0.9) * 0.3, 0, 1);
    const rockR = P.rock[0] + (P.rock2[0] - P.rock[0]) * (0.5 + 0.5 * Math.sin(h * 0.004 + variant * 6)) * 0.5;
    const rockG = P.rock[1] + (P.rock2[1] - P.rock[1]) * (0.5 + 0.5 * Math.sin(h * 0.004 + variant * 6)) * 0.5;
    const rockB = P.rock[2] + (P.rock2[2] - P.rock[2]) * (0.5 + 0.5 * Math.sin(h * 0.004 + variant * 6)) * 0.5;

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
