// Generated offline from the existing renderer equations. See tools/shaders/.
export const layout = {
  "uniforms": [
    {
      "name": "viewMatrix",
      "type": "mat4",
      "count": 0,
      "align": 16,
      "size": 64,
      "stride": 64,
      "offset": 0
    },
    {
      "name": "projectionMatrix",
      "type": "mat4",
      "count": 0,
      "align": 16,
      "size": 64,
      "stride": 64,
      "offset": 64
    },
    {
      "name": "uSunDir",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 128
    },
    {
      "name": "uSunE",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 144
    },
    {
      "name": "uCenter",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 160
    },
    {
      "name": "uRadius",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 172
    },
    {
      "name": "uToFixed",
      "type": "mat3",
      "count": 0,
      "align": 16,
      "size": 48,
      "stride": 48,
      "offset": 176
    },
    {
      "name": "uTime",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 224
    },
    {
      "name": "uCloud",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 240
    },
    {
      "name": "uCloudOn",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 256
    },
    {
      "name": "uCloudOpacity",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 260
    },
    {
      "name": "uLavaColor",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 272
    },
    {
      "name": "uOriginMod",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 288
    },
    {
      "name": "uFallTop",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 300
    },
    {
      "name": "uFallFoot",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 304
    },
    {
      "name": "uFallW",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 316
    },
    {
      "name": "uFallAcr",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 320
    },
    {
      "name": "uFall1",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 336
    },
    {
      "name": "uFall2",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 352
    },
    {
      "name": "uDebug",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 368
    },
    {
      "name": "uNear",
      "type": "vec2",
      "count": 0,
      "align": 8,
      "size": 8,
      "stride": 8,
      "offset": 376
    },
    {
      "name": "uNearUp",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 384
    },
    {
      "name": "uNearMode",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 396
    },
    {
      "name": "uNearBand",
      "type": "vec2",
      "count": 0,
      "align": 8,
      "size": 8,
      "stride": 8,
      "offset": 400
    },
    {
      "name": "uHasAtmo",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 408
    },
    {
      "name": "uBottom",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 412
    },
    {
      "name": "uTop",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 416
    },
    {
      "name": "uGround",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 420
    },
    {
      "name": "uTrueK",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 424
    },
    {
      "name": "uSunLift",
      "type": "vec2",
      "count": 0,
      "align": 8,
      "size": 8,
      "stride": 8,
      "offset": 432
    },
    {
      "name": "uCloudMapMean",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 440
    },
    {
      "name": "uSeason",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 448
    },
    {
      "name": "uCloudYear",
      "type": "vec2",
      "count": 0,
      "align": 8,
      "size": 8,
      "stride": 8,
      "offset": 464
    },
    {
      "name": "uCloudClock",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 480
    },
    {
      "name": "uCloudWind",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 496
    },
    {
      "name": "uCSOrigin",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 512
    },
    {
      "name": "uCSE",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 528
    },
    {
      "name": "uCSN",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 544
    },
    {
      "name": "uCSInvL",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 556
    },
    {
      "name": "uCSLod",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 560
    },
    {
      "name": "uCSOn",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 564
    },
    {
      "name": "uCloudTau",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 568
    },
    {
      "name": "uThermal",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 576
    },
    {
      "name": "uHeightCube",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 592
    },
    {
      "name": "uSunShadow",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 608
    },
    {
      "name": "uSunShadowVP0",
      "type": "mat4",
      "count": 0,
      "align": 16,
      "size": 64,
      "stride": 64,
      "offset": 624
    },
    {
      "name": "uSunShadowVP1",
      "type": "mat4",
      "count": 0,
      "align": 16,
      "size": 64,
      "stride": 64,
      "offset": 688
    },
    {
      "name": "uSunShadowL0",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 752
    },
    {
      "name": "uSunShadowL1",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 768
    },
    {
      "name": "uSunShadowDir",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 784
    },
    {
      "name": "uMoonDir",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 800
    },
    {
      "name": "uMoonE",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 816
    },
    {
      "name": "uLiquid",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 832
    },
    {
      "name": "uLiquid2",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 848
    },
    {
      "name": "uLiquid3",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 864
    },
    {
      "name": "uWaveK",
      "type": "vec4",
      "count": 36,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 880
    },
    {
      "name": "uZMode",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 1456
    },
    {
      "name": "uZNear",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 1460
    },
    {
      "name": "uZFar",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 1464
    },
    {
      "name": "uZLogFC",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 1468
    }
  ],
  "textures": [
    {
      "name": "tDetail",
      "type": "sampler2D",
      "count": 0,
      "binding": 1,
      "samplerBinding": 2
    },
    {
      "name": "tTrans",
      "type": "sampler2D",
      "count": 0,
      "binding": 3,
      "samplerBinding": 4
    },
    {
      "name": "tIrr",
      "type": "sampler2D",
      "count": 0,
      "binding": 5,
      "samplerBinding": 6
    },
    {
      "name": "tNoise",
      "type": "sampler3D",
      "count": 0,
      "binding": 7,
      "samplerBinding": 8
    },
    {
      "name": "tCloudMap",
      "type": "sampler2D",
      "count": 0,
      "binding": 9,
      "samplerBinding": 10
    },
    {
      "name": "tSeasonMap",
      "type": "sampler2D",
      "count": 0,
      "binding": 11,
      "samplerBinding": 12
    },
    {
      "name": "tSeasonIce",
      "type": "sampler2D",
      "count": 0,
      "binding": 13,
      "samplerBinding": 14
    },
    {
      "name": "tCloudShadow",
      "type": "sampler2D",
      "count": 0,
      "binding": 15,
      "samplerBinding": 16
    },
    {
      "name": "tHeightCube",
      "type": "sampler2DArray",
      "count": 0,
      "binding": 17,
      "samplerBinding": 18
    },
    {
      "name": "tShadowAtlas",
      "type": "sampler2D",
      "count": 0,
      "binding": 19,
      "samplerBinding": 20
    },
    {
      "name": "tOpaque",
      "type": "sampler2D",
      "count": 0,
      "binding": 21,
      "samplerBinding": 22
    },
    {
      "name": "tWaterDepth",
      "type": "sampler2D",
      "count": 0,
      "binding": 23,
      "samplerBinding": 24
    }
  ],
  "bytes": 1472,
  "group": 1,
  "attributes": []
};
export const code = /* wgsl */`
struct Params {
    viewMatrix: mat4x4<f32>,
    projectionMatrix: mat4x4<f32>,
    uSunDir: vec3<f32>,
    uSunE: vec3<f32>,
    uCenter: vec3<f32>,
    uRadius: f32,
    uToFixed: mat3x3<f32>,
    uTime: f32,
    uCloud: vec4<f32>,
    uCloudOn: f32,
    uCloudOpacity: f32,
    uLavaColor: vec3<f32>,
    uOriginMod: vec3<f32>,
    uFallTop: f32,
    uFallFoot: vec3<f32>,
    uFallW: f32,
    uFallAcr: vec3<f32>,
    uFall1_: vec4<f32>,
    uFall2_: vec4<f32>,
    uDebug: f32,
    uNear: vec2<f32>,
    uNearUp: vec3<f32>,
    uNearMode: f32,
    uNearBand: vec2<f32>,
    uHasAtmo: f32,
    uBottom: f32,
    uTop: f32,
    uGround: f32,
    uTrueK: f32,
    uSunLift: vec2<f32>,
    uCloudMapMean: f32,
    uSeason: vec4<f32>,
    uCloudYear: vec2<f32>,
    uCloudClock: vec4<f32>,
    uCloudWind: vec4<f32>,
    uCSOrigin: vec3<f32>,
    uCSE: vec3<f32>,
    uCSN: vec3<f32>,
    uCSInvL: f32,
    uCSLod: f32,
    uCSOn: f32,
    uCloudTau: f32,
    uThermal: vec4<f32>,
    uHeightCube: vec4<f32>,
    uSunShadow: vec4<f32>,
    uSunShadowVP0_: mat4x4<f32>,
    uSunShadowVP1_: mat4x4<f32>,
    uSunShadowL0_: vec4<f32>,
    uSunShadowL1_: vec4<f32>,
    uSunShadowDir: vec3<f32>,
    uMoonDir: vec3<f32>,
    uMoonE: vec3<f32>,
    uLiquid: vec4<f32>,
    uLiquid2_: vec4<f32>,
    uLiquid3_: vec4<f32>,
    uWaveK: array<vec4<f32>, 36>,
    uZMode: f32,
    uZNear: f32,
    uZFar: f32,
    uZLogFC: f32,
}

struct Waves {
    g: vec3<f32>,
    var_: f32,
    var0_: f32,
    res: f32,
    crest: f32,
}

struct FragmentOutput {
    @location(0) fragmentColor: vec4<f32>,
}

const PI: f32 = 3.1415927f;
const NROT: mat3x3<f32> = mat3x3<f32>(vec3<f32>(0f, 0.8f, 0.6f), vec3<f32>(-0.8f, 0.36f, -0.48f), vec3<f32>(-0.6f, -0.48f, 0.64f));
const SNOW_DEPTH_PER_MM: f32 = 0.003333f;
const DDF_SNOW: f32 = 4f;
const HC_N: array<vec3<f32>, 6> = array<vec3<f32>, 6>(vec3<f32>(1f, 0f, 0f), vec3<f32>(-1f, 0f, 0f), vec3<f32>(0f, 1f, 0f), vec3<f32>(0f, -1f, 0f), vec3<f32>(0f, 0f, 1f), vec3<f32>(0f, 0f, -1f));
const HC_U: array<vec3<f32>, 6> = array<vec3<f32>, 6>(vec3<f32>(0f, 0f, -1f), vec3<f32>(0f, 0f, 1f), vec3<f32>(1f, 0f, 0f), vec3<f32>(1f, 0f, 0f), vec3<f32>(1f, 0f, 0f), vec3<f32>(-1f, 0f, 0f));
const HC_V: array<vec3<f32>, 6> = array<vec3<f32>, 6>(vec3<f32>(0f, 1f, 0f), vec3<f32>(0f, 1f, 0f), vec3<f32>(0f, 0f, -1f), vec3<f32>(0f, 0f, 1f), vec3<f32>(0f, 1f, 0f), vec3<f32>(0f, 1f, 0f));
const POLY_MAX: i32 = 12i;

@group(1) @binding(0) 
var<uniform> global: Params;
@group(1) @binding(1) 
var tDetailTexture: texture_2d<f32>;
@group(1) @binding(2) 
var tDetailSampler: sampler;
@group(1) @binding(3) 
var tTransTexture: texture_2d<f32>;
@group(1) @binding(4) 
var tTransSampler: sampler;
@group(1) @binding(5) 
var tIrrTexture: texture_2d<f32>;
@group(1) @binding(6) 
var tIrrSampler: sampler;
@group(1) @binding(7) 
var tNoiseTexture: texture_3d<f32>;
@group(1) @binding(8) 
var tNoiseSampler: sampler;
@group(1) @binding(9) 
var tCloudMapTexture: texture_2d<f32>;
@group(1) @binding(10) 
var tCloudMapSampler: sampler;
@group(1) @binding(11) 
var tSeasonMapTexture: texture_2d<f32>;
@group(1) @binding(12) 
var tSeasonMapSampler: sampler;
@group(1) @binding(13) 
var tSeasonIceTexture: texture_2d<f32>;
@group(1) @binding(14) 
var tSeasonIceSampler: sampler;
@group(1) @binding(15) 
var tCloudShadowTexture: texture_2d<f32>;
@group(1) @binding(16) 
var tCloudShadowSampler: sampler;
@group(1) @binding(17) 
var tHeightCubeTexture: texture_2d_array<f32>;
@group(1) @binding(18) 
var tHeightCubeSampler: sampler;
@group(1) @binding(19) 
var tShadowAtlasTexture: texture_2d<f32>;
@group(1) @binding(20) 
var tShadowAtlasSampler: sampler;
@group(1) @binding(21) 
var tOpaqueTexture: texture_2d<f32>;
@group(1) @binding(22) 
var tOpaqueSampler: sampler;
@group(1) @binding(23) 
var tWaterDepthTexture: texture_2d<f32>;
@group(1) @binding(24) 
var tWaterDepthSampler: sampler;
var<private> fragmentColor: vec4<f32>;
var<private> vNearRel_1: vec3<f32>;
var<private> vWorldPos_1: vec3<f32>;
var<private> vNormal_1: vec3<f32>;
var<private> vFixedPos_1: vec3<f32>;
var<private> vFixedNormal_1: vec3<f32>;
var<private> vCol_1: vec4<f32>;
var<private> vMat_1: vec4<f32>;
var<private> vExt_1: vec4<f32>;
var<private> vLiq_1: vec4<f32>;
var<private> vFlw_1: vec4<f32>;
var<private> vShore_1: f32;
var<private> vMorphK_1: f32;
var<private> cloudDirZ: f32 = 1f;
var<private> cloudTotZ: f32 = 1f;

fn lensTrueZ(zd: f32) -> f32 {
    var zd_1: f32;
    var hD: f32;
    var hT: f32;
    var local: f32;

    zd_1 = zd;
    let _e161 = global.uSunLift;
    hD = (1.5707963f + _e161.x);
    let _e166 = global.uSunLift;
    hT = (1.5707963f + _e166.y);
    let _e170 = zd_1;
    let _e171 = hD;
    if (_e170 <= _e171) {
        let _e173 = zd_1;
        let _e174 = hT;
        let _e176 = hD;
        local = ((_e173 * _e174) / _e176);
    } else {
        let _e178 = hT;
        let _e179 = zd_1;
        let _e180 = hD;
        let _e183 = hT;
        let _e187 = hD;
        local = (_e178 + (((_e179 - _e180) * (3.1415927f - _e183)) / (3.1415927f - _e187)));
    }
    let _e192 = local;
    return _e192;
}

fn liftMu(mu: f32) -> f32 {
    var mu_1: f32;

    mu_1 = mu;
    let _e160 = global.uSunLift;
    let _e162 = global.uSunLift;
    if (_e160.x <= _e162.y) {
        let _e165 = mu_1;
        return _e165;
    }
    let _e166 = mu_1;
    let _e172 = lensTrueZ(acos(clamp(_e166, -1f, 1f)));
    return cos(_e172);
}

fn transmittanceUV(r: f32, mu_2: f32) -> vec2<f32> {
    var r_1: f32;
    var mu_3: f32;
    var H: f32;
    var rho: f32;
    var disc: f32;
    var d: f32;
    var dMin: f32;
    var dMax: f32;

    r_1 = r;
    mu_3 = mu_2;
    let _e163 = global.uTop;
    let _e164 = global.uTop;
    let _e166 = global.uBottom;
    let _e167 = global.uBottom;
    H = sqrt(max(0f, ((_e163 * _e164) - (_e166 * _e167))));
    let _e174 = r_1;
    let _e175 = r_1;
    let _e177 = global.uBottom;
    let _e178 = global.uBottom;
    rho = sqrt(max(0f, ((_e174 * _e175) - (_e177 * _e178))));
    let _e184 = r_1;
    let _e185 = r_1;
    let _e187 = mu_3;
    let _e188 = mu_3;
    let _e193 = global.uTop;
    let _e194 = global.uTop;
    disc = (((_e184 * _e185) * ((_e187 * _e188) - 1f)) + (_e193 * _e194));
    let _e199 = r_1;
    let _e201 = mu_3;
    let _e203 = disc;
    d = max(0f, ((-(_e199) * _e201) + sqrt(max(_e203, 0f))));
    let _e210 = global.uTop;
    let _e211 = r_1;
    dMin = (_e210 - _e211);
    let _e214 = rho;
    let _e215 = H;
    dMax = (_e214 + _e215);
    let _e218 = d;
    let _e219 = dMin;
    let _e221 = dMax;
    let _e222 = dMin;
    let _e227 = rho;
    let _e228 = H;
    return vec2<f32>(((_e218 - _e219) / max((_e221 - _e222), 0.000001f)), (_e227 / max(_e228, 0.000001f)));
}

fn atmoSunTransmittance(r_2: f32, mu_4: f32) -> vec3<f32> {
    var r_3: f32;
    var mu_5: f32;
    var Rg: f32;
    var sinH: f32;
    var cosH: f32;
    var vis: f32;
    var uv: vec2<f32>;

    r_3 = r_2;
    mu_5 = mu_4;
    let _e162 = mu_5;
    let _e163 = liftMu(_e162);
    mu_5 = _e163;
    let _e164 = global.uGround;
    let _e165 = global.uTrueK;
    Rg = (_e164 * max(_e165, 1f));
    let _e170 = Rg;
    let _e171 = Rg;
    let _e172 = r_3;
    let _e173 = global.uGround;
    sinH = (_e170 / (_e171 + max((_e172 - _e173), 0f)));
    let _e182 = sinH;
    let _e183 = sinH;
    cosH = -(sqrt(max(0f, (1f - (_e182 * _e183)))));
    let _e190 = cosH;
    let _e193 = cosH;
    let _e196 = mu_5;
    vis = smoothstep((_e190 - 0.01f), (_e193 + 0.01f), _e196);
    let _e199 = global.uHasAtmo;
    if (_e199 < 0.5f) {
        let _e202 = vis;
        return vec3(_e202);
    }
    let _e204 = r_3;
    let _e205 = global.uBottom;
    let _e206 = global.uTop;
    let _e208 = mu_5;
    let _e209 = transmittanceUV(clamp(_e204, _e205, _e206), _e208);
    uv = _e209;
    let _e218 = uv;
    uv = (vec2<f32>(0.001953125f, 0.0078125f) + (_e218 * vec2<f32>(0.99609375f, 0.984375f)));
    let _e228 = uv;
    let _e230 = textureSampleLevel(tTransTexture, tTransSampler, _e228, 0f);
    let _e232 = vis;
    return (_e230.xyz * _e232);
}

fn atmoSkyIrradiance(r_4: f32, mu_6: f32) -> vec3<f32> {
    var r_5: f32;
    var mu_7: f32;
    var uv_1: vec2<f32>;

    r_5 = r_4;
    mu_7 = mu_6;
    let _e162 = global.uHasAtmo;
    if (_e162 < 0.5f) {
        return vec3(0f);
    }
    let _e167 = mu_7;
    let _e168 = liftMu(_e167);
    mu_7 = _e168;
    let _e169 = mu_7;
    let _e174 = r_5;
    let _e175 = global.uGround;
    let _e177 = global.uTop;
    let _e178 = global.uGround;
    uv_1 = vec2<f32>(((_e169 * 0.5f) + 0.5f), clamp(((_e174 - _e175) / (_e177 - _e178)), 0f, 1f));
    let _e193 = uv_1;
    uv_1 = (vec2<f32>(0.0078125f, 0.03125f) + (_e193 * vec2<f32>(0.984375f, 0.9375f)));
    let _e203 = uv_1;
    let _e205 = textureSampleLevel(tIrrTexture, tIrrSampler, _e203, 0f);
    return _e205.xyz;
}

fn seasonYear(dirF: vec3<f32>) -> vec3<f32> {
    var dirF_1: vec3<f32>;
    var m: vec4<f32>;

    dirF_1 = dirF;
    let _e161 = dirF_1;
    let _e163 = dirF_1;
    let _e170 = dirF_1;
    let _e183 = textureSampleLevel(tSeasonMapTexture, tSeasonMapSampler, vec2<f32>(((atan2(_e161.z, _e163.x) / 6.28319f) + 0.5f), ((asin(clamp(_e170.y, -1f, 1f)) / 3.14159f) + 0.5f)), 0f);
    m = _e183;
    let _e185 = m;
    let _e191 = m;
    let _e197 = m;
    let _e199 = m;
    return vec3<f32>(((_e185.x - 0.5f) * 100f), ((_e191.y - 0.5f) * 100f), ((_e197.z * _e199.z) * 600f));
}

fn seasonIceNow(dirF_2: vec3<f32>) -> f32 {
    var dirF_3: vec3<f32>;
    var m_1: vec4<f32>;

    dirF_3 = dirF_2;
    let _e161 = dirF_3;
    let _e163 = dirF_3;
    let _e170 = dirF_3;
    let _e183 = textureSampleLevel(tSeasonIceTexture, tSeasonIceSampler, vec2<f32>(((atan2(_e161.z, _e163.x) / 6.28319f) + 0.5f), ((asin(clamp(_e170.y, -1f, 1f)) / 3.14159f) + 0.5f)), 0f);
    m_1 = _e183;
    let _e185 = m_1;
    let _e191 = m_1;
    let _e197 = global.uSeason;
    let _e202 = m_1;
    let _e208 = global.uSeason;
    return ((((_e185.z - 0.5f) * 100f) + (((_e191.x - 0.5f) * 100f) * cos(_e197.x))) + (((_e202.y - 0.5f) * 100f) * sin(_e208.x)));
}

fn seaIceAt(m_2: vec3<f32>, Tf: f32) -> f32 {
    var m_3: vec3<f32>;
    var Tf_1: f32;
    var u: vec3<f32>;
    var t: vec4<f32>;
    var Ts: f32;

    m_3 = m_2;
    Tf_1 = Tf;
    let _e163 = m_3;
    u = normalize(_e163);
    let _e166 = u;
    let _e168 = u;
    let _e175 = u;
    let _e188 = textureSampleLevel(tSeasonMapTexture, tSeasonMapSampler, vec2<f32>(((atan2(_e166.z, _e168.x) / 6.28319f) + 0.5f), ((asin(clamp(_e175.y, -1f, 1f)) / 3.14159f) + 0.5f)), 0f);
    t = _e188;
    let _e190 = t;
    let _e196 = t;
    let _e202 = global.uSeason;
    let _e207 = t;
    let _e213 = global.uSeason;
    Ts = ((((_e190.w * 120f) - 60f) + (((_e196.x - 0.5f) * 100f) * cos(_e202.x))) + (((_e207.y - 0.5f) * 100f) * sin(_e213.x)));
    let _e220 = Tf_1;
    let _e223 = Tf_1;
    let _e226 = Ts;
    return (1f - smoothstep((_e220 - 4f), (_e223 + 4f), _e226));
}

fn meltPond(Tair: f32, n: f32) -> f32 {
    var Tair_1: f32;
    var n_1: f32;
    var f: f32;
    var local_1: f32;

    Tair_1 = Tair;
    n_1 = n;
    let _e167 = Tair_1;
    f = (0.45f * smoothstep(-0.5f, 4f, _e167));
    let _e171 = f;
    if (_e171 > 0f) {
        let _e175 = f;
        let _e178 = f;
        let _e181 = n_1;
        local_1 = (1f - smoothstep((_e175 - 0.06f), (_e178 + 0.06f), _e181));
    } else {
        local_1 = 0f;
    }
    let _e186 = local_1;
    return _e186;
}

fn cloudN(n_2: f32) -> f32 {
    var n_3: f32;

    n_3 = n_2;
    let _e164 = n_3;
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

fn cloudMapSmooth(uv_2: vec2<f32>) -> vec3<f32> {
    var uv_3: vec2<f32>;
    var sz: vec2<f32>;
    var st: vec2<f32>;
    var i: vec2<f32>;
    var f_1: vec2<f32>;
    var f2_: vec2<f32>;
    var f3_: vec2<f32>;
    var w0_: vec2<f32>;
    var w1_: vec2<f32>;
    var w2_: vec2<f32>;
    var w3_: vec2<f32>;
    var g0_: vec2<f32>;
    var g1_: vec2<f32>;
    var h0_: vec2<f32>;
    var h1_: vec2<f32>;

    uv_3 = uv_2;
    let _e164 = textureDimensions(tCloudMapTexture, 0i);
    sz = vec2<f32>(vec2<i32>(_e164));
    let _e168 = uv_3;
    let _e169 = sz;
    st = ((_e168 * _e169) - vec2(0.5f));
    let _e175 = st;
    i = floor(_e175);
    let _e178 = st;
    let _e179 = i;
    f_1 = (_e178 - _e179);
    let _e182 = f_1;
    let _e183 = f_1;
    f2_ = (_e182 * _e183);
    let _e186 = f2_;
    let _e187 = f_1;
    f3_ = (_e186 * _e187);
    let _e192 = f_1;
    let _e197 = f2_;
    let _e200 = f3_;
    w0_ = ((((vec2(1f) - (3f * _e192)) + (3f * _e197)) - _e200) / vec2(6f));
    let _e208 = f2_;
    let _e213 = f3_;
    w1_ = (((vec2(4f) - (6f * _e208)) + (3f * _e213)) / vec2(6f));
    let _e222 = f_1;
    let _e227 = f2_;
    let _e231 = f3_;
    w2_ = ((((vec2(1f) + (3f * _e222)) + (3f * _e227)) - (3f * _e231)) / vec2(6f));
    let _e238 = f3_;
    w3_ = (_e238 / vec2(6f));
    let _e243 = w0_;
    let _e244 = w1_;
    g0_ = (_e243 + _e244);
    let _e247 = w2_;
    let _e248 = w3_;
    g1_ = (_e247 + _e248);
    let _e251 = i;
    let _e255 = w1_;
    let _e256 = g0_;
    let _e259 = sz;
    h0_ = (((_e251 - vec2(0.5f)) + (_e255 / _e256)) / _e259);
    let _e262 = i;
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

fn cloudClimate(dirF_4: vec3<f32>) -> f32 {
    var dirF_5: vec3<f32>;
    var lat: f32;
    var cm: vec3<f32>;

    dirF_5 = dirF_4;
    let _e163 = dirF_5;
    lat = asin(clamp(_e163.y, -1f, 1f));
    let _e171 = global.uCloudMapMean;
    if (_e171 <= 0f) {
        let _e175 = lat;
        return (0.12f * cos((abs(_e175) * 6f)));
    }
    let _e181 = dirF_5;
    let _e183 = dirF_5;
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
    var local_2: f32;
    var a: f32;
    var local_3: f32;
    var b: f32;
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
        local_2 = 0.682f;
    } else {
        let _e196 = qz;
        let _e197 = L0_;
        let _e201 = textureSampleLevel(tNoiseTexture, tNoiseSampler, (_e196 / vec3(_e197)), 0f);
        let _e204 = f0_;
        local_2 = mix(_e201.x, 0.682f, _e204);
    }
    let _e207 = local_2;
    a = _e207;
    let _e209 = f1_;
    if (_e209 > 0.999f) {
        local_3 = 0.682f;
    } else {
        let _e213 = qz;
        let _e214 = L1_;
        let _e221 = textureSampleLevel(tNoiseTexture, tNoiseSampler, ((_e213 / vec3(_e214)) + vec3(0.5f)), 0f);
        let _e224 = f1_;
        local_3 = mix(_e221.x, 0.682f, _e224);
    }
    let _e227 = local_3;
    b = _e227;
    let _e230 = f0_;
    let _e233 = f1_;
    spread = length(vec2<f32>((0.124f * _e230), (0.083f * _e233)));
    let _e239 = bias_1;
    let _e241 = spread;
    let _e244 = bias_1;
    let _e246 = spread;
    let _e248 = a;
    let _e251 = b;
    let _e255 = cloudN(((_e248 * 0.6f) + (_e251 * 0.4f)));
    let _e256 = clim_1;
    return smoothstep(((0.6f - _e239) - _e241), ((0.8f - _e244) + _e246), (_e255 + _e256));
}

fn cloudGens(dirF_6: vec3<f32>, gA: ptr<function, vec3<f32>>, gB: ptr<function, vec3<f32>>) {
    var dirF_7: vec3<f32>;
    var T: f32;
    var ph: f32;
    var s: f32;
    var a_1: f32;
    var fa: f32;
    var b_1: f32;
    var fb: f32;
    var j: f32;
    var fj: f32;
    var wa: f32;

    dirF_7 = dirF_6;
    let _e165 = global.uCloudClock;
    T = _e165.z;
    let _e168 = T;
    if (_e168 <= 0f) {
        {
            (*gA) = vec3<f32>(1f, 0f, 0f);
            (*gB) = vec3(0f);
            return;
        }
    }
    let _e178 = dirF_7;
    let _e182 = dirF_7;
    let _e187 = dirF_7;
    let _e193 = dirF_7;
    let _e197 = dirF_7;
    let _e202 = dirF_7;
    ph = ((((1.1f * _e178.x) + (0.7f * _e182.z)) - (0.5f * _e187.y)) + (0.35f * sin((((2.3f * _e193.y) + (1.7f * _e197.x)) - (0.9f * _e202.z)))));
    let _e210 = global.uCloudClock;
    let _e212 = T;
    let _e214 = ph;
    s = (((_e210.x / _e212) + _e214) + 4f);
    let _e219 = s;
    a_1 = floor(_e219);
    let _e222 = s;
    let _e223 = a_1;
    fa = (_e222 - _e223);
    let _e226 = s;
    b_1 = floor((_e226 + 0.5f));
    let _e231 = s;
    let _e234 = b_1;
    fb = ((_e231 + 0.5f) - _e234);
    let _e238 = dirF_7;
    let _e248 = dirF_7;
    let _e260 = dirF_7;
    j = (0.065f * ((sin((dot(_e238, vec3<f32>(5.1f, 3.7f, -4.3f)) + 1.3f)) + sin((dot(_e248, vec3<f32>(-3.9f, 7.3f, 6.1f)) + 0.4f))) + (0.6f * sin((dot(_e260, vec3<f32>(11.3f, -8.9f, 7.7f)) + 2.1f)))));
    let _e274 = s;
    let _e275 = j;
    fj = fract((_e274 + _e275));
    let _e283 = fj;
    wa = smoothstep(0.4f, 0.6f, (1f - abs(((2f * _e283) - 1f))));
    let _e291 = wa;
    let _e292 = fa;
    let _e295 = T;
    let _e298 = global.uCloudClock;
    let _e300 = a_1;
    (*gA) = vec3<f32>(_e291, ((_e292 - 0.5f) * _e295), (2f * (_e298.y + _e300)));
    let _e305 = wa;
    let _e307 = fb;
    let _e310 = T;
    let _e313 = global.uCloudClock;
    let _e315 = b_1;
    (*gB) = vec3<f32>((1f - _e305), ((_e307 - 0.5f) * _e310), ((2f * (_e313.y + _e315)) + 1f));
    return;
}

fn cloudGenOff(idx: f32) -> vec3<f32> {
    var idx_1: f32;
    var h: u32;

    idx_1 = idx;
    let _e163 = idx_1;
    h = (u32(_e163) * 2654435761u);
    let _e168 = h;
    let _e169 = h;
    h = (_e168 ^ (_e169 >> 15u));
    let _e173 = h;
    h = (_e173 * 2246822519u);
    let _e176 = h;
    let _e177 = h;
    h = (_e176 ^ (_e177 >> 13u));
    let _e181 = h;
    let _e185 = h;
    let _e191 = h;
    return (((vec3<f32>(f32((_e181 & 1023u)), f32(((_e185 >> 10u) & 1023u)), f32(((_e191 >> 20u) & 1023u))) / vec3(1024f)) - vec3(0.5f)) * 400000f);
}

fn cloudAdvect(pf: vec3<f32>, dirF_8: vec3<f32>, g: vec3<f32>) -> vec3<f32> {
    var pf_1: vec3<f32>;
    var dirF_9: vec3<f32>;
    var g_1: vec3<f32>;
    var lat_1: f32;
    var U: f32;
    var east: vec3<f32>;

    pf_1 = pf;
    dirF_9 = dirF_8;
    g_1 = g;
    let _e167 = dirF_9;
    lat_1 = asin(clamp(_e167.y, -1f, 1f));
    let _e175 = global.uCloudWind;
    let _e177 = lat_1;
    let _e178 = global.uCloudWind;
    let _e183 = global.uCloudWind;
    let _e189 = global.uCloudWind;
    let _e191 = lat_1;
    let _e193 = lat_1;
    U = (_e175.x * (sin((((_e177 * _e178.y) * 2f) + (_e183.z * 6.2832f))) + (_e189.w * exp(((-(_e191) * _e193) * 40f)))));
    let _e202 = dirF_9;
    let _e206 = dirF_9;
    east = normalize((vec3<f32>(-(_e202.z), 0f, _e206.x) + vec3<f32>(0.000001f, 0f, 0f)));
    let _e216 = pf_1;
    let _e217 = east;
    let _e218 = U;
    let _e220 = g_1;
    let _e224 = g_1;
    let _e226 = cloudGenOff(_e224.z);
    return ((_e216 + ((_e217 * _e218) * _e220.y)) + _e226);
}

fn cloudCoverG(pf_2: vec3<f32>, dirF_10: vec3<f32>, foot_4: f32, bias_2: f32) -> f32 {
    var pf_3: vec3<f32>;
    var dirF_11: vec3<f32>;
    var foot_5: f32;
    var bias_3: f32;
    var gA_1: vec3<f32>;
    var gB_1: vec3<f32>;
    var c: f32 = 0f;
    var clim_2: f32;

    pf_3 = pf_2;
    dirF_11 = dirF_10;
    foot_5 = foot_4;
    bias_3 = bias_2;
    let _e171 = dirF_11;
    cloudGens(_e171, (&gA_1), (&gB_1));
    let _e178 = dirF_11;
    let _e179 = cloudClimate(_e178);
    clim_2 = _e179;
    let _e181 = gA_1;
    if (_e181.x > 0.005f) {
        let _e185 = c;
        let _e186 = gA_1;
        let _e188 = pf_3;
        let _e189 = dirF_11;
        let _e190 = gA_1;
        let _e191 = cloudAdvect(_e188, _e189, _e190);
        let _e192 = foot_5;
        let _e193 = bias_3;
        let _e194 = clim_2;
        let _e195 = cloudCoverC(_e191, _e192, _e193, _e194);
        c = (_e185 + (_e186.x * _e195));
    }
    let _e198 = gB_1;
    if (_e198.x > 0.005f) {
        let _e202 = c;
        let _e203 = gB_1;
        let _e205 = pf_3;
        let _e206 = dirF_11;
        let _e207 = gB_1;
        let _e208 = cloudAdvect(_e205, _e206, _e207);
        let _e209 = foot_5;
        let _e210 = bias_3;
        let _e211 = clim_2;
        let _e212 = cloudCoverC(_e208, _e209, _e210, _e211);
        c = (_e202 + (_e203.x * _e212));
    }
    let _e215 = c;
    return _e215;
}

fn cloudLight(rel: vec3<f32>, r_6: f32, muS: f32, foot_6: f32, sunAbove: vec3<f32>, skyE: ptr<function, vec3<f32>>) -> f32 {
    var rel_1: vec3<f32>;
    var r_7: f32;
    var muS_1: f32;
    var foot_7: f32;
    var sunAbove_1: vec3<f32>;
    var mu_8: f32;
    var Tdir: f32 = 1f;
    var Ttot: f32 = 1f;
    var Dup: f32 = 1f;
    var w: f32 = 0f;
    var m0_: vec4<f32> = vec4(1f);
    var m1_: vec4<f32> = vec4(1f);
    var pf_4: vec3<f32>;
    var upF: vec3<f32>;
    var sF: vec3<f32>;
    var d_1: vec3<f32>;
    var uv_4: vec2<f32>;
    var hc: f32;
    var ds: vec3<f32>;
    var local_4: f32;
    var cs: f32;
    var dz: vec3<f32>;
    var cz: f32;
    var local_5: f32;

    rel_1 = rel;
    r_7 = r_6;
    muS_1 = muS;
    foot_7 = foot_6;
    sunAbove_1 = sunAbove;
    cloudDirZ = 1f;
    cloudTotZ = 1f;
    let _e176 = global.uCloudOn;
    if (_e176 < 0.5f) {
        return 1f;
    }
    let _e180 = muS_1;
    mu_8 = max(_e180, 0.05f);
    let _e198 = global.uCSOn;
    if (_e198 > 0.5f) {
        {
            let _e201 = global.uToFixed;
            let _e202 = rel_1;
            pf_4 = (_e201 * _e202);
            let _e205 = pf_4;
            let _e206 = r_7;
            upF = (_e205 / vec3(_e206));
            let _e210 = global.uToFixed;
            let _e211 = global.uSunDir;
            sF = (_e210 * _e211);
            let _e214 = pf_4;
            let _e215 = global.uCSOrigin;
            let _e217 = sF;
            let _e218 = upF;
            let _e219 = sF;
            let _e220 = upF;
            let _e224 = r_7;
            let _e225 = global.uRadius;
            let _e228 = sF;
            let _e229 = upF;
            d_1 = ((_e214 - _e215) - (((_e217 - (_e218 * dot(_e219, _e220))) * (_e224 - _e225)) / vec3(max(dot(_e228, _e229), 0.1f))));
            let _e237 = d_1;
            let _e238 = global.uCSE;
            let _e240 = d_1;
            let _e241 = global.uCSN;
            let _e244 = global.uCSInvL;
            uv_4 = ((vec2<f32>(dot(_e237, _e238), dot(_e240, _e241)) * _e244) + vec2(0.5f));
            let _e252 = uv_4;
            let _e255 = uv_4;
            let _e259 = uv_4;
            let _e262 = uv_4;
            w = smoothstep(0f, 0.08f, min(min(_e252.x, (1f - _e255.x)), min(_e259.y, (1f - _e262.y))));
            let _e268 = w;
            if (_e268 > 0f) {
                {
                    let _e271 = uv_4;
                    let _e273 = textureSampleLevel(tCloudShadowTexture, tCloudShadowSampler, _e271, 0f);
                    m0_ = _e273;
                    let _e274 = uv_4;
                    let _e275 = global.uCSLod;
                    let _e276 = textureSampleLevel(tCloudShadowTexture, tCloudShadowSampler, _e274, _e275);
                    m1_ = _e276;
                }
            }
        }
    }
    let _e277 = global.uCloud;
    let _e279 = r_7;
    let _e280 = global.uRadius;
    hc = (_e277.x - (_e279 - _e280));
    let _e284 = hc;
    let _e287 = w;
    if ((_e284 > 0f) && (_e287 < 1f)) {
        {
            let _e291 = global.uToFixed;
            let _e292 = rel_1;
            let _e293 = global.uSunDir;
            let _e294 = hc;
            let _e296 = muS_1;
            ds = normalize((_e291 * normalize((_e292 + ((_e293 * _e294) / vec3(max(_e296, 0.08f)))))));
            let _e306 = muS_1;
            if (_e306 > -0.05f) {
                let _e310 = ds;
                let _e311 = global.uRadius;
                let _e313 = ds;
                let _e314 = foot_7;
                let _e315 = global.uCloud;
                let _e317 = cloudBias(_e315.z);
                let _e318 = cloudCoverG((_e310 * _e311), _e313, _e314, _e317);
                let _e319 = global.uCloudOpacity;
                local_4 = (_e318 * _e319);
            } else {
                local_4 = 0f;
            }
            let _e323 = local_4;
            cs = _e323;
            let _e325 = global.uToFixed;
            let _e326 = rel_1;
            dz = normalize((_e325 * _e326));
            let _e330 = dz;
            let _e331 = global.uRadius;
            let _e333 = dz;
            let _e334 = foot_7;
            let _e336 = hc;
            let _e339 = global.uCloud;
            let _e341 = cloudBias(_e339.z);
            let _e342 = cloudCoverG((_e330 * _e331), _e333, max(_e334, (3.5f * _e336)), _e341);
            let _e343 = global.uCloudOpacity;
            cz = (_e342 * _e343);
            let _e347 = cs;
            let _e349 = cs;
            let _e350 = global.uCloudTau;
            let _e352 = mu_8;
            Tdir = ((1f - _e347) + (_e349 * exp((-(_e350) / _e352))));
            let _e358 = cz;
            let _e360 = cz;
            let _e363 = global.uCloudTau;
            Ttot = ((1f - _e358) + (_e360 / (1f + (0.1125f * _e363))));
            let _e369 = cz;
            let _e371 = cz;
            let _e372 = global.uCloudTau;
            let _e374 = mu_8;
            Dup = ((1f - _e369) + (_e371 * exp((-(_e372) / _e374))));
        }
    }
    let _e379 = Tdir;
    let _e380 = m0_;
    let _e382 = w;
    Tdir = mix(_e379, _e380.x, _e382);
    let _e384 = Ttot;
    let _e385 = m1_;
    let _e387 = w;
    Ttot = mix(_e384, _e385.y, _e387);
    let _e389 = Dup;
    let _e390 = m1_;
    let _e392 = w;
    Dup = mix(_e389, _e390.z, _e392);
    let _e394 = Dup;
    cloudDirZ = _e394;
    let _e395 = Ttot;
    cloudTotZ = _e395;
    let _e396 = (*skyE);
    let _e397 = Ttot;
    let _e399 = sunAbove_1;
    let _e400 = muS_1;
    let _e404 = Ttot;
    let _e405 = Dup;
    (*skyE) = ((_e396 * _e397) + ((_e399 * max(_e400, 0f)) * max((_e404 - _e405), 0f)));
    let _e411 = muS_1;
    if (_e411 > -0.05f) {
        let _e415 = Tdir;
        local_5 = _e415;
    } else {
        local_5 = 1f;
    }
    let _e418 = local_5;
    return _e418;
}

fn blackbodyGlow(T_1: f32) -> vec3<f32> {
    var T_2: f32;
    var g_2: f32;

    T_2 = T_1;
    let _e165 = T_2;
    if (_e165 < 650f) {
        return vec3(0f);
    }
    let _e173 = T_2;
    g_2 = max(0f, (0.0287f + (0.000237f * (_e173 - 1000f))));
    let _e181 = g_2;
    let _e187 = T_2;
    let _e193 = g_2;
    return (vec3<f32>(1f, _e181, 0f) * ((600000f * exp((-24060f / _e187))) / (0.2126f + (0.7152f * _e193))));
}

fn heightCubeAt(d_2: vec3<f32>) -> f32 {
    var d_3: vec3<f32>;
    var a_2: vec3<f32>;
    var local_6: i32;
    var local_7: i32;
    var local_8: i32;
    var local_9: i32;
    var local_10: i32;
    var f_2: i32;
    var local_11: array<vec3<f32>, 6> = HC_N;
    var dn: f32;
    var local_12: array<vec3<f32>, 6> = HC_U;
    var local_13: array<vec3<f32>, 6> = HC_V;
    var uv_5: vec2<f32>;

    d_3 = d_2;
    let _e168 = d_3;
    a_2 = abs(_e168);
    let _e171 = a_2;
    let _e173 = a_2;
    let _e176 = a_2;
    let _e178 = a_2;
    if ((_e171.x >= _e173.y) && (_e176.x >= _e178.z)) {
        let _e182 = d_3;
        if (_e182.x >= 0f) {
            local_6 = 0i;
        } else {
            local_6 = 1i;
        }
        let _e189 = local_6;
        local_10 = _e189;
    } else {
        let _e190 = a_2;
        let _e192 = a_2;
        if (_e190.y >= _e192.z) {
            let _e195 = d_3;
            if (_e195.y >= 0f) {
                local_7 = 2i;
            } else {
                local_7 = 3i;
            }
            let _e202 = local_7;
            local_9 = _e202;
        } else {
            let _e203 = d_3;
            if (_e203.z >= 0f) {
                local_8 = 4i;
            } else {
                local_8 = 5i;
            }
            let _e210 = local_8;
            local_9 = _e210;
        }
        let _e212 = local_9;
        local_10 = _e212;
    }
    let _e214 = local_10;
    f_2 = _e214;
    let _e216 = d_3;
    let _e217 = f_2;
    let _e221 = local_11[_e217];
    dn = dot(_e216, _e221);
    let _e224 = d_3;
    let _e225 = f_2;
    let _e229 = local_12[_e225];
    let _e231 = dn;
    let _e234 = d_3;
    let _e235 = f_2;
    let _e239 = local_13[_e235];
    let _e241 = dn;
    uv_5 = (((vec2<f32>(atan((dot(_e224, _e229) / _e231)), atan((dot(_e234, _e239) / _e241))) / vec2(0.785398f)) * 0.5f) + vec2(0.5f));
    let _e254 = uv_5;
    let _e255 = f_2;
    let _e259 = vec3<f32>(_e254.x, _e254.y, f32(_e255));
    let _e264 = textureSampleLevel(tHeightCubeTexture, tHeightCubeSampler, _e259.xy, i32(_e259.z), 0f);
    return _e264.x;
}

fn terrainShadow(pF: vec3<f32>, up: vec3<f32>, sF_1: vec3<f32>, R: f32) -> f32 {
    var pF_1: vec3<f32>;
    var up_1: vec3<f32>;
    var sF_2: vec3<f32>;
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
    var d_4: f32;

    pF_1 = pF;
    up_1 = up;
    sF_2 = sF_1;
    R_1 = R;
    let _e174 = global.uHeightCube;
    let _e178 = up_1;
    let _e179 = sF_2;
    if ((_e174.x < 0.5f) || (dot(_e178, _e179) < -0.2f)) {
        return 1f;
    }
    let _e186 = global.uHeightCube;
    texel = _e186.w;
    let _e189 = R_1;
    let _e190 = global.uHeightCube;
    top = (_e189 + _e190.z);
    let _e194 = pF_1;
    r0_ = length(_e194);
    let _e198 = R_1;
    let _e199 = up_1;
    let _e200 = heightCubeAt(_e199);
    let _e202 = r0_;
    below = max(0f, ((_e198 + _e200) - _e202));
    let _e206 = pF_1;
    let _e207 = up_1;
    let _e208 = texel;
    o = (_e206 + ((_e207 * _e208) * 0.1f));
    let _e214 = texel;
    t_1 = _e214;
    loop {
        let _e220 = i_1;
        if !((_e220 < 28i)) {
            break;
        }
        {
            let _e227 = o;
            let _e228 = sF_2;
            let _e229 = t_1;
            qp = (_e227 + (_e228 * _e229));
            let _e233 = qp;
            rq = length(_e233);
            let _e236 = rq;
            let _e237 = top;
            if (_e236 > _e237) {
                break;
            }
            let _e239 = rq;
            let _e240 = R_1;
            let _e241 = qp;
            let _e242 = rq;
            let _e245 = heightCubeAt((_e241 / vec3(_e242)));
            let _e248 = below;
            let _e249 = t_1;
            let _e252 = texel;
            d_4 = ((_e239 - (_e240 + _e245)) + (_e248 * exp((-(_e249) / (3f * _e252)))));
            let _e259 = sh;
            let _e260 = d_4;
            let _e261 = t_1;
            sh = min(_e259, clamp(((_e260 / (_e261 * 0.035f)) + 0.5f), 0f, 1f));
            let _e271 = sh;
            if (_e271 <= 0f) {
                break;
            }
            let _e274 = t_1;
            t_1 = (_e274 * 1.35f);
        }
        continuing {
            let _e224 = i_1;
            i_1 = (_e224 + 1i);
        }
    }
    let _e277 = sh;
    return _e277;
}

fn sunShadowTap(org: vec2<i32>, n_4: i32, VP: mat4x4<f32>, L_2: vec4<f32>, wp: vec3<f32>, bias_4: f32) -> f32 {
    var org_1: vec2<i32>;
    var n_5: i32;
    var VP_1: mat4x4<f32>;
    var L_3: vec4<f32>;
    var wp_1: vec3<f32>;
    var bias_5: f32;
    var c_1: vec4<f32>;
    var uv_6: vec2<f32>;
    var d_5: f32;
    var sz_1: vec2<i32>;
    var st_1: vec2<f32>;
    var fr: vec2<f32>;
    var p0_: vec2<i32>;
    var cmp: array<f32, 16>;
    var j_1: i32 = 0i;
    var i_2: i32;
    var local_14: f32;
    var lit: f32 = 0f;
    var j_2: i32 = 0i;
    var i_3: i32;

    org_1 = org;
    n_5 = n_4;
    VP_1 = VP;
    L_3 = L_2;
    wp_1 = wp;
    bias_5 = bias_4;
    let _e178 = VP_1;
    let _e179 = wp_1;
    c_1 = (_e178 * vec4<f32>(_e179.x, _e179.y, _e179.z, 1f));
    let _e187 = c_1;
    let _e189 = c_1;
    uv_6 = (((_e187.xy / vec2(_e189.w)) * 0.5f) + vec2(0.5f));
    let _e199 = uv_6;
    let _e204 = uv_6;
    if (any((_e199 < vec2(0f))) || any((_e204 > vec2(1f)))) {
        return 1f;
    }
    let _e211 = L_3;
    let _e213 = wp_1;
    let _e215 = global.uSunShadowDir;
    let _e217 = bias_5;
    d_5 = (dot((_e211.xyz - _e213), _e215) - _e217);
    let _e220 = n_5;
    sz_1 = vec2(_e220);
    let _e223 = uv_6;
    let _e224 = sz_1;
    st_1 = ((_e223 * vec2<f32>(_e224)) - vec2(0.5f));
    let _e231 = st_1;
    fr = fract(_e231);
    let _e234 = st_1;
    p0_ = vec2<i32>(floor(_e234));
    loop {
        let _e241 = j_1;
        if !((_e241 < 4i)) {
            break;
        }
        i_2 = 0i;
        loop {
            let _e250 = i_2;
            if !((_e250 < 4i)) {
                break;
            }
            let _e257 = j_1;
            let _e260 = i_2;
            let _e263 = d_5;
            let _e264 = org_1;
            let _e265 = p0_;
            let _e266 = i_2;
            let _e269 = j_1;
            let _e276 = sz_1;
            let _e283 = textureLoad(tShadowAtlasTexture, (_e264 + clamp((_e265 + vec2<i32>((_e266 - 1i), (_e269 - 1i))), vec2(0i), (_e276 - vec2(1i)))), 0i);
            if (_e263 <= _e283.x) {
                local_14 = 1f;
            } else {
                local_14 = 0f;
            }
            let _e289 = local_14;
            cmp[((_e257 * 4i) + _e260)] = _e289;
            continuing {
                let _e254 = i_2;
                i_2 = (_e254 + 1i);
            }
        }
        continuing {
            let _e245 = j_1;
            j_1 = (_e245 + 1i);
        }
    }
    loop {
        let _e294 = j_2;
        if !((_e294 < 3i)) {
            break;
        }
        i_3 = 0i;
        loop {
            let _e303 = i_3;
            if !((_e303 < 3i)) {
                break;
            }
            let _e310 = lit;
            let _e311 = j_2;
            let _e314 = i_3;
            let _e317 = cmp[((_e311 * 4i) + _e314)];
            let _e318 = j_2;
            let _e321 = i_3;
            let _e326 = cmp[(((_e318 * 4i) + _e321) + 1i)];
            let _e327 = fr;
            let _e330 = j_2;
            let _e333 = i_3;
            let _e338 = cmp[(((_e330 * 4i) + _e333) + 4i)];
            let _e339 = j_2;
            let _e342 = i_3;
            let _e347 = cmp[(((_e339 * 4i) + _e342) + 5i)];
            let _e348 = fr;
            let _e351 = fr;
            lit = (_e310 + mix(mix(_e317, _e326, _e327.x), mix(_e338, _e347, _e348.x), _e351.y));
            continuing {
                let _e307 = i_3;
                i_3 = (_e307 + 1i);
            }
        }
        continuing {
            let _e298 = j_2;
            j_2 = (_e298 + 1i);
        }
    }
    let _e355 = lit;
    return (_e355 / 9f);
}

fn sunShadowMap(wp_2: vec3<f32>, N: vec3<f32>) -> f32 {
    var wp_3: vec3<f32>;
    var N_1: vec3<f32>;
    var dist: f32;
    var ndl: f32;
    var slope: f32;
    var s1_: f32;
    var sh_1: f32;
    var s0_: f32;

    wp_3 = wp_2;
    N_1 = N;
    let _e170 = global.uSunShadow;
    if (_e170.x < 0.5f) {
        return 1f;
    }
    let _e175 = wp_3;
    dist = length(_e175);
    let _e178 = dist;
    let _e179 = global.uSunShadow;
    if (_e178 > _e179.z) {
        return 1f;
    }
    let _e183 = N_1;
    let _e184 = global.uSunShadowDir;
    ndl = max(dot(_e183, _e184), 0.05f);
    let _e190 = ndl;
    let _e191 = ndl;
    let _e195 = ndl;
    slope = (sqrt((1f - (_e190 * _e191))) / _e195);
    let _e202 = global.uSunShadowVP1_;
    let _e203 = global.uSunShadowL1_;
    let _e204 = wp_3;
    let _e205 = global.uSunShadowL1_;
    let _e208 = slope;
    let _e213 = sunShadowTap(vec2<i32>(2048i, 0i), 2048i, _e202, _e203, _e204, (_e205.w * (1.5f + min(_e208, 6f))));
    s1_ = _e213;
    let _e215 = s1_;
    let _e218 = global.uSunShadow;
    let _e221 = global.uSunShadow;
    let _e223 = dist;
    sh_1 = mix(_e215, 1f, smoothstep((0.85f * _e218.z), _e221.z, _e223));
    let _e227 = dist;
    let _e228 = global.uSunShadow;
    if (_e227 < _e228.y) {
        {
            let _e235 = global.uSunShadowVP0_;
            let _e236 = global.uSunShadowL0_;
            let _e237 = wp_3;
            let _e238 = global.uSunShadowL0_;
            let _e241 = slope;
            let _e246 = sunShadowTap(vec2<i32>(0i, 0i), 2048i, _e235, _e236, _e237, (_e238.w * (1.5f + min(_e241, 6f))));
            s0_ = _e246;
            let _e248 = s0_;
            let _e249 = sh_1;
            let _e251 = global.uSunShadow;
            let _e254 = global.uSunShadow;
            let _e256 = dist;
            sh_1 = mix(_e248, _e249, smoothstep((0.75f * _e251.y), _e254.y, _e256));
        }
    }
    let _e259 = sh_1;
    return _e259;
}

fn windSense(upF_1: vec3<f32>) -> f32 {
    var upF_2: vec3<f32>;
    var al: f32;

    upF_2 = upF_1;
    let _e168 = upF_2;
    al = abs(asin(clamp(_e168.y, -1f, 1f)));
    let _e182 = al;
    let _e189 = al;
    return ((-1f + (2f * smoothstep(0.49f, 0.55f, _e182))) - (2f * smoothstep(1.02f, 1.08f, _e189)));
}

fn liquidWaves(fp: vec3<f32>, n_6: vec3<f32>, wd: vec3<f32>, lmax: f32, river: bool, foot_8: f32, warp: vec3<f32>, grp: vec4<f32>) -> Waves {
    var fp_1: vec3<f32>;
    var n_7: vec3<f32>;
    var wd_1: vec3<f32>;
    var lmax_1: f32;
    var river_1: bool;
    var foot_9: f32;
    var warp_1: vec3<f32>;
    var grp_1: vec4<f32>;
    var W: Waves = Waves(vec3(0f), 0f, 0f, 0f, 0f);
    var rv: f32 = 0f;
    var i_4: i32 = 0i;
    var K: vec4<f32>;
    var kk: f32;
    var lam: f32;
    var fk: f32;
    var kt: vec3<f32>;
    var ktl: f32;
    var kd: vec3<f32>;
    var local_15: f32;
    var dirW: f32;
    var wt0_: f32;
    var wt: f32;
    var res: f32;
    var ph_1: f32;
    var Ke: vec3<f32>;
    var env: f32;

    fp_1 = fp;
    n_7 = n_6;
    wd_1 = wd;
    lmax_1 = lmax;
    river_1 = river;
    foot_9 = foot_8;
    warp_1 = warp;
    grp_1 = grp;
    loop {
        let _e194 = i_4;
        if !((_e194 < 36i)) {
            break;
        }
        {
            let _e201 = i_4;
            let _e203 = global.uWaveK[_e201];
            K = _e203;
            let _e205 = K;
            kk = length(_e205.xyz);
            let _e210 = kk;
            lam = (6.2832f / _e210);
            let _e214 = lmax_1;
            let _e217 = lmax_1;
            let _e220 = lam;
            let _e224 = global.uLiquid;
            let _e228 = global.uLiquid;
            let _e232 = lam;
            fk = ((1f - smoothstep((_e214 * 0.7f), (_e217 * 1.3f), _e220)) * (1f - smoothstep((_e224.w * 1.2f), (_e228.w * 2.2f), _e232)));
            let _e237 = fk;
            if (_e237 <= 0f) {
                continue;
            }
            let _e240 = K;
            let _e242 = n_7;
            let _e243 = K;
            let _e245 = n_7;
            kt = (_e240.xyz - (_e242 * dot(_e243.xyz, _e245)));
            let _e250 = kt;
            ktl = length(_e250);
            let _e253 = ktl;
            if (_e253 < 0.000001f) {
                continue;
            }
            let _e256 = kt;
            let _e257 = ktl;
            kd = (_e256 / vec3(_e257));
            let _e261 = river_1;
            if _e261 {
                local_15 = 1f;
            } else {
                let _e265 = kd;
                let _e266 = wd_1;
                local_15 = (0.2f + (1.2f * pow(max(dot(_e265, _e266), 0f), 2f)));
            }
            let _e275 = local_15;
            dirW = _e275;
            let _e277 = fk;
            let _e278 = dirW;
            let _e280 = ktl;
            let _e281 = kk;
            wt0_ = ((_e277 * _e278) * (_e280 / _e281));
            let _e285 = wt0_;
            let _e288 = i_4;
            let _e294 = grp_1[((_e288 / 3i) & 3i)];
            wt = (_e285 * (0.3f + (1.4f * _e294)));
            let _e300 = foot_9;
            let _e303 = foot_9;
            let _e305 = lam;
            res = smoothstep((2f * _e300), (6f * _e303), _e305);
            let _e308 = K;
            let _e310 = fp_1;
            let _e311 = warp_1;
            let _e314 = K;
            ph_1 = (dot(_e308.xyz, (_e310 + _e311)) - _e314.w);
            let _e318 = K;
            Ke = (floor(((_e318.yzx * 228.1645f) + vec3(0.5f))) * 0.001533981f);
            let _e333 = Ke;
            let _e334 = fp_1;
            let _e335 = warp_1;
            let _e339 = K;
            let _e343 = i_4;
            env = (0.6f + (0.4f * sin(((dot(_e333, (_e334 + _e335)) - (0.17f * _e339.w)) + (f32(_e343) * 1.7f)))));
            let _e353 = W;
            let _e355 = kd;
            let _e356 = wt;
            let _e357 = res;
            let _e359 = env;
            let _e361 = ph_1;
            W.g = (_e353.g + (_e355 * (((_e356 * _e357) * _e359) * cos(_e361))));
            let _e367 = W;
            let _e369 = wt;
            let _e370 = wt;
            W.var_ = (_e367.var_ + ((_e369 * _e370) * 0.22f));
            let _e376 = W;
            let _e378 = wt0_;
            let _e379 = wt0_;
            W.var0_ = (_e376.var0_ + ((_e378 * _e379) * 0.22f));
            let _e385 = W;
            let _e387 = wt;
            let _e388 = wt;
            let _e392 = res;
            W.res = (_e385.res + (((_e387 * _e388) * 0.22f) * _e392));
            let _e396 = W;
            let _e398 = wt;
            let _e399 = res;
            let _e401 = env;
            let _e403 = ph_1;
            W.crest = (_e396.crest + (((_e398 * _e399) * _e401) * sin(_e403)));
            let _e407 = rv;
            let _e408 = wt;
            let _e409 = wt;
            let _e413 = res;
            let _e415 = res;
            rv = (_e407 + ((((_e408 * _e409) * 0.22f) * _e413) * _e415));
        }
        continuing {
            let _e198 = i_4;
            i_4 = (_e198 + 1i);
        }
    }
    let _e419 = W;
    let _e421 = rv;
    W.crest = (_e419.crest / sqrt(max(_e421, 0.000000001f)));
    let _e426 = W;
    return _e426;
}

fn liqHash(c_2: vec2<f32>) -> f32 {
    var c_3: vec2<f32>;
    var q_2: vec2<u32>;
    var h_1: u32;

    c_3 = c_2;
    let _e168 = c_3;
    q_2 = vec2<u32>((vec2<i32>(_e168) + vec2(1048576i)));
    let _e175 = q_2;
    let _e179 = q_2;
    h_1 = ((_e175.x * 1597334677u) ^ (_e179.y * 3812015801u));
    let _e185 = h_1;
    h_1 = ((_e185 * 747796405u) + 2891336453u);
    let _e190 = h_1;
    let _e191 = h_1;
    h_1 = (_e190 ^ (_e191 >> 16u));
    let _e196 = h_1;
    h_1 = (_e196 * 2246822519u);
    let _e199 = h_1;
    let _e200 = h_1;
    h_1 = (_e199 ^ (_e200 >> 13u));
    let _e205 = h_1;
    return ((f32((_e205 & 7u)) * 0.7854f) + 0.3927f);
}

fn rippleNoise(p: vec2<f32>, per: f32) -> vec3<f32> {
    var p_1: vec2<f32>;
    var per_1: f32;
    var i_5: vec2<f32>;
    var f_3: vec2<f32>;
    var i1_: vec2<f32>;
    var u_1: vec2<f32>;
    var du: vec2<f32>;
    var ha: f32;
    var hb: f32;
    var hc_1: f32;
    var hd: f32;
    var ga: vec2<f32>;
    var gb: vec2<f32>;
    var gc: vec2<f32>;
    var gd: vec2<f32>;
    var va: f32;
    var vb: f32;
    var vc: f32;
    var vd: f32;
    var k: f32;

    p_1 = p;
    per_1 = per;
    let _e170 = p_1;
    i_5 = floor(_e170);
    let _e173 = p_1;
    let _e174 = i_5;
    f_3 = (_e173 - _e174);
    let _e177 = i_5;
    let _e180 = (_e177 + vec2(1f));
    let _e181 = per_1;
    let _e182 = vec2(_e181);
    i1_ = (_e180 - (floor((_e180 / _e182)) * _e182));
    let _e188 = i_5;
    let _e189 = per_1;
    let _e190 = vec2(_e189);
    i_5 = (_e188 - (floor((_e188 / _e190)) * _e190));
    let _e195 = f_3;
    let _e196 = f_3;
    let _e198 = f_3;
    let _e200 = f_3;
    let _e201 = f_3;
    u_1 = (((_e195 * _e196) * _e198) * ((_e200 * ((_e201 * 6f) - vec2(15f))) + vec2(10f)));
    let _e214 = f_3;
    let _e216 = f_3;
    let _e218 = f_3;
    let _e219 = f_3;
    du = (((30f * _e214) * _e216) * ((_e218 * (_e219 - vec2(2f))) + vec2(1f)));
    let _e229 = i_5;
    let _e230 = liqHash(_e229);
    ha = _e230;
    let _e232 = i1_;
    let _e234 = i_5;
    let _e237 = liqHash(vec2<f32>(_e232.x, _e234.y));
    hb = _e237;
    let _e239 = i_5;
    let _e241 = i1_;
    let _e244 = liqHash(vec2<f32>(_e239.x, _e241.y));
    hc_1 = _e244;
    let _e246 = i1_;
    let _e247 = liqHash(_e246);
    hd = _e247;
    let _e249 = ha;
    let _e251 = ha;
    ga = vec2<f32>(cos(_e249), sin(_e251));
    let _e255 = hb;
    let _e257 = hb;
    gb = vec2<f32>(cos(_e255), sin(_e257));
    let _e261 = hc_1;
    let _e263 = hc_1;
    gc = vec2<f32>(cos(_e261), sin(_e263));
    let _e267 = hd;
    let _e269 = hd;
    gd = vec2<f32>(cos(_e267), sin(_e269));
    let _e273 = ga;
    let _e274 = f_3;
    va = dot(_e273, _e274);
    let _e277 = gb;
    let _e278 = f_3;
    vb = dot(_e277, (_e278 - vec2<f32>(1f, 0f)));
    let _e285 = gc;
    let _e286 = f_3;
    vc = dot(_e285, (_e286 - vec2<f32>(0f, 1f)));
    let _e293 = gd;
    let _e294 = f_3;
    vd = dot(_e293, (_e294 - vec2(1f)));
    let _e300 = va;
    let _e301 = vb;
    let _e303 = vc;
    let _e305 = vd;
    k = (((_e300 - _e301) - _e303) + _e305);
    let _e308 = va;
    let _e309 = u_1;
    let _e311 = vb;
    let _e312 = va;
    let _e316 = u_1;
    let _e318 = vc;
    let _e319 = va;
    let _e323 = u_1;
    let _e325 = u_1;
    let _e328 = k;
    let _e331 = ga;
    let _e332 = u_1;
    let _e334 = gb;
    let _e335 = ga;
    let _e339 = u_1;
    let _e341 = gc;
    let _e342 = ga;
    let _e346 = u_1;
    let _e348 = u_1;
    let _e351 = ga;
    let _e352 = gb;
    let _e354 = gc;
    let _e356 = gd;
    let _e360 = du;
    let _e361 = u_1;
    let _e363 = k;
    let _e365 = vb;
    let _e366 = vc;
    let _e369 = va;
    let _e373 = ((((_e331 + (_e332.x * (_e334 - _e335))) + (_e339.y * (_e341 - _e342))) + ((_e346.x * _e348.y) * (((_e351 - _e352) - _e354) + _e356))) + (_e360 * (((_e361.yx * _e363) + vec2<f32>(_e365, _e366)) - vec2(_e369))));
    return vec3<f32>((((_e308 + (_e309.x * (_e311 - _e312))) + (_e316.y * (_e318 - _e319))) + ((_e323.x * _e325.y) * _e328)), _e373.x, _e373.y);
}

fn rippleAxis(a_3: i32, p_2: vec3<f32>, L_4: f32, o_1: f32) -> vec3<f32> {
    var a_4: i32;
    var p_3: vec3<f32>;
    var L_5: f32;
    var o_2: f32;
    var local_16: vec2<f32>;
    var local_17: vec2<f32>;
    var uv_7: vec2<f32>;
    var r_8: vec3<f32>;

    a_4 = a_3;
    p_3 = p_2;
    L_5 = L_4;
    o_2 = o_1;
    let _e174 = a_4;
    if (_e174 == 0i) {
        let _e177 = p_3;
        local_17 = _e177.zy;
    } else {
        let _e179 = a_4;
        if (_e179 == 1i) {
            let _e182 = p_3;
            local_16 = _e182.xz;
        } else {
            let _e184 = p_3;
            local_16 = _e184.xy;
        }
        let _e187 = local_16;
        local_17 = _e187;
    }
    let _e189 = local_17;
    uv_7 = _e189;
    let _e191 = uv_7;
    let _e192 = L_5;
    let _e195 = o_2;
    let _e199 = L_5;
    let _e201 = rippleNoise(((_e191 / vec2(_e192)) + vec2(_e195)), (4096f / _e199));
    r_8 = _e201;
    let _e203 = r_8;
    let _e205 = r_8;
    let _e206 = _e205.yz;
    return vec3<f32>(_e203.x, _e206.x, _e206.y);
}

fn riverRipples(fp_2: vec3<f32>, n_8: vec3<f32>, lmax_2: f32, foot_10: f32) -> Waves {
    var fp_3: vec3<f32>;
    var n_9: vec3<f32>;
    var lmax_3: f32;
    var foot_11: f32;
    var W_1: Waves = Waves(vec3(0f), 0f, 0f, 0f, 0f);
    var an: vec3<f32>;
    var local_18: i32;
    var local_19: i32;
    var ma: i32;
    var local_20: i32;
    var local_21: i32;
    var mi: i32;
    var me: i32;
    var local_22: f32;
    var local_23: f32;
    var w0_1: f32;
    var local_24: f32;
    var local_25: f32;
    var w1_1: f32;
    var bw: vec2<f32>;
    var local_26: vec2<f32>;
    var rv_1: f32 = 0f;
    var cr: f32 = 0f;
    var o_3: i32 = 0i;
    var L_6: f32;
    var fk_1: f32;
    var res_1: f32;
    var g_3: vec3<f32>;
    var v: f32;
    var k_1: i32;
    var local_27: i32;
    var a_5: i32;
    var local_28: f32;
    var bwk: f32;
    var r_9: vec3<f32>;
    var local_29: vec3<f32>;
    var local_30: vec3<f32>;

    fp_3 = fp_2;
    n_9 = n_8;
    lmax_3 = lmax_2;
    foot_11 = foot_10;
    let _e182 = n_9;
    an = abs(_e182);
    let _e185 = an;
    let _e187 = an;
    let _e190 = an;
    let _e192 = an;
    if ((_e185.x > _e187.y) && (_e190.x > _e192.z)) {
        local_19 = 0i;
    } else {
        let _e197 = an;
        let _e199 = an;
        if (_e197.y > _e199.z) {
            local_18 = 1i;
        } else {
            local_18 = 2i;
        }
        let _e205 = local_18;
        local_19 = _e205;
    }
    let _e207 = local_19;
    ma = _e207;
    let _e209 = an;
    let _e211 = an;
    let _e214 = an;
    let _e216 = an;
    if ((_e209.x < _e211.y) && (_e214.x < _e216.z)) {
        local_21 = 0i;
    } else {
        let _e221 = an;
        let _e223 = an;
        if (_e221.y < _e223.z) {
            local_20 = 1i;
        } else {
            local_20 = 2i;
        }
        let _e229 = local_20;
        local_21 = _e229;
    }
    let _e231 = local_21;
    mi = _e231;
    let _e234 = mi;
    let _e236 = ma;
    me = ((3i - _e234) - _e236);
    let _e239 = ma;
    if (_e239 == 0i) {
        let _e242 = an;
        local_23 = _e242.x;
    } else {
        let _e244 = ma;
        if (_e244 == 1i) {
            let _e247 = an;
            local_22 = _e247.y;
        } else {
            let _e249 = an;
            local_22 = _e249.z;
        }
        let _e252 = local_22;
        local_23 = _e252;
    }
    let _e254 = local_23;
    w0_1 = _e254;
    let _e256 = me;
    if (_e256 == 0i) {
        let _e259 = an;
        local_25 = _e259.x;
    } else {
        let _e261 = me;
        if (_e261 == 1i) {
            let _e264 = an;
            local_24 = _e264.y;
        } else {
            let _e266 = an;
            local_24 = _e266.z;
        }
        let _e269 = local_24;
        local_25 = _e269;
    }
    let _e271 = local_25;
    w1_1 = _e271;
    let _e273 = w0_1;
    let _e274 = w1_1;
    bw = clamp(((vec2<f32>(_e273, _e274) - vec2(0.5773f)) / vec2(0.4227f)), vec2(0f), vec2(1f));
    let _e290 = bw;
    let _e292 = bw;
    if ((_e290.x + _e292.y) < 0.0001f) {
        local_26 = vec2<f32>(1f, 0f);
    } else {
        let _e300 = bw;
        let _e301 = bw;
        let _e303 = bw;
        local_26 = (_e300 / vec2((_e301.x + _e303.y)));
    }
    let _e309 = local_26;
    bw = _e309;
    let _e310 = bw;
    if (_e310.y < 0.02f) {
        bw = vec2<f32>(1f, 0f);
    }
    loop {
        let _e323 = o_3;
        if !((_e323 < 4i)) {
            break;
        }
        {
            let _e331 = o_3;
            L_6 = (0.25f * exp2(f32(_e331)));
            let _e337 = lmax_3;
            let _e340 = lmax_3;
            let _e343 = L_6;
            fk_1 = (1f - smoothstep((_e337 * 0.3f), (_e340 * 0.6f), _e343));
            let _e347 = fk_1;
            if (_e347 <= 0f) {
                continue;
            }
            let _e350 = foot_11;
            let _e352 = foot_11;
            let _e354 = L_6;
            res_1 = smoothstep(_e350, (3f * _e352), _e354);
            g_3 = vec3(0f);
            v = 0f;
            k_1 = 0i;
            loop {
                let _e364 = k_1;
                if !((_e364 < 2i)) {
                    break;
                }
                {
                    let _e371 = k_1;
                    if (_e371 == 0i) {
                        let _e374 = ma;
                        local_27 = _e374;
                    } else {
                        let _e375 = me;
                        local_27 = _e375;
                    }
                    let _e377 = local_27;
                    a_5 = _e377;
                    let _e379 = k_1;
                    if (_e379 == 0i) {
                        let _e382 = bw;
                        local_28 = _e382.x;
                    } else {
                        let _e384 = bw;
                        local_28 = _e384.y;
                    }
                    let _e387 = local_28;
                    bwk = _e387;
                    let _e389 = bwk;
                    if (_e389 <= 0f) {
                        continue;
                    }
                    let _e392 = a_5;
                    let _e393 = fp_3;
                    let _e394 = L_6;
                    let _e395 = o_3;
                    let _e399 = rippleAxis(_e392, _e393, _e394, (f32(_e395) * 17.31f));
                    r_9 = _e399;
                    let _e401 = g_3;
                    let _e402 = bwk;
                    let _e403 = a_5;
                    if (_e403 == 0i) {
                        let _e407 = r_9;
                        let _e409 = r_9;
                        local_30 = vec3<f32>(0f, _e407.z, _e409.y);
                    } else {
                        let _e412 = a_5;
                        if (_e412 == 1i) {
                            let _e415 = r_9;
                            let _e418 = r_9;
                            local_29 = vec3<f32>(_e415.y, 0f, _e418.z);
                        } else {
                            let _e421 = r_9;
                            let _e423 = r_9;
                            local_29 = vec3<f32>(_e421.y, _e423.z, 0f);
                        }
                        let _e428 = local_29;
                        local_30 = _e428;
                    }
                    let _e430 = local_30;
                    g_3 = (_e401 + (_e402 * _e430));
                    let _e433 = v;
                    let _e434 = bwk;
                    let _e435 = r_9;
                    v = (_e433 + (_e434 * _e435.x));
                }
                continuing {
                    let _e368 = k_1;
                    k_1 = (_e368 + 1i);
                }
            }
            let _e439 = g_3;
            let _e440 = n_9;
            let _e441 = g_3;
            let _e442 = n_9;
            g_3 = (_e439 - (_e440 * dot(_e441, _e442)));
            let _e447 = W_1;
            let _e449 = g_3;
            let _e450 = fk_1;
            let _e451 = res_1;
            W_1.g = (_e447.g + (_e449 * (_e450 * _e451)));
            let _e456 = W_1;
            let _e458 = fk_1;
            let _e459 = fk_1;
            W_1.var_ = (_e456.var_ + ((_e458 * _e459) * 0.78f));
            let _e465 = W_1;
            let _e467 = fk_1;
            let _e468 = fk_1;
            let _e472 = res_1;
            W_1.res = (_e465.res + (((_e467 * _e468) * 0.78f) * _e472));
            let _e476 = W_1;
            let _e478 = fk_1;
            let _e479 = res_1;
            let _e481 = v;
            W_1.crest = (_e476.crest + (((_e478 * _e479) * _e481) / 0.216f));
            let _e486 = rv_1;
            let _e487 = fk_1;
            let _e488 = fk_1;
            let _e490 = res_1;
            let _e492 = res_1;
            rv_1 = (_e486 + (((_e487 * _e488) * _e490) * _e492));
        }
        continuing {
            let _e327 = o_3;
            o_3 = (_e327 + 1i);
        }
    }
    let _e496 = W_1;
    W_1.var0_ = _e496.var_;
    let _e499 = W_1;
    let _e501 = rv_1;
    W_1.crest = (_e499.crest / sqrt(max(_e501, 0.000000001f)));
    let _e506 = W_1;
    return _e506;
}

fn liquidSurface(fp_4: vec3<f32>, n_10: vec3<f32>, upF_3: vec3<f32>, kind: f32, flow: f32, fetch: f32, depth: f32, foot_12: f32, wn: vec2<f32>, grp_2: vec4<f32>, fdir: vec3<f32>, fv: f32, nF: ptr<function, vec3<f32>>, rough: ptr<function, f32>, foam: ptr<function, f32>) {
    var fp_5: vec3<f32>;
    var n_11: vec3<f32>;
    var upF_4: vec3<f32>;
    var kind_1: f32;
    var flow_1: f32;
    var fetch_1: f32;
    var depth_1: f32;
    var foot_13: f32;
    var wn_1: vec2<f32>;
    var grp_3: vec4<f32>;
    var fdir_1: vec3<f32>;
    var fv_1: f32;
    var al_1: f32;
    var toward: f32;
    var local_31: f32;
    var local_32: f32;
    var local_33: f32;
    var strength: f32;
    var east_1: vec3<f32>;
    var local_34: vec3<f32>;
    var wd_2: vec3<f32>;
    var river_2: bool;
    var pond: bool;
    var sea: bool;
    var local_35: vec3<f32>;
    var e1_: vec3<f32>;
    var e2_: vec3<f32>;
    var warp_2: vec3<f32>;
    var local_36: f32;
    var U_1: f32;
    var local_37: f32;
    var Fr: f32;
    var local_38: f32;
    var local_39: f32;
    var local_40: f32;
    var s2_: f32;
    var local_41: f32;
    var local_42: f32;
    var local_43: f32;
    var lmax_4: f32;
    var W_2: Waves;
    var fd: vec3<f32>;
    var local_44: vec3<f32>;
    var ta: f32;
    var tb: f32;
    var wa_1: f32;
    var A: Waves;
    var B: Waves;
    var sc: f32;
    var cov: f32;
    var t_2: f32;
    var z: f32;
    var rk: f32;
    var sw: f32;
    var lace: f32;
    var sh_2: f32;
    var ac: vec3<f32>;
    var cov_1: f32;
    var q_3: vec2<f32>;
    var qa: vec2<f32>;
    var qb: vec2<f32>;
    var na: f32;
    var nb: f32;
    var th: f32;
    var q_4: vec2<f32>;
    var sa: f32;
    var sb: f32;
    var streak: f32;

    fp_5 = fp_4;
    n_11 = n_10;
    upF_4 = upF_3;
    kind_1 = kind;
    flow_1 = flow;
    fetch_1 = fetch;
    depth_1 = depth;
    foot_13 = foot_12;
    wn_1 = wn;
    grp_3 = grp_2;
    fdir_1 = fdir;
    fv_1 = fv;
    let _e193 = upF_4;
    al_1 = abs(asin(clamp(_e193.y, -1f, 1f)));
    let _e202 = upF_4;
    let _e203 = windSense(_e202);
    toward = _e203;
    let _e205 = al_1;
    if (_e205 < 0.09f) {
        local_33 = 0.45f;
    } else {
        let _e209 = al_1;
        if (_e209 < 0.52f) {
            local_32 = 0.9f;
        } else {
            let _e213 = al_1;
            if (_e213 < 1.05f) {
                local_31 = 1.25f;
            } else {
                local_31 = 0.8f;
            }
            let _e219 = local_31;
            local_32 = _e219;
        }
        let _e221 = local_32;
        local_33 = _e221;
    }
    let _e223 = local_33;
    strength = _e223;
    let _e229 = upF_4;
    east_1 = cross(vec3<f32>(0f, 1f, 0f), _e229);
    let _e232 = east_1;
    if (length(_e232) > 0.0001f) {
        let _e236 = east_1;
        let _e238 = toward;
        local_34 = (normalize(_e236) * sign((_e238 + 0.001f)));
    } else {
        local_34 = vec3<f32>(1f, 0f, 0f);
    }
    let _e248 = local_34;
    wd_2 = _e248;
    let _e250 = kind_1;
    let _e253 = kind_1;
    river_2 = ((_e250 > 0.55f) && (_e253 < 0.85f));
    let _e258 = kind_1;
    pond = (_e258 > 0.85f);
    let _e262 = kind_1;
    sea = (_e262 < 0.2f);
    let _e266 = east_1;
    if (length(_e266) > 0.0001f) {
        let _e270 = east_1;
        local_35 = normalize(_e270);
    } else {
        local_35 = vec3<f32>(1f, 0f, 0f);
    }
    let _e277 = local_35;
    e1_ = _e277;
    let _e279 = upF_4;
    let _e280 = e1_;
    e2_ = cross(_e279, _e280);
    let _e283 = e1_;
    let _e284 = wn_1;
    let _e287 = e2_;
    let _e288 = wn_1;
    let _e294 = global.uLiquid;
    warp_2 = ((((_e283 * _e284.x) + (_e287 * _e288.y)) * 0.12f) * _e294.w);
    let _e298 = global.uLiquid;
    let _e300 = strength;
    let _e302 = sea;
    if _e302 {
        local_36 = 1f;
    } else {
        let _e306 = fetch_1;
        local_36 = mix(0.3f, 1f, _e306);
    }
    let _e309 = local_36;
    U_1 = ((_e298.y * _e300) * _e309);
    let _e312 = river_2;
    if _e312 {
        let _e313 = fv_1;
        let _e314 = global.uLiquid2_;
        let _e316 = depth_1;
        local_37 = (_e313 / sqrt((_e314.x * max(_e316, 0.3f))));
    } else {
        local_37 = 0f;
    }
    let _e324 = local_37;
    Fr = _e324;
    let _e326 = sea;
    if _e326 {
        let _e329 = U_1;
        let _e333 = U_1;
        local_40 = ((0.003f * step(0.01f, _e329)) + (0.00512f * _e333));
    } else {
        let _e336 = pond;
        if _e336 {
            let _e339 = U_1;
            local_39 = (0.0003f + (0.0003f * _e339));
        } else {
            let _e342 = river_2;
            if _e342 {
                let _e345 = Fr;
                let _e346 = Fr;
                let _e353 = U_1;
                local_38 = ((0.0012f + (0.035f * min((_e345 * _e346), 2f))) + (0.0015f * _e353));
            } else {
                let _e358 = U_1;
                local_38 = (0.001f + (0.00512f * _e358));
            }
            let _e362 = local_38;
            local_39 = _e362;
        }
        let _e364 = local_39;
        local_40 = _e364;
    }
    let _e366 = local_40;
    s2_ = _e366;
    let _e368 = s2_;
    let _e369 = global.uLiquid;
    s2_ = (_e368 * _e369.z);
    let _e372 = sea;
    if _e372 {
        local_43 = 1000000000f;
    } else {
        let _e374 = river_2;
        if _e374 {
            let _e376 = fv_1;
            let _e378 = fv_1;
            let _e380 = global.uLiquid2_;
            let _e383 = depth_1;
            local_42 = clamp(((((6.2832f * _e376) * _e378) / _e380.x) + _e383), 0.6f, 8f);
        } else {
            let _e388 = pond;
            if _e388 {
                local_41 = 1f;
            } else {
                let _e392 = fetch_1;
                local_41 = (25f + (400f * _e392));
            }
            let _e396 = local_41;
            local_42 = _e396;
        }
        let _e398 = local_42;
        local_43 = _e398;
    }
    let _e400 = local_43;
    lmax_4 = _e400;
    let _e403 = fdir_1;
    let _e404 = upF_4;
    let _e405 = fdir_1;
    let _e406 = upF_4;
    fd = (_e403 - (_e404 * dot(_e405, _e406)));
    let _e411 = fd;
    if (length(_e411) > 0.05f) {
        let _e415 = fd;
        local_44 = normalize(_e415);
    } else {
        local_44 = vec3(0f);
    }
    let _e420 = local_44;
    fd = _e420;
    let _e421 = global.uTime;
    ta = fract((_e421 / 3f));
    let _e426 = global.uTime;
    tb = fract(((_e426 / 3f) + 0.5f));
    let _e435 = ta;
    wa_1 = (1f - abs(((2f * _e435) - 1f)));
    let _e442 = river_2;
    if _e442 {
        {
            let _e443 = fp_5;
            let _e444 = fd;
            let _e445 = fv_1;
            let _e449 = ta;
            let _e452 = n_11;
            let _e453 = lmax_4;
            let _e454 = foot_13;
            let _e455 = riverRipples((_e443 - (((_e444 * _e445) * 3f) * _e449)), _e452, _e453, _e454);
            A = _e455;
            let _e457 = fp_5;
            let _e458 = fd;
            let _e459 = fv_1;
            let _e463 = tb;
            let _e469 = n_11;
            let _e470 = lmax_4;
            let _e471 = foot_13;
            let _e472 = riverRipples(((_e457 - (((_e458 * _e459) * 3f) * _e463)) + vec3(0.37f)), _e469, _e470, _e471);
            B = _e472;
            let _e474 = A;
            W_2 = _e474;
            let _e476 = A;
            let _e478 = wa_1;
            let _e480 = B;
            let _e483 = wa_1;
            W_2.g = ((_e476.g * _e478) + (_e480.g * (1f - _e483)));
            let _e488 = A;
            let _e490 = wa_1;
            let _e492 = B;
            let _e495 = wa_1;
            W_2.crest = ((_e488.crest * _e490) + (_e492.crest * (1f - _e495)));
        }
    } else {
        let _e499 = fp_5;
        let _e500 = n_11;
        let _e501 = wd_2;
        let _e502 = lmax_4;
        let _e504 = foot_13;
        let _e505 = warp_2;
        let _e506 = grp_3;
        let _e507 = liquidWaves(_e499, _e500, _e501, _e502, false, _e504, _e505, _e506);
        W_2 = _e507;
    }
    let _e508 = s2_;
    let _e509 = W_2;
    sc = sqrt((_e508 / max(_e509.var0_, 0.000000001f)));
    let _e516 = n_11;
    let _e517 = W_2;
    let _e519 = sc;
    (*nF) = normalize((_e516 - (_e517.g * _e519)));
    let _e524 = W_2;
    let _e526 = W_2;
    let _e533 = sc;
    (*rough) = clamp((sqrt((2f * max((_e524.var_ - _e526.res), 0f))) * _e533), 0.02f, 0.6f);
    let _e539 = U_1;
    cov = clamp((0.00000384f * pow(_e539, 3.41f)), 0f, 0.3f);
    (*foam) = 0f;
    let _e548 = river_2;
    let _e550 = pond;
    let _e553 = cov;
    if ((!(_e548) && !(_e550)) && (_e553 > 0.0001f)) {
        {
            let _e559 = cov;
            t_2 = sqrt((-2f * log(_e559)));
            let _e564 = t_2;
            let _e567 = t_2;
            let _e571 = t_2;
            let _e573 = t_2;
            let _e578 = t_2;
            let _e582 = t_2;
            let _e584 = t_2;
            let _e588 = t_2;
            let _e590 = t_2;
            let _e592 = t_2;
            z = (_e564 - (((2.515517f + (0.802853f * _e567)) + ((0.010328f * _e571) * _e573)) / (((1f + (1.432788f * _e578)) + ((0.189269f * _e582) * _e584)) + (((0.001308f * _e588) * _e590) * _e592))));
            let _e598 = W_2;
            let _e600 = W_2;
            rk = (_e598.res / max(_e600.var_, 0.000000001f));
            let _e606 = cov;
            let _e607 = z;
            let _e610 = z;
            let _e613 = W_2;
            let _e616 = rk;
            (*foam) = (mix(_e606, smoothstep((_e607 - 0.25f), (_e610 + 0.35f), _e613.crest), _e616) * 0.9f);
        }
    }
    let _e620 = river_2;
    let _e622 = pond;
    let _e625 = depth_1;
    if ((!(_e620) && !(_e622)) && (_e625 < 1.6f)) {
        {
            let _e632 = depth_1;
            let _e636 = global.uTime;
            sw = (0.5f + (0.5f * sin((((6.2832f * _e632) / 0.4f) + (_e636 * 1.3f)))));
            let _e646 = grp_3;
            let _e649 = W_2;
            lace = smoothstep(0.2f, 0.8f, (_e646.x + (0.2f * _e649.crest)));
            let _e658 = depth_1;
            let _e663 = sw;
            let _e666 = lace;
            let _e671 = depth_1;
            let _e676 = lace;
            sh_2 = ((((1f - smoothstep(0.05f, 1.6f, _e658)) * smoothstep(0.75f, 0.97f, _e663)) * _e666) + ((1f - smoothstep(0f, 0.15f, _e671)) * (0.4f + (0.6f * _e676))));
            let _e682 = (*foam);
            let _e683 = sh_2;
            let _e689 = U_1;
            (*foam) = max(_e682, ((clamp(_e683, 0f, 1f) * smoothstep(0.5f, 4f, _e689)) * 0.75f));
        }
    }
    let _e695 = river_2;
    let _e696 = fd;
    if (_e695 && (length(_e696) > 0f)) {
        {
            let _e701 = upF_4;
            let _e702 = fd;
            ac = cross(_e701, _e702);
            let _e705 = Fr;
            cov_1 = clamp(((_e705 - 0.6f) / 0.9f), 0f, 1f);
            let _e714 = cov_1;
            let _e715 = cov_1;
            cov_1 = (_e714 * _e715);
            let _e717 = cov_1;
            if (_e717 > 0f) {
                {
                    let _e720 = fp_5;
                    let _e721 = ac;
                    let _e725 = fp_5;
                    let _e726 = fd;
                    q_3 = vec2<f32>((dot(_e720, _e721) * 0.15f), (dot(_e725, _e726) * 0.04f));
                    let _e732 = q_3;
                    let _e734 = fv_1;
                    let _e737 = ta;
                    qa = (_e732 - vec2<f32>(0f, (((_e734 * 3f) * _e737) * 0.04f)));
                    let _e744 = q_3;
                    let _e750 = fv_1;
                    let _e753 = tb;
                    qb = ((_e744 + vec2<f32>(0.41f, 0f)) - vec2<f32>(0f, (((_e750 * 3f) * _e753) * 0.04f)));
                    let _e761 = qa;
                    let _e763 = textureSampleLevel(tDetailTexture, tDetailSampler, _e761, 0f);
                    let _e767 = qa;
                    let _e774 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e767 * 3.1f) + vec2(0.3f)), 0f);
                    na = ((0.65f * _e763.w) + (0.35f * _e774.x));
                    let _e780 = qb;
                    let _e782 = textureSampleLevel(tDetailTexture, tDetailSampler, _e780, 0f);
                    let _e786 = qb;
                    let _e793 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e786 * 3.1f) + vec2(0.3f)), 0f);
                    nb = ((0.65f * _e782.w) + (0.35f * _e793.x));
                    let _e800 = cov_1;
                    th = mix(0.75f, 0.28f, _e800);
                    let _e803 = th;
                    let _e806 = th;
                    let _e809 = nb;
                    let _e810 = na;
                    let _e811 = wa_1;
                    let _e814 = W_2;
                    (*foam) = (smoothstep((_e803 - 0.02f), (_e806 + 0.1f), (mix(_e809, _e810, _e811) + (0.06f * _e814.crest))) * 0.85f);
                }
            }
            let _e821 = fp_5;
            let _e822 = ac;
            let _e826 = fp_5;
            let _e827 = fd;
            q_4 = vec2<f32>((dot(_e821, _e822) * 0.2f), (dot(_e826, _e827) * 0.004f));
            let _e834 = q_4;
            let _e837 = fp_5;
            let _e838 = ac;
            let _e840 = fp_5;
            let _e841 = fd;
            let _e847 = textureSampleLevel(tDetailTexture, tDetailSampler, (vec2<f32>(dot(_e837, _e838), dot(_e840, _e841)) * 0.012f), 0f);
            q_4.x = (_e834.x + (1.2f * (_e847.x - 0.5f)));
            let _e853 = q_4;
            let _e855 = fv_1;
            let _e858 = ta;
            let _e865 = textureSampleLevel(tDetailTexture, tDetailSampler, (_e853 - vec2<f32>(0f, (((_e855 * 3f) * _e858) * 0.004f))), 0f);
            sa = _e865.w;
            let _e868 = q_4;
            let _e874 = fv_1;
            let _e877 = tb;
            let _e884 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e868 + vec2<f32>(0.43f, 0f)) - vec2<f32>(0f, (((_e874 * 3f) * _e877) * 0.004f))), 0f);
            sb = _e884.w;
            let _e889 = sb;
            let _e890 = sa;
            let _e891 = wa_1;
            let _e896 = Fr;
            streak = (smoothstep(0.7f, 0.8f, mix(_e889, _e890, _e891)) * smoothstep(0.6f, 1.2f, _e896));
            let _e900 = (*foam);
            let _e901 = streak;
            (*foam) = max(_e900, (_e901 * 0.3f));
        }
    }
    let _e905 = (*foam);
    let _e906 = global.uLiquid2_;
    (*foam) = (_e905 * _e906.y);
    return;
}

fn liquidTs(Tm: f32, kind_2: f32, flow_2: f32, upF_5: vec3<f32>) -> vec2<f32> {
    var Tm_1: f32;
    var kind_3: f32;
    var flow_3: f32;
    var upF_6: vec3<f32>;
    var Ts_1: f32;
    var yr: vec3<f32>;
    var local_45: f32;
    var local_46: f32;
    var local_47: f32;
    var follow: f32;
    var local_48: f32;
    var local_49: f32;
    var local_50: f32;
    var follow_1: f32;
    var local_51: f32;
    var local_52: f32;
    var Tf_2: f32;

    Tm_1 = Tm;
    kind_3 = kind_2;
    flow_3 = flow_2;
    upF_6 = upF_5;
    let _e175 = global.uSeason;
    if (_e175.z > 0.5f) {
        {
            let _e179 = upF_6;
            let _e180 = seasonYear(_e179);
            yr = _e180;
            let _e182 = kind_3;
            if (_e182 < 0.2f) {
                local_47 = 1f;
            } else {
                let _e186 = kind_3;
                if (_e186 < 0.55f) {
                    local_46 = 0.8f;
                } else {
                    let _e190 = kind_3;
                    if (_e190 < 0.85f) {
                        local_45 = 0.7f;
                    } else {
                        local_45 = 1f;
                    }
                    let _e196 = local_45;
                    local_46 = _e196;
                }
                let _e198 = local_46;
                local_47 = _e198;
            }
            let _e200 = local_47;
            follow = _e200;
            let _e202 = Tm_1;
            let _e203 = follow;
            let _e204 = yr;
            let _e206 = global.uSeason;
            let _e210 = yr;
            let _e212 = global.uSeason;
            Ts_1 = (_e202 + (_e203 * ((_e204.x * cos(_e206.x)) + (_e210.y * sin(_e212.x)))));
        }
    } else {
        {
            let _e219 = kind_3;
            if (_e219 < 0.2f) {
                local_50 = 0.25f;
            } else {
                let _e223 = kind_3;
                if (_e223 < 0.55f) {
                    local_49 = 0.6f;
                } else {
                    let _e227 = kind_3;
                    if (_e227 < 0.85f) {
                        local_48 = 0.45f;
                    } else {
                        local_48 = 0.8f;
                    }
                    let _e233 = local_48;
                    local_49 = _e233;
                }
                let _e235 = local_49;
                local_50 = _e235;
            }
            let _e237 = local_50;
            follow_1 = _e237;
            let _e239 = Tm_1;
            let _e241 = global.uLiquid2_;
            let _e244 = upF_6;
            let _e247 = follow_1;
            Ts_1 = (_e239 + (((70f * _e241.w) * _e244.y) * _e247));
        }
    }
    let _e250 = kind_3;
    if (_e250 < 0.2f) {
        let _e253 = global.uLiquid2_;
        local_51 = _e253.z;
    } else {
        local_51 = 0f;
    }
    let _e257 = local_51;
    let _e258 = kind_3;
    let _e261 = kind_3;
    if ((_e258 > 0.55f) && (_e261 < 0.85f)) {
        let _e266 = flow_3;
        local_52 = (3f * _e266);
    } else {
        local_52 = 0f;
    }
    let _e270 = local_52;
    Tf_2 = (_e257 - _e270);
    let _e273 = Ts_1;
    let _e274 = Tf_2;
    return vec2<f32>(_e273, _e274);
}

fn seaIceCover(ice: f32, nA: f32, nR: f32) -> f32 {
    var ice_1: f32;
    var nA_1: f32;
    var nR_1: f32;

    ice_1 = ice;
    nA_1 = nA;
    nR_1 = nR;
    let _e174 = ice_1;
    let _e175 = nA_1;
    let _e181 = nR_1;
    let _e190 = ice_1;
    return (smoothstep(0.35f, 0.75f, ((_e174 + ((_e175 - 0.5f) * 0.9f)) + ((_e181 - 0.5f) * 0.35f))) * smoothstep(0f, 0.15f, _e190));
}

fn floeHash(x: u32, y: u32, z_1: u32, s_1: u32) -> u32 {
    var x_1: u32;
    var y_1: u32;
    var z_2: u32;
    var s_2: u32;
    var h_2: u32;

    x_1 = x;
    y_1 = y;
    z_2 = z_1;
    s_2 = s_1;
    let _e174 = x_1;
    let _e177 = y_1;
    let _e181 = z_2;
    let _e185 = s_2;
    h_2 = ((((_e174 * 2376512323u) ^ (_e177 * 3625334849u)) ^ (_e181 * 3407524639u)) ^ (_e185 * 374761393u));
    let _e190 = h_2;
    let _e191 = h_2;
    h_2 = (_e190 ^ (_e191 >> 15u));
    let _e195 = h_2;
    h_2 = (_e195 * 739982445u);
    let _e198 = h_2;
    let _e199 = h_2;
    h_2 = (_e198 ^ (_e199 >> 12u));
    let _e203 = h_2;
    h_2 = (_e203 * 695872825u);
    let _e206 = h_2;
    let _e207 = h_2;
    h_2 = (_e206 ^ (_e207 >> 15u));
    let _e211 = h_2;
    return _e211;
}

fn tri0_(p_4: vec3<f32>, w_1: vec3<f32>, period: f32) -> vec4<f32> {
    var p_5: vec3<f32>;
    var w_2: vec3<f32>;
    var period_1: f32;
    var a_6: vec4<f32>;
    var b_2: vec4<f32>;
    var c_4: vec4<f32>;

    p_5 = p_4;
    w_2 = w_1;
    period_1 = period;
    let _e173 = p_5;
    let _e175 = period_1;
    let _e179 = textureSampleLevel(tDetailTexture, tDetailSampler, (_e173.yz / vec2(_e175)), 0f);
    a_6 = _e179;
    let _e181 = p_5;
    let _e183 = period_1;
    let _e190 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e181.zx / vec2(_e183)) + vec2(0.37f)), 0f);
    b_2 = _e190;
    let _e192 = p_5;
    let _e194 = period_1;
    let _e201 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e192.xy / vec2(_e194)) + vec2(0.71f)), 0f);
    c_4 = _e201;
    let _e203 = a_6;
    let _e204 = w_2;
    let _e207 = b_2;
    let _e208 = w_2;
    let _e212 = c_4;
    let _e213 = w_2;
    return (((_e203 * _e204.x) + (_e207 * _e208.y)) + (_e212 * _e213.z));
}

fn tri(p_6: vec3<f32>, w_3: vec3<f32>, period_2: f32) -> vec4<f32> {
    var p_7: vec3<f32>;
    var w_4: vec3<f32>;
    var period_3: f32;
    var a_7: vec4<f32>;
    var b_3: vec4<f32>;
    var c_5: vec4<f32>;

    p_7 = p_6;
    w_4 = w_3;
    period_3 = period_2;
    let _e173 = p_7;
    let _e175 = period_3;
    let _e179 = textureSampleLevel(tDetailTexture, tDetailSampler, (_e173.yz / vec2(_e175)), 0f);
    a_7 = _e179;
    let _e181 = p_7;
    let _e183 = period_3;
    let _e190 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e181.zx / vec2(_e183)) + vec2(0.37f)), 0f);
    b_3 = _e190;
    let _e192 = p_7;
    let _e194 = period_3;
    let _e201 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e192.xy / vec2(_e194)) + vec2(0.71f)), 0f);
    c_5 = _e201;
    let _e203 = a_7;
    let _e204 = w_4;
    let _e207 = b_3;
    let _e208 = w_4;
    let _e212 = c_5;
    let _e213 = w_4;
    return (((_e203 * _e204.x) + (_e207 * _e208.y)) + (_e212 * _e213.z));
}

fn leadIce(lid: u32, frz: f32, pDay: f32) -> vec2<f32> {
    var lid_1: u32;
    var frz_1: f32;
    var pDay_1: f32;
    var age: f32;
    var local_53: f32;
    var h_3: f32;

    lid_1 = lid;
    frz_1 = frz;
    pDay_1 = pDay;
    let _e174 = lid_1;
    age = (-2f * log(((f32((_e174 & 65535u)) + 0.5f) / 65536f)));
    let _e185 = frz_1;
    if (_e185 > 0f) {
        let _e189 = frz_1;
        let _e190 = age;
        local_53 = (1.33f * pow((_e189 * _e190), 0.58f));
    } else {
        local_53 = 0f;
    }
    let _e197 = local_53;
    h_3 = _e197;
    let _e199 = h_3;
    let _e201 = pDay_1;
    let _e203 = age;
    let _e211 = h_3;
    return vec2<f32>(_e199, ((1f - exp(((-(_e201) * _e203) / 12f))) * smoothstep(3f, 8f, _e211)));
}

fn leadHalf(cid: u32, c_6: f32, s_3: f32) -> f32 {
    var cid_1: u32;
    var c_7: f32;
    var s_4: f32;

    cid_1 = cid;
    c_7 = c_6;
    s_4 = s_3;
    let _e174 = s_4;
    let _e180 = cid_1;
    let _e192 = c_7;
    return min(150f, (((0.03f * min(_e174, 2048f)) * (0.2f + ((1.6f * f32((_e180 & 255u))) / 256f))) * (1f + (8f * (1f - sqrt(_e192))))));
}

fn crackOpen(cid_2: u32, c_8: f32, s_5: f32) -> f32 {
    var cid_3: u32;
    var c_9: f32;
    var s_6: f32;

    cid_3 = cid_2;
    c_9 = c_8;
    s_6 = s_5;
    let _e172 = cid_3;
    let _e183 = c_9;
    if ((f32(((_e172 >> 8u) & 255u)) / 256f) < (0.5f * smoothstep(0.85f, 1f, _e183))) {
        let _e188 = cid_3;
        return -((0.5f + (f32(((_e188 >> 16u) & 255u)) / 255f)));
    }
    let _e198 = cid_3;
    let _e199 = c_9;
    let _e200 = s_6;
    let _e201 = leadHalf(_e198, _e199, _e200);
    return _e201;
}

fn pieceCover(m_4: vec3<f32>, ice_2: f32) -> f32 {
    var m_5: vec3<f32>;
    var ice_3: f32;
    var u_2: vec3<f32>;
    var wm: vec3<f32>;
    var local_54: f32;

    m_5 = m_4;
    ice_3 = ice_2;
    let _e170 = m_5;
    u_2 = normalize(_e170);
    let _e173 = u_2;
    wm = pow(abs(_e173), vec3(4f));
    let _e179 = wm;
    let _e180 = wm;
    let _e182 = wm;
    let _e185 = wm;
    wm = (_e179 / vec3(((_e180.x + _e182.y) + _e185.z)));
    let _e190 = global.uSeason;
    if (_e190.z > 0.5f) {
        let _e194 = m_5;
        let _e195 = global.uLiquid2_;
        let _e197 = seaIceAt(_e194, _e195.z);
        local_54 = _e197;
    } else {
        let _e198 = ice_3;
        local_54 = _e198;
    }
    let _e200 = local_54;
    let _e201 = m_5;
    let _e202 = wm;
    let _e204 = tri0_(_e201, _e202, 512f);
    let _e206 = m_5;
    let _e207 = wm;
    let _e209 = tri0_(_e206, _e207, 64f);
    let _e211 = seaIceCover(_e200, _e204.w, _e209.x);
    return _e211;
}

fn faceLead(face: u32, axis: i32, neg: bool) -> u32 {
    var face_1: u32;
    var axis_1: i32;
    var neg_1: bool;
    var local_55: u32;
    var of_: u32;

    face_1 = face;
    axis_1 = axis;
    neg_1 = neg;
    let _e172 = axis_1;
    let _e176 = neg_1;
    if _e176 {
        local_55 = 1u;
    } else {
        local_55 = 0u;
    }
    let _e180 = local_55;
    of_ = (u32((_e172 * 2i)) + _e180);
    let _e183 = face_1;
    let _e184 = of_;
    let _e186 = face_1;
    let _e187 = of_;
    let _e191 = floeHash(min(_e183, _e184), max(_e186, _e187), 20253u, 11132u);
    return _e191;
}

fn floeRound(size: f32, id: u32, c_10: f32) -> f32 {
    var size_1: f32;
    var id_1: u32;
    var c_11: f32;
    var age_1: f32;

    size_1 = size;
    id_1 = id;
    c_11 = c_10;
    let _e177 = size_1;
    let _e183 = id_1;
    age_1 = ((0.3f + (0.7f * smoothstep(16f, 200f, _e177))) * (0.6f + ((0.4f * f32((_e183 >> 16u))) / 65536f)));
    let _e193 = size_1;
    let _e196 = age_1;
    let _e203 = c_11;
    return (_e193 * ((0.06f * (0.5f + _e196)) + (0.32f * (1f - smoothstep(0.5f, 0.9f, _e203)))));
}

fn floeOf(p_8: vec3<f32>, ice_4: f32, id_2: ptr<function, u32>, e: ptr<function, f32>, lid_2: ptr<function, u32>, c_12: ptr<function, f32>, size_2: ptr<function, f32>, mid: ptr<function, vec3<f32>>, there: ptr<function, bool>, ridge: ptr<function, vec4<f32>>) {
    var p_9: vec3<f32>;
    var ice_5: f32;
    var R_2: f32;
    var a_8: vec3<f32>;
    var local_56: i32;
    var local_57: i32;
    var ax: i32;
    var b_4: i32;
    var d_6: i32;
    var neg_2: bool;
    var local_58: f32;
    var sg: f32;
    var pu: f32;
    var pv: f32;
    var local_59: u32;
    var face_2: u32;
    var V: array<vec2<f32>, 12>;
    var EI: array<u32, 12>;
    var ES: array<f32, 12>;
    var i_6: i32 = 0i;
    var n_12: i32 = 4i;
    var s_7: f32 = 0f;
    var cP: f32 = -1f;
    var m_6: vec3<f32>;
    var lvl: i32 = 0i;
    var v0_: vec2<f32>;
    var cs_1: vec2<f32>;
    var A_1: f32;
    var i_7: i32;
    var xi: vec2<f32>;
    var xj: vec2<f32>;
    var w_5: f32;
    var cc: vec2<f32>;
    var sxx: f32;
    var syy: f32;
    var sxy: f32;
    var i_8: i32;
    var x_2: vec2<f32>;
    var local_60: f32;
    var th_1: f32;
    var ext: f32;
    var mm: vec3<f32>;
    var h_4: u32;
    var tc: f32;
    var off: f32;
    var qq: vec2<f32>;
    var KA: f32;
    var KB: f32;
    var KC: f32;
    var local_61: f32;
    var side: f32;
    var cid_4: u32;
    var g_4: f32;
    var W_3: array<vec2<f32>, 12>;
    var WI: array<u32, 12>;
    var WS: array<f32, 12>;
    var k_2: i32;
    var i_9: i32;
    var xi_1: vec2<f32>;
    var xj_1: vec2<f32>;
    var di: f32;
    var dj: f32;
    var i_10: i32;
    var local_62: u32;
    var rh: f32 = 0f;
    var e2_1: f32 = 100000000000000000000f;
    var i_11: i32 = 0i;
    var dv: vec2<f32>;
    var N3_: vec3<f32>;
    var dn_1: f32;
    var ek: f32;
    var local_63: f32;
    var rr: f32;

    p_9 = p_8;
    ice_5 = ice_4;
    let _e179 = p_9;
    R_2 = length(_e179);
    let _e182 = p_9;
    a_8 = abs(_e182);
    let _e185 = a_8;
    let _e187 = a_8;
    let _e190 = a_8;
    let _e192 = a_8;
    if ((_e185.x >= _e187.y) && (_e190.x >= _e192.z)) {
        local_57 = 0i;
    } else {
        let _e197 = a_8;
        let _e199 = a_8;
        if (_e197.y >= _e199.z) {
            local_56 = 1i;
        } else {
            local_56 = 2i;
        }
        let _e205 = local_56;
        local_57 = _e205;
    }
    let _e207 = local_57;
    ax = _e207;
    let _e209 = ax;
    b_4 = ((_e209 + 1i) % 3i);
    let _e215 = ax;
    d_6 = ((_e215 + 2i) % 3i);
    let _e221 = ax;
    let _e223 = p_9[_e221];
    neg_2 = (_e223 < 0f);
    let _e227 = neg_2;
    if _e227 {
        local_58 = -1f;
    } else {
        local_58 = 1f;
    }
    let _e232 = local_58;
    sg = _e232;
    let _e234 = b_4;
    let _e236 = p_9[_e234];
    let _e237 = ax;
    let _e239 = p_9[_e237];
    pu = (_e236 / _e239);
    let _e242 = d_6;
    let _e244 = p_9[_e242];
    let _e245 = ax;
    let _e247 = p_9[_e245];
    pv = (_e244 / _e247);
    let _e250 = ax;
    let _e254 = neg_2;
    if _e254 {
        local_59 = 1u;
    } else {
        local_59 = 0u;
    }
    let _e258 = local_59;
    face_2 = (u32((_e250 * 2i)) + _e258);
    V[0i] = vec2<f32>(-1f, -1f);
    V[1i] = vec2<f32>(1f, -1f);
    V[2i] = vec2<f32>(1f, 1f);
    V[3i] = vec2<f32>(-1f, 1f);
    let _e290 = face_2;
    let _e291 = d_6;
    let _e292 = neg_2;
    let _e294 = faceLead(_e290, _e291, !(_e292));
    EI[0i] = _e294;
    let _e297 = face_2;
    let _e298 = b_4;
    let _e299 = neg_2;
    let _e300 = faceLead(_e297, _e298, _e299);
    EI[1i] = _e300;
    let _e303 = face_2;
    let _e304 = d_6;
    let _e305 = neg_2;
    let _e306 = faceLead(_e303, _e304, _e305);
    EI[2i] = _e306;
    let _e309 = face_2;
    let _e310 = b_4;
    let _e311 = neg_2;
    let _e313 = faceLead(_e309, _e310, !(_e311));
    EI[3i] = _e313;
    loop {
        let _e316 = i_6;
        if !((_e316 < 4i)) {
            break;
        }
        let _e323 = i_6;
        let _e325 = i_6;
        let _e327 = EI[_e325];
        let _e330 = leadHalf(_e327, 1f, 4096f);
        ES[_e323] = _e330;
        continuing {
            let _e320 = i_6;
            i_6 = (_e320 + 1i);
        }
    }
    (*ridge) = vec4<f32>(0f, 0f, 0f, 100000000000000000000f);
    let _e338 = face_2;
    let _e342 = floeHash(_e338, 20942u, 0u, 14971u);
    (*id_2) = _e342;
    (*c_12) = 1f;
    let _e349 = p_9;
    m_6 = _e349;
    loop {
        let _e353 = lvl;
        if !((_e353 < 32i)) {
            break;
        }
        {
            let _e362 = V[0];
            v0_ = _e362;
            cs_1 = vec2(0f);
            A_1 = 0f;
            i_7 = 0i;
            loop {
                let _e371 = i_7;
                if !((_e371 < POLY_MAX)) {
                    break;
                }
                {
                    let _e377 = i_7;
                    let _e378 = n_12;
                    if (_e377 >= _e378) {
                        break;
                    }
                    let _e380 = i_7;
                    let _e382 = V[_e380];
                    let _e383 = v0_;
                    xi = (_e382 - _e383);
                    let _e386 = i_7;
                    let _e389 = n_12;
                    let _e392 = V[((_e386 + 1i) % _e389)];
                    let _e393 = v0_;
                    xj = (_e392 - _e393);
                    let _e396 = xi;
                    let _e398 = xj;
                    let _e401 = xj;
                    let _e403 = xi;
                    w_5 = ((_e396.x * _e398.y) - (_e401.x * _e403.y));
                    let _e408 = A_1;
                    let _e409 = w_5;
                    A_1 = (_e408 + _e409);
                    let _e411 = cs_1;
                    let _e412 = xi;
                    let _e413 = xj;
                    let _e415 = w_5;
                    cs_1 = (_e411 + ((_e412 + _e413) * _e415));
                }
                continuing {
                    let _e374 = i_7;
                    i_7 = (_e374 + 1i);
                }
            }
            let _e418 = A_1;
            A_1 = (_e418 * 0.5f);
            let _e421 = A_1;
            if (abs(_e421) < 0.00000000000000000001f) {
                break;
            }
            let _e425 = v0_;
            let _e426 = cs_1;
            let _e428 = A_1;
            cc = (_e425 + (_e426 / vec2((6f * _e428))));
            sxx = 0f;
            syy = 0f;
            sxy = 0f;
            i_8 = 0i;
            loop {
                let _e442 = i_8;
                if !((_e442 < POLY_MAX)) {
                    break;
                }
                {
                    let _e448 = i_8;
                    let _e449 = n_12;
                    if (_e448 >= _e449) {
                        break;
                    }
                    let _e451 = i_8;
                    let _e453 = V[_e451];
                    let _e454 = cc;
                    x_2 = (_e453 - _e454);
                    let _e457 = sxx;
                    let _e458 = x_2;
                    let _e460 = x_2;
                    sxx = (_e457 + (_e458.x * _e460.x));
                    let _e464 = syy;
                    let _e465 = x_2;
                    let _e467 = x_2;
                    syy = (_e464 + (_e465.y * _e467.y));
                    let _e471 = sxy;
                    let _e472 = x_2;
                    let _e474 = x_2;
                    sxy = (_e471 + (_e472.x * _e474.y));
                }
                continuing {
                    let _e445 = i_8;
                    i_8 = (_e445 + 1i);
                }
            }
            let _e478 = sxy;
            let _e480 = sxx;
            let _e481 = syy;
            let _e486 = sxx;
            let _e487 = syy;
            if ((abs(_e478) + abs((_e480 - _e481))) > (0.000000000000000000000000000001f * (_e486 + _e487))) {
                let _e493 = sxy;
                let _e495 = sxx;
                let _e496 = syy;
                local_60 = (0.5f * atan2((2f * _e493), (_e495 - _e496)));
            } else {
                local_60 = 0f;
            }
            let _e502 = local_60;
            th_1 = _e502;
            let _e504 = sxx;
            let _e505 = syy;
            let _e507 = n_12;
            ext = sqrt(((_e504 + _e505) / f32(_e507)));
            let _e513 = ax;
            let _e515 = sg;
            mm[_e513] = _e515;
            let _e516 = b_4;
            let _e518 = sg;
            let _e519 = cc;
            mm[_e516] = (_e518 * _e519.x);
            let _e522 = d_6;
            let _e524 = sg;
            let _e525 = cc;
            mm[_e522] = (_e524 * _e525.y);
            let _e528 = mm;
            let _e530 = R_2;
            m_6 = (normalize(_e528) * _e530);
            let _e532 = R_2;
            let _e533 = A_1;
            let _e538 = cc;
            let _e539 = cc;
            s_7 = ((_e532 * sqrt(abs(_e533))) / pow((1f + dot(_e538, _e539)), 0.75f));
            let _e545 = (*id_2);
            let _e546 = lvl;
            let _e550 = floeHash(_e545, u32(_e546), 20942u, 14971u);
            h_4 = _e550;
            let _e552 = th_1;
            let _e555 = h_4;
            tc = (((_e552 + 1.5708f) + ((f32(((_e555 >> 8u) & 1023u)) / 1023f) * 1.0472f)) - 0.5236f);
            let _e569 = h_4;
            let _e581 = ext;
            off = ((((f32(((_e569 >> 18u) & 255u)) / 255f) - 0.5f) * 0.6f) * _e581);
            let _e584 = cc;
            let _e585 = th_1;
            let _e587 = th_1;
            let _e590 = off;
            qq = (_e584 + (vec2<f32>(cos(_e585), sin(_e587)) * _e590));
            let _e594 = tc;
            KA = -(sin(_e594));
            let _e598 = tc;
            KB = cos(_e598);
            let _e601 = KA;
            let _e602 = qq;
            let _e605 = KB;
            let _e606 = qq;
            KC = -(((_e601 * _e602.x) + (_e605 * _e606.y)));
            let _e612 = s_7;
            if (_e612 < 4096f) {
                {
                    let _e615 = cP;
                    let _e618 = s_7;
                    if ((_e615 < 0f) || (_e618 < 1024f)) {
                        let _e622 = m_6;
                        let _e623 = ice_5;
                        let _e624 = pieceCover(_e622, _e623);
                        cP = _e624;
                    }
                    let _e625 = cP;
                    (*c_12) = _e625;
                    let _e626 = s_7;
                    let _e631 = (*c_12);
                    let _e636 = h_4;
                    let _e643 = (*c_12);
                    if ((_e626 < (12f + (288f * smoothstep(0.4f, 0.95f, _e631)))) || (f32((_e636 & 255u)) < (51.2f * smoothstep(0.5f, 0.9f, _e643)))) {
                        break;
                    }
                }
            }
            let _e648 = n_12;
            if (_e648 >= 11i) {
                break;
            }
            let _e653 = KA;
            let _e654 = pu;
            let _e656 = KB;
            let _e657 = pv;
            let _e660 = KC;
            if ((((_e653 * _e654) + (_e656 * _e657)) + _e660) >= 0f) {
                local_61 = 1f;
            } else {
                local_61 = -1f;
            }
            let _e668 = local_61;
            side = _e668;
            let _e670 = (*id_2);
            let _e671 = lvl;
            let _e675 = floeHash(_e670, u32(_e671), 31249u, 7997u);
            cid_4 = _e675;
            let _e677 = cid_4;
            let _e678 = (*c_12);
            let _e679 = s_7;
            let _e680 = crackOpen(_e677, _e678, _e679);
            g_4 = _e680;
            k_2 = 0i;
            i_9 = 0i;
            loop {
                let _e689 = i_9;
                if !((_e689 < POLY_MAX)) {
                    break;
                }
                {
                    let _e695 = i_9;
                    let _e696 = n_12;
                    let _e698 = k_2;
                    if ((_e695 >= _e696) || (_e698 >= POLY_MAX)) {
                        break;
                    }
                    let _e701 = i_9;
                    let _e703 = V[_e701];
                    xi_1 = _e703;
                    let _e705 = i_9;
                    let _e708 = n_12;
                    let _e711 = V[((_e705 + 1i) % _e708)];
                    xj_1 = _e711;
                    let _e713 = side;
                    let _e714 = KA;
                    let _e715 = xi_1;
                    let _e718 = KB;
                    let _e719 = xi_1;
                    let _e723 = KC;
                    di = (_e713 * (((_e714 * _e715.x) + (_e718 * _e719.y)) + _e723));
                    let _e727 = side;
                    let _e728 = KA;
                    let _e729 = xj_1;
                    let _e732 = KB;
                    let _e733 = xj_1;
                    let _e737 = KC;
                    dj = (_e727 * (((_e728 * _e729.x) + (_e732 * _e733.y)) + _e737));
                    let _e741 = di;
                    if (_e741 >= 0f) {
                        {
                            let _e744 = k_2;
                            let _e746 = xi_1;
                            W_3[_e744] = _e746;
                            let _e747 = k_2;
                            let _e749 = i_9;
                            let _e751 = EI[_e749];
                            WI[_e747] = _e751;
                            let _e752 = k_2;
                            let _e754 = i_9;
                            let _e756 = ES[_e754];
                            WS[_e752] = _e756;
                            let _e757 = k_2;
                            k_2 = (_e757 + 1i);
                        }
                    }
                    let _e760 = di;
                    let _e763 = dj;
                    let _e767 = k_2;
                    if (((_e760 >= 0f) != (_e763 >= 0f)) && (_e767 < POLY_MAX)) {
                        {
                            let _e770 = k_2;
                            let _e772 = xi_1;
                            let _e773 = xj_1;
                            let _e774 = xi_1;
                            let _e776 = di;
                            let _e777 = di;
                            let _e778 = dj;
                            W_3[_e770] = (_e772 + ((_e773 - _e774) * (_e776 / (_e777 - _e778))));
                            let _e783 = di;
                            if (_e783 >= 0f) {
                                {
                                    let _e786 = k_2;
                                    let _e788 = cid_4;
                                    WI[_e786] = _e788;
                                    let _e789 = k_2;
                                    let _e791 = g_4;
                                    WS[_e789] = _e791;
                                }
                            } else {
                                {
                                    let _e792 = k_2;
                                    let _e794 = i_9;
                                    let _e796 = EI[_e794];
                                    WI[_e792] = _e796;
                                    let _e797 = k_2;
                                    let _e799 = i_9;
                                    let _e801 = ES[_e799];
                                    WS[_e797] = _e801;
                                }
                            }
                            let _e802 = k_2;
                            k_2 = (_e802 + 1i);
                        }
                    }
                }
                continuing {
                    let _e692 = i_9;
                    i_9 = (_e692 + 1i);
                }
            }
            i_10 = 0i;
            loop {
                let _e807 = i_10;
                if !((_e807 < POLY_MAX)) {
                    break;
                }
                {
                    let _e813 = i_10;
                    let _e815 = i_10;
                    let _e817 = W_3[_e815];
                    V[_e813] = _e817;
                    let _e818 = i_10;
                    let _e820 = i_10;
                    let _e822 = WI[_e820];
                    EI[_e818] = _e822;
                    let _e823 = i_10;
                    let _e825 = i_10;
                    let _e827 = WS[_e825];
                    ES[_e823] = _e827;
                }
                continuing {
                    let _e810 = i_10;
                    i_10 = (_e810 + 1i);
                }
            }
            let _e828 = k_2;
            n_12 = _e828;
            let _e829 = (*id_2);
            let _e830 = side;
            if (_e830 > 0f) {
                local_62 = 1u;
            } else {
                local_62 = 0u;
            }
            let _e836 = local_62;
            let _e837 = lvl;
            let _e840 = floeHash(_e829, _e836, u32(_e837), 40503u);
            (*id_2) = _e840;
        }
        continuing {
            let _e357 = lvl;
            lvl = (_e357 + 1i);
        }
    }
    (*e) = 100000000000000000000f;
    (*lid_2) = 0u;
    loop {
        let _e849 = i_11;
        if !((_e849 < POLY_MAX)) {
            break;
        }
        {
            let _e855 = i_11;
            let _e856 = n_12;
            if (_e855 >= _e856) {
                break;
            }
            let _e858 = i_11;
            let _e861 = n_12;
            let _e864 = V[((_e858 + 1i) % _e861)];
            let _e865 = i_11;
            let _e867 = V[_e865];
            dv = (_e864 - _e867);
            let _e870 = dv;
            let _e871 = dv;
            if (dot(_e870, _e871) < 0.000000000000000000000001f) {
                continue;
            }
            let _e876 = b_4;
            let _e878 = dv;
            N3_[_e876] = -(_e878.y);
            let _e881 = d_6;
            let _e883 = dv;
            N3_[_e881] = _e883.x;
            let _e885 = ax;
            let _e887 = dv;
            let _e889 = i_11;
            let _e891 = V[_e889];
            let _e894 = dv;
            let _e896 = i_11;
            let _e898 = V[_e896];
            N3_[_e885] = ((_e887.y * _e891.x) - (_e894.x * _e898.y));
            let _e902 = N3_;
            N3_ = normalize(_e902);
            let _e904 = p_9;
            let _e905 = N3_;
            dn_1 = dot(_e904, _e905);
            let _e908 = dn_1;
            let _e910 = i_11;
            let _e912 = ES[_e910];
            ek = (abs(_e908) - max(_e912, 0.15f));
            let _e917 = ek;
            let _e918 = (*e);
            if (_e917 < _e918) {
                {
                    let _e920 = (*e);
                    e2_1 = _e920;
                    let _e921 = ek;
                    (*e) = _e921;
                    let _e922 = i_11;
                    let _e924 = EI[_e922];
                    (*lid_2) = _e924;
                }
            } else {
                let _e925 = ek;
                let _e926 = e2_1;
                if (_e925 < _e926) {
                    let _e928 = ek;
                    e2_1 = _e928;
                }
            }
            let _e929 = i_11;
            let _e931 = ES[_e929];
            let _e934 = dn_1;
            let _e936 = (*ridge);
            if ((_e931 < 0f) && (abs(_e934) < _e936.w)) {
                {
                    let _e940 = N3_;
                    let _e941 = dn_1;
                    let _e943 = (_e940 * sign(_e941));
                    let _e944 = dn_1;
                    (*ridge) = vec4<f32>(_e943.x, _e943.y, _e943.z, abs(_e944));
                    let _e950 = i_11;
                    let _e952 = ES[_e950];
                    rh = -(_e952);
                }
            }
        }
        continuing {
            let _e852 = i_11;
            i_11 = (_e852 + 1i);
        }
    }
    let _e955 = rh;
    if (_e955 > 0f) {
        let _e958 = rh;
        let _e961 = (*ridge);
        let _e964 = rh;
        local_63 = (_e958 * max(0f, (1f - (_e961.w / (2f * _e964)))));
    } else {
        local_63 = 0f;
    }
    let _e972 = local_63;
    (*ridge).w = _e972;
    let _e973 = m_6;
    let _e974 = ice_5;
    let _e975 = pieceCover(_e973, _e974);
    (*c_12) = _e975;
    let _e976 = s_7;
    let _e977 = (*id_2);
    let _e978 = (*c_12);
    let _e979 = floeRound(_e976, _e977, _e978);
    rr = _e979;
    let _e981 = e2_1;
    let _e982 = rr;
    if (_e981 < _e982) {
        let _e984 = rr;
        let _e985 = rr;
        let _e986 = (*e);
        let _e988 = rr;
        let _e989 = e2_1;
        (*e) = (_e984 - length(vec2<f32>((_e985 - _e986), (_e988 - _e989))));
    }
    let _e994 = s_7;
    (*size_2) = _e994;
    let _e995 = m_6;
    (*mid) = _e995;
    let _e996 = (*c_12);
    let _e999 = (*id_2);
    let _e1007 = (*c_12);
    (*there) = ((_e996 > 0f) && ((f32((_e999 & 65535u)) / 65536f) <= min(1f, (1.5f * _e1007))));
    return;
}

fn seaFloes(p_10: vec3<f32>, up_2: vec3<f32>, w_6: vec3<f32>, ice_6: f32, cPix: f32, foot_14: f32, frz_2: f32, pDay_2: f32, lead: ptr<function, vec2<f32>>, ridge_1: ptr<function, vec4<f32>>) -> vec4<f32> {
    var p_11: vec3<f32>;
    var up_3: vec3<f32>;
    var w_7: vec3<f32>;
    var ice_7: f32;
    var cPix_1: f32;
    var foot_15: f32;
    var frz_3: f32;
    var pDay_3: f32;
    var leadFar: vec2<f32>;
    var id_3: u32;
    var lid_3: u32;
    var e_1: f32;
    var c_13: f32;
    var size_3: f32;
    var mid_1: vec3<f32>;
    var there_1: bool;
    var fw: f32;
    var x_3: f32 = 0f;
    var rim: f32 = 0f;
    var age_2: f32;
    var kFar: f32;

    p_11 = p_10;
    up_3 = up_2;
    w_7 = w_6;
    ice_7 = ice_6;
    cPix_1 = cPix;
    foot_15 = foot_14;
    frz_3 = frz_2;
    pDay_3 = pDay_2;
    let _e186 = frz_3;
    let _e187 = pDay_3;
    let _e188 = leadIce(32768u, _e186, _e187);
    leadFar = _e188;
    (*lead) = vec2(0f);
    (*ridge_1) = vec4(0f);
    let _e194 = cPix_1;
    let _e197 = ice_7;
    if ((_e194 <= 0f) && (_e197 <= 0f)) {
        return vec4(0f);
    }
    let _e203 = foot_15;
    if (_e203 >= 64f) {
        {
            let _e206 = leadFar;
            (*lead) = _e206;
            let _e207 = cPix_1;
            let _e210 = cPix_1;
            return vec4<f32>(_e207, 0f, 0.7f, _e210);
        }
    }
    let _e219 = p_11;
    let _e220 = ice_7;
    floeOf(_e219, _e220, (&id_3), (&e_1), (&lid_3), (&c_13), (&size_3), (&mid_1), (&there_1), ridge_1);
    let _e237 = there_1;
    if !(_e237) {
        (*ridge_1) = vec4(0f);
    }
    let _e241 = e_1;
    let _e242 = p_11;
    let _e243 = w_7;
    let _e245 = tri(_e242, _e243, 8f);
    let _e251 = p_11;
    let _e252 = w_7;
    let _e254 = tri(_e251, _e252, 2f);
    e_1 = (_e241 + (((_e245.x - 0.5f) * 1.6f) + ((_e254.w - 0.5f) * 0.5f)));
    let _e262 = foot_15;
    fw = max(_e262, 0.03f);
    let _e274 = size_3;
    let _e280 = id_3;
    age_2 = ((0.3f + (0.7f * smoothstep(16f, 200f, _e274))) * (0.6f + ((0.4f * f32((_e280 >> 16u))) / 65536f)));
    let _e290 = there_1;
    if _e290 {
        {
            let _e291 = e_1;
            let _e292 = fw;
            x_3 = clamp(((_e291 / _e292) + 0.5f), 0f, 1f);
            let _e302 = fw;
            let _e304 = e_1;
            rim = (1f - smoothstep(0f, (0.8f + _e302), _e304));
            let _e307 = lid_3;
            let _e308 = frz_3;
            let _e309 = pDay_3;
            let _e310 = leadIce(_e307, _e308, _e309);
            (*lead) = _e310;
        }
    }
    let _e313 = foot_15;
    kFar = smoothstep(16f, 64f, _e313);
    let _e316 = x_3;
    let _e317 = cPix_1;
    let _e318 = kFar;
    x_3 = mix(_e316, _e317, _e318);
    let _e320 = (*lead);
    let _e321 = leadFar;
    let _e322 = kFar;
    (*lead) = mix(_e320, _e321, vec2(_e322));
    let _e326 = (*ridge_1);
    let _e329 = kFar;
    (*ridge_1).w = (_e326.w * (1f - _e329));
    let _e332 = x_3;
    let _e333 = rim;
    let _e334 = x_3;
    let _e337 = kFar;
    let _e340 = age_2;
    let _e342 = kFar;
    let _e344 = c_13;
    let _e345 = cPix_1;
    let _e346 = kFar;
    return vec4<f32>(_e332, ((_e333 * _e334) * (1f - _e337)), mix(_e340, 0.7f, _e342), mix(_e344, _e345, _e346));
}

fn main_1() {
    var foot_16: f32;
    var dpx: vec3<f32>;
    var dpy: vec3<f32>;
    var albedo: vec3<f32>;
    var waterEnc: f32;
    var dn_2: f32;
    var veg: f32;
    var snow: f32;
    var rock: f32;
    var sand: f32;
    var emissive: f32;
    var wet: f32;
    var rough_1: f32;
    var rel_2: vec3<f32>;
    var r_10: f32;
    var up_4: vec3<f32>;
    var dist_1: f32;
    var N_2: vec3<f32>;
    var muS_2: f32;
    var sunT: vec3<f32>;
    var skyE_1: vec3<f32>;
    var cloudT: f32;
    var pF_2: vec3<f32>;
    var sunTop: vec3<f32>;
    var keySh: f32;
    var fp_6: vec3<f32>;
    var fn_: vec3<f32>;
    var w_8: vec3<f32>;
    var fineK: f32;
    var midK: f32;
    var farK: f32;
    var local_64: f32;
    var isWater: f32;
    var gRough: f32 = 0.8f;
    var gAO: f32 = 1f;
    var ndl_1: f32;
    var color: vec3<f32>;
    var dbgW: vec3<f32> = vec3(-1f);
    var V_1: vec3<f32>;
    var upF_7: vec3<f32>;
    var local_65: vec3<f32>;
    var lq: vec3<f32>;
    var kind_4: f32;
    var Tm_2: f32;
    var river_3: bool;
    var local_66: f32;
    var flow_4: f32;
    var local_67: f32;
    var local_68: f32;
    var local_69: f32;
    var fetch_2: f32;
    var depthW: f32;
    var nW: vec4<f32>;
    var nG: vec4<f32>;
    var wn_2: vec2<f32>;
    var grp_4: vec4<f32>;
    var nF_1: vec3<f32>;
    var wr: f32;
    var foam_1: f32;
    var fv_2: f32;
    var tsf: vec2<f32>;
    var ice_8: f32;
    var local_70: f32;
    var iceC: f32;
    var local_71: f32;
    var pDay_4: f32;
    var lead_1: vec2<f32> = vec2(0f);
    var local_72: f32;
    var Tair_2: f32;
    var ridge_2: vec4<f32> = vec4(0f);
    var local_73: vec4<f32>;
    var fl: vec4<f32>;
    var calm: f32;
    var Nw: vec3<f32>;
    var NdV: f32;
    var ndlW: f32;
    var F0_: f32;
    var F: f32;
    var R_3: vec3<f32>;
    var el: f32;
    var skyG: f32;
    var skyRefl: vec3<f32>;
    var muMr: f32;
    var body: vec3<f32>;
    var ssc: f32;
    var a_9: vec3<f32>;
    var bb: vec3<f32>;
    var H_1: vec3<f32>;
    var a2_: f32;
    var a2s: f32;
    var NdH: f32;
    var VdH: f32;
    var Dg: f32;
    var kg: f32;
    var Gg: f32;
    var Fs: f32;
    var muMn: f32;
    var Hm: vec3<f32>;
    var NdHm: f32;
    var VdHm: f32;
    var ndlM: f32;
    var Dm: f32;
    var Gm: f32;
    var Fm: f32;
    var lit_1: vec3<f32>;
    var local_74: f32;
    var fallK: f32;
    var dbgWhite: f32 = 0f;
    var dn_3: vec3<f32>;
    var down: vec3<f32>;
    var acr: vec3<f32>;
    var local_75: f32;
    var zf: f32;
    var v_1: f32;
    var t1_: f32;
    var t2_: f32;
    var wa_2: f32;
    var L_7: f32;
    var local_76: vec3<f32>;
    var pS: vec3<f32>;
    var q_5: vec2<f32>;
    var dv_1: f32;
    var qA: vec2<f32>;
    var qB: vec2<f32>;
    var bA: f32;
    var bB: f32;
    var sA: f32;
    var sB: f32;
    var st_2: f32;
    var gS: f32;
    var edge: f32 = 1f;
    var qU: f32;
    var br: f32;
    var aer: f32;
    var th_2: f32;
    var jets: f32;
    var white: f32;
    var nS: vec3<f32>;
    var litS: vec3<f32>;
    var albS: f32;
    var Lf: vec3<f32>;
    var hasA: f32;
    var al_2: f32;
    var dF: f32;
    var flL: f32;
    var local_77: vec3<f32>;
    var fd_1: vec3<f32>;
    var fa_1: vec3<f32>;
    var q2_: vec2<f32>;
    var fz: f32;
    var core: f32;
    var ring: f32;
    var fm: f32;
    var dI: vec4<f32>;
    var dJ: vec4<f32>;
    var lIce: f32;
    var lAlb: vec3<f32>;
    var local_78: f32;
    var thaw: f32;
    var snowy: f32;
    var iceAlb: vec3<f32>;
    var local_79: f32;
    var pond_1: f32;
    var N2_: vec3<f32>;
    var blk: f32;
    var iceCol: vec3<f32>;
    var NdH2_: f32;
    var iceF: f32;
    var dnI: vec3<f32>;
    var downI: vec3<f32>;
    var acrI: vec3<f32>;
    var local_80: vec3<f32>;
    var pI: vec3<f32>;
    var qi: vec2<f32>;
    var qa_1: vec2<f32>;
    var qb_1: vec2<f32>;
    var cols: f32;
    var colsX: f32;
    var thick: f32;
    var alb: vec3<f32>;
    var nI: vec3<f32>;
    var litI: vec3<f32>;
    var spI: f32;
    var local_81: f32;
    var local_82: vec3<f32>;
    var local_83: vec3<f32>;
    var local_84: vec3<f32>;
    var local_85: vec3<f32>;
    var local_86: vec3<f32>;
    var a_10: vec3<f32>;
    var flick: f32;
    var crust: f32;
    var local_87: vec3<f32>;
    var local_88: f32;

    let _e167 = vWorldPos_1;
    let _e168 = fwidth(_e167);
    foot_16 = length(_e168);
    let _e171 = vFixedPos_1;
    let _e172 = dpdx(_e171);
    dpx = _e172;
    let _e174 = vFixedPos_1;
    let _e175 = dpdy(_e174);
    dpy = _e175;
    let _e177 = vCol_1;
    let _e179 = vCol_1;
    albedo = (_e177.xyz * _e179.xyz);
    let _e183 = vCol_1;
    waterEnc = _e183.w;
    let _e186 = global.uNear;
    if (_e186.x > 0.5f) {
        {
            let _e190 = vNearRel_1;
            let _e191 = global.uNearUp;
            let _e192 = vNearRel_1;
            let _e193 = global.uNearUp;
            dn_2 = length((_e190 - (_e191 * dot(_e192, _e193))));
            let _e199 = global.uNearMode;
            if (_e199 < 0.5f) {
                {
                    let _e202 = dn_2;
                    let _e204 = global.uNear;
                    let _e208 = vShore_1;
                    if ((_e202 < (0.97f * _e204.y)) && (_e208 <= 0f)) {
                        discard;
                    }
                }
            } else {
                let _e212 = dn_2;
                let _e213 = global.uNearBand;
                let _e216 = dn_2;
                let _e217 = global.uNearBand;
                if ((_e212 < _e213.x) || (_e216 > _e217.y)) {
                    discard;
                }
            }
        }
    }
    let _e221 = vMat_1;
    veg = _e221.x;
    let _e224 = vMat_1;
    snow = _e224.y;
    let _e227 = vMat_1;
    rock = _e227.z;
    let _e230 = vMat_1;
    sand = _e230.w;
    let _e233 = vExt_1;
    emissive = _e233.x;
    let _e236 = vExt_1;
    wet = _e236.y;
    let _e239 = vExt_1;
    rough_1 = _e239.z;
    let _e242 = vWorldPos_1;
    let _e243 = global.uCenter;
    rel_2 = (_e242 - _e243);
    let _e246 = rel_2;
    r_10 = length(_e246);
    let _e249 = rel_2;
    let _e250 = r_10;
    up_4 = (_e249 / vec3(_e250));
    let _e254 = vWorldPos_1;
    dist_1 = length(_e254);
    let _e257 = vNormal_1;
    N_2 = normalize(_e257);
    let _e260 = up_4;
    let _e261 = global.uSunDir;
    muS_2 = dot(_e260, _e261);
    let _e264 = r_10;
    let _e265 = muS_2;
    let _e266 = atmoSunTransmittance(_e264, _e265);
    sunT = _e266;
    let _e268 = r_10;
    let _e269 = muS_2;
    let _e270 = atmoSkyIrradiance(_e268, _e269);
    skyE_1 = _e270;
    let _e272 = rel_2;
    let _e273 = r_10;
    let _e274 = muS_2;
    let _e275 = foot_16;
    let _e276 = sunT;
    let _e279 = cloudLight(_e272, _e273, _e274, _e275, _e276, (&skyE_1));
    cloudT = _e279;
    let _e281 = sunT;
    let _e282 = cloudT;
    sunT = (_e281 * _e282);
    let _e284 = global.uToFixed;
    let _e285 = rel_2;
    pF_2 = (_e284 * _e285);
    let _e288 = sunT;
    let _e289 = pF_2;
    let _e290 = pF_2;
    let _e292 = global.uToFixed;
    let _e293 = global.uSunDir;
    let _e295 = global.uRadius;
    let _e296 = terrainShadow(_e289, normalize(_e290), (_e292 * _e293), _e295);
    sunT = (_e288 * _e296);
    let _e298 = sunT;
    sunTop = _e298;
    let _e300 = vWorldPos_1;
    let _e301 = N_2;
    let _e302 = sunShadowMap(_e300, _e301);
    keySh = _e302;
    let _e304 = sunT;
    let _e305 = keySh;
    sunT = (_e304 * _e305);
    let _e307 = vFixedPos_1;
    fp_6 = _e307;
    let _e309 = vFixedNormal_1;
    fn_ = normalize(_e309);
    let _e312 = fn_;
    w_8 = pow(abs(_e312), vec3(4f));
    let _e318 = w_8;
    let _e319 = w_8;
    let _e321 = w_8;
    let _e324 = w_8;
    w_8 = (_e318 / vec3(((_e319.x + _e321.y) + _e324.z)));
    let _e332 = dist_1;
    fineK = (1f - smoothstep(60f, 900f, _e332));
    let _e339 = dist_1;
    midK = (1f - smoothstep(600f, 9000f, _e339));
    let _e346 = dist_1;
    farK = (1f - smoothstep(6000f, 90000f, _e346));
    let _e350 = vShore_1;
    if (_e350 > 0f) {
        local_64 = 1f;
    } else {
        local_64 = 0f;
    }
    let _e356 = local_64;
    isWater = _e356;
    let _e362 = isWater;
    if (_e362 < 0.5f) {
        discard;
    }
    let _e365 = N_2;
    let _e366 = global.uSunDir;
    ndl_1 = max(dot(_e365, _e366), 0f);
    let _e376 = isWater;
    if (_e376 > 0.5f) {
        {
            let _e379 = vWorldPos_1;
            V_1 = normalize(-(_e379));
            let _e383 = global.uToFixed;
            let _e384 = up_4;
            upF_7 = (_e383 * _e384);
            let _e387 = vLiq_1;
            if (_e387.x > 0.02f) {
                let _e391 = vLiq_1;
                let _e393 = vLiq_1;
                local_65 = (_e391.yzw / vec3(_e393.x));
            } else {
                local_65 = vec3<f32>(0f, 0.75f, 1f);
            }
            let _e402 = local_65;
            lq = _e402;
            let _e404 = lq;
            kind_4 = _e404.x;
            let _e407 = lq;
            Tm_2 = ((_e407.y * 120f) - 60f);
            let _e414 = kind_4;
            let _e417 = kind_4;
            river_3 = ((_e414 > 0.55f) && (_e417 < 0.85f));
            let _e422 = river_3;
            if _e422 {
                let _e423 = lq;
                local_66 = _e423.z;
            } else {
                local_66 = 0f;
            }
            let _e427 = local_66;
            flow_4 = _e427;
            let _e429 = kind_4;
            if (_e429 < 0.2f) {
                local_69 = 1f;
            } else {
                let _e433 = river_3;
                if _e433 {
                    local_68 = 0.2f;
                } else {
                    let _e435 = kind_4;
                    if (_e435 > 0.85f) {
                        local_67 = 0.05f;
                    } else {
                        let _e439 = lq;
                        local_67 = _e439.z;
                    }
                    let _e442 = local_67;
                    local_68 = _e442;
                }
                let _e444 = local_68;
                local_69 = _e444;
            }
            let _e446 = local_69;
            fetch_2 = _e446;
            let _e448 = vShore_1;
            let _e449 = vShore_1;
            depthW = ((_e448 * _e449) * 64f);
            let _e454 = fp_6;
            let _e455 = w_8;
            let _e457 = tri(_e454, _e455, 512f);
            nW = _e457;
            let _e459 = fp_6;
            let _e460 = w_8;
            let _e462 = tri(_e459, _e460, 64f);
            nG = _e462;
            let _e464 = nW;
            let _e468 = nW;
            wn_2 = (vec2<f32>((_e464.x - 0.5f), (_e468.w - 0.5f)) * 2f);
            let _e476 = nG;
            let _e478 = nG;
            let _e480 = nW;
            let _e482 = nW;
            grp_4 = clamp(((vec4<f32>(_e476.x, _e478.w, _e480.w, _e482.x) * 1.6f) - vec4(0.3f)), vec4(0f), vec4(1f));
            let _e499 = vFlw_1;
            fv_2 = (max(_e499.w, 0f) * 9f);
            let _e506 = fp_6;
            let _e507 = fn_;
            let _e508 = upF_7;
            let _e509 = kind_4;
            let _e510 = flow_4;
            let _e511 = fetch_2;
            let _e512 = depthW;
            let _e513 = foot_16;
            let _e514 = wn_2;
            let _e515 = grp_4;
            let _e516 = vFlw_1;
            let _e518 = fv_2;
            liquidSurface(_e506, _e507, _e508, _e509, _e510, _e511, _e512, _e513, _e514, _e515, _e516.xyz, _e518, (&nF_1), (&wr), (&foam_1));
            let _e525 = Tm_2;
            let _e526 = kind_4;
            let _e527 = flow_4;
            let _e528 = upF_7;
            let _e529 = liquidTs(_e525, _e526, _e527, _e528);
            tsf = _e529;
            let _e532 = tsf;
            let _e536 = tsf;
            let _e540 = tsf;
            ice_8 = (1f - smoothstep((_e532.y - 4f), (_e536.y + 4f), _e540.x));
            let _e545 = kind_4;
            let _e548 = ice_8;
            if ((_e545 < 0.2f) && (_e548 > 0f)) {
                let _e552 = ice_8;
                let _e553 = nW;
                let _e555 = nG;
                let _e557 = seaIceCover(_e552, _e553.w, _e555.x);
                local_70 = _e557;
            } else {
                local_70 = 0f;
            }
            let _e560 = local_70;
            iceC = _e560;
            let _e562 = global.uSeason;
            if (_e562.z > 0.5f) {
                let _e567 = upF_7;
                let _e568 = seasonYear(_e567);
                let _e572 = global.uSeason;
                local_71 = (((12f * _e568.z) * DDF_SNOW) / max(_e572.y, 1f));
            } else {
                local_71 = 0f;
            }
            let _e579 = local_71;
            pDay_4 = _e579;
            let _e584 = global.uSeason;
            if (_e584.z > 0.5f) {
                let _e588 = Tm_2;
                let _e589 = upF_7;
                let _e590 = seasonIceNow(_e589);
                local_72 = (_e588 + _e590);
            } else {
                let _e592 = tsf;
                local_72 = _e592.x;
            }
            let _e595 = local_72;
            Tair_2 = _e595;
            let _e600 = kind_4;
            if (_e600 < 0.2f) {
                let _e603 = pF_2;
                let _e604 = upF_7;
                let _e605 = w_8;
                let _e606 = ice_8;
                let _e607 = iceC;
                let _e608 = foot_16;
                let _e609 = tsf;
                let _e611 = Tair_2;
                let _e615 = pDay_4;
                let _e620 = seaFloes(_e603, _e604, _e605, _e606, _e607, _e608, max((_e609.y - _e611), 0f), _e615, (&lead_1), (&ridge_2));
                local_73 = _e620;
            } else {
                let _e621 = ice_8;
                local_73 = vec4<f32>(_e621, 0f, 1f, 0f);
            }
            let _e627 = local_73;
            fl = _e627;
            let _e631 = iceC;
            let _e632 = fl;
            calm = smoothstep(0.05f, 0.6f, max(_e631, _e632.w));
            let _e637 = nF_1;
            let _e638 = upF_7;
            let _e640 = calm;
            nF_1 = normalize(mix(_e637, _e638, vec3((0.9f * _e640))));
            let _e645 = wr;
            let _e648 = calm;
            wr = (_e645 * (1f - (0.8f * _e648)));
            let _e652 = foam_1;
            let _e654 = calm;
            foam_1 = (_e652 * (1f - _e654));
            let _e657 = river_3;
            if _e657 {
                let _e658 = nF_1;
                let _e659 = fn_;
                let _e663 = fn_;
                let _e664 = upF_7;
                nF_1 = normalize(mix(_e658, _e659, vec3(smoothstep(0.13f, 0.3f, (1f - dot(_e663, _e664))))));
            }
            let _e671 = river_3;
            let _e672 = global.uLiquid2_;
            if (_e671 && (_e672.y > 0.9f)) {
                let _e677 = albedo;
                let _e684 = fv_2;
                albedo = mix(_e677, vec3<f32>(0.055f, 0.045f, 0.025f), vec3(clamp((0.25f + (0.3f * _e684)), 0f, 0.75f)));
            }
            let _e692 = global.uToFixed;
            let _e694 = nF_1;
            Nw = normalize((transpose(_e692) * _e694));
            let _e698 = Nw;
            let _e699 = V_1;
            let _e702 = Nw;
            let _e703 = V_1;
            Nw = normalize((_e698 + (_e699 * max(0f, (0.02f - dot(_e702, _e703))))));
            let _e710 = Nw;
            let _e711 = V_1;
            NdV = max(dot(_e710, _e711), 0.001f);
            let _e716 = Nw;
            let _e717 = global.uSunDir;
            ndlW = max(dot(_e716, _e717), 0f);
            let _e722 = global.uLiquid;
            F0_ = _e722.x;
            let _e725 = F0_;
            let _e727 = wr;
            let _e729 = F0_;
            let _e731 = F0_;
            let _e734 = NdV;
            F = (_e725 + ((max((1f - _e727), _e729) - _e731) * pow((1f - _e734), 5f)));
            let _e741 = V_1;
            let _e743 = Nw;
            R_3 = reflect(-(_e741), _e743);
            let _e746 = R_3;
            let _e747 = up_4;
            el = max(dot(_e746, _e747), 0f);
            let _e755 = el;
            let _e764 = el;
            let _e769 = cloudT;
            skyG = mix((0.7f + (1.1f * pow((1f - _e755), 3f))), (0.4286f * (1f + (2f * _e764))), clamp((1f - _e769), 0f, 1f));
            let _e776 = global.uSunE;
            let _e777 = skyE_1;
            let _e782 = skyG;
            let _e784 = global.uSunE;
            let _e785 = sunT;
            let _e789 = R_3;
            let _e790 = global.uSunDir;
            skyRefl = ((((_e776 * _e777) / vec3(3.1415927f)) * _e782) + (((_e784 * _e785) * 0.05f) * pow(max(dot(_e789, _e790), 0f), 12f)));
            let _e799 = global.uMoonE;
            if (_e799.y > 0f) {
                {
                    let _e803 = up_4;
                    let _e804 = global.uMoonDir;
                    muMr = dot(_e803, _e804);
                    let _e807 = skyRefl;
                    let _e808 = global.uMoonE;
                    let _e809 = r_10;
                    let _e810 = muMr;
                    let _e811 = atmoSkyIrradiance(_e809, _e810);
                    let _e816 = skyG;
                    let _e818 = global.uMoonE;
                    let _e819 = r_10;
                    let _e820 = muMr;
                    let _e823 = atmoSunTransmittance(_e819, max(_e820, 0f));
                    let _e827 = R_3;
                    let _e828 = global.uMoonDir;
                    skyRefl = (_e807 + ((((_e808 * _e811) / vec3(3.1415927f)) * _e816) + (((_e818 * _e823) * 0.05f) * pow(max(dot(_e827, _e828), 0f), 12f))));
                }
            }
            let _e837 = albedo;
            let _e841 = global.uSunE;
            let _e842 = sunT;
            let _e844 = muS_2;
            let _e850 = global.uSunE;
            let _e851 = skyE_1;
            body = ((_e837 / vec3(3.1415927f)) * ((((_e841 * _e842) * max(_e844, 0f)) * 0.6f) + ((_e850 * _e851) * 0.5f)));
            let _e858 = river_3;
            let _e859 = global.uLiquid2_;
            if (_e858 && (_e859.y > 0.9f)) {
                {
                    let _e865 = fv_2;
                    let _e867 = fv_2;
                    let _e869 = fv_2;
                    ssc = clamp((((30f * _e865) * _e867) * _e869), 0.5f, 3000f);
                    let _e875 = global.uLiquid3_;
                    let _e877 = ssc;
                    let _e884 = global.uLiquid3_;
                    a_9 = ((_e875.xyz + (_e877 * vec3<f32>(0.012f, 0.02f, 0.035f))) + (_e884.w * vec3<f32>(0.078f, 0.207f, 0.687f)));
                    let _e896 = ssc;
                    bb = vec3((0.00475f * _e896));
                    let _e901 = bb;
                    let _e903 = a_9;
                    let _e904 = bb;
                    let _e910 = global.uSunE;
                    let _e911 = sunT;
                    let _e913 = muS_2;
                    let _e917 = global.uSunE;
                    let _e918 = skyE_1;
                    body = ((((0.33f * _e901) / (_e903 + _e904)) / vec3(3.1415927f)) * (((_e910 * _e911) * max(_e913, 0f)) + (_e917 * _e918)));
                }
            }
            let _e922 = V_1;
            let _e923 = global.uSunDir;
            H_1 = normalize((_e922 + _e923));
            let _e927 = wr;
            let _e928 = wr;
            let _e930 = wr;
            let _e932 = wr;
            a2_ = (((_e927 * _e928) * _e930) * _e932);
            let _e935 = a2_;
            a2s = max(_e935, 0.0000001f);
            let _e939 = Nw;
            let _e940 = H_1;
            NdH = max(dot(_e939, _e940), 0f);
            let _e945 = V_1;
            let _e946 = H_1;
            VdH = max(dot(_e945, _e946), 0f);
            let _e951 = a2s;
            let _e952 = NdH;
            let _e953 = NdH;
            let _e955 = a2s;
            Dg = (_e951 / (PI * pow((((_e952 * _e953) * (_e955 - 1f)) + 1f), 2f)));
            let _e966 = wr;
            let _e969 = wr;
            kg = (((_e966 + 1f) * (_e969 + 1f)) / 8f);
            let _e976 = NdV;
            let _e977 = NdV;
            let _e979 = kg;
            let _e982 = kg;
            let _e985 = ndlW;
            let _e987 = ndlW;
            let _e989 = kg;
            let _e992 = kg;
            Gg = (((_e976 / ((_e977 * (1f - _e979)) + _e982)) * _e985) / ((_e987 * (1f - _e989)) + _e992));
            let _e996 = F0_;
            let _e998 = F0_;
            let _e1001 = VdH;
            Fs = (_e996 + ((1f - _e998) * pow((1f - _e1001), 5f)));
            let _e1008 = body;
            let _e1010 = F;
            let _e1013 = skyRefl;
            let _e1014 = F;
            let _e1017 = global.uSunE;
            let _e1018 = sunT;
            let _e1020 = Dg;
            let _e1022 = Gg;
            let _e1024 = Fs;
            let _e1027 = NdV;
            let _e1032 = muS_2;
            color = (((_e1008 * (1f - _e1010)) + (_e1013 * _e1014)) + ((((((_e1017 * _e1018) * _e1020) * _e1022) * _e1024) / vec3((4f * _e1027))) * step(0f, _e1032)));
            let _e1036 = global.uMoonE;
            if (_e1036.y > 0f) {
                {
                    let _e1040 = up_4;
                    let _e1041 = global.uMoonDir;
                    muMn = dot(_e1040, _e1041);
                    let _e1044 = muMn;
                    if (_e1044 > -0.02f) {
                        {
                            let _e1048 = V_1;
                            let _e1049 = global.uMoonDir;
                            Hm = normalize((_e1048 + _e1049));
                            let _e1053 = Nw;
                            let _e1054 = Hm;
                            NdHm = max(dot(_e1053, _e1054), 0f);
                            let _e1059 = V_1;
                            let _e1060 = Hm;
                            VdHm = max(dot(_e1059, _e1060), 0f);
                            let _e1065 = Nw;
                            let _e1066 = global.uMoonDir;
                            ndlM = max(dot(_e1065, _e1066), 0f);
                            let _e1071 = a2s;
                            let _e1072 = NdHm;
                            let _e1073 = NdHm;
                            let _e1075 = a2s;
                            Dm = (_e1071 / (PI * pow((((_e1072 * _e1073) * (_e1075 - 1f)) + 1f), 2f)));
                            let _e1086 = NdV;
                            let _e1087 = NdV;
                            let _e1089 = kg;
                            let _e1092 = kg;
                            let _e1095 = ndlM;
                            let _e1097 = ndlM;
                            let _e1099 = kg;
                            let _e1102 = kg;
                            Gm = (((_e1086 / ((_e1087 * (1f - _e1089)) + _e1092)) * _e1095) / ((_e1097 * (1f - _e1099)) + _e1102));
                            let _e1106 = F0_;
                            let _e1108 = F0_;
                            let _e1111 = VdHm;
                            Fm = (_e1106 + ((1f - _e1108) * pow((1f - _e1111), 5f)));
                            let _e1118 = color;
                            let _e1119 = global.uMoonE;
                            let _e1120 = r_10;
                            let _e1121 = muMn;
                            let _e1124 = atmoSunTransmittance(_e1120, max(_e1121, 0f));
                            let _e1126 = cloudDirZ;
                            let _e1128 = Dm;
                            let _e1130 = Gm;
                            let _e1132 = Fm;
                            let _e1135 = NdV;
                            color = (_e1118 + ((((((_e1119 * _e1124) * _e1126) * _e1128) * _e1130) * _e1132) / vec3((4f * _e1135))));
                        }
                    }
                }
            }
            let _e1140 = global.uSunE;
            let _e1141 = sunT;
            let _e1143 = up_4;
            let _e1144 = global.uSunDir;
            let _e1149 = global.uSunE;
            let _e1150 = skyE_1;
            lit_1 = (((_e1140 * _e1141) * max(dot(_e1143, _e1144), 0f)) + (_e1149 * _e1150));
            let _e1154 = river_3;
            if _e1154 {
                let _e1158 = fn_;
                let _e1159 = upF_7;
                local_74 = smoothstep(0.13f, 0.3f, (1f - dot(_e1158, _e1159)));
            } else {
                local_74 = 0f;
            }
            let _e1165 = local_74;
            fallK = _e1165;
            let _e1169 = fallK;
            if (_e1169 > 0f) {
                {
                    let _e1172 = upF_7;
                    let _e1173 = fn_;
                    let _e1174 = upF_7;
                    let _e1175 = fn_;
                    dn_3 = (_e1172 - (_e1173 * dot(_e1174, _e1175)));
                    let _e1180 = dn_3;
                    let _e1182 = dn_3;
                    down = (-(_e1180) / vec3(max(length(_e1182), 0.0001f)));
                    let _e1189 = fn_;
                    let _e1190 = down;
                    acr = normalize(cross(_e1189, _e1190));
                    let _e1194 = global.uFallTop;
                    if (_e1194 > 0f) {
                        let _e1197 = global.uFallTop;
                        let _e1198 = r_10;
                        local_75 = max((_e1197 - _e1198), 0f);
                    } else {
                        local_75 = 4f;
                    }
                    let _e1204 = local_75;
                    zf = _e1204;
                    let _e1207 = global.uFall1_;
                    let _e1210 = zf;
                    let _e1215 = global.uFall1_;
                    v_1 = min((sqrt(((2f * _e1207.x) * _e1210)) + 0.3f), _e1215.y);
                    let _e1219 = global.uTime;
                    t1_ = fract((_e1219 * 0.4f));
                    let _e1224 = global.uTime;
                    t2_ = fract(((_e1224 * 0.4f) + 0.5f));
                    let _e1233 = t1_;
                    wa_2 = (1f - abs(((2f * _e1233) - 1f)));
                    let _e1242 = v_1;
                    L_7 = (1f + (0.12f * _e1242));
                    let _e1246 = vFixedPos_1;
                    let _e1247 = global.uOriginMod;
                    let _e1249 = global.uFallTop;
                    if (_e1249 > 0f) {
                        let _e1252 = global.uFallFoot;
                        local_76 = _e1252;
                    } else {
                        local_76 = vec3(0f);
                    }
                    let _e1256 = local_76;
                    pS = ((_e1246 - _e1247) - _e1256);
                    let _e1259 = pS;
                    let _e1260 = acr;
                    let _e1264 = pS;
                    let _e1265 = down;
                    let _e1268 = L_7;
                    q_5 = vec2<f32>((dot(_e1259, _e1260) / 4.8f), (dot(_e1264, _e1265) / (48f * _e1268)));
                    let _e1273 = v_1;
                    let _e1277 = L_7;
                    dv_1 = ((_e1273 * 2.5f) / (48f * _e1277));
                    let _e1281 = q_5;
                    let _e1283 = dv_1;
                    let _e1284 = t1_;
                    qA = (_e1281 - vec2<f32>(0f, (_e1283 * _e1284)));
                    let _e1289 = q_5;
                    let _e1295 = dv_1;
                    let _e1296 = t2_;
                    qB = ((_e1289 + vec2<f32>(0.37f, 0f)) - vec2<f32>(0f, (_e1295 * _e1296)));
                    let _e1301 = qA;
                    let _e1303 = textureSampleLevel(tDetailTexture, tDetailSampler, _e1301, 0f);
                    bA = _e1303.x;
                    let _e1306 = qB;
                    let _e1308 = textureSampleLevel(tDetailTexture, tDetailSampler, _e1306, 0f);
                    bB = _e1308.x;
                    let _e1311 = bA;
                    let _e1313 = q_5;
                    let _e1324 = dv_1;
                    let _e1326 = t1_;
                    let _e1331 = textureSampleLevel(tDetailTexture, tDetailSampler, (((_e1313 * vec2<f32>(3f, 2f)) + vec2<f32>(0.53f, 0f)) - vec2<f32>(0f, ((2f * _e1324) * _e1326))), 0f);
                    sA = (_e1311 + (0.45f * _e1331.x));
                    let _e1336 = bB;
                    let _e1338 = q_5;
                    let _e1349 = dv_1;
                    let _e1351 = t2_;
                    let _e1356 = textureSampleLevel(tDetailTexture, tDetailSampler, (((_e1338 * vec2<f32>(3f, 2f)) + vec2<f32>(0.11f, 0f)) - vec2<f32>(0f, ((2f * _e1349) * _e1351))), 0f);
                    sB = (_e1336 + (0.45f * _e1356.x));
                    let _e1362 = sB;
                    let _e1363 = sA;
                    let _e1364 = wa_2;
                    st_2 = clamp((0.5f + ((mix(_e1362, _e1363, _e1364) - 0.725f) * 2.2f)), 0f, 1f);
                    let _e1375 = qB;
                    let _e1381 = textureSampleLevel(tDetailTexture, tDetailSampler, (_e1375 + vec2<f32>(0.031f, 0f)), 0f);
                    let _e1383 = bB;
                    let _e1385 = qA;
                    let _e1391 = textureSampleLevel(tDetailTexture, tDetailSampler, (_e1385 + vec2<f32>(0.031f, 0f)), 0f);
                    let _e1393 = bA;
                    let _e1395 = wa_2;
                    gS = (mix((_e1381.x - _e1383), (_e1391.x - _e1393), _e1395) / 0.15f);
                    let _e1402 = vFlw_1;
                    qU = max((_e1402.w * 9f), 0.3f);
                    let _e1409 = zf;
                    let _e1411 = qU;
                    br = clamp((_e1409 / (6f * pow(_e1411, 0.32f))), 0f, 1f);
                    let _e1422 = global.uFall2_;
                    let _e1427 = zf;
                    aer = (mix(0.25f, 0.95f, _e1422.y) * smoothstep(0f, 0.5f, _e1427));
                    let _e1433 = br;
                    th_2 = mix(0.72f, 0.22f, _e1433);
                    let _e1436 = th_2;
                    let _e1439 = th_2;
                    let _e1442 = st_2;
                    let _e1444 = edge;
                    jets = smoothstep((_e1436 - 0.14f), (_e1439 + 0.14f), (_e1442 + (0.75f * (_e1444 - 1f))));
                    let _e1451 = aer;
                    let _e1452 = jets;
                    white = clamp((_e1451 * _e1452), 0f, 1f);
                    let _e1458 = white;
                    dbgWhite = _e1458;
                    let _e1459 = Nw;
                    let _e1460 = global.uToFixed;
                    let _e1462 = acr;
                    let _e1464 = gS;
                    nS = normalize((_e1459 + ((transpose(_e1460) * _e1462) * clamp((_e1464 * 1.6f), -0.9f, 0.9f))));
                    let _e1475 = global.uSunE;
                    let _e1476 = sunT;
                    let _e1478 = nS;
                    let _e1479 = global.uSunDir;
                    let _e1484 = global.uSunE;
                    let _e1485 = skyE_1;
                    litS = (((_e1475 * _e1476) * max(dot(_e1478, _e1479), 0f)) + ((_e1484 * _e1485) * 0.6f));
                    let _e1495 = st_2;
                    albS = mix(0.5f, 0.92f, smoothstep(0.15f, 0.85f, _e1495));
                    let _e1499 = color;
                    let _e1500 = color;
                    let _e1503 = albS;
                    let _e1508 = litS;
                    let _e1510 = white;
                    let _e1513 = fallK;
                    color = mix(_e1499, mix((_e1500 * 0.8f), ((vec3(_e1503) / vec3(3.1415927f)) * _e1508), vec3(_e1510)), vec3(_e1513));
                    let _e1516 = foam_1;
                    let _e1518 = fallK;
                    foam_1 = (_e1516 * (1f - _e1518));
                }
            }
            let _e1521 = global.uFallTop;
            if (_e1521 > 0f) {
                {
                    let _e1524 = vFixedPos_1;
                    let _e1525 = global.uOriginMod;
                    let _e1527 = global.uFallFoot;
                    Lf = ((_e1524 - _e1525) - _e1527);
                    let _e1531 = global.uFallAcr;
                    let _e1532 = global.uFallAcr;
                    hasA = step(0.5f, dot(_e1531, _e1532));
                    let _e1536 = Lf;
                    let _e1537 = global.uFallAcr;
                    let _e1541 = global.uFallW;
                    let _e1544 = global.uFallW;
                    let _e1547 = hasA;
                    al_2 = (clamp(dot(_e1536, _e1537), (-0.5f * _e1541), (0.5f * _e1544)) * _e1547);
                    let _e1550 = Lf;
                    let _e1551 = global.uFallAcr;
                    let _e1552 = al_2;
                    let _e1556 = global.uFallW;
                    let _e1565 = global.uFallW;
                    let _e1568 = hasA;
                    dF = (length((_e1550 - (_e1551 * _e1552))) / mix(max(((_e1556 * 1.2f) + 2f), 2f), (3f + (0.15f * _e1565)), _e1568));
                    let _e1572 = vFlw_1;
                    flL = length(_e1572.xyz);
                    let _e1576 = flL;
                    if (_e1576 > 0.0001f) {
                        let _e1579 = vFlw_1;
                        let _e1581 = flL;
                        local_77 = (_e1579.xyz / vec3(_e1581));
                    } else {
                        let _e1584 = upF_7;
                        local_77 = normalize((cross(_e1584, vec3<f32>(0f, 0f, 1f)) + vec3<f32>(0.0001f, 0f, 0f)));
                    }
                    let _e1597 = local_77;
                    fd_1 = _e1597;
                    let _e1599 = upF_7;
                    let _e1600 = fd_1;
                    fa_1 = normalize(cross(_e1599, _e1600));
                    let _e1604 = Lf;
                    let _e1605 = fa_1;
                    let _e1607 = Lf;
                    let _e1608 = fd_1;
                    let _e1610 = global.uTime;
                    let _e1611 = flL;
                    q2_ = (vec2<f32>(dot(_e1604, _e1605), (dot(_e1607, _e1608) - (_e1610 * max((_e1611 * 9f), 0.4f)))) * 0.18f);
                    let _e1622 = q2_;
                    let _e1624 = textureSampleLevel(tDetailTexture, tDetailSampler, _e1622, 0f);
                    let _e1628 = q2_;
                    let _e1635 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e1628 * 2.7f) + vec2(0.31f)), 0f);
                    fz = ((_e1624.x * 0.65f) + (_e1635.w * 0.35f));
                    let _e1644 = dF;
                    core = (1f - smoothstep(0.05f, 0.45f, _e1644));
                    let _e1651 = dF;
                    ring = (1f - smoothstep(0.2f, 1f, _e1651));
                    let _e1655 = core;
                    let _e1658 = ring;
                    let _e1661 = ring;
                    let _e1665 = fz;
                    fm = max((_e1655 * 0.9f), (_e1658 * smoothstep((0.55f - (0.3f * _e1661)), 0.8f, _e1665)));
                    let _e1670 = foam_1;
                    let _e1671 = fm;
                    let _e1674 = global.uFall2_;
                    let _e1679 = fallK;
                    foam_1 = max(_e1670, ((_e1671 * mix(0.35f, 0.95f, _e1674.y)) * (1f - _e1679)));
                }
            }
            let _e1683 = color;
            let _e1694 = lit_1;
            let _e1696 = foam_1;
            color = mix(_e1683, (vec3<f32>(0.23873241f, 0.23873241f, 0.23873241f) * _e1694), vec3(clamp(_e1696, 0f, 1f)));
            let _e1702 = ice_8;
            if (_e1702 > 0f) {
                {
                    let _e1705 = nW;
                    dI = _e1705;
                    let _e1707 = nG;
                    dJ = _e1707;
                    let _e1709 = kind_4;
                    if (_e1709 < 0.2f) {
                        {
                            let _e1714 = lead_1;
                            let _e1718 = fl;
                            lIce = (smoothstep(0.3f, 1.5f, _e1714.x) * (1f - _e1718.x));
                            let _e1726 = lead_1;
                            let _e1745 = lead_1;
                            lAlb = mix((vec3((0.07f + (0.33f * (1f - exp((-(_e1726.x) / 10f)))))) * vec3<f32>(0.92f, 0.97f, 1f)), vec3<f32>(0.82f, 0.86f, 0.9f), vec3(_e1745.y));
                            let _e1750 = color;
                            let _e1751 = lAlb;
                            let _e1755 = global.uSunE;
                            let _e1756 = sunT;
                            let _e1758 = muS_2;
                            let _e1762 = global.uSunE;
                            let _e1763 = skyE_1;
                            let _e1767 = lIce;
                            color = mix(_e1750, ((_e1751 / vec3(3.1415927f)) * (((_e1755 * _e1756) * max(_e1758, 0f)) + (_e1762 * _e1763))), vec3(_e1767));
                            let _e1770 = albedo;
                            let _e1771 = lAlb;
                            let _e1772 = lIce;
                            albedo = mix(_e1770, _e1771, vec3(_e1772));
                        }
                    }
                    let _e1775 = fl;
                    ice_8 = _e1775.x;
                    let _e1777 = global.uSeason;
                    if (_e1777.z > 0.5f) {
                        let _e1784 = Tair_2;
                        local_78 = smoothstep(-1f, 2f, _e1784);
                    } else {
                        local_78 = 0f;
                    }
                    let _e1788 = local_78;
                    thaw = _e1788;
                    let _e1792 = fl;
                    let _e1794 = dJ;
                    let _e1804 = fl;
                    let _e1807 = fl;
                    let _e1816 = thaw;
                    snowy = ((smoothstep(0.3f, 0.7f, (_e1792.z + ((_e1794.w - 0.5f) * 0.25f))) * (1f - ((0.7f * _e1804.y) / max(_e1807.x, 0.001f)))) * (1f - (0.7f * _e1816)));
                    let _e1829 = snowy;
                    let _e1834 = dI;
                    iceAlb = (mix(vec3<f32>(0.42f, 0.52f, 0.6f), vec3<f32>(0.82f, 0.86f, 0.9f), vec3(_e1829)) * (0.9f + (0.2f * _e1834.x)));
                    let _e1840 = global.uSeason;
                    if (_e1840.z > 0.5f) {
                        let _e1844 = Tair_2;
                        let _e1845 = dJ;
                        let _e1849 = fp_6;
                        let _e1850 = w_8;
                        let _e1852 = tri(_e1849, _e1850, 8f);
                        let _e1857 = meltPond(_e1844, ((_e1845.x * 0.6f) + (_e1852.x * 0.4f)));
                        let _e1861 = ridge_2;
                        local_79 = (_e1857 * (1f - smoothstep(0f, 0.2f, _e1861.w)));
                    } else {
                        local_79 = 0f;
                    }
                    let _e1868 = local_79;
                    pond_1 = _e1868;
                    let _e1870 = iceAlb;
                    let _e1875 = pond_1;
                    iceAlb = mix(_e1870, vec3<f32>(0.12f, 0.32f, 0.45f), vec3(_e1875));
                    let _e1878 = up_4;
                    let _e1879 = N_2;
                    N2_ = normalize(mix(_e1878, _e1879, vec3(0.5f)));
                    let _e1885 = ridge_2;
                    if (_e1885.w > 0f) {
                        {
                            let _e1889 = fp_6;
                            let _e1890 = w_8;
                            let _e1892 = tri(_e1889, _e1890, 2f);
                            blk = _e1892.x;
                            let _e1895 = iceAlb;
                            let _e1906 = blk;
                            let _e1912 = ridge_2;
                            iceAlb = mix(_e1895, mix(vec3<f32>(0.5f, 0.62f, 0.7f), vec3<f32>(0.85f, 0.88f, 0.92f), vec3(smoothstep(0.35f, 0.6f, _e1906))), vec3(smoothstep(0f, 0.2f, _e1912.w)));
                            let _e1917 = N2_;
                            let _e1918 = global.uToFixed;
                            let _e1920 = ridge_2;
                            let _e1927 = ridge_2;
                            N2_ = normalize((_e1917 + (((transpose(_e1918) * _e1920.xyz) * 0.5f) * smoothstep(0f, 0.1f, _e1927.w))));
                        }
                    }
                    let _e1933 = iceAlb;
                    let _e1937 = global.uSunE;
                    let _e1938 = sunT;
                    let _e1940 = N2_;
                    let _e1941 = global.uSunDir;
                    let _e1946 = global.uSunE;
                    let _e1947 = skyE_1;
                    let _e1951 = N2_;
                    let _e1952 = up_4;
                    iceCol = ((_e1933 / vec3(3.1415927f)) * (((_e1937 * _e1938) * max(dot(_e1940, _e1941), 0f)) + ((_e1946 * _e1947) * (0.5f + (0.5f * dot(_e1951, _e1952))))));
                    let _e1960 = N2_;
                    let _e1961 = H_1;
                    NdH2_ = max(dot(_e1960, _e1961), 0f);
                    let _e1966 = iceCol;
                    let _e1967 = global.uSunE;
                    let _e1968 = sunT;
                    let _e1970 = NdH2_;
                    let _e1973 = snowy;
                    let _e1980 = muS_2;
                    iceCol = (_e1966 + ((((_e1967 * _e1968) * pow(_e1970, mix(400f, 40f, _e1973))) * 0.04f) * step(0f, _e1980)));
                    let _e1984 = iceCol;
                    let _e1985 = global.uSunE;
                    let _e1986 = sunT;
                    let _e1988 = up_4;
                    let _e1989 = N2_;
                    let _e1994 = H_1;
                    let _e2003 = pond_1;
                    let _e2006 = muS_2;
                    iceCol = (_e1984 + (((((_e1985 * _e1986) * pow(max(dot(normalize(mix(_e1988, _e1989, vec3(0.2f))), _e1994), 0f), 600f)) * 0.4f) * _e2003) * step(0f, _e2006)));
                    let _e2010 = color;
                    let _e2011 = iceCol;
                    let _e2012 = ice_8;
                    color = mix(_e2010, _e2011, vec3(_e2012));
                    let _e2015 = albedo;
                    let _e2016 = iceAlb;
                    let _e2017 = ice_8;
                    albedo = mix(_e2015, _e2016, vec3(_e2017));
                }
            }
            let _e2020 = fallK;
            if (_e2020 > 0f) {
                {
                    let _e2024 = tsf;
                    let _e2028 = tsf;
                    let _e2032 = tsf;
                    iceF = (1f - smoothstep((_e2024.y - 12f), (_e2028.y - 4f), _e2032.x));
                    let _e2037 = iceF;
                    if (_e2037 > 0f) {
                        {
                            let _e2040 = upF_7;
                            let _e2041 = fn_;
                            let _e2042 = upF_7;
                            let _e2043 = fn_;
                            dnI = (_e2040 - (_e2041 * dot(_e2042, _e2043)));
                            let _e2048 = dnI;
                            let _e2050 = dnI;
                            downI = (-(_e2048) / vec3(max(length(_e2050), 0.0001f)));
                            let _e2057 = fn_;
                            let _e2058 = downI;
                            acrI = normalize(cross(_e2057, _e2058));
                            let _e2062 = vFixedPos_1;
                            let _e2063 = global.uOriginMod;
                            let _e2065 = global.uFallTop;
                            if (_e2065 > 0f) {
                                let _e2068 = global.uFallFoot;
                                local_80 = _e2068;
                            } else {
                                local_80 = vec3(0f);
                            }
                            let _e2072 = local_80;
                            pI = ((_e2062 - _e2063) - _e2072);
                            let _e2075 = pI;
                            let _e2076 = acrI;
                            let _e2078 = pI;
                            let _e2079 = downI;
                            qi = vec2<f32>(dot(_e2075, _e2076), dot(_e2078, _e2079));
                            let _e2083 = qi;
                            let _e2087 = qi;
                            qa_1 = vec2<f32>((_e2083.x * 0.2f), (_e2087.y * 0.015f));
                            let _e2093 = qi;
                            let _e2099 = qi;
                            qb_1 = vec2<f32>(((_e2093.x * 0.6f) + 0.3f), (_e2099.y * 0.04f));
                            let _e2105 = qa_1;
                            let _e2107 = textureSampleLevel(tDetailTexture, tDetailSampler, _e2105, 0f);
                            let _e2111 = qb_1;
                            let _e2113 = textureSampleLevel(tDetailTexture, tDetailSampler, _e2111, 0f);
                            cols = ((_e2107.x * 0.6f) + (_e2113.w * 0.4f));
                            let _e2119 = qa_1;
                            let _e2125 = textureSampleLevel(tDetailTexture, tDetailSampler, (_e2119 + vec2<f32>(0.01f, 0f)), 0f);
                            let _e2129 = qb_1;
                            let _e2135 = textureSampleLevel(tDetailTexture, tDetailSampler, (_e2129 + vec2<f32>(0.03f, 0f)), 0f);
                            colsX = ((_e2125.x * 0.6f) + (_e2135.w * 0.4f));
                            let _e2143 = cols;
                            thick = smoothstep(0.35f, 0.7f, _e2143);
                            let _e2154 = thick;
                            alb = mix(vec3<f32>(0.2f, 0.4f, 0.56f), vec3<f32>(0.88f, 0.93f, 0.97f), vec3(_e2154));
                            let _e2158 = Nw;
                            let _e2159 = global.uToFixed;
                            let _e2161 = acrI;
                            let _e2163 = colsX;
                            let _e2164 = cols;
                            nI = normalize((_e2158 - (((transpose(_e2159) * _e2161) * (_e2163 - _e2164)) * 30f)));
                            let _e2172 = global.uSunE;
                            let _e2173 = sunT;
                            let _e2175 = nI;
                            let _e2176 = global.uSunDir;
                            let _e2181 = global.uSunE;
                            let _e2182 = skyE_1;
                            litI = (((_e2172 * _e2173) * max(dot(_e2175, _e2176), 0f)) + ((_e2181 * _e2182) * 0.7f));
                            let _e2188 = nI;
                            let _e2189 = V_1;
                            let _e2190 = global.uSunDir;
                            spI = (pow(max(dot(_e2188, normalize((_e2189 + _e2190))), 0f), 60f) * 0.6f);
                            let _e2201 = color;
                            let _e2202 = alb;
                            let _e2206 = litI;
                            let _e2208 = global.uSunE;
                            let _e2209 = sunT;
                            let _e2211 = spI;
                            let _e2214 = muS_2;
                            let _e2218 = fallK;
                            let _e2219 = iceF;
                            color = mix(_e2201, (((_e2202 / vec3(3.1415927f)) * _e2206) + (((_e2208 * _e2209) * _e2211) * step(0f, _e2214))), vec3((_e2218 * _e2219)));
                        }
                    }
                }
            }
            let _e2223 = global.uDebug;
            if (_e2223 > 6.5f) {
                let _e2226 = fallK;
                let _e2227 = dbgWhite;
                let _e2228 = river_3;
                if _e2228 {
                    local_81 = 1f;
                } else {
                    local_81 = 0f;
                }
                let _e2232 = local_81;
                local_86 = vec3<f32>(_e2226, _e2227, _e2232);
            } else {
                let _e2234 = global.uDebug;
                if (_e2234 < 2.5f) {
                    let _e2237 = ice_8;
                    local_85 = vec3(_e2237);
                } else {
                    let _e2239 = global.uDebug;
                    if (_e2239 < 3.5f) {
                        let _e2242 = Tm_2;
                        local_84 = vec3((_e2242 / 40f));
                    } else {
                        let _e2246 = global.uDebug;
                        if (_e2246 < 4.5f) {
                            let _e2249 = foam_1;
                            local_83 = vec3(_e2249);
                        } else {
                            let _e2251 = global.uDebug;
                            if (_e2251 < 5.5f) {
                                let _e2254 = vLiq_1;
                                local_82 = _e2254.xyz;
                            } else {
                                let _e2256 = wr;
                                local_82 = vec3((_e2256 * 4f));
                            }
                            let _e2261 = local_82;
                            local_83 = _e2261;
                        }
                        let _e2263 = local_83;
                        local_84 = _e2263;
                    }
                    let _e2265 = local_84;
                    local_85 = _e2265;
                }
                let _e2267 = local_85;
                local_86 = _e2267;
            }
            let _e2269 = local_86;
            dbgW = _e2269;
        }
    }
    let _e2270 = global.uThermal;
    if (_e2270.x > 0f) {
        {
            let _e2274 = albedo;
            a_10 = clamp(_e2274, vec3(0f), vec3(1f));
            let _e2281 = color;
            let _e2284 = a_10;
            let _e2286 = global.uThermal;
            let _e2288 = global.uThermal;
            let _e2290 = r_10;
            let _e2291 = global.uRadius;
            let _e2295 = blackbodyGlow((_e2286.x - (_e2288.y * (_e2290 - _e2291))));
            color = (_e2281 + ((vec3(1f) - _e2284) * _e2295));
            let _e2298 = color;
            let _e2299 = a_10;
            let _e2302 = r_10;
            let _e2304 = atmoSunTransmittance(_e2302, 1f);
            let _e2307 = global.uThermal;
            let _e2309 = global.uThermal;
            let _e2311 = r_10;
            let _e2312 = global.uRadius;
            let _e2318 = blackbodyGlow((_e2307.x - (_e2309.z * max((_e2311 - _e2312), 0f))));
            color = (_e2298 + ((_e2299 * (vec3(1f) - _e2304)) * _e2318));
        }
    }
    let _e2321 = emissive;
    if (_e2321 > 0.01f) {
        {
            let _e2326 = global.uTime;
            let _e2329 = vFixedPos_1;
            let _e2334 = vFixedPos_1;
            flick = (0.85f + (0.15f * sin((((_e2326 * 1.7f) + (_e2329.x * 0.05f)) + (_e2334.z * 0.07f)))));
            let _e2345 = fp_6;
            let _e2346 = w_8;
            let _e2348 = tri(_e2345, _e2346, 128f);
            crust = smoothstep(0.35f, 0.65f, _e2348.w);
            let _e2352 = color;
            let _e2353 = global.uLavaColor;
            let _e2354 = emissive;
            let _e2356 = flick;
            let _e2360 = crust;
            let _e2362 = emissive;
            color = (_e2352 + (((_e2353 * _e2354) * _e2356) * mix(1f, 0.15f, (_e2360 * (1f - (_e2362 * 0.5f))))));
        }
    }
    let _e2370 = global.uDebug;
    if (_e2370 > 1.5f) {
        let _e2373 = dbgW;
        if (_e2373.x < 0f) {
            let _e2381 = waterEnc;
            local_87 = ((vec3<f32>(0.5f, 0f, 0.5f) * _e2381) * 50f);
        } else {
            let _e2385 = dbgW;
            local_87 = _e2385;
        }
        let _e2387 = local_87;
        let _e2388 = global.uDebug;
        if (_e2388 > 7.5f) {
            local_88 = 0.02f;
        } else {
            local_88 = 1f;
        }
        let _e2394 = local_88;
        color = (_e2387 * _e2394);
    } else {
        let _e2396 = global.uDebug;
        if (_e2396 > 0.5f) {
            let _e2399 = color;
            let _e2400 = vMorphK_1;
            let _e2402 = vMorphK_1;
            color = mix(_e2399, (vec3<f32>(_e2400, (1f - _e2402), 0f) * 0.2f), vec3(0.5f));
        }
    }
    let _e2411 = color;
    fragmentColor = vec4<f32>(_e2411.x, _e2411.y, _e2411.z, 1f);
    return;
}

@fragment 
fn main(@location(0) vNearRel: vec3<f32>, @location(1) vWorldPos: vec3<f32>, @location(2) vNormal: vec3<f32>, @location(3) vFixedPos: vec3<f32>, @location(4) vFixedNormal: vec3<f32>, @location(5) vCol: vec4<f32>, @location(6) vMat: vec4<f32>, @location(7) vExt: vec4<f32>, @location(8) vLiq: vec4<f32>, @location(9) vFlw: vec4<f32>, @location(10) vShore: f32, @location(11) vMorphK: f32) -> FragmentOutput {
    vNearRel_1 = vNearRel;
    vWorldPos_1 = vWorldPos;
    vNormal_1 = vNormal;
    vFixedPos_1 = vFixedPos;
    vFixedNormal_1 = vFixedNormal;
    vCol_1 = vCol;
    vMat_1 = vMat;
    vExt_1 = vExt;
    vLiq_1 = vLiq;
    vFlw_1 = vFlw;
    vShore_1 = vShore;
    vMorphK_1 = vMorphK;
    main_1();
    let _e241 = fragmentColor;
    return FragmentOutput(_e241);
}
`;
