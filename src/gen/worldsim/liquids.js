// What pools or freezes on a world's surface (WORLDSIM.md 16): any substance the
// world has more of than its vapour pressure at the surface temperature allows in
// the air condenses. It's a liquid between its triple point and its critical point
// (if the air is thick enough: CO2 needs 5 bar), ice below the triple point, and
// past the critical point it's all gas. Broad curves: vapour pressure by
// Clausius-Clapeyron through each substance's normal boiling point (or, for CO2,
// its sublimation point).
//
// So Titan's methane and ethane lakes, nitrogen seas on worlds cold enough with
// nitrogen enough, CO2 seas under thick cold CO2 air, ammonia-water seas below
// water's freezing point, frosts of SO2 on a volcanic moon, molten sulfur on hot
// volcanic worlds, and lava. (Mercury can't pool: rock holds ~1e-7 of it, bound to
// sulfur.)

import * as dm from '../../core/dmath.js';

// Tt, Pt: triple point (K, bar); Tc: critical temperature (K); Tb: boiling (or for CO2,
// sublimation) point at 1 atm (K); L: heat of vaporisation (kJ/mol); rho: liquid
// density (kg/m^3); deep, shallow: the colours of the liquid (sRGB)
export const SUBSTANCES = {
  water:    { Tt: 273.16, Pt: 0.006, Tc: 647, Tb: 373.15, L: 40.7, rho: 1000, deep: '#0b2a4a', shallow: '#1f7f8f' },
  // (water with ~10% ammonia: liquid down to ~240 K; the eutectic, 33%, to 176 K)
  'ammonia-water': { Tt: 240, Pt: 0.001, Tc: 600, Tb: 370, L: 40, rho: 950, deep: '#1a2c3a', shallow: '#4f7f86' },
  CO2:      { Tt: 216.6, Pt: 5.18, Tc: 304.1, Tb: 194.7, L: 26.1, rho: 1100, deep: '#22303a', shallow: '#7d96a3' },
  nitrogen: { Tt: 63.15, Pt: 0.125, Tc: 126.2, Tb: 77.4, L: 5.57, rho: 808, deep: '#2a3644', shallow: '#93a8ba' },
  methane:  { Tt: 90.7, Pt: 0.117, Tc: 190.6, Tb: 111.7, L: 8.19, rho: 422, deep: '#1d1712', shallow: '#3a2e22' },
  ethane:   { Tt: 90.4, Pt: 1.1e-5, Tc: 305.3, Tb: 184.6, L: 14.7, rho: 545, deep: '#1d1712', shallow: '#3a2e22' },
  ammonia:  { Tt: 195.4, Pt: 0.061, Tc: 405.5, Tb: 239.8, L: 23.3, rho: 682, deep: '#1b2630', shallow: '#6f8790' },
  SO2:      { Tt: 197.6, Pt: 0.0167, Tc: 430.7, Tb: 263.1, L: 24.9, rho: 1460, deep: '#3a3418', shallow: '#a89a52' },
  sulfur:   { Tt: 388, Pt: 1e-5, Tc: 1314, Tb: 717.8, L: 45, rho: 1820, deep: '#3a1a08', shallow: '#c4661c' },
};

// vapour pressure (bar) of a substance at T K
export function pSat(name, T) {
  const s = SUBSTANCES[name];
  return 1.013 * dm.exp(s.L * 1000 / 8.314 * (1 / s.Tb - 1 / Math.max(T, 1)));
}

// inv: { substance: what the world has of it, in bar if it were all in the air };
// T (K, the mean at the surface), P (bar of air), g (m/s^2). A little of something
// collects where it's coldest (the cold trap, ~25 K under the mean: Titan's polar lakes,
// Mars' CO2 caps); a lot of it spreads over the world at the mean (Earth's oceans).
// Liquid only down to where the pressure turns it to high-pressure ice (~1 GPa).
// Returns what condenses, most first: [{ name, phase: 'liquid' | 'ice', bar, depthM
// (as a global layer), hpIceM (high-pressure ice beneath) }] and `gas`: what stays in
// the air of each (bar)
export function surfaceLiquids(inv, T, P, g) {
  const out = [], gas = {}, tCold = T - 25;
  for (const name in inv) {
    const s = SUBSTANCES[name], have = inv[name];
    if (!s || !(have > 0)) continue;
    if (T >= s.Tc) { gas[name] = have; continue; }        // (past its critical point: all gas)
    const air = Math.min(have, pSat(name, tCold));
    gas[name] = air;
    const bar = have - air;
    if (bar < 1e-7) continue;
    let depthM = bar * 1e5 / (g * s.rho);
    const where = depthM > 100 ? T : tCold;
    const phase = where >= s.Tt && where < s.Tc && Math.max(P, air) >= s.Pt ? 'liquid' : 'ice';
    let hpIceM = 0;
    const maxM = 1e9 / (g * s.rho);
    if (phase === 'liquid' && depthM > maxM) { hpIceM = depthM - maxM; depthM = maxM; }
    out.push({ name, phase, bar, depthM, hpIceM });
  }
  out.sort((a, b) => b.depthM - a.depthM);
  return { pools: out, gas };
}

// the world's main surface liquid (none if only ices): its name and global depth
export function mainLiquid(pools) {
  const l = pools.find((p) => p.phase === 'liquid' && p.depthM > 0.05);
  return l || null;
}
