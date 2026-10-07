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
    // (a crown full enough to close a canopy: clusters thick all along the outer twigs, the branches inside
    // hidden as a real crown's are)
    o.leaves.count = rng.int(5, 7); o.leaves.size = 3.6; o.leaves.angle = 20; o.leaves.start = 0; o.leaves.billboard = 'double';
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
  const flare = rootFlare(bark, form, rng, lod > 0 ? 12 : 16);
  return { bark, leaves, flare: flare.geo, footR: flare.R0, barkType: o.bark.type, leafType: o.leaves.type };
}

// its foot: the trunk flared into its roots, a few buttresses, spreading on below the ground (EZ-Tree's
// trunk a six-sided tube from its first ring a metre up, stood on the ground it met it in a crease, two
// planes and a line). From its base ring's radius R0 outward by a share of it (a broadleaf's buttressed,
// a conifer's less), falling off over ~half R0 up and tucked inside the trunk by 2.2 R0; below the ground
// still widening, roots under it (seen where a bank falls away from it). Its bark's texture on as the
// trunk's: once round, a section's height up. { geo (y up, its foot at 0), R0 }
function rootFlare(bark, form, rng, sides) {
  const p = bark.attributes.position.array;
  // (its base ring's middle: its extent's, the ring's seam a vertex twice)
  let R0 = 0, L1 = Infinity, x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
  for (let i = 0; i < p.length; i += 3) {
    if (p[i + 1] < 0.02) { x0 = Math.min(x0, p[i]); x1 = Math.max(x1, p[i]); z0 = Math.min(z0, p[i + 2]); z1 = Math.max(z1, p[i + 2]); } else L1 = Math.min(L1, p[i + 1]);
  }
  const cx = x0 < Infinity ? 0.5 * (x0 + x1) : 0, cz = z0 < Infinity ? 0.5 * (z0 + z1) : 0;
  for (let i = 0; i < p.length; i += 3) if (p[i + 1] < 0.02) R0 = Math.max(R0, Math.hypot(p[i] - cx, p[i + 2] - cz));
  if (!(L1 < Infinity)) L1 = 4 * R0;
  const broad = form === 'broadleaf', A = broad ? 0.3 : 0.2, B = broad ? rng.range(0.4, 0.65) : rng.range(0.2, 0.35);
  const nL = rng.int(3, broad ? 6 : 5), ph = rng.range(0, 2 * Math.PI), fall = 0.45 * R0, yTop = 2.2 * R0, yBot = -0.8 * R0, rings = 9;
  const pos = [], uv = [], idx = [];
  for (let j = 0; j <= rings; j++) {
    const y = yBot + (yTop - yBot) * Math.pow(j / rings, 1.5);
    // (its flare: off over ~half R0 up, the roots' spread on under the ground; its core in to 0.75 R0 at its
    // top, inside the trunk's six sides there)
    const F = y >= 0 ? Math.exp(-y / fall) : 1 - 0.6 * y / R0;
    const s = Math.min(1, Math.max(0, (y - 0.3 * yTop) / (0.7 * yTop))), core = 1 - 0.25 * s * s * (3 - 2 * s);
    for (let i = 0; i <= sides; i++) {
      const th = 2 * Math.PI * i / sides, lobe = Math.pow(Math.max(0, Math.cos(nL * (th - ph) / 2) ** 2), 2);
      const r = R0 * (core + F * (A + B * lobe));
      pos.push(cx + r * Math.cos(th), y, cz + r * Math.sin(th));
      uv.push(i / sides, y / L1);
    }
  }
  for (let j = 0; j < rings; j++) for (let i = 0; i < sides; i++) {
    const a = j * (sides + 1) + i, b = a + 1, c = a + sides + 1, d = c + 1;
    idx.push(a, c, b, b, c, d);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return { geo, R0 };
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
