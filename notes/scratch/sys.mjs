import { generateSystem } from '/Users/dave/dev/starseed/src/gen/system.js';
const sys = generateSystem('FSPB-8DTW');
console.log('startBodyId', sys.startBodyId, 'n', sys.bodies.length);
for (const b of sys.bodies.slice(0, 40)) console.log(b.id, b.kind, b.name, b.label, b.class, 'parent', b.parent, 'R', b.radius ?? b.R ?? b.radiusKm, 'rings', !!b.rings, 'solid', b.solid, 'atm', !!b.atm);
console.log(Object.keys(sys.bodies[1]).join(' '));
