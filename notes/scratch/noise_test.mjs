import { Noise3 } from '/Users/dave/dev/starseed/src/core/noise.js';
import { Rng } from '/Users/dave/dev/starseed/src/core/rng.js';
const n = new Noise3(12345);
const r = Rng.fromString('test');
let maxErr = 0, mn = 1e9, mx = -1e9; const o = [0,0,0,0];
for (let i = 0; i < 100000; i++) {
  const x = r.range(-300, 300), y = r.range(-300, 300), z = r.range(-300, 300);
  const v = n.noised(x, y, z, o);
  const v2 = n.noise(x, y, z);
  if (Math.abs(v - v2) > 1e-12) { console.log('mismatch', v, v2); break; }
  mn = Math.min(mn, v); mx = Math.max(mx, v);
  const h = 1e-6;
  const dx = (n.noise(x+h,y,z) - n.noise(x-h,y,z)) / (2*h);
  const dy = (n.noise(x,y+h,z) - n.noise(x,y-h,z)) / (2*h);
  const dz = (n.noise(x,y,z+h) - n.noise(x,y,z-h)) / (2*h);
  maxErr = Math.max(maxErr, Math.abs(dx - o[1]), Math.abs(dy - o[2]), Math.abs(dz - o[3]));
}
console.log('range', mn.toFixed(3), mx.toFixed(3), 'deriv max err', maxErr.toExponential(2));
let t = performance.now(), s = 0;
for (let i = 0; i < 2e6; i++) s += n.noise(i * 0.013, i * 0.007, i * 0.019);
console.log('noise ns', ((performance.now() - t) / 2e6 * 1e6).toFixed(1));
t = performance.now();
for (let i = 0; i < 2e6; i++) s += n.noised(i * 0.013, i * 0.007, i * 0.019, o);
console.log('noised ns', ((performance.now() - t) / 2e6 * 1e6).toFixed(1));
const a = new Rng([1,2,3,4]); const b = a.fork('x'); const c = a.fork('x'); console.log(b.next() === c.next(), a.fork('y').next());
console.log(Rng.fromString('ABCD-1234').next(), Rng.fromString('ABCD-1234').normal());
