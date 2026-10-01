import { generateSystem } from '/Users/dave/dev/starseed/src/gen/system.js';
import { TerrainGenerator, S_LEN, S_H, S_TEMP, S_MOIST, S_INLAND } from '/Users/dave/dev/starseed/src/gen/terrain.js';
const sys = generateSystem('KEPLER-22'); const b = sys.bodies[sys.startBodyId];
console.log(JSON.stringify(b.terrain.climate), 'life', b.terrain.life, 'veg', b.terrain.palette.veg, 'dry', b.terrain.palette.vegDry);
const g = new TerrainGenerator(b.terrain); const s = new Float64Array(S_LEN); const col=[0,0,0], mat=new Float64Array(8);
let n=0;
for (let i = 0; i < 4000 && n < 15; i++) {
  const z = 1 - (i+0.5)/4000*2, r = Math.sqrt(1-z*z), th = i*2.39996;
  g.sample(Math.cos(th)*r, z, Math.sin(th)*r, 2000, s);
  if (s[S_H] > 0) { n++; g.shade(s, 0.05, col, mat); console.log('lat', (Math.asin(z)*57.3).toFixed(0), 'h', s[S_H].toFixed(0), 'T', (s[S_TEMP]-273.15).toFixed(1), 'W', s[S_MOIST].toFixed(2), 'inland', s[S_INLAND].toFixed(2), 'veg', mat[0].toFixed(2), 'col', col.map(v=>v.toFixed(3)).join(',')); }
}
