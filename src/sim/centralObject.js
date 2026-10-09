// The galaxy's central black hole as the sky shows it from the system you're in
// (render/webgpu/central.js): its mass, its spin axis (the jets'), its disk and jets, and how far it
// is. Provisional numbers: CAMPAIGN.md has mass, spin, feeding, spectrum and the distances chosen
// together after this prototype. It lies the way the sky's galactic centre lies (the bulge's glow
// toward it), at the distance the galaxy chart gives the system you're in (campaign/galaxy.js),
// else 3 pc. Lengths go out to the renderer in M = GM/c^2.
import * as THREE from 'three';
import { resolveSystem, CENTRAL_OBJECT } from '../campaign/galaxy.js';

export const CENTRAL = {
  massSun: 6e10,            // a fictional sixty billion suns
  distancePc: 3,            // from here when the chart doesn't say: as near as a star keeps planets out to ~35 AU (its Hill sphere ~110 AU)
  inclinationDeg: 83,       // the spin axis from the line of sight: near edge-on, the disk's far side lensed into a halo over and under the hole
  spin: 0.94,               // a = J c / G M^2 (0: Schwarzschild's; 0.998 about the most gas can spin one up to)
  // a starving hole's thin disk, its hottest a cool star's 4000 K: ~1e11 suns in all, a quarter of
  // Earth's sunlight at 3 pc (at 26000 K it'd be ~1e14 suns, hundreds of times Earth's, at 3 pc).
  // Its gas sparse: opaque only where it's hot, within ~20 M, and clear by ~60 M, where it's too
  // cool to glow anyway; past 200 M (where a disk round so big a hole breaks up into stars) none
  disk: { outer: 200, brightness: 4, temperature: 4000, opaqueTo: 20, tau: 6 },   // outer edge in M (the inner's the spin's innermost stable orbit); temperature at its hottest (K); optical depth straight through within opaqueTo (M), falling as r^-4 beyond
  // jets: synchrotron light, spectral index 0.6, cut off near the ultraviolet (3x green's frequency
  // in the jet's frame) at the base, the cutoff falling along it as its electrons cool (halved by 150 pc)
  jet: { lengthPc: 3000, angleDeg: 1.6, brightness: 0.6, gamma: 6, knots: 2.4, cutoff: 3, index: 0.6, coolingPc: 150 },
};

const G = 6.674e-11, C = 2.998e8, MSUN = 1.989e30, PC = 3.0857e16;
// (for looking at it from elsewhere while tuning: ?bhPc=distance in parsecs)
const Q = typeof location !== 'undefined' ? new URLSearchParams(location.search) : null;
if (Q && Q.has('bhPc')) CENTRAL.distancePc = +Q.get('bhPc');

// the innermost stable prograde circular orbit round a hole of spin a (M; Bardeen, Press & Teukolsky 1972)
export function iscoRadius(a) {
  const z1 = 1 + Math.cbrt(1 - a * a) * (Math.cbrt(1 + a) + Math.cbrt(1 - a));
  const z2 = Math.sqrt(3 * a * a + z1 * z1);
  return 3 + z2 - Math.sqrt((3 - z1) * (3 + z1 + 2 * z2));
}

// the system's distance from the centre on the galaxy chart (pc), or null outside a campaign
function chartDistancePc(game) {
  const c = game.campaign;
  try {
    if (!c || !c.galaxy) return null;
    const s = resolveSystem(c, c.galaxy.currentSystemId), o = CENTRAL_OBJECT.position;
    return s && s.position ? Math.hypot(s.position[0] - o[0], s.position[1] - o[1], s.position[2] - o[2]) : null;
  } catch { return null; }
}

// for the renderer (engine.central), or null with no sky yet
export function centralView(game, out = {}) {
  const sky = game.sky;
  if (!sky || !sky.galCenter) return null;
  const M = G * CENTRAL.massSun * MSUN / (C * C);
  const dPc = (Q && Q.has('bhPc') ? null : chartDistancePc(game)) ?? CENTRAL.distancePc;
  const dir = out.dir || (out.dir = new THREE.Vector3());
  dir.copy(sky.galCenter).normalize();
  // (the spin axis tipped from the line of sight toward the galaxy's north)
  const q = sky.galNormal.clone().addScaledVector(dir, -sky.galNormal.dot(dir));
  if (q.lengthSq() < 1e-8) q.set(0, 1, 0).addScaledVector(dir, -dir.y);
  q.normalize();
  const inc = CENTRAL.inclinationDeg * Math.PI / 180;
  out.spin = (out.spin || new THREE.Vector3()).copy(dir).multiplyScalar(-Math.cos(inc)).addScaledVector(q, Math.sin(inc)).normalize();
  out.distance = dPc * PC / M;
  out.distancePc = dPc;
  out.massM = M;
  out.reach = Math.max(CENTRAL.disk.outer * 1.25, 40);
  out.spinA = CENTRAL.spin;
  out.isco = iscoRadius(CENTRAL.spin);
  out.disk = CENTRAL.disk;
  const J = CENTRAL.jet;
  out.jet = { length: J.lengthPc * PC / M, angle: J.angleDeg * Math.PI / 180, brightness: J.brightness, gamma: J.gamma, knots: J.knots, cutoff: J.cutoff, index: J.index, cooling: J.coolingPc * PC / M };
  return out;
}
