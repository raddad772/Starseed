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
      "name": "uToFixed",
      "type": "mat3",
      "count": 0,
      "align": 16,
      "size": 48,
      "stride": 48,
      "offset": 80
    },
    {
      "name": "uSkyShadow",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 128
    },
    {
      "name": "uSkyShadowVP0",
      "type": "mat4",
      "count": 0,
      "align": 16,
      "size": 64,
      "stride": 64,
      "offset": 144
    },
    {
      "name": "uSkyShadowVP1",
      "type": "mat4",
      "count": 0,
      "align": 16,
      "size": 64,
      "stride": 64,
      "offset": 208
    },
    {
      "name": "uSkyShadowL0",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 272
    },
    {
      "name": "uSkyShadowL1",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 288
    },
    {
      "name": "uSkyShadowUp0",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 304
    },
    {
      "name": "uSkyShadowUp1",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 320
    },
    {
      "name": "uSkyCenter",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 336
    },
    {
      "name": "uSkyToFixed",
      "type": "mat3",
      "count": 0,
      "align": 16,
      "size": 48,
      "stride": 48,
      "offset": 352
    },
    {
      "name": "uSkyD",
      "type": "vec2",
      "count": 0,
      "align": 8,
      "size": 8,
      "stride": 8,
      "offset": 400
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
      "name": "tSkyRings",
      "type": "sampler2D",
      "count": 0,
      "binding": 7,
      "samplerBinding": 8
    }
  ],
  "bytes": 416,
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
    uToFixed: mat3x3<f32>,
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
var tSkyRingsTexture: texture_2d<f32>;
@group(1) @binding(8) 
var tSkyRingsSampler: sampler;
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
    let _e49 = n_1;
    let _e50 = n_1;
    let _e53 = n_1;
    let _e57 = n_1;
    n_1 = (_e49 / vec3(((abs(_e50.x) + abs(_e53.y)) + abs(_e57.z))));
    let _e63 = n_1;
    if (_e63.z >= 0f) {
        let _e67 = n_1;
        local_2 = _e67.xy;
    } else {
        let _e70 = n_1;
        let _e75 = n_1;
        if (_e75.x >= 0f) {
            local = 1f;
        } else {
            local = -1f;
        }
        let _e83 = local;
        let _e84 = n_1;
        if (_e84.y >= 0f) {
            local_1 = 1f;
        } else {
            local_1 = -1f;
        }
        let _e92 = local_1;
        local_2 = ((vec2(1f) - abs(_e70.yx)) * vec2<f32>(_e83, _e92));
    }
    let _e96 = local_2;
    return _e96;
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
    let _e61 = albedo_1;
    let _e66 = clamp(_e61, vec3(0f), vec3(1f));
    let _e67 = ao_1;
    gAlbedo = vec4<f32>(_e66.x, _e66.y, _e66.z, clamp(_e67, 0f, 1f));
    let _e75 = normal_1;
    let _e77 = octEncode(normalize(_e75));
    let _e78 = roughness_1;
    let _e79 = global.uBodyIndex;
    gNormal = vec4<f32>(_e77.x, _e77.y, _e78, _e79);
    gEmission = vec4<f32>(0f, 0f, 0f, 1f);
    let _e88 = trans_1;
    let _e89 = wet_1;
    let _e91 = F0_1;
    gSurface = vec4<f32>(_e88, _e89, 0f, _e91);
    return;
}

fn skyRing(sc: vec2<f32>, d: f32, D: f32, a: f32, b: f32) -> f32 {
    var sc_1: vec2<f32>;
    var d_1: f32;
    var D_1: f32;
    var a_1: f32;
    var b_1: f32;
    var dh: f32;
    var h2_: f32;

    sc_1 = sc;
    d_1 = d;
    D_1 = D;
    a_1 = a;
    b_1 = b;
    let _e72 = sc_1;
    if (_e72.x <= 0.003f) {
        return 0f;
    }
    let _e77 = d_1;
    let _e78 = D_1;
    let _e79 = sc_1;
    let _e81 = sc_1;
    dh = (_e77 - (_e78 + (_e79.y / _e81.x)));
    let _e87 = dh;
    if (_e87 <= 0f) {
        return 0f;
    }
    let _e91 = dh;
    let _e92 = dh;
    h2_ = (_e91 * _e92);
    let _e95 = sc_1;
    let _e97 = b_1;
    let _e98 = b_1;
    let _e100 = b_1;
    let _e101 = b_1;
    let _e103 = h2_;
    let _e106 = a_1;
    let _e107 = a_1;
    let _e109 = a_1;
    let _e110 = a_1;
    let _e112 = h2_;
    return (_e95.x * (((_e97 * _e98) / ((_e100 * _e101) + _e103)) - ((_e106 * _e107) / (((_e109 * _e110) + _e112) + 0.000001f))));
}

fn skyShadowMap(u0_: f32, D_2: f32, VP: mat4x4<f32>, L: vec4<f32>, upF: vec3<f32>, ext: f32, pF: vec3<f32>) -> f32 {
    var u0_1: f32;
    var D_3: f32;
    var VP_1: mat4x4<f32>;
    var L_1: vec4<f32>;
    var upF_1: vec3<f32>;
    var ext_1: f32;
    var pF_1: vec3<f32>;
    var c: vec4<f32>;
    var uv: vec2<f32>;
    var edge: f32;
    var NB: f32 = 6f;
    var x0_: f32;
    var C: vec4<f32>;
    var A: vec4<f32>;
    var B: vec4<f32>;
    var d_2: f32;

    u0_1 = u0_;
    D_3 = D_2;
    VP_1 = VP;
    L_1 = L;
    upF_1 = upF;
    ext_1 = ext;
    pF_1 = pF;
    let _e76 = VP_1;
    let _e77 = pF_1;
    c = (_e76 * vec4<f32>(_e77.x, _e77.y, _e77.z, 1f));
    let _e85 = c;
    let _e87 = c;
    uv = (((_e85.xy / vec2(_e87.w)) * 0.5f) + vec2(0.5f));
    let _e99 = ext_1;
    edge = (45f / (2f * _e99));
    let _e103 = uv;
    let _e104 = edge;
    let _e108 = uv;
    let _e110 = edge;
    if (any((_e103 < vec2(_e104))) || any((_e108 > vec2((1f - _e110))))) {
        return -1f;
    }
    let _e118 = uv;
    uv = clamp(_e118, vec2(0.0009765625f), vec2(0.99902344f));
    let _e132 = u0_1;
    x0_ = (_e132 * 3f);
    let _e136 = x0_;
    let _e139 = uv;
    let _e142 = NB;
    let _e144 = uv;
    let _e148 = textureSampleLevel(tSkyRingsTexture, tSkyRingsSampler, vec2<f32>((((_e136 + 2f) + _e139.x) / _e142), _e144.y), 0f);
    C = _e148;
    let _e150 = C;
    if (_e150.z < 0.002f) {
        return 0f;
    }
    let _e155 = x0_;
    let _e156 = uv;
    let _e159 = NB;
    let _e161 = uv;
    let _e165 = textureSampleLevel(tSkyRingsTexture, tSkyRingsSampler, vec2<f32>(((_e155 + _e156.x) / _e159), _e161.y), 0f);
    A = _e165;
    let _e167 = x0_;
    let _e170 = uv;
    let _e173 = NB;
    let _e175 = uv;
    let _e179 = textureSampleLevel(tSkyRingsTexture, tSkyRingsSampler, vec2<f32>((((_e167 + 1f) + _e170.x) / _e173), _e175.y), 0f);
    B = _e179;
    let _e181 = L_1;
    let _e183 = pF_1;
    let _e185 = upF_1;
    let _e189 = L_1;
    d_2 = (dot((_e181.xyz - _e183), _e185) - (0.3f + (1.5f * _e189.w)));
    let _e195 = A;
    let _e197 = d_2;
    let _e198 = D_3;
    let _e201 = skyRing(_e195.xy, _e197, _e198, 0f, 1f);
    let _e202 = A;
    let _e204 = d_2;
    let _e205 = D_3;
    let _e208 = skyRing(_e202.zw, _e204, _e205, 1f, 3.5f);
    let _e210 = B;
    let _e212 = d_2;
    let _e213 = D_3;
    let _e216 = skyRing(_e210.xy, _e212, _e213, 3.5f, 9f);
    let _e218 = B;
    let _e220 = d_2;
    let _e221 = D_3;
    let _e224 = skyRing(_e218.zw, _e220, _e221, 9f, 20f);
    let _e226 = C;
    let _e228 = d_2;
    let _e229 = D_3;
    let _e232 = skyRing(_e226.xy, _e228, _e229, 20f, 45f);
    return clamp(((((_e201 + _e208) + _e216) + _e224) + _e232), 0f, 1f);
}

fn skyBlocked(wp: vec3<f32>) -> f32 {
    var wp_1: vec3<f32>;
    var dist: f32;
    var pF_2: vec3<f32>;
    var bl: f32 = -1f;

    wp_1 = wp;
    let _e64 = global.uSkyShadow;
    if (_e64.x < 0.5f) {
        return 0f;
    }
    let _e69 = wp_1;
    dist = length(_e69);
    let _e72 = dist;
    let _e73 = global.uSkyShadow;
    if (_e72 > _e73.z) {
        return 0f;
    }
    let _e77 = global.uSkyToFixed;
    let _e78 = wp_1;
    let _e79 = global.uSkyCenter;
    pF_2 = (_e77 * (_e78 - _e79));
    let _e86 = dist;
    let _e87 = global.uSkyShadow;
    if (_e86 < _e87.y) {
        let _e91 = global.uSkyD;
        let _e93 = global.uSkyShadowVP0_;
        let _e94 = global.uSkyShadowL0_;
        let _e95 = global.uSkyShadowUp0_;
        let _e96 = global.uSkyShadow;
        let _e98 = pF_2;
        let _e99 = skyShadowMap(0f, _e91.x, _e93, _e94, _e95, _e96.y, _e98);
        bl = _e99;
    }
    let _e100 = bl;
    if (_e100 < 0f) {
        let _e104 = global.uSkyD;
        let _e106 = global.uSkyShadowVP1_;
        let _e107 = global.uSkyShadowL1_;
        let _e108 = global.uSkyShadowUp1_;
        let _e109 = global.uSkyShadow;
        let _e111 = pF_2;
        let _e112 = skyShadowMap(1f, _e104.y, _e106, _e107, _e108, _e109.z, _e111);
        bl = _e112;
    }
    let _e113 = bl;
    if (_e113 < 0f) {
        return 0f;
    }
    let _e117 = bl;
    let _e120 = global.uSkyShadow;
    let _e123 = global.uSkyShadow;
    let _e125 = dist;
    return (_e117 * (1f - smoothstep((0.8f * _e120.z), _e123.z, _e125)));
}

fn main_1() {
    var foot: f32;
    var uvDx: vec2<f32>;
    var uvDy: vec2<f32>;
    var fdx: vec3<f32>;
    var fdy: vec3<f32>;
    var N: vec3<f32>;
    var rel: vec3<f32>;
    var r: f32;
    var up: vec3<f32>;
    var muS: f32;
    var pF_3: vec3<f32>;
    var skyBl: f32;
    var skyK: f32;
    var local_3: vec3<f32>;
    var albedo_2: vec3<f32>;
    var lt: vec4<f32>;
    var tx: vec2<f32>;
    var ddx: vec2<f32>;
    var ddy: vec2<f32>;
    var mip: f32;
    var ao_2: f32;
    var snowK: f32 = 0f;
    var clump: f32;
    var Ng: vec3<f32>;
    var face: f32;
    var open: f32;
    var local_4: f32;
    var local_5: f32;

    let _e62 = vWorld_1;
    let _e63 = fwidth(_e62);
    foot = length(_e63);
    let _e66 = vUv_1;
    let _e67 = dpdx(_e66);
    uvDx = _e67;
    let _e69 = vUv_1;
    let _e70 = dpdy(_e69);
    uvDy = _e70;
    let _e72 = global.uToFixed;
    let _e73 = vWorld_1;
    let _e74 = dpdx(_e73);
    fdx = (_e72 * _e74);
    let _e77 = global.uToFixed;
    let _e78 = vWorld_1;
    let _e79 = dpdy(_e78);
    fdy = (_e77 * _e79);
    let _e82 = vNormal_1;
    N = normalize(_e82);
    let _e86 = gl_FrontFacing_1;
    if !(_e86) {
        let _e88 = N;
        N = -(_e88);
    }
    let _e90 = vWorld_1;
    let _e91 = global.uCenter;
    rel = (_e90 - _e91);
    let _e94 = rel;
    r = length(_e94);
    let _e97 = rel;
    let _e98 = r;
    up = (_e97 / vec3(_e98));
    let _e102 = up;
    let _e103 = global.uSunDir;
    muS = dot(_e102, _e103);
    let _e106 = global.uToFixed;
    let _e107 = rel;
    pF_3 = (_e106 * _e107);
    let _e110 = vWorld_1;
    let _e111 = skyBlocked(_e110);
    skyBl = _e111;
    let _e114 = skyBl;
    skyK = (1f - _e114);
    let _e117 = vPart_1;
    if (_e117 < 0.5f) {
        let _e120 = global.uTrunk;
        local_3 = _e120;
    } else {
        let _e121 = vTint_1;
        local_3 = _e121;
    }
    let _e123 = local_3;
    albedo_2 = _e123;
    let _e125 = global.uTex;
    if (_e125 > 0.5f) {
        {
            let _e128 = vPart_1;
            if (_e128 < 0.5f) {
                let _e131 = global.uTrunk;
                let _e134 = vUv_1;
                let _e135 = uvDx;
                let _e136 = uvDy;
                let _e137 = textureSampleGrad(tBarkTexture, tBarkSampler, _e134, _e135, _e136);
                albedo_2 = ((_e131 * 2.4f) * _e137.xyz);
            } else {
                let _e140 = vPart_1;
                if (_e140 < 1.5f) {
                    {
                        let _e143 = vUv_1;
                        let _e144 = uvDx;
                        let _e145 = uvDy;
                        let _e146 = textureSampleGrad(tLeafTexture, tLeafSampler, _e143, _e144, _e145);
                        lt = _e146;
                        let _e148 = vUv_1;
                        let _e150 = textureDimensions(tLeafTexture, 0i);
                        tx = (_e148 * vec2<f32>(vec2<i32>(_e150)));
                        let _e155 = uvDx;
                        let _e157 = textureDimensions(tLeafTexture, 0i);
                        ddx = (_e155 * vec2<f32>(vec2<i32>(_e157)));
                        let _e162 = uvDy;
                        let _e164 = textureDimensions(tLeafTexture, 0i);
                        ddy = (_e162 * vec2<f32>(vec2<i32>(_e164)));
                        let _e171 = ddx;
                        let _e172 = ddx;
                        let _e174 = ddy;
                        let _e175 = ddy;
                        mip = max(0f, (0.5f * log2(max(dot(_e171, _e172), dot(_e174, _e175)))));
                        let _e182 = lt;
                        let _e186 = mip;
                        if ((_e182.w * (1f + (0.3f * _e186))) < 0.5f) {
                            discard;
                        }
                        let _e192 = vTint_1;
                        let _e195 = lt;
                        albedo_2 = (_e192 * (0.35f + (1.5f * dot(_e195.xyz, vec3<f32>(0.3f, 0.59f, 0.11f)))));
                    }
                }
            }
        }
    }
    let _e205 = vAo_1;
    ao_2 = _e205;
    let _e209 = vSnow_1;
    let _e211 = vSnow_1;
    if ((_e209.x + _e211.y) > 0f) {
        {
            let _e216 = vLocal_1;
            let _e220 = textureSampleLevel(tNoiseTexture, tNoiseSampler, (_e216 * 0.9f), 0f);
            clump = _e220.x;
            let _e223 = vNormal_1;
            Ng = normalize(_e223);
            let _e226 = vPart_1;
            if (_e226 < 0.5f) {
                {
                    let _e229 = vSnow_1;
                    let _e233 = Ng;
                    let _e234 = up;
                    let _e242 = clump;
                    snowK = ((_e229.x * smoothstep(0.12f, 0.4f, dot(_e233, _e234))) * smoothstep(0.1f, 0.4f, (0.3f + (0.7f * _e242))));
                }
            } else {
                {
                    let _e249 = Ng;
                    let _e250 = up;
                    face = (0.65f + (0.35f * dot(_e249, _e250)));
                    let _e257 = skyBl;
                    let _e264 = vTop_1;
                    open = ((1f - (0.6f * _e257)) * (0.6f + (0.4f * smoothstep(0.2f, 0.8f, _e264))));
                    let _e270 = vSnow_1;
                    let _e274 = open;
                    let _e275 = face;
                    let _e279 = clump;
                    snowK = (_e270.x * smoothstep(0.22f, 0.5f, ((_e274 * _e275) * (0.55f + (0.9f * _e279)))));
                }
            }
            let _e285 = snowK;
            let _e287 = vSnow_1;
            let _e291 = vSnow_1;
            let _e295 = vSnow_1;
            snowK = max(_e285, (1f - smoothstep((_e287.y - 0.03f), (_e291.y + 0.03f), _e295.z)));
            let _e300 = albedo_2;
            let _e301 = global.uSnowCol;
            let _e302 = snowK;
            let _e303 = vPart_1;
            let _e306 = vPart_1;
            if ((_e303 > 0.5f) && (_e306 < 1.5f)) {
                local_4 = 0.9f;
            } else {
                local_4 = 1f;
            }
            let _e313 = local_4;
            albedo_2 = mix(_e300, _e301, vec3((_e302 * _e313)));
        }
    }
    let _e317 = albedo_2;
    let _e318 = N;
    let _e320 = ao_2;
    let _e321 = vPart_1;
    let _e324 = vPart_1;
    if ((_e321 > 0.5f) && (_e324 < 1.5f)) {
        local_5 = 0.35f;
    } else {
        local_5 = 0f;
    }
    let _e331 = local_5;
    let _e333 = snowK;
    materialOutput(_e317, _e318, 0.8f, _e320, (_e331 * (1f - _e333)), 0f, 0.04f);
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
    let _e115 = gAlbedo;
    let _e117 = gNormal;
    let _e119 = gEmission;
    let _e121 = gSurface;
    return FragmentOutput(_e115, _e117, _e119, _e121);
}
`;
