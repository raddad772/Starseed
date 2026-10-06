// A world's biosphere, world level (LIFE.md 1): what its life is made of, from its history (evolve.js:
// the life stages and plant grades, the record every ~5 Myr, the extinctions), replayed on a clock of
// its own for what the history doesn't track:
//   body plans    two to four drawn when animals first fill its seas (its Cambrian): symmetry,
//                 segments, skeleton, limbs, eyes; every animal after is a variation of one. Which
//                 of them takes the land, by how its skeleton and its limbs bear its world's gravity
//   trophic       the levels over the plants, on land and in the sea: grazers, predators, predators
//   levels        of predators, and over those where life is rich enough. Each a chance per Myr
//                 (LIFE.md: "history, not noise") in the room its stage has, with warmth and the
//                 energy to feed it (each level a tenth of the one below: Lindeman), lost from the
//                 top in the extinctions
//   flight        small flyers, then big ones, where the air is thick enough for the gravity
//   eras          the land's ruling lineage turns over after each great extinction: a survivor's
//                 line radiates into the emptied world (upright, warm-blooded, limbs fused...)
//   seeing        the light its eyes evolved to, on land and in the sea (spectrum.js)
// World state: from the world's seed and history alone (Rng, dmath).
import * as dm from '../../core/dmath.js';
import { makeName } from '../names.js';
import { lightBands, visualWindow, receptorPeaks } from './spectrum.js';

// (Gyr on the clock at an Earth's pace: Earth's grazers on land within ~5-10 Myr of the first land
// animals, predators soon after, big predators of predators over tens of Myr)
const LAND_DIFF = [0, 0.005, 0.015, 0.04, 0.1], SEA_DIFF = [0, 0.004, 0.012, 0.03, 0.08];
const LEVEL_NAMES = ['plants', 'grazers', 'predators', 'predators of predators', 'apex hunters'];

// a body plan, drawn at the seas' first animals: alien by design, but each part a whole design
function drawPlan(rng, id) {
  const symmetry = rng.pick([2, 2, 2, 2, 3, 3, 4, 5, 5, 6]);
  const skeleton = rng.pick(['shell', 'shell', 'bone', 'bone', 'bone', 'fluid']);   // exo, endo, hydrostatic
  const segmented = rng.chance(skeleton === 'shell' ? 0.8 : 0.45);
  // (limbs: pairs down a two-sided body, or a limb or two on each arm of a radial one)
  const limbs = symmetry === 2 ? 2 * rng.int(segmented ? 2 : 2, segmented ? 5 : 3) : symmetry * rng.int(1, 2);
  const eyes = symmetry === 2 ? rng.pick([2, 2, 2, 4, 6]) : symmetry * rng.int(1, 2);
  const receptors = rng.int(2, 4);
  const covering = skeleton === 'shell' ? 'plated' : skeleton === 'fluid' ? 'soft-skinned' : rng.pick(['scaled', 'leathery', 'scaled']);
  return { id, name: makeName(rng, 2, 3), symmetry, skeleton, segmented, limbs, eyes, receptors, covering };
}
// how well a plan bears its weight out of the water (gravity g, m/s2): bone best, a shell fine when
// light (it grows heavy as an animal grows, and moulting's soft), a fluid skeleton poorly; legs to carry it
function landFitness(p, g) {
  const sk = p.skeleton === 'bone' ? 1 : p.skeleton === 'shell' ? dm.clamp(1.3 - 0.06 * g, 0.2, 1.2) : 0.25;
  return sk * dm.clamp(p.limbs / 4, 0.5, 1.5);
}
const describe = (p) => `${p.symmetry === 2 ? 'two-sided' : `${p.symmetry}-way symmetric`}, ${p.segmented ? 'segmented, ' : ''}${p.skeleton === 'shell' ? 'shelled' : p.skeleton === 'bone' ? 'boned' : 'soft-bodied'}, ${p.limbs} limbs, ${p.eyes} eyes`;

// body: the world's data (gravity, atmosphere: pressure, mu); h: its history (evolve.js); rng: its fork;
// star: { teff }; aer: its air's render (aerosols) or null; rel: its air's scattering against N2's
export function biosphereOf(body, h, rng, star, aer = null, rel = 1) {
  const out = { plans: [], land: null, sea: null, flight: { small: null, large: null }, seeing: null };
  if (!h || !h.life || h.life.animals == null) return out;
  const age = h.age, S = h.series, g = body.gravity || 9.81, ago = (t) => (t == null ? null : age - t);
  // the founding plans
  const pr = rng.fork('plans'), nPlans = pr.int(2, 4);
  for (let i = 0; i < nPlans; i++) out.plans.push(drawPlan(pr, i));
  // which take the land (when animals did): the fittest under its gravity, a second now and then
  // (land animals now, or once: the record reaches them)
  const tLand = h.life.landAnimals;
  let landPlan = null;
  if (tLand != null || S.stage.some((st) => st >= 8)) {
    const scored = out.plans.map((p) => ({ p, s: landFitness(p, g) * pr.range(0.7, 1.3) })).sort((a, b) => b.s - a.s);
    landPlan = scored[0].p; landPlan.onLand = true;
    if (scored.length > 1 && pr.chance(0.3)) scored[1].p.onLand = true;
  }
  // flight: the air thick enough to bear wings for its gravity (Earth 1)
  const rho = (h.P || 0) * ((body.atmosphere && body.atmosphere.mu) || 29) / 29 * 288 / Math.max(h.T || 288, 50);
  const flightK = dm.smoothstep(0.02, 0.3, rho / (g / 9.81));
  // the replay, every record step from the seas' first animals
  const cr = rng.fork('clock'), land = [null, null, null, null, null], sea = [null, null, null, null, null];
  const ext = (h.extinctions || []).slice().sort((a, b) => a.t - b.t);
  let ei = 0, clade = null;
  const eras = [];
  const newClade = (from, t, after) => {
    const c = from ? { ...from } : { plan: landPlan.id, posture: 'sprawling', blood: 'cold', limbs: landPlan.limbs, size: 'small' };
    if (from) {
      if (c.posture === 'sprawling' && cr.chance(0.6)) c.posture = 'upright';
      if (c.blood === 'cold' && cr.chance(0.45)) c.blood = 'warm';
      if (c.limbs > 4 && cr.chance(0.25)) c.limbs -= 2;
      c.size = cr.pick(['small', 'mid', 'mid', 'large', 'large', 'huge']);
    }
    c.name = makeName(cr, 2, 3);
    eras.push({ t, after, clade: c });
    return c;
  };
  for (let i = 1; i < S.t.length; i++) {
    const t = S.t[i], dt = t - S.t[i - 1];
    if (t < h.life.animals) continue;
    const stage = S.stage[i], T = S.T[i], E = S.div[i] * S.light[i];
    const warmth = dm.smoothstep(250, 280, T) * (1 - dm.smoothstep(315, 326, T));
    // (the extinctions in this step: each takes levels from the top, likelier the higher they stand)
    while (ei < ext.length && ext[ei].t <= t) {
      const x = ext[ei++];
      for (const lv of [land, sea]) for (let k = 4; k >= 1; k--) if (lv[k] != null && cr.next() < x.loss * (0.35 + 0.15 * k)) lv[k] = null;
      if (x.loss > 0.6 && cr.chance(x.loss)) out.flight.large = null;
      if (clade && x.loss >= 0.3 && stage >= 8) clade = newClade(clade, x.t, x.text);
    }
    // (land life gone: its levels and its flyers with it; the sea's animals gone, theirs)
    if (stage < 8) { land.fill(null); out.flight.small = out.flight.large = null; clade = null; }
    if (stage < 6) sea.fill(null);
    if (stage >= 8 && !clade && landPlan) clade = newClade(null, t, null);
    // (each level a chance per step: its stage's room, warmth, and energy for a tenth of the one below)
    const leap = (lv, k, diff, room) => {
      if (lv[k] != null || (k > 1 && lv[k - 1] == null)) return;
      const feed = dm.clamp(E / dm.pow(10, k - 4), 0, 1);
      const hz = room * warmth * feed * dt / diff[k];
      if (hz > 0 && cr.next() < 1 - dm.exp(-hz)) lv[k] = t;
    };
    if (stage >= 6) for (let k = 1; k <= 4; k++) leap(sea, k, SEA_DIFF, S.seaRoom ? S.seaRoom[i] : 1);
    if (stage >= 8) for (let k = 1; k <= 4; k++) leap(land, k, LAND_DIFF, S.landRoom ? S.landRoom[i] : 1);
    // (flight: small flyers off the land's grazers, big ones after them)
    if (stage >= 8 && land[1] != null) {
      if (out.flight.small == null && cr.next() < 1 - dm.exp(-flightK * warmth * dt / 0.03)) out.flight.small = t;
      if (out.flight.small != null && out.flight.large == null && cr.next() < 1 - dm.exp(-flightK * warmth * dt / 0.1)) out.flight.large = t;
    }
  }
  out.sea = { levels: sea.map(ago), top: LEVEL_NAMES[topOf(sea)] };
  if (tLand != null && h.lifeStage >= 8) out.land = { since: ago(tLand), plan: landPlan.id, levels: land.map(ago), top: LEVEL_NAMES[topOf(land)], clade, eras: eras.map((e) => ({ ago: ago(e.t), after: e.after, clade: e.clade })) };
  out.flight = { small: ago(out.flight.small), large: ago(out.flight.large) };
  for (const p of out.plans) p.text = describe(p);
  // the light its animals see by: at the ground, and five metres down in its seas
  if (star && body.atmosphere) {
    const a = body.atmosphere, air = h.air;
    const onLand = visualWindow(lightBands(star.teff, air, a.pressure, g, rel, aer));
    const inSea = visualWindow(lightBands(star.teff, air, a.pressure, g, rel, aer, 5));
    out.seeing = { land: onLand, sea: inSea, plans: out.plans.map((p) => ({ id: p.id, peaks: receptorPeaks(p.onLand ? onLand : inSea, p.receptors) })) };
  }
  return out;
}
const topOf = (lv) => { let k = 0; for (let i = 1; i <= 4; i++) if (lv[i] != null) k = i; return k; };
