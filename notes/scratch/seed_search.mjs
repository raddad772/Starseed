import { generateSystem } from '/Users/dave/dev/starseed/src/gen/system.js';
const ALPH = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const res = [];
for (let i = 0; i < 6000; i++) {
  let s = ''; let x = i * 2654435761 >>> 0;
  for (let k = 0; k < 8; k++) { if (k === 4) s += '-'; s += ALPH[x % 32]; x = Math.imul(x ^ (x >>> 15), 2246822507) >>> 0; }
  const sys = generateSystem(s);
  const b = sys.bodies[sys.startBodyId];
  if (!b.life || b.life.level !== 'complex biosphere') continue;
  const of = b.hydrosphere.oceanFraction;
  if (of < 0.3 || of > 0.75) continue;
  const v = b.terrain.palette.veg; if (!v) continue;
  // greenness: g dominant
  const green = v[1] / (v[0] + v[1] + v[2] + 1e-6);
  const teff = sys.star.teff;
  const ringed = sys.bodies.some(x => x.rings && x.class === 'gasGiant' && x.rings.opacity > 0.4);
  const moons = b.moons.length;
  const score = green * 2 + (ringed ? 1 : 0) + (teff > 5300 && teff < 6200 ? 0.7 : 0) + Math.min(moons, 2) * 0.4 + (b.Tsurf > 280 && b.Tsurf < 300 ? 0.5 : 0) + (sys.bodies.filter(x=>x.class==='gasGiant').length ? 0.3 : 0);
  res.push({ s, score, green: green.toFixed(2), of: of.toFixed(2), T: Math.round(b.Tsurf), teff: Math.round(teff), ringed, moons, g: (b.gravity/9.81).toFixed(2), day: (b.rotation.periodGame/3600).toFixed(1), label: b.label });
}
res.sort((a, b) => b.score - a.score);
console.log(res.length, 'candidates');
for (const r of res.slice(0, 15)) console.log(JSON.stringify(r));
