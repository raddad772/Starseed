// Deterministic math.
//
// World generation must be bit-identical in every browser. IEEE-754 guarantees
// + - * / and sqrt are correctly rounded, but Math.exp/log/pow/sin/cos/atan are
// implementation-defined and differ between engines in the last ulp. A one-ulp
// difference can flip a threshold ("does this planet keep its atmosphere?") and
// cascade into a different solar system, so generation code uses these
// polynomial implementations built only from correctly-rounded primitives.
//
// Rendering code is free to use Math.* — only generated data must be exact.

const LN2_HI = 6.93147180369123816490e-01; // high 32 bits of ln2 (exact products for |k| < 2^20)
const LN2_LO = 1.90821492927058770002e-10;
const INV_LN2 = 1.44269504088896338700e+00;

export const PI = 3.141592653589793;
export const TWO_PI = 6.283185307179586;
export const HALF_PI = 1.5707963267948966;

// Exact powers of two by repeated doubling/halving (exact in binary floating point).
const POW2_OFF = 1075;
const POW2 = new Float64Array(2100);
{
  let v = 1;
  for (let k = 0; k <= 1023; k++) { POW2[POW2_OFF + k] = v; v *= 2; }
  v = 1;
  for (let k = 0; k >= -1074; k--) { POW2[POW2_OFF + k] = v; v *= 0.5; }
}

const _dv = new DataView(new ArrayBuffer(8));

export const sqrt = Math.sqrt; // correctly rounded by IEEE-754
export const floor = Math.floor;
export const abs = Math.abs;
export const min = Math.min;
export const max = Math.max;

export function exp(x) {
  if (x !== x) return NaN;
  if (x > 709.782712893384) return Infinity;
  if (x < -745.1332191019412) return 0;
  const k = Math.round(x * INV_LN2);
  const r = (x - k * LN2_HI) - k * LN2_LO; // |r| <= ~0.3466
  // Taylor series through r^14 (truncation error < 1e-17 on this interval)
  const p = 1 + r * (1 + r * (1 / 2 + r * (1 / 6 + r * (1 / 24 + r * (1 / 120 + r * (1 / 720 +
    r * (1 / 5040 + r * (1 / 40320 + r * (1 / 362880 + r * (1 / 3628800 + r * (1 / 39916800 +
    r * (1 / 479001600 + r * (1 / 6227020800 + r * (1 / 87178291200))))))))))))));
  if (k < -1022) return (p * POW2[POW2_OFF + k + 64]) * POW2[POW2_OFF - 64];
  if (k > 1023) return (p * POW2[POW2_OFF + k - 1]) * 2;
  return p * POW2[POW2_OFF + k];
}

export function log(x) {
  if (x !== x || x < 0) return NaN;
  if (x === 0) return -Infinity;
  if (x === Infinity) return Infinity;
  let e = 0;
  if (x < 2.2250738585072014e-308) { x *= 18014398509481984; e = -54; } // scale subnormals by 2^54
  _dv.setFloat64(0, x);
  const hi = _dv.getUint32(0);
  e += ((hi >>> 20) & 0x7ff) - 1023;
  _dv.setUint32(0, (hi & 0x000fffff) | 0x3ff00000);
  let m = _dv.getFloat64(0); // mantissa in [1,2)
  if (m > 1.4142135623730951) { m *= 0.5; e += 1; }
  const s = (m - 1) / (m + 1); // |s| <= 0.1716
  const s2 = s * s;
  const t = s2 * (1 / 3 + s2 * (1 / 5 + s2 * (1 / 7 + s2 * (1 / 9 + s2 * (1 / 11 + s2 * (1 / 13 +
    s2 * (1 / 15 + s2 * (1 / 17 + s2 * (1 / 19 + s2 * (1 / 21 + s2 * (1 / 23)))))))))));
  const lm = 2 * s + 2 * s * t;
  return e * LN2_HI + (lm + e * LN2_LO);
}

export function log10(x) { return log(x) * 0.4342944819032518; }
export function log2(x) { return log(x) * 1.4426950408889634; }

export function pow(x, y) {
  if (y === 0) return 1;
  if (x === 1) return 1;
  if (x !== x || y !== y) return NaN;
  if (x === 0) return y > 0 ? 0 : Infinity;
  if (x < 0) {
    const yi = Math.round(y);
    if (yi !== y) return NaN;
    const r = exp(y * log(-x));
    return (yi % 2 === 0) ? r : -r;
  }
  // small non-negative integer powers: repeated multiplication is exact-ish and fast
  if (y === 2) return x * x;
  if (y === 3) return x * x * x;
  if (y === 0.5) return Math.sqrt(x);
  return exp(y * log(x));
}

// x^m for one fixed m, fast, for x > 0 (normal numbers): x's power of two from its bits, its
// mantissa's power from a table (4096 steps, read between them), so a hot loop doesn't take an
// exp and a log a cell. Deterministic (table built with pow above; + * only after). Relative
// error ~1e-7
const _pf = new Float64Array(1), _pu = new Uint32Array(_pf.buffer);
export function powFixed(m) {
  const T = new Float64Array(4097), P2 = new Float64Array(2100);
  for (let k = 0; k <= 4096; k++) T[k] = pow(1 + k / 4096, m);
  for (let e = -1022; e <= 1023; e++) P2[e + 1075] = exp(e * m * 0.6931471805599453);
  return (x) => {
    _pf[0] = x;
    const e = ((_pu[1] >>> 20) & 0x7ff) - 1023;
    const f = (x * POW2[POW2_OFF - e] - 1) * 4096, k = Math.floor(f);
    return P2[e + 1075] * (T[k] + (T[k + 1] - T[k]) * (f - k));
  };
}

export function cbrt(x) { return x < 0 ? -pow(-x, 1 / 3) : pow(x, 1 / 3); }
// (Math.hypot isn't required to be correctly rounded: from + * and sqrt, which are)
export function hypot(x, y, z = 0) { return Math.sqrt(x * x + y * y + z * z); }

// fdlibm-style 3-part pi/2 for Cody-Waite argument reduction
const PIO2_1 = 1.57079632673412561417e+00;
const PIO2_2 = 6.07710050630396597660e-11;
const PIO2_2T = 2.02226624879595063154e-21;
const INV_PIO2 = 6.36619772367581382433e-01;

function sinPoly(r) { // |r| <= pi/4
  const r2 = r * r;
  return r * (1 - r2 * (1 / 6 - r2 * (1 / 120 - r2 * (1 / 5040 - r2 * (1 / 362880 - r2 * (1 / 39916800 -
    r2 * (1 / 6227020800 - r2 * (1 / 1307674368000 - r2 * (1 / 355687428096000)))))))));
}
function cosPoly(r) {
  const r2 = r * r;
  return 1 - r2 * (1 / 2 - r2 * (1 / 24 - r2 * (1 / 720 - r2 * (1 / 40320 - r2 * (1 / 3628800 -
    r2 * (1 / 479001600 - r2 * (1 / 87178291200 - r2 * (1 / 20922789888000 - r2 * (1 / 6402373705728000)))))))));
}

export function sin(x) {
  if (x !== x || x === Infinity || x === -Infinity) return NaN;
  const k = Math.round(x * INV_PIO2);
  const r = ((x - k * PIO2_1) - k * PIO2_2) - k * PIO2_2T;
  const q = ((k % 4) + 4) % 4;
  if (q === 0) return sinPoly(r);
  if (q === 1) return cosPoly(r);
  if (q === 2) return -sinPoly(r);
  return -cosPoly(r);
}

export function cos(x) {
  if (x !== x || x === Infinity || x === -Infinity) return NaN;
  const k = Math.round(x * INV_PIO2);
  const r = ((x - k * PIO2_1) - k * PIO2_2) - k * PIO2_2T;
  const q = ((k % 4) + 4) % 4;
  if (q === 0) return cosPoly(r);
  if (q === 1) return -sinPoly(r);
  if (q === 2) return -cosPoly(r);
  return sinPoly(r);
}

export function tan(x) { return sin(x) / cos(x); }

const TAN_PI_12 = 0.2679491924311227;
const SQRT3 = 1.7320508075688772;

export function atan(x) {
  if (x !== x) return NaN;
  let sign = 1;
  if (x < 0) { x = -x; sign = -1; }
  if (x === Infinity) return sign * HALF_PI;
  let inv = false;
  if (x > 1) { x = 1 / x; inv = true; }
  let off = 0;
  if (x > TAN_PI_12) { x = (x * SQRT3 - 1) / (x + SQRT3); off = 0.5235987755982988; }
  const x2 = x * x;
  let s = x * (1 - x2 * (1 / 3 - x2 * (1 / 5 - x2 * (1 / 7 - x2 * (1 / 9 - x2 * (1 / 11 - x2 * (1 / 13 -
    x2 * (1 / 15 - x2 * (1 / 17 - x2 * (1 / 19 - x2 * (1 / 21 - x2 * (1 / 23 - x2 * (1 / 25 - x2 / 27)))))))))))));
  s += off;
  if (inv) s = HALF_PI - s;
  return sign * s;
}

export function atan2(y, x) {
  if (x !== x || y !== y) return NaN;
  if (x > 0) return atan(y / x);
  if (x < 0) return y >= 0 ? atan(y / x) + PI : atan(y / x) - PI;
  if (y > 0) return HALF_PI;
  if (y < 0) return -HALF_PI;
  return 0;
}

export function asin(x) {
  if (x >= 1) return HALF_PI;
  if (x <= -1) return -HALF_PI;
  return atan2(x, Math.sqrt((1 - x) * (1 + x)));
}

export function acos(x) {
  if (x >= 1) return 0;
  if (x <= -1) return PI;
  return atan2(Math.sqrt((1 - x) * (1 + x)), x);
}

export function tanh(x) {
  if (x > 20) return 1;
  if (x < -20) return -1;
  const e2 = exp(2 * x);
  return (e2 - 1) / (e2 + 1);
}

export function clamp(x, a, b) { return x < a ? a : (x > b ? b : x); }
export function lerp(a, b, t) { return a + (b - a) * t; }
export function smoothstep(a, b, x) {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}
export function saturate(x) { return x < 0 ? 0 : (x > 1 ? 1 : x); }
