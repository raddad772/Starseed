export const FRAME = /* wgsl */`
struct Frame {
  viewProjection: mat4x4f,
  inverseViewProjection: mat4x4f,
  sizeExposure: vec4f,
};
struct Object {
  model: mat4x4f,
  camMorphStart: vec4f,
  nearOffMorphEnd: vec4f,
  nearUpEnabled: vec4f,
  nearBand: vec4f,
  surface: vec4f,
};
struct BodyLight { sunDir: vec4f, sunE: vec4f, ambient: vec4f, center: vec4f };
@group(0) @binding(0) var<uniform> frame: Frame;
@group(0) @binding(1) var<storage, read> objects: array<Object>;
@group(0) @binding(2) var<storage, read> bodies: array<BodyLight>;
fn octEncode(n: vec3f) -> vec2f {
  let p = n / (abs(n.x) + abs(n.y) + abs(n.z));
  return select(p.xy, (1.0 - abs(p.yx)) * select(vec2f(-1.0), vec2f(1.0), p.xy >= vec2f(0.0)), p.z < 0.0);
}
fn octDecode(e: vec2f) -> vec3f {
  var n = vec3f(e, 1.0 - abs(e.x) - abs(e.y));
  let t = max(-n.z, 0.0);
  n.x += select(t, -t, n.x >= 0.0); n.y += select(t, -t, n.y >= 0.0);
  return normalize(n);
}
`;

export const TERRAIN = FRAME + /* wgsl */`
struct Vertex {
  positionOcc: vec4f, morph: vec4f, normalShore: vec4f, morphNormal: vec4f,
  color: vec4f, morphColor: vec4f, ext: vec4f,
};
@group(1) @binding(0) var<storage, read> vertices: array<Vertex>;
struct Varying {
  @builtin(position) position: vec4f,
  @location(0) normal: vec3f,
  @location(1) color: vec4f,
  @location(2) nearRel: vec3f,
  @location(3) occShore: vec2f,
  @location(4) ext: vec4f,
  @location(5) @interpolate(flat) objectIndex: u32,
};
@vertex fn vertexMain(@builtin(vertex_index) vi: u32, @builtin(instance_index) oi: u32) -> Varying {
  let v = vertices[vi]; let o = objects[oi];
  let d = distance(v.morph.xyz, o.camMorphStart.xyz);
  let m = clamp((d - o.camMorphStart.w) / max(o.nearOffMorphEnd.w - o.camMorphStart.w, 0.001), 0.0, 1.0);
  var p = mix(v.positionOcc.xyz, v.morph.xyz, m);
  if (o.nearUpEnabled.w > 0.5 && o.nearBand.y < 0.5) {
    let rel = o.nearOffMorphEnd.xyz + p;
    let dn = length(rel - o.nearUpEnabled.xyz * dot(rel, o.nearUpEnabled.xyz));
    p -= o.nearUpEnabled.xyz * (0.4 * (1.0 - smoothstep(0.97 * o.nearBand.x, o.nearBand.x, dn)));
  }
  var out: Varying;
  out.position = frame.viewProjection * o.model * vec4f(p, 1.0);
  out.normal = normalize((o.model * vec4f(normalize(mix(v.normalShore.xyz, v.morphNormal.xyz, m)), 0.0)).xyz);
  out.color = mix(v.color, v.morphColor, m);
  out.nearRel = o.nearOffMorphEnd.xyz + p;
  out.occShore = vec2f(v.positionOcc.w, mix(v.normalShore.w, v.morphNormal.w, m));
  out.ext = v.ext; out.objectIndex = oi;
  return out;
}
struct GBuffer { @location(0) albedoAO: vec4f, @location(1) normalMaterial: vec4f, @location(2) emission: vec4f };
@fragment fn fragmentMain(v: Varying) -> GBuffer {
  let o = objects[v.objectIndex];
  if (o.nearUpEnabled.w > 0.5) {
    let dn = length(v.nearRel - o.nearUpEnabled.xyz * dot(v.nearRel, o.nearUpEnabled.xyz));
    if (o.nearBand.y < 0.5) { if (dn < 0.97 * o.nearBand.x && v.occShore.y <= 0.0) { discard; } }
    else if (dn < o.nearBand.z || dn > o.nearBand.w) { discard; }
  }
  var out: GBuffer;
  out.albedoAO = vec4f(v.color.rgb * v.color.rgb, 1.0 - clamp(v.occShore.x, 0.0, 1.0));
  out.normalMaterial = vec4f(octEncode(normalize(v.normal)), v.ext.z, o.surface.x);
  out.emission = vec4f(0.0);
  return out;
}
`;

export const FULLSCREEN = /* wgsl */`
struct Fullscreen { @builtin(position) position: vec4f, @location(0) uv: vec2f };
@vertex fn fullscreen(@builtin(vertex_index) i: u32) -> Fullscreen {
  let p = vec2f(f32((i << 1u) & 2u), f32(i & 2u));
  var out: Fullscreen; out.position = vec4f(p * 2.0 - 1.0, 0.0, 1.0); out.uv = vec2f(p.x, 1.0 - p.y);
  return out;
}
`;

export const LIGHTING = FRAME + FULLSCREEN + /* wgsl */`
@group(1) @binding(0) var albedoAO: texture_2d<f32>;
@group(1) @binding(1) var normalMaterial: texture_2d<f32>;
@group(1) @binding(2) var emission: texture_2d<f32>;
@group(1) @binding(3) var depth: texture_depth_2d;
@fragment fn light(v: Fullscreen) -> @location(0) vec4f {
  let pixel = vec2i(v.position.xy);
  let z = textureLoad(depth, pixel, 0);
  if (z == 0.0) { return vec4f(0.0, 0.0, 0.0, 1.0); }
  let a = textureLoad(albedoAO, pixel, 0);
  if (frame.sizeExposure.w > 0.5) { return vec4f(a.rgb, 1.0); }
  let m = textureLoad(normalMaterial, pixel, 0);
  let b = bodies[u32(m.w)]; let n = octDecode(m.xy);
  let ndc = vec4f(v.uv * vec2f(2.0, -2.0) + vec2f(-1.0, 1.0), z, 1.0);
  let hp = frame.inverseViewProjection * ndc;
  let p = hp.xyz / hp.w;
  let up = normalize(p - b.center.xyz);
  let sky = 0.15 * (0.3 + 0.7 * max(dot(n, up), 0.0));
  let irradiance = b.sunE.xyz * (max(dot(n, b.sunDir.xyz), 0.0) + sky * a.a) + b.ambient.xyz * a.a;
  let lit = a.rgb * irradiance / 3.14159265 + textureLoad(emission, pixel, 0).rgb;
  return vec4f(lit, 1.0);
}
`;

export const POST = FRAME + FULLSCREEN + /* wgsl */`
@group(1) @binding(0) var hdr: texture_2d<f32>;
fn srgb(c: vec3f) -> vec3f { return select(1.055 * pow(c, vec3f(1.0 / 2.4)) - 0.055, c * 12.92, c <= vec3f(0.0031308)); }
@fragment fn post(v: Fullscreen) -> @location(0) vec4f {
  let c = max(textureLoad(hdr, vec2i(v.position.xy), 0).rgb * frame.sizeExposure.z, vec3f(0.0));
  let mapped = clamp((c * (2.51 * c + 0.03)) / (c * (2.43 * c + 0.59) + 0.14), vec3f(0.0), vec3f(1.0));
  return vec4f(srgb(mapped), 1.0);
}
`;
