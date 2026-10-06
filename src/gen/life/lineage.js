// Lineages by realm (LIFE.md; Dave: "identify islands and continents early on and give them branching
// trees and have a chance of cross-pollination"). Each realm's animals descend along the realms' family
// tree (worldsim/world.js RealmTracker: landmasses colonised, split apart, meeting; the snapshot's
// `realms`): a body's traits drift as a random walk down each branch (Brownian motion, the
// phylogeneticists' model: kin apart t Myr differ as sqrt(t)), from the ruling lineage's founders when
// it took the land (or radiated after the last great extinction). So realms long apart hold very
// different animals, sister realms related ones; an interchange (landmasses meeting: the Americas')
// carries lineages across, some of each one's species descended from the other's; and on islands the
// island rule (Foster 1964; Lomolino 2005): the small grow bigger, the big smaller, the smaller the
// island. World state: from the world's seed, its history and its sim alone.
import * as dm from '../../core/dmath.js';
import { fmix32 } from '../../core/rng.js';

// the traits that drift (each in sd units; 0 the founders')
export const TRAITS = ['size', 'legs', 'slender', 'head', 'neck', 'tail', 'hue', 'shade', 'mark', 'crest'];
const NT = TRAITS.length;
const RATE = 0.13, BIN = 5;   // (sd a sqrt(Myr): ~1.3 sd apart after 100 Myr; the walk in 5 Myr steps)
const SPECIATION = 2;         // Myr apart before a population is a species of its own (~1-3 for mammals)
const SP_SD = 0.45, SP_T = 30; // (a realm's species apart from each other; a daughter realm's from its parent's, over ~30 Myr)

// a standard normal from a hash (Box-Muller on two of its draws)
function gauss(h) {
  const a = fmix32(h), b = fmix32(a ^ 0x68e31da4);
  const u = (a + 1) / 4294967297, v = b / 4294967296;
  return dm.sqrt(-2 * dm.log(u)) * dm.cos(dm.TWO_PI * v);
}
// realm r's own walk from `from` Myr ago to `to` Myr ago (to < from), added into out
function walk(seed, r, from, to, out) {
  if (!(from > to)) return out;
  for (let k = Math.floor(to / BIN); k * BIN < from; k++) {
    const lo = Math.max(to, k * BIN), hi = Math.min(from, (k + 1) * BIN), f = (hi - lo) / BIN;
    if (f <= 0) continue;
    const s = RATE * dm.sqrt(BIN * f);
    for (let i = 0; i < NT; i++) out[i] += s * gauss((seed ^ Math.imul(r + 1, 0x9e3779b1) ^ Math.imul(k + 7, 0x85ebca6b) ^ Math.imul(i + 3, 0xc2b2ae35)) >>> 0);
  }
  return out;
}

// the realms' lineages. realms: the snapshot's { tree: [{ id, parent, agoMyr, how, land }],
// interchanges: [{ agoMyr, realms }] }; t0: Myr ago the ruling lineage began to radiate (its era's
// start, or the land's first animals); seed: the world's
export function lineagesOf(realms, t0, seed) {
  const nodes = new Map((realms && realms.tree || []).map((r) => [r.id, r]));
  const memo = new Map();
  // a realm's traits at `ago` Myr: its parent's where it began (if after the radiation began), its
  // own walk since
  const at = (id, ago) => {
    const key = id + '@' + ago;
    if (memo.has(key)) return memo.get(key);
    const r = nodes.get(id), out = new Float64Array(NT);
    if (!r) { memo.set(key, out); return out; }
    const born = Math.min(r.agoMyr, t0);
    if (r.parent >= 0 && nodes.has(r.parent) && r.agoMyr < t0) out.set(at(r.parent, r.agoMyr));
    walk(seed, id, born, ago, out);
    memo.set(key, out);
    return out;
  };
  // (species j's own place among its realm's: its parent realm's species j's, moved on since they
  // parted; a founding realm's its own)
  const offset = (id, j) => {
    const r = nodes.get(id), out = new Float64Array(NT);
    let k = SP_SD;
    if (r && r.parent >= 0 && nodes.has(r.parent) && r.agoMyr < t0) { out.set(offset(r.parent, j)); k = SP_SD * dm.sqrt(Math.min(1, r.agoMyr / SP_T)); }
    for (let i = 0; i < NT; i++) out[i] += k * gauss((seed ^ Math.imul(id + 1, 0x27d4eb2f) ^ Math.imul(j + 1, 0x165667b1) ^ Math.imul(i + 11, 0x2545f491)) >>> 0);
    return out;
  };
  const meets = (id) => (realms && realms.interchanges || []).filter((x) => x.realms.includes(id)).map((x) => ({ other: x.realms[0] === id ? x.realms[1] : x.realms[0], agoMyr: Math.min(x.agoMyr, t0) }));
  return {
    nodes,
    // realm id's traits now (a Float64Array of TRAITS)
    now: (id) => at(id, 0),
    // the realm whose species a realm's are: its own, or its parent's where they parted too lately
    // for new species to have arisen
    identOf(id) {
      for (let r = nodes.get(id); r && r.parent >= 0 && nodes.has(r.parent) && r.agoMyr < SPECIATION; r = nodes.get(r.parent)) id = r.parent;
      return id;
    },
    // the traits of species j of a realm: its own lineage's, or (by its luck) descended from a realm
    // it met in an interchange (crossed then, its own walk since); and its own radiation within the
    // realm. Returns { traits, from } (from: the realm its line came from)
    species(id, j, luck) {
      let base = at(id, 0), from = id;
      const m = meets(id);
      if (m.length && luck < Math.min(0.5, 0.3 * m.length)) {
        const x = m[Math.floor(luck / 0.3) % m.length];
        if (nodes.has(x.other)) { base = walk(seed ^ 0x51ed27, (id * 977 + j) | 0, x.agoMyr, 0, Float64Array.from(at(x.other, x.agoMyr))); from = x.other; }
      }
      const out = Float64Array.from(base), o = offset(id, j);
      for (let i = 0; i < NT; i++) out[i] += o[i];
      return { traits: out, from };
    },
    // how long ago two realms' lines parted (Myr; t0 if only through the founders)
    apart(a, b) {
      const anc = new Map();
      for (let r = nodes.get(a), t = 0; r; r = nodes.get(r.parent)) { anc.set(r.id, t); t = r.agoMyr; }
      for (let r = nodes.get(b), t = 0; r; r = nodes.get(r.parent)) { if (anc.has(r.id)) return Math.min(t0, Math.max(t, anc.get(r.id))); t = r.agoMyr; }
      return t0;
    },
  };
}

// the island rule: a body's mass on a realm holding `share` of the world's land (Lomolino 2005: the
// smaller the island, the more the small grow and the big shrink, toward ~5-50 kg)
export function islandMass(M, share) {
  if (!(share < 0.03)) return M;
  const k = dm.clamp(dm.log(0.03 / Math.max(share, 1e-6)) / dm.log(100), 0, 1.5);
  return M > 50 ? M * dm.pow(50 / M, 0.35 * k) : M < 5 ? M * dm.pow(5 / M, 0.25 * k) : M;
}
