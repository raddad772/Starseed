// The food web on the map (LIFE.md 2): per climate cell, what its plants make and how many animals that
// feeds at each level, the energy pyramid's own rule (Dave: "about 10x as much energy for each level of
// the food pyramid, and each level should fill if it's had time to evolve, including predators-of-
// predators if life is rich enough"):
//   productivity  net primary productivity, Lieth's Miami model (1975: the lesser of warmth's and
//                 rain's limits, g of dry matter a m2 a year) x the plants' cover
//   levels        each a tenth of the energy of the one below (Lindeman 1942); a level stands here if
//                 the world's biosphere has evolved it (biosphere.js: the history's clock) and the
//                 country round can feed it: a level's animals range wider, so its energy is read
//                 over a wider neighbourhood (each level's range ~3x the one below's across), and it
//                 needs enough of it for a population that lasts
//   numbers       individuals a km2 from that energy over an animal's needs: field metabolic rate
//                 (Nagy 1987: 4.82 M^0.734 kJ a day, M in g; a cold-blooded one a tenth), half of what
//                 it eats assimilated, ~18 kJ a g of dry matter; a tenth of each level's energy to the
//                 big animals one sees (the rest to the small and the many). Their size from the
//                 ruling lineage's and the gravity (bigger where it's lighter)
// On the climate grid, from the snapshot (P, Tsea, cover, h); world state (dmath).
import * as dm from '../../core/dmath.js';
import { GridLite } from '../worldsim/grid.js';

export const LEVELS = 4;                    // over the plants: grazers, predators, their predators, apex
const SIZE_KG = { small: 5, mid: 60, large: 400, huge: 3000 };
const LEVEL_MASS = [0, 1, 0.5, 1, 2];        // (a level's animals against the grazers' size)
const BIG_SHARE = 0.1, VIABLE = 0.02;        // (individuals a km2 a level needs over its range to last)

// the Miami model: g dry matter / m2 / yr at mean temperature T (C) and rain P (mm a year)
export function miamiNPP(T, P) {
  const nT = 3000 / (1 + dm.exp(1.315 - 0.119 * T)), nP = 3000 * (1 - dm.exp(-0.000664 * Math.max(0, P)));
  return Math.max(0, Math.min(nT, nP));
}

// the food web per climate cell. snap: a world's snapshot (Nc, R, P, Tsea, cover, h, N); bio: its
// biosphere (biosphere.js); g: gravity (m/s2); lapse: K/m. Returns { npp, dens: [level][cell], massKg }
export function ecologyOf(snap, bio, g = 9.81, lapse = 0.0065) {
  if (!snap.Nc || !snap.P || !snap.Tsea || !bio || !bio.land) return null;
  const Gc = new GridLite(snap.Nc, snap.R), m = Gc.n, G = new GridLite(snap.N, snap.R), d = [0, 0, 0], uv = { face: 0, u: 0, v: 0 };
  const npp = new Float32Array(m);
  for (let c = 0; c < m; c++) {
    Gc.centre(c, d);
    const h = G.sample(snap.h, d, uv);
    if (h <= 0) continue;   // (the sea's web is its own: later)
    const T = snap.Tsea[c] - 273.15 - lapse * h;
    npp[c] = miamiNPP(T, snap.P[c]) * dm.clamp(snap.cover ? snap.cover[c] : 0.5, 0.02, 1);
  }
  // the animals' sizes and needs
  const clade = bio.land.clade || { size: 'mid', blood: 'cold' };
  const M0 = SIZE_KG[clade.size] || 60, gK = dm.pow(9.81 / Math.max(g, 1), 0.5), cold = clade.blood !== 'warm';
  const massKg = [0, 1, 2, 3, 4].map((k) => (k ? M0 * LEVEL_MASS[k] * gK : 0));
  const need = (M) => 365 * 4.82 * dm.pow(M * 1000, 0.734) * (cold ? 0.1 : 1);   // kJ a year
  const dens = [];
  let E = Float32Array.from(npp);
  const nb = new Int32Array(8);
  for (let k = 1; k <= LEVELS; k++) {
    const D = new Float32Array(m);
    dens.push(D);
    // (this level's energy, g/m2/yr, a tenth of the one below's; read over its range: smoothed more
    // the higher it stands)
    E = E.map((x) => x * 0.1);
    if (bio.land.levels[k] == null) continue;
    let Er = Float32Array.from(E);
    for (let it = 0; it < 3 * (k - 1); it++) {
      const nx = new Float32Array(m);
      for (let c = 0; c < m; c++) { const q = Gc.nbrs(c, nb); let s = Er[c] * 2; for (let e = 0; e < q; e++) s += Er[nb[e]]; nx[c] = s / (q + 2); }
      Er = nx;
    }
    for (let c = 0; c < m; c++) {
      if (!(npp[c] > 0)) continue;
      const n = BIG_SHARE * Er[c] * 18 * 0.5 * 1e6 / need(massKg[k]);
      D[c] = n >= VIABLE ? n : 0;
    }
  }
  return { npp, dens, massKg, cold };
}
