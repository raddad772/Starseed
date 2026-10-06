// A creature's design (LIFE.md 3): from its world's body plan (biosphere.js), the ruling lineage on its
// land (posture, warm or cold blood, limbs, size), its place in the food web and its mass (ecology.js),
// and its world's gravity. Every part from function: a two-sided plan a trunk of segments with limb
// pairs down it and a head in front; a radial one a hub with legs on each arm and eyes round its rim.
// Gravity sets the build (Galileo's square-cube: stockier and shorter-legged where it's heavy, gangly
// where it's light); posture sets the legs (a sprawler's out to the sides, an upright one's under it).
// Its coat matches its country for now (camouflage against its world's foliage and dry ground, darker
// above, paler below: countershading); its own vision's patterns come with the spectra (LIFE.md 6).
// World state: from the world's seed and these alone (Rng, dmath).
import * as dm from '../../core/dmath.js';
import { Rng } from '../../core/rng.js';

// plan: biosphere plan; clade: the land's ruling lineage; level: 1 grazer .. 4 apex; massKg; g (m/s2);
// palette: { veg, dry } linear RGB (the world's foliage and dry ground); key: the species' own seed
export function designCreature(plan, clade, level, massKg, g, palette, key) {
  const rng = Rng.fromString(`creature|${key}`);
  const gR = dm.clamp(g / 9.81, 0.15, 4);
  // (its bulk: a body of ~1000 kg/m3, length^3 x a build factor; heavier gravity, stockier)
  const build = 0.05 * dm.pow(gR, 0.25) * rng.range(0.8, 1.25) * (level >= 2 ? 0.85 : 1);
  const len = dm.pow(massKg / (1000 * build), 1 / 3);
  const radial = plan.symmetry > 2;
  const upright = clade.posture === 'upright';
  // (legs: as long as the body under a light pull, shorter under a heavy one; hunters longer)
  const legLen = len * (radial ? 0.55 : 0.6) * dm.pow(gR, -0.3) * (level >= 2 ? 1.15 : 1) * rng.range(0.85, 1.15);
  const legR = dm.clamp(len * 0.055 * dm.pow(gR, 0.35), 0.01, len * 0.15);
  const nLimbs = Math.max(radial ? plan.symmetry : 4, clade.limbs || plan.limbs);
  const limbs = [];
  let body, head = null;
  if (!radial) {
    // a trunk of segments front to back (-z forward), the limb pairs spread down it
    const nSeg = plan.segmented ? Math.max(3, nLimbs / 2 + 1) : 2;
    const segs = [];
    for (let i = 0; i < nSeg; i++) {
      const f = nSeg > 1 ? i / (nSeg - 1) : 0.5;
      segs.push({ z: (f - 0.5) * len, r: len * 0.16 * (1 - 0.3 * Math.abs(f - 0.4)) * rng.range(0.9, 1.1) });
    }
    body = { kind: 'trunk', segs };
    head = { z: -0.5 * len - len * 0.12, r: len * (level >= 2 ? 0.13 : 0.11) };
    const pairs = nLimbs / 2;
    for (let p = 0; p < pairs; p++) {
      const z = (pairs > 1 ? p / (pairs - 1) - 0.5 : 0) * len * 0.75;
      for (const side of [-1, 1]) limbs.push({ hip: [side * len * 0.12, 0, z], out: [side, 0, 0], group: (p + (side > 0 ? 1 : 0)) % 2 });
    }
  } else {
    // a hub, a leg (or two) on each arm, round it
    body = { kind: 'hub', r: len * 0.35, h: len * 0.22 };
    for (let i = 0; i < nLimbs; i++) {
      const a = dm.TWO_PI * i / nLimbs;
      limbs.push({ hip: [dm.sin(a) * len * 0.3, 0, -dm.cos(a) * len * 0.3], out: [dm.sin(a), 0, -dm.cos(a)], group: i % 2 });
    }
  }
  // (each leg: thigh and shin; a sprawler's thigh out sideways and its hip low; an upright one's under it)
  const hipH = legLen * (upright ? 0.92 : 0.6);
  for (const L of limbs) { L.upper = legLen * 0.55; L.lower = legLen * 0.55; L.r = legR; L.splay = upright ? 0.15 : 0.7; }
  // its coat: its country's colours, darker above, paler below; a pattern by its lineage
  const mix = (a, b, k) => a.map((x, i) => x + (b[i] - x) * k);
  const base = mix(palette.veg, palette.dry, rng.range(0.3, 0.9));
  const coat = {
    back: base.map((x) => x * rng.range(0.55, 0.8)),
    belly: mix(base, [0.6, 0.55, 0.45], 0.4),
    mark: base.map((x) => x * rng.range(0.25, 0.45)),
    pattern: rng.pick(['plain', 'stripes', 'spots', 'bands']),
  };
  // (eyes: the plan's, on the head or round the hub's rim)
  const eyes = [];
  if (head) for (let i = 0; i < Math.min(plan.eyes, 6); i++) { const side = i % 2 ? 1 : -1, row = Math.floor(i / 2); eyes.push([side * head.r * 0.6, head.r * (0.3 - 0.25 * row), head.z - head.r * 0.6]); }
  else for (let i = 0; i < Math.min(plan.eyes, 12); i++) { const a = dm.TWO_PI * (i + 0.5) / plan.eyes; eyes.push([dm.sin(a) * body.r * 0.8, body.h * 0.6, -dm.cos(a) * body.r * 0.8]); }
  // its walk: how fast its legs swing (a pendulum's ~sqrt(g/L)), a duty factor (feet down share)
  const stepHz = 0.6 * Math.sqrt(g / Math.max(legLen, 0.05));
  return { key, radial, len, massKg, level, legLen, hipH, limbs, body, head, eyes, coat, stepHz, duty: nLimbs >= 6 ? 0.55 : 0.6,
    walk: 0.35 * Math.sqrt(g * legLen), run: 1.6 * Math.sqrt(g * legLen) };
}
