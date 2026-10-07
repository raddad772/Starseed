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
    let _e57 = r_5;
    let _e58 = global.uRadius;
    h = (_e57 - _e58);
    let _e61 = h;
    let _e62 = global.uKnee;
    if (_e61 <= _e62) {
        let _e64 = h;
        local_1 = _e64;
    } else {
        let _e65 = global.uKnee;
        let _e66 = h;
        let _e67 = global.uKnee;
        let _e69 = global.uUpper;
        local_1 = (_e65 + ((_e66 - _e67) / _e69));
    }
    let _e73 = local_1;
    hr = _e73;
    let _e75 = hr;
    let _e77 = global.uRayleighH;
    dR = exp((-(_e75) / _e77));
    let _e81 = hr;
    let _e83 = global.uMieH;
    dM = exp((-(_e81) / _e83));
    let _e87 = global.uAbsExp;
    if (_e87 > 0.5f) {
        let _e90 = dR;
        local_2 = _e90;
    } else {
        let _e93 = h;
        let _e94 = global.uAbsCenter;
        let _e97 = global.uAbsWidth;
        local_2 = max(0f, (1f - (abs((_e93 - _e94)) / max(_e97, 1f))));
    }
    let _e104 = local_2;
    dA = _e104;
    let _e106 = global.uHaze;
    let _e108 = gHazeK;
    let _e110 = h;
    let _e114 = global.uHaze;
    let _e121 = global.uHazeCol;
    dH = (((_e106.x * _e108) * exp((-(max(_e110, 0f)) / max(_e114.y, 1f)))) * _e121);
    let _e124 = global.uRayleigh;
    let _e125 = dR;
    (*scatR) = (_e124 * _e125);
    let _e127 = global.uMie;
    let _e128 = dM;
    let _e130 = dH;
    (*scatM) = ((_e127 * _e128) + _e130);
    let _e132 = (*scatR);
    let _e133 = (*scatM);
    let _e135 = global.uMieAbs;
    let _e136 = dM;
    let _e139 = global.uAbs;
    let _e140 = dA;
    let _e143 = dH;
    let _e144 = global.uHaze;
    (*ext) = ((((_e132 + _e133) + (_e135 * _e136)) + (_e139 * _e140)) + (_e143 * _e144.z));
    return;
}

fn realH(h_1: f32) -> f32 {
    var h_2: f32;
    var local_3: f32;

    h_2 = h_1;
    let _e54 = h_2;
    let _e55 = global.uKnee;
    if (_e54 <= _e55) {
        let _e57 = h_2;
        local_3 = _e57;
    } else {
        let _e58 = global.uKnee;
        let _e59 = h_2;
        let _e60 = global.uKnee;
        let _e62 = global.uUpper;
        local_3 = (_e58 + ((_e59 - _e60) / _e62));
    }
    let _e66 = local_3;
    return _e66;
}

fn drawnH(hr_1: f32) -> f32 {
    var hr_2: f32;
    var local_4: f32;

    hr_2 = hr_1;
    let _e54 = hr_2;
    let _e55 = global.uKnee;
    if (_e54 <= _e55) {
        let _e57 = hr_2;
        local_4 = _e57;
    } else {
        let _e58 = global.uKnee;
        let _e59 = hr_2;
        let _e60 = global.uKnee;
        let _e62 = global.uUpper;
        local_4 = (_e58 + ((_e59 - _e60) * _e62));
    }
    let _e66 = local_4;
    return _e66;
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
    let _e57 = hr_4;
    let _e58 = drawnH(_e57);
    h_3 = _e58;
    let _e60 = hr_4;
    let _e62 = global.uRayleighH;
    dR_1 = exp((-(_e60) / _e62));
    let _e66 = hr_4;
    let _e68 = global.uMieH;
    dM_1 = exp((-(_e66) / _e68));
    let _e72 = global.uAbsExp;
    if (_e72 > 0.5f) {
        let _e75 = dR_1;
        local_5 = _e75;
    } else {
        let _e78 = h_3;
        let _e79 = global.uAbsCenter;
        let _e82 = global.uAbsWidth;
        local_5 = max(0f, (1f - (abs((_e78 - _e79)) / max(_e82, 1f))));
    }
    let _e89 = local_5;
    dA_1 = _e89;
    let _e91 = global.uHaze;
    let _e93 = gHazeK;
    let _e95 = hr_4;
    let _e99 = global.uHaze;
    let _e106 = global.uHazeCol;
    dH_1 = (((_e91.x * _e93) * exp((-(max(_e95, 0f)) / max(_e99.y, 1f)))) * _e106);
    let _e109 = global.uRayleigh;
    let _e110 = dR_1;
    (*scatR_1) = (_e109 * _e110);
    let _e112 = global.uMie;
    let _e113 = dM_1;
    let _e115 = dH_1;
    (*scatM_1) = ((_e112 * _e113) + _e115);
    let _e117 = (*scatR_1);
    let _e118 = (*scatM_1);
    let _e120 = global.uMieAbs;
    let _e121 = dM_1;
    let _e124 = global.uAbs;
    let _e125 = dA_1;
    let _e128 = dH_1;
    let _e129 = global.uHaze;
    (*ext_1) = ((((_e117 + _e118) + (_e120 * _e121)) + (_e124 * _e125)) + (_e128 * _e129.z));
    return;
}

fn phaseRayleigh(c: f32) -> f32 {
    var c_1: f32;

    c_1 = c;
    let _e60 = c_1;
    let _e61 = c_1;
    return (0.059683103f * (1f + (_e60 * _e61)));
}

fn phaseCS(c_2: f32, g: f32) -> f32 {
    var c_3: f32;
    var g_1: f32;
    var g2_: f32;

    c_3 = c_2;
    g_1 = g;
    let _e56 = g_1;
    let _e57 = g_1;
    g2_ = (_e56 * _e57);
    let _e66 = g2_;
    let _e69 = c_3;
    let _e70 = c_3;
    let _e76 = g2_;
    let _e79 = g2_;
    let _e82 = g_1;
    let _e84 = c_3;
    return ((0.119366206f * ((1f - _e66) * (1f + (_e69 * _e70)))) / ((2f + _e76) * pow(max(((1f + _e79) - ((2f * _e82) * _e84)), 0.0001f), 1.5f)));
}

fn phaseHG(c_4: f32, g_2: f32) -> f32 {
    var c_5: f32;
    var g_3: f32;

    c_5 = c_4;
    g_3 = g_2;
    let _e57 = g_3;
    let _e58 = g_3;
    let _e65 = g_3;
    let _e66 = g_3;
    let _e70 = g_3;
    let _e72 = c_5;
    return ((1f - (_e57 * _e58)) / (12.566371f * pow(max(((1f + (_e65 * _e66)) - ((2f * _e70) * _e72)), 0.000001f), 1.5f)));
}

fn phaseMie(c_6: f32) -> vec3<f32> {
    var c_7: f32;

    c_7 = c_6;
    let _e54 = c_7;
    let _e55 = global.uMieG;
    let _e57 = phaseCS(_e54, _e55.x);
    let _e58 = c_7;
    let _e59 = global.uMieG;
    let _e61 = phaseCS(_e58, _e59.y);
    let _e62 = c_7;
    let _e63 = global.uMieG;
    let _e65 = phaseCS(_e62, _e63.z);
    let _e67 = c_7;
    let _e68 = global.uMieGL;
    let _e70 = phaseHG(_e67, _e68.x);
    let _e71 = c_7;
    let _e72 = global.uMieGL;
    let _e74 = phaseHG(_e71, _e72.y);
    let _e75 = c_7;
    let _e76 = global.uMieGL;
    let _e78 = phaseHG(_e75, _e76.z);
    let _e80 = global.uMieF;
    return mix(vec3<f32>(_e57, _e61, _e65), vec3<f32>(_e70, _e74, _e78), _e80);
}

fn distToTop(r_6: f32, mu_4: f32) -> f32 {
    var r_7: f32;
    var mu_5: f32;
    var disc_1: f32;

    r_7 = r_6;
    mu_5 = mu_4;
    let _e56 = r_7;
    let _e57 = r_7;
    let _e59 = mu_5;
    let _e60 = mu_5;
    let _e65 = global.uTop;
    let _e66 = global.uTop;
    disc_1 = (((_e56 * _e57) * ((_e59 * _e60) - 1f)) + (_e65 * _e66));
    let _e71 = r_7;
    let _e73 = mu_5;
    let _e75 = disc_1;
    return max(0f, ((-(_e71) * _e73) + sqrt(max(_e75, 0f))));
}

fn hitsGround(r_8: f32, mu_6: f32, gr: f32) -> bool {
    var r_9: f32;
    var mu_7: f32;
    var gr_1: f32;

    r_9 = r_8;
    mu_7 = mu_6;
    gr_1 = gr;
    let _e58 = mu_7;
    let _e61 = r_9;
    let _e62 = r_9;
    let _e64 = mu_7;
    let _e65 = mu_7;
    let _e70 = gr_1;
    let _e71 = gr_1;
    return ((_e58 < 0f) && ((((_e61 * _e62) * ((_e64 * _e65) - 1f)) + (_e70 * _e71)) >= 0f));
}

fn transmittanceToTop(r_10: f32, mu_8: f32) -> vec3<f32> {
    var r_11: f32;
    var mu_9: f32;
    var uv: vec2<f32>;

    r_11 = r_10;
    mu_9 = mu_8;
    let _e56 = r_11;
    let _e57 = global.uBottom;
    let _e58 = global.uTop;
    let _e60 = mu_9;
    let _e61 = transmittanceUV(clamp(_e56, _e57, _e58), _e60);
    uv = _e61;
    let _e70 = uv;
    uv = (vec2<f32>(0.001953125f, 0.0078125f) + (_e70 * vec2<f32>(0.99609375f, 0.984375f)));
    let _e80 = uv;
    let _e82 = textureSampleLevel(tTransTexture, tTransSampler, _e80, 0f);
    return _e82.xyz;
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
    let _e56 = mu_11;
    let _e57 = liftMu(_e56);
    mu_11 = _e57;
    let _e58 = global.uGround;
    let _e59 = global.uTrueK;
    Rg = (_e58 * max(_e59, 1f));
    let _e64 = Rg;
    let _e65 = Rg;
    let _e66 = r_13;
    let _e67 = global.uGround;
    sinH = (_e64 / (_e65 + max((_e66 - _e67), 0f)));
    let _e76 = sinH;
    let _e77 = sinH;
    cosH = -(sqrt(max(0f, (1f - (_e76 * _e77)))));
    let _e84 = cosH;
    let _e87 = cosH;
    let _e90 = mu_11;
    vis = smoothstep((_e84 - 0.004f), (_e87 + 0.004f), _e90);
    let _e93 = r_13;
    let _e94 = mu_11;
    let _e95 = transmittanceToTop(_e93, _e94);
    let _e96 = vis;
    return (_e95 * _e96);
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
    let _e58 = global.uRadius;
    let _e59 = rK_1;
    let _e60 = Rk_1;
    let _e62 = drawnH((_e59 - _e60));
    rD = (_e58 + _e62);
    let _e65 = Rk_1;
    let _e66 = global.uGround;
    let _e67 = global.uRadius;
    let _e69 = realH((_e66 - _e67));
    gK = (_e65 + _e69);
    let _e72 = gK;
    let _e73 = rK_1;
    let _e74 = gK;
    sinH_1 = (_e72 / max(_e73, _e74));
    let _e80 = sinH_1;
    let _e81 = sinH_1;
    cosH_1 = -(sqrt(max(0f, (1f - (_e80 * _e81)))));
    let _e88 = rD;
    let _e89 = global.uBottom;
    let _e90 = global.uTop;
    let _e92 = mu_13;
    let _e93 = transmittanceToTop(clamp(_e88, _e89, _e90), _e92);
    let _e94 = cosH_1;
    let _e97 = cosH_1;
    let _e100 = mu_13;
    return (_e93 * smoothstep((_e94 - 0.004f), (_e97 + 0.004f), _e100));
}

fn mieAsym() -> vec3<f32> {
    var g_4: vec3<f32>;
    var g2_1: vec3<f32>;
    var csm: vec3<f32>;

    let _e53 = global.uMieG;
    g_4 = _e53;
    let _e55 = g_4;
    let _e56 = g_4;
    g2_1 = (_e55 * _e56);
    let _e60 = g_4;
    let _e63 = g2_1;
    let _e69 = g2_1;
    csm = (((3f * _e60) * (vec3(4f) + _e63)) / (5f * (vec3(2f) + _e69)));
    let _e75 = csm;
    let _e76 = global.uMieGL;
    let _e77 = global.uMieF;
    return mix(_e75, _e76, _e77);
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
    let _e70 = i_1;
    a0_ = (f32(_e70) / 64f);
    let _e76 = i_1;
    a1_ = (f32((_e76 + 1i)) / 64f);
    let _e84 = hG_1;
    let _e85 = hT_2;
    let _e86 = hG_1;
    let _e88 = a0_;
    let _e90 = a0_;
    h0_ = (_e84 + (((_e85 - _e86) * _e88) * _e90));
    let _e94 = hG_1;
    let _e95 = hT_2;
    let _e96 = hG_1;
    let _e98 = a1_;
    let _e100 = a1_;
    h1_ = (_e94 + (((_e95 - _e96) * _e98) * _e100));
    let _e105 = h0_;
    let _e106 = h1_;
    hm = (0.5f * (_e105 + _e106));
    let _e113 = hm;
    mediumAtReal(_e113, (&sR), (&sM), (&e));
    let _e120 = sR;
    let _e121 = sM;
    sc = (_e120 + _e121);
    let _e124 = e;
    let _e125 = h1_;
    let _e126 = h0_;
    tau = (_e124 * (_e125 - _e126));
    let _e130 = sc;
    let _e131 = e;
    w = (_e130 / max(_e131, vec3(0.00000000000000000001f)));
    let _e137 = sM;
    let _e138 = gM_1;
    let _e140 = sc;
    g_5 = ((_e137 * _e138) / max(_e140, vec3(0.00000000000000000001f)));
    let _e146 = g_5;
    let _e147 = g_5;
    f = (_e146 * _e147);
    let _e150 = tau;
    let _e152 = w;
    let _e153 = f;
    tauP = (_e150 * (vec3(1f) - (_e152 * _e153)));
    let _e159 = w;
    let _e161 = f;
    let _e166 = w;
    let _e167 = f;
    wP = ((_e159 * (vec3(1f) - _e161)) / max((vec3(1f) - (_e166 * _e167)), vec3(0.000001f)));
    let _e176 = g_5;
    let _e177 = f;
    let _e180 = f;
    gP = ((_e176 - _e177) / max((vec3(1f) - _e180), vec3(0.000001f)));
    let _e189 = wP;
    let _e191 = gP;
    g1_ = (vec3(2f) - (_e189 * (vec3(1f) + _e191)));
    let _e198 = wP;
    let _e200 = gP;
    g2_2 = (_e198 * (vec3(1f) - _e200));
    let _e205 = g1_;
    let _e206 = g1_;
    let _e208 = g2_2;
    let _e209 = g2_2;
    k_2 = sqrt(max(((_e205 * _e206) - (_e208 * _e209)), vec3(0f)));
    let _e217 = k_2;
    let _e218 = tauP;
    kt = min((_e217 * _e218), vec3(30f));
    let _e224 = kt;
    ep = exp(_e224);
    let _e227 = kt;
    em = exp(-(_e227));
    let _e231 = tauP;
    let _e233 = kt;
    let _e234 = kt;
    let _e242 = ep;
    let _e243 = em;
    let _e246 = k_2;
    let _e254 = kt;
    sh = mix((_e231 * (vec3(1f) + ((_e233 * _e234) / vec3(6f)))), ((_e242 - _e243) / (2f * max(_e246, vec3(0.000000001f)))), step(vec3(0.001f), _e254));
    let _e259 = ep;
    let _e260 = em;
    let _e263 = g1_;
    let _e264 = sh;
    den = ((0.5f * (_e259 + _e260)) + (_e263 * _e264));
    let _e268 = g2_2;
    let _e269 = sh;
    let _e271 = den;
    (*R) = ((_e268 * _e269) / _e271);
    let _e274 = den;
    (*T) = (vec3(1f) / _e274);
    let _e277 = Rk_3;
    let _e278 = hm;
    let _e280 = Rk_3;
    let _e281 = muS_1;
    let _e282 = sunAtTrue((_e277 + _e278), _e280, _e281);
    let _e283 = w;
    let _e285 = tau;
    let _e288 = f;
    S = (((_e282 * _e283) * _e285) * (vec3(1f) - _e288));
    let _e295 = gP;
    let _e297 = muS_1;
    up = clamp((vec3(0.5f) - ((0.75f * _e295) * _e297)), vec3(0f), vec3(1f));
    let _e307 = S;
    let _e308 = up;
    (*Su) = (_e307 * _e308);
    let _e310 = S;
    let _e312 = up;
    (*Sd) = (_e310 * (vec3(1f) - _e312));
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
    let _e55 = vUv_1;
    muS_2 = ((_e55.x * 2f) - 1f);
    let _e62 = global.uBottom;
    let _e63 = global.uTop;
    let _e64 = global.uBottom;
    let _e66 = vUv_1;
    r_14 = (_e62 + ((_e63 - _e64) * clamp(_e66.y, 0.002f, 0.998f)));
    let _e74 = global.uTrueK;
    K = max(_e74, 1f);
    let _e78 = global.uRadius;
    let _e79 = K;
    Rk_4 = (_e78 * _e79);
    let _e82 = global.uGround;
    let _e83 = global.uRadius;
    let _e85 = realH((_e82 - _e83));
    hG_2 = _e85;
    let _e87 = global.uTop;
    let _e88 = global.uRadius;
    let _e90 = realH((_e87 - _e88));
    hT_3 = _e90;
    let _e92 = r_14;
    let _e93 = global.uRadius;
    let _e95 = realH((_e92 - _e93));
    let _e96 = hG_2;
    hP = max(_e95, _e96);
    let _e99 = hP;
    let _e100 = hG_2;
    let _e102 = hT_3;
    let _e103 = hG_2;
    jP = i32(floor(((sqrt(clamp(((_e99 - _e100) / max((_e102 - _e103), 1f)), 0f, 1f)) * 64f) + 0.5f)));
    let _e120 = mieAsym();
    gM_2 = _e120;
    let _e126 = global.uGroundAlbedo;
    Rb = _e126;
    let _e128 = global.uGroundAlbedo;
    let _e129 = Rk_4;
    let _e130 = hG_2;
    let _e132 = Rk_4;
    let _e133 = muS_2;
    let _e134 = sunAtTrue((_e129 + _e130), _e132, _e133);
    let _e136 = muS_2;
    U = ((_e128 * _e134) * max(_e136, 0f));
    loop {
        let _e143 = i_2;
        if !((_e143 < NL)) {
            break;
        }
        {
            let _e149 = i_2;
            let _e150 = jP;
            if (_e149 >= _e150) {
                break;
            }
            let _e152 = i_2;
            let _e153 = hG_2;
            let _e154 = hT_3;
            let _e155 = muS_2;
            let _e156 = Rk_4;
            let _e157 = gM_2;
            msLayer(_e152, _e153, _e154, _e155, _e156, _e157, (&R_1), (&T_1), (&Su_1), (&Sd_1));
            let _e168 = R_1;
            let _e169 = Rb;
            d_1 = (vec3(1f) / max((vec3(1f) - (_e168 * _e169)), vec3(0.000001f)));
            let _e179 = Su_1;
            let _e180 = T_1;
            let _e181 = U;
            let _e182 = Rb;
            let _e183 = Sd_1;
            let _e187 = d_1;
            U = (_e179 + ((_e180 * (_e181 + (_e182 * _e183))) * _e187));
            let _e190 = R_1;
            let _e191 = T_1;
            let _e192 = T_1;
            let _e194 = Rb;
            let _e196 = d_1;
            Rb = (_e190 + (((_e191 * _e192) * _e194) * _e196));
        }
        continuing {
            let _e146 = i_2;
            i_2 = (_e146 + 1i);
        }
    }
    loop {
        let _e207 = n;
        if !((_e207 < NL)) {
            break;
        }
        {
            let _e216 = n;
            i_3 = (63i - _e216);
            let _e219 = i_3;
            let _e220 = jP;
            if (_e219 < _e220) {
                break;
            }
            let _e222 = i_3;
            let _e223 = hG_2;
            let _e224 = hT_3;
            let _e225 = muS_2;
            let _e226 = Rk_4;
            let _e227 = gM_2;
            msLayer(_e222, _e223, _e224, _e225, _e226, _e227, (&R_1), (&T_1), (&Su_1), (&Sd_1));
            let _e238 = R_1;
            let _e239 = Ra;
            d_2 = (vec3(1f) / max((vec3(1f) - (_e238 * _e239)), vec3(0.000001f)));
            let _e249 = Sd_1;
            let _e250 = T_1;
            let _e251 = D;
            let _e252 = Ra;
            let _e253 = Su_1;
            let _e257 = d_2;
            D = (_e249 + ((_e250 * (_e251 + (_e252 * _e253))) * _e257));
            let _e260 = R_1;
            let _e261 = T_1;
            let _e262 = T_1;
            let _e264 = Ra;
            let _e266 = d_2;
            Ra = (_e260 + (((_e261 * _e262) * _e264) * _e266));
        }
        continuing {
            let _e210 = n;
            n = (_e210 + 1i);
        }
    }
    let _e269 = D;
    let _e270 = Ra;
    let _e271 = U;
    let _e275 = Ra;
    let _e276 = Rb;
    Fd = ((_e269 + (_e270 * _e271)) / max((vec3(1f) - (_e275 * _e276)), vec3(0.000001f)));
    let _e285 = U;
    let _e286 = Rb;
    let _e287 = Fd;
    Fu = (_e285 + (_e286 * _e287));
    let _e291 = Fu;
    let _e292 = Fd;
    let _e298 = ((_e291 + _e292) / vec3(6.2831855f));
    fragmentColor = vec4<f32>(_e298.x, _e298.y, _e298.z, 1f);
    return;
}

@fragment 
fn main(@location(0) vUv: vec2<f32>) -> FragmentOutput {
    vUv_1 = vUv;
    main_1();
    let _e67 = fragmentColor;
    return FragmentOutput(_e67);
}
`;
