// The sea's floes near the camera as solid slabs (Dave: "Why aren't the leads real geometry"; "Why not
// actually subdivide the ice?"): the pack's pieces (gen/liquidice.js: each cube face's square split crack
// by crack, every piece an exact polygon) that come within reach, each whole: in from each edge by its
// lead's half width, ragged as the shading's edges are (the same noise), raised to its freeboard and snow
// (floeTop) with walls down to the water; its top in rings toward its middle so it keeps to the sphere.
// Runs in the terrain workers; the shading draws the same pieces flat beyond reach (render/liquid.js).
import { faceUV, faceRoot, pieceShape, pieceMid, pieceCrack, clipPiece, splits, childId, crackOpen, pieceCover, edgePlane, liquidNow, packIce, floeTop, iceAt, ridgeCrest, floeRound, floeAge, POLY_MAX } from './liquidice.js';
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
  const P = [], N = [], F = [], A = [], I = [], B = [];
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

  // a piece as a slab: its outline where its own edge function (gen/liquidice.js floeOf's last sums on
  // its polygon: in from its nearest edge less that edge's lead, its corners rounded, plus the ragged
  // noise) comes to 0, found along rays from its middle (the shading's very edge); raised; its top in
  // rings, its walls to the water, a ridge's sail along its edge where that edge closed
  function slab(f, Pc, c, size, S) {
    if (!(c > 0 && (Pc.id & 65535) / 65536 <= Math.min(1, 1.5 * c))) return;
    const cen = onFace(f, S.cu, S.cv, R, [0, 0, 0]);
    // its edges: their planes (through the world's middle, unit), their leads (or a ridge's sails)
    const E = [];
    for (let i = 0; i < Pc.n; i++) {
      const j = (i + 1) % Pc.n, du = Pc.V[2 * j] - Pc.V[2 * i], dv = Pc.V[2 * j + 1] - Pc.V[2 * i + 1];
      if (du * du + dv * dv < 1e-24) continue;
      const n = edgePlane(f, -dv, du, dv * Pc.V[2 * i] - du * Pc.V[2 * i + 1], [0, 0, 0]);
      const sg = n[0] * cen[0] + n[1] * cen[1] + n[2] * cen[2] >= 0 ? 1 : -1;
      E.push({ n, sg, g: Math.max(Pc.ES[i], 0.15), H: Pc.ES[i] < 0 ? -Pc.ES[i] : 0 });
    }
    const rr = floeRound(size, Pc.id), top = floeTop(pk, Pc.id, size < 64), age = floeAge(size, Pc.id);
    // (the edge function at p: liquid.js floeOf's e, ragged; and which edge is nearest)
    let near = 0;
    const ef = (p) => {
      let e1 = Infinity, e2 = Infinity;
      for (let k = 0; k < E.length; k++) {
        // (signed: inside the piece the shading's |n . p|, past its edge out along the ray negative)
        const ed = E[k], ek = ed.sg * (ed.n[0] * p[0] + ed.n[1] * p[1] + ed.n[2] * p[2]) - ed.g;
        if (ek < e1) { e2 = e1; e1 = ek; near = k; } else if (ek < e2) e2 = ek;
      }
      if (e2 < rr) e1 = rr - Math.hypot(rr - e1, rr - e2);
      return e1 + jag(p, [p[0] / R, p[1] / R, p[2] / R]);
    };
    // (rays from its middle along the ground: its outline every ~1 m (more further off))
    const up0 = [cen[0] / R, cen[1] / R, cen[2] / R];
    const ax = Math.abs(up0[1]) < 0.9 ? [up0[2], 0, -up0[0]] : [0, -up0[2], up0[1]], al = Math.hypot(...ax);
    ax[0] /= al; ax[1] /= al; ax[2] /= al;
    const ay = [up0[1] * ax[2] - up0[2] * ax[1], up0[2] * ax[0] - up0[0] * ax[2], up0[0] * ax[1] - up0[1] * ax[0]];
    let rmax = 0;
    for (let i = 0; i < Pc.n; i++) { const q = onFace(f, Pc.V[2 * i], Pc.V[2 * i + 1], R, [0, 0, 0]); rmax = Math.max(rmax, Math.hypot(q[0] - cen[0], q[1] - cen[1], q[2] - cen[2])); }
    rmax += 4;
    const at = (th, rho, o) => { const c2 = Math.cos(th), s2 = Math.sin(th); for (let k = 0; k < 3; k++) o[k] = cen[k] + (ax[k] * c2 + ay[k] * s2) * rho; const l = Math.hypot(o[0], o[1], o[2]); o[0] *= R / l; o[1] *= R / l; o[2] *= R / l; return o; };
    if (!(ef(cen) > 0)) return;
    const ring = [], ridgeH = [], q = [0, 0, 0];
    const mid0 = Math.hypot(cen[0] - origin[0], cen[1] - origin[1], cen[2] - origin[2]);
    for (let th = 0; th < 2 * Math.PI;) {
      let lo = 0, hi = rmax;
      if (ef(at(th, hi, q)) > 0) hi = rmax * 1.5;
      for (let it = 0; it < 22; it++) { const md = (lo + hi) / 2; if (ef(at(th, md, q)) > 0) lo = md; else hi = md; }
      at(th, lo, q); ef(q);
      ring.push([q[0], q[1], q[2]]);
      ridgeH.push(E[near].H > 0 ? near : -1);
      const step = Math.min(4, Math.max(0.75, (mid0 + lo) / 150));
      th += step / Math.max(lo, 1);
    }
    const nb = ring.length;
    if (nb < 3) return;
    const rt = R + top;
    const put = (p, r, nx, ny, nz, h, wall) => {
      const l = Math.hypot(p[0], p[1], p[2]), k = r / l, x = p[0] * k, y = p[1] * k, z = p[2] * k;
      P.push(x - origin[0], y - origin[1], z - origin[2]); N.push(nx, ny, nz); F.push(x, y, z); A.push(age, top, h, wall);
      return P.length / 3 - 1;
    };
    // (out: across the outline, away from the middle, along the ground)
    const out = ring.map((p, i) => {
      const a = ring[(i + nb - 1) % nb], b = ring[(i + 1) % nb], t = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], u = [p[0] / R, p[1] / R, p[2] / R];
      let ox = t[1] * u[2] - t[2] * u[1], oy = t[2] * u[0] - t[0] * u[2], oz = t[0] * u[1] - t[1] * u[0];
      if (ox * (p[0] - cen[0]) + oy * (p[1] - cen[1]) + oz * (p[2] - cen[2]) < 0) { ox = -ox; oy = -oy; oz = -oz; }
      const ol = Math.hypot(ox, oy, oz) || 1;
      return [ox / ol, oy / ol, oz / ol];
    });
    // the top: the outline, then rings toward the middle (each ~80 m of size, thinned to ~40 m apart), then
    // the middle: a fan of triangles that keeps to the sphere
    let perim = 0;
    for (let i = 0; i < nb; i++) { const a = ring[i], b = ring[(i + 1) % nb]; perim += Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]); }
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
    const cv0 = put(cen, rt, up0[0], up0[1], up0[2], top, 0);
    for (let a = 0; a < prev.length; a++) I.push(prev[a].v, prev[(a + 1) % prev.length].v, cv0);
    // a pressure ridge's sail along each stretch of outline nearest an edge the pack closed along (H its
    // height): this floe's half, from its crest over the crack (15 cm out) down at ~27 degrees to the floe
    // 2H in (the floe across builds the other half; the walker's own tent, gen/liquidice.js floeOf); its
    // blocks over it (ridgeBlocks)
    for (let i = 0; i < nb; i++) {
      const k = ridgeH[i];
      if (k < 0) continue;
      const j = (i + 1) % nb;
      if (ridgeH[j] !== k) continue;
      const H = E[k].H, row = (p, o) => {
        const u = [p[0] / R, p[1] / R, p[2] / R], Hc = H * ridgeCrest(p, u);
        // (its face: falling inward at 1 in 2, so facing up and in)
        const nl = Math.hypot(u[0] * 2 - o[0], u[1] * 2 - o[1], u[2] * 2 - o[2]), nx = (u[0] * 2 - o[0]) / nl, ny = (u[1] * 2 - o[1]) / nl, nz = (u[2] * 2 - o[2]) / nl;
        return [[0.15, Hc], [0.15 - Hc, Hc / 2], [0.15 - 2 * Hc, 0]].map(([x, z]) => put([p[0] + o[0] * x, p[1] + o[1] * x, p[2] + o[2] * x], rt + z, nx, ny, nz, top + z, 0.5));
      };
      const ra = row(ring[i], out[i]), rb = row(ring[j], out[j]);
      for (let cc = 0; cc < 2; cc++) I.push(ra[cc], ra[cc + 1], rb[cc], rb[cc], ra[cc + 1], rb[cc + 1]);
      ridgeBlocks(ring[i], ring[j], out[i], H, top, Pc.id ^ i);
    }
    // the walls: each piece of outline from its top to just under the water
    for (let i = 0; i < nb; i++) {
      const j = (i + 1) % nb, o = out[i];
      const a0 = put(ring[i], rt, o[0], o[1], o[2], top, 1), a1 = put(ring[j], rt, o[0], o[1], o[2], top, 1);
      const b0 = put(ring[i], R - 0.05, o[0], o[1], o[2], 0, 1), b1 = put(ring[j], R - 0.05, o[0], o[1], o[2], 0, 1);
      I.push(a0, b0, a1, a1, b0, b1);
    }
  }
  // a ridge's blocks over its sail along a stretch of outline pa..pb (o: out across it; H its sail's height;
  // top the floe's): the thinner ice it was crushed from (blocks ~0.1-0.4 m thick, 0.6-2.5 m long),
  // tumbled every way, enough to cover the sail; only near the camera (further off the sail's own blocks
  // are drawn: floeRender.js). Each: its middle (from origin), its turn (a quaternion), its size (l, t, w)
  function ridgeBlocks(pa, pb, o, H, top, seed) {
    const mx = (pa[0] + pb[0]) / 2 - origin[0], my = (pa[1] + pb[1]) / 2 - origin[1], mz = (pa[2] + pb[2]) / 2 - origin[2];
    if (mx * mx + my * my + mz * mz > 250 * 250) return;
    let h = (seed >>> 0) ^ 0x9e3779b9;
    const rnd = () => { h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d) >>> 0; h = Math.imul(h ^ (h >>> 12), 0x297a2d39) >>> 0; h = (h ^ (h >>> 15)) >>> 0; return h / 4294967296; };
    const len = Math.hypot(pb[0] - pa[0], pb[1] - pa[1], pb[2] - pa[2]), tb = 0.1 + 0.2 * Math.min(1, H / 1.5);
    const n = Math.floor(len * 2.24 * H / 0.75 + rnd());
    const et = [(pb[0] - pa[0]) / len, (pb[1] - pa[1]) / len, (pb[2] - pa[2]) / len];
    for (let b = 0; b < n; b++) {
      const t = rnd(), base = [pa[0] + (pb[0] - pa[0]) * t, pa[1] + (pb[1] - pa[1]) * t, pa[2] + (pb[2] - pa[2]) * t];
      const bl = Math.hypot(...base), u = [base[0] / bl, base[1] / bl, base[2] / bl], Hc = H * ridgeCrest(base, u);
      const x = rnd() * 2 * Hc, l = 0.6 + 1.9 * Math.pow(rnd(), 1.5), w = 0.5 + rnd(), th = tb * (0.7 + 0.6 * rnd());
      const z = top + Math.max(0, Hc - x / 2) - th * 0.4 * rnd();
      const r = R + z;
      const c = [base[0] + o[0] * (0.15 - x), base[1] + o[1] * (0.15 - x), base[2] + o[2] * (0.15 - x)], cl = Math.hypot(...c);
      B.push(c[0] * r / cl - origin[0], c[1] * r / cl - origin[1], c[2] * r / cl - origin[2]);
      // (its turn: along the ridge, up and out as axes, then yawed, pitched 15-65 degrees either way and rolled)
      const yaw = rnd() * 6.2832, pitch = (0.26 + 0.87 * rnd()) * (rnd() < 0.5 ? -1 : 1), roll = (rnd() - 0.5) * 1.05;
      B.push(...turn(et, u, yaw, pitch, roll), l, th, w);
    }
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
  return { origin, pos: Float32Array.from(P), nrm: Float32Array.from(N), fp: Float32Array.from(F), aux: Float32Array.from(A), idx: Uint32Array.from(I), blocks: Float32Array.from(B) };
}

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
// a block's turn as a quaternion (x, y, z, w): its axes along the ridge (et), up (u) and across, yawed
// about up, pitched about along, rolled about across
function turn(et, u, yaw, pitch, roll) {
  const ac = [et[1] * u[2] - et[2] * u[1], et[2] * u[0] - et[0] * u[2], et[0] * u[1] - et[1] * u[0]];
  // (the frame's matrix, columns: along, up, across; then the local yaw (y), pitch (x), roll (z))
  const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch), cr = Math.cos(roll), sr = Math.sin(roll);
  // local rotation Ry * Rx * Rz
  const Lr = [
    [cy * cr + sy * sp * sr, -cy * sr + sy * sp * cr, sy * cp],
    [cp * sr, cp * cr, -sp],
    [-sy * cr + cy * sp * sr, sy * sr + cy * sp * cr, cy * cp],
  ];
  const Fm = [[et[0], u[0], ac[0]], [et[1], u[1], ac[1]], [et[2], u[2], ac[2]]];
  const M = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) M[i][j] = Fm[i][0] * Lr[0][j] + Fm[i][1] * Lr[1][j] + Fm[i][2] * Lr[2][j];
  // (matrix to quaternion)
  const tr = M[0][0] + M[1][1] + M[2][2];
  let x, y, z, w;
  if (tr > 0) { const S2 = Math.sqrt(tr + 1) * 2; w = 0.25 * S2; x = (M[2][1] - M[1][2]) / S2; y = (M[0][2] - M[2][0]) / S2; z = (M[1][0] - M[0][1]) / S2; }
  else if (M[0][0] > M[1][1] && M[0][0] > M[2][2]) { const S2 = Math.sqrt(1 + M[0][0] - M[1][1] - M[2][2]) * 2; w = (M[2][1] - M[1][2]) / S2; x = 0.25 * S2; y = (M[0][1] + M[1][0]) / S2; z = (M[0][2] + M[2][0]) / S2; }
  else if (M[1][1] > M[2][2]) { const S2 = Math.sqrt(1 + M[1][1] - M[0][0] - M[2][2]) * 2; w = (M[0][2] - M[2][0]) / S2; x = (M[0][1] + M[1][0]) / S2; y = 0.25 * S2; z = (M[1][2] + M[2][1]) / S2; }
  else { const S2 = Math.sqrt(1 + M[2][2] - M[0][0] - M[1][1]) * 2; w = (M[1][0] - M[0][1]) / S2; x = (M[0][2] + M[2][0]) / S2; y = (M[1][2] + M[2][1]) / S2; z = 0.25 * S2; }
  return [x, y, z, w];
}
