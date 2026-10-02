// Rock: what each place is made of, layer on layer, how hard it is, and what
// colour it shows when it's laid bare (WORLDSIM.md checklist 7).
//
// Each cell has a short stack of layers (top first) over a basement: granite
// and gneiss under continents, basalt under the sea floor. Erosion strips the
// top layers; deposition lays new ones (sand and mud from rivers, mud on the
// sea floor, limestone and chalk on warm, shallow shelves where life builds
// shells, salt in drying basins, lava from volcanoes). How fast a place wears
// down follows the rock it shows (soft mud fast, granite slowly), so hard caps
// hold up plateaus and canyons step at hard bands; and the exposed rock is the
// colour the land shows. The stacks are what the local detail will carve into
// mesas, buttes and chalk cliffs (too small for this grid: a cell is tens of km).

import { MATERIALS, carbonateOK } from './materials.js';

// (the properties live in materials.js; this order is the index stored in the layers)
const ROCK_NAMES = ['granite', 'basalt', 'andesite', 'sandstone', 'shale', 'limestone', 'chalk', 'alluvium', 'salt', 'regolith', 'ice', 'quartz sand', 'coral sand', 'black sand'];
export const ROCKS = ROCK_NAMES.map((name) => ({ name, k: MATERIALS[name].k, color: MATERIALS[name].color, stand: MATERIALS[name].stand }));
export const R = Object.fromEntries(ROCKS.map((r, i) => [r.name, i]));
const KMULT = Float32Array.from(ROCKS.map((r) => r.k));

export class Lithology {
  // n cells, up to L layers each over a basement
  constructor(n, L = 8) {
    this.n = n; this.L = L;
    this.type = new Uint8Array(n * L);
    this.thick = new Float32Array(n * L);
    this.count = new Uint8Array(n);       // layers in use (index 0 = top)
    this.base = new Uint8Array(n);        // basement rock
  }

  top(c) { return this.count[c] ? this.type[c * this.L] : this.base[c]; }

  // dz metres off the top (into the basement once the layers are gone)
  erode(c, dz) {
    const L = this.L, o = c * L;
    while (dz > 0 && this.count[c]) {
      const t = this.thick[o];
      if (t > dz) { this.thick[o] = t - dz; return; }
      dz -= t;
      this.pop(c);
    }
  }

  // dz metres of a rock type on top (thickening the top layer if it's the same)
  deposit(c, dz, type) {
    if (dz <= 0) return;
    const L = this.L, o = c * L;
    if (this.count[c] && this.type[o] === type) { this.thick[o] += dz; return; }
    if (this.count[c] === L) {
      // full: merge the bottom two (the older rock keeps its type)
      this.thick[o + L - 2] += this.thick[o + L - 1];
      this.count[c]--;
    }
    for (let i = this.count[c]; i > 0; i--) { this.type[o + i] = this.type[o + i - 1]; this.thick[o + i] = this.thick[o + i - 1]; }
    this.type[o] = type; this.thick[o] = dz; this.count[c]++;
  }

  pop(c) {
    const L = this.L, o = c * L, k = this.count[c];
    for (let i = 1; i < k; i++) { this.type[o + i - 1] = this.type[o + i]; this.thick[o + i - 1] = this.thick[o + i]; }
    this.count[c] = k - 1;
  }

  // how thick the layers above the basement are (m)
  cover(c) { let s = 0; for (let i = 0; i < this.count[c]; i++) s += this.thick[c * this.L + i]; return s; }

  // erodibility for every cell: K0 x the exposed rock's
  kField(K0, out) { for (let c = 0; c < this.n; c++) out[c] = K0 * KMULT[this.top(c)]; return out; }

  exposed(out = new Uint8Array(this.n)) { for (let c = 0; c < this.n; c++) out[c] = this.top(c); return out; }
}

// the rock a sea floor lays down where sediment settles: carbonate on warm,
// shallow, living shelves (chalk where it's clear, far from river mud) if the sea
// isn't too acid for shells (pH: materials.js seaPH), otherwise mud
export function marineRock(depth, warm, life, muddy, pH = 8.2) {
  if (life && warm && depth < 200 && carbonateOK(pH) > 0.5) return muddy ? R.limestone : R.chalk;
  return R.shale;
}
