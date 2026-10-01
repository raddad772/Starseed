import { generateSystem } from '/Users/dave/dev/starseed/src/gen/system.js';
import { TerrainGenerator, S_LEN } from '/Users/dave/dev/starseed/src/gen/terrain.js';
import { buildChunk } from '/Users/dave/dev/starseed/src/gen/chunkbuilder.js';
const sys = generateSystem('KEPLER-22'); const b = sys.bodies[sys.startBodyId];
const g = new TerrainGenerator(b.terrain);
for (let rep = 0; rep < 3; rep++) {
  let t = performance.now(); for (let i = 0; i < 5; i++) buildChunk(g, 2, 12, 1000 + i, 2000, 48); console.log('chunk ms', ((performance.now() - t) / 5).toFixed(1));
}
// profile sample() components
const s = new Float64Array(S_LEN);
let t = performance.now(); for (let i = 0; i < 20000; i++) g.sample(0.3 + i * 1e-6, 0.8, 0.5, 1.3, s); console.log('sample us', ((performance.now() - t) / 20000 * 1000).toFixed(2));
t = performance.now(); for (let i = 0; i < 20000; i++) g.continentalness(0.3 + i * 1e-6, 0.8, 0.5, s); console.log('continentalness us', ((performance.now() - t) / 20000 * 1000).toFixed(2));
console.log('plates', g.plates.length, 'volcanoes', g.volcanoes.length, 'craters', b.terrain.craters);
