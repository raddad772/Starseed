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

fn seasonFrost(fn_: vec3<f32>, n_2: f32) -> f32 {
    var fn_1: vec3<f32>;
    var n_3: f32;
    var m_1: f32;
    var c: f32;

    fn_1 = fn_;
    n_3 = n_2;
    let _e38 = global.uFrost;
    let _e42 = fn_1;
    let _e55 = textureSampleLevel(tFrostTexture, tFrostSampler, vec2<f32>((_e38.x / 6.28319f), ((asin(clamp(_e42.y, -1f, 1f)) / 3.14159f) + 0.5f)), 0f);
    m_1 = _e55.x;
    let _e59 = m_1;
    let _e61 = m_1;
    c = (1f - exp((((-(_e59) * _e61) * 2000f) / 10f)));
    let _e70 = n_3;
    let _e73 = n_3;
    let _e76 = c;
    return smoothstep((_e70 - 0.25f), (_e73 + 0.25f), ((_e76 * 1.2f) - 0.1f));
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

    let _e41 = vWorld_1;
    let _e42 = fwidth(_e41);
    foot = length(_e42);
    let _e45 = vLocal_1;
    let _e46 = dpdx(_e45);
    dpx = _e46;
    let _e48 = vLocal_1;
    let _e49 = dpdy(_e48);
    dpy = _e49;
    let _e51 = vLocalN_1;
    ln = normalize(_e51);
    let _e54 = vCol_1;
    let _e57 = vR_1;
    albedo_2 = (_e54 * (0.85f + (0.3f * fract((_e57.x * 3.17f)))));
    let _e70 = vAx_1;
    let _e71 = vLocalN_1;
    let _e74 = vAy_1;
    let _e75 = vLocalN_1;
    let _e79 = vAz_1;
    let _e80 = vLocalN_1;
    sN = normalize((((_e70 * _e71.x) + (_e74 * _e75.y)) + (_e79 * _e80.z)));
    let _e86 = vWorld_1;
    let _e87 = dpdx(_e86);
    let _e88 = vWorld_1;
    let _e89 = dpdy(_e88);
    fN = normalize(cross(_e87, _e89));
    let _e93 = fN;
    let _e94 = sN;
    if (dot(_e93, _e94) < 0f) {
        let _e98 = fN;
        fN = -(_e98);
    }
    let _e100 = fN;
    let _e101 = sN;
    let _e102 = vR_1;
    let _e111 = vAx_1;
    let _e112 = ln;
    let _e115 = vAy_1;
    let _e116 = ln;
    let _e120 = vAz_1;
    let _e121 = ln;
    let _e126 = sN;
    N = normalize(((mix(_e100, _e101, vec3(clamp((_e102.z * 1.4f), 0f, 1f))) + (((_e111 * _e112.x) + (_e115 * _e116.y)) + (_e120 * _e121.z))) - _e126));
    let _e130 = vWorld_1;
    let _e131 = global.uCenter;
    rel = (_e130 - _e131);
    let _e134 = rel;
    r = length(_e134);
    let _e137 = rel;
    let _e138 = r;
    up = (_e137 / vec3(_e138));
    let _e142 = global.uSeason;
    if (_e142.z > 0.5f) {
        {
            let _e146 = global.uToFixed;
            let _e147 = up;
            let _e149 = vTa_1;
            let _e150 = seasonSWE((_e146 * _e147), _e149);
            swe = _e150;
            let _e153 = swe;
            cov = (1f - exp((-(_e153) / 12f)));
            let _e160 = swe;
            depth = (min(_e160, 3000f) * SNOW_DEPTH_PER_MM);
            let _e166 = depth;
            let _e169 = depth;
            let _e172 = vLocal_1;
            bank = (1f - smoothstep((_e166 - 0.04f), (_e169 + 0.04f), _e172.y));
            let _e177 = cov;
            let _e178 = bank;
            let _e181 = N;
            let _e182 = up;
            sk = (_e177 * max(_e178, smoothstep(0.55f, 0.85f, dot(_e181, _e182))));
            let _e188 = albedo_2;
            let _e189 = global.uSnowCol;
            let _e190 = sk;
            albedo_2 = mix(_e188, _e189, vec3(_e190));
            let _e193 = rough;
            let _e195 = sk;
            rough = mix(_e193, 0.75f, _e195);
            let _e197 = ao_2;
            let _e199 = sk;
            ao_2 = mix(_e197, 1f, _e199);
        }
    }
    let _e201 = global.uFrost;
    if (_e201.y > 0.5f) {
        {
            let _e205 = up;
            let _e206 = N;
            let _e207 = up;
            let _e208 = N;
            let _e209 = up;
            nT = normalize((_e205 + ((_e206 - (_e207 * dot(_e208, _e209))) * 0.33f)));
            let _e218 = global.uToFixed;
            let _e219 = nT;
            let _e222 = seasonFrost((_e218 * _e219), 0.5f);
            fk = _e222;
            let _e224 = albedo_2;
            let _e225 = global.uSnowCol;
            let _e226 = fk;
            albedo_2 = mix(_e224, _e225, vec3(_e226));
            let _e229 = rough;
            let _e231 = fk;
            rough = mix(_e229, 0.75f, _e231);
        }
    }
    let _e233 = albedo_2;
    let _e234 = N;
    let _e235 = rough;
    let _e236 = ao_2;
    materialOutput(_e233, _e234, _e235, _e236, 0f, 0f, 0.04f);
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
    let _e91 = gAlbedo;
    let _e93 = gNormal;
    let _e95 = gEmission;
    let _e97 = gSurface;
    return FragmentOutput(_e91, _e93, _e95, _e97);
}
`;
