// The wind where you stand (world state: the world, the place and the time alone, the same for everyone):
//   its belt     the latitude's prevailing wind as the sea's waves have it (liquid.js): the trades
//                blowing west, the westerlies east, the polar easterlies west; light in the doldrums,
//                strongest in the westerlies; its mean speed from the sunlight driving it and the air's
//                density (a thick air moves slower for the same power), none without air
//   the weather  systems passing over a few days, each a few hundred km across (as drawn: the world's
//                scale), blowing harder or falling calm, veering as they go
//   the day      the ground's heat stirring the air by day, a still night (the air settles over the cold
//                ground)
//   gusts        the turbulence's, over tens of seconds
// Out: { speed (m/s, at ~10 m), dir (body-fixed unit, along the ground: the way it blows), gust (0..1) }.
// The trees lean and sway by it (floraRender.js), the grass bends (grassRender.js), dust rises off dry
// ground in a strong one (world.js: the haze).
import * as THREE from 'three';
import { hash3f } from '../core/rng.js';
import { beltWind } from '../gen/worldsim/aerosols.js';

const smooth = (t) => t * t * (3 - 2 * t);
// smooth noise in two numbers (a place's lattice and time), 0..1
function noise2(x, y, seed) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = smooth(x - ix), fy = smooth(y - iy);
  const h = (a, b) => hash3f(ix + a, iy + b, 0, seed);
  return (h(0, 0) * (1 - fx) + h(1, 0) * fx) * (1 - fy) + (h(0, 1) * (1 - fx) + h(1, 1) * fx) * fy;
}

// the belt's mean wind (m/s) of a world's data: the power its air carries off the sunlit ground into its
// winds, against its density (gen/worldsim/aerosols.js beltWind: a thin air carries little, a Mars's ~13
// m/s, not the 20 of its density alone; Titan's ~1 under its haze), none without air
export function windBase(d, sunE = 1) {
  const a = d.atmosphere, P = a ? a.pressure || 0 : 0;
  if (!(P > 0)) return 0;
  return beltWind(P, a.mu || 29, d.Tsurf || 288, a.tau || 0, Math.max(sunE, 1e-3) * (a.render && a.render.sunSurf != null ? a.render.sunSurf : 1));
}

const _e = new THREE.Vector3(), _n = new THREE.Vector3(), _s = new THREE.Vector3();
// b: the body (runtime); dirF: the place (body-fixed unit); t: world time (s); sunE: its sunlight
// (Earth's 1); day: its solar day (s; 0 none)
export function windAt(b, dirF, t, sunE, day, out = { speed: 0, dir: new THREE.Vector3(1, 0, 0), gust: 0 }) {
  const U0 = windBase(b.data, sunE);
  out.speed = 0; out.gust = 0;
  if (!(U0 > 0)) return out;
  const lat = Math.asin(Math.max(-1, Math.min(1, dirF.y))), al = Math.abs(lat);
  // (its belt: its strength, and its way, east or west, turning over a few degrees between belts)
  const st = (a, b, x) => smooth(Math.max(0, Math.min(1, (x - a) / (b - a))));
  const belt = 0.45 + 0.45 * st(0.05, 0.15, al) + 0.35 * st(0.48, 0.58, al) - 0.45 * st(1.0, 1.1, al);
  const toward = -1 + 2 * st(0.49, 0.55, al) - 2 * st(1.02, 1.08, al);
  _e.set(0, 1, 0).cross(dirF);
  if (_e.lengthSq() < 1e-8) _e.set(1, 0, 0);
  _e.normalize();
  _n.copy(dirF).cross(_e).normalize();
  // (the weather: a system's strength and its veer, on a lattice of ~3 of the world's days and a
  // fiftieth of its radius (~300 km on an Earth as drawn))
  const ts = b.data.terrain && b.data.terrain.seed, P = day > 0 ? day : 86400, seed = ((ts && ts.length ? ts[0] : ts) || 7) >>> 0;
  const L = b.R * 0.02, px = (dirF.x * b.R) / L + 0.37 * (dirF.z * b.R) / L, py = (dirF.y * b.R) / L - 0.21 * (dirF.z * b.R) / L;
  const tw = t / (3 * P);
  const nW = noise2(px + tw * 0.7, py + tw * 1.3, seed ^ 0x77a1d);
  const weather = 0.18 + 2.4 * nW * nW;
  const veer = (noise2(px * 0.6 + tw, py * 0.6 - tw * 0.5, seed ^ 0x5e3e2) - 0.5) * 2.2;
  // (the day: the sun's height here)
  _s.copy(b.pos).negate().normalize().applyQuaternion(b.qInv);
  const mu = _s.dot(dirF), dayK = 0.6 + 0.55 * st(-0.1, 0.45, mu);
  // (gusts: the turbulence's, over ~15 s, the stronger in a stronger wind)
  const g = noise2(t / 15, 3.7, seed ^ 0x9e37) * 0.6 + noise2(t / 4.3, 9.1, seed ^ 0x2c1b) * 0.4;
  out.gust = g;
  out.speed = U0 * belt * weather * dayK * (0.75 + 0.5 * g);
  const sgn = toward >= 0 ? 1 : -1, c = Math.cos(veer), sn = Math.sin(veer);
  out.dir.copy(_e).multiplyScalar(sgn * c).addScaledVector(_n, sgn * sn).normalize();
  return out;
}
