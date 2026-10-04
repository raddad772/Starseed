// The ground's scanned materials (tools/build-materials.py, assets/materials): one per material class
// (gen/matclasses.js), two array textures the terrain shader reads, and the shader's way of reading
// them. Three modes: 3, each class's surface projected along all three axes and blended (triplanar);
// 2, along the two that face the surface most (biplanar: two thirds the reads); 0, the procedural
// detail from before the scans. ?mat=0|2|3 (default 3); setMatMode switches it on the fly.
import * as THREE from 'three';
import { MAT_CLASSES } from '../gen/matclasses.js';

const q = typeof location !== 'undefined' ? /[?&]mat=(\d)/.exec(location.search) : null;
let mode = q && [0, 2, 3].includes(+q[1]) ? +q[1] : 3;
export const matMode = () => mode;

// the layers: each class, then sand's wind ripples (laid over sand by the world's air: windRipple)
export const MAT_LAYERS = [...MAT_CLASSES, 'ripples'];
export const RIPPLE_LAYER = MAT_CLASSES.length;
// the textures, shared by every terrain material; a neutral stand-in (ratio 1, flat, matte) until
// the scans arrive
const flat = (rgba) => {
  const n = MAT_LAYERS.length, d = new Uint8Array(4 * n);
  for (let i = 0; i < n; i++) d.set(rgba, i * 4);
  const t = new THREE.DataArrayTexture(d, 1, 1, n);
  t.needsUpdate = true;
  return t;
};
export const MAT_UNIFORMS = {
  tMatA: { value: flat([102, 102, 102, 128]) },   // (0.4 x 2.5 = 1)
  tMatN: { value: flat([128, 128, 230, 255]) },
};

// every terrain material made, to switch them all (dropped as they're disposed)
const live = new Set();
export function trackMaterial(m) {
  m.defines = { ...(m.defines || {}), MAT_MODE: mode };
  live.add(m);
  m.addEventListener('dispose', () => live.delete(m));
  return m;
}
export function setMatMode(m) {
  if (![0, 2, 3].includes(m)) return mode;
  mode = m;
  for (const mat of live) { mat.defines.MAT_MODE = m; mat.needsUpdate = true; }
  return mode;
}

// sand's ripples on a world: x how strongly its air works sand (none without air; full by about
// Mars' density), y their spacing over Earth's (saltation runs further in thin air: ~1 m on Mars,
// as its large ripples are; finer in Titan's dense air), from the air's density at the ground
export function windRipple(b) {
  const a = b && b.data && b.data.atmosphere, P = a ? a.pressure || 0 : 0;
  if (!(P > 0)) return new THREE.Vector2(0, 1);
  const rho = (P / 1.013) * (288 / Math.max(b.data.Tsurf || 288, 30)) * ((a.mu || 29) / 29);
  const k = Math.min(1, Math.max(0, (rho - 0.0015) / 0.006));
  return new THREE.Vector2(k, Math.min(10, Math.max(0.4, 1 / Math.sqrt(rho))));
}

let loading = null;
// the scans into two RGBA array textures: A (albedo ratio x0.4, height), N (normal x, y, roughness,
// occlusion); resolves when they're in use
export function loadMaterials(renderer, base = 'assets/materials/') {
  if (loading) return loading;
  const img = async (name) => {
    const r = await fetch(base + name);
    if (!r.ok) throw new Error(`${name}: ${r.status}`);
    const bm = await createImageBitmap(await r.blob(), { premultiplyAlpha: 'none', colorSpaceConversion: 'none' });
    const c = new OffscreenCanvas(bm.width, bm.height), x = c.getContext('2d', { willReadFrequently: true });
    x.drawImage(bm, 0, 0);
    return x.getImageData(0, 0, bm.width, bm.height);
  };
  loading = (async () => {
    const n = MAT_LAYERS.length;
    const sets = await Promise.all(MAT_LAYERS.map((c) => Promise.all(['a', 'n', 'h'].map((t) => img(`${c}_${t}.webp`)))));
    const S = sets[0][0].width, layer = S * S * 4;
    const A = new Uint8Array(layer * n), N = new Uint8Array(layer * n);
    sets.forEach(([a, nm, h], i) => {
      const o = i * layer, ad = a.data, nd = nm.data, hd = h.data;
      for (let k = 0; k < S * S; k++) {
        const p = k * 4;
        A[o + p] = ad[p]; A[o + p + 1] = ad[p + 1]; A[o + p + 2] = ad[p + 2]; A[o + p + 3] = hd[p];
        N[o + p] = nd[p]; N[o + p + 1] = nd[p + 1]; N[o + p + 2] = nd[p + 2]; N[o + p + 3] = hd[p + 1];
      }
    });
    const aniso = renderer && renderer.capabilities ? renderer.capabilities.getMaxAnisotropy() : 8;
    const tex = (d) => {
      const t = new THREE.DataArrayTexture(d, S, S, n);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearMipmapLinearFilter;
      t.generateMipmaps = true; t.anisotropy = aniso; t.colorSpace = THREE.NoColorSpace;
      t.needsUpdate = true;
      return t;
    };
    MAT_UNIFORMS.tMatA.value = tex(A);
    MAT_UNIFORMS.tMatN.value = tex(N);
    return { size: S, classes: n };
  })();
  return loading;
}

// the shader's side. Every class tiles TILE m (2: it divides the detail period, 4096 m); a second read
// of the same scan at 8x that (16 m) gives the larger structure (cracks, beds) and keeps the tile
// from repeating plainly at range.
export const GLSL_MATERIALS = /* glsl */`
uniform highp sampler2DArray tMatA;
uniform highp sampler2DArray tMatN;
#define MAT_TILE 2.0
struct MatS { vec3 ratio; float h; vec3 n; float rough; float ao; };

// one projection, across axis a (0 x, 1 y, 2 z): its texels, and its normal into the planet-fixed
// frame by the whiteout blend on the face's own normal (uv flipped on a face's back side, so its
// bumps light the right way round)
void matPlane(int a, vec3 p, vec3 dx, vec3 dy, vec3 n, float layer, out vec4 A, out vec4 B, out vec3 wn) {
  vec2 uv, gx, gy;
  float sg;
  if (a == 0) { sg = n.x < 0.0 ? -1.0 : 1.0; uv = vec2(p.z * sg, p.y); gx = vec2(dx.z * sg, dx.y); gy = vec2(dy.z * sg, dy.y); }
  else if (a == 1) { sg = n.y < 0.0 ? -1.0 : 1.0; uv = vec2(p.x * sg, p.z); gx = vec2(dx.x * sg, dx.z); gy = vec2(dy.x * sg, dy.z); }
  else { sg = n.z < 0.0 ? 1.0 : -1.0; uv = vec2(p.x * sg, p.y); gx = vec2(dx.x * sg, dx.y); gy = vec2(dy.x * sg, dy.y); }
  A = textureGrad(tMatA, vec3(uv, layer), gx, gy);
  B = textureGrad(tMatN, vec3(uv, layer), gx, gy);
  vec2 t = B.xy * 2.0 - 1.0;
  t.x *= sg;
  float tz = sqrt(max(1.0 - dot(t, t), 0.0));
  if (a == 0) { vec3 v = vec3(t + n.zy, tz * abs(n.x)); wn = vec3(v.z * sign(n.x + 1e-6), v.y, v.x); }
  else if (a == 1) { vec3 v = vec3(t + n.xz, tz * abs(n.y)); wn = vec3(v.x, v.z * sign(n.y + 1e-6), v.y); }
  else { vec3 v = vec3(t + n.xy, tz * abs(n.z)); wn = vec3(v.x, v.y, v.z * sign(n.z + 1e-6)); }
}

// one class's surface at p (planet-fixed m, already over the tile), dx/dy its screen derivatives
MatS matSurf(float layer, vec3 p, vec3 dx, vec3 dy, vec3 n) {
  vec4 A, B; vec3 wn;
  vec4 sA = vec4(0.0), sB = vec4(0.0); vec3 sn = vec3(0.0);
#if MAT_MODE == 3
  vec3 w = pow(abs(n), vec3(6.0));
  w /= w.x + w.y + w.z;
  for (int a = 0; a < 3; a++) {
    float wa = a == 0 ? w.x : a == 1 ? w.y : w.z;
    matPlane(a, p, dx, dy, n, layer, A, B, wn);
    sA += A * wa; sB += B * wa; sn += wn * wa;
  }
#else
  // (the two axes the surface faces most, weighted so the third's share, gone, leaves no seam)
  vec3 an = abs(n);
  int ma = an.x > an.y && an.x > an.z ? 0 : an.y > an.z ? 1 : 2;
  int mi = an.x < an.y && an.x < an.z ? 0 : an.y < an.z ? 1 : 2;
  int me = 3 - mi - ma;
  float w0 = ma == 0 ? an.x : ma == 1 ? an.y : an.z, w1 = me == 0 ? an.x : me == 1 ? an.y : an.z;
  vec2 bw = clamp((vec2(w0, w1) - 0.5773) / (1.0 - 0.5773), 0.0, 1.0);
  bw = bw.x + bw.y < 1e-4 ? vec2(1.0, 0.0) : bw / (bw.x + bw.y);   // (exactly diagonal: both 0)
  matPlane(ma, p, dx, dy, n, layer, A, B, wn); sA += A * bw.x; sB += B * bw.x; sn += wn * bw.x;
  matPlane(me, p, dx, dy, n, layer, A, B, wn); sA += A * bw.y; sB += B * bw.y; sn += wn * bw.y;
#endif
  return MatS(sA.rgb * 2.5, sA.a, normalize(sn), sB.b, sB.a);
}

// the ground's dressing at p from its classes' shares (cls 0..11), near (fine tile) and far (16 m)
// weighted by kF and kM: the two largest shares blended by their heights (stones stand out of sand)
MatS matGround(vec4 c0, vec4 c1, vec4 c2, vec3 p, vec3 dpx, vec3 dpy, vec3 n, float kF, float kM) {
  float cs[12] = float[12](c0.x, c0.y, c0.z, c0.w, c1.x, c1.y, c1.z, c1.w, c2.x, c2.y, c2.z, c2.w);
  int ia = 0, ib = 1;
  float wa = -1.0, wb = -1.0;
  for (int i = 0; i < 12; i++) {
    float v = cs[i];
    if (v > wa) { wb = wa; ib = ia; wa = v; ia = i; } else if (v > wb) { wb = v; ib = i; }
  }
  wb = max(wb, 0.0);
  MatS r = MatS(vec3(1.0), 0.5, n, 0.8, 1.0);
  if (wa <= 0.0) return r;
  MatS a = MatS(vec3(1.0), 0.5, n, 0.8, 1.0), b = a, aM = a, bM = a;
  vec3 pf = p / MAT_TILE, dxf = dpx / MAT_TILE, dyf = dpy / MAT_TILE;
  vec3 pm = pf * 0.125 + 0.37, dxm = dxf * 0.125, dym = dyf * 0.125;
  if (kF > 0.0) { a = matSurf(float(ia), pf, dxf, dyf, n); if (wb > 0.02) b = matSurf(float(ib), pf, dxf, dyf, n); }
  if (kM > 0.0) { aM = matSurf(float(ia), pm, dxm, dym, n); if (wb > 0.02) bM = matSurf(float(ib), pm, dxm, dym, n); }
  // (each: the near tile over the far one: the ratios multiply, the normals' tilts add; by class,
  // how much relief each read carries: magnified 8x, a soft ground's lumps become drifts (sand's
  // trampled lumps made swirls that crossed its ripples); rock's cracks and beds stay)
  const float NF[12] = float[12](1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.45, 1.0, 1.0, 0.8, 0.8, 0.6);
  const float NM[12] = float[12](0.7, 0.7, 0.7, 0.7, 0.5, 0.5, 0.1, 0.6, 0.6, 0.4, 0.3, 0.3);
  float fA = kF * NF[ia], mA = kM * NM[ia], fB = kF * NF[ib], mB = kM * NM[ib];
  vec3 rA = mix(vec3(1.0), a.ratio, kF) * mix(vec3(1.0), aM.ratio, kM * min(1.0, NM[ia] * 1.4));
  vec3 rB = mix(vec3(1.0), b.ratio, kF) * mix(vec3(1.0), bM.ratio, kM * min(1.0, NM[ib] * 1.4));
  vec3 nA = normalize(n + (a.n - n) * fA + (aM.n - n) * mA);
  vec3 nB = normalize(n + (b.n - n) * fB + (bM.n - n) * mB);
  float hA = mix(aM.h, a.h, kF), hB = mix(bM.h, b.h, kF);
  float roA = mix(aM.rough, a.rough, kF), roB = mix(bM.rough, b.rough, kF);
  float aoA = mix(aM.ao, a.ao, kF), aoB = mix(bM.ao, b.ao, kF);
  // height blend
  float sw = wa + wb;
  float fa = wa / sw, fb = wb / sw;
  float m = max(hA * 0.6 + fa, hB * 0.6 + fb) - 0.2;
  float ba = max(hA * 0.6 + fa - m, 0.0), bb = max(hB * 0.6 + fb - m, 0.0);
  float t = ba / max(ba + bb, 1e-4);
  float on = clamp(sw * 1.5, 0.0, 1.0);   // (less than a whole share: water's edge, a lava rim)
  r.ratio = mix(vec3(1.0), mix(rB, rA, t), on);
  r.n = normalize(mix(n, normalize(mix(nB, nA, t)), on));
  r.h = mix(hB, hA, t);
  r.rough = mix(0.8, mix(roB, roA, t), on);
  r.ao = mix(1.0, mix(aoB, aoA, t), on);
  return r;
}

// a glint from grains a few mm across, a few of them turned to the sun (snow's, quartz sand's)
float grainGlint(vec3 p, vec3 N, vec3 H, float rare) {
  uvec3 c = uvec3(ivec3(floor(p * 220.0)) + 1048576);
  uint hh = (c.x * 1597334677u) ^ (c.y * 3812015801u) ^ (c.z * 2798796415u);
  hh = hh * 747796405u + 2891336453u; hh ^= hh >> 16; hh *= 2246822519u; hh ^= hh >> 13;
  if (float(hh >> 22) / 1023.0 < rare) return 0.0;
  vec3 rv = vec3(float(hh & 1023u), float((hh >> 10) & 1023u), float((hh >> 3) & 1023u)) / 1023.0 - 0.5;
  return pow(max(dot(normalize(N + rv * 0.8), H), 0.0), 3000.0);
}
// sand's wind ripples over normal n at p: their layer at the world's spacing (sp), near, and 8x that
// (megaripples) further, each faded as a pixel (foot m) grows past a third of its spacing
vec3 sandRippleN(vec3 p, vec3 dx, vec3 dy, vec3 n, float sp, float foot, float k) {
  float t = MAT_TILE * sp;
  float f1 = 1.0 - smoothstep(0.015 * sp, 0.06 * sp, foot), f2 = 1.0 - smoothstep(0.2 * sp, 0.5 * sp, foot);
  vec3 r = n;
  if (f1 > 0.0) r += (matSurf(${RIPPLE_LAYER}.0, p / t, dx / t, dy / t, n).n - n) * f1 * k;
  if (f2 > 0.0) r += (matSurf(${RIPPLE_LAYER}.0, p / (t * 8.0) + 0.21, dx / (t * 8.0), dy / (t * 8.0), n).n - n) * f2 * k * 0.25;
  return normalize(r);
}
`;
