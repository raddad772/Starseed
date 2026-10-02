// Life on the map (WORLDSIM.md 15b): where a world's life lives, how much of it, how
// complex, and in which lineages, from the history's timeline (evolve.js: stages,
// extinctions) and the world's climate, soil and water. It feeds back: plant cover
// holds the soil (erosion), roots and acids make soil faster, forests darken the land
// and hand rain on inland (the climate), reefs build coasts.
//
//   productivity  land: the Miami model (temperature and rain, Lieth 1975) x usable light x
//                 soil and water; sea: light x nutrients (upwelling at cold currents, mixing
//                 at high latitudes, rivers at the coasts; warm open gyres are poor)
//   structure     once there are land plants: forest where trees get water enough (rain
//                 against evaporation, or groundwater in reach), soil deep enough, warm
//                 months enough and a flora old enough for trees; fire (with ~17%+ oxygen in
//                 the air) keeps seasonally dry country open as grassland; shrubs and ferns
//                 before grasses evolve; tundra and desert where cold or dry wins
//   spread        land life starts at the sea's edge and creeps inland, slower across
//                 climate differences (it takes time to adapt); it crosses narrow seas now
//                 and then; once animals fly, they jump to far places like home. A crossing
//                 to new land founds a lineage: realms (an Australia's marsupials)
//   diversity     grows with the time since life arrived, its productivity and its realm's
//                 size; the history's extinctions knock it back everywhere
//
// On the climate grid (coarse). Deterministic (dmath, Rng).

import * as dm from '../../core/dmath.js';

export class LifeMap {
  // G: the climate's SimGrid; H: the world's history; rng
  constructor(G, H, rng) {
    this.G = G; this.H = H; this.rng = rng;
    const n = G.n;
    this.cover = new Float32Array(n);     // land plant cover 0..1 (or microbial crusts)
    this.forest = new Float32Array(n);    // the share of the cover that's forest
    this.open = new Float32Array(n);      // grassland (or shrubs and ferns before grasses)
    this.seaLife = new Float32Array(n);   // sea productivity 0..1
    this.landed = new Uint8Array(n);      // land life has reached it
    this.realm = new Int32Array(n).fill(-1);
    this.since = new Float32Array(n);     // Myr since land life arrived
    this.div = new Float32Array(n);       // diversity (x Earth's richest)
    this.realms = 0;
    this.fire = new Float32Array(n);
  }

  // the environment on this grid: { land (Uint8), T (annual mean K), Tm (12 x n monthly K),
  //   P (mm/yr), Pm (12 x n), pet (m/yr), soil (m), wtd (m), wet (0..1), upwell (0..1 cold
  //   currents), coastNutr (0..1 near river mouths) }
  potentials(env) {
    const { G, H } = this, n = G.n;
    const light = Math.max(0.01, H.usableLight ?? 1);
    const lightK = dm.clamp(light / (light + 0.3) * 1.3, 0, 1.5);
    const o2 = H.air ? (H.air.O2 || 0) / Math.max(H.P, 1e-6) : 0;
    const fireOK = dm.smoothstep(0.15, 0.2, o2);
    const stage = H.lifeStage || 0, flora = H.floraStage ?? -1;
    const out = { landPot: new Float32Array(n), seaPot: new Float32Array(n) };
    for (let c = 0; c < n; c++) {
      const tC = env.T[c] - 273.15;
      if (env.land[c]) {
        // Miami NPP (g/m^2/yr), as a share of the richest (~2400)
        const nT = 3000 / (1 + dm.exp(1.315 - 0.119 * tC)), nP = 3000 * (1 - dm.exp(-0.000664 * env.P[c]));
        let pot = Math.min(nT, nP) / 2400 * lightK;
        let warm = 0, dry = 0;
        for (let m = 0; m < 12; m++) { if (env.Tm[m * n + c] > 283) warm++; if (env.Pm[m * n + c] < 30) dry++; }
        if (warm === 0) pot *= 0.15;   // (no month above 10 C: tundra at most)
        out.landPot[c] = dm.clamp(pot, 0, 1.2);
        // the structure, where there are land plants
        if (stage >= 7) {
          const W = env.P[c] / 1000 / Math.max(0.05, env.pet[c]) + (env.wtd[c] < 5 ? 0.5 : 0);
          const trees = flora >= 3 ? dm.smoothstep(0.5, 1.0, W) * dm.smoothstep(0.3, 1.0, env.soil[c]) * dm.smoothstep(2, 4, warm) : 0;
          this.fire[c] = fireOK * dm.smoothstep(2, 6, dry) * dm.smoothstep(0.3, 0.8, W);
          this.forest[c] = trees * (1 - 0.8 * this.fire[c]);
          this.open[c] = Math.max(0, 1 - this.forest[c]) * dm.smoothstep(0.1, 0.4, W);
        }
      } else {
        // the sea: light, and nutrients brought up or washed in
        const mix = dm.smoothstep(35, 60, Math.abs(dm.asin(dm.clamp(G.dir[c * 3 + 1], -1, 1))) * 180 / dm.PI);
        const nutr = Math.min(1, 0.25 + 0.6 * (env.upwell ? env.upwell[c] : 0) + 0.4 * mix + 0.4 * (env.coastNutr ? env.coastNutr[c] : 0));
        out.seaPot[c] = dm.clamp(nutr * lightK * (tC > -1.8 ? 1 : 0.2), 0, 1.2);
      }
    }
    return out;
  }

  // run the life map over the window [startAgo, 0] Myr in steps of dt Myr, the environment
  // fixed (the present's), from the history's timeline
  run(env, startAgo = 20, dt = 0.5) {
    const { G, H, rng } = this, n = G.n;
    const pot = this.potentials(env);
    const age = H.age * 1000;                           // Myr
    const tPlants = H.life && H.life.plants != null ? (H.age - H.life.plants) * 1000 : null;   // Myr ago
    const tAnimals = H.life && H.life.landAnimals != null ? (H.age - H.life.landAnimals) * 1000 : null;
    const fliersAgo = tAnimals != null ? tAnimals - 30 : null;   // (fliers some tens of Myr after the first land animals)
    // the sea's life, from the stage: microbes everywhere wet; complex sea life where productive
    const stage = H.lifeStage || 0;
    this.comp = landmasses(G, env.land);
    this.realmNext = 0;
    for (let c = 0; c < n; c++) if (!env.land[c]) this.seaLife[c] = stage >= 1 ? pot.seaPot[c] * (stage >= 5 ? 1 : 0.4) : 0;
    if (stage < 2) return this.finish(env, pot);
    // land: microbial crusts wherever it's wet enough, long before plants
    if (tPlants == null || stage < 7) {
      for (let c = 0; c < n; c++) if (env.land[c]) this.cover[c] = 0.05 * dm.smoothstep(0.1, 0.6, pot.landPot[c]);
      return this.finish(env, pot);
    }
    // plants arrived before the window: they hold all the land they can, in realms by
    // landmass (each landmass's lineage, its own since the window began)
    if (tPlants > startAgo) {
      const comp = this.comp;
      for (let c = 0; c < n; c++) if (env.land[c] && pot.landPot[c] > 0.02) { this.landed[c] = 1; this.realm[c] = comp[c]; this.since[c] = Math.min(tPlants, age); this.realmNext = Math.max(this.realmNext, comp[c] + 1); }
    } else {
      // they arrive in the window: from the sea's edge where it's richest, then spread
      let best = -1;
      for (let c = 0; c < n; c++) if (env.land[c] && coastal(G, env.land, c) && (best < 0 || pot.landPot[c] > pot.landPot[best])) best = c;
      if (best >= 0) { this.landed[best] = 1; this.realm[best] = 0; this.realmNext = 1; }
      for (let t = tPlants; t > 0; t -= dt) this.spread(env, pot, dt, fliersAgo != null && t < fliersAgo);
    }
    // recent spread for the long-established too (filling gaps, crossings)
    for (let t = Math.min(startAgo, tPlants); t > 0; t -= dt) this.spread(env, pot, dt, fliersAgo != null && t < fliersAgo);
    return this.finish(env, pot);
  }

  // one step of spread: to neighbouring land by adaptation (slower across climate
  // differences), across narrow seas by chance (rafting, spores, seeds), and with fliers
  // in far jumps to places like home
  spread(env, pot, dt, fliers) {
    const { G, rng } = this, n = G.n;
    const add = [];
    for (let c = 0; c < n; c++) {
      if (!this.landed[c]) continue;
      this.since[c] += dt;
      for (let e = G.nStart[c]; e < G.nStart[c + 1]; e++) {
        const o = G.nbr[e];
        if (env.land[o]) {
          if (this.landed[o] || pot.landPot[o] < 0.02) continue;
          const gap = Math.abs(env.T[o] - env.T[c]) / 8 + Math.abs(dm.log((env.P[o] + 50) / (env.P[c] + 50)));
          if (rng.next() < dt * 0.8 * dm.exp(-2 * gap)) add.push([o, this.realm[c]]);
        } else if (rng.next() < dt * 0.01) {
          // across the sea: the far shore within a few cells
          const far = acrossSea(G, env.land, o, 3, this.comp, this.comp[c]);
          if (far >= 0 && !this.landed[far] && pot.landPot[far] > 0.02) add.push([far, this.realmNext++]);
        }
      }
    }
    if (fliers && rng.next() < dt * 0.5) {
      // a far jump: from a random landed place to a random unlanded one like it
      const from = [], to = [];
      for (let c = 0; c < n; c++) { if (this.landed[c]) from.push(c); else if (env.land[c] && pot.landPot[c] > 0.02) to.push(c); }
      if (from.length && to.length) {
        const a = from[Math.floor(rng.next() * from.length)], b = to[Math.floor(rng.next() * to.length)];
        if (Math.abs(env.T[a] - env.T[b]) < 6 && Math.abs(dm.log((env.P[a] + 50) / (env.P[b] + 50))) < 0.6) add.push([b, this.realmNext++]);
      }
    }
    for (const [c, r] of add) if (!this.landed[c]) { this.landed[c] = 1; this.realm[c] = r; this.since[c] = 0; }
  }

  // cover, diversity, realms, and the history's die-offs in the window knocking it back
  finish(env, pot) {
    const { G, H } = this, n = G.n;
    const realmArea = new Map();
    for (let c = 0; c < n; c++) if (this.landed[c]) {
      this.cover[c] = Math.max(this.cover[c], dm.clamp(pot.landPot[c], 0, 1));
      realmArea.set(this.realm[c], (realmArea.get(this.realm[c]) || 0) + G.area[c]);
    }
    let total = 0;
    for (let c = 0; c < n; c++) total += G.area[c];
    this.realms = [...realmArea.values()].filter((a) => a > total * 0.002).length;
    // recent catastrophes on the map (the history's events, with where they struck):
    // diversity knocked back everywhere by each die-off, recovering over ~8 Myr; around the
    // site, worse, and the forest still regrowing (ferns and scrub first) for ~1 Myr; a
    // flood-basalt province erupting or freshly cooled is bare lava
    const Rkm = (H.radiusKm || 6371);
    const hurt = new Float32Array(n), scar = new Float32Array(n);
    let global = 1;
    for (const e of H.extinctions || []) {
      const agoMyr = e.ago * 1000;
      if (agoMyr > 40) continue;
      global *= 1 - e.loss * dm.exp(-agoMyr / 8);
      if (!e.at || !e.reachKm) continue;
      const reach = e.reachKm / Rkm, recent = dm.exp(-agoMyr / 1);
      for (let c = 0; c < n; c++) {
        const cos = G.dir[c * 3] * e.at[0] + G.dir[c * 3 + 1] * e.at[1] + G.dir[c * 3 + 2] * e.at[2];
        const ang = dm.acos(dm.clamp(cos, -1, 1)) / reach;
        if (ang > 3) continue;
        const k = dm.exp(-ang * ang);
        hurt[c] = Math.max(hurt[c], k * Math.min(1, 2 * e.loss) * dm.exp(-agoMyr / 8));
        scar[c] = Math.max(scar[c], k * recent);
      }
    }
    for (const L of H.floodBasalts || []) {
      if (!L.at || L.ago * 1000 > 0.3) continue;   // (lava fields green over in ~a few hundred kyr)
      const reach = L.reachKm / Rkm;
      for (let c = 0; c < n; c++) {
        const cos = G.dir[c * 3] * L.at[0] + G.dir[c * 3 + 1] * L.at[1] + G.dir[c * 3 + 2] * L.at[2];
        if (dm.acos(dm.clamp(cos, -1, 1)) < reach) { this.cover[c] *= 0.1; this.forest[c] = 0; this.lava = this.lava || new Uint8Array(n); this.lava[c] = 1; }
      }
    }
    for (let c = 0; c < n; c++) if (scar[c] > 0.05 && env.land[c]) { const f = this.forest[c] * scar[c]; this.forest[c] -= f; this.open[c] = Math.min(1, this.open[c] + f); }
    this.scar = scar;
    // diversity: time since arrival (saturating over ~100 Myr), productivity, realm size
    // (species-area, ~A^0.25), the world's diversity now, and the recent die-offs
    const worldDiv = (H.diversity ?? 0) * (global > 0 ? 1 : 0);
    for (let c = 0; c < n; c++) {
      if (this.landed[c]) {
        const a = realmArea.get(this.realm[c]) || 0;
        this.div[c] = worldDiv * pot.landPot[c] * (1 - dm.exp(-this.since[c] / 100)) * dm.pow(a / total / 0.1, 0.25) * (1 - hurt[c]);
      } else if (!env.land[c]) this.div[c] = worldDiv * this.seaLife[c] * 0.8 * (1 - 0.5 * hurt[c]);
    }
    return this;
  }

  summary(env) {
    const { G } = this, n = G.n;
    let land = 0, cov = 0, forest = 0, open = 0, sea = 0, seaA = 0;
    for (let c = 0; c < n; c++) {
      const a = G.area[c];
      if (env.land[c]) { land += a; cov += a * this.cover[c]; forest += a * this.cover[c] * this.forest[c]; open += a * this.cover[c] * this.open[c]; }
      else { seaA += a; sea += a * this.seaLife[c]; }
    }
    return { landCover: cov / Math.max(land, 1), forest: forest / Math.max(land, 1), open: open / Math.max(land, 1), seaLife: sea / Math.max(seaA, 1), realms: this.realms };
  }
}

// connected landmasses: an id per land cell
function landmasses(G, land) {
  const id = new Int32Array(G.n).fill(-1);
  let k = 0;
  for (let c0 = 0; c0 < G.n; c0++) {
    if (!land[c0] || id[c0] >= 0) continue;
    const q = [c0]; id[c0] = k;
    while (q.length) { const c = q.pop(); for (let e = G.nStart[c]; e < G.nStart[c + 1]; e++) { const o = G.nbr[e]; if (land[o] && id[o] < 0) { id[o] = k; q.push(o); } } }
    k++;
  }
  return id;
}
function coastal(G, land, c) { for (let e = G.nStart[c]; e < G.nStart[c + 1]; e++) if (!land[G.nbr[e]]) return true; return false; }
// the nearest land of another landmass across the sea from sea cell s, within k cells
function acrossSea(G, land, s, k, comp, home) {
  let front = [s]; const seen = new Set([s]);
  for (let step = 0; step < k; step++) {
    const next = [];
    for (const c of front) for (let e = G.nStart[c]; e < G.nStart[c + 1]; e++) {
      const o = G.nbr[e];
      if (seen.has(o)) continue;
      seen.add(o);
      if (land[o]) { if (comp[o] !== home) return o; continue; }
      next.push(o);
    }
    front = next;
  }
  return -1;
}
