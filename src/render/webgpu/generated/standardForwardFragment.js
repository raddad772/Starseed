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
      "name": "uRing",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 208
    },
    {
      "name": "uRingTau",
      "type": "vec4",
      "count": 8,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 224
    },
    {
      "name": "uCSOrigin",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 352
    },
    {
      "name": "uCSE",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 368
    },
    {
      "name": "uCSN",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 384
    },
    {
      "name": "uCSInvL",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 396
    },
    {
      "name": "uCSLod",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 400
    },
    {
      "name": "uCSOn",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 404
    },
    {
      "name": "uCloudTau",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 408
    },
    {
      "name": "uThermal",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 416
    },
    {
      "name": "uHeightCube",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 432
    },
    {
      "name": "uSunShadow",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 448
    },
    {
      "name": "uSunShadowVP0",
      "type": "mat4",
      "count": 0,
      "align": 16,
      "size": 64,
      "stride": 64,
      "offset": 464
    },
    {
      "name": "uSunShadowVP1",
      "type": "mat4",
      "count": 0,
      "align": 16,
      "size": 64,
      "stride": 64,
      "offset": 528
    },
    {
      "name": "uSunShadowL0",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 592
    },
    {
      "name": "uSunShadowL1",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 608
    },
    {
      "name": "uSunShadowDir",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 624
    },
    {
      "name": "uGrassCover",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 640
    },
    {
      "name": "uGrassCoverVP",
      "type": "mat4",
      "count": 0,
      "align": 16,
      "size": 64,
      "stride": 64,
      "offset": 656
    },
    {
      "name": "uTrunkSky",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 720
    },
    {
      "name": "uRockSky",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 736
    },
    {
      "name": "uTrunkSkyVP",
      "type": "mat4",
      "count": 0,
      "align": 16,
      "size": 64,
      "stride": 64,
      "offset": 752
    },
    {
      "name": "uSkyShadow",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 816
    },
    {
      "name": "uSkyShadowVP0",
      "type": "mat4",
      "count": 0,
      "align": 16,
      "size": 64,
      "stride": 64,
      "offset": 832
    },
    {
      "name": "uSkyShadowVP1",
      "type": "mat4",
      "count": 0,
      "align": 16,
      "size": 64,
      "stride": 64,
      "offset": 896
    },
    {
      "name": "uSkyShadowL0",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 960
    },
    {
      "name": "uSkyShadowL1",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 976
    },
    {
      "name": "uSkyShadowUp0",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 992
    },
    {
      "name": "uSkyShadowUp1",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 1008
    },
    {
      "name": "uSkyCenter",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 1024
    },
    {
      "name": "uSkyToFixed",
      "type": "mat3",
      "count": 0,
      "align": 16,
      "size": 48,
      "stride": 48,
      "offset": 1040
    },
    {
      "name": "uSkyD",
      "type": "vec2",
      "count": 0,
      "align": 8,
      "size": 8,
      "stride": 8,
      "offset": 1088
    },
    {
      "name": "uLeafTint",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 1104
    },
    {
      "name": "uMoonDir",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 1120
    },
    {
      "name": "uMoonE",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 1136
    },
    {
      "name": "uInterior",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 1148
    },
    {
      "name": "uCanopy",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 1152
    },
    {
      "name": "uBase",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 1168
    },
    {
      "name": "uLivery",
      "type": "vec2",
      "count": 0,
      "align": 8,
      "size": 8,
      "stride": 8,
      "offset": 1184
    },
    {
      "name": "uPaint1",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 1200
    },
    {
      "name": "uPaint2",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 1216
    },
    {
      "name": "uPaint3",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 1232
    },
    {
      "name": "uEmissive",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 1248
    },
    {
      "name": "uPBR",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 1264
    },
    {
      "name": "uFlags",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 1280
    },
    {
      "name": "uNormalScale",
      "type": "vec2",
      "count": 0,
      "align": 8,
      "size": 8,
      "stride": 8,
      "offset": 1296
    },
    {
      "name": "mapTransform",
      "type": "mat3",
      "count": 0,
      "align": 16,
      "size": 48,
      "stride": 48,
      "offset": 1312
    },
    {
      "name": "normalMapTransform",
      "type": "mat3",
      "count": 0,
      "align": 16,
      "size": 48,
      "stride": 48,
      "offset": 1360
    },
    {
      "name": "roughnessMapTransform",
      "type": "mat3",
      "count": 0,
      "align": 16,
      "size": 48,
      "stride": 48,
      "offset": 1408
    },
    {
      "name": "metalnessMapTransform",
      "type": "mat3",
      "count": 0,
      "align": 16,
      "size": 48,
      "stride": 48,
      "offset": 1456
    },
    {
      "name": "emissiveMapTransform",
      "type": "mat3",
      "count": 0,
      "align": 16,
      "size": 48,
      "stride": 48,
      "offset": 1504
    },
    {
      "name": "aoMapTransform",
      "type": "mat3",
      "count": 0,
      "align": 16,
      "size": 48,
      "stride": 48,
      "offset": 1552
    },
    {
      "name": "alphaMapTransform",
      "type": "mat3",
      "count": 0,
      "align": 16,
      "size": 48,
      "stride": 48,
      "offset": 1600
    },
    {
      "name": "uChannels",
      "type": "ivec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 1648
    },
    {
      "name": "uChannels2",
      "type": "ivec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 1664
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
  "bytes": 1680,
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
    let _e183 = global.uSunLift;
    hD = (1.5707963f + _e183.x);
    let _e188 = global.uSunLift;
    hT = (1.5707963f + _e188.y);
    let _e192 = zd_1;
    let _e193 = hD;
    if (_e192 <= _e193) {
        let _e195 = zd_1;
        let _e196 = hT;
        let _e198 = hD;
        local = ((_e195 * _e196) / _e198);
    } else {
        let _e200 = hT;
        let _e201 = zd_1;
        let _e202 = hD;
        let _e205 = hT;
        let _e209 = hD;
        local = (_e200 + (((_e201 - _e202) * (3.1415927f - _e205)) / (3.1415927f - _e209)));
    }
    let _e214 = local;
    return _e214;
}

fn liftMu(mu: f32) -> f32 {
    var mu_1: f32;

    mu_1 = mu;
    let _e182 = global.uSunLift;
    let _e184 = global.uSunLift;
    if (_e182.x <= _e184.y) {
        let _e187 = mu_1;
        return _e187;
    }
    let _e188 = mu_1;
    let _e194 = lensTrueZ(acos(clamp(_e188, -1f, 1f)));
    return cos(_e194);
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
    let _e185 = global.uTop;
    let _e186 = global.uTop;
    let _e188 = global.uBottom;
    let _e189 = global.uBottom;
    H = sqrt(max(0f, ((_e185 * _e186) - (_e188 * _e189))));
    let _e196 = r_1;
    let _e197 = r_1;
    let _e199 = global.uBottom;
    let _e200 = global.uBottom;
    rho = sqrt(max(0f, ((_e196 * _e197) - (_e199 * _e200))));
    let _e206 = r_1;
    let _e207 = r_1;
    let _e209 = mu_3;
    let _e210 = mu_3;
    let _e215 = global.uTop;
    let _e216 = global.uTop;
    disc = (((_e206 * _e207) * ((_e209 * _e210) - 1f)) + (_e215 * _e216));
    let _e221 = r_1;
    let _e223 = mu_3;
    let _e225 = disc;
    d = max(0f, ((-(_e221) * _e223) + sqrt(max(_e225, 0f))));
    let _e232 = global.uTop;
    let _e233 = r_1;
    dMin = (_e232 - _e233);
    let _e236 = rho;
    let _e237 = H;
    dMax = (_e236 + _e237);
    let _e240 = d;
    let _e241 = dMin;
    let _e243 = dMax;
    let _e244 = dMin;
    let _e249 = rho;
    let _e250 = H;
    return vec2<f32>(((_e240 - _e241) / max((_e243 - _e244), 0.000001f)), (_e249 / max(_e250, 0.000001f)));
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
    let _e184 = mu_5;
    let _e185 = liftMu(_e184);
    mu_5 = _e185;
    let _e186 = global.uGround;
    let _e187 = global.uTrueK;
    Rg = (_e186 * max(_e187, 1f));
    let _e192 = Rg;
    let _e193 = Rg;
    let _e194 = r_3;
    let _e195 = global.uGround;
    sinH = (_e192 / (_e193 + max((_e194 - _e195), 0f)));
    let _e204 = sinH;
    let _e205 = sinH;
    cosH = -(sqrt(max(0f, (1f - (_e204 * _e205)))));
    let _e212 = cosH;
    let _e215 = cosH;
    let _e218 = mu_5;
    vis = smoothstep((_e212 - 0.01f), (_e215 + 0.01f), _e218);
    let _e221 = global.uHasAtmo;
    if (_e221 < 0.5f) {
        let _e224 = vis;
        return vec3(_e224);
    }
    let _e226 = r_3;
    let _e227 = global.uBottom;
    let _e228 = global.uTop;
    let _e230 = mu_5;
    let _e231 = transmittanceUV(clamp(_e226, _e227, _e228), _e230);
    uv = _e231;
    let _e240 = uv;
    uv = (vec2<f32>(0.001953125f, 0.0078125f) + (_e240 * vec2<f32>(0.99609375f, 0.984375f)));
    let _e250 = uv;
    let _e252 = textureSampleLevel(tTransTexture, tTransSampler, _e250, 0f);
    let _e254 = vis;
    return (_e252.xyz * _e254);
}

fn atmoSkyIrradiance(r_4: f32, mu_6: f32) -> vec3<f32> {
    var r_5: f32;
    var mu_7: f32;
    var uv_1: vec2<f32>;

    r_5 = r_4;
    mu_7 = mu_6;
    let _e184 = global.uHasAtmo;
    if (_e184 < 0.5f) {
        return vec3(0f);
    }
    let _e189 = mu_7;
    let _e190 = liftMu(_e189);
    mu_7 = _e190;
    let _e191 = mu_7;
    let _e196 = r_5;
    let _e197 = global.uGround;
    let _e199 = global.uTop;
    let _e200 = global.uGround;
    uv_1 = vec2<f32>(((_e191 * 0.5f) + 0.5f), clamp(((_e196 - _e197) / (_e199 - _e200)), 0f, 1f));
    let _e215 = uv_1;
    uv_1 = (vec2<f32>(0.0078125f, 0.03125f) + (_e215 * vec2<f32>(0.984375f, 0.9375f)));
    let _e225 = uv_1;
    let _e227 = textureSampleLevel(tIrrTexture, tIrrSampler, _e225, 0f);
    return _e227.xyz;
}

fn cloudN(n: f32) -> f32 {
    var n_1: f32;

    n_1 = n;
    let _e183 = n_1;
    return (0.55f + ((_e183 - 0.682f) * 4.3f));
}

fn cloudBias(cover: f32) -> f32 {
    var cover_1: f32;

    cover_1 = cover;
    let _e182 = cover_1;
    let _e190 = cover_1;
    let _e198 = cover_1;
    return ((((_e182 - 0.5f) * 0.3f) + (0.5f * smoothstep(0.8f, 1f, _e190))) - (0.5f * (1f - smoothstep(0f, 0.2f, _e198))));
}

fn cloudFade(foot: f32, L: f32) -> f32 {
    var foot_1: f32;
    var L_1: f32;

    foot_1 = foot;
    L_1 = L;
    let _e186 = foot_1;
    let _e189 = L_1;
    return smoothstep(1f, 4f, ((_e186 * 64f) / _e189));
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
    let _e183 = textureDimensions(tCloudMapTexture, 0i);
    sz = vec2<f32>(vec2<i32>(_e183));
    let _e187 = uv_3;
    let _e188 = sz;
    st = ((_e187 * _e188) - vec2(0.5f));
    let _e194 = st;
    i = floor(_e194);
    let _e197 = st;
    let _e198 = i;
    f = (_e197 - _e198);
    let _e201 = f;
    let _e202 = f;
    f2_ = (_e201 * _e202);
    let _e205 = f2_;
    let _e206 = f;
    f3_ = (_e205 * _e206);
    let _e211 = f;
    let _e216 = f2_;
    let _e219 = f3_;
    w0_ = ((((vec2(1f) - (3f * _e211)) + (3f * _e216)) - _e219) / vec2(6f));
    let _e227 = f2_;
    let _e232 = f3_;
    w1_ = (((vec2(4f) - (6f * _e227)) + (3f * _e232)) / vec2(6f));
    let _e241 = f;
    let _e246 = f2_;
    let _e250 = f3_;
    w2_ = ((((vec2(1f) + (3f * _e241)) + (3f * _e246)) - (3f * _e250)) / vec2(6f));
    let _e257 = f3_;
    w3_ = (_e257 / vec2(6f));
    let _e262 = w0_;
    let _e263 = w1_;
    g0_ = (_e262 + _e263);
    let _e266 = w2_;
    let _e267 = w3_;
    g1_ = (_e266 + _e267);
    let _e270 = i;
    let _e274 = w1_;
    let _e275 = g0_;
    let _e278 = sz;
    h0_ = (((_e270 - vec2(0.5f)) + (_e274 / _e275)) / _e278);
    let _e281 = i;
    let _e285 = w3_;
    let _e286 = g1_;
    let _e289 = sz;
    h1_ = (((_e281 + vec2(1.5f)) + (_e285 / _e286)) / _e289);
    let _e292 = g0_;
    let _e294 = g0_;
    let _e296 = h0_;
    let _e298 = textureSampleLevel(tCloudMapTexture, tCloudMapSampler, _e296, 0f);
    let _e301 = g1_;
    let _e303 = h1_;
    let _e305 = h0_;
    let _e309 = textureSampleLevel(tCloudMapTexture, tCloudMapSampler, vec2<f32>(_e303.x, _e305.y), 0f);
    let _e314 = g1_;
    let _e316 = g0_;
    let _e318 = h0_;
    let _e320 = h1_;
    let _e324 = textureSampleLevel(tCloudMapTexture, tCloudMapSampler, vec2<f32>(_e318.x, _e320.y), 0f);
    let _e327 = g1_;
    let _e329 = h1_;
    let _e331 = textureSampleLevel(tCloudMapTexture, tCloudMapSampler, _e329, 0f);
    return ((_e292.y * ((_e294.x * _e298.xyz) + (_e301.x * _e309.xyz))) + (_e314.y * ((_e316.x * _e324.xyz) + (_e327.x * _e331.xyz))));
}

fn cloudClimate(dirF: vec3<f32>) -> f32 {
    var dirF_1: vec3<f32>;
    var lat: f32;
    var cm: vec3<f32>;

    dirF_1 = dirF;
    let _e182 = dirF_1;
    lat = asin(clamp(_e182.y, -1f, 1f));
    let _e190 = global.uCloudMapMean;
    if (_e190 <= 0f) {
        let _e194 = lat;
        return (0.12f * cos((abs(_e194) * 6f)));
    }
    let _e200 = dirF_1;
    let _e202 = dirF_1;
    let _e209 = lat;
    let _e215 = cloudMapSmooth(vec2<f32>(((atan2(_e200.z, _e202.x) / 6.2832f) + 0.5f), ((_e209 / 3.14159f) + 0.5f)));
    cm = _e215;
    let _e217 = cm;
    let _e219 = cm;
    let _e223 = global.uCloudYear;
    let _e227 = cm;
    let _e231 = global.uCloudYear;
    let _e235 = global.uCloudMapMean;
    return ((((_e217.x + ((_e219.y - 0.5f) * _e223.x)) + ((_e227.z - 0.5f) * _e231.y)) - _e235) * 0.8f);
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
    let _e188 = global.uRadius;
    L0_ = (_e188 * 1f);
    let _e192 = global.uRadius;
    L1_ = (_e192 * 0.236f);
    let _e196 = foot_3;
    let _e197 = L0_;
    let _e198 = cloudFade(_e196, _e197);
    f0_ = _e198;
    let _e200 = foot_3;
    let _e201 = L1_;
    let _e202 = cloudFade(_e200, _e201);
    f1_ = _e202;
    let _e204 = q_1;
    qz = (_e204 * vec3<f32>(0.5f, 1f, 0.5f));
    let _e211 = f0_;
    if (_e211 > 0.999f) {
        local_1 = 0.682f;
    } else {
        let _e215 = qz;
        let _e216 = L0_;
        let _e220 = textureSampleLevel(tNoiseTexture, tNoiseSampler, (_e215 / vec3(_e216)), 0f);
        let _e223 = f0_;
        local_1 = mix(_e220.x, 0.682f, _e223);
    }
    let _e226 = local_1;
    a = _e226;
    let _e228 = f1_;
    if (_e228 > 0.999f) {
        local_2 = 0.682f;
    } else {
        let _e232 = qz;
        let _e233 = L1_;
        let _e240 = textureSampleLevel(tNoiseTexture, tNoiseSampler, ((_e232 / vec3(_e233)) + vec3(0.5f)), 0f);
        let _e243 = f1_;
        local_2 = mix(_e240.x, 0.682f, _e243);
    }
    let _e246 = local_2;
    b = _e246;
    let _e249 = f0_;
    let _e252 = f1_;
    spread = length(vec2<f32>((0.124f * _e249), (0.083f * _e252)));
    let _e258 = bias_1;
    let _e260 = spread;
    let _e263 = bias_1;
    let _e265 = spread;
    let _e267 = a;
    let _e270 = b;
    let _e274 = cloudN(((_e267 * 0.6f) + (_e270 * 0.4f)));
    let _e275 = clim_1;
    return smoothstep(((0.6f - _e258) - _e260), ((0.8f - _e263) + _e265), (_e274 + _e275));
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
    let _e184 = global.uCloudClock;
    T = _e184.z;
    let _e187 = T;
    if (_e187 <= 0f) {
        {
            (*gA) = vec3<f32>(1f, 0f, 0f);
            (*gB) = vec3(0f);
            return;
        }
    }
    let _e197 = dirF_3;
    let _e201 = dirF_3;
    let _e206 = dirF_3;
    let _e212 = dirF_3;
    let _e216 = dirF_3;
    let _e221 = dirF_3;
    ph = ((((1.1f * _e197.x) + (0.7f * _e201.z)) - (0.5f * _e206.y)) + (0.35f * sin((((2.3f * _e212.y) + (1.7f * _e216.x)) - (0.9f * _e221.z)))));
    let _e229 = global.uCloudClock;
    let _e231 = T;
    let _e233 = ph;
    s = (((_e229.x / _e231) + _e233) + 4f);
    let _e238 = s;
    a_1 = floor(_e238);
    let _e241 = s;
    let _e242 = a_1;
    fa = (_e241 - _e242);
    let _e245 = s;
    b_1 = floor((_e245 + 0.5f));
    let _e250 = s;
    let _e253 = b_1;
    fb = ((_e250 + 0.5f) - _e253);
    let _e257 = dirF_3;
    let _e267 = dirF_3;
    let _e279 = dirF_3;
    j = (0.065f * ((sin((dot(_e257, vec3<f32>(5.1f, 3.7f, -4.3f)) + 1.3f)) + sin((dot(_e267, vec3<f32>(-3.9f, 7.3f, 6.1f)) + 0.4f))) + (0.6f * sin((dot(_e279, vec3<f32>(11.3f, -8.9f, 7.7f)) + 2.1f)))));
    let _e293 = s;
    let _e294 = j;
    fj = fract((_e293 + _e294));
    let _e302 = fj;
    wa = smoothstep(0.4f, 0.6f, (1f - abs(((2f * _e302) - 1f))));
    let _e310 = wa;
    let _e311 = fa;
    let _e314 = T;
    let _e317 = global.uCloudClock;
    let _e319 = a_1;
    (*gA) = vec3<f32>(_e310, ((_e311 - 0.5f) * _e314), (2f * (_e317.y + _e319)));
    let _e324 = wa;
    let _e326 = fb;
    let _e329 = T;
    let _e332 = global.uCloudClock;
    let _e334 = b_1;
    (*gB) = vec3<f32>((1f - _e324), ((_e326 - 0.5f) * _e329), ((2f * (_e332.y + _e334)) + 1f));
    return;
}

fn cloudGenOff(idx: f32) -> vec3<f32> {
    var idx_1: f32;
    var h: u32;

    idx_1 = idx;
    let _e182 = idx_1;
    h = (u32(_e182) * 2654435761u);
    let _e187 = h;
    let _e188 = h;
    h = (_e187 ^ (_e188 >> 15u));
    let _e192 = h;
    h = (_e192 * 2246822519u);
    let _e195 = h;
    let _e196 = h;
    h = (_e195 ^ (_e196 >> 13u));
    let _e200 = h;
    let _e204 = h;
    let _e210 = h;
    return (((vec3<f32>(f32((_e200 & 1023u)), f32(((_e204 >> 10u) & 1023u)), f32(((_e210 >> 20u) & 1023u))) / vec3(1024f)) - vec3(0.5f)) * 400000f);
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
    let _e186 = dirF_5;
    lat_1 = asin(clamp(_e186.y, -1f, 1f));
    let _e194 = global.uCloudWind;
    let _e196 = lat_1;
    let _e197 = global.uCloudWind;
    let _e202 = global.uCloudWind;
    let _e208 = global.uCloudWind;
    let _e210 = lat_1;
    let _e212 = lat_1;
    U = (_e194.x * (sin((((_e196 * _e197.y) * 2f) + (_e202.z * 6.2832f))) + (_e208.w * exp(((-(_e210) * _e212) * 40f)))));
    let _e221 = dirF_5;
    let _e225 = dirF_5;
    east = normalize((vec3<f32>(-(_e221.z), 0f, _e225.x) + vec3<f32>(0.000001f, 0f, 0f)));
    let _e235 = pf_1;
    let _e236 = east;
    let _e237 = U;
    let _e239 = g_1;
    let _e243 = g_1;
    let _e245 = cloudGenOff(_e243.z);
    return ((_e235 + ((_e236 * _e237) * _e239.y)) + _e245);
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
    let _e190 = dirF_7;
    cloudGens(_e190, (&gA_1), (&gB_1));
    let _e197 = dirF_7;
    let _e198 = cloudClimate(_e197);
    clim_2 = _e198;
    let _e200 = gA_1;
    if (_e200.x > 0.005f) {
        let _e204 = c;
        let _e205 = gA_1;
        let _e207 = pf_3;
        let _e208 = dirF_7;
        let _e209 = gA_1;
        let _e210 = cloudAdvect(_e207, _e208, _e209);
        let _e211 = foot_5;
        let _e212 = bias_3;
        let _e213 = clim_2;
        let _e214 = cloudCoverC(_e210, _e211, _e212, _e213);
        c = (_e204 + (_e205.x * _e214));
    }
    let _e217 = gB_1;
    if (_e217.x > 0.005f) {
        let _e221 = c;
        let _e222 = gB_1;
        let _e224 = pf_3;
        let _e225 = dirF_7;
        let _e226 = gB_1;
        let _e227 = cloudAdvect(_e224, _e225, _e226);
        let _e228 = foot_5;
        let _e229 = bias_3;
        let _e230 = clim_2;
        let _e231 = cloudCoverC(_e227, _e228, _e229, _e230);
        c = (_e221 + (_e222.x * _e231));
    }
    let _e234 = c;
    return _e234;
}

fn ringShadow(rel: vec3<f32>) -> f32 {
    var rel_1: vec3<f32>;
    var pF: vec3<f32>;
    var sF: vec3<f32>;
    var q_2: vec3<f32>;
    var x: f32;
    var f_1: f32;
    var i_1: i32;
    var j_1: i32;
    var tau: f32;

    rel_1 = rel;
    let _e182 = global.uRing;
    if (_e182.z < 0.5f) {
        return 1f;
    }
    let _e187 = global.uToFixed;
    let _e188 = rel_1;
    pF = (_e187 * _e188);
    let _e191 = global.uToFixed;
    let _e192 = global.uSunDir;
    sF = (_e191 * _e192);
    let _e195 = pF;
    let _e197 = sF;
    let _e202 = sF;
    if (((_e195.y * _e197.y) >= 0f) || (abs(_e202.y) < 0.0001f)) {
        return 1f;
    }
    let _e209 = pF;
    let _e210 = sF;
    let _e211 = pF;
    let _e213 = sF;
    q_2 = (_e209 - (_e210 * (_e211.y / _e213.y)));
    let _e219 = q_2;
    let _e222 = global.uRing;
    let _e225 = global.uRing;
    let _e227 = global.uRing;
    x = ((length(_e219.xz) - _e222.x) / (_e225.y - _e227.x));
    let _e232 = x;
    let _e235 = x;
    if ((_e232 <= 0f) || (_e235 >= 1f)) {
        return 1f;
    }
    let _e240 = x;
    f_1 = clamp(((_e240 * 32f) - 0.5f), 0f, 31f);
    let _e249 = f_1;
    i_1 = i32(floor(_e249));
    let _e253 = i_1;
    j_1 = min((_e253 + 1i), 31i);
    let _e259 = i_1;
    let _e261 = i_1;
    let _e266 = i_1;
    let _e271 = global.uRingTau[(_e266 / 4i)][(_e259 - (4i * (_e261 / 4i)))];
    let _e272 = j_1;
    let _e274 = j_1;
    let _e279 = j_1;
    let _e284 = global.uRingTau[(_e279 / 4i)][(_e272 - (4i * (_e274 / 4i)))];
    let _e285 = f_1;
    let _e286 = f_1;
    tau = mix(_e271, _e284, (_e285 - floor(_e286)));
    let _e291 = tau;
    let _e293 = sF;
    return exp((-(_e291) / abs(_e293.y)));
}

fn cloudLight(rel_2: vec3<f32>, r_6: f32, muS: f32, foot_6: f32, sunAbove: vec3<f32>, skyE: ptr<function, vec3<f32>>) -> f32 {
    var rel_3: vec3<f32>;
    var r_7: f32;
    var muS_1: f32;
    var foot_7: f32;
    var sunAbove_1: vec3<f32>;
    var ring: f32;
    var local_3: f32;
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
    var local_4: f32;
    var cs: f32;
    var dz: vec3<f32>;
    var cz: f32;
    var local_5: f32;

    rel_3 = rel_2;
    r_7 = r_6;
    muS_1 = muS;
    foot_7 = foot_6;
    sunAbove_1 = sunAbove;
    cloudDirZ = 1f;
    cloudTotZ = 1f;
    let _e195 = rel_3;
    let _e196 = ringShadow(_e195);
    ring = _e196;
    let _e198 = global.uCloudOn;
    if (_e198 < 0.5f) {
        let _e201 = muS_1;
        if (_e201 > -0.05f) {
            let _e205 = ring;
            local_3 = _e205;
        } else {
            local_3 = 1f;
        }
        let _e208 = local_3;
        return _e208;
    }
    let _e209 = muS_1;
    mu_8 = max(_e209, 0.05f);
    let _e227 = global.uCSOn;
    if (_e227 > 0.5f) {
        {
            let _e230 = global.uToFixed;
            let _e231 = rel_3;
            pf_4 = (_e230 * _e231);
            let _e234 = pf_4;
            let _e235 = r_7;
            upF = (_e234 / vec3(_e235));
            let _e239 = global.uToFixed;
            let _e240 = global.uSunDir;
            sF_1 = (_e239 * _e240);
            let _e243 = pf_4;
            let _e244 = global.uCSOrigin;
            let _e246 = sF_1;
            let _e247 = upF;
            let _e248 = sF_1;
            let _e249 = upF;
            let _e253 = r_7;
            let _e254 = global.uRadius;
            let _e257 = sF_1;
            let _e258 = upF;
            d_1 = ((_e243 - _e244) - (((_e246 - (_e247 * dot(_e248, _e249))) * (_e253 - _e254)) / vec3(max(dot(_e257, _e258), 0.1f))));
            let _e266 = d_1;
            let _e267 = global.uCSE;
            let _e269 = d_1;
            let _e270 = global.uCSN;
            let _e273 = global.uCSInvL;
            uv_4 = ((vec2<f32>(dot(_e266, _e267), dot(_e269, _e270)) * _e273) + vec2(0.5f));
            let _e281 = uv_4;
            let _e284 = uv_4;
            let _e288 = uv_4;
            let _e291 = uv_4;
            w = smoothstep(0f, 0.08f, min(min(_e281.x, (1f - _e284.x)), min(_e288.y, (1f - _e291.y))));
            let _e297 = w;
            if (_e297 > 0f) {
                {
                    let _e300 = uv_4;
                    let _e302 = textureSampleLevel(tCloudShadowTexture, tCloudShadowSampler, _e300, 0f);
                    m0_ = _e302;
                    let _e303 = uv_4;
                    let _e304 = global.uCSLod;
                    let _e305 = textureSampleLevel(tCloudShadowTexture, tCloudShadowSampler, _e303, _e304);
                    m1_ = _e305;
                }
            }
        }
    }
    let _e306 = global.uCloud;
    let _e308 = r_7;
    let _e309 = global.uRadius;
    hc = (_e306.x - (_e308 - _e309));
    let _e313 = hc;
    let _e316 = w;
    if ((_e313 > 0f) && (_e316 < 1f)) {
        {
            let _e320 = global.uToFixed;
            let _e321 = rel_3;
            let _e322 = global.uSunDir;
            let _e323 = hc;
            let _e325 = muS_1;
            ds = normalize((_e320 * normalize((_e321 + ((_e322 * _e323) / vec3(max(_e325, 0.08f)))))));
            let _e335 = muS_1;
            if (_e335 > -0.05f) {
                let _e339 = ds;
                let _e340 = global.uRadius;
                let _e342 = ds;
                let _e343 = foot_7;
                let _e344 = global.uCloud;
                let _e346 = cloudBias(_e344.z);
                let _e347 = cloudCoverG((_e339 * _e340), _e342, _e343, _e346);
                let _e348 = global.uCloudOpacity;
                local_4 = (_e347 * _e348);
            } else {
                local_4 = 0f;
            }
            let _e352 = local_4;
            cs = _e352;
            let _e354 = global.uToFixed;
            let _e355 = rel_3;
            dz = normalize((_e354 * _e355));
            let _e359 = dz;
            let _e360 = global.uRadius;
            let _e362 = dz;
            let _e363 = foot_7;
            let _e365 = hc;
            let _e368 = global.uCloud;
            let _e370 = cloudBias(_e368.z);
            let _e371 = cloudCoverG((_e359 * _e360), _e362, max(_e363, (3.5f * _e365)), _e370);
            let _e372 = global.uCloudOpacity;
            cz = (_e371 * _e372);
            let _e376 = cs;
            let _e378 = cs;
            let _e379 = global.uCloudTau;
            let _e381 = mu_8;
            Tdir = ((1f - _e376) + (_e378 * exp((-(_e379) / _e381))));
            let _e387 = cz;
            let _e389 = cz;
            let _e392 = global.uCloudTau;
            Ttot = ((1f - _e387) + (_e389 / (1f + (0.1125f * _e392))));
            let _e398 = cz;
            let _e400 = cz;
            let _e401 = global.uCloudTau;
            let _e403 = mu_8;
            Dup = ((1f - _e398) + (_e400 * exp((-(_e401) / _e403))));
        }
    }
    let _e408 = Tdir;
    let _e409 = m0_;
    let _e411 = w;
    Tdir = mix(_e408, _e409.x, _e411);
    let _e413 = Ttot;
    let _e414 = m1_;
    let _e416 = w;
    Ttot = mix(_e413, _e414.y, _e416);
    let _e418 = Dup;
    let _e419 = m1_;
    let _e421 = w;
    Dup = mix(_e418, _e419.z, _e421);
    let _e423 = Dup;
    cloudDirZ = _e423;
    let _e424 = Ttot;
    cloudTotZ = _e424;
    let _e425 = (*skyE);
    let _e426 = Ttot;
    let _e428 = sunAbove_1;
    let _e429 = muS_1;
    let _e433 = Ttot;
    let _e434 = Dup;
    (*skyE) = ((_e425 * _e426) + ((_e428 * max(_e429, 0f)) * max((_e433 - _e434), 0f)));
    let _e440 = muS_1;
    if (_e440 > -0.05f) {
        let _e444 = Tdir;
        let _e445 = ring;
        local_5 = (_e444 * _e445);
    } else {
        local_5 = 1f;
    }
    let _e449 = local_5;
    return _e449;
}

fn blackbodyGlow(T_1: f32) -> vec3<f32> {
    var T_2: f32;
    var g_2: f32;

    T_2 = T_1;
    let _e184 = T_2;
    if (_e184 < 650f) {
        return vec3(0f);
    }
    let _e192 = T_2;
    g_2 = max(0f, (0.0287f + (0.000237f * (_e192 - 1000f))));
    let _e200 = g_2;
    let _e206 = T_2;
    let _e212 = g_2;
    return (vec3<f32>(1f, _e200, 0f) * ((600000f * exp((-24060f / _e206))) / (0.2126f + (0.7152f * _e212))));
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
    let _e187 = d_3;
    a_2 = abs(_e187);
    let _e190 = a_2;
    let _e192 = a_2;
    let _e195 = a_2;
    let _e197 = a_2;
    if ((_e190.x >= _e192.y) && (_e195.x >= _e197.z)) {
        let _e201 = d_3;
        if (_e201.x >= 0f) {
            local_6 = 0i;
        } else {
            local_6 = 1i;
        }
        let _e208 = local_6;
        local_10 = _e208;
    } else {
        let _e209 = a_2;
        let _e211 = a_2;
        if (_e209.y >= _e211.z) {
            let _e214 = d_3;
            if (_e214.y >= 0f) {
                local_7 = 2i;
            } else {
                local_7 = 3i;
            }
            let _e221 = local_7;
            local_9 = _e221;
        } else {
            let _e222 = d_3;
            if (_e222.z >= 0f) {
                local_8 = 4i;
            } else {
                local_8 = 5i;
            }
            let _e229 = local_8;
            local_9 = _e229;
        }
        let _e231 = local_9;
        local_10 = _e231;
    }
    let _e233 = local_10;
    f_2 = _e233;
    let _e235 = d_3;
    let _e236 = f_2;
    let _e240 = local_11[_e236];
    dn = dot(_e235, _e240);
    let _e243 = d_3;
    let _e244 = f_2;
    let _e248 = local_12[_e244];
    let _e250 = dn;
    let _e253 = d_3;
    let _e254 = f_2;
    let _e258 = local_13[_e254];
    let _e260 = dn;
    uv_5 = (((vec2<f32>(atan((dot(_e243, _e248) / _e250)), atan((dot(_e253, _e258) / _e260))) / vec2(0.785398f)) * 0.5f) + vec2(0.5f));
    let _e273 = uv_5;
    let _e274 = f_2;
    let _e278 = vec3<f32>(_e273.x, _e273.y, f32(_e274));
    let _e283 = textureSampleLevel(tHeightCubeTexture, tHeightCubeSampler, _e278.xy, i32(_e278.z), 0f);
    return _e283.x;
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
    var t: f32;
    var sh: f32 = 1f;
    var i_2: i32 = 0i;
    var qp: vec3<f32>;
    var rq: f32;
    var d_4: f32;

    pF_2 = pF_1;
    up_1 = up;
    sF_3 = sF_2;
    R_1 = R;
    let _e193 = global.uHeightCube;
    let _e197 = up_1;
    let _e198 = sF_3;
    if ((_e193.x < 0.5f) || (dot(_e197, _e198) < -0.2f)) {
        return 1f;
    }
    let _e205 = global.uHeightCube;
    texel = _e205.w;
    let _e208 = R_1;
    let _e209 = global.uHeightCube;
    top = (_e208 + _e209.z);
    let _e213 = pF_2;
    r0_ = length(_e213);
    let _e217 = R_1;
    let _e218 = up_1;
    let _e219 = heightCubeAt(_e218);
    let _e221 = r0_;
    below = max(0f, ((_e217 + _e219) - _e221));
    let _e225 = pF_2;
    let _e226 = up_1;
    let _e227 = texel;
    o = (_e225 + ((_e226 * _e227) * 0.1f));
    let _e233 = texel;
    t = _e233;
    loop {
        let _e239 = i_2;
        if !((_e239 < 28i)) {
            break;
        }
        {
            let _e246 = o;
            let _e247 = sF_3;
            let _e248 = t;
            qp = (_e246 + (_e247 * _e248));
            let _e252 = qp;
            rq = length(_e252);
            let _e255 = rq;
            let _e256 = top;
            if (_e255 > _e256) {
                break;
            }
            let _e258 = rq;
            let _e259 = R_1;
            let _e260 = qp;
            let _e261 = rq;
            let _e264 = heightCubeAt((_e260 / vec3(_e261)));
            let _e267 = below;
            let _e268 = t;
            let _e271 = texel;
            d_4 = ((_e258 - (_e259 + _e264)) + (_e267 * exp((-(_e268) / (3f * _e271)))));
            let _e278 = sh;
            let _e279 = d_4;
            let _e280 = t;
            sh = min(_e278, clamp(((_e279 / (_e280 * 0.035f)) + 0.5f), 0f, 1f));
            let _e290 = sh;
            if (_e290 <= 0f) {
                break;
            }
            let _e293 = t;
            t = (_e293 * 1.35f);
        }
        continuing {
            let _e243 = i_2;
            i_2 = (_e243 + 1i);
        }
    }
    let _e296 = sh;
    return _e296;
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
    var j_2: i32 = 0i;
    var i_3: i32;
    var local_14: f32;
    var lit: f32 = 0f;
    var j_3: i32 = 0i;
    var i_4: i32;

    org_1 = org;
    n_3 = n_2;
    VP_1 = VP;
    L_3 = L_2;
    wp_1 = wp;
    bias_5 = bias_4;
    let _e197 = VP_1;
    let _e198 = wp_1;
    c_1 = (_e197 * vec4<f32>(_e198.x, _e198.y, _e198.z, 1f));
    let _e206 = c_1;
    let _e208 = c_1;
    uv_6 = (((_e206.xy / vec2(_e208.w)) * 0.5f) + vec2(0.5f));
    let _e218 = uv_6;
    let _e223 = uv_6;
    if (any((_e218 < vec2(0f))) || any((_e223 > vec2(1f)))) {
        return 1f;
    }
    let _e230 = L_3;
    let _e232 = wp_1;
    let _e234 = global.uSunShadowDir;
    let _e236 = bias_5;
    d_5 = (dot((_e230.xyz - _e232), _e234) - _e236);
    let _e239 = n_3;
    sz_1 = vec2(_e239);
    let _e242 = uv_6;
    let _e243 = sz_1;
    st_1 = ((_e242 * vec2<f32>(_e243)) - vec2(0.5f));
    let _e250 = st_1;
    fr = fract(_e250);
    let _e253 = st_1;
    p0_ = vec2<i32>(floor(_e253));
    loop {
        let _e260 = j_2;
        if !((_e260 < 4i)) {
            break;
        }
        i_3 = 0i;
        loop {
            let _e269 = i_3;
            if !((_e269 < 4i)) {
                break;
            }
            let _e276 = j_2;
            let _e279 = i_3;
            let _e282 = d_5;
            let _e283 = org_1;
            let _e284 = p0_;
            let _e285 = i_3;
            let _e288 = j_2;
            let _e295 = sz_1;
            let _e302 = textureLoad(tShadowAtlasTexture, (_e283 + clamp((_e284 + vec2<i32>((_e285 - 1i), (_e288 - 1i))), vec2(0i), (_e295 - vec2(1i)))), 0i);
            if (_e282 <= _e302.x) {
                local_14 = 1f;
            } else {
                local_14 = 0f;
            }
            let _e308 = local_14;
            cmp[((_e276 * 4i) + _e279)] = _e308;
            continuing {
                let _e273 = i_3;
                i_3 = (_e273 + 1i);
            }
        }
        continuing {
            let _e264 = j_2;
            j_2 = (_e264 + 1i);
        }
    }
    loop {
        let _e313 = j_3;
        if !((_e313 < 3i)) {
            break;
        }
        i_4 = 0i;
        loop {
            let _e322 = i_4;
            if !((_e322 < 3i)) {
                break;
            }
            let _e329 = lit;
            let _e330 = j_3;
            let _e333 = i_4;
            let _e336 = cmp[((_e330 * 4i) + _e333)];
            let _e337 = j_3;
            let _e340 = i_4;
            let _e345 = cmp[(((_e337 * 4i) + _e340) + 1i)];
            let _e346 = fr;
            let _e349 = j_3;
            let _e352 = i_4;
            let _e357 = cmp[(((_e349 * 4i) + _e352) + 4i)];
            let _e358 = j_3;
            let _e361 = i_4;
            let _e366 = cmp[(((_e358 * 4i) + _e361) + 5i)];
            let _e367 = fr;
            let _e370 = fr;
            lit = (_e329 + mix(mix(_e336, _e345, _e346.x), mix(_e357, _e366, _e367.x), _e370.y));
            continuing {
                let _e326 = i_4;
                i_4 = (_e326 + 1i);
            }
        }
        continuing {
            let _e317 = j_3;
            j_3 = (_e317 + 1i);
        }
    }
    let _e374 = lit;
    return (_e374 / 9f);
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
    let _e189 = global.uSunShadow;
    if (_e189.x < 0.5f) {
        return 1f;
    }
    let _e194 = wp_3;
    dist = length(_e194);
    let _e197 = dist;
    let _e198 = global.uSunShadow;
    if (_e197 > _e198.z) {
        return 1f;
    }
    let _e202 = N_1;
    let _e203 = global.uSunShadowDir;
    ndl = max(dot(_e202, _e203), 0.05f);
    let _e209 = ndl;
    let _e210 = ndl;
    let _e214 = ndl;
    slope = (sqrt((1f - (_e209 * _e210))) / _e214);
    let _e221 = global.uSunShadowVP1_;
    let _e222 = global.uSunShadowL1_;
    let _e223 = wp_3;
    let _e224 = global.uSunShadowL1_;
    let _e227 = slope;
    let _e232 = sunShadowTap(vec2<i32>(2048i, 0i), 2048i, _e221, _e222, _e223, (_e224.w * (1.5f + min(_e227, 6f))));
    s1_ = _e232;
    let _e234 = s1_;
    let _e237 = global.uSunShadow;
    let _e240 = global.uSunShadow;
    let _e242 = dist;
    sh_1 = mix(_e234, 1f, smoothstep((0.85f * _e237.z), _e240.z, _e242));
    let _e246 = dist;
    let _e247 = global.uSunShadow;
    if (_e246 < _e247.y) {
        {
            let _e254 = global.uSunShadowVP0_;
            let _e255 = global.uSunShadowL0_;
            let _e256 = wp_3;
            let _e257 = global.uSunShadowL0_;
            let _e260 = slope;
            let _e265 = sunShadowTap(vec2<i32>(0i, 0i), 2048i, _e254, _e255, _e256, (_e257.w * (1.5f + min(_e260, 6f))));
            s0_ = _e265;
            let _e267 = s0_;
            let _e268 = sh_1;
            let _e270 = global.uSunShadow;
            let _e273 = global.uSunShadow;
            let _e275 = dist;
            sh_1 = mix(_e267, _e268, smoothstep((0.75f * _e270.y), _e273.y, _e275));
        }
    }
    let _e278 = sh_1;
    return _e278;
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
    var f_3: f32;
    var sum: f32;

    wp_5 = wp_4;
    let _e187 = global.uGrassCover;
    if (_e187.x < 0.5f) {
        return 0f;
    }
    let _e192 = global.uGrassCoverVP;
    let _e193 = wp_5;
    c_2 = (_e192 * vec4<f32>(_e193.x, _e193.y, _e193.z, 1f));
    let _e201 = c_2;
    let _e203 = c_2;
    uv_7 = (((_e201.xy / vec2(_e203.w)) * 0.5f) + vec2(0.5f));
    let _e213 = uv_7;
    let _e220 = uv_7;
    e = max(abs(((_e213.x * 2f) - 1f)), abs(((_e220.y * 2f) - 1f)));
    let _e229 = e;
    if (_e229 >= 1f) {
        return 0f;
    }
    let _e233 = global.uGrassCover;
    n_4 = i32(_e233.w);
    let _e237 = uv_7;
    let _e238 = global.uGrassCover;
    st_2 = ((_e237 * _e238.w) - vec2(0.5f));
    let _e245 = st_2;
    fr_1 = fract(_e245);
    let _e248 = st_2;
    p0_1 = vec2<i32>(floor(_e248));
    let _e252 = global.uGrassCover;
    org_2 = vec2<i32>(_e252.yz);
    let _e256 = n_4;
    hi = vec2((_e256 - 1i));
    let _e261 = org_2;
    let _e262 = p0_1;
    let _e265 = hi;
    let _e269 = textureLoad(tShadowAtlasTexture, (_e261 + clamp(_e262, vec2(0i), _e265)), 0i);
    a_3 = _e269.x;
    let _e272 = org_2;
    let _e273 = p0_1;
    let _e280 = hi;
    let _e284 = textureLoad(tShadowAtlasTexture, (_e272 + clamp((_e273 + vec2<i32>(1i, 0i)), vec2(0i), _e280)), 0i);
    b_2 = _e284.x;
    let _e287 = org_2;
    let _e288 = p0_1;
    let _e295 = hi;
    let _e299 = textureLoad(tShadowAtlasTexture, (_e287 + clamp((_e288 + vec2<i32>(0i, 1i)), vec2(0i), _e295)), 0i);
    d_6 = _e299.x;
    let _e302 = org_2;
    let _e303 = p0_1;
    let _e310 = hi;
    let _e314 = textureLoad(tShadowAtlasTexture, (_e302 + clamp((_e303 + vec2<i32>(1i, 1i)), vec2(0i), _e310)), 0i);
    f_3 = _e314.x;
    let _e317 = a_3;
    let _e318 = b_2;
    let _e319 = fr_1;
    let _e322 = d_6;
    let _e323 = f_3;
    let _e324 = fr_1;
    let _e327 = fr_1;
    sum = mix(mix(_e317, _e318, _e319.x), mix(_e322, _e323, _e324.x), _e327.y);
    let _e331 = sum;
    let _e335 = e;
    return (_e331 * (1f - smoothstep(0.75f, 1f, _e335)));
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
    var f_4: f32;
    var sum_1: f32;

    o_2 = o_1;
    wp_7 = wp_6;
    let _e189 = global.uTrunkSkyVP;
    let _e190 = wp_7;
    c_3 = (_e189 * vec4<f32>(_e190.x, _e190.y, _e190.z, 1f));
    let _e198 = c_3;
    let _e200 = c_3;
    uv_8 = (((_e198.xy / vec2(_e200.w)) * 0.5f) + vec2(0.5f));
    let _e210 = uv_8;
    let _e217 = uv_8;
    e_1 = max(abs(((_e210.x * 2f) - 1f)), abs(((_e217.y * 2f) - 1f)));
    let _e226 = e_1;
    if (_e226 >= 1f) {
        return 0f;
    }
    let _e230 = global.uTrunkSky;
    n_5 = i32(_e230.w);
    let _e234 = uv_8;
    let _e235 = global.uTrunkSky;
    st_3 = ((_e234 * _e235.w) - vec2(0.5f));
    let _e242 = st_3;
    fr_2 = fract(_e242);
    let _e245 = st_3;
    p0_2 = vec2<i32>(floor(_e245));
    let _e249 = o_2;
    org_3 = vec2<i32>(_e249);
    let _e252 = n_5;
    hi_1 = vec2((_e252 - 1i));
    let _e257 = org_3;
    let _e258 = p0_2;
    let _e261 = hi_1;
    let _e265 = textureLoad(tShadowAtlasTexture, (_e257 + clamp(_e258, vec2(0i), _e261)), 0i);
    a_4 = _e265.x;
    let _e268 = org_3;
    let _e269 = p0_2;
    let _e276 = hi_1;
    let _e280 = textureLoad(tShadowAtlasTexture, (_e268 + clamp((_e269 + vec2<i32>(1i, 0i)), vec2(0i), _e276)), 0i);
    b_3 = _e280.x;
    let _e283 = org_3;
    let _e284 = p0_2;
    let _e291 = hi_1;
    let _e295 = textureLoad(tShadowAtlasTexture, (_e283 + clamp((_e284 + vec2<i32>(0i, 1i)), vec2(0i), _e291)), 0i);
    d_7 = _e295.x;
    let _e298 = org_3;
    let _e299 = p0_2;
    let _e306 = hi_1;
    let _e310 = textureLoad(tShadowAtlasTexture, (_e298 + clamp((_e299 + vec2<i32>(1i, 1i)), vec2(0i), _e306)), 0i);
    f_4 = _e310.x;
    let _e313 = a_4;
    let _e314 = b_3;
    let _e315 = fr_2;
    let _e318 = d_7;
    let _e319 = f_4;
    let _e320 = fr_2;
    let _e323 = fr_2;
    sum_1 = mix(mix(_e313, _e314, _e315.x), mix(_e318, _e319, _e320.x), _e323.y);
    let _e327 = sum_1;
    let _e331 = e_1;
    return (_e327 * (1f - smoothstep(0.75f, 1f, _e331)));
}

fn trunkSum(wp_8: vec3<f32>) -> f32 {
    var wp_9: vec3<f32>;
    var local_15: f32;

    wp_9 = wp_8;
    let _e187 = global.uTrunkSky;
    if (_e187.x < 0.5f) {
        local_15 = 0f;
    } else {
        let _e192 = global.uTrunkSky;
        let _e194 = wp_9;
        let _e195 = atlasSum(_e192.yz, _e194);
        local_15 = _e195;
    }
    let _e197 = local_15;
    return _e197;
}

fn rockSum(wp_10: vec3<f32>) -> f32 {
    var wp_11: vec3<f32>;
    var local_16: f32;

    wp_11 = wp_10;
    let _e187 = global.uRockSky;
    if (_e187.x < 0.5f) {
        local_16 = 0f;
    } else {
        let _e192 = global.uRockSky;
        let _e194 = wp_11;
        let _e195 = atlasSum(_e192.yz, _e194);
        local_16 = _e195;
    }
    let _e197 = local_16;
    return _e197;
}

fn trunkSky(wp_12: vec3<f32>) -> f32 {
    var wp_13: vec3<f32>;

    wp_13 = wp_12;
    let _e187 = wp_13;
    let _e188 = trunkSum(_e187);
    let _e190 = wp_13;
    let _e191 = rockSum(_e190);
    return exp((-(_e188) - _e191));
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
    let _e195 = sc_1;
    if (_e195.x <= 0.003f) {
        return 0f;
    }
    let _e200 = d_9;
    let _e201 = D_1;
    let _e202 = sc_1;
    let _e204 = sc_1;
    dh = (_e200 - (_e201 + (_e202.y / _e204.x)));
    let _e210 = dh;
    if (_e210 <= 0f) {
        return 0f;
    }
    let _e214 = dh;
    let _e215 = dh;
    h2_ = (_e214 * _e215);
    let _e218 = sc_1;
    let _e220 = b_5;
    let _e221 = b_5;
    let _e223 = b_5;
    let _e224 = b_5;
    let _e226 = h2_;
    let _e229 = a_6;
    let _e230 = a_6;
    let _e232 = a_6;
    let _e233 = a_6;
    let _e235 = h2_;
    return (_e218.x * (((_e220 * _e221) / ((_e223 * _e224) + _e226)) - ((_e229 * _e230) / (((_e232 * _e233) + _e235) + 0.000001f))));
}

fn skyShadowMap(u0_: f32, D_2: f32, VP_2: mat4x4<f32>, L_4: vec4<f32>, upF_1: vec3<f32>, ext: f32, pF_3: vec3<f32>) -> f32 {
    var u0_1: f32;
    var D_3: f32;
    var VP_3: mat4x4<f32>;
    var L_5: vec4<f32>;
    var upF_2: vec3<f32>;
    var ext_1: f32;
    var pF_4: vec3<f32>;
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
    pF_4 = pF_3;
    let _e199 = VP_3;
    let _e200 = pF_4;
    c_4 = (_e199 * vec4<f32>(_e200.x, _e200.y, _e200.z, 1f));
    let _e208 = c_4;
    let _e210 = c_4;
    uv_9 = (((_e208.xy / vec2(_e210.w)) * 0.5f) + vec2(0.5f));
    let _e222 = ext_1;
    edge = (45f / (2f * _e222));
    let _e226 = uv_9;
    let _e227 = edge;
    let _e231 = uv_9;
    let _e233 = edge;
    if (any((_e226 < vec2(_e227))) || any((_e231 > vec2((1f - _e233))))) {
        return -1f;
    }
    let _e241 = uv_9;
    uv_9 = clamp(_e241, vec2(0.0009765625f), vec2(0.99902344f));
    let _e255 = u0_1;
    x0_ = (_e255 * 3f);
    let _e259 = x0_;
    let _e262 = uv_9;
    let _e265 = NB;
    let _e267 = uv_9;
    let _e271 = textureSampleLevel(tSkyRingsTexture, tSkyRingsSampler, vec2<f32>((((_e259 + 2f) + _e262.x) / _e265), _e267.y), 0f);
    C = _e271;
    let _e273 = C;
    if (_e273.z < 0.002f) {
        return 0f;
    }
    let _e278 = x0_;
    let _e279 = uv_9;
    let _e282 = NB;
    let _e284 = uv_9;
    let _e288 = textureSampleLevel(tSkyRingsTexture, tSkyRingsSampler, vec2<f32>(((_e278 + _e279.x) / _e282), _e284.y), 0f);
    A = _e288;
    let _e290 = x0_;
    let _e293 = uv_9;
    let _e296 = NB;
    let _e298 = uv_9;
    let _e302 = textureSampleLevel(tSkyRingsTexture, tSkyRingsSampler, vec2<f32>((((_e290 + 1f) + _e293.x) / _e296), _e298.y), 0f);
    B = _e302;
    let _e304 = L_5;
    let _e306 = pF_4;
    let _e308 = upF_2;
    let _e312 = L_5;
    d_10 = (dot((_e304.xyz - _e306), _e308) - (0.3f + (1.5f * _e312.w)));
    let _e318 = A;
    let _e320 = d_10;
    let _e321 = D_3;
    let _e324 = skyRing(_e318.xy, _e320, _e321, 0f, 1f);
    let _e325 = A;
    let _e327 = d_10;
    let _e328 = D_3;
    let _e331 = skyRing(_e325.zw, _e327, _e328, 1f, 3.5f);
    let _e333 = B;
    let _e335 = d_10;
    let _e336 = D_3;
    let _e339 = skyRing(_e333.xy, _e335, _e336, 3.5f, 9f);
    let _e341 = B;
    let _e343 = d_10;
    let _e344 = D_3;
    let _e347 = skyRing(_e341.zw, _e343, _e344, 9f, 20f);
    let _e349 = C;
    let _e351 = d_10;
    let _e352 = D_3;
    let _e355 = skyRing(_e349.xy, _e351, _e352, 20f, 45f);
    return clamp(((((_e324 + _e331) + _e339) + _e347) + _e355), 0f, 1f);
}

fn skyBlocked(wp_14: vec3<f32>) -> f32 {
    var wp_15: vec3<f32>;
    var dist_1: f32;
    var pF_5: vec3<f32>;
    var bl: f32 = -1f;

    wp_15 = wp_14;
    let _e187 = global.uSkyShadow;
    if (_e187.x < 0.5f) {
        return 0f;
    }
    let _e192 = wp_15;
    dist_1 = length(_e192);
    let _e195 = dist_1;
    let _e196 = global.uSkyShadow;
    if (_e195 > _e196.z) {
        return 0f;
    }
    let _e200 = global.uSkyToFixed;
    let _e201 = wp_15;
    let _e202 = global.uSkyCenter;
    pF_5 = (_e200 * (_e201 - _e202));
    let _e209 = dist_1;
    let _e210 = global.uSkyShadow;
    if (_e209 < _e210.y) {
        let _e214 = global.uSkyD;
        let _e216 = global.uSkyShadowVP0_;
        let _e217 = global.uSkyShadowL0_;
        let _e218 = global.uSkyShadowUp0_;
        let _e219 = global.uSkyShadow;
        let _e221 = pF_5;
        let _e222 = skyShadowMap(0f, _e214.x, _e216, _e217, _e218, _e219.y, _e221);
        bl = _e222;
    }
    let _e223 = bl;
    if (_e223 < 0f) {
        let _e227 = global.uSkyD;
        let _e229 = global.uSkyShadowVP1_;
        let _e230 = global.uSkyShadowL1_;
        let _e231 = global.uSkyShadowUp1_;
        let _e232 = global.uSkyShadow;
        let _e234 = pF_5;
        let _e235 = skyShadowMap(1f, _e227.y, _e229, _e230, _e231, _e232.z, _e234);
        bl = _e235;
    }
    let _e236 = bl;
    if (_e236 < 0f) {
        return 0f;
    }
    let _e240 = bl;
    let _e243 = global.uSkyShadow;
    let _e246 = global.uSkyShadow;
    let _e248 = dist_1;
    return (_e240 * (1f - smoothstep((0.8f * _e243.z), _e246.z, _e248)));
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
    let _e193 = bl_2;
    let _e196 = sunTop_1;
    let _e197 = muS_3;
    let _e201 = skyE_2;
    let _e204 = global.uLeafTint;
    return (((_e193 * 0.1f) * ((_e196 * max(_e197, 0f)) + _e201)) * _e204);
}

fn moonLit(rel_4: vec3<f32>, r_8: f32, up_2: vec3<f32>, N_2: vec3<f32>, sh_2: f32, trans: f32, wrap: f32, skyK: f32) -> vec3<f32> {
    var rel_5: vec3<f32>;
    var r_9: f32;
    var up_3: vec3<f32>;
    var N_3: vec3<f32>;
    var sh_3: f32;
    var trans_1: f32;
    var wrap_1: f32;
    var skyK_1: f32;
    var muM: f32;
    var pF_6: vec3<f32>;
    var T_3: vec3<f32>;
    var S: vec3<f32>;
    var nd: f32;

    rel_5 = rel_4;
    r_9 = r_8;
    up_3 = up_2;
    N_3 = N_2;
    sh_3 = sh_2;
    trans_1 = trans;
    wrap_1 = wrap;
    skyK_1 = skyK;
    let _e201 = global.uMoonE;
    if (_e201.y <= 0f) {
        return vec3(0f);
    }
    let _e207 = up_3;
    let _e208 = global.uMoonDir;
    muM = dot(_e207, _e208);
    let _e211 = muM;
    if (_e211 < -0.1f) {
        return vec3(0f);
    }
    let _e217 = global.uToFixed;
    let _e218 = rel_5;
    pF_6 = (_e217 * _e218);
    let _e221 = r_9;
    let _e222 = muM;
    let _e223 = atmoSunTransmittance(_e221, _e222);
    let _e224 = pF_6;
    let _e225 = pF_6;
    let _e227 = global.uToFixed;
    let _e228 = global.uMoonDir;
    let _e230 = global.uRadius;
    let _e231 = terrainShadow(_e224, normalize(_e225), (_e227 * _e228), _e230);
    let _e233 = sh_3;
    let _e235 = cloudDirZ;
    T_3 = (((_e223 * _e231) * _e233) * _e235);
    let _e238 = r_9;
    let _e239 = muM;
    let _e240 = atmoSkyIrradiance(_e238, _e239);
    let _e241 = cloudTotZ;
    S = (_e240 * _e241);
    let _e244 = N_3;
    let _e245 = global.uMoonDir;
    nd = dot(_e244, _e245);
    let _e248 = global.uMoonE;
    let _e249 = T_3;
    let _e250 = nd;
    let _e253 = trans_1;
    let _e254 = nd;
    let _e261 = S;
    let _e262 = wrap_1;
    let _e264 = skyK_1;
    return (_e248 * ((_e249 * (max(_e250, 0f) + (_e253 * max(-(_e254), 0f)))) + ((_e261 * _e262) * _e264)));
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
    var local_17: f32;
    var glint: f32;
    var rel_6: vec3<f32>;
    var r_10: f32;
    var up_4: vec3<f32>;
    var muS_4: f32;
    var sunT: vec3<f32>;
    var skyE_3: vec3<f32>;
    var cloudT: f32;
    var pF_7: vec3<f32>;
    var sunTop_2: vec3<f32>;
    var keySh: f32;
    var nd_1: f32;
    var ndl_1: f32;
    var local_18: f32;
    var wrap_2: f32;
    var direct: vec3<f32>;
    var skyBl: f32;
    var local_19: f32;
    var skyK_2: f32;
    var ambient: vec3<f32>;
    var local_20: f32;
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
    let _e213 = kind_1;
    if (_e213 == 0f) {
        let _e216 = trans_3;
        local_17 = (_e216 * 3f);
    } else {
        local_17 = 0f;
    }
    let _e221 = local_17;
    glint = _e221;
    let _e223 = kind_1;
    if (_e223 == 0f) {
        trans_3 = 0f;
    }
    let _e227 = kind_1;
    if (_e227 == 5f) {
        return vec3(0f);
    }
    let _e232 = p_1;
    let _e233 = global.uCenter;
    rel_6 = (_e232 - _e233);
    let _e236 = rel_6;
    r_10 = length(_e236);
    let _e239 = rel_6;
    let _e240 = r_10;
    up_4 = (_e239 / vec3(max(_e240, 0.000001f)));
    let _e246 = up_4;
    let _e247 = global.uSunDir;
    muS_4 = dot(_e246, _e247);
    let _e250 = r_10;
    let _e251 = muS_4;
    let _e252 = atmoSunTransmittance(_e250, _e251);
    sunT = _e252;
    let _e254 = r_10;
    let _e255 = muS_4;
    let _e256 = atmoSkyIrradiance(_e254, _e255);
    skyE_3 = _e256;
    let _e258 = rel_6;
    let _e259 = r_10;
    let _e260 = muS_4;
    let _e261 = foot_9;
    let _e262 = sunT;
    let _e265 = cloudLight(_e258, _e259, _e260, _e261, _e262, (&skyE_3));
    cloudT = _e265;
    let _e267 = sunT;
    let _e268 = cloudT;
    sunT = (_e267 * _e268);
    let _e270 = global.uToFixed;
    let _e271 = rel_6;
    pF_7 = (_e270 * _e271);
    let _e274 = sunT;
    let _e275 = pF_7;
    let _e276 = pF_7;
    let _e278 = global.uToFixed;
    let _e279 = global.uSunDir;
    let _e281 = global.uRadius;
    let _e282 = terrainShadow(_e275, normalize(_e276), (_e278 * _e279), _e281);
    sunT = (_e274 * _e282);
    let _e284 = sunT;
    sunTop_2 = _e284;
    let _e286 = p_1;
    let _e287 = N_5;
    let _e288 = sunShadowMap(_e286, _e287);
    keySh = _e288;
    let _e290 = sunT;
    let _e291 = keySh;
    sunT = (_e290 * _e291);
    let _e293 = N_5;
    let _e294 = global.uSunDir;
    nd_1 = dot(_e293, _e294);
    let _e297 = nd_1;
    ndl_1 = max(_e297, 0f);
    let _e301 = kind_1;
    if (_e301 == 2f) {
        let _e306 = N_5;
        let _e307 = up_4;
        local_18 = (0.55f + (0.45f * dot(_e306, _e307)));
    } else {
        let _e313 = N_5;
        let _e314 = up_4;
        local_18 = (0.5f + (0.5f * dot(_e313, _e314)));
    }
    let _e319 = local_18;
    wrap_2 = _e319;
    let _e321 = kind_1;
    if (_e321 == 7f) {
        let _e324 = albedo_1;
        let _e328 = global.uSunE;
        let _e330 = sunT;
        let _e331 = ndl_1;
        let _e333 = N_5;
        let _e334 = p_1;
        let _e343 = selfShadow_1;
        let _e345 = skyE_3;
        return (((_e324 / vec3(3.1415927f)) * _e328) * ((((_e330 * _e331) * pow(max(dot(_e333, normalize(-(_e334))), 0f), 0.15f)) * _e343) + (_e345 * 0.6f)));
    }
    let _e350 = global.uSunE;
    let _e351 = sunT;
    let _e353 = ndl_1;
    let _e354 = trans_3;
    let _e355 = nd_1;
    direct = ((_e350 * _e351) * (_e353 + (_e354 * max(-(_e355), 0f))));
    let _e363 = p_1;
    let _e364 = skyBlocked(_e363);
    skyBl = _e364;
    let _e366 = screenAO_1;
    let _e368 = skyBl;
    let _e371 = kind_1;
    if (_e371 == 1f) {
        let _e374 = p_1;
        let _e375 = trunkSum(_e374);
        local_19 = exp(-(_e375));
    } else {
        let _e378 = p_1;
        let _e379 = trunkSky(_e378);
        local_19 = _e379;
    }
    let _e381 = local_19;
    skyK_2 = ((_e366 * (1f - _e368)) * _e381);
    let _e384 = global.uSunE;
    let _e385 = skyE_3;
    let _e386 = wrap_2;
    let _e388 = skyK_2;
    let _e390 = skyBl;
    let _e391 = sunTop_2;
    let _e392 = muS_4;
    let _e393 = skyE_3;
    let _e394 = canopyLit(_e390, _e391, _e392, _e393);
    let _e395 = screenAO_1;
    let _e399 = global.uAmbientFloor;
    let _e400 = screenAO_1;
    let _e403 = rel_6;
    let _e404 = r_10;
    let _e405 = up_4;
    let _e406 = N_5;
    let _e407 = keySh;
    let _e408 = trans_3;
    let _e409 = wrap_2;
    let _e410 = skyK_2;
    let _e411 = moonLit(_e403, _e404, _e405, _e406, _e407, _e408, _e409, _e410);
    ambient = (((_e384 * (((_e385 * _e386) * _e388) + (_e394 * _e395))) + (_e399 * _e400)) + _e411);
    let _e414 = kind_1;
    if (_e414 == 3f) {
        local_20 = 0f;
    } else {
        let _e418 = p_1;
        let _e419 = grassCover(_e418);
        local_20 = _e419;
    }
    let _e421 = local_20;
    gSum = _e421;
    let _e425 = gSum;
    gCov = exp((-2.2f * _e425));
    let _e429 = direct;
    let _e430 = gCov;
    let _e431 = selfShadow_1;
    direct = (_e429 * (_e430 * _e431));
    let _e434 = ambient;
    let _e440 = gSum;
    ambient = (_e434 * (1f - (0.35f * (1f - exp((-0.8f * _e440))))));
    let _e447 = albedo_1;
    let _e449 = metal_1;
    diffuse = (_e447 * (1f - _e449));
    let _e453 = diffuse;
    let _e457 = direct;
    let _e459 = ao_1;
    let _e463 = ambient;
    let _e464 = ao_1;
    let _e468 = cave_1;
    color = (((_e453 / vec3(3.1415927f)) * ((_e457 * mix(1f, _e459, 0.35f)) + (_e463 * _e464))) * _e468);
    let _e471 = p_1;
    V = normalize(-(_e471));
    let _e475 = V;
    let _e476 = global.uSunDir;
    H_1 = normalize((_e475 + _e476));
    let _e480 = roughness_1;
    let _e482 = wet_1;
    rg = clamp(mix(_e480, 0.12f, (_e482 * 0.8f)), 0.05f, 1f);
    let _e490 = rg;
    let _e491 = rg;
    let _e493 = rg;
    let _e495 = rg;
    a2_ = (((_e490 * _e491) * _e493) * _e495);
    let _e498 = N_5;
    let _e499 = H_1;
    NdH = max(dot(_e498, _e499), 0f);
    let _e504 = N_5;
    let _e505 = V;
    NdV = max(dot(_e504, _e505), 0.001f);
    let _e510 = V;
    let _e511 = H_1;
    VdH = max(dot(_e510, _e511), 0f);
    let _e516 = a2_;
    let _e517 = NdH;
    let _e518 = NdH;
    let _e520 = a2_;
    Dg = (_e516 / (PI * pow((((_e517 * _e518) * (_e520 - 1f)) + 1f), 2f)));
    let _e531 = rg;
    let _e534 = rg;
    kk = (((_e531 + 1f) * (_e534 + 1f)) / 8f);
    let _e541 = NdV;
    let _e542 = NdV;
    let _e544 = kk;
    let _e547 = kk;
    let _e550 = ndl_1;
    let _e552 = ndl_1;
    let _e554 = kk;
    let _e557 = kk;
    Gg = (((_e541 / ((_e542 * (1f - _e544)) + _e547)) * _e550) / ((_e552 * (1f - _e554)) + _e557));
    let _e561 = f0_2;
    let _e563 = f0_2;
    let _e566 = VdH;
    Fs = (_e561 + ((1f - _e563) * pow((1f - _e566), 5f)));
    let _e573 = kind_1;
    if (_e573 != 2f) {
        let _e576 = color;
        let _e577 = global.uSunE;
        let _e578 = sunT;
        let _e580 = gCov;
        let _e582 = selfShadow_1;
        let _e584 = Dg;
        let _e586 = Gg;
        let _e588 = Fs;
        let _e590 = albedo_1;
        let _e593 = albedo_1;
        let _e596 = VdH;
        let _e602 = metal_1;
        let _e607 = NdV;
        color = (_e576 + (((((((_e577 * _e578) * _e580) * _e582) * _e584) * _e586) * mix(vec3(_e588), (_e590 + ((vec3(1f) - _e593) * pow((1f - _e596), 5f))), vec3(_e602))) / vec3((4f * _e607))));
    }
    let _e612 = color;
    let _e613 = global.uSunE;
    let _e614 = sunT;
    let _e616 = gCov;
    let _e618 = glint;
    color = (_e612 + (((_e613 * _e614) * _e616) * _e618));
    let _e623 = wet_1;
    poolK = smoothstep(0.85f, 1f, _e623);
    let _e626 = poolK;
    if (_e626 > 0f) {
        {
            let _e629 = up_4;
            let _e630 = V;
            cP = max(dot(_e629, _e630), 0.001f);
            let _e638 = cP;
            Fp = (0.02f + (0.98f * pow((1f - _e638), 5f)));
            let _e645 = color;
            let _e646 = color;
            let _e648 = Fp;
            let _e651 = global.uSunE;
            let _e652 = skyE_3;
            let _e659 = Fp;
            let _e661 = screenAO_1;
            let _e664 = global.uSunE;
            let _e665 = sunT;
            let _e669 = V;
            let _e671 = up_4;
            let _e673 = global.uSunDir;
            let _e681 = poolK;
            color = mix(_e645, (((_e646 * (1f - _e648)) + (((((_e651 * _e652) / vec3(3.1415927f)) * 1.1f) * _e659) * _e661)) + (((_e664 * _e665) * 0.05f) * pow(max(dot(reflect(-(_e669), _e671), _e673), 0f), 200f))), vec3(_e681));
        }
    }
    let _e684 = global.uThermal;
    if (_e684.x > 0f) {
        {
            let _e688 = albedo_1;
            a_7 = clamp(_e688, vec3(0f), vec3(1f));
            let _e695 = color;
            let _e698 = a_7;
            let _e700 = global.uThermal;
            let _e702 = global.uThermal;
            let _e704 = r_10;
            let _e705 = global.uRadius;
            let _e709 = blackbodyGlow((_e700.x - (_e702.y * (_e704 - _e705))));
            color = (_e695 + ((vec3(1f) - _e698) * _e709));
            let _e712 = color;
            let _e713 = a_7;
            let _e716 = r_10;
            let _e718 = atmoSunTransmittance(_e716, 1f);
            let _e721 = global.uThermal;
            let _e723 = global.uThermal;
            let _e725 = r_10;
            let _e726 = global.uRadius;
            let _e732 = blackbodyGlow((_e721.x - (_e723.z * max((_e725 - _e726), 0f))));
            color = (_e712 + ((_e713 * (vec3(1f) - _e718)) * _e732));
        }
    }
    let _e735 = color;
    return _e735;
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
    var local_21: vec2<f32>;
    var local_22: vec2<f32>;

    channel_1 = channel;
    transform_1 = transform;
    let _e197 = transform_1;
    let _e198 = channel_1;
    if (_e198 == 1i) {
        let _e201 = vUv1_1;
        local_22 = _e201;
    } else {
        let _e202 = channel_1;
        if (_e202 == 2i) {
            let _e205 = vUv2_1;
            local_21 = _e205;
        } else {
            let _e206 = vUv_1;
            local_21 = _e206;
        }
        let _e208 = local_21;
        local_22 = _e208;
    }
    let _e210 = local_22;
    return (_e197 * vec3<f32>(_e210.x, _e210.y, 1f)).xy;
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
    var local_23: f32;
    var mask: vec4<f32>;
    var paint: vec3<f32>;
    var an: vec3<f32>;
    var local_24: vec2<f32>;
    var local_25: vec2<f32>;
    var q_3: vec2<f32>;
    var f_5: vec2<f32>;
    var fw: vec2<f32>;
    var fade: f32;
    var seam: f32;
    var tone: f32;
    var rough: f32;
    var metal_2: f32;
    var ao_2: f32;
    var emit: vec3<f32>;
    var local_26: vec3<f32>;
    var N_6: vec3<f32>;
    var mapN: vec3<f32>;
    var q1_: vec3<f32>;
    var q0_: vec3<f32>;
    var T_4: vec3<f32>;
    var B_1: vec3<f32>;
    var scale: f32;
    var local_27: f32;
    var kind_2: f32;
    var color_1: vec3<f32>;
    var alpha: f32;
    var fresK: f32;

    let _e193 = vWorld_1;
    let _e194 = dpdx(_e193);
    dpX = _e194;
    let _e196 = vWorld_1;
    let _e197 = dpdy(_e196);
    dpY = _e197;
    let _e199 = global.uChannels;
    let _e201 = global.normalMapTransform;
    let _e202 = texUV(_e199.y, _e201);
    nUV = _e202;
    let _e204 = nUV;
    let _e205 = dpdx(_e204);
    dx = _e205;
    let _e207 = nUV;
    let _e208 = dpdy(_e207);
    dy = _e208;
    let _e210 = global.uChannels;
    let _e212 = global.mapTransform;
    let _e213 = texUV(_e210.x, _e212);
    uv0_ = _e213;
    let _e215 = global.uChannels;
    let _e217 = global.roughnessMapTransform;
    let _e218 = texUV(_e215.z, _e217);
    uvR = _e218;
    let _e220 = global.uChannels;
    let _e222 = global.metalnessMapTransform;
    let _e223 = texUV(_e220.w, _e222);
    uvM = _e223;
    let _e225 = global.uChannels2_;
    let _e227 = global.emissiveMapTransform;
    let _e228 = texUV(_e225.x, _e227);
    uvE = _e228;
    let _e230 = global.uChannels2_;
    let _e232 = global.aoMapTransform;
    let _e233 = texUV(_e230.y, _e232);
    uvA = _e233;
    let _e235 = global.uChannels2_;
    let _e237 = global.alphaMapTransform;
    let _e238 = texUV(_e235.z, _e237);
    uvAlpha = _e238;
    let _e240 = global.uBase;
    let _e241 = uv0_;
    let _e242 = uv0_;
    let _e243 = dpdx(_e242);
    let _e244 = uv0_;
    let _e245 = dpdy(_e244);
    let _e246 = textureSampleGrad(mapTexture, mapSampler, _e241, _e243, _e245);
    base = (_e240 * _e246);
    let _e249 = global.uLivery;
    if (_e249.x > 0.5f) {
        {
            let _e253 = vColor_1;
            let _e254 = _e253.xyz;
            let _e255 = global.uLivery;
            if (_e255.y > 0.5f) {
                let _e259 = vColor_1;
                local_23 = _e259.w;
            } else {
                local_23 = 0f;
            }
            let _e263 = local_23;
            mask = vec4<f32>(_e254.x, _e254.y, _e254.z, _e263);
            let _e269 = global.uPaint1_;
            let _e270 = global.uPaint2_;
            let _e271 = mask;
            let _e275 = global.uPaint3_;
            let _e276 = mask;
            paint = mix(mix(_e269, _e270, vec3(_e271.y)), _e275, vec3(_e276.z));
            let _e281 = vObjN_1;
            an = abs(_e281);
            let _e284 = an;
            let _e286 = an;
            let _e288 = an;
            if (_e284.x > max(_e286.y, _e288.z)) {
                let _e292 = vObjPos_1;
                local_25 = _e292.zy;
            } else {
                let _e294 = an;
                let _e296 = an;
                if (_e294.y > _e296.z) {
                    let _e299 = vObjPos_1;
                    local_24 = _e299.xz;
                } else {
                    let _e301 = vObjPos_1;
                    local_24 = _e301.xy;
                }
                let _e304 = local_24;
                local_25 = _e304;
            }
            let _e306 = local_25;
            q_3 = _e306;
            let _e308 = q_3;
            f_5 = (fract((_e308 / vec2<f32>(9f, 4.5f))) - vec2(0.5f));
            let _e318 = q_3;
            let _e323 = fwidth((_e318 / vec2<f32>(9f, 4.5f)));
            fw = _e323;
            let _e328 = fw;
            let _e330 = fw;
            fade = (1f - smoothstep(0.03f, 0.12f, max(_e328.x, _e330.y)));
            let _e336 = fade;
            let _e340 = fw;
            let _e346 = f_5;
            let _e355 = fw;
            let _e361 = f_5;
            seam = (_e336 * max((1f - smoothstep(0f, ((1.5f * _e340.x) + 0.004f), (0.5f - abs(_e346.x)))), (1f - smoothstep(0f, ((1.5f * _e355.y) + 0.004f), (0.5f - abs(_e361.y))))));
            let _e370 = q_3;
            tone = fract((sin(dot(floor((_e370 / vec2<f32>(9f, 4.5f))), vec2<f32>(12.9898f, 78.233f))) * 43758.547f));
            let _e385 = base;
            let _e387 = base;
            let _e389 = paint;
            let _e392 = tone;
            let _e398 = seam;
            let _e404 = mask;
            let _e409 = (_e387.xyz * (((_e389 * (0.9f + (0.12f * _e392))) * (1f - (0.35f * _e398))) * (1f - (0.45f * _e404.w))));
            base.x = _e409.x;
            base.y = _e409.y;
            base.z = _e409.z;
        }
    } else {
        let _e416 = global.uFlags;
        if (_e416.x > 0.5f) {
            let _e420 = base;
            let _e421 = vColor_1;
            base = (_e420 * _e421);
        } else {
            let _e423 = base;
            let _e425 = base;
            let _e427 = vColor_1;
            let _e429 = (_e425.xyz * _e427.xyz);
            base.x = _e429.x;
            base.y = _e429.y;
            base.z = _e429.z;
        }
    }
    let _e437 = base;
    let _e439 = uvAlpha;
    let _e440 = uvAlpha;
    let _e441 = dpdx(_e440);
    let _e442 = uvAlpha;
    let _e443 = dpdy(_e442);
    let _e444 = textureSampleGrad(alphaMapTexture, alphaMapSampler, _e439, _e441, _e443);
    base.w = (_e437.w * _e444.y);
    let _e447 = global.uPBR;
    let _e449 = uvR;
    let _e450 = uvR;
    let _e451 = dpdx(_e450);
    let _e452 = uvR;
    let _e453 = dpdy(_e452);
    let _e454 = textureSampleGrad(roughnessMapTexture, roughnessMapSampler, _e449, _e451, _e453);
    rough = (_e447.x * _e454.y);
    let _e458 = global.uPBR;
    let _e460 = uvM;
    let _e461 = uvM;
    let _e462 = dpdx(_e461);
    let _e463 = uvM;
    let _e464 = dpdy(_e463);
    let _e465 = textureSampleGrad(metalnessMapTexture, metalnessMapSampler, _e460, _e462, _e464);
    metal_2 = (_e458.y * _e465.z);
    let _e470 = uvA;
    let _e471 = uvA;
    let _e472 = dpdx(_e471);
    let _e473 = uvA;
    let _e474 = dpdy(_e473);
    let _e475 = textureSampleGrad(aoMapTexture, aoMapSampler, _e470, _e472, _e474);
    let _e477 = global.uPBR;
    ao_2 = mix(1f, _e475.x, _e477.w);
    let _e481 = global.uEmissive;
    let _e482 = uvE;
    let _e483 = uvE;
    let _e484 = dpdx(_e483);
    let _e485 = uvE;
    let _e486 = dpdy(_e485);
    let _e487 = textureSampleGrad(emissiveMapTexture, emissiveMapSampler, _e482, _e484, _e486);
    emit = (_e481 * _e487.xyz);
    let _e491 = global.uFlags;
    if (_e491.w > 0.5f) {
        let _e495 = dpX;
        let _e496 = dpY;
        local_26 = cross(_e495, _e496);
    } else {
        let _e498 = vNormal_1;
        local_26 = _e498;
    }
    let _e500 = local_26;
    N_6 = normalize(_e500);
    let _e504 = gl_FrontFacing_1;
    if !(_e504) {
        let _e506 = N_6;
        N_6 = -(_e506);
    }
    let _e508 = nUV;
    let _e509 = dx;
    let _e510 = dy;
    let _e511 = textureSampleGrad(normalMapTexture, normalMapSampler, _e508, _e509, _e510);
    mapN = ((_e511.xyz * 2f) - vec3(1f));
    let _e519 = global.uFlags;
    if (_e519.z > 0.5f) {
        {
            let _e523 = mapN;
            let _e525 = mapN;
            let _e527 = global.uNormalScale;
            let _e528 = (_e525.xy * _e527);
            mapN.x = _e528.x;
            mapN.y = _e528.y;
            let _e533 = dpY;
            let _e534 = N_6;
            q1_ = cross(_e533, _e534);
            let _e537 = N_6;
            let _e538 = dpX;
            q0_ = cross(_e537, _e538);
            let _e541 = q1_;
            let _e542 = dx;
            let _e545 = q0_;
            let _e546 = dy;
            T_4 = ((_e541 * _e542.x) + (_e545 * _e546.x));
            let _e551 = q1_;
            let _e552 = dx;
            let _e555 = q0_;
            let _e556 = dy;
            B_1 = ((_e551 * _e552.y) + (_e555 * _e556.y));
            let _e561 = T_4;
            let _e562 = T_4;
            let _e564 = B_1;
            let _e565 = B_1;
            scale = inverseSqrt(max(max(dot(_e561, _e562), dot(_e564, _e565)), 0.00000000000000000001f));
            let _e572 = T_4;
            let _e573 = mapN;
            let _e575 = scale;
            let _e578 = B_1;
            let _e579 = mapN;
            let _e581 = scale;
            let _e585 = N_6;
            let _e586 = mapN;
            N_6 = normalize((((_e572 * (_e573.x * _e575)) + (_e578 * (_e579.y * _e581))) + (_e585 * _e586.z)));
        }
    }
    let _e591 = base;
    let _e593 = global.uPBR;
    if (_e591.w < _e593.z) {
        discard;
    }
    let _e596 = global.uInterior;
    if (_e596 > 0.5f) {
        local_27 = 5f;
    } else {
        local_27 = 4f;
    }
    let _e602 = local_27;
    kind_2 = _e602;
    let _e604 = vWorld_1;
    let _e605 = N_6;
    let _e606 = base;
    let _e608 = rough;
    let _e609 = ao_2;
    let _e614 = vWorld_1;
    let _e615 = fwidth(_e614);
    let _e617 = metal_2;
    let _e618 = kind_2;
    let _e621 = deferredLight(_e604, _e605, _e606.xyz, _e608, _e609, 0f, 0.04f, 1f, 0f, length(_e615), _e617, _e618, 1f, 1f);
    let _e622 = emit;
    color_1 = (_e621 + _e622);
    let _e626 = color_1;
    let _e627 = vWorld_1;
    let _e628 = N_6;
    let _e629 = base;
    let _e630 = _e629.xyz;
    let _e631 = ao_2;
    let _e638 = metal_2;
    let _e641 = rough;
    let _e642 = kind_2;
    let _e643 = gl_FragCoord_1;
    let _e645 = nativeLocal(_e627, _e628, vec4<f32>(_e630.x, _e630.y, _e630.z, _e631), vec4<f32>(0f, 0f, _e638, 0.04f), _e641, _e642, _e643.xy);
    color_1 = (_e626 + _e645);
    let _e647 = global.uFlags;
    if (_e647.y > 0.5f) {
        let _e651 = base;
        let _e653 = emit;
        color_1 = (_e651.xyz + _e653);
    }
    let _e655 = base;
    alpha = _e655.w;
    let _e658 = global.uCanopy;
    if (_e658 > 0.5f) {
        {
            let _e661 = gl_FrontFacing_1;
            if _e661 {
                {
                    let _e663 = N_6;
                    let _e664 = vWorld_1;
                    fresK = pow((1f - abs(dot(_e663, normalize(-(_e664))))), 2.5f);
                    let _e675 = fresK;
                    alpha = mix(0.16f, 0.85f, _e675);
                    let _e677 = color_1;
                    let _e682 = fresK;
                    color_1 = (_e677 + (vec3<f32>(0.05f, 0.07f, 0.09f) * _e682));
                }
            } else {
                alpha = 0.06f;
            }
        }
    }
    let _e686 = color_1;
    let _e687 = alpha;
    fragmentColor = vec4<f32>(_e686.x, _e686.y, _e686.z, _e687);
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
    let _e261 = fragmentColor;
    return FragmentOutput(_e261);
}
`;
