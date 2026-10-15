// The seasons' snow in the shaders: the ground's (terrainMaterial.js) and its rocks' (rockRender.js), the
// same snowpack. Their uniforms are the world's shared ones (world.js setSeasonMap, solarLongitude).
import { SUBLIM_YR, DDF_SNOW } from '../gen/worldsim/season.js';
import { FROST_NL, FROST_TILTS } from '../gen/frostcap.js';

// (seasonal snow's bulk density, kg/m3: ~0.3 of water's once it has settled, Sturm et al. 2010; its
// depth, m, per mm of its water)
export const SNOW_DEPTH_PER_MM = 1 / 300;

export const GLSL_SEASON = /* glsl */`
// ---- the seasons' snow on the land (world.js setSeasonMap; worldsim/season.js): each place's year as its
// climate has it, by latitude and longitude: its temperature's swing about the year's mean (r, g: a1, b1
// of a1 cos L + b1 sin L, K / 100 + 0.5) and the cold half's precipitation (b: sqrt(mm a month / 600));
// uSeason x: where the sun stands in the year (L, rad from the northern spring equinox), y: the melt
// over the year per degree above freezing (mm), z: on
uniform sampler2D tSeasonMap;
// (the air's year over a frozen sea, worldsim/season.js seasonIce: r, g its a1, b1, b its year's mean
// against the open sea's, K / 100 + 0.5)
uniform sampler2D tSeasonIce;
uniform vec4 uSeason;
uniform vec3 uSnowCol;
// the snow's water on the ground now (mm), at a place (dirF its direction, planet-fixed) whose year's mean
// is Ta (C): a snowpack by degree days through its year, in closed form. Its warmth T = Ta + A cos x, x
// the year's phase from its warmest; snow falls while T < 0, at the cold half's rate, from the autumn's
// freeze (x = th) to the spring's thaw (x = -th, a year on), and melts from there at DDF_SNOW mm a day
// per degree until it's gone; where a year's thaw and the air's sublimation can't take off a winter's
// fall, it lasts the year (1e4: the ground's own year-round snow, season.js snowYear, the same sums)
// (a place's year from the map: a1, b1 (K), the cold half's precipitation (mm a month))
vec3 seasonYear(vec3 dirF) {
  vec4 m = texture(tSeasonMap, vec2(atan(dirF.z, dirF.x) / 6.28319 + 0.5, asin(clamp(dirF.y, -1.0, 1.0)) / 3.14159 + 0.5));
  return vec3((m.r - 0.5) * 100.0, (m.g - 0.5) * 100.0, m.b * m.b * 600.0);
}
// (the air over a frozen sea there: its temperature now against the open sea's year's mean, K)
float seasonIceNow(vec3 dirF) {
  vec4 m = texture(tSeasonIce, vec2(atan(dirF.z, dirF.x) / 6.28319 + 0.5, asin(clamp(dirF.y, -1.0, 1.0)) / 3.14159 + 0.5));
  return (m.b - 0.5) * 100.0 + (m.r - 0.5) * 100.0 * cos(uSeason.x) + (m.g - 0.5) * 100.0 * sin(uSeason.x);
}
// the sea's ice at a point m of it (its year's mean and its swing now, by the map: one value for every
// pixel that asks of m, and for the slabs and the walker: gen/liquidice.js iceAt), its freezing point Tf
// (C); read at the full-size texels (a piece's middle jumps between pixels at its edge)
float seaIceAt(vec3 m, float Tf) {
  vec3 u = normalize(m);
  vec4 t = textureLod(tSeasonMap, vec2(atan(u.z, u.x) / 6.28319 + 0.5, asin(clamp(u.y, -1.0, 1.0)) / 3.14159 + 0.5), 0.0);
  float Ts = t.a * 120.0 - 60.0 + (t.r - 0.5) * 100.0 * cos(uSeason.x) + (t.g - 0.5) * 100.0 * sin(uSeason.x);
  return 1.0 - smoothstep(Tf - 4.0, Tf + 4.0, Ts);
}
// melt ponds on a floe's top now (0..1 here): where the air over the pack (Tair, C) is above freezing its
// snow melts and the water gathers in its hollows (n: the 64 m and 8 m tiles there, its low places low),
// up to ~0.45 of the floe at the height of a summer (5-50% of the Arctic's: Fetterer and Untersteiner 1998)
float meltPond(float Tair, float n) {
  float f = 0.45 * smoothstep(-0.5, 4.0, Tair);
  return f > 0.0 ? 1.0 - smoothstep(f - 0.06, f + 0.06, n) : 0.0;
}
// (the sea's year's mean at sea level there, C: the map's)
float seaMeanT(vec3 dirF) {
  return textureLod(tSeasonMap, vec2(atan(dirF.z, dirF.x) / 6.28319 + 0.5, asin(clamp(dirF.y, -1.0, 1.0)) / 3.14159 + 0.5), 0.0).a * 120.0 - 60.0;
}
float seasonSWE(vec3 dirF, float Ta) {
  vec3 yr = seasonYear(dirF);
  float a1 = yr.x, b1 = yr.y, P = yr.z;
  float A = length(vec2(a1, b1));
  if (Ta >= A) return 0.0;
  float th = Ta <= -A ? 0.0 : acos(clamp(-Ta / A, -1.0, 1.0));
  // (a winter's fall, mm per radian of the year: twelve months' at the cold half's rate)
  float acc = 12.0 * P / 6.28319, fall = acc * (6.28319 - 2.0 * th);
  // (the melt, mm per degree per radian; a whole thaw's, and from its start to x)
  float mr = uSeason.y / 6.28319;
  float thaw = mr * (2.0 * Ta * th + 2.0 * A * sin(th));
  if (thaw + ${SUBLIM_YR.toFixed(1)} <= fall) return 1e4;
  if (th <= 0.0) return 0.0;
  float x = uSeason.x - atan(b1, a1);
  x -= 6.28319 * floor((x + 3.14159) / 6.28319);
  if (x > th) return acc * (x - th);
  if (x < -th) return acc * (x + 6.28319 - th);
  return max(0.0, fall - mr * (Ta * (x + th) + A * (sin(x) + sin(th))));
}
// how much of the ground the seasons' snow covers (0..1): its water (seasonSWE) against how much a
// cover takes, a few cm of it (~20 mm of water hides grass and stones; a thin fall lies in patches, and
// the last of a spring's melt in the hollows and the lee: n, the ground's own 64 m / 512 m tiles), less
// on a slope that faces the sun's mean path (its year a few degrees warmer: terrain.js _shadeAspect, the
// year-round snow's own), thinner on a steep one and next to none on a face (it sloughs off: from ~28
// degrees thinning, past ~57 the rock bare)
float seasonSnow(vec3 dirF, vec3 fn, float Ta, float n) {
  float dn = dot(fn, dirF), cl2 = 1.0 - dirF.y * dirF.y;
  float shade = cl2 > 1e-6 ? sign(dirF.y) * (fn.y - dn * dirF.y) / sqrt(cl2) * min(1.0, 2.0 * abs(dirF.y)) : 0.0;
  float swe = seasonSWE(dirF, Ta - 8.0 * shade);
  float c = 1.0 - exp(-swe / 12.0);
  c = smoothstep(n - 0.25, n + 0.25, c * 1.2 - 0.1);
  return c * (1.0 - 0.9 * smoothstep(0.12, 0.45, 1.0 - dn));
}
// ---- the seasons' frost where a thin air freezes out at the poles (Mars' CO2; gen/frostcap.js, world.js):
// its mass by the solar longitude (x) and latitude (y, south to north) for each tilt toward the pole in
// turn (FROST_TILTS, one above another), sqrt(kg / 2000); uFrost x: where the sun stands in the year, y: on
uniform sampler2D tFrost;
uniform vec4 uFrost;
const float FROST_NL = ${FROST_NL.toFixed(1)}, FROST_NT = ${FROST_TILTS.length.toFixed(1)}, FROST_TILT0 = ${FROST_TILTS[0].toFixed(1)}, FROST_DTILT = ${(FROST_TILTS[1] - FROST_TILTS[0]).toFixed(1)};
// how much of a surface at dirF facing fn (planet-fixed) it covers (0..1): by its latitude and how far it
// tilts toward the pole (its normal's part along the meridian: an east or west face is level ground's), as
// frostcap.js has a slope's year (the pole-facing sides keep their frost longest, the sunward lose it
// first, a steep wall near the equator none: the warm ground round it); ~10 kg/m2 (under a cm) hides the
// ground, a thin frost lying in patches (n: the ground's own tiles, as the snow's)
float seasonFrost(vec3 dirF, vec3 fn, float n) {
  float sy = clamp(dirF.y, -1.0, 1.0);
  vec3 north = vec3(0.0, 1.0, 0.0) - dirF * sy;
  float nl = length(north);
  float tilt = nl > 1e-4 ? degrees(asin(clamp(dot(fn, north) / nl, -1.0, 1.0))) * (sy < 0.0 ? -1.0 : 1.0) : 0.0;
  float ft = clamp((tilt - FROST_TILT0) / FROST_DTILT, 0.0, FROST_NT - 1.0), t0 = min(floor(ft), FROST_NT - 2.0);
  float v = clamp((asin(sy) / 3.14159 + 0.5) * FROST_NL, 0.5, FROST_NL - 0.5), u = uFrost.x / 6.28319;
  float m0 = texture(tFrost, vec2(u, (t0 * FROST_NL + v) / (FROST_NT * FROST_NL))).r;
  float m1 = texture(tFrost, vec2(u, ((t0 + 1.0) * FROST_NL + v) / (FROST_NT * FROST_NL))).r;
  float m = mix(m0, m1, ft - t0);
  float c = 1.0 - exp(-m * m * 2000.0 / 10.0);
  return smoothstep(n - 0.25, n + 0.25, c * 1.2 - 0.1);
}
const float SNOW_DEPTH_PER_MM = ${SNOW_DEPTH_PER_MM.toFixed(6)};
const float DDF_SNOW = ${DDF_SNOW.toFixed(1)};
`;

// the snow's water on the ground now (mm), as seasonSWE has it, for the CPU (grassRender.js: the blades
// standing up out of a thin fall, buried by a deep one): a place's year (a1, b1 K; P the cold half's
// precipitation, mm a month), its year's mean Ta (C), where the sun stands in its year L (rad), the melt
// over the year per degree above freezing (mm: uSeason.y); 1e4 where the snow lasts the year
export function snowWaterNow(a1, b1, P, Ta, L, meltYear) {
  const A = Math.hypot(a1, b1), TAU = 2 * Math.PI;
  if (Ta >= A) return 0;
  const th = Ta <= -A ? 0 : Math.acos(Math.max(-1, Math.min(1, -Ta / A)));
  const acc = 12 * P / TAU, fall = acc * (TAU - 2 * th), mr = meltYear / TAU;
  const thaw = mr * (2 * Ta * th + 2 * A * Math.sin(th));
  if (thaw + SUBLIM_YR <= fall) return 1e4;
  if (th <= 0) return 0;
  let x = L - Math.atan2(b1, a1);
  x -= TAU * Math.floor((x + Math.PI) / TAU);
  if (x > th) return acc * (x - th);
  if (x < -th) return acc * (x + TAU - th);
  return Math.max(0, fall - mr * (Ta * (x + th) + A * (Math.sin(x) + Math.sin(th))));
}
