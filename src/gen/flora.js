// Flora & rock scattering (deterministic, runs in the terrain workers).
//
// Species are derived from the planet seed and biosphere: a dominant tree
// form, a shrub, a small ground plant, plus two rock shapes (and crystal
// clusters on some barren worlds). Instances are scattered per quadtree node
// of a fixed level; each candidate's acceptance depends on the terrain sample
// there (vegetation cover, rock exposure, slope, water). Heights come from the
// full-detail terrain function so instances sit on the finest mesh.

import { Rng, hashInts } from '../core/rng.js';
import { dirFromFaceUV, chunkUVBounds, chunkArcSize } from './cubesphere.js';
import { S_LEN, S_H, S_TEMP, S_MOIST } from './terrain.js';
import * as dm from '../core/dmath.js';
import { CHUNK_N } from './chunkbuilder.js';

export const FLORA_KINDS = ['tree', 'shrub', 'plant', 'rock', 'boulder'];

// Species description from planet params (also used by the renderer)
export function floraSpecies(terrain) {
  const rng = new Rng(terrain.seed).fork('flora');
  const life = terrain.life || 0;
  const forms = ['conifer', 'broadleaf', 'bulb', 'fern', 'mushroom', 'spire'];
  const tree = forms[rng.int(0, forms.length - 1)];
  const shrub = rng.pick(['blob', 'fan', 'tufts']);
  const plant = rng.pick(['tufts', 'stalks', 'cups']);
  return {
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
    if (hasSea && h < 0.5) continue;
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
    if (species.life > 0 && slope < 0.55 && snow < 0.5) {
      const pTree = veg * veg * species.densityTree * (Tc > -2 && Tc < 42 ? 1 : 0.2) * 0.5;
      const pShrub = veg * species.densityShrub * 0.45;
      const pPlant = veg * 0.9;
      if (roll < pTree) { out.tree.push(px, py, pz, rng.range(0.6, 1.25), rot, tint, slope, 0); continue; }
      if (roll < pTree + pShrub * 0.6) { out.shrub.push(px, py, pz, rng.range(0.6, 1.4), rot, tint, slope, 1); continue; }
      if (roll < pTree + pShrub * 0.6 + pPlant * 0.6) { out.plant.push(px, py, pz, rng.range(0.6, 1.5), rot, tint, slope, 2); continue; }
    }
    const pRock = (0.012 + rock * 0.12 + sand * 0.004) * species.densityRock * (snow > 0.7 ? 0.3 : 1);
    if (rng.next() < pRock) {
      const big = rng.next() < 0.18 + rock * 0.2;
      if (big) out.boulder.push(px, py, pz, rng.range(0.8, 2.6) * species.rockScale, rot, tint, slope, 4);
      else out.rock.push(px, py, pz, rng.range(0.25, 0.9) * species.rockScale, rot, tint, slope, 3);
    }
  }
  const res = { origin: [ox, oy, oz] };
  for (const k of FLORA_KINDS) res[k] = new Float32Array(out[k]);
  return res;
}
