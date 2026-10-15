// A world's trees, many species, each to its own climate (Dave: "We also need tree and plant diversity,
// correct by climate. A hilltop forest shouldn't have the same trees as a rain jungle").
//
// Climate as plants feel it (Holdridge 1947, the life zones): the biotemperature, the year's mean of the
// warmth plants grow in (0..30 C), and the potential evapotranspiration ratio, what that warmth would
// draw off (58.93 mm a year a degree) over the rain that falls. Both on log scales, as Holdridge drew
// them: a rain forest, a moist forest, a dry forest, a thorn woodland, each belt up a mountain a halving of
// the warmth.
//
// The species: where the world's forests stand in that plane (its land read over the sphere, weighed by
// the life map's forest), so many niches as its plants' history and its forests' extent hold, spread
// over them as its forests are (weighted k-means); each species its niche's: its form from its lineages
// and its climate (seed trees in the cold, the flowering trees' broad crowns where it's warm and wet, a
// flat crown where it's dry, tree ferns where only ferns have come), its height from how much grows there
// (the history's tallest, a rain forest's giants, a cold or dry place's short ones), its build and leaves.
// Where a tree stands: each species by how well the place suits it, the ground's own water (a ridge's
// deep water table drier, a hollow's wetter) counted in, in stands (one species holding a patch, a few
// among it).
// World state: from the world's data alone (Rng, dmath): the same species everywhere, every client.
import * as dm from '../../core/dmath.js';
import { Rng, hashInts } from '../../core/rng.js';

// Holdridge's biotemperature (C) from a place's year: its mean Tm (C) and its swing A (K) about it
// (twelve months: below freezing nothing grows, past 30 no more)
export function biotemp(Tm, A) {
  let s = 0;
  for (let k = 0; k < 12; k++) s += dm.clamp(Tm + A * dm.cos((k + 0.5) * dm.TWO_PI / 12), 0, 30);
  return s / 12;
}
// the plane the niches are in: log2 of the biotemperature (floored), log2 of the PET ratio
export const climX = (bt) => dm.log2(Math.max(bt, 0.75));
export const climY = (bt, P) => dm.log2(Math.max(58.93 * Math.max(bt, 0.75), 1) / Math.max(P, 5));

// the place's year from the world sim's snapshot (worldsim/snapshot.js SnapshotSampler): { Tm, bt, P, x,
// y } at unit direction d, its ground's height h (m, real; the snapshot's own if not given), or its year's
// mean temperature Tm (C) where the caller has it (terrain.js's, the ground's own height's)
const _sea = [0, 0, 0];
export function placeClimate(S, lapse, d, h = null, out = {}, Tm = null) {
  if (Tm == null) {
    const Ts = S.Tsea(d[0], d[1], d[2]);
    if (Ts == null) return null;
    Tm = Ts - 273.15 - lapse * Math.max(h == null ? S.h(d[0], d[1], d[2]) : h, 0);
  }
  const A = S.season(d[0], d[1], d[2], _sea) ? Math.hypot(_sea[0], _sea[1]) : 0;
  const P = S.rain(d[0], d[1], d[2]) || 0;
  out.Tm = Tm; out.bt = biotemp(Tm, A); out.P = P; out.x = climX(out.bt); out.y = climY(out.bt, P);
  return out;
}

// the niches a world's plants of one kind fill: where its land stands in the plane, each place weighed
// by weight(d) (its forest, its cover), so many as Kof(share) gives for the share of its land they hold;
// weighted k-means (k-means++ seeds from the world's own stream, tag), each niche its centre, its spread
// (as wide as its places spread, at least a step of the plane's: a generalist's wider) and its share.
// Coldest first; null where too few places hold any
function niches(S, lapse, weight, Kof, seed, tag) {
  const pts = [], N = 3000, cl = {};
  let land = 0, wsum = 0;
  for (let k = 0; k < N; k++) {
    const z = 1 - 2 * (k + 0.5) / N, r = Math.sqrt(Math.max(0, 1 - z * z)), th = k * 2.399963229728653;
    const d = [r * dm.cos(th), z, r * dm.sin(th)];
    const h = S.h(d[0], d[1], d[2]);
    if (!(h > 0) || (S.ice && S.ice(d[0], d[1], d[2]) > 1)) continue;
    land++;
    const f = weight(d);
    if (f < 0.04 || !placeClimate(S, lapse, d, h, cl)) continue;
    pts.push(cl.x, cl.y, f);
    wsum += f;
  }
  const np = pts.length / 3;
  if (np < 3) return null;
  const K = Math.min(Kof(wsum / Math.max(1, land)), np);
  const rng = new Rng([seed >>> 0, tag, K]);
  const cx = [], cy = [], dist2 = new Float64Array(np);
  const pick = (wts) => { let tot = 0; for (let i = 0; i < np; i++) tot += wts[i]; let q = rng.next() * tot; for (let i = 0; i < np; i++) { q -= wts[i]; if (q <= 0) return i; } return np - 1; };
  const w0 = new Float64Array(np); for (let i = 0; i < np; i++) w0[i] = pts[3 * i + 2];
  let i0 = pick(w0); cx.push(pts[3 * i0]); cy.push(pts[3 * i0 + 1]);
  while (cx.length < K) {
    for (let i = 0; i < np; i++) {
      let m = Infinity;
      for (let c = 0; c < cx.length; c++) m = Math.min(m, (pts[3 * i] - cx[c]) ** 2 + (pts[3 * i + 1] - cy[c]) ** 2);
      dist2[i] = m * pts[3 * i + 2];
    }
    i0 = pick(dist2); cx.push(pts[3 * i0]); cy.push(pts[3 * i0 + 1]);
  }
  const own = new Int32Array(np), wk = new Float64Array(K);
  for (let it = 0; it < 8; it++) {
    for (let i = 0; i < np; i++) {
      let b = 0, m = Infinity;
      for (let c = 0; c < K; c++) { const e = (pts[3 * i] - cx[c]) ** 2 + (pts[3 * i + 1] - cy[c]) ** 2; if (e < m) { m = e; b = c; } }
      own[i] = b;
    }
    const sx = new Float64Array(K), sy = new Float64Array(K);
    wk.fill(0);
    for (let i = 0; i < np; i++) { const c = own[i], w = pts[3 * i + 2]; sx[c] += w * pts[3 * i]; sy[c] += w * pts[3 * i + 1]; wk[c] += w; }
    for (let c = 0; c < K; c++) if (wk[c] > 0) { cx[c] = sx[c] / wk[c]; cy[c] = sy[c] / wk[c]; }
  }
  const vx = new Float64Array(K), vy = new Float64Array(K);
  for (let i = 0; i < np; i++) { const c = own[i], w = pts[3 * i + 2]; vx[c] += w * (pts[3 * i] - cx[c]) ** 2; vy[c] += w * (pts[3 * i + 1] - cy[c]) ** 2; }
  const ord = [...Array(K).keys()].sort((a, b) => cx[a] - cx[b] || cy[a] - cy[b]);
  return ord.map((c) => ({ x0: cx[c], y0: cy[c], vx: Math.sqrt(vx[c] / Math.max(wk[c], 1e-9)), vy: Math.sqrt(vy[c] / Math.max(wk[c], 1e-9)), share: wk[c] / Math.max(wsum, 1e-9) }));
}

// a world's tree species: base, flora.js floraSpecies (its history's tree form, height, stage, seed); S its
// snapshot's sampler (null: the base species alone); lapse (K/m). [{ id, form, crown, treeHeight, x0, y0,
// sx, sy, wet, ridge, leafK, dry, seed, ... }]
export function treePool(base, S, lapse = 0.0065) {
  const st = base.stage ?? 4;
  if (!(base.densityTree > 0) || st < 3) return [];
  const one = (x0, y0) => [{ ...speciesAt(base, 0, x0, y0, new Rng([base.seed >>> 0, 0x7ee5, 0])), sx: 9, sy: 9 }];
  if (!S || !S.Gc || !S.s.forest) return one(3.5, -0.5);
  // (its forests: a world of flowering plants richer than one of seed trees and ferns; fewer where its
  // forests are few)
  const N = niches(S, lapse, (d) => S.forest(d[0], d[1], d[2]) * Math.min(1, 1.2 * S.cover(d[0], d[1], d[2])),
    (share) => dm.clamp(Math.round((st >= 4 ? 11 : 6) * (0.35 + 0.65 * dm.smoothstep(0, 0.35, share))), 2, 12), base.seed, 0x7ee5);
  if (!N) return one(3.5, -0.5);
  return N.map((n, id) => {
    const r = new Rng([base.seed >>> 0, 0x7ee5, 101 + id]);
    const sp = speciesAt(base, id, n.x0, n.y0, r);
    sp.sx = Math.max(0.45, 1.3 * n.vx) * r.range(0.9, 1.3);
    sp.sy = Math.max(0.7, 1.3 * n.vy) * r.range(0.9, 1.3);
    sp.share = n.share;
    return sp;
  });
}

// a world's shrub species: as its trees', over all its plants' land (its cover: the open country's scrub
// and heath and the forests' understorey); each niche's form: a dry country's tough rounded bushes, a wet
// heat's fronds, the cold's low tussocks and heath. [{ id, shrub, shrubHeight, x0, y0, sx, sy, ridge,
// leafK, dry, seed }]
export function shrubPool(base, S, lapse = 0.0065) {
  if (!(base.densityShrub > 0)) return [];
  const one = () => [{ id: 0, shrub: base.shrub, shrubHeight: base.shrubHeight, x0: 3.5, y0: -0.5, sx: 9, sy: 9, ridge: 0, leafK: 1, dry: null, seed: base.seed >>> 0 }];
  if (!S || !S.Gc || !S.s.cover) return one();
  const N = niches(S, lapse, (d) => S.cover(d[0], d[1], d[2]), (share) => dm.clamp(Math.round(7 * (0.4 + 0.6 * dm.smoothstep(0, 0.4, share))), 2, 8), base.seed, 0x5b8b);
  if (!N) return one();
  return N.map((n, id) => {
    const r = new Rng([base.seed >>> 0, 0x5b8b, 101 + id]), bt = 2 ** n.x0, per = 2 ** n.y0;
    const shrub = bt < 6 ? (per > 1.2 ? 'tufts' : r.next() < 0.5 ? 'tufts' : 'blob') : per > 1.2 ? 'blob' : bt > 16 && per < 0.7 ? 'fan' : r.next() < 0.35 ? 'fan' : 'blob';
    const grow = dm.pow(dm.smoothstep(0, 20, bt), 0.5) * dm.clamp(1 / per, 0.3, 1);
    return {
      id, shrub, shrubHeight: Math.max(0.3, (base.shrubHeight || 1.4) * (0.5 + 0.9 * grow) * r.range(0.85, 1.15)),
      x0: n.x0, y0: n.y0, sx: Math.max(0.5, 1.3 * n.vx) * r.range(0.9, 1.3), sy: Math.max(0.8, 1.3 * n.vy) * r.range(0.9, 1.3), share: n.share,
      ridge: r.range(-1, 1), leafK: (per > 1.2 ? 0.85 : 1) * r.range(0.88, 1.12), dry: dm.clamp(0.2 + 0.3 * dm.smoothstep(0.5, 2, per) + r.range(-0.08, 0.08), 0, 0.7),
      seed: hashInts(base.seed >>> 0, 0x5b8b, id) >>> 0,
    };
  });
}

// one species for the niche at (x0, y0) of the plane: its form, crown, height, leaves
function speciesAt(base, id, x0, y0, r) {
  const st = base.stage ?? 4, bt = 2 ** x0, per = 2 ** y0;
  // (its form: what the world's lineages hold, and which of them the climate favours: seed trees where
  // it's cold, poor or dry-cold (Earth's boreal and mountain conifers), the flowering trees elsewhere
  // where they've come; tree ferns where it's warm and wet and the seed trees are all there is besides;
  // the world's own alien forms where its history took them)
  const alien = base.tree === 'bulb' || base.tree === 'mushroom' || base.tree === 'spire' ? base.tree : null;
  let form;
  if (st >= 4) {
    if (bt < 6.5) form = 'conifer';
    else if (bt < 11) form = r.next() < 0.45 ? 'conifer' : 'broadleaf';
    else if (per > 1.4 && bt < 17) form = r.next() < 0.35 ? 'conifer' : 'broadleaf';
    else form = 'broadleaf';
  } else {
    form = bt > 15 && per < 0.7 && r.next() < 0.6 ? 'fern' : 'conifer';
  }
  if (alien && r.next() < 0.3) form = alien;
  // (its crown: a dry place's flat one spread wide over the scrub (an acacia's), a rain forest's giants'
  // tall clean boles under a broad crown, the cold's narrow spires (shedding snow), the rest rounded)
  const crown = form === 'conifer' ? (bt < 6 || per < 0.6 ? 'spire' : per > 1.4 ? 'parasol' : 'cone')
    : form === 'broadleaf' ? (per > 1.4 && bt > 15 ? 'umbrella' : bt > 17 && per < 0.6 ? 'emergent' : r.next() < 0.25 ? 'column' : 'round')
    : 'plain';
  // (its height: how much grows there, the history's tallest at most: Earth's rain forest giants ~60 m,
  // its boreal forest's ~20, a dry woodland's ~8)
  const grow = dm.pow(dm.smoothstep(0, 20, bt), 0.6) * dm.clamp(1 / per, 0.15, 1);
  const H0 = base.treeHeight || 12;
  const treeHeight = Math.max(2.5, H0 * (0.45 + 1.0 * grow) * r.range(0.85, 1.15) * (crown === 'emergent' ? 1.25 : 1));
  // (its leaves: the world's pigment, a needle's or a dry place's leathery leaf darker and duller, a wet
  // broadleaf's fresher; its own share of the dry tint)
  const leafK = (form === 'conifer' ? 0.72 : 1) * (per > 1.4 ? 0.85 : 1) * r.range(0.88, 1.12);
  const dry = dm.clamp(0.15 + 0.25 * dm.smoothstep(0.5, 2, per) + r.range(-0.08, 0.08), 0, 0.6);
  // (and where in its niche it stands best: a ridge's or a hollow's)
  return {
    id, form, crown, treeHeight, x0, y0, sx: 0.6, sy: 0.9,
    ridge: r.range(-1, 1),          // (+: the dry ridges, -: the wet hollows)
    leafK, dry,
    seed: hashInts(base.seed >>> 0, 0x7ee5, id) >>> 0,
  };
}

// how well a place suits each species (0..1, into out): its climate (placeClimate), and the ground's own
// water there: wtd the water table's depth (m), soil its depth (m)
export function suitability(pool, cl, wtd, soil, out) {
  // (a hollow's water near the surface makes the place wetter than its rain, a ridge's deep one drier: a
  // shift in the PET ratio's log, up to a halving either way)
  const wetShift = wtd == null ? 0 : -dm.clamp(1 - wtd / 6, -1, 1) * 0.8;
  const ridge = wtd == null ? 0 : dm.clamp((wtd - 6) / 20, -1, 1);
  for (let i = 0; i < pool.length; i++) {
    const s = pool[i], dx = (cl.x - s.x0) / s.sx, dy = (cl.y + wetShift - s.y0) / s.sy;
    let k = dm.exp(-0.5 * (dx * dx + dy * dy));
    // (a species of the ridges where it's high and dry, of the hollows where the water's near)
    k *= 1 + 0.35 * s.ridge * ridge;
    // (thin soil: the big trees' roots find no hold; those of the dry and the cold manage)
    if (soil != null && soil < 0.6) k *= 1 - ((s.treeHeight || 0) > 25 ? 0.6 : 0.25) * (1 - soil / 0.6);
    out[i] = k;
  }
  return out;
}

// the species of one tree: the place's suits (from suitability), its stand's own draw (one species holds
// a patch; u1 the stand's, 0..1) and the tree's (u2, u3): most of a stand its dominant, the rest the others
// as they suit the place. -1 if none suits
export function pickSpecies(suit, u1, u2, u3) {
  let mx = 0;
  for (let i = 0; i < suit.length; i++) if (suit[i] > mx) mx = suit[i];
  if (!(mx > 0.02)) return -1;
  // (none where it barely holds on: a species is found within its range, not a spire or two in a jungle)
  const lo = 0.15 * mx;
  let tot = 0;
  for (let i = 0; i < suit.length; i++) if (suit[i] >= lo) tot += suit[i];
  const draw = (u) => { let q = u * tot; for (let i = 0; i < suit.length; i++) { if (suit[i] < lo) continue; q -= suit[i]; if (q <= 0) return i; } return suit.length - 1; };
  // (the stand's dominant: drawn as they suit its place, the best much the likeliest)
  const sq = []; let tq = 0;
  for (let i = 0; i < suit.length; i++) { const v = suit[i] * suit[i] * suit[i]; sq.push(v); tq += v; }
  let q = u1 * tq, dom = suit.length - 1;
  for (let i = 0; i < suit.length; i++) { q -= sq[i]; if (q <= 0) { dom = i; break; } }
  if (u2 < 0.72 && suit[dom] > 0.3 * mx) return dom;
  return draw(u3);
}
