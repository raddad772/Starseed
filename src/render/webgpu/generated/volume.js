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
  "group": 0,
  "attributes": []
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
var<private> gHazeH: f32 = 1f;
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
    let _e159 = r_5;
    let _e160 = global.uRadius;
    h = (_e159 - _e160);
    let _e163 = h;
    let _e164 = global.uKnee;
    if (_e163 <= _e164) {
        let _e166 = h;
        local_2 = _e166;
    } else {
        let _e167 = global.uKnee;
        let _e168 = h;
        let _e169 = global.uKnee;
        let _e171 = global.uUpper;
        local_2 = (_e167 + ((_e168 - _e169) / _e171));
    }
    let _e175 = local_2;
    hr = _e175;
    let _e177 = hr;
    let _e179 = global.uRayleighH;
    dR = exp((-(_e177) / _e179));
    let _e183 = hr;
    let _e185 = global.uMieH;
    dM = exp((-(_e183) / _e185));
    let _e189 = global.uAbsExp;
    if (_e189 > 0.5f) {
        let _e192 = dR;
        local_3 = _e192;
    } else {
        let _e195 = h;
        let _e196 = global.uAbsCenter;
        let _e199 = global.uAbsWidth;
        local_3 = max(0f, (1f - (abs((_e195 - _e196)) / max(_e199, 1f))));
    }
    let _e206 = local_3;
    dA = _e206;
    let _e208 = global.uHaze;
    let _e210 = gHazeK;
    let _e212 = gHazeH;
    let _e214 = h;
    let _e218 = global.uHaze;
    let _e225 = global.uHazeCol;
    dH = ((((_e208.x * _e210) * _e212) * exp((-(max(_e214, 0f)) / max(_e218.y, 1f)))) * _e225);
    let _e228 = global.uRayleigh;
    let _e229 = dR;
    (*scatR) = (_e228 * _e229);
    let _e231 = global.uMie;
    let _e232 = dM;
    let _e234 = dH;
    (*scatM) = ((_e231 * _e232) + _e234);
    let _e236 = (*scatR);
    let _e237 = (*scatM);
    let _e239 = global.uMieAbs;
    let _e240 = dM;
    let _e243 = global.uAbs;
    let _e244 = dA;
    let _e247 = dH;
    let _e248 = global.uHaze;
    (*ext) = ((((_e236 + _e237) + (_e239 * _e240)) + (_e243 * _e244)) + (_e247 * _e248.z));
    return;
}

fn realH(h_1: f32) -> f32 {
    var h_2: f32;
    var local_4: f32;

    h_2 = h_1;
    let _e156 = h_2;
    let _e157 = global.uKnee;
    if (_e156 <= _e157) {
        let _e159 = h_2;
        local_4 = _e159;
    } else {
        let _e160 = global.uKnee;
        let _e161 = h_2;
        let _e162 = global.uKnee;
        let _e164 = global.uUpper;
        local_4 = (_e160 + ((_e161 - _e162) / _e164));
    }
    let _e168 = local_4;
    return _e168;
}

fn drawnH(hr_1: f32) -> f32 {
    var hr_2: f32;
    var local_5: f32;

    hr_2 = hr_1;
    let _e156 = hr_2;
    let _e157 = global.uKnee;
    if (_e156 <= _e157) {
        let _e159 = hr_2;
        local_5 = _e159;
    } else {
        let _e160 = global.uKnee;
        let _e161 = hr_2;
        let _e162 = global.uKnee;
        let _e164 = global.uUpper;
        local_5 = (_e160 + ((_e161 - _e162) * _e164));
    }
    let _e168 = local_5;
    return _e168;
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
    let _e159 = hr_4;
    let _e160 = drawnH(_e159);
    h_3 = _e160;
    let _e162 = hr_4;
    let _e164 = global.uRayleighH;
    dR_1 = exp((-(_e162) / _e164));
    let _e168 = hr_4;
    let _e170 = global.uMieH;
    dM_1 = exp((-(_e168) / _e170));
    let _e174 = global.uAbsExp;
    if (_e174 > 0.5f) {
        let _e177 = dR_1;
        local_6 = _e177;
    } else {
        let _e180 = h_3;
        let _e181 = global.uAbsCenter;
        let _e184 = global.uAbsWidth;
        local_6 = max(0f, (1f - (abs((_e180 - _e181)) / max(_e184, 1f))));
    }
    let _e191 = local_6;
    dA_1 = _e191;
    let _e193 = global.uHaze;
    let _e195 = gHazeK;
    let _e197 = hr_4;
    let _e201 = global.uHaze;
    let _e208 = global.uHazeCol;
    dH_1 = (((_e193.x * _e195) * exp((-(max(_e197, 0f)) / max(_e201.y, 1f)))) * _e208);
    let _e211 = global.uRayleigh;
    let _e212 = dR_1;
    (*scatR_1) = (_e211 * _e212);
    let _e214 = global.uMie;
    let _e215 = dM_1;
    let _e217 = dH_1;
    (*scatM_1) = ((_e214 * _e215) + _e217);
    let _e219 = (*scatR_1);
    let _e220 = (*scatM_1);
    let _e222 = global.uMieAbs;
    let _e223 = dM_1;
    let _e226 = global.uAbs;
    let _e227 = dA_1;
    let _e230 = dH_1;
    let _e231 = global.uHaze;
    (*ext_1) = ((((_e219 + _e220) + (_e222 * _e223)) + (_e226 * _e227)) + (_e230 * _e231.z));
    return;
}

fn phaseRayleigh(c_1: f32) -> f32 {
    var c_2: f32;

    c_2 = c_1;
    let _e162 = c_2;
    let _e163 = c_2;
    return (0.059683103f * (1f + (_e162 * _e163)));
}

fn phaseCS(c_3: f32, g: f32) -> f32 {
    var c_4: f32;
    var g_1: f32;
    var g2_: f32;

    c_4 = c_3;
    g_1 = g;
    let _e158 = g_1;
    let _e159 = g_1;
    g2_ = (_e158 * _e159);
    let _e168 = g2_;
    let _e171 = c_4;
    let _e172 = c_4;
    let _e178 = g2_;
    let _e181 = g2_;
    let _e184 = g_1;
    let _e186 = c_4;
    return ((0.119366206f * ((1f - _e168) * (1f + (_e171 * _e172)))) / ((2f + _e178) * pow(max(((1f + _e181) - ((2f * _e184) * _e186)), 0.0001f), 1.5f)));
}

fn phaseHG(c_5: f32, g_2: f32) -> f32 {
    var c_6: f32;
    var g_3: f32;

    c_6 = c_5;
    g_3 = g_2;
    let _e159 = g_3;
    let _e160 = g_3;
    let _e167 = g_3;
    let _e168 = g_3;
    let _e172 = g_3;
    let _e174 = c_6;
    return ((1f - (_e159 * _e160)) / (12.566371f * pow(max(((1f + (_e167 * _e168)) - ((2f * _e172) * _e174)), 0.000001f), 1.5f)));
}

fn phaseMie(c_7: f32) -> vec3<f32> {
    var c_8: f32;

    c_8 = c_7;
    let _e156 = c_8;
    let _e157 = global.uMieG;
    let _e159 = phaseCS(_e156, _e157.x);
    let _e160 = c_8;
    let _e161 = global.uMieG;
    let _e163 = phaseCS(_e160, _e161.y);
    let _e164 = c_8;
    let _e165 = global.uMieG;
    let _e167 = phaseCS(_e164, _e165.z);
    let _e169 = c_8;
    let _e170 = global.uMieGL;
    let _e172 = phaseHG(_e169, _e170.x);
    let _e173 = c_8;
    let _e174 = global.uMieGL;
    let _e176 = phaseHG(_e173, _e174.y);
    let _e177 = c_8;
    let _e178 = global.uMieGL;
    let _e180 = phaseHG(_e177, _e178.z);
    let _e182 = global.uMieF;
    return mix(vec3<f32>(_e159, _e163, _e167), vec3<f32>(_e172, _e176, _e180), _e182);
}

fn distToTop(r_6: f32, mu_4: f32) -> f32 {
    var r_7: f32;
    var mu_5: f32;
    var disc_1: f32;

    r_7 = r_6;
    mu_5 = mu_4;
    let _e158 = r_7;
    let _e159 = r_7;
    let _e161 = mu_5;
    let _e162 = mu_5;
    let _e167 = global.uTop;
    let _e168 = global.uTop;
    disc_1 = (((_e158 * _e159) * ((_e161 * _e162) - 1f)) + (_e167 * _e168));
    let _e173 = r_7;
    let _e175 = mu_5;
    let _e177 = disc_1;
    return max(0f, ((-(_e173) * _e175) + sqrt(max(_e177, 0f))));
}

fn hitsGround(r_8: f32, mu_6: f32, gr: f32) -> bool {
    var r_9: f32;
    var mu_7: f32;
    var gr_1: f32;

    r_9 = r_8;
    mu_7 = mu_6;
    gr_1 = gr;
    let _e160 = mu_7;
    let _e163 = r_9;
    let _e164 = r_9;
    let _e166 = mu_7;
    let _e167 = mu_7;
    let _e172 = gr_1;
    let _e173 = gr_1;
    return ((_e160 < 0f) && ((((_e163 * _e164) * ((_e166 * _e167) - 1f)) + (_e172 * _e173)) >= 0f));
}

fn airLight(p_2: vec3<f32>, r_10: f32) -> vec3<f32> {
    var p_3: vec3<f32>;
    var r_11: f32;
    var hgt: f32;

    p_3 = p_2;
    r_11 = r_10;
    let _e159 = global.uAurora;
    if (_e159.w <= 0f) {
        return vec3(0f);
    }
    let _e165 = r_11;
    let _e166 = global.uRadius;
    let _e168 = global.uTop;
    let _e169 = global.uRadius;
    hgt = ((_e165 - _e166) / (_e168 - _e169));
    let _e173 = global.uAurora;
    let _e175 = hgt;
    let _e185 = global.uAirglowCol;
    let _e187 = global.uTop;
    let _e188 = global.uRadius;
    return (((_e173.w * exp(-(pow(((_e175 - 0.6f) / 0.03f), 2f)))) * _e185) / vec3((_e187 - _e188)));
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
    let _e159 = pf_1;
    let _e160 = global.uMagAxis;
    ml = asin(clamp(dot(_e159, _e160), -1f, 1f));
    let _e168 = ml;
    aml = abs(_e168);
    let _e171 = global.uAurora;
    if (_e171.y < 0f) {
        let _e176 = pf_1;
        let _e181 = global.uTime;
        let _e187 = textureSampleLevel(tNoiseTexture, tNoiseSampler, ((_e176 * 3f) + vec3<f32>(0f, 0f, (_e181 * 0.002f))), 0f);
        return (0.3f * _e187.x);
    }
    let _e190 = aml;
    let _e191 = global.uAurora;
    let _e194 = global.uAurora;
    band = exp(-(pow(((_e190 - _e191.y) / _e194.z), 2f)));
    let _e202 = band;
    if (_e202 < 0.02f) {
        return 0f;
    }
    let _e206 = global.uMagAxis;
    let _e207 = global.uMagAxis;
    if (abs(_e207.z) < 0.9f) {
        local_7 = vec3<f32>(0f, 0f, 1f);
    } else {
        local_7 = vec3<f32>(1f, 0f, 0f);
    }
    let _e221 = local_7;
    e1_ = normalize(cross(_e206, _e221));
    let _e225 = global.uMagAxis;
    let _e226 = e1_;
    e2_ = cross(_e225, _e226);
    let _e229 = pf_1;
    let _e230 = e2_;
    let _e232 = pf_1;
    let _e233 = e1_;
    mlon = atan2(dot(_e229, _e230), dot(_e232, _e233));
    let _e237 = mlon;
    let _e239 = mlon;
    cs = vec2<f32>(cos(_e237), sin(_e239));
    let _e243 = ml;
    if (_e243 > 0f) {
        local_8 = 0f;
    } else {
        local_8 = 5.3f;
    }
    let _e249 = local_8;
    side = _e249;
    loop {
        let _e255 = j;
        if !((_e255 < 2i)) {
            break;
        }
        {
            let _e262 = j;
            fj = f32(_e262);
            let _e265 = cs;
            let _e267 = (_e265 * 0.6f);
            let _e268 = side;
            let _e269 = fj;
            let _e273 = global.uTime;
            let _e281 = textureSampleLevel(tNoiseTexture, tNoiseSampler, vec3<f32>(_e267.x, _e267.y, ((_e268 + (_e269 * 2.7f)) + (_e273 * 0.0015f))), 0f);
            wig = (_e281.x - 0.5f);
            let _e286 = wig;
            let _e288 = cs;
            let _e290 = (_e288 * 2.3f);
            let _e291 = side;
            let _e292 = fj;
            let _e296 = global.uTime;
            let _e304 = textureSampleLevel(tNoiseTexture, tNoiseSampler, vec3<f32>(_e290.x, _e290.y, ((_e291 + (_e292 * 1.3f)) + (_e296 * 0.004f))), 0f);
            wig = (_e286 + (0.45f * (_e304.x - 0.5f)));
            let _e310 = global.uAurora;
            let _e312 = fj;
            let _e315 = global.uAurora;
            let _e321 = wig;
            let _e322 = global.uAurora;
            lineLat = ((_e310.y + (((_e312 - 0.5f) * _e315.z) * 0.9f)) + ((_e321 * _e322.z) * 2.2f));
            let _e329 = global.uAurora;
            w0_ = (_e329.z * 0.035f);
            let _e334 = w0_;
            let _e335 = w0_;
            let _e337 = blur_1;
            let _e338 = blur_1;
            w = sqrt(((_e334 * _e335) + (_e337 * _e338)));
            let _e343 = aml;
            let _e344 = lineLat;
            let _e346 = w;
            d_5 = ((_e343 - _e344) / _e346);
            let _e349 = d_5;
            let _e351 = d_5;
            let _e354 = w0_;
            let _e356 = w;
            arc = ((exp((-(_e349) * _e351)) * _e354) / _e356);
            let _e359 = arc;
            if (_e359 < 0.01f) {
                continue;
            }
            let _e362 = cs;
            let _e364 = (_e362 * 5f);
            let _e365 = side;
            let _e366 = fj;
            let _e370 = global.uTime;
            let _e378 = textureSampleLevel(tNoiseTexture, tNoiseSampler, vec3<f32>(_e364.x, _e364.y, ((_e365 + (_e366 * 0.61f)) + (_e370 * 0.02f))), 0f);
            rays = _e378.x;
            let _e381 = b;
            let _e382 = arc;
            let _e385 = rays;
            let _e387 = rays;
            b = (_e381 + (_e382 * (0.25f + ((1.8f * _e385) * _e387))));
        }
        continuing {
            let _e259 = j;
            j = (_e259 + 1i);
        }
    }
    let _e392 = b;
    let _e393 = band;
    return (_e392 * _e393);
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
    let _e171 = global.uAurora;
    if (_e171.x <= 0f) {
        return;
    }
    let _e175 = global.uTop;
    let _e176 = global.uRadius;
    H_1 = (_e175 - _e176);
    let _e179 = global.uRadius;
    let _e181 = H_1;
    aLo = (_e179 + (0.55f * _e181));
    let _e185 = global.uRadius;
    let _e187 = H_1;
    aHi = (_e185 + (0.98f * _e187));
    let _e191 = perp_2;
    let _e192 = perp_2;
    pp = dot(_e191, _e192);
    let _e195 = pp;
    let _e196 = aHi;
    let _e197 = aHi;
    if (_e195 >= (_e196 * _e197)) {
        return;
    }
    let _e202 = aHi;
    let _e203 = aLo;
    let _e205 = K;
    slab = ((_e202 - _e203) / f32(_e205));
    loop {
        let _e211 = i;
        let _e212 = K;
        if !((_e211 < _e212)) {
            break;
        }
        {
            let _e218 = i;
            let _e220 = jitter_1;
            let _e222 = K;
            x = ((f32(_e218) + _e220) / f32(_e222));
            let _e226 = aLo;
            let _e227 = aHi;
            let _e228 = x;
            a = mix(_e226, _e227, _e228);
            let _e231 = pp;
            let _e232 = a;
            let _e233 = a;
            if (_e231 >= (_e232 * _e233)) {
                continue;
            }
            let _e236 = a;
            let _e237 = a;
            let _e239 = pp;
            s = sqrt(((_e236 * _e237) - _e239));
            let _e245 = x;
            let _e249 = x;
            prof = (smoothstep(0f, 0.04f, _e245) * exp((-2.5f * _e249)));
            let _e254 = global.uAuroraLo;
            let _e255 = global.uAuroraHi;
            let _e258 = x;
            let _e262 = prof;
            let _e264 = global.uAurora;
            let _e267 = H_1;
            col = (((mix(_e254, _e255, vec3(smoothstep(0.3f, 0.85f, _e258))) * _e262) * _e264.x) / vec3(_e267));
            k_2 = 0i;
            loop {
                let _e273 = k_2;
                if !((_e273 < 2i)) {
                    break;
                }
                {
                    let _e280 = k_2;
                    if (_e280 == 0i) {
                        let _e283 = tca_2;
                        let _e284 = s;
                        local_9 = (_e283 - _e284);
                    } else {
                        let _e286 = tca_2;
                        let _e287 = s;
                        local_9 = (_e286 + _e287);
                    }
                    let _e290 = local_9;
                    t = _e290;
                    let _e292 = t;
                    let _e295 = t;
                    let _e296 = tMax_1;
                    if ((_e292 <= 0f) || (_e295 >= _e296)) {
                        continue;
                    }
                    let _e299 = t;
                    let _e300 = tca_2;
                    let _e302 = D_1;
                    let _e304 = perp_2;
                    p_4 = (((_e299 - _e300) * _e302) - _e304);
                    let _e307 = t;
                    let _e308 = tca_2;
                    let _e310 = a;
                    mu_8 = ((_e307 - _e308) / _e310);
                    let _e313 = slab;
                    let _e315 = mu_8;
                    let _e316 = mu_8;
                    let _e323 = mu_8;
                    let _e328 = t;
                    let _e329 = gPixA;
                    let _e332 = a;
                    blur_2 = ((((_e313 * sqrt(max((1f - (_e315 * _e316)), 0f))) / max(abs(_e323), 0.04f)) + (_e328 * _e329)) / _e332);
                    let _e335 = global.uToFixed;
                    let _e336 = p_4;
                    let _e337 = a;
                    let _e341 = blur_2;
                    let _e342 = auroraArcs((_e335 * (_e336 / vec3(_e337))), _e341);
                    b_1 = _e342;
                    let _e344 = b_1;
                    if (_e344 <= 0f) {
                        continue;
                    }
                    let _e347 = col;
                    let _e348 = b_1;
                    let _e350 = slab;
                    let _e352 = mu_8;
                    e = (((_e347 * _e348) * _e350) / vec3(max(abs(_e352), 0.04f)));
                    let _e359 = k_2;
                    if (_e359 == 0i) {
                        let _e362 = (*near);
                        let _e363 = e;
                        (*near) = (_e362 + _e363);
                    } else {
                        let _e365 = (*far);
                        let _e366 = e;
                        (*far) = (_e365 + _e366);
                    }
                }
                continuing {
                    let _e277 = k_2;
                    k_2 = (_e277 + 1i);
                }
            }
        }
        continuing {
            let _e215 = i;
            i = (_e215 + 1i);
        }
    }
    return;
}

fn blackbodyGlow(T: f32) -> vec3<f32> {
    var T_1: f32;
    var g_4: f32;

    T_1 = T;
    let _e157 = T_1;
    if (_e157 < 650f) {
        return vec3(0f);
    }
    let _e165 = T_1;
    g_4 = max(0f, (0.0287f + (0.000237f * (_e165 - 1000f))));
    let _e173 = g_4;
    let _e179 = T_1;
    let _e185 = g_4;
    return (vec3<f32>(1f, _e173, 0f) * ((600000f * exp((-24060f / _e179))) / (0.2126f + (0.7152f * _e185))));
}

fn airHeatGlow(r_12: f32) -> vec3<f32> {
    var r_13: f32;
    var local_10: vec3<f32>;

    r_13 = r_12;
    let _e157 = global.uThermal;
    if (_e157.x > 0f) {
        let _e161 = global.uThermal;
        let _e163 = global.uThermal;
        let _e165 = r_13;
        let _e166 = global.uRadius;
        let _e172 = blackbodyGlow((_e161.x - (_e163.z * max((_e165 - _e166), 0f))));
        local_10 = _e172;
    } else {
        local_10 = vec3(0f);
    }
    let _e176 = local_10;
    return _e176;
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
    let _e160 = d_7;
    a_1 = abs(_e160);
    let _e163 = a_1;
    let _e165 = a_1;
    let _e168 = a_1;
    let _e170 = a_1;
    if ((_e163.x >= _e165.y) && (_e168.x >= _e170.z)) {
        let _e174 = d_7;
        if (_e174.x >= 0f) {
            local_11 = 0i;
        } else {
            local_11 = 1i;
        }
        let _e181 = local_11;
        local_15 = _e181;
    } else {
        let _e182 = a_1;
        let _e184 = a_1;
        if (_e182.y >= _e184.z) {
            let _e187 = d_7;
            if (_e187.y >= 0f) {
                local_12 = 2i;
            } else {
                local_12 = 3i;
            }
            let _e194 = local_12;
            local_14 = _e194;
        } else {
            let _e195 = d_7;
            if (_e195.z >= 0f) {
                local_13 = 4i;
            } else {
                local_13 = 5i;
            }
            let _e202 = local_13;
            local_14 = _e202;
        }
        let _e204 = local_14;
        local_15 = _e204;
    }
    let _e206 = local_15;
    f = _e206;
    let _e208 = d_7;
    let _e209 = f;
    let _e213 = local_16[_e209];
    dn = dot(_e208, _e213);
    let _e216 = d_7;
    let _e217 = f;
    let _e221 = local_17[_e217];
    let _e223 = dn;
    let _e226 = d_7;
    let _e227 = f;
    let _e231 = local_18[_e227];
    let _e233 = dn;
    uv_2 = (((vec2<f32>(atan((dot(_e216, _e221) / _e223)), atan((dot(_e226, _e231) / _e233))) / vec2(0.785398f)) * 0.5f) + vec2(0.5f));
    let _e246 = uv_2;
    let _e247 = f;
    let _e251 = vec3<f32>(_e246.x, _e246.y, f32(_e247));
    let _e256 = textureSampleLevel(tHeightCubeTexture, tHeightCubeSampler, _e251.xy, i32(_e251.z), 0f);
    return _e256.x;
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
    let _e166 = global.uHeightCube;
    let _e170 = up_1;
    let _e171 = sF_1;
    if ((_e166.x < 0.5f) || (dot(_e170, _e171) < -0.2f)) {
        return 1f;
    }
    let _e178 = global.uHeightCube;
    texel = _e178.w;
    let _e181 = R_1;
    let _e182 = global.uHeightCube;
    top = (_e181 + _e182.z);
    let _e186 = pF_1;
    r0_ = length(_e186);
    let _e190 = R_1;
    let _e191 = up_1;
    let _e192 = heightCubeAt(_e191);
    let _e194 = r0_;
    below = max(0f, ((_e190 + _e192) - _e194));
    let _e198 = pF_1;
    let _e199 = up_1;
    let _e200 = texel;
    o = (_e198 + ((_e199 * _e200) * 0.1f));
    let _e206 = texel;
    t_1 = _e206;
    loop {
        let _e212 = i_1;
        if !((_e212 < 28i)) {
            break;
        }
        {
            let _e219 = o;
            let _e220 = sF_1;
            let _e221 = t_1;
            qp = (_e219 + (_e220 * _e221));
            let _e225 = qp;
            rq = length(_e225);
            let _e228 = rq;
            let _e229 = top;
            if (_e228 > _e229) {
                break;
            }
            let _e231 = rq;
            let _e232 = R_1;
            let _e233 = qp;
            let _e234 = rq;
            let _e237 = heightCubeAt((_e233 / vec3(_e234)));
            let _e240 = below;
            let _e241 = t_1;
            let _e244 = texel;
            d_8 = ((_e231 - (_e232 + _e237)) + (_e240 * exp((-(_e241) / (3f * _e244)))));
            let _e251 = sh;
            let _e252 = d_8;
            let _e253 = t_1;
            sh = min(_e251, clamp(((_e252 / (_e253 * 0.035f)) + 0.5f), 0f, 1f));
            let _e263 = sh;
            if (_e263 <= 0f) {
                break;
            }
            let _e266 = t_1;
            t_1 = (_e266 * 1.35f);
        }
        continuing {
            let _e216 = i_1;
            i_1 = (_e216 + 1i);
        }
    }
    let _e269 = sh;
    return _e269;
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
    let _e164 = global.uHeightCube;
    texel_1 = _e164.w;
    let _e167 = R_3;
    let _e168 = global.uHeightCube;
    top_1 = (_e167 + _e168.z);
    let _e172 = texel_1;
    t_2 = _e172;
    loop {
        let _e178 = i_2;
        if !((_e178 < 16i)) {
            break;
        }
        {
            let _e185 = pF_3;
            let _e186 = sF_3;
            let _e187 = t_2;
            qp_1 = (_e185 + (_e186 * _e187));
            let _e191 = qp_1;
            rq_1 = length(_e191);
            let _e194 = rq_1;
            let _e195 = top_1;
            if (_e194 > _e195) {
                break;
            }
            let _e197 = sh_1;
            let _e198 = rq_1;
            let _e199 = R_3;
            let _e200 = qp_1;
            let _e201 = rq_1;
            let _e204 = heightCubeAt((_e200 / vec3(_e201)));
            let _e207 = t_2;
            sh_1 = min(_e197, clamp((((_e198 - (_e199 + _e204)) / (_e207 * 0.035f)) + 0.5f), 0f, 1f));
            let _e217 = sh_1;
            if (_e217 <= 0f) {
                break;
            }
            let _e220 = t_2;
            t_2 = (_e220 * 1.6f);
        }
        continuing {
            let _e182 = i_2;
            i_2 = (_e182 + 1i);
        }
    }
    let _e223 = sh_1;
    return _e223;
}

fn thermalGlow(h_4: f32) -> vec3<f32> {
    var h_5: f32;
    var T_2: f32;
    var k_3: f32;
    var c_9: vec3<f32>;

    h_5 = h_4;
    let _e163 = global.uT1_;
    let _e164 = global.uLapse;
    let _e165 = h_5;
    T_2 = (_e163 - (_e164 * min(_e165, 0f)));
    let _e172 = T_2;
    k_3 = pow(max(0f, ((_e172 - 560f) / 700f)), 2.6f);
    let _e189 = T_2;
    c_9 = mix(vec3<f32>(1f, 0.18f, 0.04f), vec3<f32>(1f, 0.45f, 0.12f), vec3(clamp(((_e189 - 800f) / 600f), 0f, 1f)));
    let _e200 = c_9;
    let _e201 = k_3;
    let _e205 = global.uGlow;
    return (((_e200 * _e201) * 0.003f) * _e205);
}

fn transmittanceToTop(r_14: f32, mu_9: f32) -> vec3<f32> {
    var r_15: f32;
    var mu_10: f32;
    var uv_3: vec2<f32>;

    r_15 = r_14;
    mu_10 = mu_9;
    let _e165 = r_15;
    let _e166 = global.uBottom;
    let _e167 = global.uTop;
    let _e169 = mu_10;
    let _e170 = transmittanceUV(clamp(_e165, _e166, _e167), _e169);
    uv_3 = _e170;
    let _e179 = uv_3;
    uv_3 = (vec2<f32>(0.001953125f, 0.0078125f) + (_e179 * vec2<f32>(0.99609375f, 0.984375f)));
    let _e189 = uv_3;
    let _e191 = textureSampleLevel(tTransTexture, tTransSampler, _e189, 0f);
    return _e191.xyz;
}

fn sunTransmittance(r_16: f32, mu_11: f32) -> vec3<f32> {
    var r_17: f32;
    var mu_12: f32;
    var Rg: f32;
    var sinH: f32;
    var cosH: f32;

    r_17 = r_16;
    mu_12 = mu_11;
    let _e165 = mu_12;
    let _e166 = liftMu(_e165);
    mu_12 = _e166;
    let _e167 = global.uGround;
    let _e168 = global.uTrueK;
    Rg = (_e167 * max(_e168, 1f));
    let _e173 = Rg;
    let _e174 = Rg;
    let _e175 = r_17;
    let _e176 = global.uGround;
    sinH = (_e173 / (_e174 + max((_e175 - _e176), 0f)));
    let _e185 = sinH;
    let _e186 = sinH;
    cosH = -(sqrt(max(0f, (1f - (_e185 * _e186)))));
    let _e193 = r_17;
    let _e194 = mu_12;
    let _e195 = transmittanceToTop(_e193, _e194);
    let _e196 = cosH;
    let _e199 = cosH;
    let _e202 = mu_12;
    return (_e195 * smoothstep((_e196 - 0.004f), (_e199 + 0.004f), _e202));
}

fn multiScatter(r_18: f32, muS: f32) -> vec3<f32> {
    var r_19: f32;
    var muS_1: f32;
    var uv_4: vec2<f32>;

    r_19 = r_18;
    muS_1 = muS;
    let _e165 = muS_1;
    let _e166 = liftMu(_e165);
    muS_1 = _e166;
    let _e167 = muS_1;
    let _e172 = r_19;
    let _e173 = global.uBottom;
    let _e175 = global.uTop;
    let _e176 = global.uBottom;
    uv_4 = clamp(vec2<f32>(((_e167 * 0.5f) + 0.5f), ((_e172 - _e173) / (_e175 - _e176))), vec2(0f), vec2(1f));
    let _e190 = uv_4;
    let _e197 = textureSampleLevel(tMSTexture, tMSSampler, (vec2(0.015625f) + (_e190 * 0.96875f)), 0f);
    return _e197.xyz;
}

fn skyTrueEl(e_1: f32) -> f32 {
    var e_2: f32;
    var zd_2: f32;
    var hD_1: f32;
    var hT_1: f32;
    var local_19: f32;

    e_2 = e_1;
    let _e163 = global.uSkyView;
    let _e165 = global.uSkyView;
    if (_e163.y <= _e165.z) {
        let _e168 = e_2;
        return _e168;
    }
    let _e170 = e_2;
    zd_2 = (1.5707963f - _e170);
    let _e174 = global.uSkyView;
    hD_1 = (1.5707963f + _e174.y);
    let _e179 = global.uSkyView;
    hT_1 = (1.5707963f + _e179.z);
    let _e184 = zd_2;
    let _e185 = hD_1;
    if (_e184 <= _e185) {
        let _e187 = zd_2;
        let _e188 = hT_1;
        let _e190 = hD_1;
        local_19 = ((_e187 * _e188) / _e190);
    } else {
        let _e192 = hT_1;
        let _e193 = zd_2;
        let _e194 = hD_1;
        let _e197 = hT_1;
        let _e201 = hD_1;
        local_19 = (_e192 + (((_e193 - _e194) * (3.1415927f - _e197)) / (3.1415927f - _e201)));
    }
    let _e206 = local_19;
    return (1.5707963f - _e206);
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
    let _e163 = global.uSkyView;
    if (_e163.x <= 0f) {
        return vec3(0f);
    }
    let _e169 = D_3;
    let _e170 = global.uSkyUp;
    s_1 = clamp(dot(_e169, _e170), -1f, 1f);
    let _e177 = s_1;
    let _e179 = skyTrueEl(asin(_e177));
    el = _e179;
    let _e181 = D_3;
    let _e182 = global.uSkyUp;
    let _e183 = s_1;
    hD_2 = (_e181 - (_e182 * _e183));
    let _e187 = hD_2;
    hl = length(_e187);
    let _e190 = hl;
    if (_e190 > 0.00001f) {
        let _e193 = hD_2;
        let _e194 = hl;
        let _e197 = global.uSkySunH;
        local_20 = acos(clamp(dot((_e193 / vec3(_e194)), _e197), -1f, 1f));
    } else {
        local_20 = 0f;
    }
    let _e206 = local_20;
    az = _e206;
    let _e210 = el;
    let _e213 = el;
    v = (0.5f + ((0.5f * sign(_e210)) * sqrt((abs(_e213) / 1.5707963f))));
    let _e221 = az;
    let _e224 = v;
    let _e227 = textureSampleLevel(tSkyViewTexture, tSkyViewSampler, vec2<f32>((_e221 / 3.1415927f), _e224), 0f);
    let _e229 = global.uSkyView;
    return (_e227.xyz * _e229.x);
}

fn ign(p_5: vec2<f32>) -> f32 {
    var p_6: vec2<f32>;

    p_6 = p_5;
    let _e164 = p_6;
    return fract((52.982918f * fract(dot(_e164, vec2<f32>(0.06711056f, 0.00583715f)))));
}

fn hg(c_10: f32, g_5: f32) -> f32 {
    var c_11: f32;
    var g_6: f32;
    var g2_1: f32;

    c_11 = c_10;
    g_6 = g_5;
    let _e165 = g_6;
    let _e166 = g_6;
    g2_1 = (_e165 * _e166);
    let _e170 = g2_1;
    let _e176 = g2_1;
    let _e179 = g_6;
    let _e181 = c_11;
    return ((1f - _e170) / (12.566371f * pow(max(((1f + _e176) - ((2f * _e179) * _e181)), 0.0001f), 1.5f)));
}

fn palette(t_3: f32) -> vec3<f32> {
    var t_4: f32;
    var i_3: f32;
    var f_1: f32;
    var a_2: vec3<f32>;
    var b_2: vec3<f32>;

    t_4 = t_3;
    let _e163 = t_4;
    t_4 = (clamp(_e163, 0f, 1f) * 5f);
    let _e169 = t_4;
    i_3 = floor(_e169);
    let _e174 = t_4;
    f_1 = smoothstep(0f, 1f, fract(_e174));
    let _e180 = global.uPal[0];
    a_2 = _e180;
    let _e184 = global.uPal[1];
    b_2 = _e184;
    let _e186 = i_3;
    if (_e186 < 1f) {
        {
            let _e191 = global.uPal[0];
            a_2 = _e191;
            let _e194 = global.uPal[1];
            b_2 = _e194;
        }
    } else {
        let _e195 = i_3;
        if (_e195 < 2f) {
            {
                let _e200 = global.uPal[1];
                a_2 = _e200;
                let _e203 = global.uPal[2];
                b_2 = _e203;
            }
        } else {
            let _e204 = i_3;
            if (_e204 < 3f) {
                {
                    let _e209 = global.uPal[2];
                    a_2 = _e209;
                    let _e212 = global.uPal[3];
                    b_2 = _e212;
                }
            } else {
                let _e213 = i_3;
                if (_e213 < 4f) {
                    {
                        let _e218 = global.uPal[3];
                        a_2 = _e218;
                        let _e221 = global.uPal[4];
                        b_2 = _e221;
                    }
                } else {
                    {
                        let _e224 = global.uPal[4];
                        a_2 = _e224;
                        let _e227 = global.uPal[5];
                        b_2 = _e227;
                    }
                }
            }
        }
    }
    let _e228 = a_2;
    let _e229 = b_2;
    let _e230 = f_1;
    return mix(_e228, _e229, vec3(_e230));
}

fn cloudN(n: f32) -> f32 {
    var n_1: f32;

    n_1 = n;
    let _e164 = n_1;
    return (0.55f + ((_e164 - 0.682f) * 4.3f));
}

fn cloudBias(cover: f32) -> f32 {
    var cover_1: f32;

    cover_1 = cover;
    let _e163 = cover_1;
    let _e171 = cover_1;
    let _e179 = cover_1;
    return ((((_e163 - 0.5f) * 0.3f) + (0.5f * smoothstep(0.8f, 1f, _e171))) - (0.5f * (1f - smoothstep(0f, 0.2f, _e179))));
}

fn cloudFade(foot: f32, L: f32) -> f32 {
    var foot_1: f32;
    var L_1: f32;

    foot_1 = foot;
    L_1 = L;
    let _e167 = foot_1;
    let _e170 = L_1;
    return smoothstep(1f, 4f, ((_e167 * 64f) / _e170));
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
    let _e164 = textureDimensions(tCloudMapTexture, 0i);
    sz = vec2<f32>(vec2<i32>(_e164));
    let _e168 = uv_6;
    let _e169 = sz;
    st = ((_e168 * _e169) - vec2(0.5f));
    let _e175 = st;
    i_4 = floor(_e175);
    let _e178 = st;
    let _e179 = i_4;
    f_2 = (_e178 - _e179);
    let _e182 = f_2;
    let _e183 = f_2;
    f2_ = (_e182 * _e183);
    let _e186 = f2_;
    let _e187 = f_2;
    f3_ = (_e186 * _e187);
    let _e192 = f_2;
    let _e197 = f2_;
    let _e200 = f3_;
    w0_1 = ((((vec2(1f) - (3f * _e192)) + (3f * _e197)) - _e200) / vec2(6f));
    let _e208 = f2_;
    let _e213 = f3_;
    w1_ = (((vec2(4f) - (6f * _e208)) + (3f * _e213)) / vec2(6f));
    let _e222 = f_2;
    let _e227 = f2_;
    let _e231 = f3_;
    w2_ = ((((vec2(1f) + (3f * _e222)) + (3f * _e227)) - (3f * _e231)) / vec2(6f));
    let _e238 = f3_;
    w3_ = (_e238 / vec2(6f));
    let _e243 = w0_1;
    let _e244 = w1_;
    g0_ = (_e243 + _e244);
    let _e247 = w2_;
    let _e248 = w3_;
    g1_ = (_e247 + _e248);
    let _e251 = i_4;
    let _e255 = w1_;
    let _e256 = g0_;
    let _e259 = sz;
    h0_ = (((_e251 - vec2(0.5f)) + (_e255 / _e256)) / _e259);
    let _e262 = i_4;
    let _e266 = w3_;
    let _e267 = g1_;
    let _e270 = sz;
    h1_ = (((_e262 + vec2(1.5f)) + (_e266 / _e267)) / _e270);
    let _e273 = g0_;
    let _e275 = g0_;
    let _e277 = h0_;
    let _e279 = textureSampleLevel(tCloudMapTexture, tCloudMapSampler, _e277, 0f);
    let _e282 = g1_;
    let _e284 = h1_;
    let _e286 = h0_;
    let _e290 = textureSampleLevel(tCloudMapTexture, tCloudMapSampler, vec2<f32>(_e284.x, _e286.y), 0f);
    let _e295 = g1_;
    let _e297 = g0_;
    let _e299 = h0_;
    let _e301 = h1_;
    let _e305 = textureSampleLevel(tCloudMapTexture, tCloudMapSampler, vec2<f32>(_e299.x, _e301.y), 0f);
    let _e308 = g1_;
    let _e310 = h1_;
    let _e312 = textureSampleLevel(tCloudMapTexture, tCloudMapSampler, _e310, 0f);
    return ((_e273.y * ((_e275.x * _e279.xyz) + (_e282.x * _e290.xyz))) + (_e295.y * ((_e297.x * _e305.xyz) + (_e308.x * _e312.xyz))));
}

fn cloudClimate(dirF: vec3<f32>) -> f32 {
    var dirF_1: vec3<f32>;
    var lat: f32;
    var cm: vec3<f32>;

    dirF_1 = dirF;
    let _e163 = dirF_1;
    lat = asin(clamp(_e163.y, -1f, 1f));
    let _e171 = global.uCloudMapMean;
    if (_e171 <= 0f) {
        let _e175 = lat;
        return (0.12f * cos((abs(_e175) * 6f)));
    }
    let _e181 = dirF_1;
    let _e183 = dirF_1;
    let _e190 = lat;
    let _e196 = cloudMapSmooth(vec2<f32>(((atan2(_e181.z, _e183.x) / 6.2832f) + 0.5f), ((_e190 / 3.14159f) + 0.5f)));
    cm = _e196;
    let _e198 = cm;
    let _e200 = cm;
    let _e204 = global.uCloudYear;
    let _e208 = cm;
    let _e212 = global.uCloudYear;
    let _e216 = global.uCloudMapMean;
    return ((((_e198.x + ((_e200.y - 0.5f) * _e204.x)) + ((_e208.z - 0.5f) * _e212.y)) - _e216) * 0.8f);
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
    let _e169 = global.uRadius;
    L0_ = (_e169 * 1f);
    let _e173 = global.uRadius;
    L1_ = (_e173 * 0.236f);
    let _e177 = foot_3;
    let _e178 = L0_;
    let _e179 = cloudFade(_e177, _e178);
    f0_ = _e179;
    let _e181 = foot_3;
    let _e182 = L1_;
    let _e183 = cloudFade(_e181, _e182);
    f1_ = _e183;
    let _e185 = q_1;
    qz = (_e185 * vec3<f32>(0.5f, 1f, 0.5f));
    let _e192 = f0_;
    if (_e192 > 0.999f) {
        local_21 = 0.682f;
    } else {
        let _e196 = qz;
        let _e197 = L0_;
        let _e201 = textureSampleLevel(tNoiseTexture, tNoiseSampler, (_e196 / vec3(_e197)), 0f);
        let _e204 = f0_;
        local_21 = mix(_e201.x, 0.682f, _e204);
    }
    let _e207 = local_21;
    a_3 = _e207;
    let _e209 = f1_;
    if (_e209 > 0.999f) {
        local_22 = 0.682f;
    } else {
        let _e213 = qz;
        let _e214 = L1_;
        let _e221 = textureSampleLevel(tNoiseTexture, tNoiseSampler, ((_e213 / vec3(_e214)) + vec3(0.5f)), 0f);
        let _e224 = f1_;
        local_22 = mix(_e221.x, 0.682f, _e224);
    }
    let _e227 = local_22;
    b_3 = _e227;
    let _e230 = f0_;
    let _e233 = f1_;
    spread = length(vec2<f32>((0.124f * _e230), (0.083f * _e233)));
    let _e239 = bias_1;
    let _e241 = spread;
    let _e244 = bias_1;
    let _e246 = spread;
    let _e248 = a_3;
    let _e251 = b_3;
    let _e255 = cloudN(((_e248 * 0.6f) + (_e251 * 0.4f)));
    let _e256 = clim_1;
    return smoothstep(((0.6f - _e239) - _e241), ((0.8f - _e244) + _e246), (_e255 + _e256));
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
    let _e169 = q_3;
    let _e170 = foot_5;
    let _e171 = bias_3;
    let _e172 = dirF_3;
    let _e173 = cloudClimate(_e172);
    let _e174 = cloudCoverC(_e169, _e170, _e171, _e173);
    return _e174;
}

fn cloudDetail(q_4: vec3<f32>, foot_6: f32) -> f32 {
    var q_5: vec3<f32>;
    var foot_7: f32;
    var L2_: f32;
    var f_3: f32;
    var local_23: f32;

    q_5 = q_4;
    foot_7 = foot_6;
    let _e165 = global.uRadius;
    L2_ = (_e165 * 0.064f);
    let _e169 = foot_7;
    let _e170 = L2_;
    let _e171 = cloudFade(_e169, _e170);
    f_3 = _e171;
    let _e173 = f_3;
    if (_e173 > 0.999f) {
        local_23 = 0.682f;
    } else {
        let _e177 = q_5;
        let _e178 = L2_;
        let _e182 = textureSampleLevel(tNoiseTexture, tNoiseSampler, (_e177 / vec3(_e178)), 0f);
        let _e185 = f_3;
        local_23 = mix(_e182.x, 0.682f, _e185);
    }
    let _e188 = local_23;
    return _e188;
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
    let _e165 = global.uCloudClock;
    T_3 = _e165.z;
    let _e168 = T_3;
    if (_e168 <= 0f) {
        {
            (*gA) = vec3<f32>(1f, 0f, 0f);
            (*gB) = vec3(0f);
            return;
        }
    }
    let _e178 = dirF_5;
    let _e182 = dirF_5;
    let _e187 = dirF_5;
    let _e193 = dirF_5;
    let _e197 = dirF_5;
    let _e202 = dirF_5;
    ph = ((((1.1f * _e178.x) + (0.7f * _e182.z)) - (0.5f * _e187.y)) + (0.35f * sin((((2.3f * _e193.y) + (1.7f * _e197.x)) - (0.9f * _e202.z)))));
    let _e210 = global.uCloudClock;
    let _e212 = T_3;
    let _e214 = ph;
    s_2 = (((_e210.x / _e212) + _e214) + 4f);
    let _e219 = s_2;
    a_4 = floor(_e219);
    let _e222 = s_2;
    let _e223 = a_4;
    fa = (_e222 - _e223);
    let _e226 = s_2;
    b_4 = floor((_e226 + 0.5f));
    let _e231 = s_2;
    let _e234 = b_4;
    fb = ((_e231 + 0.5f) - _e234);
    let _e238 = dirF_5;
    let _e248 = dirF_5;
    let _e260 = dirF_5;
    j_1 = (0.065f * ((sin((dot(_e238, vec3<f32>(5.1f, 3.7f, -4.3f)) + 1.3f)) + sin((dot(_e248, vec3<f32>(-3.9f, 7.3f, 6.1f)) + 0.4f))) + (0.6f * sin((dot(_e260, vec3<f32>(11.3f, -8.9f, 7.7f)) + 2.1f)))));
    let _e274 = s_2;
    let _e275 = j_1;
    fj_1 = fract((_e274 + _e275));
    let _e283 = fj_1;
    wa = smoothstep(0.4f, 0.6f, (1f - abs(((2f * _e283) - 1f))));
    let _e291 = wa;
    let _e292 = fa;
    let _e295 = T_3;
    let _e298 = global.uCloudClock;
    let _e300 = a_4;
    (*gA) = vec3<f32>(_e291, ((_e292 - 0.5f) * _e295), (2f * (_e298.y + _e300)));
    let _e305 = wa;
    let _e307 = fb;
    let _e310 = T_3;
    let _e313 = global.uCloudClock;
    let _e315 = b_4;
    (*gB) = vec3<f32>((1f - _e305), ((_e307 - 0.5f) * _e310), ((2f * (_e313.y + _e315)) + 1f));
    return;
}

fn cloudGenOff(idx: f32) -> vec3<f32> {
    var idx_1: f32;
    var h_6: u32;

    idx_1 = idx;
    let _e163 = idx_1;
    h_6 = (u32(_e163) * 2654435761u);
    let _e168 = h_6;
    let _e169 = h_6;
    h_6 = (_e168 ^ (_e169 >> 15u));
    let _e173 = h_6;
    h_6 = (_e173 * 2246822519u);
    let _e176 = h_6;
    let _e177 = h_6;
    h_6 = (_e176 ^ (_e177 >> 13u));
    let _e181 = h_6;
    let _e185 = h_6;
    let _e191 = h_6;
    return (((vec3<f32>(f32((_e181 & 1023u)), f32(((_e185 >> 10u) & 1023u)), f32(((_e191 >> 20u) & 1023u))) / vec3(1024f)) - vec3(0.5f)) * 400000f);
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
    let _e167 = dirF_7;
    lat_1 = asin(clamp(_e167.y, -1f, 1f));
    let _e175 = global.uCloudWind;
    let _e177 = lat_1;
    let _e178 = global.uCloudWind;
    let _e183 = global.uCloudWind;
    let _e189 = global.uCloudWind;
    let _e191 = lat_1;
    let _e193 = lat_1;
    U = (_e175.x * (sin((((_e177 * _e178.y) * 2f) + (_e183.z * 6.2832f))) + (_e189.w * exp(((-(_e191) * _e193) * 40f)))));
    let _e202 = dirF_7;
    let _e206 = dirF_7;
    east = normalize((vec3<f32>(-(_e202.z), 0f, _e206.x) + vec3<f32>(0.000001f, 0f, 0f)));
    let _e216 = pf_3;
    let _e217 = east;
    let _e218 = U;
    let _e220 = g_8;
    let _e224 = g_8;
    let _e226 = cloudGenOff(_e224.z);
    return ((_e216 + ((_e217 * _e218) * _e220.y)) + _e226);
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
    let _e171 = dirF_9;
    cloudGens(_e171, (&gA_1), (&gB_1));
    let _e178 = dirF_9;
    let _e179 = cloudClimate(_e178);
    clim_2 = _e179;
    let _e181 = gA_1;
    if (_e181.x > 0.005f) {
        let _e185 = c_12;
        let _e186 = gA_1;
        let _e188 = pf_5;
        let _e189 = dirF_9;
        let _e190 = gA_1;
        let _e191 = cloudAdvect(_e188, _e189, _e190);
        let _e192 = foot_9;
        let _e193 = bias_5;
        let _e194 = clim_2;
        let _e195 = cloudCoverC(_e191, _e192, _e193, _e194);
        c_12 = (_e185 + (_e186.x * _e195));
    }
    let _e198 = gB_1;
    if (_e198.x > 0.005f) {
        let _e202 = c_12;
        let _e203 = gB_1;
        let _e205 = pf_5;
        let _e206 = dirF_9;
        let _e207 = gB_1;
        let _e208 = cloudAdvect(_e205, _e206, _e207);
        let _e209 = foot_9;
        let _e210 = bias_5;
        let _e211 = clim_2;
        let _e212 = cloudCoverC(_e208, _e209, _e210, _e211);
        c_12 = (_e202 + (_e203.x * _e212));
    }
    let _e215 = c_12;
    return _e215;
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
    let _e171 = dirF_11;
    lat_2 = asin(clamp(_e171.y, -1f, 1f));
    let _e179 = global.uMode;
    if (_e179 < 0.5f) {
        {
            let _e182 = lat_2;
            let _e183 = global.uBands;
            let _e187 = global.uJetPhase;
            let _e192 = lat_2;
            let _e193 = global.uBands;
            band_1 = sin(((((_e182 * _e183) * 2f) + (_e187 * 6.2832f)) + (0.6f * sin(((_e192 * _e193) * 0.7f)))));
            let _e202 = q_7;
            let _e207 = textureSampleLevel(tNoiseTexture, tNoiseSampler, (_e202 / vec3(70000f)), 0f);
            n_2 = (_e207.x - 0.5f);
            let _e212 = i_6;
            if (_e212 == 0i) {
                let _e218 = band_1;
                let _e221 = n_2;
                let _e227 = global.uDeck[0];
                return smoothstep(-0.1f, 0.7f, (((_e218 * 0.8f) + (_e221 * 1.3f)) + _e227.w));
            }
            let _e231 = i_6;
            if (_e231 == 1i) {
                let _e237 = n_2;
                let _e244 = global.uDeck[1];
                return smoothstep(-0.45f, 0.45f, (((_e237 * 1.5f) + 0.1f) + _e244.w));
            }
            let _e250 = q_7;
            let _e258 = textureSampleLevel(tNoiseTexture, tNoiseSampler, ((_e250 / vec3(42000f)) + vec3(0.37f)), 0f);
            let _e262 = global.uDeck[2];
            return smoothstep(0.2f, 0.62f, (_e258.y + _e262.w));
        }
    }
    let _e266 = q_7;
    let _e267 = foot_11;
    let _e268 = i_6;
    let _e270 = global.uDeck[_e268];
    let _e272 = clim_4;
    let _e273 = cloudCoverC(_e266, _e267, _e270.w, _e272);
    return _e273;
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
    let _e173 = i_8;
    let _e175 = global.uDeck[_e173];
    dk = _e175;
    let _e177 = q_9;
    let _e178 = global.uShape;
    let _e183 = textureSampleLevel(tNoiseTexture, tNoiseSampler, (_e177 / vec3(_e178.x)), 0f);
    raw = _e183.x;
    let _e188 = raw;
    let _e190 = raw;
    let _e191 = gDeckFoot;
    let _e192 = global.uShape;
    let _e194 = cloudFade(_e191, _e192.x);
    base = mix(smoothstep(0.58f, 0.78f, _e188), _e190, _e194);
    let _e197 = q_9;
    let _e198 = global.uShape;
    let _e208 = textureSampleLevel(tNoiseTexture, tNoiseSampler, ((_e197 / vec3((_e198.x * 4f))) + vec3(0.21f)), 0f);
    tower = _e208.y;
    let _e211 = dk;
    let _e213 = dk;
    let _e215 = dk;
    let _e221 = tower;
    top_2 = (_e211.y - (((_e213.y - _e215.x) * 0.55f) * (1f - _e221)));
    let _e226 = h_8;
    let _e227 = dk;
    let _e230 = top_2;
    let _e231 = dk;
    x_1 = ((_e226 - _e227.x) / max((_e230 - _e231.x), 1f));
    let _e238 = x_1;
    (*frac) = clamp(_e238, 0f, 1f);
    let _e242 = x_1;
    let _e245 = x_1;
    if ((_e242 < 0f) || (_e245 > 1f)) {
        return 0f;
    }
    let _e250 = base;
    let _e252 = cov_1;
    let _e255 = cov_1;
    e_3 = clamp(((_e250 - (1f - _e252)) / max(_e255, 0.05f)), 0f, 1f);
    let _e263 = e_3;
    xt = sqrt(_e263);
    let _e266 = x_1;
    let _e267 = xt;
    if (_e266 > _e267) {
        return 0f;
    }
    let _e272 = x_1;
    let _e276 = xt;
    let _e278 = xt;
    let _e279 = x_1;
    prof_1 = (smoothstep(0f, 0.08f, _e272) * (1f - smoothstep((0.6f * _e276), _e278, _e279)));
    let _e284 = e_3;
    let _e285 = prof_1;
    d_9 = (_e284 * _e285);
    let _e288 = detail_1;
    let _e289 = d_9;
    if (_e288 && (_e289 > 0.001f)) {
        {
            let _e293 = q_9;
            let _e294 = global.uShape;
            let _e299 = textureSampleLevel(tNoiseTexture, tNoiseSampler, (_e293 / vec3(_e294.y)), 0f);
            det = _e299;
            let _e301 = det;
            let _e305 = det;
            let _e310 = det;
            let _e318 = d_9;
            er = (((((_e301.y * 0.625f) + (_e305.z * 0.25f)) + (_e310.w * 0.125f)) * 0.55f) * (1f - _e318));
            let _e322 = d_9;
            let _e323 = er;
            let _e326 = er;
            d_9 = clamp(((_e322 - _e323) / max((1f - _e326), 0.05f)), 0f, 1f);
        }
    }
    let _e334 = d_9;
    let _e335 = dk;
    return (_e334 * _e335.z);
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
    let _e176 = gA_3;
    if (_e176.x > 0.005f) {
        let _e180 = i_10;
        let _e181 = dirF_13;
        let _e182 = pf_7;
        let _e183 = dirF_13;
        let _e184 = gA_3;
        let _e185 = cloudAdvect(_e182, _e183, _e184);
        let _e186 = foot_13;
        let _e187 = clim_6;
        let _e188 = coverage(_e180, _e181, _e185, _e186, _e187);
        local_24 = _e188;
    } else {
        local_24 = 0f;
    }
    let _e191 = local_24;
    let _e192 = gB_3;
    if (_e192.x > 0.005f) {
        let _e196 = i_10;
        let _e197 = dirF_13;
        let _e198 = pf_7;
        let _e199 = dirF_13;
        let _e200 = gB_3;
        let _e201 = cloudAdvect(_e198, _e199, _e200);
        let _e202 = foot_13;
        let _e203 = clim_6;
        let _e204 = coverage(_e196, _e197, _e201, _e202, _e203);
        local_25 = _e204;
    } else {
        local_25 = 0f;
    }
    let _e207 = local_25;
    return vec2<f32>(_e191, _e207);
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
    let _e185 = gA_5;
    if (_e185.x > 0.005f) {
        let _e189 = d_10;
        let _e190 = gA_5;
        let _e192 = i_12;
        let _e193 = pf_9;
        let _e194 = dirF_15;
        let _e195 = gA_5;
        let _e196 = cloudAdvect(_e193, _e194, _e195);
        let _e197 = h_10;
        let _e198 = cv_1;
        let _e200 = detail_3;
        let _e203 = deckDensity(_e192, _e196, _e197, _e198.x, _e200, (&fa_1));
        d_10 = (_e189 + (_e190.x * _e203));
    }
    let _e206 = gB_5;
    if (_e206.x > 0.005f) {
        let _e210 = d_10;
        let _e211 = gB_5;
        let _e213 = i_12;
        let _e214 = pf_9;
        let _e215 = dirF_15;
        let _e216 = gB_5;
        let _e217 = cloudAdvect(_e214, _e215, _e216);
        let _e218 = h_10;
        let _e219 = cv_1;
        let _e221 = detail_3;
        let _e224 = deckDensity(_e213, _e217, _e218, _e219.y, _e221, (&fb_1));
        d_10 = (_e210 + (_e211.x * _e224));
    }
    let _e227 = gA_5;
    let _e229 = gB_5;
    if (_e227.x >= _e229.x) {
        let _e232 = fa_1;
        local_26 = _e232;
    } else {
        let _e233 = fb_1;
        local_26 = _e233;
    }
    let _e235 = local_26;
    (*frac_1) = _e235;
    let _e236 = d_10;
    return _e236;
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
    var nT: vec3<f32>;
    var muV: f32;
    var sR: vec3<f32>;
    var sM: vec3<f32>;
    var e_4: vec3<f32>;
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

    let _e162 = vUv_1;
    let _e163 = depthPixel(_e162);
    px = _e163;
    let _e165 = px;
    let _e171 = textureDimensions(tDepthTexture, 0i);
    ndc = ((((vec2<f32>(_e165) + vec2(0.5f)) / vec2<f32>(vec2<i32>(_e171))) * 2f) - vec2(1f));
    let _e182 = ndc;
    ndc.y = -(_e182.y);
    let _e185 = ndc;
    let _e187 = global.uTanHalf;
    let _e190 = ndc;
    let _e192 = global.uTanHalf;
    dView = normalize(vec3<f32>((_e185.x * _e187.x), (_e190.y * _e192.y), -1f));
    let _e200 = global.uCamRot;
    let _e201 = dView;
    D_4 = normalize((_e200 * _e201));
    let _e205 = D_4;
    let _e206 = fwidth(_e205);
    gPixA = length(_e206);
    let _e208 = px;
    let _e210 = textureLoad(tDepthTexture, _e208, 0i);
    depth = _e210.x;
    let _e213 = depth;
    let _e214 = isSkyDepth(_e213);
    if _e214 {
        local_27 = 1000000000000000000000000000000f;
    } else {
        let _e216 = depth;
        let _e217 = viewZFromDepth(_e216);
        let _e218 = dView;
        local_27 = (_e217 / max(-(_e218.z), 0.0001f));
    }
    let _e225 = local_27;
    sceneDist = _e225;
    let _e227 = global.uCenter;
    let _e228 = global.uTop;
    let _e229 = D_4;
    let _e230 = raySphere(_e227, _e228, _e229);
    hit = _e230;
    let _e232 = hit;
    let _e236 = hit;
    let _e238 = hit;
    if ((_e232.y <= 0f) || (_e236.x > _e238.y)) {
        {
            outL = vec4(0f);
            outT = vec4(1f);
            return;
        }
    }
    let _e246 = sceneDist;
    let _e249 = sceneDist;
    let _e250 = hit;
    skyPx = ((_e246 > 100000000000000000000000000000f) || (_e249 > _e250.y));
    let _e255 = skyPx;
    if _e255 {
        let _e257 = global.uSkyView;
        local_28 = (1f - _e257.x);
    } else {
        local_28 = 1f;
    }
    let _e262 = local_28;
    gHazeK = _e262;
    let _e263 = gHazeK;
    gAirSun = _e263;
    let _e264 = global.uCenter;
    let _e265 = D_4;
    tca_3 = dot(_e264, _e265);
    let _e268 = global.uCenter;
    let _e269 = tca_3;
    let _e270 = D_4;
    perp_3 = (_e268 - (_e269 * _e270));
    let _e274 = hit;
    t0_ = max(_e274.x, 0f);
    let _e279 = hit;
    let _e281 = sceneDist;
    let _e283 = t0_;
    let _e284 = global.uMaxDist;
    t1_ = min(min(_e279.y, _e281), (_e283 + (_e284 * 4f)));
    let _e290 = global.uCenter;
    let _e291 = global.uGround;
    let _e292 = D_4;
    let _e293 = raySphere(_e290, _e291, _e292);
    gh = _e293;
    let _e295 = gh;
    let _e299 = gh;
    let _e301 = gh;
    let _e305 = gh;
    if (((_e295.y > 0f) && (_e299.x < _e301.y)) && (_e305.x > 0f)) {
        let _e310 = t1_;
        let _e311 = gh;
        t1_ = min(_e310, _e311.x);
    }
    loop {
        let _e321 = i_13;
        if !((_e321 < 3i)) {
            break;
        }
        {
            let _e328 = i_13;
            let _e330 = global.uNumDecks;
            if (f32(_e328) >= _e330) {
                break;
            }
            let _e332 = sb;
            let _e333 = i_13;
            let _e335 = global.uDeck[_e333];
            sb = min(_e332, _e335.x);
            let _e338 = st_1;
            let _e339 = i_13;
            let _e341 = global.uDeck[_e339];
            st_1 = max(_e338, _e341.y);
        }
        continuing {
            let _e325 = i_13;
            i_13 = (_e325 + 1i);
        }
    }
    let _e344 = global.uRadius;
    let _e345 = sb;
    rB = (_e344 + _e345);
    let _e348 = global.uRadius;
    let _e349 = st_1;
    rT = (_e348 + _e349);
    let _e352 = global.uCenter;
    camR = length(_e352);
    let _e355 = global.uCenter;
    let _e356 = rT;
    let _e357 = D_4;
    let _e358 = raySphere(_e355, _e356, _e357);
    hT_2 = _e358;
    let _e360 = global.uCenter;
    let _e361 = rB;
    let _e362 = D_4;
    let _e363 = raySphere(_e360, _e361, _e362);
    hB = _e363;
    let _e367 = hB;
    let _e371 = hB;
    let _e373 = hB;
    hasB = ((_e367.y > 0f) && (_e371.x < _e373.y));
    let _e378 = camR;
    let _e379 = rT;
    if (_e378 > _e379) {
        {
            let _e381 = hT_2;
            tIn = _e381.x;
            let _e383 = hasB;
            let _e384 = hB;
            if (_e383 && (_e384.x > 0f)) {
                let _e389 = hB;
                local_29 = _e389.x;
            } else {
                let _e391 = hT_2;
                local_29 = _e391.y;
            }
            let _e394 = local_29;
            tOut = _e394;
        }
    } else {
        let _e395 = camR;
        let _e396 = rB;
        if (_e395 > _e396) {
            {
                tIn = 0f;
                let _e399 = hasB;
                let _e400 = hB;
                if (_e399 && (_e400.x > 0f)) {
                    let _e405 = hB;
                    local_30 = _e405.x;
                } else {
                    let _e407 = hT_2;
                    local_30 = _e407.y;
                }
                let _e410 = local_30;
                tOut = _e410;
            }
        } else {
            {
                let _e411 = hasB;
                if _e411 {
                    let _e412 = hB;
                    local_31 = _e412.y;
                } else {
                    local_31 = 1000000000000000000000000000000f;
                }
                let _e416 = local_31;
                tIn = _e416;
                let _e417 = hT_2;
                tOut = _e417.y;
            }
        }
    }
    let _e419 = hT_2;
    let _e423 = hT_2;
    let _e425 = hT_2;
    if ((_e419.y <= 0f) || (_e423.x > _e425.y)) {
        {
            tIn = 1000000000000000000000000000000f;
            tOut = 1000000000000000000000000000000f;
        }
    }
    let _e431 = tIn;
    let _e432 = t0_;
    let _e433 = t1_;
    tIn = clamp(_e431, _e432, _e433);
    let _e435 = tOut;
    let _e436 = tIn;
    let _e437 = global.uMaxDist;
    let _e440 = tIn;
    let _e441 = t1_;
    tOut = clamp(min(_e435, (_e436 + _e437)), _e440, _e441);
    let _e443 = D_4;
    let _e444 = global.uSunDir;
    cosT = dot(_e443, _e444);
    let _e447 = cosT;
    let _e448 = phaseRayleigh(_e447);
    pR = _e448;
    let _e450 = cosT;
    let _e451 = phaseMie(_e450);
    pM = _e451;
    let _e453 = cosT;
    let _e455 = hg(_e453, 0.62f);
    let _e456 = cosT;
    let _e459 = hg(_e456, -0.22f);
    pC = mix(_e455, _e459, 0.3f);
    let _e463 = global.uMoonE;
    moon = (_e463.y > 0f);
    let _e468 = D_4;
    let _e469 = global.uMoonDir;
    cosM = dot(_e468, _e469);
    let _e472 = cosM;
    let _e473 = phaseRayleigh(_e472);
    pRm = _e473;
    let _e475 = cosM;
    let _e477 = hg(_e475, 0.62f);
    let _e478 = cosM;
    let _e481 = hg(_e478, -0.22f);
    pCm = mix(_e477, _e481, 0.3f);
    let _e485 = cosM;
    let _e486 = phaseMie(_e485);
    pMm = _e486;
    let _e492 = gl_FragCoord_1;
    let _e494 = ign(_e492.xy);
    jitter_2 = _e494;
    let _e507 = global.uToFixed;
    let _e508 = global.uSunDir;
    sunDirF = (_e507 * _e508);
    let _e511 = global.uCenter;
    upC_2 = normalize(-(_e511));
    let _e515 = global.uCenter;
    let _e517 = global.uRadius;
    let _e519 = trueK((length(_e515) - _e517));
    kT = _e519;
    loop {
        let _e523 = seg;
        if !((_e523 < 3i)) {
            break;
        }
        {
            let _e530 = seg;
            if (_e530 == 0i) {
                let _e533 = t0_;
                local_33 = _e533;
            } else {
                let _e534 = seg;
                if (_e534 == 1i) {
                    let _e537 = tIn;
                    local_32 = _e537;
                } else {
                    let _e538 = tOut;
                    local_32 = _e538;
                }
                let _e540 = local_32;
                local_33 = _e540;
            }
            let _e542 = local_33;
            a_5 = _e542;
            let _e544 = seg;
            if (_e544 == 0i) {
                let _e547 = tIn;
                local_35 = _e547;
            } else {
                let _e548 = seg;
                if (_e548 == 1i) {
                    let _e551 = tOut;
                    local_34 = _e551;
                } else {
                    let _e552 = t1_;
                    local_34 = _e552;
                }
                let _e554 = local_34;
                local_35 = _e554;
            }
            let _e556 = local_35;
            b_5 = _e556;
            let _e558 = b_5;
            let _e559 = a_5;
            if (_e558 <= (_e559 + 1f)) {
                continue;
            }
            let _e563 = seg;
            if (_e563 == 1i) {
                let _e566 = global.uSteps;
                local_36 = i32(_e566);
            } else {
                let _e568 = b_5;
                let _e569 = a_5;
                local_36 = i32(clamp((ceil(((_e568 - _e569) / 250f)) + 1f), 2f, 18f));
            }
            let _e581 = local_36;
            N = _e581;
            let _e583 = b_5;
            let _e584 = a_5;
            let _e586 = N;
            dt = ((_e583 - _e584) / f32(_e586));
            let _e590 = seg;
            let _e593 = a_5;
            let _e597 = b_5;
            let _e598 = a_5;
            sq = (((_e590 == 0i) && (_e593 < 1f)) && ((_e597 - _e598) > 4000f));
            i_14 = 0i;
            loop {
                let _e606 = i_14;
                if !((_e606 < 96i)) {
                    break;
                }
                {
                    let _e613 = i_14;
                    let _e614 = N;
                    if (_e613 >= _e614) {
                        break;
                    }
                    let _e616 = a_5;
                    let _e617 = i_14;
                    let _e619 = jitter_2;
                    let _e621 = dt;
                    t_5 = (_e616 + ((f32(_e617) + _e619) * _e621));
                    let _e625 = dt;
                    dti = _e625;
                    let _e627 = sq;
                    if _e627 {
                        {
                            let _e628 = i_14;
                            let _e630 = jitter_2;
                            let _e632 = N;
                            u = ((f32(_e628) + _e630) / f32(_e632));
                            let _e636 = a_5;
                            let _e637 = b_5;
                            let _e638 = a_5;
                            let _e640 = u;
                            let _e642 = u;
                            t_5 = (_e636 + (((_e637 - _e638) * _e640) * _e642));
                            let _e645 = b_5;
                            let _e646 = a_5;
                            let _e650 = u;
                            let _e652 = N;
                            dti = (((((_e645 - _e646) * 2f) * _e650) / f32(_e652)) + 0.001f);
                        }
                    }
                    let _e657 = t_5;
                    let _e658 = tca_3;
                    let _e660 = D_4;
                    let _e662 = perp_3;
                    p_7 = (((_e657 - _e658) * _e660) - _e662);
                    let _e665 = p_7;
                    r_20 = length(_e665);
                    let _e668 = r_20;
                    let _e669 = global.uRadius;
                    h_11 = (_e668 - _e669);
                    let _e672 = p_7;
                    let _e673 = r_20;
                    let _e674 = upC_2;
                    let _e675 = kT;
                    let _e676 = trueUp(_e672, _e673, _e674, _e675);
                    nT = _e676;
                    let _e678 = D_4;
                    let _e679 = nT;
                    muV = dot(_e678, _e679);
                    let _e684 = muV;
                    let _e685 = muV;
                    gHazeH = sqrt(max(0f, (1f - (_e684 * _e685))));
                    let _e693 = r_20;
                    mediumAt(_e693, (&sR), (&sM), (&e_4));
                    let _e700 = nT;
                    let _e701 = global.uSunDir;
                    muS_2 = dot(_e700, _e701);
                    let _e704 = e_4;
                    ext_2 = _e704;
                    tauAbove = 0f;
                    tauBelow = 0f;
                    tlS = 0f;
                    cd = 0f;
                    frac_2 = 0.5f;
                    cc = vec3(1f);
                    let _e719 = global.uToFixed;
                    let _e720 = p_7;
                    pf_10 = (_e719 * _e720);
                    let _e723 = pf_10;
                    let _e724 = r_20;
                    dirF_16 = (_e723 / vec3(_e724));
                    let _e730 = t_5;
                    let _e731 = gPixA;
                    gDeckFoot = (_e730 * _e731);
                    let _e733 = dirF_16;
                    lat_3 = asin(clamp(_e733.y, -1f, 1f));
                    let _e741 = dirF_16;
                    cloudGens(_e741, (&gA_6), (&gB_6));
                    let _e746 = global.uMode;
                    if (_e746 > 0.5f) {
                        let _e749 = dirF_16;
                        let _e750 = cloudClimate(_e749);
                        local_37 = _e750;
                    } else {
                        local_37 = 0f;
                    }
                    let _e753 = local_37;
                    clim_7 = _e753;
                    k_4 = 0i;
                    loop {
                        let _e757 = k_4;
                        if !((_e757 < 3i)) {
                            break;
                        }
                        {
                            let _e764 = k_4;
                            let _e766 = global.uNumDecks;
                            if (f32(_e764) >= _e766) {
                                break;
                            }
                            let _e768 = k_4;
                            let _e770 = global.uDeck[_e768];
                            dk_1 = _e770;
                            let _e772 = h_11;
                            let _e773 = dk_1;
                            let _e776 = muS_2;
                            let _e777 = liftMu(_e776);
                            if ((_e772 > _e773.y) && (_e777 > 0.06f)) {
                                continue;
                            }
                            let _e781 = k_4;
                            let _e782 = pf_10;
                            let _e783 = dirF_16;
                            let _e784 = t_5;
                            let _e785 = gPixA;
                            let _e787 = gA_6;
                            let _e788 = gB_6;
                            let _e789 = clim_7;
                            let _e790 = deckCovG(_e781, _e782, _e783, (_e784 * _e785), _e787, _e788, _e789);
                            cv_2 = _e790;
                            let _e792 = gA_6;
                            let _e794 = cv_2;
                            let _e797 = gB_6;
                            let _e799 = cv_2;
                            cov_2 = ((_e792.x * _e794.x) + (_e797.x * _e799.y));
                            let _e804 = h_11;
                            let _e805 = dk_1;
                            if (_e804 > _e805.y) {
                                {
                                    let _e808 = tauBelow;
                                    let _e809 = dk_1;
                                    let _e811 = cov_2;
                                    let _e813 = dk_1;
                                    let _e815 = dk_1;
                                    let _e821 = global.uSigma;
                                    tauBelow = (_e808 + ((((_e809.z * _e811) * (_e813.y - _e815.x)) * 0.4f) * _e821));
                                    continue;
                                }
                            }
                            let _e824 = h_11;
                            let _e825 = dk_1;
                            if (_e824 < _e825.x) {
                                {
                                    let _e828 = tauAbove;
                                    let _e829 = dk_1;
                                    let _e831 = cov_2;
                                    let _e833 = dk_1;
                                    let _e835 = dk_1;
                                    let _e841 = global.uSigma;
                                    tauAbove = (_e828 + ((((_e829.z * _e831) * (_e833.y - _e835.x)) * 0.4f) * _e841));
                                    continue;
                                }
                            }
                            let _e844 = seg;
                            if (_e844 != 1i) {
                                continue;
                            }
                            let _e848 = k_4;
                            let _e849 = pf_10;
                            let _e850 = dirF_16;
                            let _e851 = h_11;
                            let _e852 = cv_2;
                            let _e853 = gA_6;
                            let _e854 = gB_6;
                            let _e858 = deckDenG(_e848, _e849, _e850, _e851, _e852, _e853, _e854, true, (&fr));
                            d_11 = _e858;
                            let _e860 = tauAbove;
                            let _e861 = dk_1;
                            let _e863 = cov_2;
                            let _e866 = dk_1;
                            let _e868 = h_11;
                            let _e870 = muS_2;
                            let _e880 = global.uSigma;
                            tauAbove = (_e860 + ((((_e861.z * _e863) * max(0f, ((_e866.y - _e868) - (max(_e870, 0f) * 5054f)))) * 0.25f) * _e880));
                            let _e883 = tauBelow;
                            let _e884 = dk_1;
                            let _e886 = cov_2;
                            let _e889 = h_11;
                            let _e890 = dk_1;
                            let _e893 = muS_2;
                            let _e904 = global.uSigma;
                            tauBelow = (_e883 + ((((_e884.z * _e886) * max(0f, ((_e889 - _e890.x) - (max(-(_e893), 0f) * 5054f)))) * 0.25f) * _e904));
                            let _e907 = d_11;
                            let _e908 = cd;
                            if (_e907 > _e908) {
                                {
                                    let _e910 = d_11;
                                    cd = _e910;
                                    let _e911 = fr;
                                    frac_2 = _e911;
                                    let _e912 = k_4;
                                    let _e914 = global.uDeckCol[_e912];
                                    cc = _e914;
                                    let _e915 = global.uMode;
                                    let _e918 = k_4;
                                    if ((_e915 < 0.5f) && (_e918 == 0i)) {
                                        let _e922 = cc;
                                        let _e925 = lat_3;
                                        let _e926 = global.uBands;
                                        let _e930 = global.uJetPhase;
                                        let _e937 = palette((0.5f + (0.35f * sin((((_e925 * _e926) * 2f) + (_e930 * 6.2832f))))));
                                        cc = mix(_e922, _e937, vec3(0.55f));
                                    }
                                    tl = 0f;
                                    ds = 350f;
                                    sl = 0f;
                                    let _e947 = pf_10;
                                    ps = _e947;
                                    j_2 = 0i;
                                    loop {
                                        let _e951 = j_2;
                                        if !((_e951 < 3i)) {
                                            break;
                                        }
                                        {
                                            let _e958 = ps;
                                            let _e959 = sunDirF;
                                            let _e960 = ds;
                                            ps = (_e958 + (_e959 * _e960));
                                            let _e963 = sl;
                                            let _e964 = ds;
                                            sl = (_e963 + _e964);
                                            let _e966 = h_11;
                                            let _e967 = muS_2;
                                            let _e968 = sl;
                                            hs = (_e966 + (_e967 * _e968));
                                            let _e973 = tl;
                                            let _e974 = k_4;
                                            let _e975 = ps;
                                            let _e976 = dirF_16;
                                            let _e977 = hs;
                                            let _e978 = cv_2;
                                            let _e979 = gA_6;
                                            let _e980 = gB_6;
                                            let _e984 = deckDenG(_e974, _e975, _e976, _e977, _e978, _e979, _e980, false, (&frs));
                                            let _e985 = ds;
                                            tl = (_e973 + (_e984 * _e985));
                                            let _e988 = ds;
                                            ds = (_e988 * 3.2f);
                                        }
                                        continuing {
                                            let _e955 = j_2;
                                            j_2 = (_e955 + 1i);
                                        }
                                    }
                                    let _e991 = tl;
                                    let _e992 = global.uSigma;
                                    tlS = ((_e991 * _e992) * 0.8f);
                                }
                            }
                        }
                        continuing {
                            let _e761 = k_4;
                            k_4 = (_e761 + 1i);
                        }
                    }
                    let _e996 = tauAbove;
                    let _e997 = tlS;
                    tauV = (_e996 + _e997);
                    let _e1000 = muS_2;
                    let _e1001 = liftMu(_e1000);
                    muT = _e1001;
                    let _e1006 = muT;
                    fromAbove = smoothstep(-0.02f, 0.06f, _e1006);
                    let _e1009 = tauBelow;
                    let _e1010 = tlS;
                    let _e1012 = muT;
                    let _e1017 = tauV;
                    let _e1018 = muT;
                    let _e1022 = fromAbove;
                    tauSun = mix(((_e1009 + _e1010) / max(-(_e1012), 0.06f)), (_e1017 / max(_e1018, 0.06f)), _e1022);
                    let _e1025 = tauSun;
                    shade = exp(-(_e1025));
                    let _e1029 = r_20;
                    let _e1030 = muS_2;
                    let _e1031 = sunTransmittance(_e1029, _e1030);
                    let _e1032 = shade;
                    sunT = (_e1031 * _e1032);
                    let _e1035 = global.uHeightCube;
                    let _e1039 = r_20;
                    let _e1040 = global.uRadius;
                    let _e1041 = global.uHeightCube;
                    if ((_e1035.x > 0.5f) && (_e1039 < (_e1040 + _e1041.z))) {
                        let _e1046 = sunT;
                        let _e1047 = global.uToFixed;
                        let _e1048 = p_7;
                        let _e1050 = global.uToFixed;
                        let _e1051 = global.uSunDir;
                        let _e1053 = global.uRadius;
                        let _e1054 = airShadow((_e1047 * _e1048), (_e1050 * _e1051), _e1053);
                        sunT = (_e1046 * _e1054);
                    }
                    let _e1056 = r_20;
                    let _e1057 = muS_2;
                    let _e1058 = multiScatter(_e1056, _e1057);
                    let _e1061 = shade;
                    ms = (_e1058 * (0.2f + (0.8f * _e1061)));
                    let _e1066 = sR;
                    let _e1067 = sunT;
                    let _e1068 = pR;
                    let _e1070 = ms;
                    let _e1073 = sM;
                    let _e1074 = sunT;
                    let _e1075 = pM;
                    let _e1077 = ms;
                    let _e1081 = gAirSun;
                    S = (((_e1066 * ((_e1067 * _e1068) + _e1070)) + (_e1073 * ((_e1074 * _e1075) + _e1077))) * _e1081);
                    let _e1088 = tauV;
                    let _e1092 = tauV;
                    let _e1094 = muS_2;
                    let _e1101 = muS_2;
                    dif = (max(0f, ((1f / (1f + (0.1125f * _e1088))) - exp((-(_e1092) / max(_e1094, 0.06f))))) * max(_e1101, 0f));
                    let _e1106 = S;
                    let _e1107 = sR;
                    let _e1108 = sM;
                    let _e1110 = r_20;
                    let _e1111 = muS_2;
                    let _e1112 = sunTransmittance(_e1110, _e1111);
                    let _e1114 = dif;
                    let _e1119 = gAirSun;
                    S = (_e1106 + ((((_e1107 + _e1108) * _e1112) * ((_e1114 * 0.5f) / PI_A)) * _e1119));
                    Sm = vec3(0f);
                    mT = vec3(0f);
                    mms = vec3(0f);
                    mT0_ = vec3(0f);
                    let _e1134 = moon;
                    if _e1134 {
                        {
                            let _e1135 = nT;
                            let _e1136 = global.uMoonDir;
                            muM = dot(_e1135, _e1136);
                            let _e1139 = tauV;
                            let _e1141 = muM;
                            shM = exp((-(_e1139) / max(_e1141, 0.06f)));
                            let _e1147 = r_20;
                            let _e1148 = muM;
                            let _e1149 = sunTransmittance(_e1147, _e1148);
                            mT0_ = _e1149;
                            let _e1150 = mT0_;
                            let _e1151 = shM;
                            mT = (_e1150 * _e1151);
                            let _e1153 = r_20;
                            let _e1154 = muM;
                            let _e1155 = multiScatter(_e1153, _e1154);
                            let _e1158 = shM;
                            mms = (_e1155 * (0.2f + (0.8f * _e1158)));
                            let _e1162 = sR;
                            let _e1163 = mT;
                            let _e1164 = pRm;
                            let _e1166 = mms;
                            let _e1169 = sM;
                            let _e1170 = mT;
                            let _e1171 = pMm;
                            let _e1173 = mms;
                            Sm = ((_e1162 * ((_e1163 * _e1164) + _e1166)) + (_e1169 * ((_e1170 * _e1171) + _e1173)));
                            let _e1181 = tauV;
                            let _e1185 = shM;
                            let _e1188 = muM;
                            difM = (max(0f, ((1f / (1f + (0.1125f * _e1181))) - _e1185)) * max(_e1188, 0f));
                            let _e1193 = Sm;
                            let _e1194 = sR;
                            let _e1195 = sM;
                            let _e1197 = mT0_;
                            let _e1199 = difM;
                            Sm = (_e1193 + (((_e1194 + _e1195) * _e1197) * ((_e1199 * 0.5f) / PI_A)));
                        }
                    }
                    let _e1205 = cd;
                    if (_e1205 > 0f) {
                        {
                            let _e1208 = cd;
                            let _e1209 = global.uSigma;
                            sc = (_e1208 * _e1209);
                            let _e1212 = ms;
                            let _e1217 = frac_2;
                            let _e1220 = r_20;
                            let _e1221 = muS_2;
                            let _e1222 = sunTransmittance(_e1220, _e1221);
                            let _e1227 = frac_2;
                            amb = (((_e1212 * 14f) * mix(0.45f, 1f, _e1217)) + ((_e1222 * 0.05f) * (0.3f + (0.7f * _e1227))));
                            let _e1234 = cd;
                            powder = (1f - exp((-(_e1234) * 3f)));
                            let _e1241 = S;
                            let _e1242 = sc;
                            let _e1243 = cc;
                            let _e1245 = sunT;
                            let _e1246 = pC;
                            let _e1250 = powder;
                            let _e1254 = amb;
                            S = (_e1241 + ((_e1242 * _e1243) * (((_e1245 * _e1246) * (0.6f + (0.8f * _e1250))) + _e1254)));
                            let _e1258 = moon;
                            if _e1258 {
                                let _e1259 = Sm;
                                let _e1260 = sc;
                                let _e1261 = cc;
                                let _e1263 = mT;
                                let _e1264 = pCm;
                                let _e1268 = powder;
                                let _e1272 = mms;
                                let _e1277 = frac_2;
                                let _e1281 = mT0_;
                                let _e1286 = frac_2;
                                Sm = (_e1259 + ((_e1260 * _e1261) * ((((_e1263 * _e1264) * (0.6f + (0.8f * _e1268))) + ((_e1272 * 14f) * mix(0.45f, 1f, _e1277))) + ((_e1281 * 0.05f) * (0.3f + (0.7f * _e1286))))));
                            }
                            let _e1293 = ext_2;
                            let _e1294 = sc;
                            ext_2 = (_e1293 + vec3(_e1294));
                            let _e1297 = Tc;
                            let _e1298 = sc;
                            let _e1300 = dti;
                            Tc = (_e1297 * exp((-(_e1298) * _e1300)));
                            let _e1304 = global.uFlash;
                            if (_e1304.w > 0f) {
                                {
                                    let _e1308 = p_7;
                                    let _e1309 = global.uCenter;
                                    let _e1311 = global.uFlash;
                                    fd = ((_e1308 + _e1309) - _e1311.xyz);
                                    let _e1315 = S;
                                    let _e1316 = sc;
                                    let _e1322 = global.uFlash;
                                    let _e1325 = fd;
                                    let _e1326 = fd;
                                    S = (_e1315 + (((_e1316 * vec3<f32>(0.75f, 0.82f, 1f)) * _e1322.w) * exp((-(dot(_e1325, _e1326)) / 60000000f))));
                                }
                            }
                        }
                    }
                    let _e1334 = ext_2;
                    let _e1336 = dti;
                    Ts = exp((-(_e1334) * _e1336));
                    let _e1340 = L_2;
                    let _e1341 = T_4;
                    let _e1342 = S;
                    let _e1343 = S;
                    let _e1344 = Ts;
                    let _e1348 = ext_2;
                    L_2 = (_e1340 + ((_e1341 * (_e1342 - (_e1343 * _e1344))) / max(_e1348, vec3(0.000000000001f))));
                    let _e1354 = moon;
                    if _e1354 {
                        let _e1355 = Lm;
                        let _e1356 = T_4;
                        let _e1357 = Sm;
                        let _e1358 = Sm;
                        let _e1359 = Ts;
                        let _e1363 = ext_2;
                        Lm = (_e1355 + ((_e1356 * (_e1357 - (_e1358 * _e1359))) / max(_e1363, vec3(0.000000000001f))));
                    }
                    let _e1369 = global.uGlow;
                    let _e1372 = h_11;
                    if ((_e1369 > 0f) && (_e1372 < -20000f)) {
                        let _e1377 = Lth;
                        let _e1378 = T_4;
                        let _e1379 = h_11;
                        let _e1380 = thermalGlow(_e1379);
                        let _e1384 = Ts;
                        Lth = (_e1377 + ((_e1378 * _e1380) * (vec3(1f) - _e1384)));
                    }
                    let _e1388 = global.uThermal;
                    if (_e1388.x > 0f) {
                        {
                            let _e1392 = a_5;
                            let _e1393 = i_14;
                            let _e1395 = dt;
                            let _e1399 = dt;
                            let _e1402 = ext_2;
                            te = ((_e1392 + (f32(_e1393) * _e1395)) + min((0.5f * _e1399), (1f / max(_e1402.y, 0.000000000001f))));
                            let _e1410 = Lth;
                            let _e1411 = T_4;
                            let _e1414 = Ts;
                            let _e1417 = te;
                            let _e1418 = tca_3;
                            let _e1420 = D_4;
                            let _e1422 = perp_3;
                            let _e1425 = airHeatGlow(length((((_e1417 - _e1418) * _e1420) - _e1422)));
                            Lth = (_e1410 + ((_e1411 * (vec3(1f) - _e1414)) * _e1425));
                        }
                    }
                    let _e1428 = Lth;
                    let _e1429 = T_4;
                    let _e1430 = p_7;
                    let _e1431 = r_20;
                    let _e1432 = airLight(_e1430, _e1431);
                    let _e1434 = dti;
                    Lth = (_e1428 + ((_e1429 * _e1432) * _e1434));
                    let _e1437 = T_4;
                    let _e1438 = Ts;
                    T_4 = (_e1437 * _e1438);
                    let _e1440 = T_4;
                    let _e1442 = T_4;
                    let _e1444 = T_4;
                    if (max(_e1440.x, max(_e1442.y, _e1444.z)) < 0.003f) {
                        {
                            T_4 = vec3(0f);
                            break;
                        }
                    }
                }
                continuing {
                    let _e610 = i_14;
                    i_14 = (_e610 + 1i);
                }
            }
        }
        continuing {
            let _e527 = seg;
            seg = (_e527 + 1i);
        }
    }
    let _e1452 = global.uGlow;
    let _e1455 = T_4;
    let _e1457 = T_4;
    let _e1459 = T_4;
    if ((_e1452 > 0f) && (max(_e1455.x, max(_e1457.y, _e1459.z)) < 0.01f)) {
        {
            let _e1466 = t1_;
            let _e1467 = tca_3;
            let _e1469 = D_4;
            let _e1471 = perp_3;
            pe = (((_e1466 - _e1467) * _e1469) - _e1471);
            let _e1474 = Lth;
            let _e1475 = T_4;
            let _e1476 = pe;
            let _e1478 = global.uRadius;
            let _e1480 = thermalGlow((length(_e1476) - _e1478));
            Lth = (_e1474 + (_e1475 * _e1480));
        }
    }
    let _e1485 = D_4;
    let _e1486 = tca_3;
    let _e1487 = perp_3;
    let _e1488 = hit;
    let _e1490 = sceneDist;
    let _e1492 = jitter_2;
    auroraRay(_e1485, _e1486, _e1487, min(_e1488.y, _e1490), _e1492, (&aNear), (&aFar));
    let _e1497 = skyPx;
    if _e1497 {
        let _e1498 = D_4;
        let _e1499 = skyFar(_e1498);
        let _e1500 = global.uSunE;
        local_38 = (_e1499 * _e1500);
    } else {
        local_38 = vec3(0f);
    }
    let _e1505 = local_38;
    far_1 = _e1505;
    let _e1507 = L_2;
    let _e1508 = global.uSunE;
    let _e1510 = Lm;
    let _e1511 = global.uMoonE;
    let _e1514 = Lth;
    let _e1516 = aNear;
    let _e1518 = T_4;
    let _e1519 = aFar;
    let _e1522 = Tc;
    let _e1523 = far_1;
    let _e1525 = ((((((_e1507 * _e1508) + (_e1510 * _e1511)) + _e1514) + _e1516) + (_e1518 * _e1519)) + (_e1522 * _e1523));
    outL = vec4<f32>(_e1525.x, _e1525.y, _e1525.z, 1f);
    let _e1531 = T_4;
    outT = vec4<f32>(_e1531.x, _e1531.y, _e1531.z, 1f);
    return;
}

@fragment 
fn main(@location(0) vUv: vec2<f32>, @builtin(position) gl_FragCoord: vec4<f32>) -> FragmentOutput {
    vUv_1 = vUv;
    gl_FragCoord_1 = gl_FragCoord;
    main_1();
    let _e199 = outL;
    let _e201 = outT;
    return FragmentOutput(_e199, _e201);
}
`;
