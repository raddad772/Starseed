import { generateSystem, describeSystem } from '/Users/dave/dev/starseed/src/gen/system.js';
const seeds = process.argv.slice(2).length ? process.argv.slice(2) : ['SOL-0001', 'KEPLER-22', 'ABCD-EFGH', 'XQ7P-4KDM', 'HELLO', 'GAIA-77'];
for (const s of seeds) {
  const t = performance.now();
  const sys = generateSystem(s);
  const dt = performance.now() - t;
  console.log(`=== ${s} (${dt.toFixed(1)} ms) start=${sys.bodies[sys.startBodyId].name}`);
  console.log(describeSystem(sys));
}
const a = JSON.stringify(generateSystem('DET-TEST')), b = JSON.stringify(generateSystem('DET-TEST'));
console.log('deterministic:', a === b, a.length);
