// Forest stands: where a world's forests close their canopy and where the country between lies open
// (flora.js the trees, terrain.js the ground's colour under and between them). World state: the
// world's seed, its snapshot, its terrain and its fire record alone.
import * as dm from '../../core/dmath.js';
import { hash3f } from '../../core/rng.js';
import { S_WET } from '../terrain.js';
import { fireAtDir, FIRE_OLD } from './fire.js';

// smooth value noise (-1..1) on the integer lattice: the stands' draw
export function valueNoise(x, y, z, seed) {
  const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z), fx = x - ix, fy = y - iy, fz = z - iz;
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy), sz = fz * fz * (3 - 2 * fz);
  const h = (a, b, c) => hash3f(ix + a, iy + b, iz + c, seed) * 2 - 1;
  const l = (a, b, t) => a + (b - a) * t;
  return l(l(l(h(0, 0, 0), h(1, 0, 0), sx), l(h(0, 1, 0), h(1, 1, 0), sx), sy), l(l(h(0, 0, 1), h(1, 0, 1), sx), l(h(0, 1, 1), h(1, 1, 1), sx), sy), sz);
}
// Stands (Dave: "an unbroken canopy, not random trees here and there"): the life map's forest (its share
// of the cover, times the cover as the ground's drawn green) as closed stands over that share of the
// ground, the crowns touching, and open country between with a tree here and there. Which ground: a
// river's wet banks first (gallery forest), the rest by a smooth draw over ~60-300 m (the patches'
// edges); then the recent centuries' fires (life/fire.js) set a stand's age: a crown fire's ground
// regrowing, its trees young and small and the canopy open for its first decades; ground that burns
// every decade or two kept open (a savanna's grass, its few trees). At a unit direction (s its terrain
// sample, share the forest's share of the ground there; fire: by the fire record too (the near ground's,
// the trees'), else the stands as the draw has them): { k 0..1 how much a stand, size its trees' (young
// stands smaller) }
const _stand = { k: 0, size: 1 };
export function standAt(gen, dir, s, share, fire = true) {
  _stand.k = 0; _stand.size = 1;
  if (!(share > 0)) return _stand;
  const R = gen.R, x = dir[0] * R, y = dir[1] * R, z = dir[2] * R, seed = ((gen.p.seed ? gen.p.seed[0] : 0) ^ 0x57a4d) >>> 0;
  // (three octaves of value noise, ~0.24 their spread, made near uniform by the normal's curve (a
  // logistic fit), so a share's threshold takes about that share of the ground)
  const n = 0.55 * valueNoise(x / 140, y / 140, z / 140, seed) + 0.3 * valueNoise(x / 320, y / 320, z / 320, seed ^ 0x3c6ef372) + 0.15 * valueNoise(x / 60, y / 60, z / 60, seed ^ 0x1b873593);
  const U = 1 / (1 + dm.exp(-1.702 * n / 0.24)) + 0.35 * (s[S_WET] || 0);
  let k = dm.smoothstep(1 - share - 0.05, 1 - share + 0.05, U);
  if (k > 0 && fire) {
    const f = fireAtDir(gen, dir[0], dir[1], dir[2]);
    if (f) {
      if (f.ageC !== FIRE_OLD) { k *= dm.smoothstep(6, 60, f.ageC); _stand.size = 0.35 + 0.65 * dm.smoothstep(4, 80, f.ageC); }
      // (a fire every twenty years or so over the three centuries: the ground's kept open)
      k *= 1 - dm.smoothstep(8, 20, f.n);
    }
  }
  _stand.k = k;
  return _stand;
}

