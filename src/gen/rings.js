// Rings round rocky worlds, from what happened to them: a small moon that orbited inside the point
// where the planet's turning matches its orbit (or went round the wrong way, captured) was dragged
// inward by the tides it raised (Phobos is on its way now) until, at the Roche limit, the planet's
// pull across it outweighed its own and it came apart. Its rubble spread into a ring: inward, where
// the innermost of it rains onto the planet, and held at the outside near where it broke up. When:
// its age, how much there was and what it was made of set what's seen. A young ring is dense and
// clean, an old one thin and darkened by the dust that's fallen on it; ice from beyond the snow line
// is bright, rock dark. The planet's surviving moons clear gaps at their resonances (a ring particle
// that goes round twice for each of a moon's orbits is tugged the same way every time) and their
// gravity sharpens the edges. Fine structure (the ringlets and plateaus a dense ring's particles
// crowd into) is jitter on top.
//
// The ring is decided after a system's moons, from its own random stream, and only inside the
// innermost moon, so adding rings changed no moon and no world. It's applied to a system however it
// was got (generated, from the cache, from a bundle): addRockyRings is deterministic and fills in
// only what's missing.
import { Rng } from '../core/rng.js';
import * as dm from '../core/dmath.js';
import * as U from '../core/units.js';
import { hexToLinear, jitterColor } from './color.js';

export const RING_SAMPLES = 1024;

export function addRockyRings(system) {
  const byId = new Map(system.bodies.map((b) => [b.id, b]));
  for (const b of system.bodies) {
    // (rocky planets only; one already decided this version is left)
    if (b.kind !== 'planet' || (b.class !== 'terrestrial' && b.class !== 'dwarf')) continue;
    if (b.rings && (b.rings.kind !== 'debris' || b.rings.version === RINGS_VERSION)) continue;
    b.rings = rockyRings(Rng.fromString(`starseed/rings/v1/${system.seed}/${b.id}`), b, (b.moons || []).map((id) => byId.get(id)).filter(Boolean));
  }
  return system;
}
// (the data's version: a ring made by an older one is made again; its random stream stays the same)
const RINGS_VERSION = 2;

function rockyRings(rng, b, moons) {
  const Rp = b.radiusM, Mkg = b.massEarth * U.M_EARTH, rhoP = Mkg / (4 / 3 * Math.PI * Rp ** 3);
  // (the synchronous orbit: a moon inside it is slowed by the bulge it raises, ahead of it, and sinks)
  const Ps = (b.rotation?.periodRealH || 24) * 3600, sync = Math.cbrt(U.G * Mkg * Ps * Ps / (4 * Math.PI * Math.PI));
  // (ice where it's cold enough to last in sunlight in open space; rock nearer in)
  const icy = (b.Teq || 300) < 150;
  const rhoM = icy ? rng.range(900, 1400) : rng.range(1800, 2900);
  // (a rubble pile comes apart near the fluid Roche limit, 2.44 (rho_p / rho_m)^(1/3) radii)
  const roche = 2.44 * Math.cbrt(rhoP / rhoM) * Rp;
  let p = b.class === 'dwarf' ? 0.03 : 0.06;
  if (sync > roche * 1.1) p += 0.07;   // (a fast-turning world: the sinking zone reaches past the Roche limit)
  if (b.rotation?.retrograde) p += 0.03;
  if (!rng.chance(p)) return null;
  const ageMyr = rng.logUniform(3, 2500), young = dm.clamp(1 - Math.log10(ageMyr / 3) / Math.log10(2500 / 3), 0, 1);
  const moonKm = rng.logUniform(4, 40);
  let outer = roche * rng.range(0.82, 0.98), inner = Rp * rng.range(1.08, 1.25) * (1 + 0.25 * young);
  // (inside the innermost moon, with room: its own tides would take what's further out)
  const innerMoon = Math.min(Infinity, ...moons.map((m) => (m.orbit?.aReal || Infinity) * (1 - (m.orbitE || 0))));
  outer = Math.min(outer, innerMoon / 1.3);
  if (outer < inner * 1.25) return null;
  // (its density: more of a bigger moon, a young ring's not yet spread thin nor ground to dust)
  const tau0 = dm.clamp(0.12 * (moonKm / 10) ** 1.2 * (0.3 + 2.5 * young * young), 0.03, 2.8);
  const albedo = icy ? dm.lerp(0.32, 0.72, young) : dm.lerp(0.07, 0.2, young);
  const base = hexToLinear(icy ? (young > 0.5 ? '#ebe6dc' : '#d4c6ad') : (young > 0.5 ? '#8a8178' : '#5e5249'));
  const color = jitterColor(rng, base, 0.06).map((c) => c * albedo / Math.max(0.05, (base[0] + base[1] + base[2]) / 3));
  // (the moons' resonances inside it: the 2:1 and 3:2, a gap as wide as the moon's pull reaches)
  const gaps = [];
  for (const m of moons) {
    const a = m.orbit?.aReal; if (!a) continue;
    const q = Math.sqrt(Math.max(m.massEarth / b.massEarth, 1e-10));
    for (const [j, k, s] of [[1, 2, 1], [2, 3, 0.55], [3, 4, 0.3]]) {
      const r = a * (j / k) ** (2 / 3);
      if (r > inner && r < outer) gaps.push({ r: r * U.LEN_SCALE, w: dm.clamp(a * q * 0.9 * s, Rp * 0.002, Rp * 0.06) * U.LEN_SCALE, depth: dm.clamp(0.55 + 0.4 * s, 0, 0.97) });
    }
  }
  // (a first fragment's track: where a big piece held together a while before it too broke)
  // (its fragments: a shard still in it clears a lane (a gap, k < 0); one's debris still crowded (a ringlet))
  const fragments = Array.from({ length: rng.int(1, young > 0.4 ? 4 : 2) }, () => rng.chance(0.55)
    ? { x: rng.range(0.45, 0.97), w: rng.range(0.003, 0.012), k: -rng.range(0.6, 0.97) }
    : { x: rng.range(0.4, 0.95), w: rng.range(0.004, 0.015), k: rng.range(0.5, 1.5) });
  return {
    kind: 'debris', version: RINGS_VERSION,
    innerReal: inner, outerReal: outer, inner: inner * U.LEN_SCALE, outer: outer * U.LEN_SCALE,
    // (its thickness, drawn: thin, but enough to fly into, its boulders round you)
    thickness: dm.clamp(Rp * U.LEN_SCALE * rng.range(0.0012, 0.0025), 60, 400),
    color, opacity: tau0, tau0, ageMyr: Math.round(ageMyr), young: Math.round(young * 1000) / 1000, icy, moonKm: Math.round(moonKm * 10) / 10,
    peak: rng.range(0.55, 0.85), seed: rng.u32(), gaps, fragments,
    origin: `a ${Math.round(moonKm)} km ${icy ? 'icy' : 'rocky'} moon, torn apart ${ageMyr < 100 ? Math.round(ageMyr) + ' million' : (ageMyr / 1000).toFixed(1) + ' billion'} years ago`,
  };
}

function hash(x) { const s = Math.sin(x * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
function vnoise(x) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return hash(i) + (hash(i + 1) - hash(i)) * u; }

// The ring's normal optical depth at r (game units from the planet's centre). Its zones, as a debris
// ring spreads: a faint inner one, its material draining onto the planet (Saturn's C ring); the
// dense main band round where most of it stayed (its B ring); thinner out to the sharp outer edge
// where the moon came apart. Gaps where a moon's resonance or a surviving fragment clears its lane;
// a ringlet where a fragment's debris still crowds. Its plateaus and ringlets differ severalfold
// (jitter at three scales, in the log; a young ring's sharper, an old one's spread smoother).
export function ringTau(R, r) {
  if (r <= R.inner || r >= R.outer) return 0;
  const x = (r - R.inner) / (R.outer - R.inner), young = R.young ?? 0.5;
  const drain = 0.08 + 0.92 * dm.smoothstep(0.08, 0.3, x);
  const band = 0.45 + 0.55 * Math.exp(-(((x - R.peak) / 0.22) ** 2));
  let f = dm.smoothstep(0, 0.04, x) * drain * band * (1 - dm.smoothstep(0.992, 1, x));
  for (const g of R.gaps || []) { const d = (r - g.r) / Math.max(g.w, 1e-6); f *= 1 - g.depth * Math.exp(-d * d); }
  for (const q of R.fragments || []) { const d = (x - q.x) / q.w; f *= q.k > 0 ? 1 + q.k * Math.exp(-d * d) : 1 + q.k * Math.exp(-d * d * d * d); }
  const s = (R.seed % 997) * 0.37, k = 0.6 + 0.6 * young;
  f *= Math.exp(k * (1.1 * (vnoise(x * 19 + s) - 0.5) + 0.8 * (vnoise(x * 83 + s * 2) - 0.5) + 0.5 * (vnoise(x * 341 + s * 3) - 0.5)));
  return R.tau0 * f;
}

// n samples of the optical depth across the ring, inner edge to outer
export function ringSamples(R, n = RING_SAMPLES) {
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = ringTau(R, R.inner + (R.outer - R.inner) * (i + 0.5) / n);
  return out;
}
