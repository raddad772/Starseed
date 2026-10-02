// A rocky world's whole history, run forward from its formation: the one model
// for every rocky planet and moon (WORLDSIM.md U1). Its present state is what
// the game shows (atmosphere, temperature, oceans, life, how active it is),
// so a world placed anywhere, round any star, at any age, comes out as its
// physics makes it: an Earth, a Mars that was briefly wet, a Venus whose seas
// boiled, an airless rock, a young fiery world, an old dead one.
//
//   heat        radiogenic heat falls with age (absolute: 1 = Earth today), faster on
//               small worlds; moons add tidal heat
//   regime      plate tectonics while there's heat, water and size enough; else a
//               stagnant lid (one shell); very hot worlds are "heat-pipe" volcanic
//   dynamo      a magnetic field while the core cools fast enough (lasts on big worlds)
//   volatiles   water (in Earth oceans), carbon and nitrogen (in bar) from the world's
//               make-up; outgassing frees carbon with the heat
//   escape      the star's X-ray/UV strips air, measured against the world's escape
//               speed (the cosmic shoreline, as bodies.js had it); faster with no field
//   climate     sunlight on the albedo with the greenhouse of the air; CO2 warms at
//               ~3.5 K per doubling, more when thick (Venus); ice brightens a cooling
//               world into a snowball; past the runaway limit the seas boil and the
//               water is lost
//   carbon      with liquid water, weathering holds CO2 near the thermostat's level;
//               without it, CO2 piles up (all of it, on a Venus)
//   life        arises at a rate while habitable (or never); photosynthesis, oxygen,
//               complex life, plants; wiped out if the world is sterilised
//
// Deterministic (dmath, Rng).

import * as dm from '../../core/dmath.js';
import { hzSeff } from '../star.js';
import { equilibriumTemp } from '../bodies.js';

const LEVELS = ['none', 'microbial mats', 'vascular flora', 'complex biosphere'];
export const ACTIVITY_NAMES = ['quiet', 'Earth-like', 'busy', 'over-active'];
const T_SNOW_IN = 255, T_SNOW_OUT = 245, SNOW_ALBEDO = 0.62;
const PCO2_EARTH = 2.8e-4;
const V_EARTH = 0.04;      // bar CO2 per Myr outgassed (recycled carbon included) by Earth today
const W_EARTH_LAND = 0.3;  // Earth's land fraction, for the weathering law's calibration

// One world. ctx: { rng, star, S (insolation now, x Earth), massE, radiusM, gravity,
// vEsc (km/s), comp, kind, tidal (0..1), host, debris }
export function evolveWorld(ctx) {
  const { rng, star } = ctx;
  const age = Math.max(0.02, star.age);
  const massE = Math.max(ctx.massE, 1e-6);
  const vesc = ctx.vEsc;
  const water0 = ctx.comp.water || 0;
  const tidal = ctx.tidal || 0;
  const tauMS = star.tauMS || 10;
  const lum = (t) => (1 + 0.73 * t / tauMS) / (1 + 0.73 * age / tauMS);
  const S = (t) => ctx.S * lum(t);
  // the runaway limit: drier, land-heavy worlds hold out past the conservative edge
  // toward the "recent Venus" one (Abe et al. 2011; as bodies.js had it)
  const sRun = (() => { const a = hzSeff('runaway', star.teff), b = hzSeff('recentVenus', star.teff); return a + (b - a) * rng.range(0, 0.55) * (water0 < 3e-4 ? 1.4 : 1); })();

  // ---- traits of this world
  const r = rng.next();
  let tier = r < 0.15 ? 0 : r < 0.55 ? 1 : r < 0.85 ? 2 : 3;
  const heatK = [0.75, 1, 1.25, 1.6][tier];
  // radiogenic heat (1 = Earth at 4.5 Gyr), aged faster on small worlds; tidal on top
  const sAge = dm.pow(massE, 0.35), sFlux = dm.pow(massE, 0.15);
  const radHeat = (t) => { const u = t / sAge; return (0.6 * dm.exp(-(u - 4.5) / 2.5) + 0.4 * dm.exp(-(u - 4.5) / 10)) * sFlux * heatK; };
  const heat = (t) => radHeat(t) + 12 * tidal * tidal;
  const dynamoEnd = 0.6 * dm.pow(massE / 0.107, 1.5) * rng.range(0.7, 1.4);   // Gyr (x0.6 if the lid stagnates: below)
  // volatiles: water in Earth oceans, carbon and nitrogen in bar (for this world)
  const oceans0 = water0 / 2.3e-4;
  // (a world's share of gas makes surface pressure ~ M^0.9: a small world's air is thin)
  const pK = dm.pow(massE, 0.9);
  const carbon = rng.lognormal(70, 0.5) * pK * dm.clamp(water0 / 1e-4, 0.1, 3);
  let N2 = rng.lognormal(1.0, 0.5) * pK;
  // escape: e-folds of air lost per Gyr at the cosmic shoreline (calibrated to bodies.js's)
  const Scrit = 0.0008 * vesc * vesc * vesc * vesc;
  const escLuck = rng.lognormal(1, 0.5);
  const xuvAt = (t) => dm.pow(star.xuv || 1, 0.6) * (t < (star.activeGyr || 0.1) ? 1.6 : dm.pow(t / (star.activeGyr || 0.1), -1.2) * 1.6 + 0.3);
  const escRate = (t, field) => 1.6 * S(t) * xuvAt(t) / Scrit * escLuck * (field ? 1 : 2.5);
  // too cold to hold a gas atmosphere: nitrogen and CO2 freeze onto the ground (Ganymede, Callisto)
  const frozenOut = teqBareOf(ctx.S) < 125;
  // a moon's frozen methane-and-nitrogen air (Titan) on cold, icy, big-enough worlds
  const teqBare = teqBareOf(ctx.S);
  const titanish = teqBare < 125 && water0 > 0.08 && massE > 0.008 && rng.next() < (ctx.kind === 'planet' ? 0.6 : 0.28);
  // life's luck: the rate it arises while habitable (per Gyr; some worlds never)
  const lifeRate = rng.next() < 0.25 ? 0 : rng.lognormal(2.5, 1.2);
  const delays = { photo: rng.range(0.2, 1.0), goe: rng.range(0.2, 0.8), complex: rng.range(0.8, 1.6), plants: rng.range(0.05, 0.4) };

  // ---- state
  let oceans = oceans0, pCO2 = Math.min(carbon, 4), pO2 = 0, snow = false, runaway = false;
  let regime = 'mobile', dynamo = true, tStop = null, tDyn = null;
  let life = { origin: null, photo: null, goe: null, complex: null, plants: null, extinct: null };
  let T = 0, A = 0.3, ice = 0;
  const series = { t: [], T: [], P: [], pCO2: [], pO2: [], oceans: [], ice: [], heat: [], snowball: [], mobile: [], rain: [] };
  const events = [];
  const ev = (t, kind, text) => events.push({ t, ago: age - t, kind, text });
  const landAt = (t) => dm.clamp(0.3 * (1 - dm.exp(-t / 1.0)), 0.02, 0.6);
  const fT = (x) => dm.exp((x - 288) / 13.7) * dm.pow(Math.max(0.01, 1 + 0.038 * (x - 288)), 0.65);
  const W0 = V_EARTH * 0.75 / (fT(288) * W_EARTH_LAND * 4);  // land weathering, plants on
  const Ws0 = V_EARTH * 0.25;                                  // sea-floor weathering
  // the greenhouse: background gas, CO2 (logarithmic when thin, steeper when thick), methane
  const tempOf = (t, P, co2, ch4, snowed) => {
    const bg = Math.max(P - co2, 0);
    const tau = 0.8 * dm.pow(bg, 0.9) + 0.25 * dm.log(1 + co2 / PCO2_EARTH) * dm.pow(1 + co2 / 3, 0.8) + (ch4 ? 0.45 : 0) + (titanish ? 0.6 * dm.pow(bg, 0.9) : 0);
    const A0 = snowed ? SNOW_ALBEDO : dm.clamp(0.3 - 0.08 * (W_EARTH_LAND - landAt(t)) + 0.01 * co2 + (P < 0.01 ? -0.15 : 0), 0.06, 0.75);
    let Tt = equilibriumTemp(S(t), A0) * dm.pow(1 + 0.75 * tau, 0.25);
    let Aeff = A0;
    if (!snowed && oceans > 0.001 && P > 0.006) for (let it = 0; it < 6; it++) {
      const iceF = dm.clamp((285 - Tt) / 35, 0, 1);
      Aeff = Math.min(SNOW_ALBEDO, A0 + (SNOW_ALBEDO - A0) * 0.5 * iceF);
      Tt = equilibriumTemp(S(t), Aeff) * dm.pow(1 + 0.75 * tau, 0.25);
    }
    return [Tt, Aeff];
  };

  // an exceptional world's cause (exceptional.js): a giant impact a few Myr ago
  const exc = ctx.exception || null;
  const impT = exc && exc.kind === 'impact-melt' ? Math.max(0, age - exc.ago) : null;
  let impactDone = false;
  if (exc && exc.kind === 'tidal-lava') events.push({ t: Math.min(0.1, age * 0.5), ago: age - Math.min(0.1, age * 0.5), kind: 'resonance', text: 'its orbit locks into resonance with a neighbour: the tides begin to heat it' });

  let t = 0, i = 0;
  const steps = [];
  while (t < age) { const dt = t < 0.3 ? 0.002 : 0.01; steps.push(Math.min(dt, age - t)); t += dt; }
  t = 0;
  let lastOut = -1;
  for (const dt of steps) {
    const H = heat(t);
    if (impT != null && !impactDone && t + dt >= impT) {
      impactDone = true;
      ev(t, 'impact', 'another world strikes it: the crust melts and the seas boil');
      oceans *= 0.3; snow = false;
      pCO2 = Math.min(carbon, pCO2 + carbon * 0.3); // (carbonate rock baked out)
      if (life.origin != null && life.extinct == null) { life.extinct = t; ev(t, 'extinction', 'nothing living survives it'); }
    }
    // regime: plates need heat, water at the surface and size; very hot worlds pipe heat out through volcanoes
    const wet = oceans > 0.01 && !runaway;
    const canPlates = massE > 0.2 && wet && H > 0.45;
    if (regime === 'mobile' && !canPlates && t > 0.2) { regime = 'stagnant'; tStop = t; ev(t, 'plates stop', H < 0.45 ? 'the interior cools; the plates lock into one shell' : 'without water the plates seize into one shell'); }
    if (dynamo && t > dynamoEnd * (regime === 'stagnant' ? 0.6 : 1)) { dynamo = false; tDyn = t; ev(t, 'dynamo', 'the core cools and the magnetic field dies'); }
    // outgassing: carbon and a little nitrogen with the heat (much less through a stagnant lid)
    const lidK = regime === 'mobile' ? 1 : 0.25;
    const V = V_EARTH * H * lidK * heatK * pK;
    N2 += 0.00002 * H * lidK * dt * 1000 * pK;
    if (frozenOut && !titanish) { N2 = Math.min(N2, 1e-5); pCO2 = Math.min(pCO2, 1e-6); }
    // escape: thin the air (CO2 heavier, so a little slower); water from a moist upper air
    const esc = escRate(t, dynamo) * dt;
    N2 *= dm.exp(-esc);
    pCO2 *= dm.exp(-esc * 0.6);
    // the climate now
    const P = N2 * 1.01 + pCO2 + pO2;
    const ch4 = life.origin != null && life.goe == null && t >= life.origin;
    let [Tn, An] = tempOf(t, P, pCO2, ch4, snow);
    // the runaway: past the limit (with seas to boil) the water goes into the air and is lost
    if (!runaway && oceans > 0.001 && S(t) > sRun && P > 0.006) { runaway = true; ev(t, 'runaway', 'the star has brightened past the limit: the seas boil into the sky'); }
    if (runaway) { Tn = Math.max(Tn, 600 + 200 * dm.log(1 + oceans)); oceans *= dm.exp(-dt / 0.3 * xuvAt(t)); if (oceans < 0.001 && oceans > 0) { oceans = 0; ev(t, 'dry', 'the last water is lost to space'); } }
    // water: lost from a hot, moist upper air, or (with no air to speak of) to space as vapour
    if (!runaway && oceans > 0) {
      const moist = Tn > 330 ? (Tn - 330) / 40 : 0;
      const bare = P < 0.006 && Tn > 210 ? 1 : 0;
      const loss = (moist * 0.5 + bare * 3) * escRate(t, dynamo) * dt;
      oceans *= dm.exp(-loss);
      if (oceans < 0.001) { if (oceans0 > 0.01) ev(t, 'dry', bare ? 'the thin air lets the water slip away' : 'the water is lost to space'); oceans = 0; }
    }
    // carbon: the thermostat with liquid water, else CO2 builds from the volcanoes
    // (liquid somewhere: the tropics stay open until the ice reaches the equator)
    const liquid = oceans > 0.001 && !runaway && Tn > T_SNOW_IN && P > 0.006 && !snow;
    const openK = dm.clamp((Tn - T_SNOW_IN) / 30, 0.1, 1); // the share of the weathering that's unfrozen
    const bio = life.plants != null && t >= life.plants ? 4 : 1;
    if (liquid) {
      const land = Math.min(landAt(t), 0.9 / (1 + oceans));
      const W = (x) => {
        const T2 = tempOf(t, P - pCO2 + x, x, ch4, false)[0];
        return (W0 * fT(T2) * dm.pow(x / PCO2_EARTH, 0.5) * land * bio + Ws0 * dm.exp((T2 - 288) / 40) * dm.pow(x / PCO2_EARTH, 0.25) * H) * openK;
      };
      let lo = 0, hi = Math.max(carbon, 1e-6);
      const dtM = dt * 1000;
      for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; if (m - pCO2 - (V - W(Math.max(m, 1e-8))) * dtM < 0) lo = m; else hi = m; }
      pCO2 = Math.max(1e-8, (lo + hi) / 2);
    } else pCO2 = Math.min(carbon, pCO2 + V * dt * 1000 * (snow ? 1 : (oceans > 0.001 ? 0.3 : 1)));
    // CO2 condenses where it's cold enough (polar caps): its vapour pressure caps it
    pCO2 = Math.min(pCO2, co2Sat(Tn - 25));
    [Tn, An] = tempOf(t, N2 * 1.01 + pCO2 + pO2, pCO2, ch4, snow);
    if (runaway) Tn = Math.max(Tn, 600 + 200 * dm.log(1 + oceans));
    // snowball in and out
    if (!snow && oceans > 0.001 && !runaway && P > 0.006 && Tn < T_SNOW_IN) { snow = true; ev(t, 'snowball', 'the ice runs to the equator: a snowball'); }
    else if (snow && tempOf(t, N2 * 1.01 + pCO2 + pO2, pCO2, ch4, true)[0] > T_SNOW_OUT) { snow = false; ev(t, 'thaw', 'volcanic CO2 melts the snowball: a hothouse'); }
    T = Tn; A = An;
    ice = snow ? 1 : dm.clamp((278 - T) / 30, 0, 1);
    // life
    const habitable = liquid && T > 273 && T < 330;
    if (life.origin == null && habitable && lifeRate > 0 && rng.next() < 1 - dm.exp(-lifeRate * dt)) { life.origin = t; ev(t, 'life', 'life arises in the sea'); }
    if (life.origin != null && life.extinct == null) {
      if (life.photo == null && t > life.origin + delays.photo) { life.photo = t; ev(t, 'photosynthesis', 'microbes learn to split water for light'); }
      if (life.photo != null && life.goe == null && t > life.photo + delays.goe) { life.goe = t; ev(t, 'oxygenation', 'oxygen builds in the air; the methane greenhouse fades'); }
      if (life.goe != null && life.complex == null && landAt(t) > 0.05 && t > life.goe + delays.complex) { life.complex = t; ev(t, 'complex', 'complex, many-celled life'); }
      if (life.complex != null && life.plants == null && t > life.complex + delays.plants) { life.plants = t; ev(t, 'plants', 'plants cover the land'); }
      if (runaway || oceans < 0.001 || (snow && T < 220)) { life.extinct = t; ev(t, 'extinction', runaway ? 'the boiling seas end all life' : oceans < 0.001 ? 'the last water goes, and life with it' : 'the deep freeze ends all life'); }
      // oxygen after the great oxidation, rising again with complex life
      if (life.goe != null && life.extinct == null) pO2 = Math.min(0.3 * N2 + 0.05, (life.complex != null ? 0.21 : 0.02) * Math.max(N2, 0.2) * Math.min(1, (t - (life.complex ?? life.goe)) / 0.1 + 0.1));
      else if (life.extinct != null) pO2 *= dm.exp(-dt / 0.05);
    }
    if (t - lastOut >= 0.005 || dt === steps[steps.length - 1]) {
      lastOut = t;
      series.t.push(t); series.T.push(T); series.P.push(N2 * 1.01 + pCO2 + pO2); series.pCO2.push(pCO2); series.pO2.push(pO2);
      series.oceans.push(oceans); series.ice.push(ice); series.heat.push(H); series.snowball.push(snow ? 1 : 0); series.mobile.push(regime === 'mobile' ? 1 : 0);
      series.rain.push(liquid ? dm.exp(0.07 * (T - 288)) : 0);
    }
    t += dt; i++;
  }
  if (!events.find((e) => e.kind === 'plates stop') && regime === 'mobile' && massE <= 0.2) { regime = 'stagnant'; tStop = 0; }
  if (massE <= 0.2 && tStop == null) tStop = 0;
  // ---- the present
  if (impT != null) { const since = age - impT; T = Math.max(T, 400 + 900 * dm.exp(-since / 0.008)); }
  const P = N2 * 1.01 + pCO2 + pO2;
  const level = life.origin == null || life.extinct != null ? 0 : life.plants != null ? (life.complex != null && rng.next() < 0.5 ? 3 : 2) : 1;
  const young = age < 0.15;
  // how long land plants have had (Dave: their age decides how big and complex the
  // flora is): ground cover, then shrubs and ferns, then forests (Earth's first trees
  // came ~85 Myr after its first land plants), then diverse forests and grasslands;
  // the tallest trees on Earth reach ~115 m, scaled here by gravity (taller where weaker)
  const plantsMyr = life.plants != null && life.extinct == null ? (age - life.plants) * 1000 : 0;
  const floraStage = plantsMyr <= 0 ? (level >= 1 ? 0 : -1) : plantsMyr < 50 ? 1 : plantsMyr < 90 ? 2 : plantsMyr < 300 ? 3 : 4;
  const maxTreeM = floraStage >= 3 ? Math.min(250, (floraStage === 3 ? 30 + 60 * (plantsMyr - 90) / 210 : 110) * dm.pow(9.81 / Math.max(ctx.gravity, 1), 0.5)) : floraStage === 2 ? 4 : floraStage === 1 ? 0.3 : 0;
  const out = {
    age, tier, activity: ACTIVITY_NAMES[tier],
    T, albedo: A, P, pCO2, pO2, N2,
    oceans, oceans0, snowball: snow, runaway, titanish,
    regime, dynamo, tPlatesStop: tStop, tDynamo: tDyn,
    heatNow: heat(age), young,
    life, lifeLevel: LEVELS[level], lifeEver: life.origin != null, lifeLuck: lifeRate,
    plantsMyr, floraStage, floraName: ['bare', 'microbial crusts', 'ground cover', 'shrubs and ferns', 'forests', 'diverse forests and grasslands'][floraStage + 1], maxTreeM,
    series, events, carbon,
    exception: exc,
  };
  for (const k in series) series[k] = Float64Array.from(series[k]);
  events.sort((a, b) => a.t - b.t);
  out.summary = events.map((e) => `${fmtAgo(e.ago)}: ${e.text}`);
  out.at = (agoMyr, key) => {
    const tt = age - agoMyr / 1000, ts = series.t;
    if (ts.length < 2) return ts.length ? series[key][0] : null;
    let lo = 0, hi = ts.length - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (ts[m] <= tt) lo = m; else hi = m; }
    const f = Math.max(0, Math.min(1, (tt - ts[lo]) / (ts[hi] - ts[lo] || 1)));
    return series[key][lo] * (1 - f) + series[key][hi] * f;
  };
  return out;
}

function teqBareOf(S) { return equilibriumTemp(S, 0.3); }
// CO2's vapour pressure (bar) at T: 1 bar at 195 K, ~0.01 bar at 150 K
function co2Sat(T) { return dm.exp(16.1 - 3138 / Math.max(T, 60)); }

function fmtAgo(g) { return g >= 1 ? `${g.toFixed(2)} Gyr ago` : g >= 0.001 ? `${Math.round(g * 1000)} Myr ago` : 'now'; }
