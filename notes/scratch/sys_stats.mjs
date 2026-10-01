import { generateSystem } from '/Users/dave/dev/starseed/src/gen/system.js';
const N = 2000; const st = { planets: 0, moons: 0, giants: 0, sysGiant: 0, sysLife: 0, sysTemperate: 0, hotJ: 0, startLabels: {}, labels: {}, spectral: {}, maxT: 0 };
let t = performance.now();
for (let i = 0; i < N; i++) {
  const sys = generateSystem('STAT-' + i);
  const pl = sys.bodies.filter(b => b.kind === 'planet'), mo = sys.bodies.filter(b => b.kind === 'moon');
  st.planets += pl.length; st.moons += mo.length;
  const g = pl.filter(b => b.class === 'gasGiant'); st.giants += g.length; if (g.length) st.sysGiant++;
  if (g.some(b => b.aAU < 0.1)) st.hotJ++;
  if (sys.bodies.some(b => b.life)) st.sysLife++;
  if (sys.bodies.some(b => b.hydrosphere && b.hydrosphere.water === 'liquid')) st.sysTemperate++;
  const sb = sys.bodies[sys.startBodyId]; st.startLabels[sb.label] = (st.startLabels[sb.label] || 0) + 1;
  for (const b of sys.bodies) if (b.kind !== 'star') st.labels[b.label] = (st.labels[b.label] || 0) + 1;
  const sc = sys.star.spectral[0]; st.spectral[sc] = (st.spectral[sc] || 0) + 1;
}
console.log('ms/system', ((performance.now() - t) / N).toFixed(2));
console.log('planets/sys', (st.planets / N).toFixed(2), 'moons/sys', (st.moons / N).toFixed(2), 'giants/sys', (st.giants/N).toFixed(2));
console.log('P(giant)', (st.sysGiant / N).toFixed(2), 'P(hotJ)', (st.hotJ/N).toFixed(3), 'P(liquid water world)', (st.sysTemperate / N).toFixed(2), 'P(life)', (st.sysLife / N).toFixed(2));
console.log('spectral', st.spectral);
console.log('start worlds', Object.entries(st.startLabels).sort((a,b)=>b[1]-a[1]).slice(0,12));
console.log('labels', Object.entries(st.labels).sort((a,b)=>b[1]-a[1]));
