// A sea's tides and its reach up its shores.

// the open ocean's tide (m): each moon and the star, by the equilibrium tide (M/Mp)
// Rp^4/d^3 (Earth: Moon 0.36 m, Sun 0.16 m); a world locked to its host feels no tide from it
export function tideOf(body, sys) {
  let a = 0;
  // (powers as products: ** and Math.pow are an engine's own approximation)
  const Rp = body.radiusM, Mp = body.massEarth, Rp4 = (Rp * Rp) * (Rp * Rp);
  for (const id of body.moons || []) { const m = sys.bodies[id]; const d = m.orbit && m.orbit.aReal || 0; if (d > 0) a += (m.massEarth / Mp) * Rp4 / (d * d * d); }
  if (body.kind === 'moon' && !body.rotation.locked) { const hst = sys.bodies[body.parentId]; const d = body.orbit && body.orbit.aReal || 0; if (d > 0) a += (hst.massEarth / Mp) * Rp4 / (d * d * d); }
  if (!(body.rotation.locked && body.kind !== 'moon')) { const d = body.aAU * 1.496e11; a += (sys.bodies[0].mass * 332946 / Mp) * Rp4 / (d * d * d); }
  return Math.min(a, 30);
}

// how far up a beach the sea reaches over its still water (m): its high tide (the open ocean's range, the
// shelf doubling it) and a storm's run-up (Stockdon et al. 2006 for a gale's fully developed sea on a beach of
// 0.08: the weaker the world's pull, the taller and longer its waves). Earth's ~4 m: the beach bare below it,
// its plants and trees above (gen/terrain.js shade, gen/flora.js)
export function seaReachOf(body, sys) {
  const g = body.gravity || 9.81, U = 15, H = 0.21 * U * U / g, T = Math.min(16, Math.max(3, 10 * U / g)), L = g * T * T / (2 * Math.PI), b = 0.08;
  const R2 = 1.1 * (0.35 * b * Math.sqrt(H * L) + 0.5 * Math.sqrt(H * L * (0.563 * b * b + 0.004)));
  let amp = 0.5;
  try { amp = tideOf(body, sys); } catch { /* (a system without what the tide needs: a usual one) */ }
  return Math.min(12, 2 * amp + R2);
}
