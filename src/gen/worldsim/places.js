// A world's places (Dave: "subdivide Catalogue realms into continents, islands, etc. and list rough
// square km so people can pick places to go ... like if I want to find a nice sandy beach on an island
// in the tropics somewhere with life ... maybe tags in the database"): each landmass worth a visit, what
// it is (a continent, a large island, an island, an islet; islands near one another an archipelago or a
// chain, a place of its own), how big (km2 as you walk it: the game's), where (its middle, the
// latitudes it spans), its climate and country (forest, grassland, desert, ice), its coasts (sandy
// beaches by sand, sea cliffs, reefs off it), its heights and waters (its highest ground, rivers,
// lakes, volcanoes), its life (land life's realms there: life/lineage.js), and tags to search by. From
// the sim's own fields in the worker, after findFeatures (features.js: its landmasses); kept in the
// snapshot as `places`, named as the landmarks are (landmarks.js).
import * as dm from '../../core/dmath.js';

const BANDS = [[23.44, 'tropical'], [35, 'subtropical'], [55, 'temperate'], [66.56, 'subpolar'], [91, 'polar']];
const SANDS = { 'coral sand': 'white sand', 'black sand': 'black sand', 'quartz sand': 'golden sand' };
const MAX_PLACES = 160;

// W: the world sim's output; F: findFeatures' (its _landId, _lands, _ocean, _isleGroup); opts: { rockNames,
// life (the body's: land animals, flyers), volcanoes, R: the world's radius as the game draws it, hScale:
// its heights' (the sim runs at its own scale: areas, lengths and heights given as you walk them) }
export function findPlaces(W, F, opts = {}) {
  const G = W.G, h = W.h, n = G.n, landId = F._landId, lands = F._lands;
  if (!landId || !lands) return null;
  const C = W.climate, Gc = W.Gc, L = W.life, Co = W.coasts, ice = W.glaciers ? W.glaciers.ice : null, E = W.E;
  const lenK = opts.R ? opts.R / G.R : 1, hK = opts.hScale ?? 1;
  const names = opts.rockNames || [], km2 = (a) => a * lenK * lenK / 1e6, planetKm2 = km2(4 * dm.PI * G.R * G.R);
  // (a world without a sea has no landmasses to tell apart: its places its named features, craters,
  // volcanoes, ranges, dune seas, ice, canyons, its dry valleys and basins)
  // (a sea it had once and lost, Mars's lowlands, holds no islands: opts.sea, whether it has one now)
  if (opts.sea === false || !F._ocean || !F._ocean.some((v) => v)) return featurePlaces(F, opts, planetKm2);

  const lake = E && E.water ? (c) => !E.base[c] && E.water[c] - h[c] > 1 : () => false;
  // (each landmass's index in the list: the big ones, and every island over an islet's size up to the cap)
  const keep = lands.filter((Ld, i) => i < MAX_PLACES && Ld.cells >= 2);
  const at = new Map(keep.map((Ld, i) => [Ld.id, i]));
  const acc = keep.map(() => ({ cells: 0, area: 0, latMin: 90, latMax: -90, band: new Float64Array(5), T: 0, P: 0, w: 0, forest: 0, open: 0, desert: 0, ice: 0, cold: 0, peak: -1e9, peakC: -1, beach: 0, sands: new Map(), cliff: 0, reef: 0, lake: 0, dunes: 0, riverA: 0, landed: 0, realms: new Map(), mid: [0, 0, 0], beachC: -1, beachBest: 0, inner: -1, innerN: -1 }));
  const step = Math.max(1, Math.round(n / 400000));   // (the climate's fields read every few cells on a big grid)
  for (let c = 0; c < n; c++) {
    const i = at.get(landId[c]);
    if (i === undefined) continue;
    const a = acc[i], dx = G.dir[c * 3], dy = G.dir[c * 3 + 1], dz = G.dir[c * 3 + 2], lat = dm.asin(Math.max(-1, Math.min(1, dy))) * 180 / dm.PI;
    a.cells++; a.area += G.area[c];
    a.mid[0] += dx; a.mid[1] += dy; a.mid[2] += dz;
    if (lat < a.latMin) a.latMin = lat; if (lat > a.latMax) a.latMax = lat;
    const al = Math.abs(lat);
    for (let k = 0; k < 5; k++) if (al < BANDS[k][0]) { a.band[k] += G.area[c]; break; }
    if (h[c] > a.peak) { a.peak = h[c]; a.peakC = c; }
    if (ice && ice[c] > 0) a.ice += G.area[c];
    if (lake(c)) a.lake += G.area[c];
    if (W.dunes && W.dunes[c] > 127) a.dunes += G.area[c];
    if (E && E.A && !E.base[c] && E.A[c] > a.riverA) a.riverA = E.A[c];
    // (its coast: sand on the shore, by kind; the tallest sea cliff; reef just off it)
    if (Co && Co.coast[c] === 1) {
      if (Co.beach[c] > 2) {
        a.beach++;
        const sn = SANDS[names[Co.sand[c]]] || 'sand';
        a.sands.set(sn, (a.sands.get(sn) || 0) + 1);
        if (Co.beach[c] > a.beachBest) { a.beachBest = Co.beach[c]; a.beachC = c; }
      }
      if (Co.cliff[c] > a.cliff) a.cliff = Co.cliff[c];
      for (let e = G.nStart[c]; e < G.nStart[c + 1]; e++) if (Co.reef[G.nbr[e]] >= 5) { a.reef++; break; }
    }
    // (a spot well inland to go to: the cell with the most land round it, near its middle)
    let inl = 0;
    for (let e = G.nStart[c]; e < G.nStart[c + 1]; e++) if (landId[G.nbr[e]] === landId[c]) inl++;
    if (inl > a.innerN || (inl === a.innerN && (c % 7) === 0)) { a.innerN = inl; a.inner = c; }
    // the climate and the life at it
    if (C && Gc && (c % step === 0 || a.cells < 4)) {
      const q = Gc.cellAt(dx, dy, dz), T = C.Tann[q] - 273.15, P = C.Pann[q];
      a.T += T; a.P += P; a.w++;
      if (T < -2) a.cold++;
      if (P < 250 && T > 0) a.desert++;
      if (L) {
        a.forest += L.cover[q] * L.forest[q]; a.open += L.cover[q] * L.open[q];
        if (L.landed[q]) { a.landed++; if (L.realm[q] >= 0) a.realms.set(L.realm[q], (a.realms.get(L.realm[q]) || 0) + 1); }
      }
    }
  }
  // (volcanoes on each)
  const volc = new Map();
  for (const v of opts.volcanoes || []) {
    const d = v.at || (v.lat != null ? [dm.cos(v.lat * dm.PI / 180) * dm.cos(v.lon * dm.PI / 180), dm.sin(v.lat * dm.PI / 180), dm.cos(v.lat * dm.PI / 180) * dm.sin(v.lon * dm.PI / 180)] : null);
    if (!d) continue;
    const i = at.get(landId[G.cellAt(d[0], d[1], d[2])]);
    if (i !== undefined) volc.set(i, (volc.get(i) || 0) + 1);
  }
  const life = opts.life || {};
  const dirOf = (c) => [+G.dir[c * 3].toFixed(6), +G.dir[c * 3 + 1].toFixed(6), +G.dir[c * 3 + 2].toFixed(6)];
  const latLon = (d) => ({ lat: +(dm.asin(Math.max(-1, Math.min(1, d[1]))) * 180 / dm.PI).toFixed(2), lon: +(dm.atan2(d[2], d[0]) * 180 / dm.PI).toFixed(2) });
  const places = keep.map((Ld, i) => {
    const a = acc[i], area = km2(a.area), share = area / planetKm2;
    const kind = share > 0.01 ? 'continent' : share > 0.001 ? 'large island' : share > 0.00005 ? 'island' : 'islet';
    const w = Math.max(a.w, 1), T = a.T / w, P = a.P / w, forest = a.forest / w, open = a.open / w;
    const mid = a.mid, ml = Math.hypot(mid[0], mid[1], mid[2]) || 1, peak = a.peak * hK;
    const tags = new Set([kind, kind === 'large island' || kind === 'islet' ? 'island' : null]);
    // (its latitudes: each band a quarter of it or more, the main one first)
    const bands = BANDS.map((B, k) => [B[1], a.band[k] / a.area]).filter(([, f]) => f >= 0.25).sort((x, y) => y[1] - x[1]).map(([b]) => b);
    for (const b of bands) tags.add(b);
    tags.add(T >= 24 ? 'hot' : T >= 15 ? 'warm' : T >= 5 ? 'mild' : T >= -5 ? 'cold' : 'frozen');
    if (P >= 1500) tags.add('wet'); else if (P < 400) tags.add('dry');
    if (a.desert / w > 0.25) tags.add('desert');
    if (forest > 0.25) tags.add(T >= 20 && P >= 1500 ? 'jungle' : 'forest');
    if (open > 0.25) tags.add('grassland');
    if (a.cold / w > 0.3 && a.ice / a.area < 0.5) tags.add('tundra');
    if (a.ice / a.area > 0.05) tags.add(a.ice / a.area > 0.5 ? 'ice cap' : 'glaciers');
    if (peak > 600) tags.add('mountains'); else if (peak > 150) tags.add('hills'); else tags.add('lowland');
    if (volc.has(i)) tags.add('volcano');
    if (a.lake > 0) tags.add('lakes');
    if (a.riverA > 0 && kind !== 'islet' && Ld.cells > 40) tags.add('rivers');
    if (a.dunes / a.area > 0.05) tags.add('dunes');
    const beachKm = a.beach * G.spacing * lenK / 1000;
    if (beachKm >= 0.3) { tags.add('beach'); tags.add('sandy beach'); for (const [sn, k] of a.sands) if (k * G.spacing * lenK / 1000 >= 0.3) tags.add(sn); }
    if (a.cliff > 20) tags.add('sea cliffs');
    if (a.reef > 0) tags.add('reef');
    const landed = a.landed / w;
    if (landed > 0.2) { tags.add('life'); tags.add('plants'); if (life.animals) tags.add('animals'); if (life.flyers) tags.add('birds'); }
    tags.delete(null);
    const realms = [...a.realms].sort((x, y) => y[1] - x[1]).map(([r]) => r).slice(0, 4);
    const out = {
      id: Ld.id, kind, areaKm2: +area.toFixed(area < 10 ? 2 : 0), ...latLon([mid[0] / ml, mid[1] / ml, mid[2] / ml]),
      latMin: +a.latMin.toFixed(1), latMax: +a.latMax.toFixed(1), T: +T.toFixed(1), P: Math.round(P), peakM: Math.round(peak),
      beachKm: +beachKm.toFixed(1), forest: +forest.toFixed(2), realms, tags: [...tags],
      at: dirOf(a.inner >= 0 ? a.inner : a.peakC), peakAt: dirOf(a.peakC),
    };
    if (a.beachC >= 0) out.beachAt = dirOf(a.beachC);
    return out;
  });
  // islands near one another: an archipelago or a chain (features.js), a place of its own
  const groups = new Map();
  for (const [lid, g] of F._isleGroup || []) { if (!at.has(lid)) continue; if (!groups.has(g)) groups.set(g, []); groups.get(g).push(at.get(lid)); }
  const groupsOut = [];
  for (const members of groups.values()) {
    if (members.length < 3) continue;
    const ps = members.map((i) => places[i]), tags = new Set(['archipelago', 'island', 'islands']);
    let area = 0, x = 0, y = 0, z = 0, big = ps[0];
    for (const p of ps) { area += p.areaKm2; for (const t of p.tags) if (!['continent', 'large island', 'islet'].includes(t)) tags.add(t); if (p.areaKm2 > big.areaKm2) big = p; const d = p.at; x += d[0]; y += d[1]; z += d[2]; }
    const l = Math.hypot(x, y, z) || 1;
    groupsOut.push({ kind: 'archipelago', islands: members.length, members: ps.map((p) => p.id), areaKm2: +area.toFixed(area < 10 ? 2 : 0), ...latLon([x / l, y / l, z / l]), tags: [...tags], at: big.at, beachAt: (ps.find((p) => p.beachAt) || {}).beachAt });
  }
  groupsOut.sort((a, b) => b.islands - a.islands);
  return { places, groups: groupsOut.slice(0, 40), planetKm2: Math.round(planetKm2) };
}

// a dry world's places: its named features, each sized as you'd walk it (features.js gives them at the
// real world's scale: opts.radiusM against the game's R), where it is, its tags
const FEATURE_KINDS = {
  craters: ['crater', ['crater', 'basin', 'impact']], volcanoes: ['volcano', ['volcano', 'mountains']], tuyas: ['volcano', ['volcano', 'table mountain', 'ice']],
  ranges: ['range', ['mountains', 'range']], peaks: ['peak', ['mountains', 'peak']], duneSeas: ['dune sea', ['dunes', 'desert', 'sand']],
  plateaus: ['plateau', ['plateau', 'highland']], iceFields: ['ice cap', ['ice cap', 'glaciers', 'ice']], gorges: ['canyon', ['canyon', 'gorge']],
  lakes: ['basin', ['basin', 'dry lake']], saltFlats: ['salt flat', ['salt flat', 'basin']], rivers: ['valley', ['valley', 'dry river', 'channels']],
  mesaCountry: ['mesas', ['mesas', 'canyon', 'desert']],
};
function featurePlaces(F, opts, planetKm2) {
  const k = opts.R && opts.radiusM ? opts.R / opts.radiusM : 1, places = [];
  const dir = (lat, lon) => { const a = lat * dm.PI / 180, o = lon * dm.PI / 180; return [+(dm.cos(a) * dm.cos(o)).toFixed(6), +dm.sin(a).toFixed(6), +(dm.cos(a) * dm.sin(o)).toFixed(6)]; };
  let id = 0;
  for (const [key, [kind, base]] of Object.entries(FEATURE_KINDS)) {
    for (const f of F[key] || []) {
      if (f.lat == null || !f.name) continue;
      const al = Math.abs(f.lat), band = BANDS.find((B) => al < B[0])[1];
      const areaKm2 = f.areaKm2 != null ? f.areaKm2 * k * k : f.diameterKm != null ? Math.PI * (f.diameterKm * k / 2) ** 2 : null;
      const sizeKm = f.diameterKm != null ? f.diameterKm * k : f.lengthKm != null ? f.lengthKm * k : f.widthKm != null ? f.widthKm * k : null;
      const tags = [...base, band];
      if (f.kind === 'hot' || f.kind === 'cold') tags.push(f.kind);
      const heightM = f.height ?? f.heightM ?? f.peak ?? null;
      places.push({ id: id++, kind, name: f.name[0].toUpperCase() + f.name.slice(1), areaKm2: areaKm2 != null ? +areaKm2.toFixed(areaKm2 < 10 ? 2 : 0) : 0, sizeKm: sizeKm != null ? +sizeKm.toFixed(1) : null,
        lat: +f.lat.toFixed(2), lon: +f.lon.toFixed(2), peakM: heightM != null && opts.hScale ? Math.round(heightM * opts.hScale) : 0, tags, at: dir(f.lat, f.lon), named: true });
    }
  }
  return { places, groups: [], planetKm2: Math.round(planetKm2), features: true };
}

// search a world's places by words ("tropical island beach animals"): each word a tag or the start of
// one (a plural's singular too, "tropics" the tropical's); the places with the most of them, then the
// biggest. Returns [{ place, hit }] best first
const ALIAS = { craters: 'crater', basins: 'basin', canyons: 'canyon', valleys: 'valley', mesa: 'mesas', tropics: 'tropical', jungles: 'jungle', beaches: 'beach', sand: 'sandy beach', sandy: 'sandy beach', reefs: 'reef', coral: 'white sand', mountain: 'mountains', volcanoes: 'volcano', volcanic: 'volcano', lake: 'lakes', river: 'rivers', glacier: 'glaciers', ice: 'glaciers', snow: 'glaciers', animal: 'animals', wildlife: 'animals', bird: 'birds', flyers: 'birds', alive: 'life', living: 'life', forests: 'forest', woods: 'forest', grass: 'grassland', grasslands: 'grassland', plains: 'grassland', cliffs: 'sea cliffs', cliff: 'sea cliffs', continents: 'continent', isle: 'island', islet: 'islet', archipelagos: 'archipelago', deserts: 'desert', dune: 'dunes', hill: 'hills', cold: 'cold', arctic: 'polar' };
export function searchPlaces(list, query) {
  const words = String(query || '').toLowerCase().split(/[\s,]+/).filter((w) => w && !['a', 'an', 'the', 'in', 'on', 'with', 'and', 'of', 'some', 'somewhere', 'nice', 'place', 'places'].includes(w)).map((w) => ALIAS[w] || w);
  if (!words.length) return [];
  const out = [];
  for (const place of list) {
    let hit = 0;
    for (const w of words) if (place.tags.some((t) => t === w || t.startsWith(w) || t.split(' ').some((p) => p.startsWith(w)))) hit++;
    if (hit) out.push({ place, hit });
  }
  // (ties to the place the words say most about: the fewest other tags; then the bigger)
  out.sort((a, b) => b.hit - a.hit || a.place.tags.length - b.place.tags.length || (b.place.areaKm2 || 0) - (a.place.areaKm2 || 0));
  return out;
}
