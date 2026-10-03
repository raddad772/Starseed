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
import { MATERIALS } from './materials.js';

// (each liquid's properties are in materials.js: triple point Tt, Pt; critical
// temperature Tc; boiling or sublimation point Tb at 1 atm; heat of vaporisation L;
// density rho; colours)
export const SUBSTANCES = Object.fromEntries(Object.entries(MATERIALS).filter(([, m]) => m.kind === 'liquid' && m.Tb));

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
// how far under the mean the coldest ground is (K): the polar night, colder the thinner the
// air (which carries less of the day side's heat to it): ~9% under it in a bar or more (Earth's
// poles, ~25 K), ~30% in a few thousandths of one (Mars' caps ~148 K under a 210 K mean); and a
// column heavier than Earth's evens it out further (Titan's ten times Earth's air per m^2: its
// poles ~3-4 K under its equator; Venus' none)
export function coldTrapK(T, P, g = 9.81) {
  const col = P / Math.max(g, 0.1) * 9.81;   // (its air per m^2, x Earth's)
  return T * (0.087 * Math.min(1, 1 / Math.sqrt(Math.max(col, 1e-9))) + 0.21 * (1 - dm.clamp((dm.log10(Math.max(P, 1e-6)) + 2.2) / 2.2, 0, 1)));
}

export function surfaceLiquids(inv, T, P, g) {
  const out = [], gas = {}, tCold = T - coldTrapK(T, P, g);
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
