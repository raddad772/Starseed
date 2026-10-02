// Glaciers (WORLDSIM.md checklist 8): where it's cold enough, snow outlasts
// the melt and turns to ice; ice gathers down the valleys and creeps along
// them until the melt lower down balances what feeds it. Sliding ice grinds
// harder than rivers cut: it deepens and widens its valleys into U-shapes,
// and (unlike a river, which can't cut below the sea it runs into) it carves
// below sea level where it reaches the coast: troughs the sea floods as fjords
// when the ice melts back.
//
// Cheap, on the drainage network (erosion.js's routing): each cell's mass
// balance from its temperature (the latitude, its height, and the world's
// climate at the time from its history) and its snowfall; ice flux summed
// down the flow tree; erosion ~ flux^0.6 (faster ice in bigger glaciers),
// a share on the valley walls; the trough limited to a real glacier's depth.
// Heights in metres; per-year rates.

import * as dm from '../../core/dmath.js';

const MELT_T = 268;      // K: annual mean below which snow survives (on balance) above the line
const ACC_MAX = 1.5;     // m/yr of ice where it's cold and snowy
const ABL_PER_K = 0.6;   // m/yr of melt per K above MELT_T
const ABL_MAX = 10;      // m/yr
const KG = 8e-9;         // glacial erosion: m/yr per (m^3/yr of ice, game scale)^0.6
const TROUGH_MAX = 1200; // m: the deepest a glacier cuts below where it started (Sognefjord ~1.3 km)

export class Glaciers {
  // G: SimGrid; cl: the world's climate parameters (bodies.js terrain.climate)
  constructor(G, cl, scale = 0.1) {
    this.G = G; this.cl = cl;
    this.areaK = 1 / (scale * scale); // game areas -> real (for how thick the ice is)
    const n = G.n;
    this.ice = new Float32Array(n);      // ice thickness now (m)
    this.flux = new Float64Array(n);     // ice discharge through each cell (m^3/yr)
    this.cut = new Float32Array(n);      // how deep the ice has cut here (m)
    this.everIce = new Uint8Array(n);
    this.T = new Float32Array(n);
  }

  // each cell's annual mean temperature: latitude (the generator's insolation
  // law), its height (lapse), and the climate then vs now (dT)
  temperatures(h, dT) {
    const { G, cl, T } = this;
    // (with the climate model's temperatures brought to sea level: those, less the lapse
    // to each cell's height now)
    if (this.Tsl) { for (let c = 0; c < G.n; c++) T[c] = this.Tsl[c] - this.lapse * Math.max(h[c], 0) + dT; return T; }
    for (let c = 0; c < G.n; c++) {
      const y = G.dir[c * 3 + 1];
      let rel;
      if (cl.locked) {
        const ss = cl.substellar, cp = G.dir[c * 3] * ss[0] + y * ss[1] + G.dir[c * 3 + 2] * ss[2];
        rel = (1 - cl.dayNight) + cl.dayNight * (4 * Math.max(cp, 0) + 0.02);
      } else rel = 1 + cl.s2 * (3 * y * y - 1) / 2 * cl.transport;
      T[c] = cl.Tmean * dm.pow(Math.max(rel, 0.002), 0.25) - cl.lapse * Math.max(h[c], 0) + dT;
    }
    return T;
  }

  // one step of dt years over the routed surface E (after E.route/drain this step);
  // precip: per-cell snowfall (m/yr of water; ~1 m/yr is snowy); returns ice-covered cells
  step(h, E, precip, dt, dT) {
    const { G, ice, flux, cut, everIce } = this;
    const n = G.n, area = G.area;
    const T = this.temperatures(h, dT);
    const { order, rcv, base } = E;
    flux.fill(0);
    // balance, summed down the flow tree (upstream first)
    for (let k = n - 1; k >= 0; k--) {
      const c = order[k];
      if (base[c] && h[c] < -300) continue; // (open sea: ice shelves don't carve)
      let b;
      if (this.TmSL) {
        // with the climate's months: the degree-day model. Snow is what falls in freezing
        // months; melt ~5 mm of water per degree-day above freezing (Siberia's -10 C year
        // has +19 C summers that melt it all; a cold summer keeps a cold-winter's snow)
        const up = this.lapse * Math.max(h[c], 0) - dT;
        let pdd = 0, frost = 0;
        for (let m = 0; m < 12; m++) { const t = this.TmSL[m * n + c] - up - 273.15; if (t > 0) pdd += t * 30.4; else frost++; }
        b = Math.max(-ABL_MAX, Math.min(ACC_MAX, precip[c] * frost / 12 - 0.005 * pdd));
      } else b = T[c] < MELT_T ? ACC_MAX * Math.min(1, (MELT_T - T[c]) / 10) * Math.min(1, Math.max(0.05, precip[c])) : -Math.min(ABL_MAX, ABL_PER_K * (T[c] - MELT_T));
      flux[c] = Math.max(0, flux[c] + b * area[c]);
      const r = rcv[c];
      if (r >= 0 && flux[c] > 0) flux[r] += flux[c];
    }
    let covered = 0;
    for (let c = 0; c < n; c++) {
      if (flux[c] <= 0) { ice[c] = 0; continue; }
      covered++;
      everIce[c] = 1;
      // thickness from the real ice flux (a valley glacier some hundreds of metres, an ice
      // sheet kilometres); erosion ~ flux^0.6 (bigger glaciers slide faster)
      ice[c] = Math.min(3500, 60 * dm.pow(flux[c] * this.areaK / 1e6, 0.35));
      if (cut[c] >= TROUGH_MAX) continue;
      const e = Math.min(TROUGH_MAX - cut[c], KG * dm.pow(flux[c], 0.6) * dt);
      h[c] -= e; cut[c] += e;
      // the walls: a share off the neighbours higher than the trough floor (U-shaped valleys)
      for (let q = G.nStart[c]; q < G.nStart[c + 1]; q++) {
        const o = G.nbr[q];
        if (h[o] > h[c] + 50 && cut[o] < TROUGH_MAX) { const w = e * 0.35; h[o] -= w; cut[o] += w; }
      }
    }
    return covered;
  }
}
