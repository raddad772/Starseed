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
      "name": "uWaveK",
      "type": "vec4",
      "count": 36,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 1040
    },
    {
      "name": "uZMode",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 1616
    },
    {
      "name": "uZNear",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 1620
    },
    {
      "name": "uZFar",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 1624
    },
    {
      "name": "uZLogFC",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 1628
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
  "bytes": 1632,
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
const SURF_B0_: f32 = 0.035f;
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
    let _e169 = global.uSunLift;
    hD = (1.5707963f + _e169.x);
    let _e174 = global.uSunLift;
    hT = (1.5707963f + _e174.y);
    let _e178 = zd_1;
    let _e179 = hD;
    if (_e178 <= _e179) {
        let _e181 = zd_1;
        let _e182 = hT;
        let _e184 = hD;
        local = ((_e181 * _e182) / _e184);
    } else {
        let _e186 = hT;
        let _e187 = zd_1;
        let _e188 = hD;
        let _e191 = hT;
        let _e195 = hD;
        local = (_e186 + (((_e187 - _e188) * (3.1415927f - _e191)) / (3.1415927f - _e195)));
    }
    let _e200 = local;
    return _e200;
}

fn liftMu(mu: f32) -> f32 {
    var mu_1: f32;

    mu_1 = mu;
    let _e168 = global.uSunLift;
    let _e170 = global.uSunLift;
    if (_e168.x <= _e170.y) {
        let _e173 = mu_1;
        return _e173;
    }
    let _e174 = mu_1;
    let _e180 = lensTrueZ(acos(clamp(_e174, -1f, 1f)));
    return cos(_e180);
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
    let _e171 = global.uTop;
    let _e172 = global.uTop;
    let _e174 = global.uBottom;
    let _e175 = global.uBottom;
    H = sqrt(max(0f, ((_e171 * _e172) - (_e174 * _e175))));
    let _e182 = r_1;
    let _e183 = r_1;
    let _e185 = global.uBottom;
    let _e186 = global.uBottom;
    rho = sqrt(max(0f, ((_e182 * _e183) - (_e185 * _e186))));
    let _e192 = r_1;
    let _e193 = r_1;
    let _e195 = mu_3;
    let _e196 = mu_3;
    let _e201 = global.uTop;
    let _e202 = global.uTop;
    disc = (((_e192 * _e193) * ((_e195 * _e196) - 1f)) + (_e201 * _e202));
    let _e207 = r_1;
    let _e209 = mu_3;
    let _e211 = disc;
    d = max(0f, ((-(_e207) * _e209) + sqrt(max(_e211, 0f))));
    let _e218 = global.uTop;
    let _e219 = r_1;
    dMin = (_e218 - _e219);
    let _e222 = rho;
    let _e223 = H;
    dMax = (_e222 + _e223);
    let _e226 = d;
    let _e227 = dMin;
    let _e229 = dMax;
    let _e230 = dMin;
    let _e235 = rho;
    let _e236 = H;
    return vec2<f32>(((_e226 - _e227) / max((_e229 - _e230), 0.000001f)), (_e235 / max(_e236, 0.000001f)));
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
    let _e170 = mu_5;
    let _e171 = liftMu(_e170);
    mu_5 = _e171;
    let _e172 = global.uGround;
    let _e173 = global.uTrueK;
    Rg = (_e172 * max(_e173, 1f));
    let _e178 = Rg;
    let _e179 = Rg;
    let _e180 = r_3;
    let _e181 = global.uGround;
    sinH = (_e178 / (_e179 + max((_e180 - _e181), 0f)));
    let _e190 = sinH;
    let _e191 = sinH;
    cosH = -(sqrt(max(0f, (1f - (_e190 * _e191)))));
    let _e198 = cosH;
    let _e201 = cosH;
    let _e204 = mu_5;
    vis = smoothstep((_e198 - 0.01f), (_e201 + 0.01f), _e204);
    let _e207 = global.uHasAtmo;
    if (_e207 < 0.5f) {
        let _e210 = vis;
        return vec3(_e210);
    }
    let _e212 = r_3;
    let _e213 = global.uBottom;
    let _e214 = global.uTop;
    let _e216 = mu_5;
    let _e217 = transmittanceUV(clamp(_e212, _e213, _e214), _e216);
    uv = _e217;
    let _e226 = uv;
    uv = (vec2<f32>(0.001953125f, 0.0078125f) + (_e226 * vec2<f32>(0.99609375f, 0.984375f)));
    let _e236 = uv;
    let _e238 = textureSampleLevel(tTransTexture, tTransSampler, _e236, 0f);
    let _e240 = vis;
    return (_e238.xyz * _e240);
}

fn atmoSkyIrradiance(r_4: f32, mu_6: f32) -> vec3<f32> {
    var r_5: f32;
    var mu_7: f32;
    var uv_1: vec2<f32>;

    r_5 = r_4;
    mu_7 = mu_6;
    let _e170 = global.uHasAtmo;
    if (_e170 < 0.5f) {
        return vec3(0f);
    }
    let _e175 = mu_7;
    let _e176 = liftMu(_e175);
    mu_7 = _e176;
    let _e177 = mu_7;
    let _e182 = r_5;
    let _e183 = global.uGround;
    let _e185 = global.uTop;
    let _e186 = global.uGround;
    uv_1 = vec2<f32>(((_e177 * 0.5f) + 0.5f), clamp(((_e182 - _e183) / (_e185 - _e186)), 0f, 1f));
    let _e201 = uv_1;
    uv_1 = (vec2<f32>(0.0078125f, 0.03125f) + (_e201 * vec2<f32>(0.984375f, 0.9375f)));
    let _e211 = uv_1;
    let _e213 = textureSampleLevel(tIrrTexture, tIrrSampler, _e211, 0f);
    return _e213.xyz;
}

fn seasonYear(dirF: vec3<f32>) -> vec3<f32> {
    var dirF_1: vec3<f32>;
    var m: vec4<f32>;

    dirF_1 = dirF;
    let _e169 = dirF_1;
    let _e171 = dirF_1;
    let _e178 = dirF_1;
    let _e191 = textureSampleLevel(tSeasonMapTexture, tSeasonMapSampler, vec2<f32>(((atan2(_e169.z, _e171.x) / 6.28319f) + 0.5f), ((asin(clamp(_e178.y, -1f, 1f)) / 3.14159f) + 0.5f)), 0f);
    m = _e191;
    let _e193 = m;
    let _e199 = m;
    let _e205 = m;
    let _e207 = m;
    return vec3<f32>(((_e193.x - 0.5f) * 100f), ((_e199.y - 0.5f) * 100f), ((_e205.z * _e207.z) * 600f));
}

fn seasonIceNow(dirF_2: vec3<f32>) -> f32 {
    var dirF_3: vec3<f32>;
    var m_1: vec4<f32>;

    dirF_3 = dirF_2;
    let _e169 = dirF_3;
    let _e171 = dirF_3;
    let _e178 = dirF_3;
    let _e191 = textureSampleLevel(tSeasonIceTexture, tSeasonIceSampler, vec2<f32>(((atan2(_e169.z, _e171.x) / 6.28319f) + 0.5f), ((asin(clamp(_e178.y, -1f, 1f)) / 3.14159f) + 0.5f)), 0f);
    m_1 = _e191;
    let _e193 = m_1;
    let _e199 = m_1;
    let _e205 = global.uSeason;
    let _e210 = m_1;
    let _e216 = global.uSeason;
    return ((((_e193.z - 0.5f) * 100f) + (((_e199.x - 0.5f) * 100f) * cos(_e205.x))) + (((_e210.y - 0.5f) * 100f) * sin(_e216.x)));
}

fn seaIceAt(m_2: vec3<f32>, Tf: f32) -> f32 {
    var m_3: vec3<f32>;
    var Tf_1: f32;
    var u: vec3<f32>;
    var t: vec4<f32>;
    var Ts: f32;

    m_3 = m_2;
    Tf_1 = Tf;
    let _e171 = m_3;
    u = normalize(_e171);
    let _e174 = u;
    let _e176 = u;
    let _e183 = u;
    let _e196 = textureSampleLevel(tSeasonMapTexture, tSeasonMapSampler, vec2<f32>(((atan2(_e174.z, _e176.x) / 6.28319f) + 0.5f), ((asin(clamp(_e183.y, -1f, 1f)) / 3.14159f) + 0.5f)), 0f);
    t = _e196;
    let _e198 = t;
    let _e204 = t;
    let _e210 = global.uSeason;
    let _e215 = t;
    let _e221 = global.uSeason;
    Ts = ((((_e198.w * 120f) - 60f) + (((_e204.x - 0.5f) * 100f) * cos(_e210.x))) + (((_e215.y - 0.5f) * 100f) * sin(_e221.x)));
    let _e228 = Tf_1;
    let _e231 = Tf_1;
    let _e234 = Ts;
    return (1f - smoothstep((_e228 - 4f), (_e231 + 4f), _e234));
}

fn meltPond(Tair: f32, n: f32) -> f32 {
    var Tair_1: f32;
    var n_1: f32;
    var f: f32;
    var local_1: f32;

    Tair_1 = Tair;
    n_1 = n;
    let _e175 = Tair_1;
    f = (0.45f * smoothstep(-0.5f, 4f, _e175));
    let _e179 = f;
    if (_e179 > 0f) {
        let _e183 = f;
        let _e186 = f;
        let _e189 = n_1;
        local_1 = (1f - smoothstep((_e183 - 0.06f), (_e186 + 0.06f), _e189));
    } else {
        local_1 = 0f;
    }
    let _e194 = local_1;
    return _e194;
}

fn cloudN(n_2: f32) -> f32 {
    var n_3: f32;

    n_3 = n_2;
    let _e176 = n_3;
    return (0.55f + ((_e176 - 0.682f) * 4.3f));
}

fn cloudBias(cover: f32) -> f32 {
    var cover_1: f32;

    cover_1 = cover;
    let _e175 = cover_1;
    let _e183 = cover_1;
    let _e191 = cover_1;
    return ((((_e175 - 0.5f) * 0.3f) + (0.5f * smoothstep(0.8f, 1f, _e183))) - (0.5f * (1f - smoothstep(0f, 0.2f, _e191))));
}

fn cloudFade(foot: f32, L: f32) -> f32 {
    var foot_1: f32;
    var L_1: f32;

    foot_1 = foot;
    L_1 = L;
    let _e179 = foot_1;
    let _e182 = L_1;
    return smoothstep(1f, 4f, ((_e179 * 64f) / _e182));
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
    let _e176 = textureDimensions(tCloudMapTexture, 0i);
    sz = vec2<f32>(vec2<i32>(_e176));
    let _e180 = uv_3;
    let _e181 = sz;
    st = ((_e180 * _e181) - vec2(0.5f));
    let _e187 = st;
    i = floor(_e187);
    let _e190 = st;
    let _e191 = i;
    f_1 = (_e190 - _e191);
    let _e194 = f_1;
    let _e195 = f_1;
    f2_ = (_e194 * _e195);
    let _e198 = f2_;
    let _e199 = f_1;
    f3_ = (_e198 * _e199);
    let _e204 = f_1;
    let _e209 = f2_;
    let _e212 = f3_;
    w0_ = ((((vec2(1f) - (3f * _e204)) + (3f * _e209)) - _e212) / vec2(6f));
    let _e220 = f2_;
    let _e225 = f3_;
    w1_ = (((vec2(4f) - (6f * _e220)) + (3f * _e225)) / vec2(6f));
    let _e234 = f_1;
    let _e239 = f2_;
    let _e243 = f3_;
    w2_ = ((((vec2(1f) + (3f * _e234)) + (3f * _e239)) - (3f * _e243)) / vec2(6f));
    let _e250 = f3_;
    w3_ = (_e250 / vec2(6f));
    let _e255 = w0_;
    let _e256 = w1_;
    g0_ = (_e255 + _e256);
    let _e259 = w2_;
    let _e260 = w3_;
    g1_ = (_e259 + _e260);
    let _e263 = i;
    let _e267 = w1_;
    let _e268 = g0_;
    let _e271 = sz;
    h0_ = (((_e263 - vec2(0.5f)) + (_e267 / _e268)) / _e271);
    let _e274 = i;
    let _e278 = w3_;
    let _e279 = g1_;
    let _e282 = sz;
    h1_ = (((_e274 + vec2(1.5f)) + (_e278 / _e279)) / _e282);
    let _e285 = g0_;
    let _e287 = g0_;
    let _e289 = h0_;
    let _e291 = textureSampleLevel(tCloudMapTexture, tCloudMapSampler, _e289, 0f);
    let _e294 = g1_;
    let _e296 = h1_;
    let _e298 = h0_;
    let _e302 = textureSampleLevel(tCloudMapTexture, tCloudMapSampler, vec2<f32>(_e296.x, _e298.y), 0f);
    let _e307 = g1_;
    let _e309 = g0_;
    let _e311 = h0_;
    let _e313 = h1_;
    let _e317 = textureSampleLevel(tCloudMapTexture, tCloudMapSampler, vec2<f32>(_e311.x, _e313.y), 0f);
    let _e320 = g1_;
    let _e322 = h1_;
    let _e324 = textureSampleLevel(tCloudMapTexture, tCloudMapSampler, _e322, 0f);
    return ((_e285.y * ((_e287.x * _e291.xyz) + (_e294.x * _e302.xyz))) + (_e307.y * ((_e309.x * _e317.xyz) + (_e320.x * _e324.xyz))));
}

fn cloudClimate(dirF_4: vec3<f32>) -> f32 {
    var dirF_5: vec3<f32>;
    var lat: f32;
    var cm: vec3<f32>;

    dirF_5 = dirF_4;
    let _e175 = dirF_5;
    lat = asin(clamp(_e175.y, -1f, 1f));
    let _e183 = global.uCloudMapMean;
    if (_e183 <= 0f) {
        let _e187 = lat;
        return (0.12f * cos((abs(_e187) * 6f)));
    }
    let _e193 = dirF_5;
    let _e195 = dirF_5;
    let _e202 = lat;
    let _e208 = cloudMapSmooth(vec2<f32>(((atan2(_e193.z, _e195.x) / 6.2832f) + 0.5f), ((_e202 / 3.14159f) + 0.5f)));
    cm = _e208;
    let _e210 = cm;
    let _e212 = cm;
    let _e216 = global.uCloudYear;
    let _e220 = cm;
    let _e224 = global.uCloudYear;
    let _e228 = global.uCloudMapMean;
    return ((((_e210.x + ((_e212.y - 0.5f) * _e216.x)) + ((_e220.z - 0.5f) * _e224.y)) - _e228) * 0.8f);
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
    let _e181 = global.uRadius;
    L0_ = (_e181 * 1f);
    let _e185 = global.uRadius;
    L1_ = (_e185 * 0.236f);
    let _e189 = foot_3;
    let _e190 = L0_;
    let _e191 = cloudFade(_e189, _e190);
    f0_ = _e191;
    let _e193 = foot_3;
    let _e194 = L1_;
    let _e195 = cloudFade(_e193, _e194);
    f1_ = _e195;
    let _e197 = q_1;
    qz = (_e197 * vec3<f32>(0.5f, 1f, 0.5f));
    let _e204 = f0_;
    if (_e204 > 0.999f) {
        local_2 = 0.682f;
    } else {
        let _e208 = qz;
        let _e209 = L0_;
        let _e213 = textureSampleLevel(tNoiseTexture, tNoiseSampler, (_e208 / vec3(_e209)), 0f);
        let _e216 = f0_;
        local_2 = mix(_e213.x, 0.682f, _e216);
    }
    let _e219 = local_2;
    a = _e219;
    let _e221 = f1_;
    if (_e221 > 0.999f) {
        local_3 = 0.682f;
    } else {
        let _e225 = qz;
        let _e226 = L1_;
        let _e233 = textureSampleLevel(tNoiseTexture, tNoiseSampler, ((_e225 / vec3(_e226)) + vec3(0.5f)), 0f);
        let _e236 = f1_;
        local_3 = mix(_e233.x, 0.682f, _e236);
    }
    let _e239 = local_3;
    b = _e239;
    let _e242 = f0_;
    let _e245 = f1_;
    spread = length(vec2<f32>((0.124f * _e242), (0.083f * _e245)));
    let _e251 = bias_1;
    let _e253 = spread;
    let _e256 = bias_1;
    let _e258 = spread;
    let _e260 = a;
    let _e263 = b;
    let _e267 = cloudN(((_e260 * 0.6f) + (_e263 * 0.4f)));
    let _e268 = clim_1;
    return smoothstep(((0.6f - _e251) - _e253), ((0.8f - _e256) + _e258), (_e267 + _e268));
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
    let _e177 = global.uCloudClock;
    T = _e177.z;
    let _e180 = T;
    if (_e180 <= 0f) {
        {
            (*gA) = vec3<f32>(1f, 0f, 0f);
            (*gB) = vec3(0f);
            return;
        }
    }
    let _e190 = dirF_7;
    let _e194 = dirF_7;
    let _e199 = dirF_7;
    let _e205 = dirF_7;
    let _e209 = dirF_7;
    let _e214 = dirF_7;
    ph = ((((1.1f * _e190.x) + (0.7f * _e194.z)) - (0.5f * _e199.y)) + (0.35f * sin((((2.3f * _e205.y) + (1.7f * _e209.x)) - (0.9f * _e214.z)))));
    let _e222 = global.uCloudClock;
    let _e224 = T;
    let _e226 = ph;
    s = (((_e222.x / _e224) + _e226) + 4f);
    let _e231 = s;
    a_1 = floor(_e231);
    let _e234 = s;
    let _e235 = a_1;
    fa = (_e234 - _e235);
    let _e238 = s;
    b_1 = floor((_e238 + 0.5f));
    let _e243 = s;
    let _e246 = b_1;
    fb = ((_e243 + 0.5f) - _e246);
    let _e250 = dirF_7;
    let _e260 = dirF_7;
    let _e272 = dirF_7;
    j = (0.065f * ((sin((dot(_e250, vec3<f32>(5.1f, 3.7f, -4.3f)) + 1.3f)) + sin((dot(_e260, vec3<f32>(-3.9f, 7.3f, 6.1f)) + 0.4f))) + (0.6f * sin((dot(_e272, vec3<f32>(11.3f, -8.9f, 7.7f)) + 2.1f)))));
    let _e286 = s;
    let _e287 = j;
    fj = fract((_e286 + _e287));
    let _e295 = fj;
    wa = smoothstep(0.4f, 0.6f, (1f - abs(((2f * _e295) - 1f))));
    let _e303 = wa;
    let _e304 = fa;
    let _e307 = T;
    let _e310 = global.uCloudClock;
    let _e312 = a_1;
    (*gA) = vec3<f32>(_e303, ((_e304 - 0.5f) * _e307), (2f * (_e310.y + _e312)));
    let _e317 = wa;
    let _e319 = fb;
    let _e322 = T;
    let _e325 = global.uCloudClock;
    let _e327 = b_1;
    (*gB) = vec3<f32>((1f - _e317), ((_e319 - 0.5f) * _e322), ((2f * (_e325.y + _e327)) + 1f));
    return;
}

fn cloudGenOff(idx: f32) -> vec3<f32> {
    var idx_1: f32;
    var h: u32;

    idx_1 = idx;
    let _e175 = idx_1;
    h = (u32(_e175) * 2654435761u);
    let _e180 = h;
    let _e181 = h;
    h = (_e180 ^ (_e181 >> 15u));
    let _e185 = h;
    h = (_e185 * 2246822519u);
    let _e188 = h;
    let _e189 = h;
    h = (_e188 ^ (_e189 >> 13u));
    let _e193 = h;
    let _e197 = h;
    let _e203 = h;
    return (((vec3<f32>(f32((_e193 & 1023u)), f32(((_e197 >> 10u) & 1023u)), f32(((_e203 >> 20u) & 1023u))) / vec3(1024f)) - vec3(0.5f)) * 400000f);
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
    let _e179 = dirF_9;
    lat_1 = asin(clamp(_e179.y, -1f, 1f));
    let _e187 = global.uCloudWind;
    let _e189 = lat_1;
    let _e190 = global.uCloudWind;
    let _e195 = global.uCloudWind;
    let _e201 = global.uCloudWind;
    let _e203 = lat_1;
    let _e205 = lat_1;
    U = (_e187.x * (sin((((_e189 * _e190.y) * 2f) + (_e195.z * 6.2832f))) + (_e201.w * exp(((-(_e203) * _e205) * 40f)))));
    let _e214 = dirF_9;
    let _e218 = dirF_9;
    east = normalize((vec3<f32>(-(_e214.z), 0f, _e218.x) + vec3<f32>(0.000001f, 0f, 0f)));
    let _e228 = pf_1;
    let _e229 = east;
    let _e230 = U;
    let _e232 = g_1;
    let _e236 = g_1;
    let _e238 = cloudGenOff(_e236.z);
    return ((_e228 + ((_e229 * _e230) * _e232.y)) + _e238);
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
    let _e183 = dirF_11;
    cloudGens(_e183, (&gA_1), (&gB_1));
    let _e190 = dirF_11;
    let _e191 = cloudClimate(_e190);
    clim_2 = _e191;
    let _e193 = gA_1;
    if (_e193.x > 0.005f) {
        let _e197 = c;
        let _e198 = gA_1;
        let _e200 = pf_3;
        let _e201 = dirF_11;
        let _e202 = gA_1;
        let _e203 = cloudAdvect(_e200, _e201, _e202);
        let _e204 = foot_5;
        let _e205 = bias_3;
        let _e206 = clim_2;
        let _e207 = cloudCoverC(_e203, _e204, _e205, _e206);
        c = (_e197 + (_e198.x * _e207));
    }
    let _e210 = gB_1;
    if (_e210.x > 0.005f) {
        let _e214 = c;
        let _e215 = gB_1;
        let _e217 = pf_3;
        let _e218 = dirF_11;
        let _e219 = gB_1;
        let _e220 = cloudAdvect(_e217, _e218, _e219);
        let _e221 = foot_5;
        let _e222 = bias_3;
        let _e223 = clim_2;
        let _e224 = cloudCoverC(_e220, _e221, _e222, _e223);
        c = (_e214 + (_e215.x * _e224));
    }
    let _e227 = c;
    return _e227;
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
    let _e175 = global.uRing;
    if (_e175.z < 0.5f) {
        return 1f;
    }
    let _e180 = global.uToFixed;
    let _e181 = rel_1;
    pF = (_e180 * _e181);
    let _e184 = global.uToFixed;
    let _e185 = global.uSunDir;
    sF = (_e184 * _e185);
    let _e188 = pF;
    let _e190 = sF;
    let _e195 = sF;
    if (((_e188.y * _e190.y) >= 0f) || (abs(_e195.y) < 0.0001f)) {
        return 1f;
    }
    let _e202 = pF;
    let _e203 = sF;
    let _e204 = pF;
    let _e206 = sF;
    q_2 = (_e202 - (_e203 * (_e204.y / _e206.y)));
    let _e212 = q_2;
    let _e215 = global.uRing;
    let _e218 = global.uRing;
    let _e220 = global.uRing;
    x = ((length(_e212.xz) - _e215.x) / (_e218.y - _e220.x));
    let _e225 = x;
    let _e228 = x;
    if ((_e225 <= 0f) || (_e228 >= 1f)) {
        return 1f;
    }
    let _e233 = x;
    f_2 = clamp(((_e233 * 32f) - 0.5f), 0f, 31f);
    let _e242 = f_2;
    i_1 = i32(floor(_e242));
    let _e246 = i_1;
    j_1 = min((_e246 + 1i), 31i);
    let _e252 = i_1;
    let _e254 = i_1;
    let _e259 = i_1;
    let _e264 = global.uRingTau[(_e259 / 4i)][(_e252 - (4i * (_e254 / 4i)))];
    let _e265 = j_1;
    let _e267 = j_1;
    let _e272 = j_1;
    let _e277 = global.uRingTau[(_e272 / 4i)][(_e265 - (4i * (_e267 / 4i)))];
    let _e278 = f_2;
    let _e279 = f_2;
    tau = mix(_e264, _e277, (_e278 - floor(_e279)));
    let _e284 = tau;
    let _e286 = sF;
    return exp((-(_e284) / abs(_e286.y)));
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
    let _e188 = rel_3;
    let _e189 = ringShadow(_e188);
    ring = _e189;
    let _e191 = global.uCloudOn;
    if (_e191 < 0.5f) {
        let _e194 = muS_1;
        if (_e194 > -0.05f) {
            let _e198 = ring;
            local_4 = _e198;
        } else {
            local_4 = 1f;
        }
        let _e201 = local_4;
        return _e201;
    }
    let _e202 = muS_1;
    mu_8 = max(_e202, 0.05f);
    let _e220 = global.uCSOn;
    if (_e220 > 0.5f) {
        {
            let _e223 = global.uToFixed;
            let _e224 = rel_3;
            pf_4 = (_e223 * _e224);
            let _e227 = pf_4;
            let _e228 = r_7;
            upF = (_e227 / vec3(_e228));
            let _e232 = global.uToFixed;
            let _e233 = global.uSunDir;
            sF_1 = (_e232 * _e233);
            let _e236 = pf_4;
            let _e237 = global.uCSOrigin;
            let _e239 = sF_1;
            let _e240 = upF;
            let _e241 = sF_1;
            let _e242 = upF;
            let _e246 = r_7;
            let _e247 = global.uRadius;
            let _e250 = sF_1;
            let _e251 = upF;
            d_1 = ((_e236 - _e237) - (((_e239 - (_e240 * dot(_e241, _e242))) * (_e246 - _e247)) / vec3(max(dot(_e250, _e251), 0.1f))));
            let _e259 = d_1;
            let _e260 = global.uCSE;
            let _e262 = d_1;
            let _e263 = global.uCSN;
            let _e266 = global.uCSInvL;
            uv_4 = ((vec2<f32>(dot(_e259, _e260), dot(_e262, _e263)) * _e266) + vec2(0.5f));
            let _e274 = uv_4;
            let _e277 = uv_4;
            let _e281 = uv_4;
            let _e284 = uv_4;
            w = smoothstep(0f, 0.08f, min(min(_e274.x, (1f - _e277.x)), min(_e281.y, (1f - _e284.y))));
            let _e290 = w;
            if (_e290 > 0f) {
                {
                    let _e293 = uv_4;
                    let _e295 = textureSampleLevel(tCloudShadowTexture, tCloudShadowSampler, _e293, 0f);
                    m0_ = _e295;
                    let _e296 = uv_4;
                    let _e297 = global.uCSLod;
                    let _e298 = textureSampleLevel(tCloudShadowTexture, tCloudShadowSampler, _e296, _e297);
                    m1_ = _e298;
                }
            }
        }
    }
    let _e299 = global.uCloud;
    let _e301 = r_7;
    let _e302 = global.uRadius;
    hc = (_e299.x - (_e301 - _e302));
    let _e306 = hc;
    let _e309 = w;
    if ((_e306 > 0f) && (_e309 < 1f)) {
        {
            let _e313 = global.uToFixed;
            let _e314 = rel_3;
            let _e315 = global.uSunDir;
            let _e316 = hc;
            let _e318 = muS_1;
            ds = normalize((_e313 * normalize((_e314 + ((_e315 * _e316) / vec3(max(_e318, 0.08f)))))));
            let _e328 = muS_1;
            if (_e328 > -0.05f) {
                let _e332 = ds;
                let _e333 = global.uRadius;
                let _e335 = ds;
                let _e336 = foot_7;
                let _e337 = global.uCloud;
                let _e339 = cloudBias(_e337.z);
                let _e340 = cloudCoverG((_e332 * _e333), _e335, _e336, _e339);
                let _e341 = global.uCloudOpacity;
                local_5 = (_e340 * _e341);
            } else {
                local_5 = 0f;
            }
            let _e345 = local_5;
            cs = _e345;
            let _e347 = global.uToFixed;
            let _e348 = rel_3;
            dz = normalize((_e347 * _e348));
            let _e352 = dz;
            let _e353 = global.uRadius;
            let _e355 = dz;
            let _e356 = foot_7;
            let _e358 = hc;
            let _e361 = global.uCloud;
            let _e363 = cloudBias(_e361.z);
            let _e364 = cloudCoverG((_e352 * _e353), _e355, max(_e356, (3.5f * _e358)), _e363);
            let _e365 = global.uCloudOpacity;
            cz = (_e364 * _e365);
            let _e369 = cs;
            let _e371 = cs;
            let _e372 = global.uCloudTau;
            let _e374 = mu_8;
            Tdir = ((1f - _e369) + (_e371 * exp((-(_e372) / _e374))));
            let _e380 = cz;
            let _e382 = cz;
            let _e385 = global.uCloudTau;
            Ttot = ((1f - _e380) + (_e382 / (1f + (0.1125f * _e385))));
            let _e391 = cz;
            let _e393 = cz;
            let _e394 = global.uCloudTau;
            let _e396 = mu_8;
            Dup = ((1f - _e391) + (_e393 * exp((-(_e394) / _e396))));
        }
    }
    let _e401 = Tdir;
    let _e402 = m0_;
    let _e404 = w;
    Tdir = mix(_e401, _e402.x, _e404);
    let _e406 = Ttot;
    let _e407 = m1_;
    let _e409 = w;
    Ttot = mix(_e406, _e407.y, _e409);
    let _e411 = Dup;
    let _e412 = m1_;
    let _e414 = w;
    Dup = mix(_e411, _e412.z, _e414);
    let _e416 = Dup;
    cloudDirZ = _e416;
    let _e417 = Ttot;
    cloudTotZ = _e417;
    let _e418 = (*skyE);
    let _e419 = Ttot;
    let _e421 = sunAbove_1;
    let _e422 = muS_1;
    let _e426 = Ttot;
    let _e427 = Dup;
    (*skyE) = ((_e418 * _e419) + ((_e421 * max(_e422, 0f)) * max((_e426 - _e427), 0f)));
    let _e433 = muS_1;
    if (_e433 > -0.05f) {
        let _e437 = Tdir;
        let _e438 = ring;
        local_6 = (_e437 * _e438);
    } else {
        local_6 = 1f;
    }
    let _e442 = local_6;
    return _e442;
}

fn blackbodyGlow(T_1: f32) -> vec3<f32> {
    var T_2: f32;
    var g_2: f32;

    T_2 = T_1;
    let _e177 = T_2;
    if (_e177 < 650f) {
        return vec3(0f);
    }
    let _e185 = T_2;
    g_2 = max(0f, (0.0287f + (0.000237f * (_e185 - 1000f))));
    let _e193 = g_2;
    let _e199 = T_2;
    let _e205 = g_2;
    return (vec3<f32>(1f, _e193, 0f) * ((600000f * exp((-24060f / _e199))) / (0.2126f + (0.7152f * _e205))));
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
    let _e180 = d_3;
    a_2 = abs(_e180);
    let _e183 = a_2;
    let _e185 = a_2;
    let _e188 = a_2;
    let _e190 = a_2;
    if ((_e183.x >= _e185.y) && (_e188.x >= _e190.z)) {
        let _e194 = d_3;
        if (_e194.x >= 0f) {
            local_7 = 0i;
        } else {
            local_7 = 1i;
        }
        let _e201 = local_7;
        local_11 = _e201;
    } else {
        let _e202 = a_2;
        let _e204 = a_2;
        if (_e202.y >= _e204.z) {
            let _e207 = d_3;
            if (_e207.y >= 0f) {
                local_8 = 2i;
            } else {
                local_8 = 3i;
            }
            let _e214 = local_8;
            local_10 = _e214;
        } else {
            let _e215 = d_3;
            if (_e215.z >= 0f) {
                local_9 = 4i;
            } else {
                local_9 = 5i;
            }
            let _e222 = local_9;
            local_10 = _e222;
        }
        let _e224 = local_10;
        local_11 = _e224;
    }
    let _e226 = local_11;
    f_3 = _e226;
    let _e228 = d_3;
    let _e229 = f_3;
    let _e233 = local_12[_e229];
    dn = dot(_e228, _e233);
    let _e236 = d_3;
    let _e237 = f_3;
    let _e241 = local_13[_e237];
    let _e243 = dn;
    let _e246 = d_3;
    let _e247 = f_3;
    let _e251 = local_14[_e247];
    let _e253 = dn;
    uv_5 = (((vec2<f32>(atan((dot(_e236, _e241) / _e243)), atan((dot(_e246, _e251) / _e253))) / vec2(0.785398f)) * 0.5f) + vec2(0.5f));
    let _e266 = uv_5;
    let _e267 = f_3;
    let _e271 = vec3<f32>(_e266.x, _e266.y, f32(_e267));
    let _e276 = textureSampleLevel(tHeightCubeTexture, tHeightCubeSampler, _e271.xy, i32(_e271.z), 0f);
    return _e276.x;
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
    let _e186 = global.uHeightCube;
    let _e190 = up_1;
    let _e191 = sF_3;
    if ((_e186.x < 0.5f) || (dot(_e190, _e191) < -0.2f)) {
        return 1f;
    }
    let _e198 = global.uHeightCube;
    texel = _e198.w;
    let _e201 = R_1;
    let _e202 = global.uHeightCube;
    top = (_e201 + _e202.z);
    let _e206 = pF_2;
    r0_ = length(_e206);
    let _e210 = R_1;
    let _e211 = up_1;
    let _e212 = heightCubeAt(_e211);
    let _e214 = r0_;
    below = max(0f, ((_e210 + _e212) - _e214));
    let _e218 = pF_2;
    let _e219 = up_1;
    let _e220 = texel;
    o = (_e218 + ((_e219 * _e220) * 0.1f));
    let _e226 = texel;
    t_1 = _e226;
    loop {
        let _e232 = i_2;
        if !((_e232 < 28i)) {
            break;
        }
        {
            let _e239 = o;
            let _e240 = sF_3;
            let _e241 = t_1;
            qp = (_e239 + (_e240 * _e241));
            let _e245 = qp;
            rq = length(_e245);
            let _e248 = rq;
            let _e249 = top;
            if (_e248 > _e249) {
                break;
            }
            let _e251 = rq;
            let _e252 = R_1;
            let _e253 = qp;
            let _e254 = rq;
            let _e257 = heightCubeAt((_e253 / vec3(_e254)));
            let _e260 = below;
            let _e261 = t_1;
            let _e264 = texel;
            d_4 = ((_e251 - (_e252 + _e257)) + (_e260 * exp((-(_e261) / (3f * _e264)))));
            let _e271 = sh;
            let _e272 = d_4;
            let _e273 = t_1;
            sh = min(_e271, clamp(((_e272 / (_e273 * 0.035f)) + 0.5f), 0f, 1f));
            let _e283 = sh;
            if (_e283 <= 0f) {
                break;
            }
            let _e286 = t_1;
            t_1 = (_e286 * 1.35f);
        }
        continuing {
            let _e236 = i_2;
            i_2 = (_e236 + 1i);
        }
    }
    let _e289 = sh;
    return _e289;
}

fn colourCubeK(dist: f32) -> f32 {
    var dist_1: f32;

    dist_1 = dist;
    let _e180 = global.uColourCube;
    let _e183 = global.uColourCube;
    let _e187 = global.uColourCube;
    let _e190 = dist_1;
    return (_e180.x * smoothstep((30f * _e183.z), (60f * _e187.z), _e190));
}

fn colourCubeShore(a_3: f32) -> f32 {
    var a_4: f32;

    a_4 = a_3;
    let _e180 = a_4;
    let _e187 = global.uColourCube;
    return ((((_e180 * 255f) - 128f) / 127f) * _e187.w);
}

fn colourCubeShoreV(a_5: f32) -> f32 {
    var a_6: f32;

    a_6 = a_5;
    let _e180 = a_6;
    let _e181 = colourCubeShore(_e180);
    return clamp((_e181 / 4f), -1f, 1f);
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
    let _e180 = d_6;
    a_7 = abs(_e180);
    let _e187 = a_7;
    let _e189 = a_7;
    let _e192 = a_7;
    let _e194 = a_7;
    if ((_e187.x >= _e189.y) && (_e192.x >= _e194.z)) {
        {
            let _e198 = d_6;
            if (_e198.x >= 0f) {
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
        let _e226 = a_7;
        let _e228 = a_7;
        if (_e226.y >= _e228.z) {
            {
                U_1 = vec3<f32>(1f, 0f, 0f);
                let _e235 = d_6;
                if (_e235.y >= 0f) {
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
                let _e263 = d_6;
                if (_e263.z >= 0f) {
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
    let _e287 = d_6;
    let _e288 = N;
    dn_1 = dot(_e287, _e288);
    let _e291 = d_6;
    let _e292 = U_1;
    let _e294 = dn_1;
    let _e297 = d_6;
    let _e298 = V;
    let _e300 = dn_1;
    uv_6 = (((vec2<f32>(atan((dot(_e291, _e292) / _e294)), atan((dot(_e297, _e298) / _e300))) / vec2(0.7853982f)) * 0.5f) + vec2(0.5f));
    let _e314 = global.uColourCube;
    h_1 = vec2((0.5f / max(_e314.y, 1f)));
    let _e321 = uv_6;
    let _e322 = h_1;
    let _e324 = h_1;
    let _e327 = clamp(_e321, _e322, (vec2(1f) - _e324));
    let _e328 = f_4;
    let _e331 = vec3<f32>(_e327.x, _e327.y, _e328);
    let _e336 = textureSampleLevel(tColourCubeTexture, tColourCubeSampler, _e331.xy, i32(_e331.z), 0f);
    return _e336;
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
    var d_7: f32;
    var sz_1: vec2<i32>;
    var st_1: vec2<f32>;
    var fr: vec2<f32>;
    var p0_: vec2<i32>;
    var cmp: array<f32, 16>;
    var j_2: i32 = 0i;
    var i_3: i32;
    var local_15: f32;
    var lit: f32 = 0f;
    var j_3: i32 = 0i;
    var i_4: i32;

    org_1 = org;
    n_5 = n_4;
    VP_1 = VP;
    L_3 = L_2;
    wp_1 = wp;
    bias_5 = bias_4;
    let _e190 = VP_1;
    let _e191 = wp_1;
    c_1 = (_e190 * vec4<f32>(_e191.x, _e191.y, _e191.z, 1f));
    let _e199 = c_1;
    let _e201 = c_1;
    uv_7 = (((_e199.xy / vec2(_e201.w)) * 0.5f) + vec2(0.5f));
    let _e211 = uv_7;
    let _e216 = uv_7;
    if (any((_e211 < vec2(0f))) || any((_e216 > vec2(1f)))) {
        return 1f;
    }
    let _e223 = L_3;
    let _e225 = wp_1;
    let _e227 = global.uSunShadowDir;
    let _e229 = bias_5;
    d_7 = (dot((_e223.xyz - _e225), _e227) - _e229);
    let _e232 = n_5;
    sz_1 = vec2(_e232);
    let _e235 = uv_7;
    let _e236 = sz_1;
    st_1 = ((_e235 * vec2<f32>(_e236)) - vec2(0.5f));
    let _e243 = st_1;
    fr = fract(_e243);
    let _e246 = st_1;
    p0_ = vec2<i32>(floor(_e246));
    loop {
        let _e253 = j_2;
        if !((_e253 < 4i)) {
            break;
        }
        i_3 = 0i;
        loop {
            let _e262 = i_3;
            if !((_e262 < 4i)) {
                break;
            }
            let _e269 = j_2;
            let _e272 = i_3;
            let _e275 = d_7;
            let _e276 = org_1;
            let _e277 = p0_;
            let _e278 = i_3;
            let _e281 = j_2;
            let _e288 = sz_1;
            let _e295 = textureLoad(tShadowAtlasTexture, (_e276 + clamp((_e277 + vec2<i32>((_e278 - 1i), (_e281 - 1i))), vec2(0i), (_e288 - vec2(1i)))), 0i);
            if (_e275 <= _e295.x) {
                local_15 = 1f;
            } else {
                local_15 = 0f;
            }
            let _e301 = local_15;
            cmp[((_e269 * 4i) + _e272)] = _e301;
            continuing {
                let _e266 = i_3;
                i_3 = (_e266 + 1i);
            }
        }
        continuing {
            let _e257 = j_2;
            j_2 = (_e257 + 1i);
        }
    }
    loop {
        let _e306 = j_3;
        if !((_e306 < 3i)) {
            break;
        }
        i_4 = 0i;
        loop {
            let _e315 = i_4;
            if !((_e315 < 3i)) {
                break;
            }
            let _e322 = lit;
            let _e323 = j_3;
            let _e326 = i_4;
            let _e329 = cmp[((_e323 * 4i) + _e326)];
            let _e330 = j_3;
            let _e333 = i_4;
            let _e338 = cmp[(((_e330 * 4i) + _e333) + 1i)];
            let _e339 = fr;
            let _e342 = j_3;
            let _e345 = i_4;
            let _e350 = cmp[(((_e342 * 4i) + _e345) + 4i)];
            let _e351 = j_3;
            let _e354 = i_4;
            let _e359 = cmp[(((_e351 * 4i) + _e354) + 5i)];
            let _e360 = fr;
            let _e363 = fr;
            lit = (_e322 + mix(mix(_e329, _e338, _e339.x), mix(_e350, _e359, _e360.x), _e363.y));
            continuing {
                let _e319 = i_4;
                i_4 = (_e319 + 1i);
            }
        }
        continuing {
            let _e310 = j_3;
            j_3 = (_e310 + 1i);
        }
    }
    let _e367 = lit;
    return (_e367 / 9f);
}

fn sunShadowMap(wp_2: vec3<f32>, N_1: vec3<f32>) -> f32 {
    var wp_3: vec3<f32>;
    var N_2: vec3<f32>;
    var dist_2: f32;
    var ndl: f32;
    var slope: f32;
    var s1_: f32;
    var sh_1: f32;
    var s0_: f32;

    wp_3 = wp_2;
    N_2 = N_1;
    let _e182 = global.uSunShadow;
    if (_e182.x < 0.5f) {
        return 1f;
    }
    let _e187 = wp_3;
    dist_2 = length(_e187);
    let _e190 = dist_2;
    let _e191 = global.uSunShadow;
    if (_e190 > _e191.z) {
        return 1f;
    }
    let _e195 = N_2;
    let _e196 = global.uSunShadowDir;
    ndl = max(dot(_e195, _e196), 0.05f);
    let _e202 = ndl;
    let _e203 = ndl;
    let _e207 = ndl;
    slope = (sqrt((1f - (_e202 * _e203))) / _e207);
    let _e214 = global.uSunShadowVP1_;
    let _e215 = global.uSunShadowL1_;
    let _e216 = wp_3;
    let _e217 = global.uSunShadowL1_;
    let _e220 = slope;
    let _e225 = sunShadowTap(vec2<i32>(2048i, 0i), 2048i, _e214, _e215, _e216, (_e217.w * (1.5f + min(_e220, 6f))));
    s1_ = _e225;
    let _e227 = s1_;
    let _e230 = global.uSunShadow;
    let _e233 = global.uSunShadow;
    let _e235 = dist_2;
    sh_1 = mix(_e227, 1f, smoothstep((0.85f * _e230.z), _e233.z, _e235));
    let _e239 = dist_2;
    let _e240 = global.uSunShadow;
    if (_e239 < _e240.y) {
        {
            let _e247 = global.uSunShadowVP0_;
            let _e248 = global.uSunShadowL0_;
            let _e249 = wp_3;
            let _e250 = global.uSunShadowL0_;
            let _e253 = slope;
            let _e258 = sunShadowTap(vec2<i32>(0i, 0i), 2048i, _e247, _e248, _e249, (_e250.w * (1.5f + min(_e253, 6f))));
            s0_ = _e258;
            let _e260 = s0_;
            let _e261 = sh_1;
            let _e263 = global.uSunShadow;
            let _e266 = global.uSunShadow;
            let _e268 = dist_2;
            sh_1 = mix(_e260, _e261, smoothstep((0.75f * _e263.y), _e266.y, _e268));
        }
    }
    let _e271 = sh_1;
    return _e271;
}

fn windSense(upF_1: vec3<f32>) -> f32 {
    var upF_2: vec3<f32>;
    var al: f32;

    upF_2 = upF_1;
    let _e180 = upF_2;
    al = abs(asin(clamp(_e180.y, -1f, 1f)));
    let _e194 = al;
    let _e201 = al;
    return ((-1f + (2f * smoothstep(0.49f, 0.55f, _e194))) - (2f * smoothstep(1.02f, 1.08f, _e201)));
}

fn surfSea(U_2: f32, g_3: f32) -> vec4<f32> {
    var U_3: f32;
    var g_4: f32;
    var H0_: f32;
    var T_3: f32;
    var w_1: f32;

    U_3 = U_2;
    g_4 = g_3;
    let _e184 = U_3;
    let _e186 = U_3;
    let _e188 = g_4;
    H0_ = (((0.21f * _e184) * _e186) / _e188);
    let _e192 = U_3;
    let _e194 = g_4;
    T_3 = clamp(((10f * _e192) / _e194), 3f, 16f);
    let _e201 = T_3;
    w_1 = (6.2832f / _e201);
    let _e204 = H0_;
    let _e205 = T_3;
    let _e206 = w_1;
    let _e207 = g_4;
    let _e208 = T_3;
    let _e210 = T_3;
    return vec4<f32>(_e204, _e205, _e206, (((_e207 * _e208) * _e210) / 6.2832f));
}

fn surfLag(fp: vec3<f32>) -> f32 {
    var fp_1: vec3<f32>;
    var q_3: f32 = 0.001533981f;

    fp_1 = fp;
    let _e184 = fp_1;
    let _e190 = q_3;
    let _e196 = fp_1;
    let _e202 = q_3;
    return ((2f * sin(dot(_e184, (vec3<f32>(13f, 7f, -9f) * _e190)))) + (1.3f * sin((dot(_e196, (vec3<f32>(-5f, 11f, 8f) * _e202)) + 1.7f))));
}

fn surfPhase(fp_2: vec3<f32>, h_2: f32, sea: vec4<f32>, g_5: f32, t_2: f32) -> f32 {
    var fp_3: vec3<f32>;
    var h_3: f32;
    var sea_1: vec4<f32>;
    var g_6: f32;
    var t_3: f32;

    fp_3 = fp_2;
    h_3 = h_2;
    sea_1 = sea;
    g_6 = g_5;
    t_3 = t_2;
    let _e189 = sea_1;
    let _e191 = t_3;
    let _e193 = h_3;
    let _e198 = g_6;
    let _e204 = fp_3;
    let _e205 = surfLag(_e204);
    return ((_e189.z * (_e191 + ((2f * sqrt(max(_e193, 0f))) / (SURF_B0_ * sqrt(_e198))))) + _e205);
}

fn surfPhaseX(fp_4: vec3<f32>, x_1: f32, sea_2: vec4<f32>, g_7: f32, t_4: f32) -> f32 {
    var fp_5: vec3<f32>;
    var x_2: f32;
    var sea_3: vec4<f32>;
    var g_8: f32;
    var t_5: f32;

    fp_5 = fp_4;
    x_2 = x_1;
    sea_3 = sea_2;
    g_8 = g_7;
    t_5 = t_4;
    let _e190 = sea_3;
    let _e192 = t_5;
    let _e194 = x_2;
    let _e200 = g_8;
    let _e206 = fp_5;
    let _e207 = surfLag(_e206);
    return ((_e190.z * (_e192 + ((1.5f * pow(max(_e194, 0f), 0.6667f)) / sqrt((_e200 * SURF_A))))) + _e207);
}

fn surfRateX(x_3: f32, sea_4: vec4<f32>, g_9: f32) -> f32 {
    var x_4: f32;
    var sea_5: vec4<f32>;
    var g_10: f32;

    x_4 = x_3;
    sea_5 = sea_4;
    g_10 = g_9;
    let _e186 = sea_5;
    let _e188 = g_10;
    let _e190 = x_4;
    return (_e186.z / sqrt(((_e188 * SURF_A) * pow(max(_e190, 2f), 0.6667f))));
}

fn surfWave(n_6: f32) -> f32 {
    var n_7: f32;

    n_7 = n_6;
    let _e186 = n_7;
    let _e195 = n_7;
    return ((0.5f + (0.35f * (0.5f + (0.5f * sin((_e186 * 0.8976f)))))) + (0.3f * fract((sin(((_e195 * 12.9898f) + 4.1414f)) * 43758.547f))));
}

fn surfAt(h_4: f32, ph_1: f32, sea_6: vec4<f32>, fw: f32) -> vec4<f32> {
    var h_5: f32;
    var ph_2: f32;
    var sea_7: vec4<f32>;
    var fw_1: f32;
    var n_8: f32;
    var p: f32;
    var local_16: f32;
    var hw: f32;
    var hd: f32;
    var Hs: f32;
    var hb: f32;
    var H_1: f32;
    var br: f32;
    var c_2: f32;
    var eU: f32;
    var dU: f32;
    var local_17: f32;
    var back: f32;
    var local_18: f32;
    var dback: f32;
    var eB: f32;
    var dB: f32;
    var local_19: f32;
    var foam: f32;

    h_5 = h_4;
    ph_2 = ph_1;
    sea_7 = sea_6;
    fw_1 = fw;
    let _e188 = ph_2;
    n_8 = floor((_e188 / 6.2832f));
    let _e193 = ph_2;
    let _e196 = n_8;
    p = ((_e193 / 6.2832f) - _e196);
    let _e199 = sea_7;
    let _e201 = p;
    let _e203 = fw_1;
    if (_e201 > (1f - _e203)) {
        let _e206 = n_8;
        let _e209 = surfWave((_e206 + 1f));
        local_16 = _e209;
    } else {
        let _e210 = n_8;
        let _e211 = surfWave(_e210);
        local_16 = _e211;
    }
    let _e213 = local_16;
    hw = (_e199.x * _e213);
    let _e217 = sea_7;
    hd = (0.1f * _e217.w);
    let _e221 = hw;
    let _e223 = hd;
    let _e224 = h_5;
    Hs = (_e221 * max(1f, pow((_e223 / max(_e224, 0.05f)), 0.25f)));
    let _e233 = hw;
    let _e234 = hd;
    hb = pow(((_e233 * pow(_e234, 0.25f)) / 0.78f), 0.8f);
    let _e243 = Hs;
    let _e245 = h_5;
    H_1 = min(_e243, (0.78f * max(_e245, 0f)));
    let _e252 = hb;
    let _e255 = hb;
    let _e257 = h_5;
    br = smoothstep((1.25f * _e252), (0.85f * _e255), _e257);
    let _e263 = p;
    c_2 = (0.5f + (0.5f * cos((6.2832f * _e263))));
    let _e269 = H_1;
    let _e270 = c_2;
    let _e271 = c_2;
    eU = (_e269 * ((_e270 * _e271) - 0.375f));
    let _e277 = H_1;
    let _e280 = c_2;
    let _e285 = p;
    dU = ((_e277 * ((((-2f * _e280) * 0.5f) * sin((6.2832f * _e285))) * 6.2832f)) / 6.2832f);
    let _e295 = p;
    let _e297 = fw_1;
    if (_e295 < (1f - _e297)) {
        let _e301 = p;
        let _e303 = fw_1;
        local_17 = pow((1f - (_e301 / (1f - _e303))), 1.5f);
    } else {
        let _e310 = fw_1;
        let _e313 = p;
        local_17 = smoothstep((1f - _e310), 1f, _e313);
    }
    let _e316 = local_17;
    back = _e316;
    let _e318 = p;
    let _e320 = fw_1;
    if (_e318 < (1f - _e320)) {
        let _e326 = fw_1;
        let _e330 = p;
        let _e332 = fw_1;
        local_18 = ((-1.5f / (1f - _e326)) * pow(max((1f - (_e330 / (1f - _e332))), 0f), 0.5f));
    } else {
        let _e342 = p;
        let _e345 = fw_1;
        let _e349 = p;
        let _e352 = fw_1;
        let _e353 = fw_1;
        let _e355 = fw_1;
        local_18 = (((6f * ((_e342 - 1f) + _e345)) * (1f - _e349)) / ((_e352 * _e353) * _e355));
    }
    let _e359 = local_18;
    dback = _e359;
    let _e361 = H_1;
    let _e362 = back;
    eB = (_e361 * (_e362 - 0.3f));
    let _e367 = H_1;
    let _e368 = dback;
    dB = ((_e367 * _e368) / 6.2832f);
    let _e373 = br;
    let _e374 = p;
    let _e376 = fw_1;
    if (_e374 > (1f - _e376)) {
        let _e380 = fw_1;
        let _e383 = p;
        local_19 = smoothstep((1f - _e380), 1f, _e383);
    } else {
        let _e385 = p;
        local_19 = exp((-(_e385) / 0.2f));
    }
    let _e391 = local_19;
    foam = (_e373 * _e391);
    let _e394 = eU;
    let _e395 = eB;
    let _e396 = br;
    let _e398 = dU;
    let _e399 = dB;
    let _e400 = br;
    let _e402 = foam;
    let _e403 = br;
    return vec4<f32>(mix(_e394, _e395, _e396), mix(_e398, _e399, _e400), _e402, _e403);
}

fn liquidWaves(fp_6: vec3<f32>, n_9: vec3<f32>, wd: vec3<f32>, lmax: f32, river: bool, foot_8: f32, warp: vec3<f32>, grp: vec4<f32>) -> Waves {
    var fp_7: vec3<f32>;
    var n_10: vec3<f32>;
    var wd_1: vec3<f32>;
    var lmax_1: f32;
    var river_1: bool;
    var foot_9: f32;
    var warp_1: vec3<f32>;
    var grp_1: vec4<f32>;
    var W: Waves = Waves(vec3(0f), 0f, 0f, 0f, 0f);
    var rv: f32 = 0f;
    var i_5: i32 = 0i;
    var K: vec4<f32>;
    var kk: f32;
    var lam: f32;
    var fk: f32;
    var kt: vec3<f32>;
    var ktl: f32;
    var kd: vec3<f32>;
    var local_20: f32;
    var dirW: f32;
    var wt0_: f32;
    var wt: f32;
    var res: f32;
    var ph_3: f32;
    var Ke: vec3<f32>;
    var env: f32;

    fp_7 = fp_6;
    n_10 = n_9;
    wd_1 = wd;
    lmax_1 = lmax;
    river_1 = river;
    foot_9 = foot_8;
    warp_1 = warp;
    grp_1 = grp;
    loop {
        let _e208 = i_5;
        if !((_e208 < 36i)) {
            break;
        }
        {
            let _e215 = i_5;
            let _e217 = global.uWaveK[_e215];
            K = _e217;
            let _e219 = K;
            kk = length(_e219.xyz);
            let _e224 = kk;
            lam = (6.2832f / _e224);
            let _e228 = lmax_1;
            let _e231 = lmax_1;
            let _e234 = lam;
            let _e238 = global.uLiquid;
            let _e242 = global.uLiquid;
            let _e246 = lam;
            fk = ((1f - smoothstep((_e228 * 0.7f), (_e231 * 1.3f), _e234)) * (1f - smoothstep((_e238.w * 1.2f), (_e242.w * 2.2f), _e246)));
            let _e251 = fk;
            if (_e251 <= 0f) {
                continue;
            }
            let _e254 = K;
            let _e256 = n_10;
            let _e257 = K;
            let _e259 = n_10;
            kt = (_e254.xyz - (_e256 * dot(_e257.xyz, _e259)));
            let _e264 = kt;
            ktl = length(_e264);
            let _e267 = ktl;
            if (_e267 < 0.000001f) {
                continue;
            }
            let _e270 = kt;
            let _e271 = ktl;
            kd = (_e270 / vec3(_e271));
            let _e275 = river_1;
            if _e275 {
                local_20 = 1f;
            } else {
                let _e279 = kd;
                let _e280 = wd_1;
                local_20 = (0.2f + (1.2f * pow(max(dot(_e279, _e280), 0f), 2f)));
            }
            let _e289 = local_20;
            dirW = _e289;
            let _e291 = fk;
            let _e292 = dirW;
            let _e294 = ktl;
            let _e295 = kk;
            wt0_ = ((_e291 * _e292) * (_e294 / _e295));
            let _e299 = wt0_;
            let _e302 = i_5;
            let _e308 = grp_1[((_e302 / 3i) & 3i)];
            wt = (_e299 * (0.3f + (1.4f * _e308)));
            let _e314 = foot_9;
            let _e317 = foot_9;
            let _e319 = lam;
            res = smoothstep((2f * _e314), (6f * _e317), _e319);
            let _e322 = K;
            let _e324 = fp_7;
            let _e325 = warp_1;
            let _e328 = K;
            ph_3 = (dot(_e322.xyz, (_e324 + _e325)) - _e328.w);
            let _e332 = K;
            Ke = (floor(((_e332.yzx * 228.1645f) + vec3(0.5f))) * 0.001533981f);
            let _e347 = Ke;
            let _e348 = fp_7;
            let _e349 = warp_1;
            let _e353 = K;
            let _e357 = i_5;
            env = (0.6f + (0.4f * sin(((dot(_e347, (_e348 + _e349)) - (0.17f * _e353.w)) + (f32(_e357) * 1.7f)))));
            let _e367 = W;
            let _e369 = kd;
            let _e370 = wt;
            let _e371 = res;
            let _e373 = env;
            let _e375 = ph_3;
            W.g = (_e367.g + (_e369 * (((_e370 * _e371) * _e373) * cos(_e375))));
            let _e381 = W;
            let _e383 = wt;
            let _e384 = wt;
            W.var_ = (_e381.var_ + ((_e383 * _e384) * 0.22f));
            let _e390 = W;
            let _e392 = wt0_;
            let _e393 = wt0_;
            W.var0_ = (_e390.var0_ + ((_e392 * _e393) * 0.22f));
            let _e399 = W;
            let _e401 = wt;
            let _e402 = wt;
            let _e406 = res;
            W.res = (_e399.res + (((_e401 * _e402) * 0.22f) * _e406));
            let _e410 = W;
            let _e412 = wt;
            let _e413 = res;
            let _e415 = env;
            let _e417 = ph_3;
            W.crest = (_e410.crest + (((_e412 * _e413) * _e415) * sin(_e417)));
            let _e421 = rv;
            let _e422 = wt;
            let _e423 = wt;
            let _e427 = res;
            let _e429 = res;
            rv = (_e421 + ((((_e422 * _e423) * 0.22f) * _e427) * _e429));
        }
        continuing {
            let _e212 = i_5;
            i_5 = (_e212 + 1i);
        }
    }
    let _e433 = W;
    let _e435 = rv;
    W.crest = (_e433.crest / sqrt(max(_e435, 0.000000001f)));
    let _e440 = W;
    return _e440;
}

fn liqHash(c_3: vec2<f32>) -> f32 {
    var c_4: vec2<f32>;
    var q_4: vec2<u32>;
    var h_6: u32;

    c_4 = c_3;
    let _e182 = c_4;
    q_4 = vec2<u32>((vec2<i32>(_e182) + vec2(1048576i)));
    let _e189 = q_4;
    let _e193 = q_4;
    h_6 = ((_e189.x * 1597334677u) ^ (_e193.y * 3812015801u));
    let _e199 = h_6;
    h_6 = ((_e199 * 747796405u) + 2891336453u);
    let _e204 = h_6;
    let _e205 = h_6;
    h_6 = (_e204 ^ (_e205 >> 16u));
    let _e210 = h_6;
    h_6 = (_e210 * 2246822519u);
    let _e213 = h_6;
    let _e214 = h_6;
    h_6 = (_e213 ^ (_e214 >> 13u));
    let _e219 = h_6;
    return ((f32((_e219 & 7u)) * 0.7854f) + 0.3927f);
}

fn rippleNoise(p_1: vec2<f32>, per: f32) -> vec3<f32> {
    var p_2: vec2<f32>;
    var per_1: f32;
    var i_6: vec2<f32>;
    var f_5: vec2<f32>;
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

    p_2 = p_1;
    per_1 = per;
    let _e184 = p_2;
    i_6 = floor(_e184);
    let _e187 = p_2;
    let _e188 = i_6;
    f_5 = (_e187 - _e188);
    let _e191 = i_6;
    let _e194 = (_e191 + vec2(1f));
    let _e195 = per_1;
    let _e196 = vec2(_e195);
    i1_ = (_e194 - (floor((_e194 / _e196)) * _e196));
    let _e202 = i_6;
    let _e203 = per_1;
    let _e204 = vec2(_e203);
    i_6 = (_e202 - (floor((_e202 / _e204)) * _e204));
    let _e209 = f_5;
    let _e210 = f_5;
    let _e212 = f_5;
    let _e214 = f_5;
    let _e215 = f_5;
    u_1 = (((_e209 * _e210) * _e212) * ((_e214 * ((_e215 * 6f) - vec2(15f))) + vec2(10f)));
    let _e228 = f_5;
    let _e230 = f_5;
    let _e232 = f_5;
    let _e233 = f_5;
    du = (((30f * _e228) * _e230) * ((_e232 * (_e233 - vec2(2f))) + vec2(1f)));
    let _e243 = i_6;
    let _e244 = liqHash(_e243);
    ha = _e244;
    let _e246 = i1_;
    let _e248 = i_6;
    let _e251 = liqHash(vec2<f32>(_e246.x, _e248.y));
    hb_1 = _e251;
    let _e253 = i_6;
    let _e255 = i1_;
    let _e258 = liqHash(vec2<f32>(_e253.x, _e255.y));
    hc_1 = _e258;
    let _e260 = i1_;
    let _e261 = liqHash(_e260);
    hd_1 = _e261;
    let _e263 = ha;
    let _e265 = ha;
    ga = vec2<f32>(cos(_e263), sin(_e265));
    let _e269 = hb_1;
    let _e271 = hb_1;
    gb = vec2<f32>(cos(_e269), sin(_e271));
    let _e275 = hc_1;
    let _e277 = hc_1;
    gc = vec2<f32>(cos(_e275), sin(_e277));
    let _e281 = hd_1;
    let _e283 = hd_1;
    gd = vec2<f32>(cos(_e281), sin(_e283));
    let _e287 = ga;
    let _e288 = f_5;
    va = dot(_e287, _e288);
    let _e291 = gb;
    let _e292 = f_5;
    vb = dot(_e291, (_e292 - vec2<f32>(1f, 0f)));
    let _e299 = gc;
    let _e300 = f_5;
    vc = dot(_e299, (_e300 - vec2<f32>(0f, 1f)));
    let _e307 = gd;
    let _e308 = f_5;
    vd = dot(_e307, (_e308 - vec2(1f)));
    let _e314 = va;
    let _e315 = vb;
    let _e317 = vc;
    let _e319 = vd;
    k = (((_e314 - _e315) - _e317) + _e319);
    let _e322 = va;
    let _e323 = u_1;
    let _e325 = vb;
    let _e326 = va;
    let _e330 = u_1;
    let _e332 = vc;
    let _e333 = va;
    let _e337 = u_1;
    let _e339 = u_1;
    let _e342 = k;
    let _e345 = ga;
    let _e346 = u_1;
    let _e348 = gb;
    let _e349 = ga;
    let _e353 = u_1;
    let _e355 = gc;
    let _e356 = ga;
    let _e360 = u_1;
    let _e362 = u_1;
    let _e365 = ga;
    let _e366 = gb;
    let _e368 = gc;
    let _e370 = gd;
    let _e374 = du;
    let _e375 = u_1;
    let _e377 = k;
    let _e379 = vb;
    let _e380 = vc;
    let _e383 = va;
    let _e387 = ((((_e345 + (_e346.x * (_e348 - _e349))) + (_e353.y * (_e355 - _e356))) + ((_e360.x * _e362.y) * (((_e365 - _e366) - _e368) + _e370))) + (_e374 * (((_e375.yx * _e377) + vec2<f32>(_e379, _e380)) - vec2(_e383))));
    return vec3<f32>((((_e322 + (_e323.x * (_e325 - _e326))) + (_e330.y * (_e332 - _e333))) + ((_e337.x * _e339.y) * _e342)), _e387.x, _e387.y);
}

fn rippleAxis(a_8: i32, p_3: vec3<f32>, L_4: f32, o_1: f32) -> vec3<f32> {
    var a_9: i32;
    var p_4: vec3<f32>;
    var L_5: f32;
    var o_2: f32;
    var local_21: vec2<f32>;
    var local_22: vec2<f32>;
    var uv_8: vec2<f32>;
    var r_8: vec3<f32>;

    a_9 = a_8;
    p_4 = p_3;
    L_5 = L_4;
    o_2 = o_1;
    let _e188 = a_9;
    if (_e188 == 0i) {
        let _e191 = p_4;
        local_22 = _e191.zy;
    } else {
        let _e193 = a_9;
        if (_e193 == 1i) {
            let _e196 = p_4;
            local_21 = _e196.xz;
        } else {
            let _e198 = p_4;
            local_21 = _e198.xy;
        }
        let _e201 = local_21;
        local_22 = _e201;
    }
    let _e203 = local_22;
    uv_8 = _e203;
    let _e205 = uv_8;
    let _e206 = L_5;
    let _e209 = o_2;
    let _e213 = L_5;
    let _e215 = rippleNoise(((_e205 / vec2(_e206)) + vec2(_e209)), (4096f / _e213));
    r_8 = _e215;
    let _e217 = r_8;
    let _e219 = r_8;
    let _e220 = _e219.yz;
    return vec3<f32>(_e217.x, _e220.x, _e220.y);
}

fn riverRipples(fp_8: vec3<f32>, n_11: vec3<f32>, lmax_2: f32, foot_10: f32) -> Waves {
    var fp_9: vec3<f32>;
    var n_12: vec3<f32>;
    var lmax_3: f32;
    var foot_11: f32;
    var W_1: Waves = Waves(vec3(0f), 0f, 0f, 0f, 0f);
    var an: vec3<f32>;
    var local_23: i32;
    var local_24: i32;
    var ma: i32;
    var local_25: i32;
    var local_26: i32;
    var mi: i32;
    var me: i32;
    var local_27: f32;
    var local_28: f32;
    var w0_1: f32;
    var local_29: f32;
    var local_30: f32;
    var w1_1: f32;
    var bw: vec2<f32>;
    var local_31: vec2<f32>;
    var rv_1: f32 = 0f;
    var cr: f32 = 0f;
    var o_3: i32 = 0i;
    var L_6: f32;
    var fk_1: f32;
    var res_1: f32;
    var g_11: vec3<f32>;
    var v: f32;
    var k_1: i32;
    var local_32: i32;
    var a_10: i32;
    var local_33: f32;
    var bwk: f32;
    var r_9: vec3<f32>;
    var local_34: vec3<f32>;
    var local_35: vec3<f32>;

    fp_9 = fp_8;
    n_12 = n_11;
    lmax_3 = lmax_2;
    foot_11 = foot_10;
    let _e196 = n_12;
    an = abs(_e196);
    let _e199 = an;
    let _e201 = an;
    let _e204 = an;
    let _e206 = an;
    if ((_e199.x > _e201.y) && (_e204.x > _e206.z)) {
        local_24 = 0i;
    } else {
        let _e211 = an;
        let _e213 = an;
        if (_e211.y > _e213.z) {
            local_23 = 1i;
        } else {
            local_23 = 2i;
        }
        let _e219 = local_23;
        local_24 = _e219;
    }
    let _e221 = local_24;
    ma = _e221;
    let _e223 = an;
    let _e225 = an;
    let _e228 = an;
    let _e230 = an;
    if ((_e223.x < _e225.y) && (_e228.x < _e230.z)) {
        local_26 = 0i;
    } else {
        let _e235 = an;
        let _e237 = an;
        if (_e235.y < _e237.z) {
            local_25 = 1i;
        } else {
            local_25 = 2i;
        }
        let _e243 = local_25;
        local_26 = _e243;
    }
    let _e245 = local_26;
    mi = _e245;
    let _e248 = mi;
    let _e250 = ma;
    me = ((3i - _e248) - _e250);
    let _e253 = ma;
    if (_e253 == 0i) {
        let _e256 = an;
        local_28 = _e256.x;
    } else {
        let _e258 = ma;
        if (_e258 == 1i) {
            let _e261 = an;
            local_27 = _e261.y;
        } else {
            let _e263 = an;
            local_27 = _e263.z;
        }
        let _e266 = local_27;
        local_28 = _e266;
    }
    let _e268 = local_28;
    w0_1 = _e268;
    let _e270 = me;
    if (_e270 == 0i) {
        let _e273 = an;
        local_30 = _e273.x;
    } else {
        let _e275 = me;
        if (_e275 == 1i) {
            let _e278 = an;
            local_29 = _e278.y;
        } else {
            let _e280 = an;
            local_29 = _e280.z;
        }
        let _e283 = local_29;
        local_30 = _e283;
    }
    let _e285 = local_30;
    w1_1 = _e285;
    let _e287 = w0_1;
    let _e288 = w1_1;
    bw = clamp(((vec2<f32>(_e287, _e288) - vec2(0.5773f)) / vec2(0.4227f)), vec2(0f), vec2(1f));
    let _e304 = bw;
    let _e306 = bw;
    if ((_e304.x + _e306.y) < 0.0001f) {
        local_31 = vec2<f32>(1f, 0f);
    } else {
        let _e314 = bw;
        let _e315 = bw;
        let _e317 = bw;
        local_31 = (_e314 / vec2((_e315.x + _e317.y)));
    }
    let _e323 = local_31;
    bw = _e323;
    let _e324 = bw;
    if (_e324.y < 0.02f) {
        bw = vec2<f32>(1f, 0f);
    }
    loop {
        let _e337 = o_3;
        if !((_e337 < 4i)) {
            break;
        }
        {
            let _e345 = o_3;
            L_6 = (0.25f * exp2(f32(_e345)));
            let _e351 = lmax_3;
            let _e354 = lmax_3;
            let _e357 = L_6;
            fk_1 = (1f - smoothstep((_e351 * 0.3f), (_e354 * 0.6f), _e357));
            let _e361 = fk_1;
            if (_e361 <= 0f) {
                continue;
            }
            let _e364 = foot_11;
            let _e366 = foot_11;
            let _e368 = L_6;
            res_1 = smoothstep(_e364, (3f * _e366), _e368);
            g_11 = vec3(0f);
            v = 0f;
            k_1 = 0i;
            loop {
                let _e378 = k_1;
                if !((_e378 < 2i)) {
                    break;
                }
                {
                    let _e385 = k_1;
                    if (_e385 == 0i) {
                        let _e388 = ma;
                        local_32 = _e388;
                    } else {
                        let _e389 = me;
                        local_32 = _e389;
                    }
                    let _e391 = local_32;
                    a_10 = _e391;
                    let _e393 = k_1;
                    if (_e393 == 0i) {
                        let _e396 = bw;
                        local_33 = _e396.x;
                    } else {
                        let _e398 = bw;
                        local_33 = _e398.y;
                    }
                    let _e401 = local_33;
                    bwk = _e401;
                    let _e403 = bwk;
                    if (_e403 <= 0f) {
                        continue;
                    }
                    let _e406 = a_10;
                    let _e407 = fp_9;
                    let _e408 = L_6;
                    let _e409 = o_3;
                    let _e413 = rippleAxis(_e406, _e407, _e408, (f32(_e409) * 17.31f));
                    r_9 = _e413;
                    let _e415 = g_11;
                    let _e416 = bwk;
                    let _e417 = a_10;
                    if (_e417 == 0i) {
                        let _e421 = r_9;
                        let _e423 = r_9;
                        local_35 = vec3<f32>(0f, _e421.z, _e423.y);
                    } else {
                        let _e426 = a_10;
                        if (_e426 == 1i) {
                            let _e429 = r_9;
                            let _e432 = r_9;
                            local_34 = vec3<f32>(_e429.y, 0f, _e432.z);
                        } else {
                            let _e435 = r_9;
                            let _e437 = r_9;
                            local_34 = vec3<f32>(_e435.y, _e437.z, 0f);
                        }
                        let _e442 = local_34;
                        local_35 = _e442;
                    }
                    let _e444 = local_35;
                    g_11 = (_e415 + (_e416 * _e444));
                    let _e447 = v;
                    let _e448 = bwk;
                    let _e449 = r_9;
                    v = (_e447 + (_e448 * _e449.x));
                }
                continuing {
                    let _e382 = k_1;
                    k_1 = (_e382 + 1i);
                }
            }
            let _e453 = g_11;
            let _e454 = n_12;
            let _e455 = g_11;
            let _e456 = n_12;
            g_11 = (_e453 - (_e454 * dot(_e455, _e456)));
            let _e461 = W_1;
            let _e463 = g_11;
            let _e464 = fk_1;
            let _e465 = res_1;
            W_1.g = (_e461.g + (_e463 * (_e464 * _e465)));
            let _e470 = W_1;
            let _e472 = fk_1;
            let _e473 = fk_1;
            W_1.var_ = (_e470.var_ + ((_e472 * _e473) * 0.78f));
            let _e479 = W_1;
            let _e481 = fk_1;
            let _e482 = fk_1;
            let _e486 = res_1;
            W_1.res = (_e479.res + (((_e481 * _e482) * 0.78f) * _e486));
            let _e490 = W_1;
            let _e492 = fk_1;
            let _e493 = res_1;
            let _e495 = v;
            W_1.crest = (_e490.crest + (((_e492 * _e493) * _e495) / 0.216f));
            let _e500 = rv_1;
            let _e501 = fk_1;
            let _e502 = fk_1;
            let _e504 = res_1;
            let _e506 = res_1;
            rv_1 = (_e500 + (((_e501 * _e502) * _e504) * _e506));
        }
        continuing {
            let _e341 = o_3;
            o_3 = (_e341 + 1i);
        }
    }
    let _e510 = W_1;
    W_1.var0_ = _e510.var_;
    let _e513 = W_1;
    let _e515 = rv_1;
    W_1.crest = (_e513.crest / sqrt(max(_e515, 0.000000001f)));
    let _e520 = W_1;
    return _e520;
}

fn liquidSurface(fp_10: vec3<f32>, n_13: vec3<f32>, upF_3: vec3<f32>, kind: f32, flow: f32, fetch: f32, depth: f32, foot_12: f32, wn: vec2<f32>, grp_2: vec4<f32>, fdir: vec3<f32>, fv: f32, gradH: vec3<f32>, shoreX: f32, gradX: vec3<f32>, nF: ptr<function, vec3<f32>>, rough: ptr<function, f32>, foam_1: ptr<function, f32>) {
    var fp_11: vec3<f32>;
    var n_14: vec3<f32>;
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
    var gradH_1: vec3<f32>;
    var shoreX_1: f32;
    var gradX_1: vec3<f32>;
    var al_1: f32;
    var toward: f32;
    var local_36: f32;
    var local_37: f32;
    var local_38: f32;
    var strength: f32;
    var east_1: vec3<f32>;
    var local_39: vec3<f32>;
    var wd_2: vec3<f32>;
    var river_2: bool;
    var pond: bool;
    var sea_8: bool;
    var local_40: vec3<f32>;
    var e1_: vec3<f32>;
    var e2_: vec3<f32>;
    var warp_2: vec3<f32>;
    var local_41: f32;
    var U_4: f32;
    var local_42: f32;
    var Fr: f32;
    var local_43: f32;
    var local_44: f32;
    var local_45: f32;
    var s2_: f32;
    var local_46: f32;
    var local_47: f32;
    var local_48: f32;
    var lmax_4: f32;
    var W_2: Waves;
    var fd: vec3<f32>;
    var local_49: vec3<f32>;
    var ta: f32;
    var tb: f32;
    var wa_1: f32;
    var A: Waves;
    var B: Waves;
    var sc: f32;
    var cov: f32;
    var t_6: f32;
    var z: f32;
    var rk: f32;
    var sea4_: vec4<f32>;
    var local_50: f32;
    var hb_2: f32;
    var byX: bool;
    var local_51: f32;
    var ph_4: f32;
    var Lh: f32;
    var sf: vec4<f32>;
    var local_52: vec3<f32>;
    var gph: vec3<f32>;
    var gs: vec3<f32>;
    var gl: f32;
    var fade: f32;
    var rise: f32;
    var lace: f32;
    var surf: f32;
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

    fp_11 = fp_10;
    n_14 = n_13;
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
    gradH_1 = gradH;
    shoreX_1 = shoreX;
    gradX_1 = gradX;
    let _e213 = upF_4;
    al_1 = abs(asin(clamp(_e213.y, -1f, 1f)));
    let _e222 = upF_4;
    let _e223 = windSense(_e222);
    toward = _e223;
    let _e225 = al_1;
    if (_e225 < 0.09f) {
        local_38 = 0.45f;
    } else {
        let _e229 = al_1;
        if (_e229 < 0.52f) {
            local_37 = 0.9f;
        } else {
            let _e233 = al_1;
            if (_e233 < 1.05f) {
                local_36 = 1.25f;
            } else {
                local_36 = 0.8f;
            }
            let _e239 = local_36;
            local_37 = _e239;
        }
        let _e241 = local_37;
        local_38 = _e241;
    }
    let _e243 = local_38;
    strength = _e243;
    let _e249 = upF_4;
    east_1 = cross(vec3<f32>(0f, 1f, 0f), _e249);
    let _e252 = east_1;
    if (length(_e252) > 0.0001f) {
        let _e256 = east_1;
        let _e258 = toward;
        local_39 = (normalize(_e256) * sign((_e258 + 0.001f)));
    } else {
        local_39 = vec3<f32>(1f, 0f, 0f);
    }
    let _e268 = local_39;
    wd_2 = _e268;
    let _e270 = kind_1;
    let _e273 = kind_1;
    river_2 = ((_e270 > 0.55f) && (_e273 < 0.85f));
    let _e278 = kind_1;
    pond = (_e278 > 0.85f);
    let _e282 = kind_1;
    sea_8 = (_e282 < 0.2f);
    let _e286 = east_1;
    if (length(_e286) > 0.0001f) {
        let _e290 = east_1;
        local_40 = normalize(_e290);
    } else {
        local_40 = vec3<f32>(1f, 0f, 0f);
    }
    let _e297 = local_40;
    e1_ = _e297;
    let _e299 = upF_4;
    let _e300 = e1_;
    e2_ = cross(_e299, _e300);
    let _e303 = e1_;
    let _e304 = wn_1;
    let _e307 = e2_;
    let _e308 = wn_1;
    let _e314 = global.uLiquid;
    warp_2 = ((((_e303 * _e304.x) + (_e307 * _e308.y)) * 0.12f) * _e314.w);
    let _e318 = global.uLiquid;
    let _e320 = strength;
    let _e322 = sea_8;
    if _e322 {
        local_41 = 1f;
    } else {
        let _e326 = fetch_1;
        local_41 = mix(0.3f, 1f, _e326);
    }
    let _e329 = local_41;
    U_4 = ((_e318.y * _e320) * _e329);
    let _e332 = river_2;
    if _e332 {
        let _e333 = fv_1;
        let _e334 = global.uLiquid2_;
        let _e336 = depth_1;
        local_42 = (_e333 / sqrt((_e334.x * max(_e336, 0.3f))));
    } else {
        local_42 = 0f;
    }
    let _e344 = local_42;
    Fr = _e344;
    let _e346 = sea_8;
    if _e346 {
        let _e349 = U_4;
        let _e353 = U_4;
        local_45 = ((0.003f * step(0.01f, _e349)) + (0.00512f * _e353));
    } else {
        let _e356 = pond;
        if _e356 {
            let _e359 = U_4;
            local_44 = (0.0003f + (0.0003f * _e359));
        } else {
            let _e362 = river_2;
            if _e362 {
                let _e365 = Fr;
                let _e366 = Fr;
                let _e373 = U_4;
                local_43 = ((0.0012f + (0.035f * min((_e365 * _e366), 2f))) + (0.0015f * _e373));
            } else {
                let _e378 = U_4;
                local_43 = (0.001f + (0.00512f * _e378));
            }
            let _e382 = local_43;
            local_44 = _e382;
        }
        let _e384 = local_44;
        local_45 = _e384;
    }
    let _e386 = local_45;
    s2_ = _e386;
    let _e388 = s2_;
    let _e389 = global.uLiquid;
    s2_ = (_e388 * _e389.z);
    let _e392 = sea_8;
    if _e392 {
        local_48 = 1000000000f;
    } else {
        let _e394 = river_2;
        if _e394 {
            let _e396 = fv_1;
            let _e398 = fv_1;
            let _e400 = global.uLiquid2_;
            let _e403 = depth_1;
            local_47 = clamp(((((6.2832f * _e396) * _e398) / _e400.x) + _e403), 0.6f, 8f);
        } else {
            let _e408 = pond;
            if _e408 {
                local_46 = 1f;
            } else {
                let _e412 = fetch_1;
                local_46 = (25f + (400f * _e412));
            }
            let _e416 = local_46;
            local_47 = _e416;
        }
        let _e418 = local_47;
        local_48 = _e418;
    }
    let _e420 = local_48;
    lmax_4 = _e420;
    let _e423 = fdir_1;
    let _e424 = upF_4;
    let _e425 = fdir_1;
    let _e426 = upF_4;
    fd = (_e423 - (_e424 * dot(_e425, _e426)));
    let _e431 = fd;
    if (length(_e431) > 0.05f) {
        let _e435 = fd;
        local_49 = normalize(_e435);
    } else {
        local_49 = vec3(0f);
    }
    let _e440 = local_49;
    fd = _e440;
    let _e441 = global.uTime;
    ta = fract((_e441 / 3f));
    let _e446 = global.uTime;
    tb = fract(((_e446 / 3f) + 0.5f));
    let _e455 = ta;
    wa_1 = (1f - abs(((2f * _e455) - 1f)));
    let _e462 = river_2;
    if _e462 {
        {
            let _e463 = fp_11;
            let _e464 = fd;
            let _e465 = fv_1;
            let _e469 = ta;
            let _e472 = n_14;
            let _e473 = lmax_4;
            let _e474 = foot_13;
            let _e475 = riverRipples((_e463 - (((_e464 * _e465) * 3f) * _e469)), _e472, _e473, _e474);
            A = _e475;
            let _e477 = fp_11;
            let _e478 = fd;
            let _e479 = fv_1;
            let _e483 = tb;
            let _e489 = n_14;
            let _e490 = lmax_4;
            let _e491 = foot_13;
            let _e492 = riverRipples(((_e477 - (((_e478 * _e479) * 3f) * _e483)) + vec3(0.37f)), _e489, _e490, _e491);
            B = _e492;
            let _e494 = A;
            W_2 = _e494;
            let _e496 = A;
            let _e498 = wa_1;
            let _e500 = B;
            let _e503 = wa_1;
            W_2.g = ((_e496.g * _e498) + (_e500.g * (1f - _e503)));
            let _e508 = A;
            let _e510 = wa_1;
            let _e512 = B;
            let _e515 = wa_1;
            W_2.crest = ((_e508.crest * _e510) + (_e512.crest * (1f - _e515)));
        }
    } else {
        let _e519 = fp_11;
        let _e520 = n_14;
        let _e521 = wd_2;
        let _e522 = lmax_4;
        let _e524 = foot_13;
        let _e525 = warp_2;
        let _e526 = grp_3;
        let _e527 = liquidWaves(_e519, _e520, _e521, _e522, false, _e524, _e525, _e526);
        W_2 = _e527;
    }
    let _e528 = s2_;
    let _e529 = W_2;
    sc = sqrt((_e528 / max(_e529.var0_, 0.000000001f)));
    let _e536 = n_14;
    let _e537 = W_2;
    let _e539 = sc;
    (*nF) = normalize((_e536 - (_e537.g * _e539)));
    let _e544 = W_2;
    let _e546 = W_2;
    let _e553 = sc;
    (*rough) = clamp((sqrt((2f * max((_e544.var_ - _e546.res), 0f))) * _e553), 0.02f, 0.6f);
    let _e559 = U_4;
    cov = clamp((0.00000384f * pow(_e559, 3.41f)), 0f, 0.3f);
    (*foam_1) = 0f;
    let _e568 = river_2;
    let _e570 = pond;
    let _e573 = cov;
    if ((!(_e568) && !(_e570)) && (_e573 > 0.0001f)) {
        {
            let _e579 = cov;
            t_6 = sqrt((-2f * log(_e579)));
            let _e584 = t_6;
            let _e587 = t_6;
            let _e591 = t_6;
            let _e593 = t_6;
            let _e598 = t_6;
            let _e602 = t_6;
            let _e604 = t_6;
            let _e608 = t_6;
            let _e610 = t_6;
            let _e612 = t_6;
            z = (_e584 - (((2.515517f + (0.802853f * _e587)) + ((0.010328f * _e591) * _e593)) / (((1f + (1.432788f * _e598)) + ((0.189269f * _e602) * _e604)) + (((0.001308f * _e608) * _e610) * _e612))));
            let _e618 = W_2;
            let _e620 = W_2;
            rk = (_e618.res / max(_e620.var_, 0.000000001f));
            let _e626 = cov;
            let _e627 = z;
            let _e630 = z;
            let _e633 = W_2;
            let _e636 = rk;
            (*foam_1) = (mix(_e626, smoothstep((_e627 - 0.25f), (_e630 + 0.35f), _e633.crest), _e636) * 0.9f);
        }
    }
    let _e640 = river_2;
    let _e642 = pond;
    if (!(_e640) && !(_e642)) {
        {
            let _e645 = U_4;
            let _e646 = global.uLiquid2_;
            let _e648 = surfSea(_e645, _e646.x);
            sea4_ = _e648;
            let _e651 = sea4_;
            let _e653 = sea_8;
            if _e653 {
                local_50 = 1f;
            } else {
                let _e656 = fetch_1;
                local_50 = (0.3f * _e656);
            }
            let _e659 = local_50;
            let _e660 = global.uLiquid;
            sea4_.x = (_e651.x * (_e659 * _e660.z));
            let _e664 = sea4_;
            let _e669 = sea4_;
            hb_2 = pow((((_e664.x * 1.3f) * pow((0.1f * _e669.w), 0.25f)) / 0.78f), 0.8f);
            let _e680 = depth_1;
            let _e682 = hb_2;
            let _e687 = sea4_;
            if ((_e680 < ((2f * _e682) + 0.5f)) && (_e687.x > 0.02f)) {
                {
                    let _e692 = shoreX_1;
                    byX = (_e692 >= 0f);
                    let _e696 = byX;
                    if _e696 {
                        let _e697 = fp_11;
                        let _e698 = shoreX_1;
                        let _e699 = sea4_;
                        let _e700 = global.uLiquid2_;
                        let _e702 = global.uTime;
                        let _e703 = surfPhaseX(_e697, _e698, _e699, _e700.x, _e702);
                        local_51 = _e703;
                    } else {
                        let _e704 = fp_11;
                        let _e705 = depth_1;
                        let _e706 = sea4_;
                        let _e707 = global.uLiquid2_;
                        let _e709 = global.uTime;
                        let _e710 = surfPhase(_e704, _e705, _e706, _e707.x, _e709);
                        local_51 = _e710;
                    }
                    let _e712 = local_51;
                    ph_4 = _e712;
                    let _e714 = ph_4;
                    let _e716 = grp_3;
                    let _e722 = wn_1;
                    ph_4 = (_e714 + ((1.6f * (_e716.y - 0.5f)) + (0.4f * _e722.x)));
                    let _e727 = sea4_;
                    let _e729 = global.uLiquid2_;
                    let _e731 = depth_1;
                    Lh = (_e727.y * sqrt((_e729.x * max(_e731, 0.05f))));
                    let _e738 = depth_1;
                    let _e739 = ph_4;
                    let _e740 = sea4_;
                    let _e742 = foot_13;
                    let _e744 = Lh;
                    let _e749 = surfAt(_e738, _e739, _e740, clamp(((3f * _e742) / _e744), 0.07f, 0.4f));
                    sf = _e749;
                    let _e751 = byX;
                    if _e751 {
                        let _e752 = shoreX_1;
                        let _e753 = sea4_;
                        let _e754 = global.uLiquid2_;
                        let _e756 = surfRateX(_e752, _e753, _e754.x);
                        let _e757 = gradX_1;
                        local_52 = (_e756 * _e757);
                    } else {
                        let _e759 = sea4_;
                        let _e761 = global.uLiquid2_;
                        let _e763 = depth_1;
                        let _e770 = gradH_1;
                        local_52 = ((_e759.z / (SURF_B0_ * sqrt((_e761.x * max(_e763, 0.05f))))) * _e770);
                    }
                    let _e773 = local_52;
                    gph = _e773;
                    let _e775 = gph;
                    let _e776 = sf;
                    gs = (_e775 * _e776.y);
                    let _e780 = gs;
                    gl = length(_e780);
                    let _e783 = gl;
                    if (_e783 > 0.6f) {
                        let _e786 = gs;
                        let _e788 = gl;
                        gs = (_e786 * (0.6f / _e788));
                    }
                    let _e791 = gs;
                    let _e792 = n_14;
                    let _e793 = gs;
                    let _e794 = n_14;
                    gs = (_e791 - (_e792 * dot(_e793, _e794)));
                    let _e800 = hb_2;
                    let _e803 = hb_2;
                    let _e807 = depth_1;
                    fade = (1f - smoothstep((1.5f * _e800), ((2f * _e803) + 0.5f), _e807));
                    let _e811 = (*nF);
                    let _e812 = gs;
                    let _e813 = fade;
                    (*nF) = normalize((_e811 - (_e812 * _e813)));
                    let _e819 = gradH_1;
                    rise = smoothstep(0.004f, 0.04f, length(_e819));
                    let _e825 = grp_3;
                    let _e828 = W_2;
                    let _e835 = grp_3;
                    let _e838 = grp_3;
                    lace = (smoothstep(0.15f, 0.75f, (_e825.x + (0.25f * _e828.crest))) * smoothstep(0.1f, 0.5f, (_e835.z + (0.3f * (_e838.w - 0.5f)))));
                    let _e847 = sf;
                    let _e851 = rise;
                    let _e857 = lace;
                    let _e861 = sf;
                    let _e865 = lace;
                    surf = (((_e847.z * (0.6f + (0.4f * _e851))) * (0.45f + (0.55f * _e857))) + ((_e861.w * 0.12f) * _e865));
                    let _e869 = surf;
                    let _e873 = depth_1;
                    let _e878 = lace;
                    surf = (_e869 + ((1f - smoothstep(0f, 0.12f, _e873)) * (0.3f + (0.5f * _e878))));
                    let _e883 = (*foam_1);
                    let _e884 = surf;
                    let _e888 = fade;
                    (*foam_1) = max(_e883, ((clamp(_e884, 0f, 1f) * _e888) * 0.85f));
                    let _e893 = (*rough);
                    let _e895 = sf;
                    let _e898 = fade;
                    (*rough) = max(_e893, ((0.25f * _e895.z) * _e898));
                }
            }
        }
    }
    let _e901 = river_2;
    let _e902 = fd;
    if (_e901 && (length(_e902) > 0f)) {
        {
            let _e907 = upF_4;
            let _e908 = fd;
            ac = cross(_e907, _e908);
            let _e911 = Fr;
            cov_1 = clamp(((_e911 - 0.6f) / 0.9f), 0f, 1f);
            let _e920 = cov_1;
            let _e921 = cov_1;
            cov_1 = (_e920 * _e921);
            let _e923 = cov_1;
            if (_e923 > 0f) {
                {
                    let _e926 = fp_11;
                    let _e927 = ac;
                    let _e931 = fp_11;
                    let _e932 = fd;
                    q_5 = vec2<f32>((dot(_e926, _e927) * 0.15f), (dot(_e931, _e932) * 0.04f));
                    let _e938 = q_5;
                    let _e940 = fv_1;
                    let _e943 = ta;
                    qa = (_e938 - vec2<f32>(0f, (((_e940 * 3f) * _e943) * 0.04f)));
                    let _e950 = q_5;
                    let _e956 = fv_1;
                    let _e959 = tb;
                    qb = ((_e950 + vec2<f32>(0.41f, 0f)) - vec2<f32>(0f, (((_e956 * 3f) * _e959) * 0.04f)));
                    let _e967 = qa;
                    let _e969 = textureSampleLevel(tDetailTexture, tDetailSampler, _e967, 0f);
                    let _e973 = qa;
                    let _e980 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e973 * 3.1f) + vec2(0.3f)), 0f);
                    na = ((0.65f * _e969.w) + (0.35f * _e980.x));
                    let _e986 = qb;
                    let _e988 = textureSampleLevel(tDetailTexture, tDetailSampler, _e986, 0f);
                    let _e992 = qb;
                    let _e999 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e992 * 3.1f) + vec2(0.3f)), 0f);
                    nb = ((0.65f * _e988.w) + (0.35f * _e999.x));
                    let _e1006 = cov_1;
                    th = mix(0.75f, 0.28f, _e1006);
                    let _e1009 = th;
                    let _e1012 = th;
                    let _e1015 = nb;
                    let _e1016 = na;
                    let _e1017 = wa_1;
                    let _e1020 = W_2;
                    (*foam_1) = (smoothstep((_e1009 - 0.02f), (_e1012 + 0.1f), (mix(_e1015, _e1016, _e1017) + (0.06f * _e1020.crest))) * 0.85f);
                }
            }
            let _e1027 = fp_11;
            let _e1028 = ac;
            let _e1032 = fp_11;
            let _e1033 = fd;
            q_6 = vec2<f32>((dot(_e1027, _e1028) * 0.2f), (dot(_e1032, _e1033) * 0.004f));
            let _e1040 = q_6;
            let _e1043 = fp_11;
            let _e1044 = ac;
            let _e1046 = fp_11;
            let _e1047 = fd;
            let _e1053 = textureSampleLevel(tDetailTexture, tDetailSampler, (vec2<f32>(dot(_e1043, _e1044), dot(_e1046, _e1047)) * 0.012f), 0f);
            q_6.x = (_e1040.x + (1.2f * (_e1053.x - 0.5f)));
            let _e1059 = q_6;
            let _e1061 = fv_1;
            let _e1064 = ta;
            let _e1071 = textureSampleLevel(tDetailTexture, tDetailSampler, (_e1059 - vec2<f32>(0f, (((_e1061 * 3f) * _e1064) * 0.004f))), 0f);
            sa = _e1071.w;
            let _e1074 = q_6;
            let _e1080 = fv_1;
            let _e1083 = tb;
            let _e1090 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e1074 + vec2<f32>(0.43f, 0f)) - vec2<f32>(0f, (((_e1080 * 3f) * _e1083) * 0.004f))), 0f);
            sb = _e1090.w;
            let _e1095 = sb;
            let _e1096 = sa;
            let _e1097 = wa_1;
            let _e1102 = Fr;
            streak = (smoothstep(0.7f, 0.8f, mix(_e1095, _e1096, _e1097)) * smoothstep(0.6f, 1.2f, _e1102));
            let _e1106 = (*foam_1);
            let _e1107 = streak;
            (*foam_1) = max(_e1106, (_e1107 * 0.3f));
        }
    }
    let _e1111 = (*foam_1);
    let _e1112 = global.uLiquid2_;
    (*foam_1) = (_e1111 * _e1112.y);
    return;
}

fn liquidTs(Tm: f32, kind_2: f32, flow_2: f32, upF_5: vec3<f32>) -> vec2<f32> {
    var Tm_1: f32;
    var kind_3: f32;
    var flow_3: f32;
    var upF_6: vec3<f32>;
    var Ts_1: f32;
    var yr: vec3<f32>;
    var local_53: f32;
    var local_54: f32;
    var local_55: f32;
    var follow: f32;
    var local_56: f32;
    var local_57: f32;
    var local_58: f32;
    var follow_1: f32;
    var local_59: f32;
    var local_60: f32;
    var Tf_2: f32;

    Tm_1 = Tm;
    kind_3 = kind_2;
    flow_3 = flow_2;
    upF_6 = upF_5;
    let _e189 = global.uSeason;
    if (_e189.z > 0.5f) {
        {
            let _e193 = upF_6;
            let _e194 = seasonYear(_e193);
            yr = _e194;
            let _e196 = kind_3;
            if (_e196 < 0.2f) {
                local_55 = 1f;
            } else {
                let _e200 = kind_3;
                if (_e200 < 0.55f) {
                    local_54 = 0.8f;
                } else {
                    let _e204 = kind_3;
                    if (_e204 < 0.85f) {
                        local_53 = 0.7f;
                    } else {
                        local_53 = 1f;
                    }
                    let _e210 = local_53;
                    local_54 = _e210;
                }
                let _e212 = local_54;
                local_55 = _e212;
            }
            let _e214 = local_55;
            follow = _e214;
            let _e216 = Tm_1;
            let _e217 = follow;
            let _e218 = yr;
            let _e220 = global.uSeason;
            let _e224 = yr;
            let _e226 = global.uSeason;
            Ts_1 = (_e216 + (_e217 * ((_e218.x * cos(_e220.x)) + (_e224.y * sin(_e226.x)))));
        }
    } else {
        {
            let _e233 = kind_3;
            if (_e233 < 0.2f) {
                local_58 = 0.25f;
            } else {
                let _e237 = kind_3;
                if (_e237 < 0.55f) {
                    local_57 = 0.6f;
                } else {
                    let _e241 = kind_3;
                    if (_e241 < 0.85f) {
                        local_56 = 0.45f;
                    } else {
                        local_56 = 0.8f;
                    }
                    let _e247 = local_56;
                    local_57 = _e247;
                }
                let _e249 = local_57;
                local_58 = _e249;
            }
            let _e251 = local_58;
            follow_1 = _e251;
            let _e253 = Tm_1;
            let _e255 = global.uLiquid2_;
            let _e258 = upF_6;
            let _e261 = follow_1;
            Ts_1 = (_e253 + (((70f * _e255.w) * _e258.y) * _e261));
        }
    }
    let _e264 = kind_3;
    if (_e264 < 0.2f) {
        let _e267 = global.uLiquid2_;
        local_59 = _e267.z;
    } else {
        local_59 = 0f;
    }
    let _e271 = local_59;
    let _e272 = kind_3;
    let _e275 = kind_3;
    if ((_e272 > 0.55f) && (_e275 < 0.85f)) {
        let _e280 = flow_3;
        local_60 = (3f * _e280);
    } else {
        local_60 = 0f;
    }
    let _e284 = local_60;
    Tf_2 = (_e271 - _e284);
    let _e287 = Ts_1;
    let _e288 = Tf_2;
    return vec2<f32>(_e287, _e288);
}

fn seaIceCover(ice: f32, nA: f32, nR: f32) -> f32 {
    var ice_1: f32;
    var nA_1: f32;
    var nR_1: f32;

    ice_1 = ice;
    nA_1 = nA;
    nR_1 = nR;
    let _e188 = ice_1;
    let _e189 = nA_1;
    let _e195 = nR_1;
    let _e204 = ice_1;
    return (smoothstep(0.35f, 0.75f, ((_e188 + ((_e189 - 0.5f) * 0.9f)) + ((_e195 - 0.5f) * 0.35f))) * smoothstep(0f, 0.15f, _e204));
}

fn floeHash(x_5: u32, y: u32, z_1: u32, s_1: u32) -> u32 {
    var x_6: u32;
    var y_1: u32;
    var z_2: u32;
    var s_2: u32;
    var h_7: u32;

    x_6 = x_5;
    y_1 = y;
    z_2 = z_1;
    s_2 = s_1;
    let _e188 = x_6;
    let _e191 = y_1;
    let _e195 = z_2;
    let _e199 = s_2;
    h_7 = ((((_e188 * 2376512323u) ^ (_e191 * 3625334849u)) ^ (_e195 * 3407524639u)) ^ (_e199 * 374761393u));
    let _e204 = h_7;
    let _e205 = h_7;
    h_7 = (_e204 ^ (_e205 >> 15u));
    let _e209 = h_7;
    h_7 = (_e209 * 739982445u);
    let _e212 = h_7;
    let _e213 = h_7;
    h_7 = (_e212 ^ (_e213 >> 12u));
    let _e217 = h_7;
    h_7 = (_e217 * 695872825u);
    let _e220 = h_7;
    let _e221 = h_7;
    h_7 = (_e220 ^ (_e221 >> 15u));
    let _e225 = h_7;
    return _e225;
}

fn tri0_(p_5: vec3<f32>, w_2: vec3<f32>, period: f32) -> vec4<f32> {
    var p_6: vec3<f32>;
    var w_3: vec3<f32>;
    var period_1: f32;
    var a_11: vec4<f32>;
    var b_2: vec4<f32>;
    var c_5: vec4<f32>;

    p_6 = p_5;
    w_3 = w_2;
    period_1 = period;
    let _e187 = p_6;
    let _e189 = period_1;
    let _e193 = textureSampleLevel(tDetailTexture, tDetailSampler, (_e187.yz / vec2(_e189)), 0f);
    a_11 = _e193;
    let _e195 = p_6;
    let _e197 = period_1;
    let _e204 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e195.zx / vec2(_e197)) + vec2(0.37f)), 0f);
    b_2 = _e204;
    let _e206 = p_6;
    let _e208 = period_1;
    let _e215 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e206.xy / vec2(_e208)) + vec2(0.71f)), 0f);
    c_5 = _e215;
    let _e217 = a_11;
    let _e218 = w_3;
    let _e221 = b_2;
    let _e222 = w_3;
    let _e226 = c_5;
    let _e227 = w_3;
    return (((_e217 * _e218.x) + (_e221 * _e222.y)) + (_e226 * _e227.z));
}

fn tri(p_7: vec3<f32>, w_4: vec3<f32>, period_2: f32) -> vec4<f32> {
    var p_8: vec3<f32>;
    var w_5: vec3<f32>;
    var period_3: f32;
    var a_12: vec4<f32>;
    var b_3: vec4<f32>;
    var c_6: vec4<f32>;

    p_8 = p_7;
    w_5 = w_4;
    period_3 = period_2;
    let _e187 = p_8;
    let _e189 = period_3;
    let _e193 = textureSampleLevel(tDetailTexture, tDetailSampler, (_e187.yz / vec2(_e189)), 0f);
    a_12 = _e193;
    let _e195 = p_8;
    let _e197 = period_3;
    let _e204 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e195.zx / vec2(_e197)) + vec2(0.37f)), 0f);
    b_3 = _e204;
    let _e206 = p_8;
    let _e208 = period_3;
    let _e215 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e206.xy / vec2(_e208)) + vec2(0.71f)), 0f);
    c_6 = _e215;
    let _e217 = a_12;
    let _e218 = w_5;
    let _e221 = b_3;
    let _e222 = w_5;
    let _e226 = c_6;
    let _e227 = w_5;
    return (((_e217 * _e218.x) + (_e221 * _e222.y)) + (_e226 * _e227.z));
}

fn leadIce(lid: u32, frz: f32, pDay: f32) -> vec2<f32> {
    var lid_1: u32;
    var frz_1: f32;
    var pDay_1: f32;
    var age: f32;
    var local_61: f32;
    var h_8: f32;

    lid_1 = lid;
    frz_1 = frz;
    pDay_1 = pDay;
    let _e188 = lid_1;
    age = (-2f * log(((f32((_e188 & 65535u)) + 0.5f) / 65536f)));
    let _e199 = frz_1;
    if (_e199 > 0f) {
        let _e203 = frz_1;
        let _e204 = age;
        local_61 = (1.33f * pow((_e203 * _e204), 0.58f));
    } else {
        local_61 = 0f;
    }
    let _e211 = local_61;
    h_8 = _e211;
    let _e213 = h_8;
    let _e215 = pDay_1;
    let _e217 = age;
    let _e225 = h_8;
    return vec2<f32>(_e213, ((1f - exp(((-(_e215) * _e217) / 12f))) * smoothstep(3f, 8f, _e225)));
}

fn leadHalf(cid: u32, c_7: f32, s_3: f32) -> f32 {
    var cid_1: u32;
    var c_8: f32;
    var s_4: f32;

    cid_1 = cid;
    c_8 = c_7;
    s_4 = s_3;
    let _e188 = s_4;
    let _e194 = cid_1;
    let _e206 = c_8;
    return min(150f, (((0.03f * min(_e188, 2048f)) * (0.2f + ((1.6f * f32((_e194 & 255u))) / 256f))) * (1f + (8f * (1f - sqrt(_e206))))));
}

fn crackOpen(cid_2: u32, c_9: f32, s_5: f32) -> f32 {
    var cid_3: u32;
    var c_10: f32;
    var s_6: f32;

    cid_3 = cid_2;
    c_10 = c_9;
    s_6 = s_5;
    let _e186 = cid_3;
    let _e197 = c_10;
    if ((f32(((_e186 >> 8u) & 255u)) / 256f) < (0.5f * smoothstep(0.85f, 1f, _e197))) {
        let _e202 = cid_3;
        return -((0.5f + (f32(((_e202 >> 16u) & 255u)) / 255f)));
    }
    let _e212 = cid_3;
    let _e213 = c_10;
    let _e214 = s_6;
    let _e215 = leadHalf(_e212, _e213, _e214);
    return _e215;
}

fn pieceCover(m_4: vec3<f32>, ice_2: f32) -> f32 {
    var m_5: vec3<f32>;
    var ice_3: f32;
    var u_2: vec3<f32>;
    var wm: vec3<f32>;
    var local_62: f32;

    m_5 = m_4;
    ice_3 = ice_2;
    let _e184 = m_5;
    u_2 = normalize(_e184);
    let _e187 = u_2;
    wm = pow(abs(_e187), vec3(4f));
    let _e193 = wm;
    let _e194 = wm;
    let _e196 = wm;
    let _e199 = wm;
    wm = (_e193 / vec3(((_e194.x + _e196.y) + _e199.z)));
    let _e204 = global.uSeason;
    if (_e204.z > 0.5f) {
        let _e208 = m_5;
        let _e209 = global.uLiquid2_;
        let _e211 = seaIceAt(_e208, _e209.z);
        local_62 = _e211;
    } else {
        let _e212 = ice_3;
        local_62 = _e212;
    }
    let _e214 = local_62;
    let _e215 = m_5;
    let _e216 = wm;
    let _e218 = tri0_(_e215, _e216, 512f);
    let _e220 = m_5;
    let _e221 = wm;
    let _e223 = tri0_(_e220, _e221, 64f);
    let _e225 = seaIceCover(_e214, _e218.w, _e223.x);
    return _e225;
}

fn faceLead(face: u32, axis: i32, neg: bool) -> u32 {
    var face_1: u32;
    var axis_1: i32;
    var neg_1: bool;
    var local_63: u32;
    var of_: u32;

    face_1 = face;
    axis_1 = axis;
    neg_1 = neg;
    let _e186 = axis_1;
    let _e190 = neg_1;
    if _e190 {
        local_63 = 1u;
    } else {
        local_63 = 0u;
    }
    let _e194 = local_63;
    of_ = (u32((_e186 * 2i)) + _e194);
    let _e197 = face_1;
    let _e198 = of_;
    let _e200 = face_1;
    let _e201 = of_;
    let _e205 = floeHash(min(_e197, _e198), max(_e200, _e201), 20253u, 11132u);
    return _e205;
}

fn floeRound(size: f32, id: u32, c_11: f32) -> f32 {
    var size_1: f32;
    var id_1: u32;
    var c_12: f32;
    var age_1: f32;

    size_1 = size;
    id_1 = id;
    c_12 = c_11;
    let _e191 = size_1;
    let _e197 = id_1;
    age_1 = ((0.3f + (0.7f * smoothstep(16f, 200f, _e191))) * (0.6f + ((0.4f * f32((_e197 >> 16u))) / 65536f)));
    let _e207 = size_1;
    let _e210 = age_1;
    let _e217 = c_12;
    return (_e207 * ((0.06f * (0.5f + _e210)) + (0.32f * (1f - smoothstep(0.5f, 0.9f, _e217)))));
}

fn floeOf(p_9: vec3<f32>, ice_4: f32, id_2: ptr<function, u32>, e: ptr<function, f32>, lid_2: ptr<function, u32>, c_13: ptr<function, f32>, size_2: ptr<function, f32>, mid: ptr<function, vec3<f32>>, there: ptr<function, bool>, ridge: ptr<function, vec4<f32>>) {
    var p_10: vec3<f32>;
    var ice_5: f32;
    var R_2: f32;
    var a_13: vec3<f32>;
    var local_64: i32;
    var local_65: i32;
    var ax: i32;
    var b_4: i32;
    var d_8: i32;
    var neg_2: bool;
    var local_66: f32;
    var sg: f32;
    var pu: f32;
    var pv: f32;
    var local_67: u32;
    var face_2: u32;
    var V_1: array<vec2<f32>, 12>;
    var EI: array<u32, 12>;
    var ES: array<f32, 12>;
    var i_7: i32 = 0i;
    var n_15: i32 = 4i;
    var s_7: f32 = 0f;
    var cP: f32 = -1f;
    var m_6: vec3<f32>;
    var lvl: i32 = 0i;
    var v0_: vec2<f32>;
    var cs_1: vec2<f32>;
    var A_1: f32;
    var i_8: i32;
    var xi: vec2<f32>;
    var xj: vec2<f32>;
    var w_6: f32;
    var cc: vec2<f32>;
    var sxx: f32;
    var syy: f32;
    var sxy: f32;
    var i_9: i32;
    var x_7: vec2<f32>;
    var local_68: f32;
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
    var local_69: f32;
    var side: f32;
    var cid_4: u32;
    var g_12: f32;
    var W_3: array<vec2<f32>, 12>;
    var WI: array<u32, 12>;
    var WS: array<f32, 12>;
    var k_2: i32;
    var i_10: i32;
    var xi_1: vec2<f32>;
    var xj_1: vec2<f32>;
    var di: f32;
    var dj: f32;
    var i_11: i32;
    var local_70: u32;
    var rh: f32 = 0f;
    var e2_1: f32 = 100000000000000000000f;
    var i_12: i32 = 0i;
    var dv: vec2<f32>;
    var N3_: vec3<f32>;
    var dn_2: f32;
    var ek: f32;
    var local_71: f32;
    var rr: f32;

    p_10 = p_9;
    ice_5 = ice_4;
    let _e193 = p_10;
    R_2 = length(_e193);
    let _e196 = p_10;
    a_13 = abs(_e196);
    let _e199 = a_13;
    let _e201 = a_13;
    let _e204 = a_13;
    let _e206 = a_13;
    if ((_e199.x >= _e201.y) && (_e204.x >= _e206.z)) {
        local_65 = 0i;
    } else {
        let _e211 = a_13;
        let _e213 = a_13;
        if (_e211.y >= _e213.z) {
            local_64 = 1i;
        } else {
            local_64 = 2i;
        }
        let _e219 = local_64;
        local_65 = _e219;
    }
    let _e221 = local_65;
    ax = _e221;
    let _e223 = ax;
    b_4 = ((_e223 + 1i) % 3i);
    let _e229 = ax;
    d_8 = ((_e229 + 2i) % 3i);
    let _e235 = ax;
    let _e237 = p_10[_e235];
    neg_2 = (_e237 < 0f);
    let _e241 = neg_2;
    if _e241 {
        local_66 = -1f;
    } else {
        local_66 = 1f;
    }
    let _e246 = local_66;
    sg = _e246;
    let _e248 = b_4;
    let _e250 = p_10[_e248];
    let _e251 = ax;
    let _e253 = p_10[_e251];
    pu = (_e250 / _e253);
    let _e256 = d_8;
    let _e258 = p_10[_e256];
    let _e259 = ax;
    let _e261 = p_10[_e259];
    pv = (_e258 / _e261);
    let _e264 = ax;
    let _e268 = neg_2;
    if _e268 {
        local_67 = 1u;
    } else {
        local_67 = 0u;
    }
    let _e272 = local_67;
    face_2 = (u32((_e264 * 2i)) + _e272);
    V_1[0i] = vec2<f32>(-1f, -1f);
    V_1[1i] = vec2<f32>(1f, -1f);
    V_1[2i] = vec2<f32>(1f, 1f);
    V_1[3i] = vec2<f32>(-1f, 1f);
    let _e304 = face_2;
    let _e305 = d_8;
    let _e306 = neg_2;
    let _e308 = faceLead(_e304, _e305, !(_e306));
    EI[0i] = _e308;
    let _e311 = face_2;
    let _e312 = b_4;
    let _e313 = neg_2;
    let _e314 = faceLead(_e311, _e312, _e313);
    EI[1i] = _e314;
    let _e317 = face_2;
    let _e318 = d_8;
    let _e319 = neg_2;
    let _e320 = faceLead(_e317, _e318, _e319);
    EI[2i] = _e320;
    let _e323 = face_2;
    let _e324 = b_4;
    let _e325 = neg_2;
    let _e327 = faceLead(_e323, _e324, !(_e325));
    EI[3i] = _e327;
    loop {
        let _e330 = i_7;
        if !((_e330 < 4i)) {
            break;
        }
        let _e337 = i_7;
        let _e339 = i_7;
        let _e341 = EI[_e339];
        let _e344 = leadHalf(_e341, 1f, 4096f);
        ES[_e337] = _e344;
        continuing {
            let _e334 = i_7;
            i_7 = (_e334 + 1i);
        }
    }
    (*ridge) = vec4<f32>(0f, 0f, 0f, 100000000000000000000f);
    let _e352 = face_2;
    let _e356 = floeHash(_e352, 20942u, 0u, 14971u);
    (*id_2) = _e356;
    (*c_13) = 1f;
    let _e363 = p_10;
    m_6 = _e363;
    loop {
        let _e367 = lvl;
        if !((_e367 < 32i)) {
            break;
        }
        {
            let _e376 = V_1[0];
            v0_ = _e376;
            cs_1 = vec2(0f);
            A_1 = 0f;
            i_8 = 0i;
            loop {
                let _e385 = i_8;
                if !((_e385 < POLY_MAX)) {
                    break;
                }
                {
                    let _e391 = i_8;
                    let _e392 = n_15;
                    if (_e391 >= _e392) {
                        break;
                    }
                    let _e394 = i_8;
                    let _e396 = V_1[_e394];
                    let _e397 = v0_;
                    xi = (_e396 - _e397);
                    let _e400 = i_8;
                    let _e403 = n_15;
                    let _e406 = V_1[((_e400 + 1i) % _e403)];
                    let _e407 = v0_;
                    xj = (_e406 - _e407);
                    let _e410 = xi;
                    let _e412 = xj;
                    let _e415 = xj;
                    let _e417 = xi;
                    w_6 = ((_e410.x * _e412.y) - (_e415.x * _e417.y));
                    let _e422 = A_1;
                    let _e423 = w_6;
                    A_1 = (_e422 + _e423);
                    let _e425 = cs_1;
                    let _e426 = xi;
                    let _e427 = xj;
                    let _e429 = w_6;
                    cs_1 = (_e425 + ((_e426 + _e427) * _e429));
                }
                continuing {
                    let _e388 = i_8;
                    i_8 = (_e388 + 1i);
                }
            }
            let _e432 = A_1;
            A_1 = (_e432 * 0.5f);
            let _e435 = A_1;
            if (abs(_e435) < 0.00000000000000000001f) {
                break;
            }
            let _e439 = v0_;
            let _e440 = cs_1;
            let _e442 = A_1;
            cc = (_e439 + (_e440 / vec2((6f * _e442))));
            sxx = 0f;
            syy = 0f;
            sxy = 0f;
            i_9 = 0i;
            loop {
                let _e456 = i_9;
                if !((_e456 < POLY_MAX)) {
                    break;
                }
                {
                    let _e462 = i_9;
                    let _e463 = n_15;
                    if (_e462 >= _e463) {
                        break;
                    }
                    let _e465 = i_9;
                    let _e467 = V_1[_e465];
                    let _e468 = cc;
                    x_7 = (_e467 - _e468);
                    let _e471 = sxx;
                    let _e472 = x_7;
                    let _e474 = x_7;
                    sxx = (_e471 + (_e472.x * _e474.x));
                    let _e478 = syy;
                    let _e479 = x_7;
                    let _e481 = x_7;
                    syy = (_e478 + (_e479.y * _e481.y));
                    let _e485 = sxy;
                    let _e486 = x_7;
                    let _e488 = x_7;
                    sxy = (_e485 + (_e486.x * _e488.y));
                }
                continuing {
                    let _e459 = i_9;
                    i_9 = (_e459 + 1i);
                }
            }
            let _e492 = sxy;
            let _e494 = sxx;
            let _e495 = syy;
            let _e500 = sxx;
            let _e501 = syy;
            if ((abs(_e492) + abs((_e494 - _e495))) > (0.000000000000000000000000000001f * (_e500 + _e501))) {
                let _e507 = sxy;
                let _e509 = sxx;
                let _e510 = syy;
                local_68 = (0.5f * atan2((2f * _e507), (_e509 - _e510)));
            } else {
                local_68 = 0f;
            }
            let _e516 = local_68;
            th_1 = _e516;
            let _e518 = sxx;
            let _e519 = syy;
            let _e521 = n_15;
            ext = sqrt(((_e518 + _e519) / f32(_e521)));
            let _e527 = ax;
            let _e529 = sg;
            mm[_e527] = _e529;
            let _e530 = b_4;
            let _e532 = sg;
            let _e533 = cc;
            mm[_e530] = (_e532 * _e533.x);
            let _e536 = d_8;
            let _e538 = sg;
            let _e539 = cc;
            mm[_e536] = (_e538 * _e539.y);
            let _e542 = mm;
            let _e544 = R_2;
            m_6 = (normalize(_e542) * _e544);
            let _e546 = R_2;
            let _e547 = A_1;
            let _e552 = cc;
            let _e553 = cc;
            s_7 = ((_e546 * sqrt(abs(_e547))) / pow((1f + dot(_e552, _e553)), 0.75f));
            let _e559 = (*id_2);
            let _e560 = lvl;
            let _e564 = floeHash(_e559, u32(_e560), 20942u, 14971u);
            h_9 = _e564;
            let _e566 = th_1;
            let _e569 = h_9;
            tc = (((_e566 + 1.5708f) + ((f32(((_e569 >> 8u) & 1023u)) / 1023f) * 1.0472f)) - 0.5236f);
            let _e583 = h_9;
            let _e595 = ext;
            off = ((((f32(((_e583 >> 18u) & 255u)) / 255f) - 0.5f) * 0.6f) * _e595);
            let _e598 = cc;
            let _e599 = th_1;
            let _e601 = th_1;
            let _e604 = off;
            qq = (_e598 + (vec2<f32>(cos(_e599), sin(_e601)) * _e604));
            let _e608 = tc;
            KA = -(sin(_e608));
            let _e612 = tc;
            KB = cos(_e612);
            let _e615 = KA;
            let _e616 = qq;
            let _e619 = KB;
            let _e620 = qq;
            KC = -(((_e615 * _e616.x) + (_e619 * _e620.y)));
            let _e626 = s_7;
            if (_e626 < 4096f) {
                {
                    let _e629 = cP;
                    let _e632 = s_7;
                    if ((_e629 < 0f) || (_e632 < 1024f)) {
                        let _e636 = m_6;
                        let _e637 = ice_5;
                        let _e638 = pieceCover(_e636, _e637);
                        cP = _e638;
                    }
                    let _e639 = cP;
                    (*c_13) = _e639;
                    let _e640 = s_7;
                    let _e645 = (*c_13);
                    let _e650 = h_9;
                    let _e657 = (*c_13);
                    if ((_e640 < (12f + (288f * smoothstep(0.4f, 0.95f, _e645)))) || (f32((_e650 & 255u)) < (51.2f * smoothstep(0.5f, 0.9f, _e657)))) {
                        break;
                    }
                }
            }
            let _e662 = n_15;
            if (_e662 >= 11i) {
                break;
            }
            let _e667 = KA;
            let _e668 = pu;
            let _e670 = KB;
            let _e671 = pv;
            let _e674 = KC;
            if ((((_e667 * _e668) + (_e670 * _e671)) + _e674) >= 0f) {
                local_69 = 1f;
            } else {
                local_69 = -1f;
            }
            let _e682 = local_69;
            side = _e682;
            let _e684 = (*id_2);
            let _e685 = lvl;
            let _e689 = floeHash(_e684, u32(_e685), 31249u, 7997u);
            cid_4 = _e689;
            let _e691 = cid_4;
            let _e692 = (*c_13);
            let _e693 = s_7;
            let _e694 = crackOpen(_e691, _e692, _e693);
            g_12 = _e694;
            k_2 = 0i;
            i_10 = 0i;
            loop {
                let _e703 = i_10;
                if !((_e703 < POLY_MAX)) {
                    break;
                }
                {
                    let _e709 = i_10;
                    let _e710 = n_15;
                    let _e712 = k_2;
                    if ((_e709 >= _e710) || (_e712 >= POLY_MAX)) {
                        break;
                    }
                    let _e715 = i_10;
                    let _e717 = V_1[_e715];
                    xi_1 = _e717;
                    let _e719 = i_10;
                    let _e722 = n_15;
                    let _e725 = V_1[((_e719 + 1i) % _e722)];
                    xj_1 = _e725;
                    let _e727 = side;
                    let _e728 = KA;
                    let _e729 = xi_1;
                    let _e732 = KB;
                    let _e733 = xi_1;
                    let _e737 = KC;
                    di = (_e727 * (((_e728 * _e729.x) + (_e732 * _e733.y)) + _e737));
                    let _e741 = side;
                    let _e742 = KA;
                    let _e743 = xj_1;
                    let _e746 = KB;
                    let _e747 = xj_1;
                    let _e751 = KC;
                    dj = (_e741 * (((_e742 * _e743.x) + (_e746 * _e747.y)) + _e751));
                    let _e755 = di;
                    if (_e755 >= 0f) {
                        {
                            let _e758 = k_2;
                            let _e760 = xi_1;
                            W_3[_e758] = _e760;
                            let _e761 = k_2;
                            let _e763 = i_10;
                            let _e765 = EI[_e763];
                            WI[_e761] = _e765;
                            let _e766 = k_2;
                            let _e768 = i_10;
                            let _e770 = ES[_e768];
                            WS[_e766] = _e770;
                            let _e771 = k_2;
                            k_2 = (_e771 + 1i);
                        }
                    }
                    let _e774 = di;
                    let _e777 = dj;
                    let _e781 = k_2;
                    if (((_e774 >= 0f) != (_e777 >= 0f)) && (_e781 < POLY_MAX)) {
                        {
                            let _e784 = k_2;
                            let _e786 = xi_1;
                            let _e787 = xj_1;
                            let _e788 = xi_1;
                            let _e790 = di;
                            let _e791 = di;
                            let _e792 = dj;
                            W_3[_e784] = (_e786 + ((_e787 - _e788) * (_e790 / (_e791 - _e792))));
                            let _e797 = di;
                            if (_e797 >= 0f) {
                                {
                                    let _e800 = k_2;
                                    let _e802 = cid_4;
                                    WI[_e800] = _e802;
                                    let _e803 = k_2;
                                    let _e805 = g_12;
                                    WS[_e803] = _e805;
                                }
                            } else {
                                {
                                    let _e806 = k_2;
                                    let _e808 = i_10;
                                    let _e810 = EI[_e808];
                                    WI[_e806] = _e810;
                                    let _e811 = k_2;
                                    let _e813 = i_10;
                                    let _e815 = ES[_e813];
                                    WS[_e811] = _e815;
                                }
                            }
                            let _e816 = k_2;
                            k_2 = (_e816 + 1i);
                        }
                    }
                }
                continuing {
                    let _e706 = i_10;
                    i_10 = (_e706 + 1i);
                }
            }
            i_11 = 0i;
            loop {
                let _e821 = i_11;
                if !((_e821 < POLY_MAX)) {
                    break;
                }
                {
                    let _e827 = i_11;
                    let _e829 = i_11;
                    let _e831 = W_3[_e829];
                    V_1[_e827] = _e831;
                    let _e832 = i_11;
                    let _e834 = i_11;
                    let _e836 = WI[_e834];
                    EI[_e832] = _e836;
                    let _e837 = i_11;
                    let _e839 = i_11;
                    let _e841 = WS[_e839];
                    ES[_e837] = _e841;
                }
                continuing {
                    let _e824 = i_11;
                    i_11 = (_e824 + 1i);
                }
            }
            let _e842 = k_2;
            n_15 = _e842;
            let _e843 = (*id_2);
            let _e844 = side;
            if (_e844 > 0f) {
                local_70 = 1u;
            } else {
                local_70 = 0u;
            }
            let _e850 = local_70;
            let _e851 = lvl;
            let _e854 = floeHash(_e843, _e850, u32(_e851), 40503u);
            (*id_2) = _e854;
        }
        continuing {
            let _e371 = lvl;
            lvl = (_e371 + 1i);
        }
    }
    (*e) = 100000000000000000000f;
    (*lid_2) = 0u;
    loop {
        let _e863 = i_12;
        if !((_e863 < POLY_MAX)) {
            break;
        }
        {
            let _e869 = i_12;
            let _e870 = n_15;
            if (_e869 >= _e870) {
                break;
            }
            let _e872 = i_12;
            let _e875 = n_15;
            let _e878 = V_1[((_e872 + 1i) % _e875)];
            let _e879 = i_12;
            let _e881 = V_1[_e879];
            dv = (_e878 - _e881);
            let _e884 = dv;
            let _e885 = dv;
            if (dot(_e884, _e885) < 0.000000000000000000000001f) {
                continue;
            }
            let _e890 = b_4;
            let _e892 = dv;
            N3_[_e890] = -(_e892.y);
            let _e895 = d_8;
            let _e897 = dv;
            N3_[_e895] = _e897.x;
            let _e899 = ax;
            let _e901 = dv;
            let _e903 = i_12;
            let _e905 = V_1[_e903];
            let _e908 = dv;
            let _e910 = i_12;
            let _e912 = V_1[_e910];
            N3_[_e899] = ((_e901.y * _e905.x) - (_e908.x * _e912.y));
            let _e916 = N3_;
            N3_ = normalize(_e916);
            let _e918 = p_10;
            let _e919 = N3_;
            dn_2 = dot(_e918, _e919);
            let _e922 = dn_2;
            let _e924 = i_12;
            let _e926 = ES[_e924];
            ek = (abs(_e922) - max(_e926, 0.15f));
            let _e931 = ek;
            let _e932 = (*e);
            if (_e931 < _e932) {
                {
                    let _e934 = (*e);
                    e2_1 = _e934;
                    let _e935 = ek;
                    (*e) = _e935;
                    let _e936 = i_12;
                    let _e938 = EI[_e936];
                    (*lid_2) = _e938;
                }
            } else {
                let _e939 = ek;
                let _e940 = e2_1;
                if (_e939 < _e940) {
                    let _e942 = ek;
                    e2_1 = _e942;
                }
            }
            let _e943 = i_12;
            let _e945 = ES[_e943];
            let _e948 = dn_2;
            let _e950 = (*ridge);
            if ((_e945 < 0f) && (abs(_e948) < _e950.w)) {
                {
                    let _e954 = N3_;
                    let _e955 = dn_2;
                    let _e957 = (_e954 * sign(_e955));
                    let _e958 = dn_2;
                    (*ridge) = vec4<f32>(_e957.x, _e957.y, _e957.z, abs(_e958));
                    let _e964 = i_12;
                    let _e966 = ES[_e964];
                    rh = -(_e966);
                }
            }
        }
        continuing {
            let _e866 = i_12;
            i_12 = (_e866 + 1i);
        }
    }
    let _e969 = rh;
    if (_e969 > 0f) {
        let _e972 = rh;
        let _e975 = (*ridge);
        let _e978 = rh;
        local_71 = (_e972 * max(0f, (1f - (_e975.w / (2f * _e978)))));
    } else {
        local_71 = 0f;
    }
    let _e986 = local_71;
    (*ridge).w = _e986;
    let _e987 = m_6;
    let _e988 = ice_5;
    let _e989 = pieceCover(_e987, _e988);
    (*c_13) = _e989;
    let _e990 = s_7;
    let _e991 = (*id_2);
    let _e992 = (*c_13);
    let _e993 = floeRound(_e990, _e991, _e992);
    rr = _e993;
    let _e995 = e2_1;
    let _e996 = rr;
    if (_e995 < _e996) {
        let _e998 = rr;
        let _e999 = rr;
        let _e1000 = (*e);
        let _e1002 = rr;
        let _e1003 = e2_1;
        (*e) = (_e998 - length(vec2<f32>((_e999 - _e1000), (_e1002 - _e1003))));
    }
    let _e1008 = s_7;
    (*size_2) = _e1008;
    let _e1009 = m_6;
    (*mid) = _e1009;
    let _e1010 = (*c_13);
    let _e1013 = (*id_2);
    let _e1021 = (*c_13);
    (*there) = ((_e1010 > 0f) && ((f32((_e1013 & 65535u)) / 65536f) <= min(1f, (1.5f * _e1021))));
    return;
}

fn seaFloes(p_11: vec3<f32>, up_2: vec3<f32>, w_7: vec3<f32>, ice_6: f32, cPix: f32, foot_14: f32, frz_2: f32, pDay_2: f32, lead: ptr<function, vec2<f32>>, ridge_1: ptr<function, vec4<f32>>) -> vec4<f32> {
    var p_12: vec3<f32>;
    var up_3: vec3<f32>;
    var w_8: vec3<f32>;
    var ice_7: f32;
    var cPix_1: f32;
    var foot_15: f32;
    var frz_3: f32;
    var pDay_3: f32;
    var leadFar: vec2<f32>;
    var id_3: u32;
    var lid_3: u32;
    var e_1: f32;
    var c_14: f32;
    var size_3: f32;
    var mid_1: vec3<f32>;
    var there_1: bool;
    var fw_2: f32;
    var x_8: f32 = 0f;
    var rim: f32 = 0f;
    var age_2: f32;
    var kFar: f32;

    p_12 = p_11;
    up_3 = up_2;
    w_8 = w_7;
    ice_7 = ice_6;
    cPix_1 = cPix;
    foot_15 = foot_14;
    frz_3 = frz_2;
    pDay_3 = pDay_2;
    let _e200 = frz_3;
    let _e201 = pDay_3;
    let _e202 = leadIce(32768u, _e200, _e201);
    leadFar = _e202;
    (*lead) = vec2(0f);
    (*ridge_1) = vec4(0f);
    let _e208 = cPix_1;
    let _e211 = ice_7;
    if ((_e208 <= 0f) && (_e211 <= 0f)) {
        return vec4(0f);
    }
    let _e217 = foot_15;
    if (_e217 >= 64f) {
        {
            let _e220 = leadFar;
            (*lead) = _e220;
            let _e221 = cPix_1;
            let _e224 = cPix_1;
            return vec4<f32>(_e221, 0f, 0.7f, _e224);
        }
    }
    let _e233 = p_12;
    let _e234 = ice_7;
    floeOf(_e233, _e234, (&id_3), (&e_1), (&lid_3), (&c_14), (&size_3), (&mid_1), (&there_1), ridge_1);
    let _e251 = there_1;
    if !(_e251) {
        (*ridge_1) = vec4(0f);
    }
    let _e255 = e_1;
    let _e256 = p_12;
    let _e257 = w_8;
    let _e259 = tri(_e256, _e257, 8f);
    let _e265 = p_12;
    let _e266 = w_8;
    let _e268 = tri(_e265, _e266, 2f);
    e_1 = (_e255 + (((_e259.x - 0.5f) * 1.6f) + ((_e268.w - 0.5f) * 0.5f)));
    let _e276 = foot_15;
    fw_2 = max(_e276, 0.03f);
    let _e288 = size_3;
    let _e294 = id_3;
    age_2 = ((0.3f + (0.7f * smoothstep(16f, 200f, _e288))) * (0.6f + ((0.4f * f32((_e294 >> 16u))) / 65536f)));
    let _e304 = there_1;
    if _e304 {
        {
            let _e305 = e_1;
            let _e306 = fw_2;
            x_8 = clamp(((_e305 / _e306) + 0.5f), 0f, 1f);
            let _e316 = fw_2;
            let _e318 = e_1;
            rim = (1f - smoothstep(0f, (0.8f + _e316), _e318));
            let _e321 = lid_3;
            let _e322 = frz_3;
            let _e323 = pDay_3;
            let _e324 = leadIce(_e321, _e322, _e323);
            (*lead) = _e324;
        }
    }
    let _e327 = foot_15;
    kFar = smoothstep(16f, 64f, _e327);
    let _e330 = x_8;
    let _e331 = cPix_1;
    let _e332 = kFar;
    x_8 = mix(_e330, _e331, _e332);
    let _e334 = (*lead);
    let _e335 = leadFar;
    let _e336 = kFar;
    (*lead) = mix(_e334, _e335, vec2(_e336));
    let _e340 = (*ridge_1);
    let _e343 = kFar;
    (*ridge_1).w = (_e340.w * (1f - _e343));
    let _e346 = x_8;
    let _e347 = rim;
    let _e348 = x_8;
    let _e351 = kFar;
    let _e354 = age_2;
    let _e356 = kFar;
    let _e358 = c_14;
    let _e359 = cPix_1;
    let _e360 = kFar;
    return vec4<f32>(_e346, ((_e347 * _e348) * (1f - _e351)), mix(_e354, 0.7f, _e356), mix(_e358, _e359, _e360));
}

fn main_1() {
    var foot_16: f32;
    var dpx: vec3<f32>;
    var dpy: vec3<f32>;
    var dEnc: vec2<f32>;
    var shoreX_2: f32 = -1f;
    var dShoreX: vec2<f32>;
    var albedo: vec3<f32>;
    var waterEnc: f32;
    var dn_3: f32;
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
    var N_3: vec3<f32>;
    var muS_2: f32;
    var sunT: vec3<f32>;
    var skyE_1: vec3<f32>;
    var cloudT: f32;
    var pF_3: vec3<f32>;
    var sunTop: vec3<f32>;
    var keySh: f32;
    var fp_12: vec3<f32>;
    var fn_: vec3<f32>;
    var w_9: vec3<f32>;
    var fineK: f32;
    var midK: f32;
    var farK: f32;
    var local_72: f32;
    var isWater: f32;
    var gRough: f32 = 0.8f;
    var gAO: f32 = 1f;
    var ndl_1: f32;
    var color: vec3<f32>;
    var dbgW: vec3<f32> = vec3(-1f);
    var V_2: vec3<f32>;
    var upF_7: vec3<f32>;
    var local_73: vec3<f32>;
    var lq: vec3<f32>;
    var kind_4: f32;
    var Tm_2: f32;
    var river_3: bool;
    var local_74: f32;
    var flow_4: f32;
    var local_75: f32;
    var local_76: f32;
    var local_77: f32;
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
    var a11_: f32;
    var a12_: f32;
    var a22_: f32;
    var det: f32;
    var tsf: vec2<f32>;
    var ice_8: f32;
    var local_78: f32;
    var iceC: f32;
    var local_79: f32;
    var pDay_4: f32;
    var lead_1: vec2<f32> = vec2(0f);
    var local_80: f32;
    var Tair_2: f32;
    var ridge_2: vec4<f32> = vec4(0f);
    var local_81: vec4<f32>;
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
    var a_14: vec3<f32>;
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
    var local_82: f32;
    var fallK: f32;
    var dbgWhite: f32 = 0f;
    var dn_4: vec3<f32>;
    var down: vec3<f32>;
    var acr: vec3<f32>;
    var local_83: f32;
    var zf: f32;
    var v_1: f32;
    var t1_: f32;
    var t2_: f32;
    var wa_2: f32;
    var L_7: f32;
    var local_84: vec3<f32>;
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
    var local_85: vec3<f32>;
    var fd_1: vec3<f32>;
    var fa_1: vec3<f32>;
    var q2_: vec2<f32>;
    var fz: f32;
    var core: f32;
    var ring_1: f32;
    var fm: f32;
    var dI: vec4<f32>;
    var dJ: vec4<f32>;
    var lIce: f32;
    var lAlb: vec3<f32>;
    var local_86: f32;
    var thaw: f32;
    var snowy: f32;
    var iceAlb: vec3<f32>;
    var local_87: f32;
    var pond_1: f32;
    var N2_: vec3<f32>;
    var blk: f32;
    var iceCol: vec3<f32>;
    var NdH2_: f32;
    var iceF: f32;
    var dnI: vec3<f32>;
    var downI: vec3<f32>;
    var acrI: vec3<f32>;
    var local_88: vec3<f32>;
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
    var local_89: f32;
    var local_90: vec3<f32>;
    var local_91: vec3<f32>;
    var local_92: vec3<f32>;
    var local_93: vec3<f32>;
    var local_94: vec3<f32>;
    var a_15: vec3<f32>;
    var flick: f32;
    var crust: f32;
    var local_95: vec3<f32>;
    var local_96: f32;

    let _e181 = vWorldPos_1;
    let _e182 = fwidth(_e181);
    foot_16 = length(_e182);
    let _e185 = vFixedPos_1;
    let _e186 = dpdx(_e185);
    dpx = _e186;
    let _e188 = vFixedPos_1;
    let _e189 = dpdy(_e188);
    dpy = _e189;
    let _e191 = vCol_1;
    let _e193 = dpdx(_e191.w);
    let _e194 = vCol_1;
    let _e196 = dpdy(_e194.w);
    dEnc = vec2<f32>(_e193, _e196);
    let _e202 = global.uColourCube;
    if (_e202.x > 0.5f) {
        let _e206 = global.uToFixed;
        let _e207 = vWorldPos_1;
        let _e208 = global.uCenter;
        let _e213 = colourCubeAt(normalize((_e206 * normalize((_e207 - _e208)))));
        let _e215 = colourCubeShore(_e213.w);
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
    let _e234 = global.uNear;
    if (_e234.x > 0.5f) {
        {
            let _e238 = vNearRel_1;
            let _e239 = global.uNearUp;
            let _e240 = vNearRel_1;
            let _e241 = global.uNearUp;
            dn_3 = length((_e238 - (_e239 * dot(_e240, _e241))));
            let _e247 = global.uNearMode;
            if (_e247 < 0.5f) {
                {
                    let _e250 = dn_3;
                    let _e252 = global.uNear;
                    let _e256 = vShore_1;
                    if ((_e250 < (0.97f * _e252.y)) && (_e256 <= 0f)) {
                        discard;
                    }
                }
            } else {
                let _e260 = dn_3;
                let _e261 = global.uNearBand;
                let _e264 = dn_3;
                let _e265 = global.uNearBand;
                if ((_e260 < _e261.x) || (_e264 > _e265.y)) {
                    discard;
                }
            }
        }
    }
    let _e269 = vMat_1;
    veg = _e269.x;
    let _e272 = vMat_1;
    snow = _e272.y;
    let _e275 = vMat_1;
    rock = _e275.z;
    let _e278 = vMat_1;
    sand = _e278.w;
    let _e281 = vExt_1;
    emissive = _e281.x;
    let _e284 = vExt_1;
    wet = _e284.y;
    let _e287 = vExt_1;
    rough_1 = _e287.z;
    let _e290 = vWorldPos_1;
    let _e291 = global.uCenter;
    rel_4 = (_e290 - _e291);
    let _e294 = rel_4;
    r_10 = length(_e294);
    let _e297 = rel_4;
    let _e298 = r_10;
    up_4 = (_e297 / vec3(_e298));
    let _e302 = vWorldPos_1;
    dist_3 = length(_e302);
    let _e305 = vCol_1;
    colC = _e305.xyz;
    let _e308 = vShore_1;
    shoreV = _e308;
    let _e310 = dist_3;
    let _e311 = colourCubeK(_e310);
    cK = _e311;
    let _e313 = cK;
    if (_e313 > 0f) {
        {
            let _e316 = global.uToFixed;
            let _e317 = up_4;
            let _e320 = colourCubeAt(normalize((_e316 * _e317)));
            cc_1 = _e320;
            let _e322 = colC;
            let _e323 = cc_1;
            let _e325 = cK;
            colC = mix(_e322, _e323.xyz, vec3(_e325));
            let _e328 = shoreV;
            let _e329 = cc_1;
            let _e331 = colourCubeShoreV(_e329.w);
            let _e332 = cK;
            shoreV = mix(_e328, _e331, _e332);
            let _e334 = colC;
            let _e335 = colC;
            albedo = (_e334 * _e335);
        }
    }
    let _e337 = vNormal_1;
    N_3 = normalize(_e337);
    let _e340 = up_4;
    let _e341 = global.uSunDir;
    muS_2 = dot(_e340, _e341);
    let _e344 = r_10;
    let _e345 = muS_2;
    let _e346 = atmoSunTransmittance(_e344, _e345);
    sunT = _e346;
    let _e348 = r_10;
    let _e349 = muS_2;
    let _e350 = atmoSkyIrradiance(_e348, _e349);
    skyE_1 = _e350;
    let _e352 = rel_4;
    let _e353 = r_10;
    let _e354 = muS_2;
    let _e355 = foot_16;
    let _e356 = sunT;
    let _e359 = cloudLight(_e352, _e353, _e354, _e355, _e356, (&skyE_1));
    cloudT = _e359;
    let _e361 = sunT;
    let _e362 = cloudT;
    sunT = (_e361 * _e362);
    let _e364 = global.uToFixed;
    let _e365 = rel_4;
    pF_3 = (_e364 * _e365);
    let _e368 = sunT;
    let _e369 = pF_3;
    let _e370 = pF_3;
    let _e372 = global.uToFixed;
    let _e373 = global.uSunDir;
    let _e375 = global.uRadius;
    let _e376 = terrainShadow(_e369, normalize(_e370), (_e372 * _e373), _e375);
    sunT = (_e368 * _e376);
    let _e378 = sunT;
    sunTop = _e378;
    let _e380 = vWorldPos_1;
    let _e381 = N_3;
    let _e382 = sunShadowMap(_e380, _e381);
    keySh = _e382;
    let _e384 = sunT;
    let _e385 = keySh;
    sunT = (_e384 * _e385);
    let _e387 = vFixedPos_1;
    fp_12 = _e387;
    let _e389 = vFixedNormal_1;
    fn_ = normalize(_e389);
    let _e392 = fn_;
    w_9 = pow(abs(_e392), vec3(4f));
    let _e398 = w_9;
    let _e399 = w_9;
    let _e401 = w_9;
    let _e404 = w_9;
    w_9 = (_e398 / vec3(((_e399.x + _e401.y) + _e404.z)));
    let _e412 = dist_3;
    fineK = (1f - smoothstep(60f, 900f, _e412));
    let _e419 = dist_3;
    midK = (1f - smoothstep(600f, 9000f, _e419));
    let _e426 = dist_3;
    farK = (1f - smoothstep(6000f, 90000f, _e426));
    let _e430 = shoreV;
    if (_e430 > 0f) {
        local_72 = 1f;
    } else {
        local_72 = 0f;
    }
    let _e436 = local_72;
    isWater = _e436;
    let _e442 = isWater;
    if (_e442 < 0.5f) {
        discard;
    }
    let _e445 = N_3;
    let _e446 = global.uSunDir;
    ndl_1 = max(dot(_e445, _e446), 0f);
    let _e456 = isWater;
    if (_e456 > 0.5f) {
        {
            let _e459 = vWorldPos_1;
            V_2 = normalize(-(_e459));
            let _e463 = global.uToFixed;
            let _e464 = up_4;
            upF_7 = (_e463 * _e464);
            let _e467 = vLiq_1;
            if (_e467.x > 0.02f) {
                let _e471 = vLiq_1;
                let _e473 = vLiq_1;
                local_73 = (_e471.yzw / vec3(_e473.x));
            } else {
                local_73 = vec3<f32>(0f, 0.75f, 1f);
            }
            let _e482 = local_73;
            lq = _e482;
            let _e484 = lq;
            kind_4 = _e484.x;
            let _e487 = lq;
            Tm_2 = ((_e487.y * 120f) - 60f);
            let _e494 = kind_4;
            let _e497 = kind_4;
            river_3 = ((_e494 > 0.55f) && (_e497 < 0.85f));
            let _e502 = river_3;
            if _e502 {
                let _e503 = lq;
                local_74 = _e503.z;
            } else {
                local_74 = 0f;
            }
            let _e507 = local_74;
            flow_4 = _e507;
            let _e509 = kind_4;
            if (_e509 < 0.2f) {
                local_77 = 1f;
            } else {
                let _e513 = river_3;
                if _e513 {
                    local_76 = 0.2f;
                } else {
                    let _e515 = kind_4;
                    if (_e515 > 0.85f) {
                        local_75 = 0.05f;
                    } else {
                        let _e519 = lq;
                        local_75 = _e519.z;
                    }
                    let _e522 = local_75;
                    local_76 = _e522;
                }
                let _e524 = local_76;
                local_77 = _e524;
            }
            let _e526 = local_77;
            fetch_2 = _e526;
            let _e528 = waterEnc;
            let _e529 = waterEnc;
            let _e535 = shoreV;
            depthW = (((_e528 * _e529) * 6000f) * smoothstep(0f, 0.125f, _e535));
            let _e539 = fp_12;
            let _e540 = w_9;
            let _e542 = tri(_e539, _e540, 512f);
            nW = _e542;
            let _e544 = fp_12;
            let _e545 = w_9;
            let _e547 = tri(_e544, _e545, 64f);
            nG = _e547;
            let _e549 = nW;
            let _e553 = nW;
            wn_2 = (vec2<f32>((_e549.x - 0.5f), (_e553.w - 0.5f)) * 2f);
            let _e561 = nG;
            let _e563 = nG;
            let _e565 = nW;
            let _e567 = nW;
            grp_4 = clamp(((vec4<f32>(_e561.x, _e563.w, _e565.w, _e567.x) * 1.6f) - vec4(0.3f)), vec4(0f), vec4(1f));
            let _e584 = vFlw_1;
            fv_2 = (max(_e584.w, 0f) * 9f);
            {
                let _e597 = dpx;
                let _e598 = dpx;
                a11_ = dot(_e597, _e598);
                let _e601 = dpx;
                let _e602 = dpy;
                a12_ = dot(_e601, _e602);
                let _e605 = dpy;
                let _e606 = dpy;
                a22_ = dot(_e605, _e606);
                let _e609 = a11_;
                let _e610 = a22_;
                let _e612 = a12_;
                let _e613 = a12_;
                det = ((_e609 * _e610) - (_e612 * _e613));
                let _e617 = det;
                if (_e617 > 0.000000000001f) {
                    {
                        let _e621 = waterEnc;
                        let _e623 = a22_;
                        let _e624 = dEnc;
                        let _e627 = a12_;
                        let _e628 = dEnc;
                        let _e632 = dpx;
                        let _e634 = a11_;
                        let _e635 = dEnc;
                        let _e638 = a12_;
                        let _e639 = dEnc;
                        let _e643 = dpy;
                        let _e647 = det;
                        gradH_2 = (((12000f * _e621) * ((((_e623 * _e624.x) - (_e627 * _e628.y)) * _e632) + (((_e634 * _e635.y) - (_e638 * _e639.x)) * _e643))) / vec3(_e647));
                        let _e650 = a22_;
                        let _e651 = dShoreX;
                        let _e654 = a12_;
                        let _e655 = dShoreX;
                        let _e659 = dpx;
                        let _e661 = a11_;
                        let _e662 = dShoreX;
                        let _e665 = a12_;
                        let _e666 = dShoreX;
                        let _e670 = dpy;
                        let _e673 = det;
                        gradX_2 = (((((_e650 * _e651.x) - (_e654 * _e655.y)) * _e659) + (((_e661 * _e662.y) - (_e665 * _e666.x)) * _e670)) / vec3(_e673));
                    }
                }
            }
            let _e676 = fp_12;
            let _e677 = fn_;
            let _e678 = upF_7;
            let _e679 = kind_4;
            let _e680 = flow_4;
            let _e681 = fetch_2;
            let _e682 = depthW;
            let _e683 = foot_16;
            let _e684 = wn_2;
            let _e685 = grp_4;
            let _e686 = vFlw_1;
            let _e688 = fv_2;
            let _e689 = gradH_2;
            let _e690 = shoreX_2;
            let _e691 = gradX_2;
            liquidSurface(_e676, _e677, _e678, _e679, _e680, _e681, _e682, _e683, _e684, _e685, _e686.xyz, _e688, _e689, _e690, _e691, (&nF_1), (&wr), (&foam_2));
            let _e698 = Tm_2;
            let _e699 = kind_4;
            let _e700 = flow_4;
            let _e701 = upF_7;
            let _e702 = liquidTs(_e698, _e699, _e700, _e701);
            tsf = _e702;
            let _e705 = tsf;
            let _e709 = tsf;
            let _e713 = tsf;
            ice_8 = (1f - smoothstep((_e705.y - 4f), (_e709.y + 4f), _e713.x));
            let _e718 = kind_4;
            let _e721 = ice_8;
            if ((_e718 < 0.2f) && (_e721 > 0f)) {
                let _e725 = ice_8;
                let _e726 = nW;
                let _e728 = nG;
                let _e730 = seaIceCover(_e725, _e726.w, _e728.x);
                local_78 = _e730;
            } else {
                local_78 = 0f;
            }
            let _e733 = local_78;
            iceC = _e733;
            let _e735 = global.uSeason;
            if (_e735.z > 0.5f) {
                let _e740 = upF_7;
                let _e741 = seasonYear(_e740);
                let _e745 = global.uSeason;
                local_79 = (((12f * _e741.z) * DDF_SNOW) / max(_e745.y, 1f));
            } else {
                local_79 = 0f;
            }
            let _e752 = local_79;
            pDay_4 = _e752;
            let _e757 = global.uSeason;
            if (_e757.z > 0.5f) {
                let _e761 = Tm_2;
                let _e762 = upF_7;
                let _e763 = seasonIceNow(_e762);
                local_80 = (_e761 + _e763);
            } else {
                let _e765 = tsf;
                local_80 = _e765.x;
            }
            let _e768 = local_80;
            Tair_2 = _e768;
            let _e773 = kind_4;
            if (_e773 < 0.2f) {
                let _e776 = pF_3;
                let _e777 = upF_7;
                let _e778 = w_9;
                let _e779 = ice_8;
                let _e780 = iceC;
                let _e781 = foot_16;
                let _e782 = tsf;
                let _e784 = Tair_2;
                let _e788 = pDay_4;
                let _e793 = seaFloes(_e776, _e777, _e778, _e779, _e780, _e781, max((_e782.y - _e784), 0f), _e788, (&lead_1), (&ridge_2));
                local_81 = _e793;
            } else {
                let _e794 = ice_8;
                local_81 = vec4<f32>(_e794, 0f, 1f, 0f);
            }
            let _e800 = local_81;
            fl = _e800;
            let _e804 = iceC;
            let _e805 = fl;
            calm = smoothstep(0.05f, 0.6f, max(_e804, _e805.w));
            let _e810 = nF_1;
            let _e811 = upF_7;
            let _e813 = calm;
            nF_1 = normalize(mix(_e810, _e811, vec3((0.9f * _e813))));
            let _e818 = wr;
            let _e821 = calm;
            wr = (_e818 * (1f - (0.8f * _e821)));
            let _e825 = foam_2;
            let _e827 = calm;
            foam_2 = (_e825 * (1f - _e827));
            let _e830 = river_3;
            if _e830 {
                let _e831 = nF_1;
                let _e832 = fn_;
                let _e836 = fn_;
                let _e837 = upF_7;
                nF_1 = normalize(mix(_e831, _e832, vec3(smoothstep(0.13f, 0.3f, (1f - dot(_e836, _e837))))));
            }
            let _e844 = river_3;
            let _e845 = global.uLiquid2_;
            if (_e844 && (_e845.y > 0.9f)) {
                let _e850 = albedo;
                let _e857 = fv_2;
                albedo = mix(_e850, vec3<f32>(0.055f, 0.045f, 0.025f), vec3(clamp((0.25f + (0.3f * _e857)), 0f, 0.75f)));
            }
            let _e865 = global.uToFixed;
            let _e867 = nF_1;
            Nw = normalize((transpose(_e865) * _e867));
            let _e871 = Nw;
            let _e872 = V_2;
            let _e875 = Nw;
            let _e876 = V_2;
            Nw = normalize((_e871 + (_e872 * max(0f, (0.02f - dot(_e875, _e876))))));
            let _e883 = Nw;
            let _e884 = V_2;
            NdV = max(dot(_e883, _e884), 0.001f);
            let _e889 = Nw;
            let _e890 = global.uSunDir;
            ndlW = max(dot(_e889, _e890), 0f);
            let _e895 = global.uLiquid;
            F0_ = _e895.x;
            let _e898 = F0_;
            let _e900 = wr;
            let _e902 = F0_;
            let _e904 = F0_;
            let _e907 = NdV;
            F = (_e898 + ((max((1f - _e900), _e902) - _e904) * pow((1f - _e907), 5f)));
            let _e914 = V_2;
            let _e916 = Nw;
            R_3 = reflect(-(_e914), _e916);
            let _e919 = R_3;
            let _e920 = up_4;
            el = max(dot(_e919, _e920), 0f);
            let _e928 = el;
            let _e937 = el;
            let _e942 = cloudT;
            skyG = mix((0.7f + (1.1f * pow((1f - _e928), 3f))), (0.4286f * (1f + (2f * _e937))), clamp((1f - _e942), 0f, 1f));
            let _e949 = global.uSunE;
            let _e950 = skyE_1;
            let _e955 = skyG;
            let _e957 = global.uSunE;
            let _e958 = sunT;
            let _e962 = R_3;
            let _e963 = global.uSunDir;
            skyRefl = ((((_e949 * _e950) / vec3(3.1415927f)) * _e955) + (((_e957 * _e958) * 0.05f) * pow(max(dot(_e962, _e963), 0f), 12f)));
            let _e972 = global.uMoonE;
            if (_e972.y > 0f) {
                {
                    let _e976 = up_4;
                    let _e977 = global.uMoonDir;
                    muMr = dot(_e976, _e977);
                    let _e980 = skyRefl;
                    let _e981 = global.uMoonE;
                    let _e982 = r_10;
                    let _e983 = muMr;
                    let _e984 = atmoSkyIrradiance(_e982, _e983);
                    let _e989 = skyG;
                    let _e991 = global.uMoonE;
                    let _e992 = r_10;
                    let _e993 = muMr;
                    let _e996 = atmoSunTransmittance(_e992, max(_e993, 0f));
                    let _e1000 = R_3;
                    let _e1001 = global.uMoonDir;
                    skyRefl = (_e980 + ((((_e981 * _e984) / vec3(3.1415927f)) * _e989) + (((_e991 * _e996) * 0.05f) * pow(max(dot(_e1000, _e1001), 0f), 12f))));
                }
            }
            let _e1010 = albedo;
            let _e1014 = global.uSunE;
            let _e1015 = sunT;
            let _e1017 = muS_2;
            let _e1023 = global.uSunE;
            let _e1024 = skyE_1;
            body = ((_e1010 / vec3(3.1415927f)) * ((((_e1014 * _e1015) * max(_e1017, 0f)) * 0.6f) + ((_e1023 * _e1024) * 0.5f)));
            let _e1031 = river_3;
            let _e1032 = global.uLiquid2_;
            if (_e1031 && (_e1032.y > 0.9f)) {
                {
                    let _e1038 = fv_2;
                    let _e1040 = fv_2;
                    let _e1042 = fv_2;
                    ssc = clamp((((30f * _e1038) * _e1040) * _e1042), 0.5f, 3000f);
                    let _e1048 = global.uLiquid3_;
                    let _e1050 = ssc;
                    let _e1057 = global.uLiquid3_;
                    a_14 = ((_e1048.xyz + (_e1050 * vec3<f32>(0.012f, 0.02f, 0.035f))) + (_e1057.w * vec3<f32>(0.078f, 0.207f, 0.687f)));
                    let _e1069 = ssc;
                    bb = vec3((0.00475f * _e1069));
                    let _e1074 = bb;
                    let _e1076 = a_14;
                    let _e1077 = bb;
                    let _e1083 = global.uSunE;
                    let _e1084 = sunT;
                    let _e1086 = muS_2;
                    let _e1090 = global.uSunE;
                    let _e1091 = skyE_1;
                    body = ((((0.33f * _e1074) / (_e1076 + _e1077)) / vec3(3.1415927f)) * (((_e1083 * _e1084) * max(_e1086, 0f)) + (_e1090 * _e1091)));
                }
            }
            let _e1095 = V_2;
            let _e1096 = global.uSunDir;
            H_2 = normalize((_e1095 + _e1096));
            let _e1100 = wr;
            let _e1101 = wr;
            let _e1103 = wr;
            let _e1105 = wr;
            a2_ = (((_e1100 * _e1101) * _e1103) * _e1105);
            let _e1108 = a2_;
            a2s = max(_e1108, 0.0000001f);
            let _e1112 = Nw;
            let _e1113 = H_2;
            NdH = max(dot(_e1112, _e1113), 0f);
            let _e1118 = V_2;
            let _e1119 = H_2;
            VdH = max(dot(_e1118, _e1119), 0f);
            let _e1124 = a2s;
            let _e1125 = NdH;
            let _e1126 = NdH;
            let _e1128 = a2s;
            Dg = (_e1124 / (PI * pow((((_e1125 * _e1126) * (_e1128 - 1f)) + 1f), 2f)));
            let _e1139 = wr;
            let _e1142 = wr;
            kg = (((_e1139 + 1f) * (_e1142 + 1f)) / 8f);
            let _e1149 = NdV;
            let _e1150 = NdV;
            let _e1152 = kg;
            let _e1155 = kg;
            let _e1158 = ndlW;
            let _e1160 = ndlW;
            let _e1162 = kg;
            let _e1165 = kg;
            Gg = (((_e1149 / ((_e1150 * (1f - _e1152)) + _e1155)) * _e1158) / ((_e1160 * (1f - _e1162)) + _e1165));
            let _e1169 = F0_;
            let _e1171 = F0_;
            let _e1174 = VdH;
            Fs = (_e1169 + ((1f - _e1171) * pow((1f - _e1174), 5f)));
            let _e1181 = body;
            let _e1183 = F;
            let _e1186 = skyRefl;
            let _e1187 = F;
            let _e1190 = global.uSunE;
            let _e1191 = sunT;
            let _e1193 = Dg;
            let _e1195 = Gg;
            let _e1197 = Fs;
            let _e1200 = NdV;
            let _e1205 = muS_2;
            color = (((_e1181 * (1f - _e1183)) + (_e1186 * _e1187)) + ((((((_e1190 * _e1191) * _e1193) * _e1195) * _e1197) / vec3((4f * _e1200))) * step(0f, _e1205)));
            let _e1209 = global.uMoonE;
            if (_e1209.y > 0f) {
                {
                    let _e1213 = up_4;
                    let _e1214 = global.uMoonDir;
                    muMn = dot(_e1213, _e1214);
                    let _e1217 = muMn;
                    if (_e1217 > -0.02f) {
                        {
                            let _e1221 = V_2;
                            let _e1222 = global.uMoonDir;
                            Hm = normalize((_e1221 + _e1222));
                            let _e1226 = Nw;
                            let _e1227 = Hm;
                            NdHm = max(dot(_e1226, _e1227), 0f);
                            let _e1232 = V_2;
                            let _e1233 = Hm;
                            VdHm = max(dot(_e1232, _e1233), 0f);
                            let _e1238 = Nw;
                            let _e1239 = global.uMoonDir;
                            ndlM = max(dot(_e1238, _e1239), 0f);
                            let _e1244 = a2s;
                            let _e1245 = NdHm;
                            let _e1246 = NdHm;
                            let _e1248 = a2s;
                            Dm = (_e1244 / (PI * pow((((_e1245 * _e1246) * (_e1248 - 1f)) + 1f), 2f)));
                            let _e1259 = NdV;
                            let _e1260 = NdV;
                            let _e1262 = kg;
                            let _e1265 = kg;
                            let _e1268 = ndlM;
                            let _e1270 = ndlM;
                            let _e1272 = kg;
                            let _e1275 = kg;
                            Gm = (((_e1259 / ((_e1260 * (1f - _e1262)) + _e1265)) * _e1268) / ((_e1270 * (1f - _e1272)) + _e1275));
                            let _e1279 = F0_;
                            let _e1281 = F0_;
                            let _e1284 = VdHm;
                            Fm = (_e1279 + ((1f - _e1281) * pow((1f - _e1284), 5f)));
                            let _e1291 = color;
                            let _e1292 = global.uMoonE;
                            let _e1293 = r_10;
                            let _e1294 = muMn;
                            let _e1297 = atmoSunTransmittance(_e1293, max(_e1294, 0f));
                            let _e1299 = cloudDirZ;
                            let _e1301 = Dm;
                            let _e1303 = Gm;
                            let _e1305 = Fm;
                            let _e1308 = NdV;
                            color = (_e1291 + ((((((_e1292 * _e1297) * _e1299) * _e1301) * _e1303) * _e1305) / vec3((4f * _e1308))));
                        }
                    }
                }
            }
            let _e1313 = global.uSunE;
            let _e1314 = sunT;
            let _e1316 = up_4;
            let _e1317 = global.uSunDir;
            let _e1322 = global.uSunE;
            let _e1323 = skyE_1;
            lit_1 = (((_e1313 * _e1314) * max(dot(_e1316, _e1317), 0f)) + (_e1322 * _e1323));
            let _e1327 = river_3;
            if _e1327 {
                let _e1331 = fn_;
                let _e1332 = upF_7;
                local_82 = smoothstep(0.13f, 0.3f, (1f - dot(_e1331, _e1332)));
            } else {
                local_82 = 0f;
            }
            let _e1338 = local_82;
            fallK = _e1338;
            let _e1342 = fallK;
            if (_e1342 > 0f) {
                {
                    let _e1345 = upF_7;
                    let _e1346 = fn_;
                    let _e1347 = upF_7;
                    let _e1348 = fn_;
                    dn_4 = (_e1345 - (_e1346 * dot(_e1347, _e1348)));
                    let _e1353 = dn_4;
                    let _e1355 = dn_4;
                    down = (-(_e1353) / vec3(max(length(_e1355), 0.0001f)));
                    let _e1362 = fn_;
                    let _e1363 = down;
                    acr = normalize(cross(_e1362, _e1363));
                    let _e1367 = global.uFallTop;
                    if (_e1367 > 0f) {
                        let _e1370 = global.uFallTop;
                        let _e1371 = r_10;
                        local_83 = max((_e1370 - _e1371), 0f);
                    } else {
                        local_83 = 4f;
                    }
                    let _e1377 = local_83;
                    zf = _e1377;
                    let _e1380 = global.uFall1_;
                    let _e1383 = zf;
                    let _e1388 = global.uFall1_;
                    v_1 = min((sqrt(((2f * _e1380.x) * _e1383)) + 0.3f), _e1388.y);
                    let _e1392 = global.uTime;
                    t1_ = fract((_e1392 * 0.4f));
                    let _e1397 = global.uTime;
                    t2_ = fract(((_e1397 * 0.4f) + 0.5f));
                    let _e1406 = t1_;
                    wa_2 = (1f - abs(((2f * _e1406) - 1f)));
                    let _e1415 = v_1;
                    L_7 = (1f + (0.12f * _e1415));
                    let _e1419 = vFixedPos_1;
                    let _e1420 = global.uOriginMod;
                    let _e1422 = global.uFallTop;
                    if (_e1422 > 0f) {
                        let _e1425 = global.uFallFoot;
                        local_84 = _e1425;
                    } else {
                        local_84 = vec3(0f);
                    }
                    let _e1429 = local_84;
                    pS = ((_e1419 - _e1420) - _e1429);
                    let _e1432 = pS;
                    let _e1433 = acr;
                    let _e1437 = pS;
                    let _e1438 = down;
                    let _e1441 = L_7;
                    q_7 = vec2<f32>((dot(_e1432, _e1433) / 4.8f), (dot(_e1437, _e1438) / (48f * _e1441)));
                    let _e1446 = v_1;
                    let _e1450 = L_7;
                    dv_1 = ((_e1446 * 2.5f) / (48f * _e1450));
                    let _e1454 = q_7;
                    let _e1456 = dv_1;
                    let _e1457 = t1_;
                    qA = (_e1454 - vec2<f32>(0f, (_e1456 * _e1457)));
                    let _e1462 = q_7;
                    let _e1468 = dv_1;
                    let _e1469 = t2_;
                    qB = ((_e1462 + vec2<f32>(0.37f, 0f)) - vec2<f32>(0f, (_e1468 * _e1469)));
                    let _e1474 = qA;
                    let _e1476 = textureSampleLevel(tDetailTexture, tDetailSampler, _e1474, 0f);
                    bA = _e1476.x;
                    let _e1479 = qB;
                    let _e1481 = textureSampleLevel(tDetailTexture, tDetailSampler, _e1479, 0f);
                    bB = _e1481.x;
                    let _e1484 = bA;
                    let _e1486 = q_7;
                    let _e1497 = dv_1;
                    let _e1499 = t1_;
                    let _e1504 = textureSampleLevel(tDetailTexture, tDetailSampler, (((_e1486 * vec2<f32>(3f, 2f)) + vec2<f32>(0.53f, 0f)) - vec2<f32>(0f, ((2f * _e1497) * _e1499))), 0f);
                    sA = (_e1484 + (0.45f * _e1504.x));
                    let _e1509 = bB;
                    let _e1511 = q_7;
                    let _e1522 = dv_1;
                    let _e1524 = t2_;
                    let _e1529 = textureSampleLevel(tDetailTexture, tDetailSampler, (((_e1511 * vec2<f32>(3f, 2f)) + vec2<f32>(0.11f, 0f)) - vec2<f32>(0f, ((2f * _e1522) * _e1524))), 0f);
                    sB = (_e1509 + (0.45f * _e1529.x));
                    let _e1535 = sB;
                    let _e1536 = sA;
                    let _e1537 = wa_2;
                    st_2 = clamp((0.5f + ((mix(_e1535, _e1536, _e1537) - 0.725f) * 2.2f)), 0f, 1f);
                    let _e1548 = qB;
                    let _e1554 = textureSampleLevel(tDetailTexture, tDetailSampler, (_e1548 + vec2<f32>(0.031f, 0f)), 0f);
                    let _e1556 = bB;
                    let _e1558 = qA;
                    let _e1564 = textureSampleLevel(tDetailTexture, tDetailSampler, (_e1558 + vec2<f32>(0.031f, 0f)), 0f);
                    let _e1566 = bA;
                    let _e1568 = wa_2;
                    gS = (mix((_e1554.x - _e1556), (_e1564.x - _e1566), _e1568) / 0.15f);
                    let _e1575 = vFlw_1;
                    qU = max((_e1575.w * 9f), 0.3f);
                    let _e1582 = zf;
                    let _e1584 = qU;
                    br_1 = clamp((_e1582 / (6f * pow(_e1584, 0.32f))), 0f, 1f);
                    let _e1595 = global.uFall2_;
                    let _e1600 = zf;
                    aer = (mix(0.25f, 0.95f, _e1595.y) * smoothstep(0f, 0.5f, _e1600));
                    let _e1606 = br_1;
                    th_2 = mix(0.72f, 0.22f, _e1606);
                    let _e1609 = th_2;
                    let _e1612 = th_2;
                    let _e1615 = st_2;
                    let _e1617 = edge;
                    jets = smoothstep((_e1609 - 0.14f), (_e1612 + 0.14f), (_e1615 + (0.75f * (_e1617 - 1f))));
                    let _e1624 = aer;
                    let _e1625 = jets;
                    white = clamp((_e1624 * _e1625), 0f, 1f);
                    let _e1631 = white;
                    dbgWhite = _e1631;
                    let _e1632 = Nw;
                    let _e1633 = global.uToFixed;
                    let _e1635 = acr;
                    let _e1637 = gS;
                    nS = normalize((_e1632 + ((transpose(_e1633) * _e1635) * clamp((_e1637 * 1.6f), -0.9f, 0.9f))));
                    let _e1648 = global.uSunE;
                    let _e1649 = sunT;
                    let _e1651 = nS;
                    let _e1652 = global.uSunDir;
                    let _e1657 = global.uSunE;
                    let _e1658 = skyE_1;
                    litS = (((_e1648 * _e1649) * max(dot(_e1651, _e1652), 0f)) + ((_e1657 * _e1658) * 0.6f));
                    let _e1668 = st_2;
                    albS = mix(0.5f, 0.92f, smoothstep(0.15f, 0.85f, _e1668));
                    let _e1672 = color;
                    let _e1673 = color;
                    let _e1676 = albS;
                    let _e1681 = litS;
                    let _e1683 = white;
                    let _e1686 = fallK;
                    color = mix(_e1672, mix((_e1673 * 0.8f), ((vec3(_e1676) / vec3(3.1415927f)) * _e1681), vec3(_e1683)), vec3(_e1686));
                    let _e1689 = foam_2;
                    let _e1691 = fallK;
                    foam_2 = (_e1689 * (1f - _e1691));
                }
            }
            let _e1694 = global.uFallTop;
            if (_e1694 > 0f) {
                {
                    let _e1697 = vFixedPos_1;
                    let _e1698 = global.uOriginMod;
                    let _e1700 = global.uFallFoot;
                    Lf = ((_e1697 - _e1698) - _e1700);
                    let _e1704 = global.uFallAcr;
                    let _e1705 = global.uFallAcr;
                    hasA = step(0.5f, dot(_e1704, _e1705));
                    let _e1709 = Lf;
                    let _e1710 = global.uFallAcr;
                    let _e1714 = global.uFallW;
                    let _e1717 = global.uFallW;
                    let _e1720 = hasA;
                    al_2 = (clamp(dot(_e1709, _e1710), (-0.5f * _e1714), (0.5f * _e1717)) * _e1720);
                    let _e1723 = Lf;
                    let _e1724 = global.uFallAcr;
                    let _e1725 = al_2;
                    let _e1729 = global.uFallW;
                    let _e1738 = global.uFallW;
                    let _e1741 = hasA;
                    dF = (length((_e1723 - (_e1724 * _e1725))) / mix(max(((_e1729 * 1.2f) + 2f), 2f), (3f + (0.15f * _e1738)), _e1741));
                    let _e1745 = vFlw_1;
                    flL = length(_e1745.xyz);
                    let _e1749 = flL;
                    if (_e1749 > 0.0001f) {
                        let _e1752 = vFlw_1;
                        let _e1754 = flL;
                        local_85 = (_e1752.xyz / vec3(_e1754));
                    } else {
                        let _e1757 = upF_7;
                        local_85 = normalize((cross(_e1757, vec3<f32>(0f, 0f, 1f)) + vec3<f32>(0.0001f, 0f, 0f)));
                    }
                    let _e1770 = local_85;
                    fd_1 = _e1770;
                    let _e1772 = upF_7;
                    let _e1773 = fd_1;
                    fa_1 = normalize(cross(_e1772, _e1773));
                    let _e1777 = Lf;
                    let _e1778 = fa_1;
                    let _e1780 = Lf;
                    let _e1781 = fd_1;
                    let _e1783 = global.uTime;
                    let _e1784 = flL;
                    q2_ = (vec2<f32>(dot(_e1777, _e1778), (dot(_e1780, _e1781) - (_e1783 * max((_e1784 * 9f), 0.4f)))) * 0.18f);
                    let _e1795 = q2_;
                    let _e1797 = textureSampleLevel(tDetailTexture, tDetailSampler, _e1795, 0f);
                    let _e1801 = q2_;
                    let _e1808 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e1801 * 2.7f) + vec2(0.31f)), 0f);
                    fz = ((_e1797.x * 0.65f) + (_e1808.w * 0.35f));
                    let _e1817 = dF;
                    core = (1f - smoothstep(0.05f, 0.45f, _e1817));
                    let _e1824 = dF;
                    ring_1 = (1f - smoothstep(0.2f, 1f, _e1824));
                    let _e1828 = core;
                    let _e1831 = ring_1;
                    let _e1834 = ring_1;
                    let _e1838 = fz;
                    fm = max((_e1828 * 0.9f), (_e1831 * smoothstep((0.55f - (0.3f * _e1834)), 0.8f, _e1838)));
                    let _e1843 = foam_2;
                    let _e1844 = fm;
                    let _e1847 = global.uFall2_;
                    let _e1852 = fallK;
                    foam_2 = max(_e1843, ((_e1844 * mix(0.35f, 0.95f, _e1847.y)) * (1f - _e1852)));
                }
            }
            let _e1856 = color;
            let _e1867 = lit_1;
            let _e1869 = foam_2;
            color = mix(_e1856, (vec3<f32>(0.23873241f, 0.23873241f, 0.23873241f) * _e1867), vec3(clamp(_e1869, 0f, 1f)));
            let _e1875 = ice_8;
            if (_e1875 > 0f) {
                {
                    let _e1878 = nW;
                    dI = _e1878;
                    let _e1880 = nG;
                    dJ = _e1880;
                    let _e1882 = kind_4;
                    if (_e1882 < 0.2f) {
                        {
                            let _e1887 = lead_1;
                            let _e1891 = fl;
                            lIce = (smoothstep(0.3f, 1.5f, _e1887.x) * (1f - _e1891.x));
                            let _e1899 = lead_1;
                            let _e1918 = lead_1;
                            lAlb = mix((vec3((0.07f + (0.33f * (1f - exp((-(_e1899.x) / 10f)))))) * vec3<f32>(0.92f, 0.97f, 1f)), vec3<f32>(0.82f, 0.86f, 0.9f), vec3(_e1918.y));
                            let _e1923 = color;
                            let _e1924 = lAlb;
                            let _e1928 = global.uSunE;
                            let _e1929 = sunT;
                            let _e1931 = muS_2;
                            let _e1935 = global.uSunE;
                            let _e1936 = skyE_1;
                            let _e1940 = lIce;
                            color = mix(_e1923, ((_e1924 / vec3(3.1415927f)) * (((_e1928 * _e1929) * max(_e1931, 0f)) + (_e1935 * _e1936))), vec3(_e1940));
                            let _e1943 = albedo;
                            let _e1944 = lAlb;
                            let _e1945 = lIce;
                            albedo = mix(_e1943, _e1944, vec3(_e1945));
                        }
                    }
                    let _e1948 = fl;
                    ice_8 = _e1948.x;
                    let _e1950 = global.uSeason;
                    if (_e1950.z > 0.5f) {
                        let _e1957 = Tair_2;
                        local_86 = smoothstep(-1f, 2f, _e1957);
                    } else {
                        local_86 = 0f;
                    }
                    let _e1961 = local_86;
                    thaw = _e1961;
                    let _e1965 = fl;
                    let _e1967 = dJ;
                    let _e1977 = fl;
                    let _e1980 = fl;
                    let _e1989 = thaw;
                    snowy = ((smoothstep(0.3f, 0.7f, (_e1965.z + ((_e1967.w - 0.5f) * 0.25f))) * (1f - ((0.7f * _e1977.y) / max(_e1980.x, 0.001f)))) * (1f - (0.7f * _e1989)));
                    let _e2002 = snowy;
                    let _e2007 = dI;
                    iceAlb = (mix(vec3<f32>(0.42f, 0.52f, 0.6f), vec3<f32>(0.82f, 0.86f, 0.9f), vec3(_e2002)) * (0.9f + (0.2f * _e2007.x)));
                    let _e2013 = global.uSeason;
                    if (_e2013.z > 0.5f) {
                        let _e2017 = Tair_2;
                        let _e2018 = dJ;
                        let _e2022 = fp_12;
                        let _e2023 = w_9;
                        let _e2025 = tri(_e2022, _e2023, 8f);
                        let _e2030 = meltPond(_e2017, ((_e2018.x * 0.6f) + (_e2025.x * 0.4f)));
                        let _e2034 = ridge_2;
                        local_87 = (_e2030 * (1f - smoothstep(0f, 0.2f, _e2034.w)));
                    } else {
                        local_87 = 0f;
                    }
                    let _e2041 = local_87;
                    pond_1 = _e2041;
                    let _e2043 = iceAlb;
                    let _e2048 = pond_1;
                    iceAlb = mix(_e2043, vec3<f32>(0.12f, 0.32f, 0.45f), vec3(_e2048));
                    let _e2051 = up_4;
                    let _e2052 = N_3;
                    N2_ = normalize(mix(_e2051, _e2052, vec3(0.5f)));
                    let _e2058 = ridge_2;
                    if (_e2058.w > 0f) {
                        {
                            let _e2062 = fp_12;
                            let _e2063 = w_9;
                            let _e2065 = tri(_e2062, _e2063, 2f);
                            blk = _e2065.x;
                            let _e2068 = iceAlb;
                            let _e2079 = blk;
                            let _e2085 = ridge_2;
                            iceAlb = mix(_e2068, mix(vec3<f32>(0.5f, 0.62f, 0.7f), vec3<f32>(0.85f, 0.88f, 0.92f), vec3(smoothstep(0.35f, 0.6f, _e2079))), vec3(smoothstep(0f, 0.2f, _e2085.w)));
                            let _e2090 = N2_;
                            let _e2091 = global.uToFixed;
                            let _e2093 = ridge_2;
                            let _e2100 = ridge_2;
                            N2_ = normalize((_e2090 + (((transpose(_e2091) * _e2093.xyz) * 0.5f) * smoothstep(0f, 0.1f, _e2100.w))));
                        }
                    }
                    let _e2106 = iceAlb;
                    let _e2110 = global.uSunE;
                    let _e2111 = sunT;
                    let _e2113 = N2_;
                    let _e2114 = global.uSunDir;
                    let _e2119 = global.uSunE;
                    let _e2120 = skyE_1;
                    let _e2124 = N2_;
                    let _e2125 = up_4;
                    iceCol = ((_e2106 / vec3(3.1415927f)) * (((_e2110 * _e2111) * max(dot(_e2113, _e2114), 0f)) + ((_e2119 * _e2120) * (0.5f + (0.5f * dot(_e2124, _e2125))))));
                    let _e2133 = N2_;
                    let _e2134 = H_2;
                    NdH2_ = max(dot(_e2133, _e2134), 0f);
                    let _e2139 = iceCol;
                    let _e2140 = global.uSunE;
                    let _e2141 = sunT;
                    let _e2143 = NdH2_;
                    let _e2146 = snowy;
                    let _e2153 = muS_2;
                    iceCol = (_e2139 + ((((_e2140 * _e2141) * pow(_e2143, mix(400f, 40f, _e2146))) * 0.04f) * step(0f, _e2153)));
                    let _e2157 = iceCol;
                    let _e2158 = global.uSunE;
                    let _e2159 = sunT;
                    let _e2161 = up_4;
                    let _e2162 = N2_;
                    let _e2167 = H_2;
                    let _e2176 = pond_1;
                    let _e2179 = muS_2;
                    iceCol = (_e2157 + (((((_e2158 * _e2159) * pow(max(dot(normalize(mix(_e2161, _e2162, vec3(0.2f))), _e2167), 0f), 600f)) * 0.4f) * _e2176) * step(0f, _e2179)));
                    let _e2183 = color;
                    let _e2184 = iceCol;
                    let _e2185 = ice_8;
                    color = mix(_e2183, _e2184, vec3(_e2185));
                    let _e2188 = albedo;
                    let _e2189 = iceAlb;
                    let _e2190 = ice_8;
                    albedo = mix(_e2188, _e2189, vec3(_e2190));
                }
            }
            let _e2193 = fallK;
            if (_e2193 > 0f) {
                {
                    let _e2197 = tsf;
                    let _e2201 = tsf;
                    let _e2205 = tsf;
                    iceF = (1f - smoothstep((_e2197.y - 12f), (_e2201.y - 4f), _e2205.x));
                    let _e2210 = iceF;
                    if (_e2210 > 0f) {
                        {
                            let _e2213 = upF_7;
                            let _e2214 = fn_;
                            let _e2215 = upF_7;
                            let _e2216 = fn_;
                            dnI = (_e2213 - (_e2214 * dot(_e2215, _e2216)));
                            let _e2221 = dnI;
                            let _e2223 = dnI;
                            downI = (-(_e2221) / vec3(max(length(_e2223), 0.0001f)));
                            let _e2230 = fn_;
                            let _e2231 = downI;
                            acrI = normalize(cross(_e2230, _e2231));
                            let _e2235 = vFixedPos_1;
                            let _e2236 = global.uOriginMod;
                            let _e2238 = global.uFallTop;
                            if (_e2238 > 0f) {
                                let _e2241 = global.uFallFoot;
                                local_88 = _e2241;
                            } else {
                                local_88 = vec3(0f);
                            }
                            let _e2245 = local_88;
                            pI = ((_e2235 - _e2236) - _e2245);
                            let _e2248 = pI;
                            let _e2249 = acrI;
                            let _e2251 = pI;
                            let _e2252 = downI;
                            qi = vec2<f32>(dot(_e2248, _e2249), dot(_e2251, _e2252));
                            let _e2256 = qi;
                            let _e2260 = qi;
                            qa_1 = vec2<f32>((_e2256.x * 0.2f), (_e2260.y * 0.015f));
                            let _e2266 = qi;
                            let _e2272 = qi;
                            qb_1 = vec2<f32>(((_e2266.x * 0.6f) + 0.3f), (_e2272.y * 0.04f));
                            let _e2278 = qa_1;
                            let _e2280 = textureSampleLevel(tDetailTexture, tDetailSampler, _e2278, 0f);
                            let _e2284 = qb_1;
                            let _e2286 = textureSampleLevel(tDetailTexture, tDetailSampler, _e2284, 0f);
                            cols = ((_e2280.x * 0.6f) + (_e2286.w * 0.4f));
                            let _e2292 = qa_1;
                            let _e2298 = textureSampleLevel(tDetailTexture, tDetailSampler, (_e2292 + vec2<f32>(0.01f, 0f)), 0f);
                            let _e2302 = qb_1;
                            let _e2308 = textureSampleLevel(tDetailTexture, tDetailSampler, (_e2302 + vec2<f32>(0.03f, 0f)), 0f);
                            colsX = ((_e2298.x * 0.6f) + (_e2308.w * 0.4f));
                            let _e2316 = cols;
                            thick = smoothstep(0.35f, 0.7f, _e2316);
                            let _e2327 = thick;
                            alb = mix(vec3<f32>(0.2f, 0.4f, 0.56f), vec3<f32>(0.88f, 0.93f, 0.97f), vec3(_e2327));
                            let _e2331 = Nw;
                            let _e2332 = global.uToFixed;
                            let _e2334 = acrI;
                            let _e2336 = colsX;
                            let _e2337 = cols;
                            nI = normalize((_e2331 - (((transpose(_e2332) * _e2334) * (_e2336 - _e2337)) * 30f)));
                            let _e2345 = global.uSunE;
                            let _e2346 = sunT;
                            let _e2348 = nI;
                            let _e2349 = global.uSunDir;
                            let _e2354 = global.uSunE;
                            let _e2355 = skyE_1;
                            litI = (((_e2345 * _e2346) * max(dot(_e2348, _e2349), 0f)) + ((_e2354 * _e2355) * 0.7f));
                            let _e2361 = nI;
                            let _e2362 = V_2;
                            let _e2363 = global.uSunDir;
                            spI = (pow(max(dot(_e2361, normalize((_e2362 + _e2363))), 0f), 60f) * 0.6f);
                            let _e2374 = color;
                            let _e2375 = alb;
                            let _e2379 = litI;
                            let _e2381 = global.uSunE;
                            let _e2382 = sunT;
                            let _e2384 = spI;
                            let _e2387 = muS_2;
                            let _e2391 = fallK;
                            let _e2392 = iceF;
                            color = mix(_e2374, (((_e2375 / vec3(3.1415927f)) * _e2379) + (((_e2381 * _e2382) * _e2384) * step(0f, _e2387))), vec3((_e2391 * _e2392)));
                        }
                    }
                }
            }
            let _e2396 = global.uDebug;
            if (_e2396 > 6.5f) {
                let _e2399 = fallK;
                let _e2400 = dbgWhite;
                let _e2401 = river_3;
                if _e2401 {
                    local_89 = 1f;
                } else {
                    local_89 = 0f;
                }
                let _e2405 = local_89;
                local_94 = vec3<f32>(_e2399, _e2400, _e2405);
            } else {
                let _e2407 = global.uDebug;
                if (_e2407 < 2.5f) {
                    let _e2410 = ice_8;
                    local_93 = vec3(_e2410);
                } else {
                    let _e2412 = global.uDebug;
                    if (_e2412 < 3.5f) {
                        let _e2415 = Tm_2;
                        local_92 = vec3((_e2415 / 40f));
                    } else {
                        let _e2419 = global.uDebug;
                        if (_e2419 < 4.5f) {
                            let _e2422 = foam_2;
                            local_91 = vec3(_e2422);
                        } else {
                            let _e2424 = global.uDebug;
                            if (_e2424 < 5.5f) {
                                let _e2427 = vLiq_1;
                                local_90 = _e2427.xyz;
                            } else {
                                let _e2429 = wr;
                                local_90 = vec3((_e2429 * 4f));
                            }
                            let _e2434 = local_90;
                            local_91 = _e2434;
                        }
                        let _e2436 = local_91;
                        local_92 = _e2436;
                    }
                    let _e2438 = local_92;
                    local_93 = _e2438;
                }
                let _e2440 = local_93;
                local_94 = _e2440;
            }
            let _e2442 = local_94;
            dbgW = _e2442;
        }
    }
    let _e2443 = global.uThermal;
    if (_e2443.x > 0f) {
        {
            let _e2447 = albedo;
            a_15 = clamp(_e2447, vec3(0f), vec3(1f));
            let _e2454 = color;
            let _e2457 = a_15;
            let _e2459 = global.uThermal;
            let _e2461 = global.uThermal;
            let _e2463 = r_10;
            let _e2464 = global.uRadius;
            let _e2468 = blackbodyGlow((_e2459.x - (_e2461.y * (_e2463 - _e2464))));
            color = (_e2454 + ((vec3(1f) - _e2457) * _e2468));
            let _e2471 = color;
            let _e2472 = a_15;
            let _e2475 = r_10;
            let _e2477 = atmoSunTransmittance(_e2475, 1f);
            let _e2480 = global.uThermal;
            let _e2482 = global.uThermal;
            let _e2484 = r_10;
            let _e2485 = global.uRadius;
            let _e2491 = blackbodyGlow((_e2480.x - (_e2482.z * max((_e2484 - _e2485), 0f))));
            color = (_e2471 + ((_e2472 * (vec3(1f) - _e2477)) * _e2491));
        }
    }
    let _e2494 = emissive;
    if (_e2494 > 0.01f) {
        {
            let _e2499 = global.uTime;
            let _e2502 = vFixedPos_1;
            let _e2507 = vFixedPos_1;
            flick = (0.85f + (0.15f * sin((((_e2499 * 1.7f) + (_e2502.x * 0.05f)) + (_e2507.z * 0.07f)))));
            let _e2518 = fp_12;
            let _e2519 = w_9;
            let _e2521 = tri(_e2518, _e2519, 128f);
            crust = smoothstep(0.35f, 0.65f, _e2521.w);
            let _e2525 = color;
            let _e2526 = global.uLavaColor;
            let _e2527 = emissive;
            let _e2529 = flick;
            let _e2533 = crust;
            let _e2535 = emissive;
            color = (_e2525 + (((_e2526 * _e2527) * _e2529) * mix(1f, 0.15f, (_e2533 * (1f - (_e2535 * 0.5f))))));
        }
    }
    let _e2543 = global.uDebug;
    if (_e2543 > 1.5f) {
        let _e2546 = dbgW;
        if (_e2546.x < 0f) {
            let _e2554 = waterEnc;
            local_95 = ((vec3<f32>(0.5f, 0f, 0.5f) * _e2554) * 50f);
        } else {
            let _e2558 = dbgW;
            local_95 = _e2558;
        }
        let _e2560 = local_95;
        let _e2561 = global.uDebug;
        if (_e2561 > 7.5f) {
            local_96 = 0.02f;
        } else {
            local_96 = 1f;
        }
        let _e2567 = local_96;
        color = (_e2560 * _e2567);
    } else {
        let _e2569 = global.uDebug;
        if (_e2569 > 0.5f) {
            let _e2572 = color;
            let _e2573 = vMorphK_1;
            let _e2575 = vMorphK_1;
            color = mix(_e2572, (vec3<f32>(_e2573, (1f - _e2575), 0f) * 0.2f), vec3(0.5f));
        }
    }
    let _e2584 = color;
    fragmentColor = vec4<f32>(_e2584.x, _e2584.y, _e2584.z, 1f);
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
