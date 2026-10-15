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

fn colourCubeAt(d_5: vec3<f32>) -> vec4<f32> {
    var d_6: vec3<f32>;
    var a_3: vec3<f32>;
    var N: vec3<f32>;
    var U_1: vec3<f32>;
    var V: vec3<f32>;
    var f_4: f32;
    var dn_1: f32;
    var uv_6: vec2<f32>;
    var h_1: vec2<f32>;

    d_6 = d_5;
    let _e180 = d_6;
    a_3 = abs(_e180);
    let _e187 = a_3;
    let _e189 = a_3;
    let _e192 = a_3;
    let _e194 = a_3;
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
        let _e226 = a_3;
        let _e228 = a_3;
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
    var i_5: i32 = 0i;
    var K: vec4<f32>;
    var kk: f32;
    var lam: f32;
    var fk: f32;
    var kt: vec3<f32>;
    var ktl: f32;
    var kd: vec3<f32>;
    var local_16: f32;
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
        let _e206 = i_5;
        if !((_e206 < 36i)) {
            break;
        }
        {
            let _e213 = i_5;
            let _e215 = global.uWaveK[_e213];
            K = _e215;
            let _e217 = K;
            kk = length(_e217.xyz);
            let _e222 = kk;
            lam = (6.2832f / _e222);
            let _e226 = lmax_1;
            let _e229 = lmax_1;
            let _e232 = lam;
            let _e236 = global.uLiquid;
            let _e240 = global.uLiquid;
            let _e244 = lam;
            fk = ((1f - smoothstep((_e226 * 0.7f), (_e229 * 1.3f), _e232)) * (1f - smoothstep((_e236.w * 1.2f), (_e240.w * 2.2f), _e244)));
            let _e249 = fk;
            if (_e249 <= 0f) {
                continue;
            }
            let _e252 = K;
            let _e254 = n_7;
            let _e255 = K;
            let _e257 = n_7;
            kt = (_e252.xyz - (_e254 * dot(_e255.xyz, _e257)));
            let _e262 = kt;
            ktl = length(_e262);
            let _e265 = ktl;
            if (_e265 < 0.000001f) {
                continue;
            }
            let _e268 = kt;
            let _e269 = ktl;
            kd = (_e268 / vec3(_e269));
            let _e273 = river_1;
            if _e273 {
                local_16 = 1f;
            } else {
                let _e277 = kd;
                let _e278 = wd_1;
                local_16 = (0.2f + (1.2f * pow(max(dot(_e277, _e278), 0f), 2f)));
            }
            let _e287 = local_16;
            dirW = _e287;
            let _e289 = fk;
            let _e290 = dirW;
            let _e292 = ktl;
            let _e293 = kk;
            wt0_ = ((_e289 * _e290) * (_e292 / _e293));
            let _e297 = wt0_;
            let _e300 = i_5;
            let _e306 = grp_1[((_e300 / 3i) & 3i)];
            wt = (_e297 * (0.3f + (1.4f * _e306)));
            let _e312 = foot_9;
            let _e315 = foot_9;
            let _e317 = lam;
            res = smoothstep((2f * _e312), (6f * _e315), _e317);
            let _e320 = K;
            let _e322 = fp_1;
            let _e323 = warp_1;
            let _e326 = K;
            ph_1 = (dot(_e320.xyz, (_e322 + _e323)) - _e326.w);
            let _e330 = K;
            Ke = (floor(((_e330.yzx * 228.1645f) + vec3(0.5f))) * 0.001533981f);
            let _e345 = Ke;
            let _e346 = fp_1;
            let _e347 = warp_1;
            let _e351 = K;
            let _e355 = i_5;
            env = (0.6f + (0.4f * sin(((dot(_e345, (_e346 + _e347)) - (0.17f * _e351.w)) + (f32(_e355) * 1.7f)))));
            let _e365 = W;
            let _e367 = kd;
            let _e368 = wt;
            let _e369 = res;
            let _e371 = env;
            let _e373 = ph_1;
            W.g = (_e365.g + (_e367 * (((_e368 * _e369) * _e371) * cos(_e373))));
            let _e379 = W;
            let _e381 = wt;
            let _e382 = wt;
            W.var_ = (_e379.var_ + ((_e381 * _e382) * 0.22f));
            let _e388 = W;
            let _e390 = wt0_;
            let _e391 = wt0_;
            W.var0_ = (_e388.var0_ + ((_e390 * _e391) * 0.22f));
            let _e397 = W;
            let _e399 = wt;
            let _e400 = wt;
            let _e404 = res;
            W.res = (_e397.res + (((_e399 * _e400) * 0.22f) * _e404));
            let _e408 = W;
            let _e410 = wt;
            let _e411 = res;
            let _e413 = env;
            let _e415 = ph_1;
            W.crest = (_e408.crest + (((_e410 * _e411) * _e413) * sin(_e415)));
            let _e419 = rv;
            let _e420 = wt;
            let _e421 = wt;
            let _e425 = res;
            let _e427 = res;
            rv = (_e419 + ((((_e420 * _e421) * 0.22f) * _e425) * _e427));
        }
        continuing {
            let _e210 = i_5;
            i_5 = (_e210 + 1i);
        }
    }
    let _e431 = W;
    let _e433 = rv;
    W.crest = (_e431.crest / sqrt(max(_e433, 0.000000001f)));
    let _e438 = W;
    return _e438;
}

fn liqHash(c_2: vec2<f32>) -> f32 {
    var c_3: vec2<f32>;
    var q_3: vec2<u32>;
    var h_2: u32;

    c_3 = c_2;
    let _e180 = c_3;
    q_3 = vec2<u32>((vec2<i32>(_e180) + vec2(1048576i)));
    let _e187 = q_3;
    let _e191 = q_3;
    h_2 = ((_e187.x * 1597334677u) ^ (_e191.y * 3812015801u));
    let _e197 = h_2;
    h_2 = ((_e197 * 747796405u) + 2891336453u);
    let _e202 = h_2;
    let _e203 = h_2;
    h_2 = (_e202 ^ (_e203 >> 16u));
    let _e208 = h_2;
    h_2 = (_e208 * 2246822519u);
    let _e211 = h_2;
    let _e212 = h_2;
    h_2 = (_e211 ^ (_e212 >> 13u));
    let _e217 = h_2;
    return ((f32((_e217 & 7u)) * 0.7854f) + 0.3927f);
}

fn rippleNoise(p: vec2<f32>, per: f32) -> vec3<f32> {
    var p_1: vec2<f32>;
    var per_1: f32;
    var i_6: vec2<f32>;
    var f_5: vec2<f32>;
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
    let _e182 = p_1;
    i_6 = floor(_e182);
    let _e185 = p_1;
    let _e186 = i_6;
    f_5 = (_e185 - _e186);
    let _e189 = i_6;
    let _e192 = (_e189 + vec2(1f));
    let _e193 = per_1;
    let _e194 = vec2(_e193);
    i1_ = (_e192 - (floor((_e192 / _e194)) * _e194));
    let _e200 = i_6;
    let _e201 = per_1;
    let _e202 = vec2(_e201);
    i_6 = (_e200 - (floor((_e200 / _e202)) * _e202));
    let _e207 = f_5;
    let _e208 = f_5;
    let _e210 = f_5;
    let _e212 = f_5;
    let _e213 = f_5;
    u_1 = (((_e207 * _e208) * _e210) * ((_e212 * ((_e213 * 6f) - vec2(15f))) + vec2(10f)));
    let _e226 = f_5;
    let _e228 = f_5;
    let _e230 = f_5;
    let _e231 = f_5;
    du = (((30f * _e226) * _e228) * ((_e230 * (_e231 - vec2(2f))) + vec2(1f)));
    let _e241 = i_6;
    let _e242 = liqHash(_e241);
    ha = _e242;
    let _e244 = i1_;
    let _e246 = i_6;
    let _e249 = liqHash(vec2<f32>(_e244.x, _e246.y));
    hb = _e249;
    let _e251 = i_6;
    let _e253 = i1_;
    let _e256 = liqHash(vec2<f32>(_e251.x, _e253.y));
    hc_1 = _e256;
    let _e258 = i1_;
    let _e259 = liqHash(_e258);
    hd = _e259;
    let _e261 = ha;
    let _e263 = ha;
    ga = vec2<f32>(cos(_e261), sin(_e263));
    let _e267 = hb;
    let _e269 = hb;
    gb = vec2<f32>(cos(_e267), sin(_e269));
    let _e273 = hc_1;
    let _e275 = hc_1;
    gc = vec2<f32>(cos(_e273), sin(_e275));
    let _e279 = hd;
    let _e281 = hd;
    gd = vec2<f32>(cos(_e279), sin(_e281));
    let _e285 = ga;
    let _e286 = f_5;
    va = dot(_e285, _e286);
    let _e289 = gb;
    let _e290 = f_5;
    vb = dot(_e289, (_e290 - vec2<f32>(1f, 0f)));
    let _e297 = gc;
    let _e298 = f_5;
    vc = dot(_e297, (_e298 - vec2<f32>(0f, 1f)));
    let _e305 = gd;
    let _e306 = f_5;
    vd = dot(_e305, (_e306 - vec2(1f)));
    let _e312 = va;
    let _e313 = vb;
    let _e315 = vc;
    let _e317 = vd;
    k = (((_e312 - _e313) - _e315) + _e317);
    let _e320 = va;
    let _e321 = u_1;
    let _e323 = vb;
    let _e324 = va;
    let _e328 = u_1;
    let _e330 = vc;
    let _e331 = va;
    let _e335 = u_1;
    let _e337 = u_1;
    let _e340 = k;
    let _e343 = ga;
    let _e344 = u_1;
    let _e346 = gb;
    let _e347 = ga;
    let _e351 = u_1;
    let _e353 = gc;
    let _e354 = ga;
    let _e358 = u_1;
    let _e360 = u_1;
    let _e363 = ga;
    let _e364 = gb;
    let _e366 = gc;
    let _e368 = gd;
    let _e372 = du;
    let _e373 = u_1;
    let _e375 = k;
    let _e377 = vb;
    let _e378 = vc;
    let _e381 = va;
    let _e385 = ((((_e343 + (_e344.x * (_e346 - _e347))) + (_e351.y * (_e353 - _e354))) + ((_e358.x * _e360.y) * (((_e363 - _e364) - _e366) + _e368))) + (_e372 * (((_e373.yx * _e375) + vec2<f32>(_e377, _e378)) - vec2(_e381))));
    return vec3<f32>((((_e320 + (_e321.x * (_e323 - _e324))) + (_e328.y * (_e330 - _e331))) + ((_e335.x * _e337.y) * _e340)), _e385.x, _e385.y);
}

fn rippleAxis(a_4: i32, p_2: vec3<f32>, L_4: f32, o_1: f32) -> vec3<f32> {
    var a_5: i32;
    var p_3: vec3<f32>;
    var L_5: f32;
    var o_2: f32;
    var local_17: vec2<f32>;
    var local_18: vec2<f32>;
    var uv_8: vec2<f32>;
    var r_8: vec3<f32>;

    a_5 = a_4;
    p_3 = p_2;
    L_5 = L_4;
    o_2 = o_1;
    let _e186 = a_5;
    if (_e186 == 0i) {
        let _e189 = p_3;
        local_18 = _e189.zy;
    } else {
        let _e191 = a_5;
        if (_e191 == 1i) {
            let _e194 = p_3;
            local_17 = _e194.xz;
        } else {
            let _e196 = p_3;
            local_17 = _e196.xy;
        }
        let _e199 = local_17;
        local_18 = _e199;
    }
    let _e201 = local_18;
    uv_8 = _e201;
    let _e203 = uv_8;
    let _e204 = L_5;
    let _e207 = o_2;
    let _e211 = L_5;
    let _e213 = rippleNoise(((_e203 / vec2(_e204)) + vec2(_e207)), (4096f / _e211));
    r_8 = _e213;
    let _e215 = r_8;
    let _e217 = r_8;
    let _e218 = _e217.yz;
    return vec3<f32>(_e215.x, _e218.x, _e218.y);
}

fn riverRipples(fp_2: vec3<f32>, n_8: vec3<f32>, lmax_2: f32, foot_10: f32) -> Waves {
    var fp_3: vec3<f32>;
    var n_9: vec3<f32>;
    var lmax_3: f32;
    var foot_11: f32;
    var W_1: Waves = Waves(vec3(0f), 0f, 0f, 0f, 0f);
    var an: vec3<f32>;
    var local_19: i32;
    var local_20: i32;
    var ma: i32;
    var local_21: i32;
    var local_22: i32;
    var mi: i32;
    var me: i32;
    var local_23: f32;
    var local_24: f32;
    var w0_1: f32;
    var local_25: f32;
    var local_26: f32;
    var w1_1: f32;
    var bw: vec2<f32>;
    var local_27: vec2<f32>;
    var rv_1: f32 = 0f;
    var cr: f32 = 0f;
    var o_3: i32 = 0i;
    var L_6: f32;
    var fk_1: f32;
    var res_1: f32;
    var g_3: vec3<f32>;
    var v: f32;
    var k_1: i32;
    var local_28: i32;
    var a_6: i32;
    var local_29: f32;
    var bwk: f32;
    var r_9: vec3<f32>;
    var local_30: vec3<f32>;
    var local_31: vec3<f32>;

    fp_3 = fp_2;
    n_9 = n_8;
    lmax_3 = lmax_2;
    foot_11 = foot_10;
    let _e194 = n_9;
    an = abs(_e194);
    let _e197 = an;
    let _e199 = an;
    let _e202 = an;
    let _e204 = an;
    if ((_e197.x > _e199.y) && (_e202.x > _e204.z)) {
        local_20 = 0i;
    } else {
        let _e209 = an;
        let _e211 = an;
        if (_e209.y > _e211.z) {
            local_19 = 1i;
        } else {
            local_19 = 2i;
        }
        let _e217 = local_19;
        local_20 = _e217;
    }
    let _e219 = local_20;
    ma = _e219;
    let _e221 = an;
    let _e223 = an;
    let _e226 = an;
    let _e228 = an;
    if ((_e221.x < _e223.y) && (_e226.x < _e228.z)) {
        local_22 = 0i;
    } else {
        let _e233 = an;
        let _e235 = an;
        if (_e233.y < _e235.z) {
            local_21 = 1i;
        } else {
            local_21 = 2i;
        }
        let _e241 = local_21;
        local_22 = _e241;
    }
    let _e243 = local_22;
    mi = _e243;
    let _e246 = mi;
    let _e248 = ma;
    me = ((3i - _e246) - _e248);
    let _e251 = ma;
    if (_e251 == 0i) {
        let _e254 = an;
        local_24 = _e254.x;
    } else {
        let _e256 = ma;
        if (_e256 == 1i) {
            let _e259 = an;
            local_23 = _e259.y;
        } else {
            let _e261 = an;
            local_23 = _e261.z;
        }
        let _e264 = local_23;
        local_24 = _e264;
    }
    let _e266 = local_24;
    w0_1 = _e266;
    let _e268 = me;
    if (_e268 == 0i) {
        let _e271 = an;
        local_26 = _e271.x;
    } else {
        let _e273 = me;
        if (_e273 == 1i) {
            let _e276 = an;
            local_25 = _e276.y;
        } else {
            let _e278 = an;
            local_25 = _e278.z;
        }
        let _e281 = local_25;
        local_26 = _e281;
    }
    let _e283 = local_26;
    w1_1 = _e283;
    let _e285 = w0_1;
    let _e286 = w1_1;
    bw = clamp(((vec2<f32>(_e285, _e286) - vec2(0.5773f)) / vec2(0.4227f)), vec2(0f), vec2(1f));
    let _e302 = bw;
    let _e304 = bw;
    if ((_e302.x + _e304.y) < 0.0001f) {
        local_27 = vec2<f32>(1f, 0f);
    } else {
        let _e312 = bw;
        let _e313 = bw;
        let _e315 = bw;
        local_27 = (_e312 / vec2((_e313.x + _e315.y)));
    }
    let _e321 = local_27;
    bw = _e321;
    let _e322 = bw;
    if (_e322.y < 0.02f) {
        bw = vec2<f32>(1f, 0f);
    }
    loop {
        let _e335 = o_3;
        if !((_e335 < 4i)) {
            break;
        }
        {
            let _e343 = o_3;
            L_6 = (0.25f * exp2(f32(_e343)));
            let _e349 = lmax_3;
            let _e352 = lmax_3;
            let _e355 = L_6;
            fk_1 = (1f - smoothstep((_e349 * 0.3f), (_e352 * 0.6f), _e355));
            let _e359 = fk_1;
            if (_e359 <= 0f) {
                continue;
            }
            let _e362 = foot_11;
            let _e364 = foot_11;
            let _e366 = L_6;
            res_1 = smoothstep(_e362, (3f * _e364), _e366);
            g_3 = vec3(0f);
            v = 0f;
            k_1 = 0i;
            loop {
                let _e376 = k_1;
                if !((_e376 < 2i)) {
                    break;
                }
                {
                    let _e383 = k_1;
                    if (_e383 == 0i) {
                        let _e386 = ma;
                        local_28 = _e386;
                    } else {
                        let _e387 = me;
                        local_28 = _e387;
                    }
                    let _e389 = local_28;
                    a_6 = _e389;
                    let _e391 = k_1;
                    if (_e391 == 0i) {
                        let _e394 = bw;
                        local_29 = _e394.x;
                    } else {
                        let _e396 = bw;
                        local_29 = _e396.y;
                    }
                    let _e399 = local_29;
                    bwk = _e399;
                    let _e401 = bwk;
                    if (_e401 <= 0f) {
                        continue;
                    }
                    let _e404 = a_6;
                    let _e405 = fp_3;
                    let _e406 = L_6;
                    let _e407 = o_3;
                    let _e411 = rippleAxis(_e404, _e405, _e406, (f32(_e407) * 17.31f));
                    r_9 = _e411;
                    let _e413 = g_3;
                    let _e414 = bwk;
                    let _e415 = a_6;
                    if (_e415 == 0i) {
                        let _e419 = r_9;
                        let _e421 = r_9;
                        local_31 = vec3<f32>(0f, _e419.z, _e421.y);
                    } else {
                        let _e424 = a_6;
                        if (_e424 == 1i) {
                            let _e427 = r_9;
                            let _e430 = r_9;
                            local_30 = vec3<f32>(_e427.y, 0f, _e430.z);
                        } else {
                            let _e433 = r_9;
                            let _e435 = r_9;
                            local_30 = vec3<f32>(_e433.y, _e435.z, 0f);
                        }
                        let _e440 = local_30;
                        local_31 = _e440;
                    }
                    let _e442 = local_31;
                    g_3 = (_e413 + (_e414 * _e442));
                    let _e445 = v;
                    let _e446 = bwk;
                    let _e447 = r_9;
                    v = (_e445 + (_e446 * _e447.x));
                }
                continuing {
                    let _e380 = k_1;
                    k_1 = (_e380 + 1i);
                }
            }
            let _e451 = g_3;
            let _e452 = n_9;
            let _e453 = g_3;
            let _e454 = n_9;
            g_3 = (_e451 - (_e452 * dot(_e453, _e454)));
            let _e459 = W_1;
            let _e461 = g_3;
            let _e462 = fk_1;
            let _e463 = res_1;
            W_1.g = (_e459.g + (_e461 * (_e462 * _e463)));
            let _e468 = W_1;
            let _e470 = fk_1;
            let _e471 = fk_1;
            W_1.var_ = (_e468.var_ + ((_e470 * _e471) * 0.78f));
            let _e477 = W_1;
            let _e479 = fk_1;
            let _e480 = fk_1;
            let _e484 = res_1;
            W_1.res = (_e477.res + (((_e479 * _e480) * 0.78f) * _e484));
            let _e488 = W_1;
            let _e490 = fk_1;
            let _e491 = res_1;
            let _e493 = v;
            W_1.crest = (_e488.crest + (((_e490 * _e491) * _e493) / 0.216f));
            let _e498 = rv_1;
            let _e499 = fk_1;
            let _e500 = fk_1;
            let _e502 = res_1;
            let _e504 = res_1;
            rv_1 = (_e498 + (((_e499 * _e500) * _e502) * _e504));
        }
        continuing {
            let _e339 = o_3;
            o_3 = (_e339 + 1i);
        }
    }
    let _e508 = W_1;
    W_1.var0_ = _e508.var_;
    let _e511 = W_1;
    let _e513 = rv_1;
    W_1.crest = (_e511.crest / sqrt(max(_e513, 0.000000001f)));
    let _e518 = W_1;
    return _e518;
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
    var local_32: f32;
    var local_33: f32;
    var local_34: f32;
    var strength: f32;
    var east_1: vec3<f32>;
    var local_35: vec3<f32>;
    var wd_2: vec3<f32>;
    var river_2: bool;
    var pond: bool;
    var sea: bool;
    var local_36: vec3<f32>;
    var e1_: vec3<f32>;
    var e2_: vec3<f32>;
    var warp_2: vec3<f32>;
    var local_37: f32;
    var U_2: f32;
    var local_38: f32;
    var Fr: f32;
    var local_39: f32;
    var local_40: f32;
    var local_41: f32;
    var s2_: f32;
    var local_42: f32;
    var local_43: f32;
    var local_44: f32;
    var lmax_4: f32;
    var W_2: Waves;
    var fd: vec3<f32>;
    var local_45: vec3<f32>;
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
    var q_4: vec2<f32>;
    var qa: vec2<f32>;
    var qb: vec2<f32>;
    var na: f32;
    var nb: f32;
    var th: f32;
    var q_5: vec2<f32>;
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
    let _e205 = upF_4;
    al_1 = abs(asin(clamp(_e205.y, -1f, 1f)));
    let _e214 = upF_4;
    let _e215 = windSense(_e214);
    toward = _e215;
    let _e217 = al_1;
    if (_e217 < 0.09f) {
        local_34 = 0.45f;
    } else {
        let _e221 = al_1;
        if (_e221 < 0.52f) {
            local_33 = 0.9f;
        } else {
            let _e225 = al_1;
            if (_e225 < 1.05f) {
                local_32 = 1.25f;
            } else {
                local_32 = 0.8f;
            }
            let _e231 = local_32;
            local_33 = _e231;
        }
        let _e233 = local_33;
        local_34 = _e233;
    }
    let _e235 = local_34;
    strength = _e235;
    let _e241 = upF_4;
    east_1 = cross(vec3<f32>(0f, 1f, 0f), _e241);
    let _e244 = east_1;
    if (length(_e244) > 0.0001f) {
        let _e248 = east_1;
        let _e250 = toward;
        local_35 = (normalize(_e248) * sign((_e250 + 0.001f)));
    } else {
        local_35 = vec3<f32>(1f, 0f, 0f);
    }
    let _e260 = local_35;
    wd_2 = _e260;
    let _e262 = kind_1;
    let _e265 = kind_1;
    river_2 = ((_e262 > 0.55f) && (_e265 < 0.85f));
    let _e270 = kind_1;
    pond = (_e270 > 0.85f);
    let _e274 = kind_1;
    sea = (_e274 < 0.2f);
    let _e278 = east_1;
    if (length(_e278) > 0.0001f) {
        let _e282 = east_1;
        local_36 = normalize(_e282);
    } else {
        local_36 = vec3<f32>(1f, 0f, 0f);
    }
    let _e289 = local_36;
    e1_ = _e289;
    let _e291 = upF_4;
    let _e292 = e1_;
    e2_ = cross(_e291, _e292);
    let _e295 = e1_;
    let _e296 = wn_1;
    let _e299 = e2_;
    let _e300 = wn_1;
    let _e306 = global.uLiquid;
    warp_2 = ((((_e295 * _e296.x) + (_e299 * _e300.y)) * 0.12f) * _e306.w);
    let _e310 = global.uLiquid;
    let _e312 = strength;
    let _e314 = sea;
    if _e314 {
        local_37 = 1f;
    } else {
        let _e318 = fetch_1;
        local_37 = mix(0.3f, 1f, _e318);
    }
    let _e321 = local_37;
    U_2 = ((_e310.y * _e312) * _e321);
    let _e324 = river_2;
    if _e324 {
        let _e325 = fv_1;
        let _e326 = global.uLiquid2_;
        let _e328 = depth_1;
        local_38 = (_e325 / sqrt((_e326.x * max(_e328, 0.3f))));
    } else {
        local_38 = 0f;
    }
    let _e336 = local_38;
    Fr = _e336;
    let _e338 = sea;
    if _e338 {
        let _e341 = U_2;
        let _e345 = U_2;
        local_41 = ((0.003f * step(0.01f, _e341)) + (0.00512f * _e345));
    } else {
        let _e348 = pond;
        if _e348 {
            let _e351 = U_2;
            local_40 = (0.0003f + (0.0003f * _e351));
        } else {
            let _e354 = river_2;
            if _e354 {
                let _e357 = Fr;
                let _e358 = Fr;
                let _e365 = U_2;
                local_39 = ((0.0012f + (0.035f * min((_e357 * _e358), 2f))) + (0.0015f * _e365));
            } else {
                let _e370 = U_2;
                local_39 = (0.001f + (0.00512f * _e370));
            }
            let _e374 = local_39;
            local_40 = _e374;
        }
        let _e376 = local_40;
        local_41 = _e376;
    }
    let _e378 = local_41;
    s2_ = _e378;
    let _e380 = s2_;
    let _e381 = global.uLiquid;
    s2_ = (_e380 * _e381.z);
    let _e384 = sea;
    if _e384 {
        local_44 = 1000000000f;
    } else {
        let _e386 = river_2;
        if _e386 {
            let _e388 = fv_1;
            let _e390 = fv_1;
            let _e392 = global.uLiquid2_;
            let _e395 = depth_1;
            local_43 = clamp(((((6.2832f * _e388) * _e390) / _e392.x) + _e395), 0.6f, 8f);
        } else {
            let _e400 = pond;
            if _e400 {
                local_42 = 1f;
            } else {
                let _e404 = fetch_1;
                local_42 = (25f + (400f * _e404));
            }
            let _e408 = local_42;
            local_43 = _e408;
        }
        let _e410 = local_43;
        local_44 = _e410;
    }
    let _e412 = local_44;
    lmax_4 = _e412;
    let _e415 = fdir_1;
    let _e416 = upF_4;
    let _e417 = fdir_1;
    let _e418 = upF_4;
    fd = (_e415 - (_e416 * dot(_e417, _e418)));
    let _e423 = fd;
    if (length(_e423) > 0.05f) {
        let _e427 = fd;
        local_45 = normalize(_e427);
    } else {
        local_45 = vec3(0f);
    }
    let _e432 = local_45;
    fd = _e432;
    let _e433 = global.uTime;
    ta = fract((_e433 / 3f));
    let _e438 = global.uTime;
    tb = fract(((_e438 / 3f) + 0.5f));
    let _e447 = ta;
    wa_1 = (1f - abs(((2f * _e447) - 1f)));
    let _e454 = river_2;
    if _e454 {
        {
            let _e455 = fp_5;
            let _e456 = fd;
            let _e457 = fv_1;
            let _e461 = ta;
            let _e464 = n_11;
            let _e465 = lmax_4;
            let _e466 = foot_13;
            let _e467 = riverRipples((_e455 - (((_e456 * _e457) * 3f) * _e461)), _e464, _e465, _e466);
            A = _e467;
            let _e469 = fp_5;
            let _e470 = fd;
            let _e471 = fv_1;
            let _e475 = tb;
            let _e481 = n_11;
            let _e482 = lmax_4;
            let _e483 = foot_13;
            let _e484 = riverRipples(((_e469 - (((_e470 * _e471) * 3f) * _e475)) + vec3(0.37f)), _e481, _e482, _e483);
            B = _e484;
            let _e486 = A;
            W_2 = _e486;
            let _e488 = A;
            let _e490 = wa_1;
            let _e492 = B;
            let _e495 = wa_1;
            W_2.g = ((_e488.g * _e490) + (_e492.g * (1f - _e495)));
            let _e500 = A;
            let _e502 = wa_1;
            let _e504 = B;
            let _e507 = wa_1;
            W_2.crest = ((_e500.crest * _e502) + (_e504.crest * (1f - _e507)));
        }
    } else {
        let _e511 = fp_5;
        let _e512 = n_11;
        let _e513 = wd_2;
        let _e514 = lmax_4;
        let _e516 = foot_13;
        let _e517 = warp_2;
        let _e518 = grp_3;
        let _e519 = liquidWaves(_e511, _e512, _e513, _e514, false, _e516, _e517, _e518);
        W_2 = _e519;
    }
    let _e520 = s2_;
    let _e521 = W_2;
    sc = sqrt((_e520 / max(_e521.var0_, 0.000000001f)));
    let _e528 = n_11;
    let _e529 = W_2;
    let _e531 = sc;
    (*nF) = normalize((_e528 - (_e529.g * _e531)));
    let _e536 = W_2;
    let _e538 = W_2;
    let _e545 = sc;
    (*rough) = clamp((sqrt((2f * max((_e536.var_ - _e538.res), 0f))) * _e545), 0.02f, 0.6f);
    let _e551 = U_2;
    cov = clamp((0.00000384f * pow(_e551, 3.41f)), 0f, 0.3f);
    (*foam) = 0f;
    let _e560 = river_2;
    let _e562 = pond;
    let _e565 = cov;
    if ((!(_e560) && !(_e562)) && (_e565 > 0.0001f)) {
        {
            let _e571 = cov;
            t_2 = sqrt((-2f * log(_e571)));
            let _e576 = t_2;
            let _e579 = t_2;
            let _e583 = t_2;
            let _e585 = t_2;
            let _e590 = t_2;
            let _e594 = t_2;
            let _e596 = t_2;
            let _e600 = t_2;
            let _e602 = t_2;
            let _e604 = t_2;
            z = (_e576 - (((2.515517f + (0.802853f * _e579)) + ((0.010328f * _e583) * _e585)) / (((1f + (1.432788f * _e590)) + ((0.189269f * _e594) * _e596)) + (((0.001308f * _e600) * _e602) * _e604))));
            let _e610 = W_2;
            let _e612 = W_2;
            rk = (_e610.res / max(_e612.var_, 0.000000001f));
            let _e618 = cov;
            let _e619 = z;
            let _e622 = z;
            let _e625 = W_2;
            let _e628 = rk;
            (*foam) = (mix(_e618, smoothstep((_e619 - 0.25f), (_e622 + 0.35f), _e625.crest), _e628) * 0.9f);
        }
    }
    let _e632 = river_2;
    let _e634 = pond;
    let _e637 = depth_1;
    if ((!(_e632) && !(_e634)) && (_e637 < 1.6f)) {
        {
            let _e644 = depth_1;
            let _e648 = global.uTime;
            sw = (0.5f + (0.5f * sin((((6.2832f * _e644) / 0.4f) + (_e648 * 1.3f)))));
            let _e658 = grp_3;
            let _e661 = W_2;
            lace = smoothstep(0.2f, 0.8f, (_e658.x + (0.2f * _e661.crest)));
            let _e670 = depth_1;
            let _e675 = sw;
            let _e678 = lace;
            let _e683 = depth_1;
            let _e688 = lace;
            sh_2 = ((((1f - smoothstep(0.05f, 1.6f, _e670)) * smoothstep(0.75f, 0.97f, _e675)) * _e678) + ((1f - smoothstep(0f, 0.15f, _e683)) * (0.4f + (0.6f * _e688))));
            let _e694 = (*foam);
            let _e695 = sh_2;
            let _e701 = U_2;
            (*foam) = max(_e694, ((clamp(_e695, 0f, 1f) * smoothstep(0.5f, 4f, _e701)) * 0.75f));
        }
    }
    let _e707 = river_2;
    let _e708 = fd;
    if (_e707 && (length(_e708) > 0f)) {
        {
            let _e713 = upF_4;
            let _e714 = fd;
            ac = cross(_e713, _e714);
            let _e717 = Fr;
            cov_1 = clamp(((_e717 - 0.6f) / 0.9f), 0f, 1f);
            let _e726 = cov_1;
            let _e727 = cov_1;
            cov_1 = (_e726 * _e727);
            let _e729 = cov_1;
            if (_e729 > 0f) {
                {
                    let _e732 = fp_5;
                    let _e733 = ac;
                    let _e737 = fp_5;
                    let _e738 = fd;
                    q_4 = vec2<f32>((dot(_e732, _e733) * 0.15f), (dot(_e737, _e738) * 0.04f));
                    let _e744 = q_4;
                    let _e746 = fv_1;
                    let _e749 = ta;
                    qa = (_e744 - vec2<f32>(0f, (((_e746 * 3f) * _e749) * 0.04f)));
                    let _e756 = q_4;
                    let _e762 = fv_1;
                    let _e765 = tb;
                    qb = ((_e756 + vec2<f32>(0.41f, 0f)) - vec2<f32>(0f, (((_e762 * 3f) * _e765) * 0.04f)));
                    let _e773 = qa;
                    let _e775 = textureSampleLevel(tDetailTexture, tDetailSampler, _e773, 0f);
                    let _e779 = qa;
                    let _e786 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e779 * 3.1f) + vec2(0.3f)), 0f);
                    na = ((0.65f * _e775.w) + (0.35f * _e786.x));
                    let _e792 = qb;
                    let _e794 = textureSampleLevel(tDetailTexture, tDetailSampler, _e792, 0f);
                    let _e798 = qb;
                    let _e805 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e798 * 3.1f) + vec2(0.3f)), 0f);
                    nb = ((0.65f * _e794.w) + (0.35f * _e805.x));
                    let _e812 = cov_1;
                    th = mix(0.75f, 0.28f, _e812);
                    let _e815 = th;
                    let _e818 = th;
                    let _e821 = nb;
                    let _e822 = na;
                    let _e823 = wa_1;
                    let _e826 = W_2;
                    (*foam) = (smoothstep((_e815 - 0.02f), (_e818 + 0.1f), (mix(_e821, _e822, _e823) + (0.06f * _e826.crest))) * 0.85f);
                }
            }
            let _e833 = fp_5;
            let _e834 = ac;
            let _e838 = fp_5;
            let _e839 = fd;
            q_5 = vec2<f32>((dot(_e833, _e834) * 0.2f), (dot(_e838, _e839) * 0.004f));
            let _e846 = q_5;
            let _e849 = fp_5;
            let _e850 = ac;
            let _e852 = fp_5;
            let _e853 = fd;
            let _e859 = textureSampleLevel(tDetailTexture, tDetailSampler, (vec2<f32>(dot(_e849, _e850), dot(_e852, _e853)) * 0.012f), 0f);
            q_5.x = (_e846.x + (1.2f * (_e859.x - 0.5f)));
            let _e865 = q_5;
            let _e867 = fv_1;
            let _e870 = ta;
            let _e877 = textureSampleLevel(tDetailTexture, tDetailSampler, (_e865 - vec2<f32>(0f, (((_e867 * 3f) * _e870) * 0.004f))), 0f);
            sa = _e877.w;
            let _e880 = q_5;
            let _e886 = fv_1;
            let _e889 = tb;
            let _e896 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e880 + vec2<f32>(0.43f, 0f)) - vec2<f32>(0f, (((_e886 * 3f) * _e889) * 0.004f))), 0f);
            sb = _e896.w;
            let _e901 = sb;
            let _e902 = sa;
            let _e903 = wa_1;
            let _e908 = Fr;
            streak = (smoothstep(0.7f, 0.8f, mix(_e901, _e902, _e903)) * smoothstep(0.6f, 1.2f, _e908));
            let _e912 = (*foam);
            let _e913 = streak;
            (*foam) = max(_e912, (_e913 * 0.3f));
        }
    }
    let _e917 = (*foam);
    let _e918 = global.uLiquid2_;
    (*foam) = (_e917 * _e918.y);
    return;
}

fn liquidTs(Tm: f32, kind_2: f32, flow_2: f32, upF_5: vec3<f32>) -> vec2<f32> {
    var Tm_1: f32;
    var kind_3: f32;
    var flow_3: f32;
    var upF_6: vec3<f32>;
    var Ts_1: f32;
    var yr: vec3<f32>;
    var local_46: f32;
    var local_47: f32;
    var local_48: f32;
    var follow: f32;
    var local_49: f32;
    var local_50: f32;
    var local_51: f32;
    var follow_1: f32;
    var local_52: f32;
    var local_53: f32;
    var Tf_2: f32;

    Tm_1 = Tm;
    kind_3 = kind_2;
    flow_3 = flow_2;
    upF_6 = upF_5;
    let _e187 = global.uSeason;
    if (_e187.z > 0.5f) {
        {
            let _e191 = upF_6;
            let _e192 = seasonYear(_e191);
            yr = _e192;
            let _e194 = kind_3;
            if (_e194 < 0.2f) {
                local_48 = 1f;
            } else {
                let _e198 = kind_3;
                if (_e198 < 0.55f) {
                    local_47 = 0.8f;
                } else {
                    let _e202 = kind_3;
                    if (_e202 < 0.85f) {
                        local_46 = 0.7f;
                    } else {
                        local_46 = 1f;
                    }
                    let _e208 = local_46;
                    local_47 = _e208;
                }
                let _e210 = local_47;
                local_48 = _e210;
            }
            let _e212 = local_48;
            follow = _e212;
            let _e214 = Tm_1;
            let _e215 = follow;
            let _e216 = yr;
            let _e218 = global.uSeason;
            let _e222 = yr;
            let _e224 = global.uSeason;
            Ts_1 = (_e214 + (_e215 * ((_e216.x * cos(_e218.x)) + (_e222.y * sin(_e224.x)))));
        }
    } else {
        {
            let _e231 = kind_3;
            if (_e231 < 0.2f) {
                local_51 = 0.25f;
            } else {
                let _e235 = kind_3;
                if (_e235 < 0.55f) {
                    local_50 = 0.6f;
                } else {
                    let _e239 = kind_3;
                    if (_e239 < 0.85f) {
                        local_49 = 0.45f;
                    } else {
                        local_49 = 0.8f;
                    }
                    let _e245 = local_49;
                    local_50 = _e245;
                }
                let _e247 = local_50;
                local_51 = _e247;
            }
            let _e249 = local_51;
            follow_1 = _e249;
            let _e251 = Tm_1;
            let _e253 = global.uLiquid2_;
            let _e256 = upF_6;
            let _e259 = follow_1;
            Ts_1 = (_e251 + (((70f * _e253.w) * _e256.y) * _e259));
        }
    }
    let _e262 = kind_3;
    if (_e262 < 0.2f) {
        let _e265 = global.uLiquid2_;
        local_52 = _e265.z;
    } else {
        local_52 = 0f;
    }
    let _e269 = local_52;
    let _e270 = kind_3;
    let _e273 = kind_3;
    if ((_e270 > 0.55f) && (_e273 < 0.85f)) {
        let _e278 = flow_3;
        local_53 = (3f * _e278);
    } else {
        local_53 = 0f;
    }
    let _e282 = local_53;
    Tf_2 = (_e269 - _e282);
    let _e285 = Ts_1;
    let _e286 = Tf_2;
    return vec2<f32>(_e285, _e286);
}

fn seaIceCover(ice: f32, nA: f32, nR: f32) -> f32 {
    var ice_1: f32;
    var nA_1: f32;
    var nR_1: f32;

    ice_1 = ice;
    nA_1 = nA;
    nR_1 = nR;
    let _e186 = ice_1;
    let _e187 = nA_1;
    let _e193 = nR_1;
    let _e202 = ice_1;
    return (smoothstep(0.35f, 0.75f, ((_e186 + ((_e187 - 0.5f) * 0.9f)) + ((_e193 - 0.5f) * 0.35f))) * smoothstep(0f, 0.15f, _e202));
}

fn floeHash(x_1: u32, y: u32, z_1: u32, s_1: u32) -> u32 {
    var x_2: u32;
    var y_1: u32;
    var z_2: u32;
    var s_2: u32;
    var h_3: u32;

    x_2 = x_1;
    y_1 = y;
    z_2 = z_1;
    s_2 = s_1;
    let _e186 = x_2;
    let _e189 = y_1;
    let _e193 = z_2;
    let _e197 = s_2;
    h_3 = ((((_e186 * 2376512323u) ^ (_e189 * 3625334849u)) ^ (_e193 * 3407524639u)) ^ (_e197 * 374761393u));
    let _e202 = h_3;
    let _e203 = h_3;
    h_3 = (_e202 ^ (_e203 >> 15u));
    let _e207 = h_3;
    h_3 = (_e207 * 739982445u);
    let _e210 = h_3;
    let _e211 = h_3;
    h_3 = (_e210 ^ (_e211 >> 12u));
    let _e215 = h_3;
    h_3 = (_e215 * 695872825u);
    let _e218 = h_3;
    let _e219 = h_3;
    h_3 = (_e218 ^ (_e219 >> 15u));
    let _e223 = h_3;
    return _e223;
}

fn tri0_(p_4: vec3<f32>, w_1: vec3<f32>, period: f32) -> vec4<f32> {
    var p_5: vec3<f32>;
    var w_2: vec3<f32>;
    var period_1: f32;
    var a_7: vec4<f32>;
    var b_2: vec4<f32>;
    var c_4: vec4<f32>;

    p_5 = p_4;
    w_2 = w_1;
    period_1 = period;
    let _e185 = p_5;
    let _e187 = period_1;
    let _e191 = textureSampleLevel(tDetailTexture, tDetailSampler, (_e185.yz / vec2(_e187)), 0f);
    a_7 = _e191;
    let _e193 = p_5;
    let _e195 = period_1;
    let _e202 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e193.zx / vec2(_e195)) + vec2(0.37f)), 0f);
    b_2 = _e202;
    let _e204 = p_5;
    let _e206 = period_1;
    let _e213 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e204.xy / vec2(_e206)) + vec2(0.71f)), 0f);
    c_4 = _e213;
    let _e215 = a_7;
    let _e216 = w_2;
    let _e219 = b_2;
    let _e220 = w_2;
    let _e224 = c_4;
    let _e225 = w_2;
    return (((_e215 * _e216.x) + (_e219 * _e220.y)) + (_e224 * _e225.z));
}

fn tri(p_6: vec3<f32>, w_3: vec3<f32>, period_2: f32) -> vec4<f32> {
    var p_7: vec3<f32>;
    var w_4: vec3<f32>;
    var period_3: f32;
    var a_8: vec4<f32>;
    var b_3: vec4<f32>;
    var c_5: vec4<f32>;

    p_7 = p_6;
    w_4 = w_3;
    period_3 = period_2;
    let _e185 = p_7;
    let _e187 = period_3;
    let _e191 = textureSampleLevel(tDetailTexture, tDetailSampler, (_e185.yz / vec2(_e187)), 0f);
    a_8 = _e191;
    let _e193 = p_7;
    let _e195 = period_3;
    let _e202 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e193.zx / vec2(_e195)) + vec2(0.37f)), 0f);
    b_3 = _e202;
    let _e204 = p_7;
    let _e206 = period_3;
    let _e213 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e204.xy / vec2(_e206)) + vec2(0.71f)), 0f);
    c_5 = _e213;
    let _e215 = a_8;
    let _e216 = w_4;
    let _e219 = b_3;
    let _e220 = w_4;
    let _e224 = c_5;
    let _e225 = w_4;
    return (((_e215 * _e216.x) + (_e219 * _e220.y)) + (_e224 * _e225.z));
}

fn leadIce(lid: u32, frz: f32, pDay: f32) -> vec2<f32> {
    var lid_1: u32;
    var frz_1: f32;
    var pDay_1: f32;
    var age: f32;
    var local_54: f32;
    var h_4: f32;

    lid_1 = lid;
    frz_1 = frz;
    pDay_1 = pDay;
    let _e186 = lid_1;
    age = (-2f * log(((f32((_e186 & 65535u)) + 0.5f) / 65536f)));
    let _e197 = frz_1;
    if (_e197 > 0f) {
        let _e201 = frz_1;
        let _e202 = age;
        local_54 = (1.33f * pow((_e201 * _e202), 0.58f));
    } else {
        local_54 = 0f;
    }
    let _e209 = local_54;
    h_4 = _e209;
    let _e211 = h_4;
    let _e213 = pDay_1;
    let _e215 = age;
    let _e223 = h_4;
    return vec2<f32>(_e211, ((1f - exp(((-(_e213) * _e215) / 12f))) * smoothstep(3f, 8f, _e223)));
}

fn leadHalf(cid: u32, c_6: f32, s_3: f32) -> f32 {
    var cid_1: u32;
    var c_7: f32;
    var s_4: f32;

    cid_1 = cid;
    c_7 = c_6;
    s_4 = s_3;
    let _e186 = s_4;
    let _e192 = cid_1;
    let _e204 = c_7;
    return min(150f, (((0.03f * min(_e186, 2048f)) * (0.2f + ((1.6f * f32((_e192 & 255u))) / 256f))) * (1f + (8f * (1f - sqrt(_e204))))));
}

fn crackOpen(cid_2: u32, c_8: f32, s_5: f32) -> f32 {
    var cid_3: u32;
    var c_9: f32;
    var s_6: f32;

    cid_3 = cid_2;
    c_9 = c_8;
    s_6 = s_5;
    let _e184 = cid_3;
    let _e195 = c_9;
    if ((f32(((_e184 >> 8u) & 255u)) / 256f) < (0.5f * smoothstep(0.85f, 1f, _e195))) {
        let _e200 = cid_3;
        return -((0.5f + (f32(((_e200 >> 16u) & 255u)) / 255f)));
    }
    let _e210 = cid_3;
    let _e211 = c_9;
    let _e212 = s_6;
    let _e213 = leadHalf(_e210, _e211, _e212);
    return _e213;
}

fn pieceCover(m_4: vec3<f32>, ice_2: f32) -> f32 {
    var m_5: vec3<f32>;
    var ice_3: f32;
    var u_2: vec3<f32>;
    var wm: vec3<f32>;
    var local_55: f32;

    m_5 = m_4;
    ice_3 = ice_2;
    let _e182 = m_5;
    u_2 = normalize(_e182);
    let _e185 = u_2;
    wm = pow(abs(_e185), vec3(4f));
    let _e191 = wm;
    let _e192 = wm;
    let _e194 = wm;
    let _e197 = wm;
    wm = (_e191 / vec3(((_e192.x + _e194.y) + _e197.z)));
    let _e202 = global.uSeason;
    if (_e202.z > 0.5f) {
        let _e206 = m_5;
        let _e207 = global.uLiquid2_;
        let _e209 = seaIceAt(_e206, _e207.z);
        local_55 = _e209;
    } else {
        let _e210 = ice_3;
        local_55 = _e210;
    }
    let _e212 = local_55;
    let _e213 = m_5;
    let _e214 = wm;
    let _e216 = tri0_(_e213, _e214, 512f);
    let _e218 = m_5;
    let _e219 = wm;
    let _e221 = tri0_(_e218, _e219, 64f);
    let _e223 = seaIceCover(_e212, _e216.w, _e221.x);
    return _e223;
}

fn faceLead(face: u32, axis: i32, neg: bool) -> u32 {
    var face_1: u32;
    var axis_1: i32;
    var neg_1: bool;
    var local_56: u32;
    var of_: u32;

    face_1 = face;
    axis_1 = axis;
    neg_1 = neg;
    let _e184 = axis_1;
    let _e188 = neg_1;
    if _e188 {
        local_56 = 1u;
    } else {
        local_56 = 0u;
    }
    let _e192 = local_56;
    of_ = (u32((_e184 * 2i)) + _e192);
    let _e195 = face_1;
    let _e196 = of_;
    let _e198 = face_1;
    let _e199 = of_;
    let _e203 = floeHash(min(_e195, _e196), max(_e198, _e199), 20253u, 11132u);
    return _e203;
}

fn floeRound(size: f32, id: u32, c_10: f32) -> f32 {
    var size_1: f32;
    var id_1: u32;
    var c_11: f32;
    var age_1: f32;

    size_1 = size;
    id_1 = id;
    c_11 = c_10;
    let _e189 = size_1;
    let _e195 = id_1;
    age_1 = ((0.3f + (0.7f * smoothstep(16f, 200f, _e189))) * (0.6f + ((0.4f * f32((_e195 >> 16u))) / 65536f)));
    let _e205 = size_1;
    let _e208 = age_1;
    let _e215 = c_11;
    return (_e205 * ((0.06f * (0.5f + _e208)) + (0.32f * (1f - smoothstep(0.5f, 0.9f, _e215)))));
}

fn floeOf(p_8: vec3<f32>, ice_4: f32, id_2: ptr<function, u32>, e: ptr<function, f32>, lid_2: ptr<function, u32>, c_12: ptr<function, f32>, size_2: ptr<function, f32>, mid: ptr<function, vec3<f32>>, there: ptr<function, bool>, ridge: ptr<function, vec4<f32>>) {
    var p_9: vec3<f32>;
    var ice_5: f32;
    var R_2: f32;
    var a_9: vec3<f32>;
    var local_57: i32;
    var local_58: i32;
    var ax: i32;
    var b_4: i32;
    var d_8: i32;
    var neg_2: bool;
    var local_59: f32;
    var sg: f32;
    var pu: f32;
    var pv: f32;
    var local_60: u32;
    var face_2: u32;
    var V_1: array<vec2<f32>, 12>;
    var EI: array<u32, 12>;
    var ES: array<f32, 12>;
    var i_7: i32 = 0i;
    var n_12: i32 = 4i;
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
    var w_5: f32;
    var cc: vec2<f32>;
    var sxx: f32;
    var syy: f32;
    var sxy: f32;
    var i_9: i32;
    var x_3: vec2<f32>;
    var local_61: f32;
    var th_1: f32;
    var ext: f32;
    var mm: vec3<f32>;
    var h_5: u32;
    var tc: f32;
    var off: f32;
    var qq: vec2<f32>;
    var KA: f32;
    var KB: f32;
    var KC: f32;
    var local_62: f32;
    var side: f32;
    var cid_4: u32;
    var g_4: f32;
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
    var local_63: u32;
    var rh: f32 = 0f;
    var e2_1: f32 = 100000000000000000000f;
    var i_12: i32 = 0i;
    var dv: vec2<f32>;
    var N3_: vec3<f32>;
    var dn_2: f32;
    var ek: f32;
    var local_64: f32;
    var rr: f32;

    p_9 = p_8;
    ice_5 = ice_4;
    let _e191 = p_9;
    R_2 = length(_e191);
    let _e194 = p_9;
    a_9 = abs(_e194);
    let _e197 = a_9;
    let _e199 = a_9;
    let _e202 = a_9;
    let _e204 = a_9;
    if ((_e197.x >= _e199.y) && (_e202.x >= _e204.z)) {
        local_58 = 0i;
    } else {
        let _e209 = a_9;
        let _e211 = a_9;
        if (_e209.y >= _e211.z) {
            local_57 = 1i;
        } else {
            local_57 = 2i;
        }
        let _e217 = local_57;
        local_58 = _e217;
    }
    let _e219 = local_58;
    ax = _e219;
    let _e221 = ax;
    b_4 = ((_e221 + 1i) % 3i);
    let _e227 = ax;
    d_8 = ((_e227 + 2i) % 3i);
    let _e233 = ax;
    let _e235 = p_9[_e233];
    neg_2 = (_e235 < 0f);
    let _e239 = neg_2;
    if _e239 {
        local_59 = -1f;
    } else {
        local_59 = 1f;
    }
    let _e244 = local_59;
    sg = _e244;
    let _e246 = b_4;
    let _e248 = p_9[_e246];
    let _e249 = ax;
    let _e251 = p_9[_e249];
    pu = (_e248 / _e251);
    let _e254 = d_8;
    let _e256 = p_9[_e254];
    let _e257 = ax;
    let _e259 = p_9[_e257];
    pv = (_e256 / _e259);
    let _e262 = ax;
    let _e266 = neg_2;
    if _e266 {
        local_60 = 1u;
    } else {
        local_60 = 0u;
    }
    let _e270 = local_60;
    face_2 = (u32((_e262 * 2i)) + _e270);
    V_1[0i] = vec2<f32>(-1f, -1f);
    V_1[1i] = vec2<f32>(1f, -1f);
    V_1[2i] = vec2<f32>(1f, 1f);
    V_1[3i] = vec2<f32>(-1f, 1f);
    let _e302 = face_2;
    let _e303 = d_8;
    let _e304 = neg_2;
    let _e306 = faceLead(_e302, _e303, !(_e304));
    EI[0i] = _e306;
    let _e309 = face_2;
    let _e310 = b_4;
    let _e311 = neg_2;
    let _e312 = faceLead(_e309, _e310, _e311);
    EI[1i] = _e312;
    let _e315 = face_2;
    let _e316 = d_8;
    let _e317 = neg_2;
    let _e318 = faceLead(_e315, _e316, _e317);
    EI[2i] = _e318;
    let _e321 = face_2;
    let _e322 = b_4;
    let _e323 = neg_2;
    let _e325 = faceLead(_e321, _e322, !(_e323));
    EI[3i] = _e325;
    loop {
        let _e328 = i_7;
        if !((_e328 < 4i)) {
            break;
        }
        let _e335 = i_7;
        let _e337 = i_7;
        let _e339 = EI[_e337];
        let _e342 = leadHalf(_e339, 1f, 4096f);
        ES[_e335] = _e342;
        continuing {
            let _e332 = i_7;
            i_7 = (_e332 + 1i);
        }
    }
    (*ridge) = vec4<f32>(0f, 0f, 0f, 100000000000000000000f);
    let _e350 = face_2;
    let _e354 = floeHash(_e350, 20942u, 0u, 14971u);
    (*id_2) = _e354;
    (*c_12) = 1f;
    let _e361 = p_9;
    m_6 = _e361;
    loop {
        let _e365 = lvl;
        if !((_e365 < 32i)) {
            break;
        }
        {
            let _e374 = V_1[0];
            v0_ = _e374;
            cs_1 = vec2(0f);
            A_1 = 0f;
            i_8 = 0i;
            loop {
                let _e383 = i_8;
                if !((_e383 < POLY_MAX)) {
                    break;
                }
                {
                    let _e389 = i_8;
                    let _e390 = n_12;
                    if (_e389 >= _e390) {
                        break;
                    }
                    let _e392 = i_8;
                    let _e394 = V_1[_e392];
                    let _e395 = v0_;
                    xi = (_e394 - _e395);
                    let _e398 = i_8;
                    let _e401 = n_12;
                    let _e404 = V_1[((_e398 + 1i) % _e401)];
                    let _e405 = v0_;
                    xj = (_e404 - _e405);
                    let _e408 = xi;
                    let _e410 = xj;
                    let _e413 = xj;
                    let _e415 = xi;
                    w_5 = ((_e408.x * _e410.y) - (_e413.x * _e415.y));
                    let _e420 = A_1;
                    let _e421 = w_5;
                    A_1 = (_e420 + _e421);
                    let _e423 = cs_1;
                    let _e424 = xi;
                    let _e425 = xj;
                    let _e427 = w_5;
                    cs_1 = (_e423 + ((_e424 + _e425) * _e427));
                }
                continuing {
                    let _e386 = i_8;
                    i_8 = (_e386 + 1i);
                }
            }
            let _e430 = A_1;
            A_1 = (_e430 * 0.5f);
            let _e433 = A_1;
            if (abs(_e433) < 0.00000000000000000001f) {
                break;
            }
            let _e437 = v0_;
            let _e438 = cs_1;
            let _e440 = A_1;
            cc = (_e437 + (_e438 / vec2((6f * _e440))));
            sxx = 0f;
            syy = 0f;
            sxy = 0f;
            i_9 = 0i;
            loop {
                let _e454 = i_9;
                if !((_e454 < POLY_MAX)) {
                    break;
                }
                {
                    let _e460 = i_9;
                    let _e461 = n_12;
                    if (_e460 >= _e461) {
                        break;
                    }
                    let _e463 = i_9;
                    let _e465 = V_1[_e463];
                    let _e466 = cc;
                    x_3 = (_e465 - _e466);
                    let _e469 = sxx;
                    let _e470 = x_3;
                    let _e472 = x_3;
                    sxx = (_e469 + (_e470.x * _e472.x));
                    let _e476 = syy;
                    let _e477 = x_3;
                    let _e479 = x_3;
                    syy = (_e476 + (_e477.y * _e479.y));
                    let _e483 = sxy;
                    let _e484 = x_3;
                    let _e486 = x_3;
                    sxy = (_e483 + (_e484.x * _e486.y));
                }
                continuing {
                    let _e457 = i_9;
                    i_9 = (_e457 + 1i);
                }
            }
            let _e490 = sxy;
            let _e492 = sxx;
            let _e493 = syy;
            let _e498 = sxx;
            let _e499 = syy;
            if ((abs(_e490) + abs((_e492 - _e493))) > (0.000000000000000000000000000001f * (_e498 + _e499))) {
                let _e505 = sxy;
                let _e507 = sxx;
                let _e508 = syy;
                local_61 = (0.5f * atan2((2f * _e505), (_e507 - _e508)));
            } else {
                local_61 = 0f;
            }
            let _e514 = local_61;
            th_1 = _e514;
            let _e516 = sxx;
            let _e517 = syy;
            let _e519 = n_12;
            ext = sqrt(((_e516 + _e517) / f32(_e519)));
            let _e525 = ax;
            let _e527 = sg;
            mm[_e525] = _e527;
            let _e528 = b_4;
            let _e530 = sg;
            let _e531 = cc;
            mm[_e528] = (_e530 * _e531.x);
            let _e534 = d_8;
            let _e536 = sg;
            let _e537 = cc;
            mm[_e534] = (_e536 * _e537.y);
            let _e540 = mm;
            let _e542 = R_2;
            m_6 = (normalize(_e540) * _e542);
            let _e544 = R_2;
            let _e545 = A_1;
            let _e550 = cc;
            let _e551 = cc;
            s_7 = ((_e544 * sqrt(abs(_e545))) / pow((1f + dot(_e550, _e551)), 0.75f));
            let _e557 = (*id_2);
            let _e558 = lvl;
            let _e562 = floeHash(_e557, u32(_e558), 20942u, 14971u);
            h_5 = _e562;
            let _e564 = th_1;
            let _e567 = h_5;
            tc = (((_e564 + 1.5708f) + ((f32(((_e567 >> 8u) & 1023u)) / 1023f) * 1.0472f)) - 0.5236f);
            let _e581 = h_5;
            let _e593 = ext;
            off = ((((f32(((_e581 >> 18u) & 255u)) / 255f) - 0.5f) * 0.6f) * _e593);
            let _e596 = cc;
            let _e597 = th_1;
            let _e599 = th_1;
            let _e602 = off;
            qq = (_e596 + (vec2<f32>(cos(_e597), sin(_e599)) * _e602));
            let _e606 = tc;
            KA = -(sin(_e606));
            let _e610 = tc;
            KB = cos(_e610);
            let _e613 = KA;
            let _e614 = qq;
            let _e617 = KB;
            let _e618 = qq;
            KC = -(((_e613 * _e614.x) + (_e617 * _e618.y)));
            let _e624 = s_7;
            if (_e624 < 4096f) {
                {
                    let _e627 = cP;
                    let _e630 = s_7;
                    if ((_e627 < 0f) || (_e630 < 1024f)) {
                        let _e634 = m_6;
                        let _e635 = ice_5;
                        let _e636 = pieceCover(_e634, _e635);
                        cP = _e636;
                    }
                    let _e637 = cP;
                    (*c_12) = _e637;
                    let _e638 = s_7;
                    let _e643 = (*c_12);
                    let _e648 = h_5;
                    let _e655 = (*c_12);
                    if ((_e638 < (12f + (288f * smoothstep(0.4f, 0.95f, _e643)))) || (f32((_e648 & 255u)) < (51.2f * smoothstep(0.5f, 0.9f, _e655)))) {
                        break;
                    }
                }
            }
            let _e660 = n_12;
            if (_e660 >= 11i) {
                break;
            }
            let _e665 = KA;
            let _e666 = pu;
            let _e668 = KB;
            let _e669 = pv;
            let _e672 = KC;
            if ((((_e665 * _e666) + (_e668 * _e669)) + _e672) >= 0f) {
                local_62 = 1f;
            } else {
                local_62 = -1f;
            }
            let _e680 = local_62;
            side = _e680;
            let _e682 = (*id_2);
            let _e683 = lvl;
            let _e687 = floeHash(_e682, u32(_e683), 31249u, 7997u);
            cid_4 = _e687;
            let _e689 = cid_4;
            let _e690 = (*c_12);
            let _e691 = s_7;
            let _e692 = crackOpen(_e689, _e690, _e691);
            g_4 = _e692;
            k_2 = 0i;
            i_10 = 0i;
            loop {
                let _e701 = i_10;
                if !((_e701 < POLY_MAX)) {
                    break;
                }
                {
                    let _e707 = i_10;
                    let _e708 = n_12;
                    let _e710 = k_2;
                    if ((_e707 >= _e708) || (_e710 >= POLY_MAX)) {
                        break;
                    }
                    let _e713 = i_10;
                    let _e715 = V_1[_e713];
                    xi_1 = _e715;
                    let _e717 = i_10;
                    let _e720 = n_12;
                    let _e723 = V_1[((_e717 + 1i) % _e720)];
                    xj_1 = _e723;
                    let _e725 = side;
                    let _e726 = KA;
                    let _e727 = xi_1;
                    let _e730 = KB;
                    let _e731 = xi_1;
                    let _e735 = KC;
                    di = (_e725 * (((_e726 * _e727.x) + (_e730 * _e731.y)) + _e735));
                    let _e739 = side;
                    let _e740 = KA;
                    let _e741 = xj_1;
                    let _e744 = KB;
                    let _e745 = xj_1;
                    let _e749 = KC;
                    dj = (_e739 * (((_e740 * _e741.x) + (_e744 * _e745.y)) + _e749));
                    let _e753 = di;
                    if (_e753 >= 0f) {
                        {
                            let _e756 = k_2;
                            let _e758 = xi_1;
                            W_3[_e756] = _e758;
                            let _e759 = k_2;
                            let _e761 = i_10;
                            let _e763 = EI[_e761];
                            WI[_e759] = _e763;
                            let _e764 = k_2;
                            let _e766 = i_10;
                            let _e768 = ES[_e766];
                            WS[_e764] = _e768;
                            let _e769 = k_2;
                            k_2 = (_e769 + 1i);
                        }
                    }
                    let _e772 = di;
                    let _e775 = dj;
                    let _e779 = k_2;
                    if (((_e772 >= 0f) != (_e775 >= 0f)) && (_e779 < POLY_MAX)) {
                        {
                            let _e782 = k_2;
                            let _e784 = xi_1;
                            let _e785 = xj_1;
                            let _e786 = xi_1;
                            let _e788 = di;
                            let _e789 = di;
                            let _e790 = dj;
                            W_3[_e782] = (_e784 + ((_e785 - _e786) * (_e788 / (_e789 - _e790))));
                            let _e795 = di;
                            if (_e795 >= 0f) {
                                {
                                    let _e798 = k_2;
                                    let _e800 = cid_4;
                                    WI[_e798] = _e800;
                                    let _e801 = k_2;
                                    let _e803 = g_4;
                                    WS[_e801] = _e803;
                                }
                            } else {
                                {
                                    let _e804 = k_2;
                                    let _e806 = i_10;
                                    let _e808 = EI[_e806];
                                    WI[_e804] = _e808;
                                    let _e809 = k_2;
                                    let _e811 = i_10;
                                    let _e813 = ES[_e811];
                                    WS[_e809] = _e813;
                                }
                            }
                            let _e814 = k_2;
                            k_2 = (_e814 + 1i);
                        }
                    }
                }
                continuing {
                    let _e704 = i_10;
                    i_10 = (_e704 + 1i);
                }
            }
            i_11 = 0i;
            loop {
                let _e819 = i_11;
                if !((_e819 < POLY_MAX)) {
                    break;
                }
                {
                    let _e825 = i_11;
                    let _e827 = i_11;
                    let _e829 = W_3[_e827];
                    V_1[_e825] = _e829;
                    let _e830 = i_11;
                    let _e832 = i_11;
                    let _e834 = WI[_e832];
                    EI[_e830] = _e834;
                    let _e835 = i_11;
                    let _e837 = i_11;
                    let _e839 = WS[_e837];
                    ES[_e835] = _e839;
                }
                continuing {
                    let _e822 = i_11;
                    i_11 = (_e822 + 1i);
                }
            }
            let _e840 = k_2;
            n_12 = _e840;
            let _e841 = (*id_2);
            let _e842 = side;
            if (_e842 > 0f) {
                local_63 = 1u;
            } else {
                local_63 = 0u;
            }
            let _e848 = local_63;
            let _e849 = lvl;
            let _e852 = floeHash(_e841, _e848, u32(_e849), 40503u);
            (*id_2) = _e852;
        }
        continuing {
            let _e369 = lvl;
            lvl = (_e369 + 1i);
        }
    }
    (*e) = 100000000000000000000f;
    (*lid_2) = 0u;
    loop {
        let _e861 = i_12;
        if !((_e861 < POLY_MAX)) {
            break;
        }
        {
            let _e867 = i_12;
            let _e868 = n_12;
            if (_e867 >= _e868) {
                break;
            }
            let _e870 = i_12;
            let _e873 = n_12;
            let _e876 = V_1[((_e870 + 1i) % _e873)];
            let _e877 = i_12;
            let _e879 = V_1[_e877];
            dv = (_e876 - _e879);
            let _e882 = dv;
            let _e883 = dv;
            if (dot(_e882, _e883) < 0.000000000000000000000001f) {
                continue;
            }
            let _e888 = b_4;
            let _e890 = dv;
            N3_[_e888] = -(_e890.y);
            let _e893 = d_8;
            let _e895 = dv;
            N3_[_e893] = _e895.x;
            let _e897 = ax;
            let _e899 = dv;
            let _e901 = i_12;
            let _e903 = V_1[_e901];
            let _e906 = dv;
            let _e908 = i_12;
            let _e910 = V_1[_e908];
            N3_[_e897] = ((_e899.y * _e903.x) - (_e906.x * _e910.y));
            let _e914 = N3_;
            N3_ = normalize(_e914);
            let _e916 = p_9;
            let _e917 = N3_;
            dn_2 = dot(_e916, _e917);
            let _e920 = dn_2;
            let _e922 = i_12;
            let _e924 = ES[_e922];
            ek = (abs(_e920) - max(_e924, 0.15f));
            let _e929 = ek;
            let _e930 = (*e);
            if (_e929 < _e930) {
                {
                    let _e932 = (*e);
                    e2_1 = _e932;
                    let _e933 = ek;
                    (*e) = _e933;
                    let _e934 = i_12;
                    let _e936 = EI[_e934];
                    (*lid_2) = _e936;
                }
            } else {
                let _e937 = ek;
                let _e938 = e2_1;
                if (_e937 < _e938) {
                    let _e940 = ek;
                    e2_1 = _e940;
                }
            }
            let _e941 = i_12;
            let _e943 = ES[_e941];
            let _e946 = dn_2;
            let _e948 = (*ridge);
            if ((_e943 < 0f) && (abs(_e946) < _e948.w)) {
                {
                    let _e952 = N3_;
                    let _e953 = dn_2;
                    let _e955 = (_e952 * sign(_e953));
                    let _e956 = dn_2;
                    (*ridge) = vec4<f32>(_e955.x, _e955.y, _e955.z, abs(_e956));
                    let _e962 = i_12;
                    let _e964 = ES[_e962];
                    rh = -(_e964);
                }
            }
        }
        continuing {
            let _e864 = i_12;
            i_12 = (_e864 + 1i);
        }
    }
    let _e967 = rh;
    if (_e967 > 0f) {
        let _e970 = rh;
        let _e973 = (*ridge);
        let _e976 = rh;
        local_64 = (_e970 * max(0f, (1f - (_e973.w / (2f * _e976)))));
    } else {
        local_64 = 0f;
    }
    let _e984 = local_64;
    (*ridge).w = _e984;
    let _e985 = m_6;
    let _e986 = ice_5;
    let _e987 = pieceCover(_e985, _e986);
    (*c_12) = _e987;
    let _e988 = s_7;
    let _e989 = (*id_2);
    let _e990 = (*c_12);
    let _e991 = floeRound(_e988, _e989, _e990);
    rr = _e991;
    let _e993 = e2_1;
    let _e994 = rr;
    if (_e993 < _e994) {
        let _e996 = rr;
        let _e997 = rr;
        let _e998 = (*e);
        let _e1000 = rr;
        let _e1001 = e2_1;
        (*e) = (_e996 - length(vec2<f32>((_e997 - _e998), (_e1000 - _e1001))));
    }
    let _e1006 = s_7;
    (*size_2) = _e1006;
    let _e1007 = m_6;
    (*mid) = _e1007;
    let _e1008 = (*c_12);
    let _e1011 = (*id_2);
    let _e1019 = (*c_12);
    (*there) = ((_e1008 > 0f) && ((f32((_e1011 & 65535u)) / 65536f) <= min(1f, (1.5f * _e1019))));
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
    var x_4: f32 = 0f;
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
    let _e198 = frz_3;
    let _e199 = pDay_3;
    let _e200 = leadIce(32768u, _e198, _e199);
    leadFar = _e200;
    (*lead) = vec2(0f);
    (*ridge_1) = vec4(0f);
    let _e206 = cPix_1;
    let _e209 = ice_7;
    if ((_e206 <= 0f) && (_e209 <= 0f)) {
        return vec4(0f);
    }
    let _e215 = foot_15;
    if (_e215 >= 64f) {
        {
            let _e218 = leadFar;
            (*lead) = _e218;
            let _e219 = cPix_1;
            let _e222 = cPix_1;
            return vec4<f32>(_e219, 0f, 0.7f, _e222);
        }
    }
    let _e231 = p_11;
    let _e232 = ice_7;
    floeOf(_e231, _e232, (&id_3), (&e_1), (&lid_3), (&c_13), (&size_3), (&mid_1), (&there_1), ridge_1);
    let _e249 = there_1;
    if !(_e249) {
        (*ridge_1) = vec4(0f);
    }
    let _e253 = e_1;
    let _e254 = p_11;
    let _e255 = w_7;
    let _e257 = tri(_e254, _e255, 8f);
    let _e263 = p_11;
    let _e264 = w_7;
    let _e266 = tri(_e263, _e264, 2f);
    e_1 = (_e253 + (((_e257.x - 0.5f) * 1.6f) + ((_e266.w - 0.5f) * 0.5f)));
    let _e274 = foot_15;
    fw = max(_e274, 0.03f);
    let _e286 = size_3;
    let _e292 = id_3;
    age_2 = ((0.3f + (0.7f * smoothstep(16f, 200f, _e286))) * (0.6f + ((0.4f * f32((_e292 >> 16u))) / 65536f)));
    let _e302 = there_1;
    if _e302 {
        {
            let _e303 = e_1;
            let _e304 = fw;
            x_4 = clamp(((_e303 / _e304) + 0.5f), 0f, 1f);
            let _e314 = fw;
            let _e316 = e_1;
            rim = (1f - smoothstep(0f, (0.8f + _e314), _e316));
            let _e319 = lid_3;
            let _e320 = frz_3;
            let _e321 = pDay_3;
            let _e322 = leadIce(_e319, _e320, _e321);
            (*lead) = _e322;
        }
    }
    let _e325 = foot_15;
    kFar = smoothstep(16f, 64f, _e325);
    let _e328 = x_4;
    let _e329 = cPix_1;
    let _e330 = kFar;
    x_4 = mix(_e328, _e329, _e330);
    let _e332 = (*lead);
    let _e333 = leadFar;
    let _e334 = kFar;
    (*lead) = mix(_e332, _e333, vec2(_e334));
    let _e338 = (*ridge_1);
    let _e341 = kFar;
    (*ridge_1).w = (_e338.w * (1f - _e341));
    let _e344 = x_4;
    let _e345 = rim;
    let _e346 = x_4;
    let _e349 = kFar;
    let _e352 = age_2;
    let _e354 = kFar;
    let _e356 = c_13;
    let _e357 = cPix_1;
    let _e358 = kFar;
    return vec4<f32>(_e344, ((_e345 * _e346) * (1f - _e349)), mix(_e352, 0.7f, _e354), mix(_e356, _e357, _e358));
}

fn main_1() {
    var foot_16: f32;
    var dpx: vec3<f32>;
    var dpy: vec3<f32>;
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
    var fp_6: vec3<f32>;
    var fn_: vec3<f32>;
    var w_8: vec3<f32>;
    var fineK: f32;
    var midK: f32;
    var farK: f32;
    var local_65: f32;
    var isWater: f32;
    var gRough: f32 = 0.8f;
    var gAO: f32 = 1f;
    var ndl_1: f32;
    var color: vec3<f32>;
    var dbgW: vec3<f32> = vec3(-1f);
    var V_2: vec3<f32>;
    var upF_7: vec3<f32>;
    var local_66: vec3<f32>;
    var lq: vec3<f32>;
    var kind_4: f32;
    var Tm_2: f32;
    var river_3: bool;
    var local_67: f32;
    var flow_4: f32;
    var local_68: f32;
    var local_69: f32;
    var local_70: f32;
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
    var local_71: f32;
    var iceC: f32;
    var local_72: f32;
    var pDay_4: f32;
    var lead_1: vec2<f32> = vec2(0f);
    var local_73: f32;
    var Tair_2: f32;
    var ridge_2: vec4<f32> = vec4(0f);
    var local_74: vec4<f32>;
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
    var a_10: vec3<f32>;
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
    var local_75: f32;
    var fallK: f32;
    var dbgWhite: f32 = 0f;
    var dn_4: vec3<f32>;
    var down: vec3<f32>;
    var acr: vec3<f32>;
    var local_76: f32;
    var zf: f32;
    var v_1: f32;
    var t1_: f32;
    var t2_: f32;
    var wa_2: f32;
    var L_7: f32;
    var local_77: vec3<f32>;
    var pS: vec3<f32>;
    var q_6: vec2<f32>;
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
    var local_78: vec3<f32>;
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
    var local_79: f32;
    var thaw: f32;
    var snowy: f32;
    var iceAlb: vec3<f32>;
    var local_80: f32;
    var pond_1: f32;
    var N2_: vec3<f32>;
    var blk: f32;
    var iceCol: vec3<f32>;
    var NdH2_: f32;
    var iceF: f32;
    var dnI: vec3<f32>;
    var downI: vec3<f32>;
    var acrI: vec3<f32>;
    var local_81: vec3<f32>;
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
    var local_82: f32;
    var local_83: vec3<f32>;
    var local_84: vec3<f32>;
    var local_85: vec3<f32>;
    var local_86: vec3<f32>;
    var local_87: vec3<f32>;
    var a_11: vec3<f32>;
    var flick: f32;
    var crust: f32;
    var local_88: vec3<f32>;
    var local_89: f32;

    let _e179 = vWorldPos_1;
    let _e180 = fwidth(_e179);
    foot_16 = length(_e180);
    let _e183 = vFixedPos_1;
    let _e184 = dpdx(_e183);
    dpx = _e184;
    let _e186 = vFixedPos_1;
    let _e187 = dpdy(_e186);
    dpy = _e187;
    let _e189 = vCol_1;
    let _e191 = vCol_1;
    albedo = (_e189.xyz * _e191.xyz);
    let _e195 = vCol_1;
    waterEnc = _e195.w;
    let _e198 = global.uNear;
    if (_e198.x > 0.5f) {
        {
            let _e202 = vNearRel_1;
            let _e203 = global.uNearUp;
            let _e204 = vNearRel_1;
            let _e205 = global.uNearUp;
            dn_3 = length((_e202 - (_e203 * dot(_e204, _e205))));
            let _e211 = global.uNearMode;
            if (_e211 < 0.5f) {
                {
                    let _e214 = dn_3;
                    let _e216 = global.uNear;
                    let _e220 = vShore_1;
                    if ((_e214 < (0.97f * _e216.y)) && (_e220 <= 0f)) {
                        discard;
                    }
                }
            } else {
                let _e224 = dn_3;
                let _e225 = global.uNearBand;
                let _e228 = dn_3;
                let _e229 = global.uNearBand;
                if ((_e224 < _e225.x) || (_e228 > _e229.y)) {
                    discard;
                }
            }
        }
    }
    let _e233 = vMat_1;
    veg = _e233.x;
    let _e236 = vMat_1;
    snow = _e236.y;
    let _e239 = vMat_1;
    rock = _e239.z;
    let _e242 = vMat_1;
    sand = _e242.w;
    let _e245 = vExt_1;
    emissive = _e245.x;
    let _e248 = vExt_1;
    wet = _e248.y;
    let _e251 = vExt_1;
    rough_1 = _e251.z;
    let _e254 = vWorldPos_1;
    let _e255 = global.uCenter;
    rel_4 = (_e254 - _e255);
    let _e258 = rel_4;
    r_10 = length(_e258);
    let _e261 = rel_4;
    let _e262 = r_10;
    up_4 = (_e261 / vec3(_e262));
    let _e266 = vWorldPos_1;
    dist_3 = length(_e266);
    let _e269 = vCol_1;
    colC = _e269.xyz;
    let _e272 = vShore_1;
    shoreV = _e272;
    let _e274 = dist_3;
    let _e275 = colourCubeK(_e274);
    cK = _e275;
    let _e277 = cK;
    if (_e277 > 0f) {
        {
            let _e280 = global.uToFixed;
            let _e281 = up_4;
            let _e284 = colourCubeAt(normalize((_e280 * _e281)));
            cc_1 = _e284;
            let _e286 = colC;
            let _e287 = cc_1;
            let _e289 = cK;
            colC = mix(_e286, _e287.xyz, vec3(_e289));
            let _e292 = shoreV;
            let _e293 = cc_1;
            let _e301 = cK;
            shoreV = mix(_e292, (((_e293.w * 255f) - 128f) / 127f), _e301);
            let _e303 = colC;
            let _e304 = colC;
            albedo = (_e303 * _e304);
        }
    }
    let _e306 = vNormal_1;
    N_3 = normalize(_e306);
    let _e309 = up_4;
    let _e310 = global.uSunDir;
    muS_2 = dot(_e309, _e310);
    let _e313 = r_10;
    let _e314 = muS_2;
    let _e315 = atmoSunTransmittance(_e313, _e314);
    sunT = _e315;
    let _e317 = r_10;
    let _e318 = muS_2;
    let _e319 = atmoSkyIrradiance(_e317, _e318);
    skyE_1 = _e319;
    let _e321 = rel_4;
    let _e322 = r_10;
    let _e323 = muS_2;
    let _e324 = foot_16;
    let _e325 = sunT;
    let _e328 = cloudLight(_e321, _e322, _e323, _e324, _e325, (&skyE_1));
    cloudT = _e328;
    let _e330 = sunT;
    let _e331 = cloudT;
    sunT = (_e330 * _e331);
    let _e333 = global.uToFixed;
    let _e334 = rel_4;
    pF_3 = (_e333 * _e334);
    let _e337 = sunT;
    let _e338 = pF_3;
    let _e339 = pF_3;
    let _e341 = global.uToFixed;
    let _e342 = global.uSunDir;
    let _e344 = global.uRadius;
    let _e345 = terrainShadow(_e338, normalize(_e339), (_e341 * _e342), _e344);
    sunT = (_e337 * _e345);
    let _e347 = sunT;
    sunTop = _e347;
    let _e349 = vWorldPos_1;
    let _e350 = N_3;
    let _e351 = sunShadowMap(_e349, _e350);
    keySh = _e351;
    let _e353 = sunT;
    let _e354 = keySh;
    sunT = (_e353 * _e354);
    let _e356 = vFixedPos_1;
    fp_6 = _e356;
    let _e358 = vFixedNormal_1;
    fn_ = normalize(_e358);
    let _e361 = fn_;
    w_8 = pow(abs(_e361), vec3(4f));
    let _e367 = w_8;
    let _e368 = w_8;
    let _e370 = w_8;
    let _e373 = w_8;
    w_8 = (_e367 / vec3(((_e368.x + _e370.y) + _e373.z)));
    let _e381 = dist_3;
    fineK = (1f - smoothstep(60f, 900f, _e381));
    let _e388 = dist_3;
    midK = (1f - smoothstep(600f, 9000f, _e388));
    let _e395 = dist_3;
    farK = (1f - smoothstep(6000f, 90000f, _e395));
    let _e399 = shoreV;
    if (_e399 > 0f) {
        local_65 = 1f;
    } else {
        local_65 = 0f;
    }
    let _e405 = local_65;
    isWater = _e405;
    let _e411 = isWater;
    if (_e411 < 0.5f) {
        discard;
    }
    let _e414 = N_3;
    let _e415 = global.uSunDir;
    ndl_1 = max(dot(_e414, _e415), 0f);
    let _e425 = isWater;
    if (_e425 > 0.5f) {
        {
            let _e428 = vWorldPos_1;
            V_2 = normalize(-(_e428));
            let _e432 = global.uToFixed;
            let _e433 = up_4;
            upF_7 = (_e432 * _e433);
            let _e436 = vLiq_1;
            if (_e436.x > 0.02f) {
                let _e440 = vLiq_1;
                let _e442 = vLiq_1;
                local_66 = (_e440.yzw / vec3(_e442.x));
            } else {
                local_66 = vec3<f32>(0f, 0.75f, 1f);
            }
            let _e451 = local_66;
            lq = _e451;
            let _e453 = lq;
            kind_4 = _e453.x;
            let _e456 = lq;
            Tm_2 = ((_e456.y * 120f) - 60f);
            let _e463 = kind_4;
            let _e466 = kind_4;
            river_3 = ((_e463 > 0.55f) && (_e466 < 0.85f));
            let _e471 = river_3;
            if _e471 {
                let _e472 = lq;
                local_67 = _e472.z;
            } else {
                local_67 = 0f;
            }
            let _e476 = local_67;
            flow_4 = _e476;
            let _e478 = kind_4;
            if (_e478 < 0.2f) {
                local_70 = 1f;
            } else {
                let _e482 = river_3;
                if _e482 {
                    local_69 = 0.2f;
                } else {
                    let _e484 = kind_4;
                    if (_e484 > 0.85f) {
                        local_68 = 0.05f;
                    } else {
                        let _e488 = lq;
                        local_68 = _e488.z;
                    }
                    let _e491 = local_68;
                    local_69 = _e491;
                }
                let _e493 = local_69;
                local_70 = _e493;
            }
            let _e495 = local_70;
            fetch_2 = _e495;
            let _e497 = waterEnc;
            let _e498 = waterEnc;
            let _e504 = shoreV;
            depthW = (((_e497 * _e498) * 6000f) * smoothstep(0f, 0.125f, _e504));
            let _e508 = fp_6;
            let _e509 = w_8;
            let _e511 = tri(_e508, _e509, 512f);
            nW = _e511;
            let _e513 = fp_6;
            let _e514 = w_8;
            let _e516 = tri(_e513, _e514, 64f);
            nG = _e516;
            let _e518 = nW;
            let _e522 = nW;
            wn_2 = (vec2<f32>((_e518.x - 0.5f), (_e522.w - 0.5f)) * 2f);
            let _e530 = nG;
            let _e532 = nG;
            let _e534 = nW;
            let _e536 = nW;
            grp_4 = clamp(((vec4<f32>(_e530.x, _e532.w, _e534.w, _e536.x) * 1.6f) - vec4(0.3f)), vec4(0f), vec4(1f));
            let _e553 = vFlw_1;
            fv_2 = (max(_e553.w, 0f) * 9f);
            let _e560 = fp_6;
            let _e561 = fn_;
            let _e562 = upF_7;
            let _e563 = kind_4;
            let _e564 = flow_4;
            let _e565 = fetch_2;
            let _e566 = depthW;
            let _e567 = foot_16;
            let _e568 = wn_2;
            let _e569 = grp_4;
            let _e570 = vFlw_1;
            let _e572 = fv_2;
            liquidSurface(_e560, _e561, _e562, _e563, _e564, _e565, _e566, _e567, _e568, _e569, _e570.xyz, _e572, (&nF_1), (&wr), (&foam_1));
            let _e579 = Tm_2;
            let _e580 = kind_4;
            let _e581 = flow_4;
            let _e582 = upF_7;
            let _e583 = liquidTs(_e579, _e580, _e581, _e582);
            tsf = _e583;
            let _e586 = tsf;
            let _e590 = tsf;
            let _e594 = tsf;
            ice_8 = (1f - smoothstep((_e586.y - 4f), (_e590.y + 4f), _e594.x));
            let _e599 = kind_4;
            let _e602 = ice_8;
            if ((_e599 < 0.2f) && (_e602 > 0f)) {
                let _e606 = ice_8;
                let _e607 = nW;
                let _e609 = nG;
                let _e611 = seaIceCover(_e606, _e607.w, _e609.x);
                local_71 = _e611;
            } else {
                local_71 = 0f;
            }
            let _e614 = local_71;
            iceC = _e614;
            let _e616 = global.uSeason;
            if (_e616.z > 0.5f) {
                let _e621 = upF_7;
                let _e622 = seasonYear(_e621);
                let _e626 = global.uSeason;
                local_72 = (((12f * _e622.z) * DDF_SNOW) / max(_e626.y, 1f));
            } else {
                local_72 = 0f;
            }
            let _e633 = local_72;
            pDay_4 = _e633;
            let _e638 = global.uSeason;
            if (_e638.z > 0.5f) {
                let _e642 = Tm_2;
                let _e643 = upF_7;
                let _e644 = seasonIceNow(_e643);
                local_73 = (_e642 + _e644);
            } else {
                let _e646 = tsf;
                local_73 = _e646.x;
            }
            let _e649 = local_73;
            Tair_2 = _e649;
            let _e654 = kind_4;
            if (_e654 < 0.2f) {
                let _e657 = pF_3;
                let _e658 = upF_7;
                let _e659 = w_8;
                let _e660 = ice_8;
                let _e661 = iceC;
                let _e662 = foot_16;
                let _e663 = tsf;
                let _e665 = Tair_2;
                let _e669 = pDay_4;
                let _e674 = seaFloes(_e657, _e658, _e659, _e660, _e661, _e662, max((_e663.y - _e665), 0f), _e669, (&lead_1), (&ridge_2));
                local_74 = _e674;
            } else {
                let _e675 = ice_8;
                local_74 = vec4<f32>(_e675, 0f, 1f, 0f);
            }
            let _e681 = local_74;
            fl = _e681;
            let _e685 = iceC;
            let _e686 = fl;
            calm = smoothstep(0.05f, 0.6f, max(_e685, _e686.w));
            let _e691 = nF_1;
            let _e692 = upF_7;
            let _e694 = calm;
            nF_1 = normalize(mix(_e691, _e692, vec3((0.9f * _e694))));
            let _e699 = wr;
            let _e702 = calm;
            wr = (_e699 * (1f - (0.8f * _e702)));
            let _e706 = foam_1;
            let _e708 = calm;
            foam_1 = (_e706 * (1f - _e708));
            let _e711 = river_3;
            if _e711 {
                let _e712 = nF_1;
                let _e713 = fn_;
                let _e717 = fn_;
                let _e718 = upF_7;
                nF_1 = normalize(mix(_e712, _e713, vec3(smoothstep(0.13f, 0.3f, (1f - dot(_e717, _e718))))));
            }
            let _e725 = river_3;
            let _e726 = global.uLiquid2_;
            if (_e725 && (_e726.y > 0.9f)) {
                let _e731 = albedo;
                let _e738 = fv_2;
                albedo = mix(_e731, vec3<f32>(0.055f, 0.045f, 0.025f), vec3(clamp((0.25f + (0.3f * _e738)), 0f, 0.75f)));
            }
            let _e746 = global.uToFixed;
            let _e748 = nF_1;
            Nw = normalize((transpose(_e746) * _e748));
            let _e752 = Nw;
            let _e753 = V_2;
            let _e756 = Nw;
            let _e757 = V_2;
            Nw = normalize((_e752 + (_e753 * max(0f, (0.02f - dot(_e756, _e757))))));
            let _e764 = Nw;
            let _e765 = V_2;
            NdV = max(dot(_e764, _e765), 0.001f);
            let _e770 = Nw;
            let _e771 = global.uSunDir;
            ndlW = max(dot(_e770, _e771), 0f);
            let _e776 = global.uLiquid;
            F0_ = _e776.x;
            let _e779 = F0_;
            let _e781 = wr;
            let _e783 = F0_;
            let _e785 = F0_;
            let _e788 = NdV;
            F = (_e779 + ((max((1f - _e781), _e783) - _e785) * pow((1f - _e788), 5f)));
            let _e795 = V_2;
            let _e797 = Nw;
            R_3 = reflect(-(_e795), _e797);
            let _e800 = R_3;
            let _e801 = up_4;
            el = max(dot(_e800, _e801), 0f);
            let _e809 = el;
            let _e818 = el;
            let _e823 = cloudT;
            skyG = mix((0.7f + (1.1f * pow((1f - _e809), 3f))), (0.4286f * (1f + (2f * _e818))), clamp((1f - _e823), 0f, 1f));
            let _e830 = global.uSunE;
            let _e831 = skyE_1;
            let _e836 = skyG;
            let _e838 = global.uSunE;
            let _e839 = sunT;
            let _e843 = R_3;
            let _e844 = global.uSunDir;
            skyRefl = ((((_e830 * _e831) / vec3(3.1415927f)) * _e836) + (((_e838 * _e839) * 0.05f) * pow(max(dot(_e843, _e844), 0f), 12f)));
            let _e853 = global.uMoonE;
            if (_e853.y > 0f) {
                {
                    let _e857 = up_4;
                    let _e858 = global.uMoonDir;
                    muMr = dot(_e857, _e858);
                    let _e861 = skyRefl;
                    let _e862 = global.uMoonE;
                    let _e863 = r_10;
                    let _e864 = muMr;
                    let _e865 = atmoSkyIrradiance(_e863, _e864);
                    let _e870 = skyG;
                    let _e872 = global.uMoonE;
                    let _e873 = r_10;
                    let _e874 = muMr;
                    let _e877 = atmoSunTransmittance(_e873, max(_e874, 0f));
                    let _e881 = R_3;
                    let _e882 = global.uMoonDir;
                    skyRefl = (_e861 + ((((_e862 * _e865) / vec3(3.1415927f)) * _e870) + (((_e872 * _e877) * 0.05f) * pow(max(dot(_e881, _e882), 0f), 12f))));
                }
            }
            let _e891 = albedo;
            let _e895 = global.uSunE;
            let _e896 = sunT;
            let _e898 = muS_2;
            let _e904 = global.uSunE;
            let _e905 = skyE_1;
            body = ((_e891 / vec3(3.1415927f)) * ((((_e895 * _e896) * max(_e898, 0f)) * 0.6f) + ((_e904 * _e905) * 0.5f)));
            let _e912 = river_3;
            let _e913 = global.uLiquid2_;
            if (_e912 && (_e913.y > 0.9f)) {
                {
                    let _e919 = fv_2;
                    let _e921 = fv_2;
                    let _e923 = fv_2;
                    ssc = clamp((((30f * _e919) * _e921) * _e923), 0.5f, 3000f);
                    let _e929 = global.uLiquid3_;
                    let _e931 = ssc;
                    let _e938 = global.uLiquid3_;
                    a_10 = ((_e929.xyz + (_e931 * vec3<f32>(0.012f, 0.02f, 0.035f))) + (_e938.w * vec3<f32>(0.078f, 0.207f, 0.687f)));
                    let _e950 = ssc;
                    bb = vec3((0.00475f * _e950));
                    let _e955 = bb;
                    let _e957 = a_10;
                    let _e958 = bb;
                    let _e964 = global.uSunE;
                    let _e965 = sunT;
                    let _e967 = muS_2;
                    let _e971 = global.uSunE;
                    let _e972 = skyE_1;
                    body = ((((0.33f * _e955) / (_e957 + _e958)) / vec3(3.1415927f)) * (((_e964 * _e965) * max(_e967, 0f)) + (_e971 * _e972)));
                }
            }
            let _e976 = V_2;
            let _e977 = global.uSunDir;
            H_1 = normalize((_e976 + _e977));
            let _e981 = wr;
            let _e982 = wr;
            let _e984 = wr;
            let _e986 = wr;
            a2_ = (((_e981 * _e982) * _e984) * _e986);
            let _e989 = a2_;
            a2s = max(_e989, 0.0000001f);
            let _e993 = Nw;
            let _e994 = H_1;
            NdH = max(dot(_e993, _e994), 0f);
            let _e999 = V_2;
            let _e1000 = H_1;
            VdH = max(dot(_e999, _e1000), 0f);
            let _e1005 = a2s;
            let _e1006 = NdH;
            let _e1007 = NdH;
            let _e1009 = a2s;
            Dg = (_e1005 / (PI * pow((((_e1006 * _e1007) * (_e1009 - 1f)) + 1f), 2f)));
            let _e1020 = wr;
            let _e1023 = wr;
            kg = (((_e1020 + 1f) * (_e1023 + 1f)) / 8f);
            let _e1030 = NdV;
            let _e1031 = NdV;
            let _e1033 = kg;
            let _e1036 = kg;
            let _e1039 = ndlW;
            let _e1041 = ndlW;
            let _e1043 = kg;
            let _e1046 = kg;
            Gg = (((_e1030 / ((_e1031 * (1f - _e1033)) + _e1036)) * _e1039) / ((_e1041 * (1f - _e1043)) + _e1046));
            let _e1050 = F0_;
            let _e1052 = F0_;
            let _e1055 = VdH;
            Fs = (_e1050 + ((1f - _e1052) * pow((1f - _e1055), 5f)));
            let _e1062 = body;
            let _e1064 = F;
            let _e1067 = skyRefl;
            let _e1068 = F;
            let _e1071 = global.uSunE;
            let _e1072 = sunT;
            let _e1074 = Dg;
            let _e1076 = Gg;
            let _e1078 = Fs;
            let _e1081 = NdV;
            let _e1086 = muS_2;
            color = (((_e1062 * (1f - _e1064)) + (_e1067 * _e1068)) + ((((((_e1071 * _e1072) * _e1074) * _e1076) * _e1078) / vec3((4f * _e1081))) * step(0f, _e1086)));
            let _e1090 = global.uMoonE;
            if (_e1090.y > 0f) {
                {
                    let _e1094 = up_4;
                    let _e1095 = global.uMoonDir;
                    muMn = dot(_e1094, _e1095);
                    let _e1098 = muMn;
                    if (_e1098 > -0.02f) {
                        {
                            let _e1102 = V_2;
                            let _e1103 = global.uMoonDir;
                            Hm = normalize((_e1102 + _e1103));
                            let _e1107 = Nw;
                            let _e1108 = Hm;
                            NdHm = max(dot(_e1107, _e1108), 0f);
                            let _e1113 = V_2;
                            let _e1114 = Hm;
                            VdHm = max(dot(_e1113, _e1114), 0f);
                            let _e1119 = Nw;
                            let _e1120 = global.uMoonDir;
                            ndlM = max(dot(_e1119, _e1120), 0f);
                            let _e1125 = a2s;
                            let _e1126 = NdHm;
                            let _e1127 = NdHm;
                            let _e1129 = a2s;
                            Dm = (_e1125 / (PI * pow((((_e1126 * _e1127) * (_e1129 - 1f)) + 1f), 2f)));
                            let _e1140 = NdV;
                            let _e1141 = NdV;
                            let _e1143 = kg;
                            let _e1146 = kg;
                            let _e1149 = ndlM;
                            let _e1151 = ndlM;
                            let _e1153 = kg;
                            let _e1156 = kg;
                            Gm = (((_e1140 / ((_e1141 * (1f - _e1143)) + _e1146)) * _e1149) / ((_e1151 * (1f - _e1153)) + _e1156));
                            let _e1160 = F0_;
                            let _e1162 = F0_;
                            let _e1165 = VdHm;
                            Fm = (_e1160 + ((1f - _e1162) * pow((1f - _e1165), 5f)));
                            let _e1172 = color;
                            let _e1173 = global.uMoonE;
                            let _e1174 = r_10;
                            let _e1175 = muMn;
                            let _e1178 = atmoSunTransmittance(_e1174, max(_e1175, 0f));
                            let _e1180 = cloudDirZ;
                            let _e1182 = Dm;
                            let _e1184 = Gm;
                            let _e1186 = Fm;
                            let _e1189 = NdV;
                            color = (_e1172 + ((((((_e1173 * _e1178) * _e1180) * _e1182) * _e1184) * _e1186) / vec3((4f * _e1189))));
                        }
                    }
                }
            }
            let _e1194 = global.uSunE;
            let _e1195 = sunT;
            let _e1197 = up_4;
            let _e1198 = global.uSunDir;
            let _e1203 = global.uSunE;
            let _e1204 = skyE_1;
            lit_1 = (((_e1194 * _e1195) * max(dot(_e1197, _e1198), 0f)) + (_e1203 * _e1204));
            let _e1208 = river_3;
            if _e1208 {
                let _e1212 = fn_;
                let _e1213 = upF_7;
                local_75 = smoothstep(0.13f, 0.3f, (1f - dot(_e1212, _e1213)));
            } else {
                local_75 = 0f;
            }
            let _e1219 = local_75;
            fallK = _e1219;
            let _e1223 = fallK;
            if (_e1223 > 0f) {
                {
                    let _e1226 = upF_7;
                    let _e1227 = fn_;
                    let _e1228 = upF_7;
                    let _e1229 = fn_;
                    dn_4 = (_e1226 - (_e1227 * dot(_e1228, _e1229)));
                    let _e1234 = dn_4;
                    let _e1236 = dn_4;
                    down = (-(_e1234) / vec3(max(length(_e1236), 0.0001f)));
                    let _e1243 = fn_;
                    let _e1244 = down;
                    acr = normalize(cross(_e1243, _e1244));
                    let _e1248 = global.uFallTop;
                    if (_e1248 > 0f) {
                        let _e1251 = global.uFallTop;
                        let _e1252 = r_10;
                        local_76 = max((_e1251 - _e1252), 0f);
                    } else {
                        local_76 = 4f;
                    }
                    let _e1258 = local_76;
                    zf = _e1258;
                    let _e1261 = global.uFall1_;
                    let _e1264 = zf;
                    let _e1269 = global.uFall1_;
                    v_1 = min((sqrt(((2f * _e1261.x) * _e1264)) + 0.3f), _e1269.y);
                    let _e1273 = global.uTime;
                    t1_ = fract((_e1273 * 0.4f));
                    let _e1278 = global.uTime;
                    t2_ = fract(((_e1278 * 0.4f) + 0.5f));
                    let _e1287 = t1_;
                    wa_2 = (1f - abs(((2f * _e1287) - 1f)));
                    let _e1296 = v_1;
                    L_7 = (1f + (0.12f * _e1296));
                    let _e1300 = vFixedPos_1;
                    let _e1301 = global.uOriginMod;
                    let _e1303 = global.uFallTop;
                    if (_e1303 > 0f) {
                        let _e1306 = global.uFallFoot;
                        local_77 = _e1306;
                    } else {
                        local_77 = vec3(0f);
                    }
                    let _e1310 = local_77;
                    pS = ((_e1300 - _e1301) - _e1310);
                    let _e1313 = pS;
                    let _e1314 = acr;
                    let _e1318 = pS;
                    let _e1319 = down;
                    let _e1322 = L_7;
                    q_6 = vec2<f32>((dot(_e1313, _e1314) / 4.8f), (dot(_e1318, _e1319) / (48f * _e1322)));
                    let _e1327 = v_1;
                    let _e1331 = L_7;
                    dv_1 = ((_e1327 * 2.5f) / (48f * _e1331));
                    let _e1335 = q_6;
                    let _e1337 = dv_1;
                    let _e1338 = t1_;
                    qA = (_e1335 - vec2<f32>(0f, (_e1337 * _e1338)));
                    let _e1343 = q_6;
                    let _e1349 = dv_1;
                    let _e1350 = t2_;
                    qB = ((_e1343 + vec2<f32>(0.37f, 0f)) - vec2<f32>(0f, (_e1349 * _e1350)));
                    let _e1355 = qA;
                    let _e1357 = textureSampleLevel(tDetailTexture, tDetailSampler, _e1355, 0f);
                    bA = _e1357.x;
                    let _e1360 = qB;
                    let _e1362 = textureSampleLevel(tDetailTexture, tDetailSampler, _e1360, 0f);
                    bB = _e1362.x;
                    let _e1365 = bA;
                    let _e1367 = q_6;
                    let _e1378 = dv_1;
                    let _e1380 = t1_;
                    let _e1385 = textureSampleLevel(tDetailTexture, tDetailSampler, (((_e1367 * vec2<f32>(3f, 2f)) + vec2<f32>(0.53f, 0f)) - vec2<f32>(0f, ((2f * _e1378) * _e1380))), 0f);
                    sA = (_e1365 + (0.45f * _e1385.x));
                    let _e1390 = bB;
                    let _e1392 = q_6;
                    let _e1403 = dv_1;
                    let _e1405 = t2_;
                    let _e1410 = textureSampleLevel(tDetailTexture, tDetailSampler, (((_e1392 * vec2<f32>(3f, 2f)) + vec2<f32>(0.11f, 0f)) - vec2<f32>(0f, ((2f * _e1403) * _e1405))), 0f);
                    sB = (_e1390 + (0.45f * _e1410.x));
                    let _e1416 = sB;
                    let _e1417 = sA;
                    let _e1418 = wa_2;
                    st_2 = clamp((0.5f + ((mix(_e1416, _e1417, _e1418) - 0.725f) * 2.2f)), 0f, 1f);
                    let _e1429 = qB;
                    let _e1435 = textureSampleLevel(tDetailTexture, tDetailSampler, (_e1429 + vec2<f32>(0.031f, 0f)), 0f);
                    let _e1437 = bB;
                    let _e1439 = qA;
                    let _e1445 = textureSampleLevel(tDetailTexture, tDetailSampler, (_e1439 + vec2<f32>(0.031f, 0f)), 0f);
                    let _e1447 = bA;
                    let _e1449 = wa_2;
                    gS = (mix((_e1435.x - _e1437), (_e1445.x - _e1447), _e1449) / 0.15f);
                    let _e1456 = vFlw_1;
                    qU = max((_e1456.w * 9f), 0.3f);
                    let _e1463 = zf;
                    let _e1465 = qU;
                    br = clamp((_e1463 / (6f * pow(_e1465, 0.32f))), 0f, 1f);
                    let _e1476 = global.uFall2_;
                    let _e1481 = zf;
                    aer = (mix(0.25f, 0.95f, _e1476.y) * smoothstep(0f, 0.5f, _e1481));
                    let _e1487 = br;
                    th_2 = mix(0.72f, 0.22f, _e1487);
                    let _e1490 = th_2;
                    let _e1493 = th_2;
                    let _e1496 = st_2;
                    let _e1498 = edge;
                    jets = smoothstep((_e1490 - 0.14f), (_e1493 + 0.14f), (_e1496 + (0.75f * (_e1498 - 1f))));
                    let _e1505 = aer;
                    let _e1506 = jets;
                    white = clamp((_e1505 * _e1506), 0f, 1f);
                    let _e1512 = white;
                    dbgWhite = _e1512;
                    let _e1513 = Nw;
                    let _e1514 = global.uToFixed;
                    let _e1516 = acr;
                    let _e1518 = gS;
                    nS = normalize((_e1513 + ((transpose(_e1514) * _e1516) * clamp((_e1518 * 1.6f), -0.9f, 0.9f))));
                    let _e1529 = global.uSunE;
                    let _e1530 = sunT;
                    let _e1532 = nS;
                    let _e1533 = global.uSunDir;
                    let _e1538 = global.uSunE;
                    let _e1539 = skyE_1;
                    litS = (((_e1529 * _e1530) * max(dot(_e1532, _e1533), 0f)) + ((_e1538 * _e1539) * 0.6f));
                    let _e1549 = st_2;
                    albS = mix(0.5f, 0.92f, smoothstep(0.15f, 0.85f, _e1549));
                    let _e1553 = color;
                    let _e1554 = color;
                    let _e1557 = albS;
                    let _e1562 = litS;
                    let _e1564 = white;
                    let _e1567 = fallK;
                    color = mix(_e1553, mix((_e1554 * 0.8f), ((vec3(_e1557) / vec3(3.1415927f)) * _e1562), vec3(_e1564)), vec3(_e1567));
                    let _e1570 = foam_1;
                    let _e1572 = fallK;
                    foam_1 = (_e1570 * (1f - _e1572));
                }
            }
            let _e1575 = global.uFallTop;
            if (_e1575 > 0f) {
                {
                    let _e1578 = vFixedPos_1;
                    let _e1579 = global.uOriginMod;
                    let _e1581 = global.uFallFoot;
                    Lf = ((_e1578 - _e1579) - _e1581);
                    let _e1585 = global.uFallAcr;
                    let _e1586 = global.uFallAcr;
                    hasA = step(0.5f, dot(_e1585, _e1586));
                    let _e1590 = Lf;
                    let _e1591 = global.uFallAcr;
                    let _e1595 = global.uFallW;
                    let _e1598 = global.uFallW;
                    let _e1601 = hasA;
                    al_2 = (clamp(dot(_e1590, _e1591), (-0.5f * _e1595), (0.5f * _e1598)) * _e1601);
                    let _e1604 = Lf;
                    let _e1605 = global.uFallAcr;
                    let _e1606 = al_2;
                    let _e1610 = global.uFallW;
                    let _e1619 = global.uFallW;
                    let _e1622 = hasA;
                    dF = (length((_e1604 - (_e1605 * _e1606))) / mix(max(((_e1610 * 1.2f) + 2f), 2f), (3f + (0.15f * _e1619)), _e1622));
                    let _e1626 = vFlw_1;
                    flL = length(_e1626.xyz);
                    let _e1630 = flL;
                    if (_e1630 > 0.0001f) {
                        let _e1633 = vFlw_1;
                        let _e1635 = flL;
                        local_78 = (_e1633.xyz / vec3(_e1635));
                    } else {
                        let _e1638 = upF_7;
                        local_78 = normalize((cross(_e1638, vec3<f32>(0f, 0f, 1f)) + vec3<f32>(0.0001f, 0f, 0f)));
                    }
                    let _e1651 = local_78;
                    fd_1 = _e1651;
                    let _e1653 = upF_7;
                    let _e1654 = fd_1;
                    fa_1 = normalize(cross(_e1653, _e1654));
                    let _e1658 = Lf;
                    let _e1659 = fa_1;
                    let _e1661 = Lf;
                    let _e1662 = fd_1;
                    let _e1664 = global.uTime;
                    let _e1665 = flL;
                    q2_ = (vec2<f32>(dot(_e1658, _e1659), (dot(_e1661, _e1662) - (_e1664 * max((_e1665 * 9f), 0.4f)))) * 0.18f);
                    let _e1676 = q2_;
                    let _e1678 = textureSampleLevel(tDetailTexture, tDetailSampler, _e1676, 0f);
                    let _e1682 = q2_;
                    let _e1689 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e1682 * 2.7f) + vec2(0.31f)), 0f);
                    fz = ((_e1678.x * 0.65f) + (_e1689.w * 0.35f));
                    let _e1698 = dF;
                    core = (1f - smoothstep(0.05f, 0.45f, _e1698));
                    let _e1705 = dF;
                    ring_1 = (1f - smoothstep(0.2f, 1f, _e1705));
                    let _e1709 = core;
                    let _e1712 = ring_1;
                    let _e1715 = ring_1;
                    let _e1719 = fz;
                    fm = max((_e1709 * 0.9f), (_e1712 * smoothstep((0.55f - (0.3f * _e1715)), 0.8f, _e1719)));
                    let _e1724 = foam_1;
                    let _e1725 = fm;
                    let _e1728 = global.uFall2_;
                    let _e1733 = fallK;
                    foam_1 = max(_e1724, ((_e1725 * mix(0.35f, 0.95f, _e1728.y)) * (1f - _e1733)));
                }
            }
            let _e1737 = color;
            let _e1748 = lit_1;
            let _e1750 = foam_1;
            color = mix(_e1737, (vec3<f32>(0.23873241f, 0.23873241f, 0.23873241f) * _e1748), vec3(clamp(_e1750, 0f, 1f)));
            let _e1756 = ice_8;
            if (_e1756 > 0f) {
                {
                    let _e1759 = nW;
                    dI = _e1759;
                    let _e1761 = nG;
                    dJ = _e1761;
                    let _e1763 = kind_4;
                    if (_e1763 < 0.2f) {
                        {
                            let _e1768 = lead_1;
                            let _e1772 = fl;
                            lIce = (smoothstep(0.3f, 1.5f, _e1768.x) * (1f - _e1772.x));
                            let _e1780 = lead_1;
                            let _e1799 = lead_1;
                            lAlb = mix((vec3((0.07f + (0.33f * (1f - exp((-(_e1780.x) / 10f)))))) * vec3<f32>(0.92f, 0.97f, 1f)), vec3<f32>(0.82f, 0.86f, 0.9f), vec3(_e1799.y));
                            let _e1804 = color;
                            let _e1805 = lAlb;
                            let _e1809 = global.uSunE;
                            let _e1810 = sunT;
                            let _e1812 = muS_2;
                            let _e1816 = global.uSunE;
                            let _e1817 = skyE_1;
                            let _e1821 = lIce;
                            color = mix(_e1804, ((_e1805 / vec3(3.1415927f)) * (((_e1809 * _e1810) * max(_e1812, 0f)) + (_e1816 * _e1817))), vec3(_e1821));
                            let _e1824 = albedo;
                            let _e1825 = lAlb;
                            let _e1826 = lIce;
                            albedo = mix(_e1824, _e1825, vec3(_e1826));
                        }
                    }
                    let _e1829 = fl;
                    ice_8 = _e1829.x;
                    let _e1831 = global.uSeason;
                    if (_e1831.z > 0.5f) {
                        let _e1838 = Tair_2;
                        local_79 = smoothstep(-1f, 2f, _e1838);
                    } else {
                        local_79 = 0f;
                    }
                    let _e1842 = local_79;
                    thaw = _e1842;
                    let _e1846 = fl;
                    let _e1848 = dJ;
                    let _e1858 = fl;
                    let _e1861 = fl;
                    let _e1870 = thaw;
                    snowy = ((smoothstep(0.3f, 0.7f, (_e1846.z + ((_e1848.w - 0.5f) * 0.25f))) * (1f - ((0.7f * _e1858.y) / max(_e1861.x, 0.001f)))) * (1f - (0.7f * _e1870)));
                    let _e1883 = snowy;
                    let _e1888 = dI;
                    iceAlb = (mix(vec3<f32>(0.42f, 0.52f, 0.6f), vec3<f32>(0.82f, 0.86f, 0.9f), vec3(_e1883)) * (0.9f + (0.2f * _e1888.x)));
                    let _e1894 = global.uSeason;
                    if (_e1894.z > 0.5f) {
                        let _e1898 = Tair_2;
                        let _e1899 = dJ;
                        let _e1903 = fp_6;
                        let _e1904 = w_8;
                        let _e1906 = tri(_e1903, _e1904, 8f);
                        let _e1911 = meltPond(_e1898, ((_e1899.x * 0.6f) + (_e1906.x * 0.4f)));
                        let _e1915 = ridge_2;
                        local_80 = (_e1911 * (1f - smoothstep(0f, 0.2f, _e1915.w)));
                    } else {
                        local_80 = 0f;
                    }
                    let _e1922 = local_80;
                    pond_1 = _e1922;
                    let _e1924 = iceAlb;
                    let _e1929 = pond_1;
                    iceAlb = mix(_e1924, vec3<f32>(0.12f, 0.32f, 0.45f), vec3(_e1929));
                    let _e1932 = up_4;
                    let _e1933 = N_3;
                    N2_ = normalize(mix(_e1932, _e1933, vec3(0.5f)));
                    let _e1939 = ridge_2;
                    if (_e1939.w > 0f) {
                        {
                            let _e1943 = fp_6;
                            let _e1944 = w_8;
                            let _e1946 = tri(_e1943, _e1944, 2f);
                            blk = _e1946.x;
                            let _e1949 = iceAlb;
                            let _e1960 = blk;
                            let _e1966 = ridge_2;
                            iceAlb = mix(_e1949, mix(vec3<f32>(0.5f, 0.62f, 0.7f), vec3<f32>(0.85f, 0.88f, 0.92f), vec3(smoothstep(0.35f, 0.6f, _e1960))), vec3(smoothstep(0f, 0.2f, _e1966.w)));
                            let _e1971 = N2_;
                            let _e1972 = global.uToFixed;
                            let _e1974 = ridge_2;
                            let _e1981 = ridge_2;
                            N2_ = normalize((_e1971 + (((transpose(_e1972) * _e1974.xyz) * 0.5f) * smoothstep(0f, 0.1f, _e1981.w))));
                        }
                    }
                    let _e1987 = iceAlb;
                    let _e1991 = global.uSunE;
                    let _e1992 = sunT;
                    let _e1994 = N2_;
                    let _e1995 = global.uSunDir;
                    let _e2000 = global.uSunE;
                    let _e2001 = skyE_1;
                    let _e2005 = N2_;
                    let _e2006 = up_4;
                    iceCol = ((_e1987 / vec3(3.1415927f)) * (((_e1991 * _e1992) * max(dot(_e1994, _e1995), 0f)) + ((_e2000 * _e2001) * (0.5f + (0.5f * dot(_e2005, _e2006))))));
                    let _e2014 = N2_;
                    let _e2015 = H_1;
                    NdH2_ = max(dot(_e2014, _e2015), 0f);
                    let _e2020 = iceCol;
                    let _e2021 = global.uSunE;
                    let _e2022 = sunT;
                    let _e2024 = NdH2_;
                    let _e2027 = snowy;
                    let _e2034 = muS_2;
                    iceCol = (_e2020 + ((((_e2021 * _e2022) * pow(_e2024, mix(400f, 40f, _e2027))) * 0.04f) * step(0f, _e2034)));
                    let _e2038 = iceCol;
                    let _e2039 = global.uSunE;
                    let _e2040 = sunT;
                    let _e2042 = up_4;
                    let _e2043 = N2_;
                    let _e2048 = H_1;
                    let _e2057 = pond_1;
                    let _e2060 = muS_2;
                    iceCol = (_e2038 + (((((_e2039 * _e2040) * pow(max(dot(normalize(mix(_e2042, _e2043, vec3(0.2f))), _e2048), 0f), 600f)) * 0.4f) * _e2057) * step(0f, _e2060)));
                    let _e2064 = color;
                    let _e2065 = iceCol;
                    let _e2066 = ice_8;
                    color = mix(_e2064, _e2065, vec3(_e2066));
                    let _e2069 = albedo;
                    let _e2070 = iceAlb;
                    let _e2071 = ice_8;
                    albedo = mix(_e2069, _e2070, vec3(_e2071));
                }
            }
            let _e2074 = fallK;
            if (_e2074 > 0f) {
                {
                    let _e2078 = tsf;
                    let _e2082 = tsf;
                    let _e2086 = tsf;
                    iceF = (1f - smoothstep((_e2078.y - 12f), (_e2082.y - 4f), _e2086.x));
                    let _e2091 = iceF;
                    if (_e2091 > 0f) {
                        {
                            let _e2094 = upF_7;
                            let _e2095 = fn_;
                            let _e2096 = upF_7;
                            let _e2097 = fn_;
                            dnI = (_e2094 - (_e2095 * dot(_e2096, _e2097)));
                            let _e2102 = dnI;
                            let _e2104 = dnI;
                            downI = (-(_e2102) / vec3(max(length(_e2104), 0.0001f)));
                            let _e2111 = fn_;
                            let _e2112 = downI;
                            acrI = normalize(cross(_e2111, _e2112));
                            let _e2116 = vFixedPos_1;
                            let _e2117 = global.uOriginMod;
                            let _e2119 = global.uFallTop;
                            if (_e2119 > 0f) {
                                let _e2122 = global.uFallFoot;
                                local_81 = _e2122;
                            } else {
                                local_81 = vec3(0f);
                            }
                            let _e2126 = local_81;
                            pI = ((_e2116 - _e2117) - _e2126);
                            let _e2129 = pI;
                            let _e2130 = acrI;
                            let _e2132 = pI;
                            let _e2133 = downI;
                            qi = vec2<f32>(dot(_e2129, _e2130), dot(_e2132, _e2133));
                            let _e2137 = qi;
                            let _e2141 = qi;
                            qa_1 = vec2<f32>((_e2137.x * 0.2f), (_e2141.y * 0.015f));
                            let _e2147 = qi;
                            let _e2153 = qi;
                            qb_1 = vec2<f32>(((_e2147.x * 0.6f) + 0.3f), (_e2153.y * 0.04f));
                            let _e2159 = qa_1;
                            let _e2161 = textureSampleLevel(tDetailTexture, tDetailSampler, _e2159, 0f);
                            let _e2165 = qb_1;
                            let _e2167 = textureSampleLevel(tDetailTexture, tDetailSampler, _e2165, 0f);
                            cols = ((_e2161.x * 0.6f) + (_e2167.w * 0.4f));
                            let _e2173 = qa_1;
                            let _e2179 = textureSampleLevel(tDetailTexture, tDetailSampler, (_e2173 + vec2<f32>(0.01f, 0f)), 0f);
                            let _e2183 = qb_1;
                            let _e2189 = textureSampleLevel(tDetailTexture, tDetailSampler, (_e2183 + vec2<f32>(0.03f, 0f)), 0f);
                            colsX = ((_e2179.x * 0.6f) + (_e2189.w * 0.4f));
                            let _e2197 = cols;
                            thick = smoothstep(0.35f, 0.7f, _e2197);
                            let _e2208 = thick;
                            alb = mix(vec3<f32>(0.2f, 0.4f, 0.56f), vec3<f32>(0.88f, 0.93f, 0.97f), vec3(_e2208));
                            let _e2212 = Nw;
                            let _e2213 = global.uToFixed;
                            let _e2215 = acrI;
                            let _e2217 = colsX;
                            let _e2218 = cols;
                            nI = normalize((_e2212 - (((transpose(_e2213) * _e2215) * (_e2217 - _e2218)) * 30f)));
                            let _e2226 = global.uSunE;
                            let _e2227 = sunT;
                            let _e2229 = nI;
                            let _e2230 = global.uSunDir;
                            let _e2235 = global.uSunE;
                            let _e2236 = skyE_1;
                            litI = (((_e2226 * _e2227) * max(dot(_e2229, _e2230), 0f)) + ((_e2235 * _e2236) * 0.7f));
                            let _e2242 = nI;
                            let _e2243 = V_2;
                            let _e2244 = global.uSunDir;
                            spI = (pow(max(dot(_e2242, normalize((_e2243 + _e2244))), 0f), 60f) * 0.6f);
                            let _e2255 = color;
                            let _e2256 = alb;
                            let _e2260 = litI;
                            let _e2262 = global.uSunE;
                            let _e2263 = sunT;
                            let _e2265 = spI;
                            let _e2268 = muS_2;
                            let _e2272 = fallK;
                            let _e2273 = iceF;
                            color = mix(_e2255, (((_e2256 / vec3(3.1415927f)) * _e2260) + (((_e2262 * _e2263) * _e2265) * step(0f, _e2268))), vec3((_e2272 * _e2273)));
                        }
                    }
                }
            }
            let _e2277 = global.uDebug;
            if (_e2277 > 6.5f) {
                let _e2280 = fallK;
                let _e2281 = dbgWhite;
                let _e2282 = river_3;
                if _e2282 {
                    local_82 = 1f;
                } else {
                    local_82 = 0f;
                }
                let _e2286 = local_82;
                local_87 = vec3<f32>(_e2280, _e2281, _e2286);
            } else {
                let _e2288 = global.uDebug;
                if (_e2288 < 2.5f) {
                    let _e2291 = ice_8;
                    local_86 = vec3(_e2291);
                } else {
                    let _e2293 = global.uDebug;
                    if (_e2293 < 3.5f) {
                        let _e2296 = Tm_2;
                        local_85 = vec3((_e2296 / 40f));
                    } else {
                        let _e2300 = global.uDebug;
                        if (_e2300 < 4.5f) {
                            let _e2303 = foam_1;
                            local_84 = vec3(_e2303);
                        } else {
                            let _e2305 = global.uDebug;
                            if (_e2305 < 5.5f) {
                                let _e2308 = vLiq_1;
                                local_83 = _e2308.xyz;
                            } else {
                                let _e2310 = wr;
                                local_83 = vec3((_e2310 * 4f));
                            }
                            let _e2315 = local_83;
                            local_84 = _e2315;
                        }
                        let _e2317 = local_84;
                        local_85 = _e2317;
                    }
                    let _e2319 = local_85;
                    local_86 = _e2319;
                }
                let _e2321 = local_86;
                local_87 = _e2321;
            }
            let _e2323 = local_87;
            dbgW = _e2323;
        }
    }
    let _e2324 = global.uThermal;
    if (_e2324.x > 0f) {
        {
            let _e2328 = albedo;
            a_11 = clamp(_e2328, vec3(0f), vec3(1f));
            let _e2335 = color;
            let _e2338 = a_11;
            let _e2340 = global.uThermal;
            let _e2342 = global.uThermal;
            let _e2344 = r_10;
            let _e2345 = global.uRadius;
            let _e2349 = blackbodyGlow((_e2340.x - (_e2342.y * (_e2344 - _e2345))));
            color = (_e2335 + ((vec3(1f) - _e2338) * _e2349));
            let _e2352 = color;
            let _e2353 = a_11;
            let _e2356 = r_10;
            let _e2358 = atmoSunTransmittance(_e2356, 1f);
            let _e2361 = global.uThermal;
            let _e2363 = global.uThermal;
            let _e2365 = r_10;
            let _e2366 = global.uRadius;
            let _e2372 = blackbodyGlow((_e2361.x - (_e2363.z * max((_e2365 - _e2366), 0f))));
            color = (_e2352 + ((_e2353 * (vec3(1f) - _e2358)) * _e2372));
        }
    }
    let _e2375 = emissive;
    if (_e2375 > 0.01f) {
        {
            let _e2380 = global.uTime;
            let _e2383 = vFixedPos_1;
            let _e2388 = vFixedPos_1;
            flick = (0.85f + (0.15f * sin((((_e2380 * 1.7f) + (_e2383.x * 0.05f)) + (_e2388.z * 0.07f)))));
            let _e2399 = fp_6;
            let _e2400 = w_8;
            let _e2402 = tri(_e2399, _e2400, 128f);
            crust = smoothstep(0.35f, 0.65f, _e2402.w);
            let _e2406 = color;
            let _e2407 = global.uLavaColor;
            let _e2408 = emissive;
            let _e2410 = flick;
            let _e2414 = crust;
            let _e2416 = emissive;
            color = (_e2406 + (((_e2407 * _e2408) * _e2410) * mix(1f, 0.15f, (_e2414 * (1f - (_e2416 * 0.5f))))));
        }
    }
    let _e2424 = global.uDebug;
    if (_e2424 > 1.5f) {
        let _e2427 = dbgW;
        if (_e2427.x < 0f) {
            let _e2435 = waterEnc;
            local_88 = ((vec3<f32>(0.5f, 0f, 0.5f) * _e2435) * 50f);
        } else {
            let _e2439 = dbgW;
            local_88 = _e2439;
        }
        let _e2441 = local_88;
        let _e2442 = global.uDebug;
        if (_e2442 > 7.5f) {
            local_89 = 0.02f;
        } else {
            local_89 = 1f;
        }
        let _e2448 = local_89;
        color = (_e2441 * _e2448);
    } else {
        let _e2450 = global.uDebug;
        if (_e2450 > 0.5f) {
            let _e2453 = color;
            let _e2454 = vMorphK_1;
            let _e2456 = vMorphK_1;
            color = mix(_e2453, (vec3<f32>(_e2454, (1f - _e2456), 0f) * 0.2f), vec3(0.5f));
        }
    }
    let _e2465 = color;
    fragmentColor = vec4<f32>(_e2465.x, _e2465.y, _e2465.z, 1f);
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
    let _e259 = fragmentColor;
    return FragmentOutput(_e259);
}
`;
