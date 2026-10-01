// Tileable 3D noise volume for volumetric clouds (built once, render-only).
// R: Perlin-Worley (billowy base shapes), G/B/A: inverted Worley at 2x/4x/8x
// (erosion detail). Every channel tiles over the cube.

import * as THREE from 'three';

function perlinPeriodic(size, period, seed) {
  // gradient noise with a periodic lattice
  const grads = [];
  let s = seed;
  const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  for (let i = 0; i < period * period * period; i++) {
    const z = rnd() * 2 - 1, a = rnd() * Math.PI * 2, r = Math.sqrt(1 - z * z);
    grads.push([r * Math.cos(a), r * Math.sin(a), z]);
  }
  const g = (x, y, z) => grads[((z % period + period) % period) * period * period + ((y % period + period) % period) * period + ((x % period + period) % period)];
  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  return (x, y, z) => {
    const px = x * period, py = y * period, pz = z * period;
    const xi = Math.floor(px), yi = Math.floor(py), zi = Math.floor(pz);
    const fx = px - xi, fy = py - yi, fz = pz - zi;
    const u = fade(fx), v = fade(fy), w = fade(fz);
    let n = 0;
    for (let c = 0; c < 8; c++) {
      const dx = c & 1, dy = (c >> 1) & 1, dz = (c >> 2) & 1;
      const gr = g(xi + dx, yi + dy, zi + dz);
      const d = gr[0] * (fx - dx) + gr[1] * (fy - dy) + gr[2] * (fz - dz);
      n += d * (dx ? u : 1 - u) * (dy ? v : 1 - v) * (dz ? w : 1 - w);
    }
    return n;
  };
}

function worleyPeriodic(cells, seed) {
  let s = seed;
  const rnd = () => { s = (s * 1103515245 + 12345) >>> 0; return s / 4294967296; };
  const pts = new Float32Array(cells * cells * cells * 3);
  for (let i = 0; i < cells * cells * cells; i++) { pts[i * 3] = rnd(); pts[i * 3 + 1] = rnd(); pts[i * 3 + 2] = rnd(); }
  return (x, y, z) => {
    const px = x * cells, py = y * cells, pz = z * cells;
    const xi = Math.floor(px), yi = Math.floor(py), zi = Math.floor(pz);
    let best = 1e9;
    for (let dz = -1; dz <= 1; dz++) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const cx = xi + dx, cy = yi + dy, cz = zi + dz;
      const wx = ((cx % cells) + cells) % cells, wy = ((cy % cells) + cells) % cells, wz = ((cz % cells) + cells) % cells;
      const k = (wz * cells * cells + wy * cells + wx) * 3;
      const ex = cx + pts[k] - px, ey = cy + pts[k + 1] - py, ez = cz + pts[k + 2] - pz;
      const d = ex * ex + ey * ey + ez * ez;
      if (d < best) best = d;
    }
    return Math.sqrt(best);
  };
}

export function makeCloudNoise(size = 64) {
  const data = new Uint8Array(size * size * size * 4);
  const p1 = perlinPeriodic(size, 4, 11), p2 = perlinPeriodic(size, 8, 12), p3 = perlinPeriodic(size, 16, 13);
  const w1 = worleyPeriodic(4, 21), w2 = worleyPeriodic(8, 22), w3 = worleyPeriodic(16, 23), w4 = worleyPeriodic(32, 24);
  const remap = (v, a, b, c, d) => c + (v - a) / (b - a) * (d - c);
  let i = 0;
  for (let z = 0; z < size; z++) for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const u = x / size, v = y / size, w = z / size;
    const perlin = (p1(u, v, w) + 0.5 * p2(u, v, w) + 0.25 * p3(u, v, w)) / 1.75 * 0.5 + 0.5;
    const wf1 = 1 - Math.min(1, w1(u, v, w) * 1.1);
    const wf2 = 1 - Math.min(1, w2(u, v, w) * 1.1);
    const wf3 = 1 - Math.min(1, w3(u, v, w) * 1.1);
    const wf4 = 1 - Math.min(1, w4(u, v, w) * 1.1);
    const worleyFbm = wf1 * 0.625 + wf2 * 0.25 + wf3 * 0.125;
    const pw = Math.max(0, Math.min(1, remap(perlin, worleyFbm - 1, 1, 0, 1)));
    data[i++] = Math.round(pw * 255);
    data[i++] = Math.round((wf2 * 0.625 + wf3 * 0.25 + wf4 * 0.125) * 255);
    data[i++] = Math.round((wf3 * 0.625 + wf4 * 0.375) * 255);
    data[i++] = Math.round(wf4 * 255);
  }
  const tex = new THREE.Data3DTexture(data, size, size, size);
  tex.format = THREE.RGBAFormat;
  tex.type = THREE.UnsignedByteType;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.wrapS = tex.wrapT = tex.wrapR = THREE.RepeatWrapping;
  tex.unpackAlignment = 1;
  tex.needsUpdate = true;
  return tex;
}
