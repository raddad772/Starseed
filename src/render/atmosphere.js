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
import { atmoAlt } from '../gen/bodies.js';
import * as U from '../core/units.js';
import { GLSL_TERRAIN_SHADOW } from './terrainShadow.js';

// the cloud cover's weather systems, as fractions of the world's radius (the noise tile; four lobes to
// one): fronts and cyclones a quarter of the radius across, as Earth's are; then storms, then the
// texture inside them. Fixed in drawn metres (140, 33 and 9 km) the fronts were a twentieth of the
// radius at a tenth of Earth's size and a third of it at 1/64; a twentieth is popcorn from space, a
// field of small puffs over the whole globe. Shared by the far shell (here), the near
// volume (volume.js) and the ground's cloud shadows (terrainMaterial.js)
export const CLOUD_K = [1.0, 0.236, 0.064];
// the cover field from the noise texture's two octaves: they sit in a narrow band (median 0.682, the
// middle half 0.657 .. 0.705: noise3d.js makeCloudNoise's Perlin-Worley), and the thresholds that read
// them (0.6 .. 0.8, the cloud map and the cover moving them) were made for noise spread over 0..1: every
// point came out about a third covered, a veil over the whole globe with no clear sky anywhere. Spread
// to what the thresholds expect; an Earth (cover 0.52) shows about two fifths of its sky white from
// space, its deserts' and trade winds' skies clear, its storm tracks and rain belts under cloud.
// Each octave fades to its mean where a pixel (foot m across) spans a few of its texels (the noise has
// no mip levels: from space they alias to speckle), and the threshold widens by the spread that took
// away, so a far pixel shows the fraction of it covered. Needs tNoise, tCloudMap, uCloudMapMean, uRadius
// (uCloudYear its own).
// cloudBias's twin for the near volume's decks (their bias a uniform)
const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
export const cloudBias = (cover) => (cover - 0.5) * 0.3 + 0.5 * sstep(0.8, 1.0, cover) - 0.5 * (1 - sstep(0.0, 0.2, cover));
// how long a generation of clouds lives on the world's clock (s): about as long as its winds' shear
// takes to tear a pattern apart, 1 / (dU/dy) at its steepest (a cloud system carried on a sheared wind
// lasts about that long before it's drawn out into streaks; given longer, the drawn noise smeared into
// bands and blocks). The winds as the near volume has them (cloudAdvect: the most, the bands, the
// equator's jet) on a world of radius R; between 5 minutes and 2 hours. A small world drawn at
// LEN_SCALE with Earth's winds shears fast: ~25 min
export function cloudLife(windMax, bands, eqJet, R) {
  const shear = Math.abs(windMax) * (2 * bands + 5.42 * Math.abs(eqJet)) / Math.max(R, 1);
  return Math.min(7200, Math.max(300, shear > 0 ? 1 / shear : 7200));
}
export const GLSL_CLOUD_N = /* glsl */`
uniform vec2 uCloudYear;   // (the cloud map's year: cos, sin of the sun's place in it, 0 without)
float cloudN(float n) { return 0.55 + (n - 0.682) * 4.3; }
// how far a world's cover (0..1) moves the threshold: gently through the middle (an Earth's 0.52),
// then a closed deck at 1 (a Venus: its full cover had let the weather's spread open holes, the long
// path behind showing through as a ring) and a clear sky at 0
float cloudBias(float cover) { return (cover - 0.5) * 0.3 + 0.5 * smoothstep(0.8, 1.0, cover) - 0.5 * (1.0 - smoothstep(0.0, 0.2, cover)); }
// 0 where a pixel foot m across sees an octave of tile L m whole, 1 where it spans a few texels
float cloudFade(float foot, float L) { return smoothstep(1.0, 4.0, foot * 64.0 / L); }
// cover (0..1) at q (body-fixed m) in direction dirF; bias: the world's cover moving the threshold
float cloudCover(vec3 q, vec3 dirF, float foot, float bias) {
  float lat = asin(clamp(dirF.y, -1.0, 1.0));
  float L0 = uRadius * ${CLOUD_K[0].toFixed(3)}, L1 = uRadius * ${CLOUD_K[1].toFixed(3)};
  float f0 = cloudFade(foot, L0), f1 = cloudFade(foot, L1);
  // (drawn out along the winds: the noise squeezed across the axis, its systems twice as long east-west)
  vec3 qz = q * vec3(0.5, 1.0, 0.5);
  float a = f0 > 0.999 ? 0.682 : mix(textureLod(tNoise, qz / L0, 0.0).r, 0.682, f0);
  float b = f1 > 0.999 ? 0.682 : mix(textureLod(tNoise, qz / L1 + 0.5, 0.0).r, 0.682, f1);
  float spread = length(vec2(0.124 * f0, 0.083 * f1));
  float hadley = 0.12 * cos(abs(lat) * 6.0);
  // (with the simulated climate's cloud map: it moves the clouds to where it rains, as strongly as the
  // weather's own spread so the climate's belts read from space; about its own mean, the world's cover
  // setting the amount: a dry world's map and its low cover had counted its dryness twice)
  // (and its year: the swing's two parts turned by where the sun stands in it, uCloudYear cos and sin of
  // its solar longitude, 0 without: the rain belts and the storm tracks follow the sun)
  if (uCloudMapMean > 0.0) {
    vec3 cm = texture(tCloudMap, vec2(atan(dirF.z, dirF.x) / 6.2832 + 0.5, lat / 3.14159 + 0.5)).rgb;
    hadley = (cm.r + (cm.g - 0.5) * uCloudYear.x + (cm.b - 0.5) * uCloudYear.y - uCloudMapMean) * 0.8;
  }
  return smoothstep(0.6 - bias - spread, 0.8 - bias + spread, cloudN(a * 0.6 + b * 0.4) + hadley);
}
// the fine texture inside covered areas (its mean far off)
float cloudDetail(vec3 q, float foot) {
  float L2 = uRadius * ${CLOUD_K[2].toFixed(3)}, f = cloudFade(foot, L2);
  return f > 0.999 ? 0.682 : mix(textureLod(tNoise, q / L2, 0.0).r, 0.682, f);
}
// ---- the clouds on the world's clock (sim/worldClock.js; world.js sets uCloudClock each frame): each
// generation of them lives T (uCloudClock.z: cloudLife, the world's winds' shear) of the clock, forms, drifts on its latitude's wind
// (uCloudWind: the most, the bands, their phase, the equator's jet: the near volume's) and gives way to
// the next. Two series half a life apart; each place turns over at its own time (the turn-over sweeping
// round the world like a front), the hand-over a fifth of a life, so most places draw one generation.
// Every client on the shared clock draws the same sky. Each generation's drift stays within half a
// life's wind: a pattern carried on the wind for months smears into bands, and its float positions
// lose their metres
uniform vec4 uCloudClock;   // time into the clock's period T (s), periods before it (kept positive), T (s: cloudLife)
uniform vec4 uCloudWind;
// the two generations at body-fixed direction dirF: each (weight, age from its mid-life (s), index)
void cloudGens(vec3 dirF, out vec3 gA, out vec3 gB) {
  float T = uCloudClock.z;
  if (T <= 0.0) { gA = vec3(1.0, 0.0, 0.0); gB = vec3(0.0); return; }
  float ph = 1.1 * dirF.x + 0.7 * dirF.z - 0.5 * dirF.y + 0.35 * sin(2.3 * dirF.y + 1.7 * dirF.x - 0.9 * dirF.z);
  float s = uCloudClock.x / T + ph + 4.0;
  float a = floor(s), fa = s - a, b = floor(s + 0.5), fb = s + 0.5 - b;
  float wa = smoothstep(0.4, 0.6, 1.0 - abs(2.0 * fa - 1.0));
  gA = vec3(wa, (fa - 0.5) * T, 2.0 * (uCloudClock.y + a));
  gB = vec3(1.0 - wa, (fb - 0.5) * T, 2.0 * (uCloudClock.y + b) + 1.0);
}
// a generation's own place in the noise: an integer hash of its index (the same on every GPU)
vec3 cloudGenOff(float idx) {
  uint h = uint(idx) * 2654435761u;
  h ^= h >> 15u; h *= 2246822519u; h ^= h >> 13u;
  return (vec3(float(h & 1023u), float((h >> 10u) & 1023u), float((h >> 20u) & 1023u)) / 1024.0 - 0.5) * 4.0e5;
}
// where generation g has carried body-fixed pf (dirF its way): on its latitude's wind for its age
vec3 cloudAdvect(vec3 pf, vec3 dirF, vec3 g) {
  float lat = asin(clamp(dirF.y, -1.0, 1.0));
  float U = uCloudWind.x * (sin(lat * uCloudWind.y * 2.0 + uCloudWind.z * 6.2832) + uCloudWind.w * exp(-lat * lat * 40.0));
  vec3 east = normalize(vec3(-dirF.z, 0.0, dirF.x) + vec3(1e-6, 0.0, 0.0));
  return pf + east * U * g.y + cloudGenOff(g.z);
}
// cloudCover over the generations at body-fixed pf
float cloudCoverG(vec3 pf, vec3 dirF, float foot, float bias) {
  vec3 gA, gB;
  cloudGens(dirF, gA, gB);
  float c = 0.0;
  if (gA.x > 0.005) c += gA.x * cloudCover(cloudAdvect(pf, dirF, gA), dirF, foot, bias);
  if (gB.x > 0.005) c += gB.x * cloudCover(cloudAdvect(pf, dirF, gB), dirF, foot, bias);
  return c;
}`;

// the cloud deck's light at rel (from the world's centre, world axes; r = |rel|): returns the share of
// the sun's direct light it lets through, and makes skyE (the sky's light, irradiance per the sun's) what
// reaches under it: the blue sky's through the cloud overhead, and the sunlight the cloud scatters down,
// white (sunAbove: the sun's light above it). Near the camera from the near volume's own decks
// (cloudShadow.js's map: their shapes, carried on the wind); further off, the far shell's cover with a
// deck's optical depth (uCloudTau). A cloud of optical depth tau lets the sun through directly as
// exp(-tau / mu) and in all about 1 / (1 + 3 (1 - g) tau / 4) (Bohren 1987; g ~0.85), so under an
// overcast the light is dim, shadowless and grey-white; under broken cloud the shadows move with it.
// Needs GLSL_CLOUD_N, uSunDir, uToFixed, uCloud, uCloudOn, uCloudOpacity
export const GLSL_CLOUD_SHADOW = /* glsl */`
uniform sampler2D tCloudShadow;
uniform vec3 uCSOrigin;
uniform vec3 uCSE;
uniform vec3 uCSN;
uniform float uCSInvL;
uniform float uCSLod;
uniform float uCSOn;
uniform float uCloudTau;
// (and, for the moon's light after it: the cloud's overhead, its direct share and its all-in)
float cloudDirZ = 1.0, cloudTotZ = 1.0;
float cloudLight(vec3 rel, float r, float muS, float foot, vec3 sunAbove, inout vec3 skyE) {
  cloudDirZ = 1.0; cloudTotZ = 1.0;
  if (uCloudOn < 0.5) return 1.0;
  float mu = max(muS, 0.05);
  float Tdir = 1.0, Ttot = 1.0, Dup = 1.0;
  // (near: the map; a point above the datum reads it where its own sun ray, carried down to the datum,
  // lands; faded into the far shell's over its last twelfth)
  float w = 0.0;
  vec4 m0 = vec4(1.0), m1 = vec4(1.0);
  if (uCSOn > 0.5) {
    vec3 pf = uToFixed * rel, upF = pf / r, sF = uToFixed * uSunDir;
    vec3 d = pf - uCSOrigin - (sF - upF * dot(sF, upF)) * (r - uRadius) / max(dot(sF, upF), 0.1);
    vec2 uv = vec2(dot(d, uCSE), dot(d, uCSN)) * uCSInvL + 0.5;
    w = smoothstep(0.0, 0.08, min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y)));
    if (w > 0.0) { m0 = textureLod(tCloudShadow, uv, 0.0); m1 = textureLod(tCloudShadow, uv, uCSLod); }
  }
  // (the far shell's cover: on the sun's way up at the deck, and overhead over the dome a point sees)
  float hc = uCloud.x - (r - uRadius);
  if (hc > 0.0 && w < 1.0) {
    vec3 ds = normalize(uToFixed * normalize(rel + uSunDir * hc / max(muS, 0.08)));
    float cs = muS > -0.05 ? cloudCoverG(ds * uRadius, ds, foot, cloudBias(uCloud.z)) * uCloudOpacity : 0.0;
    vec3 dz = normalize(uToFixed * rel);
    float cz = cloudCoverG(dz * uRadius, dz, max(foot, 3.5 * hc), cloudBias(uCloud.z)) * uCloudOpacity;
    Tdir = 1.0 - cs + cs * exp(-uCloudTau / mu);
    Ttot = 1.0 - cz + cz / (1.0 + 0.1125 * uCloudTau);
    Dup = 1.0 - cz + cz * exp(-uCloudTau / mu);
  }
  Tdir = mix(Tdir, m0.r, w); Ttot = mix(Ttot, m1.g, w); Dup = mix(Dup, m1.b, w);
  cloudDirZ = Dup; cloudTotZ = Ttot;
  skyE = skyE * Ttot + sunAbove * max(muS, 0.0) * max(Ttot - Dup, 0.0);
  return muS > -0.05 ? Tdir : 1.0;
}`;

// a hot world's own light. blackbodyGlow: a blackbody's visible light at T K in the scene's radiance
// (1 = ~127,000 cd/m^2: a white surface under 1 AU's sun shows 1/pi), an exponential fitted to
// Planck's law through the eye's response, within ~10% from 800 to 2,000 K (2.6 cd/m^2 at 1,000 K,
// 256 at 1,240, 2,400 at 1,400), its colour linear sRGB (red, the green rising from ~3% at 1,000 K
// to 27% at 2,000). uThermal: the surface's temperature (K; 0 too cold to glow), how fast it falls
// per metre of the ground's drawn height (the real lapse, heights drawn smaller) and of the air's.
export const GLSL_THERMAL = /* glsl */`
uniform vec4 uThermal;
vec3 blackbodyGlow(float T) {
  if (T < 650.0) return vec3(0.0);
  float g = max(0.0, 0.0287 + 2.37e-4 * (T - 1000.0));
  return vec3(1.0, g, 0.0) * (6.0e5 * exp(-24060.0 / T) / (0.2126 + 0.7152 * g));
}
// the air's own glow at radius r: a hot, thick atmosphere fills each step with it as far as the step
// is opaque (an oven: looking any way, the walls' light, the air making up what the path dims)
vec3 airHeatGlow(float r) { return uThermal.x > 0.0 ? blackbodyGlow(uThermal.x - uThermal.z * max(r - uRadius, 0.0)) : vec3(0.0); }`;

// uThermal for a body: its surface temperature when hot enough to glow, the dry adiabat's fall with
// height (g / cp, cp ~1,100 J/kg/K) per metre of drawn ground (heights drawn HEIGHT_SCALE small) and air
export function thermalUniform(b) {
  const T = (b.data && b.data.Tsurf) || 0, lapse = (b.data && b.data.gravity || 9.8) / 1100;
  return new THREE.Vector4(T > 650 ? T : 0, lapse / U.HEIGHT_SCALE, lapse, 0);
}

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
// (its colour: scattering by wavelength over green's, an Angstrom slope (550/l)^a from the world's
// aerosols: the fine haze of a land with plants takes the blue most, so the far hills go blue and a low
// sun reddens deep; a desert's coarse dust and a sea's salt nearly grey)
uniform vec3 uHazeCol;
// the air above the knee (m) squeezed by uUpper (bodies.js atmoAlt): its density at a drawn
// height is the real air's at the real height it stands for
uniform float uKnee;
uniform float uUpper;
// the world's true size over its drawn one (bodies.js radiusM / R: ~64 on a true-scale world)
uniform float uTrueK;
// the up at p (from the world's centre, r its length) as on the true-size world, from a camera whose own
// up is upC: on the drawn ball a view along the ground curves round fast, the air 50 km off under a sun
// some 30 degrees higher than the camera's and lit white where the true world's sun there is setting
// too; the curve undone by k (the true size near the ground, 1 from high up)
vec3 trueUp(vec3 p, float r, vec3 upC, float k) { return normalize(mix(upC, p / r, 1.0 / k)); }
float trueK(float hc) { return mix(max(uTrueK, 1.0), 1.0, smoothstep(20000.0, 60000.0, hc)); }
const float PI_A = 3.14159265358979;
// the sun as the air sees it from low over a drawn world (world.js: uSunLift x the drawn horizon's dip from
// the camera, y the true world's; zero far off): its height stretched near the horizon as the sky's view is
// (skyTrueEl), so it reddens and dims as it nears the drawn skyline and its light ends as it touches it; on
// the true world's horizon alone it set in mid-air over the drawn skyline, or (the disc lowered instead)
// behind hills the drawn world stands eight times steeper (Dave); below the drawn horizon, as much higher
// as there
uniform vec2 uSunLift;
float liftMu(float mu) {
  if (uSunLift.x <= uSunLift.y) return mu;
  float e = asin(clamp(mu, -1.0, 1.0)), E1 = 0.2094;
  if (e >= E1) return mu;
  return sin(e >= -uSunLift.x ? E1 - (E1 - e) * (E1 + uSunLift.y) / (E1 + uSunLift.x) : e + (uSunLift.x - uSunLift.y));
}
// (the ground haze's share: 0 for a sky pixel's ray, which reaches no far ground for it to stand in front of;
// the haze is the game's stand-in for the distance the drawn world leaves out, and over a ray toward the
// horizon it took the setting sun and paled the low sky (the passes' mains set it))
float gHazeK = 1.0;
void mediumAt(float r, out vec3 scatR, out vec3 scatM, out vec3 ext) {
  float h = r - uRadius;
  float hr = h <= uKnee ? h : uKnee + (h - uKnee) / uUpper;
  float dR = exp(-hr / uRayleighH);
  float dM = exp(-hr / uMieH);
  float dA = uAbsExp > 0.5 ? dR : max(0.0, 1.0 - abs(h - uAbsCenter) / max(uAbsWidth, 1.0));
  vec3 dH = uHaze.x * gHazeK * exp(-max(h, 0.0) / max(uHaze.y, 1.0)) * uHazeCol;
  scatR = uRayleigh * dR;
  scatM = uMie * dM + dH;
  ext = scatR + scatM + uMieAbs * dM + uAbs * dA + dH * uHaze.z;
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
  // (the sunlight's way through the air as on the world's true size, which the drawn one stands for:
  // its air is real air, a real height, and wrapped round a ball a 64th of the size a low sun's way
  // through it was a few airmasses where Earth's horizon is nearly forty, the setting sun white and
  // bright; the air's layers the same at each height, the curve under them the true one's. Below the
  // true horizon (above the drawn one, which dips further), the light grazing it)
  float K = max(uTrueK, 1.0), Rk = uRadius * K, rK = Rk + (r - uRadius), topK = Rk + (uTop - uRadius);
  float muK = max(mu, -sqrt(max(0.0, 1.0 - (Rk / rK) * (Rk / rK))) + 1e-4);
  float len = max(0.0, -rK * muK + sqrt(max(rK * rK * (muK * muK - 1.0) + topK * topK, 0.0)));
  // (its steps closer near the start, squared: a low sun's way runs hundreds of km to the top, and in
  // even steps the ground haze, its first few hundred metres up, fell between two of them; then the haze
  // barely dimmed the sun it lit, a white blaze round a setting sun)
  const int N = 64;
  vec3 od = vec3(0.0);
  for (int i = 0; i < N; i++) {
    float u0 = float(i) / float(N), u1 = float(i + 1) / float(N);
    float t = len * (u0 * u0 + u1 * u1) * 0.5, dt = len * (u1 * u1 - u0 * u0);
    float rr = sqrt(rK * rK + t * t + 2.0 * rK * muK * t);
    vec3 sR, sM, e;
    mediumAt(rr - Rk + uRadius, sR, sM, e);
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
// sunlight reaching radius r with sun zenith cosine mu, incl. the planet's shadow: the true-size world's
// horizon at that height (its sun angles are the true world's, trueUp; cut off at the drawn ball's, which
// dips several times further, the ground stayed lit by a grazing sun degrees after it had set)
vec3 sunTransmittance(float r, float mu) {
  mu = liftMu(mu);
  float Rg = uGround * max(uTrueK, 1.0), sinH = Rg / (Rg + max(r - uGround, 0.0));
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
      vec3 thr = vec3(1.0), L = vec3(0.0), MS = vec3(0.0);
      for (int s = 0; s < STEPS; s++) {
        // (squared steps: the ground haze near the start)
        float u0 = float(s) / float(STEPS), u1 = float(s + 1) / float(STEPS);
        float t = tMax * (u0 * u0 + u1 * u1) * 0.5, dt = tMax * (u1 * u1 - u0 * u0);
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
  muS = liftMu(muS);
  vec2 uv = vec2(muS * 0.5 + 0.5, (r - uBottom) / (uTop - uBottom));
  uv = clamp(uv, vec2(0.0), vec2(1.0));
  uv = vec2(0.5 / 32.0) + uv * (31.0 / 32.0);
  return texture(tMS, uv).rgb;
}
`;

// The far sky: the air a true-size world's sky holds past what the drawn one's marches reach. The world is
// drawn a 64th of its size under air of real height, so a ray along the ground leaves the drawn air after
// ~40 km, where on the true world it runs ~300 km on, through the air that after sunset is still in the
// sun: the band of orange and pink toward where the sun went down, the dusty evening's deep pink, came
// from there and weren't drawn (Dave: "it's the sky not clouds that turn super duper pink"). So for each
// way from where the camera stands (its height over the datum; the sun's height there), a ray on the
// true-size sphere, its light past the drawn ray's length (marched, the same air, the same sun and multiple
// scattering LUTs, the true horizon's shadow), dimmed by the true air between it and the camera (not by the
// near pass's: its ground haze at the game's scale stands for the distance this light has already come,
// and dimmed it twice); only the clouds in front take it further. Elevation mapped as its square root (most
// rows near the horizon), azimuth from the sun's (Hillaire 2020's sky-view LUT, its far part only)
export const SKYVIEW_FRAG = /* glsl */`
${LUT_COMMON}
uniform float uGround;
${SAMPLE_TRANS}
${SAMPLE_MS}
uniform float uCamH;    // the camera's height over the datum (m, as drawn)
uniform float uSunMu;   // the sun's height there (its zenith cosine)
uniform float uSkyMaxS; // the near pass's longest march (m)
varying vec2 vUv;
// (the distance along unit d from p to the sphere of radius rr from inside it; -1 if it misses from outside)
float exitSphere(vec3 p, vec3 d, float rr) { float b = dot(p, d), c = dot(p, p) - rr * rr, q = b * b - c; return q < 0.0 ? -1.0 : -b + sqrt(q); }
float hitSphere(vec3 p, vec3 d, float rr) { float b = dot(p, d), c = dot(p, p) - rr * rr, q = b * b - c; if (q < 0.0) return -1.0; float t = -b - sqrt(q); return t > 0.0 ? t : -1.0; }
void main() {
  float v = vUv.y * 2.0 - 1.0, el = sign(v) * v * v * 1.5707963, az = vUv.x * 3.14159265;
  vec3 D = vec3(cos(el) * cos(az), sin(el), cos(el) * sin(az));
  vec3 sun = vec3(sqrt(max(0.0, 1.0 - uSunMu * uSunMu)), uSunMu, 0.0);
  float K = max(uTrueK, 1.0), Rt = uRadius * K, topH = uTop - uRadius, grH = uGround - uRadius;
  // (the drawn ray's length: to the drawn air's top, or its ground; and the true one's)
  vec3 cD = vec3(0.0, uRadius + uCamH, 0.0), cT = vec3(0.0, Rt + uCamH, 0.0);
  float sD = exitSphere(cD, D, uTop), gD = hitSphere(cD, D, uGround);
  if (gD > 0.0) sD = min(sD, gD);
  sD = min(sD, uSkyMaxS);
  float sT = exitSphere(cT, D, Rt + topH), gT = hitSphere(cT, D, Rt + grH);
  if (gT > 0.0) sT = min(sT, gT);
  if (!(sT > sD + 1.0)) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }
  float cosT = dot(D, sun), pR = phaseRayleigh(cosT), pM = phaseMie(cosT, uMieG);
  // (steps squared from the camera over the whole true ray: the light past the drawn ray's end, dimmed by
  // the air all the way back)
  const int N = 40;
  vec3 L = vec3(0.0), T = vec3(1.0);
  for (int i = 0; i < N; i++) {
    float u0 = float(i) / float(N), u1 = float(i + 1) / float(N);
    float s = sT * (u0 * u0 + u1 * u1) * 0.5, ds = sT * (u1 * u1 - u0 * u0);
    vec3 p = cT + D * s;
    float r = length(p), h = r - Rt, rr = uRadius + h;
    vec3 sR, sM, e;
    mediumAt(rr, sR, sM, e);
    vec3 Ts = exp(-e * ds);
    if (s > sD) {
      float muS = dot(p / r, sun);
      float cosH = -sqrt(max(0.0, 1.0 - ((Rt + grH) / max(r, Rt + grH)) * ((Rt + grH) / max(r, Rt + grH))));
      vec3 sunT = transmittanceToTop(rr, muS) * smoothstep(cosH - 0.004, cosH + 0.004, muS);
      vec3 ms = multiScatter(rr, muS);
      vec3 S = sR * (sunT * pR + ms) + sM * (sunT * pM + ms);
      L += T * (S - S * Ts) / max(e, vec3(1e-14));
    }
    T *= Ts;
  }
  gl_FragColor = vec4(L, 1.0);
}
`;

// the far sky's light along a ray D (world) at the camera, per unit sun (after the near pass's own march:
// times only its clouds' transmittance); 0 from high up (the drawn and the true world's skies one there)
export const GLSL_SKY_FAR = /* glsl */`
uniform sampler2D tSkyView;
uniform vec4 uSkyView;   // x its share (1 low down, 0 from high up); y, z the drawn and the true horizon's dip there (rad)
uniform vec3 uSkyUp;     // the camera's up (world)
uniform vec3 uSkySunH;   // the sun's way along the ground there (world, unit): the azimuths' zero
// a drawn elevation as the true world's (rad): the drawn horizon dips further (its ball a 64th the size: ~3
// degrees from 140 m, the true one's 0.4), so near it the sky's elevations stretched, the true horizon's
// onto the drawn skyline (the far sky's band sat a few degrees over the treeline, a dim gap under it, and
// the sun set in mid-air over it: Dave), none from 12 degrees up
const float SKY_E1 = 0.2094;
float skyTrueEl(float e) { return e >= SKY_E1 ? e : SKY_E1 - (SKY_E1 - e) * (SKY_E1 + uSkyView.z) / (SKY_E1 + uSkyView.y); }
vec3 skyFar(vec3 D) {
  if (uSkyView.x <= 0.0) return vec3(0.0);
  float s = clamp(dot(D, uSkyUp), -1.0, 1.0), el = skyTrueEl(asin(s));
  vec3 hD = D - uSkyUp * s;
  float hl = length(hD), az = hl > 1e-5 ? acos(clamp(dot(hD / hl, uSkySunH), -1.0, 1.0)) : 0.0;
  float v = 0.5 + 0.5 * sign(el) * sqrt(abs(el) / 1.5707963);
  return texture(tSkyView, vec2(az / 3.14159265, v)).rgb * uSkyView.x;
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
      vec3 thr = vec3(1.0), L = vec3(0.0);
      float cs = dot(dir, sunDir);
      for (int s = 0; s < STEPS; s++) {
        // (squared steps: the ground haze near the start)
        float u0 = float(s) / float(STEPS), u1 = float(s + 1) / float(STEPS);
        float t = tMax * (u0 * u0 + u1 * u1) * 0.5, dt = tMax * (u1 * u1 - u0 * u0);
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
float gPixA;   // (the angle a pixel spans: set at the top of main, in uniform control flow)
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
// the aurora's brightness at a body-fixed direction; blur (rad): how far the sample stands for
// across the arcs (a curtain thinner than a ray's step between shells, seen aslant from orbit, drew
// as a row of dots): the arcs widened by it, their light kept
float auroraArcs(vec3 pf, float blur) {
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
    float w0 = uAurora.z * 0.035, w = sqrt(w0 * w0 + blur * blur);
    float d = (aml - lineLat) / w;
    float arc = exp(-d * d) * w0 / w;
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
      // (the ray's sideways run across one slab, and the pixel's span there)
      float blur = (slab * sqrt(max(1.0 - mu * mu, 0.0)) / max(abs(mu), 0.04) + t * gPixA) / a;
      float b = auroraArcs(uToFixed * (p / a), blur);
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
${GLSL_SKY_FAR}
${GLSL_NOISE}
uniform sampler2D tColor;
uniform sampler2D tDepth;
uniform vec3 uCenter;      // planet centre relative to the camera (world axes)
uniform vec3 uSunDir;
uniform vec3 uSunE;        // sun illuminance (rgb) at the planet
uniform vec3 uMoonDir;     // and by night its brightest moon's (moonlight.js: 0 by day)
uniform vec3 uMoonE;
uniform mat3 uCamRot;      // view -> world rotation
uniform vec2 uTanHalf;
uniform mat3 uToFixed;     // world -> body-fixed rotation
uniform float uTime;
uniform vec4 uCloud;       // altitude, thickness, cover, scale
uniform vec4 uCloudColor;  // rgb, opacity
uniform float uCloudOn;
uniform sampler2D tCloudMap;
uniform float uCloudMapMean;   // (0 without a cloud map, else its mean over the globe)
uniform float uSteps;
uniform float uExposureHint;
varying vec2 vUv;

float ign(vec2 p) { return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }

uniform sampler3D tNoise;
uniform float uWindMax;
${GLSL_AIRLIGHT}
${GLSL_THERMAL}
${GLSL_TERRAIN_SHADOW}
vec3 gEm;   // (emitted light along the ray so far: not lit by the sun, so kept apart)
${GLSL_CLOUD_N}
// Same coverage field as the volumetric pass (render/volume.js, mode 1), so
// switching between the far 2D shell and near 3D clouds is seamless.
float cloudDensity(vec3 pFixedDir, float foot) {
  vec3 pf = pFixedDir * uRadius, gA, gB;
  cloudGens(pFixedDir, gA, gB);
  float d = 0.0;
  for (int j = 0; j < 2; j++) {
    vec3 g = j == 0 ? gA : gB;
    if (g.x <= 0.005) continue;
    vec3 q = cloudAdvect(pf, pFixedDir, g);
    float cov = cloudCover(q, pFixedDir, foot, cloudBias(uCloud.z));
    d += g.x * cov * smoothstep(0.15, 0.55, cloudDetail(q, foot) * cov + 0.25);
  }
  return d;
}

// march [t0,t1] accumulating in-scattering; positions via the perpendicular
// offset (p = (t - tca) * D - perp) to stay precise far from the planet
// (Lm: the moon's, by night: the same air lit from its way)
void march(float t0, float t1, vec3 D, float tca, vec3 perp, float cosTheta, float jitter, inout vec3 L, inout vec3 T, int steps, inout vec3 Lm) {
  if (t1 <= t0) return;
  float dt = (t1 - t0) / float(steps);
  // (from a camera low in the air, the steps squared, closer near it: along the ground the haze's few
  // hundred metres up are where the light comes from, and in even steps a horizon ray's first one spans
  // tens of km)
  bool sq = t0 < 1.0 && length(uCenter) - uRadius < 4.0 * uHaze.y;
  vec3 upC = normalize(-uCenter);
  float kT = trueK(length(uCenter) - uRadius);
  float pR = phaseRayleigh(cosTheta), pM = phaseMie(cosTheta, uMieG);
  bool moon = uMoonE.g > 0.0;
  float cosM = dot(D, uMoonDir), pRm = phaseRayleigh(cosM), pMm = phaseMie(cosM, uMieG);
  for (int i = 0; i < 32; i++) {
    if (i >= steps) break;
    float t = t0 + (float(i) + jitter) * dt;
    float dti = dt;
    if (sq) { float u = (float(i) + jitter) / float(steps); t = t0 + (t1 - t0) * u * u; dti = (t1 - t0) * 2.0 * u / float(steps) + 1e-3; }
    vec3 p = (t - tca) * D - perp;
    float r = length(p);
    vec3 sR, sM, e;
    mediumAt(r, sR, sM, e);
    vec3 nT = trueUp(p, r, upC, kT);
    float muS = dot(nT, uSunDir);
    vec3 sunT = sunTransmittance(r, muS);
    // (air in a mountain's shadow: terrainShadow.js)
    if (uHeightCube.x > 0.5 && r < uRadius + uHeightCube.z) sunT *= airShadow(uToFixed * p, uToFixed * uSunDir, uRadius);
    vec3 ms = multiScatter(r, muS);
    vec3 S = sR * (sunT * pR + ms) + sM * (sunT * pM + ms);
    vec3 Ts = exp(-e * dti);
    vec3 eSafe = max(e, vec3(1e-14));
    L += T * (S - S * Ts) / eSafe;
    if (moon) {
      float muM = dot(nT, uMoonDir);
      vec3 mT = sunTransmittance(r, muM), mms = multiScatter(r, muM);
      vec3 Sm = sR * (mT * pRm + mms) + sM * (mT * pMm + mms);
      Lm += T * (Sm - Sm * Ts) / eSafe;
    }
    gEm += T * airLight(p, r) * dti;
    // (a hot world's air glows from where the step's light comes from: one optical depth in, or its
    // middle when it is thin; at the jittered sample the glow's fall with height showed as dither)
    if (uThermal.x > 0.0) {
      float te = t0 + float(i) * dt + min(0.5 * dt, 1.0 / max(e.g, 1e-12));
      gEm += T * (vec3(1.0) - Ts) * airHeatGlow(length((te - tca) * D - perp));
    }
    T *= Ts;
  }
}

layout(location = 0) out highp vec4 outL;
layout(location = 1) out highp vec4 outT;
void main() {
  // (the ray through the one full-resolution pixel whose depth this half-resolution fragment reads:
  // its 2x2 block's centre ray with one of its four depths sent a sky ray into the ground where a
  // horizon crossed the block, a dark dash along the skyline that the sky pixels took up)
  ivec2 px = depthPixel(tDepth, vUv);
  vec2 ndc = (vec2(px) + 0.5) / vec2(textureSize(tDepth, 0)) * 2.0 - 1.0;
  vec3 dView = normalize(vec3(ndc.x * uTanHalf.x, ndc.y * uTanHalf.y, -1.0));
  vec3 D = normalize(uCamRot * dView);
  gPixA = length(fwidth(D));
  float depth = texelFetch(tDepth, px, 0).r;
  float sceneDist = isSkyDepth(depth) ? 1e30 : viewZFromDepth(depth) / max(-dView.z, 1e-4);

  vec2 hit = raySphere(uCenter, uTop, D);
  if (hit.y <= 0.0 || hit.x > hit.y || hit.x > sceneDist) { outL = vec4(0.0); outT = vec4(1.0); return; }
  // (a sky pixel: nothing in it short of the air's top (the sun's disc, a moon: beyond it))
  bool skyPx = sceneDist > 1e29 || sceneDist > hit.y;
  gHazeK = skyPx ? 1.0 - uSkyView.x : 1.0;
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
  vec3 L = vec3(0.0), T = vec3(1.0), Lm = vec3(0.0);
  gEm = vec3(0.0);

  // cloud shell intersection
  float tc = -1.0, graze = 1.0;
  if (uCloudOn > 0.5) {
    float rc = uRadius + uCloud.x;
    vec2 ch = raySphere(uCenter, rc, D);
    float camR = length(uCenter);
    if (ch.y > 0.0 && ch.x < ch.y) {
      float cand = camR > rc ? ch.x : ch.y;
      if (cand > t0 && cand < t1) tc = cand;
    } else if (camR > rc && tca > t0 && tca < t1) {
      // (a ray passing over the shell from above still grazes the deck's tops, which thin with height
      // over a quarter of its thickness: opaque at the shell, half as at two of those heights above
      // it, so the limb is soft; a bare shell ended in a hard ring inside the disc where the air above
      // it goes on, Vovuld's from space)
      float hb = length(perp) - rc, Hc = max(uCloud.y * 0.25, 1.0);
      if (hb < 6.0 * Hc) { tc = tca; graze = 1.0 - exp(-7.4 * exp(-hb / Hc)); }
    }
  }
  vec3 aNear, aFar;
  auroraRay(D, tca, perp, min(hit.y, sceneDist), jitter, aNear, aFar);
  // (a sky pixel: the far air past the drawn march, as on the true-size world, SKYVIEW_FRAG)
  vec3 far = skyPx ? skyFar(D) : vec3(0.0);
  if (tc < 0.0) {
    march(t0, t1, D, tca, perp, cosTheta, jitter, L, T, steps, Lm);
    outL = vec4((L + far) * uSunE + Lm * uMoonE + gEm + aNear + T * aFar, 1.0); outT = vec4(T, 1.0);
    return;
  }
  // segment before the cloud
  march(t0, tc, D, tca, perp, cosTheta, jitter, L, T, steps / 2 + 2, Lm);
  vec3 em1 = gEm;
  gEm = vec3(0.0);
  vec3 pc = (tc - tca) * D - perp;
  float rc = length(pc);
  vec3 up = pc / rc;
  float dens = cloudDensity(normalize(uToFixed * up), tc * gPixA);
  float alpha = clamp(dens * uCloudColor.a, 0.0, 1.0) * graze;
  vec3 L2 = vec3(0.0), T2 = vec3(1.0), Lm2 = vec3(0.0);
  march(tc, t1, D, tca, perp, cosTheta, jitter, L2, T2, steps / 2 + 2, Lm2);
  vec3 cl = vec3(0.0), clm = vec3(0.0);
  if (alpha > 0.002) {
    vec3 upT = trueUp(pc, rc, normalize(-uCenter), trueK(length(uCenter) - uRadius));
    float muS = dot(upT, uSunDir);
    vec3 sunT = sunTransmittance(rc, muS);
    vec3 amb = multiScatter(rc, muS) * 6.0;
    bool fromBelow = dot(D, up) > 0.0;
    float lambert = max(muS, 0.0) * 0.6 + 0.4 * smoothstep(-0.1, 0.3, muS);
    float silver = 1.0 + 1.5 * pow(max(cosTheta, 0.0), 12.0);
    vec3 lit = uCloudColor.rgb * (sunT * lambert * silver / PI_A + amb);
    if (fromBelow) lit *= mix(0.55, 0.18, dens);
    cl = lit;
    // (and the moon's on it by night)
    if (uMoonE.g > 0.0) {
      float muM = dot(upT, uMoonDir);
      float lm = max(muM, 0.0) * 0.6 + 0.4 * smoothstep(-0.1, 0.3, muM);
      clm = uCloudColor.rgb * (sunTransmittance(rc, muM) * lm / PI_A + multiScatter(rc, muM) * 6.0);
      if (fromBelow) clm *= mix(0.55, 0.18, dens);
    }
  }
  // final = scene * T*(1-a)*T2 + L + T*((1-a)*L2 + a*cl)
  outT = vec4(T * (1.0 - alpha) * T2, 1.0);
  outL = vec4((L + T * ((1.0 - alpha) * L2 + alpha * cl) + (1.0 - alpha) * far) * uSunE + (Lm + T * ((1.0 - alpha) * Lm2 + alpha * clm)) * uMoonE + em1 + T * (1.0 - alpha) * gEm + aNear + T * (1.0 - alpha) * T2 * aFar, 1.0);
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
// the ground haze's scattering at the render's red, green and blue (~680, 550, 440 nm) over green's,
// by its Angstrom exponent (bodies.js atmosphereRender haze[3])
export function hazeColour(haze) {
  const a = haze && haze[3] > 0 ? haze[3] : 0;
  return new THREE.Vector3(Math.pow(550 / 680, a), 1, Math.pow(550 / 440, a));
}

export class Atmosphere {
  constructor(renderer, body) {
    this.body = body;
    const a = body.atm.render;
    const d = body.data;
    const giant = !!body.giant;
    const R = body.R;
    const relief = body.relief || 0;
    const hasSea = d.terrain && d.terrain.ocean > 0 && d.terrain.liquid;
    this.radius = R;
    this.ground = giant ? R - Math.min(a.depth || 0, R * 0.2) : R + (hasSea ? 0 : -relief * 0.4);
    this.bottom = this.ground;
    this.top = R + a.height;
    this.params = {
      uRadius: { value: R },
      // (its true size over its drawn one: the sunlight's way through its air as on the true world)
      uTrueK: { value: d.radiusM > 0 && R > 0 ? Math.max(1, d.radiusM / R) : 1 },
      uBottom: { value: this.bottom },
      uTop: { value: this.top },
      uGround: { value: this.ground },
      uRayleigh: { value: v3(a.rayleigh) },
      uRayleighH: { value: a.rayleighH },
      uMie: { value: v3(a.mie) },
      uMieAbs: { value: v3(a.mieAbs) },
      uMieH: { value: a.mieH },
      uHaze: { value: new THREE.Vector4(...(a.haze || [0, 1000, 0, 0])) },
      uHazeCol: { value: hazeColour(a.haze) },
      uKnee: { value: a.knee != null && isFinite(a.knee) ? a.knee : 1e12 },
      uUpper: { value: a.upper || 1 },
      uMieG: { value: a.mieG },
      uAbs: { value: v3(a.ozone) },
      uAbsCenter: { value: a.ozoneCenter || 0 },
      uAbsWidth: { value: a.ozoneWidth || 1 },
      uAbsExp: { value: a.absorptionExp ? 1 : 0 },
      uGroundAlbedo: { value: new THREE.Vector3(0.18, 0.18, 0.18) },
      uThermal: { value: thermalUniform(body) },
      // (the ground's heights for the air's shadows: world.js hands over its cube's uniforms)
      tHeightCube: { value: null }, uHeightCube: { value: new THREE.Vector4(0, 1, 0, 1) },
      // (the far sky, SKYVIEW_FRAG: updateSkyView each frame where the camera is)
      tSkyView: { value: null }, uSkyView: { value: new THREE.Vector4(0, 0, 0, 0) },
      uSkyUp: { value: new THREE.Vector3(0, 1, 0) }, uSkySunH: { value: new THREE.Vector3(1, 0, 0) },
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
    // (the air's own aerosols, before any dust the wind raises: setDust adds it to them)
    this.base = { mie: a.mie.slice(), mieAbs: a.mieAbs.slice(), mieH: a.mieH, mieG: a.mieG, haze: (a.haze || [0, 1000, 0, 0]).slice() };
    this.dust = 0;
    const dc = d.terrain && d.terrain.palette && (d.terrain.palette.regolith || d.terrain.palette.soil);
    this.dustCol = dc ? dc.slice(0, 3) : [0.5, 0.4, 0.3];
    this.trans = lutTarget(256, 64);
    this.ms = lutTarget(32, 32);
    this.irr = lutTarget(64, 16);
    this.skyView = lutTarget(192, 128);
    this.sunLift = { value: new THREE.Vector2(0, 0) };
    this.params.tSkyView.value = this.skyView.texture;
    this.generate(renderer);
    this.readBack(renderer);
    this.material = this.makePassMaterial();
  }

  // the dust the wind's raised where the camera is (sim/dust.js: tau, its optical depth straight up at 550 nm)
  // added to the air's aerosols: a few km deep (~2.5 km: a dust layer's scale height), forward-scattering
  // (g ~0.7). What a wind lifts off fields, tracks and banks and carries is mostly the fine fraction (the
  // coarse settles within hours): its extinction falling with wavelength, an Angstrom exponent ~1.2 (a
  // desert storm's coarse dust ~0.3, grey: a green country's windy day nearer a smoke's), so the low sun's
  // light through it loses its blue and the haze it lights glows orange and pink; its iron oxides taking a
  // little more of the blue (single-scattering albedo ~0.97 red to ~0.9 blue for a tan soil, darker soils'
  // less: Dubovik et al. 2002). The far ground lost in its haze. The LUTs made again when it's changed by a tenth or so
  // (a few ms); none from high up (the dust is a region's, the world seen whole its own air's). And the sea's
  // spray (salt: its optical depth): a white haze low down (~1.2 km), scattering nearly grey (a little
  // more in the blue), taking almost nothing
  setDust(renderer, tau, salt = 0) {
    tau = Math.max(0, tau || 0); salt = Math.max(0, salt || 0);
    const near = (a, b) => Math.abs(a - b) < Math.max(0.02, 0.1 * Math.max(a, b));
    if (near(tau, this.dust) && near(salt, this.salt || 0)) return false;
    this.dust = tau; this.salt = salt;
    const B = this.base, p = this.params, c = this.dustCol, Hd = 2500, k = tau / Hd, Hs = 1200, ks = salt / Hs;
    const lum = Math.max(0.05, 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]);
    const sca = [0, 0, 0], abs = [0, 0, 0];
    for (let i = 0; i < 3; i++) {
      const ssa = 1 - 0.05 * Math.min(2.5, (1 - Math.min(c[i], 0.95)) / Math.max(1 - lum, 0.05)) ** 1.2;
      const ext = k * Math.pow(550 / [680, 550, 440][i], 1.2);
      sca[i] = ext * ssa; abs[i] = ext * (1 - ssa);
    }
    const ss = [0.92 * ks, ks, 1.09 * ks];
    const eB = B.mie[1] + B.mieAbs[1], eD = sca[1] + abs[1], eS = ss[1], eT = Math.max(eB + eD + eS, 1e-12);
    p.uMie.value.set(B.mie[0] + sca[0] + ss[0], B.mie[1] + sca[1] + ss[1], B.mie[2] + sca[2] + ss[2]);
    p.uMieAbs.value.set(B.mieAbs[0] + abs[0], B.mieAbs[1] + abs[1], B.mieAbs[2] + abs[2]);
    p.uMieH.value = (eB * B.mieH + eD * Hd + eS * Hs) / eT;
    p.uMieG.value = (eB * B.mieG + eD * 0.7 + eS * 0.75) / eT;
    // (and the near ground's haze, at the game's scale: thicker, toward the dust's colour)
    const h = B.haze, w = tau / (tau + 0.3), hc = hazeColour(h);
    p.uHaze.value.set(h[0] * (1 + 3 * tau + 2 * salt), h[1], h[2] + (0.12 - h[2]) * w, h[3]);
    p.uHazeCol.value.set(hc.x + ((sca[0] + abs[0]) / Math.max(eD, 1e-12) * 0.97 - hc.x) * w, 1, hc.z + ((sca[2] + abs[2]) / Math.max(eD, 1e-12) - hc.z) * w);
    this.generate(renderer);
    this.readBack(renderer);
    return true;
  }

  // the far sky from where the camera is (SKYVIEW_FRAG): its height over the datum (m), its up and the sun's
  // way (world, unit), the near pass's longest march (m), its share (0 from high up: none drawn)
  updateSkyView(renderer, camH, up, sunDir, maxS, share) {
    const p = this.params;
    p.uSkyView.value.x = share;
    if (!(share > 0)) return;
    const mu = Math.max(-1, Math.min(1, up.dot(sunDir)));
    p.uSkyUp.value.copy(up);
    const h = p.uSkySunH.value.copy(sunDir).addScaledVector(up, -mu);
    if (h.lengthSq() < 1e-10) h.set(1, 0, 0).addScaledVector(up, -up.x);
    h.normalize();
    // (the drawn horizon's dip and the true one's: skyTrueEl)
    const hd = Math.max(1, camH), K = Math.max(1, p.uTrueK.value);
    p.uSkyView.value.y = Math.sqrt(2 * hd / this.radius); p.uSkyView.value.z = Math.sqrt(2 * hd / (this.radius * K));
    if (!this.skyMat) {
      // (its own ground haze none: that haze is the game's stand-in for the distance the drawn world leaves
      // out, and over the true one's hundreds of km it took all the far sky's light)
      this.skyMat = new THREE.ShaderMaterial({
        uniforms: { ...this.params, uHaze: { value: new THREE.Vector4(0, 1000, 0, 0) }, tTrans: { value: this.trans.texture }, tMS: { value: this.ms.texture }, uCamH: { value: 0 }, uSunMu: { value: 0 }, uSkyMaxS: { value: 1e30 } },
        vertexShader: FULLSCREEN_VERT, fragmentShader: SKYVIEW_FRAG, depthTest: false, depthWrite: false,
      });
    }
    const u = this.skyMat.uniforms;
    u.uCamH.value = Math.max(0, camH); u.uSunMu.value = this.liftMu(mu); u.uSkyMaxS.value = maxS;   // (the sun as the air sees it: liftMu)
    const prev = renderer.getRenderTarget();
    renderFullscreen(renderer, this.skyMat, this.skyView);
    renderer.setRenderTarget(prev);
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

  // the sun as the air sees it low over a drawn world (GLSL_MEDIUM liftMu; this.sunLift: world.js)
  liftMu(mu) {
    const dD = this.sunLift.value.x, dT = this.sunLift.value.y;
    if (!(dD > dT)) return mu;
    const e = Math.asin(Math.max(-1, Math.min(1, mu))), E1 = 0.2094;
    if (e >= E1) return mu;
    return Math.sin(e >= -dD ? E1 - (E1 - e) * (E1 + dT) / (E1 + dD) : e + (dD - dT));
  }

  // Sunlight transmittance at radius r, sun zenith cosine mu (incl. planet shadow)
  transmittance(r, mu, out = [1, 1, 1]) {
    mu = this.liftMu(mu);
    const top = this.top, bot = this.bottom;
    const rr = Math.min(Math.max(r, bot), top);
    const H = Math.sqrt(top * top - bot * bot);
    const rho = Math.sqrt(Math.max(0, rr * rr - bot * bot));
    const disc = rr * rr * (mu * mu - 1) + top * top;
    const d = Math.max(0, -rr * mu + Math.sqrt(Math.max(disc, 0)));
    const dMin = top - rr, dMax = rho + H;
    this._bilinear(this.cpuTrans, (d - dMin) / Math.max(dMax - dMin, 1e-6), rho / H, out);
    // (the true-size world's horizon at this height, as the shaders' sunTransmittance)
    const Rg = this.ground * Math.max(1, this.params.uTrueK.value), sinH = Rg / (Rg + Math.max(r - this.ground, 0));
    const cosH = -Math.sqrt(Math.max(0, 1 - sinH * sinH));
    const vis = Math.min(1, Math.max(0, (mu - (cosH - 0.01)) / 0.02));
    out[0] *= vis; out[1] *= vis; out[2] *= vis;
    return out;
  }

  skyIrradiance(r, mu, out = [0, 0, 0]) {
    mu = this.liftMu(mu);
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
    const clouds = d.atmosphere && d.atmosphere.clouds, ar = d.atmosphere && d.atmosphere.render;
    // (a cloud deck above the knee drawn where the squeezed air puts it)
    const cloudAlt = (z) => ar && ar.upper < 1 ? atmoAlt(z, ar.knee, ar.upper) : z;
    const u = {
      ...this.params,
      uSunLift: this.sunLift,
      tTrans: { value: this.trans.texture },
      tMS: { value: this.ms.texture },
      tColor: { value: null },
      tDepth: { value: null },
      uCenter: { value: new THREE.Vector3() },
      uSunDir: { value: new THREE.Vector3(1, 0, 0) },
      uSunE: { value: new THREE.Vector3(1, 1, 1) },
      uMoonDir: { value: new THREE.Vector3(0, 1, 0) },
      uMoonE: { value: new THREE.Vector3() },
      uCamRot: { value: new THREE.Matrix3() },
      uTanHalf: { value: new THREE.Vector2(1, 1) },
      uToFixed: { value: new THREE.Matrix3() },
      uTime: { value: 0 },
      uCloud: { value: new THREE.Vector4(clouds ? cloudAlt(clouds.altitude) : 0, clouds ? cloudAlt(clouds.altitude + clouds.thickness) - cloudAlt(clouds.altitude) : 0, clouds ? clouds.cover : 0, clouds ? clouds.scale : 1) },
      uCloudColor: { value: new THREE.Vector4(clouds ? clouds.color[0] : 1, clouds ? clouds.color[1] : 1, clouds ? clouds.color[2] : 1, clouds ? clouds.opacity : 0) },
      uCloudOn: { value: clouds && !this.body.giant ? 1 : 0 },
      tCloudMap: { value: blankCloudMap() }, uCloudMapMean: { value: 0 }, uCloudYear: { value: new THREE.Vector2() },
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
uniform float uTrueK;
uniform sampler2D tTrans;
uniform sampler2D tIrr;
uniform vec2 uSunLift;   // (the sun as the air sees it low over a drawn world: atmosphere.js GLSL_MEDIUM liftMu)
float liftMu(float mu) {
  if (uSunLift.x <= uSunLift.y) return mu;
  float e = asin(clamp(mu, -1.0, 1.0)), E1 = 0.2094;
  if (e >= E1) return mu;
  return sin(e >= -uSunLift.x ? E1 - (E1 - e) * (E1 + uSunLift.y) / (E1 + uSunLift.x) : e + (uSunLift.x - uSunLift.y));
}
vec2 transmittanceUV(float r, float mu) {
  float H = sqrt(max(0.0, uTop * uTop - uBottom * uBottom));
  float rho = sqrt(max(0.0, r * r - uBottom * uBottom));
  float disc = r * r * (mu * mu - 1.0) + uTop * uTop;
  float d = max(0.0, -r * mu + sqrt(max(disc, 0.0)));
  float dMin = uTop - r, dMax = rho + H;
  return vec2((d - dMin) / max(dMax - dMin, 1e-6), rho / max(H, 1e-6));
}
vec3 atmoSunTransmittance(float r, float mu) {
  mu = liftMu(mu);
  // (the true-size world's horizon at this height: atmosphere.js sunTransmittance)
  float Rg = uGround * max(uTrueK, 1.0), sinH = Rg / (Rg + max(r - uGround, 0.0));
  float cosH = -sqrt(max(0.0, 1.0 - sinH * sinH));
  float vis = smoothstep(cosH - 0.01, cosH + 0.01, mu);
  if (uHasAtmo < 0.5) return vec3(vis);
  vec2 uv = transmittanceUV(clamp(r, uBottom, uTop), mu);
  uv = vec2(0.5 / 256.0, 0.5 / 64.0) + uv * vec2(255.0 / 256.0, 63.0 / 64.0);
  return texture(tTrans, uv).rgb * vis;
}
vec3 atmoSkyIrradiance(float r, float mu) {
  if (uHasAtmo < 0.5) return vec3(0.0);
  mu = liftMu(mu);
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
