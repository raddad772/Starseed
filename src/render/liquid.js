// Any world's open liquid, one shader: water, methane and ethane seas, ammonia water, lava, by what
// they are (refractive index, surface tension, freezing point, how viscous) under that world's sky
// (gravity, the air's density and the sunlight driving its winds). Its surface by where it lies:
//   the sea        wind waves by the prevailing wind of its latitude (trades, westerlies, polar
//                  easterlies), their slopes the measured sea's (Cox and Munk: variance 0.003 +
//                  0.00512 U), the longest at the wind's fully developed peak (k = 0.77 g / U^2)
//   a lake         the same, its longest waves cut by how far the wind runs over it
//   a river        chop from its flow, every way, short
//   a pond         near still, a mirror
// Waves move by their dispersion (w^2 = g k + (sigma/rho) k^3: on Titan's low gravity slower, its
// methane's ripples finer); what a pixel can't resolve becomes roughness (the sun's glitter spreads,
// as it does far off); whitecaps in a strong wind, foam where the waves reach the shore. It freezes
// by the season: its annual mean temperature, the sun's latitude now, and how fast that water
// follows (the sea slowest; floes to come).
// The waves: 12 octaves of three directions each, fixed in the world (a direction that turned with the
// pixel's own normal would jump its phase at every triangle), each wave's components whole cycles of
// the 4096 m detail period so they don't seam where its coordinates wrap.
import * as THREE from 'three';
import { MATERIALS } from '../gen/worldsim/materials.js';

const N_OCT = 12, N_DIR = 3, N_WAVE = N_OCT * N_DIR;
// (surface tension, N/m, near each one's own temperatures; the rest from materials.js: the index,
// density, viscosity, triple point)
const SIGMA = { water: 0.072, brine: 0.075, 'ammonia-water': 0.06, methane: 0.017, ethane: 0.03, nitrogen: 0.009, CO2: 0.012, ammonia: 0.034, SO2: 0.025, sulfur: 0.06, lava: 0.35 };
// (the sea's freezing point under the fresh's, C: its salt)
const SALT = { water: -1.8 };

// a world's liquid: its uniforms (shared with the terrain's material), and each frame its waves'
// phases (each wave's own w t, wrapped on the CPU: the GPU's float would lose them in an hour)
export class Liquid {
  constructor(b, sunE) {
    const d = b.data || {}, name = (d.hydrosphere && d.hydrosphere.liquid) || 'water';
    const M = MATERIALS[name] || MATERIALS.water;
    const g = d.gravity || 9.8;
    const a = d.atmosphere, P = a ? a.pressure || 0 : 0;
    const rho = P > 0 ? P * 1e5 * ((a.mu || 29) / 1000) / (8.314 * Math.max(d.Tsurf || 288, 30)) : 0;
    // the wind that raises the waves: the sunlight driving it, the air's density (a thick air moves
    // slower for the same power); none without air
    const U = rho > 0 ? Math.min(20, Math.max(0.3, 7 * Math.pow(Math.max(sunE, 1e-3), 0.3) * Math.pow(1.2 / Math.max(rho, 0.01), 0.33))) : 0;
    const lamP = U > 0 ? Math.min(300, Math.max(0.3, 2 * Math.PI * U * U / (0.77 * g))) : 1;
    const F0 = Math.pow((M.n - 1) / (M.n + 1), 2);
    const sig = (SIGMA[name] || 0.03) / M.rho;
    // (a thick melt's waves die where they're raised: molten sulfur's a little, lava's all but)
    const waves = 1 / (1 + (M.mu || 1e-3) / 0.05);
    const q = 2 * Math.PI / 4096, K = [];
    this.omega = [];
    for (let i = 0; i < N_OCT; i++) {
      const lam = 1.5 * lamP * Math.pow(0.55, i), kk = 2 * Math.PI / lam;
      for (let j = 0; j < N_DIR; j++) {
        // (directions spread over the sphere, golden angle: every pixel's tangent plane sees most)
        const m = i * N_DIR + j, z = 1 - 2 * (m + 0.5) / N_WAVE, r = Math.sqrt(1 - z * z), ph = m * 2.39996;
        const k = [r * Math.cos(ph), z, r * Math.sin(ph)].map((c) => Math.round(c * kk / q) * q);
        const km = Math.hypot(k[0], k[1], k[2]) || q;
        K.push(new THREE.Vector4(k[0], k[1], k[2], 0));
        this.omega.push(Math.sqrt(g * km + sig * km * km * km));
      }
    }
    this.name = name; this.U = U; this.lamP = lamP;
    const foams = name === 'water' || name === 'brine' ? 1 : 0.35;
    this.uniforms = {
      uLiquid: { value: new THREE.Vector4(F0, U, waves, lamP) },
      uLiquid2: { value: new THREE.Vector4(g, foams, SALT[name] || 0, 0) },
      uWaveK: { value: K },
    };
  }
  // t: seconds; sunF: the sun's direction in the planet's own frame (its y the sun's latitude: the season)
  update(t, sunF) {
    const K = this.uniforms.uWaveK.value;
    for (let i = 0; i < K.length; i++) K[i].w = (this.omega[i] * t) % (2 * Math.PI);
    this.uniforms.uLiquid2.value.w = sunF.y;
  }
}

export const GLSL_LIQUID = /* glsl */`
uniform vec4 uLiquid;     // F0, the wind (m/s), wind waves (1 .. 0 a thick melt), the peak wavelength (m)
uniform vec4 uLiquid2;    // gravity, how it foams (water most), the sea's freezing point under the fresh's (C), the sun's latitude now (sin)
uniform vec4 uWaveK[${N_WAVE}];   // each wave's k (planet-fixed, rad/m), its phase now
// the waves' sum at fp: their slope (x, y, z, planet-fixed), each weighted (wt: kind's and the
// wind's), how much of it the pixel resolves; crest: the resolved sum itself, in its own deviations
struct Waves { vec3 g; float var; float var0; float res; float crest; };
// (warp: a smooth shift of where the waves are, bending their crests; grp: their groups, each
// octave's height by place)
Waves liquidWaves(vec3 fp, vec3 n, vec3 wd, float lmax, bool river, float foot, vec3 warp, vec4 grp) {
  Waves W = Waves(vec3(0.0), 0.0, 0.0, 0.0, 0.0);
  float rv = 0.0;
  for (int i = 0; i < ${N_WAVE}; i++) {
    vec4 K = uWaveK[i];
    float kk = length(K.xyz), lam = 6.2832 / kk;
    float fk = (1.0 - smoothstep(lmax * 0.7, lmax * 1.3, lam)) * (1.0 - smoothstep(uLiquid.w * 1.2, uLiquid.w * 2.2, lam));
    if (fk <= 0.0) continue;
    vec3 kt = K.xyz - n * dot(K.xyz, n);
    float ktl = length(kt);
    if (ktl < 1e-6) continue;
    vec3 kd = kt / ktl;
    // (the long waves run with the wind; a river's chop every way)
    float dirW = river ? 1.0 : 0.2 + 1.2 * pow(max(dot(kd, wd), 0.0), 2.0);
    float wt0 = fk * dirW * (ktl / kk), wt = wt0 * (0.3 + 1.4 * grp[(i / ${N_DIR}) & 3]);
    float res = smoothstep(2.0 * foot, 6.0 * foot, lam);
    float ph = dot(K.xyz, fp + warp) - K.w;
    W.g += kd * (wt * res * cos(ph));
    W.var += wt * wt * 0.5;
    W.var0 += wt0 * wt0 * 0.5;
    W.res += wt * wt * 0.5 * res;
    W.crest += wt * res * sin(ph);
    rv += wt * wt * 0.5 * res * res;
  }
  W.crest /= sqrt(max(rv, 1e-9));
  return W;
}
// the surface at fp (planet-fixed m) whose mesh normal is n, local up upF: its normal (planet-fixed),
// the roughness its unresolved waves leave (GGX alpha), its foam; kind 0 the sea, 0.4 a lake, 0.7 a
// river, 1 a pond; flow a river's (0..1), fetch how open to the wind (0..1), depth (m), foot a
// pixel's span (m)
void liquidSurface(vec3 fp, vec3 n, vec3 upF, float kind, float flow, float fetch, float depth, float foot,
    vec2 wn, vec4 grp, out vec3 nF, out float rough, out float foam) {
  float al = abs(asin(clamp(upF.y, -1.0, 1.0)));
  // the prevailing wind: trades toward the west, westerlies east, polar easterlies west; light in
  // the doldrums, strongest in the westerlies
  float toward = al < 0.52 || al > 1.05 ? -1.0 : 1.0;
  float strength = al < 0.09 ? 0.45 : al < 0.52 ? 0.9 : al < 1.05 ? 1.25 : 0.8;
  vec3 east = cross(vec3(0.0, 1.0, 0.0), upF);
  vec3 wd = length(east) > 1e-4 ? normalize(east) * toward : vec3(1.0, 0.0, 0.0);
  bool river = kind > 0.55 && kind < 0.85, pond = kind > 0.85, sea = kind < 0.2;
  // (the crests bent by the smooth noise wn (-1..1, east and north), a tenth of the longest's length)
  vec3 e1 = length(east) > 1e-4 ? normalize(east) : vec3(1.0, 0.0, 0.0), e2 = cross(upF, e1);
  vec3 warp = (e1 * wn.x + e2 * wn.y) * 0.12 * uLiquid.w;
  float U = uLiquid.y * strength * (sea ? 1.0 : mix(0.3, 1.0, fetch));
  // the slopes' variance: the sea's measured (Cox and Munk); a lake's a little calmer; a river's by
  // its flow; a pond's near a mirror's
  float s2 = sea ? 0.003 * step(0.01, U) + 0.00512 * U : pond ? 0.0003 + 0.0003 * U : river ? 0.002 + 0.04 * flow : 0.001 + 0.00512 * U;
  s2 *= uLiquid.z;
  // (the longest waves it can hold: the open sea's the wind's own peak; a lake's by its fetch; a
  // river's and a pond's short)
  float lmax = sea ? 1e9 : river ? 1.2 : pond ? 1.0 : 25.0 + 400.0 * fetch;
  Waves W;
  if (river) {
    // a river's chop carried down it (two phases of the pattern, each drawn along and faded at its
    // ends, so it moves without ever stretching)
    vec3 dn = n - upF * dot(n, upF);
    vec3 fd = length(dn) > 1e-4 ? normalize(dn) : vec3(0.0);
    float v = 0.4 + 2.6 * flow, t1 = fract(uTime * 0.25), t2 = fract(uTime * 0.25 + 0.5);
    Waves A = liquidWaves(fp - fd * v * 4.0 * t1, n, wd, lmax, true, foot, warp * 0.05, grp);
    Waves B = liquidWaves(fp - fd * v * 4.0 * t2 + 0.37, n, wd, lmax, true, foot, warp * 0.05, grp);
    float wa = 1.0 - abs(2.0 * t1 - 1.0);
    W = A; W.g = A.g * wa + B.g * (1.0 - wa); W.crest = A.crest * wa + B.crest * (1.0 - wa);
  } else W = liquidWaves(fp, n, wd, lmax, false, foot, warp, grp);
  // (scaled to the slopes' variance, the groups left to vary it from place to place)
  float sc = sqrt(s2 / max(W.var0, 1e-9));
  nF = normalize(n - W.g * sc);
  rough = clamp(sqrt(2.0 * max(W.var - W.res, 0.0)) * sc, 0.02, 0.6);
  // whitecaps: the share of the sea a wind breaks (Monahan: 3.8e-6 U^3.4), where the resolved
  // waves crest highest; what the pixel can't resolve, that share spread
  float cov = clamp(3.84e-6 * pow(U, 3.41), 0.0, 0.3);
  foam = 0.0;
  if (!river && !pond && cov > 1e-4) {
    float t = sqrt(-2.0 * log(cov));
    float z = t - (2.515517 + 0.802853 * t + 0.010328 * t * t) / (1.0 + 1.432788 * t + 0.189269 * t * t + 0.001308 * t * t * t);
    float rk = W.res / max(W.var, 1e-9);
    foam = mix(cov, smoothstep(z - 0.25, z + 0.35, W.crest), rk) * 0.9;
  }
  // the shore's: lines of broken water running in where it shoals, and the swash at its edge
  if (!river && !pond && depth < 1.6) {
    // (each line torn into lace where the waves' own crests and the groups' noise leave it thin)
    float sw = 0.5 + 0.5 * sin(6.2832 * depth / 0.4 + uTime * 1.3);
    float lace = smoothstep(-0.2, 1.0, W.crest + (grp.x - 0.5) * 2.5);
    float sh = (1.0 - smoothstep(0.05, 1.6, depth)) * smoothstep(0.75, 0.97, sw) * lace + (1.0 - smoothstep(0.0, 0.15, depth)) * (0.4 + 0.6 * lace);
    foam = max(foam, clamp(sh, 0.0, 1.0) * smoothstep(0.5, 4.0, U) * 0.75);
  }
  // a river's white water where it runs fast
  if (river) foam = smoothstep(0.6, 0.95, flow) * smoothstep(0.5, 1.6, W.crest) * 0.7;
  foam *= uLiquid2.y;
}
// how much of it is frozen now: its annual mean (Tm, C over its freezing point) moved by the season
// (the sun's latitude, the hemisphere's, and how fast that water follows: the sea slowest, a pond
// quickest); the sea's salt and a river's flow keep them open colder
float liquidIce(float Tm, float kind, float flow, vec3 upF) {
  float follow = kind < 0.2 ? 0.25 : kind < 0.55 ? 0.6 : kind < 0.85 ? 0.45 : 0.8;
  float Ts = Tm + 70.0 * uLiquid2.w * upF.y * follow;
  float Tf = (kind < 0.2 ? uLiquid2.z : 0.0) - (kind > 0.55 && kind < 0.85 ? 3.0 * flow : 0.0);
  // (over a few degrees: the marginal ice)
  return 1.0 - smoothstep(Tf - 4.0, Tf + 4.0, Ts);
}
`;
