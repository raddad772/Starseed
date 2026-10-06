// Whether a world's open liquid is frozen now, here: render/liquid.js's liquidIce and the terrain
// shader's ragged sea-ice edge, the same sums, so the ice drawn is the ice you stand on (and a lake
// frozen the year round, which the shading draws as snow, too); the sea's ice as its floes.
import { triDetail } from './detail.js';
import { S_H } from './terrain.js';
import { snowsBySeason, SEASON_V, SEASON_W, SEASON_H } from './worldsim/season.js';
import * as dm from '../core/dmath.js';

export const SEA_SALT = { water: -1.8 };   // (the sea's freezing point under the fresh's, C)

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const _col = [0, 0, 0], _mat = new Float64Array(8), _p = [0, 0, 0], _a = [0, 0, 0, 0], _b = [0, 0, 0, 0], _yr = [0, 0, 0], _yi = [0, 0, 0];

// the liquid at d now (gen: the world's terrain; s: its sample at d, unit and planet-fixed, where it holds
// liquid; sinSun: the sun's latitude now, sin, the planet's frame; L: where the sun stands in the year,
// rad, universe.js solarLongitude, for a world that keeps its year: worldsim/season.js) into o: all (frozen
// the year round: the shading's own ice), kind, Tm (its year's mean, C), Ts (now), Tf (its freezing point),
// ice (0..1: liquid.js liquidIce), Tair (the air over a frozen sea now: its leads freeze by it)
export function liquidNow(gen, s, d, sinSun, L, o) {
  gen.shade(s, 0.05, _col, _mat, d);
  o.all = !(_mat[4] > 0);
  if (o.all) return o;
  const kind = _mat[0], Tm = _mat[1] * 120 - 60, river = kind > 0.55 && kind < 0.85, flow = river ? _mat[2] : 0;
  let Ts;
  // (its swing there now, liquid.js liquidIce's: the season map's texels, here the climate grid's own
  // blend of the same numbers)
  const yr = gen.snap && snowsBySeason(gen.p) && gen.snap.season(d[0], d[1], d[2], _yr);
  if (yr) {
    const follow = kind < 0.2 ? 1 : kind < 0.55 ? 0.8 : kind < 0.85 ? 0.7 : 1;
    Ts = Tm + follow * (_yr[0] * dm.cos(L) + _yr[1] * dm.sin(L));
  } else {
    const follow = kind < 0.2 ? 0.25 : kind < 0.55 ? 0.6 : kind < 0.85 ? 0.45 : 0.8;
    Ts = Tm + 70 * sinSun * d[1] * follow;
  }
  const Tf = (kind < 0.2 ? SEA_SALT[gen.p.liquid] || 0 : 0) - 3 * flow;
  o.kind = kind; o.Tm = Tm; o.Ts = Ts; o.Tf = Tf; o.ice = 1 - smooth(Tf - 4, Tf + 4, Ts);
  // (the air over the pack: liquid.js seaFloes' frz the same)
  o.Tair = yr && gen.snap.seasonIce(d[0], d[1], d[2], _yi) ? Tm + _yi[2] + _yi[0] * dm.cos(L) + _yi[1] * dm.sin(L) : Ts;
  return o;
}
const _ln = {};
export function frozenNow(gen, s, d, sinSun, L = 0) {
  const q = liquidNow(gen, s, d, sinSun, L, _ln);
  if (q.all) return true;
  if (q.ice > 0 && q.kind < 0.2) {
    const r = gen.R + Math.max(0, s[S_H]);
    _p[0] = d[0] * r; _p[1] = d[1] * r; _p[2] = d[2] * r;
    return seaFloe(_p, d, iceAt(gen, L, q.ice), Math.max(q.Tf - q.Tair, 0));
  }
  return q.ice > 0.5;
}

// the pack's ice at d now, its season's (gen; L as liquidNow's; Tm its sea's year's mean, C) into o: hi (m:
// the floes' ice, first-year ice grown by the freezing degree days since freeze-up of the air over it,
// 1.33 FDD^0.58 cm (Lebedev 1938), wasting through the thaw; where it never thaws old ice, 3 m) and hs (m:
// the snow on it, the winter's fall so far at settled snow's density)
export function packIce(gen, d, L, Tm, o) {
  o.hi = 0.5; o.hs = 0.05;
  if (!gen.snap || !gen.snap.seasonIce(d[0], d[1], d[2], _yi) || !gen.snap.season(d[0], d[1], d[2], _yr)) return o;
  const Y = gen.snap.s.yearDays || 365, Tf = -1.8, Tb = Tm + _yi[2], A = Math.sqrt(_yi[0] * _yi[0] + _yi[1] * _yi[1]);
  // (m of settled snow a year at the cold half's rate, half of it blown into the leads: Leonard and
  // Maksym 2011)
  const fall = 0.5 * Math.max(0, _yr[2]) * 12 / 300;
  if (Tb - A >= Tf) { o.hi = 0; o.hs = 0; return o; }
  if (Tb + A <= Tf) { o.hi = 3; o.hs = Math.min(0.5, fall); return o; }
  const th = dm.acos((Tf - Tb) / A), Yr = Y / dm.TWO_PI;
  let x = L - dm.atan2(_yi[1], _yi[0]);
  x -= dm.TWO_PI * Math.floor((x + dm.PI) / dm.TWO_PI);
  // (freezing from x = th round to 2 pi - th; the degree days to angle a past freeze-up)
  const fdd = (a) => Math.max(0, Yr * ((Tf - Tb) * a - A * (dm.sin(th + a) - dm.sin(th))));
  const cm = (f) => Math.min(300, 1.33 * dm.pow(f, 0.58));
  if (x >= th || x <= -th) {
    const a = x >= th ? x - th : x + dm.TWO_PI - th;
    o.hi = cm(fdd(a)) / 100; o.hs = fall * a / dm.TWO_PI;
  } else {
    o.hi = cm(fdd(dm.TWO_PI - 2 * th)) / 100 * (1 - (x + th) / (2 * th)); o.hs = 0;
  }
  return o;
}
// the pack's ice at a floe's middle m (packIce, its sea's year's mean from the season map there: one value
// for the slabs, their blocks and the walker alike; Tm where the world keeps no year) into o
export function packIceAt(gen, m, L, Tm, o) {
  const S = gen.snap && gen.snap.s, l = Math.sqrt(m[0] * m[0] + m[1] * m[1] + m[2] * m[2]), d = [m[0] / l, m[1] / l, m[2] / l];
  if (S && S.seasonPx && S.seasonV === SEASON_V) Tm = mapAt(S.seasonPx, SEASON_W, SEASON_H, m, _mp)[3] * 120 - 60;
  return packIce(gen, d, L, Tm, o);
}
// a floe's top above the water (m; floeAt's id, piece): its ice (the pack's, more or less by the floe:
// older and younger ones) floating at Archimedes' freeboard (sea water 1025, ice 917 kg/m3) less its
// snow's weight (300 kg/m3), its snow on it; no more snow than it floats (more and the sea floods it, the
// slush freezing into its ice: its top at most ~a third of its ice's thickness)
export function floeTop(pk, id, piece) {
  const hi = pk.hi * (0.7 + 0.6 * ((id >>> 8) & 255) / 255) * (piece ? 0.6 : 1), hs = Math.min(pk.hs, hi * (1025 - 917) / 300);
  return Math.max(0, hi * (1025 - 917) / 1025 - hs * 300 / 1025) + hs;
}

// ---- the sea's floes, as liquid.js seaFloes draws them (its integer hash and cells, so the floe you see
// is the floe you stand on; edges to a float's rounding)
const floeHash = (x, y, z, sd) => {
  let h = (Math.imul(x, 0x8da6b343) ^ Math.imul(y, 0xd8163841) ^ Math.imul(z, 0xcb1ab31f) ^ Math.imul(sd, 0x165667b1)) >>> 0;
  h = (h ^ (h >>> 15)) >>> 0; h = Math.imul(h, 0x2c1b3c6d) >>> 0;
  h = (h ^ (h >>> 12)) >>> 0; h = Math.imul(h, 0x297a2d39) >>> 0;
  return (h ^ (h >>> 15)) >>> 0;
};
// how close the pack is (liquid.js seaIceCover) at p (d its way), its temperature's ice
const seaIceCover = (ice, p, d) => { triDetail(p, d, 512, _a); triDetail(p, d, 64, _b); return smooth(0.35, 0.75, ice + (_a[3] - 0.5) * 0.9 + (_b[0] - 0.5) * 0.35) * smooth(0, 0.15, ice); };
// a lead's ice (cm) frz C under the freezing point, by its age from its floes' hash (liquid.js leadIce)
const leadIceH = (lid, frz) => frz > 0 ? 1.33 * dm.pow(frz * -2 * dm.log(((lid & 65535) + 0.5) / 65536), 0.58) : 0;
// (thin ice bears a walker from ~10 cm)
const LEAD_BEARS = 10;
const _j = [0, 0, 0, 0], _k = [0, 0, 0, 0];
// a lead's half width (liquid.js leadHalf) and how close the pack is at a point m of it (pieceCover)
const leadHalf = (cid, c, s) => Math.min(150, 0.03 * Math.min(s, 2048) * (0.2 + 1.6 * (cid & 255) / 256) * (1 + 8 * (1 - Math.sqrt(c))));
const _u = [0, 0, 0], _pr = [0, 0, 0];
// what a crack did as it formed (liquid.js crackOpen): its lead's half width (m, > 0), or closed into a
// pressure ridge: its sail's height (m, as < 0)
export const crackOpen = (cid, c, s) => (((cid >>> 8) & 255) / 256 < 0.5 * smooth(0.85, 1.0, c) ? -(0.5 + ((cid >>> 16) & 255) / 255) : leadHalf(cid, c, s));
// (ice: the sea's ice there, a number, or by place: iceAt's)
const pieceCover = (m, ice) => { const l = Math.sqrt(m[0] * m[0] + m[1] * m[1] + m[2] * m[2]); _u[0] = m[0] / l; _u[1] = m[1] / l; _u[2] = m[2] / l; return seaIceCover(typeof ice === 'function' ? ice(m) : ice, m, _u); };
// the season map's texels at m (snap.seasonPx, w x h; WebGL's linear filter: texel centres, s repeating,
// t clamped) into o (0..1 each)
function mapAt(px, w, h, m, o) {
  const l = Math.sqrt(m[0] * m[0] + m[1] * m[1] + m[2] * m[2]), x = m[0] / l, y = Math.max(-1, Math.min(1, m[1] / l)), z = m[2] / l;
  const fx = (dm.atan2(z, x) / 6.28319 + 0.5) * w - 0.5, fy = (dm.asin(y) / 3.14159 + 0.5) * h - 0.5;
  const x0 = Math.floor(fx), y0 = Math.floor(fy), tx = fx - x0, ty = fy - y0;
  const xa = ((x0 % w) + w) % w, xb = (xa + 1) % w, ya = Math.max(0, Math.min(h - 1, y0)), yb = Math.max(0, Math.min(h - 1, y0 + 1));
  for (let k = 0; k < 4; k++) {
    const a = px[4 * (ya * w + xa) + k], b = px[4 * (ya * w + xb) + k], c = px[4 * (yb * w + xa) + k], d = px[4 * (yb * w + xb) + k];
    o[k] = ((a + (b - a) * tx) * (1 - ty) + (c + (d - c) * tx) * ty) / 255;
  }
  return o;
}
const _mp = [0, 0, 0, 0];
// the sea's temperature at m now (C: its year's mean and its swing now, the season map's; null where the
// world keeps no year)
export function seaTempAt(gen, L, m) {
  const S = gen.snap && gen.snap.s;
  if (!S || !S.seasonPx || S.seasonV !== SEASON_V) return null;
  const t = mapAt(S.seasonPx, SEASON_W, SEASON_H, m, _mp);
  return t[3] * 120 - 60 + (t[0] - 0.5) * 100 * dm.cos(L) + (t[1] - 0.5) * 100 * dm.sin(L);
}
// the sea's ice by place now (L: where the sun stands in the year): render/season.js seaIceAt's sums on
// the same map; or ice everywhere where the world keeps no year
export function iceAt(gen, L, ice) {
  const S = gen.snap && gen.snap.s;
  if (!S || !S.seasonPx || S.seasonV !== SEASON_V || !snowsBySeason(gen.p)) return ice;
  const Tf = SEA_SALT[gen.p.liquid] || 0, cL = dm.cos(L), sL = dm.sin(L);
  return (m) => {
    const t = mapAt(S.seasonPx, SEASON_W, SEASON_H, m, _mp);
    const Ts = t[3] * 120 - 60 + (t[0] - 0.5) * 100 * cL + (t[1] - 0.5) * 100 * sL;
    return 1 - smooth(Tf - 4, Tf + 4, Ts);
  };
}

// ---- the pack subdivided (Dave: "Why not actually subdivide the ice?"; liquid.js floeOf the same sums).
// Each cube face of the world in its own coordinates (u, v: the other two over its own, a central
// projection: a great circle a straight line), the face's square split by a crack and each half split
// again, every piece an exact convex polygon. A crack: a line through near the piece's middle (its
// centroid, off along its length by its hash), across its length (its vertices' long axis) give or take
// 30 degrees: pieces stay compact, as a floe breaks across. Splitting stops once a piece is small enough
// (a close pack's ~300 m, an open one's ~12 m: the waves break it near its edge, Toyota et al. 2006) or
// by chance below ~4 km (a fifth a level: sizes spread, many small, few big). Each edge keeps the crack
// it came from: its hash, and its lead's half width, opened as the crack was (the piece it parted: its
// size and the pack's cover at its middle), the same all along it and from both sides.
const nrm3 = (v, k = 1) => { const l = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]); v[0] *= k / l; v[1] *= k / l; v[2] *= k / l; return v; };
export const POLY_MAX = 12;
// how round a floe's corners are (m: liquid.js floeRound)
export const floeAge = (size, id) => (0.3 + 0.7 * smooth(16, 200, size)) * (0.6 + 0.4 * (id >>> 16) / 65536);
export const floeRound = (size, id, c) => size * (0.06 * (0.5 + floeAge(size, id)) + 0.32 * (1 - smooth(0.5, 0.9, c)));
// the face p's on (o.ax its axis, o.sg its sign, o.face its index) and p's (u, v) on it
export function faceUV(p, o) {
  const A0 = Math.abs(p[0]), A1 = Math.abs(p[1]), A2 = Math.abs(p[2]);
  const ax = A0 >= A1 && A0 >= A2 ? 0 : A1 >= A2 ? 1 : 2, b = (ax + 1) % 3, d = (ax + 2) % 3;
  o.ax = ax; o.sg = p[ax] < 0 ? -1 : 1; o.face = ax * 2 + (p[ax] < 0 ? 1 : 0);
  o.u = p[b] / p[ax]; o.v = p[d] / p[ax];
  return o;
}
// a face's piece to begin with: its square, each edge its lead with the face across it
export function faceRoot(f, o) {
  const ax = f.ax, b = (ax + 1) % 3, d = (ax + 2) % 3;
  const across = (axis, neg) => { const of = axis * 2 + (neg ? 1 : 0); return floeHash(Math.min(f.face, of), Math.max(f.face, of), 0x4f1d, 0x2b7c); };
  // (the edge u = -1 borders the face of axis b on the side where p[b] has the sign opposite p[ax]'s)
  o.n = 4; o.V = o.V || new Float64Array(2 * POLY_MAX); o.EI = o.EI || new Uint32Array(POLY_MAX); o.ES = o.ES || new Float64Array(POLY_MAX);
  const V = o.V; V[0] = -1; V[1] = -1; V[2] = 1; V[3] = -1; V[4] = 1; V[5] = 1; V[6] = -1; V[7] = 1;
  const neg = f.sg < 0;
  o.EI[0] = across(d, !neg); o.EI[1] = across(b, neg); o.EI[2] = across(d, neg); o.EI[3] = across(b, !neg);
  for (let i = 0; i < 4; i++) o.ES[i] = leadHalf(o.EI[i], 1, 4096);
  o.id = floeHash(f.face, 0x51ce, 0, 0x3a7b);
  return o;
}
// a piece's centroid (cu, cv), its area (uv) and its long axis (the vertices' spread: angle, extent)
export function pieceShape(P, o) {
  const V = P.V, n = P.n, x0 = V[0], y0 = V[1];
  let A = 0, cx = 0, cy = 0;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n, xi = V[2 * i] - x0, yi = V[2 * i + 1] - y0, xj = V[2 * j] - x0, yj = V[2 * j + 1] - y0, w = xi * yj - xj * yi;
    A += w; cx += (xi + xj) * w; cy += (yi + yj) * w;
  }
  A *= 0.5;
  o.area = Math.abs(A); o.cu = x0 + cx / (6 * A); o.cv = y0 + cy / (6 * A);
  let sxx = 0, syy = 0, sxy = 0;
  for (let i = 0; i < n; i++) { const x = V[2 * i] - o.cu, y = V[2 * i + 1] - o.cv; sxx += x * x; syy += y * y; sxy += x * y; }
  // (a square has no long axis: liquid.js the same)
  o.th = Math.abs(sxy) + Math.abs(sxx - syy) > 1e-30 * (sxx + syy) ? 0.5 * dm.atan2(2 * sxy, sxx - syy) : 0; o.ext = Math.sqrt((sxx + syy) / n);
  return o;
}
// a piece's size (m) and middle (3D, on the sphere of radius R) from its shape (face f)
export function pieceMid(f, sh, R, m) {
  const ax = f.ax, b = (ax + 1) % 3, d = (ax + 2) % 3, q = 1 + sh.cu * sh.cu + sh.cv * sh.cv;
  m[ax] = f.sg; m[b] = f.sg * sh.cu; m[d] = f.sg * sh.cv;
  nrm3(m, R);
  return R * Math.sqrt(sh.area) / dm.pow(q, 0.75);
}
// the crack of piece P (hash id, level lvl, shape sh) into k: the line A u + B v + C = 0
export function pieceCrack(P, lvl, sh, k) {
  const h = floeHash(P.id, lvl, 0x51ce, 0x3a7b);
  const th = sh.th + dm.PI * 0.5 + ((h >>> 8) & 1023) / 1023 * 1.0472 - 0.5236, off = (((h >>> 18) & 255) / 255 - 0.5) * 0.6 * sh.ext;
  const qu = sh.cu + dm.cos(sh.th) * off, qv = sh.cv + dm.sin(sh.th) * off;
  k.A = -dm.sin(th); k.B = dm.cos(th); k.C = -(k.A * qu + k.B * qv);
  k.h = h; k.cid = floeHash(P.id, lvl, 0x7a11, 0x1f3d);
  return k;
}
// P clipped to the side (1: A u + B v + C >= 0) of crack k into Q (its new edge the crack's, its lead's
// half width g)
export function clipPiece(P, k, side, g, Q) {
  const V = P.V, n = P.n, sg = side ? 1 : -1;
  Q.V = Q.V || new Float64Array(2 * POLY_MAX); Q.EI = Q.EI || new Uint32Array(POLY_MAX); Q.ES = Q.ES || new Float64Array(POLY_MAX);
  let m = 0;
  for (let i = 0; i < n && m < POLY_MAX; i++) {
    const j = (i + 1) % n, xi = V[2 * i], yi = V[2 * i + 1], xj = V[2 * j], yj = V[2 * j + 1];
    const di = sg * (k.A * xi + k.B * yi + k.C), dj = sg * (k.A * xj + k.B * yj + k.C);
    if (di >= 0) { Q.V[2 * m] = xi; Q.V[2 * m + 1] = yi; Q.EI[m] = P.EI[i]; Q.ES[m] = P.ES[i]; m++; }
    if ((di >= 0) !== (dj >= 0) && m < POLY_MAX) {
      const t = di / (di - dj);
      Q.V[2 * m] = xi + (xj - xi) * t; Q.V[2 * m + 1] = yi + (yj - yi) * t;
      // (entering the kept side: this edge the old one's; leaving: the crack's)
      if (di >= 0) { Q.EI[m] = k.cid; Q.ES[m] = g; } else { Q.EI[m] = P.EI[i]; Q.ES[m] = P.ES[i]; }
      m++;
    }
  }
  Q.n = m;
  return Q;
}
// whether a piece splits again (its crack's hash, size, the pack's cover at its middle)
export const splits = (h, s, c) => !(s < 4096 && (s < 12 + 288 * smooth(0.4, 0.95, c) || (h & 255) < 51.2 * smooth(0.5, 0.9, c)));
export const childId = (id, side, lvl) => floeHash(id, side, lvl, 0x9e37);
const _FU = {}, _P0 = {}, _P1 = {}, _SH = {}, _KR = {}, _MID = [0, 0, 0], _N3 = [0, 0, 0];
// an edge's plane (through the world's middle) in 3D from its line in face f's (u, v), unit, into n
export function edgePlane(f, Au, Bv, C, n) {
  const ax = f.ax, b = (ax + 1) % 3, d = (ax + 2) % 3;
  n[b] = Au; n[d] = Bv; n[ax] = C;
  return nrm3(n);
}
// the piece of the pack at p (liquid.js floeOf: the same splits) into o: id, e (in from its edge less the
// lead there, m), lid, c, size, mid, there; o.P its polygon (face o.f's u, v)
export function floeOf(p, ice, o) {
  const f = faceUV(p, o.f || (o.f = {})), R = Math.sqrt(p[0] * p[0] + p[1] * p[1] + p[2] * p[2]);
  let P = faceRoot(f, _P0), Q = _P1, c = 1, s = 0, cP = -1;
  const m = o.mid || (o.mid = [0, 0, 0]);
  for (let lvl = 0; lvl < 32; lvl++) {
    const sh = pieceShape(P, _SH);
    if (!(sh.area >= 1e-20)) break;
    s = pieceMid(f, sh, R, m);
    const k = pieceCrack(P, lvl, sh, _KR);
    // (the pack's closeness for its splitting and leads: once for a ~4 km plate down to 1 km, then by
    // piece; liquid.js's)
    if (s < 4096) { if (cP < 0 || s < 1024) cP = pieceCover(m, ice); c = cP; if (!splits(k.h, s, c)) break; }
    if (P.n >= POLY_MAX - 1) break;
    const side = k.A * f.u + k.B * f.v + k.C >= 0 ? 1 : 0;
    clipPiece(P, k, side, crackOpen(k.cid, c, s), Q);
    Q.id = childId(P.id, side, lvl);
    const t = P; P = Q; Q = t;
  }
  // (in from its edge: the nearest of its edges' planes, less that edge's lead (a ridge's floes touch);
  // its corners rounded (floeRound); and its nearest ridge: its sail's height here, liquid.js's ridge.w)
  let e = Infinity, lid = 0, rd = Infinity, rh = 0, e2 = Infinity;
  const V = P.V, n = P.n;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n, du = V[2 * j] - V[2 * i], dv = V[2 * j + 1] - V[2 * i + 1];
    if (du * du + dv * dv < 1e-24) continue;
    const Au = -dv, Bv = du, C = -(Au * V[2 * i] + Bv * V[2 * i + 1]);
    edgePlane(f, Au, Bv, C, _N3);
    const ad = Math.abs(p[0] * _N3[0] + p[1] * _N3[1] + p[2] * _N3[2]), ek = ad - Math.max(P.ES[i], 0.15);
    if (ek < e) { e2 = e; e = ek; lid = P.EI[i]; } else if (ek < e2) e2 = ek;
    if (P.ES[i] < 0 && ad < rd) { rd = ad; rh = -P.ES[i]; }
  }
  o.ridge = rh > 0 ? rh * Math.max(0, 1 - rd / (2 * rh)) : 0; o.ridgeH = rh; o.ridgeD = rd;
  c = pieceCover(m, ice);
  const rr = floeRound(s, P.id, c);
  if (e2 < rr) e = rr - dm.hypot(rr - e, rr - e2);
  o.id = P.id; o.e = e; o.lid = lid; o.c = c; o.size = s; o.P = P;
  o.there = c > 0 && (P.id & 65535) / 65536 <= Math.min(1, 1.5 * c);
  return o;
}
export { leadHalf, pieceCover };
const _rc = [0, 0, 0, 0];
// a pressure ridge's crest by place: its height over its sail's own, 0.6..1.4 (the 4 m tile: blocks piled
// higher here, lower there; the slabs and the walker alike)
export const ridgeCrest = (p, d) => 0.6 + 0.8 * triDetail(p, d, 4, _rc)[1];
const _FO = {};
// what's under p (body-fixed m; d its way) of the sea's ice, its temperature's ice (0..1), into o: f (how
// far in from the edge of the piece there less its lead, m; < 0 none: liquid.js seaFloes' own sums), id
// (its hash), c (the pack's cover), lid (the lead's hash: lead ice it may be, leadIceH), lead (whether
// there's a piece there whose lead it is), size (m)
export function floeAt(p, d, ice, o) {
  const F = floeOf(p, ice, _FO);
  // (its edges ragged: liquid.js the same)
  const e = F.e + (triDetail(p, d, 8, _j)[0] - 0.5) * 1.6 + (triDetail(p, d, 2, _k)[3] - 0.5) * 0.5;
  o.c = F.c; o.lid = F.lid; o.lead = F.there; o.f = F.there ? e : -Infinity; o.id = F.id; o.size = F.size; o.piece = F.size < 64; o.mid = F.mid; o.P = F.P; o.face = F.f;
  // (its sail's height here at its crest's: floeslabs.js's tent)
  o.ridge = F.there && F.ridgeH > 0 ? Math.max(0, F.ridgeH * ridgeCrest(p, d) - F.ridgeD / 2) : 0;
  return o;
}
const _fa = {};
// whether the sea's ice bears you at p (body-fixed m; d its way), its temperature's ice (0..1), frz C
// under the sea's freezing point: a floe of the pack, a lead frozen over thick enough, or a piece of a
// broken floe (liquid.js seaFloes)
export function seaFloe(p, d, ice, frz = 0) {
  const o = floeAt(p, d, ice, _fa);
  seaFloe.lastC = o.c;   // (for tests: its cover, and what bears you: 1 a floe, 2 a piece, 3 a lead's ice)
  seaFloe.why = o.f > 0 ? (o.piece ? 2 : 1) : o.lead && leadIceH(o.lid, frz) >= LEAD_BEARS ? 3 : 0;
  return seaFloe.why > 0;
}
