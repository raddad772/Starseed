// Trees by EZ-Tree (vendor/ez-tree: Daniel Greenheck's generator, MIT): a world's tree species grown with
// its options set from the world. Its form from its plants' history (flora.js: seed trees a conifer's
// build, whorls of branches up a leader and needles; flowering trees a broadleaf's spreading crown on a
// forking trunk), its height the history's (flora.js treeHeight, from maxTree), its build from its
// gravity (under a heavier pull stouter, its branches shorter and reaching up less; under a lighter one
// gangly and spreading: McMahon's elastic similarity, as gen/life/tree.js), its bark's and its leaves'
// kinds by the world's own luck, its leaves coloured by the world's pigment in the shader
// (floraRender.js: the leaf sprite's brightness times the foliage's colour, so a red world's leaves are
// red). Geometry only, scaled to its height: the flora material draws it, with the textures here.
import * as THREE from 'three';
import { Tree } from '../../vendor/ez-tree/tree.js';
import TreeOptions from '../../vendor/ez-tree/options.js';
import { Rng } from '../core/rng.js';

const BASE = new URL('../../vendor/ez-tree/assets/', import.meta.url).href;

// sp: flora.js species (tree form, treeHeight, seed); g: gravity (m/s2); lod: 0 near, 1 the middle
// distance (the same tree from the same seed, its last level of twigs left off and its leaves' clusters
// bigger in their place, its limbs fewer-sided: a forest's hundreds affordable). { bark, leaves }
// geometries (tree frame, y up, its foot at 0, its top at treeHeight; uv on each), its bark and leaf kinds;
// null for a form EZ-Tree doesn't grow
export function ezTreeGeometry(sp, g = 9.81, lod = 0) {
  const form = sp.tree;
  if (form !== 'conifer' && form !== 'broadleaf') return null;
  const rng = Rng.fromString(`ez-tree|${sp.seed}|${form}`), gR = Math.max(0.2, Math.min(4, g / 9.81));
  const reach = Math.pow(gR, -0.3);   // (its branches' length against the trunk's: longer in a light pull)
  const o = new TreeOptions();
  o.seed = rng.int(1, 1e6);
  if (form === 'conifer') {
    o.type = 'evergreen';
    o.bark.type = 'pine'; o.leaves.type = 'pine';
    o.branch.levels = 2;
    o.branch.children = { 0: rng.int(10, 16), 1: rng.int(3, 5), 2: 2 };
    o.branch.angle = { 1: rng.range(70, 95), 2: rng.range(40, 60), 3: 45 };
    o.branch.start = { 1: rng.range(0.15, 0.35), 2: 0.3, 3: 0.3 };
    o.branch.length = { 0: 20, 1: 6.5 * reach, 2: 2.2, 3: 1 };
    o.branch.radius = { 0: 0.9 * Math.sqrt(gR), 1: 0.55, 2: 0.6, 3: 0.6 };
    o.branch.taper = { 0: 0.85, 1: 0.8, 2: 0.7, 3: 0.7 };
    o.branch.gnarliness = { 0: 0.04, 1: 0.12, 2: 0.15, 3: 0.02 };
    o.branch.sections = { 0: 10, 1: 5, 2: 3, 3: 3 };
    o.branch.segments = { 0: 6, 1: 3, 2: 3, 3: 3 };
    o.branch.force = { direction: { x: 0, y: 1, z: 0 }, strength: 0.012 / gR };
    o.leaves.count = rng.int(4, 6); o.leaves.size = 1.8; o.leaves.angle = 30; o.leaves.billboard = 'double';
  } else {
    o.type = 'deciduous';
    o.bark.type = rng.pick(['oak', 'oak', 'birch', 'willow']); o.leaves.type = rng.pick(['oak', 'ash', 'aspen']);
    o.branch.levels = 3;
    o.branch.children = { 0: rng.int(5, 8), 1: rng.int(3, 5), 2: rng.int(2, 4) };
    o.branch.angle = { 1: rng.range(40, 70), 2: rng.range(40, 60), 3: 50 };
    o.branch.start = { 1: rng.range(0.3, 0.5), 2: 0.3, 3: 0.3 };
    o.branch.length = { 0: 18, 1: 13 * reach, 2: 6.5 * reach, 3: 1.5 };
    o.branch.radius = { 0: 1.3 * Math.sqrt(gR), 1: 0.6, 2: 0.65, 3: 0.65 };
    o.branch.taper = { 0: 0.7, 1: 0.7, 2: 0.7, 3: 0.7 };
    o.branch.gnarliness = { 0: rng.range(0.08, 0.2), 1: 0.2, 2: 0.25, 3: 0.03 };
    o.branch.sections = { 0: 8, 1: 5, 2: 3, 3: 2 };
    o.branch.segments = { 0: 6, 1: 4, 2: 3, 3: 3 };
    o.branch.force = { direction: { x: 0, y: 1, z: 0 }, strength: 0.012 / gR };
    // (a crown full enough to close a canopy: clusters thick along the outer twigs)
    o.leaves.count = rng.int(3, 4); o.leaves.size = 3.2; o.leaves.angle = 20; o.leaves.start = 0.1; o.leaves.billboard = 'double';
  }
  o.bark.textured = false;
  if (lod > 0) {
    o.branch.levels -= 1;
    o.leaves.size *= 1.8; o.leaves.billboard = 'single';
    for (const k of Object.keys(o.branch.segments)) o.branch.segments[k] = Math.min(o.branch.segments[k], k === '0' ? 4 : 3);
  }
  const t = new Tree(o);
  t.generate();
  const bark = t.branchesMesh.geometry, leaves = t.leavesMesh.geometry;
  // (to its height: its top, leaves and all)
  bark.computeBoundingBox(); leaves.computeBoundingBox();
  const top = Math.max(bark.boundingBox.max.y, leaves.boundingBox.max.y), k = sp.treeHeight / Math.max(top, 1e-3);
  bark.scale(k, k, k); leaves.scale(k, k, k);
  return { bark, leaves, barkType: o.bark.type, leafType: o.leaves.type };
}

// the textures a world's trees draw with, loaded once each (vendor/ez-tree/assets)
const cache = new Map();
function tex(path, repeat) {
  if (cache.has(path)) return cache.get(path);
  const t = new THREE.TextureLoader().load(BASE + path);
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; }
  t.anisotropy = 4;
  cache.set(path, t);
  return t;
}
export const barkTexture = (type) => tex(`bark/${type}_color_1k.jpg`, true);
export const leafTexture = (type) => tex(`leaves/${type}_color.png`, false);
