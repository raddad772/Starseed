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

fn main_1() {
    var foot: f32;
    var dpx: vec3<f32>;
    var dpy: vec3<f32>;
    var ln: vec3<f32>;
    var albedo_2: vec3<f32>;
    var rough: f32 = 0.85f;
    var ao_2: f32 = 1f;
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
    var fk: f32;

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
    let _e74 = vAx_1;
    let _e75 = vLocalN_1;
    let _e78 = vAy_1;
    let _e79 = vLocalN_1;
    let _e83 = vAz_1;
    let _e84 = vLocalN_1;
    sN = normalize((((_e74 * _e75.x) + (_e78 * _e79.y)) + (_e83 * _e84.z)));
    let _e90 = vWorld_1;
    let _e91 = dpdx(_e90);
    let _e92 = vWorld_1;
    let _e93 = dpdy(_e92);
    fN = normalize(cross(_e91, _e93));
    let _e97 = fN;
    let _e98 = sN;
    if (dot(_e97, _e98) < 0f) {
        let _e102 = fN;
        fN = -(_e102);
    }
    let _e104 = fN;
    let _e105 = sN;
    let _e106 = vR_1;
    let _e115 = vAx_1;
    let _e116 = ln;
    let _e119 = vAy_1;
    let _e120 = ln;
    let _e124 = vAz_1;
    let _e125 = ln;
    let _e130 = sN;
    N = normalize(((mix(_e104, _e105, vec3(clamp((_e106.z * 1.4f), 0f, 1f))) + (((_e115 * _e116.x) + (_e119 * _e120.y)) + (_e124 * _e125.z))) - _e130));
    let _e134 = vWorld_1;
    let _e135 = global.uCenter;
    rel = (_e134 - _e135);
    let _e138 = rel;
    r = length(_e138);
    let _e141 = rel;
    let _e142 = r;
    up = (_e141 / vec3(_e142));
    let _e146 = global.uSeason;
    if (_e146.z > 0.5f) {
        {
            let _e150 = global.uToFixed;
            let _e151 = up;
            let _e153 = vTa_1;
            let _e154 = seasonSWE((_e150 * _e151), _e153);
            swe = _e154;
            let _e157 = swe;
            cov = (1f - exp((-(_e157) / 12f)));
            let _e164 = swe;
            depth = (min(_e164, 3000f) * SNOW_DEPTH_PER_MM);
            let _e170 = depth;
            let _e173 = depth;
            let _e176 = vLocal_1;
            bank = (1f - smoothstep((_e170 - 0.04f), (_e173 + 0.04f), _e176.y));
            let _e181 = cov;
            let _e182 = bank;
            let _e185 = N;
            let _e186 = up;
            sk = (_e181 * max(_e182, smoothstep(0.55f, 0.85f, dot(_e185, _e186))));
            let _e192 = albedo_2;
            let _e193 = global.uSnowCol;
            let _e194 = sk;
            albedo_2 = mix(_e192, _e193, vec3(_e194));
            let _e197 = rough;
            let _e199 = sk;
            rough = mix(_e197, 0.75f, _e199);
            let _e201 = ao_2;
            let _e203 = sk;
            ao_2 = mix(_e201, 1f, _e203);
        }
    }
    let _e205 = global.uFrost;
    if (_e205.y > 0.5f) {
        {
            let _e209 = up;
            let _e210 = N;
            let _e211 = up;
            let _e212 = N;
            let _e213 = up;
            nT = normalize((_e209 + ((_e210 - (_e211 * dot(_e212, _e213))) * 0.33f)));
            let _e222 = global.uToFixed;
            let _e223 = up;
            let _e225 = global.uToFixed;
            let _e226 = nT;
            let _e229 = seasonFrost((_e222 * _e223), (_e225 * _e226), 0.5f);
            fk = _e229;
            let _e231 = albedo_2;
            let _e232 = global.uSnowCol;
            let _e233 = fk;
            albedo_2 = mix(_e231, _e232, vec3(_e233));
            let _e236 = rough;
            let _e238 = fk;
            rough = mix(_e236, 0.75f, _e238);
        }
    }
    let _e240 = albedo_2;
    let _e241 = N;
    let _e242 = rough;
    let _e243 = ao_2;
    materialOutput(_e240, _e241, _e242, _e243, 0f, 0f, 0.04f);
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
