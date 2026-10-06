// Flora & rock scattering (deterministic, runs in the terrain workers).
//
// Species are derived from the planet seed and biosphere: a dominant tree
// form, a shrub, a small ground plant, plus two rock shapes (and crystal
// clusters on some barren worlds). Instances are scattered per quadtree node
// of a fixed level; each candidate's acceptance depends on the terrain sample
// there (vegetation cover, rock exposure, slope, water). Heights come from the
// full-detail terrain function so instances sit on the finest mesh.

import { Rng, hashInts, hash3f } from '../core/rng.js';
import { dirFromFaceUV, chunkUVBounds, chunkArcSize } from './cubesphere.js';
import { S_LEN, S_H, S_TEMP, S_MOIST, S_WDEPTH } from './terrain.js';
import { cliffWeightAt } from './volume.js';
import * as dm from '../core/dmath.js';
import { CHUNK_N } from './chunkbuilder.js';
import { scatterRocks } from './rocks.js';

export const FLORA_KINDS = ['tree', 'shrub', 'plant', 'rock', 'boulder'];

// Species description from planet params (also used by the renderer)
export function floraSpecies(terrain) {
  const rng = new Rng(terrain.seed).fork('flora');
  const life = terrain.life || 0;
  const forms = ['conifer', 'broadleaf', 'bulb', 'fern', 'mushroom', 'spire'];
  const tree = forms[rng.int(0, forms.length - 1)];
  const shrub = rng.pick(['blob', 'fan', 'tufts']);
  const plant = rng.pick(['tufts', 'stalks', 'cups']);
  const sp = {
    life,
    tree, shrub, plant,
    treeHeight: rng.range(6, 18) * (terrain.g > 15 ? 0.5 : (terrain.g < 5 ? 1.6 : 1)),
    shrubHeight: rng.range(0.8, 2.2),
    plantHeight: rng.range(0.25, 0.7),
    rockScale: rng.range(0.6, 1.6),
    crystals: !life && rng.chance(0.25),
    hueShift: rng.range(-0.08, 0.08),
    densityTree: life > 0 ? rng.range(0.4, 1.0) : 0,
    densityShrub: life > 0 ? rng.range(0.5, 1.0) : 0,
    densityRock: rng.range(0.4, 1.0),
    seed: rng.u32(),
  };
  // how much flat ground opens into meadows (from the seed after the rest: the
  // older fields keep their values)
  sp.meadows = meadowAmount(sp);
  // how mature the land plants are (the world's history): no trees until forests have
  // evolved, no shrubs before shrubs, only crusts where no plants reached land; trees
  // no taller than the age and the gravity allow
  const st = terrain.floraStage;
  if (st != null && st >= -1) {
    if (st < 3) sp.densityTree = 0;
    if (st < 2) sp.densityShrub = 0;
    if (st < 1) sp.plantScarce = true;
    if (st >= 3 && terrain.maxTree > 0) sp.treeHeight = Math.min(sp.treeHeight * (st >= 4 ? 1.6 : 1), terrain.maxTree * 0.6);
    // (its trees' form from its plants' history, its own stream: seed trees (a conifer's build) with tree
    // ferns among them, then flowering trees (a broadleaf's spreading crown); now and then an alien form
    // the world's own lineages took)
    if (st >= 3) { const fr = new Rng(terrain.seed).fork('treeForm'); sp.tree = st >= 4 ? fr.pick(['broadleaf', 'broadleaf', 'conifer', 'broadleaf', 'bulb']) : fr.pick(['conifer', 'conifer', 'fern', 'spire']); }
    if (st === 2) sp.shrubHeight = Math.min(sp.shrubHeight * 1.4, Math.max(1, terrain.maxTree));
    sp.stage = st;
  }
  return sp;
}

// Meadows (Dave: "programmatically DESIGN the trees not to populate around
// optimal flat points"): every 320 m cell of the surface finds its flattest
// spot (on the terrain smoothed to ~40 m features, over 60 m both ways), and
// where that is flat enough it is the middle of a meadow 35-80 m across that
// trees, shrubs and boulders leave open (grass and flowers stay): room for a
// lander, found by the nav computer too (meadowsNear). A function of the
// position and the seed only: the renderer and the world's solid flora see
// the same meadows. Cells are cached on the species object.
const MEADOW_CELL = 320;

export function meadowAmount(species) {
  // living worlds open up more than barren ones (where only the boulders thin out)
  const k = hashInts(species.seed, 0x6d656164) / 4294967296;
  return species.life > 0 ? 0.7 + 0.3 * k : 0.5 + 0.3 * k;
}

// slope (rise / run) of the smoothed ground at a unit direction, over 60 m
function broadSlope(gen, d, s2) {
  const R = gen.R;
  const ax = Math.abs(d[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  let t1x = ax[1] * d[2] - ax[2] * d[1], t1y = ax[2] * d[0] - ax[0] * d[2], t1z = ax[0] * d[1] - ax[1] * d[0];
  const l1 = dm.hypot(t1x, t1y, t1z); t1x /= l1; t1y /= l1; t1z /= l1;
  const t2x = d[1] * t1z - d[2] * t1y, t2y = d[2] * t1x - d[0] * t1z, t2z = d[0] * t1y - d[1] * t1x;
  const e = 30 / R;
  const hs = (x, y, z) => gen.sample(d[0] + x * e, d[1] + y * e, d[2] + z * e, 40, s2)[S_H];
  return Math.max(Math.abs(hs(t1x, t1y, t1z) - hs(-t1x, -t1y, -t1z)), Math.abs(hs(t2x, t2y, t2z) - hs(-t2x, -t2y, -t2z))) / 60;
}

// a cell's meadow: { x, y, z (unit direction), r (m) } or null
function meadowCell(gen, species, ci, cj, ck) {
  const key = `${ci}:${cj}:${ck}`;
  const cache = species._meadowCells || (species._meadowCells = new Map());
  if (cache.has(key)) return cache.get(key);
  let out = null;
  const R = gen.R, seed = species.seed;
  const keep = hash3f(ci, cj, ck, seed ^ 0x51a7) < species.meadows;
  if (keep) {
    const s2 = species._s2 || (species._s2 = new Float64Array(S_LEN));
    const hasSea = !!gen.p.liquid && gen.contThreshold > -1e8;
    let best = null, bestSlope = Infinity;
    for (let k = 0; k < 7; k++) {
      // a point in the cell, on the sphere (only if it really is in the cell: cells away from the surface have none)
      const px = (ci + hash3f(ci, cj, ck * 7 + k, seed ^ 0x1111)) * MEADOW_CELL;
      const py = (cj + hash3f(ci, cj, ck * 7 + k, seed ^ 0x2222)) * MEADOW_CELL;
      const pz = (ck + hash3f(ci, cj, ck * 7 + k, seed ^ 0x3333)) * MEADOW_CELL;
      const l = dm.hypot(px, py, pz);
      const d = [px / l, py / l, pz / l];
      if (Math.floor(d[0] * R / MEADOW_CELL) !== ci || Math.floor(d[1] * R / MEADOW_CELL) !== cj || Math.floor(d[2] * R / MEADOW_CELL) !== ck) continue;
      const h = gen.sample(d[0], d[1], d[2], 40, s2)[S_H];
      if ((hasSea && h < 2) || s2[S_WDEPTH] > 0) continue;
      const sl = broadSlope(gen, d, s2);
      if (sl < bestSlope) { bestSlope = sl; best = d; }
    }
    if (best && bestSlope < 0.07) out = { x: best[0], y: best[1], z: best[2], r: 35 + 45 * hash3f(ci, cj, ck, seed ^ 0x4444) };
  }
  if (cache.size > 20000) cache.clear();
  cache.set(key, out);
  return out;
}

// 0 (none) .. 1 (open meadow) at a unit direction (s2: unused, kept for callers)
export function meadowAt(gen, dir, h, species, s2) {
  if (!(species.meadows > 0)) return 0;
  const R = gen.R;
  const x = dir[0] * R, y = dir[1] * R, z = dir[2] * R;
  const ci = Math.floor(x / MEADOW_CELL), cj = Math.floor(y / MEADOW_CELL), ck = Math.floor(z / MEADOW_CELL);
  let m = 0;
  for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (let c = -1; c <= 1; c++) {
    const md = meadowCell(gen, species, ci + a, cj + b, ck + c);
    if (!md) continue;
    const dx = md.x * R - x, dy = md.y * R - y, dz = md.z * R - z;
    const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (d < md.r) m = Math.max(m, dm.smoothstep(md.r, md.r * 0.7, d));
  }
  return m;
}

// the meadows within `radius` m of a unit direction: [{ dir: [x, y, z], r }] (for landing)
export function meadowsNear(gen, species, dir, radius) {
  const R = gen.R, out = [];
  if (!(species.meadows > 0)) return out;
  const x = dir[0] * R, y = dir[1] * R, z = dir[2] * R;
  const n = Math.ceil(radius / MEADOW_CELL) + 1;
  const ci = Math.floor(x / MEADOW_CELL), cj = Math.floor(y / MEADOW_CELL), ck = Math.floor(z / MEADOW_CELL);
  for (let a = -n; a <= n; a++) for (let b = -n; b <= n; b++) for (let c = -n; c <= n; c++) {
    // (only cells near the surface hold any)
    const cx = (ci + a + 0.5) * MEADOW_CELL, cy = (cj + b + 0.5) * MEADOW_CELL, cz = (ck + c + 0.5) * MEADOW_CELL;
    if (Math.abs(dm.hypot(cx, cy, cz) - R) > MEADOW_CELL || dm.hypot(cx - x, cy - y, cz - z) > radius + MEADOW_CELL) continue;
    const md = meadowCell(gen, species, ci + a, cj + b, ck + c);
    if (md && dm.hypot(md.x * R - x, md.y * R - y, md.z * R - z) < radius) out.push({ dir: [md.x, md.y, md.z], r: md.r });
  }
  return out;
}

// Returns instance arrays for one node. Layout per instance (8 floats):
// x, y, z (relative to node origin), scale, rotation, tint, nx-ish..., kind index
export function scatterFlora(gen, face, level, ix, iy, maxLevel, species) {
  const R = gen.R;
  const { u0, v0, size } = chunkUVBounds(level, ix, iy);
  const arc = chunkArcSize(level, R);
  const area = arc * arc;
  const minW = chunkArcSize(maxLevel, R) / CHUNK_N * 2;
  const cdir = [0, 0, 0];
  dirFromFaceUV(face, u0 + size / 2, v0 + size / 2, cdir);
  const ox = cdir[0] * R, oy = cdir[1] * R, oz = cdir[2] * R;
  const rng = new Rng([hashInts(species.seed, face, level), hashInts(ix, iy, 77), species.seed ^ 0x51ed27, (ix * 73856093) ^ (iy * 19349663)]);
  const out = { tree: [], shrub: [], plant: [], rock: [], boulder: [] };
  const s = new Float64Array(S_LEN);
  const s2 = new Float64Array(S_LEN);
  const s3 = new Float64Array(S_LEN);
  const col = [0, 0, 0], mat = new Float64Array(8);
  const dir = [0, 0, 0];
  const hasSea = !!gen.p.liquid && gen.contThreshold > -1e8;
  // candidate budget scales with area; dense forests ~1 tree / 90 m^2
  const nCand = Math.min(2600, Math.round(area / 60));
  for (let i = 0; i < nCand; i++) {
    const u = u0 + rng.next() * size, v = v0 + rng.next() * size;
    dirFromFaceUV(face, u, v, dir);
    gen.sample(dir[0], dir[1], dir[2], minW, s);
    const h = s[S_H];
    if ((hasSea && h < 0.5) || s[S_WDEPTH] > 0) continue;
    // (cliff country is stepped and cut back in the volume: nothing stands there on the heightfield)
    if (cliffWeightAt(gen, dir, s3) > 0.12) continue;
    // slope from a tiny finite difference
    const e = 0.75 / R;
    const hx = gen.sample(dir[0] + e * (Math.abs(dir[1]) < 0.9 ? 1 : 0), dir[1] + e * (Math.abs(dir[1]) < 0.9 ? 0 : 1), dir[2], minW, s2)[S_H];
    const slope = Math.min(1, Math.abs(hx - h) / 0.75);
    gen.shade(s, slope * 0.5, col, mat);
    const veg = mat[0], snow = mat[1], rock = mat[2], sand = mat[3];
    const r = R + h;
    const px = dir[0] * r - ox, py = dir[1] * r - oy, pz = dir[2] * r - oz;
    const roll = rng.next();
    const tint = rng.next();
    const rot = rng.range(0, dm.TWO_PI);
    const Tc = s[S_TEMP] - 273.15;
    // an open meadow on flat ground: no trees, few shrubs or boulders, grass and flowers
    const meadow = meadowAt(gen, dir, h, species, s2);
    if (species.life > 0 && slope < 0.55 && snow < 0.5) {
      // (a simulated world's life map: how much of the cover is forest and how much open
      // country, so trees stand in its forests and shrubs and grass fill its open land)
      let fk = 1, ok = 1;
      if (gen.snap) { fk = 0.15 + 1.7 * gen.snap.forest(dir[0], dir[1], dir[2]); ok = 0.6 + 0.8 * gen.snap.open(dir[0], dir[1], dir[2]); }
      const pTree = veg * veg * species.densityTree * (Tc > -2 && Tc < 42 ? 1 : 0.2) * 0.5 * (1 - meadow) * fk;
      const pShrub = veg * species.densityShrub * 0.45 * (1 - 0.75 * meadow) * ok;
      const pPlant = veg * 0.9 * (1 + 0.4 * meadow) * (species.plantScarce ? 0.08 : 1) * ok; // (crusts only, where no plants reached land)
      if (roll < pTree) { out.tree.push(px, py, pz, rng.range(0.6, 1.25), rot, tint, slope, 0); continue; }
      if (roll < pTree + pShrub * 0.6) { out.shrub.push(px, py, pz, rng.range(0.6, 1.4), rot, tint, slope, 1); continue; }
      if (roll < pTree + pShrub * 0.6 + pPlant * 0.6) { out.plant.push(px, py, pz, rng.range(0.6, 1.5), rot, tint, slope, 2); continue; }
    }
    // (rocks and boulders: gen/rocks.js, where the ground's history put them; not the flora's own)
  }
  const res = { origin: [ox, oy, oz] };
  for (const k of FLORA_KINDS) res[k] = new Float32Array(out[k]);
  res.geo = scatterRocks(gen, face, level, ix, iy, maxLevel, species.seed ^ 0x2545f491).rocks;
  return res;
}
