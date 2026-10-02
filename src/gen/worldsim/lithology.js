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

export const ROCKS = [
  // name, erodibility (x K), colour (sRGB), how steep it stands (deg, for later cliffs)
  { name: 'granite',   k: 0.45, color: '#8f8580', stand: 70 },  // continental basement (granite, gneiss)
  { name: 'basalt',    k: 0.6,  color: '#3e3c3a', stand: 75 },  // sea floor, lava flows, flood basalts
  { name: 'andesite',  k: 0.65, color: '#6b6560', stand: 70 },  // arc volcanoes
  { name: 'sandstone', k: 1.0,  color: '#b9875a', stand: 60 },  // rivers, deserts, beaches turned to rock
  { name: 'shale',     k: 2.0,  color: '#5f6457', stand: 30 },  // mud: lakes, deltas, deep sea
  { name: 'limestone', k: 0.8,  color: '#bdb7a6', stand: 65 },  // shells on warm shelves
  { name: 'chalk',     k: 1.4,  color: '#e9e6dc', stand: 55 },  // the finest shells, in warm clear seas
  { name: 'alluvium',  k: 3.0,  color: '#7c6a52', stand: 25 },  // loose river sand and gravel
  { name: 'salt',      k: 4.0,  color: '#e8dfd8', stand: 35 },  // evaporites in drying basins
  { name: 'regolith',  k: 2.2,  color: '#77746e', stand: 30 },  // impact rubble
  { name: 'ice',       k: 1.2,  color: '#e4eef5', stand: 40 },  // icy worlds' crust
];
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
// shallow, living shelves (chalk where it's clear, far from river mud),
// otherwise mud
export function marineRock(depth, warm, life, muddy) {
  if (life && warm && depth < 200) return muddy ? R.limestone : R.chalk;
  return R.shale;
}
