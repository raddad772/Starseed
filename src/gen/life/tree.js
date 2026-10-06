// Trees (LIFE.md 5, a first cut; the foliage redo): a world's tree species from its history and its
// physics, and each one's form grown by branching (EZ-Tree's way: a trunk, its branches in levels, each
// level's from its parent's, bending toward the light and the pull, twigs ending in leaf clusters).
//   growth form   by its plants' grade (evolve.js plantGrade): tree ferns where only ferns have come (a
//                 trunk and a crown of fronds), seed trees (a central leader, whorls of branches: a
//                 conifer's build), flowering trees (a trunk that splits into a spreading crown)
//   size          its tallest from the history (maxTreeM), each species a share of it
//   build         McMahon's elastic similarity (1973): a trunk's width grows as its height^1.5 so it
//                 doesn't buckle, and as sqrt(g) under a heavier pull
//   leaves        the world's own pigment (pigments.js: the foliage colour), lighter and darker by species
// World state: from the world's seed and its data alone (Rng, dmath). Out: a species list and, per
// species, a skeleton (segments with radii) and its leaf clusters, for the renderer to mesh.
import * as dm from '../../core/dmath.js';
import { Rng } from '../../core/rng.js';

// the world's tree species: plantGrade (0 mosses .. 4 grasses), maxTreeM, g, veg (linear RGB), seed key
export function treeSpecies(grade, maxTreeM, g, veg, key, count = 3) {
  if (grade < 1 || !(maxTreeM > 1.5)) return [];
  const rng = Rng.fromString(`trees|${key}`), out = [];
  const gR = dm.clamp(g / 9.81, 0.2, 4);
  for (let i = 0; i < count; i++) {
    const r = rng.fork(`sp${i}`);
    // (the oldest grade's form for the first, the newest for the rest: a world's forests mixed)
    const form = grade <= 1 ? 'fern' : grade === 2 ? (i === 0 ? 'fern' : 'conifer') : (i === 0 ? 'conifer' : 'broadleaf');
    const H = maxTreeM * (form === 'fern' ? 0.25 : 1) * r.range(0.35, 0.8);
    const trunkR = 0.012 * dm.pow(H, 1.5) * dm.sqrt(gR) * r.range(0.8, 1.2) / Math.max(1, dm.pow(H / 30, 0.7));
    const tint = r.range(0.75, 1.25);
    out.push({
      id: i, form, H, trunkR: dm.clamp(trunkR, 0.05, 4), key: `${key}|${i}`,
      leaf: veg.map((x) => x * tint * (form === 'conifer' ? 0.7 : 1)), bark: [0.09, 0.07, 0.05].map((x) => x * r.range(0.7, 1.4)),
      levels: form === 'fern' ? 1 : form === 'conifer' ? 2 : 3,
      spread: form === 'broadleaf' ? r.range(0.45, 0.8) : form === 'conifer' ? r.range(0.25, 0.4) : 0.2,
      leafSize: form === 'fern' ? H * 0.35 : form === 'conifer' ? H * 0.05 : H * 0.09,
    });
  }
  return out;
}

// one tree of a species: its skeleton grown from the seed (a variant's own): { segs: [{ a: [x,y,z],
// b: [x,y,z], r0, r1 }], leaves: [{ p: [x,y,z], s, n: [x,y,z] }] } in the tree's frame (y up, metres)
export function growTree(sp, variant = 0) {
  const rng = Rng.fromString(`tree|${sp.key}|${variant}`), segs = [], leaves = [];
  const H = sp.H * rng.range(0.8, 1.15);
  const add = (a, b, r0, r1) => segs.push({ a, b, r0, r1 });
  const norm = (v) => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
  const perp = (d) => norm(Math.abs(d[1]) < 0.9 ? [d[2], 0, -d[0]] : [0, -d[2], d[1]]);
  const rot = (v, axis, a) => { const c = dm.cos(a), s = dm.sin(a), d = v[0] * axis[0] + v[1] * axis[1] + v[2] * axis[2], x = [axis[1] * v[2] - axis[2] * v[1], axis[2] * v[0] - axis[0] * v[2], axis[0] * v[1] - axis[1] * v[0]]; return [v[0] * c + x[0] * s + axis[0] * d * (1 - c), v[1] * c + x[1] * s + axis[1] * d * (1 - c), v[2] * c + x[2] * s + axis[2] * d * (1 - c)]; };
  // a limb: from p along d for len, in n sections, tapering r0 -> r1, bending up toward the light (and
  // down under its weight where it's long), children off it at the next level
  const limb = (p, d, len, r0, r1, level) => {
    const n = level === 0 ? 5 : 3;
    let q = p.slice(), dir = d.slice();
    const pts = [q.slice()];
    for (let k = 0; k < n; k++) {
      const t = (k + 1) / n, step = len / n;
      // (toward the light, a little, and the wood's own wander)
      dir = norm([dir[0] + rng.range(-0.12, 0.12), dir[1] + (level === 0 ? 0.15 : 0.08 - 0.06 * level), dir[2] + rng.range(-0.12, 0.12)]);
      const q2 = [q[0] + dir[0] * step, q[1] + dir[1] * step, q[2] + dir[2] * step];
      add(q, q2, r0 + (r1 - r0) * (k / n), r0 + (r1 - r0) * t);
      q = q2; pts.push(q.slice());
    }
    // its children
    if (level < sp.levels) {
      const kids = sp.form === 'conifer' && level === 0 ? Math.round(rng.range(9, 13)) : level === 0 ? Math.round(rng.range(3, 5)) : Math.round(rng.range(2, 4));
      for (let c = 0; c < kids; c++) {
        // (along it: a conifer's whorls all up its leader, shorter toward the top; a broadleaf's from the
        // upper part, where it forks)
        const f = sp.form === 'conifer' && level === 0 ? 0.2 + 0.78 * (c + rng.next() * 0.5) / kids : 0.45 + 0.5 * rng.next();
        const i = Math.min(pts.length - 2, Math.floor(f * (pts.length - 1))), at = pts[i], dd = norm([pts[i + 1][0] - at[0], pts[i + 1][1] - at[1], pts[i + 1][2] - at[2]]);
        const out = rot(perp(dd), dd, rng.range(0, dm.TWO_PI) + c * 2.39996);
        const angle = sp.form === 'conifer' ? rng.range(1.2, 1.5) : rng.range(0.5, 1.0);
        const nd = norm([dd[0] * dm.cos(angle) + out[0] * dm.sin(angle), dd[1] * dm.cos(angle) + out[1] * dm.sin(angle), dd[2] * dm.cos(angle) + out[2] * dm.sin(angle)]);
        const clen = len * (sp.form === 'conifer' && level === 0 ? sp.spread * 1.6 * (1.05 - f) : sp.spread * rng.range(0.6, 0.9));
        limb(at, nd, clen, (r0 + (r1 - r0) * f) * 0.55, r1 * 0.3, level + 1);
      }
    }
    // (its tips: leaf clusters along its outer part)
    if (level >= sp.levels - (sp.form === 'broadleaf' ? 1 : 0) || sp.form === 'fern') {
      const m = sp.form === 'fern' ? 0 : 2;
      for (let k = Math.max(1, pts.length - 1 - m); k < pts.length; k++) leaves.push({ p: pts[k], s: sp.leafSize * rng.range(0.7, 1.2), n: dir });
    }
  };
  if (sp.form === 'fern') {
    // a trunk, and a crown of fronds arching out from its top
    limb([0, 0, 0], [0, 1, 0], H, sp.trunkR, sp.trunkR * 0.8, 1);
    const top = segs[segs.length - 1].b, nF = Math.round(rng.range(8, 14));
    for (let k = 0; k < nF; k++) { const a = k * 2.39996, d = norm([dm.cos(a), rng.range(0.1, 0.6), dm.sin(a)]); leaves.push({ p: top, s: sp.leafSize, n: d, frond: true }); }
  } else limb([0, 0, 0], [0, 1, 0], H * (sp.form === 'conifer' ? 1 : 0.55), sp.trunkR, sp.trunkR * (sp.form === 'conifer' ? 0.15 : 0.5), 0);
  return { H, segs, leaves };
}
