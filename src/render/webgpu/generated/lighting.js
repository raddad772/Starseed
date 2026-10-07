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
      "name": "uBodyIndex",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 140
    },
    {
      "name": "uHasAtmo",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 144
    },
    {
      "name": "uBottom",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 148
    },
    {
      "name": "uTop",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 152
    },
    {
      "name": "uGround",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 156
    },
    {
      "name": "uTrueK",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 160
    },
    {
      "name": "uSunLift",
      "type": "vec2",
      "count": 0,
      "align": 8,
      "size": 8,
      "stride": 8,
      "offset": 168
    },
    {
      "name": "uCloudYear",
      "type": "vec2",
      "count": 0,
      "align": 8,
      "size": 8,
      "stride": 8,
      "offset": 176
    },
    {
      "name": "uCloudClock",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 192
    },
    {
      "name": "uCloudWind",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 208
    },
    {
      "name": "uCSOrigin",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 224
    },
    {
      "name": "uCSE",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 240
    },
    {
      "name": "uCSN",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 256
    },
    {
      "name": "uCSInvL",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 268
    },
    {
      "name": "uCSLod",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 272
    },
    {
      "name": "uCSOn",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 276
    },
    {
      "name": "uCloudTau",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 280
    },
    {
      "name": "uThermal",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 288
    },
    {
      "name": "uHeightCube",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 304
    },
    {
      "name": "uSunShadow",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 320
    },
    {
      "name": "uSunShadowVP0",
      "type": "mat4",
      "count": 0,
      "align": 16,
      "size": 64,
      "stride": 64,
      "offset": 336
    },
    {
      "name": "uSunShadowVP1",
      "type": "mat4",
      "count": 0,
      "align": 16,
      "size": 64,
      "stride": 64,
      "offset": 400
    },
    {
      "name": "uSunShadowL0",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 464
    },
    {
      "name": "uSunShadowL1",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 480
    },
    {
      "name": "uSunShadowDir",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 496
    },
    {
      "name": "uGrassCover",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 512
    },
    {
      "name": "uGrassCoverVP",
      "type": "mat4",
      "count": 0,
      "align": 16,
      "size": 64,
      "stride": 64,
      "offset": 528
    },
    {
      "name": "uTrunkSky",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 592
    },
    {
      "name": "uRockSky",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 608
    },
    {
      "name": "uTrunkSkyVP",
      "type": "mat4",
      "count": 0,
      "align": 16,
      "size": 64,
      "stride": 64,
      "offset": 624
    },
    {
      "name": "uSkyShadow",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 688
    },
    {
      "name": "uSkyShadowVP0",
      "type": "mat4",
      "count": 0,
      "align": 16,
      "size": 64,
      "stride": 64,
      "offset": 704
    },
    {
      "name": "uSkyShadowVP1",
      "type": "mat4",
      "count": 0,
      "align": 16,
      "size": 64,
      "stride": 64,
      "offset": 768
    },
    {
      "name": "uSkyShadowL0",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 832
    },
    {
      "name": "uSkyShadowL1",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 848
    },
    {
      "name": "uSkyShadowUp0",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 864
    },
    {
      "name": "uSkyShadowUp1",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 880
    },
    {
      "name": "uSkyCenter",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 896
    },
    {
      "name": "uSkyToFixed",
      "type": "mat3",
      "count": 0,
      "align": 16,
      "size": 48,
      "stride": 48,
      "offset": 912
    },
    {
      "name": "uSkyD",
      "type": "vec2",
      "count": 0,
      "align": 8,
      "size": 8,
      "stride": 8,
      "offset": 960
    },
    {
      "name": "uLeafTint",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 976
    },
    {
      "name": "uCanopySun",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 992
    },
    {
      "name": "uCanopySky",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 1008
    },
    {
      "name": "uMoonDir",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 1024
    },
    {
      "name": "uMoonE",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 1040
    },
    {
      "name": "uHandPos",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 1056
    },
    {
      "name": "uHandDir",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 1072
    },
    {
      "name": "uHandE",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 1088
    },
    {
      "name": "uHandCone",
      "type": "vec2",
      "count": 0,
      "align": 8,
      "size": 8,
      "stride": 8,
      "offset": 1104
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
    }
  ],
  "bytes": 1120,
  "group": 2,
  "attributes": []
};
export const code = /* wgsl */`
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
    uBodyIndex: f32,
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
    uCanopySun: vec3<f32>,
    uCanopySky: vec3<f32>,
    uMoonDir: vec3<f32>,
    uMoonE: vec3<f32>,
    uHandPos: vec3<f32>,
    uHandDir: vec3<f32>,
    uHandE: vec3<f32>,
    uHandCone: vec2<f32>,
}

struct FragmentOutput {
    @location(0) fragmentColor: vec4<f32>,
}

const PI: f32 = 3.1415927f;
const HC_N: array<vec3<f32>, 6> = array<vec3<f32>, 6>(vec3<f32>(1f, 0f, 0f), vec3<f32>(-1f, 0f, 0f), vec3<f32>(0f, 1f, 0f), vec3<f32>(0f, -1f, 0f), vec3<f32>(0f, 0f, 1f), vec3<f32>(0f, 0f, -1f));
const HC_U: array<vec3<f32>, 6> = array<vec3<f32>, 6>(vec3<f32>(0f, 0f, -1f), vec3<f32>(0f, 0f, 1f), vec3<f32>(1f, 0f, 0f), vec3<f32>(1f, 0f, 0f), vec3<f32>(1f, 0f, 0f), vec3<f32>(-1f, 0f, 0f));
const HC_V: array<vec3<f32>, 6> = array<vec3<f32>, 6>(vec3<f32>(0f, 1f, 0f), vec3<f32>(0f, 1f, 0f), vec3<f32>(0f, 0f, -1f), vec3<f32>(0f, 0f, 1f), vec3<f32>(0f, 1f, 0f), vec3<f32>(0f, 1f, 0f));

@group(2) @binding(0) 
var<uniform> global: Params;
@group(2) @binding(1) 
var tNoiseTexture: texture_3d<f32>;
@group(2) @binding(2) 
var tNoiseSampler: sampler;
@group(2) @binding(3) 
var tCloudMapTexture: texture_2d<f32>;
@group(2) @binding(4) 
var tCloudMapSampler: sampler;
@group(2) @binding(5) 
var tTransTexture: texture_2d<f32>;
@group(2) @binding(6) 
var tTransSampler: sampler;
@group(2) @binding(7) 
var tIrrTexture: texture_2d<f32>;
@group(2) @binding(8) 
var tIrrSampler: sampler;
@group(2) @binding(9) 
var tCloudShadowTexture: texture_2d<f32>;
@group(2) @binding(10) 
var tCloudShadowSampler: sampler;
@group(2) @binding(11) 
var tHeightCubeTexture: texture_2d_array<f32>;
@group(2) @binding(12) 
var tHeightCubeSampler: sampler;
@group(2) @binding(13) 
var tShadowAtlasTexture: texture_2d<f32>;
@group(2) @binding(14) 
var tShadowAtlasSampler: sampler;
@group(2) @binding(15) 
var tSkyRingsTexture: texture_2d<f32>;
@group(2) @binding(16) 
var tSkyRingsSampler: sampler;
var<private> fragmentColor: vec4<f32>;
var<private> cloudDirZ: f32 = 1f;
var<private> cloudTotZ: f32 = 1f;

fn lensTrueZ(zd: f32) -> f32 {
    var zd_1: f32;
    var hD: f32;
    var hT: f32;
    var local: f32;

    zd_1 = zd;
    let _e139 = global.uSunLift;
    hD = (1.5707963f + _e139.x);
    let _e144 = global.uSunLift;
    hT = (1.5707963f + _e144.y);
    let _e148 = zd_1;
    let _e149 = hD;
    if (_e148 <= _e149) {
        let _e151 = zd_1;
        let _e152 = hT;
        let _e154 = hD;
        local = ((_e151 * _e152) / _e154);
    } else {
        let _e156 = hT;
        let _e157 = zd_1;
        let _e158 = hD;
        let _e161 = hT;
        let _e165 = hD;
        local = (_e156 + (((_e157 - _e158) * (3.1415927f - _e161)) / (3.1415927f - _e165)));
    }
    let _e170 = local;
    return _e170;
}

fn liftMu(mu: f32) -> f32 {
    var mu_1: f32;

    mu_1 = mu;
    let _e138 = global.uSunLift;
    let _e140 = global.uSunLift;
    if (_e138.x <= _e140.y) {
        let _e143 = mu_1;
        return _e143;
    }
    let _e144 = mu_1;
    let _e150 = lensTrueZ(acos(clamp(_e144, -1f, 1f)));
    return cos(_e150);
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
    let _e141 = global.uTop;
    let _e142 = global.uTop;
    let _e144 = global.uBottom;
    let _e145 = global.uBottom;
    H = sqrt(max(0f, ((_e141 * _e142) - (_e144 * _e145))));
    let _e152 = r_1;
    let _e153 = r_1;
    let _e155 = global.uBottom;
    let _e156 = global.uBottom;
    rho = sqrt(max(0f, ((_e152 * _e153) - (_e155 * _e156))));
    let _e162 = r_1;
    let _e163 = r_1;
    let _e165 = mu_3;
    let _e166 = mu_3;
    let _e171 = global.uTop;
    let _e172 = global.uTop;
    disc = (((_e162 * _e163) * ((_e165 * _e166) - 1f)) + (_e171 * _e172));
    let _e177 = r_1;
    let _e179 = mu_3;
    let _e181 = disc;
    d = max(0f, ((-(_e177) * _e179) + sqrt(max(_e181, 0f))));
    let _e188 = global.uTop;
    let _e189 = r_1;
    dMin = (_e188 - _e189);
    let _e192 = rho;
    let _e193 = H;
    dMax = (_e192 + _e193);
    let _e196 = d;
    let _e197 = dMin;
    let _e199 = dMax;
    let _e200 = dMin;
    let _e205 = rho;
    let _e206 = H;
    return vec2<f32>(((_e196 - _e197) / max((_e199 - _e200), 0.000001f)), (_e205 / max(_e206, 0.000001f)));
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
    let _e140 = mu_5;
    let _e141 = liftMu(_e140);
    mu_5 = _e141;
    let _e142 = global.uGround;
    let _e143 = global.uTrueK;
    Rg = (_e142 * max(_e143, 1f));
    let _e148 = Rg;
    let _e149 = Rg;
    let _e150 = r_3;
    let _e151 = global.uGround;
    sinH = (_e148 / (_e149 + max((_e150 - _e151), 0f)));
    let _e160 = sinH;
    let _e161 = sinH;
    cosH = -(sqrt(max(0f, (1f - (_e160 * _e161)))));
    let _e168 = cosH;
    let _e171 = cosH;
    let _e174 = mu_5;
    vis = smoothstep((_e168 - 0.01f), (_e171 + 0.01f), _e174);
    let _e177 = global.uHasAtmo;
    if (_e177 < 0.5f) {
        let _e180 = vis;
        return vec3(_e180);
    }
    let _e182 = r_3;
    let _e183 = global.uBottom;
    let _e184 = global.uTop;
    let _e186 = mu_5;
    let _e187 = transmittanceUV(clamp(_e182, _e183, _e184), _e186);
    uv = _e187;
    let _e196 = uv;
    uv = (vec2<f32>(0.001953125f, 0.0078125f) + (_e196 * vec2<f32>(0.99609375f, 0.984375f)));
    let _e206 = uv;
    let _e208 = textureSampleLevel(tTransTexture, tTransSampler, _e206, 0f);
    let _e210 = vis;
    return (_e208.xyz * _e210);
}

fn atmoSkyIrradiance(r_4: f32, mu_6: f32) -> vec3<f32> {
    var r_5: f32;
    var mu_7: f32;
    var uv_1: vec2<f32>;

    r_5 = r_4;
    mu_7 = mu_6;
    let _e140 = global.uHasAtmo;
    if (_e140 < 0.5f) {
        return vec3(0f);
    }
    let _e145 = mu_7;
    let _e146 = liftMu(_e145);
    mu_7 = _e146;
    let _e147 = mu_7;
    let _e152 = r_5;
    let _e153 = global.uGround;
    let _e155 = global.uTop;
    let _e156 = global.uGround;
    uv_1 = vec2<f32>(((_e147 * 0.5f) + 0.5f), clamp(((_e152 - _e153) / (_e155 - _e156)), 0f, 1f));
    let _e171 = uv_1;
    uv_1 = (vec2<f32>(0.0078125f, 0.03125f) + (_e171 * vec2<f32>(0.984375f, 0.9375f)));
    let _e181 = uv_1;
    let _e183 = textureSampleLevel(tIrrTexture, tIrrSampler, _e181, 0f);
    return _e183.xyz;
}

fn cloudN(n: f32) -> f32 {
    var n_1: f32;

    n_1 = n;
    let _e139 = n_1;
    return (0.55f + ((_e139 - 0.682f) * 4.3f));
}

fn cloudBias(cover: f32) -> f32 {
    var cover_1: f32;

    cover_1 = cover;
    let _e138 = cover_1;
    let _e146 = cover_1;
    let _e154 = cover_1;
    return ((((_e138 - 0.5f) * 0.3f) + (0.5f * smoothstep(0.8f, 1f, _e146))) - (0.5f * (1f - smoothstep(0f, 0.2f, _e154))));
}

fn cloudFade(foot: f32, L: f32) -> f32 {
    var foot_1: f32;
    var L_1: f32;

    foot_1 = foot;
    L_1 = L;
    let _e142 = foot_1;
    let _e145 = L_1;
    return smoothstep(1f, 4f, ((_e142 * 64f) / _e145));
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
    let _e139 = textureDimensions(tCloudMapTexture, 0i);
    sz = vec2<f32>(vec2<i32>(_e139));
    let _e143 = uv_3;
    let _e144 = sz;
    st = ((_e143 * _e144) - vec2(0.5f));
    let _e150 = st;
    i = floor(_e150);
    let _e153 = st;
    let _e154 = i;
    f = (_e153 - _e154);
    let _e157 = f;
    let _e158 = f;
    f2_ = (_e157 * _e158);
    let _e161 = f2_;
    let _e162 = f;
    f3_ = (_e161 * _e162);
    let _e167 = f;
    let _e172 = f2_;
    let _e175 = f3_;
    w0_ = ((((vec2(1f) - (3f * _e167)) + (3f * _e172)) - _e175) / vec2(6f));
    let _e183 = f2_;
    let _e188 = f3_;
    w1_ = (((vec2(4f) - (6f * _e183)) + (3f * _e188)) / vec2(6f));
    let _e197 = f;
    let _e202 = f2_;
    let _e206 = f3_;
    w2_ = ((((vec2(1f) + (3f * _e197)) + (3f * _e202)) - (3f * _e206)) / vec2(6f));
    let _e213 = f3_;
    w3_ = (_e213 / vec2(6f));
    let _e218 = w0_;
    let _e219 = w1_;
    g0_ = (_e218 + _e219);
    let _e222 = w2_;
    let _e223 = w3_;
    g1_ = (_e222 + _e223);
    let _e226 = i;
    let _e230 = w1_;
    let _e231 = g0_;
    let _e234 = sz;
    h0_ = (((_e226 - vec2(0.5f)) + (_e230 / _e231)) / _e234);
    let _e237 = i;
    let _e241 = w3_;
    let _e242 = g1_;
    let _e245 = sz;
    h1_ = (((_e237 + vec2(1.5f)) + (_e241 / _e242)) / _e245);
    let _e248 = g0_;
    let _e250 = g0_;
    let _e252 = h0_;
    let _e254 = textureSampleLevel(tCloudMapTexture, tCloudMapSampler, _e252, 0f);
    let _e257 = g1_;
    let _e259 = h1_;
    let _e261 = h0_;
    let _e265 = textureSampleLevel(tCloudMapTexture, tCloudMapSampler, vec2<f32>(_e259.x, _e261.y), 0f);
    let _e270 = g1_;
    let _e272 = g0_;
    let _e274 = h0_;
    let _e276 = h1_;
    let _e280 = textureSampleLevel(tCloudMapTexture, tCloudMapSampler, vec2<f32>(_e274.x, _e276.y), 0f);
    let _e283 = g1_;
    let _e285 = h1_;
    let _e287 = textureSampleLevel(tCloudMapTexture, tCloudMapSampler, _e285, 0f);
    return ((_e248.y * ((_e250.x * _e254.xyz) + (_e257.x * _e265.xyz))) + (_e270.y * ((_e272.x * _e280.xyz) + (_e283.x * _e287.xyz))));
}

fn cloudClimate(dirF: vec3<f32>) -> f32 {
    var dirF_1: vec3<f32>;
    var lat: f32;
    var cm: vec3<f32>;

    dirF_1 = dirF;
    let _e138 = dirF_1;
    lat = asin(clamp(_e138.y, -1f, 1f));
    let _e146 = global.uCloudMapMean;
    if (_e146 <= 0f) {
        let _e150 = lat;
        return (0.12f * cos((abs(_e150) * 6f)));
    }
    let _e156 = dirF_1;
    let _e158 = dirF_1;
    let _e165 = lat;
    let _e171 = cloudMapSmooth(vec2<f32>(((atan2(_e156.z, _e158.x) / 6.2832f) + 0.5f), ((_e165 / 3.14159f) + 0.5f)));
    cm = _e171;
    let _e173 = cm;
    let _e175 = cm;
    let _e179 = global.uCloudYear;
    let _e183 = cm;
    let _e187 = global.uCloudYear;
    let _e191 = global.uCloudMapMean;
    return ((((_e173.x + ((_e175.y - 0.5f) * _e179.x)) + ((_e183.z - 0.5f) * _e187.y)) - _e191) * 0.8f);
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
    let _e144 = global.uRadius;
    L0_ = (_e144 * 1f);
    let _e148 = global.uRadius;
    L1_ = (_e148 * 0.236f);
    let _e152 = foot_3;
    let _e153 = L0_;
    let _e154 = cloudFade(_e152, _e153);
    f0_ = _e154;
    let _e156 = foot_3;
    let _e157 = L1_;
    let _e158 = cloudFade(_e156, _e157);
    f1_ = _e158;
    let _e160 = q_1;
    qz = (_e160 * vec3<f32>(0.5f, 1f, 0.5f));
    let _e167 = f0_;
    if (_e167 > 0.999f) {
        local_1 = 0.682f;
    } else {
        let _e171 = qz;
        let _e172 = L0_;
        let _e176 = textureSampleLevel(tNoiseTexture, tNoiseSampler, (_e171 / vec3(_e172)), 0f);
        let _e179 = f0_;
        local_1 = mix(_e176.x, 0.682f, _e179);
    }
    let _e182 = local_1;
    a = _e182;
    let _e184 = f1_;
    if (_e184 > 0.999f) {
        local_2 = 0.682f;
    } else {
        let _e188 = qz;
        let _e189 = L1_;
        let _e196 = textureSampleLevel(tNoiseTexture, tNoiseSampler, ((_e188 / vec3(_e189)) + vec3(0.5f)), 0f);
        let _e199 = f1_;
        local_2 = mix(_e196.x, 0.682f, _e199);
    }
    let _e202 = local_2;
    b = _e202;
    let _e205 = f0_;
    let _e208 = f1_;
    spread = length(vec2<f32>((0.124f * _e205), (0.083f * _e208)));
    let _e214 = bias_1;
    let _e216 = spread;
    let _e219 = bias_1;
    let _e221 = spread;
    let _e223 = a;
    let _e226 = b;
    let _e230 = cloudN(((_e223 * 0.6f) + (_e226 * 0.4f)));
    let _e231 = clim_1;
    return smoothstep(((0.6f - _e214) - _e216), ((0.8f - _e219) + _e221), (_e230 + _e231));
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
    let _e144 = q_3;
    let _e145 = foot_5;
    let _e146 = bias_3;
    let _e147 = dirF_3;
    let _e148 = cloudClimate(_e147);
    let _e149 = cloudCoverC(_e144, _e145, _e146, _e148);
    return _e149;
}

fn cloudDetail(q_4: vec3<f32>, foot_6: f32) -> f32 {
    var q_5: vec3<f32>;
    var foot_7: f32;
    var L2_: f32;
    var f_1: f32;
    var local_3: f32;

    q_5 = q_4;
    foot_7 = foot_6;
    let _e140 = global.uRadius;
    L2_ = (_e140 * 0.064f);
    let _e144 = foot_7;
    let _e145 = L2_;
    let _e146 = cloudFade(_e144, _e145);
    f_1 = _e146;
    let _e148 = f_1;
    if (_e148 > 0.999f) {
        local_3 = 0.682f;
    } else {
        let _e152 = q_5;
        let _e153 = L2_;
        let _e157 = textureSampleLevel(tNoiseTexture, tNoiseSampler, (_e152 / vec3(_e153)), 0f);
        let _e160 = f_1;
        local_3 = mix(_e157.x, 0.682f, _e160);
    }
    let _e163 = local_3;
    return _e163;
}

fn cloudGens(dirF_4: vec3<f32>, gA: ptr<function, vec3<f32>>, gB: ptr<function, vec3<f32>>) {
    var dirF_5: vec3<f32>;
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

    dirF_5 = dirF_4;
    let _e140 = global.uCloudClock;
    T = _e140.z;
    let _e143 = T;
    if (_e143 <= 0f) {
        {
            (*gA) = vec3<f32>(1f, 0f, 0f);
            (*gB) = vec3(0f);
            return;
        }
    }
    let _e153 = dirF_5;
    let _e157 = dirF_5;
    let _e162 = dirF_5;
    let _e168 = dirF_5;
    let _e172 = dirF_5;
    let _e177 = dirF_5;
    ph = ((((1.1f * _e153.x) + (0.7f * _e157.z)) - (0.5f * _e162.y)) + (0.35f * sin((((2.3f * _e168.y) + (1.7f * _e172.x)) - (0.9f * _e177.z)))));
    let _e185 = global.uCloudClock;
    let _e187 = T;
    let _e189 = ph;
    s = (((_e185.x / _e187) + _e189) + 4f);
    let _e194 = s;
    a_1 = floor(_e194);
    let _e197 = s;
    let _e198 = a_1;
    fa = (_e197 - _e198);
    let _e201 = s;
    b_1 = floor((_e201 + 0.5f));
    let _e206 = s;
    let _e209 = b_1;
    fb = ((_e206 + 0.5f) - _e209);
    let _e213 = dirF_5;
    let _e223 = dirF_5;
    let _e235 = dirF_5;
    j = (0.065f * ((sin((dot(_e213, vec3<f32>(5.1f, 3.7f, -4.3f)) + 1.3f)) + sin((dot(_e223, vec3<f32>(-3.9f, 7.3f, 6.1f)) + 0.4f))) + (0.6f * sin((dot(_e235, vec3<f32>(11.3f, -8.9f, 7.7f)) + 2.1f)))));
    let _e249 = s;
    let _e250 = j;
    fj = fract((_e249 + _e250));
    let _e258 = fj;
    wa = smoothstep(0.4f, 0.6f, (1f - abs(((2f * _e258) - 1f))));
    let _e266 = wa;
    let _e267 = fa;
    let _e270 = T;
    let _e273 = global.uCloudClock;
    let _e275 = a_1;
    (*gA) = vec3<f32>(_e266, ((_e267 - 0.5f) * _e270), (2f * (_e273.y + _e275)));
    let _e280 = wa;
    let _e282 = fb;
    let _e285 = T;
    let _e288 = global.uCloudClock;
    let _e290 = b_1;
    (*gB) = vec3<f32>((1f - _e280), ((_e282 - 0.5f) * _e285), ((2f * (_e288.y + _e290)) + 1f));
    return;
}

fn cloudGenOff(idx: f32) -> vec3<f32> {
    var idx_1: f32;
    var h: u32;

    idx_1 = idx;
    let _e138 = idx_1;
    h = (u32(_e138) * 2654435761u);
    let _e143 = h;
    let _e144 = h;
    h = (_e143 ^ (_e144 >> 15u));
    let _e148 = h;
    h = (_e148 * 2246822519u);
    let _e151 = h;
    let _e152 = h;
    h = (_e151 ^ (_e152 >> 13u));
    let _e156 = h;
    let _e160 = h;
    let _e166 = h;
    return (((vec3<f32>(f32((_e156 & 1023u)), f32(((_e160 >> 10u) & 1023u)), f32(((_e166 >> 20u) & 1023u))) / vec3(1024f)) - vec3(0.5f)) * 400000f);
}

fn cloudAdvect(pf: vec3<f32>, dirF_6: vec3<f32>, g: vec3<f32>) -> vec3<f32> {
    var pf_1: vec3<f32>;
    var dirF_7: vec3<f32>;
    var g_1: vec3<f32>;
    var lat_1: f32;
    var U: f32;
    var east: vec3<f32>;

    pf_1 = pf;
    dirF_7 = dirF_6;
    g_1 = g;
    let _e142 = dirF_7;
    lat_1 = asin(clamp(_e142.y, -1f, 1f));
    let _e150 = global.uCloudWind;
    let _e152 = lat_1;
    let _e153 = global.uCloudWind;
    let _e158 = global.uCloudWind;
    let _e164 = global.uCloudWind;
    let _e166 = lat_1;
    let _e168 = lat_1;
    U = (_e150.x * (sin((((_e152 * _e153.y) * 2f) + (_e158.z * 6.2832f))) + (_e164.w * exp(((-(_e166) * _e168) * 40f)))));
    let _e177 = dirF_7;
    let _e181 = dirF_7;
    east = normalize((vec3<f32>(-(_e177.z), 0f, _e181.x) + vec3<f32>(0.000001f, 0f, 0f)));
    let _e191 = pf_1;
    let _e192 = east;
    let _e193 = U;
    let _e195 = g_1;
    let _e199 = g_1;
    let _e201 = cloudGenOff(_e199.z);
    return ((_e191 + ((_e192 * _e193) * _e195.y)) + _e201);
}

fn cloudCoverG(pf_2: vec3<f32>, dirF_8: vec3<f32>, foot_8: f32, bias_4: f32) -> f32 {
    var pf_3: vec3<f32>;
    var dirF_9: vec3<f32>;
    var foot_9: f32;
    var bias_5: f32;
    var gA_1: vec3<f32>;
    var gB_1: vec3<f32>;
    var c: f32 = 0f;
    var clim_2: f32;

    pf_3 = pf_2;
    dirF_9 = dirF_8;
    foot_9 = foot_8;
    bias_5 = bias_4;
    let _e146 = dirF_9;
    cloudGens(_e146, (&gA_1), (&gB_1));
    let _e153 = dirF_9;
    let _e154 = cloudClimate(_e153);
    clim_2 = _e154;
    let _e156 = gA_1;
    if (_e156.x > 0.005f) {
        let _e160 = c;
        let _e161 = gA_1;
        let _e163 = pf_3;
        let _e164 = dirF_9;
        let _e165 = gA_1;
        let _e166 = cloudAdvect(_e163, _e164, _e165);
        let _e167 = foot_9;
        let _e168 = bias_5;
        let _e169 = clim_2;
        let _e170 = cloudCoverC(_e166, _e167, _e168, _e169);
        c = (_e160 + (_e161.x * _e170));
    }
    let _e173 = gB_1;
    if (_e173.x > 0.005f) {
        let _e177 = c;
        let _e178 = gB_1;
        let _e180 = pf_3;
        let _e181 = dirF_9;
        let _e182 = gB_1;
        let _e183 = cloudAdvect(_e180, _e181, _e182);
        let _e184 = foot_9;
        let _e185 = bias_5;
        let _e186 = clim_2;
        let _e187 = cloudCoverC(_e183, _e184, _e185, _e186);
        c = (_e177 + (_e178.x * _e187));
    }
    let _e190 = c;
    return _e190;
}

fn cloudLight(rel: vec3<f32>, r_6: f32, muS: f32, foot_10: f32, sunAbove: vec3<f32>, skyE: ptr<function, vec3<f32>>) -> f32 {
    var rel_1: vec3<f32>;
    var r_7: f32;
    var muS_1: f32;
    var foot_11: f32;
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
    foot_11 = foot_10;
    sunAbove_1 = sunAbove;
    cloudDirZ = 1f;
    cloudTotZ = 1f;
    let _e151 = global.uCloudOn;
    if (_e151 < 0.5f) {
        return 1f;
    }
    let _e155 = muS_1;
    mu_8 = max(_e155, 0.05f);
    let _e173 = global.uCSOn;
    if (_e173 > 0.5f) {
        {
            let _e176 = global.uToFixed;
            let _e177 = rel_1;
            pf_4 = (_e176 * _e177);
            let _e180 = pf_4;
            let _e181 = r_7;
            upF = (_e180 / vec3(_e181));
            let _e185 = global.uToFixed;
            let _e186 = global.uSunDir;
            sF = (_e185 * _e186);
            let _e189 = pf_4;
            let _e190 = global.uCSOrigin;
            let _e192 = sF;
            let _e193 = upF;
            let _e194 = sF;
            let _e195 = upF;
            let _e199 = r_7;
            let _e200 = global.uRadius;
            let _e203 = sF;
            let _e204 = upF;
            d_1 = ((_e189 - _e190) - (((_e192 - (_e193 * dot(_e194, _e195))) * (_e199 - _e200)) / vec3(max(dot(_e203, _e204), 0.1f))));
            let _e212 = d_1;
            let _e213 = global.uCSE;
            let _e215 = d_1;
            let _e216 = global.uCSN;
            let _e219 = global.uCSInvL;
            uv_4 = ((vec2<f32>(dot(_e212, _e213), dot(_e215, _e216)) * _e219) + vec2(0.5f));
            let _e227 = uv_4;
            let _e230 = uv_4;
            let _e234 = uv_4;
            let _e237 = uv_4;
            w = smoothstep(0f, 0.08f, min(min(_e227.x, (1f - _e230.x)), min(_e234.y, (1f - _e237.y))));
            let _e243 = w;
            if (_e243 > 0f) {
                {
                    let _e246 = uv_4;
                    let _e248 = textureSampleLevel(tCloudShadowTexture, tCloudShadowSampler, _e246, 0f);
                    m0_ = _e248;
                    let _e249 = uv_4;
                    let _e250 = global.uCSLod;
                    let _e251 = textureSampleLevel(tCloudShadowTexture, tCloudShadowSampler, _e249, _e250);
                    m1_ = _e251;
                }
            }
        }
    }
    let _e252 = global.uCloud;
    let _e254 = r_7;
    let _e255 = global.uRadius;
    hc = (_e252.x - (_e254 - _e255));
    let _e259 = hc;
    let _e262 = w;
    if ((_e259 > 0f) && (_e262 < 1f)) {
        {
            let _e266 = global.uToFixed;
            let _e267 = rel_1;
            let _e268 = global.uSunDir;
            let _e269 = hc;
            let _e271 = muS_1;
            ds = normalize((_e266 * normalize((_e267 + ((_e268 * _e269) / vec3(max(_e271, 0.08f)))))));
            let _e281 = muS_1;
            if (_e281 > -0.05f) {
                let _e285 = ds;
                let _e286 = global.uRadius;
                let _e288 = ds;
                let _e289 = foot_11;
                let _e290 = global.uCloud;
                let _e292 = cloudBias(_e290.z);
                let _e293 = cloudCoverG((_e285 * _e286), _e288, _e289, _e292);
                let _e294 = global.uCloudOpacity;
                local_4 = (_e293 * _e294);
            } else {
                local_4 = 0f;
            }
            let _e298 = local_4;
            cs = _e298;
            let _e300 = global.uToFixed;
            let _e301 = rel_1;
            dz = normalize((_e300 * _e301));
            let _e305 = dz;
            let _e306 = global.uRadius;
            let _e308 = dz;
            let _e309 = foot_11;
            let _e311 = hc;
            let _e314 = global.uCloud;
            let _e316 = cloudBias(_e314.z);
            let _e317 = cloudCoverG((_e305 * _e306), _e308, max(_e309, (3.5f * _e311)), _e316);
            let _e318 = global.uCloudOpacity;
            cz = (_e317 * _e318);
            let _e322 = cs;
            let _e324 = cs;
            let _e325 = global.uCloudTau;
            let _e327 = mu_8;
            Tdir = ((1f - _e322) + (_e324 * exp((-(_e325) / _e327))));
            let _e333 = cz;
            let _e335 = cz;
            let _e338 = global.uCloudTau;
            Ttot = ((1f - _e333) + (_e335 / (1f + (0.1125f * _e338))));
            let _e344 = cz;
            let _e346 = cz;
            let _e347 = global.uCloudTau;
            let _e349 = mu_8;
            Dup = ((1f - _e344) + (_e346 * exp((-(_e347) / _e349))));
        }
    }
    let _e354 = Tdir;
    let _e355 = m0_;
    let _e357 = w;
    Tdir = mix(_e354, _e355.x, _e357);
    let _e359 = Ttot;
    let _e360 = m1_;
    let _e362 = w;
    Ttot = mix(_e359, _e360.y, _e362);
    let _e364 = Dup;
    let _e365 = m1_;
    let _e367 = w;
    Dup = mix(_e364, _e365.z, _e367);
    let _e369 = Dup;
    cloudDirZ = _e369;
    let _e370 = Ttot;
    cloudTotZ = _e370;
    let _e371 = (*skyE);
    let _e372 = Ttot;
    let _e374 = sunAbove_1;
    let _e375 = muS_1;
    let _e379 = Ttot;
    let _e380 = Dup;
    (*skyE) = ((_e371 * _e372) + ((_e374 * max(_e375, 0f)) * max((_e379 - _e380), 0f)));
    let _e386 = muS_1;
    if (_e386 > -0.05f) {
        let _e390 = Tdir;
        local_5 = _e390;
    } else {
        local_5 = 1f;
    }
    let _e393 = local_5;
    return _e393;
}

fn blackbodyGlow(T_1: f32) -> vec3<f32> {
    var T_2: f32;
    var g_2: f32;

    T_2 = T_1;
    let _e140 = T_2;
    if (_e140 < 650f) {
        return vec3(0f);
    }
    let _e148 = T_2;
    g_2 = max(0f, (0.0287f + (0.000237f * (_e148 - 1000f))));
    let _e156 = g_2;
    let _e162 = T_2;
    let _e168 = g_2;
    return (vec3<f32>(1f, _e156, 0f) * ((600000f * exp((-24060f / _e162))) / (0.2126f + (0.7152f * _e168))));
}

fn airHeatGlow(r_8: f32) -> vec3<f32> {
    var r_9: f32;
    var local_6: vec3<f32>;

    r_9 = r_8;
    let _e140 = global.uThermal;
    if (_e140.x > 0f) {
        let _e144 = global.uThermal;
        let _e146 = global.uThermal;
        let _e148 = r_9;
        let _e149 = global.uRadius;
        let _e155 = blackbodyGlow((_e144.x - (_e146.z * max((_e148 - _e149), 0f))));
        local_6 = _e155;
    } else {
        local_6 = vec3(0f);
    }
    let _e159 = local_6;
    return _e159;
}

fn heightCubeAt(d_2: vec3<f32>) -> f32 {
    var d_3: vec3<f32>;
    var a_2: vec3<f32>;
    var local_7: i32;
    var local_8: i32;
    var local_9: i32;
    var local_10: i32;
    var local_11: i32;
    var f_2: i32;
    var local_12: array<vec3<f32>, 6> = HC_N;
    var dn: f32;
    var local_13: array<vec3<f32>, 6> = HC_U;
    var local_14: array<vec3<f32>, 6> = HC_V;
    var uv_5: vec2<f32>;

    d_3 = d_2;
    let _e143 = d_3;
    a_2 = abs(_e143);
    let _e146 = a_2;
    let _e148 = a_2;
    let _e151 = a_2;
    let _e153 = a_2;
    if ((_e146.x >= _e148.y) && (_e151.x >= _e153.z)) {
        let _e157 = d_3;
        if (_e157.x >= 0f) {
            local_7 = 0i;
        } else {
            local_7 = 1i;
        }
        let _e164 = local_7;
        local_11 = _e164;
    } else {
        let _e165 = a_2;
        let _e167 = a_2;
        if (_e165.y >= _e167.z) {
            let _e170 = d_3;
            if (_e170.y >= 0f) {
                local_8 = 2i;
            } else {
                local_8 = 3i;
            }
            let _e177 = local_8;
            local_10 = _e177;
        } else {
            let _e178 = d_3;
            if (_e178.z >= 0f) {
                local_9 = 4i;
            } else {
                local_9 = 5i;
            }
            let _e185 = local_9;
            local_10 = _e185;
        }
        let _e187 = local_10;
        local_11 = _e187;
    }
    let _e189 = local_11;
    f_2 = _e189;
    let _e191 = d_3;
    let _e192 = f_2;
    let _e196 = local_12[_e192];
    dn = dot(_e191, _e196);
    let _e199 = d_3;
    let _e200 = f_2;
    let _e204 = local_13[_e200];
    let _e206 = dn;
    let _e209 = d_3;
    let _e210 = f_2;
    let _e214 = local_14[_e210];
    let _e216 = dn;
    uv_5 = (((vec2<f32>(atan((dot(_e199, _e204) / _e206)), atan((dot(_e209, _e214) / _e216))) / vec2(0.785398f)) * 0.5f) + vec2(0.5f));
    let _e229 = uv_5;
    let _e230 = f_2;
    let _e234 = vec3<f32>(_e229.x, _e229.y, f32(_e230));
    let _e239 = textureSampleLevel(tHeightCubeTexture, tHeightCubeSampler, _e234.xy, i32(_e234.z), 0f);
    return _e239.x;
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
    let _e149 = global.uHeightCube;
    let _e153 = up_1;
    let _e154 = sF_2;
    if ((_e149.x < 0.5f) || (dot(_e153, _e154) < -0.2f)) {
        return 1f;
    }
    let _e161 = global.uHeightCube;
    texel = _e161.w;
    let _e164 = R_1;
    let _e165 = global.uHeightCube;
    top = (_e164 + _e165.z);
    let _e169 = pF_1;
    r0_ = length(_e169);
    let _e173 = R_1;
    let _e174 = up_1;
    let _e175 = heightCubeAt(_e174);
    let _e177 = r0_;
    below = max(0f, ((_e173 + _e175) - _e177));
    let _e181 = pF_1;
    let _e182 = up_1;
    let _e183 = texel;
    o = (_e181 + ((_e182 * _e183) * 0.1f));
    let _e189 = texel;
    t = _e189;
    loop {
        let _e195 = i_1;
        if !((_e195 < 28i)) {
            break;
        }
        {
            let _e202 = o;
            let _e203 = sF_2;
            let _e204 = t;
            qp = (_e202 + (_e203 * _e204));
            let _e208 = qp;
            rq = length(_e208);
            let _e211 = rq;
            let _e212 = top;
            if (_e211 > _e212) {
                break;
            }
            let _e214 = rq;
            let _e215 = R_1;
            let _e216 = qp;
            let _e217 = rq;
            let _e220 = heightCubeAt((_e216 / vec3(_e217)));
            let _e223 = below;
            let _e224 = t;
            let _e227 = texel;
            d_4 = ((_e214 - (_e215 + _e220)) + (_e223 * exp((-(_e224) / (3f * _e227)))));
            let _e234 = sh;
            let _e235 = d_4;
            let _e236 = t;
            sh = min(_e234, clamp(((_e235 / (_e236 * 0.035f)) + 0.5f), 0f, 1f));
            let _e246 = sh;
            if (_e246 <= 0f) {
                break;
            }
            let _e249 = t;
            t = (_e249 * 1.35f);
        }
        continuing {
            let _e199 = i_1;
            i_1 = (_e199 + 1i);
        }
    }
    let _e252 = sh;
    return _e252;
}

fn airShadow(pF_2: vec3<f32>, sF_3: vec3<f32>, R_2: f32) -> f32 {
    var pF_3: vec3<f32>;
    var sF_4: vec3<f32>;
    var R_3: f32;
    var texel_1: f32;
    var top_1: f32;
    var t_1: f32;
    var sh_1: f32 = 1f;
    var i_2: i32 = 0i;
    var qp_1: vec3<f32>;
    var rq_1: f32;

    pF_3 = pF_2;
    sF_4 = sF_3;
    R_3 = R_2;
    let _e147 = global.uHeightCube;
    texel_1 = _e147.w;
    let _e150 = R_3;
    let _e151 = global.uHeightCube;
    top_1 = (_e150 + _e151.z);
    let _e155 = texel_1;
    t_1 = _e155;
    loop {
        let _e161 = i_2;
        if !((_e161 < 16i)) {
            break;
        }
        {
            let _e168 = pF_3;
            let _e169 = sF_4;
            let _e170 = t_1;
            qp_1 = (_e168 + (_e169 * _e170));
            let _e174 = qp_1;
            rq_1 = length(_e174);
            let _e177 = rq_1;
            let _e178 = top_1;
            if (_e177 > _e178) {
                break;
            }
            let _e180 = sh_1;
            let _e181 = rq_1;
            let _e182 = R_3;
            let _e183 = qp_1;
            let _e184 = rq_1;
            let _e187 = heightCubeAt((_e183 / vec3(_e184)));
            let _e190 = t_1;
            sh_1 = min(_e180, clamp((((_e181 - (_e182 + _e187)) / (_e190 * 0.035f)) + 0.5f), 0f, 1f));
            let _e200 = sh_1;
            if (_e200 <= 0f) {
                break;
            }
            let _e203 = t_1;
            t_1 = (_e203 * 1.6f);
        }
        continuing {
            let _e165 = i_2;
            i_2 = (_e165 + 1i);
        }
    }
    let _e206 = sh_1;
    return _e206;
}

fn sunShadowTap(org: vec2<i32>, n_2: i32, VP: mat4x4<f32>, L_2: vec4<f32>, wp: vec3<f32>, bias_6: f32) -> f32 {
    var org_1: vec2<i32>;
    var n_3: i32;
    var VP_1: mat4x4<f32>;
    var L_3: vec4<f32>;
    var wp_1: vec3<f32>;
    var bias_7: f32;
    var c_1: vec4<f32>;
    var uv_6: vec2<f32>;
    var d_5: f32;
    var sz_1: vec2<i32>;
    var st_1: vec2<f32>;
    var fr: vec2<f32>;
    var p0_: vec2<i32>;
    var cmp: array<f32, 16>;
    var j_1: i32 = 0i;
    var i_3: i32;
    var local_15: f32;
    var lit: f32 = 0f;
    var j_2: i32 = 0i;
    var i_4: i32;

    org_1 = org;
    n_3 = n_2;
    VP_1 = VP;
    L_3 = L_2;
    wp_1 = wp;
    bias_7 = bias_6;
    let _e153 = VP_1;
    let _e154 = wp_1;
    c_1 = (_e153 * vec4<f32>(_e154.x, _e154.y, _e154.z, 1f));
    let _e162 = c_1;
    let _e164 = c_1;
    uv_6 = (((_e162.xy / vec2(_e164.w)) * 0.5f) + vec2(0.5f));
    let _e174 = uv_6;
    let _e179 = uv_6;
    if (any((_e174 < vec2(0f))) || any((_e179 > vec2(1f)))) {
        return 1f;
    }
    let _e186 = L_3;
    let _e188 = wp_1;
    let _e190 = global.uSunShadowDir;
    let _e192 = bias_7;
    d_5 = (dot((_e186.xyz - _e188), _e190) - _e192);
    let _e195 = n_3;
    sz_1 = vec2(_e195);
    let _e198 = uv_6;
    let _e199 = sz_1;
    st_1 = ((_e198 * vec2<f32>(_e199)) - vec2(0.5f));
    let _e206 = st_1;
    fr = fract(_e206);
    let _e209 = st_1;
    p0_ = vec2<i32>(floor(_e209));
    loop {
        let _e216 = j_1;
        if !((_e216 < 4i)) {
            break;
        }
        i_3 = 0i;
        loop {
            let _e225 = i_3;
            if !((_e225 < 4i)) {
                break;
            }
            let _e232 = j_1;
            let _e235 = i_3;
            let _e238 = d_5;
            let _e239 = org_1;
            let _e240 = p0_;
            let _e241 = i_3;
            let _e244 = j_1;
            let _e251 = sz_1;
            let _e258 = textureLoad(tShadowAtlasTexture, (_e239 + clamp((_e240 + vec2<i32>((_e241 - 1i), (_e244 - 1i))), vec2(0i), (_e251 - vec2(1i)))), 0i);
            if (_e238 <= _e258.x) {
                local_15 = 1f;
            } else {
                local_15 = 0f;
            }
            let _e264 = local_15;
            cmp[((_e232 * 4i) + _e235)] = _e264;
            continuing {
                let _e229 = i_3;
                i_3 = (_e229 + 1i);
            }
        }
        continuing {
            let _e220 = j_1;
            j_1 = (_e220 + 1i);
        }
    }
    loop {
        let _e269 = j_2;
        if !((_e269 < 3i)) {
            break;
        }
        i_4 = 0i;
        loop {
            let _e278 = i_4;
            if !((_e278 < 3i)) {
                break;
            }
            let _e285 = lit;
            let _e286 = j_2;
            let _e289 = i_4;
            let _e292 = cmp[((_e286 * 4i) + _e289)];
            let _e293 = j_2;
            let _e296 = i_4;
            let _e301 = cmp[(((_e293 * 4i) + _e296) + 1i)];
            let _e302 = fr;
            let _e305 = j_2;
            let _e308 = i_4;
            let _e313 = cmp[(((_e305 * 4i) + _e308) + 4i)];
            let _e314 = j_2;
            let _e317 = i_4;
            let _e322 = cmp[(((_e314 * 4i) + _e317) + 5i)];
            let _e323 = fr;
            let _e326 = fr;
            lit = (_e285 + mix(mix(_e292, _e301, _e302.x), mix(_e313, _e322, _e323.x), _e326.y));
            continuing {
                let _e282 = i_4;
                i_4 = (_e282 + 1i);
            }
        }
        continuing {
            let _e273 = j_2;
            j_2 = (_e273 + 1i);
        }
    }
    let _e330 = lit;
    return (_e330 / 9f);
}

fn sunShadowMap(wp_2: vec3<f32>, N: vec3<f32>) -> f32 {
    var wp_3: vec3<f32>;
    var N_1: vec3<f32>;
    var dist: f32;
    var ndl: f32;
    var slope: f32;
    var s1_: f32;
    var sh_2: f32;
    var s0_: f32;

    wp_3 = wp_2;
    N_1 = N;
    let _e145 = global.uSunShadow;
    if (_e145.x < 0.5f) {
        return 1f;
    }
    let _e150 = wp_3;
    dist = length(_e150);
    let _e153 = dist;
    let _e154 = global.uSunShadow;
    if (_e153 > _e154.z) {
        return 1f;
    }
    let _e158 = N_1;
    let _e159 = global.uSunShadowDir;
    ndl = max(dot(_e158, _e159), 0.05f);
    let _e165 = ndl;
    let _e166 = ndl;
    let _e170 = ndl;
    slope = (sqrt((1f - (_e165 * _e166))) / _e170);
    let _e177 = global.uSunShadowVP1_;
    let _e178 = global.uSunShadowL1_;
    let _e179 = wp_3;
    let _e180 = global.uSunShadowL1_;
    let _e183 = slope;
    let _e188 = sunShadowTap(vec2<i32>(2048i, 0i), 2048i, _e177, _e178, _e179, (_e180.w * (1.5f + min(_e183, 6f))));
    s1_ = _e188;
    let _e190 = s1_;
    let _e193 = global.uSunShadow;
    let _e196 = global.uSunShadow;
    let _e198 = dist;
    sh_2 = mix(_e190, 1f, smoothstep((0.85f * _e193.z), _e196.z, _e198));
    let _e202 = dist;
    let _e203 = global.uSunShadow;
    if (_e202 < _e203.y) {
        {
            let _e210 = global.uSunShadowVP0_;
            let _e211 = global.uSunShadowL0_;
            let _e212 = wp_3;
            let _e213 = global.uSunShadowL0_;
            let _e216 = slope;
            let _e221 = sunShadowTap(vec2<i32>(0i, 0i), 2048i, _e210, _e211, _e212, (_e213.w * (1.5f + min(_e216, 6f))));
            s0_ = _e221;
            let _e223 = s0_;
            let _e224 = sh_2;
            let _e226 = global.uSunShadow;
            let _e229 = global.uSunShadow;
            let _e231 = dist;
            sh_2 = mix(_e223, _e224, smoothstep((0.75f * _e226.y), _e229.y, _e231));
        }
    }
    let _e234 = sh_2;
    return _e234;
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
    let _e143 = global.uGrassCover;
    if (_e143.x < 0.5f) {
        return 0f;
    }
    let _e148 = global.uGrassCoverVP;
    let _e149 = wp_5;
    c_2 = (_e148 * vec4<f32>(_e149.x, _e149.y, _e149.z, 1f));
    let _e157 = c_2;
    let _e159 = c_2;
    uv_7 = (((_e157.xy / vec2(_e159.w)) * 0.5f) + vec2(0.5f));
    let _e169 = uv_7;
    let _e176 = uv_7;
    e = max(abs(((_e169.x * 2f) - 1f)), abs(((_e176.y * 2f) - 1f)));
    let _e185 = e;
    if (_e185 >= 1f) {
        return 0f;
    }
    let _e189 = global.uGrassCover;
    n_4 = i32(_e189.w);
    let _e193 = uv_7;
    let _e194 = global.uGrassCover;
    st_2 = ((_e193 * _e194.w) - vec2(0.5f));
    let _e201 = st_2;
    fr_1 = fract(_e201);
    let _e204 = st_2;
    p0_1 = vec2<i32>(floor(_e204));
    let _e208 = global.uGrassCover;
    org_2 = vec2<i32>(_e208.yz);
    let _e212 = n_4;
    hi = vec2((_e212 - 1i));
    let _e217 = org_2;
    let _e218 = p0_1;
    let _e221 = hi;
    let _e225 = textureLoad(tShadowAtlasTexture, (_e217 + clamp(_e218, vec2(0i), _e221)), 0i);
    a_3 = _e225.x;
    let _e228 = org_2;
    let _e229 = p0_1;
    let _e236 = hi;
    let _e240 = textureLoad(tShadowAtlasTexture, (_e228 + clamp((_e229 + vec2<i32>(1i, 0i)), vec2(0i), _e236)), 0i);
    b_2 = _e240.x;
    let _e243 = org_2;
    let _e244 = p0_1;
    let _e251 = hi;
    let _e255 = textureLoad(tShadowAtlasTexture, (_e243 + clamp((_e244 + vec2<i32>(0i, 1i)), vec2(0i), _e251)), 0i);
    d_6 = _e255.x;
    let _e258 = org_2;
    let _e259 = p0_1;
    let _e266 = hi;
    let _e270 = textureLoad(tShadowAtlasTexture, (_e258 + clamp((_e259 + vec2<i32>(1i, 1i)), vec2(0i), _e266)), 0i);
    f_3 = _e270.x;
    let _e273 = a_3;
    let _e274 = b_2;
    let _e275 = fr_1;
    let _e278 = d_6;
    let _e279 = f_3;
    let _e280 = fr_1;
    let _e283 = fr_1;
    sum = mix(mix(_e273, _e274, _e275.x), mix(_e278, _e279, _e280.x), _e283.y);
    let _e287 = sum;
    let _e291 = e;
    return (_e287 * (1f - smoothstep(0.75f, 1f, _e291)));
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
    let _e145 = global.uTrunkSkyVP;
    let _e146 = wp_7;
    c_3 = (_e145 * vec4<f32>(_e146.x, _e146.y, _e146.z, 1f));
    let _e154 = c_3;
    let _e156 = c_3;
    uv_8 = (((_e154.xy / vec2(_e156.w)) * 0.5f) + vec2(0.5f));
    let _e166 = uv_8;
    let _e173 = uv_8;
    e_1 = max(abs(((_e166.x * 2f) - 1f)), abs(((_e173.y * 2f) - 1f)));
    let _e182 = e_1;
    if (_e182 >= 1f) {
        return 0f;
    }
    let _e186 = global.uTrunkSky;
    n_5 = i32(_e186.w);
    let _e190 = uv_8;
    let _e191 = global.uTrunkSky;
    st_3 = ((_e190 * _e191.w) - vec2(0.5f));
    let _e198 = st_3;
    fr_2 = fract(_e198);
    let _e201 = st_3;
    p0_2 = vec2<i32>(floor(_e201));
    let _e205 = o_2;
    org_3 = vec2<i32>(_e205);
    let _e208 = n_5;
    hi_1 = vec2((_e208 - 1i));
    let _e213 = org_3;
    let _e214 = p0_2;
    let _e217 = hi_1;
    let _e221 = textureLoad(tShadowAtlasTexture, (_e213 + clamp(_e214, vec2(0i), _e217)), 0i);
    a_4 = _e221.x;
    let _e224 = org_3;
    let _e225 = p0_2;
    let _e232 = hi_1;
    let _e236 = textureLoad(tShadowAtlasTexture, (_e224 + clamp((_e225 + vec2<i32>(1i, 0i)), vec2(0i), _e232)), 0i);
    b_3 = _e236.x;
    let _e239 = org_3;
    let _e240 = p0_2;
    let _e247 = hi_1;
    let _e251 = textureLoad(tShadowAtlasTexture, (_e239 + clamp((_e240 + vec2<i32>(0i, 1i)), vec2(0i), _e247)), 0i);
    d_7 = _e251.x;
    let _e254 = org_3;
    let _e255 = p0_2;
    let _e262 = hi_1;
    let _e266 = textureLoad(tShadowAtlasTexture, (_e254 + clamp((_e255 + vec2<i32>(1i, 1i)), vec2(0i), _e262)), 0i);
    f_4 = _e266.x;
    let _e269 = a_4;
    let _e270 = b_3;
    let _e271 = fr_2;
    let _e274 = d_7;
    let _e275 = f_4;
    let _e276 = fr_2;
    let _e279 = fr_2;
    sum_1 = mix(mix(_e269, _e270, _e271.x), mix(_e274, _e275, _e276.x), _e279.y);
    let _e283 = sum_1;
    let _e287 = e_1;
    return (_e283 * (1f - smoothstep(0.75f, 1f, _e287)));
}

fn trunkSum(wp_8: vec3<f32>) -> f32 {
    var wp_9: vec3<f32>;
    var local_16: f32;

    wp_9 = wp_8;
    let _e143 = global.uTrunkSky;
    if (_e143.x < 0.5f) {
        local_16 = 0f;
    } else {
        let _e148 = global.uTrunkSky;
        let _e150 = wp_9;
        let _e151 = atlasSum(_e148.yz, _e150);
        local_16 = _e151;
    }
    let _e153 = local_16;
    return _e153;
}

fn rockSum(wp_10: vec3<f32>) -> f32 {
    var wp_11: vec3<f32>;
    var local_17: f32;

    wp_11 = wp_10;
    let _e143 = global.uRockSky;
    if (_e143.x < 0.5f) {
        local_17 = 0f;
    } else {
        let _e148 = global.uRockSky;
        let _e150 = wp_11;
        let _e151 = atlasSum(_e148.yz, _e150);
        local_17 = _e151;
    }
    let _e153 = local_17;
    return _e153;
}

fn trunkSky(wp_12: vec3<f32>) -> f32 {
    var wp_13: vec3<f32>;

    wp_13 = wp_12;
    let _e143 = wp_13;
    let _e144 = trunkSum(_e143);
    let _e146 = wp_13;
    let _e147 = rockSum(_e146);
    return exp((-(_e144) - _e147));
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
    let _e151 = sc_1;
    if (_e151.x <= 0.003f) {
        return 0f;
    }
    let _e156 = d_9;
    let _e157 = D_1;
    let _e158 = sc_1;
    let _e160 = sc_1;
    dh = (_e156 - (_e157 + (_e158.y / _e160.x)));
    let _e166 = dh;
    if (_e166 <= 0f) {
        return 0f;
    }
    let _e170 = dh;
    let _e171 = dh;
    h2_ = (_e170 * _e171);
    let _e174 = sc_1;
    let _e176 = b_5;
    let _e177 = b_5;
    let _e179 = b_5;
    let _e180 = b_5;
    let _e182 = h2_;
    let _e185 = a_6;
    let _e186 = a_6;
    let _e188 = a_6;
    let _e189 = a_6;
    let _e191 = h2_;
    return (_e174.x * (((_e176 * _e177) / ((_e179 * _e180) + _e182)) - ((_e185 * _e186) / (((_e188 * _e189) + _e191) + 0.000001f))));
}

fn skyShadowMap(u0_: f32, D_2: f32, VP_2: mat4x4<f32>, L_4: vec4<f32>, upF_1: vec3<f32>, ext: f32, pF_4: vec3<f32>) -> f32 {
    var u0_1: f32;
    var D_3: f32;
    var VP_3: mat4x4<f32>;
    var L_5: vec4<f32>;
    var upF_2: vec3<f32>;
    var ext_1: f32;
    var pF_5: vec3<f32>;
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
    pF_5 = pF_4;
    let _e155 = VP_3;
    let _e156 = pF_5;
    c_4 = (_e155 * vec4<f32>(_e156.x, _e156.y, _e156.z, 1f));
    let _e164 = c_4;
    let _e166 = c_4;
    uv_9 = (((_e164.xy / vec2(_e166.w)) * 0.5f) + vec2(0.5f));
    let _e178 = ext_1;
    edge = (45f / (2f * _e178));
    let _e182 = uv_9;
    let _e183 = edge;
    let _e187 = uv_9;
    let _e189 = edge;
    if (any((_e182 < vec2(_e183))) || any((_e187 > vec2((1f - _e189))))) {
        return -1f;
    }
    let _e197 = uv_9;
    uv_9 = clamp(_e197, vec2(0.0009765625f), vec2(0.99902344f));
    let _e211 = u0_1;
    x0_ = (_e211 * 3f);
    let _e215 = x0_;
    let _e218 = uv_9;
    let _e221 = NB;
    let _e223 = uv_9;
    let _e227 = textureSampleLevel(tSkyRingsTexture, tSkyRingsSampler, vec2<f32>((((_e215 + 2f) + _e218.x) / _e221), _e223.y), 0f);
    C = _e227;
    let _e229 = C;
    if (_e229.z < 0.002f) {
        return 0f;
    }
    let _e234 = x0_;
    let _e235 = uv_9;
    let _e238 = NB;
    let _e240 = uv_9;
    let _e244 = textureSampleLevel(tSkyRingsTexture, tSkyRingsSampler, vec2<f32>(((_e234 + _e235.x) / _e238), _e240.y), 0f);
    A = _e244;
    let _e246 = x0_;
    let _e249 = uv_9;
    let _e252 = NB;
    let _e254 = uv_9;
    let _e258 = textureSampleLevel(tSkyRingsTexture, tSkyRingsSampler, vec2<f32>((((_e246 + 1f) + _e249.x) / _e252), _e254.y), 0f);
    B = _e258;
    let _e260 = L_5;
    let _e262 = pF_5;
    let _e264 = upF_2;
    let _e268 = L_5;
    d_10 = (dot((_e260.xyz - _e262), _e264) - (0.3f + (1.5f * _e268.w)));
    let _e274 = A;
    let _e276 = d_10;
    let _e277 = D_3;
    let _e280 = skyRing(_e274.xy, _e276, _e277, 0f, 1f);
    let _e281 = A;
    let _e283 = d_10;
    let _e284 = D_3;
    let _e287 = skyRing(_e281.zw, _e283, _e284, 1f, 3.5f);
    let _e289 = B;
    let _e291 = d_10;
    let _e292 = D_3;
    let _e295 = skyRing(_e289.xy, _e291, _e292, 3.5f, 9f);
    let _e297 = B;
    let _e299 = d_10;
    let _e300 = D_3;
    let _e303 = skyRing(_e297.zw, _e299, _e300, 9f, 20f);
    let _e305 = C;
    let _e307 = d_10;
    let _e308 = D_3;
    let _e311 = skyRing(_e305.xy, _e307, _e308, 20f, 45f);
    return clamp(((((_e280 + _e287) + _e295) + _e303) + _e311), 0f, 1f);
}

fn skyBlocked(wp_14: vec3<f32>) -> f32 {
    var wp_15: vec3<f32>;
    var dist_1: f32;
    var pF_6: vec3<f32>;
    var bl: f32 = -1f;

    wp_15 = wp_14;
    let _e143 = global.uSkyShadow;
    if (_e143.x < 0.5f) {
        return 0f;
    }
    let _e148 = wp_15;
    dist_1 = length(_e148);
    let _e151 = dist_1;
    let _e152 = global.uSkyShadow;
    if (_e151 > _e152.z) {
        return 0f;
    }
    let _e156 = global.uSkyToFixed;
    let _e157 = wp_15;
    let _e158 = global.uSkyCenter;
    pF_6 = (_e156 * (_e157 - _e158));
    let _e165 = dist_1;
    let _e166 = global.uSkyShadow;
    if (_e165 < _e166.y) {
        let _e170 = global.uSkyD;
        let _e172 = global.uSkyShadowVP0_;
        let _e173 = global.uSkyShadowL0_;
        let _e174 = global.uSkyShadowUp0_;
        let _e175 = global.uSkyShadow;
        let _e177 = pF_6;
        let _e178 = skyShadowMap(0f, _e170.x, _e172, _e173, _e174, _e175.y, _e177);
        bl = _e178;
    }
    let _e179 = bl;
    if (_e179 < 0f) {
        let _e183 = global.uSkyD;
        let _e185 = global.uSkyShadowVP1_;
        let _e186 = global.uSkyShadowL1_;
        let _e187 = global.uSkyShadowUp1_;
        let _e188 = global.uSkyShadow;
        let _e190 = pF_6;
        let _e191 = skyShadowMap(1f, _e183.y, _e185, _e186, _e187, _e188.z, _e190);
        bl = _e191;
    }
    let _e192 = bl;
    if (_e192 < 0f) {
        return 0f;
    }
    let _e196 = bl;
    let _e199 = global.uSkyShadow;
    let _e202 = global.uSkyShadow;
    let _e204 = dist_1;
    return (_e196 * (1f - smoothstep((0.8f * _e199.z), _e202.z, _e204)));
}

fn skyShadow(wp_16: vec3<f32>) -> f32 {
    var wp_17: vec3<f32>;

    wp_17 = wp_16;
    let _e144 = wp_17;
    let _e145 = skyBlocked(_e144);
    let _e147 = global.uSkyShadow;
    return (1f - (_e145 * (1f - _e147.w)));
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
    let _e149 = bl_2;
    let _e152 = sunTop_1;
    let _e153 = muS_3;
    let _e157 = skyE_2;
    let _e160 = global.uLeafTint;
    return (((_e149 * 0.1f) * ((_e152 * max(_e153, 0f)) + _e157)) * _e160);
}

fn handLit(wp_18: vec3<f32>, N_2: vec3<f32>) -> vec3<f32> {
    var wp_19: vec3<f32>;
    var N_3: vec3<f32>;
    var L_6: vec3<f32>;
    var d2_: f32;
    var l: vec3<f32>;
    var c_5: f32;
    var k: f32;

    wp_19 = wp_18;
    N_3 = N_2;
    let _e145 = global.uHandE;
    if (_e145.y <= 0f) {
        return vec3(0f);
    }
    let _e151 = global.uHandPos;
    let _e152 = wp_19;
    L_6 = (_e151 - _e152);
    let _e155 = L_6;
    let _e156 = L_6;
    d2_ = max(dot(_e155, _e156), 0.25f);
    let _e161 = L_6;
    let _e162 = d2_;
    l = (_e161 * inverseSqrt(_e162));
    let _e166 = l;
    let _e168 = global.uHandDir;
    c_5 = dot(-(_e166), _e168);
    let _e171 = global.uHandCone;
    let _e173 = global.uHandCone;
    let _e175 = c_5;
    let _e178 = global.uHandCone;
    let _e182 = global.uHandCone;
    let _e184 = c_5;
    k = max(smoothstep(_e171.y, _e173.x, _e175), (0.04f * smoothstep((_e178.y - 0.3f), _e182.y, _e184)));
    let _e189 = global.uHandE;
    let _e190 = k;
    let _e192 = N_3;
    let _e193 = l;
    let _e198 = d2_;
    return (((_e189 * _e190) * max(dot(_e192, _e193), 0f)) / vec3(_e198));
}

fn moonLit(rel_2: vec3<f32>, r_10: f32, up_2: vec3<f32>, N_4: vec3<f32>, sh_3: f32, trans: f32, wrap: f32, skyK: f32) -> vec3<f32> {
    var rel_3: vec3<f32>;
    var r_11: f32;
    var up_3: vec3<f32>;
    var N_5: vec3<f32>;
    var sh_4: f32;
    var trans_1: f32;
    var wrap_1: f32;
    var skyK_1: f32;
    var muM: f32;
    var pF_7: vec3<f32>;
    var T_3: vec3<f32>;
    var S: vec3<f32>;
    var nd: f32;

    rel_3 = rel_2;
    r_11 = r_10;
    up_3 = up_2;
    N_5 = N_4;
    sh_4 = sh_3;
    trans_1 = trans;
    wrap_1 = wrap;
    skyK_1 = skyK;
    let _e157 = global.uMoonE;
    if (_e157.y <= 0f) {
        return vec3(0f);
    }
    let _e163 = up_3;
    let _e164 = global.uMoonDir;
    muM = dot(_e163, _e164);
    let _e167 = muM;
    if (_e167 < -0.1f) {
        return vec3(0f);
    }
    let _e173 = global.uToFixed;
    let _e174 = rel_3;
    pF_7 = (_e173 * _e174);
    let _e177 = r_11;
    let _e178 = muM;
    let _e179 = atmoSunTransmittance(_e177, _e178);
    let _e180 = pF_7;
    let _e181 = pF_7;
    let _e183 = global.uToFixed;
    let _e184 = global.uMoonDir;
    let _e186 = global.uRadius;
    let _e187 = terrainShadow(_e180, normalize(_e181), (_e183 * _e184), _e186);
    let _e189 = sh_4;
    let _e191 = cloudDirZ;
    T_3 = (((_e179 * _e187) * _e189) * _e191);
    let _e194 = r_11;
    let _e195 = muM;
    let _e196 = atmoSkyIrradiance(_e194, _e195);
    let _e197 = cloudTotZ;
    S = (_e196 * _e197);
    let _e200 = N_5;
    let _e201 = global.uMoonDir;
    nd = dot(_e200, _e201);
    let _e204 = global.uMoonE;
    let _e205 = T_3;
    let _e206 = nd;
    let _e209 = trans_1;
    let _e210 = nd;
    let _e217 = S;
    let _e218 = wrap_1;
    let _e220 = skyK_1;
    return (_e204 * ((_e205 * (max(_e206, 0f) + (_e209 * max(-(_e210), 0f)))) + ((_e217 * _e218) * _e220)));
}

fn deferredLight(p: vec3<f32>, N_6: vec3<f32>, albedo: vec3<f32>, roughness: f32, ao: f32, wet: f32, f0_1: f32, cave: f32, trans_2: f32, foot_12: f32, metal: f32, kind: f32, selfShadow: f32) -> vec3<f32> {
    var p_1: vec3<f32>;
    var N_7: vec3<f32>;
    var albedo_1: vec3<f32>;
    var roughness_1: f32;
    var ao_1: f32;
    var wet_1: f32;
    var f0_2: f32;
    var cave_1: f32;
    var trans_3: f32;
    var foot_13: f32;
    var metal_1: f32;
    var kind_1: f32;
    var selfShadow_1: f32;
    var rel_4: vec3<f32>;
    var r_12: f32;
    var up_4: vec3<f32>;
    var muS_4: f32;
    var sunT: vec3<f32>;
    var skyE_3: vec3<f32>;
    var cloudT: f32;
    var pF_8: vec3<f32>;
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
    N_7 = N_6;
    albedo_1 = albedo;
    roughness_1 = roughness;
    ao_1 = ao;
    wet_1 = wet;
    f0_2 = f0_1;
    cave_1 = cave;
    trans_3 = trans_2;
    foot_13 = foot_12;
    metal_1 = metal;
    kind_1 = kind;
    selfShadow_1 = selfShadow;
    let _e167 = p_1;
    let _e168 = global.uCenter;
    rel_4 = (_e167 - _e168);
    let _e171 = rel_4;
    r_12 = length(_e171);
    let _e174 = rel_4;
    let _e175 = r_12;
    up_4 = (_e174 / vec3(max(_e175, 0.000001f)));
    let _e181 = up_4;
    let _e182 = global.uSunDir;
    muS_4 = dot(_e181, _e182);
    let _e185 = r_12;
    let _e186 = muS_4;
    let _e187 = atmoSunTransmittance(_e185, _e186);
    sunT = _e187;
    let _e189 = r_12;
    let _e190 = muS_4;
    let _e191 = atmoSkyIrradiance(_e189, _e190);
    skyE_3 = _e191;
    let _e193 = rel_4;
    let _e194 = r_12;
    let _e195 = muS_4;
    let _e196 = foot_13;
    let _e197 = sunT;
    let _e200 = cloudLight(_e193, _e194, _e195, _e196, _e197, (&skyE_3));
    cloudT = _e200;
    let _e202 = sunT;
    let _e203 = cloudT;
    sunT = (_e202 * _e203);
    let _e205 = global.uToFixed;
    let _e206 = rel_4;
    pF_8 = (_e205 * _e206);
    let _e209 = sunT;
    let _e210 = pF_8;
    let _e211 = pF_8;
    let _e213 = global.uToFixed;
    let _e214 = global.uSunDir;
    let _e216 = global.uRadius;
    let _e217 = terrainShadow(_e210, normalize(_e211), (_e213 * _e214), _e216);
    sunT = (_e209 * _e217);
    let _e219 = sunT;
    sunTop_2 = _e219;
    let _e221 = p_1;
    let _e222 = N_7;
    let _e223 = sunShadowMap(_e221, _e222);
    keySh = _e223;
    let _e225 = sunT;
    let _e226 = keySh;
    sunT = (_e225 * _e226);
    let _e228 = N_7;
    let _e229 = global.uSunDir;
    nd_1 = dot(_e228, _e229);
    let _e232 = nd_1;
    ndl_1 = max(_e232, 0f);
    let _e236 = kind_1;
    if (_e236 == 2f) {
        let _e241 = N_7;
        let _e242 = up_4;
        local_18 = (0.55f + (0.45f * dot(_e241, _e242)));
    } else {
        let _e248 = N_7;
        let _e249 = up_4;
        local_18 = (0.5f + (0.5f * dot(_e248, _e249)));
    }
    let _e254 = local_18;
    wrap_2 = _e254;
    let _e256 = kind_1;
    if (_e256 == 7f) {
        let _e259 = albedo_1;
        let _e263 = global.uSunE;
        let _e265 = sunT;
        let _e266 = ndl_1;
        let _e268 = N_7;
        let _e269 = p_1;
        let _e278 = selfShadow_1;
        let _e280 = skyE_3;
        return (((_e259 / vec3(3.1415927f)) * _e263) * ((((_e265 * _e266) * pow(max(dot(_e268, normalize(-(_e269))), 0f), 0.15f)) * _e278) + (_e280 * 0.6f)));
    }
    let _e285 = global.uSunE;
    let _e286 = sunT;
    let _e288 = ndl_1;
    let _e289 = trans_3;
    let _e290 = nd_1;
    direct = ((_e285 * _e286) * (_e288 + (_e289 * max(-(_e290), 0f))));
    let _e298 = p_1;
    let _e299 = skyBlocked(_e298);
    skyBl = _e299;
    let _e302 = skyBl;
    let _e304 = kind_1;
    if (_e304 == 1f) {
        let _e307 = p_1;
        let _e308 = trunkSum(_e307);
        local_19 = exp(-(_e308));
    } else {
        let _e311 = p_1;
        let _e312 = trunkSky(_e311);
        local_19 = _e312;
    }
    let _e314 = local_19;
    skyK_2 = ((1f - _e302) * _e314);
    let _e317 = global.uSunE;
    let _e318 = skyE_3;
    let _e319 = wrap_2;
    let _e321 = skyK_2;
    let _e323 = skyBl;
    let _e324 = sunTop_2;
    let _e325 = muS_4;
    let _e326 = skyE_3;
    let _e327 = canopyLit(_e323, _e324, _e325, _e326);
    let _e330 = global.uAmbientFloor;
    let _e332 = rel_4;
    let _e333 = r_12;
    let _e334 = up_4;
    let _e335 = N_7;
    let _e336 = keySh;
    let _e337 = trans_3;
    let _e338 = wrap_2;
    let _e339 = skyK_2;
    let _e340 = moonLit(_e332, _e333, _e334, _e335, _e336, _e337, _e338, _e339);
    ambient = (((_e317 * (((_e318 * _e319) * _e321) + _e327)) + _e330) + _e340);
    let _e343 = kind_1;
    if (_e343 == 3f) {
        local_20 = 0f;
    } else {
        let _e347 = p_1;
        let _e348 = grassCover(_e347);
        local_20 = _e348;
    }
    let _e350 = local_20;
    gSum = _e350;
    let _e354 = gSum;
    gCov = exp((-2.2f * _e354));
    let _e358 = direct;
    let _e359 = gCov;
    let _e360 = selfShadow_1;
    direct = (_e358 * (_e359 * _e360));
    let _e363 = ambient;
    let _e369 = gSum;
    ambient = (_e363 * (1f - (0.35f * (1f - exp((-0.8f * _e369))))));
    let _e376 = albedo_1;
    let _e378 = metal_1;
    diffuse = (_e376 * (1f - _e378));
    let _e382 = diffuse;
    let _e386 = direct;
    let _e388 = ao_1;
    let _e392 = ambient;
    let _e393 = ao_1;
    let _e397 = cave_1;
    let _e399 = diffuse;
    let _e403 = p_1;
    let _e404 = N_7;
    let _e405 = handLit(_e403, _e404);
    color = ((((_e382 / vec3(3.1415927f)) * ((_e386 * mix(1f, _e388, 0.35f)) + (_e392 * _e393))) * _e397) + ((_e399 / vec3(3.1415927f)) * _e405));
    let _e409 = p_1;
    V = normalize(-(_e409));
    let _e413 = V;
    let _e414 = global.uSunDir;
    H_1 = normalize((_e413 + _e414));
    let _e418 = roughness_1;
    let _e420 = wet_1;
    rg = clamp(mix(_e418, 0.12f, (_e420 * 0.8f)), 0.05f, 1f);
    let _e428 = rg;
    let _e429 = rg;
    let _e431 = rg;
    let _e433 = rg;
    a2_ = (((_e428 * _e429) * _e431) * _e433);
    let _e436 = N_7;
    let _e437 = H_1;
    NdH = max(dot(_e436, _e437), 0f);
    let _e442 = N_7;
    let _e443 = V;
    NdV = max(dot(_e442, _e443), 0.001f);
    let _e448 = V;
    let _e449 = H_1;
    VdH = max(dot(_e448, _e449), 0f);
    let _e454 = a2_;
    let _e455 = NdH;
    let _e456 = NdH;
    let _e458 = a2_;
    Dg = (_e454 / (PI * pow((((_e455 * _e456) * (_e458 - 1f)) + 1f), 2f)));
    let _e469 = rg;
    let _e472 = rg;
    kk = (((_e469 + 1f) * (_e472 + 1f)) / 8f);
    let _e479 = NdV;
    let _e480 = NdV;
    let _e482 = kk;
    let _e485 = kk;
    let _e488 = ndl_1;
    let _e490 = ndl_1;
    let _e492 = kk;
    let _e495 = kk;
    Gg = (((_e479 / ((_e480 * (1f - _e482)) + _e485)) * _e488) / ((_e490 * (1f - _e492)) + _e495));
    let _e499 = f0_2;
    let _e501 = f0_2;
    let _e504 = VdH;
    Fs = (_e499 + ((1f - _e501) * pow((1f - _e504), 5f)));
    let _e511 = kind_1;
    if (_e511 != 2f) {
        let _e514 = color;
        let _e515 = global.uSunE;
        let _e516 = sunT;
        let _e518 = gCov;
        let _e520 = selfShadow_1;
        let _e522 = Dg;
        let _e524 = Gg;
        let _e526 = Fs;
        let _e528 = albedo_1;
        let _e531 = albedo_1;
        let _e534 = VdH;
        let _e540 = metal_1;
        let _e545 = NdV;
        color = (_e514 + (((((((_e515 * _e516) * _e518) * _e520) * _e522) * _e524) * mix(vec3(_e526), (_e528 + ((vec3(1f) - _e531) * pow((1f - _e534), 5f))), vec3(_e540))) / vec3((4f * _e545))));
    }
    let _e552 = wet_1;
    poolK = smoothstep(0.85f, 1f, _e552);
    let _e555 = poolK;
    if (_e555 > 0f) {
        {
            let _e558 = up_4;
            let _e559 = V;
            cP = max(dot(_e558, _e559), 0.001f);
            let _e567 = cP;
            Fp = (0.02f + (0.98f * pow((1f - _e567), 5f)));
            let _e574 = color;
            let _e575 = color;
            let _e577 = Fp;
            let _e580 = global.uSunE;
            let _e581 = skyE_3;
            let _e588 = Fp;
            let _e591 = global.uSunE;
            let _e592 = sunT;
            let _e596 = V;
            let _e598 = up_4;
            let _e600 = global.uSunDir;
            let _e608 = poolK;
            color = mix(_e574, (((_e575 * (1f - _e577)) + ((((_e580 * _e581) / vec3(3.1415927f)) * 1.1f) * _e588)) + (((_e591 * _e592) * 0.05f) * pow(max(dot(reflect(-(_e596), _e598), _e600), 0f), 200f))), vec3(_e608));
        }
    }
    let _e611 = global.uThermal;
    if (_e611.x > 0f) {
        {
            let _e615 = albedo_1;
            a_7 = clamp(_e615, vec3(0f), vec3(1f));
            let _e622 = color;
            let _e625 = a_7;
            let _e627 = global.uThermal;
            let _e629 = global.uThermal;
            let _e631 = r_12;
            let _e632 = global.uRadius;
            let _e636 = blackbodyGlow((_e627.x - (_e629.y * (_e631 - _e632))));
            color = (_e622 + ((vec3(1f) - _e625) * _e636));
            let _e639 = color;
            let _e640 = a_7;
            let _e643 = r_12;
            let _e645 = atmoSunTransmittance(_e643, 1f);
            let _e648 = global.uThermal;
            let _e650 = global.uThermal;
            let _e652 = r_12;
            let _e653 = global.uRadius;
            let _e659 = blackbodyGlow((_e648.x - (_e650.z * max((_e652 - _e653), 0f))));
            color = (_e639 + ((_e640 * (vec3(1f) - _e645)) * _e659));
        }
    }
    let _e662 = color;
    return _e662;
}

fn main_1() {
    let _e169 = deferredLight(vec3<f32>(0f, 0f, -1f), vec3<f32>(0f, 1f, 0f), vec3(1f), 0.8f, 1f, 0f, 0.04f, 1f, 0f, 1f, 0f, 0f, 1f);
    fragmentColor = vec4<f32>(_e169.x, _e169.y, _e169.z, 1f);
    return;
}

`;
