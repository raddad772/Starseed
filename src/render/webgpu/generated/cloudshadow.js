// Generated offline from the existing renderer equations. See tools/shaders/.
export const layout = {
  "uniforms": [
    {
      "name": "uCloudMapMean",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 0
    },
    {
      "name": "uRadius",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 4
    },
    {
      "name": "uDeck",
      "type": "vec4",
      "count": 3,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 16
    },
    {
      "name": "uNumDecks",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 64
    },
    {
      "name": "uMode",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 68
    },
    {
      "name": "uSigmaG",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 72
    },
    {
      "name": "uShape",
      "type": "vec2",
      "count": 0,
      "align": 8,
      "size": 8,
      "stride": 8,
      "offset": 80
    },
    {
      "name": "uBands",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 88
    },
    {
      "name": "uJetPhase",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 92
    },
    {
      "name": "uEqJet",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 96
    },
    {
      "name": "uWindMax",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 100
    },
    {
      "name": "uO",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 112
    },
    {
      "name": "uE",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 128
    },
    {
      "name": "uN",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 144
    },
    {
      "name": "uL",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 156
    },
    {
      "name": "uSunF",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 160
    },
    {
      "name": "uSigmaS",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 172
    },
    {
      "name": "uCloudYear",
      "type": "vec2",
      "count": 0,
      "align": 8,
      "size": 8,
      "stride": 8,
      "offset": 176
    },
    {
      "name": "uCloudClock",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 192
    },
    {
      "name": "uCloudWind",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 208
    }
  ],
  "textures": [
    {
      "name": "tNoise",
      "type": "sampler3D",
      "count": 0,
      "binding": 1,
      "samplerBinding": 2
    },
    {
      "name": "tCloudMap",
      "type": "sampler2D",
      "count": 0,
      "binding": 3,
      "samplerBinding": 4
    }
  ],
  "bytes": 224,
  "group": 0
};
export const code = /* wgsl */`
struct Params {
    uCloudMapMean: f32,
    uRadius: f32,
    uDeck: array<vec4<f32>, 3>,
    uNumDecks: f32,
    uMode: f32,
    uSigmaG: f32,
    uShape: vec2<f32>,
    uBands: f32,
    uJetPhase: f32,
    uEqJet: f32,
    uWindMax: f32,
    uO: vec3<f32>,
    uE: vec3<f32>,
    uN: vec3<f32>,
    uL: f32,
    uSunF: vec3<f32>,
    uSigmaS: f32,
    uCloudYear: vec2<f32>,
    uCloudClock: vec4<f32>,
    uCloudWind: vec4<f32>,
}

struct FragmentOutput {
    @location(0) outC: vec4<f32>,
}

@group(0) @binding(0) 
var<uniform> global: Params;
@group(0) @binding(1) 
var tNoiseTexture: texture_3d<f32>;
@group(0) @binding(2) 
var tNoiseSampler: sampler;
@group(0) @binding(3) 
var tCloudMapTexture: texture_2d<f32>;
@group(0) @binding(4) 
var tCloudMapSampler: sampler;
var<private> vUv_1: vec2<f32>;
var<private> outC: vec4<f32>;
var<private> gDeckFoot: f32 = 0f;

fn cloudN(n: f32) -> f32 {
    var n_1: f32;

    n_1 = n;
    let _e49 = n_1;
    return (0.55f + ((_e49 - 0.682f) * 4.3f));
}

fn cloudBias(cover: f32) -> f32 {
    var cover_1: f32;

    cover_1 = cover;
    let _e48 = cover_1;
    let _e56 = cover_1;
    let _e64 = cover_1;
    return ((((_e48 - 0.5f) * 0.3f) + (0.5f * smoothstep(0.8f, 1f, _e56))) - (0.5f * (1f - smoothstep(0f, 0.2f, _e64))));
}

fn cloudFade(foot: f32, L: f32) -> f32 {
    var foot_1: f32;
    var L_1: f32;

    foot_1 = foot;
    L_1 = L;
    let _e52 = foot_1;
    let _e55 = L_1;
    return smoothstep(1f, 4f, ((_e52 * 64f) / _e55));
}

fn cloudMapSmooth(uv: vec2<f32>) -> vec3<f32> {
    var uv_1: vec2<f32>;
    var sz: vec2<f32>;
    var st: vec2<f32>;
    var i: vec2<f32>;
    var f: vec2<f32>;
    var f2_: vec2<f32>;
    var f3_: vec2<f32>;
    var w0_: vec2<f32>;
    var w1_: vec2<f32>;
    var w2_: vec2<f32>;
    var w3_: vec2<f32>;
    var g0_: vec2<f32>;
    var g1_: vec2<f32>;
    var h0_: vec2<f32>;
    var h1_: vec2<f32>;

    uv_1 = uv;
    let _e49 = textureDimensions(tCloudMapTexture, 0i);
    sz = vec2<f32>(vec2<i32>(_e49));
    let _e53 = uv_1;
    let _e54 = sz;
    st = ((_e53 * _e54) - vec2(0.5f));
    let _e60 = st;
    i = floor(_e60);
    let _e63 = st;
    let _e64 = i;
    f = (_e63 - _e64);
    let _e67 = f;
    let _e68 = f;
    f2_ = (_e67 * _e68);
    let _e71 = f2_;
    let _e72 = f;
    f3_ = (_e71 * _e72);
    let _e77 = f;
    let _e82 = f2_;
    let _e85 = f3_;
    w0_ = ((((vec2(1f) - (3f * _e77)) + (3f * _e82)) - _e85) / vec2(6f));
    let _e93 = f2_;
    let _e98 = f3_;
    w1_ = (((vec2(4f) - (6f * _e93)) + (3f * _e98)) / vec2(6f));
    let _e107 = f;
    let _e112 = f2_;
    let _e116 = f3_;
    w2_ = ((((vec2(1f) + (3f * _e107)) + (3f * _e112)) - (3f * _e116)) / vec2(6f));
    let _e123 = f3_;
    w3_ = (_e123 / vec2(6f));
    let _e128 = w0_;
    let _e129 = w1_;
    g0_ = (_e128 + _e129);
    let _e132 = w2_;
    let _e133 = w3_;
    g1_ = (_e132 + _e133);
    let _e136 = i;
    let _e140 = w1_;
    let _e141 = g0_;
    let _e144 = sz;
    h0_ = (((_e136 - vec2(0.5f)) + (_e140 / _e141)) / _e144);
    let _e147 = i;
    let _e151 = w3_;
    let _e152 = g1_;
    let _e155 = sz;
    h1_ = (((_e147 + vec2(1.5f)) + (_e151 / _e152)) / _e155);
    let _e158 = g0_;
    let _e160 = g0_;
    let _e162 = h0_;
    let _e164 = textureSampleLevel(tCloudMapTexture, tCloudMapSampler, _e162, 0f);
    let _e167 = g1_;
    let _e169 = h1_;
    let _e171 = h0_;
    let _e175 = textureSampleLevel(tCloudMapTexture, tCloudMapSampler, vec2<f32>(_e169.x, _e171.y), 0f);
    let _e180 = g1_;
    let _e182 = g0_;
    let _e184 = h0_;
    let _e186 = h1_;
    let _e190 = textureSampleLevel(tCloudMapTexture, tCloudMapSampler, vec2<f32>(_e184.x, _e186.y), 0f);
    let _e193 = g1_;
    let _e195 = h1_;
    let _e197 = textureSampleLevel(tCloudMapTexture, tCloudMapSampler, _e195, 0f);
    return ((_e158.y * ((_e160.x * _e164.xyz) + (_e167.x * _e175.xyz))) + (_e180.y * ((_e182.x * _e190.xyz) + (_e193.x * _e197.xyz))));
}

fn cloudClimate(dirF: vec3<f32>) -> f32 {
    var dirF_1: vec3<f32>;
    var lat: f32;
    var cm: vec3<f32>;

    dirF_1 = dirF;
    let _e48 = dirF_1;
    lat = asin(clamp(_e48.y, -1f, 1f));
    let _e56 = global.uCloudMapMean;
    if (_e56 <= 0f) {
        let _e60 = lat;
        return (0.12f * cos((abs(_e60) * 6f)));
    }
    let _e66 = dirF_1;
    let _e68 = dirF_1;
    let _e75 = lat;
    let _e81 = cloudMapSmooth(vec2<f32>(((atan2(_e66.z, _e68.x) / 6.2832f) + 0.5f), ((_e75 / 3.14159f) + 0.5f)));
    cm = _e81;
    let _e83 = cm;
    let _e85 = cm;
    let _e89 = global.uCloudYear;
    let _e93 = cm;
    let _e97 = global.uCloudYear;
    let _e101 = global.uCloudMapMean;
    return ((((_e83.x + ((_e85.y - 0.5f) * _e89.x)) + ((_e93.z - 0.5f) * _e97.y)) - _e101) * 0.8f);
}

fn cloudCoverC(q: vec3<f32>, foot_2: f32, bias: f32, clim: f32) -> f32 {
    var q_1: vec3<f32>;
    var foot_3: f32;
    var bias_1: f32;
    var clim_1: f32;
    var L0_: f32;
    var L1_: f32;
    var f0_: f32;
    var f1_: f32;
    var qz: vec3<f32>;
    var local: f32;
    var a: f32;
    var local_1: f32;
    var b: f32;
    var spread: f32;

    q_1 = q;
    foot_3 = foot_2;
    bias_1 = bias;
    clim_1 = clim;
    let _e54 = global.uRadius;
    L0_ = (_e54 * 1f);
    let _e58 = global.uRadius;
    L1_ = (_e58 * 0.236f);
    let _e62 = foot_3;
    let _e63 = L0_;
    let _e64 = cloudFade(_e62, _e63);
    f0_ = _e64;
    let _e66 = foot_3;
    let _e67 = L1_;
    let _e68 = cloudFade(_e66, _e67);
    f1_ = _e68;
    let _e70 = q_1;
    qz = (_e70 * vec3<f32>(0.5f, 1f, 0.5f));
    let _e77 = f0_;
    if (_e77 > 0.999f) {
        local = 0.682f;
    } else {
        let _e81 = qz;
        let _e82 = L0_;
        let _e86 = textureSampleLevel(tNoiseTexture, tNoiseSampler, (_e81 / vec3(_e82)), 0f);
        let _e89 = f0_;
        local = mix(_e86.x, 0.682f, _e89);
    }
    let _e92 = local;
    a = _e92;
    let _e94 = f1_;
    if (_e94 > 0.999f) {
        local_1 = 0.682f;
    } else {
        let _e98 = qz;
        let _e99 = L1_;
        let _e106 = textureSampleLevel(tNoiseTexture, tNoiseSampler, ((_e98 / vec3(_e99)) + vec3(0.5f)), 0f);
        let _e109 = f1_;
        local_1 = mix(_e106.x, 0.682f, _e109);
    }
    let _e112 = local_1;
    b = _e112;
    let _e115 = f0_;
    let _e118 = f1_;
    spread = length(vec2<f32>((0.124f * _e115), (0.083f * _e118)));
    let _e124 = bias_1;
    let _e126 = spread;
    let _e129 = bias_1;
    let _e131 = spread;
    let _e133 = a;
    let _e136 = b;
    let _e140 = cloudN(((_e133 * 0.6f) + (_e136 * 0.4f)));
    let _e141 = clim_1;
    return smoothstep(((0.6f - _e124) - _e126), ((0.8f - _e129) + _e131), (_e140 + _e141));
}

fn cloudCover(q_2: vec3<f32>, dirF_2: vec3<f32>, foot_4: f32, bias_2: f32) -> f32 {
    var q_3: vec3<f32>;
    var dirF_3: vec3<f32>;
    var foot_5: f32;
    var bias_3: f32;

    q_3 = q_2;
    dirF_3 = dirF_2;
    foot_5 = foot_4;
    bias_3 = bias_2;
    let _e54 = q_3;
    let _e55 = foot_5;
    let _e56 = bias_3;
    let _e57 = dirF_3;
    let _e58 = cloudClimate(_e57);
    let _e59 = cloudCoverC(_e54, _e55, _e56, _e58);
    return _e59;
}

fn cloudDetail(q_4: vec3<f32>, foot_6: f32) -> f32 {
    var q_5: vec3<f32>;
    var foot_7: f32;
    var L2_: f32;
    var f_1: f32;
    var local_2: f32;

    q_5 = q_4;
    foot_7 = foot_6;
    let _e50 = global.uRadius;
    L2_ = (_e50 * 0.064f);
    let _e54 = foot_7;
    let _e55 = L2_;
    let _e56 = cloudFade(_e54, _e55);
    f_1 = _e56;
    let _e58 = f_1;
    if (_e58 > 0.999f) {
        local_2 = 0.682f;
    } else {
        let _e62 = q_5;
        let _e63 = L2_;
        let _e67 = textureSampleLevel(tNoiseTexture, tNoiseSampler, (_e62 / vec3(_e63)), 0f);
        let _e70 = f_1;
        local_2 = mix(_e67.x, 0.682f, _e70);
    }
    let _e73 = local_2;
    return _e73;
}

fn cloudGens(dirF_4: vec3<f32>, gA: ptr<function, vec3<f32>>, gB: ptr<function, vec3<f32>>) {
    var dirF_5: vec3<f32>;
    var T: f32;
    var ph: f32;
    var s: f32;
    var a_1: f32;
    var fa: f32;
    var b_1: f32;
    var fb: f32;
    var j: f32;
    var fj: f32;
    var wa: f32;

    dirF_5 = dirF_4;
    let _e50 = global.uCloudClock;
    T = _e50.z;
    let _e53 = T;
    if (_e53 <= 0f) {
        {
            (*gA) = vec3<f32>(1f, 0f, 0f);
            (*gB) = vec3(0f);
            return;
        }
    }
    let _e63 = dirF_5;
    let _e67 = dirF_5;
    let _e72 = dirF_5;
    let _e78 = dirF_5;
    let _e82 = dirF_5;
    let _e87 = dirF_5;
    ph = ((((1.1f * _e63.x) + (0.7f * _e67.z)) - (0.5f * _e72.y)) + (0.35f * sin((((2.3f * _e78.y) + (1.7f * _e82.x)) - (0.9f * _e87.z)))));
    let _e95 = global.uCloudClock;
    let _e97 = T;
    let _e99 = ph;
    s = (((_e95.x / _e97) + _e99) + 4f);
    let _e104 = s;
    a_1 = floor(_e104);
    let _e107 = s;
    let _e108 = a_1;
    fa = (_e107 - _e108);
    let _e111 = s;
    b_1 = floor((_e111 + 0.5f));
    let _e116 = s;
    let _e119 = b_1;
    fb = ((_e116 + 0.5f) - _e119);
    let _e123 = dirF_5;
    let _e133 = dirF_5;
    let _e145 = dirF_5;
    j = (0.065f * ((sin((dot(_e123, vec3<f32>(5.1f, 3.7f, -4.3f)) + 1.3f)) + sin((dot(_e133, vec3<f32>(-3.9f, 7.3f, 6.1f)) + 0.4f))) + (0.6f * sin((dot(_e145, vec3<f32>(11.3f, -8.9f, 7.7f)) + 2.1f)))));
    let _e159 = s;
    let _e160 = j;
    fj = fract((_e159 + _e160));
    let _e168 = fj;
    wa = smoothstep(0.4f, 0.6f, (1f - abs(((2f * _e168) - 1f))));
    let _e176 = wa;
    let _e177 = fa;
    let _e180 = T;
    let _e183 = global.uCloudClock;
    let _e185 = a_1;
    (*gA) = vec3<f32>(_e176, ((_e177 - 0.5f) * _e180), (2f * (_e183.y + _e185)));
    let _e190 = wa;
    let _e192 = fb;
    let _e195 = T;
    let _e198 = global.uCloudClock;
    let _e200 = b_1;
    (*gB) = vec3<f32>((1f - _e190), ((_e192 - 0.5f) * _e195), ((2f * (_e198.y + _e200)) + 1f));
    return;
}

fn cloudGenOff(idx: f32) -> vec3<f32> {
    var idx_1: f32;
    var h: u32;

    idx_1 = idx;
    let _e48 = idx_1;
    h = (u32(_e48) * 2654435761u);
    let _e53 = h;
    let _e54 = h;
    h = (_e53 ^ (_e54 >> 15u));
    let _e58 = h;
    h = (_e58 * 2246822519u);
    let _e61 = h;
    let _e62 = h;
    h = (_e61 ^ (_e62 >> 13u));
    let _e66 = h;
    let _e70 = h;
    let _e76 = h;
    return (((vec3<f32>(f32((_e66 & 1023u)), f32(((_e70 >> 10u) & 1023u)), f32(((_e76 >> 20u) & 1023u))) / vec3(1024f)) - vec3(0.5f)) * 400000f);
}

fn cloudAdvect(pf: vec3<f32>, dirF_6: vec3<f32>, g: vec3<f32>) -> vec3<f32> {
    var pf_1: vec3<f32>;
    var dirF_7: vec3<f32>;
    var g_1: vec3<f32>;
    var lat_1: f32;
    var U: f32;
    var east: vec3<f32>;

    pf_1 = pf;
    dirF_7 = dirF_6;
    g_1 = g;
    let _e52 = dirF_7;
    lat_1 = asin(clamp(_e52.y, -1f, 1f));
    let _e60 = global.uCloudWind;
    let _e62 = lat_1;
    let _e63 = global.uCloudWind;
    let _e68 = global.uCloudWind;
    let _e74 = global.uCloudWind;
    let _e76 = lat_1;
    let _e78 = lat_1;
    U = (_e60.x * (sin((((_e62 * _e63.y) * 2f) + (_e68.z * 6.2832f))) + (_e74.w * exp(((-(_e76) * _e78) * 40f)))));
    let _e87 = dirF_7;
    let _e91 = dirF_7;
    east = normalize((vec3<f32>(-(_e87.z), 0f, _e91.x) + vec3<f32>(0.000001f, 0f, 0f)));
    let _e101 = pf_1;
    let _e102 = east;
    let _e103 = U;
    let _e105 = g_1;
    let _e109 = g_1;
    let _e111 = cloudGenOff(_e109.z);
    return ((_e101 + ((_e102 * _e103) * _e105.y)) + _e111);
}

fn cloudCoverG(pf_2: vec3<f32>, dirF_8: vec3<f32>, foot_8: f32, bias_4: f32) -> f32 {
    var pf_3: vec3<f32>;
    var dirF_9: vec3<f32>;
    var foot_9: f32;
    var bias_5: f32;
    var gA_1: vec3<f32>;
    var gB_1: vec3<f32>;
    var c: f32 = 0f;
    var clim_2: f32;

    pf_3 = pf_2;
    dirF_9 = dirF_8;
    foot_9 = foot_8;
    bias_5 = bias_4;
    let _e56 = dirF_9;
    cloudGens(_e56, (&gA_1), (&gB_1));
    let _e63 = dirF_9;
    let _e64 = cloudClimate(_e63);
    clim_2 = _e64;
    let _e66 = gA_1;
    if (_e66.x > 0.005f) {
        let _e70 = c;
        let _e71 = gA_1;
        let _e73 = pf_3;
        let _e74 = dirF_9;
        let _e75 = gA_1;
        let _e76 = cloudAdvect(_e73, _e74, _e75);
        let _e77 = foot_9;
        let _e78 = bias_5;
        let _e79 = clim_2;
        let _e80 = cloudCoverC(_e76, _e77, _e78, _e79);
        c = (_e70 + (_e71.x * _e80));
    }
    let _e83 = gB_1;
    if (_e83.x > 0.005f) {
        let _e87 = c;
        let _e88 = gB_1;
        let _e90 = pf_3;
        let _e91 = dirF_9;
        let _e92 = gB_1;
        let _e93 = cloudAdvect(_e90, _e91, _e92);
        let _e94 = foot_9;
        let _e95 = bias_5;
        let _e96 = clim_2;
        let _e97 = cloudCoverC(_e93, _e94, _e95, _e96);
        c = (_e87 + (_e88.x * _e97));
    }
    let _e100 = c;
    return _e100;
}

fn coverage(i_1: i32, dirF_10: vec3<f32>, q_6: vec3<f32>, foot_10: f32, clim_3: f32) -> f32 {
    var i_2: i32;
    var dirF_11: vec3<f32>;
    var q_7: vec3<f32>;
    var foot_11: f32;
    var clim_4: f32;
    var lat_2: f32;
    var band: f32;
    var n_2: f32;

    i_2 = i_1;
    dirF_11 = dirF_10;
    q_7 = q_6;
    foot_11 = foot_10;
    clim_4 = clim_3;
    let _e56 = dirF_11;
    lat_2 = asin(clamp(_e56.y, -1f, 1f));
    let _e64 = global.uMode;
    if (_e64 < 0.5f) {
        {
            let _e67 = lat_2;
            let _e68 = global.uBands;
            let _e72 = global.uJetPhase;
            let _e77 = lat_2;
            let _e78 = global.uBands;
            band = sin(((((_e67 * _e68) * 2f) + (_e72 * 6.2832f)) + (0.6f * sin(((_e77 * _e78) * 0.7f)))));
            let _e87 = q_7;
            let _e92 = textureSampleLevel(tNoiseTexture, tNoiseSampler, (_e87 / vec3(70000f)), 0f);
            n_2 = (_e92.x - 0.5f);
            let _e97 = i_2;
            if (_e97 == 0i) {
                let _e103 = band;
                let _e106 = n_2;
                let _e112 = global.uDeck[0];
                return smoothstep(-0.1f, 0.7f, (((_e103 * 0.8f) + (_e106 * 1.3f)) + _e112.w));
            }
            let _e116 = i_2;
            if (_e116 == 1i) {
                let _e122 = n_2;
                let _e129 = global.uDeck[1];
                return smoothstep(-0.45f, 0.45f, (((_e122 * 1.5f) + 0.1f) + _e129.w));
            }
            let _e135 = q_7;
            let _e143 = textureSampleLevel(tNoiseTexture, tNoiseSampler, ((_e135 / vec3(42000f)) + vec3(0.37f)), 0f);
            let _e147 = global.uDeck[2];
            return smoothstep(0.2f, 0.62f, (_e143.y + _e147.w));
        }
    }
    let _e151 = q_7;
    let _e152 = foot_11;
    let _e153 = i_2;
    let _e155 = global.uDeck[_e153];
    let _e157 = clim_4;
    let _e158 = cloudCoverC(_e151, _e152, _e155.w, _e157);
    return _e158;
}

fn deckDensity(i_3: i32, q_8: vec3<f32>, h_1: f32, cov: f32, detail: bool, frac: ptr<function, f32>) -> f32 {
    var i_4: i32;
    var q_9: vec3<f32>;
    var h_2: f32;
    var cov_1: f32;
    var detail_1: bool;
    var dk: vec4<f32>;
    var raw: f32;
    var base: f32;
    var tower: f32;
    var top: f32;
    var x: f32;
    var e: f32;
    var xt: f32;
    var prof: f32;
    var d: f32;
    var det: vec4<f32>;
    var er: f32;

    i_4 = i_3;
    q_9 = q_8;
    h_2 = h_1;
    cov_1 = cov;
    detail_1 = detail;
    let _e58 = i_4;
    let _e60 = global.uDeck[_e58];
    dk = _e60;
    let _e62 = q_9;
    let _e63 = global.uShape;
    let _e68 = textureSampleLevel(tNoiseTexture, tNoiseSampler, (_e62 / vec3(_e63.x)), 0f);
    raw = _e68.x;
    let _e73 = raw;
    let _e75 = raw;
    let _e76 = gDeckFoot;
    let _e77 = global.uShape;
    let _e79 = cloudFade(_e76, _e77.x);
    base = mix(smoothstep(0.58f, 0.78f, _e73), _e75, _e79);
    let _e82 = q_9;
    let _e83 = global.uShape;
    let _e93 = textureSampleLevel(tNoiseTexture, tNoiseSampler, ((_e82 / vec3((_e83.x * 4f))) + vec3(0.21f)), 0f);
    tower = _e93.y;
    let _e96 = dk;
    let _e98 = dk;
    let _e100 = dk;
    let _e106 = tower;
    top = (_e96.y - (((_e98.y - _e100.x) * 0.55f) * (1f - _e106)));
    let _e111 = h_2;
    let _e112 = dk;
    let _e115 = top;
    let _e116 = dk;
    x = ((_e111 - _e112.x) / max((_e115 - _e116.x), 1f));
    let _e123 = x;
    (*frac) = clamp(_e123, 0f, 1f);
    let _e127 = x;
    let _e130 = x;
    if ((_e127 < 0f) || (_e130 > 1f)) {
        return 0f;
    }
    let _e135 = base;
    let _e137 = cov_1;
    let _e140 = cov_1;
    e = clamp(((_e135 - (1f - _e137)) / max(_e140, 0.05f)), 0f, 1f);
    let _e148 = e;
    xt = sqrt(_e148);
    let _e151 = x;
    let _e152 = xt;
    if (_e151 > _e152) {
        return 0f;
    }
    let _e157 = x;
    let _e161 = xt;
    let _e163 = xt;
    let _e164 = x;
    prof = (smoothstep(0f, 0.08f, _e157) * (1f - smoothstep((0.6f * _e161), _e163, _e164)));
    let _e169 = e;
    let _e170 = prof;
    d = (_e169 * _e170);
    let _e173 = detail_1;
    let _e174 = d;
    if (_e173 && (_e174 > 0.001f)) {
        {
            let _e178 = q_9;
            let _e179 = global.uShape;
            let _e184 = textureSampleLevel(tNoiseTexture, tNoiseSampler, (_e178 / vec3(_e179.y)), 0f);
            det = _e184;
            let _e186 = det;
            let _e190 = det;
            let _e195 = det;
            let _e203 = d;
            er = (((((_e186.y * 0.625f) + (_e190.z * 0.25f)) + (_e195.w * 0.125f)) * 0.55f) * (1f - _e203));
            let _e207 = d;
            let _e208 = er;
            let _e211 = er;
            d = clamp(((_e207 - _e208) / max((1f - _e211), 0.05f)), 0f, 1f);
        }
    }
    let _e219 = d;
    let _e220 = dk;
    return (_e219 * _e220.z);
}

fn deckCovG(i_5: i32, pf_4: vec3<f32>, dirF_12: vec3<f32>, foot_12: f32, gA_2: vec3<f32>, gB_2: vec3<f32>, clim_5: f32) -> vec2<f32> {
    var i_6: i32;
    var pf_5: vec3<f32>;
    var dirF_13: vec3<f32>;
    var foot_13: f32;
    var gA_3: vec3<f32>;
    var gB_3: vec3<f32>;
    var clim_6: f32;
    var local_3: f32;
    var local_4: f32;

    i_6 = i_5;
    pf_5 = pf_4;
    dirF_13 = dirF_12;
    foot_13 = foot_12;
    gA_3 = gA_2;
    gB_3 = gB_2;
    clim_6 = clim_5;
    let _e61 = gA_3;
    if (_e61.x > 0.005f) {
        let _e65 = i_6;
        let _e66 = dirF_13;
        let _e67 = pf_5;
        let _e68 = dirF_13;
        let _e69 = gA_3;
        let _e70 = cloudAdvect(_e67, _e68, _e69);
        let _e71 = foot_13;
        let _e72 = clim_6;
        let _e73 = coverage(_e65, _e66, _e70, _e71, _e72);
        local_3 = _e73;
    } else {
        local_3 = 0f;
    }
    let _e76 = local_3;
    let _e77 = gB_3;
    if (_e77.x > 0.005f) {
        let _e81 = i_6;
        let _e82 = dirF_13;
        let _e83 = pf_5;
        let _e84 = dirF_13;
        let _e85 = gB_3;
        let _e86 = cloudAdvect(_e83, _e84, _e85);
        let _e87 = foot_13;
        let _e88 = clim_6;
        let _e89 = coverage(_e81, _e82, _e86, _e87, _e88);
        local_4 = _e89;
    } else {
        local_4 = 0f;
    }
    let _e92 = local_4;
    return vec2<f32>(_e76, _e92);
}

fn deckDenG(i_7: i32, pf_6: vec3<f32>, dirF_14: vec3<f32>, h_3: f32, cv: vec2<f32>, gA_4: vec3<f32>, gB_4: vec3<f32>, detail_2: bool, frac_1: ptr<function, f32>) -> f32 {
    var i_8: i32;
    var pf_7: vec3<f32>;
    var dirF_15: vec3<f32>;
    var h_4: f32;
    var cv_1: vec2<f32>;
    var gA_5: vec3<f32>;
    var gB_5: vec3<f32>;
    var detail_3: bool;
    var d_1: f32 = 0f;
    var fa_1: f32 = 0.5f;
    var fb_1: f32 = 0.5f;
    var local_5: f32;

    i_8 = i_7;
    pf_7 = pf_6;
    dirF_15 = dirF_14;
    h_4 = h_3;
    cv_1 = cv;
    gA_5 = gA_4;
    gB_5 = gB_4;
    detail_3 = detail_2;
    let _e70 = gA_5;
    if (_e70.x > 0.005f) {
        let _e74 = d_1;
        let _e75 = gA_5;
        let _e77 = i_8;
        let _e78 = pf_7;
        let _e79 = dirF_15;
        let _e80 = gA_5;
        let _e81 = cloudAdvect(_e78, _e79, _e80);
        let _e82 = h_4;
        let _e83 = cv_1;
        let _e85 = detail_3;
        let _e88 = deckDensity(_e77, _e81, _e82, _e83.x, _e85, (&fa_1));
        d_1 = (_e74 + (_e75.x * _e88));
    }
    let _e91 = gB_5;
    if (_e91.x > 0.005f) {
        let _e95 = d_1;
        let _e96 = gB_5;
        let _e98 = i_8;
        let _e99 = pf_7;
        let _e100 = dirF_15;
        let _e101 = gB_5;
        let _e102 = cloudAdvect(_e99, _e100, _e101);
        let _e103 = h_4;
        let _e104 = cv_1;
        let _e106 = detail_3;
        let _e109 = deckDensity(_e98, _e102, _e103, _e104.y, _e106, (&fb_1));
        d_1 = (_e95 + (_e96.x * _e109));
    }
    let _e112 = gA_5;
    let _e114 = gB_5;
    if (_e112.x >= _e114.x) {
        let _e117 = fa_1;
        local_5 = _e117;
    } else {
        let _e118 = fb_1;
        local_5 = _e118;
    }
    let _e120 = local_5;
    (*frac_1) = _e120;
    let _e121 = d_1;
    return _e121;
}

fn toRadius(p: vec3<f32>, d_2: vec3<f32>, rr: f32) -> f32 {
    var p_1: vec3<f32>;
    var d_3: vec3<f32>;
    var rr_1: f32;
    var b_2: f32;
    var c_1: f32;

    p_1 = p;
    d_3 = d_2;
    rr_1 = rr;
    let _e53 = p_1;
    let _e54 = d_3;
    b_2 = dot(_e53, _e54);
    let _e57 = p_1;
    let _e58 = p_1;
    let _e60 = rr_1;
    let _e61 = rr_1;
    c_1 = (dot(_e57, _e58) - (_e60 * _e61));
    let _e65 = b_2;
    let _e67 = b_2;
    let _e68 = b_2;
    let _e70 = c_1;
    return (-(_e65) + sqrt(max(((_e67 * _e68) - _e70), 0f)));
}

fn tauAlong(p_2: vec3<f32>, d_4: vec3<f32>, t0_: f32, t1_: f32, foot_14: f32, gA_6: vec3<f32>, gB_6: vec3<f32>, sigma: f32) -> f32 {
    var p_3: vec3<f32>;
    var d_5: vec3<f32>;
    var t0_1: f32;
    var t1_1: f32;
    var foot_15: f32;
    var gA_7: vec3<f32>;
    var gB_7: vec3<f32>;
    var sigma_1: f32;
    var N: i32 = 8i;
    var dt: f32;
    var tau: f32 = 0f;
    var s_1: i32 = 0i;
    var x_1: vec3<f32>;
    var r: f32;
    var h_5: f32;
    var fr: f32;
    var dirF_16: vec3<f32>;
    var clim_7: f32;
    var k: i32;
    var local_6: f32;

    p_3 = p_2;
    d_5 = d_4;
    t0_1 = t0_;
    t1_1 = t1_;
    foot_15 = foot_14;
    gA_7 = gA_6;
    gB_7 = gB_6;
    sigma_1 = sigma;
    let _e65 = t1_1;
    let _e66 = t0_1;
    let _e68 = N;
    dt = ((_e65 - _e66) / f32(_e68));
    let _e74 = foot_15;
    gDeckFoot = _e74;
    loop {
        let _e77 = s_1;
        let _e78 = N;
        if !((_e77 < _e78)) {
            break;
        }
        {
            let _e84 = p_3;
            let _e85 = d_5;
            let _e86 = t0_1;
            let _e87 = s_1;
            let _e91 = dt;
            x_1 = (_e84 + (_e85 * (_e86 + ((f32(_e87) + 0.5f) * _e91))));
            let _e97 = x_1;
            r = length(_e97);
            let _e100 = r;
            let _e101 = global.uRadius;
            h_5 = (_e100 - _e101);
            let _e105 = x_1;
            let _e106 = r;
            dirF_16 = (_e105 / vec3(_e106));
            clim_7 = -99f;
            k = 0i;
            loop {
                let _e115 = k;
                if !((_e115 < 3i)) {
                    break;
                }
                {
                    let _e122 = k;
                    let _e124 = global.uNumDecks;
                    if (f32(_e122) >= _e124) {
                        break;
                    }
                    let _e126 = h_5;
                    let _e127 = k;
                    let _e129 = global.uDeck[_e127];
                    let _e132 = h_5;
                    let _e133 = k;
                    let _e135 = global.uDeck[_e133];
                    if ((_e126 < _e129.x) || (_e132 > _e135.y)) {
                        continue;
                    }
                    let _e139 = clim_7;
                    if (_e139 < -98f) {
                        let _e143 = global.uMode;
                        if (_e143 > 0.5f) {
                            let _e146 = dirF_16;
                            let _e147 = cloudClimate(_e146);
                            local_6 = _e147;
                        } else {
                            local_6 = 0f;
                        }
                        let _e150 = local_6;
                        clim_7 = _e150;
                    }
                    let _e151 = tau;
                    let _e152 = k;
                    let _e153 = x_1;
                    let _e154 = dirF_16;
                    let _e155 = h_5;
                    let _e156 = k;
                    let _e157 = x_1;
                    let _e158 = dirF_16;
                    let _e159 = foot_15;
                    let _e160 = gA_7;
                    let _e161 = gB_7;
                    let _e162 = clim_7;
                    let _e163 = deckCovG(_e156, _e157, _e158, _e159, _e160, _e161, _e162);
                    let _e164 = gA_7;
                    let _e165 = gB_7;
                    let _e169 = deckDenG(_e152, _e153, _e154, _e155, _e163, _e164, _e165, true, (&fr));
                    let _e170 = sigma_1;
                    let _e172 = dt;
                    tau = (_e151 + ((_e169 * _e170) * _e172));
                }
                continuing {
                    let _e119 = k;
                    k = (_e119 + 1i);
                }
            }
        }
        continuing {
            let _e81 = s_1;
            s_1 = (_e81 + 1i);
        }
    }
    let _e175 = tau;
    return _e175;
}

fn main_1() {
    var xy: vec2<f32>;
    var g_2: vec3<f32>;
    var G: vec3<f32>;
    var sb: f32 = 1000000000f;
    var st_1: f32 = -1000000000f;
    var i_9: i32 = 0i;
    var foot_16: f32;
    var muS: f32;
    var gA_8: vec3<f32>;
    var gB_8: vec3<f32>;
    var local_7: f32;
    var tauS: f32;
    var tauU: f32;

    let _e47 = vUv_1;
    let _e51 = global.uL;
    xy = ((_e47 - vec2(0.5f)) * _e51);
    let _e54 = global.uO;
    let _e55 = global.uE;
    let _e56 = xy;
    let _e60 = global.uN;
    let _e61 = xy;
    g_2 = normalize(((_e54 + (_e55 * _e56.x)) + (_e60 * _e61.y)));
    let _e67 = g_2;
    let _e68 = global.uRadius;
    G = (_e67 * _e68);
    loop {
        let _e78 = i_9;
        if !((_e78 < 3i)) {
            break;
        }
        {
            let _e85 = i_9;
            let _e87 = global.uNumDecks;
            if (f32(_e85) >= _e87) {
                break;
            }
            let _e89 = sb;
            let _e90 = i_9;
            let _e92 = global.uDeck[_e90];
            sb = min(_e89, _e92.x);
            let _e95 = st_1;
            let _e96 = i_9;
            let _e98 = global.uDeck[_e96];
            st_1 = max(_e95, _e98.y);
        }
        continuing {
            let _e82 = i_9;
            i_9 = (_e82 + 1i);
        }
    }
    let _e101 = global.uL;
    foot_16 = (_e101 / 256f);
    let _e105 = g_2;
    let _e106 = global.uSunF;
    muS = dot(_e105, _e106);
    let _e111 = g_2;
    cloudGens(_e111, (&gA_8), (&gB_8));
    let _e116 = muS;
    if (_e116 > 0f) {
        let _e119 = G;
        let _e120 = global.uSunF;
        let _e121 = G;
        let _e122 = global.uSunF;
        let _e123 = global.uRadius;
        let _e124 = sb;
        let _e128 = toRadius(_e121, _e122, (_e123 + max(_e124, 0f)));
        let _e129 = G;
        let _e130 = global.uSunF;
        let _e131 = global.uRadius;
        let _e132 = st_1;
        let _e134 = toRadius(_e129, _e130, (_e131 + _e132));
        let _e135 = foot_16;
        let _e136 = gA_8;
        let _e137 = gB_8;
        let _e138 = global.uSigmaS;
        let _e139 = tauAlong(_e119, _e120, _e128, _e134, _e135, _e136, _e137, _e138);
        local_7 = _e139;
    } else {
        local_7 = 30f;
    }
    let _e142 = local_7;
    tauS = _e142;
    let _e144 = G;
    let _e145 = g_2;
    let _e146 = sb;
    let _e149 = st_1;
    let _e150 = foot_16;
    let _e151 = gA_8;
    let _e152 = gB_8;
    let _e153 = global.uSigmaG;
    let _e154 = tauAlong(_e144, _e145, max(_e146, 0f), _e149, _e150, _e151, _e152, _e153);
    tauU = _e154;
    let _e156 = tauS;
    let _e162 = tauU;
    let _e166 = tauU;
    let _e168 = muS;
    outC = vec4<f32>(exp(-(_e156)), (1f / (1f + (0.1125f * _e162))), exp((-(_e166) / max(_e168, 0.05f))), 1f);
    return;
}

@fragment 
fn main(@location(0) vUv: vec2<f32>) -> FragmentOutput {
    vUv_1 = vUv;
    main_1();
    let _e58 = outC;
    return FragmentOutput(_e58);
}
`;
