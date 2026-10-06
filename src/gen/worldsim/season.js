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
//   B: sqrt(P / 600) (mm/month), A: 255.

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

// the maps the shader reads, by latitude and longitude, from a planar field of three per climate cell
// (snap.Nc, snap.R): code(k, value) each into its byte
function pixelsOf(Nc, R, f, code) {
  const Gc = new SimGrid(Nc, R), m = Gc.n;
  const F = [f.subarray(0, m), f.subarray(m, 2 * m), f.subarray(2 * m, 3 * m)];
  const W = SEASON_W, H = SEASON_H, px = new Uint8Array(W * H * 4), d = [0, 0, 0], uv = { face: 0, u: 0, v: 0 };
  const b8 = (x) => Math.max(0, Math.min(255, Math.round(x * 255)));
  for (let j = 0; j < H; j++) {
    const lat = ((j + 0.5) / H - 0.5) * dm.PI, cl = dm.cos(lat), sl = dm.sin(lat);
    for (let i = 0; i < W; i++) {
      const lon = ((i + 0.5) / W - 0.5) * dm.TWO_PI;
      d[0] = cl * dm.cos(lon); d[1] = sl; d[2] = cl * dm.sin(lon);
      const o = 4 * (j * W + i);
      for (let k = 0; k < 3; k++) px[o + k] = b8(code(k, Gc.sample(F[k], d, uv)));
      px[o + 3] = 255;
    }
  }
  return px;
}
export function seasonPixels(snap) {
  return pixelsOf(snap.Nc, snap.R, snap.season, (k, v) => (k < 2 ? v / 100 + 0.5 : Math.sqrt(Math.max(0, v) / 600)));
}
// (the air over a frozen sea's: a1, b1 and its year's mean against the open sea's, K / 100 + 0.5)
export function seasonIcePixels(snap) {
  return pixelsOf(snap.Nc, snap.R, snap.seasonIce, (k, v) => v / 100 + 0.5);
}

// the air's year over a sea that freezes in winter: its ice cuts the sea's heat off (its winters as
// cold as land's), so the climate run again with every sea cell whose coldest month falls below the
// sea's freezing point as frozen ground; per climate cell a1, b1 and the year's mean against the open
// sea's (K), planar (the open year's own where the sea never freezes). What the leads between its floes
// freeze over by (render/liquid.js leadIce, gen/liquidice.js)
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
    if (f) { let s1 = 0, s2 = 0; for (let k = 0; k < 12; k++) { s1 += clim.Tm[k * m + c]; s2 += clim2.Tm[k * m + c]; } out[2 * m + c] = (s2 - s1) / 12; }
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
  const S = { season, seasonIce: ice, Nc: snap.Nc, R: snap.R };
  return { season, seasonPx: seasonPixels(S), seasonIce: ice, seasonIcePx: seasonIcePixels(S), yearDays: climOpts.yearDays };
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
