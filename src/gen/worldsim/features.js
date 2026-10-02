// A finished world's notable features, found from its heights (and, where
// there are rivers, its drainage): what a surveyor would name first.
//
//   peaks      ranked by prominence: how far a summit rises above the lowest
//              saddle that links it to anything higher (so a bump on a ridge
//              doesn't count, and the true summits come first)
//   ranges     connected high country (above the land's 85th percentile and 1 km),
//              by area, with their highest peak and length
//   rivers     traced from each mouth up the larger branch to the source, by length
//   gorges     where a river has cut deepest below the ridges beside it: canyons
//              when the walls are steep
//   lakes      basins the water fills (from the routing's filled surface), by area
//   trenches   the deepest sea floor (the deepest is the world's deepest wet spot)
//   lowest dry the lowest ground below sea level not joined to the ocean (a Dead Sea)
//   lands      continents, the largest islands, and archipelagos and chains (small
//              islands grouped by nearness; a chain when the group is long and thin)
//   waterfalls the steepest drops along rivers (at this grid's scale, where the
//              local detail will put the actual falls)
//   cliffs     the tallest drops between neighbouring ground
//   plateaus   high, flat country (high ground that's gentle across)
//   glaciers   ice fields and the longest glaciers (from glaciers.js)
//   fjords     glacier-cut troughs the sea has flooded
//   craters, volcanoes: passed in from the processes that made them
//
// Lengths and areas are given for the real world (the game draws it at `scale`).

import * as dm from '../../core/dmath.js';

// G: SimGrid; h: heights (m, sea level 0). opts: { E: an Erosion after route()+drain(),
// scale (game/real), craters: [{D, at, t}], volcanoes: [{at, H}], top: how many of each }
export function findFeatures(G, h, opts = {}) {
  const n = G.n, top = opts.top ?? 8, scale = opts.scale ?? 0.1;
  const toReal = 1 / scale;                         // game metres -> real metres (horizontal)
  const where = (c) => latLon(G, c);
  const out = { peaks: [], ranges: [], rivers: [], gorges: [], lakes: [], trenches: [], craters: [], volcanoes: [], continents: [], islands: [], archipelagos: [], waterfalls: [], cliffs: [], plateaus: [], lowestDry: null, deepestWet: null, highest: null };

  // ---- peaks by prominence: add cells high to low, joining their neighbours'
  // groups; where two groups meet, the lower one's summit gets its prominence
  const order = Int32Array.from({ length: n }, (_, i) => i).sort((a, b) => h[b] - h[a] || a - b);
  const parent = new Int32Array(n).fill(-1), summit = new Int32Array(n);
  const find = (x) => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
  const prom = [];
  for (const c of order) {
    if (h[c] <= 0) break;
    parent[c] = c; summit[c] = c;
    for (let e = G.nStart[c]; e < G.nStart[c + 1]; e++) {
      const o = G.nbr[e];
      if (parent[o] < 0) continue;
      const a = find(c), b = find(o);
      if (a === b) continue;
      // the lower summit's prominence is settled at this saddle
      const sa = summit[a], sb = summit[b];
      const [hi, lo] = h[sa] >= h[sb] ? [sa, sb] : [sb, sa];
      if (lo !== c) prom.push({ cell: lo, height: h[lo], prominence: h[lo] - h[c] }); // (c itself: an ordinary slope)
      parent[lo === sa ? a : b] = lo === sa ? b : a;
      summit[find(c)] = hi;
    }
  }
  // the highest summit of each landmass rises from the sea
  const roots = new Set();
  for (let c = 0; c < n; c++) if (parent[c] >= 0) roots.add(find(c));
  for (const r of roots) prom.push({ cell: summit[r], height: h[summit[r]], prominence: h[summit[r]] });
  prom.sort((a, b) => b.prominence - a.prominence);
  out.peaks = prom.slice(0, top).map((p) => ({ ...p, ...where(p.cell) }));

  // ---- ranges: connected high country
  const land = [];
  for (let c = 0; c < n; c++) if (h[c] > 0) land.push(h[c]);
  land.sort((a, b) => a - b);
  const hiCut = Math.max(1000, land.length ? land[Math.floor(land.length * 0.85)] : 1000);
  const seen = new Uint8Array(n);
  for (let c0 = 0; c0 < n; c0++) {
    if (seen[c0] || h[c0] < hiCut) continue;
    const cells = [], q = [c0];
    seen[c0] = 1;
    while (q.length) {
      const c = q.pop(); cells.push(c);
      for (let e = G.nStart[c]; e < G.nStart[c + 1]; e++) { const o = G.nbr[e]; if (!seen[o] && h[o] >= hiCut) { seen[o] = 1; q.push(o); } }
    }
    if (cells.length < 6) continue;
    let pk = cells[0], area = 0;
    for (const c of cells) { area += G.area[c]; if (h[c] > h[pk]) pk = c; }
    out.ranges.push({ cells: cells.length, areaKm2: area * toReal * toReal / 1e6, peak: h[pk], lengthKm: spanOf(G, cells) * toReal / 1000, ...where(pk) });
  }
  out.ranges.sort((a, b) => b.areaKm2 - a.areaKm2);
  out.ranges = out.ranges.slice(0, top);

  // ---- rivers, lakes, gorges: from the drainage
  const E = opts.E;
  if (E) {
    const { rcv, rcvD, A, base, fill } = E;
    // the main donor of each cell (its biggest tributary)
    const main = new Int32Array(n).fill(-1);
    for (let c = 0; c < n; c++) { const r = rcv[c]; if (r >= 0 && (main[r] < 0 || A[c] > A[main[r]])) main[r] = c; }
    let amax = 0;
    for (let c = 0; c < n; c++) if (!base[c] && A[c] > amax) amax = A[c];
    E._amax = amax;
    const minA = amax * 0.01;
    const rivers = [];
    for (let c = 0; c < n; c++) {
      if (base[c] || A[c] < minA) continue;
      const r = rcv[c];
      if (r >= 0 && !base[r]) continue; // not a mouth
      let len = 0, x = c, steps = 0;
      while (main[x] >= 0 && steps++ < 100000) { len += rcvD[main[x]]; x = main[x]; }
      rivers.push({ mouth: c, source: x, lengthKm: len * toReal / 1000, discharge: A[c], ...where(c), source_: where(x) });
    }
    rivers.sort((a, b) => b.lengthKm - a.lengthKm);
    out.rivers = rivers.slice(0, top);
    // lakes: connected cells under the filled surface
    const lk = new Uint8Array(n);
    for (let c0 = 0; c0 < n; c0++) {
      if (lk[c0] || base[c0] || fill[c0] - h[c0] < 1) continue;
      const cells = [], q = [c0];
      lk[c0] = 1;
      while (q.length) {
        const c = q.pop(); cells.push(c);
        for (let e = G.nStart[c]; e < G.nStart[c + 1]; e++) { const o = G.nbr[e]; if (!lk[o] && !base[o] && fill[o] - h[o] >= 1) { lk[o] = 1; q.push(o); } }
      }
      let area = 0, depth = 0;
      for (const c of cells) { area += G.area[c]; depth = Math.max(depth, fill[c] - h[c]); }
      out.lakes.push({ areaKm2: area * toReal * toReal / 1e6, depth, level: fill[cells[0]], ...where(cells[0]) });
    }
    out.lakes.sort((a, b) => b.areaKm2 - a.areaKm2);
    out.lakes = out.lakes.slice(0, top);
    // gorges: along rivers, the cut below the highest ground within a few cells
    const gorges = [];
    for (let c = 0; c < n; c++) {
      if (base[c] || A[c] < minA * 0.2 || h[c] <= 0) continue;
      const near = ring(G, c, 3);
      let rim = h[c], far = 0;
      for (const [o, d] of near) if (h[o] > rim) { rim = h[o]; far = d; }
      const depth = rim - h[c];
      if (depth < 300) continue;
      gorges.push({ cell: c, depth, wallSlope: depth / Math.max(far, G.spacing), ...where(c) });
    }
    gorges.sort((a, b) => b.depth - a.depth);
    // one per place: skip gorges within a few cells of a deeper one already taken
    for (const g of gorges) {
      if (out.gorges.length >= top) break;
      if (out.gorges.some((k) => G.dir[k.cell * 3] * G.dir[g.cell * 3] + G.dir[k.cell * 3 + 1] * G.dir[g.cell * 3 + 1] + G.dir[k.cell * 3 + 2] * G.dir[g.cell * 3 + 2] > dm.cos(8 * G.spacing / G.R))) continue;
      out.gorges.push({ ...g, kind: g.wallSlope * toReal > 0.08 ? 'canyon' : 'valley' });
    }
  }

  // ---- trenches: the deepest sea floor, one per place
  const deep = [];
  for (let c = 0; c < n; c++) if (h[c] < -2000) deep.push(c);
  deep.sort((a, b) => h[a] - h[b]);
  for (const c of deep) {
    if (out.trenches.length >= top) break;
    if (out.trenches.some((k) => G.dir[k.cell * 3] * G.dir[c * 3] + G.dir[k.cell * 3 + 1] * G.dir[c * 3 + 1] + G.dir[k.cell * 3 + 2] * G.dir[c * 3 + 2] > dm.cos(10 * G.spacing / G.R))) continue;
    out.trenches.push({ cell: c, depth: -h[c], ...where(c) });
  }
  // ---- the seas: connected ground below sea level, big enough to be a sea
  // (the sim keeps them filled); smaller hollows below sea level are dry
  // depressions (a Dead Sea), not seas
  const ocean = new Uint8Array(n), seen2 = new Uint8Array(n);
  const planetArea = 4 * dm.PI * G.R * G.R;
  let deepest = -1;
  for (let c0 = 0; c0 < n; c0++) {
    if (seen2[c0] || h[c0] >= 0) continue;
    const cells = [c0], q = [c0]; seen2[c0] = 1;
    let area = 0;
    while (q.length) { const c = q.pop(); area += G.area[c]; for (let e = G.nStart[c]; e < G.nStart[c + 1]; e++) { const o = G.nbr[e]; if (!seen2[o] && h[o] < 0) { seen2[o] = 1; q.push(o); cells.push(o); } } }
    if (area < planetArea * 0.002) continue; // a hollow, not a sea
    for (const c of cells) { ocean[c] = 1; if (deepest < 0 || h[c] < h[deepest]) deepest = c; }
  }
  if (deepest >= 0) out.deepestWet = { depth: -h[deepest], ...where(deepest) };
  let low = -1, hiC = -1;
  for (let c = 0; c < n; c++) {
    if (!ocean[c] && (low < 0 || h[c] < h[low])) low = c;
    if (hiC < 0 || h[c] > h[hiC]) hiC = c;
  }
  if (low >= 0 && h[low] < 0) out.lowestDry = { height: h[low], ...where(low) };
  if (hiC >= 0) out.highest = { height: h[hiC], ...where(hiC) };
  // ---- lands: continents, islands, archipelagos and chains
  const landId = new Int32Array(n).fill(-1), lands = [];
  for (let c0 = 0; c0 < n; c0++) {
    if (ocean[c0] || landId[c0] >= 0) continue;
    const id = lands.length, cells = [c0], q = [c0];
    landId[c0] = id;
    while (q.length) { const c = q.pop(); for (let e = G.nStart[c]; e < G.nStart[c + 1]; e++) { const o = G.nbr[e]; if (!ocean[o] && landId[o] < 0) { landId[o] = id; q.push(o); cells.push(o); } } }
    let area = 0, pk = cells[0], cx = 0, cy = 0, cz = 0;
    for (const c of cells) { area += G.area[c]; if (h[c] > h[pk]) pk = c; cx += G.dir[c * 3]; cy += G.dir[c * 3 + 1]; cz += G.dir[c * 3 + 2]; }
    const l = Math.hypot(cx, cy, cz) || 1;
    lands.push({ id, cells: cells.length, areaKm2: area * toReal * toReal / 1e6, peak: h[pk], center: [cx / l, cy / l, cz / l] });
  }
  lands.sort((a, b) => b.areaKm2 - a.areaKm2);
  const planetKm2 = 4 * dm.PI * (G.R * toReal / 1000) ** 2;
  const isContinent = (L) => L.areaKm2 > planetKm2 * 0.01;
  out.continents = lands.filter(isContinent).map((L) => ({ areaKm2: L.areaKm2, peak: L.peak, ...latLonDir(L.center) }));
  const isles = lands.filter((L) => !isContinent(L));
  out.islands = isles.slice(0, top).map((L) => ({ areaKm2: L.areaKm2, peak: L.peak, ...latLonDir(L.center) }));
  // group islands lying near one another (single link within ~6 cells)
  const link = dm.cos(6 * G.spacing / G.R);
  const grp = isles.map((_, i) => i);
  const gfind = (x) => { while (grp[x] !== x) { grp[x] = grp[grp[x]]; x = grp[x]; } return x; };
  for (let i = 0; i < isles.length; i++) for (let j = i + 1; j < isles.length; j++) {
    const a = isles[i].center, b = isles[j].center;
    if (a[0] * b[0] + a[1] * b[1] + a[2] * b[2] > link) grp[gfind(i)] = gfind(j);
  }
  const groups = new Map();
  isles.forEach((L, i) => { const g = gfind(i); if (!groups.has(g)) groups.set(g, []); groups.get(g).push(L); });
  for (const members of groups.values()) {
    if (members.length < 3) continue;
    // long and thin: the span against the spread of the group
    let cx = 0, cy = 0, cz = 0, area = 0;
    for (const L of members) { cx += L.center[0]; cy += L.center[1]; cz += L.center[2]; area += L.areaKm2; }
    const l = Math.hypot(cx, cy, cz) || 1;
    let span = 0;
    for (const A of members) for (const B of members) span = Math.max(span, dm.acos(Math.min(1, A.center[0] * B.center[0] + A.center[1] * B.center[1] + A.center[2] * B.center[2])));
    const spanKm = span * G.R * toReal / 1000;
    const thin = spanKm / Math.sqrt(members.length) > 3 * G.spacing * toReal / 1000;
    out.archipelagos.push({ islands: members.length, areaKm2: area, spanKm, kind: thin ? 'chain' : 'archipelago', ...latLonDir([cx / l, cy / l, cz / l]) });
  }
  out.archipelagos.sort((a, b) => b.islands - a.islands);
  out.archipelagos = out.archipelagos.slice(0, top);
  // ---- cliffs (tallest drop to a neighbour on land) and waterfalls (along rivers)
  const cl = [], wf = [];
  for (let c = 0; c < n; c++) {
    if (ocean[c]) continue;
    let drop = 0, to = -1;
    for (let e = G.nStart[c]; e < G.nStart[c + 1]; e++) { const o = G.nbr[e]; const dz = h[c] - Math.max(h[o], 0); if (dz > drop) { drop = dz; to = o; } }
    if (drop > 500) cl.push({ cell: c, drop });
    if (E && !E.base[c] && E.rcv[c] >= 0 && E.A[c] > (E._amax || 0) * 0.005) { const dz = h[c] - Math.max(h[E.rcv[c]], 0); if (dz > 150) wf.push({ cell: c, drop: dz }); }
  }
  const spread = (list, sepCells) => {
    const kept = [];
    for (const x of list.sort((a, b) => b.drop - a.drop)) {
      if (kept.length >= top) break;
      if (kept.some((k) => G.dir[k.cell * 3] * G.dir[x.cell * 3] + G.dir[k.cell * 3 + 1] * G.dir[x.cell * 3 + 1] + G.dir[k.cell * 3 + 2] * G.dir[x.cell * 3 + 2] > dm.cos(sepCells * G.spacing / G.R))) continue;
      kept.push(x);
    }
    return kept.map((k) => ({ drop: k.drop, ...where(k.cell) }));
  };
  out.cliffs = spread(cl, 8);
  out.waterfalls = spread(wf, 8);
  // ---- plateaus: high ground that's gentle across (local relief small)
  const pl = [];
  for (let c = 0; c < n; c++) {
    if (ocean[c] || h[c] < hiCut * 0.9) continue;
    let rel = 0;
    for (let e = G.nStart[c]; e < G.nStart[c + 1]; e++) rel = Math.max(rel, Math.abs(h[c] - h[G.nbr[e]]));
    if (rel < 0.02 * G.spacing * 1.2) pl.push(c);
  }
  const plSeen = new Uint8Array(n), plSet = new Uint8Array(n);
  for (const c of pl) plSet[c] = 1;
  for (const c0 of pl) {
    if (plSeen[c0]) continue;
    const cells = [], q = [c0]; plSeen[c0] = 1;
    while (q.length) { const c = q.pop(); cells.push(c); for (let e = G.nStart[c]; e < G.nStart[c + 1]; e++) { const o = G.nbr[e]; if (plSet[o] && !plSeen[o]) { plSeen[o] = 1; q.push(o); } } }
    if (cells.length < 10) continue;
    let area = 0, mean = 0;
    for (const c of cells) { area += G.area[c]; mean += h[c]; }
    out.plateaus.push({ areaKm2: area * toReal * toReal / 1e6, height: mean / cells.length, ...where(cells[0]) });
  }
  out.plateaus.sort((a, b) => b.areaKm2 - a.areaKm2);
  out.plateaus = out.plateaus.slice(0, top);
  // ---- ice: fields (connected ice) and fjords (ice-cut ground now under the sea, joined to it)
  const Gl = opts.glaciers;
  out.iceFields = []; out.fjords = [];
  if (Gl) {
    const seenI = new Uint8Array(n);
    for (let c0 = 0; c0 < n; c0++) {
      if (seenI[c0] || Gl.ice[c0] <= 0) continue;
      const cells = [], q = [c0]; seenI[c0] = 1;
      while (q.length) { const c = q.pop(); cells.push(c); for (let e = G.nStart[c]; e < G.nStart[c + 1]; e++) { const o = G.nbr[e]; if (!seenI[o] && Gl.ice[o] > 0) { seenI[o] = 1; q.push(o); } } }
      let area = 0, thick = 0, maxFlux = cells[0];
      for (const c of cells) { area += G.area[c]; thick = Math.max(thick, Gl.ice[c]); if (Gl.flux[c] > Gl.flux[maxFlux]) maxFlux = c; }
      out.iceFields.push({ areaKm2: area * toReal * toReal / 1e6, thickness: thick, kind: area * toReal * toReal / 1e6 > 1e5 ? 'ice sheet' : 'ice cap / glaciers', ...where(maxFlux) });
    }
    out.iceFields.sort((a, b) => b.areaKm2 - a.areaKm2);
    out.iceFields = out.iceFields.slice(0, top);
    const fj = [];
    for (let c = 0; c < n; c++) if (Gl.everIce[c] && h[c] < 0 && Gl.cut[c] > 200 && ocean[c]) fj.push({ cell: c, drop: Gl.cut[c] });
    out.fjords = spread(fj, 6).map((f) => ({ depthCut: f.drop, lat: f.lat, lon: f.lon }));
  }
  if (opts.craters) out.craters = opts.craters.slice().sort((a, b) => b.D - a.D).slice(0, top).map((k) => ({ diameterKm: k.D, ...latLonDir(k.at), when: k.t }));
  if (opts.volcanoes) out.volcanoes = opts.volcanoes.slice(0, top);
  return out;
}

function latLon(G, c) { return latLonDir([G.dir[c * 3], G.dir[c * 3 + 1], G.dir[c * 3 + 2]]); }
function latLonDir(d) { return { lat: dm.asin(Math.max(-1, Math.min(1, d[1]))) * 180 / dm.PI, lon: dm.atan2(d[2], d[0]) * 180 / dm.PI }; }

// the cells within k steps of c, with their distance (m, along the steps)
function ring(G, c, k) {
  const out = [], seen = new Map([[c, 0]]);
  let front = [c];
  for (let s = 0; s < k; s++) {
    const next = [];
    for (const x of front) for (let e = G.nStart[x]; e < G.nStart[x + 1]; e++) {
      const o = G.nbr[e];
      if (seen.has(o)) continue;
      const d = seen.get(x) + G.nDist[e];
      seen.set(o, d); out.push([o, d]); next.push(o);
    }
    front = next;
  }
  return out;
}

// the widest separation within a set of cells (m): the farthest from the first, then the farthest from that
function spanOf(G, cells) {
  const d = G.dir;
  const far = (a) => { let best = a, bd = 2; for (const c of cells) { const x = d[a * 3] * d[c * 3] + d[a * 3 + 1] * d[c * 3 + 1] + d[a * 3 + 2] * d[c * 3 + 2]; if (x < bd) { bd = x; best = c; } } return [best, bd]; };
  const [a] = far(cells[0]);
  const [, cosB] = far(a);
  return dm.acos(Math.max(-1, Math.min(1, cosB))) * G.R;
}
