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
import { hashInts } from '../../core/rng.js';
import { VEXAG, craterForm, craterDh } from '../craters.js';

export { VEXAG };
const MOON_G = 1.62;

// the smallest crater (m across as drawn, a power of two) a grid of cells cellM apart draws
// round: k of its cells across. The world sim's grid keeps those of WORLD_CELLS and more; each
// finer level of the terrain adds those of TILE_CELLS of its own cells up to the level above's
// floor (craters.js): so a crater too small for a grid's cells is drawn by a level that holds it
export const WORLD_CELLS = 16, TILE_CELLS = 10;
export function craterFloor(cellM, k) { let D = 1; while (D < k * cellM) D *= 2; return D; }
// (the world sim's cells, nominally: its faces' arc over N)
export const worldCell = (R, N) => dm.PI / 2 * R / N;

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
    this._rejects = 0;
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
    return this.n1(tGyr) / (Dm * Dm) * this.areaKm2 * 1e-3 * this.rate;
  }
  // (the lunar flux N(D >= 1 km) per km^2 per Gyr then, with the system's spike)
  n1(tGyr) {
    let n1 = tGyr == null ? 8.38e-4 : Impacts.fluxN1(tGyr);
    if (this.spike && tGyr != null) { const u = (tGyr - this.spike.atGyr) / this.spike.widthGyr; n1 += 8.38e-4 * this.spike.strength * 40 * dm.exp(-0.5 * u * u); }
    return n1;
  }
  // the craters a dt Myr at tGyr leave on the ground as drawn: N(>= D) per m^2 is this / D^2
  // (D in m as drawn; the real count per km^2, n1 sizeK^2 / D(km)^2, is the same number at the
  // drawn scale, widths and areas shrinking together)
  density(dt, tGyr) { return this.n1(tGyr) * dt * 1e-3 * this.sizeK * this.sizeK * this.rate; }

  // dt Myr of impacts, craters at least dMin km across as drawn (game km);
  // apply(cell, dh) adds relief. tGyr: when, since the world formed (omit:
  // today's rate). Returns the craters made.
  step(dt, dMin, apply, t = 0, tGyr) {
    const D0 = Math.max(dMin / this.scale, this.dAir); // (real km)
    const lam = this.ratePerMyr(D0, tGyr) * dt;
    const made = [];
    let k = poisson(this.rng, lam);
    while (k-- > 0) {
      // (sizes past the largest a world can take are drawn again, not piled at the limit)
      const Dmax = this.G.R / this.scale / 1000 * 0.6;
      let D = D0 / Math.sqrt(1 - this.rng.next());
      if (D > Dmax) { k++; if (++this._rejects > 1e6) break; continue; }
      const at = this.rng.unitVector();
      this.stamp(at, D, apply);
      const e = { t, D, at };
      made.push(e); this.events.push(e);
    }
    return made;
  }

  // a crater of D km (real) at direction `at`: drawn at the scaled width, real depth, in its
  // own form (craters.js: its impact's angle and heading, its rim's slumps, its peak's knobs)
  stamp(at, D, apply) {
    const G = this.G;
    const Dd = D * 1000 * this.scale, key = hashInts(Math.round(at[0] * 1e7), Math.round(at[1] * 1e7), Math.round(at[2] * 1e7), Math.round(D * 1000));
    const F = craterForm(Dd, { g: this.g, scale: this.scale }, key);
    const reach = 3 * (Dd / 2) * F.reach / G.R;               // angle
    // (the tangent frame at its centre: each cell's bearing from it)
    const ref = Math.abs(at[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
    let ex = ref[1] * at[2] - ref[2] * at[1], ey = ref[2] * at[0] - ref[0] * at[2], ez = ref[0] * at[1] - ref[1] * at[0];
    const el = Math.sqrt(ex * ex + ey * ey + ez * ez); ex /= el; ey /= el; ez /= el;
    const nx = at[1] * ez - at[2] * ey, ny = at[2] * ex - at[0] * ez, nz = at[0] * ey - at[1] * ex;
    const c0 = G.cellAt(at[0], at[1], at[2]);
    // the cells within reach (breadth first from the centre)
    const seen = new Set([c0]), q = [c0], d = G.dir;
    for (let i = 0; i < q.length; i++) {
      const c = q[i], dx = d[c * 3], dy = d[c * 3 + 1], dz = d[c * 3 + 2];
      const ang = dm.acos(Math.min(1, dx * at[0] + dy * at[1] + dz * at[2]));
      if (ang > reach && c !== c0) continue;
      apply(c, craterDh(F, ang * G.R, dx * ex + dy * ey + dz * ez, dx * nx + dy * ny + dz * nz));
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
