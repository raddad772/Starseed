import { CLUSTER_LIGHTING } from '../cluster-shader.js';
// Generated offline from the existing renderer equations. See tools/shaders/.
export const layout = {
  "uniforms": [
    {
      "name": "uSunDir",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 0
    },
    {
      "name": "uSunE",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 16
    },
    {
      "name": "uCenter",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 32
    },
    {
      "name": "uRadius",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 44
    },
    {
      "name": "uToFixed",
      "type": "mat3",
      "count": 0,
      "align": 16,
      "size": 48,
      "stride": 48,
      "offset": 48
    },
    {
      "name": "uCloud",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 96
    },
    {
      "name": "uCloudOn",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 112
    },
    {
      "name": "uCloudOpacity",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 116
    },
    {
      "name": "uCloudMapMean",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 120
    },
    {
      "name": "uAmbientFloor",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 128
    },
    {
      "name": "uHasAtmo",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 140
    },
    {
      "name": "uBottom",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 144
    },
    {
      "name": "uTop",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 148
    },
    {
      "name": "uGround",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 152
    },
    {
      "name": "uTrueK",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 156
    },
    {
      "name": "uSunLift",
      "type": "vec2",
      "count": 0,
      "align": 8,
      "size": 8,
      "stride": 8,
      "offset": 160
    },
    {
      "name": "uCloudYear",
      "type": "vec2",
      "count": 0,
      "align": 8,
      "size": 8,
      "stride": 8,
      "offset": 168
    },
    {
      "name": "uCloudClock",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 176
    },
    {
      "name": "uCloudWind",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 192
    },
    {
      "name": "uCSOrigin",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 208
    },
    {
      "name": "uCSE",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 224
    },
    {
      "name": "uCSN",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 240
    },
    {
      "name": "uCSInvL",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 252
    },
    {
      "name": "uCSLod",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 256
    },
    {
      "name": "uCSOn",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 260
    },
    {
      "name": "uCloudTau",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 264
    },
    {
      "name": "uThermal",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 272
    },
    {
      "name": "uHeightCube",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 288
    },
    {
      "name": "uSunShadow",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 304
    },
    {
      "name": "uSunShadowVP0",
      "type": "mat4",
      "count": 0,
      "align": 16,
      "size": 64,
      "stride": 64,
      "offset": 320
    },
    {
      "name": "uSunShadowVP1",
      "type": "mat4",
      "count": 0,
      "align": 16,
      "size": 64,
      "stride": 64,
      "offset": 384
    },
    {
      "name": "uSunShadowL0",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 448
    },
    {
      "name": "uSunShadowL1",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 464
    },
    {
      "name": "uSunShadowDir",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 480
    },
    {
      "name": "uGrassCover",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 496
    },
    {
      "name": "uGrassCoverVP",
      "type": "mat4",
      "count": 0,
      "align": 16,
      "size": 64,
      "stride": 64,
      "offset": 512
    },
    {
      "name": "uTrunkSky",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 576
    },
    {
      "name": "uRockSky",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 592
    },
    {
      "name": "uTrunkSkyVP",
      "type": "mat4",
      "count": 0,
      "align": 16,
      "size": 64,
      "stride": 64,
      "offset": 608
    },
    {
      "name": "uSkyShadow",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 672
    },
    {
      "name": "uSkyShadowVP0",
      "type": "mat4",
      "count": 0,
      "align": 16,
      "size": 64,
      "stride": 64,
      "offset": 688
    },
    {
      "name": "uSkyShadowVP1",
      "type": "mat4",
      "count": 0,
      "align": 16,
      "size": 64,
      "stride": 64,
      "offset": 752
    },
    {
      "name": "uSkyShadowL0",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 816
    },
    {
      "name": "uSkyShadowL1",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 832
    },
    {
      "name": "uSkyShadowUp0",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 848
    },
    {
      "name": "uSkyShadowUp1",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 864
    },
    {
      "name": "uSkyCenter",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 880
    },
    {
      "name": "uSkyToFixed",
      "type": "mat3",
      "count": 0,
      "align": 16,
      "size": 48,
      "stride": 48,
      "offset": 896
    },
    {
      "name": "uSkyD",
      "type": "vec2",
      "count": 0,
      "align": 8,
      "size": 8,
      "stride": 8,
      "offset": 944
    },
    {
      "name": "uLeafTint",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 960
    },
    {
      "name": "uMoonDir",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 976
    },
    {
      "name": "uMoonE",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 992
    },
    {
      "name": "uInterior",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 1004
    },
    {
      "name": "uCanopy",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 1008
    },
    {
      "name": "uBase",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 1024
    },
    {
      "name": "uLivery",
      "type": "vec2",
      "count": 0,
      "align": 8,
      "size": 8,
      "stride": 8,
      "offset": 1040
    },
    {
      "name": "uPaint1",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 1056
    },
    {
      "name": "uPaint2",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 1072
    },
    {
      "name": "uPaint3",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 1088
    },
    {
      "name": "uEmissive",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 1104
    },
    {
      "name": "uPBR",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 1120
    },
    {
      "name": "uFlags",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 1136
    },
    {
      "name": "uNormalScale",
      "type": "vec2",
      "count": 0,
      "align": 8,
      "size": 8,
      "stride": 8,
      "offset": 1152
    },
    {
      "name": "mapTransform",
      "type": "mat3",
      "count": 0,
      "align": 16,
      "size": 48,
      "stride": 48,
      "offset": 1168
    },
    {
      "name": "normalMapTransform",
      "type": "mat3",
      "count": 0,
      "align": 16,
      "size": 48,
      "stride": 48,
      "offset": 1216
    },
    {
      "name": "roughnessMapTransform",
      "type": "mat3",
      "count": 0,
      "align": 16,
      "size": 48,
      "stride": 48,
      "offset": 1264
    },
    {
      "name": "metalnessMapTransform",
      "type": "mat3",
      "count": 0,
      "align": 16,
      "size": 48,
      "stride": 48,
      "offset": 1312
    },
    {
      "name": "emissiveMapTransform",
      "type": "mat3",
      "count": 0,
      "align": 16,
      "size": 48,
      "stride": 48,
      "offset": 1360
    },
    {
      "name": "aoMapTransform",
      "type": "mat3",
      "count": 0,
      "align": 16,
      "size": 48,
      "stride": 48,
      "offset": 1408
    },
    {
      "name": "alphaMapTransform",
      "type": "mat3",
      "count": 0,
      "align": 16,
      "size": 48,
      "stride": 48,
      "offset": 1456
    },
    {
      "name": "uChannels",
      "type": "ivec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 1504
    },
    {
      "name": "uChannels2",
      "type": "ivec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 1520
    }
  ],
  "textures": [
    {
      "name": "tNoise",
      "type": "sampler3D",
      "count": 0,
      "binding": 1,
      "samplerBinding": 2
    },
    {
      "name": "tCloudMap",
      "type": "sampler2D",
      "count": 0,
      "binding": 3,
      "samplerBinding": 4
    },
    {
      "name": "tTrans",
      "type": "sampler2D",
      "count": 0,
      "binding": 5,
      "samplerBinding": 6
    },
    {
      "name": "tIrr",
      "type": "sampler2D",
      "count": 0,
      "binding": 7,
      "samplerBinding": 8
    },
    {
      "name": "tCloudShadow",
      "type": "sampler2D",
      "count": 0,
      "binding": 9,
      "samplerBinding": 10
    },
    {
      "name": "tHeightCube",
      "type": "sampler2DArray",
      "count": 0,
      "binding": 11,
      "samplerBinding": 12
    },
    {
      "name": "tShadowAtlas",
      "type": "sampler2D",
      "count": 0,
      "binding": 13,
      "samplerBinding": 14
    },
    {
      "name": "tSkyRings",
      "type": "sampler2D",
      "count": 0,
      "binding": 15,
      "samplerBinding": 16
    },
    {
      "name": "map",
      "type": "sampler2D",
      "count": 0,
      "binding": 17,
      "samplerBinding": 18
    },
    {
      "name": "normalMap",
      "type": "sampler2D",
      "count": 0,
      "binding": 19,
      "samplerBinding": 20
    },
    {
      "name": "roughnessMap",
      "type": "sampler2D",
      "count": 0,
      "binding": 21,
      "samplerBinding": 22
    },
    {
      "name": "metalnessMap",
      "type": "sampler2D",
      "count": 0,
      "binding": 23,
      "samplerBinding": 24
    },
    {
      "name": "emissiveMap",
      "type": "sampler2D",
      "count": 0,
      "binding": 25,
      "samplerBinding": 26
    },
    {
      "name": "aoMap",
      "type": "sampler2D",
      "count": 0,
      "binding": 27,
      "samplerBinding": 28
    },
    {
      "name": "alphaMap",
      "type": "sampler2D",
      "count": 0,
      "binding": 29,
      "samplerBinding": 30
    }
  ],
  "bytes": 1536,
  "group": 1,
  "attributes": []
};
export const code = CLUSTER_LIGHTING.replaceAll('@group(0)', '@group(2)') + /* wgsl */`
struct Params {
    uSunDir: vec3<f32>,
    uSunE: vec3<f32>,
    uCenter: vec3<f32>,
    uRadius: f32,
    uToFixed: mat3x3<f32>,
    uCloud: vec4<f32>,
    uCloudOn: f32,
    uCloudOpacity: f32,
    uCloudMapMean: f32,
    uAmbientFloor: vec3<f32>,
    uHasAtmo: f32,
    uBottom: f32,
    uTop: f32,
    uGround: f32,
    uTrueK: f32,
    uSunLift: vec2<f32>,
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
    uGrassCover: vec4<f32>,
    uGrassCoverVP: mat4x4<f32>,
    uTrunkSky: vec4<f32>,
    uRockSky: vec4<f32>,
    uTrunkSkyVP: mat4x4<f32>,
    uSkyShadow: vec4<f32>,
    uSkyShadowVP0_: mat4x4<f32>,
    uSkyShadowVP1_: mat4x4<f32>,
    uSkyShadowL0_: vec4<f32>,
    uSkyShadowL1_: vec4<f32>,
    uSkyShadowUp0_: vec3<f32>,
    uSkyShadowUp1_: vec3<f32>,
    uSkyCenter: vec3<f32>,
    uSkyToFixed: mat3x3<f32>,
    uSkyD: vec2<f32>,
    uLeafTint: vec3<f32>,
    uMoonDir: vec3<f32>,
    uMoonE: vec3<f32>,
    uInterior: f32,
    uCanopy: f32,
    uBase: vec4<f32>,
    uLivery: vec2<f32>,
    uPaint1_: vec3<f32>,
    uPaint2_: vec3<f32>,
    uPaint3_: vec3<f32>,
    uEmissive: vec3<f32>,
    uPBR: vec4<f32>,
    uFlags: vec4<f32>,
    uNormalScale: vec2<f32>,
    mapTransform: mat3x3<f32>,
    normalMapTransform: mat3x3<f32>,
    roughnessMapTransform: mat3x3<f32>,
    metalnessMapTransform: mat3x3<f32>,
    emissiveMapTransform: mat3x3<f32>,
    aoMapTransform: mat3x3<f32>,
    alphaMapTransform: mat3x3<f32>,
    uChannels: vec4<i32>,
    uChannels2_: vec3<i32>,
}

struct FragmentOutput {
    @location(0) fragmentColor: vec4<f32>,
}

const PI: f32 = 3.1415927f;
const HC_N: array<vec3<f32>, 6> = array<vec3<f32>, 6>(vec3<f32>(1f, 0f, 0f), vec3<f32>(-1f, 0f, 0f), vec3<f32>(0f, 1f, 0f), vec3<f32>(0f, -1f, 0f), vec3<f32>(0f, 0f, 1f), vec3<f32>(0f, 0f, -1f));
const HC_U: array<vec3<f32>, 6> = array<vec3<f32>, 6>(vec3<f32>(0f, 0f, -1f), vec3<f32>(0f, 0f, 1f), vec3<f32>(1f, 0f, 0f), vec3<f32>(1f, 0f, 0f), vec3<f32>(1f, 0f, 0f), vec3<f32>(-1f, 0f, 0f));
const HC_V: array<vec3<f32>, 6> = array<vec3<f32>, 6>(vec3<f32>(0f, 1f, 0f), vec3<f32>(0f, 1f, 0f), vec3<f32>(0f, 0f, -1f), vec3<f32>(0f, 0f, 1f), vec3<f32>(0f, 1f, 0f), vec3<f32>(0f, 1f, 0f));

@group(1) @binding(0) 
var<uniform> global: Params;
@group(1) @binding(1) 
var tNoiseTexture: texture_3d<f32>;
@group(1) @binding(2) 
var tNoiseSampler: sampler;
@group(1) @binding(3) 
var tCloudMapTexture: texture_2d<f32>;
@group(1) @binding(4) 
var tCloudMapSampler: sampler;
@group(1) @binding(5) 
var tTransTexture: texture_2d<f32>;
@group(1) @binding(6) 
var tTransSampler: sampler;
@group(1) @binding(7) 
var tIrrTexture: texture_2d<f32>;
@group(1) @binding(8) 
var tIrrSampler: sampler;
@group(1) @binding(9) 
var tCloudShadowTexture: texture_2d<f32>;
@group(1) @binding(10) 
var tCloudShadowSampler: sampler;
@group(1) @binding(11) 
var tHeightCubeTexture: texture_2d_array<f32>;
@group(1) @binding(12) 
var tHeightCubeSampler: sampler;
@group(1) @binding(13) 
var tShadowAtlasTexture: texture_2d<f32>;
@group(1) @binding(14) 
var tShadowAtlasSampler: sampler;
@group(1) @binding(15) 
var tSkyRingsTexture: texture_2d<f32>;
@group(1) @binding(16) 
var tSkyRingsSampler: sampler;
@group(1) @binding(17) 
var mapTexture: texture_2d<f32>;
@group(1) @binding(18) 
var mapSampler: sampler;
@group(1) @binding(19) 
var normalMapTexture: texture_2d<f32>;
@group(1) @binding(20) 
var normalMapSampler: sampler;
@group(1) @binding(21) 
var roughnessMapTexture: texture_2d<f32>;
@group(1) @binding(22) 
var roughnessMapSampler: sampler;
@group(1) @binding(23) 
var metalnessMapTexture: texture_2d<f32>;
@group(1) @binding(24) 
var metalnessMapSampler: sampler;
@group(1) @binding(25) 
var emissiveMapTexture: texture_2d<f32>;
@group(1) @binding(26) 
var emissiveMapSampler: sampler;
@group(1) @binding(27) 
var aoMapTexture: texture_2d<f32>;
@group(1) @binding(28) 
var aoMapSampler: sampler;
@group(1) @binding(29) 
var alphaMapTexture: texture_2d<f32>;
@group(1) @binding(30) 
var alphaMapSampler: sampler;
var<private> fragmentColor: vec4<f32>;
var<private> cloudDirZ: f32 = 1f;
var<private> cloudTotZ: f32 = 1f;
var<private> vObjPos_1: vec3<f32>;
var<private> vObjN_1: vec3<f32>;
var<private> vWorld_1: vec3<f32>;
var<private> vNormal_1: vec3<f32>;
var<private> vColor_1: vec4<f32>;
var<private> vUv_1: vec2<f32>;
var<private> vUv1_1: vec2<f32>;
var<private> vUv2_1: vec2<f32>;
var<private> gl_FrontFacing_1: bool;
var<private> gl_FragCoord_1: vec4<f32>;

fn lensTrueZ(zd: f32) -> f32 {
    var zd_1: f32;
    var hD: f32;
    var hT: f32;
    var local: f32;

    zd_1 = zd;
    let _e179 = global.uSunLift;
    hD = (1.5707963f + _e179.x);
    let _e184 = global.uSunLift;
    hT = (1.5707963f + _e184.y);
    let _e188 = zd_1;
    let _e189 = hD;
    if (_e188 <= _e189) {
        let _e191 = zd_1;
        let _e192 = hT;
        let _e194 = hD;
        local = ((_e191 * _e192) / _e194);
    } else {
        let _e196 = hT;
        let _e197 = zd_1;
        let _e198 = hD;
        let _e201 = hT;
        let _e205 = hD;
        local = (_e196 + (((_e197 - _e198) * (3.1415927f - _e201)) / (3.1415927f - _e205)));
    }
    let _e210 = local;
    return _e210;
}

fn liftMu(mu: f32) -> f32 {
    var mu_1: f32;

    mu_1 = mu;
    let _e178 = global.uSunLift;
    let _e180 = global.uSunLift;
    if (_e178.x <= _e180.y) {
        let _e183 = mu_1;
        return _e183;
    }
    let _e184 = mu_1;
    let _e190 = lensTrueZ(acos(clamp(_e184, -1f, 1f)));
    return cos(_e190);
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
    let _e181 = global.uTop;
    let _e182 = global.uTop;
    let _e184 = global.uBottom;
    let _e185 = global.uBottom;
    H = sqrt(max(0f, ((_e181 * _e182) - (_e184 * _e185))));
    let _e192 = r_1;
    let _e193 = r_1;
    let _e195 = global.uBottom;
    let _e196 = global.uBottom;
    rho = sqrt(max(0f, ((_e192 * _e193) - (_e195 * _e196))));
    let _e202 = r_1;
    let _e203 = r_1;
    let _e205 = mu_3;
    let _e206 = mu_3;
    let _e211 = global.uTop;
    let _e212 = global.uTop;
    disc = (((_e202 * _e203) * ((_e205 * _e206) - 1f)) + (_e211 * _e212));
    let _e217 = r_1;
    let _e219 = mu_3;
    let _e221 = disc;
    d = max(0f, ((-(_e217) * _e219) + sqrt(max(_e221, 0f))));
    let _e228 = global.uTop;
    let _e229 = r_1;
    dMin = (_e228 - _e229);
    let _e232 = rho;
    let _e233 = H;
    dMax = (_e232 + _e233);
    let _e236 = d;
    let _e237 = dMin;
    let _e239 = dMax;
    let _e240 = dMin;
    let _e245 = rho;
    let _e246 = H;
    return vec2<f32>(((_e236 - _e237) / max((_e239 - _e240), 0.000001f)), (_e245 / max(_e246, 0.000001f)));
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
    let _e180 = mu_5;
    let _e181 = liftMu(_e180);
    mu_5 = _e181;
    let _e182 = global.uGround;
    let _e183 = global.uTrueK;
    Rg = (_e182 * max(_e183, 1f));
    let _e188 = Rg;
    let _e189 = Rg;
    let _e190 = r_3;
    let _e191 = global.uGround;
    sinH = (_e188 / (_e189 + max((_e190 - _e191), 0f)));
    let _e200 = sinH;
    let _e201 = sinH;
    cosH = -(sqrt(max(0f, (1f - (_e200 * _e201)))));
    let _e208 = cosH;
    let _e211 = cosH;
    let _e214 = mu_5;
    vis = smoothstep((_e208 - 0.01f), (_e211 + 0.01f), _e214);
    let _e217 = global.uHasAtmo;
    if (_e217 < 0.5f) {
        let _e220 = vis;
        return vec3(_e220);
    }
    let _e222 = r_3;
    let _e223 = global.uBottom;
    let _e224 = global.uTop;
    let _e226 = mu_5;
    let _e227 = transmittanceUV(clamp(_e222, _e223, _e224), _e226);
    uv = _e227;
    let _e236 = uv;
    uv = (vec2<f32>(0.001953125f, 0.0078125f) + (_e236 * vec2<f32>(0.99609375f, 0.984375f)));
    let _e246 = uv;
    let _e248 = textureSampleLevel(tTransTexture, tTransSampler, _e246, 0f);
    let _e250 = vis;
    return (_e248.xyz * _e250);
}

fn atmoSkyIrradiance(r_4: f32, mu_6: f32) -> vec3<f32> {
    var r_5: f32;
    var mu_7: f32;
    var uv_1: vec2<f32>;

    r_5 = r_4;
    mu_7 = mu_6;
    let _e180 = global.uHasAtmo;
    if (_e180 < 0.5f) {
        return vec3(0f);
    }
    let _e185 = mu_7;
    let _e186 = liftMu(_e185);
    mu_7 = _e186;
    let _e187 = mu_7;
    let _e192 = r_5;
    let _e193 = global.uGround;
    let _e195 = global.uTop;
    let _e196 = global.uGround;
    uv_1 = vec2<f32>(((_e187 * 0.5f) + 0.5f), clamp(((_e192 - _e193) / (_e195 - _e196)), 0f, 1f));
    let _e211 = uv_1;
    uv_1 = (vec2<f32>(0.0078125f, 0.03125f) + (_e211 * vec2<f32>(0.984375f, 0.9375f)));
    let _e221 = uv_1;
    let _e223 = textureSampleLevel(tIrrTexture, tIrrSampler, _e221, 0f);
    return _e223.xyz;
}

fn cloudN(n: f32) -> f32 {
    var n_1: f32;

    n_1 = n;
    let _e179 = n_1;
    return (0.55f + ((_e179 - 0.682f) * 4.3f));
}

fn cloudBias(cover: f32) -> f32 {
    var cover_1: f32;

    cover_1 = cover;
    let _e178 = cover_1;
    let _e186 = cover_1;
    let _e194 = cover_1;
    return ((((_e178 - 0.5f) * 0.3f) + (0.5f * smoothstep(0.8f, 1f, _e186))) - (0.5f * (1f - smoothstep(0f, 0.2f, _e194))));
}

fn cloudFade(foot: f32, L: f32) -> f32 {
    var foot_1: f32;
    var L_1: f32;

    foot_1 = foot;
    L_1 = L;
    let _e182 = foot_1;
    let _e185 = L_1;
    return smoothstep(1f, 4f, ((_e182 * 64f) / _e185));
}

fn cloudMapSmooth(uv_2: vec2<f32>) -> vec3<f32> {
    var uv_3: vec2<f32>;
    var sz: vec2<f32>;
    var st: vec2<f32>;
    var i: vec2<f32>;
    var f: vec2<f32>;
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
    let _e179 = textureDimensions(tCloudMapTexture, 0i);
    sz = vec2<f32>(vec2<i32>(_e179));
    let _e183 = uv_3;
    let _e184 = sz;
    st = ((_e183 * _e184) - vec2(0.5f));
    let _e190 = st;
    i = floor(_e190);
    let _e193 = st;
    let _e194 = i;
    f = (_e193 - _e194);
    let _e197 = f;
    let _e198 = f;
    f2_ = (_e197 * _e198);
    let _e201 = f2_;
    let _e202 = f;
    f3_ = (_e201 * _e202);
    let _e207 = f;
    let _e212 = f2_;
    let _e215 = f3_;
    w0_ = ((((vec2(1f) - (3f * _e207)) + (3f * _e212)) - _e215) / vec2(6f));
    let _e223 = f2_;
    let _e228 = f3_;
    w1_ = (((vec2(4f) - (6f * _e223)) + (3f * _e228)) / vec2(6f));
    let _e237 = f;
    let _e242 = f2_;
    let _e246 = f3_;
    w2_ = ((((vec2(1f) + (3f * _e237)) + (3f * _e242)) - (3f * _e246)) / vec2(6f));
    let _e253 = f3_;
    w3_ = (_e253 / vec2(6f));
    let _e258 = w0_;
    let _e259 = w1_;
    g0_ = (_e258 + _e259);
    let _e262 = w2_;
    let _e263 = w3_;
    g1_ = (_e262 + _e263);
    let _e266 = i;
    let _e270 = w1_;
    let _e271 = g0_;
    let _e274 = sz;
    h0_ = (((_e266 - vec2(0.5f)) + (_e270 / _e271)) / _e274);
    let _e277 = i;
    let _e281 = w3_;
    let _e282 = g1_;
    let _e285 = sz;
    h1_ = (((_e277 + vec2(1.5f)) + (_e281 / _e282)) / _e285);
    let _e288 = g0_;
    let _e290 = g0_;
    let _e292 = h0_;
    let _e294 = textureSampleLevel(tCloudMapTexture, tCloudMapSampler, _e292, 0f);
    let _e297 = g1_;
    let _e299 = h1_;
    let _e301 = h0_;
    let _e305 = textureSampleLevel(tCloudMapTexture, tCloudMapSampler, vec2<f32>(_e299.x, _e301.y), 0f);
    let _e310 = g1_;
    let _e312 = g0_;
    let _e314 = h0_;
    let _e316 = h1_;
    let _e320 = textureSampleLevel(tCloudMapTexture, tCloudMapSampler, vec2<f32>(_e314.x, _e316.y), 0f);
    let _e323 = g1_;
    let _e325 = h1_;
    let _e327 = textureSampleLevel(tCloudMapTexture, tCloudMapSampler, _e325, 0f);
    return ((_e288.y * ((_e290.x * _e294.xyz) + (_e297.x * _e305.xyz))) + (_e310.y * ((_e312.x * _e320.xyz) + (_e323.x * _e327.xyz))));
}

fn cloudClimate(dirF: vec3<f32>) -> f32 {
    var dirF_1: vec3<f32>;
    var lat: f32;
    var cm: vec3<f32>;

    dirF_1 = dirF;
    let _e178 = dirF_1;
    lat = asin(clamp(_e178.y, -1f, 1f));
    let _e186 = global.uCloudMapMean;
    if (_e186 <= 0f) {
        let _e190 = lat;
        return (0.12f * cos((abs(_e190) * 6f)));
    }
    let _e196 = dirF_1;
    let _e198 = dirF_1;
    let _e205 = lat;
    let _e211 = cloudMapSmooth(vec2<f32>(((atan2(_e196.z, _e198.x) / 6.2832f) + 0.5f), ((_e205 / 3.14159f) + 0.5f)));
    cm = _e211;
    let _e213 = cm;
    let _e215 = cm;
    let _e219 = global.uCloudYear;
    let _e223 = cm;
    let _e227 = global.uCloudYear;
    let _e231 = global.uCloudMapMean;
    return ((((_e213.x + ((_e215.y - 0.5f) * _e219.x)) + ((_e223.z - 0.5f) * _e227.y)) - _e231) * 0.8f);
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
    var local_1: f32;
    var a: f32;
    var local_2: f32;
    var b: f32;
    var spread: f32;

    q_1 = q;
    foot_3 = foot_2;
    bias_1 = bias;
    clim_1 = clim;
    let _e184 = global.uRadius;
    L0_ = (_e184 * 1f);
    let _e188 = global.uRadius;
    L1_ = (_e188 * 0.236f);
    let _e192 = foot_3;
    let _e193 = L0_;
    let _e194 = cloudFade(_e192, _e193);
    f0_ = _e194;
    let _e196 = foot_3;
    let _e197 = L1_;
    let _e198 = cloudFade(_e196, _e197);
    f1_ = _e198;
    let _e200 = q_1;
    qz = (_e200 * vec3<f32>(0.5f, 1f, 0.5f));
    let _e207 = f0_;
    if (_e207 > 0.999f) {
        local_1 = 0.682f;
    } else {
        let _e211 = qz;
        let _e212 = L0_;
        let _e216 = textureSampleLevel(tNoiseTexture, tNoiseSampler, (_e211 / vec3(_e212)), 0f);
        let _e219 = f0_;
        local_1 = mix(_e216.x, 0.682f, _e219);
    }
    let _e222 = local_1;
    a = _e222;
    let _e224 = f1_;
    if (_e224 > 0.999f) {
        local_2 = 0.682f;
    } else {
        let _e228 = qz;
        let _e229 = L1_;
        let _e236 = textureSampleLevel(tNoiseTexture, tNoiseSampler, ((_e228 / vec3(_e229)) + vec3(0.5f)), 0f);
        let _e239 = f1_;
        local_2 = mix(_e236.x, 0.682f, _e239);
    }
    let _e242 = local_2;
    b = _e242;
    let _e245 = f0_;
    let _e248 = f1_;
    spread = length(vec2<f32>((0.124f * _e245), (0.083f * _e248)));
    let _e254 = bias_1;
    let _e256 = spread;
    let _e259 = bias_1;
    let _e261 = spread;
    let _e263 = a;
    let _e266 = b;
    let _e270 = cloudN(((_e263 * 0.6f) + (_e266 * 0.4f)));
    let _e271 = clim_1;
    return smoothstep(((0.6f - _e254) - _e256), ((0.8f - _e259) + _e261), (_e270 + _e271));
}

fn cloudGens(dirF_2: vec3<f32>, gA: ptr<function, vec3<f32>>, gB: ptr<function, vec3<f32>>) {
    var dirF_3: vec3<f32>;
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

    dirF_3 = dirF_2;
    let _e180 = global.uCloudClock;
    T = _e180.z;
    let _e183 = T;
    if (_e183 <= 0f) {
        {
            (*gA) = vec3<f32>(1f, 0f, 0f);
            (*gB) = vec3(0f);
            return;
        }
    }
    let _e193 = dirF_3;
    let _e197 = dirF_3;
    let _e202 = dirF_3;
    let _e208 = dirF_3;
    let _e212 = dirF_3;
    let _e217 = dirF_3;
    ph = ((((1.1f * _e193.x) + (0.7f * _e197.z)) - (0.5f * _e202.y)) + (0.35f * sin((((2.3f * _e208.y) + (1.7f * _e212.x)) - (0.9f * _e217.z)))));
    let _e225 = global.uCloudClock;
    let _e227 = T;
    let _e229 = ph;
    s = (((_e225.x / _e227) + _e229) + 4f);
    let _e234 = s;
    a_1 = floor(_e234);
    let _e237 = s;
    let _e238 = a_1;
    fa = (_e237 - _e238);
    let _e241 = s;
    b_1 = floor((_e241 + 0.5f));
    let _e246 = s;
    let _e249 = b_1;
    fb = ((_e246 + 0.5f) - _e249);
    let _e253 = dirF_3;
    let _e263 = dirF_3;
    let _e275 = dirF_3;
    j = (0.065f * ((sin((dot(_e253, vec3<f32>(5.1f, 3.7f, -4.3f)) + 1.3f)) + sin((dot(_e263, vec3<f32>(-3.9f, 7.3f, 6.1f)) + 0.4f))) + (0.6f * sin((dot(_e275, vec3<f32>(11.3f, -8.9f, 7.7f)) + 2.1f)))));
    let _e289 = s;
    let _e290 = j;
    fj = fract((_e289 + _e290));
    let _e298 = fj;
    wa = smoothstep(0.4f, 0.6f, (1f - abs(((2f * _e298) - 1f))));
    let _e306 = wa;
    let _e307 = fa;
    let _e310 = T;
    let _e313 = global.uCloudClock;
    let _e315 = a_1;
    (*gA) = vec3<f32>(_e306, ((_e307 - 0.5f) * _e310), (2f * (_e313.y + _e315)));
    let _e320 = wa;
    let _e322 = fb;
    let _e325 = T;
    let _e328 = global.uCloudClock;
    let _e330 = b_1;
    (*gB) = vec3<f32>((1f - _e320), ((_e322 - 0.5f) * _e325), ((2f * (_e328.y + _e330)) + 1f));
    return;
}

fn cloudGenOff(idx: f32) -> vec3<f32> {
    var idx_1: f32;
    var h: u32;

    idx_1 = idx;
    let _e178 = idx_1;
    h = (u32(_e178) * 2654435761u);
    let _e183 = h;
    let _e184 = h;
    h = (_e183 ^ (_e184 >> 15u));
    let _e188 = h;
    h = (_e188 * 2246822519u);
    let _e191 = h;
    let _e192 = h;
    h = (_e191 ^ (_e192 >> 13u));
    let _e196 = h;
    let _e200 = h;
    let _e206 = h;
    return (((vec3<f32>(f32((_e196 & 1023u)), f32(((_e200 >> 10u) & 1023u)), f32(((_e206 >> 20u) & 1023u))) / vec3(1024f)) - vec3(0.5f)) * 400000f);
}

fn cloudAdvect(pf: vec3<f32>, dirF_4: vec3<f32>, g: vec3<f32>) -> vec3<f32> {
    var pf_1: vec3<f32>;
    var dirF_5: vec3<f32>;
    var g_1: vec3<f32>;
    var lat_1: f32;
    var U: f32;
    var east: vec3<f32>;

    pf_1 = pf;
    dirF_5 = dirF_4;
    g_1 = g;
    let _e182 = dirF_5;
    lat_1 = asin(clamp(_e182.y, -1f, 1f));
    let _e190 = global.uCloudWind;
    let _e192 = lat_1;
    let _e193 = global.uCloudWind;
    let _e198 = global.uCloudWind;
    let _e204 = global.uCloudWind;
    let _e206 = lat_1;
    let _e208 = lat_1;
    U = (_e190.x * (sin((((_e192 * _e193.y) * 2f) + (_e198.z * 6.2832f))) + (_e204.w * exp(((-(_e206) * _e208) * 40f)))));
    let _e217 = dirF_5;
    let _e221 = dirF_5;
    east = normalize((vec3<f32>(-(_e217.z), 0f, _e221.x) + vec3<f32>(0.000001f, 0f, 0f)));
    let _e231 = pf_1;
    let _e232 = east;
    let _e233 = U;
    let _e235 = g_1;
    let _e239 = g_1;
    let _e241 = cloudGenOff(_e239.z);
    return ((_e231 + ((_e232 * _e233) * _e235.y)) + _e241);
}

fn cloudCoverG(pf_2: vec3<f32>, dirF_6: vec3<f32>, foot_4: f32, bias_2: f32) -> f32 {
    var pf_3: vec3<f32>;
    var dirF_7: vec3<f32>;
    var foot_5: f32;
    var bias_3: f32;
    var gA_1: vec3<f32>;
    var gB_1: vec3<f32>;
    var c: f32 = 0f;
    var clim_2: f32;

    pf_3 = pf_2;
    dirF_7 = dirF_6;
    foot_5 = foot_4;
    bias_3 = bias_2;
    let _e186 = dirF_7;
    cloudGens(_e186, (&gA_1), (&gB_1));
    let _e193 = dirF_7;
    let _e194 = cloudClimate(_e193);
    clim_2 = _e194;
    let _e196 = gA_1;
    if (_e196.x > 0.005f) {
        let _e200 = c;
        let _e201 = gA_1;
        let _e203 = pf_3;
        let _e204 = dirF_7;
        let _e205 = gA_1;
        let _e206 = cloudAdvect(_e203, _e204, _e205);
        let _e207 = foot_5;
        let _e208 = bias_3;
        let _e209 = clim_2;
        let _e210 = cloudCoverC(_e206, _e207, _e208, _e209);
        c = (_e200 + (_e201.x * _e210));
    }
    let _e213 = gB_1;
    if (_e213.x > 0.005f) {
        let _e217 = c;
        let _e218 = gB_1;
        let _e220 = pf_3;
        let _e221 = dirF_7;
        let _e222 = gB_1;
        let _e223 = cloudAdvect(_e220, _e221, _e222);
        let _e224 = foot_5;
        let _e225 = bias_3;
        let _e226 = clim_2;
        let _e227 = cloudCoverC(_e223, _e224, _e225, _e226);
        c = (_e217 + (_e218.x * _e227));
    }
    let _e230 = c;
    return _e230;
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
    var local_3: f32;
    var cs: f32;
    var dz: vec3<f32>;
    var cz: f32;
    var local_4: f32;

    rel_1 = rel;
    r_7 = r_6;
    muS_1 = muS;
    foot_7 = foot_6;
    sunAbove_1 = sunAbove;
    cloudDirZ = 1f;
    cloudTotZ = 1f;
    let _e191 = global.uCloudOn;
    if (_e191 < 0.5f) {
        return 1f;
    }
    let _e195 = muS_1;
    mu_8 = max(_e195, 0.05f);
    let _e213 = global.uCSOn;
    if (_e213 > 0.5f) {
        {
            let _e216 = global.uToFixed;
            let _e217 = rel_1;
            pf_4 = (_e216 * _e217);
            let _e220 = pf_4;
            let _e221 = r_7;
            upF = (_e220 / vec3(_e221));
            let _e225 = global.uToFixed;
            let _e226 = global.uSunDir;
            sF = (_e225 * _e226);
            let _e229 = pf_4;
            let _e230 = global.uCSOrigin;
            let _e232 = sF;
            let _e233 = upF;
            let _e234 = sF;
            let _e235 = upF;
            let _e239 = r_7;
            let _e240 = global.uRadius;
            let _e243 = sF;
            let _e244 = upF;
            d_1 = ((_e229 - _e230) - (((_e232 - (_e233 * dot(_e234, _e235))) * (_e239 - _e240)) / vec3(max(dot(_e243, _e244), 0.1f))));
            let _e252 = d_1;
            let _e253 = global.uCSE;
            let _e255 = d_1;
            let _e256 = global.uCSN;
            let _e259 = global.uCSInvL;
            uv_4 = ((vec2<f32>(dot(_e252, _e253), dot(_e255, _e256)) * _e259) + vec2(0.5f));
            let _e267 = uv_4;
            let _e270 = uv_4;
            let _e274 = uv_4;
            let _e277 = uv_4;
            w = smoothstep(0f, 0.08f, min(min(_e267.x, (1f - _e270.x)), min(_e274.y, (1f - _e277.y))));
            let _e283 = w;
            if (_e283 > 0f) {
                {
                    let _e286 = uv_4;
                    let _e288 = textureSampleLevel(tCloudShadowTexture, tCloudShadowSampler, _e286, 0f);
                    m0_ = _e288;
                    let _e289 = uv_4;
                    let _e290 = global.uCSLod;
                    let _e291 = textureSampleLevel(tCloudShadowTexture, tCloudShadowSampler, _e289, _e290);
                    m1_ = _e291;
                }
            }
        }
    }
    let _e292 = global.uCloud;
    let _e294 = r_7;
    let _e295 = global.uRadius;
    hc = (_e292.x - (_e294 - _e295));
    let _e299 = hc;
    let _e302 = w;
    if ((_e299 > 0f) && (_e302 < 1f)) {
        {
            let _e306 = global.uToFixed;
            let _e307 = rel_1;
            let _e308 = global.uSunDir;
            let _e309 = hc;
            let _e311 = muS_1;
            ds = normalize((_e306 * normalize((_e307 + ((_e308 * _e309) / vec3(max(_e311, 0.08f)))))));
            let _e321 = muS_1;
            if (_e321 > -0.05f) {
                let _e325 = ds;
                let _e326 = global.uRadius;
                let _e328 = ds;
                let _e329 = foot_7;
                let _e330 = global.uCloud;
                let _e332 = cloudBias(_e330.z);
                let _e333 = cloudCoverG((_e325 * _e326), _e328, _e329, _e332);
                let _e334 = global.uCloudOpacity;
                local_3 = (_e333 * _e334);
            } else {
                local_3 = 0f;
            }
            let _e338 = local_3;
            cs = _e338;
            let _e340 = global.uToFixed;
            let _e341 = rel_1;
            dz = normalize((_e340 * _e341));
            let _e345 = dz;
            let _e346 = global.uRadius;
            let _e348 = dz;
            let _e349 = foot_7;
            let _e351 = hc;
            let _e354 = global.uCloud;
            let _e356 = cloudBias(_e354.z);
            let _e357 = cloudCoverG((_e345 * _e346), _e348, max(_e349, (3.5f * _e351)), _e356);
            let _e358 = global.uCloudOpacity;
            cz = (_e357 * _e358);
            let _e362 = cs;
            let _e364 = cs;
            let _e365 = global.uCloudTau;
            let _e367 = mu_8;
            Tdir = ((1f - _e362) + (_e364 * exp((-(_e365) / _e367))));
            let _e373 = cz;
            let _e375 = cz;
            let _e378 = global.uCloudTau;
            Ttot = ((1f - _e373) + (_e375 / (1f + (0.1125f * _e378))));
            let _e384 = cz;
            let _e386 = cz;
            let _e387 = global.uCloudTau;
            let _e389 = mu_8;
            Dup = ((1f - _e384) + (_e386 * exp((-(_e387) / _e389))));
        }
    }
    let _e394 = Tdir;
    let _e395 = m0_;
    let _e397 = w;
    Tdir = mix(_e394, _e395.x, _e397);
    let _e399 = Ttot;
    let _e400 = m1_;
    let _e402 = w;
    Ttot = mix(_e399, _e400.y, _e402);
    let _e404 = Dup;
    let _e405 = m1_;
    let _e407 = w;
    Dup = mix(_e404, _e405.z, _e407);
    let _e409 = Dup;
    cloudDirZ = _e409;
    let _e410 = Ttot;
    cloudTotZ = _e410;
    let _e411 = (*skyE);
    let _e412 = Ttot;
    let _e414 = sunAbove_1;
    let _e415 = muS_1;
    let _e419 = Ttot;
    let _e420 = Dup;
    (*skyE) = ((_e411 * _e412) + ((_e414 * max(_e415, 0f)) * max((_e419 - _e420), 0f)));
    let _e426 = muS_1;
    if (_e426 > -0.05f) {
        let _e430 = Tdir;
        local_4 = _e430;
    } else {
        local_4 = 1f;
    }
    let _e433 = local_4;
    return _e433;
}

fn blackbodyGlow(T_1: f32) -> vec3<f32> {
    var T_2: f32;
    var g_2: f32;

    T_2 = T_1;
    let _e180 = T_2;
    if (_e180 < 650f) {
        return vec3(0f);
    }
    let _e188 = T_2;
    g_2 = max(0f, (0.0287f + (0.000237f * (_e188 - 1000f))));
    let _e196 = g_2;
    let _e202 = T_2;
    let _e208 = g_2;
    return (vec3<f32>(1f, _e196, 0f) * ((600000f * exp((-24060f / _e202))) / (0.2126f + (0.7152f * _e208))));
}

fn heightCubeAt(d_2: vec3<f32>) -> f32 {
    var d_3: vec3<f32>;
    var a_2: vec3<f32>;
    var local_5: i32;
    var local_6: i32;
    var local_7: i32;
    var local_8: i32;
    var local_9: i32;
    var f_1: i32;
    var local_10: array<vec3<f32>, 6> = HC_N;
    var dn: f32;
    var local_11: array<vec3<f32>, 6> = HC_U;
    var local_12: array<vec3<f32>, 6> = HC_V;
    var uv_5: vec2<f32>;

    d_3 = d_2;
    let _e183 = d_3;
    a_2 = abs(_e183);
    let _e186 = a_2;
    let _e188 = a_2;
    let _e191 = a_2;
    let _e193 = a_2;
    if ((_e186.x >= _e188.y) && (_e191.x >= _e193.z)) {
        let _e197 = d_3;
        if (_e197.x >= 0f) {
            local_5 = 0i;
        } else {
            local_5 = 1i;
        }
        let _e204 = local_5;
        local_9 = _e204;
    } else {
        let _e205 = a_2;
        let _e207 = a_2;
        if (_e205.y >= _e207.z) {
            let _e210 = d_3;
            if (_e210.y >= 0f) {
                local_6 = 2i;
            } else {
                local_6 = 3i;
            }
            let _e217 = local_6;
            local_8 = _e217;
        } else {
            let _e218 = d_3;
            if (_e218.z >= 0f) {
                local_7 = 4i;
            } else {
                local_7 = 5i;
            }
            let _e225 = local_7;
            local_8 = _e225;
        }
        let _e227 = local_8;
        local_9 = _e227;
    }
    let _e229 = local_9;
    f_1 = _e229;
    let _e231 = d_3;
    let _e232 = f_1;
    let _e236 = local_10[_e232];
    dn = dot(_e231, _e236);
    let _e239 = d_3;
    let _e240 = f_1;
    let _e244 = local_11[_e240];
    let _e246 = dn;
    let _e249 = d_3;
    let _e250 = f_1;
    let _e254 = local_12[_e250];
    let _e256 = dn;
    uv_5 = (((vec2<f32>(atan((dot(_e239, _e244) / _e246)), atan((dot(_e249, _e254) / _e256))) / vec2(0.785398f)) * 0.5f) + vec2(0.5f));
    let _e269 = uv_5;
    let _e270 = f_1;
    let _e274 = vec3<f32>(_e269.x, _e269.y, f32(_e270));
    let _e279 = textureSampleLevel(tHeightCubeTexture, tHeightCubeSampler, _e274.xy, i32(_e274.z), 0f);
    return _e279.x;
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
    var t: f32;
    var sh: f32 = 1f;
    var i_1: i32 = 0i;
    var qp: vec3<f32>;
    var rq: f32;
    var d_4: f32;

    pF_1 = pF;
    up_1 = up;
    sF_2 = sF_1;
    R_1 = R;
    let _e189 = global.uHeightCube;
    let _e193 = up_1;
    let _e194 = sF_2;
    if ((_e189.x < 0.5f) || (dot(_e193, _e194) < -0.2f)) {
        return 1f;
    }
    let _e201 = global.uHeightCube;
    texel = _e201.w;
    let _e204 = R_1;
    let _e205 = global.uHeightCube;
    top = (_e204 + _e205.z);
    let _e209 = pF_1;
    r0_ = length(_e209);
    let _e213 = R_1;
    let _e214 = up_1;
    let _e215 = heightCubeAt(_e214);
    let _e217 = r0_;
    below = max(0f, ((_e213 + _e215) - _e217));
    let _e221 = pF_1;
    let _e222 = up_1;
    let _e223 = texel;
    o = (_e221 + ((_e222 * _e223) * 0.1f));
    let _e229 = texel;
    t = _e229;
    loop {
        let _e235 = i_1;
        if !((_e235 < 28i)) {
            break;
        }
        {
            let _e242 = o;
            let _e243 = sF_2;
            let _e244 = t;
            qp = (_e242 + (_e243 * _e244));
            let _e248 = qp;
            rq = length(_e248);
            let _e251 = rq;
            let _e252 = top;
            if (_e251 > _e252) {
                break;
            }
            let _e254 = rq;
            let _e255 = R_1;
            let _e256 = qp;
            let _e257 = rq;
            let _e260 = heightCubeAt((_e256 / vec3(_e257)));
            let _e263 = below;
            let _e264 = t;
            let _e267 = texel;
            d_4 = ((_e254 - (_e255 + _e260)) + (_e263 * exp((-(_e264) / (3f * _e267)))));
            let _e274 = sh;
            let _e275 = d_4;
            let _e276 = t;
            sh = min(_e274, clamp(((_e275 / (_e276 * 0.035f)) + 0.5f), 0f, 1f));
            let _e286 = sh;
            if (_e286 <= 0f) {
                break;
            }
            let _e289 = t;
            t = (_e289 * 1.35f);
        }
        continuing {
            let _e239 = i_1;
            i_1 = (_e239 + 1i);
        }
    }
    let _e292 = sh;
    return _e292;
}

fn sunShadowTap(org: vec2<i32>, n_2: i32, VP: mat4x4<f32>, L_2: vec4<f32>, wp: vec3<f32>, bias_4: f32) -> f32 {
    var org_1: vec2<i32>;
    var n_3: i32;
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
    var local_13: f32;
    var lit: f32 = 0f;
    var j_2: i32 = 0i;
    var i_3: i32;

    org_1 = org;
    n_3 = n_2;
    VP_1 = VP;
    L_3 = L_2;
    wp_1 = wp;
    bias_5 = bias_4;
    let _e193 = VP_1;
    let _e194 = wp_1;
    c_1 = (_e193 * vec4<f32>(_e194.x, _e194.y, _e194.z, 1f));
    let _e202 = c_1;
    let _e204 = c_1;
    uv_6 = (((_e202.xy / vec2(_e204.w)) * 0.5f) + vec2(0.5f));
    let _e214 = uv_6;
    let _e219 = uv_6;
    if (any((_e214 < vec2(0f))) || any((_e219 > vec2(1f)))) {
        return 1f;
    }
    let _e226 = L_3;
    let _e228 = wp_1;
    let _e230 = global.uSunShadowDir;
    let _e232 = bias_5;
    d_5 = (dot((_e226.xyz - _e228), _e230) - _e232);
    let _e235 = n_3;
    sz_1 = vec2(_e235);
    let _e238 = uv_6;
    let _e239 = sz_1;
    st_1 = ((_e238 * vec2<f32>(_e239)) - vec2(0.5f));
    let _e246 = st_1;
    fr = fract(_e246);
    let _e249 = st_1;
    p0_ = vec2<i32>(floor(_e249));
    loop {
        let _e256 = j_1;
        if !((_e256 < 4i)) {
            break;
        }
        i_2 = 0i;
        loop {
            let _e265 = i_2;
            if !((_e265 < 4i)) {
                break;
            }
            let _e272 = j_1;
            let _e275 = i_2;
            let _e278 = d_5;
            let _e279 = org_1;
            let _e280 = p0_;
            let _e281 = i_2;
            let _e284 = j_1;
            let _e291 = sz_1;
            let _e298 = textureLoad(tShadowAtlasTexture, (_e279 + clamp((_e280 + vec2<i32>((_e281 - 1i), (_e284 - 1i))), vec2(0i), (_e291 - vec2(1i)))), 0i);
            if (_e278 <= _e298.x) {
                local_13 = 1f;
            } else {
                local_13 = 0f;
            }
            let _e304 = local_13;
            cmp[((_e272 * 4i) + _e275)] = _e304;
            continuing {
                let _e269 = i_2;
                i_2 = (_e269 + 1i);
            }
        }
        continuing {
            let _e260 = j_1;
            j_1 = (_e260 + 1i);
        }
    }
    loop {
        let _e309 = j_2;
        if !((_e309 < 3i)) {
            break;
        }
        i_3 = 0i;
        loop {
            let _e318 = i_3;
            if !((_e318 < 3i)) {
                break;
            }
            let _e325 = lit;
            let _e326 = j_2;
            let _e329 = i_3;
            let _e332 = cmp[((_e326 * 4i) + _e329)];
            let _e333 = j_2;
            let _e336 = i_3;
            let _e341 = cmp[(((_e333 * 4i) + _e336) + 1i)];
            let _e342 = fr;
            let _e345 = j_2;
            let _e348 = i_3;
            let _e353 = cmp[(((_e345 * 4i) + _e348) + 4i)];
            let _e354 = j_2;
            let _e357 = i_3;
            let _e362 = cmp[(((_e354 * 4i) + _e357) + 5i)];
            let _e363 = fr;
            let _e366 = fr;
            lit = (_e325 + mix(mix(_e332, _e341, _e342.x), mix(_e353, _e362, _e363.x), _e366.y));
            continuing {
                let _e322 = i_3;
                i_3 = (_e322 + 1i);
            }
        }
        continuing {
            let _e313 = j_2;
            j_2 = (_e313 + 1i);
        }
    }
    let _e370 = lit;
    return (_e370 / 9f);
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
    let _e185 = global.uSunShadow;
    if (_e185.x < 0.5f) {
        return 1f;
    }
    let _e190 = wp_3;
    dist = length(_e190);
    let _e193 = dist;
    let _e194 = global.uSunShadow;
    if (_e193 > _e194.z) {
        return 1f;
    }
    let _e198 = N_1;
    let _e199 = global.uSunShadowDir;
    ndl = max(dot(_e198, _e199), 0.05f);
    let _e205 = ndl;
    let _e206 = ndl;
    let _e210 = ndl;
    slope = (sqrt((1f - (_e205 * _e206))) / _e210);
    let _e217 = global.uSunShadowVP1_;
    let _e218 = global.uSunShadowL1_;
    let _e219 = wp_3;
    let _e220 = global.uSunShadowL1_;
    let _e223 = slope;
    let _e228 = sunShadowTap(vec2<i32>(2048i, 0i), 2048i, _e217, _e218, _e219, (_e220.w * (1.5f + min(_e223, 6f))));
    s1_ = _e228;
    let _e230 = s1_;
    let _e233 = global.uSunShadow;
    let _e236 = global.uSunShadow;
    let _e238 = dist;
    sh_1 = mix(_e230, 1f, smoothstep((0.85f * _e233.z), _e236.z, _e238));
    let _e242 = dist;
    let _e243 = global.uSunShadow;
    if (_e242 < _e243.y) {
        {
            let _e250 = global.uSunShadowVP0_;
            let _e251 = global.uSunShadowL0_;
            let _e252 = wp_3;
            let _e253 = global.uSunShadowL0_;
            let _e256 = slope;
            let _e261 = sunShadowTap(vec2<i32>(0i, 0i), 2048i, _e250, _e251, _e252, (_e253.w * (1.5f + min(_e256, 6f))));
            s0_ = _e261;
            let _e263 = s0_;
            let _e264 = sh_1;
            let _e266 = global.uSunShadow;
            let _e269 = global.uSunShadow;
            let _e271 = dist;
            sh_1 = mix(_e263, _e264, smoothstep((0.75f * _e266.y), _e269.y, _e271));
        }
    }
    let _e274 = sh_1;
    return _e274;
}

fn grassCover(wp_4: vec3<f32>) -> f32 {
    var wp_5: vec3<f32>;
    var c_2: vec4<f32>;
    var uv_7: vec2<f32>;
    var e: f32;
    var n_4: i32;
    var st_2: vec2<f32>;
    var fr_1: vec2<f32>;
    var p0_1: vec2<i32>;
    var org_2: vec2<i32>;
    var hi: vec2<i32>;
    var a_3: f32;
    var b_2: f32;
    var d_6: f32;
    var f_2: f32;
    var sum: f32;

    wp_5 = wp_4;
    let _e183 = global.uGrassCover;
    if (_e183.x < 0.5f) {
        return 0f;
    }
    let _e188 = global.uGrassCoverVP;
    let _e189 = wp_5;
    c_2 = (_e188 * vec4<f32>(_e189.x, _e189.y, _e189.z, 1f));
    let _e197 = c_2;
    let _e199 = c_2;
    uv_7 = (((_e197.xy / vec2(_e199.w)) * 0.5f) + vec2(0.5f));
    let _e209 = uv_7;
    let _e216 = uv_7;
    e = max(abs(((_e209.x * 2f) - 1f)), abs(((_e216.y * 2f) - 1f)));
    let _e225 = e;
    if (_e225 >= 1f) {
        return 0f;
    }
    let _e229 = global.uGrassCover;
    n_4 = i32(_e229.w);
    let _e233 = uv_7;
    let _e234 = global.uGrassCover;
    st_2 = ((_e233 * _e234.w) - vec2(0.5f));
    let _e241 = st_2;
    fr_1 = fract(_e241);
    let _e244 = st_2;
    p0_1 = vec2<i32>(floor(_e244));
    let _e248 = global.uGrassCover;
    org_2 = vec2<i32>(_e248.yz);
    let _e252 = n_4;
    hi = vec2((_e252 - 1i));
    let _e257 = org_2;
    let _e258 = p0_1;
    let _e261 = hi;
    let _e265 = textureLoad(tShadowAtlasTexture, (_e257 + clamp(_e258, vec2(0i), _e261)), 0i);
    a_3 = _e265.x;
    let _e268 = org_2;
    let _e269 = p0_1;
    let _e276 = hi;
    let _e280 = textureLoad(tShadowAtlasTexture, (_e268 + clamp((_e269 + vec2<i32>(1i, 0i)), vec2(0i), _e276)), 0i);
    b_2 = _e280.x;
    let _e283 = org_2;
    let _e284 = p0_1;
    let _e291 = hi;
    let _e295 = textureLoad(tShadowAtlasTexture, (_e283 + clamp((_e284 + vec2<i32>(0i, 1i)), vec2(0i), _e291)), 0i);
    d_6 = _e295.x;
    let _e298 = org_2;
    let _e299 = p0_1;
    let _e306 = hi;
    let _e310 = textureLoad(tShadowAtlasTexture, (_e298 + clamp((_e299 + vec2<i32>(1i, 1i)), vec2(0i), _e306)), 0i);
    f_2 = _e310.x;
    let _e313 = a_3;
    let _e314 = b_2;
    let _e315 = fr_1;
    let _e318 = d_6;
    let _e319 = f_2;
    let _e320 = fr_1;
    let _e323 = fr_1;
    sum = mix(mix(_e313, _e314, _e315.x), mix(_e318, _e319, _e320.x), _e323.y);
    let _e327 = sum;
    let _e331 = e;
    return (_e327 * (1f - smoothstep(0.75f, 1f, _e331)));
}

fn atlasSum(o_1: vec2<f32>, wp_6: vec3<f32>) -> f32 {
    var o_2: vec2<f32>;
    var wp_7: vec3<f32>;
    var c_3: vec4<f32>;
    var uv_8: vec2<f32>;
    var e_1: f32;
    var n_5: i32;
    var st_3: vec2<f32>;
    var fr_2: vec2<f32>;
    var p0_2: vec2<i32>;
    var org_3: vec2<i32>;
    var hi_1: vec2<i32>;
    var a_4: f32;
    var b_3: f32;
    var d_7: f32;
    var f_3: f32;
    var sum_1: f32;

    o_2 = o_1;
    wp_7 = wp_6;
    let _e185 = global.uTrunkSkyVP;
    let _e186 = wp_7;
    c_3 = (_e185 * vec4<f32>(_e186.x, _e186.y, _e186.z, 1f));
    let _e194 = c_3;
    let _e196 = c_3;
    uv_8 = (((_e194.xy / vec2(_e196.w)) * 0.5f) + vec2(0.5f));
    let _e206 = uv_8;
    let _e213 = uv_8;
    e_1 = max(abs(((_e206.x * 2f) - 1f)), abs(((_e213.y * 2f) - 1f)));
    let _e222 = e_1;
    if (_e222 >= 1f) {
        return 0f;
    }
    let _e226 = global.uTrunkSky;
    n_5 = i32(_e226.w);
    let _e230 = uv_8;
    let _e231 = global.uTrunkSky;
    st_3 = ((_e230 * _e231.w) - vec2(0.5f));
    let _e238 = st_3;
    fr_2 = fract(_e238);
    let _e241 = st_3;
    p0_2 = vec2<i32>(floor(_e241));
    let _e245 = o_2;
    org_3 = vec2<i32>(_e245);
    let _e248 = n_5;
    hi_1 = vec2((_e248 - 1i));
    let _e253 = org_3;
    let _e254 = p0_2;
    let _e257 = hi_1;
    let _e261 = textureLoad(tShadowAtlasTexture, (_e253 + clamp(_e254, vec2(0i), _e257)), 0i);
    a_4 = _e261.x;
    let _e264 = org_3;
    let _e265 = p0_2;
    let _e272 = hi_1;
    let _e276 = textureLoad(tShadowAtlasTexture, (_e264 + clamp((_e265 + vec2<i32>(1i, 0i)), vec2(0i), _e272)), 0i);
    b_3 = _e276.x;
    let _e279 = org_3;
    let _e280 = p0_2;
    let _e287 = hi_1;
    let _e291 = textureLoad(tShadowAtlasTexture, (_e279 + clamp((_e280 + vec2<i32>(0i, 1i)), vec2(0i), _e287)), 0i);
    d_7 = _e291.x;
    let _e294 = org_3;
    let _e295 = p0_2;
    let _e302 = hi_1;
    let _e306 = textureLoad(tShadowAtlasTexture, (_e294 + clamp((_e295 + vec2<i32>(1i, 1i)), vec2(0i), _e302)), 0i);
    f_3 = _e306.x;
    let _e309 = a_4;
    let _e310 = b_3;
    let _e311 = fr_2;
    let _e314 = d_7;
    let _e315 = f_3;
    let _e316 = fr_2;
    let _e319 = fr_2;
    sum_1 = mix(mix(_e309, _e310, _e311.x), mix(_e314, _e315, _e316.x), _e319.y);
    let _e323 = sum_1;
    let _e327 = e_1;
    return (_e323 * (1f - smoothstep(0.75f, 1f, _e327)));
}

fn trunkSum(wp_8: vec3<f32>) -> f32 {
    var wp_9: vec3<f32>;
    var local_14: f32;

    wp_9 = wp_8;
    let _e183 = global.uTrunkSky;
    if (_e183.x < 0.5f) {
        local_14 = 0f;
    } else {
        let _e188 = global.uTrunkSky;
        let _e190 = wp_9;
        let _e191 = atlasSum(_e188.yz, _e190);
        local_14 = _e191;
    }
    let _e193 = local_14;
    return _e193;
}

fn rockSum(wp_10: vec3<f32>) -> f32 {
    var wp_11: vec3<f32>;
    var local_15: f32;

    wp_11 = wp_10;
    let _e183 = global.uRockSky;
    if (_e183.x < 0.5f) {
        local_15 = 0f;
    } else {
        let _e188 = global.uRockSky;
        let _e190 = wp_11;
        let _e191 = atlasSum(_e188.yz, _e190);
        local_15 = _e191;
    }
    let _e193 = local_15;
    return _e193;
}

fn trunkSky(wp_12: vec3<f32>) -> f32 {
    var wp_13: vec3<f32>;

    wp_13 = wp_12;
    let _e183 = wp_13;
    let _e184 = trunkSum(_e183);
    let _e186 = wp_13;
    let _e187 = rockSum(_e186);
    return exp((-(_e184) - _e187));
}

fn skyRing(sc: vec2<f32>, d_8: f32, D: f32, a_5: f32, b_4: f32) -> f32 {
    var sc_1: vec2<f32>;
    var d_9: f32;
    var D_1: f32;
    var a_6: f32;
    var b_5: f32;
    var dh: f32;
    var h2_: f32;

    sc_1 = sc;
    d_9 = d_8;
    D_1 = D;
    a_6 = a_5;
    b_5 = b_4;
    let _e191 = sc_1;
    if (_e191.x <= 0.003f) {
        return 0f;
    }
    let _e196 = d_9;
    let _e197 = D_1;
    let _e198 = sc_1;
    let _e200 = sc_1;
    dh = (_e196 - (_e197 + (_e198.y / _e200.x)));
    let _e206 = dh;
    if (_e206 <= 0f) {
        return 0f;
    }
    let _e210 = dh;
    let _e211 = dh;
    h2_ = (_e210 * _e211);
    let _e214 = sc_1;
    let _e216 = b_5;
    let _e217 = b_5;
    let _e219 = b_5;
    let _e220 = b_5;
    let _e222 = h2_;
    let _e225 = a_6;
    let _e226 = a_6;
    let _e228 = a_6;
    let _e229 = a_6;
    let _e231 = h2_;
    return (_e214.x * (((_e216 * _e217) / ((_e219 * _e220) + _e222)) - ((_e225 * _e226) / (((_e228 * _e229) + _e231) + 0.000001f))));
}

fn skyShadowMap(u0_: f32, D_2: f32, VP_2: mat4x4<f32>, L_4: vec4<f32>, upF_1: vec3<f32>, ext: f32, pF_2: vec3<f32>) -> f32 {
    var u0_1: f32;
    var D_3: f32;
    var VP_3: mat4x4<f32>;
    var L_5: vec4<f32>;
    var upF_2: vec3<f32>;
    var ext_1: f32;
    var pF_3: vec3<f32>;
    var c_4: vec4<f32>;
    var uv_9: vec2<f32>;
    var edge: f32;
    var NB: f32 = 6f;
    var x0_: f32;
    var C: vec4<f32>;
    var A: vec4<f32>;
    var B: vec4<f32>;
    var d_10: f32;

    u0_1 = u0_;
    D_3 = D_2;
    VP_3 = VP_2;
    L_5 = L_4;
    upF_2 = upF_1;
    ext_1 = ext;
    pF_3 = pF_2;
    let _e195 = VP_3;
    let _e196 = pF_3;
    c_4 = (_e195 * vec4<f32>(_e196.x, _e196.y, _e196.z, 1f));
    let _e204 = c_4;
    let _e206 = c_4;
    uv_9 = (((_e204.xy / vec2(_e206.w)) * 0.5f) + vec2(0.5f));
    let _e218 = ext_1;
    edge = (45f / (2f * _e218));
    let _e222 = uv_9;
    let _e223 = edge;
    let _e227 = uv_9;
    let _e229 = edge;
    if (any((_e222 < vec2(_e223))) || any((_e227 > vec2((1f - _e229))))) {
        return -1f;
    }
    let _e237 = uv_9;
    uv_9 = clamp(_e237, vec2(0.0009765625f), vec2(0.99902344f));
    let _e251 = u0_1;
    x0_ = (_e251 * 3f);
    let _e255 = x0_;
    let _e258 = uv_9;
    let _e261 = NB;
    let _e263 = uv_9;
    let _e267 = textureSampleLevel(tSkyRingsTexture, tSkyRingsSampler, vec2<f32>((((_e255 + 2f) + _e258.x) / _e261), _e263.y), 0f);
    C = _e267;
    let _e269 = C;
    if (_e269.z < 0.002f) {
        return 0f;
    }
    let _e274 = x0_;
    let _e275 = uv_9;
    let _e278 = NB;
    let _e280 = uv_9;
    let _e284 = textureSampleLevel(tSkyRingsTexture, tSkyRingsSampler, vec2<f32>(((_e274 + _e275.x) / _e278), _e280.y), 0f);
    A = _e284;
    let _e286 = x0_;
    let _e289 = uv_9;
    let _e292 = NB;
    let _e294 = uv_9;
    let _e298 = textureSampleLevel(tSkyRingsTexture, tSkyRingsSampler, vec2<f32>((((_e286 + 1f) + _e289.x) / _e292), _e294.y), 0f);
    B = _e298;
    let _e300 = L_5;
    let _e302 = pF_3;
    let _e304 = upF_2;
    let _e308 = L_5;
    d_10 = (dot((_e300.xyz - _e302), _e304) - (0.3f + (1.5f * _e308.w)));
    let _e314 = A;
    let _e316 = d_10;
    let _e317 = D_3;
    let _e320 = skyRing(_e314.xy, _e316, _e317, 0f, 1f);
    let _e321 = A;
    let _e323 = d_10;
    let _e324 = D_3;
    let _e327 = skyRing(_e321.zw, _e323, _e324, 1f, 3.5f);
    let _e329 = B;
    let _e331 = d_10;
    let _e332 = D_3;
    let _e335 = skyRing(_e329.xy, _e331, _e332, 3.5f, 9f);
    let _e337 = B;
    let _e339 = d_10;
    let _e340 = D_3;
    let _e343 = skyRing(_e337.zw, _e339, _e340, 9f, 20f);
    let _e345 = C;
    let _e347 = d_10;
    let _e348 = D_3;
    let _e351 = skyRing(_e345.xy, _e347, _e348, 20f, 45f);
    return clamp(((((_e320 + _e327) + _e335) + _e343) + _e351), 0f, 1f);
}

fn skyBlocked(wp_14: vec3<f32>) -> f32 {
    var wp_15: vec3<f32>;
    var dist_1: f32;
    var pF_4: vec3<f32>;
    var bl: f32 = -1f;

    wp_15 = wp_14;
    let _e183 = global.uSkyShadow;
    if (_e183.x < 0.5f) {
        return 0f;
    }
    let _e188 = wp_15;
    dist_1 = length(_e188);
    let _e191 = dist_1;
    let _e192 = global.uSkyShadow;
    if (_e191 > _e192.z) {
        return 0f;
    }
    let _e196 = global.uSkyToFixed;
    let _e197 = wp_15;
    let _e198 = global.uSkyCenter;
    pF_4 = (_e196 * (_e197 - _e198));
    let _e205 = dist_1;
    let _e206 = global.uSkyShadow;
    if (_e205 < _e206.y) {
        let _e210 = global.uSkyD;
        let _e212 = global.uSkyShadowVP0_;
        let _e213 = global.uSkyShadowL0_;
        let _e214 = global.uSkyShadowUp0_;
        let _e215 = global.uSkyShadow;
        let _e217 = pF_4;
        let _e218 = skyShadowMap(0f, _e210.x, _e212, _e213, _e214, _e215.y, _e217);
        bl = _e218;
    }
    let _e219 = bl;
    if (_e219 < 0f) {
        let _e223 = global.uSkyD;
        let _e225 = global.uSkyShadowVP1_;
        let _e226 = global.uSkyShadowL1_;
        let _e227 = global.uSkyShadowUp1_;
        let _e228 = global.uSkyShadow;
        let _e230 = pF_4;
        let _e231 = skyShadowMap(1f, _e223.y, _e225, _e226, _e227, _e228.z, _e230);
        bl = _e231;
    }
    let _e232 = bl;
    if (_e232 < 0f) {
        return 0f;
    }
    let _e236 = bl;
    let _e239 = global.uSkyShadow;
    let _e242 = global.uSkyShadow;
    let _e244 = dist_1;
    return (_e236 * (1f - smoothstep((0.8f * _e239.z), _e242.z, _e244)));
}

fn canopyLit(bl_1: f32, sunTop: vec3<f32>, muS_2: f32, skyE_1: vec3<f32>) -> vec3<f32> {
    var bl_2: f32;
    var sunTop_1: vec3<f32>;
    var muS_3: f32;
    var skyE_2: vec3<f32>;

    bl_2 = bl_1;
    sunTop_1 = sunTop;
    muS_3 = muS_2;
    skyE_2 = skyE_1;
    let _e189 = bl_2;
    let _e192 = sunTop_1;
    let _e193 = muS_3;
    let _e197 = skyE_2;
    let _e200 = global.uLeafTint;
    return (((_e189 * 0.1f) * ((_e192 * max(_e193, 0f)) + _e197)) * _e200);
}

fn moonLit(rel_2: vec3<f32>, r_8: f32, up_2: vec3<f32>, N_2: vec3<f32>, sh_2: f32, trans: f32, wrap: f32, skyK: f32) -> vec3<f32> {
    var rel_3: vec3<f32>;
    var r_9: f32;
    var up_3: vec3<f32>;
    var N_3: vec3<f32>;
    var sh_3: f32;
    var trans_1: f32;
    var wrap_1: f32;
    var skyK_1: f32;
    var muM: f32;
    var pF_5: vec3<f32>;
    var T_3: vec3<f32>;
    var S: vec3<f32>;
    var nd: f32;

    rel_3 = rel_2;
    r_9 = r_8;
    up_3 = up_2;
    N_3 = N_2;
    sh_3 = sh_2;
    trans_1 = trans;
    wrap_1 = wrap;
    skyK_1 = skyK;
    let _e197 = global.uMoonE;
    if (_e197.y <= 0f) {
        return vec3(0f);
    }
    let _e203 = up_3;
    let _e204 = global.uMoonDir;
    muM = dot(_e203, _e204);
    let _e207 = muM;
    if (_e207 < -0.1f) {
        return vec3(0f);
    }
    let _e213 = global.uToFixed;
    let _e214 = rel_3;
    pF_5 = (_e213 * _e214);
    let _e217 = r_9;
    let _e218 = muM;
    let _e219 = atmoSunTransmittance(_e217, _e218);
    let _e220 = pF_5;
    let _e221 = pF_5;
    let _e223 = global.uToFixed;
    let _e224 = global.uMoonDir;
    let _e226 = global.uRadius;
    let _e227 = terrainShadow(_e220, normalize(_e221), (_e223 * _e224), _e226);
    let _e229 = sh_3;
    let _e231 = cloudDirZ;
    T_3 = (((_e219 * _e227) * _e229) * _e231);
    let _e234 = r_9;
    let _e235 = muM;
    let _e236 = atmoSkyIrradiance(_e234, _e235);
    let _e237 = cloudTotZ;
    S = (_e236 * _e237);
    let _e240 = N_3;
    let _e241 = global.uMoonDir;
    nd = dot(_e240, _e241);
    let _e244 = global.uMoonE;
    let _e245 = T_3;
    let _e246 = nd;
    let _e249 = trans_1;
    let _e250 = nd;
    let _e257 = S;
    let _e258 = wrap_1;
    let _e260 = skyK_1;
    return (_e244 * ((_e245 * (max(_e246, 0f) + (_e249 * max(-(_e250), 0f)))) + ((_e257 * _e258) * _e260)));
}

fn deferredLight(p: vec3<f32>, N_4: vec3<f32>, albedo: vec3<f32>, roughness: f32, ao: f32, wet: f32, f0_1: f32, cave: f32, trans_2: f32, foot_8: f32, metal: f32, kind: f32, selfShadow: f32, screenAO: f32) -> vec3<f32> {
    var p_1: vec3<f32>;
    var N_5: vec3<f32>;
    var albedo_1: vec3<f32>;
    var roughness_1: f32;
    var ao_1: f32;
    var wet_1: f32;
    var f0_2: f32;
    var cave_1: f32;
    var trans_3: f32;
    var foot_9: f32;
    var metal_1: f32;
    var kind_1: f32;
    var selfShadow_1: f32;
    var screenAO_1: f32;
    var rel_4: vec3<f32>;
    var r_10: f32;
    var up_4: vec3<f32>;
    var muS_4: f32;
    var sunT: vec3<f32>;
    var skyE_3: vec3<f32>;
    var cloudT: f32;
    var pF_6: vec3<f32>;
    var sunTop_2: vec3<f32>;
    var keySh: f32;
    var nd_1: f32;
    var ndl_1: f32;
    var local_16: f32;
    var wrap_2: f32;
    var direct: vec3<f32>;
    var skyBl: f32;
    var local_17: f32;
    var skyK_2: f32;
    var ambient: vec3<f32>;
    var local_18: f32;
    var gSum: f32;
    var gCov: f32;
    var diffuse: vec3<f32>;
    var color: vec3<f32>;
    var V: vec3<f32>;
    var H_1: vec3<f32>;
    var rg: f32;
    var a2_: f32;
    var NdH: f32;
    var NdV: f32;
    var VdH: f32;
    var Dg: f32;
    var kk: f32;
    var Gg: f32;
    var Fs: f32;
    var poolK: f32;
    var cP: f32;
    var Fp: f32;
    var a_7: vec3<f32>;

    p_1 = p;
    N_5 = N_4;
    albedo_1 = albedo;
    roughness_1 = roughness;
    ao_1 = ao;
    wet_1 = wet;
    f0_2 = f0_1;
    cave_1 = cave;
    trans_3 = trans_2;
    foot_9 = foot_8;
    metal_1 = metal;
    kind_1 = kind;
    selfShadow_1 = selfShadow;
    screenAO_1 = screenAO;
    let _e209 = kind_1;
    if (_e209 == 5f) {
        return vec3(0f);
    }
    let _e214 = p_1;
    let _e215 = global.uCenter;
    rel_4 = (_e214 - _e215);
    let _e218 = rel_4;
    r_10 = length(_e218);
    let _e221 = rel_4;
    let _e222 = r_10;
    up_4 = (_e221 / vec3(max(_e222, 0.000001f)));
    let _e228 = up_4;
    let _e229 = global.uSunDir;
    muS_4 = dot(_e228, _e229);
    let _e232 = r_10;
    let _e233 = muS_4;
    let _e234 = atmoSunTransmittance(_e232, _e233);
    sunT = _e234;
    let _e236 = r_10;
    let _e237 = muS_4;
    let _e238 = atmoSkyIrradiance(_e236, _e237);
    skyE_3 = _e238;
    let _e240 = rel_4;
    let _e241 = r_10;
    let _e242 = muS_4;
    let _e243 = foot_9;
    let _e244 = sunT;
    let _e247 = cloudLight(_e240, _e241, _e242, _e243, _e244, (&skyE_3));
    cloudT = _e247;
    let _e249 = sunT;
    let _e250 = cloudT;
    sunT = (_e249 * _e250);
    let _e252 = global.uToFixed;
    let _e253 = rel_4;
    pF_6 = (_e252 * _e253);
    let _e256 = sunT;
    let _e257 = pF_6;
    let _e258 = pF_6;
    let _e260 = global.uToFixed;
    let _e261 = global.uSunDir;
    let _e263 = global.uRadius;
    let _e264 = terrainShadow(_e257, normalize(_e258), (_e260 * _e261), _e263);
    sunT = (_e256 * _e264);
    let _e266 = sunT;
    sunTop_2 = _e266;
    let _e268 = p_1;
    let _e269 = N_5;
    let _e270 = sunShadowMap(_e268, _e269);
    keySh = _e270;
    let _e272 = sunT;
    let _e273 = keySh;
    sunT = (_e272 * _e273);
    let _e275 = N_5;
    let _e276 = global.uSunDir;
    nd_1 = dot(_e275, _e276);
    let _e279 = nd_1;
    ndl_1 = max(_e279, 0f);
    let _e283 = kind_1;
    if (_e283 == 2f) {
        let _e288 = N_5;
        let _e289 = up_4;
        local_16 = (0.55f + (0.45f * dot(_e288, _e289)));
    } else {
        let _e295 = N_5;
        let _e296 = up_4;
        local_16 = (0.5f + (0.5f * dot(_e295, _e296)));
    }
    let _e301 = local_16;
    wrap_2 = _e301;
    let _e303 = kind_1;
    if (_e303 == 7f) {
        let _e306 = albedo_1;
        let _e310 = global.uSunE;
        let _e312 = sunT;
        let _e313 = ndl_1;
        let _e315 = N_5;
        let _e316 = p_1;
        let _e325 = selfShadow_1;
        let _e327 = skyE_3;
        return (((_e306 / vec3(3.1415927f)) * _e310) * ((((_e312 * _e313) * pow(max(dot(_e315, normalize(-(_e316))), 0f), 0.15f)) * _e325) + (_e327 * 0.6f)));
    }
    let _e332 = global.uSunE;
    let _e333 = sunT;
    let _e335 = ndl_1;
    let _e336 = trans_3;
    let _e337 = nd_1;
    direct = ((_e332 * _e333) * (_e335 + (_e336 * max(-(_e337), 0f))));
    let _e345 = p_1;
    let _e346 = skyBlocked(_e345);
    skyBl = _e346;
    let _e348 = screenAO_1;
    let _e350 = skyBl;
    let _e353 = kind_1;
    if (_e353 == 1f) {
        let _e356 = p_1;
        let _e357 = trunkSum(_e356);
        local_17 = exp(-(_e357));
    } else {
        let _e360 = p_1;
        let _e361 = trunkSky(_e360);
        local_17 = _e361;
    }
    let _e363 = local_17;
    skyK_2 = ((_e348 * (1f - _e350)) * _e363);
    let _e366 = global.uSunE;
    let _e367 = skyE_3;
    let _e368 = wrap_2;
    let _e370 = skyK_2;
    let _e372 = skyBl;
    let _e373 = sunTop_2;
    let _e374 = muS_4;
    let _e375 = skyE_3;
    let _e376 = canopyLit(_e372, _e373, _e374, _e375);
    let _e377 = screenAO_1;
    let _e381 = global.uAmbientFloor;
    let _e382 = screenAO_1;
    let _e385 = rel_4;
    let _e386 = r_10;
    let _e387 = up_4;
    let _e388 = N_5;
    let _e389 = keySh;
    let _e390 = trans_3;
    let _e391 = wrap_2;
    let _e392 = skyK_2;
    let _e393 = moonLit(_e385, _e386, _e387, _e388, _e389, _e390, _e391, _e392);
    ambient = (((_e366 * (((_e367 * _e368) * _e370) + (_e376 * _e377))) + (_e381 * _e382)) + _e393);
    let _e396 = kind_1;
    if (_e396 == 3f) {
        local_18 = 0f;
    } else {
        let _e400 = p_1;
        let _e401 = grassCover(_e400);
        local_18 = _e401;
    }
    let _e403 = local_18;
    gSum = _e403;
    let _e407 = gSum;
    gCov = exp((-2.2f * _e407));
    let _e411 = direct;
    let _e412 = gCov;
    let _e413 = selfShadow_1;
    direct = (_e411 * (_e412 * _e413));
    let _e416 = ambient;
    let _e422 = gSum;
    ambient = (_e416 * (1f - (0.35f * (1f - exp((-0.8f * _e422))))));
    let _e429 = albedo_1;
    let _e431 = metal_1;
    diffuse = (_e429 * (1f - _e431));
    let _e435 = diffuse;
    let _e439 = direct;
    let _e441 = ao_1;
    let _e445 = ambient;
    let _e446 = ao_1;
    let _e450 = cave_1;
    color = (((_e435 / vec3(3.1415927f)) * ((_e439 * mix(1f, _e441, 0.35f)) + (_e445 * _e446))) * _e450);
    let _e453 = p_1;
    V = normalize(-(_e453));
    let _e457 = V;
    let _e458 = global.uSunDir;
    H_1 = normalize((_e457 + _e458));
    let _e462 = roughness_1;
    let _e464 = wet_1;
    rg = clamp(mix(_e462, 0.12f, (_e464 * 0.8f)), 0.05f, 1f);
    let _e472 = rg;
    let _e473 = rg;
    let _e475 = rg;
    let _e477 = rg;
    a2_ = (((_e472 * _e473) * _e475) * _e477);
    let _e480 = N_5;
    let _e481 = H_1;
    NdH = max(dot(_e480, _e481), 0f);
    let _e486 = N_5;
    let _e487 = V;
    NdV = max(dot(_e486, _e487), 0.001f);
    let _e492 = V;
    let _e493 = H_1;
    VdH = max(dot(_e492, _e493), 0f);
    let _e498 = a2_;
    let _e499 = NdH;
    let _e500 = NdH;
    let _e502 = a2_;
    Dg = (_e498 / (PI * pow((((_e499 * _e500) * (_e502 - 1f)) + 1f), 2f)));
    let _e513 = rg;
    let _e516 = rg;
    kk = (((_e513 + 1f) * (_e516 + 1f)) / 8f);
    let _e523 = NdV;
    let _e524 = NdV;
    let _e526 = kk;
    let _e529 = kk;
    let _e532 = ndl_1;
    let _e534 = ndl_1;
    let _e536 = kk;
    let _e539 = kk;
    Gg = (((_e523 / ((_e524 * (1f - _e526)) + _e529)) * _e532) / ((_e534 * (1f - _e536)) + _e539));
    let _e543 = f0_2;
    let _e545 = f0_2;
    let _e548 = VdH;
    Fs = (_e543 + ((1f - _e545) * pow((1f - _e548), 5f)));
    let _e555 = kind_1;
    if (_e555 != 2f) {
        let _e558 = color;
        let _e559 = global.uSunE;
        let _e560 = sunT;
        let _e562 = gCov;
        let _e564 = selfShadow_1;
        let _e566 = Dg;
        let _e568 = Gg;
        let _e570 = Fs;
        let _e572 = albedo_1;
        let _e575 = albedo_1;
        let _e578 = VdH;
        let _e584 = metal_1;
        let _e589 = NdV;
        color = (_e558 + (((((((_e559 * _e560) * _e562) * _e564) * _e566) * _e568) * mix(vec3(_e570), (_e572 + ((vec3(1f) - _e575) * pow((1f - _e578), 5f))), vec3(_e584))) / vec3((4f * _e589))));
    }
    let _e596 = wet_1;
    poolK = smoothstep(0.85f, 1f, _e596);
    let _e599 = poolK;
    if (_e599 > 0f) {
        {
            let _e602 = up_4;
            let _e603 = V;
            cP = max(dot(_e602, _e603), 0.001f);
            let _e611 = cP;
            Fp = (0.02f + (0.98f * pow((1f - _e611), 5f)));
            let _e618 = color;
            let _e619 = color;
            let _e621 = Fp;
            let _e624 = global.uSunE;
            let _e625 = skyE_3;
            let _e632 = Fp;
            let _e634 = screenAO_1;
            let _e637 = global.uSunE;
            let _e638 = sunT;
            let _e642 = V;
            let _e644 = up_4;
            let _e646 = global.uSunDir;
            let _e654 = poolK;
            color = mix(_e618, (((_e619 * (1f - _e621)) + (((((_e624 * _e625) / vec3(3.1415927f)) * 1.1f) * _e632) * _e634)) + (((_e637 * _e638) * 0.05f) * pow(max(dot(reflect(-(_e642), _e644), _e646), 0f), 200f))), vec3(_e654));
        }
    }
    let _e657 = global.uThermal;
    if (_e657.x > 0f) {
        {
            let _e661 = albedo_1;
            a_7 = clamp(_e661, vec3(0f), vec3(1f));
            let _e668 = color;
            let _e671 = a_7;
            let _e673 = global.uThermal;
            let _e675 = global.uThermal;
            let _e677 = r_10;
            let _e678 = global.uRadius;
            let _e682 = blackbodyGlow((_e673.x - (_e675.y * (_e677 - _e678))));
            color = (_e668 + ((vec3(1f) - _e671) * _e682));
            let _e685 = color;
            let _e686 = a_7;
            let _e689 = r_10;
            let _e691 = atmoSunTransmittance(_e689, 1f);
            let _e694 = global.uThermal;
            let _e696 = global.uThermal;
            let _e698 = r_10;
            let _e699 = global.uRadius;
            let _e705 = blackbodyGlow((_e694.x - (_e696.z * max((_e698 - _e699), 0f))));
            color = (_e685 + ((_e686 * (vec3(1f) - _e691)) * _e705));
        }
    }
    let _e708 = color;
    return _e708;
}

fn nativeLocal(clusterWorld: vec3<f32>, clusterNormal: vec3<f32>, clusterAlbedo: vec4<f32>, clusterSurface: vec4<f32>, clusterRough: f32, clusterKind: f32, clusterPixel: vec2<f32>) -> vec3<f32> {
    var clusterWorld_1: vec3<f32>;
    var clusterNormal_1: vec3<f32>;
    var clusterAlbedo_1: vec4<f32>;
    var clusterSurface_1: vec4<f32>;
    var clusterRough_1: f32;
    var clusterKind_1: f32;
    var clusterPixel_1: vec2<f32>;

    clusterWorld_1 = clusterWorld;
    clusterNormal_1 = clusterNormal;
    clusterAlbedo_1 = clusterAlbedo;
    clusterSurface_1 = clusterSurface;
    clusterRough_1 = clusterRough;
    clusterKind_1 = clusterKind;
    clusterPixel_1 = clusterPixel;
    return clusterLight(clusterWorld,clusterNormal,clusterAlbedo,clusterSurface,clusterRough,u32(clusterKind),clusterPixel);
}

fn texUV(channel: i32, transform: mat3x3<f32>) -> vec2<f32> {
    var channel_1: i32;
    var transform_1: mat3x3<f32>;
    var local_19: vec2<f32>;
    var local_20: vec2<f32>;

    channel_1 = channel;
    transform_1 = transform;
    let _e193 = transform_1;
    let _e194 = channel_1;
    if (_e194 == 1i) {
        let _e197 = vUv1_1;
        local_20 = _e197;
    } else {
        let _e198 = channel_1;
        if (_e198 == 2i) {
            let _e201 = vUv2_1;
            local_19 = _e201;
        } else {
            let _e202 = vUv_1;
            local_19 = _e202;
        }
        let _e204 = local_19;
        local_20 = _e204;
    }
    let _e206 = local_20;
    return (_e193 * vec3<f32>(_e206.x, _e206.y, 1f)).xy;
}

fn main_1() {
    var dpX: vec3<f32>;
    var dpY: vec3<f32>;
    var nUV: vec2<f32>;
    var dx: vec2<f32>;
    var dy: vec2<f32>;
    var uv0_: vec2<f32>;
    var uvR: vec2<f32>;
    var uvM: vec2<f32>;
    var uvE: vec2<f32>;
    var uvA: vec2<f32>;
    var uvAlpha: vec2<f32>;
    var base: vec4<f32>;
    var local_21: f32;
    var mask: vec4<f32>;
    var paint: vec3<f32>;
    var an: vec3<f32>;
    var local_22: vec2<f32>;
    var local_23: vec2<f32>;
    var q_2: vec2<f32>;
    var f_4: vec2<f32>;
    var fw: vec2<f32>;
    var fade: f32;
    var seam: f32;
    var tone: f32;
    var rough: f32;
    var metal_2: f32;
    var ao_2: f32;
    var emit: vec3<f32>;
    var local_24: vec3<f32>;
    var N_6: vec3<f32>;
    var mapN: vec3<f32>;
    var q1_: vec3<f32>;
    var q0_: vec3<f32>;
    var T_4: vec3<f32>;
    var B_1: vec3<f32>;
    var scale: f32;
    var local_25: f32;
    var kind_2: f32;
    var color_1: vec3<f32>;
    var alpha: f32;
    var fresK: f32;

    let _e189 = vWorld_1;
    let _e190 = dpdx(_e189);
    dpX = _e190;
    let _e192 = vWorld_1;
    let _e193 = dpdy(_e192);
    dpY = _e193;
    let _e195 = global.uChannels;
    let _e197 = global.normalMapTransform;
    let _e198 = texUV(_e195.y, _e197);
    nUV = _e198;
    let _e200 = nUV;
    let _e201 = dpdx(_e200);
    dx = _e201;
    let _e203 = nUV;
    let _e204 = dpdy(_e203);
    dy = _e204;
    let _e206 = global.uChannels;
    let _e208 = global.mapTransform;
    let _e209 = texUV(_e206.x, _e208);
    uv0_ = _e209;
    let _e211 = global.uChannels;
    let _e213 = global.roughnessMapTransform;
    let _e214 = texUV(_e211.z, _e213);
    uvR = _e214;
    let _e216 = global.uChannels;
    let _e218 = global.metalnessMapTransform;
    let _e219 = texUV(_e216.w, _e218);
    uvM = _e219;
    let _e221 = global.uChannels2_;
    let _e223 = global.emissiveMapTransform;
    let _e224 = texUV(_e221.x, _e223);
    uvE = _e224;
    let _e226 = global.uChannels2_;
    let _e228 = global.aoMapTransform;
    let _e229 = texUV(_e226.y, _e228);
    uvA = _e229;
    let _e231 = global.uChannels2_;
    let _e233 = global.alphaMapTransform;
    let _e234 = texUV(_e231.z, _e233);
    uvAlpha = _e234;
    let _e236 = global.uBase;
    let _e237 = uv0_;
    let _e238 = uv0_;
    let _e239 = dpdx(_e238);
    let _e240 = uv0_;
    let _e241 = dpdy(_e240);
    let _e242 = textureSampleGrad(mapTexture, mapSampler, _e237, _e239, _e241);
    base = (_e236 * _e242);
    let _e245 = global.uLivery;
    if (_e245.x > 0.5f) {
        {
            let _e249 = vColor_1;
            let _e250 = _e249.xyz;
            let _e251 = global.uLivery;
            if (_e251.y > 0.5f) {
                let _e255 = vColor_1;
                local_21 = _e255.w;
            } else {
                local_21 = 0f;
            }
            let _e259 = local_21;
            mask = vec4<f32>(_e250.x, _e250.y, _e250.z, _e259);
            let _e265 = global.uPaint1_;
            let _e266 = global.uPaint2_;
            let _e267 = mask;
            let _e271 = global.uPaint3_;
            let _e272 = mask;
            paint = mix(mix(_e265, _e266, vec3(_e267.y)), _e271, vec3(_e272.z));
            let _e277 = vObjN_1;
            an = abs(_e277);
            let _e280 = an;
            let _e282 = an;
            let _e284 = an;
            if (_e280.x > max(_e282.y, _e284.z)) {
                let _e288 = vObjPos_1;
                local_23 = _e288.zy;
            } else {
                let _e290 = an;
                let _e292 = an;
                if (_e290.y > _e292.z) {
                    let _e295 = vObjPos_1;
                    local_22 = _e295.xz;
                } else {
                    let _e297 = vObjPos_1;
                    local_22 = _e297.xy;
                }
                let _e300 = local_22;
                local_23 = _e300;
            }
            let _e302 = local_23;
            q_2 = _e302;
            let _e304 = q_2;
            f_4 = (fract((_e304 / vec2<f32>(9f, 4.5f))) - vec2(0.5f));
            let _e314 = q_2;
            let _e319 = fwidth((_e314 / vec2<f32>(9f, 4.5f)));
            fw = _e319;
            let _e324 = fw;
            let _e326 = fw;
            fade = (1f - smoothstep(0.03f, 0.12f, max(_e324.x, _e326.y)));
            let _e332 = fade;
            let _e336 = fw;
            let _e342 = f_4;
            let _e351 = fw;
            let _e357 = f_4;
            seam = (_e332 * max((1f - smoothstep(0f, ((1.5f * _e336.x) + 0.004f), (0.5f - abs(_e342.x)))), (1f - smoothstep(0f, ((1.5f * _e351.y) + 0.004f), (0.5f - abs(_e357.y))))));
            let _e366 = q_2;
            tone = fract((sin(dot(floor((_e366 / vec2<f32>(9f, 4.5f))), vec2<f32>(12.9898f, 78.233f))) * 43758.547f));
            let _e381 = base;
            let _e383 = base;
            let _e385 = paint;
            let _e388 = tone;
            let _e394 = seam;
            let _e400 = mask;
            let _e405 = (_e383.xyz * (((_e385 * (0.9f + (0.12f * _e388))) * (1f - (0.35f * _e394))) * (1f - (0.45f * _e400.w))));
            base.x = _e405.x;
            base.y = _e405.y;
            base.z = _e405.z;
        }
    } else {
        let _e412 = global.uFlags;
        if (_e412.x > 0.5f) {
            let _e416 = base;
            let _e417 = vColor_1;
            base = (_e416 * _e417);
        } else {
            let _e419 = base;
            let _e421 = base;
            let _e423 = vColor_1;
            let _e425 = (_e421.xyz * _e423.xyz);
            base.x = _e425.x;
            base.y = _e425.y;
            base.z = _e425.z;
        }
    }
    let _e433 = base;
    let _e435 = uvAlpha;
    let _e436 = uvAlpha;
    let _e437 = dpdx(_e436);
    let _e438 = uvAlpha;
    let _e439 = dpdy(_e438);
    let _e440 = textureSampleGrad(alphaMapTexture, alphaMapSampler, _e435, _e437, _e439);
    base.w = (_e433.w * _e440.y);
    let _e443 = global.uPBR;
    let _e445 = uvR;
    let _e446 = uvR;
    let _e447 = dpdx(_e446);
    let _e448 = uvR;
    let _e449 = dpdy(_e448);
    let _e450 = textureSampleGrad(roughnessMapTexture, roughnessMapSampler, _e445, _e447, _e449);
    rough = (_e443.x * _e450.y);
    let _e454 = global.uPBR;
    let _e456 = uvM;
    let _e457 = uvM;
    let _e458 = dpdx(_e457);
    let _e459 = uvM;
    let _e460 = dpdy(_e459);
    let _e461 = textureSampleGrad(metalnessMapTexture, metalnessMapSampler, _e456, _e458, _e460);
    metal_2 = (_e454.y * _e461.z);
    let _e466 = uvA;
    let _e467 = uvA;
    let _e468 = dpdx(_e467);
    let _e469 = uvA;
    let _e470 = dpdy(_e469);
    let _e471 = textureSampleGrad(aoMapTexture, aoMapSampler, _e466, _e468, _e470);
    let _e473 = global.uPBR;
    ao_2 = mix(1f, _e471.x, _e473.w);
    let _e477 = global.uEmissive;
    let _e478 = uvE;
    let _e479 = uvE;
    let _e480 = dpdx(_e479);
    let _e481 = uvE;
    let _e482 = dpdy(_e481);
    let _e483 = textureSampleGrad(emissiveMapTexture, emissiveMapSampler, _e478, _e480, _e482);
    emit = (_e477 * _e483.xyz);
    let _e487 = global.uFlags;
    if (_e487.w > 0.5f) {
        let _e491 = dpX;
        let _e492 = dpY;
        local_24 = cross(_e491, _e492);
    } else {
        let _e494 = vNormal_1;
        local_24 = _e494;
    }
    let _e496 = local_24;
    N_6 = normalize(_e496);
    let _e500 = gl_FrontFacing_1;
    if !(_e500) {
        let _e502 = N_6;
        N_6 = -(_e502);
    }
    let _e504 = nUV;
    let _e505 = dx;
    let _e506 = dy;
    let _e507 = textureSampleGrad(normalMapTexture, normalMapSampler, _e504, _e505, _e506);
    mapN = ((_e507.xyz * 2f) - vec3(1f));
    let _e515 = global.uFlags;
    if (_e515.z > 0.5f) {
        {
            let _e519 = mapN;
            let _e521 = mapN;
            let _e523 = global.uNormalScale;
            let _e524 = (_e521.xy * _e523);
            mapN.x = _e524.x;
            mapN.y = _e524.y;
            let _e529 = dpY;
            let _e530 = N_6;
            q1_ = cross(_e529, _e530);
            let _e533 = N_6;
            let _e534 = dpX;
            q0_ = cross(_e533, _e534);
            let _e537 = q1_;
            let _e538 = dx;
            let _e541 = q0_;
            let _e542 = dy;
            T_4 = ((_e537 * _e538.x) + (_e541 * _e542.x));
            let _e547 = q1_;
            let _e548 = dx;
            let _e551 = q0_;
            let _e552 = dy;
            B_1 = ((_e547 * _e548.y) + (_e551 * _e552.y));
            let _e557 = T_4;
            let _e558 = T_4;
            let _e560 = B_1;
            let _e561 = B_1;
            scale = inverseSqrt(max(max(dot(_e557, _e558), dot(_e560, _e561)), 0.00000000000000000001f));
            let _e568 = T_4;
            let _e569 = mapN;
            let _e571 = scale;
            let _e574 = B_1;
            let _e575 = mapN;
            let _e577 = scale;
            let _e581 = N_6;
            let _e582 = mapN;
            N_6 = normalize((((_e568 * (_e569.x * _e571)) + (_e574 * (_e575.y * _e577))) + (_e581 * _e582.z)));
        }
    }
    let _e587 = base;
    let _e589 = global.uPBR;
    if (_e587.w < _e589.z) {
        discard;
    }
    let _e592 = global.uInterior;
    if (_e592 > 0.5f) {
        local_25 = 5f;
    } else {
        local_25 = 4f;
    }
    let _e598 = local_25;
    kind_2 = _e598;
    let _e600 = vWorld_1;
    let _e601 = N_6;
    let _e602 = base;
    let _e604 = rough;
    let _e605 = ao_2;
    let _e610 = vWorld_1;
    let _e611 = fwidth(_e610);
    let _e613 = metal_2;
    let _e614 = kind_2;
    let _e617 = deferredLight(_e600, _e601, _e602.xyz, _e604, _e605, 0f, 0.04f, 1f, 0f, length(_e611), _e613, _e614, 1f, 1f);
    let _e618 = emit;
    color_1 = (_e617 + _e618);
    let _e622 = color_1;
    let _e623 = vWorld_1;
    let _e624 = N_6;
    let _e625 = base;
    let _e626 = _e625.xyz;
    let _e627 = ao_2;
    let _e634 = metal_2;
    let _e637 = rough;
    let _e638 = kind_2;
    let _e639 = gl_FragCoord_1;
    let _e641 = nativeLocal(_e623, _e624, vec4<f32>(_e626.x, _e626.y, _e626.z, _e627), vec4<f32>(0f, 0f, _e634, 0.04f), _e637, _e638, _e639.xy);
    color_1 = (_e622 + _e641);
    let _e643 = global.uFlags;
    if (_e643.y > 0.5f) {
        let _e647 = base;
        let _e649 = emit;
        color_1 = (_e647.xyz + _e649);
    }
    let _e651 = base;
    alpha = _e651.w;
    let _e654 = global.uCanopy;
    if (_e654 > 0.5f) {
        {
            let _e657 = gl_FrontFacing_1;
            if _e657 {
                {
                    let _e659 = N_6;
                    let _e660 = vWorld_1;
                    fresK = pow((1f - abs(dot(_e659, normalize(-(_e660))))), 2.5f);
                    let _e671 = fresK;
                    alpha = mix(0.16f, 0.85f, _e671);
                    let _e673 = color_1;
                    let _e678 = fresK;
                    color_1 = (_e673 + (vec3<f32>(0.05f, 0.07f, 0.09f) * _e678));
                }
            } else {
                alpha = 0.06f;
            }
        }
    }
    let _e682 = color_1;
    let _e683 = alpha;
    fragmentColor = vec4<f32>(_e682.x, _e682.y, _e682.z, _e683);
    return;
}

@fragment 
fn main(@location(0) vObjPos: vec3<f32>, @location(1) vObjN: vec3<f32>, @location(2) vWorld: vec3<f32>, @location(3) vNormal: vec3<f32>, @location(4) vColor: vec4<f32>, @location(5) vUv: vec2<f32>, @location(6) vUv1_: vec2<f32>, @location(7) vUv2_: vec2<f32>, @builtin(front_facing) gl_FrontFacing: bool, @builtin(position) gl_FragCoord: vec4<f32>) -> FragmentOutput {
    vObjPos_1 = vObjPos;
    vObjN_1 = vObjN;
    vWorld_1 = vWorld;
    vNormal_1 = vNormal;
    vColor_1 = vColor;
    vUv_1 = vUv;
    vUv1_1 = vUv1_;
    vUv2_1 = vUv2_;
    gl_FrontFacing_1 = gl_FrontFacing;
    gl_FragCoord_1 = gl_FragCoord;
    main_1();
    let _e257 = fragmentColor;
    return FragmentOutput(_e257);
}
`;
