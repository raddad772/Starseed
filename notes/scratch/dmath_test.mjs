import * as d from '/Users/dave/dev/starseed/src/core/dmath.js';
let worst = {};
function chk(name, f, g, xs) {
  let w = 0, wx = 0;
  for (const x of xs) { const a = f(x), b = g(x); const e = Math.abs(a - b) / Math.max(1e-300, Math.abs(b)); if (e > w) { w = e; wx = x; } }
  console.log(name.padEnd(8), 'max rel err', w.toExponential(2), 'at', wx);
}
const R = (a, b, n=200000) => Array.from({length:n}, (_, i) => a + (b-a)*(i+0.5)/n);
chk('exp', d.exp, Math.exp, R(-700, 700));
chk('exp2', d.exp, Math.exp, R(-3, 3));
chk('log', d.log, Math.log, R(1e-10, 1e5).concat(R(0.5,2)));
chk('pow', (x)=>d.pow(x, 2.37), (x)=>Math.pow(x,2.37), R(0.01, 1000));
chk('sin', d.sin, Math.sin, R(-1000, 1000));
chk('cos', d.cos, Math.cos, R(-1000, 1000));
chk('atan', d.atan, Math.atan, R(-50, 50));
chk('asin', d.asin, Math.asin, R(-0.999, 0.999));
chk('acos', d.acos, Math.acos, R(-0.999, 0.999));
console.log(d.atan2(1,-1), Math.atan2(1,-1), d.atan2(-1,-1), Math.atan2(-1,-1));
console.log('log(1e-310)', d.log(1e-310), Math.log(1e-310));
let t=performance.now(); let s=0; for (let i=0;i<2e6;i++) s+=d.exp(i*1e-6); console.log('exp ns', (performance.now()-t)/2e6*1e6, s);
t=performance.now(); s=0; for (let i=0;i<2e6;i++) s+=d.sin(i*1e-3); console.log('sin ns', (performance.now()-t)/2e6*1e6, s);
