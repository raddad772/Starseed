// Rocks on the ground, where something put them (runs in the terrain workers, with the flora; the
// world's flora field makes the same ones solid). Each candidate place is read for what would leave
// stones there:
//   talus     the foot of steep ground: blocks fallen from the face above, the bigger rolled further
//   bedrock   exposed rock with little loose ground over it: frost-shattered blocks where it lies
//   erratics  ground the ice once covered (the ground layer's glacial history): big rounded boulders
//             left on otherwise soft ground
//   streams   a steep stream's bed and banks: rounded cobbles
//   ejecta    an airless world's craters: blocks thrown out round the rims
// and nothing on sand that's moving, under snow, under water, on a meadow's soil. Sizes from a
// power law (many small, few large); half buried (more for old erratics); the rock the ground's own.
// Per rock (ROCK_STRIDE floats): x, y, z (from the node's origin), radius (m), yaw, tilt, seed,
// material class (gen/matclasses.js), roundness (0 angular .. 1 rounded), sink (fraction of radius),
// r, g, b (linear colour).
import { Rng, hashInts } from '../core/rng.js';
import { dirFromFaceUV, chunkUVBounds, chunkArcSize } from './cubesphere.js';
import { S_LEN, S_H, S_WDEPTH, S_TEMP, S_SAND, S_CRATER, S_WET } from './terrain.js';
import { MC, MAT_W0, MAT_N } from './matclasses.js';
import { CHUNK_N } from './chunkbuilder.js';
import { structureOf, regionLevel, faceMetres } from './geology.js';
import * as dm from '../core/dmath.js';

export const ROCK_STRIDE = 13;
const ROCK_CLASSES = [MC.igneous, MC.basalt, MC.layered, MC.carbonate, MC.gravel, MC.regolith, MC.crust];

export function scatterRocks(gen, face, level, ix, iy, maxLevel, seed) {
  const R = gen.R;
  const { u0, v0, size } = chunkUVBounds(level, ix, iy);
  const arc = chunkArcSize(level, R);
  const minW = chunkArcSize(maxLevel, R) / CHUNK_N * 2;
  const cdir = [0, 0, 0];
  dirFromFaceUV(face, u0 + size / 2, v0 + size / 2, cdir);
  const ox = cdir[0] * R, oy = cdir[1] * R, oz = cdir[2] * R;
  const rng = new Rng([hashInts(seed, face, level), hashInts(ix, iy, 913), seed ^ 0x2c9277b5, (ix * 2654435761) ^ (iy * 40503)]);
  const out = [];
  const s = new Float64Array(S_LEN), s2 = new Float64Array(S_LEN), col = [0, 0, 0], mat = new Float64Array(MAT_N), col2 = [0, 0, 0], mat2 = new Float64Array(MAT_N);
  const dir = [0, 0, 0], d2 = [0, 0, 0], gl = {};
  const hasSea = !!gen.p.liquid && gen.contThreshold > -1e8;
  const airless = !gen.p.liquid && !(gen.p.airP > 0.001);
  const S = gen.snap;
  // (a point d metres from dir along the ground, east (k 0) or north (k 1))
  const east = [0, 0, 0], north = [0, 0, 0];
  const offset = (d, a, b, o) => { for (let i = 0; i < 3; i++) o[i] = d[i] + (east[i] * a + north[i] * b) / R; const l = dm.hypot(o[0], o[1], o[2]); o[0] /= l; o[1] /= l; o[2] /= l; return o; };
  const hAt = (d) => { gen.sample(d[0], d[1], d[2], minW, s2); return s2[S_H] + (s2[S_WDEPTH] > 0 ? s2[S_WDEPTH] : 0); };
  const nCand = Math.min(2000, Math.round(arc * arc / 45));
  for (let n = 0; n < nCand; n++) {
    const u = u0 + rng.next() * size, v = v0 + rng.next() * size;
    dirFromFaceUV(face, u, v, dir);
    const r0 = rng.next(), r1 = rng.next(), r2 = rng.next(), r3 = rng.next();
    gen.sample(dir[0], dir[1], dir[2], minW, s);
    const h = s[S_H];
    if ((hasSea && h < 0.3) || s[S_WDEPTH] > 0.05) continue;
    // the local frame and the slope (a 4 m cross)
    const ax = Math.abs(dir[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
    east[0] = ax[1] * dir[2] - ax[2] * dir[1]; east[1] = ax[2] * dir[0] - ax[0] * dir[2]; east[2] = ax[0] * dir[1] - ax[1] * dir[0];
    let el = dm.hypot(east[0], east[1], east[2]); east[0] /= el; east[1] /= el; east[2] /= el;
    north[0] = dir[1] * east[2] - dir[2] * east[1]; north[1] = dir[2] * east[0] - dir[0] * east[2]; north[2] = dir[0] * east[1] - dir[1] * east[0];
    const gx = (hAt(offset(dir, 4, 0, d2)) - hAt(offset(dir, -4, 0, d2))) / 8, gy = (hAt(offset(dir, 0, 4, d2)) - hAt(offset(dir, 0, -4, d2))) / 8;
    const slope = dm.hypot(gx, gy);
    if (slope > 1.1) continue;   // (on a face itself nothing rests)
    gen.shade(s, Math.min(1, slope * 0.6), col, mat, null);
    const snow = mat[MAT_W0 + MC.snow], ice = mat[MAT_W0 + MC.ice], sand = mat[MAT_W0 + MC.sand];
    const cover = mat[MAT_W0 + MC.cover], soil = mat[MAT_W0 + MC.soil];
    let rockSh = 0, cls = MC.igneous, best = 0;
    for (const c of ROCK_CLASSES) { const w = mat[MAT_W0 + c]; rockSh += w; if (w > best) { best = w; cls = c; } }
    if (snow + ice > 0.75) continue;   // (buried)
    // (the most the cues below could give, from what the ground shows: most candidates end here)
    const damp0 = (1 - 0.95 * dm.smoothstep(0.3, 0.8, sand * (1 - rockSh))) * (1 - 0.7 * cover) * (1 - 0.6 * soil * (1 - rockSh)) * (1 - snow);
    if (r0 >= 2.1 * damp0 * (2 * rockSh + (S ? 0.15 : 0.1) + (s[S_WET] > 0 ? 0.5 : 0) + (airless ? 0.25 : 0) + 1.6 * dm.smoothstep(0.02, 0.15, slope))) continue;
    // the cues
    let pBed = 0, pTalus = 0, pErr = 0, pStream = 0, pEj = 0;
    const g = S && S.ground ? S.ground(dir[0], dir[1], dir[2], gl) : null;
    const loose = g ? dm.smoothstep(0.3, 3, g.lr) : 0.5;         // (metres of loose ground over the rock)
    pBed = rockSh * (1 - 0.8 * loose) * 0.7;
    // talus: the ground rising steeply above here (upslope, 15 and 35 m on)
    if (slope > 0.05) {
      const ux = gx / slope, uy = gy / slope;
      const h15 = hAt(offset(dir, ux * 15, uy * 15, d2)), h35 = hAt(offset(dir, ux * 35, uy * 35, d2));
      const above = Math.max((h15 - h) / 15, (h35 - h) / 35);
      pTalus = dm.smoothstep(0.7, 1.4, above) * dm.smoothstep(0.9, 0.35, slope) * 1.6;
    }
    if (g) pErr = dm.smoothstep(0.2, 0.7, g.glac) * 0.03 * (1 - sand);
    if (s[S_WET] > 0 && slope > 0.06) pStream = s[S_WET] * dm.smoothstep(0.06, 0.25, slope) * 0.5;
    if (airless) pEj = Math.min(1, s[S_CRATER] * 1.5 + 0.15) * 0.25;
    const damp = (1 - 0.95 * dm.smoothstep(0.3, 0.8, sand * (1 - rockSh))) * (1 - 0.7 * cover) * (1 - 0.6 * soil * (1 - rockSh)) * (1 - snow);
    const pAll = (pBed + pTalus + pErr + pStream + pEj) * damp;
    if (r0 >= pAll) continue;
    // which cue put it here, and so its size and shape
    let pick = r1 * pAll / Math.max(damp, 1e-6), kind;
    if ((pick -= pTalus) < 0) kind = 'talus'; else if ((pick -= pBed) < 0) kind = 'bed'; else if ((pick -= pErr) < 0) kind = 'err'; else if ((pick -= pStream) < 0) kind = 'stream'; else kind = 'ej';
    let rad, round, sink;
    const pl = (rmin, rmax, a) => Math.min(rmax, rmin * dm.pow(1 - r2 * 0.999, -1 / a));
    if (kind === 'talus') { rad = pl(0.15, 3.5, 1.6) * (1 + 0.6 * dm.smoothstep(0.6, 0.15, slope)); round = 0.1; sink = 0.15; }
    else if (kind === 'bed') { rad = pl(0.1, 2.2, 1.8); round = 0.05 + 0.25 * loose; sink = 0.25 + 0.3 * loose; }
    else if (kind === 'err') { rad = pl(0.8, 4.5, 1.4); round = 0.75; sink = 0.3; }
    else if (kind === 'stream') { rad = pl(0.08, 1.2, 2.0); round = 0.85; sink = 0.25; }
    else { rad = pl(0.1, 3, 1.5); round = 0.15; sink = 0.2; }
    if (g && g.youth > 0.3) round *= 0.6;
    // its rock: the class the ground shows (stream cobbles and erratics: the rock's, worn); its colour
    // the rock's own, read as the ground would show bare rock here
    gen.shade(s, 1, col2, mat2, null);
    const r = R + h;
    out.push(dir[0] * r - ox, dir[1] * r - oy, dir[2] * r - oz, rad, r3 * dm.TWO_PI, (rng.next() - 0.5) * 0.5, rng.next(), cls, round, sink, col2[0], col2[1], col2[2]);
  }
  // corestones: a granite (or a basalt) weathers from its joints in, the water working down each
  // crack and rotting the rock to grus, fastest at a block's corners and edges, so each block's fresh
  // middle is left rounded inside the rot (spheroidal weathering). Where the ground wears down faster
  // than the rot goes deeper (a steep slope, a ridge, a stream's bank: rock showing, little loose ground
  // over it) the grus is carried off and the cores stay: boulder slopes and tors (Linton 1955; Twidale
  // 1982). Not on ground frozen most of the year: frost splits the blocks angular (the bedrock cue's).
  // The blocks are the joints': two sets across each other along the region's master joints
  // (geology.js), each a scatter of planes spaced at random about their mean (negative exponential:
  // Priest and Hudson 1976); between two master joints a compartment, its own spacing, some massive and
  // some closely jointed; the master joints' water rotting a wider zone either side. A block keeps a
  // core where its least half-size is more than the rot's depth, so a massive compartment leaves big
  // cores and a closely jointed one rots through to grus: tors stand in the one, the other wears into
  // a hollow. The cues read on a 12 m grid; each block in the cell its middle falls in
  {
    const CG = 12, G2 = Math.max(1, Math.round(arc / CG)), sub = [0, 0, 0], Mu = faceMetres(R), nR = 1 << regionLevel(R), sR = 2 / nR;
    // (a set's planes from qa to qb along its normal, and the one either side, into o as (place, 1 for a
    // master joint): its master joints, and between each two the compartment's own)
    const planes = (Js, Jc, qa, qb, o) => {
      o.length = 0;
      const sp = Js.sp, i0 = Math.floor(qa / sp) - 1, i1 = Math.floor(qb / sp) + 1;
      const M = (i) => (i + 0.5 + 0.9 * (hashInts(Js.key, i, 0x77a1, 1) / 4294967296 - 0.5)) * sp;
      for (let i = i0; i <= i1; i++) {
        const ma = M(i), mb = M(i + 1), J = Jc * (0.4 + 1.2 * hashInts(Js.key, i, 0x3c1, 2) / 4294967296);
        let p = ma;
        for (let n = 0; n < 96 && p < mb; n++) { o.push(p, n === 0 ? 1 : 0); p += J * -dm.log(1 - hashInts(Js.key, i, n, 0x5a3) / 4294967296 * 0.999); }
      }
      // (keep from the last below qa to the first past qb)
      let lo = 0, hi = o.length - 2;
      while (lo + 2 < o.length && o[lo + 2] <= qa) lo += 2;
      while (hi - 2 >= 0 && o[hi - 2] >= qb) hi -= 2;
      return [lo, hi];
    };
    const P1 = [], P2 = [];
    for (let j = 0; j < G2; j++) for (let i = 0; i < G2; i++) {
      const ua = u0 + i / G2 * size, ub = u0 + (i + 1) / G2 * size, va = v0 + j / G2 * size, vb = v0 + (j + 1) / G2 * size;
      dirFromFaceUV(face, 0.5 * (ua + ub), 0.5 * (va + vb), dir);
      gen.sample(dir[0], dir[1], dir[2], minW, s);
      const h = s[S_H];
      if ((hasSea && h < 0.3) || s[S_WDEPTH] > 0.05) continue;
      const Tc = s[S_TEMP] - 273.15, chem = dm.smoothstep(-2, 8, Tc);
      if (chem <= 0) continue;
      const ST = structureOf(gen, face, Math.min(nR - 1, Math.max(0, Math.floor((0.5 * (ua + ub) + 1) / sR))), Math.min(nR - 1, Math.max(0, Math.floor((0.5 * (va + vb) + 1) / sR))));
      if (ST.joints.length < 2) continue;
      const ax = Math.abs(dir[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
      east[0] = ax[1] * dir[2] - ax[2] * dir[1]; east[1] = ax[2] * dir[0] - ax[0] * dir[2]; east[2] = ax[0] * dir[1] - ax[1] * dir[0];
      const el = dm.hypot(east[0], east[1], east[2]); east[0] /= el; east[1] /= el; east[2] /= el;
      north[0] = dir[1] * east[2] - dir[2] * east[1]; north[1] = dir[2] * east[0] - dir[0] * east[2]; north[2] = dir[0] * east[1] - dir[1] * east[0];
      const gx = (hAt(offset(dir, 4, 0, d2)) - hAt(offset(dir, -4, 0, d2))) / 8, gy = (hAt(offset(dir, 0, 4, d2)) - hAt(offset(dir, 0, -4, d2))) / 8;
      const slope = dm.hypot(gx, gy);
      if (slope > 1.2) continue;
      gen.shade(s, Math.min(1, slope * 0.6), col, mat, null);
      const ig = mat[MAT_W0 + MC.igneous], ba = mat[MAT_W0 + MC.basalt], massive = Math.max(ig, ba), cls = ig >= ba ? MC.igneous : MC.basalt;
      if (massive < 0.12) continue;
      // (the grus stripped as the slope steepens: soil creeps faster the steeper, so its mantle thins
      // toward bare rock; on gentle ground most cores stay buried in it)
      const snow = mat[MAT_W0 + MC.snow] + mat[MAT_W0 + MC.ice], cover = mat[MAT_W0 + MC.cover];
      const expose = massive * chem * (0.2 + 0.8 * dm.smoothstep(0.08, 0.5, slope)) * (1 - snow) * (1 - 0.6 * cover);
      if (expose < 0.04) continue;
      // (the joints' mean spacing: a granite's a few metres, a basalt's blockier; the rot's depth the
      // same in every block, deeper the warmer)
      const Jm = cls === MC.igneous ? 3.2 : 1.6, rot = Jm * (0.1 + 0.25 * chem);
      const A = ST.joints[0], B = ST.joints[1], n1x = dm.cos(A.a), n1y = dm.sin(A.a), n2x = dm.cos(B.a), n2y = dm.sin(B.a);
      // (the cell's corners along each set's normal)
      const XA = ua * Mu, XB = ub * Mu, YA = va * Mu, YB = vb * Mu;
      let q1a = Infinity, q1b = -Infinity, q2a = Infinity, q2b = -Infinity;
      for (const X of [XA, XB]) for (const Y of [YA, YB]) { const q1 = X * n1x + Y * n1y, q2 = X * n2x + Y * n2y; q1a = Math.min(q1a, q1); q1b = Math.max(q1b, q1); q2a = Math.min(q2a, q2); q2b = Math.max(q2b, q2); }
      const [a1, b1] = planes(A, Jm, q1a, q1b, P1), [a2, b2] = planes(B, Jm * (B.sp / A.sp), q2a, q2b, P2);
      const det = n1x * n2y - n1y * n2x;
      if (Math.abs(det) < 0.2) continue;
      let colDone = false;
      for (let e = a1; e < b1; e += 2) for (let f = a2; f < b2; f += 2) {
        const c1 = 0.5 * (P1[e] + P1[e + 2]), c2 = 0.5 * (P2[f] + P2[f + 2]);
        // (the block's middle in the face's metres: its cell's, or another's)
        const X = (c1 * n2y - c2 * n1y) / det, Y = (n1x * c2 - n2x * c1) / det;
        if (X < XA || X >= XB || Y < YA || Y >= YB) continue;
        const h1 = 0.5 * (P1[e + 2] - P1[e]), h2 = 0.5 * (P2[f + 2] - P2[f]);
        // (its height between sheeting joints, spaced as the rest; and the rot, deeper in a block against
        // a master joint)
        const kb = hashInts(A.key, Math.round(c1 * 8), Math.round(c2 * 8), 0x51c0), u3 = (kb >>> 8) / 16777216;
        const h3 = 0.5 * Jm * -dm.log(1 - 0.999 * u3);
        const d = rot * (P1[e + 1] || P1[e + 3] || P2[f + 1] || P2[f + 3] ? 2.5 : 1);
        const k1 = h1 - d, k2 = h2 - d, k3 = h3 - d;
        if (k1 < 0.15 || k2 < 0.15 || k3 < 0.15) continue;
        // (shown where the grus has gone from round it)
        const rb = new Rng([kb, hashInts(seed, face, 0x3c7), seed ^ 0x1b873593, 0x9e37]);
        if (rb.next() >= Math.min(0.9, 1.6 * expose)) continue;
        dirFromFaceUV(face, X / Mu, Y / Mu, sub);
        gen.sample(sub[0], sub[1], sub[2], minW, s2);
        if ((hasSea && s2[S_H] < 0.3) || s2[S_WDEPTH] > 0.05) continue;
        if (!colDone) { gen.shade(s, 1, col2, mat2, null); colDone = true; }
        const r = R + s2[S_H], rad = dm.cbrt(k1 * k2 * k3);
        // (rounder the more of its block the rot took; along the joints' strike; still in the slope where
        // it formed: the ground wearing down knows nothing of where the cores lie, so its surface cuts
        // each at any height, from a cap showing to all but its foot out (one that far out has no grus
        // left to hold it: it sits). Upright, not tilted with the slope: the uphill side deeper in)
        const round = 0.35 + 0.55 * dm.smoothstep(0, 1, d / Math.min(h1, h2, h3));
        out.push(sub[0] * r - ox, sub[1] * r - oy, sub[2] * r - oz, rad, A.a + 0.3 * (rb.next() - 0.5), (rb.next() - 0.5) * 0.15, rb.next(), cls, round, 0.1 + 0.8 * rb.next(), col2[0], col2[1], col2[2]);
      }
    }
  }
  return { origin: [ox, oy, oz], rocks: new Float32Array(out) };
}

// a rock's flattening (its height over its width) and how deep it's sunk, from its seed and its
// sink: the renderer's vertex shader (render/rockRender.js) and the solid field use the same
export function rockShapeOf(seed, sink) {
  return { sy: 0.5 + 0.4 * ((seed * 7.31) % 1), sink };
}

// the small stones near the camera (5..35 cm): many, a node of the terrain's a few levels finer than
// the flora's, made only for the ground near the camera and dropped behind (render/planetTerrain.js);
// where the ground is stony: its rock showing, gravel, a steep slope's debris, an airless world's
// regolith; few on soil and plants, none on moving sand, snow or water. Read on a ~6 m grid of the
// ground's classes, each stone on the ground's own height.
export function scatterStones(gen, face, level, ix, iy, maxLevel, seed) {
  const R = gen.R;
  const { u0, v0, size } = chunkUVBounds(level, ix, iy);
  const arc = chunkArcSize(level, R);
  const minW = chunkArcSize(maxLevel, R) / CHUNK_N;
  const cdir = [0, 0, 0];
  dirFromFaceUV(face, u0 + size / 2, v0 + size / 2, cdir);
  const ox = cdir[0] * R, oy = cdir[1] * R, oz = cdir[2] * R;
  const rng = new Rng([hashInts(seed, face, level), hashInts(ix, iy, 5311), seed ^ 0x6c8e9cf5, (ix * 97) ^ (iy * 2654435761)]);
  const s = new Float64Array(S_LEN), col = [0, 0, 0], mat = new Float64Array(MAT_N), dir = [0, 0, 0];
  const hasSea = !!gen.p.liquid && gen.contThreshold > -1e8;
  const airless = !gen.p.liquid && !(gen.p.airP > 0.001);
  const G = Math.max(2, Math.round(arc / 6)), cells = [];
  for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) {
    dirFromFaceUV(face, u0 + (i + 0.5) / G * size, v0 + (j + 0.5) / G * size, dir);
    gen.sample(dir[0], dir[1], dir[2], minW * 4, s);
    if ((hasSea && s[S_H] < 0.3) || s[S_WDEPTH] > 0.05) { cells.push(0, 0); continue; }
    gen.shade(s, 0.3, col, mat, null);
    let rockSh = 0, cls = MC.igneous, best = 0;
    for (const c of ROCK_CLASSES) { const w = mat[MAT_W0 + c]; rockSh += w; if (w > best) { best = w; cls = c; } }
    const sand = mat[MAT_W0 + MC.sand], snow = mat[MAT_W0 + MC.snow] + mat[MAT_W0 + MC.ice], cover = mat[MAT_W0 + MC.cover], gravel = mat[MAT_W0 + MC.gravel];
    let dens = (1.2 * rockSh + 1.0 * gravel + (airless ? 0.5 : 0.08)) * (1 - 0.9 * sand) * (1 - snow) * (1 - 0.8 * cover);
    cells.push(Math.max(0, Math.min(1.5, dens)), cls);
  }
  // (up to ~0.25 stones a square metre where it's stoniest)
  const n = Math.min(4000, Math.round(arc * arc * 0.25));
  const out = [];
  for (let k = 0; k < n; k++) {
    const fu = rng.next(), fv = rng.next(), r0 = rng.next(), r2 = rng.next();
    const ci = Math.min(G - 1, Math.floor(fu * G)), cj = Math.min(G - 1, Math.floor(fv * G)), c = (cj * G + ci) * 2;
    if (r0 >= cells[c] / 1.5) { rng.next(); rng.next(); rng.next(); continue; }
    dirFromFaceUV(face, u0 + fu * size, v0 + fv * size, dir);
    gen.sample(dir[0], dir[1], dir[2], minW, s);
    const h = s[S_H], r = R + h;
    const rad = Math.min(0.35, 0.05 * dm.pow(1 - r2 * 0.999, -1 / 1.7));
    // (one that's rolled in at a shore lies on the bed, seen through the water: the ground's colour)
    s[S_WDEPTH] = 0;
    gen.shade(s, 1, col, mat, null);
    out.push(dir[0] * r - ox, dir[1] * r - oy, dir[2] * r - oz, rad, rng.next() * dm.TWO_PI, (rng.next() - 0.5) * 0.7, rng.next(), cells[c + 1], 0.15 + 0.25 * rng.next(), 0.3, col[0], col[1], col[2]);
  }
  return { origin: [ox, oy, oz], geo: new Float32Array(out) };
}
