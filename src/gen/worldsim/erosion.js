// Fluvial erosion over geological time on a SimGrid: rivers cut down in
// proportion to the water they carry and their slope (the stream power law,
// E = K A^m S, solved implicitly so any time step is stable: Braun & Willett
// 2013, "FastScape"), the land rises with tectonic uplift, and what is cut is
// carried downstream and laid down in lakes and on the sea floor (shelves,
// deltas).
//
// Each step:
//   route    priority-flood the surface from the base level (the sea, or the
//            lowest basins of a dry world): every cell gets a receiver (the
//            steepest way down the filled surface, so water crosses lakes to
//            their spill points) and a downstream-first order
//   lakes    the water standing in the basins, and (given the climate's evaporation)
//            each lake's balance: a lake that can't fill to its brim is closed
//            (the Dead Sea's, the Great Salt Lake's): nothing leaves it, water or
//            sediment; it stands lower, salty, or dries to a salt flat
//   drain    rain-weighted drainage area, summed down the tree (stopping at closed lakes)
//   incise   the implicit stream-power solve, downstream first
//   deposit  sediment down the tree into lakes, then over the sea floor
//
// Everything is flat typed arrays; transcendental math goes through dmath so
// every machine carves the same valleys.

import * as dm from '../../core/dmath.js';
import { hashInts } from '../../core/rng.js';
import { routeNative } from './native.js';

// a binary min-heap of (key, cell), ties broken by cell index (deterministic)
export class Heap {
  constructor(cap) { this.k = new Float64Array(cap); this.v = new Int32Array(cap); this.size = 0; }
  less(a, b) { const ka = this.k[a], kb = this.k[b]; return ka < kb || (ka === kb && this.v[a] < this.v[b]); }
  swap(a, b) {
    const k = this.k[a]; this.k[a] = this.k[b]; this.k[b] = k;
    const v = this.v[a]; this.v[a] = this.v[b]; this.v[b] = v;
  }
  push(key, cell) {
    let i = this.size++;
    this.k[i] = key; this.v[i] = cell;
    while (i > 0) { const p = (i - 1) >> 1; if (!this.less(i, p)) break; this.swap(i, p); i = p; }
  }
  pop() { // returns the cell; its key is left in this.top
    const cell = this.v[0];
    this.top = this.k[0];
    const n = --this.size;
    if (n > 0) {
      this.k[0] = this.k[n]; this.v[0] = this.v[n];
      let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < n && this.less(l, m)) m = l;
        if (r < n && this.less(r, m)) m = r;
        if (m === i) break;
        this.swap(i, m); i = m;
      }
    }
    return cell;
  }
}

const EPS = 1e-4; // the gradient laid across filled lakes and flats (m per cell)
const SEA_MIN = 0.002; // the smallest sea (share of the surface; smaller hollows are basins)
const SILL = 10;       // m: water below sea level joined to a sea over a sill lower than this is sea
const SALT = 1.5e-4;   // salt left per m^3 of river water evaporated away (m^3)
const SPILL_K = 5;     // how much harder an overflowing lake's spillway cuts

export class Erosion {
  // G: SimGrid; h: heights (m, sea level 0), edited in place
  // opts: { sea: true if there's an ocean (else the lowest basins drain a dry world),
  //         K: erodibility per cell (or a number), m: drainage exponent,
  //         rain: per cell 0..1 (or a number), shelf: depth (m) the sea floor fills to }
  constructor(G, h, opts = {}) {
    this.G = G;
    this.h = h;
    const n = G.n;
    this.sea = opts.sea !== false;
    this.m = opts.m ?? 0.45;
    this.K = typeof opts.K === 'number' ? new Float64Array(n).fill(opts.K) : opts.K;
    this.rain = typeof opts.rain === 'number' || opts.rain == null ? new Float64Array(n).fill(opts.rain ?? 1) : opts.rain;
    this.shelf = opts.shelf ?? 60;
    this.kd = opts.kd ?? 0;
    // water picks among the downhill neighbours in proportion to their slope
    // (a different draw each step) rather than always the steepest: the grid's
    // eight directions stop showing through as straight, parallel channels
    this.wander = opts.wander ?? true;
    this.nStep = 0;                // hillslope creep (m^2/yr): soil sliding downhill, below the grid's scale
    this.U = new Float64Array(n);          // uplift (m/yr)
    this.base = new Uint8Array(n);         // 1: sea (or a dry world's sink)
    this.fill = new Float64Array(n);       // the filled surface (lakes level)
    this.rcv = new Int32Array(n);          // receiver, -1 at the base level
    this.rcvD = new Float64Array(n);       // distance to it (m)
    this.order = new Int32Array(n);        // downstream first
    this.A = new Float64Array(n);          // rain-weighted drainage area (m^2)
    this.qs = new Float64Array(n);         // sediment passing through (m^3 per step)
    this.eroded = new Float64Array(n);     // total cut (m), for the maps
    this.heap = new Heap(n);
    this.t = 0;
    // lakes: the climate's potential evaporation (m/yr per cell; null: every lake fills and spills)
    this.pet = opts.pet || null;
    this.petK = 1;                         // (the climate then vs now)
    this.lakeId = new Int32Array(n);       // which lake a cell lies under (-1: none)
    this.lakeKind = new Uint8Array(n);     // 1 fresh lake, 2 salt lake, 3 salt flat
    this.water = new Float64Array(n);      // the water's surface (h where there's none)
    this.saltDz = new Float64Array(n);     // salt laid down this step (m)
    this.lakeList = [];
  }

  // the base level: the sea on a world with one (connected water below sea level big
  // enough to be a sea: an inland hollow below sea level is a basin like any other, the
  // Dead Sea's); otherwise each closed basin's lowest cells (the lowest 0.5%: playas)
  findBase() {
    const { h, base, G } = this;
    const n = G.n;
    if (this.sea) {
      base.fill(0);
      const seen = this._seen || (this._seen = new Uint8Array(n)), q = this._q || (this._q = new Int32Array(n));
      seen.fill(0);
      let total = 0;
      for (let c = 0; c < n; c++) total += G.area[c];
      // (joined over sills a few metres high counts as joined: a strait's outflow cuts its
      // sill down to the sea, and the Black Sea is a sea)
      for (let c0 = 0; c0 < n; c0++) {
        if (seen[c0] || h[c0] >= 0) continue;
        let qn = 0, area = 0;
        q[qn++] = c0; seen[c0] = 1;
        for (let i = 0; i < qn; i++) {
          const c = q[i];
          if (h[c] < 0) area += G.area[c];
          for (let e = G.nStart[c]; e < G.nStart[c + 1]; e++) { const o = G.nbr[e]; if (!seen[o] && h[o] < SILL) { seen[o] = 1; q[qn++] = o; } }
        }
        if (area >= SEA_MIN * total) for (let i = 0; i < qn; i++) if (h[q[i]] < 0) base[q[i]] = 1;
      }
      return;
    }
    const sorted = Float64Array.from(h).sort();
    const cut = sorted[Math.floor(n * 0.005)];
    for (let c = 0; c < n; c++) base[c] = h[c] <= cut ? 1 : 0;
  }

  route() {
    // (compiled when it can be: native/sim.c's route() is this, operation for operation)
    if (routeNative(this, this.wander, this.nStep * 0x9e3779b1)) return;
    const { G, h, base, fill, rcv, rcvD, order, heap } = this;
    const { nStart, nbr, nDist } = G;
    const n = G.n;
    heap.size = 0;
    const done = this._done || (this._done = new Uint8Array(n));
    done.fill(0);
    for (let c = 0; c < n; c++) if (base[c]) { fill[c] = h[c]; heap.push(h[c], c); done[c] = 1; }
    let k = 0;
    while (heap.size) {
      const c = heap.pop(), z = heap.top;
      order[k++] = c;
      for (let e = nStart[c]; e < nStart[c + 1]; e++) {
        const o = nbr[e];
        if (done[o]) continue;
        done[o] = 1;
        fill[o] = h[o] > z + EPS ? h[o] : z + EPS;
        heap.push(fill[o], o);
      }
    }
    // receivers: a way down the filled surface (the steepest, or a slope-weighted draw)
    const wander = this.wander, salt = this.nStep * 0x9e3779b1;
    for (let c = 0; c < n; c++) {
      if (base[c]) { rcv[c] = -1; rcvD[c] = 0; continue; }
      let best = -1, bs = 0, bd = 0, sum = 0;
      const fc = fill[c];
      for (let e = nStart[c]; e < nStart[c + 1]; e++) {
        const o = nbr[e];
        const s = (fc - fill[o]) / nDist[e];
        if (s > 0) sum += s;
        if (s > bs) { bs = s; best = o; bd = nDist[e]; }
      }
      // (lakes and flats, where the slope is only the fill's gradient, keep the steepest)
      if (wander && bs > 1e-5) {
        let x = (hashInts(c, salt) >>> 0) / 4294967296 * sum;
        for (let e = nStart[c]; e < nStart[c + 1]; e++) {
          const s = (fc - fill[nbr[e]]) / nDist[e];
          if (s <= 0) continue;
          x -= s;
          if (x <= 0) { best = nbr[e]; bd = nDist[e]; break; }
        }
      }
      rcv[c] = best; rcvD[c] = bd;
    }
  }

  drain() {
    const { G, A, rain, rcv, order, lakeId, lakeList } = this;
    const k = this.rainK ?? 1; // (the climate's rain, vs today, through history)
    for (let c = 0; c < G.n; c++) A[c] = G.area[c] * rain[c] * k;
    for (let k = G.n - 1; k >= 0; k--) {
      const c = order[k], r = rcv[c];
      if (r < 0) continue;
      const L = lakeId[c] >= 0 && lakeId[r] !== lakeId[c] ? lakeList[lakeId[c]] : null; // (c: where a lake leaves)
      if (L && L.closed) continue;
      A[r] += A[c];
    }
  }

  // the lakes under the filled surface, grouped by where they spill; with the climate's
  // evaporation, each one's water balance. Runoff by Schreiber's curve (P e^(-PET/P): a
  // wet land sheds most of its rain, a dry one almost none); a lake loses (PET - P) off
  // its surface. One that can't reach its brim stands where inflow and evaporation
  // balance, and leaves nothing downstream.
  lakes() {
    const { G, h, fill, rcv, order, base, rain, pet, lakeId, lakeKind, water } = this;
    const n = G.n, area = G.area;
    const L = [], bySpill = new Map();
    lakeId.fill(-1);
    for (let k = 0; k < n; k++) {
      const c = order[k];
      if (base[c] || fill[c] - h[c] <= 0.5) continue;
      const r = rcv[c];
      if (r >= 0 && lakeId[r] >= 0) { lakeId[c] = lakeId[r]; continue; }
      let id = bySpill.get(r);
      if (id === undefined) { id = L.length; bySpill.set(r, id); L.push({ spill: r, cells: [], area: 0, inflow: 0, P: 0, E: 0, closed: false, frac: 1, kind: 1, level: 0, sed: 0 }); }
      lakeId[c] = id;
    }
    for (let c = 0; c < n; c++) if (lakeId[c] >= 0) { const l = L[lakeId[c]]; l.cells.push(c); l.area += area[c]; }
    this.lakeList = L;
    water.set(h);
    lakeKind.fill(0);
    for (const l of L) for (const c of l.cells) { water[c] = fill[c]; lakeKind[c] = 1; }
    if (!pet || !L.length) return;
    // runoff summed down the tree, upstream first; each lake decided at its spill
    const k = this.rainK ?? 1, pk = this.petK;
    const acc = this._acc || (this._acc = new Float64Array(n));
    for (let c = 0; c < n; c++) {
      const P = rain[c] * k, E = pet[c] * pk;
      acc[c] = P > 1e-4 ? area[c] * P * dm.exp(-E / P) : 0;
      if (lakeId[c] >= 0) { const l = L[lakeId[c]]; l.P += P * area[c]; l.E += E * area[c]; }
    }
    for (let q = n - 1; q >= 0; q--) {
      const c = order[q];
      const ls = bySpill.get(c);
      if (ls !== undefined) {
        const l = L[ls];
        const loss = Math.max(0, l.E - l.P);  // (m^3/yr off the full lake)
        if (l.inflow >= loss) acc[c] += l.inflow - loss;
        else { l.closed = true; l.frac = loss > 0 ? l.inflow / loss : 0; }
      }
      const r = rcv[c];
      if (r < 0) continue;
      if (lakeId[c] >= 0 && lakeId[r] !== lakeId[c]) L[lakeId[c]].inflow += acc[c]; // (leaving the lake: its outflow is decided at the spill)
      else acc[r] += acc[c];
    }
    // a closed lake shrinks to the area that balances: its lowest ground holds the water.
    // Round it (to ~3x its area), the flats a wet season floods and the sun dries: salt;
    // the rest of the basin is dry land draining in
    for (const l of L) {
      if (!l.closed) continue;
      const cells = l.cells.slice().sort((a, b) => h[a] - h[b] || a - b);
      const want = l.frac * l.area;
      let a = 0, i = 0;
      while (i < cells.length && a + area[cells[i]] * 0.5 <= want) a += area[cells[i++]];
      for (const c of cells) { water[c] = h[c]; lakeKind[c] = 0; }
      let j = i, fa = a;
      while (j < cells.length && (j === 0 || fa + area[cells[j]] * 0.5 <= 3 * want)) fa += area[cells[j++]];
      l.wet = cells.slice(0, i);
      l.flat = cells.slice(i, j);
      if (i === 0) { l.kind = 3; l.level = h[cells[0]]; }
      else {
        l.kind = 2;
        l.level = h[cells[i - 1]] + 0.5 * (i < cells.length ? h[cells[i]] - h[cells[i - 1]] : 0);
        for (const c of l.wet) { water[c] = l.level; lakeKind[c] = 2; }
      }
      for (const c of l.flat) lakeKind[c] = 3;
      if (l.kind === 2) l.flat = l.wet.concat(l.flat); // (salt settles under the water too)
    }
  }

  // one step of dt years
  step(dt) {
    const { G, h, U, K, A, rcv, rcvD, order, base, fill, qs, eroded, m } = this;
    const n = G.n, area = G.area;
    // (where the land barely moves a step, its routing kept for routeEvery steps: the sea's
    // reach, the ways down, the lakes, the water)
    if (!(this.routeEvery > 1) || this.nStep % this.routeEvery === 0 || !this._routed) {
      this.findBase();
      this.route();
      this.lakes();
      this.drain();
      this._routed = true;
    }
    const veg = this.veg, chanA = (this.chanCells ?? 30) * G.spacing * G.spacing;
    const powA = this._powA && this._powM === m ? this._powA : (this._powM = m, this._powA = dm.powFixed(m));
    this.nStep++;
    // an overflowing lake's spillway (its outlet and a few cells on down) cuts harder:
    // the floods that tear through a lake's rim (Bonneville's outlet fell ~100 m in weeks)
    const spill = this._spill || (this._spill = new Uint8Array(n));
    spill.fill(0);
    for (const l of this.lakeList) {
      if (l.closed || l.spill < 0) continue;
      let c = l.spill;
      for (let k = 0; k < 6 && c >= 0 && !base[c]; k++) { spill[c] = 1; c = rcv[c]; }
    }
    // incise, downstream first: h' = (h + dt U + f h'_r) / (1 + f)
    qs.fill(0);
    // (which cells were under a lake before this step's cutting: only they keep sediment;
    // a cell the river just cut is lower than the old water surface but isn't a lake)
    const wasLake = this._wasLake || (this._wasLake = new Uint8Array(n));
    for (let c = 0; c < n; c++) wasLake[c] = !base[c] && fill[c] - h[c] > 0.5 ? 1 : 0;
    for (let k = 0; k < n; k++) {
      const c = order[k];
      if (base[c]) continue;
      const r = rcv[c];
      const hr = base[r] && this.sea ? 0 : h[r]; // a river's base level is the sea surface
      const h0 = h[c], hu = h0 + dt * U[c];
      let hn;
      if (wasLake[c] || hu <= hr) hn = hu; // a lake bed, or below its outlet: nothing cut
      else {
        // (life: with no land plants nothing holds the soil, so all of it wears faster;
        // with them, plant cover shields the slopes (the channels still cut))
        const life = this.bare ? 1.5 : (veg && A[c] < chanA ? 1 - 0.6 * veg[c] : 1);
        const f = K[c] * life * (spill[c] ? SPILL_K : 1) * dt * powA(A[c]) / rcvD[c];
        hn = (hu + f * hr) / (1 + f);
      }
      h[c] = hn;
      if (hu > hn) { qs[c] = (hu - hn) * area[c]; eroded[c] += hu - hn; }
    }
    // carry the sediment down: lakes keep it until they're full; a closed lake keeps all
    // of it (what's left spreads over its floor, the deepest parts filling most)
    const lakeId = this.lakeId, LL = this.lakeList;
    for (let k = n - 1; k >= 0; k--) {
      const c = order[k];
      if (base[c]) continue;
      const room = wasLake[c] ? fill[c] - h[c] : 0;
      if (room > 0.5 && qs[c] > 0) {
        const d = Math.min(qs[c], room * area[c]);
        h[c] += d / area[c]; qs[c] -= d;
      }
      const r = rcv[c];
      if (r < 0) continue;
      if (lakeId[c] >= 0 && lakeId[r] !== lakeId[c] && LL[lakeId[c]].closed) { LL[lakeId[c]].sed += qs[c]; continue; }
      qs[r] += qs[c];
    }
    const saltDz = this.saltDz;
    saltDz.fill(0);
    for (const l of LL) {
      if (!l.closed) continue;
      if (l.sed > 0) {
        let vol = 0;
        for (const c of l.cells) vol += Math.max(0, fill[c] - h[c]) * area[c];
        const f = vol > 0 ? Math.min(1, l.sed / vol) : 0;
        for (const c of l.cells) h[c] += Math.max(0, fill[c] - h[c]) * f;
      }
      // the salt the rivers brought, left as the water dried: on the lake floor or the flat
      let fa = 0;
      for (const c of l.flat) fa += area[c];
      if (fa > 0) { const dz = Math.min(1e-4 * dt, l.inflow * SALT * dt / fa); for (const c of l.flat) { h[c] += dz; saltDz[c] = dz; } }
    }
    if (this.kd > 0) this.creep(dt);
    if (this.sea) this.seaFloor();
    else for (let c = 0; c < n; c++) if (base[c] && qs[c] > 0) { h[c] += qs[c] / area[c]; qs[c] = 0; } // playas fill
    this.t += dt;
  }

  // hillslope creep: land heights diffuse (explicit, substepped to stay stable)
  creep(dt) {
    const { G, h, base, kd } = this;
    const { nStart, nbr, nDist } = G;
    const n = G.n;
    const sub = Math.max(1, Math.ceil(dt * kd * 6 / (G.spacing * G.spacing * 0.5)));
    const d = dt / sub;
    const tmp = this._tmp || (this._tmp = new Float64Array(n));
    for (let it = 0; it < sub; it++) {
      for (let c = 0; c < n; c++) {
        if (base[c]) { tmp[c] = h[c]; continue; }
        let L = 0;
        const hc = h[c];
        for (let e = nStart[c]; e < nStart[c + 1]; e++) {
          const o = nbr[e], ho = base[o] && this.sea ? Math.max(h[o], 0) : h[o];
          L += (ho - hc) * 0.5 / (nDist[e] * nDist[e]);
        }
        tmp[c] = hc + d * kd * L;
      }
      h.set(tmp);
    }
  }

  // sediment reaching the sea builds the floor up to the shelf depth near the
  // coast, and runs on down the slope: the sea cells walked shallowest first
  seaFloor() {
    const { G, h, base, qs, order } = this;
    const { nStart, nbr } = G;
    const area = G.area, top = -this.shelf;
    // base cells pop first, in rising height (deepest first): walk them backwards
    let nb = 0;
    while (nb < G.n && base[order[nb]]) nb++;
    for (let k = nb - 1; k >= 0; k--) {
      const c = order[k];
      if (qs[c] <= 0) continue;
      const room = top - h[c];
      if (room > 0) {
        const d = Math.min(qs[c], room * area[c] * 0.5);
        h[c] += d / area[c]; qs[c] -= d;
      }
      if (qs[c] <= 0) continue;
      // the rest down the steepest slope; a hollow fills to the shelf depth
      // and what's left goes to the abyss (out of the model)
      let best = -1, bz = h[c];
      for (let e = nStart[c]; e < nStart[c + 1]; e++) { const o = nbr[e]; if (base[o] && h[o] < bz) { bz = h[o]; best = o; } }
      if (best >= 0) qs[best] += qs[c];
      else if (h[c] < top) h[c] = Math.min(top, h[c] + qs[c] / area[c]);
      qs[c] = 0;
    }
  }
}
