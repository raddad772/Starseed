// The seasons' snow in the shaders: the ground's (terrainMaterial.js) and its rocks' (rockRender.js), the
// same snowpack. Their uniforms are the world's shared ones (world.js setSeasonMap, solarLongitude).
import { SUBLIM_YR, DDF_SNOW } from '../gen/worldsim/season.js';

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
// year-round snow's own), and none on a cliff (steeper than ~50 degrees it sloughs off)
float seasonSnow(vec3 dirF, vec3 fn, float Ta, float n) {
  float dn = dot(fn, dirF), cl2 = 1.0 - dirF.y * dirF.y;
  float shade = cl2 > 1e-6 ? sign(dirF.y) * (fn.y - dn * dirF.y) / sqrt(cl2) * min(1.0, 2.0 * abs(dirF.y)) : 0.0;
  float swe = seasonSWE(dirF, Ta - 8.0 * shade);
  float c = 1.0 - exp(-swe / 12.0);
  c = smoothstep(n - 0.25, n + 0.25, c * 1.2 - 0.1);
  return c * (1.0 - 0.75 * smoothstep(0.35, 0.65, 1.0 - dn));
}
const float SNOW_DEPTH_PER_MM = ${SNOW_DEPTH_PER_MM.toFixed(6)};
const float DDF_SNOW = ${DDF_SNOW.toFixed(1)};
`;
