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

// Kroupa IMF over 0.08-3 M_sun: the share of stars below 0.5 M_sun
const IMF_LOW_SHARE = (() => {
  const w1 = (Math.pow(0.08, -0.3) - Math.pow(0.5, -0.3)) / 0.3;
  const w2 = 0.5 * (Math.pow(0.5, -1.3) - Math.pow(3, -1.3)) / 1.3;
  return Math.round(w1 / (w1 + w2) * 1e6) / 1e6; // (rounded: the same in every engine)
})();

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

// Main-sequence luminosity (L_sun) for a mass (M_sun), piecewise power laws
// that hold from the smallest red dwarfs to A stars (continuous at 0.43 and 2)
function lumMS(m) {
  if (m < 0.43) return 0.23 * dm.pow(m, 2.3);
  if (m < 2) return dm.pow(m, 4);
  return 1.4 * dm.pow(m, 3.5);
}

// fix (optional): a given star's mass (M_sun), age (Gyr), metallicity ([Fe/H]) and names, in
// place of the draws (the Sun, for the SOL system)
export function generateStar(rng, fix = null) {
  // Mass from the stellar initial mass function (Kroupa 2001: dN/dM ~ M^-1.3
  // below 0.5 M_sun, M^-2.3 above), 0.08-3 M_sun: about three stars in four
  // are red dwarfs, one in eight an orange K dwarf, a few Sun-like G, F and
  // the odd A star. Their habitable zones move with them.
  const mass = fix ? fix.mass : rng.next() < IMF_LOW_SHARE ? rng.powerLaw(0.08, 0.5, -1.3) : rng.powerLaw(0.5, 3, -2.3);
  const tauMS = 10 * dm.pow(mass, -2.5); // Gyr on the main sequence
  // ages across the galaxy's history (short-lived stars younger): now and then a
  // young system, its planets still hot and fiery (rarer than this in life, but
  // worth seeing), and up to the oldest stars, whose worlds are mostly dead
  const maxAge = Math.min(12.5, 0.9 * tauMS);
  const age = fix ? fix.age : rng.next() < 0.08 ? Math.min(maxAge, rng.logUniform(0.02, 0.4)) : rng.range(Math.min(0.4, maxAge * 0.5), maxAge);
  // older stars formed from less-enriched gas (fewer heavy elements: fewer planets, fewer giants)
  const metallicity = fix ? fix.metallicity : dm.clamp(rng.normal(0.12 - 0.035 * age, 0.17), -0.8, 0.45); // [Fe/H]
  const frac = age / tauMS;

  const lZams = 0.75 * lumMS(mass);
  const luminosity = lZams * (1 + 0.73 * frac); // brightening on the main sequence
  const rZams = mass < 1 ? dm.pow(mass, 0.85) : dm.pow(mass, 0.57);
  const radius = rZams * (0.89 + 0.24 * frac); // R_sun
  const teff = U.T_SUN * dm.pow(luminosity / (radius * radius), 0.25);
  // magnetic activity (flares, X-ray/UV): saturated while young; red dwarfs stay
  // active for Gyr (West et al. 2008), the Sun for ~0.1 Gyr. xuv: the lifetime
  // dose relative to the Sun's, per unit of bolometric light (strips air from
  // close-in planets: the cosmic shoreline in bodies.js)
  const activeGyr = mass < 0.6 ? dm.clamp(1 + 7 * (0.6 - mass) / 0.5, 1, 8) : dm.clamp(0.1 * dm.pow(mass, -2), 0.05, 1);
  const xuv = dm.clamp(dm.pow(mass, -1.5), 1, 30);
  const color = blackbodyRGB(teff);
  const name = fix ? fix.name : makeName(rng.fork('name'), 2, 3);
  const catalog = fix ? fix.catalog : catalogName(rng.fork('catalog'));

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
  // what the birth cloud was made of (its planets share it): the galaxy enriches over
  // time, and not evenly. Early on, massive stars' supernovae made mostly oxygen,
  // magnesium and silicon; carbon came later from smaller stars' winds, iron later
  // still from white-dwarf supernovae. So metal-poor (mostly old) stars are rich in
  // O, Mg, Si for their iron ([alpha/Fe] up to ~+0.3: rocky planets with smaller iron
  // cores) and poor in carbon (C/O ~0.3), metal-rich ones carbon-rich (C/O ~0.8; past
  // ~0.8 the planets turn to carbides and graphite). The long-lived heat sources
  // (thorium, uranium, from rare neutron-star mergers) vary from cloud to cloud
  // (Unterborn et al. 2015: Th ~0.6-2.5x solar)
  const alphaFe = dm.clamp(0.3 * dm.smoothstep(0, -0.6, metallicity) + rng.normal(0, 0.04), -0.05, 0.4);
  const CO = dm.clamp(0.55 * dm.pow(10, 0.4 * metallicity) * rng.lognormal(1, 0.12), 0.2, 1.4);
  const radio = dm.clamp(rng.lognormal(1, 0.35), 0.5, 2.5);

  return {
    kind: 'star',
    name, catalog,
    mass, metallicity, age, tauMS, luminosity, radius, teff, activeGyr, xuv, alphaFe, CO, radio,
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
