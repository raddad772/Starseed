// A world's portrait for the planet catalog: a small lit disc of its surface
// in the generator's own colours (the same samples and shading the terrain
// is built from), and what covers it: ocean, ice, lava, biomes, plains, in
// fractions of the surface. Runs in a terrain worker (terrain worlds) or on
// the main thread (giants: their bands and storms from the generation data).
// The picture is render output (Math.* allowed); the shares of what covers it are data the catalog
// shows every player, so the places they're sampled at go through dmath.

import { S_H, S_TEMP, S_MOIST, S_CRATER, S_MOUNT, S_LAVA, S_LEN } from './terrain.js';
import { biomeName } from './settlements.js';
import * as dm from '../core/dmath.js';

const SUN = norm([-0.62, 0.48, 0.62]); // light from the upper left, a little in front

function norm(v) { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; }
const enc = (c) => Math.round(255 * Math.min(1, c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055));

// the view's basis on the body: centre direction c, up u, right r
function basis(center) {
  const c = norm(center);
  let u = [0, 1, 0];
  const d = u[0] * c[0] + u[1] * c[1] + u[2] * c[2];
  u = norm([u[0] - c[0] * d, u[1] - c[1] * d, u[2] - c[2] * d]);
  const r = [u[1] * c[2] - u[2] * c[1], u[2] * c[0] - u[0] * c[2], u[0] * c[1] - u[1] * c[0]];
  return { c, u, r };
}

// Disc pixels (RGBA, transparent outside) from colour(dir) -> [r, g, b] linear
// and mat info; rim: atmosphere tint {color, k} or null
function disc(size, B, colourAt, rim) {
  const px = new Uint8ClampedArray(size * size * 4);
  for (let j = 0; j < size; j++) {
    for (let i = 0; i < size; i++) {
      const nx = (i + 0.5) / size * 2 - 1, ny = 1 - (j + 0.5) / size * 2;
      const r2 = nx * nx + ny * ny;
      const o = (j * size + i) * 4;
      if (r2 > 1) continue;
      const nz = Math.sqrt(1 - r2);
      const dir = [B.r[0] * nx + B.u[0] * ny + B.c[0] * nz, B.r[1] * nx + B.u[1] * ny + B.c[1] * nz, B.r[2] * nx + B.u[2] * ny + B.c[2] * nz];
      const lam = Math.max(0, nx * SUN[0] + ny * SUN[1] + nz * SUN[2]);
      const { col, wet, glow } = colourAt(dir);
      let k = lam * 0.94 + 0.04;
      let cr = col[0] * k, cg = col[1] * k, cb = col[2] * k;
      if (wet) { // sun glint on liquid
        const rz = 2 * lam * nz - SUN[2];
        const spec = Math.pow(Math.max(0, rz), 38) * 0.7 * wet;
        cr += spec; cg += spec; cb += spec;
      }
      if (glow) { cr += glow * 1.6; cg += glow * 0.45; cb += glow * 0.08; }
      if (rim) {
        const f = Math.pow(1 - nz, 2.2) * rim.k * (0.25 + lam);
        cr += (rim.color[0] - cr) * Math.min(1, f); cg += (rim.color[1] - cg) * Math.min(1, f); cb += (rim.color[2] - cb) * Math.min(1, f);
      }
      // a soft edge
      const edge = Math.min(1, (1 - Math.sqrt(r2)) * size * 0.5);
      px[o] = enc(cr * 1.5); px[o + 1] = enc(cg * 1.5); px[o + 2] = enc(cb * 1.5); px[o + 3] = Math.round(255 * edge);
    }
  }
  return px;
}

// A terrain world: its portrait and its cover. opts: { size, atmo: {color,
// k} (a limb tint), overcast: {color, k} (a cloud or haze deck hiding the
// ground: a greenhouse world's, a titan's) }
export function terrainPortrait(gen, opts = {}) {
  const size = opts.size || 96;
  const p = gen.p, R = gen.R;
  const s = new Float64Array(S_LEN), col = [0, 0, 0], mat = new Float64Array(7);
  const minW = R / 30;
  // the day side of a locked world faces us; others a three-quarter view
  const cl = p.climate || {};
  const B = basis(cl.locked && cl.substellar ? cl.substellar : [0.8, 0.35, 0.5]);
  const oc = opts.overcast;
  const px = disc(size, B, (d) => {
    gen.sample(d[0], d[1], d[2], minW, s);
    gen.shade(s, 0.05, col, mat);
    if (oc) {
      // the deck: soft bands along the latitudes, over whatever is below
      const band = 0.88 + 0.12 * Math.sin(d[1] * 11 + 1.7 * Math.sin(d[0] * 5 + d[2] * 3));
      for (let k = 0; k < 3; k++) col[k] += (oc.color[k] * band - col[k]) * oc.k;
      return { col, wet: 0, glow: (mat[5] || 0) * (1 - oc.k) };
    }
    return { col, wet: mat[4] > 0 ? 1 : (mat[6] || 0) * 0.4, glow: mat[5] || 0 };
  }, opts.atmo || null);
  return { px, size, cover: terrainCover(gen) };
}

// The whole world as a map for the nav computer's globe (ui/screens/globe.js): the generator's
// own colours (no clouds, unlit: the globe lights it by the real sun) and the height of what's on
// top (water's surface over a sea or lake), equirectangular, w x h, north at the top row, longitude
// from -pi at the left (directions body-fixed, y the pole: x = cos lat cos lon, z = cos lat sin lon)
export function terrainGlobeMap(gen, w = 512, h = 256) {
  const s = new Float64Array(S_LEN), col = [0, 0, 0], mat = new Float64Array(7), minW = gen.R / 150;
  const rgb = new Uint8ClampedArray(w * h * 3), elev = new Float32Array(w * h);
  for (let j = 0; j < h; j++) {
    const lat = Math.PI / 2 - (j + 0.5) / h * Math.PI, cl = Math.cos(lat), sl = Math.sin(lat);
    for (let i = 0; i < w; i++) {
      const lon = -Math.PI + (i + 0.5) / w * 2 * Math.PI;
      gen.sample(cl * Math.cos(lon), sl, cl * Math.sin(lon), minW, s);
      gen.shade(s, 0.05, col, mat);
      const o = j * w + i;
      rgb[o * 3] = enc(col[0] * 1.4); rgb[o * 3 + 1] = enc(col[1] * 1.4); rgb[o * 3 + 2] = enc(col[2] * 1.4);
      elev[o] = mat[4] > 0 ? Math.max(s[S_H], 0) : s[S_H];
    }
  }
  return { w, h, rgb, elev };
}

// what covers a terrain world, as [{ name, frac }] (largest first, over 1.5%)
export function terrainCover(gen, n = 1500) {
  const p = gen.p, R = gen.R;
  const s = new Float64Array(S_LEN);
  const counts = new Map();
  const add = (k) => counts.set(k, (counts.get(k) || 0) + 1);
  const hasSea = !!p.liquid && gen.contThreshold > -1e8;
  const cl = p.climate || {};
  const habitable = p.liquid === 'water' && cl.Tmean > 250 && cl.Tmean < 330;
  for (let i = 0; i < n; i++) {
    const z = 1 - (i + 0.5) / n * 2, r = Math.sqrt(1 - z * z), th = i * 2.399963;
    gen.sample(dm.cos(th) * r, z, dm.sin(th) * r, R / 20, s);
    const h = s[S_H], Tc = s[S_TEMP] - 273.15;
    if (hasSea && h < 0) {
      if (p.liquid === 'water') add(Tc < -2 || p.frozenOcean ? 'sea ice' : 'ocean');
      else if (p.liquid === 'lava') add('lava sea');
      else add(`${p.liquid} sea`);
      continue;
    }
    if (s[S_LAVA] > 0.3) { add('lava flows'); continue; }
    if (habitable) { add(biomeName(Tc, s[S_MOIST], h, false)); continue; }
    if (p.icy) add('ice plains');
    else if (p.iceCover > 0 && Tc < -60) add('ice cap');
    else if (s[S_CRATER] > 0.1) add('cratered plains');
    else if (s[S_MOUNT] > 0.45) add('highlands');
    else add(p.dunes > 0.3 ? 'dune fields' : 'regolith plains');
  }
  return [...counts.entries()].map(([name, c]) => ({ name, frac: c / n })).filter((e) => e.frac >= 0.015).sort((a, b) => b.frac - a.frac);
}

// A giant: banded clouds from its palette, its storms as ovals
export function giantPortrait(body, opts = {}) {
  const size = opts.size || 96;
  const G = body.giant;
  const pal = G.palette, nb = G.bands;
  const B = basis([0.85, 0.2, 0.5]);
  // a little turbulence along the bands
  const wob = (x, y, z) => 0.5 * Math.sin(x * 9.1 + z * 4.3) * Math.sin(z * 7.7 - y * 3.1) + 0.25 * Math.sin(x * 23 + y * 17 + z * 11);
  const px = disc(size, B, (d) => {
    const lat = Math.asin(Math.max(-1, Math.min(1, d[1])));
    const t = (lat / (Math.PI / 2) * 0.5 + 0.5) * nb + 0.12 * wob(d[0], d[1], d[2]);
    const k = Math.floor(t), f = t - k;
    const a = pal[((k % pal.length) + pal.length) % pal.length], b = pal[(((k + 1) % pal.length) + pal.length) % pal.length];
    const m = f < 0.8 ? 0 : (f - 0.8) / 0.2;
    const col = [a[0] + (b[0] - a[0]) * m, a[1] + (b[1] - a[1]) * m, a[2] + (b[2] - a[2]) * m];
    for (const st of G.storms) {
      const sl = st.lat * Math.PI / 2, lon = Math.atan2(d[2], d[0]);
      let dl = lon - st.lon; dl = Math.atan2(Math.sin(dl), Math.cos(dl));
      const e = Math.pow(dl / (st.size * st.stretch * 2), 2) + Math.pow((lat - sl) / (st.size * 2), 2);
      if (e < 1) { const w = 1 - e; col[0] += (st.color[0] - col[0]) * w; col[1] += (st.color[1] - col[1]) * w; col[2] += (st.color[2] - col[2]) * w; }
    }
    return { col, wet: 0, glow: 0 };
  }, { color: pal[0].map((c) => c * 1.2), k: 0.6 });
  return { px, size, cover: [{ name: G.chemistryName ? `${G.chemistryName} clouds` : 'cloud decks', frac: 1 }] };
}

// the portrait options a body's air calls for (a limb tint, a deck)
export function portraitLook(body) {
  const a = body.atmosphere;
  if (!a) return {};
  const P = a.pressure || 0;
  if (a.type === 'venus') return { overcast: { color: [0.8, 0.68, 0.42], k: 0.94 }, atmo: { color: [0.95, 0.85, 0.6], k: 0.5 } };
  if (a.type === 'titan') return { overcast: { color: [0.62, 0.38, 0.14], k: 0.88 }, atmo: { color: [0.8, 0.55, 0.25], k: 0.6 } };
  if (a.type === 'temperate') return { atmo: { color: [0.35, 0.55, 1.0], k: Math.min(1, 0.4 + 0.5 * P) } };
  if (a.type === 'mars') return { atmo: { color: [0.85, 0.6, 0.45], k: 0.3 } };
  if (P > 0.05) return { atmo: { color: [0.7, 0.75, 0.85], k: Math.min(0.6, P) } };
  return {};
}
