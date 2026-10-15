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
// A slope facing the pole is a band of its own: the sun of the latitude it faces (its plane's day, cut
// by the horizon's), the dust's scattered light from the sky it sees, the warm ground round it (its glow
// and its reflected sun). Mars' pole-facing slopes of 20-30 degrees keep frost to ~34 S in winter and
// none nearer the equator (Vincendon et al. 2010); read at the latitude a slope faces, as before, the
// frost on a crater wall reached 21 N.
// World state: from the body's orbit, spin and air alone, alike on every client (dmath).
import * as dm from '../core/dmath.js';

// the table: FROST_NL bands of latitude (south to north) by FROST_NS steps of the solar longitude (from
// the northern spring equinox), the frost's mass (kg/m2), for each of FROST_TILTS (degrees toward the
// pole; under 0 toward the equator)
export const FROST_NL = 180, FROST_NS = 120, FROST_TILTS = [-40, -30, -20, -10, 0, 10, 20, 30, 40];
const SIGMA = 5.670e-8, S_EARTH = 1361;
// (CO2: its latent heat of sublimation, J/kg; its frost's albedo and emissivity, Mars' seasonal caps
// ~0.5-0.7 and ~0.8; a dusty ground's albedo and emissivity; the ground's thermal inertia, J m-2 K-1
// s-1/2, Mars' mean ~250)
const L_CO2 = 5.9e5, A_FROST = 0.6, E_FROST = 0.8, A_GROUND = 0.25, E_GROUND = 0.95, INERTIA = 250;

// CO2's frost point at partial pressure p (Pa): Brown and Ziegler 1980's fit (Mars' 610 Pa: 146 K)
export const co2Frost = (p) => 3167.8 / (28.12 - dm.log(Math.max(p, 1e-3)));

// (the day's mean sun on a plane facing a latitude of sine sp, cosine cp where the sun's declination has
// sine sd, cosine cd, between hour angles -hs and hs; the half day at a latitude of tangent tp, the
// declination's tangent td)
const daySun = (S, sp, cp, sd, cd, hs) => Math.max(0, S / dm.PI * (hs * sp * sd + cp * cd * dm.sin(hs)));
const dayLength = (tp, td) => { const x = -tp * td; return x >= 1 ? 0 : x <= -1 ? dm.PI : dm.acos(x); };

// the seasonal caps of a world (o: climate.js climateOpts: S, obliquity, ecc, perihelion, yearDays,
// locked; pCO2: its CO2's partial pressure, Pa; dust: its aerosols at green, { tau, ssa, g }), or null
// where none forms. Three years from bare ground, the last kept
export function frostCaps(o, pCO2, dust) {
  if (o.locked || !(pCO2 > 1)) return null;
  const Tf = co2Frost(pCO2), S0 = o.S * S_EARTH, obl = o.obliquity || 0, e = Math.min(o.ecc || 0, 0.9), peri = o.perihelion || 0;
  const year = (o.yearDays || 365.25) * 86400, C = INERTIA * dm.sqrt(year / dm.PI);
  const NL = FROST_NL, NS = FROST_NS, NT = FROST_TILTS.length, N = NL * NT, SUB = 6, steps = NS * SUB;
  const out = new Float32Array(N * NS);
  // (each band's latitude, and the latitude its plane faces: tilted toward its pole, short of it; their
  // sines, cosines and tangents)
  const sp = new Float64Array(NL), cp = new Float64Array(NL), tp = new Float64Array(NL);
  const se = new Float64Array(N), ce = new Float64Array(N), te = new Float64Array(N), fv = new Float64Array(N), fs = new Float64Array(N);
  for (let t = 0; t < NT; t++) for (let j = 0; j < NL; j++) {
    const i = t * NL + j, p = ((j + 0.5) / NL - 0.5) * dm.PI, b = FROST_TILTS[t] * dm.PI / 180;
    const pe = dm.clamp(p + (p < 0 ? -b : b), -dm.PI / 2 + 1e-6, dm.PI / 2 - 1e-6);
    if (t === 0) { sp[j] = dm.sin(p); cp[j] = dm.cos(p); tp[j] = dm.tan(p); }
    se[i] = dm.sin(pe); ce[i] = dm.cos(pe); te[i] = dm.tan(pe);
    // (the share of what it sees that's the ground round it, and the sky's)
    fv[i] = (1 - dm.cos(b)) / 2; fs[i] = 1 - fv[i];
  }
  // (the dust's light: delta-Eddington, its forward peak (g^2 of what it scatters) with the sun's beam,
  // the rest from the whole sky, half of it down)
  const d = dust || { tau: 0, ssa: 1, g: 0 }, g2 = d.g * d.g, tauD = d.tau * (1 - d.ssa * g2), ssaD = d.ssa * (1 - g2) / Math.max(1e-6, 1 - d.ssa * g2);
  const T = new Float64Array(N), M = new Float64Array(N);
  // (the ground starts at what the year's mean sun holds it at)
  for (let i = 0; i < N; i++) T[i] = Math.max(Tf, dm.pow((1 - A_GROUND) * S0 * 0.3 * Math.max(cp[i % NL], 0.05) / (E_GROUND * SIGMA), 0.25));
  const h0 = new Float64Array(NL), qf = new Float64Array(NL), sD = new Float64Array(NL);
  const glowF = E_FROST * SIGMA * Tf * Tf * Tf * Tf;
  let any = false;
  for (let y = 0; y < 3; y++) for (let k = 0; k < steps; k++) {
    // (a step of the solar longitude, and the time it takes: slower far from the star)
    const L = dm.TWO_PI * (k + 0.5) / steps, nu = L - peri, rr = (1 - e * e) / (1 + e * dm.cos(nu));
    const dt = year / steps * rr * rr / dm.sqrt(1 - e * e), S = S0 / (rr * rr);
    const sd = dm.sin(obl) * dm.sin(L), cd = dm.sqrt(1 - sd * sd), td = sd / cd;
    // (the day's mean sun on level ground, and the share of it come down scattered by the day's mean height
    // of the sun)
    for (let j = 0; j < NL; j++) {
      h0[j] = dayLength(tp[j], td); qf[j] = daySun(S, sp[j], cp[j], sd, cd, h0[j]);
      const mu = h0[j] > 0 ? Math.max(0.05, qf[j] * dm.PI / (S * h0[j])) : 1, Td = dm.exp(-tauD / mu);
      sD[j] = Td / Math.max(1e-9, Td + (1 - Td) * ssaD * 0.5);
    }
    // (level ground first: the slopes see it)
    for (let t0 = NT >> 1, t = 0; t < NT; t++) {
      const tt = t === 0 ? t0 : t <= t0 ? t - 1 : t;
      for (let j = 0; j < NL; j++) {
        const i = tt * NL + j, f = t0 * NL + j;
        let q = qf[j], ir = 0;
        if (tt !== t0) {
          // (the slope's: its own plane's day within the horizon's, the sky it sees; the ground round it, its
          // glow and the sun it throws back)
          const qs = daySun(S, se[i], ce[i], sd, cd, Math.min(h0[j], dayLength(te[i], td)));
          const fr = M[f] > 0, Tg = T[f];
          q = sD[j] * qs + (1 - sD[j]) * q * fs[i] + fv[i] * (fr ? A_FROST : A_GROUND) * q;
          ir = fv[i] * (fr ? E_FROST : E_GROUND) * SIGMA * Tg * Tg * Tg * Tg;
        }
        if (M[i] > 0) {
          // (frost on it: the ground at the frost point, the frost's balance gained or lost to the air)
          M[i] = Math.max(0, M[i] + (glowF - (1 - A_FROST) * q - E_FROST * ir) * dt / L_CO2);
          T[i] = Tf;
        } else {
          // (bare: the slab warms and cools, in a few pieces so its own time (~a week) is followed)
          let tg = T[i];
          for (let s = 0; s < 4; s++) tg += ((1 - A_GROUND) * q + E_GROUND * ir - E_GROUND * SIGMA * tg * tg * tg * tg) * dt / 4 / C;
          if (tg < Tf) { M[i] = (Tf - tg) * C / L_CO2; tg = Tf; }
          T[i] = tg;
        }
        if (y === 2 && k % SUB === SUB / 2) { out[i * NS + (k - SUB / 2) / SUB] = M[i]; if (M[i] > 0) any = true; }
      }
    }
  }
  return any ? { kg: out, Tf } : null;
}

// the table as a texture's bytes (FROST_NS wide, by the solar longitude; FROST_NL high, south to north, for
// each tilt in turn): sqrt(kg / 2000), so the thin frost at a cap's edge keeps its steps
export function frostPixels(f) {
  const px = new Uint8Array(f.kg.length);
  for (let i = 0; i < px.length; i++) px[i] = Math.min(255, Math.round(255 * Math.sqrt(f.kg[i] / 2000)));
  return px;
}
