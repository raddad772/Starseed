// Whether a world's open liquid is frozen now, here: render/liquid.js's liquidIce and the terrain
// shader's ragged sea-ice edge, the same sums, so the ice drawn is the ice you stand on (and a lake
// frozen the year round, which the shading draws as snow, too).
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
  let ice = 1 - smooth(Tf - 4, Tf + 4, Ts);
  if (ice > 0 && kind < 0.2) {
    const r = gen.R + Math.max(0, s[S_H]);
    _p[0] = d[0] * r; _p[1] = d[1] * r; _p[2] = d[2] * r;
    triDetail(_p, d, 512, _a); triDetail(_p, d, 64, _b);
    const n = ice + (_a[3] - 0.5) * 0.9 + (_b[0] - 0.5) * 0.35;
    triDetail(_p, d, 8, _a);
    frozenNow.lastN = n + (_a[3] - 0.5) * 0.12;   // (for tests: the noise's sum, 0.5 the edge)
    ice = smooth(0.49, 0.51, frozenNow.lastN) * smooth(0, 0.15, ice);
  }
  return ice > 0.5;
}
