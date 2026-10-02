// Coasts (WORLDSIM.md checklist 9): what the sea does to the edge of the land.
//
//   waves      each coast's exposure: how much open sea lies off it (headlands
//              take the swell, bays are sheltered); it wears the coast back,
//              faster in soft rock, and where hard rock (or chalk) meets strong
//              waves the land ends in sea cliffs (Dover's)
//   beaches    sand from river mouths and the worn coast settles on gentle,
//              not-too-wild shores, in its source's colour: white coral sand by
//              the reefs, black sand off basalt, golden quartz off granite and
//              sandstone
//   tides      the range from the moons and the star, amplified on broad shelves and in
//              funnelling bays; big tides on sheltered muddy shores make tidal flats
//   drift      barrier islands on sandy, shelving, microtidal coasts; spits off headlands
//   reefs      where there's complex life, coral builds up to the surface in warm,
//              clear, shallow water: fringing reefs along coasts, and atolls round
//              volcanic islands that sank away under them
//
// Runs each fine-epoch step after the rivers and the ice. The cells here are
// tens of km: cliffs and beaches are recorded where they are (and how high or
// how long), for the local detail to draw.

import * as dm from '../../core/dmath.js';
import { R as ROCK } from './lithology.js';
import { carbonateOK } from './materials.js';

const REEF_GROW = 0.004;   // m/yr: a reef keeps pace with a slowly sinking floor
const REEF_DEPTH = 60;     // m: the deepest water corals build from

export class Coasts {
  // G: SimGrid; opts: { life: complex life (corals) ever on this world, warmLat: |sin lat| for warm seas }
  constructor(G, opts = {}) {
    this.G = G;
    const n = G.n;
    this.corals = !!opts.corals;
    this.pH = opts.pH ?? 8.2;              // the sea's acidity: reefs need it above ~7.6 (materials.js)
    this.warm = opts.warm ?? 0.5;
    this.energy = new Float32Array(n);   // wave exposure 0..1 (coastal cells)
    this.beach = new Float32Array(n);    // sand on the shore (m)
    this.sand = new Uint8Array(n);       // its rock type (coral sand, black sand, quartz sand)
    this.reef = new Float32Array(n);     // reef built (m)
    this.cliff = new Float32Array(n);    // sea cliff height (m) where the land meets the waves
    this.coast = new Uint8Array(n);      // 1: land touching the sea, 2: sea touching land
    this.mud = new Float32Array(n);      // mud on sheltered shores (m): tidal flats, mangroves, marsh
  }

  // which cells are coast, and how exposed each is: the share of open sea within ~6 cells, as
  // the sea mask spread six times over each cell's neighbours (a smoothed mask, not a search
  // from every coastal cell). sea: which cells are sea (erosion.js's base: a dry hollow below
  // sea level isn't), else h < 0
  survey(h, sea) {
    const { G, energy, coast } = this;
    const n = G.n, nS = G.nStart, nb = G.nbr;
    const wet = this._wet || (this._wet = new Uint8Array(n));
    for (let c = 0; c < n; c++) wet[c] = sea ? (sea[c] === 1 ? 1 : 0) : (h[c] < 0 ? 1 : 0);
    this.wetAt = (c) => wet[c] === 1;
    let a = this._ea || (this._ea = new Float32Array(n)), t = this._eb || (this._eb = new Float32Array(n));
    const band = this._band || (this._band = new Int32Array(n)), seen = this._seen || (this._seen = new Uint8Array(n));
    let nb0 = 0;
    for (let c = 0; c < n; c++) {
      let w = false, d = false;
      for (let e = nS[c]; e < nS[c + 1]; e++) { if (wet[nb[e]]) w = true; else d = true; }
      coast[c] = !wet[c] ? (w ? 1 : 0) : (d ? 2 : 0);
      a[c] = wet[c]; t[c] = wet[c]; seen[c] = 0;
      if (coast[c]) { band[nb0++] = c; seen[c] = 1; }
    }
    // (only the coast's cells read the result, and only cells within five steps of the coast
    // change in six passes (the mask is even everywhere else): the passes run over that band, the
    // same sums as over the whole grid)
    let nBand = nb0, from = 0;
    for (let k = 0; k < 5; k++) {
      const to = nBand;
      for (let q = from; q < to; q++) { const c = band[q]; for (let e = nS[c]; e < nS[c + 1]; e++) { const o = nb[e]; if (!seen[o]) { seen[o] = 1; band[nBand++] = o; } } }
      from = to;
    }
    for (let k = 0; k < 6; k++) {
      for (let q = 0; q < nBand; q++) {
        const c = band[q];
        let s2 = a[c], m = 1;
        for (let e = nS[c]; e < nS[c + 1]; e++) { s2 += a[nb[e]]; m++; }
        t[c] = s2 / m;
      }
      const x = a; a = t; t = x;
    }
    for (let c = 0; c < n; c++) energy[c] = coast[c] ? dm.smoothstep(0.3, 0.85, a[c]) : 0;
    this._ea = a; this._eb = t;
  }

  // one step of dt years: waves on the land's edge, sand on the shores, reefs in the shallows.
  // lith: the rock (lithology.js); qs: the rivers' sediment this step (erosion.js); T: temperatures
  step(h, lith, E, dt, warmK) {
    const { G, energy, coast, beach, sand, reef, cliff } = this;
    const n = G.n;
    this.survey(h, E ? E.base : null);
    for (let c = 0; c < n; c++) {
      if (coast[c] === 1) {
        // waves: wear the edge toward a platform just under the surface, softer rock faster
        const rock = lith.top(c);
        const soft = rock === ROCK.alluvium || rock === ROCK.shale || rock === ROCK.regolith ? 1 : rock === ROCK.chalk || rock === ROCK.sandstone ? 0.5 : 0.2;
        const cut = Math.min(Math.max(0, h[c] + 5), energy[c] * soft * 0.002 * dt);
        if (cut > 0) { h[c] -= cut; lith.erode(c, cut); }
        // what stands: a cliff where it's high and the waves are strong (hard rock and chalk hold)
        cliff[c] = energy[c] > 0.4 && h[c] > 60 ? h[c] * (soft < 1 ? 1 : 0.4) : 0;
        // sand: from the rivers reaching here and the worn coast, kept where the shore is gentle
        let steep = 0;
        for (let e = G.nStart[c]; e < G.nStart[c + 1]; e++) steep = Math.max(steep, Math.abs(h[c] - h[G.nbr[e]]));
        // (waves carry sand off along the shore and out to sea each step: a beach lasts only
        // while it's fed; sheltered shores with plenty of river mud become mudflats instead:
        // tidal flats, mangroves, salt marsh)
        const supply = (E && E.qs ? E.qs[c] / G.area[c] : 0) + cut * 0.5;
        beach[c] *= 1 - Math.min(0.9, 0.5 * energy[c]);
        if (h[c] < 120 && steep < 400 && supply > 0) {
          if (energy[c] >= 0.3 && energy[c] < 0.95) { beach[c] += supply; sand[c] = this.sandOf(c, lith); }
          else if (energy[c] < 0.3) this.mud[c] += supply;
        }
      } else if (h[c] < 0 && h[c] > -REEF_DEPTH && this.corals && this.wetAt(c)) {
        // coral: warm, clear (little river mud), shallow, building up to the surface, as
        // fringing reefs along the land (within ~2 cells) or barrier reefs on a shelf's edge
        // (over deep water), or where it has already taken hold: not across whole shelves
        // (warm: with the climate model's seas, the coldest month above ~18 C, as corals need)
        const warm = this.sst ? this.sst[c] + (this.dT || 0) > 291 : Math.abs(G.dir[c * 3 + 1]) < this.warm * warmK;
        const muddy = E && E.qs ? E.qs[c] / G.area[c] > 0.002 * dt / 2.5e5 : false;
        let site = reef[c] > 0 || coast[c] === 2;
        if (!site) for (let e = G.nStart[c]; e < G.nStart[c + 1] && !site; e++) { const o = G.nbr[e]; if (coast[o] === 2 || h[o] < -150) site = true; }
        if (warm && !muddy && site) {
          const g = Math.min(-h[c] - 1, REEF_GROW * carbonateOK(this.pH) * dt);
          if (g > 0) { h[c] += g; reef[c] += g; lith.deposit(c, g, ROCK.limestone); }
        }
      }
    }
  }

  // tides: the open ocean's range (m, from the moons and the star) amplified where the
  // shelf is broad and shallow and where the coast funnels it into a bay (the Bay of
  // Fundy's 16 m); sheltered muddy shores with big tides are tidal flats: mangroves in warm
  // seas, salt marsh elsewhere. sst: the coldest month's sea (K)
  tides(h, open, sst) {
    const { G, coast } = this, n = G.n;
    this.tide = new Float32Array(n); this.flat = new Uint8Array(n);
    this.barrier = new Uint8Array(n); this.spit = new Uint8Array(n);
    for (let c = 0; c < n; c++) {
      if (!coast[c]) continue;
      // the shelf: shallow sea within ~4 cells; the funnel: how enclosed the water is
      let shallow = 0, all = 0, sea = 0;
      const seen = new Set([c]); let front = [c];
      for (let k = 0; k < 4; k++) {
        const next = [];
        for (const x of front) for (let e = G.nStart[x]; e < G.nStart[x + 1]; e++) {
          const o = G.nbr[e]; if (seen.has(o)) continue; seen.add(o); next.push(o); all++;
          if (h[o] < 0) { sea++; if (h[o] > -200) shallow++; }
        }
        front = next;
      }
      const shelf = sea ? shallow / sea : 0, enclosed = all ? 1 - sea / all : 0;
      const amp = 1 + 4 * shelf * shelf + 6 * Math.max(0, enclosed - 0.4) * shelf;
      this.tide[c] = 2 * open * amp;   // (range: twice the amplitude)
      if (coast[c] === 1 && this.mud[c] > 2 && this.tide[c] > 2) this.flat[c] = sst && sst[c] > 293 ? 2 : 1;
      // longshore drift's work (sub-cell: flagged for the local detail): barrier islands on
      // sandy coasts with a broad shallow shelf, modest tides and moderate waves (the
      // Carolinas'); spits where sand trails off a headland jutting into the sea
      if (coast[c] === 1 && this.beach[c] > 2) {
        if (shelf > 0.6 && this.tide[c] < 4 && this.energy[c] > 0.3 && this.energy[c] < 0.85) this.barrier[c] = 1;
        let land = 0; for (let e = G.nStart[c]; e < G.nStart[c + 1]; e++) if (h[G.nbr[e]] >= 0) land++;
        if (land <= 3) this.spit[c] = 1;
      }
    }
  }

  // a beach's sand: coral where reefs lie close, black off basalt, else the land's quartz
  sandOf(c, lith) {
    const G = this.G;
    for (let e = G.nStart[c]; e < G.nStart[c + 1]; e++) if (this.reef[G.nbr[e]] > 5) return ROCK['coral sand'];
    const r = lith.top(c);
    if (r === ROCK.basalt || r === ROCK.andesite) return ROCK['black sand'];
    if (r === ROCK.limestone || r === ROCK.chalk) return ROCK['coral sand'];
    return ROCK['quartz sand'];
  }
}
