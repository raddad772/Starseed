import { generateSystem } from '/Users/dave/dev/starseed/src/gen/system.js';
import { TerrainGenerator } from '/Users/dave/dev/starseed/src/gen/terrain.js';
import { analyzeSettlements } from '/Users/dave/dev/starseed/src/gen/settlements.js';
for (const [seed, id] of [['SOL-0001', 6], ['GAIA-77', 3], ['KEPLER-22', 10]]) {
  const sys = generateSystem(seed); const b = sys.bodies[id];
  const g = new TerrainGenerator(b.terrain);
  const t = performance.now();
  const r = analyzeSettlements(g, { level: 6 });
  console.log(`${seed} ${b.name} (${b.label}): ${(performance.now()-t).toFixed(0)} ms, cells ${r.gridCells} @${r.cellSize} m, land ${r.landFraction.toFixed(2)}, lakes ${r.lakeCells}, rivers ${r.rivers.length}, habitable ${r.habitable}`);
  for (const s of r.sites.slice(0, 5)) console.log(`   #${s.rank} ${s.kind} lat ${s.lat.toFixed(1)} lon ${s.lon.toFixed(1)} score ${s.score} elev ${s.elevation} m T ${s.temperatureC}°C W ${s.moisture} ${s.biome} [${s.reasons.join(', ')}]`);
  const r2 = analyzeSettlements(new TerrainGenerator(b.terrain), { level: 6 });
  console.log('   deterministic:', JSON.stringify(r) === JSON.stringify(r2));
}
