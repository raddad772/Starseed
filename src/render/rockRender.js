// The ground's rocks (gen/rocks.js) drawn: one shared icosphere, each rock cut into a block by seven
// planes its seed chooses (or left rounded, by its roundness: river cobbles, erratics), flattened,
// sunk into the ground, and dressed in its rock's scanned material (render/materials.js) by its own
// position, so the texture sits on the stone. Lit as the ground is: the air's light, the clouds',
// the hills' and the near shadows, the sun's gloss by its roughness. Small rocks shrink away first
// (a pebble by ~150 m, a 3 m boulder past a kilometre). They cast the near sun shadows in their own
// shape (userData.shadowMat: sunShadows.js).
import * as THREE from 'three';
import { GLSL_SURFACE_ATMO, GLSL_CLOUD_N, GLSL_CLOUD_SHADOW, GLSL_THERMAL } from './atmosphere.js';
import { GLSL_TERRAIN_SHADOW } from './terrainShadow.js';
import { GLSL_SUN_SHADOW, SHADOW_LAYER, SHADOW_LIGHT_UNIFORMS } from './sunShadows.js';
import { MAT_UNIFORMS, GLSL_MATERIALS, trackMaterial } from './materials.js';
import { ROCK_STRIDE } from '../gen/rocks.js';
import { GLSL_SEASON } from './season.js';

// the shape: shared by the drawn rock and its shadow
const GLSL_ROCK_SHAPE = /* glsl */`
attribute vec4 rA;   // seed, material class, roundness, sink
attribute vec4 rB;   // radius (m), colour r, g, b
attribute float rC;  // the year's mean temperature there (C)
uniform float uRockFar;
float h1(float x) { return fract(sin(x * 91.3458) * 47453.5453); }
vec3 h3(float x) { return vec3(h1(x), h1(x + 17.13), h1(x + 41.71)); }
// local position (unit radius, y up) and normal of this vertex on this rock
void rockShape(vec3 v, out vec3 lp, out vec3 ln) {
  float seed = rA.x, round = rA.z;
  float rr = 1.0;
  vec3 fn = v;
  for (int k = 0; k < 7; k++) {
    vec3 n = normalize(h3(seed * 31.7 + float(k) * 7.13) * 2.0 - 1.0);
    float d = 0.55 + 0.35 * h1(seed * 13.1 + float(k) * 3.7);
    float c = dot(v, n);
    if (c > 0.05) { float t = d / c; if (t < rr) { rr = t; fn = n; } }
  }
  rr = mix(rr, 1.0, round);
  fn = normalize(mix(fn, v, round * 0.85));
  float sy = 0.5 + 0.4 * fract(seed * 7.31);
  lp = v * rr;
  lp.y = lp.y * sy + sy * (1.0 - 2.0 * rA.w);   // (flattened, and sunk: rA.w of its height below)
  ln = normalize(vec3(fn.x, fn.y / sy, fn.z));
}
// how much of it shows at this distance (a small one shrinks away sooner)
float rockShown() {
  vec4 o = modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  float far = uRockFar * (0.02 + 0.4 * rB.x);   // (a 10 cm stone gone by ~90 m, a 3 m boulder past 1.8 km)
  return 1.0 - smoothstep(0.7 * far, far, length(o.xyz));
}
`;

const VERT = /* glsl */`
${GLSL_ROCK_SHAPE}
varying vec3 vWorld;
varying vec3 vLocal;
varying vec3 vLocalN;
varying vec3 vAx;
varying vec3 vAy;
varying vec3 vAz;
varying vec4 vR;
varying vec3 vCol;
varying float vTa;
#include <common>
#include <logdepthbuf_pars_vertex>
void main() {
  vec3 lp, ln;
  rockShape(normalize(position), lp, ln);
  float k = rockShown();
  mat4 M = modelMatrix * instanceMatrix;
  vec4 wp = M * vec4(lp * k, 1.0);
  vWorld = wp.xyz;
  vLocal = lp * rB.x;
  vLocalN = ln;
  mat3 R3 = mat3(M) / rB.x;
  vAx = R3[0]; vAy = R3[1]; vAz = R3[2];
  vR = rA;
  vCol = rB.yzw;
  vTa = rC;
  gl_Position = projectionMatrix * viewMatrix * wp;
  #include <logdepthbuf_vertex>
}
`;

const FRAG = /* glsl */`
uniform vec3 uSunDir;
uniform vec3 uSunE;
uniform vec3 uCenter;
uniform float uRadius;
uniform mat3 uToFixed;
uniform vec4 uCloud;
uniform float uCloudOn;
uniform float uCloudOpacity;
uniform vec3 uAmbientFloor;
uniform sampler3D tNoise;
uniform sampler2D tCloudMap;
uniform float uCloudMapMean;
varying vec3 vWorld;
varying vec3 vLocal;
varying vec3 vLocalN;
varying vec3 vAx;
varying vec3 vAy;
varying vec3 vAz;
varying vec4 vR;
varying vec3 vCol;
varying float vTa;
#include <common>
#include <logdepthbuf_pars_fragment>
${GLSL_SEASON}
${GLSL_SURFACE_ATMO}
${GLSL_CLOUD_N}
${GLSL_CLOUD_SHADOW}
${GLSL_THERMAL}
${GLSL_TERRAIN_SHADOW}
${GLSL_SUN_SHADOW}
#if MAT_MODE > 0
${GLSL_MATERIALS}
#endif
void main() {
  #include <logdepthbuf_fragment>
  float foot = length(fwidth(vWorld));
  vec3 dpx = dFdx(vLocal), dpy = dFdy(vLocal);
  vec3 ln = normalize(vLocalN);
  vec3 albedo = vCol * (0.85 + 0.3 * fract(vR.x * 3.17));
  float rough = 0.85, ao = 1.0;
#if MAT_MODE > 0
  // (its rock's scan, by its own position: the texture sits on the stone)
  MatS ms = matSurf(vR.y, vLocal / MAT_TILE + vR.x * 37.0, dpx / MAT_TILE, dpy / MAT_TILE, ln, 0.0);
  albedo *= ms.ratio;
  ln = ms.n; rough = ms.rough; ao = ms.ao;
#endif
  // (its facets crisp as it's angular: the triangle's own normal, the smooth one as it's rounded;
  // the scan's relief over either)
  vec3 sN = normalize(vAx * vLocalN.x + vAy * vLocalN.y + vAz * vLocalN.z);
  vec3 fN = normalize(cross(dFdx(vWorld), dFdy(vWorld)));
  if (dot(fN, sN) < 0.0) fN = -fN;
  vec3 N = normalize(mix(fN, sN, clamp(vR.z * 1.4, 0.0, 1.0)) + (vAx * ln.x + vAy * ln.y + vAz * ln.z) - sN);
  vec3 rel = vWorld - uCenter;
  float r = length(rel);
  vec3 up = rel / r;
  // the seasons' snow on it (season.js, the ground's snowpack): banked round its foot as deep as the
  // snow lies there (a pebble under it), and on what faces up; thin snow only on its tops
  if (uSeason.z > 0.5) {
    float swe = seasonSWE(uToFixed * up, vTa), cov = 1.0 - exp(-swe / 12.0);
    float depth = min(swe, 3000.0) * SNOW_DEPTH_PER_MM;
    float bank = 1.0 - smoothstep(depth - 0.04, depth + 0.04, vLocal.y);
    float sk = cov * max(bank, smoothstep(0.55, 0.85, dot(N, up)));
    albedo = mix(albedo, uSnowCol, sk);
    rough = mix(rough, 0.75, sk);
    ao = mix(ao, 1.0, sk);
  }
  float muS = dot(up, uSunDir);
  vec3 pF = uToFixed * rel;
  vec3 sunA = atmoSunTransmittance(r, muS), skyE = atmoSkyIrradiance(r, muS);
  vec3 sunT = sunA * cloudLight(rel, r, muS, foot, sunA, skyE) * terrainShadow(pF, normalize(pF), uToFixed * uSunDir, uRadius) * sunShadowMap(vWorld, N);
  float ndl = max(dot(N, uSunDir), 0.0);
  float wrap = 0.5 + 0.5 * dot(N, up);
  vec3 color = albedo / PI * (uSunE * sunT * ndl * mix(1.0, ao, 0.35) + (uSunE * skyE * wrap + uAmbientFloor) * ao);
  vec3 V = normalize(-vWorld), H = normalize(V + uSunDir);
  float rg = clamp(rough, 0.05, 1.0), a2 = rg * rg * rg * rg;
  float NdH = max(dot(N, H), 0.0), NdV = max(dot(N, V), 1e-3), VdH = max(dot(V, H), 0.0);
  float Dg = a2 / (PI * pow(NdH * NdH * (a2 - 1.0) + 1.0, 2.0));
  float kk = (rg + 1.0) * (rg + 1.0) / 8.0;
  float Gg = NdV / (NdV * (1.0 - kk) + kk) * ndl / (ndl * (1.0 - kk) + kk);
  float Fs = 0.04 + 0.96 * pow(1.0 - VdH, 5.0);
  color += uSunE * sunT * Dg * Gg * Fs / (4.0 * NdV);
  if (uThermal.x > 0.0) color += (vec3(1.0) - clamp(albedo, 0.0, 1.0)) * blackbodyGlow(uThermal.x - uThermal.y * (r - uRadius));
  gl_FragColor = vec4(color, 1.0);
}
`;

// (for tools/glslcheck.mjs)
export const ROCK_SHADERS = { get vertexShader() { return VERT; }, get fragmentShader() { return FRAG; } };

// its shadow: the same shape, the distance from the light (sunShadows.js)
const SHADOW_VERT = /* glsl */`
${GLSL_ROCK_SHAPE}
uniform vec3 uLightPos;
uniform vec3 uLightDir;
varying float vD;
void main() {
  vec3 lp, ln;
  rockShape(normalize(position), lp, ln);
  vec4 wp = modelMatrix * instanceMatrix * vec4(lp * rockShown(), 1.0);
  vD = dot(uLightPos - wp.xyz, uLightDir);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;
const SHADOW_FRAG = /* glsl */`
varying float vD;
void main() { gl_FragColor = vec4(vD, 0.0, 0.0, 1.0); }`;

// the shared sphere, its vertices merged (an icosahedron's subdivision repeats them per face)
function rockSphere() {
  const g = new THREE.IcosahedronGeometry(1, 2), p = g.attributes.position, map = new Map(), pos = [], idx = [];
  for (let i = 0; i < p.count; i++) {
    const k = `${Math.round(p.getX(i) * 1e4)},${Math.round(p.getY(i) * 1e4)},${Math.round(p.getZ(i) * 1e4)}`;
    let j = map.get(k);
    if (j === undefined) { j = pos.length / 3; map.set(k, j); pos.push(p.getX(i), p.getY(i), p.getZ(i)); }
    idx.push(j);
  }
  g.dispose();
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  out.setIndex(idx);
  return out;
}

export class RockSet {
  constructor(body, shared) {
    this.body = body;
    this.R = body.R;
    this.clearings = [];
    this.proto = rockSphere();
    const far = { uRockFar: { value: 1500 } };
    this.material = trackMaterial(new THREE.ShaderMaterial({ uniforms: { ...shared, ...MAT_UNIFORMS, ...far }, vertexShader: VERT, fragmentShader: FRAG }));
    this.shadowMat = new THREE.ShaderMaterial({ uniforms: { ...SHADOW_LIGHT_UNIFORMS, ...far }, vertexShader: SHADOW_VERT, fragmentShader: SHADOW_FRAG, side: THREE.DoubleSide });
  }

  // a node's rocks (the flora job's data.geo) as one instanced mesh, or null
  build(data) {
    const a = data.geo;
    if (!a || !a.length) return null;
    const n = a.length / ROCK_STRIDE, o = data.origin;
    // (its own copy of the sphere, ~3 KB: a geometry sharing another's buffers would delete them for
    // all when it's disposed)
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', this.proto.attributes.position.clone());
    g.setIndex(this.proto.index.clone());
    const A = new Float32Array(n * 4), B = new Float32Array(n * 4), C = new Float32Array(n);
    const mesh = new THREE.InstancedMesh(g, this.material, n);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), qr = new THREE.Quaternion(), up = new THREE.Vector3(), pos = new THREE.Vector3(), sc = new THREE.Vector3(), wp = new THREE.Vector3();
    const Y = new THREE.Vector3(0, 1, 0), X = new THREE.Vector3(1, 0, 0);
    for (let i = 0; i < n; i++) {
      const k = i * ROCK_STRIDE;
      wp.set(o[0] + a[k], o[1] + a[k + 1], o[2] + a[k + 2]).setLength(this.R);
      let cleared = false;
      for (const c of this.clearings) if (wp.distanceToSquared(c.pos) < c.r * c.r) { cleared = true; break; }
      pos.set(a[k], a[k + 1], a[k + 2]);
      up.set(o[0] + a[k], o[1] + a[k + 1], o[2] + a[k + 2]).normalize();
      q.setFromUnitVectors(Y, up);
      q.multiply(qr.setFromAxisAngle(Y, a[k + 4]));
      q.multiply(qr.setFromAxisAngle(X, a[k + 5]));
      const rad = cleared ? 0 : a[k + 3];
      m4.compose(pos, q, sc.set(rad, rad, rad));
      mesh.setMatrixAt(i, m4);
      A[i * 4] = a[k + 6]; A[i * 4 + 1] = a[k + 7]; A[i * 4 + 2] = a[k + 8]; A[i * 4 + 3] = a[k + 9];
      B[i * 4] = Math.max(rad, 1e-3); B[i * 4 + 1] = a[k + 10]; B[i * 4 + 2] = a[k + 11]; B[i * 4 + 3] = a[k + 12];
      C[i] = a[k + 13];
    }
    g.setAttribute('rA', new THREE.InstancedBufferAttribute(A, 4));
    g.setAttribute('rB', new THREE.InstancedBufferAttribute(B, 4));
    g.setAttribute('rC', new THREE.InstancedBufferAttribute(C, 1));
    mesh.instanceMatrix.needsUpdate = true;
    mesh.frustumCulled = false;
    mesh.layers.enable(SHADOW_LAYER);
    mesh.userData.kind = 'stone';
    mesh.userData.shadowMat = this.shadowMat;
    mesh.userData.count = n;
    mesh.dispose = ((d) => function () { g.dispose(); return d.call(this); })(mesh.dispose);
    return mesh;
  }

  dispose() { this.proto.dispose(); this.material.dispose(); this.shadowMat.dispose(); }
}
