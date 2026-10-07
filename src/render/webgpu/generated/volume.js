// Generated offline from the existing renderer equations. See tools/shaders/.
export const layout = {
  "uniforms": [
    {
      "name": "uDepthMode",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 0
    },
    {
      "name": "uNear",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 4
    },
    {
      "name": "uFar",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 8
    },
    {
      "name": "uLogDepthFC",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 12
    },
    {
      "name": "uBottom",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 16
    },
    {
      "name": "uTop",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 20
    },
    {
      "name": "uRadius",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 24
    },
    {
      "name": "uRayleigh",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 32
    },
    {
      "name": "uRayleighH",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 44
    },
    {
      "name": "uMie",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 48
    },
    {
      "name": "uMieAbs",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 64
    },
    {
      "name": "uMieH",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 76
    },
    {
      "name": "uMieG",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 80
    },
    {
      "name": "uMieF",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 96
    },
    {
      "name": "uMieGL",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 112
    },
    {
      "name": "uAbs",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 128
    },
    {
      "name": "uAbsCenter",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 140
    },
    {
      "name": "uAbsWidth",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 144
    },
    {
      "name": "uAbsExp",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 148
    },
    {
      "name": "uHaze",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 160
    },
    {
      "name": "uHazeCol",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 176
    },
    {
      "name": "uKnee",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 188
    },
    {
      "name": "uUpper",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 192
    },
    {
      "name": "uTrueK",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 196
    },
    {
      "name": "uSunLift",
      "type": "vec2",
      "count": 0,
      "align": 8,
      "size": 8,
      "stride": 8,
      "offset": 200
    },
    {
      "name": "uGround",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 208
    },
    {
      "name": "uCloudMapMean",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 212
    },
    {
      "name": "uCenter",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 224
    },
    {
      "name": "uSunDir",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 240
    },
    {
      "name": "uSunE",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 256
    },
    {
      "name": "uMoonDir",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 272
    },
    {
      "name": "uMoonE",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 288
    },
    {
      "name": "uCamRot",
      "type": "mat3",
      "count": 0,
      "align": 16,
      "size": 48,
      "stride": 48,
      "offset": 304
    },
    {
      "name": "uTanHalf",
      "type": "vec2",
      "count": 0,
      "align": 8,
      "size": 8,
      "stride": 8,
      "offset": 352
    },
    {
      "name": "uToFixed",
      "type": "mat3",
      "count": 0,
      "align": 16,
      "size": 48,
      "stride": 48,
      "offset": 368
    },
    {
      "name": "uTime",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 416
    },
    {
      "name": "uDeck",
      "type": "vec4",
      "count": 3,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 432
    },
    {
      "name": "uDeckCol",
      "type": "vec3",
      "count": 3,
      "align": 16,
      "size": 12,
      "stride": 16,
      "offset": 480
    },
    {
      "name": "uNumDecks",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 528
    },
    {
      "name": "uMode",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 532
    },
    {
      "name": "uSteps",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 536
    },
    {
      "name": "uMaxDist",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 540
    },
    {
      "name": "uSigma",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 544
    },
    {
      "name": "uFlash",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 560
    },
    {
      "name": "uBands",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 576
    },
    {
      "name": "uJetPhase",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 580
    },
    {
      "name": "uEqJet",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 584
    },
    {
      "name": "uWindMax",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 588
    },
    {
      "name": "uPal",
      "type": "vec3",
      "count": 6,
      "align": 16,
      "size": 12,
      "stride": 16,
      "offset": 592
    },
    {
      "name": "uFade",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 688
    },
    {
      "name": "uAurora",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 704
    },
    {
      "name": "uAuroraLo",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 720
    },
    {
      "name": "uAuroraHi",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 736
    },
    {
      "name": "uAirglowCol",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 752
    },
    {
      "name": "uMagAxis",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 768
    },
    {
      "name": "uThermal",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 784
    },
    {
      "name": "uHeightCube",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 800
    },
    {
      "name": "uShape",
      "type": "vec2",
      "count": 0,
      "align": 8,
      "size": 8,
      "stride": 8,
      "offset": 816
    },
    {
      "name": "uT1",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 824
    },
    {
      "name": "uLapse",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 828
    },
    {
      "name": "uGlow",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 832
    },
    {
      "name": "uSkyView",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 848
    },
    {
      "name": "uSkyUp",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 864
    },
    {
      "name": "uSkySunH",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 880
    },
    {
      "name": "uCloudYear",
      "type": "vec2",
      "count": 0,
      "align": 8,
      "size": 8,
      "stride": 8,
      "offset": 896
    },
    {
      "name": "uCloudClock",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 912
    },
    {
      "name": "uCloudWind",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 928
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
    },
    {
      "name": "tNoise",
      "type": "sampler3D",
      "count": 0,
      "binding": 5,
      "samplerBinding": 6
    },
    {
      "name": "tColor",
      "type": "sampler2D",
      "count": 0,
      "binding": 7,
      "samplerBinding": 8
    },
    {
      "name": "tDepth",
      "type": "sampler2D",
      "count": 0,
      "binding": 9,
      "samplerBinding": 10
    },
    {
      "name": "tCloudMap",
      "type": "sampler2D",
      "count": 0,
      "binding": 11,
      "samplerBinding": 12
    },
    {
      "name": "tHeightCube",
      "type": "sampler2DArray",
      "count": 0,
      "binding": 13,
      "samplerBinding": 14
    },
    {
      "name": "tSkyView",
      "type": "sampler2D",
      "count": 0,
      "binding": 15,
      "samplerBinding": 16
    }
  ],
  "bytes": 944,
  "group": 0
};
export const code = /* wgsl */`
struct Params {
    uDepthMode: f32,
    uNear: f32,
    uFar: f32,
    uLogDepthFC: f32,
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
    uCloudMapMean: f32,
    uCenter: vec3<f32>,
    uSunDir: vec3<f32>,
    uSunE: vec3<f32>,
    uMoonDir: vec3<f32>,
    uMoonE: vec3<f32>,
    uCamRot: mat3x3<f32>,
    uTanHalf: vec2<f32>,
    uToFixed: mat3x3<f32>,
    uTime: f32,
    uDeck: array<vec4<f32>, 3>,
    uDeckCol: array<vec3<f32>, 3>,
    uNumDecks: f32,
    uMode: f32,
    uSteps: f32,
    uMaxDist: f32,
    uSigma: f32,
    uFlash: vec4<f32>,
    uBands: f32,
    uJetPhase: f32,
    uEqJet: f32,
    uWindMax: f32,
    uPal: array<vec3<f32>, 6>,
    uFade: f32,
    uAurora: vec4<f32>,
    uAuroraLo: vec3<f32>,
    uAuroraHi: vec3<f32>,
    uAirglowCol: vec3<f32>,
    uMagAxis: vec3<f32>,
    uThermal: vec4<f32>,
    uHeightCube: vec4<f32>,
    uShape: vec2<f32>,
    uT1_: f32,
    uLapse: f32,
    uGlow: f32,
    uSkyView: vec4<f32>,
    uSkyUp: vec3<f32>,
    uSkySunH: vec3<f32>,
    uCloudYear: vec2<f32>,
    uCloudClock: vec4<f32>,
    uCloudWind: vec4<f32>,
}

struct FragmentOutput {
    @location(0) outL: vec4<f32>,
    @location(1) outT: vec4<f32>,
}

const PI_A: f32 = 3.1415927f;
const HC_N: array<vec3<f32>, 6> = array<vec3<f32>, 6>(vec3<f32>(1f, 0f, 0f), vec3<f32>(-1f, 0f, 0f), vec3<f32>(0f, 1f, 0f), vec3<f32>(0f, -1f, 0f), vec3<f32>(0f, 0f, 1f), vec3<f32>(0f, 0f, -1f));
const HC_U: array<vec3<f32>, 6> = array<vec3<f32>, 6>(vec3<f32>(0f, 0f, -1f), vec3<f32>(0f, 0f, 1f), vec3<f32>(1f, 0f, 0f), vec3<f32>(1f, 0f, 0f), vec3<f32>(1f, 0f, 0f), vec3<f32>(-1f, 0f, 0f));
const HC_V: array<vec3<f32>, 6> = array<vec3<f32>, 6>(vec3<f32>(0f, 1f, 0f), vec3<f32>(0f, 1f, 0f), vec3<f32>(0f, 0f, -1f), vec3<f32>(0f, 0f, 1f), vec3<f32>(0f, 1f, 0f), vec3<f32>(0f, 1f, 0f));

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
@group(0) @binding(5) 
var tNoiseTexture: texture_3d<f32>;
@group(0) @binding(6) 
var tNoiseSampler: sampler;
@group(0) @binding(7) 
var tColorTexture: texture_2d<f32>;
@group(0) @binding(8) 
var tColorSampler: sampler;
@group(0) @binding(9) 
var tDepthTexture: texture_2d<f32>;
@group(0) @binding(10) 
var tDepthSampler: sampler;
@group(0) @binding(11) 
var tCloudMapTexture: texture_2d<f32>;
@group(0) @binding(12) 
var tCloudMapSampler: sampler;
@group(0) @binding(13) 
var tHeightCubeTexture: texture_2d_array<f32>;
@group(0) @binding(14) 
var tHeightCubeSampler: sampler;
@group(0) @binding(15) 
var tSkyViewTexture: texture_2d<f32>;
@group(0) @binding(16) 
var tSkyViewSampler: sampler;
var<private> gHazeK: f32 = 1f;
var<private> gAirSun: f32 = 1f;
var<private> gPixA: f32;
var<private> outL: vec4<f32>;
var<private> outT: vec4<f32>;
var<private> vUv_1: vec2<f32>;
var<private> gDeckFoot: f32 = 0f;
var<private> gl_FragCoord_1: vec4<f32>;

fn raySphere(center: vec3<f32>, radius: f32, dir: vec3<f32>) -> vec2<f32> {
    var center_1: vec3<f32>;
    var radius_1: f32;
    var dir_1: vec3<f32>;
    var tca: f32;
    var perp: vec3<f32>;
    var h2_: f32;
    var r2_: f32;
    var thc: f32;

    center_1 = center;
    radius_1 = radius;
    dir_1 = dir;
    let _e156 = center_1;
    let _e157 = dir_1;
    tca = dot(_e156, _e157);
    let _e160 = center_1;
    let _e161 = tca;
    let _e162 = dir_1;
    perp = (_e160 - (_e161 * _e162));
    let _e166 = perp;
    let _e167 = perp;
    h2_ = dot(_e166, _e167);
    let _e170 = radius_1;
    let _e171 = radius_1;
    r2_ = (_e170 * _e171);
    let _e174 = h2_;
    let _e175 = r2_;
    if (_e174 > _e175) {
        return vec2<f32>(1f, -1f);
    }
    let _e181 = r2_;
    let _e182 = h2_;
    thc = sqrt((_e181 - _e182));
    let _e186 = tca;
    let _e187 = thc;
    let _e189 = tca;
    let _e190 = thc;
    return vec2<f32>((_e186 - _e187), (_e189 + _e190));
}

fn viewZFromDepth(d: f32) -> f32 {
    var d_1: f32;
    var c: f32;
    var dd: f32;

    d_1 = d;
    let _e152 = global.uDepthMode;
    if (_e152 < 0.5f) {
        {
            let _e155 = global.uNear;
            let _e156 = global.uFar;
            let _e157 = global.uNear;
            c = (_e155 / (_e156 - _e157));
            let _e161 = global.uFar;
            let _e162 = global.uNear;
            let _e164 = global.uFar;
            let _e165 = global.uNear;
            dd = ((_e161 * _e162) / (_e164 - _e165));
            let _e169 = dd;
            let _e170 = d_1;
            let _e171 = c;
            return (_e169 / max((_e170 + _e171), 0.000000000000000000000000000001f));
        }
    }
    let _e176 = d_1;
    let _e177 = global.uLogDepthFC;
    return (exp2((_e176 * _e177)) - 1f);
}

fn isSkyDepth(d_2: f32) -> bool {
    var d_3: f32;
    var local: bool;

    d_3 = d_2;
    let _e152 = global.uDepthMode;
    if (_e152 < 0.5f) {
        let _e155 = d_3;
        local = (_e155 <= 0f);
    } else {
        let _e158 = d_3;
        local = (_e158 >= 1f);
    }
    let _e162 = local;
    return _e162;
}

fn depthPixel(uv: vec2<f32>) -> vec2<i32> {
    var uv_1: vec2<f32>;

    uv_1 = uv;
    let _e152 = uv_1;
    let _e154 = textureDimensions(tDepthTexture, 0i);
    return vec2<i32>(((_e152 * vec2<f32>(vec2<i32>(_e154))) + vec2(0.25f)));
}

fn transmittanceUV(r: f32, mu: f32) -> vec2<f32> {
    var r_1: f32;
    var mu_1: f32;
    var H: f32;
    var rho: f32;
    var disc: f32;
    var d_4: f32;
    var dMin: f32;
    var dMax: f32;
    var xmu: f32;
    var xr: f32;

    r_1 = r;
    mu_1 = mu;
    let _e155 = global.uTop;
    let _e156 = global.uTop;
    let _e158 = global.uBottom;
    let _e159 = global.uBottom;
    H = sqrt(max(0f, ((_e155 * _e156) - (_e158 * _e159))));
    let _e166 = r_1;
    let _e167 = r_1;
    let _e169 = global.uBottom;
    let _e170 = global.uBottom;
    rho = sqrt(max(0f, ((_e166 * _e167) - (_e169 * _e170))));
    let _e176 = r_1;
    let _e177 = r_1;
    let _e179 = mu_1;
    let _e180 = mu_1;
    let _e185 = global.uTop;
    let _e186 = global.uTop;
    disc = (((_e176 * _e177) * ((_e179 * _e180) - 1f)) + (_e185 * _e186));
    let _e191 = r_1;
    let _e193 = mu_1;
    let _e195 = disc;
    d_4 = max(0f, ((-(_e191) * _e193) + sqrt(max(_e195, 0f))));
    let _e202 = global.uTop;
    let _e203 = r_1;
    dMin = (_e202 - _e203);
    let _e206 = rho;
    let _e207 = H;
    dMax = (_e206 + _e207);
    let _e210 = d_4;
    let _e211 = dMin;
    let _e213 = dMax;
    let _e214 = dMin;
    xmu = ((_e210 - _e211) / max((_e213 - _e214), 0.000001f));
    let _e220 = rho;
    let _e221 = H;
    xr = (_e220 / max(_e221, 0.000001f));
    let _e226 = xmu;
    let _e227 = xr;
    return vec2<f32>(_e226, _e227);
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
    let _e158 = upC_1;
    let _e159 = p_1;
    let _e160 = r_3;
    let _e164 = k_1;
    return normalize(mix(_e158, (_e159 / vec3(_e160)), vec3((1f / _e164))));
}

fn trueK(hc: f32) -> f32 {
    var hc_1: f32;

    hc_1 = hc;
    let _e152 = global.uTrueK;
    let _e158 = hc_1;
    return mix(max(_e152, 1f), 1f, smoothstep(20000f, 60000f, _e158));
}

fn lensTrueZ(zd: f32) -> f32 {
    var zd_1: f32;
    var hD: f32;
    var hT: f32;
    var local_1: f32;

    zd_1 = zd;
    let _e154 = global.uSunLift;
    hD = (1.5707963f + _e154.x);
    let _e159 = global.uSunLift;
    hT = (1.5707963f + _e159.y);
    let _e163 = zd_1;
    let _e164 = hD;
    if (_e163 <= _e164) {
        let _e166 = zd_1;
        let _e167 = hT;
        let _e169 = hD;
        local_1 = ((_e166 * _e167) / _e169);
    } else {
        let _e171 = hT;
        let _e172 = zd_1;
        let _e173 = hD;
        let _e176 = hT;
        let _e180 = hD;
        local_1 = (_e171 + (((_e172 - _e173) * (3.1415927f - _e176)) / (3.1415927f - _e180)));
    }
    let _e185 = local_1;
    return _e185;
}

fn liftMu(mu_2: f32) -> f32 {
    var mu_3: f32;

    mu_3 = mu_2;
    let _e153 = global.uSunLift;
    let _e155 = global.uSunLift;
    if (_e153.x <= _e155.y) {
        let _e158 = mu_3;
        return _e158;
    }
    let _e159 = mu_3;
    let _e165 = lensTrueZ(acos(clamp(_e159, -1f, 1f)));
    return cos(_e165);
}

fn mediumAt(r_4: f32, scatR: ptr<function, vec3<f32>>, scatM: ptr<function, vec3<f32>>, ext: ptr<function, vec3<f32>>) {
    var r_5: f32;
    var h: f32;
    var local_2: f32;
    var hr: f32;
    var dR: f32;
    var dM: f32;
    var local_3: f32;
    var dA: f32;
    var dH: vec3<f32>;

    r_5 = r_4;
    let _e158 = r_5;
    let _e159 = global.uRadius;
    h = (_e158 - _e159);
    let _e162 = h;
    let _e163 = global.uKnee;
    if (_e162 <= _e163) {
        let _e165 = h;
        local_2 = _e165;
    } else {
        let _e166 = global.uKnee;
        let _e167 = h;
        let _e168 = global.uKnee;
        let _e170 = global.uUpper;
        local_2 = (_e166 + ((_e167 - _e168) / _e170));
    }
    let _e174 = local_2;
    hr = _e174;
    let _e176 = hr;
    let _e178 = global.uRayleighH;
    dR = exp((-(_e176) / _e178));
    let _e182 = hr;
    let _e184 = global.uMieH;
    dM = exp((-(_e182) / _e184));
    let _e188 = global.uAbsExp;
    if (_e188 > 0.5f) {
        let _e191 = dR;
        local_3 = _e191;
    } else {
        let _e194 = h;
        let _e195 = global.uAbsCenter;
        let _e198 = global.uAbsWidth;
        local_3 = max(0f, (1f - (abs((_e194 - _e195)) / max(_e198, 1f))));
    }
    let _e205 = local_3;
    dA = _e205;
    let _e207 = global.uHaze;
    let _e209 = gHazeK;
    let _e211 = h;
    let _e215 = global.uHaze;
    let _e222 = global.uHazeCol;
    dH = (((_e207.x * _e209) * exp((-(max(_e211, 0f)) / max(_e215.y, 1f)))) * _e222);
    let _e225 = global.uRayleigh;
    let _e226 = dR;
    (*scatR) = (_e225 * _e226);
    let _e228 = global.uMie;
    let _e229 = dM;
    let _e231 = dH;
    (*scatM) = ((_e228 * _e229) + _e231);
    let _e233 = (*scatR);
    let _e234 = (*scatM);
    let _e236 = global.uMieAbs;
    let _e237 = dM;
    let _e240 = global.uAbs;
    let _e241 = dA;
    let _e244 = dH;
    let _e245 = global.uHaze;
    (*ext) = ((((_e233 + _e234) + (_e236 * _e237)) + (_e240 * _e241)) + (_e244 * _e245.z));
    return;
}

fn realH(h_1: f32) -> f32 {
    var h_2: f32;
    var local_4: f32;

    h_2 = h_1;
    let _e155 = h_2;
    let _e156 = global.uKnee;
    if (_e155 <= _e156) {
        let _e158 = h_2;
        local_4 = _e158;
    } else {
        let _e159 = global.uKnee;
        let _e160 = h_2;
        let _e161 = global.uKnee;
        let _e163 = global.uUpper;
        local_4 = (_e159 + ((_e160 - _e161) / _e163));
    }
    let _e167 = local_4;
    return _e167;
}

fn drawnH(hr_1: f32) -> f32 {
    var hr_2: f32;
    var local_5: f32;

    hr_2 = hr_1;
    let _e155 = hr_2;
    let _e156 = global.uKnee;
    if (_e155 <= _e156) {
        let _e158 = hr_2;
        local_5 = _e158;
    } else {
        let _e159 = global.uKnee;
        let _e160 = hr_2;
        let _e161 = global.uKnee;
        let _e163 = global.uUpper;
        local_5 = (_e159 + ((_e160 - _e161) * _e163));
    }
    let _e167 = local_5;
    return _e167;
}

fn mediumAtReal(hr_3: f32, scatR_1: ptr<function, vec3<f32>>, scatM_1: ptr<function, vec3<f32>>, ext_1: ptr<function, vec3<f32>>) {
    var hr_4: f32;
    var h_3: f32;
    var dR_1: f32;
    var dM_1: f32;
    var local_6: f32;
    var dA_1: f32;
    var dH_1: vec3<f32>;

    hr_4 = hr_3;
    let _e158 = hr_4;
    let _e159 = drawnH(_e158);
    h_3 = _e159;
    let _e161 = hr_4;
    let _e163 = global.uRayleighH;
    dR_1 = exp((-(_e161) / _e163));
    let _e167 = hr_4;
    let _e169 = global.uMieH;
    dM_1 = exp((-(_e167) / _e169));
    let _e173 = global.uAbsExp;
    if (_e173 > 0.5f) {
        let _e176 = dR_1;
        local_6 = _e176;
    } else {
        let _e179 = h_3;
        let _e180 = global.uAbsCenter;
        let _e183 = global.uAbsWidth;
        local_6 = max(0f, (1f - (abs((_e179 - _e180)) / max(_e183, 1f))));
    }
    let _e190 = local_6;
    dA_1 = _e190;
    let _e192 = global.uHaze;
    let _e194 = gHazeK;
    let _e196 = hr_4;
    let _e200 = global.uHaze;
    let _e207 = global.uHazeCol;
    dH_1 = (((_e192.x * _e194) * exp((-(max(_e196, 0f)) / max(_e200.y, 1f)))) * _e207);
    let _e210 = global.uRayleigh;
    let _e211 = dR_1;
    (*scatR_1) = (_e210 * _e211);
    let _e213 = global.uMie;
    let _e214 = dM_1;
    let _e216 = dH_1;
    (*scatM_1) = ((_e213 * _e214) + _e216);
    let _e218 = (*scatR_1);
    let _e219 = (*scatM_1);
    let _e221 = global.uMieAbs;
    let _e222 = dM_1;
    let _e225 = global.uAbs;
    let _e226 = dA_1;
    let _e229 = dH_1;
    let _e230 = global.uHaze;
    (*ext_1) = ((((_e218 + _e219) + (_e221 * _e222)) + (_e225 * _e226)) + (_e229 * _e230.z));
    return;
}

fn phaseRayleigh(c_1: f32) -> f32 {
    var c_2: f32;

    c_2 = c_1;
    let _e161 = c_2;
    let _e162 = c_2;
    return (0.059683103f * (1f + (_e161 * _e162)));
}

fn phaseCS(c_3: f32, g: f32) -> f32 {
    var c_4: f32;
    var g_1: f32;
    var g2_: f32;

    c_4 = c_3;
    g_1 = g;
    let _e157 = g_1;
    let _e158 = g_1;
    g2_ = (_e157 * _e158);
    let _e167 = g2_;
    let _e170 = c_4;
    let _e171 = c_4;
    let _e177 = g2_;
    let _e180 = g2_;
    let _e183 = g_1;
    let _e185 = c_4;
    return ((0.119366206f * ((1f - _e167) * (1f + (_e170 * _e171)))) / ((2f + _e177) * pow(max(((1f + _e180) - ((2f * _e183) * _e185)), 0.0001f), 1.5f)));
}

fn phaseHG(c_5: f32, g_2: f32) -> f32 {
    var c_6: f32;
    var g_3: f32;

    c_6 = c_5;
    g_3 = g_2;
    let _e158 = g_3;
    let _e159 = g_3;
    let _e166 = g_3;
    let _e167 = g_3;
    let _e171 = g_3;
    let _e173 = c_6;
    return ((1f - (_e158 * _e159)) / (12.566371f * pow(max(((1f + (_e166 * _e167)) - ((2f * _e171) * _e173)), 0.000001f), 1.5f)));
}

fn phaseMie(c_7: f32) -> vec3<f32> {
    var c_8: f32;

    c_8 = c_7;
    let _e155 = c_8;
    let _e156 = global.uMieG;
    let _e158 = phaseCS(_e155, _e156.x);
    let _e159 = c_8;
    let _e160 = global.uMieG;
    let _e162 = phaseCS(_e159, _e160.y);
    let _e163 = c_8;
    let _e164 = global.uMieG;
    let _e166 = phaseCS(_e163, _e164.z);
    let _e168 = c_8;
    let _e169 = global.uMieGL;
    let _e171 = phaseHG(_e168, _e169.x);
    let _e172 = c_8;
    let _e173 = global.uMieGL;
    let _e175 = phaseHG(_e172, _e173.y);
    let _e176 = c_8;
    let _e177 = global.uMieGL;
    let _e179 = phaseHG(_e176, _e177.z);
    let _e181 = global.uMieF;
    return mix(vec3<f32>(_e158, _e162, _e166), vec3<f32>(_e171, _e175, _e179), _e181);
}

fn distToTop(r_6: f32, mu_4: f32) -> f32 {
    var r_7: f32;
    var mu_5: f32;
    var disc_1: f32;

    r_7 = r_6;
    mu_5 = mu_4;
    let _e157 = r_7;
    let _e158 = r_7;
    let _e160 = mu_5;
    let _e161 = mu_5;
    let _e166 = global.uTop;
    let _e167 = global.uTop;
    disc_1 = (((_e157 * _e158) * ((_e160 * _e161) - 1f)) + (_e166 * _e167));
    let _e172 = r_7;
    let _e174 = mu_5;
    let _e176 = disc_1;
    return max(0f, ((-(_e172) * _e174) + sqrt(max(_e176, 0f))));
}

fn hitsGround(r_8: f32, mu_6: f32, gr: f32) -> bool {
    var r_9: f32;
    var mu_7: f32;
    var gr_1: f32;

    r_9 = r_8;
    mu_7 = mu_6;
    gr_1 = gr;
    let _e159 = mu_7;
    let _e162 = r_9;
    let _e163 = r_9;
    let _e165 = mu_7;
    let _e166 = mu_7;
    let _e171 = gr_1;
    let _e172 = gr_1;
    return ((_e159 < 0f) && ((((_e162 * _e163) * ((_e165 * _e166) - 1f)) + (_e171 * _e172)) >= 0f));
}

fn airLight(p_2: vec3<f32>, r_10: f32) -> vec3<f32> {
    var p_3: vec3<f32>;
    var r_11: f32;
    var hgt: f32;

    p_3 = p_2;
    r_11 = r_10;
    let _e158 = global.uAurora;
    if (_e158.w <= 0f) {
        return vec3(0f);
    }
    let _e164 = r_11;
    let _e165 = global.uRadius;
    let _e167 = global.uTop;
    let _e168 = global.uRadius;
    hgt = ((_e164 - _e165) / (_e167 - _e168));
    let _e172 = global.uAurora;
    let _e174 = hgt;
    let _e184 = global.uAirglowCol;
    let _e186 = global.uTop;
    let _e187 = global.uRadius;
    return (((_e172.w * exp(-(pow(((_e174 - 0.6f) / 0.03f), 2f)))) * _e184) / vec3((_e186 - _e187)));
}

fn auroraArcs(pf: vec3<f32>, blur: f32) -> f32 {
    var pf_1: vec3<f32>;
    var blur_1: f32;
    var ml: f32;
    var aml: f32;
    var band: f32;
    var local_7: vec3<f32>;
    var e1_: vec3<f32>;
    var e2_: vec3<f32>;
    var mlon: f32;
    var cs: vec2<f32>;
    var local_8: f32;
    var side: f32;
    var b: f32 = 0f;
    var j: i32 = 0i;
    var fj: f32;
    var wig: f32;
    var lineLat: f32;
    var w0_: f32;
    var w: f32;
    var d_5: f32;
    var arc: f32;
    var rays: f32;

    pf_1 = pf;
    blur_1 = blur;
    let _e158 = pf_1;
    let _e159 = global.uMagAxis;
    ml = asin(clamp(dot(_e158, _e159), -1f, 1f));
    let _e167 = ml;
    aml = abs(_e167);
    let _e170 = global.uAurora;
    if (_e170.y < 0f) {
        let _e175 = pf_1;
        let _e180 = global.uTime;
        let _e186 = textureSampleLevel(tNoiseTexture, tNoiseSampler, ((_e175 * 3f) + vec3<f32>(0f, 0f, (_e180 * 0.002f))), 0f);
        return (0.3f * _e186.x);
    }
    let _e189 = aml;
    let _e190 = global.uAurora;
    let _e193 = global.uAurora;
    band = exp(-(pow(((_e189 - _e190.y) / _e193.z), 2f)));
    let _e201 = band;
    if (_e201 < 0.02f) {
        return 0f;
    }
    let _e205 = global.uMagAxis;
    let _e206 = global.uMagAxis;
    if (abs(_e206.z) < 0.9f) {
        local_7 = vec3<f32>(0f, 0f, 1f);
    } else {
        local_7 = vec3<f32>(1f, 0f, 0f);
    }
    let _e220 = local_7;
    e1_ = normalize(cross(_e205, _e220));
    let _e224 = global.uMagAxis;
    let _e225 = e1_;
    e2_ = cross(_e224, _e225);
    let _e228 = pf_1;
    let _e229 = e2_;
    let _e231 = pf_1;
    let _e232 = e1_;
    mlon = atan2(dot(_e228, _e229), dot(_e231, _e232));
    let _e236 = mlon;
    let _e238 = mlon;
    cs = vec2<f32>(cos(_e236), sin(_e238));
    let _e242 = ml;
    if (_e242 > 0f) {
        local_8 = 0f;
    } else {
        local_8 = 5.3f;
    }
    let _e248 = local_8;
    side = _e248;
    loop {
        let _e254 = j;
        if !((_e254 < 2i)) {
            break;
        }
        {
            let _e261 = j;
            fj = f32(_e261);
            let _e264 = cs;
            let _e266 = (_e264 * 0.6f);
            let _e267 = side;
            let _e268 = fj;
            let _e272 = global.uTime;
            let _e280 = textureSampleLevel(tNoiseTexture, tNoiseSampler, vec3<f32>(_e266.x, _e266.y, ((_e267 + (_e268 * 2.7f)) + (_e272 * 0.0015f))), 0f);
            wig = (_e280.x - 0.5f);
            let _e285 = wig;
            let _e287 = cs;
            let _e289 = (_e287 * 2.3f);
            let _e290 = side;
            let _e291 = fj;
            let _e295 = global.uTime;
            let _e303 = textureSampleLevel(tNoiseTexture, tNoiseSampler, vec3<f32>(_e289.x, _e289.y, ((_e290 + (_e291 * 1.3f)) + (_e295 * 0.004f))), 0f);
            wig = (_e285 + (0.45f * (_e303.x - 0.5f)));
            let _e309 = global.uAurora;
            let _e311 = fj;
            let _e314 = global.uAurora;
            let _e320 = wig;
            let _e321 = global.uAurora;
            lineLat = ((_e309.y + (((_e311 - 0.5f) * _e314.z) * 0.9f)) + ((_e320 * _e321.z) * 2.2f));
            let _e328 = global.uAurora;
            w0_ = (_e328.z * 0.035f);
            let _e333 = w0_;
            let _e334 = w0_;
            let _e336 = blur_1;
            let _e337 = blur_1;
            w = sqrt(((_e333 * _e334) + (_e336 * _e337)));
            let _e342 = aml;
            let _e343 = lineLat;
            let _e345 = w;
            d_5 = ((_e342 - _e343) / _e345);
            let _e348 = d_5;
            let _e350 = d_5;
            let _e353 = w0_;
            let _e355 = w;
            arc = ((exp((-(_e348) * _e350)) * _e353) / _e355);
            let _e358 = arc;
            if (_e358 < 0.01f) {
                continue;
            }
            let _e361 = cs;
            let _e363 = (_e361 * 5f);
            let _e364 = side;
            let _e365 = fj;
            let _e369 = global.uTime;
            let _e377 = textureSampleLevel(tNoiseTexture, tNoiseSampler, vec3<f32>(_e363.x, _e363.y, ((_e364 + (_e365 * 0.61f)) + (_e369 * 0.02f))), 0f);
            rays = _e377.x;
            let _e380 = b;
            let _e381 = arc;
            let _e384 = rays;
            let _e386 = rays;
            b = (_e380 + (_e381 * (0.25f + ((1.8f * _e384) * _e386))));
        }
        continuing {
            let _e258 = j;
            j = (_e258 + 1i);
        }
    }
    let _e391 = b;
    let _e392 = band;
    return (_e391 * _e392);
}

fn auroraRay(D: vec3<f32>, tca_1: f32, perp_1: vec3<f32>, tMax: f32, jitter: f32, near: ptr<function, vec3<f32>>, far: ptr<function, vec3<f32>>) {
    var D_1: vec3<f32>;
    var tca_2: f32;
    var perp_2: vec3<f32>;
    var tMax_1: f32;
    var jitter_1: f32;
    var H_1: f32;
    var aLo: f32;
    var aHi: f32;
    var pp: f32;
    var K: i32 = 28i;
    var slab: f32;
    var i: i32 = 0i;
    var x: f32;
    var a: f32;
    var s: f32;
    var prof: f32;
    var col: vec3<f32>;
    var k_2: i32;
    var local_9: f32;
    var t: f32;
    var p_4: vec3<f32>;
    var mu_8: f32;
    var blur_2: f32;
    var b_1: f32;
    var e: vec3<f32>;

    D_1 = D;
    tca_2 = tca_1;
    perp_2 = perp_1;
    tMax_1 = tMax;
    jitter_1 = jitter;
    (*near) = vec3(0f);
    (*far) = vec3(0f);
    let _e170 = global.uAurora;
    if (_e170.x <= 0f) {
        return;
    }
    let _e174 = global.uTop;
    let _e175 = global.uRadius;
    H_1 = (_e174 - _e175);
    let _e178 = global.uRadius;
    let _e180 = H_1;
    aLo = (_e178 + (0.55f * _e180));
    let _e184 = global.uRadius;
    let _e186 = H_1;
    aHi = (_e184 + (0.98f * _e186));
    let _e190 = perp_2;
    let _e191 = perp_2;
    pp = dot(_e190, _e191);
    let _e194 = pp;
    let _e195 = aHi;
    let _e196 = aHi;
    if (_e194 >= (_e195 * _e196)) {
        return;
    }
    let _e201 = aHi;
    let _e202 = aLo;
    let _e204 = K;
    slab = ((_e201 - _e202) / f32(_e204));
    loop {
        let _e210 = i;
        let _e211 = K;
        if !((_e210 < _e211)) {
            break;
        }
        {
            let _e217 = i;
            let _e219 = jitter_1;
            let _e221 = K;
            x = ((f32(_e217) + _e219) / f32(_e221));
            let _e225 = aLo;
            let _e226 = aHi;
            let _e227 = x;
            a = mix(_e225, _e226, _e227);
            let _e230 = pp;
            let _e231 = a;
            let _e232 = a;
            if (_e230 >= (_e231 * _e232)) {
                continue;
            }
            let _e235 = a;
            let _e236 = a;
            let _e238 = pp;
            s = sqrt(((_e235 * _e236) - _e238));
            let _e244 = x;
            let _e248 = x;
            prof = (smoothstep(0f, 0.04f, _e244) * exp((-2.5f * _e248)));
            let _e253 = global.uAuroraLo;
            let _e254 = global.uAuroraHi;
            let _e257 = x;
            let _e261 = prof;
            let _e263 = global.uAurora;
            let _e266 = H_1;
            col = (((mix(_e253, _e254, vec3(smoothstep(0.3f, 0.85f, _e257))) * _e261) * _e263.x) / vec3(_e266));
            k_2 = 0i;
            loop {
                let _e272 = k_2;
                if !((_e272 < 2i)) {
                    break;
                }
                {
                    let _e279 = k_2;
                    if (_e279 == 0i) {
                        let _e282 = tca_2;
                        let _e283 = s;
                        local_9 = (_e282 - _e283);
                    } else {
                        let _e285 = tca_2;
                        let _e286 = s;
                        local_9 = (_e285 + _e286);
                    }
                    let _e289 = local_9;
                    t = _e289;
                    let _e291 = t;
                    let _e294 = t;
                    let _e295 = tMax_1;
                    if ((_e291 <= 0f) || (_e294 >= _e295)) {
                        continue;
                    }
                    let _e298 = t;
                    let _e299 = tca_2;
                    let _e301 = D_1;
                    let _e303 = perp_2;
                    p_4 = (((_e298 - _e299) * _e301) - _e303);
                    let _e306 = t;
                    let _e307 = tca_2;
                    let _e309 = a;
                    mu_8 = ((_e306 - _e307) / _e309);
                    let _e312 = slab;
                    let _e314 = mu_8;
                    let _e315 = mu_8;
                    let _e322 = mu_8;
                    let _e327 = t;
                    let _e328 = gPixA;
                    let _e331 = a;
                    blur_2 = ((((_e312 * sqrt(max((1f - (_e314 * _e315)), 0f))) / max(abs(_e322), 0.04f)) + (_e327 * _e328)) / _e331);
                    let _e334 = global.uToFixed;
                    let _e335 = p_4;
                    let _e336 = a;
                    let _e340 = blur_2;
                    let _e341 = auroraArcs((_e334 * (_e335 / vec3(_e336))), _e340);
                    b_1 = _e341;
                    let _e343 = b_1;
                    if (_e343 <= 0f) {
                        continue;
                    }
                    let _e346 = col;
                    let _e347 = b_1;
                    let _e349 = slab;
                    let _e351 = mu_8;
                    e = (((_e346 * _e347) * _e349) / vec3(max(abs(_e351), 0.04f)));
                    let _e358 = k_2;
                    if (_e358 == 0i) {
                        let _e361 = (*near);
                        let _e362 = e;
                        (*near) = (_e361 + _e362);
                    } else {
                        let _e364 = (*far);
                        let _e365 = e;
                        (*far) = (_e364 + _e365);
                    }
                }
                continuing {
                    let _e276 = k_2;
                    k_2 = (_e276 + 1i);
                }
            }
        }
        continuing {
            let _e214 = i;
            i = (_e214 + 1i);
        }
    }
    return;
}

fn blackbodyGlow(T: f32) -> vec3<f32> {
    var T_1: f32;
    var g_4: f32;

    T_1 = T;
    let _e156 = T_1;
    if (_e156 < 650f) {
        return vec3(0f);
    }
    let _e164 = T_1;
    g_4 = max(0f, (0.0287f + (0.000237f * (_e164 - 1000f))));
    let _e172 = g_4;
    let _e178 = T_1;
    let _e184 = g_4;
    return (vec3<f32>(1f, _e172, 0f) * ((600000f * exp((-24060f / _e178))) / (0.2126f + (0.7152f * _e184))));
}

fn airHeatGlow(r_12: f32) -> vec3<f32> {
    var r_13: f32;
    var local_10: vec3<f32>;

    r_13 = r_12;
    let _e156 = global.uThermal;
    if (_e156.x > 0f) {
        let _e160 = global.uThermal;
        let _e162 = global.uThermal;
        let _e164 = r_13;
        let _e165 = global.uRadius;
        let _e171 = blackbodyGlow((_e160.x - (_e162.z * max((_e164 - _e165), 0f))));
        local_10 = _e171;
    } else {
        local_10 = vec3(0f);
    }
    let _e175 = local_10;
    return _e175;
}

fn heightCubeAt(d_6: vec3<f32>) -> f32 {
    var d_7: vec3<f32>;
    var a_1: vec3<f32>;
    var local_11: i32;
    var local_12: i32;
    var local_13: i32;
    var local_14: i32;
    var local_15: i32;
    var f: i32;
    var local_16: array<vec3<f32>, 6> = HC_N;
    var dn: f32;
    var local_17: array<vec3<f32>, 6> = HC_U;
    var local_18: array<vec3<f32>, 6> = HC_V;
    var uv_2: vec2<f32>;

    d_7 = d_6;
    let _e159 = d_7;
    a_1 = abs(_e159);
    let _e162 = a_1;
    let _e164 = a_1;
    let _e167 = a_1;
    let _e169 = a_1;
    if ((_e162.x >= _e164.y) && (_e167.x >= _e169.z)) {
        let _e173 = d_7;
        if (_e173.x >= 0f) {
            local_11 = 0i;
        } else {
            local_11 = 1i;
        }
        let _e180 = local_11;
        local_15 = _e180;
    } else {
        let _e181 = a_1;
        let _e183 = a_1;
        if (_e181.y >= _e183.z) {
            let _e186 = d_7;
            if (_e186.y >= 0f) {
                local_12 = 2i;
            } else {
                local_12 = 3i;
            }
            let _e193 = local_12;
            local_14 = _e193;
        } else {
            let _e194 = d_7;
            if (_e194.z >= 0f) {
                local_13 = 4i;
            } else {
                local_13 = 5i;
            }
            let _e201 = local_13;
            local_14 = _e201;
        }
        let _e203 = local_14;
        local_15 = _e203;
    }
    let _e205 = local_15;
    f = _e205;
    let _e207 = d_7;
    let _e208 = f;
    let _e212 = local_16[_e208];
    dn = dot(_e207, _e212);
    let _e215 = d_7;
    let _e216 = f;
    let _e220 = local_17[_e216];
    let _e222 = dn;
    let _e225 = d_7;
    let _e226 = f;
    let _e230 = local_18[_e226];
    let _e232 = dn;
    uv_2 = (((vec2<f32>(atan((dot(_e215, _e220) / _e222)), atan((dot(_e225, _e230) / _e232))) / vec2(0.785398f)) * 0.5f) + vec2(0.5f));
    let _e245 = uv_2;
    let _e246 = f;
    let _e250 = vec3<f32>(_e245.x, _e245.y, f32(_e246));
    let _e255 = textureSampleLevel(tHeightCubeTexture, tHeightCubeSampler, _e250.xy, i32(_e250.z), 0f);
    return _e255.x;
}

fn terrainShadow(pF: vec3<f32>, up: vec3<f32>, sF: vec3<f32>, R: f32) -> f32 {
    var pF_1: vec3<f32>;
    var up_1: vec3<f32>;
    var sF_1: vec3<f32>;
    var R_1: f32;
    var texel: f32;
    var top: f32;
    var r0_: f32;
    var below: f32;
    var o: vec3<f32>;
    var t_1: f32;
    var sh: f32 = 1f;
    var i_1: i32 = 0i;
    var qp: vec3<f32>;
    var rq: f32;
    var d_8: f32;

    pF_1 = pF;
    up_1 = up;
    sF_1 = sF;
    R_1 = R;
    let _e165 = global.uHeightCube;
    let _e169 = up_1;
    let _e170 = sF_1;
    if ((_e165.x < 0.5f) || (dot(_e169, _e170) < -0.2f)) {
        return 1f;
    }
    let _e177 = global.uHeightCube;
    texel = _e177.w;
    let _e180 = R_1;
    let _e181 = global.uHeightCube;
    top = (_e180 + _e181.z);
    let _e185 = pF_1;
    r0_ = length(_e185);
    let _e189 = R_1;
    let _e190 = up_1;
    let _e191 = heightCubeAt(_e190);
    let _e193 = r0_;
    below = max(0f, ((_e189 + _e191) - _e193));
    let _e197 = pF_1;
    let _e198 = up_1;
    let _e199 = texel;
    o = (_e197 + ((_e198 * _e199) * 0.1f));
    let _e205 = texel;
    t_1 = _e205;
    loop {
        let _e211 = i_1;
        if !((_e211 < 28i)) {
            break;
        }
        {
            let _e218 = o;
            let _e219 = sF_1;
            let _e220 = t_1;
            qp = (_e218 + (_e219 * _e220));
            let _e224 = qp;
            rq = length(_e224);
            let _e227 = rq;
            let _e228 = top;
            if (_e227 > _e228) {
                break;
            }
            let _e230 = rq;
            let _e231 = R_1;
            let _e232 = qp;
            let _e233 = rq;
            let _e236 = heightCubeAt((_e232 / vec3(_e233)));
            let _e239 = below;
            let _e240 = t_1;
            let _e243 = texel;
            d_8 = ((_e230 - (_e231 + _e236)) + (_e239 * exp((-(_e240) / (3f * _e243)))));
            let _e250 = sh;
            let _e251 = d_8;
            let _e252 = t_1;
            sh = min(_e250, clamp(((_e251 / (_e252 * 0.035f)) + 0.5f), 0f, 1f));
            let _e262 = sh;
            if (_e262 <= 0f) {
                break;
            }
            let _e265 = t_1;
            t_1 = (_e265 * 1.35f);
        }
        continuing {
            let _e215 = i_1;
            i_1 = (_e215 + 1i);
        }
    }
    let _e268 = sh;
    return _e268;
}

fn airShadow(pF_2: vec3<f32>, sF_2: vec3<f32>, R_2: f32) -> f32 {
    var pF_3: vec3<f32>;
    var sF_3: vec3<f32>;
    var R_3: f32;
    var texel_1: f32;
    var top_1: f32;
    var t_2: f32;
    var sh_1: f32 = 1f;
    var i_2: i32 = 0i;
    var qp_1: vec3<f32>;
    var rq_1: f32;

    pF_3 = pF_2;
    sF_3 = sF_2;
    R_3 = R_2;
    let _e163 = global.uHeightCube;
    texel_1 = _e163.w;
    let _e166 = R_3;
    let _e167 = global.uHeightCube;
    top_1 = (_e166 + _e167.z);
    let _e171 = texel_1;
    t_2 = _e171;
    loop {
        let _e177 = i_2;
        if !((_e177 < 16i)) {
            break;
        }
        {
            let _e184 = pF_3;
            let _e185 = sF_3;
            let _e186 = t_2;
            qp_1 = (_e184 + (_e185 * _e186));
            let _e190 = qp_1;
            rq_1 = length(_e190);
            let _e193 = rq_1;
            let _e194 = top_1;
            if (_e193 > _e194) {
                break;
            }
            let _e196 = sh_1;
            let _e197 = rq_1;
            let _e198 = R_3;
            let _e199 = qp_1;
            let _e200 = rq_1;
            let _e203 = heightCubeAt((_e199 / vec3(_e200)));
            let _e206 = t_2;
            sh_1 = min(_e196, clamp((((_e197 - (_e198 + _e203)) / (_e206 * 0.035f)) + 0.5f), 0f, 1f));
            let _e216 = sh_1;
            if (_e216 <= 0f) {
                break;
            }
            let _e219 = t_2;
            t_2 = (_e219 * 1.6f);
        }
        continuing {
            let _e181 = i_2;
            i_2 = (_e181 + 1i);
        }
    }
    let _e222 = sh_1;
    return _e222;
}

fn thermalGlow(h_4: f32) -> vec3<f32> {
    var h_5: f32;
    var T_2: f32;
    var k_3: f32;
    var c_9: vec3<f32>;

    h_5 = h_4;
    let _e162 = global.uT1_;
    let _e163 = global.uLapse;
    let _e164 = h_5;
    T_2 = (_e162 - (_e163 * min(_e164, 0f)));
    let _e171 = T_2;
    k_3 = pow(max(0f, ((_e171 - 560f) / 700f)), 2.6f);
    let _e188 = T_2;
    c_9 = mix(vec3<f32>(1f, 0.18f, 0.04f), vec3<f32>(1f, 0.45f, 0.12f), vec3(clamp(((_e188 - 800f) / 600f), 0f, 1f)));
    let _e199 = c_9;
    let _e200 = k_3;
    let _e204 = global.uGlow;
    return (((_e199 * _e200) * 0.003f) * _e204);
}

fn transmittanceToTop(r_14: f32, mu_9: f32) -> vec3<f32> {
    var r_15: f32;
    var mu_10: f32;
    var uv_3: vec2<f32>;

    r_15 = r_14;
    mu_10 = mu_9;
    let _e164 = r_15;
    let _e165 = global.uBottom;
    let _e166 = global.uTop;
    let _e168 = mu_10;
    let _e169 = transmittanceUV(clamp(_e164, _e165, _e166), _e168);
    uv_3 = _e169;
    let _e178 = uv_3;
    uv_3 = (vec2<f32>(0.001953125f, 0.0078125f) + (_e178 * vec2<f32>(0.99609375f, 0.984375f)));
    let _e188 = uv_3;
    let _e190 = textureSampleLevel(tTransTexture, tTransSampler, _e188, 0f);
    return _e190.xyz;
}

fn sunTransmittance(r_16: f32, mu_11: f32) -> vec3<f32> {
    var r_17: f32;
    var mu_12: f32;
    var Rg: f32;
    var sinH: f32;
    var cosH: f32;

    r_17 = r_16;
    mu_12 = mu_11;
    let _e164 = mu_12;
    let _e165 = liftMu(_e164);
    mu_12 = _e165;
    let _e166 = global.uGround;
    let _e167 = global.uTrueK;
    Rg = (_e166 * max(_e167, 1f));
    let _e172 = Rg;
    let _e173 = Rg;
    let _e174 = r_17;
    let _e175 = global.uGround;
    sinH = (_e172 / (_e173 + max((_e174 - _e175), 0f)));
    let _e184 = sinH;
    let _e185 = sinH;
    cosH = -(sqrt(max(0f, (1f - (_e184 * _e185)))));
    let _e192 = r_17;
    let _e193 = mu_12;
    let _e194 = transmittanceToTop(_e192, _e193);
    let _e195 = cosH;
    let _e198 = cosH;
    let _e201 = mu_12;
    return (_e194 * smoothstep((_e195 - 0.004f), (_e198 + 0.004f), _e201));
}

fn multiScatter(r_18: f32, muS: f32) -> vec3<f32> {
    var r_19: f32;
    var muS_1: f32;
    var uv_4: vec2<f32>;

    r_19 = r_18;
    muS_1 = muS;
    let _e164 = muS_1;
    let _e165 = liftMu(_e164);
    muS_1 = _e165;
    let _e166 = muS_1;
    let _e171 = r_19;
    let _e172 = global.uBottom;
    let _e174 = global.uTop;
    let _e175 = global.uBottom;
    uv_4 = clamp(vec2<f32>(((_e166 * 0.5f) + 0.5f), ((_e171 - _e172) / (_e174 - _e175))), vec2(0f), vec2(1f));
    let _e189 = uv_4;
    let _e196 = textureSampleLevel(tMSTexture, tMSSampler, (vec2(0.015625f) + (_e189 * 0.96875f)), 0f);
    return _e196.xyz;
}

fn skyTrueEl(e_1: f32) -> f32 {
    var e_2: f32;
    var zd_2: f32;
    var hD_1: f32;
    var hT_1: f32;
    var local_19: f32;

    e_2 = e_1;
    let _e162 = global.uSkyView;
    let _e164 = global.uSkyView;
    if (_e162.y <= _e164.z) {
        let _e167 = e_2;
        return _e167;
    }
    let _e169 = e_2;
    zd_2 = (1.5707963f - _e169);
    let _e173 = global.uSkyView;
    hD_1 = (1.5707963f + _e173.y);
    let _e178 = global.uSkyView;
    hT_1 = (1.5707963f + _e178.z);
    let _e183 = zd_2;
    let _e184 = hD_1;
    if (_e183 <= _e184) {
        let _e186 = zd_2;
        let _e187 = hT_1;
        let _e189 = hD_1;
        local_19 = ((_e186 * _e187) / _e189);
    } else {
        let _e191 = hT_1;
        let _e192 = zd_2;
        let _e193 = hD_1;
        let _e196 = hT_1;
        let _e200 = hD_1;
        local_19 = (_e191 + (((_e192 - _e193) * (3.1415927f - _e196)) / (3.1415927f - _e200)));
    }
    let _e205 = local_19;
    return (1.5707963f - _e205);
}

fn skyFar(D_2: vec3<f32>) -> vec3<f32> {
    var D_3: vec3<f32>;
    var s_1: f32;
    var el: f32;
    var hD_2: vec3<f32>;
    var hl: f32;
    var local_20: f32;
    var az: f32;
    var v: f32;

    D_3 = D_2;
    let _e162 = global.uSkyView;
    if (_e162.x <= 0f) {
        return vec3(0f);
    }
    let _e168 = D_3;
    let _e169 = global.uSkyUp;
    s_1 = clamp(dot(_e168, _e169), -1f, 1f);
    let _e176 = s_1;
    let _e178 = skyTrueEl(asin(_e176));
    el = _e178;
    let _e180 = D_3;
    let _e181 = global.uSkyUp;
    let _e182 = s_1;
    hD_2 = (_e180 - (_e181 * _e182));
    let _e186 = hD_2;
    hl = length(_e186);
    let _e189 = hl;
    if (_e189 > 0.00001f) {
        let _e192 = hD_2;
        let _e193 = hl;
        let _e196 = global.uSkySunH;
        local_20 = acos(clamp(dot((_e192 / vec3(_e193)), _e196), -1f, 1f));
    } else {
        local_20 = 0f;
    }
    let _e205 = local_20;
    az = _e205;
    let _e209 = el;
    let _e212 = el;
    v = (0.5f + ((0.5f * sign(_e209)) * sqrt((abs(_e212) / 1.5707963f))));
    let _e220 = az;
    let _e223 = v;
    let _e226 = textureSampleLevel(tSkyViewTexture, tSkyViewSampler, vec2<f32>((_e220 / 3.1415927f), _e223), 0f);
    let _e228 = global.uSkyView;
    return (_e226.xyz * _e228.x);
}

fn ign(p_5: vec2<f32>) -> f32 {
    var p_6: vec2<f32>;

    p_6 = p_5;
    let _e163 = p_6;
    return fract((52.982918f * fract(dot(_e163, vec2<f32>(0.06711056f, 0.00583715f)))));
}

fn hg(c_10: f32, g_5: f32) -> f32 {
    var c_11: f32;
    var g_6: f32;
    var g2_1: f32;

    c_11 = c_10;
    g_6 = g_5;
    let _e164 = g_6;
    let _e165 = g_6;
    g2_1 = (_e164 * _e165);
    let _e169 = g2_1;
    let _e175 = g2_1;
    let _e178 = g_6;
    let _e180 = c_11;
    return ((1f - _e169) / (12.566371f * pow(max(((1f + _e175) - ((2f * _e178) * _e180)), 0.0001f), 1.5f)));
}

fn palette(t_3: f32) -> vec3<f32> {
    var t_4: f32;
    var i_3: f32;
    var f_1: f32;
    var a_2: vec3<f32>;
    var b_2: vec3<f32>;

    t_4 = t_3;
    let _e162 = t_4;
    t_4 = (clamp(_e162, 0f, 1f) * 5f);
    let _e168 = t_4;
    i_3 = floor(_e168);
    let _e173 = t_4;
    f_1 = smoothstep(0f, 1f, fract(_e173));
    let _e179 = global.uPal[0];
    a_2 = _e179;
    let _e183 = global.uPal[1];
    b_2 = _e183;
    let _e185 = i_3;
    if (_e185 < 1f) {
        {
            let _e190 = global.uPal[0];
            a_2 = _e190;
            let _e193 = global.uPal[1];
            b_2 = _e193;
        }
    } else {
        let _e194 = i_3;
        if (_e194 < 2f) {
            {
                let _e199 = global.uPal[1];
                a_2 = _e199;
                let _e202 = global.uPal[2];
                b_2 = _e202;
            }
        } else {
            let _e203 = i_3;
            if (_e203 < 3f) {
                {
                    let _e208 = global.uPal[2];
                    a_2 = _e208;
                    let _e211 = global.uPal[3];
                    b_2 = _e211;
                }
            } else {
                let _e212 = i_3;
                if (_e212 < 4f) {
                    {
                        let _e217 = global.uPal[3];
                        a_2 = _e217;
                        let _e220 = global.uPal[4];
                        b_2 = _e220;
                    }
                } else {
                    {
                        let _e223 = global.uPal[4];
                        a_2 = _e223;
                        let _e226 = global.uPal[5];
                        b_2 = _e226;
                    }
                }
            }
        }
    }
    let _e227 = a_2;
    let _e228 = b_2;
    let _e229 = f_1;
    return mix(_e227, _e228, vec3(_e229));
}

fn cloudN(n: f32) -> f32 {
    var n_1: f32;

    n_1 = n;
    let _e163 = n_1;
    return (0.55f + ((_e163 - 0.682f) * 4.3f));
}

fn cloudBias(cover: f32) -> f32 {
    var cover_1: f32;

    cover_1 = cover;
    let _e162 = cover_1;
    let _e170 = cover_1;
    let _e178 = cover_1;
    return ((((_e162 - 0.5f) * 0.3f) + (0.5f * smoothstep(0.8f, 1f, _e170))) - (0.5f * (1f - smoothstep(0f, 0.2f, _e178))));
}

fn cloudFade(foot: f32, L: f32) -> f32 {
    var foot_1: f32;
    var L_1: f32;

    foot_1 = foot;
    L_1 = L;
    let _e166 = foot_1;
    let _e169 = L_1;
    return smoothstep(1f, 4f, ((_e166 * 64f) / _e169));
}

fn cloudMapSmooth(uv_5: vec2<f32>) -> vec3<f32> {
    var uv_6: vec2<f32>;
    var sz: vec2<f32>;
    var st: vec2<f32>;
    var i_4: vec2<f32>;
    var f_2: vec2<f32>;
    var f2_: vec2<f32>;
    var f3_: vec2<f32>;
    var w0_1: vec2<f32>;
    var w1_: vec2<f32>;
    var w2_: vec2<f32>;
    var w3_: vec2<f32>;
    var g0_: vec2<f32>;
    var g1_: vec2<f32>;
    var h0_: vec2<f32>;
    var h1_: vec2<f32>;

    uv_6 = uv_5;
    let _e163 = textureDimensions(tCloudMapTexture, 0i);
    sz = vec2<f32>(vec2<i32>(_e163));
    let _e167 = uv_6;
    let _e168 = sz;
    st = ((_e167 * _e168) - vec2(0.5f));
    let _e174 = st;
    i_4 = floor(_e174);
    let _e177 = st;
    let _e178 = i_4;
    f_2 = (_e177 - _e178);
    let _e181 = f_2;
    let _e182 = f_2;
    f2_ = (_e181 * _e182);
    let _e185 = f2_;
    let _e186 = f_2;
    f3_ = (_e185 * _e186);
    let _e191 = f_2;
    let _e196 = f2_;
    let _e199 = f3_;
    w0_1 = ((((vec2(1f) - (3f * _e191)) + (3f * _e196)) - _e199) / vec2(6f));
    let _e207 = f2_;
    let _e212 = f3_;
    w1_ = (((vec2(4f) - (6f * _e207)) + (3f * _e212)) / vec2(6f));
    let _e221 = f_2;
    let _e226 = f2_;
    let _e230 = f3_;
    w2_ = ((((vec2(1f) + (3f * _e221)) + (3f * _e226)) - (3f * _e230)) / vec2(6f));
    let _e237 = f3_;
    w3_ = (_e237 / vec2(6f));
    let _e242 = w0_1;
    let _e243 = w1_;
    g0_ = (_e242 + _e243);
    let _e246 = w2_;
    let _e247 = w3_;
    g1_ = (_e246 + _e247);
    let _e250 = i_4;
    let _e254 = w1_;
    let _e255 = g0_;
    let _e258 = sz;
    h0_ = (((_e250 - vec2(0.5f)) + (_e254 / _e255)) / _e258);
    let _e261 = i_4;
    let _e265 = w3_;
    let _e266 = g1_;
    let _e269 = sz;
    h1_ = (((_e261 + vec2(1.5f)) + (_e265 / _e266)) / _e269);
    let _e272 = g0_;
    let _e274 = g0_;
    let _e276 = h0_;
    let _e278 = textureSampleLevel(tCloudMapTexture, tCloudMapSampler, _e276, 0f);
    let _e281 = g1_;
    let _e283 = h1_;
    let _e285 = h0_;
    let _e289 = textureSampleLevel(tCloudMapTexture, tCloudMapSampler, vec2<f32>(_e283.x, _e285.y), 0f);
    let _e294 = g1_;
    let _e296 = g0_;
    let _e298 = h0_;
    let _e300 = h1_;
    let _e304 = textureSampleLevel(tCloudMapTexture, tCloudMapSampler, vec2<f32>(_e298.x, _e300.y), 0f);
    let _e307 = g1_;
    let _e309 = h1_;
    let _e311 = textureSampleLevel(tCloudMapTexture, tCloudMapSampler, _e309, 0f);
    return ((_e272.y * ((_e274.x * _e278.xyz) + (_e281.x * _e289.xyz))) + (_e294.y * ((_e296.x * _e304.xyz) + (_e307.x * _e311.xyz))));
}

fn cloudClimate(dirF: vec3<f32>) -> f32 {
    var dirF_1: vec3<f32>;
    var lat: f32;
    var cm: vec3<f32>;

    dirF_1 = dirF;
    let _e162 = dirF_1;
    lat = asin(clamp(_e162.y, -1f, 1f));
    let _e170 = global.uCloudMapMean;
    if (_e170 <= 0f) {
        let _e174 = lat;
        return (0.12f * cos((abs(_e174) * 6f)));
    }
    let _e180 = dirF_1;
    let _e182 = dirF_1;
    let _e189 = lat;
    let _e195 = cloudMapSmooth(vec2<f32>(((atan2(_e180.z, _e182.x) / 6.2832f) + 0.5f), ((_e189 / 3.14159f) + 0.5f)));
    cm = _e195;
    let _e197 = cm;
    let _e199 = cm;
    let _e203 = global.uCloudYear;
    let _e207 = cm;
    let _e211 = global.uCloudYear;
    let _e215 = global.uCloudMapMean;
    return ((((_e197.x + ((_e199.y - 0.5f) * _e203.x)) + ((_e207.z - 0.5f) * _e211.y)) - _e215) * 0.8f);
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
    var local_21: f32;
    var a_3: f32;
    var local_22: f32;
    var b_3: f32;
    var spread: f32;

    q_1 = q;
    foot_3 = foot_2;
    bias_1 = bias;
    clim_1 = clim;
    let _e168 = global.uRadius;
    L0_ = (_e168 * 1f);
    let _e172 = global.uRadius;
    L1_ = (_e172 * 0.236f);
    let _e176 = foot_3;
    let _e177 = L0_;
    let _e178 = cloudFade(_e176, _e177);
    f0_ = _e178;
    let _e180 = foot_3;
    let _e181 = L1_;
    let _e182 = cloudFade(_e180, _e181);
    f1_ = _e182;
    let _e184 = q_1;
    qz = (_e184 * vec3<f32>(0.5f, 1f, 0.5f));
    let _e191 = f0_;
    if (_e191 > 0.999f) {
        local_21 = 0.682f;
    } else {
        let _e195 = qz;
        let _e196 = L0_;
        let _e200 = textureSampleLevel(tNoiseTexture, tNoiseSampler, (_e195 / vec3(_e196)), 0f);
        let _e203 = f0_;
        local_21 = mix(_e200.x, 0.682f, _e203);
    }
    let _e206 = local_21;
    a_3 = _e206;
    let _e208 = f1_;
    if (_e208 > 0.999f) {
        local_22 = 0.682f;
    } else {
        let _e212 = qz;
        let _e213 = L1_;
        let _e220 = textureSampleLevel(tNoiseTexture, tNoiseSampler, ((_e212 / vec3(_e213)) + vec3(0.5f)), 0f);
        let _e223 = f1_;
        local_22 = mix(_e220.x, 0.682f, _e223);
    }
    let _e226 = local_22;
    b_3 = _e226;
    let _e229 = f0_;
    let _e232 = f1_;
    spread = length(vec2<f32>((0.124f * _e229), (0.083f * _e232)));
    let _e238 = bias_1;
    let _e240 = spread;
    let _e243 = bias_1;
    let _e245 = spread;
    let _e247 = a_3;
    let _e250 = b_3;
    let _e254 = cloudN(((_e247 * 0.6f) + (_e250 * 0.4f)));
    let _e255 = clim_1;
    return smoothstep(((0.6f - _e238) - _e240), ((0.8f - _e243) + _e245), (_e254 + _e255));
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
    let _e168 = q_3;
    let _e169 = foot_5;
    let _e170 = bias_3;
    let _e171 = dirF_3;
    let _e172 = cloudClimate(_e171);
    let _e173 = cloudCoverC(_e168, _e169, _e170, _e172);
    return _e173;
}

fn cloudDetail(q_4: vec3<f32>, foot_6: f32) -> f32 {
    var q_5: vec3<f32>;
    var foot_7: f32;
    var L2_: f32;
    var f_3: f32;
    var local_23: f32;

    q_5 = q_4;
    foot_7 = foot_6;
    let _e164 = global.uRadius;
    L2_ = (_e164 * 0.064f);
    let _e168 = foot_7;
    let _e169 = L2_;
    let _e170 = cloudFade(_e168, _e169);
    f_3 = _e170;
    let _e172 = f_3;
    if (_e172 > 0.999f) {
        local_23 = 0.682f;
    } else {
        let _e176 = q_5;
        let _e177 = L2_;
        let _e181 = textureSampleLevel(tNoiseTexture, tNoiseSampler, (_e176 / vec3(_e177)), 0f);
        let _e184 = f_3;
        local_23 = mix(_e181.x, 0.682f, _e184);
    }
    let _e187 = local_23;
    return _e187;
}

fn cloudGens(dirF_4: vec3<f32>, gA: ptr<function, vec3<f32>>, gB: ptr<function, vec3<f32>>) {
    var dirF_5: vec3<f32>;
    var T_3: f32;
    var ph: f32;
    var s_2: f32;
    var a_4: f32;
    var fa: f32;
    var b_4: f32;
    var fb: f32;
    var j_1: f32;
    var fj_1: f32;
    var wa: f32;

    dirF_5 = dirF_4;
    let _e164 = global.uCloudClock;
    T_3 = _e164.z;
    let _e167 = T_3;
    if (_e167 <= 0f) {
        {
            (*gA) = vec3<f32>(1f, 0f, 0f);
            (*gB) = vec3(0f);
            return;
        }
    }
    let _e177 = dirF_5;
    let _e181 = dirF_5;
    let _e186 = dirF_5;
    let _e192 = dirF_5;
    let _e196 = dirF_5;
    let _e201 = dirF_5;
    ph = ((((1.1f * _e177.x) + (0.7f * _e181.z)) - (0.5f * _e186.y)) + (0.35f * sin((((2.3f * _e192.y) + (1.7f * _e196.x)) - (0.9f * _e201.z)))));
    let _e209 = global.uCloudClock;
    let _e211 = T_3;
    let _e213 = ph;
    s_2 = (((_e209.x / _e211) + _e213) + 4f);
    let _e218 = s_2;
    a_4 = floor(_e218);
    let _e221 = s_2;
    let _e222 = a_4;
    fa = (_e221 - _e222);
    let _e225 = s_2;
    b_4 = floor((_e225 + 0.5f));
    let _e230 = s_2;
    let _e233 = b_4;
    fb = ((_e230 + 0.5f) - _e233);
    let _e237 = dirF_5;
    let _e247 = dirF_5;
    let _e259 = dirF_5;
    j_1 = (0.065f * ((sin((dot(_e237, vec3<f32>(5.1f, 3.7f, -4.3f)) + 1.3f)) + sin((dot(_e247, vec3<f32>(-3.9f, 7.3f, 6.1f)) + 0.4f))) + (0.6f * sin((dot(_e259, vec3<f32>(11.3f, -8.9f, 7.7f)) + 2.1f)))));
    let _e273 = s_2;
    let _e274 = j_1;
    fj_1 = fract((_e273 + _e274));
    let _e282 = fj_1;
    wa = smoothstep(0.4f, 0.6f, (1f - abs(((2f * _e282) - 1f))));
    let _e290 = wa;
    let _e291 = fa;
    let _e294 = T_3;
    let _e297 = global.uCloudClock;
    let _e299 = a_4;
    (*gA) = vec3<f32>(_e290, ((_e291 - 0.5f) * _e294), (2f * (_e297.y + _e299)));
    let _e304 = wa;
    let _e306 = fb;
    let _e309 = T_3;
    let _e312 = global.uCloudClock;
    let _e314 = b_4;
    (*gB) = vec3<f32>((1f - _e304), ((_e306 - 0.5f) * _e309), ((2f * (_e312.y + _e314)) + 1f));
    return;
}

fn cloudGenOff(idx: f32) -> vec3<f32> {
    var idx_1: f32;
    var h_6: u32;

    idx_1 = idx;
    let _e162 = idx_1;
    h_6 = (u32(_e162) * 2654435761u);
    let _e167 = h_6;
    let _e168 = h_6;
    h_6 = (_e167 ^ (_e168 >> 15u));
    let _e172 = h_6;
    h_6 = (_e172 * 2246822519u);
    let _e175 = h_6;
    let _e176 = h_6;
    h_6 = (_e175 ^ (_e176 >> 13u));
    let _e180 = h_6;
    let _e184 = h_6;
    let _e190 = h_6;
    return (((vec3<f32>(f32((_e180 & 1023u)), f32(((_e184 >> 10u) & 1023u)), f32(((_e190 >> 20u) & 1023u))) / vec3(1024f)) - vec3(0.5f)) * 400000f);
}

fn cloudAdvect(pf_2: vec3<f32>, dirF_6: vec3<f32>, g_7: vec3<f32>) -> vec3<f32> {
    var pf_3: vec3<f32>;
    var dirF_7: vec3<f32>;
    var g_8: vec3<f32>;
    var lat_1: f32;
    var U: f32;
    var east: vec3<f32>;

    pf_3 = pf_2;
    dirF_7 = dirF_6;
    g_8 = g_7;
    let _e166 = dirF_7;
    lat_1 = asin(clamp(_e166.y, -1f, 1f));
    let _e174 = global.uCloudWind;
    let _e176 = lat_1;
    let _e177 = global.uCloudWind;
    let _e182 = global.uCloudWind;
    let _e188 = global.uCloudWind;
    let _e190 = lat_1;
    let _e192 = lat_1;
    U = (_e174.x * (sin((((_e176 * _e177.y) * 2f) + (_e182.z * 6.2832f))) + (_e188.w * exp(((-(_e190) * _e192) * 40f)))));
    let _e201 = dirF_7;
    let _e205 = dirF_7;
    east = normalize((vec3<f32>(-(_e201.z), 0f, _e205.x) + vec3<f32>(0.000001f, 0f, 0f)));
    let _e215 = pf_3;
    let _e216 = east;
    let _e217 = U;
    let _e219 = g_8;
    let _e223 = g_8;
    let _e225 = cloudGenOff(_e223.z);
    return ((_e215 + ((_e216 * _e217) * _e219.y)) + _e225);
}

fn cloudCoverG(pf_4: vec3<f32>, dirF_8: vec3<f32>, foot_8: f32, bias_4: f32) -> f32 {
    var pf_5: vec3<f32>;
    var dirF_9: vec3<f32>;
    var foot_9: f32;
    var bias_5: f32;
    var gA_1: vec3<f32>;
    var gB_1: vec3<f32>;
    var c_12: f32 = 0f;
    var clim_2: f32;

    pf_5 = pf_4;
    dirF_9 = dirF_8;
    foot_9 = foot_8;
    bias_5 = bias_4;
    let _e170 = dirF_9;
    cloudGens(_e170, (&gA_1), (&gB_1));
    let _e177 = dirF_9;
    let _e178 = cloudClimate(_e177);
    clim_2 = _e178;
    let _e180 = gA_1;
    if (_e180.x > 0.005f) {
        let _e184 = c_12;
        let _e185 = gA_1;
        let _e187 = pf_5;
        let _e188 = dirF_9;
        let _e189 = gA_1;
        let _e190 = cloudAdvect(_e187, _e188, _e189);
        let _e191 = foot_9;
        let _e192 = bias_5;
        let _e193 = clim_2;
        let _e194 = cloudCoverC(_e190, _e191, _e192, _e193);
        c_12 = (_e184 + (_e185.x * _e194));
    }
    let _e197 = gB_1;
    if (_e197.x > 0.005f) {
        let _e201 = c_12;
        let _e202 = gB_1;
        let _e204 = pf_5;
        let _e205 = dirF_9;
        let _e206 = gB_1;
        let _e207 = cloudAdvect(_e204, _e205, _e206);
        let _e208 = foot_9;
        let _e209 = bias_5;
        let _e210 = clim_2;
        let _e211 = cloudCoverC(_e207, _e208, _e209, _e210);
        c_12 = (_e201 + (_e202.x * _e211));
    }
    let _e214 = c_12;
    return _e214;
}

fn coverage(i_5: i32, dirF_10: vec3<f32>, q_6: vec3<f32>, foot_10: f32, clim_3: f32) -> f32 {
    var i_6: i32;
    var dirF_11: vec3<f32>;
    var q_7: vec3<f32>;
    var foot_11: f32;
    var clim_4: f32;
    var lat_2: f32;
    var band_1: f32;
    var n_2: f32;

    i_6 = i_5;
    dirF_11 = dirF_10;
    q_7 = q_6;
    foot_11 = foot_10;
    clim_4 = clim_3;
    let _e170 = dirF_11;
    lat_2 = asin(clamp(_e170.y, -1f, 1f));
    let _e178 = global.uMode;
    if (_e178 < 0.5f) {
        {
            let _e181 = lat_2;
            let _e182 = global.uBands;
            let _e186 = global.uJetPhase;
            let _e191 = lat_2;
            let _e192 = global.uBands;
            band_1 = sin(((((_e181 * _e182) * 2f) + (_e186 * 6.2832f)) + (0.6f * sin(((_e191 * _e192) * 0.7f)))));
            let _e201 = q_7;
            let _e206 = textureSampleLevel(tNoiseTexture, tNoiseSampler, (_e201 / vec3(70000f)), 0f);
            n_2 = (_e206.x - 0.5f);
            let _e211 = i_6;
            if (_e211 == 0i) {
                let _e217 = band_1;
                let _e220 = n_2;
                let _e226 = global.uDeck[0];
                return smoothstep(-0.1f, 0.7f, (((_e217 * 0.8f) + (_e220 * 1.3f)) + _e226.w));
            }
            let _e230 = i_6;
            if (_e230 == 1i) {
                let _e236 = n_2;
                let _e243 = global.uDeck[1];
                return smoothstep(-0.45f, 0.45f, (((_e236 * 1.5f) + 0.1f) + _e243.w));
            }
            let _e249 = q_7;
            let _e257 = textureSampleLevel(tNoiseTexture, tNoiseSampler, ((_e249 / vec3(42000f)) + vec3(0.37f)), 0f);
            let _e261 = global.uDeck[2];
            return smoothstep(0.2f, 0.62f, (_e257.y + _e261.w));
        }
    }
    let _e265 = q_7;
    let _e266 = foot_11;
    let _e267 = i_6;
    let _e269 = global.uDeck[_e267];
    let _e271 = clim_4;
    let _e272 = cloudCoverC(_e265, _e266, _e269.w, _e271);
    return _e272;
}

fn deckDensity(i_7: i32, q_8: vec3<f32>, h_7: f32, cov: f32, detail: bool, frac: ptr<function, f32>) -> f32 {
    var i_8: i32;
    var q_9: vec3<f32>;
    var h_8: f32;
    var cov_1: f32;
    var detail_1: bool;
    var dk: vec4<f32>;
    var raw: f32;
    var base: f32;
    var tower: f32;
    var top_2: f32;
    var x_1: f32;
    var e_3: f32;
    var xt: f32;
    var prof_1: f32;
    var d_9: f32;
    var det: vec4<f32>;
    var er: f32;

    i_8 = i_7;
    q_9 = q_8;
    h_8 = h_7;
    cov_1 = cov;
    detail_1 = detail;
    let _e172 = i_8;
    let _e174 = global.uDeck[_e172];
    dk = _e174;
    let _e176 = q_9;
    let _e177 = global.uShape;
    let _e182 = textureSampleLevel(tNoiseTexture, tNoiseSampler, (_e176 / vec3(_e177.x)), 0f);
    raw = _e182.x;
    let _e187 = raw;
    let _e189 = raw;
    let _e190 = gDeckFoot;
    let _e191 = global.uShape;
    let _e193 = cloudFade(_e190, _e191.x);
    base = mix(smoothstep(0.58f, 0.78f, _e187), _e189, _e193);
    let _e196 = q_9;
    let _e197 = global.uShape;
    let _e207 = textureSampleLevel(tNoiseTexture, tNoiseSampler, ((_e196 / vec3((_e197.x * 4f))) + vec3(0.21f)), 0f);
    tower = _e207.y;
    let _e210 = dk;
    let _e212 = dk;
    let _e214 = dk;
    let _e220 = tower;
    top_2 = (_e210.y - (((_e212.y - _e214.x) * 0.55f) * (1f - _e220)));
    let _e225 = h_8;
    let _e226 = dk;
    let _e229 = top_2;
    let _e230 = dk;
    x_1 = ((_e225 - _e226.x) / max((_e229 - _e230.x), 1f));
    let _e237 = x_1;
    (*frac) = clamp(_e237, 0f, 1f);
    let _e241 = x_1;
    let _e244 = x_1;
    if ((_e241 < 0f) || (_e244 > 1f)) {
        return 0f;
    }
    let _e249 = base;
    let _e251 = cov_1;
    let _e254 = cov_1;
    e_3 = clamp(((_e249 - (1f - _e251)) / max(_e254, 0.05f)), 0f, 1f);
    let _e262 = e_3;
    xt = sqrt(_e262);
    let _e265 = x_1;
    let _e266 = xt;
    if (_e265 > _e266) {
        return 0f;
    }
    let _e271 = x_1;
    let _e275 = xt;
    let _e277 = xt;
    let _e278 = x_1;
    prof_1 = (smoothstep(0f, 0.08f, _e271) * (1f - smoothstep((0.6f * _e275), _e277, _e278)));
    let _e283 = e_3;
    let _e284 = prof_1;
    d_9 = (_e283 * _e284);
    let _e287 = detail_1;
    let _e288 = d_9;
    if (_e287 && (_e288 > 0.001f)) {
        {
            let _e292 = q_9;
            let _e293 = global.uShape;
            let _e298 = textureSampleLevel(tNoiseTexture, tNoiseSampler, (_e292 / vec3(_e293.y)), 0f);
            det = _e298;
            let _e300 = det;
            let _e304 = det;
            let _e309 = det;
            let _e317 = d_9;
            er = (((((_e300.y * 0.625f) + (_e304.z * 0.25f)) + (_e309.w * 0.125f)) * 0.55f) * (1f - _e317));
            let _e321 = d_9;
            let _e322 = er;
            let _e325 = er;
            d_9 = clamp(((_e321 - _e322) / max((1f - _e325), 0.05f)), 0f, 1f);
        }
    }
    let _e333 = d_9;
    let _e334 = dk;
    return (_e333 * _e334.z);
}

fn deckCovG(i_9: i32, pf_6: vec3<f32>, dirF_12: vec3<f32>, foot_12: f32, gA_2: vec3<f32>, gB_2: vec3<f32>, clim_5: f32) -> vec2<f32> {
    var i_10: i32;
    var pf_7: vec3<f32>;
    var dirF_13: vec3<f32>;
    var foot_13: f32;
    var gA_3: vec3<f32>;
    var gB_3: vec3<f32>;
    var clim_6: f32;
    var local_24: f32;
    var local_25: f32;

    i_10 = i_9;
    pf_7 = pf_6;
    dirF_13 = dirF_12;
    foot_13 = foot_12;
    gA_3 = gA_2;
    gB_3 = gB_2;
    clim_6 = clim_5;
    let _e175 = gA_3;
    if (_e175.x > 0.005f) {
        let _e179 = i_10;
        let _e180 = dirF_13;
        let _e181 = pf_7;
        let _e182 = dirF_13;
        let _e183 = gA_3;
        let _e184 = cloudAdvect(_e181, _e182, _e183);
        let _e185 = foot_13;
        let _e186 = clim_6;
        let _e187 = coverage(_e179, _e180, _e184, _e185, _e186);
        local_24 = _e187;
    } else {
        local_24 = 0f;
    }
    let _e190 = local_24;
    let _e191 = gB_3;
    if (_e191.x > 0.005f) {
        let _e195 = i_10;
        let _e196 = dirF_13;
        let _e197 = pf_7;
        let _e198 = dirF_13;
        let _e199 = gB_3;
        let _e200 = cloudAdvect(_e197, _e198, _e199);
        let _e201 = foot_13;
        let _e202 = clim_6;
        let _e203 = coverage(_e195, _e196, _e200, _e201, _e202);
        local_25 = _e203;
    } else {
        local_25 = 0f;
    }
    let _e206 = local_25;
    return vec2<f32>(_e190, _e206);
}

fn deckDenG(i_11: i32, pf_8: vec3<f32>, dirF_14: vec3<f32>, h_9: f32, cv: vec2<f32>, gA_4: vec3<f32>, gB_4: vec3<f32>, detail_2: bool, frac_1: ptr<function, f32>) -> f32 {
    var i_12: i32;
    var pf_9: vec3<f32>;
    var dirF_15: vec3<f32>;
    var h_10: f32;
    var cv_1: vec2<f32>;
    var gA_5: vec3<f32>;
    var gB_5: vec3<f32>;
    var detail_3: bool;
    var d_10: f32 = 0f;
    var fa_1: f32 = 0.5f;
    var fb_1: f32 = 0.5f;
    var local_26: f32;

    i_12 = i_11;
    pf_9 = pf_8;
    dirF_15 = dirF_14;
    h_10 = h_9;
    cv_1 = cv;
    gA_5 = gA_4;
    gB_5 = gB_4;
    detail_3 = detail_2;
    let _e184 = gA_5;
    if (_e184.x > 0.005f) {
        let _e188 = d_10;
        let _e189 = gA_5;
        let _e191 = i_12;
        let _e192 = pf_9;
        let _e193 = dirF_15;
        let _e194 = gA_5;
        let _e195 = cloudAdvect(_e192, _e193, _e194);
        let _e196 = h_10;
        let _e197 = cv_1;
        let _e199 = detail_3;
        let _e202 = deckDensity(_e191, _e195, _e196, _e197.x, _e199, (&fa_1));
        d_10 = (_e188 + (_e189.x * _e202));
    }
    let _e205 = gB_5;
    if (_e205.x > 0.005f) {
        let _e209 = d_10;
        let _e210 = gB_5;
        let _e212 = i_12;
        let _e213 = pf_9;
        let _e214 = dirF_15;
        let _e215 = gB_5;
        let _e216 = cloudAdvect(_e213, _e214, _e215);
        let _e217 = h_10;
        let _e218 = cv_1;
        let _e220 = detail_3;
        let _e223 = deckDensity(_e212, _e216, _e217, _e218.y, _e220, (&fb_1));
        d_10 = (_e209 + (_e210.x * _e223));
    }
    let _e226 = gA_5;
    let _e228 = gB_5;
    if (_e226.x >= _e228.x) {
        let _e231 = fa_1;
        local_26 = _e231;
    } else {
        let _e232 = fb_1;
        local_26 = _e232;
    }
    let _e234 = local_26;
    (*frac_1) = _e234;
    let _e235 = d_10;
    return _e235;
}

fn main_1() {
    var px: vec2<i32>;
    var ndc: vec2<f32>;
    var dView: vec3<f32>;
    var D_4: vec3<f32>;
    var depth: f32;
    var local_27: f32;
    var sceneDist: f32;
    var hit: vec2<f32>;
    var skyPx: bool;
    var local_28: f32;
    var tca_3: f32;
    var perp_3: vec3<f32>;
    var t0_: f32;
    var t1_: f32;
    var gh: vec2<f32>;
    var sb: f32 = 1000000000f;
    var st_1: f32 = -1000000000f;
    var i_13: i32 = 0i;
    var rB: f32;
    var rT: f32;
    var camR: f32;
    var hT_2: vec2<f32>;
    var hB: vec2<f32>;
    var tIn: f32;
    var tOut: f32;
    var hasB: bool;
    var local_29: f32;
    var local_30: f32;
    var local_31: f32;
    var cosT: f32;
    var pR: f32;
    var pM: vec3<f32>;
    var pC: f32;
    var moon: bool;
    var cosM: f32;
    var pRm: f32;
    var pCm: f32;
    var pMm: vec3<f32>;
    var Lm: vec3<f32> = vec3(0f);
    var jitter_2: f32;
    var L_2: vec3<f32> = vec3(0f);
    var T_4: vec3<f32> = vec3(1f);
    var Lth: vec3<f32> = vec3(0f);
    var Tc: f32 = 1f;
    var sunDirF: vec3<f32>;
    var upC_2: vec3<f32>;
    var kT: f32;
    var seg: i32 = 0i;
    var local_32: f32;
    var local_33: f32;
    var a_5: f32;
    var local_34: f32;
    var local_35: f32;
    var b_5: f32;
    var local_36: i32;
    var N: i32;
    var dt: f32;
    var sq: bool;
    var i_14: i32;
    var t_5: f32;
    var dti: f32;
    var u: f32;
    var p_7: vec3<f32>;
    var r_20: f32;
    var h_11: f32;
    var sR: vec3<f32>;
    var sM: vec3<f32>;
    var e_4: vec3<f32>;
    var nT: vec3<f32>;
    var muS_2: f32;
    var ext_2: vec3<f32>;
    var tauAbove: f32;
    var tauBelow: f32;
    var tlS: f32;
    var cd: f32;
    var frac_2: f32;
    var cc: vec3<f32>;
    var pf_10: vec3<f32>;
    var dirF_16: vec3<f32>;
    var gA_6: vec3<f32>;
    var gB_6: vec3<f32>;
    var lat_3: f32;
    var local_37: f32;
    var clim_7: f32;
    var k_4: i32;
    var dk_1: vec4<f32>;
    var cv_2: vec2<f32>;
    var cov_2: f32;
    var fr: f32;
    var d_11: f32;
    var tl: f32;
    var ds: f32;
    var sl: f32;
    var ps: vec3<f32>;
    var j_2: i32;
    var hs: f32;
    var frs: f32;
    var tauV: f32;
    var muT: f32;
    var fromAbove: f32;
    var tauSun: f32;
    var shade: f32;
    var sunT: vec3<f32>;
    var ms: vec3<f32>;
    var S: vec3<f32>;
    var dif: f32;
    var Sm: vec3<f32>;
    var mT: vec3<f32>;
    var mms: vec3<f32>;
    var mT0_: vec3<f32>;
    var muM: f32;
    var shM: f32;
    var difM: f32;
    var sc: f32;
    var amb: vec3<f32>;
    var powder: f32;
    var fd: vec3<f32>;
    var Ts: vec3<f32>;
    var te: f32;
    var pe: vec3<f32>;
    var aNear: vec3<f32>;
    var aFar: vec3<f32>;
    var local_38: vec3<f32>;
    var far_1: vec3<f32>;

    let _e161 = vUv_1;
    let _e162 = depthPixel(_e161);
    px = _e162;
    let _e164 = px;
    let _e170 = textureDimensions(tDepthTexture, 0i);
    ndc = ((((vec2<f32>(_e164) + vec2(0.5f)) / vec2<f32>(vec2<i32>(_e170))) * 2f) - vec2(1f));
    let _e181 = ndc;
    ndc.y = -(_e181.y);
    let _e184 = ndc;
    let _e186 = global.uTanHalf;
    let _e189 = ndc;
    let _e191 = global.uTanHalf;
    dView = normalize(vec3<f32>((_e184.x * _e186.x), (_e189.y * _e191.y), -1f));
    let _e199 = global.uCamRot;
    let _e200 = dView;
    D_4 = normalize((_e199 * _e200));
    let _e204 = D_4;
    let _e205 = fwidth(_e204);
    gPixA = length(_e205);
    let _e207 = px;
    let _e209 = textureLoad(tDepthTexture, _e207, 0i);
    depth = _e209.x;
    let _e212 = depth;
    let _e213 = isSkyDepth(_e212);
    if _e213 {
        local_27 = 1000000000000000000000000000000f;
    } else {
        let _e215 = depth;
        let _e216 = viewZFromDepth(_e215);
        let _e217 = dView;
        local_27 = (_e216 / max(-(_e217.z), 0.0001f));
    }
    let _e224 = local_27;
    sceneDist = _e224;
    let _e226 = global.uCenter;
    let _e227 = global.uTop;
    let _e228 = D_4;
    let _e229 = raySphere(_e226, _e227, _e228);
    hit = _e229;
    let _e231 = hit;
    let _e235 = hit;
    let _e237 = hit;
    if ((_e231.y <= 0f) || (_e235.x > _e237.y)) {
        {
            outL = vec4(0f);
            outT = vec4(1f);
            return;
        }
    }
    let _e245 = sceneDist;
    let _e248 = sceneDist;
    let _e249 = hit;
    skyPx = ((_e245 > 100000000000000000000000000000f) || (_e248 > _e249.y));
    let _e254 = skyPx;
    if _e254 {
        let _e256 = global.uSkyView;
        local_28 = (1f - _e256.x);
    } else {
        local_28 = 1f;
    }
    let _e261 = local_28;
    gHazeK = _e261;
    let _e262 = gHazeK;
    gAirSun = _e262;
    let _e263 = global.uCenter;
    let _e264 = D_4;
    tca_3 = dot(_e263, _e264);
    let _e267 = global.uCenter;
    let _e268 = tca_3;
    let _e269 = D_4;
    perp_3 = (_e267 - (_e268 * _e269));
    let _e273 = hit;
    t0_ = max(_e273.x, 0f);
    let _e278 = hit;
    let _e280 = sceneDist;
    let _e282 = t0_;
    let _e283 = global.uMaxDist;
    t1_ = min(min(_e278.y, _e280), (_e282 + (_e283 * 4f)));
    let _e289 = global.uCenter;
    let _e290 = global.uGround;
    let _e291 = D_4;
    let _e292 = raySphere(_e289, _e290, _e291);
    gh = _e292;
    let _e294 = gh;
    let _e298 = gh;
    let _e300 = gh;
    let _e304 = gh;
    if (((_e294.y > 0f) && (_e298.x < _e300.y)) && (_e304.x > 0f)) {
        let _e309 = t1_;
        let _e310 = gh;
        t1_ = min(_e309, _e310.x);
    }
    loop {
        let _e320 = i_13;
        if !((_e320 < 3i)) {
            break;
        }
        {
            let _e327 = i_13;
            let _e329 = global.uNumDecks;
            if (f32(_e327) >= _e329) {
                break;
            }
            let _e331 = sb;
            let _e332 = i_13;
            let _e334 = global.uDeck[_e332];
            sb = min(_e331, _e334.x);
            let _e337 = st_1;
            let _e338 = i_13;
            let _e340 = global.uDeck[_e338];
            st_1 = max(_e337, _e340.y);
        }
        continuing {
            let _e324 = i_13;
            i_13 = (_e324 + 1i);
        }
    }
    let _e343 = global.uRadius;
    let _e344 = sb;
    rB = (_e343 + _e344);
    let _e347 = global.uRadius;
    let _e348 = st_1;
    rT = (_e347 + _e348);
    let _e351 = global.uCenter;
    camR = length(_e351);
    let _e354 = global.uCenter;
    let _e355 = rT;
    let _e356 = D_4;
    let _e357 = raySphere(_e354, _e355, _e356);
    hT_2 = _e357;
    let _e359 = global.uCenter;
    let _e360 = rB;
    let _e361 = D_4;
    let _e362 = raySphere(_e359, _e360, _e361);
    hB = _e362;
    let _e366 = hB;
    let _e370 = hB;
    let _e372 = hB;
    hasB = ((_e366.y > 0f) && (_e370.x < _e372.y));
    let _e377 = camR;
    let _e378 = rT;
    if (_e377 > _e378) {
        {
            let _e380 = hT_2;
            tIn = _e380.x;
            let _e382 = hasB;
            let _e383 = hB;
            if (_e382 && (_e383.x > 0f)) {
                let _e388 = hB;
                local_29 = _e388.x;
            } else {
                let _e390 = hT_2;
                local_29 = _e390.y;
            }
            let _e393 = local_29;
            tOut = _e393;
        }
    } else {
        let _e394 = camR;
        let _e395 = rB;
        if (_e394 > _e395) {
            {
                tIn = 0f;
                let _e398 = hasB;
                let _e399 = hB;
                if (_e398 && (_e399.x > 0f)) {
                    let _e404 = hB;
                    local_30 = _e404.x;
                } else {
                    let _e406 = hT_2;
                    local_30 = _e406.y;
                }
                let _e409 = local_30;
                tOut = _e409;
            }
        } else {
            {
                let _e410 = hasB;
                if _e410 {
                    let _e411 = hB;
                    local_31 = _e411.y;
                } else {
                    local_31 = 1000000000000000000000000000000f;
                }
                let _e415 = local_31;
                tIn = _e415;
                let _e416 = hT_2;
                tOut = _e416.y;
            }
        }
    }
    let _e418 = hT_2;
    let _e422 = hT_2;
    let _e424 = hT_2;
    if ((_e418.y <= 0f) || (_e422.x > _e424.y)) {
        {
            tIn = 1000000000000000000000000000000f;
            tOut = 1000000000000000000000000000000f;
        }
    }
    let _e430 = tIn;
    let _e431 = t0_;
    let _e432 = t1_;
    tIn = clamp(_e430, _e431, _e432);
    let _e434 = tOut;
    let _e435 = tIn;
    let _e436 = global.uMaxDist;
    let _e439 = tIn;
    let _e440 = t1_;
    tOut = clamp(min(_e434, (_e435 + _e436)), _e439, _e440);
    let _e442 = D_4;
    let _e443 = global.uSunDir;
    cosT = dot(_e442, _e443);
    let _e446 = cosT;
    let _e447 = phaseRayleigh(_e446);
    pR = _e447;
    let _e449 = cosT;
    let _e450 = phaseMie(_e449);
    pM = _e450;
    let _e452 = cosT;
    let _e454 = hg(_e452, 0.62f);
    let _e455 = cosT;
    let _e458 = hg(_e455, -0.22f);
    pC = mix(_e454, _e458, 0.3f);
    let _e462 = global.uMoonE;
    moon = (_e462.y > 0f);
    let _e467 = D_4;
    let _e468 = global.uMoonDir;
    cosM = dot(_e467, _e468);
    let _e471 = cosM;
    let _e472 = phaseRayleigh(_e471);
    pRm = _e472;
    let _e474 = cosM;
    let _e476 = hg(_e474, 0.62f);
    let _e477 = cosM;
    let _e480 = hg(_e477, -0.22f);
    pCm = mix(_e476, _e480, 0.3f);
    let _e484 = cosM;
    let _e485 = phaseMie(_e484);
    pMm = _e485;
    let _e491 = gl_FragCoord_1;
    let _e493 = ign(_e491.xy);
    jitter_2 = _e493;
    let _e506 = global.uToFixed;
    let _e507 = global.uSunDir;
    sunDirF = (_e506 * _e507);
    let _e510 = global.uCenter;
    upC_2 = normalize(-(_e510));
    let _e514 = global.uCenter;
    let _e516 = global.uRadius;
    let _e518 = trueK((length(_e514) - _e516));
    kT = _e518;
    loop {
        let _e522 = seg;
        if !((_e522 < 3i)) {
            break;
        }
        {
            let _e529 = seg;
            if (_e529 == 0i) {
                let _e532 = t0_;
                local_33 = _e532;
            } else {
                let _e533 = seg;
                if (_e533 == 1i) {
                    let _e536 = tIn;
                    local_32 = _e536;
                } else {
                    let _e537 = tOut;
                    local_32 = _e537;
                }
                let _e539 = local_32;
                local_33 = _e539;
            }
            let _e541 = local_33;
            a_5 = _e541;
            let _e543 = seg;
            if (_e543 == 0i) {
                let _e546 = tIn;
                local_35 = _e546;
            } else {
                let _e547 = seg;
                if (_e547 == 1i) {
                    let _e550 = tOut;
                    local_34 = _e550;
                } else {
                    let _e551 = t1_;
                    local_34 = _e551;
                }
                let _e553 = local_34;
                local_35 = _e553;
            }
            let _e555 = local_35;
            b_5 = _e555;
            let _e557 = b_5;
            let _e558 = a_5;
            if (_e557 <= (_e558 + 1f)) {
                continue;
            }
            let _e562 = seg;
            if (_e562 == 1i) {
                let _e565 = global.uSteps;
                local_36 = i32(_e565);
            } else {
                let _e567 = b_5;
                let _e568 = a_5;
                local_36 = i32(clamp((ceil(((_e567 - _e568) / 250f)) + 1f), 2f, 18f));
            }
            let _e580 = local_36;
            N = _e580;
            let _e582 = b_5;
            let _e583 = a_5;
            let _e585 = N;
            dt = ((_e582 - _e583) / f32(_e585));
            let _e589 = seg;
            let _e592 = a_5;
            let _e596 = b_5;
            let _e597 = a_5;
            sq = (((_e589 == 0i) && (_e592 < 1f)) && ((_e596 - _e597) > 4000f));
            i_14 = 0i;
            loop {
                let _e605 = i_14;
                if !((_e605 < 96i)) {
                    break;
                }
                {
                    let _e612 = i_14;
                    let _e613 = N;
                    if (_e612 >= _e613) {
                        break;
                    }
                    let _e615 = a_5;
                    let _e616 = i_14;
                    let _e618 = jitter_2;
                    let _e620 = dt;
                    t_5 = (_e615 + ((f32(_e616) + _e618) * _e620));
                    let _e624 = dt;
                    dti = _e624;
                    let _e626 = sq;
                    if _e626 {
                        {
                            let _e627 = i_14;
                            let _e629 = jitter_2;
                            let _e631 = N;
                            u = ((f32(_e627) + _e629) / f32(_e631));
                            let _e635 = a_5;
                            let _e636 = b_5;
                            let _e637 = a_5;
                            let _e639 = u;
                            let _e641 = u;
                            t_5 = (_e635 + (((_e636 - _e637) * _e639) * _e641));
                            let _e644 = b_5;
                            let _e645 = a_5;
                            let _e649 = u;
                            let _e651 = N;
                            dti = (((((_e644 - _e645) * 2f) * _e649) / f32(_e651)) + 0.001f);
                        }
                    }
                    let _e656 = t_5;
                    let _e657 = tca_3;
                    let _e659 = D_4;
                    let _e661 = perp_3;
                    p_7 = (((_e656 - _e657) * _e659) - _e661);
                    let _e664 = p_7;
                    r_20 = length(_e664);
                    let _e667 = r_20;
                    let _e668 = global.uRadius;
                    h_11 = (_e667 - _e668);
                    let _e674 = r_20;
                    mediumAt(_e674, (&sR), (&sM), (&e_4));
                    let _e681 = p_7;
                    let _e682 = r_20;
                    let _e683 = upC_2;
                    let _e684 = kT;
                    let _e685 = trueUp(_e681, _e682, _e683, _e684);
                    nT = _e685;
                    let _e687 = nT;
                    let _e688 = global.uSunDir;
                    muS_2 = dot(_e687, _e688);
                    let _e691 = e_4;
                    ext_2 = _e691;
                    tauAbove = 0f;
                    tauBelow = 0f;
                    tlS = 0f;
                    cd = 0f;
                    frac_2 = 0.5f;
                    cc = vec3(1f);
                    let _e706 = global.uToFixed;
                    let _e707 = p_7;
                    pf_10 = (_e706 * _e707);
                    let _e710 = pf_10;
                    let _e711 = r_20;
                    dirF_16 = (_e710 / vec3(_e711));
                    let _e717 = t_5;
                    let _e718 = gPixA;
                    gDeckFoot = (_e717 * _e718);
                    let _e720 = dirF_16;
                    lat_3 = asin(clamp(_e720.y, -1f, 1f));
                    let _e728 = dirF_16;
                    cloudGens(_e728, (&gA_6), (&gB_6));
                    let _e733 = global.uMode;
                    if (_e733 > 0.5f) {
                        let _e736 = dirF_16;
                        let _e737 = cloudClimate(_e736);
                        local_37 = _e737;
                    } else {
                        local_37 = 0f;
                    }
                    let _e740 = local_37;
                    clim_7 = _e740;
                    k_4 = 0i;
                    loop {
                        let _e744 = k_4;
                        if !((_e744 < 3i)) {
                            break;
                        }
                        {
                            let _e751 = k_4;
                            let _e753 = global.uNumDecks;
                            if (f32(_e751) >= _e753) {
                                break;
                            }
                            let _e755 = k_4;
                            let _e757 = global.uDeck[_e755];
                            dk_1 = _e757;
                            let _e759 = h_11;
                            let _e760 = dk_1;
                            let _e763 = muS_2;
                            let _e764 = liftMu(_e763);
                            if ((_e759 > _e760.y) && (_e764 > 0.06f)) {
                                continue;
                            }
                            let _e768 = k_4;
                            let _e769 = pf_10;
                            let _e770 = dirF_16;
                            let _e771 = t_5;
                            let _e772 = gPixA;
                            let _e774 = gA_6;
                            let _e775 = gB_6;
                            let _e776 = clim_7;
                            let _e777 = deckCovG(_e768, _e769, _e770, (_e771 * _e772), _e774, _e775, _e776);
                            cv_2 = _e777;
                            let _e779 = gA_6;
                            let _e781 = cv_2;
                            let _e784 = gB_6;
                            let _e786 = cv_2;
                            cov_2 = ((_e779.x * _e781.x) + (_e784.x * _e786.y));
                            let _e791 = h_11;
                            let _e792 = dk_1;
                            if (_e791 > _e792.y) {
                                {
                                    let _e795 = tauBelow;
                                    let _e796 = dk_1;
                                    let _e798 = cov_2;
                                    let _e800 = dk_1;
                                    let _e802 = dk_1;
                                    let _e808 = global.uSigma;
                                    tauBelow = (_e795 + ((((_e796.z * _e798) * (_e800.y - _e802.x)) * 0.4f) * _e808));
                                    continue;
                                }
                            }
                            let _e811 = h_11;
                            let _e812 = dk_1;
                            if (_e811 < _e812.x) {
                                {
                                    let _e815 = tauAbove;
                                    let _e816 = dk_1;
                                    let _e818 = cov_2;
                                    let _e820 = dk_1;
                                    let _e822 = dk_1;
                                    let _e828 = global.uSigma;
                                    tauAbove = (_e815 + ((((_e816.z * _e818) * (_e820.y - _e822.x)) * 0.4f) * _e828));
                                    continue;
                                }
                            }
                            let _e831 = seg;
                            if (_e831 != 1i) {
                                continue;
                            }
                            let _e835 = k_4;
                            let _e836 = pf_10;
                            let _e837 = dirF_16;
                            let _e838 = h_11;
                            let _e839 = cv_2;
                            let _e840 = gA_6;
                            let _e841 = gB_6;
                            let _e845 = deckDenG(_e835, _e836, _e837, _e838, _e839, _e840, _e841, true, (&fr));
                            d_11 = _e845;
                            let _e847 = tauAbove;
                            let _e848 = dk_1;
                            let _e850 = cov_2;
                            let _e853 = dk_1;
                            let _e855 = h_11;
                            let _e857 = muS_2;
                            let _e867 = global.uSigma;
                            tauAbove = (_e847 + ((((_e848.z * _e850) * max(0f, ((_e853.y - _e855) - (max(_e857, 0f) * 5054f)))) * 0.25f) * _e867));
                            let _e870 = tauBelow;
                            let _e871 = dk_1;
                            let _e873 = cov_2;
                            let _e876 = h_11;
                            let _e877 = dk_1;
                            let _e880 = muS_2;
                            let _e891 = global.uSigma;
                            tauBelow = (_e870 + ((((_e871.z * _e873) * max(0f, ((_e876 - _e877.x) - (max(-(_e880), 0f) * 5054f)))) * 0.25f) * _e891));
                            let _e894 = d_11;
                            let _e895 = cd;
                            if (_e894 > _e895) {
                                {
                                    let _e897 = d_11;
                                    cd = _e897;
                                    let _e898 = fr;
                                    frac_2 = _e898;
                                    let _e899 = k_4;
                                    let _e901 = global.uDeckCol[_e899];
                                    cc = _e901;
                                    let _e902 = global.uMode;
                                    let _e905 = k_4;
                                    if ((_e902 < 0.5f) && (_e905 == 0i)) {
                                        let _e909 = cc;
                                        let _e912 = lat_3;
                                        let _e913 = global.uBands;
                                        let _e917 = global.uJetPhase;
                                        let _e924 = palette((0.5f + (0.35f * sin((((_e912 * _e913) * 2f) + (_e917 * 6.2832f))))));
                                        cc = mix(_e909, _e924, vec3(0.55f));
                                    }
                                    tl = 0f;
                                    ds = 350f;
                                    sl = 0f;
                                    let _e934 = pf_10;
                                    ps = _e934;
                                    j_2 = 0i;
                                    loop {
                                        let _e938 = j_2;
                                        if !((_e938 < 3i)) {
                                            break;
                                        }
                                        {
                                            let _e945 = ps;
                                            let _e946 = sunDirF;
                                            let _e947 = ds;
                                            ps = (_e945 + (_e946 * _e947));
                                            let _e950 = sl;
                                            let _e951 = ds;
                                            sl = (_e950 + _e951);
                                            let _e953 = h_11;
                                            let _e954 = muS_2;
                                            let _e955 = sl;
                                            hs = (_e953 + (_e954 * _e955));
                                            let _e960 = tl;
                                            let _e961 = k_4;
                                            let _e962 = ps;
                                            let _e963 = dirF_16;
                                            let _e964 = hs;
                                            let _e965 = cv_2;
                                            let _e966 = gA_6;
                                            let _e967 = gB_6;
                                            let _e971 = deckDenG(_e961, _e962, _e963, _e964, _e965, _e966, _e967, false, (&frs));
                                            let _e972 = ds;
                                            tl = (_e960 + (_e971 * _e972));
                                            let _e975 = ds;
                                            ds = (_e975 * 3.2f);
                                        }
                                        continuing {
                                            let _e942 = j_2;
                                            j_2 = (_e942 + 1i);
                                        }
                                    }
                                    let _e978 = tl;
                                    let _e979 = global.uSigma;
                                    tlS = ((_e978 * _e979) * 0.8f);
                                }
                            }
                        }
                        continuing {
                            let _e748 = k_4;
                            k_4 = (_e748 + 1i);
                        }
                    }
                    let _e983 = tauAbove;
                    let _e984 = tlS;
                    tauV = (_e983 + _e984);
                    let _e987 = muS_2;
                    let _e988 = liftMu(_e987);
                    muT = _e988;
                    let _e993 = muT;
                    fromAbove = smoothstep(-0.02f, 0.06f, _e993);
                    let _e996 = tauBelow;
                    let _e997 = tlS;
                    let _e999 = muT;
                    let _e1004 = tauV;
                    let _e1005 = muT;
                    let _e1009 = fromAbove;
                    tauSun = mix(((_e996 + _e997) / max(-(_e999), 0.06f)), (_e1004 / max(_e1005, 0.06f)), _e1009);
                    let _e1012 = tauSun;
                    shade = exp(-(_e1012));
                    let _e1016 = r_20;
                    let _e1017 = muS_2;
                    let _e1018 = sunTransmittance(_e1016, _e1017);
                    let _e1019 = shade;
                    sunT = (_e1018 * _e1019);
                    let _e1022 = global.uHeightCube;
                    let _e1026 = r_20;
                    let _e1027 = global.uRadius;
                    let _e1028 = global.uHeightCube;
                    if ((_e1022.x > 0.5f) && (_e1026 < (_e1027 + _e1028.z))) {
                        let _e1033 = sunT;
                        let _e1034 = global.uToFixed;
                        let _e1035 = p_7;
                        let _e1037 = global.uToFixed;
                        let _e1038 = global.uSunDir;
                        let _e1040 = global.uRadius;
                        let _e1041 = airShadow((_e1034 * _e1035), (_e1037 * _e1038), _e1040);
                        sunT = (_e1033 * _e1041);
                    }
                    let _e1043 = r_20;
                    let _e1044 = muS_2;
                    let _e1045 = multiScatter(_e1043, _e1044);
                    let _e1048 = shade;
                    ms = (_e1045 * (0.2f + (0.8f * _e1048)));
                    let _e1053 = sR;
                    let _e1054 = sunT;
                    let _e1055 = pR;
                    let _e1057 = ms;
                    let _e1060 = sM;
                    let _e1061 = sunT;
                    let _e1062 = pM;
                    let _e1064 = ms;
                    let _e1068 = gAirSun;
                    S = (((_e1053 * ((_e1054 * _e1055) + _e1057)) + (_e1060 * ((_e1061 * _e1062) + _e1064))) * _e1068);
                    let _e1075 = tauV;
                    let _e1079 = tauV;
                    let _e1081 = muS_2;
                    let _e1088 = muS_2;
                    dif = (max(0f, ((1f / (1f + (0.1125f * _e1075))) - exp((-(_e1079) / max(_e1081, 0.06f))))) * max(_e1088, 0f));
                    let _e1093 = S;
                    let _e1094 = sR;
                    let _e1095 = sM;
                    let _e1097 = r_20;
                    let _e1098 = muS_2;
                    let _e1099 = sunTransmittance(_e1097, _e1098);
                    let _e1101 = dif;
                    let _e1106 = gAirSun;
                    S = (_e1093 + ((((_e1094 + _e1095) * _e1099) * ((_e1101 * 0.5f) / PI_A)) * _e1106));
                    Sm = vec3(0f);
                    mT = vec3(0f);
                    mms = vec3(0f);
                    mT0_ = vec3(0f);
                    let _e1121 = moon;
                    if _e1121 {
                        {
                            let _e1122 = nT;
                            let _e1123 = global.uMoonDir;
                            muM = dot(_e1122, _e1123);
                            let _e1126 = tauV;
                            let _e1128 = muM;
                            shM = exp((-(_e1126) / max(_e1128, 0.06f)));
                            let _e1134 = r_20;
                            let _e1135 = muM;
                            let _e1136 = sunTransmittance(_e1134, _e1135);
                            mT0_ = _e1136;
                            let _e1137 = mT0_;
                            let _e1138 = shM;
                            mT = (_e1137 * _e1138);
                            let _e1140 = r_20;
                            let _e1141 = muM;
                            let _e1142 = multiScatter(_e1140, _e1141);
                            let _e1145 = shM;
                            mms = (_e1142 * (0.2f + (0.8f * _e1145)));
                            let _e1149 = sR;
                            let _e1150 = mT;
                            let _e1151 = pRm;
                            let _e1153 = mms;
                            let _e1156 = sM;
                            let _e1157 = mT;
                            let _e1158 = pMm;
                            let _e1160 = mms;
                            Sm = ((_e1149 * ((_e1150 * _e1151) + _e1153)) + (_e1156 * ((_e1157 * _e1158) + _e1160)));
                            let _e1168 = tauV;
                            let _e1172 = shM;
                            let _e1175 = muM;
                            difM = (max(0f, ((1f / (1f + (0.1125f * _e1168))) - _e1172)) * max(_e1175, 0f));
                            let _e1180 = Sm;
                            let _e1181 = sR;
                            let _e1182 = sM;
                            let _e1184 = mT0_;
                            let _e1186 = difM;
                            Sm = (_e1180 + (((_e1181 + _e1182) * _e1184) * ((_e1186 * 0.5f) / PI_A)));
                        }
                    }
                    let _e1192 = cd;
                    if (_e1192 > 0f) {
                        {
                            let _e1195 = cd;
                            let _e1196 = global.uSigma;
                            sc = (_e1195 * _e1196);
                            let _e1199 = ms;
                            let _e1204 = frac_2;
                            let _e1207 = r_20;
                            let _e1208 = muS_2;
                            let _e1209 = sunTransmittance(_e1207, _e1208);
                            let _e1214 = frac_2;
                            amb = (((_e1199 * 14f) * mix(0.45f, 1f, _e1204)) + ((_e1209 * 0.05f) * (0.3f + (0.7f * _e1214))));
                            let _e1221 = cd;
                            powder = (1f - exp((-(_e1221) * 3f)));
                            let _e1228 = S;
                            let _e1229 = sc;
                            let _e1230 = cc;
                            let _e1232 = sunT;
                            let _e1233 = pC;
                            let _e1237 = powder;
                            let _e1241 = amb;
                            S = (_e1228 + ((_e1229 * _e1230) * (((_e1232 * _e1233) * (0.6f + (0.8f * _e1237))) + _e1241)));
                            let _e1245 = moon;
                            if _e1245 {
                                let _e1246 = Sm;
                                let _e1247 = sc;
                                let _e1248 = cc;
                                let _e1250 = mT;
                                let _e1251 = pCm;
                                let _e1255 = powder;
                                let _e1259 = mms;
                                let _e1264 = frac_2;
                                let _e1268 = mT0_;
                                let _e1273 = frac_2;
                                Sm = (_e1246 + ((_e1247 * _e1248) * ((((_e1250 * _e1251) * (0.6f + (0.8f * _e1255))) + ((_e1259 * 14f) * mix(0.45f, 1f, _e1264))) + ((_e1268 * 0.05f) * (0.3f + (0.7f * _e1273))))));
                            }
                            let _e1280 = ext_2;
                            let _e1281 = sc;
                            ext_2 = (_e1280 + vec3(_e1281));
                            let _e1284 = Tc;
                            let _e1285 = sc;
                            let _e1287 = dti;
                            Tc = (_e1284 * exp((-(_e1285) * _e1287)));
                            let _e1291 = global.uFlash;
                            if (_e1291.w > 0f) {
                                {
                                    let _e1295 = p_7;
                                    let _e1296 = global.uCenter;
                                    let _e1298 = global.uFlash;
                                    fd = ((_e1295 + _e1296) - _e1298.xyz);
                                    let _e1302 = S;
                                    let _e1303 = sc;
                                    let _e1309 = global.uFlash;
                                    let _e1312 = fd;
                                    let _e1313 = fd;
                                    S = (_e1302 + (((_e1303 * vec3<f32>(0.75f, 0.82f, 1f)) * _e1309.w) * exp((-(dot(_e1312, _e1313)) / 60000000f))));
                                }
                            }
                        }
                    }
                    let _e1321 = ext_2;
                    let _e1323 = dti;
                    Ts = exp((-(_e1321) * _e1323));
                    let _e1327 = L_2;
                    let _e1328 = T_4;
                    let _e1329 = S;
                    let _e1330 = S;
                    let _e1331 = Ts;
                    let _e1335 = ext_2;
                    L_2 = (_e1327 + ((_e1328 * (_e1329 - (_e1330 * _e1331))) / max(_e1335, vec3(0.000000000001f))));
                    let _e1341 = moon;
                    if _e1341 {
                        let _e1342 = Lm;
                        let _e1343 = T_4;
                        let _e1344 = Sm;
                        let _e1345 = Sm;
                        let _e1346 = Ts;
                        let _e1350 = ext_2;
                        Lm = (_e1342 + ((_e1343 * (_e1344 - (_e1345 * _e1346))) / max(_e1350, vec3(0.000000000001f))));
                    }
                    let _e1356 = global.uGlow;
                    let _e1359 = h_11;
                    if ((_e1356 > 0f) && (_e1359 < -20000f)) {
                        let _e1364 = Lth;
                        let _e1365 = T_4;
                        let _e1366 = h_11;
                        let _e1367 = thermalGlow(_e1366);
                        let _e1371 = Ts;
                        Lth = (_e1364 + ((_e1365 * _e1367) * (vec3(1f) - _e1371)));
                    }
                    let _e1375 = global.uThermal;
                    if (_e1375.x > 0f) {
                        {
                            let _e1379 = a_5;
                            let _e1380 = i_14;
                            let _e1382 = dt;
                            let _e1386 = dt;
                            let _e1389 = ext_2;
                            te = ((_e1379 + (f32(_e1380) * _e1382)) + min((0.5f * _e1386), (1f / max(_e1389.y, 0.000000000001f))));
                            let _e1397 = Lth;
                            let _e1398 = T_4;
                            let _e1401 = Ts;
                            let _e1404 = te;
                            let _e1405 = tca_3;
                            let _e1407 = D_4;
                            let _e1409 = perp_3;
                            let _e1412 = airHeatGlow(length((((_e1404 - _e1405) * _e1407) - _e1409)));
                            Lth = (_e1397 + ((_e1398 * (vec3(1f) - _e1401)) * _e1412));
                        }
                    }
                    let _e1415 = Lth;
                    let _e1416 = T_4;
                    let _e1417 = p_7;
                    let _e1418 = r_20;
                    let _e1419 = airLight(_e1417, _e1418);
                    let _e1421 = dti;
                    Lth = (_e1415 + ((_e1416 * _e1419) * _e1421));
                    let _e1424 = T_4;
                    let _e1425 = Ts;
                    T_4 = (_e1424 * _e1425);
                    let _e1427 = T_4;
                    let _e1429 = T_4;
                    let _e1431 = T_4;
                    if (max(_e1427.x, max(_e1429.y, _e1431.z)) < 0.003f) {
                        {
                            T_4 = vec3(0f);
                            break;
                        }
                    }
                }
                continuing {
                    let _e609 = i_14;
                    i_14 = (_e609 + 1i);
                }
            }
        }
        continuing {
            let _e526 = seg;
            seg = (_e526 + 1i);
        }
    }
    let _e1439 = global.uGlow;
    let _e1442 = T_4;
    let _e1444 = T_4;
    let _e1446 = T_4;
    if ((_e1439 > 0f) && (max(_e1442.x, max(_e1444.y, _e1446.z)) < 0.01f)) {
        {
            let _e1453 = t1_;
            let _e1454 = tca_3;
            let _e1456 = D_4;
            let _e1458 = perp_3;
            pe = (((_e1453 - _e1454) * _e1456) - _e1458);
            let _e1461 = Lth;
            let _e1462 = T_4;
            let _e1463 = pe;
            let _e1465 = global.uRadius;
            let _e1467 = thermalGlow((length(_e1463) - _e1465));
            Lth = (_e1461 + (_e1462 * _e1467));
        }
    }
    let _e1472 = D_4;
    let _e1473 = tca_3;
    let _e1474 = perp_3;
    let _e1475 = hit;
    let _e1477 = sceneDist;
    let _e1479 = jitter_2;
    auroraRay(_e1472, _e1473, _e1474, min(_e1475.y, _e1477), _e1479, (&aNear), (&aFar));
    let _e1484 = skyPx;
    if _e1484 {
        let _e1485 = D_4;
        let _e1486 = skyFar(_e1485);
        let _e1487 = global.uSunE;
        local_38 = (_e1486 * _e1487);
    } else {
        local_38 = vec3(0f);
    }
    let _e1492 = local_38;
    far_1 = _e1492;
    let _e1494 = L_2;
    let _e1495 = global.uSunE;
    let _e1497 = Lm;
    let _e1498 = global.uMoonE;
    let _e1501 = Lth;
    let _e1503 = aNear;
    let _e1505 = T_4;
    let _e1506 = aFar;
    let _e1509 = Tc;
    let _e1510 = far_1;
    let _e1512 = ((((((_e1494 * _e1495) + (_e1497 * _e1498)) + _e1501) + _e1503) + (_e1505 * _e1506)) + (_e1509 * _e1510));
    outL = vec4<f32>(_e1512.x, _e1512.y, _e1512.z, 1f);
    let _e1518 = T_4;
    outT = vec4<f32>(_e1518.x, _e1518.y, _e1518.z, 1f);
    return;
}

@fragment 
fn main(@location(0) vUv: vec2<f32>, @builtin(position) gl_FragCoord: vec4<f32>) -> FragmentOutput {
    vUv_1 = vUv;
    gl_FragCoord_1 = gl_FragCoord;
    main_1();
    let _e196 = outL;
    let _e198 = outT;
    return FragmentOutput(_e196, _e198);
}
`;
