// Life's chemistry (WORLDSIM.md 16): what solvent a world's life could use, and how it
// could get its energy (Dave: "more than just oxygen-atmosphere carbon-native life").
//
//   solvents      a liquid at the surface (or under ice, or in a temperate cloud deck)
//                 life could work in: water (the best by far: polar, wide liquid range),
//                 ammonia-water and ammonia (cold worlds), methane and ethane (Titan's:
//                 very cold, so very slow), sulfuric acid droplets (a hothouse's clouds,
//                 for life that started in its seas before they boiled)
//   backbones     carbon (most worlds); silicon only where carbon is scarce and the
//                 chemistry lets silicon chains survive: no free oxygen, no liquid water,
//                 and a very cold non-polar solvent (silanes break up in water and air).
//                 Openly speculative: rare by design
//   metabolisms   the redox pairs a world offers, with their energy per electron
//                 (kJ/mol e-, roughly): aerobic respiration with O2 (~120: big active
//                 animals need it), nitrate (~110), perchlorate on dry oxidised ground
//                 (~100), sulfate reduction (~20), methanogenesis (CO2 + H2: ~30), hydrogen
//                 with acetylene on a Titan (~30), iron (~10); light by photosynthesis,
//                 oxygen-making where the light is energetic enough, else the kinds that
//                 split H2S, H2 or iron. The best pair caps how complex life can get: ~100+
//                 for animals, ~40+ for many-celled life, less only microbes
//
// Broad strokes, by Dave's rule: curves and statistics, not chemistry in detail.

export const SOLVENTS = {
  water: { pace: 1, note: 'water: polar, liquid over a wide range' },
  'ammonia-water': { pace: 0.4, note: 'ammonia-water: liquid well below water freezing' },
  ammonia: { pace: 0.25, note: 'liquid ammonia: cold, polar enough' },
  hydrocarbon: { pace: 0.02, note: 'methane and ethane: very cold, non-polar; azotosome-like membranes' },
  acid: { pace: 0.3, note: 'sulfuric acid droplets in a temperate cloud deck' },
};

// which solvents the world offers now. h: { liquids (liquids.js pools), T, P, runaway,
// oceans, air, water0 (formation water), heat (interior), tidal }
export function solventsOf(h) {
  const out = [];
  const liquid = (name) => h.liquids && h.liquids.some((p) => p.name === name && p.phase === 'liquid');
  if (liquid('water')) out.push('water');
  else if (h.oceans > 0.001 && h.T < 271 && h.water0 > 0.01 && (h.heat > 0.3 || h.tidal > 0.2)) out.push('water');   // (under the ice)
  if (liquid('ammonia-water')) out.push('ammonia-water');
  if (liquid('ammonia')) out.push('ammonia');
  if (liquid('methane') || liquid('ethane')) out.push('hydrocarbon');
  if (h.runaway && h.air && (h.air.SO2 || 0) > 1e-7 && h.P > 1) out.push('acid');
  return out;
}

// the redox pairs on offer and the best energy per electron (kJ/mol e-). h: { air (bar),
// P, light (usable photons x Earth), solvent, oceans, redox (mantle dIW) }
export function energyOf(h) {
  const a = h.air || {}, P = Math.max(h.P || 0, 1e-9);
  const pairs = [];
  if ((a.O2 || 0) / P > 1e-3) pairs.push(['aerobic respiration', 120], ['nitrate respiration', 110]);
  if ((a.O2 || 0) / P <= 1e-3 && h.oceans <= 0.001 && h.redox > 2) pairs.push(['perchlorate reduction', 100]);
  if ((a.SO2 || 0) + (a.H2S || 0) > 1e-9) pairs.push(['sulfur cycling', 20]);
  if ((a.H2 || 0) > 1e-6 && (a.CO2 || 0) > 1e-6) pairs.push(['methanogenesis', 30]);
  if (h.solvent === 'hydrocarbon') pairs.push(['hydrogen with acetylene', 30]);
  pairs.push(['iron and chemistry at vents', 10]);
  const best = pairs.reduce((m, p) => Math.max(m, p[1]), 0);
  // the most complex stage that energy allows (evolve.js STAGES: 5 soft-bodied sea life,
  // 6 sea animals, 8 land animals)
  const cap = best >= 100 ? 8 : best >= 40 ? 6 : best >= 25 ? 5 : 4;
  return { pairs, best, cap };
}

// the backbone for life that starts here: carbon, or (rarely) silicon. CO: the birth
// cloud's carbon-to-oxygen ratio; rng for the draw
export function backboneOf(h, CO, rng) {
  const siliconChance = h.solvent === 'hydrocarbon' && CO < 0.35 && !((h.air && h.air.O2) > 0) ? 0.15 : 0;
  return rng.next() < siliconChance ? 'silicon' : 'carbon';
}
