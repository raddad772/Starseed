// A world's history over its whole age: a box model in 1 Myr steps, run
// before the terrain epochs. It tells the story (when life arose, if ever;
// when oxygen rose; snowballs; when the plates stopped; when the magnetic
// field died and the air and water were lost) and gives the epochs their
// climate signal (temperature, rain, ice, plants) through time.
//
// For now it ends where the generator's present-day world is (atmosphere,
// temperature, oceans, life level): the past is chosen to lead there, so the
// game's worlds don't change. (WORLDSIM.md step 9: make it authoritative.)
//
// Pieces:
//   star        brightens with age (faint young sun: L = L_now / (1 + 0.4 (1 - t/age)));
//               its XUV is fierce early (~t^-1.2), driving escape
//   interior    heat falls with time (slower for big planets); outgassing follows it;
//               plate tectonics while heat and water allow (else a stagnant lid);
//               the core dynamo lasts longer on bigger planets
//   climate     T = Teq(S, albedo) (1 + 0.75 tau)^0.25 (as bodies.js); ice-albedo with
//               a snowball state (weathering stops, CO2 builds until the thaw: a hothouse)
//   thermostat  silicate weathering W = W0 f(T) (pCO2/p0)^0.5 land bio uplift (Walker /
//               Berner f(T)) balances volcanic CO2: pCO2 heads for the level where W = V
//   life        arises at a rate while habitable (or never); oxygenic photosynthesis, the
//               great oxidation (the methane greenhouse collapses: a cold snap, maybe a
//               snowball), complex life, land plants (faster weathering: cooler)
//   loss        (Mars, Venus types) escape without a magnetic field, water lost in a
//               runaway greenhouse
//
// Deterministic (dmath, Rng forks).

import * as dm from '../../core/dmath.js';
import { Rng } from '../../core/rng.js';
import { hzSeff } from '../star.js';
import { equilibriumTemp } from '../bodies.js';

const DT = 0.001;          // Gyr per step
const OUT_EVERY = 5;       // steps between output samples (5 Myr)
const V_EARTH = 0.04;      // bar CO2 per Myr outgassed by an Earth-like world today
// K, global mean: the ice runs away to the equator below T_SNOW_IN (the ice
// line passes ~30 deg); a snowball breaks when its equator melts, at a global
// mean (with the ice's albedo) of T_SNOW_OUT
const T_SNOW_IN = 255, T_SNOW_OUT = 245;
const CO2_START = 4;       // bar: a young world's outgassed CO2 (the early air is thick with it)
const CO2_MAX = 10;        // bar: past this CO2 condenses (the maximum greenhouse)
const SNOW_ALBEDO = 0.62;
const LEVELS = ['none', 'microbial mats', 'vascular flora', 'complex biosphere'];
// volcanic activity tiers (tectonics.js uses the same order)
export const ACTIVITY_NAMES = ['quiet', 'Earth-like', 'busy', 'over-active'];
const ACTIVITY_OUTGAS = [0.6, 1, 1.4, 2];

export function planetHistory(body, star, opts = {}) {
  // (the generator now runs every rocky world's history forward: worldsim/evolve.js)
  if (body.history && !opts.sScale) return body.history;
  const rng = opts.rng || new Rng(body.terrain ? body.terrain.seed : [body.id >>> 0, 77, 1, 9]).fork('history');
  const age = Math.max(0.3, star.age);
  const N = Math.round(age / DT);
  const massE = body.massEarth, vesc = body.vEscReal / 1000;
  const atm = body.atmosphere, p = body.terrain || {};
  // (opts.sScale moves the world: sunlight x sScale, same geology and
  // thermostat, the history running free of today's climate: an experiment)
  const S_now = body.insolation * (opts.sScale ?? 1);
  const type = atm ? atm.type : 'none';
  // the star brightens over its main sequence as star.js has it (L = L_zams (1 + 0.73 t/tauMS))
  const tauMS = star.tauMS || 10;
  const lum = (t) => (1 + 0.73 * t / tauMS) / (1 + 0.73 * age / tauMS); // vs now
  const xuv = (t) => dm.pow(Math.max(t, 0.05) / age, -1.2);       // vs now

  // ---- traits
  const r = rng.next(), v = p.volcanism ?? 0.3;
  let tier = r < 0.15 ? 0 : r < 0.55 ? 1 : r < 0.85 ? 2 : 3;
  if (v > 0.6 && tier < 3) tier++;
  // interior heat vs now: ~3x higher 4 Gyr back on an Earth (faster fall on small worlds)
  const kHeat = 0.7 * dm.pow(1 / Math.max(massE, 0.01), 0.15);
  const heat = (t) => dm.pow((t + 0.5) / (age + 0.5), -kHeat);
  // the core dynamo: lifetime grows with mass (Mars ~0.6 Gyr; Earth-size: lasting)
  const mobileNow = (p.tectonics ?? 0) > 0.3;
  let tDynamo = 0.6 * dm.pow(massE / 0.107, 1.5) * (mobileNow ? 1.5 : 0.6) * rng.range(0.7, 1.3);
  // plate tectonics: running now (the generator says so), or stopped at some time
  let tPlatesStop = mobileNow ? Infinity : (massE > 0.05 && (body.comp.water > 1e-5 || type !== 'none') ? Math.min(age * 0.8, 0.3 + 1.5 * massE * rng.range(0.5, 1.5)) : 0);

  // ---- present state
  // (its dry air, as evolve.js's history runs on)
  const P_now = atm ? (atm.dry || atm).pressure : 0;
  const comp = atm ? (atm.dry || atm).comp : {};
  const pCO2_now = P_now * (comp.CO2 || 0), pO2_now = P_now * (comp.O2 || 0);
  const pBg_now = P_now - pCO2_now;
  const T_now = body.Tsurf, A_now = body.albedo;
  const liquidNow = body.hydrosphere && body.hydrosphere.water === 'liquid';
  const level = body.life ? Math.max(1, LEVELS.indexOf(body.life.level)) : 0;
  const land_now = 1 - (p.ocean ?? 0);
  const ocean_now = p.ocean ?? 0;

  const series = { t: [], T: [], pCO2: [], pO2: [], P: [], ocean: [], ice: [], snowball: [], mobile: [], dynamo: [], outgas: [], rain: [], plants: [] };
  const events = [];
  const ev = (t, kind, text) => events.push({ t, ago: age - t, kind, text });

  // temperature: today's greenhouse (bodies.js's tau) on the sunlight and
  // albedo of the time, plus CO2's change from today at a fixed warming per
  // doubling (~3.5 K with the water-vapour feedback: its bands saturate, so
  // it's logarithmic). With the light thick CO2 scatters back (albedo +0.025
  // per bar) this puts the outer edge of the habitable zone about where
  // Kopparapu's maximum greenhouse has it (~8 bar CO2 at a third of Earth's light)
  const S2X = 3.5;
  const tauNow = type === 'temperate' || type === 'none'
    ? 0.9 * dm.pow(Math.max(pBg_now, 0), 0.9) + 2.4 * dm.pow(Math.max(pCO2_now, 0), 0.9)
    : (atm.tauK || 2.4) * dm.pow(Math.max(P_now, 0), 0.9);
  const dTco2 = (x) => S2X * dm.log((x + 1e-4) / (pCO2_now + 1e-4)) / dm.log(2);
  const albedoBase = A_now - 0.025 * pCO2_now;
  // early on there's little land, and open sea is darker than land (~0.06 vs ~0.3)
  // ice caps grow as it cools and brighten the world (more cooling): the
  // generator's albedo already holds today's ice, so only the change counts
  const iceOf = (T) => dm.clamp((285 - T) / 30, 0, 1);
  const ice0 = iceOf(T_now);
  const tempOf = (t, pBg, pCO2, extraK, snow) => {
    // (thick CO2's scattering: 0.01 per bar here, so the warming peaks near ~5-8 bar
    // as the maximum-greenhouse limit has it; bodies.js's 0.025 holds for today)
    const A0 = Math.min(0.75, A_now + 0.01 * (pCO2 - pCO2_now) - 0.24 * 0.35 * (land_now - landAt(t)));
    const k = equilibriumTemp(S_now * lum(t), 0) * dm.pow(1 + 0.75 * tauNow, 0.25);
    const add = dTco2(pCO2) + extraK;
    if (snow) return k * dm.pow(1 - SNOW_ALBEDO, 0.25) + add;
    let T = k * dm.pow(1 - A0, 0.25) + add;
    for (let it = 0; it < 8; it++) {
      const A = Math.min(SNOW_ALBEDO, A0 + (SNOW_ALBEDO - A0) * 0.55 * (iceOf(T) - ice0));
      T = k * dm.pow(1 - A, 0.25) + add;
    }
    return T;
  };
  const fT = (T) => dm.exp((T - 288) / 13.7) * dm.pow(Math.max(0.01, 1 + 0.038 * (T - 288)), 0.65);
  // sea-floor weathering (fresh basalt altered at the ridges): a quarter of the
  // sink today, following the spreading rate, barely sensitive to temperature
  const SEAFLOOR = 0.25;
  const fSea = (T) => dm.exp((T - 288) / 40);
  // the land's weathering swings as continents gather and part and ranges rise
  // (a slow random walk, ~150 Myr): ice ages come and go when a world runs cool
  const swing = new Float64Array(Math.ceil(age / 0.05) + 2);
  { let x = 0; for (let i = 0; i < swing.length; i++) { x = x * 0.7 + rng.range(-1, 1) * 0.55; swing[i] = x; } }
  const tectSwing = (t) => { const x = t / 0.05, i = Math.min(swing.length - 2, Math.floor(x)), f = x - i; return dm.exp(0.45 * (swing[i] * (1 - f) + swing[i + 1] * f) - 0.45 * swing[swing.length - 2]); };
  const landAt = (t) => land_now * (1 - dm.exp(-t / 1.0)) / (1 - dm.exp(-age / 1.0));

  if (type === 'temperate' && liquidNow) {
    // ---- the thermostat world
    const actK = ACTIVITY_OUTGAS[tier];
    const Vnow = V_EARTH * actK;
    const out = (t) => Vnow * heat(t) * (t < tPlatesStop ? 1 : 0.25);
    // life milestones (two passes: first find when it's habitable without life)
    const life = { level: LEVELS[level], origin: null, photosynthesis: null, oxygenation: null, complex: null, plants: null };
    const bioNow = level >= 2 ? 4 : 1;
    // calibrated so today is the thermostat's balance
    const W0 = Vnow * (1 - SEAFLOOR) / (fT(T_now) * land_now * bioNow);
    const Ws0 = Vnow * SEAFLOOR / fSea(T_now);
    const run = (withLife, record) => {
      let pCO2 = Math.max(pCO2_now, CO2_START), snow = false, tHab = null;
      for (let i = 0; i <= N; i++) {
        const t = i * DT;
        // life's effects
        let extra = 0, bio = 1, pO2 = 0;
        if (withLife && life.origin != null && t >= life.origin && (life.oxygenation == null || t < life.oxygenation)) extra = 10; // methane (K)
        if (withLife && life.plants != null && t >= life.plants) bio = 1 + 3 * Math.min(1, (t - life.plants) / 0.04);
        if (withLife && life.oxygenation != null && t >= life.oxygenation) {
          const final = life.complex ?? life.plants ?? (age - 0.05);
          pO2 = t < final - 0.1 ? 0.1 * pO2_now * Math.min(1, (t - life.oxygenation) / 0.05) : pO2_now * Math.min(1, 0.1 + 0.9 * (t - (final - 0.1)) / 0.15);
        }
        const pBg = pBg_now - pO2_now + pO2;
        const V = out(t);
        const sw = t < tPlatesStop ? tectSwing(t) : 0.3, spread = heat(t) * (t < tPlatesStop ? 1 : 0.1);
        const W = (x) => {
          const T = tempOf(t, pBg, x, extra, false), rp = x / Math.max(pCO2_now, 1e-6);
          return W0 * fT(T) * dm.pow(rp, 0.5) * landAt(t) * bio * sw + Ws0 * fSea(T) * dm.pow(rp, 0.25) * spread;
        };
        // (the history must arrive at today's world: a late snowball is broken by a
        // flood-basalt eruption pouring CO2 into the air)
        const late = withLife !== null && t > age - 0.3;
        if (snow) {
          pCO2 = Math.min(CO2_MAX, pCO2 + V * DT * 1000 * (late ? 8 : 1)); // weathering stops under the ice
          if (tempOf(t, pBg, pCO2, extra, true) > T_SNOW_OUT) { snow = false; if (record) ev(t, 'thaw', 'the ice melts back in a hothouse'); }
        } else {
          // the air's CO2 changes by outgassing less weathering (an implicit step:
          // p' = p + (V - W(p')) dt, so a hothouse is drawn down at the rate the
          // rocks can take it, not at once)
          const dtM = DT * 1000;
          let lo = 0, hi = CO2_MAX;
          for (let k = 0; k < 44; k++) { const m = (lo + hi) / 2; if (m - pCO2 - (V - W(Math.max(m, 1e-7))) * dtM < 0) lo = m; else hi = m; }
          pCO2 = Math.max(1e-7, (lo + hi) / 2);
          if (tempOf(t, pBg, pCO2, extra, false) < T_SNOW_IN) { snow = true; if (record) ev(t, 'snowball', 'the whole world freezes over'); }
        }
        const T = tempOf(t, pBg, pCO2, extra, snow);
        const habitable = !snow && T > 273 && T < 330;
        if (habitable && tHab == null) tHab = t;
        if (record && i % OUT_EVERY === 0) {
          series.t.push(t); series.T.push(T); series.pCO2.push(pCO2); series.pO2.push(pO2); series.P.push(pBg + pCO2);
          series.ocean.push(ocean_now); series.ice.push(snow ? 1 : dm.clamp((278 - T) / 30, 0, 1));
          series.snowball.push(snow ? 1 : 0); series.mobile.push(t < tPlatesStop ? 1 : 0); series.dynamo.push(t < tDynamo ? 1 : 0);
          series.outgas.push(V / Vnow); series.plants.push(bio > 1 ? 1 : 0);
          series.rain.push(snow ? 0.05 : dm.exp(0.07 * (T - T_now)));
        }
      }
      return tHab;
    };
    const tHab = run(false, false) ?? 0.2;
    if (level >= 1) {
      // fit the milestones before the present (squeezed if the draws run long)
      const o = tHab + rng.range(0.05, 0.5);
      let gaps = [rng.range(0.2, 1.0), rng.range(0.2, 0.8), rng.range(0.8, 1.6), rng.range(0.05, 0.25)]; // photo, GOE, complex, plants
      const need = level >= 3 ? 4 : level === 2 ? 4 : 2; // flora: plants without animals (the complex step skipped below)
      const span = gaps.slice(0, need).reduce((a, b) => a + b, 0);
      const room = (age - 0.03) - o;
      const k = span > room ? room / span : 1;
      gaps = gaps.map((g) => g * k);
      life.origin = Math.min(o, age - 0.04);
      life.photosynthesis = life.origin + gaps[0];
      life.oxygenation = life.photosynthesis + gaps[1];
      if (level >= 2) {
        const c = life.oxygenation + gaps[2];
        if (level >= 3) life.complex = c;
        life.plants = c + gaps[3];
      }
      ev(life.origin, 'life', 'life arises in the sea');
      ev(life.photosynthesis, 'photosynthesis', 'microbes learn to split water for light: oxygen');
      ev(life.oxygenation, 'oxygenation', 'oxygen builds in the air; the methane greenhouse fades');
      if (life.complex != null) ev(life.complex, 'complex', 'complex, many-celled life');
      if (life.plants != null) ev(life.plants, 'plants', 'plants cover the land');
    } else {
      life.never = true;
      ev(tHab, 'habitable', 'warm enough for liquid seas (no life ever takes hold)');
    }
    run(true, true);
    const result = finish({ age, series, events, tier, life, tPlatesStop, tDynamo, type });
    return result;
  }

  // ---- other worlds: simpler stories (to be filled out: WORLDSIM.md step 2)
  const life = { level: LEVELS[level], never: level === 0 };
  if (type === 'venus') {
    // early on, under the faint young sun, below the runaway: seas for a while
    const sRun = hzSeff('runaway', star.teff);
    let tRunaway = 0;
    for (let i = 0; i <= N; i++) { if (S_now * lum(i * DT) > sRun) { tRunaway = i * DT; break; } }
    if (tRunaway > 0.2 && body.comp.water > 1e-5) {
      ev(0.15, 'seas', 'shallow seas under a faint young sun');
      if (rng.next() < 0.3) { life.extinct = true; life.never = false; ev(Math.min(tRunaway - 0.05, 0.15 + rng.range(0.1, 0.6)), 'life', 'life arises in the early seas'); }
      ev(tRunaway, 'runaway', 'the brightening sun boils the seas; the water is lost to space');
      if (life.extinct) ev(tRunaway, 'extinction', 'life is snuffed out');
    } else ev(0.05, 'runaway', 'too hot for seas from the start');
    tPlatesStop = Math.min(tPlatesStop, tRunaway + 0.2);
    let tr = age - rng.range(0.3, 0.8);
    ev(tr, 'resurfacing', 'a pulse of volcanism floods the whole surface');
  } else if (type === 'mars' || (type === 'none' && massE > 0.05)) {
    if (body.comp.water > 1e-5) {
      const wet = Math.min(tDynamo + 0.4, age * 0.5);
      ev(0.1, 'seas', 'rivers, lakes and perhaps a northern sea under a thicker air');
      if (rng.next() < 0.2) { life.extinct = true; life.never = false; ev(0.3, 'life', 'microbes in the early waters'); }
      ev(tDynamo, 'dynamo', 'the core cools and the magnetic field dies');
      ev(wet, 'drying', 'the solar wind strips the air; the water freezes into the ground or is lost');
    } else ev(tDynamo, 'dynamo', 'the magnetic field dies');
  } else if (type === 'none') {
    ev(Math.min(age, 0.6 + massE * 20), 'volcanism ends', 'the small interior cools; the last lava floods the basins');
  }
  if (tPlatesStop > 0 && tPlatesStop < age) ev(tPlatesStop, 'plates stop', 'the plates lock into one shell (a stagnant lid)');
  return finish({ age, series, events, tier, life, tPlatesStop, tDynamo, type });
}

function finish(h) {
  h.events.sort((a, b) => a.t - b.t);
  const s = h.series;
  for (const k in s) s[k] = Float64Array.from(s[k]);
  h.activity = ACTIVITY_NAMES[h.tier];
  // the series at a time ago (Myr), linearly interpolated
  h.at = (agoMyr, key) => {
    const t = h.age - agoMyr / 1000, ts = s.t;
    if (!ts.length) return null;
    const x = (t - ts[0]) / (ts[1] - ts[0] || 1);
    const i = Math.max(0, Math.min(ts.length - 2, Math.floor(x))), f = Math.max(0, Math.min(1, x - i));
    return s[key][i] * (1 - f) + s[key][i + 1] * f;
  };
  h.summary = h.events.map((e) => `${fmtAgo(e.ago)}: ${e.text}`);
  return h;
}

function fmtAgo(g) { return g >= 1 ? `${g.toFixed(2)} Gyr ago` : g >= 0.001 ? `${Math.round(g * 1000)} Myr ago` : 'now'; }
