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
    let _e172 = n_3;
    return (0.55f + ((_e172 - 0.682f) * 4.3f));
}

fn cloudBias(cover: f32) -> f32 {
    var cover_1: f32;

    cover_1 = cover;
    let _e171 = cover_1;
    let _e179 = cover_1;
    let _e187 = cover_1;
    return ((((_e171 - 0.5f) * 0.3f) + (0.5f * smoothstep(0.8f, 1f, _e179))) - (0.5f * (1f - smoothstep(0f, 0.2f, _e187))));
}

fn cloudFade(foot: f32, L: f32) -> f32 {
    var foot_1: f32;
    var L_1: f32;

    foot_1 = foot;
    L_1 = L;
    let _e175 = foot_1;
    let _e178 = L_1;
    return smoothstep(1f, 4f, ((_e175 * 64f) / _e178));
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
    let _e172 = textureDimensions(tCloudMapTexture, 0i);
    sz = vec2<f32>(vec2<i32>(_e172));
    let _e176 = uv_3;
    let _e177 = sz;
    st = ((_e176 * _e177) - vec2(0.5f));
    let _e183 = st;
    i = floor(_e183);
    let _e186 = st;
    let _e187 = i;
    f_1 = (_e186 - _e187);
    let _e190 = f_1;
    let _e191 = f_1;
    f2_ = (_e190 * _e191);
    let _e194 = f2_;
    let _e195 = f_1;
    f3_ = (_e194 * _e195);
    let _e200 = f_1;
    let _e205 = f2_;
    let _e208 = f3_;
    w0_ = ((((vec2(1f) - (3f * _e200)) + (3f * _e205)) - _e208) / vec2(6f));
    let _e216 = f2_;
    let _e221 = f3_;
    w1_ = (((vec2(4f) - (6f * _e216)) + (3f * _e221)) / vec2(6f));
    let _e230 = f_1;
    let _e235 = f2_;
    let _e239 = f3_;
    w2_ = ((((vec2(1f) + (3f * _e230)) + (3f * _e235)) - (3f * _e239)) / vec2(6f));
    let _e246 = f3_;
    w3_ = (_e246 / vec2(6f));
    let _e251 = w0_;
    let _e252 = w1_;
    g0_ = (_e251 + _e252);
    let _e255 = w2_;
    let _e256 = w3_;
    g1_ = (_e255 + _e256);
    let _e259 = i;
    let _e263 = w1_;
    let _e264 = g0_;
    let _e267 = sz;
    h0_ = (((_e259 - vec2(0.5f)) + (_e263 / _e264)) / _e267);
    let _e270 = i;
    let _e274 = w3_;
    let _e275 = g1_;
    let _e278 = sz;
    h1_ = (((_e270 + vec2(1.5f)) + (_e274 / _e275)) / _e278);
    let _e281 = g0_;
    let _e283 = g0_;
    let _e285 = h0_;
    let _e287 = textureSampleLevel(tCloudMapTexture, tCloudMapSampler, _e285, 0f);
    let _e290 = g1_;
    let _e292 = h1_;
    let _e294 = h0_;
    let _e298 = textureSampleLevel(tCloudMapTexture, tCloudMapSampler, vec2<f32>(_e292.x, _e294.y), 0f);
    let _e303 = g1_;
    let _e305 = g0_;
    let _e307 = h0_;
    let _e309 = h1_;
    let _e313 = textureSampleLevel(tCloudMapTexture, tCloudMapSampler, vec2<f32>(_e307.x, _e309.y), 0f);
    let _e316 = g1_;
    let _e318 = h1_;
    let _e320 = textureSampleLevel(tCloudMapTexture, tCloudMapSampler, _e318, 0f);
    return ((_e281.y * ((_e283.x * _e287.xyz) + (_e290.x * _e298.xyz))) + (_e303.y * ((_e305.x * _e313.xyz) + (_e316.x * _e320.xyz))));
}

fn cloudClimate(dirF_4: vec3<f32>) -> f32 {
    var dirF_5: vec3<f32>;
    var lat: f32;
    var cm: vec3<f32>;

    dirF_5 = dirF_4;
    let _e171 = dirF_5;
    lat = asin(clamp(_e171.y, -1f, 1f));
    let _e179 = global.uCloudMapMean;
    if (_e179 <= 0f) {
        let _e183 = lat;
        return (0.12f * cos((abs(_e183) * 6f)));
    }
    let _e189 = dirF_5;
    let _e191 = dirF_5;
    let _e198 = lat;
    let _e204 = cloudMapSmooth(vec2<f32>(((atan2(_e189.z, _e191.x) / 6.2832f) + 0.5f), ((_e198 / 3.14159f) + 0.5f)));
    cm = _e204;
    let _e206 = cm;
    let _e208 = cm;
    let _e212 = global.uCloudYear;
    let _e216 = cm;
    let _e220 = global.uCloudYear;
    let _e224 = global.uCloudMapMean;
    return ((((_e206.x + ((_e208.y - 0.5f) * _e212.x)) + ((_e216.z - 0.5f) * _e220.y)) - _e224) * 0.8f);
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
    let _e177 = global.uRadius;
    L0_ = (_e177 * 1f);
    let _e181 = global.uRadius;
    L1_ = (_e181 * 0.236f);
    let _e185 = foot_3;
    let _e186 = L0_;
    let _e187 = cloudFade(_e185, _e186);
    f0_ = _e187;
    let _e189 = foot_3;
    let _e190 = L1_;
    let _e191 = cloudFade(_e189, _e190);
    f1_ = _e191;
    let _e193 = q_1;
    qz = (_e193 * vec3<f32>(0.5f, 1f, 0.5f));
    let _e200 = f0_;
    if (_e200 > 0.999f) {
        local_2 = 0.682f;
    } else {
        let _e204 = qz;
        let _e205 = L0_;
        let _e209 = textureSampleLevel(tNoiseTexture, tNoiseSampler, (_e204 / vec3(_e205)), 0f);
        let _e212 = f0_;
        local_2 = mix(_e209.x, 0.682f, _e212);
    }
    let _e215 = local_2;
    a = _e215;
    let _e217 = f1_;
    if (_e217 > 0.999f) {
        local_3 = 0.682f;
    } else {
        let _e221 = qz;
        let _e222 = L1_;
        let _e229 = textureSampleLevel(tNoiseTexture, tNoiseSampler, ((_e221 / vec3(_e222)) + vec3(0.5f)), 0f);
        let _e232 = f1_;
        local_3 = mix(_e229.x, 0.682f, _e232);
    }
    let _e235 = local_3;
    b = _e235;
    let _e238 = f0_;
    let _e241 = f1_;
    spread = length(vec2<f32>((0.124f * _e238), (0.083f * _e241)));
    let _e247 = bias_1;
    let _e249 = spread;
    let _e252 = bias_1;
    let _e254 = spread;
    let _e256 = a;
    let _e259 = b;
    let _e263 = cloudN(((_e256 * 0.6f) + (_e259 * 0.4f)));
    let _e264 = clim_1;
    return smoothstep(((0.6f - _e247) - _e249), ((0.8f - _e252) + _e254), (_e263 + _e264));
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
    let _e173 = global.uCloudClock;
    T = _e173.z;
    let _e176 = T;
    if (_e176 <= 0f) {
        {
            (*gA) = vec3<f32>(1f, 0f, 0f);
            (*gB) = vec3(0f);
            return;
        }
    }
    let _e186 = dirF_7;
    let _e190 = dirF_7;
    let _e195 = dirF_7;
    let _e201 = dirF_7;
    let _e205 = dirF_7;
    let _e210 = dirF_7;
    ph = ((((1.1f * _e186.x) + (0.7f * _e190.z)) - (0.5f * _e195.y)) + (0.35f * sin((((2.3f * _e201.y) + (1.7f * _e205.x)) - (0.9f * _e210.z)))));
    let _e218 = global.uCloudClock;
    let _e220 = T;
    let _e222 = ph;
    s = (((_e218.x / _e220) + _e222) + 4f);
    let _e227 = s;
    a_1 = floor(_e227);
    let _e230 = s;
    let _e231 = a_1;
    fa = (_e230 - _e231);
    let _e234 = s;
    b_1 = floor((_e234 + 0.5f));
    let _e239 = s;
    let _e242 = b_1;
    fb = ((_e239 + 0.5f) - _e242);
    let _e246 = dirF_7;
    let _e256 = dirF_7;
    let _e268 = dirF_7;
    j = (0.065f * ((sin((dot(_e246, vec3<f32>(5.1f, 3.7f, -4.3f)) + 1.3f)) + sin((dot(_e256, vec3<f32>(-3.9f, 7.3f, 6.1f)) + 0.4f))) + (0.6f * sin((dot(_e268, vec3<f32>(11.3f, -8.9f, 7.7f)) + 2.1f)))));
    let _e282 = s;
    let _e283 = j;
    fj = fract((_e282 + _e283));
    let _e291 = fj;
    wa = smoothstep(0.4f, 0.6f, (1f - abs(((2f * _e291) - 1f))));
    let _e299 = wa;
    let _e300 = fa;
    let _e303 = T;
    let _e306 = global.uCloudClock;
    let _e308 = a_1;
    (*gA) = vec3<f32>(_e299, ((_e300 - 0.5f) * _e303), (2f * (_e306.y + _e308)));
    let _e313 = wa;
    let _e315 = fb;
    let _e318 = T;
    let _e321 = global.uCloudClock;
    let _e323 = b_1;
    (*gB) = vec3<f32>((1f - _e313), ((_e315 - 0.5f) * _e318), ((2f * (_e321.y + _e323)) + 1f));
    return;
}

fn cloudGenOff(idx: f32) -> vec3<f32> {
    var idx_1: f32;
    var h: u32;

    idx_1 = idx;
    let _e171 = idx_1;
    h = (u32(_e171) * 2654435761u);
    let _e176 = h;
    let _e177 = h;
    h = (_e176 ^ (_e177 >> 15u));
    let _e181 = h;
    h = (_e181 * 2246822519u);
    let _e184 = h;
    let _e185 = h;
    h = (_e184 ^ (_e185 >> 13u));
    let _e189 = h;
    let _e193 = h;
    let _e199 = h;
    return (((vec3<f32>(f32((_e189 & 1023u)), f32(((_e193 >> 10u) & 1023u)), f32(((_e199 >> 20u) & 1023u))) / vec3(1024f)) - vec3(0.5f)) * 400000f);
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
    let _e175 = dirF_9;
    lat_1 = asin(clamp(_e175.y, -1f, 1f));
    let _e183 = global.uCloudWind;
    let _e185 = lat_1;
    let _e186 = global.uCloudWind;
    let _e191 = global.uCloudWind;
    let _e197 = global.uCloudWind;
    let _e199 = lat_1;
    let _e201 = lat_1;
    U = (_e183.x * (sin((((_e185 * _e186.y) * 2f) + (_e191.z * 6.2832f))) + (_e197.w * exp(((-(_e199) * _e201) * 40f)))));
    let _e210 = dirF_9;
    let _e214 = dirF_9;
    east = normalize((vec3<f32>(-(_e210.z), 0f, _e214.x) + vec3<f32>(0.000001f, 0f, 0f)));
    let _e224 = pf_1;
    let _e225 = east;
    let _e226 = U;
    let _e228 = g_1;
    let _e232 = g_1;
    let _e234 = cloudGenOff(_e232.z);
    return ((_e224 + ((_e225 * _e226) * _e228.y)) + _e234);
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
    let _e179 = dirF_11;
    cloudGens(_e179, (&gA_1), (&gB_1));
    let _e186 = dirF_11;
    let _e187 = cloudClimate(_e186);
    clim_2 = _e187;
    let _e189 = gA_1;
    if (_e189.x > 0.005f) {
        let _e193 = c;
        let _e194 = gA_1;
        let _e196 = pf_3;
        let _e197 = dirF_11;
        let _e198 = gA_1;
        let _e199 = cloudAdvect(_e196, _e197, _e198);
        let _e200 = foot_5;
        let _e201 = bias_3;
        let _e202 = clim_2;
        let _e203 = cloudCoverC(_e199, _e200, _e201, _e202);
        c = (_e193 + (_e194.x * _e203));
    }
    let _e206 = gB_1;
    if (_e206.x > 0.005f) {
        let _e210 = c;
        let _e211 = gB_1;
        let _e213 = pf_3;
        let _e214 = dirF_11;
        let _e215 = gB_1;
        let _e216 = cloudAdvect(_e213, _e214, _e215);
        let _e217 = foot_5;
        let _e218 = bias_3;
        let _e219 = clim_2;
        let _e220 = cloudCoverC(_e216, _e217, _e218, _e219);
        c = (_e210 + (_e211.x * _e220));
    }
    let _e223 = c;
    return _e223;
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
    let _e171 = global.uRing;
    if (_e171.z < 0.5f) {
        return 1f;
    }
    let _e176 = global.uToFixed;
    let _e177 = rel_1;
    pF = (_e176 * _e177);
    let _e180 = global.uToFixed;
    let _e181 = global.uSunDir;
    sF = (_e180 * _e181);
    let _e184 = pF;
    let _e186 = sF;
    let _e191 = sF;
    if (((_e184.y * _e186.y) >= 0f) || (abs(_e191.y) < 0.0001f)) {
        return 1f;
    }
    let _e198 = pF;
    let _e199 = sF;
    let _e200 = pF;
    let _e202 = sF;
    q_2 = (_e198 - (_e199 * (_e200.y / _e202.y)));
    let _e208 = q_2;
    let _e211 = global.uRing;
    let _e214 = global.uRing;
    let _e216 = global.uRing;
    x = ((length(_e208.xz) - _e211.x) / (_e214.y - _e216.x));
    let _e221 = x;
    let _e224 = x;
    if ((_e221 <= 0f) || (_e224 >= 1f)) {
        return 1f;
    }
    let _e229 = x;
    f_2 = clamp(((_e229 * 32f) - 0.5f), 0f, 31f);
    let _e238 = f_2;
    i_1 = i32(floor(_e238));
    let _e242 = i_1;
    j_1 = min((_e242 + 1i), 31i);
    let _e248 = i_1;
    let _e250 = i_1;
    let _e255 = i_1;
    let _e260 = global.uRingTau[(_e255 / 4i)][(_e248 - (4i * (_e250 / 4i)))];
    let _e261 = j_1;
    let _e263 = j_1;
    let _e268 = j_1;
    let _e273 = global.uRingTau[(_e268 / 4i)][(_e261 - (4i * (_e263 / 4i)))];
    let _e274 = f_2;
    let _e275 = f_2;
    tau = mix(_e260, _e273, (_e274 - floor(_e275)));
    let _e280 = tau;
    let _e282 = sF;
    return exp((-(_e280) / abs(_e282.y)));
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
    let _e184 = rel_3;
    let _e185 = ringShadow(_e184);
    ring = _e185;
    let _e187 = global.uCloudOn;
    if (_e187 < 0.5f) {
        let _e190 = muS_1;
        if (_e190 > -0.05f) {
            let _e194 = ring;
            local_4 = _e194;
        } else {
            local_4 = 1f;
        }
        let _e197 = local_4;
        return _e197;
    }
    let _e198 = muS_1;
    mu_8 = max(_e198, 0.05f);
    let _e216 = global.uCSOn;
    if (_e216 > 0.5f) {
        {
            let _e219 = global.uToFixed;
            let _e220 = rel_3;
            pf_4 = (_e219 * _e220);
            let _e223 = pf_4;
            let _e224 = r_7;
            upF = (_e223 / vec3(_e224));
            let _e228 = global.uToFixed;
            let _e229 = global.uSunDir;
            sF_1 = (_e228 * _e229);
            let _e232 = pf_4;
            let _e233 = global.uCSOrigin;
            let _e235 = sF_1;
            let _e236 = upF;
            let _e237 = sF_1;
            let _e238 = upF;
            let _e242 = r_7;
            let _e243 = global.uRadius;
            let _e246 = sF_1;
            let _e247 = upF;
            d_1 = ((_e232 - _e233) - (((_e235 - (_e236 * dot(_e237, _e238))) * (_e242 - _e243)) / vec3(max(dot(_e246, _e247), 0.1f))));
            let _e255 = d_1;
            let _e256 = global.uCSE;
            let _e258 = d_1;
            let _e259 = global.uCSN;
            let _e262 = global.uCSInvL;
            uv_4 = ((vec2<f32>(dot(_e255, _e256), dot(_e258, _e259)) * _e262) + vec2(0.5f));
            let _e270 = uv_4;
            let _e273 = uv_4;
            let _e277 = uv_4;
            let _e280 = uv_4;
            w = smoothstep(0f, 0.08f, min(min(_e270.x, (1f - _e273.x)), min(_e277.y, (1f - _e280.y))));
            let _e286 = w;
            if (_e286 > 0f) {
                {
                    let _e289 = uv_4;
                    let _e291 = textureSampleLevel(tCloudShadowTexture, tCloudShadowSampler, _e289, 0f);
                    m0_ = _e291;
                    let _e292 = uv_4;
                    let _e293 = global.uCSLod;
                    let _e294 = textureSampleLevel(tCloudShadowTexture, tCloudShadowSampler, _e292, _e293);
                    m1_ = _e294;
                }
            }
        }
    }
    let _e295 = global.uCloud;
    let _e297 = r_7;
    let _e298 = global.uRadius;
    hc = (_e295.x - (_e297 - _e298));
    let _e302 = hc;
    let _e305 = w;
    if ((_e302 > 0f) && (_e305 < 1f)) {
        {
            let _e309 = global.uToFixed;
            let _e310 = rel_3;
            let _e311 = global.uSunDir;
            let _e312 = hc;
            let _e314 = muS_1;
            ds = normalize((_e309 * normalize((_e310 + ((_e311 * _e312) / vec3(max(_e314, 0.08f)))))));
            let _e324 = muS_1;
            if (_e324 > -0.05f) {
                let _e328 = ds;
                let _e329 = global.uRadius;
                let _e331 = ds;
                let _e332 = foot_7;
                let _e333 = global.uCloud;
                let _e335 = cloudBias(_e333.z);
                let _e336 = cloudCoverG((_e328 * _e329), _e331, _e332, _e335);
                let _e337 = global.uCloudOpacity;
                local_5 = (_e336 * _e337);
            } else {
                local_5 = 0f;
            }
            let _e341 = local_5;
            cs = _e341;
            let _e343 = global.uToFixed;
            let _e344 = rel_3;
            dz = normalize((_e343 * _e344));
            let _e348 = dz;
            let _e349 = global.uRadius;
            let _e351 = dz;
            let _e352 = foot_7;
            let _e354 = hc;
            let _e357 = global.uCloud;
            let _e359 = cloudBias(_e357.z);
            let _e360 = cloudCoverG((_e348 * _e349), _e351, max(_e352, (3.5f * _e354)), _e359);
            let _e361 = global.uCloudOpacity;
            cz = (_e360 * _e361);
            let _e365 = cs;
            let _e367 = cs;
            let _e368 = global.uCloudTau;
            let _e370 = mu_8;
            Tdir = ((1f - _e365) + (_e367 * exp((-(_e368) / _e370))));
            let _e376 = cz;
            let _e378 = cz;
            let _e381 = global.uCloudTau;
            Ttot = ((1f - _e376) + (_e378 / (1f + (0.1125f * _e381))));
            let _e387 = cz;
            let _e389 = cz;
            let _e390 = global.uCloudTau;
            let _e392 = mu_8;
            Dup = ((1f - _e387) + (_e389 * exp((-(_e390) / _e392))));
        }
    }
    let _e397 = Tdir;
    let _e398 = m0_;
    let _e400 = w;
    Tdir = mix(_e397, _e398.x, _e400);
    let _e402 = Ttot;
    let _e403 = m1_;
    let _e405 = w;
    Ttot = mix(_e402, _e403.y, _e405);
    let _e407 = Dup;
    let _e408 = m1_;
    let _e410 = w;
    Dup = mix(_e407, _e408.z, _e410);
    let _e412 = Dup;
    cloudDirZ = _e412;
    let _e413 = Ttot;
    cloudTotZ = _e413;
    let _e414 = (*skyE);
    let _e415 = Ttot;
    let _e417 = sunAbove_1;
    let _e418 = muS_1;
    let _e422 = Ttot;
    let _e423 = Dup;
    (*skyE) = ((_e414 * _e415) + ((_e417 * max(_e418, 0f)) * max((_e422 - _e423), 0f)));
    let _e429 = muS_1;
    if (_e429 > -0.05f) {
        let _e433 = Tdir;
        let _e434 = ring;
        local_6 = (_e433 * _e434);
    } else {
        local_6 = 1f;
    }
    let _e438 = local_6;
    return _e438;
}

fn blackbodyGlow(T_1: f32) -> vec3<f32> {
    var T_2: f32;
    var g_2: f32;

    T_2 = T_1;
    let _e173 = T_2;
    if (_e173 < 650f) {
        return vec3(0f);
    }
    let _e181 = T_2;
    g_2 = max(0f, (0.0287f + (0.000237f * (_e181 - 1000f))));
    let _e189 = g_2;
    let _e195 = T_2;
    let _e201 = g_2;
    return (vec3<f32>(1f, _e189, 0f) * ((600000f * exp((-24060f / _e195))) / (0.2126f + (0.7152f * _e201))));
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
    let _e176 = d_3;
    a_2 = abs(_e176);
    let _e179 = a_2;
    let _e181 = a_2;
    let _e184 = a_2;
    let _e186 = a_2;
    if ((_e179.x >= _e181.y) && (_e184.x >= _e186.z)) {
        let _e190 = d_3;
        if (_e190.x >= 0f) {
            local_7 = 0i;
        } else {
            local_7 = 1i;
        }
        let _e197 = local_7;
        local_11 = _e197;
    } else {
        let _e198 = a_2;
        let _e200 = a_2;
        if (_e198.y >= _e200.z) {
            let _e203 = d_3;
            if (_e203.y >= 0f) {
                local_8 = 2i;
            } else {
                local_8 = 3i;
            }
            let _e210 = local_8;
            local_10 = _e210;
        } else {
            let _e211 = d_3;
            if (_e211.z >= 0f) {
                local_9 = 4i;
            } else {
                local_9 = 5i;
            }
            let _e218 = local_9;
            local_10 = _e218;
        }
        let _e220 = local_10;
        local_11 = _e220;
    }
    let _e222 = local_11;
    f_3 = _e222;
    let _e224 = d_3;
    let _e225 = f_3;
    let _e229 = local_12[_e225];
    dn = dot(_e224, _e229);
    let _e232 = d_3;
    let _e233 = f_3;
    let _e237 = local_13[_e233];
    let _e239 = dn;
    let _e242 = d_3;
    let _e243 = f_3;
    let _e247 = local_14[_e243];
    let _e249 = dn;
    uv_5 = (((vec2<f32>(atan((dot(_e232, _e237) / _e239)), atan((dot(_e242, _e247) / _e249))) / vec2(0.785398f)) * 0.5f) + vec2(0.5f));
    let _e262 = uv_5;
    let _e263 = f_3;
    let _e267 = vec3<f32>(_e262.x, _e262.y, f32(_e263));
    let _e272 = textureSampleLevel(tHeightCubeTexture, tHeightCubeSampler, _e267.xy, i32(_e267.z), 0f);
    return _e272.x;
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
    let _e182 = global.uHeightCube;
    let _e186 = up_1;
    let _e187 = sF_3;
    if ((_e182.x < 0.5f) || (dot(_e186, _e187) < -0.2f)) {
        return 1f;
    }
    let _e194 = global.uHeightCube;
    texel = _e194.w;
    let _e197 = R_1;
    let _e198 = global.uHeightCube;
    top = (_e197 + _e198.z);
    let _e202 = pF_2;
    r0_ = length(_e202);
    let _e206 = R_1;
    let _e207 = up_1;
    let _e208 = heightCubeAt(_e207);
    let _e210 = r0_;
    below = max(0f, ((_e206 + _e208) - _e210));
    let _e214 = pF_2;
    let _e215 = up_1;
    let _e216 = texel;
    o = (_e214 + ((_e215 * _e216) * 0.1f));
    let _e222 = texel;
    t_1 = _e222;
    loop {
        let _e228 = i_2;
        if !((_e228 < 28i)) {
            break;
        }
        {
            let _e235 = o;
            let _e236 = sF_3;
            let _e237 = t_1;
            qp = (_e235 + (_e236 * _e237));
            let _e241 = qp;
            rq = length(_e241);
            let _e244 = rq;
            let _e245 = top;
            if (_e244 > _e245) {
                break;
            }
            let _e247 = rq;
            let _e248 = R_1;
            let _e249 = qp;
            let _e250 = rq;
            let _e253 = heightCubeAt((_e249 / vec3(_e250)));
            let _e256 = below;
            let _e257 = t_1;
            let _e260 = texel;
            d_4 = ((_e247 - (_e248 + _e253)) + (_e256 * exp((-(_e257) / (3f * _e260)))));
            let _e267 = sh;
            let _e268 = d_4;
            let _e269 = t_1;
            sh = min(_e267, clamp(((_e268 / (_e269 * 0.035f)) + 0.5f), 0f, 1f));
            let _e279 = sh;
            if (_e279 <= 0f) {
                break;
            }
            let _e282 = t_1;
            t_1 = (_e282 * 1.35f);
        }
        continuing {
            let _e232 = i_2;
            i_2 = (_e232 + 1i);
        }
    }
    let _e285 = sh;
    return _e285;
}

fn colourCubeK(dist: f32) -> f32 {
    var dist_1: f32;

    dist_1 = dist;
    let _e176 = global.uColourCube;
    let _e179 = global.uColourCube;
    let _e183 = global.uColourCube;
    let _e186 = dist_1;
    return (_e176.x * smoothstep((30f * _e179.z), (60f * _e183.z), _e186));
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
    let _e176 = d_6;
    a_3 = abs(_e176);
    let _e183 = a_3;
    let _e185 = a_3;
    let _e188 = a_3;
    let _e190 = a_3;
    if ((_e183.x >= _e185.y) && (_e188.x >= _e190.z)) {
        {
            let _e194 = d_6;
            if (_e194.x >= 0f) {
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
        let _e222 = a_3;
        let _e224 = a_3;
        if (_e222.y >= _e224.z) {
            {
                U_1 = vec3<f32>(1f, 0f, 0f);
                let _e231 = d_6;
                if (_e231.y >= 0f) {
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
                let _e259 = d_6;
                if (_e259.z >= 0f) {
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
    let _e283 = d_6;
    let _e284 = N;
    dn_1 = dot(_e283, _e284);
    let _e287 = d_6;
    let _e288 = U_1;
    let _e290 = dn_1;
    let _e293 = d_6;
    let _e294 = V;
    let _e296 = dn_1;
    uv_6 = (((vec2<f32>(atan((dot(_e287, _e288) / _e290)), atan((dot(_e293, _e294) / _e296))) / vec2(0.7853982f)) * 0.5f) + vec2(0.5f));
    let _e310 = global.uColourCube;
    h_1 = vec2((0.5f / max(_e310.y, 1f)));
    let _e317 = uv_6;
    let _e318 = h_1;
    let _e320 = h_1;
    let _e323 = clamp(_e317, _e318, (vec2(1f) - _e320));
    let _e324 = f_4;
    let _e327 = vec3<f32>(_e323.x, _e323.y, _e324);
    let _e332 = textureSampleLevel(tColourCubeTexture, tColourCubeSampler, _e327.xy, i32(_e327.z), 0f);
    return _e332;
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
    let _e186 = VP_1;
    let _e187 = wp_1;
    c_1 = (_e186 * vec4<f32>(_e187.x, _e187.y, _e187.z, 1f));
    let _e195 = c_1;
    let _e197 = c_1;
    uv_7 = (((_e195.xy / vec2(_e197.w)) * 0.5f) + vec2(0.5f));
    let _e207 = uv_7;
    let _e212 = uv_7;
    if (any((_e207 < vec2(0f))) || any((_e212 > vec2(1f)))) {
        return 1f;
    }
    let _e219 = L_3;
    let _e221 = wp_1;
    let _e223 = global.uSunShadowDir;
    let _e225 = bias_5;
    d_7 = (dot((_e219.xyz - _e221), _e223) - _e225);
    let _e228 = n_5;
    sz_1 = vec2(_e228);
    let _e231 = uv_7;
    let _e232 = sz_1;
    st_1 = ((_e231 * vec2<f32>(_e232)) - vec2(0.5f));
    let _e239 = st_1;
    fr = fract(_e239);
    let _e242 = st_1;
    p0_ = vec2<i32>(floor(_e242));
    loop {
        let _e249 = j_2;
        if !((_e249 < 4i)) {
            break;
        }
        i_3 = 0i;
        loop {
            let _e258 = i_3;
            if !((_e258 < 4i)) {
                break;
            }
            let _e265 = j_2;
            let _e268 = i_3;
            let _e271 = d_7;
            let _e272 = org_1;
            let _e273 = p0_;
            let _e274 = i_3;
            let _e277 = j_2;
            let _e284 = sz_1;
            let _e291 = textureLoad(tShadowAtlasTexture, (_e272 + clamp((_e273 + vec2<i32>((_e274 - 1i), (_e277 - 1i))), vec2(0i), (_e284 - vec2(1i)))), 0i);
            if (_e271 <= _e291.x) {
                local_15 = 1f;
            } else {
                local_15 = 0f;
            }
            let _e297 = local_15;
            cmp[((_e265 * 4i) + _e268)] = _e297;
            continuing {
                let _e262 = i_3;
                i_3 = (_e262 + 1i);
            }
        }
        continuing {
            let _e253 = j_2;
            j_2 = (_e253 + 1i);
        }
    }
    loop {
        let _e302 = j_3;
        if !((_e302 < 3i)) {
            break;
        }
        i_4 = 0i;
        loop {
            let _e311 = i_4;
            if !((_e311 < 3i)) {
                break;
            }
            let _e318 = lit;
            let _e319 = j_3;
            let _e322 = i_4;
            let _e325 = cmp[((_e319 * 4i) + _e322)];
            let _e326 = j_3;
            let _e329 = i_4;
            let _e334 = cmp[(((_e326 * 4i) + _e329) + 1i)];
            let _e335 = fr;
            let _e338 = j_3;
            let _e341 = i_4;
            let _e346 = cmp[(((_e338 * 4i) + _e341) + 4i)];
            let _e347 = j_3;
            let _e350 = i_4;
            let _e355 = cmp[(((_e347 * 4i) + _e350) + 5i)];
            let _e356 = fr;
            let _e359 = fr;
            lit = (_e318 + mix(mix(_e325, _e334, _e335.x), mix(_e346, _e355, _e356.x), _e359.y));
            continuing {
                let _e315 = i_4;
                i_4 = (_e315 + 1i);
            }
        }
        continuing {
            let _e306 = j_3;
            j_3 = (_e306 + 1i);
        }
    }
    let _e363 = lit;
    return (_e363 / 9f);
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
    let _e178 = global.uSunShadow;
    if (_e178.x < 0.5f) {
        return 1f;
    }
    let _e183 = wp_3;
    dist_2 = length(_e183);
    let _e186 = dist_2;
    let _e187 = global.uSunShadow;
    if (_e186 > _e187.z) {
        return 1f;
    }
    let _e191 = N_2;
    let _e192 = global.uSunShadowDir;
    ndl = max(dot(_e191, _e192), 0.05f);
    let _e198 = ndl;
    let _e199 = ndl;
    let _e203 = ndl;
    slope = (sqrt((1f - (_e198 * _e199))) / _e203);
    let _e210 = global.uSunShadowVP1_;
    let _e211 = global.uSunShadowL1_;
    let _e212 = wp_3;
    let _e213 = global.uSunShadowL1_;
    let _e216 = slope;
    let _e221 = sunShadowTap(vec2<i32>(2048i, 0i), 2048i, _e210, _e211, _e212, (_e213.w * (1.5f + min(_e216, 6f))));
    s1_ = _e221;
    let _e223 = s1_;
    let _e226 = global.uSunShadow;
    let _e229 = global.uSunShadow;
    let _e231 = dist_2;
    sh_1 = mix(_e223, 1f, smoothstep((0.85f * _e226.z), _e229.z, _e231));
    let _e235 = dist_2;
    let _e236 = global.uSunShadow;
    if (_e235 < _e236.y) {
        {
            let _e243 = global.uSunShadowVP0_;
            let _e244 = global.uSunShadowL0_;
            let _e245 = wp_3;
            let _e246 = global.uSunShadowL0_;
            let _e249 = slope;
            let _e254 = sunShadowTap(vec2<i32>(0i, 0i), 2048i, _e243, _e244, _e245, (_e246.w * (1.5f + min(_e249, 6f))));
            s0_ = _e254;
            let _e256 = s0_;
            let _e257 = sh_1;
            let _e259 = global.uSunShadow;
            let _e262 = global.uSunShadow;
            let _e264 = dist_2;
            sh_1 = mix(_e256, _e257, smoothstep((0.75f * _e259.y), _e262.y, _e264));
        }
    }
    let _e267 = sh_1;
    return _e267;
}

fn windSense(upF_1: vec3<f32>) -> f32 {
    var upF_2: vec3<f32>;
    var al: f32;

    upF_2 = upF_1;
    let _e176 = upF_2;
    al = abs(asin(clamp(_e176.y, -1f, 1f)));
    let _e190 = al;
    let _e197 = al;
    return ((-1f + (2f * smoothstep(0.49f, 0.55f, _e190))) - (2f * smoothstep(1.02f, 1.08f, _e197)));
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
        let _e202 = i_5;
        if !((_e202 < 36i)) {
            break;
        }
        {
            let _e209 = i_5;
            let _e211 = global.uWaveK[_e209];
            K = _e211;
            let _e213 = K;
            kk = length(_e213.xyz);
            let _e218 = kk;
            lam = (6.2832f / _e218);
            let _e222 = lmax_1;
            let _e225 = lmax_1;
            let _e228 = lam;
            let _e232 = global.uLiquid;
            let _e236 = global.uLiquid;
            let _e240 = lam;
            fk = ((1f - smoothstep((_e222 * 0.7f), (_e225 * 1.3f), _e228)) * (1f - smoothstep((_e232.w * 1.2f), (_e236.w * 2.2f), _e240)));
            let _e245 = fk;
            if (_e245 <= 0f) {
                continue;
            }
            let _e248 = K;
            let _e250 = n_7;
            let _e251 = K;
            let _e253 = n_7;
            kt = (_e248.xyz - (_e250 * dot(_e251.xyz, _e253)));
            let _e258 = kt;
            ktl = length(_e258);
            let _e261 = ktl;
            if (_e261 < 0.000001f) {
                continue;
            }
            let _e264 = kt;
            let _e265 = ktl;
            kd = (_e264 / vec3(_e265));
            let _e269 = river_1;
            if _e269 {
                local_16 = 1f;
            } else {
                let _e273 = kd;
                let _e274 = wd_1;
                local_16 = (0.2f + (1.2f * pow(max(dot(_e273, _e274), 0f), 2f)));
            }
            let _e283 = local_16;
            dirW = _e283;
            let _e285 = fk;
            let _e286 = dirW;
            let _e288 = ktl;
            let _e289 = kk;
            wt0_ = ((_e285 * _e286) * (_e288 / _e289));
            let _e293 = wt0_;
            let _e296 = i_5;
            let _e302 = grp_1[((_e296 / 3i) & 3i)];
            wt = (_e293 * (0.3f + (1.4f * _e302)));
            let _e308 = foot_9;
            let _e311 = foot_9;
            let _e313 = lam;
            res = smoothstep((2f * _e308), (6f * _e311), _e313);
            let _e316 = K;
            let _e318 = fp_1;
            let _e319 = warp_1;
            let _e322 = K;
            ph_1 = (dot(_e316.xyz, (_e318 + _e319)) - _e322.w);
            let _e326 = K;
            Ke = (floor(((_e326.yzx * 228.1645f) + vec3(0.5f))) * 0.001533981f);
            let _e341 = Ke;
            let _e342 = fp_1;
            let _e343 = warp_1;
            let _e347 = K;
            let _e351 = i_5;
            env = (0.6f + (0.4f * sin(((dot(_e341, (_e342 + _e343)) - (0.17f * _e347.w)) + (f32(_e351) * 1.7f)))));
            let _e361 = W;
            let _e363 = kd;
            let _e364 = wt;
            let _e365 = res;
            let _e367 = env;
            let _e369 = ph_1;
            W.g = (_e361.g + (_e363 * (((_e364 * _e365) * _e367) * cos(_e369))));
            let _e375 = W;
            let _e377 = wt;
            let _e378 = wt;
            W.var_ = (_e375.var_ + ((_e377 * _e378) * 0.22f));
            let _e384 = W;
            let _e386 = wt0_;
            let _e387 = wt0_;
            W.var0_ = (_e384.var0_ + ((_e386 * _e387) * 0.22f));
            let _e393 = W;
            let _e395 = wt;
            let _e396 = wt;
            let _e400 = res;
            W.res = (_e393.res + (((_e395 * _e396) * 0.22f) * _e400));
            let _e404 = W;
            let _e406 = wt;
            let _e407 = res;
            let _e409 = env;
            let _e411 = ph_1;
            W.crest = (_e404.crest + (((_e406 * _e407) * _e409) * sin(_e411)));
            let _e415 = rv;
            let _e416 = wt;
            let _e417 = wt;
            let _e421 = res;
            let _e423 = res;
            rv = (_e415 + ((((_e416 * _e417) * 0.22f) * _e421) * _e423));
        }
        continuing {
            let _e206 = i_5;
            i_5 = (_e206 + 1i);
        }
    }
    let _e427 = W;
    let _e429 = rv;
    W.crest = (_e427.crest / sqrt(max(_e429, 0.000000001f)));
    let _e434 = W;
    return _e434;
}

fn liqHash(c_2: vec2<f32>) -> f32 {
    var c_3: vec2<f32>;
    var q_3: vec2<u32>;
    var h_2: u32;

    c_3 = c_2;
    let _e176 = c_3;
    q_3 = vec2<u32>((vec2<i32>(_e176) + vec2(1048576i)));
    let _e183 = q_3;
    let _e187 = q_3;
    h_2 = ((_e183.x * 1597334677u) ^ (_e187.y * 3812015801u));
    let _e193 = h_2;
    h_2 = ((_e193 * 747796405u) + 2891336453u);
    let _e198 = h_2;
    let _e199 = h_2;
    h_2 = (_e198 ^ (_e199 >> 16u));
    let _e204 = h_2;
    h_2 = (_e204 * 2246822519u);
    let _e207 = h_2;
    let _e208 = h_2;
    h_2 = (_e207 ^ (_e208 >> 13u));
    let _e213 = h_2;
    return ((f32((_e213 & 7u)) * 0.7854f) + 0.3927f);
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
    let _e178 = p_1;
    i_6 = floor(_e178);
    let _e181 = p_1;
    let _e182 = i_6;
    f_5 = (_e181 - _e182);
    let _e185 = i_6;
    let _e188 = (_e185 + vec2(1f));
    let _e189 = per_1;
    let _e190 = vec2(_e189);
    i1_ = (_e188 - (floor((_e188 / _e190)) * _e190));
    let _e196 = i_6;
    let _e197 = per_1;
    let _e198 = vec2(_e197);
    i_6 = (_e196 - (floor((_e196 / _e198)) * _e198));
    let _e203 = f_5;
    let _e204 = f_5;
    let _e206 = f_5;
    let _e208 = f_5;
    let _e209 = f_5;
    u_1 = (((_e203 * _e204) * _e206) * ((_e208 * ((_e209 * 6f) - vec2(15f))) + vec2(10f)));
    let _e222 = f_5;
    let _e224 = f_5;
    let _e226 = f_5;
    let _e227 = f_5;
    du = (((30f * _e222) * _e224) * ((_e226 * (_e227 - vec2(2f))) + vec2(1f)));
    let _e237 = i_6;
    let _e238 = liqHash(_e237);
    ha = _e238;
    let _e240 = i1_;
    let _e242 = i_6;
    let _e245 = liqHash(vec2<f32>(_e240.x, _e242.y));
    hb = _e245;
    let _e247 = i_6;
    let _e249 = i1_;
    let _e252 = liqHash(vec2<f32>(_e247.x, _e249.y));
    hc_1 = _e252;
    let _e254 = i1_;
    let _e255 = liqHash(_e254);
    hd = _e255;
    let _e257 = ha;
    let _e259 = ha;
    ga = vec2<f32>(cos(_e257), sin(_e259));
    let _e263 = hb;
    let _e265 = hb;
    gb = vec2<f32>(cos(_e263), sin(_e265));
    let _e269 = hc_1;
    let _e271 = hc_1;
    gc = vec2<f32>(cos(_e269), sin(_e271));
    let _e275 = hd;
    let _e277 = hd;
    gd = vec2<f32>(cos(_e275), sin(_e277));
    let _e281 = ga;
    let _e282 = f_5;
    va = dot(_e281, _e282);
    let _e285 = gb;
    let _e286 = f_5;
    vb = dot(_e285, (_e286 - vec2<f32>(1f, 0f)));
    let _e293 = gc;
    let _e294 = f_5;
    vc = dot(_e293, (_e294 - vec2<f32>(0f, 1f)));
    let _e301 = gd;
    let _e302 = f_5;
    vd = dot(_e301, (_e302 - vec2(1f)));
    let _e308 = va;
    let _e309 = vb;
    let _e311 = vc;
    let _e313 = vd;
    k = (((_e308 - _e309) - _e311) + _e313);
    let _e316 = va;
    let _e317 = u_1;
    let _e319 = vb;
    let _e320 = va;
    let _e324 = u_1;
    let _e326 = vc;
    let _e327 = va;
    let _e331 = u_1;
    let _e333 = u_1;
    let _e336 = k;
    let _e339 = ga;
    let _e340 = u_1;
    let _e342 = gb;
    let _e343 = ga;
    let _e347 = u_1;
    let _e349 = gc;
    let _e350 = ga;
    let _e354 = u_1;
    let _e356 = u_1;
    let _e359 = ga;
    let _e360 = gb;
    let _e362 = gc;
    let _e364 = gd;
    let _e368 = du;
    let _e369 = u_1;
    let _e371 = k;
    let _e373 = vb;
    let _e374 = vc;
    let _e377 = va;
    let _e381 = ((((_e339 + (_e340.x * (_e342 - _e343))) + (_e347.y * (_e349 - _e350))) + ((_e354.x * _e356.y) * (((_e359 - _e360) - _e362) + _e364))) + (_e368 * (((_e369.yx * _e371) + vec2<f32>(_e373, _e374)) - vec2(_e377))));
    return vec3<f32>((((_e316 + (_e317.x * (_e319 - _e320))) + (_e324.y * (_e326 - _e327))) + ((_e331.x * _e333.y) * _e336)), _e381.x, _e381.y);
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
    let _e182 = a_5;
    if (_e182 == 0i) {
        let _e185 = p_3;
        local_18 = _e185.zy;
    } else {
        let _e187 = a_5;
        if (_e187 == 1i) {
            let _e190 = p_3;
            local_17 = _e190.xz;
        } else {
            let _e192 = p_3;
            local_17 = _e192.xy;
        }
        let _e195 = local_17;
        local_18 = _e195;
    }
    let _e197 = local_18;
    uv_8 = _e197;
    let _e199 = uv_8;
    let _e200 = L_5;
    let _e203 = o_2;
    let _e207 = L_5;
    let _e209 = rippleNoise(((_e199 / vec2(_e200)) + vec2(_e203)), (4096f / _e207));
    r_8 = _e209;
    let _e211 = r_8;
    let _e213 = r_8;
    let _e214 = _e213.yz;
    return vec3<f32>(_e211.x, _e214.x, _e214.y);
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
    let _e190 = n_9;
    an = abs(_e190);
    let _e193 = an;
    let _e195 = an;
    let _e198 = an;
    let _e200 = an;
    if ((_e193.x > _e195.y) && (_e198.x > _e200.z)) {
        local_20 = 0i;
    } else {
        let _e205 = an;
        let _e207 = an;
        if (_e205.y > _e207.z) {
            local_19 = 1i;
        } else {
            local_19 = 2i;
        }
        let _e213 = local_19;
        local_20 = _e213;
    }
    let _e215 = local_20;
    ma = _e215;
    let _e217 = an;
    let _e219 = an;
    let _e222 = an;
    let _e224 = an;
    if ((_e217.x < _e219.y) && (_e222.x < _e224.z)) {
        local_22 = 0i;
    } else {
        let _e229 = an;
        let _e231 = an;
        if (_e229.y < _e231.z) {
            local_21 = 1i;
        } else {
            local_21 = 2i;
        }
        let _e237 = local_21;
        local_22 = _e237;
    }
    let _e239 = local_22;
    mi = _e239;
    let _e242 = mi;
    let _e244 = ma;
    me = ((3i - _e242) - _e244);
    let _e247 = ma;
    if (_e247 == 0i) {
        let _e250 = an;
        local_24 = _e250.x;
    } else {
        let _e252 = ma;
        if (_e252 == 1i) {
            let _e255 = an;
            local_23 = _e255.y;
        } else {
            let _e257 = an;
            local_23 = _e257.z;
        }
        let _e260 = local_23;
        local_24 = _e260;
    }
    let _e262 = local_24;
    w0_1 = _e262;
    let _e264 = me;
    if (_e264 == 0i) {
        let _e267 = an;
        local_26 = _e267.x;
    } else {
        let _e269 = me;
        if (_e269 == 1i) {
            let _e272 = an;
            local_25 = _e272.y;
        } else {
            let _e274 = an;
            local_25 = _e274.z;
        }
        let _e277 = local_25;
        local_26 = _e277;
    }
    let _e279 = local_26;
    w1_1 = _e279;
    let _e281 = w0_1;
    let _e282 = w1_1;
    bw = clamp(((vec2<f32>(_e281, _e282) - vec2(0.5773f)) / vec2(0.4227f)), vec2(0f), vec2(1f));
    let _e298 = bw;
    let _e300 = bw;
    if ((_e298.x + _e300.y) < 0.0001f) {
        local_27 = vec2<f32>(1f, 0f);
    } else {
        let _e308 = bw;
        let _e309 = bw;
        let _e311 = bw;
        local_27 = (_e308 / vec2((_e309.x + _e311.y)));
    }
    let _e317 = local_27;
    bw = _e317;
    let _e318 = bw;
    if (_e318.y < 0.02f) {
        bw = vec2<f32>(1f, 0f);
    }
    loop {
        let _e331 = o_3;
        if !((_e331 < 4i)) {
            break;
        }
        {
            let _e339 = o_3;
            L_6 = (0.25f * exp2(f32(_e339)));
            let _e345 = lmax_3;
            let _e348 = lmax_3;
            let _e351 = L_6;
            fk_1 = (1f - smoothstep((_e345 * 0.3f), (_e348 * 0.6f), _e351));
            let _e355 = fk_1;
            if (_e355 <= 0f) {
                continue;
            }
            let _e358 = foot_11;
            let _e360 = foot_11;
            let _e362 = L_6;
            res_1 = smoothstep(_e358, (3f * _e360), _e362);
            g_3 = vec3(0f);
            v = 0f;
            k_1 = 0i;
            loop {
                let _e372 = k_1;
                if !((_e372 < 2i)) {
                    break;
                }
                {
                    let _e379 = k_1;
                    if (_e379 == 0i) {
                        let _e382 = ma;
                        local_28 = _e382;
                    } else {
                        let _e383 = me;
                        local_28 = _e383;
                    }
                    let _e385 = local_28;
                    a_6 = _e385;
                    let _e387 = k_1;
                    if (_e387 == 0i) {
                        let _e390 = bw;
                        local_29 = _e390.x;
                    } else {
                        let _e392 = bw;
                        local_29 = _e392.y;
                    }
                    let _e395 = local_29;
                    bwk = _e395;
                    let _e397 = bwk;
                    if (_e397 <= 0f) {
                        continue;
                    }
                    let _e400 = a_6;
                    let _e401 = fp_3;
                    let _e402 = L_6;
                    let _e403 = o_3;
                    let _e407 = rippleAxis(_e400, _e401, _e402, (f32(_e403) * 17.31f));
                    r_9 = _e407;
                    let _e409 = g_3;
                    let _e410 = bwk;
                    let _e411 = a_6;
                    if (_e411 == 0i) {
                        let _e415 = r_9;
                        let _e417 = r_9;
                        local_31 = vec3<f32>(0f, _e415.z, _e417.y);
                    } else {
                        let _e420 = a_6;
                        if (_e420 == 1i) {
                            let _e423 = r_9;
                            let _e426 = r_9;
                            local_30 = vec3<f32>(_e423.y, 0f, _e426.z);
                        } else {
                            let _e429 = r_9;
                            let _e431 = r_9;
                            local_30 = vec3<f32>(_e429.y, _e431.z, 0f);
                        }
                        let _e436 = local_30;
                        local_31 = _e436;
                    }
                    let _e438 = local_31;
                    g_3 = (_e409 + (_e410 * _e438));
                    let _e441 = v;
                    let _e442 = bwk;
                    let _e443 = r_9;
                    v = (_e441 + (_e442 * _e443.x));
                }
                continuing {
                    let _e376 = k_1;
                    k_1 = (_e376 + 1i);
                }
            }
            let _e447 = g_3;
            let _e448 = n_9;
            let _e449 = g_3;
            let _e450 = n_9;
            g_3 = (_e447 - (_e448 * dot(_e449, _e450)));
            let _e455 = W_1;
            let _e457 = g_3;
            let _e458 = fk_1;
            let _e459 = res_1;
            W_1.g = (_e455.g + (_e457 * (_e458 * _e459)));
            let _e464 = W_1;
            let _e466 = fk_1;
            let _e467 = fk_1;
            W_1.var_ = (_e464.var_ + ((_e466 * _e467) * 0.78f));
            let _e473 = W_1;
            let _e475 = fk_1;
            let _e476 = fk_1;
            let _e480 = res_1;
            W_1.res = (_e473.res + (((_e475 * _e476) * 0.78f) * _e480));
            let _e484 = W_1;
            let _e486 = fk_1;
            let _e487 = res_1;
            let _e489 = v;
            W_1.crest = (_e484.crest + (((_e486 * _e487) * _e489) / 0.216f));
            let _e494 = rv_1;
            let _e495 = fk_1;
            let _e496 = fk_1;
            let _e498 = res_1;
            let _e500 = res_1;
            rv_1 = (_e494 + (((_e495 * _e496) * _e498) * _e500));
        }
        continuing {
            let _e335 = o_3;
            o_3 = (_e335 + 1i);
        }
    }
    let _e504 = W_1;
    W_1.var0_ = _e504.var_;
    let _e507 = W_1;
    let _e509 = rv_1;
    W_1.crest = (_e507.crest / sqrt(max(_e509, 0.000000001f)));
    let _e514 = W_1;
    return _e514;
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
    let _e201 = upF_4;
    al_1 = abs(asin(clamp(_e201.y, -1f, 1f)));
    let _e210 = upF_4;
    let _e211 = windSense(_e210);
    toward = _e211;
    let _e213 = al_1;
    if (_e213 < 0.09f) {
        local_34 = 0.45f;
    } else {
        let _e217 = al_1;
        if (_e217 < 0.52f) {
            local_33 = 0.9f;
        } else {
            let _e221 = al_1;
            if (_e221 < 1.05f) {
                local_32 = 1.25f;
            } else {
                local_32 = 0.8f;
            }
            let _e227 = local_32;
            local_33 = _e227;
        }
        let _e229 = local_33;
        local_34 = _e229;
    }
    let _e231 = local_34;
    strength = _e231;
    let _e237 = upF_4;
    east_1 = cross(vec3<f32>(0f, 1f, 0f), _e237);
    let _e240 = east_1;
    if (length(_e240) > 0.0001f) {
        let _e244 = east_1;
        let _e246 = toward;
        local_35 = (normalize(_e244) * sign((_e246 + 0.001f)));
    } else {
        local_35 = vec3<f32>(1f, 0f, 0f);
    }
    let _e256 = local_35;
    wd_2 = _e256;
    let _e258 = kind_1;
    let _e261 = kind_1;
    river_2 = ((_e258 > 0.55f) && (_e261 < 0.85f));
    let _e266 = kind_1;
    pond = (_e266 > 0.85f);
    let _e270 = kind_1;
    sea = (_e270 < 0.2f);
    let _e274 = east_1;
    if (length(_e274) > 0.0001f) {
        let _e278 = east_1;
        local_36 = normalize(_e278);
    } else {
        local_36 = vec3<f32>(1f, 0f, 0f);
    }
    let _e285 = local_36;
    e1_ = _e285;
    let _e287 = upF_4;
    let _e288 = e1_;
    e2_ = cross(_e287, _e288);
    let _e291 = e1_;
    let _e292 = wn_1;
    let _e295 = e2_;
    let _e296 = wn_1;
    let _e302 = global.uLiquid;
    warp_2 = ((((_e291 * _e292.x) + (_e295 * _e296.y)) * 0.12f) * _e302.w);
    let _e306 = global.uLiquid;
    let _e308 = strength;
    let _e310 = sea;
    if _e310 {
        local_37 = 1f;
    } else {
        let _e314 = fetch_1;
        local_37 = mix(0.3f, 1f, _e314);
    }
    let _e317 = local_37;
    U_2 = ((_e306.y * _e308) * _e317);
    let _e320 = river_2;
    if _e320 {
        let _e321 = fv_1;
        let _e322 = global.uLiquid2_;
        let _e324 = depth_1;
        local_38 = (_e321 / sqrt((_e322.x * max(_e324, 0.3f))));
    } else {
        local_38 = 0f;
    }
    let _e332 = local_38;
    Fr = _e332;
    let _e334 = sea;
    if _e334 {
        let _e337 = U_2;
        let _e341 = U_2;
        local_41 = ((0.003f * step(0.01f, _e337)) + (0.00512f * _e341));
    } else {
        let _e344 = pond;
        if _e344 {
            let _e347 = U_2;
            local_40 = (0.0003f + (0.0003f * _e347));
        } else {
            let _e350 = river_2;
            if _e350 {
                let _e353 = Fr;
                let _e354 = Fr;
                let _e361 = U_2;
                local_39 = ((0.0012f + (0.035f * min((_e353 * _e354), 2f))) + (0.0015f * _e361));
            } else {
                let _e366 = U_2;
                local_39 = (0.001f + (0.00512f * _e366));
            }
            let _e370 = local_39;
            local_40 = _e370;
        }
        let _e372 = local_40;
        local_41 = _e372;
    }
    let _e374 = local_41;
    s2_ = _e374;
    let _e376 = s2_;
    let _e377 = global.uLiquid;
    s2_ = (_e376 * _e377.z);
    let _e380 = sea;
    if _e380 {
        local_44 = 1000000000f;
    } else {
        let _e382 = river_2;
        if _e382 {
            let _e384 = fv_1;
            let _e386 = fv_1;
            let _e388 = global.uLiquid2_;
            let _e391 = depth_1;
            local_43 = clamp(((((6.2832f * _e384) * _e386) / _e388.x) + _e391), 0.6f, 8f);
        } else {
            let _e396 = pond;
            if _e396 {
                local_42 = 1f;
            } else {
                let _e400 = fetch_1;
                local_42 = (25f + (400f * _e400));
            }
            let _e404 = local_42;
            local_43 = _e404;
        }
        let _e406 = local_43;
        local_44 = _e406;
    }
    let _e408 = local_44;
    lmax_4 = _e408;
    let _e411 = fdir_1;
    let _e412 = upF_4;
    let _e413 = fdir_1;
    let _e414 = upF_4;
    fd = (_e411 - (_e412 * dot(_e413, _e414)));
    let _e419 = fd;
    if (length(_e419) > 0.05f) {
        let _e423 = fd;
        local_45 = normalize(_e423);
    } else {
        local_45 = vec3(0f);
    }
    let _e428 = local_45;
    fd = _e428;
    let _e429 = global.uTime;
    ta = fract((_e429 / 3f));
    let _e434 = global.uTime;
    tb = fract(((_e434 / 3f) + 0.5f));
    let _e443 = ta;
    wa_1 = (1f - abs(((2f * _e443) - 1f)));
    let _e450 = river_2;
    if _e450 {
        {
            let _e451 = fp_5;
            let _e452 = fd;
            let _e453 = fv_1;
            let _e457 = ta;
            let _e460 = n_11;
            let _e461 = lmax_4;
            let _e462 = foot_13;
            let _e463 = riverRipples((_e451 - (((_e452 * _e453) * 3f) * _e457)), _e460, _e461, _e462);
            A = _e463;
            let _e465 = fp_5;
            let _e466 = fd;
            let _e467 = fv_1;
            let _e471 = tb;
            let _e477 = n_11;
            let _e478 = lmax_4;
            let _e479 = foot_13;
            let _e480 = riverRipples(((_e465 - (((_e466 * _e467) * 3f) * _e471)) + vec3(0.37f)), _e477, _e478, _e479);
            B = _e480;
            let _e482 = A;
            W_2 = _e482;
            let _e484 = A;
            let _e486 = wa_1;
            let _e488 = B;
            let _e491 = wa_1;
            W_2.g = ((_e484.g * _e486) + (_e488.g * (1f - _e491)));
            let _e496 = A;
            let _e498 = wa_1;
            let _e500 = B;
            let _e503 = wa_1;
            W_2.crest = ((_e496.crest * _e498) + (_e500.crest * (1f - _e503)));
        }
    } else {
        let _e507 = fp_5;
        let _e508 = n_11;
        let _e509 = wd_2;
        let _e510 = lmax_4;
        let _e512 = foot_13;
        let _e513 = warp_2;
        let _e514 = grp_3;
        let _e515 = liquidWaves(_e507, _e508, _e509, _e510, false, _e512, _e513, _e514);
        W_2 = _e515;
    }
    let _e516 = s2_;
    let _e517 = W_2;
    sc = sqrt((_e516 / max(_e517.var0_, 0.000000001f)));
    let _e524 = n_11;
    let _e525 = W_2;
    let _e527 = sc;
    (*nF) = normalize((_e524 - (_e525.g * _e527)));
    let _e532 = W_2;
    let _e534 = W_2;
    let _e541 = sc;
    (*rough) = clamp((sqrt((2f * max((_e532.var_ - _e534.res), 0f))) * _e541), 0.02f, 0.6f);
    let _e547 = U_2;
    cov = clamp((0.00000384f * pow(_e547, 3.41f)), 0f, 0.3f);
    (*foam) = 0f;
    let _e556 = river_2;
    let _e558 = pond;
    let _e561 = cov;
    if ((!(_e556) && !(_e558)) && (_e561 > 0.0001f)) {
        {
            let _e567 = cov;
            t_2 = sqrt((-2f * log(_e567)));
            let _e572 = t_2;
            let _e575 = t_2;
            let _e579 = t_2;
            let _e581 = t_2;
            let _e586 = t_2;
            let _e590 = t_2;
            let _e592 = t_2;
            let _e596 = t_2;
            let _e598 = t_2;
            let _e600 = t_2;
            z = (_e572 - (((2.515517f + (0.802853f * _e575)) + ((0.010328f * _e579) * _e581)) / (((1f + (1.432788f * _e586)) + ((0.189269f * _e590) * _e592)) + (((0.001308f * _e596) * _e598) * _e600))));
            let _e606 = W_2;
            let _e608 = W_2;
            rk = (_e606.res / max(_e608.var_, 0.000000001f));
            let _e614 = cov;
            let _e615 = z;
            let _e618 = z;
            let _e621 = W_2;
            let _e624 = rk;
            (*foam) = (mix(_e614, smoothstep((_e615 - 0.25f), (_e618 + 0.35f), _e621.crest), _e624) * 0.9f);
        }
    }
    let _e628 = river_2;
    let _e630 = pond;
    let _e633 = depth_1;
    if ((!(_e628) && !(_e630)) && (_e633 < 1.6f)) {
        {
            let _e640 = depth_1;
            let _e644 = global.uTime;
            sw = (0.5f + (0.5f * sin((((6.2832f * _e640) / 0.4f) + (_e644 * 1.3f)))));
            let _e654 = grp_3;
            let _e657 = W_2;
            lace = smoothstep(0.2f, 0.8f, (_e654.x + (0.2f * _e657.crest)));
            let _e666 = depth_1;
            let _e671 = sw;
            let _e674 = lace;
            let _e679 = depth_1;
            let _e684 = lace;
            sh_2 = ((((1f - smoothstep(0.05f, 1.6f, _e666)) * smoothstep(0.75f, 0.97f, _e671)) * _e674) + ((1f - smoothstep(0f, 0.15f, _e679)) * (0.4f + (0.6f * _e684))));
            let _e690 = (*foam);
            let _e691 = sh_2;
            let _e697 = U_2;
            (*foam) = max(_e690, ((clamp(_e691, 0f, 1f) * smoothstep(0.5f, 4f, _e697)) * 0.75f));
        }
    }
    let _e703 = river_2;
    let _e704 = fd;
    if (_e703 && (length(_e704) > 0f)) {
        {
            let _e709 = upF_4;
            let _e710 = fd;
            ac = cross(_e709, _e710);
            let _e713 = Fr;
            cov_1 = clamp(((_e713 - 0.6f) / 0.9f), 0f, 1f);
            let _e722 = cov_1;
            let _e723 = cov_1;
            cov_1 = (_e722 * _e723);
            let _e725 = cov_1;
            if (_e725 > 0f) {
                {
                    let _e728 = fp_5;
                    let _e729 = ac;
                    let _e733 = fp_5;
                    let _e734 = fd;
                    q_4 = vec2<f32>((dot(_e728, _e729) * 0.15f), (dot(_e733, _e734) * 0.04f));
                    let _e740 = q_4;
                    let _e742 = fv_1;
                    let _e745 = ta;
                    qa = (_e740 - vec2<f32>(0f, (((_e742 * 3f) * _e745) * 0.04f)));
                    let _e752 = q_4;
                    let _e758 = fv_1;
                    let _e761 = tb;
                    qb = ((_e752 + vec2<f32>(0.41f, 0f)) - vec2<f32>(0f, (((_e758 * 3f) * _e761) * 0.04f)));
                    let _e769 = qa;
                    let _e771 = textureSampleLevel(tDetailTexture, tDetailSampler, _e769, 0f);
                    let _e775 = qa;
                    let _e782 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e775 * 3.1f) + vec2(0.3f)), 0f);
                    na = ((0.65f * _e771.w) + (0.35f * _e782.x));
                    let _e788 = qb;
                    let _e790 = textureSampleLevel(tDetailTexture, tDetailSampler, _e788, 0f);
                    let _e794 = qb;
                    let _e801 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e794 * 3.1f) + vec2(0.3f)), 0f);
                    nb = ((0.65f * _e790.w) + (0.35f * _e801.x));
                    let _e808 = cov_1;
                    th = mix(0.75f, 0.28f, _e808);
                    let _e811 = th;
                    let _e814 = th;
                    let _e817 = nb;
                    let _e818 = na;
                    let _e819 = wa_1;
                    let _e822 = W_2;
                    (*foam) = (smoothstep((_e811 - 0.02f), (_e814 + 0.1f), (mix(_e817, _e818, _e819) + (0.06f * _e822.crest))) * 0.85f);
                }
            }
            let _e829 = fp_5;
            let _e830 = ac;
            let _e834 = fp_5;
            let _e835 = fd;
            q_5 = vec2<f32>((dot(_e829, _e830) * 0.2f), (dot(_e834, _e835) * 0.004f));
            let _e842 = q_5;
            let _e845 = fp_5;
            let _e846 = ac;
            let _e848 = fp_5;
            let _e849 = fd;
            let _e855 = textureSampleLevel(tDetailTexture, tDetailSampler, (vec2<f32>(dot(_e845, _e846), dot(_e848, _e849)) * 0.012f), 0f);
            q_5.x = (_e842.x + (1.2f * (_e855.x - 0.5f)));
            let _e861 = q_5;
            let _e863 = fv_1;
            let _e866 = ta;
            let _e873 = textureSampleLevel(tDetailTexture, tDetailSampler, (_e861 - vec2<f32>(0f, (((_e863 * 3f) * _e866) * 0.004f))), 0f);
            sa = _e873.w;
            let _e876 = q_5;
            let _e882 = fv_1;
            let _e885 = tb;
            let _e892 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e876 + vec2<f32>(0.43f, 0f)) - vec2<f32>(0f, (((_e882 * 3f) * _e885) * 0.004f))), 0f);
            sb = _e892.w;
            let _e897 = sb;
            let _e898 = sa;
            let _e899 = wa_1;
            let _e904 = Fr;
            streak = (smoothstep(0.7f, 0.8f, mix(_e897, _e898, _e899)) * smoothstep(0.6f, 1.2f, _e904));
            let _e908 = (*foam);
            let _e909 = streak;
            (*foam) = max(_e908, (_e909 * 0.3f));
        }
    }
    let _e913 = (*foam);
    let _e914 = global.uLiquid2_;
    (*foam) = (_e913 * _e914.y);
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
    let _e183 = global.uSeason;
    if (_e183.z > 0.5f) {
        {
            let _e187 = upF_6;
            let _e188 = seasonYear(_e187);
            yr = _e188;
            let _e190 = kind_3;
            if (_e190 < 0.2f) {
                local_48 = 1f;
            } else {
                let _e194 = kind_3;
                if (_e194 < 0.55f) {
                    local_47 = 0.8f;
                } else {
                    let _e198 = kind_3;
                    if (_e198 < 0.85f) {
                        local_46 = 0.7f;
                    } else {
                        local_46 = 1f;
                    }
                    let _e204 = local_46;
                    local_47 = _e204;
                }
                let _e206 = local_47;
                local_48 = _e206;
            }
            let _e208 = local_48;
            follow = _e208;
            let _e210 = Tm_1;
            let _e211 = follow;
            let _e212 = yr;
            let _e214 = global.uSeason;
            let _e218 = yr;
            let _e220 = global.uSeason;
            Ts_1 = (_e210 + (_e211 * ((_e212.x * cos(_e214.x)) + (_e218.y * sin(_e220.x)))));
        }
    } else {
        {
            let _e227 = kind_3;
            if (_e227 < 0.2f) {
                local_51 = 0.25f;
            } else {
                let _e231 = kind_3;
                if (_e231 < 0.55f) {
                    local_50 = 0.6f;
                } else {
                    let _e235 = kind_3;
                    if (_e235 < 0.85f) {
                        local_49 = 0.45f;
                    } else {
                        local_49 = 0.8f;
                    }
                    let _e241 = local_49;
                    local_50 = _e241;
                }
                let _e243 = local_50;
                local_51 = _e243;
            }
            let _e245 = local_51;
            follow_1 = _e245;
            let _e247 = Tm_1;
            let _e249 = global.uLiquid2_;
            let _e252 = upF_6;
            let _e255 = follow_1;
            Ts_1 = (_e247 + (((70f * _e249.w) * _e252.y) * _e255));
        }
    }
    let _e258 = kind_3;
    if (_e258 < 0.2f) {
        let _e261 = global.uLiquid2_;
        local_52 = _e261.z;
    } else {
        local_52 = 0f;
    }
    let _e265 = local_52;
    let _e266 = kind_3;
    let _e269 = kind_3;
    if ((_e266 > 0.55f) && (_e269 < 0.85f)) {
        let _e274 = flow_3;
        local_53 = (3f * _e274);
    } else {
        local_53 = 0f;
    }
    let _e278 = local_53;
    Tf_2 = (_e265 - _e278);
    let _e281 = Ts_1;
    let _e282 = Tf_2;
    return vec2<f32>(_e281, _e282);
}

fn seaIceCover(ice: f32, nA: f32, nR: f32) -> f32 {
    var ice_1: f32;
    var nA_1: f32;
    var nR_1: f32;

    ice_1 = ice;
    nA_1 = nA;
    nR_1 = nR;
    let _e182 = ice_1;
    let _e183 = nA_1;
    let _e189 = nR_1;
    let _e198 = ice_1;
    return (smoothstep(0.35f, 0.75f, ((_e182 + ((_e183 - 0.5f) * 0.9f)) + ((_e189 - 0.5f) * 0.35f))) * smoothstep(0f, 0.15f, _e198));
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
    let _e182 = x_2;
    let _e185 = y_1;
    let _e189 = z_2;
    let _e193 = s_2;
    h_3 = ((((_e182 * 2376512323u) ^ (_e185 * 3625334849u)) ^ (_e189 * 3407524639u)) ^ (_e193 * 374761393u));
    let _e198 = h_3;
    let _e199 = h_3;
    h_3 = (_e198 ^ (_e199 >> 15u));
    let _e203 = h_3;
    h_3 = (_e203 * 739982445u);
    let _e206 = h_3;
    let _e207 = h_3;
    h_3 = (_e206 ^ (_e207 >> 12u));
    let _e211 = h_3;
    h_3 = (_e211 * 695872825u);
    let _e214 = h_3;
    let _e215 = h_3;
    h_3 = (_e214 ^ (_e215 >> 15u));
    let _e219 = h_3;
    return _e219;
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
    let _e181 = p_5;
    let _e183 = period_1;
    let _e187 = textureSampleLevel(tDetailTexture, tDetailSampler, (_e181.yz / vec2(_e183)), 0f);
    a_7 = _e187;
    let _e189 = p_5;
    let _e191 = period_1;
    let _e198 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e189.zx / vec2(_e191)) + vec2(0.37f)), 0f);
    b_2 = _e198;
    let _e200 = p_5;
    let _e202 = period_1;
    let _e209 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e200.xy / vec2(_e202)) + vec2(0.71f)), 0f);
    c_4 = _e209;
    let _e211 = a_7;
    let _e212 = w_2;
    let _e215 = b_2;
    let _e216 = w_2;
    let _e220 = c_4;
    let _e221 = w_2;
    return (((_e211 * _e212.x) + (_e215 * _e216.y)) + (_e220 * _e221.z));
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
    let _e181 = p_7;
    let _e183 = period_3;
    let _e187 = textureSampleLevel(tDetailTexture, tDetailSampler, (_e181.yz / vec2(_e183)), 0f);
    a_8 = _e187;
    let _e189 = p_7;
    let _e191 = period_3;
    let _e198 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e189.zx / vec2(_e191)) + vec2(0.37f)), 0f);
    b_3 = _e198;
    let _e200 = p_7;
    let _e202 = period_3;
    let _e209 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e200.xy / vec2(_e202)) + vec2(0.71f)), 0f);
    c_5 = _e209;
    let _e211 = a_8;
    let _e212 = w_4;
    let _e215 = b_3;
    let _e216 = w_4;
    let _e220 = c_5;
    let _e221 = w_4;
    return (((_e211 * _e212.x) + (_e215 * _e216.y)) + (_e220 * _e221.z));
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
    let _e182 = lid_1;
    age = (-2f * log(((f32((_e182 & 65535u)) + 0.5f) / 65536f)));
    let _e193 = frz_1;
    if (_e193 > 0f) {
        let _e197 = frz_1;
        let _e198 = age;
        local_54 = (1.33f * pow((_e197 * _e198), 0.58f));
    } else {
        local_54 = 0f;
    }
    let _e205 = local_54;
    h_4 = _e205;
    let _e207 = h_4;
    let _e209 = pDay_1;
    let _e211 = age;
    let _e219 = h_4;
    return vec2<f32>(_e207, ((1f - exp(((-(_e209) * _e211) / 12f))) * smoothstep(3f, 8f, _e219)));
}

fn leadHalf(cid: u32, c_6: f32, s_3: f32) -> f32 {
    var cid_1: u32;
    var c_7: f32;
    var s_4: f32;

    cid_1 = cid;
    c_7 = c_6;
    s_4 = s_3;
    let _e182 = s_4;
    let _e188 = cid_1;
    let _e200 = c_7;
    return min(150f, (((0.03f * min(_e182, 2048f)) * (0.2f + ((1.6f * f32((_e188 & 255u))) / 256f))) * (1f + (8f * (1f - sqrt(_e200))))));
}

fn crackOpen(cid_2: u32, c_8: f32, s_5: f32) -> f32 {
    var cid_3: u32;
    var c_9: f32;
    var s_6: f32;

    cid_3 = cid_2;
    c_9 = c_8;
    s_6 = s_5;
    let _e180 = cid_3;
    let _e191 = c_9;
    if ((f32(((_e180 >> 8u) & 255u)) / 256f) < (0.5f * smoothstep(0.85f, 1f, _e191))) {
        let _e196 = cid_3;
        return -((0.5f + (f32(((_e196 >> 16u) & 255u)) / 255f)));
    }
    let _e206 = cid_3;
    let _e207 = c_9;
    let _e208 = s_6;
    let _e209 = leadHalf(_e206, _e207, _e208);
    return _e209;
}

fn pieceCover(m_4: vec3<f32>, ice_2: f32) -> f32 {
    var m_5: vec3<f32>;
    var ice_3: f32;
    var u_2: vec3<f32>;
    var wm: vec3<f32>;
    var local_55: f32;

    m_5 = m_4;
    ice_3 = ice_2;
    let _e178 = m_5;
    u_2 = normalize(_e178);
    let _e181 = u_2;
    wm = pow(abs(_e181), vec3(4f));
    let _e187 = wm;
    let _e188 = wm;
    let _e190 = wm;
    let _e193 = wm;
    wm = (_e187 / vec3(((_e188.x + _e190.y) + _e193.z)));
    let _e198 = global.uSeason;
    if (_e198.z > 0.5f) {
        let _e202 = m_5;
        let _e203 = global.uLiquid2_;
        let _e205 = seaIceAt(_e202, _e203.z);
        local_55 = _e205;
    } else {
        let _e206 = ice_3;
        local_55 = _e206;
    }
    let _e208 = local_55;
    let _e209 = m_5;
    let _e210 = wm;
    let _e212 = tri0_(_e209, _e210, 512f);
    let _e214 = m_5;
    let _e215 = wm;
    let _e217 = tri0_(_e214, _e215, 64f);
    let _e219 = seaIceCover(_e208, _e212.w, _e217.x);
    return _e219;
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
    let _e180 = axis_1;
    let _e184 = neg_1;
    if _e184 {
        local_56 = 1u;
    } else {
        local_56 = 0u;
    }
    let _e188 = local_56;
    of_ = (u32((_e180 * 2i)) + _e188);
    let _e191 = face_1;
    let _e192 = of_;
    let _e194 = face_1;
    let _e195 = of_;
    let _e199 = floeHash(min(_e191, _e192), max(_e194, _e195), 20253u, 11132u);
    return _e199;
}

fn floeRound(size: f32, id: u32, c_10: f32) -> f32 {
    var size_1: f32;
    var id_1: u32;
    var c_11: f32;
    var age_1: f32;

    size_1 = size;
    id_1 = id;
    c_11 = c_10;
    let _e185 = size_1;
    let _e191 = id_1;
    age_1 = ((0.3f + (0.7f * smoothstep(16f, 200f, _e185))) * (0.6f + ((0.4f * f32((_e191 >> 16u))) / 65536f)));
    let _e201 = size_1;
    let _e204 = age_1;
    let _e211 = c_11;
    return (_e201 * ((0.06f * (0.5f + _e204)) + (0.32f * (1f - smoothstep(0.5f, 0.9f, _e211)))));
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
    let _e187 = p_9;
    R_2 = length(_e187);
    let _e190 = p_9;
    a_9 = abs(_e190);
    let _e193 = a_9;
    let _e195 = a_9;
    let _e198 = a_9;
    let _e200 = a_9;
    if ((_e193.x >= _e195.y) && (_e198.x >= _e200.z)) {
        local_58 = 0i;
    } else {
        let _e205 = a_9;
        let _e207 = a_9;
        if (_e205.y >= _e207.z) {
            local_57 = 1i;
        } else {
            local_57 = 2i;
        }
        let _e213 = local_57;
        local_58 = _e213;
    }
    let _e215 = local_58;
    ax = _e215;
    let _e217 = ax;
    b_4 = ((_e217 + 1i) % 3i);
    let _e223 = ax;
    d_8 = ((_e223 + 2i) % 3i);
    let _e229 = ax;
    let _e231 = p_9[_e229];
    neg_2 = (_e231 < 0f);
    let _e235 = neg_2;
    if _e235 {
        local_59 = -1f;
    } else {
        local_59 = 1f;
    }
    let _e240 = local_59;
    sg = _e240;
    let _e242 = b_4;
    let _e244 = p_9[_e242];
    let _e245 = ax;
    let _e247 = p_9[_e245];
    pu = (_e244 / _e247);
    let _e250 = d_8;
    let _e252 = p_9[_e250];
    let _e253 = ax;
    let _e255 = p_9[_e253];
    pv = (_e252 / _e255);
    let _e258 = ax;
    let _e262 = neg_2;
    if _e262 {
        local_60 = 1u;
    } else {
        local_60 = 0u;
    }
    let _e266 = local_60;
    face_2 = (u32((_e258 * 2i)) + _e266);
    V_1[0i] = vec2<f32>(-1f, -1f);
    V_1[1i] = vec2<f32>(1f, -1f);
    V_1[2i] = vec2<f32>(1f, 1f);
    V_1[3i] = vec2<f32>(-1f, 1f);
    let _e298 = face_2;
    let _e299 = d_8;
    let _e300 = neg_2;
    let _e302 = faceLead(_e298, _e299, !(_e300));
    EI[0i] = _e302;
    let _e305 = face_2;
    let _e306 = b_4;
    let _e307 = neg_2;
    let _e308 = faceLead(_e305, _e306, _e307);
    EI[1i] = _e308;
    let _e311 = face_2;
    let _e312 = d_8;
    let _e313 = neg_2;
    let _e314 = faceLead(_e311, _e312, _e313);
    EI[2i] = _e314;
    let _e317 = face_2;
    let _e318 = b_4;
    let _e319 = neg_2;
    let _e321 = faceLead(_e317, _e318, !(_e319));
    EI[3i] = _e321;
    loop {
        let _e324 = i_7;
        if !((_e324 < 4i)) {
            break;
        }
        let _e331 = i_7;
        let _e333 = i_7;
        let _e335 = EI[_e333];
        let _e338 = leadHalf(_e335, 1f, 4096f);
        ES[_e331] = _e338;
        continuing {
            let _e328 = i_7;
            i_7 = (_e328 + 1i);
        }
    }
    (*ridge) = vec4<f32>(0f, 0f, 0f, 100000000000000000000f);
    let _e346 = face_2;
    let _e350 = floeHash(_e346, 20942u, 0u, 14971u);
    (*id_2) = _e350;
    (*c_12) = 1f;
    let _e357 = p_9;
    m_6 = _e357;
    loop {
        let _e361 = lvl;
        if !((_e361 < 32i)) {
            break;
        }
        {
            let _e370 = V_1[0];
            v0_ = _e370;
            cs_1 = vec2(0f);
            A_1 = 0f;
            i_8 = 0i;
            loop {
                let _e379 = i_8;
                if !((_e379 < POLY_MAX)) {
                    break;
                }
                {
                    let _e385 = i_8;
                    let _e386 = n_12;
                    if (_e385 >= _e386) {
                        break;
                    }
                    let _e388 = i_8;
                    let _e390 = V_1[_e388];
                    let _e391 = v0_;
                    xi = (_e390 - _e391);
                    let _e394 = i_8;
                    let _e397 = n_12;
                    let _e400 = V_1[((_e394 + 1i) % _e397)];
                    let _e401 = v0_;
                    xj = (_e400 - _e401);
                    let _e404 = xi;
                    let _e406 = xj;
                    let _e409 = xj;
                    let _e411 = xi;
                    w_5 = ((_e404.x * _e406.y) - (_e409.x * _e411.y));
                    let _e416 = A_1;
                    let _e417 = w_5;
                    A_1 = (_e416 + _e417);
                    let _e419 = cs_1;
                    let _e420 = xi;
                    let _e421 = xj;
                    let _e423 = w_5;
                    cs_1 = (_e419 + ((_e420 + _e421) * _e423));
                }
                continuing {
                    let _e382 = i_8;
                    i_8 = (_e382 + 1i);
                }
            }
            let _e426 = A_1;
            A_1 = (_e426 * 0.5f);
            let _e429 = A_1;
            if (abs(_e429) < 0.00000000000000000001f) {
                break;
            }
            let _e433 = v0_;
            let _e434 = cs_1;
            let _e436 = A_1;
            cc = (_e433 + (_e434 / vec2((6f * _e436))));
            sxx = 0f;
            syy = 0f;
            sxy = 0f;
            i_9 = 0i;
            loop {
                let _e450 = i_9;
                if !((_e450 < POLY_MAX)) {
                    break;
                }
                {
                    let _e456 = i_9;
                    let _e457 = n_12;
                    if (_e456 >= _e457) {
                        break;
                    }
                    let _e459 = i_9;
                    let _e461 = V_1[_e459];
                    let _e462 = cc;
                    x_3 = (_e461 - _e462);
                    let _e465 = sxx;
                    let _e466 = x_3;
                    let _e468 = x_3;
                    sxx = (_e465 + (_e466.x * _e468.x));
                    let _e472 = syy;
                    let _e473 = x_3;
                    let _e475 = x_3;
                    syy = (_e472 + (_e473.y * _e475.y));
                    let _e479 = sxy;
                    let _e480 = x_3;
                    let _e482 = x_3;
                    sxy = (_e479 + (_e480.x * _e482.y));
                }
                continuing {
                    let _e453 = i_9;
                    i_9 = (_e453 + 1i);
                }
            }
            let _e486 = sxy;
            let _e488 = sxx;
            let _e489 = syy;
            let _e494 = sxx;
            let _e495 = syy;
            if ((abs(_e486) + abs((_e488 - _e489))) > (0.000000000000000000000000000001f * (_e494 + _e495))) {
                let _e501 = sxy;
                let _e503 = sxx;
                let _e504 = syy;
                local_61 = (0.5f * atan2((2f * _e501), (_e503 - _e504)));
            } else {
                local_61 = 0f;
            }
            let _e510 = local_61;
            th_1 = _e510;
            let _e512 = sxx;
            let _e513 = syy;
            let _e515 = n_12;
            ext = sqrt(((_e512 + _e513) / f32(_e515)));
            let _e521 = ax;
            let _e523 = sg;
            mm[_e521] = _e523;
            let _e524 = b_4;
            let _e526 = sg;
            let _e527 = cc;
            mm[_e524] = (_e526 * _e527.x);
            let _e530 = d_8;
            let _e532 = sg;
            let _e533 = cc;
            mm[_e530] = (_e532 * _e533.y);
            let _e536 = mm;
            let _e538 = R_2;
            m_6 = (normalize(_e536) * _e538);
            let _e540 = R_2;
            let _e541 = A_1;
            let _e546 = cc;
            let _e547 = cc;
            s_7 = ((_e540 * sqrt(abs(_e541))) / pow((1f + dot(_e546, _e547)), 0.75f));
            let _e553 = (*id_2);
            let _e554 = lvl;
            let _e558 = floeHash(_e553, u32(_e554), 20942u, 14971u);
            h_5 = _e558;
            let _e560 = th_1;
            let _e563 = h_5;
            tc = (((_e560 + 1.5708f) + ((f32(((_e563 >> 8u) & 1023u)) / 1023f) * 1.0472f)) - 0.5236f);
            let _e577 = h_5;
            let _e589 = ext;
            off = ((((f32(((_e577 >> 18u) & 255u)) / 255f) - 0.5f) * 0.6f) * _e589);
            let _e592 = cc;
            let _e593 = th_1;
            let _e595 = th_1;
            let _e598 = off;
            qq = (_e592 + (vec2<f32>(cos(_e593), sin(_e595)) * _e598));
            let _e602 = tc;
            KA = -(sin(_e602));
            let _e606 = tc;
            KB = cos(_e606);
            let _e609 = KA;
            let _e610 = qq;
            let _e613 = KB;
            let _e614 = qq;
            KC = -(((_e609 * _e610.x) + (_e613 * _e614.y)));
            let _e620 = s_7;
            if (_e620 < 4096f) {
                {
                    let _e623 = cP;
                    let _e626 = s_7;
                    if ((_e623 < 0f) || (_e626 < 1024f)) {
                        let _e630 = m_6;
                        let _e631 = ice_5;
                        let _e632 = pieceCover(_e630, _e631);
                        cP = _e632;
                    }
                    let _e633 = cP;
                    (*c_12) = _e633;
                    let _e634 = s_7;
                    let _e639 = (*c_12);
                    let _e644 = h_5;
                    let _e651 = (*c_12);
                    if ((_e634 < (12f + (288f * smoothstep(0.4f, 0.95f, _e639)))) || (f32((_e644 & 255u)) < (51.2f * smoothstep(0.5f, 0.9f, _e651)))) {
                        break;
                    }
                }
            }
            let _e656 = n_12;
            if (_e656 >= 11i) {
                break;
            }
            let _e661 = KA;
            let _e662 = pu;
            let _e664 = KB;
            let _e665 = pv;
            let _e668 = KC;
            if ((((_e661 * _e662) + (_e664 * _e665)) + _e668) >= 0f) {
                local_62 = 1f;
            } else {
                local_62 = -1f;
            }
            let _e676 = local_62;
            side = _e676;
            let _e678 = (*id_2);
            let _e679 = lvl;
            let _e683 = floeHash(_e678, u32(_e679), 31249u, 7997u);
            cid_4 = _e683;
            let _e685 = cid_4;
            let _e686 = (*c_12);
            let _e687 = s_7;
            let _e688 = crackOpen(_e685, _e686, _e687);
            g_4 = _e688;
            k_2 = 0i;
            i_10 = 0i;
            loop {
                let _e697 = i_10;
                if !((_e697 < POLY_MAX)) {
                    break;
                }
                {
                    let _e703 = i_10;
                    let _e704 = n_12;
                    let _e706 = k_2;
                    if ((_e703 >= _e704) || (_e706 >= POLY_MAX)) {
                        break;
                    }
                    let _e709 = i_10;
                    let _e711 = V_1[_e709];
                    xi_1 = _e711;
                    let _e713 = i_10;
                    let _e716 = n_12;
                    let _e719 = V_1[((_e713 + 1i) % _e716)];
                    xj_1 = _e719;
                    let _e721 = side;
                    let _e722 = KA;
                    let _e723 = xi_1;
                    let _e726 = KB;
                    let _e727 = xi_1;
                    let _e731 = KC;
                    di = (_e721 * (((_e722 * _e723.x) + (_e726 * _e727.y)) + _e731));
                    let _e735 = side;
                    let _e736 = KA;
                    let _e737 = xj_1;
                    let _e740 = KB;
                    let _e741 = xj_1;
                    let _e745 = KC;
                    dj = (_e735 * (((_e736 * _e737.x) + (_e740 * _e741.y)) + _e745));
                    let _e749 = di;
                    if (_e749 >= 0f) {
                        {
                            let _e752 = k_2;
                            let _e754 = xi_1;
                            W_3[_e752] = _e754;
                            let _e755 = k_2;
                            let _e757 = i_10;
                            let _e759 = EI[_e757];
                            WI[_e755] = _e759;
                            let _e760 = k_2;
                            let _e762 = i_10;
                            let _e764 = ES[_e762];
                            WS[_e760] = _e764;
                            let _e765 = k_2;
                            k_2 = (_e765 + 1i);
                        }
                    }
                    let _e768 = di;
                    let _e771 = dj;
                    let _e775 = k_2;
                    if (((_e768 >= 0f) != (_e771 >= 0f)) && (_e775 < POLY_MAX)) {
                        {
                            let _e778 = k_2;
                            let _e780 = xi_1;
                            let _e781 = xj_1;
                            let _e782 = xi_1;
                            let _e784 = di;
                            let _e785 = di;
                            let _e786 = dj;
                            W_3[_e778] = (_e780 + ((_e781 - _e782) * (_e784 / (_e785 - _e786))));
                            let _e791 = di;
                            if (_e791 >= 0f) {
                                {
                                    let _e794 = k_2;
                                    let _e796 = cid_4;
                                    WI[_e794] = _e796;
                                    let _e797 = k_2;
                                    let _e799 = g_4;
                                    WS[_e797] = _e799;
                                }
                            } else {
                                {
                                    let _e800 = k_2;
                                    let _e802 = i_10;
                                    let _e804 = EI[_e802];
                                    WI[_e800] = _e804;
                                    let _e805 = k_2;
                                    let _e807 = i_10;
                                    let _e809 = ES[_e807];
                                    WS[_e805] = _e809;
                                }
                            }
                            let _e810 = k_2;
                            k_2 = (_e810 + 1i);
                        }
                    }
                }
                continuing {
                    let _e700 = i_10;
                    i_10 = (_e700 + 1i);
                }
            }
            i_11 = 0i;
            loop {
                let _e815 = i_11;
                if !((_e815 < POLY_MAX)) {
                    break;
                }
                {
                    let _e821 = i_11;
                    let _e823 = i_11;
                    let _e825 = W_3[_e823];
                    V_1[_e821] = _e825;
                    let _e826 = i_11;
                    let _e828 = i_11;
                    let _e830 = WI[_e828];
                    EI[_e826] = _e830;
                    let _e831 = i_11;
                    let _e833 = i_11;
                    let _e835 = WS[_e833];
                    ES[_e831] = _e835;
                }
                continuing {
                    let _e818 = i_11;
                    i_11 = (_e818 + 1i);
                }
            }
            let _e836 = k_2;
            n_12 = _e836;
            let _e837 = (*id_2);
            let _e838 = side;
            if (_e838 > 0f) {
                local_63 = 1u;
            } else {
                local_63 = 0u;
            }
            let _e844 = local_63;
            let _e845 = lvl;
            let _e848 = floeHash(_e837, _e844, u32(_e845), 40503u);
            (*id_2) = _e848;
        }
        continuing {
            let _e365 = lvl;
            lvl = (_e365 + 1i);
        }
    }
    (*e) = 100000000000000000000f;
    (*lid_2) = 0u;
    loop {
        let _e857 = i_12;
        if !((_e857 < POLY_MAX)) {
            break;
        }
        {
            let _e863 = i_12;
            let _e864 = n_12;
            if (_e863 >= _e864) {
                break;
            }
            let _e866 = i_12;
            let _e869 = n_12;
            let _e872 = V_1[((_e866 + 1i) % _e869)];
            let _e873 = i_12;
            let _e875 = V_1[_e873];
            dv = (_e872 - _e875);
            let _e878 = dv;
            let _e879 = dv;
            if (dot(_e878, _e879) < 0.000000000000000000000001f) {
                continue;
            }
            let _e884 = b_4;
            let _e886 = dv;
            N3_[_e884] = -(_e886.y);
            let _e889 = d_8;
            let _e891 = dv;
            N3_[_e889] = _e891.x;
            let _e893 = ax;
            let _e895 = dv;
            let _e897 = i_12;
            let _e899 = V_1[_e897];
            let _e902 = dv;
            let _e904 = i_12;
            let _e906 = V_1[_e904];
            N3_[_e893] = ((_e895.y * _e899.x) - (_e902.x * _e906.y));
            let _e910 = N3_;
            N3_ = normalize(_e910);
            let _e912 = p_9;
            let _e913 = N3_;
            dn_2 = dot(_e912, _e913);
            let _e916 = dn_2;
            let _e918 = i_12;
            let _e920 = ES[_e918];
            ek = (abs(_e916) - max(_e920, 0.15f));
            let _e925 = ek;
            let _e926 = (*e);
            if (_e925 < _e926) {
                {
                    let _e928 = (*e);
                    e2_1 = _e928;
                    let _e929 = ek;
                    (*e) = _e929;
                    let _e930 = i_12;
                    let _e932 = EI[_e930];
                    (*lid_2) = _e932;
                }
            } else {
                let _e933 = ek;
                let _e934 = e2_1;
                if (_e933 < _e934) {
                    let _e936 = ek;
                    e2_1 = _e936;
                }
            }
            let _e937 = i_12;
            let _e939 = ES[_e937];
            let _e942 = dn_2;
            let _e944 = (*ridge);
            if ((_e939 < 0f) && (abs(_e942) < _e944.w)) {
                {
                    let _e948 = N3_;
                    let _e949 = dn_2;
                    let _e951 = (_e948 * sign(_e949));
                    let _e952 = dn_2;
                    (*ridge) = vec4<f32>(_e951.x, _e951.y, _e951.z, abs(_e952));
                    let _e958 = i_12;
                    let _e960 = ES[_e958];
                    rh = -(_e960);
                }
            }
        }
        continuing {
            let _e860 = i_12;
            i_12 = (_e860 + 1i);
        }
    }
    let _e963 = rh;
    if (_e963 > 0f) {
        let _e966 = rh;
        let _e969 = (*ridge);
        let _e972 = rh;
        local_64 = (_e966 * max(0f, (1f - (_e969.w / (2f * _e972)))));
    } else {
        local_64 = 0f;
    }
    let _e980 = local_64;
    (*ridge).w = _e980;
    let _e981 = m_6;
    let _e982 = ice_5;
    let _e983 = pieceCover(_e981, _e982);
    (*c_12) = _e983;
    let _e984 = s_7;
    let _e985 = (*id_2);
    let _e986 = (*c_12);
    let _e987 = floeRound(_e984, _e985, _e986);
    rr = _e987;
    let _e989 = e2_1;
    let _e990 = rr;
    if (_e989 < _e990) {
        let _e992 = rr;
        let _e993 = rr;
        let _e994 = (*e);
        let _e996 = rr;
        let _e997 = e2_1;
        (*e) = (_e992 - length(vec2<f32>((_e993 - _e994), (_e996 - _e997))));
    }
    let _e1002 = s_7;
    (*size_2) = _e1002;
    let _e1003 = m_6;
    (*mid) = _e1003;
    let _e1004 = (*c_12);
    let _e1007 = (*id_2);
    let _e1015 = (*c_12);
    (*there) = ((_e1004 > 0f) && ((f32((_e1007 & 65535u)) / 65536f) <= min(1f, (1.5f * _e1015))));
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
    let _e194 = frz_3;
    let _e195 = pDay_3;
    let _e196 = leadIce(32768u, _e194, _e195);
    leadFar = _e196;
    (*lead) = vec2(0f);
    (*ridge_1) = vec4(0f);
    let _e202 = cPix_1;
    let _e205 = ice_7;
    if ((_e202 <= 0f) && (_e205 <= 0f)) {
        return vec4(0f);
    }
    let _e211 = foot_15;
    if (_e211 >= 64f) {
        {
            let _e214 = leadFar;
            (*lead) = _e214;
            let _e215 = cPix_1;
            let _e218 = cPix_1;
            return vec4<f32>(_e215, 0f, 0.7f, _e218);
        }
    }
    let _e227 = p_11;
    let _e228 = ice_7;
    floeOf(_e227, _e228, (&id_3), (&e_1), (&lid_3), (&c_13), (&size_3), (&mid_1), (&there_1), ridge_1);
    let _e245 = there_1;
    if !(_e245) {
        (*ridge_1) = vec4(0f);
    }
    let _e249 = e_1;
    let _e250 = p_11;
    let _e251 = w_7;
    let _e253 = tri(_e250, _e251, 8f);
    let _e259 = p_11;
    let _e260 = w_7;
    let _e262 = tri(_e259, _e260, 2f);
    e_1 = (_e249 + (((_e253.x - 0.5f) * 1.6f) + ((_e262.w - 0.5f) * 0.5f)));
    let _e270 = foot_15;
    fw = max(_e270, 0.03f);
    let _e282 = size_3;
    let _e288 = id_3;
    age_2 = ((0.3f + (0.7f * smoothstep(16f, 200f, _e282))) * (0.6f + ((0.4f * f32((_e288 >> 16u))) / 65536f)));
    let _e298 = there_1;
    if _e298 {
        {
            let _e299 = e_1;
            let _e300 = fw;
            x_4 = clamp(((_e299 / _e300) + 0.5f), 0f, 1f);
            let _e310 = fw;
            let _e312 = e_1;
            rim = (1f - smoothstep(0f, (0.8f + _e310), _e312));
            let _e315 = lid_3;
            let _e316 = frz_3;
            let _e317 = pDay_3;
            let _e318 = leadIce(_e315, _e316, _e317);
            (*lead) = _e318;
        }
    }
    let _e321 = foot_15;
    kFar = smoothstep(16f, 64f, _e321);
    let _e324 = x_4;
    let _e325 = cPix_1;
    let _e326 = kFar;
    x_4 = mix(_e324, _e325, _e326);
    let _e328 = (*lead);
    let _e329 = leadFar;
    let _e330 = kFar;
    (*lead) = mix(_e328, _e329, vec2(_e330));
    let _e334 = (*ridge_1);
    let _e337 = kFar;
    (*ridge_1).w = (_e334.w * (1f - _e337));
    let _e340 = x_4;
    let _e341 = rim;
    let _e342 = x_4;
    let _e345 = kFar;
    let _e348 = age_2;
    let _e350 = kFar;
    let _e352 = c_13;
    let _e353 = cPix_1;
    let _e354 = kFar;
    return vec4<f32>(_e340, ((_e341 * _e342) * (1f - _e345)), mix(_e348, 0.7f, _e350), mix(_e352, _e353, _e354));
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

    let _e175 = vWorldPos_1;
    let _e176 = fwidth(_e175);
    foot_16 = length(_e176);
    let _e179 = vFixedPos_1;
    let _e180 = dpdx(_e179);
    dpx = _e180;
    let _e182 = vFixedPos_1;
    let _e183 = dpdy(_e182);
    dpy = _e183;
    let _e185 = vCol_1;
    let _e187 = vCol_1;
    albedo = (_e185.xyz * _e187.xyz);
    let _e191 = vCol_1;
    waterEnc = _e191.w;
    let _e194 = global.uNear;
    if (_e194.x > 0.5f) {
        {
            let _e198 = vNearRel_1;
            let _e199 = global.uNearUp;
            let _e200 = vNearRel_1;
            let _e201 = global.uNearUp;
            dn_3 = length((_e198 - (_e199 * dot(_e200, _e201))));
            let _e207 = global.uNearMode;
            if (_e207 < 0.5f) {
                {
                    let _e210 = dn_3;
                    let _e212 = global.uNear;
                    let _e216 = vShore_1;
                    if ((_e210 < (0.97f * _e212.y)) && (_e216 <= 0f)) {
                        discard;
                    }
                }
            } else {
                let _e220 = dn_3;
                let _e221 = global.uNearBand;
                let _e224 = dn_3;
                let _e225 = global.uNearBand;
                if ((_e220 < _e221.x) || (_e224 > _e225.y)) {
                    discard;
                }
            }
        }
    }
    let _e229 = vMat_1;
    veg = _e229.x;
    let _e232 = vMat_1;
    snow = _e232.y;
    let _e235 = vMat_1;
    rock = _e235.z;
    let _e238 = vMat_1;
    sand = _e238.w;
    let _e241 = vExt_1;
    emissive = _e241.x;
    let _e244 = vExt_1;
    wet = _e244.y;
    let _e247 = vExt_1;
    rough_1 = _e247.z;
    let _e250 = vWorldPos_1;
    let _e251 = global.uCenter;
    rel_4 = (_e250 - _e251);
    let _e254 = rel_4;
    r_10 = length(_e254);
    let _e257 = rel_4;
    let _e258 = r_10;
    up_4 = (_e257 / vec3(_e258));
    let _e262 = vWorldPos_1;
    dist_3 = length(_e262);
    let _e265 = vCol_1;
    colC = _e265.xyz;
    let _e268 = vShore_1;
    shoreV = _e268;
    let _e270 = dist_3;
    let _e271 = colourCubeK(_e270);
    cK = _e271;
    let _e273 = cK;
    if (_e273 > 0f) {
        {
            let _e276 = global.uToFixed;
            let _e277 = up_4;
            let _e280 = colourCubeAt(normalize((_e276 * _e277)));
            cc_1 = _e280;
            let _e282 = colC;
            let _e283 = cc_1;
            let _e285 = cK;
            colC = mix(_e282, _e283.xyz, vec3(_e285));
            let _e288 = shoreV;
            let _e289 = cc_1;
            let _e297 = cK;
            shoreV = mix(_e288, (((_e289.w * 255f) - 128f) / 127f), _e297);
            let _e299 = colC;
            let _e300 = colC;
            albedo = (_e299 * _e300);
        }
    }
    let _e302 = vNormal_1;
    N_3 = normalize(_e302);
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
    let _e320 = foot_16;
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
    let _e346 = N_3;
    let _e347 = sunShadowMap(_e345, _e346);
    keySh = _e347;
    let _e349 = sunT;
    let _e350 = keySh;
    sunT = (_e349 * _e350);
    let _e352 = vFixedPos_1;
    fp_6 = _e352;
    let _e354 = vFixedNormal_1;
    fn_ = normalize(_e354);
    let _e357 = fn_;
    w_8 = pow(abs(_e357), vec3(4f));
    let _e363 = w_8;
    let _e364 = w_8;
    let _e366 = w_8;
    let _e369 = w_8;
    w_8 = (_e363 / vec3(((_e364.x + _e366.y) + _e369.z)));
    let _e377 = dist_3;
    fineK = (1f - smoothstep(60f, 900f, _e377));
    let _e384 = dist_3;
    midK = (1f - smoothstep(600f, 9000f, _e384));
    let _e391 = dist_3;
    farK = (1f - smoothstep(6000f, 90000f, _e391));
    let _e395 = shoreV;
    if (_e395 > 0f) {
        local_65 = 1f;
    } else {
        local_65 = 0f;
    }
    let _e401 = local_65;
    isWater = _e401;
    let _e407 = isWater;
    if (_e407 < 0.5f) {
        discard;
    }
    let _e410 = N_3;
    let _e411 = global.uSunDir;
    ndl_1 = max(dot(_e410, _e411), 0f);
    let _e421 = isWater;
    if (_e421 > 0.5f) {
        {
            let _e424 = vWorldPos_1;
            V_2 = normalize(-(_e424));
            let _e428 = global.uToFixed;
            let _e429 = up_4;
            upF_7 = (_e428 * _e429);
            let _e432 = vLiq_1;
            if (_e432.x > 0.02f) {
                let _e436 = vLiq_1;
                let _e438 = vLiq_1;
                local_66 = (_e436.yzw / vec3(_e438.x));
            } else {
                local_66 = vec3<f32>(0f, 0.75f, 1f);
            }
            let _e447 = local_66;
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
                local_67 = _e468.z;
            } else {
                local_67 = 0f;
            }
            let _e472 = local_67;
            flow_4 = _e472;
            let _e474 = kind_4;
            if (_e474 < 0.2f) {
                local_70 = 1f;
            } else {
                let _e478 = river_3;
                if _e478 {
                    local_69 = 0.2f;
                } else {
                    let _e480 = kind_4;
                    if (_e480 > 0.85f) {
                        local_68 = 0.05f;
                    } else {
                        let _e484 = lq;
                        local_68 = _e484.z;
                    }
                    let _e487 = local_68;
                    local_69 = _e487;
                }
                let _e489 = local_69;
                local_70 = _e489;
            }
            let _e491 = local_70;
            fetch_2 = _e491;
            let _e493 = waterEnc;
            let _e494 = waterEnc;
            let _e500 = shoreV;
            depthW = (((_e493 * _e494) * 6000f) * smoothstep(0f, 0.125f, _e500));
            let _e504 = fp_6;
            let _e505 = w_8;
            let _e507 = tri(_e504, _e505, 512f);
            nW = _e507;
            let _e509 = fp_6;
            let _e510 = w_8;
            let _e512 = tri(_e509, _e510, 64f);
            nG = _e512;
            let _e514 = nW;
            let _e518 = nW;
            wn_2 = (vec2<f32>((_e514.x - 0.5f), (_e518.w - 0.5f)) * 2f);
            let _e526 = nG;
            let _e528 = nG;
            let _e530 = nW;
            let _e532 = nW;
            grp_4 = clamp(((vec4<f32>(_e526.x, _e528.w, _e530.w, _e532.x) * 1.6f) - vec4(0.3f)), vec4(0f), vec4(1f));
            let _e549 = vFlw_1;
            fv_2 = (max(_e549.w, 0f) * 9f);
            let _e556 = fp_6;
            let _e557 = fn_;
            let _e558 = upF_7;
            let _e559 = kind_4;
            let _e560 = flow_4;
            let _e561 = fetch_2;
            let _e562 = depthW;
            let _e563 = foot_16;
            let _e564 = wn_2;
            let _e565 = grp_4;
            let _e566 = vFlw_1;
            let _e568 = fv_2;
            liquidSurface(_e556, _e557, _e558, _e559, _e560, _e561, _e562, _e563, _e564, _e565, _e566.xyz, _e568, (&nF_1), (&wr), (&foam_1));
            let _e575 = Tm_2;
            let _e576 = kind_4;
            let _e577 = flow_4;
            let _e578 = upF_7;
            let _e579 = liquidTs(_e575, _e576, _e577, _e578);
            tsf = _e579;
            let _e582 = tsf;
            let _e586 = tsf;
            let _e590 = tsf;
            ice_8 = (1f - smoothstep((_e582.y - 4f), (_e586.y + 4f), _e590.x));
            let _e595 = kind_4;
            let _e598 = ice_8;
            if ((_e595 < 0.2f) && (_e598 > 0f)) {
                let _e602 = ice_8;
                let _e603 = nW;
                let _e605 = nG;
                let _e607 = seaIceCover(_e602, _e603.w, _e605.x);
                local_71 = _e607;
            } else {
                local_71 = 0f;
            }
            let _e610 = local_71;
            iceC = _e610;
            let _e612 = global.uSeason;
            if (_e612.z > 0.5f) {
                let _e617 = upF_7;
                let _e618 = seasonYear(_e617);
                let _e622 = global.uSeason;
                local_72 = (((12f * _e618.z) * DDF_SNOW) / max(_e622.y, 1f));
            } else {
                local_72 = 0f;
            }
            let _e629 = local_72;
            pDay_4 = _e629;
            let _e634 = global.uSeason;
            if (_e634.z > 0.5f) {
                let _e638 = Tm_2;
                let _e639 = upF_7;
                let _e640 = seasonIceNow(_e639);
                local_73 = (_e638 + _e640);
            } else {
                let _e642 = tsf;
                local_73 = _e642.x;
            }
            let _e645 = local_73;
            Tair_2 = _e645;
            let _e650 = kind_4;
            if (_e650 < 0.2f) {
                let _e653 = pF_3;
                let _e654 = upF_7;
                let _e655 = w_8;
                let _e656 = ice_8;
                let _e657 = iceC;
                let _e658 = foot_16;
                let _e659 = tsf;
                let _e661 = Tair_2;
                let _e665 = pDay_4;
                let _e670 = seaFloes(_e653, _e654, _e655, _e656, _e657, _e658, max((_e659.y - _e661), 0f), _e665, (&lead_1), (&ridge_2));
                local_74 = _e670;
            } else {
                let _e671 = ice_8;
                local_74 = vec4<f32>(_e671, 0f, 1f, 0f);
            }
            let _e677 = local_74;
            fl = _e677;
            let _e681 = iceC;
            let _e682 = fl;
            calm = smoothstep(0.05f, 0.6f, max(_e681, _e682.w));
            let _e687 = nF_1;
            let _e688 = upF_7;
            let _e690 = calm;
            nF_1 = normalize(mix(_e687, _e688, vec3((0.9f * _e690))));
            let _e695 = wr;
            let _e698 = calm;
            wr = (_e695 * (1f - (0.8f * _e698)));
            let _e702 = foam_1;
            let _e704 = calm;
            foam_1 = (_e702 * (1f - _e704));
            let _e707 = river_3;
            if _e707 {
                let _e708 = nF_1;
                let _e709 = fn_;
                let _e713 = fn_;
                let _e714 = upF_7;
                nF_1 = normalize(mix(_e708, _e709, vec3(smoothstep(0.13f, 0.3f, (1f - dot(_e713, _e714))))));
            }
            let _e721 = river_3;
            let _e722 = global.uLiquid2_;
            if (_e721 && (_e722.y > 0.9f)) {
                let _e727 = albedo;
                let _e734 = fv_2;
                albedo = mix(_e727, vec3<f32>(0.055f, 0.045f, 0.025f), vec3(clamp((0.25f + (0.3f * _e734)), 0f, 0.75f)));
            }
            let _e742 = global.uToFixed;
            let _e744 = nF_1;
            Nw = normalize((transpose(_e742) * _e744));
            let _e748 = Nw;
            let _e749 = V_2;
            let _e752 = Nw;
            let _e753 = V_2;
            Nw = normalize((_e748 + (_e749 * max(0f, (0.02f - dot(_e752, _e753))))));
            let _e760 = Nw;
            let _e761 = V_2;
            NdV = max(dot(_e760, _e761), 0.001f);
            let _e766 = Nw;
            let _e767 = global.uSunDir;
            ndlW = max(dot(_e766, _e767), 0f);
            let _e772 = global.uLiquid;
            F0_ = _e772.x;
            let _e775 = F0_;
            let _e777 = wr;
            let _e779 = F0_;
            let _e781 = F0_;
            let _e784 = NdV;
            F = (_e775 + ((max((1f - _e777), _e779) - _e781) * pow((1f - _e784), 5f)));
            let _e791 = V_2;
            let _e793 = Nw;
            R_3 = reflect(-(_e791), _e793);
            let _e796 = R_3;
            let _e797 = up_4;
            el = max(dot(_e796, _e797), 0f);
            let _e805 = el;
            let _e814 = el;
            let _e819 = cloudT;
            skyG = mix((0.7f + (1.1f * pow((1f - _e805), 3f))), (0.4286f * (1f + (2f * _e814))), clamp((1f - _e819), 0f, 1f));
            let _e826 = global.uSunE;
            let _e827 = skyE_1;
            let _e832 = skyG;
            let _e834 = global.uSunE;
            let _e835 = sunT;
            let _e839 = R_3;
            let _e840 = global.uSunDir;
            skyRefl = ((((_e826 * _e827) / vec3(3.1415927f)) * _e832) + (((_e834 * _e835) * 0.05f) * pow(max(dot(_e839, _e840), 0f), 12f)));
            let _e849 = global.uMoonE;
            if (_e849.y > 0f) {
                {
                    let _e853 = up_4;
                    let _e854 = global.uMoonDir;
                    muMr = dot(_e853, _e854);
                    let _e857 = skyRefl;
                    let _e858 = global.uMoonE;
                    let _e859 = r_10;
                    let _e860 = muMr;
                    let _e861 = atmoSkyIrradiance(_e859, _e860);
                    let _e866 = skyG;
                    let _e868 = global.uMoonE;
                    let _e869 = r_10;
                    let _e870 = muMr;
                    let _e873 = atmoSunTransmittance(_e869, max(_e870, 0f));
                    let _e877 = R_3;
                    let _e878 = global.uMoonDir;
                    skyRefl = (_e857 + ((((_e858 * _e861) / vec3(3.1415927f)) * _e866) + (((_e868 * _e873) * 0.05f) * pow(max(dot(_e877, _e878), 0f), 12f))));
                }
            }
            let _e887 = albedo;
            let _e891 = global.uSunE;
            let _e892 = sunT;
            let _e894 = muS_2;
            let _e900 = global.uSunE;
            let _e901 = skyE_1;
            body = ((_e887 / vec3(3.1415927f)) * ((((_e891 * _e892) * max(_e894, 0f)) * 0.6f) + ((_e900 * _e901) * 0.5f)));
            let _e908 = river_3;
            let _e909 = global.uLiquid2_;
            if (_e908 && (_e909.y > 0.9f)) {
                {
                    let _e915 = fv_2;
                    let _e917 = fv_2;
                    let _e919 = fv_2;
                    ssc = clamp((((30f * _e915) * _e917) * _e919), 0.5f, 3000f);
                    let _e925 = global.uLiquid3_;
                    let _e927 = ssc;
                    let _e934 = global.uLiquid3_;
                    a_10 = ((_e925.xyz + (_e927 * vec3<f32>(0.012f, 0.02f, 0.035f))) + (_e934.w * vec3<f32>(0.078f, 0.207f, 0.687f)));
                    let _e946 = ssc;
                    bb = vec3((0.00475f * _e946));
                    let _e951 = bb;
                    let _e953 = a_10;
                    let _e954 = bb;
                    let _e960 = global.uSunE;
                    let _e961 = sunT;
                    let _e963 = muS_2;
                    let _e967 = global.uSunE;
                    let _e968 = skyE_1;
                    body = ((((0.33f * _e951) / (_e953 + _e954)) / vec3(3.1415927f)) * (((_e960 * _e961) * max(_e963, 0f)) + (_e967 * _e968)));
                }
            }
            let _e972 = V_2;
            let _e973 = global.uSunDir;
            H_1 = normalize((_e972 + _e973));
            let _e977 = wr;
            let _e978 = wr;
            let _e980 = wr;
            let _e982 = wr;
            a2_ = (((_e977 * _e978) * _e980) * _e982);
            let _e985 = a2_;
            a2s = max(_e985, 0.0000001f);
            let _e989 = Nw;
            let _e990 = H_1;
            NdH = max(dot(_e989, _e990), 0f);
            let _e995 = V_2;
            let _e996 = H_1;
            VdH = max(dot(_e995, _e996), 0f);
            let _e1001 = a2s;
            let _e1002 = NdH;
            let _e1003 = NdH;
            let _e1005 = a2s;
            Dg = (_e1001 / (PI * pow((((_e1002 * _e1003) * (_e1005 - 1f)) + 1f), 2f)));
            let _e1016 = wr;
            let _e1019 = wr;
            kg = (((_e1016 + 1f) * (_e1019 + 1f)) / 8f);
            let _e1026 = NdV;
            let _e1027 = NdV;
            let _e1029 = kg;
            let _e1032 = kg;
            let _e1035 = ndlW;
            let _e1037 = ndlW;
            let _e1039 = kg;
            let _e1042 = kg;
            Gg = (((_e1026 / ((_e1027 * (1f - _e1029)) + _e1032)) * _e1035) / ((_e1037 * (1f - _e1039)) + _e1042));
            let _e1046 = F0_;
            let _e1048 = F0_;
            let _e1051 = VdH;
            Fs = (_e1046 + ((1f - _e1048) * pow((1f - _e1051), 5f)));
            let _e1058 = body;
            let _e1060 = F;
            let _e1063 = skyRefl;
            let _e1064 = F;
            let _e1067 = global.uSunE;
            let _e1068 = sunT;
            let _e1070 = Dg;
            let _e1072 = Gg;
            let _e1074 = Fs;
            let _e1077 = NdV;
            let _e1082 = muS_2;
            color = (((_e1058 * (1f - _e1060)) + (_e1063 * _e1064)) + ((((((_e1067 * _e1068) * _e1070) * _e1072) * _e1074) / vec3((4f * _e1077))) * step(0f, _e1082)));
            let _e1086 = global.uMoonE;
            if (_e1086.y > 0f) {
                {
                    let _e1090 = up_4;
                    let _e1091 = global.uMoonDir;
                    muMn = dot(_e1090, _e1091);
                    let _e1094 = muMn;
                    if (_e1094 > -0.02f) {
                        {
                            let _e1098 = V_2;
                            let _e1099 = global.uMoonDir;
                            Hm = normalize((_e1098 + _e1099));
                            let _e1103 = Nw;
                            let _e1104 = Hm;
                            NdHm = max(dot(_e1103, _e1104), 0f);
                            let _e1109 = V_2;
                            let _e1110 = Hm;
                            VdHm = max(dot(_e1109, _e1110), 0f);
                            let _e1115 = Nw;
                            let _e1116 = global.uMoonDir;
                            ndlM = max(dot(_e1115, _e1116), 0f);
                            let _e1121 = a2s;
                            let _e1122 = NdHm;
                            let _e1123 = NdHm;
                            let _e1125 = a2s;
                            Dm = (_e1121 / (PI * pow((((_e1122 * _e1123) * (_e1125 - 1f)) + 1f), 2f)));
                            let _e1136 = NdV;
                            let _e1137 = NdV;
                            let _e1139 = kg;
                            let _e1142 = kg;
                            let _e1145 = ndlM;
                            let _e1147 = ndlM;
                            let _e1149 = kg;
                            let _e1152 = kg;
                            Gm = (((_e1136 / ((_e1137 * (1f - _e1139)) + _e1142)) * _e1145) / ((_e1147 * (1f - _e1149)) + _e1152));
                            let _e1156 = F0_;
                            let _e1158 = F0_;
                            let _e1161 = VdHm;
                            Fm = (_e1156 + ((1f - _e1158) * pow((1f - _e1161), 5f)));
                            let _e1168 = color;
                            let _e1169 = global.uMoonE;
                            let _e1170 = r_10;
                            let _e1171 = muMn;
                            let _e1174 = atmoSunTransmittance(_e1170, max(_e1171, 0f));
                            let _e1176 = cloudDirZ;
                            let _e1178 = Dm;
                            let _e1180 = Gm;
                            let _e1182 = Fm;
                            let _e1185 = NdV;
                            color = (_e1168 + ((((((_e1169 * _e1174) * _e1176) * _e1178) * _e1180) * _e1182) / vec3((4f * _e1185))));
                        }
                    }
                }
            }
            let _e1190 = global.uSunE;
            let _e1191 = sunT;
            let _e1193 = up_4;
            let _e1194 = global.uSunDir;
            let _e1199 = global.uSunE;
            let _e1200 = skyE_1;
            lit_1 = (((_e1190 * _e1191) * max(dot(_e1193, _e1194), 0f)) + (_e1199 * _e1200));
            let _e1204 = river_3;
            if _e1204 {
                let _e1208 = fn_;
                let _e1209 = upF_7;
                local_75 = smoothstep(0.13f, 0.3f, (1f - dot(_e1208, _e1209)));
            } else {
                local_75 = 0f;
            }
            let _e1215 = local_75;
            fallK = _e1215;
            let _e1219 = fallK;
            if (_e1219 > 0f) {
                {
                    let _e1222 = upF_7;
                    let _e1223 = fn_;
                    let _e1224 = upF_7;
                    let _e1225 = fn_;
                    dn_4 = (_e1222 - (_e1223 * dot(_e1224, _e1225)));
                    let _e1230 = dn_4;
                    let _e1232 = dn_4;
                    down = (-(_e1230) / vec3(max(length(_e1232), 0.0001f)));
                    let _e1239 = fn_;
                    let _e1240 = down;
                    acr = normalize(cross(_e1239, _e1240));
                    let _e1244 = global.uFallTop;
                    if (_e1244 > 0f) {
                        let _e1247 = global.uFallTop;
                        let _e1248 = r_10;
                        local_76 = max((_e1247 - _e1248), 0f);
                    } else {
                        local_76 = 4f;
                    }
                    let _e1254 = local_76;
                    zf = _e1254;
                    let _e1257 = global.uFall1_;
                    let _e1260 = zf;
                    let _e1265 = global.uFall1_;
                    v_1 = min((sqrt(((2f * _e1257.x) * _e1260)) + 0.3f), _e1265.y);
                    let _e1269 = global.uTime;
                    t1_ = fract((_e1269 * 0.4f));
                    let _e1274 = global.uTime;
                    t2_ = fract(((_e1274 * 0.4f) + 0.5f));
                    let _e1283 = t1_;
                    wa_2 = (1f - abs(((2f * _e1283) - 1f)));
                    let _e1292 = v_1;
                    L_7 = (1f + (0.12f * _e1292));
                    let _e1296 = vFixedPos_1;
                    let _e1297 = global.uOriginMod;
                    let _e1299 = global.uFallTop;
                    if (_e1299 > 0f) {
                        let _e1302 = global.uFallFoot;
                        local_77 = _e1302;
                    } else {
                        local_77 = vec3(0f);
                    }
                    let _e1306 = local_77;
                    pS = ((_e1296 - _e1297) - _e1306);
                    let _e1309 = pS;
                    let _e1310 = acr;
                    let _e1314 = pS;
                    let _e1315 = down;
                    let _e1318 = L_7;
                    q_6 = vec2<f32>((dot(_e1309, _e1310) / 4.8f), (dot(_e1314, _e1315) / (48f * _e1318)));
                    let _e1323 = v_1;
                    let _e1327 = L_7;
                    dv_1 = ((_e1323 * 2.5f) / (48f * _e1327));
                    let _e1331 = q_6;
                    let _e1333 = dv_1;
                    let _e1334 = t1_;
                    qA = (_e1331 - vec2<f32>(0f, (_e1333 * _e1334)));
                    let _e1339 = q_6;
                    let _e1345 = dv_1;
                    let _e1346 = t2_;
                    qB = ((_e1339 + vec2<f32>(0.37f, 0f)) - vec2<f32>(0f, (_e1345 * _e1346)));
                    let _e1351 = qA;
                    let _e1353 = textureSampleLevel(tDetailTexture, tDetailSampler, _e1351, 0f);
                    bA = _e1353.x;
                    let _e1356 = qB;
                    let _e1358 = textureSampleLevel(tDetailTexture, tDetailSampler, _e1356, 0f);
                    bB = _e1358.x;
                    let _e1361 = bA;
                    let _e1363 = q_6;
                    let _e1374 = dv_1;
                    let _e1376 = t1_;
                    let _e1381 = textureSampleLevel(tDetailTexture, tDetailSampler, (((_e1363 * vec2<f32>(3f, 2f)) + vec2<f32>(0.53f, 0f)) - vec2<f32>(0f, ((2f * _e1374) * _e1376))), 0f);
                    sA = (_e1361 + (0.45f * _e1381.x));
                    let _e1386 = bB;
                    let _e1388 = q_6;
                    let _e1399 = dv_1;
                    let _e1401 = t2_;
                    let _e1406 = textureSampleLevel(tDetailTexture, tDetailSampler, (((_e1388 * vec2<f32>(3f, 2f)) + vec2<f32>(0.11f, 0f)) - vec2<f32>(0f, ((2f * _e1399) * _e1401))), 0f);
                    sB = (_e1386 + (0.45f * _e1406.x));
                    let _e1412 = sB;
                    let _e1413 = sA;
                    let _e1414 = wa_2;
                    st_2 = clamp((0.5f + ((mix(_e1412, _e1413, _e1414) - 0.725f) * 2.2f)), 0f, 1f);
                    let _e1425 = qB;
                    let _e1431 = textureSampleLevel(tDetailTexture, tDetailSampler, (_e1425 + vec2<f32>(0.031f, 0f)), 0f);
                    let _e1433 = bB;
                    let _e1435 = qA;
                    let _e1441 = textureSampleLevel(tDetailTexture, tDetailSampler, (_e1435 + vec2<f32>(0.031f, 0f)), 0f);
                    let _e1443 = bA;
                    let _e1445 = wa_2;
                    gS = (mix((_e1431.x - _e1433), (_e1441.x - _e1443), _e1445) / 0.15f);
                    let _e1452 = vFlw_1;
                    qU = max((_e1452.w * 9f), 0.3f);
                    let _e1459 = zf;
                    let _e1461 = qU;
                    br = clamp((_e1459 / (6f * pow(_e1461, 0.32f))), 0f, 1f);
                    let _e1472 = global.uFall2_;
                    let _e1477 = zf;
                    aer = (mix(0.25f, 0.95f, _e1472.y) * smoothstep(0f, 0.5f, _e1477));
                    let _e1483 = br;
                    th_2 = mix(0.72f, 0.22f, _e1483);
                    let _e1486 = th_2;
                    let _e1489 = th_2;
                    let _e1492 = st_2;
                    let _e1494 = edge;
                    jets = smoothstep((_e1486 - 0.14f), (_e1489 + 0.14f), (_e1492 + (0.75f * (_e1494 - 1f))));
                    let _e1501 = aer;
                    let _e1502 = jets;
                    white = clamp((_e1501 * _e1502), 0f, 1f);
                    let _e1508 = white;
                    dbgWhite = _e1508;
                    let _e1509 = Nw;
                    let _e1510 = global.uToFixed;
                    let _e1512 = acr;
                    let _e1514 = gS;
                    nS = normalize((_e1509 + ((transpose(_e1510) * _e1512) * clamp((_e1514 * 1.6f), -0.9f, 0.9f))));
                    let _e1525 = global.uSunE;
                    let _e1526 = sunT;
                    let _e1528 = nS;
                    let _e1529 = global.uSunDir;
                    let _e1534 = global.uSunE;
                    let _e1535 = skyE_1;
                    litS = (((_e1525 * _e1526) * max(dot(_e1528, _e1529), 0f)) + ((_e1534 * _e1535) * 0.6f));
                    let _e1545 = st_2;
                    albS = mix(0.5f, 0.92f, smoothstep(0.15f, 0.85f, _e1545));
                    let _e1549 = color;
                    let _e1550 = color;
                    let _e1553 = albS;
                    let _e1558 = litS;
                    let _e1560 = white;
                    let _e1563 = fallK;
                    color = mix(_e1549, mix((_e1550 * 0.8f), ((vec3(_e1553) / vec3(3.1415927f)) * _e1558), vec3(_e1560)), vec3(_e1563));
                    let _e1566 = foam_1;
                    let _e1568 = fallK;
                    foam_1 = (_e1566 * (1f - _e1568));
                }
            }
            let _e1571 = global.uFallTop;
            if (_e1571 > 0f) {
                {
                    let _e1574 = vFixedPos_1;
                    let _e1575 = global.uOriginMod;
                    let _e1577 = global.uFallFoot;
                    Lf = ((_e1574 - _e1575) - _e1577);
                    let _e1581 = global.uFallAcr;
                    let _e1582 = global.uFallAcr;
                    hasA = step(0.5f, dot(_e1581, _e1582));
                    let _e1586 = Lf;
                    let _e1587 = global.uFallAcr;
                    let _e1591 = global.uFallW;
                    let _e1594 = global.uFallW;
                    let _e1597 = hasA;
                    al_2 = (clamp(dot(_e1586, _e1587), (-0.5f * _e1591), (0.5f * _e1594)) * _e1597);
                    let _e1600 = Lf;
                    let _e1601 = global.uFallAcr;
                    let _e1602 = al_2;
                    let _e1606 = global.uFallW;
                    let _e1615 = global.uFallW;
                    let _e1618 = hasA;
                    dF = (length((_e1600 - (_e1601 * _e1602))) / mix(max(((_e1606 * 1.2f) + 2f), 2f), (3f + (0.15f * _e1615)), _e1618));
                    let _e1622 = vFlw_1;
                    flL = length(_e1622.xyz);
                    let _e1626 = flL;
                    if (_e1626 > 0.0001f) {
                        let _e1629 = vFlw_1;
                        let _e1631 = flL;
                        local_78 = (_e1629.xyz / vec3(_e1631));
                    } else {
                        let _e1634 = upF_7;
                        local_78 = normalize((cross(_e1634, vec3<f32>(0f, 0f, 1f)) + vec3<f32>(0.0001f, 0f, 0f)));
                    }
                    let _e1647 = local_78;
                    fd_1 = _e1647;
                    let _e1649 = upF_7;
                    let _e1650 = fd_1;
                    fa_1 = normalize(cross(_e1649, _e1650));
                    let _e1654 = Lf;
                    let _e1655 = fa_1;
                    let _e1657 = Lf;
                    let _e1658 = fd_1;
                    let _e1660 = global.uTime;
                    let _e1661 = flL;
                    q2_ = (vec2<f32>(dot(_e1654, _e1655), (dot(_e1657, _e1658) - (_e1660 * max((_e1661 * 9f), 0.4f)))) * 0.18f);
                    let _e1672 = q2_;
                    let _e1674 = textureSampleLevel(tDetailTexture, tDetailSampler, _e1672, 0f);
                    let _e1678 = q2_;
                    let _e1685 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e1678 * 2.7f) + vec2(0.31f)), 0f);
                    fz = ((_e1674.x * 0.65f) + (_e1685.w * 0.35f));
                    let _e1694 = dF;
                    core = (1f - smoothstep(0.05f, 0.45f, _e1694));
                    let _e1701 = dF;
                    ring_1 = (1f - smoothstep(0.2f, 1f, _e1701));
                    let _e1705 = core;
                    let _e1708 = ring_1;
                    let _e1711 = ring_1;
                    let _e1715 = fz;
                    fm = max((_e1705 * 0.9f), (_e1708 * smoothstep((0.55f - (0.3f * _e1711)), 0.8f, _e1715)));
                    let _e1720 = foam_1;
                    let _e1721 = fm;
                    let _e1724 = global.uFall2_;
                    let _e1729 = fallK;
                    foam_1 = max(_e1720, ((_e1721 * mix(0.35f, 0.95f, _e1724.y)) * (1f - _e1729)));
                }
            }
            let _e1733 = color;
            let _e1744 = lit_1;
            let _e1746 = foam_1;
            color = mix(_e1733, (vec3<f32>(0.23873241f, 0.23873241f, 0.23873241f) * _e1744), vec3(clamp(_e1746, 0f, 1f)));
            let _e1752 = ice_8;
            if (_e1752 > 0f) {
                {
                    let _e1755 = nW;
                    dI = _e1755;
                    let _e1757 = nG;
                    dJ = _e1757;
                    let _e1759 = kind_4;
                    if (_e1759 < 0.2f) {
                        {
                            let _e1764 = lead_1;
                            let _e1768 = fl;
                            lIce = (smoothstep(0.3f, 1.5f, _e1764.x) * (1f - _e1768.x));
                            let _e1776 = lead_1;
                            let _e1795 = lead_1;
                            lAlb = mix((vec3((0.07f + (0.33f * (1f - exp((-(_e1776.x) / 10f)))))) * vec3<f32>(0.92f, 0.97f, 1f)), vec3<f32>(0.82f, 0.86f, 0.9f), vec3(_e1795.y));
                            let _e1800 = color;
                            let _e1801 = lAlb;
                            let _e1805 = global.uSunE;
                            let _e1806 = sunT;
                            let _e1808 = muS_2;
                            let _e1812 = global.uSunE;
                            let _e1813 = skyE_1;
                            let _e1817 = lIce;
                            color = mix(_e1800, ((_e1801 / vec3(3.1415927f)) * (((_e1805 * _e1806) * max(_e1808, 0f)) + (_e1812 * _e1813))), vec3(_e1817));
                            let _e1820 = albedo;
                            let _e1821 = lAlb;
                            let _e1822 = lIce;
                            albedo = mix(_e1820, _e1821, vec3(_e1822));
                        }
                    }
                    let _e1825 = fl;
                    ice_8 = _e1825.x;
                    let _e1827 = global.uSeason;
                    if (_e1827.z > 0.5f) {
                        let _e1834 = Tair_2;
                        local_79 = smoothstep(-1f, 2f, _e1834);
                    } else {
                        local_79 = 0f;
                    }
                    let _e1838 = local_79;
                    thaw = _e1838;
                    let _e1842 = fl;
                    let _e1844 = dJ;
                    let _e1854 = fl;
                    let _e1857 = fl;
                    let _e1866 = thaw;
                    snowy = ((smoothstep(0.3f, 0.7f, (_e1842.z + ((_e1844.w - 0.5f) * 0.25f))) * (1f - ((0.7f * _e1854.y) / max(_e1857.x, 0.001f)))) * (1f - (0.7f * _e1866)));
                    let _e1879 = snowy;
                    let _e1884 = dI;
                    iceAlb = (mix(vec3<f32>(0.42f, 0.52f, 0.6f), vec3<f32>(0.82f, 0.86f, 0.9f), vec3(_e1879)) * (0.9f + (0.2f * _e1884.x)));
                    let _e1890 = global.uSeason;
                    if (_e1890.z > 0.5f) {
                        let _e1894 = Tair_2;
                        let _e1895 = dJ;
                        let _e1899 = fp_6;
                        let _e1900 = w_8;
                        let _e1902 = tri(_e1899, _e1900, 8f);
                        let _e1907 = meltPond(_e1894, ((_e1895.x * 0.6f) + (_e1902.x * 0.4f)));
                        let _e1911 = ridge_2;
                        local_80 = (_e1907 * (1f - smoothstep(0f, 0.2f, _e1911.w)));
                    } else {
                        local_80 = 0f;
                    }
                    let _e1918 = local_80;
                    pond_1 = _e1918;
                    let _e1920 = iceAlb;
                    let _e1925 = pond_1;
                    iceAlb = mix(_e1920, vec3<f32>(0.12f, 0.32f, 0.45f), vec3(_e1925));
                    let _e1928 = up_4;
                    let _e1929 = N_3;
                    N2_ = normalize(mix(_e1928, _e1929, vec3(0.5f)));
                    let _e1935 = ridge_2;
                    if (_e1935.w > 0f) {
                        {
                            let _e1939 = fp_6;
                            let _e1940 = w_8;
                            let _e1942 = tri(_e1939, _e1940, 2f);
                            blk = _e1942.x;
                            let _e1945 = iceAlb;
                            let _e1956 = blk;
                            let _e1962 = ridge_2;
                            iceAlb = mix(_e1945, mix(vec3<f32>(0.5f, 0.62f, 0.7f), vec3<f32>(0.85f, 0.88f, 0.92f), vec3(smoothstep(0.35f, 0.6f, _e1956))), vec3(smoothstep(0f, 0.2f, _e1962.w)));
                            let _e1967 = N2_;
                            let _e1968 = global.uToFixed;
                            let _e1970 = ridge_2;
                            let _e1977 = ridge_2;
                            N2_ = normalize((_e1967 + (((transpose(_e1968) * _e1970.xyz) * 0.5f) * smoothstep(0f, 0.1f, _e1977.w))));
                        }
                    }
                    let _e1983 = iceAlb;
                    let _e1987 = global.uSunE;
                    let _e1988 = sunT;
                    let _e1990 = N2_;
                    let _e1991 = global.uSunDir;
                    let _e1996 = global.uSunE;
                    let _e1997 = skyE_1;
                    let _e2001 = N2_;
                    let _e2002 = up_4;
                    iceCol = ((_e1983 / vec3(3.1415927f)) * (((_e1987 * _e1988) * max(dot(_e1990, _e1991), 0f)) + ((_e1996 * _e1997) * (0.5f + (0.5f * dot(_e2001, _e2002))))));
                    let _e2010 = N2_;
                    let _e2011 = H_1;
                    NdH2_ = max(dot(_e2010, _e2011), 0f);
                    let _e2016 = iceCol;
                    let _e2017 = global.uSunE;
                    let _e2018 = sunT;
                    let _e2020 = NdH2_;
                    let _e2023 = snowy;
                    let _e2030 = muS_2;
                    iceCol = (_e2016 + ((((_e2017 * _e2018) * pow(_e2020, mix(400f, 40f, _e2023))) * 0.04f) * step(0f, _e2030)));
                    let _e2034 = iceCol;
                    let _e2035 = global.uSunE;
                    let _e2036 = sunT;
                    let _e2038 = up_4;
                    let _e2039 = N2_;
                    let _e2044 = H_1;
                    let _e2053 = pond_1;
                    let _e2056 = muS_2;
                    iceCol = (_e2034 + (((((_e2035 * _e2036) * pow(max(dot(normalize(mix(_e2038, _e2039, vec3(0.2f))), _e2044), 0f), 600f)) * 0.4f) * _e2053) * step(0f, _e2056)));
                    let _e2060 = color;
                    let _e2061 = iceCol;
                    let _e2062 = ice_8;
                    color = mix(_e2060, _e2061, vec3(_e2062));
                    let _e2065 = albedo;
                    let _e2066 = iceAlb;
                    let _e2067 = ice_8;
                    albedo = mix(_e2065, _e2066, vec3(_e2067));
                }
            }
            let _e2070 = fallK;
            if (_e2070 > 0f) {
                {
                    let _e2074 = tsf;
                    let _e2078 = tsf;
                    let _e2082 = tsf;
                    iceF = (1f - smoothstep((_e2074.y - 12f), (_e2078.y - 4f), _e2082.x));
                    let _e2087 = iceF;
                    if (_e2087 > 0f) {
                        {
                            let _e2090 = upF_7;
                            let _e2091 = fn_;
                            let _e2092 = upF_7;
                            let _e2093 = fn_;
                            dnI = (_e2090 - (_e2091 * dot(_e2092, _e2093)));
                            let _e2098 = dnI;
                            let _e2100 = dnI;
                            downI = (-(_e2098) / vec3(max(length(_e2100), 0.0001f)));
                            let _e2107 = fn_;
                            let _e2108 = downI;
                            acrI = normalize(cross(_e2107, _e2108));
                            let _e2112 = vFixedPos_1;
                            let _e2113 = global.uOriginMod;
                            let _e2115 = global.uFallTop;
                            if (_e2115 > 0f) {
                                let _e2118 = global.uFallFoot;
                                local_81 = _e2118;
                            } else {
                                local_81 = vec3(0f);
                            }
                            let _e2122 = local_81;
                            pI = ((_e2112 - _e2113) - _e2122);
                            let _e2125 = pI;
                            let _e2126 = acrI;
                            let _e2128 = pI;
                            let _e2129 = downI;
                            qi = vec2<f32>(dot(_e2125, _e2126), dot(_e2128, _e2129));
                            let _e2133 = qi;
                            let _e2137 = qi;
                            qa_1 = vec2<f32>((_e2133.x * 0.2f), (_e2137.y * 0.015f));
                            let _e2143 = qi;
                            let _e2149 = qi;
                            qb_1 = vec2<f32>(((_e2143.x * 0.6f) + 0.3f), (_e2149.y * 0.04f));
                            let _e2155 = qa_1;
                            let _e2157 = textureSampleLevel(tDetailTexture, tDetailSampler, _e2155, 0f);
                            let _e2161 = qb_1;
                            let _e2163 = textureSampleLevel(tDetailTexture, tDetailSampler, _e2161, 0f);
                            cols = ((_e2157.x * 0.6f) + (_e2163.w * 0.4f));
                            let _e2169 = qa_1;
                            let _e2175 = textureSampleLevel(tDetailTexture, tDetailSampler, (_e2169 + vec2<f32>(0.01f, 0f)), 0f);
                            let _e2179 = qb_1;
                            let _e2185 = textureSampleLevel(tDetailTexture, tDetailSampler, (_e2179 + vec2<f32>(0.03f, 0f)), 0f);
                            colsX = ((_e2175.x * 0.6f) + (_e2185.w * 0.4f));
                            let _e2193 = cols;
                            thick = smoothstep(0.35f, 0.7f, _e2193);
                            let _e2204 = thick;
                            alb = mix(vec3<f32>(0.2f, 0.4f, 0.56f), vec3<f32>(0.88f, 0.93f, 0.97f), vec3(_e2204));
                            let _e2208 = Nw;
                            let _e2209 = global.uToFixed;
                            let _e2211 = acrI;
                            let _e2213 = colsX;
                            let _e2214 = cols;
                            nI = normalize((_e2208 - (((transpose(_e2209) * _e2211) * (_e2213 - _e2214)) * 30f)));
                            let _e2222 = global.uSunE;
                            let _e2223 = sunT;
                            let _e2225 = nI;
                            let _e2226 = global.uSunDir;
                            let _e2231 = global.uSunE;
                            let _e2232 = skyE_1;
                            litI = (((_e2222 * _e2223) * max(dot(_e2225, _e2226), 0f)) + ((_e2231 * _e2232) * 0.7f));
                            let _e2238 = nI;
                            let _e2239 = V_2;
                            let _e2240 = global.uSunDir;
                            spI = (pow(max(dot(_e2238, normalize((_e2239 + _e2240))), 0f), 60f) * 0.6f);
                            let _e2251 = color;
                            let _e2252 = alb;
                            let _e2256 = litI;
                            let _e2258 = global.uSunE;
                            let _e2259 = sunT;
                            let _e2261 = spI;
                            let _e2264 = muS_2;
                            let _e2268 = fallK;
                            let _e2269 = iceF;
                            color = mix(_e2251, (((_e2252 / vec3(3.1415927f)) * _e2256) + (((_e2258 * _e2259) * _e2261) * step(0f, _e2264))), vec3((_e2268 * _e2269)));
                        }
                    }
                }
            }
            let _e2273 = global.uDebug;
            if (_e2273 > 6.5f) {
                let _e2276 = fallK;
                let _e2277 = dbgWhite;
                let _e2278 = river_3;
                if _e2278 {
                    local_82 = 1f;
                } else {
                    local_82 = 0f;
                }
                let _e2282 = local_82;
                local_87 = vec3<f32>(_e2276, _e2277, _e2282);
            } else {
                let _e2284 = global.uDebug;
                if (_e2284 < 2.5f) {
                    let _e2287 = ice_8;
                    local_86 = vec3(_e2287);
                } else {
                    let _e2289 = global.uDebug;
                    if (_e2289 < 3.5f) {
                        let _e2292 = Tm_2;
                        local_85 = vec3((_e2292 / 40f));
                    } else {
                        let _e2296 = global.uDebug;
                        if (_e2296 < 4.5f) {
                            let _e2299 = foam_1;
                            local_84 = vec3(_e2299);
                        } else {
                            let _e2301 = global.uDebug;
                            if (_e2301 < 5.5f) {
                                let _e2304 = vLiq_1;
                                local_83 = _e2304.xyz;
                            } else {
                                let _e2306 = wr;
                                local_83 = vec3((_e2306 * 4f));
                            }
                            let _e2311 = local_83;
                            local_84 = _e2311;
                        }
                        let _e2313 = local_84;
                        local_85 = _e2313;
                    }
                    let _e2315 = local_85;
                    local_86 = _e2315;
                }
                let _e2317 = local_86;
                local_87 = _e2317;
            }
            let _e2319 = local_87;
            dbgW = _e2319;
        }
    }
    let _e2320 = global.uThermal;
    if (_e2320.x > 0f) {
        {
            let _e2324 = albedo;
            a_11 = clamp(_e2324, vec3(0f), vec3(1f));
            let _e2331 = color;
            let _e2334 = a_11;
            let _e2336 = global.uThermal;
            let _e2338 = global.uThermal;
            let _e2340 = r_10;
            let _e2341 = global.uRadius;
            let _e2345 = blackbodyGlow((_e2336.x - (_e2338.y * (_e2340 - _e2341))));
            color = (_e2331 + ((vec3(1f) - _e2334) * _e2345));
            let _e2348 = color;
            let _e2349 = a_11;
            let _e2352 = r_10;
            let _e2354 = atmoSunTransmittance(_e2352, 1f);
            let _e2357 = global.uThermal;
            let _e2359 = global.uThermal;
            let _e2361 = r_10;
            let _e2362 = global.uRadius;
            let _e2368 = blackbodyGlow((_e2357.x - (_e2359.z * max((_e2361 - _e2362), 0f))));
            color = (_e2348 + ((_e2349 * (vec3(1f) - _e2354)) * _e2368));
        }
    }
    let _e2371 = emissive;
    if (_e2371 > 0.01f) {
        {
            let _e2376 = global.uTime;
            let _e2379 = vFixedPos_1;
            let _e2384 = vFixedPos_1;
            flick = (0.85f + (0.15f * sin((((_e2376 * 1.7f) + (_e2379.x * 0.05f)) + (_e2384.z * 0.07f)))));
            let _e2395 = fp_6;
            let _e2396 = w_8;
            let _e2398 = tri(_e2395, _e2396, 128f);
            crust = smoothstep(0.35f, 0.65f, _e2398.w);
            let _e2402 = color;
            let _e2403 = global.uLavaColor;
            let _e2404 = emissive;
            let _e2406 = flick;
            let _e2410 = crust;
            let _e2412 = emissive;
            color = (_e2402 + (((_e2403 * _e2404) * _e2406) * mix(1f, 0.15f, (_e2410 * (1f - (_e2412 * 0.5f))))));
        }
    }
    let _e2420 = global.uDebug;
    if (_e2420 > 1.5f) {
        let _e2423 = dbgW;
        if (_e2423.x < 0f) {
            let _e2431 = waterEnc;
            local_88 = ((vec3<f32>(0.5f, 0f, 0.5f) * _e2431) * 50f);
        } else {
            let _e2435 = dbgW;
            local_88 = _e2435;
        }
        let _e2437 = local_88;
        let _e2438 = global.uDebug;
        if (_e2438 > 7.5f) {
            local_89 = 0.02f;
        } else {
            local_89 = 1f;
        }
        let _e2444 = local_89;
        color = (_e2437 * _e2444);
    } else {
        let _e2446 = global.uDebug;
        if (_e2446 > 0.5f) {
            let _e2449 = color;
            let _e2450 = vMorphK_1;
            let _e2452 = vMorphK_1;
            color = mix(_e2449, (vec3<f32>(_e2450, (1f - _e2452), 0f) * 0.2f), vec3(0.5f));
        }
    }
    let _e2461 = color;
    fragmentColor = vec4<f32>(_e2461.x, _e2461.y, _e2461.z, 1f);
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
    let _e251 = fragmentColor;
    return FragmentOutput(_e251);
}
`;
