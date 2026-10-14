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
const NL: i32 = 64i;

@group(0) @binding(0) 
var<uniform> global: Params;
@group(0) @binding(1) 
var tTransTexture: texture_2d<f32>;
@group(0) @binding(2) 
var tTransSampler: sampler;
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
    let _e54 = global.uTop;
    let _e55 = global.uTop;
    let _e57 = global.uBottom;
    let _e58 = global.uBottom;
    H = sqrt(max(0f, ((_e54 * _e55) - (_e57 * _e58))));
    let _e65 = r_1;
    let _e66 = r_1;
    let _e68 = global.uBottom;
    let _e69 = global.uBottom;
    rho = sqrt(max(0f, ((_e65 * _e66) - (_e68 * _e69))));
    let _e75 = r_1;
    let _e76 = r_1;
    let _e78 = mu_1;
    let _e79 = mu_1;
    let _e84 = global.uTop;
    let _e85 = global.uTop;
    disc = (((_e75 * _e76) * ((_e78 * _e79) - 1f)) + (_e84 * _e85));
    let _e90 = r_1;
    let _e92 = mu_1;
    let _e94 = disc;
    d = max(0f, ((-(_e90) * _e92) + sqrt(max(_e94, 0f))));
    let _e101 = global.uTop;
    let _e102 = r_1;
    dMin = (_e101 - _e102);
    let _e105 = rho;
    let _e106 = H;
    dMax = (_e105 + _e106);
    let _e109 = d;
    let _e110 = dMin;
    let _e112 = dMax;
    let _e113 = dMin;
    xmu = ((_e109 - _e110) / max((_e112 - _e113), 0.000001f));
    let _e119 = rho;
    let _e120 = H;
    xr = (_e119 / max(_e120, 0.000001f));
    let _e125 = xmu;
    let _e126 = xr;
    return vec2<f32>(_e125, _e126);
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
    let _e57 = upC_1;
    let _e58 = p_1;
    let _e59 = r_3;
    let _e63 = k_1;
    return normalize(mix(_e57, (_e58 / vec3(_e59)), vec3((1f / _e63))));
}

fn trueK(hc: f32) -> f32 {
    var hc_1: f32;

    hc_1 = hc;
    let _e51 = global.uTrueK;
    let _e57 = hc_1;
    return mix(max(_e51, 1f), 1f, smoothstep(20000f, 60000f, _e57));
}

fn lensTrueZ(zd: f32) -> f32 {
    var zd_1: f32;
    var hD: f32;
    var hT: f32;
    var local: f32;

    zd_1 = zd;
    let _e53 = global.uSunLift;
    hD = (1.5707963f + _e53.x);
    let _e58 = global.uSunLift;
    hT = (1.5707963f + _e58.y);
    let _e62 = zd_1;
    let _e63 = hD;
    if (_e62 <= _e63) {
        let _e65 = zd_1;
        let _e66 = hT;
        let _e68 = hD;
        local = ((_e65 * _e66) / _e68);
    } else {
        let _e70 = hT;
        let _e71 = zd_1;
        let _e72 = hD;
        let _e75 = hT;
        let _e79 = hD;
        local = (_e70 + (((_e71 - _e72) * (3.1415927f - _e75)) / (3.1415927f - _e79)));
    }
    let _e84 = local;
    return _e84;
}

fn liftMu(mu_2: f32) -> f32 {
    var mu_3: f32;

    mu_3 = mu_2;
    let _e52 = global.uSunLift;
    let _e54 = global.uSunLift;
    if (_e52.x <= _e54.y) {
        let _e57 = mu_3;
        return _e57;
    }
    let _e58 = mu_3;
    let _e64 = lensTrueZ(acos(clamp(_e58, -1f, 1f)));
    return cos(_e64);
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
    let _e58 = r_5;
    let _e59 = global.uRadius;
    h = (_e58 - _e59);
    let _e62 = h;
    let _e63 = global.uKnee;
    if (_e62 <= _e63) {
        let _e65 = h;
        local_1 = _e65;
    } else {
        let _e66 = global.uKnee;
        let _e67 = h;
        let _e68 = global.uKnee;
        let _e70 = global.uUpper;
        local_1 = (_e66 + ((_e67 - _e68) / _e70));
    }
    let _e74 = local_1;
    hr = _e74;
    let _e76 = hr;
    let _e78 = global.uRayleighH;
    dR = exp((-(_e76) / _e78));
    let _e82 = hr;
    let _e84 = global.uMieH;
    dM = exp((-(_e82) / _e84));
    let _e88 = global.uAbsExp;
    if (_e88 > 0.5f) {
        let _e91 = dR;
        local_2 = _e91;
    } else {
        let _e94 = h;
        let _e95 = global.uAbsCenter;
        let _e98 = global.uAbsWidth;
        local_2 = max(0f, (1f - (abs((_e94 - _e95)) / max(_e98, 1f))));
    }
    let _e105 = local_2;
    dA = _e105;
    let _e107 = global.uHaze;
    let _e109 = gHazeK;
    let _e111 = gHazeH;
    let _e113 = h;
    let _e117 = global.uHaze;
    let _e124 = global.uHazeCol;
    dH = ((((_e107.x * _e109) * _e111) * exp((-(max(_e113, 0f)) / max(_e117.y, 1f)))) * _e124);
    let _e127 = global.uRayleigh;
    let _e128 = dR;
    (*scatR) = (_e127 * _e128);
    let _e130 = global.uMie;
    let _e131 = dM;
    let _e133 = dH;
    (*scatM) = ((_e130 * _e131) + _e133);
    let _e135 = (*scatR);
    let _e136 = (*scatM);
    let _e138 = global.uMieAbs;
    let _e139 = dM;
    let _e142 = global.uAbs;
    let _e143 = dA;
    let _e146 = dH;
    let _e147 = global.uHaze;
    (*ext) = ((((_e135 + _e136) + (_e138 * _e139)) + (_e142 * _e143)) + (_e146 * _e147.z));
    return;
}

fn realH(h_1: f32) -> f32 {
    var h_2: f32;
    var local_3: f32;

    h_2 = h_1;
    let _e55 = h_2;
    let _e56 = global.uKnee;
    if (_e55 <= _e56) {
        let _e58 = h_2;
        local_3 = _e58;
    } else {
        let _e59 = global.uKnee;
        let _e60 = h_2;
        let _e61 = global.uKnee;
        let _e63 = global.uUpper;
        local_3 = (_e59 + ((_e60 - _e61) / _e63));
    }
    let _e67 = local_3;
    return _e67;
}

fn drawnH(hr_1: f32) -> f32 {
    var hr_2: f32;
    var local_4: f32;

    hr_2 = hr_1;
    let _e55 = hr_2;
    let _e56 = global.uKnee;
    if (_e55 <= _e56) {
        let _e58 = hr_2;
        local_4 = _e58;
    } else {
        let _e59 = global.uKnee;
        let _e60 = hr_2;
        let _e61 = global.uKnee;
        let _e63 = global.uUpper;
        local_4 = (_e59 + ((_e60 - _e61) * _e63));
    }
    let _e67 = local_4;
    return _e67;
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
    let _e58 = hr_4;
    let _e59 = drawnH(_e58);
    h_3 = _e59;
    let _e61 = hr_4;
    let _e63 = global.uRayleighH;
    dR_1 = exp((-(_e61) / _e63));
    let _e67 = hr_4;
    let _e69 = global.uMieH;
    dM_1 = exp((-(_e67) / _e69));
    let _e73 = global.uAbsExp;
    if (_e73 > 0.5f) {
        let _e76 = dR_1;
        local_5 = _e76;
    } else {
        let _e79 = h_3;
        let _e80 = global.uAbsCenter;
        let _e83 = global.uAbsWidth;
        local_5 = max(0f, (1f - (abs((_e79 - _e80)) / max(_e83, 1f))));
    }
    let _e90 = local_5;
    dA_1 = _e90;
    let _e92 = global.uHaze;
    let _e94 = gHazeK;
    let _e96 = hr_4;
    let _e100 = global.uHaze;
    let _e107 = global.uHazeCol;
    dH_1 = (((_e92.x * _e94) * exp((-(max(_e96, 0f)) / max(_e100.y, 1f)))) * _e107);
    let _e110 = global.uRayleigh;
    let _e111 = dR_1;
    (*scatR_1) = (_e110 * _e111);
    let _e113 = global.uMie;
    let _e114 = dM_1;
    let _e116 = dH_1;
    (*scatM_1) = ((_e113 * _e114) + _e116);
    let _e118 = (*scatR_1);
    let _e119 = (*scatM_1);
    let _e121 = global.uMieAbs;
    let _e122 = dM_1;
    let _e125 = global.uAbs;
    let _e126 = dA_1;
    let _e129 = dH_1;
    let _e130 = global.uHaze;
    (*ext_1) = ((((_e118 + _e119) + (_e121 * _e122)) + (_e125 * _e126)) + (_e129 * _e130.z));
    return;
}

fn phaseRayleigh(c: f32) -> f32 {
    var c_1: f32;

    c_1 = c;
    let _e61 = c_1;
    let _e62 = c_1;
    return (0.059683103f * (1f + (_e61 * _e62)));
}

fn phaseCS(c_2: f32, g: f32) -> f32 {
    var c_3: f32;
    var g_1: f32;
    var g2_: f32;

    c_3 = c_2;
    g_1 = g;
    let _e57 = g_1;
    let _e58 = g_1;
    g2_ = (_e57 * _e58);
    let _e67 = g2_;
    let _e70 = c_3;
    let _e71 = c_3;
    let _e77 = g2_;
    let _e80 = g2_;
    let _e83 = g_1;
    let _e85 = c_3;
    return ((0.119366206f * ((1f - _e67) * (1f + (_e70 * _e71)))) / ((2f + _e77) * pow(max(((1f + _e80) - ((2f * _e83) * _e85)), 0.0001f), 1.5f)));
}

fn phaseHG(c_4: f32, g_2: f32) -> f32 {
    var c_5: f32;
    var g_3: f32;

    c_5 = c_4;
    g_3 = g_2;
    let _e58 = g_3;
    let _e59 = g_3;
    let _e66 = g_3;
    let _e67 = g_3;
    let _e71 = g_3;
    let _e73 = c_5;
    return ((1f - (_e58 * _e59)) / (12.566371f * pow(max(((1f + (_e66 * _e67)) - ((2f * _e71) * _e73)), 0.000001f), 1.5f)));
}

fn phaseMie(c_6: f32) -> vec3<f32> {
    var c_7: f32;

    c_7 = c_6;
    let _e55 = c_7;
    let _e56 = global.uMieG;
    let _e58 = phaseCS(_e55, _e56.x);
    let _e59 = c_7;
    let _e60 = global.uMieG;
    let _e62 = phaseCS(_e59, _e60.y);
    let _e63 = c_7;
    let _e64 = global.uMieG;
    let _e66 = phaseCS(_e63, _e64.z);
    let _e68 = c_7;
    let _e69 = global.uMieGL;
    let _e71 = phaseHG(_e68, _e69.x);
    let _e72 = c_7;
    let _e73 = global.uMieGL;
    let _e75 = phaseHG(_e72, _e73.y);
    let _e76 = c_7;
    let _e77 = global.uMieGL;
    let _e79 = phaseHG(_e76, _e77.z);
    let _e81 = global.uMieF;
    return mix(vec3<f32>(_e58, _e62, _e66), vec3<f32>(_e71, _e75, _e79), _e81);
}

fn distToTop(r_6: f32, mu_4: f32) -> f32 {
    var r_7: f32;
    var mu_5: f32;
    var disc_1: f32;

    r_7 = r_6;
    mu_5 = mu_4;
    let _e57 = r_7;
    let _e58 = r_7;
    let _e60 = mu_5;
    let _e61 = mu_5;
    let _e66 = global.uTop;
    let _e67 = global.uTop;
    disc_1 = (((_e57 * _e58) * ((_e60 * _e61) - 1f)) + (_e66 * _e67));
    let _e72 = r_7;
    let _e74 = mu_5;
    let _e76 = disc_1;
    return max(0f, ((-(_e72) * _e74) + sqrt(max(_e76, 0f))));
}

fn hitsGround(r_8: f32, mu_6: f32, gr: f32) -> bool {
    var r_9: f32;
    var mu_7: f32;
    var gr_1: f32;

    r_9 = r_8;
    mu_7 = mu_6;
    gr_1 = gr;
    let _e59 = mu_7;
    let _e62 = r_9;
    let _e63 = r_9;
    let _e65 = mu_7;
    let _e66 = mu_7;
    let _e71 = gr_1;
    let _e72 = gr_1;
    return ((_e59 < 0f) && ((((_e62 * _e63) * ((_e65 * _e66) - 1f)) + (_e71 * _e72)) >= 0f));
}

fn transmittanceToTop(r_10: f32, mu_8: f32) -> vec3<f32> {
    var r_11: f32;
    var mu_9: f32;
    var uv: vec2<f32>;

    r_11 = r_10;
    mu_9 = mu_8;
    let _e57 = r_11;
    let _e58 = global.uBottom;
    let _e59 = global.uTop;
    let _e61 = mu_9;
    let _e62 = transmittanceUV(clamp(_e57, _e58, _e59), _e61);
    uv = _e62;
    let _e71 = uv;
    uv = (vec2<f32>(0.001953125f, 0.0078125f) + (_e71 * vec2<f32>(0.99609375f, 0.984375f)));
    let _e81 = uv;
    let _e83 = textureSampleLevel(tTransTexture, tTransSampler, _e81, 0f);
    return _e83.xyz;
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
    let _e57 = mu_11;
    let _e58 = liftMu(_e57);
    mu_11 = _e58;
    let _e59 = global.uGround;
    let _e60 = global.uTrueK;
    Rg = (_e59 * max(_e60, 1f));
    let _e65 = Rg;
    let _e66 = Rg;
    let _e67 = r_13;
    let _e68 = global.uGround;
    sinH = (_e65 / (_e66 + max((_e67 - _e68), 0f)));
    let _e77 = sinH;
    let _e78 = sinH;
    cosH = -(sqrt(max(0f, (1f - (_e77 * _e78)))));
    let _e85 = cosH;
    let _e88 = cosH;
    let _e91 = mu_11;
    vis = smoothstep((_e85 - 0.004f), (_e88 + 0.004f), _e91);
    let _e94 = r_13;
    let _e95 = mu_11;
    let _e96 = transmittanceToTop(_e94, _e95);
    let _e97 = vis;
    return (_e96 * _e97);
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
    let _e59 = global.uRadius;
    let _e60 = rK_1;
    let _e61 = Rk_1;
    let _e63 = drawnH((_e60 - _e61));
    rD = (_e59 + _e63);
    let _e66 = Rk_1;
    let _e67 = global.uGround;
    let _e68 = global.uRadius;
    let _e70 = realH((_e67 - _e68));
    gK = (_e66 + _e70);
    let _e73 = gK;
    let _e74 = rK_1;
    let _e75 = gK;
    sinH_1 = (_e73 / max(_e74, _e75));
    let _e81 = sinH_1;
    let _e82 = sinH_1;
    cosH_1 = -(sqrt(max(0f, (1f - (_e81 * _e82)))));
    let _e89 = rD;
    let _e90 = global.uBottom;
    let _e91 = global.uTop;
    let _e93 = mu_13;
    let _e94 = transmittanceToTop(clamp(_e89, _e90, _e91), _e93);
    let _e95 = cosH_1;
    let _e98 = cosH_1;
    let _e101 = mu_13;
    return (_e94 * smoothstep((_e95 - 0.004f), (_e98 + 0.004f), _e101));
}

fn mieAsym() -> vec3<f32> {
    var g_4: vec3<f32>;
    var g2_1: vec3<f32>;
    var csm: vec3<f32>;

    let _e54 = global.uMieG;
    g_4 = _e54;
    let _e56 = g_4;
    let _e57 = g_4;
    g2_1 = (_e56 * _e57);
    let _e61 = g_4;
    let _e64 = g2_1;
    let _e70 = g2_1;
    csm = (((3f * _e61) * (vec3(4f) + _e64)) / (5f * (vec3(2f) + _e70)));
    let _e76 = csm;
    let _e77 = global.uMieGL;
    let _e78 = global.uMieF;
    return mix(_e76, _e77, _e78);
}

fn msLayer(i: i32, hG: f32, hT_1: f32, muS: f32, Rk_2: f32, gM: vec3<f32>, R: ptr<function, vec3<f32>>, T: ptr<function, vec3<f32>>, Su: ptr<function, vec3<f32>>, Sd: ptr<function, vec3<f32>>) {
    var i_1: i32;
    var hG_1: f32;
    var hT_2: f32;
    var muS_1: f32;
    var Rk_3: f32;
    var gM_1: vec3<f32>;
    var a0_: f32;
    var a1_: f32;
    var h0_: f32;
    var h1_: f32;
    var hm: f32;
    var sR: vec3<f32>;
    var sM: vec3<f32>;
    var e: vec3<f32>;
    var sc: vec3<f32>;
    var tau: vec3<f32>;
    var w: vec3<f32>;
    var g_5: vec3<f32>;
    var f: vec3<f32>;
    var tauP: vec3<f32>;
    var wP: vec3<f32>;
    var gP: vec3<f32>;
    var g1_: vec3<f32>;
    var g2_2: vec3<f32>;
    var k_2: vec3<f32>;
    var kt: vec3<f32>;
    var ep: vec3<f32>;
    var em: vec3<f32>;
    var sh: vec3<f32>;
    var den: vec3<f32>;
    var S: vec3<f32>;
    var up: vec3<f32>;

    i_1 = i;
    hG_1 = hG;
    hT_2 = hT_1;
    muS_1 = muS;
    Rk_3 = Rk_2;
    gM_1 = gM;
    let _e71 = i_1;
    a0_ = (f32(_e71) / 64f);
    let _e77 = i_1;
    a1_ = (f32((_e77 + 1i)) / 64f);
    let _e85 = hG_1;
    let _e86 = hT_2;
    let _e87 = hG_1;
    let _e89 = a0_;
    let _e91 = a0_;
    h0_ = (_e85 + (((_e86 - _e87) * _e89) * _e91));
    let _e95 = hG_1;
    let _e96 = hT_2;
    let _e97 = hG_1;
    let _e99 = a1_;
    let _e101 = a1_;
    h1_ = (_e95 + (((_e96 - _e97) * _e99) * _e101));
    let _e106 = h0_;
    let _e107 = h1_;
    hm = (0.5f * (_e106 + _e107));
    let _e114 = hm;
    mediumAtReal(_e114, (&sR), (&sM), (&e));
    let _e121 = sR;
    let _e122 = sM;
    sc = (_e121 + _e122);
    let _e125 = e;
    let _e126 = h1_;
    let _e127 = h0_;
    tau = (_e125 * (_e126 - _e127));
    let _e131 = sc;
    let _e132 = e;
    w = (_e131 / max(_e132, vec3(0.00000000000000000001f)));
    let _e138 = sM;
    let _e139 = gM_1;
    let _e141 = sc;
    g_5 = ((_e138 * _e139) / max(_e141, vec3(0.00000000000000000001f)));
    let _e147 = g_5;
    let _e148 = g_5;
    f = (_e147 * _e148);
    let _e151 = tau;
    let _e153 = w;
    let _e154 = f;
    tauP = (_e151 * (vec3(1f) - (_e153 * _e154)));
    let _e160 = w;
    let _e162 = f;
    let _e167 = w;
    let _e168 = f;
    wP = ((_e160 * (vec3(1f) - _e162)) / max((vec3(1f) - (_e167 * _e168)), vec3(0.000001f)));
    let _e177 = g_5;
    let _e178 = f;
    let _e181 = f;
    gP = ((_e177 - _e178) / max((vec3(1f) - _e181), vec3(0.000001f)));
    let _e190 = wP;
    let _e192 = gP;
    g1_ = (vec3(2f) - (_e190 * (vec3(1f) + _e192)));
    let _e199 = wP;
    let _e201 = gP;
    g2_2 = (_e199 * (vec3(1f) - _e201));
    let _e206 = g1_;
    let _e207 = g1_;
    let _e209 = g2_2;
    let _e210 = g2_2;
    k_2 = sqrt(max(((_e206 * _e207) - (_e209 * _e210)), vec3(0f)));
    let _e218 = k_2;
    let _e219 = tauP;
    kt = min((_e218 * _e219), vec3(30f));
    let _e225 = kt;
    ep = exp(_e225);
    let _e228 = kt;
    em = exp(-(_e228));
    let _e232 = tauP;
    let _e234 = kt;
    let _e235 = kt;
    let _e243 = ep;
    let _e244 = em;
    let _e247 = k_2;
    let _e255 = kt;
    sh = mix((_e232 * (vec3(1f) + ((_e234 * _e235) / vec3(6f)))), ((_e243 - _e244) / (2f * max(_e247, vec3(0.000000001f)))), step(vec3(0.001f), _e255));
    let _e260 = ep;
    let _e261 = em;
    let _e264 = g1_;
    let _e265 = sh;
    den = ((0.5f * (_e260 + _e261)) + (_e264 * _e265));
    let _e269 = g2_2;
    let _e270 = sh;
    let _e272 = den;
    (*R) = ((_e269 * _e270) / _e272);
    let _e275 = den;
    (*T) = (vec3(1f) / _e275);
    let _e278 = Rk_3;
    let _e279 = hm;
    let _e281 = Rk_3;
    let _e282 = muS_1;
    let _e283 = sunAtTrue((_e278 + _e279), _e281, _e282);
    let _e284 = w;
    let _e286 = tau;
    let _e289 = f;
    S = (((_e283 * _e284) * _e286) * (vec3(1f) - _e289));
    let _e296 = gP;
    let _e298 = muS_1;
    up = clamp((vec3(0.5f) - ((0.75f * _e296) * _e298)), vec3(0f), vec3(1f));
    let _e308 = S;
    let _e309 = up;
    (*Su) = (_e308 * _e309);
    let _e311 = S;
    let _e313 = up;
    (*Sd) = (_e311 * (vec3(1f) - _e313));
    return;
}

fn main_1() {
    var muS_2: f32;
    var r_14: f32;
    var K: f32;
    var Rk_4: f32;
    var hG_2: f32;
    var hT_3: f32;
    var hP: f32;
    var jP: i32;
    var gM_2: vec3<f32>;
    var R_1: vec3<f32>;
    var T_1: vec3<f32>;
    var Su_1: vec3<f32>;
    var Sd_1: vec3<f32>;
    var Rb: vec3<f32>;
    var U: vec3<f32>;
    var i_2: i32 = 0i;
    var d_1: vec3<f32>;
    var Ra: vec3<f32> = vec3(0f);
    var D: vec3<f32> = vec3(0f);
    var n: i32 = 0i;
    var i_3: i32;
    var d_2: vec3<f32>;
    var Fd: vec3<f32>;
    var Fu: vec3<f32>;

    gHazeK = 0f;
    let _e56 = vUv_1;
    muS_2 = ((_e56.x * 2f) - 1f);
    let _e63 = global.uBottom;
    let _e64 = global.uTop;
    let _e65 = global.uBottom;
    let _e67 = vUv_1;
    r_14 = (_e63 + ((_e64 - _e65) * clamp(_e67.y, 0.002f, 0.998f)));
    let _e75 = global.uTrueK;
    K = max(_e75, 1f);
    let _e79 = global.uRadius;
    let _e80 = K;
    Rk_4 = (_e79 * _e80);
    let _e83 = global.uGround;
    let _e84 = global.uRadius;
    let _e86 = realH((_e83 - _e84));
    hG_2 = _e86;
    let _e88 = global.uTop;
    let _e89 = global.uRadius;
    let _e91 = realH((_e88 - _e89));
    hT_3 = _e91;
    let _e93 = r_14;
    let _e94 = global.uRadius;
    let _e96 = realH((_e93 - _e94));
    let _e97 = hG_2;
    hP = max(_e96, _e97);
    let _e100 = hP;
    let _e101 = hG_2;
    let _e103 = hT_3;
    let _e104 = hG_2;
    jP = i32(floor(((sqrt(clamp(((_e100 - _e101) / max((_e103 - _e104), 1f)), 0f, 1f)) * 64f) + 0.5f)));
    let _e121 = mieAsym();
    gM_2 = _e121;
    let _e127 = global.uGroundAlbedo;
    Rb = _e127;
    let _e129 = global.uGroundAlbedo;
    let _e130 = Rk_4;
    let _e131 = hG_2;
    let _e133 = Rk_4;
    let _e134 = muS_2;
    let _e135 = sunAtTrue((_e130 + _e131), _e133, _e134);
    let _e137 = muS_2;
    U = ((_e129 * _e135) * max(_e137, 0f));
    loop {
        let _e144 = i_2;
        if !((_e144 < NL)) {
            break;
        }
        {
            let _e150 = i_2;
            let _e151 = jP;
            if (_e150 >= _e151) {
                break;
            }
            let _e153 = i_2;
            let _e154 = hG_2;
            let _e155 = hT_3;
            let _e156 = muS_2;
            let _e157 = Rk_4;
            let _e158 = gM_2;
            msLayer(_e153, _e154, _e155, _e156, _e157, _e158, (&R_1), (&T_1), (&Su_1), (&Sd_1));
            let _e169 = R_1;
            let _e170 = Rb;
            d_1 = (vec3(1f) / max((vec3(1f) - (_e169 * _e170)), vec3(0.000001f)));
            let _e180 = Su_1;
            let _e181 = T_1;
            let _e182 = U;
            let _e183 = Rb;
            let _e184 = Sd_1;
            let _e188 = d_1;
            U = (_e180 + ((_e181 * (_e182 + (_e183 * _e184))) * _e188));
            let _e191 = R_1;
            let _e192 = T_1;
            let _e193 = T_1;
            let _e195 = Rb;
            let _e197 = d_1;
            Rb = (_e191 + (((_e192 * _e193) * _e195) * _e197));
        }
        continuing {
            let _e147 = i_2;
            i_2 = (_e147 + 1i);
        }
    }
    loop {
        let _e208 = n;
        if !((_e208 < NL)) {
            break;
        }
        {
            let _e217 = n;
            i_3 = (63i - _e217);
            let _e220 = i_3;
            let _e221 = jP;
            if (_e220 < _e221) {
                break;
            }
            let _e223 = i_3;
            let _e224 = hG_2;
            let _e225 = hT_3;
            let _e226 = muS_2;
            let _e227 = Rk_4;
            let _e228 = gM_2;
            msLayer(_e223, _e224, _e225, _e226, _e227, _e228, (&R_1), (&T_1), (&Su_1), (&Sd_1));
            let _e239 = R_1;
            let _e240 = Ra;
            d_2 = (vec3(1f) / max((vec3(1f) - (_e239 * _e240)), vec3(0.000001f)));
            let _e250 = Sd_1;
            let _e251 = T_1;
            let _e252 = D;
            let _e253 = Ra;
            let _e254 = Su_1;
            let _e258 = d_2;
            D = (_e250 + ((_e251 * (_e252 + (_e253 * _e254))) * _e258));
            let _e261 = R_1;
            let _e262 = T_1;
            let _e263 = T_1;
            let _e265 = Ra;
            let _e267 = d_2;
            Ra = (_e261 + (((_e262 * _e263) * _e265) * _e267));
        }
        continuing {
            let _e211 = n;
            n = (_e211 + 1i);
        }
    }
    let _e270 = D;
    let _e271 = Ra;
    let _e272 = U;
    let _e276 = Ra;
    let _e277 = Rb;
    Fd = ((_e270 + (_e271 * _e272)) / max((vec3(1f) - (_e276 * _e277)), vec3(0.000001f)));
    let _e286 = U;
    let _e287 = Rb;
    let _e288 = Fd;
    Fu = (_e286 + (_e287 * _e288));
    let _e292 = Fu;
    let _e293 = Fd;
    let _e299 = ((_e292 + _e293) / vec3(6.2831855f));
    fragmentColor = vec4<f32>(_e299.x, _e299.y, _e299.z, 1f);
    return;
}

@fragment 
fn main(@location(0) vUv: vec2<f32>) -> FragmentOutput {
    vUv_1 = vUv;
    main_1();
    let _e70 = fragmentColor;
    return FragmentOutput(_e70);
}
`;
