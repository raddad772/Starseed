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
var<private> vRib_1: vec2<f32>;
var<private> gl_FragCoord_1: vec4<f32>;

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
    let _e189 = p_8;
    let _e191 = period_3;
    let _e195 = textureSampleLevel(tDetailTexture, tDetailSampler, (_e189.yz / vec2(_e191)), 0f);
    a_12 = _e195;
    let _e197 = p_8;
    let _e199 = period_3;
    let _e206 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e197.zx / vec2(_e199)) + vec2(0.37f)), 0f);
    b_2 = _e206;
    let _e208 = p_8;
    let _e210 = period_3;
    let _e217 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e208.xy / vec2(_e210)) + vec2(0.71f)), 0f);
    c_5 = _e217;
    let _e219 = a_12;
    let _e220 = w_4;
    let _e223 = b_2;
    let _e224 = w_4;
    let _e228 = c_5;
    let _e229 = w_4;
    return (((_e219 * _e220.x) + (_e223 * _e224.y)) + (_e228 * _e229.z));
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
    let _e189 = p_10;
    let _e191 = period_5;
    let _e195 = textureSampleLevel(tDetailTexture, tDetailSampler, (_e189.yz / vec2(_e191)), 0f);
    a_13 = _e195;
    let _e197 = p_10;
    let _e199 = period_5;
    let _e206 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e197.zx / vec2(_e199)) + vec2(0.37f)), 0f);
    b_3 = _e206;
    let _e208 = p_10;
    let _e210 = period_5;
    let _e217 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e208.xy / vec2(_e210)) + vec2(0.71f)), 0f);
    c_6 = _e217;
    let _e219 = a_13;
    let _e220 = w_6;
    let _e223 = b_3;
    let _e224 = w_6;
    let _e228 = c_6;
    let _e229 = w_6;
    return (((_e219 * _e220.x) + (_e223 * _e224.y)) + (_e228 * _e229.z));
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

fn sceneZ(uv_9: vec2<f32>) -> f32 {
    var uv_10: vec2<f32>;
    var d_11: f32;
    var local_73: f32;
    var local_74: f32;

    uv_10 = uv_9;
    let _e187 = uv_10;
    uv_10.y = (1f - _e187.y);
    let _e190 = uv_10;
    let _e192 = textureDimensions(tWaterDepthTexture, 0i);
    let _e198 = textureLoad(tWaterDepthTexture, vec2<i32>((_e190 * vec2<f32>(vec2<i32>(_e192)))), 0i);
    d_11 = _e198.x;
    let _e201 = global.uZMode;
    if (_e201 < 0.5f) {
        let _e204 = d_11;
        if (_e204 <= 0f) {
            local_73 = 1000000000f;
        } else {
            let _e208 = global.uZFar;
            let _e209 = global.uZNear;
            let _e211 = global.uZFar;
            let _e212 = global.uZNear;
            let _e215 = d_11;
            let _e216 = global.uZNear;
            let _e217 = global.uZFar;
            let _e218 = global.uZNear;
            local_73 = (((_e208 * _e209) / (_e211 - _e212)) / max((_e215 + (_e216 / (_e217 - _e218))), 0.000000000000000000000000000001f));
        }
        let _e226 = local_73;
        return _e226;
    }
    let _e227 = d_11;
    if (_e227 >= 1f) {
        local_74 = 1000000000f;
    } else {
        let _e231 = d_11;
        let _e232 = global.uZLogFC;
        local_74 = (exp2((_e231 * _e232)) - 1f);
    }
    let _e238 = local_74;
    return _e238;
}

fn onScreen(p_15: vec3<f32>) -> vec3<f32> {
    var p_16: vec3<f32>;
    var c_15: vec4<f32>;

    p_16 = p_15;
    let _e185 = global.projectionMatrix;
    let _e186 = global.viewMatrix;
    let _e188 = p_16;
    c_15 = ((_e185 * _e186) * vec4<f32>(_e188.x, _e188.y, _e188.z, 1f));
    let _e196 = c_15;
    let _e198 = c_15;
    let _e208 = (((_e196.xy / vec2(max(_e198.w, 0.000001f))) * 0.5f) + vec2(0.5f));
    let _e209 = c_15;
    return vec3<f32>(_e208.x, _e208.y, _e209.w);
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
    var local_75: f32;
    var isWater: f32;
    var gRough: f32 = 0.8f;
    var gAO: f32 = 1f;
    var ndl_1: f32;
    var color: vec3<f32>;
    var dbgW: vec3<f32> = vec3(-1f);
    var V_3: vec3<f32>;
    var upF_7: vec3<f32>;
    var local_76: vec3<f32>;
    var lq: vec3<f32>;
    var kind_4: f32;
    var Tm_2: f32;
    var river_3: bool;
    var local_77: f32;
    var flow_4: f32;
    var local_78: f32;
    var local_79: f32;
    var local_80: f32;
    var fetch_2: f32;
    var sc_1: vec3<f32>;
    var zW: f32;
    var zB: f32;
    var depthW: f32;
    var fallK0_: f32;
    var local_81: f32;
    var zf0_: f32;
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
    var depthL: f32;
    var tsf: vec2<f32>;
    var ice_8: f32;
    var local_82: f32;
    var iceC: f32;
    var local_83: f32;
    var pDay_4: f32;
    var lead_1: vec2<f32> = vec2(0f);
    var local_84: f32;
    var Tair_2: f32;
    var ridge_2: vec4<f32> = vec4(0f);
    var local_85: vec4<f32>;
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
    var local_86: f32;
    var nI: f32;
    var Tr: vec3<f32>;
    var cT: f32;
    var sb_1: vec3<f32>;
    var uvB: vec2<f32>;
    var bed: vec3<f32>;
    var local_87: f32;
    var local_88: f32;
    var ssc: f32;
    var local_89: f32;
    var local_90: f32;
    var a_15: vec3<f32>;
    var bb: vec3<f32>;
    var K_1: vec3<f32>;
    var cS: f32;
    var Tb: vec3<f32>;
    var Ed: vec3<f32>;
    var local_91: vec3<f32>;
    var deep: vec3<f32>;
    var Rf: vec3<f32>;
    var hitK: f32 = 0f;
    var hitC: vec3<f32> = vec3(0f);
    var C0_: vec4<f32>;
    var CD: vec4<f32>;
    var t0_: f32 = 0f;
    var t_6: f32;
    var i_14: i32 = 0i;
    var c_16: vec4<f32>;
    var q_7: vec2<f32>;
    var zs: f32;
    var lo: f32;
    var hi: f32;
    var k_3: i32;
    var tm: f32;
    var cm_1: vec4<f32>;
    var ch: vec4<f32>;
    var qh: vec2<f32>;
    var e_3: vec2<f32>;
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
    var local_92: f32;
    var fallK: f32;
    var dbgWhite: f32 = 0f;
    var dn_4: vec3<f32>;
    var down: vec3<f32>;
    var acr: vec3<f32>;
    var local_93: f32;
    var zf: f32;
    var v_1: f32;
    var t1_: f32;
    var t2_1: f32;
    var wa_2: f32;
    var L_7: f32;
    var local_94: vec3<f32>;
    var pS: vec3<f32>;
    var q_8: vec2<f32>;
    var dv_1: f32;
    var qA: vec2<f32>;
    var qB: vec2<f32>;
    var bA: f32;
    var bB: f32;
    var sA: f32;
    var sB: f32;
    var st_2: f32;
    var gS: f32;
    var edge: f32;
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
    var local_95: vec3<f32>;
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
    var local_96: f32;
    var thaw: f32;
    var snowy: f32;
    var iceAlb: vec3<f32>;
    var local_97: f32;
    var pond_1: f32;
    var N2_: vec3<f32>;
    var blk: f32;
    var iceCol: vec3<f32>;
    var NdH2_: f32;
    var iceF: f32;
    var dnI: vec3<f32>;
    var downI: vec3<f32>;
    var acrI: vec3<f32>;
    var local_98: vec3<f32>;
    var pI: vec3<f32>;
    var local_99: f32;
    var qi: vec2<f32>;
    var qa_1: vec2<f32>;
    var qb_1: vec2<f32>;
    var cols: f32;
    var colsX: f32;
    var thick: f32;
    var alb: vec3<f32>;
    var nI_1: vec3<f32>;
    var litI: vec3<f32>;
    var spI: f32;
    var local_100: f32;
    var local_101: vec3<f32>;
    var local_102: vec3<f32>;
    var local_103: vec3<f32>;
    var local_104: vec3<f32>;
    var local_105: vec3<f32>;
    var a_16: vec3<f32>;
    var flick: f32;
    var crust: f32;
    var local_106: vec3<f32>;
    var local_107: f32;

    let _e183 = vWorldPos_1;
    let _e184 = fwidth(_e183);
    foot_18 = length(_e184);
    let _e187 = vFixedPos_1;
    let _e188 = dpdx(_e187);
    dpx = _e188;
    let _e190 = vFixedPos_1;
    let _e191 = dpdy(_e190);
    dpy = _e191;
    let _e193 = vRib_1;
    let _e195 = dpdx(_e193.y);
    let _e196 = vRib_1;
    let _e198 = dpdy(_e196.y);
    dEnc = vec2<f32>(_e195, _e198);
    let _e204 = global.uColourCube;
    if (_e204.x > 0.5f) {
        let _e208 = global.uToFixed;
        let _e209 = vWorldPos_1;
        let _e210 = global.uCenter;
        let _e215 = colourCubeShoreSmooth(normalize((_e208 * normalize((_e209 - _e210)))));
        let _e216 = global.uColourCube;
        shoreX_2 = (_e215 * _e216.z);
    }
    let _e219 = shoreX_2;
    let _e220 = dpdx(_e219);
    let _e221 = shoreX_2;
    let _e222 = dpdy(_e221);
    dShoreX = vec2<f32>(_e220, _e222);
    let _e225 = vCol_1;
    let _e227 = vCol_1;
    albedo = (_e225.xyz * _e227.xyz);
    let _e231 = vCol_1;
    waterEnc = _e231.w;
    let _e234 = vMat_1;
    veg = _e234.x;
    let _e237 = vMat_1;
    snow = _e237.y;
    let _e240 = vMat_1;
    rock = _e240.z;
    let _e243 = vMat_1;
    sand = _e243.w;
    let _e246 = vExt_1;
    emissive = _e246.x;
    let _e249 = vExt_1;
    wet = _e249.y;
    let _e252 = vExt_1;
    rough_1 = _e252.z;
    let _e255 = vWorldPos_1;
    let _e256 = global.uCenter;
    rel_4 = (_e255 - _e256);
    let _e259 = rel_4;
    r_10 = length(_e259);
    let _e262 = rel_4;
    let _e263 = r_10;
    up_4 = (_e262 / vec3(_e263));
    let _e267 = vWorldPos_1;
    dist_3 = length(_e267);
    let _e270 = vCol_1;
    colC = _e270.xyz;
    let _e273 = vShore_1;
    shoreV = _e273;
    let _e275 = dist_3;
    let _e276 = colourCubeK(_e275);
    cK = _e276;
    let _e278 = cK;
    if (_e278 > 0f) {
        {
            let _e281 = global.uToFixed;
            let _e282 = up_4;
            let _e285 = colourCubeAt(normalize((_e281 * _e282)));
            cc_1 = _e285;
            let _e287 = colC;
            let _e288 = cc_1;
            let _e290 = cK;
            colC = mix(_e287, _e288.xyz, vec3(_e290));
            let _e293 = shoreV;
            let _e294 = cc_1;
            let _e296 = colourCubeShoreV(_e294.w);
            let _e297 = cK;
            shoreV = mix(_e293, _e296, _e297);
            let _e299 = colC;
            let _e300 = colC;
            albedo = (_e299 * _e300);
        }
    }
    let _e302 = vNormal_1;
    N_4 = normalize(_e302);
    let _e305 = up_4;
    let _e306 = global.uSunDir;
    muS_2 = dot(_e305, _e306);
    let _e309 = r_10;
    let _e310 = muS_2;
    let _e311 = atmoSunTransmittance(_e309, _e310);
    sunT = _e311;
    let _e313 = r_10;
    let _e314 = muS_2;
    let _e315 = atmoSkyIrradiance(_e313, _e314);
    skyE_1 = _e315;
    let _e317 = rel_4;
    let _e318 = r_10;
    let _e319 = muS_2;
    let _e320 = foot_18;
    let _e321 = sunT;
    let _e324 = cloudLight(_e317, _e318, _e319, _e320, _e321, (&skyE_1));
    cloudT = _e324;
    let _e326 = sunT;
    let _e327 = cloudT;
    sunT = (_e326 * _e327);
    let _e329 = global.uToFixed;
    let _e330 = rel_4;
    pF_3 = (_e329 * _e330);
    let _e333 = sunT;
    let _e334 = pF_3;
    let _e335 = pF_3;
    let _e337 = global.uToFixed;
    let _e338 = global.uSunDir;
    let _e340 = global.uRadius;
    let _e341 = terrainShadow(_e334, normalize(_e335), (_e337 * _e338), _e340);
    sunT = (_e333 * _e341);
    let _e343 = sunT;
    sunTop = _e343;
    let _e345 = vWorldPos_1;
    let _e346 = N_4;
    let _e347 = sunShadowMap(_e345, _e346);
    keySh = _e347;
    let _e349 = sunT;
    let _e350 = keySh;
    sunT = (_e349 * _e350);
    let _e352 = vFixedPos_1;
    fp_10 = _e352;
    let _e354 = vFixedNormal_1;
    fn_ = normalize(_e354);
    let _e357 = fn_;
    w_10 = pow(abs(_e357), vec3(4f));
    let _e363 = w_10;
    let _e364 = w_10;
    let _e366 = w_10;
    let _e369 = w_10;
    w_10 = (_e363 / vec3(((_e364.x + _e366.y) + _e369.z)));
    let _e377 = dist_3;
    fineK = (1f - smoothstep(60f, 900f, _e377));
    let _e384 = dist_3;
    midK = (1f - smoothstep(600f, 9000f, _e384));
    let _e391 = dist_3;
    farK = (1f - smoothstep(6000f, 90000f, _e391));
    let _e395 = shoreV;
    if (_e395 > 0f) {
        local_75 = 1f;
    } else {
        local_75 = 0f;
    }
    let _e401 = local_75;
    isWater = _e401;
    let _e407 = isWater;
    if (_e407 < 0.5f) {
        discard;
    }
    let _e410 = N_4;
    let _e411 = global.uSunDir;
    ndl_1 = max(dot(_e410, _e411), 0f);
    let _e421 = isWater;
    if (_e421 > 0.5f) {
        {
            let _e424 = vWorldPos_1;
            V_3 = normalize(-(_e424));
            let _e428 = global.uToFixed;
            let _e429 = up_4;
            upF_7 = (_e428 * _e429);
            let _e432 = vLiq_1;
            if (_e432.x > 0.02f) {
                let _e436 = vLiq_1;
                let _e438 = vLiq_1;
                local_76 = (_e436.yzw / vec3(_e438.x));
            } else {
                local_76 = vec3<f32>(0f, 0.75f, 1f);
            }
            let _e447 = local_76;
            lq = _e447;
            let _e449 = lq;
            kind_4 = _e449.x;
            let _e452 = lq;
            Tm_2 = ((_e452.y * 120f) - 60f);
            let _e459 = kind_4;
            let _e462 = kind_4;
            river_3 = ((_e459 > 0.55f) && (_e462 < 0.85f));
            let _e467 = river_3;
            if _e467 {
                let _e468 = lq;
                local_77 = _e468.z;
            } else {
                local_77 = 0f;
            }
            let _e472 = local_77;
            flow_4 = _e472;
            let _e474 = kind_4;
            if (_e474 < 0.2f) {
                local_80 = 1f;
            } else {
                let _e478 = river_3;
                if _e478 {
                    local_79 = 0.2f;
                } else {
                    let _e480 = kind_4;
                    if (_e480 > 0.85f) {
                        local_78 = 0.05f;
                    } else {
                        let _e484 = lq;
                        local_78 = _e484.z;
                    }
                    let _e487 = local_78;
                    local_79 = _e487;
                }
                let _e489 = local_79;
                local_80 = _e489;
            }
            let _e491 = local_80;
            fetch_2 = _e491;
            let _e493 = vWorldPos_1;
            let _e494 = onScreen(_e493);
            sc_1 = _e494;
            let _e496 = sc_1;
            zW = _e496.z;
            let _e500 = gl_FragCoord_1;
            let _e503 = textureDimensions(tWaterDepthTexture, 0i);
            let _e507 = gl_FragCoord_1;
            let _e512 = textureDimensions(tWaterDepthTexture, 0i);
            let _e516 = sceneZ((vec2<f32>(_e500.x, (f32(vec2<i32>(_e503).y) - _e507.y)) / vec2<f32>(vec2<i32>(_e512))));
            zB = _e516;
            let _e518 = vWorldPos_1;
            let _e519 = vWorldPos_1;
            let _e520 = zB;
            let _e521 = zW;
            let _e525 = up_4;
            depthW = min(max(dot((_e518 - (_e519 * (_e520 / _e521))), _e525), 0f), 60f);
            let _e535 = vFixedNormal_1;
            let _e537 = global.uToFixed;
            let _e538 = up_4;
            fallK0_ = smoothstep(0.13f, 0.3f, (1f - dot(normalize(_e535), (_e537 * _e538))));
            let _e544 = fallK0_;
            if (_e544 > 0f) {
                {
                    let _e547 = global.uFallTop;
                    if (_e547 > 0f) {
                        let _e550 = global.uFallTop;
                        let _e551 = r_10;
                        local_81 = max((_e550 - _e551), 0f);
                    } else {
                        local_81 = 4f;
                    }
                    let _e557 = local_81;
                    zf0_ = _e557;
                    let _e559 = depthW;
                    let _e560 = vRib_1;
                    let _e564 = vFlw_1;
                    let _e572 = global.uLiquid2_;
                    let _e575 = zf0_;
                    let _e589 = vRib_1;
                    let _e591 = vRib_1;
                    let _e598 = fallK0_;
                    depthW = mix(_e559, (clamp(((max(_e560.y, 0.1f) * max((_e564.w * 9f), 0.5f)) / (sqrt(((2f * _e572.x) * _e575)) + 0.5f)), 0.03f, 1f) * mix(0.15f, 1f, smoothstep(0f, 0.5f, (1f - (_e589.x * _e591.x))))), _e598);
                }
            }
            let _e600 = fp_10;
            let _e601 = w_10;
            let _e603 = tri(_e600, _e601, 512f);
            nW = _e603;
            let _e605 = fp_10;
            let _e606 = w_10;
            let _e608 = tri(_e605, _e606, 64f);
            nG = _e608;
            let _e610 = nW;
            let _e614 = nW;
            wn_2 = (vec2<f32>((_e610.x - 0.5f), (_e614.w - 0.5f)) * 2f);
            let _e622 = nG;
            let _e624 = nG;
            let _e626 = nW;
            let _e628 = nW;
            grp_4 = clamp(((vec4<f32>(_e622.x, _e624.w, _e626.w, _e628.x) * 1.6f) - vec4(0.3f)), vec4(0f), vec4(1f));
            let _e645 = vFlw_1;
            fv_2 = (max(_e645.w, 0f) * 9f);
            let _e652 = fv_2;
            let _e653 = depthW;
            let _e654 = vRib_1;
            fv_2 = (_e652 * pow(clamp((_e653 / max(_e654.y, 0.05f)), 0f, 2f), 0.667f));
            let _e665 = fv_2;
            let _e666 = global.uLiquid2_;
            let _e668 = depthW;
            fv_2 = min(_e665, sqrt((_e666.x * max(_e668, 0.05f))));
            {
                let _e680 = dpx;
                let _e681 = dpx;
                a11_1 = dot(_e680, _e681);
                let _e684 = dpx;
                let _e685 = dpy;
                a12_ = dot(_e684, _e685);
                let _e688 = dpy;
                let _e689 = dpy;
                a22_ = dot(_e688, _e689);
                let _e692 = a11_1;
                let _e693 = a22_;
                let _e695 = a12_;
                let _e696 = a12_;
                det = ((_e692 * _e693) - (_e695 * _e696));
                let _e700 = det;
                if (_e700 > 0.000000000001f) {
                    {
                        let _e703 = a22_;
                        let _e704 = dEnc;
                        let _e707 = a12_;
                        let _e708 = dEnc;
                        let _e712 = dpx;
                        let _e714 = a11_1;
                        let _e715 = dEnc;
                        let _e718 = a12_;
                        let _e719 = dEnc;
                        let _e723 = dpy;
                        let _e726 = det;
                        gradH_2 = (((((_e703 * _e704.x) - (_e707 * _e708.y)) * _e712) + (((_e714 * _e715.y) - (_e718 * _e719.x)) * _e723)) / vec3(_e726));
                        let _e729 = a22_;
                        let _e730 = dShoreX;
                        let _e733 = a12_;
                        let _e734 = dShoreX;
                        let _e738 = dpx;
                        let _e740 = a11_1;
                        let _e741 = dShoreX;
                        let _e744 = a12_;
                        let _e745 = dShoreX;
                        let _e749 = dpy;
                        let _e752 = det;
                        gradX_2 = (((((_e729 * _e730.x) - (_e733 * _e734.y)) * _e738) + (((_e740 * _e741.y) - (_e744 * _e745.x)) * _e749)) / vec3(_e752));
                    }
                }
            }
            let _e755 = depthW;
            depthL = _e755;
            let _e757 = river_3;
            if !(_e757) {
                let _e759 = vRib_1;
                depthL = _e759.y;
            }
            let _e761 = fp_10;
            let _e762 = fn_;
            let _e763 = upF_7;
            let _e764 = kind_4;
            let _e765 = flow_4;
            let _e766 = fetch_2;
            let _e767 = depthL;
            let _e768 = foot_18;
            let _e769 = wn_2;
            let _e770 = grp_4;
            let _e771 = vFlw_1;
            let _e773 = fv_2;
            let _e774 = gradH_2;
            let _e775 = shoreX_2;
            let _e776 = gradX_2;
            liquidSurface(_e761, _e762, _e763, _e764, _e765, _e766, _e767, _e768, _e769, _e770, _e771.xyz, _e773, _e774, _e775, _e776, (&nF_1), (&wr), (&foam_2));
            let _e783 = Tm_2;
            let _e784 = kind_4;
            let _e785 = flow_4;
            let _e786 = upF_7;
            let _e787 = liquidTs(_e783, _e784, _e785, _e786);
            tsf = _e787;
            let _e790 = tsf;
            let _e794 = tsf;
            let _e798 = tsf;
            ice_8 = (1f - smoothstep((_e790.y - 4f), (_e794.y + 4f), _e798.x));
            let _e803 = kind_4;
            let _e806 = ice_8;
            if ((_e803 < 0.2f) && (_e806 > 0f)) {
                let _e810 = ice_8;
                let _e811 = nW;
                let _e813 = nG;
                let _e815 = seaIceCover(_e810, _e811.w, _e813.x);
                local_82 = _e815;
            } else {
                local_82 = 0f;
            }
            let _e818 = local_82;
            iceC = _e818;
            let _e820 = global.uSeason;
            if (_e820.z > 0.5f) {
                let _e825 = upF_7;
                let _e826 = seasonYear(_e825);
                let _e830 = global.uSeason;
                local_83 = (((12f * _e826.z) * DDF_SNOW) / max(_e830.y, 1f));
            } else {
                local_83 = 0f;
            }
            let _e837 = local_83;
            pDay_4 = _e837;
            let _e842 = global.uSeason;
            if (_e842.z > 0.5f) {
                let _e846 = Tm_2;
                let _e847 = upF_7;
                let _e848 = seasonIceNow(_e847);
                local_84 = (_e846 + _e848);
            } else {
                let _e850 = tsf;
                local_84 = _e850.x;
            }
            let _e853 = local_84;
            Tair_2 = _e853;
            let _e858 = kind_4;
            if (_e858 < 0.2f) {
                let _e861 = pF_3;
                let _e862 = upF_7;
                let _e863 = w_10;
                let _e864 = ice_8;
                let _e865 = iceC;
                let _e866 = foot_18;
                let _e867 = tsf;
                let _e869 = Tair_2;
                let _e873 = pDay_4;
                let _e878 = seaFloes(_e861, _e862, _e863, _e864, _e865, _e866, max((_e867.y - _e869), 0f), _e873, (&lead_1), (&ridge_2));
                local_85 = _e878;
            } else {
                let _e879 = ice_8;
                local_85 = vec4<f32>(_e879, 0f, 1f, 0f);
            }
            let _e885 = local_85;
            fl = _e885;
            let _e889 = iceC;
            let _e890 = fl;
            calm = smoothstep(0.05f, 0.6f, max(_e889, _e890.w));
            let _e895 = nF_1;
            let _e896 = upF_7;
            let _e898 = calm;
            nF_1 = normalize(mix(_e895, _e896, vec3((0.9f * _e898))));
            let _e903 = wr;
            let _e906 = calm;
            wr = (_e903 * (1f - (0.8f * _e906)));
            let _e910 = foam_2;
            let _e912 = calm;
            foam_2 = (_e910 * (1f - _e912));
            let _e915 = river_3;
            if _e915 {
                let _e916 = nF_1;
                let _e917 = fn_;
                let _e921 = fn_;
                let _e922 = upF_7;
                nF_1 = normalize(mix(_e916, _e917, vec3(smoothstep(0.13f, 0.3f, (1f - dot(_e921, _e922))))));
            }
            let _e929 = global.uToFixed;
            let _e931 = nF_1;
            Nw = normalize((transpose(_e929) * _e931));
            let _e935 = Nw;
            let _e936 = V_3;
            let _e939 = Nw;
            let _e940 = V_3;
            Nw = normalize((_e935 + (_e936 * max(0f, (0.02f - dot(_e939, _e940))))));
            let _e947 = Nw;
            let _e948 = V_3;
            NdV = max(dot(_e947, _e948), 0.001f);
            let _e953 = Nw;
            let _e954 = global.uSunDir;
            ndlW = max(dot(_e953, _e954), 0f);
            let _e959 = global.uLiquid;
            F0_ = _e959.x;
            let _e962 = F0_;
            let _e964 = wr;
            let _e966 = F0_;
            let _e968 = F0_;
            let _e971 = NdV;
            F = (_e962 + ((max((1f - _e964), _e966) - _e968) * pow((1f - _e971), 5f)));
            let _e978 = V_3;
            let _e980 = Nw;
            R_3 = reflect(-(_e978), _e980);
            let _e983 = R_3;
            let _e984 = up_4;
            el = max(dot(_e983, _e984), 0f);
            let _e992 = el;
            let _e1001 = el;
            let _e1006 = cloudT;
            skyG = mix((0.7f + (1.1f * pow((1f - _e992), 3f))), (0.4286f * (1f + (2f * _e1001))), clamp((1f - _e1006), 0f, 1f));
            let _e1013 = global.uSunE;
            let _e1014 = skyE_1;
            let _e1019 = skyG;
            let _e1021 = global.uSunE;
            let _e1022 = sunT;
            let _e1026 = R_3;
            let _e1027 = global.uSunDir;
            skyRefl = ((((_e1013 * _e1014) / vec3(3.1415927f)) * _e1019) + (((_e1021 * _e1022) * 0.05f) * pow(max(dot(_e1026, _e1027), 0f), 12f)));
            let _e1036 = global.uMoonE;
            if (_e1036.y > 0f) {
                {
                    let _e1040 = up_4;
                    let _e1041 = global.uMoonDir;
                    muMr = dot(_e1040, _e1041);
                    let _e1044 = skyRefl;
                    let _e1045 = global.uMoonE;
                    let _e1046 = r_10;
                    let _e1047 = muMr;
                    let _e1048 = atmoSkyIrradiance(_e1046, _e1047);
                    let _e1053 = skyG;
                    let _e1055 = global.uMoonE;
                    let _e1056 = r_10;
                    let _e1057 = muMr;
                    let _e1060 = atmoSunTransmittance(_e1056, max(_e1057, 0f));
                    let _e1064 = R_3;
                    let _e1065 = global.uMoonDir;
                    skyRefl = (_e1044 + ((((_e1045 * _e1048) / vec3(3.1415927f)) * _e1053) + (((_e1055 * _e1060) * 0.05f) * pow(max(dot(_e1064, _e1065), 0f), 12f))));
                }
            }
            {
                let _e1076 = F0_;
                if ((1f - sqrt(_e1076)) > 0f) {
                    let _e1082 = F0_;
                    let _e1086 = F0_;
                    local_86 = ((1f + sqrt(_e1082)) / (1f - sqrt(_e1086)));
                } else {
                    local_86 = 1.33f;
                }
                let _e1092 = local_86;
                nI = _e1092;
                let _e1094 = V_3;
                let _e1096 = Nw;
                let _e1098 = nI;
                Tr = refract(-(_e1094), _e1096, (1f / _e1098));
                let _e1102 = Tr;
                let _e1103 = up_4;
                cT = max(-(dot(_e1102, _e1103)), 0.2f);
                let _e1109 = vWorldPos_1;
                let _e1110 = Tr;
                let _e1111 = depthW;
                let _e1112 = cT;
                let _e1116 = onScreen((_e1109 + (_e1110 * (_e1111 / _e1112))));
                sb_1 = _e1116;
                let _e1118 = sb_1;
                uvB = clamp(_e1118.xy, vec2(0f), vec2(1f));
                let _e1126 = uvB;
                let _e1127 = sceneZ(_e1126);
                let _e1128 = zW;
                if (_e1127 < _e1128) {
                    let _e1130 = sc_1;
                    uvB = _e1130.xy;
                }
                let _e1132 = uvB;
                let _e1135 = uvB;
                let _e1140 = textureSampleLevel(tOpaqueTexture, tOpaqueSampler, vec2<f32>(_e1132.x, (1f - _e1135.y)), 0f);
                bed = _e1140.xyz;
                let _e1143 = river_3;
                if _e1143 {
                    let _e1145 = fv_2;
                    let _e1147 = fv_2;
                    let _e1149 = fv_2;
                    local_88 = clamp((((30f * _e1145) * _e1147) * _e1149), 0.5f, 3000f);
                } else {
                    let _e1154 = kind_4;
                    if (_e1154 < 0.2f) {
                        let _e1162 = depthW;
                        local_87 = (5f + (40f * (1f - smoothstep(0f, 2f, _e1162))));
                    } else {
                        local_87 = 3f;
                    }
                    let _e1169 = local_87;
                    local_88 = _e1169;
                }
                let _e1171 = local_88;
                ssc = _e1171;
                let _e1173 = global.uLiquid3_;
                let _e1175 = ssc;
                let _e1182 = global.uLiquid3_;
                let _e1184 = river_3;
                if _e1184 {
                    local_90 = 1f;
                } else {
                    let _e1186 = kind_4;
                    if (_e1186 < 0.2f) {
                        local_89 = 0.02f;
                    } else {
                        local_89 = 0.5f;
                    }
                    let _e1192 = local_89;
                    local_90 = _e1192;
                }
                let _e1194 = local_90;
                a_15 = ((_e1173.xyz + (_e1175 * vec3<f32>(0.012f, 0.02f, 0.035f))) + ((_e1182.w * _e1194) * vec3<f32>(0.078f, 0.207f, 0.687f)));
                let _e1206 = ssc;
                bb = vec3((0.00475f * _e1206));
                let _e1210 = a_15;
                let _e1211 = bb;
                K_1 = (_e1210 + _e1211);
                let _e1216 = muS_2;
                let _e1217 = muS_2;
                let _e1220 = nI;
                let _e1221 = nI;
                cS = sqrt(max((1f - ((1f - (_e1216 * _e1217)) / (_e1220 * _e1221))), 0.04f));
                let _e1229 = K_1;
                let _e1231 = depthW;
                let _e1234 = cT;
                let _e1237 = cS;
                Tb = exp(((-(_e1229) * _e1231) * ((1f / _e1234) + (1f / _e1237))));
                let _e1243 = global.uSunE;
                let _e1244 = sunT;
                let _e1246 = muS_2;
                let _e1250 = global.uSunE;
                let _e1251 = skyE_1;
                Ed = (((_e1243 * _e1244) * max(_e1246, 0f)) + (_e1250 * _e1251));
                let _e1255 = colC;
                if (dot(_e1255, vec3(1f)) > 0.001f) {
                    let _e1261 = colC;
                    let _e1262 = colC;
                    let _e1267 = global.uSunE;
                    let _e1268 = sunT;
                    let _e1270 = muS_2;
                    let _e1276 = global.uSunE;
                    let _e1277 = skyE_1;
                    local_91 = (((_e1261 * _e1262) / vec3(3.1415927f)) * ((((_e1267 * _e1268) * max(_e1270, 0f)) * 0.6f) + ((_e1276 * _e1277) * 0.5f)));
                } else {
                    let _e1284 = bb;
                    let _e1286 = K_1;
                    let _e1291 = Ed;
                    local_91 = ((((0.33f * _e1284) / _e1286) / vec3(3.1415927f)) * _e1291);
                }
                let _e1294 = local_91;
                deep = _e1294;
                let _e1296 = bed;
                let _e1297 = Tb;
                let _e1299 = deep;
                let _e1301 = K_1;
                let _e1303 = depthW;
                let _e1306 = cT;
                body = ((_e1296 * _e1297) + (_e1299 * (vec3(1f) - exp(((-(_e1301) * _e1303) * ((1f / _e1306) + 1f))))));
            }
            {
                let _e1316 = V_3;
                let _e1318 = Nw;
                Rf = reflect(-(_e1316), _e1318);
                let _e1326 = Rf;
                let _e1327 = up_4;
                let _e1331 = F;
                let _e1335 = calm;
                if (((dot(_e1326, _e1327) > 0f) && (_e1331 > 0.035f)) && (_e1335 < 0.5f)) {
                    {
                        let _e1339 = global.projectionMatrix;
                        let _e1340 = global.viewMatrix;
                        let _e1342 = vWorldPos_1;
                        C0_ = ((_e1339 * _e1340) * vec4<f32>(_e1342.x, _e1342.y, _e1342.z, 1f));
                        let _e1350 = global.projectionMatrix;
                        let _e1351 = global.viewMatrix;
                        let _e1353 = Rf;
                        CD = ((_e1350 * _e1351) * vec4<f32>(_e1353.x, _e1353.y, _e1353.z, 0f));
                        let _e1365 = zW;
                        t_6 = (0.3f + (0.01f * _e1365));
                        loop {
                            let _e1371 = i_14;
                            if !((_e1371 < 16i)) {
                                break;
                            }
                            {
                                let _e1378 = C0_;
                                let _e1379 = CD;
                                let _e1380 = t_6;
                                c_16 = (_e1378 + (_e1379 * _e1380));
                                let _e1384 = c_16;
                                if (_e1384.w <= 0f) {
                                    break;
                                }
                                let _e1388 = c_16;
                                let _e1390 = c_16;
                                q_7 = (((_e1388.xy / vec2(_e1390.w)) * 0.5f) + vec2(0.5f));
                                let _e1400 = q_7;
                                let _e1404 = q_7;
                                let _e1409 = q_7;
                                let _e1414 = q_7;
                                if ((((_e1400.x < 0f) || (_e1404.y < 0f)) || (_e1409.x > 1f)) || (_e1414.y > 1f)) {
                                    break;
                                }
                                let _e1419 = q_7;
                                let _e1420 = sceneZ(_e1419);
                                zs = _e1420;
                                let _e1422 = c_16;
                                let _e1424 = zs;
                                let _e1426 = c_16;
                                let _e1428 = zs;
                                let _e1432 = t_6;
                                if ((_e1422.w > _e1424) && ((_e1426.w - _e1428) < max(0.6f, (0.35f * _e1432)))) {
                                    {
                                        let _e1437 = t0_;
                                        lo = _e1437;
                                        let _e1439 = t_6;
                                        hi = _e1439;
                                        k_3 = 0i;
                                        loop {
                                            let _e1443 = k_3;
                                            if !((_e1443 < 5i)) {
                                                break;
                                            }
                                            {
                                                let _e1451 = lo;
                                                let _e1452 = hi;
                                                tm = (0.5f * (_e1451 + _e1452));
                                                let _e1456 = C0_;
                                                let _e1457 = CD;
                                                let _e1458 = tm;
                                                cm_1 = (_e1456 + (_e1457 * _e1458));
                                                let _e1462 = cm_1;
                                                let _e1464 = cm_1;
                                                let _e1466 = cm_1;
                                                let _e1475 = sceneZ((((_e1464.xy / vec2(_e1466.w)) * 0.5f) + vec2(0.5f)));
                                                if (_e1462.w > _e1475) {
                                                    let _e1477 = tm;
                                                    hi = _e1477;
                                                } else {
                                                    let _e1478 = tm;
                                                    lo = _e1478;
                                                }
                                            }
                                            continuing {
                                                let _e1447 = k_3;
                                                k_3 = (_e1447 + 1i);
                                            }
                                        }
                                        let _e1479 = C0_;
                                        let _e1480 = CD;
                                        let _e1481 = hi;
                                        ch = (_e1479 + (_e1480 * _e1481));
                                        let _e1485 = ch;
                                        let _e1487 = ch;
                                        qh = (((_e1485.xy / vec2(_e1487.w)) * 0.5f) + vec2(0.5f));
                                        let _e1497 = qh;
                                        let _e1499 = qh;
                                        e_3 = min(_e1497, (vec2(1f) - _e1499));
                                        let _e1506 = e_3;
                                        let _e1508 = e_3;
                                        hitK = smoothstep(0f, 0.08f, min(_e1506.x, _e1508.y));
                                        let _e1512 = qh;
                                        let _e1515 = qh;
                                        let _e1520 = textureSampleLevel(tOpaqueTexture, tOpaqueSampler, vec2<f32>(_e1512.x, (1f - _e1515.y)), 0f);
                                        hitC = _e1520.xyz;
                                        break;
                                    }
                                }
                                let _e1522 = t_6;
                                t0_ = _e1522;
                                let _e1523 = t_6;
                                t_6 = (_e1523 * 1.45f);
                            }
                            continuing {
                                let _e1375 = i_14;
                                i_14 = (_e1375 + 1i);
                            }
                        }
                    }
                }
                let _e1526 = skyRefl;
                let _e1527 = hitC;
                let _e1528 = hitK;
                skyRefl = mix(_e1526, _e1527, vec3(_e1528));
            }
            let _e1531 = V_3;
            let _e1532 = global.uSunDir;
            H_2 = normalize((_e1531 + _e1532));
            let _e1536 = wr;
            let _e1537 = wr;
            let _e1539 = wr;
            let _e1541 = wr;
            a2_ = (((_e1536 * _e1537) * _e1539) * _e1541);
            let _e1544 = a2_;
            a2s = max(_e1544, 0.0000001f);
            let _e1548 = Nw;
            let _e1549 = H_2;
            NdH = max(dot(_e1548, _e1549), 0f);
            let _e1554 = V_3;
            let _e1555 = H_2;
            VdH = max(dot(_e1554, _e1555), 0f);
            let _e1560 = a2s;
            let _e1561 = NdH;
            let _e1562 = NdH;
            let _e1564 = a2s;
            Dg = (_e1560 / (PI * pow((((_e1561 * _e1562) * (_e1564 - 1f)) + 1f), 2f)));
            let _e1575 = wr;
            let _e1578 = wr;
            kg = (((_e1575 + 1f) * (_e1578 + 1f)) / 8f);
            let _e1585 = NdV;
            let _e1586 = NdV;
            let _e1588 = kg;
            let _e1591 = kg;
            let _e1594 = ndlW;
            let _e1596 = ndlW;
            let _e1598 = kg;
            let _e1601 = kg;
            Gg = (((_e1585 / ((_e1586 * (1f - _e1588)) + _e1591)) * _e1594) / ((_e1596 * (1f - _e1598)) + _e1601));
            let _e1605 = F0_;
            let _e1607 = F0_;
            let _e1610 = VdH;
            Fs = (_e1605 + ((1f - _e1607) * pow((1f - _e1610), 5f)));
            let _e1617 = body;
            let _e1619 = F;
            let _e1622 = skyRefl;
            let _e1623 = F;
            let _e1626 = global.uSunE;
            let _e1627 = sunT;
            let _e1629 = Dg;
            let _e1631 = Gg;
            let _e1633 = Fs;
            let _e1636 = NdV;
            let _e1641 = muS_2;
            color = (((_e1617 * (1f - _e1619)) + (_e1622 * _e1623)) + ((((((_e1626 * _e1627) * _e1629) * _e1631) * _e1633) / vec3((4f * _e1636))) * step(0f, _e1641)));
            let _e1645 = global.uMoonE;
            if (_e1645.y > 0f) {
                {
                    let _e1649 = up_4;
                    let _e1650 = global.uMoonDir;
                    muMn = dot(_e1649, _e1650);
                    let _e1653 = muMn;
                    if (_e1653 > -0.02f) {
                        {
                            let _e1657 = V_3;
                            let _e1658 = global.uMoonDir;
                            Hm = normalize((_e1657 + _e1658));
                            let _e1662 = Nw;
                            let _e1663 = Hm;
                            NdHm = max(dot(_e1662, _e1663), 0f);
                            let _e1668 = V_3;
                            let _e1669 = Hm;
                            VdHm = max(dot(_e1668, _e1669), 0f);
                            let _e1674 = Nw;
                            let _e1675 = global.uMoonDir;
                            ndlM = max(dot(_e1674, _e1675), 0f);
                            let _e1680 = a2s;
                            let _e1681 = NdHm;
                            let _e1682 = NdHm;
                            let _e1684 = a2s;
                            Dm = (_e1680 / (PI * pow((((_e1681 * _e1682) * (_e1684 - 1f)) + 1f), 2f)));
                            let _e1695 = NdV;
                            let _e1696 = NdV;
                            let _e1698 = kg;
                            let _e1701 = kg;
                            let _e1704 = ndlM;
                            let _e1706 = ndlM;
                            let _e1708 = kg;
                            let _e1711 = kg;
                            Gm = (((_e1695 / ((_e1696 * (1f - _e1698)) + _e1701)) * _e1704) / ((_e1706 * (1f - _e1708)) + _e1711));
                            let _e1715 = F0_;
                            let _e1717 = F0_;
                            let _e1720 = VdHm;
                            Fm = (_e1715 + ((1f - _e1717) * pow((1f - _e1720), 5f)));
                            let _e1727 = color;
                            let _e1728 = global.uMoonE;
                            let _e1729 = r_10;
                            let _e1730 = muMn;
                            let _e1733 = atmoSunTransmittance(_e1729, max(_e1730, 0f));
                            let _e1735 = cloudDirZ;
                            let _e1737 = Dm;
                            let _e1739 = Gm;
                            let _e1741 = Fm;
                            let _e1744 = NdV;
                            color = (_e1727 + ((((((_e1728 * _e1733) * _e1735) * _e1737) * _e1739) * _e1741) / vec3((4f * _e1744))));
                        }
                    }
                }
            }
            let _e1749 = global.uSunE;
            let _e1750 = sunT;
            let _e1752 = up_4;
            let _e1753 = global.uSunDir;
            let _e1758 = global.uSunE;
            let _e1759 = skyE_1;
            lit_1 = (((_e1749 * _e1750) * max(dot(_e1752, _e1753), 0f)) + (_e1758 * _e1759));
            let _e1763 = river_3;
            if _e1763 {
                let _e1767 = fn_;
                let _e1768 = upF_7;
                local_92 = smoothstep(0.13f, 0.3f, (1f - dot(_e1767, _e1768)));
            } else {
                local_92 = 0f;
            }
            let _e1774 = local_92;
            fallK = _e1774;
            let _e1778 = fallK;
            if (_e1778 > 0f) {
                {
                    let _e1781 = upF_7;
                    let _e1782 = fn_;
                    let _e1783 = upF_7;
                    let _e1784 = fn_;
                    dn_4 = (_e1781 - (_e1782 * dot(_e1783, _e1784)));
                    let _e1789 = dn_4;
                    let _e1791 = dn_4;
                    down = (-(_e1789) / vec3(max(length(_e1791), 0.0001f)));
                    let _e1798 = fn_;
                    let _e1799 = down;
                    acr = normalize(cross(_e1798, _e1799));
                    let _e1803 = global.uFallTop;
                    if (_e1803 > 0f) {
                        let _e1806 = global.uFallTop;
                        let _e1807 = r_10;
                        local_93 = max((_e1806 - _e1807), 0f);
                    } else {
                        local_93 = 4f;
                    }
                    let _e1813 = local_93;
                    zf = _e1813;
                    let _e1816 = global.uFall1_;
                    let _e1819 = zf;
                    let _e1824 = global.uFall1_;
                    v_1 = min((sqrt(((2f * _e1816.x) * _e1819)) + 0.3f), _e1824.y);
                    let _e1828 = global.uTime;
                    t1_ = fract((_e1828 * 0.4f));
                    let _e1833 = global.uTime;
                    t2_1 = fract(((_e1833 * 0.4f) + 0.5f));
                    let _e1842 = t1_;
                    wa_2 = (1f - abs(((2f * _e1842) - 1f)));
                    let _e1851 = v_1;
                    L_7 = (1f + (0.12f * _e1851));
                    let _e1855 = vFixedPos_1;
                    let _e1856 = global.uOriginMod;
                    let _e1858 = global.uFallTop;
                    if (_e1858 > 0f) {
                        let _e1861 = global.uFallFoot;
                        local_94 = _e1861;
                    } else {
                        local_94 = vec3(0f);
                    }
                    let _e1865 = local_94;
                    pS = ((_e1855 - _e1856) - _e1865);
                    let _e1868 = vRib_1;
                    let _e1872 = global.uFallW;
                    let _e1878 = zf;
                    let _e1880 = L_7;
                    q_8 = vec2<f32>((((_e1868.x * 0.51f) * max(_e1872, 1f)) / 4.8f), (_e1878 / (48f * _e1880)));
                    let _e1885 = v_1;
                    let _e1889 = L_7;
                    dv_1 = ((_e1885 * 2.5f) / (48f * _e1889));
                    let _e1893 = q_8;
                    let _e1895 = dv_1;
                    let _e1896 = t1_;
                    qA = (_e1893 - vec2<f32>(0f, (_e1895 * _e1896)));
                    let _e1901 = q_8;
                    let _e1907 = dv_1;
                    let _e1908 = t2_1;
                    qB = ((_e1901 + vec2<f32>(0.37f, 0f)) - vec2<f32>(0f, (_e1907 * _e1908)));
                    let _e1913 = qA;
                    let _e1915 = textureSampleLevel(tDetailTexture, tDetailSampler, _e1913, 0f);
                    bA = _e1915.x;
                    let _e1918 = qB;
                    let _e1920 = textureSampleLevel(tDetailTexture, tDetailSampler, _e1918, 0f);
                    bB = _e1920.x;
                    let _e1923 = bA;
                    let _e1925 = q_8;
                    let _e1936 = dv_1;
                    let _e1938 = t1_;
                    let _e1943 = textureSampleLevel(tDetailTexture, tDetailSampler, (((_e1925 * vec2<f32>(3f, 2f)) + vec2<f32>(0.53f, 0f)) - vec2<f32>(0f, ((2f * _e1936) * _e1938))), 0f);
                    sA = (_e1923 + (0.45f * _e1943.x));
                    let _e1948 = bB;
                    let _e1950 = q_8;
                    let _e1961 = dv_1;
                    let _e1963 = t2_1;
                    let _e1968 = textureSampleLevel(tDetailTexture, tDetailSampler, (((_e1950 * vec2<f32>(3f, 2f)) + vec2<f32>(0.11f, 0f)) - vec2<f32>(0f, ((2f * _e1961) * _e1963))), 0f);
                    sB = (_e1948 + (0.45f * _e1968.x));
                    let _e1974 = sB;
                    let _e1975 = sA;
                    let _e1976 = wa_2;
                    st_2 = clamp((0.5f + ((mix(_e1974, _e1975, _e1976) - 0.725f) * 2.2f)), 0f, 1f);
                    let _e1987 = qB;
                    let _e1993 = textureSampleLevel(tDetailTexture, tDetailSampler, (_e1987 + vec2<f32>(0.031f, 0f)), 0f);
                    let _e1995 = bB;
                    let _e1997 = qA;
                    let _e2003 = textureSampleLevel(tDetailTexture, tDetailSampler, (_e1997 + vec2<f32>(0.031f, 0f)), 0f);
                    let _e2005 = bA;
                    let _e2007 = wa_2;
                    gS = (mix((_e1993.x - _e1995), (_e2003.x - _e2005), _e2007) / 0.15f);
                    let _e2013 = vRib_1;
                    let _e2015 = vRib_1;
                    edge = (1f - (_e2013.x * _e2015.x));
                    let _e2020 = vRib_1;
                    let _e2024 = vFlw_1;
                    qU = (max(_e2020.y, 0.1f) * max((_e2024.w * 9f), 0.3f));
                    let _e2032 = zf;
                    let _e2034 = qU;
                    br_1 = clamp((_e2032 / (6f * pow(_e2034, 0.32f))), 0f, 1f);
                    let _e2045 = global.uFall2_;
                    let _e2050 = zf;
                    aer = (mix(0.25f, 0.95f, _e2045.y) * smoothstep(0f, 0.5f, _e2050));
                    let _e2056 = br_1;
                    th_2 = mix(0.72f, 0.22f, _e2056);
                    let _e2059 = th_2;
                    let _e2062 = th_2;
                    let _e2065 = st_2;
                    let _e2067 = edge;
                    jets = smoothstep((_e2059 - 0.14f), (_e2062 + 0.14f), (_e2065 + (0.75f * (_e2067 - 1f))));
                    let _e2074 = aer;
                    let _e2075 = jets;
                    white = clamp((_e2074 * _e2075), 0f, 1f);
                    let _e2081 = white;
                    dbgWhite = _e2081;
                    let _e2082 = Nw;
                    let _e2083 = global.uToFixed;
                    let _e2085 = acr;
                    let _e2087 = gS;
                    nS = normalize((_e2082 + ((transpose(_e2083) * _e2085) * clamp((_e2087 * 1.6f), -0.9f, 0.9f))));
                    let _e2098 = global.uSunE;
                    let _e2099 = sunT;
                    let _e2101 = nS;
                    let _e2102 = global.uSunDir;
                    let _e2107 = global.uSunE;
                    let _e2108 = skyE_1;
                    litS = (((_e2098 * _e2099) * max(dot(_e2101, _e2102), 0f)) + ((_e2107 * _e2108) * 0.6f));
                    let _e2118 = st_2;
                    albS = mix(0.5f, 0.92f, smoothstep(0.15f, 0.85f, _e2118));
                    let _e2122 = color;
                    let _e2123 = color;
                    let _e2126 = albS;
                    let _e2131 = litS;
                    let _e2133 = white;
                    let _e2136 = fallK;
                    color = mix(_e2122, mix((_e2123 * 0.8f), ((vec3(_e2126) / vec3(3.1415927f)) * _e2131), vec3(_e2133)), vec3(_e2136));
                    let _e2139 = color;
                    let _e2140 = sc_1;
                    let _e2144 = sc_1;
                    let _e2150 = textureSampleLevel(tOpaqueTexture, tOpaqueSampler, vec2<f32>(_e2140.x, (1f - _e2144.y)), 0f);
                    let _e2152 = fallK;
                    let _e2155 = vRib_1;
                    let _e2161 = white;
                    color = mix(_e2139, _e2150.xyz, vec3(((_e2152 * smoothstep(0.6f, 1f, abs(_e2155.x))) * (1f - _e2161))));
                    let _e2166 = foam_2;
                    let _e2168 = fallK;
                    foam_2 = (_e2166 * (1f - _e2168));
                }
            }
            let _e2171 = global.uFallTop;
            if (_e2171 > 0f) {
                {
                    let _e2174 = vFixedPos_1;
                    let _e2175 = global.uOriginMod;
                    let _e2177 = global.uFallFoot;
                    Lf = ((_e2174 - _e2175) - _e2177);
                    let _e2181 = global.uFallAcr;
                    let _e2182 = global.uFallAcr;
                    hasA = step(0.5f, dot(_e2181, _e2182));
                    let _e2186 = Lf;
                    let _e2187 = global.uFallAcr;
                    let _e2191 = global.uFallW;
                    let _e2194 = global.uFallW;
                    let _e2197 = hasA;
                    al_2 = (clamp(dot(_e2186, _e2187), (-0.5f * _e2191), (0.5f * _e2194)) * _e2197);
                    let _e2200 = Lf;
                    let _e2201 = global.uFallAcr;
                    let _e2202 = al_2;
                    let _e2206 = global.uFallW;
                    let _e2215 = global.uFallW;
                    let _e2218 = hasA;
                    dF = (length((_e2200 - (_e2201 * _e2202))) / mix(max(((_e2206 * 1.2f) + 2f), 2f), (3f + (0.15f * _e2215)), _e2218));
                    let _e2222 = vFlw_1;
                    flL = length(_e2222.xyz);
                    let _e2226 = flL;
                    if (_e2226 > 0.0001f) {
                        let _e2229 = vFlw_1;
                        let _e2231 = flL;
                        local_95 = (_e2229.xyz / vec3(_e2231));
                    } else {
                        let _e2234 = upF_7;
                        local_95 = normalize((cross(_e2234, vec3<f32>(0f, 0f, 1f)) + vec3<f32>(0.0001f, 0f, 0f)));
                    }
                    let _e2247 = local_95;
                    fd_1 = _e2247;
                    let _e2249 = upF_7;
                    let _e2250 = fd_1;
                    fa_1 = normalize(cross(_e2249, _e2250));
                    let _e2254 = Lf;
                    let _e2255 = fa_1;
                    let _e2257 = Lf;
                    let _e2258 = fd_1;
                    let _e2260 = global.uTime;
                    let _e2261 = flL;
                    q2_ = (vec2<f32>(dot(_e2254, _e2255), (dot(_e2257, _e2258) - (_e2260 * max((_e2261 * 9f), 0.4f)))) * 0.18f);
                    let _e2272 = q2_;
                    let _e2274 = textureSampleLevel(tDetailTexture, tDetailSampler, _e2272, 0f);
                    let _e2278 = q2_;
                    let _e2285 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e2278 * 2.7f) + vec2(0.31f)), 0f);
                    fz_1 = ((_e2274.x * 0.65f) + (_e2285.w * 0.35f));
                    let _e2294 = dF;
                    core = (1f - smoothstep(0.05f, 0.45f, _e2294));
                    let _e2301 = dF;
                    ring_1 = (1f - smoothstep(0.2f, 1f, _e2301));
                    let _e2305 = core;
                    let _e2308 = ring_1;
                    let _e2311 = ring_1;
                    let _e2315 = fz_1;
                    fm = max((_e2305 * 0.9f), (_e2308 * smoothstep((0.55f - (0.3f * _e2311)), 0.8f, _e2315)));
                    let _e2320 = foam_2;
                    let _e2321 = fm;
                    let _e2324 = global.uFall2_;
                    let _e2329 = fallK;
                    foam_2 = max(_e2320, ((_e2321 * mix(0.35f, 0.95f, _e2324.y)) * (1f - _e2329)));
                }
            }
            let _e2333 = color;
            let _e2344 = lit_1;
            let _e2346 = foam_2;
            color = mix(_e2333, (vec3<f32>(0.23873241f, 0.23873241f, 0.23873241f) * _e2344), vec3(clamp(_e2346, 0f, 1f)));
            let _e2352 = ice_8;
            if (_e2352 > 0f) {
                {
                    let _e2355 = nW;
                    dI = _e2355;
                    let _e2357 = nG;
                    dJ = _e2357;
                    let _e2359 = kind_4;
                    if (_e2359 < 0.2f) {
                        {
                            let _e2364 = lead_1;
                            let _e2368 = fl;
                            lIce = (smoothstep(0.3f, 1.5f, _e2364.x) * (1f - _e2368.x));
                            let _e2376 = lead_1;
                            let _e2395 = lead_1;
                            lAlb = mix((vec3((0.07f + (0.33f * (1f - exp((-(_e2376.x) / 10f)))))) * vec3<f32>(0.92f, 0.97f, 1f)), vec3<f32>(0.82f, 0.86f, 0.9f), vec3(_e2395.y));
                            let _e2400 = color;
                            let _e2401 = lAlb;
                            let _e2405 = global.uSunE;
                            let _e2406 = sunT;
                            let _e2408 = muS_2;
                            let _e2412 = global.uSunE;
                            let _e2413 = skyE_1;
                            let _e2417 = lIce;
                            color = mix(_e2400, ((_e2401 / vec3(3.1415927f)) * (((_e2405 * _e2406) * max(_e2408, 0f)) + (_e2412 * _e2413))), vec3(_e2417));
                            let _e2420 = albedo;
                            let _e2421 = lAlb;
                            let _e2422 = lIce;
                            albedo = mix(_e2420, _e2421, vec3(_e2422));
                        }
                    }
                    let _e2425 = fl;
                    ice_8 = _e2425.x;
                    let _e2427 = global.uSeason;
                    if (_e2427.z > 0.5f) {
                        let _e2434 = Tair_2;
                        local_96 = smoothstep(-1f, 2f, _e2434);
                    } else {
                        local_96 = 0f;
                    }
                    let _e2438 = local_96;
                    thaw = _e2438;
                    let _e2442 = fl;
                    let _e2444 = dJ;
                    let _e2454 = fl;
                    let _e2457 = fl;
                    let _e2466 = thaw;
                    snowy = ((smoothstep(0.3f, 0.7f, (_e2442.z + ((_e2444.w - 0.5f) * 0.25f))) * (1f - ((0.7f * _e2454.y) / max(_e2457.x, 0.001f)))) * (1f - (0.7f * _e2466)));
                    let _e2479 = snowy;
                    let _e2484 = dI;
                    iceAlb = (mix(vec3<f32>(0.42f, 0.52f, 0.6f), vec3<f32>(0.82f, 0.86f, 0.9f), vec3(_e2479)) * (0.9f + (0.2f * _e2484.x)));
                    let _e2490 = global.uSeason;
                    if (_e2490.z > 0.5f) {
                        let _e2494 = Tair_2;
                        let _e2495 = dJ;
                        let _e2499 = fp_10;
                        let _e2500 = w_10;
                        let _e2502 = tri(_e2499, _e2500, 8f);
                        let _e2507 = meltPond(_e2494, ((_e2495.x * 0.6f) + (_e2502.x * 0.4f)));
                        let _e2511 = ridge_2;
                        local_97 = (_e2507 * (1f - smoothstep(0f, 0.2f, _e2511.w)));
                    } else {
                        local_97 = 0f;
                    }
                    let _e2518 = local_97;
                    pond_1 = _e2518;
                    let _e2520 = iceAlb;
                    let _e2525 = pond_1;
                    iceAlb = mix(_e2520, vec3<f32>(0.12f, 0.32f, 0.45f), vec3(_e2525));
                    let _e2528 = up_4;
                    let _e2529 = N_4;
                    N2_ = normalize(mix(_e2528, _e2529, vec3(0.5f)));
                    let _e2535 = ridge_2;
                    if (_e2535.w > 0f) {
                        {
                            let _e2539 = fp_10;
                            let _e2540 = w_10;
                            let _e2542 = tri(_e2539, _e2540, 2f);
                            blk = _e2542.x;
                            let _e2545 = iceAlb;
                            let _e2556 = blk;
                            let _e2562 = ridge_2;
                            iceAlb = mix(_e2545, mix(vec3<f32>(0.5f, 0.62f, 0.7f), vec3<f32>(0.85f, 0.88f, 0.92f), vec3(smoothstep(0.35f, 0.6f, _e2556))), vec3(smoothstep(0f, 0.2f, _e2562.w)));
                            let _e2567 = N2_;
                            let _e2568 = global.uToFixed;
                            let _e2570 = ridge_2;
                            let _e2577 = ridge_2;
                            N2_ = normalize((_e2567 + (((transpose(_e2568) * _e2570.xyz) * 0.5f) * smoothstep(0f, 0.1f, _e2577.w))));
                        }
                    }
                    let _e2583 = iceAlb;
                    let _e2587 = global.uSunE;
                    let _e2588 = sunT;
                    let _e2590 = N2_;
                    let _e2591 = global.uSunDir;
                    let _e2596 = global.uSunE;
                    let _e2597 = skyE_1;
                    let _e2601 = N2_;
                    let _e2602 = up_4;
                    iceCol = ((_e2583 / vec3(3.1415927f)) * (((_e2587 * _e2588) * max(dot(_e2590, _e2591), 0f)) + ((_e2596 * _e2597) * (0.5f + (0.5f * dot(_e2601, _e2602))))));
                    let _e2610 = N2_;
                    let _e2611 = H_2;
                    NdH2_ = max(dot(_e2610, _e2611), 0f);
                    let _e2616 = iceCol;
                    let _e2617 = global.uSunE;
                    let _e2618 = sunT;
                    let _e2620 = NdH2_;
                    let _e2623 = snowy;
                    let _e2630 = muS_2;
                    iceCol = (_e2616 + ((((_e2617 * _e2618) * pow(_e2620, mix(400f, 40f, _e2623))) * 0.04f) * step(0f, _e2630)));
                    let _e2634 = iceCol;
                    let _e2635 = global.uSunE;
                    let _e2636 = sunT;
                    let _e2638 = up_4;
                    let _e2639 = N2_;
                    let _e2644 = H_2;
                    let _e2653 = pond_1;
                    let _e2656 = muS_2;
                    iceCol = (_e2634 + (((((_e2635 * _e2636) * pow(max(dot(normalize(mix(_e2638, _e2639, vec3(0.2f))), _e2644), 0f), 600f)) * 0.4f) * _e2653) * step(0f, _e2656)));
                    let _e2660 = color;
                    let _e2661 = iceCol;
                    let _e2662 = ice_8;
                    color = mix(_e2660, _e2661, vec3(_e2662));
                    let _e2665 = albedo;
                    let _e2666 = iceAlb;
                    let _e2667 = ice_8;
                    albedo = mix(_e2665, _e2666, vec3(_e2667));
                }
            }
            let _e2670 = fallK;
            if (_e2670 > 0f) {
                {
                    let _e2674 = tsf;
                    let _e2678 = tsf;
                    let _e2682 = tsf;
                    iceF = (1f - smoothstep((_e2674.y - 12f), (_e2678.y - 4f), _e2682.x));
                    let _e2687 = iceF;
                    if (_e2687 > 0f) {
                        {
                            let _e2690 = upF_7;
                            let _e2691 = fn_;
                            let _e2692 = upF_7;
                            let _e2693 = fn_;
                            dnI = (_e2690 - (_e2691 * dot(_e2692, _e2693)));
                            let _e2698 = dnI;
                            let _e2700 = dnI;
                            downI = (-(_e2698) / vec3(max(length(_e2700), 0.0001f)));
                            let _e2707 = fn_;
                            let _e2708 = downI;
                            acrI = normalize(cross(_e2707, _e2708));
                            let _e2712 = vFixedPos_1;
                            let _e2713 = global.uOriginMod;
                            let _e2715 = global.uFallTop;
                            if (_e2715 > 0f) {
                                let _e2718 = global.uFallFoot;
                                local_98 = _e2718;
                            } else {
                                local_98 = vec3(0f);
                            }
                            let _e2722 = local_98;
                            pI = ((_e2712 - _e2713) - _e2722);
                            let _e2725 = vRib_1;
                            let _e2729 = global.uFallW;
                            let _e2733 = global.uFallTop;
                            if (_e2733 > 0f) {
                                let _e2736 = global.uFallTop;
                                let _e2737 = r_10;
                                local_99 = max((_e2736 - _e2737), 0f);
                            } else {
                                let _e2741 = pI;
                                let _e2742 = downI;
                                local_99 = dot(_e2741, _e2742);
                            }
                            let _e2745 = local_99;
                            qi = vec2<f32>(((_e2725.x * 0.51f) * max(_e2729, 1f)), _e2745);
                            let _e2748 = qi;
                            let _e2752 = qi;
                            qa_1 = vec2<f32>((_e2748.x * 0.2f), (_e2752.y * 0.015f));
                            let _e2758 = qi;
                            let _e2764 = qi;
                            qb_1 = vec2<f32>(((_e2758.x * 0.6f) + 0.3f), (_e2764.y * 0.04f));
                            let _e2770 = qa_1;
                            let _e2772 = textureSampleLevel(tDetailTexture, tDetailSampler, _e2770, 0f);
                            let _e2776 = qb_1;
                            let _e2778 = textureSampleLevel(tDetailTexture, tDetailSampler, _e2776, 0f);
                            cols = ((_e2772.x * 0.6f) + (_e2778.w * 0.4f));
                            let _e2784 = qa_1;
                            let _e2790 = textureSampleLevel(tDetailTexture, tDetailSampler, (_e2784 + vec2<f32>(0.01f, 0f)), 0f);
                            let _e2794 = qb_1;
                            let _e2800 = textureSampleLevel(tDetailTexture, tDetailSampler, (_e2794 + vec2<f32>(0.03f, 0f)), 0f);
                            colsX = ((_e2790.x * 0.6f) + (_e2800.w * 0.4f));
                            let _e2808 = cols;
                            thick = smoothstep(0.35f, 0.7f, _e2808);
                            let _e2819 = thick;
                            alb = mix(vec3<f32>(0.2f, 0.4f, 0.56f), vec3<f32>(0.88f, 0.93f, 0.97f), vec3(_e2819));
                            let _e2823 = Nw;
                            let _e2824 = global.uToFixed;
                            let _e2826 = acrI;
                            let _e2828 = colsX;
                            let _e2829 = cols;
                            nI_1 = normalize((_e2823 - (((transpose(_e2824) * _e2826) * (_e2828 - _e2829)) * 30f)));
                            let _e2837 = global.uSunE;
                            let _e2838 = sunT;
                            let _e2840 = nI_1;
                            let _e2841 = global.uSunDir;
                            let _e2846 = global.uSunE;
                            let _e2847 = skyE_1;
                            litI = (((_e2837 * _e2838) * max(dot(_e2840, _e2841), 0f)) + ((_e2846 * _e2847) * 0.7f));
                            let _e2853 = nI_1;
                            let _e2854 = V_3;
                            let _e2855 = global.uSunDir;
                            spI = (pow(max(dot(_e2853, normalize((_e2854 + _e2855))), 0f), 60f) * 0.6f);
                            let _e2866 = color;
                            let _e2867 = alb;
                            let _e2871 = litI;
                            let _e2873 = global.uSunE;
                            let _e2874 = sunT;
                            let _e2876 = spI;
                            let _e2879 = muS_2;
                            let _e2883 = fallK;
                            let _e2884 = iceF;
                            color = mix(_e2866, (((_e2867 / vec3(3.1415927f)) * _e2871) + (((_e2873 * _e2874) * _e2876) * step(0f, _e2879))), vec3((_e2883 * _e2884)));
                        }
                    }
                }
            }
            let _e2888 = global.uDebug;
            if (_e2888 > 6.5f) {
                let _e2891 = fallK;
                let _e2892 = dbgWhite;
                let _e2893 = river_3;
                if _e2893 {
                    local_100 = 1f;
                } else {
                    local_100 = 0f;
                }
                let _e2897 = local_100;
                local_105 = vec3<f32>(_e2891, _e2892, _e2897);
            } else {
                let _e2899 = global.uDebug;
                if (_e2899 < 2.5f) {
                    let _e2902 = ice_8;
                    local_104 = vec3(_e2902);
                } else {
                    let _e2904 = global.uDebug;
                    if (_e2904 < 3.5f) {
                        let _e2907 = Tm_2;
                        local_103 = vec3((_e2907 / 40f));
                    } else {
                        let _e2911 = global.uDebug;
                        if (_e2911 < 4.5f) {
                            let _e2914 = foam_2;
                            local_102 = vec3(_e2914);
                        } else {
                            let _e2916 = global.uDebug;
                            if (_e2916 < 5.5f) {
                                let _e2919 = vLiq_1;
                                local_101 = _e2919.xyz;
                            } else {
                                let _e2921 = wr;
                                local_101 = vec3((_e2921 * 4f));
                            }
                            let _e2926 = local_101;
                            local_102 = _e2926;
                        }
                        let _e2928 = local_102;
                        local_103 = _e2928;
                    }
                    let _e2930 = local_103;
                    local_104 = _e2930;
                }
                let _e2932 = local_104;
                local_105 = _e2932;
            }
            let _e2934 = local_105;
            dbgW = _e2934;
        }
    }
    let _e2935 = global.uThermal;
    if (_e2935.x > 0f) {
        {
            let _e2939 = albedo;
            a_16 = clamp(_e2939, vec3(0f), vec3(1f));
            let _e2946 = color;
            let _e2949 = a_16;
            let _e2951 = global.uThermal;
            let _e2953 = global.uThermal;
            let _e2955 = r_10;
            let _e2956 = global.uRadius;
            let _e2960 = blackbodyGlow((_e2951.x - (_e2953.y * (_e2955 - _e2956))));
            color = (_e2946 + ((vec3(1f) - _e2949) * _e2960));
            let _e2963 = color;
            let _e2964 = a_16;
            let _e2967 = r_10;
            let _e2969 = atmoSunTransmittance(_e2967, 1f);
            let _e2972 = global.uThermal;
            let _e2974 = global.uThermal;
            let _e2976 = r_10;
            let _e2977 = global.uRadius;
            let _e2983 = blackbodyGlow((_e2972.x - (_e2974.z * max((_e2976 - _e2977), 0f))));
            color = (_e2963 + ((_e2964 * (vec3(1f) - _e2969)) * _e2983));
        }
    }
    let _e2986 = emissive;
    if (_e2986 > 0.01f) {
        {
            let _e2991 = global.uTime;
            let _e2994 = vFixedPos_1;
            let _e2999 = vFixedPos_1;
            flick = (0.85f + (0.15f * sin((((_e2991 * 1.7f) + (_e2994.x * 0.05f)) + (_e2999.z * 0.07f)))));
            let _e3010 = fp_10;
            let _e3011 = w_10;
            let _e3013 = tri(_e3010, _e3011, 128f);
            crust = smoothstep(0.35f, 0.65f, _e3013.w);
            let _e3017 = color;
            let _e3018 = global.uLavaColor;
            let _e3019 = emissive;
            let _e3021 = flick;
            let _e3025 = crust;
            let _e3027 = emissive;
            color = (_e3017 + (((_e3018 * _e3019) * _e3021) * mix(1f, 0.15f, (_e3025 * (1f - (_e3027 * 0.5f))))));
        }
    }
    let _e3035 = global.uDebug;
    if (_e3035 > 1.5f) {
        let _e3038 = dbgW;
        if (_e3038.x < 0f) {
            let _e3046 = waterEnc;
            local_106 = ((vec3<f32>(0.5f, 0f, 0.5f) * _e3046) * 50f);
        } else {
            let _e3050 = dbgW;
            local_106 = _e3050;
        }
        let _e3052 = local_106;
        let _e3053 = global.uDebug;
        if (_e3053 > 7.5f) {
            local_107 = 0.02f;
        } else {
            local_107 = 1f;
        }
        let _e3059 = local_107;
        color = (_e3052 * _e3059);
    } else {
        let _e3061 = global.uDebug;
        if (_e3061 > 0.5f) {
            let _e3064 = color;
            let _e3065 = vMorphK_1;
            let _e3067 = vMorphK_1;
            color = mix(_e3064, (vec3<f32>(_e3065, (1f - _e3067), 0f) * 0.2f), vec3(0.5f));
        }
    }
    let _e3076 = color;
    fragmentColor = vec4<f32>(_e3076.x, _e3076.y, _e3076.z, 1f);
    return;
}

@fragment 
fn main(@location(0) vNearRel: vec3<f32>, @location(1) vWorldPos: vec3<f32>, @location(2) vNormal: vec3<f32>, @location(3) vFixedPos: vec3<f32>, @location(4) vFixedNormal: vec3<f32>, @location(5) vCol: vec4<f32>, @location(6) vMat: vec4<f32>, @location(7) vExt: vec4<f32>, @location(8) vLiq: vec4<f32>, @location(9) vFlw: vec4<f32>, @location(10) vShore: f32, @location(11) vMorphK: f32, @location(12) vRib: vec2<f32>, @builtin(position) gl_FragCoord: vec4<f32>) -> FragmentOutput {
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
    vRib_1 = vRib;
    gl_FragCoord_1 = gl_FragCoord;
    main_1();
    let _e269 = fragmentColor;
    return FragmentOutput(_e269);
}
`;
