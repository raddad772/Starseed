// Terrain surface shading.

import * as THREE from 'three';
import { GLSL_SURFACE_ATMO, GLSL_CLOUD_N } from './atmosphere.js';
import { GLSL_NOISE } from './glsl.js';

export const DETAIL_PERIOD = 4096; // metres; every detail tile period divides this

const VERT = /* glsl */`
#define NEAR_OVERLAP 0.97
attribute vec3 morph;
attribute vec4 nrm;
attribute vec4 mnrm;
attribute vec4 col;
attribute vec4 mcol;
attribute vec4 mat;
attribute vec4 ext;
attribute float occ;       // (volume chunks: how much rock overhangs; 0 where absent)
uniform vec3 uCamLocal;
uniform vec2 uMorph;
uniform vec3 uOriginMod;
uniform vec3 uNearOff;     // this mesh's origin less the near field's centre (body-fixed)
uniform vec2 uNear;
uniform vec3 uNearUp;
uniform float uNearMode;
varying vec3 vNearRel;
varying float vOcc;
varying vec3 vWorldPos;
varying vec3 vNormal;
varying vec3 vFixedPos;
varying vec3 vFixedNormal;
varying vec4 vCol;
varying vec4 vMat;
varying vec4 vExt;
varying float vMorphK;
#include <common>
#include <logdepthbuf_pars_vertex>
void main() {
  float d = distance(morph, uCamLocal);
  float m = clamp((d - uMorph.x) / max(uMorph.y - uMorph.x, 1e-3), 0.0, 1.0);
  vec3 p = mix(position, morph, m);
  vec3 n = normalize(mix(nrm.xyz, mnrm.xyz, m));
  vCol = mix(col, mcol, m);
  vMat = mat;
  vExt = ext;
  vMorphK = m;
  // (a heightfield mesh reaches a little way in under the near field's last ring, a little
  // low: wherever the two surfaces' heights differ at the ring's edge, one covers the joint)
  if (uNear.x > 0.5 && uNearMode < 0.5) {
    vec3 rel = uNearOff + p;
    float dn = length(rel - uNearUp * dot(rel, uNearUp));
    p -= uNearUp * (0.4 * (1.0 - smoothstep(NEAR_OVERLAP * uNear.y, uNear.y, dn)));
  }
  vec4 wp = modelMatrix * vec4(p, 1.0);
  vWorldPos = wp.xyz;
  vNormal = normalize(mat3(modelMatrix) * n);
  vFixedPos = uOriginMod + p;
  vFixedNormal = n;
  vNearRel = uNearOff + p;
  vOcc = occ;
  gl_Position = projectionMatrix * viewMatrix * wp;
  #include <logdepthbuf_vertex>
}
`;

const FRAG = /* glsl */`
#define NEAR_OVERLAP 0.97
uniform vec3 uSunDir;
uniform vec3 uSunE;
uniform vec3 uCenter;
uniform float uRadius;
uniform mat3 uToFixed;
uniform sampler2D tDetail;
uniform float uTime;
uniform vec4 uCloud;
uniform float uCloudOn;
uniform float uCloudOpacity;
uniform vec3 uLavaColor;
uniform vec3 uAmbientFloor;
uniform float uDebug;
// the near field (volume.js): x on, y its radius; uNearMode 0 a heightfield mesh (gives way to
// the volume inside, but for its water), 1 a volume chunk (shown only inside)
uniform vec2 uNear;
uniform vec3 uNearUp;      // the up at its centre: the cut is a vertical cylinder, any height
uniform float uNearMode;
uniform vec2 uNearBand;    // (a volume chunk) its ring's band from the centre
varying vec3 vNearRel;
varying float vOcc;
varying vec3 vWorldPos;
varying vec3 vNormal;
varying vec3 vFixedPos;
varying vec3 vFixedNormal;
varying vec4 vCol;
varying vec4 vMat;
varying vec4 vExt;
varying float vMorphK;
#include <common>
#include <logdepthbuf_pars_fragment>
${GLSL_SURFACE_ATMO}
${GLSL_NOISE}

uniform sampler3D tNoise;
uniform sampler2D tCloudMap;
uniform float uCloudMapMean;
${GLSL_CLOUD_N}
float cloudDensityAt(vec3 fixedDir, float foot) {
  return cloudCover(fixedDir * uRadius, fixedDir, foot, (uCloud.z - 0.5) * 0.3);
}

// detail texture: r = height noise, g/b = slope (encoded), a = secondary noise
vec4 tri(vec3 p, vec3 w, float period) {
  vec4 a = texture(tDetail, p.yz / period);
  vec4 b = texture(tDetail, p.zx / period + 0.37);
  vec4 c = texture(tDetail, p.xy / period + 0.71);
  return a * w.x + b * w.y + c * w.z;
}
// triplanar bump: perturbs the planet-fixed normal
vec3 triBump(vec3 p, vec3 n, vec3 w, float period, float strength) {
  vec2 gx = texture(tDetail, p.yz / period).gb * 2.0 - 1.0;
  vec2 gy = texture(tDetail, p.zx / period + 0.37).gb * 2.0 - 1.0;
  vec2 gz = texture(tDetail, p.xy / period + 0.71).gb * 2.0 - 1.0;
  vec3 bx = vec3(0.0, gx.x, gx.y);
  vec3 by = vec3(gy.y, 0.0, gy.x);
  vec3 bz = vec3(gz.x, gz.y, 0.0);
  vec3 g = bx * w.x + by * w.y + bz * w.z;
  return normalize(n - g * strength);
}

void main() {
  #include <logdepthbuf_fragment>
  // (a pixel's span on the ground: the cloud shadows' noise fades where it is finer)
  float foot = length(fwidth(vWorldPos));
  vec3 albedo = vCol.rgb * vCol.rgb;
  float waterEnc = vCol.a;
  if (uNear.x > 0.5) {
    float dn = length(vNearRel - uNearUp * dot(vNearRel, uNearUp));
    if (uNearMode < 0.5) { if (dn < NEAR_OVERLAP * uNear.y && waterEnc < 0.004) discard; }
    else if (dn < uNearBand.x || dn > uNearBand.y) discard;
  }
  float veg = vMat.r, snow = vMat.g, rock = vMat.b, sand = vMat.a;
  float emissive = vExt.r, wet = vExt.g, rough = vExt.b;
  vec3 rel = vWorldPos - uCenter;
  float r = length(rel);
  vec3 up = rel / r;
  float dist = length(vWorldPos);
  vec3 N = normalize(vNormal);
  float muS = dot(up, uSunDir);
  vec3 sunT = atmoSunTransmittance(r, muS);

  // cloud shadow
  if (uCloudOn > 0.5 && muS > -0.05) {
    float hc = uCloud.x - (r - uRadius);
    if (hc > 0.0) {
      vec3 pc = rel + uSunDir * hc / max(muS, 0.08);
      float cd = cloudDensityAt(normalize(uToFixed * normalize(pc)), foot);
      sunT *= 1.0 - 0.8 * cd * uCloudOpacity;
    }
  }
  vec3 skyE = atmoSkyIrradiance(r, muS);

  // ---- detail (planet-fixed, precision-safe coordinates)
  vec3 fp = vFixedPos;
  vec3 fn = normalize(vFixedNormal);
  vec3 w = pow(abs(fn), vec3(4.0));
  w /= (w.x + w.y + w.z);
  float fineK = 1.0 - smoothstep(60.0, 900.0, dist);
  float midK = 1.0 - smoothstep(600.0, 9000.0, dist);
  float farK = 1.0 - smoothstep(6000.0, 90000.0, dist);
  float isWater = step(0.004, waterEnc);
  if (isWater < 0.5) {
    vec4 d1 = tri(fp, w, 512.0);
    vec4 d2 = tri(fp, w, 64.0);
    vec4 d3 = tri(fp, w, 8.0);
    float grainK = 1.0 - smoothstep(8.0, 140.0, dist);
    vec4 d4 = grainK > 0.0 ? tri(fp, w, 1.0) : vec4(0.5);
    float rockAmt = clamp(rock + rough * 0.3, 0.0, 1.0);
    // patchy ground cover: lush / dry swathes and bare soil in vegetated land
    float cover = smoothstep(0.38, 0.66, d2.a) * midK;
    albedo = mix(albedo, albedo * vec3(1.35, 1.12, 0.62), veg * cover * 0.55);
    float bare = smoothstep(0.6, 0.78, d2.r) * veg * midK;
    albedo = mix(albedo, albedo * vec3(1.9, 1.45, 1.1) + vec3(0.012, 0.009, 0.006), bare * 0.55);
    // snow thins out over rocks and in wind-scoured patches
    albedo = mix(albedo, albedo * 0.72, snow * smoothstep(0.55, 0.8, d3.a) * fineK * 0.6);
    // multi-scale brightness variation down to sub-metre grain
    float v = (d1.r - 0.5) * 0.55 * farK + (d2.r - 0.5) * 0.45 * midK + (d3.a - 0.5) * 0.45 * fineK + (d4.r - 0.5) * 0.5 * grainK;
    albedo *= 1.0 + v * mix(0.85, 1.35, rockAmt) * (1.0 - snow * 0.6);
    // bump detail: rock strong, vegetation soft, snow smooth
    vec3 nf = fn;
    float bumpK = mix(0.45, 1.25, rockAmt) * (1.0 - snow * 0.6);
    nf = triBump(fp, nf, w, 64.0, 0.55 * bumpK * midK);
    nf = triBump(fp, nf, w, 8.0, 0.55 * bumpK * fineK);
    nf = triBump(fp, nf, w, 1.0, 0.45 * bumpK * grainK);
    // planet-fixed -> world: apply the same rotation as the geometry
    vec3 nWorld = normalize(transpose(uToFixed) * nf);
    N = normalize(mix(N, nWorld, 0.85));
  }

  float ndl = max(dot(N, uSunDir), 0.0);
  vec3 color;
  if (isWater > 0.5) {
    // ---- water: depth-tinted body + Fresnel sky reflection + sun glint
    vec3 V = normalize(-vWorldPos);
    vec2 wv = vec2(0.0);
    vec3 wn = fn;
    float waveK = 1.0 - smoothstep(200.0, 6000.0, dist);
    vec3 fpw = fp + vec3(uTime * 0.4, 0.0, uTime * 0.27);
    wn = triBump(fpw, wn, w, 32.0, 0.25 * waveK);
    wn = triBump(fp - vec3(uTime * 0.3, uTime * 0.2, 0.0), wn, w, 8.0, 0.18 * waveK);
    vec3 Nw = normalize(transpose(uToFixed) * wn);
    Nw = normalize(mix(up, Nw, 0.9));
    float NdV = max(dot(Nw, V), 0.0);
    float F = 0.02 + 0.98 * pow(1.0 - NdV, 5.0);
    vec3 H = normalize(V + uSunDir);
    float NdH = max(dot(Nw, H), 0.0);
    float shin = mix(80.0, 900.0, waveK);
    float spec = pow(NdH, shin) * (shin + 8.0) / 25.0;
    vec3 body = albedo / PI * (uSunE * sunT * max(muS, 0.0) * 0.6 + uSunE * skyE * 0.5);
    vec3 skyRefl = uSunE * skyE / PI * mix(0.7, 1.6, pow(1.0 - NdV, 2.0));
    color = body * (1.0 - F) + skyRefl * F + uSunE * sunT * spec * F * step(0.0, muS);
  } else {
    float wrap = 0.5 + 0.5 * dot(N, up);
    vec3 direct = uSunE * sunT * ndl;
    vec3 ambient = uSunE * skyE * wrap + uAmbientFloor;
    // far off the ground's small roughness goes unresolved, but its shadows don't: rocks,
    // furrows and a forest's canopy darken it, the more so with the sun low
    float farK = smoothstep(1500.0, 12000.0, dist);
    float hidden = max(clamp(0.25 + 0.55 * rough + 0.35 * rock, 0.0, 1.0) * (1.0 - 0.6 * snow), veg * 0.85);
    albedo *= 1.0 - farK * hidden * (0.25 + 0.35 * (1.0 - clamp(muS, 0.0, 1.0)));
    color = albedo / PI * (direct + ambient);
    // (under overhangs and in caves: little sky and less sun)
    color *= 1.0 - 0.94 * vOcc;
    // wet / icy sheen
    vec3 V = normalize(-vWorldPos);
    vec3 H = normalize(V + uSunDir);
    // (an airless world's ground is regolith, frost included: matte, no gloss)
    float sp = pow(max(dot(N, H), 0.0), mix(20.0, 120.0, snow)) * (0.03 + 0.25 * snow + 0.3 * wet) * (uHasAtmo > 0.5 ? 1.0 : 0.1);
    color += uSunE * sunT * sp * ndl;
  }
  // molten rock glows regardless of lighting
  if (emissive > 0.01) {
    float flick = 0.85 + 0.15 * sin(uTime * 1.7 + vFixedPos.x * 0.05 + vFixedPos.z * 0.07);
    float crust = smoothstep(0.35, 0.65, tri(fp, w, 128.0).a);
    color += uLavaColor * emissive * flick * mix(1.0, 0.15, crust * (1.0 - emissive * 0.5));
  }
  if (uDebug > 0.5) color = mix(color, vec3(vMorphK, 1.0 - vMorphK, 0.0) * 0.2, 0.5);
  gl_FragColor = vec4(color, 1.0);
}
`;

// Tileable detail texture: value-noise fBm on a periodic lattice; g/b store slopes.
export function makeDetailTexture(size = 256) {
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
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

export function makeTerrainMaterial(shared) {
  return new THREE.ShaderMaterial({
    uniforms: {
      ...shared,
      uCamLocal: { value: new THREE.Vector3() },
      uMorph: { value: new THREE.Vector2(1e9, 2e9) },
      uOriginMod: { value: new THREE.Vector3() },
      uNearOff: { value: new THREE.Vector3() },
      uNearMode: { value: 0 },
      uNearBand: { value: new THREE.Vector2(0, 0) },
    },
    vertexShader: VERT,
    fragmentShader: FRAG,
  });
}
