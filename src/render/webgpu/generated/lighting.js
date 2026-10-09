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
      "name": "uRing",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 224
    },
    {
      "name": "uRingTau",
      "type": "vec4",
      "count": 8,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 240
    },
    {
      "name": "uCSOrigin",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 368
    },
    {
      "name": "uCSE",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 384
    },
    {
      "name": "uCSN",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 400
    },
    {
      "name": "uCSInvL",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 412
    },
    {
      "name": "uCSLod",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 416
    },
    {
      "name": "uCSOn",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 420
    },
    {
      "name": "uCloudTau",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 424
    },
    {
      "name": "uThermal",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 432
    },
    {
      "name": "uHeightCube",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 448
    },
    {
      "name": "uSunShadow",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 464
    },
    {
      "name": "uSunShadowVP0",
      "type": "mat4",
      "count": 0,
      "align": 16,
      "size": 64,
      "stride": 64,
      "offset": 480
    },
    {
      "name": "uSunShadowVP1",
      "type": "mat4",
      "count": 0,
      "align": 16,
      "size": 64,
      "stride": 64,
      "offset": 544
    },
    {
      "name": "uSunShadowL0",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 608
    },
    {
      "name": "uSunShadowL1",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 624
    },
    {
      "name": "uSunShadowDir",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 640
    },
    {
      "name": "uGrassCover",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 656
    },
    {
      "name": "uGrassCoverVP",
      "type": "mat4",
      "count": 0,
      "align": 16,
      "size": 64,
      "stride": 64,
      "offset": 672
    },
    {
      "name": "uTrunkSky",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 736
    },
    {
      "name": "uRockSky",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 752
    },
    {
      "name": "uTrunkSkyVP",
      "type": "mat4",
      "count": 0,
      "align": 16,
      "size": 64,
      "stride": 64,
      "offset": 768
    },
    {
      "name": "uSkyShadow",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 832
    },
    {
      "name": "uSkyShadowVP0",
      "type": "mat4",
      "count": 0,
      "align": 16,
      "size": 64,
      "stride": 64,
      "offset": 848
    },
    {
      "name": "uSkyShadowVP1",
      "type": "mat4",
      "count": 0,
      "align": 16,
      "size": 64,
      "stride": 64,
      "offset": 912
    },
    {
      "name": "uSkyShadowL0",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 976
    },
    {
      "name": "uSkyShadowL1",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 992
    },
    {
      "name": "uSkyShadowUp0",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 1008
    },
    {
      "name": "uSkyShadowUp1",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 1024
    },
    {
      "name": "uSkyCenter",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 1040
    },
    {
      "name": "uSkyToFixed",
      "type": "mat3",
      "count": 0,
      "align": 16,
      "size": 48,
      "stride": 48,
      "offset": 1056
    },
    {
      "name": "uSkyD",
      "type": "vec2",
      "count": 0,
      "align": 8,
      "size": 8,
      "stride": 8,
      "offset": 1104
    },
    {
      "name": "uLeafTint",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 1120
    },
    {
      "name": "uCanopySun",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 1136
    },
    {
      "name": "uCanopySky",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 1152
    },
    {
      "name": "uMoonDir",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 1168
    },
    {
      "name": "uMoonE",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 1184
    },
    {
      "name": "uHandPos",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 1200
    },
    {
      "name": "uHandDir",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 1216
    },
    {
      "name": "uHandE",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 1232
    },
    {
      "name": "uHandCone",
      "type": "vec2",
      "count": 0,
      "align": 8,
      "size": 8,
      "stride": 8,
      "offset": 1248
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
  "bytes": 1264,
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
    let _e143 = global.uSunLift;
    hD = (1.5707963f + _e143.x);
    let _e148 = global.uSunLift;
    hT = (1.5707963f + _e148.y);
    let _e152 = zd_1;
    let _e153 = hD;
    if (_e152 <= _e153) {
        let _e155 = zd_1;
        let _e156 = hT;
        let _e158 = hD;
        local = ((_e155 * _e156) / _e158);
    } else {
        let _e160 = hT;
        let _e161 = zd_1;
        let _e162 = hD;
        let _e165 = hT;
        let _e169 = hD;
        local = (_e160 + (((_e161 - _e162) * (3.1415927f - _e165)) / (3.1415927f - _e169)));
    }
    let _e174 = local;
    return _e174;
}

fn liftMu(mu: f32) -> f32 {
    var mu_1: f32;

    mu_1 = mu;
    let _e142 = global.uSunLift;
    let _e144 = global.uSunLift;
    if (_e142.x <= _e144.y) {
        let _e147 = mu_1;
        return _e147;
    }
    let _e148 = mu_1;
    let _e154 = lensTrueZ(acos(clamp(_e148, -1f, 1f)));
    return cos(_e154);
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
    let _e145 = global.uTop;
    let _e146 = global.uTop;
    let _e148 = global.uBottom;
    let _e149 = global.uBottom;
    H = sqrt(max(0f, ((_e145 * _e146) - (_e148 * _e149))));
    let _e156 = r_1;
    let _e157 = r_1;
    let _e159 = global.uBottom;
    let _e160 = global.uBottom;
    rho = sqrt(max(0f, ((_e156 * _e157) - (_e159 * _e160))));
    let _e166 = r_1;
    let _e167 = r_1;
    let _e169 = mu_3;
    let _e170 = mu_3;
    let _e175 = global.uTop;
    let _e176 = global.uTop;
    disc = (((_e166 * _e167) * ((_e169 * _e170) - 1f)) + (_e175 * _e176));
    let _e181 = r_1;
    let _e183 = mu_3;
    let _e185 = disc;
    d = max(0f, ((-(_e181) * _e183) + sqrt(max(_e185, 0f))));
    let _e192 = global.uTop;
    let _e193 = r_1;
    dMin = (_e192 - _e193);
    let _e196 = rho;
    let _e197 = H;
    dMax = (_e196 + _e197);
    let _e200 = d;
    let _e201 = dMin;
    let _e203 = dMax;
    let _e204 = dMin;
    let _e209 = rho;
    let _e210 = H;
    return vec2<f32>(((_e200 - _e201) / max((_e203 - _e204), 0.000001f)), (_e209 / max(_e210, 0.000001f)));
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
    let _e144 = mu_5;
    let _e145 = liftMu(_e144);
    mu_5 = _e145;
    let _e146 = global.uGround;
    let _e147 = global.uTrueK;
    Rg = (_e146 * max(_e147, 1f));
    let _e152 = Rg;
    let _e153 = Rg;
    let _e154 = r_3;
    let _e155 = global.uGround;
    sinH = (_e152 / (_e153 + max((_e154 - _e155), 0f)));
    let _e164 = sinH;
    let _e165 = sinH;
    cosH = -(sqrt(max(0f, (1f - (_e164 * _e165)))));
    let _e172 = cosH;
    let _e175 = cosH;
    let _e178 = mu_5;
    vis = smoothstep((_e172 - 0.01f), (_e175 + 0.01f), _e178);
    let _e181 = global.uHasAtmo;
    if (_e181 < 0.5f) {
        let _e184 = vis;
        return vec3(_e184);
    }
    let _e186 = r_3;
    let _e187 = global.uBottom;
    let _e188 = global.uTop;
    let _e190 = mu_5;
    let _e191 = transmittanceUV(clamp(_e186, _e187, _e188), _e190);
    uv = _e191;
    let _e200 = uv;
    uv = (vec2<f32>(0.001953125f, 0.0078125f) + (_e200 * vec2<f32>(0.99609375f, 0.984375f)));
    let _e210 = uv;
    let _e212 = textureSampleLevel(tTransTexture, tTransSampler, _e210, 0f);
    let _e214 = vis;
    return (_e212.xyz * _e214);
}

fn atmoSkyIrradiance(r_4: f32, mu_6: f32) -> vec3<f32> {
    var r_5: f32;
    var mu_7: f32;
    var uv_1: vec2<f32>;

    r_5 = r_4;
    mu_7 = mu_6;
    let _e144 = global.uHasAtmo;
    if (_e144 < 0.5f) {
        return vec3(0f);
    }
    let _e149 = mu_7;
    let _e150 = liftMu(_e149);
    mu_7 = _e150;
    let _e151 = mu_7;
    let _e156 = r_5;
    let _e157 = global.uGround;
    let _e159 = global.uTop;
    let _e160 = global.uGround;
    uv_1 = vec2<f32>(((_e151 * 0.5f) + 0.5f), clamp(((_e156 - _e157) / (_e159 - _e160)), 0f, 1f));
    let _e175 = uv_1;
    uv_1 = (vec2<f32>(0.0078125f, 0.03125f) + (_e175 * vec2<f32>(0.984375f, 0.9375f)));
    let _e185 = uv_1;
    let _e187 = textureSampleLevel(tIrrTexture, tIrrSampler, _e185, 0f);
    return _e187.xyz;
}

fn cloudN(n: f32) -> f32 {
    var n_1: f32;

    n_1 = n;
    let _e143 = n_1;
    return (0.55f + ((_e143 - 0.682f) * 4.3f));
}

fn cloudBias(cover: f32) -> f32 {
    var cover_1: f32;

    cover_1 = cover;
    let _e142 = cover_1;
    let _e150 = cover_1;
    let _e158 = cover_1;
    return ((((_e142 - 0.5f) * 0.3f) + (0.5f * smoothstep(0.8f, 1f, _e150))) - (0.5f * (1f - smoothstep(0f, 0.2f, _e158))));
}

fn cloudFade(foot: f32, L: f32) -> f32 {
    var foot_1: f32;
    var L_1: f32;

    foot_1 = foot;
    L_1 = L;
    let _e146 = foot_1;
    let _e149 = L_1;
    return smoothstep(1f, 4f, ((_e146 * 64f) / _e149));
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
    let _e143 = textureDimensions(tCloudMapTexture, 0i);
    sz = vec2<f32>(vec2<i32>(_e143));
    let _e147 = uv_3;
    let _e148 = sz;
    st = ((_e147 * _e148) - vec2(0.5f));
    let _e154 = st;
    i = floor(_e154);
    let _e157 = st;
    let _e158 = i;
    f = (_e157 - _e158);
    let _e161 = f;
    let _e162 = f;
    f2_ = (_e161 * _e162);
    let _e165 = f2_;
    let _e166 = f;
    f3_ = (_e165 * _e166);
    let _e171 = f;
    let _e176 = f2_;
    let _e179 = f3_;
    w0_ = ((((vec2(1f) - (3f * _e171)) + (3f * _e176)) - _e179) / vec2(6f));
    let _e187 = f2_;
    let _e192 = f3_;
    w1_ = (((vec2(4f) - (6f * _e187)) + (3f * _e192)) / vec2(6f));
    let _e201 = f;
    let _e206 = f2_;
    let _e210 = f3_;
    w2_ = ((((vec2(1f) + (3f * _e201)) + (3f * _e206)) - (3f * _e210)) / vec2(6f));
    let _e217 = f3_;
    w3_ = (_e217 / vec2(6f));
    let _e222 = w0_;
    let _e223 = w1_;
    g0_ = (_e222 + _e223);
    let _e226 = w2_;
    let _e227 = w3_;
    g1_ = (_e226 + _e227);
    let _e230 = i;
    let _e234 = w1_;
    let _e235 = g0_;
    let _e238 = sz;
    h0_ = (((_e230 - vec2(0.5f)) + (_e234 / _e235)) / _e238);
    let _e241 = i;
    let _e245 = w3_;
    let _e246 = g1_;
    let _e249 = sz;
    h1_ = (((_e241 + vec2(1.5f)) + (_e245 / _e246)) / _e249);
    let _e252 = g0_;
    let _e254 = g0_;
    let _e256 = h0_;
    let _e258 = textureSampleLevel(tCloudMapTexture, tCloudMapSampler, _e256, 0f);
    let _e261 = g1_;
    let _e263 = h1_;
    let _e265 = h0_;
    let _e269 = textureSampleLevel(tCloudMapTexture, tCloudMapSampler, vec2<f32>(_e263.x, _e265.y), 0f);
    let _e274 = g1_;
    let _e276 = g0_;
    let _e278 = h0_;
    let _e280 = h1_;
    let _e284 = textureSampleLevel(tCloudMapTexture, tCloudMapSampler, vec2<f32>(_e278.x, _e280.y), 0f);
    let _e287 = g1_;
    let _e289 = h1_;
    let _e291 = textureSampleLevel(tCloudMapTexture, tCloudMapSampler, _e289, 0f);
    return ((_e252.y * ((_e254.x * _e258.xyz) + (_e261.x * _e269.xyz))) + (_e274.y * ((_e276.x * _e284.xyz) + (_e287.x * _e291.xyz))));
}

fn cloudClimate(dirF: vec3<f32>) -> f32 {
    var dirF_1: vec3<f32>;
    var lat: f32;
    var cm: vec3<f32>;

    dirF_1 = dirF;
    let _e142 = dirF_1;
    lat = asin(clamp(_e142.y, -1f, 1f));
    let _e150 = global.uCloudMapMean;
    if (_e150 <= 0f) {
        let _e154 = lat;
        return (0.12f * cos((abs(_e154) * 6f)));
    }
    let _e160 = dirF_1;
    let _e162 = dirF_1;
    let _e169 = lat;
    let _e175 = cloudMapSmooth(vec2<f32>(((atan2(_e160.z, _e162.x) / 6.2832f) + 0.5f), ((_e169 / 3.14159f) + 0.5f)));
    cm = _e175;
    let _e177 = cm;
    let _e179 = cm;
    let _e183 = global.uCloudYear;
    let _e187 = cm;
    let _e191 = global.uCloudYear;
    let _e195 = global.uCloudMapMean;
    return ((((_e177.x + ((_e179.y - 0.5f) * _e183.x)) + ((_e187.z - 0.5f) * _e191.y)) - _e195) * 0.8f);
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
    let _e148 = global.uRadius;
    L0_ = (_e148 * 1f);
    let _e152 = global.uRadius;
    L1_ = (_e152 * 0.236f);
    let _e156 = foot_3;
    let _e157 = L0_;
    let _e158 = cloudFade(_e156, _e157);
    f0_ = _e158;
    let _e160 = foot_3;
    let _e161 = L1_;
    let _e162 = cloudFade(_e160, _e161);
    f1_ = _e162;
    let _e164 = q_1;
    qz = (_e164 * vec3<f32>(0.5f, 1f, 0.5f));
    let _e171 = f0_;
    if (_e171 > 0.999f) {
        local_1 = 0.682f;
    } else {
        let _e175 = qz;
        let _e176 = L0_;
        let _e180 = textureSampleLevel(tNoiseTexture, tNoiseSampler, (_e175 / vec3(_e176)), 0f);
        let _e183 = f0_;
        local_1 = mix(_e180.x, 0.682f, _e183);
    }
    let _e186 = local_1;
    a = _e186;
    let _e188 = f1_;
    if (_e188 > 0.999f) {
        local_2 = 0.682f;
    } else {
        let _e192 = qz;
        let _e193 = L1_;
        let _e200 = textureSampleLevel(tNoiseTexture, tNoiseSampler, ((_e192 / vec3(_e193)) + vec3(0.5f)), 0f);
        let _e203 = f1_;
        local_2 = mix(_e200.x, 0.682f, _e203);
    }
    let _e206 = local_2;
    b = _e206;
    let _e209 = f0_;
    let _e212 = f1_;
    spread = length(vec2<f32>((0.124f * _e209), (0.083f * _e212)));
    let _e218 = bias_1;
    let _e220 = spread;
    let _e223 = bias_1;
    let _e225 = spread;
    let _e227 = a;
    let _e230 = b;
    let _e234 = cloudN(((_e227 * 0.6f) + (_e230 * 0.4f)));
    let _e235 = clim_1;
    return smoothstep(((0.6f - _e218) - _e220), ((0.8f - _e223) + _e225), (_e234 + _e235));
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
    let _e148 = q_3;
    let _e149 = foot_5;
    let _e150 = bias_3;
    let _e151 = dirF_3;
    let _e152 = cloudClimate(_e151);
    let _e153 = cloudCoverC(_e148, _e149, _e150, _e152);
    return _e153;
}

fn cloudDetail(q_4: vec3<f32>, foot_6: f32) -> f32 {
    var q_5: vec3<f32>;
    var foot_7: f32;
    var L2_: f32;
    var f_1: f32;
    var local_3: f32;

    q_5 = q_4;
    foot_7 = foot_6;
    let _e144 = global.uRadius;
    L2_ = (_e144 * 0.064f);
    let _e148 = foot_7;
    let _e149 = L2_;
    let _e150 = cloudFade(_e148, _e149);
    f_1 = _e150;
    let _e152 = f_1;
    if (_e152 > 0.999f) {
        local_3 = 0.682f;
    } else {
        let _e156 = q_5;
        let _e157 = L2_;
        let _e161 = textureSampleLevel(tNoiseTexture, tNoiseSampler, (_e156 / vec3(_e157)), 0f);
        let _e164 = f_1;
        local_3 = mix(_e161.x, 0.682f, _e164);
    }
    let _e167 = local_3;
    return _e167;
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
    let _e144 = global.uCloudClock;
    T = _e144.z;
    let _e147 = T;
    if (_e147 <= 0f) {
        {
            (*gA) = vec3<f32>(1f, 0f, 0f);
            (*gB) = vec3(0f);
            return;
        }
    }
    let _e157 = dirF_5;
    let _e161 = dirF_5;
    let _e166 = dirF_5;
    let _e172 = dirF_5;
    let _e176 = dirF_5;
    let _e181 = dirF_5;
    ph = ((((1.1f * _e157.x) + (0.7f * _e161.z)) - (0.5f * _e166.y)) + (0.35f * sin((((2.3f * _e172.y) + (1.7f * _e176.x)) - (0.9f * _e181.z)))));
    let _e189 = global.uCloudClock;
    let _e191 = T;
    let _e193 = ph;
    s = (((_e189.x / _e191) + _e193) + 4f);
    let _e198 = s;
    a_1 = floor(_e198);
    let _e201 = s;
    let _e202 = a_1;
    fa = (_e201 - _e202);
    let _e205 = s;
    b_1 = floor((_e205 + 0.5f));
    let _e210 = s;
    let _e213 = b_1;
    fb = ((_e210 + 0.5f) - _e213);
    let _e217 = dirF_5;
    let _e227 = dirF_5;
    let _e239 = dirF_5;
    j = (0.065f * ((sin((dot(_e217, vec3<f32>(5.1f, 3.7f, -4.3f)) + 1.3f)) + sin((dot(_e227, vec3<f32>(-3.9f, 7.3f, 6.1f)) + 0.4f))) + (0.6f * sin((dot(_e239, vec3<f32>(11.3f, -8.9f, 7.7f)) + 2.1f)))));
    let _e253 = s;
    let _e254 = j;
    fj = fract((_e253 + _e254));
    let _e262 = fj;
    wa = smoothstep(0.4f, 0.6f, (1f - abs(((2f * _e262) - 1f))));
    let _e270 = wa;
    let _e271 = fa;
    let _e274 = T;
    let _e277 = global.uCloudClock;
    let _e279 = a_1;
    (*gA) = vec3<f32>(_e270, ((_e271 - 0.5f) * _e274), (2f * (_e277.y + _e279)));
    let _e284 = wa;
    let _e286 = fb;
    let _e289 = T;
    let _e292 = global.uCloudClock;
    let _e294 = b_1;
    (*gB) = vec3<f32>((1f - _e284), ((_e286 - 0.5f) * _e289), ((2f * (_e292.y + _e294)) + 1f));
    return;
}

fn cloudGenOff(idx: f32) -> vec3<f32> {
    var idx_1: f32;
    var h: u32;

    idx_1 = idx;
    let _e142 = idx_1;
    h = (u32(_e142) * 2654435761u);
    let _e147 = h;
    let _e148 = h;
    h = (_e147 ^ (_e148 >> 15u));
    let _e152 = h;
    h = (_e152 * 2246822519u);
    let _e155 = h;
    let _e156 = h;
    h = (_e155 ^ (_e156 >> 13u));
    let _e160 = h;
    let _e164 = h;
    let _e170 = h;
    return (((vec3<f32>(f32((_e160 & 1023u)), f32(((_e164 >> 10u) & 1023u)), f32(((_e170 >> 20u) & 1023u))) / vec3(1024f)) - vec3(0.5f)) * 400000f);
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
    let _e146 = dirF_7;
    lat_1 = asin(clamp(_e146.y, -1f, 1f));
    let _e154 = global.uCloudWind;
    let _e156 = lat_1;
    let _e157 = global.uCloudWind;
    let _e162 = global.uCloudWind;
    let _e168 = global.uCloudWind;
    let _e170 = lat_1;
    let _e172 = lat_1;
    U = (_e154.x * (sin((((_e156 * _e157.y) * 2f) + (_e162.z * 6.2832f))) + (_e168.w * exp(((-(_e170) * _e172) * 40f)))));
    let _e181 = dirF_7;
    let _e185 = dirF_7;
    east = normalize((vec3<f32>(-(_e181.z), 0f, _e185.x) + vec3<f32>(0.000001f, 0f, 0f)));
    let _e195 = pf_1;
    let _e196 = east;
    let _e197 = U;
    let _e199 = g_1;
    let _e203 = g_1;
    let _e205 = cloudGenOff(_e203.z);
    return ((_e195 + ((_e196 * _e197) * _e199.y)) + _e205);
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
    let _e150 = dirF_9;
    cloudGens(_e150, (&gA_1), (&gB_1));
    let _e157 = dirF_9;
    let _e158 = cloudClimate(_e157);
    clim_2 = _e158;
    let _e160 = gA_1;
    if (_e160.x > 0.005f) {
        let _e164 = c;
        let _e165 = gA_1;
        let _e167 = pf_3;
        let _e168 = dirF_9;
        let _e169 = gA_1;
        let _e170 = cloudAdvect(_e167, _e168, _e169);
        let _e171 = foot_9;
        let _e172 = bias_5;
        let _e173 = clim_2;
        let _e174 = cloudCoverC(_e170, _e171, _e172, _e173);
        c = (_e164 + (_e165.x * _e174));
    }
    let _e177 = gB_1;
    if (_e177.x > 0.005f) {
        let _e181 = c;
        let _e182 = gB_1;
        let _e184 = pf_3;
        let _e185 = dirF_9;
        let _e186 = gB_1;
        let _e187 = cloudAdvect(_e184, _e185, _e186);
        let _e188 = foot_9;
        let _e189 = bias_5;
        let _e190 = clim_2;
        let _e191 = cloudCoverC(_e187, _e188, _e189, _e190);
        c = (_e181 + (_e182.x * _e191));
    }
    let _e194 = c;
    return _e194;
}

fn ringShadow(rel: vec3<f32>) -> f32 {
    var rel_1: vec3<f32>;
    var pF: vec3<f32>;
    var sF: vec3<f32>;
    var q_6: vec3<f32>;
    var x: f32;
    var f_2: f32;
    var i_1: i32;
    var j_1: i32;
    var tau: f32;

    rel_1 = rel;
    let _e142 = global.uRing;
    if (_e142.z < 0.5f) {
        return 1f;
    }
    let _e147 = global.uToFixed;
    let _e148 = rel_1;
    pF = (_e147 * _e148);
    let _e151 = global.uToFixed;
    let _e152 = global.uSunDir;
    sF = (_e151 * _e152);
    let _e155 = pF;
    let _e157 = sF;
    let _e162 = sF;
    if (((_e155.y * _e157.y) >= 0f) || (abs(_e162.y) < 0.0001f)) {
        return 1f;
    }
    let _e169 = pF;
    let _e170 = sF;
    let _e171 = pF;
    let _e173 = sF;
    q_6 = (_e169 - (_e170 * (_e171.y / _e173.y)));
    let _e179 = q_6;
    let _e182 = global.uRing;
    let _e185 = global.uRing;
    let _e187 = global.uRing;
    x = ((length(_e179.xz) - _e182.x) / (_e185.y - _e187.x));
    let _e192 = x;
    let _e195 = x;
    if ((_e192 <= 0f) || (_e195 >= 1f)) {
        return 1f;
    }
    let _e200 = x;
    f_2 = clamp(((_e200 * 32f) - 0.5f), 0f, 31f);
    let _e209 = f_2;
    i_1 = i32(floor(_e209));
    let _e213 = i_1;
    j_1 = min((_e213 + 1i), 31i);
    let _e219 = i_1;
    let _e221 = i_1;
    let _e226 = i_1;
    let _e231 = global.uRingTau[(_e226 / 4i)][(_e219 - (4i * (_e221 / 4i)))];
    let _e232 = j_1;
    let _e234 = j_1;
    let _e239 = j_1;
    let _e244 = global.uRingTau[(_e239 / 4i)][(_e232 - (4i * (_e234 / 4i)))];
    let _e245 = f_2;
    let _e246 = f_2;
    tau = mix(_e231, _e244, (_e245 - floor(_e246)));
    let _e251 = tau;
    let _e253 = sF;
    return exp((-(_e251) / abs(_e253.y)));
}

fn cloudLight(rel_2: vec3<f32>, r_6: f32, muS: f32, foot_10: f32, sunAbove: vec3<f32>, skyE: ptr<function, vec3<f32>>) -> f32 {
    var rel_3: vec3<f32>;
    var r_7: f32;
    var muS_1: f32;
    var foot_11: f32;
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
    foot_11 = foot_10;
    sunAbove_1 = sunAbove;
    cloudDirZ = 1f;
    cloudTotZ = 1f;
    let _e155 = rel_3;
    let _e156 = ringShadow(_e155);
    ring = _e156;
    let _e158 = global.uCloudOn;
    if (_e158 < 0.5f) {
        let _e161 = muS_1;
        if (_e161 > -0.05f) {
            let _e165 = ring;
            local_4 = _e165;
        } else {
            local_4 = 1f;
        }
        let _e168 = local_4;
        return _e168;
    }
    let _e169 = muS_1;
    mu_8 = max(_e169, 0.05f);
    let _e187 = global.uCSOn;
    if (_e187 > 0.5f) {
        {
            let _e190 = global.uToFixed;
            let _e191 = rel_3;
            pf_4 = (_e190 * _e191);
            let _e194 = pf_4;
            let _e195 = r_7;
            upF = (_e194 / vec3(_e195));
            let _e199 = global.uToFixed;
            let _e200 = global.uSunDir;
            sF_1 = (_e199 * _e200);
            let _e203 = pf_4;
            let _e204 = global.uCSOrigin;
            let _e206 = sF_1;
            let _e207 = upF;
            let _e208 = sF_1;
            let _e209 = upF;
            let _e213 = r_7;
            let _e214 = global.uRadius;
            let _e217 = sF_1;
            let _e218 = upF;
            d_1 = ((_e203 - _e204) - (((_e206 - (_e207 * dot(_e208, _e209))) * (_e213 - _e214)) / vec3(max(dot(_e217, _e218), 0.1f))));
            let _e226 = d_1;
            let _e227 = global.uCSE;
            let _e229 = d_1;
            let _e230 = global.uCSN;
            let _e233 = global.uCSInvL;
            uv_4 = ((vec2<f32>(dot(_e226, _e227), dot(_e229, _e230)) * _e233) + vec2(0.5f));
            let _e241 = uv_4;
            let _e244 = uv_4;
            let _e248 = uv_4;
            let _e251 = uv_4;
            w = smoothstep(0f, 0.08f, min(min(_e241.x, (1f - _e244.x)), min(_e248.y, (1f - _e251.y))));
            let _e257 = w;
            if (_e257 > 0f) {
                {
                    let _e260 = uv_4;
                    let _e262 = textureSampleLevel(tCloudShadowTexture, tCloudShadowSampler, _e260, 0f);
                    m0_ = _e262;
                    let _e263 = uv_4;
                    let _e264 = global.uCSLod;
                    let _e265 = textureSampleLevel(tCloudShadowTexture, tCloudShadowSampler, _e263, _e264);
                    m1_ = _e265;
                }
            }
        }
    }
    let _e266 = global.uCloud;
    let _e268 = r_7;
    let _e269 = global.uRadius;
    hc = (_e266.x - (_e268 - _e269));
    let _e273 = hc;
    let _e276 = w;
    if ((_e273 > 0f) && (_e276 < 1f)) {
        {
            let _e280 = global.uToFixed;
            let _e281 = rel_3;
            let _e282 = global.uSunDir;
            let _e283 = hc;
            let _e285 = muS_1;
            ds = normalize((_e280 * normalize((_e281 + ((_e282 * _e283) / vec3(max(_e285, 0.08f)))))));
            let _e295 = muS_1;
            if (_e295 > -0.05f) {
                let _e299 = ds;
                let _e300 = global.uRadius;
                let _e302 = ds;
                let _e303 = foot_11;
                let _e304 = global.uCloud;
                let _e306 = cloudBias(_e304.z);
                let _e307 = cloudCoverG((_e299 * _e300), _e302, _e303, _e306);
                let _e308 = global.uCloudOpacity;
                local_5 = (_e307 * _e308);
            } else {
                local_5 = 0f;
            }
            let _e312 = local_5;
            cs = _e312;
            let _e314 = global.uToFixed;
            let _e315 = rel_3;
            dz = normalize((_e314 * _e315));
            let _e319 = dz;
            let _e320 = global.uRadius;
            let _e322 = dz;
            let _e323 = foot_11;
            let _e325 = hc;
            let _e328 = global.uCloud;
            let _e330 = cloudBias(_e328.z);
            let _e331 = cloudCoverG((_e319 * _e320), _e322, max(_e323, (3.5f * _e325)), _e330);
            let _e332 = global.uCloudOpacity;
            cz = (_e331 * _e332);
            let _e336 = cs;
            let _e338 = cs;
            let _e339 = global.uCloudTau;
            let _e341 = mu_8;
            Tdir = ((1f - _e336) + (_e338 * exp((-(_e339) / _e341))));
            let _e347 = cz;
            let _e349 = cz;
            let _e352 = global.uCloudTau;
            Ttot = ((1f - _e347) + (_e349 / (1f + (0.1125f * _e352))));
            let _e358 = cz;
            let _e360 = cz;
            let _e361 = global.uCloudTau;
            let _e363 = mu_8;
            Dup = ((1f - _e358) + (_e360 * exp((-(_e361) / _e363))));
        }
    }
    let _e368 = Tdir;
    let _e369 = m0_;
    let _e371 = w;
    Tdir = mix(_e368, _e369.x, _e371);
    let _e373 = Ttot;
    let _e374 = m1_;
    let _e376 = w;
    Ttot = mix(_e373, _e374.y, _e376);
    let _e378 = Dup;
    let _e379 = m1_;
    let _e381 = w;
    Dup = mix(_e378, _e379.z, _e381);
    let _e383 = Dup;
    cloudDirZ = _e383;
    let _e384 = Ttot;
    cloudTotZ = _e384;
    let _e385 = (*skyE);
    let _e386 = Ttot;
    let _e388 = sunAbove_1;
    let _e389 = muS_1;
    let _e393 = Ttot;
    let _e394 = Dup;
    (*skyE) = ((_e385 * _e386) + ((_e388 * max(_e389, 0f)) * max((_e393 - _e394), 0f)));
    let _e400 = muS_1;
    if (_e400 > -0.05f) {
        let _e404 = Tdir;
        let _e405 = ring;
        local_6 = (_e404 * _e405);
    } else {
        local_6 = 1f;
    }
    let _e409 = local_6;
    return _e409;
}

fn blackbodyGlow(T_1: f32) -> vec3<f32> {
    var T_2: f32;
    var g_2: f32;

    T_2 = T_1;
    let _e144 = T_2;
    if (_e144 < 650f) {
        return vec3(0f);
    }
    let _e152 = T_2;
    g_2 = max(0f, (0.0287f + (0.000237f * (_e152 - 1000f))));
    let _e160 = g_2;
    let _e166 = T_2;
    let _e172 = g_2;
    return (vec3<f32>(1f, _e160, 0f) * ((600000f * exp((-24060f / _e166))) / (0.2126f + (0.7152f * _e172))));
}

fn airHeatGlow(r_8: f32) -> vec3<f32> {
    var r_9: f32;
    var local_7: vec3<f32>;

    r_9 = r_8;
    let _e144 = global.uThermal;
    if (_e144.x > 0f) {
        let _e148 = global.uThermal;
        let _e150 = global.uThermal;
        let _e152 = r_9;
        let _e153 = global.uRadius;
        let _e159 = blackbodyGlow((_e148.x - (_e150.z * max((_e152 - _e153), 0f))));
        local_7 = _e159;
    } else {
        local_7 = vec3(0f);
    }
    let _e163 = local_7;
    return _e163;
}

fn heightCubeAt(d_2: vec3<f32>) -> f32 {
    var d_3: vec3<f32>;
    var a_2: vec3<f32>;
    var local_8: i32;
    var local_9: i32;
    var local_10: i32;
    var local_11: i32;
    var local_12: i32;
    var f_3: i32;
    var local_13: array<vec3<f32>, 6> = HC_N;
    var dn: f32;
    var local_14: array<vec3<f32>, 6> = HC_U;
    var local_15: array<vec3<f32>, 6> = HC_V;
    var uv_5: vec2<f32>;

    d_3 = d_2;
    let _e147 = d_3;
    a_2 = abs(_e147);
    let _e150 = a_2;
    let _e152 = a_2;
    let _e155 = a_2;
    let _e157 = a_2;
    if ((_e150.x >= _e152.y) && (_e155.x >= _e157.z)) {
        let _e161 = d_3;
        if (_e161.x >= 0f) {
            local_8 = 0i;
        } else {
            local_8 = 1i;
        }
        let _e168 = local_8;
        local_12 = _e168;
    } else {
        let _e169 = a_2;
        let _e171 = a_2;
        if (_e169.y >= _e171.z) {
            let _e174 = d_3;
            if (_e174.y >= 0f) {
                local_9 = 2i;
            } else {
                local_9 = 3i;
            }
            let _e181 = local_9;
            local_11 = _e181;
        } else {
            let _e182 = d_3;
            if (_e182.z >= 0f) {
                local_10 = 4i;
            } else {
                local_10 = 5i;
            }
            let _e189 = local_10;
            local_11 = _e189;
        }
        let _e191 = local_11;
        local_12 = _e191;
    }
    let _e193 = local_12;
    f_3 = _e193;
    let _e195 = d_3;
    let _e196 = f_3;
    let _e200 = local_13[_e196];
    dn = dot(_e195, _e200);
    let _e203 = d_3;
    let _e204 = f_3;
    let _e208 = local_14[_e204];
    let _e210 = dn;
    let _e213 = d_3;
    let _e214 = f_3;
    let _e218 = local_15[_e214];
    let _e220 = dn;
    uv_5 = (((vec2<f32>(atan((dot(_e203, _e208) / _e210)), atan((dot(_e213, _e218) / _e220))) / vec2(0.785398f)) * 0.5f) + vec2(0.5f));
    let _e233 = uv_5;
    let _e234 = f_3;
    let _e238 = vec3<f32>(_e233.x, _e233.y, f32(_e234));
    let _e243 = textureSampleLevel(tHeightCubeTexture, tHeightCubeSampler, _e238.xy, i32(_e238.z), 0f);
    return _e243.x;
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
    let _e153 = global.uHeightCube;
    let _e157 = up_1;
    let _e158 = sF_3;
    if ((_e153.x < 0.5f) || (dot(_e157, _e158) < -0.2f)) {
        return 1f;
    }
    let _e165 = global.uHeightCube;
    texel = _e165.w;
    let _e168 = R_1;
    let _e169 = global.uHeightCube;
    top = (_e168 + _e169.z);
    let _e173 = pF_2;
    r0_ = length(_e173);
    let _e177 = R_1;
    let _e178 = up_1;
    let _e179 = heightCubeAt(_e178);
    let _e181 = r0_;
    below = max(0f, ((_e177 + _e179) - _e181));
    let _e185 = pF_2;
    let _e186 = up_1;
    let _e187 = texel;
    o = (_e185 + ((_e186 * _e187) * 0.1f));
    let _e193 = texel;
    t = _e193;
    loop {
        let _e199 = i_2;
        if !((_e199 < 28i)) {
            break;
        }
        {
            let _e206 = o;
            let _e207 = sF_3;
            let _e208 = t;
            qp = (_e206 + (_e207 * _e208));
            let _e212 = qp;
            rq = length(_e212);
            let _e215 = rq;
            let _e216 = top;
            if (_e215 > _e216) {
                break;
            }
            let _e218 = rq;
            let _e219 = R_1;
            let _e220 = qp;
            let _e221 = rq;
            let _e224 = heightCubeAt((_e220 / vec3(_e221)));
            let _e227 = below;
            let _e228 = t;
            let _e231 = texel;
            d_4 = ((_e218 - (_e219 + _e224)) + (_e227 * exp((-(_e228) / (3f * _e231)))));
            let _e238 = sh;
            let _e239 = d_4;
            let _e240 = t;
            sh = min(_e238, clamp(((_e239 / (_e240 * 0.035f)) + 0.5f), 0f, 1f));
            let _e250 = sh;
            if (_e250 <= 0f) {
                break;
            }
            let _e253 = t;
            t = (_e253 * 1.35f);
        }
        continuing {
            let _e203 = i_2;
            i_2 = (_e203 + 1i);
        }
    }
    let _e256 = sh;
    return _e256;
}

fn airShadow(pF_3: vec3<f32>, sF_4: vec3<f32>, R_2: f32) -> f32 {
    var pF_4: vec3<f32>;
    var sF_5: vec3<f32>;
    var R_3: f32;
    var texel_1: f32;
    var top_1: f32;
    var t_1: f32;
    var sh_1: f32 = 1f;
    var i_3: i32 = 0i;
    var qp_1: vec3<f32>;
    var rq_1: f32;

    pF_4 = pF_3;
    sF_5 = sF_4;
    R_3 = R_2;
    let _e151 = global.uHeightCube;
    texel_1 = _e151.w;
    let _e154 = R_3;
    let _e155 = global.uHeightCube;
    top_1 = (_e154 + _e155.z);
    let _e159 = texel_1;
    t_1 = _e159;
    loop {
        let _e165 = i_3;
        if !((_e165 < 16i)) {
            break;
        }
        {
            let _e172 = pF_4;
            let _e173 = sF_5;
            let _e174 = t_1;
            qp_1 = (_e172 + (_e173 * _e174));
            let _e178 = qp_1;
            rq_1 = length(_e178);
            let _e181 = rq_1;
            let _e182 = top_1;
            if (_e181 > _e182) {
                break;
            }
            let _e184 = sh_1;
            let _e185 = rq_1;
            let _e186 = R_3;
            let _e187 = qp_1;
            let _e188 = rq_1;
            let _e191 = heightCubeAt((_e187 / vec3(_e188)));
            let _e194 = t_1;
            sh_1 = min(_e184, clamp((((_e185 - (_e186 + _e191)) / (_e194 * 0.035f)) + 0.5f), 0f, 1f));
            let _e204 = sh_1;
            if (_e204 <= 0f) {
                break;
            }
            let _e207 = t_1;
            t_1 = (_e207 * 1.6f);
        }
        continuing {
            let _e169 = i_3;
            i_3 = (_e169 + 1i);
        }
    }
    let _e210 = sh_1;
    return _e210;
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
    var j_2: i32 = 0i;
    var i_4: i32;
    var local_16: f32;
    var lit: f32 = 0f;
    var j_3: i32 = 0i;
    var i_5: i32;

    org_1 = org;
    n_3 = n_2;
    VP_1 = VP;
    L_3 = L_2;
    wp_1 = wp;
    bias_7 = bias_6;
    let _e157 = VP_1;
    let _e158 = wp_1;
    c_1 = (_e157 * vec4<f32>(_e158.x, _e158.y, _e158.z, 1f));
    let _e166 = c_1;
    let _e168 = c_1;
    uv_6 = (((_e166.xy / vec2(_e168.w)) * 0.5f) + vec2(0.5f));
    let _e178 = uv_6;
    let _e183 = uv_6;
    if (any((_e178 < vec2(0f))) || any((_e183 > vec2(1f)))) {
        return 1f;
    }
    let _e190 = L_3;
    let _e192 = wp_1;
    let _e194 = global.uSunShadowDir;
    let _e196 = bias_7;
    d_5 = (dot((_e190.xyz - _e192), _e194) - _e196);
    let _e199 = n_3;
    sz_1 = vec2(_e199);
    let _e202 = uv_6;
    let _e203 = sz_1;
    st_1 = ((_e202 * vec2<f32>(_e203)) - vec2(0.5f));
    let _e210 = st_1;
    fr = fract(_e210);
    let _e213 = st_1;
    p0_ = vec2<i32>(floor(_e213));
    loop {
        let _e220 = j_2;
        if !((_e220 < 4i)) {
            break;
        }
        i_4 = 0i;
        loop {
            let _e229 = i_4;
            if !((_e229 < 4i)) {
                break;
            }
            let _e236 = j_2;
            let _e239 = i_4;
            let _e242 = d_5;
            let _e243 = org_1;
            let _e244 = p0_;
            let _e245 = i_4;
            let _e248 = j_2;
            let _e255 = sz_1;
            let _e262 = textureLoad(tShadowAtlasTexture, (_e243 + clamp((_e244 + vec2<i32>((_e245 - 1i), (_e248 - 1i))), vec2(0i), (_e255 - vec2(1i)))), 0i);
            if (_e242 <= _e262.x) {
                local_16 = 1f;
            } else {
                local_16 = 0f;
            }
            let _e268 = local_16;
            cmp[((_e236 * 4i) + _e239)] = _e268;
            continuing {
                let _e233 = i_4;
                i_4 = (_e233 + 1i);
            }
        }
        continuing {
            let _e224 = j_2;
            j_2 = (_e224 + 1i);
        }
    }
    loop {
        let _e273 = j_3;
        if !((_e273 < 3i)) {
            break;
        }
        i_5 = 0i;
        loop {
            let _e282 = i_5;
            if !((_e282 < 3i)) {
                break;
            }
            let _e289 = lit;
            let _e290 = j_3;
            let _e293 = i_5;
            let _e296 = cmp[((_e290 * 4i) + _e293)];
            let _e297 = j_3;
            let _e300 = i_5;
            let _e305 = cmp[(((_e297 * 4i) + _e300) + 1i)];
            let _e306 = fr;
            let _e309 = j_3;
            let _e312 = i_5;
            let _e317 = cmp[(((_e309 * 4i) + _e312) + 4i)];
            let _e318 = j_3;
            let _e321 = i_5;
            let _e326 = cmp[(((_e318 * 4i) + _e321) + 5i)];
            let _e327 = fr;
            let _e330 = fr;
            lit = (_e289 + mix(mix(_e296, _e305, _e306.x), mix(_e317, _e326, _e327.x), _e330.y));
            continuing {
                let _e286 = i_5;
                i_5 = (_e286 + 1i);
            }
        }
        continuing {
            let _e277 = j_3;
            j_3 = (_e277 + 1i);
        }
    }
    let _e334 = lit;
    return (_e334 / 9f);
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
    let _e149 = global.uSunShadow;
    if (_e149.x < 0.5f) {
        return 1f;
    }
    let _e154 = wp_3;
    dist = length(_e154);
    let _e157 = dist;
    let _e158 = global.uSunShadow;
    if (_e157 > _e158.z) {
        return 1f;
    }
    let _e162 = N_1;
    let _e163 = global.uSunShadowDir;
    ndl = max(dot(_e162, _e163), 0.05f);
    let _e169 = ndl;
    let _e170 = ndl;
    let _e174 = ndl;
    slope = (sqrt((1f - (_e169 * _e170))) / _e174);
    let _e181 = global.uSunShadowVP1_;
    let _e182 = global.uSunShadowL1_;
    let _e183 = wp_3;
    let _e184 = global.uSunShadowL1_;
    let _e187 = slope;
    let _e192 = sunShadowTap(vec2<i32>(2048i, 0i), 2048i, _e181, _e182, _e183, (_e184.w * (1.5f + min(_e187, 6f))));
    s1_ = _e192;
    let _e194 = s1_;
    let _e197 = global.uSunShadow;
    let _e200 = global.uSunShadow;
    let _e202 = dist;
    sh_2 = mix(_e194, 1f, smoothstep((0.85f * _e197.z), _e200.z, _e202));
    let _e206 = dist;
    let _e207 = global.uSunShadow;
    if (_e206 < _e207.y) {
        {
            let _e214 = global.uSunShadowVP0_;
            let _e215 = global.uSunShadowL0_;
            let _e216 = wp_3;
            let _e217 = global.uSunShadowL0_;
            let _e220 = slope;
            let _e225 = sunShadowTap(vec2<i32>(0i, 0i), 2048i, _e214, _e215, _e216, (_e217.w * (1.5f + min(_e220, 6f))));
            s0_ = _e225;
            let _e227 = s0_;
            let _e228 = sh_2;
            let _e230 = global.uSunShadow;
            let _e233 = global.uSunShadow;
            let _e235 = dist;
            sh_2 = mix(_e227, _e228, smoothstep((0.75f * _e230.y), _e233.y, _e235));
        }
    }
    let _e238 = sh_2;
    return _e238;
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
    var f_4: f32;
    var sum: f32;

    wp_5 = wp_4;
    let _e147 = global.uGrassCover;
    if (_e147.x < 0.5f) {
        return 0f;
    }
    let _e152 = global.uGrassCoverVP;
    let _e153 = wp_5;
    c_2 = (_e152 * vec4<f32>(_e153.x, _e153.y, _e153.z, 1f));
    let _e161 = c_2;
    let _e163 = c_2;
    uv_7 = (((_e161.xy / vec2(_e163.w)) * 0.5f) + vec2(0.5f));
    let _e173 = uv_7;
    let _e180 = uv_7;
    e = max(abs(((_e173.x * 2f) - 1f)), abs(((_e180.y * 2f) - 1f)));
    let _e189 = e;
    if (_e189 >= 1f) {
        return 0f;
    }
    let _e193 = global.uGrassCover;
    n_4 = i32(_e193.w);
    let _e197 = uv_7;
    let _e198 = global.uGrassCover;
    st_2 = ((_e197 * _e198.w) - vec2(0.5f));
    let _e205 = st_2;
    fr_1 = fract(_e205);
    let _e208 = st_2;
    p0_1 = vec2<i32>(floor(_e208));
    let _e212 = global.uGrassCover;
    org_2 = vec2<i32>(_e212.yz);
    let _e216 = n_4;
    hi = vec2((_e216 - 1i));
    let _e221 = org_2;
    let _e222 = p0_1;
    let _e225 = hi;
    let _e229 = textureLoad(tShadowAtlasTexture, (_e221 + clamp(_e222, vec2(0i), _e225)), 0i);
    a_3 = _e229.x;
    let _e232 = org_2;
    let _e233 = p0_1;
    let _e240 = hi;
    let _e244 = textureLoad(tShadowAtlasTexture, (_e232 + clamp((_e233 + vec2<i32>(1i, 0i)), vec2(0i), _e240)), 0i);
    b_2 = _e244.x;
    let _e247 = org_2;
    let _e248 = p0_1;
    let _e255 = hi;
    let _e259 = textureLoad(tShadowAtlasTexture, (_e247 + clamp((_e248 + vec2<i32>(0i, 1i)), vec2(0i), _e255)), 0i);
    d_6 = _e259.x;
    let _e262 = org_2;
    let _e263 = p0_1;
    let _e270 = hi;
    let _e274 = textureLoad(tShadowAtlasTexture, (_e262 + clamp((_e263 + vec2<i32>(1i, 1i)), vec2(0i), _e270)), 0i);
    f_4 = _e274.x;
    let _e277 = a_3;
    let _e278 = b_2;
    let _e279 = fr_1;
    let _e282 = d_6;
    let _e283 = f_4;
    let _e284 = fr_1;
    let _e287 = fr_1;
    sum = mix(mix(_e277, _e278, _e279.x), mix(_e282, _e283, _e284.x), _e287.y);
    let _e291 = sum;
    let _e295 = e;
    return (_e291 * (1f - smoothstep(0.75f, 1f, _e295)));
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
    var f_5: f32;
    var sum_1: f32;

    o_2 = o_1;
    wp_7 = wp_6;
    let _e149 = global.uTrunkSkyVP;
    let _e150 = wp_7;
    c_3 = (_e149 * vec4<f32>(_e150.x, _e150.y, _e150.z, 1f));
    let _e158 = c_3;
    let _e160 = c_3;
    uv_8 = (((_e158.xy / vec2(_e160.w)) * 0.5f) + vec2(0.5f));
    let _e170 = uv_8;
    let _e177 = uv_8;
    e_1 = max(abs(((_e170.x * 2f) - 1f)), abs(((_e177.y * 2f) - 1f)));
    let _e186 = e_1;
    if (_e186 >= 1f) {
        return 0f;
    }
    let _e190 = global.uTrunkSky;
    n_5 = i32(_e190.w);
    let _e194 = uv_8;
    let _e195 = global.uTrunkSky;
    st_3 = ((_e194 * _e195.w) - vec2(0.5f));
    let _e202 = st_3;
    fr_2 = fract(_e202);
    let _e205 = st_3;
    p0_2 = vec2<i32>(floor(_e205));
    let _e209 = o_2;
    org_3 = vec2<i32>(_e209);
    let _e212 = n_5;
    hi_1 = vec2((_e212 - 1i));
    let _e217 = org_3;
    let _e218 = p0_2;
    let _e221 = hi_1;
    let _e225 = textureLoad(tShadowAtlasTexture, (_e217 + clamp(_e218, vec2(0i), _e221)), 0i);
    a_4 = _e225.x;
    let _e228 = org_3;
    let _e229 = p0_2;
    let _e236 = hi_1;
    let _e240 = textureLoad(tShadowAtlasTexture, (_e228 + clamp((_e229 + vec2<i32>(1i, 0i)), vec2(0i), _e236)), 0i);
    b_3 = _e240.x;
    let _e243 = org_3;
    let _e244 = p0_2;
    let _e251 = hi_1;
    let _e255 = textureLoad(tShadowAtlasTexture, (_e243 + clamp((_e244 + vec2<i32>(0i, 1i)), vec2(0i), _e251)), 0i);
    d_7 = _e255.x;
    let _e258 = org_3;
    let _e259 = p0_2;
    let _e266 = hi_1;
    let _e270 = textureLoad(tShadowAtlasTexture, (_e258 + clamp((_e259 + vec2<i32>(1i, 1i)), vec2(0i), _e266)), 0i);
    f_5 = _e270.x;
    let _e273 = a_4;
    let _e274 = b_3;
    let _e275 = fr_2;
    let _e278 = d_7;
    let _e279 = f_5;
    let _e280 = fr_2;
    let _e283 = fr_2;
    sum_1 = mix(mix(_e273, _e274, _e275.x), mix(_e278, _e279, _e280.x), _e283.y);
    let _e287 = sum_1;
    let _e291 = e_1;
    return (_e287 * (1f - smoothstep(0.75f, 1f, _e291)));
}

fn trunkSum(wp_8: vec3<f32>) -> f32 {
    var wp_9: vec3<f32>;
    var local_17: f32;

    wp_9 = wp_8;
    let _e147 = global.uTrunkSky;
    if (_e147.x < 0.5f) {
        local_17 = 0f;
    } else {
        let _e152 = global.uTrunkSky;
        let _e154 = wp_9;
        let _e155 = atlasSum(_e152.yz, _e154);
        local_17 = _e155;
    }
    let _e157 = local_17;
    return _e157;
}

fn rockSum(wp_10: vec3<f32>) -> f32 {
    var wp_11: vec3<f32>;
    var local_18: f32;

    wp_11 = wp_10;
    let _e147 = global.uRockSky;
    if (_e147.x < 0.5f) {
        local_18 = 0f;
    } else {
        let _e152 = global.uRockSky;
        let _e154 = wp_11;
        let _e155 = atlasSum(_e152.yz, _e154);
        local_18 = _e155;
    }
    let _e157 = local_18;
    return _e157;
}

fn trunkSky(wp_12: vec3<f32>) -> f32 {
    var wp_13: vec3<f32>;

    wp_13 = wp_12;
    let _e147 = wp_13;
    let _e148 = trunkSum(_e147);
    let _e150 = wp_13;
    let _e151 = rockSum(_e150);
    return exp((-(_e148) - _e151));
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
    let _e155 = sc_1;
    if (_e155.x <= 0.003f) {
        return 0f;
    }
    let _e160 = d_9;
    let _e161 = D_1;
    let _e162 = sc_1;
    let _e164 = sc_1;
    dh = (_e160 - (_e161 + (_e162.y / _e164.x)));
    let _e170 = dh;
    if (_e170 <= 0f) {
        return 0f;
    }
    let _e174 = dh;
    let _e175 = dh;
    h2_ = (_e174 * _e175);
    let _e178 = sc_1;
    let _e180 = b_5;
    let _e181 = b_5;
    let _e183 = b_5;
    let _e184 = b_5;
    let _e186 = h2_;
    let _e189 = a_6;
    let _e190 = a_6;
    let _e192 = a_6;
    let _e193 = a_6;
    let _e195 = h2_;
    return (_e178.x * (((_e180 * _e181) / ((_e183 * _e184) + _e186)) - ((_e189 * _e190) / (((_e192 * _e193) + _e195) + 0.000001f))));
}

fn skyShadowMap(u0_: f32, D_2: f32, VP_2: mat4x4<f32>, L_4: vec4<f32>, upF_1: vec3<f32>, ext: f32, pF_5: vec3<f32>) -> f32 {
    var u0_1: f32;
    var D_3: f32;
    var VP_3: mat4x4<f32>;
    var L_5: vec4<f32>;
    var upF_2: vec3<f32>;
    var ext_1: f32;
    var pF_6: vec3<f32>;
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
    pF_6 = pF_5;
    let _e159 = VP_3;
    let _e160 = pF_6;
    c_4 = (_e159 * vec4<f32>(_e160.x, _e160.y, _e160.z, 1f));
    let _e168 = c_4;
    let _e170 = c_4;
    uv_9 = (((_e168.xy / vec2(_e170.w)) * 0.5f) + vec2(0.5f));
    let _e182 = ext_1;
    edge = (45f / (2f * _e182));
    let _e186 = uv_9;
    let _e187 = edge;
    let _e191 = uv_9;
    let _e193 = edge;
    if (any((_e186 < vec2(_e187))) || any((_e191 > vec2((1f - _e193))))) {
        return -1f;
    }
    let _e201 = uv_9;
    uv_9 = clamp(_e201, vec2(0.0009765625f), vec2(0.99902344f));
    let _e215 = u0_1;
    x0_ = (_e215 * 3f);
    let _e219 = x0_;
    let _e222 = uv_9;
    let _e225 = NB;
    let _e227 = uv_9;
    let _e231 = textureSampleLevel(tSkyRingsTexture, tSkyRingsSampler, vec2<f32>((((_e219 + 2f) + _e222.x) / _e225), _e227.y), 0f);
    C = _e231;
    let _e233 = C;
    if (_e233.z < 0.002f) {
        return 0f;
    }
    let _e238 = x0_;
    let _e239 = uv_9;
    let _e242 = NB;
    let _e244 = uv_9;
    let _e248 = textureSampleLevel(tSkyRingsTexture, tSkyRingsSampler, vec2<f32>(((_e238 + _e239.x) / _e242), _e244.y), 0f);
    A = _e248;
    let _e250 = x0_;
    let _e253 = uv_9;
    let _e256 = NB;
    let _e258 = uv_9;
    let _e262 = textureSampleLevel(tSkyRingsTexture, tSkyRingsSampler, vec2<f32>((((_e250 + 1f) + _e253.x) / _e256), _e258.y), 0f);
    B = _e262;
    let _e264 = L_5;
    let _e266 = pF_6;
    let _e268 = upF_2;
    let _e272 = L_5;
    d_10 = (dot((_e264.xyz - _e266), _e268) - (0.3f + (1.5f * _e272.w)));
    let _e278 = A;
    let _e280 = d_10;
    let _e281 = D_3;
    let _e284 = skyRing(_e278.xy, _e280, _e281, 0f, 1f);
    let _e285 = A;
    let _e287 = d_10;
    let _e288 = D_3;
    let _e291 = skyRing(_e285.zw, _e287, _e288, 1f, 3.5f);
    let _e293 = B;
    let _e295 = d_10;
    let _e296 = D_3;
    let _e299 = skyRing(_e293.xy, _e295, _e296, 3.5f, 9f);
    let _e301 = B;
    let _e303 = d_10;
    let _e304 = D_3;
    let _e307 = skyRing(_e301.zw, _e303, _e304, 9f, 20f);
    let _e309 = C;
    let _e311 = d_10;
    let _e312 = D_3;
    let _e315 = skyRing(_e309.xy, _e311, _e312, 20f, 45f);
    return clamp(((((_e284 + _e291) + _e299) + _e307) + _e315), 0f, 1f);
}

fn skyBlocked(wp_14: vec3<f32>) -> f32 {
    var wp_15: vec3<f32>;
    var dist_1: f32;
    var pF_7: vec3<f32>;
    var bl: f32 = -1f;

    wp_15 = wp_14;
    let _e147 = global.uSkyShadow;
    if (_e147.x < 0.5f) {
        return 0f;
    }
    let _e152 = wp_15;
    dist_1 = length(_e152);
    let _e155 = dist_1;
    let _e156 = global.uSkyShadow;
    if (_e155 > _e156.z) {
        return 0f;
    }
    let _e160 = global.uSkyToFixed;
    let _e161 = wp_15;
    let _e162 = global.uSkyCenter;
    pF_7 = (_e160 * (_e161 - _e162));
    let _e169 = dist_1;
    let _e170 = global.uSkyShadow;
    if (_e169 < _e170.y) {
        let _e174 = global.uSkyD;
        let _e176 = global.uSkyShadowVP0_;
        let _e177 = global.uSkyShadowL0_;
        let _e178 = global.uSkyShadowUp0_;
        let _e179 = global.uSkyShadow;
        let _e181 = pF_7;
        let _e182 = skyShadowMap(0f, _e174.x, _e176, _e177, _e178, _e179.y, _e181);
        bl = _e182;
    }
    let _e183 = bl;
    if (_e183 < 0f) {
        let _e187 = global.uSkyD;
        let _e189 = global.uSkyShadowVP1_;
        let _e190 = global.uSkyShadowL1_;
        let _e191 = global.uSkyShadowUp1_;
        let _e192 = global.uSkyShadow;
        let _e194 = pF_7;
        let _e195 = skyShadowMap(1f, _e187.y, _e189, _e190, _e191, _e192.z, _e194);
        bl = _e195;
    }
    let _e196 = bl;
    if (_e196 < 0f) {
        return 0f;
    }
    let _e200 = bl;
    let _e203 = global.uSkyShadow;
    let _e206 = global.uSkyShadow;
    let _e208 = dist_1;
    return (_e200 * (1f - smoothstep((0.8f * _e203.z), _e206.z, _e208)));
}

fn skyShadow(wp_16: vec3<f32>) -> f32 {
    var wp_17: vec3<f32>;

    wp_17 = wp_16;
    let _e148 = wp_17;
    let _e149 = skyBlocked(_e148);
    let _e151 = global.uSkyShadow;
    return (1f - (_e149 * (1f - _e151.w)));
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
    let _e153 = bl_2;
    let _e156 = sunTop_1;
    let _e157 = muS_3;
    let _e161 = skyE_2;
    let _e164 = global.uLeafTint;
    return (((_e153 * 0.1f) * ((_e156 * max(_e157, 0f)) + _e161)) * _e164);
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
    let _e149 = global.uHandE;
    if (_e149.y <= 0f) {
        return vec3(0f);
    }
    let _e155 = global.uHandPos;
    let _e156 = wp_19;
    L_6 = (_e155 - _e156);
    let _e159 = L_6;
    let _e160 = L_6;
    d2_ = max(dot(_e159, _e160), 0.25f);
    let _e165 = L_6;
    let _e166 = d2_;
    l = (_e165 * inverseSqrt(_e166));
    let _e170 = l;
    let _e172 = global.uHandDir;
    c_5 = dot(-(_e170), _e172);
    let _e175 = global.uHandCone;
    let _e177 = global.uHandCone;
    let _e179 = c_5;
    let _e182 = global.uHandCone;
    let _e186 = global.uHandCone;
    let _e188 = c_5;
    k = max(smoothstep(_e175.y, _e177.x, _e179), (0.04f * smoothstep((_e182.y - 0.3f), _e186.y, _e188)));
    let _e193 = global.uHandE;
    let _e194 = k;
    let _e196 = N_3;
    let _e197 = l;
    let _e202 = d2_;
    return (((_e193 * _e194) * max(dot(_e196, _e197), 0f)) / vec3(_e202));
}

fn moonLit(rel_4: vec3<f32>, r_10: f32, up_2: vec3<f32>, N_4: vec3<f32>, sh_3: f32, trans: f32, wrap: f32, skyK: f32) -> vec3<f32> {
    var rel_5: vec3<f32>;
    var r_11: f32;
    var up_3: vec3<f32>;
    var N_5: vec3<f32>;
    var sh_4: f32;
    var trans_1: f32;
    var wrap_1: f32;
    var skyK_1: f32;
    var muM: f32;
    var pF_8: vec3<f32>;
    var T_3: vec3<f32>;
    var S: vec3<f32>;
    var nd: f32;

    rel_5 = rel_4;
    r_11 = r_10;
    up_3 = up_2;
    N_5 = N_4;
    sh_4 = sh_3;
    trans_1 = trans;
    wrap_1 = wrap;
    skyK_1 = skyK;
    let _e161 = global.uMoonE;
    if (_e161.y <= 0f) {
        return vec3(0f);
    }
    let _e167 = up_3;
    let _e168 = global.uMoonDir;
    muM = dot(_e167, _e168);
    let _e171 = muM;
    if (_e171 < -0.1f) {
        return vec3(0f);
    }
    let _e177 = global.uToFixed;
    let _e178 = rel_5;
    pF_8 = (_e177 * _e178);
    let _e181 = r_11;
    let _e182 = muM;
    let _e183 = atmoSunTransmittance(_e181, _e182);
    let _e184 = pF_8;
    let _e185 = pF_8;
    let _e187 = global.uToFixed;
    let _e188 = global.uMoonDir;
    let _e190 = global.uRadius;
    let _e191 = terrainShadow(_e184, normalize(_e185), (_e187 * _e188), _e190);
    let _e193 = sh_4;
    let _e195 = cloudDirZ;
    T_3 = (((_e183 * _e191) * _e193) * _e195);
    let _e198 = r_11;
    let _e199 = muM;
    let _e200 = atmoSkyIrradiance(_e198, _e199);
    let _e201 = cloudTotZ;
    S = (_e200 * _e201);
    let _e204 = N_5;
    let _e205 = global.uMoonDir;
    nd = dot(_e204, _e205);
    let _e208 = global.uMoonE;
    let _e209 = T_3;
    let _e210 = nd;
    let _e213 = trans_1;
    let _e214 = nd;
    let _e221 = S;
    let _e222 = wrap_1;
    let _e224 = skyK_1;
    return (_e208 * ((_e209 * (max(_e210, 0f) + (_e213 * max(-(_e214), 0f)))) + ((_e221 * _e222) * _e224)));
}

fn deferredLight(p: vec3<f32>, N_6: vec3<f32>, albedo: vec3<f32>, roughness: f32, ao: f32, wet: f32, f0_1: f32, cave: f32, trans_2: f32, foot_12: f32, metal: f32, kind: f32, selfShadow: f32, screenAO: f32) -> vec3<f32> {
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
    var screenAO_1: f32;
    var local_19: f32;
    var glint: f32;
    var rel_6: vec3<f32>;
    var r_12: f32;
    var up_4: vec3<f32>;
    var muS_4: f32;
    var sunT: vec3<f32>;
    var skyE_3: vec3<f32>;
    var cloudT: f32;
    var pF_9: vec3<f32>;
    var sunTop_2: vec3<f32>;
    var keySh: f32;
    var nd_1: f32;
    var ndl_1: f32;
    var local_20: f32;
    var wrap_2: f32;
    var direct: vec3<f32>;
    var skyBl: f32;
    var local_21: f32;
    var skyK_2: f32;
    var ambient: vec3<f32>;
    var local_22: f32;
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
    screenAO_1 = screenAO;
    let _e173 = kind_1;
    if (_e173 == 0f) {
        let _e176 = trans_3;
        local_19 = (_e176 * 3f);
    } else {
        local_19 = 0f;
    }
    let _e181 = local_19;
    glint = _e181;
    let _e183 = kind_1;
    if (_e183 == 0f) {
        trans_3 = 0f;
    }
    let _e187 = kind_1;
    if (_e187 == 5f) {
        return vec3(0f);
    }
    let _e192 = p_1;
    let _e193 = global.uCenter;
    rel_6 = (_e192 - _e193);
    let _e196 = rel_6;
    r_12 = length(_e196);
    let _e199 = rel_6;
    let _e200 = r_12;
    up_4 = (_e199 / vec3(max(_e200, 0.000001f)));
    let _e206 = up_4;
    let _e207 = global.uSunDir;
    muS_4 = dot(_e206, _e207);
    let _e210 = r_12;
    let _e211 = muS_4;
    let _e212 = atmoSunTransmittance(_e210, _e211);
    sunT = _e212;
    let _e214 = r_12;
    let _e215 = muS_4;
    let _e216 = atmoSkyIrradiance(_e214, _e215);
    skyE_3 = _e216;
    let _e218 = rel_6;
    let _e219 = r_12;
    let _e220 = muS_4;
    let _e221 = foot_13;
    let _e222 = sunT;
    let _e225 = cloudLight(_e218, _e219, _e220, _e221, _e222, (&skyE_3));
    cloudT = _e225;
    let _e227 = sunT;
    let _e228 = cloudT;
    sunT = (_e227 * _e228);
    let _e230 = global.uToFixed;
    let _e231 = rel_6;
    pF_9 = (_e230 * _e231);
    let _e234 = sunT;
    let _e235 = pF_9;
    let _e236 = pF_9;
    let _e238 = global.uToFixed;
    let _e239 = global.uSunDir;
    let _e241 = global.uRadius;
    let _e242 = terrainShadow(_e235, normalize(_e236), (_e238 * _e239), _e241);
    sunT = (_e234 * _e242);
    let _e244 = sunT;
    sunTop_2 = _e244;
    let _e246 = p_1;
    let _e247 = N_7;
    let _e248 = sunShadowMap(_e246, _e247);
    keySh = _e248;
    let _e250 = sunT;
    let _e251 = keySh;
    sunT = (_e250 * _e251);
    let _e253 = N_7;
    let _e254 = global.uSunDir;
    nd_1 = dot(_e253, _e254);
    let _e257 = nd_1;
    ndl_1 = max(_e257, 0f);
    let _e261 = kind_1;
    if (_e261 == 2f) {
        let _e266 = N_7;
        let _e267 = up_4;
        local_20 = (0.55f + (0.45f * dot(_e266, _e267)));
    } else {
        let _e273 = N_7;
        let _e274 = up_4;
        local_20 = (0.5f + (0.5f * dot(_e273, _e274)));
    }
    let _e279 = local_20;
    wrap_2 = _e279;
    let _e281 = kind_1;
    if (_e281 == 7f) {
        let _e284 = albedo_1;
        let _e288 = global.uSunE;
        let _e290 = sunT;
        let _e291 = ndl_1;
        let _e293 = N_7;
        let _e294 = p_1;
        let _e303 = selfShadow_1;
        let _e305 = skyE_3;
        return (((_e284 / vec3(3.1415927f)) * _e288) * ((((_e290 * _e291) * pow(max(dot(_e293, normalize(-(_e294))), 0f), 0.15f)) * _e303) + (_e305 * 0.6f)));
    }
    let _e310 = global.uSunE;
    let _e311 = sunT;
    let _e313 = ndl_1;
    let _e314 = trans_3;
    let _e315 = nd_1;
    direct = ((_e310 * _e311) * (_e313 + (_e314 * max(-(_e315), 0f))));
    let _e323 = p_1;
    let _e324 = skyBlocked(_e323);
    skyBl = _e324;
    let _e326 = screenAO_1;
    let _e328 = skyBl;
    let _e331 = kind_1;
    if (_e331 == 1f) {
        let _e334 = p_1;
        let _e335 = trunkSum(_e334);
        local_21 = exp(-(_e335));
    } else {
        let _e338 = p_1;
        let _e339 = trunkSky(_e338);
        local_21 = _e339;
    }
    let _e341 = local_21;
    skyK_2 = ((_e326 * (1f - _e328)) * _e341);
    let _e344 = global.uSunE;
    let _e345 = skyE_3;
    let _e346 = wrap_2;
    let _e348 = skyK_2;
    let _e350 = skyBl;
    let _e351 = sunTop_2;
    let _e352 = muS_4;
    let _e353 = skyE_3;
    let _e354 = canopyLit(_e350, _e351, _e352, _e353);
    let _e355 = screenAO_1;
    let _e359 = global.uAmbientFloor;
    let _e360 = screenAO_1;
    let _e363 = rel_6;
    let _e364 = r_12;
    let _e365 = up_4;
    let _e366 = N_7;
    let _e367 = keySh;
    let _e368 = trans_3;
    let _e369 = wrap_2;
    let _e370 = skyK_2;
    let _e371 = moonLit(_e363, _e364, _e365, _e366, _e367, _e368, _e369, _e370);
    ambient = (((_e344 * (((_e345 * _e346) * _e348) + (_e354 * _e355))) + (_e359 * _e360)) + _e371);
    let _e374 = kind_1;
    if (_e374 == 3f) {
        local_22 = 0f;
    } else {
        let _e378 = p_1;
        let _e379 = grassCover(_e378);
        local_22 = _e379;
    }
    let _e381 = local_22;
    gSum = _e381;
    let _e385 = gSum;
    gCov = exp((-2.2f * _e385));
    let _e389 = direct;
    let _e390 = gCov;
    let _e391 = selfShadow_1;
    direct = (_e389 * (_e390 * _e391));
    let _e394 = ambient;
    let _e400 = gSum;
    ambient = (_e394 * (1f - (0.35f * (1f - exp((-0.8f * _e400))))));
    let _e407 = albedo_1;
    let _e409 = metal_1;
    diffuse = (_e407 * (1f - _e409));
    let _e413 = diffuse;
    let _e417 = direct;
    let _e419 = ao_1;
    let _e423 = ambient;
    let _e424 = ao_1;
    let _e428 = cave_1;
    color = (((_e413 / vec3(3.1415927f)) * ((_e417 * mix(1f, _e419, 0.35f)) + (_e423 * _e424))) * _e428);
    let _e431 = p_1;
    V = normalize(-(_e431));
    let _e435 = V;
    let _e436 = global.uSunDir;
    H_1 = normalize((_e435 + _e436));
    let _e440 = roughness_1;
    let _e442 = wet_1;
    rg = clamp(mix(_e440, 0.12f, (_e442 * 0.8f)), 0.05f, 1f);
    let _e450 = rg;
    let _e451 = rg;
    let _e453 = rg;
    let _e455 = rg;
    a2_ = (((_e450 * _e451) * _e453) * _e455);
    let _e458 = N_7;
    let _e459 = H_1;
    NdH = max(dot(_e458, _e459), 0f);
    let _e464 = N_7;
    let _e465 = V;
    NdV = max(dot(_e464, _e465), 0.001f);
    let _e470 = V;
    let _e471 = H_1;
    VdH = max(dot(_e470, _e471), 0f);
    let _e476 = a2_;
    let _e477 = NdH;
    let _e478 = NdH;
    let _e480 = a2_;
    Dg = (_e476 / (PI * pow((((_e477 * _e478) * (_e480 - 1f)) + 1f), 2f)));
    let _e491 = rg;
    let _e494 = rg;
    kk = (((_e491 + 1f) * (_e494 + 1f)) / 8f);
    let _e501 = NdV;
    let _e502 = NdV;
    let _e504 = kk;
    let _e507 = kk;
    let _e510 = ndl_1;
    let _e512 = ndl_1;
    let _e514 = kk;
    let _e517 = kk;
    Gg = (((_e501 / ((_e502 * (1f - _e504)) + _e507)) * _e510) / ((_e512 * (1f - _e514)) + _e517));
    let _e521 = f0_2;
    let _e523 = f0_2;
    let _e526 = VdH;
    Fs = (_e521 + ((1f - _e523) * pow((1f - _e526), 5f)));
    let _e533 = kind_1;
    if (_e533 != 2f) {
        let _e536 = color;
        let _e537 = global.uSunE;
        let _e538 = sunT;
        let _e540 = gCov;
        let _e542 = selfShadow_1;
        let _e544 = Dg;
        let _e546 = Gg;
        let _e548 = Fs;
        let _e550 = albedo_1;
        let _e553 = albedo_1;
        let _e556 = VdH;
        let _e562 = metal_1;
        let _e567 = NdV;
        color = (_e536 + (((((((_e537 * _e538) * _e540) * _e542) * _e544) * _e546) * mix(vec3(_e548), (_e550 + ((vec3(1f) - _e553) * pow((1f - _e556), 5f))), vec3(_e562))) / vec3((4f * _e567))));
    }
    let _e572 = color;
    let _e573 = global.uSunE;
    let _e574 = sunT;
    let _e576 = gCov;
    let _e578 = glint;
    color = (_e572 + (((_e573 * _e574) * _e576) * _e578));
    let _e583 = wet_1;
    poolK = smoothstep(0.85f, 1f, _e583);
    let _e586 = poolK;
    if (_e586 > 0f) {
        {
            let _e589 = up_4;
            let _e590 = V;
            cP = max(dot(_e589, _e590), 0.001f);
            let _e598 = cP;
            Fp = (0.02f + (0.98f * pow((1f - _e598), 5f)));
            let _e605 = color;
            let _e606 = color;
            let _e608 = Fp;
            let _e611 = global.uSunE;
            let _e612 = skyE_3;
            let _e619 = Fp;
            let _e621 = screenAO_1;
            let _e624 = global.uSunE;
            let _e625 = sunT;
            let _e629 = V;
            let _e631 = up_4;
            let _e633 = global.uSunDir;
            let _e641 = poolK;
            color = mix(_e605, (((_e606 * (1f - _e608)) + (((((_e611 * _e612) / vec3(3.1415927f)) * 1.1f) * _e619) * _e621)) + (((_e624 * _e625) * 0.05f) * pow(max(dot(reflect(-(_e629), _e631), _e633), 0f), 200f))), vec3(_e641));
        }
    }
    let _e644 = global.uThermal;
    if (_e644.x > 0f) {
        {
            let _e648 = albedo_1;
            a_7 = clamp(_e648, vec3(0f), vec3(1f));
            let _e655 = color;
            let _e658 = a_7;
            let _e660 = global.uThermal;
            let _e662 = global.uThermal;
            let _e664 = r_12;
            let _e665 = global.uRadius;
            let _e669 = blackbodyGlow((_e660.x - (_e662.y * (_e664 - _e665))));
            color = (_e655 + ((vec3(1f) - _e658) * _e669));
            let _e672 = color;
            let _e673 = a_7;
            let _e676 = r_12;
            let _e678 = atmoSunTransmittance(_e676, 1f);
            let _e681 = global.uThermal;
            let _e683 = global.uThermal;
            let _e685 = r_12;
            let _e686 = global.uRadius;
            let _e692 = blackbodyGlow((_e681.x - (_e683.z * max((_e685 - _e686), 0f))));
            color = (_e672 + ((_e673 * (vec3(1f) - _e678)) * _e692));
        }
    }
    let _e695 = color;
    return _e695;
}

fn main_1() {
    let _e174 = deferredLight(vec3<f32>(0f, 0f, -1f), vec3<f32>(0f, 1f, 0f), vec3(1f), 0.8f, 1f, 0f, 0.04f, 1f, 0f, 1f, 0f, 0f, 1f, 1f);
    fragmentColor = vec4<f32>(_e174.x, _e174.y, _e174.z, 1f);
    return;
}

`;
