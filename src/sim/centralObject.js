// The galaxy's central black hole as the sky shows it from the system you're in
// (render/webgpu/central.js): its mass, its spin axis (the jets'), its disk and jets, and how far it
// is. Provisional numbers: CAMPAIGN.md has mass, spin, feeding, spectrum and the distances chosen
// together after this prototype. It sits at the galaxy chart's centre (campaign/galaxy.js), seen from
// the system you're in along the chart's true line to it, its spin axis fixed in the chart's frame:
// every system sees the same hole from its own side. Outside a campaign, from the survey system's
// place (3 pc out). Lengths go out to the renderer in M = GM/c^2.
import * as THREE from 'three';
import { resolveSystem, chart, CENTRAL_OBJECT } from '../campaign/galaxy.js';

export const CENTRAL = {
  massSun: 6e10,            // a fictional sixty billion suns
  distancePc: 3,            // from here outside a campaign (the survey system's distance): as near as a star keeps planets out to ~35 AU (its Hill sphere ~110 AU)
  // its spin axis (the jets') in the chart's frame (x, z the galaxy's plane, y its north): 83 degrees
  // from the survey system's line of sight (the hole's +x), so there it's seen near edge-on, the
  // disk's far side lensed into a halo over and under it; leaning 20 degrees from north toward +z
  axis: { fromSurveyDeg: 83, leanDeg: 20 },
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

// the spin axis in the chart's frame (unit)
export function spinAxisChart() {
  const t = CENTRAL.axis.fromSurveyDeg * Math.PI / 180, l = CENTRAL.axis.leanDeg * Math.PI / 180;
  return [Math.cos(t), Math.sin(t) * Math.cos(l), Math.sin(t) * Math.sin(l)];
}

// where the system you're in sits on the galaxy chart, from the hole (pc): the campaign's current
// system, or outside a campaign the survey system's place. When that changes (or the sky's new), the
// sky's placed to match: the centre's glow round the true way to it, and the charted systems round
// it drawn where they lie (render/sky.js placeInGalaxy)
function placeSky(game, out) {
  const c = game.campaign, O = CENTRAL_OBJECT.position, rel = q => q.map((n, i) => n - O[i]);
  let id = null;
  try { if (c && c.generation) id = c.galaxy?.currentSystemId || `system/${c.generation.galaxySeed}`; } catch { id = null; }
  if (out.placedFor === (id || '') && out.placedSky === game.sky) return out.chartPos;
  let p = null, stars = [];
  if (id) {
    try {
      const here = resolveSystem(c, id);
      p = rel(here.position);
      const [x, z] = here.address.split(':').map(Number);
      stars = chart(c, [x, z]).filter(e => e.id !== here.id).map(e => ({ position: rel(e.position), luminosity: e.summary.luminosity, teff: e.summary.teff }));
    } catch { p = null; stars = []; }
  }
  p ||= [CENTRAL.distancePc, 0, 0];
  game.sky.placeInGalaxy(p, stars);
  out.placedFor = id || ''; out.placedSky = game.sky; out.chartPos = p;
  return p;
}

// for the renderer (engine.central), or null with no sky yet
export function centralView(game, out = {}) {
  const sky = game.sky;
  if (!sky || !sky.galCenter) return null;
  const M = G * CENTRAL.massSun * MSUN / (C * C);
  let p = placeSky(game, out);
  let dPc = Math.hypot(...p);
  if (Q && Q.has('bhPc')) { p = p.map(n => n * CENTRAL.distancePc / dPc); dPc = CENTRAL.distancePc; }
  out.dir = sky.chartToWorld(p, [-p[0] / dPc, -p[1] / dPc, -p[2] / dPc], out.dir || new THREE.Vector3()).normalize();
  out.spin = sky.chartToWorld(p, spinAxisChart(), out.spin || new THREE.Vector3()).normalize();
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
