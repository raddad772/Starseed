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
    let _e59 = r_5;
    let _e60 = global.uRadius;
    h = (_e59 - _e60);
    let _e63 = h;
    let _e64 = global.uKnee;
    if (_e63 <= _e64) {
        let _e66 = h;
        local_1 = _e66;
    } else {
        let _e67 = global.uKnee;
        let _e68 = h;
        let _e69 = global.uKnee;
        let _e71 = global.uUpper;
        local_1 = (_e67 + ((_e68 - _e69) / _e71));
    }
    let _e75 = local_1;
    hr = _e75;
    let _e77 = hr;
    let _e79 = global.uRayleighH;
    dR = exp((-(_e77) / _e79));
    let _e83 = hr;
    let _e85 = global.uMieH;
    dM = exp((-(_e83) / _e85));
    let _e89 = global.uAbsExp;
    if (_e89 > 0.5f) {
        let _e92 = dR;
        local_2 = _e92;
    } else {
        let _e95 = h;
        let _e96 = global.uAbsCenter;
        let _e99 = global.uAbsWidth;
        local_2 = max(0f, (1f - (abs((_e95 - _e96)) / max(_e99, 1f))));
    }
    let _e106 = local_2;
    dA = _e106;
    let _e108 = global.uHaze;
    let _e110 = gHazeK;
    let _e112 = h;
    let _e116 = global.uHaze;
    let _e123 = global.uHazeCol;
    dH = (((_e108.x * _e110) * exp((-(max(_e112, 0f)) / max(_e116.y, 1f)))) * _e123);
    let _e126 = global.uRayleigh;
    let _e127 = dR;
    (*scatR) = (_e126 * _e127);
    let _e129 = global.uMie;
    let _e130 = dM;
    let _e132 = dH;
    (*scatM) = ((_e129 * _e130) + _e132);
    let _e134 = (*scatR);
    let _e135 = (*scatM);
    let _e137 = global.uMieAbs;
    let _e138 = dM;
    let _e141 = global.uAbs;
    let _e142 = dA;
    let _e145 = dH;
    let _e146 = global.uHaze;
    (*ext) = ((((_e134 + _e135) + (_e137 * _e138)) + (_e141 * _e142)) + (_e145 * _e146.z));
    return;
}

fn realH(h_1: f32) -> f32 {
    var h_2: f32;
    var local_3: f32;

    h_2 = h_1;
    let _e56 = h_2;
    let _e57 = global.uKnee;
    if (_e56 <= _e57) {
        let _e59 = h_2;
        local_3 = _e59;
    } else {
        let _e60 = global.uKnee;
        let _e61 = h_2;
        let _e62 = global.uKnee;
        let _e64 = global.uUpper;
        local_3 = (_e60 + ((_e61 - _e62) / _e64));
    }
    let _e68 = local_3;
    return _e68;
}

fn drawnH(hr_1: f32) -> f32 {
    var hr_2: f32;
    var local_4: f32;

    hr_2 = hr_1;
    let _e56 = hr_2;
    let _e57 = global.uKnee;
    if (_e56 <= _e57) {
        let _e59 = hr_2;
        local_4 = _e59;
    } else {
        let _e60 = global.uKnee;
        let _e61 = hr_2;
        let _e62 = global.uKnee;
        let _e64 = global.uUpper;
        local_4 = (_e60 + ((_e61 - _e62) * _e64));
    }
    let _e68 = local_4;
    return _e68;
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
    let _e59 = hr_4;
    let _e60 = drawnH(_e59);
    h_3 = _e60;
    let _e62 = hr_4;
    let _e64 = global.uRayleighH;
    dR_1 = exp((-(_e62) / _e64));
    let _e68 = hr_4;
    let _e70 = global.uMieH;
    dM_1 = exp((-(_e68) / _e70));
    let _e74 = global.uAbsExp;
    if (_e74 > 0.5f) {
        let _e77 = dR_1;
        local_5 = _e77;
    } else {
        let _e80 = h_3;
        let _e81 = global.uAbsCenter;
        let _e84 = global.uAbsWidth;
        local_5 = max(0f, (1f - (abs((_e80 - _e81)) / max(_e84, 1f))));
    }
    let _e91 = local_5;
    dA_1 = _e91;
    let _e93 = global.uHaze;
    let _e95 = gHazeK;
    let _e97 = hr_4;
    let _e101 = global.uHaze;
    let _e108 = global.uHazeCol;
    dH_1 = (((_e93.x * _e95) * exp((-(max(_e97, 0f)) / max(_e101.y, 1f)))) * _e108);
    let _e111 = global.uRayleigh;
    let _e112 = dR_1;
    (*scatR_1) = (_e111 * _e112);
    let _e114 = global.uMie;
    let _e115 = dM_1;
    let _e117 = dH_1;
    (*scatM_1) = ((_e114 * _e115) + _e117);
    let _e119 = (*scatR_1);
    let _e120 = (*scatM_1);
    let _e122 = global.uMieAbs;
    let _e123 = dM_1;
    let _e126 = global.uAbs;
    let _e127 = dA_1;
    let _e130 = dH_1;
    let _e131 = global.uHaze;
    (*ext_1) = ((((_e119 + _e120) + (_e122 * _e123)) + (_e126 * _e127)) + (_e130 * _e131.z));
    return;
}

fn phaseRayleigh(c: f32) -> f32 {
    var c_1: f32;

    c_1 = c;
    let _e62 = c_1;
    let _e63 = c_1;
    return (0.059683103f * (1f + (_e62 * _e63)));
}

fn phaseCS(c_2: f32, g: f32) -> f32 {
    var c_3: f32;
    var g_1: f32;
    var g2_: f32;

    c_3 = c_2;
    g_1 = g;
    let _e58 = g_1;
    let _e59 = g_1;
    g2_ = (_e58 * _e59);
    let _e68 = g2_;
    let _e71 = c_3;
    let _e72 = c_3;
    let _e78 = g2_;
    let _e81 = g2_;
    let _e84 = g_1;
    let _e86 = c_3;
    return ((0.119366206f * ((1f - _e68) * (1f + (_e71 * _e72)))) / ((2f + _e78) * pow(max(((1f + _e81) - ((2f * _e84) * _e86)), 0.0001f), 1.5f)));
}

fn phaseHG(c_4: f32, g_2: f32) -> f32 {
    var c_5: f32;
    var g_3: f32;

    c_5 = c_4;
    g_3 = g_2;
    let _e59 = g_3;
    let _e60 = g_3;
    let _e67 = g_3;
    let _e68 = g_3;
    let _e72 = g_3;
    let _e74 = c_5;
    return ((1f - (_e59 * _e60)) / (12.566371f * pow(max(((1f + (_e67 * _e68)) - ((2f * _e72) * _e74)), 0.000001f), 1.5f)));
}

fn phaseMie(c_6: f32) -> vec3<f32> {
    var c_7: f32;

    c_7 = c_6;
    let _e56 = c_7;
    let _e57 = global.uMieG;
    let _e59 = phaseCS(_e56, _e57.x);
    let _e60 = c_7;
    let _e61 = global.uMieG;
    let _e63 = phaseCS(_e60, _e61.y);
    let _e64 = c_7;
    let _e65 = global.uMieG;
    let _e67 = phaseCS(_e64, _e65.z);
    let _e69 = c_7;
    let _e70 = global.uMieGL;
    let _e72 = phaseHG(_e69, _e70.x);
    let _e73 = c_7;
    let _e74 = global.uMieGL;
    let _e76 = phaseHG(_e73, _e74.y);
    let _e77 = c_7;
    let _e78 = global.uMieGL;
    let _e80 = phaseHG(_e77, _e78.z);
    let _e82 = global.uMieF;
    return mix(vec3<f32>(_e59, _e63, _e67), vec3<f32>(_e72, _e76, _e80), _e82);
}

fn distToTop(r_6: f32, mu_4: f32) -> f32 {
    var r_7: f32;
    var mu_5: f32;
    var disc_1: f32;

    r_7 = r_6;
    mu_5 = mu_4;
    let _e58 = r_7;
    let _e59 = r_7;
    let _e61 = mu_5;
    let _e62 = mu_5;
    let _e67 = global.uTop;
    let _e68 = global.uTop;
    disc_1 = (((_e58 * _e59) * ((_e61 * _e62) - 1f)) + (_e67 * _e68));
    let _e73 = r_7;
    let _e75 = mu_5;
    let _e77 = disc_1;
    return max(0f, ((-(_e73) * _e75) + sqrt(max(_e77, 0f))));
}

fn hitsGround(r_8: f32, mu_6: f32, gr: f32) -> bool {
    var r_9: f32;
    var mu_7: f32;
    var gr_1: f32;

    r_9 = r_8;
    mu_7 = mu_6;
    gr_1 = gr;
    let _e60 = mu_7;
    let _e63 = r_9;
    let _e64 = r_9;
    let _e66 = mu_7;
    let _e67 = mu_7;
    let _e72 = gr_1;
    let _e73 = gr_1;
    return ((_e60 < 0f) && ((((_e63 * _e64) * ((_e66 * _e67) - 1f)) + (_e72 * _e73)) >= 0f));
}

fn transmittanceToTop(r_10: f32, mu_8: f32) -> vec3<f32> {
    var r_11: f32;
    var mu_9: f32;
    var uv: vec2<f32>;

    r_11 = r_10;
    mu_9 = mu_8;
    let _e58 = r_11;
    let _e59 = global.uBottom;
    let _e60 = global.uTop;
    let _e62 = mu_9;
    let _e63 = transmittanceUV(clamp(_e58, _e59, _e60), _e62);
    uv = _e63;
    let _e72 = uv;
    uv = (vec2<f32>(0.001953125f, 0.0078125f) + (_e72 * vec2<f32>(0.99609375f, 0.984375f)));
    let _e82 = uv;
    let _e84 = textureSampleLevel(tTransTexture, tTransSampler, _e82, 0f);
    return _e84.xyz;
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
    let _e58 = mu_11;
    let _e59 = liftMu(_e58);
    mu_11 = _e59;
    let _e60 = global.uGround;
    let _e61 = global.uTrueK;
    Rg = (_e60 * max(_e61, 1f));
    let _e66 = Rg;
    let _e67 = Rg;
    let _e68 = r_13;
    let _e69 = global.uGround;
    sinH = (_e66 / (_e67 + max((_e68 - _e69), 0f)));
    let _e78 = sinH;
    let _e79 = sinH;
    cosH = -(sqrt(max(0f, (1f - (_e78 * _e79)))));
    let _e86 = cosH;
    let _e89 = cosH;
    let _e92 = mu_11;
    vis = smoothstep((_e86 - 0.004f), (_e89 + 0.004f), _e92);
    let _e95 = r_13;
    let _e96 = mu_11;
    let _e97 = transmittanceToTop(_e95, _e96);
    let _e98 = vis;
    return (_e97 * _e98);
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
    let _e60 = global.uRadius;
    let _e61 = rK_1;
    let _e62 = Rk_1;
    let _e64 = drawnH((_e61 - _e62));
    rD = (_e60 + _e64);
    let _e67 = Rk_1;
    let _e68 = global.uGround;
    let _e69 = global.uRadius;
    let _e71 = realH((_e68 - _e69));
    gK = (_e67 + _e71);
    let _e74 = gK;
    let _e75 = rK_1;
    let _e76 = gK;
    sinH_1 = (_e74 / max(_e75, _e76));
    let _e82 = sinH_1;
    let _e83 = sinH_1;
    cosH_1 = -(sqrt(max(0f, (1f - (_e82 * _e83)))));
    let _e90 = rD;
    let _e91 = global.uBottom;
    let _e92 = global.uTop;
    let _e94 = mu_13;
    let _e95 = transmittanceToTop(clamp(_e90, _e91, _e92), _e94);
    let _e96 = cosH_1;
    let _e99 = cosH_1;
    let _e102 = mu_13;
    return (_e95 * smoothstep((_e96 - 0.004f), (_e99 + 0.004f), _e102));
}

fn multiScatterAt(r_14: f32, muT: f32) -> vec3<f32> {
    var r_15: f32;
    var muT_1: f32;
    var uv_1: vec2<f32>;

    r_15 = r_14;
    muT_1 = muT;
    let _e58 = muT_1;
    let _e63 = r_15;
    let _e64 = global.uBottom;
    let _e66 = global.uTop;
    let _e67 = global.uBottom;
    uv_1 = vec2<f32>(((_e58 * 0.5f) + 0.5f), ((_e63 - _e64) / (_e66 - _e67)));
    let _e72 = uv_1;
    uv_1 = clamp(_e72, vec2(0f), vec2(1f));
    let _e82 = uv_1;
    uv_1 = (vec2(0.015625f) + (_e82 * 0.96875f));
    let _e88 = uv_1;
    let _e90 = textureSampleLevel(tMSTexture, tMSSampler, _e88, 0f);
    return _e90.xyz;
}

fn multiScatter(r_16: f32, muS: f32) -> vec3<f32> {
    var r_17: f32;
    var muS_1: f32;

    r_17 = r_16;
    muS_1 = muS;
    let _e58 = r_17;
    let _e59 = muS_1;
    let _e60 = liftMu(_e59);
    let _e61 = multiScatterAt(_e58, _e60);
    return _e61;
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
    let _e56 = vUv_1;
    muS_2 = ((_e56.x * 2f) - 1f);
    let _e63 = global.uGround;
    let _e64 = global.uTop;
    let _e65 = global.uGround;
    let _e67 = vUv_1;
    r_18 = ((_e63 + ((_e64 - _e65) * clamp(_e67.y, 0f, 1f))) + 1f);
    let _e77 = global.uTrueK;
    K = max(_e77, 1f);
    let _e81 = global.uRadius;
    let _e82 = K;
    Rk_2 = (_e81 * _e82);
    let _e85 = Rk_2;
    let _e86 = r_18;
    let _e87 = global.uRadius;
    let _e89 = realH((_e86 - _e87));
    rK_2 = (_e85 + _e89);
    let _e92 = Rk_2;
    let _e93 = global.uTop;
    let _e94 = global.uRadius;
    let _e96 = realH((_e93 - _e94));
    topK = (_e92 + _e96);
    let _e100 = muS_2;
    let _e103 = muS_2;
    let _e104 = muS_2;
    sunDir = vec3<f32>(0f, _e100, sqrt(max(0f, (1f - (_e103 * _e104)))));
    let _e112 = rK_2;
    pos = vec3<f32>(0f, _e112, 0f);
    loop {
        let _e127 = a;
        let _e128 = NA;
        if !((_e127 < _e128)) {
            break;
        }
        {
            b = 0i;
            loop {
                let _e136 = b;
                let _e137 = NB;
                if !((_e136 < _e137)) {
                    break;
                }
                {
                    let _e146 = a;
                    let _e151 = NA;
                    th = ((6.2831855f * (f32(_e146) + 0.5f)) / f32(_e151));
                    let _e155 = b;
                    let _e159 = NB;
                    ct = ((f32(_e155) + 0.5f) / f32(_e159));
                    let _e164 = ct;
                    let _e165 = ct;
                    st = sqrt((1f - (_e164 * _e165)));
                    let _e170 = th;
                    let _e172 = st;
                    let _e174 = ct;
                    let _e175 = th;
                    let _e177 = st;
                    dir = vec3<f32>((cos(_e170) * _e172), _e174, (sin(_e175) * _e177));
                    let _e182 = rK_2;
                    let _e184 = ct;
                    let _e186 = rK_2;
                    let _e187 = rK_2;
                    let _e189 = ct;
                    let _e190 = ct;
                    let _e195 = topK;
                    let _e196 = topK;
                    tMax = max(0f, ((-(_e182) * _e184) + sqrt(max((((_e186 * _e187) * ((_e189 * _e190) - 1f)) + (_e195 * _e196)), 0f))));
                    thr = vec3(1f);
                    L = vec3(0f);
                    let _e211 = dir;
                    let _e212 = sunDir;
                    cs = dot(_e211, _e212);
                    let _e215 = cs;
                    let _e216 = phaseMie(_e215);
                    pM = _e216;
                    let _e218 = cs;
                    let _e219 = phaseRayleigh(_e218);
                    pR = _e219;
                    s = 0i;
                    loop {
                        let _e223 = s;
                        let _e224 = STEPS;
                        if !((_e223 < _e224)) {
                            break;
                        }
                        {
                            let _e230 = s;
                            let _e232 = STEPS;
                            u0_ = (f32(_e230) / f32(_e232));
                            let _e236 = s;
                            let _e240 = STEPS;
                            u1_ = (f32((_e236 + 1i)) / f32(_e240));
                            let _e244 = tMax;
                            let _e245 = u0_;
                            let _e246 = u0_;
                            let _e248 = u1_;
                            let _e249 = u1_;
                            t = ((_e244 * ((_e245 * _e246) + (_e248 * _e249))) * 0.5f);
                            let _e256 = tMax;
                            let _e257 = u1_;
                            let _e258 = u1_;
                            let _e260 = u0_;
                            let _e261 = u0_;
                            dt = (_e256 * ((_e257 * _e258) - (_e260 * _e261)));
                            let _e266 = pos;
                            let _e267 = dir;
                            let _e268 = t;
                            p_2 = (_e266 + (_e267 * _e268));
                            let _e272 = p_2;
                            rr = length(_e272);
                            let _e278 = rr;
                            let _e279 = Rk_2;
                            mediumAtReal((_e278 - _e279), (&sR), (&sM), (&e));
                            let _e287 = e;
                            let _e289 = dt;
                            Ts = exp((-(_e287) * _e289));
                            let _e293 = p_2;
                            let _e294 = rr;
                            let _e297 = sunDir;
                            mus = dot((_e293 / vec3(_e294)), _e297);
                            let _e300 = rr;
                            let _e301 = Rk_2;
                            let _e302 = mus;
                            let _e303 = sunAtTrue(_e300, _e301, _e302);
                            sunT = _e303;
                            let _e305 = global.uRadius;
                            let _e306 = rr;
                            let _e307 = Rk_2;
                            let _e309 = drawnH((_e306 - _e307));
                            let _e311 = mus;
                            let _e312 = multiScatterAt((_e305 + _e309), _e311);
                            ms = _e312;
                            let _e314 = sR;
                            let _e315 = sunT;
                            let _e316 = pR;
                            let _e318 = ms;
                            let _e321 = sM;
                            let _e322 = sunT;
                            let _e323 = pM;
                            let _e325 = ms;
                            S = ((_e314 * ((_e315 * _e316) + _e318)) + (_e321 * ((_e322 * _e323) + _e325)));
                            let _e330 = e;
                            eSafe = max(_e330, vec3(0.000000000001f));
                            let _e335 = L;
                            let _e336 = thr;
                            let _e337 = S;
                            let _e338 = S;
                            let _e339 = Ts;
                            let _e343 = eSafe;
                            L = (_e335 + ((_e336 * (_e337 - (_e338 * _e339))) / _e343));
                            let _e346 = thr;
                            let _e347 = Ts;
                            thr = (_e346 * _e347);
                        }
                        continuing {
                            let _e227 = s;
                            s = (_e227 + 1i);
                        }
                    }
                    let _e349 = E;
                    let _e350 = L;
                    let _e351 = ct;
                    let _e356 = NA;
                    let _e361 = NB;
                    let _e366 = ct;
                    let _e371 = ct;
                    E = (_e349 + (((((_e350 * _e351) * (6.2831855f / f32(_e356))) * (1f / f32(_e361))) * (1f / max(_e366, 0.001f))) * _e371));
                }
                continuing {
                    let _e140 = b;
                    b = (_e140 + 1i);
                }
            }
        }
        continuing {
            let _e131 = a;
            a = (_e131 + 1i);
        }
    }
    let _e374 = E;
    fragmentColor = vec4<f32>(_e374.x, _e374.y, _e374.z, 1f);
    return;
}

@fragment 
fn main(@location(0) vUv: vec2<f32>) -> FragmentOutput {
    vUv_1 = vUv;
    main_1();
    let _e69 = fragmentColor;
    return FragmentOutput(_e69);
}
`;
