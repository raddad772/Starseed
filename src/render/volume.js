// Volumetric cloud shell + atmosphere in one ray march (used inside gas
// giants, and near terrestrial cloud layers).
//
// Per sample: gas scattering (transmittance / multi-scatter LUTs from the
// planet's Atmosphere) plus up to three cloud decks. Deck density = Nubis-style
// remap of a Perlin-Worley base shape by a coverage field, eroded by Worley
// detail. Coverage comes from the giant's band structure (zones: thick high
// ammonia ice; belts: holes down to the brown NH4SH deck; deep water deck:
// convective towers) or, on rocky worlds, from weather noise. Sunlight reaching
// a sample is filtered by the gas LUT and by the cloud column above it, so the
// depths below the decks fall into gloom.

import * as THREE from 'three';
import { GLSL_RAY, GLSL_DEPTH, GLSL_ATMO_LUT, FULLSCREEN_VERT } from './glsl.js';
import { GLSL_MEDIUM } from './atmosphere.js';

const FRAG = /* glsl */`
${GLSL_RAY}
${GLSL_DEPTH}
${GLSL_ATMO_LUT}
${GLSL_MEDIUM}
uniform float uGround;
uniform sampler2D tTrans;
uniform sampler2D tMS;
uniform sampler3D tNoise;
uniform sampler2D tColor;
uniform sampler2D tDepth;
uniform sampler2D tCloudMap;
uniform float uCloudMapOn;
uniform vec3 uCenter;
uniform vec3 uSunDir;
uniform vec3 uSunE;
uniform mat3 uCamRot;
uniform vec2 uTanHalf;
uniform mat3 uToFixed;
uniform float uTime;
uniform vec4 uDeck[3];
uniform vec3 uDeckCol[3];
uniform float uNumDecks;
uniform float uMode;
uniform float uSteps;
uniform float uMaxDist;
uniform float uSigma;
uniform vec4 uFlash;
uniform float uBands;
uniform float uJetPhase;
uniform float uEqJet;
uniform float uWindMax;
uniform vec3 uPal[6];
uniform float uFade;
uniform vec2 uShape;   // base shape scale, detail scale (metres)
layout(location = 0) out highp vec4 outL;
layout(location = 1) out highp vec4 outT;
uniform float uT1;      // temperature at the 1-bar level (K)
uniform float uLapse;   // K per metre below it (dry adiabat)
uniform float uGlow;    // thermal glow strength (0 on rocky worlds)
varying vec2 vUv;

// dull red -> orange incandescence of hot deep gas (stylised blackbody)
vec3 thermalGlow(float h) {
  float T = uT1 - uLapse * min(h, 0.0);
  float k = pow(max(0.0, (T - 560.0) / 700.0), 2.6);
  vec3 c = mix(vec3(1.0, 0.18, 0.04), vec3(1.0, 0.45, 0.12), clamp((T - 800.0) / 600.0, 0.0, 1.0));
  return c * k * 3.0e-3 * uGlow;
}

vec3 transmittanceToTop(float r, float mu) {
  vec2 uv = transmittanceUV(clamp(r, uBottom, uTop), mu);
  uv = vec2(0.5 / 256.0, 0.5 / 64.0) + uv * vec2(255.0 / 256.0, 63.0 / 64.0);
  return texture(tTrans, uv).rgb;
}
vec3 sunTransmittance(float r, float mu) {
  float sinH = uGround / max(r, uGround);
  float cosH = -sqrt(max(0.0, 1.0 - sinH * sinH));
  return transmittanceToTop(r, mu) * smoothstep(cosH - 0.004, cosH + 0.004, mu);
}
vec3 multiScatter(float r, float muS) {
  vec2 uv = clamp(vec2(muS * 0.5 + 0.5, (r - uBottom) / (uTop - uBottom)), 0.0, 1.0);
  return texture(tMS, vec2(0.5 / 32.0) + uv * (31.0 / 32.0)).rgb;
}
float ign(vec2 p) { return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }
float hg(float c, float g) { float g2 = g * g; return (1.0 - g2) / (4.0 * PI_A * pow(max(1.0 + g2 - 2.0 * g * c, 1e-4), 1.5)); }

vec3 palette(float t) {
  t = clamp(t, 0.0, 1.0) * 5.0;
  float i = floor(t), f = smoothstep(0.0, 1.0, fract(t));
  vec3 a = uPal[0], b = uPal[1];
  if (i < 1.0) { a = uPal[0]; b = uPal[1]; } else if (i < 2.0) { a = uPal[1]; b = uPal[2]; }
  else if (i < 3.0) { a = uPal[2]; b = uPal[3]; } else if (i < 4.0) { a = uPal[3]; b = uPal[4]; } else { a = uPal[4]; b = uPal[5]; }
  return mix(a, b, f);
}

// coverage of deck i (0..1) at body-fixed point q (metres) with direction dirF
float coverage(int i, vec3 dirF, vec3 q) {
  float lat = asin(clamp(dirF.y, -1.0, 1.0));
  if (uMode < 0.5) {
    float band = sin(lat * uBands * 2.0 + uJetPhase * 6.2832 + 0.6 * sin(lat * uBands * 0.7));
    float n = texture(tNoise, q / 70000.0).r - 0.5;
    if (i == 0) return smoothstep(-0.1, 0.7, band * 0.8 + n * 1.3 + uDeck[0].w);
    if (i == 1) return smoothstep(-0.45, 0.45, n * 1.5 + 0.1 + uDeck[1].w);
    return smoothstep(0.2, 0.62, texture(tNoise, q / 42000.0 + 0.37).g + uDeck[2].w);
  }
  float n = texture(tNoise, q / 140000.0).r * 0.6 + texture(tNoise, q / 33000.0 + 0.5).r * 0.4;
  float hadley = 0.12 * cos(abs(lat) * 6.0);
  // (with the simulated climate's cloud map: its cover moves the clouds where it rains)
  if (uCloudMapOn > 0.5) hadley = (texture(tCloudMap, vec2(atan(dirF.z, dirF.x) / 6.2832 + 0.5, lat / 3.14159 + 0.5)).r - 0.5) * 0.6;
  return smoothstep(0.6 - uDeck[i].w, 0.8 - uDeck[i].w, n + hadley);
}

// wind-advected body-fixed sample position
vec3 cloudCoord(vec3 p, float r, out vec3 dirF, out float lat) {
  vec3 pf = uToFixed * p;
  dirF = pf / r;
  lat = asin(clamp(dirF.y, -1.0, 1.0));
  float U = uWindMax * (sin(lat * uBands * 2.0 + uJetPhase * 6.2832) + uEqJet * exp(-lat * lat * 40.0));
  vec3 east = normalize(vec3(-dirF.z, 0.0, dirF.x) + vec3(1e-6, 0.0, 0.0));
  return pf + east * U * uTime;
}

// density of deck i at q (height h); cov precomputed; detail adds erosion
float deckDensity(int i, vec3 q, float h, float cov, bool detail, out float frac) {
  vec4 dk = uDeck[i];
  float base = texture(tNoise, q / uShape.x).r;
  float tower = texture(tNoise, q / (uShape.x * 4.0) + 0.21).g;
  // the deck top rises and falls: convective towers and troughs
  float top = dk.y - (dk.y - dk.x) * 0.55 * (1.0 - tower);
  float x = (h - dk.x) / max(top - dk.x, 1.0);
  frac = clamp(x, 0.0, 1.0);
  if (x < 0.0 || x > 1.0) return 0.0;
  float prof = smoothstep(0.0, 0.08, x) * smoothstep(1.0, 0.6, x);
  float d = clamp((base * prof - (1.0 - cov)) / max(cov, 0.05), 0.0, 1.0);
  if (detail && d > 0.001) {
    vec4 det = texture(tNoise, q / uShape.y);
    float er = (det.g * 0.625 + det.b * 0.25 + det.a * 0.125) * 0.55 * (1.0 - d);
    d = clamp((d - er) / max(1.0 - er, 0.05), 0.0, 1.0);
  }
  return d * dk.z;
}

void main() {
  vec2 ndc = vUv * 2.0 - 1.0;
  vec3 dView = normalize(vec3(ndc.x * uTanHalf.x, ndc.y * uTanHalf.y, -1.0));
  vec3 D = normalize(uCamRot * dView);
  float depth = texture(tDepth, vUv).r;
  float sceneDist = isSkyDepth(depth) ? 1e30 : viewZFromDepth(depth) / max(-dView.z, 1e-4);
  vec2 hit = raySphere(uCenter, uTop, D);
  if (hit.y <= 0.0 || hit.x > hit.y) { outL = vec4(0.0); outT = vec4(1.0); return; }
  float tca = dot(uCenter, D);
  vec3 perp = uCenter - tca * D;
  float t0 = max(hit.x, 0.0);
  float t1 = min(min(hit.y, sceneDist), t0 + uMaxDist * 4.0);
  vec2 gh = raySphere(uCenter, uGround, D);
  if (gh.y > 0.0 && gh.x < gh.y && gh.x > 0.0) t1 = min(t1, gh.x);

  // cloud shell [R + lowest base, R + highest top]
  float sb = 1e9, st = -1e9;
  for (int i = 0; i < 3; i++) { if (float(i) >= uNumDecks) break; sb = min(sb, uDeck[i].x); st = max(st, uDeck[i].y); }
  float rB = uRadius + sb, rT = uRadius + st;
  float camR = length(uCenter);
  vec2 hT = raySphere(uCenter, rT, D);
  vec2 hB = raySphere(uCenter, rB, D);
  float tIn, tOut;
  bool hasB = hB.y > 0.0 && hB.x < hB.y;
  if (camR > rT) { tIn = hT.x; tOut = hasB && hB.x > 0.0 ? hB.x : hT.y; }
  else if (camR > rB) { tIn = 0.0; tOut = hasB && hB.x > 0.0 ? hB.x : hT.y; }
  else { tIn = hasB ? hB.y : 1e30; tOut = hT.y; }
  if (hT.y <= 0.0 || hT.x > hT.y) { tIn = 1e30; tOut = 1e30; }
  tIn = clamp(tIn, t0, t1);
  tOut = clamp(min(tOut, tIn + uMaxDist), tIn, t1);

  float cosT = dot(D, uSunDir);
  float pR = phaseRayleigh(cosT), pM = phaseMie(cosT, uMieG);
  float pC = mix(hg(cosT, 0.62), hg(cosT, -0.22), 0.3);
  float jitter = ign(gl_FragCoord.xy);
  vec3 L = vec3(0.0), T = vec3(1.0);
  vec3 Lth = vec3(0.0);
  vec3 sunDirF = uToFixed * uSunDir;

  for (int seg = 0; seg < 3; seg++) {
    float a = seg == 0 ? t0 : (seg == 1 ? tIn : tOut);
    float b = seg == 0 ? tIn : (seg == 1 ? tOut : t1);
    if (b <= a + 1.0) continue;
    int N = seg == 1 ? int(uSteps) : 18;
    float dt = (b - a) / float(N);
    for (int i = 0; i < 96; i++) {
      if (i >= N) break;
      float t = a + (float(i) + jitter) * dt;
      vec3 p = (t - tca) * D - perp;
      float r = length(p);
      float h = r - uRadius;
      vec3 sR, sM, e;
      mediumAt(r, sR, sM, e);
      float muS = dot(p, uSunDir) / r;
      vec3 ext = e;
      float tauAbove = 0.0;
      float cd = 0.0, frac = 0.5;
      vec3 cc = vec3(1.0);
      vec3 dirF; float lat;
      vec3 q = cloudCoord(p, r, dirF, lat);
      for (int k = 0; k < 3; k++) {
        if (float(k) >= uNumDecks) break;
        vec4 dk = uDeck[k];
        if (h > dk.y) continue;
        float cov = coverage(k, dirF, q);
        if (h < dk.x) { tauAbove += dk.z * cov * (dk.y - dk.x) * 0.4 * uSigma; continue; }
        if (seg != 1) continue;
        float fr;
        float d = deckDensity(k, q, h, cov, true, fr);
        tauAbove += dk.z * cov * (dk.y - h) * 0.25 * uSigma;
        if (d > cd) {
          cd = d; frac = fr; cc = uDeckCol[k];
          if (uMode < 0.5 && k == 0) cc = mix(cc, palette(0.5 + 0.35 * sin(lat * uBands * 2.0 + uJetPhase * 6.2832)), 0.55);
          // short light march toward the sun through this deck: directional self-shadowing
          float tl = 0.0;
          float ds = 350.0;
          vec3 qs = q;
          for (int j = 0; j < 3; j++) {
            qs += sunDirF * ds;
            float hs = h + muS * ds * float(j + 1);
            float frs;
            tl += deckDensity(k, qs, hs, cov, false, frs) * ds;
            ds *= 3.2;
          }
          tauAbove += tl * uSigma * 0.8;
        }
      }
      tauAbove /= max(muS, 0.06);
      float shade = exp(-tauAbove);
      vec3 sunT = sunTransmittance(r, muS) * shade;
      vec3 ms = multiScatter(r, muS) * (0.2 + 0.8 * shade);
      vec3 S = sR * (sunT * pR + ms) + sM * (sunT * pM + ms);
      if (cd > 0.0) {
        float sc = cd * uSigma;
        // multiple scattering inside clouds: soft fill that keeps shadows from going black
        vec3 amb = ms * 14.0 * mix(0.45, 1.0, frac) + sunTransmittance(r, muS) * 0.05 * (0.3 + 0.7 * frac);
        // powder: thin cloud edges facing the sun are brighter than dense cores
        float powder = 1.0 - exp(-cd * 3.0);
        S += sc * cc * (sunT * pC * (0.6 + 0.8 * powder) + amb);
        ext += vec3(sc);
        if (uFlash.w > 0.0) {
          vec3 fd = p + uCenter - uFlash.xyz;
          S += sc * vec3(0.75, 0.82, 1.0) * uFlash.w * exp(-dot(fd, fd) / 6.0e7);
        }
      }
      vec3 Ts = exp(-ext * dt);
      L += T * (S - S * Ts) / max(ext, vec3(1e-12));
      if (uGlow > 0.0 && h < -20000.0) Lth += T * thermalGlow(h) * (vec3(1.0) - Ts);
      T *= Ts;
      if (max(T.x, max(T.y, T.z)) < 0.003) { T = vec3(0.0); break; }
    }
  }
  // the ray ends in the opaque deep haze: it glows at that depth's temperature
  if (uGlow > 0.0 && max(T.x, max(T.y, T.z)) < 0.01) {
    vec3 pe = (t1 - tca) * D - perp;
    Lth += T * thermalGlow(length(pe) - uRadius);
  }
  outL = vec4(L * uSunE + Lth, 1.0);
  outT = vec4(T, 1.0);
}
`;

// Full-resolution composite of the half-resolution volume (L, T) with a
// depth-aware bilateral upsample.
export const VOLUME_COMPOSITE_FRAG = /* glsl */`
${GLSL_DEPTH}
uniform sampler2D tColor;
uniform sampler2D tDepth;
uniform sampler2D tL;
uniform sampler2D tT;
uniform vec2 uLowSize;
varying vec2 vUv;
float linZ(vec2 uv) {
  float d = texture(tDepth, uv).r;
  return isSkyDepth(d) ? 1e12 : viewZFromDepth(d);
}
void main() {
  vec4 scene = texture(tColor, vUv);
  float z0 = linZ(vUv);
  vec2 p = vUv * uLowSize - 0.5;
  vec2 i = floor(p), f = p - i;
  vec3 L = vec3(0.0), T = vec3(0.0);
  float wsum = 0.0;
  for (int k = 0; k < 4; k++) {
    vec2 c = vec2(float(k & 1), float(k >> 1));
    vec2 uv = (i + c + 0.5) / uLowSize;
    float zc = linZ(uv);
    float wb = (c.x > 0.5 ? f.x : 1.0 - f.x) * (c.y > 0.5 ? f.y : 1.0 - f.y);
    float wd = 1.0 / (1e-3 + abs(z0 - zc) / max(z0, 1e-3));
    float w = wb * wd + 1e-6;
    L += texture(tL, uv).rgb * w;
    T += texture(tT, uv).rgb * w;
    wsum += w;
  }
  L /= wsum; T /= wsum;
  gl_FragColor = vec4(scene.rgb * T + L, scene.a);
}
`;

export class VolumePass {
  constructor(body, atmo, noiseTex, mode) {
    this.body = body;
    this.atmo = atmo;
    const d = body.data;
    const decks = [];
    if (mode === 0) {
      for (const dk of d.giant.decks.slice(0, 3)) {
        const base = dk.altitude - dk.thickness * 0.55, top = dk.altitude + dk.thickness * 0.45;
        decks.push({ base, top, density: Math.min(1, 0.55 + 0.3 * dk.density), bias: 0, color: dk.color });
      }
    } else {
      const c = d.atmosphere.clouds;
      decks.push({ base: c.altitude - c.thickness * 0.35, top: c.altitude + c.thickness * 0.65, density: 0.9, bias: (c.cover - 0.5) * 0.3, color: c.color });
    }
    const u = {
      ...atmo.params,
      tTrans: { value: atmo.trans.texture },
      tMS: { value: atmo.ms.texture },
      tNoise: { value: noiseTex },
      tColor: { value: null }, tDepth: { value: null },
      tCloudMap: { value: atmo.material.uniforms.tCloudMap ? atmo.material.uniforms.tCloudMap.value : null }, uCloudMapOn: { value: 0 },
      uCenter: { value: new THREE.Vector3() },
      uSunDir: { value: new THREE.Vector3(1, 0, 0) },
      uSunE: { value: new THREE.Vector3(1, 1, 1) },
      uCamRot: { value: new THREE.Matrix3() },
      uTanHalf: { value: new THREE.Vector2(1, 1) },
      uToFixed: { value: new THREE.Matrix3() },
      uTime: { value: 0 },
      uDeck: { value: [0, 1, 2].map((i) => decks[i] ? new THREE.Vector4(decks[i].base, decks[i].top, decks[i].density, decks[i].bias) : new THREE.Vector4()) },
      uDeckCol: { value: [0, 1, 2].map((i) => decks[i] ? new THREE.Vector3(...decks[i].color) : new THREE.Vector3(1, 1, 1)) },
      uNumDecks: { value: decks.length },
      uMode: { value: mode },
      uSteps: { value: mode === 0 ? 44 : 40 },
      uMaxDist: { value: mode === 0 ? 260000 : 120000 },
      uSigma: { value: mode === 0 ? 0.0012 : 0.003 },
      uFlash: { value: new THREE.Vector4(0, 0, 0, 0) },
      uBands: { value: d.giant ? d.giant.bands : 3 },
      uJetPhase: { value: d.giant ? d.giant.jetPhase : 0 },
      uEqJet: { value: d.giant ? d.giant.equatorialJet : 0 },
      uWindMax: { value: d.giant ? d.giant.windMax : 12 },
      uPal: { value: [0, 1, 2, 3, 4, 5].map((i) => { const p = d.giant ? d.giant.palette[i % d.giant.palette.length] : [1, 1, 1]; return new THREE.Vector3(p[0], p[1], p[2]); }) },
      uFade: { value: 1 },
      uShape: { value: new THREE.Vector2(mode === 0 ? 13000 : 4200, mode === 0 ? 2100 : 850) },
      uT1: { value: d.giant ? d.giant.T1bar : 288 },
      uLapse: { value: d.giant ? d.giant.lapse : 0 },
      uGlow: { value: d.giant ? 1 : 0 },
      uDepthMode: { value: 0 }, uNear: { value: 0.05 }, uFar: { value: 1e13 }, uLogDepthFC: { value: 1 },
    };
    this.decks = decks;
    this.material = new THREE.ShaderMaterial({ uniforms: u, vertexShader: FULLSCREEN_VERT, fragmentShader: FRAG, depthTest: false, depthWrite: false, glslVersion: THREE.GLSL3 });
    this.halfRes = true;
    this.flashT = 0;
    this.nextFlash = 2;
  }

  // lightning in the deepest deck (giants with convective water clouds)
  updateLightning(dt, camRelCenter) {
    const u = this.material.uniforms;
    if (!this.body.data.giant || !this.body.data.giant.lightning || this.decks.length < 3) { u.uFlash.value.w = 0; return 0; }
    this.nextFlash -= dt;
    if (this.nextFlash <= 0) {
      this.nextFlash = 0.6 + Math.random() * 4.5;
      this.flashT = 0.35;
      const dk = this.decks[2];
      // a point in the water deck within ~40 km of the camera
      const up = camRelCenter.clone().negate().normalize();
      const t1 = new THREE.Vector3(1, 0, 0).cross(up).normalize(), t2 = up.clone().cross(t1);
      const a = Math.random() * Math.PI * 2, rr = 5000 + Math.random() * 35000;
      const pos = up.clone().multiplyScalar(this.body.R + (dk.base + dk.top) / 2).addScaledVector(t1, Math.cos(a) * rr).addScaledVector(t2, Math.sin(a) * rr);
      u.uFlash.value.set(pos.x + camRelCenter.x, pos.y + camRelCenter.y, pos.z + camRelCenter.z, 0);
      this.flashPosRel = pos;
    }
    if (this.flashT > 0) {
      this.flashT -= dt;
      const k = Math.max(0, this.flashT / 0.35);
      const flick = (Math.sin(this.flashT * 90) > -0.2 ? 1 : 0.25);
      u.uFlash.value.w = k * k * flick * 0.006;
      if (this.flashPosRel) u.uFlash.value.set(this.flashPosRel.x + camRelCenter.x, this.flashPosRel.y + camRelCenter.y, this.flashPosRel.z + camRelCenter.z, u.uFlash.value.w);
      return u.uFlash.value.w;
    }
    u.uFlash.value.w = 0;
    return 0;
  }
}
