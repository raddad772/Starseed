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
// ---- the surf: the sea's waves coming in to its shores. The wind's sea fully developed (its significant
// height 0.21 U^2 / g, Pierson and Moskowitz) and its period a swell's (the stronger winds' far off:
// 10 U / g, ~9 s on Earth); over the shallows each crest runs in at a shallow wave's speed sqrt(g h), so
// the crests come round to lie along the depth's contours (as refraction lays them); steepening as they
// shoal (Green: H ~ h^-1/4), breaking where they reach ~0.78 of the depth (a bore of broken water running
// in, its face steep, its back long); then up the beach and back (Stockdon et al. 2006's run-up). Each
// wave its own height (sets of bigger ones, lulls), the crests out of step along the shore by its own
// long bends (whole cycles of the 4096 m period fp wraps at). The phase by depth alone (its travel time in
// over a beach of SURF_B0's slope), so the crests run unbroken across the mesh's triangles
// (U: the wind (m/s), g: gravity) -> (H0 m, T s, w rad/s, L0 m)
const float SURF_B0 = 0.035;
vec4 surfSea(float U, float g) {
  float H0 = 0.21 * U * U / g, T = clamp(10.0 * U / g, 3.0, 16.0), w = 6.2832 / T;
  return vec4(H0, T, w, g * T * T / 6.2832);
}
float surfLag(vec3 fp) {
  const float q = ${(2 * Math.PI / 4096).toFixed(9)};
  return 2.0 * sin(dot(fp, vec3(13.0, 7.0, -9.0) * q)) + 1.3 * sin(dot(fp, vec3(-5.0, 11.0, 8.0) * q) + 1.7);
}
// (the phase, rad: 2 pi n as crest n passes; at the shoreline (h 0) as it reaches it)
float surfPhase(vec3 fp, float h, vec4 sea, float g, float t) {
  return sea.z * (t + 2.0 * sqrt(max(h, 0.0)) / (SURF_B0 * sqrt(g))) + surfLag(fp);
}
// (the same by the distance x (m) out from the shore, where the colour map has it: its travel time in over
// a sandy shoreface's own profile, its depth A x^2/3 (Dean 1977, A ~0.1 m^1/3), so the crests lie along
// the coast as refraction lays them, whatever the bed's bumps; and the phase's rate out from shore (1/m))
const float SURF_A = 0.1;
float surfPhaseX(vec3 fp, float x, vec4 sea, float g, float t) {
  return sea.z * (t + 1.5 * pow(max(x, 0.0), 0.6667) / sqrt(g * SURF_A)) + surfLag(fp);
}
float surfRateX(float x, vec4 sea, float g) { return sea.z / sqrt(g * SURF_A * pow(max(x, 2.0), 0.6667)); }
// (each wave's height over the sea's: in sets of about seven, and its own)
float surfWave(float n) {
  return 0.5 + 0.35 * (0.5 + 0.5 * sin(n * 0.8976)) + 0.3 * fract(sin(n * 12.9898 + 4.1414) * 43758.5453);
}
// the surf at depth h on the water: its height above the still water (m), its slope's rate per rad of the
// phase (m/rad), how broken it is there (0..1: the bore's face and the foam it leaves), and whether it's in
// the surf zone (0..1); ph the phase, hw the wave's height before shoaling
vec4 surfAt(float h, float ph, vec4 sea, float fw) {
  float n = floor(ph / 6.2832), p = ph / 6.2832 - n;
  // (the front ramp belongs to the wave coming in behind it: crest n + 1)
  float hw = sea.x * (p > 1.0 - fw ? surfWave(n + 1.0) : surfWave(n));
  float hd = 0.1 * sea.w, Hs = hw * max(1.0, pow(hd / max(h, 0.05), 0.25));
  float hb = pow(hw * pow(hd, 0.25) / 0.78, 0.8);
  float H = min(Hs, 0.78 * max(h, 0.0));
  float br = smoothstep(1.25 * hb, 0.85 * hb, h);
  // (unbroken: a shoaling swell's sharp crests over flat troughs; broken: a bore, its face steep)
  float c = 0.5 + 0.5 * cos(6.2832 * p);
  float eU = H * (c * c - 0.375), dU = H * (-2.0 * c * 0.5 * sin(6.2832 * p) * 6.2832) / 6.2832;
  float back = p < 1.0 - fw ? pow(1.0 - p / (1.0 - fw), 1.5) : smoothstep(1.0 - fw, 1.0, p);
  float dback = p < 1.0 - fw ? -1.5 / (1.0 - fw) * pow(max(1.0 - p / (1.0 - fw), 0.0), 0.5) : 6.0 * (p - 1.0 + fw) * (1.0 - p) / (fw * fw * fw);
  float eB = H * (back - 0.3), dB = H * dback / 6.2832;
  // (the broken water: white on the face and just behind it, thinning toward the next)
  float foam = br * (p > 1.0 - fw ? smoothstep(1.0 - fw, 1.0, p) : exp(-p / 0.2));
  return vec4(mix(eU, eB, br), mix(dU, dB, br), foam, br);
}
// the swash on the beach: alt the ground's height over the still water (m), b its slope (tan), its phase
// at the shoreline ph -> (covered by the sheet (0..1), the uprush's foam edge (0..1), the run-up (m) the
// zone it wets reaches)
vec3 surfSwash(float alt, float b, float ph, vec4 sea) {
  float n = floor(ph / 6.2832), p = ph / 6.2832 - n;
  // (Stockdon et al. 2006: the run-up 2% of waves pass, from the sea's height, its deep-water length and
  // the beach's slope; this wave's its share of it)
  float bb = clamp(b, 0.01, 0.3), HL = sea.x * sea.w;
  float R2 = 1.1 * (0.35 * bb * sqrt(HL) + 0.5 * sqrt(HL * (0.563 * bb * bb + 0.004)));
  float Ri = R2 * (0.35 + 0.55 * surfWave(n));
  // (up fast, a third of the wave's period; back down slower, draining to the still water)
  float s = p < 0.32 ? Ri * sin(1.5708 * p / 0.32) : Ri * (1.0 - pow((p - 0.32) / 0.68, 0.75));
  float cover = smoothstep(s + 0.015, s - 0.015, alt) * step(-0.3, alt);
  float edge = p < 0.32 ? smoothstep(s - 0.25 * Ri - 0.02, s, alt) * cover : 0.0;
  return vec3(cover, edge, R2);
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
    vec2 wn, vec4 grp, vec3 fdir, float fv, vec3 gradH, float shoreX, vec3 gradX, out vec3 nF, out float rough, out float foam) {
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
  // the shore's: the surf coming in (surfAt): the swell's crests shoaling, then breaking into bores of
  // white water running in, their foam left behind them torn to lace (the groups' noise, the wind waves'
  // own crests a little); the waves' slopes on the water; on a lake the same, smaller by its fetch
  if (!river && !pond) {
    vec4 sea4 = surfSea(U, uLiquid2.x);
    sea4.x *= (sea ? 1.0 : 0.3 * fetch) * uLiquid.z;
    float hb = pow(sea4.x * 1.3 * pow(0.1 * sea4.w, 0.25) / 0.78, 0.8);
    if (depth < 2.0 * hb + 0.5 && sea4.x > 0.02) {
      // (out from the coast by the colour map's distance where it's built; else by the depth)
      bool byX = shoreX >= 0.0;
      float ph = byX ? surfPhaseX(fp, shoreX, sea4, uLiquid2.x, uTime) : surfPhase(fp, depth, sea4, uLiquid2.x, uTime);
      // (a bore's front wanders along it, a step ahead here and behind there (the swell's own groups, the
      // bed's), not a ruled line: bent by the smooth noise over tens of metres, its foam torn by it)
      ph += 1.6 * (grp.y - 0.5) + 0.4 * wn.x;
      // (the bore's face as steep as the pixel resolves: its length here, a shallow wave's, over the
      // pixel's span)
      float Lh = sea4.y * sqrt(uLiquid2.x * max(depth, 0.05));
      vec4 sf = surfAt(depth, ph, sea4, clamp(3.0 * foot / Lh, 0.07, 0.4));
      // (its slope: the phase's own across the ground, as its depth falls toward the shore)
      vec3 gph = byX ? surfRateX(shoreX, sea4, uLiquid2.x) * gradX : sea4.z / (SURF_B0 * sqrt(uLiquid2.x * max(depth, 0.05))) * gradH;
      vec3 gs = gph * sf.y;
      float gl = length(gs);
      if (gl > 0.6) gs *= 0.6 / gl;
      gs -= n * dot(gs, n);
      float fade = 1.0 - smoothstep(1.5 * hb, 2.0 * hb + 0.5, depth);
      nF = normalize(nF - gs * fade);
      // (broken water white on each bore's face and behind it, the more where the bed rises under it, the
      // wave pitching over (a bar's edge, a reef's, a step); on a gentle beach spilling, a little less)
      float rise = smoothstep(0.004, 0.04, length(gradH));
      float lace = smoothstep(0.15, 0.75, grp.x + 0.25 * W.crest) * smoothstep(0.1, 0.5, grp.z + 0.3 * (grp.w - 0.5));
      float surf = sf.z * (0.6 + 0.4 * rise) * (0.45 + 0.55 * lace) + sf.w * 0.12 * lace;
      // (and the still water's edge, where the backwash meets the next one coming in)
      surf += (1.0 - smoothstep(0.0, 0.12, depth)) * (0.3 + 0.5 * lace);
      foam = max(foam, clamp(surf, 0.0, 1.0) * fade * 0.85);
      rough = max(rough, 0.25 * sf.z * fade);
    }
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
// how much of it is frozen now: its annual mean (Tm, C over its freezing point) moved by the season;
// the sea's salt and a river's flow keep them open colder. Where the world keeps its year (the terrain
// shader's season map, terrainMaterial.js seasonYear; gen/liquidice.js frozenNow the same sums): its
// swing there now, the sea's its own (the climate's sea keeps its heat: a few degrees), a lake's and a
// river's the air's a little damped, a pond's the air's. Else the sun's latitude, the hemisphere's, and
// how fast that water follows: the sea slowest, a pond quickest
// (its temperature now and its freezing point, C)
vec2 liquidTs(float Tm, float kind, float flow, vec3 upF) {
  float Ts;
  if (uSeason.z > 0.5) {
    vec3 yr = seasonYear(upF);
    float follow = kind < 0.2 ? 1.0 : kind < 0.55 ? 0.8 : kind < 0.85 ? 0.7 : 1.0;
    Ts = Tm + follow * (yr.x * cos(uSeason.x) + yr.y * sin(uSeason.x));
  } else {
    float follow = kind < 0.2 ? 0.25 : kind < 0.55 ? 0.6 : kind < 0.85 ? 0.45 : 0.8;
    Ts = Tm + 70.0 * uLiquid2.w * upF.y * follow;
  }
  float Tf = (kind < 0.2 ? uLiquid2.z : 0.0) - (kind > 0.55 && kind < 0.85 ? 3.0 * flow : 0.0);
  return vec2(Ts, Tf);
}
float liquidIce(float Tm, float kind, float flow, vec3 upF) {
  vec2 t = liquidTs(Tm, kind, flow, upF);
  // (over a few degrees: the marginal ice)
  return 1.0 - smoothstep(t.y - 4.0, t.y + 4.0, t.x);
}
// ---- the sea's ice as floes (gen/liquidice.js reads the same, so where it's drawn is where it bears
// you): the pack subdivided, as ice breaks (Dave: "Why not actually subdivide the ice?"): floeOf.
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
vec4 tri0(vec3 p, vec3 w, float period);
vec4 tri(vec3 p, vec3 w, float period);
// a lead's ice now (cm), its time since it opened (days: the pack's leads open with each passing storm,
// ages spread exponentially about ~2 days, from its two floes' hash) at frz C under the sea's freezing
// point: grown by freezing degree days, 1.33 FDD^0.58 (Lebedev 1938); and its snow (0..1): a winter's
// fall (pDay mm of water a day) over that time, once it bears snow without flooding (5+ cm)
vec2 leadIce(uint lid, float frz, float pDay) {
  float age = -2.0 * log((float(lid & 65535u) + 0.5) / 65536.0);
  float h = frz > 0.0 ? 1.33 * pow(frz * age, 0.58) : 0.0;
  return vec2(h, (1.0 - exp(-pDay * age / 12.0)) * smoothstep(3.0, 8.0, h));
}
// a lead's half width (m): its crack's own opening (its hash), ~3% of the piece it parted (up to a plate's
// ~2 km), the wider the more open the pack (c). A closed pack's leads too: the cover counts their young
// ice as ice, and they freeze over by their age (leadIce): leads and young ice a tenth or so of a winter
// pack. The widest ~300 m
float leadHalf(uint cid, float c, float s) {
  return min(150.0, 0.03 * min(s, 2048.0) * (0.2 + 1.6 * float(cid & 255u) / 256.0) * (1.0 + 8.0 * (1.0 - sqrt(c))));
}
// what a crack did as it formed (its hash, the pack's cover, the piece it parted): opened, its lead's half
// width (m, > 0); or, where the pack's close and was pressed together along it, closed into a pressure
// ridge, its sail's height (m, as < 0: ~0.5-1.5 m, first-year sails' usual), up to half of a closed pack's
// cracks (gen/liquidice.js crackOpen the same)
float crackOpen(uint cid, float c, float s) {
  if (float((cid >> 8u) & 255u) / 256.0 < 0.5 * smoothstep(0.85, 1.0, c)) return -(0.5 + float((cid >> 16u) & 255u) / 255.0);
  return leadHalf(cid, c, s);
}
// how close the pack is at a point m of it: seaIceCover by the sea's ice there (season.js seaIceAt: the
// map's, the pixel's own ice where the world keeps no year) and its tiles there; one value for every
// pixel that asks of m
float pieceCover(vec3 m, float ice) {
  vec3 u = normalize(m), wm = pow(abs(u), vec3(4.0));
  wm /= wm.x + wm.y + wm.z;
  return seaIceCover(uSeason.z > 0.5 ? seaIceAt(m, uLiquid2.z) : ice, tri0(m, wm, 512.0).a, tri0(m, wm, 64.0).r);
}
// (the lead along a cube face's edge: the two faces' hash)
uint faceLead(uint face, int axis, bool neg) {
  uint of = uint(axis * 2) + (neg ? 1u : 0u);
  return floeHash(min(face, of), max(face, of), 0x4f1du, 0x2b7cu);
}
const int POLY_MAX = 12;
// how round a floe's corners are (m): ground down where floes knock together, the more the older it is,
// ~5-9% of its size; and where the pack's open (c) and the swell works it, round as pancake ice, up to ~0.4
// of it (gen/liquidice.js floeRound the same): its edge within that of two of its sides an arc between them
float floeRound(float size, uint id, float c) {
  float age = (0.3 + 0.7 * smoothstep(16.0, 200.0, size)) * (0.6 + 0.4 * float(id >> 16u) / 65536.0);
  return size * (0.06 * (0.5 + age) + 0.32 * (1.0 - smoothstep(0.5, 0.9, c)));
}
// the piece of the pack at p (body-fixed m), the sea's temperature's ice there: its hash (id), how far p
// is in from its edge less the lead there (e, m: < 0 in the lead), that lead's hash (lid), the pack's
// cover at it (c), its size (m) and middle, whether it's there (an open pack's missing pieces: open
// water). The pack subdivided (gen/liquidice.js floeOf, the same sums: its notes): each cube face in its
// own coordinates (a great circle a straight line), its square split by a crack through near the piece's
// centroid across its long axis, and each half again, every piece an exact convex polygon whose edges
// keep their cracks' hashes and leads' half widths
void floeOf(vec3 p, float ice, out uint id, out float e, out uint lid, out float c, out float size, out vec3 mid, out bool there, out vec4 ridge) {
  float R = length(p);
  vec3 a = abs(p);
  int ax = a.x >= a.y && a.x >= a.z ? 0 : a.y >= a.z ? 1 : 2, b = (ax + 1) % 3, d = (ax + 2) % 3;
  bool neg = p[ax] < 0.0;
  float sg = neg ? -1.0 : 1.0, pu = p[b] / p[ax], pv = p[d] / p[ax];
  uint face = uint(ax * 2) + (neg ? 1u : 0u);
  vec2 V[POLY_MAX];
  uint EI[POLY_MAX];
  float ES[POLY_MAX];
  V[0] = vec2(-1.0, -1.0); V[1] = vec2(1.0, -1.0); V[2] = vec2(1.0, 1.0); V[3] = vec2(-1.0, 1.0);
  EI[0] = faceLead(face, d, !neg); EI[1] = faceLead(face, b, neg); EI[2] = faceLead(face, d, neg); EI[3] = faceLead(face, b, !neg);
  for (int i = 0; i < 4; i++) ES[i] = leadHalf(EI[i], 1.0, 4096.0);
  ridge = vec4(0.0, 0.0, 0.0, 1e20);
  int n = 4;
  id = floeHash(face, 0x51ceu, 0u, 0x3a7bu);
  c = 1.0;
  float s = 0.0, cP = -1.0;
  vec3 m = p;
  for (int lvl = 0; lvl < 32; lvl++) {
    // (its centroid and area, from its first vertex; its long axis from its vertices' spread)
    vec2 v0 = V[0], cs = vec2(0.0);
    float A = 0.0;
    for (int i = 0; i < POLY_MAX; i++) {
      if (i >= n) break;
      vec2 xi = V[i] - v0, xj = V[(i + 1) % n] - v0;
      float w = xi.x * xj.y - xj.x * xi.y;
      A += w; cs += (xi + xj) * w;
    }
    A *= 0.5;
    if (abs(A) < 1e-20) break;
    vec2 cc = v0 + cs / (6.0 * A);
    float sxx = 0.0, syy = 0.0, sxy = 0.0;
    for (int i = 0; i < POLY_MAX; i++) {
      if (i >= n) break;
      vec2 x = V[i] - cc;
      sxx += x.x * x.x; syy += x.y * x.y; sxy += x.x * x.y;
    }
    // (a square has no long axis: atan(0, 0) is no number on a GPU)
    float th = abs(sxy) + abs(sxx - syy) > 1e-30 * (sxx + syy) ? 0.5 * atan(2.0 * sxy, sxx - syy) : 0.0, ext = sqrt((sxx + syy) / float(n));
    vec3 mm;
    mm[ax] = sg; mm[b] = sg * cc.x; mm[d] = sg * cc.y;
    m = normalize(mm) * R;
    s = R * sqrt(abs(A)) / pow(1.0 + dot(cc, cc), 0.75);
    // (its crack: across its long axis, give or take 30 degrees, off its middle along it)
    uint h = floeHash(id, uint(lvl), 0x51ceu, 0x3a7bu);
    float tc = th + 1.5708 + float((h >> 8u) & 1023u) / 1023.0 * 1.0472 - 0.5236, off = (float((h >> 18u) & 255u) / 255.0 - 0.5) * 0.6 * ext;
    vec2 qq = cc + vec2(cos(th), sin(th)) * off;
    float KA = -sin(tc), KB = cos(tc), KC = -(KA * qq.x + KB * qq.y);
    // (how close the pack is, for its splitting and its leads: read once for the pieces of a ~4 km plate
    // down to 1 km (at its middle), then at each piece's own: where it breaks up small near its edge;
    // whether a floe's there by its own: below)
    if (s < 4096.0) {
      if (cP < 0.0 || s < 1024.0) cP = pieceCover(m, ice);
      c = cP;
      // (its chance to stop as it is fades where the pack's open: the swell keeps breaking it there)
      if (s < 12.0 + 288.0 * smoothstep(0.4, 0.95, c) || float(h & 255u) < 51.2 * smoothstep(0.5, 0.9, c)) break;
    }
    if (n >= POLY_MAX - 1) break;
    float side = KA * pu + KB * pv + KC >= 0.0 ? 1.0 : -1.0;
    uint cid = floeHash(id, uint(lvl), 0x7a11u, 0x1f3du);
    float g = crackOpen(cid, c, s);
    vec2 W[POLY_MAX];
    uint WI[POLY_MAX];
    float WS[POLY_MAX];
    int k = 0;
    for (int i = 0; i < POLY_MAX; i++) {
      if (i >= n || k >= POLY_MAX) break;
      vec2 xi = V[i], xj = V[(i + 1) % n];
      float di = side * (KA * xi.x + KB * xi.y + KC), dj = side * (KA * xj.x + KB * xj.y + KC);
      if (di >= 0.0) { W[k] = xi; WI[k] = EI[i]; WS[k] = ES[i]; k++; }
      if ((di >= 0.0) != (dj >= 0.0) && k < POLY_MAX) {
        W[k] = xi + (xj - xi) * (di / (di - dj));
        // (entering the kept side: this edge the old one's; leaving: the crack's)
        if (di >= 0.0) { WI[k] = cid; WS[k] = g; } else { WI[k] = EI[i]; WS[k] = ES[i]; }
        k++;
      }
    }
    for (int i = 0; i < POLY_MAX; i++) { V[i] = W[i]; EI[i] = WI[i]; ES[i] = WS[i]; }
    n = k;
    id = floeHash(id, side > 0.0 ? 1u : 0u, uint(lvl), 0x9e37u);
  }
  // (in from its edge: the nearest of its edges' planes, less that edge's lead (a ridge's floes touch);
  // its corners rounded (floeRound); and its nearest ridge: the way across it, away from its crest, and
  // how far off: ridge)
  e = 1e20; lid = 0u;
  float rh = 0.0, e2 = 1e20;
  for (int i = 0; i < POLY_MAX; i++) {
    if (i >= n) break;
    vec2 dv = V[(i + 1) % n] - V[i];
    if (dot(dv, dv) < 1e-24) continue;
    vec3 N3;
    N3[b] = -dv.y; N3[d] = dv.x; N3[ax] = dv.y * V[i].x - dv.x * V[i].y;
    N3 = normalize(N3);
    float dn = dot(p, N3), ek = abs(dn) - max(ES[i], 0.15);
    if (ek < e) { e2 = e; e = ek; lid = EI[i]; } else if (ek < e2) e2 = ek;
    if (ES[i] < 0.0 && abs(dn) < ridge.w) { ridge = vec4(N3 * sign(dn), abs(dn)); rh = -ES[i]; }
  }
  // (a ridge's sail: its height here, its sides ~27 degrees, twice as wide as it's high either side)
  ridge.w = rh > 0.0 ? rh * max(0.0, 1.0 - ridge.w / (2.0 * rh)) : 0.0;
  c = pieceCover(m, ice);
  float rr = floeRound(s, id, c);
  if (e2 < rr) e = rr - length(vec2(rr - e, rr - e2));
  size = s; mid = m;
  there = c > 0.0 && float(id & 65535u) / 65536.0 <= min(1.0, 1.5 * c);
}
// the sea's ice at p (body-fixed m; w its triplanar weights), its temperature's ice (liquidIce) and the
// cover here (cPix: seaIceCover), a pixel foot m across: x how much of the pixel is ice (0..1), y its rim
// (the floe's side and wet edge showing), z its age (0 a young piece, grey, 1 an old floe under snow), w the
// pack's cover at its piece. frz: how far under the sea's freezing point the air over it is now (C), pDay:
// its winter's snowfall (mm of water a day); lead: the ice in the lead there (leadIce: cm, snow); ridge:
// a pressure ridge's sail there (xyz the way down its side, planet-fixed; w its height, m)
vec4 seaFloes(vec3 p, vec3 up, vec3 w, float ice, float cPix, float foot, float frz, float pDay, out vec2 lead, out vec4 ridge) {
  // (a lead of the median age: what its leads come to from far off)
  vec2 leadFar = leadIce(32768u, frz, pDay);
  lead = vec2(0.0);
  ridge = vec4(0.0);
  if (cPix <= 0.0 && ice <= 0.0) return vec4(0.0);
  // (a pixel 64 m across or more sees the share of it there only: no floes to find, the far fade's whole)
  if (foot >= 64.0) { lead = leadFar; return vec4(cPix, 0.0, 0.7, cPix); }
  uint id, lid;
  float e, c, size;
  vec3 mid;
  bool there;
  floeOf(p, ice, id, e, lid, c, size, mid, there, ridge);
  if (!there) ridge = vec4(0.0);
  // (its edges ragged at a few metres and less, not drawn with a ruler: gen/liquidice.js the same)
  e += (tri(p, w, 8.0).r - 0.5) * 1.6 + (tri(p, w, 2.0).a - 0.5) * 0.5;
  float fw = max(foot, 0.03), x = 0.0, rim = 0.0;
  float age = (0.3 + 0.7 * smoothstep(16.0, 200.0, size)) * (0.6 + 0.4 * float(id >> 16u) / 65536.0);
  // (box-filtered against its lead: a lead narrower than a pixel a faint line, not dashes)
  if (there) { x = clamp(e / fw + 0.5, 0.0, 1.0); rim = 1.0 - smoothstep(0.0, 0.8 + fw, e); lead = leadIce(lid, frz, pDay); }
  // (from far off, the share of it there, of a mean age, its rims too fine to see: from 64 m pixels on,
  // the early way out's)
  float kFar = smoothstep(16.0, 64.0, foot);
  x = mix(x, cPix, kFar);
  lead = mix(lead, leadFar, kFar);
  ridge.w *= 1.0 - kFar;
  return vec4(x, rim * x * (1.0 - kFar), mix(age, 0.7, kFar), mix(c, cPix, kFar));
}
`;
