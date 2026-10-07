// Generated offline from the existing renderer equations. See tools/shaders/.
export const layout = {
  "uniforms": [
    {
      "name": "toneMappingExposure",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 0
    },
    {
      "name": "uToneCurve",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 4
    },
    {
      "name": "uKey",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 8
    },
    {
      "name": "uMinExp",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 12
    },
    {
      "name": "uMaxExp",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 16
    },
    {
      "name": "uExposureBias",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 20
    },
    {
      "name": "uBloom",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 24
    },
    {
      "name": "uWhiteBalance",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 32
    },
    {
      "name": "uNightShift",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 44
    },
    {
      "name": "uTime",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 48
    },
    {
      "name": "uVignette",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 52
    },
    {
      "name": "uFlash",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 64
    },
    {
      "name": "uRadial",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 76
    },
    {
      "name": "uEncode",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 80
    },
    {
      "name": "uContrast",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 84
    }
  ],
  "textures": [
    {
      "name": "tColor",
      "type": "sampler2D",
      "count": 0,
      "binding": 1,
      "samplerBinding": 2
    },
    {
      "name": "tBloom",
      "type": "sampler2D",
      "count": 0,
      "binding": 3,
      "samplerBinding": 4
    },
    {
      "name": "tAdapt",
      "type": "sampler2D",
      "count": 0,
      "binding": 5,
      "samplerBinding": 6
    }
  ],
  "bytes": 96,
  "group": 0,
  "attributes": []
};
export const code = /* wgsl */`
struct Params {
    toneMappingExposure: f32,
    uToneCurve: f32,
    uKey: f32,
    uMinExp: f32,
    uMaxExp: f32,
    uExposureBias: f32,
    uBloom: f32,
    uWhiteBalance: vec3<f32>,
    uNightShift: f32,
    uTime: f32,
    uVignette: f32,
    uFlash: vec3<f32>,
    uRadial: f32,
    uEncode: f32,
    uContrast: f32,
}

struct FragmentOutput {
    @location(0) fragmentColor: vec4<f32>,
}

const LINEAR_REC2020_TO_LINEAR_SRGB: mat3x3<f32> = mat3x3<f32>(vec3<f32>(1.6605f, -0.1246f, -0.0182f), vec3<f32>(-0.5876f, 1.1329f, -0.1006f), vec3<f32>(-0.0728f, -0.0083f, 1.1187f));
const LINEAR_SRGB_TO_LINEAR_REC2020_: mat3x3<f32> = mat3x3<f32>(vec3<f32>(0.6274f, 0.0691f, 0.0164f), vec3<f32>(0.3293f, 0.9195f, 0.088f), vec3<f32>(0.0433f, 0.0113f, 0.8956f));

@group(0) @binding(0) 
var<uniform> global: Params;
@group(0) @binding(1) 
var tColorTexture: texture_2d<f32>;
@group(0) @binding(2) 
var tColorSampler: sampler;
@group(0) @binding(3) 
var tBloomTexture: texture_2d<f32>;
@group(0) @binding(4) 
var tBloomSampler: sampler;
@group(0) @binding(5) 
var tAdaptTexture: texture_2d<f32>;
@group(0) @binding(6) 
var tAdaptSampler: sampler;
var<private> fragmentColor: vec4<f32>;
var<private> vUv_1: vec2<f32>;
var<private> gl_FragCoord_1: vec4<f32>;

fn finite_isnan(x: f32) -> bool {
    var x_1: f32;

    x_1 = x;
    let _e39 = x_1;
    return ((bitcast<u32>(_e39) & 2147483647u) > 2139095040u);
}

fn finite_isnan_1(x_2: vec2<f32>) -> vec2<bool> {
    var x_3: vec2<f32>;

    x_3 = x_2;
    let _e41 = x_3.x;
    let _e42 = finite_isnan(_e41);
    let _e45 = x_3.y;
    let _e46 = finite_isnan(_e45);
    return vec2<bool>(_e42, _e46);
}

fn finite_isnan_2(x_4: vec3<f32>) -> vec3<bool> {
    var x_5: vec3<f32>;

    x_5 = x_4;
    let _e41 = x_5.x;
    let _e42 = finite_isnan(_e41);
    let _e45 = x_5.y;
    let _e46 = finite_isnan(_e45);
    let _e49 = x_5.z;
    let _e50 = finite_isnan(_e49);
    return vec3<bool>(_e42, _e46, _e50);
}

fn finite_isnan_3(x_6: vec4<f32>) -> vec4<bool> {
    var x_7: vec4<f32>;

    x_7 = x_6;
    let _e41 = x_7.x;
    let _e42 = finite_isnan(_e41);
    let _e45 = x_7.y;
    let _e46 = finite_isnan(_e45);
    let _e49 = x_7.z;
    let _e50 = finite_isnan(_e49);
    let _e53 = x_7.w;
    let _e54 = finite_isnan(_e53);
    return vec4<bool>(_e42, _e46, _e50, _e54);
}

fn finite_isinf(x_8: f32) -> bool {
    var x_9: f32;

    x_9 = x_8;
    let _e39 = x_9;
    return ((bitcast<u32>(_e39) & 2147483647u) == 2139095040u);
}

fn finite_isinf_1(x_10: vec2<f32>) -> vec2<bool> {
    var x_11: vec2<f32>;

    x_11 = x_10;
    let _e41 = x_11.x;
    let _e42 = finite_isinf(_e41);
    let _e45 = x_11.y;
    let _e46 = finite_isinf(_e45);
    return vec2<bool>(_e42, _e46);
}

fn finite_isinf_2(x_12: vec3<f32>) -> vec3<bool> {
    var x_13: vec3<f32>;

    x_13 = x_12;
    let _e41 = x_13.x;
    let _e42 = finite_isinf(_e41);
    let _e45 = x_13.y;
    let _e46 = finite_isinf(_e45);
    let _e49 = x_13.z;
    let _e50 = finite_isinf(_e49);
    return vec3<bool>(_e42, _e46, _e50);
}

fn finite_isinf_3(x_14: vec4<f32>) -> vec4<bool> {
    var x_15: vec4<f32>;

    x_15 = x_14;
    let _e41 = x_15.x;
    let _e42 = finite_isinf(_e41);
    let _e45 = x_15.y;
    let _e46 = finite_isinf(_e45);
    let _e49 = x_15.z;
    let _e50 = finite_isinf(_e49);
    let _e53 = x_15.w;
    let _e54 = finite_isinf(_e53);
    return vec4<bool>(_e42, _e46, _e50, _e54);
}

fn LinearToneMapping(color: vec3<f32>) -> vec3<f32> {
    var color_1: vec3<f32>;

    color_1 = color;
    let _e39 = global.toneMappingExposure;
    let _e40 = color_1;
    return clamp((_e39 * _e40), vec3(0f), vec3(1f));
}

fn ReinhardToneMapping(color_2: vec3<f32>) -> vec3<f32> {
    var color_3: vec3<f32>;

    color_3 = color_2;
    let _e39 = color_3;
    let _e40 = global.toneMappingExposure;
    color_3 = (_e39 * _e40);
    let _e42 = color_3;
    let _e45 = color_3;
    return clamp((_e42 / (vec3(1f) + _e45)), vec3(0f), vec3(1f));
}

fn CineonToneMapping(color_4: vec3<f32>) -> vec3<f32> {
    var color_5: vec3<f32>;

    color_5 = color_4;
    let _e39 = color_5;
    let _e40 = global.toneMappingExposure;
    color_5 = (_e39 * _e40);
    let _e44 = color_5;
    color_5 = max(vec3(0f), (_e44 - vec3(0.004f)));
    let _e49 = color_5;
    let _e51 = color_5;
    let _e57 = color_5;
    let _e59 = color_5;
    return pow(((_e49 * ((6.2f * _e51) + vec3(0.5f))) / ((_e57 * ((6.2f * _e59) + vec3(1.7f))) + vec3(0.06f))), vec3(2.2f));
}

fn RRTAndODTFit(v: vec3<f32>) -> vec3<f32> {
    var v_1: vec3<f32>;
    var a: vec3<f32>;
    var b: vec3<f32>;

    v_1 = v;
    let _e39 = v_1;
    let _e40 = v_1;
    a = ((_e39 * (_e40 + vec3(0.0245786f))) - vec3(0.000090537f));
    let _e49 = v_1;
    let _e51 = v_1;
    b = ((_e49 * ((0.983729f * _e51) + vec3(0.432951f))) + vec3(0.238081f));
    let _e61 = a;
    let _e62 = b;
    return (_e61 / _e62);
}

fn ACESFilmicToneMapping(color_6: vec3<f32>) -> vec3<f32> {
    var color_7: vec3<f32>;
    var ACESInputMat: mat3x3<f32> = mat3x3<f32>(vec3<f32>(0.59719f, 0.076f, 0.0284f), vec3<f32>(0.35458f, 0.90834f, 0.13383f), vec3<f32>(0.04823f, 0.01566f, 0.83777f));
    var ACESOutputMat: mat3x3<f32> = mat3x3<f32>(vec3<f32>(1.60475f, -0.10208f, -0.00327f), vec3<f32>(-0.53108f, 1.10813f, -0.07276f), vec3<f32>(-0.07367f, -0.00605f, 1.07602f));

    color_7 = color_6;
    let _e79 = color_7;
    let _e80 = global.toneMappingExposure;
    color_7 = (_e79 * (_e80 / 0.6f));
    let _e84 = ACESInputMat;
    let _e85 = color_7;
    color_7 = (_e84 * _e85);
    let _e87 = color_7;
    let _e88 = RRTAndODTFit(_e87);
    color_7 = _e88;
    let _e89 = ACESOutputMat;
    let _e90 = color_7;
    color_7 = (_e89 * _e90);
    let _e92 = color_7;
    return clamp(_e92, vec3(0f), vec3(1f));
}

fn agxDefaultContrastApprox(x_16: vec3<f32>) -> vec3<f32> {
    var x_17: vec3<f32>;
    var x2_: vec3<f32>;
    var x4_: vec3<f32>;

    x_17 = x_16;
    let _e41 = x_17;
    let _e42 = x_17;
    x2_ = (_e41 * _e42);
    let _e45 = x2_;
    let _e46 = x2_;
    x4_ = (_e45 * _e46);
    let _e50 = x4_;
    let _e52 = x2_;
    let _e55 = x4_;
    let _e57 = x_17;
    let _e61 = x4_;
    let _e65 = x2_;
    let _e67 = x_17;
    let _e71 = x2_;
    let _e75 = x_17;
    return ((((((((15.5f * _e50) * _e52) - ((40.14f * _e55) * _e57)) + (31.96f * _e61)) - ((6.868f * _e65) * _e67)) + (0.4298f * _e71)) + (0.1191f * _e75)) - vec3(0.00232f));
}

fn AgXToneMapping(color_8: vec3<f32>) -> vec3<f32> {
    var color_9: vec3<f32>;
    var AgXInsetMatrix: mat3x3<f32> = mat3x3<f32>(vec3<f32>(0.85662717f, 0.13731897f, 0.11189821f), vec3<f32>(0.09512124f, 0.761242f, 0.076799415f), vec3<f32>(0.048251607f, 0.10143904f, 0.81130236f));
    var AgXOutsetMatrix: mat3x3<f32> = mat3x3<f32>(vec3<f32>(1.1271006f, -0.14132977f, -0.14132977f), vec3<f32>(-0.11060664f, 1.1578237f, -0.11060664f), vec3<f32>(-0.016493939f, -0.016493939f, 1.2519364f));
    var AgxMinEv: f32 = -12.47393f;
    var AgxMaxEv: f32 = 4.026069f;

    color_9 = color_8;
    let _e86 = color_9;
    let _e87 = global.toneMappingExposure;
    color_9 = (_e86 * _e87);
    let _e89 = color_9;
    color_9 = (LINEAR_SRGB_TO_LINEAR_REC2020_ * _e89);
    let _e91 = AgXInsetMatrix;
    let _e92 = color_9;
    color_9 = (_e91 * _e92);
    let _e94 = color_9;
    color_9 = max(_e94, vec3(0.0000000001f));
    let _e98 = color_9;
    color_9 = log2(_e98);
    let _e100 = color_9;
    let _e101 = AgxMinEv;
    let _e104 = AgxMaxEv;
    let _e105 = AgxMinEv;
    color_9 = ((_e100 - vec3(_e101)) / vec3((_e104 - _e105)));
    let _e109 = color_9;
    color_9 = clamp(_e109, vec3(0f), vec3(1f));
    let _e115 = color_9;
    let _e116 = agxDefaultContrastApprox(_e115);
    color_9 = _e116;
    let _e117 = AgXOutsetMatrix;
    let _e118 = color_9;
    color_9 = (_e117 * _e118);
    let _e122 = color_9;
    color_9 = pow(max(vec3(0f), _e122), vec3(2.2f));
    let _e127 = color_9;
    color_9 = (LINEAR_REC2020_TO_LINEAR_SRGB * _e127);
    let _e129 = color_9;
    color_9 = clamp(_e129, vec3(0f), vec3(1f));
    let _e135 = color_9;
    return _e135;
}

fn NeutralToneMapping(color_10: vec3<f32>) -> vec3<f32> {
    var color_11: vec3<f32>;
    var StartCompression: f32 = 0.76f;
    var Desaturation: f32 = 0.15f;
    var x_18: f32;
    var local: f32;
    var offset: f32;
    var peak: f32;
    var d: f32;
    var newPeak: f32;
    var g: f32;

    color_11 = color_10;
    let _e47 = color_11;
    let _e48 = global.toneMappingExposure;
    color_11 = (_e47 * _e48);
    let _e50 = color_11;
    let _e52 = color_11;
    let _e54 = color_11;
    x_18 = min(_e50.x, min(_e52.y, _e54.z));
    let _e59 = x_18;
    if (_e59 < 0.08f) {
        let _e62 = x_18;
        let _e64 = x_18;
        let _e66 = x_18;
        local = (_e62 - ((6.25f * _e64) * _e66));
    } else {
        local = 0.04f;
    }
    let _e71 = local;
    offset = _e71;
    let _e73 = color_11;
    let _e74 = offset;
    color_11 = (_e73 - vec3(_e74));
    let _e77 = color_11;
    let _e79 = color_11;
    let _e81 = color_11;
    peak = max(_e77.x, max(_e79.y, _e81.z));
    let _e86 = peak;
    let _e87 = StartCompression;
    if (_e86 < _e87) {
        let _e89 = color_11;
        return _e89;
    }
    let _e91 = StartCompression;
    d = (1f - _e91);
    let _e95 = d;
    let _e96 = d;
    let _e98 = peak;
    let _e99 = d;
    let _e101 = StartCompression;
    newPeak = (1f - ((_e95 * _e96) / ((_e98 + _e99) - _e101)));
    let _e106 = color_11;
    let _e107 = newPeak;
    let _e108 = peak;
    color_11 = (_e106 * (_e107 / _e108));
    let _e113 = Desaturation;
    let _e114 = peak;
    let _e115 = newPeak;
    g = (1f - (1f / ((_e113 * (_e114 - _e115)) + 1f)));
    let _e123 = color_11;
    let _e124 = newPeak;
    let _e126 = g;
    return mix(_e123, vec3(_e124), vec3(_e126));
}

fn CustomToneMapping(color_12: vec3<f32>) -> vec3<f32> {
    var color_13: vec3<f32>;

    color_13 = color_12;
    let _e41 = color_13;
    return _e41;
}

fn aces(x_19: vec3<f32>) -> vec3<f32> {
    var x_20: vec3<f32>;
    var a_1: f32 = 2.51f;
    var b_1: f32 = 0.03f;
    var c: f32 = 2.43f;
    var d_1: f32 = 0.59f;
    var e: f32 = 0.14f;

    x_20 = x_19;
    let _e52 = x_20;
    let _e53 = a_1;
    let _e54 = x_20;
    let _e56 = b_1;
    let _e60 = x_20;
    let _e61 = c;
    let _e62 = x_20;
    let _e64 = d_1;
    let _e68 = e;
    return clamp(((_e52 * ((_e53 * _e54) + vec3(_e56))) / ((_e60 * ((_e61 * _e62) + vec3(_e64))) + vec3(_e68))), vec3(0f), vec3(1f));
}

fn toSRGB(c_1: vec3<f32>) -> vec3<f32> {
    var c_2: vec3<f32>;

    c_2 = c_1;
    let _e42 = c_2;
    let _e46 = c_2;
    let _e57 = c_2;
    return mix((_e42 * 12.92f), ((1.055f * pow(_e46, vec3(0.41666666f))) - vec3(0.055f)), step(vec3(0.0031308f), _e57));
}

fn main_1() {
    var aT: f32;
    var exposure: f32;
    var c_3: vec3<f32>;
    var d_2: vec2<f32>;
    var acc: vec3<f32>;
    var i: i32 = 1i;
    var scot: f32;
    var Yl: f32;
    var v_2: f32;
    var t: vec3<f32>;
    var n: f32;
    var local_1: vec4<f32>;

    let _e43 = textureSampleLevel(tAdaptTexture, tAdaptSampler, vec2(0.5f), 0f);
    aT = _e43.x;
    let _e46 = global.uKey;
    let _e47 = aT;
    let _e55 = aT;
    let _e56 = global.uNightShift;
    let _e63 = global.uMinExp;
    let _e64 = global.uMaxExp;
    let _e66 = global.uExposureBias;
    exposure = (clamp(((_e46 / exp2(_e47)) * exp2((-0.1f * max(0f, (-8f - (_e55 - _e56)))))), _e63, _e64) * _e66);
    let _e69 = vUv_1;
    let _e71 = textureSampleLevel(tColorTexture, tColorSampler, _e69, 0f);
    c_3 = _e71.xyz;
    let _e74 = global.uRadial;
    if (_e74 > 0.001f) {
        {
            let _e77 = vUv_1;
            d_2 = (_e77 - vec2(0.5f));
            let _e82 = c_3;
            acc = _e82;
            loop {
                let _e86 = i;
                if !((_e86 < 10i)) {
                    break;
                }
                let _e93 = acc;
                let _e95 = d_2;
                let _e97 = global.uRadial;
                let _e100 = i;
                let _e108 = textureSampleLevel(tColorTexture, tColorSampler, (vec2(0.5f) + (_e95 * (1f - ((_e97 * 0.05f) * f32(_e100))))), 0f);
                acc = (_e93 + _e108.xyz);
                continuing {
                    let _e90 = i;
                    i = (_e90 + 1i);
                }
            }
            let _e111 = c_3;
            let _e112 = acc;
            let _e121 = global.uRadial;
            c_3 = mix(_e111, ((_e112 / vec3(10f)) * vec3<f32>(0.85f, 0.95f, 1.25f)), vec3(clamp(_e121, 0f, 1f)));
        }
    }
    let _e127 = c_3;
    let _e128 = finite_isnan_2(_e127);
    if any(_e128) {
        c_3 = vec3(0f);
    }
    let _e132 = c_3;
    c_3 = min(_e132, vec3(60000f));
    let _e136 = c_3;
    let _e137 = exposure;
    c_3 = (_e136 * _e137);
    let _e139 = c_3;
    let _e140 = vUv_1;
    let _e142 = textureSampleLevel(tBloomTexture, tBloomSampler, _e140, 0f);
    let _e144 = global.uBloom;
    c_3 = (_e139 + (_e142.xyz * _e144));
    let _e155 = textureSampleLevel(tAdaptTexture, tAdaptSampler, vec2(0.5f), 0f);
    let _e157 = global.uNightShift;
    scot = (1f - smoothstep(-24.3f, -14.3f, (_e155.x - _e157)));
    let _e162 = scot;
    if (_e162 > 0f) {
        {
            let _e165 = c_3;
            Yl = dot(_e165, vec3<f32>(0.2126f, 0.7152f, 0.0722f));
            let _e172 = c_3;
            let _e173 = Yl;
            let _e180 = scot;
            c_3 = mix(_e172, (_e173 * vec3<f32>(0.55f, 0.82f, 1.55f)), vec3((0.8f * _e180)));
        }
    }
    let _e184 = c_3;
    let _e185 = global.uWhiteBalance;
    c_3 = (_e184 * _e185);
    let _e187 = c_3;
    let _e188 = global.uFlash;
    c_3 = (_e187 + _e188);
    let _e191 = global.uVignette;
    let _e192 = vUv_1;
    v_2 = (1f - (_e191 * pow((length((_e192 - vec2(0.5f))) * 1.25f), 2.4f)));
    let _e204 = c_3;
    let _e205 = v_2;
    c_3 = (_e204 * _e205);
    let _e207 = global.uToneCurve;
    if (_e207 > 0.5f) {
        {
            let _e210 = c_3;
            let _e211 = AgXToneMapping(_e210);
            c_3 = _e211;
            let _e212 = c_3;
            let _e219 = c_3;
            c_3 = clamp(mix(vec3(dot(_e212, vec3<f32>(0.2126f, 0.7152f, 0.0722f))), _e219, vec3(1.4f)), vec3(0f), vec3(1f));
            let _e229 = c_3;
            t = ((2f * pow(_e229, vec3(0.45454544f))) - vec3(1f));
            let _e240 = t;
            let _e241 = global.uContrast;
            let _e242 = t;
            let _e245 = t;
            let _e246 = t;
            t = (_e240 + ((_e241 * _e242) * (vec3(1f) - (_e245 * _e246))));
            let _e253 = t;
            c_3 = pow(clamp(((0.5f * _e253) + vec3(0.5f)), vec3(0f), vec3(1f)), vec3(2.2f));
        }
    } else {
        let _e266 = c_3;
        let _e267 = aces(_e266);
        c_3 = _e267;
    }
    let _e269 = gl_FragCoord_1;
    let _e271 = global.uTime;
    n = (fract((sin(dot((_e269.xy + vec2(_e271)), vec2<f32>(12.9898f, 78.233f))) * 43758.547f)) - 0.5f);
    let _e285 = global.uEncode;
    if (_e285 > 0.5f) {
        let _e288 = c_3;
        let _e289 = toSRGB(_e288);
        let _e290 = n;
        let _e294 = (_e289 + vec3((_e290 / 255f)));
        local_1 = vec4<f32>(_e294.x, _e294.y, _e294.z, 1f);
    } else {
        let _e300 = c_3;
        local_1 = vec4<f32>(_e300.x, _e300.y, _e300.z, 1f);
    }
    let _e307 = local_1;
    fragmentColor = _e307;
    return;
}

@fragment 
fn main(@location(0) vUv: vec2<f32>, @builtin(position) gl_FragCoord: vec4<f32>) -> FragmentOutput {
    vUv_1 = vUv;
    gl_FragCoord_1 = gl_FragCoord;
    main_1();
    let _e55 = fragmentColor;
    return FragmentOutput(_e55);
}
`;
