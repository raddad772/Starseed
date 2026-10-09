// A rocky world's rings (gen/rings.js: a moon torn apart), drawn per pixel in the air pass: from
// space, from the ground through the air, and from inside them. The ring is a slab round the
// planet's equator, its optical depth across it (the profile, gen/rings.js ringTau) thin and wide.
// Far from its plane, each view ray meets it at a point: what's seen is its single-scattered light
// (Chandrasekhar's for a layer: lit side reflected, the far side light come through), its large
// particles scattering back toward the sun like the Moon (a Lambert sphere's phase), its dust share
// forward (Henyey-Greenstein, g 0.75: bright when it's between you and the sun), and how much it
// covers what's behind, 1 - exp(-tau / mu). Near or in it, the slab is marched along the ray
// (steps growing from the camera): its haze round you, the sun's light reaching each point through
// the slab above it, the plane far off a bright band at the horizon. The planet's shadow falls
// across it (soft over the sun's width), the planet and anything nearer hide it (the scene's depth).
// Drawn twice, either side of the atmospheres: where the ray goes into the planet's air before it
// meets the ring (from the ground, or past the limb), before them, so the air dims and hazes it;
// where it meets the ring first (from space, the ring in front of the planet), after them.
import { FULLSCREEN } from './shaders.js';
import { shaderModule } from './device.js';
import { ringSamples, RING_SAMPLES } from '../../gen/rings.js';

const WGSL = FULLSCREEN + /* wgsl */`
struct Ring {
  camRot: mat4x4f,   // view direction -> world (the 3x3 in the top left)
  center: vec4f,     // xyz: the planet's centre from the camera (world axes); w: its radius
  normal: vec4f,     // xyz: the ring's normal (the planet's axis); w: the top of its air (0: none)
  shape: vec4f,      // x: inner radius, y: outer, z: thickness, w: 1 / (outer - inner)
  sun: vec4f,        // xyz: toward the sun; w: the sun's angular radius
  sunE: vec4f,       // rgb: the sunlight there; w: which side of the atmospheres (0: before, 1: after)
  color: vec4f,      // rgb: its particles' albedo; w: its dust share
  view: vec4f,       // x, y: tan half fov across and up; z: near; w: far
  misc: vec4f,       // x, y: the view's size (px); z: profile samples
  axis: vec4f,       // xyz: an axis in its plane (its azimuths from it)
};
@group(0) @binding(0) var<uniform> R: Ring;
@group(0) @binding(1) var sceneDepth: texture_2d<f32>;
@group(0) @binding(2) var profile: texture_2d<f32>;

const PI = 3.14159265;
// the normal optical depth at radius r (linear between the profile's samples)
fn tauAt(r: f32) -> f32 {
  let x = (r - R.shape.x) * R.shape.w;
  if (x <= 0.0 || x >= 1.0) { return 0.0; }
  let n = i32(R.misc.z);
  let f = x * R.misc.z - 0.5;
  let i = i32(floor(f));
  let w = f - floor(f);
  let a = textureLoad(profile, vec2i(clamp(i, 0, n - 1), 0), 0).r;
  let b = textureLoad(profile, vec2i(clamp(i + 1, 0, n - 1), 0), 0).r;
  return mix(a, b, w);
}
// its fine structure near to, at p (from the planet's centre), where a pixel covers foot metres of it
// (faded out where it's finer than that): ringlets of tens of metres, and the clumps a dense ring's
// particles pull into, sheared by the orbits into wakes trailing ~22 degrees off the orbit's line,
// tens of metres across and a few times as long. Jitter, as gen/rings.js's ringlets are; a factor
// on the optical depth.
fn hashU(n: u32) -> u32 { var x = n; x ^= x >> 16u; x *= 0x7feb352du; x ^= x >> 15u; x *= 0x846ca68bu; x ^= x >> 16u; return x; }
fn h1(i: i32, k: u32) -> f32 { return f32(hashU(bitcast<u32>(i) ^ k) & 0xffffffu) / 16777216.0; }
fn n1(x: f32, k: u32) -> f32 { let i = i32(floor(x)); let f = x - floor(x); let u = f * f * (3.0 - 2.0 * f); return mix(h1(i, k), h1(i + 1, k), u); }
fn h2(i: i32, j: i32, k: u32) -> f32 { return f32(hashU((bitcast<u32>(i) * 73856093u) ^ (bitcast<u32>(j) * 19349663u) ^ k) & 0xffffffu) / 16777216.0; }
fn n2(x: f32, y: f32, k: u32) -> f32 {
  let i = i32(floor(x)); let j = i32(floor(y)); let fx = x - floor(x); let fy = y - floor(y);
  let ux = fx * fx * (3.0 - 2.0 * fx); let uy = fy * fy * (3.0 - 2.0 * fy);
  return mix(mix(h2(i, j, k), h2(i + 1, j, k), ux), mix(h2(i, j + 1, k), h2(i + 1, j + 1, k), ux), uy);
}
fn fine(p: vec3f, foot: f32) -> f32 {
  let n = R.normal.xyz; let u = R.axis.xyz; let w = cross(n, u);
  let q = p - n * dot(p, n); let r = length(q); let s = atan2(dot(q, w), dot(q, u)) * r;
  var f = 0.0;
  f += clamp(1.0 - foot / 30.0, 0.0, 1.0) * 0.6 * (n1(r / 60.0, 11u) - 0.5);
  f += clamp(1.0 - foot / 8.0, 0.0, 1.0) * 0.4 * (n1(r / 15.0, 23u) - 0.5);
  f += clamp(1.0 - foot / 15.0, 0.0, 1.0) * 0.9 * (n2((0.927 * r + 0.375 * s) / 30.0, (-0.375 * r + 0.927 * s) / 150.0, 37u) - 0.5);
  return exp(f);
}
// the planet between p (from its centre) and the sun: its shadow, soft over the sun's width
fn sunlit(p: vec3f) -> f32 {
  let L = R.sun.xyz;
  let tc = -dot(p, L);
  if (tc <= 0.0) { return 1.0; }
  let d = sqrt(max(dot(p, p) - tc * tc, 0.0));
  let pen = max(tc * R.sun.w, 1.0);
  return smoothstep(R.center.w - pen, R.center.w + pen, d);
}
// what a particle sends toward the viewer of the sun's light (v: the view ray; the big particles'
// Lambert-sphere phase, 1 at full phase; the dust's Henyey-Greenstein, its mean 1)
fn phase(v: vec3f) -> f32 {
  let ca = clamp(dot(R.sun.xyz, -v), -1.0, 1.0);
  let a = acos(ca);
  let big = (sin(a) + (PI - a) * ca) / PI;
  let g = 0.75;
  let cs = dot(R.sun.xyz, v);
  let hg = (1.0 - g * g) / pow(1.0 + g * g - 2.0 * g * cs, 1.5);
  return mix(big, hg, R.color.w);
}

@fragment fn ring(f: Fullscreen) -> @location(0) vec4f {
  let ndc = vec2f(f.uv.x * 2.0 - 1.0, 1.0 - f.uv.y * 2.0);
  let local = vec3f(ndc.x * R.view.x, ndc.y * R.view.y, -1.0);
  let v = normalize((R.camRot * vec4f(local, 0.0)).xyz);
  let c = R.center.xyz;
  let n = R.normal.xyz;
  let H = R.shape.z;
  // (how far the ray goes: to the scene's surface, reversed-Z depth back to distance; and the planet)
  let z = textureLoad(sceneDepth, vec2i(f.position.xy), 0).r;
  var tMax = select(R.view.w, R.view.z * R.view.w / (z * (R.view.w - R.view.z) + R.view.z), z > 0.0) * length(local);
  let tc = dot(c, v);
  let d2 = dot(c, c) - tc * tc;
  let Rp = R.center.w;
  if (d2 < Rp * Rp && tc > 0.0) { tMax = min(tMax, tc - sqrt(Rp * Rp - d2)); }
  // the slab: |y| < H/2, y the height above the ring's plane, the camera's h
  let h = -dot(c, n);
  let vn = dot(v, n);
  var t0 = 0.0; var t1 = tMax;
  if (abs(vn) < 1e-7) { if (abs(h) >= 0.5 * H) { discard; } }
  else {
    let ta = (0.5 * H - h) / vn;
    let tb = (-0.5 * H - h) / vn;
    t0 = max(t0, min(ta, tb)); t1 = min(t1, max(ta, tb));
  }
  if (t1 <= t0) { discard; }
  // (which side of the atmospheres it's drawn: through the planet's air first, before them)
  let top = R.normal.w;
  var behind = false;
  if (top > 0.0) {
    if (dot(c, c) < top * top) { behind = true; }
    else if (d2 < top * top && tc > 0.0 && tc - sqrt(top * top - d2) < t0) { behind = true; }
  }
  if (behind != (R.sunE.w < 0.5)) { discard; }
  let E = R.sunE.rgb;
  let A = R.color.rgb;
  let L = R.sun.xyz;
  let mu0 = max(abs(dot(L, n)), 0.02);
  let P = phase(v);
  let pix = 2.0 * R.view.y / R.misc.y;   // (radians a pixel)
  if (abs(h) > 3.0 * H) {
    // (far from its plane: where the ray crosses it)
    let t = -h / vn;
    if (t <= 0.0 || t > tMax) { discard; }
    let p = v * t - c;
    let r = length(p);
    let mu = max(abs(vn), 0.02);
    let tau = tauAt(r) * fine(p, t * pix / mu);
    if (tau < 1e-4) { discard; }
    let lit = dot(L, n) * (-vn) > 0.0;
    var k: f32;
    if (lit) { k = mu0 / (mu0 + mu) * (1.0 - exp(-tau * (1.0 / mu + 1.0 / mu0))); }
    else if (abs(mu0 - mu) < 1e-3) { k = tau / mu0 * exp(-tau / mu0); }
    else { k = mu0 / (mu0 - mu) * (exp(-tau / mu0) - exp(-tau / mu)); }
    let alpha = 1.0 - exp(-tau / mu);
    let col = 2.0 * A * E / PI * P * k * sunlit(p);
    return vec4f(col, alpha);
  }
  // (near it or in it: the slab marched, steps growing from where the ray enters it)
  let span = min(t1 - t0, 4.0e5);
  var T = 1.0; var col = vec3f(0.0);
  let N = 40;
  var prev = 0.0;
  for (var k = 1; k <= N; k++) {
    let s = span * pow(f32(k) / f32(N), 2.6);
    let ds = s - prev;
    let tm = t0 + 0.5 * (s + prev);
    prev = s;
    let p = v * tm - c;
    let y = dot(p, n);
    let r = length(p - n * y);
    let kap = tauAt(r) * fine(p, tm * pix) / H;
    if (kap <= 0.0) { continue; }
    // (the sun's light at p: through the slab above it, toward the sun)
    let up = select(0.5 * H + y, 0.5 * H - y, dot(L, n) > 0.0);
    let Ts = exp(-kap * max(up, 0.0) / mu0) * sunlit(p);
    let a = 1.0 - exp(-kap * ds);
    col += T * a * 2.0 * A * E / PI * P * Ts;
    T *= 1.0 - a;
    if (T < 0.003) { break; }
  }
  if (T > 0.999) { discard; }
  return vec4f(col, 1.0 - T);
}
`;

const FLOATS = 16 + 9 * 4;

export class RingPass {
  constructor(device) { this.device = device; this.buffers = new Map(); this.profiles = new WeakMap(); this.data = new Float32Array(FLOATS); }
  // (in its own error scope: a fault in it turns the rings off, never the renderer)
  async init() {
    this.device.pushErrorScope('validation');
    try { await this.build(); }
    finally { const e = await this.device.popErrorScope(); if (e) { this.pipeline = null; throw new Error(e.message); } }
  }
  async build() {
    const module = await shaderModule(this.device, 'rings', WGSL);
    this.pipeline = await this.device.createRenderPipelineAsync({ label: 'rings', layout: 'auto',
      vertex: { module, entryPoint: 'fullscreen' },
      fragment: { module, entryPoint: 'ring', targets: [{ format: 'rgba16float', blend: {
        color: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha' }, alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha' } } }] } });
  }
  // (a ring's optical depth across it, a texture)
  profile(rings) {
    let p = this.profiles.get(rings);
    if (!p) {
      const texture = this.device.createTexture({ label: 'ring profile', size: [RING_SAMPLES, 1], format: 'r32float', usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST });
      this.device.queue.writeTexture({ texture }, ringSamples(rings), { bytesPerRow: RING_SAMPLES * 4 }, [RING_SAMPLES, 1]);
      p = { texture, view: texture.createView() }; this.profiles.set(rings, p);
    }
    return p;
  }
  // into target (an air ping/pong entry), blended over it: mode 0 before the atmospheres, 1 after
  render(engine, t, target, mode) {
    const list = engine.ringBodies;
    if (!this.pipeline || !list?.length) return;
    const camera = engine.view.camera, m = camera.matrixWorld.elements, inv = camera.matrixWorldInverse.elements;
    const rot = [m[0], m[1], m[2], 0, m[4], m[5], m[6], 0, m[8], m[9], m[10], 0, 0, 0, 0, 1];
    const tan = engine.tanHalf;
    let buffers = this.buffers.get(t);
    if (!buffers) { buffers = []; this.buffers.set(t, buffers); }
    const encoder = this.device.createCommandEncoder({ label: 'rings' });
    list.forEach((rb, i) => {
      const scissor = this.scissor(rb, inv, tan, camera.near, t);
      if (!scissor) return;
      const R = rb.rings, d = this.data;
      d.fill(0); d.set(rot, 0);
      d.set([rb.center.x, rb.center.y, rb.center.z, rb.radius], 16);
      d.set([rb.normal.x, rb.normal.y, rb.normal.z, rb.top], 20);
      d.set([R.inner, R.outer, R.thickness, 1 / (R.outer - R.inner)], 24);
      d.set([rb.sunDir.x, rb.sunDir.y, rb.sunDir.z, rb.sunRadius], 28);
      d.set([rb.sunE.x, rb.sunE.y, rb.sunE.z, mode], 32);
      d.set([R.color[0], R.color[1], R.color[2], R.dust ?? (R.tau0 < 0.2 ? 0.35 : 0.12)], 36);
      d.set([tan.x, tan.y, camera.near, camera.far], 40);
      d.set([t.width, t.height, RING_SAMPLES, 0], 44);
      d.set([rb.axis.x, rb.axis.y, rb.axis.z, 0], 48);
      if (!buffers[i]) buffers[i] = this.device.createBuffer({ label: 'rings', size: FLOATS * 4, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
      // (each draw's own buffer: written now, before this frame's submit reads them)
      const buffer = mode ? (buffers[i + 64] ||= this.device.createBuffer({ label: 'rings', size: FLOATS * 4, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST })) : buffers[i];
      this.device.queue.writeBuffer(buffer, 0, d);
      const group = this.device.createBindGroup({ layout: this.pipeline.getBindGroupLayout(0), entries: [
        { binding: 0, resource: { buffer } }, { binding: 1, resource: t.sampledDepth.view }, { binding: 2, resource: this.profile(R).view }] });
      const pass = encoder.beginRenderPass({ colorAttachments: [{ view: target.view, loadOp: 'load', storeOp: 'store' }] });
      pass.setPipeline(this.pipeline); pass.setBindGroup(0, group); pass.setScissorRect(...scissor); pass.draw(3); pass.end();
    });
    this.device.queue.submit([encoder.finish()]);
  }
  // the pixels the ring could cover: its bounding box's corners projected; all of them where the
  // camera's in the box or a corner's behind it
  scissor(rb, inv, tan, near, t) {
    const R = rb.rings, n = rb.normal, c = rb.center;
    // (two axes in its plane)
    const ax = Math.abs(n.x) < 0.9 ? [0, -n.z, n.y] : [n.z, 0, -n.x], al = Math.hypot(...ax), u = ax.map((x) => x / al);
    const w = [n.y * u[2] - n.z * u[1], n.z * u[0] - n.x * u[2], n.x * u[1] - n.y * u[0]];
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const a of [-1, 1]) for (const b of [-1, 1]) for (const e of [-1, 1]) {
      const px = c.x + R.outer * (a * u[0] + b * w[0]) + e * R.thickness * n.x;
      const py = c.y + R.outer * (a * u[1] + b * w[1]) + e * R.thickness * n.y;
      const pz = c.z + R.outer * (a * u[2] + b * w[2]) + e * R.thickness * n.z;
      // (into the camera's frame: its rotation's inverse)
      const vx = inv[0] * px + inv[4] * py + inv[8] * pz, vy = inv[1] * px + inv[5] * py + inv[9] * pz, vz = inv[2] * px + inv[6] * py + inv[10] * pz;
      if (vz > -near) return [0, 0, t.width, t.height];
      const sx = (vx / -vz / tan.x * 0.5 + 0.5) * t.width, sy = (0.5 - vy / -vz / tan.y * 0.5) * t.height;
      x0 = Math.min(x0, sx); x1 = Math.max(x1, sx); y0 = Math.min(y0, sy); y1 = Math.max(y1, sy);
    }
    const X0 = Math.max(0, Math.floor(x0)), Y0 = Math.max(0, Math.floor(y0)), X1 = Math.min(t.width, Math.ceil(x1)), Y1 = Math.min(t.height, Math.ceil(y1));
    if (X1 - X0 < 1 || Y1 - Y0 < 1) return null;
    return [X0, Y0, X1 - X0, Y1 - Y0];
  }
  release(t) { for (const b of this.buffers.get(t) || []) b?.destroy(); this.buffers.delete(t); }
  dispose() { for (const list of this.buffers.values()) for (const b of list) b?.destroy(); this.buffers.clear(); }
}
