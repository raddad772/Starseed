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
  potentials(env, stageAt = null, floraAt = null) {
    const { G, H } = this, n = G.n;
    const light = Math.max(0.01, H.usableLight ?? 1);
    const lightK = dm.clamp(light / (light + 0.3) * 1.3, 0, 1.5);
    const o2 = H.air ? (H.air.O2 || 0) / Math.max(H.P, 1e-6) : 0;
    const fireOK = dm.smoothstep(0.15, 0.2, o2);
    const stage = stageAt ?? (H.lifeStage || 0), flora = floraAt ?? (H.floraStage ?? -1);
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
    // (where the history's map has got to, life through the history: its plants where they
    // spread to, spreading on over the window)
    const P0 = env.prior;
    if (P0 && tPlants != null && stage >= 7) {
      for (let c = 0; c < n; c++) if (env.land[c] && P0.landed[c] && pot.landPot[c] > 0.02) { this.landed[c] = 1; this.since[c] = P0.since[c]; this.realm[c] = env.realmInit && env.realmInit[c] >= 0 ? env.realmInit[c] : P0.realm[c]; this.realmNext = Math.max(this.realmNext, this.realm[c] + 1); }
      const means = P0.means || {};
      for (let t = startAgo; t > 0; t -= dt) this.spread(env, pot, dt, fliersAgo != null && t < fliersAgo, means);
      return this.finish(env, pot);
    }
    // land: microbial crusts wherever it's wet enough, long before plants
    if (tPlants == null || stage < 7) {
      for (let c = 0; c < n; c++) if (env.land[c]) this.cover[c] = 0.05 * dm.smoothstep(0.1, 0.6, pot.landPot[c]);
      return this.finish(env, pot);
    }
    // plants arrived before the window: they hold all the land they can, in realms by
    // landmass (each landmass's lineage, its own since the window began)
    if (tPlants > startAgo) {
      const comp = this.comp;
      // (the realms the plates' history made, where it tracked them: world.js RealmTracker)
      const init = env.realmInit;
      const off = init ? 1 + Math.max(-1, ...init) : 0;
      for (let c = 0; c < n; c++) if (env.land[c] && pot.landPot[c] > 0.02) { this.landed[c] = 1; this.realm[c] = init && init[c] >= 0 ? init[c] : off + comp[c]; this.since[c] = Math.min(tPlants, age); this.realmNext = Math.max(this.realmNext, this.realm[c] + 1); }
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
  // (means, life through the history: how it travels then: base, the pace to a neighbour (a
  // Myr); rich, how much faster onto richer land (it takes the easy energy first); sea, the
  // chance a Myr of a crossing (rafts, seeds on the wind, birds); world, the world's own pace
  // (the energy life has to use there))
  spread(env, pot, dt, fliers, means = null) {
    const { G, rng } = this, n = G.n;
    const add = [], base = means && means.base != null ? means.base : 0.8, rich = means ? means.rich || 0 : 0, seaK = means && means.sea != null ? means.sea : 0.01, wk = means ? means.world || 1 : 1, reach = means && means.reach ? means.reach : 3;
    for (let c = 0; c < n; c++) {
      if (!this.landed[c]) continue;
      this.since[c] += dt;
      for (let e = G.nStart[c]; e < G.nStart[c + 1]; e++) {
        const o = G.nbr[e];
        if (env.land[o]) {
          if (this.landed[o] || pot.landPot[o] < 0.02) continue;
          const gap = Math.abs(env.T[o] - env.T[c]) / 8 + Math.abs(dm.log((env.P[o] + 50) / (env.P[c] + 50)));
          const pace = base * wk * (rich ? (1 - rich) + rich * 2 * Math.min(1, pot.landPot[o]) : 1);
          if (rng.next() < dt * pace * dm.exp(-2 * gap)) add.push([o, this.realm[c]]);
        } else if (rng.next() < dt * seaK * wk) {
          // across the sea: the far shore within a few cells
          const far = acrossSea(G, env.land, o, reach, this.comp, this.comp[c]);
          if (far >= 0 && !this.landed[far] && pot.landPot[far] > 0.02) add.push([far, this.realmNext++]);
        }
      }
    }
    // (spores and light seeds on the high winds: now and then one lands far away, the nearer
    // the likelier, where the climate is like home: means.far a Myr, falling off over farKm)
    if (means && means.far && rng.next() < dt * means.far * wk) {
      const from = [];
      for (let c = 0; c < n; c++) if (this.landed[c]) from.push(c);
      if (from.length) {
        const a = from[Math.floor(rng.next() * from.length)], Rkm = this.H.radiusKm || 6371;
        let best = -1, bw = 0;
        for (let k = 0; k < 24; k++) {
          const b = Math.floor(rng.next() * n);
          if (!env.land[b] || this.landed[b] || pot.landPot[b] < 0.02) continue;
          const cos = G.dir[a * 3] * G.dir[b * 3] + G.dir[a * 3 + 1] * G.dir[b * 3 + 1] + G.dir[a * 3 + 2] * G.dir[b * 3 + 2];
          const km = dm.acos(dm.clamp(cos, -1, 1)) * Rkm;
          const w = dm.exp(-km / means.farKm) * dm.exp(-Math.abs(env.T[a] - env.T[b]) / 6 - Math.abs(dm.log((env.P[a] + 50) / (env.P[b] + 50))));
          if (w > bw) { bw = w; best = b; }
        }
        if (best >= 0 && rng.next() < bw) add.push([best, this.realmNext++]);
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

  // ---- life through the history (world.js, as the plates move; Dave: "feedback all the way
  // through history"): the map advanced dt Myr at agoMyr before now, in the environment of the
  // time (env: its land, its climate), with life's stage then (the history's series). Land life
  // travels by its means: microbial crusts slowly from the shores; the first plants (spores) a
  // little faster; seed plants on the wind; with land animals, seeds carried; with fliers, far
  // jumps. All faster onto richer land, and on a world with more energy to use. The history's
  // die-offs strike as they happen (around where they struck, and a share everywhere); what
  // they emptied is taken again from what's left. Sets cover, forest, open as of then
  advance(env, agoMyr, dt) {
    const { G, H, rng } = this, n = G.n;
    const t = H.age - agoMyr / 1000, L = H.life || {};
    const stage = Math.round(H.at(agoMyr, 'stage') ?? (H.lifeStage || 0));
    const plantsMyr = stage >= 7 && L.plants != null ? Math.max(0, (t - L.plants) * 1000) : 0;
    const flora = stage < 7 ? (stage >= 2 ? 0 : -1) : plantsMyr < 50 ? 1 : plantsMyr < 90 ? 2 : plantsMyr < 300 ? 3 : 4;
    const pot = this.potentials(env, stage, flora);
    if (!this.comp || this._landSig !== agoMyr) { this.comp = landmasses(G, env.land); this._landSig = agoMyr; }
    for (let c = 0; c < n; c++) if (!env.land[c]) this.seaLife[c] = stage >= 1 ? pot.seaPot[c] * (stage >= 5 ? 1 : 0.4) : 0;
    // (where the land went under the sea, or can't feed anything now, the life there is gone)
    for (let c = 0; c < n; c++) if (!env.land[c] || pot.landPot[c] < 0.02) { this.landed[c] = 0; this.cover[c] = 0; this.forest[c] = 0; this.open[c] = 0; }
    const crust = (c) => stage >= 2 && env.land[c] ? 0.05 * dm.smoothstep(0.1, 0.6, pot.landPot[c]) : 0;
    if (stage < 7) { for (let c = 0; c < n; c++) this.cover[c] = crust(c); this.means = null; return this; }
    // (the die-offs of this stretch: around where they struck; and a share everywhere)
    const Rkm = H.radiusKm || 6371;
    for (const e of H.extinctions || []) {
      const ea = e.ago * 1000;
      if (ea > agoMyr || ea <= agoMyr - dt) continue;
      const reach = e.reachKm ? e.reachKm / Rkm : 0;
      for (let c = 0; c < n; c++) {
        if (!this.landed[c]) continue;
        let k = 0.5 * e.loss;
        if (reach && e.at) { const cos = G.dir[c * 3] * e.at[0] + G.dir[c * 3 + 1] * e.at[1] + G.dir[c * 3 + 2] * e.at[2]; const a = dm.acos(dm.clamp(cos, -1, 1)) / reach; k = Math.max(k, dm.exp(-a * a)); }
        if (rng.next() < k) { this.landed[c] = 0; this.since[c] = 0; }
      }
    }
    // (plants older than the history's window: on all the land they can hold, a lineage to
    // each landmass; arriving now: the first from the richest shore)
    let any = false;
    for (let c = 0; c < n && !any; c++) if (this.landed[c]) any = true;
    if (!any && !this._began && plantsMyr > dt) {
      for (let c = 0; c < n; c++) if (env.land[c] && pot.landPot[c] > 0.02) { this.landed[c] = 1; this.since[c] = plantsMyr; this.realm[c] = this.comp[c]; this.realmNext = Math.max(this.realmNext, this.comp[c] + 1); }
      any = true;
    }
    this._began = true;
    if (!any) {
      let best = -1;
      for (let c = 0; c < n; c++) if (env.land[c] && coastal(G, env.land, c) && (best < 0 || pot.landPot[c] > pot.landPot[best])) best = c;
      if (best >= 0) { this.landed[best] = 1; this.realm[best] = this.realmNext++; }
    }
    // (its means of travel then; the world's pace: the light it has to use)
    const animals = stage >= 8, fliers = animals && L.landAnimals != null && (t - L.landAnimals) * 1000 > 30;
    // (the first plants: spores, slow over the ground (they need it wet) but light enough for
    // the wind to carry far over the sea; seeds: faster over the ground, nearer over the sea;
    // with animals carrying seeds, faster still)
    const means = this.means = flora <= 1 ? { base: 0.4, rich: 0.6, sea: 0.05, reach: 6, far: 0.3, farKm: 4000 } : animals ? { base: 1.6, rich: 0.6, sea: 0.03, reach: 4, far: 0.1, farKm: 2500 } : { base: 0.9, rich: 0.6, sea: 0.02, reach: 3, far: 0.15, farKm: 2500 };
    means.world = dm.clamp(H.usableLight ?? 1, 0.3, 1.5);
    for (let s = 0; s < dt - 1e-9; s += 0.5) this.spread(env, pot, Math.min(0.5, dt - s), fliers, means);
    for (let c = 0; c < n; c++) {
      if (this.landed[c]) this.cover[c] = dm.clamp(pot.landPot[c], 0, 1);
      else { this.cover[c] = crust(c); this.forest[c] = 0; this.open[c] = 0; }
    }
    return this;
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
