import { propagate, orbitInfo, makeOrbit, orbitState } from '/Users/dave/dev/starseed/src/core/kepler.js';
const mu = 3.98e12;
function energy(r, v) { return (v[0]**2+v[1]**2+v[2]**2)/2 - mu/Math.hypot(...r); }
function test(r0, v0, dt) {
  const r = [0,0,0], v = [0,0,0];
  propagate(r0, v0, dt, mu, r, v);
  const rb = [0,0,0], vb = [0,0,0];
  propagate(r, v, -dt, mu, rb, vb);
  const errBack = Math.hypot(rb[0]-r0[0], rb[1]-r0[1], rb[2]-r0[2]);
  const dE = Math.abs(energy(r, v) - energy(r0, v0)) / Math.abs(energy(r0, v0));
  // compare with fine RK4 integration
  let R = r0.slice(), V = v0.slice(); const n = 200000; const h = dt / n;
  const acc = (p) => { const d = Math.hypot(...p); const k = -mu / (d*d*d); return [p[0]*k, p[1]*k, p[2]*k]; };
  for (let i = 0; i < n; i++) {
    const a1 = acc(R); const k1v = a1, k1r = V;
    const R2 = R.map((x,j)=>x + k1r[j]*h/2), V2 = V.map((x,j)=>x + k1v[j]*h/2); const k2v = acc(R2), k2r = V2;
    const R3 = R.map((x,j)=>x + k2r[j]*h/2), V3 = V.map((x,j)=>x + k2v[j]*h/2); const k3v = acc(R3), k3r = V3;
    const R4 = R.map((x,j)=>x + k3r[j]*h), V4 = V.map((x,j)=>x + k3v[j]*h); const k4v = acc(R4), k4r = V4;
    R = R.map((x,j)=> x + h/6*(k1r[j]+2*k2r[j]+2*k3r[j]+k4r[j])); V = V.map((x,j)=> x + h/6*(k1v[j]+2*k2v[j]+2*k3v[j]+k4v[j]));
  }
  const errRK = Math.hypot(R[0]-r[0], R[1]-r[1], R[2]-r[2]);
  const info = orbitInfo(r0, v0, mu);
  console.log(`e=${info.e.toFixed(4)} dt=${dt} |r|=${Math.hypot(...r).toExponential(3)} back=${errBack.toExponential(2)} dE=${dE.toExponential(2)} vsRK4=${errRK.toExponential(2)}`);
}
const R0 = 7.37e5; const vc = Math.sqrt(mu / R0);
test([R0,0,0],[0,0,vc], 1000);
test([R0,0,0],[0,vc*0.3,vc*1.1], 5000);
test([R0,0,0],[0,0,vc*1.6], 3000);   // hyperbolic
test([R0,0,0],[vc*0.2,0,vc*1.4142], 4000); // ~parabolic
test([R0,0,0],[vc*1.5, 0, 0], 2000); // radial hyperbolic
test([R0,0,0],[vc*0.5, 0, 0.0001], 300); // near radial elliptic
// long time
const r=[0,0,0], v=[0,0,0]; propagate([R0,0,0],[0,0,vc], 1e9, mu, r, v); console.log('long', Math.hypot(...r) / R0);
const o = makeOrbit({a: 1.5e10, e: 0.1, i: 0.05, Om: 1, w: 2, M0: 0.3}, 1.3e18);
const p=[0,0,0], vv=[0,0,0]; orbitState(o, 1e6, p, vv); const inf = orbitInfo(p, vv, 1.3e18); console.log('orbit a', inf.a/1.5e10, 'e', inf.e);
let t0 = performance.now(); for (let i = 0; i < 100000; i++) propagate([R0,0,0],[0,vc*0.3,vc*1.1], i, mu, r, v); console.log('propagate us', (performance.now()-t0)/100000*1000);
