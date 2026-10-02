// Physically based atmospheric scattering (after Hillaire 2020, "A Scalable
// and Production Ready Sky and Atmosphere Rendering Technique").
//
// Per atmosphere, three small LUTs are rendered once on the GPU:
//   transmittance  T(r, mu)               256 x 64
//   multi-scatter  Psi_ms(r, mu_sun)       32 x 32   (infinite-order isotropic approximation)
//   irradiance     E_sky(r, mu_sun)        64 x 16   (ambient light for surfaces)
// The composite pass then ray-marches every pixel through the atmosphere up to
// the scene depth, attenuating the scene and adding in-scattered light; this
// gives skies, sunsets, aerial perspective and the limb glow seen from orbit
// with one shader. A 2D cloud shell is integrated in the same march.

import * as THREE from 'three';
import { GLSL_RAY, GLSL_DEPTH, GLSL_ATMO_LUT, GLSL_NOISE, FULLSCREEN_VERT } from './glsl.js';

export const GLSL_MEDIUM = /* glsl */`
uniform float uRadius;      // datum radius (h = r - uRadius)
uniform vec3 uRayleigh;
uniform float uRayleighH;
uniform vec3 uMie;
uniform vec3 uMieAbs;
uniform float uMieH;
uniform float uMieG;
uniform vec3 uAbs;
uniform float uAbsCenter;
uniform float uAbsWidth;
uniform float uAbsExp;
// ground haze (bodies.js atmosphereRender): x scattering at the datum (1/m), y its scale height
// (m), z its absorption as a share of that. Thin, so it hardly touches the sky straight up but
// fades the far ground (the game draws worlds at a tenth of their size with air of real
// density and height: without it a ridge that looks 50 km off has only 5 km of air before it)
uniform vec4 uHaze;
const float PI_A = 3.14159265358979;
void mediumAt(float r, out vec3 scatR, out vec3 scatM, out vec3 ext) {
  float h = r - uRadius;
  float dR = exp(-h / uRayleighH);
  float dM = exp(-h / uMieH);
  float dA = uAbsExp > 0.5 ? dR : max(0.0, 1.0 - abs(h - uAbsCenter) / max(uAbsWidth, 1.0));
  float dH = uHaze.x * exp(-max(h, 0.0) / max(uHaze.y, 1.0));
  scatR = uRayleigh * dR;
  scatM = uMie * dM + vec3(dH);
  ext = scatR + scatM + uMieAbs * dM + uAbs * dA + vec3(dH * uHaze.z);
}
float phaseRayleigh(float c) { return 3.0 / (16.0 * PI_A) * (1.0 + c * c); }
float phaseMie(float c, float g) {
  float g2 = g * g;
  return 3.0 / (8.0 * PI_A) * ((1.0 - g2) * (1.0 + c * c)) / ((2.0 + g2) * pow(max(1.0 + g2 - 2.0 * g * c, 1e-4), 1.5));
}
// distance to the top of the atmosphere from radius r along direction cosine mu
float distToTop(float r, float mu) {
  float disc = r * r * (mu * mu - 1.0) + uTop * uTop;
  return max(0.0, -r * mu + sqrt(max(disc, 0.0)));
}
bool hitsGround(float r, float mu, float gr) {
  return mu < 0.0 && r * r * (mu * mu - 1.0) + gr * gr >= 0.0;
}
`;

const LUT_COMMON = GLSL_ATMO_LUT + GLSL_MEDIUM;

const TRANSMITTANCE_FRAG = /* glsl */`
${LUT_COMMON}
varying vec2 vUv;
void main() {
  float H = sqrt(uTop * uTop - uBottom * uBottom);
  float rho = H * vUv.y;
  float r = sqrt(rho * rho + uBottom * uBottom);
  float dMin = uTop - r, dMax = rho + H;
  float d = dMin + vUv.x * (dMax - dMin);
  float mu = d < 1e-3 ? 1.0 : clamp((H * H - rho * rho - d * d) / (2.0 * r * d), -1.0, 1.0);
  float len = distToTop(r, mu);
  const int N = 48;
  vec3 od = vec3(0.0);
  float dt = len / float(N);
  for (int i = 0; i < N; i++) {
    float t = (float(i) + 0.5) * dt;
    float rr = sqrt(r * r + t * t + 2.0 * r * mu * t);
    vec3 sR, sM, e;
    mediumAt(rr, sR, sM, e);
    od += e * dt;
  }
  gl_FragColor = vec4(exp(-od), 1.0);
}
`;

const SAMPLE_TRANS = /* glsl */`
uniform sampler2D tTrans;
vec3 transmittanceToTop(float r, float mu) {
  vec2 uv = transmittanceUV(clamp(r, uBottom, uTop), mu);
  uv = vec2(0.5 / 256.0, 0.5 / 64.0) + uv * vec2(255.0 / 256.0, 63.0 / 64.0);
  return texture(tTrans, uv).rgb;
}
// sunlight reaching radius r with sun zenith cosine mu, incl. the planet's shadow
vec3 sunTransmittance(float r, float mu) {
  float sinH = uGround / max(r, uGround);
  float cosH = -sqrt(max(0.0, 1.0 - sinH * sinH));
  float vis = smoothstep(cosH - 0.004, cosH + 0.004, mu);
  return transmittanceToTop(r, mu) * vis;
}
`;

const MS_FRAG = /* glsl */`
${LUT_COMMON}
uniform float uGround;
uniform vec3 uGroundAlbedo;
${SAMPLE_TRANS}
varying vec2 vUv;
void main() {
  float muS = vUv.x * 2.0 - 1.0;
  float r = uBottom + (uTop - uBottom) * clamp(vUv.y, 0.002, 0.998);
  vec3 sunDir = vec3(0.0, muS, sqrt(max(0.0, 1.0 - muS * muS)));
  vec3 pos = vec3(0.0, r, 0.0);
  const int SQ = 8;
  const int STEPS = 20;
  vec3 lumTotal = vec3(0.0), fms = vec3(0.0);
  for (int i = 0; i < SQ; i++) {
    for (int j = 0; j < SQ; j++) {
      float th = 2.0 * PI_A * (float(i) + 0.5) / float(SQ);
      float ph = acos(1.0 - 2.0 * (float(j) + 0.5) / float(SQ));
      vec3 dir = vec3(cos(th) * sin(ph), cos(ph), sin(th) * sin(ph));
      float mu = dir.y;
      float tMax = distToTop(r, mu);
      bool ground = hitsGround(r, mu, uGround);
      if (ground) tMax = -r * mu - sqrt(max(0.0, r * r * (mu * mu - 1.0) + uGround * uGround));
      float dt = tMax / float(STEPS);
      vec3 thr = vec3(1.0), L = vec3(0.0), MS = vec3(0.0);
      for (int s = 0; s < STEPS; s++) {
        float t = (float(s) + 0.5) * dt;
        vec3 p = pos + dir * t;
        float rr = length(p);
        vec3 sR, sM, e;
        mediumAt(rr, sR, sM, e);
        vec3 sct = sR + sM;
        vec3 Ts = exp(-e * dt);
        vec3 sunT = sunTransmittance(rr, dot(p / rr, sunDir));
        vec3 S = sct * sunT / (4.0 * PI_A);
        vec3 eSafe = max(e, vec3(1e-12));
        L += thr * (S - S * Ts) / eSafe;
        MS += thr * (sct - sct * Ts) / eSafe;
        thr *= Ts;
      }
      if (ground) {
        vec3 p = pos + dir * tMax;
        vec3 n = normalize(p);
        vec3 sunT = sunTransmittance(length(p), dot(n, sunDir));
        L += thr * sunT * max(dot(n, sunDir), 0.0) * uGroundAlbedo / PI_A;
      }
      lumTotal += L / float(SQ * SQ);
      fms += MS / float(SQ * SQ);
    }
  }
  vec3 psi = lumTotal / max(vec3(1.0) - fms, vec3(1e-3));
  gl_FragColor = vec4(psi, 1.0);
}
`;

const SAMPLE_MS = /* glsl */`
uniform sampler2D tMS;
vec3 multiScatter(float r, float muS) {
  vec2 uv = vec2(muS * 0.5 + 0.5, (r - uBottom) / (uTop - uBottom));
  uv = clamp(uv, vec2(0.0), vec2(1.0));
  uv = vec2(0.5 / 32.0) + uv * (31.0 / 32.0);
  return texture(tMS, uv).rgb;
}
`;

const IRRADIANCE_FRAG = /* glsl */`
${LUT_COMMON}
uniform float uGround;
uniform vec3 uGroundAlbedo;
${SAMPLE_TRANS}
${SAMPLE_MS}
varying vec2 vUv;
// Sky irradiance on a horizontal surface at radius r (per unit sun illuminance)
void main() {
  float muS = vUv.x * 2.0 - 1.0;
  float r = uGround + (uTop - uGround) * clamp(vUv.y, 0.0, 1.0) + 1.0;
  vec3 sunDir = vec3(0.0, muS, sqrt(max(0.0, 1.0 - muS * muS)));
  vec3 pos = vec3(0.0, r, 0.0);
  vec3 E = vec3(0.0);
  const int NA = 8, NB = 6, STEPS = 14;
  for (int a = 0; a < NA; a++) {
    for (int b = 0; b < NB; b++) {
      float th = 2.0 * PI_A * (float(a) + 0.5) / float(NA);
      float ct = (float(b) + 0.5) / float(NB); // cosine-weighted bands
      float st = sqrt(1.0 - ct * ct);
      vec3 dir = vec3(cos(th) * st, ct, sin(th) * st);
      float tMax = distToTop(r, ct);
      float dt = tMax / float(STEPS);
      vec3 thr = vec3(1.0), L = vec3(0.0);
      float cs = dot(dir, sunDir);
      for (int s = 0; s < STEPS; s++) {
        float t = (float(s) + 0.5) * dt;
        vec3 p = pos + dir * t;
        float rr = length(p);
        vec3 sR, sM, e;
        mediumAt(rr, sR, sM, e);
        vec3 Ts = exp(-e * dt);
        float mus = dot(p / rr, sunDir);
        vec3 sunT = sunTransmittance(rr, mus);
        vec3 ms = multiScatter(rr, mus);
        vec3 S = sR * (sunT * phaseRayleigh(cs) + ms) + sM * (sunT * phaseMie(cs, uMieG) + ms);
        vec3 eSafe = max(e, vec3(1e-12));
        L += thr * (S - S * Ts) / eSafe;
        thr *= Ts;
      }
      // integral of L cos over the hemisphere: cosine-weighted stratification
      E += L * ct * (2.0 * PI_A / float(NA)) * (1.0 / float(NB)) * (1.0 / max(ct, 1e-3)) * ct;
    }
  }
  gl_FragColor = vec4(E, 1.0);
}
`;

// ---------------------------------------------------------------- composite pass

// the air's own light (bodies.js airGlow), for the atmosphere pass and the volumetric one.
// Airglow: a thin layer, marched with the sky (airLight). Aurora: thin arcs along each
// magnetic pole's oval, their latitude wandering with longitude and drifting, fine rays along
// them, a sharp lower edge and a glow fading up (green low and red high for oxygen); a faint
// glow all over without a field. It's drawn as a stack of thin shells, each read exactly where
// the ray crosses it (auroraRay), so the arcs stay sharp and the rays stand vertical. Strengths
// are vertical radiances per unit of the shell's thickness. Needs uRadius, uTop, uToFixed,
// uTime and tNoise declared before it
export const GLSL_AIRLIGHT = `
uniform vec4 uAurora;      // aurora strength, oval latitude, oval width (rad); airglow strength
uniform vec3 uAuroraLo;
uniform vec3 uAuroraHi;
uniform vec3 uAirglowCol;
uniform vec3 uMagAxis;     // in the body's frame
vec3 airLight(vec3 p, float r) {
  if (uAurora.w <= 0.0) return vec3(0.0);
  float hgt = (r - uRadius) / (uTop - uRadius);
  return uAurora.w * exp(-pow((hgt - 0.6) / 0.03, 2.0)) * uAirglowCol / (uTop - uRadius);
}
// the aurora's brightness at a body-fixed direction
float auroraArcs(vec3 pf) {
  float ml = asin(clamp(dot(pf, uMagAxis), -1.0, 1.0)), aml = abs(ml);
  if (uAurora.y < 0.0) return 0.3 * texture(tNoise, pf * 3.0 + vec3(0.0, 0.0, uTime * 0.002)).r;
  float band = exp(-pow((aml - uAurora.y) / uAurora.z, 2.0));
  if (band < 0.02) return 0.0;
  vec3 e1 = normalize(cross(uMagAxis, abs(uMagAxis.z) < 0.9 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0)));
  vec3 e2 = cross(uMagAxis, e1);
  float mlon = atan(dot(pf, e2), dot(pf, e1));
  vec2 cs = vec2(cos(mlon), sin(mlon));
  float side = ml > 0.0 ? 0.0 : 5.3;
  float b = 0.0;
  for (int j = 0; j < 2; j++) {
    float fj = float(j);
    float wig = texture(tNoise, vec3(cs * 0.6, side + fj * 2.7 + uTime * 0.0015)).r - 0.5;
    wig += 0.45 * (texture(tNoise, vec3(cs * 2.3, side + fj * 1.3 + uTime * 0.004)).r - 0.5);
    float lineLat = uAurora.y + (fj - 0.5) * uAurora.z * 0.9 + wig * uAurora.z * 2.2;
    float d = (aml - lineLat) / (uAurora.z * 0.035);
    float arc = exp(-d * d);
    if (arc < 0.01) continue;
    float rays = texture(tNoise, vec3(cs * 5.0, side + fj * 0.61 + uTime * 0.02)).r;
    b += arc * (0.25 + 1.8 * rays * rays);
  }
  return b * band;
}
// the aurora along a ray (p = (t - tca) D - perp from the planet's centre), up to tMax: near,
// where the ray crosses the shells coming in (the air between is thin), and far, beyond its
// lowest point (the caller dims it by what lies between)
void auroraRay(vec3 D, float tca, vec3 perp, float tMax, float jitter, out vec3 near, out vec3 far) {
  near = vec3(0.0); far = vec3(0.0);
  if (uAurora.x <= 0.0) return;
  float H = uTop - uRadius, aLo = uRadius + 0.55 * H, aHi = uRadius + 0.98 * H;
  float pp = dot(perp, perp);
  if (pp >= aHi * aHi) return;
  const int K = 28;
  float slab = (aHi - aLo) / float(K);
  for (int i = 0; i < K; i++) {
    float x = (float(i) + jitter) / float(K);
    float a = mix(aLo, aHi, x);
    if (pp >= a * a) continue;
    float s = sqrt(a * a - pp);
    float prof = smoothstep(0.0, 0.04, x) * exp(-2.5 * x);
    vec3 col = mix(uAuroraLo, uAuroraHi, smoothstep(0.3, 0.85, x)) * prof * uAurora.x / H;
    for (int k = 0; k < 2; k++) {
      float t = k == 0 ? tca - s : tca + s;
      if (t <= 0.0 || t >= tMax) continue;
      vec3 p = (t - tca) * D - perp;
      float mu = (t - tca) / a;
      float b = auroraArcs(uToFixed * (p / a));
      if (b <= 0.0) continue;
      vec3 e = col * b * slab / max(abs(mu), 0.04);
      if (k == 0) near += e; else far += e;
    }
  }
}
`;

const PASS_FRAG = /* glsl */`
${GLSL_RAY}
${GLSL_DEPTH}
${LUT_COMMON}
uniform float uGround;
${SAMPLE_TRANS}
${SAMPLE_MS}
${GLSL_NOISE}
uniform sampler2D tColor;
uniform sampler2D tDepth;
uniform vec3 uCenter;      // planet centre relative to the camera (world axes)
uniform vec3 uSunDir;
uniform vec3 uSunE;        // sun illuminance (rgb) at the planet
uniform mat3 uCamRot;      // view -> world rotation
uniform vec2 uTanHalf;
uniform mat3 uToFixed;     // world -> body-fixed rotation
uniform float uTime;
uniform vec4 uCloud;       // altitude, thickness, cover, scale
uniform vec4 uCloudColor;  // rgb, opacity
uniform float uCloudOn;
uniform sampler2D tCloudMap;
uniform float uCloudMapOn;
uniform float uSteps;
uniform float uExposureHint;
varying vec2 vUv;

float ign(vec2 p) { return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }

uniform sampler3D tNoise;
uniform float uWindMax;
${GLSL_AIRLIGHT}
vec3 gEm;   // (emitted light along the ray so far: not lit by the sun, so kept apart)
// Same coverage field as the volumetric pass (render/volume.js, mode 1), so
// switching between the far 2D shell and near 3D clouds is seamless.
float cloudDensity(vec3 pFixedDir) {
  vec3 q = pFixedDir * uRadius;
  float lat = asin(clamp(pFixedDir.y, -1.0, 1.0));
  float n = texture(tNoise, q / 140000.0).r * 0.6 + texture(tNoise, q / 33000.0 + 0.5).r * 0.4;
  float hadley = 0.12 * cos(abs(lat) * 6.0);
  // (with the simulated climate's cloud map: its cover moves the clouds where it rains)
  if (uCloudMapOn > 0.5) hadley = (texture(tCloudMap, vec2(atan(pFixedDir.z, pFixedDir.x) / 6.2832 + 0.5, lat / 3.14159 + 0.5)).r - 0.5) * 0.4;
  float bias = (uCloud.z - 0.5) * 0.3;
  float cov = smoothstep(0.6 - bias, 0.8 - bias, n + hadley);
  // fine texture inside covered areas
  float det = texture(tNoise, q / 9000.0).r;
  return cov * smoothstep(0.15, 0.55, det * cov + 0.25);
}

// march [t0,t1] accumulating in-scattering; positions via the perpendicular
// offset (p = (t - tca) * D - perp) to stay precise far from the planet
void march(float t0, float t1, vec3 D, float tca, vec3 perp, float cosTheta, float jitter, inout vec3 L, inout vec3 T, int steps) {
  if (t1 <= t0) return;
  float dt = (t1 - t0) / float(steps);
  float pR = phaseRayleigh(cosTheta), pM = phaseMie(cosTheta, uMieG);
  for (int i = 0; i < 32; i++) {
    if (i >= steps) break;
    float t = t0 + (float(i) + jitter) * dt;
    vec3 p = (t - tca) * D - perp;
    float r = length(p);
    vec3 sR, sM, e;
    mediumAt(r, sR, sM, e);
    float muS = dot(p, uSunDir) / r;
    vec3 sunT = sunTransmittance(r, muS);
    vec3 ms = multiScatter(r, muS);
    vec3 S = sR * (sunT * pR + ms) + sM * (sunT * pM + ms);
    vec3 Ts = exp(-e * dt);
    vec3 eSafe = max(e, vec3(1e-14));
    L += T * (S - S * Ts) / eSafe;
    gEm += T * airLight(p, r) * dt;
    T *= Ts;
  }
}

layout(location = 0) out highp vec4 outL;
layout(location = 1) out highp vec4 outT;
void main() {
  vec2 ndc = vUv * 2.0 - 1.0;
  vec3 dView = normalize(vec3(ndc.x * uTanHalf.x, ndc.y * uTanHalf.y, -1.0));
  vec3 D = normalize(uCamRot * dView);
  float depth = texture(tDepth, vUv).r;
  float sceneDist = isSkyDepth(depth) ? 1e30 : viewZFromDepth(depth) / max(-dView.z, 1e-4);

  vec2 hit = raySphere(uCenter, uTop, D);
  if (hit.y <= 0.0 || hit.x > hit.y || hit.x > sceneDist) { outL = vec4(0.0); outT = vec4(1.0); return; }
  float tca = dot(uCenter, D);
  vec3 perp = uCenter - tca * D;
  float t0 = max(hit.x, 0.0);
  float t1 = min(hit.y, sceneDist);
  // stop at the solid/cloud-top sphere for pixels that never wrote depth (precision guard)
  vec2 g = raySphere(uCenter, uGround, D);
  if (g.y > 0.0 && g.x < g.y && g.x > 0.0) t1 = min(t1, g.x);

  float cosTheta = dot(D, uSunDir);
  float jitter = ign(gl_FragCoord.xy);
  int steps = int(uSteps);
  vec3 L = vec3(0.0), T = vec3(1.0);
  gEm = vec3(0.0);

  // cloud shell intersection
  float tc = -1.0;
  if (uCloudOn > 0.5) {
    float rc = uRadius + uCloud.x;
    vec2 ch = raySphere(uCenter, rc, D);
    if (ch.y > 0.0 && ch.x < ch.y) {
      float camR = length(uCenter);
      float cand = camR > rc ? ch.x : ch.y;
      if (cand > t0 && cand < t1) tc = cand;
    }
  }
  vec3 aNear, aFar;
  auroraRay(D, tca, perp, min(hit.y, sceneDist), jitter, aNear, aFar);
  if (tc < 0.0) {
    march(t0, t1, D, tca, perp, cosTheta, jitter, L, T, steps);
    outL = vec4(L * uSunE + gEm + aNear + T * aFar, 1.0); outT = vec4(T, 1.0);
    return;
  }
  // segment before the cloud
  march(t0, tc, D, tca, perp, cosTheta, jitter, L, T, steps / 2 + 2);
  vec3 em1 = gEm;
  gEm = vec3(0.0);
  vec3 pc = (tc - tca) * D - perp;
  float rc = length(pc);
  vec3 up = pc / rc;
  float dens = cloudDensity(normalize(uToFixed * up));
  float alpha = clamp(dens * uCloudColor.a, 0.0, 1.0);
  vec3 L2 = vec3(0.0), T2 = vec3(1.0);
  march(tc, t1, D, tca, perp, cosTheta, jitter, L2, T2, steps / 2 + 2);
  vec3 cl = vec3(0.0);
  if (alpha > 0.002) {
    float muS = dot(up, uSunDir);
    vec3 sunT = sunTransmittance(rc, muS);
    vec3 amb = multiScatter(rc, muS) * 6.0;
    bool fromBelow = dot(D, up) > 0.0;
    float lambert = max(muS, 0.0) * 0.6 + 0.4 * smoothstep(-0.1, 0.3, muS);
    float silver = 1.0 + 1.5 * pow(max(cosTheta, 0.0), 12.0);
    vec3 lit = uCloudColor.rgb * (sunT * lambert * silver / PI_A + amb);
    if (fromBelow) lit *= mix(0.55, 0.18, dens);
    cl = lit;
  }
  // final = scene * T*(1-a)*T2 + L + T*((1-a)*L2 + a*cl)
  outT = vec4(T * (1.0 - alpha) * T2, 1.0);
  outL = vec4((L + T * ((1.0 - alpha) * L2 + alpha * cl)) * uSunE + em1 + T * (1.0 - alpha) * gEm + aNear + T * (1.0 - alpha) * T2 * aFar, 1.0);
}
`;


// the aurora and airglow uniforms from bodies.js airGlow (none for a giant or older data)
export function glowUniforms(g) {
  return {
    uAurora: { value: new THREE.Vector4(g ? g.aurora : 0, g ? g.ovalLat : -1, g ? g.ovalWidth : 0.1, g ? g.airglow : 0) },
    uAuroraLo: { value: v3(g ? g.colorLow : [0, 1, 0]) },
    uAuroraHi: { value: v3(g ? g.colorHigh : [1, 0, 0]) },
    uAirglowCol: { value: v3(g ? g.airglowColor : [0, 1, 0]) },
    uMagAxis: { value: v3(g ? g.magAxis : [0, 1, 0]) },
  };
}

let _quadScene = null, _quadCam = null, _quad = null;
function fsQuad() {
  if (!_quadScene) {
    _quadScene = new THREE.Scene();
    _quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    _quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), null);
    _quad.frustumCulled = false;
    _quadScene.add(_quad);
  }
  return { scene: _quadScene, cam: _quadCam, quad: _quad };
}

export function renderFullscreen(renderer, material, target) {
  const q = fsQuad();
  q.quad.material = material;
  renderer.setRenderTarget(target);
  renderer.render(q.scene, q.cam);
}

function lutTarget(w, h) {
  const rt = new THREE.WebGLRenderTarget(w, h, {
    type: THREE.HalfFloatType, format: THREE.RGBAFormat,
    minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
    wrapS: THREE.ClampToEdgeWrapping, wrapT: THREE.ClampToEdgeWrapping,
    depthBuffer: false, stencilBuffer: false, generateMipmaps: false,
  });
  return rt;
}

function v3(a) { return new THREE.Vector3(a[0], a[1], a[2]); }

// One atmosphere: parameters, LUTs and the composite material.
export class Atmosphere {
  constructor(renderer, body) {
    this.body = body;
    const a = body.atm.render;
    const d = body.data;
    const giant = !!body.giant;
    const R = body.R;
    const relief = d.terrain ? d.terrain.relief : 0;
    const hasSea = d.terrain && d.terrain.ocean > 0 && d.terrain.liquid;
    this.radius = R;
    this.ground = giant ? R - Math.min(a.depth || 0, R * 0.2) : R + (hasSea ? 0 : -relief * 0.4);
    this.bottom = this.ground;
    this.top = R + a.height;
    this.params = {
      uRadius: { value: R },
      uBottom: { value: this.bottom },
      uTop: { value: this.top },
      uGround: { value: this.ground },
      uRayleigh: { value: v3(a.rayleigh) },
      uRayleighH: { value: a.rayleighH },
      uMie: { value: v3(a.mie) },
      uMieAbs: { value: v3(a.mieAbs) },
      uMieH: { value: a.mieH },
      uHaze: { value: new THREE.Vector4(...(a.haze || [0, 1000, 0, 0])) },
      uMieG: { value: a.mieG },
      uAbs: { value: v3(a.ozone) },
      uAbsCenter: { value: a.ozoneCenter || 0 },
      uAbsWidth: { value: a.ozoneWidth || 1 },
      uAbsExp: { value: a.absorptionExp ? 1 : 0 },
      uGroundAlbedo: { value: new THREE.Vector3(0.18, 0.18, 0.18) },
    };
    if (d.terrain) {
      const p = d.terrain.palette;
      const o = d.terrain.ocean || 0;
      const land = p.regolith;
      const w = p.waterDeep;
      this.params.uGroundAlbedo.value.set(
        (land[0] * (1 - o) + w[0] * o) * 1.2, (land[1] * (1 - o) + w[1] * o) * 1.2, (land[2] * (1 - o) + w[2] * o) * 1.2);
    } else if (giant) {
      const c = body.giant.palette[0];
      this.params.uGroundAlbedo.value.set(c[0] * 0.8, c[1] * 0.8, c[2] * 0.8);
    }
    this.trans = lutTarget(256, 64);
    this.ms = lutTarget(32, 32);
    this.irr = lutTarget(64, 16);
    this.generate(renderer);
    this.readBack(renderer);
    this.material = this.makePassMaterial();
  }

  // CPU copies of the transmittance and irradiance LUTs for lighting
  // standard materials (ship, effects) consistently with the shaders.
  readBack(renderer) {
    const rd = (rt) => {
      const n = rt.width * rt.height * 4;
      const half = new Uint16Array(n);
      const out = new Float32Array(n);
      try {
        renderer.readRenderTargetPixels(rt, 0, 0, rt.width, rt.height, half);
        for (let i = 0; i < n; i++) out[i] = THREE.DataUtils.fromHalfFloat(half[i]);
      } catch (e) { out.fill(1); }
      return { w: rt.width, h: rt.height, data: out };
    };
    this.cpuTrans = rd(this.trans);
    this.cpuIrr = rd(this.irr);
  }

  _bilinear(lut, u, v, out) {
    const x = Math.min(Math.max(u * lut.w - 0.5, 0), lut.w - 1.001);
    const y = Math.min(Math.max(v * lut.h - 0.5, 0), lut.h - 1.001);
    const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0;
    const d = lut.data, W = lut.w;
    for (let c = 0; c < 3; c++) {
      const a = d[(y0 * W + x0) * 4 + c], b = d[(y0 * W + x0 + 1) * 4 + c];
      const e = d[((y0 + 1) * W + x0) * 4 + c], f = d[((y0 + 1) * W + x0 + 1) * 4 + c];
      out[c] = (a * (1 - fx) + b * fx) * (1 - fy) + (e * (1 - fx) + f * fx) * fy;
    }
    return out;
  }

  // Sunlight transmittance at radius r, sun zenith cosine mu (incl. planet shadow)
  transmittance(r, mu, out = [1, 1, 1]) {
    const top = this.top, bot = this.bottom;
    const rr = Math.min(Math.max(r, bot), top);
    const H = Math.sqrt(top * top - bot * bot);
    const rho = Math.sqrt(Math.max(0, rr * rr - bot * bot));
    const disc = rr * rr * (mu * mu - 1) + top * top;
    const d = Math.max(0, -rr * mu + Math.sqrt(Math.max(disc, 0)));
    const dMin = top - rr, dMax = rho + H;
    this._bilinear(this.cpuTrans, (d - dMin) / Math.max(dMax - dMin, 1e-6), rho / H, out);
    const sinH = this.ground / Math.max(r, this.ground);
    const cosH = -Math.sqrt(Math.max(0, 1 - sinH * sinH));
    const vis = Math.min(1, Math.max(0, (mu - (cosH - 0.01)) / 0.02));
    out[0] *= vis; out[1] *= vis; out[2] *= vis;
    return out;
  }

  skyIrradiance(r, mu, out = [0, 0, 0]) {
    const v = Math.min(Math.max((r - this.ground) / (this.top - this.ground), 0), 1);
    return this._bilinear(this.cpuIrr, mu * 0.5 + 0.5, v, out);
  }

  generate(renderer) {
    const mk = (frag, extra = {}) => new THREE.ShaderMaterial({
      uniforms: { ...this.params, ...extra },
      vertexShader: FULLSCREEN_VERT, fragmentShader: frag,
      depthTest: false, depthWrite: false,
    });
    const prev = renderer.getRenderTarget();
    const m1 = mk(TRANSMITTANCE_FRAG);
    renderFullscreen(renderer, m1, this.trans);
    const m2 = mk(MS_FRAG, { tTrans: { value: this.trans.texture } });
    renderFullscreen(renderer, m2, this.ms);
    const m3 = mk(IRRADIANCE_FRAG, { tTrans: { value: this.trans.texture }, tMS: { value: this.ms.texture } });
    renderFullscreen(renderer, m3, this.irr);
    renderer.setRenderTarget(prev);
    m1.dispose(); m2.dispose(); m3.dispose();
  }

  makePassMaterial() {
    const d = this.body.data;
    const clouds = d.atmosphere && d.atmosphere.clouds;
    const u = {
      ...this.params,
      tTrans: { value: this.trans.texture },
      tMS: { value: this.ms.texture },
      tColor: { value: null },
      tDepth: { value: null },
      uCenter: { value: new THREE.Vector3() },
      uSunDir: { value: new THREE.Vector3(1, 0, 0) },
      uSunE: { value: new THREE.Vector3(1, 1, 1) },
      uCamRot: { value: new THREE.Matrix3() },
      uTanHalf: { value: new THREE.Vector2(1, 1) },
      uToFixed: { value: new THREE.Matrix3() },
      uTime: { value: 0 },
      uCloud: { value: new THREE.Vector4(clouds ? clouds.altitude : 0, clouds ? clouds.thickness : 0, clouds ? clouds.cover : 0, clouds ? clouds.scale : 1) },
      uCloudColor: { value: new THREE.Vector4(clouds ? clouds.color[0] : 1, clouds ? clouds.color[1] : 1, clouds ? clouds.color[2] : 1, clouds ? clouds.opacity : 0) },
      uCloudOn: { value: clouds && !this.body.giant ? 1 : 0 },
      tCloudMap: { value: blankCloudMap() }, uCloudMapOn: { value: 0 },
      ...glowUniforms(this.body.atm.render.glow),
      uSteps: { value: 16 },
      tNoise: { value: null },
      uWindMax: { value: 12 },
      uExposureHint: { value: 1 },
      uDepthMode: { value: 0 }, uNear: { value: 0.05 }, uFar: { value: 1e13 }, uLogDepthFC: { value: 1 },
    };
    return new THREE.ShaderMaterial({
      uniforms: u, vertexShader: FULLSCREEN_VERT, fragmentShader: PASS_FRAG,
      depthTest: false, depthWrite: false, glslVersion: THREE.GLSL3,
    });
  }

  dispose() {
    this.trans.dispose(); this.ms.dispose(); this.irr.dispose(); this.material.dispose();
  }
}

// GLSL for surfaces that need sunlight transmittance + sky irradiance
export const GLSL_SURFACE_ATMO = /* glsl */`
uniform float uHasAtmo;
uniform float uBottom;
uniform float uTop;
uniform float uGround;
uniform sampler2D tTrans;
uniform sampler2D tIrr;
vec2 transmittanceUV(float r, float mu) {
  float H = sqrt(max(0.0, uTop * uTop - uBottom * uBottom));
  float rho = sqrt(max(0.0, r * r - uBottom * uBottom));
  float disc = r * r * (mu * mu - 1.0) + uTop * uTop;
  float d = max(0.0, -r * mu + sqrt(max(disc, 0.0)));
  float dMin = uTop - r, dMax = rho + H;
  return vec2((d - dMin) / max(dMax - dMin, 1e-6), rho / max(H, 1e-6));
}
vec3 atmoSunTransmittance(float r, float mu) {
  float sinH = uGround / max(r, uGround);
  float cosH = -sqrt(max(0.0, 1.0 - sinH * sinH));
  float vis = smoothstep(cosH - 0.01, cosH + 0.01, mu);
  if (uHasAtmo < 0.5) return vec3(vis);
  vec2 uv = transmittanceUV(clamp(r, uBottom, uTop), mu);
  uv = vec2(0.5 / 256.0, 0.5 / 64.0) + uv * vec2(255.0 / 256.0, 63.0 / 64.0);
  return texture(tTrans, uv).rgb * vis;
}
vec3 atmoSkyIrradiance(float r, float mu) {
  if (uHasAtmo < 0.5) return vec3(0.0);
  vec2 uv = vec2(mu * 0.5 + 0.5, clamp((r - uGround) / (uTop - uGround), 0.0, 1.0));
  uv = vec2(0.5 / 64.0, 0.5 / 16.0) + uv * vec2(63.0 / 64.0, 15.0 / 16.0);
  return texture(tIrr, uv).rgb;
}
`;

// a 1x1 stand-in until a simulated world's cloud map arrives
let _blank = null;
export function blankCloudMap() {
  if (!_blank) { _blank = new THREE.DataTexture(new Uint8Array([128, 128, 128, 255]), 1, 1); _blank.needsUpdate = true; }
  return _blank;
}
