// The light life sees by (LIFE.md: "Seeing"): a world's light at the ground in BANDS (the star through
// its air: pigments.js surfaceLight), and under a few metres of its water for sea life; the window its
// animals' eyes evolved to (where the light is bright enough to be worth seeing by), and receptors'
// peaks spread across it. Internal logic for the evolution of their colours and patterns; the player
// sees with human eyes. World state (dmath).
import * as dm from '../../core/dmath.js';
import { surfaceLight } from '../pigments.js';

// eight bands, 330-930 nm, 75 nm each: from a bee's ultraviolet to past a red dwarf's light's peak
export const BAND_LO = 330, BAND_W = 75, NBANDS = 8;
export const BAND_NM = Array.from({ length: NBANDS }, (_, i) => BAND_LO + (i + 0.5) * BAND_W);

// pure water's absorption (1/m) by wavelength (Pope and Fry 1997; Kou et al. 1993 past 700 nm)
const WATER = [[330, 0.04], [380, 0.011], [440, 0.0064], [500, 0.0257], [550, 0.0565], [600, 0.244], [650, 0.35], [700, 0.65], [750, 2.6], [800, 2.0], [850, 4.3], [900, 6.8], [950, 39]];
export function waterAbsorption(l) {
  if (l <= WATER[0][0]) return WATER[0][1];
  for (let i = 1; i < WATER.length; i++) if (l <= WATER[i][0]) { const [l0, a0] = WATER[i - 1], [l1, a1] = WATER[i]; return a0 + (a1 - a0) * (l - l0) / (l1 - l0); }
  return WATER[WATER.length - 1][1];
}

// the light in each band (photons, the brightest band 1): at the ground, or under depth m of water
export function lightBands(teff, air, P, g, rel = 1, aer = null, depth = 0) {
  const light = surfaceLight(teff, air, P, g, rel, aer), out = new Float64Array(NBANDS);
  for (let i = 0; i < NBANDS; i++) {
    let sum = 0;
    for (let l = BAND_LO + i * BAND_W + 2.5; l < BAND_LO + (i + 1) * BAND_W; l += 5) sum += light(l) * (depth > 0 ? dm.exp(-waterAbsorption(l) * depth) : 1);
    out[i] = sum;
  }
  let mx = 0;
  for (let i = 0; i < NBANDS; i++) mx = Math.max(mx, out[i]);
  for (let i = 0; i < NBANDS; i++) out[i] = mx > 0 ? out[i] / mx : 0;
  return out;
}

// the window eyes evolve to: from the first band to the last with at least a quarter of the brightest's
// light (band edges, nm); and k receptors' peaks spread evenly across it (nm)
export function visualWindow(bands) {
  let lo = -1, hi = -1;
  for (let i = 0; i < NBANDS; i++) if (bands[i] >= 0.25) { if (lo < 0) lo = i; hi = i; }
  if (lo < 0) return null;
  return { lo: BAND_LO + lo * BAND_W, hi: BAND_LO + (hi + 1) * BAND_W };
}
export function receptorPeaks(win, k) {
  if (!win) return [];
  return Array.from({ length: k }, (_, i) => Math.round(win.lo + (win.hi - win.lo) * (i + 0.5) / k));
}
