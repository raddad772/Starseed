// Colour science for generation (deterministic).

import * as dm from '../core/dmath.js';

// Wyman, Sloan & Shirley (2013) multi-lobe fit of the CIE 1931 2-degree observer.
function lobe(x, mu, s1, s2) { const t = (x - mu) / (x < mu ? s1 : s2); return dm.exp(-0.5 * t * t); }
export function cieXYZ(lambdaNm) {
  const l = lambdaNm;
  return [
    1.056 * lobe(l, 599.8, 37.9, 31.0) + 0.362 * lobe(l, 442.0, 16.0, 26.7) - 0.065 * lobe(l, 501.1, 20.4, 26.2),
    0.821 * lobe(l, 568.8, 46.9, 40.5) + 0.286 * lobe(l, 530.9, 16.3, 31.1),
    1.217 * lobe(l, 437.0, 11.8, 36.0) + 0.681 * lobe(l, 459.0, 26.0, 13.8),
  ];
}

export function xyzToLinearSRGB(X, Y, Z) {
  return [
    3.2406 * X - 1.5372 * Y - 0.4986 * Z,
    -0.9689 * X + 1.8758 * Y + 0.0415 * Z,
    0.0557 * X - 0.2040 * Y + 1.0570 * Z,
  ];
}

export function luminance(c) { return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }

function planck(lambdaNm, T) {
  const l = lambdaNm * 1e-9;
  const l5 = l * l * l * l * l;
  return 1 / (l5 * (dm.exp(0.014387769 / (l * T)) - 1));
}

// Linear-sRGB colour of a blackbody, normalised to unit luminance.
export function blackbodyRGB(T) {
  let X = 0, Y = 0, Z = 0;
  for (let l = 380; l <= 780; l += 5) {
    const b = planck(l, T);
    const c = cieXYZ(l);
    X += b * c[0]; Y += b * c[1]; Z += b * c[2];
  }
  const rgb = xyzToLinearSRGB(X, Y, Z);
  for (let i = 0; i < 3; i++) rgb[i] = Math.max(rgb[i], 0);
  const lum = luminance(rgb);
  return [rgb[0] / lum, rgb[1] / lum, rgb[2] / lum];
}

// sRGB hex -> linear rgb
export function hexToLinear(hex) {
  const v = parseInt(hex.replace('#', ''), 16);
  const c = [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  return c.map((x) => {
    const s = x / 255;
    return s <= 0.04045 ? s / 12.92 : dm.pow((s + 0.055) / 1.055, 2.4);
  });
}

export function mixRGB(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
export function scaleRGB(a, s) { return [a[0] * s, a[1] * s, a[2] * s]; }
export function mulRGB(a, b) { return [a[0] * b[0], a[1] * b[1], a[2] * b[2]]; }

// HSV (h in [0,1)) -> linear-ish rgb (treated as linear for palette work)
export function hsv(h, s, v) {
  h = h - Math.floor(h);
  const i = Math.floor(h * 6), f = h * 6 - i;
  const p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: return [v, t, p];
    case 1: return [q, v, p];
    case 2: return [p, v, t];
    case 3: return [p, q, v];
    case 4: return [t, p, v];
    default: return [v, p, q];
  }
}

// Perturb a linear colour slightly in hue/brightness (deterministic via rng)
export function jitterColor(rng, c, amount = 0.08) {
  const k = 1 + rng.range(-amount, amount);
  return [
    Math.max(0, c[0] * k * (1 + rng.range(-amount, amount))),
    Math.max(0, c[1] * k * (1 + rng.range(-amount, amount))),
    Math.max(0, c[2] * k * (1 + rng.range(-amount, amount))),
  ];
}
