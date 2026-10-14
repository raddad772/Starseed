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
      "name": "uSunShadow",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 752
    },
    {
      "name": "uSunShadowVP0",
      "type": "mat4",
      "count": 0,
      "align": 16,
      "size": 64,
      "stride": 64,
      "offset": 768
    },
    {
      "name": "uSunShadowVP1",
      "type": "mat4",
      "count": 0,
      "align": 16,
      "size": 64,
      "stride": 64,
      "offset": 832
    },
    {
      "name": "uSunShadowL0",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 896
    },
    {
      "name": "uSunShadowL1",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 912
    },
    {
      "name": "uSunShadowDir",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 928
    },
    {
      "name": "uMoonDir",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 944
    },
    {
      "name": "uMoonE",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 960
    },
    {
      "name": "uLiquid",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 976
    },
    {
      "name": "uLiquid2",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 992
    },
    {
      "name": "uLiquid3",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 1008
    },
    {
      "name": "uWaveK",
      "type": "vec4",
      "count": 36,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 1024
    },
    {
      "name": "uZMode",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 1600
    },
    {
      "name": "uZNear",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 1604
    },
    {
      "name": "uZFar",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 1608
    },
    {
      "name": "uZLogFC",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 1612
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
  "bytes": 1616,
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
    let _e165 = global.uSunLift;
    hD = (1.5707963f + _e165.x);
    let _e170 = global.uSunLift;
    hT = (1.5707963f + _e170.y);
    let _e174 = zd_1;
    let _e175 = hD;
    if (_e174 <= _e175) {
        let _e177 = zd_1;
        let _e178 = hT;
        let _e180 = hD;
        local = ((_e177 * _e178) / _e180);
    } else {
        let _e182 = hT;
        let _e183 = zd_1;
        let _e184 = hD;
        let _e187 = hT;
        let _e191 = hD;
        local = (_e182 + (((_e183 - _e184) * (3.1415927f - _e187)) / (3.1415927f - _e191)));
    }
    let _e196 = local;
    return _e196;
}

fn liftMu(mu: f32) -> f32 {
    var mu_1: f32;

    mu_1 = mu;
    let _e164 = global.uSunLift;
    let _e166 = global.uSunLift;
    if (_e164.x <= _e166.y) {
        let _e169 = mu_1;
        return _e169;
    }
    let _e170 = mu_1;
    let _e176 = lensTrueZ(acos(clamp(_e170, -1f, 1f)));
    return cos(_e176);
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
    let _e167 = global.uTop;
    let _e168 = global.uTop;
    let _e170 = global.uBottom;
    let _e171 = global.uBottom;
    H = sqrt(max(0f, ((_e167 * _e168) - (_e170 * _e171))));
    let _e178 = r_1;
    let _e179 = r_1;
    let _e181 = global.uBottom;
    let _e182 = global.uBottom;
    rho = sqrt(max(0f, ((_e178 * _e179) - (_e181 * _e182))));
    let _e188 = r_1;
    let _e189 = r_1;
    let _e191 = mu_3;
    let _e192 = mu_3;
    let _e197 = global.uTop;
    let _e198 = global.uTop;
    disc = (((_e188 * _e189) * ((_e191 * _e192) - 1f)) + (_e197 * _e198));
    let _e203 = r_1;
    let _e205 = mu_3;
    let _e207 = disc;
    d = max(0f, ((-(_e203) * _e205) + sqrt(max(_e207, 0f))));
    let _e214 = global.uTop;
    let _e215 = r_1;
    dMin = (_e214 - _e215);
    let _e218 = rho;
    let _e219 = H;
    dMax = (_e218 + _e219);
    let _e222 = d;
    let _e223 = dMin;
    let _e225 = dMax;
    let _e226 = dMin;
    let _e231 = rho;
    let _e232 = H;
    return vec2<f32>(((_e222 - _e223) / max((_e225 - _e226), 0.000001f)), (_e231 / max(_e232, 0.000001f)));
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
    let _e166 = mu_5;
    let _e167 = liftMu(_e166);
    mu_5 = _e167;
    let _e168 = global.uGround;
    let _e169 = global.uTrueK;
    Rg = (_e168 * max(_e169, 1f));
    let _e174 = Rg;
    let _e175 = Rg;
    let _e176 = r_3;
    let _e177 = global.uGround;
    sinH = (_e174 / (_e175 + max((_e176 - _e177), 0f)));
    let _e186 = sinH;
    let _e187 = sinH;
    cosH = -(sqrt(max(0f, (1f - (_e186 * _e187)))));
    let _e194 = cosH;
    let _e197 = cosH;
    let _e200 = mu_5;
    vis = smoothstep((_e194 - 0.01f), (_e197 + 0.01f), _e200);
    let _e203 = global.uHasAtmo;
    if (_e203 < 0.5f) {
        let _e206 = vis;
        return vec3(_e206);
    }
    let _e208 = r_3;
    let _e209 = global.uBottom;
    let _e210 = global.uTop;
    let _e212 = mu_5;
    let _e213 = transmittanceUV(clamp(_e208, _e209, _e210), _e212);
    uv = _e213;
    let _e222 = uv;
    uv = (vec2<f32>(0.001953125f, 0.0078125f) + (_e222 * vec2<f32>(0.99609375f, 0.984375f)));
    let _e232 = uv;
    let _e234 = textureSampleLevel(tTransTexture, tTransSampler, _e232, 0f);
    let _e236 = vis;
    return (_e234.xyz * _e236);
}

fn atmoSkyIrradiance(r_4: f32, mu_6: f32) -> vec3<f32> {
    var r_5: f32;
    var mu_7: f32;
    var uv_1: vec2<f32>;

    r_5 = r_4;
    mu_7 = mu_6;
    let _e166 = global.uHasAtmo;
    if (_e166 < 0.5f) {
        return vec3(0f);
    }
    let _e171 = mu_7;
    let _e172 = liftMu(_e171);
    mu_7 = _e172;
    let _e173 = mu_7;
    let _e178 = r_5;
    let _e179 = global.uGround;
    let _e181 = global.uTop;
    let _e182 = global.uGround;
    uv_1 = vec2<f32>(((_e173 * 0.5f) + 0.5f), clamp(((_e178 - _e179) / (_e181 - _e182)), 0f, 1f));
    let _e197 = uv_1;
    uv_1 = (vec2<f32>(0.0078125f, 0.03125f) + (_e197 * vec2<f32>(0.984375f, 0.9375f)));
    let _e207 = uv_1;
    let _e209 = textureSampleLevel(tIrrTexture, tIrrSampler, _e207, 0f);
    return _e209.xyz;
}

fn seasonYear(dirF: vec3<f32>) -> vec3<f32> {
    var dirF_1: vec3<f32>;
    var m: vec4<f32>;

    dirF_1 = dirF;
    let _e165 = dirF_1;
    let _e167 = dirF_1;
    let _e174 = dirF_1;
    let _e187 = textureSampleLevel(tSeasonMapTexture, tSeasonMapSampler, vec2<f32>(((atan2(_e165.z, _e167.x) / 6.28319f) + 0.5f), ((asin(clamp(_e174.y, -1f, 1f)) / 3.14159f) + 0.5f)), 0f);
    m = _e187;
    let _e189 = m;
    let _e195 = m;
    let _e201 = m;
    let _e203 = m;
    return vec3<f32>(((_e189.x - 0.5f) * 100f), ((_e195.y - 0.5f) * 100f), ((_e201.z * _e203.z) * 600f));
}

fn seasonIceNow(dirF_2: vec3<f32>) -> f32 {
    var dirF_3: vec3<f32>;
    var m_1: vec4<f32>;

    dirF_3 = dirF_2;
    let _e165 = dirF_3;
    let _e167 = dirF_3;
    let _e174 = dirF_3;
    let _e187 = textureSampleLevel(tSeasonIceTexture, tSeasonIceSampler, vec2<f32>(((atan2(_e165.z, _e167.x) / 6.28319f) + 0.5f), ((asin(clamp(_e174.y, -1f, 1f)) / 3.14159f) + 0.5f)), 0f);
    m_1 = _e187;
    let _e189 = m_1;
    let _e195 = m_1;
    let _e201 = global.uSeason;
    let _e206 = m_1;
    let _e212 = global.uSeason;
    return ((((_e189.z - 0.5f) * 100f) + (((_e195.x - 0.5f) * 100f) * cos(_e201.x))) + (((_e206.y - 0.5f) * 100f) * sin(_e212.x)));
}

fn seaIceAt(m_2: vec3<f32>, Tf: f32) -> f32 {
    var m_3: vec3<f32>;
    var Tf_1: f32;
    var u: vec3<f32>;
    var t: vec4<f32>;
    var Ts: f32;

    m_3 = m_2;
    Tf_1 = Tf;
    let _e167 = m_3;
    u = normalize(_e167);
    let _e170 = u;
    let _e172 = u;
    let _e179 = u;
    let _e192 = textureSampleLevel(tSeasonMapTexture, tSeasonMapSampler, vec2<f32>(((atan2(_e170.z, _e172.x) / 6.28319f) + 0.5f), ((asin(clamp(_e179.y, -1f, 1f)) / 3.14159f) + 0.5f)), 0f);
    t = _e192;
    let _e194 = t;
    let _e200 = t;
    let _e206 = global.uSeason;
    let _e211 = t;
    let _e217 = global.uSeason;
    Ts = ((((_e194.w * 120f) - 60f) + (((_e200.x - 0.5f) * 100f) * cos(_e206.x))) + (((_e211.y - 0.5f) * 100f) * sin(_e217.x)));
    let _e224 = Tf_1;
    let _e227 = Tf_1;
    let _e230 = Ts;
    return (1f - smoothstep((_e224 - 4f), (_e227 + 4f), _e230));
}

fn meltPond(Tair: f32, n: f32) -> f32 {
    var Tair_1: f32;
    var n_1: f32;
    var f: f32;
    var local_1: f32;

    Tair_1 = Tair;
    n_1 = n;
    let _e171 = Tair_1;
    f = (0.45f * smoothstep(-0.5f, 4f, _e171));
    let _e175 = f;
    if (_e175 > 0f) {
        let _e179 = f;
        let _e182 = f;
        let _e185 = n_1;
        local_1 = (1f - smoothstep((_e179 - 0.06f), (_e182 + 0.06f), _e185));
    } else {
        local_1 = 0f;
    }
    let _e190 = local_1;
    return _e190;
}

fn cloudN(n_2: f32) -> f32 {
    var n_3: f32;

    n_3 = n_2;
    let _e168 = n_3;
    return (0.55f + ((_e168 - 0.682f) * 4.3f));
}

fn cloudBias(cover: f32) -> f32 {
    var cover_1: f32;

    cover_1 = cover;
    let _e167 = cover_1;
    let _e175 = cover_1;
    let _e183 = cover_1;
    return ((((_e167 - 0.5f) * 0.3f) + (0.5f * smoothstep(0.8f, 1f, _e175))) - (0.5f * (1f - smoothstep(0f, 0.2f, _e183))));
}

fn cloudFade(foot: f32, L: f32) -> f32 {
    var foot_1: f32;
    var L_1: f32;

    foot_1 = foot;
    L_1 = L;
    let _e171 = foot_1;
    let _e174 = L_1;
    return smoothstep(1f, 4f, ((_e171 * 64f) / _e174));
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
    let _e168 = textureDimensions(tCloudMapTexture, 0i);
    sz = vec2<f32>(vec2<i32>(_e168));
    let _e172 = uv_3;
    let _e173 = sz;
    st = ((_e172 * _e173) - vec2(0.5f));
    let _e179 = st;
    i = floor(_e179);
    let _e182 = st;
    let _e183 = i;
    f_1 = (_e182 - _e183);
    let _e186 = f_1;
    let _e187 = f_1;
    f2_ = (_e186 * _e187);
    let _e190 = f2_;
    let _e191 = f_1;
    f3_ = (_e190 * _e191);
    let _e196 = f_1;
    let _e201 = f2_;
    let _e204 = f3_;
    w0_ = ((((vec2(1f) - (3f * _e196)) + (3f * _e201)) - _e204) / vec2(6f));
    let _e212 = f2_;
    let _e217 = f3_;
    w1_ = (((vec2(4f) - (6f * _e212)) + (3f * _e217)) / vec2(6f));
    let _e226 = f_1;
    let _e231 = f2_;
    let _e235 = f3_;
    w2_ = ((((vec2(1f) + (3f * _e226)) + (3f * _e231)) - (3f * _e235)) / vec2(6f));
    let _e242 = f3_;
    w3_ = (_e242 / vec2(6f));
    let _e247 = w0_;
    let _e248 = w1_;
    g0_ = (_e247 + _e248);
    let _e251 = w2_;
    let _e252 = w3_;
    g1_ = (_e251 + _e252);
    let _e255 = i;
    let _e259 = w1_;
    let _e260 = g0_;
    let _e263 = sz;
    h0_ = (((_e255 - vec2(0.5f)) + (_e259 / _e260)) / _e263);
    let _e266 = i;
    let _e270 = w3_;
    let _e271 = g1_;
    let _e274 = sz;
    h1_ = (((_e266 + vec2(1.5f)) + (_e270 / _e271)) / _e274);
    let _e277 = g0_;
    let _e279 = g0_;
    let _e281 = h0_;
    let _e283 = textureSampleLevel(tCloudMapTexture, tCloudMapSampler, _e281, 0f);
    let _e286 = g1_;
    let _e288 = h1_;
    let _e290 = h0_;
    let _e294 = textureSampleLevel(tCloudMapTexture, tCloudMapSampler, vec2<f32>(_e288.x, _e290.y), 0f);
    let _e299 = g1_;
    let _e301 = g0_;
    let _e303 = h0_;
    let _e305 = h1_;
    let _e309 = textureSampleLevel(tCloudMapTexture, tCloudMapSampler, vec2<f32>(_e303.x, _e305.y), 0f);
    let _e312 = g1_;
    let _e314 = h1_;
    let _e316 = textureSampleLevel(tCloudMapTexture, tCloudMapSampler, _e314, 0f);
    return ((_e277.y * ((_e279.x * _e283.xyz) + (_e286.x * _e294.xyz))) + (_e299.y * ((_e301.x * _e309.xyz) + (_e312.x * _e316.xyz))));
}

fn cloudClimate(dirF_4: vec3<f32>) -> f32 {
    var dirF_5: vec3<f32>;
    var lat: f32;
    var cm: vec3<f32>;

    dirF_5 = dirF_4;
    let _e167 = dirF_5;
    lat = asin(clamp(_e167.y, -1f, 1f));
    let _e175 = global.uCloudMapMean;
    if (_e175 <= 0f) {
        let _e179 = lat;
        return (0.12f * cos((abs(_e179) * 6f)));
    }
    let _e185 = dirF_5;
    let _e187 = dirF_5;
    let _e194 = lat;
    let _e200 = cloudMapSmooth(vec2<f32>(((atan2(_e185.z, _e187.x) / 6.2832f) + 0.5f), ((_e194 / 3.14159f) + 0.5f)));
    cm = _e200;
    let _e202 = cm;
    let _e204 = cm;
    let _e208 = global.uCloudYear;
    let _e212 = cm;
    let _e216 = global.uCloudYear;
    let _e220 = global.uCloudMapMean;
    return ((((_e202.x + ((_e204.y - 0.5f) * _e208.x)) + ((_e212.z - 0.5f) * _e216.y)) - _e220) * 0.8f);
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
    let _e173 = global.uRadius;
    L0_ = (_e173 * 1f);
    let _e177 = global.uRadius;
    L1_ = (_e177 * 0.236f);
    let _e181 = foot_3;
    let _e182 = L0_;
    let _e183 = cloudFade(_e181, _e182);
    f0_ = _e183;
    let _e185 = foot_3;
    let _e186 = L1_;
    let _e187 = cloudFade(_e185, _e186);
    f1_ = _e187;
    let _e189 = q_1;
    qz = (_e189 * vec3<f32>(0.5f, 1f, 0.5f));
    let _e196 = f0_;
    if (_e196 > 0.999f) {
        local_2 = 0.682f;
    } else {
        let _e200 = qz;
        let _e201 = L0_;
        let _e205 = textureSampleLevel(tNoiseTexture, tNoiseSampler, (_e200 / vec3(_e201)), 0f);
        let _e208 = f0_;
        local_2 = mix(_e205.x, 0.682f, _e208);
    }
    let _e211 = local_2;
    a = _e211;
    let _e213 = f1_;
    if (_e213 > 0.999f) {
        local_3 = 0.682f;
    } else {
        let _e217 = qz;
        let _e218 = L1_;
        let _e225 = textureSampleLevel(tNoiseTexture, tNoiseSampler, ((_e217 / vec3(_e218)) + vec3(0.5f)), 0f);
        let _e228 = f1_;
        local_3 = mix(_e225.x, 0.682f, _e228);
    }
    let _e231 = local_3;
    b = _e231;
    let _e234 = f0_;
    let _e237 = f1_;
    spread = length(vec2<f32>((0.124f * _e234), (0.083f * _e237)));
    let _e243 = bias_1;
    let _e245 = spread;
    let _e248 = bias_1;
    let _e250 = spread;
    let _e252 = a;
    let _e255 = b;
    let _e259 = cloudN(((_e252 * 0.6f) + (_e255 * 0.4f)));
    let _e260 = clim_1;
    return smoothstep(((0.6f - _e243) - _e245), ((0.8f - _e248) + _e250), (_e259 + _e260));
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
    let _e169 = global.uCloudClock;
    T = _e169.z;
    let _e172 = T;
    if (_e172 <= 0f) {
        {
            (*gA) = vec3<f32>(1f, 0f, 0f);
            (*gB) = vec3(0f);
            return;
        }
    }
    let _e182 = dirF_7;
    let _e186 = dirF_7;
    let _e191 = dirF_7;
    let _e197 = dirF_7;
    let _e201 = dirF_7;
    let _e206 = dirF_7;
    ph = ((((1.1f * _e182.x) + (0.7f * _e186.z)) - (0.5f * _e191.y)) + (0.35f * sin((((2.3f * _e197.y) + (1.7f * _e201.x)) - (0.9f * _e206.z)))));
    let _e214 = global.uCloudClock;
    let _e216 = T;
    let _e218 = ph;
    s = (((_e214.x / _e216) + _e218) + 4f);
    let _e223 = s;
    a_1 = floor(_e223);
    let _e226 = s;
    let _e227 = a_1;
    fa = (_e226 - _e227);
    let _e230 = s;
    b_1 = floor((_e230 + 0.5f));
    let _e235 = s;
    let _e238 = b_1;
    fb = ((_e235 + 0.5f) - _e238);
    let _e242 = dirF_7;
    let _e252 = dirF_7;
    let _e264 = dirF_7;
    j = (0.065f * ((sin((dot(_e242, vec3<f32>(5.1f, 3.7f, -4.3f)) + 1.3f)) + sin((dot(_e252, vec3<f32>(-3.9f, 7.3f, 6.1f)) + 0.4f))) + (0.6f * sin((dot(_e264, vec3<f32>(11.3f, -8.9f, 7.7f)) + 2.1f)))));
    let _e278 = s;
    let _e279 = j;
    fj = fract((_e278 + _e279));
    let _e287 = fj;
    wa = smoothstep(0.4f, 0.6f, (1f - abs(((2f * _e287) - 1f))));
    let _e295 = wa;
    let _e296 = fa;
    let _e299 = T;
    let _e302 = global.uCloudClock;
    let _e304 = a_1;
    (*gA) = vec3<f32>(_e295, ((_e296 - 0.5f) * _e299), (2f * (_e302.y + _e304)));
    let _e309 = wa;
    let _e311 = fb;
    let _e314 = T;
    let _e317 = global.uCloudClock;
    let _e319 = b_1;
    (*gB) = vec3<f32>((1f - _e309), ((_e311 - 0.5f) * _e314), ((2f * (_e317.y + _e319)) + 1f));
    return;
}

fn cloudGenOff(idx: f32) -> vec3<f32> {
    var idx_1: f32;
    var h: u32;

    idx_1 = idx;
    let _e167 = idx_1;
    h = (u32(_e167) * 2654435761u);
    let _e172 = h;
    let _e173 = h;
    h = (_e172 ^ (_e173 >> 15u));
    let _e177 = h;
    h = (_e177 * 2246822519u);
    let _e180 = h;
    let _e181 = h;
    h = (_e180 ^ (_e181 >> 13u));
    let _e185 = h;
    let _e189 = h;
    let _e195 = h;
    return (((vec3<f32>(f32((_e185 & 1023u)), f32(((_e189 >> 10u) & 1023u)), f32(((_e195 >> 20u) & 1023u))) / vec3(1024f)) - vec3(0.5f)) * 400000f);
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
    let _e171 = dirF_9;
    lat_1 = asin(clamp(_e171.y, -1f, 1f));
    let _e179 = global.uCloudWind;
    let _e181 = lat_1;
    let _e182 = global.uCloudWind;
    let _e187 = global.uCloudWind;
    let _e193 = global.uCloudWind;
    let _e195 = lat_1;
    let _e197 = lat_1;
    U = (_e179.x * (sin((((_e181 * _e182.y) * 2f) + (_e187.z * 6.2832f))) + (_e193.w * exp(((-(_e195) * _e197) * 40f)))));
    let _e206 = dirF_9;
    let _e210 = dirF_9;
    east = normalize((vec3<f32>(-(_e206.z), 0f, _e210.x) + vec3<f32>(0.000001f, 0f, 0f)));
    let _e220 = pf_1;
    let _e221 = east;
    let _e222 = U;
    let _e224 = g_1;
    let _e228 = g_1;
    let _e230 = cloudGenOff(_e228.z);
    return ((_e220 + ((_e221 * _e222) * _e224.y)) + _e230);
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
    let _e175 = dirF_11;
    cloudGens(_e175, (&gA_1), (&gB_1));
    let _e182 = dirF_11;
    let _e183 = cloudClimate(_e182);
    clim_2 = _e183;
    let _e185 = gA_1;
    if (_e185.x > 0.005f) {
        let _e189 = c;
        let _e190 = gA_1;
        let _e192 = pf_3;
        let _e193 = dirF_11;
        let _e194 = gA_1;
        let _e195 = cloudAdvect(_e192, _e193, _e194);
        let _e196 = foot_5;
        let _e197 = bias_3;
        let _e198 = clim_2;
        let _e199 = cloudCoverC(_e195, _e196, _e197, _e198);
        c = (_e189 + (_e190.x * _e199));
    }
    let _e202 = gB_1;
    if (_e202.x > 0.005f) {
        let _e206 = c;
        let _e207 = gB_1;
        let _e209 = pf_3;
        let _e210 = dirF_11;
        let _e211 = gB_1;
        let _e212 = cloudAdvect(_e209, _e210, _e211);
        let _e213 = foot_5;
        let _e214 = bias_3;
        let _e215 = clim_2;
        let _e216 = cloudCoverC(_e212, _e213, _e214, _e215);
        c = (_e206 + (_e207.x * _e216));
    }
    let _e219 = c;
    return _e219;
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
    let _e167 = global.uRing;
    if (_e167.z < 0.5f) {
        return 1f;
    }
    let _e172 = global.uToFixed;
    let _e173 = rel_1;
    pF = (_e172 * _e173);
    let _e176 = global.uToFixed;
    let _e177 = global.uSunDir;
    sF = (_e176 * _e177);
    let _e180 = pF;
    let _e182 = sF;
    let _e187 = sF;
    if (((_e180.y * _e182.y) >= 0f) || (abs(_e187.y) < 0.0001f)) {
        return 1f;
    }
    let _e194 = pF;
    let _e195 = sF;
    let _e196 = pF;
    let _e198 = sF;
    q_2 = (_e194 - (_e195 * (_e196.y / _e198.y)));
    let _e204 = q_2;
    let _e207 = global.uRing;
    let _e210 = global.uRing;
    let _e212 = global.uRing;
    x = ((length(_e204.xz) - _e207.x) / (_e210.y - _e212.x));
    let _e217 = x;
    let _e220 = x;
    if ((_e217 <= 0f) || (_e220 >= 1f)) {
        return 1f;
    }
    let _e225 = x;
    f_2 = clamp(((_e225 * 32f) - 0.5f), 0f, 31f);
    let _e234 = f_2;
    i_1 = i32(floor(_e234));
    let _e238 = i_1;
    j_1 = min((_e238 + 1i), 31i);
    let _e244 = i_1;
    let _e246 = i_1;
    let _e251 = i_1;
    let _e256 = global.uRingTau[(_e251 / 4i)][(_e244 - (4i * (_e246 / 4i)))];
    let _e257 = j_1;
    let _e259 = j_1;
    let _e264 = j_1;
    let _e269 = global.uRingTau[(_e264 / 4i)][(_e257 - (4i * (_e259 / 4i)))];
    let _e270 = f_2;
    let _e271 = f_2;
    tau = mix(_e256, _e269, (_e270 - floor(_e271)));
    let _e276 = tau;
    let _e278 = sF;
    return exp((-(_e276) / abs(_e278.y)));
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
    let _e180 = rel_3;
    let _e181 = ringShadow(_e180);
    ring = _e181;
    let _e183 = global.uCloudOn;
    if (_e183 < 0.5f) {
        let _e186 = muS_1;
        if (_e186 > -0.05f) {
            let _e190 = ring;
            local_4 = _e190;
        } else {
            local_4 = 1f;
        }
        let _e193 = local_4;
        return _e193;
    }
    let _e194 = muS_1;
    mu_8 = max(_e194, 0.05f);
    let _e212 = global.uCSOn;
    if (_e212 > 0.5f) {
        {
            let _e215 = global.uToFixed;
            let _e216 = rel_3;
            pf_4 = (_e215 * _e216);
            let _e219 = pf_4;
            let _e220 = r_7;
            upF = (_e219 / vec3(_e220));
            let _e224 = global.uToFixed;
            let _e225 = global.uSunDir;
            sF_1 = (_e224 * _e225);
            let _e228 = pf_4;
            let _e229 = global.uCSOrigin;
            let _e231 = sF_1;
            let _e232 = upF;
            let _e233 = sF_1;
            let _e234 = upF;
            let _e238 = r_7;
            let _e239 = global.uRadius;
            let _e242 = sF_1;
            let _e243 = upF;
            d_1 = ((_e228 - _e229) - (((_e231 - (_e232 * dot(_e233, _e234))) * (_e238 - _e239)) / vec3(max(dot(_e242, _e243), 0.1f))));
            let _e251 = d_1;
            let _e252 = global.uCSE;
            let _e254 = d_1;
            let _e255 = global.uCSN;
            let _e258 = global.uCSInvL;
            uv_4 = ((vec2<f32>(dot(_e251, _e252), dot(_e254, _e255)) * _e258) + vec2(0.5f));
            let _e266 = uv_4;
            let _e269 = uv_4;
            let _e273 = uv_4;
            let _e276 = uv_4;
            w = smoothstep(0f, 0.08f, min(min(_e266.x, (1f - _e269.x)), min(_e273.y, (1f - _e276.y))));
            let _e282 = w;
            if (_e282 > 0f) {
                {
                    let _e285 = uv_4;
                    let _e287 = textureSampleLevel(tCloudShadowTexture, tCloudShadowSampler, _e285, 0f);
                    m0_ = _e287;
                    let _e288 = uv_4;
                    let _e289 = global.uCSLod;
                    let _e290 = textureSampleLevel(tCloudShadowTexture, tCloudShadowSampler, _e288, _e289);
                    m1_ = _e290;
                }
            }
        }
    }
    let _e291 = global.uCloud;
    let _e293 = r_7;
    let _e294 = global.uRadius;
    hc = (_e291.x - (_e293 - _e294));
    let _e298 = hc;
    let _e301 = w;
    if ((_e298 > 0f) && (_e301 < 1f)) {
        {
            let _e305 = global.uToFixed;
            let _e306 = rel_3;
            let _e307 = global.uSunDir;
            let _e308 = hc;
            let _e310 = muS_1;
            ds = normalize((_e305 * normalize((_e306 + ((_e307 * _e308) / vec3(max(_e310, 0.08f)))))));
            let _e320 = muS_1;
            if (_e320 > -0.05f) {
                let _e324 = ds;
                let _e325 = global.uRadius;
                let _e327 = ds;
                let _e328 = foot_7;
                let _e329 = global.uCloud;
                let _e331 = cloudBias(_e329.z);
                let _e332 = cloudCoverG((_e324 * _e325), _e327, _e328, _e331);
                let _e333 = global.uCloudOpacity;
                local_5 = (_e332 * _e333);
            } else {
                local_5 = 0f;
            }
            let _e337 = local_5;
            cs = _e337;
            let _e339 = global.uToFixed;
            let _e340 = rel_3;
            dz = normalize((_e339 * _e340));
            let _e344 = dz;
            let _e345 = global.uRadius;
            let _e347 = dz;
            let _e348 = foot_7;
            let _e350 = hc;
            let _e353 = global.uCloud;
            let _e355 = cloudBias(_e353.z);
            let _e356 = cloudCoverG((_e344 * _e345), _e347, max(_e348, (3.5f * _e350)), _e355);
            let _e357 = global.uCloudOpacity;
            cz = (_e356 * _e357);
            let _e361 = cs;
            let _e363 = cs;
            let _e364 = global.uCloudTau;
            let _e366 = mu_8;
            Tdir = ((1f - _e361) + (_e363 * exp((-(_e364) / _e366))));
            let _e372 = cz;
            let _e374 = cz;
            let _e377 = global.uCloudTau;
            Ttot = ((1f - _e372) + (_e374 / (1f + (0.1125f * _e377))));
            let _e383 = cz;
            let _e385 = cz;
            let _e386 = global.uCloudTau;
            let _e388 = mu_8;
            Dup = ((1f - _e383) + (_e385 * exp((-(_e386) / _e388))));
        }
    }
    let _e393 = Tdir;
    let _e394 = m0_;
    let _e396 = w;
    Tdir = mix(_e393, _e394.x, _e396);
    let _e398 = Ttot;
    let _e399 = m1_;
    let _e401 = w;
    Ttot = mix(_e398, _e399.y, _e401);
    let _e403 = Dup;
    let _e404 = m1_;
    let _e406 = w;
    Dup = mix(_e403, _e404.z, _e406);
    let _e408 = Dup;
    cloudDirZ = _e408;
    let _e409 = Ttot;
    cloudTotZ = _e409;
    let _e410 = (*skyE);
    let _e411 = Ttot;
    let _e413 = sunAbove_1;
    let _e414 = muS_1;
    let _e418 = Ttot;
    let _e419 = Dup;
    (*skyE) = ((_e410 * _e411) + ((_e413 * max(_e414, 0f)) * max((_e418 - _e419), 0f)));
    let _e425 = muS_1;
    if (_e425 > -0.05f) {
        let _e429 = Tdir;
        let _e430 = ring;
        local_6 = (_e429 * _e430);
    } else {
        local_6 = 1f;
    }
    let _e434 = local_6;
    return _e434;
}

fn blackbodyGlow(T_1: f32) -> vec3<f32> {
    var T_2: f32;
    var g_2: f32;

    T_2 = T_1;
    let _e169 = T_2;
    if (_e169 < 650f) {
        return vec3(0f);
    }
    let _e177 = T_2;
    g_2 = max(0f, (0.0287f + (0.000237f * (_e177 - 1000f))));
    let _e185 = g_2;
    let _e191 = T_2;
    let _e197 = g_2;
    return (vec3<f32>(1f, _e185, 0f) * ((600000f * exp((-24060f / _e191))) / (0.2126f + (0.7152f * _e197))));
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
    let _e172 = d_3;
    a_2 = abs(_e172);
    let _e175 = a_2;
    let _e177 = a_2;
    let _e180 = a_2;
    let _e182 = a_2;
    if ((_e175.x >= _e177.y) && (_e180.x >= _e182.z)) {
        let _e186 = d_3;
        if (_e186.x >= 0f) {
            local_7 = 0i;
        } else {
            local_7 = 1i;
        }
        let _e193 = local_7;
        local_11 = _e193;
    } else {
        let _e194 = a_2;
        let _e196 = a_2;
        if (_e194.y >= _e196.z) {
            let _e199 = d_3;
            if (_e199.y >= 0f) {
                local_8 = 2i;
            } else {
                local_8 = 3i;
            }
            let _e206 = local_8;
            local_10 = _e206;
        } else {
            let _e207 = d_3;
            if (_e207.z >= 0f) {
                local_9 = 4i;
            } else {
                local_9 = 5i;
            }
            let _e214 = local_9;
            local_10 = _e214;
        }
        let _e216 = local_10;
        local_11 = _e216;
    }
    let _e218 = local_11;
    f_3 = _e218;
    let _e220 = d_3;
    let _e221 = f_3;
    let _e225 = local_12[_e221];
    dn = dot(_e220, _e225);
    let _e228 = d_3;
    let _e229 = f_3;
    let _e233 = local_13[_e229];
    let _e235 = dn;
    let _e238 = d_3;
    let _e239 = f_3;
    let _e243 = local_14[_e239];
    let _e245 = dn;
    uv_5 = (((vec2<f32>(atan((dot(_e228, _e233) / _e235)), atan((dot(_e238, _e243) / _e245))) / vec2(0.785398f)) * 0.5f) + vec2(0.5f));
    let _e258 = uv_5;
    let _e259 = f_3;
    let _e263 = vec3<f32>(_e258.x, _e258.y, f32(_e259));
    let _e268 = textureSampleLevel(tHeightCubeTexture, tHeightCubeSampler, _e263.xy, i32(_e263.z), 0f);
    return _e268.x;
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
    let _e178 = global.uHeightCube;
    let _e182 = up_1;
    let _e183 = sF_3;
    if ((_e178.x < 0.5f) || (dot(_e182, _e183) < -0.2f)) {
        return 1f;
    }
    let _e190 = global.uHeightCube;
    texel = _e190.w;
    let _e193 = R_1;
    let _e194 = global.uHeightCube;
    top = (_e193 + _e194.z);
    let _e198 = pF_2;
    r0_ = length(_e198);
    let _e202 = R_1;
    let _e203 = up_1;
    let _e204 = heightCubeAt(_e203);
    let _e206 = r0_;
    below = max(0f, ((_e202 + _e204) - _e206));
    let _e210 = pF_2;
    let _e211 = up_1;
    let _e212 = texel;
    o = (_e210 + ((_e211 * _e212) * 0.1f));
    let _e218 = texel;
    t_1 = _e218;
    loop {
        let _e224 = i_2;
        if !((_e224 < 28i)) {
            break;
        }
        {
            let _e231 = o;
            let _e232 = sF_3;
            let _e233 = t_1;
            qp = (_e231 + (_e232 * _e233));
            let _e237 = qp;
            rq = length(_e237);
            let _e240 = rq;
            let _e241 = top;
            if (_e240 > _e241) {
                break;
            }
            let _e243 = rq;
            let _e244 = R_1;
            let _e245 = qp;
            let _e246 = rq;
            let _e249 = heightCubeAt((_e245 / vec3(_e246)));
            let _e252 = below;
            let _e253 = t_1;
            let _e256 = texel;
            d_4 = ((_e243 - (_e244 + _e249)) + (_e252 * exp((-(_e253) / (3f * _e256)))));
            let _e263 = sh;
            let _e264 = d_4;
            let _e265 = t_1;
            sh = min(_e263, clamp(((_e264 / (_e265 * 0.035f)) + 0.5f), 0f, 1f));
            let _e275 = sh;
            if (_e275 <= 0f) {
                break;
            }
            let _e278 = t_1;
            t_1 = (_e278 * 1.35f);
        }
        continuing {
            let _e228 = i_2;
            i_2 = (_e228 + 1i);
        }
    }
    let _e281 = sh;
    return _e281;
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
    let _e182 = VP_1;
    let _e183 = wp_1;
    c_1 = (_e182 * vec4<f32>(_e183.x, _e183.y, _e183.z, 1f));
    let _e191 = c_1;
    let _e193 = c_1;
    uv_6 = (((_e191.xy / vec2(_e193.w)) * 0.5f) + vec2(0.5f));
    let _e203 = uv_6;
    let _e208 = uv_6;
    if (any((_e203 < vec2(0f))) || any((_e208 > vec2(1f)))) {
        return 1f;
    }
    let _e215 = L_3;
    let _e217 = wp_1;
    let _e219 = global.uSunShadowDir;
    let _e221 = bias_5;
    d_5 = (dot((_e215.xyz - _e217), _e219) - _e221);
    let _e224 = n_5;
    sz_1 = vec2(_e224);
    let _e227 = uv_6;
    let _e228 = sz_1;
    st_1 = ((_e227 * vec2<f32>(_e228)) - vec2(0.5f));
    let _e235 = st_1;
    fr = fract(_e235);
    let _e238 = st_1;
    p0_ = vec2<i32>(floor(_e238));
    loop {
        let _e245 = j_2;
        if !((_e245 < 4i)) {
            break;
        }
        i_3 = 0i;
        loop {
            let _e254 = i_3;
            if !((_e254 < 4i)) {
                break;
            }
            let _e261 = j_2;
            let _e264 = i_3;
            let _e267 = d_5;
            let _e268 = org_1;
            let _e269 = p0_;
            let _e270 = i_3;
            let _e273 = j_2;
            let _e280 = sz_1;
            let _e287 = textureLoad(tShadowAtlasTexture, (_e268 + clamp((_e269 + vec2<i32>((_e270 - 1i), (_e273 - 1i))), vec2(0i), (_e280 - vec2(1i)))), 0i);
            if (_e267 <= _e287.x) {
                local_15 = 1f;
            } else {
                local_15 = 0f;
            }
            let _e293 = local_15;
            cmp[((_e261 * 4i) + _e264)] = _e293;
            continuing {
                let _e258 = i_3;
                i_3 = (_e258 + 1i);
            }
        }
        continuing {
            let _e249 = j_2;
            j_2 = (_e249 + 1i);
        }
    }
    loop {
        let _e298 = j_3;
        if !((_e298 < 3i)) {
            break;
        }
        i_4 = 0i;
        loop {
            let _e307 = i_4;
            if !((_e307 < 3i)) {
                break;
            }
            let _e314 = lit;
            let _e315 = j_3;
            let _e318 = i_4;
            let _e321 = cmp[((_e315 * 4i) + _e318)];
            let _e322 = j_3;
            let _e325 = i_4;
            let _e330 = cmp[(((_e322 * 4i) + _e325) + 1i)];
            let _e331 = fr;
            let _e334 = j_3;
            let _e337 = i_4;
            let _e342 = cmp[(((_e334 * 4i) + _e337) + 4i)];
            let _e343 = j_3;
            let _e346 = i_4;
            let _e351 = cmp[(((_e343 * 4i) + _e346) + 5i)];
            let _e352 = fr;
            let _e355 = fr;
            lit = (_e314 + mix(mix(_e321, _e330, _e331.x), mix(_e342, _e351, _e352.x), _e355.y));
            continuing {
                let _e311 = i_4;
                i_4 = (_e311 + 1i);
            }
        }
        continuing {
            let _e302 = j_3;
            j_3 = (_e302 + 1i);
        }
    }
    let _e359 = lit;
    return (_e359 / 9f);
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
    let _e174 = global.uSunShadow;
    if (_e174.x < 0.5f) {
        return 1f;
    }
    let _e179 = wp_3;
    dist = length(_e179);
    let _e182 = dist;
    let _e183 = global.uSunShadow;
    if (_e182 > _e183.z) {
        return 1f;
    }
    let _e187 = N_1;
    let _e188 = global.uSunShadowDir;
    ndl = max(dot(_e187, _e188), 0.05f);
    let _e194 = ndl;
    let _e195 = ndl;
    let _e199 = ndl;
    slope = (sqrt((1f - (_e194 * _e195))) / _e199);
    let _e206 = global.uSunShadowVP1_;
    let _e207 = global.uSunShadowL1_;
    let _e208 = wp_3;
    let _e209 = global.uSunShadowL1_;
    let _e212 = slope;
    let _e217 = sunShadowTap(vec2<i32>(2048i, 0i), 2048i, _e206, _e207, _e208, (_e209.w * (1.5f + min(_e212, 6f))));
    s1_ = _e217;
    let _e219 = s1_;
    let _e222 = global.uSunShadow;
    let _e225 = global.uSunShadow;
    let _e227 = dist;
    sh_1 = mix(_e219, 1f, smoothstep((0.85f * _e222.z), _e225.z, _e227));
    let _e231 = dist;
    let _e232 = global.uSunShadow;
    if (_e231 < _e232.y) {
        {
            let _e239 = global.uSunShadowVP0_;
            let _e240 = global.uSunShadowL0_;
            let _e241 = wp_3;
            let _e242 = global.uSunShadowL0_;
            let _e245 = slope;
            let _e250 = sunShadowTap(vec2<i32>(0i, 0i), 2048i, _e239, _e240, _e241, (_e242.w * (1.5f + min(_e245, 6f))));
            s0_ = _e250;
            let _e252 = s0_;
            let _e253 = sh_1;
            let _e255 = global.uSunShadow;
            let _e258 = global.uSunShadow;
            let _e260 = dist;
            sh_1 = mix(_e252, _e253, smoothstep((0.75f * _e255.y), _e258.y, _e260));
        }
    }
    let _e263 = sh_1;
    return _e263;
}

fn windSense(upF_1: vec3<f32>) -> f32 {
    var upF_2: vec3<f32>;
    var al: f32;

    upF_2 = upF_1;
    let _e172 = upF_2;
    al = abs(asin(clamp(_e172.y, -1f, 1f)));
    let _e186 = al;
    let _e193 = al;
    return ((-1f + (2f * smoothstep(0.49f, 0.55f, _e186))) - (2f * smoothstep(1.02f, 1.08f, _e193)));
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
        let _e198 = i_5;
        if !((_e198 < 36i)) {
            break;
        }
        {
            let _e205 = i_5;
            let _e207 = global.uWaveK[_e205];
            K = _e207;
            let _e209 = K;
            kk = length(_e209.xyz);
            let _e214 = kk;
            lam = (6.2832f / _e214);
            let _e218 = lmax_1;
            let _e221 = lmax_1;
            let _e224 = lam;
            let _e228 = global.uLiquid;
            let _e232 = global.uLiquid;
            let _e236 = lam;
            fk = ((1f - smoothstep((_e218 * 0.7f), (_e221 * 1.3f), _e224)) * (1f - smoothstep((_e228.w * 1.2f), (_e232.w * 2.2f), _e236)));
            let _e241 = fk;
            if (_e241 <= 0f) {
                continue;
            }
            let _e244 = K;
            let _e246 = n_7;
            let _e247 = K;
            let _e249 = n_7;
            kt = (_e244.xyz - (_e246 * dot(_e247.xyz, _e249)));
            let _e254 = kt;
            ktl = length(_e254);
            let _e257 = ktl;
            if (_e257 < 0.000001f) {
                continue;
            }
            let _e260 = kt;
            let _e261 = ktl;
            kd = (_e260 / vec3(_e261));
            let _e265 = river_1;
            if _e265 {
                local_16 = 1f;
            } else {
                let _e269 = kd;
                let _e270 = wd_1;
                local_16 = (0.2f + (1.2f * pow(max(dot(_e269, _e270), 0f), 2f)));
            }
            let _e279 = local_16;
            dirW = _e279;
            let _e281 = fk;
            let _e282 = dirW;
            let _e284 = ktl;
            let _e285 = kk;
            wt0_ = ((_e281 * _e282) * (_e284 / _e285));
            let _e289 = wt0_;
            let _e292 = i_5;
            let _e298 = grp_1[((_e292 / 3i) & 3i)];
            wt = (_e289 * (0.3f + (1.4f * _e298)));
            let _e304 = foot_9;
            let _e307 = foot_9;
            let _e309 = lam;
            res = smoothstep((2f * _e304), (6f * _e307), _e309);
            let _e312 = K;
            let _e314 = fp_1;
            let _e315 = warp_1;
            let _e318 = K;
            ph_1 = (dot(_e312.xyz, (_e314 + _e315)) - _e318.w);
            let _e322 = K;
            Ke = (floor(((_e322.yzx * 228.1645f) + vec3(0.5f))) * 0.001533981f);
            let _e337 = Ke;
            let _e338 = fp_1;
            let _e339 = warp_1;
            let _e343 = K;
            let _e347 = i_5;
            env = (0.6f + (0.4f * sin(((dot(_e337, (_e338 + _e339)) - (0.17f * _e343.w)) + (f32(_e347) * 1.7f)))));
            let _e357 = W;
            let _e359 = kd;
            let _e360 = wt;
            let _e361 = res;
            let _e363 = env;
            let _e365 = ph_1;
            W.g = (_e357.g + (_e359 * (((_e360 * _e361) * _e363) * cos(_e365))));
            let _e371 = W;
            let _e373 = wt;
            let _e374 = wt;
            W.var_ = (_e371.var_ + ((_e373 * _e374) * 0.22f));
            let _e380 = W;
            let _e382 = wt0_;
            let _e383 = wt0_;
            W.var0_ = (_e380.var0_ + ((_e382 * _e383) * 0.22f));
            let _e389 = W;
            let _e391 = wt;
            let _e392 = wt;
            let _e396 = res;
            W.res = (_e389.res + (((_e391 * _e392) * 0.22f) * _e396));
            let _e400 = W;
            let _e402 = wt;
            let _e403 = res;
            let _e405 = env;
            let _e407 = ph_1;
            W.crest = (_e400.crest + (((_e402 * _e403) * _e405) * sin(_e407)));
            let _e411 = rv;
            let _e412 = wt;
            let _e413 = wt;
            let _e417 = res;
            let _e419 = res;
            rv = (_e411 + ((((_e412 * _e413) * 0.22f) * _e417) * _e419));
        }
        continuing {
            let _e202 = i_5;
            i_5 = (_e202 + 1i);
        }
    }
    let _e423 = W;
    let _e425 = rv;
    W.crest = (_e423.crest / sqrt(max(_e425, 0.000000001f)));
    let _e430 = W;
    return _e430;
}

fn liqHash(c_2: vec2<f32>) -> f32 {
    var c_3: vec2<f32>;
    var q_3: vec2<u32>;
    var h_1: u32;

    c_3 = c_2;
    let _e172 = c_3;
    q_3 = vec2<u32>((vec2<i32>(_e172) + vec2(1048576i)));
    let _e179 = q_3;
    let _e183 = q_3;
    h_1 = ((_e179.x * 1597334677u) ^ (_e183.y * 3812015801u));
    let _e189 = h_1;
    h_1 = ((_e189 * 747796405u) + 2891336453u);
    let _e194 = h_1;
    let _e195 = h_1;
    h_1 = (_e194 ^ (_e195 >> 16u));
    let _e200 = h_1;
    h_1 = (_e200 * 2246822519u);
    let _e203 = h_1;
    let _e204 = h_1;
    h_1 = (_e203 ^ (_e204 >> 13u));
    let _e209 = h_1;
    return ((f32((_e209 & 7u)) * 0.7854f) + 0.3927f);
}

fn rippleNoise(p: vec2<f32>, per: f32) -> vec3<f32> {
    var p_1: vec2<f32>;
    var per_1: f32;
    var i_6: vec2<f32>;
    var f_4: vec2<f32>;
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
    let _e174 = p_1;
    i_6 = floor(_e174);
    let _e177 = p_1;
    let _e178 = i_6;
    f_4 = (_e177 - _e178);
    let _e181 = i_6;
    let _e184 = (_e181 + vec2(1f));
    let _e185 = per_1;
    let _e186 = vec2(_e185);
    i1_ = (_e184 - (floor((_e184 / _e186)) * _e186));
    let _e192 = i_6;
    let _e193 = per_1;
    let _e194 = vec2(_e193);
    i_6 = (_e192 - (floor((_e192 / _e194)) * _e194));
    let _e199 = f_4;
    let _e200 = f_4;
    let _e202 = f_4;
    let _e204 = f_4;
    let _e205 = f_4;
    u_1 = (((_e199 * _e200) * _e202) * ((_e204 * ((_e205 * 6f) - vec2(15f))) + vec2(10f)));
    let _e218 = f_4;
    let _e220 = f_4;
    let _e222 = f_4;
    let _e223 = f_4;
    du = (((30f * _e218) * _e220) * ((_e222 * (_e223 - vec2(2f))) + vec2(1f)));
    let _e233 = i_6;
    let _e234 = liqHash(_e233);
    ha = _e234;
    let _e236 = i1_;
    let _e238 = i_6;
    let _e241 = liqHash(vec2<f32>(_e236.x, _e238.y));
    hb = _e241;
    let _e243 = i_6;
    let _e245 = i1_;
    let _e248 = liqHash(vec2<f32>(_e243.x, _e245.y));
    hc_1 = _e248;
    let _e250 = i1_;
    let _e251 = liqHash(_e250);
    hd = _e251;
    let _e253 = ha;
    let _e255 = ha;
    ga = vec2<f32>(cos(_e253), sin(_e255));
    let _e259 = hb;
    let _e261 = hb;
    gb = vec2<f32>(cos(_e259), sin(_e261));
    let _e265 = hc_1;
    let _e267 = hc_1;
    gc = vec2<f32>(cos(_e265), sin(_e267));
    let _e271 = hd;
    let _e273 = hd;
    gd = vec2<f32>(cos(_e271), sin(_e273));
    let _e277 = ga;
    let _e278 = f_4;
    va = dot(_e277, _e278);
    let _e281 = gb;
    let _e282 = f_4;
    vb = dot(_e281, (_e282 - vec2<f32>(1f, 0f)));
    let _e289 = gc;
    let _e290 = f_4;
    vc = dot(_e289, (_e290 - vec2<f32>(0f, 1f)));
    let _e297 = gd;
    let _e298 = f_4;
    vd = dot(_e297, (_e298 - vec2(1f)));
    let _e304 = va;
    let _e305 = vb;
    let _e307 = vc;
    let _e309 = vd;
    k = (((_e304 - _e305) - _e307) + _e309);
    let _e312 = va;
    let _e313 = u_1;
    let _e315 = vb;
    let _e316 = va;
    let _e320 = u_1;
    let _e322 = vc;
    let _e323 = va;
    let _e327 = u_1;
    let _e329 = u_1;
    let _e332 = k;
    let _e335 = ga;
    let _e336 = u_1;
    let _e338 = gb;
    let _e339 = ga;
    let _e343 = u_1;
    let _e345 = gc;
    let _e346 = ga;
    let _e350 = u_1;
    let _e352 = u_1;
    let _e355 = ga;
    let _e356 = gb;
    let _e358 = gc;
    let _e360 = gd;
    let _e364 = du;
    let _e365 = u_1;
    let _e367 = k;
    let _e369 = vb;
    let _e370 = vc;
    let _e373 = va;
    let _e377 = ((((_e335 + (_e336.x * (_e338 - _e339))) + (_e343.y * (_e345 - _e346))) + ((_e350.x * _e352.y) * (((_e355 - _e356) - _e358) + _e360))) + (_e364 * (((_e365.yx * _e367) + vec2<f32>(_e369, _e370)) - vec2(_e373))));
    return vec3<f32>((((_e312 + (_e313.x * (_e315 - _e316))) + (_e320.y * (_e322 - _e323))) + ((_e327.x * _e329.y) * _e332)), _e377.x, _e377.y);
}

fn rippleAxis(a_3: i32, p_2: vec3<f32>, L_4: f32, o_1: f32) -> vec3<f32> {
    var a_4: i32;
    var p_3: vec3<f32>;
    var L_5: f32;
    var o_2: f32;
    var local_17: vec2<f32>;
    var local_18: vec2<f32>;
    var uv_7: vec2<f32>;
    var r_8: vec3<f32>;

    a_4 = a_3;
    p_3 = p_2;
    L_5 = L_4;
    o_2 = o_1;
    let _e178 = a_4;
    if (_e178 == 0i) {
        let _e181 = p_3;
        local_18 = _e181.zy;
    } else {
        let _e183 = a_4;
        if (_e183 == 1i) {
            let _e186 = p_3;
            local_17 = _e186.xz;
        } else {
            let _e188 = p_3;
            local_17 = _e188.xy;
        }
        let _e191 = local_17;
        local_18 = _e191;
    }
    let _e193 = local_18;
    uv_7 = _e193;
    let _e195 = uv_7;
    let _e196 = L_5;
    let _e199 = o_2;
    let _e203 = L_5;
    let _e205 = rippleNoise(((_e195 / vec2(_e196)) + vec2(_e199)), (4096f / _e203));
    r_8 = _e205;
    let _e207 = r_8;
    let _e209 = r_8;
    let _e210 = _e209.yz;
    return vec3<f32>(_e207.x, _e210.x, _e210.y);
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
    var a_5: i32;
    var local_29: f32;
    var bwk: f32;
    var r_9: vec3<f32>;
    var local_30: vec3<f32>;
    var local_31: vec3<f32>;

    fp_3 = fp_2;
    n_9 = n_8;
    lmax_3 = lmax_2;
    foot_11 = foot_10;
    let _e186 = n_9;
    an = abs(_e186);
    let _e189 = an;
    let _e191 = an;
    let _e194 = an;
    let _e196 = an;
    if ((_e189.x > _e191.y) && (_e194.x > _e196.z)) {
        local_20 = 0i;
    } else {
        let _e201 = an;
        let _e203 = an;
        if (_e201.y > _e203.z) {
            local_19 = 1i;
        } else {
            local_19 = 2i;
        }
        let _e209 = local_19;
        local_20 = _e209;
    }
    let _e211 = local_20;
    ma = _e211;
    let _e213 = an;
    let _e215 = an;
    let _e218 = an;
    let _e220 = an;
    if ((_e213.x < _e215.y) && (_e218.x < _e220.z)) {
        local_22 = 0i;
    } else {
        let _e225 = an;
        let _e227 = an;
        if (_e225.y < _e227.z) {
            local_21 = 1i;
        } else {
            local_21 = 2i;
        }
        let _e233 = local_21;
        local_22 = _e233;
    }
    let _e235 = local_22;
    mi = _e235;
    let _e238 = mi;
    let _e240 = ma;
    me = ((3i - _e238) - _e240);
    let _e243 = ma;
    if (_e243 == 0i) {
        let _e246 = an;
        local_24 = _e246.x;
    } else {
        let _e248 = ma;
        if (_e248 == 1i) {
            let _e251 = an;
            local_23 = _e251.y;
        } else {
            let _e253 = an;
            local_23 = _e253.z;
        }
        let _e256 = local_23;
        local_24 = _e256;
    }
    let _e258 = local_24;
    w0_1 = _e258;
    let _e260 = me;
    if (_e260 == 0i) {
        let _e263 = an;
        local_26 = _e263.x;
    } else {
        let _e265 = me;
        if (_e265 == 1i) {
            let _e268 = an;
            local_25 = _e268.y;
        } else {
            let _e270 = an;
            local_25 = _e270.z;
        }
        let _e273 = local_25;
        local_26 = _e273;
    }
    let _e275 = local_26;
    w1_1 = _e275;
    let _e277 = w0_1;
    let _e278 = w1_1;
    bw = clamp(((vec2<f32>(_e277, _e278) - vec2(0.5773f)) / vec2(0.4227f)), vec2(0f), vec2(1f));
    let _e294 = bw;
    let _e296 = bw;
    if ((_e294.x + _e296.y) < 0.0001f) {
        local_27 = vec2<f32>(1f, 0f);
    } else {
        let _e304 = bw;
        let _e305 = bw;
        let _e307 = bw;
        local_27 = (_e304 / vec2((_e305.x + _e307.y)));
    }
    let _e313 = local_27;
    bw = _e313;
    let _e314 = bw;
    if (_e314.y < 0.02f) {
        bw = vec2<f32>(1f, 0f);
    }
    loop {
        let _e327 = o_3;
        if !((_e327 < 4i)) {
            break;
        }
        {
            let _e335 = o_3;
            L_6 = (0.25f * exp2(f32(_e335)));
            let _e341 = lmax_3;
            let _e344 = lmax_3;
            let _e347 = L_6;
            fk_1 = (1f - smoothstep((_e341 * 0.3f), (_e344 * 0.6f), _e347));
            let _e351 = fk_1;
            if (_e351 <= 0f) {
                continue;
            }
            let _e354 = foot_11;
            let _e356 = foot_11;
            let _e358 = L_6;
            res_1 = smoothstep(_e354, (3f * _e356), _e358);
            g_3 = vec3(0f);
            v = 0f;
            k_1 = 0i;
            loop {
                let _e368 = k_1;
                if !((_e368 < 2i)) {
                    break;
                }
                {
                    let _e375 = k_1;
                    if (_e375 == 0i) {
                        let _e378 = ma;
                        local_28 = _e378;
                    } else {
                        let _e379 = me;
                        local_28 = _e379;
                    }
                    let _e381 = local_28;
                    a_5 = _e381;
                    let _e383 = k_1;
                    if (_e383 == 0i) {
                        let _e386 = bw;
                        local_29 = _e386.x;
                    } else {
                        let _e388 = bw;
                        local_29 = _e388.y;
                    }
                    let _e391 = local_29;
                    bwk = _e391;
                    let _e393 = bwk;
                    if (_e393 <= 0f) {
                        continue;
                    }
                    let _e396 = a_5;
                    let _e397 = fp_3;
                    let _e398 = L_6;
                    let _e399 = o_3;
                    let _e403 = rippleAxis(_e396, _e397, _e398, (f32(_e399) * 17.31f));
                    r_9 = _e403;
                    let _e405 = g_3;
                    let _e406 = bwk;
                    let _e407 = a_5;
                    if (_e407 == 0i) {
                        let _e411 = r_9;
                        let _e413 = r_9;
                        local_31 = vec3<f32>(0f, _e411.z, _e413.y);
                    } else {
                        let _e416 = a_5;
                        if (_e416 == 1i) {
                            let _e419 = r_9;
                            let _e422 = r_9;
                            local_30 = vec3<f32>(_e419.y, 0f, _e422.z);
                        } else {
                            let _e425 = r_9;
                            let _e427 = r_9;
                            local_30 = vec3<f32>(_e425.y, _e427.z, 0f);
                        }
                        let _e432 = local_30;
                        local_31 = _e432;
                    }
                    let _e434 = local_31;
                    g_3 = (_e405 + (_e406 * _e434));
                    let _e437 = v;
                    let _e438 = bwk;
                    let _e439 = r_9;
                    v = (_e437 + (_e438 * _e439.x));
                }
                continuing {
                    let _e372 = k_1;
                    k_1 = (_e372 + 1i);
                }
            }
            let _e443 = g_3;
            let _e444 = n_9;
            let _e445 = g_3;
            let _e446 = n_9;
            g_3 = (_e443 - (_e444 * dot(_e445, _e446)));
            let _e451 = W_1;
            let _e453 = g_3;
            let _e454 = fk_1;
            let _e455 = res_1;
            W_1.g = (_e451.g + (_e453 * (_e454 * _e455)));
            let _e460 = W_1;
            let _e462 = fk_1;
            let _e463 = fk_1;
            W_1.var_ = (_e460.var_ + ((_e462 * _e463) * 0.78f));
            let _e469 = W_1;
            let _e471 = fk_1;
            let _e472 = fk_1;
            let _e476 = res_1;
            W_1.res = (_e469.res + (((_e471 * _e472) * 0.78f) * _e476));
            let _e480 = W_1;
            let _e482 = fk_1;
            let _e483 = res_1;
            let _e485 = v;
            W_1.crest = (_e480.crest + (((_e482 * _e483) * _e485) / 0.216f));
            let _e490 = rv_1;
            let _e491 = fk_1;
            let _e492 = fk_1;
            let _e494 = res_1;
            let _e496 = res_1;
            rv_1 = (_e490 + (((_e491 * _e492) * _e494) * _e496));
        }
        continuing {
            let _e331 = o_3;
            o_3 = (_e331 + 1i);
        }
    }
    let _e500 = W_1;
    W_1.var0_ = _e500.var_;
    let _e503 = W_1;
    let _e505 = rv_1;
    W_1.crest = (_e503.crest / sqrt(max(_e505, 0.000000001f)));
    let _e510 = W_1;
    return _e510;
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
    var U_1: f32;
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
    let _e197 = upF_4;
    al_1 = abs(asin(clamp(_e197.y, -1f, 1f)));
    let _e206 = upF_4;
    let _e207 = windSense(_e206);
    toward = _e207;
    let _e209 = al_1;
    if (_e209 < 0.09f) {
        local_34 = 0.45f;
    } else {
        let _e213 = al_1;
        if (_e213 < 0.52f) {
            local_33 = 0.9f;
        } else {
            let _e217 = al_1;
            if (_e217 < 1.05f) {
                local_32 = 1.25f;
            } else {
                local_32 = 0.8f;
            }
            let _e223 = local_32;
            local_33 = _e223;
        }
        let _e225 = local_33;
        local_34 = _e225;
    }
    let _e227 = local_34;
    strength = _e227;
    let _e233 = upF_4;
    east_1 = cross(vec3<f32>(0f, 1f, 0f), _e233);
    let _e236 = east_1;
    if (length(_e236) > 0.0001f) {
        let _e240 = east_1;
        let _e242 = toward;
        local_35 = (normalize(_e240) * sign((_e242 + 0.001f)));
    } else {
        local_35 = vec3<f32>(1f, 0f, 0f);
    }
    let _e252 = local_35;
    wd_2 = _e252;
    let _e254 = kind_1;
    let _e257 = kind_1;
    river_2 = ((_e254 > 0.55f) && (_e257 < 0.85f));
    let _e262 = kind_1;
    pond = (_e262 > 0.85f);
    let _e266 = kind_1;
    sea = (_e266 < 0.2f);
    let _e270 = east_1;
    if (length(_e270) > 0.0001f) {
        let _e274 = east_1;
        local_36 = normalize(_e274);
    } else {
        local_36 = vec3<f32>(1f, 0f, 0f);
    }
    let _e281 = local_36;
    e1_ = _e281;
    let _e283 = upF_4;
    let _e284 = e1_;
    e2_ = cross(_e283, _e284);
    let _e287 = e1_;
    let _e288 = wn_1;
    let _e291 = e2_;
    let _e292 = wn_1;
    let _e298 = global.uLiquid;
    warp_2 = ((((_e287 * _e288.x) + (_e291 * _e292.y)) * 0.12f) * _e298.w);
    let _e302 = global.uLiquid;
    let _e304 = strength;
    let _e306 = sea;
    if _e306 {
        local_37 = 1f;
    } else {
        let _e310 = fetch_1;
        local_37 = mix(0.3f, 1f, _e310);
    }
    let _e313 = local_37;
    U_1 = ((_e302.y * _e304) * _e313);
    let _e316 = river_2;
    if _e316 {
        let _e317 = fv_1;
        let _e318 = global.uLiquid2_;
        let _e320 = depth_1;
        local_38 = (_e317 / sqrt((_e318.x * max(_e320, 0.3f))));
    } else {
        local_38 = 0f;
    }
    let _e328 = local_38;
    Fr = _e328;
    let _e330 = sea;
    if _e330 {
        let _e333 = U_1;
        let _e337 = U_1;
        local_41 = ((0.003f * step(0.01f, _e333)) + (0.00512f * _e337));
    } else {
        let _e340 = pond;
        if _e340 {
            let _e343 = U_1;
            local_40 = (0.0003f + (0.0003f * _e343));
        } else {
            let _e346 = river_2;
            if _e346 {
                let _e349 = Fr;
                let _e350 = Fr;
                let _e357 = U_1;
                local_39 = ((0.0012f + (0.035f * min((_e349 * _e350), 2f))) + (0.0015f * _e357));
            } else {
                let _e362 = U_1;
                local_39 = (0.001f + (0.00512f * _e362));
            }
            let _e366 = local_39;
            local_40 = _e366;
        }
        let _e368 = local_40;
        local_41 = _e368;
    }
    let _e370 = local_41;
    s2_ = _e370;
    let _e372 = s2_;
    let _e373 = global.uLiquid;
    s2_ = (_e372 * _e373.z);
    let _e376 = sea;
    if _e376 {
        local_44 = 1000000000f;
    } else {
        let _e378 = river_2;
        if _e378 {
            let _e380 = fv_1;
            let _e382 = fv_1;
            let _e384 = global.uLiquid2_;
            let _e387 = depth_1;
            local_43 = clamp(((((6.2832f * _e380) * _e382) / _e384.x) + _e387), 0.6f, 8f);
        } else {
            let _e392 = pond;
            if _e392 {
                local_42 = 1f;
            } else {
                let _e396 = fetch_1;
                local_42 = (25f + (400f * _e396));
            }
            let _e400 = local_42;
            local_43 = _e400;
        }
        let _e402 = local_43;
        local_44 = _e402;
    }
    let _e404 = local_44;
    lmax_4 = _e404;
    let _e407 = fdir_1;
    let _e408 = upF_4;
    let _e409 = fdir_1;
    let _e410 = upF_4;
    fd = (_e407 - (_e408 * dot(_e409, _e410)));
    let _e415 = fd;
    if (length(_e415) > 0.05f) {
        let _e419 = fd;
        local_45 = normalize(_e419);
    } else {
        local_45 = vec3(0f);
    }
    let _e424 = local_45;
    fd = _e424;
    let _e425 = global.uTime;
    ta = fract((_e425 / 3f));
    let _e430 = global.uTime;
    tb = fract(((_e430 / 3f) + 0.5f));
    let _e439 = ta;
    wa_1 = (1f - abs(((2f * _e439) - 1f)));
    let _e446 = river_2;
    if _e446 {
        {
            let _e447 = fp_5;
            let _e448 = fd;
            let _e449 = fv_1;
            let _e453 = ta;
            let _e456 = n_11;
            let _e457 = lmax_4;
            let _e458 = foot_13;
            let _e459 = riverRipples((_e447 - (((_e448 * _e449) * 3f) * _e453)), _e456, _e457, _e458);
            A = _e459;
            let _e461 = fp_5;
            let _e462 = fd;
            let _e463 = fv_1;
            let _e467 = tb;
            let _e473 = n_11;
            let _e474 = lmax_4;
            let _e475 = foot_13;
            let _e476 = riverRipples(((_e461 - (((_e462 * _e463) * 3f) * _e467)) + vec3(0.37f)), _e473, _e474, _e475);
            B = _e476;
            let _e478 = A;
            W_2 = _e478;
            let _e480 = A;
            let _e482 = wa_1;
            let _e484 = B;
            let _e487 = wa_1;
            W_2.g = ((_e480.g * _e482) + (_e484.g * (1f - _e487)));
            let _e492 = A;
            let _e494 = wa_1;
            let _e496 = B;
            let _e499 = wa_1;
            W_2.crest = ((_e492.crest * _e494) + (_e496.crest * (1f - _e499)));
        }
    } else {
        let _e503 = fp_5;
        let _e504 = n_11;
        let _e505 = wd_2;
        let _e506 = lmax_4;
        let _e508 = foot_13;
        let _e509 = warp_2;
        let _e510 = grp_3;
        let _e511 = liquidWaves(_e503, _e504, _e505, _e506, false, _e508, _e509, _e510);
        W_2 = _e511;
    }
    let _e512 = s2_;
    let _e513 = W_2;
    sc = sqrt((_e512 / max(_e513.var0_, 0.000000001f)));
    let _e520 = n_11;
    let _e521 = W_2;
    let _e523 = sc;
    (*nF) = normalize((_e520 - (_e521.g * _e523)));
    let _e528 = W_2;
    let _e530 = W_2;
    let _e537 = sc;
    (*rough) = clamp((sqrt((2f * max((_e528.var_ - _e530.res), 0f))) * _e537), 0.02f, 0.6f);
    let _e543 = U_1;
    cov = clamp((0.00000384f * pow(_e543, 3.41f)), 0f, 0.3f);
    (*foam) = 0f;
    let _e552 = river_2;
    let _e554 = pond;
    let _e557 = cov;
    if ((!(_e552) && !(_e554)) && (_e557 > 0.0001f)) {
        {
            let _e563 = cov;
            t_2 = sqrt((-2f * log(_e563)));
            let _e568 = t_2;
            let _e571 = t_2;
            let _e575 = t_2;
            let _e577 = t_2;
            let _e582 = t_2;
            let _e586 = t_2;
            let _e588 = t_2;
            let _e592 = t_2;
            let _e594 = t_2;
            let _e596 = t_2;
            z = (_e568 - (((2.515517f + (0.802853f * _e571)) + ((0.010328f * _e575) * _e577)) / (((1f + (1.432788f * _e582)) + ((0.189269f * _e586) * _e588)) + (((0.001308f * _e592) * _e594) * _e596))));
            let _e602 = W_2;
            let _e604 = W_2;
            rk = (_e602.res / max(_e604.var_, 0.000000001f));
            let _e610 = cov;
            let _e611 = z;
            let _e614 = z;
            let _e617 = W_2;
            let _e620 = rk;
            (*foam) = (mix(_e610, smoothstep((_e611 - 0.25f), (_e614 + 0.35f), _e617.crest), _e620) * 0.9f);
        }
    }
    let _e624 = river_2;
    let _e626 = pond;
    let _e629 = depth_1;
    if ((!(_e624) && !(_e626)) && (_e629 < 1.6f)) {
        {
            let _e636 = depth_1;
            let _e640 = global.uTime;
            sw = (0.5f + (0.5f * sin((((6.2832f * _e636) / 0.4f) + (_e640 * 1.3f)))));
            let _e650 = grp_3;
            let _e653 = W_2;
            lace = smoothstep(0.2f, 0.8f, (_e650.x + (0.2f * _e653.crest)));
            let _e662 = depth_1;
            let _e667 = sw;
            let _e670 = lace;
            let _e675 = depth_1;
            let _e680 = lace;
            sh_2 = ((((1f - smoothstep(0.05f, 1.6f, _e662)) * smoothstep(0.75f, 0.97f, _e667)) * _e670) + ((1f - smoothstep(0f, 0.15f, _e675)) * (0.4f + (0.6f * _e680))));
            let _e686 = (*foam);
            let _e687 = sh_2;
            let _e693 = U_1;
            (*foam) = max(_e686, ((clamp(_e687, 0f, 1f) * smoothstep(0.5f, 4f, _e693)) * 0.75f));
        }
    }
    let _e699 = river_2;
    let _e700 = fd;
    if (_e699 && (length(_e700) > 0f)) {
        {
            let _e705 = upF_4;
            let _e706 = fd;
            ac = cross(_e705, _e706);
            let _e709 = Fr;
            cov_1 = clamp(((_e709 - 0.6f) / 0.9f), 0f, 1f);
            let _e718 = cov_1;
            let _e719 = cov_1;
            cov_1 = (_e718 * _e719);
            let _e721 = cov_1;
            if (_e721 > 0f) {
                {
                    let _e724 = fp_5;
                    let _e725 = ac;
                    let _e729 = fp_5;
                    let _e730 = fd;
                    q_4 = vec2<f32>((dot(_e724, _e725) * 0.15f), (dot(_e729, _e730) * 0.04f));
                    let _e736 = q_4;
                    let _e738 = fv_1;
                    let _e741 = ta;
                    qa = (_e736 - vec2<f32>(0f, (((_e738 * 3f) * _e741) * 0.04f)));
                    let _e748 = q_4;
                    let _e754 = fv_1;
                    let _e757 = tb;
                    qb = ((_e748 + vec2<f32>(0.41f, 0f)) - vec2<f32>(0f, (((_e754 * 3f) * _e757) * 0.04f)));
                    let _e765 = qa;
                    let _e767 = textureSampleLevel(tDetailTexture, tDetailSampler, _e765, 0f);
                    let _e771 = qa;
                    let _e778 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e771 * 3.1f) + vec2(0.3f)), 0f);
                    na = ((0.65f * _e767.w) + (0.35f * _e778.x));
                    let _e784 = qb;
                    let _e786 = textureSampleLevel(tDetailTexture, tDetailSampler, _e784, 0f);
                    let _e790 = qb;
                    let _e797 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e790 * 3.1f) + vec2(0.3f)), 0f);
                    nb = ((0.65f * _e786.w) + (0.35f * _e797.x));
                    let _e804 = cov_1;
                    th = mix(0.75f, 0.28f, _e804);
                    let _e807 = th;
                    let _e810 = th;
                    let _e813 = nb;
                    let _e814 = na;
                    let _e815 = wa_1;
                    let _e818 = W_2;
                    (*foam) = (smoothstep((_e807 - 0.02f), (_e810 + 0.1f), (mix(_e813, _e814, _e815) + (0.06f * _e818.crest))) * 0.85f);
                }
            }
            let _e825 = fp_5;
            let _e826 = ac;
            let _e830 = fp_5;
            let _e831 = fd;
            q_5 = vec2<f32>((dot(_e825, _e826) * 0.2f), (dot(_e830, _e831) * 0.004f));
            let _e838 = q_5;
            let _e841 = fp_5;
            let _e842 = ac;
            let _e844 = fp_5;
            let _e845 = fd;
            let _e851 = textureSampleLevel(tDetailTexture, tDetailSampler, (vec2<f32>(dot(_e841, _e842), dot(_e844, _e845)) * 0.012f), 0f);
            q_5.x = (_e838.x + (1.2f * (_e851.x - 0.5f)));
            let _e857 = q_5;
            let _e859 = fv_1;
            let _e862 = ta;
            let _e869 = textureSampleLevel(tDetailTexture, tDetailSampler, (_e857 - vec2<f32>(0f, (((_e859 * 3f) * _e862) * 0.004f))), 0f);
            sa = _e869.w;
            let _e872 = q_5;
            let _e878 = fv_1;
            let _e881 = tb;
            let _e888 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e872 + vec2<f32>(0.43f, 0f)) - vec2<f32>(0f, (((_e878 * 3f) * _e881) * 0.004f))), 0f);
            sb = _e888.w;
            let _e893 = sb;
            let _e894 = sa;
            let _e895 = wa_1;
            let _e900 = Fr;
            streak = (smoothstep(0.7f, 0.8f, mix(_e893, _e894, _e895)) * smoothstep(0.6f, 1.2f, _e900));
            let _e904 = (*foam);
            let _e905 = streak;
            (*foam) = max(_e904, (_e905 * 0.3f));
        }
    }
    let _e909 = (*foam);
    let _e910 = global.uLiquid2_;
    (*foam) = (_e909 * _e910.y);
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
    let _e179 = global.uSeason;
    if (_e179.z > 0.5f) {
        {
            let _e183 = upF_6;
            let _e184 = seasonYear(_e183);
            yr = _e184;
            let _e186 = kind_3;
            if (_e186 < 0.2f) {
                local_48 = 1f;
            } else {
                let _e190 = kind_3;
                if (_e190 < 0.55f) {
                    local_47 = 0.8f;
                } else {
                    let _e194 = kind_3;
                    if (_e194 < 0.85f) {
                        local_46 = 0.7f;
                    } else {
                        local_46 = 1f;
                    }
                    let _e200 = local_46;
                    local_47 = _e200;
                }
                let _e202 = local_47;
                local_48 = _e202;
            }
            let _e204 = local_48;
            follow = _e204;
            let _e206 = Tm_1;
            let _e207 = follow;
            let _e208 = yr;
            let _e210 = global.uSeason;
            let _e214 = yr;
            let _e216 = global.uSeason;
            Ts_1 = (_e206 + (_e207 * ((_e208.x * cos(_e210.x)) + (_e214.y * sin(_e216.x)))));
        }
    } else {
        {
            let _e223 = kind_3;
            if (_e223 < 0.2f) {
                local_51 = 0.25f;
            } else {
                let _e227 = kind_3;
                if (_e227 < 0.55f) {
                    local_50 = 0.6f;
                } else {
                    let _e231 = kind_3;
                    if (_e231 < 0.85f) {
                        local_49 = 0.45f;
                    } else {
                        local_49 = 0.8f;
                    }
                    let _e237 = local_49;
                    local_50 = _e237;
                }
                let _e239 = local_50;
                local_51 = _e239;
            }
            let _e241 = local_51;
            follow_1 = _e241;
            let _e243 = Tm_1;
            let _e245 = global.uLiquid2_;
            let _e248 = upF_6;
            let _e251 = follow_1;
            Ts_1 = (_e243 + (((70f * _e245.w) * _e248.y) * _e251));
        }
    }
    let _e254 = kind_3;
    if (_e254 < 0.2f) {
        let _e257 = global.uLiquid2_;
        local_52 = _e257.z;
    } else {
        local_52 = 0f;
    }
    let _e261 = local_52;
    let _e262 = kind_3;
    let _e265 = kind_3;
    if ((_e262 > 0.55f) && (_e265 < 0.85f)) {
        let _e270 = flow_3;
        local_53 = (3f * _e270);
    } else {
        local_53 = 0f;
    }
    let _e274 = local_53;
    Tf_2 = (_e261 - _e274);
    let _e277 = Ts_1;
    let _e278 = Tf_2;
    return vec2<f32>(_e277, _e278);
}

fn seaIceCover(ice: f32, nA: f32, nR: f32) -> f32 {
    var ice_1: f32;
    var nA_1: f32;
    var nR_1: f32;

    ice_1 = ice;
    nA_1 = nA;
    nR_1 = nR;
    let _e178 = ice_1;
    let _e179 = nA_1;
    let _e185 = nR_1;
    let _e194 = ice_1;
    return (smoothstep(0.35f, 0.75f, ((_e178 + ((_e179 - 0.5f) * 0.9f)) + ((_e185 - 0.5f) * 0.35f))) * smoothstep(0f, 0.15f, _e194));
}

fn floeHash(x_1: u32, y: u32, z_1: u32, s_1: u32) -> u32 {
    var x_2: u32;
    var y_1: u32;
    var z_2: u32;
    var s_2: u32;
    var h_2: u32;

    x_2 = x_1;
    y_1 = y;
    z_2 = z_1;
    s_2 = s_1;
    let _e178 = x_2;
    let _e181 = y_1;
    let _e185 = z_2;
    let _e189 = s_2;
    h_2 = ((((_e178 * 2376512323u) ^ (_e181 * 3625334849u)) ^ (_e185 * 3407524639u)) ^ (_e189 * 374761393u));
    let _e194 = h_2;
    let _e195 = h_2;
    h_2 = (_e194 ^ (_e195 >> 15u));
    let _e199 = h_2;
    h_2 = (_e199 * 739982445u);
    let _e202 = h_2;
    let _e203 = h_2;
    h_2 = (_e202 ^ (_e203 >> 12u));
    let _e207 = h_2;
    h_2 = (_e207 * 695872825u);
    let _e210 = h_2;
    let _e211 = h_2;
    h_2 = (_e210 ^ (_e211 >> 15u));
    let _e215 = h_2;
    return _e215;
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
    let _e177 = p_5;
    let _e179 = period_1;
    let _e183 = textureSampleLevel(tDetailTexture, tDetailSampler, (_e177.yz / vec2(_e179)), 0f);
    a_6 = _e183;
    let _e185 = p_5;
    let _e187 = period_1;
    let _e194 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e185.zx / vec2(_e187)) + vec2(0.37f)), 0f);
    b_2 = _e194;
    let _e196 = p_5;
    let _e198 = period_1;
    let _e205 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e196.xy / vec2(_e198)) + vec2(0.71f)), 0f);
    c_4 = _e205;
    let _e207 = a_6;
    let _e208 = w_2;
    let _e211 = b_2;
    let _e212 = w_2;
    let _e216 = c_4;
    let _e217 = w_2;
    return (((_e207 * _e208.x) + (_e211 * _e212.y)) + (_e216 * _e217.z));
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
    let _e177 = p_7;
    let _e179 = period_3;
    let _e183 = textureSampleLevel(tDetailTexture, tDetailSampler, (_e177.yz / vec2(_e179)), 0f);
    a_7 = _e183;
    let _e185 = p_7;
    let _e187 = period_3;
    let _e194 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e185.zx / vec2(_e187)) + vec2(0.37f)), 0f);
    b_3 = _e194;
    let _e196 = p_7;
    let _e198 = period_3;
    let _e205 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e196.xy / vec2(_e198)) + vec2(0.71f)), 0f);
    c_5 = _e205;
    let _e207 = a_7;
    let _e208 = w_4;
    let _e211 = b_3;
    let _e212 = w_4;
    let _e216 = c_5;
    let _e217 = w_4;
    return (((_e207 * _e208.x) + (_e211 * _e212.y)) + (_e216 * _e217.z));
}

fn leadIce(lid: u32, frz: f32, pDay: f32) -> vec2<f32> {
    var lid_1: u32;
    var frz_1: f32;
    var pDay_1: f32;
    var age: f32;
    var local_54: f32;
    var h_3: f32;

    lid_1 = lid;
    frz_1 = frz;
    pDay_1 = pDay;
    let _e178 = lid_1;
    age = (-2f * log(((f32((_e178 & 65535u)) + 0.5f) / 65536f)));
    let _e189 = frz_1;
    if (_e189 > 0f) {
        let _e193 = frz_1;
        let _e194 = age;
        local_54 = (1.33f * pow((_e193 * _e194), 0.58f));
    } else {
        local_54 = 0f;
    }
    let _e201 = local_54;
    h_3 = _e201;
    let _e203 = h_3;
    let _e205 = pDay_1;
    let _e207 = age;
    let _e215 = h_3;
    return vec2<f32>(_e203, ((1f - exp(((-(_e205) * _e207) / 12f))) * smoothstep(3f, 8f, _e215)));
}

fn leadHalf(cid: u32, c_6: f32, s_3: f32) -> f32 {
    var cid_1: u32;
    var c_7: f32;
    var s_4: f32;

    cid_1 = cid;
    c_7 = c_6;
    s_4 = s_3;
    let _e178 = s_4;
    let _e184 = cid_1;
    let _e196 = c_7;
    return min(150f, (((0.03f * min(_e178, 2048f)) * (0.2f + ((1.6f * f32((_e184 & 255u))) / 256f))) * (1f + (8f * (1f - sqrt(_e196))))));
}

fn crackOpen(cid_2: u32, c_8: f32, s_5: f32) -> f32 {
    var cid_3: u32;
    var c_9: f32;
    var s_6: f32;

    cid_3 = cid_2;
    c_9 = c_8;
    s_6 = s_5;
    let _e176 = cid_3;
    let _e187 = c_9;
    if ((f32(((_e176 >> 8u) & 255u)) / 256f) < (0.5f * smoothstep(0.85f, 1f, _e187))) {
        let _e192 = cid_3;
        return -((0.5f + (f32(((_e192 >> 16u) & 255u)) / 255f)));
    }
    let _e202 = cid_3;
    let _e203 = c_9;
    let _e204 = s_6;
    let _e205 = leadHalf(_e202, _e203, _e204);
    return _e205;
}

fn pieceCover(m_4: vec3<f32>, ice_2: f32) -> f32 {
    var m_5: vec3<f32>;
    var ice_3: f32;
    var u_2: vec3<f32>;
    var wm: vec3<f32>;
    var local_55: f32;

    m_5 = m_4;
    ice_3 = ice_2;
    let _e174 = m_5;
    u_2 = normalize(_e174);
    let _e177 = u_2;
    wm = pow(abs(_e177), vec3(4f));
    let _e183 = wm;
    let _e184 = wm;
    let _e186 = wm;
    let _e189 = wm;
    wm = (_e183 / vec3(((_e184.x + _e186.y) + _e189.z)));
    let _e194 = global.uSeason;
    if (_e194.z > 0.5f) {
        let _e198 = m_5;
        let _e199 = global.uLiquid2_;
        let _e201 = seaIceAt(_e198, _e199.z);
        local_55 = _e201;
    } else {
        let _e202 = ice_3;
        local_55 = _e202;
    }
    let _e204 = local_55;
    let _e205 = m_5;
    let _e206 = wm;
    let _e208 = tri0_(_e205, _e206, 512f);
    let _e210 = m_5;
    let _e211 = wm;
    let _e213 = tri0_(_e210, _e211, 64f);
    let _e215 = seaIceCover(_e204, _e208.w, _e213.x);
    return _e215;
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
    let _e176 = axis_1;
    let _e180 = neg_1;
    if _e180 {
        local_56 = 1u;
    } else {
        local_56 = 0u;
    }
    let _e184 = local_56;
    of_ = (u32((_e176 * 2i)) + _e184);
    let _e187 = face_1;
    let _e188 = of_;
    let _e190 = face_1;
    let _e191 = of_;
    let _e195 = floeHash(min(_e187, _e188), max(_e190, _e191), 20253u, 11132u);
    return _e195;
}

fn floeRound(size: f32, id: u32, c_10: f32) -> f32 {
    var size_1: f32;
    var id_1: u32;
    var c_11: f32;
    var age_1: f32;

    size_1 = size;
    id_1 = id;
    c_11 = c_10;
    let _e181 = size_1;
    let _e187 = id_1;
    age_1 = ((0.3f + (0.7f * smoothstep(16f, 200f, _e181))) * (0.6f + ((0.4f * f32((_e187 >> 16u))) / 65536f)));
    let _e197 = size_1;
    let _e200 = age_1;
    let _e207 = c_11;
    return (_e197 * ((0.06f * (0.5f + _e200)) + (0.32f * (1f - smoothstep(0.5f, 0.9f, _e207)))));
}

fn floeOf(p_8: vec3<f32>, ice_4: f32, id_2: ptr<function, u32>, e: ptr<function, f32>, lid_2: ptr<function, u32>, c_12: ptr<function, f32>, size_2: ptr<function, f32>, mid: ptr<function, vec3<f32>>, there: ptr<function, bool>, ridge: ptr<function, vec4<f32>>) {
    var p_9: vec3<f32>;
    var ice_5: f32;
    var R_2: f32;
    var a_8: vec3<f32>;
    var local_57: i32;
    var local_58: i32;
    var ax: i32;
    var b_4: i32;
    var d_6: i32;
    var neg_2: bool;
    var local_59: f32;
    var sg: f32;
    var pu: f32;
    var pv: f32;
    var local_60: u32;
    var face_2: u32;
    var V: array<vec2<f32>, 12>;
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
    var h_4: u32;
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
    var dn_1: f32;
    var ek: f32;
    var local_64: f32;
    var rr: f32;

    p_9 = p_8;
    ice_5 = ice_4;
    let _e183 = p_9;
    R_2 = length(_e183);
    let _e186 = p_9;
    a_8 = abs(_e186);
    let _e189 = a_8;
    let _e191 = a_8;
    let _e194 = a_8;
    let _e196 = a_8;
    if ((_e189.x >= _e191.y) && (_e194.x >= _e196.z)) {
        local_58 = 0i;
    } else {
        let _e201 = a_8;
        let _e203 = a_8;
        if (_e201.y >= _e203.z) {
            local_57 = 1i;
        } else {
            local_57 = 2i;
        }
        let _e209 = local_57;
        local_58 = _e209;
    }
    let _e211 = local_58;
    ax = _e211;
    let _e213 = ax;
    b_4 = ((_e213 + 1i) % 3i);
    let _e219 = ax;
    d_6 = ((_e219 + 2i) % 3i);
    let _e225 = ax;
    let _e227 = p_9[_e225];
    neg_2 = (_e227 < 0f);
    let _e231 = neg_2;
    if _e231 {
        local_59 = -1f;
    } else {
        local_59 = 1f;
    }
    let _e236 = local_59;
    sg = _e236;
    let _e238 = b_4;
    let _e240 = p_9[_e238];
    let _e241 = ax;
    let _e243 = p_9[_e241];
    pu = (_e240 / _e243);
    let _e246 = d_6;
    let _e248 = p_9[_e246];
    let _e249 = ax;
    let _e251 = p_9[_e249];
    pv = (_e248 / _e251);
    let _e254 = ax;
    let _e258 = neg_2;
    if _e258 {
        local_60 = 1u;
    } else {
        local_60 = 0u;
    }
    let _e262 = local_60;
    face_2 = (u32((_e254 * 2i)) + _e262);
    V[0i] = vec2<f32>(-1f, -1f);
    V[1i] = vec2<f32>(1f, -1f);
    V[2i] = vec2<f32>(1f, 1f);
    V[3i] = vec2<f32>(-1f, 1f);
    let _e294 = face_2;
    let _e295 = d_6;
    let _e296 = neg_2;
    let _e298 = faceLead(_e294, _e295, !(_e296));
    EI[0i] = _e298;
    let _e301 = face_2;
    let _e302 = b_4;
    let _e303 = neg_2;
    let _e304 = faceLead(_e301, _e302, _e303);
    EI[1i] = _e304;
    let _e307 = face_2;
    let _e308 = d_6;
    let _e309 = neg_2;
    let _e310 = faceLead(_e307, _e308, _e309);
    EI[2i] = _e310;
    let _e313 = face_2;
    let _e314 = b_4;
    let _e315 = neg_2;
    let _e317 = faceLead(_e313, _e314, !(_e315));
    EI[3i] = _e317;
    loop {
        let _e320 = i_7;
        if !((_e320 < 4i)) {
            break;
        }
        let _e327 = i_7;
        let _e329 = i_7;
        let _e331 = EI[_e329];
        let _e334 = leadHalf(_e331, 1f, 4096f);
        ES[_e327] = _e334;
        continuing {
            let _e324 = i_7;
            i_7 = (_e324 + 1i);
        }
    }
    (*ridge) = vec4<f32>(0f, 0f, 0f, 100000000000000000000f);
    let _e342 = face_2;
    let _e346 = floeHash(_e342, 20942u, 0u, 14971u);
    (*id_2) = _e346;
    (*c_12) = 1f;
    let _e353 = p_9;
    m_6 = _e353;
    loop {
        let _e357 = lvl;
        if !((_e357 < 32i)) {
            break;
        }
        {
            let _e366 = V[0];
            v0_ = _e366;
            cs_1 = vec2(0f);
            A_1 = 0f;
            i_8 = 0i;
            loop {
                let _e375 = i_8;
                if !((_e375 < POLY_MAX)) {
                    break;
                }
                {
                    let _e381 = i_8;
                    let _e382 = n_12;
                    if (_e381 >= _e382) {
                        break;
                    }
                    let _e384 = i_8;
                    let _e386 = V[_e384];
                    let _e387 = v0_;
                    xi = (_e386 - _e387);
                    let _e390 = i_8;
                    let _e393 = n_12;
                    let _e396 = V[((_e390 + 1i) % _e393)];
                    let _e397 = v0_;
                    xj = (_e396 - _e397);
                    let _e400 = xi;
                    let _e402 = xj;
                    let _e405 = xj;
                    let _e407 = xi;
                    w_5 = ((_e400.x * _e402.y) - (_e405.x * _e407.y));
                    let _e412 = A_1;
                    let _e413 = w_5;
                    A_1 = (_e412 + _e413);
                    let _e415 = cs_1;
                    let _e416 = xi;
                    let _e417 = xj;
                    let _e419 = w_5;
                    cs_1 = (_e415 + ((_e416 + _e417) * _e419));
                }
                continuing {
                    let _e378 = i_8;
                    i_8 = (_e378 + 1i);
                }
            }
            let _e422 = A_1;
            A_1 = (_e422 * 0.5f);
            let _e425 = A_1;
            if (abs(_e425) < 0.00000000000000000001f) {
                break;
            }
            let _e429 = v0_;
            let _e430 = cs_1;
            let _e432 = A_1;
            cc = (_e429 + (_e430 / vec2((6f * _e432))));
            sxx = 0f;
            syy = 0f;
            sxy = 0f;
            i_9 = 0i;
            loop {
                let _e446 = i_9;
                if !((_e446 < POLY_MAX)) {
                    break;
                }
                {
                    let _e452 = i_9;
                    let _e453 = n_12;
                    if (_e452 >= _e453) {
                        break;
                    }
                    let _e455 = i_9;
                    let _e457 = V[_e455];
                    let _e458 = cc;
                    x_3 = (_e457 - _e458);
                    let _e461 = sxx;
                    let _e462 = x_3;
                    let _e464 = x_3;
                    sxx = (_e461 + (_e462.x * _e464.x));
                    let _e468 = syy;
                    let _e469 = x_3;
                    let _e471 = x_3;
                    syy = (_e468 + (_e469.y * _e471.y));
                    let _e475 = sxy;
                    let _e476 = x_3;
                    let _e478 = x_3;
                    sxy = (_e475 + (_e476.x * _e478.y));
                }
                continuing {
                    let _e449 = i_9;
                    i_9 = (_e449 + 1i);
                }
            }
            let _e482 = sxy;
            let _e484 = sxx;
            let _e485 = syy;
            let _e490 = sxx;
            let _e491 = syy;
            if ((abs(_e482) + abs((_e484 - _e485))) > (0.000000000000000000000000000001f * (_e490 + _e491))) {
                let _e497 = sxy;
                let _e499 = sxx;
                let _e500 = syy;
                local_61 = (0.5f * atan2((2f * _e497), (_e499 - _e500)));
            } else {
                local_61 = 0f;
            }
            let _e506 = local_61;
            th_1 = _e506;
            let _e508 = sxx;
            let _e509 = syy;
            let _e511 = n_12;
            ext = sqrt(((_e508 + _e509) / f32(_e511)));
            let _e517 = ax;
            let _e519 = sg;
            mm[_e517] = _e519;
            let _e520 = b_4;
            let _e522 = sg;
            let _e523 = cc;
            mm[_e520] = (_e522 * _e523.x);
            let _e526 = d_6;
            let _e528 = sg;
            let _e529 = cc;
            mm[_e526] = (_e528 * _e529.y);
            let _e532 = mm;
            let _e534 = R_2;
            m_6 = (normalize(_e532) * _e534);
            let _e536 = R_2;
            let _e537 = A_1;
            let _e542 = cc;
            let _e543 = cc;
            s_7 = ((_e536 * sqrt(abs(_e537))) / pow((1f + dot(_e542, _e543)), 0.75f));
            let _e549 = (*id_2);
            let _e550 = lvl;
            let _e554 = floeHash(_e549, u32(_e550), 20942u, 14971u);
            h_4 = _e554;
            let _e556 = th_1;
            let _e559 = h_4;
            tc = (((_e556 + 1.5708f) + ((f32(((_e559 >> 8u) & 1023u)) / 1023f) * 1.0472f)) - 0.5236f);
            let _e573 = h_4;
            let _e585 = ext;
            off = ((((f32(((_e573 >> 18u) & 255u)) / 255f) - 0.5f) * 0.6f) * _e585);
            let _e588 = cc;
            let _e589 = th_1;
            let _e591 = th_1;
            let _e594 = off;
            qq = (_e588 + (vec2<f32>(cos(_e589), sin(_e591)) * _e594));
            let _e598 = tc;
            KA = -(sin(_e598));
            let _e602 = tc;
            KB = cos(_e602);
            let _e605 = KA;
            let _e606 = qq;
            let _e609 = KB;
            let _e610 = qq;
            KC = -(((_e605 * _e606.x) + (_e609 * _e610.y)));
            let _e616 = s_7;
            if (_e616 < 4096f) {
                {
                    let _e619 = cP;
                    let _e622 = s_7;
                    if ((_e619 < 0f) || (_e622 < 1024f)) {
                        let _e626 = m_6;
                        let _e627 = ice_5;
                        let _e628 = pieceCover(_e626, _e627);
                        cP = _e628;
                    }
                    let _e629 = cP;
                    (*c_12) = _e629;
                    let _e630 = s_7;
                    let _e635 = (*c_12);
                    let _e640 = h_4;
                    let _e647 = (*c_12);
                    if ((_e630 < (12f + (288f * smoothstep(0.4f, 0.95f, _e635)))) || (f32((_e640 & 255u)) < (51.2f * smoothstep(0.5f, 0.9f, _e647)))) {
                        break;
                    }
                }
            }
            let _e652 = n_12;
            if (_e652 >= 11i) {
                break;
            }
            let _e657 = KA;
            let _e658 = pu;
            let _e660 = KB;
            let _e661 = pv;
            let _e664 = KC;
            if ((((_e657 * _e658) + (_e660 * _e661)) + _e664) >= 0f) {
                local_62 = 1f;
            } else {
                local_62 = -1f;
            }
            let _e672 = local_62;
            side = _e672;
            let _e674 = (*id_2);
            let _e675 = lvl;
            let _e679 = floeHash(_e674, u32(_e675), 31249u, 7997u);
            cid_4 = _e679;
            let _e681 = cid_4;
            let _e682 = (*c_12);
            let _e683 = s_7;
            let _e684 = crackOpen(_e681, _e682, _e683);
            g_4 = _e684;
            k_2 = 0i;
            i_10 = 0i;
            loop {
                let _e693 = i_10;
                if !((_e693 < POLY_MAX)) {
                    break;
                }
                {
                    let _e699 = i_10;
                    let _e700 = n_12;
                    let _e702 = k_2;
                    if ((_e699 >= _e700) || (_e702 >= POLY_MAX)) {
                        break;
                    }
                    let _e705 = i_10;
                    let _e707 = V[_e705];
                    xi_1 = _e707;
                    let _e709 = i_10;
                    let _e712 = n_12;
                    let _e715 = V[((_e709 + 1i) % _e712)];
                    xj_1 = _e715;
                    let _e717 = side;
                    let _e718 = KA;
                    let _e719 = xi_1;
                    let _e722 = KB;
                    let _e723 = xi_1;
                    let _e727 = KC;
                    di = (_e717 * (((_e718 * _e719.x) + (_e722 * _e723.y)) + _e727));
                    let _e731 = side;
                    let _e732 = KA;
                    let _e733 = xj_1;
                    let _e736 = KB;
                    let _e737 = xj_1;
                    let _e741 = KC;
                    dj = (_e731 * (((_e732 * _e733.x) + (_e736 * _e737.y)) + _e741));
                    let _e745 = di;
                    if (_e745 >= 0f) {
                        {
                            let _e748 = k_2;
                            let _e750 = xi_1;
                            W_3[_e748] = _e750;
                            let _e751 = k_2;
                            let _e753 = i_10;
                            let _e755 = EI[_e753];
                            WI[_e751] = _e755;
                            let _e756 = k_2;
                            let _e758 = i_10;
                            let _e760 = ES[_e758];
                            WS[_e756] = _e760;
                            let _e761 = k_2;
                            k_2 = (_e761 + 1i);
                        }
                    }
                    let _e764 = di;
                    let _e767 = dj;
                    let _e771 = k_2;
                    if (((_e764 >= 0f) != (_e767 >= 0f)) && (_e771 < POLY_MAX)) {
                        {
                            let _e774 = k_2;
                            let _e776 = xi_1;
                            let _e777 = xj_1;
                            let _e778 = xi_1;
                            let _e780 = di;
                            let _e781 = di;
                            let _e782 = dj;
                            W_3[_e774] = (_e776 + ((_e777 - _e778) * (_e780 / (_e781 - _e782))));
                            let _e787 = di;
                            if (_e787 >= 0f) {
                                {
                                    let _e790 = k_2;
                                    let _e792 = cid_4;
                                    WI[_e790] = _e792;
                                    let _e793 = k_2;
                                    let _e795 = g_4;
                                    WS[_e793] = _e795;
                                }
                            } else {
                                {
                                    let _e796 = k_2;
                                    let _e798 = i_10;
                                    let _e800 = EI[_e798];
                                    WI[_e796] = _e800;
                                    let _e801 = k_2;
                                    let _e803 = i_10;
                                    let _e805 = ES[_e803];
                                    WS[_e801] = _e805;
                                }
                            }
                            let _e806 = k_2;
                            k_2 = (_e806 + 1i);
                        }
                    }
                }
                continuing {
                    let _e696 = i_10;
                    i_10 = (_e696 + 1i);
                }
            }
            i_11 = 0i;
            loop {
                let _e811 = i_11;
                if !((_e811 < POLY_MAX)) {
                    break;
                }
                {
                    let _e817 = i_11;
                    let _e819 = i_11;
                    let _e821 = W_3[_e819];
                    V[_e817] = _e821;
                    let _e822 = i_11;
                    let _e824 = i_11;
                    let _e826 = WI[_e824];
                    EI[_e822] = _e826;
                    let _e827 = i_11;
                    let _e829 = i_11;
                    let _e831 = WS[_e829];
                    ES[_e827] = _e831;
                }
                continuing {
                    let _e814 = i_11;
                    i_11 = (_e814 + 1i);
                }
            }
            let _e832 = k_2;
            n_12 = _e832;
            let _e833 = (*id_2);
            let _e834 = side;
            if (_e834 > 0f) {
                local_63 = 1u;
            } else {
                local_63 = 0u;
            }
            let _e840 = local_63;
            let _e841 = lvl;
            let _e844 = floeHash(_e833, _e840, u32(_e841), 40503u);
            (*id_2) = _e844;
        }
        continuing {
            let _e361 = lvl;
            lvl = (_e361 + 1i);
        }
    }
    (*e) = 100000000000000000000f;
    (*lid_2) = 0u;
    loop {
        let _e853 = i_12;
        if !((_e853 < POLY_MAX)) {
            break;
        }
        {
            let _e859 = i_12;
            let _e860 = n_12;
            if (_e859 >= _e860) {
                break;
            }
            let _e862 = i_12;
            let _e865 = n_12;
            let _e868 = V[((_e862 + 1i) % _e865)];
            let _e869 = i_12;
            let _e871 = V[_e869];
            dv = (_e868 - _e871);
            let _e874 = dv;
            let _e875 = dv;
            if (dot(_e874, _e875) < 0.000000000000000000000001f) {
                continue;
            }
            let _e880 = b_4;
            let _e882 = dv;
            N3_[_e880] = -(_e882.y);
            let _e885 = d_6;
            let _e887 = dv;
            N3_[_e885] = _e887.x;
            let _e889 = ax;
            let _e891 = dv;
            let _e893 = i_12;
            let _e895 = V[_e893];
            let _e898 = dv;
            let _e900 = i_12;
            let _e902 = V[_e900];
            N3_[_e889] = ((_e891.y * _e895.x) - (_e898.x * _e902.y));
            let _e906 = N3_;
            N3_ = normalize(_e906);
            let _e908 = p_9;
            let _e909 = N3_;
            dn_1 = dot(_e908, _e909);
            let _e912 = dn_1;
            let _e914 = i_12;
            let _e916 = ES[_e914];
            ek = (abs(_e912) - max(_e916, 0.15f));
            let _e921 = ek;
            let _e922 = (*e);
            if (_e921 < _e922) {
                {
                    let _e924 = (*e);
                    e2_1 = _e924;
                    let _e925 = ek;
                    (*e) = _e925;
                    let _e926 = i_12;
                    let _e928 = EI[_e926];
                    (*lid_2) = _e928;
                }
            } else {
                let _e929 = ek;
                let _e930 = e2_1;
                if (_e929 < _e930) {
                    let _e932 = ek;
                    e2_1 = _e932;
                }
            }
            let _e933 = i_12;
            let _e935 = ES[_e933];
            let _e938 = dn_1;
            let _e940 = (*ridge);
            if ((_e935 < 0f) && (abs(_e938) < _e940.w)) {
                {
                    let _e944 = N3_;
                    let _e945 = dn_1;
                    let _e947 = (_e944 * sign(_e945));
                    let _e948 = dn_1;
                    (*ridge) = vec4<f32>(_e947.x, _e947.y, _e947.z, abs(_e948));
                    let _e954 = i_12;
                    let _e956 = ES[_e954];
                    rh = -(_e956);
                }
            }
        }
        continuing {
            let _e856 = i_12;
            i_12 = (_e856 + 1i);
        }
    }
    let _e959 = rh;
    if (_e959 > 0f) {
        let _e962 = rh;
        let _e965 = (*ridge);
        let _e968 = rh;
        local_64 = (_e962 * max(0f, (1f - (_e965.w / (2f * _e968)))));
    } else {
        local_64 = 0f;
    }
    let _e976 = local_64;
    (*ridge).w = _e976;
    let _e977 = m_6;
    let _e978 = ice_5;
    let _e979 = pieceCover(_e977, _e978);
    (*c_12) = _e979;
    let _e980 = s_7;
    let _e981 = (*id_2);
    let _e982 = (*c_12);
    let _e983 = floeRound(_e980, _e981, _e982);
    rr = _e983;
    let _e985 = e2_1;
    let _e986 = rr;
    if (_e985 < _e986) {
        let _e988 = rr;
        let _e989 = rr;
        let _e990 = (*e);
        let _e992 = rr;
        let _e993 = e2_1;
        (*e) = (_e988 - length(vec2<f32>((_e989 - _e990), (_e992 - _e993))));
    }
    let _e998 = s_7;
    (*size_2) = _e998;
    let _e999 = m_6;
    (*mid) = _e999;
    let _e1000 = (*c_12);
    let _e1003 = (*id_2);
    let _e1011 = (*c_12);
    (*there) = ((_e1000 > 0f) && ((f32((_e1003 & 65535u)) / 65536f) <= min(1f, (1.5f * _e1011))));
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
    let _e190 = frz_3;
    let _e191 = pDay_3;
    let _e192 = leadIce(32768u, _e190, _e191);
    leadFar = _e192;
    (*lead) = vec2(0f);
    (*ridge_1) = vec4(0f);
    let _e198 = cPix_1;
    let _e201 = ice_7;
    if ((_e198 <= 0f) && (_e201 <= 0f)) {
        return vec4(0f);
    }
    let _e207 = foot_15;
    if (_e207 >= 64f) {
        {
            let _e210 = leadFar;
            (*lead) = _e210;
            let _e211 = cPix_1;
            let _e214 = cPix_1;
            return vec4<f32>(_e211, 0f, 0.7f, _e214);
        }
    }
    let _e223 = p_11;
    let _e224 = ice_7;
    floeOf(_e223, _e224, (&id_3), (&e_1), (&lid_3), (&c_13), (&size_3), (&mid_1), (&there_1), ridge_1);
    let _e241 = there_1;
    if !(_e241) {
        (*ridge_1) = vec4(0f);
    }
    let _e245 = e_1;
    let _e246 = p_11;
    let _e247 = w_7;
    let _e249 = tri(_e246, _e247, 8f);
    let _e255 = p_11;
    let _e256 = w_7;
    let _e258 = tri(_e255, _e256, 2f);
    e_1 = (_e245 + (((_e249.x - 0.5f) * 1.6f) + ((_e258.w - 0.5f) * 0.5f)));
    let _e266 = foot_15;
    fw = max(_e266, 0.03f);
    let _e278 = size_3;
    let _e284 = id_3;
    age_2 = ((0.3f + (0.7f * smoothstep(16f, 200f, _e278))) * (0.6f + ((0.4f * f32((_e284 >> 16u))) / 65536f)));
    let _e294 = there_1;
    if _e294 {
        {
            let _e295 = e_1;
            let _e296 = fw;
            x_4 = clamp(((_e295 / _e296) + 0.5f), 0f, 1f);
            let _e306 = fw;
            let _e308 = e_1;
            rim = (1f - smoothstep(0f, (0.8f + _e306), _e308));
            let _e311 = lid_3;
            let _e312 = frz_3;
            let _e313 = pDay_3;
            let _e314 = leadIce(_e311, _e312, _e313);
            (*lead) = _e314;
        }
    }
    let _e317 = foot_15;
    kFar = smoothstep(16f, 64f, _e317);
    let _e320 = x_4;
    let _e321 = cPix_1;
    let _e322 = kFar;
    x_4 = mix(_e320, _e321, _e322);
    let _e324 = (*lead);
    let _e325 = leadFar;
    let _e326 = kFar;
    (*lead) = mix(_e324, _e325, vec2(_e326));
    let _e330 = (*ridge_1);
    let _e333 = kFar;
    (*ridge_1).w = (_e330.w * (1f - _e333));
    let _e336 = x_4;
    let _e337 = rim;
    let _e338 = x_4;
    let _e341 = kFar;
    let _e344 = age_2;
    let _e346 = kFar;
    let _e348 = c_13;
    let _e349 = cPix_1;
    let _e350 = kFar;
    return vec4<f32>(_e336, ((_e337 * _e338) * (1f - _e341)), mix(_e344, 0.7f, _e346), mix(_e348, _e349, _e350));
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
    var rel_4: vec3<f32>;
    var r_10: f32;
    var up_4: vec3<f32>;
    var dist_1: f32;
    var N_2: vec3<f32>;
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
    var V_1: vec3<f32>;
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
    var local_75: f32;
    var fallK: f32;
    var dbgWhite: f32 = 0f;
    var dn_3: vec3<f32>;
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
    var a_10: vec3<f32>;
    var flick: f32;
    var crust: f32;
    var local_88: vec3<f32>;
    var local_89: f32;

    let _e171 = vWorldPos_1;
    let _e172 = fwidth(_e171);
    foot_16 = length(_e172);
    let _e175 = vFixedPos_1;
    let _e176 = dpdx(_e175);
    dpx = _e176;
    let _e178 = vFixedPos_1;
    let _e179 = dpdy(_e178);
    dpy = _e179;
    let _e181 = vCol_1;
    let _e183 = vCol_1;
    albedo = (_e181.xyz * _e183.xyz);
    let _e187 = vCol_1;
    waterEnc = _e187.w;
    let _e190 = global.uNear;
    if (_e190.x > 0.5f) {
        {
            let _e194 = vNearRel_1;
            let _e195 = global.uNearUp;
            let _e196 = vNearRel_1;
            let _e197 = global.uNearUp;
            dn_2 = length((_e194 - (_e195 * dot(_e196, _e197))));
            let _e203 = global.uNearMode;
            if (_e203 < 0.5f) {
                {
                    let _e206 = dn_2;
                    let _e208 = global.uNear;
                    let _e212 = vShore_1;
                    if ((_e206 < (0.97f * _e208.y)) && (_e212 <= 0f)) {
                        discard;
                    }
                }
            } else {
                let _e216 = dn_2;
                let _e217 = global.uNearBand;
                let _e220 = dn_2;
                let _e221 = global.uNearBand;
                if ((_e216 < _e217.x) || (_e220 > _e221.y)) {
                    discard;
                }
            }
        }
    }
    let _e225 = vMat_1;
    veg = _e225.x;
    let _e228 = vMat_1;
    snow = _e228.y;
    let _e231 = vMat_1;
    rock = _e231.z;
    let _e234 = vMat_1;
    sand = _e234.w;
    let _e237 = vExt_1;
    emissive = _e237.x;
    let _e240 = vExt_1;
    wet = _e240.y;
    let _e243 = vExt_1;
    rough_1 = _e243.z;
    let _e246 = vWorldPos_1;
    let _e247 = global.uCenter;
    rel_4 = (_e246 - _e247);
    let _e250 = rel_4;
    r_10 = length(_e250);
    let _e253 = rel_4;
    let _e254 = r_10;
    up_4 = (_e253 / vec3(_e254));
    let _e258 = vWorldPos_1;
    dist_1 = length(_e258);
    let _e261 = vNormal_1;
    N_2 = normalize(_e261);
    let _e264 = up_4;
    let _e265 = global.uSunDir;
    muS_2 = dot(_e264, _e265);
    let _e268 = r_10;
    let _e269 = muS_2;
    let _e270 = atmoSunTransmittance(_e268, _e269);
    sunT = _e270;
    let _e272 = r_10;
    let _e273 = muS_2;
    let _e274 = atmoSkyIrradiance(_e272, _e273);
    skyE_1 = _e274;
    let _e276 = rel_4;
    let _e277 = r_10;
    let _e278 = muS_2;
    let _e279 = foot_16;
    let _e280 = sunT;
    let _e283 = cloudLight(_e276, _e277, _e278, _e279, _e280, (&skyE_1));
    cloudT = _e283;
    let _e285 = sunT;
    let _e286 = cloudT;
    sunT = (_e285 * _e286);
    let _e288 = global.uToFixed;
    let _e289 = rel_4;
    pF_3 = (_e288 * _e289);
    let _e292 = sunT;
    let _e293 = pF_3;
    let _e294 = pF_3;
    let _e296 = global.uToFixed;
    let _e297 = global.uSunDir;
    let _e299 = global.uRadius;
    let _e300 = terrainShadow(_e293, normalize(_e294), (_e296 * _e297), _e299);
    sunT = (_e292 * _e300);
    let _e302 = sunT;
    sunTop = _e302;
    let _e304 = vWorldPos_1;
    let _e305 = N_2;
    let _e306 = sunShadowMap(_e304, _e305);
    keySh = _e306;
    let _e308 = sunT;
    let _e309 = keySh;
    sunT = (_e308 * _e309);
    let _e311 = vFixedPos_1;
    fp_6 = _e311;
    let _e313 = vFixedNormal_1;
    fn_ = normalize(_e313);
    let _e316 = fn_;
    w_8 = pow(abs(_e316), vec3(4f));
    let _e322 = w_8;
    let _e323 = w_8;
    let _e325 = w_8;
    let _e328 = w_8;
    w_8 = (_e322 / vec3(((_e323.x + _e325.y) + _e328.z)));
    let _e336 = dist_1;
    fineK = (1f - smoothstep(60f, 900f, _e336));
    let _e343 = dist_1;
    midK = (1f - smoothstep(600f, 9000f, _e343));
    let _e350 = dist_1;
    farK = (1f - smoothstep(6000f, 90000f, _e350));
    let _e354 = vShore_1;
    if (_e354 > 0f) {
        local_65 = 1f;
    } else {
        local_65 = 0f;
    }
    let _e360 = local_65;
    isWater = _e360;
    let _e366 = isWater;
    if (_e366 < 0.5f) {
        discard;
    }
    let _e369 = N_2;
    let _e370 = global.uSunDir;
    ndl_1 = max(dot(_e369, _e370), 0f);
    let _e380 = isWater;
    if (_e380 > 0.5f) {
        {
            let _e383 = vWorldPos_1;
            V_1 = normalize(-(_e383));
            let _e387 = global.uToFixed;
            let _e388 = up_4;
            upF_7 = (_e387 * _e388);
            let _e391 = vLiq_1;
            if (_e391.x > 0.02f) {
                let _e395 = vLiq_1;
                let _e397 = vLiq_1;
                local_66 = (_e395.yzw / vec3(_e397.x));
            } else {
                local_66 = vec3<f32>(0f, 0.75f, 1f);
            }
            let _e406 = local_66;
            lq = _e406;
            let _e408 = lq;
            kind_4 = _e408.x;
            let _e411 = lq;
            Tm_2 = ((_e411.y * 120f) - 60f);
            let _e418 = kind_4;
            let _e421 = kind_4;
            river_3 = ((_e418 > 0.55f) && (_e421 < 0.85f));
            let _e426 = river_3;
            if _e426 {
                let _e427 = lq;
                local_67 = _e427.z;
            } else {
                local_67 = 0f;
            }
            let _e431 = local_67;
            flow_4 = _e431;
            let _e433 = kind_4;
            if (_e433 < 0.2f) {
                local_70 = 1f;
            } else {
                let _e437 = river_3;
                if _e437 {
                    local_69 = 0.2f;
                } else {
                    let _e439 = kind_4;
                    if (_e439 > 0.85f) {
                        local_68 = 0.05f;
                    } else {
                        let _e443 = lq;
                        local_68 = _e443.z;
                    }
                    let _e446 = local_68;
                    local_69 = _e446;
                }
                let _e448 = local_69;
                local_70 = _e448;
            }
            let _e450 = local_70;
            fetch_2 = _e450;
            let _e452 = waterEnc;
            let _e453 = waterEnc;
            let _e459 = vShore_1;
            depthW = (((_e452 * _e453) * 6000f) * smoothstep(0f, 0.125f, _e459));
            let _e463 = fp_6;
            let _e464 = w_8;
            let _e466 = tri(_e463, _e464, 512f);
            nW = _e466;
            let _e468 = fp_6;
            let _e469 = w_8;
            let _e471 = tri(_e468, _e469, 64f);
            nG = _e471;
            let _e473 = nW;
            let _e477 = nW;
            wn_2 = (vec2<f32>((_e473.x - 0.5f), (_e477.w - 0.5f)) * 2f);
            let _e485 = nG;
            let _e487 = nG;
            let _e489 = nW;
            let _e491 = nW;
            grp_4 = clamp(((vec4<f32>(_e485.x, _e487.w, _e489.w, _e491.x) * 1.6f) - vec4(0.3f)), vec4(0f), vec4(1f));
            let _e508 = vFlw_1;
            fv_2 = (max(_e508.w, 0f) * 9f);
            let _e515 = fp_6;
            let _e516 = fn_;
            let _e517 = upF_7;
            let _e518 = kind_4;
            let _e519 = flow_4;
            let _e520 = fetch_2;
            let _e521 = depthW;
            let _e522 = foot_16;
            let _e523 = wn_2;
            let _e524 = grp_4;
            let _e525 = vFlw_1;
            let _e527 = fv_2;
            liquidSurface(_e515, _e516, _e517, _e518, _e519, _e520, _e521, _e522, _e523, _e524, _e525.xyz, _e527, (&nF_1), (&wr), (&foam_1));
            let _e534 = Tm_2;
            let _e535 = kind_4;
            let _e536 = flow_4;
            let _e537 = upF_7;
            let _e538 = liquidTs(_e534, _e535, _e536, _e537);
            tsf = _e538;
            let _e541 = tsf;
            let _e545 = tsf;
            let _e549 = tsf;
            ice_8 = (1f - smoothstep((_e541.y - 4f), (_e545.y + 4f), _e549.x));
            let _e554 = kind_4;
            let _e557 = ice_8;
            if ((_e554 < 0.2f) && (_e557 > 0f)) {
                let _e561 = ice_8;
                let _e562 = nW;
                let _e564 = nG;
                let _e566 = seaIceCover(_e561, _e562.w, _e564.x);
                local_71 = _e566;
            } else {
                local_71 = 0f;
            }
            let _e569 = local_71;
            iceC = _e569;
            let _e571 = global.uSeason;
            if (_e571.z > 0.5f) {
                let _e576 = upF_7;
                let _e577 = seasonYear(_e576);
                let _e581 = global.uSeason;
                local_72 = (((12f * _e577.z) * DDF_SNOW) / max(_e581.y, 1f));
            } else {
                local_72 = 0f;
            }
            let _e588 = local_72;
            pDay_4 = _e588;
            let _e593 = global.uSeason;
            if (_e593.z > 0.5f) {
                let _e597 = Tm_2;
                let _e598 = upF_7;
                let _e599 = seasonIceNow(_e598);
                local_73 = (_e597 + _e599);
            } else {
                let _e601 = tsf;
                local_73 = _e601.x;
            }
            let _e604 = local_73;
            Tair_2 = _e604;
            let _e609 = kind_4;
            if (_e609 < 0.2f) {
                let _e612 = pF_3;
                let _e613 = upF_7;
                let _e614 = w_8;
                let _e615 = ice_8;
                let _e616 = iceC;
                let _e617 = foot_16;
                let _e618 = tsf;
                let _e620 = Tair_2;
                let _e624 = pDay_4;
                let _e629 = seaFloes(_e612, _e613, _e614, _e615, _e616, _e617, max((_e618.y - _e620), 0f), _e624, (&lead_1), (&ridge_2));
                local_74 = _e629;
            } else {
                let _e630 = ice_8;
                local_74 = vec4<f32>(_e630, 0f, 1f, 0f);
            }
            let _e636 = local_74;
            fl = _e636;
            let _e640 = iceC;
            let _e641 = fl;
            calm = smoothstep(0.05f, 0.6f, max(_e640, _e641.w));
            let _e646 = nF_1;
            let _e647 = upF_7;
            let _e649 = calm;
            nF_1 = normalize(mix(_e646, _e647, vec3((0.9f * _e649))));
            let _e654 = wr;
            let _e657 = calm;
            wr = (_e654 * (1f - (0.8f * _e657)));
            let _e661 = foam_1;
            let _e663 = calm;
            foam_1 = (_e661 * (1f - _e663));
            let _e666 = river_3;
            if _e666 {
                let _e667 = nF_1;
                let _e668 = fn_;
                let _e672 = fn_;
                let _e673 = upF_7;
                nF_1 = normalize(mix(_e667, _e668, vec3(smoothstep(0.13f, 0.3f, (1f - dot(_e672, _e673))))));
            }
            let _e680 = river_3;
            let _e681 = global.uLiquid2_;
            if (_e680 && (_e681.y > 0.9f)) {
                let _e686 = albedo;
                let _e693 = fv_2;
                albedo = mix(_e686, vec3<f32>(0.055f, 0.045f, 0.025f), vec3(clamp((0.25f + (0.3f * _e693)), 0f, 0.75f)));
            }
            let _e701 = global.uToFixed;
            let _e703 = nF_1;
            Nw = normalize((transpose(_e701) * _e703));
            let _e707 = Nw;
            let _e708 = V_1;
            let _e711 = Nw;
            let _e712 = V_1;
            Nw = normalize((_e707 + (_e708 * max(0f, (0.02f - dot(_e711, _e712))))));
            let _e719 = Nw;
            let _e720 = V_1;
            NdV = max(dot(_e719, _e720), 0.001f);
            let _e725 = Nw;
            let _e726 = global.uSunDir;
            ndlW = max(dot(_e725, _e726), 0f);
            let _e731 = global.uLiquid;
            F0_ = _e731.x;
            let _e734 = F0_;
            let _e736 = wr;
            let _e738 = F0_;
            let _e740 = F0_;
            let _e743 = NdV;
            F = (_e734 + ((max((1f - _e736), _e738) - _e740) * pow((1f - _e743), 5f)));
            let _e750 = V_1;
            let _e752 = Nw;
            R_3 = reflect(-(_e750), _e752);
            let _e755 = R_3;
            let _e756 = up_4;
            el = max(dot(_e755, _e756), 0f);
            let _e764 = el;
            let _e773 = el;
            let _e778 = cloudT;
            skyG = mix((0.7f + (1.1f * pow((1f - _e764), 3f))), (0.4286f * (1f + (2f * _e773))), clamp((1f - _e778), 0f, 1f));
            let _e785 = global.uSunE;
            let _e786 = skyE_1;
            let _e791 = skyG;
            let _e793 = global.uSunE;
            let _e794 = sunT;
            let _e798 = R_3;
            let _e799 = global.uSunDir;
            skyRefl = ((((_e785 * _e786) / vec3(3.1415927f)) * _e791) + (((_e793 * _e794) * 0.05f) * pow(max(dot(_e798, _e799), 0f), 12f)));
            let _e808 = global.uMoonE;
            if (_e808.y > 0f) {
                {
                    let _e812 = up_4;
                    let _e813 = global.uMoonDir;
                    muMr = dot(_e812, _e813);
                    let _e816 = skyRefl;
                    let _e817 = global.uMoonE;
                    let _e818 = r_10;
                    let _e819 = muMr;
                    let _e820 = atmoSkyIrradiance(_e818, _e819);
                    let _e825 = skyG;
                    let _e827 = global.uMoonE;
                    let _e828 = r_10;
                    let _e829 = muMr;
                    let _e832 = atmoSunTransmittance(_e828, max(_e829, 0f));
                    let _e836 = R_3;
                    let _e837 = global.uMoonDir;
                    skyRefl = (_e816 + ((((_e817 * _e820) / vec3(3.1415927f)) * _e825) + (((_e827 * _e832) * 0.05f) * pow(max(dot(_e836, _e837), 0f), 12f))));
                }
            }
            let _e846 = albedo;
            let _e850 = global.uSunE;
            let _e851 = sunT;
            let _e853 = muS_2;
            let _e859 = global.uSunE;
            let _e860 = skyE_1;
            body = ((_e846 / vec3(3.1415927f)) * ((((_e850 * _e851) * max(_e853, 0f)) * 0.6f) + ((_e859 * _e860) * 0.5f)));
            let _e867 = river_3;
            let _e868 = global.uLiquid2_;
            if (_e867 && (_e868.y > 0.9f)) {
                {
                    let _e874 = fv_2;
                    let _e876 = fv_2;
                    let _e878 = fv_2;
                    ssc = clamp((((30f * _e874) * _e876) * _e878), 0.5f, 3000f);
                    let _e884 = global.uLiquid3_;
                    let _e886 = ssc;
                    let _e893 = global.uLiquid3_;
                    a_9 = ((_e884.xyz + (_e886 * vec3<f32>(0.012f, 0.02f, 0.035f))) + (_e893.w * vec3<f32>(0.078f, 0.207f, 0.687f)));
                    let _e905 = ssc;
                    bb = vec3((0.00475f * _e905));
                    let _e910 = bb;
                    let _e912 = a_9;
                    let _e913 = bb;
                    let _e919 = global.uSunE;
                    let _e920 = sunT;
                    let _e922 = muS_2;
                    let _e926 = global.uSunE;
                    let _e927 = skyE_1;
                    body = ((((0.33f * _e910) / (_e912 + _e913)) / vec3(3.1415927f)) * (((_e919 * _e920) * max(_e922, 0f)) + (_e926 * _e927)));
                }
            }
            let _e931 = V_1;
            let _e932 = global.uSunDir;
            H_1 = normalize((_e931 + _e932));
            let _e936 = wr;
            let _e937 = wr;
            let _e939 = wr;
            let _e941 = wr;
            a2_ = (((_e936 * _e937) * _e939) * _e941);
            let _e944 = a2_;
            a2s = max(_e944, 0.0000001f);
            let _e948 = Nw;
            let _e949 = H_1;
            NdH = max(dot(_e948, _e949), 0f);
            let _e954 = V_1;
            let _e955 = H_1;
            VdH = max(dot(_e954, _e955), 0f);
            let _e960 = a2s;
            let _e961 = NdH;
            let _e962 = NdH;
            let _e964 = a2s;
            Dg = (_e960 / (PI * pow((((_e961 * _e962) * (_e964 - 1f)) + 1f), 2f)));
            let _e975 = wr;
            let _e978 = wr;
            kg = (((_e975 + 1f) * (_e978 + 1f)) / 8f);
            let _e985 = NdV;
            let _e986 = NdV;
            let _e988 = kg;
            let _e991 = kg;
            let _e994 = ndlW;
            let _e996 = ndlW;
            let _e998 = kg;
            let _e1001 = kg;
            Gg = (((_e985 / ((_e986 * (1f - _e988)) + _e991)) * _e994) / ((_e996 * (1f - _e998)) + _e1001));
            let _e1005 = F0_;
            let _e1007 = F0_;
            let _e1010 = VdH;
            Fs = (_e1005 + ((1f - _e1007) * pow((1f - _e1010), 5f)));
            let _e1017 = body;
            let _e1019 = F;
            let _e1022 = skyRefl;
            let _e1023 = F;
            let _e1026 = global.uSunE;
            let _e1027 = sunT;
            let _e1029 = Dg;
            let _e1031 = Gg;
            let _e1033 = Fs;
            let _e1036 = NdV;
            let _e1041 = muS_2;
            color = (((_e1017 * (1f - _e1019)) + (_e1022 * _e1023)) + ((((((_e1026 * _e1027) * _e1029) * _e1031) * _e1033) / vec3((4f * _e1036))) * step(0f, _e1041)));
            let _e1045 = global.uMoonE;
            if (_e1045.y > 0f) {
                {
                    let _e1049 = up_4;
                    let _e1050 = global.uMoonDir;
                    muMn = dot(_e1049, _e1050);
                    let _e1053 = muMn;
                    if (_e1053 > -0.02f) {
                        {
                            let _e1057 = V_1;
                            let _e1058 = global.uMoonDir;
                            Hm = normalize((_e1057 + _e1058));
                            let _e1062 = Nw;
                            let _e1063 = Hm;
                            NdHm = max(dot(_e1062, _e1063), 0f);
                            let _e1068 = V_1;
                            let _e1069 = Hm;
                            VdHm = max(dot(_e1068, _e1069), 0f);
                            let _e1074 = Nw;
                            let _e1075 = global.uMoonDir;
                            ndlM = max(dot(_e1074, _e1075), 0f);
                            let _e1080 = a2s;
                            let _e1081 = NdHm;
                            let _e1082 = NdHm;
                            let _e1084 = a2s;
                            Dm = (_e1080 / (PI * pow((((_e1081 * _e1082) * (_e1084 - 1f)) + 1f), 2f)));
                            let _e1095 = NdV;
                            let _e1096 = NdV;
                            let _e1098 = kg;
                            let _e1101 = kg;
                            let _e1104 = ndlM;
                            let _e1106 = ndlM;
                            let _e1108 = kg;
                            let _e1111 = kg;
                            Gm = (((_e1095 / ((_e1096 * (1f - _e1098)) + _e1101)) * _e1104) / ((_e1106 * (1f - _e1108)) + _e1111));
                            let _e1115 = F0_;
                            let _e1117 = F0_;
                            let _e1120 = VdHm;
                            Fm = (_e1115 + ((1f - _e1117) * pow((1f - _e1120), 5f)));
                            let _e1127 = color;
                            let _e1128 = global.uMoonE;
                            let _e1129 = r_10;
                            let _e1130 = muMn;
                            let _e1133 = atmoSunTransmittance(_e1129, max(_e1130, 0f));
                            let _e1135 = cloudDirZ;
                            let _e1137 = Dm;
                            let _e1139 = Gm;
                            let _e1141 = Fm;
                            let _e1144 = NdV;
                            color = (_e1127 + ((((((_e1128 * _e1133) * _e1135) * _e1137) * _e1139) * _e1141) / vec3((4f * _e1144))));
                        }
                    }
                }
            }
            let _e1149 = global.uSunE;
            let _e1150 = sunT;
            let _e1152 = up_4;
            let _e1153 = global.uSunDir;
            let _e1158 = global.uSunE;
            let _e1159 = skyE_1;
            lit_1 = (((_e1149 * _e1150) * max(dot(_e1152, _e1153), 0f)) + (_e1158 * _e1159));
            let _e1163 = river_3;
            if _e1163 {
                let _e1167 = fn_;
                let _e1168 = upF_7;
                local_75 = smoothstep(0.13f, 0.3f, (1f - dot(_e1167, _e1168)));
            } else {
                local_75 = 0f;
            }
            let _e1174 = local_75;
            fallK = _e1174;
            let _e1178 = fallK;
            if (_e1178 > 0f) {
                {
                    let _e1181 = upF_7;
                    let _e1182 = fn_;
                    let _e1183 = upF_7;
                    let _e1184 = fn_;
                    dn_3 = (_e1181 - (_e1182 * dot(_e1183, _e1184)));
                    let _e1189 = dn_3;
                    let _e1191 = dn_3;
                    down = (-(_e1189) / vec3(max(length(_e1191), 0.0001f)));
                    let _e1198 = fn_;
                    let _e1199 = down;
                    acr = normalize(cross(_e1198, _e1199));
                    let _e1203 = global.uFallTop;
                    if (_e1203 > 0f) {
                        let _e1206 = global.uFallTop;
                        let _e1207 = r_10;
                        local_76 = max((_e1206 - _e1207), 0f);
                    } else {
                        local_76 = 4f;
                    }
                    let _e1213 = local_76;
                    zf = _e1213;
                    let _e1216 = global.uFall1_;
                    let _e1219 = zf;
                    let _e1224 = global.uFall1_;
                    v_1 = min((sqrt(((2f * _e1216.x) * _e1219)) + 0.3f), _e1224.y);
                    let _e1228 = global.uTime;
                    t1_ = fract((_e1228 * 0.4f));
                    let _e1233 = global.uTime;
                    t2_ = fract(((_e1233 * 0.4f) + 0.5f));
                    let _e1242 = t1_;
                    wa_2 = (1f - abs(((2f * _e1242) - 1f)));
                    let _e1251 = v_1;
                    L_7 = (1f + (0.12f * _e1251));
                    let _e1255 = vFixedPos_1;
                    let _e1256 = global.uOriginMod;
                    let _e1258 = global.uFallTop;
                    if (_e1258 > 0f) {
                        let _e1261 = global.uFallFoot;
                        local_77 = _e1261;
                    } else {
                        local_77 = vec3(0f);
                    }
                    let _e1265 = local_77;
                    pS = ((_e1255 - _e1256) - _e1265);
                    let _e1268 = pS;
                    let _e1269 = acr;
                    let _e1273 = pS;
                    let _e1274 = down;
                    let _e1277 = L_7;
                    q_6 = vec2<f32>((dot(_e1268, _e1269) / 4.8f), (dot(_e1273, _e1274) / (48f * _e1277)));
                    let _e1282 = v_1;
                    let _e1286 = L_7;
                    dv_1 = ((_e1282 * 2.5f) / (48f * _e1286));
                    let _e1290 = q_6;
                    let _e1292 = dv_1;
                    let _e1293 = t1_;
                    qA = (_e1290 - vec2<f32>(0f, (_e1292 * _e1293)));
                    let _e1298 = q_6;
                    let _e1304 = dv_1;
                    let _e1305 = t2_;
                    qB = ((_e1298 + vec2<f32>(0.37f, 0f)) - vec2<f32>(0f, (_e1304 * _e1305)));
                    let _e1310 = qA;
                    let _e1312 = textureSampleLevel(tDetailTexture, tDetailSampler, _e1310, 0f);
                    bA = _e1312.x;
                    let _e1315 = qB;
                    let _e1317 = textureSampleLevel(tDetailTexture, tDetailSampler, _e1315, 0f);
                    bB = _e1317.x;
                    let _e1320 = bA;
                    let _e1322 = q_6;
                    let _e1333 = dv_1;
                    let _e1335 = t1_;
                    let _e1340 = textureSampleLevel(tDetailTexture, tDetailSampler, (((_e1322 * vec2<f32>(3f, 2f)) + vec2<f32>(0.53f, 0f)) - vec2<f32>(0f, ((2f * _e1333) * _e1335))), 0f);
                    sA = (_e1320 + (0.45f * _e1340.x));
                    let _e1345 = bB;
                    let _e1347 = q_6;
                    let _e1358 = dv_1;
                    let _e1360 = t2_;
                    let _e1365 = textureSampleLevel(tDetailTexture, tDetailSampler, (((_e1347 * vec2<f32>(3f, 2f)) + vec2<f32>(0.11f, 0f)) - vec2<f32>(0f, ((2f * _e1358) * _e1360))), 0f);
                    sB = (_e1345 + (0.45f * _e1365.x));
                    let _e1371 = sB;
                    let _e1372 = sA;
                    let _e1373 = wa_2;
                    st_2 = clamp((0.5f + ((mix(_e1371, _e1372, _e1373) - 0.725f) * 2.2f)), 0f, 1f);
                    let _e1384 = qB;
                    let _e1390 = textureSampleLevel(tDetailTexture, tDetailSampler, (_e1384 + vec2<f32>(0.031f, 0f)), 0f);
                    let _e1392 = bB;
                    let _e1394 = qA;
                    let _e1400 = textureSampleLevel(tDetailTexture, tDetailSampler, (_e1394 + vec2<f32>(0.031f, 0f)), 0f);
                    let _e1402 = bA;
                    let _e1404 = wa_2;
                    gS = (mix((_e1390.x - _e1392), (_e1400.x - _e1402), _e1404) / 0.15f);
                    let _e1411 = vFlw_1;
                    qU = max((_e1411.w * 9f), 0.3f);
                    let _e1418 = zf;
                    let _e1420 = qU;
                    br = clamp((_e1418 / (6f * pow(_e1420, 0.32f))), 0f, 1f);
                    let _e1431 = global.uFall2_;
                    let _e1436 = zf;
                    aer = (mix(0.25f, 0.95f, _e1431.y) * smoothstep(0f, 0.5f, _e1436));
                    let _e1442 = br;
                    th_2 = mix(0.72f, 0.22f, _e1442);
                    let _e1445 = th_2;
                    let _e1448 = th_2;
                    let _e1451 = st_2;
                    let _e1453 = edge;
                    jets = smoothstep((_e1445 - 0.14f), (_e1448 + 0.14f), (_e1451 + (0.75f * (_e1453 - 1f))));
                    let _e1460 = aer;
                    let _e1461 = jets;
                    white = clamp((_e1460 * _e1461), 0f, 1f);
                    let _e1467 = white;
                    dbgWhite = _e1467;
                    let _e1468 = Nw;
                    let _e1469 = global.uToFixed;
                    let _e1471 = acr;
                    let _e1473 = gS;
                    nS = normalize((_e1468 + ((transpose(_e1469) * _e1471) * clamp((_e1473 * 1.6f), -0.9f, 0.9f))));
                    let _e1484 = global.uSunE;
                    let _e1485 = sunT;
                    let _e1487 = nS;
                    let _e1488 = global.uSunDir;
                    let _e1493 = global.uSunE;
                    let _e1494 = skyE_1;
                    litS = (((_e1484 * _e1485) * max(dot(_e1487, _e1488), 0f)) + ((_e1493 * _e1494) * 0.6f));
                    let _e1504 = st_2;
                    albS = mix(0.5f, 0.92f, smoothstep(0.15f, 0.85f, _e1504));
                    let _e1508 = color;
                    let _e1509 = color;
                    let _e1512 = albS;
                    let _e1517 = litS;
                    let _e1519 = white;
                    let _e1522 = fallK;
                    color = mix(_e1508, mix((_e1509 * 0.8f), ((vec3(_e1512) / vec3(3.1415927f)) * _e1517), vec3(_e1519)), vec3(_e1522));
                    let _e1525 = foam_1;
                    let _e1527 = fallK;
                    foam_1 = (_e1525 * (1f - _e1527));
                }
            }
            let _e1530 = global.uFallTop;
            if (_e1530 > 0f) {
                {
                    let _e1533 = vFixedPos_1;
                    let _e1534 = global.uOriginMod;
                    let _e1536 = global.uFallFoot;
                    Lf = ((_e1533 - _e1534) - _e1536);
                    let _e1540 = global.uFallAcr;
                    let _e1541 = global.uFallAcr;
                    hasA = step(0.5f, dot(_e1540, _e1541));
                    let _e1545 = Lf;
                    let _e1546 = global.uFallAcr;
                    let _e1550 = global.uFallW;
                    let _e1553 = global.uFallW;
                    let _e1556 = hasA;
                    al_2 = (clamp(dot(_e1545, _e1546), (-0.5f * _e1550), (0.5f * _e1553)) * _e1556);
                    let _e1559 = Lf;
                    let _e1560 = global.uFallAcr;
                    let _e1561 = al_2;
                    let _e1565 = global.uFallW;
                    let _e1574 = global.uFallW;
                    let _e1577 = hasA;
                    dF = (length((_e1559 - (_e1560 * _e1561))) / mix(max(((_e1565 * 1.2f) + 2f), 2f), (3f + (0.15f * _e1574)), _e1577));
                    let _e1581 = vFlw_1;
                    flL = length(_e1581.xyz);
                    let _e1585 = flL;
                    if (_e1585 > 0.0001f) {
                        let _e1588 = vFlw_1;
                        let _e1590 = flL;
                        local_78 = (_e1588.xyz / vec3(_e1590));
                    } else {
                        let _e1593 = upF_7;
                        local_78 = normalize((cross(_e1593, vec3<f32>(0f, 0f, 1f)) + vec3<f32>(0.0001f, 0f, 0f)));
                    }
                    let _e1606 = local_78;
                    fd_1 = _e1606;
                    let _e1608 = upF_7;
                    let _e1609 = fd_1;
                    fa_1 = normalize(cross(_e1608, _e1609));
                    let _e1613 = Lf;
                    let _e1614 = fa_1;
                    let _e1616 = Lf;
                    let _e1617 = fd_1;
                    let _e1619 = global.uTime;
                    let _e1620 = flL;
                    q2_ = (vec2<f32>(dot(_e1613, _e1614), (dot(_e1616, _e1617) - (_e1619 * max((_e1620 * 9f), 0.4f)))) * 0.18f);
                    let _e1631 = q2_;
                    let _e1633 = textureSampleLevel(tDetailTexture, tDetailSampler, _e1631, 0f);
                    let _e1637 = q2_;
                    let _e1644 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e1637 * 2.7f) + vec2(0.31f)), 0f);
                    fz = ((_e1633.x * 0.65f) + (_e1644.w * 0.35f));
                    let _e1653 = dF;
                    core = (1f - smoothstep(0.05f, 0.45f, _e1653));
                    let _e1660 = dF;
                    ring_1 = (1f - smoothstep(0.2f, 1f, _e1660));
                    let _e1664 = core;
                    let _e1667 = ring_1;
                    let _e1670 = ring_1;
                    let _e1674 = fz;
                    fm = max((_e1664 * 0.9f), (_e1667 * smoothstep((0.55f - (0.3f * _e1670)), 0.8f, _e1674)));
                    let _e1679 = foam_1;
                    let _e1680 = fm;
                    let _e1683 = global.uFall2_;
                    let _e1688 = fallK;
                    foam_1 = max(_e1679, ((_e1680 * mix(0.35f, 0.95f, _e1683.y)) * (1f - _e1688)));
                }
            }
            let _e1692 = color;
            let _e1703 = lit_1;
            let _e1705 = foam_1;
            color = mix(_e1692, (vec3<f32>(0.23873241f, 0.23873241f, 0.23873241f) * _e1703), vec3(clamp(_e1705, 0f, 1f)));
            let _e1711 = ice_8;
            if (_e1711 > 0f) {
                {
                    let _e1714 = nW;
                    dI = _e1714;
                    let _e1716 = nG;
                    dJ = _e1716;
                    let _e1718 = kind_4;
                    if (_e1718 < 0.2f) {
                        {
                            let _e1723 = lead_1;
                            let _e1727 = fl;
                            lIce = (smoothstep(0.3f, 1.5f, _e1723.x) * (1f - _e1727.x));
                            let _e1735 = lead_1;
                            let _e1754 = lead_1;
                            lAlb = mix((vec3((0.07f + (0.33f * (1f - exp((-(_e1735.x) / 10f)))))) * vec3<f32>(0.92f, 0.97f, 1f)), vec3<f32>(0.82f, 0.86f, 0.9f), vec3(_e1754.y));
                            let _e1759 = color;
                            let _e1760 = lAlb;
                            let _e1764 = global.uSunE;
                            let _e1765 = sunT;
                            let _e1767 = muS_2;
                            let _e1771 = global.uSunE;
                            let _e1772 = skyE_1;
                            let _e1776 = lIce;
                            color = mix(_e1759, ((_e1760 / vec3(3.1415927f)) * (((_e1764 * _e1765) * max(_e1767, 0f)) + (_e1771 * _e1772))), vec3(_e1776));
                            let _e1779 = albedo;
                            let _e1780 = lAlb;
                            let _e1781 = lIce;
                            albedo = mix(_e1779, _e1780, vec3(_e1781));
                        }
                    }
                    let _e1784 = fl;
                    ice_8 = _e1784.x;
                    let _e1786 = global.uSeason;
                    if (_e1786.z > 0.5f) {
                        let _e1793 = Tair_2;
                        local_79 = smoothstep(-1f, 2f, _e1793);
                    } else {
                        local_79 = 0f;
                    }
                    let _e1797 = local_79;
                    thaw = _e1797;
                    let _e1801 = fl;
                    let _e1803 = dJ;
                    let _e1813 = fl;
                    let _e1816 = fl;
                    let _e1825 = thaw;
                    snowy = ((smoothstep(0.3f, 0.7f, (_e1801.z + ((_e1803.w - 0.5f) * 0.25f))) * (1f - ((0.7f * _e1813.y) / max(_e1816.x, 0.001f)))) * (1f - (0.7f * _e1825)));
                    let _e1838 = snowy;
                    let _e1843 = dI;
                    iceAlb = (mix(vec3<f32>(0.42f, 0.52f, 0.6f), vec3<f32>(0.82f, 0.86f, 0.9f), vec3(_e1838)) * (0.9f + (0.2f * _e1843.x)));
                    let _e1849 = global.uSeason;
                    if (_e1849.z > 0.5f) {
                        let _e1853 = Tair_2;
                        let _e1854 = dJ;
                        let _e1858 = fp_6;
                        let _e1859 = w_8;
                        let _e1861 = tri(_e1858, _e1859, 8f);
                        let _e1866 = meltPond(_e1853, ((_e1854.x * 0.6f) + (_e1861.x * 0.4f)));
                        let _e1870 = ridge_2;
                        local_80 = (_e1866 * (1f - smoothstep(0f, 0.2f, _e1870.w)));
                    } else {
                        local_80 = 0f;
                    }
                    let _e1877 = local_80;
                    pond_1 = _e1877;
                    let _e1879 = iceAlb;
                    let _e1884 = pond_1;
                    iceAlb = mix(_e1879, vec3<f32>(0.12f, 0.32f, 0.45f), vec3(_e1884));
                    let _e1887 = up_4;
                    let _e1888 = N_2;
                    N2_ = normalize(mix(_e1887, _e1888, vec3(0.5f)));
                    let _e1894 = ridge_2;
                    if (_e1894.w > 0f) {
                        {
                            let _e1898 = fp_6;
                            let _e1899 = w_8;
                            let _e1901 = tri(_e1898, _e1899, 2f);
                            blk = _e1901.x;
                            let _e1904 = iceAlb;
                            let _e1915 = blk;
                            let _e1921 = ridge_2;
                            iceAlb = mix(_e1904, mix(vec3<f32>(0.5f, 0.62f, 0.7f), vec3<f32>(0.85f, 0.88f, 0.92f), vec3(smoothstep(0.35f, 0.6f, _e1915))), vec3(smoothstep(0f, 0.2f, _e1921.w)));
                            let _e1926 = N2_;
                            let _e1927 = global.uToFixed;
                            let _e1929 = ridge_2;
                            let _e1936 = ridge_2;
                            N2_ = normalize((_e1926 + (((transpose(_e1927) * _e1929.xyz) * 0.5f) * smoothstep(0f, 0.1f, _e1936.w))));
                        }
                    }
                    let _e1942 = iceAlb;
                    let _e1946 = global.uSunE;
                    let _e1947 = sunT;
                    let _e1949 = N2_;
                    let _e1950 = global.uSunDir;
                    let _e1955 = global.uSunE;
                    let _e1956 = skyE_1;
                    let _e1960 = N2_;
                    let _e1961 = up_4;
                    iceCol = ((_e1942 / vec3(3.1415927f)) * (((_e1946 * _e1947) * max(dot(_e1949, _e1950), 0f)) + ((_e1955 * _e1956) * (0.5f + (0.5f * dot(_e1960, _e1961))))));
                    let _e1969 = N2_;
                    let _e1970 = H_1;
                    NdH2_ = max(dot(_e1969, _e1970), 0f);
                    let _e1975 = iceCol;
                    let _e1976 = global.uSunE;
                    let _e1977 = sunT;
                    let _e1979 = NdH2_;
                    let _e1982 = snowy;
                    let _e1989 = muS_2;
                    iceCol = (_e1975 + ((((_e1976 * _e1977) * pow(_e1979, mix(400f, 40f, _e1982))) * 0.04f) * step(0f, _e1989)));
                    let _e1993 = iceCol;
                    let _e1994 = global.uSunE;
                    let _e1995 = sunT;
                    let _e1997 = up_4;
                    let _e1998 = N2_;
                    let _e2003 = H_1;
                    let _e2012 = pond_1;
                    let _e2015 = muS_2;
                    iceCol = (_e1993 + (((((_e1994 * _e1995) * pow(max(dot(normalize(mix(_e1997, _e1998, vec3(0.2f))), _e2003), 0f), 600f)) * 0.4f) * _e2012) * step(0f, _e2015)));
                    let _e2019 = color;
                    let _e2020 = iceCol;
                    let _e2021 = ice_8;
                    color = mix(_e2019, _e2020, vec3(_e2021));
                    let _e2024 = albedo;
                    let _e2025 = iceAlb;
                    let _e2026 = ice_8;
                    albedo = mix(_e2024, _e2025, vec3(_e2026));
                }
            }
            let _e2029 = fallK;
            if (_e2029 > 0f) {
                {
                    let _e2033 = tsf;
                    let _e2037 = tsf;
                    let _e2041 = tsf;
                    iceF = (1f - smoothstep((_e2033.y - 12f), (_e2037.y - 4f), _e2041.x));
                    let _e2046 = iceF;
                    if (_e2046 > 0f) {
                        {
                            let _e2049 = upF_7;
                            let _e2050 = fn_;
                            let _e2051 = upF_7;
                            let _e2052 = fn_;
                            dnI = (_e2049 - (_e2050 * dot(_e2051, _e2052)));
                            let _e2057 = dnI;
                            let _e2059 = dnI;
                            downI = (-(_e2057) / vec3(max(length(_e2059), 0.0001f)));
                            let _e2066 = fn_;
                            let _e2067 = downI;
                            acrI = normalize(cross(_e2066, _e2067));
                            let _e2071 = vFixedPos_1;
                            let _e2072 = global.uOriginMod;
                            let _e2074 = global.uFallTop;
                            if (_e2074 > 0f) {
                                let _e2077 = global.uFallFoot;
                                local_81 = _e2077;
                            } else {
                                local_81 = vec3(0f);
                            }
                            let _e2081 = local_81;
                            pI = ((_e2071 - _e2072) - _e2081);
                            let _e2084 = pI;
                            let _e2085 = acrI;
                            let _e2087 = pI;
                            let _e2088 = downI;
                            qi = vec2<f32>(dot(_e2084, _e2085), dot(_e2087, _e2088));
                            let _e2092 = qi;
                            let _e2096 = qi;
                            qa_1 = vec2<f32>((_e2092.x * 0.2f), (_e2096.y * 0.015f));
                            let _e2102 = qi;
                            let _e2108 = qi;
                            qb_1 = vec2<f32>(((_e2102.x * 0.6f) + 0.3f), (_e2108.y * 0.04f));
                            let _e2114 = qa_1;
                            let _e2116 = textureSampleLevel(tDetailTexture, tDetailSampler, _e2114, 0f);
                            let _e2120 = qb_1;
                            let _e2122 = textureSampleLevel(tDetailTexture, tDetailSampler, _e2120, 0f);
                            cols = ((_e2116.x * 0.6f) + (_e2122.w * 0.4f));
                            let _e2128 = qa_1;
                            let _e2134 = textureSampleLevel(tDetailTexture, tDetailSampler, (_e2128 + vec2<f32>(0.01f, 0f)), 0f);
                            let _e2138 = qb_1;
                            let _e2144 = textureSampleLevel(tDetailTexture, tDetailSampler, (_e2138 + vec2<f32>(0.03f, 0f)), 0f);
                            colsX = ((_e2134.x * 0.6f) + (_e2144.w * 0.4f));
                            let _e2152 = cols;
                            thick = smoothstep(0.35f, 0.7f, _e2152);
                            let _e2163 = thick;
                            alb = mix(vec3<f32>(0.2f, 0.4f, 0.56f), vec3<f32>(0.88f, 0.93f, 0.97f), vec3(_e2163));
                            let _e2167 = Nw;
                            let _e2168 = global.uToFixed;
                            let _e2170 = acrI;
                            let _e2172 = colsX;
                            let _e2173 = cols;
                            nI = normalize((_e2167 - (((transpose(_e2168) * _e2170) * (_e2172 - _e2173)) * 30f)));
                            let _e2181 = global.uSunE;
                            let _e2182 = sunT;
                            let _e2184 = nI;
                            let _e2185 = global.uSunDir;
                            let _e2190 = global.uSunE;
                            let _e2191 = skyE_1;
                            litI = (((_e2181 * _e2182) * max(dot(_e2184, _e2185), 0f)) + ((_e2190 * _e2191) * 0.7f));
                            let _e2197 = nI;
                            let _e2198 = V_1;
                            let _e2199 = global.uSunDir;
                            spI = (pow(max(dot(_e2197, normalize((_e2198 + _e2199))), 0f), 60f) * 0.6f);
                            let _e2210 = color;
                            let _e2211 = alb;
                            let _e2215 = litI;
                            let _e2217 = global.uSunE;
                            let _e2218 = sunT;
                            let _e2220 = spI;
                            let _e2223 = muS_2;
                            let _e2227 = fallK;
                            let _e2228 = iceF;
                            color = mix(_e2210, (((_e2211 / vec3(3.1415927f)) * _e2215) + (((_e2217 * _e2218) * _e2220) * step(0f, _e2223))), vec3((_e2227 * _e2228)));
                        }
                    }
                }
            }
            let _e2232 = global.uDebug;
            if (_e2232 > 6.5f) {
                let _e2235 = fallK;
                let _e2236 = dbgWhite;
                let _e2237 = river_3;
                if _e2237 {
                    local_82 = 1f;
                } else {
                    local_82 = 0f;
                }
                let _e2241 = local_82;
                local_87 = vec3<f32>(_e2235, _e2236, _e2241);
            } else {
                let _e2243 = global.uDebug;
                if (_e2243 < 2.5f) {
                    let _e2246 = ice_8;
                    local_86 = vec3(_e2246);
                } else {
                    let _e2248 = global.uDebug;
                    if (_e2248 < 3.5f) {
                        let _e2251 = Tm_2;
                        local_85 = vec3((_e2251 / 40f));
                    } else {
                        let _e2255 = global.uDebug;
                        if (_e2255 < 4.5f) {
                            let _e2258 = foam_1;
                            local_84 = vec3(_e2258);
                        } else {
                            let _e2260 = global.uDebug;
                            if (_e2260 < 5.5f) {
                                let _e2263 = vLiq_1;
                                local_83 = _e2263.xyz;
                            } else {
                                let _e2265 = wr;
                                local_83 = vec3((_e2265 * 4f));
                            }
                            let _e2270 = local_83;
                            local_84 = _e2270;
                        }
                        let _e2272 = local_84;
                        local_85 = _e2272;
                    }
                    let _e2274 = local_85;
                    local_86 = _e2274;
                }
                let _e2276 = local_86;
                local_87 = _e2276;
            }
            let _e2278 = local_87;
            dbgW = _e2278;
        }
    }
    let _e2279 = global.uThermal;
    if (_e2279.x > 0f) {
        {
            let _e2283 = albedo;
            a_10 = clamp(_e2283, vec3(0f), vec3(1f));
            let _e2290 = color;
            let _e2293 = a_10;
            let _e2295 = global.uThermal;
            let _e2297 = global.uThermal;
            let _e2299 = r_10;
            let _e2300 = global.uRadius;
            let _e2304 = blackbodyGlow((_e2295.x - (_e2297.y * (_e2299 - _e2300))));
            color = (_e2290 + ((vec3(1f) - _e2293) * _e2304));
            let _e2307 = color;
            let _e2308 = a_10;
            let _e2311 = r_10;
            let _e2313 = atmoSunTransmittance(_e2311, 1f);
            let _e2316 = global.uThermal;
            let _e2318 = global.uThermal;
            let _e2320 = r_10;
            let _e2321 = global.uRadius;
            let _e2327 = blackbodyGlow((_e2316.x - (_e2318.z * max((_e2320 - _e2321), 0f))));
            color = (_e2307 + ((_e2308 * (vec3(1f) - _e2313)) * _e2327));
        }
    }
    let _e2330 = emissive;
    if (_e2330 > 0.01f) {
        {
            let _e2335 = global.uTime;
            let _e2338 = vFixedPos_1;
            let _e2343 = vFixedPos_1;
            flick = (0.85f + (0.15f * sin((((_e2335 * 1.7f) + (_e2338.x * 0.05f)) + (_e2343.z * 0.07f)))));
            let _e2354 = fp_6;
            let _e2355 = w_8;
            let _e2357 = tri(_e2354, _e2355, 128f);
            crust = smoothstep(0.35f, 0.65f, _e2357.w);
            let _e2361 = color;
            let _e2362 = global.uLavaColor;
            let _e2363 = emissive;
            let _e2365 = flick;
            let _e2369 = crust;
            let _e2371 = emissive;
            color = (_e2361 + (((_e2362 * _e2363) * _e2365) * mix(1f, 0.15f, (_e2369 * (1f - (_e2371 * 0.5f))))));
        }
    }
    let _e2379 = global.uDebug;
    if (_e2379 > 1.5f) {
        let _e2382 = dbgW;
        if (_e2382.x < 0f) {
            let _e2390 = waterEnc;
            local_88 = ((vec3<f32>(0.5f, 0f, 0.5f) * _e2390) * 50f);
        } else {
            let _e2394 = dbgW;
            local_88 = _e2394;
        }
        let _e2396 = local_88;
        let _e2397 = global.uDebug;
        if (_e2397 > 7.5f) {
            local_89 = 0.02f;
        } else {
            local_89 = 1f;
        }
        let _e2403 = local_89;
        color = (_e2396 * _e2403);
    } else {
        let _e2405 = global.uDebug;
        if (_e2405 > 0.5f) {
            let _e2408 = color;
            let _e2409 = vMorphK_1;
            let _e2411 = vMorphK_1;
            color = mix(_e2408, (vec3<f32>(_e2409, (1f - _e2411), 0f) * 0.2f), vec3(0.5f));
        }
    }
    let _e2420 = color;
    fragmentColor = vec4<f32>(_e2420.x, _e2420.y, _e2420.z, 1f);
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
    let _e245 = fragmentColor;
    return FragmentOutput(_e245);
}
`;
