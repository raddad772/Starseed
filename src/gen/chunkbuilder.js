// Builds one quadtree chunk of a planet surface (runs in Web Workers).
//
// Each vertex carries its own position plus a morph target: the position the
// parent chunk's mesh has at that spot (parent vertices for even indices,
// edge midpoints / the parent triangle's diagonal midpoint for odd ones),
// computed with the parent's coarser octave band. The vertex shader blends
// toward the morph target with distance, so a chunk is geometrically identical
// to its parent at the moment they swap: no popping, no T-junction cracks.

import { dirFromFaceUV, faceUVFromDir, chunkUVBounds, chunkArcSize } from './cubesphere.js';
import { S_LEN, S_H, S_WLVL, S_FLX, S_FLV, S_RIVR, S_RFADE, S_WDEPTH, S_TEMP, surfaceOf } from './terrain.js';
import { MAT_W0, MAT_N } from './matclasses.js';

export const CHUNK_N = 32; // quads per side (even)
// rivers drawn as a surface of their own (terrain.js riverRibbons; terrainMaterial.js's RIBBON) in
// chunks finer than this (m between vertices): their shore where the ground rises out of the water,
// to the pixel, not along the mesh's triangles; the mesh there their bed
export const RIBBON_SPACING = 40;

const indexCache = new Map();
// Shared index buffer: grid triangles + skirt quads
export function chunkIndices(N) {
  if (indexCache.has(N)) return indexCache.get(N);
  const V = N + 1;
  const grid = V * V;
  const idx = new Uint16Array(N * N * 6 + 4 * N * 6);
  let k = 0;
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const a = j * V + i, b = a + 1, c = a + V + 1, d = a + V;
      // diagonal a-c (matches the morph-target construction)
      idx[k++] = a; idx[k++] = b; idx[k++] = c;
      idx[k++] = a; idx[k++] = c; idx[k++] = d;
    }
  }
  // skirts: edge order bottom (j=0), right (i=N), top (j=N), left (i=0)
  const edges = edgeVertexLists(N);
  for (let e = 0; e < 4; e++) {
    const list = edges[e];
    const base = grid + e * V;
    for (let s = 0; s < N; s++) {
      const a = list[s], b = list[s + 1], a2 = base + s, b2 = base + s + 1;
      // winding chosen so the skirt faces outward from the chunk interior
      // bottom/right edges run with the outward side on their left; top/left on their right
      if (e === 0 || e === 1) { idx[k++] = a; idx[k++] = a2; idx[k++] = b2; idx[k++] = a; idx[k++] = b2; idx[k++] = b; }
      else { idx[k++] = a; idx[k++] = b2; idx[k++] = a2; idx[k++] = a; idx[k++] = b; idx[k++] = b2; }
    }
  }
  indexCache.set(N, idx);
  return idx;
}

function edgeVertexLists(N) {
  const V = N + 1;
  const bottom = [], right = [], top = [], left = [];
  for (let s = 0; s <= N; s++) {
    bottom.push(s);                 // j = 0, i = s
    right.push(s * V + N);          // i = N, j = s
    top.push(N * V + s);            // j = N, i = s
    left.push(s * V);               // i = 0, j = s
  }
  return [bottom, right, top, left];
}

function encodeColor(c) { return Math.max(0, Math.min(255, Math.round(Math.sqrt(Math.max(c, 0)) * 255))); }
function encodeWater(depth) { return depth > 0 ? Math.max(1, Math.min(255, Math.round(Math.sqrt(depth / 6000) * 255))) : 0; }
// a vertex's height against the water, signed (m): its depth under it, or on land how far above
// the water beside it (a river's, a creek's or a lake's level where the sample has one: terrain.js
// S_WLVL; else the sea's): the shader's shore is where it crosses 0 between vertices, so the edge
// lies where the ground meets the water, straight across a triangle, not stepping round its land
// corners. (Inland water at least 0.3 m deep there: a film shallower than the mesh can show)
function shoreDepth(depth, h, kind, wl) {
  if (!(depth > 0)) return -Math.min(2, Math.max(0.02, wl > -1e8 ? h - wl : h));
  return kind < 0.2 ? depth : Math.max(depth, 0.3);
}
// (into the normal's spare byte, companded: fine near the shore)
function encodeShore(d) {
  const v = Math.round(Math.sign(d) * Math.sqrt(Math.min(Math.abs(d), 64) / 64) * 127);
  return d > 0 ? Math.max(1, v) : Math.min(-1, v);
}

// scratch buffers reused between chunks
let scratchN = 0, fineS, fineP, coarseS, coarseP, fineNrm, coarseNrm, coarseCol, rivWd, lvL, lvK, lvF, lvC, seaBed, cSeaBed;

export function buildChunk(gen, face, level, ix, iy, N = CHUNK_N) {
  const R = gen.R;
  const V = N + 1;
  const FV = N + 3; // fine grid incl. 1-vertex border
  const CN = N / 2;
  const CV = CN + 3; // coarse grid incl. border
  if (scratchN !== N) {
    scratchN = N;
    fineS = new Float64Array(FV * FV * S_LEN);
    fineP = new Float64Array(FV * FV * 3);
    coarseS = new Float64Array(CV * CV * S_LEN);
    coarseP = new Float64Array(CV * CV * 3);
    fineNrm = new Float64Array(V * V * 3);
    coarseNrm = new Float64Array((CN + 1) * (CN + 1) * 3);
    coarseCol = new Float64Array((CN + 1) * (CN + 1) * 4);
    rivWd = new Float64Array(FV * FV);
    lvL = new Float64Array(FV * FV); lvK = new Float64Array(FV * FV); lvF = new Float64Array(FV * FV); lvC = new Float64Array(FV * FV * 3);
    seaBed = new Uint8Array(FV * FV); cSeaBed = new Uint8Array(CV * CV);
  }
  const { u0, v0, size } = chunkUVBounds(level, ix, iy);
  const du = size / N;
  const arc = chunkArcSize(level, R);
  const spacing = arc / N;
  const minW = spacing * 2;
  const coarseMinW = spacing * 4;
  // (a river's water, where the ribbons draw it: the mesh its bed, the water's depth kept for its falls.
  // Not where it's frozen the year round: ice, the ground's. The parent's grid, the morph's, bed
  // wherever it's a river's, so a mesh morphed toward it doesn't rise through its ribbon)
  const ribbons = spacing < RIBBON_SPACING && gen.riverRibbons && gen.snap && gen.snap.riv, frz = ribbons ? gen._freezeC() : 0;
  const bed = (s, coarse) => {
    if (!ribbons || !(s[S_RIVR] > 0) || !(s[S_WDEPTH] > 0) || (!coarse && s[S_RFADE] > 0) || s[S_TEMP] - 273.15 - frz < -8) return 0;
    // (nor a river come down to the sea, its level held at the datum's: riverRibbons draws none there)
    if (s[S_RIVR] === 1 && s[S_WLVL] < 0.301 * gen.hScale) return 0;
    const wd = s[S_WDEPTH];
    s[S_WDEPTH] = 0;
    return wd;
  };
  // (and the sea's and the lakes' water, in the same chunks: a surface of its own at its level, flat,
  // over each water vertex and the one under the land beside it, so its shore is where the ground rises
  // out of it; the mesh there its bed, a lake's shaded as ground, the sea's floor too (gen._bed). Not
  // the rivers' and creeks' (riverRibbons) save a river come down to the sea, nor a lake frozen the year
  // round or a frozen ocean's shell (ice, the ground's); a sea's pack ice the shader's floes)
  const LV = spacing < RIBBON_SPACING && !!gen.snap && !!gen.p.liquid && gen.p.liquid !== 'lava', P = gen.p.palette;
  const levelWater = (s, k, coarse) => {
    if (!coarse) lvL[k] = -1e9;
    if (!LV) return 0;
    const h = s[S_H], wd = s[S_WDEPTH], Tc = s[S_TEMP] - 273.15;
    const atSea = s[S_RIVR] === 1 && s[S_WLVL] < 0.301 * gen.hScale && gen.contThreshold > -1e8;
    if (s[S_RIVR] > 0 && !atSea) return 0;
    let L, kind, fetch, kc, depth;
    if (wd > 0.05 && !atSea) {
      if (Tc - frz < -8) return 0;
      L = h + wd; depth = wd; kind = wd < 3 ? 1 : 0.4; fetch = wd < 3 ? 0.05 : 0.1 + 0.7 * Math.min(1, Math.max(0, (wd - 3) / 37)) ** 2 * (3 - 2 * Math.min(1, Math.max(0, (wd - 3) / 37)));
      kc = Math.min(1, wd / 60);
      s[S_WDEPTH] = 0;
    } else if (gen.contThreshold > -1e8 && (h < 0 || atSea)) {
      if (gen.p.frozenOcean && gen.p.liquid !== 'methane') return 0;
      L = 0; depth = Math.max(0, -h); kind = 0; fetch = 1; kc = Math.min(1, depth / 140);
      s[S_WDEPTH] = 0;
    } else return 0;
    if (!coarse) {
      lvL[k] = L; lvK[k] = kind; lvF[k] = fetch;
      // (its own colour where it's deep, as the terrain draws it from afar: the palette's by depth; the
      // sea's its deep water's at any depth, its shallows' look from afar being its bed's, which the
      // water's shader shows through it near: the palette's shallow cyan there too counted the bed twice,
      // a flat glowing cyan whatever the depth)
      const e = kind === 0 ? 1 : kc * kc * (3 - 2 * kc);
      for (let c = 0; c < 3; c++) lvC[k * 3 + c] = P.waterShallow[c] + (P.waterDeep[c] - P.waterShallow[c]) * e;
    }
    return 1;
  };

  // chunk origin: centre direction at datum radius
  const cdir = [0, 0, 0];
  dirFromFaceUV(face, u0 + size / 2, v0 + size / 2, cdir);
  const ox = cdir[0] * R, oy = cdir[1] * R, oz = cdir[2] * R;

  const dir = [0, 0, 0];
  const rec = new Float64Array(S_LEN);
  let minH = Infinity, maxH = -Infinity;

  // ---- fine grid (with border)
  for (let j = 0; j < FV; j++) {
    for (let i = 0; i < FV; i++) {
      const u = u0 + (i - 1) * du, v = v0 + (j - 1) * du;
      dirFromFaceUV(face, u, v, dir);
      const k = j * FV + i;
      const s = fineS.subarray(k * S_LEN, k * S_LEN + S_LEN);
      gen.sample(dir[0], dir[1], dir[2], minW, s);
      rivWd[k] = bed(s, false);
      seaBed[k] = levelWater(s, k, false);
      const h = seaBed[k] ? s[S_H] : surfaceOf(gen, s);
      const r = R + h;
      fineP[k * 3] = dir[0] * r; fineP[k * 3 + 1] = dir[1] * r; fineP[k * 3 + 2] = dir[2] * r;
      if (i > 0 && j > 0 && i < FV - 1 && j < FV - 1) { if (h < minH) minH = h; if (h > maxH) maxH = h; }
    }
  }
  // fine normals (central differences; grid tangents u, v; U x V = outward)
  for (let j = 0; j < V; j++) {
    for (let i = 0; i < V; i++) {
      const c = (j + 1) * FV + (i + 1);
      const l = c - 1, rr = c + 1, d = c - FV, uu = c + FV;
      const tx = fineP[rr * 3] - fineP[l * 3], ty = fineP[rr * 3 + 1] - fineP[l * 3 + 1], tz = fineP[rr * 3 + 2] - fineP[l * 3 + 2];
      const bx = fineP[uu * 3] - fineP[d * 3], by = fineP[uu * 3 + 1] - fineP[d * 3 + 1], bz = fineP[uu * 3 + 2] - fineP[d * 3 + 2];
      let nx = ty * bz - tz * by, ny = tz * bx - tx * bz, nz = tx * by - ty * bx;
      const nl = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
      nx /= nl; ny /= nl; nz /= nl;
      // outward check
      const px = fineP[c * 3], py = fineP[c * 3 + 1], pz = fineP[c * 3 + 2];
      if (nx * px + ny * py + nz * pz < 0) { nx = -nx; ny = -ny; nz = -nz; }
      const o = (j * V + i) * 3;
      fineNrm[o] = nx; fineNrm[o + 1] = ny; fineNrm[o + 2] = nz;
    }
  }

  // ---- coarse (parent-level) grid
  const hasParent = level > 0, nv = [0, 0, 0];
  if (hasParent) {
    const cdu = du * 2;
    for (let j = 0; j < CV; j++) {
      for (let i = 0; i < CV; i++) {
        const u = u0 + (i - 1) * cdu, v = v0 + (j - 1) * cdu;
        dirFromFaceUV(face, u, v, dir);
        const k = j * CV + i;
        const s = coarseS.subarray(k * S_LEN, k * S_LEN + S_LEN);
        gen.sample(dir[0], dir[1], dir[2], coarseMinW, s);
        bed(s, true);
        cSeaBed[k] = levelWater(s, k, true);
        const h = cSeaBed[k] ? s[S_H] : surfaceOf(gen, s);
        const r = R + h;
        coarseP[k * 3] = dir[0] * r; coarseP[k * 3 + 1] = dir[1] * r; coarseP[k * 3 + 2] = dir[2] * r;
      }
    }
    const CVi = CN + 1;
    const col = [0, 0, 0], mat = new Float64Array(8);
    // (the vertices' spacing, the parent's: shade grades the rock's contacts over it)
    gen._shadeSp = 2 * spacing;
    for (let j = 0; j < CVi; j++) {
      for (let i = 0; i < CVi; i++) {
        const c = (j + 1) * CV + (i + 1);
        const l = c - 1, rr = c + 1, d = c - CV, uu = c + CV;
        const tx = coarseP[rr * 3] - coarseP[l * 3], ty = coarseP[rr * 3 + 1] - coarseP[l * 3 + 1], tz = coarseP[rr * 3 + 2] - coarseP[l * 3 + 2];
        const bx = coarseP[uu * 3] - coarseP[d * 3], by = coarseP[uu * 3 + 1] - coarseP[d * 3 + 1], bz = coarseP[uu * 3 + 2] - coarseP[d * 3 + 2];
        let nx = ty * bz - tz * by, ny = tz * bx - tx * bz, nz = tx * by - ty * bx;
        const nl = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
        nx /= nl; ny /= nl; nz /= nl;
        const px = coarseP[c * 3], py = coarseP[c * 3 + 1], pz = coarseP[c * 3 + 2];
        const pl = Math.sqrt(px * px + py * py + pz * pz);
        let up = (nx * px + ny * py + nz * pz) / pl;
        if (up < 0) { nx = -nx; ny = -ny; nz = -nz; up = -up; }
        const o = (j * CVi + i) * 3;
        coarseNrm[o] = nx; coarseNrm[o + 1] = ny; coarseNrm[o + 2] = nz;
        const s = coarseS.subarray(c * S_LEN, c * S_LEN + S_LEN);
        nv[0] = nx; nv[1] = ny; nv[2] = nz;
        gen._bed = cSeaBed[c] === 1;
        gen.shade(s, 1 - up, col, mat, nv);
        gen._bed = false;
        const oc = (j * CVi + i) * 4;
        coarseCol[oc] = col[0]; coarseCol[oc + 1] = col[1]; coarseCol[oc + 2] = col[2]; coarseCol[oc + 3] = shoreDepth(mat[4], s[0], mat[0], s[S_WLVL]);
      }
    }
  }

  // ---- pack vertex attributes
  const SK = 4 * V;
  const nVert = V * V + SK;
  const position = new Float32Array(nVert * 3);
  const morph = new Float32Array(nVert * 3);
  const nrm = new Int8Array(nVert * 4);
  const mnrm = new Int8Array(nVert * 4);
  const colA = new Uint8Array(nVert * 4);
  const mcolA = new Uint8Array(nVert * 4);
  const matA = new Uint8Array(nVert * 4);
  const extA = new Uint8Array(nVert * 4);
  // (a liquid's surface, render/liquid.js: 1 where it's liquid, then what it is, its temperature, a
  // river's flow or a lake's fetch; 0 on land, so a shore's triangles can take the water's own. 16
  // bits: the season's ice edge turns on a fraction of a degree, and gen/liquidice.js must agree)
  const liqA = new Uint16Array(nVert * 4);
  // (running water's way down, planet-fixed, and its speed / 9 m/s: terrain.js S_FLX..S_FLV; 0 still
  // and on land)
  const flwA = new Int8Array(nVert * 4);
  // (where a river's water runs steep: its fall, and how deep it runs there; findFalls)
  const steepA = new Float32Array(V * V), wdA = new Float32Array(V * V);
  // (each material class's share: matclasses.js, 12 a vertex)
  const NC = MAT_N - MAT_W0, clsA = new Uint8Array(nVert * NC);
  const col = [0, 0, 0], mat = new Float64Array(MAT_N);
  const CVi = CN + 1;
  const cp = (ci, cj, out, o) => { // coarse interior vertex position -> out[o..o+2]
    const k = (cj + 1) * CV + (ci + 1);
    out[o] = coarseP[k * 3]; out[o + 1] = coarseP[k * 3 + 1]; out[o + 2] = coarseP[k * 3 + 2];
  };
  const tA = [0, 0, 0], tB = [0, 0, 0];

  gen._shadeSp = spacing;
  for (let j = 0; j < V; j++) {
    for (let i = 0; i < V; i++) {
      const vi = j * V + i;
      const fk = (j + 1) * FV + (i + 1);
      const s = fineS.subarray(fk * S_LEN, fk * S_LEN + S_LEN);
      const px = fineP[fk * 3], py = fineP[fk * 3 + 1], pz = fineP[fk * 3 + 2];
      position[vi * 3] = px - ox; position[vi * 3 + 1] = py - oy; position[vi * 3 + 2] = pz - oz;
      const no = vi * 3;
      const nx = fineNrm[no], ny = fineNrm[no + 1], nz = fineNrm[no + 2];
      const pl = Math.sqrt(px * px + py * py + pz * pz);
      const up = (nx * px + ny * py + nz * pz) / pl;
      nv[0] = nx; nv[1] = ny; nv[2] = nz;
      gen._bed = seaBed[fk] === 1;
      gen.shade(s, 1 - up, col, mat, nv);
      gen._bed = false;
      nrm[vi * 4] = Math.round(nx * 127); nrm[vi * 4 + 1] = Math.round(ny * 127); nrm[vi * 4 + 2] = Math.round(nz * 127);
      if (mat[4] > 0 && mat[0] > 0.55 && mat[0] < 0.85) { steepA[vi] = 1 - up; wdA[vi] = mat[4]; }
      const sd = shoreDepth(mat[4], s[0], mat[0], s[S_WLVL]);
      nrm[vi * 4 + 3] = encodeShore(sd);
      colA[vi * 4] = encodeColor(col[0]); colA[vi * 4 + 1] = encodeColor(col[1]); colA[vi * 4 + 2] = encodeColor(col[2]);
      colA[vi * 4 + 3] = encodeWater(mat[4]);
      // (a bed under the sea's or a lake's own surface: how deep it lies, for the shader to leave out the
      // ground's fine materials where no one sees them through the water)
      if (seaBed[fk]) colA[vi * 4 + 3] = encodeWater(Math.max(0, lvL[fk] - s[S_H]));
      if (mat[4] > 0 && s[S_FLV] > 0) {
        flwA[vi * 4] = Math.round(s[S_FLX] * 127); flwA[vi * 4 + 1] = Math.round(s[S_FLX + 1] * 127); flwA[vi * 4 + 2] = Math.round(s[S_FLX + 2] * 127);
        flwA[vi * 4 + 3] = Math.round(Math.min(1, s[S_FLV] / 9) * 127);
      }
      if (mat[4] > 0) {
        liqA[vi * 4] = 65535; liqA[vi * 4 + 1] = Math.round(mat[0] * 65535); liqA[vi * 4 + 2] = Math.round(mat[1] * 65535);
        liqA[vi * 4 + 3] = Math.round((mat[0] > 0.55 && mat[0] < 0.85 ? mat[2] : mat[3]) * 65535);
      } else {
        matA[vi * 4] = Math.round(mat[0] * 255); matA[vi * 4 + 1] = Math.round(mat[1] * 255);
        matA[vi * 4 + 2] = Math.round(mat[2] * 255); matA[vi * 4 + 3] = Math.round(mat[3] * 255);
      }
      extA[vi * 4] = Math.round(Math.min(1, mat[5]) * 255);
      extA[vi * 4 + 1] = Math.round(Math.min(1, mat[6]) * 255);
      extA[vi * 4 + 2] = Math.round(Math.min(1, s[12] / 1.4) * 255); // roughness
      // (the year's mean temperature here, C: -60..60 over the byte, the seasons' snow reckoned from it in
      // the shader: terrainMaterial.js seasonSnow)
      extA[vi * 4 + 3] = Math.round(Math.min(1, Math.max(0, (s[S_TEMP] - 273.15 + 60) / 120)) * 255);
      for (let k = 0; k < NC; k++) clsA[vi * NC + k] = Math.round(Math.min(1, mat[MAT_W0 + k]) * 255);

      // morph target
      let mx, my, mz, mnx, mny, mnz, mr, mg, mb, mw;
      if (!hasParent) {
        mx = px; my = py; mz = pz; mnx = nx; mny = ny; mnz = nz;
        mr = col[0]; mg = col[1]; mb = col[2]; mw = sd;
      } else {
        const ei = (i & 1) === 0, ej = (j & 1) === 0;
        let a0, a1, b0, b1;
        if (ei && ej) { a0 = i >> 1; a1 = j >> 1; b0 = a0; b1 = a1; }
        else if (!ei && ej) { a0 = i >> 1; a1 = j >> 1; b0 = a0 + 1; b1 = a1; }
        else if (ei && !ej) { a0 = i >> 1; a1 = j >> 1; b0 = a0; b1 = a1 + 1; }
        else { a0 = i >> 1; a1 = j >> 1; b0 = a0 + 1; b1 = a1 + 1; } // parent diagonal
        cp(a0, a1, tA, 0); cp(b0, b1, tB, 0);
        mx = (tA[0] + tB[0]) * 0.5; my = (tA[1] + tB[1]) * 0.5; mz = (tA[2] + tB[2]) * 0.5;
        const na = (a1 * CVi + a0) * 3, nb = (b1 * CVi + b0) * 3;
        mnx = coarseNrm[na] + coarseNrm[nb]; mny = coarseNrm[na + 1] + coarseNrm[nb + 1]; mnz = coarseNrm[na + 2] + coarseNrm[nb + 2];
        const ml = Math.sqrt(mnx * mnx + mny * mny + mnz * mnz) || 1;
        mnx /= ml; mny /= ml; mnz /= ml;
        const ca = (a1 * CVi + a0) * 4, cb = (b1 * CVi + b0) * 4;
        mr = (coarseCol[ca] + coarseCol[cb]) * 0.5; mg = (coarseCol[ca + 1] + coarseCol[cb + 1]) * 0.5;
        mb = (coarseCol[ca + 2] + coarseCol[cb + 2]) * 0.5; mw = (coarseCol[ca + 3] + coarseCol[cb + 3]) * 0.5;
      }
      morph[vi * 3] = mx - ox; morph[vi * 3 + 1] = my - oy; morph[vi * 3 + 2] = mz - oz;
      mnrm[vi * 4] = Math.round(mnx * 127); mnrm[vi * 4 + 1] = Math.round(mny * 127); mnrm[vi * 4 + 2] = Math.round(mnz * 127);
      mnrm[vi * 4 + 3] = encodeShore(mw);
      mcolA[vi * 4] = encodeColor(mr); mcolA[vi * 4 + 1] = encodeColor(mg); mcolA[vi * 4 + 2] = encodeColor(mb);
      mcolA[vi * 4 + 3] = encodeWater(mw);
    }
  }
  gen._shadeSp = 0;

  // ---- skirts: copies of edge vertices pushed down radially
  const skirt = Math.max(spacing * 1.5, 3) + (maxH - minH) * 0.02;
  const edges = edgeVertexLists(N);
  for (let e = 0; e < 4; e++) {
    const list = edges[e];
    for (let s = 0; s <= N; s++) {
      const src = list[s];
      const dst = V * V + e * V + s;
      for (const [arr, w] of [[position, 3], [morph, 3]]) {
        const ax = arr[src * 3] + ox, ay = arr[src * 3 + 1] + oy, az = arr[src * 3 + 2] + oz;
        const l = Math.sqrt(ax * ax + ay * ay + az * az);
        const k = (l - skirt) / l;
        arr[dst * 3] = ax * k - ox; arr[dst * 3 + 1] = ay * k - oy; arr[dst * 3 + 2] = az * k - oz;
      }
      for (let c = 0; c < 4; c++) {
        nrm[dst * 4 + c] = nrm[src * 4 + c]; mnrm[dst * 4 + c] = mnrm[src * 4 + c];
        colA[dst * 4 + c] = colA[src * 4 + c]; mcolA[dst * 4 + c] = mcolA[src * 4 + c];
        matA[dst * 4 + c] = matA[src * 4 + c]; extA[dst * 4 + c] = extA[src * 4 + c]; liqA[dst * 4 + c] = liqA[src * 4 + c]; flwA[dst * 4 + c] = flwA[src * 4 + c];
      }
      for (let k = 0; k < NC; k++) clsA[dst * NC + k] = clsA[src * NC + k];
    }
  }

  // the rivers' water (riverRibbons), its falls with it; the temperature the nearest vertex's
  let rib = null;
  if (ribbons) {
    const uv = { face: 0, u: 0, v: 0 }, d = [0, 0, 0];
    const tempAt = (x, y, z) => {
      d[0] = x; d[1] = y; d[2] = z; faceUVFromDir(d, uv);
      const i = Math.max(0, Math.min(FV - 1, Math.round((uv.u - u0) / du) + 1)), j = Math.max(0, Math.min(FV - 1, Math.round((uv.v - v0) / du) + 1));
      return fineS[(j * FV + i) * S_LEN + S_TEMP] - 273.15;
    };
    rib = gen.riverRibbons(face, u0, v0, size, N, spacing, ox, oy, oz, tempAt);
  }
  // the level water (the sea's, the lakes'): over each cell whose three corners hold its level (a
  // water vertex's, or one under the land beside it, carried there), at that level; with the rivers'
  if (LV) {
    const ext = new Float64Array(FV * FV).fill(-1e9), from = new Int32Array(FV * FV).fill(-1);
    for (let k = 0; k < FV * FV; k++) if (lvL[k] > -1e8) { ext[k] = lvL[k]; from[k] = k; }
    for (let j = 0; j < FV; j++) for (let i = 0; i < FV; i++) {
      const k = j * FV + i;
      if (from[k] >= 0) continue;
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
        const a = i + di, b = j + dj, n = b * FV + a;
        if (a < 0 || b < 0 || a >= FV || b >= FV || lvL[n] <= -1e8) continue;
        if (lvL[n] > ext[k]) { ext[k] = lvL[n]; from[k] = n; }
      }
    }
    const map = new Int32Array(V * V).fill(-1), P3 = [], NR = [], LQ = [], RB = [], CL = [], IX = [];
    const vert = (i, j) => {
      const v = j * V + i;
      if (map[v] >= 0) return map[v];
      const k = (j + 1) * FV + (i + 1), f = from[k], px = fineP[k * 3], py = fineP[k * 3 + 1], pz = fineP[k * 3 + 2], pl = Math.sqrt(px * px + py * py + pz * pz), r = R + ext[k];
      map[v] = P3.length / 3;
      P3.push(px / pl * r - ox, py / pl * r - oy, pz / pl * r - oz);
      NR.push(Math.round(px / pl * 127), Math.round(py / pl * 127), Math.round(pz / pl * 127));
      const Tc = fineS[f * S_LEN + S_TEMP] - 273.15;
      LQ.push(65535, Math.round(lvK[f] * 65535), Math.round(Math.min(1, Math.max(0, (Tc - frz + 60) / 120)) * 65535), Math.round(lvF[f] * 65535));
      RB.push(0, 1, 0, 0);
      CL.push(encodeColor(lvC[f * 3]), encodeColor(lvC[f * 3 + 1]), encodeColor(lvC[f * 3 + 2]), 255);
      return map[v];
    };
    const has = (i, j) => from[(j + 1) * FV + (i + 1)] >= 0, wet = (i, j) => lvL[(j + 1) * FV + (i + 1)] > -1e8, lev = (i, j) => ext[(j + 1) * FV + (i + 1)];
    const tri = (a, b, c) => {
      if (!has(...a) || !has(...b) || !has(...c) || !(wet(...a) || wet(...b) || wet(...c))) return;
      const la = lev(...a), lb = lev(...b), lc = lev(...c);
      if (Math.max(la, lb, lc) - Math.min(la, lb, lc) > 0.3) return;
      IX.push(vert(...a), vert(...b), vert(...c));
    };
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { tri([i, j], [i + 1, j], [i + 1, j + 1]); tri([i, j], [i + 1, j + 1], [i, j + 1]); }
    if (IX.length) {
      const nv0 = rib ? rib.pos.length / 3 : 0, nv1 = P3.length / 3;
      const cat = (T, a, b) => { const o = new T((a ? a.length : 0) + b.length); if (a) o.set(a); o.set(b, a ? a.length : 0); return o; };
      rib = {
        pos: cat(Float32Array, rib && rib.pos, P3), nrm: cat(Int8Array, rib && rib.nrm, NR), flow: cat(Float32Array, rib && rib.flow, new Array(nv1 * 4).fill(0)),
        liq: cat(Uint16Array, rib && rib.liq, LQ), rib: cat(Float32Array, rib && rib.rib, RB),
        col: cat(Uint8Array, rib ? new Uint8Array(nv0 * 4) : null, CL),
        index: cat(Uint32Array, rib && rib.index, IX.map((x) => x + nv0)), falls: rib ? rib.falls : null,
      };
    }
  }
  if (rib && !rib.col) rib.col = new Uint8Array(rib.pos.length / 3 * 4);
  const falls = rib ? rib.falls : spacing < 40 ? findFalls(V, position, steepA, wdA, ox, oy, oz, spacing) : null;

  // bounding sphere in chunk-local coordinates
  let bx = 0, by = 0, bz = 0;
  for (let v = 0; v < V * V; v++) { bx += position[v * 3]; by += position[v * 3 + 1]; bz += position[v * 3 + 2]; }
  bx /= V * V; by /= V * V; bz /= V * V;
  let br = 0;
  for (let v = 0; v < nVert; v++) {
    const dx = position[v * 3] - bx, dy = position[v * 3 + 1] - by, dz = position[v * 3 + 2] - bz;
    const d2 = dx * dx + dy * dy + dz * dz;
    if (d2 > br) br = d2;
  }
  return {
    origin: [ox, oy, oz],
    position, morph, nrm, mnrm, col: colA, mcol: mcolA, mat: matA, ext: extA, liq: liqA, flw: flwA, cls: clsA, falls, rib,
    minH, maxH,
    bsphere: [bx, by, bz, Math.sqrt(br)],
  };
}

export function chunkTransferables(r) {
  const t = [r.position.buffer, r.morph.buffer, r.nrm.buffer, r.mnrm.buffer, r.col.buffer, r.mcol.buffer, r.mat.buffer, r.ext.buffer, r.liq.buffer, r.flw.buffer, r.cls.buffer];
  if (r.falls) t.push(r.falls.buffer);
  if (r.rib) for (const k of ['pos', 'nrm', 'flow', 'liq', 'rib', 'col', 'index']) t.push(r.rib[k].buffer);
  return t;
}

// A chunk's falls: each run of river vertices steeper than ~37 degrees (joined to its neighbours) one
// fall, from its highest vertex (the lip) to its lowest (its foot, where it lands). Returns
// FALL_STRIDE floats a fall (render/falls.js): its foot (chunk-local), the lip's and the foot's
// radius, how wide it runs (m), the river's depth there, its lip's way across (unit; 0 where it isn't
// known, as here); or null
export const FALL_STRIDE = 10;
function findFalls(V, position, steepA, wdA, ox, oy, oz, spacing) {
  const seen = new Uint8Array(V * V), stack = [], out = [];
  const rad = (v) => { const x = position[v * 3] + ox, y = position[v * 3 + 1] + oy, z = position[v * 3 + 2] + oz; return Math.sqrt(x * x + y * y + z * z); };
  for (let v0 = 0; v0 < V * V; v0++) {
    if (seen[v0] || steepA[v0] < 0.2) continue;
    let top = -Infinity, bot = Infinity, foot = v0, n = 0, wd = 0;
    seen[v0] = 1; stack.push(v0);
    while (stack.length) {
      const v = stack.pop(), r = rad(v);
      n++; wd = Math.max(wd, wdA[v]);
      if (r > top) top = r;
      if (r < bot) { bot = r; foot = v; }
      const i = v % V, j = (v / V) | 0;
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
        const a = i + di, b = j + dj;
        if (a < 0 || b < 0 || a >= V || b >= V) continue;
        const w = b * V + a;
        if (!seen[w] && steepA[w] >= 0.2) { seen[w] = 1; stack.push(w); }
      }
    }
    const drop = top - bot;
    if (drop < 2) continue;
    // (its width: the run's vertices over its length down the face)
    const width = Math.max(spacing, n * spacing * spacing / Math.max(drop, spacing));
    out.push(position[foot * 3], position[foot * 3 + 1], position[foot * 3 + 2], top, bot, width, wd, 0, 0, 0);
  }
  return out.length ? Float32Array.from(out) : null;
}
