// Physical constants and the game's scale model.
//
// The universe is generated in real SI units, then presented as a geometrically
// similar copy: every length is multiplied by LEN_SCALE while every surface
// gravity stays the same. Consequences (all exact):
//   GM_game   = GM_real * LEN_SCALE^2      (g = GM/R^2 preserved)
//   times     * sqrt(LEN_SCALE)            (orbital periods, day lengths)
//   speeds    * sqrt(LEN_SCALE)            (orbital / escape velocities)
//   mass ratios, eccentricities, angular sizes, sky appearance: unchanged.
// The atmosphere keeps its real metres (squeezed only far up: bodies.js), so skies
// look right. Terrain relief is drawn at HEIGHT_SCALE of its real height, and the
// ground below the world sim's grid at true scale (a drawn metre a real one).
// The deep time (worldsim) always runs at SIM_LEN, its world laid on the drawn globe.

export const G = 6.6743e-11;
export const AU = 1.495978707e11;
export const C_LIGHT = 299792458;
export const K_B = 1.380649e-23;
export const AMU = 1.66053906660e-27;
export const R_GAS = 8.314462618;
export const SIGMA_SB = 5.670374419e-8;

export const M_SUN = 1.98847e30;
export const R_SUN = 6.957e8;
export const L_SUN = 3.828e26;
export const T_SUN = 5772;

export const M_EARTH = 5.9722e24;
export const R_EARTH = 6.371e6;
export const G_EARTH = 9.80665;
export const M_JUP = 1.89813e27;
export const R_JUP = 7.1492e7;

export const HOUR = 3600;
export const DAY = 86400;
export const YEAR = 3.15576e7;

// The worlds are drawn at 1/64 of their real size: an Earth the size of England (~100 km
// round), its deep time's continents and ranges on it, the ground below at true scale.
// (?len=k on the page, or STARSEED_LEN=k in Node, draws them at k instead, to compare: 0.1 the
// old size, two thirds of Australia)
const lenQ = typeof location !== 'undefined' ? /[?&]len=([\d.]+)/.exec(location.search) : null;
const lenE = typeof process !== 'undefined' && process.env ? +process.env.STARSEED_LEN : 0;
export const LEN_SCALE = lenQ ? +lenQ[1] : lenE > 0 ? lenE : 1 / 64;
// the size the deep time (worldsim: plates, climate, life) is simulated at, whatever the worlds
// are drawn at: its world the same, laid out on the drawn globe
export const SIM_LEN = 0.1;
// drawn heights: the real ones (the deep time's) times this. A range drawn at LEN_SCALE of its
// width can't stand its real height at real slopes; at sqrt it's a few times steeper than real,
// still big mountains (the same rule as the upper air's squeeze)
export const HEIGHT_SCALE = Math.sqrt(LEN_SCALE);
export const TIME_SCALE = Math.sqrt(LEN_SCALE); // sqrt is correctly rounded: deterministic
export const GM_SCALE = LEN_SCALE * LEN_SCALE;
export const SPEED_SCALE = Math.sqrt(LEN_SCALE);

// One "game AU": the distance at which a star of 1 L_sun gives 1 S_earth of light.
export const GAME_AU = AU * LEN_SCALE;

export function fmtDist(m) {
  const a = Math.abs(m);
  if (a < 1000) return m.toFixed(a < 10 ? 1 : 0) + ' m';
  if (a < 1e6) return (m / 1000).toFixed(a < 1e4 ? 2 : 1) + ' km';
  if (a < 1e9) return (m / 1000).toFixed(0) + ' km';
  if (a < GAME_AU * 0.01) return (m / 1e9).toFixed(2) + ' Gm';
  return (m / GAME_AU).toFixed(3) + ' gAU';
}
export function fmtSpeed(v) {
  const a = Math.abs(v);
  if (a < 1000) return v.toFixed(a < 10 ? 1 : 0) + ' m/s';
  if (a < C_LIGHT * 0.05) return (v / 1000).toFixed(2) + ' km/s';
  return (v / C_LIGHT).toFixed(2) + ' c';
}
export function fmtTime(s) {
  if (!isFinite(s)) return '∞';
  const neg = s < 0; s = Math.abs(s);
  let out;
  if (s < 60) out = s.toFixed(1) + 's';
  else if (s < 3600) out = Math.floor(s / 60) + 'm ' + Math.floor(s % 60) + 's';
  else if (s < 86400) out = Math.floor(s / 3600) + 'h ' + Math.floor((s % 3600) / 60) + 'm';
  else out = Math.floor(s / 86400) + 'd ' + Math.floor((s % 86400) / 3600) + 'h';
  return (neg ? '-' : '') + out;
}
