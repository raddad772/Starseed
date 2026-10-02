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
//   reefs      where there's complex life, coral builds up to the surface in warm,
//              clear, shallow water: fringing reefs along coasts, and atolls round
//              volcanic islands that sank away under them
//
// Runs each fine-epoch step after the rivers and the ice. The cells here are
// tens of km: cliffs and beaches are recorded where they are (and how high or
// how long), for the local detail to draw.

import * as dm from '../../core/dmath.js';
import { R as ROCK } from './lithology.js';

const REEF_GROW = 0.004;   // m/yr: a reef keeps pace with a slowly sinking floor
const REEF_DEPTH = 60;     // m: the deepest water corals build from

export class Coasts {
  // G: SimGrid; opts: { life: complex life (corals) ever on this world, warmLat: |sin lat| for warm seas }
  constructor(G, opts = {}) {
    this.G = G;
    const n = G.n;
    this.corals = !!opts.corals;
    this.warm = opts.warm ?? 0.5;
    this.energy = new Float32Array(n);   // wave exposure 0..1 (coastal cells)
    this.beach = new Float32Array(n);    // sand on the shore (m)
    this.sand = new Uint8Array(n);       // its rock type (coral sand, black sand, quartz sand)
    this.reef = new Float32Array(n);     // reef built (m)
    this.cliff = new Float32Array(n);    // sea cliff height (m) where the land meets the waves
    this.coast = new Uint8Array(n);      // 1: land touching the sea, 2: sea touching land
  }

  // which cells are coast, and how exposed each is (the share of open sea within ~6 cells)
  survey(h) {
    const { G, energy, coast } = this;
    const n = G.n;
    coast.fill(0);
    for (let c = 0; c < n; c++) {
      let wet = false, dry = false;
      for (let e = G.nStart[c]; e < G.nStart[c + 1]; e++) { if (h[G.nbr[e]] < 0) wet = true; else dry = true; }
      coast[c] = h[c] >= 0 ? (wet ? 1 : 0) : (dry ? 2 : 0);
    }
    for (let c = 0; c < n; c++) {
      if (!coast[c]) { energy[c] = 0; continue; }
      let sea = 0, all = 0;
      const seen = new Set([c]);
      let front = [c];
      for (let k = 0; k < 6; k++) {
        const next = [];
        for (const x of front) for (let e = G.nStart[x]; e < G.nStart[x + 1]; e++) {
          const o = G.nbr[e];
          if (seen.has(o)) continue;
          seen.add(o); next.push(o); all++;
          if (h[o] < 0) sea++;
        }
        front = next;
      }
      energy[c] = dm.smoothstep(0.3, 0.85, sea / Math.max(1, all));
    }
  }

  // one step of dt years: waves on the land's edge, sand on the shores, reefs in the shallows.
  // lith: the rock (lithology.js); qs: the rivers' sediment this step (erosion.js); T: temperatures
  step(h, lith, E, dt, warmK) {
    const { G, energy, coast, beach, sand, reef, cliff } = this;
    const n = G.n;
    this.survey(h);
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
        const supply = (E && E.qs ? E.qs[c] / G.area[c] : 0) + cut * 0.5;
        if (h[c] < 120 && steep < 400 && energy[c] < 0.95 && supply > 0) {
          beach[c] += supply;
          sand[c] = this.sandOf(c, lith);
        }
      } else if (h[c] < 0 && h[c] > -REEF_DEPTH && this.corals) {
        // coral: warm, clear (little river mud), shallow, building up to the surface
        const warm = Math.abs(G.dir[c * 3 + 1]) < this.warm * warmK;
        const muddy = E && E.qs ? E.qs[c] / G.area[c] > 0.002 * dt / 2.5e5 : false;
        if (warm && !muddy) {
          const g = Math.min(-h[c] - 1, REEF_GROW * dt);
          if (g > 0) { h[c] += g; reef[c] += g; lith.deposit(c, g, ROCK.limestone); }
        }
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
