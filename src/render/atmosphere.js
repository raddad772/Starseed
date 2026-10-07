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
// the climate's cloud map at uv, read smoothly: a cubic B-spline over its texels, in four bilinear taps
// (Sigg and Hadwiger 2005). Read bilinearly its slope bent at every texel line (~2.4 km on a drawn
// world), and the cover's threshold drew the bends as straight edges, along the latitudes and longitudes:
// from below, looking east at sunset, a diagonal edge across the twilight (Dave)
vec3 cloudMapSmooth(vec2 uv) {
  vec2 sz = vec2(textureSize(tCloudMap, 0)), st = uv * sz - 0.5, i = floor(st), f = st - i;
  vec2 f2 = f * f, f3 = f2 * f;
  vec2 w0 = (1.0 - 3.0 * f + 3.0 * f2 - f3) / 6.0, w1 = (4.0 - 6.0 * f2 + 3.0 * f3) / 6.0;
  vec2 w2 = (1.0 + 3.0 * f + 3.0 * f2 - 3.0 * f3) / 6.0, w3 = f3 / 6.0;
  vec2 g0 = w0 + w1, g1 = w2 + w3;
  vec2 h0 = (i - 0.5 + w1 / g0) / sz, h1 = (i + 1.5 + w3 / g1) / sz;
  return g0.y * (g0.x * texture(tCloudMap, h0).rgb + g1.x * texture(tCloudMap, vec2(h1.x, h0.y)).rgb)
       + g1.y * (g0.x * texture(tCloudMap, vec2(h0.x, h1.y)).rgb + g1.x * texture(tCloudMap, h1).rgb);
}
// the climate's push on the cover at dirF: the bare belts of a Hadley circulation, or with the simulated
// climate's cloud map, the clouds moved to where it rains, as strongly as the weather's own spread so the
// climate's belts read from space; about its own mean, the world's cover setting the amount (a dry world's
// map and its low cover had counted its dryness twice); and its year, the swing's two parts turned by where
// the sun stands in it (uCloudYear cos and sin of its solar longitude, 0 without: the rain belts and the
// storm tracks follow the sun). Slow over the globe: read once per point, its decks and generations sharing it
float cloudClimate(vec3 dirF) {
  float lat = asin(clamp(dirF.y, -1.0, 1.0));
  if (uCloudMapMean <= 0.0) return 0.12 * cos(abs(lat) * 6.0);
  vec3 cm = cloudMapSmooth(vec2(atan(dirF.z, dirF.x) / 6.2832 + 0.5, lat / 3.14159 + 0.5));
  return (cm.r + (cm.g - 0.5) * uCloudYear.x + (cm.b - 0.5) * uCloudYear.y - uCloudMapMean) * 0.8;
}
// cover (0..1) at q (body-fixed m), clim its point's cloudClimate; bias: the world's cover moving the threshold
float cloudCoverC(vec3 q, float foot, float bias, float clim) {
  float L0 = uRadius * ${CLOUD_K[0].toFixed(3)}, L1 = uRadius * ${CLOUD_K[1].toFixed(3)};
  float f0 = cloudFade(foot, L0), f1 = cloudFade(foot, L1);
  // (drawn out along the winds: the noise squeezed across the axis, its systems twice as long east-west)
  vec3 qz = q * vec3(0.5, 1.0, 0.5);
  float a = f0 > 0.999 ? 0.682 : mix(textureLod(tNoise, qz / L0, 0.0).r, 0.682, f0);
  float b = f1 > 0.999 ? 0.682 : mix(textureLod(tNoise, qz / L1 + 0.5, 0.0).r, 0.682, f1);
  float spread = length(vec2(0.124 * f0, 0.083 * f1));
  return smoothstep(0.6 - bias - spread, 0.8 - bias + spread, cloudN(a * 0.6 + b * 0.4) + clim);
}
// cover (0..1) at q in direction dirF
float cloudCover(vec3 q, vec3 dirF, float foot, float bias) { return cloudCoverC(q, foot, bias, cloudClimate(dirF)); }
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
  // (the front ragged: where the hand-over falls jittered by noise over the globe (~10 and ~4 km cells on a
  // drawn world, up to a sixth of a life), its weights only, not the ages, so the clouds don't shear; a
  // smooth front ran a ruler line across the sky, two generations meeting along it (Dave: the diagonal
  // edge in the twilight). Under a fifth either way, a generation's weight never reaches its index's turn)
  float j = 0.16 * (textureLod(tNoise, dirF * 9.0, 0.0).g - textureLod(tNoise, dirF * 23.0 + 0.37, 0.0).g);
  float fj = fract(s + j);
  float wa = smoothstep(0.4, 0.6, 1.0 - abs(2.0 * fj - 1.0));
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
  float c = 0.0, clim = cloudClimate(dirF);
  if (gA.x > 0.005) c += gA.x * cloudCoverC(cloudAdvect(pf, dirF, gA), foot, bias, clim);
  if (gB.x > 0.005) c += gB.x * cloudCoverC(cloudAdvect(pf, dirF, gB), foot, bias, clim);
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
uniform vec3 uMieG;    // the aerosols' phase per channel (aerosols.js fitPhase): the broad lobe's asymmetry,
uniform vec3 uMieF;    // the forward lobe's share,
uniform vec3 uMieGL;   // and its asymmetry
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
uniform vec2 uSunLift;
// the sky's lens from low over a drawn world (world.js; uSunLift x the drawn horizon's dip from the camera,
// y the true world's, zero far off): the drawn world's ball a 64th of the size, its horizon dips further, so
// the sky is drawn through a gentle fisheye about the zenith: each way's angle from the zenith stretched (the
// true horizon's onto the drawn one's; below it, what's left of the half below squeezed), so the sun, the
// moons and the stars rise and set at the drawn skyline, their paths and the world's tilt kept (Dave: "a
// bit like putting the sky under a fisheye lens"); the air's optics through it backwards, the true sky's
float lensTrueZ(float zd) {
  float hD = 1.5707963 + uSunLift.x, hT = 1.5707963 + uSunLift.y;
  return zd <= hD ? zd * hT / hD : hT + (zd - hD) * (3.14159265 - hT) / (3.14159265 - hD);
}
// (the true sun's height for the drawn one's: through the lens backwards)
float liftMu(float mu) {
  if (uSunLift.x <= uSunLift.y) return mu;
  return cos(lensTrueZ(acos(clamp(mu, -1.0, 1.0))));
}
// (the ground haze's share: 0 for a sky pixel's ray, which reaches no far ground for it to stand in front of;
// the haze is the game's stand-in for the distance the drawn world leaves out, and over a ray toward the
// horizon it took the setting sun and paled the low sky (the passes' mains set it))
float gHazeK = 1.0;
// (the near passes' sunlit air's share: 0 for a sky pixel from low down, whose sunlit air is the true-size
// world's, SKYVIEW_FRAG; its moonlit air, its clouds and the air's dimming of them kept)
float gAirSun = 1.0;
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
// a drawn height (m over the datum) as the real one its air stands for, and back: real up to the knee,
// squeezed by uUpper above it
float realH(float h) { return h <= uKnee ? h : uKnee + (h - uKnee) / uUpper; }
float drawnH(float hr) { return hr <= uKnee ? hr : uKnee + (hr - uKnee) * uUpper; }
// the air at a real height (m): the true-size world's marches (the sun's way through it, the sky seen from
// low down) take the air as it is, its upper air unsqueezed (squeezed, the drawn air above ~12 km keeps an
// eighth of its column, so from orbit the limb is a thin line: in these marches the stratosphere, and most
// of the ozone, an eighth of themselves, the twilight's purple and pink from the ozone the low sun's light
// crosses edge-on (it takes the yellow-green, red and blue left) mostly gone: Dave, "gotta keep working on
// that pink"); the ozone's band and the ground haze where the drawn air has them
void mediumAtReal(float hr, out vec3 scatR, out vec3 scatM, out vec3 ext) {
  float h = drawnH(hr);
  float dR = exp(-hr / uRayleighH);
  float dM = exp(-hr / uMieH);
  float dA = uAbsExp > 0.5 ? dR : max(0.0, 1.0 - abs(h - uAbsCenter) / max(uAbsWidth, 1.0));
  vec3 dH = uHaze.x * gHazeK * exp(-max(hr, 0.0) / max(uHaze.y, 1.0)) * uHazeCol;
  scatR = uRayleigh * dR;
  scatM = uMie * dM + dH;
  ext = scatR + scatM + uMieAbs * dM + uAbs * dA + dH * uHaze.z;
}
float phaseRayleigh(float c) { return 3.0 / (16.0 * PI_A) * (1.0 + c * c); }
// the aerosols' phase function per channel: a broad Cornette-Shanks lobe and a forward Henyey-Greenstein one,
// each channel's shares and spreads fitted to the world's aerosols' own (gen/worldsim/aerosols.js: Mie
// theory over their sizes, and fractal aggregates'). The forward lobe the particles' diffraction peak, the
// solar aureole (a hazy sun glows, and looks bigger for it: Dave); where they take the blue (a red world's
// dust) what blue they scatter they scatter into it, round the sun: a Martian sunset's blue
float phaseCS(float c, float g) {
  float g2 = g * g;
  return 3.0 / (8.0 * PI_A) * ((1.0 - g2) * (1.0 + c * c)) / ((2.0 + g2) * pow(max(1.0 + g2 - 2.0 * g * c, 1e-4), 1.5));
}
float phaseHG(float c, float g) { return (1.0 - g * g) / (4.0 * PI_A * pow(max(1.0 + g * g - 2.0 * g * c, 1e-6), 1.5)); }
vec3 phaseMie(float c) {
  return mix(vec3(phaseCS(c, uMieG.r), phaseCS(c, uMieG.g), phaseCS(c, uMieG.b)),
             vec3(phaseHG(c, uMieGL.r), phaseHG(c, uMieGL.g), phaseHG(c, uMieGL.b)), uMieF);
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
  // (no ground haze on the sun's way: it's the game's stand-in for the distance across the drawn ground the
  // drawn world leaves out, not air the sunlight crosses; over a low sun's true-length way it took ~300 times
  // its light, the setting sun a dim speck)
  gHazeK = 0.0;
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
  // (its heights the real ones: mediumAtReal)
  float K = max(uTrueK, 1.0), Rk = uRadius * K, rK = Rk + realH(r - uRadius), topK = Rk + realH(uTop - uRadius);
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
    mediumAtReal(rr - Rk, sR, sM, e);
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
// (for the LUTs built on the true-size world: the sunlight at true radius rK (the true world's radius Rk),
// its true cosine mu there: the transmittance LUT at the drawn radius it stands for, cut at the true world's
// horizon from that height)
vec3 sunAtTrue(float rK, float Rk, float mu) {
  float rD = uRadius + drawnH(rK - Rk);
  float gK = Rk + realH(uGround - uRadius), sinH = gK / max(rK, gK);
  float cosH = -sqrt(max(0.0, 1.0 - sinH * sinH));
  return transmittanceToTop(clamp(rD, uBottom, uTop), mu) * smoothstep(cosH - 0.004, cosH + 0.004, mu);
}
`;

export const MS_FRAG = /* glsl */`
${LUT_COMMON}
uniform float uGround;
uniform vec3 uGroundAlbedo;
${SAMPLE_TRANS}
varying vec2 vUv;
// The light scattered more than once: the mean intensity of the air's diffuse light at a height, for a sun
// at true cosine muS (the in-scatter of it, sigma_s x this, the sky's multiple scattering). A plane-parallel
// two-stream solve of the air's column on the world's true size at real heights (64 layers, each its own
// scattering, absorption and asymmetry by channel; the aerosols' forward peak left in the beam:
// delta-Eddington), the sun reaching each layer as through the true world's curved air (pseudo-spherical: a
// sun set at the ground still lighting the air above), the layers added from the ground up and the top
// down (the adding method: exact for any depth). Hillaire's estimate (the second order over the sphere, the
// rest its geometric series) went wrong in a deep haze: light diffusing through dozens of scatterings,
// each taking a little more of the blue, comes out orange under Titan's; summed as if each order escaped
// alike, its colour was lost, the sky lavender
vec3 mieAsym() {
  vec3 g = uMieG, g2 = g * g;
  vec3 csm = 3.0 * g * (4.0 + g2) / (5.0 * (2.0 + g2));
  return mix(csm, uMieGL, uMieF);
}
const int NL = 64;
// layer i of NL between the ground's height hG and the air's top hT (real m, squared spacing: fine low
// down): its diffuse reflectance R and transmittance T, and the direct beam's light it scatters up Su and
// down Sd
void msLayer(int i, float hG, float hT, float muS, float Rk, vec3 gM, out vec3 R, out vec3 T, out vec3 Su, out vec3 Sd) {
  float a0 = float(i) / float(NL), a1 = float(i + 1) / float(NL);
  float h0 = hG + (hT - hG) * a0 * a0, h1 = hG + (hT - hG) * a1 * a1, hm = 0.5 * (h0 + h1);
  vec3 sR, sM, e;
  mediumAtReal(hm, sR, sM, e);
  vec3 sc = sR + sM, tau = e * (h1 - h0);
  vec3 w = sc / max(e, vec3(1e-20)), g = sM * gM / max(sc, vec3(1e-20)), f = g * g;
  vec3 tauP = tau * (1.0 - w * f), wP = w * (1.0 - f) / max(1.0 - w * f, vec3(1e-6)), gP = (g - f) / max(1.0 - f, vec3(1e-6));
  vec3 g1 = 2.0 - wP * (1.0 + gP), g2 = wP * (1.0 - gP);
  vec3 k = sqrt(max(g1 * g1 - g2 * g2, vec3(0.0))), kt = min(k * tauP, vec3(30.0));
  vec3 ep = exp(kt), em = exp(-kt);
  vec3 sh = mix(tauP * (1.0 + kt * kt / 6.0), (ep - em) / (2.0 * max(k, vec3(1e-9))), step(vec3(1e-3), kt));
  vec3 den = 0.5 * (ep + em) + g1 * sh;
  R = g2 * sh / den; T = 1.0 / den;
  vec3 S = sunAtTrue(Rk + hm, Rk, muS) * w * tau * (1.0 - f);
  vec3 up = clamp(0.5 - 0.75 * gP * muS, 0.0, 1.0);
  Su = S * up; Sd = S * (1.0 - up);
}
void main() {
  gHazeK = 0.0;
  float muS = vUv.x * 2.0 - 1.0;
  float r = uBottom + (uTop - uBottom) * clamp(vUv.y, 0.002, 0.998);
  float K = max(uTrueK, 1.0), Rk = uRadius * K;
  float hG = realH(uGround - uRadius), hT = realH(uTop - uRadius), hP = max(realH(r - uRadius), hG);
  int jP = int(floor(sqrt(clamp((hP - hG) / max(hT - hG, 1.0), 0.0, 1.0)) * float(NL) + 0.5));
  vec3 gM = mieAsym(), R, T, Su, Sd;
  // (from the ground up to the point: the reflectance of all below, and the light coming up from it)
  vec3 Rb = uGroundAlbedo, U = uGroundAlbedo * sunAtTrue(Rk + hG, Rk, muS) * max(muS, 0.0);
  for (int i = 0; i < NL; i++) {
    if (i >= jP) break;
    msLayer(i, hG, hT, muS, Rk, gM, R, T, Su, Sd);
    vec3 d = 1.0 / max(1.0 - R * Rb, vec3(1e-6));
    U = Su + T * (U + Rb * Sd) * d;
    Rb = R + T * T * Rb * d;
  }
  // (from the top down to it: the reflectance of all above, and the light coming down from it)
  vec3 Ra = vec3(0.0), D = vec3(0.0);
  for (int n = 0; n < NL; n++) {
    int i = NL - 1 - n;
    if (i < jP) break;
    msLayer(i, hG, hT, muS, Rk, gM, R, T, Su, Sd);
    vec3 d = 1.0 / max(1.0 - R * Ra, vec3(1e-6));
    D = Sd + T * (D + Ra * Su) * d;
    Ra = R + T * T * Ra * d;
  }
  vec3 Fd = (D + Ra * U) / max(1.0 - Ra * Rb, vec3(1e-6));
  vec3 Fu = U + Rb * Fd;
  gl_FragColor = vec4((Fu + Fd) / (2.0 * PI_A), 1.0);
}
`;

const SAMPLE_MS = /* glsl */`
uniform sampler2D tMS;
// (at the true world's sun cosine muT: the LUTs' own coordinate)
vec3 multiScatterAt(float r, float muT) {
  vec2 uv = vec2(muT * 0.5 + 0.5, (r - uBottom) / (uTop - uBottom));
  uv = clamp(uv, vec2(0.0), vec2(1.0));
  uv = vec2(0.5 / 32.0) + uv * (31.0 / 32.0);
  return texture(tMS, uv).rgb;
}
vec3 multiScatter(float r, float muS) { return multiScatterAt(r, liftMu(muS)); }
`;

// The sky as on the true-size world: the world is drawn a 64th of its size under air of real height, so a
// ray along the ground left the drawn air after ~40 km where on the true world it runs ~300 km on, through
// the air that after sunset is still in the sun: the band of orange and pink toward where the sun went down
// came from there and wasn't drawn (Dave: "it's the sky not clouds that turn super duper pink"). So for each
// way from where the camera stands (its height; the sun's height there as the air sees it), the sunlit
// air's light along a ray on the true-size sphere, its air at real heights (mediumAtReal: the stratosphere
// and its ozone whole), the true horizon's shadow; a sky pixel from low down takes its sunlit air from here
// (the near passes keep its clouds, the moon's light and the ground's). Elevation mapped as its square
// root (most rows near the horizon), azimuth from the sun's (Hillaire 2020's sky-view LUT)
export const SKYVIEW_FRAG = /* glsl */`
${LUT_COMMON}
uniform float uGround;
${SAMPLE_TRANS}
${SAMPLE_MS}
uniform float uCamH;    // the camera's height over the datum (m, as drawn)
uniform float uSunMu;   // the sun's height there (its zenith cosine, as the air sees it: liftMu)
varying vec2 vUv;
// (the distance along unit d from p to the sphere of radius rr from inside it; -1 if it misses from outside)
float exitSphere(vec3 p, vec3 d, float rr) { float b = dot(p, d), c = dot(p, p) - rr * rr, q = b * b - c; return q < 0.0 ? -1.0 : -b + sqrt(q); }
float hitSphere(vec3 p, vec3 d, float rr) { float b = dot(p, d), c = dot(p, p) - rr * rr, q = b * b - c; if (q < 0.0) return -1.0; float t = -b - sqrt(q); return t > 0.0 ? t : -1.0; }
void main() {
  float v = vUv.y * 2.0 - 1.0, el = sign(v) * v * v * 1.5707963, az = vUv.x * 3.14159265;
  vec3 D = vec3(cos(el) * cos(az), sin(el), cos(el) * sin(az));
  vec3 sun = vec3(sqrt(max(0.0, 1.0 - uSunMu * uSunMu)), uSunMu, 0.0);
  // (the true-size world, its air at real heights: mediumAtReal)
  float K = max(uTrueK, 1.0), Rt = uRadius * K, grH = uGround - uRadius, Rg = Rt + grH;
  vec3 cT = vec3(0.0, Rt + realH(uCamH), 0.0);
  float sT = exitSphere(cT, D, Rt + realH(uTop - uRadius)), gT = hitSphere(cT, D, Rg);
  if (gT > 0.0) sT = min(sT, gT);
  if (!(sT > 1.0)) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }
  float cosT = dot(D, sun), pR = phaseRayleigh(cosT);
  vec3 pM = phaseMie(cosT);
  // (steps squared from the camera: along the ground the low air's few km are where the light comes from)
  const int N = 48;
  vec3 L = vec3(0.0), T = vec3(1.0);
  for (int i = 0; i < N; i++) {
    float u0 = float(i) / float(N), u1 = float(i + 1) / float(N);
    float s = sT * (u0 * u0 + u1 * u1) * 0.5, ds = sT * (u1 * u1 - u0 * u0);
    vec3 p = cT + D * s;
    float r = length(p), hr = r - Rt, rr = uRadius + drawnH(hr);
    vec3 sR, sM, e;
    mediumAtReal(hr, sR, sM, e);
    vec3 Ts = exp(-e * ds);
    float muS = dot(p / r, sun);
    float cosH = -sqrt(max(0.0, 1.0 - (Rg / max(r, Rg)) * (Rg / max(r, Rg))));
    vec3 sunT = transmittanceToTop(rr, muS) * smoothstep(cosH - 0.004, cosH + 0.004, muS);
    vec3 ms = multiScatter(rr, muS);
    vec3 S = sR * (sunT * pR + ms) + sM * (sunT * pM + ms);
    L += T * (S - S * Ts) / max(e, vec3(1e-14));
    T *= Ts;
  }
  gl_FragColor = vec4(L, 1.0);
}
`;

// the sunlit sky's light along a ray D (world) at the camera, per unit sun (SKYVIEW_FRAG: in place of the
// near pass's sunlit air, times its clouds' transmittance); 0 from high up (the drawn and the true world's
// skies one there)
export const GLSL_SKY_FAR = /* glsl */`
uniform sampler2D tSkyView;
uniform vec4 uSkyView;   // x its share (1 low down, 0 from high up); y, z the drawn and the true horizon's dip there (rad)
uniform vec3 uSkyUp;     // the camera's up (world)
uniform vec3 uSkySunH;   // the sun's way along the ground there (world, unit): the azimuths' zero
// a drawn elevation as the true world's (rad): through the sky's lens backwards (GLSL_MEDIUM lensTrueZ; the
// dips here uSkyView y, z: the far sky's band sat a few degrees over the treeline without it, and the sun
// set in mid-air over it: Dave)
float skyTrueEl(float e) {
  if (uSkyView.y <= uSkyView.z) return e;
  float zd = 1.5707963 - e, hD = 1.5707963 + uSkyView.y, hT = 1.5707963 + uSkyView.z;
  return 1.5707963 - (zd <= hD ? zd * hT / hD : hT + (zd - hD) * (3.14159265 - hT) / (3.14159265 - hD));
}
vec3 skyFar(vec3 D) {
  if (uSkyView.x <= 0.0) return vec3(0.0);
  float s = clamp(dot(D, uSkyUp), -1.0, 1.0), el = skyTrueEl(asin(s));
  vec3 hD = D - uSkyUp * s;
  float hl = length(hD), az = hl > 1e-5 ? acos(clamp(dot(hD / hl, uSkySunH), -1.0, 1.0)) : 0.0;
  float v = 0.5 + 0.5 * sign(el) * sqrt(abs(el) / 1.5707963);
  return texture(tSkyView, vec2(az / 3.14159265, v)).rgb * uSkyView.x;
}
`;

export const IRRADIANCE_FRAG = /* glsl */`
${LUT_COMMON}
uniform float uGround;
uniform vec3 uGroundAlbedo;
${SAMPLE_TRANS}
${SAMPLE_MS}
varying vec2 vUv;
// Sky irradiance on a horizontal surface at radius r (per unit sun illuminance): the sky over it on the
// world's true size at real heights (as the multiple scattering's), its LUT's sun cosine the true one
void main() {
  gHazeK = 0.0;
  float muS = vUv.x * 2.0 - 1.0;
  float r = uGround + (uTop - uGround) * clamp(vUv.y, 0.0, 1.0) + 1.0;
  float K = max(uTrueK, 1.0), Rk = uRadius * K;
  float rK = Rk + realH(r - uRadius), topK = Rk + realH(uTop - uRadius);
  vec3 sunDir = vec3(0.0, muS, sqrt(max(0.0, 1.0 - muS * muS)));
  vec3 pos = vec3(0.0, rK, 0.0);
  vec3 E = vec3(0.0);
  const int NA = 8, NB = 6, STEPS = 16;
  for (int a = 0; a < NA; a++) {
    for (int b = 0; b < NB; b++) {
      float th = 2.0 * PI_A * (float(a) + 0.5) / float(NA);
      float ct = (float(b) + 0.5) / float(NB); // cosine-weighted bands
      float st = sqrt(1.0 - ct * ct);
      vec3 dir = vec3(cos(th) * st, ct, sin(th) * st);
      float tMax = max(0.0, -rK * ct + sqrt(max(rK * rK * (ct * ct - 1.0) + topK * topK, 0.0)));
      vec3 thr = vec3(1.0), L = vec3(0.0);
      float cs = dot(dir, sunDir);
      vec3 pM = phaseMie(cs);
      float pR = phaseRayleigh(cs);
      for (int s = 0; s < STEPS; s++) {
        // (squared steps: the low air near the start)
        float u0 = float(s) / float(STEPS), u1 = float(s + 1) / float(STEPS);
        float t = tMax * (u0 * u0 + u1 * u1) * 0.5, dt = tMax * (u1 * u1 - u0 * u0);
        vec3 p = pos + dir * t;
        float rr = length(p);
        vec3 sR, sM, e;
        mediumAtReal(rr - Rk, sR, sM, e);
        vec3 Ts = exp(-e * dt);
        float mus = dot(p / rr, sunDir);
        vec3 sunT = sunAtTrue(rr, Rk, mus);
        vec3 ms = multiScatterAt(uRadius + drawnH(rr - Rk), mus);
        vec3 S = sR * (sunT * pR + ms) + sM * (sunT * pM + ms);
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
  float d = 0.0, clim = cloudClimate(pFixedDir);
  for (int j = 0; j < 2; j++) {
    vec3 g = j == 0 ? gA : gB;
    if (g.x <= 0.005) continue;
    vec3 q = cloudAdvect(pf, pFixedDir, g);
    float cov = cloudCoverC(q, foot, cloudBias(uCloud.z), clim);
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
  float pR = phaseRayleigh(cosTheta);
  vec3 pM = phaseMie(cosTheta);
  bool moon = uMoonE.g > 0.0;
  float cosM = dot(D, uMoonDir), pRm = phaseRayleigh(cosM);
  vec3 pMm = phaseMie(cosM);
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
    L += T * (S - S * Ts) / eSafe * gAirSun;
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
  gAirSun = gHazeK;
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

// the sky's lens (GLSL_MEDIUM lensTrueZ): a zenith angle through it, true to drawn (toDrawn) or back; dD, dT
// the drawn and the true horizon's dips
export function lensZ(z, dD, dT, toDrawn) {
  const hD = Math.PI / 2 + dD, hT = Math.PI / 2 + dT;
  if (!(dD > dT)) return z;
  return toDrawn ? (z <= hT ? z * hD / hT : hD + (z - hT) * (Math.PI - hD) / (Math.PI - hT))
    : (z <= hD ? z * hT / hD : hT + (z - hD) * (Math.PI - hT) / (Math.PI - hD));
}

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
      // (the aerosols' phase per channel: aerosols.js's fit; a giant's single asymmetry with the old aureole)
      uMieG: { value: v3(Array.isArray(a.mieG) ? a.mieG : [a.mieG ?? 0.76, a.mieG ?? 0.76, a.mieG ?? 0.76]) },
      uMieF: { value: v3(Array.isArray(a.mieF) ? a.mieF : [0.15, 0.15, 0.15]) },
      uMieGL: { value: v3(Array.isArray(a.mieGL) ? a.mieGL : [0.96, 0.96, 0.96]) },
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
    this.base = { mie: a.mie.slice(), mieAbs: a.mieAbs.slice(), mieH: a.mieH, haze: (a.haze || [0, 1000, 0, 0]).slice(),
      ph: [0, 1, 2].map((c) => [this.params.uMieG.value.getComponent(c), this.params.uMieF.value.getComponent(c), this.params.uMieGL.value.getComponent(c)]),
      dustUnit: a.dustUnit || null, saltUnit: a.saltUnit || null, dustPart: a.dustPart || null, saltPart: a.saltPart || null };
    // (the weather's dust and spray start as the world's mean, already in the base)
    this.dust = a.aerEmit ? a.aerEmit.dustTau || 0 : 0; this.salt = a.aerEmit ? a.aerEmit.saltTau || 0 : 0;
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
    // (each's optics per unit optical depth at 550 nm: the world's own (aerosols.js: its dust off its ground,
    // a day on the wind; its sea's spray), else as before: a tan soil's)
    const lum = Math.max(0.05, 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]);
    const DU = B.dustUnit || { ext: [0, 1, 2].map((i) => Math.pow(550 / [680, 550, 440][i], 1.2)), ssa: [0, 1, 2].map((i) => 1 - 0.05 * Math.min(2.5, (1 - Math.min(c[i], 0.95)) / Math.max(1 - lum, 0.05)) ** 1.2), fit: [[0.7, 0.15, 0.96], [0.7, 0.15, 0.96], [0.7, 0.15, 0.96]] };
    const SU = B.saltUnit || { ext: [0.92, 1, 1.09], ssa: [1, 1, 1], fit: [[0.75, 0.15, 0.96], [0.75, 0.15, 0.96], [0.75, 0.15, 0.96]] };
    const sca = [0, 0, 0], abs = [0, 0, 0], ss = [0, 0, 0], sa = [0, 0, 0];
    for (let i = 0; i < 3; i++) {
      const e = k * DU.ext[i]; sca[i] = e * DU.ssa[i]; abs[i] = e * (1 - DU.ssa[i]);
      const es = ks * SU.ext[i]; ss[i] = es * SU.ssa[i]; sa[i] = es * (1 - SU.ssa[i]);
    }
    // (in place of the world's mean dust and spray in the base: aerosols.js dustPart, saltPart)
    const DP = B.dustPart, SP = B.saltPart;
    const bm = [0, 1, 2].map((i) => Math.max(0, B.mie[i] - (DP ? DP.sca[i] : 0) - (SP ? SP.sca[i] : 0)));
    const ba = [0, 1, 2].map((i) => Math.max(0, B.mieAbs[i] - (DP ? DP.abs[i] : 0) - (SP ? SP.abs[i] : 0)));
    const eB = bm[1] + ba[1], eD = sca[1] + abs[1], eS = ss[1] + sa[1], eT = Math.max(eB + eD + eS, 1e-12);
    p.uMie.value.set(bm[0] + sca[0] + ss[0], bm[1] + sca[1] + ss[1], bm[2] + sca[2] + ss[2]);
    p.uMieAbs.value.set(ba[0] + abs[0] + sa[0], ba[1] + abs[1] + sa[1], ba[2] + abs[2] + sa[2]);
    p.uMieH.value = eT > 1e-11 ? (eB * B.mieH + eD * Hd + eS * Hs) / eT : B.mieH;
    // (the phase: each channel's lobes, weighted by what each scatters in it)
    for (let i = 0; i < 3; i++) {
      const wB = bm[i], wD = sca[i], wS = ss[i], wT = Math.max(wB + wD + wS, 1e-12);
      const mixp = (j) => (wB * B.ph[i][j] + wD * DU.fit[i][j] + wS * SU.fit[i][j]) / wT;
      p.uMieG.value.setComponent(i, mixp(0)); p.uMieF.value.setComponent(i, mixp(1)); p.uMieGL.value.setComponent(i, mixp(2));
    }
    // (and the near ground's haze, at the game's scale: thicker, toward the dust's colour)
    // (by what the weather adds over the world's mean, which the ground haze already has)
    const xD = Math.max(0, tau - (DP ? DP.tau : 0)), xS = Math.max(0, salt - (SP ? SP.tau : 0));
    const h = B.haze, w = xD / (xD + 0.3), hc = hazeColour(h);
    p.uHaze.value.set(h[0] * (1 + 3 * xD + 2 * xS), h[1], h[2] + (0.12 - h[2]) * w, h[3]);
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

  // the true sun's height for a drawn one's: through the sky's lens backwards (GLSL_MEDIUM; this.sunLift)
  liftMu(mu) {
    const dD = this.sunLift.value.x, dT = this.sunLift.value.y;
    if (!(dD > dT)) return mu;
    return Math.cos(lensZ(Math.acos(Math.max(-1, Math.min(1, mu))), dD, dT, false));
  }

  // Sunlight transmittance at radius r, sun zenith cosine mu (incl. planet shadow)
  transmittance(r, mu, out = [1, 1, 1]) {   // (mu the true sun's: game.js computeLighting)
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
uniform vec2 uSunLift;   // (the sky's lens low over a drawn world: atmosphere.js GLSL_MEDIUM)
float lensTrueZ(float zd) {
  float hD = 1.5707963 + uSunLift.x, hT = 1.5707963 + uSunLift.y;
  return zd <= hD ? zd * hT / hD : hT + (zd - hD) * (3.14159265 - hT) / (3.14159265 - hD);
}
float liftMu(float mu) {
  if (uSunLift.x <= uSunLift.y) return mu;
  return cos(lensTrueZ(acos(clamp(mu, -1.0, 1.0))));
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
