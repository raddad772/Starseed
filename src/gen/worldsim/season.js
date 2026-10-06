// The seasons on the land, its non-living part: each place's year as the world's climate has it
// (climate.js: monthly temperature and rain and snow on the coarse climate grid), for its snow through
// the year. Part of a world's snapshot (world state: every client alike, a cached world as a fresh one):
// per climate cell the year's first harmonic of temperature about its mean (a1 cos L + b1 sin L, L the
// solar longitude from the northern spring equinox, the climate's months' own) and the cold half's
// precipitation (the mean of its six coldest months, mm/month), from the sim's last climate pass, on the
// finished surface. The ground's year-round snow is where a year's thaw can't melt a winter's fall
// (terrain.js, snowYear); the seasons' snow over the rest is the shader's (render/terrainMaterial.js
// seasonSnow), from the same numbers baked into a map by latitude and longitude (the cloud map's layout):
//   R: a1 / 100 + 0.5, G: b1 / 100 + 0.5 (K; the swing's two parts, so the texture blends them),
//   B: sqrt(P / 600) (mm/month), A: the year's mean at sea level, (C + 60) / 120 (the sea's ice by place:
//   every piece of the pack reads it at its own middle, liquid.js and gen/liquidice.js iceAt).

import { SimGrid, GridLite } from './grid.js';
import { climateOn } from './climate.js';
import * as dm from '../../core/dmath.js';

export const SEASON_W = 256, SEASON_H = 128;
// the snow's melt per degree-day above freezing (mm of water: Hock 2003, snow's 3-5); and what a cold
// dry place's snow loses the year round to the air (sublimation, mm of water a year: tens of mm in the
// cold deserts, more in their wind)
export const DDF_SNOW = 4, SUBLIM_YR = 50;

// a climate's year by cell (clim: climate.js's Tm, Pm, MONTHS x m): a1 (m), b1 (m), P cold (m), planar
export function seasonHarmonics(clim, m) {
  const out = new Float32Array(3 * m), idx = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  for (let c = 0; c < m; c++) {
    let sa = 0, sb = 0;
    for (let k = 0; k < 12; k++) { const t = clim.Tm[k * m + c], L = dm.TWO_PI * (k + 0.5) / 12; sa += t * dm.cos(L); sb += t * dm.sin(L); }
    out[c] = sa / 6; out[m + c] = sb / 6;
    idx.sort((x, y) => clim.Tm[x * m + c] - clim.Tm[y * m + c] || x - y);
    let ps = 0;
    for (let k = 0; k < 6; k++) ps += clim.Pm[idx[k] * m + c];
    out[2 * m + c] = ps / 6;
  }
  return out;
}

// the cloud cover where a year's rain is P (mm) and its sea's cold-current upwelling up (0..1): more where
// it rains (rising air), clear over deserts and the sinking subtropics, stratocumulus decks over cold-
// current seas (snapshot.js's cloud map)
export const cloudOf = (P, up) => Math.min(0.95, Math.max(0.05, 0.1 + 0.8 * Math.sqrt(Math.max(0, P) / 2500) + 0.35 * up));
// the clouds' year by cell: each month's cover as if its rain fell all year (the tropical rain belt
// follows the sun north and south, the monsoons come and go, the storm tracks shift with the winters),
// its first harmonic about the year's mean, a1c (m), b1c (m) in cover (planar)
export function cloudHarmonics(clim, m) {
  const out = new Float32Array(2 * m);
  for (let c = 0; c < m; c++) {
    const up = clim.upwell ? clim.upwell[c] : 0;
    let sa = 0, sb = 0;
    for (let k = 0; k < 12; k++) { const v = cloudOf(12 * clim.Pm[k * m + c], up), L = dm.TWO_PI * (k + 0.5) / 12; sa += v * dm.cos(L); sb += v * dm.sin(L); }
    out[c] = sa / 6; out[m + c] = sb / 6;
  }
  return out;
}
// the clouds' year baked at the cloud map's layout (w x w/2, snapshot.js cloudMapPixels: by latitude and
// longitude), two bytes a pixel, a1c + 0.5, b1c + 0.5: smoothed across the climate grid's cells as the
// cover is (the year's swing is broad: no warp)
export function cloudYearPixels(Nc, R, f, w) {
  const Gc = new GridLite(Nc, R), m = Gc.n, nb = new Int32Array(8);
  const F = [0, 1].map((k) => {
    let a = Float32Array.from(f.subarray(k * m, (k + 1) * m)), b = new Float32Array(m);
    for (let it = 0; it < 2; it++) {
      for (let c = 0; c < m; c++) { const n = Gc.nbrs(c, nb); let sum = a[c] * 2; for (let e = 0; e < n; e++) sum += a[nb[e]]; b[c] = sum / (n + 2); }
      const t = a; a = b; b = t;
    }
    return a;
  });
  const hh = w / 2, px = new Uint8Array(w * hh * 2), d = [0, 0, 0], uv = { face: 0, u: 0, v: 0 };
  for (let y = 0; y < hh; y++) {
    const lat = ((y + 0.5) / hh - 0.5) * dm.PI, cl = dm.cos(lat), sl = dm.sin(lat);
    for (let x = 0; x < w; x++) {
      const lon = ((x + 0.5) / w - 0.5) * dm.TWO_PI;
      d[0] = cl * dm.cos(lon); d[1] = sl; d[2] = cl * dm.sin(lon);
      for (let k = 0; k < 2; k++) px[2 * (y * w + x) + k] = Math.max(0, Math.min(255, Math.round((Gc.sample(F[k], d, uv) + 0.5) * 255)));
    }
  }
  return px;
}

// the maps the shader reads, by latitude and longitude, from a planar field of three per climate cell
// (snap.Nc, snap.R) and a fourth (or 255): code(k, value) each into its byte
function pixelsOf(Nc, R, f, code, f4) {
  const Gc = new SimGrid(Nc, R), m = Gc.n;
  const F = [f.subarray(0, m), f.subarray(m, 2 * m), f.subarray(2 * m, 3 * m), f4];
  const W = SEASON_W, H = SEASON_H, px = new Uint8Array(W * H * 4), d = [0, 0, 0], uv = { face: 0, u: 0, v: 0 };
  const b8 = (x) => Math.max(0, Math.min(255, Math.round(x * 255)));
  for (let j = 0; j < H; j++) {
    const lat = ((j + 0.5) / H - 0.5) * dm.PI, cl = dm.cos(lat), sl = dm.sin(lat);
    for (let i = 0; i < W; i++) {
      const lon = ((i + 0.5) / W - 0.5) * dm.TWO_PI;
      d[0] = cl * dm.cos(lon); d[1] = sl; d[2] = cl * dm.sin(lon);
      const o = 4 * (j * W + i);
      for (let k = 0; k < 3; k++) px[o + k] = b8(code(k, Gc.sample(F[k], d, uv)));
      px[o + 3] = f4 ? b8(code(3, Gc.sample(f4, d, uv))) : 255;
    }
  }
  return px;
}
export function seasonPixels(snap) {
  return pixelsOf(snap.Nc, snap.R, snap.season, (k, v) => (k < 2 ? v / 100 + 0.5 : k === 2 ? Math.sqrt(Math.max(0, v) / 600) : (v - 273.15 + 60) / 120), snap.Tsea);
}
// the maps' layout's revision: a snapshot whose maps are older is worked out again (worldSims.js)
export const SEASON_V = 5;
// (the air over a frozen sea's: a1, b1 and its year's mean against the open sea's, K / 100 + 0.5)
export function seasonIcePixels(snap) {
  return pixelsOf(snap.Nc, snap.R, snap.seasonIce, (k, v) => v / 100 + 0.5);
}

// the air's year over a sea that freezes in winter: its ice cuts the sea's heat off (its winters as
// cold as land's), so the climate run again with every sea cell whose coldest month falls below the
// sea's freezing point as frozen ground; per climate cell a1, b1 (its swing: that run's) and the year's
// mean against the open sea's (K: 0, planar). The mean stays the sea's: as ground those cells took
// ground's darker albedo too (no ice on them) and came out ~27 K warmer a year at 75 N, a pack thawing at
// winter's end. What the leads freeze over by and the floes grow by (render/liquid.js leadIce, gen/
// liquidice.js packIce)
function seasonIce(Gc, G, snap, climOpts, wet, cover, clim) {
  const m = Gc.n, n = wet.length, Tf = 273.15 - 1.8, froze = new Uint8Array(m);
  let any = 0;
  for (let c = 0; c < m; c++) {
    if (!clim.sea || !clim.sea[c]) continue;
    let lo = Infinity;
    for (let k = 0; k < 12; k++) lo = Math.min(lo, clim.Tm[k * m + c]);
    if (lo < Tf) { froze[c] = 1; any = 1; }
  }
  const out = new Float32Array(3 * m);
  if (!any) { out.set(seasonHarmonics(clim, m).subarray(0, 2 * m)); return out; }
  const wet2 = new Uint8Array(n), d = [0, 0, 0];
  for (let c = 0; c < n; c++) { if (!wet[c]) continue; G.centre(c, d); wet2[c] = froze[Gc.cellAt(d[0], d[1], d[2])] ? 0 : 1; }
  const clim2 = climateOn(Gc, G, snap.h, climOpts, wet2, cover);
  const h1 = seasonHarmonics(clim, m), h2 = seasonHarmonics(clim2, m);
  for (let c = 0; c < m; c++) {
    const f = froze[c];
    out[c] = f ? h2[c] : h1[c]; out[m + c] = f ? h2[m + c] : h1[m + c];
  }
  return out;
}

// a world's seasons from its snapshot: its climate run again on its finished surface (its heights, seas
// and lakes, plants' cover, as the sim's last pass had them), and once more for its frozen seas' air,
// ~1.4 s. snap: a world's
// snapshot (snapshot.js); climOpts: its climate's inputs (climate.js climateOpts)
export function seasonsFor(snap, climOpts) {
  if (!snap.Nc || !snap.h) return null;
  const Gc = new SimGrid(snap.Nc, snap.R), G = new GridLite(snap.N, snap.R), n = snap.h.length;
  // (open water for the climate: the sea and the lakes, as the sim's last pass reckoned it)
  const wet = new Uint8Array(n);
  for (let c = 0; c < n; c++) wet[c] = (snap.ocean && snap.ocean[c]) || (snap.water && snap.water[c] - snap.h[c] >= 1) ? 1 : 0;
  const cover = snap.cover ? { cover: snap.cover, forest: snap.forest } : null;
  const clim = climateOn(Gc, G, snap.h, climOpts, wet, cover);
  const season = seasonHarmonics(clim, Gc.n), ice = seasonIce(Gc, G, snap, climOpts, wet, cover, clim);
  const S = { season, seasonIce: ice, Tsea: snap.Tsea, Nc: snap.Nc, R: snap.R };
  // (and the clouds' year, at the cloud map's own size)
  const cloudYearPx = snap.cloudW ? cloudYearPixels(snap.Nc, snap.R, cloudHarmonics(clim, Gc.n), snap.cloudW) : null;
  return { season, seasonPx: seasonPixels(S), seasonIce: ice, seasonIcePx: seasonIcePixels(S), cloudYearPx, yearDays: climOpts.yearDays, seasonV: SEASON_V };
}

// whether a world's snow comes and goes with its seasons (p: its terrain's params): water that falls as
// snow (its seas', or a frozen ocean's with ice to give), carried in air thick enough to bring it anywhere
// (thinner than ~0.03 bar it freezes out only in the cold traps, Mars' caps: terrain.js's old rule)
export function snowsBySeason(p) {
  const water = p.liquid === 'water' || (p.frozenOcean && p.climate && p.climate.wet === 0 && p.iceCover > 0.55 && !p.icy) || p.iceCover > 0;
  return !!water && (p.airP ?? 1) > 0.0316;
}

// how a year's snow fares at a place whose year's mean is Ta (C), its swing a1, b1 (K) and its cold half's
// precipitation P (mm a month), in a year of yearDays days: a winter's fall (mm of water: it snows while
// T = Ta + A cos x < 0, at the cold half's rate) over what the year takes off it (its thaw by degree days,
// DDF_SNOW, and the air's SUBLIM_YR): above 1 the snow outlasts the summer, the year round
export function snowYear(Ta, a1, b1, P, yearDays) {
  const A = Math.sqrt(a1 * a1 + b1 * b1);
  if (Ta >= A) return 0;
  const th = Ta <= -A ? 0 : dm.acos(-Ta / A);
  const fall = 12 * Math.max(P, 0) * (1 - th / dm.PI);
  const thaw = DDF_SNOW * yearDays / dm.TWO_PI * (2 * Ta * th + 2 * A * dm.sin(th)) + SUBLIM_YR;
  return fall / thaw;
}
