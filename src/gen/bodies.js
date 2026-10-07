// Physical properties of planets and moons: radius from mass and composition,
// atmosphere retention, greenhouse climate, hydrosphere, life, render
// parameters for the atmosphere shader, gas-giant cloud chemistry, and the
// terrain-style parameters consumed by the terrain generator.
//
// Everything is computed in real SI units first, then the game-scale values
// (R, GM, orbital elements) are derived with the factors in units.js.

import * as dm from '../core/dmath.js';
import * as U from '../core/units.js';
import { hzSeff } from './star.js';
import { drawPigments, albedoRGB, surfacePhotonPeakNm, photonPeakNm } from './pigments.js';
import { biosphereOf } from './life/biosphere.js';
import { SUBSTANCES } from './worldsim/liquids.js';
import { evolveWorld } from './worldsim/evolve.js';
import { aerosolsOf } from './worldsim/aerosols.js';
import { hsv, mixRGB, scaleRGB, hexToLinear, jitterColor, blackbodyRGB } from './color.js';

const LOG10 = (x) => dm.log10(x);

// ---------------------------------------------------------------- radius

// Mass-radius relations: a solid world from its make-up, its uncompressed density (iron, rock
// and ice mixed by volume) squeezed by its own weight (~1.35x at an Earth's mass, a few % at
// the Moon's: Earth 6371 km, Mars ~3300, the Moon ~1700, Europa ~1550; as R ~ M^0.27 among
// super-Earths); envelopes inflate cores (sub-Neptunes 2-3.5 R_earth); giants are ~1 R_jup
// almost independent of mass, inflated when strongly irradiated.
export const ICY_WATER = 0.04;   // (water's share of a world's mass past which its surface is ice: a shell tens of km deep)
export function radiusFromMass(massE, comp, insolation) {
  if (comp.envelope > 0.5) { // gas giant
    const mJ = massE / 317.8;
    let rJ = dm.pow(mJ, -0.04) * (mJ < 0.3 ? 0.75 + 0.833 * mJ : 1.0);
    rJ *= 1 + 0.35 * dm.smoothstep(150, 1500, insolation); // hot-Jupiter inflation
    return rJ * 11.21;
  }
  const iron = comp.iron ?? 0.32, water = comp.water ?? 0, rock = Math.max(0, 1 - iron - water - (comp.envelope || 0));
  const rho = 1 / (iron / 8000 + rock / 3300 + water / 1100) * (1 + 0.35 * dm.pow(Math.max(massE, 0), 0.6));
  const rockR = dm.cbrt(3 * massE * U.M_EARTH / (4 * dm.PI * rho)) / U.R_EARTH;
  if (comp.envelope > 0.001) {
    // H/He envelope: radius grows ~ sqrt of envelope fraction
    const inflate = 1 + 2.2 * dm.sqrt(comp.envelope) * dm.pow(massE / 5, -0.15);
    return rockR * inflate;
  }
  return rockR;
}

// ---------------------------------------------------------------- climate

export function equilibriumTemp(S, albedo) { return 278.6 * dm.pow(S, 0.25) * dm.pow(1 - albedo, 0.25); }

function boilingPoint(pBar) { // water, Clausius-Clapeyron
  if (pBar <= 0.006) return 273;
  return 1 / (1 / 373.15 - dm.log(pBar / 1.01325) / 4890);
}

// Tidal locking timescale (Gladman et al. 1996), seconds
function tidalLockTime(aM, massPrimaryKg, massKg, radiusM, Q, k2) {
  const omega = dm.TWO_PI / (12 * 3600);
  const I = 0.33 * massKg * radiusM * radiusM;
  return omega * dm.pow(aM, 6) * I * Q / (3 * U.G * massPrimaryKg * massPrimaryKg * k2 * dm.pow(radiusM, 5));
}

// Rayleigh cross-section relative to air ((n-1)^2 ratio)
const RAYLEIGH_REL = { N2: 1.02, O2: 0.86, Ar: 0.9, CO2: 2.36, H2: 0.21, He: 0.014, CH4: 2.25, H2O: 0.75, SO2: 4.0, CO: 1.2, NH3: 1.9, H2S: 3.2 };
const MOLAR = { N2: 28.01, O2: 32.0, Ar: 39.95, CO2: 44.01, H2: 2.016, He: 4.003, CH4: 16.04, H2O: 18.02, SO2: 64.07, CO: 28.01, NH3: 17.03, H2S: 34.08 };
const EARTH_RAYLEIGH = [5.802e-6, 13.558e-6, 33.1e-6];
const N0 = 2.547e25; // Earth sea-level number density (m^-3)

function meanMolar(comp) {
  let m = 0, t = 0;
  for (const k in comp) { m += comp[k] * MOLAR[k]; t += comp[k]; }
  return m / t;
}
function rayleighRel(comp) {
  let r = 0, t = 0;
  for (const k in comp) { r += comp[k] * (RAYLEIGH_REL[k] || 1); t += comp[k]; }
  return r / t;
}

// ---------------------------------------------------------------- vegetation pigment

// Photosynthetic pigment colour follows the host star's spectrum
// (Kiang et al. 2007): F stars -> blue-green/teal, G -> greens (with
// occasional "purple Earth" retinal pigments), K -> yellow-orange, M -> dark red/black.
// ---------------------------------------------------------------- mineral palettes

const MINERALS = {
  basalt: { rock: '#3b3836', rock2: '#55504a', regolith: '#5d5650', sand: '#2e2c2b' },
  granite: { rock: '#8a7f78', rock2: '#a39289', regolith: '#7d6e60', sand: '#c9b48e' },
  ferric: { rock: '#7a3f22', rock2: '#9a5a33', regolith: '#b06b3e', sand: '#c4824d' },
  sulfur: { rock: '#b8a23a', rock2: '#d7c35a', regolith: '#c28a33', sand: '#e0d07a' },
  carbon: { rock: '#2a2522', rock2: '#3b332c', regolith: '#3e352e', sand: '#4a4038' },
  anorth: { rock: '#8f8d88', rock2: '#a8a5a0', regolith: '#9a9792', sand: '#b4b1aa' },
  ochre: { rock: '#8c6a3e', rock2: '#a9834f', regolith: '#b8915a', sand: '#d6b77c' },
  olivine: { rock: '#4f5a3a', rock2: '#69714a', regolith: '#76704d', sand: '#8d8455' },
  ice: { rock: '#b9c2c8', rock2: '#d6dde0', regolith: '#c9cdcc', sand: '#e4e6e3' },
  tholin: { rock: '#8a6a52', rock2: '#a9846a', regolith: '#b38b6a', sand: '#c89f7f' },
  organic: { rock: '#6e6152', rock2: '#8c7a63', regolith: '#5e4c3b', sand: '#2f261e' },
  slate: { rock: '#4b5058', rock2: '#646a72', regolith: '#6d6a66', sand: '#8f877c' },
};

function pickMinerals(rng, kind, wetPast = false, knownKey = null) {
  let key;
  if (kind === 'organic') key = 'organic';
  else if (kind === 'icy') key = rng.weighted([[5, 'ice'], [2, 'tholin'], [1, 'slate']]);
  else if (kind === 'volcanic') key = rng.weighted([[5, 'sulfur'], [2, 'basalt'], [1, 'ochre']]);
  // (a dry world under thin CO2 that once had water has rusted: its iron oxidised by the water
  // and the sunlight's UV, its dust red or ochre (Mars'); without that past its basalt may show)
  else if (kind === 'ferric') key = rng.weighted(wetPast ? [[5, 'ferric'], [2, 'ochre'], [0, 'basalt']] : [[5, 'ferric'], [2, 'ochre'], [1, 'basalt']]);
  else if (kind === 'airless') key = rng.weighted([[4, 'anorth'], [3, 'basalt'], [2, 'carbon'], [1, 'slate'], [1, 'ochre']]);
  else key = rng.weighted([[3, 'granite'], [3, 'basalt'], [2, 'ochre'], [2, 'slate'], [1, 'olivine'], [1, 'ferric']]);
  // (a known world's (the Solar System's: Mars' iron-oxide red): an input, the same draws made either way)
  if (knownKey && MINERALS[knownKey]) key = knownKey;
  const m = MINERALS[key];
  const out = { family: key };
  for (const k in m) out[k] = jitterColor(rng, hexToLinear(m[k]), 0.12);
  return out;
}

// ---------------------------------------------------------------- atmospheres

function buildAtmosphere(rng, b, star, S, proto) {
  const vesc = b.vEscReal / 1000;
  const Scrit = 0.0008 * vesc * vesc * vesc * vesc; // cosmic shoreline, I ~ v_esc^4
  // (flare stars: a red dwarf's planets take far more X-ray/UV per unit of light)
  const x = LOG10(Scrit / (S * dm.pow(star.xuv || 1, 0.6))) + rng.normal(0, 0.25);
  const massE = b.massEarth;
  if (x < 0) return null;

  const teff = star.teff;
  const sRunaway = hzSeff('runaway', teff) * rng.range(0.96, 1.08);
  const sMaxGh = hzSeff('maxGreenhouse', teff);
  const sOptIn = hzSeff('recentVenus', teff);
  const sOptOut = hzSeff('earlyMars', teff);
  const teqBare = equilibriumTemp(S, 0.3);
  let a;

  // Land planets and massive planets resist the runaway greenhouse beyond the
  // conservative edge (Abe et al. 2011; Kopparapu et al. 2014)
  const sRunawayPlanet = sRunaway + (sOptIn - sRunaway) * rng.range(0, 0.55);
  if (S > sRunawayPlanet && massE > 0.25) {
    const p = dm.clamp(rng.lognormal(55, 0.6) * dm.sqrt(massE), 4, 220);
    a = { type: 'venus', pressure: p, comp: { CO2: 0.965, N2: 0.035 }, albedo: 0.72, tauK: 2.4 };
  } else if (S >= sMaxGh * 0.92 && b.waterFrac > 2e-6) {
    // Carbonate-silicate thermostat (Walker et al. 1981): weathering draws CO2
    // down when warm and lets volcanic CO2 build up when cold, so HZ planets
    // settle near temperate conditions -- that feedback is what defines the HZ.
    const pBase = dm.clamp(rng.lognormal(1.0, 0.4) * dm.pow(massE, 0.55), 0.4, 6);
    const insideOpt = S <= sOptIn && S >= sOptOut;
    const lifeRoll = insideOpt && rng.chance(0.68);
    const snowballEpisode = rng.chance(0.1);
    const tTarget = rng.range(277, 301);
    const tauBase = 0.9 * dm.pow(pBase, 0.9);
    let pCO2 = 0.0004 * pBase, albedo = 0.3;
    if (!snowballEpisode) {
      const tauNeed = (dm.pow(tTarget / equilibriumTemp(S, albedo), 4) - 1) / 0.75;
      if (tauNeed > tauBase) {
        pCO2 = Math.min(dm.pow((tauNeed - tauBase) / 2.4, 1 / 0.9), 10);
        albedo = 0.3 + 0.025 * pCO2; // thick CO2 adds Rayleigh albedo
      }
    }
    const p = pBase + pCO2;
    const co2 = pCO2 / p;
    let comp;
    if (lifeRoll) {
      const o2 = rng.range(0.15, 0.3) * (1 - co2);
      comp = { N2: 1 - o2 - 0.01 - co2, O2: o2, Ar: 0.01, CO2: co2 };
    } else comp = { N2: 0.99 - co2, Ar: 0.01, CO2: co2 };
    a = { type: 'temperate', pressure: p, comp, albedo, tau: tauBase + 2.4 * dm.pow(pCO2, 0.9), life: lifeRoll, snowball: snowballEpisode };
  } else if (teqBare < 125 && b.comp.water > 0.08 && massE > 0.008 && (proto.kind === 'planet' ? rng.chance(0.6) : rng.chance(0.28))) {
    const p = dm.clamp(rng.lognormal(1.4, 0.55), 0.2, 6);
    a = { type: 'titan', pressure: p, comp: { N2: 0.95, CH4: 0.05 }, albedo: 0.22, tauK: 0.7 };
  } else if (teqBare < 125 && b.comp.water > 0.08) {
    return null; // volatiles frozen out or stripped (Ganymede / Callisto)
  } else if (massE < 0.35 || x < 0.4) {
    if (massE < 0.03 && !rng.chance(0.3)) return null;
    const p = rng.logUniform(0.002, 0.06) * dm.pow(Math.max(x, 0.05) * 3, 0.5);
    a = { type: 'mars', pressure: p, comp: { CO2: 0.95, N2: 0.03, Ar: 0.02 }, albedo: 0.25, tauK: 2.4 };
  } else {
    const p = dm.clamp(rng.lognormal(2.5, 0.7) * dm.sqrt(massE), 0.3, 40);
    a = { type: 'coldco2', pressure: p, comp: { CO2: 0.85, N2: 0.15 }, albedo: 0.35, tauK: 2.4 };
  }
  if (a.tau === undefined) a.tau = a.tauK * dm.pow(a.pressure, 0.9);
  a.mu = meanMolar(a.comp);
  return a;
}

// The air a world's history has left it (worldsim/evolve.js): its type for the
// renderer, its make-up, and the albedo and greenhouse depth (tau) that give
// the history's temperature through this file's Tsurf formula
function atmosphereNow(rng, h, S) {
  if (h.titanish && h.T < 140) {
    // a cold moon's nitrogen and methane (Titan): as much as its history kept
    const draw = dm.clamp(rng.lognormal(1.4, 0.55), 0.2, 6), p = h.P > 0.05 ? h.P : draw;
    const a = { type: 'titan', pressure: p, comp: { N2: 0.95, CH4: 0.05 }, albedo: 0.22, tauK: 0.7, life: false, snowball: false };
    a.tau = a.tauK * dm.pow(p, 0.9); a.mu = meanMolar(a.comp);
    return a;
  }
  // just struck (exceptional.js): a sky of steam from the boiled seas (rock vapour in the
  // first centuries), over a magma ocean
  if (h.fresh && h.fresh.kind === 'just-boiled' && (h.fresh.steamBar > 0.01 || h.fresh.agoYears < 1500)) {
    const steam = Math.max(h.fresh.steamBar || 0, h.fresh.agoYears < 1500 ? 5 : 0), P = steam + h.P;
    const comp = { H2O: steam / P * 0.9, CO2: Math.max(0.05, (h.pCO2 || 0) / P), N2: Math.max(0.01, (h.N2 || 0) / P) };
    return { type: 'venus', pressure: P, comp, albedo: 0.6, tau: 20, life: false, snowball: false, mu: meanMolar(comp) };
  }
  if (h.P < 0.003) return null;
  const P = h.P, co2 = h.pCO2 / P, o2 = h.pO2 / P;
  // the history's air by gas (evolve.js): fractions, the traces dropped
  const comp = {};
  for (const k in h.air) { const x = h.air[k] / P; if (x > 1e-6 && k !== 'H2O') comp[k] = x; }
  if (!comp.N2) comp.N2 = Math.max(0, 1 - co2 - o2) / 1.01;
  let type;
  if (h.runaway || (h.T > 400 && co2 > 0.5 && P > 3)) type = 'venus';
  else if (co2 > 0.5 && (h.oceans <= 0.001 || h.T < 255)) type = P < 0.1 ? 'mars' : 'coldco2';
  else type = 'temperate';
  const albedo = dm.clamp(h.albedo, 0.05, 0.8);
  const Teq = equilibriumTemp(S, albedo);
  const tau = Math.max(0, (dm.pow(h.T / Teq, 4) - 1) / 0.75);
  return { type, pressure: P, comp, albedo, tau, life: h.lifeLevel !== 'none', snowball: h.snowball, mu: meanMolar(comp) };
}

// Optical parameters for the scattering shader (game units = metres)
// a glowing surface's colour and brightness at T K (blackbody; ~3.2 at basalt's 1400 K,
// the old fixed lava colour's brightness)
function glowRGB(T) {
  const c = blackbodyRGB(T), k = 3.2 * dm.pow(T / 1400, 4) / Math.max(c[0], 1e-6) * 1;
  return [c[0] * k, c[1] * k, c[2] * k].map((x) => Math.min(x, 40));
}

// The sky's optics from what's in the air (WORLDSIM.md 19: one way for every world, no
// world-type buckets): Rayleigh scattering from the gas mix; ozone from oxygen; and the aerosols
// simulated from the world's state (worldsim/aerosols.js): each kind from its source to its sink, its
// particles' sizes from that and their optics from what they're made of (Mie theory, fractal aggregates):
//   tholin haze  the star's UV breaking methane, the specks clumping as they fall (Titan's orange)
//   dust         wind and dust devils off dry ground, the ground's own colour (Mars' butterscotch, and
//                its sunset's blue)
//   sea salt     whitecaps on a sea of water
//   sulfate      SO2 oxidised, a flood-basalt eruption's; and the sea's algae's DMS
//   organic      land plants' terpenes (a forest's blue distance)
//   soot         an impact winter's
// a height in the air (m above the datum) as drawn: real up to the knee, squeezed by upper
// above it (atmosphereRender); and back (a drawn height to the real one the air's density is at)
export const atmoAlt = (z, knee, upper) => z <= knee ? z : knee + (z - knee) * upper;
export const atmoReal = (z, knee, upper) => z <= knee || !(upper < 1) ? z : knee + (z - knee) / upper;
function atmosphereRender(rng, b, atm, Tsurf, dustColor, ctx = {}) {
  const g = b.gravity, h = b.history || {};
  const Tcol = Math.max(60, Tsurf * 0.88);
  const H = U.K_B * Tcol / (atm.mu * U.AMU * g);
  const n = atm.pressure * 1e5 / (U.K_B * Tsurf);
  const rel = rayleighRel(atm.comp) * (n / N0);
  const rayleigh = EARTH_RAYLEIGH.map((x) => x * rel);
  const P = atm.pressure, air = h.air || {};
  const seas = b.hydrosphere ? b.hydrosphere.oceanFraction : 0;
  const wet = b.hydrosphere && b.hydrosphere.liquid === 'water' ? 1 : 0;
  const dry = wet ? Math.max(0, 0.5 - seas) * 0.3 : 1;
  // the aerosols, simulated (the star's UV now relative to the Sun's, as evolve.js has it)
  const star = ctx.star || {}, age = h.age || 4.6, act = star.activeGyr || 0.1;
  const xuv = dm.pow(star.xuv || 1, 0.6) * (age < act ? 1.6 : dm.pow(age / act, -1.2) * 1.6 + 0.3) / 0.32;
  const rot = b.rotation || {};
  const aer = aerosolsOf({
    P, T: Tsurf, mu: atm.mu || 29, g, comp: atm.comp || {}, tauIR: atm.tau || 0, sunE: ctx.S ?? b.insolation ?? 1, uv: xuv,
    albedo: atm.albedo ?? b.albedo ?? 0.3, seaFrac: seas, liquid: b.hydrosphere ? b.hydrosphere.liquid : null,
    regolithRGB: dustColor, regolithN: 1.55, fines: 15, so2: (air.SO2 || 0) + (air.H2S || 0) * 0.5, eruption: !!h.eruption,
    Rm: b.radiusM || b.R, sootTau: h.fresh && h.fresh.kind === 'impact-winter' ? h.fresh.sootTau || 0 : 0,
    acidDeck: !!(h.runaway && P > 3), deckT: h.runaway && P > 3 ? 0.025 : 1,
    day: (rot.periodRealH || (ctx.dayH || 24)) * 3600, lifeStage: h.lifeStage, floraStage: h.floraStage,
  });
  const { mieH, mieG, mieF, mieGL } = aer.render;
  let { mie, mieAbs } = aer.render;
  const ozone = air.O2 || atm.comp.O2 ? [0.650e-6, 1.881e-6, 0.085e-6].map((x) => x * (atm.comp.O2 || 0) / 0.21) : [0, 0, 0];
  // Atmosphere extends until density ~ e^-12 of the surface value
  const scaleMax = Math.max(H, mieH * 0.6);
  // ground haze, at the game's scale (render/atmosphere.js uHaze): a thin layer that fades the
  // far ground as real air does across distances ten times the game's. More in thicker air, in
  // damp air over seas and in dusty air over dry land; ~0.25 per game km at the datum on an Earth
  // (the far lowlands and coasts lost in it, a mountain's summit standing out above), ~0.25
  // optical depth straight up
  const hazeK = P < 0.002 ? 0 : 3e-4 * dm.sqrt(Math.min(P, 3)) * (0.5 + 0.7 * seas + 0.4 * dry);
  // (its colour by wavelength, an Angstrom exponent: a land with plants' fine haze (organics, sulphate)
  // ~1.3, taking the blue; a sea's salt and a desert's dust coarse, nearly grey)
  const angstrom = dm.clamp(aer.angstrom, 0.2, 1.6);
  const haze = [hazeK, 700 * dm.sqrt(9.81 / g), 0.1, angstrom];
  // the air above the knee squeezed (a solid world's), by the square root of the game's length
  // scale (~0.32): below it, the air as it is (skies, haze, clouds and summits in real air), above
  // it thinning three times as fast, so from orbit the limb is a thin line, not the halo round a
  // moon, with some of its blue band kept (squeezed tenfold the limb went white); coming in through
  // it feels the same (atmoAlt: real height to drawn). (?airsq=0: unsqueezed; ?airup=k: squeezed
  // to k, for comparison)
  const sqOff = typeof location !== 'undefined' && /[?&]airsq=0/.test(location.search);
  const upK = typeof location !== 'undefined' && /[?&]airup=([\d.]+)/.exec(location.search);
  const knee = b.solid && !sqOff ? Math.max(12000, 1.4 * H) : Infinity, upper = b.solid && !sqOff ? (upK ? +upK[1] : Math.sqrt(U.LEN_SCALE)) : 1;
  const sq = (z) => atmoAlt(z, knee, upper);
  // (the air's drawn shell holds the aerosols' whole column: a deep haze's scale height can outrun its top,
  // Titan's ~126 km to ~104, and the column the sim made kept)
  const realTop = Math.min(12.5 * scaleMax, 0.35 * b.R + 5 * H), keepCol = 1 / Math.max(0.05, 1 - dm.exp(-realTop / mieH));
  mie = mie.map((x) => x * keepCol); mieAbs = mieAbs.map((x) => x * keepCol);
  const ozC = 25000 * (H / 8500), ozW = 15000 * (H / 8500);
  return {
    rayleigh, rayleighH: H, mie, mieAbs, mieH, mieG, mieF, mieGL, haze, knee, upper,
    ozone, ozoneCenter: sq(ozC), ozoneWidth: sq(ozC + ozW) - sq(ozC), absorptionExp: false,
    height: sq(realTop),
    aerosols: aer.pops.length,
    // (what's in the air, and the weather's own dust and spray per unit optical depth: render/atmosphere.js
    // setDust; the share of sunlight reaching the ground (an acid deck, a haze), the winds' power)
    aer: aer.pops.map((q) => ({ name: q.name, tau: q.tau.map((x) => +x.toPrecision(3)), ssa: q.ssa.map((x) => +x.toFixed(3)), H: Math.round(q.H) })),
    dustUnit: aer.dust, saltUnit: aer.salt, sunSurf: aer.tSurf, wind: aer.wind, aerDiag: aer.diag,
  };
}

// The air's own light (for the render): aurora where the star's wind reaches the upper air
// (funnelled by a magnetic field into an oval round each magnetic pole: nearer the poles for
// a strong field, further out for a strong wind; with no field a faint glow all over, as on
// Mars and Venus), coloured by what it excites: atomic oxygen's green low and red high
// (from O2, or CO2 that sunlight breaks), nitrogen's violet, hydrogen's red-pink. And
// airglow: the night air's faint light from the day's chemistry (oxygen green where there's
// oxygen, else a dim orange). strength: vertical radiance in the render's units
function airGlow(b, star, h, atm, S) {
  const c = atm.comp || {}, P = atm.pressure;
  const thin = dm.clamp(P / 1e-3, 0, 1);                       // (no air to light, no glow)
  const active = star.age < (star.activeGyr || 0) ? dm.sqrt(star.xuv || 1) : 1;
  const wind = dm.clamp(dm.sqrt(S * active), 0.03, 6);
  const field = h.field || 0;
  // (nitrogen's weight to Earth's: its aurora's oxygen green (557.7 nm) some 2-3 times as bright as
  // nitrogen's violet (N2+ 427.8 nm) from air of 21% O2 and 78% N2)
  const O = (c.O2 || 0) + 0.3 * (c.CO2 || 0) + 0.1 * (c.H2O || 0), N = 0.11 * (c.N2 || 0), Hy = 0.8 * (c.H2 || 0) + 0.1 * (c.CH4 || 0);
  const w = O + N + Hy + 1e-6;
  const mixc = (a, x, y, z) => [0, 1, 2].map((i) => (O * a[i] + N * x[i] + Hy * y[i] + z * [0.6, 0.6, 0.7][i]) / (w + z));
  const green = [0.12, 1.0, 0.25], violet = [0.35, 0.2, 1.0], pink = [1.0, 0.22, 0.32], red = [1.0, 0.12, 0.08];
  const lo = mixc(green, violet, pink, 0.02 * w), hi = mixc(red, violet, pink, 0.02 * w);
  // (a tilted dipole, fixed per body; no randomness drawn)
  const tilt = 0.06 + 0.12 * ((dm.sin((b.massEarth * 1e4 + b.radiusM) * 1e-3) * 43758.5453) % 1 + 1) % 1;
  return {
    aurora: 7e-3 * wind * (field > 0.05 ? Math.min(2, 0.6 + 0.4 * field) : 0.15) * thin,
    ovalLat: field > 0.05 ? dm.clamp(67 + 4 * dm.log2(Math.max(field, 0.05)) - 4 * dm.log2(wind), 45, 82) * Math.PI / 180 : -1,
    ovalWidth: (3 + 2 * Math.min(2, wind)) * Math.PI / 180,
    colorLow: lo, colorHigh: hi,
    airglow: 1.2e-4 * thin * (O > 0.01 ? 1 : 0.35),
    airglowColor: O > 0.01 ? [0.45, 1.0, 0.35] : [1.0, 0.55, 0.25],
    magAxis: [dm.sin(tilt), dm.cos(tilt), 0],
  };
}

// Clouds by what condenses (no buckets): water where there's liquid water and air enough;
// sulfuric acid in a hothouse's deck; CO2 ice in cold CO2 air; a steam deck over a world
// still boiling (exceptional.js); methane clouds on a Titan (thin, high, sparse)
function cloudLayer(rng, atm, hydro, Tsurf, H) {
  const P = atm.pressure;
  const co2 = atm.comp.CO2 || 0;
  if (Tsurf > 600 && hydro.liquid === 'lava' && P > 1) return { type: 'sulfuric', cover: 1.0, altitude: 30000 * (H / 15000), thickness: 20000, color: hexToLinear('#d8d4cc'), opacity: 1.0, scale: rng.range(0.8, 1.4) };
  if (P > 3 && Tsurf > 400 && co2 > 0.5) return { type: 'sulfuric', cover: 1.0, altitude: 52000 * (H / 15000), thickness: 18000, color: hexToLinear('#e9dcae'), opacity: 1.0, scale: rng.range(0.8, 1.4) };
  if (hydro.water === 'liquid' || (hydro.liquid === 'water')) {
    const cover = dm.clamp(rng.range(0.38, 0.7) + (hydro.oceanFraction - 0.6) * 0.3, 0.15, 0.9);
    return { type: 'water', cover, altitude: rng.range(1900, 3400), thickness: rng.range(1000, 2600), color: [0.95, 0.96, 0.98], opacity: 1.0, scale: rng.range(0.7, 1.5) };
  }
  if (atm.comp.CH4 > 0.01 && Tsurf < 200) return rng.chance(0.6) ? { type: 'methane', cover: rng.range(0.02, 0.1), altitude: rng.range(15000, 30000), thickness: 3000, color: [0.95, 0.93, 0.88], opacity: 0.6, scale: 1.0 } : null;
  if (co2 > 0.5 && Tsurf < 255) {
    if (P < 0.1) return rng.chance(0.5) ? { type: 'waterice', cover: rng.range(0.03, 0.12), altitude: rng.range(15000, 30000), thickness: 2000, color: [0.92, 0.93, 0.95], opacity: 0.5, scale: 1.0 } : null;
    return { type: 'co2ice', cover: rng.range(0.15, 0.45), altitude: rng.range(8000, 25000), thickness: 5000, color: [0.95, 0.95, 0.96], opacity: 0.8, scale: rng.range(0.8, 1.3) };
  }
  return null;
}

// ---------------------------------------------------------------- gas giants

const GIANT_CHEM = {
  ice: { name: 'Methane (ice giant)', base: ['#8fd3e0', '#5ab6cf', '#3b8fc2', '#a7e2ea'], storm: '#e8f6fa', deep: '#1c3f6e' },
  cold: { name: 'Ammonia / NH4SH / water', base: ['#e8dcc0', '#c99e6e', '#b07a50', '#f2ead6', '#d7b98c', '#8f5c3a'], storm: '#c0603f', deep: '#3d2a1f' },
  saturn: { name: 'Ammonia (pale)', base: ['#e9d9a6', '#d8c08a', '#c9ac72', '#f0e4bb', '#bfa06a'], storm: '#f4ecd0', deep: '#4a3c24' },
  warm: { name: 'Water clouds', base: ['#d9dfe6', '#aab8c8', '#8b9db3', '#eef1f4', '#7d8fa6'], storm: '#ffffff', deep: '#22303f' },
  alkali: { name: 'Alkali salts (KCl, Na2S)', base: ['#6f6a7c', '#55506a', '#8a8094', '#3f3b52', '#9c8f9e'], storm: '#c4b8c8', deep: '#1a1624' },
  hot: { name: 'Silicate / iron clouds', base: ['#3b2e2a', '#5a3b2c', '#2a2324', '#704532', '#4a3530'], storm: '#c46a3a', deep: '#120c0b' },
};

function giantParams(rng, b, T1bar, S, rotPeriodRealH) {
  let chem;
  if (b.class === 'iceGiant' || b.class === 'miniNeptune') chem = T1bar < 160 ? 'ice' : (T1bar < 450 ? 'warm' : 'alkali');
  else if (T1bar < 135) chem = rng.chance(0.4) ? 'saturn' : 'cold';
  else if (T1bar < 260) chem = rng.chance(0.25) ? 'saturn' : 'cold';
  else if (T1bar < 600) chem = 'warm';
  else if (T1bar < 1300) chem = 'alkali';
  else chem = 'hot';
  const C = GIANT_CHEM[chem];
  const palette = rng.shuffle(C.base.map((h) => jitterColor(rng, hexToLinear(h), 0.1)));
  // Faster rotation -> narrower Rhines scale -> more bands/jets
  const rot = dm.clamp(10 / rotPeriodRealH, 0.3, 3);
  const bands = Math.round(dm.clamp(rng.range(4, 8) * dm.sqrt(rot) * (b.class === 'gasGiant' ? 1 : 0.6), 2, 12));
  const storms = [];
  const nStorms = rng.weighted([[3, 0], [4, 1], [2, 2], [1, 3]]);
  for (let i = 0; i < nStorms; i++) {
    storms.push({
      lat: rng.range(-0.6, 0.6), lon: rng.range(0, dm.TWO_PI),
      size: rng.range(0.03, 0.12), stretch: rng.range(1.4, 2.4),
      color: jitterColor(rng, hexToLinear(C.storm), 0.1), spin: rng.sign(),
    });
  }
  // Cloud decks for the volumetric interior: altitude relative to the 1-bar level.
  const H = U.K_B * T1bar / (2.3 * U.AMU * b.gravity);
  const decks = [];
  const deck = (name, pBar, color, density, thick) => decks.push({
    name, pressure: pBar, altitude: -H * dm.log(pBar), thickness: thick * H, color, density,
  });
  if (chem === 'ice') {
    deck('Methane ice', 1.4, hexToLinear('#f2fbff'), 0.6, 0.6);
    deck('Hydrogen sulfide', 6, hexToLinear('#8fb6c8'), 1.0, 0.9);
    deck('Water ice', 40, hexToLinear('#5a7f9a'), 1.4, 1.2);
  } else if (chem === 'cold' || chem === 'saturn') {
    deck('Ammonia ice', 0.7, mixRGB(palette[0], [1, 1, 1], 0.4), 0.8, 0.6);
    deck('Ammonium hydrosulfide', 2.2, mixRGB(palette[1], hexToLinear('#8a5a3a'), 0.5), 1.0, 0.7);
    deck('Water ice / droplets', 6, hexToLinear('#b8c4cc'), 1.5, 1.0);
  } else if (chem === 'warm') {
    deck('Water droplets', 0.9, hexToLinear('#f3f5f7'), 1.0, 0.8);
    deck('Ammonium chloride', 5, hexToLinear('#9fa8b2'), 1.2, 1.0);
  } else if (chem === 'alkali') {
    deck('Potassium chloride', 0.5, hexToLinear('#9b93a8'), 0.8, 0.8);
    deck('Sodium sulfide', 3, hexToLinear('#5e5470'), 1.2, 1.0);
  } else {
    deck('Silicate (MgSiO3) cloud', 0.3, hexToLinear('#6a4a3a'), 1.0, 0.8);
    deck('Iron rain', 4, hexToLinear('#7a3a20'), 1.3, 1.0);
  }
  return {
    chemistry: chem, chemistryName: C.name,
    palette, bands, storms,
    deep: hexToLinear(C.deep),
    turbulence: rng.range(0.5, 1.2),
    windMax: rng.range(80, 180) * (chem === 'ice' ? 2.2 : 1) * U.SPEED_SCALE,
    jetPhase: rng.range(0, 1), equatorialJet: rng.sign() * rng.range(0.6, 1.4),
    polarHaze: jitterColor(rng, chem === 'ice' ? hexToLinear('#5f9fd0') : hexToLinear('#7e8a95'), 0.1),
    lightning: chem === 'cold' || chem === 'saturn' || chem === 'warm' || chem === 'ice',
    decks,
    scaleHeight: H,
    T1bar,
    // Dry adiabat below the tropopause: T = T1 - Gamma z, p = (T/T1)^(cp/R)
    cp: 12000, lapse: b.gravity / 12000, polytrope: 12000 / (U.R_GAS * 1000 / 2.3),
    methaneTint: chem === 'ice' ? rng.range(0.6, 1.0) : 0,
  };
}

// ---------------------------------------------------------------- planet / moon builder

// proto: { massEarth, comp:{iron,rock,water,envelope}, aAU (planet's or host planet's), formedBeyondSnow, kind:'planet'|'moon', class? }
export function buildBody(rng, proto, star, host) {
  const b = {
    kind: proto.kind,
    massEarth: proto.massEarth,
    comp: proto.comp,
    waterFrac: proto.comp.water,
  };
  let S = star.luminosity / (proto.aStarAU * proto.aStarAU);
  b.insolation = S;
  // class
  if (proto.comp.envelope > 0.5) b.class = 'gasGiant';
  else if (proto.comp.envelope > 0.04 && proto.massEarth > 8) b.class = 'iceGiant';
  else if (proto.comp.envelope > 0.001) b.class = 'miniNeptune';
  else b.class = proto.massEarth < 0.08 ? 'dwarf' : 'terrestrial';
  b.solid = b.class === 'terrestrial' || b.class === 'dwarf';

  const rE = radiusFromMass(proto.massEarth, proto.comp, S);
  b.radiusEarth = rE;
  b.massKg = proto.massEarth * U.M_EARTH;
  b.radiusM = rE * U.R_EARTH;
  b.gravity = U.G * b.massKg / (b.radiusM * b.radiusM);
  b.density = b.massKg / (4 / 3 * dm.PI * b.radiusM * b.radiusM * b.radiusM);
  b.vEscReal = dm.sqrt(2 * U.G * b.massKg / b.radiusM);
  b.R = b.radiusM * U.LEN_SCALE;
  b.GM = b.gravity * b.R * b.R;
  b.vEsc = dm.sqrt(2 * b.GM / b.R);

  // ---- rotation
  const rot = rng.fork('rotation');
  let locked = false;
  if (proto.kind === 'moon') locked = !proto.captured || rng.chance(0.7);
  else {
    const Q = b.solid ? 100 : 1e5, k2 = b.solid ? 0.3 : 0.5;
    const tl = tidalLockTime(proto.aStarAU * U.AU, star.massKg, b.massKg, b.radiusM, Q, k2);
    locked = tl < star.age * 1e9 * U.YEAR;
  }
  let periodRealH, obliquity = 0, retrograde = false;
  if (locked) {
    periodRealH = NaN; // set to orbital period by the system builder
    obliquity = rot.range(0, 0.02);
  } else {
    if (b.solid) {
      periodRealH = dm.clamp(rot.lognormal(23, 0.55), 7, 240);
      if (rot.chance(0.08)) { periodRealH = rot.range(800, 5800); retrograde = rot.chance(0.6); } // Venus-like slow spin
    } else periodRealH = dm.clamp(rot.lognormal(11, 0.25), 6, 24);
    const r = rot.next();
    obliquity = r < 0.72 ? Math.abs(rot.normal(0, 0.28)) : (r < 0.95 ? rot.range(0.5, 1.1) : rot.range(1.2, 1.7));
    obliquity = Math.min(obliquity, 1.65);
  }
  // (a known world's spin (the Solar System's): an input, as its orbit is; the same draws made
  // either way)
  const kn = proto.known;
  if (kn && kn.rotH) { locked = false; periodRealH = kn.rotH; obliquity = kn.obliquityDeg * dm.PI / 180; retrograde = !!kn.retro; }
  b.rotation = { locked, periodRealH, obliquity, retrograde, phase0: rot.range(0, dm.TWO_PI), tiltAzimuth: rot.range(0, dm.TWO_PI) };

  // ---- gas & ice giants, mini-Neptunes: no surface
  if (!b.solid) {
    const teq = equilibriumTemp(S, b.class === 'gasGiant' ? 0.34 : 0.29);
    const T1 = teq * (b.class === 'gasGiant' ? 1.5 : 1.45) + 20;
    b.albedo = b.class === 'gasGiant' ? 0.34 : 0.29;
    b.Teq = teq; b.Tsurf = T1; b.Tmin = T1 * 0.92; b.Tmax = T1 * 1.05;
    const comp = b.class === 'gasGiant' ? { H2: 0.86, He: 0.136, CH4: 0.004 } : { H2: 0.8, He: 0.18, CH4: 0.02 };
    const atm = { type: 'giant', pressure: 1, comp, mu: 2.3, albedo: b.albedo, tau: 0 };
    b.giant = giantParams(rng.fork('giant'), b, T1, S, isNaN(periodRealH) ? 24 : periodRealH);
    const H = b.giant.scaleHeight;
    const n = 1e5 / (U.K_B * T1);
    const rel = rayleighRel(comp) * (n / N0);
    const methane = b.giant.methaneTint;
    atm.render = {
      rayleigh: EARTH_RAYLEIGH.map((x) => x * rel),
      rayleighH: H,
      mie: [1.5e-6, 1.5e-6, 1.5e-6], mieAbs: [0.2e-6, 0.2e-6, 0.25e-6], mieH: H * 0.7, mieG: 0.75,
      // methane absorbs red light: the blue of Uranus and Neptune
      ozone: [2.5e-6 * methane + 0.05e-6, 0.6e-6 * methane, 0.0], ozoneCenter: 0, ozoneWidth: 0, absorptionExp: true,
      // (a giant's haze a thin limb: a few hundredths of its radius at most, as Jupiter's and
      // Neptune's, and so well inside its rings, which begin at ~1.2 radii; the game's tenth-size
      // worlds with real scale heights would otherwise wrap it a third of its radius deep)
      height: Math.min(14 * H, 0.04 * b.R),
      depth: 40 * H, // the shader's atmosphere goes well below the 1-bar level
    };
    b.atmosphere = atm;
    b.hydrosphere = { water: 'none', oceanFraction: 0, iceCover: 0 };
    b.life = null;
    b.terrain = null;
    b.label = giantLabel(b, S);
    b.esi = 0; b.habitability = 0;
    return b;
  }

  // ---- terrestrial bodies
  const volcanicMoon = (proto.tidalHeating || 0) > 0.6 && b.comp.water < 0.15;
  const tidalHeating = proto.tidalHeating || 0;
  // its whole history, formation to now: the present (air, warmth, water, life) is where it led
  // (an exceptional world's cause: exceptional.js)
  const exc = proto.exception || null;
  const tidalEff = Math.max(tidalHeating, exc && exc.tidal ? exc.tidal : 0);
  // a moon spends part of each orbit in its planet's shadow: the share of the orbit behind
  // the planet (asin(Rp/a)/pi: Europa ~3.5%, a close moon of a big giant 10%+), in the part of
  // the planet's year when the shadow lines up with the moon's orbit (a tilted planet's moons
  // pass above and below it near solstice; inclined orbits likewise). Its climate's sunlight
  b.eclipse = 0;
  if (proto.kind === 'moon' && host && host.radiusM && proto.aReal > host.radiusM) {
    const beta = dm.asin(host.radiusM / proto.aReal);
    const tilt = (host.rotation ? Math.abs(host.rotation.obliquity) : 0) + (proto.i || 0);
    const inLine = beta >= tilt ? 1 : (2 / Math.PI) * dm.asin(beta / tilt);
    b.eclipse = (beta / Math.PI) * inLine;
  }
  S = S * (1 - b.eclipse);
  const hist = evolveWorld({ rng: rng.fork('history'), star, S, massE: b.massEarth, radiusM: b.radiusM, gravity: b.gravity, vEsc: b.vEscReal / 1000, comp: b.comp, kind: proto.kind, tidal: tidalEff, exception: exc, host, aHost: proto.aReal || 0 });
  if (exc) b.exceptional = { kind: exc.kind, text: exc.text };
  b.history = hist;
  let atm = volcanicMoon ? null : atmosphereNow(rng.fork('atmosphere'), hist, S);
  let albedo;
  if (atm) albedo = atm.albedo;
  else albedo = b.comp.water > ICY_WATER ? rng.range(0.45, 0.7) : rng.range(0.08, 0.16);
  if (tidalHeating > 0.6 && b.comp.water < 0.15) albedo = rng.range(0.5, 0.65); // sulfur frosts
  let Teq = equilibriumTemp(S, albedo);
  let Tsurf = atm ? Teq * dm.pow(1 + 0.75 * atm.tau, 0.25) : Teq;
  // (a freshly melted crust glows whatever the air: the history's heat)
  if (exc && (exc.kind === 'impact-melt' || exc.kind === 'just-boiled')) Tsurf = Math.max(Tsurf, hist.T);
  if (exc && exc.kind === 'impact-winter') Tsurf = hist.T;   // (the soot's cold)

  // ---- hydrosphere
  const hydroRng = rng.fork('hydro');
  let hydro = { water: 'none', oceanFraction: 0, iceCover: 0, liquid: null };
  // the water the history left (in Earth oceans), spread by how much there is
  const waterNow = hist.oceans * 2.3e-4;
  const logW = LOG10(Math.max(waterNow, 1e-9));
  const coverage = dm.smoothstep(0, 1, dm.clamp((logW + 5.5) / 3.2, 0, 1));
  const pBar = atm ? atm.pressure : 0;
  // a surface liquid other than water (liquids.js: methane and ethane, nitrogen, CO2,
  // ammonia-water, SO2, sulfur), spread by its depth as a global layer
  const other = hist.mainLiquid && hist.mainLiquid !== 'water' ? hist.mainLiquid : null;
  if (other && !(hist.oceans > 0.001 && pBar > 0.006 && Tsurf < boilingPoint(pBar) && Tsurf > 273)) {
    const d = hist.mainLiquidDepth;
    hydro = { water: b.comp.water > 1e-5 ? 'frozen' : 'none', liquid: other === 'ethane' ? 'methane' : other, oceanFraction: dm.clamp(d / (d + 100), 0.005, 1), iceCover: 0, depthM: d };
  } else if (atm && atm.type === 'titan' && hist.titanish) {
    hydro = { water: 'frozen', liquid: 'methane', oceanFraction: hydroRng.range(0.02, 0.12), iceCover: 0 };
  } else if (hist.oceans > 0.001 && pBar > 0.006 && Tsurf < boilingPoint(pBar)) {
    // (frozen: in a thin air the ice keeps to the cold traps, Mars' caps and its ground ice,
    // not a sheet over the world)
    const thinK = 1 - dm.clamp(LOG10(Math.max(pBar, 1e-6)) + 2, 0, 1);
    if (hist.snowball || Tsurf < 255) hydro = { water: 'frozen', liquid: null, oceanFraction: dm.clamp(coverage, 0.05, 1) * (1 - 0.9 * thinK), iceCover: dm.clamp(0.75 + (255 - Tsurf) / 60, 0.75, 1) * (1 - thinK) * (1 - thinK) * (1 - thinK) + 0.015 * thinK };
    else {
      hydro = { water: 'liquid', liquid: 'water', oceanFraction: dm.clamp(coverage * hydroRng.range(0.85, 1.1), 0.02, 1.0), iceCover: Tsurf < 273 ? (273 - Tsurf) / 18 * 0.6 : 0 };
      if (waterNow > 0.02) hydro.oceanFraction = 1.0; // global ocean world
    }
  } else if (b.comp.water > 0.15) hydro = { water: 'frozen', liquid: null, oceanFraction: 0, iceCover: 1 };
  // (ground ice: with little or no air to carry the vapour, only the cold traps keep it at the
  // surface: polar caps, the rest under the ground)
  else if (Tsurf < 240 && b.comp.water > 1e-5) { const thinK = 1 - dm.clamp(LOG10(Math.max(pBar, 1e-6)) + 2, 0, 1); hydro = { water: 'frozen', liquid: null, oceanFraction: 0, iceCover: dm.clamp(0.08 + coverage * 0.3, 0, 0.45) * (1 - thinK) * (1 - thinK) * (1 - thinK) + 0.015 * thinK }; }
  // a young world: its magma ocean still crusting over
  // (a rocky world big enough stays molten for a while: ~50 Myr for an Earth, much less for a
  // Moon; icy bodies freeze over at once)
  if (hist.age < 0.05 * Math.min(1, dm.sqrt(b.massEarth)) && !volcanicMoon && b.comp.water < 0.1 && b.massEarth > 0.01) hydro = { water: 'none', liquid: 'lava', oceanFraction: dm.clamp(0.9 - hist.age * 14, 0.15, 0.9) * hydroRng.range(0.8, 1), iceCover: 0 };
  // exceptional lava worlds: tide-heated (lava lakes and seas), or freshly struck (a magma sea)
  if (exc && exc.kind === 'tidal-lava') hydro = { water: 'none', liquid: 'lava', oceanFraction: exc.lavaFrac, iceCover: 0 };
  if (exc && exc.kind === 'impact-melt') hydro = { water: 'none', liquid: 'lava', oceanFraction: dm.clamp(0.9 - exc.ago * 30, 0.2, 0.9), iceCover: 0 };
  // just struck (WORLDSIM.md 17): a magma ocean crusting over, by how far it has cooled
  if (hist.fresh && hist.fresh.kind === 'just-boiled' && hist.fresh.lavaFrac > 0.01) hydro = { water: 'none', liquid: 'lava', oceanFraction: hist.fresh.lavaFrac, iceCover: 0 };
  // Lava worlds: dayside hot enough to keep silicate seas molten
  if (Teq > 900) {
    hydro = { water: 'none', liquid: 'lava', oceanFraction: Teq > 1300 ? hydroRng.range(0.4, 0.8) : hydroRng.range(0.04, 0.2), iceCover: 0 };
  } else if (volcanicMoon) {
    // Io: sulfur plains and scattered active lava lakes
    hydro = { water: 'none', liquid: 'lava', oceanFraction: hydroRng.range(0.006, 0.025), iceCover: 0 };
  }
  b.albedo = albedo; b.Teq = Teq; b.Tsurf = Tsurf;
  // Day-night / latitude swings: damped by thick atmospheres and oceans
  const damp = atm ? 1 / (1 + 1.2 * dm.pow(atm.pressure, 0.6)) : 1;
  const swing = (locked ? 1.6 : 0.6) * damp * Tsurf * (hydro.water === 'liquid' ? 0.45 : 1) + 6;
  b.Tmin = Math.max(Tsurf - swing * 1.3, 20);
  b.Tmax = Tsurf + swing * 0.8;
  b.hydrosphere = hydro;

  // ---- life
  let life = null;
  if (hist.lifeLevel !== 'none' && hydro.water === 'liquid') {
    const lr = rng.fork('life');
    // its pigments, tuned to its star's light: the foliage colour follows
    // (tuned to the light that reaches the ground, the star's through this air)
    const pigment = drawPigments(lr.fork('pigment'), star.teff, atm ? surfacePhotonPeakNm(star.teff, hist.air, atm.pressure, b.gravity, rayleighRel(atm.comp) / 1.02, atm.render) : null);
    life = {
      level: hist.lifeLevel,
      pigment,
      vegColor: albedoRGB(pigment),
      dryColor: null,
      density: lr.range(0.55, 1.0),
    };
    life.dryColor = mixRGB(life.vegColor, hexToLinear('#a08a5c'), lr.range(0.35, 0.6));
    if (life.level === 'microbial mats') life.density *= 0.35;
    // its biosphere: body plans, the food web's levels, flight, the light its eyes see by (LIFE.md 1)
    life.biosphere = biosphereOf({ gravity: b.gravity, atmosphere: atm }, hist, lr.fork('biosphere'), star, atm ? atm.render : null, atm ? rayleighRel(atm.comp) / 1.02 : 1);
  } else if (atm) atm.life = false;
  b.life = life;

  // ---- atmosphere render params & clouds
  const minerals = pickMinerals(rng.fork('minerals'),
    atm && atm.type === 'titan' ? 'organic' :
    b.comp.water > ICY_WATER && Tsurf < 200 ? 'icy' :
      (tidalHeating > 0.6 && b.comp.water < 0.15 ? 'volcanic' :
        (atm && atm.type === 'mars' ? 'ferric' : (!atm ? 'airless' : 'any'))), hist && hist.oceans0 > 0.01, proto.known && proto.known.minerals);
  if (atm) {
    atm.render = atmosphereRender(rng.fork('optics'), b, atm, Tsurf, minerals.regolith, { star, S });
    atm.clouds = cloudLayer(rng.fork('clouds'), atm, hydro, Tsurf, atm.render.rayleighH);
    atm.render.glow = airGlow(b, star, hist, atm, S);
  }
  b.atmosphere = atm;

  // ---- terrain style for the generator
  b.terrain = terrainParams(rng.fork('terrain'), b, star, minerals, tidalEff, proto);
  b.label = terrestrialLabel(b);
  b.esi = esi(b);
  b.habitability = habitabilityScore(b);
  return b;
}

function terrainParams(rng, b, star, minerals, tidalHeating, proto) {
  const atm = b.atmosphere;
  const hydro = b.hydrosphere;
  const P = atm ? atm.pressure : 0;
  const icy = b.comp.water > ICY_WATER && b.Tsurf < 200;
  const airless = !atm || P < 0.01;
  const liquidWater = hydro.water === 'liquid';
  const g = b.gravity;
  const relief = dm.clamp(8500 * 9.81 / g, 2500, 21000) * rng.range(0.7, 1.25) * (icy ? 0.45 : 1);
  const h = b.history;
  const tectonics = h ? (h.regime === 'mobile' && !icy ? rng.range(0.55, 1) : (b.massEarth > 0.15 ? rng.range(0, 0.25) : 0))
    : ((!icy && b.massEarth > 0.35 && (liquidWater || rng.chance(0.3))) ? rng.range(0.55, 1) : (b.massEarth > 0.15 ? rng.range(0, 0.25) : 0));
  let craters;
  if (airless) craters = rng.range(0.55, 1.0);
  else if (P < 0.1) craters = rng.range(0.25, 0.55);
  else craters = tectonics > 0.5 ? rng.range(0, 0.06) : rng.range(0.02, 0.2);
  // (the history's interior heat now: young worlds seethe, old ones are still)
  const volcanism = hydro.liquid === 'lava' ? 1 : h ? dm.clamp(tidalHeating + 0.18 * h.heatNow * rng.range(0.6, 1.4), 0, 1)
    : dm.clamp(tidalHeating + (b.massEarth > 0.3 ? rng.range(0, 0.45) : rng.range(0, 0.15)), 0, 1);
  if (volcanism > 0.7 || tidalHeating > 0.5) craters *= 0.15; // young resurfaced crust
  const erosion = liquidWater ? rng.range(0.55, 0.95) : (atm && P > 0.05 ? rng.range(0.25, 0.55) : rng.range(0.0, 0.1));
  const dunes = (atm && !liquidWater && P > 0.004 && atm.type !== 'titan' || (atm && atm.type === 'titan')) ? rng.range(0.25, 1.0) : 0;
  const canyons = rng.chance(airless ? 0.15 : 0.35) ? rng.range(0.3, 1.0) : 0;
  const maria = (airless && !icy && b.massEarth > 0.003) ? rng.range(0.05, 0.6) : 0;
  const lineae = icy && airless ? rng.range(0.3, 1.0) : (icy ? rng.range(0, 0.4) : 0);
  const dichotomy = (!liquidWater && !icy) ? rng.range(0, 0.7) : rng.range(0, 0.2);
  const mesas = (!liquidWater && atm && !icy) ? rng.range(0, 0.8) : 0;

  // climate field parameters (sampled by the terrain shading, per vertex)
  const obl = b.rotation.obliquity;
  const P2cos = (3 * dm.cos(obl) * dm.cos(obl) - 1) / 2;
  const s2 = -0.625 * P2cos; // annual-mean insolation P2 coefficient (Ward 1974)
  const transport = atm ? 1 / (1 + 0.9 * dm.pow(P, 0.7)) : 1; // heat transport flattens gradients
  const cpEff = atm ? (atm.mu > 30 ? 850 : 1004) : 1004;
  const lapse = atm ? (g / cpEff) * (liquidWater ? 0.62 : 0.9) : 0;
  const rotH = b.rotation.locked ? 1e9 : Math.abs(b.rotation.periodRealH);
  const hadley = dm.clamp(Math.round(3 * dm.sqrt(24 / rotH)), 1, 5);

  const palette = {
    rock: minerals.rock, rock2: minerals.rock2, regolith: minerals.regolith, sand: minerals.sand,
    soil: b.life ? mixRGB(minerals.regolith, hexToLinear('#3b2a1c'), 0.5) : minerals.regolith,
    veg: b.life ? b.life.vegColor : null,
    vegDry: b.life ? b.life.dryColor : null,
    snow: icy && rng.chance(0.35) ? mixRGB([0.9, 0.92, 0.95], minerals.rock, 0.3) : [0.92, 0.94, 0.97],
    waterDeep: hydro.liquid && hydro.liquid !== 'water' && SUBSTANCES[hydro.liquid] ? hexToLinear(SUBSTANCES[hydro.liquid].deep) : jitterColor(rng, hexToLinear(rng.chance(0.8) ? '#0b2a4a' : '#0d3b36'), 0.15),
    waterShallow: hydro.liquid && hydro.liquid !== 'water' && SUBSTANCES[hydro.liquid] ? hexToLinear(SUBSTANCES[hydro.liquid].shallow) : jitterColor(rng, hexToLinear(rng.chance(0.75) ? '#1f7f8f' : '#2f8a6a'), 0.15),
    // (molten rock glows as a blackbody at its temperature: basalt lava ~1400 K a dull
    // orange; a magma ocean just after a giant impact far hotter, whiter, brighter)
    lava: glowRGB(b.history && b.history.fresh && b.history.fresh.kind === 'just-boiled' ? Math.max(1300, b.history.fresh.T) : 1400),
  };
  return {
    seed: [rng.u32(), rng.u32(), rng.u32(), rng.u32()],
    R: b.R, g,
    relief,
    seaLevel: 0,
    ocean: hydro.oceanFraction,
    liquid: hydro.liquid, // 'water' | 'methane' | 'lava' | null
    iceCover: hydro.iceCover,
    frozenOcean: hydro.water === 'frozen' && hydro.oceanFraction > 0,
    airP: P,
    ageGyr: b.history ? b.history.age : null,   // (dust and soil take time to build: a newborn world's rock is bare)
    tectonics, craters, volcanism, erosion, dunes, canyons, maria, lineae, dichotomy, mesas,
    icy: icy ? 1 : 0,
    continentFreq: rng.range(1.1, 2.4),
    plates: Math.round(rng.range(9, 22)),
    roughness: rng.range(0.75, 1.25),
    climate: {
      Tmean: b.Tsurf, s2, transport, lapse, hadley,
      locked: b.rotation.locked,
      wet: liquidWater ? rng.range(0.45, 0.85) : (hydro.liquid === 'methane' ? 0.2 : 0),
      dayNight: b.rotation.locked ? (atm ? dm.clamp(1 - 0.85 * dm.pow(P, 0.3), 0.05, 1) : 1) : 0,
      substellar: [1, 0, 0], // body-fixed; fixed up by the system builder for locked bodies
    },
    palette,
    life: b.life ? b.life.density : 0,
    lifeLevel: b.life ? b.life.level : null,
    // (how mature its land plants are, from its history: flora.js's stages and tree heights)
    floraStage: b.history && b.life ? b.history.floraStage : -1,
    maxTree: b.history && b.life ? b.history.maxTreeM : 0,
    // (the oxygen's share of its air: whether its plants burn, gen/life/fire.js)
    fireO2: b.history && b.history.air ? (b.history.air.O2 || 0) / Math.max(b.history.P || 0, 1e-6) : 0,
  };
}

// ---------------------------------------------------------------- labels & indices

function giantLabel(b, S) {
  const mJ = b.massEarth / 317.8;
  if (b.class === 'miniNeptune') return S > 20 ? 'Warm sub-Neptune' : 'Sub-Neptune';
  if (b.class === 'iceGiant') return S > 5 ? 'Warm Neptune' : 'Ice giant';
  if (S > 300) return mJ > 2 ? 'Hot super-Jupiter' : 'Hot Jupiter';
  if (S > 5) return 'Warm Jupiter';
  if (mJ > 3) return 'Super-Jupiter';
  if (mJ < 0.5) return 'Saturnian gas giant';
  return 'Gas giant';
}

function terrestrialLabel(b) {
  const atm = b.atmosphere, h = b.hydrosphere;
  const moon = b.kind === 'moon';
  const size = b.massEarth > 2 ? 'Super-Earth ' : (b.massEarth < 0.08 ? 'Dwarf ' : '');
  if (h.liquid === 'lava') return h.oceanFraction < 0.03 ? 'Volcanic moon' : size + 'lava world';
  if (b.life) return b.life.level === 'complex biosphere' ? 'Living world' : 'Temperate world with life';
  if (atm && atm.type === 'venus') return size + 'greenhouse world';
  if (h.water === 'liquid') return h.oceanFraction >= 0.99 ? 'Ocean world' : 'Temperate terrestrial';
  if (atm && atm.type === 'titan') return moon ? 'Titan-like moon' : 'Methane-haze world';
  // (an ocean of another liquid frozen over, ammonia-water: ice is what shows, its iceCover unset)
  if (h.water === 'frozen' && (h.iceCover > 0.55 || (h.liquid && h.liquid !== 'water' && h.oceanFraction > 0.55))) {
    // (a world that froze over near its star's habitable zone is a snowball; far out, just frozen)
    if (atm && atm.type === 'temperate') return b.Teq > 200 ? 'Snowball world' : (moon ? 'Frozen moon' : 'Frozen world');
    return moon ? 'Icy moon' : 'Icy world';
  }
  // (an ice shell is what shows, however its tides heat what's beneath: Europa's)
  if (b.comp.water > ICY_WATER && b.Tsurf < 200) return moon ? 'Icy moon' : 'Icy body';
  if (b.terrain && b.terrain.volcanism > 0.75) return moon ? 'Volcanic moon' : 'Volcanic world';
  if (atm && (atm.type === 'mars' || atm.type === 'coldco2')) return size + (b.Tsurf < 240 ? 'cold desert' : 'desert world');
  if (moon) return b.radiusM < 200e3 ? 'Captured moonlet' : 'Cratered moon';
  return size + 'barren rock';
}

// Earth Similarity Index (Schulze-Makuch et al. 2011)
function esi(b) {
  const terms = [
    [b.radiusEarth, 1, 0.57], [b.density / 5514, 1, 1.07],
    [b.vEscReal / 11186, 1, 0.70], [b.Tsurf, 288, 5.58],
  ];
  let e = 1;
  for (const [x, x0, w] of terms) e *= dm.pow(1 - Math.abs((x - x0) / (x + x0)), w / 4);
  return e;
}

function habitabilityScore(b) {
  if (!b.solid) return 0;
  let s = 0.25 * b.esi;
  if (b.hydrosphere.water === 'liquid') s += 0.25;
  if (b.atmosphere) s += 0.1 * dm.clamp(1 - Math.abs(dm.log(Math.max(b.atmosphere.pressure, 1e-3))) / 3, 0, 1);
  if (b.life) s += 0.3;
  const gEarth = b.gravity / 9.81;
  s += 0.1 * dm.clamp(1 - Math.abs(gEarth - 1), 0, 1);
  if (b.hydrosphere.oceanFraction >= 0.99) s -= 0.15; // nowhere to land
  if (b.atmosphere && b.atmosphere.pressure > 60) s -= 0.3;
  return s;
}
