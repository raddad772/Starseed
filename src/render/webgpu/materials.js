import { FROST_NL, FROST_TILTS } from '../../gen/frostcap.js';

// Scanned surface sampling, shared by terrain, rocks and bark. Explicit gradients
// are taken by callers before material-dependent branches or alpha rejection.
export const SCANNED_MATERIALS = /* wgsl */`
@group(2) @binding(0) var detailTexture: texture_2d<f32>;
@group(2) @binding(1) var repeatSampler: sampler;
@group(2) @binding(2) var materialAlbedo: texture_2d_array<f32>;
@group(2) @binding(3) var materialNormal: texture_2d_array<f32>;
@group(2) @binding(4) var seasonTexture: texture_2d<f32>;
@group(2) @binding(5) var frostTexture: texture_2d<f32>;
@group(2) @binding(6) var climateSampler: sampler;
struct MaterialParams {
  toFixed: mat3x3f,
  season: vec4f,
  frost: vec4f,
  snowColor: vec4f,
  soilColor: vec4f,
  lavaColor: vec4f,
  windTimeMode: vec4f,
  colourCube: vec4f,
  surf: vec4f,
};
@group(2) @binding(7) var<uniform> material: MaterialParams;
// the ground's colour and its shore from afar (render/colourCube.js): rgb the colour's square root, a the
// shore's distance (0.5 at the shore, more under the water); colourCube x on, y its size, z a texel (m)
@group(2) @binding(8) var colourCubeTex: texture_2d_array<f32>;
fn colourCubeAt(d: vec3f) -> vec4f {
  let a = abs(d);
  var f = 0; var N = vec3f(1.0, 0.0, 0.0); var U = vec3f(0.0, 0.0, -1.0); var V = vec3f(0.0, 1.0, 0.0);
  if (a.x >= a.y && a.x >= a.z) { if (d.x < 0.0) { f = 1; N = vec3f(-1.0, 0.0, 0.0); U = vec3f(0.0, 0.0, 1.0); } }
  else if (a.y >= a.z) {
    U = vec3f(1.0, 0.0, 0.0);
    if (d.y >= 0.0) { f = 2; N = vec3f(0.0, 1.0, 0.0); V = vec3f(0.0, 0.0, -1.0); } else { f = 3; N = vec3f(0.0, -1.0, 0.0); V = vec3f(0.0, 0.0, 1.0); }
  } else {
    if (d.z >= 0.0) { f = 4; N = vec3f(0.0, 0.0, 1.0); U = vec3f(1.0, 0.0, 0.0); } else { f = 5; N = vec3f(0.0, 0.0, -1.0); U = vec3f(-1.0, 0.0, 0.0); }
  }
  let dn = dot(d, N);
  let uv = vec2f(atan(dot(d, U) / dn), atan(dot(d, V) / dn)) / 0.7853981634 * 0.5 + 0.5;
  let h = 0.5 / max(material.colourCube.y, 1.0);
  return textureSampleLevel(colourCubeTex, climateSampler, clamp(uv, vec2f(h), vec2f(1.0 - h)), f, 0.0);
}
struct Scan { ratio: vec3f, height: f32, normal: vec3f, roughness: f32, ao: f32 };
struct ScanTexels { albedo: vec4f, normal: vec4f };
fn matHash(c: vec2f) -> f32 {
  let q = vec2u(vec2i(c) + vec2i(1048576));
  var h = (q.x * 1597334677u) ^ (q.y * 3812015801u);
  h = h * 747796405u + 2891336453u; h ^= h >> 16u; h *= 2246822519u; h ^= h >> 13u;
  return f32(h >> 8u) / 16777216.0;
}
fn matRead(uv: vec2f, layer: i32, gx: vec2f, gy: vec2f, period: f32) -> ScanTexels {
  var c = floor(uv); let f0 = fract(uv); var c1 = c + 1.0;
  if (period > 0.0) { c -= floor(c / period) * period; c1 -= floor(c1 / period) * period; }
  let f = f0 * f0 * (3.0 - 2.0 * f0);
  let k = 8.0 * mix(mix(matHash(c), matHash(vec2f(c1.x, c.y)), f.x), mix(matHash(vec2f(c.x, c1.y)), matHash(c1), f.x), f.y);
  let i = floor(k); let fk = fract(k);
  let oa = vec2f(matHash(vec2f(i, 17.0)), matHash(vec2f(i, 29.0)));
  let ob = vec2f(matHash(vec2f(i + 1.0, 17.0)), matHash(vec2f(i + 1.0, 29.0)));
  if (fk < 0.25 || fk > 0.75) {
    let q = uv + select(oa, ob, fk > 0.75);
    return ScanTexels(textureSampleGrad(materialAlbedo, repeatSampler, q, layer, gx, gy), textureSampleGrad(materialNormal, repeatSampler, q, layer, gx, gy));
  }
  let a0 = textureSampleGrad(materialAlbedo, repeatSampler, uv + oa, layer, gx, gy);
  let a1 = textureSampleGrad(materialAlbedo, repeatSampler, uv + ob, layer, gx, gy);
  let t = smoothstep(0.4, 0.6, fk + 0.15 * (a1.a - a0.a));
  return ScanTexels(mix(a0, a1, t), mix(textureSampleGrad(materialNormal, repeatSampler, uv + oa, layer, gx, gy), textureSampleGrad(materialNormal, repeatSampler, uv + ob, layer, gx, gy), t));
}
fn matPlane(axis: u32, p: vec3f, dx: vec3f, dy: vec3f, n: vec3f, layer: i32, period: f32) -> Scan {
  var uv: vec2f; var gx: vec2f; var gy: vec2f; var sg: f32;
  if (axis == 0u) {
    sg = select(1.0, -1.0, n.x < 0.0); uv = vec2f(p.z * sg, p.y); gx = vec2f(dx.z * sg, dx.y); gy = vec2f(dy.z * sg, dy.y);
  } else if (axis == 1u) {
    sg = select(1.0, -1.0, n.y < 0.0); uv = vec2f(p.x * sg, p.z); gx = vec2f(dx.x * sg, dx.z); gy = vec2f(dy.x * sg, dy.z);
  } else {
    sg = select(-1.0, 1.0, n.z < 0.0); uv = vec2f(p.x * sg, p.y); gx = vec2f(dx.x * sg, dx.y); gy = vec2f(dy.x * sg, dy.y);
  }
  let s = matRead(uv, layer, gx, gy, period);
  var t = s.normal.xy * 2.0 - 1.0; t.x *= sg;
  let tz = sqrt(max(1.0 - dot(t, t), 0.0));
  var wn: vec3f;
  if (axis == 0u) { let v = vec3f(t + n.zy, tz * abs(n.x)); wn = vec3f(v.z * sign(n.x + 1e-6), v.y, v.x); }
  else if (axis == 1u) { let v = vec3f(t + n.xz, tz * abs(n.y)); wn = vec3f(v.x, v.z * sign(n.y + 1e-6), v.y); }
  else { let v = vec3f(t + n.xy, tz * abs(n.z)); wn = vec3f(v.x, v.y, v.z * sign(n.z + 1e-6)); }
  return Scan(s.albedo.rgb * 2.5, s.albedo.a, wn, s.normal.b, s.normal.a);
}
fn matSurf(layer: i32, p: vec3f, dx: vec3f, dy: vec3f, n: vec3f, period: f32) -> Scan {
  var weights = pow(abs(n), vec3f(6.0)); weights /= weights.x + weights.y + weights.z;
  weights *= step(vec3f(0.02), weights); weights /= weights.x + weights.y + weights.z;
  if (material.windTimeMode.w < 2.5) {
    let an = abs(n);
    var ma = 2u; if (an.x > an.y && an.x > an.z) { ma = 0u; } else if (an.y > an.z) { ma = 1u; }
    var mi = 2u; if (an.x < an.y && an.x < an.z) { mi = 0u; } else if (an.y < an.z) { mi = 1u; }
    let me = 3u - mi - ma;
    var bw = clamp((vec2f(an[ma], an[me]) - 0.5773) / (1.0 - 0.5773), vec2f(0.0), vec2f(1.0));
    if (bw.x + bw.y < 1e-4) { bw = vec2f(1.0, 0.0); } else { bw /= bw.x + bw.y; }
    if (bw.y < 0.02) { bw = vec2f(1.0, 0.0); }
    weights = vec3f(0.0); weights[ma] = bw.x; weights[me] += bw.y;
  }
  var r = Scan(vec3f(0.0), 0.0, vec3f(0.0), 0.0, 0.0);
  for (var a = 0u; a < 3u; a++) {
    if (weights[a] <= 0.0) { continue; }
    let s = matPlane(a, p, dx, dy, n, layer, period); let w = weights[a];
    r.ratio += s.ratio * w; r.height += s.height * w; r.normal += s.normal * w; r.roughness += s.roughness * w; r.ao += s.ao * w;
  }
  r.normal = normalize(r.normal); return r;
}
fn matGround(c0: vec4f, c1: vec4f, c2: vec4f, p: vec3f, dx: vec3f, dy: vec3f, n: vec3f, kf: f32, km: f32) -> Scan {
  let classes = array<f32, 12>(c0.x, c0.y, c0.z, c0.w, c1.x, c1.y, c1.z, c1.w, c2.x, c2.y, c2.z, c2.w);
  var ia = 0u; var ib = 0u; var wa = -1.0; var wb = -1.0;
  for (var i = 0u; i < 12u; i++) { let v = classes[i]; if (v > wa) { wb = wa; ib = ia; wa = v; ia = i; } else if (v > wb) { wb = v; ib = i; } }
  wb = max(wb, 0.0);
  let neutral = Scan(vec3f(1.0), 0.5, n, 0.8, 1.0);
  if (wa <= 0.0) { return neutral; }
  var a = neutral; var b = neutral; var am = neutral; var bm = neutral;
  let pf = p * 0.5; let dxf = dx * 0.5; let dyf = dy * 0.5;
  let pm = pf * 0.125 + 0.37; let dxm = dxf * 0.125; let dym = dyf * 0.125;
  if (kf > 0.0) { a = matSurf(i32(ia), pf, dxf, dyf, n, 2048.0); if (wb > 0.02) { b = matSurf(i32(ib), pf, dxf, dyf, n, 2048.0); } }
  if (km > 0.0) { am = matSurf(i32(ia), pm, dxm, dym, n, 256.0); if (wb > 0.02) { bm = matSurf(i32(ib), pm, dxm, dym, n, 256.0); } }
  let nf = array<f32, 12>(1, 1, 1, 1, 1, 1, 0.45, 1, 1, 0.8, 0.8, 0.6);
  let nm = array<f32, 12>(0.7, 0.7, 0.7, 0.7, 0.5, 0.5, 0.1, 0.6, 0.6, 0.4, 0.3, 0.3);
  let ra = mix(vec3f(1.0), a.ratio, kf) * mix(vec3f(1.0), am.ratio, km * min(1.0, nm[ia] * 1.4));
  let rb = mix(vec3f(1.0), b.ratio, kf) * mix(vec3f(1.0), bm.ratio, km * min(1.0, nm[ib] * 1.4));
  let na = normalize(n + (a.normal - n) * kf * nf[ia] + (am.normal - n) * km * nm[ia]);
  let nb = normalize(n + (b.normal - n) * kf * nf[ib] + (bm.normal - n) * km * nm[ib]);
  let ha = mix(am.height, a.height, kf); let hb = mix(bm.height, b.height, kf);
  let sw = wa + wb; let fa = wa / sw; let fb = wb / sw;
  let m = max(ha * 0.6 + fa, hb * 0.6 + fb) - 0.2;
  let ba = max(ha * 0.6 + fa - m, 0.0); let bb = max(hb * 0.6 + fb - m, 0.0);
  let t = ba / max(ba + bb, 1e-4); let on = clamp(sw * 1.5, 0.0, 1.0);
  return Scan(mix(vec3f(1.0), mix(rb, ra, t), on), mix(hb, ha, t), normalize(mix(n, normalize(mix(nb, na, t)), on)),
    mix(0.8, mix(mix(bm.roughness, b.roughness, kf), mix(am.roughness, a.roughness, kf), t), on),
    mix(1.0, mix(mix(bm.ao, b.ao, kf), mix(am.ao, a.ao, kf), t), on));
}
fn detailTri(p: vec3f, w: vec3f, period: f32, dx: vec3f, dy: vec3f) -> vec4f {
  return textureSampleGrad(detailTexture, repeatSampler, p.yz / period, dx.yz / period, dy.yz / period) * w.x
    + textureSampleGrad(detailTexture, repeatSampler, p.zx / period + 0.37, dx.zx / period, dy.zx / period) * w.y
    + textureSampleGrad(detailTexture, repeatSampler, p.xy / period + 0.71, dx.xy / period, dy.xy / period) * w.z;
}
`;

export const SEASONS = /* wgsl */`
fn seasonSWE(dir: vec3f, meanT: f32) -> f32 {
  let uv = vec2f(atan2(dir.z, dir.x) / 6.28319 + 0.5, asin(clamp(dir.y, -1.0, 1.0)) / 3.14159 + 0.5);
  let m = textureSampleLevel(seasonTexture, climateSampler, uv, 0.0);
  let a1 = (m.r - 0.5) * 100.0; let b1 = (m.g - 0.5) * 100.0; let rain = m.b * m.b * 600.0;
  let amplitude = length(vec2f(a1, b1));
  if (meanT >= amplitude) { return 0.0; }
  var thawAngle = 0.0;
  if (meanT > -amplitude) { thawAngle = acos(clamp(-meanT / amplitude, -1.0, 1.0)); }
  let acc = 12.0 * rain / 6.28319; let fall = acc * (6.28319 - 2.0 * thawAngle);
  let mr = material.season.y / 6.28319;
  let thaw = mr * (2.0 * meanT * thawAngle + 2.0 * amplitude * sin(thawAngle));
  if (thaw + 50.0 <= fall) { return 1e4; }
  if (thawAngle <= 0.0) { return 0.0; }
  var x = material.season.x - atan2(b1, a1);
  x -= 6.28319 * floor((x + 3.14159) / 6.28319);
  if (x > thawAngle) { return acc * (x - thawAngle); }
  if (x < -thawAngle) { return acc * (x + 6.28319 - thawAngle); }
  return max(0.0, fall - mr * (meanT * (x + thawAngle) + amplitude * (sin(x) + sin(thawAngle))));
}
fn seasonSnow(dir: vec3f, normal: vec3f, meanT: f32, noise: f32) -> f32 {
  let dn = dot(normal, dir); let cl2 = 1.0 - dir.y * dir.y;
  var shade = 0.0;
  if (cl2 > 1e-6) { shade = sign(dir.y) * (normal.y - dn * dir.y) / sqrt(cl2) * min(1.0, 2.0 * abs(dir.y)); }
  let swe = seasonSWE(dir, meanT - 8.0 * shade);
  let c = smoothstep(noise - 0.25, noise + 0.25, (1.0 - exp(-swe / 12.0)) * 1.2 - 0.1);
  return c * (1.0 - 0.9 * smoothstep(0.12, 0.45, 1.0 - dn));
}
fn seasonFrost(dir: vec3f, normal: vec3f, noise: f32) -> f32 {
  let sy = clamp(dir.y, -1.0, 1.0);
  let north = vec3f(0.0, 1.0, 0.0) - dir * sy;
  let nl = length(north);
  var tilt = 0.0;
  if (nl > 1e-4) { tilt = degrees(asin(clamp(dot(normal, north) / nl, -1.0, 1.0))) * select(1.0, -1.0, sy < 0.0); }
  let nt = ${FROST_TILTS.length.toFixed(1)}; let nlat = ${FROST_NL.toFixed(1)};
  let ft = clamp((tilt - (${FROST_TILTS[0].toFixed(1)})) / ${(FROST_TILTS[1] - FROST_TILTS[0]).toFixed(1)}, 0.0, nt - 1.0);
  let t0 = min(floor(ft), nt - 2.0);
  let v = clamp((asin(sy) / 3.14159 + 0.5) * nlat, 0.5, nlat - 0.5); let u = material.frost.x / 6.28319;
  let m0 = textureSampleLevel(frostTexture, climateSampler, vec2f(u, (t0 * nlat + v) / (nt * nlat)), 0.0).r;
  let m1 = textureSampleLevel(frostTexture, climateSampler, vec2f(u, ((t0 + 1.0) * nlat + v) / (nt * nlat)), 0.0).r;
  let m = mix(m0, m1, ft - t0);
  let c = 1.0 - exp(-m * m * 2000.0 / 10.0);
  return smoothstep(noise - 0.25, noise + 0.25, c * 1.2 - 0.1);
}
fn rippleSlopes(p: vec3f, dx: vec3f, dy: vec3f, e: vec3f, c: vec3f, t: f32) -> vec3f {
  let uv = vec2f(dot(p, e), dot(p, c)) / t;
  let q = textureSampleGrad(materialNormal, repeatSampler, uv, 12, vec2f(dot(dx, e), dot(dx, c)) / t, vec2f(dot(dy, e), dot(dy, c)) / t).xy * 2.0 - 1.0;
  return e * q.x + c * q.y;
}
fn sandRippleNormal(p: vec3f, dx: vec3f, dy: vec3f, n: vec3f, spacing: f32, foot: f32, k: f32, east: vec3f, up: vec3f, sense: f32) -> vec3f {
  let t = 2.0 * spacing;
  let f1 = 1.0 - smoothstep(0.015 * spacing, 0.06 * spacing, foot);
  let f2 = 1.0 - smoothstep(0.2 * spacing, 0.5 * spacing, foot);
  var e = east - up * dot(east, up);
  if (length(e) > 1e-4) { e = normalize(e); } else { e = normalize(cross(up, vec3f(0.0, 0.0, 1.0))); }
  let c = cross(up, e); let wp = 0.5 + 0.5 * sense; var g = vec3f(0.0);
  for (var s = 0; s < 2; s++) {
    let scale = select(t * 8.0, t, s == 0); let f = select(f2 * 0.25, f1, s == 0);
    if (f <= 0.0) { continue; }
    let q = select(p + 0.21 * t * 8.0, p, s == 0);
    if (wp > 0.01) { g += rippleSlopes(q, dx, dy, e, c, scale) * wp * f; }
    if (wp < 0.99) { g += rippleSlopes(q, dx, dy, -e, -c, scale) * (1.0 - wp) * f; }
  }
  return normalize(n + g * k);
}
`;

// Material-only part of terrainMaterial's land branch. World-dependent lighting
// belongs to the deferred pass. Coordinates and seasonal coefficients are unchanged.
export const GROUND = /* wgsl */`
struct Ground { albedo: vec3f, normal: vec3f, roughness: f32, ao: f32, snow: f32, emission: vec3f };
// the surf's sea and its swash on the beach: liquid.js surfSea, surfLag, surfPhase, surfWave, surfSwash
const SURF_A = 0.1;
fn surfSea(U: f32, g: f32) -> vec4f {
  let T = clamp(10.0 * U / g, 3.0, 16.0);
  return vec4f(0.21 * U * U / g, T, 6.2832 / T, g * T * T / 6.2832);
}
fn surfLag(fp: vec3f) -> f32 {
  let q = ${(2 * Math.PI / 4096).toFixed(9)};
  return 2.0 * sin(dot(fp, vec3f(13.0, 7.0, -9.0) * q)) + 1.3 * sin(dot(fp, vec3f(-5.0, 11.0, 8.0) * q) + 1.7);
}
fn surfPhase(fp: vec3f, xo: f32, sea: vec4f, g: f32, t: f32) -> f32 {
  return sea.z * (t + 1.5 * pow(max(xo, 0.0), 0.6667) / sqrt(g * SURF_A)) + surfLag(fp);
}
fn surfWave(n: f32) -> f32 {
  return 0.5 + 0.35 * (0.5 + 0.5 * sin(n * 0.8976)) + 0.3 * fract(sin(n * 12.9898 + 4.1414) * 43758.5453);
}
fn surfSwash(alt: f32, b: f32, ph: f32, sea: vec4f) -> vec3f {
  let n = floor(ph / 6.2832); let p = ph / 6.2832 - n;
  let bb = clamp(b, 0.01, 0.3); let HL = sea.x * sea.w;
  let R2 = 1.1 * (0.35 * bb * sqrt(HL) + 0.5 * sqrt(HL * (0.563 * bb * bb + 0.004)));
  let Ri = R2 * (0.35 + 0.55 * surfWave(n));
  let s = select(Ri * (1.0 - pow((p - 0.32) / 0.68, 0.75)), Ri * sin(1.5708 * p / 0.32), p < 0.32);
  let cover = smoothstep(s + 0.015, s - 0.015, alt) * step(-0.3, alt);
  let edge = select(0.0, smoothstep(s - 0.25 * Ri - 0.02, s, alt) * cover, p < 0.32);
  return vec3f(cover, edge, R2);
}
fn triBump(p: vec3f, dx: vec3f, dy: vec3f, n: vec3f, w: vec3f, period: f32, strength: f32) -> vec3f {
  let x = textureSampleGrad(detailTexture, repeatSampler, p.yz / period, dx.yz / period, dy.yz / period).gb * 2.0 - 1.0;
  let y = textureSampleGrad(detailTexture, repeatSampler, p.zx / period + 0.37, dx.zx / period, dy.zx / period).gb * 2.0 - 1.0;
  let z = textureSampleGrad(detailTexture, repeatSampler, p.xy / period + 0.71, dx.xy / period, dy.xy / period).gb * 2.0 - 1.0;
  return normalize(n - strength * (vec3f(0.0, x.x, x.y) * w.x + vec3f(y.y, 0.0, y.x) * w.y + vec3f(z.x, z.y, 0.0) * w.z));
}
fn groundSurface(col: vec4f, mat: vec4f, ext: vec4f, cls0: vec4f, cls1: vec4f, cls2: vec4f,
  fp: vec3f, anchor: vec3f, dx: vec3f, dy: vec3f, normalF: vec3f, up: vec3f, dist: f32, foot: f32, muS: f32, shore: f32, alt: f32, shoreM: f32) -> Ground {
  var albedo = col.rgb * col.rgb;
  var veg = mat.x; var snow = mat.y; var rock = mat.z; var sand = mat.w;
  let waterEnc = col.a; let emissive = ext.x; let rough = ext.z;
  var w = pow(abs(normalF), vec3f(4.0)); w /= w.x + w.y + w.z;
  let fineK = 1.0 - smoothstep(60.0, 900.0, dist);
  let midK = 1.0 - smoothstep(600.0, 9000.0, dist);
  let farK = 1.0 - smoothstep(6000.0, 90000.0, dist);
  var g = Ground(albedo, normalF, 0.8, 1.0, snow, vec3f(0.0));
  if (shore <= 0.0) {
    let d0 = detailTri(fp, w, 4096.0, dx, dy);
    let d1 = detailTri(fp, w, 512.0, dx, dy);
    let d2 = detailTri(fp, w, 64.0, dx, dy);
    var c0 = cls0; var c1 = cls1; var c2 = cls2;
    var frostK = 0.0;
    if (material.season.z > 0.5 || material.frost.y > 0.5) {
      let sn0 = mix(d2.r, d1.r, smoothstep(250.0, 1000.0, dist)) * 0.7 + d0.a * 0.3;
      var sn = 0.0;
      if (material.season.z > 0.5) { sn = seasonSnow(up, normalF, ext.a * 120.0 - 60.0, sn0); }
      if (material.frost.y > 0.5) { let fr = seasonFrost(up, normalF, sn0); frostK = select(0.0, 1.0, fr > sn); sn = max(sn, fr); }
      sn *= (1.0 - smoothstep(0.0, 0.02, waterEnc)) * (1.0 - smoothstep(0.0, 0.1, emissive));
      let snow0 = snow * (1.0 - c2.w);
      if (sn > snow0) {
        let k = (1.0 - sn) / max(1.0 - snow0, 0.001);
        albedo = mix(albedo, material.snowColor.rgb, (sn - snow0) / max(1.0 - snow0, 0.001));
        veg *= k; rock *= k; sand *= k; c0 *= k; c1 *= k;
        c2 = vec4f(c2.xy * k, c2.z + sn - snow0, c2.w * k); snow = max(snow, sn);
      }
    }
    let rockAmt = clamp(rock + rough * 0.3, 0.0, 1.0);
    if (material.windTimeMode.w > 0.5) {
      let cover = smoothstep(0.38, 0.66, d1.a + (d0.a - 0.5) * 0.8) * midK;
      albedo = mix(albedo, albedo * vec3f(1.35, 1.12, 0.62), veg * cover * 0.55);
      let bare = smoothstep(0.6, 0.78, d1.r + (d0.r - 0.5) * 0.8) * veg * midK;
      albedo = mix(albedo, albedo * vec3f(1.9, 1.45, 1.1) + vec3f(0.012, 0.009, 0.006), bare * 0.55);
      let v = (d0.r - 0.5) * 0.25 * midK + (d1.r - 0.5) * 0.55 * farK + (d2.r - 0.5) * 0.3 * midK * (0.4 + 1.2 * d0.a);
      albedo *= 1.0 + v * mix(0.85, 1.35, rockAmt) * (1.0 - snow * 0.6);
      let under = 1.0 - smoothstep(0.03, 0.06, waterEnc);
      let kF = (1.0 - smoothstep(60.0, 260.0, dist)) * under;
      let kM = (1.0 - smoothstep(1800.0, 3500.0, dist)) * mix(0.6, 1.0, smoothstep(5.0, 60.0, dist)) * under;
      var ms = matGround(c0, c1, c2, fp, dx, dy, normalF, kF, kM);
      albedo *= ms.ratio * mix(vec3f(1.0), vec3f(0.74, 0.88, 1.0), c2.w);
      if (cls1.z > 0.05 && material.windTimeMode.x > 0.0 && under > 0.0) {
        // liquid.js windSense: trade winds / westerlies / polar easterlies.
        let lat = abs(asin(clamp(up.y, -1.0, 1.0)));
        let sense = -1.0 + 2.0 * smoothstep(0.49, 0.55, lat) - 2.0 * smoothstep(1.02, 1.08, lat);
        ms.normal = sandRippleNormal(anchor, dx, dy, ms.normal, material.windTimeMode.y, foot,
          material.windTimeMode.x * min(cls1.z * 1.5, 1.0), cross(vec3f(0.0, 1.0, 0.0), up), up, sense);
      }
      let sasK = material.windTimeMode.x * smoothstep(0.3, 0.8, c2.z) * (1.0 - frostK) * smoothstep(0.35, 0.75, d2.b) * 0.5;
      if (sasK > 0.01 && under > 0.0) {
        let e = cross(vec3f(0.0, 1.0, 0.0), up);
        ms.normal = sandRippleNormal(anchor + 37.0, dx, dy, ms.normal, 24.0, foot, sasK, cross(up, e), up, 1.0);
      }
      g.normal = normalize(mix(normalF, ms.normal, 0.9)); g.roughness = ms.roughness; g.ao = ms.ao;
    } else {
      let d3 = detailTri(fp, w, 8.0, dx, dy); let grainK = 1.0 - smoothstep(8.0, 140.0, dist);
      var d4 = vec4f(0.5); if (grainK > 0.0) { d4 = detailTri(fp, w, 1.0, dx, dy); }
      let pK = smoothstep(250.0, 1000.0, dist);
      let cover = smoothstep(0.38, 0.66, mix(d2.a, d1.a, pK) + (d0.a - 0.5) * 0.8) * midK;
      albedo = mix(albedo, albedo * vec3f(1.35, 1.12, 0.62), veg * cover * 0.55);
      let bare = smoothstep(0.6, 0.78, mix(d2.r, d1.r, pK) + (d0.r - 0.5) * 0.8) * veg * midK;
      albedo = mix(albedo, albedo * vec3f(1.9, 1.45, 1.1) + vec3f(0.012, 0.009, 0.006), bare * 0.55);
      albedo = mix(albedo, albedo * 0.72, snow * smoothstep(0.55, 0.8, d3.a) * fineK * 0.6);
      let v = (d0.r - 0.5) * 0.25 * midK + (d1.r - 0.5) * 0.55 * farK + (d2.r - 0.5) * 0.45 * midK * (0.4 + 1.2 * d0.a) + (d3.a - 0.5) * 0.45 * fineK + (d4.r - 0.5) * 0.5 * grainK;
      albedo *= 1.0 + v * mix(0.85, 1.35, rockAmt) * (1.0 - snow * 0.6);
      let bumpK = mix(0.45, 1.25, rockAmt) * (1.0 - snow * 0.6);
      var nf = triBump(fp, dx, dy, normalF, w, 64.0, 0.55 * bumpK * midK);
      nf = triBump(fp, dx, dy, nf, w, 8.0, 0.55 * bumpK * fineK);
      nf = triBump(fp, dx, dy, nf, w, 1.0, 0.45 * bumpK * grainK);
      g.normal = normalize(mix(normalF, nf, 0.85));
    }
    albedo = mix(albedo, albedo * vec3f(0.5, 0.45, 0.36), veg * 0.75 * (1.0 - smoothstep(30.0, 46.0, dist)));
    let hidden = max(clamp(0.25 + 0.55 * rough + 0.35 * rock, 0.0, 1.0) * (1.0 - 0.6 * snow), veg * 0.85);
    albedo *= 1.0 - smoothstep(1500.0, 12000.0, dist) * hidden * (0.25 + 0.35 * (1.0 - clamp(muS, 0.0, 1.0)));
  }
  // the swash: each wave's broken water running up the beach and draining back, a thin sheet over the
  // sand (dark, glossy, smoothing its grain), its uprush's edge white and torn (liquid.js surfSwash; alt the
  // ground over the still water, m; shoreM its distance from the water's edge, m: only the beach face the
  // run-up reaches, its height over its slope (a flat's no further than at 0.03), not a low flat behind it)
  if (material.surf.w > 0.0 && shore <= 0.0 && alt > -0.5 && alt < 3.0 && dist < 3000.0 && shoreM < 200.0) {
    let lat = abs(asin(clamp(up.y, -1.0, 1.0)));
    let strength = select(select(select(0.8, 1.25, lat < 1.05), 0.9, lat < 0.52), 0.45, lat < 0.09);
    var sea = surfSea(material.surf.x * strength, material.surf.y);
    sea.x *= material.surf.w;
    let c = clamp(dot(normalF, up), 0.05, 1.0);
    // (its phase the water's at its edge, the bores' fronts bent the same: liquid.js liquidSurface)
    let bend = 1.6 * (clamp(detailTri(fp, w, 64.0, dx, dy).a * 1.6 - 0.3, 0.0, 1.0) - 0.5) + 0.8 * (detailTri(fp, w, 512.0, dx, dy).r - 0.5);
    let b = sqrt(1.0 - c * c) / c;
    let sw = surfSwash(alt, b, surfPhase(fp, 0.0, sea, material.surf.y, material.windTimeMode.z) + bend, sea);
    let reach = smoothstep(1.5 * sw.z / max(b, 0.03) + 4.0, sw.z / max(b, 0.03) + 2.0, shoreM);
    // (the sand the waves keep wet, up to the bigger run-ups' mark and drying above it: darker, glossy)
    let wetSand = sand * reach * smoothstep(1.3 * sw.z + 0.15, 0.6 * sw.z, alt);
    albedo *= vec3f(1.0) - vec3f(0.3, 0.27, 0.22) * wetSand;
    g.roughness = mix(g.roughness, 0.3, wetSand);
    let cover = sw.x * reach;
    if (cover > 0.0) {
      let lace = smoothstep(0.3, 0.7, detailTri(fp, w, 8.0, dx, dy).a);
      albedo *= mix(vec3f(1.0), vec3f(0.55, 0.6, 0.66), cover);
      g.roughness = mix(g.roughness, 0.06, cover);
      g.normal = normalize(mix(g.normal, up, 0.7 * cover));
      let f = clamp(sw.y * reach * (0.4 + 0.6 * lace), 0.0, 1.0);
      albedo = mix(albedo, vec3f(0.8, 0.82, 0.84), f * 0.85);
      g.roughness = mix(g.roughness, 0.7, f);
    }
  }
  if (emissive > 0.01) {
    let flick = 0.85 + 0.15 * sin(material.windTimeMode.z * 1.7 + fp.x * 0.05 + fp.z * 0.07);
    let crust = smoothstep(0.35, 0.65, detailTri(fp, w, 128.0, dx, dy).a);
    g.emission = material.lavaColor.rgb * emissive * flick * mix(1.0, 0.15, crust * (1.0 - emissive * 0.5));
  }
  g.albedo = albedo; g.snow = snow; return g;
}
`;
