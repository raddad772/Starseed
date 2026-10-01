// Render an equirectangular preview of a generated planet: node tools/planetmap.mjs SEED [bodyId|start] [out.png] [width]
import { generateSystem } from '../src/gen/system.js';
import { TerrainGenerator, S_LEN, S_H } from '../src/gen/terrain.js';
import { writePNG } from './png.mjs';
const seed = process.argv[2] || 'KEPLER-22';
const sys = generateSystem(seed);
const id = process.argv[3] && process.argv[3] !== 'start' ? +process.argv[3] : sys.startBodyId;
const body = sys.bodies[id];
const out = process.argv[4] || 'map.png';
const W = +(process.argv[5] || 720), H = W / 2;
console.log(body.designation, body.name, body.label, 'R(game)=', (body.R/1000).toFixed(0), 'km');
const gen = new TerrainGenerator(body.terrain);
const s = new Float64Array(S_LEN);
const hs = new Float64Array(W * H);
const samples = [];
const t0 = performance.now();
const minW = (Math.PI * body.R) / H * 0.5;
for (let j = 0; j < H; j++) {
  const lat = Math.PI / 2 - (j + 0.5) / H * Math.PI;
  for (let i = 0; i < W; i++) {
    const lon = (i + 0.5) / W * 2 * Math.PI;
    const x = Math.cos(lat) * Math.cos(lon), y = Math.sin(lat), z = Math.cos(lat) * Math.sin(lon);
    gen.sample(x, y, z, minW, s);
    hs[j * W + i] = s[S_H];
    samples.push(Float64Array.from(s));
  }
}
const dt = performance.now() - t0;
const rgb = new Uint8Array(W * H * 3);
const col = [0, 0, 0], mat = new Float64Array(8);
const cell = Math.PI * body.R / H;
let minH = 1e9, maxH = -1e9, ocean = 0;
for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
  const k = j * W + i;
  const lat = Math.PI / 2 - (j + 0.5) / H * Math.PI;
  const h = hs[k];
  minH = Math.min(minH, h); maxH = Math.max(maxH, h);
  const hx = hs[j * W + (i + 1) % W] - hs[j * W + (i - 1 + W) % W];
  const hy = hs[Math.min(H - 1, j + 1) * W + i] - hs[Math.max(0, j - 1) * W + i];
  const dx = 2 * cell * Math.max(Math.cos(lat), 0.05), dy = 2 * cell;
  const gx = hx / dx, gy = hy / dy;
  const nz = 1 / Math.sqrt(1 + gx * gx + gy * gy);
  const slope = 1 - nz;
  gen.shade(samples[k], slope, col, mat);
  if (mat[4] > 0) ocean++;
  // simple hillshade with light from the NW
  const shadeL = mat[4] > 0 ? 1 : Math.max(0.25, Math.min(1.4, (-gx * 0.6 + gy * 0.6 + 1) * nz));
  const glow = mat[5];
  for (let c = 0; c < 3; c++) {
    let v = col[c] * shadeL * 1.15 + glow * [1, 0.3, 0.05][c];
    v = v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
    rgb[k * 3 + c] = Math.max(0, Math.min(255, Math.round(v * 255)));
  }
}
writePNG(out, W, H, rgb);
console.log(`sample ${(dt * 1000 / (W * H)).toFixed(2)} us; h ${minH.toFixed(0)}..${maxH.toFixed(0)} m; ocean frac ${(ocean / (W * H)).toFixed(3)} (target ${body.terrain.ocean.toFixed(2)})`);
