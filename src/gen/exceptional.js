// Exceptional worlds: now and then a system holds one world made rare by an
// unusual cause (Dave: "each system should have some chance of an exceptional
// world"). Each kind has who can carry it (eligible), how often it's chosen
// (weight), and a cause handed to the world's history (worldsim/evolve.js) and
// to bodies.js, so the result still comes out of the physics, just rarely.
//
//   tidal-lava    a resonance with a sibling keeps its orbit eccentric: the star
//                 kneads it like Io, and its surface is lakes and seas of lava
//   impact-melt   a giant impact a few million years ago: the crust melted, the
//                 seas (and anything living) went with it, and it still glows
//
// More kinds to come (see WORLDSIM.md: exceptional worlds).

const CHANCE = 0.3; // of a system having one

const KINDS = [
  {
    kind: 'tidal-lava', weight: 1,
    // a rocky planet in the inner system (tides from the star fall off fast)
    eligible: (p, star) => rocky(p) && p.massEarth > 0.05 && p.aAU < 2 * Math.sqrt(star.luminosity),
    apply: (p, rng) => ({ kind: 'tidal-lava', tidal: rng.range(0.75, 1), lavaFrac: rng.range(0.08, 0.35), text: 'an eccentric orbit, held by a resonance with its neighbours, kneads it like Io: its plains are lakes and seas of lava' }),
  },
  {
    kind: 'impact-melt', weight: 1,
    eligible: (p) => rocky(p) && p.massEarth > 0.05,
    apply: (p, rng) => ({ kind: 'impact-melt', ago: rng.logUniform(0.002, 0.03), text: 'struck by another world a few million years ago: its crust melted, and it still glows' }),
  },
];

function rocky(p) { return p.comp.envelope < 0.001; }

// picks (or not) this system's exceptional world among its planets' protos,
// setting proto.exception; returns it
export function pickException(rng, protos, star) {
  if (rng.next() >= CHANCE) return null;
  const open = KINDS.map((k) => ({ k, who: protos.filter((p) => k.eligible(p, star)) })).filter((x) => x.who.length);
  if (!open.length) return null;
  let total = 0;
  for (const x of open) total += x.k.weight;
  let u = rng.next() * total, pick = open[open.length - 1];
  for (const x of open) { u -= x.k.weight; if (u < 0) { pick = x; break; } }
  const p = pick.who[Math.floor(rng.next() * pick.who.length)];
  p.exception = pick.k.apply(p, rng);
  return p.exception;
}
