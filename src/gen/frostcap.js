// A thin air that freezes out at its poles: Mars' seasonal caps. Its CO2 condenses where the ground can't
// stay above the gas's frost point through the winter (its night months: the polar night, then the low
// sun), a metre or so of it at the pole by the winter's end, and goes back to the air in the spring sun.
// A band of latitude at a time through the year (Leighton and Murray 1966, one layer): the ground a slab
// holding a season's heat (its thermal inertia over the year's skin depth), warmed by the day's mean sun
// (the orbit's eccentricity, its spin axis' tilt), cooling by its own glow; where it falls to the frost
// point it holds there, and what it can't hold freezes the gas out of the air (its latent heat). Frost
// is brighter than the ground, so once laid it keeps itself a while (the caps' edges lag the sun). The
// air's own heat (a thin air carries little) and its pressure's swing (a quarter of Mars' air goes into
// its caps) are left out.
// World state: from the body's orbit, spin and air alone, alike on every client (dmath).
import * as dm from '../core/dmath.js';

// the table: FROST_NL bands of latitude (south to north) by FROST_NS steps of the solar longitude (from
// the northern spring equinox), the frost's mass (kg/m2)
export const FROST_NL = 180, FROST_NS = 120;
const SIGMA = 5.670e-8, S_EARTH = 1361;
// (CO2: its latent heat of sublimation, J/kg; its frost's albedo and emissivity, Mars' seasonal caps
// ~0.5-0.7 and ~0.8; a dusty ground's albedo and emissivity; the ground's thermal inertia, J m-2 K-1
// s-1/2, Mars' mean ~250)
const L_CO2 = 5.9e5, A_FROST = 0.6, E_FROST = 0.8, A_GROUND = 0.25, E_GROUND = 0.95, INERTIA = 250;

// CO2's frost point at partial pressure p (Pa): Brown and Ziegler 1980's fit (Mars' 610 Pa: 146 K)
export const co2Frost = (p) => 3167.8 / (28.12 - dm.log(Math.max(p, 1e-3)));

// the seasonal caps of a world (o: climate.js climateOpts: S, obliquity, ecc, perihelion, yearDays,
// locked; pCO2: its CO2's partial pressure, Pa), or null where none forms. Three years from bare ground,
// the last kept
export function frostCaps(o, pCO2) {
  if (o.locked || !(pCO2 > 1)) return null;
  const Tf = co2Frost(pCO2), S0 = o.S * S_EARTH, obl = o.obliquity || 0, e = Math.min(o.ecc || 0, 0.9), peri = o.perihelion || 0;
  const year = (o.yearDays || 365.25) * 86400, C = INERTIA * dm.sqrt(year / dm.PI);
  const NL = FROST_NL, NS = FROST_NS, SUB = 6, steps = NS * SUB;
  const out = new Float32Array(NL * NS), sinLat = new Float64Array(NL), cosLat = new Float64Array(NL), tanLat = new Float64Array(NL);
  for (let j = 0; j < NL; j++) { const ph = ((j + 0.5) / NL - 0.5) * dm.PI; sinLat[j] = dm.sin(ph); cosLat[j] = dm.cos(ph); tanLat[j] = dm.tan(ph); }
  const T = new Float64Array(NL), M = new Float64Array(NL);
  // (the ground starts at what the year's mean sun holds it at)
  for (let j = 0; j < NL; j++) T[j] = Math.max(Tf, dm.pow((1 - A_GROUND) * S0 * 0.3 * Math.max(cosLat[j], 0.05) / (E_GROUND * SIGMA), 0.25));
  const glowF = E_FROST * SIGMA * Tf * Tf * Tf * Tf;
  let any = false;
  for (let y = 0; y < 3; y++) for (let k = 0; k < steps; k++) {
    // (a step of the solar longitude, and the time it takes: slower far from the star)
    const L = dm.TWO_PI * (k + 0.5) / steps, nu = L - peri, rr = (1 - e * e) / (1 + e * dm.cos(nu));
    const dt = year / steps * rr * rr / dm.sqrt(1 - e * e), S = S0 / (rr * rr);
    const sd = dm.sin(obl) * dm.sin(L), cd = dm.sqrt(1 - sd * sd), td = sd / cd;
    for (let j = 0; j < NL; j++) {
      // (the day's mean sun on level ground)
      const x = -tanLat[j] * td, h0 = x >= 1 ? 0 : x <= -1 ? dm.PI : dm.acos(x);
      const q = Math.max(0, S / dm.PI * (h0 * sinLat[j] * sd + cosLat[j] * cd * dm.sin(h0)));
      if (M[j] > 0) {
        // (frost on it: the ground at the frost point, the frost's balance gained or lost to the air)
        M[j] = Math.max(0, M[j] + (glowF - (1 - A_FROST) * q) * dt / L_CO2);
        T[j] = Tf;
      } else {
        // (bare: the slab warms and cools, in a few pieces so its own time (~a week) is followed)
        let t = T[j];
        for (let s = 0; s < 4; s++) t += ((1 - A_GROUND) * q - E_GROUND * SIGMA * t * t * t * t) * dt / 4 / C;
        if (t < Tf) { M[j] = (Tf - t) * C / L_CO2; t = Tf; }
        T[j] = t;
      }
      if (y === 2 && k % SUB === SUB / 2) { out[j * NS + (k - SUB / 2) / SUB] = M[j]; if (M[j] > 0) any = true; }
    }
  }
  return any ? { kg: out, Tf } : null;
}

// the table as a texture's bytes (FROST_NS wide, by the solar longitude; FROST_NL high, south to north):
// sqrt(kg / 2000), so the thin frost at a cap's edge keeps its steps
export function frostPixels(f) {
  const px = new Uint8Array(FROST_NL * FROST_NS);
  for (let i = 0; i < px.length; i++) px[i] = Math.min(255, Math.round(255 * Math.sqrt(f.kg[i] / 2000)));
  return px;
}
