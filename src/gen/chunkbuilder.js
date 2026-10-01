// Builds one quadtree chunk of a planet surface (runs in Web Workers).
//
// Each vertex carries its own position plus a morph target: the position the
// parent chunk's mesh has at that spot (parent vertices for even indices,
// edge midpoints / the parent triangle's diagonal midpoint for odd ones),
// computed with the parent's coarser octave band. The vertex shader blends
// toward the morph target with distance, so a chunk is geometrically identical
// to its parent at the moment they swap: no popping, no T-junction cracks.

import { dirFromFaceUV, chunkUVBounds, chunkArcSize } from './cubesphere.js';
import { S_LEN, S_H } from './terrain.js';

export const CHUNK_N = 32; // quads per side (even)

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

// scratch buffers reused between chunks
let scratchN = 0, fineS, fineP, coarseS, coarseP, fineNrm, coarseNrm, coarseCol;

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
  }
  const { u0, v0, size } = chunkUVBounds(level, ix, iy);
  const du = size / N;
  const arc = chunkArcSize(level, R);
  const spacing = arc / N;
  const minW = spacing * 2;
  const coarseMinW = spacing * 4;
  const hasSea = !!gen.p.liquid && gen.contThreshold > -1e8;

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
      let h = s[S_H];
      if (hasSea && h < 0) h = 0;
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
  const hasParent = level > 0;
  if (hasParent) {
    const cdu = du * 2;
    for (let j = 0; j < CV; j++) {
      for (let i = 0; i < CV; i++) {
        const u = u0 + (i - 1) * cdu, v = v0 + (j - 1) * cdu;
        dirFromFaceUV(face, u, v, dir);
        const k = j * CV + i;
        const s = coarseS.subarray(k * S_LEN, k * S_LEN + S_LEN);
        gen.sample(dir[0], dir[1], dir[2], coarseMinW, s);
        let h = s[S_H];
        if (hasSea && h < 0) h = 0;
        const r = R + h;
        coarseP[k * 3] = dir[0] * r; coarseP[k * 3 + 1] = dir[1] * r; coarseP[k * 3 + 2] = dir[2] * r;
      }
    }
    const CVi = CN + 1;
    const col = [0, 0, 0], mat = new Float64Array(8);
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
        gen.shade(s, 1 - up, col, mat);
        const oc = (j * CVi + i) * 4;
        coarseCol[oc] = col[0]; coarseCol[oc + 1] = col[1]; coarseCol[oc + 2] = col[2]; coarseCol[oc + 3] = mat[4];
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
  const col = [0, 0, 0], mat = new Float64Array(8);
  const CVi = CN + 1;
  const cp = (ci, cj, out, o) => { // coarse interior vertex position -> out[o..o+2]
    const k = (cj + 1) * CV + (ci + 1);
    out[o] = coarseP[k * 3]; out[o + 1] = coarseP[k * 3 + 1]; out[o + 2] = coarseP[k * 3 + 2];
  };
  const tA = [0, 0, 0], tB = [0, 0, 0];

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
      gen.shade(s, 1 - up, col, mat);
      nrm[vi * 4] = Math.round(nx * 127); nrm[vi * 4 + 1] = Math.round(ny * 127); nrm[vi * 4 + 2] = Math.round(nz * 127);
      colA[vi * 4] = encodeColor(col[0]); colA[vi * 4 + 1] = encodeColor(col[1]); colA[vi * 4 + 2] = encodeColor(col[2]);
      colA[vi * 4 + 3] = encodeWater(mat[4]);
      matA[vi * 4] = Math.round(mat[0] * 255); matA[vi * 4 + 1] = Math.round(mat[1] * 255);
      matA[vi * 4 + 2] = Math.round(mat[2] * 255); matA[vi * 4 + 3] = Math.round(mat[3] * 255);
      extA[vi * 4] = Math.round(Math.min(1, mat[5]) * 255);
      extA[vi * 4 + 1] = Math.round(Math.min(1, mat[6]) * 255);
      extA[vi * 4 + 2] = Math.round(Math.min(1, s[12] / 1.4) * 255); // roughness
      extA[vi * 4 + 3] = Math.round((0.5 + 0.5 * s[10]) * 255);    // mineral variant

      // morph target
      let mx, my, mz, mnx, mny, mnz, mr, mg, mb, mw;
      if (!hasParent) {
        mx = px; my = py; mz = pz; mnx = nx; mny = ny; mnz = nz;
        mr = col[0]; mg = col[1]; mb = col[2]; mw = mat[4];
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
      mcolA[vi * 4] = encodeColor(mr); mcolA[vi * 4 + 1] = encodeColor(mg); mcolA[vi * 4 + 2] = encodeColor(mb);
      mcolA[vi * 4 + 3] = encodeWater(mw);
    }
  }

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
        matA[dst * 4 + c] = matA[src * 4 + c]; extA[dst * 4 + c] = extA[src * 4 + c];
      }
    }
  }

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
    position, morph, nrm, mnrm, col: colA, mcol: mcolA, mat: matA, ext: extA,
    minH, maxH,
    bsphere: [bx, by, bz, Math.sqrt(br)],
  };
}

export function chunkTransferables(r) {
  return [r.position.buffer, r.morph.buffer, r.nrm.buffer, r.mnrm.buffer, r.col.buffer, r.mcol.buffer, r.mat.buffer, r.ext.buffer];
}
