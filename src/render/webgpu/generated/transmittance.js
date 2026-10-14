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
    }
  ],
  "textures": [],
  "bytes": 192,
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
}

struct FragmentOutput {
    @location(0) fragmentColor: vec4<f32>,
}

const PI_A: f32 = 3.1415927f;

@group(0) @binding(0) 
var<uniform> global: Params;
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
    let _e48 = global.uTop;
    let _e49 = global.uTop;
    let _e51 = global.uBottom;
    let _e52 = global.uBottom;
    H = sqrt(max(0f, ((_e48 * _e49) - (_e51 * _e52))));
    let _e59 = r_1;
    let _e60 = r_1;
    let _e62 = global.uBottom;
    let _e63 = global.uBottom;
    rho = sqrt(max(0f, ((_e59 * _e60) - (_e62 * _e63))));
    let _e69 = r_1;
    let _e70 = r_1;
    let _e72 = mu_1;
    let _e73 = mu_1;
    let _e78 = global.uTop;
    let _e79 = global.uTop;
    disc = (((_e69 * _e70) * ((_e72 * _e73) - 1f)) + (_e78 * _e79));
    let _e84 = r_1;
    let _e86 = mu_1;
    let _e88 = disc;
    d = max(0f, ((-(_e84) * _e86) + sqrt(max(_e88, 0f))));
    let _e95 = global.uTop;
    let _e96 = r_1;
    dMin = (_e95 - _e96);
    let _e99 = rho;
    let _e100 = H;
    dMax = (_e99 + _e100);
    let _e103 = d;
    let _e104 = dMin;
    let _e106 = dMax;
    let _e107 = dMin;
    xmu = ((_e103 - _e104) / max((_e106 - _e107), 0.000001f));
    let _e113 = rho;
    let _e114 = H;
    xr = (_e113 / max(_e114, 0.000001f));
    let _e119 = xmu;
    let _e120 = xr;
    return vec2<f32>(_e119, _e120);
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
    let _e51 = upC_1;
    let _e52 = p_1;
    let _e53 = r_3;
    let _e57 = k_1;
    return normalize(mix(_e51, (_e52 / vec3(_e53)), vec3((1f / _e57))));
}

fn trueK(hc: f32) -> f32 {
    var hc_1: f32;

    hc_1 = hc;
    let _e45 = global.uTrueK;
    let _e51 = hc_1;
    return mix(max(_e45, 1f), 1f, smoothstep(20000f, 60000f, _e51));
}

fn lensTrueZ(zd: f32) -> f32 {
    var zd_1: f32;
    var hD: f32;
    var hT: f32;
    var local: f32;

    zd_1 = zd;
    let _e47 = global.uSunLift;
    hD = (1.5707963f + _e47.x);
    let _e52 = global.uSunLift;
    hT = (1.5707963f + _e52.y);
    let _e56 = zd_1;
    let _e57 = hD;
    if (_e56 <= _e57) {
        let _e59 = zd_1;
        let _e60 = hT;
        let _e62 = hD;
        local = ((_e59 * _e60) / _e62);
    } else {
        let _e64 = hT;
        let _e65 = zd_1;
        let _e66 = hD;
        let _e69 = hT;
        let _e73 = hD;
        local = (_e64 + (((_e65 - _e66) * (3.1415927f - _e69)) / (3.1415927f - _e73)));
    }
    let _e78 = local;
    return _e78;
}

fn liftMu(mu_2: f32) -> f32 {
    var mu_3: f32;

    mu_3 = mu_2;
    let _e46 = global.uSunLift;
    let _e48 = global.uSunLift;
    if (_e46.x <= _e48.y) {
        let _e51 = mu_3;
        return _e51;
    }
    let _e52 = mu_3;
    let _e58 = lensTrueZ(acos(clamp(_e52, -1f, 1f)));
    return cos(_e58);
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
    let _e52 = r_5;
    let _e53 = global.uRadius;
    h = (_e52 - _e53);
    let _e56 = h;
    let _e57 = global.uKnee;
    if (_e56 <= _e57) {
        let _e59 = h;
        local_1 = _e59;
    } else {
        let _e60 = global.uKnee;
        let _e61 = h;
        let _e62 = global.uKnee;
        let _e64 = global.uUpper;
        local_1 = (_e60 + ((_e61 - _e62) / _e64));
    }
    let _e68 = local_1;
    hr = _e68;
    let _e70 = hr;
    let _e72 = global.uRayleighH;
    dR = exp((-(_e70) / _e72));
    let _e76 = hr;
    let _e78 = global.uMieH;
    dM = exp((-(_e76) / _e78));
    let _e82 = global.uAbsExp;
    if (_e82 > 0.5f) {
        let _e85 = dR;
        local_2 = _e85;
    } else {
        let _e88 = h;
        let _e89 = global.uAbsCenter;
        let _e92 = global.uAbsWidth;
        local_2 = max(0f, (1f - (abs((_e88 - _e89)) / max(_e92, 1f))));
    }
    let _e99 = local_2;
    dA = _e99;
    let _e101 = global.uHaze;
    let _e103 = gHazeK;
    let _e105 = gHazeH;
    let _e107 = h;
    let _e111 = global.uHaze;
    let _e118 = global.uHazeCol;
    dH = ((((_e101.x * _e103) * _e105) * exp((-(max(_e107, 0f)) / max(_e111.y, 1f)))) * _e118);
    let _e121 = global.uRayleigh;
    let _e122 = dR;
    (*scatR) = (_e121 * _e122);
    let _e124 = global.uMie;
    let _e125 = dM;
    let _e127 = dH;
    (*scatM) = ((_e124 * _e125) + _e127);
    let _e129 = (*scatR);
    let _e130 = (*scatM);
    let _e132 = global.uMieAbs;
    let _e133 = dM;
    let _e136 = global.uAbs;
    let _e137 = dA;
    let _e140 = dH;
    let _e141 = global.uHaze;
    (*ext) = ((((_e129 + _e130) + (_e132 * _e133)) + (_e136 * _e137)) + (_e140 * _e141.z));
    return;
}

fn realH(h_1: f32) -> f32 {
    var h_2: f32;
    var local_3: f32;

    h_2 = h_1;
    let _e49 = h_2;
    let _e50 = global.uKnee;
    if (_e49 <= _e50) {
        let _e52 = h_2;
        local_3 = _e52;
    } else {
        let _e53 = global.uKnee;
        let _e54 = h_2;
        let _e55 = global.uKnee;
        let _e57 = global.uUpper;
        local_3 = (_e53 + ((_e54 - _e55) / _e57));
    }
    let _e61 = local_3;
    return _e61;
}

fn drawnH(hr_1: f32) -> f32 {
    var hr_2: f32;
    var local_4: f32;

    hr_2 = hr_1;
    let _e49 = hr_2;
    let _e50 = global.uKnee;
    if (_e49 <= _e50) {
        let _e52 = hr_2;
        local_4 = _e52;
    } else {
        let _e53 = global.uKnee;
        let _e54 = hr_2;
        let _e55 = global.uKnee;
        let _e57 = global.uUpper;
        local_4 = (_e53 + ((_e54 - _e55) * _e57));
    }
    let _e61 = local_4;
    return _e61;
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
    let _e52 = hr_4;
    let _e53 = drawnH(_e52);
    h_3 = _e53;
    let _e55 = hr_4;
    let _e57 = global.uRayleighH;
    dR_1 = exp((-(_e55) / _e57));
    let _e61 = hr_4;
    let _e63 = global.uMieH;
    dM_1 = exp((-(_e61) / _e63));
    let _e67 = global.uAbsExp;
    if (_e67 > 0.5f) {
        let _e70 = dR_1;
        local_5 = _e70;
    } else {
        let _e73 = h_3;
        let _e74 = global.uAbsCenter;
        let _e77 = global.uAbsWidth;
        local_5 = max(0f, (1f - (abs((_e73 - _e74)) / max(_e77, 1f))));
    }
    let _e84 = local_5;
    dA_1 = _e84;
    let _e86 = global.uHaze;
    let _e88 = gHazeK;
    let _e90 = hr_4;
    let _e94 = global.uHaze;
    let _e101 = global.uHazeCol;
    dH_1 = (((_e86.x * _e88) * exp((-(max(_e90, 0f)) / max(_e94.y, 1f)))) * _e101);
    let _e104 = global.uRayleigh;
    let _e105 = dR_1;
    (*scatR_1) = (_e104 * _e105);
    let _e107 = global.uMie;
    let _e108 = dM_1;
    let _e110 = dH_1;
    (*scatM_1) = ((_e107 * _e108) + _e110);
    let _e112 = (*scatR_1);
    let _e113 = (*scatM_1);
    let _e115 = global.uMieAbs;
    let _e116 = dM_1;
    let _e119 = global.uAbs;
    let _e120 = dA_1;
    let _e123 = dH_1;
    let _e124 = global.uHaze;
    (*ext_1) = ((((_e112 + _e113) + (_e115 * _e116)) + (_e119 * _e120)) + (_e123 * _e124.z));
    return;
}

fn phaseRayleigh(c: f32) -> f32 {
    var c_1: f32;

    c_1 = c;
    let _e55 = c_1;
    let _e56 = c_1;
    return (0.059683103f * (1f + (_e55 * _e56)));
}

fn phaseCS(c_2: f32, g: f32) -> f32 {
    var c_3: f32;
    var g_1: f32;
    var g2_: f32;

    c_3 = c_2;
    g_1 = g;
    let _e51 = g_1;
    let _e52 = g_1;
    g2_ = (_e51 * _e52);
    let _e61 = g2_;
    let _e64 = c_3;
    let _e65 = c_3;
    let _e71 = g2_;
    let _e74 = g2_;
    let _e77 = g_1;
    let _e79 = c_3;
    return ((0.119366206f * ((1f - _e61) * (1f + (_e64 * _e65)))) / ((2f + _e71) * pow(max(((1f + _e74) - ((2f * _e77) * _e79)), 0.0001f), 1.5f)));
}

fn phaseHG(c_4: f32, g_2: f32) -> f32 {
    var c_5: f32;
    var g_3: f32;

    c_5 = c_4;
    g_3 = g_2;
    let _e52 = g_3;
    let _e53 = g_3;
    let _e60 = g_3;
    let _e61 = g_3;
    let _e65 = g_3;
    let _e67 = c_5;
    return ((1f - (_e52 * _e53)) / (12.566371f * pow(max(((1f + (_e60 * _e61)) - ((2f * _e65) * _e67)), 0.000001f), 1.5f)));
}

fn phaseMie(c_6: f32) -> vec3<f32> {
    var c_7: f32;

    c_7 = c_6;
    let _e49 = c_7;
    let _e50 = global.uMieG;
    let _e52 = phaseCS(_e49, _e50.x);
    let _e53 = c_7;
    let _e54 = global.uMieG;
    let _e56 = phaseCS(_e53, _e54.y);
    let _e57 = c_7;
    let _e58 = global.uMieG;
    let _e60 = phaseCS(_e57, _e58.z);
    let _e62 = c_7;
    let _e63 = global.uMieGL;
    let _e65 = phaseHG(_e62, _e63.x);
    let _e66 = c_7;
    let _e67 = global.uMieGL;
    let _e69 = phaseHG(_e66, _e67.y);
    let _e70 = c_7;
    let _e71 = global.uMieGL;
    let _e73 = phaseHG(_e70, _e71.z);
    let _e75 = global.uMieF;
    return mix(vec3<f32>(_e52, _e56, _e60), vec3<f32>(_e65, _e69, _e73), _e75);
}

fn distToTop(r_6: f32, mu_4: f32) -> f32 {
    var r_7: f32;
    var mu_5: f32;
    var disc_1: f32;

    r_7 = r_6;
    mu_5 = mu_4;
    let _e51 = r_7;
    let _e52 = r_7;
    let _e54 = mu_5;
    let _e55 = mu_5;
    let _e60 = global.uTop;
    let _e61 = global.uTop;
    disc_1 = (((_e51 * _e52) * ((_e54 * _e55) - 1f)) + (_e60 * _e61));
    let _e66 = r_7;
    let _e68 = mu_5;
    let _e70 = disc_1;
    return max(0f, ((-(_e66) * _e68) + sqrt(max(_e70, 0f))));
}

fn hitsGround(r_8: f32, mu_6: f32, gr: f32) -> bool {
    var r_9: f32;
    var mu_7: f32;
    var gr_1: f32;

    r_9 = r_8;
    mu_7 = mu_6;
    gr_1 = gr;
    let _e53 = mu_7;
    let _e56 = r_9;
    let _e57 = r_9;
    let _e59 = mu_7;
    let _e60 = mu_7;
    let _e65 = gr_1;
    let _e66 = gr_1;
    return ((_e53 < 0f) && ((((_e56 * _e57) * ((_e59 * _e60) - 1f)) + (_e65 * _e66)) >= 0f));
}

fn main_1() {
    var H_1: f32;
    var rho_1: f32;
    var r_10: f32;
    var dMin_1: f32;
    var dMax_1: f32;
    var d_1: f32;
    var local_6: f32;
    var mu_8: f32;
    var K: f32;
    var Rk: f32;
    var rK: f32;
    var topK: f32;
    var muK: f32;
    var len: f32;
    var N: i32 = 64i;
    var od: vec3<f32> = vec3(0f);
    var i: i32 = 0i;
    var u0_: f32;
    var u1_: f32;
    var t: f32;
    var dt: f32;
    var rr: f32;
    var sR: vec3<f32>;
    var sM: vec3<f32>;
    var e: vec3<f32>;

    gHazeK = 0f;
    let _e49 = global.uTop;
    let _e50 = global.uTop;
    let _e52 = global.uBottom;
    let _e53 = global.uBottom;
    H_1 = sqrt(((_e49 * _e50) - (_e52 * _e53)));
    let _e58 = H_1;
    let _e59 = vUv_1;
    rho_1 = (_e58 * _e59.y);
    let _e63 = rho_1;
    let _e64 = rho_1;
    let _e66 = global.uBottom;
    let _e67 = global.uBottom;
    r_10 = sqrt(((_e63 * _e64) + (_e66 * _e67)));
    let _e72 = global.uTop;
    let _e73 = r_10;
    dMin_1 = (_e72 - _e73);
    let _e76 = rho_1;
    let _e77 = H_1;
    dMax_1 = (_e76 + _e77);
    let _e80 = dMin_1;
    let _e81 = vUv_1;
    let _e83 = dMax_1;
    let _e84 = dMin_1;
    d_1 = (_e80 + (_e81.x * (_e83 - _e84)));
    let _e89 = d_1;
    if (_e89 < 0.001f) {
        local_6 = 1f;
    } else {
        let _e93 = H_1;
        let _e94 = H_1;
        let _e96 = rho_1;
        let _e97 = rho_1;
        let _e100 = d_1;
        let _e101 = d_1;
        let _e105 = r_10;
        let _e107 = d_1;
        local_6 = clamp(((((_e93 * _e94) - (_e96 * _e97)) - (_e100 * _e101)) / ((2f * _e105) * _e107)), -1f, 1f);
    }
    let _e115 = local_6;
    mu_8 = _e115;
    let _e117 = global.uTrueK;
    K = max(_e117, 1f);
    let _e121 = global.uRadius;
    let _e122 = K;
    Rk = (_e121 * _e122);
    let _e125 = Rk;
    let _e126 = r_10;
    let _e127 = global.uRadius;
    let _e129 = realH((_e126 - _e127));
    rK = (_e125 + _e129);
    let _e132 = Rk;
    let _e133 = global.uTop;
    let _e134 = global.uRadius;
    let _e136 = realH((_e133 - _e134));
    topK = (_e132 + _e136);
    let _e139 = mu_8;
    let _e142 = Rk;
    let _e143 = rK;
    let _e145 = Rk;
    let _e146 = rK;
    muK = max(_e139, (-(sqrt(max(0f, (1f - ((_e142 / _e143) * (_e145 / _e146)))))) + 0.0001f));
    let _e158 = rK;
    let _e160 = muK;
    let _e162 = rK;
    let _e163 = rK;
    let _e165 = muK;
    let _e166 = muK;
    let _e171 = topK;
    let _e172 = topK;
    len = max(0f, ((-(_e158) * _e160) + sqrt(max((((_e162 * _e163) * ((_e165 * _e166) - 1f)) + (_e171 * _e172)), 0f))));
    loop {
        let _e188 = i;
        let _e189 = N;
        if !((_e188 < _e189)) {
            break;
        }
        {
            let _e195 = i;
            let _e197 = N;
            u0_ = (f32(_e195) / f32(_e197));
            let _e201 = i;
            let _e205 = N;
            u1_ = (f32((_e201 + 1i)) / f32(_e205));
            let _e209 = len;
            let _e210 = u0_;
            let _e211 = u0_;
            let _e213 = u1_;
            let _e214 = u1_;
            t = ((_e209 * ((_e210 * _e211) + (_e213 * _e214))) * 0.5f);
            let _e221 = len;
            let _e222 = u1_;
            let _e223 = u1_;
            let _e225 = u0_;
            let _e226 = u0_;
            dt = (_e221 * ((_e222 * _e223) - (_e225 * _e226)));
            let _e231 = rK;
            let _e232 = rK;
            let _e234 = t;
            let _e235 = t;
            let _e239 = rK;
            let _e241 = muK;
            let _e243 = t;
            rr = sqrt((((_e231 * _e232) + (_e234 * _e235)) + (((2f * _e239) * _e241) * _e243)));
            let _e251 = rr;
            let _e252 = Rk;
            mediumAtReal((_e251 - _e252), (&sR), (&sM), (&e));
            let _e260 = od;
            let _e261 = e;
            let _e262 = dt;
            od = (_e260 + (_e261 * _e262));
        }
        continuing {
            let _e192 = i;
            i = (_e192 + 1i);
        }
    }
    let _e265 = od;
    let _e267 = exp(-(_e265));
    fragmentColor = vec4<f32>(_e267.x, _e267.y, _e267.z, 1f);
    return;
}

@fragment 
fn main(@location(0) vUv: vec2<f32>) -> FragmentOutput {
    vUv_1 = vUv;
    main_1();
    let _e60 = fragmentColor;
    return FragmentOutput(_e60);
}
`;
