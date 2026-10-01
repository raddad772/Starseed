// Gas / ice giant cloud tops (seen from outside) and planetary rings.

import * as THREE from 'three';
import { GLSL_NOISE } from './glsl.js';
import { GLSL_SURFACE_ATMO } from './atmosphere.js';

export const GLSL_GIANT_BANDS = /* glsl */`
uniform vec3 uPal[6];
uniform float uBands;
uniform float uTurb;
uniform float uJetPhase;
uniform float uEqJet;
uniform vec4 uStorm[3];      // lat, lon, size, stretch
uniform vec3 uStormCol[3];
uniform float uStormSpin[3];
uniform float uNumStorms;
uniform vec3 uPolar;
uniform float uHexagon;
uniform float uGiantTime;

vec3 palette(float t) {
  t = clamp(t, 0.0, 1.0) * 5.0;
  float i = floor(t), f = smoothstep(0.0, 1.0, fract(t));
  vec3 a = uPal[0], b = uPal[1];
  if (i < 1.0) { a = uPal[0]; b = uPal[1]; }
  else if (i < 2.0) { a = uPal[1]; b = uPal[2]; }
  else if (i < 3.0) { a = uPal[2]; b = uPal[3]; }
  else if (i < 4.0) { a = uPal[3]; b = uPal[4]; }
  else { a = uPal[4]; b = uPal[5]; }
  return mix(a, b, f);
}

// Cloud-top colour for a body-fixed direction. detail: number of fine octaves.
vec3 giantColor(vec3 d, float detail, out float bandShade) {
  float lat = asin(clamp(d.y, -1.0, 1.0));
  float lon = atan(d.z, d.x);
  // zonal winds: alternating jets; differential rotation shears the pattern
  float jet = sin(lat * uBands * 2.0 + uJetPhase * 6.28) + uEqJet * exp(-lat * lat * 40.0);
  float shift = jet * uGiantTime * 0.00004;
  vec3 p = vec3(cos(lon + shift) * cos(lat), sin(lat), sin(lon + shift) * cos(lat));
  // storms: swirl coordinates around vortex centres
  for (int i = 0; i < 3; i++) {
    if (float(i) >= uNumStorms) break;
    vec4 s = uStorm[i];
    vec3 c = vec3(cos(s.y) * cos(s.x), sin(s.x), sin(s.y) * cos(s.x));
    float dd = distance(p, c);
    float r = s.z;
    if (dd < r * 1.6) {
      float k = 1.0 - dd / (r * 1.6);
      float ang = uStormSpin[i] * k * k * 5.0 + uGiantTime * 0.0004 * uStormSpin[i];
      vec3 axis = c;
      vec3 q = p - axis * dot(p, axis);
      vec3 w = cross(axis, q);
      p = axis * dot(p, axis) + q * cos(ang) + w * sin(ang);
    }
  }
  float turb = uTurb * (0.35 + 0.65 * abs(cos(lat * uBands * 2.0 + uJetPhase * 6.28)));
  vec3 wp = p * 3.0;
  float w1 = fbm3(wp * vec3(1.0, 5.0, 1.0) + 2.0, 4);
  float w2 = fbm3(wp * vec3(1.0, 5.0, 1.0) * 2.3 + 7.0, int(3.0 + detail));
  float latW = lat + (w1 * 0.05 + w2 * 0.025) * turb;
  float bandF = sin(latW * uBands * 2.0 + uJetPhase * 6.28 + 0.6 * sin(latW * uBands * 0.7));
  float bandG = fbm3(vec3(latW * uBands * 1.3, 0.0, 0.5), 3);
  float t = 0.5 + 0.35 * bandF + 0.3 * bandG + 0.12 * w2 * turb;
  bandShade = bandF;
  vec3 col = palette(t);
  // fine streaks along latitude
  float streak = fbm3(vec3(lon * 12.0 + shift * 10.0, latW * 160.0, 0.0), int(2.0 + detail));
  col *= 0.92 + 0.12 * streak;
  for (int i = 0; i < 3; i++) {
    if (float(i) >= uNumStorms) break;
    vec4 s = uStorm[i];
    vec3 c = vec3(cos(s.y) * cos(s.x), sin(s.x), sin(s.y) * cos(s.x));
    vec3 e = p - c;
    float dd = length(vec2(length(e.xz) / s.w, e.y));
    float m = smoothstep(s.z, s.z * 0.55, dd);
    col = mix(col, uStormCol[i] * (0.85 + 0.25 * w2), m * 0.85);
  }
  // polar haze (and a hexagonal polar jet for some giants)
  float pol = smoothstep(0.85, 1.25, abs(lat));
  if (uHexagon > 0.5 && lat > 1.2) {
    float a = lon + uGiantTime * 0.00002;
    float hex = cos(3.0 * a) * 0.5 + 0.5;
    float edge = smoothstep(0.02, 0.0, abs(lat - (1.36 - 0.03 * hex)));
    col = mix(col, uPolar * 1.3, edge * 0.7);
  }
  col = mix(col, uPolar, pol * 0.75);
  return col;
}
`;

const GIANT_VERT = /* glsl */`
varying vec3 vObj;
varying vec3 vWorld;
varying vec3 vNormalW;
#include <common>
#include <logdepthbuf_pars_vertex>
void main() {
  vObj = normalize(position);
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
  #include <logdepthbuf_vertex>
}
`;

const GIANT_FRAG = /* glsl */`
uniform vec3 uSunDir;
uniform vec3 uSunE;
uniform vec3 uCenter;
uniform float uRadius;
uniform mat3 uToFixed;
uniform float uTime;
uniform vec3 uRingParams; // inner, outer, opacity (0 = none)
uniform float uRingSeed;
varying vec3 vObj;
varying vec3 vWorld;
varying vec3 vNormalW;
#include <common>
#include <logdepthbuf_pars_fragment>
${GLSL_NOISE}
${GLSL_SURFACE_ATMO}
${GLSL_GIANT_BANDS}
float ringDensity(float r);
void main() {
  #include <logdepthbuf_fragment>
  vec3 N = normalize(vNormalW);
  vec3 rel = vWorld - uCenter;
  float dist = length(vWorld);
  float detail = 2.0 * (1.0 - smoothstep(uRadius * 0.5, uRadius * 6.0, dist));
  float bs;
  vec3 col = giantColor(normalize(vObj), detail, bs);
  float muS = dot(N, uSunDir);
  vec3 sunT = atmoSunTransmittance(length(rel), muS);
  // ring shadow: follow the sun ray to the ring plane (body-fixed y = 0)
  if (uRingParams.z > 0.0) {
    vec3 pf = uToFixed * rel;
    vec3 sf = uToFixed * uSunDir;
    if (abs(sf.y) > 1e-4) {
      float t = -pf.y / sf.y;
      if (t > 0.0) {
        float rr = length((pf + sf * t).xz);
        if (rr > uRingParams.x && rr < uRingParams.y) sunT *= 1.0 - 0.85 * ringDensity(rr) * uRingParams.z;
      }
    }
  }
  vec3 skyE = atmoSkyIrradiance(length(rel), muS);
  // Minnaert-style limb darkening on the lit side
  float V = max(dot(N, normalize(-vWorld)), 0.0);
  float lambert = max(muS, 0.0) * pow(V, 0.15);
  vec3 c = col / PI * uSunE * (sunT * lambert + skyE * 0.6);
  gl_FragColor = vec4(c, 1.0);
}
`;

export const GLSL_RING_DENSITY = /* glsl */`
uniform vec4 uRingShape; // inner, outer, gaps, seed
float ringHash(float x) { return fract(sin(x * 127.1 + uRingShape.w) * 43758.5453); }
float ringNoise1(float x) { float i = floor(x), f = fract(x); return mix(ringHash(i), ringHash(i + 1.0), smoothstep(0.0, 1.0, f)); }
float ringDensity(float r) {
  float t = (r - uRingShape.x) / (uRingShape.y - uRingShape.x);
  if (t < 0.0 || t > 1.0) return 0.0;
  float d = 0.55 + 0.25 * ringNoise1(t * 13.0) + 0.15 * ringNoise1(t * 61.0) + 0.1 * ringNoise1(t * 233.0);
  d *= smoothstep(0.0, 0.06, t) * smoothstep(1.0, 0.9, t);
  // inner ring fainter (C-ring-like), main gaps
  d *= mix(0.35, 1.0, smoothstep(0.1, 0.3, t));
  for (int i = 0; i < 4; i++) {
    if (float(i) >= uRingShape.z) break;
    float g = 0.35 + 0.55 * ringHash(float(i) * 7.3 + 1.0);
    float wdt = 0.004 + 0.02 * ringHash(float(i) * 3.1 + 2.0);
    d *= smoothstep(wdt * 0.5, wdt, abs(t - g));
  }
  return clamp(d, 0.0, 1.0);
}
`;

export function giantUniforms(b) {
  const g = b.giant;
  const pal = [];
  for (let i = 0; i < 6; i++) { const c = g.palette[i % g.palette.length]; pal.push(new THREE.Vector3(c[0], c[1], c[2])); }
  const storms = [], scol = [], spin = [];
  for (let i = 0; i < 3; i++) {
    const s = g.storms[i];
    storms.push(new THREE.Vector4(s ? s.lat : 0, s ? s.lon : 0, s ? s.size : 0.01, s ? s.stretch : 1));
    scol.push(new THREE.Vector3(...(s ? s.color : [1, 1, 1])));
    spin.push(s ? s.spin : 1);
  }
  return {
    uPal: { value: pal },
    uBands: { value: g.bands },
    uTurb: { value: g.turbulence },
    uJetPhase: { value: g.jetPhase },
    uEqJet: { value: g.equatorialJet },
    uStorm: { value: storms },
    uStormCol: { value: scol },
    uStormSpin: { value: spin },
    uNumStorms: { value: g.storms.length },
    uPolar: { value: new THREE.Vector3(...g.polarHaze) },
    uHexagon: { value: g.chemistry === 'saturn' ? 1 : 0 },
    uGiantTime: { value: 0 },
  };
}

export function makeGiantMesh(b, shared) {
  const rings = b.data.rings;
  const u = {
    ...shared,
    ...giantUniforms(b),
    uRingParams: { value: new THREE.Vector3(rings ? rings.inner : 0, rings ? rings.outer : 0, rings ? rings.opacity : 0) },
    uRingShape: { value: new THREE.Vector4(rings ? rings.inner : 0, rings ? rings.outer : 1, rings ? rings.gaps : 0, rings ? (rings.seed % 1000) / 10 : 0) },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms: u, vertexShader: GIANT_VERT,
    fragmentShader: GIANT_FRAG.replace('float ringDensity(float r);', GLSL_RING_DENSITY),
  });
  // shared time uniform drives band motion
  u.uGiantTime = shared.uTime;
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(b.R, 192, 96), mat);
  mesh.frustumCulled = false;
  return mesh;
}

const RING_VERT = /* glsl */`
varying vec3 vLocal;
varying vec3 vWorld;
#include <common>
#include <logdepthbuf_pars_vertex>
void main() {
  vLocal = position;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
  #include <logdepthbuf_vertex>
}
`;
const RING_FRAG = /* glsl */`
uniform vec3 uSunDir;
uniform vec3 uSunE;
uniform vec3 uPlanetCenter;
uniform float uPlanetR;
uniform vec3 uRingColor;
uniform float uOpacity;
uniform vec3 uRingNormal;
varying vec3 vLocal;
varying vec3 vWorld;
#include <common>
#include <logdepthbuf_pars_fragment>
${GLSL_RING_DENSITY}
void main() {
  #include <logdepthbuf_fragment>
  float r = length(vLocal.xz);
  float d = ringDensity(r);
  if (d < 0.003) discard;
  // the planet hides ring segments behind it (camera at the origin)
  {
    vec3 dirR = normalize(vWorld);
    float tc = dot(uPlanetCenter, dirR);
    vec3 pp = uPlanetCenter - tc * dirR;
    float h2 = dot(pp, pp);
    float rr = uPlanetR * 0.995;
    if (h2 < rr * rr) {
      float tEnter = tc - sqrt(rr * rr - h2);
      if (tEnter > 0.0 && tEnter < length(vWorld)) discard;
    }
  }
  // planet shadow
  vec3 toP = uPlanetCenter - vWorld;
  float tca = dot(toP, uSunDir);
  float shadow = 1.0;
  if (tca > 0.0) {
    float d2 = dot(toP, toP) - tca * tca;
    shadow = smoothstep(uPlanetR * uPlanetR * 0.97, uPlanetR * uPlanetR * 1.03, d2);
  }
  vec3 V = normalize(-vWorld);
  float muS = abs(dot(uSunDir, uRingNormal));
  bool litSide = dot(uSunDir, uRingNormal) * dot(V, uRingNormal) > 0.0;
  float tau = d * uOpacity * 3.0;
  float alpha = 1.0 - exp(-tau / max(abs(dot(V, uRingNormal)), 0.05));
  float fwd = pow(max(dot(-V, uSunDir), 0.0), 8.0);
  float lit = litSide ? (0.25 + muS) : (0.5 * exp(-tau) + 0.8 * fwd) * (0.2 + muS);
  vec3 c = uRingColor * (0.75 + 0.5 * d) / PI * uSunE * lit * shadow;
  gl_FragColor = vec4(c * alpha, alpha);
}
`;

export function makeRingMesh(b, shared) {
  const r = b.data.rings;
  const geo = new THREE.RingGeometry(r.inner, r.outer, 384, 2);
  geo.rotateX(-Math.PI / 2); // XY -> XZ (equatorial plane, body-fixed y = 0)
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uSunDir: shared.uSunDir, uSunE: shared.uSunE,
      uPlanetCenter: { value: new THREE.Vector3() },
      uPlanetR: { value: b.R },
      uRingColor: { value: new THREE.Vector3(...r.color) },
      uOpacity: { value: r.opacity },
      uRingNormal: { value: new THREE.Vector3(0, 1, 0).applyQuaternion(b.qTilt) },
      uRingShape: { value: new THREE.Vector4(r.inner, r.outer, r.gaps, (r.seed % 1000) / 10) },
    },
    vertexShader: RING_VERT, fragmentShader: RING_FRAG,
    side: THREE.DoubleSide, transparent: true, depthWrite: false,
    blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  return mesh;
}
