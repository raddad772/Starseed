// Generated offline from the existing renderer equations. See tools/shaders/.
export const layout = {
  "uniforms": [
    {
      "name": "uBodyIndex",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 0
    },
    {
      "name": "uSunDir",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 16
    },
    {
      "name": "uCenter",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 32
    },
    {
      "name": "uTrunk",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 48
    },
    {
      "name": "uTex",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 60
    },
    {
      "name": "uSnowCol",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 64
    },
    {
      "name": "uSoilCol",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 80
    },
    {
      "name": "uToFixed",
      "type": "mat3",
      "count": 0,
      "align": 16,
      "size": 48,
      "stride": 48,
      "offset": 96
    },
    {
      "name": "uTrunkSky",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 144
    },
    {
      "name": "uRockSky",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 160
    },
    {
      "name": "uTrunkSkyVP",
      "type": "mat4",
      "count": 0,
      "align": 16,
      "size": 64,
      "stride": 64,
      "offset": 176
    },
    {
      "name": "uSkyShadow",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 240
    },
    {
      "name": "uSkyShadowVP0",
      "type": "mat4",
      "count": 0,
      "align": 16,
      "size": 64,
      "stride": 64,
      "offset": 256
    },
    {
      "name": "uSkyShadowVP1",
      "type": "mat4",
      "count": 0,
      "align": 16,
      "size": 64,
      "stride": 64,
      "offset": 320
    },
    {
      "name": "uSkyShadowL0",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 384
    },
    {
      "name": "uSkyShadowL1",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 400
    },
    {
      "name": "uSkyShadowUp0",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 416
    },
    {
      "name": "uSkyShadowUp1",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 432
    },
    {
      "name": "uSkyCenter",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 448
    },
    {
      "name": "uSkyToFixed",
      "type": "mat3",
      "count": 0,
      "align": 16,
      "size": 48,
      "stride": 48,
      "offset": 464
    },
    {
      "name": "uSkyD",
      "type": "vec2",
      "count": 0,
      "align": 8,
      "size": 8,
      "stride": 8,
      "offset": 512
    }
  ],
  "textures": [
    {
      "name": "tBark",
      "type": "sampler2D",
      "count": 0,
      "binding": 1,
      "samplerBinding": 2
    },
    {
      "name": "tLeaf",
      "type": "sampler2D",
      "count": 0,
      "binding": 3,
      "samplerBinding": 4
    },
    {
      "name": "tNoise",
      "type": "sampler3D",
      "count": 0,
      "binding": 5,
      "samplerBinding": 6
    },
    {
      "name": "tShadowAtlas",
      "type": "sampler2D",
      "count": 0,
      "binding": 7,
      "samplerBinding": 8
    },
    {
      "name": "tSkyRings",
      "type": "sampler2D",
      "count": 0,
      "binding": 9,
      "samplerBinding": 10
    },
    {
      "name": "tMatA",
      "type": "sampler2DArray",
      "count": 0,
      "binding": 11,
      "samplerBinding": 12
    },
    {
      "name": "tMatN",
      "type": "sampler2DArray",
      "count": 0,
      "binding": 13,
      "samplerBinding": 14
    }
  ],
  "bytes": 528,
  "group": 1,
  "attributes": []
};
export const code = /* wgsl */`
struct Params {
    uBodyIndex: f32,
    uSunDir: vec3<f32>,
    uCenter: vec3<f32>,
    uTrunk: vec3<f32>,
    uTex: f32,
    uSnowCol: vec3<f32>,
    uSoilCol: vec3<f32>,
    uToFixed: mat3x3<f32>,
    uTrunkSky: vec4<f32>,
    uRockSky: vec4<f32>,
    uTrunkSkyVP: mat4x4<f32>,
    uSkyShadow: vec4<f32>,
    uSkyShadowVP0_: mat4x4<f32>,
    uSkyShadowVP1_: mat4x4<f32>,
    uSkyShadowL0_: vec4<f32>,
    uSkyShadowL1_: vec4<f32>,
    uSkyShadowUp0_: vec3<f32>,
    uSkyShadowUp1_: vec3<f32>,
    uSkyCenter: vec3<f32>,
    uSkyToFixed: mat3x3<f32>,
    uSkyD: vec2<f32>,
}

struct MatS {
    ratio: vec3<f32>,
    h: f32,
    n: vec3<f32>,
    rough: f32,
    ao: f32,
}

struct FragmentOutput {
    @location(0) gAlbedo: vec4<f32>,
    @location(1) gNormal: vec4<f32>,
    @location(2) gEmission: vec4<f32>,
    @location(3) gSurface: vec4<f32>,
}

const PI: f32 = 3.1415927f;
const HC_N: array<vec3<f32>, 6> = array<vec3<f32>, 6>(vec3<f32>(1f, 0f, 0f), vec3<f32>(-1f, 0f, 0f), vec3<f32>(0f, 1f, 0f), vec3<f32>(0f, -1f, 0f), vec3<f32>(0f, 0f, 1f), vec3<f32>(0f, 0f, -1f));
const HC_U: array<vec3<f32>, 6> = array<vec3<f32>, 6>(vec3<f32>(0f, 0f, -1f), vec3<f32>(0f, 0f, 1f), vec3<f32>(1f, 0f, 0f), vec3<f32>(1f, 0f, 0f), vec3<f32>(1f, 0f, 0f), vec3<f32>(-1f, 0f, 0f));
const HC_V: array<vec3<f32>, 6> = array<vec3<f32>, 6>(vec3<f32>(0f, 1f, 0f), vec3<f32>(0f, 1f, 0f), vec3<f32>(0f, 0f, -1f), vec3<f32>(0f, 0f, 1f), vec3<f32>(0f, 1f, 0f), vec3<f32>(0f, 1f, 0f));

@group(1) @binding(0) 
var<uniform> global: Params;
@group(1) @binding(1) 
var tBarkTexture: texture_2d<f32>;
@group(1) @binding(2) 
var tBarkSampler: sampler;
@group(1) @binding(3) 
var tLeafTexture: texture_2d<f32>;
@group(1) @binding(4) 
var tLeafSampler: sampler;
@group(1) @binding(5) 
var tNoiseTexture: texture_3d<f32>;
@group(1) @binding(6) 
var tNoiseSampler: sampler;
@group(1) @binding(7) 
var tShadowAtlasTexture: texture_2d<f32>;
@group(1) @binding(8) 
var tShadowAtlasSampler: sampler;
@group(1) @binding(9) 
var tSkyRingsTexture: texture_2d<f32>;
@group(1) @binding(10) 
var tSkyRingsSampler: sampler;
@group(1) @binding(11) 
var tMatATexture: texture_2d_array<f32>;
@group(1) @binding(12) 
var tMatASampler: sampler;
@group(1) @binding(13) 
var tMatNTexture: texture_2d_array<f32>;
@group(1) @binding(14) 
var tMatNSampler: sampler;
var<private> gAlbedo: vec4<f32>;
var<private> gNormal: vec4<f32>;
var<private> gEmission: vec4<f32>;
var<private> gSurface: vec4<f32>;
var<private> vUv_1: vec2<f32>;
var<private> vWorld_1: vec3<f32>;
var<private> vNormal_1: vec3<f32>;
var<private> vPart_1: f32;
var<private> vAo_1: f32;
var<private> vTint_1: vec3<f32>;
var<private> vDist_1: f32;
var<private> vSnow_1: vec3<f32>;
var<private> vLocal_1: vec3<f32>;
var<private> vTop_1: f32;
var<private> cloudDirZ: f32 = 1f;
var<private> cloudTotZ: f32 = 1f;
var<private> gl_FrontFacing_1: bool;

fn octEncode(n: vec3<f32>) -> vec2<f32> {
    var n_1: vec3<f32>;
    var local: f32;
    var local_1: f32;
    var local_2: vec2<f32>;

    n_1 = n;
    let _e63 = n_1;
    let _e64 = n_1;
    let _e67 = n_1;
    let _e71 = n_1;
    n_1 = (_e63 / vec3(((abs(_e64.x) + abs(_e67.y)) + abs(_e71.z))));
    let _e77 = n_1;
    if (_e77.z >= 0f) {
        let _e81 = n_1;
        local_2 = _e81.xy;
    } else {
        let _e84 = n_1;
        let _e89 = n_1;
        if (_e89.x >= 0f) {
            local = 1f;
        } else {
            local = -1f;
        }
        let _e97 = local;
        let _e98 = n_1;
        if (_e98.y >= 0f) {
            local_1 = 1f;
        } else {
            local_1 = -1f;
        }
        let _e106 = local_1;
        local_2 = ((vec2(1f) - abs(_e84.yx)) * vec2<f32>(_e97, _e106));
    }
    let _e110 = local_2;
    return _e110;
}

fn materialOutput(albedo: vec3<f32>, normal: vec3<f32>, roughness: f32, ao: f32, trans: f32, wet: f32, F0_: f32) {
    var albedo_1: vec3<f32>;
    var normal_1: vec3<f32>;
    var roughness_1: f32;
    var ao_1: f32;
    var trans_1: f32;
    var wet_1: f32;
    var F0_1: f32;

    albedo_1 = albedo;
    normal_1 = normal;
    roughness_1 = roughness;
    ao_1 = ao;
    trans_1 = trans;
    wet_1 = wet;
    F0_1 = F0_;
    let _e75 = albedo_1;
    let _e80 = clamp(_e75, vec3(0f), vec3(1f));
    let _e81 = ao_1;
    gAlbedo = vec4<f32>(_e80.x, _e80.y, _e80.z, clamp(_e81, 0f, 1f));
    let _e89 = normal_1;
    let _e91 = octEncode(normalize(_e89));
    let _e92 = roughness_1;
    let _e93 = global.uBodyIndex;
    gNormal = vec4<f32>(_e91.x, _e91.y, _e92, _e93);
    gEmission = vec4<f32>(0f, 0f, 0f, 1f);
    let _e102 = trans_1;
    let _e103 = wet_1;
    let _e105 = F0_1;
    gSurface = vec4<f32>(_e102, _e103, 0f, _e105);
    return;
}

fn atlasSum(o: vec2<f32>, wp: vec3<f32>) -> f32 {
    var o_1: vec2<f32>;
    var wp_1: vec3<f32>;
    var c: vec4<f32>;
    var uv: vec2<f32>;
    var e: f32;
    var n_2: i32;
    var st: vec2<f32>;
    var fr: vec2<f32>;
    var p0_: vec2<i32>;
    var org: vec2<i32>;
    var hi: vec2<i32>;
    var a: f32;
    var b: f32;
    var d: f32;
    var f: f32;
    var sum: f32;

    o_1 = o;
    wp_1 = wp;
    let _e80 = global.uTrunkSkyVP;
    let _e81 = wp_1;
    c = (_e80 * vec4<f32>(_e81.x, _e81.y, _e81.z, 1f));
    let _e89 = c;
    let _e91 = c;
    uv = (((_e89.xy / vec2(_e91.w)) * 0.5f) + vec2(0.5f));
    let _e101 = uv;
    let _e108 = uv;
    e = max(abs(((_e101.x * 2f) - 1f)), abs(((_e108.y * 2f) - 1f)));
    let _e117 = e;
    if (_e117 >= 1f) {
        return 0f;
    }
    let _e121 = global.uTrunkSky;
    n_2 = i32(_e121.w);
    let _e125 = uv;
    let _e126 = global.uTrunkSky;
    st = ((_e125 * _e126.w) - vec2(0.5f));
    let _e133 = st;
    fr = fract(_e133);
    let _e136 = st;
    p0_ = vec2<i32>(floor(_e136));
    let _e140 = o_1;
    org = vec2<i32>(_e140);
    let _e143 = n_2;
    hi = vec2((_e143 - 1i));
    let _e148 = org;
    let _e149 = p0_;
    let _e152 = hi;
    let _e156 = textureLoad(tShadowAtlasTexture, (_e148 + clamp(_e149, vec2(0i), _e152)), 0i);
    a = _e156.x;
    let _e159 = org;
    let _e160 = p0_;
    let _e167 = hi;
    let _e171 = textureLoad(tShadowAtlasTexture, (_e159 + clamp((_e160 + vec2<i32>(1i, 0i)), vec2(0i), _e167)), 0i);
    b = _e171.x;
    let _e174 = org;
    let _e175 = p0_;
    let _e182 = hi;
    let _e186 = textureLoad(tShadowAtlasTexture, (_e174 + clamp((_e175 + vec2<i32>(0i, 1i)), vec2(0i), _e182)), 0i);
    d = _e186.x;
    let _e189 = org;
    let _e190 = p0_;
    let _e197 = hi;
    let _e201 = textureLoad(tShadowAtlasTexture, (_e189 + clamp((_e190 + vec2<i32>(1i, 1i)), vec2(0i), _e197)), 0i);
    f = _e201.x;
    let _e204 = a;
    let _e205 = b;
    let _e206 = fr;
    let _e209 = d;
    let _e210 = f;
    let _e211 = fr;
    let _e214 = fr;
    sum = mix(mix(_e204, _e205, _e206.x), mix(_e209, _e210, _e211.x), _e214.y);
    let _e218 = sum;
    let _e222 = e;
    return (_e218 * (1f - smoothstep(0.75f, 1f, _e222)));
}

fn trunkSum(wp_2: vec3<f32>) -> f32 {
    var wp_3: vec3<f32>;
    var local_3: f32;

    wp_3 = wp_2;
    let _e78 = global.uTrunkSky;
    if (_e78.x < 0.5f) {
        local_3 = 0f;
    } else {
        let _e83 = global.uTrunkSky;
        let _e85 = wp_3;
        let _e86 = atlasSum(_e83.yz, _e85);
        local_3 = _e86;
    }
    let _e88 = local_3;
    return _e88;
}

fn rockSum(wp_4: vec3<f32>) -> f32 {
    var wp_5: vec3<f32>;
    var local_4: f32;

    wp_5 = wp_4;
    let _e78 = global.uRockSky;
    if (_e78.x < 0.5f) {
        local_4 = 0f;
    } else {
        let _e83 = global.uRockSky;
        let _e85 = wp_5;
        let _e86 = atlasSum(_e83.yz, _e85);
        local_4 = _e86;
    }
    let _e88 = local_4;
    return _e88;
}

fn trunkSky(wp_6: vec3<f32>) -> f32 {
    var wp_7: vec3<f32>;

    wp_7 = wp_6;
    let _e78 = wp_7;
    let _e79 = trunkSum(_e78);
    let _e81 = wp_7;
    let _e82 = rockSum(_e81);
    return exp((-(_e79) - _e82));
}

fn skyRing(sc: vec2<f32>, d_1: f32, D: f32, a_1: f32, b_1: f32) -> f32 {
    var sc_1: vec2<f32>;
    var d_2: f32;
    var D_1: f32;
    var a_2: f32;
    var b_2: f32;
    var dh: f32;
    var h2_: f32;

    sc_1 = sc;
    d_2 = d_1;
    D_1 = D;
    a_2 = a_1;
    b_2 = b_1;
    let _e86 = sc_1;
    if (_e86.x <= 0.003f) {
        return 0f;
    }
    let _e91 = d_2;
    let _e92 = D_1;
    let _e93 = sc_1;
    let _e95 = sc_1;
    dh = (_e91 - (_e92 + (_e93.y / _e95.x)));
    let _e101 = dh;
    if (_e101 <= 0f) {
        return 0f;
    }
    let _e105 = dh;
    let _e106 = dh;
    h2_ = (_e105 * _e106);
    let _e109 = sc_1;
    let _e111 = b_2;
    let _e112 = b_2;
    let _e114 = b_2;
    let _e115 = b_2;
    let _e117 = h2_;
    let _e120 = a_2;
    let _e121 = a_2;
    let _e123 = a_2;
    let _e124 = a_2;
    let _e126 = h2_;
    return (_e109.x * (((_e111 * _e112) / ((_e114 * _e115) + _e117)) - ((_e120 * _e121) / (((_e123 * _e124) + _e126) + 0.000001f))));
}

fn skyShadowMap(u0_: f32, D_2: f32, VP: mat4x4<f32>, L: vec4<f32>, upF: vec3<f32>, ext: f32, pF: vec3<f32>) -> f32 {
    var u0_1: f32;
    var D_3: f32;
    var VP_1: mat4x4<f32>;
    var L_1: vec4<f32>;
    var upF_1: vec3<f32>;
    var ext_1: f32;
    var pF_1: vec3<f32>;
    var c_1: vec4<f32>;
    var uv_1: vec2<f32>;
    var edge: f32;
    var NB: f32 = 6f;
    var x0_: f32;
    var C: vec4<f32>;
    var A: vec4<f32>;
    var B: vec4<f32>;
    var d_3: f32;

    u0_1 = u0_;
    D_3 = D_2;
    VP_1 = VP;
    L_1 = L;
    upF_1 = upF;
    ext_1 = ext;
    pF_1 = pF;
    let _e90 = VP_1;
    let _e91 = pF_1;
    c_1 = (_e90 * vec4<f32>(_e91.x, _e91.y, _e91.z, 1f));
    let _e99 = c_1;
    let _e101 = c_1;
    uv_1 = (((_e99.xy / vec2(_e101.w)) * 0.5f) + vec2(0.5f));
    let _e113 = ext_1;
    edge = (45f / (2f * _e113));
    let _e117 = uv_1;
    let _e118 = edge;
    let _e122 = uv_1;
    let _e124 = edge;
    if (any((_e117 < vec2(_e118))) || any((_e122 > vec2((1f - _e124))))) {
        return -1f;
    }
    let _e132 = uv_1;
    uv_1 = clamp(_e132, vec2(0.0009765625f), vec2(0.99902344f));
    let _e146 = u0_1;
    x0_ = (_e146 * 3f);
    let _e150 = x0_;
    let _e153 = uv_1;
    let _e156 = NB;
    let _e158 = uv_1;
    let _e162 = textureSampleLevel(tSkyRingsTexture, tSkyRingsSampler, vec2<f32>((((_e150 + 2f) + _e153.x) / _e156), _e158.y), 0f);
    C = _e162;
    let _e164 = C;
    if (_e164.z < 0.002f) {
        return 0f;
    }
    let _e169 = x0_;
    let _e170 = uv_1;
    let _e173 = NB;
    let _e175 = uv_1;
    let _e179 = textureSampleLevel(tSkyRingsTexture, tSkyRingsSampler, vec2<f32>(((_e169 + _e170.x) / _e173), _e175.y), 0f);
    A = _e179;
    let _e181 = x0_;
    let _e184 = uv_1;
    let _e187 = NB;
    let _e189 = uv_1;
    let _e193 = textureSampleLevel(tSkyRingsTexture, tSkyRingsSampler, vec2<f32>((((_e181 + 1f) + _e184.x) / _e187), _e189.y), 0f);
    B = _e193;
    let _e195 = L_1;
    let _e197 = pF_1;
    let _e199 = upF_1;
    let _e203 = L_1;
    d_3 = (dot((_e195.xyz - _e197), _e199) - (0.3f + (1.5f * _e203.w)));
    let _e209 = A;
    let _e211 = d_3;
    let _e212 = D_3;
    let _e215 = skyRing(_e209.xy, _e211, _e212, 0f, 1f);
    let _e216 = A;
    let _e218 = d_3;
    let _e219 = D_3;
    let _e222 = skyRing(_e216.zw, _e218, _e219, 1f, 3.5f);
    let _e224 = B;
    let _e226 = d_3;
    let _e227 = D_3;
    let _e230 = skyRing(_e224.xy, _e226, _e227, 3.5f, 9f);
    let _e232 = B;
    let _e234 = d_3;
    let _e235 = D_3;
    let _e238 = skyRing(_e232.zw, _e234, _e235, 9f, 20f);
    let _e240 = C;
    let _e242 = d_3;
    let _e243 = D_3;
    let _e246 = skyRing(_e240.xy, _e242, _e243, 20f, 45f);
    return clamp(((((_e215 + _e222) + _e230) + _e238) + _e246), 0f, 1f);
}

fn skyBlocked(wp_8: vec3<f32>) -> f32 {
    var wp_9: vec3<f32>;
    var dist: f32;
    var pF_2: vec3<f32>;
    var bl: f32 = -1f;

    wp_9 = wp_8;
    let _e78 = global.uSkyShadow;
    if (_e78.x < 0.5f) {
        return 0f;
    }
    let _e83 = wp_9;
    dist = length(_e83);
    let _e86 = dist;
    let _e87 = global.uSkyShadow;
    if (_e86 > _e87.z) {
        return 0f;
    }
    let _e91 = global.uSkyToFixed;
    let _e92 = wp_9;
    let _e93 = global.uSkyCenter;
    pF_2 = (_e91 * (_e92 - _e93));
    let _e100 = dist;
    let _e101 = global.uSkyShadow;
    if (_e100 < _e101.y) {
        let _e105 = global.uSkyD;
        let _e107 = global.uSkyShadowVP0_;
        let _e108 = global.uSkyShadowL0_;
        let _e109 = global.uSkyShadowUp0_;
        let _e110 = global.uSkyShadow;
        let _e112 = pF_2;
        let _e113 = skyShadowMap(0f, _e105.x, _e107, _e108, _e109, _e110.y, _e112);
        bl = _e113;
    }
    let _e114 = bl;
    if (_e114 < 0f) {
        let _e118 = global.uSkyD;
        let _e120 = global.uSkyShadowVP1_;
        let _e121 = global.uSkyShadowL1_;
        let _e122 = global.uSkyShadowUp1_;
        let _e123 = global.uSkyShadow;
        let _e125 = pF_2;
        let _e126 = skyShadowMap(1f, _e118.y, _e120, _e121, _e122, _e123.z, _e125);
        bl = _e126;
    }
    let _e127 = bl;
    if (_e127 < 0f) {
        return 0f;
    }
    let _e131 = bl;
    let _e134 = global.uSkyShadow;
    let _e137 = global.uSkyShadow;
    let _e139 = dist;
    return (_e131 * (1f - smoothstep((0.8f * _e134.z), _e137.z, _e139)));
}

fn matHash(c_2: vec2<f32>) -> f32 {
    var c_3: vec2<f32>;
    var q: vec2<u32>;
    var h: u32;

    c_3 = c_2;
    let _e78 = c_3;
    q = vec2<u32>((vec2<i32>(_e78) + vec2(1048576i)));
    let _e85 = q;
    let _e89 = q;
    h = ((_e85.x * 1597334677u) ^ (_e89.y * 3812015801u));
    let _e95 = h;
    h = ((_e95 * 747796405u) + 2891336453u);
    let _e100 = h;
    let _e101 = h;
    h = (_e100 ^ (_e101 >> 16u));
    let _e106 = h;
    h = (_e106 * 2246822519u);
    let _e109 = h;
    let _e110 = h;
    h = (_e109 ^ (_e110 >> 13u));
    let _e115 = h;
    return (f32((_e115 >> 8u)) / 16777216f);
}

fn matRead(uv_2: vec2<f32>, layer: f32, gx: vec2<f32>, gy: vec2<f32>, per: f32, A_1: ptr<function, vec4<f32>>, B_1: ptr<function, vec4<f32>>) {
    var uv_3: vec2<f32>;
    var layer_1: f32;
    var gx_1: vec2<f32>;
    var gy_1: vec2<f32>;
    var per_1: f32;
    var c_4: vec2<f32>;
    var f_1: vec2<f32>;
    var c1_: vec2<f32>;
    var k: f32;
    var i: f32;
    var fk: f32;
    var oA: vec2<f32>;
    var oB: vec2<f32>;
    var A0_: vec4<f32>;
    var A1_: vec4<f32>;
    var t: f32;

    uv_3 = uv_2;
    layer_1 = layer;
    gx_1 = gx;
    gy_1 = gy;
    per_1 = per;
    let _e88 = uv_3;
    c_4 = floor(_e88);
    let _e91 = uv_3;
    let _e92 = c_4;
    f_1 = (_e91 - _e92);
    let _e95 = c_4;
    c1_ = (_e95 + vec2(1f));
    let _e100 = per_1;
    if (_e100 > 0f) {
        {
            let _e103 = c_4;
            let _e104 = per_1;
            let _e105 = vec2(_e104);
            c_4 = (_e103 - (floor((_e103 / _e105)) * _e105));
            let _e110 = c1_;
            let _e111 = per_1;
            let _e112 = vec2(_e111);
            c1_ = (_e110 - (floor((_e110 / _e112)) * _e112));
        }
    }
    let _e117 = f_1;
    let _e118 = f_1;
    let _e122 = f_1;
    f_1 = ((_e117 * _e118) * (vec2(3f) - (2f * _e122)));
    let _e128 = c_4;
    let _e129 = matHash(_e128);
    let _e130 = c1_;
    let _e132 = c_4;
    let _e135 = matHash(vec2<f32>(_e130.x, _e132.y));
    let _e136 = f_1;
    let _e139 = c_4;
    let _e141 = c1_;
    let _e144 = matHash(vec2<f32>(_e139.x, _e141.y));
    let _e145 = c1_;
    let _e146 = matHash(_e145);
    let _e147 = f_1;
    let _e150 = f_1;
    k = (8f * mix(mix(_e129, _e135, _e136.x), mix(_e144, _e146, _e147.x), _e150.y));
    let _e155 = k;
    i = floor(_e155);
    let _e158 = k;
    let _e159 = i;
    fk = (_e158 - _e159);
    let _e162 = i;
    let _e165 = matHash(vec2<f32>(_e162, 17f));
    let _e166 = i;
    let _e169 = matHash(vec2<f32>(_e166, 29f));
    oA = vec2<f32>(_e165, _e169);
    let _e172 = i;
    let _e177 = matHash(vec2<f32>((_e172 + 1f), 17f));
    let _e178 = i;
    let _e183 = matHash(vec2<f32>((_e178 + 1f), 29f));
    oB = vec2<f32>(_e177, _e183);
    let _e186 = fk;
    if (_e186 < 0.25f) {
        {
            let _e189 = uv_3;
            let _e190 = oA;
            let _e191 = (_e189 + _e190);
            let _e192 = layer_1;
            let _e195 = vec3<f32>(_e191.x, _e191.y, _e192);
            let _e196 = gx_1;
            let _e197 = gy_1;
            let _e201 = textureSampleGrad(tMatATexture, tMatASampler, _e195.xy, i32(_e195.z), _e196, _e197);
            (*A_1) = _e201;
            let _e202 = uv_3;
            let _e203 = oA;
            let _e204 = (_e202 + _e203);
            let _e205 = layer_1;
            let _e208 = vec3<f32>(_e204.x, _e204.y, _e205);
            let _e209 = gx_1;
            let _e210 = gy_1;
            let _e214 = textureSampleGrad(tMatNTexture, tMatNSampler, _e208.xy, i32(_e208.z), _e209, _e210);
            (*B_1) = _e214;
            return;
        }
    }
    let _e215 = fk;
    if (_e215 > 0.75f) {
        {
            let _e218 = uv_3;
            let _e219 = oB;
            let _e220 = (_e218 + _e219);
            let _e221 = layer_1;
            let _e224 = vec3<f32>(_e220.x, _e220.y, _e221);
            let _e225 = gx_1;
            let _e226 = gy_1;
            let _e230 = textureSampleGrad(tMatATexture, tMatASampler, _e224.xy, i32(_e224.z), _e225, _e226);
            (*A_1) = _e230;
            let _e231 = uv_3;
            let _e232 = oB;
            let _e233 = (_e231 + _e232);
            let _e234 = layer_1;
            let _e237 = vec3<f32>(_e233.x, _e233.y, _e234);
            let _e238 = gx_1;
            let _e239 = gy_1;
            let _e243 = textureSampleGrad(tMatNTexture, tMatNSampler, _e237.xy, i32(_e237.z), _e238, _e239);
            (*B_1) = _e243;
            return;
        }
    }
    let _e244 = uv_3;
    let _e245 = oA;
    let _e246 = (_e244 + _e245);
    let _e247 = layer_1;
    let _e250 = vec3<f32>(_e246.x, _e246.y, _e247);
    let _e251 = gx_1;
    let _e252 = gy_1;
    let _e256 = textureSampleGrad(tMatATexture, tMatASampler, _e250.xy, i32(_e250.z), _e251, _e252);
    A0_ = _e256;
    let _e258 = uv_3;
    let _e259 = oB;
    let _e260 = (_e258 + _e259);
    let _e261 = layer_1;
    let _e264 = vec3<f32>(_e260.x, _e260.y, _e261);
    let _e265 = gx_1;
    let _e266 = gy_1;
    let _e270 = textureSampleGrad(tMatATexture, tMatASampler, _e264.xy, i32(_e264.z), _e265, _e266);
    A1_ = _e270;
    let _e274 = fk;
    let _e276 = A1_;
    let _e278 = A0_;
    t = smoothstep(0.4f, 0.6f, (_e274 + (0.15f * (_e276.w - _e278.w))));
    let _e285 = A0_;
    let _e286 = A1_;
    let _e287 = t;
    (*A_1) = mix(_e285, _e286, vec4(_e287));
    let _e290 = uv_3;
    let _e291 = oA;
    let _e292 = (_e290 + _e291);
    let _e293 = layer_1;
    let _e296 = vec3<f32>(_e292.x, _e292.y, _e293);
    let _e297 = gx_1;
    let _e298 = gy_1;
    let _e302 = textureSampleGrad(tMatNTexture, tMatNSampler, _e296.xy, i32(_e296.z), _e297, _e298);
    let _e303 = uv_3;
    let _e304 = oB;
    let _e305 = (_e303 + _e304);
    let _e306 = layer_1;
    let _e309 = vec3<f32>(_e305.x, _e305.y, _e306);
    let _e310 = gx_1;
    let _e311 = gy_1;
    let _e315 = textureSampleGrad(tMatNTexture, tMatNSampler, _e309.xy, i32(_e309.z), _e310, _e311);
    let _e316 = t;
    (*B_1) = mix(_e302, _e315, vec4(_e316));
    return;
}

fn matPlane(a_3: i32, p: vec3<f32>, dx: vec3<f32>, dy: vec3<f32>, n_3: vec3<f32>, layer_2: f32, per_2: f32, A_2: ptr<function, vec4<f32>>, B_2: ptr<function, vec4<f32>>, wn: ptr<function, vec3<f32>>) {
    var a_4: i32;
    var p_1: vec3<f32>;
    var dx_1: vec3<f32>;
    var dy_1: vec3<f32>;
    var n_4: vec3<f32>;
    var layer_3: f32;
    var per_3: f32;
    var uv_4: vec2<f32>;
    var gx_2: vec2<f32>;
    var gy_2: vec2<f32>;
    var sg: f32;
    var local_5: f32;
    var local_6: f32;
    var local_7: f32;
    var t_1: vec2<f32>;
    var tz: f32;
    var v: vec3<f32>;
    var v_1: vec3<f32>;
    var v_2: vec3<f32>;

    a_4 = a_3;
    p_1 = p;
    dx_1 = dx;
    dy_1 = dy;
    n_4 = n_3;
    layer_3 = layer_2;
    per_3 = per_2;
    let _e97 = a_4;
    if (_e97 == 0i) {
        {
            let _e100 = n_4;
            if (_e100.x < 0f) {
                local_5 = -1f;
            } else {
                local_5 = 1f;
            }
            let _e108 = local_5;
            sg = _e108;
            let _e109 = p_1;
            let _e111 = sg;
            let _e113 = p_1;
            uv_4 = vec2<f32>((_e109.z * _e111), _e113.y);
            let _e116 = dx_1;
            let _e118 = sg;
            let _e120 = dx_1;
            gx_2 = vec2<f32>((_e116.z * _e118), _e120.y);
            let _e123 = dy_1;
            let _e125 = sg;
            let _e127 = dy_1;
            gy_2 = vec2<f32>((_e123.z * _e125), _e127.y);
        }
    } else {
        let _e130 = a_4;
        if (_e130 == 1i) {
            {
                let _e133 = n_4;
                if (_e133.y < 0f) {
                    local_6 = -1f;
                } else {
                    local_6 = 1f;
                }
                let _e141 = local_6;
                sg = _e141;
                let _e142 = p_1;
                let _e144 = sg;
                let _e146 = p_1;
                uv_4 = vec2<f32>((_e142.x * _e144), _e146.z);
                let _e149 = dx_1;
                let _e151 = sg;
                let _e153 = dx_1;
                gx_2 = vec2<f32>((_e149.x * _e151), _e153.z);
                let _e156 = dy_1;
                let _e158 = sg;
                let _e160 = dy_1;
                gy_2 = vec2<f32>((_e156.x * _e158), _e160.z);
            }
        } else {
            {
                let _e163 = n_4;
                if (_e163.z < 0f) {
                    local_7 = 1f;
                } else {
                    local_7 = -1f;
                }
                let _e171 = local_7;
                sg = _e171;
                let _e172 = p_1;
                let _e174 = sg;
                let _e176 = p_1;
                uv_4 = vec2<f32>((_e172.x * _e174), _e176.y);
                let _e179 = dx_1;
                let _e181 = sg;
                let _e183 = dx_1;
                gx_2 = vec2<f32>((_e179.x * _e181), _e183.y);
                let _e186 = dy_1;
                let _e188 = sg;
                let _e190 = dy_1;
                gy_2 = vec2<f32>((_e186.x * _e188), _e190.y);
            }
        }
    }
    let _e193 = uv_4;
    let _e194 = layer_3;
    let _e195 = gx_2;
    let _e196 = gy_2;
    let _e197 = per_3;
    matRead(_e193, _e194, _e195, _e196, _e197, A_2, B_2);
    let _e202 = (*B_2);
    t_1 = ((_e202.xy * 2f) - vec2(1f));
    let _e211 = t_1;
    let _e213 = sg;
    t_1.x = (_e211.x * _e213);
    let _e216 = t_1;
    let _e217 = t_1;
    tz = sqrt(max((1f - dot(_e216, _e217)), 0f));
    let _e224 = a_4;
    if (_e224 == 0i) {
        {
            let _e227 = t_1;
            let _e228 = n_4;
            let _e230 = (_e227 + _e228.zy);
            let _e231 = tz;
            let _e232 = n_4;
            v = vec3<f32>(_e230.x, _e230.y, (_e231 * abs(_e232.x)));
            let _e240 = v;
            let _e242 = n_4;
            let _e248 = v;
            let _e250 = v;
            (*wn) = vec3<f32>((_e240.z * sign((_e242.x + 0.000001f))), _e248.y, _e250.x);
            return;
        }
    } else {
        let _e253 = a_4;
        if (_e253 == 1i) {
            {
                let _e256 = t_1;
                let _e257 = n_4;
                let _e259 = (_e256 + _e257.xz);
                let _e260 = tz;
                let _e261 = n_4;
                v_1 = vec3<f32>(_e259.x, _e259.y, (_e260 * abs(_e261.y)));
                let _e269 = v_1;
                let _e271 = v_1;
                let _e273 = n_4;
                let _e279 = v_1;
                (*wn) = vec3<f32>(_e269.x, (_e271.z * sign((_e273.y + 0.000001f))), _e279.y);
                return;
            }
        } else {
            {
                let _e282 = t_1;
                let _e283 = n_4;
                let _e285 = (_e282 + _e283.xy);
                let _e286 = tz;
                let _e287 = n_4;
                v_2 = vec3<f32>(_e285.x, _e285.y, (_e286 * abs(_e287.z)));
                let _e295 = v_2;
                let _e297 = v_2;
                let _e299 = v_2;
                let _e301 = n_4;
                (*wn) = vec3<f32>(_e295.x, _e297.y, (_e299.z * sign((_e301.z + 0.000001f))));
                return;
            }
        }
    }
}

fn matSurf(layer_4: f32, p_2: vec3<f32>, dx_2: vec3<f32>, dy_2: vec3<f32>, n_5: vec3<f32>, per_4: f32) -> MatS {
    var layer_5: f32;
    var p_3: vec3<f32>;
    var dx_3: vec3<f32>;
    var dy_3: vec3<f32>;
    var n_6: vec3<f32>;
    var per_5: f32;
    var A_3: vec4<f32>;
    var B_3: vec4<f32>;
    var wn_1: vec3<f32>;
    var sA: vec4<f32> = vec4(0f);
    var sB: vec4<f32> = vec4(0f);
    var sn: vec3<f32> = vec3(0f);
    var an: vec3<f32>;
    var local_8: i32;
    var local_9: i32;
    var ma: i32;
    var local_10: i32;
    var local_11: i32;
    var mi: i32;
    var me: i32;
    var local_12: f32;
    var local_13: f32;
    var w0_: f32;
    var local_14: f32;
    var local_15: f32;
    var w1_: f32;
    var bw: vec2<f32>;
    var local_16: vec2<f32>;

    layer_5 = layer_4;
    p_3 = p_2;
    dx_3 = dx_2;
    dy_3 = dy_2;
    n_6 = n_5;
    per_5 = per_4;
    let _e100 = n_6;
    an = abs(_e100);
    let _e103 = an;
    let _e105 = an;
    let _e108 = an;
    let _e110 = an;
    if ((_e103.x > _e105.y) && (_e108.x > _e110.z)) {
        local_9 = 0i;
    } else {
        let _e115 = an;
        let _e117 = an;
        if (_e115.y > _e117.z) {
            local_8 = 1i;
        } else {
            local_8 = 2i;
        }
        let _e123 = local_8;
        local_9 = _e123;
    }
    let _e125 = local_9;
    ma = _e125;
    let _e127 = an;
    let _e129 = an;
    let _e132 = an;
    let _e134 = an;
    if ((_e127.x < _e129.y) && (_e132.x < _e134.z)) {
        local_11 = 0i;
    } else {
        let _e139 = an;
        let _e141 = an;
        if (_e139.y < _e141.z) {
            local_10 = 1i;
        } else {
            local_10 = 2i;
        }
        let _e147 = local_10;
        local_11 = _e147;
    }
    let _e149 = local_11;
    mi = _e149;
    let _e152 = mi;
    let _e154 = ma;
    me = ((3i - _e152) - _e154);
    let _e157 = ma;
    if (_e157 == 0i) {
        let _e160 = an;
        local_13 = _e160.x;
    } else {
        let _e162 = ma;
        if (_e162 == 1i) {
            let _e165 = an;
            local_12 = _e165.y;
        } else {
            let _e167 = an;
            local_12 = _e167.z;
        }
        let _e170 = local_12;
        local_13 = _e170;
    }
    let _e172 = local_13;
    w0_ = _e172;
    let _e174 = me;
    if (_e174 == 0i) {
        let _e177 = an;
        local_15 = _e177.x;
    } else {
        let _e179 = me;
        if (_e179 == 1i) {
            let _e182 = an;
            local_14 = _e182.y;
        } else {
            let _e184 = an;
            local_14 = _e184.z;
        }
        let _e187 = local_14;
        local_15 = _e187;
    }
    let _e189 = local_15;
    w1_ = _e189;
    let _e191 = w0_;
    let _e192 = w1_;
    bw = clamp(((vec2<f32>(_e191, _e192) - vec2(0.5773f)) / vec2(0.4227f)), vec2(0f), vec2(1f));
    let _e208 = bw;
    let _e210 = bw;
    if ((_e208.x + _e210.y) < 0.0001f) {
        local_16 = vec2<f32>(1f, 0f);
    } else {
        let _e218 = bw;
        let _e219 = bw;
        let _e221 = bw;
        local_16 = (_e218 / vec2((_e219.x + _e221.y)));
    }
    let _e227 = local_16;
    bw = _e227;
    let _e228 = bw;
    if (_e228.y < 0.02f) {
        bw = vec2<f32>(1f, 0f);
    }
    let _e235 = ma;
    let _e236 = p_3;
    let _e237 = dx_3;
    let _e238 = dy_3;
    let _e239 = n_6;
    let _e240 = layer_5;
    let _e241 = per_5;
    matPlane(_e235, _e236, _e237, _e238, _e239, _e240, _e241, (&A_3), (&B_3), (&wn_1));
    let _e248 = sA;
    let _e249 = A_3;
    let _e250 = bw;
    sA = (_e248 + (_e249 * _e250.x));
    let _e254 = sB;
    let _e255 = B_3;
    let _e256 = bw;
    sB = (_e254 + (_e255 * _e256.x));
    let _e260 = sn;
    let _e261 = wn_1;
    let _e262 = bw;
    sn = (_e260 + (_e261 * _e262.x));
    let _e266 = bw;
    if (_e266.y > 0f) {
        {
            let _e270 = me;
            let _e271 = p_3;
            let _e272 = dx_3;
            let _e273 = dy_3;
            let _e274 = n_6;
            let _e275 = layer_5;
            let _e276 = per_5;
            matPlane(_e270, _e271, _e272, _e273, _e274, _e275, _e276, (&A_3), (&B_3), (&wn_1));
            let _e283 = sA;
            let _e284 = A_3;
            let _e285 = bw;
            sA = (_e283 + (_e284 * _e285.y));
            let _e289 = sB;
            let _e290 = B_3;
            let _e291 = bw;
            sB = (_e289 + (_e290 * _e291.y));
            let _e295 = sn;
            let _e296 = wn_1;
            let _e297 = bw;
            sn = (_e295 + (_e296 * _e297.y));
        }
    }
    let _e301 = sA;
    let _e305 = sA;
    let _e307 = sn;
    let _e309 = sB;
    let _e311 = sB;
    return MatS((_e301.xyz * 2.5f), _e305.w, normalize(_e307), _e309.z, _e311.w);
}

fn matGround(c0_: vec4<f32>, c1_1: vec4<f32>, c2_: vec4<f32>, p_4: vec3<f32>, dpx: vec3<f32>, dpy: vec3<f32>, n_7: vec3<f32>, kF: f32, kM: f32) -> MatS {
    var c0_1: vec4<f32>;
    var c1_2: vec4<f32>;
    var c2_1: vec4<f32>;
    var p_5: vec3<f32>;
    var dpx_1: vec3<f32>;
    var dpy_1: vec3<f32>;
    var n_8: vec3<f32>;
    var kF_1: f32;
    var kM_1: f32;
    var cs: array<f32, 12>;
    var ia: i32 = 0i;
    var ib: i32 = 1i;
    var wa: f32 = -1f;
    var wb: f32 = -1f;
    var i_1: i32 = 0i;
    var v_3: f32;
    var r: MatS;
    var a_5: MatS;
    var b_3: MatS;
    var aM: MatS;
    var bM: MatS;
    var pf: vec3<f32>;
    var dxf: vec3<f32>;
    var dyf: vec3<f32>;
    var pm: vec3<f32>;
    var dxm: vec3<f32>;
    var dym: vec3<f32>;
    var PER: f32 = 2048f;
    var NF: array<f32, 12> = array<f32, 12>(1f, 1f, 1f, 1f, 1f, 1f, 0.45f, 1f, 1f, 0.8f, 0.8f, 0.6f);
    var NM: array<f32, 12> = array<f32, 12>(0.7f, 0.7f, 0.7f, 0.7f, 0.5f, 0.5f, 0.1f, 0.6f, 0.6f, 0.4f, 0.3f, 0.3f);
    var fA: f32;
    var mA: f32;
    var fB: f32;
    var mB: f32;
    var rA: vec3<f32>;
    var rB: vec3<f32>;
    var nA: vec3<f32>;
    var nB: vec3<f32>;
    var hA: f32;
    var hB: f32;
    var roA: f32;
    var roB: f32;
    var aoA: f32;
    var aoB: f32;
    var sw: f32;
    var fa: f32;
    var fb: f32;
    var m: f32;
    var ba: f32;
    var bb: f32;
    var t_2: f32;
    var on: f32;

    c0_1 = c0_;
    c1_2 = c1_1;
    c2_1 = c2_;
    p_5 = p_4;
    dpx_1 = dpx;
    dpy_1 = dpy;
    n_8 = n_7;
    kF_1 = kF;
    kM_1 = kM;
    let _e94 = c0_1;
    let _e96 = c0_1;
    let _e98 = c0_1;
    let _e100 = c0_1;
    let _e102 = c1_2;
    let _e104 = c1_2;
    let _e106 = c1_2;
    let _e108 = c1_2;
    let _e110 = c2_1;
    let _e112 = c2_1;
    let _e114 = c2_1;
    let _e116 = c2_1;
    cs = array<f32, 12>(_e94.x, _e96.y, _e98.z, _e100.w, _e102.x, _e104.y, _e106.z, _e108.w, _e110.x, _e112.y, _e114.z, _e116.w);
    loop {
        let _e132 = i_1;
        if !((_e132 < 12i)) {
            break;
        }
        {
            let _e139 = i_1;
            let _e141 = cs[_e139];
            v_3 = _e141;
            let _e143 = v_3;
            let _e144 = wa;
            if (_e143 > _e144) {
                {
                    let _e146 = wa;
                    wb = _e146;
                    let _e147 = ia;
                    ib = _e147;
                    let _e148 = v_3;
                    wa = _e148;
                    let _e149 = i_1;
                    ia = _e149;
                }
            } else {
                let _e150 = v_3;
                let _e151 = wb;
                if (_e150 > _e151) {
                    {
                        let _e153 = v_3;
                        wb = _e153;
                        let _e154 = i_1;
                        ib = _e154;
                    }
                }
            }
        }
        continuing {
            let _e136 = i_1;
            i_1 = (_e136 + 1i);
        }
    }
    let _e155 = wb;
    wb = max(_e155, 0f);
    let _e161 = n_8;
    r = MatS(vec3(1f), 0.5f, _e161, 0.8f, 1f);
    let _e166 = wa;
    if (_e166 <= 0f) {
        let _e169 = r;
        return _e169;
    }
    let _e173 = n_8;
    a_5 = MatS(vec3(1f), 0.5f, _e173, 0.8f, 1f);
    let _e178 = a_5;
    b_3 = _e178;
    let _e180 = a_5;
    aM = _e180;
    let _e182 = a_5;
    bM = _e182;
    let _e184 = p_5;
    pf = (_e184 / vec3(2f));
    let _e189 = dpx_1;
    dxf = (_e189 / vec3(2f));
    let _e194 = dpy_1;
    dyf = (_e194 / vec3(2f));
    let _e199 = pf;
    pm = ((_e199 * 0.125f) + vec3(0.37f));
    let _e206 = dxf;
    dxm = (_e206 * 0.125f);
    let _e210 = dyf;
    dym = (_e210 * 0.125f);
    let _e218 = kF_1;
    if (_e218 > 0f) {
        {
            let _e221 = ia;
            let _e223 = pf;
            let _e224 = dxf;
            let _e225 = dyf;
            let _e226 = n_8;
            let _e227 = PER;
            let _e228 = matSurf(f32(_e221), _e223, _e224, _e225, _e226, _e227);
            a_5 = _e228;
            let _e229 = wb;
            if (_e229 > 0.02f) {
                let _e232 = ib;
                let _e234 = pf;
                let _e235 = dxf;
                let _e236 = dyf;
                let _e237 = n_8;
                let _e238 = PER;
                let _e239 = matSurf(f32(_e232), _e234, _e235, _e236, _e237, _e238);
                b_3 = _e239;
            }
        }
    }
    let _e240 = kM_1;
    if (_e240 > 0f) {
        {
            let _e243 = ia;
            let _e245 = pm;
            let _e246 = dxm;
            let _e247 = dym;
            let _e248 = n_8;
            let _e249 = PER;
            let _e252 = matSurf(f32(_e243), _e245, _e246, _e247, _e248, (_e249 * 0.125f));
            aM = _e252;
            let _e253 = wb;
            if (_e253 > 0.02f) {
                let _e256 = ib;
                let _e258 = pm;
                let _e259 = dxm;
                let _e260 = dym;
                let _e261 = n_8;
                let _e262 = PER;
                let _e265 = matSurf(f32(_e256), _e258, _e259, _e260, _e261, (_e262 * 0.125f));
                bM = _e265;
            }
        }
    }
    let _e294 = kF_1;
    let _e295 = ia;
    let _e297 = NF[_e295];
    fA = (_e294 * _e297);
    let _e300 = kM_1;
    let _e301 = ia;
    let _e303 = NM[_e301];
    mA = (_e300 * _e303);
    let _e306 = kF_1;
    let _e307 = ib;
    let _e309 = NF[_e307];
    fB = (_e306 * _e309);
    let _e312 = kM_1;
    let _e313 = ib;
    let _e315 = NM[_e313];
    mB = (_e312 * _e315);
    let _e320 = a_5;
    let _e322 = kF_1;
    let _e327 = aM;
    let _e329 = kM_1;
    let _e331 = ia;
    let _e333 = NM[_e331];
    rA = (mix(vec3(1f), _e320.ratio, vec3(_e322)) * mix(vec3(1f), _e327.ratio, vec3((_e329 * min(1f, (_e333 * 1.4f))))));
    let _e344 = b_3;
    let _e346 = kF_1;
    let _e351 = bM;
    let _e353 = kM_1;
    let _e355 = ib;
    let _e357 = NM[_e355];
    rB = (mix(vec3(1f), _e344.ratio, vec3(_e346)) * mix(vec3(1f), _e351.ratio, vec3((_e353 * min(1f, (_e357 * 1.4f))))));
    let _e366 = n_8;
    let _e367 = a_5;
    let _e369 = n_8;
    let _e371 = fA;
    let _e374 = aM;
    let _e376 = n_8;
    let _e378 = mA;
    nA = normalize(((_e366 + ((_e367.n - _e369) * _e371)) + ((_e374.n - _e376) * _e378)));
    let _e383 = n_8;
    let _e384 = b_3;
    let _e386 = n_8;
    let _e388 = fB;
    let _e391 = bM;
    let _e393 = n_8;
    let _e395 = mB;
    nB = normalize(((_e383 + ((_e384.n - _e386) * _e388)) + ((_e391.n - _e393) * _e395)));
    let _e400 = aM;
    let _e402 = a_5;
    let _e404 = kF_1;
    hA = mix(_e400.h, _e402.h, _e404);
    let _e407 = bM;
    let _e409 = b_3;
    let _e411 = kF_1;
    hB = mix(_e407.h, _e409.h, _e411);
    let _e414 = aM;
    let _e416 = a_5;
    let _e418 = kF_1;
    roA = mix(_e414.rough, _e416.rough, _e418);
    let _e421 = bM;
    let _e423 = b_3;
    let _e425 = kF_1;
    roB = mix(_e421.rough, _e423.rough, _e425);
    let _e428 = aM;
    let _e430 = a_5;
    let _e432 = kF_1;
    aoA = mix(_e428.ao, _e430.ao, _e432);
    let _e435 = bM;
    let _e437 = b_3;
    let _e439 = kF_1;
    aoB = mix(_e435.ao, _e437.ao, _e439);
    let _e442 = wa;
    let _e443 = wb;
    sw = (_e442 + _e443);
    let _e446 = wa;
    let _e447 = sw;
    fa = (_e446 / _e447);
    let _e450 = wb;
    let _e451 = sw;
    fb = (_e450 / _e451);
    let _e454 = hA;
    let _e457 = fa;
    let _e459 = hB;
    let _e462 = fb;
    m = (max(((_e454 * 0.6f) + _e457), ((_e459 * 0.6f) + _e462)) - 0.2f);
    let _e468 = hA;
    let _e471 = fa;
    let _e473 = m;
    ba = max((((_e468 * 0.6f) + _e471) - _e473), 0f);
    let _e478 = hB;
    let _e481 = fb;
    let _e483 = m;
    bb = max((((_e478 * 0.6f) + _e481) - _e483), 0f);
    let _e488 = ba;
    let _e489 = ba;
    let _e490 = bb;
    t_2 = (_e488 / max((_e489 + _e490), 0.0001f));
    let _e496 = sw;
    on = clamp((_e496 * 1.5f), 0f, 1f);
    let _e506 = rB;
    let _e507 = rA;
    let _e508 = t_2;
    let _e511 = on;
    r.ratio = mix(vec3(1f), mix(_e506, _e507, vec3(_e508)), vec3(_e511));
    let _e515 = n_8;
    let _e516 = nB;
    let _e517 = nA;
    let _e518 = t_2;
    let _e522 = on;
    r.n = normalize(mix(_e515, normalize(mix(_e516, _e517, vec3(_e518))), vec3(_e522)));
    let _e527 = hB;
    let _e528 = hA;
    let _e529 = t_2;
    r.h = mix(_e527, _e528, _e529);
    let _e533 = roB;
    let _e534 = roA;
    let _e535 = t_2;
    let _e537 = on;
    r.rough = mix(0.8f, mix(_e533, _e534, _e535), _e537);
    let _e541 = aoB;
    let _e542 = aoA;
    let _e543 = t_2;
    let _e545 = on;
    r.ao = mix(1f, mix(_e541, _e542, _e543), _e545);
    let _e547 = r;
    return _e547;
}

fn main_1() {
    var foot: f32;
    var uvDx: vec2<f32>;
    var uvDy: vec2<f32>;
    var fdx: vec3<f32>;
    var fdy: vec3<f32>;
    var N: vec3<f32>;
    var rel: vec3<f32>;
    var r_1: f32;
    var up: vec3<f32>;
    var muS: f32;
    var pF_3: vec3<f32>;
    var skyBl: f32;
    var skyK: f32;
    var local_17: vec3<f32>;
    var albedo_2: vec3<f32>;
    var lt: vec4<f32>;
    var tx: vec2<f32>;
    var ddx: vec2<f32>;
    var ddy: vec2<f32>;
    var mip: f32;
    var seam: f32 = 0f;
    var sn1_: f32;
    var sn2_: f32;
    var sn3_: f32;
    var soilK: f32;
    var grain: f32;
    var soil: vec3<f32>;
    var sm: MatS;
    var dW: f32;
    var kF_2: f32;
    var kM_2: f32;
    var ao_2: f32;
    var aoD: f32;
    var snowK: f32 = 0f;
    var clump: f32;
    var Ng: vec3<f32>;
    var face: f32;
    var open: f32;
    var local_18: f32;
    var local_19: f32;

    let _e76 = vWorld_1;
    let _e77 = fwidth(_e76);
    foot = length(_e77);
    let _e80 = vUv_1;
    let _e81 = dpdx(_e80);
    uvDx = _e81;
    let _e83 = vUv_1;
    let _e84 = dpdy(_e83);
    uvDy = _e84;
    let _e86 = global.uToFixed;
    let _e87 = vWorld_1;
    let _e88 = dpdx(_e87);
    fdx = (_e86 * _e88);
    let _e91 = global.uToFixed;
    let _e92 = vWorld_1;
    let _e93 = dpdy(_e92);
    fdy = (_e91 * _e93);
    let _e96 = vNormal_1;
    N = normalize(_e96);
    let _e100 = gl_FrontFacing_1;
    if !(_e100) {
        let _e102 = N;
        N = -(_e102);
    }
    let _e104 = vWorld_1;
    let _e105 = global.uCenter;
    rel = (_e104 - _e105);
    let _e108 = rel;
    r_1 = length(_e108);
    let _e111 = rel;
    let _e112 = r_1;
    up = (_e111 / vec3(_e112));
    let _e116 = up;
    let _e117 = global.uSunDir;
    muS = dot(_e116, _e117);
    let _e120 = global.uToFixed;
    let _e121 = rel;
    pF_3 = (_e120 * _e121);
    let _e124 = vWorld_1;
    let _e125 = skyBlocked(_e124);
    skyBl = _e125;
    let _e128 = skyBl;
    skyK = (1f - _e128);
    let _e131 = vPart_1;
    if (_e131 < 0.5f) {
        let _e134 = global.uTrunk;
        local_17 = _e134;
    } else {
        let _e135 = vTint_1;
        local_17 = _e135;
    }
    let _e137 = local_17;
    albedo_2 = _e137;
    let _e139 = global.uTex;
    if (_e139 > 0.5f) {
        {
            let _e142 = vPart_1;
            if (_e142 < 0.5f) {
                let _e145 = global.uTrunk;
                let _e148 = vUv_1;
                let _e149 = uvDx;
                let _e150 = uvDy;
                let _e151 = textureSampleGrad(tBarkTexture, tBarkSampler, _e148, _e149, _e150);
                albedo_2 = ((_e145 * 2.4f) * _e151.xyz);
            } else {
                let _e154 = vPart_1;
                if (_e154 < 1.5f) {
                    {
                        let _e157 = vUv_1;
                        let _e158 = uvDx;
                        let _e159 = uvDy;
                        let _e160 = textureSampleGrad(tLeafTexture, tLeafSampler, _e157, _e158, _e159);
                        lt = _e160;
                        let _e162 = vUv_1;
                        let _e164 = textureDimensions(tLeafTexture, 0i);
                        tx = (_e162 * vec2<f32>(vec2<i32>(_e164)));
                        let _e169 = uvDx;
                        let _e171 = textureDimensions(tLeafTexture, 0i);
                        ddx = (_e169 * vec2<f32>(vec2<i32>(_e171)));
                        let _e176 = uvDy;
                        let _e178 = textureDimensions(tLeafTexture, 0i);
                        ddy = (_e176 * vec2<f32>(vec2<i32>(_e178)));
                        let _e185 = ddx;
                        let _e186 = ddx;
                        let _e188 = ddy;
                        let _e189 = ddy;
                        mip = max(0f, (0.5f * log2(max(dot(_e185, _e186), dot(_e188, _e189)))));
                        let _e196 = lt;
                        let _e200 = mip;
                        if ((_e196.w * (1f + (0.3f * _e200))) < 0.5f) {
                            discard;
                        }
                        let _e206 = vTint_1;
                        let _e209 = lt;
                        albedo_2 = (_e206 * (0.35f + (1.5f * dot(_e209.xyz, vec3<f32>(0.3f, 0.59f, 0.11f)))));
                    }
                }
            }
        }
    }
    let _e221 = vPart_1;
    if (_e221 < 0.5f) {
        {
            let _e224 = vLocal_1;
            let _e228 = textureSampleLevel(tNoiseTexture, tNoiseSampler, (_e224 * 1.3f), 0f);
            sn1_ = _e228.x;
            let _e231 = vLocal_1;
            let _e238 = textureSampleLevel(tNoiseTexture, tNoiseSampler, ((_e231 * 5f) + vec3(3.1f)), 0f);
            sn2_ = _e238.x;
            let _e241 = vLocal_1;
            let _e248 = textureSampleLevel(tNoiseTexture, tNoiseSampler, ((_e241 * 17f) + vec3(7.7f)), 0f);
            sn3_ = _e248.x;
            let _e254 = vSnow_1;
            let _e257 = sn1_;
            let _e263 = sn2_;
            let _e269 = sn3_;
            soilK = (1f - smoothstep(0.02f, 0.32f, (((_e254.z - (0.3f * (_e257 - 0.5f))) - (0.16f * (_e263 - 0.5f))) - (0.06f * (_e269 - 0.5f)))));
            let _e277 = albedo_2;
            let _e283 = global.uTrunk;
            grain = (dot(_e277, vec3<f32>(0.3f, 0.59f, 0.11f)) / max(dot((_e283 * 1.2f), vec3<f32>(0.3f, 0.59f, 0.11f)), 0.0001f));
            let _e295 = global.uSoilCol;
            let _e298 = grain;
            let _e307 = sn3_;
            soil = ((_e295 * clamp((0.55f + (0.5f * _e298)), 0.4f, 1.4f)) * (0.7f + (0.6f * _e307)));
            let _e312 = albedo_2;
            let _e313 = soil;
            let _e314 = soilK;
            albedo_2 = mix(_e312, _e313, vec3((_e314 * 0.8f)));
            let _e322 = vSnow_1;
            let _e325 = sn1_;
            let _e331 = sn3_;
            seam = (1f - smoothstep(0f, 0.2f, ((_e322.z + (0.08f * (_e325 - 0.5f))) + (0.04f * (_e331 - 0.5f)))));
        }
    }
    let _e341 = pF_3;
    sm = MatS(vec3(1f), 0.5f, normalize(_e341), 0.8f, 1f);
    let _e347 = seam;
    if (_e347 > 0f) {
        {
            let _e350 = vWorld_1;
            dW = length(_e350);
            let _e356 = dW;
            kF_2 = (1f - smoothstep(60f, 260f, _e356));
            let _e363 = dW;
            let _e370 = dW;
            kM_2 = ((1f - smoothstep(1800f, 3500f, _e363)) * mix(0.6f, 1f, smoothstep(5f, 60f, _e370)));
            let _e384 = pF_3;
            const _e386 = vec3(4096f);
            let _e391 = fdx;
            let _e392 = fdy;
            let _e393 = pF_3;
            let _e395 = kF_2;
            let _e396 = kM_2;
            let _e397 = matGround(vec4(0f), vec4(0f), vec4<f32>(1f, 0f, 0f, 0f), (_e384 - (floor((_e384 / _e386)) * _e386)), _e391, _e392, normalize(_e393), _e395, _e396);
            sm = _e397;
            let _e398 = albedo_2;
            let _e399 = global.uSoilCol;
            let _e400 = sm;
            let _e403 = seam;
            albedo_2 = mix(_e398, (_e399 * _e400.ratio), vec3(_e403));
            let _e406 = N;
            let _e407 = global.uToFixed;
            let _e409 = sm;
            let _e412 = seam;
            N = normalize(mix(_e406, (transpose(_e407) * _e409.n), vec3(_e412)));
            let _e416 = skyK;
            let _e418 = vWorld_1;
            let _e419 = trunkSky(_e418);
            let _e420 = seam;
            skyK = (_e416 * mix(1f, _e419, _e420));
        }
    }
    let _e423 = vAo_1;
    let _e424 = sm;
    let _e426 = seam;
    ao_2 = mix(_e423, _e424.ao, _e426);
    let _e429 = vAo_1;
    let _e431 = sm;
    let _e435 = seam;
    aoD = mix(_e429, mix(1f, _e431.ao, 0.35f), _e435);
    let _e440 = vSnow_1;
    let _e442 = vSnow_1;
    if ((_e440.x + _e442.y) > 0f) {
        {
            let _e447 = vLocal_1;
            let _e451 = textureSampleLevel(tNoiseTexture, tNoiseSampler, (_e447 * 0.9f), 0f);
            clump = _e451.x;
            let _e454 = vNormal_1;
            Ng = normalize(_e454);
            let _e457 = vPart_1;
            if (_e457 < 0.5f) {
                {
                    let _e460 = vSnow_1;
                    let _e464 = Ng;
                    let _e465 = up;
                    let _e473 = clump;
                    snowK = ((_e460.x * smoothstep(0.12f, 0.4f, dot(_e464, _e465))) * smoothstep(0.1f, 0.4f, (0.3f + (0.7f * _e473))));
                }
            } else {
                {
                    let _e480 = Ng;
                    let _e481 = up;
                    face = (0.65f + (0.35f * dot(_e480, _e481)));
                    let _e488 = skyBl;
                    let _e495 = vTop_1;
                    open = ((1f - (0.6f * _e488)) * (0.6f + (0.4f * smoothstep(0.2f, 0.8f, _e495))));
                    let _e501 = vSnow_1;
                    let _e505 = open;
                    let _e506 = face;
                    let _e510 = clump;
                    snowK = (_e501.x * smoothstep(0.22f, 0.5f, ((_e505 * _e506) * (0.55f + (0.9f * _e510)))));
                }
            }
            let _e516 = snowK;
            let _e518 = vSnow_1;
            let _e522 = vSnow_1;
            let _e526 = vSnow_1;
            snowK = max(_e516, (1f - smoothstep((_e518.y - 0.03f), (_e522.y + 0.03f), _e526.z)));
            let _e531 = albedo_2;
            let _e532 = global.uSnowCol;
            let _e533 = snowK;
            let _e534 = vPart_1;
            let _e537 = vPart_1;
            if ((_e534 > 0.5f) && (_e537 < 1.5f)) {
                local_18 = 0.9f;
            } else {
                local_18 = 1f;
            }
            let _e544 = local_18;
            albedo_2 = mix(_e531, _e532, vec3((_e533 * _e544)));
        }
    }
    let _e548 = albedo_2;
    let _e549 = N;
    let _e551 = ao_2;
    let _e552 = vPart_1;
    let _e555 = vPart_1;
    if ((_e552 > 0.5f) && (_e555 < 1.5f)) {
        local_19 = 0.35f;
    } else {
        local_19 = 0f;
    }
    let _e562 = local_19;
    let _e564 = snowK;
    materialOutput(_e548, _e549, 0.8f, _e551, (_e562 * (1f - _e564)), 0f, 0.04f);
    return;
}

@fragment 
fn main(@location(0) vUv: vec2<f32>, @location(1) vWorld: vec3<f32>, @location(2) vNormal: vec3<f32>, @location(3) vPart: f32, @location(4) vAo: f32, @location(5) vTint: vec3<f32>, @location(6) vDist: f32, @location(7) vSnow: vec3<f32>, @location(8) vLocal: vec3<f32>, @location(9) vTop: f32, @builtin(front_facing) gl_FrontFacing: bool) -> FragmentOutput {
    vUv_1 = vUv;
    vWorld_1 = vWorld;
    vNormal_1 = vNormal;
    vPart_1 = vPart;
    vAo_1 = vAo;
    vTint_1 = vTint;
    vDist_1 = vDist;
    vSnow_1 = vSnow;
    vLocal_1 = vLocal;
    vTop_1 = vTop;
    gl_FrontFacing_1 = gl_FrontFacing;
    main_1();
    let _e135 = gAlbedo;
    let _e137 = gNormal;
    let _e139 = gEmission;
    let _e141 = gSurface;
    return FragmentOutput(_e135, _e137, _e139, _e141);
}
`;
