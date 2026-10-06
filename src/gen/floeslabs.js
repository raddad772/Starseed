// The sea's floes near the camera as solid slabs (Dave: "Why aren't the leads real geometry"; "Why not
// actually subdivide the ice?"): the pack's pieces (gen/liquidice.js: each cube face's square split crack
// by crack, every piece an exact polygon) that come within reach, each whole: in from each edge by its
// lead's half width, ragged as the shading's edges are (the same noise), raised to its freeboard and snow
// (floeTop) with walls down to the water; its top in rings toward its middle so it keeps to the sphere.
// Runs in the terrain workers; the shading draws the same pieces flat beyond reach (render/liquid.js).
import { faceUV, faceRoot, pieceShape, pieceMid, pieceCrack, clipPiece, splits, childId, crackOpen, pieceCover, edgePlane, liquidNow, packIce, floeTop, iceAt, ridgeCrest, POLY_MAX } from './liquidice.js';
import { triDetail } from './detail.js';
import { S_LEN } from './terrain.js';

const _j = [0, 0, 0, 0], _k = [0, 0, 0, 0];
// how far the shading's edge stands out from a piece's polygon at p (body-fixed; d its way): liquid.js
// seaFloes' ragged edge, gen/liquidice.js floeAt's
const jag = (p, d) => (triDetail(p, d, 8, _j)[0] - 0.5) * 1.6 + (triDetail(p, d, 2, _k)[3] - 0.5) * 0.5;

// a point of face f at (u, v), on the sphere of radius r, into o
function onFace(f, u, v, r, o) {
  const ax = f.ax, b = (ax + 1) % 3, d = (ax + 2) % 3, l = Math.sqrt(1 + u * u + v * v);
  o[ax] = f.sg * r / l; o[b] = f.sg * u * r / l; o[d] = f.sg * v * r / l;
  return o;
}

// the slabs round dir (unit, body-fixed) within reach (m) of it, its sea's ice now (sinSun, L: liquidice
// liquidNow's): { origin, pos, nrm, fp, aux, idx } (pos relative to origin; fp the body-fixed place, for
// the shading's tiles; aux: the floe's age (its snow, liquid.js seaFloes'), its top's height, this vertex's
// height above the water, 1 on a wall, 0.5 on a ridge's sail), or null where there's no sea ice
export function buildFloes(gen, dir, sinSun, L, reach = 600) {
  const R = gen.R, s0 = gen.sample(dir[0], dir[1], dir[2], 8, new Float64Array(S_LEN));
  const q = liquidNow(gen, s0, dir, sinSun, L, {});
  if (q.all || !(q.ice > 0) || !(q.kind < 0.2)) return null;
  const pk = packIce(gen, dir, L, q.Tm, {});
  if (!(pk.hi > 0)) return null;
  const ice = iceAt(gen, L, q.ice), origin = [dir[0] * R, dir[1] * R, dir[2] * R];
  const P = [], N = [], F = [], A = [], I = [];
  // (the faces its reach touches)
  const ex = Math.abs(dir[1]) < 0.9 ? [dir[2], 0, -dir[0]] : [0, -dir[2], dir[1]], el = Math.hypot(...ex);
  ex[0] /= el; ex[1] /= el; ex[2] /= el;
  const ey = [dir[1] * ex[2] - dir[2] * ex[1], dir[2] * ex[0] - dir[0] * ex[2], dir[0] * ex[1] - dir[1] * ex[0]];
  const faces = new Map();
  for (const [a, b] of [[0, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
    const p = [origin[0] + (ex[0] * a + ey[0] * b) * reach, origin[1] + (ex[1] * a + ey[1] * b) * reach, origin[2] + (ex[2] * a + ey[2] * b) * reach];
    const f = faceUV(p, {});
    if (!faces.has(f.face)) faces.set(f.face, f);
  }
  for (const f of faces.values()) {
    // (the reach as a square in the face's (u, v), a little over)
    const ax = f.ax, b = (ax + 1) % 3, d = (ax + 2) % 3;
    if (origin[ax] * f.sg <= 0) continue;
    const u0 = origin[b] / origin[ax], v0 = origin[d] / origin[ax], hr = 1.3 * reach * (1 + u0 * u0 + v0 * v0) / R;
    const meets = (Q) => {
      let lu = Infinity, hu = -Infinity, lv = Infinity, hv = -Infinity;
      for (let i = 0; i < Q.n; i++) { const x = Q.V[2 * i], y = Q.V[2 * i + 1]; if (x < lu) lu = x; if (x > hu) hu = x; if (y < lv) lv = y; if (y > hv) hv = y; }
      return hu >= u0 - hr && lu <= u0 + hr && hv >= v0 - hr && lv <= v0 + hr;
    };
    // the face's pieces, split as gen/liquidice.js floeOf splits them, down every side that reaches here
    const stack = [{ P: faceRoot(f, {}), lvl: 0, c: 1 }];
    const sh = {}, k = {}, m = [0, 0, 0];
    while (stack.length) {
      const nd = stack.pop(), Pc = nd.P;
      let c = nd.c, leaf = false, s = 0;
      const S = pieceShape(Pc, sh);
      if (!(S.area > 1e-20)) continue;
      s = pieceMid(f, S, R, m);
      const K = pieceCrack(Pc, nd.lvl, S, k);
      if (s < 4096) { c = pieceCover(m, ice); if (!splits(K.h, s, c)) leaf = true; }
      if (!leaf && (Pc.n >= POLY_MAX - 1 || nd.lvl >= 31)) leaf = true;
      if (leaf) { slab(f, Pc, c, s, S); continue; }
      const g = crackOpen(K.cid, c, s);
      for (const side of [0, 1]) {
        const Q = clipPiece(Pc, K, side, g, {});
        if (Q.n < 3 || !meets(Q)) continue;
        Q.id = childId(Pc.id, side, nd.lvl);
        stack.push({ P: Q, lvl: nd.lvl + 1, c });
      }
    }
  }

  // a piece as a slab: in by its leads, ragged, raised; its top in rings, its walls to the water
  function slab(f, Pc, c, size, S) {
    if (!(c > 0 && (Pc.id & 65535) / 65536 <= Math.min(1, 1.5 * c))) return;
    const ax = f.ax, b = (ax + 1) % 3, d = (ax + 2) % 3, qc = Math.sqrt(1 + S.cu * S.cu + S.cv * S.cv);
    const cen = onFace(f, S.cu, S.cv, R, [0, 0, 0]);
    // (in by each edge's lead: its plane N . x >= g, a line in (u, v) near enough over a floe)
    let Q = { n: Pc.n, V: Float64Array.from(Pc.V), EI: Pc.EI, ES: Pc.ES };
    const n3 = [0, 0, 0], ridges = [];
    for (let i = 0; i < Pc.n; i++) {
      const j = (i + 1) % Pc.n, du = Pc.V[2 * j] - Pc.V[2 * i], dv = Pc.V[2 * j + 1] - Pc.V[2 * i + 1];
      if (du * du + dv * dv < 1e-24) continue;
      const Au = -dv, Bv = du, C = -(Au * Pc.V[2 * i] + Bv * Pc.V[2 * i + 1]);
      edgePlane(f, Au, Bv, C, n3);
      const inside = n3[0] * cen[0] + n3[1] * cen[1] + n3[2] * cen[2] >= 0 ? 1 : -1;
      const a = inside * f.sg * n3[b], bb = inside * f.sg * n3[d], c0 = inside * f.sg * n3[ax] - Math.max(Pc.ES[i], 0.15) * qc / R;
      Q = clipLine(Q, a, bb, c0);
      if (Q.n < 3) return;
      if (Pc.ES[i] < 0) ridges.push({ a, b: bb, c: c0, H: -Pc.ES[i] });
    }
    const top = floeTop(pk, Pc.id, size < 64), age = (0.3 + 0.7 * smooth(16, 200, size)) * (0.6 + 0.4 * (Pc.id >>> 16) / 65536);
    // the ragged edge: each edge cut ~1 m apart (more further off), each point out by the shading's noise
    const ring = [], nrmOut = [];
    const cu = S.cu, cv = S.cv;
    for (let i = 0; i < Q.n; i++) {
      const j = (i + 1) % Q.n, ua = Q.V[2 * i], va = Q.V[2 * i + 1], ub = Q.V[2 * j], vb = Q.V[2 * j + 1];
      const pa = onFace(f, ua, va, R, [0, 0, 0]), pb = onFace(f, ub, vb, R, [0, 0, 0]);
      const len = Math.hypot(pb[0] - pa[0], pb[1] - pa[1], pb[2] - pa[2]);
      const mid = [(pa[0] + pb[0]) / 2 - origin[0], (pa[1] + pb[1]) / 2 - origin[1], (pa[2] + pb[2]) / 2 - origin[2]];
      const step = Math.min(4, Math.max(0.75, Math.hypot(...mid) / 150));
      const nseg = Math.max(1, Math.ceil(len / step));
      // (out: across the edge, away from the middle, along the ground)
      for (let t = 0; t < nseg; t++) {
        const u = ua + (ub - ua) * t / nseg, v = va + (vb - va) * t / nseg, p = onFace(f, u, v, R, [0, 0, 0]);
        const up = [p[0] / R, p[1] / R, p[2] / R], ed = [pb[0] - pa[0], pb[1] - pa[1], pb[2] - pa[2]];
        let ox = ed[1] * up[2] - ed[2] * up[1], oy = ed[2] * up[0] - ed[0] * up[2], oz = ed[0] * up[1] - ed[1] * up[0];
        if (ox * (p[0] - cen[0]) + oy * (p[1] - cen[1]) + oz * (p[2] - cen[2]) < 0) { ox = -ox; oy = -oy; oz = -oz; }
        const ol = Math.hypot(ox, oy, oz) || 1;
        ox /= ol; oy /= ol; oz /= ol;
        const jg = jag(p, up);
        ring.push([p[0] + ox * jg, p[1] + oy * jg, p[2] + oz * jg]);
        nrmOut.push([ox, oy, oz]);
      }
    }
    const nb = ring.length, rt = R + top, base = P.length / 3;
    const put = (p, r, nx, ny, nz, h, wall) => {
      const l = Math.hypot(p[0], p[1], p[2]), k = r / l, x = p[0] * k, y = p[1] * k, z = p[2] * k;
      P.push(x - origin[0], y - origin[1], z - origin[2]); N.push(nx, ny, nz); F.push(x, y, z); A.push(age, top, h, wall);
      return P.length / 3 - 1;
    };
    // the top: the ragged edge, then rings toward the middle (each ~40 m in, its points thinned to ~40 m
    // apart), then the middle: a fan of triangles that keeps to the sphere
    const perim = (() => { let L0 = 0; for (let i = 0; i < nb; i++) { const a = ring[i], c2 = ring[(i + 1) % nb]; L0 += Math.hypot(c2[0] - a[0], c2[1] - a[1], c2[2] - a[2]); } return L0; })();
    const rings = Math.max(1, Math.ceil(size / 80));
    let prev = ring.map((p, i) => ({ i, v: put(p, rt, p[0] / R, p[1] / R, p[2] / R, top, 0) }));
    for (let r = 1; r <= rings; r++) {
      const tt = 1 - r / (rings + 1), keep = Math.max(1, Math.round(40 * nb / Math.max(perim * tt, 1)));
      const cur = [];
      for (let i = 0; i < nb; i += keep) {
        const p = ring[i], x = cen[0] + (p[0] - cen[0]) * tt, y = cen[1] + (p[1] - cen[1]) * tt, z = cen[2] + (p[2] - cen[2]) * tt;
        cur.push({ i, v: put([x, y, z], rt, x / R, y / R, z / R, top, 0) });
      }
      stitch(prev, cur, nb);
      prev = cur;
    }
    const cv0 = put(cen, rt, cen[0] / R, cen[1] / R, cen[2] / R, top, 0);
    for (let a = 0; a < prev.length; a++) I.push(prev[a].v, prev[(a + 1) % prev.length].v, cv0);
    // a pressure ridge's sail on each edge the pack closed along (its crack's ES < 0: the sail's height
    // H): this floe's half, from its crest over the crack (H up) down at ~27 degrees to the floe 2H in;
    // the floe across it builds the other half. The walker's own tent (gen/liquidice.js floeOf's ridge)
    // (along the floe's own edge there, as it's left after its leads: not out across a lead)
    for (let i = 0; i < Q.n; i++) {
      const j = (i + 1) % Q.n, ua = Q.V[2 * i], va = Q.V[2 * i + 1], ub = Q.V[2 * j], vb = Q.V[2 * j + 1];
      const rg = ridges.find((r) => Math.abs(r.a * ua + r.b * va + r.c) < 1e-9 && Math.abs(r.a * ub + r.b * vb + r.c) < 1e-9);
      if (!rg) continue;
      const H = rg.H;
      const pa = onFace(f, ua, va, R, [0, 0, 0]), pb = onFace(f, ub, vb, R, [0, 0, 0]);
      const len = Math.hypot(pb[0] - pa[0], pb[1] - pa[1], pb[2] - pa[2]);
      if (len < 1) continue;
      const nseg = Math.max(1, Math.ceil(len / 1.5)), ed = [(pb[0] - pa[0]) / len, (pb[1] - pa[1]) / len, (pb[2] - pa[2]) / len];
      const rows = [];
      for (let t = 0; t <= nseg; t++) {
        const q0 = [pa[0] + (pb[0] - pa[0]) * t / nseg, pa[1] + (pb[1] - pa[1]) * t / nseg, pa[2] + (pb[2] - pa[2]) * t / nseg];
        const ql = Math.hypot(...q0), up = [q0[0] / ql, q0[1] / ql, q0[2] / ql];
        // (in: across the edge, toward the floe's middle)
        let ix = up[1] * ed[2] - up[2] * ed[1], iy = up[2] * ed[0] - up[0] * ed[2], iz = up[0] * ed[1] - up[1] * ed[0];
        if (ix * (cen[0] - q0[0]) + iy * (cen[1] - q0[1]) + iz * (cen[2] - q0[2]) < 0) { ix = -ix; iy = -iy; iz = -iz; }
        // (its face: falling inward at 1 in 2, so facing up and in)
        const nl = Math.hypot(up[0] * 2 + ix, up[1] * 2 + iy, up[2] * 2 + iz), nx = (up[0] * 2 + ix) / nl, ny = (up[1] * 2 + iy) / nl, nz = (up[2] * 2 + iz) / nl;
        const row = [], Hc = H * ridgeCrest(q0, up);
        // (the crest over the crack, 15 cm out from the floe's edge here: where its lead would be)
        for (const [x, z] of [[-0.15, Hc], [Hc - 0.15, Hc / 2], [2 * Hc - 0.15, 0]]) row.push(put([q0[0] + ix * x, q0[1] + iy * x, q0[2] + iz * x], rt + z, nx, ny, nz, top + z, 0.5));
        rows.push(row);
      }
      for (let t = 0; t < nseg; t++) for (let c = 0; c < 2; c++) I.push(rows[t][c], rows[t][c + 1], rows[t + 1][c], rows[t + 1][c], rows[t][c + 1], rows[t + 1][c + 1]);
      // (its ends closed: a face from the crest down to the floe)
      for (const t of [0, nseg]) { const r0 = rows[t]; const b0 = put(P.slice(3 * r0[0], 3 * r0[0] + 3).map((v, k) => v + origin[k]), rt, ed[0], ed[1], ed[2], top, 0.5); I.push(r0[0], r0[2], b0); }
    }
    // the walls: each piece of edge from its top to just under the water
    for (let i = 0; i < nb; i++) {
      const j = (i + 1) % nb, o = nrmOut[i];
      const a0 = put(ring[i], rt, o[0], o[1], o[2], top, 1), a1 = put(ring[j], rt, o[0], o[1], o[2], top, 1);
      const b0 = put(ring[i], R - 0.05, o[0], o[1], o[2], 0, 1), b1 = put(ring[j], R - 0.05, o[0], o[1], o[2], 0, 1);
      I.push(a0, b0, a1, a1, b0, b1);
    }
    void base;
  }
  // two rings of the top (cur's points a thinned subset of prev's, by their indices on the edge) joined
  function stitch(prev, cur, nb) {
    let a = 0, c = 0;
    const np = prev.length, nc = cur.length;
    // (walk both by their places along the edge, a triangle at each step)
    while (a < np || c < nc) {
      const pa = prev[a % np], pa1 = prev[(a + 1) % np], ca = cur[c % nc], ca1 = cur[(c + 1) % nc];
      const ia = a + 1 < np ? prev[a + 1].i : nb + prev[0].i, ic = c + 1 < nc ? cur[c + 1].i : nb + cur[0].i;
      if (c >= nc || (a < np && ia <= ic)) { I.push(pa.v, pa1.v, ca.v); a++; } else { I.push(pa.v, ca1.v, ca.v); c++; }
    }
  }
  if (!I.length) return null;
  return { origin, pos: Float32Array.from(P), nrm: Float32Array.from(N), fp: Float32Array.from(F), aux: Float32Array.from(A), idx: Uint32Array.from(I) };
}

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
// a convex polygon (Q.V, Q.n) clipped to a u + b v + c >= 0
function clipLine(Q, a, b, c) {
  const V = Q.V, n = Q.n, W = [];
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n, xi = V[2 * i], yi = V[2 * i + 1], xj = V[2 * j], yj = V[2 * j + 1];
    const di = a * xi + b * yi + c, dj = a * xj + b * yj + c;
    if (di >= 0) W.push(xi, yi);
    if ((di >= 0) !== (dj >= 0)) { const t = di / (di - dj); W.push(xi + (xj - xi) * t, yi + (yj - yi) * t); }
  }
  return { n: W.length / 2, V: W };
}
