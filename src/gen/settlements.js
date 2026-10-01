// Settlement-site analysis: groundwork for future cities.
//
// Runs once per solid body (in a worker) over a geodesic icosphere grid:
//   1. sample terrain + climate at every cell
//   2. hydrology: priority-flood depression filling (Barnes et al. 2014) from
//      the ocean, steepest-descent flow directions, rainfall-weighted flow
//      accumulation -> river network, lakes (filled depressions)
//   3. score every land cell for settlement: flat ground, fresh water (rivers,
//      lakes), sheltered coasts and estuaries, temperate climate, fertile and
//      vegetated land, moderate elevation, defensible relief
//   4. pick the best sites with non-maximum suppression; trace the major rivers
//   5. places to start a game: the best landable spot of each kind (beside a
//      river, on the coast, in the mountains, in each biome, a crater floor...)
// Airless or hostile worlds get "outpost" scoring instead: flat ground near
// polar ice, crater rims, the terminator band of tidally locked planets.
// Fully deterministic (fixed grid, stable sort tie-breaks).

import { S_LEN, S_H, S_TEMP, S_MOIST, S_INLAND, S_MOUNT, S_CRATER } from './terrain.js';
import * as dm from '../core/dmath.js';

export const SETTLEMENT_VERSION = 2;

function icosphere(level) {
  const t = (1 + Math.sqrt(5)) / 2;
  let verts = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]];
  verts = verts.map((v) => { const l = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]); return [v[0] / l, v[1] / l, v[2] / l]; });
  let faces = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];
  for (let l = 0; l < level; l++) {
    const mid = new Map();
    const midpoint = (a, b) => {
      const key = a < b ? a * 1048576 + b : b * 1048576 + a;
      let m = mid.get(key);
      if (m === undefined) {
        const va = verts[a], vb = verts[b];
        let x = va[0] + vb[0], y = va[1] + vb[1], z = va[2] + vb[2];
        const n = Math.sqrt(x * x + y * y + z * z);
        verts.push([x / n, y / n, z / n]);
        m = verts.length - 1;
        mid.set(key, m);
      }
      return m;
    };
    const nf = [];
    for (const [a, b, c] of faces) {
      const ab = midpoint(a, b), bc = midpoint(b, c), ca = midpoint(c, a);
      nf.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]);
    }
    faces = nf;
  }
  const nbr = verts.map(() => new Set());
  for (const [a, b, c] of faces) { nbr[a].add(b).add(c); nbr[b].add(a).add(c); nbr[c].add(a).add(b); }
  return { verts, nbr: nbr.map((s) => Array.from(s).sort((x, y) => x - y)) };
}

// Binary min-heap keyed by (value, index) for deterministic order
class Heap {
  constructor() { this.v = []; this.i = []; }
  get size() { return this.v.length; }
  less(a, b) { return this.v[a] < this.v[b] || (this.v[a] === this.v[b] && this.i[a] < this.i[b]); }
  swap(a, b) { [this.v[a], this.v[b]] = [this.v[b], this.v[a]]; [this.i[a], this.i[b]] = [this.i[b], this.i[a]]; }
  push(val, idx) {
    this.v.push(val); this.i.push(idx);
    let c = this.v.length - 1;
    while (c > 0) { const p = (c - 1) >> 1; if (!this.less(c, p)) break; this.swap(c, p); c = p; }
  }
  pop() {
    const idx = this.i[0], val = this.v[0];
    const lv = this.v.pop(), li = this.i.pop();
    if (this.v.length) {
      this.v[0] = lv; this.i[0] = li;
      let c = 0;
      for (;;) {
        const l = 2 * c + 1, r = l + 1;
        let m = c;
        if (l < this.v.length && this.less(l, m)) m = l;
        if (r < this.v.length && this.less(r, m)) m = r;
        if (m === c) break;
        this.swap(c, m); c = m;
      }
    }
    return [val, idx];
  }
}

export function biomeName(Tc, W, h, ocean) {
  if (ocean) return 'ocean';
  if (Tc < -10) return 'ice sheet';
  if (Tc < -2) return 'tundra';
  if (W < 0.12) return Tc > 22 ? 'hot desert' : 'cold desert';
  if (Tc < 5) return W > 0.35 ? 'boreal forest' : 'steppe';
  if (Tc < 20) return W > 0.5 ? 'temperate forest' : (W > 0.25 ? 'grassland' : 'shrubland');
  return W > 0.6 ? 'rainforest' : (W > 0.3 ? 'savanna' : 'scrub');
}

export function analyzeSettlements(gen, opts = {}) {
  const level = opts.level || 6;
  const R = gen.R;
  const { verts, nbr } = icosphere(level);
  const n = verts.length;
  const cellM = R * 1.15 / Math.sqrt(n / 10); // ~ mean cell spacing (m)
  const minW = Math.max(cellM * 0.5, 200);
  const h = new Float64Array(n), rawH = new Float64Array(n), T = new Float64Array(n), W = new Float64Array(n);
  const inland = new Float64Array(n), mount = new Float64Array(n), crater = new Float64Array(n);
  const s = new Float64Array(S_LEN);
  const hasSea = !!gen.p.liquid && gen.contThreshold > -1e8 && gen.p.liquid !== 'lava';
  const liquidWater = gen.p.liquid === 'water';
  for (let i = 0; i < n; i++) {
    const v = verts[i];
    gen.sample(v[0], v[1], v[2], minW, s);
    rawH[i] = s[S_H];
    h[i] = hasSea && s[S_H] < 0 ? 0 : s[S_H];
    T[i] = s[S_TEMP]; W[i] = s[S_MOIST]; inland[i] = s[S_INLAND]; mount[i] = s[S_MOUNT]; crater[i] = s[S_CRATER];
  }
  const ocean = new Uint8Array(n);
  for (let i = 0; i < n; i++) ocean[i] = hasSea && rawH[i] < 0 ? 1 : 0;

  // slope (rise/run, max over neighbours) and local relief
  const slope = new Float64Array(n), relief = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    let sm = 0, rmin = h[i], rmax = h[i];
    const vi = verts[i];
    for (const j of nbr[i]) {
      const vj = verts[j];
      const dx = vi[0] - vj[0], dy = vi[1] - vj[1], dz = vi[2] - vj[2];
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz) * R;
      sm = Math.max(sm, Math.abs(h[i] - h[j]) / d);
      rmin = Math.min(rmin, h[j]); rmax = Math.max(rmax, h[j]);
    }
    slope[i] = sm; relief[i] = rmax - rmin;
  }

  // ---- hydrology
  const filled = Float64Array.from(h);
  const down = new Int32Array(n).fill(-1);
  const acc = new Float64Array(n);
  const lake = new Uint8Array(n);
  let rivers = [];
  const doHydro = liquidWater && hasSea;
  if (doHydro) {
    const heap = new Heap();
    const done = new Uint8Array(n);
    for (let i = 0; i < n; i++) if (ocean[i]) { heap.push(h[i], i); done[i] = 1; }
    const order = [];
    while (heap.size) {
      const [z, c] = heap.pop();
      order.push(c);
      for (const j of nbr[c]) {
        if (done[j]) continue;
        done[j] = 1;
        // raise pits to spill height plus a tiny gradient so flow is defined
        if (filled[j] <= z) { filled[j] = z + 1e-3; lake[j] = (filled[j] - h[j]) > 30 && W[j] > 0.25 ? 1 : 0; }
        down[j] = c; // the cell we were reached from drains this one (priority-flood flow)
        heap.push(filled[j], j);
      }
    }
    // prefer true steepest descent where it exists on the filled surface
    for (let i = 0; i < n; i++) {
      if (ocean[i]) { down[i] = -1; continue; }
      let best = down[i], bz = best >= 0 ? filled[best] : Infinity;
      for (const j of nbr[i]) if (filled[j] < bz && filled[j] < filled[i]) { bz = filled[j]; best = j; }
      down[i] = best;
    }
    // accumulate rainfall from highest to lowest
    const idx = Array.from({ length: n }, (_, i) => i).filter((i) => !ocean[i]);
    idx.sort((a, b) => (filled[b] - filled[a]) || (a - b));
    for (const i of idx) acc[i] += Math.max(0, W[i] - 0.08) * (T[i] > 263 ? 1 : 0.3);
    for (const i of idx) if (down[i] >= 0 && !ocean[down[i]]) acc[down[i]] += acc[i];
    // river mouths: land cells draining into the ocean
    let maxAcc = 0;
    for (let i = 0; i < n; i++) if (acc[i] > maxAcc) maxAcc = acc[i];
    const riverMin = Math.max(6, maxAcc * 0.02);
    const mouths = [];
    for (let i = 0; i < n; i++) if (!ocean[i] && down[i] >= 0 && ocean[down[i]] && acc[i] >= riverMin) mouths.push(i);
    mouths.sort((a, b) => (acc[b] - acc[a]) || (a - b));
    // upstream adjacency
    const ups = Array.from({ length: n }, () => []);
    for (let i = 0; i < n; i++) if (down[i] >= 0) ups[down[i]].push(i);
    for (const m of mouths.slice(0, 40)) {
      const path = [];
      let c = m;
      while (c >= 0 && acc[c] >= riverMin * 0.5 && path.length < 400) {
        path.push(verts[c]);
        let next = -1, na = -1;
        for (const u of ups[c]) if (acc[u] > na || (acc[u] === na && u < next)) { na = acc[u]; next = u; }
        c = next;
      }
      if (path.length >= 3) rivers.push({ mouth: verts[m], flux: acc[m], length: path.length * cellM, path: path.reverse() });
    }
    rivers.riverMin = riverMin;
  }
  const riverMin = rivers.riverMin || Infinity;

  // ---- scoring
  const cl = gen.p.climate;
  const habitable = liquidWater && cl.Tmean > 250 && cl.Tmean < 330;
  const score = new Float64Array(n);
  const isLand = (i) => !ocean[i] && !(gen.p.liquid === 'lava' && rawH[i] < 0);
  for (let i = 0; i < n; i++) {
    if (!isLand(i)) { score[i] = -1; continue; }
    const Tc = T[i] - 273.15;
    const flat = 1 - dm.smoothstep(0.015, 0.12, slope[i]);
    if (flat <= 0) { score[i] = 0; continue; }
    let oceanNbr = 0;
    for (const j of nbr[i]) if (ocean[j]) oceanNbr++;
    const coastal = oceanNbr > 0 ? 1 : 0;
    const harbor = coastal && oceanNbr <= 2 ? 1 : 0; // sheltered bay
    const v = verts[i];
    const lat = Math.abs(dm.asin(dm.clamp(v[1], -1, 1)));
    let sc;
    if (habitable) {
      const climate = dm.exp(-((Tc - 16) / 11) * ((Tc - 16) / 11));
      const fertile = dm.smoothstep(0.15, 0.55, W[i]);
      const riverF = acc[i] >= riverMin ? dm.clamp(dm.log(acc[i] / riverMin) / 3 + 0.4, 0, 1) : 0;
      let lakeShore = 0;
      for (const j of nbr[i]) if (lake[j]) lakeShore = 1;
      const estuary = coastal && riverF > 0 ? 1 : 0;
      const lowland = 1 - dm.smoothstep(500, 2500, h[i]);
      const defense = dm.smoothstep(40, 400, relief[i]) * (1 - dm.smoothstep(800, 2000, relief[i]));
      sc = flat * (0.9 * climate + 0.6 * fertile + 0.7 * riverF + 0.45 * coastal + 0.35 * harbor + 0.8 * estuary + 0.35 * lakeShore + 0.25 * lowland + 0.15 * defense);
      if (Tc < -4 || W[i] < 0.06 && riverF === 0) sc *= 0.2;
    } else {
      // outposts: flat ground, near polar ice / crater rims / the terminator
      let resource = 0;
      if (cl.locked) {
        const ss = cl.substellar;
        const cp = v[0] * ss[0] + v[1] * ss[1] + v[2] * ss[2];
        resource = 1 - Math.abs(cp) * 2; // terminator band
      } else {
        resource = dm.smoothstep(1.0, 1.4, lat); // polar ice in shadowed craters
      }
      let rim = 0;
      for (const j of nbr[i]) rim = Math.max(rim, crater[j] - crater[i]);
      const climateOK = 1 - dm.smoothstep(380, 600, T[i]);
      sc = flat * (0.6 + 0.8 * dm.clamp(resource, 0, 1) + 0.5 * dm.clamp(rim * 4, 0, 1) + 0.2 * (1 - mount[i])) * climateOK;
    }
    score[i] = sc;
  }

  // ---- select sites: greedy non-maximum suppression
  const minSep = opts.minSeparation || Math.max(0.12, 3.2 / Math.sqrt(n / 10) * 2.5); // radians
  const cosSep = Math.cos(minSep);
  const order = Array.from({ length: n }, (_, i) => i).filter((i) => score[i] > 0);
  order.sort((a, b) => (score[b] - score[a]) || (a - b));
  const sites = [];
  const maxSites = opts.maxSites || 24;
  for (const i of order) {
    const v = verts[i];
    let ok = true;
    for (const st of sites) if (v[0] * st.dir[0] + v[1] * st.dir[1] + v[2] * st.dir[2] > cosSep) { ok = false; break; }
    if (!ok) continue;
    let oceanNbr = 0, lakeShore = false;
    for (const j of nbr[i]) { if (ocean[j]) oceanNbr++; if (lake[j]) lakeShore = true; }
    const Tc = T[i] - 273.15;
    const reasons = [];
    if (habitable) {
      if (acc[i] >= riverMin && oceanNbr) reasons.push('river mouth');
      else if (acc[i] >= riverMin) reasons.push('river');
      if (oceanNbr && oceanNbr <= 2) reasons.push('sheltered harbour');
      else if (oceanNbr) reasons.push('coast');
      if (lakeShore) reasons.push('lake shore');
      if (slope[i] < 0.03) reasons.push('flat plain');
      if (Math.abs(Tc - 16) < 8) reasons.push('mild climate');
      if (W[i] > 0.45) reasons.push('fertile');
    } else {
      if (slope[i] < 0.03) reasons.push('flat ground');
      if (cl.locked) reasons.push('terminator band');
      else if (Math.abs(v[1]) > 0.85) reasons.push('polar ice access');
      reasons.push('outpost');
    }
    sites.push({
      rank: sites.length + 1,
      kind: habitable ? 'city' : 'outpost',
      dir: [v[0], v[1], v[2]],
      lat: dm.asin(dm.clamp(v[1], -1, 1)) * 180 / dm.PI,
      lon: dm.atan2(v[2], v[0]) * 180 / dm.PI,
      score: Math.round(score[i] * 1000) / 1000,
      elevation: Math.round(h[i]),
      slope: Math.round(slope[i] * 1000) / 1000,
      temperatureC: Math.round(Tc * 10) / 10,
      moisture: Math.round(W[i] * 100) / 100,
      riverFlux: Math.round(acc[i] * 10) / 10,
      coastal: oceanNbr > 0,
      biome: habitable ? biomeName(Tc, W[i], h[i], false) : (gen.p.icy ? 'icy plain' : (crater[i] > 0.1 ? 'crater floor' : 'regolith plain')),
      reasons,
    });
    if (sites.length >= maxSites) break;
  }

  // ---- places to start: the best spot of each kind, on ground flat enough to land
  const spots = [];
  const liquid = gen.p.liquid;
  const flatF = (i) => 1 - dm.smoothstep(0.01, 0.09, slope[i]);
  const mild = (i) => { if (!habitable) return 1; const d = (T[i] - 273.15 - 16) / 14; return dm.exp(-d * d); };
  const biomeOf = (i) => habitable ? biomeName(T[i] - 273.15, W[i], h[i], false) : (gen.p.icy ? 'icy plain' : (crater[i] > 0.1 ? 'crater floor' : 'regolith plain'));
  const count = (i, f) => { let c = 0; for (const j of nbr[i]) if (f(j)) c++; return c; };
  let maxH = 1;
  for (let i = 0; i < n; i++) if (isLand(i) && h[i] > maxH) maxH = h[i];
  const best = (key, label, fit, maxSlope = 0.09) => {
    let bi = -1, bs = 0;
    for (let i = 0; i < n; i++) {
      if (!isLand(i) || slope[i] > maxSlope) continue;
      const f = fit(i);
      if (f > bs) { bs = f; bi = i; }
    }
    if (bi < 0) return;
    const v = verts[bi];
    spots.push({
      key, label, dir: [v[0], v[1], v[2]],
      biome: biomeOf(bi), elevation: Math.round(h[bi]), temperatureC: Math.round(T[bi] - 273.15),
    });
  };
  if (doHydro) {
    const riverF = (i) => acc[i] >= riverMin ? 0.5 + Math.min(1, dm.log(acc[i] / riverMin) / 3) : 0;
    best('river', 'Beside a river', (i) => count(i, (j) => ocean[j]) ? 0 : flatF(i) * riverF(i) * (0.4 + mild(i)));
    best('mouth', 'Where a river meets the sea', (i) => count(i, (j) => ocean[j]) ? flatF(i) * riverF(i) * (0.4 + mild(i)) : 0);
    best('lake', 'On a lake shore', (i) => count(i, (j) => lake[j]) ? flatF(i) * (0.4 + mild(i)) : 0);
  }
  if (hasSea) {
    best('coast', liquid === 'water' ? 'On the coast' : `On the shore of a ${liquid} sea`,
      (i) => count(i, (j) => ocean[j]) && acc[i] < riverMin ? flatF(i) * (0.4 + mild(i)) * (h[i] < 60 ? 1.2 : 1) : 0);
  }
  if (liquid === 'lava') best('lava', 'On the shore of a lava sea', (i) => flatF(i) * Math.min(3, count(i, (j) => rawH[j] < 0)));
  best('plain', 'Out on the open plains', (i) => flatF(i) * flatF(i) * (1 - dm.smoothstep(20, 300, relief[i])) * (0.4 + mild(i)) * (1 - h[i] / maxH * 0.5));
  best('mountain', 'High in the mountains', (i) => h[i] > maxH * 0.45 ? flatF(i) * (h[i] / maxH) * (h[i] / maxH) * (0.5 + mount[i]) : 0);
  if (habitable) {
    // each biome that covers a fair share of the land: its most typical flat spot
    const area = new Map();
    for (let i = 0; i < n; i++) if (isLand(i)) { const b = biomeOf(i); area.set(b, (area.get(b) || 0) + 1); }
    const biomes = [...area.entries()].filter(([, c]) => c >= 24).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1));
    const phrase = { 'ice sheet': 'On the ice sheet', tundra: 'On the tundra', steppe: 'On the steppe', grassland: 'Out on the grasslands',
      savanna: 'On the savanna', 'hot desert': 'In the hot desert', 'cold desert': 'In the cold desert', scrub: 'In the scrubland' };
    for (const [name] of biomes) {
      best('biome-' + name.replace(/ /g, '-'), phrase[name] || `In the ${name}`, (i) => biomeOf(i) === name ? flatF(i) * (0.3 + count(i, (j) => isLand(j) && biomeOf(j) === name) / 6) * (0.5 + mild(i)) : 0);
    }
  } else {
    best('crater', 'On a crater floor', (i) => crater[i] > 0.2 ? flatF(i) * crater[i] : 0);
    best('rim', 'On a crater rim', (i) => { let rim = 0; for (const j of nbr[i]) rim = Math.max(rim, crater[j] - crater[i]); return flatF(i) * rim; });
    if (cl.locked) {
      const ss = cl.substellar;
      best('terminator', 'On the terminator, the sun on the horizon', (i) => { const v = verts[i]; return flatF(i) * Math.max(0, 1 - Math.abs(v[0] * ss[0] + v[1] * ss[1] + v[2] * ss[2]) * 4); });
    } else best('polar', 'Near the pole', (i) => Math.abs(verts[i][1]) > 0.8 ? flatF(i) * Math.abs(verts[i][1]) : 0);
  }
  // small, lumpy bodies: just the flattest ground there is
  if (!spots.length) best('surface', 'On the surface', (i) => 1 / (0.01 + slope[i]), Infinity);

  let land = 0, lakes = 0;
  for (let i = 0; i < n; i++) { if (!ocean[i]) land++; if (lake[i]) lakes++; }
  return {
    version: SETTLEMENT_VERSION,
    gridCells: n, cellSize: Math.round(cellM),
    landFraction: land / n, lakeCells: lakes,
    habitable,
    sites,
    spots,
    rivers: rivers.slice(0, 24).map((r) => ({ mouth: r.mouth, flux: Math.round(r.flux), length: Math.round(r.length), path: r.path })),
  };
}
