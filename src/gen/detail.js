// The terrain's tileable detail noise (render/terrainMaterial.js's detail texture): value-noise fBm
// on a periodic lattice, r and a two fields, g and b r's slopes. Here too so the CPU can read what
// the GPU draws from it: where the sea's ice edge is ragged (gen/liquidice.js) is where it's solid.

export function detailData(size = 256) {
  const data = new Uint8Array(size * size * 4);
  const h1 = new Float32Array(size * size);
  const h2 = new Float32Array(size * size);
  let seed = 1337;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const lattice = (period) => { const a = new Float32Array(period * period); for (let i = 0; i < a.length; i++) a[i] = rnd(); return a; };
  const sampleL = (lat, period, x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
    const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
    const g = (i, j) => lat[((j % period + period) % period) * period + ((i % period + period) % period)];
    return (g(xi, yi) * (1 - ux) + g(xi + 1, yi) * ux) * (1 - uy) + (g(xi, yi + 1) * (1 - ux) + g(xi + 1, yi + 1) * ux) * uy;
  };
  const fill = (out, base) => {
    const lats = [];
    for (let o = 0; o < 5; o++) lats.push(lattice(base << o));
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      let s = 0, a = 0.5, n = 0;
      for (let o = 0; o < 5; o++) {
        const p = base << o;
        s += a * sampleL(lats[o], p, x / size * p, y / size * p);
        n += a; a *= 0.5;
      }
      out[y * size + x] = s / n;
    }
  };
  fill(h1, 8);
  fill(h2, 16);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const i = y * size + x;
    const dx = h1[y * size + (x + 1) % size] - h1[y * size + (x - 1 + size) % size];
    const dy = h1[((y + 1) % size) * size + x] - h1[((y - 1 + size) % size) * size + x];
    data[i * 4] = Math.round(h1[i] * 255);
    data[i * 4 + 1] = Math.max(0, Math.min(255, Math.round(128 + dx * 2200)));
    data[i * 4 + 2] = Math.max(0, Math.min(255, Math.round(128 + dy * 2200)));
    data[i * 4 + 3] = Math.round(h2[i] * 255);
  }
  return data;
}

let D = null, DS = 256;
// (one read of it as the GPU's level 0, bilinear, repeating; uv in its tiles)
function tap(u, v, out, w) {
  const x = u * DS - 0.5, y = v * DS - 0.5;
  const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
  const m = DS - 1, x0 = xi & m, x1 = (xi + 1) & m, y0 = yi & m, y1 = (yi + 1) & m;
  for (let c = 0; c < 4; c++) {
    const a = D[(y0 * DS + x0) * 4 + c], b = D[(y0 * DS + x1) * 4 + c], e = D[(y1 * DS + x0) * 4 + c], f = D[(y1 * DS + x1) * 4 + c];
    out[c] += w * ((a + (b - a) * fx) * (1 - fy) + (e + (f - e) * fx) * fy) / 255;
  }
}
// the shader's tri(): the noise at planet-fixed p (m) seen along normal n, period m; into out (rgba 0..1)
export function triDetail(p, n, period, out) {
  if (!D) D = detailData(DS);
  let wx = n[0] ** 4, wy = n[1] ** 4, wz = n[2] ** 4;
  const ws = wx + wy + wz; wx /= ws; wy /= ws; wz /= ws;
  out[0] = out[1] = out[2] = out[3] = 0;
  tap(p[1] / period, p[2] / period, out, wx);
  tap(p[2] / period + 0.37, p[0] / period + 0.37, out, wy);
  tap(p[0] / period + 0.71, p[1] / period + 0.71, out, wz);
  return out;
}
