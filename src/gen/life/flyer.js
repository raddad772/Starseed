// A flyer's design (LIFE.md 4: Dave, "don't forget birds"): its world's land plan taken to the air
// (biosphere.js flight: small flyers off the land's grazers, big ones after them, where the air bears
// wings for its gravity). A two-sided plan flies on its front limb pair grown into wings, its other legs
// tucked; a radial one on a ring of flaps round its hub, beating in a wave. Sized by the physics of
// flight: wing loading (weight over area) held to what its air can lift at its speed (lift ~ rho v^2 S:
// thin air or a heavy pull, bigger wings), span from mass (Rayner 1988: ~1.2 M^0.39 m), a beat that
// slows as it grows (Pennycuick 2008: f ~ M^(1/3) g^(1/2) b^-1 S^-1/4 rho^-1/3) and a cruise that
// quickens (~10 M^(1/6) m/s: a sparrow's ~7, a goose's ~15). Big flyers soar (circling on rising air,
// a beat now and then); small ones flap and glide in bursts. Its line's traits (lineage.js) as a walker's: its colours, its tail.
// World state (dmath).
import * as dm from '../../core/dmath.js';
import { Rng } from '../../core/rng.js';

// plan: the land's; size 'small' | 'large'; g (m/s2); rho (kg/m3, its air at the ground); palette;
// key; traits (lineage.js) or none
export function designFlyer(plan, size, g, rho, palette, key, traits = null) {
  const rng = Rng.fromString(`flyer|${key}`);
  const T = traits || Float64Array.from({ length: 10 }, () => rng.normal(0, 0.5));
  const gR = dm.clamp(g / 9.81, 0.15, 4), rR = dm.clamp(rho / 1.225, 0.05, 20);
  const massKg = (size === 'large' ? rng.logUniform(2, 12) : rng.logUniform(0.015, 0.4)) * dm.exp(0.3 * T[0]) / dm.pow(gR, 0.8) * dm.pow(rR, 0.4);
  // (its span: an Earth bird's for its mass, wider where its wings must carry more on less air)
  const load = dm.sqrt(gR / rR);
  const span = 1.17 * dm.pow(massKg, 0.39) * dm.clamp(dm.pow(load, 0.5), 0.5, 3) * (size === 'large' ? 1.25 : 1);
  const len = span * (size === 'large' ? 0.42 : 0.5);
  const chord = span * (size === 'large' ? 0.13 : 0.18) * dm.exp(0.1 * T[2]);
  const radial = plan.symmetry > 2;
  const flapHz = dm.clamp(3.9 * dm.pow(massKg, -0.27) * dm.sqrt(gR) * dm.pow(rR, -1 / 3), 1, 25);
  const cruise = 10 * dm.pow(massKg, 1 / 6) * dm.sqrt(load);
  // its body, colours (a grazer's countershading: paler beneath, for what looks up at it)
  const mix = (a, b, k) => a.map((x, i) => x + (b[i] - x) * k);
  const base = mix(palette.veg, palette.dry, dm.clamp(0.5 + 0.3 * T[6], 0.05, 1)), dark = dm.clamp(0.9 * dm.exp(-0.3 * T[7]), 0.4, 1.3);
  const coat = { back: base.map((x) => x * dark), belly: mix(base, [0.7, 0.68, 0.62], 0.55), mark: base.map((x) => x * dark * 0.4), pattern: T[8] > 0.4 ? 'bands' : 'plain' };
  const tail = radial ? 0 : len * dm.clamp(0.35 + 0.25 * T[5], 0.1, 0.9);
  const wings = radial ? Math.max(3, plan.symmetry) : 2;
  return { key, size, radial, massKg, span, len, chord, body: { r: len * (radial ? 0.3 : 0.14), h: len * (radial ? 0.12 : 0.13) }, head: radial ? null : { r: len * 0.1, z: -len * 0.55 }, tail, wings, coat,
    flapHz, cruise, soar: size === 'large', eyes: radial ? Math.min(plan.eyes, 8) : 2 };
}
