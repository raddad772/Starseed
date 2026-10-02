// Soil and groundwater (WORLDSIM.md 12): what the life on a world has to root in
// and drink from, which decides forest against grassland within a climate.
//
//   soil       a balance of making and losing: rock weathers into soil fastest where it's
//              warm and wet, faster under plants (roots, acids), slower as the soil
//              deepens and shields the rock (P0 e^(-d/h0)); the ground wears it away as
//              fast as the fine epoch cut there. So deep soils on gentle, wet, planted
//              ground; thin on steep slopes, cold or dry land, and limestone (it
//              dissolves and leaves little); thick where rivers laid sediment
//              (floodplains, deltas); thin and young where ice scraped the land bare; and
//              loess (wind-blown dust) round deserts and ice-sheet edges
//   groundwater the water table's depth from recharge (the rain left after evaporation)
//              and the lie of the land (the topographic wetness index ln(a / tan b)):
//              shallow in valleys and wet climates (springs, wetlands, bogs), deep under
//              ridges and deserts. Waterlogged flats are wetlands
//
// Per fine cell, at the end of the fine epoch. Heights in m, rates per year.

import * as dm from '../../core/dmath.js';
import { R as ROCK } from './lithology.js';

const P0 = 2e-4;    // m/yr: bare rock's soil making in a mild, wet climate
const H0 = 0.4;     // m: the depth over which soil shields the rock below

// how readily each rock weathers into soil (x P0)
const ROCK_W = {
  [ROCK.granite]: 0.8, [ROCK.basalt]: 1.5, [ROCK.andesite]: 1.3, [ROCK.sandstone]: 1.2, [ROCK.shale]: 1.4,
  [ROCK.limestone]: 0.4, [ROCK.chalk]: 0.6, [ROCK.alluvium]: 2.5, [ROCK.salt]: 0.1, [ROCK.regolith]: 1.5,
  [ROCK.ice]: 0, [ROCK['quartz sand']]: 1.0, [ROCK['coral sand']]: 0.6, [ROCK['black sand']]: 1.4,
};

// G: SimGrid; h: final heights; o: { E (Erosion, routed), years (the fine epoch's length),
//   net (h - h0 - uplift: + laid down, - worn), T (annual mean K, per cell), P (rain m/yr),
//   pet (m/yr), rock (exposed types), ice (ice now, m), everIce, plants (0..1 cover or
//   null), dust (0..1 dust source: deserts, ice edges) }
export function soilAndWater(G, h, o) {
  const n = G.n, E = o.E;
  const depth = new Float32Array(n), wtd = new Float32Array(n), wet = new Uint8Array(n), loess = new Float32Array(n);
  // loess: dust from deserts and ice edges, spread a few cells and laid on the land near them
  if (o.dust) {
    const f = Float64Array.from(o.dust), t = new Float64Array(n);
    // (spread over a set distance, a few hundred km at any grid size: the blur's reach grows as sqrt(iterations))
    const iters = Math.round(12 * (G.N / 128) * (G.N / 128));
    for (let it = 0; it < iters; it++) {
      for (let c = 0; c < n; c++) { let s = f[c] * 2, w = 2; for (let e = G.nStart[c]; e < G.nStart[c + 1]; e++) { s += f[G.nbr[e]]; w++; } t[c] = s / w; }
      f.set(t);
    }
    for (let c = 0; c < n; c++) if (h[c] >= 0 && !o.dust[c]) loess[c] = f[c] > 0.08 ? Math.min(40, 40 * (f[c] - 0.08)) : 0;
  }
  for (let c = 0; c < n; c++) {
    if (h[c] < 0 || E.base[c]) { wtd[c] = 0; continue; }
    if (o.ice && o.ice[c] > 0) { depth[c] = 0; wtd[c] = 0; continue; }
    const tC = o.T[c] - 273.15, P = o.P[c];
    const climK = dm.clamp(P / 1.0, 0.05, 2) * dm.clamp(dm.pow(2, (tC - 15) / 10), 0.05, 3) * (tC < -10 ? 0.1 : 1);
    const make = P0 * climK * (ROCK_W[o.rock[c]] ?? 1) * (o.plants ? 1 + 1.5 * o.plants[c] : 1);
    const wear = Math.max(0, -o.net[c]) / o.years;
    let d = wear < make ? H0 * dm.log(make / Math.max(wear, 1e-9)) : 0.05;
    d = Math.min(d, 3);
    if (o.net[c] > 1) d = Math.max(d, Math.min(30, 1 + 0.5 * o.net[c]));   // laid down: floodplains, deltas, fans
    if (o.everIce && o.everIce[c]) d = Math.min(d, 0.3);                     // scraped bare not long ago
    depth[c] = d + loess[c];
    // the water table: recharge (Schreiber's runoff share of the rain) and the wetness
    // index (upslope area over slope: valleys gather water, ridges shed it)
    const R = P > 1e-3 ? P * dm.exp(-o.pet[c] / P) : 0;
    const r = E.rcv[c];
    const tanB = r >= 0 ? Math.max(1e-4, (h[c] - Math.max(h[r], 0)) / E.rcvD[c]) : 1e-4;
    const cells = Math.max(1, E.A[c] / Math.max(1e-6, G.area[c] * Math.max(0.01, E.rain[c] * (E.rainK ?? 1))));
    const twi = dm.log(cells * G.spacing / tanB) - dm.log(G.spacing);
    wtd[c] = dm.clamp(20 * dm.exp(-(twi - 8) / 2.5) / (0.1 + 3 * R), 0, 500);
    // wetlands: the water table at the surface on flat ground; and cold, flat, wet country
    // where the ground stays frozen below and little evaporates (peat bogs, tundra mires)
    if ((wtd[c] < 1.5 && R > 0.05 && tanB < 0.005) || (tC < -1 && R > 0.05 && tanB < 0.003)) wet[c] = 1;
  }
  return { depth, wtd, wet, loess };
}
