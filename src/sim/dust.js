// Dust and spray in the air (world state: the world, the place and the time alone, the same for everyone):
// what the wind lifts off the ground and the sea and carries downwind. A windy day's sunset pinker anywhere,
// not only by a desert (Dave).
//   its sources  land's bare soil: a desert's all of it, a green country's its fields, tracks, banks and
//                worn places (a fifth or so of it); as dry as its year (deserts and dry steppes) or its
//                month (Gaussen's dry months: a dry spell's soil blows, a wet month's hardly), none frozen;
//                the wind lifting its loose grains past a threshold (~5 m/s at 10 m: Gillette 1980), the
//                flux as the wind's excess squared and more (Marticorena and Bergametti 1995); a dry
//                land's air holding some in any wind (the Sahara's mean ~0.3-0.5, its outbreaks 1-3:
//                Prospero et al. 2002). And the sea's spray: salt, as the wind whips up whitecaps (past
//                ~3 m/s, growing as its 1.5th power or so: O'Dowd and de Leeuw 2007), white haze
//   its way here the air upwind of the place (sim/wind.js: the belt's way, veered by the weather): its
//                sources at a few hundred to a few thousand km, as they were the day or days before
//                (carried at ~10 m/s), thinned as it settles out over ~1,500 km (a Saharan outbreak's
//                dust crosses the Atlantic in a week)
// Out: { tau: the dust's optical depth straight up at 550 nm (a calm desert's ~0.2, a strong wind's ~1, a
// storm's ~3; a green country's windy day ~0.1-0.2), salt: the spray's, src: the place's own ground as a
// source (0..1, a desert's 1) }. The sky's haze by them (render/atmosphere.js setDust): the sun dimmer and
// redder low down, the sunset's glow warmer, the far ground lost.
import * as THREE from 'three';
import { windAt } from './wind.js';
import { S_LEN, S_H, S_TEMP, S_WDEPTH } from '../gen/terrain.js';

const DIST = [0, 300e3, 800e3, 1600e3, 3000e3];   // (upwind, m along the true-size world)
const W = [0.3, 0.27, 0.2, 0.14, 0.09];           // (each's share: settling out on the way)
const CARRY = 10;                                 // (m/s: the dust's speed downwind)
const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const _w = { speed: 0, dir: new THREE.Vector3(1, 0, 0), gust: 0 }, _w2 = { speed: 0, dir: new THREE.Vector3(1, 0, 0), gust: 0 };
const _p = new THREE.Vector3(), _ax = new THREE.Vector3(), _s = new Float64Array(S_LEN), _yr = [0, 0, 0], _d = [0, 0, 0];

// a place's ground as a source now (0..1: a desert's in the same wind; -1 the sea); L where the sun stands in
// its year
function sourceAt(gen, d, L) {
  const S = gen.snap;
  gen.sample(d.x, d.y, d.z, 2, _s);
  if (gen.p.liquid && _s[S_H] < 0) return gen.p.liquid === 'water' ? -1 : 0;
  if (_s[S_WDEPTH] > 0.05) return 0;
  _d[0] = d.x; _d[1] = d.y; _d[2] = d.z;
  const Ta = _s[S_TEMP] - 273.15, cov = S.cover ? S.cover(d.x, d.y, d.z) : 0.5;
  const P = S.s && S.s.P && S.Gc ? S.Gc.sample(S.s.P, _d) : 800;
  // (the month: its warmth, and whether its rain is under twice its warmth (Gaussen); frozen ground or
  // snow lifts none)
  let Tm = Ta, monthDry = 0.5;
  if (S.season && S.season(d.x, d.y, d.z, _yr)) {
    const A = Math.hypot(_yr[0], _yr[1]), ph = L - Math.atan2(_yr[1], _yr[0]);
    Tm = Ta + A * Math.cos(ph);
    const Pw = Math.max(0, (P - 6 * _yr[2]) / 6), Pm = _yr[2] + (Pw - _yr[2]) * (0.5 + 0.5 * Math.cos(ph));
    monthDry = Tm > 0 ? sm(1.2, 0.5, Pm / Math.max(2 * Tm, 1)) : 0;
  }
  if (Tm < 0) return 0;
  const soil = 0.2 + 0.8 * Math.max(0, 1 - 1.3 * cov), dry = Math.max(1 - sm(150, 600, P), 0.25 + 0.75 * monthDry);
  return soil * dry;
}

// b: the body (runtime); dirF: the place (body-fixed unit); t: world time (s); sunE: its sunlight (Earth's
// 1); day: its solar day (s)
export function dustAt(b, dirF, t, sunE, day, out = { tau: 0, salt: 0, src: 0 }) {
  out.tau = 0; out.salt = 0; out.src = 0;
  const gen = b.terrain, d = b.data;
  if (!gen || !gen.snap || !(d.atmosphere && d.atmosphere.pressure > 0)) return out;
  const Rt = d.radiusM > 0 ? d.radiusM : b.R, L = b.solarLongitude ? b.solarLongitude() : 0;
  windAt(b, dirF, t, sunE, day, _w);
  if (!(_w.dir.lengthSq() > 0)) return out;
  // (upwind: dirF turned against the wind's way here)
  _ax.copy(dirF).cross(_w.dir);
  if (_ax.lengthSq() < 1e-12) return out;
  _ax.normalize();
  let tau = 0, salt = 0;
  for (let k = 0; k < DIST.length; k++) {
    _p.copy(dirF).applyAxisAngle(_ax, -DIST[k] / Rt);
    const src = sourceAt(gen, _p, L);
    if (k === 0) out.src = Math.max(0, src);
    if (src === 0) continue;
    const U = windAt(b, _p, t - DIST[k] / CARRY, sunE, day, _w2).speed;
    if (src < 0) { salt += W[k] * 0.06 * Math.pow(Math.max(0, (U - 3) / 5), 1.5); continue; }
    const e = Math.max(0, (U - 5) / 5);
    tau += W[k] * src * (0.8 * e * e + 0.25);
  }
  out.tau = Math.min(3, tau); out.salt = Math.min(1, salt);
  return out;
}
