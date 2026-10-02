// Craters below the world sim's grid. Each level of the terrain (the refinement and the
// pyramid's levels: localsim.js) adds the impacts its cells draw round that the level above's
// couldn't: D from TILE_CELLS of its own cells (a power of two metres: impacts.js craterFloor)
// up to the level above's floor, the refinement's up to the world sim's. So a crater is drawn
// by the coarsest level that holds it, never a grid's few cells blended into a square.
//
// Their number is the world's crater record there: the snapshot's crat, the craters the
// bombardment left on that ground since it was last flooded or resurfaced (barren.js), the
// lunar chronology's counts falling as D^-2. Their places are a Poisson draw in a lattice over
// the cube's faces, each lattice cell's from its own hash: every tile and every machine draws
// the same craters, whichever tile asks. Their shapes are impacts.js's (bowls when small; flat
// floors, terraced walls and central peaks when big), worn by their age: creep wears a crater
// as its age over its size squared, so old small ones are soft, nearly gone, and big ones keep
// their rims.

import * as dm from '../core/dmath.js';
import { Rng, hashInts } from '../core/rng.js';
import { dirFromFaceUV, faceUVFromDir, FACES } from './cubesphere.js';

// craters are drawn scaled down whole with a little vertical exaggeration (impacts.js)
export const VEXAG = 2.5;

const QPI = dm.PI / 4;
const REACH = 3;          // (the ejecta reach 3 radii)
const LAT = 6;
// the share of craters D across that the air lets through (Dair: the smallest it lets through at
// all; any units): the small impactors break up, many of them well above that size (Venus has
// no craters under ~3 km and few under ~25 km: ~6% of the craters 3 km and up an airless world
// would have, a third of those 10 km and up, most of those 30 km and up)
export function airKeep(D, Dair) {
  if (!(Dair > 0)) return 1;
  if (D < Dair) return 0;
  const x = D / (10 * Dair);
  return 1 - dm.exp(-x * x);
}            // (an octave's lattice cells, in its smallest craters' widths: wider than any one's reach)

// the craters D in [D0, D1) of lattice cell (i, j) on face f (nL cells a side): as many as the
// record there gives its area (a Poisson draw), placed evenly in it, sized by the D^-2 law
// within the octave, each of its own age; the same for every tile, sampler and machine
const _d = [0, 0, 0], _d00 = [0, 0, 0], _d10 = [0, 0, 0], _d01 = [0, 0, 0], _d11 = [0, 0, 0];
export function latticeCraters(f, i, j, D0, D1, nL, S, seed, R, Dair = 0) {
  const sL = 2 / nL, u0 = -1 + i * sL, v0 = -1 + j * sL, rate = 1 / (D0 * D0) - 1 / (D1 * D1), out = [];
  dirFromFaceUV(f, u0, v0, _d00); dirFromFaceUV(f, u0 + sL, v0, _d10); dirFromFaceUV(f, u0, v0 + sL, _d01); dirFromFaceUV(f, u0 + sL, v0 + sL, _d11);
  const ax = _d11[0] - _d00[0], ay = _d11[1] - _d00[1], az = _d11[2] - _d00[2], bx = _d01[0] - _d10[0], by = _d01[1] - _d10[1], bz = _d01[2] - _d10[2];
  const cx = ay * bz - az * by, cy = az * bx - ax * bz, cz = ax * by - ay * bx;
  const area = 0.5 * Math.sqrt(cx * cx + cy * cy + cz * cz) * R * R;
  dirFromFaceUV(f, u0 + sL / 2, v0 + sL / 2, _d);
  const lam = S.crat(_d[0], _d[1], _d[2]) * rate * area;
  if (!(lam > 1e-9)) return out;
  const rng = new Rng([hashInts(f, i, j, D0 | 0), seed >>> 0, 0xc7a7e2, nL]);
  let k = poisson(rng, lam);
  while (k-- > 0) {
    const at = dirFromFaceUV(f, u0 + sL * rng.next(), v0 + sL * rng.next(), [0, 0, 0]);
    const D = 1 / Math.sqrt(1 / (D0 * D0) - rng.next() * rate), age = rng.next(), key = rng.u32();
    // (the air broke up most of the small ones)
    if (Dair > 0 && (hashInts(key, 0xa12) >>> 0) / 4294967296 >= airKeep(D, Dair)) continue;
    out.push({ at, D, age, key });
  }
  return out;
}

// stamps the craters D in [Dlo, Dhi) (m across as drawn) onto B: heights on a tile's grid G
// (localsim.js tileGrid) on face `face`. S: the snapshot's sampler; K: its craters' scales
// ({ g, scale }); seed: the world's; R: its radius (m). Returns how many it drew.
// (where a crater's ground is read for its plane: its middle and two rings, in its radii)
const GP = [0, 0];
for (let k = 0; k < 6; k++) GP.push(0.5 * dm.cos(k * dm.PI / 3), 0.5 * dm.sin(k * dm.PI / 3), dm.cos((k + 0.5) * dm.PI / 3), dm.sin((k + 0.5) * dm.PI / 3));
const gd = [0, 0, 0];
export function stampCraters(B, G, face, S, Dlo, Dhi, K, seed, R, hs = 1) {
  const NG = G.N, du = G.du, list = [];
  const d = [0, 0, 0], uv = { face: 0, u: 0, v: 0 };
  const uvM = QPI * R * 0.7;      // (metres per unit of a face's u, v at the least: near its corners)
  for (let D0 = Dlo; D0 < Dhi; D0 *= 2) {
    // an octave's lattice: cells about four of its biggest craters across, each face's own
    const D1 = Math.min(2 * D0, Dhi), Lm = LAT * D0, nL = Math.max(1, Math.floor(2 * QPI * R / Lm)), sL = 2 / nL;
    // (the lattice cells a crater reaching the tile can be in: found by probing the tile and
    // round it, past its face's edges too, at a third of a lattice cell)
    const ext = (REACH * D1 / 2 + 1.5 * Lm) / uvM, step = sL / 3;
    const ua = Math.max(-1.98, G.u0 - ext), ub = Math.min(1.98, G.u0 + NG * du + ext);
    const va = Math.max(-1.98, G.v0 - ext), vb = Math.min(1.98, G.v0 + NG * du + ext);
    const seen = new Set();
    for (let v = va; v <= vb + step; v += step) for (let u = ua; u <= ub + step; u += step) {
      dirFromFaceUV(face, Math.min(u, ub), Math.min(v, vb), d);
      faceUVFromDir(d, uv);
      const i = Math.min(nL - 1, Math.floor((uv.u + 1) / sL)), j = Math.min(nL - 1, Math.floor((uv.v + 1) / sL));
      const key = (uv.face * nL + j) * nL + i;
      if (seen.has(key)) continue;
      seen.add(key);
      for (const cr of latticeCraters(uv.face, i, j, D0, D1, nL, S, seed, R, K.Dair || 0)) list.push(cr);
    }
  }
  // each onto the tile, oldest first (the younger overprint them): its centre on the tile's
  // face, then the cells within its reach
  list.sort((p, q) => q.age - p.age || q.key - p.key);
  const F = FACES[face], cellMin = 0.7 * G.spacing, dir = G.dir;
  for (const cr of list) {
    const at = cr.at, dn = at[0] * F.N[0] + at[1] * F.N[1] + at[2] * F.N[2];
    if (dn < 0.05) continue;
    const a = (at[0] * F.U[0] + at[1] * F.U[1] + at[2] * F.U[2]) / dn, b = (at[0] * F.V[0] + at[1] * F.V[1] + at[2] * F.V[2]) / dn;
    const ic = (dm.atan(a) / QPI - G.u0) / du - 0.5, jc = (dm.atan(b) / QPI - G.v0) / du - 0.5;
    const Rc = cr.D / 2, rc0 = Math.ceil(1.9 * REACH * Rc / cellMin) + 1;
    if (ic + rc0 < 0 || jc + rc0 < 0 || ic - rc0 > NG - 1 || jc - rc0 > NG - 1) continue;
    const Fm = craterForm(cr.D, K, cr.key), rc = Math.ceil(Fm.reach * REACH * Rc / cellMin) + 1;
    const i0 = Math.max(0, Math.floor(ic - rc)), i1 = Math.min(NG - 1, Math.ceil(ic + rc)), j0 = Math.max(0, Math.floor(jc - rc)), j1 = Math.min(NG - 1, Math.ceil(jc + rc));
    if (i0 > i1 || j0 > j1) continue;
    // (its wear: creep's over its age, against its size)
    const Dref = 1000 * K.scale, kap = 12 * cr.age * (Dref / cr.D) * (Dref / cr.D), wear = 1 / (1 + kap);
    Fm.ks = (0.08 + 0.5 * (1 - wear)) * (Fm.depth + Fm.rim);
    // (the tangent frame at its centre: each cell's bearing from it)
    const ref = Math.abs(at[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
    let ex = ref[1] * at[2] - ref[2] * at[1], ey = ref[2] * at[0] - ref[0] * at[2], ez = ref[0] * at[1] - ref[1] * at[0];
    const el = Math.sqrt(ex * ex + ey * ey + ez * ez); ex /= el; ey /= el; ez /= el;
    const nx = at[1] * ez - at[2] * ey, ny = at[2] * ex - at[0] * ez, nz = at[0] * ey - at[1] * ex;
    // (the ground's level and slope over its cavity: where its floor settles, what its ejecta
    // drape; from the world's smooth surface at the same points round it for every tile, so a
    // crater a tile's edge cuts through settles alike on both sides)
    let ws = 0, sh = 0, sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0, sxh = 0, syh = 0;
    for (let k = 0; k < GP.length; k += 2) {
      const px = GP[k] * 0.75 * Rc, py = GP[k + 1] * 0.75 * Rc;
      gd[0] = at[0] + (px * ex + py * nx) / R; gd[1] = at[1] + (px * ey + py * ny) / R; gd[2] = at[2] + (px * ez + py * nz) / R;
      const gl = Math.sqrt(gd[0] * gd[0] + gd[1] * gd[1] + gd[2] * gd[2]), hh = S.hSmooth(gd[0] / gl, gd[1] / gl, gd[2] / gl) * hs;
      ws++; sh += hh; sx += px; sy += py; sxx += px * px; syy += py * py; sxy += px * py; sxh += px * hh; syh += py * hh;
    }
    const P = groundPlane(ws, sh, sx, sy, sxx, syy, sxy, sxh, syh);
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const c = j * NG + i, dx = dir[c * 3], dy = dir[c * 3 + 1], dz = dir[c * 3 + 2], x = dx - at[0], y = dy - at[1], z = dz - at[2];
      const dist = Math.sqrt(x * x + y * y + z * z) * R;
      if (dist >= REACH * Rc * Fm.reach) continue;
      const tx = dx * ex + dy * ey + dz * ez, ty = dx * nx + dy * ny + dz * nz;
      B[c] += wear * craterDh(Fm, dist, tx, ty) + excavate(Fm, dist, B[c], P.mean, P.mean + P.gx * (tx * R - P.mx) + P.gy * (ty * R - P.my));
    }
  }
  return list.length;
}

// a crater D m across as drawn: its depth (m below the ground round it), rim, central peak.
// Depths as impacts.js's (terrestrial complex craters, deeper on weaker gravity, a little
// exaggerated), but never past a fresh bowl's (a fifth of its width, nearly): a small crater
// keeps its real proportions. Complex above ~15 km (real) on the Moon, smaller on stronger
// gravity
function shape(D, K) {
  const Dr = D / K.scale / 1000;
  const law = 170 * dm.pow(Dr, 0.43) * dm.pow(9.81 / K.g, 0.6) * K.scale * VEXAG;
  const depth = Math.min(law, 0.17 * D), complex = Dr > 15 * 1.62 / K.g;
  return { depth, rim: (complex ? 0.35 : 0.25) * depth, peak: complex && Dr > 8 ? 0.3 * depth : 0, complex };
}

// ---- a crater's own form, from its impact (key: a hash of it). The impactor's angle (most come
// in near 45 degrees: P ~ sin 2a) and heading: the ejecta thrown downrange, none uprange below
// ~30 degrees, the rim lower there, and a grazing one's crater long. The rim slumped in arcs
// (scallops, cusps between them), the outline squared off along the target's joints (Meteor
// Crater's), a big one's walls in terraces, its central peak a cluster of knobs
const NA = 96;      // (the outline's tables, by bearing round the centre: read smoothly between entries)
export function craterForm(D, K, key) {
  const rng = new Rng([key >>> 0, hashInts(Math.round(D * 16), 0xc7a7), 0x5ca1, 0xf0e]);
  const sh = shape(D, K);
  const alpha = dm.asin(Math.sqrt(rng.next())), psi = dm.TWO_PI * rng.next();
  const obl = dm.smoothstep(1.05, 0.17, alpha), elong = 1 + 0.6 * dm.smoothstep(0.26, 0.04, alpha);
  const nl = 5 + Math.floor(7 * rng.next()), al = (sh.complex ? 0.07 : 0.015) * (0.4 + 0.6 * rng.next()), pl = dm.TWO_PI * rng.next();
  const nl2 = 3 + Math.floor(5 * rng.next()), al2 = 0.5 * al * rng.next(), pl2 = dm.TWO_PI * rng.next();
  const np = 4 + Math.floor(3 * rng.next()), ap = 0.04 * rng.next() * rng.next(), pp = dm.TWO_PI * rng.next();
  const a2 = 0.035 * rng.next(), p2 = dm.TWO_PI * rng.next(), a3 = 0.025 * rng.next(), p3 = dm.TWO_PI * rng.next();
  const h2 = 0.2 * rng.next(), q2 = dm.TWO_PI * rng.next(), h5 = 0.15 * rng.next(), q5 = dm.TWO_PI * rng.next();
  const Rm = new Float64Array(NA), Rh = new Float64Array(NA), Ej = new Float64Array(NA), To = new Float64Array(NA);
  const t2 = dm.TWO_PI * rng.next(), t3 = dm.TWO_PI * rng.next(), t5 = dm.TWO_PI * rng.next();
  let rmax = 0, mh = 0, me = 0;
  for (let k = 0; k < NA; k++) {
    const p = 4 * k / NA, qd = Math.min(3, Math.floor(p)), t = p - qd, th = qd * dm.HALF_PI + dm.atan2(t, 1 - t);
    const s1 = dm.sin(nl * th / 2 + pl), s2 = dm.sin(nl2 * th / 2 + pl2);
    const sc = Math.sqrt(s1 * s1 + 0.02) - 0.65, sc2 = Math.sqrt(s2 * s2 + 0.02) - 0.65;
    const w = (th - pp) - (dm.TWO_PI / np) * Math.floor((th - pp) / (dm.TWO_PI / np)) - dm.PI / np;
    Rm[k] = 1 + al * sc + al2 * sc2 + ap * (1 / dm.cos(w) - 1.1) + a2 * dm.cos(2 * th + p2) + a3 * dm.cos(3 * th + p3);
    const down = dm.cos(th - psi);
    Rh[k] = Math.max(0.3, 1 + 0.35 * obl * down + h2 * dm.cos(2 * th + q2) + h5 * dm.cos(5 * th + q5));
    Ej[k] = Math.max(0, 1 + 1.3 * obl * down) * (1 + 0.3 * h2 * dm.cos(3 * th + q5));
    // (where the wall's slumps stand, by bearing: the terraces wander, merge and split round it)
    To[k] = 0.45 * dm.cos(2 * th + t2) + 0.3 * dm.cos(3 * th + t3) + 0.2 * dm.cos(5 * th + t5);
    if (Rm[k] > rmax) rmax = Rm[k];
    mh += Rh[k] / NA; me += Ej[k] / NA;
  }
  // (the central peak's knobs: one to four, round the middle)
  const knobs = [];
  if (sh.peak) {
    const nk = 1 + Math.floor(4 * rng.next());
    for (let i = 0; i < nk; i++) {
      const rr = i ? 0.06 + 0.1 * rng.next() : 0.04 * rng.next(), ta = dm.TWO_PI * rng.next();
      knobs.push({ x: rr * dm.cos(ta), y: rr * dm.sin(ta), h: sh.peak * (i ? 0.4 + 0.5 * rng.next() : 1), w: 0.1 + 0.08 * rng.next() });
    }
  }
  const nt = sh.complex ? 1 + Math.floor(3 * rng.next()) : 0;
  return { ...sh, rimMean: sh.rim * (0.6 * mh + 0.4 * me), R: D / 2, cpsi: dm.cos(psi), spsi: dm.sin(psi), elong, Rm, Rh, Ej, To, knobs, nt, ks: 0.08 * (sh.depth + sh.rim), reach: rmax * elong };
}

// its height change at dist m from its centre (on the ground), bearing (tx, ty) (the tangent
// plane's east and north, any length)
export function craterDh(F, dist, tx, ty) {
  const ax = Math.abs(tx), ay = Math.abs(ty), s = ax + ay;
  // (the bearing as a pseudo-angle 0..4, the tables read between their entries)
  const p = s > 0 ? (ty >= 0 ? (tx >= 0 ? ty / s : 2 - ty / s) : (tx < 0 ? 2 + ay / s : 4 - ay / s)) : 0;
  const q = p * (NA / 4), k = Math.min(NA - 1, Math.floor(q)), f = q - k;
  const rm = cubic(F.Rm, k, f), rh = cubic(F.Rh, k, f), ej = Math.max(0, cubic(F.Ej, k, f));
  let d = dist;
  if (F.elong > 1 && s > 0) {
    const l = Math.sqrt(tx * tx + ty * ty), al = (tx * F.cpsi + ty * F.spsi) / l, ac = (ty * F.cpsi - tx * F.spsi) / l;
    d = dist * Math.sqrt(al * al / (F.elong * F.elong) + ac * ac);
  }
  // (the outline's slumps and corners are the rim's and upper walls': the bowl's middle round)
  // (and its height round the rim the rim's: the floor and the lower walls even)
  const r0 = d / F.R, wr = dm.smoothstep(0.2, 0.85, r0), r = r0 / (1 + (rm - 1) * wr), depth = F.depth, rim = F.rimMean + (F.rim * (0.6 * rh + 0.4 * ej) - F.rimMean) * wr;
  if (r >= REACH) return 0;
  let inner;
  if (F.complex) {
    if (r < 0.55) {
      inner = -depth;
      if (F.knobs.length && r < 0.5) {
        const l = s > 0 ? Math.sqrt(tx * tx + ty * ty) : 1, px = (s > 0 ? tx / l : 0) * r, py = (s > 0 ? ty / l : 0) * r;
        for (const kb of F.knobs) { const ddx = px - kb.x, ddy = py - kb.y; inner += kb.h * dm.exp(-(ddx * ddx + ddy * ddy) / (kb.w * kb.w)); }
      }
    } else {
      // (the walls, slumped in terraces)
      let t = Math.min(1, (r - 0.55) / 0.45);
      if (F.nt) { const kk = t * F.nt + cubic(F.To, k, f), fl = Math.floor(kk), fr = kk - fl; t = Math.max(0, Math.min(1, (fl + dm.smoothstep(0.1, 0.9, fr) * 0.6 + fr * 0.4 - cubic(F.To, k, f)) / F.nt)); }
      inner = -depth + (depth + rim) * t * t * (3 - 2 * t);
    }
  } else inner = -depth + (depth + rim) * r * r;
  // (outside the rim: its uplift falling away fast, the ejecta slower, thrown downrange)
  const outer = r > 0.3 ? F.rim * (0.6 * rh / (r * r * r * r) + 0.4 * ej / (r * r * r)) : 1e9;
  let v = smin(inner, outer, F.ks);
  if (r > 2) { const t = r - 2; v *= 1 - t * t * (3 - 2 * t); }
  return v;
}

// ---- a big crater's secondaries: blocks it threw out, striking two to five radii away in
// clusters and chains along a few rays, each a few percent of its size and shallow (a slow
// block's crater); worn as their own size wears them, so only a young crater's field shows
const SEC_MIN = 15, SEC_REACH = 5.5;   // (craters at least 15 km across, real, throw them)
function secondaries(cr, e, n, K, R, Dref) {
  const rng = new Rng([cr.key >>> 0, 0x5ec0, 0xda7, 0x11]), out = [], Rc = cr.D / 2;
  const nRay = 4 + Math.floor(5 * rng.next());
  for (let k = 0; k < nRay; k++) {
    const th = dm.TWO_PI * rng.next(), m = 3 + Math.floor(8 * rng.next());
    for (let q = 0; q < m; q++) {
      const r = Rc * (2 + 3 * rng.next()), a = th + 0.15 * (rng.next() - 0.5), tx = r * dm.cos(a) / R, ty = r * dm.sin(a) / R;
      const px = cr.at[0] + tx * e[0] + ty * n[0], py = cr.at[1] + tx * e[1] + ty * n[1], pz = cr.at[2] + tx * e[2] + ty * n[2], l = Math.sqrt(px * px + py * py + pz * pz);
      const D = cr.D * (0.015 + 0.04 * rng.next() * rng.next()), F = craterForm(D, K, rng.u32());
      F.depth *= 0.45; F.rim *= 0.45; F.rimMean *= 0.45; F.peak = 0; F.knobs = [];
      const kap = 12 * cr.age * (Dref / D) * (Dref / D), wear = 1 / (1 + kap);
      F.ks = (0.08 + 0.5 * (1 - wear)) * (F.depth + F.rim);
      if (wear > 0.03) out.push({ at: [px / l, py / l, pz / l], F, wear, tx, ty });
    }
  }
  return out.length ? out : null;
}

// ---- a young crater's bright ejecta (the Moon's rays: fresh rock thrown out, darkened by the
// solar wind over ~a Gyr): a blanket round its rim and streaks running out from it, each crater's
// own (from its impact's hash), thinning with distance; brighter the younger (fresh 0..1)
const RAY_AGE = 0.12, RAY_REACH = 4.5;
export function craterRays(F, key, fresh) {
  const rng = new Rng([key >>> 0, 0x7a95, 0x1ce, 0xb7]), nr = 7 + Math.floor(10 * rng.next()), T = new Float64Array(NA);
  const ang = [], wid = [], str = [];
  for (let k = 0; k < nr; k++) { ang.push(dm.TWO_PI * rng.next()); wid.push(0.04 + 0.1 * rng.next()); str.push(0.5 + 0.5 * rng.next()); }
  for (let k = 0; k < NA; k++) {
    const p = 4 * k / NA, qd = Math.min(3, Math.floor(p)), t = p - qd, th = qd * dm.HALF_PI + dm.atan2(t, 1 - t);
    let v = 0;
    for (let r = 0; r < nr; r++) { let d = th - ang[r]; d -= dm.TWO_PI * Math.floor(d / dm.TWO_PI + 0.5); const q = d / wid[r]; v = Math.max(v, str[r] * dm.exp(-q * q)); }
    T[k] = v;
  }
  F.rays = T; F.fresh = fresh;
}
export function rayAt(F, dist, tx, ty) {
  const r = dist / F.R;
  if (r >= RAY_REACH) return 0;
  const ax = Math.abs(tx), ay = Math.abs(ty), s = ax + ay;
  const p = s > 0 ? (ty >= 0 ? (tx >= 0 ? ty / s : 2 - ty / s) : (tx < 0 ? 2 + ay / s : 4 - ay / s)) : 0;
  const q = p * (NA / 4), k = Math.min(NA - 1, Math.floor(q)), f = q - k, ray = Math.max(0, cubic(F.rays, k, f));
  // (the blanket to ~1.6 radii, the rays beyond, both thinning out)
  const blanket = 1 - dm.smoothstep(1.1, 1.8, r), out = r > 1 ? ray * (1 - dm.smoothstep(1.5, RAY_REACH, r)) : 0;
  return F.fresh * Math.max(r < 1 ? 0.7 : blanket, out);
}

// how fully a crater replaces the ground at dist m from its centre (0..1): all of it inside its
// cavity (what stood there is thrown out; the floor level at the ground's mean), less up its
// walls; beyond its rim its ejecta blanket buries part of what was there (older small craters
// and rough ground round a young crater muted), its own thickness built on top
export function excavation(F, dist) { return 1 - dm.smoothstep(0.6, 0.95, dist / F.R); }
// the change a crater makes to ground h at dist m from its centre, beyond its own shape: inside
// its cavity the ground goes (to base, its floor's level); round its rim its ejecta bury part of
// the ground's own relief (to plane: the ground's slope there, kept: a blanket drapes a hillside)
export function excavate(F, dist, h, base, plane) {
  const r = dist / F.R, wc = 1 - dm.smoothstep(0.6, 0.95, r), wb = 0.35 * (1 - dm.smoothstep(1.0, 2.2, r)) * (1 - wc);
  return wc * (base - h) + wb * (plane - h);
}
// the ground's level and slope over a crater's cavity: from sums over cells there of h, x, y
// (m in its tangent frame) and their products: { mean, gx, gy, mx, my } (plane(x, y) = mean +
// gx (x - mx) + gy (y - my))
export function groundPlane(n, sh, sx, sy, sxx, syy, sxy, sxh, syh) {
  const mx = sx / n, my = sy / n, mean = sh / n;
  const cxx = sxx / n - mx * mx, cyy = syy / n - my * my, cxy = sxy / n - mx * my, cxh = sxh / n - mx * mean, cyh = syh / n - my * mean;
  const det = cxx * cyy - cxy * cxy;
  // (points too few, or strung out near a line, fit no plane: its slope across would be wild)
  if (n < 5 || !(det > 0.01 * (cxx + cyy) * (cxx + cyy))) return { mean, gx: 0, gy: 0, mx, my };
  let gx = (cxh * cyy - cyh * cxy) / det, gy = (cyh * cxx - cxh * cxy) / det;
  // (and no steeper than the ground ever stands, ~35 degrees)
  const g = Math.sqrt(gx * gx + gy * gy);
  if (g > 0.7) { gx *= 0.7 / g; gy *= 0.7 / g; }
  return { mean, gx, gy, mx, my };
}

// (a table round the circle read between entries k and k + 1 by a Catmull-Rom cubic: no creases)
function cubic(T, k, f) {
  const n = T.length, a = T[(k + n - 1) % n], b = T[k], c = T[(k + 1) % n], d = T[(k + 2) % n];
  return b + 0.5 * f * (c - a + f * (2 * a - 5 * b + 4 * c - d + f * (3 * (b - c) + d - a)));
}

// (a smooth minimum: the rim's crest rounded over k)
function smin(a, b, k) {
  const m = a < b ? a : b;
  if (k <= 0) return m;
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return m - h * h * k * 0.25;
}

// ---- the finer craters, drawn where the ground is sampled (terrain.js): the octaves below the
// finest level that stamps its own (the refinement's, or before it the world sim's), each one
// only where the sampling resolves it (so they come into view as the ground nears, with no tile
// edges among them), from the same lattice as the tiles'; each lattice cell's craters (their
// forms, wear and frames) made once and kept
export class CraterField {
  // S: the snapshot's sampler, K its crater scales, seed the world's, R its radius
  // baseAt(at): the ground (m) at a crater's centre without the field's craters (its floor's level)
  constructor(S, K, seed, R, baseAt) { this.S = S; this.K = K; this.seed = seed; this.R = R; this.baseAt = baseAt; this.cache = new Map(); this.Dmax = 0; this.bands = []; this.hits = []; this.ords = []; this.depth = 0; }
  // the octaves below Dmax (m), down to 16 m (or the smallest the air lets through)
  setTop(Dmax) {
    if (Dmax === this.Dmax) return;
    this.Dmax = Dmax; this.bands = [];
    for (let D0 = Dmax / 2; D0 >= Math.max(16, this.K.Dair || 0); D0 /= 2) this.bands.push({ D0, D1: 2 * D0, nL: Math.max(1, Math.floor(2 * QPI * this.R / (LAT * D0))) });
  }
  _cell(b, B, f, i, j) {
    const key = ((b * 6 + f) * B.nL + j) * B.nL + i;
    let list = this.cache.get(key);
    if (list) return list;
    if (this.cache.size > 40000) this.cache.clear();
    list = latticeCraters(f, i, j, B.D0, B.D1, B.nL, this.S, this.seed, this.R, this.K.Dair || 0).map((cr) => {
      const F = craterForm(cr.D, this.K, cr.key), Dref = 1000 * this.K.scale, kap = 12 * cr.age * (Dref / cr.D) * (Dref / cr.D), wear = 1 / (1 + kap);
      F.ks = (0.08 + 0.5 * (1 - wear)) * (F.depth + F.rim);
      // (rays only where the air is too thin to stop what's thrown: under ~0.05 bar)
      if (cr.age < RAY_AGE && (this.K.Dair || 0) < 1.5 * this.K.scale) craterRays(F, cr.key, 1 - cr.age / RAY_AGE);
      const at = cr.at, ref = Math.abs(at[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
      let ex = ref[1] * at[2] - ref[2] * at[1], ey = ref[2] * at[0] - ref[0] * at[2], ez = ref[0] * at[1] - ref[1] * at[0];
      const el = Math.sqrt(ex * ex + ey * ey + ez * ez); ex /= el; ey /= el; ez /= el;
      const e = [ex, ey, ez], n = [at[1] * ez - at[2] * ey, at[2] * ex - at[0] * ez, at[0] * ey - at[1] * ex];
      const sec = cr.D >= SEC_MIN * 1000 * this.K.scale ? secondaries(cr, e, n, this.K, this.R, Dref) : null;
      return { at, F, wear, band: b, age: cr.age, key: cr.key, base: NaN, sec, reach: (sec ? SEC_REACH : F.rays ? RAY_REACH : REACH) * (cr.D / 2) * F.reach, e, n };
    });
    this.cache.set(key, list);
    return list;
  }
  // the ground (m) at unit direction (x, y, z), sampled minW m apart, struck by the field's
  // craters there (those of its first nb octaves): h0 the ground before them; each, oldest
  // first, excavates (its floor level at the ground at its centre as the bigger craters left
  // it) and builds its rim and ejecta on what's there
  heightAt(x, y, z, minW, h0, nb = this.bands.length) {
    const dp = this.depth, hit = this.hits[dp] || (this.hits[dp] = []);
    hit.length = 0;
    if (!dp) this.ray = 0;   // (and how bright young craters' ejecta make it: ray, 0..1)
    let secDh = 0;           // (the secondaries' dents: shallow, on what's there)
    for (let f = 0; f < 6; f++) {
      const Fc = FACES[f], dn = x * Fc.N[0] + y * Fc.N[1] + z * Fc.N[2];
      if (dn < 0.5) continue;
      const u = dm.atan((x * Fc.U[0] + y * Fc.U[1] + z * Fc.U[2]) / dn) / QPI, v = dm.atan((x * Fc.V[0] + y * Fc.V[1] + z * Fc.V[2]) / dn) / QPI;
      for (let b = 0; b < nb; b++) {
        const B = this.bands[b], amp = dm.smoothstep(4 * minW, 8 * minW, B.D0);
        if (amp <= 0) break;     // (finer octaves are finer still)
        const sL = 2 / B.nL, i0 = Math.floor((u + 1) / sL), j0 = Math.floor((v + 1) / sL);
        for (const c of this._near(b, B, f, i0, j0)) {
          const ax = x - c.at[0], ay = y - c.at[1], az = z - c.at[2], dist = Math.sqrt(ax * ax + ay * ay + az * az) * this.R;
          if (dist >= c.reach) continue;
          if (c.sec) for (const sc of c.sec) {
            const bx = x - sc.at[0], by = y - sc.at[1], bz = z - sc.at[2], sd = Math.sqrt(bx * bx + by * by + bz * bz) * this.R;
            if (sd < REACH * sc.F.R) secDh += dm.smoothstep(4 * minW, 8 * minW, 2 * sc.F.R) * sc.wear * craterDh(sc.F, sd, x * c.e[0] + y * c.e[1] + z * c.e[2] - sc.tx, x * c.n[0] + y * c.n[1] + z * c.n[2] - sc.ty);
          }
          if (c.F.rays) { const rb = amp * rayAt(c.F, dist, x * c.e[0] + y * c.e[1] + z * c.e[2], x * c.n[0] + y * c.n[1] + z * c.n[2]); if (rb > this.ray) this.ray = rb; }
          if (dist >= REACH * c.F.R * c.F.reach) continue;
          hit.push(c, dist, amp);
        }
      }
    }
    if (!hit.length) return h0 + secDh;
    // (oldest first)
    const m = hit.length / 3, ord = this.ords[dp] || (this.ords[dp] = []);
    ord.length = m;
    for (let k = 0; k < m; k++) ord[k] = k;
    if (m > 1) ord.sort((p, q) => hit[q * 3].age - hit[p * 3].age || hit[q * 3].key - hit[p * 3].key);
    let h = h0;
    for (let k = 0; k < m; k++) {
      const c = hit[ord[k] * 3], dist = hit[ord[k] * 3 + 1], amp = hit[ord[k] * 3 + 2];
      if (c.base !== c.base) {
        // (its floor's level: the ground at its centre with the coarser octaves' craters on it;
        // and the ground's slope there, half a radius each way: what its ejecta drape)
        this.depth++;
        const at = c.at, q = 0.5 * c.F.R / this.R, g = (ox, oy) => {
          const px = at[0] + ox * c.e[0] + oy * c.n[0], py = at[1] + ox * c.e[1] + oy * c.n[1], pz = at[2] + ox * c.e[2] + oy * c.n[2], l = Math.sqrt(px * px + py * py + pz * pz), d = [px / l, py / l, pz / l];
          return this.heightAt(d[0], d[1], d[2], 0, this.baseAt(d), c.band);
        };
        c.base = g(0, 0); c.gx = (g(q, 0) - c.base) / (0.5 * c.F.R); c.gy = (g(0, q) - c.base) / (0.5 * c.F.R);
        this.depth--;
      }
      const tx = x * c.e[0] + y * c.e[1] + z * c.e[2], ty = x * c.n[0] + y * c.n[1] + z * c.n[2];
      h += amp * (c.wear * craterDh(c.F, dist, tx, ty) + excavate(c.F, dist, h, c.base, c.base + (c.gx * tx + c.gy * ty) * this.R));
    }
    return h + secDh;
  }
  // the craters of lattice cell (i0, j0)'s neighbourhood (3 x 3) in octave b on face f (each
  // octave keeps the last few asked for, by depth: neighbouring samples ask for the same)
  _near(b, B, f, i0, j0) {
    const key = (f * (B.nL + 2) + j0 + 1) * (B.nL + 2) + i0 + 1, last = B.last || (B.last = []), slot = this.depth & 3;
    if (last[slot] && last[slot].key === key) return last[slot].list;
    const list = [];
    for (let j = j0 - 1; j <= j0 + 1; j++) {
      if (j < 0 || j >= B.nL) continue;
      for (let i = i0 - 1; i <= i0 + 1; i++) {
        if (i < 0 || i >= B.nL) continue;
        for (const c of this._cell(b, B, f, i, j)) list.push(c);
      }
    }
    last[slot] = { key, list };
    return list;
  }
}

// ---- an icy shell's double ridges (barren.js crackShell): great-circle arcs { pole, u, v,
// start, len, H }, each level drawing them as wide as they are (RIDGE.w, real m), or as its
// cells hold (two of them): from the world sim's grid down, each level adds its own width's
// ridge less the level above's, so they sharpen to their real shape as the ground nears
export const RIDGE = { H: 200, w: 1500 };
export const ridgeWidth = (wTrue, cellM) => Math.max(wTrue, 2 * cellM);
// an arc's ridge at direction (x, y, z) (unit), w m wide on a world of radius R: two crests
// either side of a groove, tapering off its ends
export function ridgeAt(A, x, y, z, R, w) {
  const across = (x * A.pole[0] + y * A.pole[1] + z * A.pole[2]) * R, ax = Math.abs(across);
  if (ax > 1.2 * w) return 0;
  let th = dm.atan2(x * A.v[0] + y * A.v[1] + z * A.v[2], x * A.u[0] + y * A.u[1] + z * A.u[2]) - A.start;
  th -= dm.TWO_PI * Math.floor(th / dm.TWO_PI);
  if (th > A.len) return 0;
  const e = Math.min(1, Math.min(th, A.len - th) / (0.05 * A.len)), q = (ax - 0.3 * w) / (0.2 * w);
  return A.H * e * e * (3 - 2 * e) * dm.exp(-q * q);
}
// the ridges this level adds onto B (a tile's grid G): its width's less the level above's
export function stampRidges(B, G, arcs, R, w, wUp) {
  if (!arcs || !arcs.length || w >= wUp) return;
  const n = G.N * G.N, dir = G.dir, cc = (G.N >> 1) * (G.N + 1);
  const half = 0.75 * G.N * G.spacing;    // (the tile's reach from its middle, roomily)
  for (const A of arcs) {
    const m = Math.abs(dir[cc * 3] * A.pole[0] + dir[cc * 3 + 1] * A.pole[1] + dir[cc * 3 + 2] * A.pole[2]) * R;
    if (m > half + 1.2 * wUp) continue;
    for (let c = 0; c < n; c++) {
      const x = dir[c * 3], y = dir[c * 3 + 1], z = dir[c * 3 + 2];
      if (Math.abs(x * A.pole[0] + y * A.pole[1] + z * A.pole[2]) * R > 1.2 * wUp) continue;
      B[c] += ridgeAt(A, x, y, z, R, w) - ridgeAt(A, x, y, z, R, wUp);
    }
  }
}

function poisson(rng, lam) {
  if (lam > 30) return Math.max(0, Math.round(lam + Math.sqrt(lam) * dm.sqrt(-2 * dm.log(1 - rng.next())) * dm.cos(2 * dm.PI * rng.next())));
  const L = dm.exp(-lam);
  let k = 0, p = 1;
  do { k++; p *= rng.next(); } while (p > L);
  return k - 1;
}
