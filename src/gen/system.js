// Star-system formation model.
//
//  1. Protoplanetary disk: solid surface density Sigma ~ a^-1.5 (MMSN-like),
//     scaled with stellar mass and metallicity, boosted beyond the snow line
//     (water ice) and, in compact systems, by inward pebble drift.
//  2. Orbital slots: geometric spacing in period ratio (Kepler multi-planet
//     systems peak at P2/P1 ~ 1.5-2; wider spacing for outer giants).
//  3. Each slot sweeps the solids of its annulus -> core mass. Cores beyond the
//     snow line that reach ~10 M_earth before the gas disk dissipates undergo
//     runaway accretion (gas giants, mass function dN/dlogM ~ M^-0.3);
//     smaller icy cores become ice giants; inner cores may keep thin H/He
//     envelopes (sub-Neptunes) unless photoevaporation strips them.
//  4. Rare hot Jupiters migrate inward and clear the inner system.
//  5. Dynamical stability: neighbours closer than ~10 mutual Hill radii merge.
//  6. Moons: regular satellite systems around giants (total ~1e-4 of the
//     planet mass, Canup & Ward 2006), giant-impact moons and captured
//     moonlets around rocky planets. Rings inside the Roche limit.

import { Rng } from '../core/rng.js';
import * as dm from '../core/dmath.js';
import * as U from '../core/units.js';
import { generateStar } from './star.js';
import { buildBody } from './bodies.js';
import { pickException } from './exceptional.js';
import { makeOrbit, orbitState } from '../core/kepler.js';
import { makeName, roman, PLANET_LETTERS } from './names.js';
import { qFromTo, qAxisAngle, qMul, qRotate, qConj, norm, cross, perp, dot } from '../core/vec.js';
import { hexToLinear, jitterColor } from './color.js';

export const GENERATOR_VERSION = 1;
const M_SUN_IN_EARTH = U.M_SUN / U.M_EARTH;

function makeDisk(rng, star) {
  return {
    // (disk mass grows faster than the star's: ~M^1.5, Andrews et al. 2013, so
    // red dwarfs get small, compact families)
    sigma1: 11 * dm.pow(star.mass, 1.5) * dm.pow(10, star.metallicity) * rng.lognormal(1, 0.5), // g/cm^2 of solids at 1 AU
    snow: star.snowLine * rng.range(0.85, 1.15),
    iceBoost: rng.range(2.5, 4.0),
    pebbleBoost: rng.lognormal(1.9, 0.4),
    innerBoost: rng.chance(0.55) ? rng.lognormal(4, 0.6) : rng.range(0.8, 1.5), // compact super-Earth systems
    outer: 32 * dm.sqrt(star.mass) * rng.range(0.7, 1.3),
    gasLifetime: rng.lognormal(3.2, 0.45), // Myr
  };
}

function formPlanets(rng, star, disk) {
  const slots = [];
  const p1Days = rng.logUniform(3.5, 90);
  let a = dm.cbrt((p1Days / 365.25) * (p1Days / 365.25) * star.mass);
  while (a < disk.outer * 1.6 && slots.length < 16) {
    slots.push(a);
    const beyond = a > disk.snow;
    const ratio = Math.max(rng.lognormal(beyond ? 2.3 : 1.7, 0.2), 1.3);
    a *= dm.pow(ratio, 2 / 3);
  }
  // Occurrence-rate studies put eta_earth (rocky planets in the HZ of Sun-like
  // stars) at roughly 0.3-0.6, so most combs get one slot nudged into the HZ.
  if (rng.chance(0.62)) {
    const hzc = dm.sqrt(star.hz.inner * star.hz.outer);
    let best = 0;
    for (let i = 1; i < slots.length; i++) {
      if (Math.abs(dm.log(slots[i] / hzc)) < Math.abs(dm.log(slots[best] / hzc))) best = i;
    }
    const f = hzc / slots[best] * rng.range(0.9, 1.1);
    for (let i = 0; i < slots.length; i++) slots[i] *= f;
  }
  while (slots.length && slots[0] < 0.018) slots.shift();
  while (slots.length && slots[slots.length - 1] > disk.outer) slots.pop();

  const protos = [];
  let gasLeft = disk.gasLifetime;
  for (let i = 0; i < slots.length; i++) {
    const pr = rng.fork('slot' + i);
    const aAU = slots[i];
    const aIn = i > 0 ? slots[i - 1] : aAU / 1.4;
    const aOut = i < slots.length - 1 ? slots[i + 1] : aAU * 1.4;
    const width = (aOut - aIn) / 2;
    const beyond = aAU > disk.snow;
    const inner = 1 + (disk.innerBoost - 1) * (1 - dm.smoothstep(0.15, 0.6, aAU));
    const sigma = disk.sigma1 * dm.pow(aAU, -1.5) * (beyond ? disk.iceBoost * disk.pebbleBoost : 1) * inner;
    const solid = 0.2355 * aAU * width * sigma; // M_earth of solids in the annulus
    const emptyRoll = pr.next();
    let core = solid * pr.range(0.35, 0.9) * pr.lognormal(1, 0.3);
    if (!beyond) core = Math.min(core, pr.range(5, 11));
    if (emptyRoll < (beyond ? 0.18 : 0.17) || core < 0.004) continue; // never formed / scattered away
    const proto = { aAU, slot: i, formedBeyond: beyond };
    if (beyond) {
      const crit = pr.lognormal(10, 0.3);
      const growthMyr = 0.6 * dm.pow(aAU / 5, 2.2) * dm.pow(10 / Math.max(core, 0.5), 0.8);
      // (gas giants need a gas-rich disk: their frequency goes ~ with the star's
      // mass, Johnson et al. 2010; around red dwarfs they're rare)
      if (core >= crit && growthMyr < gasLeft && pr.next() < Math.min(1, star.mass * 1.1)) {
        // runaway gas accretion; each giant eats gas and opens a gap
        const mJ = Math.min(pr.powerLaw(0.1, 8, -1.3), pr.chance(0.85) ? 3 : 8) * dm.pow(10, star.metallicity * 0.5) * Math.min(1, star.mass / 0.6);
        proto.massEarth = Math.max(mJ * 317.8, core * 3);
        proto.comp = { iron: 0.1, rock: 0.3, water: 0.6, envelope: 1 - Math.min(0.15, core / proto.massEarth) };
        gasLeft *= 0.45;
      } else if (core >= 3 && growthMyr < gasLeft * 3) {
        const env = pr.range(0.08, 0.2);
        proto.massEarth = core / (1 - env);
        proto.comp = { iron: 0.1, rock: 0.3, water: 0.6, envelope: env };
      } else {
        proto.massEarth = Math.min(core, pr.range(1, 4));
        proto.comp = { iron: pr.range(0.12, 0.25), rock: 0.4, water: pr.range(0.25, 0.5), envelope: 0 };
      }
    } else {
      proto.massEarth = core;
      // (an alpha-rich, metal-poor cloud has less iron for its rock: smaller cores)
      const iron = dm.clamp(pr.normal(0.32, 0.06) * dm.pow(10, -(star.alphaFe || 0)) + (aAU < 0.25 ? 0.12 : 0), 0.12, 0.7);
      const water = pr.logUniform(8e-6, 3e-3) * (aAU > disk.snow * 0.6 ? 10 : 1);
      proto.comp = { iron, rock: 1 - iron - water, water, envelope: 0 };
      // sub-Neptunes: cores above ~2 M_earth often keep a few % H/He ...
      if (core > 1.8 && pr.chance(0.6)) {
        const S = star.luminosity / (aAU * aAU);
        const stripS = 60 * dm.pow(core / 3, 2); // ... unless photoevaporated (the radius valley)
        if (S < stripS) {
          const env = pr.logUniform(0.005, 0.06);
          proto.massEarth = core / (1 - env);
          proto.comp.envelope = env;
        }
      }
    }
    protos.push(proto);
  }

  // Hot Jupiter: inward disk migration (~1% of Sun-like stars, metallicity-dependent)
  const giants = protos.filter((p) => p.comp.envelope > 0.5);
  if (giants.length && rng.chance(0.012 * dm.pow(10, 2 * star.metallicity))) {
    const g = giants[0];
    g.aAU = rng.range(0.025, 0.07) * dm.cbrt(star.mass);
    g.migrated = true;
    for (let i = protos.length - 1; i >= 0; i--) if (protos[i] !== g && protos[i].aAU < 0.7) protos.splice(i, 1);
  }
  // Warm Jupiter: a giant migrating partway in (~8% of systems with giants, more metal-rich
  // ones): it clears the rocky protoplanets round its new orbit and brings its icy moons
  // with it (ocean moons, if it ends up in the habitable zone); now and then it captures
  // one of the rocky worlds it scattered as a moon (an Earth-class moon)
  const still = giants.filter((g) => !g.migrated);
  if (still.length && rng.chance(0.12 * dm.pow(10, star.metallicity) * Math.min(1, star.mass))) {
    const g = still[0];
    g.aAU = g.aAU * rng.logUniform(0.04, 0.8);
    g.migrated = true;
    let scattered = null;
    for (let i = protos.length - 1; i >= 0; i--) {
      const q = protos[i];
      if (q === g || q.comp.envelope > 0.5) continue;
      if (q.aAU > g.aAU / 1.6 && q.aAU < g.aAU * 1.6) { if (!scattered || q.massEarth > scattered.massEarth) scattered = q; protos.splice(i, 1); }
    }
    if (scattered && scattered.massEarth > 0.05 && rng.chance(0.4)) g.capturedRock = { massEarth: scattered.massEarth, comp: { ...scattered.comp } };
  }
  protos.sort((x, y) => x.aAU - y.aAU);

  // Dynamical stability: resolve the most unstable neighbour pair first.
  // Required separation in mutual Hill radii: ~8 for compact rocky pairs,
  // ~5 when a giant is involved (Jupiter-Saturn sit at ~7.8).
  for (;;) {
    let worst = -1, worstRatio = 1;
    for (let i = 0; i < protos.length - 1; i++) {
      const p = protos[i], q = protos[i + 1];
      const mu = (p.massEarth + q.massEarth) / (3 * star.mass * M_SUN_IN_EARTH);
      const rh = dm.cbrt(mu) * (p.aAU + q.aAU) / 2;
      const need = (p.comp.envelope > 0.5 || q.comp.envelope > 0.5) ? 5 : 8;
      const ratio = (q.aAU - p.aAU) / rh / need;
      if (ratio < worstRatio) { worstRatio = ratio; worst = i; }
    }
    if (worst < 0) break;
    const p = protos[worst], q = protos[worst + 1];
    const big = p.massEarth >= q.massEarth ? p : q, small = big === p ? q : p;
    if (big.comp.envelope < 0.5 && small.comp.envelope < 0.5) {
      const m = big.massEarth + small.massEarth; // giant impact merger
      big.comp.water = (big.comp.water * big.massEarth + small.comp.water * small.massEarth) / m;
      big.massEarth = m;
    } else big.scattered = true; // ejection leaves the survivor eccentric
    protos.splice(protos.indexOf(small), 1);
  }
  while (protos.length > 9) {
    let mi = 0;
    for (let i = 1; i < protos.length; i++) if (protos[i].massEarth < protos[mi].massEarth) mi = i;
    protos.splice(mi, 1);
  }
  return protos;
}

function orbitalElements(rng, proto, nPlanets, nGiants) {
  const loneGiant = nGiants === 1 && nPlanets <= 3 && proto.comp.envelope > 0.5;
  const sigmaE = proto.migrated ? 0.005 : ((loneGiant || proto.scattered) ? 0.14 : (proto.comp.envelope > 0.5 ? 0.04 : 0.025));
  return {
    e: Math.min(rng.rayleigh(sigmaE), 0.33),
    i: rng.rayleigh(0.022),
    Om: rng.range(0, dm.TWO_PI),
    w: rng.range(0, dm.TWO_PI),
    M0: rng.range(0, dm.TWO_PI),
  };
}

// Spin axis, rotation rate and the body-fixed -> inertial transform.
function setupRotation(body, orbit) {
  const r = body.rotation;
  const W = orbit ? orbit.W : [0, 1, 0];
  let axis;
  if (r.locked || !orbit) axis = W.slice();
  else {
    const u1 = perp(W), u2 = cross(W, u1);
    const c = dm.cos(r.tiltAzimuth), s = dm.sin(r.tiltAzimuth);
    const t = [c * u1[0] + s * u2[0], c * u1[1] + s * u2[1], c * u1[2] + s * u2[2]];
    const co = dm.cos(r.obliquity), so = dm.sin(r.obliquity);
    axis = norm([co * W[0] + so * t[0], co * W[1] + so * t[1], co * W[2] + so * t[2]]);
  }
  let periodGame;
  if (r.locked) periodGame = orbit.period;
  else periodGame = r.periodRealH * U.HOUR * U.TIME_SCALE;
  r.axis = axis;
  r.qTilt = qFromTo([0, 1, 0], axis);
  r.periodGame = periodGame;
  r.rate = (r.retrograde ? -1 : 1) * dm.TWO_PI / periodGame;
}

export function bodyOrientationAt(body, t, out = [0, 0, 0, 1]) {
  const r = body.rotation;
  const q = qAxisAngle([0, 1, 0], r.phase0 + r.rate * t);
  return qMul(r.qTilt, q, out);
}

function makeMoons(rng, planet, planetProto, star, disk) {
  const moons = [];
  const Rp = planet.radiusM;
  const Mp = planet.massEarth;
  const hill = planetProto.aAU * U.AU * (1 - planet.orbitE) * dm.cbrt(Mp / (3 * star.mass * M_SUN_IN_EARTH));
  const maxA = 0.38 * hill;
  const ringOuter = planet.rings ? planet.rings.outerReal : 0;
  let minA = Math.max(2.6 * Rp, ringOuter * 1.25);
  const warm = planetProto.aAU < disk.snow * 0.9;

  if (planet.class === 'gasGiant' || planet.class === 'iceGiant') {
    const giant = planet.class === 'gasGiant';
    const n = giant ? rng.weighted([[1, 2], [3, 3], [3, 4], [2, 5]]) : rng.weighted([[2, 1], [3, 2], [2, 3]]);
    const total = Mp * rng.lognormal(giant ? 2.0e-4 : 1.1e-4, 0.45);
    const weights = [];
    // (a super-Jupiter's moons share less evenly: one big one can dominate, Titan-like)
    for (let i = 0; i < n; i++) weights.push(rng.lognormal(1, Mp > 950 ? 1.1 : 0.7));
    const wsum = weights.reduce((x, y) => x + y, 0);
    let a = Math.max(minA, Rp * rng.range(giant ? 5 : 4.5, giant ? 8 : 7));
    for (let i = 0; i < n; i++) {
      if (a > maxA) break;
      const mr = rng.fork('moon' + i);
      const water = warm ? mr.logUniform(1e-4, 5e-3) : dm.clamp(0.05 + 0.48 * (i / Math.max(1, n - 1)) + mr.range(-0.08, 0.08), 0.02, 0.55);
      moons.push({
        kind: 'moon', aReal: a, massEarth: Math.max(total * weights[i] / wsum, 2e-5),
        comp: { iron: water < 0.1 ? 0.25 : 0.1, rock: 1 - water - (water < 0.1 ? 0.25 : 0.1), water, envelope: 0 },
        tidalHeating: (n >= 3 && i === 0) ? mr.range(0.85, 1.0) : ((n >= 3 && i === 1) ? mr.range(0.3, 0.6) : mr.range(0, 0.15)),
        e: mr.rayleigh(0.004), i: mr.rayleigh(0.006), captured: false,
      });
      a *= dm.pow(Math.max(mr.lognormal(1.95, 0.15), 1.5), 2 / 3);
    }
    // a rocky world the giant captured as it migrated (an Earth-class moon)
    if (planetProto.capturedRock) {
      const mr = rng.fork('capturedRock');
      const ac = Math.min(maxA * 0.5, Rp * mr.range(15, 40));
      if (ac > minA) moons.push({ kind: 'moon', aReal: ac, massEarth: planetProto.capturedRock.massEarth, comp: planetProto.capturedRock.comp, tidalHeating: mr.range(0.05, 0.3), e: mr.range(0, 0.03), i: mr.range(0, 0.3), captured: true });
    }
    // occasional large captured moon (Triton-like, retrograde)
    if (!giant && rng.chance(0.3)) {
      const mr = rng.fork('captured');
      const ac = Math.min(maxA * 0.6, Rp * mr.range(12, 25));
      if (ac > minA) moons.push({
        kind: 'moon', aReal: ac, massEarth: Mp * mr.range(1e-4, 3e-4),
        comp: { iron: 0.15, rock: 0.4, water: 0.45, envelope: 0 }, tidalHeating: 0.1,
        e: mr.range(0, 0.02), i: dm.PI - mr.range(0.1, 0.6), captured: true,
      });
    }
  } else if (planet.class === 'terrestrial' && Mp > 0.25) {
    if (rng.chance(0.32)) { // giant-impact moon
      const mr = rng.fork('impactMoon');
      const ac = Math.min(maxA * 0.7, Rp * mr.range(18, 55));
      if (ac > minA) moons.push({
        kind: 'moon', aReal: ac, massEarth: Mp * mr.range(0.005, 0.03),
        comp: { iron: 0.08, rock: 0.92 - planet.comp.water, water: planet.comp.water, envelope: 0 },
        tidalHeating: 0, e: mr.rayleigh(0.03), i: mr.rayleigh(0.08), captured: false,
      });
    }
    if (rng.chance(0.22)) { // captured moonlets
      const k = rng.int(1, 2);
      for (let i = 0; i < k; i++) {
        const mr = rng.fork('moonlet' + i);
        const rKm = mr.range(5, 18);
        const mass = 4 / 3 * dm.PI * dm.pow(rKm * 1000, 3) * 1900 / U.M_EARTH;
        const ac = Rp * mr.range(2.8, 7);
        if (ac < maxA) moons.push({
          kind: 'moon', aReal: ac, massEarth: mass,
          comp: { iron: 0.05, rock: 0.85, water: 0.1, envelope: 0 },
          tidalHeating: 0, e: mr.rayleigh(0.01), i: mr.rayleigh(0.02), captured: true,
        });
      }
    }
  }
  moons.sort((x, y) => x.aReal - y.aReal);
  // keep moons mutually separated
  for (let i = moons.length - 1; i > 0; i--) if (moons[i].aReal / moons[i - 1].aReal < 1.25) moons.splice(i, 1);
  return moons;
}

function makeRings(rng, planet, planetProto, disk) {
  let p = 0;
  if (planet.class === 'gasGiant') p = 0.4;
  else if (planet.class === 'iceGiant') p = 0.55;
  else if (planet.class === 'miniNeptune') p = 0.06;
  if (!rng.chance(p)) return null;
  const faint = planet.class !== 'gasGiant' && rng.chance(0.6);
  const icy = planetProto.aAU > disk.snow * 0.8;
  const inner = rng.range(1.18, 1.45), outer = rng.range(1.9, 2.4);
  return {
    innerReal: inner * planet.radiusM, outerReal: outer * planet.radiusM,
    inner: inner * planet.R, outer: outer * planet.R,
    color: jitterColor(rng, hexToLinear(icy ? (rng.chance(0.5) ? '#d9cfb8' : '#e6e1d6') : '#6a5c50'), 0.08),
    opacity: faint ? rng.range(0.05, 0.18) : rng.range(0.45, 0.95),
    seed: rng.u32(),
    gaps: rng.int(1, 4),
  };
}

function startScore(b, bodies) {
  let s = 0;
  if (b.life) s += 3;
  if (b.hydrosphere.water === 'liquid') s += 1.5;
  if (b.atmosphere) {
    s += 0.5;
    const p = b.atmosphere.pressure;
    if (p > 0.3 && p < 5) s += 0.5;
    if (p > 20) s -= 2;
  }
  s -= Math.abs(b.Tsurf - 290) / 60;
  s -= Math.abs(b.gravity / 9.81 - 1) * 0.8;
  if (b.hydrosphere.liquid === 'lava') s -= 1;
  if (b.hydrosphere.oceanFraction >= 0.99) s -= 2;
  const parent = bodies[b.parentId];
  if (parent && parent.kind === 'planet' && !parent.solid) s += 0.6; // a giant in the sky
  return s;
}

// The head of a system, decided first and cheaply from its seed: the star, its
// disk, its planets' orbits and make-up, their names, and whether one of them
// is exceptional. generateSystem builds everything else on top of exactly this,
// so a summary (summarizeSystem) always agrees with the full system.
// The seed SOL: the Sun and its eight planets as they are (orbits, masses, make-up), everything
// else (their air and history, surfaces, moons) the same physics as any system's
const SOL = {
  star: { mass: 1, age: 4.6, metallicity: 0, name: 'Sun', catalog: 'Sol' },
  planets: [
    // (and their spins: Mercury's 3:2 resonance, Venus' slow retrograde turn)
    { name: 'Mercury', aAU: 0.387, massEarth: 0.0553, iron: 0.68, water: 1e-5, known: { rotH: 1407.6, obliquityDeg: 0.03 } },
    { name: 'Venus', aAU: 0.723, massEarth: 0.815, iron: 0.31, water: 2e-4, known: { rotH: 5832.5, obliquityDeg: 2.6, retro: true } },
    { name: 'Earth', aAU: 1.0, massEarth: 1.0, iron: 0.32, water: 2.6e-4, known: { rotH: 23.93, obliquityDeg: 23.44 } },
    // (Mars' history, which no physics here decides: its crustal dichotomy, the Tharsis rise and
    // its giant shields (Olympus Mons, the Tharsis Montes, Elysium), Valles Marineris)
    { name: 'Mars', aAU: 1.524, massEarth: 0.107, iron: 0.24, water: 4e-4, known: { dichotomy: true, shields: 5, canyon: true, rotH: 24.62, obliquityDeg: 25.19 } },
    { name: 'Jupiter', aAU: 5.2, massEarth: 317.8, envelope: 0.9 },
    { name: 'Saturn', aAU: 9.58, massEarth: 95.2, envelope: 0.8 },
    { name: 'Uranus', aAU: 19.2, massEarth: 14.5, envelope: 0.15 },
    { name: 'Neptune', aAU: 30.1, massEarth: 17.1, envelope: 0.15 },
  ],
};
// their moons as they are (a: km from the planet, mass in Earths, water's share; tidal heating
// 0..1; Titan's thick nitrogen and methane, a coin's toss in the history, known)
const rk = (water, iron = 0.25) => ({ iron: water < 0.1 ? iron : 0.1, rock: 1 - water - (water < 0.1 ? iron : 0.1), water, envelope: 0 });
const SOL_MOONS = {
  Earth: [{ name: 'Moon', a: 384400, m: 0.0123, comp: rk(1e-5, 0.08), tidal: 0 }],
  Mars: [{ name: 'Phobos', a: 9376, m: 1.8e-9, comp: rk(0.01, 0.1), tidal: 0, captured: true }, { name: 'Deimos', a: 23463, m: 2.5e-10, comp: rk(0.01, 0.1), tidal: 0, captured: true }],
  Jupiter: [
    { name: 'Io', a: 421700, m: 0.015, comp: rk(0, 0.2), tidal: 1 },
    { name: 'Europa', a: 671034, m: 0.008, comp: rk(0.08, 0.15), tidal: 0.5 },
    { name: 'Ganymede', a: 1070412, m: 0.0248, comp: rk(0.45), tidal: 0.1, known: { titanish: false } },
    { name: 'Callisto', a: 1882709, m: 0.018, comp: rk(0.5), tidal: 0, known: { titanish: false } },
  ],
  Saturn: [
    { name: 'Enceladus', a: 237948, m: 1.8e-5, comp: rk(0.5), tidal: 0.4 },
    { name: 'Rhea', a: 527108, m: 3.9e-4, comp: rk(0.6), tidal: 0 },
    { name: 'Titan', a: 1221870, m: 0.0225, comp: rk(0.45), tidal: 0.02, known: { titanish: true } },
  ],
  Uranus: [{ name: 'Titania', a: 436300, m: 5.9e-4, comp: rk(0.5), tidal: 0 }, { name: 'Oberon', a: 583500, m: 5.1e-4, comp: rk(0.5), tidal: 0 }],
  Neptune: [{ name: 'Triton', a: 354759, m: 0.00359, comp: rk(0.25), tidal: 0.1, captured: true, retro: true }],
};
function solMoons(planet) {
  return (SOL_MOONS[planet.name] || []).map((m) => ({
    kind: 'moon', name: m.name, aReal: m.a * 1000, massEarth: m.m, comp: m.comp, tidalHeating: m.tidal,
    e: 0.002, i: m.retro ? 2.73 : 0.003, captured: !!m.captured, known: m.known,
  }));
}
function solProtos(disk) {
  return SOL.planets.map((p, i) => ({
    aAU: p.aAU, slot: i, formedBeyond: p.aAU > disk.snow, massEarth: p.massEarth, known: p.known,
    comp: p.envelope ? { iron: 0.1, rock: 0.3, water: 0.6, envelope: p.envelope } : { iron: p.iron, rock: 1 - p.iron - p.water, water: p.water, envelope: 0 },
  }));
}

function systemHead(seedInput) {
  const seed = String(seedInput);
  const root = Rng.fromString(`starseed/v${GENERATOR_VERSION}/${seed}`);
  const sol = seed === 'SOL';
  const star = generateStar(root.fork('star'), sol ? SOL.star : null);
  const disk = makeDisk(root.fork('disk'), star);
  const protos = sol ? solProtos(disk) : formPlanets(root.fork('formation'), star, disk);
  const exception = sol ? null : pickException(root.fork('exception'), protos, star);
  const planetRng = root.fork('planets');
  const names = sol ? SOL.planets.map((p) => p.name) : protos.map((proto) => makeName(planetRng.fork('p' + proto.slot).fork('name'), 2, 3));
  const debris = systemDebris(root.fork('debris'), protos, disk);
  return { seed, root, star, disk, protos, exception, planetRng, names, debris };
}

// How cluttered a system is with leftover rock and ice (it scales every
// world's impact rate; impacts.js): wide by nature, more with giant planets to
// stir their belts and with more leftover disk solids; sometimes the giants'
// orbits shift and fling a late storm of debris inward (as the Nice model has
// the Solar System's late heavy bombardment)
function systemDebris(rng, protos, disk) {
  const giants = protos.filter((p) => p.comp.envelope > 0.5).length;
  const level = rng.lognormal(1, 0.7) * (giants ? 1.4 + 0.2 * giants : 0.6) * dm.pow(disk.sigma1 / 11, 0.3);
  const spike = giants >= 2 && rng.next() < 0.3 ? { atGyr: rng.range(0.4, 1.0), widthGyr: rng.range(0.05, 0.15), strength: rng.lognormal(15, 0.6) } : null;
  const name = level < 0.5 ? 'quiet' : level < 2 ? 'ordinary' : level < 5 ? 'busy' : 'a shooting gallery';
  return { level, spike, name };
}

// A quick look at a system from its seed (for finding interesting ones across
// the galaxy): the star (type, colour, size, age), its planets' names, sizes and
// orbits, which sit in the habitable zone, and any exceptional world. A fraction
// of a millisecond, against tens for the full system.
export function summarizeSystem(seedInput) {
  const H = systemHead(seedInput), s = H.star;
  const planets = H.protos.map((p, i) => {
    const cls = p.comp.envelope > 0.5 ? 'gas giant' : p.comp.envelope > 0.04 && p.massEarth > 8 ? 'ice giant' : p.comp.envelope > 0.001 ? 'mini-Neptune' : p.massEarth < 0.08 ? 'dwarf' : 'rocky';
    const inHZ = p.aAU >= s.hz.optimisticInner && p.aAU <= s.hz.optimisticOuter;
    return { name: H.names[i], letter: PLANET_LETTERS[i], aAU: p.aAU, massEarth: p.massEarth, kind: cls, inHZ, rockyInHZ: inHZ && cls !== 'gas giant' && cls !== 'ice giant', exceptional: p.exception ? p.exception.kind : null };
  });
  return {
    seed: H.seed, name: s.name, catalog: s.catalog, spectral: s.spectral, teff: s.teff, color: s.color,
    mass: s.mass, radius: s.radius, luminosity: s.luminosity, age: s.age, metallicity: s.metallicity,
    planets, nPlanets: planets.length,
    hzRocky: planets.filter((p) => p.rockyInHZ).map((p) => p.name),
    exceptional: H.exception ? { kind: H.exception.kind, planet: planets.find((p) => p.exceptional).name, text: H.exception.text } : null,
    debris: { level: H.debris.level, name: H.debris.name, lateBombardment: !!H.debris.spike },
  };
}

export function generateSystem(seedInput) {
  const H = systemHead(seedInput);
  const { seed, root, star, disk, protos } = H;
  star.debris = H.debris;

  star.id = 0;
  star.parentId = -1;
  star.label = `${star.spectral} main-sequence star`;
  star.rotation = { locked: false, periodRealH: star.rotPeriod / U.HOUR, obliquity: 0, retrograde: false, phase0: 0, tiltAzimuth: 0 };
  setupRotation(star, null);
  star.soi = Infinity;
  star.solid = false;
  const bodies = [star];

  const nGiants = protos.filter((p) => p.comp.envelope > 0.5).length;
  const planetRng = H.planetRng;
  protos.forEach((proto, idx) => {
    const pr = planetRng.fork('p' + proto.slot);
    proto.kind = 'planet';
    proto.aStarAU = proto.aAU;
    const body = buildBody(pr.fork('body'), proto, star, null);
    body.id = bodies.length;
    body.parentId = 0;
    body.index = idx;
    body.designation = `${star.name} ${PLANET_LETTERS[idx]}`;
    body.name = H.names[idx];
    const el = orbitalElements(pr.fork('orbit'), proto, protos.length, nGiants);
    body.orbitE = el.e;
    body.aAU = proto.aAU;
    body.orbit = makeOrbit({ a: proto.aAU * U.GAME_AU, ...el }, star.GM);
    body.orbit.aReal = proto.aAU * U.AU;
    body.soi = body.orbit.a * dm.pow(body.GM / star.GM, 0.4);
    body.hill = body.orbit.a * (1 - el.e) * dm.cbrt(body.GM / (3 * star.GM));
    setupRotation(body, body.orbit);
    body.rings = makeRings(pr.fork('rings'), body, proto, disk);
    body.moons = [];
    bodies.push(body);
    body._proto = proto;
  });

  // Moons
  const planets = bodies.filter((b) => b.kind === 'planet');
  for (const planet of planets) {
    const mr = root.fork('moons').fork('p' + planet._proto.slot);
    const mprotos = seed === 'SOL' ? solMoons(planet) : makeMoons(mr, planet, planet._proto, star, disk);
    mprotos.forEach((mp, k) => {
      const r = mr.fork('m' + k);
      mp.aStarAU = planet.aAU;
      const moon = buildBody(r.fork('body'), mp, star, planet);
      moon.id = bodies.length;
      moon.parentId = planet.id;
      moon.index = k;
      moon.designation = `${planet.designation} ${roman(k + 1)}`;
      moon.name = mp.name || makeName(r.fork('name'), 2, 3);
      moon.aAU = planet.aAU;
      moon.orbitE = mp.e;
      moon.orbit = makeOrbit({
        a: mp.aReal * U.LEN_SCALE, e: mp.e, i: mp.i,
        Om: r.range(0, dm.TWO_PI), w: r.range(0, dm.TWO_PI), M0: r.range(0, dm.TWO_PI),
        frame: planet.rotation.qTilt, // regular moons orbit in the planet's equatorial plane
      }, planet.GM);
      moon.orbit.aReal = mp.aReal;
      moon.soi = moon.orbit.a * dm.pow(moon.GM / planet.GM, 0.4);
      moon.hill = moon.orbit.a * (1 - mp.e) * dm.cbrt(moon.GM / (3 * planet.GM));
      setupRotation(moon, moon.orbit);
      moon.rings = null;
      moon.moons = [];
      moon.captured = mp.captured;
      planet.moons.push(moon.id);
      bodies.push(moon);
    });
  }

  // Tidally locked planets: the day side faces a fixed body-fixed direction.
  for (const b of bodies) {
    if (b.kind === 'star' || !b.terrain) continue;
    const isLockedToStar = b.kind === 'planet' && b.rotation.locked;
    b.terrain.climate.locked = isLockedToStar;
    if (isLockedToStar) {
      const pos = [0, 0, 0];
      orbitState(b.orbit, 0, pos, null);
      const toStar = norm([-pos[0], -pos[1], -pos[2]]);
      const q = bodyOrientationAt(b, 0);
      b.terrain.climate.substellar = qRotate(qConj(q), toStar);
    }
  }

  // Asteroid belt between the last rocky planet and the first giant
  const belts = [];
  const firstGiant = planets.find((p) => p.class === 'gasGiant');
  if (firstGiant) {
    const inside = planets.filter((p) => p.aAU < firstGiant.aAU);
    const lastRocky = inside.length ? inside[inside.length - 1].aAU : firstGiant.aAU * 0.2;
    const inner = Math.max(lastRocky * 1.35, firstGiant.aAU * 0.42);
    const outer = firstGiant.aAU * 0.72;
    if (outer > inner * 1.15) {
      const br = root.fork('belt');
      belts.push({ inner: inner * U.GAME_AU, outer: outer * U.GAME_AU, innerAU: inner, outerAU: outer, seed: br.u32(), density: br.range(0.4, 1.0) });
    }
  }

  for (const b of bodies) delete b._proto;

  // Starting world: the most pleasant / spectacular solid surface
  let start = null, bestScore = -Infinity;
  for (const b of bodies) {
    if (!b.solid || b.radiusM < 150e3) continue;
    const sc = startScore(b, bodies);
    if (sc > bestScore + 1e-9) { bestScore = sc; start = b; }
  }

  return {
    seed, version: GENERATOR_VERSION,
    star, disk: { snowLine: disk.snow, outer: disk.outer, metallicity: star.metallicity },
    hz: star.hz,
    bodies, belts,
    startBodyId: start ? start.id : 1,
  };
}

// Compact description of a system for UIs and tests
export function describeSystem(sys) {
  const s = sys.star;
  const lines = [`${s.name} (${s.catalog}) — ${s.spectral}, ${s.mass.toFixed(2)} M☉, ${s.luminosity.toFixed(2)} L☉, ${Math.round(s.teff)} K, age ${s.age.toFixed(1)} Gyr, [Fe/H] ${s.metallicity.toFixed(2)}`];
  lines.push(`  HZ ${s.hz.inner.toFixed(2)}–${s.hz.outer.toFixed(2)} AU (optimistic ${s.hz.optimisticInner.toFixed(2)}–${s.hz.optimisticOuter.toFixed(2)}), snow line ${sys.disk.snowLine.toFixed(2)} AU`);
  for (const b of sys.bodies) {
    if (b.kind === 'star') continue;
    const ind = b.kind === 'moon' ? '      ' : '  ';
    const atm = b.atmosphere ? `${b.atmosphere.type} ${b.atmosphere.pressure.toFixed(b.atmosphere.pressure < 0.1 ? 3 : 2)} bar` : 'airless';
    lines.push(`${ind}${b.designation} "${b.name}" ${b.label}: a=${b.kind === 'moon' ? (b.orbit.aReal / 1e3).toFixed(0) + ' km' : b.aAU.toFixed(3) + ' AU'} M=${b.massEarth.toPrecision(3)} M⊕ R=${b.radiusEarth.toFixed(2)} R⊕ g=${(b.gravity / 9.81).toFixed(2)} T=${Math.round(b.Tsurf)}K ${atm}${b.hydrosphere.oceanFraction ? ' ocean=' + b.hydrosphere.oceanFraction.toFixed(2) + '(' + (b.hydrosphere.liquid || b.hydrosphere.water) + ')' : ''}${b.life ? ' LIFE' : ''}${b.rings ? ' rings' : ''}${b.rotation.locked ? ' locked' : ' day=' + (b.rotation.periodGame / 3600).toFixed(1) + 'h'} ESI=${(b.esi || 0).toFixed(2)}`);
  }
  for (const belt of sys.belts) lines.push(`  belt ${belt.innerAU.toFixed(2)}–${belt.outerAU.toFixed(2)} AU`);
  return lines.join('\n');
}
