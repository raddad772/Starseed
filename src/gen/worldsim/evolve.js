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
//   life        arises at a rate while habitable (or never), then climbs stages on an
//               innovation clock (WORLDSIM.md 15): photosynthesis, oxygen, complex
//               cells, soft-bodied sea life, sea animals, land plants, land animals.
//               The clock runs on light reaching the surface (the star's usable
//               photons: a red dwarf's far-red light barely drives oxygen-making
//               photosynthesis), warmth, chemical energy, mutation (UV, no ozone) and
//               oxygen (big animals breathe it). Diversity grows toward what each
//               stage supports
//   extinctions big impacts (drawn at the Moon's crater rates, the system's debris)
//               darken the sky with dust and soot: each kind of life dies by how long
//               it can go without light (plankton first, seeds last, microbes shrug);
//               flood-basalt eruptions warm it fast; snowballs freeze the light out;
//               the worst lose whole stages, and a giant one sterilises the surface
//               (deep microbes may reseed it). After each, life radiates: new forms
//               come faster into the emptied world
//
// Deterministic (dmath, Rng).

import * as dm from '../../core/dmath.js';
import { hzSeff } from '../star.js';
import { equilibriumTemp } from '../bodies.js';
import { surfaceLiquids, mainLiquid, pSat } from './liquids.js';
import { seaPH } from './materials.js';
import { SOLVENTS, energyOf, backboneOf } from './biochem.js';

const LEVELS = ['none', 'microbial mats', 'vascular flora', 'complex biosphere'];
// life's stages, and the key each one's time goes under in `life`
export const STAGES = ['none', 'single cells', 'photosynthesis', 'oxygen', 'complex cells', 'soft-bodied sea life', 'sea animals', 'land plants', 'land animals'];
const STAGE_KEYS = [null, 'origin', 'photo', 'goe', 'euk', 'complex', 'animals', 'plants', 'landAnimals'];
// each stage's difficulty: Gyr on the innovation clock at an Earth's pace (Earth: oxygen
// photosynthesis ~1 Gyr after life, the oxidation ~0.4 later, complex cells ~0.5, the
// "boring billion" to many-celled life, then animals, plants and land animals in ~0.2)
const DIFFICULTY = [0, 0, 0.9, 0.35, 0.45, 0.9, 0.06, 0.08, 0.07];
// the diversity each stage supports (Earth today = 1)
const DIV_CAP = [0, 0.02, 0.04, 0.05, 0.08, 0.15, 0.4, 0.65, 1];
// how kinds of life fare in the dark: years each can last (seed banks, resting cysts, a
// food web's stores), and their share of the diversity at each stage (microbes,
// plankton, sea animals, land plants, land animals)
const GUILD_RESERVE = [30, 0.8, 1.5, 4, 1.0];
const GUILD_FLOOR = [0.5, 0.05, 0.02, 0.01, 0.005];   // refugia: some always come through
const GUILD_W = [
  [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [0.8, 0.2, 0, 0, 0], [0.7, 0.3, 0, 0, 0], [0.5, 0.5, 0, 0, 0],
  [0.3, 0.4, 0.3, 0, 0], [0.1, 0.35, 0.55, 0, 0], [0.07, 0.25, 0.4, 0.28, 0], [0.05, 0.2, 0.3, 0.2, 0.25],
];
const SUN_TEFF = 5772;
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
  // (a carbon-rich birth cloud, C/O past ~0.8, locks its oxygen in CO and carbides:
  // little water forms)
  const CO = star.CO ?? 0.55;
  const water0 = (ctx.comp.water || 0) * dm.clamp(1 - (CO - 0.8) / 0.3, 0.02, 1);
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
  const heatK = [0.75, 1, 1.25, 1.6][tier] * dm.pow(star.radio ?? 1, 0.7); // (the cloud's thorium and uranium)
  // radiogenic heat (1 = Earth at 4.5 Gyr), aged faster on small worlds; tidal on top
  const sAge = dm.pow(massE, 0.35), sFlux = dm.pow(massE, 0.15);
  const radHeat = (t) => { const u = t / sAge; return (0.6 * dm.exp(-(u - 4.5) / 2.5) + 0.4 * dm.exp(-(u - 4.5) / 10)) * sFlux * heatK; };
  const heat = (t) => radHeat(t) + 12 * tidal * tidal;
  // the core's dynamo: lasts longer in big worlds with big iron cores and heat flowing
  // out of them (x0.6 if the lid stagnates and traps the heat: below; Mars' died early)
  const iron = ctx.comp.iron ?? 0.32;
  const dynamoEnd = 0.6 * dm.pow(massE / 0.107, 1.5) * dm.pow(iron / 0.32, 1.5) * dm.pow(star.radio ?? 1, 0.5) * rng.range(0.7, 1.4);   // Gyr
  // the field's strength (x Earth's): the core's size, fading as the dynamo runs down; it
  // shields the air from the star's wind and the ground from its particles
  const fieldAt = (t, on, lid) => on ? dm.clamp(dm.pow(iron / 0.32, 0.7) * dm.pow(massE, 0.3) * Math.min(1, (dynamoEnd * lid - t) / 0.5 + 0.3), 0.15, 2) : 0;
  const shieldOf = (B) => 1 + 1.5 * (1 - Math.min(1, B));   // x2.5 with no field
  // volatiles: water in Earth oceans, carbon and nitrogen in bar (for this world)
  const oceans0 = water0 / 2.3e-4;
  // (a world's share of gas makes surface pressure ~ M^0.9: a small world's air is thin)
  const pK = dm.pow(massE, 0.9);
  const carbon = rng.lognormal(70, 0.5) * pK * dm.clamp(water0 / 1e-4, 0.1, 3) * dm.pow(CO / 0.55, 1.5);
  let N2 = rng.lognormal(1.0, 0.5) * pK;
  // escape: e-folds of air lost per Gyr at the cosmic shoreline (calibrated to bodies.js's)
  const Scrit = 0.0008 * vesc * vesc * vesc * vesc;
  const escLuck = rng.lognormal(1, 0.5);
  const xuvAt = (t) => dm.pow(star.xuv || 1, 0.6) * (t < (star.activeGyr || 0.1) ? 1.6 : dm.pow(t / (star.activeGyr || 0.1), -1.2) * 1.6 + 0.3);
  // (the heavy gases go with the star's X-rays and UV as they fade, ~t^-1.2 on: a Sun-like star
  // is ~100 times as bright in them at 0.1 Gyr as at 4.6 (Ribas et al. 2005), so most of a
  // world's air that's lost goes early; Mars loses ~0.03 bar a Gyr now)
  const xuvHeavy = (t) => dm.pow(star.xuv || 1, 0.6) * 1.6 * (t < (star.activeGyr || 0.1) ? 1 : dm.pow(t / (star.activeGyr || 0.1), -1.2));
  // (and past a point, the star's heating against the world's hold on its air (r below), the
  // upper air no longer stays put but flows off, heavy gases and all: a young star strips a
  // small world's air in its first few hundred Myr (Tian et al. 2009: early Mars couldn't keep
  // a CO2 air until ~4.1 Gyr ago), barely touching a Venus's or an Earth's)
  const escRate = (t, shield) => { const r = S(t) * xuvHeavy(t) / Scrit; return 1.6 * r * (1 + (r / 0.4) * (r / 0.4) * (r / 0.4)) * escLuck * shield; };
  // too cold to hold a gas atmosphere: nitrogen and CO2 freeze onto the ground (Ganymede, Callisto)
  const frozenOut = teqBareOf(ctx.S) < 125;
  // a moon's frozen methane-and-nitrogen air (Titan) on cold, icy, big-enough worlds
  const teqBare = teqBareOf(ctx.S);
  const titanish = teqBare < 125 && water0 > 0.08 && massE > 0.008 && rng.next() < (ctx.kind === 'planet' ? 0.6 : 0.28) && teqBare > 65; // (colder: the nitrogen freezes onto the ground)
  // ---- what it's made of (WORLDSIM.md 16; broad curves): the mantle's redox (dIW: Earth
  // ~+3.5) from its water and the cloud's carbon (carbon worlds are reduced); it decides
  // what the volcanoes breathe: CO2, water, SO2 when oxidised; CO, H2, CH4, NH3, H2S
  // when reduced. Big rocky worlds may keep some birth hydrogen (a hydrogen greenhouse)
  const chem = rng.fork('chem');
  const redox = dm.clamp(3.5 + dm.log10(Math.max(water0, 1e-7) / 2.3e-4) - 6 * Math.max(0, CO - 0.8) + chem.normal(0, 0.8), -5, 5);
  const fOx = dm.smoothstep(-1.5, 2.5, redox);
  const fH2 = 0.05 + 0.6 * (1 - dm.smoothstep(-3, 2, redox));
  const sulfur = chem.lognormal(1, 0.6);
  let pH2 = massE > 1.3 ? chem.lognormal(5, 1.2) * (massE - 1.3) * pK / dm.pow(massE, 0.9) : 0;
  let pCO = 0, pCH4 = 0, pNH3 = 0, pSO2 = 0, pH2S = 0, N2ice = 0, CO2ice = 0, carb = 0, ads = 0;   // (carb: bar of CO2 in carbonate rock; ads: held in the regolith's pores)
  const Ptot = () => N2 * 1.01 + pCO2 + pO2 + pH2 + pCH4 + pCO;
  // life's luck: the rate it arises while habitable (per Gyr; some worlds never)
  const lifeRate = rng.next() < 0.25 ? 0 : rng.lognormal(2.5, 1.2);
  // the life clock's luck: each stage's difficulty for this world
  const lr = rng.fork('life-stages');
  const difficulty = DIFFICULTY.map((d) => d * lr.lognormal(1, 0.4));
  // usable light: photons in the 400-750 nm band oxygen-making photosynthesis can use,
  // vs the Sun's at Earth (per unit of sunlight a cool star sends more, redder photons)
  const parK = parPhotons(star.teff || SUN_TEFF) / parPhotons(SUN_TEFF);
  // big impacts and flood basalts through time (their own draws)
  const er = rng.fork('life-events');
  const g = ctx.gravity || 9.81, Rkm = (ctx.radiusM || 6.371e6) / 1000;
  // (the system's clutter; a giant host's gravity pulls more onto its moons: as world.js)
  const host = ctx.host || null;
  const focus = host && !host.solid && host.massEarth > 10 ? 1 + 2 * Math.sqrt(Math.min(host.massEarth / 317.8, 4)) : 1;
  // a giant host's radiation belts: a moon deep in its magnetosphere takes a brutal particle
  // dose (Europa's ~5 Sv a day), one far out little (Callisto); x Earth's surface dose
  const belts = host && !host.solid && host.massEarth > 50 && ctx.aHost > 0
    ? 1 + 2e5 * Math.min(4, host.massEarth / 317.8) * dm.exp(-(ctx.aHost / Math.max(host.radiusM || 7e7, 1)) / 2.5) : 1;
  const debris = (star.debris ? star.debris.level : 1) * focus, spike = star.debris ? star.debris.spike : null;
  const sizeK = dm.pow(1.62 / g, 0.17), areaKm2 = 4 * dm.PI * Rkm * Rkm;
  const impactRate = (D, tG) => {   // craters >= D km per Myr (impacts.js's law)
    const tau = Math.max(0, 4.3 - tG);
    let n1 = 5.44e-14 * 6.93 * dm.exp(6.93 * tau) + 8.38e-4;
    if (spike) { const u = (tG - spike.atGyr) / spike.widthGyr; n1 += 8.38e-4 * spike.strength * 40 * dm.exp(-0.5 * u * u); }
    const Dm = D / sizeK;
    return n1 / (Dm * Dm) * areaKm2 * 1e-3 * debris;
  };

  // ---- state
  // (the magma ocean a world's born with breathes out a good share of its carbon at once: tens
  // of bar on an Earth, drawn down into carbonates within ~100 Myr where seas condense, left in
  // the air where they don't (Venus), stripped from a small world by its young star (Mars))
  let oceans = oceans0, pCO2 = carbon / 3, pO2 = 0, snow = false, runaway = false, wasLiquid = true;
  // (a world too small for plates (canPlates, below) has a stagnant lid from the start)
  let regime = massE > 0.2 ? 'mobile' : 'stagnant', dynamo = true, tStop = null, tDyn = null;
  let life = { origin: null, photo: null, goe: null, euk: null, complex: null, animals: null, plants: null, landAnimals: null, extinct: null };
  let stage = 0, div = 0, everLife = false, lastSterile = null, offFor = 0, snowSince = 0;
  let solvent = null, backbone = null;   // life's chemistry (biochem.js), set when it starts
  const regained = new Uint8Array(9);   // stages once evolved and lost (relatives remain: easier again)
  const extinctions = [], bigImpacts = [], lips = [], superEruptions = [];
  const radiations = [];        // [t, loss]: the emptied world's boost to new forms
  let lipNow = null;            // a flood-basalt eruption under way
  let eventAt = null, eventKm = 0;   // where the event happening now strikes, and its reach (km)
  const record = (t, loss, cause, text) => {
    extinctions.push({ t, ago: age - t, cause, loss, text, at: eventAt, reachKm: eventKm });
    radiations.push([t, loss]);
    if (loss >= 0.1) ev(t, 'extinction', `${text}: ${Math.round(loss * 100)}% of living kinds are lost`);
  };
  // a die-off of `loss` of the kinds living (diversity falls; the emptied world radiates)
  const die = (t, loss, cause, text) => { div *= 1 - loss; record(t, loss, cause, text); };
  // years without light (below ~1% of daylight): each kind of life by its reserves; the
  // worst lose the top stage (and again, if the next kind down is gone too)
  const darken = (t, years, cause, text) => {
    const surv = GUILD_RESERVE.map((R, k) => Math.max(GUILD_FLOOR[k], dm.exp(-years / R)));
    const w = GUILD_W[stage];
    let loss = 0;
    for (let k = 0; k < 5; k++) loss += w[k] * (1 - surv[k]);
    die(t, loss, cause, text);
    const top = (st) => (st >= 8 ? 4 : st === 7 ? 3 : st >= 5 ? 2 : st >= 2 ? 1 : 0);
    for (let k = 0; k < 2 && stage >= 5; k++) {
      const gk = top(stage);
      if (surv[gk] > GUILD_FLOOR[gk] * 1.01 || er.next() > 0.5) break;
      ev(t, 'lost', `${STAGES[stage]} die out`);
      life[STAGE_KEYS[stage]] = null; regained[stage] = 1; stage--;
    }
  };
  // the surface sterilised: what lives deeper may come back up (keep: the highest stage
  // the refuge holds; else the world is dead, and life may arise again)
  const sterilise = (t, text, deep, keep = 1) => {
    const back = deep && er.next() < deep;
    keep = Math.min(keep, stage);
    record(t, back ? 1 - DIV_CAP[keep] / Math.max(DIV_CAP[stage], 1e-3) : 1, 'sterilised', text);
    for (let k = (back ? keep : 0) + 1; k <= 8; k++) { if (life[STAGE_KEYS[k]] != null && k > 1) regained[k] = 1; if (k > 1) life[STAGE_KEYS[k]] = null; }
    if (back) { stage = keep; div = Math.min(div, 0.5 * DIV_CAP[keep]); ev(t, 'reseeded', keep >= 2 ? 'life in the deep sea comes through it, and spreads back up' : 'microbes deep in the crust survive it, and come back up'); }
    else { stage = 0; div = 0; life.origin = null; lastSterile = t; }
  };
  // a big impact (crater D km): dust and soot over the sky, by its energy (vs Chicxulub's
  // ~180 km on an Earth), spread over the world's area, held longer in thick air
  const strike = (t, D, P) => {
    eventAt = er.unitVector(); eventKm = 3 * D;   // (the fireball, ejecta and fires: a few crater widths)
    // once there's life it's hard to kill: a surface-sterilising impact spares the deep
    // sea and its vents; boiling the seas spares the microbes in the crust; only melting
    // the crust itself (a magma ocean) is nearly always the end
    if (D >= 0.55 * Rkm) { sterilise(t, `a ${Math.round(D)} km impact melts the crust`, 0.03, 1); return; }
    if (D >= 0.4 * Rkm) { sterilise(t, `a ${Math.round(D)} km impact boils the seas`, 0.85, 1); return; }
    if (D >= 0.25 * Rkm) { sterilise(t, `a ${Math.round(D)} km impact sterilises the surface`, 0.98, 4); return; }
    const De = D * dm.pow(1.62 / 9.81, 0.17) / sizeK;
    const tau0 = 40 * dm.pow(De / 180, 3.4) * (6371 / Rkm) * (6371 / Rkm) * (P < 0.01 ? 0.1 : 1);
    const te = dm.clamp(dm.pow(Math.max(P, 0.01), 0.3), 0.5, 3);
    const years = tau0 > 4.6 ? te * dm.log(tau0 / 4.6) : 0;
    if (years > 0.02) darken(t, years, 'impact', `a ${Math.round(D)} km impact darkens the sky for ${years >= 1 ? years.toFixed(1) + ' years' : Math.round(years * 12) + ' months'}`);
  };
  let T = 0, A = 0.3, ice = 0;
  const series = { t: [], T: [], P: [], pCO2: [], pO2: [], oceans: [], ice: [], heat: [], snowball: [], mobile: [], rain: [], stage: [], div: [], light: [], pH2: [], pCH4: [] };
  const events = [];
  const ev = (t, kind, text) => events.push({ t, ago: age - t, kind, text });
  const landAt = (t) => dm.clamp(0.3 * (1 - dm.exp(-t / 1.0)), 0.02, 0.6);
  const fT = (x) => dm.exp((x - 288) / 13.7) * dm.pow(Math.max(0.01, 1 + 0.038 * (x - 288)), 0.65);
  const W0 = V_EARTH * 0.75 / (fT(288) * W_EARTH_LAND * 4);  // land weathering, plants on
  const Ws0 = V_EARTH * 0.25;                                  // sea-floor weathering
  // the greenhouse: background gas, CO2 (logarithmic when thin, steeper when thick), methane
  // (methane warms, but past ~a fifth of the CO2 it makes an orange organic haze that
  // cools (Titan's, the early Earth's); hydrogen warms by collisions, more in thick air;
  // ammonia warms strongly while it lasts)
  // (a cold world's warm spells: below freezing in the year's mean, but in thin air its warmest
  // afternoons and summers run ~60 K above that (Mars' tropics reach 20 C today), at a high tilt
  // more; with air enough to keep melt liquid a while (a few tenths of a bar: in a few mbar it
  // boils and sublimes away) it flows briefly (Mars' valley networks): a little rain, the share
  // of the time it's warm enough somewhere times the rain of melt near 0 C)
  const spellsOf = (Tm, Pm) => !runaway && oceans > 0.001 && Tm > 195 && Tm <= T_SNOW_IN + 5 ? 0.15 * dm.smoothstep(195, 245, Tm) * dm.smoothstep(0.03, 0.3, Pm) * dm.exp(0.07 * (275 - 288)) : 0;
  const tempOf = (t, P, co2, _unused, snowed) => {
    const bg = Math.max(P - co2, 0);
    const haze = pCH4 > 1e-4 && pCH4 > 0.2 * co2;
    const minor = 0.35 * dm.log(1 + pCH4 / 1e-4) + 0.9 * dm.pow(Math.max(0, pH2 * P), 0.6) + 0.3 * dm.log(1 + pNH3 / 1e-6);
    // (the gases' lines broadened by the air's pressure: in thin air the same CO2 holds far
    // less heat (Mars' column is 25 times Earth's, its warming a few K), in thick air far more
    // (Venus' 92 bar: 737 K, its lines broad and its dense CO2 absorbing between them too)
    const broad = dm.pow(Math.max(P, 1e-6), 0.35);
    const tau = (0.8 * dm.pow(bg, 0.9) + (0.25 * dm.log(1 + co2 / PCO2_EARTH) * dm.pow(1 + co2 / 3, 0.8) + minor) * broad + (titanish ? 0.6 * dm.pow(bg, 0.9) : 0)) * (haze ? 0.92 : 1);
    const A0 = snowed ? SNOW_ALBEDO : dm.clamp(0.3 - 0.08 * (W_EARTH_LAND - landAt(t)) + 0.01 * co2 + (P < 0.01 ? -0.15 : 0) + (haze ? 0.06 : 0), 0.06, 0.75);
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
  const impT = exc && exc.kind === 'impact-melt' ? Math.max(0, age - exc.ago) : exc && exc.kind === 'just-boiled' ? Math.max(0, age - exc.agoYears / 1e9) : null;
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
      if (stage > 0) sterilise(t, 'nothing living survives it', 0.03, 1);
    }
    // regime: plates need heat, water at the surface and size; very hot worlds pipe heat out through volcanoes
    const wet = oceans > 0.01 && !runaway;
    const canPlates = massE > 0.2 && wet && H > 0.45;
    if (regime === 'mobile' && !canPlates && t > 0.2) { regime = 'stagnant'; tStop = t; ev(t, 'plates stop', H < 0.45 ? 'the interior cools; the plates lock into one shell' : 'without water the plates seize into one shell'); }
    if (dynamo && t > dynamoEnd * (regime === 'stagnant' ? 0.6 : 1)) { dynamo = false; tDyn = t; ev(t, 'dynamo', 'the core cools and the magnetic field dies'); }
    const field = fieldAt(t, dynamo, regime === 'stagnant' ? 0.6 : 1), shield = shieldOf(field);
    // the core's heat: plumes rise off the core-mantle boundary (hotspots, flood basalts):
    // more off a big core, fewer once it has cooled past keeping its dynamo going
    const coreK = dm.pow(iron / 0.32, 0.5) * (dynamo ? 1 : 0.5);
    // outgassing: carbon and a little nitrogen with the heat. Through a stagnant lid much less
    // (no plates carry carbonate down to be breathed out again: only the mantle's own carbon,
    // ~a tenth of Earth's outgassing), and falling far faster than the heat once the mantle
    // cools: it melts under the lid only while it's hot (Mars' ~0.25 bar since 4.1 Ga, Grott et
    // al. 2011, nearly all early; Venus' still flows)
    const lidK = regime === 'mobile' ? 1 : 0.08 * Math.min(4, H * H);
    // a flood-basalt eruption: its CO2 on top (all in the step it starts: steps are longer
    // than eruptions)
    if (lipNow && t > lipNow.t + lipNow.dur) lipNow = null;
    const V = V_EARTH * H * lidK * heatK * pK + (lipNow && !lipNow.spent ? lipNow.co2 / (dt * 1000) : 0);
    if (lipNow) lipNow.spent = true;
    N2 += 0.00002 * H * lidK * dt * 1000 * pK;
    // nitrogen in the air is capped by its vapour pressure at the coldest ground (the rest
    // is ice or liquid there, and comes back as the world warms: Triton's, Pluto's)
    // (the coldest ground: the polar night, colder below the mean the thinner the air, which
    // carries less of the day side's heat to it: ~9% under it in a bar or more, ~30% in a few
    // thousandths of one, and no colder: what freezes out there holds it at its frost point
    // (Mars' caps at ~148 K under a 210 K mean); a share of the mean, as the night sky draws
    // heat off cold ground far more slowly than off warm)
    const coldK = Math.max(T || teqBare, teqBare) * (0.087 + 0.21 * (1 - dm.clamp((dm.log10(Math.max(Ptot(), 1e-6)) + 2.2) / 2.2, 0, 1)));
    {
      const tCold = Math.max(T || teqBare, teqBare) - coldK;
      const nTot = N2 + N2ice, capN = pSat('nitrogen', tCold);
      N2 = Math.min(nTot, capN); N2ice = nTot - N2;
    }
    // escape: a flux off the top of the air (the star's X-rays and UV, its wind where no field
    // shields it), so many bar of a world's air a Gyr (as many e-folds of a bar's), whatever
    // the air below holds: a thick air loses little of itself (Venus keeps its CO2), a thin one
    // can lose all of it, and what's frozen on the ground comes back up to be lost in its turn
    // (Mars'). Shared out by the air's make-up, the heavy CO2 more slowly
    {
      const esc = escRate(t, shield) * dt, P0 = Math.max(Ptot(), 1e-12);
      N2 = Math.max(0, N2 - esc * N2 / P0);
      // (CO2 held at its frost pressure by caps: they sublime to make up what's lost, so the
      // loss runs on at the air's rate while they last)
      let lc = esc * 0.6 * pCO2 / P0;
      const fromIce = Math.min(CO2ice, Math.max(0, lc - pCO2));
      CO2ice -= fromIce; lc -= fromIce;
      pCO2 = Math.max(0, pCO2 - lc);
    }
    // the climate now
    // the minor gases: volcanic sources by the mantle's redox; sinks by escape, sunlight,
    // rain and life. Most live far shorter than a step: their steady amounts. (bar/Gyr)
    {
      const Vg = V * 1000, wetNow = oceans > 0.001;
      const anoxic = pO2 < 1e-3;
      const srcH2 = 0.1 * Vg * fH2 / 0.05;
      // the most hydrogen the star's X-rays and UV can drive off (energy-limited: ~120 bar/Gyr
      // on Earth today, more round a young or active star, more off a puffy low-gravity world)
      const Rr = (ctx.radiusM || 6.371e6) / 6.371e6;
      const EL = 120 * xuvAt(t) / 0.32 * S(t) * Rr * Rr * Rr / massE;
      const microbes = stage >= 1 && anoxic;
      // methanogens eat most of the hydrogen (CO2 + 4 H2 -> CH4 + 2 H2O)
      const eatH2 = microbes ? 0.8 : 0;
      if (pH2 * 3e4 < EL) pH2 = srcH2 * (1 - eatH2) / 3e4;   // thin: diffusion-limited escape (~30 kyr)
      else pH2 = Math.max(srcH2 * (1 - eatH2) / 3e4, pH2 - (EL - srcH2) * dt); // thick: the star strips it slowly
      if (!anoxic) pH2 = Math.min(pH2, 1e-6);
      if (teqBare < 25) pH2 = Math.min(pH2, 1e-6);   // (it freezes: hydrogen boils at ~20 K)
      const prodNow = stage >= 2 ? 1 : 0;
      const bioCH4 = microbes ? 0.25 * srcH2 * eatH2 + 50 * prodNow : stage >= 2 ? 100 * prodNow : 0;
      pCH4 = (Vg * (1 - fOx) * 0.2 + bioCH4) * (anoxic ? 1e-5 / Math.max(0.3, xuvAt(t)) : 1e-8);
      pCO = Vg * (1 - fOx) * 0.8 * (wetNow ? 1e-6 : 1e-3) * (microbes ? 0.3 : 1) * (anoxic ? 1 : 0.01);
      const hazeNow = pCH4 > 1e-4 && pCH4 > 0.2 * pCO2;
      pNH3 = Vg * 0.02 * (1 - dm.smoothstep(-3, 0, redox)) * 1e-7 * (hazeNow ? 100 : 1) * (wetNow ? 0.01 : 1) * (anoxic ? 1 : 0.01);
      const srcS = 0.0125 * Vg * sulfur;
      const tauS = wetNow ? 1e-11 : 1e-4;
      pSO2 = redox > 1 ? srcS * tauS : 0; pH2S = redox > 1 ? 0 : srcS * tauS;
    }
    const P = Ptot();
    let [Tn, An] = tempOf(t, P, pCO2, 0, snow);
    // the runaway: past the limit (with seas to boil) the water goes into the air and is lost
    if (!runaway && oceans > 0.001 && S(t) > sRun && P > 0.006) { runaway = true; ev(t, 'runaway', 'the star has brightened past the limit: the seas boil into the sky'); }
    if (runaway) { Tn = Math.max(Tn, 600 + 200 * dm.log(1 + oceans)); oceans *= dm.exp(-dt / 0.3 * xuvAt(t)); if (oceans < 0.001 && oceans > 0) { oceans = 0; ev(t, 'dry', 'the last water is lost to space'); } }
    // water: lost from a hot, moist upper air, or (with no air to speak of) to space as vapour
    if (!runaway && oceans > 0) {
      const moist = Tn > 330 ? (Tn - 330) / 40 : 0;
      const bare = P < 0.006 && Tn > 210 ? 1 : 0;
      const loss = (moist * 0.5 + bare * 3) * escRate(t, shield) * dt;
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
        const T2 = tempOf(t, P - pCO2 + x, x, 0, false)[0];
        return (W0 * fT(T2) * dm.pow(x / PCO2_EARTH, 0.5) * land * bio + Ws0 * dm.exp((T2 - 288) / 40) * dm.pow(x / PCO2_EARTH, 0.25) * H) * openK;
      };
      let lo = 0, hi = Math.max(carbon, 1e-6);
      const dtM = dt * 1000, before = pCO2 + V * dtM;
      for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; if (m - pCO2 - (V - W(Math.max(m, 1e-8))) * dtM < 0) lo = m; else hi = m; }
      pCO2 = Math.max(1e-8, (lo + hi) / 2);
      // (what the weathering took lies in carbonate rock)
      carb = Math.min(carbon, carb + Math.max(0, before - pCO2));
    // (else into the air; a share of it into the seas' carbonates where there's liquid water to
    // take it, none on a world frozen solid)
    } else {
      pCO2 = Math.min(carbon, pCO2 + V * dt * 1000 * (snow ? 1 : (oceans > 0.001 && Tn > 260 ? 0.3 : 1)));
      // (a cold world's warm spells (below) weather its rock too: carbonate where the melt
      // water ran, as much as their rain allows; Mars' Noachian carbonates)
      const sp = spellsOf(Tn, Ptot());
      // (the land weathering law as the liquid branch has it, at the melt's ~275 K, times the
      // spells' rain against an Earth's)
      if (sp > 0) { const land = Math.min(landAt(t), 0.9 / (1 + oceans)), take = Math.min(pCO2 * 0.5, W0 * fT(275) * land * sp * dm.sqrt(pCO2 / PCO2_EARTH) * dt * 1000); pCO2 -= take; carb = Math.min(carbon, carb + take); }
    }
    // a surface hot enough bakes its carbonates back into the air (calcite and quartz to
    // wollastonite and CO2: at Venus' ~740 K that holds ~90 bar of it), over ~100 Myr
    if (carb > 0 && Tn > 450) { const back = carb * (1 - dm.exp(-dt / 0.1)) * dm.smoothstep(450, 650, Tn); carb -= back; pCO2 = Math.min(carbon, pCO2 + back); }
    // a dry or frozen cold world's regolith holds CO2 on its grains, in step with the air (Mars': several
    // times its air, ~0.04 bar against 6 mbar; Zent & Quinn 1995): as the air thins the ground
    // gives it back, so a thin air outlasts its escape for Gyr
    if ((oceans <= 0.001 || Tn < 250) && Tn < 260 && Tn > 100) {
      // (its share settles in step with the air within a step: the air p where p + held(p) is
      // all there is between them)
      const k = 0.04 * (220 / Tn) * (220 / Tn) * Math.min(1, pK / 0.134), held = (p) => k * dm.pow(Math.max(p, 0) / 0.006, 0.33), tot = pCO2 + ads;
      let lo = 0, hi = tot;
      for (let it = 0; it < 30; it++) { const m = 0.5 * (lo + hi); if (m + held(m) > tot) hi = m; else lo = m; }
      pCO2 = lo; ads = tot - lo;
    } else if (ads > 0) { pCO2 += ads; ads = 0; }
    // CO2 condenses where it's cold enough (polar caps): its vapour pressure caps it
    // CO2 too: past its vapour pressure at the cold poles it freezes there (Mars' caps);
    // the caps give it back as the world warms; no more than the world's carbon
    {
      const capC = co2Sat(Tn - coldK);
      if (pCO2 > capC) { CO2ice += pCO2 - capC; pCO2 = capC; }
      else if (CO2ice > 0) { const back = Math.min(CO2ice, capC - pCO2); CO2ice -= back; pCO2 += back; }
      CO2ice = Math.min(CO2ice, Math.max(0, carbon - pCO2));
      // a planet's tilt wanders (chaotically, with no big moon to steady it: Mars' between ~0
      // and 60 degrees over Myr): at a high tilt its poles take the most sun and the caps
      // sublime. If all that air, once up, keeps the poles warmer than its frost point, it
      // stays: the air thickens for good (until escape thins it past collapsing again)
      if (CO2ice > 0.01 && ctx.kind === 'planet') {
        const Pt = Ptot() + CO2ice, Tt = tempOf(t, Pt, pCO2 + CO2ice, 0, snow)[0];
        const ck = Tt * (0.087 + 0.21 * (1 - dm.clamp((dm.log10(Pt) + 2.2) / 2.2, 0, 1)));
        if (co2Sat(Tt - ck) > pCO2 + CO2ice) { pCO2 += CO2ice; CO2ice = 0; ev(t, 'caps sublime', 'at a high tilt the polar caps sublime: the air thickens'); }
      }
    }
    [Tn, An] = tempOf(t, Ptot(), pCO2, 0, snow);
    if (runaway) Tn = Math.max(Tn, 600 + 200 * dm.log(1 + oceans));
    // snowball in and out
    // (a snowball is open seas freezing over: from a world with liquid water a step ago)
    if (!snow && wasLiquid && oceans > 0.001 && !runaway && P > 0.03 && Tn < T_SNOW_IN) { snow = true; ev(t, 'snowball', 'the ice runs to the equator: a snowball'); }
    else if (snow && tempOf(t, Ptot(), pCO2, 0, true)[0] > T_SNOW_OUT) { snow = false; ev(t, 'thaw', 'volcanic CO2 melts the snowball: a hothouse'); }
    // (air too thin to carry water round keeps no world-wide ice: it sublimes and gathers in
    // the cold traps at the poles and under the ground, the dark rock bare between (Mars'))
    else if (snow && Ptot() < 0.01) { snow = false; ev(t, 'ice retreats', 'the air grows too thin to keep a world-wide ice: it retreats to the poles'); }
    T = Tn; A = An; wasLiquid = liquid;
    ice = snow ? 1 : dm.clamp((278 - T) / 30, 0, 1);
    // life
    // liquid water's range here: salty seas freeze at ~271 K; it boils at Tboil(P) (Mars'
    // thin air: barely above freezing); microbes live to ~395 K in liquid water,
    // complex cells to ~330, animals a little less
    const tBoil = boilingPoint(P);
    const waterOK = liquid && T > 271 && T < Math.min(tBoil - 5, 395);
    // other places life could work (biochem.js): water under ice kept liquid by the
    // interior's heat (at the vents: no light), ammonia-water seas below water's freezing,
    // a Titan's methane and ethane
    // (a liquid ocean under the ice needs strong tides, Europa's and Enceladus', or a big
    // body with real internal heat, Ganymede's and Titan's)
    const iceOK = !waterOK && oceans > 0.001 && T < 271 && water0 > 0.01 && (tidal > 0.3 || (massE > 0.01 && H > 0.5));
    const amwOK = !waterOK && water0 > 0.05 && oceans > 0.001 && T >= 240 && T < 273;
    const hcOK = titanish && T > 90 && T < 185 && P > 0.12;
    const solventNow = waterOK ? 'water' : amwOK ? 'ammonia-water' : iceOK ? 'under ice' : hcOK ? 'hydrocarbon' : null;
    // (life keeps working where its solvent still is; water life carries on in ammonia-water
    // or under the ice, and ammonia-water life in water)
    const fits = (sv) => sv === solventNow || (sv === 'water' && (solventNow === 'ammonia-water' || solventNow === 'under ice')) || (sv === 'ammonia-water' && (solventNow === 'water' || solventNow === 'under ice')) || (sv === 'under ice' && solventNow === 'water');
    const habitable = stage === 0 ? solventNow != null : solvent != null && fits(solvent);
    if (stage >= 4 && T > (stage >= 6 ? 322 : 332)) {
      const keep = T > 332 ? 3 : 5;
      die(t, 1 - DIV_CAP[keep] / Math.max(DIV_CAP[stage], 1e-3), 'heat', `the world grows too hot (${Math.round(T - 273)} C) for ${STAGES[stage]}`);
      for (let k = keep + 1; k <= stage; k++) { life[STAGE_KEYS[k]] = null; regained[k] = 1; }
      stage = Math.min(stage, keep);
    }
    // light at the surface (x Earth's usable photons): the star, thick air, the ice
    const lightNow = parK * S(t) * dm.exp(-0.04 * Math.max(0, P - 1)) * (snow ? 0.02 : 1) * (lipNow ? 0.75 : 1);
    // life's start: chemistry's chance, more with energy to drive it (vents' heat, tides,
    // shores drying and wetting)
    const chem = dm.clamp(0.5 + 0.5 * dm.sqrt(Math.max(H, 0)), 0.3, 2) * (landAt(t) > 0.02 ? 1.2 : 1);
    // (starting in the dark under ice, without shores drying and wetting, is much harder)
    const startK = { water: 1, 'ammonia-water': 0.3, 'under ice': 0.004, hydrocarbon: 0.01 }[solventNow] ?? 0;
    if (stage === 0 && habitable && lifeRate > 0 && rng.next() < 1 - dm.exp(-lifeRate * chem * startK * dt)) {
      stage = 1; div = 0.005; everLife = true; life.origin = t; life.extinct = null;
      solvent = solventNow;
      backbone = backboneOf({ solvent: solvent === 'hydrocarbon' ? 'hydrocarbon' : solvent, air: { O2: pO2 } }, CO, lr);
      ev(t, 'life', lastSterile != null ? 'life arises again in the sea' : 'life arises in the sea');
    }
    // big impacts this step: the largest one's dust and soot
    {
      const lam = impactRate(60, t) * dt * 1000;
      if (lam > 1e-6 && er.next() < 1 - dm.exp(-lam)) {
        const Dmax = 0.6 * Rkm;
        let D = 0;
        for (let k = 0; k < 20 && !(D > 0 && D <= Dmax); k++) D = 60 * Math.sqrt(lam / Math.max(1e-12, -dm.log(Math.max(1e-300, er.next()))));
        D = Math.min(D, Dmax);
        if (stage > 0) strike(t, D, P); else { eventAt = er.unitVector(); }
        if (D >= 150) bigImpacts.push({ t, ago: age - t, D, at: eventAt });
        eventAt = null; eventKm = 0;
      }
    }
    // supervolcanoes: explosive caldera eruptions (Toba's, Yellowstone's) at ~1 per Myr on a
    // busy Earth, more where subduction feeds them, few under a stagnant lid. Their sulfate
    // haze scatters rather than absorbs: it dims the sky to perhaps a third and chills it
    // a few K for a few years, not the black of an impact's soot. Most do no lasting harm;
    // only the rare giants (tens of thousands of km^3) cost a tithe of life
    {
      // (arcs need plates; the hotspot kind needs plumes, which rise off a hot core)
      const lam = 1.2 * dt * 1000 * dm.clamp(H, 0, 2) * [0.6, 1, 1.4, 2][tier] * ((regime === 'mobile' ? 0.6 : 0) + 0.4 * coreK);
      if (lam > 0) {
        const k = lam > 30 ? Math.round(lam) : poissonDraw(er, lam);
        if (k > 0) {
          const V = 1000 * dm.pow(Math.max(1e-12, 1 - dm.pow(er.next(), 1 / k)), -1 / 1.5);   // km^3, the largest of k
          eventAt = er.unitVector(); eventKm = 400 * dm.pow(V / 1000, 0.33);   // (the ash fall's reach)
          if (age - t < 0.002) superEruptions.push({ t, ago: age - t, km3: V, at: eventAt });
          if (stage > 0) {
            const loss = 0.25 * (1 - dm.exp(-(V / 40000) * (V / 40000))) * (stage >= 5 ? 1 : 0.2);
            if (loss > 0.03) die(t, loss, 'supervolcano', `a supervolcano throws out ${Math.round(V / 1000)}k km3: years of dim, cold skies`);
          }
          eventAt = null; eventKm = 0;
        }
      }
    }
    // flood basalts: a plume's head reaching the surface (more on hot, busy worlds)
    if (!lipNow && er.next() < 1 - dm.exp(-0.04 * dm.clamp(H, 0, 3) * [0.5, 1, 1.6, 2.5][tier] * (regime === 'mobile' ? 1 : 0.7) * coreK * dt * 1000)) {
      const co2 = 0.0004 * er.lognormal(1, 1.1) * pK, durMyr = er.range(0.3, 2);
      // (it starts somewhere in this step: whether it's still going now depends on where)
      const t0 = t + er.next() * dt;
      lipNow = { t: t0, dur: durMyr / 1000, co2, spent: false };
      const warm = tempOf(t, P + co2, pCO2 + co2, false, snow)[0] - tempOf(t, P, pCO2, false, snow)[0];
      eventAt = er.unitVector(); eventKm = 600 + 400 * er.next();   // (a province ~1000 km across)
      lips.push({ t: t0, ago: age - t0, durMyr, co2, warm, at: eventAt, reachKm: eventKm });
      if (stage > 0) {
        const loss = (1 - dm.exp(-(warm / 15) * (warm / 15) * Math.sqrt(0.5 / durMyr))) * 0.95;
        if (loss > 0.02) die(t, loss, 'eruption', `flood basalts pour out for ${Math.round(durMyr * 1000)} kyr: the world warms ${Math.round(warm)} K`);
      }
      eventAt = null; eventKm = 0;
    }
    // too cold or hot for liquid water at the surface for long: life retreats to an ocean
    // under the ice (if heat keeps one: Europa's), or to warm rock deep down (Mars'
    // possible relic), or ends
    if (stage > 0 && !habitable && !snow) {
      offFor += dt;
      if (offFor > 0.05) {
        offFor = 0;
        const underIce = T < 271 && water0 > 0.01 && (H > 0.3 || tidal > 0.2);
        if (underIce && stage > 1) { die(t, 1 - DIV_CAP[1] / Math.max(DIV_CAP[stage], 1e-3), 'cold', 'the seas freeze over: life retreats to the dark ocean under the ice'); for (let k = 2; k <= stage; k++) { if (life[STAGE_KEYS[k]] != null) regained[k] = 1; life[STAGE_KEYS[k]] = null; } stage = 1; }
        else if (!underIce) sterilise(t, T < 271 ? 'the cold ends all life at the surface' : 'the heat ends all life at the surface', T < 271 ? 0.15 : 0.02, 1);
      }
    } else offFor = 0;
    if (stage > 0) {
      // the snowball: the light under the ice is a fiftieth; most life starves (refugia)
      if (snow && series.snowball.length && !series.snowball[series.snowball.length - 1]) { darken(t, 1e6, 'snowball', 'the ice closes over the seas'); snowSince = t; }
      if (snow && stage > 1 && t - snowSince > 0.1) {
        if (H > 0.3 || tidal > 0.2) { die(t, 1 - DIV_CAP[1] / Math.max(DIV_CAP[stage], 1e-3), 'snowball', 'the ice never lifts: only the life of the deep vents lives on'); for (let k = 2; k <= stage; k++) { if (life[STAGE_KEYS[k]] != null) regained[k] = 1; life[STAGE_KEYS[k]] = null; } stage = 1; }
        else sterilise(t, 'the ice never lifts, and the vents go cold', 0, 1);
      }
      // the end of all life: boiling, drying, or a freeze down to vents gone cold
      if (runaway || oceans < 0.001 || (snow && T < 220 && H < 0.3)) {
        sterilise(t, runaway ? 'the boiling seas end all life' : oceans < 0.001 ? 'the last water goes, and life with it' : 'the deep freeze ends all life', false);
      }
    }
    if (stage > 0) {
      // the response curves (none of them straight lines):
      // warmth: chemistry quickens ~2x per 10 K toward an optimum, then falls away to the
      // stage's heat limit (microbes ~395 K, complex cells ~332, animals ~322)
      const tTop = stage >= 5 ? 322 : stage >= 4 ? 332 : Math.min(tBoil - 5, 395);
      // (in a colder solvent, chemistry on its own scale: slower, but not frozen solid)
      const warmth = !habitable ? 0.05 : solvent === 'water' || solvent === 'under ice'
        ? dm.clamp(dm.pow(2, (Math.min(T, tTop - 12) - 288) / 10), 0.2, 3) * dm.clamp((tTop - T) / 12, 0, 1)
        : dm.clamp(dm.pow(2, (T - 288) / 25), 0.002, 1) * (SOLVENTS[solvent === 'hydrocarbon' ? 'hydrocarbon' : 'ammonia-water'] || SOLVENTS.water).pace;
      // light: photosynthesis saturates (more light, less and less gain)
      const prod = 1.5 * lightNow / (lightNow + 0.5);
      // radiation at the surface (x Earth's today): the star's UV and particles, cut by
      // the ozone (from oxygen), the magnetic field and the air; water shields sea life.
      // Some quickens mutation; too much kills (microbes take ~500x, complex sea life
      // ~50x, land plants ~20x, land animals ~10x)
      const ozone = pO2 > 0 ? 1 - dm.exp(-pO2 / 0.005) : 0;
      // (the giant's belts too, cut by the moon's own field and air: Ganymede's field helps)
      const dose = (xuvAt(t) / 0.32 * (1 - 0.95 * ozone) / 0.05 * shield + (belts - 1) * shield / 2.5) * dm.exp(-(P - 1) / 2);
      const radCurve = (R, kill, Rdeep = R) => (1 + 0.6 * R / (R + 2)) * dm.exp(-(Rdeep / kill) * (Rdeep / kill));
      // the sea: a few metres of water stop UV and the star's particles, so sea life gets
      // mutation from the sunlit layer (~1% of the surface dose) while the deep water is a
      // refuge (~0.1%): only the deadliest skies touch it
      const seaRad = (kill) => radCurve(0.2 + 0.01 * dose, kill, 0.2 + 0.001 * dose);
      // oxygen: animals need some; a lot is toxic and burns (oxidative stress, wildfire)
      const oxCurve = dm.smoothstep(0.03, 0.12, pO2) * (1 - 0.7 * dm.smoothstep(0.4, 1.0, pO2));
      let boost = 1;
      for (const [tk, lk] of radiations) boost += 4 * lk * dm.exp(-(t - tk) / 0.015);
      // each step a small chance of the next leap: higher where there's more energy to
      // use (light, warmth, the interior's chemistry, oxygen once there is some) and where
      // life is already rich (a full, diverse biosphere makes more tries)
      const next = stage + 1;
      const grad = (1 + 0.3 * Math.min(H, 3)) * (pO2 > 0.01 ? 1.3 : 1);
      let rate = 0;
      // how far life's chemistry lets it climb: in the dark under ice, no further than
      // microbes at the vents; without water in the open, no oxygen-making photosynthesis
      // (stage 3 needs it) so no further than light-eating microbes; and the best energy
      // the air offers caps the rest (without free oxygen, no animals)
      const reach = solventNow === 'under ice' ? 1 : solvent !== 'water' && solvent !== 'under ice' ? 2 : 8;
      if (next === 2) rate = warmth * seaRad(500) * dm.pow(dm.clamp(parK * S(t), 0, 2), 0.7) * (lightNow > 0.005 ? 1 : 0);
      else if (next === 3) rate = warmth * prod / (0.4 + 0.6 * H) * dm.smoothstep(-2, 2, redox) * (pH2 / P < 0.01 ? 1 : 0); // (a reduced mantle's gases, or hydrogen air, mop up the oxygen)
      else if (next === 4) rate = warmth * prod * seaRad(500) * (pO2 > 0 ? 1 : 0);
      else if (next === 5) rate = warmth * prod * seaRad(50) * Math.min(1, pO2 / 0.01);
      else if (next === 6) rate = warmth * prod * seaRad(50) * oxCurve;
      else if (next === 7) rate = warmth * prod * radCurve(dose, 20) * (landAt(t) > 0.05 ? 1 : 0);
      else if (next === 8) rate = warmth * prod * radCurve(dose, 10) * oxCurve;
      // life already on land under a sky turned deadly (the field dies, the ozone thins, the
      // star flares) withers back to the sea
      if (stage >= 7 && dose > 60) {
        const keep = 6;
        die(t, 1 - DIV_CAP[keep] / DIV_CAP[stage], 'radiation', `radiation strips the land of life (${Math.round(dose)}x Earth's)`);
        for (let k = keep + 1; k <= stage; k++) { life[STAGE_KEYS[k]] = null; regained[k] = 1; }
        stage = keep;
      }
      if (next > reach) rate = 0;
      if (next <= 8 && rate > 0) {
        const fill = dm.clamp(div / Math.max(DIV_CAP[stage], 1e-4), 0.05, 1.5);
        const hz = rate * grad * boost * dm.sqrt(fill) * (regained[next] ? 2 : 1) * dt / difficulty[next];
        if (lr.next() < 1 - dm.exp(-hz)) {
          stage = next; life[STAGE_KEYS[next]] = t;
          ev(t, STAGE_KEYS[next] === 'goe' ? 'oxygenation' : STAGE_KEYS[next] === 'photo' ? 'photosynthesis' : STAGE_KEYS[next], STAGE_TEXT[next]);
        }
      }
      // diversity toward what the stage and the light support (faster after an extinction)
      // (logistic, solved exactly over the step: recoveries take ~5-20 Myr)
      const cap = Math.max(1e-4, DIV_CAP[stage] * dm.clamp(prod * warmth, 0.15, 1.5));
      div = dm.clamp(cap / (1 + (cap / Math.max(div, 1e-4) - 1) * dm.exp(-40 * boost * dt)), 0.001, 2);
      // oxygen: a little after the oxidation; a second rise with many-celled life (more
      // buried carbon), more with land plants; less where light is poor
      if (stage >= 3) {
        const want = (stage >= 5 ? 0.21 : 0.02) * Math.max(N2, 0.2) * (stage >= 7 ? 1.15 : 1) * dm.clamp(dm.pow(parK * S(t), 0.4), 0.15, 1.2);
        pO2 += (want - pO2) * (1 - dm.exp(-dt / 0.05));
      }
    } else if (pO2 > 0) pO2 *= dm.exp(-dt / 0.05);
    if (t - lastOut >= 0.005 || dt === steps[steps.length - 1]) {
      lastOut = t;
      series.t.push(t); series.T.push(T); series.P.push(Ptot()); series.pH2.push(pH2); series.pCH4.push(pCH4); series.pCO2.push(pCO2); series.pO2.push(pO2);
      series.oceans.push(oceans); series.ice.push(ice); series.heat.push(H); series.snowball.push(snow ? 1 : 0); series.mobile.push(regime === 'mobile' ? 1 : 0);
      // (and a cold world's warm spells: spellsOf)
      series.rain.push(liquid ? dm.exp(0.07 * (T - 288)) : spellsOf(T, Ptot()));
      series.stage.push(stage); series.div.push(stage > 0 ? div : 0);
      series.light.push(parK * S(t) * (snow ? 0.02 : 1));
    }
    t += dt; i++;
  }
  if (!events.find((e) => e.kind === 'plates stop') && regime === 'mobile' && massE <= 0.2) { regime = 'stagnant'; tStop = 0; }
  if (massE <= 0.2 && tStop == null) tStop = 0;
  // ---- the present
  if (impT != null && exc.kind === 'impact-melt') { const since = age - impT; T = Math.max(T, 400 + 900 * dm.exp(-since / 0.008)); }
  // freshly struck (exceptional.js; WORLDSIM.md 17): the state it's in now
  let fresh = null;
  if (exc && exc.kind === 'just-boiled') {
    // cooling: rock vapour for ~a thousand years, a steam sky over a magma ocean, then a
    // crust; the seas come back as rain once the surface is under ~600 K (~1e5 yr)
    const y = exc.agoYears;
    const Tnow = T + (2400 - T) * dm.exp(-y / 4e4);
    const phase = y < 1500 ? 'rock-vapour sky' : Tnow > 900 ? 'steam over a magma ocean' : Tnow > 600 ? 'a fresh crust, glowing through its cracks' : Tnow > 273 && oceans0 > 0.001 ? 'the first rains: seas coming back' : 'cooled: the new crust freezing over';
    fresh = { kind: 'just-boiled', agoYears: y, at: exc.at, T: Tnow, phase, lavaFrac: dm.clamp((Tnow - 900) / 1500, 0, 0.95), steamBar: Tnow > 600 ? Math.min(2000, oceans0 * 270) : 0 };   // (a water world keeps the rest as a hot supercritical ocean)
    T = Math.max(T, Tnow);
  }
  if (exc && exc.kind === 'impact-winter') {
    // the soot's darkness falls off over years; the cold lags it; the die-off is under way
    const y = exc.agoYears, tau0 = 40 * dm.pow(exc.D / 180, 3.4) * (6371 / Rkm) * (6371 / Rkm);
    const tau = tau0 * dm.exp(-y / dm.clamp(dm.pow(Math.max(Ptot(), 0.01), 0.3), 0.5, 3));
    const light = dm.exp(-Math.min(tau, 30));
    const cooling = 18 * (1 - light) * (1 - dm.exp(-y / 0.3));
    fresh = { kind: 'impact-winter', agoYears: y, at: exc.at, D: exc.D, sootTau: tau, light, cooling };
    T -= cooling;
    if (stage > 0) { eventAt = exc.at; eventKm = 3 * exc.D; die(age, Math.min(0.9, 0.75 * dm.pow(exc.D / 180, 1.5)), 'impact', `a ${Math.round(exc.D)} km impact ${y < 2 ? 'months' : Math.round(y) + ' years'} ago: the sky is still black with soot, the fires and the cold go on`); eventAt = null; }
  }
  const P = Ptot();
  if (stage === 0 && everLife) life.extinct = lastSterile ?? extinctions.length ? extinctions[extinctions.length - 1].t : age;
  const level = stage === 0 ? 0 : stage >= 8 ? 3 : stage === 7 ? 2 : 1;
  // the present's passing states: an eruption under way, a world recovering from a die-off
  const eruption = lipNow && age >= lipNow.t && age < lipNow.t + lipNow.dur ? { sinceKyr: (age - lipNow.t) * 1e6, warm: lips[lips.length - 1].warm } : null;
  const lastBig = extinctions.filter((e) => e.loss >= 0.3).pop();
  const recovering = lastBig && stage > 0 && age - lastBig.t < 0.02 ? { agoMyr: (age - lastBig.t) * 1000, cause: lastBig.cause, loss: lastBig.loss } : null;
  const young = age < 0.15;
  // how long land plants have had (Dave: their age decides how big and complex the
  // flora is): ground cover, then shrubs and ferns, then forests (Earth's first trees
  // came ~85 Myr after its first land plants), then diverse forests and grasslands;
  // the tallest trees on Earth reach ~115 m, scaled here by gravity (taller where weaker)
  const plantsMyr = life.plants != null && stage >= 7 ? (age - life.plants) * 1000 : 0;
  const floraStage = plantsMyr <= 0 ? (level >= 1 ? 0 : -1) : plantsMyr < 50 ? 1 : plantsMyr < 90 ? 2 : plantsMyr < 300 ? 3 : 4;
  const maxTreeM = floraStage >= 3 ? Math.min(250, (floraStage === 3 ? 30 + 60 * (plantsMyr - 90) / 210 : 110) * dm.pow(9.81 / Math.max(ctx.gravity, 1), 0.5)) : floraStage === 2 ? 4 : floraStage === 1 ? 0.3 : 0;
  // the air now, by gas (bar): water vapour at half saturation over seas
  // (a runaway's seas are in the air: an Earth ocean is ~270 bar of steam; a Titan keeps
  // a few % methane from its seas and ices)
  const vap = oceans <= 0.001 ? 0 : runaway || T > boilingPoint(P) ? oceans * 270 : Math.min(0.5 * 6.11e-3 * dm.exp(17.27 * (T - 273.15) / Math.max(T - 35.9, 1)), 0.5 * P);
  if (titanish) pCH4 = Math.max(pCH4, 0.04 * P);
  const air = { N2, Ar: 0.01 * N2, CO2: pCO2, O2: pO2, H2: pH2, CH4: pCH4, CO: pCO, NH3: pNH3, SO2: pSO2, H2S: pH2S, H2O: vap };
  // what pools and freezes on the ground (liquids.js), from all the world has of each:
  // water (an Earth ocean ~270 bar's worth), the nitrogen and CO2 in the air and frozen,
  // a Titan's methane and the ethane sunlight has made of it over the ages, an icy
  // world's ammonia (water-ammonia seas below water's freezing point), the sulfur of a
  // hot volcanic world
  // (an icy world's ammonia is dissolved in its water: seas of ammonia-water between
  // ~240 and 273 K, eutectic brine from the top ~10 km of ice down to 176 K)
  const lq = rng.fork('liquids');
  const icy = water0 > 0.05;
  const wBar = !runaway && oceans > 0.001 ? oceans * 270 : 0;
  const brine = icy && T > 176 && T < 273;
  const inv = {
    water: brine ? 0 : wBar,
    'ammonia-water': brine ? (T >= 240 ? wBar : Math.min(wBar, 10000 * 9.81 / 1e5 * 1000 * 0.09 * (ctx.gravity || 9.81) / 9.81)) : 0,
    CO2: pCO2 + CO2ice, nitrogen: N2 + N2ice,
    methane: titanish ? pCH4 + lq.lognormal(0.02, 1) * P : 0,
    ethane: titanish ? 0.002 * age * P : 0,
    ammonia: pNH3,
    SO2: oceans < 0.001 ? pSO2 + 0.002 * sulfur * heat(age) : 0,
    sulfur: T > 388 && T < 1000 && heat(age) > 1.5 ? 0.02 * sulfur : 0,
  };
  const liquids = surfaceLiquids(inv, T, P, ctx.gravity || 9.81).pools;
  const main = mainLiquid(liquids);
  const out = {
    age, tier, activity: ACTIVITY_NAMES[tier],
    T, albedo: A, P, pCO2, pO2, N2,
    oceans, oceans0, snowball: snow, runaway, titanish,
    regime, dynamo, tPlatesStop: tStop, tDynamo: tDyn,
    heatNow: heat(age), young,
    life, lifeLevel: LEVELS[level], lifeEver: everLife, lifeLuck: lifeRate,
    lifeStage: stage, lifeStageName: STAGES[stage], diversity: stage > 0 ? div : 0, usableLight: parK,
    air, airType: airTypeOf(air, P, { titanish, runaway, oceans, T }), redox, CO, field: fieldAt(age, dynamo, regime === 'stagnant' ? 0.6 : 1),
    liquids, mainLiquid: main ? main.name : null, mainLiquidDepth: main ? main.depthM : 0,
    seaPH: oceans > 0.001 ? seaPH(pCO2, pSO2) : null,
    solvent: stage > 0 ? solvent : null, backbone: stage > 0 ? backbone : null,
    metabolisms: stage > 0 ? energyOf({ air, P, solvent, oceans, redox }).pairs.map((p) => p[0]) : [],
    extinctions, bigImpacts, floodBasalts: lips, superEruptions, eruption, recovering, radiusKm: Rkm, tidal, fresh, belts,
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
function poissonDraw(rng, lam) { let k = 0, p = dm.exp(-lam), s = p; const u = rng.next(); while (u > s && k < 200) { k++; p *= lam / k; s += p; } return k; }
// a broad name for an air by what dominates it and what marks it
export function airTypeOf(air, P, h) {
  if (P < 0.003) return 'none';
  if (h.titanish) return 'nitrogen-methane';
  const f = (k) => (air[k] || 0) / P;
  if (h.runaway || (air.H2O || 0) > P) return (air.H2O || 0) > P ? 'steam' : 'carbon dioxide (hothouse)';
  if (f('H2') > 0.3) return 'hydrogen';
  if (f('O2') > 0.01) return 'oxygen';
  if (f('CO2') > 0.5) return 'carbon dioxide';
  if ((air.CH4 || 0) > 1e-4 && (air.CH4 || 0) > 0.2 * (air.CO2 || 0)) return 'methane haze';
  if (f('CO') > 0.01) return 'carbon monoxide';
  if (f('SO2') + f('H2S') > 1e-4) return 'sulfurous';
  if (f('H2') > 0.01 || f('CH4') > 1e-3) return 'reducing nitrogen';
  return 'nitrogen';
}
// water's boiling point (K) at P bar (Clausius-Clapeyron, L = 40.7 kJ/mol)
function boilingPoint(P) { return 1 / (1 / 373.15 - 8.314 / 40700 * dm.log(Math.max(P, 1e-4) / 1.013)); }
// photons in the 400-750 nm band per unit of a blackbody's light at teff (relative units)
function parPhotons(teff) {
  const a = 14388 / teff; // um: hc/kT
  let band = 0;
  for (let i = 0; i < 70; i++) { const l = 0.4 + (i + 0.5) * 0.005; band += 0.005 / (l * l * l * l * (dm.exp(a / l) - 1)); }
  return band / (dm.PI * dm.PI * dm.PI * dm.PI / (15 * a * a * a * a));
}
const STAGE_TEXT = ['', 'life arises in the sea', 'microbes learn to split water for light', 'oxygen builds in the air; the methane greenhouse fades',
  'complex cells, with inner workings of their own', 'soft-bodied, many-celled life spreads through the seas', 'an explosion of sea animals: shells, eyes, reefs',
  'plants take to the land', 'animals follow the plants onto land'];
// CO2's vapour pressure (bar) at T: 1 bar at 195 K, ~0.01 bar at 150 K
function co2Sat(T) { return dm.exp(16.1 - 3138 / Math.max(T, 60)); }

function fmtAgo(g) { return g >= 1 ? `${g.toFixed(2)} Gyr ago` : g >= 0.001 ? `${Math.round(g * 1000)} Myr ago` : 'now'; }
