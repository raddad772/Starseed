// Whether a world's open liquid is frozen now, here: render/liquid.js's liquidIce and the terrain
// shader's ragged sea-ice edge, the same sums, so the ice drawn is the ice you stand on (and a lake
// frozen the year round, which the shading draws as snow, too); the sea's ice as its floes.
import { triDetail } from './detail.js';
import { S_H } from './terrain.js';

export const SEA_SALT = { water: -1.8 };   // (the sea's freezing point under the fresh's, C)

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const _col = [0, 0, 0], _mat = new Float64Array(8), _p = [0, 0, 0], _a = [0, 0, 0, 0], _b = [0, 0, 0, 0];

// gen: the world's terrain; s: its sample at d (unit, planet-fixed) where it holds liquid; sinSun:
// the sun's latitude now (sin, the planet's frame)
export function frozenNow(gen, s, d, sinSun) {
  gen.shade(s, 0.05, _col, _mat, d);
  if (!(_mat[4] > 0)) return true;   // (frozen the year round: the shading's own ice)
  const kind = _mat[0], Tm = _mat[1] * 120 - 60, river = kind > 0.55 && kind < 0.85, flow = river ? _mat[2] : 0;
  const follow = kind < 0.2 ? 0.25 : kind < 0.55 ? 0.6 : kind < 0.85 ? 0.45 : 0.8;
  const Ts = Tm + 70 * sinSun * d[1] * follow;
  const Tf = (kind < 0.2 ? SEA_SALT[gen.p.liquid] || 0 : 0) - 3 * flow;
  const ice = 1 - smooth(Tf - 4, Tf + 4, Ts);
  if (ice > 0 && kind < 0.2) {
    const r = gen.R + Math.max(0, s[S_H]);
    _p[0] = d[0] * r; _p[1] = d[1] * r; _p[2] = d[2] * r;
    return seaFloe(_p, d, ice);
  }
  return ice > 0.5;
}

// ---- the sea's floes, as liquid.js seaFloes draws them (its integer hash and cells, so the floe you see
// is the floe you stand on; edges to a float's rounding)
const floeHash = (x, y, z, sd) => {
  let h = (Math.imul(x, 0x8da6b343) ^ Math.imul(y, 0xd8163841) ^ Math.imul(z, 0xcb1ab31f) ^ Math.imul(sd, 0x165667b1)) >>> 0;
  h = (h ^ (h >>> 15)) >>> 0; h = Math.imul(h, 0x2c1b3c6d) >>> 0;
  h = (h ^ (h >>> 12)) >>> 0; h = Math.imul(h, 0x297a2d39) >>> 0;
  return (h ^ (h >>> 15)) >>> 0;
};
const _A = { id: 0, e: 0, gc: [0, 0, 0] }, _B = { id: 0, e: 0, gc: [0, 0, 0] }, _C = { id: 0, e: 0, gc: [0, 0, 0] };
const _F = { c: 0, there: false, broken: false, g: 0, cc: 0 }, _O = { c: 0, there: false, broken: false, g: 0, cc: 0 };
const wrap = (i, m) => ((i % m) + m) % m;
// how close the pack is (liquid.js seaIceCover) at p (d its way), its temperature's ice
const seaIceCover = (ice, p, d) => { triDetail(p, d, 512, _a); triDetail(p, d, 64, _b); return smooth(0.35, 0.75, ice + (_a[3] - 0.5) * 0.9 + (_b[0] - 0.5) * 0.35) * smooth(0, 0.15, ice); };
// the partition of cells S m across (N to the 4096 m period) at p, merged in groups (liquid.js floeCell):
// into o the group's hash (id), how far p is in from its edge (e, m) and its middle (gc)
const _fp = [0, 0, 0];
// lattice cell (cx, cy, cz)'s feature point into o (liquid.js floePoint: the middle half of the cell)
function floePoint(cx, cy, cz, S, N, sd, o) {
  const h = floeHash(wrap(cx, N), wrap(cy, N), wrap(cz, N), sd);
  o[0] = (cx + 0.25 + 0.5 * (h & 1023) / 1024) * S; o[1] = (cy + 0.25 + 0.5 * ((h >>> 10) & 1023) / 1024) * S; o[2] = (cz + 0.25 + 0.5 * ((h >>> 20) & 1023) / 1024) * S;
  return o;
}
const _gq = [0, 0, 0];
// the floe a lattice cell's in (liquid.js floeGroup): its index moved on by 0 or 1 along each axis, halved
function floeGroup(cx, cy, cz, N, sd, o) {
  const h = floeHash(wrap(cx, N), wrap(cy, N), wrap(cz, N), sd ^ 0x5bd1);
  o[0] = Math.floor((cx + (h & 1)) / 2); o[1] = Math.floor((cy + ((h >>> 1) & 1)) / 2); o[2] = Math.floor((cz + ((h >>> 2) & 1)) / 2);
  return o;
}
const _q = [0, 0, 0], _qa = [0, 0, 0];
// q (from p) with up stretched three times (liquid.js floeCell)
const stretch = (q, up) => { const k = 2 * (q[0] * up[0] + q[1] * up[1] + q[2] * up[2]); q[0] += k * up[0]; q[1] += k * up[1]; q[2] += k * up[2]; return q; };
function floeCell(p, up, S, N, sd, o) {
  const gx = Math.floor(p[0] / S), gy = Math.floor(p[1] / S), gz = Math.floor(p[2] / S);
  let d1 = Infinity, ax0 = gx, ay0 = gy, az0 = gz;
  for (let k = 0; k < 27; k++) {
    const cx = gx + (k % 3) - 1, cy = gy + (Math.floor(k / 3) % 3) - 1, cz = gz + Math.floor(k / 9) - 1;
    floePoint(cx, cy, cz, S, N, sd, _fp);
    _q[0] = _fp[0] - p[0]; _q[1] = _fp[1] - p[1]; _q[2] = _fp[2] - p[2]; stretch(_q, up);
    const d = _q[0] * _q[0] + _q[1] * _q[1] + _q[2] * _q[2];
    if (d < d1) { d1 = d; ax0 = cx; ay0 = cy; az0 = cz; }
  }
  floePoint(ax0, ay0, az0, S, N, sd, _fp);
  _qa[0] = _fp[0] - p[0]; _qa[1] = _fp[1] - p[1]; _qa[2] = _fp[2] - p[2]; stretch(_qa, up);
  const aa = _qa[0] * _qa[0] + _qa[1] * _qa[1] + _qa[2] * _qa[2];
  floeGroup(ax0, ay0, az0, N, sd, _gq);
  const qx = _gq[0], qy = _gq[1], qz = _gq[2], S2 = 2 * S;
  o.id = floeHash(wrap(qx, N / 2), wrap(qy, N / 2), wrap(qz, N / 2), sd ^ 0x9e37);
  o.gc[0] = (qx + 0.5) * S2; o.gc[1] = (qy + 0.5) * S2; o.gc[2] = (qz + 0.5) * S2;
  let e = Infinity;
  for (let k = 0; k < 27; k++) {
    if (k === 13) continue;
    const cx = ax0 + (k % 3) - 1, cy = ay0 + (Math.floor(k / 3) % 3) - 1, cz = az0 + Math.floor(k / 9) - 1;
    floeGroup(cx, cy, cz, N, sd, _gq);
    if (_gq[0] === qx && _gq[1] === qy && _gq[2] === qz) continue;
    floePoint(cx, cy, cz, S, N, sd, _fp);
    _q[0] = _fp[0] - p[0]; _q[1] = _fp[1] - p[1]; _q[2] = _fp[2] - p[2]; stretch(_q, up);
    const bb = _q[0] * _q[0] + _q[1] * _q[1] + _q[2] * _q[2];
    e = Math.min(e, 0.5 * (bb - aa) / Math.sqrt((_qa[0] - _q[0]) ** 2 + (_qa[1] - _q[1]) ** 2 + (_qa[2] - _q[2]) ** 2));
  }
  o.e = e;
  return o;
}
// a floe group's state (liquid.js floeState): its cover, whether it's there, broken, its leads' half width
function floeState(id, gc, d, ice, S, o) {
  const c = seaIceCover(ice, gc, d), pres = Math.min(1, 1.5 * c), cc = c / Math.max(pres, 1e-3);
  o.c = c; o.cc = cc; o.there = c > 0 && (id & 65535) / 65536 <= pres; o.broken = (id >>> 16) / 65536 < 1 - smooth(0.4, 0.9, c);
  o.g = Math.max(S / 400, 0.5 * S * (1 - Math.sqrt(cc)));
  return o;
}
// whether the sea's ice bears you at p (body-fixed m; d its way), its temperature's ice (0..1): a floe
// of the pack, or a piece of a broken one (liquid.js seaFloes); a closed pack's leads frozen over
export function seaFloe(p, d, ice) {
  const F = floeState(floeCell(p, d, 256, 16, 0x51ce, _A).id, _A.gc, d, ice, 256, _F);
  seaFloe.lastC = F.c; seaFloe.why = 3;   // (for tests: its cover, and what bears you: 1 a floe, 2 a piece, 3 the closed pack)
  if (F.c >= 0.98) return true;
  seaFloe.why = 1;
  if (F.there && !F.broken && _A.e > F.g) return true;
  seaFloe.why = 2;
  if (!F.there || F.broken || _A.e < F.g + 16) {
    floeCell(p, d, 16, 256, 0x7a11, _B);
    const O = floeState(floeCell(_B.gc, d, 256, 16, 0x51ce, _C).id, _C.gc, d, ice, 256, _O);
    if (O.there && O.broken) return _B.e > Math.max(0.15, 8 * (1 - Math.sqrt(O.cc))) + 3 * (1 - smooth(0, 40, _C.e));
  }
  seaFloe.why = 0;
  return false;
}
