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
  spin: vec4f,       // xyz: unit spin axis (the jets'); w: the lens region's reach (impact parameter, M)
  disk: vec4f,       // x: inner edge (M; the innermost stable orbit), y: outer edge (M), z: brightness, w: peak temperature (K)
  jet: vec4f,        // x: length (M), y: half opening angle (rad), z: brightness, w: Lorentz factor
  misc: vec4f,       // x: sky gain, y: tan half fov x, z: tan half fov y, w: on (> 0.5)
  misc2: vec4f,      // x: knot spacing (per ln z), y: spin a (0..0.998), z: innermost stable orbit (M), w: unused
};
struct Lens { color: vec3f, replace: f32, dir: vec3f, captured: f32 };

fn cPlanck(lambdaUm: f32, T: f32) -> f32 {
  let x = 14387.77 / (lambdaUm * T);
  return 1.0 / (pow(lambdaUm, 5.0) * (exp(min(x, 80.0)) - 1.0));
}
// a blackbody's colour at T, at unit luminance
fn cBlackbody(T: f32) -> vec3f {
  let c = vec3f(cPlanck(0.61, T), cPlanck(0.55, T), cPlanck(0.465, T));
  return c / max(dot(c, vec3f(0.2126, 0.7152, 0.0722)), 1e-30);
}
fn cPerp(n: vec3f) -> vec3f { return normalize(cross(n, select(vec3f(1.0, 0.0, 0.0), vec3f(0.0, 1.0, 0.0), abs(n.x) > 0.9))); }

// the disk where the light crossed it, at Boyer-Lindquist radius r and angle phi (about the spin
// axis); lam the photon's angular momentum about the axis (E = 1)
fn cDisk(C: Central, r: f32, phi: f32, lam: f32) -> vec3f {
  let a = C.misc2.y;
  let x = C.misc2.z / r;
  let f = pow(x, 0.75) * pow(max(0.0, 1.0 - sqrt(x)), 0.25);
  let fmax = pow(36.0 / 49.0, 0.75) * pow(1.0 - sqrt(36.0 / 49.0), 0.25);
  let T = C.disk.w * f / fmax;
  // (its gas on a prograde circular orbit; the photon's shift from there to the camera)
  let r15 = r * sqrt(r);
  let Om = 1.0 / (r15 + a);
  let ut = (r15 + a) / (pow(r, 0.75) * sqrt(max(r15 - 3.0 * sqrt(r) + 2.0 * a, 1e-6)));
  let g = 1.0 / (ut * (1.0 - Om * lam));
  // (and a little structure: denser and thinner gas, in rings that don't repeat and streaks drawn
  // out along the orbits, sheared as the inner gas laps the outer)
  let lr = log(r);
  let sh = phi + 4.0 * lr;
  let tex = 0.86 + 0.06 * sin(lr * 23.0 + 1.7 * sin(lr * 7.3)) + 0.05 * sin(lr * 61.0 + 0.8 * sin(sh * 2.0)) + 0.03 * sin(sh * 5.0 + lr * 37.0);
  return cBlackbody(max(g * T, 800.0)) * C.disk.z * pow(max(g, 0.0), 4.0) * pow(T / C.disk.w, 4.0) * tex;
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
// closest to; there, the glow of a thin cone of that width (its surface brightness: what the ray
// crosses, dimmer as the jet widens), boosted toward the camera, knotted along its length
fn cJets(C: Central, ray: vec3f) -> vec3f {
  if (C.jet.z <= 0.0) { return vec3f(0.0); }
  let H = C.hole.xyz * C.hole.w;
  let G = max(C.jet.w, 1.01);
  let beta = sqrt(1.0 - 1.0 / (G * G));
  var acc = vec3f(0.0);
  for (var j = 0; j < 2; j++) {
    let a = C.spin.xyz * select(-1.0, 1.0, j == 0);
    // (the closest approach of the ray t*ray, t > 0, and the axis H + z a, 0 < z < length)
    let ra = dot(ray, a);
    let den = max(1.0 - ra * ra, 1e-6);
    let hr = dot(H, ray);
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
    let dirP = normalize(P);
    let delta = 1.0 / (G * (1.0 - beta * dot(a, -dirP)));
    let knot = 0.55 + 0.45 * pow(0.5 + 0.5 * sin(log(z) * C.misc2.x + f32(j) * 2.1), 3.0);
    let along = sqrt(z / C.jet.x);
    let col = mix(vec3f(0.78, 0.88, 1.0), vec3f(0.62, 0.58, 1.0), along);
    let sinT = sqrt(den);
    acc += col * C.jet.z * pow(delta, 2.5) * knot * prof * (60.0 / (w + 60.0)) / max(sinT, 0.08) / (1.0 + z / (C.jet.x * 0.15));
  }
  return acc;
}

// what a ray from the camera sees of the hole: added light, and, inside the lens region, the
// direction the sky's to be read from in its place (or nothing, into the hole or onto the disk)
fn cLens(C: Central, ray: vec3f) -> Lens {
  var L: Lens;
  L.color = vec3f(0.0); L.replace = 0.0; L.dir = ray; L.captured = 0.0;
  if (C.misc.w < 0.5) { return L; }
  L.color = cJets(C, ray);
  let n = C.hole.xyz;
  let D = C.hole.w;
  let cp = dot(ray, n);
  if (cp <= 0.0) { return L; }
  if (D * sqrt(max(0.0, 1.0 - cp * cp)) > C.spin.w) { return L; }
  L.replace = 1.0;
  let a = C.misc2.y;
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
    // through the equatorial plane: the disk, if it's there
    let z0 = cos(th);
    let z1 = cos(thn);
    if (z0 * z1 <= 0.0) {
      let f = z0 / (z0 - z1 + 1e-12);
      let rc = mix(r, rn, f);
      if (rc >= C.misc2.z && rc <= C.disk.y) {
        L.color += cDisk(C, rc, mix(ph, phn, f), lam);
        L.captured = 1.0;
        return L;
      }
    }
    r = rn; pr = prn; th = thn; pth = pthn; ph = phn;
    // (and back onto pr^2 = R(r) wherever it's well off its turning point: on the long way in, the
    // second-order r'' drifts by parts of r^4, enough to turn a ray round far out)
    let Rs = 1.0 + c2 / (r * r) + 2.0 * K / (r * r * r) + c4 / (r * r * r * r);
    if (Rs > 0.25) { pr = sign(pr) * r * r * sqrt(Rs); }
    if (r <= rh * 1.01) { L.captured = 1.0; return L; }
    if (pr > 0.0 && r > D * 1.02) { break; }
  }
  // where it's headed, far out (its motion there, flat space; the sky's that way)
  let st = sin(th);
  let ct = cos(th);
  let rho = cos(ph) * xh + sin(ph) * yh;
  let rhat = st * rho + ct * zh;
  let that = ct * rho - st * zh;
  let phat = -sin(ph) * xh + cos(ph) * yh;
  L.dir = normalize(pr * rhat + r * pth * that - r * st * kP(r, th, a, lam) * phat);
  return L;
}
`;

const CODE = FULLSCREEN + CENTRAL_WGSL + /* wgsl */`
@group(0) @binding(0) var<uniform> C: Central;
@group(0) @binding(1) var depth: texture_2d<f32>;
@group(0) @binding(2) var sky: texture_cube<f32>;
@group(0) @binding(3) var skySampler: sampler;
@fragment fn central(v: Fullscreen) -> @location(0) vec4f {
  let d = textureLoad(depth, vec2i(v.position.xy), 0).r;
  if (d > 0.0) { discard; }      // (not sky: something's in front of it)
  let ndc = vec2f(v.uv.x * 2.0 - 1.0, 1.0 - v.uv.y * 2.0);
  let dv = normalize(vec3f(ndc.x * C.misc.y, ndc.y * C.misc.z, -1.0));
  let ray = normalize((C.camRot * vec4f(dv, 0.0)).xyz);
  let L = cLens(C, ray);
  if (L.replace < 0.5) {
    if (dot(L.color, vec3f(1.0)) <= 0.0) { discard; }
    return vec4f(L.color, 0.0);   // (added over the sky)
  }
  // the sky in its place: read where the light came from (none from the hole, or from behind the disk)
  var c = L.color;
  if (L.captured < 0.5) { c += textureSampleLevel(sky, skySampler, L.dir, 0.0).rgb * C.misc.x; }
  return vec4f(c, 1.0);
}
`;

// the uniforms (shared with the mirror's pass): engine.central from the game (sim/centralObject.js)
export function centralUniforms(engine, camRot, tanHalf, out = new Float32Array(44)) {
  const c = engine.central;
  out.fill(0);
  if (camRot) out.set(camRot, 0);
  if (!c) return out;
  out.set([c.dir.x, c.dir.y, c.dir.z, c.distance], 16);
  out.set([c.spin.x, c.spin.y, c.spin.z, c.reach], 20);
  out.set([c.isco || 6, c.disk.outer, c.disk.brightness, c.disk.temperature], 24);
  out.set([c.jet.length, c.jet.angle, c.jet.brightness, c.jet.gamma], 28);
  out.set([engine.bgMat?.uniforms.uSkyGain?.value || 1, tanHalf ? tanHalf.x : 1, tanHalf ? tanHalf.y : 1, 1], 32);
  out.set([c.jet.knots, c.spinA || 0, c.isco || 6, 0], 36);
  return out;
}

export class CentralPass {
  constructor(device, background) { this.device = device; this.background = background; this.buffers = new Map(); this.data = new Float32Array(44); }
  async init() {
    const module = await shaderModule(this.device, 'central black hole', CODE);
    const blend = { color: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' }, alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' } };
    this.pipeline = await this.device.createRenderPipelineAsync({ label: 'central black hole', layout: 'auto',
      vertex: { module, entryPoint: 'fullscreen' }, fragment: { module, entryPoint: 'central', targets: [{ format: 'rgba16float', blend }] } });
  }
  // over the sky already drawn into target (an air ping/pong entry), where the depth says it's sky
  render(engine, t, target) {
    const source = engine.frameInputs?.sky?.cubeRT.texture;
    if (!this.pipeline || !engine.central || !source) return;
    const cube = this.background.cube(source);
    const camera = engine.view.camera, m = camera.matrixWorld.elements;
    // (the camera's rotation, as a mat4 with the 3x3 in its top left)
    const rot = [m[0], m[1], m[2], 0, m[4], m[5], m[6], 0, m[8], m[9], m[10], 0, 0, 0, 0, 1];
    let buffer = this.buffers.get(t);
    if (!buffer) { buffer = this.device.createBuffer({ label: 'central black hole', size: 44 * 4, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST }); this.buffers.set(t, buffer); }
    this.device.queue.writeBuffer(buffer, 0, centralUniforms(engine, rot, engine.tanHalf, this.data));
    const group = this.device.createBindGroup({ layout: this.pipeline.getBindGroupLayout(0), entries: [
      { binding: 0, resource: { buffer } }, { binding: 1, resource: t.sampledDepth.view }, { binding: 2, resource: cube.view }, { binding: 3, resource: cube.sampler }] });
    const encoder = this.device.createCommandEncoder({ label: 'central black hole' });
    const pass = encoder.beginRenderPass({ colorAttachments: [{ view: target.view, loadOp: 'load', storeOp: 'store' }] });
    pass.setPipeline(this.pipeline); pass.setBindGroup(0, group); pass.draw(3); pass.end();
    this.device.queue.submit([encoder.finish()]);
  }
  release(t) { this.buffers.get(t)?.destroy(); this.buffers.delete(t); }
  dispose() { for (const b of this.buffers.values()) b.destroy(); this.buffers.clear(); }
}
