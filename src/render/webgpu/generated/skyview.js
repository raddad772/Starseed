// Generated offline from the existing renderer equations. See tools/shaders/.
export const layout = {
  "uniforms": [
    {
      "name": "uBottom",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 0
    },
    {
      "name": "uTop",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 4
    },
    {
      "name": "uRadius",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 8
    },
    {
      "name": "uRayleigh",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 16
    },
    {
      "name": "uRayleighH",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 28
    },
    {
      "name": "uMie",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 32
    },
    {
      "name": "uMieAbs",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 48
    },
    {
      "name": "uMieH",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 60
    },
    {
      "name": "uMieG",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 64
    },
    {
      "name": "uMieF",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 80
    },
    {
      "name": "uMieGL",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 96
    },
    {
      "name": "uAbs",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 112
    },
    {
      "name": "uAbsCenter",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 124
    },
    {
      "name": "uAbsWidth",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 128
    },
    {
      "name": "uAbsExp",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 132
    },
    {
      "name": "uHaze",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 144
    },
    {
      "name": "uHazeCol",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 160
    },
    {
      "name": "uKnee",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 172
    },
    {
      "name": "uUpper",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 176
    },
    {
      "name": "uTrueK",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 180
    },
    {
      "name": "uSunLift",
      "type": "vec2",
      "count": 0,
      "align": 8,
      "size": 8,
      "stride": 8,
      "offset": 184
    },
    {
      "name": "uGround",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 192
    },
    {
      "name": "uCamH",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 196
    },
    {
      "name": "uSunMu",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 200
    }
  ],
  "textures": [
    {
      "name": "tTrans",
      "type": "sampler2D",
      "count": 0,
      "binding": 1,
      "samplerBinding": 2
    },
    {
      "name": "tMS",
      "type": "sampler2D",
      "count": 0,
      "binding": 3,
      "samplerBinding": 4
    }
  ],
  "bytes": 208,
  "group": 0
};
export const code = /* wgsl */`
struct Params {
    uBottom: f32,
    uTop: f32,
    uRadius: f32,
    uRayleigh: vec3<f32>,
    uRayleighH: f32,
    uMie: vec3<f32>,
    uMieAbs: vec3<f32>,
    uMieH: f32,
    uMieG: vec3<f32>,
    uMieF: vec3<f32>,
    uMieGL: vec3<f32>,
    uAbs: vec3<f32>,
    uAbsCenter: f32,
    uAbsWidth: f32,
    uAbsExp: f32,
    uHaze: vec4<f32>,
    uHazeCol: vec3<f32>,
    uKnee: f32,
    uUpper: f32,
    uTrueK: f32,
    uSunLift: vec2<f32>,
    uGround: f32,
    uCamH: f32,
    uSunMu: f32,
}

struct FragmentOutput {
    @location(0) fragmentColor: vec4<f32>,
}

const PI_A: f32 = 3.1415927f;

@group(0) @binding(0) 
var<uniform> global: Params;
@group(0) @binding(1) 
var tTransTexture: texture_2d<f32>;
@group(0) @binding(2) 
var tTransSampler: sampler;
@group(0) @binding(3) 
var tMSTexture: texture_2d<f32>;
@group(0) @binding(4) 
var tMSSampler: sampler;
var<private> fragmentColor: vec4<f32>;
var<private> gHazeK: f32 = 1f;
var<private> gAirSun: f32 = 1f;
var<private> vUv_1: vec2<f32>;

fn transmittanceUV(r: f32, mu: f32) -> vec2<f32> {
    var r_1: f32;
    var mu_1: f32;
    var H: f32;
    var rho: f32;
    var disc: f32;
    var d: f32;
    var dMin: f32;
    var dMax: f32;
    var xmu: f32;
    var xr: f32;

    r_1 = r;
    mu_1 = mu;
    let _e58 = global.uTop;
    let _e59 = global.uTop;
    let _e61 = global.uBottom;
    let _e62 = global.uBottom;
    H = sqrt(max(0f, ((_e58 * _e59) - (_e61 * _e62))));
    let _e69 = r_1;
    let _e70 = r_1;
    let _e72 = global.uBottom;
    let _e73 = global.uBottom;
    rho = sqrt(max(0f, ((_e69 * _e70) - (_e72 * _e73))));
    let _e79 = r_1;
    let _e80 = r_1;
    let _e82 = mu_1;
    let _e83 = mu_1;
    let _e88 = global.uTop;
    let _e89 = global.uTop;
    disc = (((_e79 * _e80) * ((_e82 * _e83) - 1f)) + (_e88 * _e89));
    let _e94 = r_1;
    let _e96 = mu_1;
    let _e98 = disc;
    d = max(0f, ((-(_e94) * _e96) + sqrt(max(_e98, 0f))));
    let _e105 = global.uTop;
    let _e106 = r_1;
    dMin = (_e105 - _e106);
    let _e109 = rho;
    let _e110 = H;
    dMax = (_e109 + _e110);
    let _e113 = d;
    let _e114 = dMin;
    let _e116 = dMax;
    let _e117 = dMin;
    xmu = ((_e113 - _e114) / max((_e116 - _e117), 0.000001f));
    let _e123 = rho;
    let _e124 = H;
    xr = (_e123 / max(_e124, 0.000001f));
    let _e129 = xmu;
    let _e130 = xr;
    return vec2<f32>(_e129, _e130);
}

fn trueUp(p: vec3<f32>, r_2: f32, upC: vec3<f32>, k: f32) -> vec3<f32> {
    var p_1: vec3<f32>;
    var r_3: f32;
    var upC_1: vec3<f32>;
    var k_1: f32;

    p_1 = p;
    r_3 = r_2;
    upC_1 = upC;
    k_1 = k;
    let _e61 = upC_1;
    let _e62 = p_1;
    let _e63 = r_3;
    let _e67 = k_1;
    return normalize(mix(_e61, (_e62 / vec3(_e63)), vec3((1f / _e67))));
}

fn trueK(hc: f32) -> f32 {
    var hc_1: f32;

    hc_1 = hc;
    let _e55 = global.uTrueK;
    let _e61 = hc_1;
    return mix(max(_e55, 1f), 1f, smoothstep(20000f, 60000f, _e61));
}

fn lensTrueZ(zd: f32) -> f32 {
    var zd_1: f32;
    var hD: f32;
    var hT: f32;
    var local: f32;

    zd_1 = zd;
    let _e57 = global.uSunLift;
    hD = (1.5707963f + _e57.x);
    let _e62 = global.uSunLift;
    hT = (1.5707963f + _e62.y);
    let _e66 = zd_1;
    let _e67 = hD;
    if (_e66 <= _e67) {
        let _e69 = zd_1;
        let _e70 = hT;
        let _e72 = hD;
        local = ((_e69 * _e70) / _e72);
    } else {
        let _e74 = hT;
        let _e75 = zd_1;
        let _e76 = hD;
        let _e79 = hT;
        let _e83 = hD;
        local = (_e74 + (((_e75 - _e76) * (3.1415927f - _e79)) / (3.1415927f - _e83)));
    }
    let _e88 = local;
    return _e88;
}

fn liftMu(mu_2: f32) -> f32 {
    var mu_3: f32;

    mu_3 = mu_2;
    let _e56 = global.uSunLift;
    let _e58 = global.uSunLift;
    if (_e56.x <= _e58.y) {
        let _e61 = mu_3;
        return _e61;
    }
    let _e62 = mu_3;
    let _e68 = lensTrueZ(acos(clamp(_e62, -1f, 1f)));
    return cos(_e68);
}

fn mediumAt(r_4: f32, scatR: ptr<function, vec3<f32>>, scatM: ptr<function, vec3<f32>>, ext: ptr<function, vec3<f32>>) {
    var r_5: f32;
    var h: f32;
    var local_1: f32;
    var hr: f32;
    var dR: f32;
    var dM: f32;
    var local_2: f32;
    var dA: f32;
    var dH: vec3<f32>;

    r_5 = r_4;
    let _e61 = r_5;
    let _e62 = global.uRadius;
    h = (_e61 - _e62);
    let _e65 = h;
    let _e66 = global.uKnee;
    if (_e65 <= _e66) {
        let _e68 = h;
        local_1 = _e68;
    } else {
        let _e69 = global.uKnee;
        let _e70 = h;
        let _e71 = global.uKnee;
        let _e73 = global.uUpper;
        local_1 = (_e69 + ((_e70 - _e71) / _e73));
    }
    let _e77 = local_1;
    hr = _e77;
    let _e79 = hr;
    let _e81 = global.uRayleighH;
    dR = exp((-(_e79) / _e81));
    let _e85 = hr;
    let _e87 = global.uMieH;
    dM = exp((-(_e85) / _e87));
    let _e91 = global.uAbsExp;
    if (_e91 > 0.5f) {
        let _e94 = dR;
        local_2 = _e94;
    } else {
        let _e97 = h;
        let _e98 = global.uAbsCenter;
        let _e101 = global.uAbsWidth;
        local_2 = max(0f, (1f - (abs((_e97 - _e98)) / max(_e101, 1f))));
    }
    let _e108 = local_2;
    dA = _e108;
    let _e110 = global.uHaze;
    let _e112 = gHazeK;
    let _e114 = h;
    let _e118 = global.uHaze;
    let _e125 = global.uHazeCol;
    dH = (((_e110.x * _e112) * exp((-(max(_e114, 0f)) / max(_e118.y, 1f)))) * _e125);
    let _e128 = global.uRayleigh;
    let _e129 = dR;
    (*scatR) = (_e128 * _e129);
    let _e131 = global.uMie;
    let _e132 = dM;
    let _e134 = dH;
    (*scatM) = ((_e131 * _e132) + _e134);
    let _e136 = (*scatR);
    let _e137 = (*scatM);
    let _e139 = global.uMieAbs;
    let _e140 = dM;
    let _e143 = global.uAbs;
    let _e144 = dA;
    let _e147 = dH;
    let _e148 = global.uHaze;
    (*ext) = ((((_e136 + _e137) + (_e139 * _e140)) + (_e143 * _e144)) + (_e147 * _e148.z));
    return;
}

fn realH(h_1: f32) -> f32 {
    var h_2: f32;
    var local_3: f32;

    h_2 = h_1;
    let _e58 = h_2;
    let _e59 = global.uKnee;
    if (_e58 <= _e59) {
        let _e61 = h_2;
        local_3 = _e61;
    } else {
        let _e62 = global.uKnee;
        let _e63 = h_2;
        let _e64 = global.uKnee;
        let _e66 = global.uUpper;
        local_3 = (_e62 + ((_e63 - _e64) / _e66));
    }
    let _e70 = local_3;
    return _e70;
}

fn drawnH(hr_1: f32) -> f32 {
    var hr_2: f32;
    var local_4: f32;

    hr_2 = hr_1;
    let _e58 = hr_2;
    let _e59 = global.uKnee;
    if (_e58 <= _e59) {
        let _e61 = hr_2;
        local_4 = _e61;
    } else {
        let _e62 = global.uKnee;
        let _e63 = hr_2;
        let _e64 = global.uKnee;
        let _e66 = global.uUpper;
        local_4 = (_e62 + ((_e63 - _e64) * _e66));
    }
    let _e70 = local_4;
    return _e70;
}

fn mediumAtReal(hr_3: f32, scatR_1: ptr<function, vec3<f32>>, scatM_1: ptr<function, vec3<f32>>, ext_1: ptr<function, vec3<f32>>) {
    var hr_4: f32;
    var h_3: f32;
    var dR_1: f32;
    var dM_1: f32;
    var local_5: f32;
    var dA_1: f32;
    var dH_1: vec3<f32>;

    hr_4 = hr_3;
    let _e61 = hr_4;
    let _e62 = drawnH(_e61);
    h_3 = _e62;
    let _e64 = hr_4;
    let _e66 = global.uRayleighH;
    dR_1 = exp((-(_e64) / _e66));
    let _e70 = hr_4;
    let _e72 = global.uMieH;
    dM_1 = exp((-(_e70) / _e72));
    let _e76 = global.uAbsExp;
    if (_e76 > 0.5f) {
        let _e79 = dR_1;
        local_5 = _e79;
    } else {
        let _e82 = h_3;
        let _e83 = global.uAbsCenter;
        let _e86 = global.uAbsWidth;
        local_5 = max(0f, (1f - (abs((_e82 - _e83)) / max(_e86, 1f))));
    }
    let _e93 = local_5;
    dA_1 = _e93;
    let _e95 = global.uHaze;
    let _e97 = gHazeK;
    let _e99 = hr_4;
    let _e103 = global.uHaze;
    let _e110 = global.uHazeCol;
    dH_1 = (((_e95.x * _e97) * exp((-(max(_e99, 0f)) / max(_e103.y, 1f)))) * _e110);
    let _e113 = global.uRayleigh;
    let _e114 = dR_1;
    (*scatR_1) = (_e113 * _e114);
    let _e116 = global.uMie;
    let _e117 = dM_1;
    let _e119 = dH_1;
    (*scatM_1) = ((_e116 * _e117) + _e119);
    let _e121 = (*scatR_1);
    let _e122 = (*scatM_1);
    let _e124 = global.uMieAbs;
    let _e125 = dM_1;
    let _e128 = global.uAbs;
    let _e129 = dA_1;
    let _e132 = dH_1;
    let _e133 = global.uHaze;
    (*ext_1) = ((((_e121 + _e122) + (_e124 * _e125)) + (_e128 * _e129)) + (_e132 * _e133.z));
    return;
}

fn phaseRayleigh(c: f32) -> f32 {
    var c_1: f32;

    c_1 = c;
    let _e64 = c_1;
    let _e65 = c_1;
    return (0.059683103f * (1f + (_e64 * _e65)));
}

fn phaseCS(c_2: f32, g: f32) -> f32 {
    var c_3: f32;
    var g_1: f32;
    var g2_: f32;

    c_3 = c_2;
    g_1 = g;
    let _e60 = g_1;
    let _e61 = g_1;
    g2_ = (_e60 * _e61);
    let _e70 = g2_;
    let _e73 = c_3;
    let _e74 = c_3;
    let _e80 = g2_;
    let _e83 = g2_;
    let _e86 = g_1;
    let _e88 = c_3;
    return ((0.119366206f * ((1f - _e70) * (1f + (_e73 * _e74)))) / ((2f + _e80) * pow(max(((1f + _e83) - ((2f * _e86) * _e88)), 0.0001f), 1.5f)));
}

fn phaseHG(c_4: f32, g_2: f32) -> f32 {
    var c_5: f32;
    var g_3: f32;

    c_5 = c_4;
    g_3 = g_2;
    let _e61 = g_3;
    let _e62 = g_3;
    let _e69 = g_3;
    let _e70 = g_3;
    let _e74 = g_3;
    let _e76 = c_5;
    return ((1f - (_e61 * _e62)) / (12.566371f * pow(max(((1f + (_e69 * _e70)) - ((2f * _e74) * _e76)), 0.000001f), 1.5f)));
}

fn phaseMie(c_6: f32) -> vec3<f32> {
    var c_7: f32;

    c_7 = c_6;
    let _e58 = c_7;
    let _e59 = global.uMieG;
    let _e61 = phaseCS(_e58, _e59.x);
    let _e62 = c_7;
    let _e63 = global.uMieG;
    let _e65 = phaseCS(_e62, _e63.y);
    let _e66 = c_7;
    let _e67 = global.uMieG;
    let _e69 = phaseCS(_e66, _e67.z);
    let _e71 = c_7;
    let _e72 = global.uMieGL;
    let _e74 = phaseHG(_e71, _e72.x);
    let _e75 = c_7;
    let _e76 = global.uMieGL;
    let _e78 = phaseHG(_e75, _e76.y);
    let _e79 = c_7;
    let _e80 = global.uMieGL;
    let _e82 = phaseHG(_e79, _e80.z);
    let _e84 = global.uMieF;
    return mix(vec3<f32>(_e61, _e65, _e69), vec3<f32>(_e74, _e78, _e82), _e84);
}

fn distToTop(r_6: f32, mu_4: f32) -> f32 {
    var r_7: f32;
    var mu_5: f32;
    var disc_1: f32;

    r_7 = r_6;
    mu_5 = mu_4;
    let _e60 = r_7;
    let _e61 = r_7;
    let _e63 = mu_5;
    let _e64 = mu_5;
    let _e69 = global.uTop;
    let _e70 = global.uTop;
    disc_1 = (((_e60 * _e61) * ((_e63 * _e64) - 1f)) + (_e69 * _e70));
    let _e75 = r_7;
    let _e77 = mu_5;
    let _e79 = disc_1;
    return max(0f, ((-(_e75) * _e77) + sqrt(max(_e79, 0f))));
}

fn hitsGround(r_8: f32, mu_6: f32, gr: f32) -> bool {
    var r_9: f32;
    var mu_7: f32;
    var gr_1: f32;

    r_9 = r_8;
    mu_7 = mu_6;
    gr_1 = gr;
    let _e62 = mu_7;
    let _e65 = r_9;
    let _e66 = r_9;
    let _e68 = mu_7;
    let _e69 = mu_7;
    let _e74 = gr_1;
    let _e75 = gr_1;
    return ((_e62 < 0f) && ((((_e65 * _e66) * ((_e68 * _e69) - 1f)) + (_e74 * _e75)) >= 0f));
}

fn transmittanceToTop(r_10: f32, mu_8: f32) -> vec3<f32> {
    var r_11: f32;
    var mu_9: f32;
    var uv: vec2<f32>;

    r_11 = r_10;
    mu_9 = mu_8;
    let _e60 = r_11;
    let _e61 = global.uBottom;
    let _e62 = global.uTop;
    let _e64 = mu_9;
    let _e65 = transmittanceUV(clamp(_e60, _e61, _e62), _e64);
    uv = _e65;
    let _e74 = uv;
    uv = (vec2<f32>(0.001953125f, 0.0078125f) + (_e74 * vec2<f32>(0.99609375f, 0.984375f)));
    let _e84 = uv;
    let _e86 = textureSampleLevel(tTransTexture, tTransSampler, _e84, 0f);
    return _e86.xyz;
}

fn sunTransmittance(r_12: f32, mu_10: f32) -> vec3<f32> {
    var r_13: f32;
    var mu_11: f32;
    var Rg: f32;
    var sinH: f32;
    var cosH: f32;
    var vis: f32;

    r_13 = r_12;
    mu_11 = mu_10;
    let _e60 = mu_11;
    let _e61 = liftMu(_e60);
    mu_11 = _e61;
    let _e62 = global.uGround;
    let _e63 = global.uTrueK;
    Rg = (_e62 * max(_e63, 1f));
    let _e68 = Rg;
    let _e69 = Rg;
    let _e70 = r_13;
    let _e71 = global.uGround;
    sinH = (_e68 / (_e69 + max((_e70 - _e71), 0f)));
    let _e80 = sinH;
    let _e81 = sinH;
    cosH = -(sqrt(max(0f, (1f - (_e80 * _e81)))));
    let _e88 = cosH;
    let _e91 = cosH;
    let _e94 = mu_11;
    vis = smoothstep((_e88 - 0.004f), (_e91 + 0.004f), _e94);
    let _e97 = r_13;
    let _e98 = mu_11;
    let _e99 = transmittanceToTop(_e97, _e98);
    let _e100 = vis;
    return (_e99 * _e100);
}

fn sunAtTrue(rK: f32, Rk: f32, mu_12: f32) -> vec3<f32> {
    var rK_1: f32;
    var Rk_1: f32;
    var mu_13: f32;
    var rD: f32;
    var gK: f32;
    var sinH_1: f32;
    var cosH_1: f32;

    rK_1 = rK;
    Rk_1 = Rk;
    mu_13 = mu_12;
    let _e62 = global.uRadius;
    let _e63 = rK_1;
    let _e64 = Rk_1;
    let _e66 = drawnH((_e63 - _e64));
    rD = (_e62 + _e66);
    let _e69 = Rk_1;
    let _e70 = global.uGround;
    let _e71 = global.uRadius;
    let _e73 = realH((_e70 - _e71));
    gK = (_e69 + _e73);
    let _e76 = gK;
    let _e77 = rK_1;
    let _e78 = gK;
    sinH_1 = (_e76 / max(_e77, _e78));
    let _e84 = sinH_1;
    let _e85 = sinH_1;
    cosH_1 = -(sqrt(max(0f, (1f - (_e84 * _e85)))));
    let _e92 = rD;
    let _e93 = global.uBottom;
    let _e94 = global.uTop;
    let _e96 = mu_13;
    let _e97 = transmittanceToTop(clamp(_e92, _e93, _e94), _e96);
    let _e98 = cosH_1;
    let _e101 = cosH_1;
    let _e104 = mu_13;
    return (_e97 * smoothstep((_e98 - 0.004f), (_e101 + 0.004f), _e104));
}

fn multiScatterAt(r_14: f32, muT: f32) -> vec3<f32> {
    var r_15: f32;
    var muT_1: f32;
    var uv_1: vec2<f32>;

    r_15 = r_14;
    muT_1 = muT;
    let _e60 = muT_1;
    let _e65 = r_15;
    let _e66 = global.uBottom;
    let _e68 = global.uTop;
    let _e69 = global.uBottom;
    uv_1 = vec2<f32>(((_e60 * 0.5f) + 0.5f), ((_e65 - _e66) / (_e68 - _e69)));
    let _e74 = uv_1;
    uv_1 = clamp(_e74, vec2(0f), vec2(1f));
    let _e84 = uv_1;
    uv_1 = (vec2(0.015625f) + (_e84 * 0.96875f));
    let _e90 = uv_1;
    let _e92 = textureSampleLevel(tMSTexture, tMSSampler, _e90, 0f);
    return _e92.xyz;
}

fn multiScatter(r_16: f32, muS: f32) -> vec3<f32> {
    var r_17: f32;
    var muS_1: f32;

    r_17 = r_16;
    muS_1 = muS;
    let _e60 = r_17;
    let _e61 = muS_1;
    let _e62 = liftMu(_e61);
    let _e63 = multiScatterAt(_e60, _e62);
    return _e63;
}

fn exitSphere(p_2: vec3<f32>, d_1: vec3<f32>, rr: f32) -> f32 {
    var p_3: vec3<f32>;
    var d_2: vec3<f32>;
    var rr_1: f32;
    var b: f32;
    var c_8: f32;
    var q: f32;
    var local_6: f32;

    p_3 = p_2;
    d_2 = d_1;
    rr_1 = rr;
    let _e63 = p_3;
    let _e64 = d_2;
    b = dot(_e63, _e64);
    let _e67 = p_3;
    let _e68 = p_3;
    let _e70 = rr_1;
    let _e71 = rr_1;
    c_8 = (dot(_e67, _e68) - (_e70 * _e71));
    let _e75 = b;
    let _e76 = b;
    let _e78 = c_8;
    q = ((_e75 * _e76) - _e78);
    let _e81 = q;
    if (_e81 < 0f) {
        local_6 = -1f;
    } else {
        let _e86 = b;
        let _e88 = q;
        local_6 = (-(_e86) + sqrt(_e88));
    }
    let _e92 = local_6;
    return _e92;
}

fn hitSphere(p_4: vec3<f32>, d_3: vec3<f32>, rr_2: f32) -> f32 {
    var p_5: vec3<f32>;
    var d_4: vec3<f32>;
    var rr_3: f32;
    var b_1: f32;
    var c_9: f32;
    var q_1: f32;
    var t: f32;
    var local_7: f32;

    p_5 = p_4;
    d_4 = d_3;
    rr_3 = rr_2;
    let _e63 = p_5;
    let _e64 = d_4;
    b_1 = dot(_e63, _e64);
    let _e67 = p_5;
    let _e68 = p_5;
    let _e70 = rr_3;
    let _e71 = rr_3;
    c_9 = (dot(_e67, _e68) - (_e70 * _e71));
    let _e75 = b_1;
    let _e76 = b_1;
    let _e78 = c_9;
    q_1 = ((_e75 * _e76) - _e78);
    let _e81 = q_1;
    if (_e81 < 0f) {
        return -1f;
    }
    let _e86 = b_1;
    let _e88 = q_1;
    t = (-(_e86) - sqrt(_e88));
    let _e92 = t;
    if (_e92 > 0f) {
        let _e95 = t;
        local_7 = _e95;
    } else {
        local_7 = -1f;
    }
    let _e99 = local_7;
    return _e99;
}

fn main_1() {
    var v: f32;
    var el: f32;
    var az: f32;
    var D: vec3<f32>;
    var sun: vec3<f32>;
    var K: f32;
    var Rt: f32;
    var grH: f32;
    var Rg_1: f32;
    var cT: vec3<f32>;
    var sT: f32;
    var gT: f32;
    var cosT: f32;
    var pR: f32;
    var pM: vec3<f32>;
    var N: i32 = 48i;
    var L: vec3<f32> = vec3(0f);
    var T: vec3<f32> = vec3(1f);
    var i: i32 = 0i;
    var u0_: f32;
    var u1_: f32;
    var s: f32;
    var ds: f32;
    var p_6: vec3<f32>;
    var r_18: f32;
    var hr_5: f32;
    var rr_4: f32;
    var sR: vec3<f32>;
    var sM: vec3<f32>;
    var e: vec3<f32>;
    var Ts: vec3<f32>;
    var muS_2: f32;
    var cosH_2: f32;
    var sunT: vec3<f32>;
    var ms: vec3<f32>;
    var S: vec3<f32>;

    let _e57 = vUv_1;
    v = ((_e57.y * 2f) - 1f);
    let _e64 = v;
    let _e66 = v;
    let _e68 = v;
    el = (((sign(_e64) * _e66) * _e68) * 1.5707963f);
    let _e73 = vUv_1;
    az = (_e73.x * 3.1415927f);
    let _e78 = el;
    let _e80 = az;
    let _e83 = el;
    let _e85 = el;
    let _e87 = az;
    D = vec3<f32>((cos(_e78) * cos(_e80)), sin(_e83), (cos(_e85) * sin(_e87)));
    let _e94 = global.uSunMu;
    let _e95 = global.uSunMu;
    let _e100 = global.uSunMu;
    sun = vec3<f32>(sqrt(max(0f, (1f - (_e94 * _e95)))), _e100, 0f);
    let _e104 = global.uTrueK;
    K = max(_e104, 1f);
    let _e108 = global.uRadius;
    let _e109 = K;
    Rt = (_e108 * _e109);
    let _e112 = global.uGround;
    let _e113 = global.uRadius;
    grH = (_e112 - _e113);
    let _e116 = Rt;
    let _e117 = grH;
    Rg_1 = (_e116 + _e117);
    let _e121 = Rt;
    let _e122 = global.uCamH;
    let _e123 = realH(_e122);
    cT = vec3<f32>(0f, (_e121 + _e123), 0f);
    let _e128 = cT;
    let _e129 = D;
    let _e130 = Rt;
    let _e131 = global.uTop;
    let _e132 = global.uRadius;
    let _e134 = realH((_e131 - _e132));
    let _e136 = exitSphere(_e128, _e129, (_e130 + _e134));
    sT = _e136;
    let _e138 = cT;
    let _e139 = D;
    let _e140 = Rg_1;
    let _e141 = hitSphere(_e138, _e139, _e140);
    gT = _e141;
    let _e143 = gT;
    if (_e143 > 0f) {
        let _e146 = sT;
        let _e147 = gT;
        sT = min(_e146, _e147);
    }
    let _e149 = sT;
    if !((_e149 > 1f)) {
        {
            fragmentColor = vec4<f32>(0f, 0f, 0f, 1f);
            return;
        }
    }
    let _e158 = D;
    let _e159 = sun;
    cosT = dot(_e158, _e159);
    let _e162 = cosT;
    let _e163 = phaseRayleigh(_e162);
    pR = _e163;
    let _e165 = cosT;
    let _e166 = phaseMie(_e165);
    pM = _e166;
    loop {
        let _e178 = i;
        let _e179 = N;
        if !((_e178 < _e179)) {
            break;
        }
        {
            let _e185 = i;
            let _e187 = N;
            u0_ = (f32(_e185) / f32(_e187));
            let _e191 = i;
            let _e195 = N;
            u1_ = (f32((_e191 + 1i)) / f32(_e195));
            let _e199 = sT;
            let _e200 = u0_;
            let _e201 = u0_;
            let _e203 = u1_;
            let _e204 = u1_;
            s = ((_e199 * ((_e200 * _e201) + (_e203 * _e204))) * 0.5f);
            let _e211 = sT;
            let _e212 = u1_;
            let _e213 = u1_;
            let _e215 = u0_;
            let _e216 = u0_;
            ds = (_e211 * ((_e212 * _e213) - (_e215 * _e216)));
            let _e221 = cT;
            let _e222 = D;
            let _e223 = s;
            p_6 = (_e221 + (_e222 * _e223));
            let _e227 = p_6;
            r_18 = length(_e227);
            let _e230 = r_18;
            let _e231 = Rt;
            hr_5 = (_e230 - _e231);
            let _e234 = global.uRadius;
            let _e235 = hr_5;
            let _e236 = drawnH(_e235);
            rr_4 = (_e234 + _e236);
            let _e242 = hr_5;
            mediumAtReal(_e242, (&sR), (&sM), (&e));
            let _e249 = e;
            let _e251 = ds;
            Ts = exp((-(_e249) * _e251));
            let _e255 = p_6;
            let _e256 = r_18;
            let _e259 = sun;
            muS_2 = dot((_e255 / vec3(_e256)), _e259);
            let _e264 = Rg_1;
            let _e265 = r_18;
            let _e266 = Rg_1;
            let _e269 = Rg_1;
            let _e270 = r_18;
            let _e271 = Rg_1;
            cosH_2 = -(sqrt(max(0f, (1f - ((_e264 / max(_e265, _e266)) * (_e269 / max(_e270, _e271)))))));
            let _e280 = rr_4;
            let _e281 = muS_2;
            let _e282 = transmittanceToTop(_e280, _e281);
            let _e283 = cosH_2;
            let _e286 = cosH_2;
            let _e289 = muS_2;
            sunT = (_e282 * smoothstep((_e283 - 0.004f), (_e286 + 0.004f), _e289));
            let _e293 = rr_4;
            let _e294 = muS_2;
            let _e295 = multiScatter(_e293, _e294);
            ms = _e295;
            let _e297 = sR;
            let _e298 = sunT;
            let _e299 = pR;
            let _e301 = ms;
            let _e304 = sM;
            let _e305 = sunT;
            let _e306 = pM;
            let _e308 = ms;
            S = ((_e297 * ((_e298 * _e299) + _e301)) + (_e304 * ((_e305 * _e306) + _e308)));
            let _e313 = L;
            let _e314 = T;
            let _e315 = S;
            let _e316 = S;
            let _e317 = Ts;
            let _e321 = e;
            L = (_e313 + ((_e314 * (_e315 - (_e316 * _e317))) / max(_e321, vec3(0.00000000000001f))));
            let _e327 = T;
            let _e328 = Ts;
            T = (_e327 * _e328);
        }
        continuing {
            let _e182 = i;
            i = (_e182 + 1i);
        }
    }
    let _e330 = L;
    fragmentColor = vec4<f32>(_e330.x, _e330.y, _e330.z, 1f);
    return;
}

@fragment 
fn main(@location(0) vUv: vec2<f32>) -> FragmentOutput {
    vUv_1 = vUv;
    main_1();
    let _e71 = fragmentColor;
    return FragmentOutput(_e71);
}
`;
