// Plate tectonics over deep time (generation only: hundreds of millions of
// years, then frozen).
//
// Irregular plates grown from seeds each turn about their own Euler pole. A
// plate keeps its crust in its own frame (a full SimGrid, masked to the cells
// it owns): thickness (km), continental fraction, and the age of oceanic
// crust. Each step every world cell asks the plates around it which of them
// covers it now (rotating the cell back into each plate's frame), so the crust
// is never resampled and nothing smears however far the plates go.
//
//   one plate covers a cell       it's that plate's
//   none (plates pulling apart)   new oceanic crust, age 0: a spreading ridge
//   two or more (converging)      the lighter crust rides over: continental
//                                 over oceanic, younger ocean over older.
//                                 Oceanic crust underneath is consumed (a
//                                 trench) and thickens the plate above (a
//                                 volcanic arc, an island arc at sea, slowly
//                                 becoming new continent). Continent against
//                                 continent: neither sinks, the crust stacks
//                                 up (a range, then a plateau as it spreads)
//                                 and the two plates' motions merge; a
//                                 collision that goes on welds them into one
//                                 plate (a suture).
//   always                        plates diving into trenches are pulled
//                                 along by their sinking slab (fast ocean
//                                 plates); plates without one slow down
//   now and then                  a big plate carrying continent splits along
//                                 a wandering line (a rift: the crust thins
//                                 into a valley) and the halves drift apart,
//                                 new ocean opening between them. Welding and
//                                 rifting together make the supercontinent
//                                 cycle.
//
// Volcanoes and craters are surface relief carried on the plates (a field
// beside the crust, not floated: a volcano is a load, not a root):
//   hotspots        plumes fixed in the mantle under the moving plates: each
//                   builds volcanoes in pulses, so a plate passing over gets a
//                   chain of islands, oldest farthest away, sinking as it goes
//                   (Hawaii); over a continent, flood basalts. Not every world.
//   arc volcanoes   cones in a line behind each trench, on the plate above
//   impacts         (impacts.js), on whatever plate they land on
// Erosion takes volcanoes down before crust, and fills craters first.
//
// Heights follow from the crust (it floats: Airy isostasy): continental crust
// stands higher the thicker it is, oceanic crust sinks as it ages and cools.
// The sea is only the erosion's base level here: each step it stands where it
// covers the world's ocean fraction. (It does real work in later epochs:
// climate, ice-age sea levels, coasts, reefs.)

import * as dm from '../../core/dmath.js';
import { hashInts } from '../../core/rng.js';
import { Heap } from './erosion.js';

export const CONT_KM = 35, OCEAN_KM = 7, MAX_KM = 85; // (85: a hard limit; spreading keeps most crust well under it)
const RELAX_MYR = 120; // thick crust spreads and wears down (when no erosion runs alongside)
const SLOW = 0.15, FAST = 0.9; // plate speeds (deg/Myr): with no slab, with a long one
const RIFT_MYR = 60;    // mean time between continental break-ups
const RIFT_MIN_MYR = 30;
const MAX_PLATES = 64;
const WELD = 4;         // sustained collision (cells, x N, over ~20 Myr) that welds two plates
const STACK = 1;        // of colliding continental crust, the share that stacks up (the rest sinks with its root)
const EXTEND_MYR = 100; // continents thicker than normal stretch and widen (rifted basins, extended margins)
const EQ_KM = 40;       // ... toward this thickness
// A guard rail, not a target: worlds' continents may average anything in
// RAIL_KM; past the top, collapse speeds up in proportion (a world whose
// collisions outrun its stretching would otherwise pile up without end)
const RAIL_KM = [30, 50];
const SPREAD_MYR = 1.5;   // how fast thick crust flows outward (Myr, at 30 km of excess)
const HOT_RATE = 2500;  // m/Myr of volcano a strong hotspot builds at its centre
const HOT_R = 3.5;      // its reach (cells): a shield volcano's footprint
const HOT_CAP = [7500, 2500]; // tallest volcanic pile (m): on ocean floor, on a continent
const SINK_MYR = 25;    // volcanoes on ocean floor sink (the plate bends under them, and cools)
const ARC_P = 0.03, ARC_CONE = 1200, ARC_CAP = 3500;
// volcanic activity tiers: plume count, plume strength, arc volcano rate
const ACTIVITY = [
  { name: 'quiet', plumes: [0, 0], strength: 1, arcs: 0.6 },
  { name: 'Earth-like', plumes: [2, 6], strength: 1, arcs: 1 },
  { name: 'busy', plumes: [7, 14], strength: 1.1, arcs: 1.4 },
  { name: 'over-active', plumes: [15, 30], strength: 1.35, arcs: 2 },
]; // arc volcanoes: chance per subduction event, cone height, tallest
const M_PER_KM = 150;   // surface height per km of crust (Airy isostasy: crust 2.8, mantle 3.3 g/cm^3)

export class Tectonics {
  // G: SimGrid. opts: { rng, plates: count, cont: Float64Array 0..1 (starting
  // continents), ocean: fraction under the sea, rate: [min, max] deg/Myr }
  constructor(G, opts) {
    this.G = G;
    const n = G.n, rng = this.rng = opts.rng;
    this.sinceRift = 0;
    this.collapse = 1;
    this.life = !!opts.life; // (shell-building life: limestone and chalk on warm shelves)
    this.oceanFrac = opts.ocean ?? 0.6;
    this.t = 0;
    const np = this.np = opts.plates;
    this.targetPlates = np;
    const rate = opts.rate || [0.25, 0.9];

    // plates: grown from seeds over a lumpy cost field, each at its own pace
    // (a few big plates, several small)
    const bump = new Float64Array(n);
    for (let c = 0; c < n; c++) bump[c] = (hashInts(c, rng.u32()) >>> 0) / 4294967296;
    smoothField(G, bump, Math.round(G.N / 8));
    const pace = new Float64Array(np);
    for (let p = 0; p < np; p++) pace[p] = dm.exp(rng.range(-0.6, 0.6));
    const owner = this.owner = new Int16Array(n).fill(-1);
    const heap = new Heap(n);
    const key = new Float64Array(n);
    for (let p = 0; p < np; p++) {
      let c;
      do c = Math.floor(rng.u32() / 4294967296 * n); while (owner[c] >= 0);
      owner[c] = p; key[c] = 0; heap.push(0, c);
    }
    while (heap.size) {
      const c = heap.pop(), k = heap.top, p = owner[c];
      for (let e = G.nStart[c]; e < G.nStart[c + 1]; e++) {
        const o = G.nbr[e];
        if (owner[o] >= 0) continue;
        owner[o] = p;
        key[o] = k + G.nDist[e] * pace[p] * (0.08 + 3 * bump[o] * bump[o]);
        heap.push(key[o], o);
      }
    }

    // a continent starts whole on one plate (the one holding most of it)
    {
      const comp = new Int32Array(n).fill(-1), stack = [];
      const votes = new Float64Array(np);
      for (let c0 = 0; c0 < n; c0++) {
        if (comp[c0] >= 0 || opts.cont[c0] <= 0.5) continue;
        const cells = [];
        stack.push(c0); comp[c0] = c0;
        while (stack.length) {
          const c = stack.pop(); cells.push(c);
          for (let e = G.nStart[c]; e < G.nStart[c + 1]; e++) { const o = G.nbr[e]; if (comp[o] < 0 && opts.cont[o] > 0.5) { comp[o] = c0; stack.push(o); } }
        }
        votes.fill(0);
        for (const c of cells) votes[owner[c]]++;
        let best = 0;
        for (let p = 1; p < np; p++) if (votes[p] > votes[best]) best = p;
        for (const c of cells) owner[c] = best;
      }
    }
    // each plate's frame starts as the world's
    const age0 = new Float64Array(n);
    for (let c = 0; c < n; c++) age0[c] = (hashInts(c, rng.u32()) >>> 0) / 4294967296;
    smoothField(G, age0, 8);
    this.plates = [];
    for (let p = 0; p < np; p++) {
      const ax = rng.unitVector(), w = rng.range(rate[0], rate[1]) * dm.PI / 180;
      const P = {
        id: p,
        M: new Float64Array([1, 0, 0, 0, 1, 0, 0, 0, 1]), // frame -> world
        w: [ax[0] * w, ax[1] * w, ax[2] * w],              // rad/Myr
        own: new Uint8Array(n), thick: new Float32Array(n), cont: new Float32Array(n),
        age: new Float32Array(n), rate: new Float32Array(n), // rate: thickening (km/Myr), smoothed
        relief: new Float32Array(n),                         // volcanoes, craters (m, carried, not floated)
        sed: new Float32Array(n), carb: new Float32Array(n), // sediment cover (m), and of it, limestone and chalk
        area: 0,
      };
      for (let c = 0; c < n; c++) {
        if (owner[c] !== p) continue;
        const k = opts.cont[c];
        P.own[c] = 1; P.cont[c] = k;
        P.thick[c] = OCEAN_KM + (CONT_KM - OCEAN_KM) * k + (opts.relief ? opts.relief[c] : 0);
        P.age[c] = 20 + 100 * age0[c];
        P.area++;
      }
      this.plates.push(P);
    }
    // a smooth field for rift lines to wander by
    this.wobble = new Float64Array(n);
    for (let c = 0; c < n; c++) this.wobble[c] = (hashInts(c, rng.u32()) >>> 0) / 4294967296;
    smoothField(G, this.wobble, Math.round(G.N / 6));
    this.wobble2 = new Float64Array(n); // (a finer wander on top)
    for (let c = 0; c < n; c++) this.wobble2[c] = (hashInts(c, rng.u32()) >>> 0) / 4294967296;
    smoothField(G, this.wobble2, Math.round(G.N / 20));
    this.src = new Int32Array(n);
    for (let c = 0; c < n; c++) this.src[c] = c;
    this.trench = new Float32Array(n);
    this.pair = new Float64Array(MAX_PLATES * MAX_PLATES); // continental collision contact per step
    this.weld = new Float64Array(MAX_PLATES * MAX_PLATES); // ... and over the last ~10 Myr
    // volcanic activity, a trait of the world: none, Earth-like, busy or
    // over-active (the generator's volcanism tips it up a tier)
    {
      // (the world's history picks it; else roll here)
      const r = rng.next(), v = opts.volcanism ?? 0.3;
      let tier = r < 0.15 ? 0 : r < 0.55 ? 1 : r < 0.85 ? 2 : 3;
      if (v > 0.6 && tier < 3) tier++;
      if (opts.activity != null) tier = opts.activity;
      const T = ACTIVITY[tier];
      this.activity = T;
      const nHot = opts.hotspots ?? Math.round(rng.range(T.plumes[0], T.plumes[1]));
      this.hot = [];
      for (let i = 0; i < nHot; i++) this.hot.push(this.newHotspot());
    }
    this.swell = new Float32Array(n);
    this.arcs = [];
    // scratch
    this.cP = new Int16Array(n * 4); this.cS = new Int32Array(n * 4); this.cN = new Uint8Array(n);
    this.newOwner = new Int16Array(n);
  }

  // the frame cell of plate P under world cell c
  frameCell(P, c) {
    const d = this.G.dir, M = P.M;
    const x = d[c * 3], y = d[c * 3 + 1], z = d[c * 3 + 2];
    // world -> frame: M transposed
    return this.G.cellAt(M[0] * x + M[3] * y + M[6] * z, M[1] * x + M[4] * y + M[7] * z, M[2] * x + M[5] * y + M[8] * z);
  }

  _dbg(tag) {
    if (!this.debug) return;
    let k = 0; for (const q of this.plates) if (!q.dead) for (let x = 0; x < this.G.n; x++) if (q.own[x] && q.cont[x] > 0.5) k++;
    const d = this.debug; if (d.last != null) d[tag] = (d[tag] || 0) + (k - d.last); d.last = k;
  }

  step(dt) {
    this.lastDt = dt;
    const { G, plates, owner, src, cP, cS, cN, newOwner, trench, pair } = this;
    const n = G.n;
    this._dbg('pre');
    for (const P of plates) rotate(P, dt);
    pair.fill(0);
    const sub = this._sub && this._sub.length >= plates.length ? this._sub : (this._sub = new Float64Array(MAX_PLATES));
    sub.fill(0);
    const st = this.stats || (this.stats = { collide: 0, gapCont: 0, subCont: 0, spreadGain: 0, arcGain: 0, sedGain: 0, mergeLoss: 0 });
    const wasCont = this._wasCont || (this._wasCont = new Uint8Array(n));
    for (let c = 0; c < n; c++) wasCont[c] = plates[owner[c]].cont[src[c]] > 0.5 ? 1 : 0;
    // who covers each cell now: the plates of it and its neighbours last step
    const cand = new Int16Array(9);
    for (let c = 0; c < n; c++) {
      let nc = 0;
      cand[nc++] = owner[c];
      for (let e = G.nStart[c]; e < G.nStart[c + 1]; e++) {
        const q = owner[G.nbr[e]];
        let seen = false;
        for (let k = 0; k < nc; k++) if (cand[k] === q) { seen = true; break; }
        if (!seen) cand[nc++] = q;
      }
      let k = 0;
      for (let i = 0; i < nc && k < 4; i++) {
        const P = plates[cand[i]], s = this.frameCell(P, c);
        if (P.own[s]) { cP[c * 4 + k] = cand[i]; cS[c * 4 + k] = s; k++; }
      }
      cN[c] = k;
    }
    // resolve
    for (let c = 0; c < n; c++) {
      const k = cN[c];
      trench[c] *= 0.7;
      if (k === 0) { newOwner[c] = -1; continue; }
      if (k === 1) { newOwner[c] = cP[c * 4]; src[c] = cS[c * 4]; continue; }
      // the lightest crust rides on top
      let o = 0, best = -Infinity;
      for (let i = 0; i < k; i++) {
        const P = plates[cP[c * 4 + i]], s = cS[c * 4 + i];
        const score = P.cont[s] * 10 - P.age[s] / 200 - cP[c * 4 + i] * 1e-6;
        if (score > best) { best = score; o = i; }
      }
      const O = plates[cP[c * 4 + o]], so = cS[c * 4 + o];
      newOwner[c] = O.id; src[c] = so;
      for (let i = 0; i < k; i++) {
        if (i === o) continue;
        const B = plates[cP[c * 4 + i]], sb = cS[c * 4 + i];
        if (!B.own[sb]) continue;
        B.own[sb] = 0; B.area--;
        if (B.cont[sb] > 0.5 && O.cont[so] <= 0.5) st.subCont++;
        if (B.cont[sb] > 0.5 && O.cont[so] > 0.5) {
          st.collide++;
          // continents meet: neither sinks, the crust stacks up on the plate in
          // front (part of the thickened root drops into the mantle)
          thicken(G, O, so, B.thick[sb] * STACK, dt);
          O.cont[so] = Math.max(O.cont[so], B.cont[sb]);
          pair[Math.min(O.id, B.id) * MAX_PLATES + Math.max(O.id, B.id)]++;
        } else {
          // ocean floor dives under: a trench here, an arc on the plate above
          trench[c] = 1;
          sub[B.id]++;
          if (this.rng.next() < ARC_P * this.activity.arcs) this.arcs.push(c, O.id);
          thicken(G, O, so, 0.9, dt);
          if (O.cont[so] < 0.5) { O.cont[so] = Math.min(1, O.cont[so] + 0.02); if (O.cont[so] > 0.5) st.arcGain++; } // island arcs grow new continent
        }
      }
    }
    this._dbg('collide');
    // gaps: new ocean floor on a neighbouring plate (a spreading ridge)
    for (let c = 0; c < n; c++) {
      if (newOwner[c] >= 0) continue;
      let p = -1;
      for (let e = G.nStart[c]; e < G.nStart[c + 1]; e++) { const q = newOwner[G.nbr[e]]; if (q >= 0 && (p < 0 || q < p)) p = q; }
      if (p < 0) p = owner[c];
      if (wasCont[c]) st.gapCont++;
      const P = plates[p], s = this.frameCell(P, c);
      if (!P.own[s]) {
        P.own[s] = 1; P.area++;
        P.thick[s] = OCEAN_KM; P.cont[s] = 0; P.age[s] = 0; P.rate[s] = 0; P.relief[s] = 0; P.sed[s] = 0; P.carb[s] = 0;
      }
      newOwner[c] = p; src[c] = s;
    }
    owner.set(newOwner);
    this._dbg('gaps');
    this.volcanoes(dt);
    this.clearGhosts();
    this._dbg('ghosts');
    // crust ages; thick crust relaxes; uplift rates fade
    const relax = this.coupled ? 0 : dt / RELAX_MYR, fade = dm.exp(-dt / 4), sink = dm.exp(-dt / SINK_MYR);
    for (const P of plates) {
      if (P.dead) continue;
      const { own, thick, cont, age, rate } = P;
      for (let s = 0; s < n; s++) {
        if (!own[s]) continue;
        if (cont[s] < 0.5) { age[s] += dt; if (P.relief[s] > 0) P.relief[s] *= sink; }
        if (thick[s] > CONT_KM) thick[s] -= (thick[s] - CONT_KM) * relax;
        rate[s] *= fade;
      }
    }
    // thick crust flows outward under its own weight (a plateau spreading,
    // a range collapsing): continental crust thicker than its neighbours
    // passes some on, so stacked continents widen again
    this._dbg('age');
    this.spread(dt);
    this._dbg('spread');
    // slab pull: a plate's speed heads for one set by how much of it is
    // sinking into trenches (direction kept)
    for (const P of plates) {
      const w = P.w, sp = Math.sqrt(w[0] * w[0] + w[1] * w[1] + w[2] * w[2]);
      if (sp < 1e-9) continue;
      const target = (SLOW + (FAST - SLOW) * Math.min(1, sub[P.id] / dt / (G.N * 0.12))) * dm.PI / 180;
      const k = 1 + (target / sp - 1) * Math.min(1, dt / 20);
      w[0] *= k; w[1] *= k; w[2] *= k;
    }
    // colliding continents lock together: their motions converge, and a
    // collision that goes on welds them into one plate
    const np = plates.length, fadeW = dm.exp(-dt / 20);
    for (let a = 0; a < np; a++) for (let b = a + 1; b < np; b++) {
      const i = a * MAX_PLATES + b;
      const touch = pair[i];
      this.weld[i] = this.weld[i] * fadeW + touch;
      if (!touch) continue;
      const A = plates[a], B = plates[b];
      if (A.dead || B.dead) continue;
      const k = Math.min(0.5, touch / G.N * 0.4 * dt);
      const wa = A.area / Math.max(1, A.area + B.area), wb = 1 - wa;
      for (let j = 0; j < 3; j++) {
        const m = A.w[j] * wa + B.w[j] * wb;
        A.w[j] += (m - A.w[j]) * k; B.w[j] += (m - B.w[j]) * k;
      }
      if (this.weld[i] > G.N * WELD) this.merge(A.area >= B.area ? A : B, A.area >= B.area ? B : A);
    }
    this._dbg('weld');
    this.maybeRift(dt);
    this._dbg('rift');
    this.t += dt;
  }

  newHotspot() {
    const rng = this.rng;
    const k = this.activity ? this.activity.strength : 1;
    return { at: rng.unitVector(), s: rng.range(0.5, 1.4) * k, life: rng.range(60, 220) * k, period: rng.range(2.5, 6), phase: rng.range(0, 6.283), cells: null, swellCells: null };
  }

  // world cells within an angle of a direction, with their angles
  cellsNear(at, ang) {
    const G = this.G, d = G.dir, out = [];
    const c0 = G.cellAt(at[0], at[1], at[2]);
    const seen = new Set([c0]), q = [c0];
    for (let i = 0; i < q.length; i++) {
      const c = q[i];
      const a = dm.acos(Math.min(1, d[c * 3] * at[0] + d[c * 3 + 1] * at[1] + d[c * 3 + 2] * at[2]));
      if (a > ang && c !== c0) continue;
      out.push(c, a);
      for (let e = G.nStart[c]; e < G.nStart[c + 1]; e++) { const o = G.nbr[e]; if (!seen.has(o)) { seen.add(o); q.push(o); } }
    }
    return out;
  }

  // hotspots build (in pulses) on whatever plate is over them; arc volcanoes
  // rise behind the trenches recorded this step
  volcanoes(dt) {
    const { G, plates, owner, src, rng } = this;
    const cell = G.spacing / G.R; // one cell, as an angle
    this.swell.fill(0);
    for (let i = 0; i < this.hot.length; i++) {
      let H = this.hot[i];
      H.life -= dt;
      if (H.life <= 0) { H = this.hot[i] = this.newHotspot(); (this.events || (this.events = [])).push({ t: this.t, kind: 'hotspot' }); }
      if (!H.cells) { H.cells = this.cellsNear(H.at, HOT_R * cell); H.swellCells = this.cellsNear(H.at, 9 * cell); }
      // the swell: hot mantle lifts the sea floor around it
      for (let k = 0; k < H.swellCells.length; k += 2) {
        const r = H.swellCells[k + 1] / (6 * cell);
        this.swell[H.swellCells[k]] += 700 * H.s * dm.exp(-r * r);
      }
      // a pulse of eruption: islands, not one long ridge
      const on = dm.sin(H.phase + this.t * 2 * dm.PI / H.period);
      if (on < 0.3) continue;
      for (let k = 0; k < H.cells.length; k += 2) {
        const c = H.cells[k], u = H.cells[k + 1] / (HOT_R * cell);
        const P = plates[owner[c]], s = src[c];
        const cap = HOT_CAP[P.cont[s] > 0.5 ? 1 : 0];
        // a shield: broad and low-angled (falling off as (1 - u)^1.5)
        if (P.relief[s] < cap) P.relief[s] = Math.min(cap, P.relief[s] + HOT_RATE * H.s * dt * dm.pow(1 - u, 1.5) * (on - 0.3) / 0.7);
      }
    }
    // arc volcanoes: a cone a couple of cells in from the trench
    const arcs = this.arcs;
    for (let k = 0; k < arcs.length; k += 2) {
      let c = arcs[k];
      const id = arcs[k + 1];
      for (let step = 0; step < 2; step++) {
        let best = -1, bn = -1;
        for (let e = G.nStart[c]; e < G.nStart[c + 1]; e++) {
          const o = G.nbr[e];
          if (owner[o] !== id) continue;
          let m = 0;
          for (let f = G.nStart[o]; f < G.nStart[o + 1]; f++) if (owner[G.nbr[f]] === id) m++;
          if (m > bn) { bn = m; best = o; }
        }
        if (best < 0) break;
        c = best;
      }
      if (owner[c] !== id) continue;
      const P = plates[id], d = G.dir;
      const near = this.cellsNear([d[c * 3], d[c * 3 + 1], d[c * 3 + 2]], 1.8 * cell);
      const h = ARC_CONE * rng.range(0.6, 1.3);
      for (let j = 0; j < near.length; j += 2) {
        const w = near[j], u = near[j + 1] / (1.8 * cell);
        if (owner[w] !== id) continue;
        const s = src[w];
        if (P.relief[s] < ARC_CAP) P.relief[s] = Math.min(ARC_CAP, P.relief[s] + h * (1 - u) * (1 - u));
      }
    }
    arcs.length = 0;
  }

  // Crust a plate's frame still holds but no world cell shows, with none of
  // its neighbours shown either, has gone under another plate: it's gone.
  // (A cell skipped where the rotated grid doesn't line up has shown
  // neighbours and stays.) Without this, such ghost crust surfaces in odd
  // collisions and blocks merges.
  clearGhosts() {
    const { G, plates, owner, src } = this;
    const n = G.n;
    const seen = this._seen || (this._seen = new Uint8Array(n));
    for (const P of plates) {
      if (P.dead) continue;
      seen.fill(0);
      for (let c = 0; c < n; c++) if (owner[c] === P.id) seen[src[c]] = 1;
      const { own } = P;
      for (let s = 0; s < n; s++) {
        if (!own[s] || seen[s]) continue;
        let near = false;
        for (let e = G.nStart[s]; e < G.nStart[s + 1]; e++) if (seen[G.nbr[e]]) { near = true; break; }
        if (!near) { own[s] = 0; P.area--; }
      }
    }
  }

  // plate B joins plate A: all of B's crust (shown or not) moves into A's
  // frame by its place in the world, and A carries on with their shared motion
  merge(A, B) {
    const { G, owner, src } = this;
    const n = G.n, d = G.dir, Ma = A.M, Mb = B.M;
    // A's frame cells it shows now (any others under B are hidden: B's crust wins there)
    const shownA = new Uint8Array(n), fromB = new Uint8Array(n);
    for (let c = 0; c < n; c++) if (owner[c] === A.id) shownA[src[c]] = 1;
    const put = (sa, sb) => {
      if (shownA[sa]) return;
      if (fromB[sa] && B.cont[sb] <= A.cont[sa]) return; // (two of B's cells here: keep the continent)
      if (!A.own[sa]) A.area++;
      A.own[sa] = 1; fromB[sa] = 1;
      A.thick[sa] = B.thick[sb]; A.cont[sa] = B.cont[sb]; A.age[sa] = B.age[sb]; A.rate[sa] = B.rate[sb]; A.relief[sa] = B.relief[sb]; A.sed[sa] = B.sed[sb]; A.carb[sa] = B.carb[sb];
    };
    for (let sb = 0; sb < n; sb++) {
      if (!B.own[sb]) continue;
      // B's frame -> world -> A's frame
      const x = d[sb * 3], y = d[sb * 3 + 1], z = d[sb * 3 + 2];
      const wx = Mb[0] * x + Mb[1] * y + Mb[2] * z, wy = Mb[3] * x + Mb[4] * y + Mb[5] * z, wz = Mb[6] * x + Mb[7] * y + Mb[8] * z;
      put(G.cellAt(Ma[0] * wx + Ma[3] * wy + Ma[6] * wz, Ma[1] * wx + Ma[4] * wy + Ma[7] * wz, Ma[2] * wx + Ma[5] * wy + Ma[8] * wz), sb);
    }
    // the world cells B showed: A's now (filling any A cell the forward map skipped)
    for (let c = 0; c < n; c++) {
      if (owner[c] !== B.id) continue;
      const sa = this.frameCell(A, c);
      if (!A.own[sa]) put(sa, src[c]);
      owner[c] = A.id; src[c] = sa;
    }
    const wa = A.area / Math.max(1, A.area + B.area);
    for (let j = 0; j < 3; j++) A.w[j] = A.w[j] * wa + B.w[j] * (1 - wa);
    B.own.fill(0); B.area = 0; B.dead = true;
    for (let k = 0; k < MAX_PLATES; k++) this.weld[Math.min(k, B.id) * MAX_PLATES + Math.max(k, B.id)] = 0;
    (this.events || (this.events = [])).push({ t: this.t, kind: 'weld', plate: A.id, into: B.id });
  }

  // a continent breaks up: the plate carrying the most continent splits
  maybeRift(dt) {
    const { G, plates, owner, src, rng } = this;
    this.sinceRift += dt;
    if (this.sinceRift < RIFT_MIN_MYR || plates.length >= MAX_PLATES) return;
    // fewer plates than the world started with: break-ups come sooner
    let live = 0;
    for (const P of plates) if (!P.dead) live++;
    const mean = RIFT_MYR * Math.min(1.5, Math.max(0.25, live / this.targetPlates));
    if (rng.next() > dt / mean) return;
    const n = G.n;
    const contArea = new Float64Array(plates.length), area = new Float64Array(plates.length);
    for (let c = 0; c < n; c++) { const P = plates[owner[c]]; area[P.id] += G.area[c]; if (P.cont[src[c]] > 0.5) contArea[P.id] += G.area[c]; }
    let A = null, best = 0, total = 0;
    for (let c = 0; c < n; c++) total += G.area[c];
    // a big continent first; failing that the biggest plate (ocean floor breaks up too)
    for (const P of plates) if (!P.dead && contArea[P.id] > best) { best = contArea[P.id]; A = P; }
    if (!A || best < total * 0.07) {
      best = 0;
      for (const P of plates) if (!P.dead && area[P.id] > best) { best = area[P.id]; A = P; }
      if (!A || best < total * 0.12) return;
    }
    // the line: a great circle through its continent's middle, wandering
    const d = G.dir, g = [0, 0, 0];
    const hasCont = contArea[A.id] > 0;
    for (let s = 0; s < n; s++) if (A.own[s] && (A.cont[s] > 0.5 || !hasCont)) { g[0] += d[s * 3]; g[1] += d[s * 3 + 1]; g[2] += d[s * 3 + 2]; }
    norm3(g);
    const r = rng.unitVector(), nrm = norm3([r[1] * g[2] - r[2] * g[1], r[2] * g[0] - r[0] * g[2], r[0] * g[1] - r[1] * g[0]]);
    // (rifts follow old weaknesses: the line wanders well off a great circle)
    const side = (s) => d[s * 3] * nrm[0] + d[s * 3 + 1] * nrm[1] + d[s * 3 + 2] * nrm[2] + (this.wobble[s] - 0.5) * 1.0 + (this.wobble2[s] - 0.5) * 0.25;
    const B = {
      id: plates.length, M: Float64Array.from(A.M), w: [0, 0, 0],
      own: new Uint8Array(n), thick: new Float32Array(n), cont: new Float32Array(n), age: new Float32Array(n), rate: new Float32Array(n), relief: new Float32Array(n), sed: new Float32Array(n), carb: new Float32Array(n), area: 0,
    };
    let plus = 0;
    for (let s = 0; s < n; s++) if (A.own[s] && side(s) > 0) plus++;
    if (plus < A.area * 0.2 || plus > A.area * 0.8) return; // (a sliver: not this time)
    this.sinceRift = 0;
    const near = 2.2 * G.spacing / G.R; // the rift zone, either side of the line
    for (let s = 0; s < n; s++) {
      if (!A.own[s]) continue;
      const x = side(s);
      if (Math.abs(x) < near && A.cont[s] > 0.5) A.thick[s] = Math.max(OCEAN_KM * 2, A.thick[s] * 0.82); // stretched thin
      if (x <= 0) continue;
      B.own[s] = 1; B.thick[s] = A.thick[s]; B.cont[s] = A.cont[s]; B.age[s] = A.age[s]; B.relief[s] = A.relief[s]; B.sed[s] = A.sed[s]; B.carb[s] = A.carb[s];
      A.own[s] = 0; A.area--; B.area++;
    }
    // they turn apart about an axis in the rift's plane (the line's own pole)
    const af = [nrm[1] * g[2] - nrm[2] * g[1], nrm[2] * g[0] - nrm[0] * g[2], nrm[0] * g[1] - nrm[1] * g[0]];
    const M = A.M, aw = [M[0] * af[0] + M[1] * af[1] + M[2] * af[2], M[3] * af[0] + M[4] * af[1] + M[5] * af[2], M[6] * af[0] + M[7] * af[1] + M[8] * af[2]];
    const wr = rng.range(0.25, 0.5) * dm.PI / 180 / 2;
    for (let i = 0; i < 3; i++) { B.w[i] = A.w[i] - wr * aw[i]; A.w[i] += wr * aw[i]; }
    plates.push(B);
    this.np = plates.length;
    for (let c = 0; c < n; c++) if (owner[c] === A.id && B.own[src[c]]) owner[c] = B.id;
    (this.events || (this.events = [])).push({ t: this.t, kind: 'rift', plate: A.id, into: B.id });
  }

  spread(dt) {
    const { G, plates } = this;
    const n = G.n;
    // the guard rail: the continents' mean thickness
    let vol = 0, cells = 0;
    for (const P of plates) {
      if (P.dead) continue;
      for (let s = 0; s < n; s++) if (P.own[s] && P.cont[s] >= 0.5) { vol += P.thick[s]; cells++; }
    }
    const mean = cells ? vol / cells : EQ_KM;
    this.collapse = mean > RAIL_KM[1] ? 1 + (mean - RAIL_KM[1]) : mean < RAIL_KM[0] ? 0 : 1;
    const d = this._spread || (this._spread = new Float32Array(n));
    for (const P of plates) {
      const { own, thick, cont } = P;
      d.fill(0);
      for (let s = 0; s < n; s++) {
        if (!own[s] || cont[s] < 0.5 || thick[s] <= CONT_KM) continue;
        const ex = thick[s] - CONT_KM;
        for (let e = G.nStart[s]; e < G.nStart[s + 1]; e++) {
          const o = G.nbr[e];
          if (!own[o] || thick[o] >= thick[s]) continue;
          // flow grows steeply with the excess (a thick lower crust is hot and
          // weak): plateaus slope away from their middles instead of filling
          // flat. A slower, linear part is extension: thickened continents
          // stretch, thin and widen back out (wide rifts, extended margins)
          const x = ex / 30;
          const f = (thick[s] - thick[o]) / 9 * Math.min(0.5, dt * x * x / SPREAD_MYR);
          d[s] -= f; d[o] += f;
        }
      }
      // extension: the whole continent thins toward EQ_KM and what it gives up
      // becomes new continental margin (the plate's ocean cells next to it)
      let freed = 0;
      const k = Math.min(1, dt * this.collapse / EXTEND_MYR);
      for (let s = 0; s < n; s++) {
        if (!own[s] || cont[s] < 0.5 || thick[s] <= EQ_KM) continue;
        const v = (thick[s] - EQ_KM) * k;
        d[s] -= v; freed += v;
      }
      if (freed > 0) {
        const margin = this._margin || (this._margin = []);
        margin.length = 0;
        for (let s = 0; s < n; s++) {
          if (!own[s] || cont[s] >= 0.5) continue;
          for (let e = G.nStart[s]; e < G.nStart[s + 1]; e++) { const o = G.nbr[e]; if (own[o] && cont[o] >= 0.5) { margin.push(s); break; } }
        }
        if (margin.length) {
          const each = freed / margin.length;
          for (const s of margin) d[s] += each;
        } else {
          // (no ocean beside it on this plate: it stays as it was)
          for (let s = 0; s < n; s++) if (own[s] && cont[s] >= 0.5 && thick[s] > EQ_KM) d[s] += (thick[s] - EQ_KM) * k;
        }
      }
      for (let s = 0; s < n; s++) {
        if (!d[s]) continue;
        thick[s] += d[s];
        if (d[s] > 0 && cont[s] < 1 && thick[s] > 12) { const was = cont[s]; cont[s] = Math.max(cont[s], Math.min(1, (thick[s] - 12) / 15)); if (was <= 0.5 && cont[s] > 0.5) this.stats.spreadGain++; }
      }
    }
  }

  // A deep-time step with erosion: the plates move, then the world's surface
  // (gathered from the plates) erodes for the same time on an Erosion over
  // this grid, and what it cut or laid down goes back into the crust of the
  // plate under each cell, so eroded land rides on with its plate. (Erosion's
  // height change is taken as the surface's after the crust rebounds.) Sea
  // floor built up with sediment becomes continental margin.
  stepEroded(dt, E) {
    const { G, plates, owner, src } = this;
    const n = G.n;
    this.coupled = true;
    this.step(dt);
    if (this.impacts) {
      const dMin = 3 * this.G.spacing / 1000;
      this.impacts.step(dt, dMin, (c, dh) => {
        const P = this.plates[this.owner[c]], s = this.src[c];
        P.relief[s] += P.cont[s] > 0.5 ? dh : dh * 0.5; // (the sea floor keeps less)
      }, this.t);
    }
    this.heights(E.h, null);
    const h0 = this._h0 || (this._h0 = new Float64Array(n));
    h0.set(E.h);
    E.U.fill(0); // the uplift is already in the crust
    // how easily each place wears: loose sediment fast, granite and basalt slowly
    if (this._K0 == null) this._K0 = E.K[0];
    for (let c = 0; c < n; c++) {
      const P = plates[owner[c]], s = src[c];
      E.K[c] = this._K0 * (P.sed[s] > 150 ? 2.0 : P.cont[s] > 0.5 ? 0.45 : 0.6);
    }
    E.step(dt * 1e6);
    this._dbg('pre');
    // back into the crust: the mean change of each frame cell
    const self = this;
    const sum = this._sum || (this._sum = new Float64Array(n)), cnt = this._cnt || (this._cnt = new Uint16Array(n));
    const sumH = this._sumH || (this._sumH = new Float64Array(n)), sumY = this._sumY || (this._sumY = new Float64Array(n));
    for (const P of plates) {
      sum.fill(0); cnt.fill(0); sumH.fill(0); sumY.fill(0);
      for (let c = 0; c < n; c++) if (owner[c] === P.id) { const q = src[c]; sum[q] += E.h[c] - h0[c]; cnt[q]++; sumH[q] += h0[c]; sumY[q] += Math.abs(G.dir[c * 3 + 1]); }
      for (let s = 0; s < n; s++) {
        if (!cnt[s] || !P.own[s]) continue;
        let dh = sum[s] / cnt[s];
        // the sediment record: laid down where it builds (limestone and chalk on warm,
        // shallow, living shelves), stripped first where it wears
        if (dh > 0) {
          P.sed[s] += dh;
          const depth = -sumH[s] / cnt[s];
          if (this.life && depth > 0 && depth < 300 && sumY[s] / cnt[s] < 0.55) P.carb[s] += dh;
        } else if (dh < 0 && P.sed[s] > 0) {
          const r = Math.min(P.sed[s], -dh);
          P.carb[s] -= r * (P.carb[s] / P.sed[s]); P.sed[s] -= r;
        }
        // volcanoes wear down first; craters fill first
        if (dh < 0 && P.relief[s] > 0) { const a = Math.min(P.relief[s], -dh); P.relief[s] -= a; dh += a; }
        else if (dh > 0 && P.relief[s] < 0) { const a = Math.min(-P.relief[s], dh); P.relief[s] += a; dh -= a; }
        P.thick[s] = Math.max(OCEAN_KM * 0.5, P.thick[s] + dh / M_PER_KM);
        if (P.cont[s] < 1 && P.thick[s] > 12) { const was = P.cont[s]; P.cont[s] = Math.max(P.cont[s], Math.min(1, (P.thick[s] - 12) / 15)); if (was <= 0.5 && P.cont[s] > 0.5) this.stats.sedGain++; }
      }
    }
    this._dbg('erode');
  }

  // heights (m, sea level 0) and uplift (m/yr) per world cell
  heights(h, U) {
    const { G, plates, owner, src, trench } = this;
    const n = G.n, area = G.area;
    for (let c = 0; c < n; c++) {
      const P = plates[owner[c]], s = src[c];
      const th = P.thick[s], k = P.cont[s];
      const land = (th - 31) * M_PER_KM;
      const sea = -seafloorDepth(P.age[s]) + Math.max(0, th - OCEAN_KM) * M_PER_KM;
      h[c] = k * land + (1 - k) * sea - trench[c] * 2500;
      // (rate holds the thickening summed with a fading memory: times (1 - fade) for the
      // average rate; capped at the fastest real ranges, ~10 mm/yr)
      if (U) U[c] = Math.min(0.01, Math.max(0, P.rate[s]) * (1 - dm.exp(-(this.lastDt || 0.5) / 4)) * M_PER_KM / 1e6);
    }
    // continental margins: a slope, not a step (the crust's part only)
    smoothRaw(G, h, 2);
    for (let c = 0; c < n; c++) h[c] += plates[owner[c]].relief[src[c]] + this.swell[c];
    // sea level: where the water covers the ocean fraction (area-weighted)
    const idx = this._idx || (this._idx = new Int32Array(n));
    for (let c = 0; c < n; c++) idx[c] = c;
    idx.sort((a, b) => h[a] - h[b] || a - b);
    let A = 0, total = 0;
    for (let c = 0; c < n; c++) total += area[c];
    let k = 0;
    while (k < n - 1 && A + area[idx[k]] < total * this.oceanFrac) A += area[idx[k++]];
    const sl = h[idx[k]];
    this.seaLevel = sl;
    for (let c = 0; c < n; c++) h[c] -= sl;
    return h;
  }
}

// depth (m) of ocean floor of an age (Myr): it sinks as it cools, levelling
// off after ~100 Myr (the GDH1 plate model, Stein & Stein 1992)
export function seafloorDepth(age) {
  return age < 20 ? 2600 + 365 * Math.sqrt(age) : 5651 - 2473 * dm.exp(-0.0278 * age);
}

// add dk km of crust around frame cell s of plate P: half on s, half over the
// cells of its ring the plate owns. Crust can't stand thicker than MAX_KM
// (it flows out from under its own weight): the excess fills the plate's
// cells outward from there, nearest first, so a pile-up becomes a plateau.
function thicken(G, P, s, dk, dt) {
  const { own, thick } = P;
  let ring = 0;
  for (let e = G.nStart[s]; e < G.nStart[s + 1]; e++) if (own[G.nbr[e]]) ring++;
  if (!ring) { place(G, P, s, dk, dt); return; }
  place(G, P, s, dk * 0.5, dt);
  for (let e = G.nStart[s]; e < G.nStart[s + 1]; e++) if (own[G.nbr[e]]) place(G, P, G.nbr[e], dk * 0.5 / ring, dt);
}

const _q = [], _seen = new Set();
function place(G, P, c, v, dt) {
  const { own, thick, rate } = P;
  const room0 = MAX_KM - thick[c];
  if (v <= room0) { thick[c] += v; rate[c] += v / dt; return; }
  // fill outward (breadth first) until it's all placed
  let left = v;
  _q.length = 0; _seen.clear();
  _q.push(c); _seen.add(c);
  for (let qi = 0; qi < _q.length && left > 0 && qi < 4000; qi++) {
    const x = _q[qi];
    const room = MAX_KM - thick[x];
    if (room > 0) { const a = Math.min(room, left); thick[x] += a; rate[x] += a / dt; left -= a; }
    for (let e = G.nStart[x]; e < G.nStart[x + 1]; e++) {
      const o = G.nbr[e];
      if (own[o] && !_seen.has(o)) { _seen.add(o); _q.push(o); }
    }
  }
  // what still has nowhere to go: the thickened root drops off into the
  // mantle (delamination)
}

// turn plate P by its angular velocity for dt: M <- Rot(w dt) M
function rotate(P, dt) {
  const w = P.w, a = Math.sqrt(w[0] * w[0] + w[1] * w[1] + w[2] * w[2]) * dt;
  if (a < 1e-12) return;
  const x = w[0] * dt / a, y = w[1] * dt / a, z = w[2] * dt / a;
  const c = dm.cos(a), s = dm.sin(a), t = 1 - c;
  const R = [t * x * x + c, t * x * y - s * z, t * x * z + s * y,
    t * x * y + s * z, t * y * y + c, t * y * z - s * x,
    t * x * z - s * y, t * y * z + s * x, t * z * z + c];
  const M = P.M, o = new Float64Array(9);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) o[i * 3 + j] = R[i * 3] * M[j] + R[i * 3 + 1] * M[3 + j] + R[i * 3 + 2] * M[6 + j];
  M.set(o);
}

function smoothRaw(G, f, iters) {
  const t = new Float64Array(G.n);
  for (let it = 0; it < iters; it++) {
    for (let c = 0; c < G.n; c++) {
      let s = f[c] * 2, w = 2;
      for (let e = G.nStart[c]; e < G.nStart[c + 1]; e++) { s += f[G.nbr[e]]; w++; }
      t[c] = s / w;
    }
    f.set(t);
  }
}

function norm3(v) { const l = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]) || 1; v[0] /= l; v[1] /= l; v[2] /= l; return v; }

export function smoothField(G, f, iters) {
  const t = new Float64Array(G.n);
  for (let it = 0; it < iters; it++) {
    for (let c = 0; c < G.n; c++) {
      let s = f[c] * 2, w = 2;
      for (let e = G.nStart[c]; e < G.nStart[c + 1]; e++) { s += f[G.nbr[e]]; w++; }
      t[c] = s / w;
    }
    f.set(t);
  }
  // stretch back to 0..1
  let lo = Infinity, hi = -Infinity;
  for (let c = 0; c < G.n; c++) { if (f[c] < lo) lo = f[c]; if (f[c] > hi) hi = f[c]; }
  for (let c = 0; c < G.n; c++) f[c] = (f[c] - lo) / Math.max(1e-12, hi - lo);
  return f;
}
