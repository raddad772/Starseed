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
//   drain    rain-weighted drainage area, summed down the tree
//   incise   the implicit stream-power solve, downstream first
//   deposit  sediment down the tree into lakes, then over the sea floor
//
// Everything is flat typed arrays; transcendental math goes through dmath so
// every machine carves the same valleys.

import * as dm from '../../core/dmath.js';
import { hashInts } from '../../core/rng.js';

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
  }

  // the base level: below sea level on a world with a sea; otherwise each
  // closed basin's lowest cells (the lowest 0.5%: playas and dry lake beds)
  findBase() {
    const { h, base, G } = this;
    if (this.sea) { for (let c = 0; c < G.n; c++) base[c] = h[c] < 0 ? 1 : 0; return; }
    const sorted = Float64Array.from(h).sort();
    const cut = sorted[Math.floor(G.n * 0.005)];
    for (let c = 0; c < G.n; c++) base[c] = h[c] <= cut ? 1 : 0;
  }

  route() {
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
    const { G, A, rain, rcv, order } = this;
    const k = this.rainK ?? 1; // (the climate's rain, vs today, through history)
    for (let c = 0; c < G.n; c++) A[c] = G.area[c] * rain[c] * k;
    for (let k = G.n - 1; k >= 0; k--) {
      const c = order[k], r = rcv[c];
      if (r >= 0) A[r] += A[c];
    }
  }

  // one step of dt years
  step(dt) {
    const { G, h, U, K, A, rcv, rcvD, order, base, fill, qs, eroded, m } = this;
    const n = G.n, area = G.area;
    this.findBase();
    this.route();
    this.drain();
    const veg = this.veg, chanA = (this.chanCells ?? 30) * G.spacing * G.spacing;
    this.nStep++;
    // incise, downstream first: h' = (h + dt U + f h'_r) / (1 + f)
    qs.fill(0);
    for (let k = 0; k < n; k++) {
      const c = order[k];
      if (base[c]) continue;
      const r = rcv[c];
      const hr = base[r] && this.sea ? 0 : h[r]; // a river's base level is the sea surface
      const h0 = h[c], hu = h0 + dt * U[c];
      let hn;
      if (fill[c] - h0 > 0.5 || hu <= hr) hn = hu; // a lake bed, or below its outlet: nothing cut
      else {
        // (life: with no land plants nothing holds the soil, so all of it wears faster;
        // with them, plant cover shields the slopes (the channels still cut))
        const life = this.bare ? 1.5 : (veg && A[c] < chanA ? 1 - 0.6 * veg[c] : 1);
        const f = K[c] * life * dt * dm.pow(A[c], m) / rcvD[c];
        hn = (hu + f * hr) / (1 + f);
      }
      h[c] = hn;
      if (hu > hn) { qs[c] = (hu - hn) * area[c]; eroded[c] += hu - hn; }
    }
    // carry the sediment down: lakes keep it until they're full
    for (let k = n - 1; k >= 0; k--) {
      const c = order[k];
      if (base[c]) continue;
      const room = fill[c] - h[c];
      if (room > 0.5 && qs[c] > 0) {
        const d = Math.min(qs[c], room * area[c]);
        h[c] += d / area[c]; qs[c] -= d;
      }
      const r = rcv[c];
      if (r >= 0) qs[r] += qs[c];
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
