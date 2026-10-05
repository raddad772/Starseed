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
// follows (the sea slowest); the sea's ice as floes (seaFloes), the waves dying in it.
// The waves: 12 octaves of three directions each, fixed in the world (a direction that turned with the
// pixel's own normal would jump its phase at every triangle), each wave's components whole cycles of
// the 4096 m detail period so they don't seam where its coordinates wrap.
import * as THREE from 'three';
import { MATERIALS } from '../gen/worldsim/materials.js';

const N_OCT = 12, N_DIR = 3, N_WAVE = N_OCT * N_DIR;
// (surface tension, N/m, near each one's own temperatures; the rest from materials.js: the index,
// density, viscosity, triple point)
export const SIGMA = { water: 0.072, brine: 0.075, 'ammonia-water': 0.06, methane: 0.017, ethane: 0.03, nitrogen: 0.009, CO2: 0.012, ammonia: 0.034, SO2: 0.025, sulfur: 0.06, lava: 0.35 };
// (each one's absorption, 1/m, at the red, green and blue the image draws (~610, 545, 465 nm): pure
// water's (Pope and Fry 1997), its red lost over a few metres, its blue over a hundred; liquid
// methane's and ethane's far weaker in the visible, their bands in the near infrared (a deep
// methane sea still reddish-dark: its 619 nm band); the rest as water)
const ABSORB = { water: [0.25, 0.05, 0.01], brine: [0.25, 0.05, 0.01], methane: [0.03, 0.006, 0.004], ethane: [0.02, 0.005, 0.004] };
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
      // (and on a living world its rivers' dissolved organic matter, the tea its plants' soils wash
      // into them: absorbing ~1-10 /m at 440 nm in rivers (a blackwater river's more), falling ~1.5%
      // a nm toward the red (Bricaud et al. 1981); by how much its land grows)
      uLiquid3: { value: new THREE.Vector4(...(ABSORB[name] || ABSORB.water), (name === 'water' || name === 'brine') && d.life ? 2.5 * (d.life.density || 0) : 0) },
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
uniform vec4 uLiquid3;    // its absorption (1/m: red, green, blue), its rivers' dissolved organic matter's at 440 nm (1/m)
uniform vec4 uWaveK[${N_WAVE}];   // each wave's k (planet-fixed, rad/m), its phase now
// the prevailing wind's way at upF (the belts the sim's climate has: the trades blowing west, the
// westerlies east, the polar easterlies west): +1 toward the east, -1 toward the west, turning over
// a few degrees between belts (shared with sand's ripples, materials.js)
float windSense(vec3 upF) {
  float al = abs(asin(clamp(upF.y, -1.0, 1.0)));
  return -1.0 + 2.0 * smoothstep(0.49, 0.55, al) - 2.0 * smoothstep(1.02, 1.08, al);
}
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
    // (each wave in groups, as a sea's are: its height swelling and fading over about three of its
    // lengths, along a way of its own (its k turned: whole cycles of the detail period too), drifting;
    // three waves an octave of one height everywhere summed to one lattice, a checkerboard of glints)
    vec3 Ke = floor(K.yzx * (0.35 / ${(2 * Math.PI / 4096).toFixed(9)}) + 0.5) * ${(2 * Math.PI / 4096).toFixed(9)};
    float env = 0.6 + 0.4 * sin(dot(Ke, fp + warp) - 0.17 * K.w + float(i) * 1.7);
    W.g += kd * (wt * res * env * cos(ph));
    // (the groups' mean square height: 0.6^2 + 0.4^2 / 2)
    W.var += wt * wt * 0.22;
    W.var0 += wt0 * wt0 * 0.22;
    W.res += wt * wt * 0.22 * res;
    W.crest += wt * res * env * sin(ph);
    rv += wt * wt * 0.22 * res * res;
  }
  W.crest /= sqrt(max(rv, 1e-9));
  return W;
}
// a river's ripples: the turbulence's, not wind waves (a few waves of fixed ways summed to a lattice,
// a checkerboard of glints on every river): gradient noise over four scales, 0.25 to 2 m, each as
// steep as the next (its height its cell's size), none longer than the river's longest waves (lmax),
// on the plane across the axis its surface faces most (the two most, blended where it turns: as the
// ground's scans are), whole cells of the detail period so it doesn't seam where fp wraps. Its slopes
// (planet-fixed) and their variance as liquidWaves gives them, crest its height in deviations
float liqHash(vec2 c) {
  uvec2 q = uvec2(ivec2(c) + 1048576);
  uint h = (q.x * 1597334677u) ^ (q.y * 3812015801u);
  h = h * 747796405u + 2891336453u; h ^= h >> 16; h *= 2246822519u; h ^= h >> 13;
  return float(h & 7u) * 0.7854 + 0.3927;
}
// (its value (x) and gradient (yz) at p, in cells, per cells a period: Perlin's, quintic)
vec3 rippleNoise(vec2 p, float per) {
  vec2 i = floor(p), f = p - i, i1 = mod(i + 1.0, per);
  i = mod(i, per);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0), du = 30.0 * f * f * (f * (f - 2.0) + 1.0);
  float ha = liqHash(i), hb = liqHash(vec2(i1.x, i.y)), hc = liqHash(vec2(i.x, i1.y)), hd = liqHash(i1);
  vec2 ga = vec2(cos(ha), sin(ha)), gb = vec2(cos(hb), sin(hb)), gc = vec2(cos(hc), sin(hc)), gd = vec2(cos(hd), sin(hd));
  float va = dot(ga, f), vb = dot(gb, f - vec2(1.0, 0.0)), vc = dot(gc, f - vec2(0.0, 1.0)), vd = dot(gd, f - 1.0);
  float k = va - vb - vc + vd;
  return vec3(va + u.x * (vb - va) + u.y * (vc - va) + u.x * u.y * k,
              ga + u.x * (gb - ga) + u.y * (gc - ga) + u.x * u.y * (ga - gb - gc + gd) + du * (u.yx * k + vec2(vb, vc) - va));
}
vec3 rippleAxis(int a, vec3 p, float L, float o) {
  vec2 uv = a == 0 ? p.zy : a == 1 ? p.xz : p.xy;
  vec3 r = rippleNoise(uv / L + o, 4096.0 / L);
  return vec3(r.x, r.yz);
}
Waves riverRipples(vec3 fp, vec3 n, float lmax, float foot) {
  Waves W = Waves(vec3(0.0), 0.0, 0.0, 0.0, 0.0);
  vec3 an = abs(n);
  int ma = an.x > an.y && an.x > an.z ? 0 : an.y > an.z ? 1 : 2;
  int mi = an.x < an.y && an.x < an.z ? 0 : an.y < an.z ? 1 : 2;
  int me = 3 - mi - ma;
  float w0 = ma == 0 ? an.x : ma == 1 ? an.y : an.z, w1 = me == 0 ? an.x : me == 1 ? an.y : an.z;
  vec2 bw = clamp((vec2(w0, w1) - 0.5773) / (1.0 - 0.5773), 0.0, 1.0);
  bw = bw.x + bw.y < 1e-4 ? vec2(1.0, 0.0) : bw / (bw.x + bw.y);
  if (bw.y < 0.02) bw = vec2(1.0, 0.0);
  float rv = 0.0, cr = 0.0;
  for (int o = 0; o < 4; o++) {
    float L = 0.25 * exp2(float(o)), fk = 1.0 - smoothstep(lmax * 0.3, lmax * 0.6, L);
    if (fk <= 0.0) continue;
    // (a cell's ripple about two cells long: resolved where that spans a few pixels)
    float res = smoothstep(foot, 3.0 * foot, L);
    vec3 g = vec3(0.0); float v = 0.0;
    for (int k = 0; k < 2; k++) {
      int a = k == 0 ? ma : me;
      float bwk = k == 0 ? bw.x : bw.y;
      if (bwk <= 0.0) continue;
      vec3 r = rippleAxis(a, fp, L, float(o) * 17.31);
      g += bwk * (a == 0 ? vec3(0.0, r.z, r.y) : a == 1 ? vec3(r.y, 0.0, r.z) : vec3(r.y, r.z, 0.0));
      v += bwk * r.x;
    }
    g -= n * dot(g, n);
    // (E|grad|^2 of the noise: 0.78, liquidWaves' var; its values' deviation 0.216)
    W.g += g * (fk * res);
    W.var += fk * fk * 0.78;
    W.res += fk * fk * 0.78 * res;
    W.crest += fk * res * v / 0.216;
    rv += fk * fk * res * res;
  }
  W.var0 = W.var;
  W.crest /= sqrt(max(rv, 1e-9));
  return W;
}
// the surface at fp (planet-fixed m) whose mesh normal is n, local up upF: its normal (planet-fixed),
// the roughness its unresolved waves leave (GGX alpha), its foam; kind 0 the sea, 0.4 a lake, 0.7 a
// river, 1 a pond; flow a river's (0..1), fetch how open to the wind (0..1), depth (m), foot a
// pixel's span (m)
// (a river's: fdir its way down (planet-fixed, along the ground; 0 still), fv its speed (m/s))
void liquidSurface(vec3 fp, vec3 n, vec3 upF, float kind, float flow, float fetch, float depth, float foot,
    vec2 wn, vec4 grp, vec3 fdir, float fv, out vec3 nF, out float rough, out float foam) {
  float al = abs(asin(clamp(upF.y, -1.0, 1.0)));
  // the prevailing wind: trades toward the west, westerlies east, polar easterlies west; light in
  // the doldrums, strongest in the westerlies
  float toward = windSense(upF);
  float strength = al < 0.09 ? 0.45 : al < 0.52 ? 0.9 : al < 1.05 ? 1.25 : 0.8;
  vec3 east = cross(vec3(0.0, 1.0, 0.0), upF);
  vec3 wd = length(east) > 1e-4 ? normalize(east) * sign(toward + 1e-3) : vec3(1.0, 0.0, 0.0);
  bool river = kind > 0.55 && kind < 0.85, pond = kind > 0.85, sea = kind < 0.2;
  // (the crests bent by the smooth noise wn (-1..1, east and north), a tenth of the longest's length)
  vec3 e1 = length(east) > 1e-4 ? normalize(east) : vec3(1.0, 0.0, 0.0), e2 = cross(upF, e1);
  vec3 warp = (e1 * wn.x + e2 * wn.y) * 0.12 * uLiquid.w;
  float U = uLiquid.y * strength * (sea ? 1.0 : mix(0.3, 1.0, fetch));
  // the slopes' variance: the sea's measured (Cox and Munk); a lake's a little calmer; a river's by
  // its flow; a pond's near a mirror's
  // (a river's surface by how it runs: its Froude number, its speed over a shallow wave's on its
  // depth, sets how rough the turbulence leaves it (a lowland river's boils at ~0.1, a rapid's
  // standing waves near 1), a little wind ripple on top)
  float Fr = river ? fv / sqrt(uLiquid2.x * max(depth, 0.3)) : 0.0;
  float s2 = sea ? 0.003 * step(0.01, U) + 0.00512 * U : pond ? 0.0003 + 0.0003 * U : river ? 0.0012 + 0.035 * min(Fr * Fr, 2.0) + 0.0015 * U : 0.001 + 0.00512 * U;
  s2 *= uLiquid.z;
  // (the longest waves it can hold: the open sea's the wind's own peak; a lake's by its fetch; a
  // river's its standing waves' (2 pi v^2 / g) and its depth's eddies; a pond's short)
  float lmax = sea ? 1e9 : river ? clamp(6.2832 * fv * fv / uLiquid2.x + depth, 0.6, 8.0) : pond ? 1.0 : 25.0 + 400.0 * fetch;
  Waves W;
  vec3 fd = fdir - upF * dot(fdir, upF);
  fd = length(fd) > 0.05 ? normalize(fd) : vec3(0.0);
  float ta = fract(uTime / 3.0), tb = fract(uTime / 3.0 + 0.5), wa = 1.0 - abs(2.0 * ta - 1.0);
  if (river) {
    // a river's surface carried down it at its speed (two phases of the pattern, each drawn along
    // and faded at its ends, so it moves without ever stretching)
    Waves A = riverRipples(fp - fd * fv * 3.0 * ta, n, lmax, foot);
    Waves B = riverRipples(fp - fd * fv * 3.0 * tb + 0.37, n, lmax, foot);
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
  // a river's: white water where it runs near critical, its standing waves breaking (patches of the
  // flow round the bed's roughness gone supercritical: none on a smooth run, more as its Froude number
  // nears 1, all of it at a hydraulic jump's ~1.5), laid as patches drawn out down the current and
  // carried with it (the detail noise, two scales, read in two phases as the waves are), whitest on
  // the resolved waves' crests; and on a rough run thin lines of foam, the convergences its bubbles
  // gather into
  if (river && length(fd) > 0.0) {
    vec3 ac = cross(upF, fd);
    float cov = clamp((Fr - 0.6) / 0.9, 0.0, 1.0);
    cov *= cov;
    if (cov > 0.0) {
      vec2 q = vec2(dot(fp, ac) * 0.15, dot(fp, fd) * 0.04);
      vec2 qa = q - vec2(0.0, fv * 3.0 * ta * 0.04), qb = q + vec2(0.41, 0.0) - vec2(0.0, fv * 3.0 * tb * 0.04);
      float na = 0.65 * texture(tDetail, qa).a + 0.35 * texture(tDetail, qa * 3.1 + 0.3).r;
      float nb = 0.65 * texture(tDetail, qb).a + 0.35 * texture(tDetail, qb * 3.1 + 0.3).r;
      float th = mix(0.75, 0.28, cov);
      foam = smoothstep(th - 0.02, th + 0.1, mix(nb, na, wa) + 0.06 * W.crest) * 0.85;
    }
    // (the lines wander across as they go, a few metres over tens: where the eddies shed off its bed
    // and banks gather them, held there while the foam runs along them; drawn straight, a ruler's)
    vec2 q = vec2(dot(fp, ac) * 0.2, dot(fp, fd) * 0.004);
    q.x += 1.2 * (texture(tDetail, vec2(dot(fp, ac), dot(fp, fd)) * 0.012).r - 0.5);
    float sa = texture(tDetail, q - vec2(0.0, fv * 3.0 * ta * 0.004)).a, sb = texture(tDetail, q + vec2(0.43, 0.0) - vec2(0.0, fv * 3.0 * tb * 0.004)).a;
    float streak = smoothstep(0.7, 0.8, mix(sb, sa, wa)) * smoothstep(0.6, 1.2, Fr);
    foam = max(foam, streak * 0.3);
  }
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
// ---- the sea's ice as floes (gen/liquidice.js reads the same, so where it's drawn is where it bears
// you). Sea ice breaks along its fractures into plates: cells of a partition of space (each cell's nearest
// feature point an integer hash of its lattice cell, whole cycles of the 4096 m detail period, the same
// on every GPU and in JS), the distance to a cell's edge its nearest bisector. The pack's floes ~250 m
// (FLOE_S[0]); near its edge the waves break them into small ones ~16 m (FLOE_S[1]: the marginal ice
// zone's, Toyota et al. 2006), the more of them broken the more open the ice; between them leads, the
// wider the more open (a floe's share of its cell ~ c: its edges in by S/2 (1 - sqrt(c))).
// How close the pack is here: its temperature's ice (liquidIce), its edge ragged over the 512 m and 64 m
// tiles (dI.a, dJ.r), the marginal zone where that sum runs from 0.35 to 0.75
float seaIceCover(float ice, float nA, float nR) {
  return smoothstep(0.35, 0.75, ice + (nA - 0.5) * 0.9 + (nR - 0.5) * 0.35) * smoothstep(0.0, 0.15, ice);
}
uint floeHash(uint x, uint y, uint z, uint s) {
  uint h = (x * 0x8da6b343u) ^ (y * 0xd8163841u) ^ (z * 0xcb1ab31fu) ^ (s * 0x165667b1u);
  h ^= h >> 15u; h *= 0x2c1b3c6du; h ^= h >> 12u; h *= 0x297a2d39u; h ^= h >> 15u;
  return h;
}
// lattice cell c's feature point (cells S m across, N to the period): in the middle half of the cell
vec3 floePoint(vec3 c, float S, float N, uint seed) {
  vec3 w = mod(c, N);
  uint h = floeHash(uint(w.x), uint(w.y), uint(w.z), seed);
  return (c + 0.25 + 0.5 * vec3(float(h & 1023u), float((h >> 10u) & 1023u), float((h >> 20u) & 1023u)) / 1024.0) * S;
}
// the floe a lattice cell's in: its index moved on by 0 or 1 along each axis (its own hash), halved: a
// floe of a few cells, its outline wandering (by fixed pairs of cells, a floe was near square). Whole
// numbers only, so every GPU and JS agree on it everywhere it's asked (from the cell's jittered point, its
// floor came out one way for the pixel's own cell and the other for a neighbour's, the compiler rounding
// each call its own way: a lead's middle read as inside a floe, a dashed line of ice)
vec3 floeGroup(vec3 c, float N, uint seed) {
  vec3 w = mod(c, N);
  uint h = floeHash(uint(w.x), uint(w.y), uint(w.z), seed ^ 0x5bd1u);
  return floor((c + vec3(float(h & 1u), float((h >> 1u) & 1u), float((h >> 2u) & 1u))) * 0.5);
}
// the partition of cells S m across (N to the period) at p, its cells merged in groups (those whose
// feature points fall in one cube 2S across: a floe of a few cells, irregular, its sizes spread): the
// group's hash (id), how far p is in from the group's edge (e, m: the nearest bisector with a cell of
// another group) and the group's middle (gc)
void floeCell(vec3 p, vec3 up, float S, float N, uint seed, out uint id, out float e, out vec3 gc) {
  // (its nearest feature point, then the edges round that point's own cell. Measured with up stretched
  // three times: the cells are a 3D lattice's and the sea a slice through it, and a cell whose point lay
  // well above or below the slice touched it only in slivers along two floes' boundary, regular as the
  // lattice is, each a floe of its own: a dashed line of ice down a lead's middle)
  vec3 g = floor(p / S), ca = g;
  float d1 = 1e20;
  for (int k = 0; k < 27; k++) {
    vec3 c = g + vec3(float(k % 3), float((k / 3) % 3), float(k / 9)) - 1.0, q = floePoint(c, S, N, seed) - p;
    q += 2.0 * dot(q, up) * up;
    float d = dot(q, q);
    if (d < d1) { d1 = d; ca = c; }
  }
  vec3 a = floePoint(ca, S, N, seed) - p, ga = floeGroup(ca, N, seed), wa = mod(ga, 0.5 * N);
  a += 2.0 * dot(a, up) * up;
  id = floeHash(uint(wa.x), uint(wa.y), uint(wa.z), seed ^ 0x9e37u);
  gc = (ga + 0.5) * 2.0 * S;
  e = 1e20;
  for (int k = 0; k < 27; k++) {
    if (k == 13) continue;
    vec3 cb = ca + vec3(float(k % 3), float((k / 3) % 3), float(k / 9)) - 1.0;
    if (floeGroup(cb, N, seed) == ga) continue;
    vec3 b = floePoint(cb, S, N, seed) - p;
    b += 2.0 * dot(b, up) * up;
    // (p at the origin: its distance to the two points' bisector)
    e = min(e, 0.5 * (dot(b, b) - dot(a, a)) / length(a - b));
  }
}
vec4 tri0(vec3 p, vec3 w, float period);
// how much of a pixel foot m across is floe, its middle e m in from the floe's edge and its lead g m wide
// either side of that edge: the pixel's span less the lead's water in it (box-filtered: a lead narrower
// than a pixel, a closed pack's metre or so seen from far off, a faint line, not broken into dashes by
// each pixel's middle falling in it or not)
float floeCover(float e, float g, float foot) {
  float f = max(foot, 0.02);
  return 1.0 - clamp((min(g, e + 0.5 * f) - max(-g, e - 0.5 * f)) / f, 0.0, 1.0);
}
// a floe group's cover (seaIceCover at its middle), whether it's there (its share of the pack's floes
// there), broken (by the waves, the more of the pack the more open the ice) and its leads' half width
// (its share of its cells): (c, there, broken, g)
vec4 floeState(uint id, vec3 gc, vec3 w, float ice, float S) {
  float c = seaIceCover(ice, tri0(gc, w, 512.0).a, tri0(gc, w, 64.0).r), pres = min(1.0, 1.5 * c), cc = c / max(pres, 1e-3);
  float r1 = float(id & 65535u) / 65536.0, r2 = float(id >> 16u) / 65536.0;
  return vec4(c, c > 0.0 && r1 <= pres ? 1.0 : 0.0, r2 < 1.0 - smoothstep(0.4, 0.9, c) ? 1.0 : 0.0, max(S / 400.0, 0.5 * S * (1.0 - sqrt(cc))));
}
// the sea's ice at p (body-fixed, the detail period's; w its triplanar weights), its temperature's ice
// (liquidIce) and the cover here (cPix: seaIceCover), a pixel foot m across: x how much of the pixel is
// ice (0..1), y its rim (the floe's side and wet edge showing), z its age (0 a young floe, grey, 1 an old
// one under snow), w its floe's cover. The pack's floes (cells ~256 m, merged a few to a floe), each as
// close as the pack is at its middle, so their edges run straight and their leads are one width along
// them; a broken one's pieces (~16 m, merged likewise) each its floe's whose middle it lies in, so they
// spill across its old outline whole, further apart toward its edge where the waves work it
vec4 seaFloes(vec3 p, vec3 up, vec3 w, float ice, float cPix, float foot) {
  if (cPix <= 0.0 && ice <= 0.0) return vec4(0.0);
  // (a pixel 64 m across or more sees the share of it there only: no floes to find, the far fade's whole)
  if (foot >= 64.0) return vec4(cPix, 0.0, 0.7, cPix);
  uint id;
  float e, fw = max(foot, 0.03);
  vec3 gc;
  floeCell(p, up, 256.0, 16.0, 0x51ceu, id, e, gc);
  vec4 F = floeState(id, gc, w, ice, 256.0);
  float x = 0.0, rim = 0.0, age = 0.55 + 0.45 * float(id >> 16u) / 65536.0, cf = F.x;
  if (F.y > 0.0 && F.z < 0.5) { x = floeCover(e, F.w, fw); rim = 1.0 - smoothstep(F.w, F.w + 0.8 + fw, e); }
  if (F.y > 0.0 && F.z > 0.5 && foot >= 1.0) { x = F.x / max(min(1.0, 1.5 * F.x), 1e-3); age = 0.15; }
  if (foot < 4.0 && (F.y < 0.5 || F.z > 0.5 || e < F.w + 16.0)) {
    uint id2, oid;
    float e2, oe;
    vec3 gc2, ogc;
    floeCell(p, up, 16.0, 256.0, 0x7a11u, id2, e2, gc2);
    floeCell(gc2, up, 256.0, 16.0, 0x51ceu, oid, oe, ogc);
    vec4 O = floeState(oid, ogc, w, ice, 256.0);
    if (O.y > 0.0 && O.z > 0.5) {
      float g2 = max(0.15, 8.0 * (1.0 - sqrt(O.x / max(min(1.0, 1.5 * O.x), 1e-3)))) + 3.0 * (1.0 - smoothstep(0.0, 40.0, oe));
      float x2 = mix(floeCover(e2, g2, fw), x, smoothstep(1.0, 4.0, foot));
      if (x2 > x) { x = x2; rim = 1.0 - smoothstep(g2, g2 + 0.4 + fw, e2); age = 0.3 * float(id2 & 65535u) / 65536.0; cf = O.x; }
    }
  }
  // (from far off, the share of it there, of a mean age, its rims too fine to see: from 64 m pixels on,
  // the early way out's)
  float kFar = smoothstep(16.0, 64.0, foot);
  x = mix(x, cPix, kFar);
  return vec4(x, rim * x * (1.0 - kFar), mix(age, 0.7, kFar), mix(cf, cPix, kFar));
}
`;
