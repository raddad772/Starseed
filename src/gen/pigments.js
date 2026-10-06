// Photosynthetic pigments, and the foliage colour they make.
//
// Life tunes its light-harvesting pigments to where its star puts the most
// photons at the ground (Kiang et al. 2007): under the Sun that's red-orange
// (~640 nm), under a red dwarf the near infrared, under an F star yellow-green.
// Each living world draws its own pigments around that peak: a main
// absorption band, often a second in the blue (like chlorophyll's Soret
// band), sometimes a broad dark one; past the last band a "red edge" where
// leaves turn bright in the infrared. Foliage is whatever the pigments leave:
// its reflectance, integrated against the eye's colour matching functions
// (the CIE 1931 observer, Wyman et al. 2013's fit) under a neutral daylight,
// gives a linear RGB albedo (the renderer lights it with the star's colour).
//
// So two worlds round the same kind of star can have quite different plants,
// and red-dwarf worlds tend to dark, near-black ones.

import * as dm from '../core/dmath.js';

const H = 6.62607015e-34, C = 2.99792458e8, KB = 1.380649e-23;
const LAM0 = 380, LAM1 = 780, STEP = 5; // nm

function lobe(l, mu, s1, s2) { const t = (l - mu) / (l < mu ? s1 : s2); return dm.exp(-0.5 * t * t); }
function cie(l) {
  return [
    1.056 * lobe(l, 599.8, 37.9, 31.0) + 0.362 * lobe(l, 442.0, 16.0, 26.7) - 0.065 * lobe(l, 501.1, 20.4, 26.2),
    0.821 * lobe(l, 568.8, 46.9, 40.5) + 0.286 * lobe(l, 530.9, 16.3, 31.1),
    1.217 * lobe(l, 437.0, 11.8, 36.0) + 0.681 * lobe(l, 459.0, 26.0, 13.8),
  ];
}
// blackbody spectral radiance (relative), wavelength in nm
function planck(lnm, T) { const l = lnm * 1e-9; return 1 / (l * l * l * l * l * (dm.exp(H * C / (l * KB * T)) - 1)); }

// where the star's photon flux peaks (nm): ~3670 um K / T
export function photonPeakNm(teff) { return 3.67e6 / teff; }

// the photon peak of the light that reaches the ground (WORLDSIM.md 19): the star's
// photons through the air: Rayleigh scattering (Earth's ~0.1 at 550 nm per bar, ~l^-4,
// by the gas mix and the column, more on weak gravity), ozone (from oxygen: the UV, a
// broad band round 600 nm), methane's red and near-infrared bands (725, 890 nm), water
// vapour's (940 nm). Life tunes its pigments to this, not to the star's raw light.
// air: bar by gas (evolve.js); rel: the mix's Rayleigh vs nitrogen's
// aer: the render's aerosols (bodies.js atmosphereRender: mie, mieAbs per metre at the
// ground in r, g, b, and their scale height mieH), so the light the plants grew under is the
// light the game draws: dust reddens it, organic haze takes the blue
// the photons reaching the ground at wavelength l (nm), relative: the star's (a Planck curve, photon
// counts) through the air's vertical column, slant 1.5 (Rayleigh by its column and gases' scattering,
// ozone's UV cut-off and Chappuis band, methane's and water's near-infrared bands, the aerosols');
// surfaceLight(teff, air, P, g, rel, aer) returns the function (null air: the bare star's)
export function surfaceLight(teff, air, P, g, rel = 1, aer = null) {
  const a = 14388 / teff;
  const star = (l) => { const um = l / 1000; return 1 / (um * um * um * um * (dm.exp(a / um) - 1)); };
  if (!air || !(P > 0.001)) return star;
  const col = P * 9.81 / Math.max(g, 0.5);
  const o3 = (air.O2 || 0) / 0.21, ch4 = (air.CH4 || 0) / Math.max(P, 1e-9) * col, h2o = (air.H2O || 0) / Math.max(P, 1e-9) * col;
  // (the aerosols' vertical optical depth for the ground's light at 680, 550 and 440 nm:
  // what they absorb, and the share of what they scatter that goes back up (most of it goes
  // on down, forward: hazes scatter forward); as a power law between, never rising to the
  // red, so the render's reddish dust colours don't become extinction in the near infrared)
  let aG = 0, aAlpha = 0;
  if (aer && aer.mie && aer.mieH) {
    const t = [0, 1, 2].map((i) => ((aer.mieAbs ? aer.mieAbs[i] : 0) + 0.3 * aer.mie[i]) * aer.mieH);
    aG = t[1];
    if (t[0] > 0 && t[2] > 0) aAlpha = dm.clamp(dm.log(t[2] / t[0]) / dm.log(680 / 440), 0, 4);
  }
  return (l) => {
    let tau = 0.0975 * col * rel * dm.pow(550 / l, 4);
    tau += o3 * (l < 320 ? 3 : 0.03 * dm.exp(-0.5 * ((l - 600) / 60) * ((l - 600) / 60)));
    tau += ch4 * (40 * dm.exp(-0.5 * ((l - 725) / 12) * ((l - 725) / 12)) + 120 * dm.exp(-0.5 * ((l - 890) / 15) * ((l - 890) / 15)));
    tau += h2o * 30 * dm.exp(-0.5 * ((l - 940) / 25) * ((l - 940) / 25));
    if (aG > 0) tau += aG * dm.pow(550 / l, aAlpha);
    return star(l) * dm.exp(-1.5 * Math.min(tau, 50));
  };
}

export function surfacePhotonPeakNm(teff, air, P, g, rel = 1, aer = null) {
  if (!air || !(P > 0.001)) return photonPeakNm(teff);
  const light = surfaceLight(teff, air, P, g, rel, aer);
  let best = photonPeakNm(teff), bestN = -1;
  for (let l = 350; l <= 1100; l += 10) {
    const v = light(l);
    if (v > bestN) { bestN = v; best = l; }
  }
  return best;
}

// a world's pigments, drawn around the photon peak of its light (the star's, or what
// reaches the ground: surfacePhotonPeakNm)
export function drawPigments(rng, teff, peakNm = null) {
  const peak = peakNm ?? photonPeakNm(teff);
  const bands = [];
  // the main band: near the peak where that's light plants can use (up to ~1050 nm)
  const c1 = dm.clamp(peak * rng.range(0.78, 1.12), 420, 1050);
  bands.push({ center: c1, width: rng.range(35, 110), depth: rng.range(0.8, 0.97) });
  // a second, blue band (Soret-like), usually
  if (rng.chance(0.7)) bands.push({ center: rng.range(400, 490), width: rng.range(18, 45), depth: rng.range(0.7, 0.95) });
  // under dim, red stars: a broad band soaking up what visible light there is
  if (teff < 4200 && rng.chance(0.85)) bands.push({ center: rng.range(500, 680), width: rng.range(110, 200), depth: rng.range(0.75, 0.95) });
  else if (rng.chance(0.25)) bands.push({ center: rng.range(480, 700), width: rng.range(20, 60), depth: rng.range(0.4, 0.85) });
  // the red edge: just past the longest band's long side
  let edge = 0;
  for (const b of bands) edge = Math.max(edge, b.center + b.width * 0.9);
  return { peakNm: peak, bands, edgeNm: Math.min(edge + rng.range(10, 40), 1100), base: rng.range(0.07, 0.16) };
}

// reflectance at a wavelength (nm)
export function reflectance(pig, l) {
  let a = 0;
  for (const b of pig.bands) { const t = (l - b.center) / b.width; a = 1 - (1 - a) * (1 - b.depth * dm.exp(-0.5 * t * t)); }
  // the bright infrared plateau (where it reaches into the visible, leaves stay leaf-dark: ~0.2 at most)
  const nir = (l > 700 ? 0.5 : 0.2) * dm.smoothstep(pig.edgeNm - 15, pig.edgeNm + 35, l);
  return Math.min(0.9, pig.base * (1 - a) + nir);
}

// linear RGB albedo of a reflectance under neutral daylight (~6504 K)
export function albedoRGB(pig) {
  let X = 0, Y = 0, Z = 0, Yw = 0;
  for (let l = LAM0; l <= LAM1; l += STEP) {
    const E = planck(l, 6504), [x, y, z] = cie(l), r = reflectance(pig, l);
    X += E * x * r; Y += E * y * r; Z += E * z * r; Yw += E * y;
  }
  X /= Yw; Y /= Yw; Z /= Yw;
  const rgb = [3.2406 * X - 1.5372 * Y - 0.4986 * Z, -0.9689 * X + 1.8758 * Y + 0.0415 * Z, 0.0557 * X - 0.2040 * Y + 1.0570 * Z];
  // (leaves hold other pigments and scatter inside: a quarter less saturated)
  return rgb.map((v) => Math.max(0.004, v * 0.75 + Y * 0.25));
}

// a few words for the catalog: what the pigments take
export function describePigments(pig) {
  const b = pig.bands.slice().sort((p, q) => p.center - q.center);
  return b.map((x) => `${Math.round(x.center - x.width)}-${Math.round(x.center + x.width)} nm`).join(', ');
}
