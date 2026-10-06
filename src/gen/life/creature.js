// A creature's design (LIFE.md 3): from its world's body plan (biosphere.js), the ruling lineage on its
// land (posture, warm or cold blood, limbs), its place in the food web and its mass (ecology.js), its
// world's gravity, and its own line's traits (lineage.js: how far its realm's animals have drifted from
// the founders: legs, build, head, neck, tail, colours, pattern, a crest). Every part from function: a
// two-sided plan a trunk of segments with limb pairs down it, a head on a neck in front and a tail
// behind; a radial one a hub with legs on each arm and eyes round its rim. Gravity sets the build
// (Galileo's square-cube: stockier and shorter-legged where it's heavy, gangly where it's light);
// posture sets the legs (a sprawler's out to the sides, an upright one's under it). A grazer's eyes to
// its sides (to see round it), a hunter's forward (to judge a distance). Its coat matches its country
// for now (camouflage against its world's foliage and dry ground, darker above, paler below:
// countershading); its own vision's patterns come with the spectra (LIFE.md 6).
// World state: from the world's seed and these alone (Rng, dmath).
import * as dm from '../../core/dmath.js';
import { Rng } from '../../core/rng.js';

const PATTERNS = ['plain', 'spots', 'stripes', 'bands'];

// plan: biosphere plan; clade: the land's ruling lineage; level: 1 grazer .. 4 apex; massKg; g (m/s2);
// palette: { veg, dry } linear RGB (the world's foliage and dry ground); key: the species' own seed;
// traits: its line's (lineage.js TRAITS order), or none (the founders', each species a little its own)
export function designCreature(plan, clade, level, massKg, g, palette, key, traits = null) {
  const rng = Rng.fromString(`creature|${key}`);
  const T = traits || Float64Array.from({ length: 10 }, () => rng.normal(0, 0.5));
  const [, tLegs, tSlender, tHead, tNeck, tTail, tHue, tShade, tMark, tCrest] = T;
  const gR = dm.clamp(g / 9.81, 0.15, 4);
  // (its bulk: a body of ~1000 kg/m3, length^3 x a build factor; heavier gravity, stockier)
  const build = 0.05 * dm.pow(gR, 0.25) * dm.exp(-0.25 * tSlender) * (level >= 2 ? 0.85 : 1);
  const len = dm.pow(massKg / (1000 * build), 1 / 3);
  const radial = plan.symmetry > 2;
  const upright = clade.posture === 'upright';
  // (legs: as long as the body under a light pull, shorter under a heavy one; hunters longer)
  const legLen = len * (radial ? 0.55 : 0.6) * dm.pow(gR, -0.3) * (level >= 2 ? 1.15 : 1) * dm.exp(0.18 * tLegs);
  const legR = dm.clamp(len * 0.04 * dm.pow(gR, 0.35), 0.006, len * 0.12);
  const nLimbs = Math.max(radial ? plan.symmetry : 4, clade.limbs || plan.limbs);
  const limbs = [], extra = [];
  let body, head = null;
  const thin = dm.exp(-0.15 * tSlender);
  if (!radial) {
    // a trunk of segments front to back (-z forward), the limb pairs spread down it
    const nSeg = plan.segmented ? Math.max(3, nLimbs / 2 + 1) : 2;
    const segs = [];
    for (let i = 0; i < nSeg; i++) {
      const f = nSeg > 1 ? i / (nSeg - 1) : 0.5;
      segs.push({ z: (f - 0.5) * len, r: len * 0.16 * thin * (1 - 0.3 * Math.abs(f - 0.4)) * rng.range(0.9, 1.1) });
    }
    body = { kind: 'trunk', segs };
    // its head on a neck from the body's front, up and forward (it lowers both to graze, from the
    // neck's root: pz, py)
    const r = len * (level >= 2 ? 0.13 : 0.11) * dm.exp(0.18 * tHead);
    const neck = len * dm.clamp(0.08 + 0.14 * tNeck, 0.02, 0.6), rise = dm.clamp(0.5 + 0.25 * tNeck, 0.1, 1.1);
    head = { pz: -0.5 * len, py: segs[0].r * 0.3, r, neck, nr: Math.max(r * 0.45, segs[0].r * 0.35), dy: neck * dm.sin(rise), dz: -neck * dm.cos(rise) - r * 0.6 };
    const pairs = nLimbs / 2;
    for (let p = 0; p < pairs; p++) {
      const z = (pairs > 1 ? p / (pairs - 1) - 0.5 : 0) * len * 0.75;
      for (const side of [-1, 1]) limbs.push({ hip: [side * len * 0.12 * thin, 0, z], out: [side, 0, 0], group: (p + (side > 0 ? 1 : 0)) % 2 });
    }
    // its tail, tapering behind (a counterweight to a long neck, a runner's balance)
    const tail = len * dm.clamp(0.35 + 0.3 * tTail, 0, 1.3), back = segs[segs.length - 1];
    if (tail > len * 0.08) for (let i = 0; i < 3; i++) {
      const f = (i + 0.5) / 3, rr = back.r * (0.55 - 0.4 * f);
      extra.push({ x: 0, y: -back.r * 0.15 * f - tail * 0.12 * f * f, z: back.z + back.r * 0.6 + tail * f, sx: rr, sy: rr * 0.9, sz: tail / 3 * 0.65 + rr * 0.3 });
    }
    // a crest along its back: plates or a frill, where its line has grown one
    if (tCrest > 0.5) {
      const hgt = len * 0.06 * Math.min(2.5, tCrest - 0.3), k = 4 + Math.round(2 * Math.min(1, tCrest - 0.5));
      for (let i = 0; i < k; i++) { const f = (i + 0.5) / k, z = (f - 0.5) * len * 0.9; extra.push({ x: 0, y: segs[0].r * 0.85 + hgt * 0.5, z, sx: len * 0.012, sy: hgt * (0.6 + 0.6 * Math.sin(Math.PI * f)), sz: len * 0.05, mark: true }); }
    }
  } else {
    // a hub, a leg (or two) on each arm, round it
    body = { kind: 'hub', r: len * 0.35 * thin, h: len * 0.22 };
    for (let i = 0; i < nLimbs; i++) {
      const a = dm.TWO_PI * i / nLimbs;
      limbs.push({ hip: [dm.sin(a) * len * 0.3, 0, -dm.cos(a) * len * 0.3], out: [dm.sin(a), 0, -dm.cos(a)], group: i % 2 });
    }
    if (tCrest > 0.5) extra.push({ x: 0, y: body.h * 0.9, z: 0, sx: body.r * 0.25, sy: len * 0.08 * Math.min(2.5, tCrest - 0.3), sz: body.r * 0.25, mark: true });
  }
  // (each leg: thigh and shin; a sprawler's thigh out sideways and its hip low; an upright one's under it)
  const hipH = legLen * (upright ? 0.92 : 0.6);
  for (const L of limbs) { L.upper = legLen * 0.55; L.lower = legLen * 0.55; L.r = legR; L.splay = upright ? 0.15 : 0.7; }
  // (how far it swings its neck down to graze: its head to the ground, if its neck reaches)
  if (head) { const L = Math.hypot(head.dy, head.dz), rise0 = dm.atan2(head.dy, -head.dz); head.down = dm.clamp(rise0 - dm.asin(dm.clamp((-hipH + head.r * 0.8 - head.py) / L, -1, 1)), 0.3, rise0 + 1.2); }
  // its coat: its country's colours (its line's own mix of foliage and dry ground, its shade), darker
  // above, paler below; a pattern its line has come to
  const mix = (a, b, k) => a.map((x, i) => x + (b[i] - x) * k);
  const base = mix(palette.veg, palette.dry, dm.clamp(0.75 + 0.3 * tHue, 0.1, 1.2));
  const dark = dm.clamp(0.95 * dm.exp(-0.25 * tShade), 0.45, 1.4);
  const coat = {
    back: base.map((x) => x * dark),
    belly: mix(base, [0.6, 0.55, 0.45], 0.4),
    mark: base.map((x) => x * dark * 0.5),
    pattern: PATTERNS[tMark < -0.6 ? 0 : tMark < 0.1 ? 1 : tMark < 0.7 ? 2 : 3],
  };
  // (eyes: the plan's, on the head (a grazer's to its sides, a hunter's forward; from the head's
  // centre) or round the hub's rim)
  const eyes = [];
  if (head) {
    const side = level >= 2 ? 0.5 : 0.75, fwd = level >= 2 ? 0.8 : 0.45;
    for (let i = 0; i < Math.min(plan.eyes, 6); i++) { const s = i % 2 ? 1 : -1, row = Math.floor(i / 2); eyes.push([s * head.r * side, head.r * (0.3 - 0.25 * row), -head.r * fwd]); }
  } else for (let i = 0; i < Math.min(plan.eyes, 12); i++) { const a = dm.TWO_PI * (i + 0.5) / plan.eyes; eyes.push([dm.sin(a) * body.r * 0.8, body.h * 0.6, -dm.cos(a) * body.r * 0.8]); }
  // its walk: how fast its legs swing (a pendulum's ~sqrt(g/L)), a duty factor (feet down share); its
  // walk at a Froude number (v^2/gL) of ~0.12, its run a gallop's ~9 (Alexander 1989: a horse's ~10
  // m/s), a hunter's a little faster
  const stepHz = 0.6 * Math.sqrt(g / Math.max(legLen, 0.05));
  return { key, radial, len, massKg, level, legLen, hipH, limbs, body, head, extra, eyes, coat, stepHz, duty: nLimbs >= 6 ? 0.55 : 0.6,
    walk: 0.35 * Math.sqrt(g * legLen), run: (level >= 2 ? 3.3 : 3) * Math.sqrt(g * legLen) };
}
