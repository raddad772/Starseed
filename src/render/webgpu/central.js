// The central black hole in the sky (CAMPAIGN.md "Black hole jets and mirror"): the sky bent round
// it, its shadow, its thin disk and its two jets, drawn per pixel over the galactic background on
// the sky's own pixels (planets, ships and the mirror in front of it hide it; atmospheres are drawn
// over it). The mirror's reflected rays read the same function (webgpu/mirror.js).
//
// All lengths are in M = GM/c^2. The hole is so far away that the camera stands at its distance in
// its direction from anywhere in the system. Light round it is traced exactly in the Kerr metric (a
// spinning hole, spin a; a = 0 is Schwarzschild's): each pixel's ray carries the conserved quantities
// a photon arriving at the camera along it has, its angular momentum about the spin axis (lambda)
// and Carter's constant (Q), and is followed back from the camera in Mino time, where the radial and
// polar motions part: r'' = R'(r)/2, theta'' = Theta'(theta)/2, phi' from the frame's dragging and the
// photon's own turn (Bardeen, Cunningham 1973). Where it crosses the equatorial plane inside the
// disk, the disk is what's seen there (opaque); into the horizon, black; back out, the sky in the
// direction it left toward (the stars round the hole bent, rings and all).
// The disk: from the innermost stable orbit for that spin, a thin disk's temperatures (r^-3/4
// (1 - sqrt(r_in/r))^1/4), as blackbodies, its gas on Kerr's circular orbits, the light's shift the
// exact g = 1 / (u^t (1 - Omega lambda)) (Doppler, beaming toward the side coming at you, and the
// climb out of the well together), the brightness g^4 (I_nu/nu^3 kept along the ray). The jets:
// along the spin axis both ways, widening cones, brightest near the base, knotted, the one coming
// toward the camera boosted.
import { FULLSCREEN } from './shaders.js';
import { shaderModule } from './device.js';

export const CENTRAL_WGSL = /* wgsl */`
struct Central {
  camRot: mat4x4f,   // view direction -> world (the 3x3 in the top left)
  hole: vec4f,       // xyz: unit direction to the hole (world); w: its distance (M)
  spin: vec4f,       // xyz: unit spin axis (the jets'); w: the traced region's reach (impact parameter, M)
  disk: vec4f,       // x: inner edge (M; the innermost stable orbit), y: outer edge (M), z: brightness, w: peak temperature (K)
  disk2: vec4f,      // x: the radius it's opaque within (M), y: its optical depth there (straight through), z: spin a (0..0.998)
  jet: vec4f,        // x: length (M), y: half opening angle (rad), z: brightness, w: Lorentz factor
  jet2: vec4f,       // x: knots (per ln z), y: its light's cutoff at the base (jet's frame, x green's frequency), z: spectral index, w: cooling length (M)
  misc: vec4f,       // x: sky gain, y: tan half fov x, z: tan half fov y, w: on (> 0.5)
  lens: vec4f,       // the sky's lens low over a world (sky.js SKY_LENS): xyz the camera's up, w on
  lens2: vec4f,      // x, y: the drawn and true horizons' dips; z, w: the view's size (px)
  stars: vec4f,      // the sky's stars (sky.js starMat): x: the exposure they're brightened toward in space, y: twinkle (in air), z: time (s), w: extinction
  stars2: vec4f,     // x: exposure key, y, z: least and most exposure, w: the star table's cells a face (0: none)
  stars3: vec4f,     // x: radians a css pixel at the view's centre
  neb0: vec4f,       // the gas falling in (sim/nebula.js): xyz the camera's place on the galaxy chart (pc, the hole at 0); w its brightness
  neb1: vec4f,       // xyz its volume's least corner (pc); w on (> 0.5)
  neb2: vec4f,       // xyz its volume's greatest corner (pc); w its dust's opacity (per pc at full density)
  nebX: vec4f,       // world -> chart: the chart's x, y and z axes in world terms
  nebY: vec4f,
  nebZ: vec4f,
};
struct Gas { front: vec4f, back: vec4f };   // light added and what comes through: before the hole, beyond it
struct Lens { color: vec3f, trans: f32, dir: vec3f };

fn cPlanck(lambdaUm: f32, T: f32) -> f32 {
  let x = 14387.77 / (lambdaUm * max(T, 1.0));
  return 1.0 / (pow(lambdaUm, 5.0) * (exp(min(x, 80.0)) - 1.0));
}
// a blackbody's colour at T, at unit luminance
fn cBlackbody(T: f32) -> vec3f {
  let c = vec3f(cPlanck(0.61, T), cPlanck(0.55, T), cPlanck(0.465, T));
  return c / max(dot(c, vec3f(0.2126, 0.7152, 0.0722)), 1e-30);
}
fn cHash(p: vec3f) -> f32 { return fract(sin(dot(p, vec3f(127.1, 311.7, 74.7))) * 43758.5453); }
// value noise, 0..1
fn cNoise(p: vec3f) -> f32 {
  let i = floor(p);
  let f = fract(p);
  let u = f * f * (3.0 - 2.0 * f);
  let x00 = mix(cHash(i), cHash(i + vec3f(1.0, 0.0, 0.0)), u.x);
  let x10 = mix(cHash(i + vec3f(0.0, 1.0, 0.0)), cHash(i + vec3f(1.0, 1.0, 0.0)), u.x);
  let x01 = mix(cHash(i + vec3f(0.0, 0.0, 1.0)), cHash(i + vec3f(1.0, 0.0, 1.0)), u.x);
  let x11 = mix(cHash(i + vec3f(0.0, 1.0, 1.0)), cHash(i + vec3f(1.0, 1.0, 1.0)), u.x);
  return mix(mix(x00, x10, u.y), mix(x01, x11, u.y), u.z);
}
fn cPerp(n: vec3f) -> vec3f { return normalize(cross(n, select(vec3f(1.0, 0.0, 0.0), vec3f(0.0, 1.0, 0.0), abs(n.x) > 0.9))); }
// v (unit) turned by ang toward the way 'toward' lies from it
fn cBend(v: vec3f, toward: vec3f, ang: f32) -> vec3f {
  let p = toward - v * dot(toward, v);
  let l = length(p);
  if (l < 1e-7) { return v; }
  return normalize(v * cos(ang) + (p / l) * sin(ang));
}

// the star table (sky.js buildStarTable): a way's face and place on it, (face, px, py), px and py in -1..1
fn cStarFace(d: vec3f) -> vec3f {
  let a = abs(d);
  if (a.x >= a.y && a.x >= a.z) {
    if (d.x > 0.0) { return vec3f(0.0, -d.z / a.x, -d.y / a.x); }
    return vec3f(1.0, d.z / a.x, -d.y / a.x);
  }
  if (a.y >= a.z) {
    if (d.y > 0.0) { return vec3f(2.0, d.x / a.y, d.z / a.y); }
    return vec3f(3.0, d.x / a.y, -d.z / a.y);
  }
  if (d.z > 0.0) { return vec3f(4.0, d.x / a.z, -d.y / a.z); }
  return vec3f(5.0, -d.x / a.z, -d.y / a.z);
}
// the sky's stars seen the way d (true, world), each as the points drew them: a soft round dot its
// size in css pixels (pixAng radians each), twinkling in air, brightened in space toward the exposure
// they're seen at (adapt: the eye's last exposure); the nine cells round d's hold every star near it
fn cStars(C: Central, tA: texture_2d_array<f32>, tB: texture_2d_array<f32>, adapt: texture_2d<f32>, d: vec3f, pixAng: f32) -> vec3f {
  let N = i32(C.stars2.w);
  if (N < 1) { return vec3f(0.0); }
  let fp = cStarFace(d);
  let face = i32(fp.x);
  let tx = clamp(i32(floor((fp.y + 1.0) * 0.5 * f32(N))), 0, N - 1);
  let ty = clamp(i32(floor((fp.z + 1.0) * 0.5 * f32(N))), 0, N - 1);
  var acc = vec3f(0.0);
  for (var dy = -1; dy <= 1; dy++) {
    for (var dx = -1; dx <= 1; dx++) {
      let x = tx + dx;
      let y = ty + dy;
      if (x < 0 || y < 0 || x >= N || y >= N) { continue; }
      let A = textureLoad(tA, vec2i(x, y), face, 0);
      if (A.w <= 0.0) { continue; }
      let B = textureLoad(tB, vec2i(x, y), face, 0);
      // (its distance from d in css pixels, by the chord: acos can't see a pixel in f32)
      let r = length(A.xyz - d) / pixAng / (0.5 * A.w);
      if (r > 1.6) { continue; }
      let tw = 1.0 + C.stars.y * 0.45 * sin(C.stars.z * (7.0 + B.w * 9.0) + B.w * 40.0);
      acc += B.rgb * exp(-r * r * 4.0) * tw;
    }
  }
  let expo = clamp(C.stars2.x / exp2(textureLoad(adapt, vec2i(0, 0), 0).r), C.stars2.y, C.stars2.z);
  let boost = mix(clamp(C.stars.x / expo, 1.0, 12.0), 1.0, clamp(C.stars.y * 2.0, 0.0, 1.0));
  return acc * boost * C.stars.w;
}

// the gas falling toward the hole along a ray (world) from the camera: its light and its dust, split
// where the ray passes the hole (what's beyond it sits behind the hole's shadow and disk). Ionized by
// the disk's light, brightest nearest the hole, teal [O III] there, H-alpha red further out, its
// emission as density squared (recombination); its fine wisps a texture below the simulation's grid
fn cGas(C: Central, vol: texture_3d<f32>, samp: sampler, ray: vec3f) -> Gas {
  var G: Gas;
  G.front = vec4f(0.0, 0.0, 0.0, 1.0); G.back = vec4f(0.0, 0.0, 0.0, 1.0);
  if (C.neb1.w < 0.5) { return G; }
  let o = C.neb0.xyz;
  let d = normalize(vec3f(dot(C.nebX.xyz, ray), dot(C.nebY.xyz, ray), dot(C.nebZ.xyz, ray)));
  // (the ray through its box)
  let inv = 1.0 / select(d, vec3f(1e-6), abs(d) < vec3f(1e-6));
  let ta = (C.neb1.xyz - o) * inv;
  let tb = (C.neb2.xyz - o) * inv;
  let t0 = max(max(min(ta.x, tb.x), min(ta.y, tb.y)), max(min(ta.z, tb.z), 0.0));
  let t1 = min(min(max(ta.x, tb.x), max(ta.y, tb.y)), max(ta.z, tb.z));
  if (t1 <= t0) { return G; }
  let tc = -dot(o, d);
  let N = 80;
  let dt = (t1 - t0) / f32(N);
  let jitter = fract(sin(dot(ray, vec3f(12.9898, 78.233, 37.719))) * 43758.5453);
  let size = C.neb2.xyz - C.neb1.xyz;
  for (var i = 0; i < N; i++) {
    let t = t0 + (f32(i) + jitter) * dt;
    let pos = o + d * t;
    let g = textureSampleLevel(vol, samp, (pos - C.neb1.xyz) / size, 0.0).rg;
    var rho = g.r;
    if (rho < 0.003) { continue; }
    rho *= 0.7 + 0.6 * (0.6 * cNoise(pos * 60.0) + 0.4 * cNoise(pos * 170.0 + 5.3));
    // (lit by the hole: its light falling off with distance and shadowed by the gas between)
    let r = length(pos);
    let lit = g.g * (0.08 + 1.0 / (1.0 + r * r / 0.3));
    let col = mix(vec3f(1.0, 0.16, 0.12), vec3f(0.18, 0.9, 0.78), smoothstep(1.3, 0.35, r) * 0.65) + vec3f(0.08, 0.06, 0.05);
    let e = col * (C.neb0.w * rho * rho * lit * dt);
    let k = exp(-C.neb2.w * rho * dt);
    if (t < tc) { G.front = vec4f(G.front.rgb + G.front.a * e, G.front.a * k); }
    else { G.back = vec4f(G.back.rgb + G.back.a * e, G.back.a * k); }
  }
  return G;
}

// the disk's optical depth straight through at r: thick where it's hot, thinning fast outside (a
// starving hole's gas is sparse: its cool outer disk is nearly clear, not a black plate)
fn cTau(C: Central, r: f32) -> f32 { return C.disk2.y * pow(min(1.0, C.disk2.x / r), 4.0); }

// the disk's own light where the ray crossed it, at Boyer-Lindquist radius r and angle phi (about
// the spin axis); lam the photon's angular momentum about the axis (E = 1). Its gas on a prograde
// circular orbit, the light's shift from there g = 1 / (u^t (1 - Omega lambda)): its colour a
// blackbody's at g T, its brightness its whole light's, g^4 T^4 (the visible band's alone runs far
// steeper, the side coming at you dozens of times the rest: past what a screen can hold)
fn cDisk(C: Central, r: f32, phi: f32, lam: f32) -> vec3f {
  let a = C.disk2.z;
  let x = C.disk.x / r;
  let f = pow(x, 0.75) * pow(max(0.0, 1.0 - sqrt(x)), 0.25);
  let fmax = pow(36.0 / 49.0, 0.75) * pow(1.0 - sqrt(36.0 / 49.0), 0.25);
  let T = C.disk.w * f / fmax;
  let r15 = r * sqrt(r);
  let Om = 1.0 / (r15 + a);
  let ut = (r15 + a) / (pow(r, 0.75) * sqrt(max(r15 - 3.0 * sqrt(r) + 2.0 * a, 1e-6)));
  let g = max(1.0 / (ut * (1.0 - Om * lam)), 0.0);
  // (and its clumps of denser and thinner gas, drawn out along the orbits into streaks and wound
  // into spirals as the inner gas laps the outer: noise round each circle, many times finer across
  // than along)
  let lr = log(r);
  let ps = phi + 5.0 * lr;
  let q = vec3f(lr * 18.0, 2.2 * cos(ps), 2.2 * sin(ps));
  let tex = 0.55 + 0.9 * (0.5 * cNoise(q) + 0.3 * cNoise(q * 2.03 + 7.1) + 0.2 * cNoise(q * 4.1 + 3.7));
  return cBlackbody(max(g * T, 800.0)) * C.disk.z * pow(g, 4.0) * pow(T / C.disk.w, 4.0) * tex;
}

// Kerr in Mino time (M = 1, E = 1): R'(r)/2, Theta'(theta)/2, and dphi/dtau for the photon going forward
fn kR1(r: f32, a: f32, lam: f32, K: f32) -> f32 { return 2.0 * r * (r * r + a * a - a * lam) - (r - 1.0) * K; }
// (theta may run past a pole, to below 0 or above pi: the same point, phi turned half round; kept
// signed, the force stays odd about each pole and carries the ray through the right way)
fn kT1(th: f32, a: f32, lam: f32) -> f32 {
  let s0 = sin(th);
  let s = select(max(s0, 1e-6), min(s0, -1e-6), s0 < 0.0);
  return cos(th) * (lam * lam / (s * s * s) - a * a * s);
}
fn kP(r: f32, th: f32, a: f32, lam: f32) -> f32 {
  let s2 = max(sin(th) * sin(th), 1e-12);
  return a * (r * r + a * a - a * lam) / (r * r - 2.0 * r + a * a) - a + lam / s2;
}

// the jets' light along a ray from the camera: for each jet, the point on its axis the ray passes
// closest to; there, the glow of a thin jet of that width (its surface brightness: what the ray
// crosses, dimmer as it widens), knotted along its length. Its light is synchrotron, a power law
// I_nu ~ nu^-alpha cut off where its electrons' energies end, the cutoff falling along the jet as
// they cool; flowing at Lorentz factor Gamma, it's seen shifted by delta = 1 / (Gamma (1 - beta
// cos)): a continuous jet's I_nu(nu) = delta^(2+alpha) nu^-alpha exp(-nu / (delta nu_c)), brighter
// and bluer where it comes toward the camera, dimmer and redder where it goes away. Hidden behind
// the inner disk (its optical depth where the ray meets the disk's plane in front of it) and
// behind the hole's shadow.
fn cJets(C: Central, ray: vec3f) -> vec3f {
  if (C.jet.z <= 0.0) { return vec3f(0.0); }
  let H = C.hole.xyz * C.hole.w;
  let G = max(C.jet.w, 1.01);
  let beta = sqrt(1.0 - 1.0 / (G * G));
  let al = C.jet2.z;
  let nu = vec3f(0.55 / 0.61, 1.0, 0.55 / 0.465);
  let zs = C.spin.xyz;
  let rz = dot(ray, zs);
  let hr = dot(H, ray);
  let bh = length(H - ray * hr);
  var acc = vec3f(0.0);
  for (var j = 0; j < 2; j++) {
    let a = zs * select(-1.0, 1.0, j == 0);
    // (the closest approach of the ray t*ray, t > 0, and the axis H + z a, 0 < z < length)
    let ra = dot(ray, a);
    let den = max(1.0 - ra * ra, 1e-6);
    let ha = dot(H, a);
    var z = (hr * ra - ha) / den;
    z = clamp(z, 4.0, C.jet.x);
    let P = H + a * z;
    let t = max(dot(P, ray), 0.0);
    let dperp = length(P - ray * t);
    // (collimated near its base, its width growing as z^0.58 the way M87's does, then a cone)
    let w = max(C.jet.y * z, 0.8 * pow(z, 0.58));
    let prof = exp(-(dperp * dperp) / (w * w));
    if (prof < 1e-4 || t <= 0.0) { continue; }
    // (behind the hole, or through the disk's plane on the way to it)
    var occ = 1.0;
    if (t > hr && bh < 5.5) { continue; }
    if (abs(rz) > 1e-5) {
      let td = dot(H, zs) / rz;
      if (td > 0.0 && td < t) {
        let rc = length(ray * td - H);
        if (rc >= C.disk.x && rc <= C.disk.y) { occ = exp(-cTau(C, rc) / max(abs(rz), 0.03)); }
      }
    }
    let dirP = normalize(P);
    let delta = 1.0 / (G * (1.0 - beta * dot(a, -dirP)));
    let nuc = C.jet2.y / (1.0 + z / C.jet2.w);
    // (I_lambda in each channel: I_nu nu^2, at green's frequency 1 with delta 1 and no cutoff)
    let spec = pow(delta, 2.0 + al) * pow(nu, vec3f(2.0 - al)) * exp(-nu / (delta * nuc));
    let knot = 0.55 + 0.45 * pow(0.5 + 0.5 * sin(log(z) * C.jet2.x + f32(j) * 2.1), 3.0);
    let sinT = sqrt(den);
    acc += spec * occ * C.jet.z * knot * prof * (60.0 / (w + 60.0)) / max(sinT, 0.08) / (1.0 + z / (C.jet.x * 0.15));
  }
  return acc;
}

// what a ray from the camera (its true way, world) sees of the hole: light added along it (the jets,
// the disk), how much of what's behind comes through, and the way the sky's to be read from. Near
// the hole, within the traced region's reach, the ray is followed exactly; outside it, where the
// field is weak, the sky's simply bent toward the hole by Einstein's angle for a camera at the
// hole's distance, 2 M (1 + cos psi) / b, which the traced rays meet at the reach without a seam.
fn cLens(C: Central, ray: vec3f) -> Lens {
  var L: Lens;
  L.color = vec3f(0.0); L.trans = 1.0; L.dir = ray;
  if (C.misc.w < 0.5) { return L; }
  L.color = cJets(C, ray);
  let n = C.hole.xyz;
  let D = C.hole.w;
  let cp = dot(ray, n);
  let sp = sqrt(max(0.0, 1.0 - cp * cp));
  if (cp <= 0.0 || D * sp > C.spin.w) {
    // ((1 + cos) / sin written so neither end divides by nothing)
    let k = select(sp / max(1.0 - cp, 1e-7), (1.0 + cp) / max(sp, 1e-7), cp > 0.0);
    L.dir = cBend(ray, n, 2.0 * k / D);
    return L;
  }
  let a = C.disk2.z;
  // the hole's frame: z its spin axis, the camera at phi = 0
  let zh = C.spin.xyz;
  let toCam = -n;
  var xh = toCam - zh * dot(toCam, zh);
  let lx = length(xh);
  if (lx < 1e-6) { xh = cPerp(zh); } else { xh = xh / lx; }
  let yh = cross(zh, xh);
  let c0 = clamp(dot(toCam, zh), -0.9999, 0.9999);
  let s0 = sqrt(1.0 - c0 * c0);
  // the arriving photon's constants: its angular momentum about the axis and Carter's Q (far
  // out, where space is flat); the ray traced back is that photon run backward
  let X0 = toCam * D;
  var lam = -dot(cross(X0, ray), zh);
  let eth = c0 * xh - s0 * zh;
  var pth = D * dot(ray, eth);
  let Q = pth * pth + c0 * c0 * (lam * lam / (s0 * s0) - a * a);
  // (a ray over the very pole, lambda ~ 0, kept a thousandth of a radian off it: passing by, it
  // swings round fast in phi, and through it there'd be no step short enough)
  let sq = sqrt(max(Q, 1e-6));
  if (abs(lam) < 1e-3 * sq) { lam = select(1e-3 * sq, -1e-3 * sq, lam < 0.0); }
  let K = (lam - a) * (lam - a) + Q;
  let thMin = abs(lam) / sq;
  // (dr/dtau inward, from R(r) = r^4 Rs(r), Rs kept to its small terms: f32 can't hold r^4 - r^4)
  let c2 = 2.0 * a * a - 2.0 * a * lam - K;
  let c4 = (a * a - a * lam) * (a * a - a * lam) - a * a * K;
  var r = D;
  var pr = -r * r * sqrt(max(0.0, 1.0 + c2 / (r * r) + 2.0 * K / (r * r * r) + c4 / (r * r * r * r)));
  var th = acos(c0);
  var ph = 0.0;
  let rh = 1.0 + sqrt(max(0.0, 1.0 - a * a));
  for (var i = 0; i < 2000; i++) {
    // (steps shorter near the hole, and near the poles, where a ray with little turn about the axis
    // swings round fast: there phi moving a tenth of a radian at most, theta a fifth of its way)
    let sn = sin(th);
    let h = min(0.05 / max(r, 1.5), min(0.1 * sn * sn / abs(lam), 0.2 * max(abs(sn), thMin) / sq));
    // RK4 on (r, pr, th, pth, ph); traced backward, phi turns the other way
    let k1r = pr; let k1p = kR1(r, a, lam, K); let k1t = pth; let k1q = kT1(th, a, lam); let k1f = -kP(r, th, a, lam);
    let r2 = r + 0.5 * h * k1r; let p2 = pr + 0.5 * h * k1p; let t2 = th + 0.5 * h * k1t; let q2 = pth + 0.5 * h * k1q;
    let k2r = p2; let k2p = kR1(r2, a, lam, K); let k2t = q2; let k2q = kT1(t2, a, lam); let k2f = -kP(r2, t2, a, lam);
    let r3 = r + 0.5 * h * k2r; let p3 = pr + 0.5 * h * k2p; let t3 = th + 0.5 * h * k2t; let q3 = pth + 0.5 * h * k2q;
    let k3r = p3; let k3p = kR1(r3, a, lam, K); let k3t = q3; let k3q = kT1(t3, a, lam); let k3f = -kP(r3, t3, a, lam);
    let r4 = r + h * k3r; let p4 = pr + h * k3p; let t4 = th + h * k3t; let q4 = pth + h * k3q;
    let k4r = p4; let k4p = kR1(r4, a, lam, K); let k4t = q4; let k4q = kT1(t4, a, lam); let k4f = -kP(r4, t4, a, lam);
    let rn = r + h / 6.0 * (k1r + 2.0 * k2r + 2.0 * k3r + k4r);
    let prn = pr + h / 6.0 * (k1p + 2.0 * k2p + 2.0 * k3p + k4p);
    let thn = th + h / 6.0 * (k1t + 2.0 * k2t + 2.0 * k3t + k4t);
    let pthn = pth + h / 6.0 * (k1q + 2.0 * k2q + 2.0 * k3q + k4q);
    let phn = ph + h / 6.0 * (k1f + 2.0 * k2f + 2.0 * k3f + k4f);
    // through the equatorial plane: the disk's light there, and what of the light behind it gets
    // through (its depth longer the more slanting the crossing; far out the slant's sqrt(Q) / r)
    let z0 = cos(th);
    let z1 = cos(thn);
    if (z0 * z1 <= 0.0) {
      // (where the chord between the two steps meets the plane: the ray's nearly straight over a
      // step, and far out a step's long, tens of M; interpolating r and phi themselves there
      // put the disk's far edge in steps)
      let q0 = r * vec3f(sin(th) * cos(ph), sin(th) * sin(ph), z0);
      let q1 = rn * vec3f(sin(thn) * cos(phn), sin(thn) * sin(phn), z1);
      let qc = mix(q0, q1, z0 * r / (z0 * r - z1 * rn + 1e-12));
      let rc = length(qc.xy);
      if (rc >= C.disk.x && rc <= C.disk.y) {
        let tau = cTau(C, rc) / clamp(sq / rc, 0.03, 1.0);
        let k = exp(-tau);
        L.color += L.trans * (1.0 - k) * cDisk(C, rc, atan2(qc.y, qc.x), lam);
        L.trans *= k;
        if (L.trans < 0.004) { L.trans = 0.0; return L; }
      }
    }
    r = rn; pr = prn; th = thn; pth = pthn; ph = phn;
    // (and back onto pr^2 = R(r) wherever it's well off its turning point: on the long way in, the
    // second-order r'' drifts by parts of r^4, enough to turn a ray round far out)
    let Rs = 1.0 + c2 / (r * r) + 2.0 * K / (r * r * r) + c4 / (r * r * r * r);
    if (Rs > 0.25) { pr = sign(pr) * r * r * sqrt(Rs); }
    if (r <= rh * 1.01) { L.trans = 0.0; return L; }
    // (out past the disk and the reach, on its way out: the rest of its bending's weak)
    if (pr > 0.0 && r > max(C.spin.w, C.disk.y * 1.05)) { break; }
  }
  // where it's headed (its motion there, nearly flat space), and the bending still to come on its
  // way out to the sky: a straight line's, 2 M (1 - cos chi) / b with chi its angle from the radius
  let st = sin(th);
  let ct = cos(th);
  let rho = cos(ph) * xh + sin(ph) * yh;
  let rhat = st * rho + ct * zh;
  let that = ct * rho - st * zh;
  let phat = -sin(ph) * xh + cos(ph) * yh;
  let v = normalize(pr * rhat + r * pth * that - r * st * kP(r, th, a, lam) * phat);
  let cx = clamp(dot(v, rhat), -1.0, 1.0);
  let sx = sqrt(1.0 - cx * cx);
  L.dir = cBend(v, -rhat, 2.0 * sx / (r * max(1.0 + cx, 1e-6)));
  return L;
}

// the sky's lens low over a world (sky.js GLSL_LENS_DIR): from the drawn way to the true one, or back
fn cLensDir(C: Central, d: vec3f, toDrawn: bool) -> vec3f {
  if (C.lens.w < 0.5 || C.lens2.x <= C.lens2.y) { return d; }
  let up = C.lens.xyz;
  let c = clamp(dot(d, up), -1.0, 1.0);
  let z = acos(c);
  let hD = 1.5707963 + C.lens2.x;
  let hT = 1.5707963 + C.lens2.y;
  var z2: f32;
  if (toDrawn) { z2 = select(hD + (z - hT) * (3.14159265 - hD) / (3.14159265 - hT), z * hD / hT, z <= hT); }
  else { z2 = select(hT + (z - hD) * (3.14159265 - hT) / (3.14159265 - hD), z * hT / hD, z <= hD); }
  let hv = d - up * c;
  let hl = length(hv);
  if (hl < 1e-6) { return d; }
  return up * cos(z2) + (hv / hl) * sin(z2);
}
`;

const CODE = FULLSCREEN + CENTRAL_WGSL + /* wgsl */`
@group(0) @binding(0) var<uniform> C: Central;
@group(0) @binding(1) var depth: texture_2d<f32>;
@group(0) @binding(2) var sky: texture_cube<f32>;
@group(0) @binding(3) var skySampler: sampler;
@group(0) @binding(4) var starA: texture_2d_array<f32>;
@group(0) @binding(5) var starB: texture_2d_array<f32>;
@group(0) @binding(6) var adapt: texture_2d<f32>;
@group(0) @binding(7) var gasVolume: texture_3d<f32>;
@group(0) @binding(8) var gasSampler: sampler;
// the sky the way d (true, world) looks: the galaxy's light and its stars
fn skyAt(d: vec3f) -> vec3f {
  return textureSampleLevel(sky, skySampler, d, 0.0).rgb * C.misc.x + cStars(C, starA, starB, adapt, d, C.stars3.x);
}
@fragment fn central(v: Fullscreen) -> @location(0) vec4f {
  let d = textureLoad(depth, vec2i(v.position.xy), 0).r;
  if (d > 0.0) { discard; }      // (not sky: something's in front of it)
  let ndc = vec2f(v.uv.x * 2.0 - 1.0, 1.0 - v.uv.y * 2.0);
  let dv = normalize(vec3f(ndc.x * C.misc.y, ndc.y * C.misc.z, -1.0));
  let ray = cLensDir(C, normalize((C.camRot * vec4f(dv, 0.0)).xyz), false);
  let L = cLens(C, ray);
  let gas = cGas(C, gasVolume, gasSampler, ray);
  // (in place of the sky drawn here: the gas in front, through it the hole's light, and the gas
  // beyond the hole and the sky bent round it through what comes through)
  var behind = gas.back.rgb;
  if (L.trans > 0.0) { behind += gas.back.a * skyAt(L.dir); }
  let c = gas.front.rgb + gas.front.a * (L.color + L.trans * behind);
  return vec4f(c, 1.0);
}
`;

// the uniforms (shared with the mirror's pass): engine.central from the game (sim/centralObject.js)
export const CENTRAL_FLOATS = 88;
export function centralUniforms(engine, camRot, tanHalf, size, out = new Float32Array(CENTRAL_FLOATS)) {
  const c = engine.central;
  out.fill(0);
  if (camRot) out.set(camRot, 0);
  if (!c) return out;
  out.set([c.dir.x, c.dir.y, c.dir.z, c.distance], 16);
  out.set([c.spin.x, c.spin.y, c.spin.z, c.reach], 20);
  out.set([c.isco || 6, c.disk.outer, c.disk.brightness, c.disk.temperature], 24);
  out.set([c.disk.opaqueTo, c.disk.tau, c.spinA || 0, 0], 28);
  out.set([c.jet.length, c.jet.angle, c.jet.brightness, c.jet.gamma], 32);
  out.set([c.jet.knots, c.jet.cutoff, c.jet.index, c.jet.cooling], 36);
  out.set([engine.bgMat?.uniforms.uSkyGain?.value || 1, tanHalf ? tanHalf.x : 1, tanHalf ? tanHalf.y : 1, 1], 40);
  const lu = engine.bgMat?.uniforms.uLensUp?.value, lk = engine.bgMat?.uniforms.uLensK?.value;
  out.set([lu ? lu.x : 0, lu ? lu.y : 1, lu ? lu.z : 0, lu ? lu.w : 0], 44);
  out.set([lk ? lk.x : 0, lk ? lk.y : 0, size ? size[0] : 1, size ? size[1] : 1], 48);
  const sky = engine.frameInputs?.sky, su = sky?.starMat?.uniforms;
  if (su) {
    out.set([su.uStarExp.value, su.uTwinkle.value, su.uTime.value, su.uExtinction.value], 52);
    out.set([su.uKey.value, su.uMinExp.value, su.uMaxExp.value, sky.starTable && sky.isNative ? sky.starTable.size : 0], 56);
  }
  // (a css pixel's angle at the centre: the stars' sizes are the points' own, in css pixels)
  const th = engine.tanHalf, css = engine.cssH || (size ? size[1] : 1);
  out.set([2 * th.y / Math.max(1, (engine.view?.rect?.h || css)), 0, 0, 0], 60);
  const g = c.gas;
  if (g) {
    out.set([g.camera[0], g.camera[1], g.camera[2], g.brightness], 64);
    out.set([g.min[0], g.min[1], g.min[2], 1], 68);
    out.set([g.max[0], g.max[1], g.max[2], g.dust], 72);
    out.set([g.axes[0].x, g.axes[0].y, g.axes[0].z, 0], 76);
    out.set([g.axes[1].x, g.axes[1].y, g.axes[1].z, 0], 80);
    out.set([g.axes[2].x, g.axes[2].y, g.axes[2].z, 0], 84);
  }
  return out;
}

export class CentralPass {
  constructor(device, background) { this.device = device; this.background = background; this.buffers = new Map(); this.data = new Float32Array(CENTRAL_FLOATS); }
  async init() {
    const module = await shaderModule(this.device, 'central black hole', CODE);
    this.pipeline = await this.device.createRenderPipelineAsync({ label: 'central black hole', layout: 'auto',
      vertex: { module, entryPoint: 'fullscreen' }, fragment: { module, entryPoint: 'central', targets: [{ format: 'rgba16float' }] } });
  }
  // in place of the sky drawn into target (an air ping/pong entry), where the depth says it's sky
  render(engine, t, target) {
    const sky = engine.frameInputs?.sky, source = sky?.cubeRT.texture;
    if (!this.pipeline || !engine.central || !source) return;
    const cube = this.background.cube(source), stars = this.background.stars(sky), adapt = t.post?.adapt[t.post.idx] || this.background.blank;
    const gas = this.background.gas(engine.central.gas);
    const camera = engine.view.camera, m = camera.matrixWorld.elements;
    // (the camera's rotation, as a mat4 with the 3x3 in its top left)
    const rot = [m[0], m[1], m[2], 0, m[4], m[5], m[6], 0, m[8], m[9], m[10], 0, 0, 0, 0, 1];
    let buffer = this.buffers.get(t);
    if (!buffer) { buffer = this.device.createBuffer({ label: 'central black hole', size: CENTRAL_FLOATS * 4, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST }); this.buffers.set(t, buffer); }
    this.device.queue.writeBuffer(buffer, 0, centralUniforms(engine, rot, engine.tanHalf, [t.width, t.height], this.data));
    const group = this.device.createBindGroup({ layout: this.pipeline.getBindGroupLayout(0), entries: [
      { binding: 0, resource: { buffer } }, { binding: 1, resource: t.sampledDepth.view }, { binding: 2, resource: cube.view }, { binding: 3, resource: cube.sampler },
      { binding: 4, resource: stars.a }, { binding: 5, resource: stars.b }, { binding: 6, resource: adapt.view },
      { binding: 7, resource: gas.view }, { binding: 8, resource: gas.sampler }] });
    const encoder = this.device.createCommandEncoder({ label: 'central black hole' });
    const pass = encoder.beginRenderPass({ colorAttachments: [{ view: target.view, loadOp: 'load', storeOp: 'store' }] });
    pass.setPipeline(this.pipeline); pass.setBindGroup(0, group); pass.draw(3); pass.end();
    this.device.queue.submit([encoder.finish()]);
  }
  release(t) { this.buffers.get(t)?.destroy(); this.buffers.delete(t); }
  dispose() { for (const b of this.buffers.values()) b.destroy(); this.buffers.clear(); }
}
