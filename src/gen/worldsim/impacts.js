// Impacts at the rate and sizes the Moon's crater record gives (the Neukum
// chronology's present-day rate: N(D >= 1 km) = 8.4e-4 per km^2 per Gyr, with
// cumulative counts falling as D^-2), scaled to a world's gravity (the same
// impactor digs a smaller crater under stronger gravity, ~g^-0.17), and
// filtered by its air (a thick atmosphere breaks up the small ones: Venus has
// no craters under ~3 km). At realistic rates a world this size gets only a
// few large craters in a few hundred million years, and erosion wears them
// down: as on Earth, it's airless worlds that keep them.
//
// Scale: the game draws worlds at 1/10 of their real size (units.js LEN_SCALE),
// So the crater population is drawn for the real world (its real area, real
// crater sizes) and each crater is drawn scaled down whole, keeping its shape
// with a little vertical exaggeration (VEXAG; the old terrain generator's
// craters were ~2x deeper than life too): real depths on scaled-down widths
// would make spikes.
//
// Craters are complex at these sizes: a flat floor, a central peak, terraced
// walls up to a raised rim, and an ejecta blanket thinning outward. Depths
// follow terrestrial complex craters (~0.17 D^0.43 km), deeper on weaker gravity.

import * as dm from '../../core/dmath.js';

const MOON_G = 1.62;
const VEXAG = 2.5;

export class Impacts {
  // G: SimGrid; opts: { rng, g (m/s^2), pressure (bar), rate: multiplier (1 = realistic:
  //   the system's debris level x local focusing), scale: game size / real size (default 0.1),
  //   spike: a late bombardment { atGyr, widthGyr, strength } (system.js systemDebris) }
  constructor(G, opts) {
    this.G = G;
    this.rng = opts.rng;
    this.g = opts.g || 9.81;
    this.rate = opts.rate ?? 1;
    this.scale = opts.scale ?? 0.1;
    this.spike = opts.spike || null;
    this.sizeK = dm.pow(MOON_G / this.g, 0.17);            // crater size vs the Moon's for the same impactor
    this.dAir = 0.03 * (opts.pressure || 0);                // km: smaller ones break up in the air
    const Rreal = G.R / this.scale / 1000;                  // km
    this.areaKm2 = 4 * dm.PI * Rreal * Rreal;
    this.events = [];
  }

  // the bombardment through time (Neukum's lunar chronology): craters >= 1 km
  // per km^2 per Gyr at t Gyr after the world formed: a heavy, fading early
  // flux (counted from ~4.3 Gyr before the Moon's present), then a steady rain
  static fluxN1(tGyr) {
    const tau = Math.max(0, 4.3 - tGyr);
    return 5.44e-14 * 6.93 * dm.exp(6.93 * tau) + 8.38e-4;
  }

  // expected craters with diameter >= D km (real) per Myr; tGyr: time since the
  // world formed (omit for today's rate)
  ratePerMyr(D, tGyr) {
    const Dm = D / this.sizeK; // the lunar crater the same impactors would make
    let n1 = tGyr == null ? 8.38e-4 : Impacts.fluxN1(tGyr);
    if (this.spike && tGyr != null) { const u = (tGyr - this.spike.atGyr) / this.spike.widthGyr; n1 += 8.38e-4 * this.spike.strength * 40 * dm.exp(-0.5 * u * u); }
    return n1 / (Dm * Dm) * this.areaKm2 * 1e-3 * this.rate;
  }

  // dt Myr of impacts, craters at least dMin km across as drawn (game km);
  // apply(cell, dh) adds relief. tGyr: when, since the world formed (omit:
  // today's rate). Returns the craters made.
  step(dt, dMin, apply, t = 0, tGyr) {
    const D0 = Math.max(dMin / this.scale, this.dAir); // (real km)
    const lam = this.ratePerMyr(D0, tGyr) * dt;
    const made = [];
    let k = poisson(this.rng, lam);
    while (k-- > 0) {
      const D = Math.min(D0 / Math.sqrt(1 - this.rng.next()), this.G.R / this.scale / 1000 * 0.6);
      const at = this.rng.unitVector();
      this.stamp(at, D, apply);
      const e = { t, D, at };
      made.push(e); this.events.push(e);
    }
    return made;
  }

  // a crater of D km (real) at direction `at`: drawn at the scaled width, real depth
  stamp(at, D, apply) {
    const G = this.G;
    const R = D / 2 * 1000 * this.scale;                     // m, as drawn
    const depth = 170 * dm.pow(D, 0.43) * dm.pow(9.81 / this.g, 0.6) * this.scale * VEXAG;
    const rim = 0.35 * depth, peak = D > 8 ? 0.3 * depth : 0;
    const reach = 3 * R / G.R;                               // angle
    const c0 = G.cellAt(at[0], at[1], at[2]);
    // the cells within reach (breadth first from the centre)
    const seen = new Set([c0]), q = [c0];
    for (let i = 0; i < q.length; i++) {
      const c = q[i];
      const d = G.dir;
      const cosA = d[c * 3] * at[0] + d[c * 3 + 1] * at[1] + d[c * 3 + 2] * at[2];
      const ang = dm.acos(Math.min(1, cosA));
      if (ang > reach && c !== c0) continue;
      const r = ang * G.R / R;                               // in crater radii
      let dh;
      if (r < 0.55) dh = -depth + peak * dm.exp(-(r / 0.15) * (r / 0.15));
      else if (r < 1) { const u = (r - 0.55) / 0.45; dh = -depth + (depth + rim) * u * u * (3 - 2 * u); }
      else dh = rim / (r * r * r);
      apply(c, dh);
      for (let e = G.nStart[c]; e < G.nStart[c + 1]; e++) { const o = G.nbr[e]; if (!seen.has(o)) { seen.add(o); q.push(o); } }
    }
  }
}

function poisson(rng, lam) {
  if (lam <= 0) return 0;
  if (lam > 30) return Math.max(0, Math.round(lam + Math.sqrt(lam) * gauss(rng)));
  const L = dm.exp(-lam);
  let k = 0, p = 1;
  do { k++; p *= rng.next(); } while (p > L);
  return k - 1;
}
function gauss(rng) { return Math.sqrt(-2 * dm.log(1 - rng.next())) * dm.cos(2 * dm.PI * rng.next()); }
