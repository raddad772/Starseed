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
      "name": "uRing",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 512
    },
    {
      "name": "uRingTau",
      "type": "vec4",
      "count": 8,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 528
    },
    {
      "name": "uCSOrigin",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 656
    },
    {
      "name": "uCSE",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 672
    },
    {
      "name": "uCSN",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 688
    },
    {
      "name": "uCSInvL",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 700
    },
    {
      "name": "uCSLod",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 704
    },
    {
      "name": "uCSOn",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 708
    },
    {
      "name": "uCloudTau",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 712
    },
    {
      "name": "uThermal",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 720
    },
    {
      "name": "uHeightCube",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 736
    },
    {
      "name": "uColourCube",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 752
    },
    {
      "name": "uSunShadow",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 768
    },
    {
      "name": "uSunShadowVP0",
      "type": "mat4",
      "count": 0,
      "align": 16,
      "size": 64,
      "stride": 64,
      "offset": 784
    },
    {
      "name": "uSunShadowVP1",
      "type": "mat4",
      "count": 0,
      "align": 16,
      "size": 64,
      "stride": 64,
      "offset": 848
    },
    {
      "name": "uSunShadowL0",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 912
    },
    {
      "name": "uSunShadowL1",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 928
    },
    {
      "name": "uSunShadowDir",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 944
    },
    {
      "name": "uMoonDir",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 960
    },
    {
      "name": "uMoonE",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 976
    },
    {
      "name": "uLiquid",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 992
    },
    {
      "name": "uLiquid2",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 1008
    },
    {
      "name": "uLiquid3",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 1024
    },
    {
      "name": "uSurfSea",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 1040
    },
    {
      "name": "uWaveK",
      "type": "vec4",
      "count": 36,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 1056
    },
    {
      "name": "uZMode",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 1632
    },
    {
      "name": "uZNear",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 1636
    },
    {
      "name": "uZFar",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 1640
    },
    {
      "name": "uZLogFC",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 1644
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
      "name": "tColourCube",
      "type": "sampler2DArray",
      "count": 0,
      "binding": 19,
      "samplerBinding": 20
    },
    {
      "name": "tShadowAtlas",
      "type": "sampler2D",
      "count": 0,
      "binding": 21,
      "samplerBinding": 22
    },
    {
      "name": "tOpaque",
      "type": "sampler2D",
      "count": 0,
      "binding": 23,
      "samplerBinding": 24
    },
    {
      "name": "tWaterDepth",
      "type": "sampler2D",
      "count": 0,
      "binding": 25,
      "samplerBinding": 26
    }
  ],
  "bytes": 1648,
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
    uRing: vec4<f32>,
    uRingTau: array<vec4<f32>, 8>,
    uCSOrigin: vec3<f32>,
    uCSE: vec3<f32>,
    uCSN: vec3<f32>,
    uCSInvL: f32,
    uCSLod: f32,
    uCSOn: f32,
    uCloudTau: f32,
    uThermal: vec4<f32>,
    uHeightCube: vec4<f32>,
    uColourCube: vec4<f32>,
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
    uSurfSea: f32,
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
const FROST_NL: f32 = 180f;
const FROST_NT: f32 = 9f;
const FROST_TILT0_: f32 = -40f;
const FROST_DTILT: f32 = 10f;
const SNOW_DEPTH_PER_MM: f32 = 0.003333f;
const DDF_SNOW: f32 = 4f;
const HC_N: array<vec3<f32>, 6> = array<vec3<f32>, 6>(vec3<f32>(1f, 0f, 0f), vec3<f32>(-1f, 0f, 0f), vec3<f32>(0f, 1f, 0f), vec3<f32>(0f, -1f, 0f), vec3<f32>(0f, 0f, 1f), vec3<f32>(0f, 0f, -1f));
const HC_U: array<vec3<f32>, 6> = array<vec3<f32>, 6>(vec3<f32>(0f, 0f, -1f), vec3<f32>(0f, 0f, 1f), vec3<f32>(1f, 0f, 0f), vec3<f32>(1f, 0f, 0f), vec3<f32>(1f, 0f, 0f), vec3<f32>(-1f, 0f, 0f));
const HC_V: array<vec3<f32>, 6> = array<vec3<f32>, 6>(vec3<f32>(0f, 1f, 0f), vec3<f32>(0f, 1f, 0f), vec3<f32>(0f, 0f, -1f), vec3<f32>(0f, 0f, 1f), vec3<f32>(0f, 1f, 0f), vec3<f32>(0f, 1f, 0f));
const SURF_A: f32 = 0.1f;
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
var tColourCubeTexture: texture_2d_array<f32>;
@group(1) @binding(20) 
var tColourCubeSampler: sampler;
@group(1) @binding(21) 
var tShadowAtlasTexture: texture_2d<f32>;
@group(1) @binding(22) 
var tShadowAtlasSampler: sampler;
@group(1) @binding(23) 
var tOpaqueTexture: texture_2d<f32>;
@group(1) @binding(24) 
var tOpaqueSampler: sampler;
@group(1) @binding(25) 
var tWaterDepthTexture: texture_2d<f32>;
@group(1) @binding(26) 
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
    let _e171 = global.uSunLift;
    hD = (1.5707963f + _e171.x);
    let _e176 = global.uSunLift;
    hT = (1.5707963f + _e176.y);
    let _e180 = zd_1;
    let _e181 = hD;
    if (_e180 <= _e181) {
        let _e183 = zd_1;
        let _e184 = hT;
        let _e186 = hD;
        local = ((_e183 * _e184) / _e186);
    } else {
        let _e188 = hT;
        let _e189 = zd_1;
        let _e190 = hD;
        let _e193 = hT;
        let _e197 = hD;
        local = (_e188 + (((_e189 - _e190) * (3.1415927f - _e193)) / (3.1415927f - _e197)));
    }
    let _e202 = local;
    return _e202;
}

fn liftMu(mu: f32) -> f32 {
    var mu_1: f32;

    mu_1 = mu;
    let _e170 = global.uSunLift;
    let _e172 = global.uSunLift;
    if (_e170.x <= _e172.y) {
        let _e175 = mu_1;
        return _e175;
    }
    let _e176 = mu_1;
    let _e182 = lensTrueZ(acos(clamp(_e176, -1f, 1f)));
    return cos(_e182);
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
    let _e173 = global.uTop;
    let _e174 = global.uTop;
    let _e176 = global.uBottom;
    let _e177 = global.uBottom;
    H = sqrt(max(0f, ((_e173 * _e174) - (_e176 * _e177))));
    let _e184 = r_1;
    let _e185 = r_1;
    let _e187 = global.uBottom;
    let _e188 = global.uBottom;
    rho = sqrt(max(0f, ((_e184 * _e185) - (_e187 * _e188))));
    let _e194 = r_1;
    let _e195 = r_1;
    let _e197 = mu_3;
    let _e198 = mu_3;
    let _e203 = global.uTop;
    let _e204 = global.uTop;
    disc = (((_e194 * _e195) * ((_e197 * _e198) - 1f)) + (_e203 * _e204));
    let _e209 = r_1;
    let _e211 = mu_3;
    let _e213 = disc;
    d = max(0f, ((-(_e209) * _e211) + sqrt(max(_e213, 0f))));
    let _e220 = global.uTop;
    let _e221 = r_1;
    dMin = (_e220 - _e221);
    let _e224 = rho;
    let _e225 = H;
    dMax = (_e224 + _e225);
    let _e228 = d;
    let _e229 = dMin;
    let _e231 = dMax;
    let _e232 = dMin;
    let _e237 = rho;
    let _e238 = H;
    return vec2<f32>(((_e228 - _e229) / max((_e231 - _e232), 0.000001f)), (_e237 / max(_e238, 0.000001f)));
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
    let _e172 = mu_5;
    let _e173 = liftMu(_e172);
    mu_5 = _e173;
    let _e174 = global.uGround;
    let _e175 = global.uTrueK;
    Rg = (_e174 * max(_e175, 1f));
    let _e180 = Rg;
    let _e181 = Rg;
    let _e182 = r_3;
    let _e183 = global.uGround;
    sinH = (_e180 / (_e181 + max((_e182 - _e183), 0f)));
    let _e192 = sinH;
    let _e193 = sinH;
    cosH = -(sqrt(max(0f, (1f - (_e192 * _e193)))));
    let _e200 = cosH;
    let _e203 = cosH;
    let _e206 = mu_5;
    vis = smoothstep((_e200 - 0.01f), (_e203 + 0.01f), _e206);
    let _e209 = global.uHasAtmo;
    if (_e209 < 0.5f) {
        let _e212 = vis;
        return vec3(_e212);
    }
    let _e214 = r_3;
    let _e215 = global.uBottom;
    let _e216 = global.uTop;
    let _e218 = mu_5;
    let _e219 = transmittanceUV(clamp(_e214, _e215, _e216), _e218);
    uv = _e219;
    let _e228 = uv;
    uv = (vec2<f32>(0.001953125f, 0.0078125f) + (_e228 * vec2<f32>(0.99609375f, 0.984375f)));
    let _e238 = uv;
    let _e240 = textureSampleLevel(tTransTexture, tTransSampler, _e238, 0f);
    let _e242 = vis;
    return (_e240.xyz * _e242);
}

fn atmoSkyIrradiance(r_4: f32, mu_6: f32) -> vec3<f32> {
    var r_5: f32;
    var mu_7: f32;
    var uv_1: vec2<f32>;

    r_5 = r_4;
    mu_7 = mu_6;
    let _e172 = global.uHasAtmo;
    if (_e172 < 0.5f) {
        return vec3(0f);
    }
    let _e177 = mu_7;
    let _e178 = liftMu(_e177);
    mu_7 = _e178;
    let _e179 = mu_7;
    let _e184 = r_5;
    let _e185 = global.uGround;
    let _e187 = global.uTop;
    let _e188 = global.uGround;
    uv_1 = vec2<f32>(((_e179 * 0.5f) + 0.5f), clamp(((_e184 - _e185) / (_e187 - _e188)), 0f, 1f));
    let _e203 = uv_1;
    uv_1 = (vec2<f32>(0.0078125f, 0.03125f) + (_e203 * vec2<f32>(0.984375f, 0.9375f)));
    let _e213 = uv_1;
    let _e215 = textureSampleLevel(tIrrTexture, tIrrSampler, _e213, 0f);
    return _e215.xyz;
}

fn seasonYear(dirF: vec3<f32>) -> vec3<f32> {
    var dirF_1: vec3<f32>;
    var m: vec4<f32>;

    dirF_1 = dirF;
    let _e171 = dirF_1;
    let _e173 = dirF_1;
    let _e180 = dirF_1;
    let _e193 = textureSampleLevel(tSeasonMapTexture, tSeasonMapSampler, vec2<f32>(((atan2(_e171.z, _e173.x) / 6.28319f) + 0.5f), ((asin(clamp(_e180.y, -1f, 1f)) / 3.14159f) + 0.5f)), 0f);
    m = _e193;
    let _e195 = m;
    let _e201 = m;
    let _e207 = m;
    let _e209 = m;
    return vec3<f32>(((_e195.x - 0.5f) * 100f), ((_e201.y - 0.5f) * 100f), ((_e207.z * _e209.z) * 600f));
}

fn seasonIceNow(dirF_2: vec3<f32>) -> f32 {
    var dirF_3: vec3<f32>;
    var m_1: vec4<f32>;

    dirF_3 = dirF_2;
    let _e171 = dirF_3;
    let _e173 = dirF_3;
    let _e180 = dirF_3;
    let _e193 = textureSampleLevel(tSeasonIceTexture, tSeasonIceSampler, vec2<f32>(((atan2(_e171.z, _e173.x) / 6.28319f) + 0.5f), ((asin(clamp(_e180.y, -1f, 1f)) / 3.14159f) + 0.5f)), 0f);
    m_1 = _e193;
    let _e195 = m_1;
    let _e201 = m_1;
    let _e207 = global.uSeason;
    let _e212 = m_1;
    let _e218 = global.uSeason;
    return ((((_e195.z - 0.5f) * 100f) + (((_e201.x - 0.5f) * 100f) * cos(_e207.x))) + (((_e212.y - 0.5f) * 100f) * sin(_e218.x)));
}

fn seaIceAt(m_2: vec3<f32>, Tf: f32) -> f32 {
    var m_3: vec3<f32>;
    var Tf_1: f32;
    var u: vec3<f32>;
    var t: vec4<f32>;
    var Ts: f32;

    m_3 = m_2;
    Tf_1 = Tf;
    let _e173 = m_3;
    u = normalize(_e173);
    let _e176 = u;
    let _e178 = u;
    let _e185 = u;
    let _e198 = textureSampleLevel(tSeasonMapTexture, tSeasonMapSampler, vec2<f32>(((atan2(_e176.z, _e178.x) / 6.28319f) + 0.5f), ((asin(clamp(_e185.y, -1f, 1f)) / 3.14159f) + 0.5f)), 0f);
    t = _e198;
    let _e200 = t;
    let _e206 = t;
    let _e212 = global.uSeason;
    let _e217 = t;
    let _e223 = global.uSeason;
    Ts = ((((_e200.w * 120f) - 60f) + (((_e206.x - 0.5f) * 100f) * cos(_e212.x))) + (((_e217.y - 0.5f) * 100f) * sin(_e223.x)));
    let _e230 = Tf_1;
    let _e233 = Tf_1;
    let _e236 = Ts;
    return (1f - smoothstep((_e230 - 4f), (_e233 + 4f), _e236));
}

fn meltPond(Tair: f32, n: f32) -> f32 {
    var Tair_1: f32;
    var n_1: f32;
    var f: f32;
    var local_1: f32;

    Tair_1 = Tair;
    n_1 = n;
    let _e177 = Tair_1;
    f = (0.45f * smoothstep(-0.5f, 4f, _e177));
    let _e181 = f;
    if (_e181 > 0f) {
        let _e185 = f;
        let _e188 = f;
        let _e191 = n_1;
        local_1 = (1f - smoothstep((_e185 - 0.06f), (_e188 + 0.06f), _e191));
    } else {
        local_1 = 0f;
    }
    let _e196 = local_1;
    return _e196;
}

fn cloudN(n_2: f32) -> f32 {
    var n_3: f32;

    n_3 = n_2;
    let _e178 = n_3;
    return (0.55f + ((_e178 - 0.682f) * 4.3f));
}

fn cloudBias(cover: f32) -> f32 {
    var cover_1: f32;

    cover_1 = cover;
    let _e177 = cover_1;
    let _e185 = cover_1;
    let _e193 = cover_1;
    return ((((_e177 - 0.5f) * 0.3f) + (0.5f * smoothstep(0.8f, 1f, _e185))) - (0.5f * (1f - smoothstep(0f, 0.2f, _e193))));
}

fn cloudFade(foot: f32, L: f32) -> f32 {
    var foot_1: f32;
    var L_1: f32;

    foot_1 = foot;
    L_1 = L;
    let _e181 = foot_1;
    let _e184 = L_1;
    return smoothstep(1f, 4f, ((_e181 * 64f) / _e184));
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
    let _e178 = textureDimensions(tCloudMapTexture, 0i);
    sz = vec2<f32>(vec2<i32>(_e178));
    let _e182 = uv_3;
    let _e183 = sz;
    st = ((_e182 * _e183) - vec2(0.5f));
    let _e189 = st;
    i = floor(_e189);
    let _e192 = st;
    let _e193 = i;
    f_1 = (_e192 - _e193);
    let _e196 = f_1;
    let _e197 = f_1;
    f2_ = (_e196 * _e197);
    let _e200 = f2_;
    let _e201 = f_1;
    f3_ = (_e200 * _e201);
    let _e206 = f_1;
    let _e211 = f2_;
    let _e214 = f3_;
    w0_ = ((((vec2(1f) - (3f * _e206)) + (3f * _e211)) - _e214) / vec2(6f));
    let _e222 = f2_;
    let _e227 = f3_;
    w1_ = (((vec2(4f) - (6f * _e222)) + (3f * _e227)) / vec2(6f));
    let _e236 = f_1;
    let _e241 = f2_;
    let _e245 = f3_;
    w2_ = ((((vec2(1f) + (3f * _e236)) + (3f * _e241)) - (3f * _e245)) / vec2(6f));
    let _e252 = f3_;
    w3_ = (_e252 / vec2(6f));
    let _e257 = w0_;
    let _e258 = w1_;
    g0_ = (_e257 + _e258);
    let _e261 = w2_;
    let _e262 = w3_;
    g1_ = (_e261 + _e262);
    let _e265 = i;
    let _e269 = w1_;
    let _e270 = g0_;
    let _e273 = sz;
    h0_ = (((_e265 - vec2(0.5f)) + (_e269 / _e270)) / _e273);
    let _e276 = i;
    let _e280 = w3_;
    let _e281 = g1_;
    let _e284 = sz;
    h1_ = (((_e276 + vec2(1.5f)) + (_e280 / _e281)) / _e284);
    let _e287 = g0_;
    let _e289 = g0_;
    let _e291 = h0_;
    let _e293 = textureSampleLevel(tCloudMapTexture, tCloudMapSampler, _e291, 0f);
    let _e296 = g1_;
    let _e298 = h1_;
    let _e300 = h0_;
    let _e304 = textureSampleLevel(tCloudMapTexture, tCloudMapSampler, vec2<f32>(_e298.x, _e300.y), 0f);
    let _e309 = g1_;
    let _e311 = g0_;
    let _e313 = h0_;
    let _e315 = h1_;
    let _e319 = textureSampleLevel(tCloudMapTexture, tCloudMapSampler, vec2<f32>(_e313.x, _e315.y), 0f);
    let _e322 = g1_;
    let _e324 = h1_;
    let _e326 = textureSampleLevel(tCloudMapTexture, tCloudMapSampler, _e324, 0f);
    return ((_e287.y * ((_e289.x * _e293.xyz) + (_e296.x * _e304.xyz))) + (_e309.y * ((_e311.x * _e319.xyz) + (_e322.x * _e326.xyz))));
}

fn cloudClimate(dirF_4: vec3<f32>) -> f32 {
    var dirF_5: vec3<f32>;
    var lat: f32;
    var cm: vec3<f32>;

    dirF_5 = dirF_4;
    let _e177 = dirF_5;
    lat = asin(clamp(_e177.y, -1f, 1f));
    let _e185 = global.uCloudMapMean;
    if (_e185 <= 0f) {
        let _e189 = lat;
        return (0.12f * cos((abs(_e189) * 6f)));
    }
    let _e195 = dirF_5;
    let _e197 = dirF_5;
    let _e204 = lat;
    let _e210 = cloudMapSmooth(vec2<f32>(((atan2(_e195.z, _e197.x) / 6.2832f) + 0.5f), ((_e204 / 3.14159f) + 0.5f)));
    cm = _e210;
    let _e212 = cm;
    let _e214 = cm;
    let _e218 = global.uCloudYear;
    let _e222 = cm;
    let _e226 = global.uCloudYear;
    let _e230 = global.uCloudMapMean;
    return ((((_e212.x + ((_e214.y - 0.5f) * _e218.x)) + ((_e222.z - 0.5f) * _e226.y)) - _e230) * 0.8f);
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
    let _e183 = global.uRadius;
    L0_ = (_e183 * 1f);
    let _e187 = global.uRadius;
    L1_ = (_e187 * 0.236f);
    let _e191 = foot_3;
    let _e192 = L0_;
    let _e193 = cloudFade(_e191, _e192);
    f0_ = _e193;
    let _e195 = foot_3;
    let _e196 = L1_;
    let _e197 = cloudFade(_e195, _e196);
    f1_ = _e197;
    let _e199 = q_1;
    qz = (_e199 * vec3<f32>(0.5f, 1f, 0.5f));
    let _e206 = f0_;
    if (_e206 > 0.999f) {
        local_2 = 0.682f;
    } else {
        let _e210 = qz;
        let _e211 = L0_;
        let _e215 = textureSampleLevel(tNoiseTexture, tNoiseSampler, (_e210 / vec3(_e211)), 0f);
        let _e218 = f0_;
        local_2 = mix(_e215.x, 0.682f, _e218);
    }
    let _e221 = local_2;
    a = _e221;
    let _e223 = f1_;
    if (_e223 > 0.999f) {
        local_3 = 0.682f;
    } else {
        let _e227 = qz;
        let _e228 = L1_;
        let _e235 = textureSampleLevel(tNoiseTexture, tNoiseSampler, ((_e227 / vec3(_e228)) + vec3(0.5f)), 0f);
        let _e238 = f1_;
        local_3 = mix(_e235.x, 0.682f, _e238);
    }
    let _e241 = local_3;
    b = _e241;
    let _e244 = f0_;
    let _e247 = f1_;
    spread = length(vec2<f32>((0.124f * _e244), (0.083f * _e247)));
    let _e253 = bias_1;
    let _e255 = spread;
    let _e258 = bias_1;
    let _e260 = spread;
    let _e262 = a;
    let _e265 = b;
    let _e269 = cloudN(((_e262 * 0.6f) + (_e265 * 0.4f)));
    let _e270 = clim_1;
    return smoothstep(((0.6f - _e253) - _e255), ((0.8f - _e258) + _e260), (_e269 + _e270));
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
    let _e179 = global.uCloudClock;
    T = _e179.z;
    let _e182 = T;
    if (_e182 <= 0f) {
        {
            (*gA) = vec3<f32>(1f, 0f, 0f);
            (*gB) = vec3(0f);
            return;
        }
    }
    let _e192 = dirF_7;
    let _e196 = dirF_7;
    let _e201 = dirF_7;
    let _e207 = dirF_7;
    let _e211 = dirF_7;
    let _e216 = dirF_7;
    ph = ((((1.1f * _e192.x) + (0.7f * _e196.z)) - (0.5f * _e201.y)) + (0.35f * sin((((2.3f * _e207.y) + (1.7f * _e211.x)) - (0.9f * _e216.z)))));
    let _e224 = global.uCloudClock;
    let _e226 = T;
    let _e228 = ph;
    s = (((_e224.x / _e226) + _e228) + 4f);
    let _e233 = s;
    a_1 = floor(_e233);
    let _e236 = s;
    let _e237 = a_1;
    fa = (_e236 - _e237);
    let _e240 = s;
    b_1 = floor((_e240 + 0.5f));
    let _e245 = s;
    let _e248 = b_1;
    fb = ((_e245 + 0.5f) - _e248);
    let _e252 = dirF_7;
    let _e262 = dirF_7;
    let _e274 = dirF_7;
    j = (0.065f * ((sin((dot(_e252, vec3<f32>(5.1f, 3.7f, -4.3f)) + 1.3f)) + sin((dot(_e262, vec3<f32>(-3.9f, 7.3f, 6.1f)) + 0.4f))) + (0.6f * sin((dot(_e274, vec3<f32>(11.3f, -8.9f, 7.7f)) + 2.1f)))));
    let _e288 = s;
    let _e289 = j;
    fj = fract((_e288 + _e289));
    let _e297 = fj;
    wa = smoothstep(0.4f, 0.6f, (1f - abs(((2f * _e297) - 1f))));
    let _e305 = wa;
    let _e306 = fa;
    let _e309 = T;
    let _e312 = global.uCloudClock;
    let _e314 = a_1;
    (*gA) = vec3<f32>(_e305, ((_e306 - 0.5f) * _e309), (2f * (_e312.y + _e314)));
    let _e319 = wa;
    let _e321 = fb;
    let _e324 = T;
    let _e327 = global.uCloudClock;
    let _e329 = b_1;
    (*gB) = vec3<f32>((1f - _e319), ((_e321 - 0.5f) * _e324), ((2f * (_e327.y + _e329)) + 1f));
    return;
}

fn cloudGenOff(idx: f32) -> vec3<f32> {
    var idx_1: f32;
    var h: u32;

    idx_1 = idx;
    let _e177 = idx_1;
    h = (u32(_e177) * 2654435761u);
    let _e182 = h;
    let _e183 = h;
    h = (_e182 ^ (_e183 >> 15u));
    let _e187 = h;
    h = (_e187 * 2246822519u);
    let _e190 = h;
    let _e191 = h;
    h = (_e190 ^ (_e191 >> 13u));
    let _e195 = h;
    let _e199 = h;
    let _e205 = h;
    return (((vec3<f32>(f32((_e195 & 1023u)), f32(((_e199 >> 10u) & 1023u)), f32(((_e205 >> 20u) & 1023u))) / vec3(1024f)) - vec3(0.5f)) * 400000f);
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
    let _e181 = dirF_9;
    lat_1 = asin(clamp(_e181.y, -1f, 1f));
    let _e189 = global.uCloudWind;
    let _e191 = lat_1;
    let _e192 = global.uCloudWind;
    let _e197 = global.uCloudWind;
    let _e203 = global.uCloudWind;
    let _e205 = lat_1;
    let _e207 = lat_1;
    U = (_e189.x * (sin((((_e191 * _e192.y) * 2f) + (_e197.z * 6.2832f))) + (_e203.w * exp(((-(_e205) * _e207) * 40f)))));
    let _e216 = dirF_9;
    let _e220 = dirF_9;
    east = normalize((vec3<f32>(-(_e216.z), 0f, _e220.x) + vec3<f32>(0.000001f, 0f, 0f)));
    let _e230 = pf_1;
    let _e231 = east;
    let _e232 = U;
    let _e234 = g_1;
    let _e238 = g_1;
    let _e240 = cloudGenOff(_e238.z);
    return ((_e230 + ((_e231 * _e232) * _e234.y)) + _e240);
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
    let _e185 = dirF_11;
    cloudGens(_e185, (&gA_1), (&gB_1));
    let _e192 = dirF_11;
    let _e193 = cloudClimate(_e192);
    clim_2 = _e193;
    let _e195 = gA_1;
    if (_e195.x > 0.005f) {
        let _e199 = c;
        let _e200 = gA_1;
        let _e202 = pf_3;
        let _e203 = dirF_11;
        let _e204 = gA_1;
        let _e205 = cloudAdvect(_e202, _e203, _e204);
        let _e206 = foot_5;
        let _e207 = bias_3;
        let _e208 = clim_2;
        let _e209 = cloudCoverC(_e205, _e206, _e207, _e208);
        c = (_e199 + (_e200.x * _e209));
    }
    let _e212 = gB_1;
    if (_e212.x > 0.005f) {
        let _e216 = c;
        let _e217 = gB_1;
        let _e219 = pf_3;
        let _e220 = dirF_11;
        let _e221 = gB_1;
        let _e222 = cloudAdvect(_e219, _e220, _e221);
        let _e223 = foot_5;
        let _e224 = bias_3;
        let _e225 = clim_2;
        let _e226 = cloudCoverC(_e222, _e223, _e224, _e225);
        c = (_e216 + (_e217.x * _e226));
    }
    let _e229 = c;
    return _e229;
}

fn ringShadow(rel: vec3<f32>) -> f32 {
    var rel_1: vec3<f32>;
    var pF: vec3<f32>;
    var sF: vec3<f32>;
    var q_2: vec3<f32>;
    var x: f32;
    var f_2: f32;
    var i_1: i32;
    var j_1: i32;
    var tau: f32;

    rel_1 = rel;
    let _e177 = global.uRing;
    if (_e177.z < 0.5f) {
        return 1f;
    }
    let _e182 = global.uToFixed;
    let _e183 = rel_1;
    pF = (_e182 * _e183);
    let _e186 = global.uToFixed;
    let _e187 = global.uSunDir;
    sF = (_e186 * _e187);
    let _e190 = pF;
    let _e192 = sF;
    let _e197 = sF;
    if (((_e190.y * _e192.y) >= 0f) || (abs(_e197.y) < 0.0001f)) {
        return 1f;
    }
    let _e204 = pF;
    let _e205 = sF;
    let _e206 = pF;
    let _e208 = sF;
    q_2 = (_e204 - (_e205 * (_e206.y / _e208.y)));
    let _e214 = q_2;
    let _e217 = global.uRing;
    let _e220 = global.uRing;
    let _e222 = global.uRing;
    x = ((length(_e214.xz) - _e217.x) / (_e220.y - _e222.x));
    let _e227 = x;
    let _e230 = x;
    if ((_e227 <= 0f) || (_e230 >= 1f)) {
        return 1f;
    }
    let _e235 = x;
    f_2 = clamp(((_e235 * 32f) - 0.5f), 0f, 31f);
    let _e244 = f_2;
    i_1 = i32(floor(_e244));
    let _e248 = i_1;
    j_1 = min((_e248 + 1i), 31i);
    let _e254 = i_1;
    let _e256 = i_1;
    let _e261 = i_1;
    let _e266 = global.uRingTau[(_e261 / 4i)][(_e254 - (4i * (_e256 / 4i)))];
    let _e267 = j_1;
    let _e269 = j_1;
    let _e274 = j_1;
    let _e279 = global.uRingTau[(_e274 / 4i)][(_e267 - (4i * (_e269 / 4i)))];
    let _e280 = f_2;
    let _e281 = f_2;
    tau = mix(_e266, _e279, (_e280 - floor(_e281)));
    let _e286 = tau;
    let _e288 = sF;
    return exp((-(_e286) / abs(_e288.y)));
}

fn cloudLight(rel_2: vec3<f32>, r_6: f32, muS: f32, foot_6: f32, sunAbove: vec3<f32>, skyE: ptr<function, vec3<f32>>) -> f32 {
    var rel_3: vec3<f32>;
    var r_7: f32;
    var muS_1: f32;
    var foot_7: f32;
    var sunAbove_1: vec3<f32>;
    var ring: f32;
    var local_4: f32;
    var mu_8: f32;
    var Tdir: f32 = 1f;
    var Ttot: f32 = 1f;
    var Dup: f32 = 1f;
    var w: f32 = 0f;
    var m0_: vec4<f32> = vec4(1f);
    var m1_: vec4<f32> = vec4(1f);
    var pf_4: vec3<f32>;
    var upF: vec3<f32>;
    var sF_1: vec3<f32>;
    var d_1: vec3<f32>;
    var uv_4: vec2<f32>;
    var hc: f32;
    var ds: vec3<f32>;
    var local_5: f32;
    var cs: f32;
    var dz: vec3<f32>;
    var cz: f32;
    var local_6: f32;

    rel_3 = rel_2;
    r_7 = r_6;
    muS_1 = muS;
    foot_7 = foot_6;
    sunAbove_1 = sunAbove;
    cloudDirZ = 1f;
    cloudTotZ = 1f;
    let _e190 = rel_3;
    let _e191 = ringShadow(_e190);
    ring = _e191;
    let _e193 = global.uCloudOn;
    if (_e193 < 0.5f) {
        let _e196 = muS_1;
        if (_e196 > -0.05f) {
            let _e200 = ring;
            local_4 = _e200;
        } else {
            local_4 = 1f;
        }
        let _e203 = local_4;
        return _e203;
    }
    let _e204 = muS_1;
    mu_8 = max(_e204, 0.05f);
    let _e222 = global.uCSOn;
    if (_e222 > 0.5f) {
        {
            let _e225 = global.uToFixed;
            let _e226 = rel_3;
            pf_4 = (_e225 * _e226);
            let _e229 = pf_4;
            let _e230 = r_7;
            upF = (_e229 / vec3(_e230));
            let _e234 = global.uToFixed;
            let _e235 = global.uSunDir;
            sF_1 = (_e234 * _e235);
            let _e238 = pf_4;
            let _e239 = global.uCSOrigin;
            let _e241 = sF_1;
            let _e242 = upF;
            let _e243 = sF_1;
            let _e244 = upF;
            let _e248 = r_7;
            let _e249 = global.uRadius;
            let _e252 = sF_1;
            let _e253 = upF;
            d_1 = ((_e238 - _e239) - (((_e241 - (_e242 * dot(_e243, _e244))) * (_e248 - _e249)) / vec3(max(dot(_e252, _e253), 0.1f))));
            let _e261 = d_1;
            let _e262 = global.uCSE;
            let _e264 = d_1;
            let _e265 = global.uCSN;
            let _e268 = global.uCSInvL;
            uv_4 = ((vec2<f32>(dot(_e261, _e262), dot(_e264, _e265)) * _e268) + vec2(0.5f));
            let _e276 = uv_4;
            let _e279 = uv_4;
            let _e283 = uv_4;
            let _e286 = uv_4;
            w = smoothstep(0f, 0.08f, min(min(_e276.x, (1f - _e279.x)), min(_e283.y, (1f - _e286.y))));
            let _e292 = w;
            if (_e292 > 0f) {
                {
                    let _e295 = uv_4;
                    let _e297 = textureSampleLevel(tCloudShadowTexture, tCloudShadowSampler, _e295, 0f);
                    m0_ = _e297;
                    let _e298 = uv_4;
                    let _e299 = global.uCSLod;
                    let _e300 = textureSampleLevel(tCloudShadowTexture, tCloudShadowSampler, _e298, _e299);
                    m1_ = _e300;
                }
            }
        }
    }
    let _e301 = global.uCloud;
    let _e303 = r_7;
    let _e304 = global.uRadius;
    hc = (_e301.x - (_e303 - _e304));
    let _e308 = hc;
    let _e311 = w;
    if ((_e308 > 0f) && (_e311 < 1f)) {
        {
            let _e315 = global.uToFixed;
            let _e316 = rel_3;
            let _e317 = global.uSunDir;
            let _e318 = hc;
            let _e320 = muS_1;
            ds = normalize((_e315 * normalize((_e316 + ((_e317 * _e318) / vec3(max(_e320, 0.08f)))))));
            let _e330 = muS_1;
            if (_e330 > -0.05f) {
                let _e334 = ds;
                let _e335 = global.uRadius;
                let _e337 = ds;
                let _e338 = foot_7;
                let _e339 = global.uCloud;
                let _e341 = cloudBias(_e339.z);
                let _e342 = cloudCoverG((_e334 * _e335), _e337, _e338, _e341);
                let _e343 = global.uCloudOpacity;
                local_5 = (_e342 * _e343);
            } else {
                local_5 = 0f;
            }
            let _e347 = local_5;
            cs = _e347;
            let _e349 = global.uToFixed;
            let _e350 = rel_3;
            dz = normalize((_e349 * _e350));
            let _e354 = dz;
            let _e355 = global.uRadius;
            let _e357 = dz;
            let _e358 = foot_7;
            let _e360 = hc;
            let _e363 = global.uCloud;
            let _e365 = cloudBias(_e363.z);
            let _e366 = cloudCoverG((_e354 * _e355), _e357, max(_e358, (3.5f * _e360)), _e365);
            let _e367 = global.uCloudOpacity;
            cz = (_e366 * _e367);
            let _e371 = cs;
            let _e373 = cs;
            let _e374 = global.uCloudTau;
            let _e376 = mu_8;
            Tdir = ((1f - _e371) + (_e373 * exp((-(_e374) / _e376))));
            let _e382 = cz;
            let _e384 = cz;
            let _e387 = global.uCloudTau;
            Ttot = ((1f - _e382) + (_e384 / (1f + (0.1125f * _e387))));
            let _e393 = cz;
            let _e395 = cz;
            let _e396 = global.uCloudTau;
            let _e398 = mu_8;
            Dup = ((1f - _e393) + (_e395 * exp((-(_e396) / _e398))));
        }
    }
    let _e403 = Tdir;
    let _e404 = m0_;
    let _e406 = w;
    Tdir = mix(_e403, _e404.x, _e406);
    let _e408 = Ttot;
    let _e409 = m1_;
    let _e411 = w;
    Ttot = mix(_e408, _e409.y, _e411);
    let _e413 = Dup;
    let _e414 = m1_;
    let _e416 = w;
    Dup = mix(_e413, _e414.z, _e416);
    let _e418 = Dup;
    cloudDirZ = _e418;
    let _e419 = Ttot;
    cloudTotZ = _e419;
    let _e420 = (*skyE);
    let _e421 = Ttot;
    let _e423 = sunAbove_1;
    let _e424 = muS_1;
    let _e428 = Ttot;
    let _e429 = Dup;
    (*skyE) = ((_e420 * _e421) + ((_e423 * max(_e424, 0f)) * max((_e428 - _e429), 0f)));
    let _e435 = muS_1;
    if (_e435 > -0.05f) {
        let _e439 = Tdir;
        let _e440 = ring;
        local_6 = (_e439 * _e440);
    } else {
        local_6 = 1f;
    }
    let _e444 = local_6;
    return _e444;
}

fn blackbodyGlow(T_1: f32) -> vec3<f32> {
    var T_2: f32;
    var g_2: f32;

    T_2 = T_1;
    let _e179 = T_2;
    if (_e179 < 650f) {
        return vec3(0f);
    }
    let _e187 = T_2;
    g_2 = max(0f, (0.0287f + (0.000237f * (_e187 - 1000f))));
    let _e195 = g_2;
    let _e201 = T_2;
    let _e207 = g_2;
    return (vec3<f32>(1f, _e195, 0f) * ((600000f * exp((-24060f / _e201))) / (0.2126f + (0.7152f * _e207))));
}

fn heightCubeAt(d_2: vec3<f32>) -> f32 {
    var d_3: vec3<f32>;
    var a_2: vec3<f32>;
    var local_7: i32;
    var local_8: i32;
    var local_9: i32;
    var local_10: i32;
    var local_11: i32;
    var f_3: i32;
    var local_12: array<vec3<f32>, 6> = HC_N;
    var dn: f32;
    var local_13: array<vec3<f32>, 6> = HC_U;
    var local_14: array<vec3<f32>, 6> = HC_V;
    var uv_5: vec2<f32>;

    d_3 = d_2;
    let _e182 = d_3;
    a_2 = abs(_e182);
    let _e185 = a_2;
    let _e187 = a_2;
    let _e190 = a_2;
    let _e192 = a_2;
    if ((_e185.x >= _e187.y) && (_e190.x >= _e192.z)) {
        let _e196 = d_3;
        if (_e196.x >= 0f) {
            local_7 = 0i;
        } else {
            local_7 = 1i;
        }
        let _e203 = local_7;
        local_11 = _e203;
    } else {
        let _e204 = a_2;
        let _e206 = a_2;
        if (_e204.y >= _e206.z) {
            let _e209 = d_3;
            if (_e209.y >= 0f) {
                local_8 = 2i;
            } else {
                local_8 = 3i;
            }
            let _e216 = local_8;
            local_10 = _e216;
        } else {
            let _e217 = d_3;
            if (_e217.z >= 0f) {
                local_9 = 4i;
            } else {
                local_9 = 5i;
            }
            let _e224 = local_9;
            local_10 = _e224;
        }
        let _e226 = local_10;
        local_11 = _e226;
    }
    let _e228 = local_11;
    f_3 = _e228;
    let _e230 = d_3;
    let _e231 = f_3;
    let _e235 = local_12[_e231];
    dn = dot(_e230, _e235);
    let _e238 = d_3;
    let _e239 = f_3;
    let _e243 = local_13[_e239];
    let _e245 = dn;
    let _e248 = d_3;
    let _e249 = f_3;
    let _e253 = local_14[_e249];
    let _e255 = dn;
    uv_5 = (((vec2<f32>(atan((dot(_e238, _e243) / _e245)), atan((dot(_e248, _e253) / _e255))) / vec2(0.785398f)) * 0.5f) + vec2(0.5f));
    let _e268 = uv_5;
    let _e269 = f_3;
    let _e273 = vec3<f32>(_e268.x, _e268.y, f32(_e269));
    let _e278 = textureSampleLevel(tHeightCubeTexture, tHeightCubeSampler, _e273.xy, i32(_e273.z), 0f);
    return _e278.x;
}

fn terrainShadow(pF_1: vec3<f32>, up: vec3<f32>, sF_2: vec3<f32>, R: f32) -> f32 {
    var pF_2: vec3<f32>;
    var up_1: vec3<f32>;
    var sF_3: vec3<f32>;
    var R_1: f32;
    var texel: f32;
    var top: f32;
    var r0_: f32;
    var below: f32;
    var o: vec3<f32>;
    var t_1: f32;
    var sh: f32 = 1f;
    var i_2: i32 = 0i;
    var qp: vec3<f32>;
    var rq: f32;
    var d_4: f32;

    pF_2 = pF_1;
    up_1 = up;
    sF_3 = sF_2;
    R_1 = R;
    let _e188 = global.uHeightCube;
    let _e192 = up_1;
    let _e193 = sF_3;
    if ((_e188.x < 0.5f) || (dot(_e192, _e193) < -0.2f)) {
        return 1f;
    }
    let _e200 = global.uHeightCube;
    texel = _e200.w;
    let _e203 = R_1;
    let _e204 = global.uHeightCube;
    top = (_e203 + _e204.z);
    let _e208 = pF_2;
    r0_ = length(_e208);
    let _e212 = R_1;
    let _e213 = up_1;
    let _e214 = heightCubeAt(_e213);
    let _e216 = r0_;
    below = max(0f, ((_e212 + _e214) - _e216));
    let _e220 = pF_2;
    let _e221 = up_1;
    let _e222 = texel;
    o = (_e220 + ((_e221 * _e222) * 0.1f));
    let _e228 = texel;
    t_1 = _e228;
    loop {
        let _e234 = i_2;
        if !((_e234 < 28i)) {
            break;
        }
        {
            let _e241 = o;
            let _e242 = sF_3;
            let _e243 = t_1;
            qp = (_e241 + (_e242 * _e243));
            let _e247 = qp;
            rq = length(_e247);
            let _e250 = rq;
            let _e251 = top;
            if (_e250 > _e251) {
                break;
            }
            let _e253 = rq;
            let _e254 = R_1;
            let _e255 = qp;
            let _e256 = rq;
            let _e259 = heightCubeAt((_e255 / vec3(_e256)));
            let _e262 = below;
            let _e263 = t_1;
            let _e266 = texel;
            d_4 = ((_e253 - (_e254 + _e259)) + (_e262 * exp((-(_e263) / (3f * _e266)))));
            let _e273 = sh;
            let _e274 = d_4;
            let _e275 = t_1;
            sh = min(_e273, clamp(((_e274 / (_e275 * 0.035f)) + 0.5f), 0f, 1f));
            let _e285 = sh;
            if (_e285 <= 0f) {
                break;
            }
            let _e288 = t_1;
            t_1 = (_e288 * 1.35f);
        }
        continuing {
            let _e238 = i_2;
            i_2 = (_e238 + 1i);
        }
    }
    let _e291 = sh;
    return _e291;
}

fn colourCubeK(dist: f32) -> f32 {
    var dist_1: f32;

    dist_1 = dist;
    let _e182 = global.uColourCube;
    let _e185 = global.uColourCube;
    let _e189 = global.uColourCube;
    let _e192 = dist_1;
    return (_e182.x * smoothstep((30f * _e185.z), (60f * _e189.z), _e192));
}

fn colourCubeShore(a_3: f32) -> f32 {
    var a_4: f32;

    a_4 = a_3;
    let _e182 = a_4;
    let _e189 = global.uColourCube;
    return ((((_e182 * 255f) - 128f) / 127f) * _e189.w);
}

fn colourCubeShoreV(a_5: f32) -> f32 {
    var a_6: f32;

    a_6 = a_5;
    let _e182 = a_6;
    let _e183 = colourCubeShore(_e182);
    return clamp((_e183 / 4f), -1f, 1f);
}

fn colourCubeAt(d_5: vec3<f32>) -> vec4<f32> {
    var d_6: vec3<f32>;
    var a_7: vec3<f32>;
    var N: vec3<f32>;
    var U_1: vec3<f32>;
    var V: vec3<f32>;
    var f_4: f32;
    var dn_1: f32;
    var uv_6: vec2<f32>;
    var h_1: vec2<f32>;

    d_6 = d_5;
    let _e182 = d_6;
    a_7 = abs(_e182);
    let _e189 = a_7;
    let _e191 = a_7;
    let _e194 = a_7;
    let _e196 = a_7;
    if ((_e189.x >= _e191.y) && (_e194.x >= _e196.z)) {
        {
            let _e200 = d_6;
            if (_e200.x >= 0f) {
                {
                    f_4 = 0f;
                    N = vec3<f32>(1f, 0f, 0f);
                    U_1 = vec3<f32>(0f, 0f, -1f);
                }
            } else {
                {
                    f_4 = 1f;
                    N = vec3<f32>(-1f, 0f, 0f);
                    U_1 = vec3<f32>(0f, 0f, 1f);
                }
            }
            V = vec3<f32>(0f, 1f, 0f);
        }
    } else {
        let _e228 = a_7;
        let _e230 = a_7;
        if (_e228.y >= _e230.z) {
            {
                U_1 = vec3<f32>(1f, 0f, 0f);
                let _e237 = d_6;
                if (_e237.y >= 0f) {
                    {
                        f_4 = 2f;
                        N = vec3<f32>(0f, 1f, 0f);
                        V = vec3<f32>(0f, 0f, -1f);
                    }
                } else {
                    {
                        f_4 = 3f;
                        N = vec3<f32>(0f, -1f, 0f);
                        V = vec3<f32>(0f, 0f, 1f);
                    }
                }
            }
        } else {
            {
                V = vec3<f32>(0f, 1f, 0f);
                let _e265 = d_6;
                if (_e265.z >= 0f) {
                    {
                        f_4 = 4f;
                        N = vec3<f32>(0f, 0f, 1f);
                        U_1 = vec3<f32>(1f, 0f, 0f);
                    }
                } else {
                    {
                        f_4 = 5f;
                        N = vec3<f32>(0f, 0f, -1f);
                        U_1 = vec3<f32>(-1f, 0f, 0f);
                    }
                }
            }
        }
    }
    let _e289 = d_6;
    let _e290 = N;
    dn_1 = dot(_e289, _e290);
    let _e293 = d_6;
    let _e294 = U_1;
    let _e296 = dn_1;
    let _e299 = d_6;
    let _e300 = V;
    let _e302 = dn_1;
    uv_6 = (((vec2<f32>(atan((dot(_e293, _e294) / _e296)), atan((dot(_e299, _e300) / _e302))) / vec2(0.7853982f)) * 0.5f) + vec2(0.5f));
    let _e316 = global.uColourCube;
    h_1 = vec2((0.5f / max(_e316.y, 1f)));
    let _e323 = uv_6;
    let _e324 = h_1;
    let _e326 = h_1;
    let _e329 = clamp(_e323, _e324, (vec2(1f) - _e326));
    let _e330 = f_4;
    let _e333 = vec3<f32>(_e329.x, _e329.y, _e330);
    let _e338 = textureSampleLevel(tColourCubeTexture, tColourCubeSampler, _e333.xy, i32(_e333.z), 0f);
    return _e338;
}

fn colourCubeShoreSmooth(d_7: vec3<f32>) -> f32 {
    var d_8: vec3<f32>;
    var a_8: vec3<f32>;
    var N_1: vec3<f32>;
    var U_2: vec3<f32>;
    var V_1: vec3<f32>;
    var f_5: f32;
    var dn_2: f32;
    var S: f32;
    var x_1: vec2<f32>;
    var i_3: vec2<f32>;
    var t_2: vec2<f32>;
    var t2_: vec2<f32>;
    var t3_: vec2<f32>;
    var w0_1: vec2<f32>;
    var w1_1: vec2<f32>;
    var w2_1: vec2<f32>;
    var w3_1: vec2<f32>;
    var g0_1: vec2<f32>;
    var g1_1: vec2<f32>;
    var h0_1: vec2<f32>;
    var h1_1: vec2<f32>;
    var e: vec2<f32>;
    var a00_: f32;
    var a10_: f32;
    var a01_: f32;
    var a11_: f32;

    d_8 = d_7;
    let _e182 = d_8;
    a_8 = abs(_e182);
    let _e189 = a_8;
    let _e191 = a_8;
    let _e194 = a_8;
    let _e196 = a_8;
    if ((_e189.x >= _e191.y) && (_e194.x >= _e196.z)) {
        {
            let _e200 = d_8;
            if (_e200.x >= 0f) {
                {
                    f_5 = 0f;
                    N_1 = vec3<f32>(1f, 0f, 0f);
                    U_2 = vec3<f32>(0f, 0f, -1f);
                }
            } else {
                {
                    f_5 = 1f;
                    N_1 = vec3<f32>(-1f, 0f, 0f);
                    U_2 = vec3<f32>(0f, 0f, 1f);
                }
            }
            V_1 = vec3<f32>(0f, 1f, 0f);
        }
    } else {
        let _e228 = a_8;
        let _e230 = a_8;
        if (_e228.y >= _e230.z) {
            {
                U_2 = vec3<f32>(1f, 0f, 0f);
                let _e237 = d_8;
                if (_e237.y >= 0f) {
                    {
                        f_5 = 2f;
                        N_1 = vec3<f32>(0f, 1f, 0f);
                        V_1 = vec3<f32>(0f, 0f, -1f);
                    }
                } else {
                    {
                        f_5 = 3f;
                        N_1 = vec3<f32>(0f, -1f, 0f);
                        V_1 = vec3<f32>(0f, 0f, 1f);
                    }
                }
            }
        } else {
            {
                V_1 = vec3<f32>(0f, 1f, 0f);
                let _e265 = d_8;
                if (_e265.z >= 0f) {
                    {
                        f_5 = 4f;
                        N_1 = vec3<f32>(0f, 0f, 1f);
                        U_2 = vec3<f32>(1f, 0f, 0f);
                    }
                } else {
                    {
                        f_5 = 5f;
                        N_1 = vec3<f32>(0f, 0f, -1f);
                        U_2 = vec3<f32>(-1f, 0f, 0f);
                    }
                }
            }
        }
    }
    let _e289 = d_8;
    let _e290 = N_1;
    dn_2 = dot(_e289, _e290);
    let _e293 = global.uColourCube;
    S = max(_e293.y, 1f);
    let _e298 = d_8;
    let _e299 = U_2;
    let _e301 = dn_2;
    let _e304 = d_8;
    let _e305 = V_1;
    let _e307 = dn_2;
    let _e319 = S;
    x_1 = (((((vec2<f32>(atan((dot(_e298, _e299) / _e301)), atan((dot(_e304, _e305) / _e307))) / vec2(0.7853982f)) * 0.5f) + vec2(0.5f)) * _e319) - vec2(0.5f));
    let _e325 = x_1;
    i_3 = floor(_e325);
    let _e328 = x_1;
    let _e329 = i_3;
    t_2 = (_e328 - _e329);
    let _e332 = t_2;
    let _e333 = t_2;
    t2_ = (_e332 * _e333);
    let _e336 = t2_;
    let _e337 = t_2;
    t3_ = (_e336 * _e337);
    let _e342 = t_2;
    let _e347 = t2_;
    let _e350 = t3_;
    w0_1 = ((((vec2(1f) - (3f * _e342)) + (3f * _e347)) - _e350) / vec2(6f));
    let _e358 = t2_;
    let _e363 = t3_;
    w1_1 = (((vec2(4f) - (6f * _e358)) + (3f * _e363)) / vec2(6f));
    let _e372 = t_2;
    let _e377 = t2_;
    let _e381 = t3_;
    w2_1 = ((((vec2(1f) + (3f * _e372)) + (3f * _e377)) - (3f * _e381)) / vec2(6f));
    let _e388 = t3_;
    w3_1 = (_e388 / vec2(6f));
    let _e393 = w0_1;
    let _e394 = w1_1;
    g0_1 = (_e393 + _e394);
    let _e397 = w2_1;
    let _e398 = w3_1;
    g1_1 = (_e397 + _e398);
    let _e401 = i_3;
    let _e405 = w1_1;
    let _e406 = g0_1;
    let _e409 = S;
    h0_1 = (((_e401 - vec2(0.5f)) + (_e405 / _e406)) / vec2(_e409));
    let _e413 = i_3;
    let _e417 = w3_1;
    let _e418 = g1_1;
    let _e421 = S;
    h1_1 = (((_e413 + vec2(1.5f)) + (_e417 / _e418)) / vec2(_e421));
    let _e426 = S;
    e = vec2((0.5f / _e426));
    let _e430 = h0_1;
    let _e432 = h0_1;
    let _e435 = e;
    let _e437 = e;
    let _e440 = clamp(vec2<f32>(_e430.x, _e432.y), _e435, (vec2(1f) - _e437));
    let _e441 = f_5;
    let _e444 = vec3<f32>(_e440.x, _e440.y, _e441);
    let _e449 = textureSampleLevel(tColourCubeTexture, tColourCubeSampler, _e444.xy, i32(_e444.z), 0f);
    a00_ = _e449.w;
    let _e452 = h1_1;
    let _e454 = h0_1;
    let _e457 = e;
    let _e459 = e;
    let _e462 = clamp(vec2<f32>(_e452.x, _e454.y), _e457, (vec2(1f) - _e459));
    let _e463 = f_5;
    let _e466 = vec3<f32>(_e462.x, _e462.y, _e463);
    let _e471 = textureSampleLevel(tColourCubeTexture, tColourCubeSampler, _e466.xy, i32(_e466.z), 0f);
    a10_ = _e471.w;
    let _e474 = h0_1;
    let _e476 = h1_1;
    let _e479 = e;
    let _e481 = e;
    let _e484 = clamp(vec2<f32>(_e474.x, _e476.y), _e479, (vec2(1f) - _e481));
    let _e485 = f_5;
    let _e488 = vec3<f32>(_e484.x, _e484.y, _e485);
    let _e493 = textureSampleLevel(tColourCubeTexture, tColourCubeSampler, _e488.xy, i32(_e488.z), 0f);
    a01_ = _e493.w;
    let _e496 = h1_1;
    let _e498 = h1_1;
    let _e501 = e;
    let _e503 = e;
    let _e506 = clamp(vec2<f32>(_e496.x, _e498.y), _e501, (vec2(1f) - _e503));
    let _e507 = f_5;
    let _e510 = vec3<f32>(_e506.x, _e506.y, _e507);
    let _e515 = textureSampleLevel(tColourCubeTexture, tColourCubeSampler, _e510.xy, i32(_e510.z), 0f);
    a11_ = _e515.w;
    let _e518 = g0_1;
    let _e520 = g0_1;
    let _e522 = a00_;
    let _e524 = g1_1;
    let _e526 = a10_;
    let _e530 = g1_1;
    let _e532 = g0_1;
    let _e534 = a01_;
    let _e536 = g1_1;
    let _e538 = a11_;
    let _e543 = colourCubeShore(((_e518.y * ((_e520.x * _e522) + (_e524.x * _e526))) + (_e530.y * ((_e532.x * _e534) + (_e536.x * _e538)))));
    return _e543;
}

fn sunShadowTap(org: vec2<i32>, n_4: i32, VP: mat4x4<f32>, L_2: vec4<f32>, wp: vec3<f32>, bias_4: f32) -> f32 {
    var org_1: vec2<i32>;
    var n_5: i32;
    var VP_1: mat4x4<f32>;
    var L_3: vec4<f32>;
    var wp_1: vec3<f32>;
    var bias_5: f32;
    var c_1: vec4<f32>;
    var uv_7: vec2<f32>;
    var d_9: f32;
    var sz_1: vec2<i32>;
    var st_1: vec2<f32>;
    var fr: vec2<f32>;
    var p0_: vec2<i32>;
    var cmp: array<f32, 16>;
    var j_2: i32 = 0i;
    var i_4: i32;
    var local_15: f32;
    var lit: f32 = 0f;
    var j_3: i32 = 0i;
    var i_5: i32;

    org_1 = org;
    n_5 = n_4;
    VP_1 = VP;
    L_3 = L_2;
    wp_1 = wp;
    bias_5 = bias_4;
    let _e192 = VP_1;
    let _e193 = wp_1;
    c_1 = (_e192 * vec4<f32>(_e193.x, _e193.y, _e193.z, 1f));
    let _e201 = c_1;
    let _e203 = c_1;
    uv_7 = (((_e201.xy / vec2(_e203.w)) * 0.5f) + vec2(0.5f));
    let _e213 = uv_7;
    let _e218 = uv_7;
    if (any((_e213 < vec2(0f))) || any((_e218 > vec2(1f)))) {
        return 1f;
    }
    let _e225 = L_3;
    let _e227 = wp_1;
    let _e229 = global.uSunShadowDir;
    let _e231 = bias_5;
    d_9 = (dot((_e225.xyz - _e227), _e229) - _e231);
    let _e234 = n_5;
    sz_1 = vec2(_e234);
    let _e237 = uv_7;
    let _e238 = sz_1;
    st_1 = ((_e237 * vec2<f32>(_e238)) - vec2(0.5f));
    let _e245 = st_1;
    fr = fract(_e245);
    let _e248 = st_1;
    p0_ = vec2<i32>(floor(_e248));
    loop {
        let _e255 = j_2;
        if !((_e255 < 4i)) {
            break;
        }
        i_4 = 0i;
        loop {
            let _e264 = i_4;
            if !((_e264 < 4i)) {
                break;
            }
            let _e271 = j_2;
            let _e274 = i_4;
            let _e277 = d_9;
            let _e278 = org_1;
            let _e279 = p0_;
            let _e280 = i_4;
            let _e283 = j_2;
            let _e290 = sz_1;
            let _e297 = textureLoad(tShadowAtlasTexture, (_e278 + clamp((_e279 + vec2<i32>((_e280 - 1i), (_e283 - 1i))), vec2(0i), (_e290 - vec2(1i)))), 0i);
            if (_e277 <= _e297.x) {
                local_15 = 1f;
            } else {
                local_15 = 0f;
            }
            let _e303 = local_15;
            cmp[((_e271 * 4i) + _e274)] = _e303;
            continuing {
                let _e268 = i_4;
                i_4 = (_e268 + 1i);
            }
        }
        continuing {
            let _e259 = j_2;
            j_2 = (_e259 + 1i);
        }
    }
    loop {
        let _e308 = j_3;
        if !((_e308 < 3i)) {
            break;
        }
        i_5 = 0i;
        loop {
            let _e317 = i_5;
            if !((_e317 < 3i)) {
                break;
            }
            let _e324 = lit;
            let _e325 = j_3;
            let _e328 = i_5;
            let _e331 = cmp[((_e325 * 4i) + _e328)];
            let _e332 = j_3;
            let _e335 = i_5;
            let _e340 = cmp[(((_e332 * 4i) + _e335) + 1i)];
            let _e341 = fr;
            let _e344 = j_3;
            let _e347 = i_5;
            let _e352 = cmp[(((_e344 * 4i) + _e347) + 4i)];
            let _e353 = j_3;
            let _e356 = i_5;
            let _e361 = cmp[(((_e353 * 4i) + _e356) + 5i)];
            let _e362 = fr;
            let _e365 = fr;
            lit = (_e324 + mix(mix(_e331, _e340, _e341.x), mix(_e352, _e361, _e362.x), _e365.y));
            continuing {
                let _e321 = i_5;
                i_5 = (_e321 + 1i);
            }
        }
        continuing {
            let _e312 = j_3;
            j_3 = (_e312 + 1i);
        }
    }
    let _e369 = lit;
    return (_e369 / 9f);
}

fn sunShadowMap(wp_2: vec3<f32>, N_2: vec3<f32>) -> f32 {
    var wp_3: vec3<f32>;
    var N_3: vec3<f32>;
    var dist_2: f32;
    var ndl: f32;
    var slope: f32;
    var s1_: f32;
    var sh_1: f32;
    var s0_: f32;

    wp_3 = wp_2;
    N_3 = N_2;
    let _e184 = global.uSunShadow;
    if (_e184.x < 0.5f) {
        return 1f;
    }
    let _e189 = wp_3;
    dist_2 = length(_e189);
    let _e192 = dist_2;
    let _e193 = global.uSunShadow;
    if (_e192 > _e193.z) {
        return 1f;
    }
    let _e197 = N_3;
    let _e198 = global.uSunShadowDir;
    ndl = max(dot(_e197, _e198), 0.05f);
    let _e204 = ndl;
    let _e205 = ndl;
    let _e209 = ndl;
    slope = (sqrt((1f - (_e204 * _e205))) / _e209);
    let _e216 = global.uSunShadowVP1_;
    let _e217 = global.uSunShadowL1_;
    let _e218 = wp_3;
    let _e219 = global.uSunShadowL1_;
    let _e222 = slope;
    let _e227 = sunShadowTap(vec2<i32>(2048i, 0i), 2048i, _e216, _e217, _e218, (_e219.w * (1.5f + min(_e222, 6f))));
    s1_ = _e227;
    let _e229 = s1_;
    let _e232 = global.uSunShadow;
    let _e235 = global.uSunShadow;
    let _e237 = dist_2;
    sh_1 = mix(_e229, 1f, smoothstep((0.85f * _e232.z), _e235.z, _e237));
    let _e241 = dist_2;
    let _e242 = global.uSunShadow;
    if (_e241 < _e242.y) {
        {
            let _e249 = global.uSunShadowVP0_;
            let _e250 = global.uSunShadowL0_;
            let _e251 = wp_3;
            let _e252 = global.uSunShadowL0_;
            let _e255 = slope;
            let _e260 = sunShadowTap(vec2<i32>(0i, 0i), 2048i, _e249, _e250, _e251, (_e252.w * (1.5f + min(_e255, 6f))));
            s0_ = _e260;
            let _e262 = s0_;
            let _e263 = sh_1;
            let _e265 = global.uSunShadow;
            let _e268 = global.uSunShadow;
            let _e270 = dist_2;
            sh_1 = mix(_e262, _e263, smoothstep((0.75f * _e265.y), _e268.y, _e270));
        }
    }
    let _e273 = sh_1;
    return _e273;
}

fn windSense(upF_1: vec3<f32>) -> f32 {
    var upF_2: vec3<f32>;
    var al: f32;

    upF_2 = upF_1;
    let _e182 = upF_2;
    al = abs(asin(clamp(_e182.y, -1f, 1f)));
    let _e196 = al;
    let _e203 = al;
    return ((-1f + (2f * smoothstep(0.49f, 0.55f, _e196))) - (2f * smoothstep(1.02f, 1.08f, _e203)));
}

fn surfSea(U_3: f32, g_3: f32) -> vec4<f32> {
    var U_4: f32;
    var g_4: f32;
    var H0_: f32;
    var T_3: f32;
    var w_1: f32;

    U_4 = U_3;
    g_4 = g_3;
    let _e185 = U_4;
    let _e187 = U_4;
    let _e189 = g_4;
    H0_ = (((0.21f * _e185) * _e187) / _e189);
    let _e193 = U_4;
    let _e195 = g_4;
    T_3 = clamp(((10f * _e193) / _e195), 3f, 16f);
    let _e202 = T_3;
    w_1 = (6.2832f / _e202);
    let _e205 = H0_;
    let _e206 = T_3;
    let _e207 = w_1;
    let _e208 = g_4;
    let _e209 = T_3;
    let _e211 = T_3;
    return vec4<f32>(_e205, _e206, _e207, (((_e208 * _e209) * _e211) / 6.2832f));
}

fn surfLag(fp: vec3<f32>) -> f32 {
    var fp_1: vec3<f32>;
    var q_3: f32 = 0.001533981f;

    fp_1 = fp;
    let _e185 = fp_1;
    let _e191 = q_3;
    let _e197 = fp_1;
    let _e203 = q_3;
    return ((2f * sin(dot(_e185, (vec3<f32>(13f, 7f, -9f) * _e191)))) + (1.3f * sin((dot(_e197, (vec3<f32>(-5f, 11f, 8f) * _e203)) + 1.7f))));
}

fn surfOut(h_2: f32, x_2: f32) -> f32 {
    var h_3: f32;
    var x_3: f32;
    var xd: f32;
    var local_16: f32;

    h_3 = h_2;
    x_3 = x_2;
    let _e185 = h_3;
    xd = pow((max(_e185, 0f) / SURF_A), 1.5f);
    let _e192 = x_3;
    let _e195 = global.uColourCube;
    if ((_e192 < 0f) && (_e195.x < 0.5f)) {
        let _e200 = xd;
        local_16 = _e200;
    } else {
        let _e201 = xd;
        let _e202 = x_3;
        let _e207 = xd;
        let _e208 = x_3;
        local_16 = mix(_e201, max(_e202, 0f), smoothstep(150f, 300f, max(_e207, _e208)));
    }
    let _e213 = local_16;
    return _e213;
}

fn surfPhase(fp_2: vec3<f32>, xo: f32, sea: vec4<f32>, g_5: f32, t_3: f32) -> f32 {
    var fp_3: vec3<f32>;
    var xo_1: f32;
    var sea_1: vec4<f32>;
    var g_6: f32;
    var t_4: f32;

    fp_3 = fp_2;
    xo_1 = xo;
    sea_1 = sea;
    g_6 = g_5;
    t_4 = t_3;
    let _e191 = sea_1;
    let _e193 = t_4;
    let _e195 = xo_1;
    let _e201 = g_6;
    let _e207 = fp_3;
    let _e208 = surfLag(_e207);
    return ((_e191.z * (_e193 + ((1.5f * pow(max(_e195, 0f), 0.6667f)) / sqrt((_e201 * SURF_A))))) + _e208);
}

fn surfRate(xo_2: f32, sea_2: vec4<f32>, g_7: f32) -> f32 {
    var xo_3: f32;
    var sea_3: vec4<f32>;
    var g_8: f32;

    xo_3 = xo_2;
    sea_3 = sea_2;
    g_8 = g_7;
    let _e187 = sea_3;
    let _e189 = g_8;
    let _e191 = xo_3;
    return (_e187.z / sqrt(((_e189 * SURF_A) * pow(max(_e191, 2f), 0.6667f))));
}

fn surfWave(n_6: f32) -> f32 {
    var n_7: f32;

    n_7 = n_6;
    let _e187 = n_7;
    let _e196 = n_7;
    return ((0.5f + (0.35f * (0.5f + (0.5f * sin((_e187 * 0.8976f)))))) + (0.3f * fract((sin(((_e196 * 12.9898f) + 4.1414f)) * 43758.547f))));
}

fn surfAt(h_4: f32, ph_1: f32, sea_4: vec4<f32>, fw: f32) -> vec4<f32> {
    var h_5: f32;
    var ph_2: f32;
    var sea_5: vec4<f32>;
    var fw_1: f32;
    var n_8: f32;
    var p: f32;
    var local_17: f32;
    var hw: f32;
    var hd: f32;
    var Hs: f32;
    var hb: f32;
    var H_1: f32;
    var br: f32;
    var c_2: f32;
    var eU: f32;
    var dU: f32;
    var local_18: f32;
    var back: f32;
    var local_19: f32;
    var dback: f32;
    var eB: f32;
    var dB: f32;
    var local_20: f32;
    var foam: f32;

    h_5 = h_4;
    ph_2 = ph_1;
    sea_5 = sea_4;
    fw_1 = fw;
    let _e189 = ph_2;
    n_8 = floor((_e189 / 6.2832f));
    let _e194 = ph_2;
    let _e197 = n_8;
    p = ((_e194 / 6.2832f) - _e197);
    let _e200 = sea_5;
    let _e202 = p;
    let _e204 = fw_1;
    if (_e202 > (1f - _e204)) {
        let _e207 = n_8;
        let _e210 = surfWave((_e207 + 1f));
        local_17 = _e210;
    } else {
        let _e211 = n_8;
        let _e212 = surfWave(_e211);
        local_17 = _e212;
    }
    let _e214 = local_17;
    hw = (_e200.x * _e214);
    let _e218 = sea_5;
    hd = (0.1f * _e218.w);
    let _e222 = hw;
    let _e224 = hd;
    let _e225 = h_5;
    Hs = (_e222 * max(1f, pow((_e224 / max(_e225, 0.05f)), 0.25f)));
    let _e234 = hw;
    let _e235 = hd;
    hb = pow(((_e234 * pow(_e235, 0.25f)) / 0.78f), 0.8f);
    let _e244 = Hs;
    let _e246 = h_5;
    H_1 = min(_e244, (0.78f * max(_e246, 0f)));
    let _e253 = hb;
    let _e256 = hb;
    let _e258 = h_5;
    br = smoothstep((1.25f * _e253), (0.85f * _e256), _e258);
    let _e264 = p;
    c_2 = (0.5f + (0.5f * cos((6.2832f * _e264))));
    let _e270 = H_1;
    let _e271 = c_2;
    let _e272 = c_2;
    eU = (_e270 * ((_e271 * _e272) - 0.375f));
    let _e278 = H_1;
    let _e281 = c_2;
    let _e286 = p;
    dU = ((_e278 * ((((-2f * _e281) * 0.5f) * sin((6.2832f * _e286))) * 6.2832f)) / 6.2832f);
    let _e296 = p;
    let _e298 = fw_1;
    if (_e296 < (1f - _e298)) {
        let _e302 = p;
        let _e304 = fw_1;
        local_18 = pow((1f - (_e302 / (1f - _e304))), 1.5f);
    } else {
        let _e311 = fw_1;
        let _e314 = p;
        local_18 = smoothstep((1f - _e311), 1f, _e314);
    }
    let _e317 = local_18;
    back = _e317;
    let _e319 = p;
    let _e321 = fw_1;
    if (_e319 < (1f - _e321)) {
        let _e327 = fw_1;
        let _e331 = p;
        let _e333 = fw_1;
        local_19 = ((-1.5f / (1f - _e327)) * pow(max((1f - (_e331 / (1f - _e333))), 0f), 0.5f));
    } else {
        let _e343 = p;
        let _e346 = fw_1;
        let _e350 = p;
        let _e353 = fw_1;
        let _e354 = fw_1;
        let _e356 = fw_1;
        local_19 = (((6f * ((_e343 - 1f) + _e346)) * (1f - _e350)) / ((_e353 * _e354) * _e356));
    }
    let _e360 = local_19;
    dback = _e360;
    let _e362 = H_1;
    let _e363 = back;
    eB = (_e362 * (_e363 - 0.3f));
    let _e368 = H_1;
    let _e369 = dback;
    dB = ((_e368 * _e369) / 6.2832f);
    let _e374 = br;
    let _e375 = p;
    let _e377 = fw_1;
    if (_e375 > (1f - _e377)) {
        let _e381 = fw_1;
        let _e384 = p;
        local_20 = smoothstep((1f - _e381), 1f, _e384);
    } else {
        let _e386 = p;
        local_20 = exp((-(_e386) / 0.2f));
    }
    let _e392 = local_20;
    foam = (_e374 * _e392);
    let _e395 = eU;
    let _e396 = eB;
    let _e397 = br;
    let _e399 = dU;
    let _e400 = dB;
    let _e401 = br;
    let _e403 = foam;
    let _e404 = br;
    return vec4<f32>(mix(_e395, _e396, _e397), mix(_e399, _e400, _e401), _e403, _e404);
}

fn surfNoise(p_1: vec3<f32>, n_9: vec3<f32>, period: f32, foot_8: f32) -> vec4<f32> {
    var p_2: vec3<f32>;
    var n_10: vec3<f32>;
    var period_1: f32;
    var foot_9: f32;
    var w_2: vec3<f32>;
    var l: f32;

    p_2 = p_1;
    n_10 = n_9;
    period_1 = period;
    foot_9 = foot_8;
    let _e189 = n_10;
    w_2 = pow(abs(_e189), vec3(4f));
    let _e195 = w_2;
    let _e196 = w_2;
    let _e198 = w_2;
    let _e201 = w_2;
    w_2 = (_e195 / vec3(((_e196.x + _e198.y) + _e201.z)));
    let _e206 = foot_9;
    let _e209 = period_1;
    l = log2(max(((_e206 * 256f) / _e209), 1f));
    let _e215 = p_2;
    let _e217 = period_1;
    let _e220 = l;
    let _e221 = textureSampleLevel(tDetailTexture, tDetailSampler, (_e215.yz / vec2(_e217)), _e220);
    let _e222 = w_2;
    let _e225 = p_2;
    let _e227 = period_1;
    let _e233 = l;
    let _e234 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e225.zx / vec2(_e227)) + vec2(0.37f)), _e233);
    let _e235 = w_2;
    let _e239 = p_2;
    let _e241 = period_1;
    let _e247 = l;
    let _e248 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e239.xy / vec2(_e241)) + vec2(0.71f)), _e247);
    let _e249 = w_2;
    return (((_e221 * _e222.x) + (_e234 * _e235.y)) + (_e248 * _e249.z));
}

fn liquidWaves(fp_4: vec3<f32>, n_11: vec3<f32>, wd: vec3<f32>, lmax: f32, river: bool, foot_10: f32, warp: vec3<f32>, grp: vec4<f32>) -> Waves {
    var fp_5: vec3<f32>;
    var n_12: vec3<f32>;
    var wd_1: vec3<f32>;
    var lmax_1: f32;
    var river_1: bool;
    var foot_11: f32;
    var warp_1: vec3<f32>;
    var grp_1: vec4<f32>;
    var W: Waves = Waves(vec3(0f), 0f, 0f, 0f, 0f);
    var rv: f32 = 0f;
    var i_6: i32 = 0i;
    var K: vec4<f32>;
    var kk: f32;
    var lam: f32;
    var fk: f32;
    var kt: vec3<f32>;
    var ktl: f32;
    var kd: vec3<f32>;
    var local_21: f32;
    var dirW: f32;
    var wt0_: f32;
    var wt: f32;
    var res: f32;
    var ph_3: f32;
    var Ke: vec3<f32>;
    var env: f32;

    fp_5 = fp_4;
    n_12 = n_11;
    wd_1 = wd;
    lmax_1 = lmax;
    river_1 = river;
    foot_11 = foot_10;
    warp_1 = warp;
    grp_1 = grp;
    loop {
        let _e209 = i_6;
        if !((_e209 < 36i)) {
            break;
        }
        {
            let _e216 = i_6;
            let _e218 = global.uWaveK[_e216];
            K = _e218;
            let _e220 = K;
            kk = length(_e220.xyz);
            let _e225 = kk;
            lam = (6.2832f / _e225);
            let _e229 = lmax_1;
            let _e232 = lmax_1;
            let _e235 = lam;
            let _e239 = global.uLiquid;
            let _e243 = global.uLiquid;
            let _e247 = lam;
            fk = ((1f - smoothstep((_e229 * 0.7f), (_e232 * 1.3f), _e235)) * (1f - smoothstep((_e239.w * 1.2f), (_e243.w * 2.2f), _e247)));
            let _e252 = fk;
            if (_e252 <= 0f) {
                continue;
            }
            let _e255 = K;
            let _e257 = n_12;
            let _e258 = K;
            let _e260 = n_12;
            kt = (_e255.xyz - (_e257 * dot(_e258.xyz, _e260)));
            let _e265 = kt;
            ktl = length(_e265);
            let _e268 = ktl;
            if (_e268 < 0.000001f) {
                continue;
            }
            let _e271 = kt;
            let _e272 = ktl;
            kd = (_e271 / vec3(_e272));
            let _e276 = river_1;
            if _e276 {
                local_21 = 1f;
            } else {
                let _e280 = kd;
                let _e281 = wd_1;
                local_21 = (0.2f + (1.2f * pow(max(dot(_e280, _e281), 0f), 2f)));
            }
            let _e290 = local_21;
            dirW = _e290;
            let _e292 = fk;
            let _e293 = dirW;
            let _e295 = ktl;
            let _e296 = kk;
            wt0_ = ((_e292 * _e293) * (_e295 / _e296));
            let _e300 = wt0_;
            let _e303 = i_6;
            let _e309 = grp_1[((_e303 / 3i) & 3i)];
            wt = (_e300 * (0.3f + (1.4f * _e309)));
            let _e315 = foot_11;
            let _e318 = foot_11;
            let _e320 = lam;
            res = smoothstep((2f * _e315), (6f * _e318), _e320);
            let _e323 = K;
            let _e325 = fp_5;
            let _e326 = warp_1;
            let _e329 = K;
            ph_3 = (dot(_e323.xyz, (_e325 + _e326)) - _e329.w);
            let _e333 = K;
            Ke = (floor(((_e333.yzx * 228.1645f) + vec3(0.5f))) * 0.001533981f);
            let _e348 = Ke;
            let _e349 = fp_5;
            let _e350 = warp_1;
            let _e354 = K;
            let _e358 = i_6;
            env = (0.6f + (0.4f * sin(((dot(_e348, (_e349 + _e350)) - (0.17f * _e354.w)) + (f32(_e358) * 1.7f)))));
            let _e368 = W;
            let _e370 = kd;
            let _e371 = wt;
            let _e372 = res;
            let _e374 = env;
            let _e376 = ph_3;
            W.g = (_e368.g + (_e370 * (((_e371 * _e372) * _e374) * cos(_e376))));
            let _e382 = W;
            let _e384 = wt;
            let _e385 = wt;
            W.var_ = (_e382.var_ + ((_e384 * _e385) * 0.22f));
            let _e391 = W;
            let _e393 = wt0_;
            let _e394 = wt0_;
            W.var0_ = (_e391.var0_ + ((_e393 * _e394) * 0.22f));
            let _e400 = W;
            let _e402 = wt;
            let _e403 = wt;
            let _e407 = res;
            W.res = (_e400.res + (((_e402 * _e403) * 0.22f) * _e407));
            let _e411 = W;
            let _e413 = wt;
            let _e414 = res;
            let _e416 = env;
            let _e418 = ph_3;
            W.crest = (_e411.crest + (((_e413 * _e414) * _e416) * sin(_e418)));
            let _e422 = rv;
            let _e423 = wt;
            let _e424 = wt;
            let _e428 = res;
            let _e430 = res;
            rv = (_e422 + ((((_e423 * _e424) * 0.22f) * _e428) * _e430));
        }
        continuing {
            let _e213 = i_6;
            i_6 = (_e213 + 1i);
        }
    }
    let _e434 = W;
    let _e436 = rv;
    W.crest = (_e434.crest / sqrt(max(_e436, 0.000000001f)));
    let _e441 = W;
    return _e441;
}

fn liqHash(c_3: vec2<f32>) -> f32 {
    var c_4: vec2<f32>;
    var q_4: vec2<u32>;
    var h_6: u32;

    c_4 = c_3;
    let _e183 = c_4;
    q_4 = vec2<u32>((vec2<i32>(_e183) + vec2(1048576i)));
    let _e190 = q_4;
    let _e194 = q_4;
    h_6 = ((_e190.x * 1597334677u) ^ (_e194.y * 3812015801u));
    let _e200 = h_6;
    h_6 = ((_e200 * 747796405u) + 2891336453u);
    let _e205 = h_6;
    let _e206 = h_6;
    h_6 = (_e205 ^ (_e206 >> 16u));
    let _e211 = h_6;
    h_6 = (_e211 * 2246822519u);
    let _e214 = h_6;
    let _e215 = h_6;
    h_6 = (_e214 ^ (_e215 >> 13u));
    let _e220 = h_6;
    return ((f32((_e220 & 7u)) * 0.7854f) + 0.3927f);
}

fn rippleNoise(p_3: vec2<f32>, per: f32) -> vec3<f32> {
    var p_4: vec2<f32>;
    var per_1: f32;
    var i_7: vec2<f32>;
    var f_6: vec2<f32>;
    var i1_: vec2<f32>;
    var u_1: vec2<f32>;
    var du: vec2<f32>;
    var ha: f32;
    var hb_1: f32;
    var hc_1: f32;
    var hd_1: f32;
    var ga: vec2<f32>;
    var gb: vec2<f32>;
    var gc: vec2<f32>;
    var gd: vec2<f32>;
    var va: f32;
    var vb: f32;
    var vc: f32;
    var vd: f32;
    var k: f32;

    p_4 = p_3;
    per_1 = per;
    let _e185 = p_4;
    i_7 = floor(_e185);
    let _e188 = p_4;
    let _e189 = i_7;
    f_6 = (_e188 - _e189);
    let _e192 = i_7;
    let _e195 = (_e192 + vec2(1f));
    let _e196 = per_1;
    let _e197 = vec2(_e196);
    i1_ = (_e195 - (floor((_e195 / _e197)) * _e197));
    let _e203 = i_7;
    let _e204 = per_1;
    let _e205 = vec2(_e204);
    i_7 = (_e203 - (floor((_e203 / _e205)) * _e205));
    let _e210 = f_6;
    let _e211 = f_6;
    let _e213 = f_6;
    let _e215 = f_6;
    let _e216 = f_6;
    u_1 = (((_e210 * _e211) * _e213) * ((_e215 * ((_e216 * 6f) - vec2(15f))) + vec2(10f)));
    let _e229 = f_6;
    let _e231 = f_6;
    let _e233 = f_6;
    let _e234 = f_6;
    du = (((30f * _e229) * _e231) * ((_e233 * (_e234 - vec2(2f))) + vec2(1f)));
    let _e244 = i_7;
    let _e245 = liqHash(_e244);
    ha = _e245;
    let _e247 = i1_;
    let _e249 = i_7;
    let _e252 = liqHash(vec2<f32>(_e247.x, _e249.y));
    hb_1 = _e252;
    let _e254 = i_7;
    let _e256 = i1_;
    let _e259 = liqHash(vec2<f32>(_e254.x, _e256.y));
    hc_1 = _e259;
    let _e261 = i1_;
    let _e262 = liqHash(_e261);
    hd_1 = _e262;
    let _e264 = ha;
    let _e266 = ha;
    ga = vec2<f32>(cos(_e264), sin(_e266));
    let _e270 = hb_1;
    let _e272 = hb_1;
    gb = vec2<f32>(cos(_e270), sin(_e272));
    let _e276 = hc_1;
    let _e278 = hc_1;
    gc = vec2<f32>(cos(_e276), sin(_e278));
    let _e282 = hd_1;
    let _e284 = hd_1;
    gd = vec2<f32>(cos(_e282), sin(_e284));
    let _e288 = ga;
    let _e289 = f_6;
    va = dot(_e288, _e289);
    let _e292 = gb;
    let _e293 = f_6;
    vb = dot(_e292, (_e293 - vec2<f32>(1f, 0f)));
    let _e300 = gc;
    let _e301 = f_6;
    vc = dot(_e300, (_e301 - vec2<f32>(0f, 1f)));
    let _e308 = gd;
    let _e309 = f_6;
    vd = dot(_e308, (_e309 - vec2(1f)));
    let _e315 = va;
    let _e316 = vb;
    let _e318 = vc;
    let _e320 = vd;
    k = (((_e315 - _e316) - _e318) + _e320);
    let _e323 = va;
    let _e324 = u_1;
    let _e326 = vb;
    let _e327 = va;
    let _e331 = u_1;
    let _e333 = vc;
    let _e334 = va;
    let _e338 = u_1;
    let _e340 = u_1;
    let _e343 = k;
    let _e346 = ga;
    let _e347 = u_1;
    let _e349 = gb;
    let _e350 = ga;
    let _e354 = u_1;
    let _e356 = gc;
    let _e357 = ga;
    let _e361 = u_1;
    let _e363 = u_1;
    let _e366 = ga;
    let _e367 = gb;
    let _e369 = gc;
    let _e371 = gd;
    let _e375 = du;
    let _e376 = u_1;
    let _e378 = k;
    let _e380 = vb;
    let _e381 = vc;
    let _e384 = va;
    let _e388 = ((((_e346 + (_e347.x * (_e349 - _e350))) + (_e354.y * (_e356 - _e357))) + ((_e361.x * _e363.y) * (((_e366 - _e367) - _e369) + _e371))) + (_e375 * (((_e376.yx * _e378) + vec2<f32>(_e380, _e381)) - vec2(_e384))));
    return vec3<f32>((((_e323 + (_e324.x * (_e326 - _e327))) + (_e331.y * (_e333 - _e334))) + ((_e338.x * _e340.y) * _e343)), _e388.x, _e388.y);
}

fn rippleAxis(a_9: i32, p_5: vec3<f32>, L_4: f32, o_1: f32) -> vec3<f32> {
    var a_10: i32;
    var p_6: vec3<f32>;
    var L_5: f32;
    var o_2: f32;
    var local_22: vec2<f32>;
    var local_23: vec2<f32>;
    var uv_8: vec2<f32>;
    var r_8: vec3<f32>;

    a_10 = a_9;
    p_6 = p_5;
    L_5 = L_4;
    o_2 = o_1;
    let _e189 = a_10;
    if (_e189 == 0i) {
        let _e192 = p_6;
        local_23 = _e192.zy;
    } else {
        let _e194 = a_10;
        if (_e194 == 1i) {
            let _e197 = p_6;
            local_22 = _e197.xz;
        } else {
            let _e199 = p_6;
            local_22 = _e199.xy;
        }
        let _e202 = local_22;
        local_23 = _e202;
    }
    let _e204 = local_23;
    uv_8 = _e204;
    let _e206 = uv_8;
    let _e207 = L_5;
    let _e210 = o_2;
    let _e214 = L_5;
    let _e216 = rippleNoise(((_e206 / vec2(_e207)) + vec2(_e210)), (4096f / _e214));
    r_8 = _e216;
    let _e218 = r_8;
    let _e220 = r_8;
    let _e221 = _e220.yz;
    return vec3<f32>(_e218.x, _e221.x, _e221.y);
}

fn riverRipples(fp_6: vec3<f32>, n_13: vec3<f32>, lmax_2: f32, foot_12: f32) -> Waves {
    var fp_7: vec3<f32>;
    var n_14: vec3<f32>;
    var lmax_3: f32;
    var foot_13: f32;
    var W_1: Waves = Waves(vec3(0f), 0f, 0f, 0f, 0f);
    var an: vec3<f32>;
    var local_24: i32;
    var local_25: i32;
    var ma: i32;
    var local_26: i32;
    var local_27: i32;
    var mi: i32;
    var me: i32;
    var local_28: f32;
    var local_29: f32;
    var w0_2: f32;
    var local_30: f32;
    var local_31: f32;
    var w1_2: f32;
    var bw: vec2<f32>;
    var local_32: vec2<f32>;
    var rv_1: f32 = 0f;
    var cr: f32 = 0f;
    var o_3: i32 = 0i;
    var L_6: f32;
    var fk_1: f32;
    var res_1: f32;
    var g_9: vec3<f32>;
    var v: f32;
    var k_1: i32;
    var local_33: i32;
    var a_11: i32;
    var local_34: f32;
    var bwk: f32;
    var r_9: vec3<f32>;
    var local_35: vec3<f32>;
    var local_36: vec3<f32>;

    fp_7 = fp_6;
    n_14 = n_13;
    lmax_3 = lmax_2;
    foot_13 = foot_12;
    let _e197 = n_14;
    an = abs(_e197);
    let _e200 = an;
    let _e202 = an;
    let _e205 = an;
    let _e207 = an;
    if ((_e200.x > _e202.y) && (_e205.x > _e207.z)) {
        local_25 = 0i;
    } else {
        let _e212 = an;
        let _e214 = an;
        if (_e212.y > _e214.z) {
            local_24 = 1i;
        } else {
            local_24 = 2i;
        }
        let _e220 = local_24;
        local_25 = _e220;
    }
    let _e222 = local_25;
    ma = _e222;
    let _e224 = an;
    let _e226 = an;
    let _e229 = an;
    let _e231 = an;
    if ((_e224.x < _e226.y) && (_e229.x < _e231.z)) {
        local_27 = 0i;
    } else {
        let _e236 = an;
        let _e238 = an;
        if (_e236.y < _e238.z) {
            local_26 = 1i;
        } else {
            local_26 = 2i;
        }
        let _e244 = local_26;
        local_27 = _e244;
    }
    let _e246 = local_27;
    mi = _e246;
    let _e249 = mi;
    let _e251 = ma;
    me = ((3i - _e249) - _e251);
    let _e254 = ma;
    if (_e254 == 0i) {
        let _e257 = an;
        local_29 = _e257.x;
    } else {
        let _e259 = ma;
        if (_e259 == 1i) {
            let _e262 = an;
            local_28 = _e262.y;
        } else {
            let _e264 = an;
            local_28 = _e264.z;
        }
        let _e267 = local_28;
        local_29 = _e267;
    }
    let _e269 = local_29;
    w0_2 = _e269;
    let _e271 = me;
    if (_e271 == 0i) {
        let _e274 = an;
        local_31 = _e274.x;
    } else {
        let _e276 = me;
        if (_e276 == 1i) {
            let _e279 = an;
            local_30 = _e279.y;
        } else {
            let _e281 = an;
            local_30 = _e281.z;
        }
        let _e284 = local_30;
        local_31 = _e284;
    }
    let _e286 = local_31;
    w1_2 = _e286;
    let _e288 = w0_2;
    let _e289 = w1_2;
    bw = clamp(((vec2<f32>(_e288, _e289) - vec2(0.5773f)) / vec2(0.4227f)), vec2(0f), vec2(1f));
    let _e305 = bw;
    let _e307 = bw;
    if ((_e305.x + _e307.y) < 0.0001f) {
        local_32 = vec2<f32>(1f, 0f);
    } else {
        let _e315 = bw;
        let _e316 = bw;
        let _e318 = bw;
        local_32 = (_e315 / vec2((_e316.x + _e318.y)));
    }
    let _e324 = local_32;
    bw = _e324;
    let _e325 = bw;
    if (_e325.y < 0.02f) {
        bw = vec2<f32>(1f, 0f);
    }
    loop {
        let _e338 = o_3;
        if !((_e338 < 4i)) {
            break;
        }
        {
            let _e346 = o_3;
            L_6 = (0.25f * exp2(f32(_e346)));
            let _e352 = lmax_3;
            let _e355 = lmax_3;
            let _e358 = L_6;
            fk_1 = (1f - smoothstep((_e352 * 0.3f), (_e355 * 0.6f), _e358));
            let _e362 = fk_1;
            if (_e362 <= 0f) {
                continue;
            }
            let _e365 = foot_13;
            let _e367 = foot_13;
            let _e369 = L_6;
            res_1 = smoothstep(_e365, (3f * _e367), _e369);
            g_9 = vec3(0f);
            v = 0f;
            k_1 = 0i;
            loop {
                let _e379 = k_1;
                if !((_e379 < 2i)) {
                    break;
                }
                {
                    let _e386 = k_1;
                    if (_e386 == 0i) {
                        let _e389 = ma;
                        local_33 = _e389;
                    } else {
                        let _e390 = me;
                        local_33 = _e390;
                    }
                    let _e392 = local_33;
                    a_11 = _e392;
                    let _e394 = k_1;
                    if (_e394 == 0i) {
                        let _e397 = bw;
                        local_34 = _e397.x;
                    } else {
                        let _e399 = bw;
                        local_34 = _e399.y;
                    }
                    let _e402 = local_34;
                    bwk = _e402;
                    let _e404 = bwk;
                    if (_e404 <= 0f) {
                        continue;
                    }
                    let _e407 = a_11;
                    let _e408 = fp_7;
                    let _e409 = L_6;
                    let _e410 = o_3;
                    let _e414 = rippleAxis(_e407, _e408, _e409, (f32(_e410) * 17.31f));
                    r_9 = _e414;
                    let _e416 = g_9;
                    let _e417 = bwk;
                    let _e418 = a_11;
                    if (_e418 == 0i) {
                        let _e422 = r_9;
                        let _e424 = r_9;
                        local_36 = vec3<f32>(0f, _e422.z, _e424.y);
                    } else {
                        let _e427 = a_11;
                        if (_e427 == 1i) {
                            let _e430 = r_9;
                            let _e433 = r_9;
                            local_35 = vec3<f32>(_e430.y, 0f, _e433.z);
                        } else {
                            let _e436 = r_9;
                            let _e438 = r_9;
                            local_35 = vec3<f32>(_e436.y, _e438.z, 0f);
                        }
                        let _e443 = local_35;
                        local_36 = _e443;
                    }
                    let _e445 = local_36;
                    g_9 = (_e416 + (_e417 * _e445));
                    let _e448 = v;
                    let _e449 = bwk;
                    let _e450 = r_9;
                    v = (_e448 + (_e449 * _e450.x));
                }
                continuing {
                    let _e383 = k_1;
                    k_1 = (_e383 + 1i);
                }
            }
            let _e454 = g_9;
            let _e455 = n_14;
            let _e456 = g_9;
            let _e457 = n_14;
            g_9 = (_e454 - (_e455 * dot(_e456, _e457)));
            let _e462 = W_1;
            let _e464 = g_9;
            let _e465 = fk_1;
            let _e466 = res_1;
            W_1.g = (_e462.g + (_e464 * (_e465 * _e466)));
            let _e471 = W_1;
            let _e473 = fk_1;
            let _e474 = fk_1;
            W_1.var_ = (_e471.var_ + ((_e473 * _e474) * 0.78f));
            let _e480 = W_1;
            let _e482 = fk_1;
            let _e483 = fk_1;
            let _e487 = res_1;
            W_1.res = (_e480.res + (((_e482 * _e483) * 0.78f) * _e487));
            let _e491 = W_1;
            let _e493 = fk_1;
            let _e494 = res_1;
            let _e496 = v;
            W_1.crest = (_e491.crest + (((_e493 * _e494) * _e496) / 0.216f));
            let _e501 = rv_1;
            let _e502 = fk_1;
            let _e503 = fk_1;
            let _e505 = res_1;
            let _e507 = res_1;
            rv_1 = (_e501 + (((_e502 * _e503) * _e505) * _e507));
        }
        continuing {
            let _e342 = o_3;
            o_3 = (_e342 + 1i);
        }
    }
    let _e511 = W_1;
    W_1.var0_ = _e511.var_;
    let _e514 = W_1;
    let _e516 = rv_1;
    W_1.crest = (_e514.crest / sqrt(max(_e516, 0.000000001f)));
    let _e521 = W_1;
    return _e521;
}

fn liquidSurface(fp_8: vec3<f32>, n_15: vec3<f32>, upF_3: vec3<f32>, kind: f32, flow: f32, fetch: f32, depth: f32, foot_14: f32, wn: vec2<f32>, grp_2: vec4<f32>, fdir: vec3<f32>, fv: f32, gradH: vec3<f32>, shoreX: f32, gradX: vec3<f32>, nF: ptr<function, vec3<f32>>, rough: ptr<function, f32>, foam_1: ptr<function, f32>) {
    var fp_9: vec3<f32>;
    var n_16: vec3<f32>;
    var upF_4: vec3<f32>;
    var kind_1: f32;
    var flow_1: f32;
    var fetch_1: f32;
    var depth_1: f32;
    var foot_15: f32;
    var wn_1: vec2<f32>;
    var grp_3: vec4<f32>;
    var fdir_1: vec3<f32>;
    var fv_1: f32;
    var gradH_1: vec3<f32>;
    var shoreX_1: f32;
    var gradX_1: vec3<f32>;
    var al_1: f32;
    var toward: f32;
    var local_37: f32;
    var local_38: f32;
    var local_39: f32;
    var strength: f32;
    var east_1: vec3<f32>;
    var local_40: vec3<f32>;
    var wd_2: vec3<f32>;
    var river_2: bool;
    var pond: bool;
    var sea_6: bool;
    var local_41: vec3<f32>;
    var e1_: vec3<f32>;
    var e2_: vec3<f32>;
    var warp_2: vec3<f32>;
    var local_42: f32;
    var U_5: f32;
    var local_43: f32;
    var Fr: f32;
    var local_44: f32;
    var local_45: f32;
    var local_46: f32;
    var s2_: f32;
    var local_47: f32;
    var local_48: f32;
    var local_49: f32;
    var lmax_4: f32;
    var W_2: Waves;
    var fd: vec3<f32>;
    var local_50: vec3<f32>;
    var ta: f32;
    var tb: f32;
    var wa_1: f32;
    var A: Waves;
    var B: Waves;
    var sc: f32;
    var cov: f32;
    var t_5: f32;
    var z: f32;
    var rk: f32;
    var sea4_: vec4<f32>;
    var local_51: f32;
    var hb_2: f32;
    var xo_4: f32;
    var ph_4: f32;
    var Lh: f32;
    var fw_2: f32;
    var sf: vec4<f32>;
    var local_52: vec3<f32>;
    var dir: vec3<f32>;
    var gph: vec3<f32>;
    var gs: vec3<f32>;
    var gl: f32;
    var fade: f32;
    var rise: f32;
    var lace: f32;
    var surf: f32;
    var pn: f32;
    var local_53: f32;
    var wv: f32;
    var fz: vec4<f32>;
    var cv: f32;
    var soft: f32;
    var z_1: f32;
    var froth: f32;
    var ac: vec3<f32>;
    var cov_1: f32;
    var q_5: vec2<f32>;
    var qa: vec2<f32>;
    var qb: vec2<f32>;
    var na: f32;
    var nb: f32;
    var th: f32;
    var q_6: vec2<f32>;
    var sa: f32;
    var sb: f32;
    var streak: f32;

    fp_9 = fp_8;
    n_16 = n_15;
    upF_4 = upF_3;
    kind_1 = kind;
    flow_1 = flow;
    fetch_1 = fetch;
    depth_1 = depth;
    foot_15 = foot_14;
    wn_1 = wn;
    grp_3 = grp_2;
    fdir_1 = fdir;
    fv_1 = fv;
    gradH_1 = gradH;
    shoreX_1 = shoreX;
    gradX_1 = gradX;
    let _e214 = upF_4;
    al_1 = abs(asin(clamp(_e214.y, -1f, 1f)));
    let _e223 = upF_4;
    let _e224 = windSense(_e223);
    toward = _e224;
    let _e226 = al_1;
    if (_e226 < 0.09f) {
        local_39 = 0.45f;
    } else {
        let _e230 = al_1;
        if (_e230 < 0.52f) {
            local_38 = 0.9f;
        } else {
            let _e234 = al_1;
            if (_e234 < 1.05f) {
                local_37 = 1.25f;
            } else {
                local_37 = 0.8f;
            }
            let _e240 = local_37;
            local_38 = _e240;
        }
        let _e242 = local_38;
        local_39 = _e242;
    }
    let _e244 = local_39;
    strength = _e244;
    let _e250 = upF_4;
    east_1 = cross(vec3<f32>(0f, 1f, 0f), _e250);
    let _e253 = east_1;
    if (length(_e253) > 0.0001f) {
        let _e257 = east_1;
        let _e259 = toward;
        local_40 = (normalize(_e257) * sign((_e259 + 0.001f)));
    } else {
        local_40 = vec3<f32>(1f, 0f, 0f);
    }
    let _e269 = local_40;
    wd_2 = _e269;
    let _e271 = kind_1;
    let _e274 = kind_1;
    river_2 = ((_e271 > 0.55f) && (_e274 < 0.85f));
    let _e279 = kind_1;
    pond = (_e279 > 0.85f);
    let _e283 = kind_1;
    sea_6 = (_e283 < 0.2f);
    let _e287 = east_1;
    if (length(_e287) > 0.0001f) {
        let _e291 = east_1;
        local_41 = normalize(_e291);
    } else {
        local_41 = vec3<f32>(1f, 0f, 0f);
    }
    let _e298 = local_41;
    e1_ = _e298;
    let _e300 = upF_4;
    let _e301 = e1_;
    e2_ = cross(_e300, _e301);
    let _e304 = e1_;
    let _e305 = wn_1;
    let _e308 = e2_;
    let _e309 = wn_1;
    let _e315 = global.uLiquid;
    warp_2 = ((((_e304 * _e305.x) + (_e308 * _e309.y)) * 0.12f) * _e315.w);
    let _e319 = global.uLiquid;
    let _e321 = strength;
    let _e323 = sea_6;
    if _e323 {
        local_42 = 1f;
    } else {
        let _e327 = fetch_1;
        local_42 = mix(0.3f, 1f, _e327);
    }
    let _e330 = local_42;
    U_5 = ((_e319.y * _e321) * _e330);
    let _e333 = river_2;
    if _e333 {
        let _e334 = fv_1;
        let _e335 = global.uLiquid2_;
        let _e337 = depth_1;
        local_43 = (_e334 / sqrt((_e335.x * max(_e337, 0.3f))));
    } else {
        local_43 = 0f;
    }
    let _e345 = local_43;
    Fr = _e345;
    let _e347 = sea_6;
    if _e347 {
        let _e350 = U_5;
        let _e354 = U_5;
        local_46 = ((0.003f * step(0.01f, _e350)) + (0.00512f * _e354));
    } else {
        let _e357 = pond;
        if _e357 {
            let _e360 = U_5;
            local_45 = (0.0003f + (0.0003f * _e360));
        } else {
            let _e363 = river_2;
            if _e363 {
                let _e366 = Fr;
                let _e367 = Fr;
                let _e374 = U_5;
                local_44 = ((0.0012f + (0.035f * min((_e366 * _e367), 2f))) + (0.0015f * _e374));
            } else {
                let _e379 = U_5;
                local_44 = (0.001f + (0.00512f * _e379));
            }
            let _e383 = local_44;
            local_45 = _e383;
        }
        let _e385 = local_45;
        local_46 = _e385;
    }
    let _e387 = local_46;
    s2_ = _e387;
    let _e389 = s2_;
    let _e390 = global.uLiquid;
    s2_ = (_e389 * _e390.z);
    let _e393 = sea_6;
    if _e393 {
        local_49 = 1000000000f;
    } else {
        let _e395 = river_2;
        if _e395 {
            let _e397 = fv_1;
            let _e399 = fv_1;
            let _e401 = global.uLiquid2_;
            let _e404 = depth_1;
            local_48 = clamp(((((6.2832f * _e397) * _e399) / _e401.x) + _e404), 0.6f, 8f);
        } else {
            let _e409 = pond;
            if _e409 {
                local_47 = 1f;
            } else {
                let _e413 = fetch_1;
                local_47 = (25f + (400f * _e413));
            }
            let _e417 = local_47;
            local_48 = _e417;
        }
        let _e419 = local_48;
        local_49 = _e419;
    }
    let _e421 = local_49;
    lmax_4 = _e421;
    let _e424 = fdir_1;
    let _e425 = upF_4;
    let _e426 = fdir_1;
    let _e427 = upF_4;
    fd = (_e424 - (_e425 * dot(_e426, _e427)));
    let _e432 = fd;
    if (length(_e432) > 0.05f) {
        let _e436 = fd;
        local_50 = normalize(_e436);
    } else {
        local_50 = vec3(0f);
    }
    let _e441 = local_50;
    fd = _e441;
    let _e442 = global.uTime;
    ta = fract((_e442 / 3f));
    let _e447 = global.uTime;
    tb = fract(((_e447 / 3f) + 0.5f));
    let _e456 = ta;
    wa_1 = (1f - abs(((2f * _e456) - 1f)));
    let _e463 = river_2;
    if _e463 {
        {
            let _e464 = fp_9;
            let _e465 = fd;
            let _e466 = fv_1;
            let _e470 = ta;
            let _e473 = n_16;
            let _e474 = lmax_4;
            let _e475 = foot_15;
            let _e476 = riverRipples((_e464 - (((_e465 * _e466) * 3f) * _e470)), _e473, _e474, _e475);
            A = _e476;
            let _e478 = fp_9;
            let _e479 = fd;
            let _e480 = fv_1;
            let _e484 = tb;
            let _e490 = n_16;
            let _e491 = lmax_4;
            let _e492 = foot_15;
            let _e493 = riverRipples(((_e478 - (((_e479 * _e480) * 3f) * _e484)) + vec3(0.37f)), _e490, _e491, _e492);
            B = _e493;
            let _e495 = A;
            W_2 = _e495;
            let _e497 = A;
            let _e499 = wa_1;
            let _e501 = B;
            let _e504 = wa_1;
            W_2.g = ((_e497.g * _e499) + (_e501.g * (1f - _e504)));
            let _e509 = A;
            let _e511 = wa_1;
            let _e513 = B;
            let _e516 = wa_1;
            W_2.crest = ((_e509.crest * _e511) + (_e513.crest * (1f - _e516)));
        }
    } else {
        let _e520 = fp_9;
        let _e521 = n_16;
        let _e522 = wd_2;
        let _e523 = lmax_4;
        let _e525 = foot_15;
        let _e526 = warp_2;
        let _e527 = grp_3;
        let _e528 = liquidWaves(_e520, _e521, _e522, _e523, false, _e525, _e526, _e527);
        W_2 = _e528;
    }
    let _e529 = s2_;
    let _e530 = W_2;
    sc = sqrt((_e529 / max(_e530.var0_, 0.000000001f)));
    let _e537 = n_16;
    let _e538 = W_2;
    let _e540 = sc;
    (*nF) = normalize((_e537 - (_e538.g * _e540)));
    let _e545 = W_2;
    let _e547 = W_2;
    let _e554 = sc;
    (*rough) = clamp((sqrt((2f * max((_e545.var_ - _e547.res), 0f))) * _e554), 0.02f, 0.6f);
    let _e560 = U_5;
    cov = clamp((0.00000384f * pow(_e560, 3.41f)), 0f, 0.3f);
    (*foam_1) = 0f;
    let _e569 = river_2;
    let _e571 = pond;
    let _e574 = cov;
    if ((!(_e569) && !(_e571)) && (_e574 > 0.0001f)) {
        {
            let _e580 = cov;
            t_5 = sqrt((-2f * log(_e580)));
            let _e585 = t_5;
            let _e588 = t_5;
            let _e592 = t_5;
            let _e594 = t_5;
            let _e599 = t_5;
            let _e603 = t_5;
            let _e605 = t_5;
            let _e609 = t_5;
            let _e611 = t_5;
            let _e613 = t_5;
            z = (_e585 - (((2.515517f + (0.802853f * _e588)) + ((0.010328f * _e592) * _e594)) / (((1f + (1.432788f * _e599)) + ((0.189269f * _e603) * _e605)) + (((0.001308f * _e609) * _e611) * _e613))));
            let _e619 = W_2;
            let _e621 = W_2;
            rk = (_e619.res / max(_e621.var_, 0.000000001f));
            let _e627 = cov;
            let _e628 = z;
            let _e631 = z;
            let _e634 = W_2;
            let _e637 = rk;
            (*foam_1) = (mix(_e627, smoothstep((_e628 - 0.25f), (_e631 + 0.35f), _e634.crest), _e637) * 0.9f);
        }
    }
    let _e641 = river_2;
    let _e643 = pond;
    let _e646 = global.uSurfSea;
    if ((!(_e641) && !(_e643)) && (_e646 > 0.5f)) {
        {
            let _e650 = U_5;
            let _e651 = global.uLiquid2_;
            let _e653 = surfSea(_e650, _e651.x);
            sea4_ = _e653;
            let _e656 = sea4_;
            let _e658 = sea_6;
            if _e658 {
                local_51 = 1f;
            } else {
                let _e661 = fetch_1;
                local_51 = (0.3f * _e661);
            }
            let _e664 = local_51;
            let _e665 = global.uLiquid;
            sea4_.x = (_e656.x * (_e664 * _e665.z));
            let _e669 = sea4_;
            let _e674 = sea4_;
            hb_2 = pow((((_e669.x * 1.3f) * pow((0.1f * _e674.w), 0.25f)) / 0.78f), 0.8f);
            let _e685 = depth_1;
            let _e687 = hb_2;
            let _e692 = sea4_;
            if ((_e685 < ((2f * _e687) + 0.5f)) && (_e692.x > 0.02f)) {
                {
                    let _e697 = depth_1;
                    let _e698 = shoreX_1;
                    let _e699 = surfOut(_e697, _e698);
                    xo_4 = _e699;
                    let _e701 = fp_9;
                    let _e702 = xo_4;
                    let _e703 = sea4_;
                    let _e704 = global.uLiquid2_;
                    let _e706 = global.uTime;
                    let _e707 = surfPhase(_e701, _e702, _e703, _e704.x, _e706);
                    ph_4 = _e707;
                    let _e709 = ph_4;
                    let _e711 = grp_3;
                    let _e717 = wn_1;
                    ph_4 = (_e709 + ((1.6f * (_e711.y - 0.5f)) + (0.4f * _e717.x)));
                    let _e722 = sea4_;
                    let _e724 = global.uLiquid2_;
                    let _e726 = depth_1;
                    Lh = (_e722.y * sqrt((_e724.x * max(_e726, 0.05f))));
                    let _e734 = foot_15;
                    let _e736 = Lh;
                    fw_2 = clamp(((3f * _e734) / _e736), 0.07f, 0.4f);
                    let _e742 = depth_1;
                    let _e743 = ph_4;
                    let _e744 = sea4_;
                    let _e745 = fw_2;
                    let _e746 = surfAt(_e742, _e743, _e744, _e745);
                    sf = _e746;
                    let _e748 = global.uColourCube;
                    if (_e748.x > 0.5f) {
                        let _e752 = gradX_1;
                        local_52 = _e752;
                    } else {
                        let _e753 = gradH_1;
                        local_52 = _e753;
                    }
                    let _e755 = local_52;
                    dir = _e755;
                    let _e757 = xo_4;
                    let _e758 = sea4_;
                    let _e759 = global.uLiquid2_;
                    let _e761 = surfRate(_e757, _e758, _e759.x);
                    let _e762 = dir;
                    let _e764 = dir;
                    gph = ((_e761 * _e762) / vec3(max(length(_e764), 0.000001f)));
                    let _e771 = gph;
                    let _e772 = sf;
                    gs = (_e771 * _e772.y);
                    let _e776 = gs;
                    gl = length(_e776);
                    let _e779 = gl;
                    if (_e779 > 0.3f) {
                        let _e782 = gs;
                        let _e784 = gl;
                        gs = (_e782 * (0.3f / _e784));
                    }
                    let _e787 = gs;
                    let _e788 = n_16;
                    let _e789 = gs;
                    let _e790 = n_16;
                    gs = (_e787 - (_e788 * dot(_e789, _e790)));
                    let _e796 = hb_2;
                    let _e799 = hb_2;
                    let _e803 = depth_1;
                    fade = (1f - smoothstep((1.5f * _e796), ((2f * _e799) + 0.5f), _e803));
                    let _e807 = (*nF);
                    let _e808 = gs;
                    let _e809 = fade;
                    (*nF) = normalize((_e807 - (_e808 * _e809)));
                    let _e815 = depth_1;
                    let _e816 = xo_4;
                    let _e820 = sea4_;
                    let _e824 = sea4_;
                    rise = smoothstep(0.4f, 1.2f, ((_e815 / max(_e816, 10f)) / sqrt((max(_e820.x, 0.01f) / _e824.w))));
                    let _e833 = grp_3;
                    let _e836 = W_2;
                    let _e843 = grp_3;
                    let _e846 = grp_3;
                    lace = (smoothstep(0.15f, 0.75f, (_e833.x + (0.25f * _e836.crest))) * smoothstep(0.1f, 0.5f, (_e843.z + (0.3f * (_e846.w - 0.5f)))));
                    let _e855 = sf;
                    let _e859 = rise;
                    let _e865 = lace;
                    let _e869 = sf;
                    let _e873 = lace;
                    surf = (((_e855.z * (0.6f + (0.4f * _e859))) * (0.55f + (0.45f * _e865))) + ((_e869.w * 0.08f) * _e873));
                    let _e877 = surf;
                    let _e881 = depth_1;
                    let _e886 = lace;
                    surf = (_e877 + ((1f - smoothstep(0f, 0.12f, _e881)) * (0.3f + (0.5f * _e886))));
                    let _e891 = ph_4;
                    pn = (_e891 / 6.2832f);
                    let _e895 = pn;
                    let _e897 = pn;
                    let _e900 = fw_2;
                    if (fract(_e897) > (1f - _e900)) {
                        local_53 = 1f;
                    } else {
                        local_53 = 0f;
                    }
                    let _e906 = local_53;
                    wv = (floor(_e895) + _e906);
                    let _e909 = fp_9;
                    let _e910 = wv;
                    let _e926 = n_16;
                    let _e928 = foot_15;
                    let _e929 = surfNoise((_e909 + ((fract((sin((_e910 * vec3<f32>(12.9898f, 78.233f, 37.719f))) * 43758.547f)) - vec3(0.5f)) * 300f)), _e926, 7f, _e928);
                    fz = _e929;
                    let _e931 = surf;
                    cv = clamp(_e931, 0f, 1f);
                    let _e940 = foot_15;
                    soft = (0.05f + (0.4f * smoothstep(0.2f, 3f, _e940)));
                    let _e948 = fz;
                    let _e952 = fz;
                    let _e957 = W_2;
                    z_1 = smoothstep(0.25f, 0.75f, (((0.6f * _e948.x) + (0.4f * _e952.w)) + (0.06f * _e957.crest)));
                    let _e964 = cv;
                    let _e966 = soft;
                    let _e969 = cv;
                    let _e971 = soft;
                    let _e973 = z_1;
                    let _e975 = cv;
                    let _e978 = foot_15;
                    froth = mix(smoothstep(((1f - _e964) - _e966), ((1f - _e969) + _e971), _e973), _e975, smoothstep(1.5f, 8f, _e978));
                    let _e982 = (*foam_1);
                    let _e983 = froth;
                    let _e984 = fade;
                    (*foam_1) = max(_e982, ((_e983 * _e984) * 0.9f));
                }
            }
        }
    }
    let _e989 = river_2;
    let _e990 = fd;
    if (_e989 && (length(_e990) > 0f)) {
        {
            let _e995 = upF_4;
            let _e996 = fd;
            ac = cross(_e995, _e996);
            let _e999 = Fr;
            cov_1 = clamp(((_e999 - 0.6f) / 0.9f), 0f, 1f);
            let _e1008 = cov_1;
            let _e1009 = cov_1;
            cov_1 = (_e1008 * _e1009);
            let _e1011 = cov_1;
            if (_e1011 > 0f) {
                {
                    let _e1014 = fp_9;
                    let _e1015 = ac;
                    let _e1019 = fp_9;
                    let _e1020 = fd;
                    q_5 = vec2<f32>((dot(_e1014, _e1015) * 0.15f), (dot(_e1019, _e1020) * 0.04f));
                    let _e1026 = q_5;
                    let _e1028 = fv_1;
                    let _e1031 = ta;
                    qa = (_e1026 - vec2<f32>(0f, (((_e1028 * 3f) * _e1031) * 0.04f)));
                    let _e1038 = q_5;
                    let _e1044 = fv_1;
                    let _e1047 = tb;
                    qb = ((_e1038 + vec2<f32>(0.41f, 0f)) - vec2<f32>(0f, (((_e1044 * 3f) * _e1047) * 0.04f)));
                    let _e1055 = qa;
                    let _e1057 = textureSampleLevel(tDetailTexture, tDetailSampler, _e1055, 0f);
                    let _e1061 = qa;
                    let _e1068 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e1061 * 3.1f) + vec2(0.3f)), 0f);
                    na = ((0.65f * _e1057.w) + (0.35f * _e1068.x));
                    let _e1074 = qb;
                    let _e1076 = textureSampleLevel(tDetailTexture, tDetailSampler, _e1074, 0f);
                    let _e1080 = qb;
                    let _e1087 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e1080 * 3.1f) + vec2(0.3f)), 0f);
                    nb = ((0.65f * _e1076.w) + (0.35f * _e1087.x));
                    let _e1094 = cov_1;
                    th = mix(0.75f, 0.28f, _e1094);
                    let _e1097 = th;
                    let _e1100 = th;
                    let _e1103 = nb;
                    let _e1104 = na;
                    let _e1105 = wa_1;
                    let _e1108 = W_2;
                    (*foam_1) = (smoothstep((_e1097 - 0.02f), (_e1100 + 0.1f), (mix(_e1103, _e1104, _e1105) + (0.06f * _e1108.crest))) * 0.85f);
                }
            }
            let _e1115 = fp_9;
            let _e1116 = ac;
            let _e1120 = fp_9;
            let _e1121 = fd;
            q_6 = vec2<f32>((dot(_e1115, _e1116) * 0.2f), (dot(_e1120, _e1121) * 0.004f));
            let _e1128 = q_6;
            let _e1131 = fp_9;
            let _e1132 = ac;
            let _e1134 = fp_9;
            let _e1135 = fd;
            let _e1141 = textureSampleLevel(tDetailTexture, tDetailSampler, (vec2<f32>(dot(_e1131, _e1132), dot(_e1134, _e1135)) * 0.012f), 0f);
            q_6.x = (_e1128.x + (1.2f * (_e1141.x - 0.5f)));
            let _e1147 = q_6;
            let _e1149 = fv_1;
            let _e1152 = ta;
            let _e1159 = textureSampleLevel(tDetailTexture, tDetailSampler, (_e1147 - vec2<f32>(0f, (((_e1149 * 3f) * _e1152) * 0.004f))), 0f);
            sa = _e1159.w;
            let _e1162 = q_6;
            let _e1168 = fv_1;
            let _e1171 = tb;
            let _e1178 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e1162 + vec2<f32>(0.43f, 0f)) - vec2<f32>(0f, (((_e1168 * 3f) * _e1171) * 0.004f))), 0f);
            sb = _e1178.w;
            let _e1183 = sb;
            let _e1184 = sa;
            let _e1185 = wa_1;
            let _e1190 = Fr;
            streak = (smoothstep(0.7f, 0.8f, mix(_e1183, _e1184, _e1185)) * smoothstep(0.6f, 1.2f, _e1190));
            let _e1194 = (*foam_1);
            let _e1195 = streak;
            (*foam_1) = max(_e1194, (_e1195 * 0.3f));
        }
    }
    let _e1199 = (*foam_1);
    let _e1200 = global.uLiquid2_;
    (*foam_1) = (_e1199 * _e1200.y);
    return;
}

fn liquidTs(Tm: f32, kind_2: f32, flow_2: f32, upF_5: vec3<f32>) -> vec2<f32> {
    var Tm_1: f32;
    var kind_3: f32;
    var flow_3: f32;
    var upF_6: vec3<f32>;
    var Ts_1: f32;
    var yr: vec3<f32>;
    var local_54: f32;
    var local_55: f32;
    var local_56: f32;
    var follow: f32;
    var local_57: f32;
    var local_58: f32;
    var local_59: f32;
    var follow_1: f32;
    var local_60: f32;
    var local_61: f32;
    var Tf_2: f32;

    Tm_1 = Tm;
    kind_3 = kind_2;
    flow_3 = flow_2;
    upF_6 = upF_5;
    let _e190 = global.uSeason;
    if (_e190.z > 0.5f) {
        {
            let _e194 = upF_6;
            let _e195 = seasonYear(_e194);
            yr = _e195;
            let _e197 = kind_3;
            if (_e197 < 0.2f) {
                local_56 = 1f;
            } else {
                let _e201 = kind_3;
                if (_e201 < 0.55f) {
                    local_55 = 0.8f;
                } else {
                    let _e205 = kind_3;
                    if (_e205 < 0.85f) {
                        local_54 = 0.7f;
                    } else {
                        local_54 = 1f;
                    }
                    let _e211 = local_54;
                    local_55 = _e211;
                }
                let _e213 = local_55;
                local_56 = _e213;
            }
            let _e215 = local_56;
            follow = _e215;
            let _e217 = Tm_1;
            let _e218 = follow;
            let _e219 = yr;
            let _e221 = global.uSeason;
            let _e225 = yr;
            let _e227 = global.uSeason;
            Ts_1 = (_e217 + (_e218 * ((_e219.x * cos(_e221.x)) + (_e225.y * sin(_e227.x)))));
        }
    } else {
        {
            let _e234 = kind_3;
            if (_e234 < 0.2f) {
                local_59 = 0.25f;
            } else {
                let _e238 = kind_3;
                if (_e238 < 0.55f) {
                    local_58 = 0.6f;
                } else {
                    let _e242 = kind_3;
                    if (_e242 < 0.85f) {
                        local_57 = 0.45f;
                    } else {
                        local_57 = 0.8f;
                    }
                    let _e248 = local_57;
                    local_58 = _e248;
                }
                let _e250 = local_58;
                local_59 = _e250;
            }
            let _e252 = local_59;
            follow_1 = _e252;
            let _e254 = Tm_1;
            let _e256 = global.uLiquid2_;
            let _e259 = upF_6;
            let _e262 = follow_1;
            Ts_1 = (_e254 + (((70f * _e256.w) * _e259.y) * _e262));
        }
    }
    let _e265 = kind_3;
    if (_e265 < 0.2f) {
        let _e268 = global.uLiquid2_;
        local_60 = _e268.z;
    } else {
        local_60 = 0f;
    }
    let _e272 = local_60;
    let _e273 = kind_3;
    let _e276 = kind_3;
    if ((_e273 > 0.55f) && (_e276 < 0.85f)) {
        let _e281 = flow_3;
        local_61 = (3f * _e281);
    } else {
        local_61 = 0f;
    }
    let _e285 = local_61;
    Tf_2 = (_e272 - _e285);
    let _e288 = Ts_1;
    let _e289 = Tf_2;
    return vec2<f32>(_e288, _e289);
}

fn seaIceCover(ice: f32, nA: f32, nR: f32) -> f32 {
    var ice_1: f32;
    var nA_1: f32;
    var nR_1: f32;

    ice_1 = ice;
    nA_1 = nA;
    nR_1 = nR;
    let _e189 = ice_1;
    let _e190 = nA_1;
    let _e196 = nR_1;
    let _e205 = ice_1;
    return (smoothstep(0.35f, 0.75f, ((_e189 + ((_e190 - 0.5f) * 0.9f)) + ((_e196 - 0.5f) * 0.35f))) * smoothstep(0f, 0.15f, _e205));
}

fn floeHash(x_4: u32, y: u32, z_2: u32, s_1: u32) -> u32 {
    var x_5: u32;
    var y_1: u32;
    var z_3: u32;
    var s_2: u32;
    var h_7: u32;

    x_5 = x_4;
    y_1 = y;
    z_3 = z_2;
    s_2 = s_1;
    let _e189 = x_5;
    let _e192 = y_1;
    let _e196 = z_3;
    let _e200 = s_2;
    h_7 = ((((_e189 * 2376512323u) ^ (_e192 * 3625334849u)) ^ (_e196 * 3407524639u)) ^ (_e200 * 374761393u));
    let _e205 = h_7;
    let _e206 = h_7;
    h_7 = (_e205 ^ (_e206 >> 15u));
    let _e210 = h_7;
    h_7 = (_e210 * 739982445u);
    let _e213 = h_7;
    let _e214 = h_7;
    h_7 = (_e213 ^ (_e214 >> 12u));
    let _e218 = h_7;
    h_7 = (_e218 * 695872825u);
    let _e221 = h_7;
    let _e222 = h_7;
    h_7 = (_e221 ^ (_e222 >> 15u));
    let _e226 = h_7;
    return _e226;
}

fn tri0_(p_7: vec3<f32>, w_3: vec3<f32>, period_2: f32) -> vec4<f32> {
    var p_8: vec3<f32>;
    var w_4: vec3<f32>;
    var period_3: f32;
    var a_12: vec4<f32>;
    var b_2: vec4<f32>;
    var c_5: vec4<f32>;

    p_8 = p_7;
    w_4 = w_3;
    period_3 = period_2;
    let _e188 = p_8;
    let _e190 = period_3;
    let _e194 = textureSampleLevel(tDetailTexture, tDetailSampler, (_e188.yz / vec2(_e190)), 0f);
    a_12 = _e194;
    let _e196 = p_8;
    let _e198 = period_3;
    let _e205 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e196.zx / vec2(_e198)) + vec2(0.37f)), 0f);
    b_2 = _e205;
    let _e207 = p_8;
    let _e209 = period_3;
    let _e216 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e207.xy / vec2(_e209)) + vec2(0.71f)), 0f);
    c_5 = _e216;
    let _e218 = a_12;
    let _e219 = w_4;
    let _e222 = b_2;
    let _e223 = w_4;
    let _e227 = c_5;
    let _e228 = w_4;
    return (((_e218 * _e219.x) + (_e222 * _e223.y)) + (_e227 * _e228.z));
}

fn tri(p_9: vec3<f32>, w_5: vec3<f32>, period_4: f32) -> vec4<f32> {
    var p_10: vec3<f32>;
    var w_6: vec3<f32>;
    var period_5: f32;
    var a_13: vec4<f32>;
    var b_3: vec4<f32>;
    var c_6: vec4<f32>;

    p_10 = p_9;
    w_6 = w_5;
    period_5 = period_4;
    let _e188 = p_10;
    let _e190 = period_5;
    let _e194 = textureSampleLevel(tDetailTexture, tDetailSampler, (_e188.yz / vec2(_e190)), 0f);
    a_13 = _e194;
    let _e196 = p_10;
    let _e198 = period_5;
    let _e205 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e196.zx / vec2(_e198)) + vec2(0.37f)), 0f);
    b_3 = _e205;
    let _e207 = p_10;
    let _e209 = period_5;
    let _e216 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e207.xy / vec2(_e209)) + vec2(0.71f)), 0f);
    c_6 = _e216;
    let _e218 = a_13;
    let _e219 = w_6;
    let _e222 = b_3;
    let _e223 = w_6;
    let _e227 = c_6;
    let _e228 = w_6;
    return (((_e218 * _e219.x) + (_e222 * _e223.y)) + (_e227 * _e228.z));
}

fn leadIce(lid: u32, frz: f32, pDay: f32) -> vec2<f32> {
    var lid_1: u32;
    var frz_1: f32;
    var pDay_1: f32;
    var age: f32;
    var local_62: f32;
    var h_8: f32;

    lid_1 = lid;
    frz_1 = frz;
    pDay_1 = pDay;
    let _e189 = lid_1;
    age = (-2f * log(((f32((_e189 & 65535u)) + 0.5f) / 65536f)));
    let _e200 = frz_1;
    if (_e200 > 0f) {
        let _e204 = frz_1;
        let _e205 = age;
        local_62 = (1.33f * pow((_e204 * _e205), 0.58f));
    } else {
        local_62 = 0f;
    }
    let _e212 = local_62;
    h_8 = _e212;
    let _e214 = h_8;
    let _e216 = pDay_1;
    let _e218 = age;
    let _e226 = h_8;
    return vec2<f32>(_e214, ((1f - exp(((-(_e216) * _e218) / 12f))) * smoothstep(3f, 8f, _e226)));
}

fn leadHalf(cid: u32, c_7: f32, s_3: f32) -> f32 {
    var cid_1: u32;
    var c_8: f32;
    var s_4: f32;

    cid_1 = cid;
    c_8 = c_7;
    s_4 = s_3;
    let _e189 = s_4;
    let _e195 = cid_1;
    let _e207 = c_8;
    return min(150f, (((0.03f * min(_e189, 2048f)) * (0.2f + ((1.6f * f32((_e195 & 255u))) / 256f))) * (1f + (8f * (1f - sqrt(_e207))))));
}

fn crackOpen(cid_2: u32, c_9: f32, s_5: f32) -> f32 {
    var cid_3: u32;
    var c_10: f32;
    var s_6: f32;

    cid_3 = cid_2;
    c_10 = c_9;
    s_6 = s_5;
    let _e187 = cid_3;
    let _e198 = c_10;
    if ((f32(((_e187 >> 8u) & 255u)) / 256f) < (0.5f * smoothstep(0.85f, 1f, _e198))) {
        let _e203 = cid_3;
        return -((0.5f + (f32(((_e203 >> 16u) & 255u)) / 255f)));
    }
    let _e213 = cid_3;
    let _e214 = c_10;
    let _e215 = s_6;
    let _e216 = leadHalf(_e213, _e214, _e215);
    return _e216;
}

fn pieceCover(m_4: vec3<f32>, ice_2: f32) -> f32 {
    var m_5: vec3<f32>;
    var ice_3: f32;
    var u_2: vec3<f32>;
    var wm: vec3<f32>;
    var local_63: f32;

    m_5 = m_4;
    ice_3 = ice_2;
    let _e185 = m_5;
    u_2 = normalize(_e185);
    let _e188 = u_2;
    wm = pow(abs(_e188), vec3(4f));
    let _e194 = wm;
    let _e195 = wm;
    let _e197 = wm;
    let _e200 = wm;
    wm = (_e194 / vec3(((_e195.x + _e197.y) + _e200.z)));
    let _e205 = global.uSeason;
    if (_e205.z > 0.5f) {
        let _e209 = m_5;
        let _e210 = global.uLiquid2_;
        let _e212 = seaIceAt(_e209, _e210.z);
        local_63 = _e212;
    } else {
        let _e213 = ice_3;
        local_63 = _e213;
    }
    let _e215 = local_63;
    let _e216 = m_5;
    let _e217 = wm;
    let _e219 = tri0_(_e216, _e217, 512f);
    let _e221 = m_5;
    let _e222 = wm;
    let _e224 = tri0_(_e221, _e222, 64f);
    let _e226 = seaIceCover(_e215, _e219.w, _e224.x);
    return _e226;
}

fn faceLead(face: u32, axis: i32, neg: bool) -> u32 {
    var face_1: u32;
    var axis_1: i32;
    var neg_1: bool;
    var local_64: u32;
    var of_: u32;

    face_1 = face;
    axis_1 = axis;
    neg_1 = neg;
    let _e187 = axis_1;
    let _e191 = neg_1;
    if _e191 {
        local_64 = 1u;
    } else {
        local_64 = 0u;
    }
    let _e195 = local_64;
    of_ = (u32((_e187 * 2i)) + _e195);
    let _e198 = face_1;
    let _e199 = of_;
    let _e201 = face_1;
    let _e202 = of_;
    let _e206 = floeHash(min(_e198, _e199), max(_e201, _e202), 20253u, 11132u);
    return _e206;
}

fn floeRound(size: f32, id: u32, c_11: f32) -> f32 {
    var size_1: f32;
    var id_1: u32;
    var c_12: f32;
    var age_1: f32;

    size_1 = size;
    id_1 = id;
    c_12 = c_11;
    let _e192 = size_1;
    let _e198 = id_1;
    age_1 = ((0.3f + (0.7f * smoothstep(16f, 200f, _e192))) * (0.6f + ((0.4f * f32((_e198 >> 16u))) / 65536f)));
    let _e208 = size_1;
    let _e211 = age_1;
    let _e218 = c_12;
    return (_e208 * ((0.06f * (0.5f + _e211)) + (0.32f * (1f - smoothstep(0.5f, 0.9f, _e218)))));
}

fn floeOf(p_11: vec3<f32>, ice_4: f32, id_2: ptr<function, u32>, e_1: ptr<function, f32>, lid_2: ptr<function, u32>, c_13: ptr<function, f32>, size_2: ptr<function, f32>, mid: ptr<function, vec3<f32>>, there: ptr<function, bool>, ridge: ptr<function, vec4<f32>>) {
    var p_12: vec3<f32>;
    var ice_5: f32;
    var R_2: f32;
    var a_14: vec3<f32>;
    var local_65: i32;
    var local_66: i32;
    var ax: i32;
    var b_4: i32;
    var d_10: i32;
    var neg_2: bool;
    var local_67: f32;
    var sg: f32;
    var pu: f32;
    var pv: f32;
    var local_68: u32;
    var face_2: u32;
    var V_2: array<vec2<f32>, 12>;
    var EI: array<u32, 12>;
    var ES: array<f32, 12>;
    var i_8: i32 = 0i;
    var n_17: i32 = 4i;
    var s_7: f32 = 0f;
    var cP: f32 = -1f;
    var m_6: vec3<f32>;
    var lvl: i32 = 0i;
    var v0_: vec2<f32>;
    var cs_1: vec2<f32>;
    var A_1: f32;
    var i_9: i32;
    var xi: vec2<f32>;
    var xj: vec2<f32>;
    var w_7: f32;
    var cc: vec2<f32>;
    var sxx: f32;
    var syy: f32;
    var sxy: f32;
    var i_10: i32;
    var x_6: vec2<f32>;
    var local_69: f32;
    var th_1: f32;
    var ext: f32;
    var mm: vec3<f32>;
    var h_9: u32;
    var tc: f32;
    var off: f32;
    var qq: vec2<f32>;
    var KA: f32;
    var KB: f32;
    var KC: f32;
    var local_70: f32;
    var side: f32;
    var cid_4: u32;
    var g_10: f32;
    var W_3: array<vec2<f32>, 12>;
    var WI: array<u32, 12>;
    var WS: array<f32, 12>;
    var k_2: i32;
    var i_11: i32;
    var xi_1: vec2<f32>;
    var xj_1: vec2<f32>;
    var di: f32;
    var dj: f32;
    var i_12: i32;
    var local_71: u32;
    var rh: f32 = 0f;
    var e2_1: f32 = 100000000000000000000f;
    var i_13: i32 = 0i;
    var dv: vec2<f32>;
    var N3_: vec3<f32>;
    var dn_3: f32;
    var ek: f32;
    var local_72: f32;
    var rr: f32;

    p_12 = p_11;
    ice_5 = ice_4;
    let _e194 = p_12;
    R_2 = length(_e194);
    let _e197 = p_12;
    a_14 = abs(_e197);
    let _e200 = a_14;
    let _e202 = a_14;
    let _e205 = a_14;
    let _e207 = a_14;
    if ((_e200.x >= _e202.y) && (_e205.x >= _e207.z)) {
        local_66 = 0i;
    } else {
        let _e212 = a_14;
        let _e214 = a_14;
        if (_e212.y >= _e214.z) {
            local_65 = 1i;
        } else {
            local_65 = 2i;
        }
        let _e220 = local_65;
        local_66 = _e220;
    }
    let _e222 = local_66;
    ax = _e222;
    let _e224 = ax;
    b_4 = ((_e224 + 1i) % 3i);
    let _e230 = ax;
    d_10 = ((_e230 + 2i) % 3i);
    let _e236 = ax;
    let _e238 = p_12[_e236];
    neg_2 = (_e238 < 0f);
    let _e242 = neg_2;
    if _e242 {
        local_67 = -1f;
    } else {
        local_67 = 1f;
    }
    let _e247 = local_67;
    sg = _e247;
    let _e249 = b_4;
    let _e251 = p_12[_e249];
    let _e252 = ax;
    let _e254 = p_12[_e252];
    pu = (_e251 / _e254);
    let _e257 = d_10;
    let _e259 = p_12[_e257];
    let _e260 = ax;
    let _e262 = p_12[_e260];
    pv = (_e259 / _e262);
    let _e265 = ax;
    let _e269 = neg_2;
    if _e269 {
        local_68 = 1u;
    } else {
        local_68 = 0u;
    }
    let _e273 = local_68;
    face_2 = (u32((_e265 * 2i)) + _e273);
    V_2[0i] = vec2<f32>(-1f, -1f);
    V_2[1i] = vec2<f32>(1f, -1f);
    V_2[2i] = vec2<f32>(1f, 1f);
    V_2[3i] = vec2<f32>(-1f, 1f);
    let _e305 = face_2;
    let _e306 = d_10;
    let _e307 = neg_2;
    let _e309 = faceLead(_e305, _e306, !(_e307));
    EI[0i] = _e309;
    let _e312 = face_2;
    let _e313 = b_4;
    let _e314 = neg_2;
    let _e315 = faceLead(_e312, _e313, _e314);
    EI[1i] = _e315;
    let _e318 = face_2;
    let _e319 = d_10;
    let _e320 = neg_2;
    let _e321 = faceLead(_e318, _e319, _e320);
    EI[2i] = _e321;
    let _e324 = face_2;
    let _e325 = b_4;
    let _e326 = neg_2;
    let _e328 = faceLead(_e324, _e325, !(_e326));
    EI[3i] = _e328;
    loop {
        let _e331 = i_8;
        if !((_e331 < 4i)) {
            break;
        }
        let _e338 = i_8;
        let _e340 = i_8;
        let _e342 = EI[_e340];
        let _e345 = leadHalf(_e342, 1f, 4096f);
        ES[_e338] = _e345;
        continuing {
            let _e335 = i_8;
            i_8 = (_e335 + 1i);
        }
    }
    (*ridge) = vec4<f32>(0f, 0f, 0f, 100000000000000000000f);
    let _e353 = face_2;
    let _e357 = floeHash(_e353, 20942u, 0u, 14971u);
    (*id_2) = _e357;
    (*c_13) = 1f;
    let _e364 = p_12;
    m_6 = _e364;
    loop {
        let _e368 = lvl;
        if !((_e368 < 32i)) {
            break;
        }
        {
            let _e377 = V_2[0];
            v0_ = _e377;
            cs_1 = vec2(0f);
            A_1 = 0f;
            i_9 = 0i;
            loop {
                let _e386 = i_9;
                if !((_e386 < POLY_MAX)) {
                    break;
                }
                {
                    let _e392 = i_9;
                    let _e393 = n_17;
                    if (_e392 >= _e393) {
                        break;
                    }
                    let _e395 = i_9;
                    let _e397 = V_2[_e395];
                    let _e398 = v0_;
                    xi = (_e397 - _e398);
                    let _e401 = i_9;
                    let _e404 = n_17;
                    let _e407 = V_2[((_e401 + 1i) % _e404)];
                    let _e408 = v0_;
                    xj = (_e407 - _e408);
                    let _e411 = xi;
                    let _e413 = xj;
                    let _e416 = xj;
                    let _e418 = xi;
                    w_7 = ((_e411.x * _e413.y) - (_e416.x * _e418.y));
                    let _e423 = A_1;
                    let _e424 = w_7;
                    A_1 = (_e423 + _e424);
                    let _e426 = cs_1;
                    let _e427 = xi;
                    let _e428 = xj;
                    let _e430 = w_7;
                    cs_1 = (_e426 + ((_e427 + _e428) * _e430));
                }
                continuing {
                    let _e389 = i_9;
                    i_9 = (_e389 + 1i);
                }
            }
            let _e433 = A_1;
            A_1 = (_e433 * 0.5f);
            let _e436 = A_1;
            if (abs(_e436) < 0.00000000000000000001f) {
                break;
            }
            let _e440 = v0_;
            let _e441 = cs_1;
            let _e443 = A_1;
            cc = (_e440 + (_e441 / vec2((6f * _e443))));
            sxx = 0f;
            syy = 0f;
            sxy = 0f;
            i_10 = 0i;
            loop {
                let _e457 = i_10;
                if !((_e457 < POLY_MAX)) {
                    break;
                }
                {
                    let _e463 = i_10;
                    let _e464 = n_17;
                    if (_e463 >= _e464) {
                        break;
                    }
                    let _e466 = i_10;
                    let _e468 = V_2[_e466];
                    let _e469 = cc;
                    x_6 = (_e468 - _e469);
                    let _e472 = sxx;
                    let _e473 = x_6;
                    let _e475 = x_6;
                    sxx = (_e472 + (_e473.x * _e475.x));
                    let _e479 = syy;
                    let _e480 = x_6;
                    let _e482 = x_6;
                    syy = (_e479 + (_e480.y * _e482.y));
                    let _e486 = sxy;
                    let _e487 = x_6;
                    let _e489 = x_6;
                    sxy = (_e486 + (_e487.x * _e489.y));
                }
                continuing {
                    let _e460 = i_10;
                    i_10 = (_e460 + 1i);
                }
            }
            let _e493 = sxy;
            let _e495 = sxx;
            let _e496 = syy;
            let _e501 = sxx;
            let _e502 = syy;
            if ((abs(_e493) + abs((_e495 - _e496))) > (0.000000000000000000000000000001f * (_e501 + _e502))) {
                let _e508 = sxy;
                let _e510 = sxx;
                let _e511 = syy;
                local_69 = (0.5f * atan2((2f * _e508), (_e510 - _e511)));
            } else {
                local_69 = 0f;
            }
            let _e517 = local_69;
            th_1 = _e517;
            let _e519 = sxx;
            let _e520 = syy;
            let _e522 = n_17;
            ext = sqrt(((_e519 + _e520) / f32(_e522)));
            let _e528 = ax;
            let _e530 = sg;
            mm[_e528] = _e530;
            let _e531 = b_4;
            let _e533 = sg;
            let _e534 = cc;
            mm[_e531] = (_e533 * _e534.x);
            let _e537 = d_10;
            let _e539 = sg;
            let _e540 = cc;
            mm[_e537] = (_e539 * _e540.y);
            let _e543 = mm;
            let _e545 = R_2;
            m_6 = (normalize(_e543) * _e545);
            let _e547 = R_2;
            let _e548 = A_1;
            let _e553 = cc;
            let _e554 = cc;
            s_7 = ((_e547 * sqrt(abs(_e548))) / pow((1f + dot(_e553, _e554)), 0.75f));
            let _e560 = (*id_2);
            let _e561 = lvl;
            let _e565 = floeHash(_e560, u32(_e561), 20942u, 14971u);
            h_9 = _e565;
            let _e567 = th_1;
            let _e570 = h_9;
            tc = (((_e567 + 1.5708f) + ((f32(((_e570 >> 8u) & 1023u)) / 1023f) * 1.0472f)) - 0.5236f);
            let _e584 = h_9;
            let _e596 = ext;
            off = ((((f32(((_e584 >> 18u) & 255u)) / 255f) - 0.5f) * 0.6f) * _e596);
            let _e599 = cc;
            let _e600 = th_1;
            let _e602 = th_1;
            let _e605 = off;
            qq = (_e599 + (vec2<f32>(cos(_e600), sin(_e602)) * _e605));
            let _e609 = tc;
            KA = -(sin(_e609));
            let _e613 = tc;
            KB = cos(_e613);
            let _e616 = KA;
            let _e617 = qq;
            let _e620 = KB;
            let _e621 = qq;
            KC = -(((_e616 * _e617.x) + (_e620 * _e621.y)));
            let _e627 = s_7;
            if (_e627 < 4096f) {
                {
                    let _e630 = cP;
                    let _e633 = s_7;
                    if ((_e630 < 0f) || (_e633 < 1024f)) {
                        let _e637 = m_6;
                        let _e638 = ice_5;
                        let _e639 = pieceCover(_e637, _e638);
                        cP = _e639;
                    }
                    let _e640 = cP;
                    (*c_13) = _e640;
                    let _e641 = s_7;
                    let _e646 = (*c_13);
                    let _e651 = h_9;
                    let _e658 = (*c_13);
                    if ((_e641 < (12f + (288f * smoothstep(0.4f, 0.95f, _e646)))) || (f32((_e651 & 255u)) < (51.2f * smoothstep(0.5f, 0.9f, _e658)))) {
                        break;
                    }
                }
            }
            let _e663 = n_17;
            if (_e663 >= 11i) {
                break;
            }
            let _e668 = KA;
            let _e669 = pu;
            let _e671 = KB;
            let _e672 = pv;
            let _e675 = KC;
            if ((((_e668 * _e669) + (_e671 * _e672)) + _e675) >= 0f) {
                local_70 = 1f;
            } else {
                local_70 = -1f;
            }
            let _e683 = local_70;
            side = _e683;
            let _e685 = (*id_2);
            let _e686 = lvl;
            let _e690 = floeHash(_e685, u32(_e686), 31249u, 7997u);
            cid_4 = _e690;
            let _e692 = cid_4;
            let _e693 = (*c_13);
            let _e694 = s_7;
            let _e695 = crackOpen(_e692, _e693, _e694);
            g_10 = _e695;
            k_2 = 0i;
            i_11 = 0i;
            loop {
                let _e704 = i_11;
                if !((_e704 < POLY_MAX)) {
                    break;
                }
                {
                    let _e710 = i_11;
                    let _e711 = n_17;
                    let _e713 = k_2;
                    if ((_e710 >= _e711) || (_e713 >= POLY_MAX)) {
                        break;
                    }
                    let _e716 = i_11;
                    let _e718 = V_2[_e716];
                    xi_1 = _e718;
                    let _e720 = i_11;
                    let _e723 = n_17;
                    let _e726 = V_2[((_e720 + 1i) % _e723)];
                    xj_1 = _e726;
                    let _e728 = side;
                    let _e729 = KA;
                    let _e730 = xi_1;
                    let _e733 = KB;
                    let _e734 = xi_1;
                    let _e738 = KC;
                    di = (_e728 * (((_e729 * _e730.x) + (_e733 * _e734.y)) + _e738));
                    let _e742 = side;
                    let _e743 = KA;
                    let _e744 = xj_1;
                    let _e747 = KB;
                    let _e748 = xj_1;
                    let _e752 = KC;
                    dj = (_e742 * (((_e743 * _e744.x) + (_e747 * _e748.y)) + _e752));
                    let _e756 = di;
                    if (_e756 >= 0f) {
                        {
                            let _e759 = k_2;
                            let _e761 = xi_1;
                            W_3[_e759] = _e761;
                            let _e762 = k_2;
                            let _e764 = i_11;
                            let _e766 = EI[_e764];
                            WI[_e762] = _e766;
                            let _e767 = k_2;
                            let _e769 = i_11;
                            let _e771 = ES[_e769];
                            WS[_e767] = _e771;
                            let _e772 = k_2;
                            k_2 = (_e772 + 1i);
                        }
                    }
                    let _e775 = di;
                    let _e778 = dj;
                    let _e782 = k_2;
                    if (((_e775 >= 0f) != (_e778 >= 0f)) && (_e782 < POLY_MAX)) {
                        {
                            let _e785 = k_2;
                            let _e787 = xi_1;
                            let _e788 = xj_1;
                            let _e789 = xi_1;
                            let _e791 = di;
                            let _e792 = di;
                            let _e793 = dj;
                            W_3[_e785] = (_e787 + ((_e788 - _e789) * (_e791 / (_e792 - _e793))));
                            let _e798 = di;
                            if (_e798 >= 0f) {
                                {
                                    let _e801 = k_2;
                                    let _e803 = cid_4;
                                    WI[_e801] = _e803;
                                    let _e804 = k_2;
                                    let _e806 = g_10;
                                    WS[_e804] = _e806;
                                }
                            } else {
                                {
                                    let _e807 = k_2;
                                    let _e809 = i_11;
                                    let _e811 = EI[_e809];
                                    WI[_e807] = _e811;
                                    let _e812 = k_2;
                                    let _e814 = i_11;
                                    let _e816 = ES[_e814];
                                    WS[_e812] = _e816;
                                }
                            }
                            let _e817 = k_2;
                            k_2 = (_e817 + 1i);
                        }
                    }
                }
                continuing {
                    let _e707 = i_11;
                    i_11 = (_e707 + 1i);
                }
            }
            i_12 = 0i;
            loop {
                let _e822 = i_12;
                if !((_e822 < POLY_MAX)) {
                    break;
                }
                {
                    let _e828 = i_12;
                    let _e830 = i_12;
                    let _e832 = W_3[_e830];
                    V_2[_e828] = _e832;
                    let _e833 = i_12;
                    let _e835 = i_12;
                    let _e837 = WI[_e835];
                    EI[_e833] = _e837;
                    let _e838 = i_12;
                    let _e840 = i_12;
                    let _e842 = WS[_e840];
                    ES[_e838] = _e842;
                }
                continuing {
                    let _e825 = i_12;
                    i_12 = (_e825 + 1i);
                }
            }
            let _e843 = k_2;
            n_17 = _e843;
            let _e844 = (*id_2);
            let _e845 = side;
            if (_e845 > 0f) {
                local_71 = 1u;
            } else {
                local_71 = 0u;
            }
            let _e851 = local_71;
            let _e852 = lvl;
            let _e855 = floeHash(_e844, _e851, u32(_e852), 40503u);
            (*id_2) = _e855;
        }
        continuing {
            let _e372 = lvl;
            lvl = (_e372 + 1i);
        }
    }
    (*e_1) = 100000000000000000000f;
    (*lid_2) = 0u;
    loop {
        let _e864 = i_13;
        if !((_e864 < POLY_MAX)) {
            break;
        }
        {
            let _e870 = i_13;
            let _e871 = n_17;
            if (_e870 >= _e871) {
                break;
            }
            let _e873 = i_13;
            let _e876 = n_17;
            let _e879 = V_2[((_e873 + 1i) % _e876)];
            let _e880 = i_13;
            let _e882 = V_2[_e880];
            dv = (_e879 - _e882);
            let _e885 = dv;
            let _e886 = dv;
            if (dot(_e885, _e886) < 0.000000000000000000000001f) {
                continue;
            }
            let _e891 = b_4;
            let _e893 = dv;
            N3_[_e891] = -(_e893.y);
            let _e896 = d_10;
            let _e898 = dv;
            N3_[_e896] = _e898.x;
            let _e900 = ax;
            let _e902 = dv;
            let _e904 = i_13;
            let _e906 = V_2[_e904];
            let _e909 = dv;
            let _e911 = i_13;
            let _e913 = V_2[_e911];
            N3_[_e900] = ((_e902.y * _e906.x) - (_e909.x * _e913.y));
            let _e917 = N3_;
            N3_ = normalize(_e917);
            let _e919 = p_12;
            let _e920 = N3_;
            dn_3 = dot(_e919, _e920);
            let _e923 = dn_3;
            let _e925 = i_13;
            let _e927 = ES[_e925];
            ek = (abs(_e923) - max(_e927, 0.15f));
            let _e932 = ek;
            let _e933 = (*e_1);
            if (_e932 < _e933) {
                {
                    let _e935 = (*e_1);
                    e2_1 = _e935;
                    let _e936 = ek;
                    (*e_1) = _e936;
                    let _e937 = i_13;
                    let _e939 = EI[_e937];
                    (*lid_2) = _e939;
                }
            } else {
                let _e940 = ek;
                let _e941 = e2_1;
                if (_e940 < _e941) {
                    let _e943 = ek;
                    e2_1 = _e943;
                }
            }
            let _e944 = i_13;
            let _e946 = ES[_e944];
            let _e949 = dn_3;
            let _e951 = (*ridge);
            if ((_e946 < 0f) && (abs(_e949) < _e951.w)) {
                {
                    let _e955 = N3_;
                    let _e956 = dn_3;
                    let _e958 = (_e955 * sign(_e956));
                    let _e959 = dn_3;
                    (*ridge) = vec4<f32>(_e958.x, _e958.y, _e958.z, abs(_e959));
                    let _e965 = i_13;
                    let _e967 = ES[_e965];
                    rh = -(_e967);
                }
            }
        }
        continuing {
            let _e867 = i_13;
            i_13 = (_e867 + 1i);
        }
    }
    let _e970 = rh;
    if (_e970 > 0f) {
        let _e973 = rh;
        let _e976 = (*ridge);
        let _e979 = rh;
        local_72 = (_e973 * max(0f, (1f - (_e976.w / (2f * _e979)))));
    } else {
        local_72 = 0f;
    }
    let _e987 = local_72;
    (*ridge).w = _e987;
    let _e988 = m_6;
    let _e989 = ice_5;
    let _e990 = pieceCover(_e988, _e989);
    (*c_13) = _e990;
    let _e991 = s_7;
    let _e992 = (*id_2);
    let _e993 = (*c_13);
    let _e994 = floeRound(_e991, _e992, _e993);
    rr = _e994;
    let _e996 = e2_1;
    let _e997 = rr;
    if (_e996 < _e997) {
        let _e999 = rr;
        let _e1000 = rr;
        let _e1001 = (*e_1);
        let _e1003 = rr;
        let _e1004 = e2_1;
        (*e_1) = (_e999 - length(vec2<f32>((_e1000 - _e1001), (_e1003 - _e1004))));
    }
    let _e1009 = s_7;
    (*size_2) = _e1009;
    let _e1010 = m_6;
    (*mid) = _e1010;
    let _e1011 = (*c_13);
    let _e1014 = (*id_2);
    let _e1022 = (*c_13);
    (*there) = ((_e1011 > 0f) && ((f32((_e1014 & 65535u)) / 65536f) <= min(1f, (1.5f * _e1022))));
    return;
}

fn seaFloes(p_13: vec3<f32>, up_2: vec3<f32>, w_8: vec3<f32>, ice_6: f32, cPix: f32, foot_16: f32, frz_2: f32, pDay_2: f32, lead: ptr<function, vec2<f32>>, ridge_1: ptr<function, vec4<f32>>) -> vec4<f32> {
    var p_14: vec3<f32>;
    var up_3: vec3<f32>;
    var w_9: vec3<f32>;
    var ice_7: f32;
    var cPix_1: f32;
    var foot_17: f32;
    var frz_3: f32;
    var pDay_3: f32;
    var leadFar: vec2<f32>;
    var id_3: u32;
    var lid_3: u32;
    var e_2: f32;
    var c_14: f32;
    var size_3: f32;
    var mid_1: vec3<f32>;
    var there_1: bool;
    var fw_3: f32;
    var x_7: f32 = 0f;
    var rim: f32 = 0f;
    var age_2: f32;
    var kFar: f32;

    p_14 = p_13;
    up_3 = up_2;
    w_9 = w_8;
    ice_7 = ice_6;
    cPix_1 = cPix;
    foot_17 = foot_16;
    frz_3 = frz_2;
    pDay_3 = pDay_2;
    let _e201 = frz_3;
    let _e202 = pDay_3;
    let _e203 = leadIce(32768u, _e201, _e202);
    leadFar = _e203;
    (*lead) = vec2(0f);
    (*ridge_1) = vec4(0f);
    let _e209 = cPix_1;
    let _e212 = ice_7;
    if ((_e209 <= 0f) && (_e212 <= 0f)) {
        return vec4(0f);
    }
    let _e218 = foot_17;
    if (_e218 >= 64f) {
        {
            let _e221 = leadFar;
            (*lead) = _e221;
            let _e222 = cPix_1;
            let _e225 = cPix_1;
            return vec4<f32>(_e222, 0f, 0.7f, _e225);
        }
    }
    let _e234 = p_14;
    let _e235 = ice_7;
    floeOf(_e234, _e235, (&id_3), (&e_2), (&lid_3), (&c_14), (&size_3), (&mid_1), (&there_1), ridge_1);
    let _e252 = there_1;
    if !(_e252) {
        (*ridge_1) = vec4(0f);
    }
    let _e256 = e_2;
    let _e257 = p_14;
    let _e258 = w_9;
    let _e260 = tri(_e257, _e258, 8f);
    let _e266 = p_14;
    let _e267 = w_9;
    let _e269 = tri(_e266, _e267, 2f);
    e_2 = (_e256 + (((_e260.x - 0.5f) * 1.6f) + ((_e269.w - 0.5f) * 0.5f)));
    let _e277 = foot_17;
    fw_3 = max(_e277, 0.03f);
    let _e289 = size_3;
    let _e295 = id_3;
    age_2 = ((0.3f + (0.7f * smoothstep(16f, 200f, _e289))) * (0.6f + ((0.4f * f32((_e295 >> 16u))) / 65536f)));
    let _e305 = there_1;
    if _e305 {
        {
            let _e306 = e_2;
            let _e307 = fw_3;
            x_7 = clamp(((_e306 / _e307) + 0.5f), 0f, 1f);
            let _e317 = fw_3;
            let _e319 = e_2;
            rim = (1f - smoothstep(0f, (0.8f + _e317), _e319));
            let _e322 = lid_3;
            let _e323 = frz_3;
            let _e324 = pDay_3;
            let _e325 = leadIce(_e322, _e323, _e324);
            (*lead) = _e325;
        }
    }
    let _e328 = foot_17;
    kFar = smoothstep(16f, 64f, _e328);
    let _e331 = x_7;
    let _e332 = cPix_1;
    let _e333 = kFar;
    x_7 = mix(_e331, _e332, _e333);
    let _e335 = (*lead);
    let _e336 = leadFar;
    let _e337 = kFar;
    (*lead) = mix(_e335, _e336, vec2(_e337));
    let _e341 = (*ridge_1);
    let _e344 = kFar;
    (*ridge_1).w = (_e341.w * (1f - _e344));
    let _e347 = x_7;
    let _e348 = rim;
    let _e349 = x_7;
    let _e352 = kFar;
    let _e355 = age_2;
    let _e357 = kFar;
    let _e359 = c_14;
    let _e360 = cPix_1;
    let _e361 = kFar;
    return vec4<f32>(_e347, ((_e348 * _e349) * (1f - _e352)), mix(_e355, 0.7f, _e357), mix(_e359, _e360, _e361));
}

fn main_1() {
    var foot_18: f32;
    var dpx: vec3<f32>;
    var dpy: vec3<f32>;
    var dEnc: vec2<f32>;
    var shoreX_2: f32 = -1f;
    var dShoreX: vec2<f32>;
    var albedo: vec3<f32>;
    var waterEnc: f32;
    var dn_4: f32;
    var veg: f32;
    var snow: f32;
    var rock: f32;
    var sand: f32;
    var emissive: f32;
    var wet: f32;
    var rough_1: f32;
    var rel_4: vec3<f32>;
    var r_10: f32;
    var up_4: vec3<f32>;
    var dist_3: f32;
    var colC: vec3<f32>;
    var shoreV: f32;
    var cK: f32;
    var cc_1: vec4<f32>;
    var N_4: vec3<f32>;
    var muS_2: f32;
    var sunT: vec3<f32>;
    var skyE_1: vec3<f32>;
    var cloudT: f32;
    var pF_3: vec3<f32>;
    var sunTop: vec3<f32>;
    var keySh: f32;
    var fp_10: vec3<f32>;
    var fn_: vec3<f32>;
    var w_10: vec3<f32>;
    var fineK: f32;
    var midK: f32;
    var farK: f32;
    var local_73: f32;
    var isWater: f32;
    var gRough: f32 = 0.8f;
    var gAO: f32 = 1f;
    var ndl_1: f32;
    var color: vec3<f32>;
    var dbgW: vec3<f32> = vec3(-1f);
    var V_3: vec3<f32>;
    var upF_7: vec3<f32>;
    var local_74: vec3<f32>;
    var lq: vec3<f32>;
    var kind_4: f32;
    var Tm_2: f32;
    var river_3: bool;
    var local_75: f32;
    var flow_4: f32;
    var local_76: f32;
    var local_77: f32;
    var local_78: f32;
    var fetch_2: f32;
    var depthW: f32;
    var nW: vec4<f32>;
    var nG: vec4<f32>;
    var wn_2: vec2<f32>;
    var grp_4: vec4<f32>;
    var nF_1: vec3<f32>;
    var wr: f32;
    var foam_2: f32;
    var fv_2: f32;
    var gradH_2: vec3<f32> = vec3(0f);
    var gradX_2: vec3<f32> = vec3(0f);
    var a11_1: f32;
    var a12_: f32;
    var a22_: f32;
    var det: f32;
    var tsf: vec2<f32>;
    var ice_8: f32;
    var local_79: f32;
    var iceC: f32;
    var local_80: f32;
    var pDay_4: f32;
    var lead_1: vec2<f32> = vec2(0f);
    var local_81: f32;
    var Tair_2: f32;
    var ridge_2: vec4<f32> = vec4(0f);
    var local_82: vec4<f32>;
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
    var a_15: vec3<f32>;
    var bb: vec3<f32>;
    var H_2: vec3<f32>;
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
    var local_83: f32;
    var fallK: f32;
    var dbgWhite: f32 = 0f;
    var dn_5: vec3<f32>;
    var down: vec3<f32>;
    var acr: vec3<f32>;
    var local_84: f32;
    var zf: f32;
    var v_1: f32;
    var t1_: f32;
    var t2_1: f32;
    var wa_2: f32;
    var L_7: f32;
    var local_85: vec3<f32>;
    var pS: vec3<f32>;
    var q_7: vec2<f32>;
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
    var br_1: f32;
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
    var local_86: vec3<f32>;
    var fd_1: vec3<f32>;
    var fa_1: vec3<f32>;
    var q2_: vec2<f32>;
    var fz_1: f32;
    var core: f32;
    var ring_1: f32;
    var fm: f32;
    var dI: vec4<f32>;
    var dJ: vec4<f32>;
    var lIce: f32;
    var lAlb: vec3<f32>;
    var local_87: f32;
    var thaw: f32;
    var snowy: f32;
    var iceAlb: vec3<f32>;
    var local_88: f32;
    var pond_1: f32;
    var N2_: vec3<f32>;
    var blk: f32;
    var iceCol: vec3<f32>;
    var NdH2_: f32;
    var iceF: f32;
    var dnI: vec3<f32>;
    var downI: vec3<f32>;
    var acrI: vec3<f32>;
    var local_89: vec3<f32>;
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
    var local_90: f32;
    var local_91: vec3<f32>;
    var local_92: vec3<f32>;
    var local_93: vec3<f32>;
    var local_94: vec3<f32>;
    var local_95: vec3<f32>;
    var a_16: vec3<f32>;
    var flick: f32;
    var crust: f32;
    var local_96: vec3<f32>;
    var local_97: f32;

    let _e182 = vWorldPos_1;
    let _e183 = fwidth(_e182);
    foot_18 = length(_e183);
    let _e186 = vFixedPos_1;
    let _e187 = dpdx(_e186);
    dpx = _e187;
    let _e189 = vFixedPos_1;
    let _e190 = dpdy(_e189);
    dpy = _e190;
    let _e192 = vCol_1;
    let _e194 = dpdx(_e192.w);
    let _e195 = vCol_1;
    let _e197 = dpdy(_e195.w);
    dEnc = vec2<f32>(_e194, _e197);
    let _e203 = global.uColourCube;
    if (_e203.x > 0.5f) {
        let _e207 = global.uToFixed;
        let _e208 = vWorldPos_1;
        let _e209 = global.uCenter;
        let _e214 = colourCubeShoreSmooth(normalize((_e207 * normalize((_e208 - _e209)))));
        let _e215 = global.uColourCube;
        shoreX_2 = (_e214 * _e215.z);
    }
    let _e218 = shoreX_2;
    let _e219 = dpdx(_e218);
    let _e220 = shoreX_2;
    let _e221 = dpdy(_e220);
    dShoreX = vec2<f32>(_e219, _e221);
    let _e224 = vCol_1;
    let _e226 = vCol_1;
    albedo = (_e224.xyz * _e226.xyz);
    let _e230 = vCol_1;
    waterEnc = _e230.w;
    let _e233 = global.uNear;
    if (_e233.x > 0.5f) {
        {
            let _e237 = vNearRel_1;
            let _e238 = global.uNearUp;
            let _e239 = vNearRel_1;
            let _e240 = global.uNearUp;
            dn_4 = length((_e237 - (_e238 * dot(_e239, _e240))));
            let _e246 = global.uNearMode;
            if (_e246 < 0.5f) {
                {
                    let _e249 = dn_4;
                    let _e251 = global.uNear;
                    let _e255 = vShore_1;
                    if ((_e249 < (0.97f * _e251.y)) && (_e255 <= 0f)) {
                        discard;
                    }
                }
            } else {
                let _e259 = dn_4;
                let _e260 = global.uNearBand;
                let _e263 = dn_4;
                let _e264 = global.uNearBand;
                if ((_e259 < _e260.x) || (_e263 > _e264.y)) {
                    discard;
                }
            }
        }
    }
    let _e268 = vMat_1;
    veg = _e268.x;
    let _e271 = vMat_1;
    snow = _e271.y;
    let _e274 = vMat_1;
    rock = _e274.z;
    let _e277 = vMat_1;
    sand = _e277.w;
    let _e280 = vExt_1;
    emissive = _e280.x;
    let _e283 = vExt_1;
    wet = _e283.y;
    let _e286 = vExt_1;
    rough_1 = _e286.z;
    let _e289 = vWorldPos_1;
    let _e290 = global.uCenter;
    rel_4 = (_e289 - _e290);
    let _e293 = rel_4;
    r_10 = length(_e293);
    let _e296 = rel_4;
    let _e297 = r_10;
    up_4 = (_e296 / vec3(_e297));
    let _e301 = vWorldPos_1;
    dist_3 = length(_e301);
    let _e304 = vCol_1;
    colC = _e304.xyz;
    let _e307 = vShore_1;
    shoreV = _e307;
    let _e309 = dist_3;
    let _e310 = colourCubeK(_e309);
    cK = _e310;
    let _e312 = cK;
    if (_e312 > 0f) {
        {
            let _e315 = global.uToFixed;
            let _e316 = up_4;
            let _e319 = colourCubeAt(normalize((_e315 * _e316)));
            cc_1 = _e319;
            let _e321 = colC;
            let _e322 = cc_1;
            let _e324 = cK;
            colC = mix(_e321, _e322.xyz, vec3(_e324));
            let _e327 = shoreV;
            let _e328 = cc_1;
            let _e330 = colourCubeShoreV(_e328.w);
            let _e331 = cK;
            shoreV = mix(_e327, _e330, _e331);
            let _e333 = colC;
            let _e334 = colC;
            albedo = (_e333 * _e334);
        }
    }
    let _e336 = vNormal_1;
    N_4 = normalize(_e336);
    let _e339 = up_4;
    let _e340 = global.uSunDir;
    muS_2 = dot(_e339, _e340);
    let _e343 = r_10;
    let _e344 = muS_2;
    let _e345 = atmoSunTransmittance(_e343, _e344);
    sunT = _e345;
    let _e347 = r_10;
    let _e348 = muS_2;
    let _e349 = atmoSkyIrradiance(_e347, _e348);
    skyE_1 = _e349;
    let _e351 = rel_4;
    let _e352 = r_10;
    let _e353 = muS_2;
    let _e354 = foot_18;
    let _e355 = sunT;
    let _e358 = cloudLight(_e351, _e352, _e353, _e354, _e355, (&skyE_1));
    cloudT = _e358;
    let _e360 = sunT;
    let _e361 = cloudT;
    sunT = (_e360 * _e361);
    let _e363 = global.uToFixed;
    let _e364 = rel_4;
    pF_3 = (_e363 * _e364);
    let _e367 = sunT;
    let _e368 = pF_3;
    let _e369 = pF_3;
    let _e371 = global.uToFixed;
    let _e372 = global.uSunDir;
    let _e374 = global.uRadius;
    let _e375 = terrainShadow(_e368, normalize(_e369), (_e371 * _e372), _e374);
    sunT = (_e367 * _e375);
    let _e377 = sunT;
    sunTop = _e377;
    let _e379 = vWorldPos_1;
    let _e380 = N_4;
    let _e381 = sunShadowMap(_e379, _e380);
    keySh = _e381;
    let _e383 = sunT;
    let _e384 = keySh;
    sunT = (_e383 * _e384);
    let _e386 = vFixedPos_1;
    fp_10 = _e386;
    let _e388 = vFixedNormal_1;
    fn_ = normalize(_e388);
    let _e391 = fn_;
    w_10 = pow(abs(_e391), vec3(4f));
    let _e397 = w_10;
    let _e398 = w_10;
    let _e400 = w_10;
    let _e403 = w_10;
    w_10 = (_e397 / vec3(((_e398.x + _e400.y) + _e403.z)));
    let _e411 = dist_3;
    fineK = (1f - smoothstep(60f, 900f, _e411));
    let _e418 = dist_3;
    midK = (1f - smoothstep(600f, 9000f, _e418));
    let _e425 = dist_3;
    farK = (1f - smoothstep(6000f, 90000f, _e425));
    let _e429 = shoreV;
    if (_e429 > 0f) {
        local_73 = 1f;
    } else {
        local_73 = 0f;
    }
    let _e435 = local_73;
    isWater = _e435;
    let _e441 = isWater;
    if (_e441 < 0.5f) {
        discard;
    }
    let _e444 = N_4;
    let _e445 = global.uSunDir;
    ndl_1 = max(dot(_e444, _e445), 0f);
    let _e455 = isWater;
    if (_e455 > 0.5f) {
        {
            let _e458 = vWorldPos_1;
            V_3 = normalize(-(_e458));
            let _e462 = global.uToFixed;
            let _e463 = up_4;
            upF_7 = (_e462 * _e463);
            let _e466 = vLiq_1;
            if (_e466.x > 0.02f) {
                let _e470 = vLiq_1;
                let _e472 = vLiq_1;
                local_74 = (_e470.yzw / vec3(_e472.x));
            } else {
                local_74 = vec3<f32>(0f, 0.75f, 1f);
            }
            let _e481 = local_74;
            lq = _e481;
            let _e483 = lq;
            kind_4 = _e483.x;
            let _e486 = lq;
            Tm_2 = ((_e486.y * 120f) - 60f);
            let _e493 = kind_4;
            let _e496 = kind_4;
            river_3 = ((_e493 > 0.55f) && (_e496 < 0.85f));
            let _e501 = river_3;
            if _e501 {
                let _e502 = lq;
                local_75 = _e502.z;
            } else {
                local_75 = 0f;
            }
            let _e506 = local_75;
            flow_4 = _e506;
            let _e508 = kind_4;
            if (_e508 < 0.2f) {
                local_78 = 1f;
            } else {
                let _e512 = river_3;
                if _e512 {
                    local_77 = 0.2f;
                } else {
                    let _e514 = kind_4;
                    if (_e514 > 0.85f) {
                        local_76 = 0.05f;
                    } else {
                        let _e518 = lq;
                        local_76 = _e518.z;
                    }
                    let _e521 = local_76;
                    local_77 = _e521;
                }
                let _e523 = local_77;
                local_78 = _e523;
            }
            let _e525 = local_78;
            fetch_2 = _e525;
            let _e527 = waterEnc;
            let _e528 = waterEnc;
            let _e534 = shoreV;
            depthW = (((_e527 * _e528) * 6000f) * smoothstep(0f, 0.125f, _e534));
            let _e538 = fp_10;
            let _e539 = w_10;
            let _e541 = tri(_e538, _e539, 512f);
            nW = _e541;
            let _e543 = fp_10;
            let _e544 = w_10;
            let _e546 = tri(_e543, _e544, 64f);
            nG = _e546;
            let _e548 = nW;
            let _e552 = nW;
            wn_2 = (vec2<f32>((_e548.x - 0.5f), (_e552.w - 0.5f)) * 2f);
            let _e560 = nG;
            let _e562 = nG;
            let _e564 = nW;
            let _e566 = nW;
            grp_4 = clamp(((vec4<f32>(_e560.x, _e562.w, _e564.w, _e566.x) * 1.6f) - vec4(0.3f)), vec4(0f), vec4(1f));
            let _e583 = vFlw_1;
            fv_2 = (max(_e583.w, 0f) * 9f);
            {
                let _e596 = dpx;
                let _e597 = dpx;
                a11_1 = dot(_e596, _e597);
                let _e600 = dpx;
                let _e601 = dpy;
                a12_ = dot(_e600, _e601);
                let _e604 = dpy;
                let _e605 = dpy;
                a22_ = dot(_e604, _e605);
                let _e608 = a11_1;
                let _e609 = a22_;
                let _e611 = a12_;
                let _e612 = a12_;
                det = ((_e608 * _e609) - (_e611 * _e612));
                let _e616 = det;
                if (_e616 > 0.000000000001f) {
                    {
                        let _e620 = waterEnc;
                        let _e622 = a22_;
                        let _e623 = dEnc;
                        let _e626 = a12_;
                        let _e627 = dEnc;
                        let _e631 = dpx;
                        let _e633 = a11_1;
                        let _e634 = dEnc;
                        let _e637 = a12_;
                        let _e638 = dEnc;
                        let _e642 = dpy;
                        let _e646 = det;
                        gradH_2 = (((12000f * _e620) * ((((_e622 * _e623.x) - (_e626 * _e627.y)) * _e631) + (((_e633 * _e634.y) - (_e637 * _e638.x)) * _e642))) / vec3(_e646));
                        let _e649 = a22_;
                        let _e650 = dShoreX;
                        let _e653 = a12_;
                        let _e654 = dShoreX;
                        let _e658 = dpx;
                        let _e660 = a11_1;
                        let _e661 = dShoreX;
                        let _e664 = a12_;
                        let _e665 = dShoreX;
                        let _e669 = dpy;
                        let _e672 = det;
                        gradX_2 = (((((_e649 * _e650.x) - (_e653 * _e654.y)) * _e658) + (((_e660 * _e661.y) - (_e664 * _e665.x)) * _e669)) / vec3(_e672));
                    }
                }
            }
            let _e675 = fp_10;
            let _e676 = fn_;
            let _e677 = upF_7;
            let _e678 = kind_4;
            let _e679 = flow_4;
            let _e680 = fetch_2;
            let _e681 = depthW;
            let _e682 = foot_18;
            let _e683 = wn_2;
            let _e684 = grp_4;
            let _e685 = vFlw_1;
            let _e687 = fv_2;
            let _e688 = gradH_2;
            let _e689 = shoreX_2;
            let _e690 = gradX_2;
            liquidSurface(_e675, _e676, _e677, _e678, _e679, _e680, _e681, _e682, _e683, _e684, _e685.xyz, _e687, _e688, _e689, _e690, (&nF_1), (&wr), (&foam_2));
            let _e697 = Tm_2;
            let _e698 = kind_4;
            let _e699 = flow_4;
            let _e700 = upF_7;
            let _e701 = liquidTs(_e697, _e698, _e699, _e700);
            tsf = _e701;
            let _e704 = tsf;
            let _e708 = tsf;
            let _e712 = tsf;
            ice_8 = (1f - smoothstep((_e704.y - 4f), (_e708.y + 4f), _e712.x));
            let _e717 = kind_4;
            let _e720 = ice_8;
            if ((_e717 < 0.2f) && (_e720 > 0f)) {
                let _e724 = ice_8;
                let _e725 = nW;
                let _e727 = nG;
                let _e729 = seaIceCover(_e724, _e725.w, _e727.x);
                local_79 = _e729;
            } else {
                local_79 = 0f;
            }
            let _e732 = local_79;
            iceC = _e732;
            let _e734 = global.uSeason;
            if (_e734.z > 0.5f) {
                let _e739 = upF_7;
                let _e740 = seasonYear(_e739);
                let _e744 = global.uSeason;
                local_80 = (((12f * _e740.z) * DDF_SNOW) / max(_e744.y, 1f));
            } else {
                local_80 = 0f;
            }
            let _e751 = local_80;
            pDay_4 = _e751;
            let _e756 = global.uSeason;
            if (_e756.z > 0.5f) {
                let _e760 = Tm_2;
                let _e761 = upF_7;
                let _e762 = seasonIceNow(_e761);
                local_81 = (_e760 + _e762);
            } else {
                let _e764 = tsf;
                local_81 = _e764.x;
            }
            let _e767 = local_81;
            Tair_2 = _e767;
            let _e772 = kind_4;
            if (_e772 < 0.2f) {
                let _e775 = pF_3;
                let _e776 = upF_7;
                let _e777 = w_10;
                let _e778 = ice_8;
                let _e779 = iceC;
                let _e780 = foot_18;
                let _e781 = tsf;
                let _e783 = Tair_2;
                let _e787 = pDay_4;
                let _e792 = seaFloes(_e775, _e776, _e777, _e778, _e779, _e780, max((_e781.y - _e783), 0f), _e787, (&lead_1), (&ridge_2));
                local_82 = _e792;
            } else {
                let _e793 = ice_8;
                local_82 = vec4<f32>(_e793, 0f, 1f, 0f);
            }
            let _e799 = local_82;
            fl = _e799;
            let _e803 = iceC;
            let _e804 = fl;
            calm = smoothstep(0.05f, 0.6f, max(_e803, _e804.w));
            let _e809 = nF_1;
            let _e810 = upF_7;
            let _e812 = calm;
            nF_1 = normalize(mix(_e809, _e810, vec3((0.9f * _e812))));
            let _e817 = wr;
            let _e820 = calm;
            wr = (_e817 * (1f - (0.8f * _e820)));
            let _e824 = foam_2;
            let _e826 = calm;
            foam_2 = (_e824 * (1f - _e826));
            let _e829 = river_3;
            if _e829 {
                let _e830 = nF_1;
                let _e831 = fn_;
                let _e835 = fn_;
                let _e836 = upF_7;
                nF_1 = normalize(mix(_e830, _e831, vec3(smoothstep(0.13f, 0.3f, (1f - dot(_e835, _e836))))));
            }
            let _e843 = river_3;
            let _e844 = global.uLiquid2_;
            if (_e843 && (_e844.y > 0.9f)) {
                let _e849 = albedo;
                let _e856 = fv_2;
                albedo = mix(_e849, vec3<f32>(0.055f, 0.045f, 0.025f), vec3(clamp((0.25f + (0.3f * _e856)), 0f, 0.75f)));
            }
            let _e864 = global.uToFixed;
            let _e866 = nF_1;
            Nw = normalize((transpose(_e864) * _e866));
            let _e870 = Nw;
            let _e871 = V_3;
            let _e874 = Nw;
            let _e875 = V_3;
            Nw = normalize((_e870 + (_e871 * max(0f, (0.02f - dot(_e874, _e875))))));
            let _e882 = Nw;
            let _e883 = V_3;
            NdV = max(dot(_e882, _e883), 0.001f);
            let _e888 = Nw;
            let _e889 = global.uSunDir;
            ndlW = max(dot(_e888, _e889), 0f);
            let _e894 = global.uLiquid;
            F0_ = _e894.x;
            let _e897 = F0_;
            let _e899 = wr;
            let _e901 = F0_;
            let _e903 = F0_;
            let _e906 = NdV;
            F = (_e897 + ((max((1f - _e899), _e901) - _e903) * pow((1f - _e906), 5f)));
            let _e913 = V_3;
            let _e915 = Nw;
            R_3 = reflect(-(_e913), _e915);
            let _e918 = R_3;
            let _e919 = up_4;
            el = max(dot(_e918, _e919), 0f);
            let _e927 = el;
            let _e936 = el;
            let _e941 = cloudT;
            skyG = mix((0.7f + (1.1f * pow((1f - _e927), 3f))), (0.4286f * (1f + (2f * _e936))), clamp((1f - _e941), 0f, 1f));
            let _e948 = global.uSunE;
            let _e949 = skyE_1;
            let _e954 = skyG;
            let _e956 = global.uSunE;
            let _e957 = sunT;
            let _e961 = R_3;
            let _e962 = global.uSunDir;
            skyRefl = ((((_e948 * _e949) / vec3(3.1415927f)) * _e954) + (((_e956 * _e957) * 0.05f) * pow(max(dot(_e961, _e962), 0f), 12f)));
            let _e971 = global.uMoonE;
            if (_e971.y > 0f) {
                {
                    let _e975 = up_4;
                    let _e976 = global.uMoonDir;
                    muMr = dot(_e975, _e976);
                    let _e979 = skyRefl;
                    let _e980 = global.uMoonE;
                    let _e981 = r_10;
                    let _e982 = muMr;
                    let _e983 = atmoSkyIrradiance(_e981, _e982);
                    let _e988 = skyG;
                    let _e990 = global.uMoonE;
                    let _e991 = r_10;
                    let _e992 = muMr;
                    let _e995 = atmoSunTransmittance(_e991, max(_e992, 0f));
                    let _e999 = R_3;
                    let _e1000 = global.uMoonDir;
                    skyRefl = (_e979 + ((((_e980 * _e983) / vec3(3.1415927f)) * _e988) + (((_e990 * _e995) * 0.05f) * pow(max(dot(_e999, _e1000), 0f), 12f))));
                }
            }
            let _e1009 = albedo;
            let _e1013 = global.uSunE;
            let _e1014 = sunT;
            let _e1016 = muS_2;
            let _e1022 = global.uSunE;
            let _e1023 = skyE_1;
            body = ((_e1009 / vec3(3.1415927f)) * ((((_e1013 * _e1014) * max(_e1016, 0f)) * 0.6f) + ((_e1022 * _e1023) * 0.5f)));
            let _e1030 = river_3;
            let _e1031 = global.uLiquid2_;
            if (_e1030 && (_e1031.y > 0.9f)) {
                {
                    let _e1037 = fv_2;
                    let _e1039 = fv_2;
                    let _e1041 = fv_2;
                    ssc = clamp((((30f * _e1037) * _e1039) * _e1041), 0.5f, 3000f);
                    let _e1047 = global.uLiquid3_;
                    let _e1049 = ssc;
                    let _e1056 = global.uLiquid3_;
                    a_15 = ((_e1047.xyz + (_e1049 * vec3<f32>(0.012f, 0.02f, 0.035f))) + (_e1056.w * vec3<f32>(0.078f, 0.207f, 0.687f)));
                    let _e1068 = ssc;
                    bb = vec3((0.00475f * _e1068));
                    let _e1073 = bb;
                    let _e1075 = a_15;
                    let _e1076 = bb;
                    let _e1082 = global.uSunE;
                    let _e1083 = sunT;
                    let _e1085 = muS_2;
                    let _e1089 = global.uSunE;
                    let _e1090 = skyE_1;
                    body = ((((0.33f * _e1073) / (_e1075 + _e1076)) / vec3(3.1415927f)) * (((_e1082 * _e1083) * max(_e1085, 0f)) + (_e1089 * _e1090)));
                }
            }
            let _e1094 = V_3;
            let _e1095 = global.uSunDir;
            H_2 = normalize((_e1094 + _e1095));
            let _e1099 = wr;
            let _e1100 = wr;
            let _e1102 = wr;
            let _e1104 = wr;
            a2_ = (((_e1099 * _e1100) * _e1102) * _e1104);
            let _e1107 = a2_;
            a2s = max(_e1107, 0.0000001f);
            let _e1111 = Nw;
            let _e1112 = H_2;
            NdH = max(dot(_e1111, _e1112), 0f);
            let _e1117 = V_3;
            let _e1118 = H_2;
            VdH = max(dot(_e1117, _e1118), 0f);
            let _e1123 = a2s;
            let _e1124 = NdH;
            let _e1125 = NdH;
            let _e1127 = a2s;
            Dg = (_e1123 / (PI * pow((((_e1124 * _e1125) * (_e1127 - 1f)) + 1f), 2f)));
            let _e1138 = wr;
            let _e1141 = wr;
            kg = (((_e1138 + 1f) * (_e1141 + 1f)) / 8f);
            let _e1148 = NdV;
            let _e1149 = NdV;
            let _e1151 = kg;
            let _e1154 = kg;
            let _e1157 = ndlW;
            let _e1159 = ndlW;
            let _e1161 = kg;
            let _e1164 = kg;
            Gg = (((_e1148 / ((_e1149 * (1f - _e1151)) + _e1154)) * _e1157) / ((_e1159 * (1f - _e1161)) + _e1164));
            let _e1168 = F0_;
            let _e1170 = F0_;
            let _e1173 = VdH;
            Fs = (_e1168 + ((1f - _e1170) * pow((1f - _e1173), 5f)));
            let _e1180 = body;
            let _e1182 = F;
            let _e1185 = skyRefl;
            let _e1186 = F;
            let _e1189 = global.uSunE;
            let _e1190 = sunT;
            let _e1192 = Dg;
            let _e1194 = Gg;
            let _e1196 = Fs;
            let _e1199 = NdV;
            let _e1204 = muS_2;
            color = (((_e1180 * (1f - _e1182)) + (_e1185 * _e1186)) + ((((((_e1189 * _e1190) * _e1192) * _e1194) * _e1196) / vec3((4f * _e1199))) * step(0f, _e1204)));
            let _e1208 = global.uMoonE;
            if (_e1208.y > 0f) {
                {
                    let _e1212 = up_4;
                    let _e1213 = global.uMoonDir;
                    muMn = dot(_e1212, _e1213);
                    let _e1216 = muMn;
                    if (_e1216 > -0.02f) {
                        {
                            let _e1220 = V_3;
                            let _e1221 = global.uMoonDir;
                            Hm = normalize((_e1220 + _e1221));
                            let _e1225 = Nw;
                            let _e1226 = Hm;
                            NdHm = max(dot(_e1225, _e1226), 0f);
                            let _e1231 = V_3;
                            let _e1232 = Hm;
                            VdHm = max(dot(_e1231, _e1232), 0f);
                            let _e1237 = Nw;
                            let _e1238 = global.uMoonDir;
                            ndlM = max(dot(_e1237, _e1238), 0f);
                            let _e1243 = a2s;
                            let _e1244 = NdHm;
                            let _e1245 = NdHm;
                            let _e1247 = a2s;
                            Dm = (_e1243 / (PI * pow((((_e1244 * _e1245) * (_e1247 - 1f)) + 1f), 2f)));
                            let _e1258 = NdV;
                            let _e1259 = NdV;
                            let _e1261 = kg;
                            let _e1264 = kg;
                            let _e1267 = ndlM;
                            let _e1269 = ndlM;
                            let _e1271 = kg;
                            let _e1274 = kg;
                            Gm = (((_e1258 / ((_e1259 * (1f - _e1261)) + _e1264)) * _e1267) / ((_e1269 * (1f - _e1271)) + _e1274));
                            let _e1278 = F0_;
                            let _e1280 = F0_;
                            let _e1283 = VdHm;
                            Fm = (_e1278 + ((1f - _e1280) * pow((1f - _e1283), 5f)));
                            let _e1290 = color;
                            let _e1291 = global.uMoonE;
                            let _e1292 = r_10;
                            let _e1293 = muMn;
                            let _e1296 = atmoSunTransmittance(_e1292, max(_e1293, 0f));
                            let _e1298 = cloudDirZ;
                            let _e1300 = Dm;
                            let _e1302 = Gm;
                            let _e1304 = Fm;
                            let _e1307 = NdV;
                            color = (_e1290 + ((((((_e1291 * _e1296) * _e1298) * _e1300) * _e1302) * _e1304) / vec3((4f * _e1307))));
                        }
                    }
                }
            }
            let _e1312 = global.uSunE;
            let _e1313 = sunT;
            let _e1315 = up_4;
            let _e1316 = global.uSunDir;
            let _e1321 = global.uSunE;
            let _e1322 = skyE_1;
            lit_1 = (((_e1312 * _e1313) * max(dot(_e1315, _e1316), 0f)) + (_e1321 * _e1322));
            let _e1326 = river_3;
            if _e1326 {
                let _e1330 = fn_;
                let _e1331 = upF_7;
                local_83 = smoothstep(0.13f, 0.3f, (1f - dot(_e1330, _e1331)));
            } else {
                local_83 = 0f;
            }
            let _e1337 = local_83;
            fallK = _e1337;
            let _e1341 = fallK;
            if (_e1341 > 0f) {
                {
                    let _e1344 = upF_7;
                    let _e1345 = fn_;
                    let _e1346 = upF_7;
                    let _e1347 = fn_;
                    dn_5 = (_e1344 - (_e1345 * dot(_e1346, _e1347)));
                    let _e1352 = dn_5;
                    let _e1354 = dn_5;
                    down = (-(_e1352) / vec3(max(length(_e1354), 0.0001f)));
                    let _e1361 = fn_;
                    let _e1362 = down;
                    acr = normalize(cross(_e1361, _e1362));
                    let _e1366 = global.uFallTop;
                    if (_e1366 > 0f) {
                        let _e1369 = global.uFallTop;
                        let _e1370 = r_10;
                        local_84 = max((_e1369 - _e1370), 0f);
                    } else {
                        local_84 = 4f;
                    }
                    let _e1376 = local_84;
                    zf = _e1376;
                    let _e1379 = global.uFall1_;
                    let _e1382 = zf;
                    let _e1387 = global.uFall1_;
                    v_1 = min((sqrt(((2f * _e1379.x) * _e1382)) + 0.3f), _e1387.y);
                    let _e1391 = global.uTime;
                    t1_ = fract((_e1391 * 0.4f));
                    let _e1396 = global.uTime;
                    t2_1 = fract(((_e1396 * 0.4f) + 0.5f));
                    let _e1405 = t1_;
                    wa_2 = (1f - abs(((2f * _e1405) - 1f)));
                    let _e1414 = v_1;
                    L_7 = (1f + (0.12f * _e1414));
                    let _e1418 = vFixedPos_1;
                    let _e1419 = global.uOriginMod;
                    let _e1421 = global.uFallTop;
                    if (_e1421 > 0f) {
                        let _e1424 = global.uFallFoot;
                        local_85 = _e1424;
                    } else {
                        local_85 = vec3(0f);
                    }
                    let _e1428 = local_85;
                    pS = ((_e1418 - _e1419) - _e1428);
                    let _e1431 = pS;
                    let _e1432 = acr;
                    let _e1436 = pS;
                    let _e1437 = down;
                    let _e1440 = L_7;
                    q_7 = vec2<f32>((dot(_e1431, _e1432) / 4.8f), (dot(_e1436, _e1437) / (48f * _e1440)));
                    let _e1445 = v_1;
                    let _e1449 = L_7;
                    dv_1 = ((_e1445 * 2.5f) / (48f * _e1449));
                    let _e1453 = q_7;
                    let _e1455 = dv_1;
                    let _e1456 = t1_;
                    qA = (_e1453 - vec2<f32>(0f, (_e1455 * _e1456)));
                    let _e1461 = q_7;
                    let _e1467 = dv_1;
                    let _e1468 = t2_1;
                    qB = ((_e1461 + vec2<f32>(0.37f, 0f)) - vec2<f32>(0f, (_e1467 * _e1468)));
                    let _e1473 = qA;
                    let _e1475 = textureSampleLevel(tDetailTexture, tDetailSampler, _e1473, 0f);
                    bA = _e1475.x;
                    let _e1478 = qB;
                    let _e1480 = textureSampleLevel(tDetailTexture, tDetailSampler, _e1478, 0f);
                    bB = _e1480.x;
                    let _e1483 = bA;
                    let _e1485 = q_7;
                    let _e1496 = dv_1;
                    let _e1498 = t1_;
                    let _e1503 = textureSampleLevel(tDetailTexture, tDetailSampler, (((_e1485 * vec2<f32>(3f, 2f)) + vec2<f32>(0.53f, 0f)) - vec2<f32>(0f, ((2f * _e1496) * _e1498))), 0f);
                    sA = (_e1483 + (0.45f * _e1503.x));
                    let _e1508 = bB;
                    let _e1510 = q_7;
                    let _e1521 = dv_1;
                    let _e1523 = t2_1;
                    let _e1528 = textureSampleLevel(tDetailTexture, tDetailSampler, (((_e1510 * vec2<f32>(3f, 2f)) + vec2<f32>(0.11f, 0f)) - vec2<f32>(0f, ((2f * _e1521) * _e1523))), 0f);
                    sB = (_e1508 + (0.45f * _e1528.x));
                    let _e1534 = sB;
                    let _e1535 = sA;
                    let _e1536 = wa_2;
                    st_2 = clamp((0.5f + ((mix(_e1534, _e1535, _e1536) - 0.725f) * 2.2f)), 0f, 1f);
                    let _e1547 = qB;
                    let _e1553 = textureSampleLevel(tDetailTexture, tDetailSampler, (_e1547 + vec2<f32>(0.031f, 0f)), 0f);
                    let _e1555 = bB;
                    let _e1557 = qA;
                    let _e1563 = textureSampleLevel(tDetailTexture, tDetailSampler, (_e1557 + vec2<f32>(0.031f, 0f)), 0f);
                    let _e1565 = bA;
                    let _e1567 = wa_2;
                    gS = (mix((_e1553.x - _e1555), (_e1563.x - _e1565), _e1567) / 0.15f);
                    let _e1574 = vFlw_1;
                    qU = max((_e1574.w * 9f), 0.3f);
                    let _e1581 = zf;
                    let _e1583 = qU;
                    br_1 = clamp((_e1581 / (6f * pow(_e1583, 0.32f))), 0f, 1f);
                    let _e1594 = global.uFall2_;
                    let _e1599 = zf;
                    aer = (mix(0.25f, 0.95f, _e1594.y) * smoothstep(0f, 0.5f, _e1599));
                    let _e1605 = br_1;
                    th_2 = mix(0.72f, 0.22f, _e1605);
                    let _e1608 = th_2;
                    let _e1611 = th_2;
                    let _e1614 = st_2;
                    let _e1616 = edge;
                    jets = smoothstep((_e1608 - 0.14f), (_e1611 + 0.14f), (_e1614 + (0.75f * (_e1616 - 1f))));
                    let _e1623 = aer;
                    let _e1624 = jets;
                    white = clamp((_e1623 * _e1624), 0f, 1f);
                    let _e1630 = white;
                    dbgWhite = _e1630;
                    let _e1631 = Nw;
                    let _e1632 = global.uToFixed;
                    let _e1634 = acr;
                    let _e1636 = gS;
                    nS = normalize((_e1631 + ((transpose(_e1632) * _e1634) * clamp((_e1636 * 1.6f), -0.9f, 0.9f))));
                    let _e1647 = global.uSunE;
                    let _e1648 = sunT;
                    let _e1650 = nS;
                    let _e1651 = global.uSunDir;
                    let _e1656 = global.uSunE;
                    let _e1657 = skyE_1;
                    litS = (((_e1647 * _e1648) * max(dot(_e1650, _e1651), 0f)) + ((_e1656 * _e1657) * 0.6f));
                    let _e1667 = st_2;
                    albS = mix(0.5f, 0.92f, smoothstep(0.15f, 0.85f, _e1667));
                    let _e1671 = color;
                    let _e1672 = color;
                    let _e1675 = albS;
                    let _e1680 = litS;
                    let _e1682 = white;
                    let _e1685 = fallK;
                    color = mix(_e1671, mix((_e1672 * 0.8f), ((vec3(_e1675) / vec3(3.1415927f)) * _e1680), vec3(_e1682)), vec3(_e1685));
                    let _e1688 = foam_2;
                    let _e1690 = fallK;
                    foam_2 = (_e1688 * (1f - _e1690));
                }
            }
            let _e1693 = global.uFallTop;
            if (_e1693 > 0f) {
                {
                    let _e1696 = vFixedPos_1;
                    let _e1697 = global.uOriginMod;
                    let _e1699 = global.uFallFoot;
                    Lf = ((_e1696 - _e1697) - _e1699);
                    let _e1703 = global.uFallAcr;
                    let _e1704 = global.uFallAcr;
                    hasA = step(0.5f, dot(_e1703, _e1704));
                    let _e1708 = Lf;
                    let _e1709 = global.uFallAcr;
                    let _e1713 = global.uFallW;
                    let _e1716 = global.uFallW;
                    let _e1719 = hasA;
                    al_2 = (clamp(dot(_e1708, _e1709), (-0.5f * _e1713), (0.5f * _e1716)) * _e1719);
                    let _e1722 = Lf;
                    let _e1723 = global.uFallAcr;
                    let _e1724 = al_2;
                    let _e1728 = global.uFallW;
                    let _e1737 = global.uFallW;
                    let _e1740 = hasA;
                    dF = (length((_e1722 - (_e1723 * _e1724))) / mix(max(((_e1728 * 1.2f) + 2f), 2f), (3f + (0.15f * _e1737)), _e1740));
                    let _e1744 = vFlw_1;
                    flL = length(_e1744.xyz);
                    let _e1748 = flL;
                    if (_e1748 > 0.0001f) {
                        let _e1751 = vFlw_1;
                        let _e1753 = flL;
                        local_86 = (_e1751.xyz / vec3(_e1753));
                    } else {
                        let _e1756 = upF_7;
                        local_86 = normalize((cross(_e1756, vec3<f32>(0f, 0f, 1f)) + vec3<f32>(0.0001f, 0f, 0f)));
                    }
                    let _e1769 = local_86;
                    fd_1 = _e1769;
                    let _e1771 = upF_7;
                    let _e1772 = fd_1;
                    fa_1 = normalize(cross(_e1771, _e1772));
                    let _e1776 = Lf;
                    let _e1777 = fa_1;
                    let _e1779 = Lf;
                    let _e1780 = fd_1;
                    let _e1782 = global.uTime;
                    let _e1783 = flL;
                    q2_ = (vec2<f32>(dot(_e1776, _e1777), (dot(_e1779, _e1780) - (_e1782 * max((_e1783 * 9f), 0.4f)))) * 0.18f);
                    let _e1794 = q2_;
                    let _e1796 = textureSampleLevel(tDetailTexture, tDetailSampler, _e1794, 0f);
                    let _e1800 = q2_;
                    let _e1807 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e1800 * 2.7f) + vec2(0.31f)), 0f);
                    fz_1 = ((_e1796.x * 0.65f) + (_e1807.w * 0.35f));
                    let _e1816 = dF;
                    core = (1f - smoothstep(0.05f, 0.45f, _e1816));
                    let _e1823 = dF;
                    ring_1 = (1f - smoothstep(0.2f, 1f, _e1823));
                    let _e1827 = core;
                    let _e1830 = ring_1;
                    let _e1833 = ring_1;
                    let _e1837 = fz_1;
                    fm = max((_e1827 * 0.9f), (_e1830 * smoothstep((0.55f - (0.3f * _e1833)), 0.8f, _e1837)));
                    let _e1842 = foam_2;
                    let _e1843 = fm;
                    let _e1846 = global.uFall2_;
                    let _e1851 = fallK;
                    foam_2 = max(_e1842, ((_e1843 * mix(0.35f, 0.95f, _e1846.y)) * (1f - _e1851)));
                }
            }
            let _e1855 = color;
            let _e1866 = lit_1;
            let _e1868 = foam_2;
            color = mix(_e1855, (vec3<f32>(0.23873241f, 0.23873241f, 0.23873241f) * _e1866), vec3(clamp(_e1868, 0f, 1f)));
            let _e1874 = ice_8;
            if (_e1874 > 0f) {
                {
                    let _e1877 = nW;
                    dI = _e1877;
                    let _e1879 = nG;
                    dJ = _e1879;
                    let _e1881 = kind_4;
                    if (_e1881 < 0.2f) {
                        {
                            let _e1886 = lead_1;
                            let _e1890 = fl;
                            lIce = (smoothstep(0.3f, 1.5f, _e1886.x) * (1f - _e1890.x));
                            let _e1898 = lead_1;
                            let _e1917 = lead_1;
                            lAlb = mix((vec3((0.07f + (0.33f * (1f - exp((-(_e1898.x) / 10f)))))) * vec3<f32>(0.92f, 0.97f, 1f)), vec3<f32>(0.82f, 0.86f, 0.9f), vec3(_e1917.y));
                            let _e1922 = color;
                            let _e1923 = lAlb;
                            let _e1927 = global.uSunE;
                            let _e1928 = sunT;
                            let _e1930 = muS_2;
                            let _e1934 = global.uSunE;
                            let _e1935 = skyE_1;
                            let _e1939 = lIce;
                            color = mix(_e1922, ((_e1923 / vec3(3.1415927f)) * (((_e1927 * _e1928) * max(_e1930, 0f)) + (_e1934 * _e1935))), vec3(_e1939));
                            let _e1942 = albedo;
                            let _e1943 = lAlb;
                            let _e1944 = lIce;
                            albedo = mix(_e1942, _e1943, vec3(_e1944));
                        }
                    }
                    let _e1947 = fl;
                    ice_8 = _e1947.x;
                    let _e1949 = global.uSeason;
                    if (_e1949.z > 0.5f) {
                        let _e1956 = Tair_2;
                        local_87 = smoothstep(-1f, 2f, _e1956);
                    } else {
                        local_87 = 0f;
                    }
                    let _e1960 = local_87;
                    thaw = _e1960;
                    let _e1964 = fl;
                    let _e1966 = dJ;
                    let _e1976 = fl;
                    let _e1979 = fl;
                    let _e1988 = thaw;
                    snowy = ((smoothstep(0.3f, 0.7f, (_e1964.z + ((_e1966.w - 0.5f) * 0.25f))) * (1f - ((0.7f * _e1976.y) / max(_e1979.x, 0.001f)))) * (1f - (0.7f * _e1988)));
                    let _e2001 = snowy;
                    let _e2006 = dI;
                    iceAlb = (mix(vec3<f32>(0.42f, 0.52f, 0.6f), vec3<f32>(0.82f, 0.86f, 0.9f), vec3(_e2001)) * (0.9f + (0.2f * _e2006.x)));
                    let _e2012 = global.uSeason;
                    if (_e2012.z > 0.5f) {
                        let _e2016 = Tair_2;
                        let _e2017 = dJ;
                        let _e2021 = fp_10;
                        let _e2022 = w_10;
                        let _e2024 = tri(_e2021, _e2022, 8f);
                        let _e2029 = meltPond(_e2016, ((_e2017.x * 0.6f) + (_e2024.x * 0.4f)));
                        let _e2033 = ridge_2;
                        local_88 = (_e2029 * (1f - smoothstep(0f, 0.2f, _e2033.w)));
                    } else {
                        local_88 = 0f;
                    }
                    let _e2040 = local_88;
                    pond_1 = _e2040;
                    let _e2042 = iceAlb;
                    let _e2047 = pond_1;
                    iceAlb = mix(_e2042, vec3<f32>(0.12f, 0.32f, 0.45f), vec3(_e2047));
                    let _e2050 = up_4;
                    let _e2051 = N_4;
                    N2_ = normalize(mix(_e2050, _e2051, vec3(0.5f)));
                    let _e2057 = ridge_2;
                    if (_e2057.w > 0f) {
                        {
                            let _e2061 = fp_10;
                            let _e2062 = w_10;
                            let _e2064 = tri(_e2061, _e2062, 2f);
                            blk = _e2064.x;
                            let _e2067 = iceAlb;
                            let _e2078 = blk;
                            let _e2084 = ridge_2;
                            iceAlb = mix(_e2067, mix(vec3<f32>(0.5f, 0.62f, 0.7f), vec3<f32>(0.85f, 0.88f, 0.92f), vec3(smoothstep(0.35f, 0.6f, _e2078))), vec3(smoothstep(0f, 0.2f, _e2084.w)));
                            let _e2089 = N2_;
                            let _e2090 = global.uToFixed;
                            let _e2092 = ridge_2;
                            let _e2099 = ridge_2;
                            N2_ = normalize((_e2089 + (((transpose(_e2090) * _e2092.xyz) * 0.5f) * smoothstep(0f, 0.1f, _e2099.w))));
                        }
                    }
                    let _e2105 = iceAlb;
                    let _e2109 = global.uSunE;
                    let _e2110 = sunT;
                    let _e2112 = N2_;
                    let _e2113 = global.uSunDir;
                    let _e2118 = global.uSunE;
                    let _e2119 = skyE_1;
                    let _e2123 = N2_;
                    let _e2124 = up_4;
                    iceCol = ((_e2105 / vec3(3.1415927f)) * (((_e2109 * _e2110) * max(dot(_e2112, _e2113), 0f)) + ((_e2118 * _e2119) * (0.5f + (0.5f * dot(_e2123, _e2124))))));
                    let _e2132 = N2_;
                    let _e2133 = H_2;
                    NdH2_ = max(dot(_e2132, _e2133), 0f);
                    let _e2138 = iceCol;
                    let _e2139 = global.uSunE;
                    let _e2140 = sunT;
                    let _e2142 = NdH2_;
                    let _e2145 = snowy;
                    let _e2152 = muS_2;
                    iceCol = (_e2138 + ((((_e2139 * _e2140) * pow(_e2142, mix(400f, 40f, _e2145))) * 0.04f) * step(0f, _e2152)));
                    let _e2156 = iceCol;
                    let _e2157 = global.uSunE;
                    let _e2158 = sunT;
                    let _e2160 = up_4;
                    let _e2161 = N2_;
                    let _e2166 = H_2;
                    let _e2175 = pond_1;
                    let _e2178 = muS_2;
                    iceCol = (_e2156 + (((((_e2157 * _e2158) * pow(max(dot(normalize(mix(_e2160, _e2161, vec3(0.2f))), _e2166), 0f), 600f)) * 0.4f) * _e2175) * step(0f, _e2178)));
                    let _e2182 = color;
                    let _e2183 = iceCol;
                    let _e2184 = ice_8;
                    color = mix(_e2182, _e2183, vec3(_e2184));
                    let _e2187 = albedo;
                    let _e2188 = iceAlb;
                    let _e2189 = ice_8;
                    albedo = mix(_e2187, _e2188, vec3(_e2189));
                }
            }
            let _e2192 = fallK;
            if (_e2192 > 0f) {
                {
                    let _e2196 = tsf;
                    let _e2200 = tsf;
                    let _e2204 = tsf;
                    iceF = (1f - smoothstep((_e2196.y - 12f), (_e2200.y - 4f), _e2204.x));
                    let _e2209 = iceF;
                    if (_e2209 > 0f) {
                        {
                            let _e2212 = upF_7;
                            let _e2213 = fn_;
                            let _e2214 = upF_7;
                            let _e2215 = fn_;
                            dnI = (_e2212 - (_e2213 * dot(_e2214, _e2215)));
                            let _e2220 = dnI;
                            let _e2222 = dnI;
                            downI = (-(_e2220) / vec3(max(length(_e2222), 0.0001f)));
                            let _e2229 = fn_;
                            let _e2230 = downI;
                            acrI = normalize(cross(_e2229, _e2230));
                            let _e2234 = vFixedPos_1;
                            let _e2235 = global.uOriginMod;
                            let _e2237 = global.uFallTop;
                            if (_e2237 > 0f) {
                                let _e2240 = global.uFallFoot;
                                local_89 = _e2240;
                            } else {
                                local_89 = vec3(0f);
                            }
                            let _e2244 = local_89;
                            pI = ((_e2234 - _e2235) - _e2244);
                            let _e2247 = pI;
                            let _e2248 = acrI;
                            let _e2250 = pI;
                            let _e2251 = downI;
                            qi = vec2<f32>(dot(_e2247, _e2248), dot(_e2250, _e2251));
                            let _e2255 = qi;
                            let _e2259 = qi;
                            qa_1 = vec2<f32>((_e2255.x * 0.2f), (_e2259.y * 0.015f));
                            let _e2265 = qi;
                            let _e2271 = qi;
                            qb_1 = vec2<f32>(((_e2265.x * 0.6f) + 0.3f), (_e2271.y * 0.04f));
                            let _e2277 = qa_1;
                            let _e2279 = textureSampleLevel(tDetailTexture, tDetailSampler, _e2277, 0f);
                            let _e2283 = qb_1;
                            let _e2285 = textureSampleLevel(tDetailTexture, tDetailSampler, _e2283, 0f);
                            cols = ((_e2279.x * 0.6f) + (_e2285.w * 0.4f));
                            let _e2291 = qa_1;
                            let _e2297 = textureSampleLevel(tDetailTexture, tDetailSampler, (_e2291 + vec2<f32>(0.01f, 0f)), 0f);
                            let _e2301 = qb_1;
                            let _e2307 = textureSampleLevel(tDetailTexture, tDetailSampler, (_e2301 + vec2<f32>(0.03f, 0f)), 0f);
                            colsX = ((_e2297.x * 0.6f) + (_e2307.w * 0.4f));
                            let _e2315 = cols;
                            thick = smoothstep(0.35f, 0.7f, _e2315);
                            let _e2326 = thick;
                            alb = mix(vec3<f32>(0.2f, 0.4f, 0.56f), vec3<f32>(0.88f, 0.93f, 0.97f), vec3(_e2326));
                            let _e2330 = Nw;
                            let _e2331 = global.uToFixed;
                            let _e2333 = acrI;
                            let _e2335 = colsX;
                            let _e2336 = cols;
                            nI = normalize((_e2330 - (((transpose(_e2331) * _e2333) * (_e2335 - _e2336)) * 30f)));
                            let _e2344 = global.uSunE;
                            let _e2345 = sunT;
                            let _e2347 = nI;
                            let _e2348 = global.uSunDir;
                            let _e2353 = global.uSunE;
                            let _e2354 = skyE_1;
                            litI = (((_e2344 * _e2345) * max(dot(_e2347, _e2348), 0f)) + ((_e2353 * _e2354) * 0.7f));
                            let _e2360 = nI;
                            let _e2361 = V_3;
                            let _e2362 = global.uSunDir;
                            spI = (pow(max(dot(_e2360, normalize((_e2361 + _e2362))), 0f), 60f) * 0.6f);
                            let _e2373 = color;
                            let _e2374 = alb;
                            let _e2378 = litI;
                            let _e2380 = global.uSunE;
                            let _e2381 = sunT;
                            let _e2383 = spI;
                            let _e2386 = muS_2;
                            let _e2390 = fallK;
                            let _e2391 = iceF;
                            color = mix(_e2373, (((_e2374 / vec3(3.1415927f)) * _e2378) + (((_e2380 * _e2381) * _e2383) * step(0f, _e2386))), vec3((_e2390 * _e2391)));
                        }
                    }
                }
            }
            let _e2395 = global.uDebug;
            if (_e2395 > 6.5f) {
                let _e2398 = fallK;
                let _e2399 = dbgWhite;
                let _e2400 = river_3;
                if _e2400 {
                    local_90 = 1f;
                } else {
                    local_90 = 0f;
                }
                let _e2404 = local_90;
                local_95 = vec3<f32>(_e2398, _e2399, _e2404);
            } else {
                let _e2406 = global.uDebug;
                if (_e2406 < 2.5f) {
                    let _e2409 = ice_8;
                    local_94 = vec3(_e2409);
                } else {
                    let _e2411 = global.uDebug;
                    if (_e2411 < 3.5f) {
                        let _e2414 = Tm_2;
                        local_93 = vec3((_e2414 / 40f));
                    } else {
                        let _e2418 = global.uDebug;
                        if (_e2418 < 4.5f) {
                            let _e2421 = foam_2;
                            local_92 = vec3(_e2421);
                        } else {
                            let _e2423 = global.uDebug;
                            if (_e2423 < 5.5f) {
                                let _e2426 = vLiq_1;
                                local_91 = _e2426.xyz;
                            } else {
                                let _e2428 = wr;
                                local_91 = vec3((_e2428 * 4f));
                            }
                            let _e2433 = local_91;
                            local_92 = _e2433;
                        }
                        let _e2435 = local_92;
                        local_93 = _e2435;
                    }
                    let _e2437 = local_93;
                    local_94 = _e2437;
                }
                let _e2439 = local_94;
                local_95 = _e2439;
            }
            let _e2441 = local_95;
            dbgW = _e2441;
        }
    }
    let _e2442 = global.uThermal;
    if (_e2442.x > 0f) {
        {
            let _e2446 = albedo;
            a_16 = clamp(_e2446, vec3(0f), vec3(1f));
            let _e2453 = color;
            let _e2456 = a_16;
            let _e2458 = global.uThermal;
            let _e2460 = global.uThermal;
            let _e2462 = r_10;
            let _e2463 = global.uRadius;
            let _e2467 = blackbodyGlow((_e2458.x - (_e2460.y * (_e2462 - _e2463))));
            color = (_e2453 + ((vec3(1f) - _e2456) * _e2467));
            let _e2470 = color;
            let _e2471 = a_16;
            let _e2474 = r_10;
            let _e2476 = atmoSunTransmittance(_e2474, 1f);
            let _e2479 = global.uThermal;
            let _e2481 = global.uThermal;
            let _e2483 = r_10;
            let _e2484 = global.uRadius;
            let _e2490 = blackbodyGlow((_e2479.x - (_e2481.z * max((_e2483 - _e2484), 0f))));
            color = (_e2470 + ((_e2471 * (vec3(1f) - _e2476)) * _e2490));
        }
    }
    let _e2493 = emissive;
    if (_e2493 > 0.01f) {
        {
            let _e2498 = global.uTime;
            let _e2501 = vFixedPos_1;
            let _e2506 = vFixedPos_1;
            flick = (0.85f + (0.15f * sin((((_e2498 * 1.7f) + (_e2501.x * 0.05f)) + (_e2506.z * 0.07f)))));
            let _e2517 = fp_10;
            let _e2518 = w_10;
            let _e2520 = tri(_e2517, _e2518, 128f);
            crust = smoothstep(0.35f, 0.65f, _e2520.w);
            let _e2524 = color;
            let _e2525 = global.uLavaColor;
            let _e2526 = emissive;
            let _e2528 = flick;
            let _e2532 = crust;
            let _e2534 = emissive;
            color = (_e2524 + (((_e2525 * _e2526) * _e2528) * mix(1f, 0.15f, (_e2532 * (1f - (_e2534 * 0.5f))))));
        }
    }
    let _e2542 = global.uDebug;
    if (_e2542 > 1.5f) {
        let _e2545 = dbgW;
        if (_e2545.x < 0f) {
            let _e2553 = waterEnc;
            local_96 = ((vec3<f32>(0.5f, 0f, 0.5f) * _e2553) * 50f);
        } else {
            let _e2557 = dbgW;
            local_96 = _e2557;
        }
        let _e2559 = local_96;
        let _e2560 = global.uDebug;
        if (_e2560 > 7.5f) {
            local_97 = 0.02f;
        } else {
            local_97 = 1f;
        }
        let _e2566 = local_97;
        color = (_e2559 * _e2566);
    } else {
        let _e2568 = global.uDebug;
        if (_e2568 > 0.5f) {
            let _e2571 = color;
            let _e2572 = vMorphK_1;
            let _e2574 = vMorphK_1;
            color = mix(_e2571, (vec3<f32>(_e2572, (1f - _e2574), 0f) * 0.2f), vec3(0.5f));
        }
    }
    let _e2583 = color;
    fragmentColor = vec4<f32>(_e2583.x, _e2583.y, _e2583.z, 1f);
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
    let _e263 = fragmentColor;
    return FragmentOutput(_e263);
}
`;
