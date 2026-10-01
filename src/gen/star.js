// Host star: main-sequence relations, age evolution, spectral class, colour and
// the circumstellar habitable zone (Kopparapu et al. 2013).

import * as dm from '../core/dmath.js';
import * as U from '../core/units.js';
import { blackbodyRGB } from './color.js';
import { makeName, catalogName } from './names.js';

// Kopparapu et al. (2013, erratum-corrected) S_eff polynomial coefficients.
const HZ_COEF = {
  recentVenus: [1.7753, 1.4316e-4, 2.9875e-9, -7.5702e-12, -1.1635e-15],
  runaway: [1.0512, 1.3242e-4, 1.5418e-8, -7.9895e-12, -1.8328e-15],
  maxGreenhouse: [0.3438, 5.8942e-5, 1.6558e-9, -3.0045e-12, -5.2983e-16],
  earlyMars: [0.3179, 5.4513e-5, 1.5313e-9, -2.7786e-12, -4.8997e-16],
};

export function hzSeff(kind, teff) {
  const c = HZ_COEF[kind];
  const t = dm.clamp(teff, 2600, 7200) - 5780;
  return c[0] + c[1] * t + c[2] * t * t + c[3] * t * t * t + c[4] * t * t * t * t;
}

function spectralClass(teff) {
  const classes = [
    ['O', 30000, 50000], ['B', 10000, 30000], ['A', 7500, 10000], ['F', 6000, 7500],
    ['G', 5200, 6000], ['K', 3700, 5200], ['M', 2400, 3700],
  ];
  for (const [c, lo, hi] of classes) {
    if (teff >= lo) {
      const sub = dm.clamp(Math.floor((hi - teff) / (hi - lo) * 10), 0, 9);
      return c + sub + 'V';
    }
  }
  return 'M9V';
}

export function generateStar(rng) {
  // Mass: log-normal centred near solar. The true IMF is dominated by M dwarfs;
  // like exoplanet survey target lists we bias toward long-lived FGK stars,
  // while early-M and late-F hosts still occur.
  const mass = dm.clamp(rng.lognormal(0.93, 0.24), 0.42, 1.45);
  const metallicity = dm.clamp(rng.normal(-0.02, 0.18), -0.55, 0.45); // [Fe/H]
  const tauMS = 10 * dm.pow(mass, -2.5); // Gyr
  const age = rng.range(0.8, Math.min(11, 0.85 * tauMS));
  const frac = age / tauMS;

  const lZams = 0.75 * dm.pow(mass, 4); // M^4 mass-luminosity law (valid ~0.43-2 M_sun)
  const luminosity = lZams * (1 + 0.73 * frac);
  const rZams = mass <= 1 ? dm.pow(mass, 0.8) : dm.pow(mass, 0.57);
  const radius = rZams * (0.89 + 0.24 * frac); // R_sun
  const teff = U.T_SUN * dm.pow(luminosity / (radius * radius), 0.25);

  const color = blackbodyRGB(teff);
  const name = makeName(rng.fork('name'), 2, 3);
  const catalog = catalogName(rng.fork('catalog'));

  const hz = {
    optimisticInner: dm.sqrt(luminosity / hzSeff('recentVenus', teff)),
    inner: dm.sqrt(luminosity / hzSeff('runaway', teff)),
    outer: dm.sqrt(luminosity / hzSeff('maxGreenhouse', teff)),
    optimisticOuter: dm.sqrt(luminosity / hzSeff('earlyMars', teff)),
  };
  // Formation-era water snow line (disk midplane ~170 K), Kennedy & Kenyon-style scaling
  const snowLine = 2.7 * mass * mass;

  const radiusReal = radius * U.R_SUN;
  const massReal = mass * U.M_SUN;
  const R = radiusReal * U.LEN_SCALE;
  const GM = U.G * massReal * U.GM_SCALE;
  // Star rotation: younger and hotter stars spin faster (gyrochronology-flavoured)
  const rotPeriodDays = dm.clamp(25 * dm.sqrt(age / 4.6) * dm.pow(mass, -0.8), 2, 60) * rng.range(0.85, 1.15);

  return {
    kind: 'star',
    name, catalog,
    mass, metallicity, age, tauMS, luminosity, radius, teff,
    spectral: spectralClass(teff),
    color,
    hz, snowLine,
    massKg: massReal, radiusM: radiusReal,
    R, GM,
    gravity: U.G * massReal / (radiusReal * radiusReal),
    // Surface radiance in units where 1 L_sun at 1 (game) AU gives illuminance 1.
    // Radiance is distance-invariant: E(d) = L_s * pi * (R/d)^2.
    surfaceRadiance: luminosity * (U.GAME_AU * U.GAME_AU) / (dm.PI * R * R),
    rotPeriod: rotPeriodDays * U.DAY * U.TIME_SCALE,
  };
}

// Illuminance (relative to 1 S_earth) at game distance d from the star
export function illuminanceAt(star, d) {
  return star.luminosity * (U.GAME_AU / d) * (U.GAME_AU / d);
}
