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
      "name": "uCenter",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 16
    },
    {
      "name": "uToFixed",
      "type": "mat3",
      "count": 0,
      "align": 16,
      "size": 48,
      "stride": 48,
      "offset": 32
    },
    {
      "name": "uSeason",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 80
    },
    {
      "name": "uSnowCol",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 96
    },
    {
      "name": "uFrost",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 112
    }
  ],
  "textures": [
    {
      "name": "tSeasonMap",
      "type": "sampler2D",
      "count": 0,
      "binding": 1,
      "samplerBinding": 2
    },
    {
      "name": "tFrost",
      "type": "sampler2D",
      "count": 0,
      "binding": 3,
      "samplerBinding": 4
    },
    {
      "name": "tMatA",
      "type": "sampler2DArray",
      "count": 0,
      "binding": 5,
      "samplerBinding": 6
    },
    {
      "name": "tMatN",
      "type": "sampler2DArray",
      "count": 0,
      "binding": 7,
      "samplerBinding": 8
    }
  ],
  "bytes": 128,
  "group": 1,
  "attributes": []
};
export const code = /* wgsl */`
struct Params {
    uBodyIndex: f32,
    uCenter: vec3<f32>,
    uToFixed: mat3x3<f32>,
    uSeason: vec4<f32>,
    uSnowCol: vec3<f32>,
    uFrost: vec4<f32>,
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
const FROST_NL: f32 = 180f;
const FROST_NT: f32 = 9f;
const FROST_TILT0_: f32 = -40f;
const FROST_DTILT: f32 = 10f;
const SNOW_DEPTH_PER_MM: f32 = 0.003333f;
const DDF_SNOW: f32 = 4f;
const HC_N: array<vec3<f32>, 6> = array<vec3<f32>, 6>(vec3<f32>(1f, 0f, 0f), vec3<f32>(-1f, 0f, 0f), vec3<f32>(0f, 1f, 0f), vec3<f32>(0f, -1f, 0f), vec3<f32>(0f, 0f, 1f), vec3<f32>(0f, 0f, -1f));
const HC_U: array<vec3<f32>, 6> = array<vec3<f32>, 6>(vec3<f32>(0f, 0f, -1f), vec3<f32>(0f, 0f, 1f), vec3<f32>(1f, 0f, 0f), vec3<f32>(1f, 0f, 0f), vec3<f32>(1f, 0f, 0f), vec3<f32>(-1f, 0f, 0f));
const HC_V: array<vec3<f32>, 6> = array<vec3<f32>, 6>(vec3<f32>(0f, 1f, 0f), vec3<f32>(0f, 1f, 0f), vec3<f32>(0f, 0f, -1f), vec3<f32>(0f, 0f, 1f), vec3<f32>(0f, 1f, 0f), vec3<f32>(0f, 1f, 0f));

@group(1) @binding(0) 
var<uniform> global: Params;
@group(1) @binding(1) 
var tSeasonMapTexture: texture_2d<f32>;
@group(1) @binding(2) 
var tSeasonMapSampler: sampler;
@group(1) @binding(3) 
var tFrostTexture: texture_2d<f32>;
@group(1) @binding(4) 
var tFrostSampler: sampler;
@group(1) @binding(5) 
var tMatATexture: texture_2d_array<f32>;
@group(1) @binding(6) 
var tMatASampler: sampler;
@group(1) @binding(7) 
var tMatNTexture: texture_2d_array<f32>;
@group(1) @binding(8) 
var tMatNSampler: sampler;
var<private> gAlbedo: vec4<f32>;
var<private> gNormal: vec4<f32>;
var<private> gEmission: vec4<f32>;
var<private> gSurface: vec4<f32>;
var<private> vWorld_1: vec3<f32>;
var<private> vLocal_1: vec3<f32>;
var<private> vLocalN_1: vec3<f32>;
var<private> vAx_1: vec3<f32>;
var<private> vAy_1: vec3<f32>;
var<private> vAz_1: vec3<f32>;
var<private> vR_1: vec4<f32>;
var<private> vCol_1: vec3<f32>;
var<private> vTa_1: f32;
var<private> cloudDirZ: f32 = 1f;
var<private> cloudTotZ: f32 = 1f;

fn octEncode(n: vec3<f32>) -> vec2<f32> {
    var n_1: vec3<f32>;
    var local: f32;
    var local_1: f32;
    var local_2: vec2<f32>;

    n_1 = n;
    let _e27 = n_1;
    let _e28 = n_1;
    let _e31 = n_1;
    let _e35 = n_1;
    n_1 = (_e27 / vec3(((abs(_e28.x) + abs(_e31.y)) + abs(_e35.z))));
    let _e41 = n_1;
    if (_e41.z >= 0f) {
        let _e45 = n_1;
        local_2 = _e45.xy;
    } else {
        let _e48 = n_1;
        let _e53 = n_1;
        if (_e53.x >= 0f) {
            local = 1f;
        } else {
            local = -1f;
        }
        let _e61 = local;
        let _e62 = n_1;
        if (_e62.y >= 0f) {
            local_1 = 1f;
        } else {
            local_1 = -1f;
        }
        let _e70 = local_1;
        local_2 = ((vec2(1f) - abs(_e48.yx)) * vec2<f32>(_e61, _e70));
    }
    let _e74 = local_2;
    return _e74;
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
    let _e39 = albedo_1;
    let _e44 = clamp(_e39, vec3(0f), vec3(1f));
    let _e45 = ao_1;
    gAlbedo = vec4<f32>(_e44.x, _e44.y, _e44.z, clamp(_e45, 0f, 1f));
    let _e53 = normal_1;
    let _e55 = octEncode(normalize(_e53));
    let _e56 = roughness_1;
    let _e57 = global.uBodyIndex;
    gNormal = vec4<f32>(_e55.x, _e55.y, _e56, _e57);
    gEmission = vec4<f32>(0f, 0f, 0f, 1f);
    let _e66 = trans_1;
    let _e67 = wet_1;
    let _e69 = F0_1;
    gSurface = vec4<f32>(_e66, _e67, 0f, _e69);
    return;
}

fn seasonYear(dirF: vec3<f32>) -> vec3<f32> {
    var dirF_1: vec3<f32>;
    var m: vec4<f32>;

    dirF_1 = dirF;
    let _e36 = dirF_1;
    let _e38 = dirF_1;
    let _e45 = dirF_1;
    let _e58 = textureSampleLevel(tSeasonMapTexture, tSeasonMapSampler, vec2<f32>(((atan2(_e36.z, _e38.x) / 6.28319f) + 0.5f), ((asin(clamp(_e45.y, -1f, 1f)) / 3.14159f) + 0.5f)), 0f);
    m = _e58;
    let _e60 = m;
    let _e66 = m;
    let _e72 = m;
    let _e74 = m;
    return vec3<f32>(((_e60.x - 0.5f) * 100f), ((_e66.y - 0.5f) * 100f), ((_e72.z * _e74.z) * 600f));
}

fn seasonSWE(dirF_2: vec3<f32>, Ta: f32) -> f32 {
    var dirF_3: vec3<f32>;
    var Ta_1: f32;
    var yr: vec3<f32>;
    var a1_: f32;
    var b1_: f32;
    var P: f32;
    var A: f32;
    var local_3: f32;
    var th: f32;
    var acc: f32;
    var fall: f32;
    var mr: f32;
    var thaw: f32;
    var x: f32;

    dirF_3 = dirF_2;
    Ta_1 = Ta;
    let _e38 = dirF_3;
    let _e39 = seasonYear(_e38);
    yr = _e39;
    let _e41 = yr;
    a1_ = _e41.x;
    let _e44 = yr;
    b1_ = _e44.y;
    let _e47 = yr;
    P = _e47.z;
    let _e50 = a1_;
    let _e51 = b1_;
    A = length(vec2<f32>(_e50, _e51));
    let _e55 = Ta_1;
    let _e56 = A;
    if (_e55 >= _e56) {
        return 0f;
    }
    let _e59 = Ta_1;
    let _e60 = A;
    if (_e59 <= -(_e60)) {
        local_3 = 0f;
    } else {
        let _e64 = Ta_1;
        let _e66 = A;
        local_3 = acos(clamp((-(_e64) / _e66), -1f, 1f));
    }
    let _e74 = local_3;
    th = _e74;
    let _e77 = P;
    acc = ((12f * _e77) / 6.28319f);
    let _e82 = acc;
    let _e85 = th;
    fall = (_e82 * (6.28319f - (2f * _e85)));
    let _e90 = global.uSeason;
    mr = (_e90.y / 6.28319f);
    let _e95 = mr;
    let _e97 = Ta_1;
    let _e99 = th;
    let _e102 = A;
    let _e104 = th;
    thaw = (_e95 * (((2f * _e97) * _e99) + ((2f * _e102) * sin(_e104))));
    let _e110 = thaw;
    let _e113 = fall;
    if ((_e110 + 50f) <= _e113) {
        return 10000f;
    }
    let _e116 = th;
    if (_e116 <= 0f) {
        return 0f;
    }
    let _e120 = global.uSeason;
    let _e122 = b1_;
    let _e123 = a1_;
    x = (_e120.x - atan2(_e122, _e123));
    let _e127 = x;
    let _e129 = x;
    x = (_e127 - (6.28319f * floor(((_e129 + 3.14159f) / 6.28319f))));
    let _e137 = x;
    let _e138 = th;
    if (_e137 > _e138) {
        let _e140 = acc;
        let _e141 = x;
        let _e142 = th;
        return (_e140 * (_e141 - _e142));
    }
    let _e145 = x;
    let _e146 = th;
    if (_e145 < -(_e146)) {
        let _e149 = acc;
        let _e150 = x;
        let _e153 = th;
        return (_e149 * ((_e150 + 6.28319f) - _e153));
    }
    let _e157 = fall;
    let _e158 = mr;
    let _e159 = Ta_1;
    let _e160 = x;
    let _e161 = th;
    let _e164 = A;
    let _e165 = x;
    let _e167 = th;
    return max(0f, (_e157 - (_e158 * ((_e159 * (_e160 + _e161)) + (_e164 * (sin(_e165) + sin(_e167)))))));
}

fn seasonFrost(dirF_4: vec3<f32>, fn_: vec3<f32>, n_2: f32) -> f32 {
    var dirF_5: vec3<f32>;
    var fn_1: vec3<f32>;
    var n_3: f32;
    var sy: f32;
    var north: vec3<f32>;
    var nl: f32;
    var local_4: f32;
    var local_5: f32;
    var tilt: f32;
    var ft: f32;
    var t0_: f32;
    var v: f32;
    var u: f32;
    var m0_: f32;
    var m1_: f32;
    var m_1: f32;
    var c: f32;

    dirF_5 = dirF_4;
    fn_1 = fn_;
    n_3 = n_2;
    let _e44 = dirF_5;
    sy = clamp(_e44.y, -1f, 1f);
    let _e55 = dirF_5;
    let _e56 = sy;
    north = (vec3<f32>(0f, 1f, 0f) - (_e55 * _e56));
    let _e60 = north;
    nl = length(_e60);
    let _e63 = nl;
    if (_e63 > 0.0001f) {
        let _e66 = fn_1;
        let _e67 = north;
        let _e69 = nl;
        let _e77 = sy;
        if (_e77 < 0f) {
            local_4 = -1f;
        } else {
            local_4 = 1f;
        }
        let _e84 = local_4;
        local_5 = (degrees(asin(clamp((dot(_e66, _e67) / _e69), -1f, 1f))) * _e84);
    } else {
        local_5 = 0f;
    }
    let _e88 = local_5;
    tilt = _e88;
    let _e90 = tilt;
    ft = clamp(((_e90 - FROST_TILT0_) / FROST_DTILT), 0f, 8f);
    let _e99 = ft;
    t0_ = min(floor(_e99), 7f);
    let _e106 = sy;
    v = clamp((((asin(_e106) / 3.14159f) + 0.5f) * FROST_NL), 0.5f, 179.5f);
    let _e119 = global.uFrost;
    u = (_e119.x / 6.28319f);
    let _e124 = u;
    let _e125 = t0_;
    let _e127 = v;
    let _e135 = textureSampleLevel(tFrostTexture, tFrostSampler, vec2<f32>(_e124, (((_e125 * FROST_NL) + _e127) / 1620f)), 0f);
    m0_ = _e135.x;
    let _e138 = u;
    let _e139 = t0_;
    let _e143 = v;
    let _e151 = textureSampleLevel(tFrostTexture, tFrostSampler, vec2<f32>(_e138, ((((_e139 + 1f) * FROST_NL) + _e143) / 1620f)), 0f);
    m1_ = _e151.x;
    let _e154 = m0_;
    let _e155 = m1_;
    let _e156 = ft;
    let _e157 = t0_;
    m_1 = mix(_e154, _e155, (_e156 - _e157));
    let _e162 = m_1;
    let _e164 = m_1;
    c = (1f - exp((((-(_e162) * _e164) * 2000f) / 10f)));
    let _e173 = n_3;
    let _e176 = n_3;
    let _e179 = c;
    return smoothstep((_e173 - 0.25f), (_e176 + 0.25f), ((_e179 * 1.2f) - 0.1f));
}

fn matHash(c_1: vec2<f32>) -> f32 {
    var c_2: vec2<f32>;
    var q: vec2<u32>;
    var h: u32;

    c_2 = c_1;
    let _e47 = c_2;
    q = vec2<u32>((vec2<i32>(_e47) + vec2(1048576i)));
    let _e54 = q;
    let _e58 = q;
    h = ((_e54.x * 1597334677u) ^ (_e58.y * 3812015801u));
    let _e64 = h;
    h = ((_e64 * 747796405u) + 2891336453u);
    let _e69 = h;
    let _e70 = h;
    h = (_e69 ^ (_e70 >> 16u));
    let _e75 = h;
    h = (_e75 * 2246822519u);
    let _e78 = h;
    let _e79 = h;
    h = (_e78 ^ (_e79 >> 13u));
    let _e84 = h;
    return (f32((_e84 >> 8u)) / 16777216f);
}

fn matRead(uv: vec2<f32>, layer: f32, gx: vec2<f32>, gy: vec2<f32>, per: f32, A_1: ptr<function, vec4<f32>>, B: ptr<function, vec4<f32>>) {
    var uv_1: vec2<f32>;
    var layer_1: f32;
    var gx_1: vec2<f32>;
    var gy_1: vec2<f32>;
    var per_1: f32;
    var c_3: vec2<f32>;
    var f: vec2<f32>;
    var c1_: vec2<f32>;
    var k: f32;
    var i: f32;
    var fk: f32;
    var oA: vec2<f32>;
    var oB: vec2<f32>;
    var A0_: vec4<f32>;
    var A1_: vec4<f32>;
    var t: f32;

    uv_1 = uv;
    layer_1 = layer;
    gx_1 = gx;
    gy_1 = gy;
    per_1 = per;
    let _e57 = uv_1;
    c_3 = floor(_e57);
    let _e60 = uv_1;
    let _e61 = c_3;
    f = (_e60 - _e61);
    let _e64 = c_3;
    c1_ = (_e64 + vec2(1f));
    let _e69 = per_1;
    if (_e69 > 0f) {
        {
            let _e72 = c_3;
            let _e73 = per_1;
            let _e74 = vec2(_e73);
            c_3 = (_e72 - (floor((_e72 / _e74)) * _e74));
            let _e79 = c1_;
            let _e80 = per_1;
            let _e81 = vec2(_e80);
            c1_ = (_e79 - (floor((_e79 / _e81)) * _e81));
        }
    }
    let _e86 = f;
    let _e87 = f;
    let _e91 = f;
    f = ((_e86 * _e87) * (vec2(3f) - (2f * _e91)));
    let _e97 = c_3;
    let _e98 = matHash(_e97);
    let _e99 = c1_;
    let _e101 = c_3;
    let _e104 = matHash(vec2<f32>(_e99.x, _e101.y));
    let _e105 = f;
    let _e108 = c_3;
    let _e110 = c1_;
    let _e113 = matHash(vec2<f32>(_e108.x, _e110.y));
    let _e114 = c1_;
    let _e115 = matHash(_e114);
    let _e116 = f;
    let _e119 = f;
    k = (8f * mix(mix(_e98, _e104, _e105.x), mix(_e113, _e115, _e116.x), _e119.y));
    let _e124 = k;
    i = floor(_e124);
    let _e127 = k;
    let _e128 = i;
    fk = (_e127 - _e128);
    let _e131 = i;
    let _e134 = matHash(vec2<f32>(_e131, 17f));
    let _e135 = i;
    let _e138 = matHash(vec2<f32>(_e135, 29f));
    oA = vec2<f32>(_e134, _e138);
    let _e141 = i;
    let _e146 = matHash(vec2<f32>((_e141 + 1f), 17f));
    let _e147 = i;
    let _e152 = matHash(vec2<f32>((_e147 + 1f), 29f));
    oB = vec2<f32>(_e146, _e152);
    let _e155 = fk;
    if (_e155 < 0.25f) {
        {
            let _e158 = uv_1;
            let _e159 = oA;
            let _e160 = (_e158 + _e159);
            let _e161 = layer_1;
            let _e164 = vec3<f32>(_e160.x, _e160.y, _e161);
            let _e165 = gx_1;
            let _e166 = gy_1;
            let _e170 = textureSampleGrad(tMatATexture, tMatASampler, _e164.xy, i32(_e164.z), _e165, _e166);
            (*A_1) = _e170;
            let _e171 = uv_1;
            let _e172 = oA;
            let _e173 = (_e171 + _e172);
            let _e174 = layer_1;
            let _e177 = vec3<f32>(_e173.x, _e173.y, _e174);
            let _e178 = gx_1;
            let _e179 = gy_1;
            let _e183 = textureSampleGrad(tMatNTexture, tMatNSampler, _e177.xy, i32(_e177.z), _e178, _e179);
            (*B) = _e183;
            return;
        }
    }
    let _e184 = fk;
    if (_e184 > 0.75f) {
        {
            let _e187 = uv_1;
            let _e188 = oB;
            let _e189 = (_e187 + _e188);
            let _e190 = layer_1;
            let _e193 = vec3<f32>(_e189.x, _e189.y, _e190);
            let _e194 = gx_1;
            let _e195 = gy_1;
            let _e199 = textureSampleGrad(tMatATexture, tMatASampler, _e193.xy, i32(_e193.z), _e194, _e195);
            (*A_1) = _e199;
            let _e200 = uv_1;
            let _e201 = oB;
            let _e202 = (_e200 + _e201);
            let _e203 = layer_1;
            let _e206 = vec3<f32>(_e202.x, _e202.y, _e203);
            let _e207 = gx_1;
            let _e208 = gy_1;
            let _e212 = textureSampleGrad(tMatNTexture, tMatNSampler, _e206.xy, i32(_e206.z), _e207, _e208);
            (*B) = _e212;
            return;
        }
    }
    let _e213 = uv_1;
    let _e214 = oA;
    let _e215 = (_e213 + _e214);
    let _e216 = layer_1;
    let _e219 = vec3<f32>(_e215.x, _e215.y, _e216);
    let _e220 = gx_1;
    let _e221 = gy_1;
    let _e225 = textureSampleGrad(tMatATexture, tMatASampler, _e219.xy, i32(_e219.z), _e220, _e221);
    A0_ = _e225;
    let _e227 = uv_1;
    let _e228 = oB;
    let _e229 = (_e227 + _e228);
    let _e230 = layer_1;
    let _e233 = vec3<f32>(_e229.x, _e229.y, _e230);
    let _e234 = gx_1;
    let _e235 = gy_1;
    let _e239 = textureSampleGrad(tMatATexture, tMatASampler, _e233.xy, i32(_e233.z), _e234, _e235);
    A1_ = _e239;
    let _e243 = fk;
    let _e245 = A1_;
    let _e247 = A0_;
    t = smoothstep(0.4f, 0.6f, (_e243 + (0.15f * (_e245.w - _e247.w))));
    let _e254 = A0_;
    let _e255 = A1_;
    let _e256 = t;
    (*A_1) = mix(_e254, _e255, vec4(_e256));
    let _e259 = uv_1;
    let _e260 = oA;
    let _e261 = (_e259 + _e260);
    let _e262 = layer_1;
    let _e265 = vec3<f32>(_e261.x, _e261.y, _e262);
    let _e266 = gx_1;
    let _e267 = gy_1;
    let _e271 = textureSampleGrad(tMatNTexture, tMatNSampler, _e265.xy, i32(_e265.z), _e266, _e267);
    let _e272 = uv_1;
    let _e273 = oB;
    let _e274 = (_e272 + _e273);
    let _e275 = layer_1;
    let _e278 = vec3<f32>(_e274.x, _e274.y, _e275);
    let _e279 = gx_1;
    let _e280 = gy_1;
    let _e284 = textureSampleGrad(tMatNTexture, tMatNSampler, _e278.xy, i32(_e278.z), _e279, _e280);
    let _e285 = t;
    (*B) = mix(_e271, _e284, vec4(_e285));
    return;
}

fn matPlane(a: i32, p: vec3<f32>, dx: vec3<f32>, dy: vec3<f32>, n_4: vec3<f32>, layer_2: f32, per_2: f32, A_2: ptr<function, vec4<f32>>, B_1: ptr<function, vec4<f32>>, wn: ptr<function, vec3<f32>>) {
    var a_1: i32;
    var p_1: vec3<f32>;
    var dx_1: vec3<f32>;
    var dy_1: vec3<f32>;
    var n_5: vec3<f32>;
    var layer_3: f32;
    var per_3: f32;
    var uv_2: vec2<f32>;
    var gx_2: vec2<f32>;
    var gy_2: vec2<f32>;
    var sg: f32;
    var local_6: f32;
    var local_7: f32;
    var local_8: f32;
    var t_1: vec2<f32>;
    var tz: f32;
    var v_1: vec3<f32>;
    var v_2: vec3<f32>;
    var v_3: vec3<f32>;

    a_1 = a;
    p_1 = p;
    dx_1 = dx;
    dy_1 = dy;
    n_5 = n_4;
    layer_3 = layer_2;
    per_3 = per_2;
    let _e66 = a_1;
    if (_e66 == 0i) {
        {
            let _e69 = n_5;
            if (_e69.x < 0f) {
                local_6 = -1f;
            } else {
                local_6 = 1f;
            }
            let _e77 = local_6;
            sg = _e77;
            let _e78 = p_1;
            let _e80 = sg;
            let _e82 = p_1;
            uv_2 = vec2<f32>((_e78.z * _e80), _e82.y);
            let _e85 = dx_1;
            let _e87 = sg;
            let _e89 = dx_1;
            gx_2 = vec2<f32>((_e85.z * _e87), _e89.y);
            let _e92 = dy_1;
            let _e94 = sg;
            let _e96 = dy_1;
            gy_2 = vec2<f32>((_e92.z * _e94), _e96.y);
        }
    } else {
        let _e99 = a_1;
        if (_e99 == 1i) {
            {
                let _e102 = n_5;
                if (_e102.y < 0f) {
                    local_7 = -1f;
                } else {
                    local_7 = 1f;
                }
                let _e110 = local_7;
                sg = _e110;
                let _e111 = p_1;
                let _e113 = sg;
                let _e115 = p_1;
                uv_2 = vec2<f32>((_e111.x * _e113), _e115.z);
                let _e118 = dx_1;
                let _e120 = sg;
                let _e122 = dx_1;
                gx_2 = vec2<f32>((_e118.x * _e120), _e122.z);
                let _e125 = dy_1;
                let _e127 = sg;
                let _e129 = dy_1;
                gy_2 = vec2<f32>((_e125.x * _e127), _e129.z);
            }
        } else {
            {
                let _e132 = n_5;
                if (_e132.z < 0f) {
                    local_8 = 1f;
                } else {
                    local_8 = -1f;
                }
                let _e140 = local_8;
                sg = _e140;
                let _e141 = p_1;
                let _e143 = sg;
                let _e145 = p_1;
                uv_2 = vec2<f32>((_e141.x * _e143), _e145.y);
                let _e148 = dx_1;
                let _e150 = sg;
                let _e152 = dx_1;
                gx_2 = vec2<f32>((_e148.x * _e150), _e152.y);
                let _e155 = dy_1;
                let _e157 = sg;
                let _e159 = dy_1;
                gy_2 = vec2<f32>((_e155.x * _e157), _e159.y);
            }
        }
    }
    let _e162 = uv_2;
    let _e163 = layer_3;
    let _e164 = gx_2;
    let _e165 = gy_2;
    let _e166 = per_3;
    matRead(_e162, _e163, _e164, _e165, _e166, A_2, B_1);
    let _e171 = (*B_1);
    t_1 = ((_e171.xy * 2f) - vec2(1f));
    let _e180 = t_1;
    let _e182 = sg;
    t_1.x = (_e180.x * _e182);
    let _e185 = t_1;
    let _e186 = t_1;
    tz = sqrt(max((1f - dot(_e185, _e186)), 0f));
    let _e193 = a_1;
    if (_e193 == 0i) {
        {
            let _e196 = t_1;
            let _e197 = n_5;
            let _e199 = (_e196 + _e197.zy);
            let _e200 = tz;
            let _e201 = n_5;
            v_1 = vec3<f32>(_e199.x, _e199.y, (_e200 * abs(_e201.x)));
            let _e209 = v_1;
            let _e211 = n_5;
            let _e217 = v_1;
            let _e219 = v_1;
            (*wn) = vec3<f32>((_e209.z * sign((_e211.x + 0.000001f))), _e217.y, _e219.x);
            return;
        }
    } else {
        let _e222 = a_1;
        if (_e222 == 1i) {
            {
                let _e225 = t_1;
                let _e226 = n_5;
                let _e228 = (_e225 + _e226.xz);
                let _e229 = tz;
                let _e230 = n_5;
                v_2 = vec3<f32>(_e228.x, _e228.y, (_e229 * abs(_e230.y)));
                let _e238 = v_2;
                let _e240 = v_2;
                let _e242 = n_5;
                let _e248 = v_2;
                (*wn) = vec3<f32>(_e238.x, (_e240.z * sign((_e242.y + 0.000001f))), _e248.y);
                return;
            }
        } else {
            {
                let _e251 = t_1;
                let _e252 = n_5;
                let _e254 = (_e251 + _e252.xy);
                let _e255 = tz;
                let _e256 = n_5;
                v_3 = vec3<f32>(_e254.x, _e254.y, (_e255 * abs(_e256.z)));
                let _e264 = v_3;
                let _e266 = v_3;
                let _e268 = v_3;
                let _e270 = n_5;
                (*wn) = vec3<f32>(_e264.x, _e266.y, (_e268.z * sign((_e270.z + 0.000001f))));
                return;
            }
        }
    }
}

fn matSurf(layer_4: f32, p_2: vec3<f32>, dx_2: vec3<f32>, dy_2: vec3<f32>, n_6: vec3<f32>, per_4: f32) -> MatS {
    var layer_5: f32;
    var p_3: vec3<f32>;
    var dx_3: vec3<f32>;
    var dy_3: vec3<f32>;
    var n_7: vec3<f32>;
    var per_5: f32;
    var A_3: vec4<f32>;
    var B_2: vec4<f32>;
    var wn_1: vec3<f32>;
    var sA: vec4<f32> = vec4(0f);
    var sB: vec4<f32> = vec4(0f);
    var sn: vec3<f32> = vec3(0f);
    var an: vec3<f32>;
    var local_9: i32;
    var local_10: i32;
    var ma: i32;
    var local_11: i32;
    var local_12: i32;
    var mi: i32;
    var me: i32;
    var local_13: f32;
    var local_14: f32;
    var w0_: f32;
    var local_15: f32;
    var local_16: f32;
    var w1_: f32;
    var bw: vec2<f32>;
    var local_17: vec2<f32>;

    layer_5 = layer_4;
    p_3 = p_2;
    dx_3 = dx_2;
    dy_3 = dy_2;
    n_7 = n_6;
    per_5 = per_4;
    let _e69 = n_7;
    an = abs(_e69);
    let _e72 = an;
    let _e74 = an;
    let _e77 = an;
    let _e79 = an;
    if ((_e72.x > _e74.y) && (_e77.x > _e79.z)) {
        local_10 = 0i;
    } else {
        let _e84 = an;
        let _e86 = an;
        if (_e84.y > _e86.z) {
            local_9 = 1i;
        } else {
            local_9 = 2i;
        }
        let _e92 = local_9;
        local_10 = _e92;
    }
    let _e94 = local_10;
    ma = _e94;
    let _e96 = an;
    let _e98 = an;
    let _e101 = an;
    let _e103 = an;
    if ((_e96.x < _e98.y) && (_e101.x < _e103.z)) {
        local_12 = 0i;
    } else {
        let _e108 = an;
        let _e110 = an;
        if (_e108.y < _e110.z) {
            local_11 = 1i;
        } else {
            local_11 = 2i;
        }
        let _e116 = local_11;
        local_12 = _e116;
    }
    let _e118 = local_12;
    mi = _e118;
    let _e121 = mi;
    let _e123 = ma;
    me = ((3i - _e121) - _e123);
    let _e126 = ma;
    if (_e126 == 0i) {
        let _e129 = an;
        local_14 = _e129.x;
    } else {
        let _e131 = ma;
        if (_e131 == 1i) {
            let _e134 = an;
            local_13 = _e134.y;
        } else {
            let _e136 = an;
            local_13 = _e136.z;
        }
        let _e139 = local_13;
        local_14 = _e139;
    }
    let _e141 = local_14;
    w0_ = _e141;
    let _e143 = me;
    if (_e143 == 0i) {
        let _e146 = an;
        local_16 = _e146.x;
    } else {
        let _e148 = me;
        if (_e148 == 1i) {
            let _e151 = an;
            local_15 = _e151.y;
        } else {
            let _e153 = an;
            local_15 = _e153.z;
        }
        let _e156 = local_15;
        local_16 = _e156;
    }
    let _e158 = local_16;
    w1_ = _e158;
    let _e160 = w0_;
    let _e161 = w1_;
    bw = clamp(((vec2<f32>(_e160, _e161) - vec2(0.5773f)) / vec2(0.4227f)), vec2(0f), vec2(1f));
    let _e177 = bw;
    let _e179 = bw;
    if ((_e177.x + _e179.y) < 0.0001f) {
        local_17 = vec2<f32>(1f, 0f);
    } else {
        let _e187 = bw;
        let _e188 = bw;
        let _e190 = bw;
        local_17 = (_e187 / vec2((_e188.x + _e190.y)));
    }
    let _e196 = local_17;
    bw = _e196;
    let _e197 = bw;
    if (_e197.y < 0.02f) {
        bw = vec2<f32>(1f, 0f);
    }
    let _e204 = ma;
    let _e205 = p_3;
    let _e206 = dx_3;
    let _e207 = dy_3;
    let _e208 = n_7;
    let _e209 = layer_5;
    let _e210 = per_5;
    matPlane(_e204, _e205, _e206, _e207, _e208, _e209, _e210, (&A_3), (&B_2), (&wn_1));
    let _e217 = sA;
    let _e218 = A_3;
    let _e219 = bw;
    sA = (_e217 + (_e218 * _e219.x));
    let _e223 = sB;
    let _e224 = B_2;
    let _e225 = bw;
    sB = (_e223 + (_e224 * _e225.x));
    let _e229 = sn;
    let _e230 = wn_1;
    let _e231 = bw;
    sn = (_e229 + (_e230 * _e231.x));
    let _e235 = bw;
    if (_e235.y > 0f) {
        {
            let _e239 = me;
            let _e240 = p_3;
            let _e241 = dx_3;
            let _e242 = dy_3;
            let _e243 = n_7;
            let _e244 = layer_5;
            let _e245 = per_5;
            matPlane(_e239, _e240, _e241, _e242, _e243, _e244, _e245, (&A_3), (&B_2), (&wn_1));
            let _e252 = sA;
            let _e253 = A_3;
            let _e254 = bw;
            sA = (_e252 + (_e253 * _e254.y));
            let _e258 = sB;
            let _e259 = B_2;
            let _e260 = bw;
            sB = (_e258 + (_e259 * _e260.y));
            let _e264 = sn;
            let _e265 = wn_1;
            let _e266 = bw;
            sn = (_e264 + (_e265 * _e266.y));
        }
    }
    let _e270 = sA;
    let _e274 = sA;
    let _e276 = sn;
    let _e278 = sB;
    let _e280 = sB;
    return MatS((_e270.xyz * 2.5f), _e274.w, normalize(_e276), _e278.z, _e280.w);
}

fn main_1() {
    var foot: f32;
    var dpx: vec3<f32>;
    var dpy: vec3<f32>;
    var ln: vec3<f32>;
    var albedo_2: vec3<f32>;
    var rough: f32 = 0.85f;
    var ao_2: f32 = 1f;
    var ms: MatS;
    var sN: vec3<f32>;
    var fN: vec3<f32>;
    var N: vec3<f32>;
    var rel: vec3<f32>;
    var r: f32;
    var up: vec3<f32>;
    var swe: f32;
    var cov: f32;
    var depth: f32;
    var bank: f32;
    var sk: f32;
    var nT: vec3<f32>;
    var fk_1: f32;

    let _e45 = vWorld_1;
    let _e46 = fwidth(_e45);
    foot = length(_e46);
    let _e49 = vLocal_1;
    let _e50 = dpdx(_e49);
    dpx = _e50;
    let _e52 = vLocal_1;
    let _e53 = dpdy(_e52);
    dpy = _e53;
    let _e55 = vLocalN_1;
    ln = normalize(_e55);
    let _e58 = vCol_1;
    let _e61 = vR_1;
    albedo_2 = (_e58 * (0.85f + (0.3f * fract((_e61.x * 3.17f)))));
    let _e74 = vR_1;
    let _e76 = vLocal_1;
    let _e80 = vR_1;
    let _e86 = dpx;
    let _e90 = dpy;
    let _e94 = ln;
    let _e96 = matSurf(_e74.y, ((_e76 / vec3(2f)) + vec3((_e80.x * 37f))), (_e86 / vec3(2f)), (_e90 / vec3(2f)), _e94, 0f);
    ms = _e96;
    let _e98 = albedo_2;
    let _e99 = ms;
    albedo_2 = (_e98 * _e99.ratio);
    let _e102 = ms;
    ln = _e102.n;
    let _e104 = ms;
    rough = _e104.rough;
    let _e106 = ms;
    ao_2 = _e106.ao;
    let _e108 = vAx_1;
    let _e109 = vLocalN_1;
    let _e112 = vAy_1;
    let _e113 = vLocalN_1;
    let _e117 = vAz_1;
    let _e118 = vLocalN_1;
    sN = normalize((((_e108 * _e109.x) + (_e112 * _e113.y)) + (_e117 * _e118.z)));
    let _e124 = vWorld_1;
    let _e125 = dpdx(_e124);
    let _e126 = vWorld_1;
    let _e127 = dpdy(_e126);
    fN = normalize(cross(_e125, _e127));
    let _e131 = fN;
    let _e132 = sN;
    if (dot(_e131, _e132) < 0f) {
        let _e136 = fN;
        fN = -(_e136);
    }
    let _e138 = fN;
    let _e139 = sN;
    let _e140 = vR_1;
    let _e149 = vAx_1;
    let _e150 = ln;
    let _e153 = vAy_1;
    let _e154 = ln;
    let _e158 = vAz_1;
    let _e159 = ln;
    let _e164 = sN;
    N = normalize(((mix(_e138, _e139, vec3(clamp((_e140.z * 1.4f), 0f, 1f))) + (((_e149 * _e150.x) + (_e153 * _e154.y)) + (_e158 * _e159.z))) - _e164));
    let _e168 = vWorld_1;
    let _e169 = global.uCenter;
    rel = (_e168 - _e169);
    let _e172 = rel;
    r = length(_e172);
    let _e175 = rel;
    let _e176 = r;
    up = (_e175 / vec3(_e176));
    let _e180 = global.uSeason;
    if (_e180.z > 0.5f) {
        {
            let _e184 = global.uToFixed;
            let _e185 = up;
            let _e187 = vTa_1;
            let _e188 = seasonSWE((_e184 * _e185), _e187);
            swe = _e188;
            let _e191 = swe;
            cov = (1f - exp((-(_e191) / 12f)));
            let _e198 = swe;
            depth = (min(_e198, 3000f) * SNOW_DEPTH_PER_MM);
            let _e204 = depth;
            let _e207 = depth;
            let _e210 = vLocal_1;
            bank = (1f - smoothstep((_e204 - 0.04f), (_e207 + 0.04f), _e210.y));
            let _e215 = cov;
            let _e216 = bank;
            let _e219 = N;
            let _e220 = up;
            sk = (_e215 * max(_e216, smoothstep(0.55f, 0.85f, dot(_e219, _e220))));
            let _e226 = albedo_2;
            let _e227 = global.uSnowCol;
            let _e228 = sk;
            albedo_2 = mix(_e226, _e227, vec3(_e228));
            let _e231 = rough;
            let _e233 = sk;
            rough = mix(_e231, 0.75f, _e233);
            let _e235 = ao_2;
            let _e237 = sk;
            ao_2 = mix(_e235, 1f, _e237);
        }
    }
    let _e239 = global.uFrost;
    if (_e239.y > 0.5f) {
        {
            let _e243 = up;
            let _e244 = N;
            let _e245 = up;
            let _e246 = N;
            let _e247 = up;
            nT = normalize((_e243 + ((_e244 - (_e245 * dot(_e246, _e247))) * 0.33f)));
            let _e256 = global.uToFixed;
            let _e257 = up;
            let _e259 = global.uToFixed;
            let _e260 = nT;
            let _e263 = seasonFrost((_e256 * _e257), (_e259 * _e260), 0.5f);
            fk_1 = _e263;
            let _e265 = albedo_2;
            let _e266 = global.uSnowCol;
            let _e267 = fk_1;
            albedo_2 = mix(_e265, _e266, vec3(_e267));
            let _e270 = rough;
            let _e272 = fk_1;
            rough = mix(_e270, 0.75f, _e272);
        }
    }
    let _e274 = albedo_2;
    let _e275 = N;
    let _e276 = rough;
    let _e277 = ao_2;
    materialOutput(_e274, _e275, _e276, _e277, 0f, 0f, 0.04f);
    return;
}

@fragment 
fn main(@location(0) vWorld: vec3<f32>, @location(1) vLocal: vec3<f32>, @location(2) vLocalN: vec3<f32>, @location(3) vAx: vec3<f32>, @location(4) vAy: vec3<f32>, @location(5) vAz: vec3<f32>, @location(6) vR: vec4<f32>, @location(7) vCol: vec3<f32>, @location(8) vTa: f32) -> FragmentOutput {
    vWorld_1 = vWorld;
    vLocal_1 = vLocal;
    vLocalN_1 = vLocalN;
    vAx_1 = vAx;
    vAy_1 = vAy;
    vAz_1 = vAz;
    vR_1 = vR;
    vCol_1 = vCol;
    vTa_1 = vTa;
    main_1();
    let _e99 = gAlbedo;
    let _e101 = gNormal;
    let _e103 = gEmission;
    let _e105 = gSurface;
    return FragmentOutput(_e99, _e101, _e103, _e105);
}
`;
