import { generateSystem } from '/Users/dave/dev/starseed/src/gen/system.js';
import { TerrainGenerator } from '/Users/dave/dev/starseed/src/gen/terrain.js';
import { buildChunk, CHUNK_N } from '/Users/dave/dev/starseed/src/gen/chunkbuilder.js';
const sys = generateSystem('KEPLER-22'); const b = sys.bodies[sys.startBodyId];
const g = new TerrainGenerator(b.terrain);
const N = CHUNK_N, V = N + 1;
for (const [level, ix, iy] of [[3, 5, 2], [8, 37, 101], [14, 9000, 3000]]) {
  const t = performance.now();
  const parent = buildChunk(g, 2, level - 1, ix >> 1, iy >> 1, N);
  const t1 = performance.now();
  const child = buildChunk(g, 2, level, ix, iy, N);
  const t2 = performance.now();
  // child vertex (i,j) fully morphed should lie on parent mesh: check even-even exact, odd on edges
  let maxErr = 0;
  const offI = (ix & 1) * N / 2, offJ = (iy & 1) * N / 2;
  const P = (arr, org, k) => [arr[k*3] + org[0], arr[k*3+1] + org[1], arr[k*3+2] + org[2]];
  for (let j = 0; j < V; j++) for (let i = 0; i < V; i++) {
    const m = P(child.morph, child.origin, j * V + i);
    const I = offI + i / 2, J = offJ + j / 2;
    let target;
    const pa = (a, c) => P(parent.position, parent.origin, c * V + a);
    if (Number.isInteger(I) && Number.isInteger(J)) target = pa(I, J);
    else if (!Number.isInteger(I) && Number.isInteger(J)) { const A = pa(Math.floor(I), J), B = pa(Math.ceil(I), J); target = A.map((x, k) => (x + B[k]) / 2); }
    else if (Number.isInteger(I)) { const A = pa(I, Math.floor(J)), B = pa(I, Math.ceil(J)); target = A.map((x, k) => (x + B[k]) / 2); }
    else { const A = pa(Math.floor(I), Math.floor(J)), B = pa(Math.ceil(I), Math.ceil(J)); target = A.map((x, k) => (x + B[k]) / 2); }
    maxErr = Math.max(maxErr, Math.hypot(m[0]-target[0], m[1]-target[1], m[2]-target[2]));
  }
  console.log(`level ${level}: parent ${(t1-t).toFixed(1)} ms child ${(t2-t1).toFixed(1)} ms; morph-vs-parent max err ${maxErr.toExponential(2)} m; h ${child.minH.toFixed(1)}..${child.maxH.toFixed(1)}; bsphere r ${child.bsphere[3].toFixed(1)}`);
}
