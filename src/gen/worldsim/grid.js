// The world simulation's grid: an equal-angle cube-sphere (the same mapping
// as the terrain chunks), N x N cells per face, stored flat so the hot loops
// run over typed arrays (and port to a compiled language as they are).
//
// Cell c = f * N * N + j * N + i (face f, column i along u, row j along v).
// Each cell has its centre direction, its area (m^2) and up to 8 neighbours
// (fewer at the cube's corners) in compressed rows: nbr[nStart[c] .. nStart[c+1]),
// with the distance to each (m). Neighbours across face edges are found by
// stepping past the edge in grid space and mapping the direction back, and the
// relation is made symmetric. Deterministic: built only from dmath and
// correctly-rounded arithmetic.

import { dirFromFaceUV, faceUVFromDir, FACES } from '../cubesphere.js';
import * as dm from '../../core/dmath.js';

export class SimGrid {
  constructor(N, R) {
    this.N = N;
    this.R = R;
    const n = this.n = 6 * N * N;
    const dir = this.dir = new Float64Array(n * 3);
    const area = this.area = new Float64Array(n);
    const d = [0, 0, 0], c0 = [0, 0, 0], c1 = [0, 0, 0], c2 = [0, 0, 0], c3 = [0, 0, 0];
    const s = 2 / N;
    for (let f = 0; f < 6; f++) {
      for (let j = 0; j < N; j++) {
        for (let i = 0; i < N; i++) {
          const c = (f * N + j) * N + i;
          const u = -1 + (i + 0.5) * s, v = -1 + (j + 0.5) * s;
          dirFromFaceUV(f, u, v, d);
          dir[c * 3] = d[0]; dir[c * 3 + 1] = d[1]; dir[c * 3 + 2] = d[2];
          // area: the cell's corner quad, as two triangles (flat: cells are small)
          dirFromFaceUV(f, u - s / 2, v - s / 2, c0); dirFromFaceUV(f, u + s / 2, v - s / 2, c1);
          dirFromFaceUV(f, u + s / 2, v + s / 2, c2); dirFromFaceUV(f, u - s / 2, v + s / 2, c3);
          area[c] = (triArea(c0, c1, c2) + triArea(c0, c2, c3)) * R * R;
        }
      }
    }
    // neighbours
    const sets = new Array(n);
    for (let c = 0; c < n; c++) sets[c] = [];
    const add = (a, b) => { if (a !== b && !sets[a].includes(b)) sets[a].push(b); };
    const uv = { face: 0, u: 0, v: 0 };
    for (let f = 0; f < 6; f++) {
      for (let j = 0; j < N; j++) {
        for (let i = 0; i < N; i++) {
          const c = (f * N + j) * N + i;
          for (let dj = -1; dj <= 1; dj++) {
            for (let di = -1; di <= 1; di++) {
              if (!di && !dj) continue;
              const ii = i + di, jj = j + dj;
              let o;
              if (ii >= 0 && ii < N && jj >= 0 && jj < N) o = (f * N + jj) * N + ii;
              else {
                // off the face: past a corner of the cube there is no diagonal cell
                if ((ii < 0 || ii >= N) && (jj < 0 || jj >= N)) continue;
                dirFromFaceUV(f, -1 + (ii + 0.5) * s, -1 + (jj + 0.5) * s, d);
                o = this.cellOf(d, uv);
              }
              add(c, o); add(o, c);
            }
          }
        }
      }
    }
    const nStart = this.nStart = new Int32Array(n + 1);
    for (let c = 0; c < n; c++) nStart[c + 1] = nStart[c] + sets[c].length;
    const nbr = this.nbr = new Int32Array(nStart[n]);
    const nDist = this.nDist = new Float64Array(nStart[n]);
    for (let c = 0; c < n; c++) {
      const L = sets[c].sort((a, b) => a - b);
      for (let k = 0; k < L.length; k++) {
        const o = L[k], e = nStart[c] + k;
        nbr[e] = o;
        const dx = dir[c * 3] - dir[o * 3], dy = dir[c * 3 + 1] - dir[o * 3 + 1], dz = dir[c * 3 + 2] - dir[o * 3 + 2];
        nDist[e] = Math.sqrt(dx * dx + dy * dy + dz * dz) * R;
      }
    }
    this.spacing = Math.sqrt(4 * Math.PI * R * R / n); // mean cell size (m)
    // cell edges in the faces' tangent coordinates, for cellAt (no atan)
    const te = this.tanEdges = new Float64Array(N + 1);
    for (let k = 0; k <= N; k++) te[k] = dm.tan((-1 + 2 * k / N) * dm.PI / 4);
  }

  // the cell containing direction (x, y, z) (any length): the face by the
  // largest axis, the column and row by binary search of the tangent edges
  cellAt(x, y, z) {
    const ax = Math.abs(x), ay = Math.abs(y), az = Math.abs(z);
    let f;
    if (ax >= ay && ax >= az) f = x >= 0 ? 0 : 1;
    else if (ay >= az) f = y >= 0 ? 2 : 3;
    else f = z >= 0 ? 4 : 5;
    const F = FACES[f];
    const dn = x * F.N[0] + y * F.N[1] + z * F.N[2];
    const a = (x * F.U[0] + y * F.U[1] + z * F.U[2]) / dn, b = (x * F.V[0] + y * F.V[1] + z * F.V[2]) / dn;
    const N = this.N;
    return (f * N + this._edge(b)) * N + this._edge(a);
  }
  // the column (or row) whose tangent edges hold t: te[k] <= t < te[k + 1], clamped to the
  // face. A guess from Math.atan, then stepped against the edges themselves, so it's exact
  // (the same as a binary search) whatever the engine's atan does in its last bits
  _edge(t) {
    const te = this.tanEdges, N = this.N;
    let k = Math.floor((Math.atan(t) * (4 / Math.PI) + 1) * 0.5 * N);
    if (k < 0) k = 0; else if (k > N - 1) k = N - 1;
    while (k > 0 && te[k] > t) k--;
    while (k < N - 1 && te[k + 1] <= t) k++;
    return k;
  }

  // the cell containing a unit direction
  cellOf(d, uv = { face: 0, u: 0, v: 0 }) {
    const N = this.N;
    faceUVFromDir(d, uv);
    const i = Math.min(N - 1, Math.max(0, Math.floor((uv.u + 1) / 2 * N)));
    const j = Math.min(N - 1, Math.max(0, Math.floor((uv.v + 1) / 2 * N)));
    return (uv.face * N + j) * N + i;
  }

  // a field (one value per cell) at a direction: bilinear between cell centres (across a
  // face's edges, the next face's cells: no seam where faces meet)
  sample(field, d, uv = { face: 0, u: 0, v: 0 }) {
    const N = this.N;
    faceUVFromDir(d, uv);
    const x = (uv.u + 1) / 2 * N - 0.5, y = (uv.v + 1) / 2 * N - 0.5;
    const i0 = Math.floor(x), j0 = Math.floor(y), fx = x - i0, fy = y - j0;
    let a00, a10, a01, a11;
    if (i0 >= 0 && j0 >= 0 && i0 < N - 1 && j0 < N - 1) {
      const b = uv.face * N * N + j0 * N + i0;
      a00 = field[b]; a10 = field[b + 1]; a01 = field[b + N]; a11 = field[b + N + 1];
    } else {
      // (within half a cell of its face's edge: the cells past it are the next face's)
      const f = uv.face;
      a00 = field[this._at(f, i0, j0)]; a10 = field[this._at(f, i0 + 1, j0)]; a01 = field[this._at(f, i0, j0 + 1)]; a11 = field[this._at(f, i0 + 1, j0 + 1)];
    }
    return (a00 * (1 - fx) + a10 * fx) * (1 - fy) + (a01 * (1 - fx) + a11 * fx) * fy;
  }
  // the cell at column i, row j of face f, those past its edges being the next face's (the cell
  // the grid's lines carried on past the edge reach); past a cube corner, the nearest on the face
  _at(f, i, j) {
    const N = this.N;
    if (i >= 0 && j >= 0 && i < N && j < N) return (f * N + j) * N + i;
    if ((i < 0 || i >= N) && (j < 0 || j >= N)) return (f * N + Math.min(N - 1, Math.max(0, j))) * N + Math.min(N - 1, Math.max(0, i));
    const d = this._ad || (this._ad = [0, 0, 0]), s = 2 / N;
    dirFromFaceUV(f, -1 + (i + 0.5) * s, -1 + (j + 0.5) * s, d);
    return this.cellAt(d[0], d[1], d[2]);
  }
  // the four cells sample() blends at d and their weights: cells into c, weights into w
  corners(d, c, w, uv = { face: 0, u: 0, v: 0 }) {
    const N = this.N;
    faceUVFromDir(d, uv);
    const x = (uv.u + 1) / 2 * N - 0.5, y = (uv.v + 1) / 2 * N - 0.5;
    const i0 = Math.floor(x), j0 = Math.floor(y), fx = x - i0, fy = y - j0, f = uv.face;
    if (i0 >= 0 && j0 >= 0 && i0 < N - 1 && j0 < N - 1) { const b = f * N * N + j0 * N + i0; c[0] = b; c[1] = b + 1; c[2] = b + N; c[3] = b + N + 1; }
    else { c[0] = this._at(f, i0, j0); c[1] = this._at(f, i0 + 1, j0); c[2] = this._at(f, i0, j0 + 1); c[3] = this._at(f, i0 + 1, j0 + 1); }
    w[0] = (1 - fx) * (1 - fy); w[1] = fx * (1 - fy); w[2] = (1 - fx) * fy; w[3] = fx * fy;
  }
  // the 16 cells round d (4 x 4, across its face's edges onto the next face's) and their cubic
  // B-spline weights: a smooth blend (a field read this way has no corners where cells meet)
  corners16(d, c, w, uv = { face: 0, u: 0, v: 0 }) {
    const N = this.N;
    faceUVFromDir(d, uv);
    const x = (uv.u + 1) / 2 * N - 0.5, y = (uv.v + 1) / 2 * N - 0.5;
    const i0 = Math.floor(x), j0 = Math.floor(y), fx = x - i0, fy = y - j0, base = uv.face * N * N;
    const bx = this._bx || (this._bx = new Float64Array(4)), by = this._by || (this._by = new Float64Array(4));
    bspline4(fx, bx); bspline4(fy, by);
    if (i0 >= 1 && j0 >= 1 && i0 < N - 2 && j0 < N - 2) {
      for (let q = 0; q < 4; q++) for (let p = 0; p < 4; p++) { c[q * 4 + p] = base + (j0 - 1 + q) * N + i0 - 1 + p; w[q * 4 + p] = bx[p] * by[q]; }
    } else {
      // (near its face's edge: the cells past it are the next face's)
      for (let q = 0; q < 4; q++) for (let p = 0; p < 4; p++) { c[q * 4 + p] = this._at(uv.face, i0 - 1 + p, j0 - 1 + q); w[q * 4 + p] = bx[p] * by[q]; }
    }
  }
}

// (the cubic B-spline's four weights at t into o)
function bspline4(t, o) { const u = 1 - t, t2 = t * t, t3 = t2 * t; o[0] = u * u * u / 6; o[1] = (3 * t3 - 6 * t2 + 4) / 6; o[2] = (-3 * t3 + 3 * t2 + 3 * t + 1) / 6; o[3] = t3 / 6; }

// The same grid for reading a finished simulation (the game's samplers, one per body in
// every terrain worker): the same cells, mapping and sampling, with each cell's centre and
// neighbours worked out when asked instead of stored (a SimGrid holds ~130 bytes a cell).
export class GridLite {
  constructor(N, R) {
    this.N = N;
    this.R = R;
    this.n = 6 * N * N;
    this.spacing = Math.sqrt(4 * Math.PI * R * R / this.n);
    const te = this.tanEdges = new Float64Array(N + 1);
    for (let k = 0; k <= N; k++) te[k] = dm.tan((-1 + 2 * k / N) * dm.PI / 4);
    const tc = this.tanCentres = new Float64Array(N);
    for (let k = 0; k < N; k++) tc[k] = dm.tan((-1 + (k + 0.5) * 2 / N) * dm.PI / 4);
    this._d = [0, 0, 0];
    this._uv = { face: 0, u: 0, v: 0 };
  }
  // cell c's centre direction into out (as dirFromFaceUV, from the centres' tangents)
  centre(c, out) {
    const N = this.N, f = Math.floor(c / (N * N)), r = c - f * N * N, j = Math.floor(r / N), i = r - j * N;
    const F = FACES[f], a = this.tanCentres[i], b = this.tanCentres[j];
    const x = F.N[0] + a * F.U[0] + b * F.V[0], y = F.N[1] + a * F.U[1] + b * F.V[1], z = F.N[2] + a * F.U[2] + b * F.V[2];
    const l = Math.sqrt(x * x + y * y + z * z);
    out[0] = x / l; out[1] = y / l; out[2] = z / l;
    return out;
  }
  // cell c's neighbours (up to 8; across face edges by stepping past the edge, none
  // diagonally past a cube corner) into out; returns how many
  nbrs(c, out) {
    const N = this.N, f = Math.floor(c / (N * N)), r = c - f * N * N, j = Math.floor(r / N), i = r - j * N, s = 2 / N;
    let k = 0;
    for (let dj = -1; dj <= 1; dj++) {
      for (let di = -1; di <= 1; di++) {
        if (!di && !dj) continue;
        const ii = i + di, jj = j + dj;
        if (ii >= 0 && ii < N && jj >= 0 && jj < N) { out[k++] = (f * N + jj) * N + ii; continue; }
        if ((ii < 0 || ii >= N) && (jj < 0 || jj >= N)) continue;
        dirFromFaceUV(f, -1 + (ii + 0.5) * s, -1 + (jj + 0.5) * s, this._d);
        const o = this.cellOf(this._d, this._uv);
        if (o !== c) out[k++] = o;
      }
    }
    return k;
  }
}
GridLite.prototype.cellAt = SimGrid.prototype.cellAt;
GridLite.prototype._edge = SimGrid.prototype._edge;
GridLite.prototype.cellOf = SimGrid.prototype.cellOf;
GridLite.prototype.sample = SimGrid.prototype.sample;
GridLite.prototype.corners = SimGrid.prototype.corners;
GridLite.prototype.corners16 = SimGrid.prototype.corners16;
GridLite.prototype._at = SimGrid.prototype._at;

function triArea(a, b, c) {
  const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
  const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
  const x = uy * vz - uz * vy, y = uz * vx - ux * vz, z = ux * vy - uy * vx;
  return 0.5 * Math.sqrt(x * x + y * y + z * z);
}
