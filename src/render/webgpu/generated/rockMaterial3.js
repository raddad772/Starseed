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

fn matHash(c_1: vec2<f32>) -> f32 {
    var c_2: vec2<f32>;
    var q: vec2<u32>;
    var h: u32;

    c_2 = c_1;
    let _e43 = c_2;
    q = vec2<u32>((vec2<i32>(_e43) + vec2(1048576i)));
    let _e50 = q;
    let _e54 = q;
    h = ((_e50.x * 1597334677u) ^ (_e54.y * 3812015801u));
    let _e60 = h;
    h = ((_e60 * 747796405u) + 2891336453u);
    let _e65 = h;
    let _e66 = h;
    h = (_e65 ^ (_e66 >> 16u));
    let _e71 = h;
    h = (_e71 * 2246822519u);
    let _e74 = h;
    let _e75 = h;
    h = (_e74 ^ (_e75 >> 13u));
    let _e80 = h;
    return (f32((_e80 >> 8u)) / 16777216f);
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
    let _e53 = uv_1;
    c_3 = floor(_e53);
    let _e56 = uv_1;
    let _e57 = c_3;
    f = (_e56 - _e57);
    let _e60 = c_3;
    c1_ = (_e60 + vec2(1f));
    let _e65 = per_1;
    if (_e65 > 0f) {
        {
            let _e68 = c_3;
            let _e69 = per_1;
            let _e70 = vec2(_e69);
            c_3 = (_e68 - (floor((_e68 / _e70)) * _e70));
            let _e75 = c1_;
            let _e76 = per_1;
            let _e77 = vec2(_e76);
            c1_ = (_e75 - (floor((_e75 / _e77)) * _e77));
        }
    }
    let _e82 = f;
    let _e83 = f;
    let _e87 = f;
    f = ((_e82 * _e83) * (vec2(3f) - (2f * _e87)));
    let _e93 = c_3;
    let _e94 = matHash(_e93);
    let _e95 = c1_;
    let _e97 = c_3;
    let _e100 = matHash(vec2<f32>(_e95.x, _e97.y));
    let _e101 = f;
    let _e104 = c_3;
    let _e106 = c1_;
    let _e109 = matHash(vec2<f32>(_e104.x, _e106.y));
    let _e110 = c1_;
    let _e111 = matHash(_e110);
    let _e112 = f;
    let _e115 = f;
    k = (8f * mix(mix(_e94, _e100, _e101.x), mix(_e109, _e111, _e112.x), _e115.y));
    let _e120 = k;
    i = floor(_e120);
    let _e123 = k;
    let _e124 = i;
    fk = (_e123 - _e124);
    let _e127 = i;
    let _e130 = matHash(vec2<f32>(_e127, 17f));
    let _e131 = i;
    let _e134 = matHash(vec2<f32>(_e131, 29f));
    oA = vec2<f32>(_e130, _e134);
    let _e137 = i;
    let _e142 = matHash(vec2<f32>((_e137 + 1f), 17f));
    let _e143 = i;
    let _e148 = matHash(vec2<f32>((_e143 + 1f), 29f));
    oB = vec2<f32>(_e142, _e148);
    let _e151 = fk;
    if (_e151 < 0.25f) {
        {
            let _e154 = uv_1;
            let _e155 = oA;
            let _e156 = (_e154 + _e155);
            let _e157 = layer_1;
            let _e160 = vec3<f32>(_e156.x, _e156.y, _e157);
            let _e161 = gx_1;
            let _e162 = gy_1;
            let _e166 = textureSampleGrad(tMatATexture, tMatASampler, _e160.xy, i32(_e160.z), _e161, _e162);
            (*A_1) = _e166;
            let _e167 = uv_1;
            let _e168 = oA;
            let _e169 = (_e167 + _e168);
            let _e170 = layer_1;
            let _e173 = vec3<f32>(_e169.x, _e169.y, _e170);
            let _e174 = gx_1;
            let _e175 = gy_1;
            let _e179 = textureSampleGrad(tMatNTexture, tMatNSampler, _e173.xy, i32(_e173.z), _e174, _e175);
            (*B) = _e179;
            return;
        }
    }
    let _e180 = fk;
    if (_e180 > 0.75f) {
        {
            let _e183 = uv_1;
            let _e184 = oB;
            let _e185 = (_e183 + _e184);
            let _e186 = layer_1;
            let _e189 = vec3<f32>(_e185.x, _e185.y, _e186);
            let _e190 = gx_1;
            let _e191 = gy_1;
            let _e195 = textureSampleGrad(tMatATexture, tMatASampler, _e189.xy, i32(_e189.z), _e190, _e191);
            (*A_1) = _e195;
            let _e196 = uv_1;
            let _e197 = oB;
            let _e198 = (_e196 + _e197);
            let _e199 = layer_1;
            let _e202 = vec3<f32>(_e198.x, _e198.y, _e199);
            let _e203 = gx_1;
            let _e204 = gy_1;
            let _e208 = textureSampleGrad(tMatNTexture, tMatNSampler, _e202.xy, i32(_e202.z), _e203, _e204);
            (*B) = _e208;
            return;
        }
    }
    let _e209 = uv_1;
    let _e210 = oA;
    let _e211 = (_e209 + _e210);
    let _e212 = layer_1;
    let _e215 = vec3<f32>(_e211.x, _e211.y, _e212);
    let _e216 = gx_1;
    let _e217 = gy_1;
    let _e221 = textureSampleGrad(tMatATexture, tMatASampler, _e215.xy, i32(_e215.z), _e216, _e217);
    A0_ = _e221;
    let _e223 = uv_1;
    let _e224 = oB;
    let _e225 = (_e223 + _e224);
    let _e226 = layer_1;
    let _e229 = vec3<f32>(_e225.x, _e225.y, _e226);
    let _e230 = gx_1;
    let _e231 = gy_1;
    let _e235 = textureSampleGrad(tMatATexture, tMatASampler, _e229.xy, i32(_e229.z), _e230, _e231);
    A1_ = _e235;
    let _e239 = fk;
    let _e241 = A1_;
    let _e243 = A0_;
    t = smoothstep(0.4f, 0.6f, (_e239 + (0.15f * (_e241.w - _e243.w))));
    let _e250 = A0_;
    let _e251 = A1_;
    let _e252 = t;
    (*A_1) = mix(_e250, _e251, vec4(_e252));
    let _e255 = uv_1;
    let _e256 = oA;
    let _e257 = (_e255 + _e256);
    let _e258 = layer_1;
    let _e261 = vec3<f32>(_e257.x, _e257.y, _e258);
    let _e262 = gx_1;
    let _e263 = gy_1;
    let _e267 = textureSampleGrad(tMatNTexture, tMatNSampler, _e261.xy, i32(_e261.z), _e262, _e263);
    let _e268 = uv_1;
    let _e269 = oB;
    let _e270 = (_e268 + _e269);
    let _e271 = layer_1;
    let _e274 = vec3<f32>(_e270.x, _e270.y, _e271);
    let _e275 = gx_1;
    let _e276 = gy_1;
    let _e280 = textureSampleGrad(tMatNTexture, tMatNSampler, _e274.xy, i32(_e274.z), _e275, _e276);
    let _e281 = t;
    (*B) = mix(_e267, _e280, vec4(_e281));
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
    var local_4: f32;
    var local_5: f32;
    var local_6: f32;
    var t_1: vec2<f32>;
    var tz: f32;
    var v: vec3<f32>;
    var v_1: vec3<f32>;
    var v_2: vec3<f32>;

    a_1 = a;
    p_1 = p;
    dx_1 = dx;
    dy_1 = dy;
    n_5 = n_4;
    layer_3 = layer_2;
    per_3 = per_2;
    let _e62 = a_1;
    if (_e62 == 0i) {
        {
            let _e65 = n_5;
            if (_e65.x < 0f) {
                local_4 = -1f;
            } else {
                local_4 = 1f;
            }
            let _e73 = local_4;
            sg = _e73;
            let _e74 = p_1;
            let _e76 = sg;
            let _e78 = p_1;
            uv_2 = vec2<f32>((_e74.z * _e76), _e78.y);
            let _e81 = dx_1;
            let _e83 = sg;
            let _e85 = dx_1;
            gx_2 = vec2<f32>((_e81.z * _e83), _e85.y);
            let _e88 = dy_1;
            let _e90 = sg;
            let _e92 = dy_1;
            gy_2 = vec2<f32>((_e88.z * _e90), _e92.y);
        }
    } else {
        let _e95 = a_1;
        if (_e95 == 1i) {
            {
                let _e98 = n_5;
                if (_e98.y < 0f) {
                    local_5 = -1f;
                } else {
                    local_5 = 1f;
                }
                let _e106 = local_5;
                sg = _e106;
                let _e107 = p_1;
                let _e109 = sg;
                let _e111 = p_1;
                uv_2 = vec2<f32>((_e107.x * _e109), _e111.z);
                let _e114 = dx_1;
                let _e116 = sg;
                let _e118 = dx_1;
                gx_2 = vec2<f32>((_e114.x * _e116), _e118.z);
                let _e121 = dy_1;
                let _e123 = sg;
                let _e125 = dy_1;
                gy_2 = vec2<f32>((_e121.x * _e123), _e125.z);
            }
        } else {
            {
                let _e128 = n_5;
                if (_e128.z < 0f) {
                    local_6 = 1f;
                } else {
                    local_6 = -1f;
                }
                let _e136 = local_6;
                sg = _e136;
                let _e137 = p_1;
                let _e139 = sg;
                let _e141 = p_1;
                uv_2 = vec2<f32>((_e137.x * _e139), _e141.y);
                let _e144 = dx_1;
                let _e146 = sg;
                let _e148 = dx_1;
                gx_2 = vec2<f32>((_e144.x * _e146), _e148.y);
                let _e151 = dy_1;
                let _e153 = sg;
                let _e155 = dy_1;
                gy_2 = vec2<f32>((_e151.x * _e153), _e155.y);
            }
        }
    }
    let _e158 = uv_2;
    let _e159 = layer_3;
    let _e160 = gx_2;
    let _e161 = gy_2;
    let _e162 = per_3;
    matRead(_e158, _e159, _e160, _e161, _e162, A_2, B_1);
    let _e167 = (*B_1);
    t_1 = ((_e167.xy * 2f) - vec2(1f));
    let _e176 = t_1;
    let _e178 = sg;
    t_1.x = (_e176.x * _e178);
    let _e181 = t_1;
    let _e182 = t_1;
    tz = sqrt(max((1f - dot(_e181, _e182)), 0f));
    let _e189 = a_1;
    if (_e189 == 0i) {
        {
            let _e192 = t_1;
            let _e193 = n_5;
            let _e195 = (_e192 + _e193.zy);
            let _e196 = tz;
            let _e197 = n_5;
            v = vec3<f32>(_e195.x, _e195.y, (_e196 * abs(_e197.x)));
            let _e205 = v;
            let _e207 = n_5;
            let _e213 = v;
            let _e215 = v;
            (*wn) = vec3<f32>((_e205.z * sign((_e207.x + 0.000001f))), _e213.y, _e215.x);
            return;
        }
    } else {
        let _e218 = a_1;
        if (_e218 == 1i) {
            {
                let _e221 = t_1;
                let _e222 = n_5;
                let _e224 = (_e221 + _e222.xz);
                let _e225 = tz;
                let _e226 = n_5;
                v_1 = vec3<f32>(_e224.x, _e224.y, (_e225 * abs(_e226.y)));
                let _e234 = v_1;
                let _e236 = v_1;
                let _e238 = n_5;
                let _e244 = v_1;
                (*wn) = vec3<f32>(_e234.x, (_e236.z * sign((_e238.y + 0.000001f))), _e244.y);
                return;
            }
        } else {
            {
                let _e247 = t_1;
                let _e248 = n_5;
                let _e250 = (_e247 + _e248.xy);
                let _e251 = tz;
                let _e252 = n_5;
                v_2 = vec3<f32>(_e250.x, _e250.y, (_e251 * abs(_e252.z)));
                let _e260 = v_2;
                let _e262 = v_2;
                let _e264 = v_2;
                let _e266 = n_5;
                (*wn) = vec3<f32>(_e260.x, _e262.y, (_e264.z * sign((_e266.z + 0.000001f))));
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
    var w: vec3<f32>;

    layer_5 = layer_4;
    p_3 = p_2;
    dx_3 = dx_2;
    dy_3 = dy_2;
    n_7 = n_6;
    per_5 = per_4;
    let _e65 = n_7;
    w = pow(abs(_e65), vec3(6f));
    let _e71 = w;
    let _e72 = w;
    let _e74 = w;
    let _e77 = w;
    w = (_e71 / vec3(((_e72.x + _e74.y) + _e77.z)));
    let _e82 = w;
    let _e84 = w;
    w = (_e82 * step(vec3(0.02f), _e84));
    let _e88 = w;
    let _e89 = w;
    let _e91 = w;
    let _e94 = w;
    w = (_e88 / vec3(((_e89.x + _e91.y) + _e94.z)));
    let _e99 = w;
    if (_e99.x > 0f) {
        {
            let _e104 = p_3;
            let _e105 = dx_3;
            let _e106 = dy_3;
            let _e107 = n_7;
            let _e108 = layer_5;
            let _e109 = per_5;
            matPlane(0i, _e104, _e105, _e106, _e107, _e108, _e109, (&A_3), (&B_2), (&wn_1));
            let _e116 = sA;
            let _e117 = A_3;
            let _e118 = w;
            sA = (_e116 + (_e117 * _e118.x));
            let _e122 = sB;
            let _e123 = B_2;
            let _e124 = w;
            sB = (_e122 + (_e123 * _e124.x));
            let _e128 = sn;
            let _e129 = wn_1;
            let _e130 = w;
            sn = (_e128 + (_e129 * _e130.x));
        }
    }
    let _e134 = w;
    if (_e134.y > 0f) {
        {
            let _e139 = p_3;
            let _e140 = dx_3;
            let _e141 = dy_3;
            let _e142 = n_7;
            let _e143 = layer_5;
            let _e144 = per_5;
            matPlane(1i, _e139, _e140, _e141, _e142, _e143, _e144, (&A_3), (&B_2), (&wn_1));
            let _e151 = sA;
            let _e152 = A_3;
            let _e153 = w;
            sA = (_e151 + (_e152 * _e153.y));
            let _e157 = sB;
            let _e158 = B_2;
            let _e159 = w;
            sB = (_e157 + (_e158 * _e159.y));
            let _e163 = sn;
            let _e164 = wn_1;
            let _e165 = w;
            sn = (_e163 + (_e164 * _e165.y));
        }
    }
    let _e169 = w;
    if (_e169.z > 0f) {
        {
            let _e174 = p_3;
            let _e175 = dx_3;
            let _e176 = dy_3;
            let _e177 = n_7;
            let _e178 = layer_5;
            let _e179 = per_5;
            matPlane(2i, _e174, _e175, _e176, _e177, _e178, _e179, (&A_3), (&B_2), (&wn_1));
            let _e186 = sA;
            let _e187 = A_3;
            let _e188 = w;
            sA = (_e186 + (_e187 * _e188.z));
            let _e192 = sB;
            let _e193 = B_2;
            let _e194 = w;
            sB = (_e192 + (_e193 * _e194.z));
            let _e198 = sn;
            let _e199 = wn_1;
            let _e200 = w;
            sn = (_e198 + (_e199 * _e200.z));
        }
    }
    let _e204 = sA;
    let _e208 = sA;
    let _e210 = sn;
    let _e212 = sB;
    let _e214 = sB;
    return MatS((_e204.xyz * 2.5f), _e208.w, normalize(_e210), _e212.z, _e214.w);
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
    let _e70 = vR_1;
    let _e72 = vLocal_1;
    let _e76 = vR_1;
    let _e82 = dpx;
    let _e86 = dpy;
    let _e90 = ln;
    let _e92 = matSurf(_e70.y, ((_e72 / vec3(2f)) + vec3((_e76.x * 37f))), (_e82 / vec3(2f)), (_e86 / vec3(2f)), _e90, 0f);
    ms = _e92;
    let _e94 = albedo_2;
    let _e95 = ms;
    albedo_2 = (_e94 * _e95.ratio);
    let _e98 = ms;
    ln = _e98.n;
    let _e100 = ms;
    rough = _e100.rough;
    let _e102 = ms;
    ao_2 = _e102.ao;
    let _e104 = vAx_1;
    let _e105 = vLocalN_1;
    let _e108 = vAy_1;
    let _e109 = vLocalN_1;
    let _e113 = vAz_1;
    let _e114 = vLocalN_1;
    sN = normalize((((_e104 * _e105.x) + (_e108 * _e109.y)) + (_e113 * _e114.z)));
    let _e120 = vWorld_1;
    let _e121 = dpdx(_e120);
    let _e122 = vWorld_1;
    let _e123 = dpdy(_e122);
    fN = normalize(cross(_e121, _e123));
    let _e127 = fN;
    let _e128 = sN;
    if (dot(_e127, _e128) < 0f) {
        let _e132 = fN;
        fN = -(_e132);
    }
    let _e134 = fN;
    let _e135 = sN;
    let _e136 = vR_1;
    let _e145 = vAx_1;
    let _e146 = ln;
    let _e149 = vAy_1;
    let _e150 = ln;
    let _e154 = vAz_1;
    let _e155 = ln;
    let _e160 = sN;
    N = normalize(((mix(_e134, _e135, vec3(clamp((_e136.z * 1.4f), 0f, 1f))) + (((_e145 * _e146.x) + (_e149 * _e150.y)) + (_e154 * _e155.z))) - _e160));
    let _e164 = vWorld_1;
    let _e165 = global.uCenter;
    rel = (_e164 - _e165);
    let _e168 = rel;
    r = length(_e168);
    let _e171 = rel;
    let _e172 = r;
    up = (_e171 / vec3(_e172));
    let _e176 = global.uSeason;
    if (_e176.z > 0.5f) {
        {
            let _e180 = global.uToFixed;
            let _e181 = up;
            let _e183 = vTa_1;
            let _e184 = seasonSWE((_e180 * _e181), _e183);
            swe = _e184;
            let _e187 = swe;
            cov = (1f - exp((-(_e187) / 12f)));
            let _e194 = swe;
            depth = (min(_e194, 3000f) * SNOW_DEPTH_PER_MM);
            let _e200 = depth;
            let _e203 = depth;
            let _e206 = vLocal_1;
            bank = (1f - smoothstep((_e200 - 0.04f), (_e203 + 0.04f), _e206.y));
            let _e211 = cov;
            let _e212 = bank;
            let _e215 = N;
            let _e216 = up;
            sk = (_e211 * max(_e212, smoothstep(0.55f, 0.85f, dot(_e215, _e216))));
            let _e222 = albedo_2;
            let _e223 = global.uSnowCol;
            let _e224 = sk;
            albedo_2 = mix(_e222, _e223, vec3(_e224));
            let _e227 = rough;
            let _e229 = sk;
            rough = mix(_e227, 0.75f, _e229);
            let _e231 = ao_2;
            let _e233 = sk;
            ao_2 = mix(_e231, 1f, _e233);
        }
    }
    let _e235 = global.uFrost;
    if (_e235.y > 0.5f) {
        {
            let _e239 = up;
            let _e240 = N;
            let _e241 = up;
            let _e242 = N;
            let _e243 = up;
            nT = normalize((_e239 + ((_e240 - (_e241 * dot(_e242, _e243))) * 0.33f)));
            let _e252 = global.uToFixed;
            let _e253 = nT;
            let _e256 = seasonFrost((_e252 * _e253), 0.5f);
            fk_1 = _e256;
            let _e258 = albedo_2;
            let _e259 = global.uSnowCol;
            let _e260 = fk_1;
            albedo_2 = mix(_e258, _e259, vec3(_e260));
            let _e263 = rough;
            let _e265 = fk_1;
            rough = mix(_e263, 0.75f, _e265);
        }
    }
    let _e267 = albedo_2;
    let _e268 = N;
    let _e269 = rough;
    let _e270 = ao_2;
    materialOutput(_e267, _e268, _e269, _e270, 0f, 0f, 0.04f);
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
