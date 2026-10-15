import { SCANNED_MATERIALS, SEASONS, GROUND } from './materials.js';
import { code as PHYSICAL_LIGHTING } from './generated/lighting.js';

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
  originMod: vec4f,
  originRel: vec4f,
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

export const TERRAIN = FRAME + SCANNED_MATERIALS + SEASONS + GROUND + /* wgsl */`
struct Vertex {
  positionOcc: vec4f, morph: vec4f, normalShore: vec4f, morphNormal: vec4f,
  color: vec4f, morphColor: vec4f, ext: vec4f, mat: vec4f, cls0: vec4f, cls1: vec4f, cls2: vec4f,
};
@group(1) @binding(0) var<storage, read> vertices: array<Vertex>;
struct Varying {
  @builtin(position) position: vec4f,
  @location(0) worldPos: vec3f,
  @location(1) color: vec4f,
  @location(2) nearRel: vec3f,
  @location(3) occShore: vec2f,
  @location(4) ext: vec4f,
  @location(5) @interpolate(flat) objectIndex: u32,
  @location(6) fixedPos: vec3f,
  @location(7) fixedNormal: vec3f,
  @location(8) mat: vec4f,
  @location(9) cls0: vec4f,
  @location(10) cls1: vec4f,
  @location(11) cls2: vec4f,
  @location(12) anchorPos: vec3f,
};
@vertex fn vertexMain(@builtin(vertex_index) vi: u32, @location(0) oi: u32) -> Varying {
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
  out.worldPos = (o.model * vec4f(p, 1.0)).xyz;
  out.position = frame.viewProjection * vec4f(out.worldPos, 1.0);
  out.fixedNormal = normalize(mix(v.normalShore.xyz, v.morphNormal.xyz, m));
  out.fixedPos = o.originMod.xyz + p; out.anchorPos = o.originRel.xyz + p;
  out.mat = v.mat; out.cls0 = v.cls0; out.cls1 = v.cls1; out.cls2 = v.cls2;
  out.color = mix(v.color, v.morphColor, m);
  out.nearRel = o.nearOffMorphEnd.xyz + p;
  out.occShore = vec2f(v.positionOcc.w, mix(v.normalShore.w, v.morphNormal.w, m));
  out.ext = v.ext; out.objectIndex = oi;
  return out;
}
// Same planet-fixed 4.5 mm grain cells and footprint filter as the land material.
fn grainGlint(p:vec3f,N:vec3f,H:vec3f,rare:f32)->f32 {
  let c=vec3u(vec3i(floor(p*220.0))+vec3i(1048576));
  var h=(c.x*1597334677u)^(c.y*3812015801u)^(c.z*2798796415u);
  h=h*747796405u+2891336453u;h^=h>>16u;h*=2246822519u;h^=h>>13u;
  if(f32(h>>22u)/1023.0<rare){return 0.0;}
  let rv=vec3f(f32(h&1023u),f32((h>>10u)&1023u),f32((h>>3u)&1023u))/1023.0-vec3f(0.5);
  return pow(max(dot(normalize(N+rv*0.8),H),0.0),3000.0);
}
struct GBuffer { @location(0) albedoAO: vec4f, @location(1) normalMaterial: vec4f, @location(2) emission: vec4f, @location(3) surface: vec4f };
@fragment fn fragmentMain(v: Varying) -> GBuffer {
  let o = objects[v.objectIndex];
  let dx = dpdx(v.fixedPos); let dy = dpdy(v.fixedPos);
  let foot = length(fwidth(v.worldPos));
  // (how far the land is from the water, m, near it: the vertices' shore distance over its own rate across
  // the ground (chunkbuilder.js: SHORE_R spacings, held beyond); the swash's reach, materials.js)
  let dS = vec2f(dpdx(v.occShore.y), dpdy(v.occShore.y));
  let a11 = dot(dx, dx); let a12 = dot(dx, dy); let a22 = dot(dy, dy);
  let gS = ((a22 * dS.x - a12 * dS.y) * dx + (a11 * dS.y - a12 * dS.x) * dy) / max(a11 * a22 - a12 * a12, 1e-12);
  let shoreM = select(1e6, -v.occShore.y / max(length(gS), 1e-6), v.occShore.y > -0.99);
  if (o.nearUpEnabled.w > 0.5) {
    let dn = length(v.nearRel - o.nearUpEnabled.xyz * dot(v.nearRel, o.nearUpEnabled.xyz));
    if (o.nearBand.y < 0.5) { if (dn < 0.97 * o.nearBand.x && v.occShore.y <= 0.0) { discard; } }
    else if (dn < o.nearBand.z || dn > o.nearBand.w) { discard; }
  }
  let b = bodies[u32(o.surface.x)];
  let rel = v.worldPos - b.center.xyz;
  let up = normalize(rel);
  // (from afar its colour and where its water is the colour map's, finer there than the far chunks'
  // vertices: render/colourCube.js, as terrainMaterial.js)
  var color = v.color; var shore = v.occShore.y;
  let cK = material.colourCube.x * smoothstep(30.0 * material.colourCube.z, 60.0 * material.colourCube.z, length(v.worldPos));
  if (cK > 0.0) {
    let cc = colourCubeAt(normalize(material.toFixed * up));
    color = vec4f(mix(color.rgb, cc.rgb, cK), color.a);
    shore = mix(shore, clamp((cc.a * 255.0 - 128.0) / 127.0 * material.colourCube.w / 4.0, -1.0, 1.0), cK);
  }
  if (shore > 0.0) { discard; }
  let surface = groundSurface(color, v.mat, v.ext, v.cls0, v.cls1, v.cls2,
    v.fixedPos, v.anchorPos, dx, dy, normalize(v.fixedNormal), material.toFixed * up,
    length(v.worldPos), foot, dot(up, b.sunDir.xyz), shore, length(rel) - material.surf.z, shoreM);
  let N=normalize(transpose(material.toFixed)*surface.normal);
  var glint=0.0;
  let gw=v.cls2.z+0.6*v.cls1.z;let gc=foot*220.0;
  if(material.windTimeMode.w>0.5&&gw>0.05&&gc<3.0&&dot(up,b.sunDir.xyz)>0.0){
    let H=normalize(normalize(-v.worldPos)+b.sunDir.xyz);
    let g=grainGlint(v.fixedPos,N,H,mix(0.9,0.97,v.cls1.z/max(gw,0.001)));
    glint=min(g*25.0/max(1.0,gc*gc),3.0)*gw*(1.0-smoothstep(1.5,3.0,gc));
  }
  var out: GBuffer;
  out.albedoAO = vec4f(clamp(surface.albedo, vec3f(0.0), vec3f(1.0)), surface.ao);
  out.normalMaterial = vec4f(octEncode(N), surface.roughness, o.surface.x * 16.0);
  // Separate cave occlusion from scan AO: the former attenuates both sun and sky.
  out.emission = vec4f(surface.emission, 1.0 - 0.94 * clamp(v.occShore.x, 0.0, 1.0));
  // Terrain has no translucency; this channel holds the bounded glint coefficient.
  out.surface = vec4f(glint/3.0, v.ext.y, 0.0, 0.04 - 0.02 * v.cls2.w);
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

export const LIGHTING = FRAME + FULLSCREEN + PHYSICAL_LIGHTING + /* wgsl */`
@group(1) @binding(0) var albedoAO: texture_2d<f32>;
@group(1) @binding(1) var normalMaterial: texture_2d<f32>;
@group(1) @binding(2) var emission: texture_2d<f32>;
@group(1) @binding(3) var depth: texture_depth_2d;
@group(1) @binding(4) var surface: texture_2d<f32>;
@group(1) @binding(5) var indirectVisibility: texture_2d<f32>;
@fragment fn light(v: Fullscreen) -> @location(0) vec4f {
  let pixel = vec2i(v.position.xy);
  let z = textureLoad(depth, pixel, 0);
  if (z == 0.0) { discard; }
  let a = textureLoad(albedoAO, pixel, 0);

  let m = textureLoad(normalMaterial, pixel, 0);
  if (u32(m.w / 16.0) != u32(global.uBodyIndex)) { discard; }
  if (frame.sizeExposure.w > 0.5) { return vec4f(a.rgb, 1.0); }
  let n = octDecode(m.xy);
  let ndc = vec4f(v.uv * vec2f(2.0, -2.0) + vec2f(-1.0, 1.0), z, 1.0);
  let hp = frame.inverseViewProjection * ndc;
  let p = hp.xyz / hp.w;
  let e = textureLoad(emission, pixel, 0);
  let s = textureLoad(surface, pixel, 0);
  // Reconstruct a neighboring point at this depth for a conservative pixel footprint.
  let nx = frame.inverseViewProjection * (ndc + vec4f(2.0 / frame.sizeExposure.x, 0.0, 0.0, 0.0));
  let ny = frame.inverseViewProjection * (ndc + vec4f(0.0, 2.0 / frame.sizeExposure.y, 0.0, 0.0));
  let foot = length(abs(nx.xyz / nx.w - p) + abs(ny.xyz / ny.w - p));
  let kind = u32(m.w) % 16u;
  let selfShaded = kind == 3u || kind == 7u;
  let lit = deferredLight(p, n, a.rgb, m.z, a.a, s.y, s.w, select(e.a, 1.0, selfShaded), s.x, foot, s.z, f32(kind), select(1.0, max(0.0, -e.a), selfShaded), textureLoad(indirectVisibility,pixel,0).r) + e.rgb;
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
