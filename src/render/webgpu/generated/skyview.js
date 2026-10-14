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
  "group": 0,
  "attributes": []
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
var<private> gHazeH: f32 = 1f;
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
    let _e62 = r_5;
    let _e63 = global.uRadius;
    h = (_e62 - _e63);
    let _e66 = h;
    let _e67 = global.uKnee;
    if (_e66 <= _e67) {
        let _e69 = h;
        local_1 = _e69;
    } else {
        let _e70 = global.uKnee;
        let _e71 = h;
        let _e72 = global.uKnee;
        let _e74 = global.uUpper;
        local_1 = (_e70 + ((_e71 - _e72) / _e74));
    }
    let _e78 = local_1;
    hr = _e78;
    let _e80 = hr;
    let _e82 = global.uRayleighH;
    dR = exp((-(_e80) / _e82));
    let _e86 = hr;
    let _e88 = global.uMieH;
    dM = exp((-(_e86) / _e88));
    let _e92 = global.uAbsExp;
    if (_e92 > 0.5f) {
        let _e95 = dR;
        local_2 = _e95;
    } else {
        let _e98 = h;
        let _e99 = global.uAbsCenter;
        let _e102 = global.uAbsWidth;
        local_2 = max(0f, (1f - (abs((_e98 - _e99)) / max(_e102, 1f))));
    }
    let _e109 = local_2;
    dA = _e109;
    let _e111 = global.uHaze;
    let _e113 = gHazeK;
    let _e115 = gHazeH;
    let _e117 = h;
    let _e121 = global.uHaze;
    let _e128 = global.uHazeCol;
    dH = ((((_e111.x * _e113) * _e115) * exp((-(max(_e117, 0f)) / max(_e121.y, 1f)))) * _e128);
    let _e131 = global.uRayleigh;
    let _e132 = dR;
    (*scatR) = (_e131 * _e132);
    let _e134 = global.uMie;
    let _e135 = dM;
    let _e137 = dH;
    (*scatM) = ((_e134 * _e135) + _e137);
    let _e139 = (*scatR);
    let _e140 = (*scatM);
    let _e142 = global.uMieAbs;
    let _e143 = dM;
    let _e146 = global.uAbs;
    let _e147 = dA;
    let _e150 = dH;
    let _e151 = global.uHaze;
    (*ext) = ((((_e139 + _e140) + (_e142 * _e143)) + (_e146 * _e147)) + (_e150 * _e151.z));
    return;
}

fn realH(h_1: f32) -> f32 {
    var h_2: f32;
    var local_3: f32;

    h_2 = h_1;
    let _e59 = h_2;
    let _e60 = global.uKnee;
    if (_e59 <= _e60) {
        let _e62 = h_2;
        local_3 = _e62;
    } else {
        let _e63 = global.uKnee;
        let _e64 = h_2;
        let _e65 = global.uKnee;
        let _e67 = global.uUpper;
        local_3 = (_e63 + ((_e64 - _e65) / _e67));
    }
    let _e71 = local_3;
    return _e71;
}

fn drawnH(hr_1: f32) -> f32 {
    var hr_2: f32;
    var local_4: f32;

    hr_2 = hr_1;
    let _e59 = hr_2;
    let _e60 = global.uKnee;
    if (_e59 <= _e60) {
        let _e62 = hr_2;
        local_4 = _e62;
    } else {
        let _e63 = global.uKnee;
        let _e64 = hr_2;
        let _e65 = global.uKnee;
        let _e67 = global.uUpper;
        local_4 = (_e63 + ((_e64 - _e65) * _e67));
    }
    let _e71 = local_4;
    return _e71;
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
    let _e62 = hr_4;
    let _e63 = drawnH(_e62);
    h_3 = _e63;
    let _e65 = hr_4;
    let _e67 = global.uRayleighH;
    dR_1 = exp((-(_e65) / _e67));
    let _e71 = hr_4;
    let _e73 = global.uMieH;
    dM_1 = exp((-(_e71) / _e73));
    let _e77 = global.uAbsExp;
    if (_e77 > 0.5f) {
        let _e80 = dR_1;
        local_5 = _e80;
    } else {
        let _e83 = h_3;
        let _e84 = global.uAbsCenter;
        let _e87 = global.uAbsWidth;
        local_5 = max(0f, (1f - (abs((_e83 - _e84)) / max(_e87, 1f))));
    }
    let _e94 = local_5;
    dA_1 = _e94;
    let _e96 = global.uHaze;
    let _e98 = gHazeK;
    let _e100 = hr_4;
    let _e104 = global.uHaze;
    let _e111 = global.uHazeCol;
    dH_1 = (((_e96.x * _e98) * exp((-(max(_e100, 0f)) / max(_e104.y, 1f)))) * _e111);
    let _e114 = global.uRayleigh;
    let _e115 = dR_1;
    (*scatR_1) = (_e114 * _e115);
    let _e117 = global.uMie;
    let _e118 = dM_1;
    let _e120 = dH_1;
    (*scatM_1) = ((_e117 * _e118) + _e120);
    let _e122 = (*scatR_1);
    let _e123 = (*scatM_1);
    let _e125 = global.uMieAbs;
    let _e126 = dM_1;
    let _e129 = global.uAbs;
    let _e130 = dA_1;
    let _e133 = dH_1;
    let _e134 = global.uHaze;
    (*ext_1) = ((((_e122 + _e123) + (_e125 * _e126)) + (_e129 * _e130)) + (_e133 * _e134.z));
    return;
}

fn phaseRayleigh(c: f32) -> f32 {
    var c_1: f32;

    c_1 = c;
    let _e65 = c_1;
    let _e66 = c_1;
    return (0.059683103f * (1f + (_e65 * _e66)));
}

fn phaseCS(c_2: f32, g: f32) -> f32 {
    var c_3: f32;
    var g_1: f32;
    var g2_: f32;

    c_3 = c_2;
    g_1 = g;
    let _e61 = g_1;
    let _e62 = g_1;
    g2_ = (_e61 * _e62);
    let _e71 = g2_;
    let _e74 = c_3;
    let _e75 = c_3;
    let _e81 = g2_;
    let _e84 = g2_;
    let _e87 = g_1;
    let _e89 = c_3;
    return ((0.119366206f * ((1f - _e71) * (1f + (_e74 * _e75)))) / ((2f + _e81) * pow(max(((1f + _e84) - ((2f * _e87) * _e89)), 0.0001f), 1.5f)));
}

fn phaseHG(c_4: f32, g_2: f32) -> f32 {
    var c_5: f32;
    var g_3: f32;

    c_5 = c_4;
    g_3 = g_2;
    let _e62 = g_3;
    let _e63 = g_3;
    let _e70 = g_3;
    let _e71 = g_3;
    let _e75 = g_3;
    let _e77 = c_5;
    return ((1f - (_e62 * _e63)) / (12.566371f * pow(max(((1f + (_e70 * _e71)) - ((2f * _e75) * _e77)), 0.000001f), 1.5f)));
}

fn phaseMie(c_6: f32) -> vec3<f32> {
    var c_7: f32;

    c_7 = c_6;
    let _e59 = c_7;
    let _e60 = global.uMieG;
    let _e62 = phaseCS(_e59, _e60.x);
    let _e63 = c_7;
    let _e64 = global.uMieG;
    let _e66 = phaseCS(_e63, _e64.y);
    let _e67 = c_7;
    let _e68 = global.uMieG;
    let _e70 = phaseCS(_e67, _e68.z);
    let _e72 = c_7;
    let _e73 = global.uMieGL;
    let _e75 = phaseHG(_e72, _e73.x);
    let _e76 = c_7;
    let _e77 = global.uMieGL;
    let _e79 = phaseHG(_e76, _e77.y);
    let _e80 = c_7;
    let _e81 = global.uMieGL;
    let _e83 = phaseHG(_e80, _e81.z);
    let _e85 = global.uMieF;
    return mix(vec3<f32>(_e62, _e66, _e70), vec3<f32>(_e75, _e79, _e83), _e85);
}

fn distToTop(r_6: f32, mu_4: f32) -> f32 {
    var r_7: f32;
    var mu_5: f32;
    var disc_1: f32;

    r_7 = r_6;
    mu_5 = mu_4;
    let _e61 = r_7;
    let _e62 = r_7;
    let _e64 = mu_5;
    let _e65 = mu_5;
    let _e70 = global.uTop;
    let _e71 = global.uTop;
    disc_1 = (((_e61 * _e62) * ((_e64 * _e65) - 1f)) + (_e70 * _e71));
    let _e76 = r_7;
    let _e78 = mu_5;
    let _e80 = disc_1;
    return max(0f, ((-(_e76) * _e78) + sqrt(max(_e80, 0f))));
}

fn hitsGround(r_8: f32, mu_6: f32, gr: f32) -> bool {
    var r_9: f32;
    var mu_7: f32;
    var gr_1: f32;

    r_9 = r_8;
    mu_7 = mu_6;
    gr_1 = gr;
    let _e63 = mu_7;
    let _e66 = r_9;
    let _e67 = r_9;
    let _e69 = mu_7;
    let _e70 = mu_7;
    let _e75 = gr_1;
    let _e76 = gr_1;
    return ((_e63 < 0f) && ((((_e66 * _e67) * ((_e69 * _e70) - 1f)) + (_e75 * _e76)) >= 0f));
}

fn transmittanceToTop(r_10: f32, mu_8: f32) -> vec3<f32> {
    var r_11: f32;
    var mu_9: f32;
    var uv: vec2<f32>;

    r_11 = r_10;
    mu_9 = mu_8;
    let _e61 = r_11;
    let _e62 = global.uBottom;
    let _e63 = global.uTop;
    let _e65 = mu_9;
    let _e66 = transmittanceUV(clamp(_e61, _e62, _e63), _e65);
    uv = _e66;
    let _e75 = uv;
    uv = (vec2<f32>(0.001953125f, 0.0078125f) + (_e75 * vec2<f32>(0.99609375f, 0.984375f)));
    let _e85 = uv;
    let _e87 = textureSampleLevel(tTransTexture, tTransSampler, _e85, 0f);
    return _e87.xyz;
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
    let _e61 = mu_11;
    let _e62 = liftMu(_e61);
    mu_11 = _e62;
    let _e63 = global.uGround;
    let _e64 = global.uTrueK;
    Rg = (_e63 * max(_e64, 1f));
    let _e69 = Rg;
    let _e70 = Rg;
    let _e71 = r_13;
    let _e72 = global.uGround;
    sinH = (_e69 / (_e70 + max((_e71 - _e72), 0f)));
    let _e81 = sinH;
    let _e82 = sinH;
    cosH = -(sqrt(max(0f, (1f - (_e81 * _e82)))));
    let _e89 = cosH;
    let _e92 = cosH;
    let _e95 = mu_11;
    vis = smoothstep((_e89 - 0.004f), (_e92 + 0.004f), _e95);
    let _e98 = r_13;
    let _e99 = mu_11;
    let _e100 = transmittanceToTop(_e98, _e99);
    let _e101 = vis;
    return (_e100 * _e101);
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
    let _e63 = global.uRadius;
    let _e64 = rK_1;
    let _e65 = Rk_1;
    let _e67 = drawnH((_e64 - _e65));
    rD = (_e63 + _e67);
    let _e70 = Rk_1;
    let _e71 = global.uGround;
    let _e72 = global.uRadius;
    let _e74 = realH((_e71 - _e72));
    gK = (_e70 + _e74);
    let _e77 = gK;
    let _e78 = rK_1;
    let _e79 = gK;
    sinH_1 = (_e77 / max(_e78, _e79));
    let _e85 = sinH_1;
    let _e86 = sinH_1;
    cosH_1 = -(sqrt(max(0f, (1f - (_e85 * _e86)))));
    let _e93 = rD;
    let _e94 = global.uBottom;
    let _e95 = global.uTop;
    let _e97 = mu_13;
    let _e98 = transmittanceToTop(clamp(_e93, _e94, _e95), _e97);
    let _e99 = cosH_1;
    let _e102 = cosH_1;
    let _e105 = mu_13;
    return (_e98 * smoothstep((_e99 - 0.004f), (_e102 + 0.004f), _e105));
}

fn multiScatterAt(r_14: f32, muT: f32) -> vec3<f32> {
    var r_15: f32;
    var muT_1: f32;
    var uv_1: vec2<f32>;

    r_15 = r_14;
    muT_1 = muT;
    let _e61 = muT_1;
    let _e66 = r_15;
    let _e67 = global.uBottom;
    let _e69 = global.uTop;
    let _e70 = global.uBottom;
    uv_1 = vec2<f32>(((_e61 * 0.5f) + 0.5f), ((_e66 - _e67) / (_e69 - _e70)));
    let _e75 = uv_1;
    uv_1 = clamp(_e75, vec2(0f), vec2(1f));
    let _e85 = uv_1;
    uv_1 = (vec2(0.015625f) + (_e85 * 0.96875f));
    let _e91 = uv_1;
    let _e93 = textureSampleLevel(tMSTexture, tMSSampler, _e91, 0f);
    return _e93.xyz;
}

fn multiScatter(r_16: f32, muS: f32) -> vec3<f32> {
    var r_17: f32;
    var muS_1: f32;

    r_17 = r_16;
    muS_1 = muS;
    let _e61 = r_17;
    let _e62 = muS_1;
    let _e63 = liftMu(_e62);
    let _e64 = multiScatterAt(_e61, _e63);
    return _e64;
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
    let _e64 = p_3;
    let _e65 = d_2;
    b = dot(_e64, _e65);
    let _e68 = p_3;
    let _e69 = p_3;
    let _e71 = rr_1;
    let _e72 = rr_1;
    c_8 = (dot(_e68, _e69) - (_e71 * _e72));
    let _e76 = b;
    let _e77 = b;
    let _e79 = c_8;
    q = ((_e76 * _e77) - _e79);
    let _e82 = q;
    if (_e82 < 0f) {
        local_6 = -1f;
    } else {
        let _e87 = b;
        let _e89 = q;
        local_6 = (-(_e87) + sqrt(_e89));
    }
    let _e93 = local_6;
    return _e93;
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
    let _e64 = p_5;
    let _e65 = d_4;
    b_1 = dot(_e64, _e65);
    let _e68 = p_5;
    let _e69 = p_5;
    let _e71 = rr_3;
    let _e72 = rr_3;
    c_9 = (dot(_e68, _e69) - (_e71 * _e72));
    let _e76 = b_1;
    let _e77 = b_1;
    let _e79 = c_9;
    q_1 = ((_e76 * _e77) - _e79);
    let _e82 = q_1;
    if (_e82 < 0f) {
        return -1f;
    }
    let _e87 = b_1;
    let _e89 = q_1;
    t = (-(_e87) - sqrt(_e89));
    let _e93 = t;
    if (_e93 > 0f) {
        let _e96 = t;
        local_7 = _e96;
    } else {
        local_7 = -1f;
    }
    let _e100 = local_7;
    return _e100;
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

    let _e58 = vUv_1;
    v = ((_e58.y * 2f) - 1f);
    let _e65 = v;
    let _e67 = v;
    let _e69 = v;
    el = (((sign(_e65) * _e67) * _e69) * 1.5707963f);
    let _e74 = vUv_1;
    az = (_e74.x * 3.1415927f);
    let _e79 = el;
    let _e81 = az;
    let _e84 = el;
    let _e86 = el;
    let _e88 = az;
    D = vec3<f32>((cos(_e79) * cos(_e81)), sin(_e84), (cos(_e86) * sin(_e88)));
    let _e95 = global.uSunMu;
    let _e96 = global.uSunMu;
    let _e101 = global.uSunMu;
    sun = vec3<f32>(sqrt(max(0f, (1f - (_e95 * _e96)))), _e101, 0f);
    let _e105 = global.uTrueK;
    K = max(_e105, 1f);
    let _e109 = global.uRadius;
    let _e110 = K;
    Rt = (_e109 * _e110);
    let _e113 = global.uGround;
    let _e114 = global.uRadius;
    grH = (_e113 - _e114);
    let _e117 = Rt;
    let _e118 = grH;
    Rg_1 = (_e117 + _e118);
    let _e122 = Rt;
    let _e123 = global.uCamH;
    let _e124 = realH(_e123);
    cT = vec3<f32>(0f, (_e122 + _e124), 0f);
    let _e129 = cT;
    let _e130 = D;
    let _e131 = Rt;
    let _e132 = global.uTop;
    let _e133 = global.uRadius;
    let _e135 = realH((_e132 - _e133));
    let _e137 = exitSphere(_e129, _e130, (_e131 + _e135));
    sT = _e137;
    let _e139 = cT;
    let _e140 = D;
    let _e141 = Rg_1;
    let _e142 = hitSphere(_e139, _e140, _e141);
    gT = _e142;
    let _e144 = gT;
    if (_e144 > 0f) {
        let _e147 = sT;
        let _e148 = gT;
        sT = min(_e147, _e148);
    }
    let _e150 = sT;
    if !((_e150 > 1f)) {
        {
            fragmentColor = vec4<f32>(0f, 0f, 0f, 1f);
            return;
        }
    }
    let _e159 = D;
    let _e160 = sun;
    cosT = dot(_e159, _e160);
    let _e163 = cosT;
    let _e164 = phaseRayleigh(_e163);
    pR = _e164;
    let _e166 = cosT;
    let _e167 = phaseMie(_e166);
    pM = _e167;
    loop {
        let _e179 = i;
        let _e180 = N;
        if !((_e179 < _e180)) {
            break;
        }
        {
            let _e186 = i;
            let _e188 = N;
            u0_ = (f32(_e186) / f32(_e188));
            let _e192 = i;
            let _e196 = N;
            u1_ = (f32((_e192 + 1i)) / f32(_e196));
            let _e200 = sT;
            let _e201 = u0_;
            let _e202 = u0_;
            let _e204 = u1_;
            let _e205 = u1_;
            s = ((_e200 * ((_e201 * _e202) + (_e204 * _e205))) * 0.5f);
            let _e212 = sT;
            let _e213 = u1_;
            let _e214 = u1_;
            let _e216 = u0_;
            let _e217 = u0_;
            ds = (_e212 * ((_e213 * _e214) - (_e216 * _e217)));
            let _e222 = cT;
            let _e223 = D;
            let _e224 = s;
            p_6 = (_e222 + (_e223 * _e224));
            let _e228 = p_6;
            r_18 = length(_e228);
            let _e231 = r_18;
            let _e232 = Rt;
            hr_5 = (_e231 - _e232);
            let _e235 = global.uRadius;
            let _e236 = hr_5;
            let _e237 = drawnH(_e236);
            rr_4 = (_e235 + _e237);
            let _e243 = hr_5;
            mediumAtReal(_e243, (&sR), (&sM), (&e));
            let _e250 = e;
            let _e252 = ds;
            Ts = exp((-(_e250) * _e252));
            let _e256 = p_6;
            let _e257 = r_18;
            let _e260 = sun;
            muS_2 = dot((_e256 / vec3(_e257)), _e260);
            let _e265 = Rg_1;
            let _e266 = r_18;
            let _e267 = Rg_1;
            let _e270 = Rg_1;
            let _e271 = r_18;
            let _e272 = Rg_1;
            cosH_2 = -(sqrt(max(0f, (1f - ((_e265 / max(_e266, _e267)) * (_e270 / max(_e271, _e272)))))));
            let _e281 = rr_4;
            let _e282 = muS_2;
            let _e283 = transmittanceToTop(_e281, _e282);
            let _e284 = cosH_2;
            let _e287 = cosH_2;
            let _e290 = muS_2;
            sunT = (_e283 * smoothstep((_e284 - 0.004f), (_e287 + 0.004f), _e290));
            let _e294 = rr_4;
            let _e295 = muS_2;
            let _e296 = multiScatter(_e294, _e295);
            ms = _e296;
            let _e298 = sR;
            let _e299 = sunT;
            let _e300 = pR;
            let _e302 = ms;
            let _e305 = sM;
            let _e306 = sunT;
            let _e307 = pM;
            let _e309 = ms;
            S = ((_e298 * ((_e299 * _e300) + _e302)) + (_e305 * ((_e306 * _e307) + _e309)));
            let _e314 = L;
            let _e315 = T;
            let _e316 = S;
            let _e317 = S;
            let _e318 = Ts;
            let _e322 = e;
            L = (_e314 + ((_e315 * (_e316 - (_e317 * _e318))) / max(_e322, vec3(0.00000000000001f))));
            let _e328 = T;
            let _e329 = Ts;
            T = (_e328 * _e329);
        }
        continuing {
            let _e183 = i;
            i = (_e183 + 1i);
        }
    }
    let _e331 = L;
    fragmentColor = vec4<f32>(_e331.x, _e331.y, _e331.z, 1f);
    return;
}

@fragment 
fn main(@location(0) vUv: vec2<f32>) -> FragmentOutput {
    vUv_1 = vUv;
    main_1();
    let _e74 = fragmentColor;
    return FragmentOutput(_e74);
}
`;
