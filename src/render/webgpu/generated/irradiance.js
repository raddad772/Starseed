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
      "name": "uGroundAlbedo",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 208
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
  "bytes": 224,
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
    uGroundAlbedo: vec3<f32>,
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
    let _e56 = global.uTop;
    let _e57 = global.uTop;
    let _e59 = global.uBottom;
    let _e60 = global.uBottom;
    H = sqrt(max(0f, ((_e56 * _e57) - (_e59 * _e60))));
    let _e67 = r_1;
    let _e68 = r_1;
    let _e70 = global.uBottom;
    let _e71 = global.uBottom;
    rho = sqrt(max(0f, ((_e67 * _e68) - (_e70 * _e71))));
    let _e77 = r_1;
    let _e78 = r_1;
    let _e80 = mu_1;
    let _e81 = mu_1;
    let _e86 = global.uTop;
    let _e87 = global.uTop;
    disc = (((_e77 * _e78) * ((_e80 * _e81) - 1f)) + (_e86 * _e87));
    let _e92 = r_1;
    let _e94 = mu_1;
    let _e96 = disc;
    d = max(0f, ((-(_e92) * _e94) + sqrt(max(_e96, 0f))));
    let _e103 = global.uTop;
    let _e104 = r_1;
    dMin = (_e103 - _e104);
    let _e107 = rho;
    let _e108 = H;
    dMax = (_e107 + _e108);
    let _e111 = d;
    let _e112 = dMin;
    let _e114 = dMax;
    let _e115 = dMin;
    xmu = ((_e111 - _e112) / max((_e114 - _e115), 0.000001f));
    let _e121 = rho;
    let _e122 = H;
    xr = (_e121 / max(_e122, 0.000001f));
    let _e127 = xmu;
    let _e128 = xr;
    return vec2<f32>(_e127, _e128);
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
    let _e59 = upC_1;
    let _e60 = p_1;
    let _e61 = r_3;
    let _e65 = k_1;
    return normalize(mix(_e59, (_e60 / vec3(_e61)), vec3((1f / _e65))));
}

fn trueK(hc: f32) -> f32 {
    var hc_1: f32;

    hc_1 = hc;
    let _e53 = global.uTrueK;
    let _e59 = hc_1;
    return mix(max(_e53, 1f), 1f, smoothstep(20000f, 60000f, _e59));
}

fn lensTrueZ(zd: f32) -> f32 {
    var zd_1: f32;
    var hD: f32;
    var hT: f32;
    var local: f32;

    zd_1 = zd;
    let _e55 = global.uSunLift;
    hD = (1.5707963f + _e55.x);
    let _e60 = global.uSunLift;
    hT = (1.5707963f + _e60.y);
    let _e64 = zd_1;
    let _e65 = hD;
    if (_e64 <= _e65) {
        let _e67 = zd_1;
        let _e68 = hT;
        let _e70 = hD;
        local = ((_e67 * _e68) / _e70);
    } else {
        let _e72 = hT;
        let _e73 = zd_1;
        let _e74 = hD;
        let _e77 = hT;
        let _e81 = hD;
        local = (_e72 + (((_e73 - _e74) * (3.1415927f - _e77)) / (3.1415927f - _e81)));
    }
    let _e86 = local;
    return _e86;
}

fn liftMu(mu_2: f32) -> f32 {
    var mu_3: f32;

    mu_3 = mu_2;
    let _e54 = global.uSunLift;
    let _e56 = global.uSunLift;
    if (_e54.x <= _e56.y) {
        let _e59 = mu_3;
        return _e59;
    }
    let _e60 = mu_3;
    let _e66 = lensTrueZ(acos(clamp(_e60, -1f, 1f)));
    return cos(_e66);
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
    let _e60 = r_5;
    let _e61 = global.uRadius;
    h = (_e60 - _e61);
    let _e64 = h;
    let _e65 = global.uKnee;
    if (_e64 <= _e65) {
        let _e67 = h;
        local_1 = _e67;
    } else {
        let _e68 = global.uKnee;
        let _e69 = h;
        let _e70 = global.uKnee;
        let _e72 = global.uUpper;
        local_1 = (_e68 + ((_e69 - _e70) / _e72));
    }
    let _e76 = local_1;
    hr = _e76;
    let _e78 = hr;
    let _e80 = global.uRayleighH;
    dR = exp((-(_e78) / _e80));
    let _e84 = hr;
    let _e86 = global.uMieH;
    dM = exp((-(_e84) / _e86));
    let _e90 = global.uAbsExp;
    if (_e90 > 0.5f) {
        let _e93 = dR;
        local_2 = _e93;
    } else {
        let _e96 = h;
        let _e97 = global.uAbsCenter;
        let _e100 = global.uAbsWidth;
        local_2 = max(0f, (1f - (abs((_e96 - _e97)) / max(_e100, 1f))));
    }
    let _e107 = local_2;
    dA = _e107;
    let _e109 = global.uHaze;
    let _e111 = gHazeK;
    let _e113 = gHazeH;
    let _e115 = h;
    let _e119 = global.uHaze;
    let _e126 = global.uHazeCol;
    dH = ((((_e109.x * _e111) * _e113) * exp((-(max(_e115, 0f)) / max(_e119.y, 1f)))) * _e126);
    let _e129 = global.uRayleigh;
    let _e130 = dR;
    (*scatR) = (_e129 * _e130);
    let _e132 = global.uMie;
    let _e133 = dM;
    let _e135 = dH;
    (*scatM) = ((_e132 * _e133) + _e135);
    let _e137 = (*scatR);
    let _e138 = (*scatM);
    let _e140 = global.uMieAbs;
    let _e141 = dM;
    let _e144 = global.uAbs;
    let _e145 = dA;
    let _e148 = dH;
    let _e149 = global.uHaze;
    (*ext) = ((((_e137 + _e138) + (_e140 * _e141)) + (_e144 * _e145)) + (_e148 * _e149.z));
    return;
}

fn realH(h_1: f32) -> f32 {
    var h_2: f32;
    var local_3: f32;

    h_2 = h_1;
    let _e57 = h_2;
    let _e58 = global.uKnee;
    if (_e57 <= _e58) {
        let _e60 = h_2;
        local_3 = _e60;
    } else {
        let _e61 = global.uKnee;
        let _e62 = h_2;
        let _e63 = global.uKnee;
        let _e65 = global.uUpper;
        local_3 = (_e61 + ((_e62 - _e63) / _e65));
    }
    let _e69 = local_3;
    return _e69;
}

fn drawnH(hr_1: f32) -> f32 {
    var hr_2: f32;
    var local_4: f32;

    hr_2 = hr_1;
    let _e57 = hr_2;
    let _e58 = global.uKnee;
    if (_e57 <= _e58) {
        let _e60 = hr_2;
        local_4 = _e60;
    } else {
        let _e61 = global.uKnee;
        let _e62 = hr_2;
        let _e63 = global.uKnee;
        let _e65 = global.uUpper;
        local_4 = (_e61 + ((_e62 - _e63) * _e65));
    }
    let _e69 = local_4;
    return _e69;
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
    let _e60 = hr_4;
    let _e61 = drawnH(_e60);
    h_3 = _e61;
    let _e63 = hr_4;
    let _e65 = global.uRayleighH;
    dR_1 = exp((-(_e63) / _e65));
    let _e69 = hr_4;
    let _e71 = global.uMieH;
    dM_1 = exp((-(_e69) / _e71));
    let _e75 = global.uAbsExp;
    if (_e75 > 0.5f) {
        let _e78 = dR_1;
        local_5 = _e78;
    } else {
        let _e81 = h_3;
        let _e82 = global.uAbsCenter;
        let _e85 = global.uAbsWidth;
        local_5 = max(0f, (1f - (abs((_e81 - _e82)) / max(_e85, 1f))));
    }
    let _e92 = local_5;
    dA_1 = _e92;
    let _e94 = global.uHaze;
    let _e96 = gHazeK;
    let _e98 = hr_4;
    let _e102 = global.uHaze;
    let _e109 = global.uHazeCol;
    dH_1 = (((_e94.x * _e96) * exp((-(max(_e98, 0f)) / max(_e102.y, 1f)))) * _e109);
    let _e112 = global.uRayleigh;
    let _e113 = dR_1;
    (*scatR_1) = (_e112 * _e113);
    let _e115 = global.uMie;
    let _e116 = dM_1;
    let _e118 = dH_1;
    (*scatM_1) = ((_e115 * _e116) + _e118);
    let _e120 = (*scatR_1);
    let _e121 = (*scatM_1);
    let _e123 = global.uMieAbs;
    let _e124 = dM_1;
    let _e127 = global.uAbs;
    let _e128 = dA_1;
    let _e131 = dH_1;
    let _e132 = global.uHaze;
    (*ext_1) = ((((_e120 + _e121) + (_e123 * _e124)) + (_e127 * _e128)) + (_e131 * _e132.z));
    return;
}

fn phaseRayleigh(c: f32) -> f32 {
    var c_1: f32;

    c_1 = c;
    let _e63 = c_1;
    let _e64 = c_1;
    return (0.059683103f * (1f + (_e63 * _e64)));
}

fn phaseCS(c_2: f32, g: f32) -> f32 {
    var c_3: f32;
    var g_1: f32;
    var g2_: f32;

    c_3 = c_2;
    g_1 = g;
    let _e59 = g_1;
    let _e60 = g_1;
    g2_ = (_e59 * _e60);
    let _e69 = g2_;
    let _e72 = c_3;
    let _e73 = c_3;
    let _e79 = g2_;
    let _e82 = g2_;
    let _e85 = g_1;
    let _e87 = c_3;
    return ((0.119366206f * ((1f - _e69) * (1f + (_e72 * _e73)))) / ((2f + _e79) * pow(max(((1f + _e82) - ((2f * _e85) * _e87)), 0.0001f), 1.5f)));
}

fn phaseHG(c_4: f32, g_2: f32) -> f32 {
    var c_5: f32;
    var g_3: f32;

    c_5 = c_4;
    g_3 = g_2;
    let _e60 = g_3;
    let _e61 = g_3;
    let _e68 = g_3;
    let _e69 = g_3;
    let _e73 = g_3;
    let _e75 = c_5;
    return ((1f - (_e60 * _e61)) / (12.566371f * pow(max(((1f + (_e68 * _e69)) - ((2f * _e73) * _e75)), 0.000001f), 1.5f)));
}

fn phaseMie(c_6: f32) -> vec3<f32> {
    var c_7: f32;

    c_7 = c_6;
    let _e57 = c_7;
    let _e58 = global.uMieG;
    let _e60 = phaseCS(_e57, _e58.x);
    let _e61 = c_7;
    let _e62 = global.uMieG;
    let _e64 = phaseCS(_e61, _e62.y);
    let _e65 = c_7;
    let _e66 = global.uMieG;
    let _e68 = phaseCS(_e65, _e66.z);
    let _e70 = c_7;
    let _e71 = global.uMieGL;
    let _e73 = phaseHG(_e70, _e71.x);
    let _e74 = c_7;
    let _e75 = global.uMieGL;
    let _e77 = phaseHG(_e74, _e75.y);
    let _e78 = c_7;
    let _e79 = global.uMieGL;
    let _e81 = phaseHG(_e78, _e79.z);
    let _e83 = global.uMieF;
    return mix(vec3<f32>(_e60, _e64, _e68), vec3<f32>(_e73, _e77, _e81), _e83);
}

fn distToTop(r_6: f32, mu_4: f32) -> f32 {
    var r_7: f32;
    var mu_5: f32;
    var disc_1: f32;

    r_7 = r_6;
    mu_5 = mu_4;
    let _e59 = r_7;
    let _e60 = r_7;
    let _e62 = mu_5;
    let _e63 = mu_5;
    let _e68 = global.uTop;
    let _e69 = global.uTop;
    disc_1 = (((_e59 * _e60) * ((_e62 * _e63) - 1f)) + (_e68 * _e69));
    let _e74 = r_7;
    let _e76 = mu_5;
    let _e78 = disc_1;
    return max(0f, ((-(_e74) * _e76) + sqrt(max(_e78, 0f))));
}

fn hitsGround(r_8: f32, mu_6: f32, gr: f32) -> bool {
    var r_9: f32;
    var mu_7: f32;
    var gr_1: f32;

    r_9 = r_8;
    mu_7 = mu_6;
    gr_1 = gr;
    let _e61 = mu_7;
    let _e64 = r_9;
    let _e65 = r_9;
    let _e67 = mu_7;
    let _e68 = mu_7;
    let _e73 = gr_1;
    let _e74 = gr_1;
    return ((_e61 < 0f) && ((((_e64 * _e65) * ((_e67 * _e68) - 1f)) + (_e73 * _e74)) >= 0f));
}

fn transmittanceToTop(r_10: f32, mu_8: f32) -> vec3<f32> {
    var r_11: f32;
    var mu_9: f32;
    var uv: vec2<f32>;

    r_11 = r_10;
    mu_9 = mu_8;
    let _e59 = r_11;
    let _e60 = global.uBottom;
    let _e61 = global.uTop;
    let _e63 = mu_9;
    let _e64 = transmittanceUV(clamp(_e59, _e60, _e61), _e63);
    uv = _e64;
    let _e73 = uv;
    uv = (vec2<f32>(0.001953125f, 0.0078125f) + (_e73 * vec2<f32>(0.99609375f, 0.984375f)));
    let _e83 = uv;
    let _e85 = textureSampleLevel(tTransTexture, tTransSampler, _e83, 0f);
    return _e85.xyz;
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
    let _e59 = mu_11;
    let _e60 = liftMu(_e59);
    mu_11 = _e60;
    let _e61 = global.uGround;
    let _e62 = global.uTrueK;
    Rg = (_e61 * max(_e62, 1f));
    let _e67 = Rg;
    let _e68 = Rg;
    let _e69 = r_13;
    let _e70 = global.uGround;
    sinH = (_e67 / (_e68 + max((_e69 - _e70), 0f)));
    let _e79 = sinH;
    let _e80 = sinH;
    cosH = -(sqrt(max(0f, (1f - (_e79 * _e80)))));
    let _e87 = cosH;
    let _e90 = cosH;
    let _e93 = mu_11;
    vis = smoothstep((_e87 - 0.004f), (_e90 + 0.004f), _e93);
    let _e96 = r_13;
    let _e97 = mu_11;
    let _e98 = transmittanceToTop(_e96, _e97);
    let _e99 = vis;
    return (_e98 * _e99);
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
    let _e61 = global.uRadius;
    let _e62 = rK_1;
    let _e63 = Rk_1;
    let _e65 = drawnH((_e62 - _e63));
    rD = (_e61 + _e65);
    let _e68 = Rk_1;
    let _e69 = global.uGround;
    let _e70 = global.uRadius;
    let _e72 = realH((_e69 - _e70));
    gK = (_e68 + _e72);
    let _e75 = gK;
    let _e76 = rK_1;
    let _e77 = gK;
    sinH_1 = (_e75 / max(_e76, _e77));
    let _e83 = sinH_1;
    let _e84 = sinH_1;
    cosH_1 = -(sqrt(max(0f, (1f - (_e83 * _e84)))));
    let _e91 = rD;
    let _e92 = global.uBottom;
    let _e93 = global.uTop;
    let _e95 = mu_13;
    let _e96 = transmittanceToTop(clamp(_e91, _e92, _e93), _e95);
    let _e97 = cosH_1;
    let _e100 = cosH_1;
    let _e103 = mu_13;
    return (_e96 * smoothstep((_e97 - 0.004f), (_e100 + 0.004f), _e103));
}

fn multiScatterAt(r_14: f32, muT: f32) -> vec3<f32> {
    var r_15: f32;
    var muT_1: f32;
    var uv_1: vec2<f32>;

    r_15 = r_14;
    muT_1 = muT;
    let _e59 = muT_1;
    let _e64 = r_15;
    let _e65 = global.uBottom;
    let _e67 = global.uTop;
    let _e68 = global.uBottom;
    uv_1 = vec2<f32>(((_e59 * 0.5f) + 0.5f), ((_e64 - _e65) / (_e67 - _e68)));
    let _e73 = uv_1;
    uv_1 = clamp(_e73, vec2(0f), vec2(1f));
    let _e83 = uv_1;
    uv_1 = (vec2(0.015625f) + (_e83 * 0.96875f));
    let _e89 = uv_1;
    let _e91 = textureSampleLevel(tMSTexture, tMSSampler, _e89, 0f);
    return _e91.xyz;
}

fn multiScatter(r_16: f32, muS: f32) -> vec3<f32> {
    var r_17: f32;
    var muS_1: f32;

    r_17 = r_16;
    muS_1 = muS;
    let _e59 = r_17;
    let _e60 = muS_1;
    let _e61 = liftMu(_e60);
    let _e62 = multiScatterAt(_e59, _e61);
    return _e62;
}

fn main_1() {
    var muS_2: f32;
    var r_18: f32;
    var K: f32;
    var Rk_2: f32;
    var rK_2: f32;
    var topK: f32;
    var sunDir: vec3<f32>;
    var pos: vec3<f32>;
    var E: vec3<f32> = vec3(0f);
    var NA: i32 = 8i;
    var NB: i32 = 6i;
    var STEPS: i32 = 16i;
    var a: i32 = 0i;
    var b: i32;
    var th: f32;
    var ct: f32;
    var st: f32;
    var dir: vec3<f32>;
    var tMax: f32;
    var thr: vec3<f32>;
    var L: vec3<f32>;
    var cs: f32;
    var pM: vec3<f32>;
    var pR: f32;
    var s: i32;
    var u0_: f32;
    var u1_: f32;
    var t: f32;
    var dt: f32;
    var p_2: vec3<f32>;
    var rr: f32;
    var sR: vec3<f32>;
    var sM: vec3<f32>;
    var e: vec3<f32>;
    var Ts: vec3<f32>;
    var mus: f32;
    var sunT: vec3<f32>;
    var ms: vec3<f32>;
    var S: vec3<f32>;
    var eSafe: vec3<f32>;

    gHazeK = 0f;
    let _e57 = vUv_1;
    muS_2 = ((_e57.x * 2f) - 1f);
    let _e64 = global.uGround;
    let _e65 = global.uTop;
    let _e66 = global.uGround;
    let _e68 = vUv_1;
    r_18 = ((_e64 + ((_e65 - _e66) * clamp(_e68.y, 0f, 1f))) + 1f);
    let _e78 = global.uTrueK;
    K = max(_e78, 1f);
    let _e82 = global.uRadius;
    let _e83 = K;
    Rk_2 = (_e82 * _e83);
    let _e86 = Rk_2;
    let _e87 = r_18;
    let _e88 = global.uRadius;
    let _e90 = realH((_e87 - _e88));
    rK_2 = (_e86 + _e90);
    let _e93 = Rk_2;
    let _e94 = global.uTop;
    let _e95 = global.uRadius;
    let _e97 = realH((_e94 - _e95));
    topK = (_e93 + _e97);
    let _e101 = muS_2;
    let _e104 = muS_2;
    let _e105 = muS_2;
    sunDir = vec3<f32>(0f, _e101, sqrt(max(0f, (1f - (_e104 * _e105)))));
    let _e113 = rK_2;
    pos = vec3<f32>(0f, _e113, 0f);
    loop {
        let _e128 = a;
        let _e129 = NA;
        if !((_e128 < _e129)) {
            break;
        }
        {
            b = 0i;
            loop {
                let _e137 = b;
                let _e138 = NB;
                if !((_e137 < _e138)) {
                    break;
                }
                {
                    let _e147 = a;
                    let _e152 = NA;
                    th = ((6.2831855f * (f32(_e147) + 0.5f)) / f32(_e152));
                    let _e156 = b;
                    let _e160 = NB;
                    ct = ((f32(_e156) + 0.5f) / f32(_e160));
                    let _e165 = ct;
                    let _e166 = ct;
                    st = sqrt((1f - (_e165 * _e166)));
                    let _e171 = th;
                    let _e173 = st;
                    let _e175 = ct;
                    let _e176 = th;
                    let _e178 = st;
                    dir = vec3<f32>((cos(_e171) * _e173), _e175, (sin(_e176) * _e178));
                    let _e183 = rK_2;
                    let _e185 = ct;
                    let _e187 = rK_2;
                    let _e188 = rK_2;
                    let _e190 = ct;
                    let _e191 = ct;
                    let _e196 = topK;
                    let _e197 = topK;
                    tMax = max(0f, ((-(_e183) * _e185) + sqrt(max((((_e187 * _e188) * ((_e190 * _e191) - 1f)) + (_e196 * _e197)), 0f))));
                    thr = vec3(1f);
                    L = vec3(0f);
                    let _e212 = dir;
                    let _e213 = sunDir;
                    cs = dot(_e212, _e213);
                    let _e216 = cs;
                    let _e217 = phaseMie(_e216);
                    pM = _e217;
                    let _e219 = cs;
                    let _e220 = phaseRayleigh(_e219);
                    pR = _e220;
                    s = 0i;
                    loop {
                        let _e224 = s;
                        let _e225 = STEPS;
                        if !((_e224 < _e225)) {
                            break;
                        }
                        {
                            let _e231 = s;
                            let _e233 = STEPS;
                            u0_ = (f32(_e231) / f32(_e233));
                            let _e237 = s;
                            let _e241 = STEPS;
                            u1_ = (f32((_e237 + 1i)) / f32(_e241));
                            let _e245 = tMax;
                            let _e246 = u0_;
                            let _e247 = u0_;
                            let _e249 = u1_;
                            let _e250 = u1_;
                            t = ((_e245 * ((_e246 * _e247) + (_e249 * _e250))) * 0.5f);
                            let _e257 = tMax;
                            let _e258 = u1_;
                            let _e259 = u1_;
                            let _e261 = u0_;
                            let _e262 = u0_;
                            dt = (_e257 * ((_e258 * _e259) - (_e261 * _e262)));
                            let _e267 = pos;
                            let _e268 = dir;
                            let _e269 = t;
                            p_2 = (_e267 + (_e268 * _e269));
                            let _e273 = p_2;
                            rr = length(_e273);
                            let _e279 = rr;
                            let _e280 = Rk_2;
                            mediumAtReal((_e279 - _e280), (&sR), (&sM), (&e));
                            let _e288 = e;
                            let _e290 = dt;
                            Ts = exp((-(_e288) * _e290));
                            let _e294 = p_2;
                            let _e295 = rr;
                            let _e298 = sunDir;
                            mus = dot((_e294 / vec3(_e295)), _e298);
                            let _e301 = rr;
                            let _e302 = Rk_2;
                            let _e303 = mus;
                            let _e304 = sunAtTrue(_e301, _e302, _e303);
                            sunT = _e304;
                            let _e306 = global.uRadius;
                            let _e307 = rr;
                            let _e308 = Rk_2;
                            let _e310 = drawnH((_e307 - _e308));
                            let _e312 = mus;
                            let _e313 = multiScatterAt((_e306 + _e310), _e312);
                            ms = _e313;
                            let _e315 = sR;
                            let _e316 = sunT;
                            let _e317 = pR;
                            let _e319 = ms;
                            let _e322 = sM;
                            let _e323 = sunT;
                            let _e324 = pM;
                            let _e326 = ms;
                            S = ((_e315 * ((_e316 * _e317) + _e319)) + (_e322 * ((_e323 * _e324) + _e326)));
                            let _e331 = e;
                            eSafe = max(_e331, vec3(0.000000000001f));
                            let _e336 = L;
                            let _e337 = thr;
                            let _e338 = S;
                            let _e339 = S;
                            let _e340 = Ts;
                            let _e344 = eSafe;
                            L = (_e336 + ((_e337 * (_e338 - (_e339 * _e340))) / _e344));
                            let _e347 = thr;
                            let _e348 = Ts;
                            thr = (_e347 * _e348);
                        }
                        continuing {
                            let _e228 = s;
                            s = (_e228 + 1i);
                        }
                    }
                    let _e350 = E;
                    let _e351 = L;
                    let _e352 = ct;
                    let _e357 = NA;
                    let _e362 = NB;
                    let _e367 = ct;
                    let _e372 = ct;
                    E = (_e350 + (((((_e351 * _e352) * (6.2831855f / f32(_e357))) * (1f / f32(_e362))) * (1f / max(_e367, 0.001f))) * _e372));
                }
                continuing {
                    let _e141 = b;
                    b = (_e141 + 1i);
                }
            }
        }
        continuing {
            let _e132 = a;
            a = (_e132 + 1i);
        }
    }
    let _e375 = E;
    fragmentColor = vec4<f32>(_e375.x, _e375.y, _e375.z, 1f);
    return;
}

@fragment 
fn main(@location(0) vUv: vec2<f32>) -> FragmentOutput {
    vUv_1 = vUv;
    main_1();
    let _e72 = fragmentColor;
    return FragmentOutput(_e72);
}
`;
