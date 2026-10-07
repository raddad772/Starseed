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
    let _e51 = r_5;
    let _e52 = global.uRadius;
    h = (_e51 - _e52);
    let _e55 = h;
    let _e56 = global.uKnee;
    if (_e55 <= _e56) {
        let _e58 = h;
        local_1 = _e58;
    } else {
        let _e59 = global.uKnee;
        let _e60 = h;
        let _e61 = global.uKnee;
        let _e63 = global.uUpper;
        local_1 = (_e59 + ((_e60 - _e61) / _e63));
    }
    let _e67 = local_1;
    hr = _e67;
    let _e69 = hr;
    let _e71 = global.uRayleighH;
    dR = exp((-(_e69) / _e71));
    let _e75 = hr;
    let _e77 = global.uMieH;
    dM = exp((-(_e75) / _e77));
    let _e81 = global.uAbsExp;
    if (_e81 > 0.5f) {
        let _e84 = dR;
        local_2 = _e84;
    } else {
        let _e87 = h;
        let _e88 = global.uAbsCenter;
        let _e91 = global.uAbsWidth;
        local_2 = max(0f, (1f - (abs((_e87 - _e88)) / max(_e91, 1f))));
    }
    let _e98 = local_2;
    dA = _e98;
    let _e100 = global.uHaze;
    let _e102 = gHazeK;
    let _e104 = h;
    let _e108 = global.uHaze;
    let _e115 = global.uHazeCol;
    dH = (((_e100.x * _e102) * exp((-(max(_e104, 0f)) / max(_e108.y, 1f)))) * _e115);
    let _e118 = global.uRayleigh;
    let _e119 = dR;
    (*scatR) = (_e118 * _e119);
    let _e121 = global.uMie;
    let _e122 = dM;
    let _e124 = dH;
    (*scatM) = ((_e121 * _e122) + _e124);
    let _e126 = (*scatR);
    let _e127 = (*scatM);
    let _e129 = global.uMieAbs;
    let _e130 = dM;
    let _e133 = global.uAbs;
    let _e134 = dA;
    let _e137 = dH;
    let _e138 = global.uHaze;
    (*ext) = ((((_e126 + _e127) + (_e129 * _e130)) + (_e133 * _e134)) + (_e137 * _e138.z));
    return;
}

fn realH(h_1: f32) -> f32 {
    var h_2: f32;
    var local_3: f32;

    h_2 = h_1;
    let _e48 = h_2;
    let _e49 = global.uKnee;
    if (_e48 <= _e49) {
        let _e51 = h_2;
        local_3 = _e51;
    } else {
        let _e52 = global.uKnee;
        let _e53 = h_2;
        let _e54 = global.uKnee;
        let _e56 = global.uUpper;
        local_3 = (_e52 + ((_e53 - _e54) / _e56));
    }
    let _e60 = local_3;
    return _e60;
}

fn drawnH(hr_1: f32) -> f32 {
    var hr_2: f32;
    var local_4: f32;

    hr_2 = hr_1;
    let _e48 = hr_2;
    let _e49 = global.uKnee;
    if (_e48 <= _e49) {
        let _e51 = hr_2;
        local_4 = _e51;
    } else {
        let _e52 = global.uKnee;
        let _e53 = hr_2;
        let _e54 = global.uKnee;
        let _e56 = global.uUpper;
        local_4 = (_e52 + ((_e53 - _e54) * _e56));
    }
    let _e60 = local_4;
    return _e60;
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
    let _e51 = hr_4;
    let _e52 = drawnH(_e51);
    h_3 = _e52;
    let _e54 = hr_4;
    let _e56 = global.uRayleighH;
    dR_1 = exp((-(_e54) / _e56));
    let _e60 = hr_4;
    let _e62 = global.uMieH;
    dM_1 = exp((-(_e60) / _e62));
    let _e66 = global.uAbsExp;
    if (_e66 > 0.5f) {
        let _e69 = dR_1;
        local_5 = _e69;
    } else {
        let _e72 = h_3;
        let _e73 = global.uAbsCenter;
        let _e76 = global.uAbsWidth;
        local_5 = max(0f, (1f - (abs((_e72 - _e73)) / max(_e76, 1f))));
    }
    let _e83 = local_5;
    dA_1 = _e83;
    let _e85 = global.uHaze;
    let _e87 = gHazeK;
    let _e89 = hr_4;
    let _e93 = global.uHaze;
    let _e100 = global.uHazeCol;
    dH_1 = (((_e85.x * _e87) * exp((-(max(_e89, 0f)) / max(_e93.y, 1f)))) * _e100);
    let _e103 = global.uRayleigh;
    let _e104 = dR_1;
    (*scatR_1) = (_e103 * _e104);
    let _e106 = global.uMie;
    let _e107 = dM_1;
    let _e109 = dH_1;
    (*scatM_1) = ((_e106 * _e107) + _e109);
    let _e111 = (*scatR_1);
    let _e112 = (*scatM_1);
    let _e114 = global.uMieAbs;
    let _e115 = dM_1;
    let _e118 = global.uAbs;
    let _e119 = dA_1;
    let _e122 = dH_1;
    let _e123 = global.uHaze;
    (*ext_1) = ((((_e111 + _e112) + (_e114 * _e115)) + (_e118 * _e119)) + (_e122 * _e123.z));
    return;
}

fn phaseRayleigh(c: f32) -> f32 {
    var c_1: f32;

    c_1 = c;
    let _e54 = c_1;
    let _e55 = c_1;
    return (0.059683103f * (1f + (_e54 * _e55)));
}

fn phaseCS(c_2: f32, g: f32) -> f32 {
    var c_3: f32;
    var g_1: f32;
    var g2_: f32;

    c_3 = c_2;
    g_1 = g;
    let _e50 = g_1;
    let _e51 = g_1;
    g2_ = (_e50 * _e51);
    let _e60 = g2_;
    let _e63 = c_3;
    let _e64 = c_3;
    let _e70 = g2_;
    let _e73 = g2_;
    let _e76 = g_1;
    let _e78 = c_3;
    return ((0.119366206f * ((1f - _e60) * (1f + (_e63 * _e64)))) / ((2f + _e70) * pow(max(((1f + _e73) - ((2f * _e76) * _e78)), 0.0001f), 1.5f)));
}

fn phaseHG(c_4: f32, g_2: f32) -> f32 {
    var c_5: f32;
    var g_3: f32;

    c_5 = c_4;
    g_3 = g_2;
    let _e51 = g_3;
    let _e52 = g_3;
    let _e59 = g_3;
    let _e60 = g_3;
    let _e64 = g_3;
    let _e66 = c_5;
    return ((1f - (_e51 * _e52)) / (12.566371f * pow(max(((1f + (_e59 * _e60)) - ((2f * _e64) * _e66)), 0.000001f), 1.5f)));
}

fn phaseMie(c_6: f32) -> vec3<f32> {
    var c_7: f32;

    c_7 = c_6;
    let _e48 = c_7;
    let _e49 = global.uMieG;
    let _e51 = phaseCS(_e48, _e49.x);
    let _e52 = c_7;
    let _e53 = global.uMieG;
    let _e55 = phaseCS(_e52, _e53.y);
    let _e56 = c_7;
    let _e57 = global.uMieG;
    let _e59 = phaseCS(_e56, _e57.z);
    let _e61 = c_7;
    let _e62 = global.uMieGL;
    let _e64 = phaseHG(_e61, _e62.x);
    let _e65 = c_7;
    let _e66 = global.uMieGL;
    let _e68 = phaseHG(_e65, _e66.y);
    let _e69 = c_7;
    let _e70 = global.uMieGL;
    let _e72 = phaseHG(_e69, _e70.z);
    let _e74 = global.uMieF;
    return mix(vec3<f32>(_e51, _e55, _e59), vec3<f32>(_e64, _e68, _e72), _e74);
}

fn distToTop(r_6: f32, mu_4: f32) -> f32 {
    var r_7: f32;
    var mu_5: f32;
    var disc_1: f32;

    r_7 = r_6;
    mu_5 = mu_4;
    let _e50 = r_7;
    let _e51 = r_7;
    let _e53 = mu_5;
    let _e54 = mu_5;
    let _e59 = global.uTop;
    let _e60 = global.uTop;
    disc_1 = (((_e50 * _e51) * ((_e53 * _e54) - 1f)) + (_e59 * _e60));
    let _e65 = r_7;
    let _e67 = mu_5;
    let _e69 = disc_1;
    return max(0f, ((-(_e65) * _e67) + sqrt(max(_e69, 0f))));
}

fn hitsGround(r_8: f32, mu_6: f32, gr: f32) -> bool {
    var r_9: f32;
    var mu_7: f32;
    var gr_1: f32;

    r_9 = r_8;
    mu_7 = mu_6;
    gr_1 = gr;
    let _e52 = mu_7;
    let _e55 = r_9;
    let _e56 = r_9;
    let _e58 = mu_7;
    let _e59 = mu_7;
    let _e64 = gr_1;
    let _e65 = gr_1;
    return ((_e52 < 0f) && ((((_e55 * _e56) * ((_e58 * _e59) - 1f)) + (_e64 * _e65)) >= 0f));
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
    let _e48 = global.uTop;
    let _e49 = global.uTop;
    let _e51 = global.uBottom;
    let _e52 = global.uBottom;
    H_1 = sqrt(((_e48 * _e49) - (_e51 * _e52)));
    let _e57 = H_1;
    let _e58 = vUv_1;
    rho_1 = (_e57 * _e58.y);
    let _e62 = rho_1;
    let _e63 = rho_1;
    let _e65 = global.uBottom;
    let _e66 = global.uBottom;
    r_10 = sqrt(((_e62 * _e63) + (_e65 * _e66)));
    let _e71 = global.uTop;
    let _e72 = r_10;
    dMin_1 = (_e71 - _e72);
    let _e75 = rho_1;
    let _e76 = H_1;
    dMax_1 = (_e75 + _e76);
    let _e79 = dMin_1;
    let _e80 = vUv_1;
    let _e82 = dMax_1;
    let _e83 = dMin_1;
    d_1 = (_e79 + (_e80.x * (_e82 - _e83)));
    let _e88 = d_1;
    if (_e88 < 0.001f) {
        local_6 = 1f;
    } else {
        let _e92 = H_1;
        let _e93 = H_1;
        let _e95 = rho_1;
        let _e96 = rho_1;
        let _e99 = d_1;
        let _e100 = d_1;
        let _e104 = r_10;
        let _e106 = d_1;
        local_6 = clamp(((((_e92 * _e93) - (_e95 * _e96)) - (_e99 * _e100)) / ((2f * _e104) * _e106)), -1f, 1f);
    }
    let _e114 = local_6;
    mu_8 = _e114;
    let _e116 = global.uTrueK;
    K = max(_e116, 1f);
    let _e120 = global.uRadius;
    let _e121 = K;
    Rk = (_e120 * _e121);
    let _e124 = Rk;
    let _e125 = r_10;
    let _e126 = global.uRadius;
    let _e128 = realH((_e125 - _e126));
    rK = (_e124 + _e128);
    let _e131 = Rk;
    let _e132 = global.uTop;
    let _e133 = global.uRadius;
    let _e135 = realH((_e132 - _e133));
    topK = (_e131 + _e135);
    let _e138 = mu_8;
    let _e141 = Rk;
    let _e142 = rK;
    let _e144 = Rk;
    let _e145 = rK;
    muK = max(_e138, (-(sqrt(max(0f, (1f - ((_e141 / _e142) * (_e144 / _e145)))))) + 0.0001f));
    let _e157 = rK;
    let _e159 = muK;
    let _e161 = rK;
    let _e162 = rK;
    let _e164 = muK;
    let _e165 = muK;
    let _e170 = topK;
    let _e171 = topK;
    len = max(0f, ((-(_e157) * _e159) + sqrt(max((((_e161 * _e162) * ((_e164 * _e165) - 1f)) + (_e170 * _e171)), 0f))));
    loop {
        let _e187 = i;
        let _e188 = N;
        if !((_e187 < _e188)) {
            break;
        }
        {
            let _e194 = i;
            let _e196 = N;
            u0_ = (f32(_e194) / f32(_e196));
            let _e200 = i;
            let _e204 = N;
            u1_ = (f32((_e200 + 1i)) / f32(_e204));
            let _e208 = len;
            let _e209 = u0_;
            let _e210 = u0_;
            let _e212 = u1_;
            let _e213 = u1_;
            t = ((_e208 * ((_e209 * _e210) + (_e212 * _e213))) * 0.5f);
            let _e220 = len;
            let _e221 = u1_;
            let _e222 = u1_;
            let _e224 = u0_;
            let _e225 = u0_;
            dt = (_e220 * ((_e221 * _e222) - (_e224 * _e225)));
            let _e230 = rK;
            let _e231 = rK;
            let _e233 = t;
            let _e234 = t;
            let _e238 = rK;
            let _e240 = muK;
            let _e242 = t;
            rr = sqrt((((_e230 * _e231) + (_e233 * _e234)) + (((2f * _e238) * _e240) * _e242)));
            let _e250 = rr;
            let _e251 = Rk;
            mediumAtReal((_e250 - _e251), (&sR), (&sM), (&e));
            let _e259 = od;
            let _e260 = e;
            let _e261 = dt;
            od = (_e259 + (_e260 * _e261));
        }
        continuing {
            let _e191 = i;
            i = (_e191 + 1i);
        }
    }
    let _e264 = od;
    let _e266 = exp(-(_e264));
    fragmentColor = vec4<f32>(_e266.x, _e266.y, _e266.z, 1f);
    return;
}

@fragment 
fn main(@location(0) vUv: vec2<f32>) -> FragmentOutput {
    vUv_1 = vUv;
    main_1();
    let _e57 = fragmentColor;
    return FragmentOutput(_e57);
}
`;
