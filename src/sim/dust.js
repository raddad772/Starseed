// Dust and spray in the air where you are (world state: the world, the place and the time alone, the same
// for everyone): what the wind lifts off the ground and the sea upwind, by the same physics as the world's
// mean (gen/worldsim/aerosols.js: the sand's threshold, saltation and dust devils off loose dry ground,
// whitecaps' spray), so a windy day's sunset pinker anywhere, not only by a desert (Dave), and the world's
// mean the average of the places'.
//   its sources  each place upwind: its ground's share that's loose and dry (sourceAt: a desert's all, a
//                green country's fields, tracks and banks; dry as its year or its month (Gaussen), none
//                frozen), lifting dustEmission(the wind there then); a sea's whitecaps as U^3.41 (Gong 2003)
//   its way here the air upwind (sim/wind.js), its sources at a few hundred to a few thousand km as they
//                were the day or days before (carried at ~10 m/s), thinned as it settles out (~1,500 km)
// Out: { tau, salt: their optical depths at 550 nm here (the world's mean dust and spray in their ratio
// to the world's mean lifting), src: the place's own ground as a source (0..1) }. The sky's dust and spray
// by them in place of the world's mean (render/atmosphere.js setDust).
import * as THREE from 'three';
import { windAt } from './wind.js';
import { S_LEN, S_H, S_TEMP, S_WDEPTH } from '../gen/terrain.js';
import { dustEmission } from '../gen/worldsim/aerosols.js';

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
  // (frozen ground lifts none where its soil holds water (ice binds it, snow covers it); a dry world's cold
  // ground, Mars', lifts as any)
  if (Tm < 0 && gen.p.liquid === 'water') return 0;
  const soil = 0.2 + 0.8 * Math.max(0, 1 - 1.3 * cov), dry = Math.max(1 - sm(150, 600, P), 0.25 + 0.75 * monthDry);
  return soil * dry;
}

// the world's mean source share (sourceAt over the globe, the sea none), once a body: the mean the
// places' lifting is measured against
const _md = { x: 0, y: 0, z: 0 };
function meanSource(b, L) {
  if (b._dustSrcMean != null) return b._dustSrcMean;
  let s = 0;
  const n = 256;
  for (let i = 0; i < n; i++) {
    // (a Fibonacci sphere)
    const y = 1 - 2 * (i + 0.5) / n, r = Math.sqrt(1 - y * y), ph = i * 2.399963229728653;
    _md.x = r * Math.cos(ph); _md.y = y; _md.z = r * Math.sin(ph);
    s += Math.max(0, sourceAt(b.terrain, _md, L));
  }
  return (b._dustSrcMean = s / n);
}

// b: the body (runtime); dirF: the place (body-fixed unit); t: world time (s); sunE: its sunlight (Earth's
// 1); day: its solar day (s)
export function dustAt(b, dirF, t, sunE, day, out = { tau: 0, salt: 0, src: 0 }) {
  out.tau = 0; out.salt = 0; out.src = 0;
  const gen = b.terrain, d = b.data, R = d.atmosphere && d.atmosphere.render, E = R && R.aerEmit;
  if (!gen || !gen.snap || !(d.atmosphere && d.atmosphere.pressure > 0) || !E) return out;
  const Rt = d.radiusM > 0 ? d.radiusM : b.R, L = b.solarLongitude ? b.solarLongitude() : 0;
  windAt(b, dirF, t, sunE, day, _w);
  if (!(_w.dir.lengthSq() > 0)) return out;
  // (upwind: dirF turned against the wind's way here)
  _ax.copy(dirF).cross(_w.dir);
  if (_ax.lengthSq() < 1e-12) return out;
  _ax.normalize();
  let dust = 0, salt = 0;
  for (let k = 0; k < DIST.length; k++) {
    _p.copy(dirF).applyAxisAngle(_ax, -DIST[k] / Rt);
    const src = sourceAt(gen, _p, L);
    if (k === 0) out.src = Math.max(0, src);
    if (src === 0) continue;
    const U = windAt(b, _p, t - DIST[k] / CARRY, sunE, day, _w2).speed;
    if (src < 0) { salt += W[k] * Math.pow(U, 3.41); continue; }
    if (E.dust) dust += W[k] * src * dustEmission(E.dust, U);
  }
  // (the weights sum to 1: against the world's mean source and lifting, the world's mean optical depth)
  const srcMean = meanSource(b, L);
  if (E.dust && E.dustTau > 0) out.tau = srcMean > 0 ? Math.min(3, E.dustTau * dust / (srcMean * E.dust.Fmean)) : E.dustTau;
  if (E.saltTau > 0 && E.u341 > 0 && E.seaFrac > 0) out.salt = Math.min(1, E.saltTau * salt / (E.seaFrac * E.u341));
  return out;
}
