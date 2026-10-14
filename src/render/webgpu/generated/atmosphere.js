// Generated offline from the existing renderer equations. See tools/shaders/.
export const layout = {
  "uniforms": [
    {
      "name": "uDepthMode",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 0
    },
    {
      "name": "uNear",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 4
    },
    {
      "name": "uFar",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 8
    },
    {
      "name": "uLogDepthFC",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 12
    },
    {
      "name": "uBottom",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 16
    },
    {
      "name": "uTop",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 20
    },
    {
      "name": "uRadius",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 24
    },
    {
      "name": "uRayleigh",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 32
    },
    {
      "name": "uRayleighH",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 44
    },
    {
      "name": "uMie",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 48
    },
    {
      "name": "uMieAbs",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 64
    },
    {
      "name": "uMieH",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 76
    },
    {
      "name": "uMieG",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 80
    },
    {
      "name": "uMieF",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 96
    },
    {
      "name": "uMieGL",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 112
    },
    {
      "name": "uAbs",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 128
    },
    {
      "name": "uAbsCenter",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 140
    },
    {
      "name": "uAbsWidth",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 144
    },
    {
      "name": "uAbsExp",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 148
    },
    {
      "name": "uHaze",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 160
    },
    {
      "name": "uHazeCol",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 176
    },
    {
      "name": "uKnee",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 188
    },
    {
      "name": "uUpper",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 192
    },
    {
      "name": "uTrueK",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 196
    },
    {
      "name": "uSunLift",
      "type": "vec2",
      "count": 0,
      "align": 8,
      "size": 8,
      "stride": 8,
      "offset": 200
    },
    {
      "name": "uGround",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 208
    },
    {
      "name": "uSkyView",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 224
    },
    {
      "name": "uSkyUp",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 240
    },
    {
      "name": "uSkySunH",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 256
    },
    {
      "name": "uCenter",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 272
    },
    {
      "name": "uSunDir",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 288
    },
    {
      "name": "uSunE",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 304
    },
    {
      "name": "uMoonDir",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 320
    },
    {
      "name": "uMoonE",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 336
    },
    {
      "name": "uCamRot",
      "type": "mat3",
      "count": 0,
      "align": 16,
      "size": 48,
      "stride": 48,
      "offset": 352
    },
    {
      "name": "uTanHalf",
      "type": "vec2",
      "count": 0,
      "align": 8,
      "size": 8,
      "stride": 8,
      "offset": 400
    },
    {
      "name": "uToFixed",
      "type": "mat3",
      "count": 0,
      "align": 16,
      "size": 48,
      "stride": 48,
      "offset": 416
    },
    {
      "name": "uTime",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 464
    },
    {
      "name": "uCloud",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 480
    },
    {
      "name": "uCloudColor",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 496
    },
    {
      "name": "uCloudOn",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 512
    },
    {
      "name": "uCloudMapMean",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 516
    },
    {
      "name": "uSteps",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 520
    },
    {
      "name": "uExposureHint",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 524
    },
    {
      "name": "uWindMax",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 528
    },
    {
      "name": "uAurora",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 544
    },
    {
      "name": "uAuroraLo",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 560
    },
    {
      "name": "uAuroraHi",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 576
    },
    {
      "name": "uAirglowCol",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 592
    },
    {
      "name": "uMagAxis",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 608
    },
    {
      "name": "uThermal",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 624
    },
    {
      "name": "uHeightCube",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 640
    },
    {
      "name": "uCloudYear",
      "type": "vec2",
      "count": 0,
      "align": 8,
      "size": 8,
      "stride": 8,
      "offset": 656
    },
    {
      "name": "uCloudClock",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 672
    },
    {
      "name": "uCloudWind",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 688
    }
  ],
  "textures": [
    {
      "name": "tTrans",
      "type": "sampler2D",
      "count": 0,
      "binding": 1,
      "samplerBinding": 2
    },
    {
      "name": "tMS",
      "type": "sampler2D",
      "count": 0,
      "binding": 3,
      "samplerBinding": 4
    },
    {
      "name": "tSkyView",
      "type": "sampler2D",
      "count": 0,
      "binding": 5,
      "samplerBinding": 6
    },
    {
      "name": "tColor",
      "type": "sampler2D",
      "count": 0,
      "binding": 7,
      "samplerBinding": 8
    },
    {
      "name": "tDepth",
      "type": "sampler2D",
      "count": 0,
      "binding": 9,
      "samplerBinding": 10
    },
    {
      "name": "tCloudMap",
      "type": "sampler2D",
      "count": 0,
      "binding": 11,
      "samplerBinding": 12
    },
    {
      "name": "tNoise",
      "type": "sampler3D",
      "count": 0,
      "binding": 13,
      "samplerBinding": 14
    },
    {
      "name": "tHeightCube",
      "type": "sampler2DArray",
      "count": 0,
      "binding": 15,
      "samplerBinding": 16
    }
  ],
  "bytes": 704,
  "group": 0,
  "attributes": []
};
export const code = /* wgsl */`
struct Params {
    uDepthMode: f32,
    uNear: f32,
    uFar: f32,
    uLogDepthFC: f32,
    uBottom: f32,
    uTop: f32,
    uRadius: f32,
    uRayleigh: vec3<f32>,
    uRayleighH: f32,
    uMie: vec3<f32>,
    uMieAbs: vec3<f32>,
    uMieH: f32,
    uMieG: vec3<f32>,
    uMieF: vec3<f32>,
    uMieGL: vec3<f32>,
    uAbs: vec3<f32>,
    uAbsCenter: f32,
    uAbsWidth: f32,
    uAbsExp: f32,
    uHaze: vec4<f32>,
    uHazeCol: vec3<f32>,
    uKnee: f32,
    uUpper: f32,
    uTrueK: f32,
    uSunLift: vec2<f32>,
    uGround: f32,
    uSkyView: vec4<f32>,
    uSkyUp: vec3<f32>,
    uSkySunH: vec3<f32>,
    uCenter: vec3<f32>,
    uSunDir: vec3<f32>,
    uSunE: vec3<f32>,
    uMoonDir: vec3<f32>,
    uMoonE: vec3<f32>,
    uCamRot: mat3x3<f32>,
    uTanHalf: vec2<f32>,
    uToFixed: mat3x3<f32>,
    uTime: f32,
    uCloud: vec4<f32>,
    uCloudColor: vec4<f32>,
    uCloudOn: f32,
    uCloudMapMean: f32,
    uSteps: f32,
    uExposureHint: f32,
    uWindMax: f32,
    uAurora: vec4<f32>,
    uAuroraLo: vec3<f32>,
    uAuroraHi: vec3<f32>,
    uAirglowCol: vec3<f32>,
    uMagAxis: vec3<f32>,
    uThermal: vec4<f32>,
    uHeightCube: vec4<f32>,
    uCloudYear: vec2<f32>,
    uCloudClock: vec4<f32>,
    uCloudWind: vec4<f32>,
}

struct FragmentOutput {
    @location(0) outL: vec4<f32>,
    @location(1) outT: vec4<f32>,
}

const PI_A: f32 = 3.1415927f;
const NROT: mat3x3<f32> = mat3x3<f32>(vec3<f32>(0f, 0.8f, 0.6f), vec3<f32>(-0.8f, 0.36f, -0.48f), vec3<f32>(-0.6f, -0.48f, 0.64f));
const HC_N: array<vec3<f32>, 6> = array<vec3<f32>, 6>(vec3<f32>(1f, 0f, 0f), vec3<f32>(-1f, 0f, 0f), vec3<f32>(0f, 1f, 0f), vec3<f32>(0f, -1f, 0f), vec3<f32>(0f, 0f, 1f), vec3<f32>(0f, 0f, -1f));
const HC_U: array<vec3<f32>, 6> = array<vec3<f32>, 6>(vec3<f32>(0f, 0f, -1f), vec3<f32>(0f, 0f, 1f), vec3<f32>(1f, 0f, 0f), vec3<f32>(1f, 0f, 0f), vec3<f32>(1f, 0f, 0f), vec3<f32>(-1f, 0f, 0f));
const HC_V: array<vec3<f32>, 6> = array<vec3<f32>, 6>(vec3<f32>(0f, 1f, 0f), vec3<f32>(0f, 1f, 0f), vec3<f32>(0f, 0f, -1f), vec3<f32>(0f, 0f, 1f), vec3<f32>(0f, 1f, 0f), vec3<f32>(0f, 1f, 0f));

@group(0) @binding(0) 
var<uniform> global: Params;
@group(0) @binding(1) 
var tTransTexture: texture_2d<f32>;
@group(0) @binding(2) 
var tTransSampler: sampler;
@group(0) @binding(3) 
var tMSTexture: texture_2d<f32>;
@group(0) @binding(4) 
var tMSSampler: sampler;
@group(0) @binding(5) 
var tSkyViewTexture: texture_2d<f32>;
@group(0) @binding(6) 
var tSkyViewSampler: sampler;
@group(0) @binding(7) 
var tColorTexture: texture_2d<f32>;
@group(0) @binding(8) 
var tColorSampler: sampler;
@group(0) @binding(9) 
var tDepthTexture: texture_2d<f32>;
@group(0) @binding(10) 
var tDepthSampler: sampler;
@group(0) @binding(11) 
var tCloudMapTexture: texture_2d<f32>;
@group(0) @binding(12) 
var tCloudMapSampler: sampler;
@group(0) @binding(13) 
var tNoiseTexture: texture_3d<f32>;
@group(0) @binding(14) 
var tNoiseSampler: sampler;
@group(0) @binding(15) 
var tHeightCubeTexture: texture_2d_array<f32>;
@group(0) @binding(16) 
var tHeightCubeSampler: sampler;
var<private> gHazeK: f32 = 1f;
var<private> gHazeH: f32 = 1f;
var<private> gAirSun: f32 = 1f;
var<private> vUv_1: vec2<f32>;
var<private> gPixA: f32;
var<private> gEm: vec3<f32>;
var<private> outL: vec4<f32>;
var<private> outT: vec4<f32>;
var<private> gl_FragCoord_1: vec4<f32>;

fn raySphere(center: vec3<f32>, radius: f32, dir: vec3<f32>) -> vec2<f32> {
    var center_1: vec3<f32>;
    var radius_1: f32;
    var dir_1: vec3<f32>;
    var tca: f32;
    var perp: vec3<f32>;
    var h2_: f32;
    var r2_: f32;
    var thc: f32;

    center_1 = center;
    radius_1 = radius;
    dir_1 = dir;
    let _e132 = center_1;
    let _e133 = dir_1;
    tca = dot(_e132, _e133);
    let _e136 = center_1;
    let _e137 = tca;
    let _e138 = dir_1;
    perp = (_e136 - (_e137 * _e138));
    let _e142 = perp;
    let _e143 = perp;
    h2_ = dot(_e142, _e143);
    let _e146 = radius_1;
    let _e147 = radius_1;
    r2_ = (_e146 * _e147);
    let _e150 = h2_;
    let _e151 = r2_;
    if (_e150 > _e151) {
        return vec2<f32>(1f, -1f);
    }
    let _e157 = r2_;
    let _e158 = h2_;
    thc = sqrt((_e157 - _e158));
    let _e162 = tca;
    let _e163 = thc;
    let _e165 = tca;
    let _e166 = thc;
    return vec2<f32>((_e162 - _e163), (_e165 + _e166));
}

fn viewZFromDepth(d: f32) -> f32 {
    var d_1: f32;
    var c: f32;
    var dd: f32;

    d_1 = d;
    let _e128 = global.uDepthMode;
    if (_e128 < 0.5f) {
        {
            let _e131 = global.uNear;
            let _e132 = global.uFar;
            let _e133 = global.uNear;
            c = (_e131 / (_e132 - _e133));
            let _e137 = global.uFar;
            let _e138 = global.uNear;
            let _e140 = global.uFar;
            let _e141 = global.uNear;
            dd = ((_e137 * _e138) / (_e140 - _e141));
            let _e145 = dd;
            let _e146 = d_1;
            let _e147 = c;
            return (_e145 / max((_e146 + _e147), 0.000000000000000000000000000001f));
        }
    }
    let _e152 = d_1;
    let _e153 = global.uLogDepthFC;
    return (exp2((_e152 * _e153)) - 1f);
}

fn isSkyDepth(d_2: f32) -> bool {
    var d_3: f32;
    var local: bool;

    d_3 = d_2;
    let _e128 = global.uDepthMode;
    if (_e128 < 0.5f) {
        let _e131 = d_3;
        local = (_e131 <= 0f);
    } else {
        let _e134 = d_3;
        local = (_e134 >= 1f);
    }
    let _e138 = local;
    return _e138;
}

fn depthPixel(uv: vec2<f32>) -> vec2<i32> {
    var uv_1: vec2<f32>;

    uv_1 = uv;
    let _e128 = uv_1;
    let _e130 = textureDimensions(tDepthTexture, 0i);
    return vec2<i32>(((_e128 * vec2<f32>(vec2<i32>(_e130))) + vec2(0.25f)));
}

fn transmittanceUV(r: f32, mu: f32) -> vec2<f32> {
    var r_1: f32;
    var mu_1: f32;
    var H: f32;
    var rho: f32;
    var disc: f32;
    var d_4: f32;
    var dMin: f32;
    var dMax: f32;
    var xmu: f32;
    var xr: f32;

    r_1 = r;
    mu_1 = mu;
    let _e131 = global.uTop;
    let _e132 = global.uTop;
    let _e134 = global.uBottom;
    let _e135 = global.uBottom;
    H = sqrt(max(0f, ((_e131 * _e132) - (_e134 * _e135))));
    let _e142 = r_1;
    let _e143 = r_1;
    let _e145 = global.uBottom;
    let _e146 = global.uBottom;
    rho = sqrt(max(0f, ((_e142 * _e143) - (_e145 * _e146))));
    let _e152 = r_1;
    let _e153 = r_1;
    let _e155 = mu_1;
    let _e156 = mu_1;
    let _e161 = global.uTop;
    let _e162 = global.uTop;
    disc = (((_e152 * _e153) * ((_e155 * _e156) - 1f)) + (_e161 * _e162));
    let _e167 = r_1;
    let _e169 = mu_1;
    let _e171 = disc;
    d_4 = max(0f, ((-(_e167) * _e169) + sqrt(max(_e171, 0f))));
    let _e178 = global.uTop;
    let _e179 = r_1;
    dMin = (_e178 - _e179);
    let _e182 = rho;
    let _e183 = H;
    dMax = (_e182 + _e183);
    let _e186 = d_4;
    let _e187 = dMin;
    let _e189 = dMax;
    let _e190 = dMin;
    xmu = ((_e186 - _e187) / max((_e189 - _e190), 0.000001f));
    let _e196 = rho;
    let _e197 = H;
    xr = (_e196 / max(_e197, 0.000001f));
    let _e202 = xmu;
    let _e203 = xr;
    return vec2<f32>(_e202, _e203);
}

fn trueUp(p: vec3<f32>, r_2: f32, upC: vec3<f32>, k: f32) -> vec3<f32> {
    var p_1: vec3<f32>;
    var r_3: f32;
    var upC_1: vec3<f32>;
    var k_1: f32;

    p_1 = p;
    r_3 = r_2;
    upC_1 = upC;
    k_1 = k;
    let _e134 = upC_1;
    let _e135 = p_1;
    let _e136 = r_3;
    let _e140 = k_1;
    return normalize(mix(_e134, (_e135 / vec3(_e136)), vec3((1f / _e140))));
}

fn trueK(hc: f32) -> f32 {
    var hc_1: f32;

    hc_1 = hc;
    let _e128 = global.uTrueK;
    let _e134 = hc_1;
    return mix(max(_e128, 1f), 1f, smoothstep(20000f, 60000f, _e134));
}

fn lensTrueZ(zd: f32) -> f32 {
    var zd_1: f32;
    var hD: f32;
    var hT: f32;
    var local_1: f32;

    zd_1 = zd;
    let _e130 = global.uSunLift;
    hD = (1.5707963f + _e130.x);
    let _e135 = global.uSunLift;
    hT = (1.5707963f + _e135.y);
    let _e139 = zd_1;
    let _e140 = hD;
    if (_e139 <= _e140) {
        let _e142 = zd_1;
        let _e143 = hT;
        let _e145 = hD;
        local_1 = ((_e142 * _e143) / _e145);
    } else {
        let _e147 = hT;
        let _e148 = zd_1;
        let _e149 = hD;
        let _e152 = hT;
        let _e156 = hD;
        local_1 = (_e147 + (((_e148 - _e149) * (3.1415927f - _e152)) / (3.1415927f - _e156)));
    }
    let _e161 = local_1;
    return _e161;
}

fn liftMu(mu_2: f32) -> f32 {
    var mu_3: f32;

    mu_3 = mu_2;
    let _e129 = global.uSunLift;
    let _e131 = global.uSunLift;
    if (_e129.x <= _e131.y) {
        let _e134 = mu_3;
        return _e134;
    }
    let _e135 = mu_3;
    let _e141 = lensTrueZ(acos(clamp(_e135, -1f, 1f)));
    return cos(_e141);
}

fn mediumAt(r_4: f32, scatR: ptr<function, vec3<f32>>, scatM: ptr<function, vec3<f32>>, ext: ptr<function, vec3<f32>>) {
    var r_5: f32;
    var h: f32;
    var local_2: f32;
    var hr: f32;
    var dR: f32;
    var dM: f32;
    var local_3: f32;
    var dA: f32;
    var dH: vec3<f32>;

    r_5 = r_4;
    let _e135 = r_5;
    let _e136 = global.uRadius;
    h = (_e135 - _e136);
    let _e139 = h;
    let _e140 = global.uKnee;
    if (_e139 <= _e140) {
        let _e142 = h;
        local_2 = _e142;
    } else {
        let _e143 = global.uKnee;
        let _e144 = h;
        let _e145 = global.uKnee;
        let _e147 = global.uUpper;
        local_2 = (_e143 + ((_e144 - _e145) / _e147));
    }
    let _e151 = local_2;
    hr = _e151;
    let _e153 = hr;
    let _e155 = global.uRayleighH;
    dR = exp((-(_e153) / _e155));
    let _e159 = hr;
    let _e161 = global.uMieH;
    dM = exp((-(_e159) / _e161));
    let _e165 = global.uAbsExp;
    if (_e165 > 0.5f) {
        let _e168 = dR;
        local_3 = _e168;
    } else {
        let _e171 = h;
        let _e172 = global.uAbsCenter;
        let _e175 = global.uAbsWidth;
        local_3 = max(0f, (1f - (abs((_e171 - _e172)) / max(_e175, 1f))));
    }
    let _e182 = local_3;
    dA = _e182;
    let _e184 = global.uHaze;
    let _e186 = gHazeK;
    let _e188 = gHazeH;
    let _e190 = h;
    let _e194 = global.uHaze;
    let _e201 = global.uHazeCol;
    dH = ((((_e184.x * _e186) * _e188) * exp((-(max(_e190, 0f)) / max(_e194.y, 1f)))) * _e201);
    let _e204 = global.uRayleigh;
    let _e205 = dR;
    (*scatR) = (_e204 * _e205);
    let _e207 = global.uMie;
    let _e208 = dM;
    let _e210 = dH;
    (*scatM) = ((_e207 * _e208) + _e210);
    let _e212 = (*scatR);
    let _e213 = (*scatM);
    let _e215 = global.uMieAbs;
    let _e216 = dM;
    let _e219 = global.uAbs;
    let _e220 = dA;
    let _e223 = dH;
    let _e224 = global.uHaze;
    (*ext) = ((((_e212 + _e213) + (_e215 * _e216)) + (_e219 * _e220)) + (_e223 * _e224.z));
    return;
}

fn realH(h_1: f32) -> f32 {
    var h_2: f32;
    var local_4: f32;

    h_2 = h_1;
    let _e132 = h_2;
    let _e133 = global.uKnee;
    if (_e132 <= _e133) {
        let _e135 = h_2;
        local_4 = _e135;
    } else {
        let _e136 = global.uKnee;
        let _e137 = h_2;
        let _e138 = global.uKnee;
        let _e140 = global.uUpper;
        local_4 = (_e136 + ((_e137 - _e138) / _e140));
    }
    let _e144 = local_4;
    return _e144;
}

fn drawnH(hr_1: f32) -> f32 {
    var hr_2: f32;
    var local_5: f32;

    hr_2 = hr_1;
    let _e132 = hr_2;
    let _e133 = global.uKnee;
    if (_e132 <= _e133) {
        let _e135 = hr_2;
        local_5 = _e135;
    } else {
        let _e136 = global.uKnee;
        let _e137 = hr_2;
        let _e138 = global.uKnee;
        let _e140 = global.uUpper;
        local_5 = (_e136 + ((_e137 - _e138) * _e140));
    }
    let _e144 = local_5;
    return _e144;
}

fn mediumAtReal(hr_3: f32, scatR_1: ptr<function, vec3<f32>>, scatM_1: ptr<function, vec3<f32>>, ext_1: ptr<function, vec3<f32>>) {
    var hr_4: f32;
    var h_3: f32;
    var dR_1: f32;
    var dM_1: f32;
    var local_6: f32;
    var dA_1: f32;
    var dH_1: vec3<f32>;

    hr_4 = hr_3;
    let _e135 = hr_4;
    let _e136 = drawnH(_e135);
    h_3 = _e136;
    let _e138 = hr_4;
    let _e140 = global.uRayleighH;
    dR_1 = exp((-(_e138) / _e140));
    let _e144 = hr_4;
    let _e146 = global.uMieH;
    dM_1 = exp((-(_e144) / _e146));
    let _e150 = global.uAbsExp;
    if (_e150 > 0.5f) {
        let _e153 = dR_1;
        local_6 = _e153;
    } else {
        let _e156 = h_3;
        let _e157 = global.uAbsCenter;
        let _e160 = global.uAbsWidth;
        local_6 = max(0f, (1f - (abs((_e156 - _e157)) / max(_e160, 1f))));
    }
    let _e167 = local_6;
    dA_1 = _e167;
    let _e169 = global.uHaze;
    let _e171 = gHazeK;
    let _e173 = hr_4;
    let _e177 = global.uHaze;
    let _e184 = global.uHazeCol;
    dH_1 = (((_e169.x * _e171) * exp((-(max(_e173, 0f)) / max(_e177.y, 1f)))) * _e184);
    let _e187 = global.uRayleigh;
    let _e188 = dR_1;
    (*scatR_1) = (_e187 * _e188);
    let _e190 = global.uMie;
    let _e191 = dM_1;
    let _e193 = dH_1;
    (*scatM_1) = ((_e190 * _e191) + _e193);
    let _e195 = (*scatR_1);
    let _e196 = (*scatM_1);
    let _e198 = global.uMieAbs;
    let _e199 = dM_1;
    let _e202 = global.uAbs;
    let _e203 = dA_1;
    let _e206 = dH_1;
    let _e207 = global.uHaze;
    (*ext_1) = ((((_e195 + _e196) + (_e198 * _e199)) + (_e202 * _e203)) + (_e206 * _e207.z));
    return;
}

fn phaseRayleigh(c_1: f32) -> f32 {
    var c_2: f32;

    c_2 = c_1;
    let _e138 = c_2;
    let _e139 = c_2;
    return (0.059683103f * (1f + (_e138 * _e139)));
}

fn phaseCS(c_3: f32, g: f32) -> f32 {
    var c_4: f32;
    var g_1: f32;
    var g2_: f32;

    c_4 = c_3;
    g_1 = g;
    let _e134 = g_1;
    let _e135 = g_1;
    g2_ = (_e134 * _e135);
    let _e144 = g2_;
    let _e147 = c_4;
    let _e148 = c_4;
    let _e154 = g2_;
    let _e157 = g2_;
    let _e160 = g_1;
    let _e162 = c_4;
    return ((0.119366206f * ((1f - _e144) * (1f + (_e147 * _e148)))) / ((2f + _e154) * pow(max(((1f + _e157) - ((2f * _e160) * _e162)), 0.0001f), 1.5f)));
}

fn phaseHG(c_5: f32, g_2: f32) -> f32 {
    var c_6: f32;
    var g_3: f32;

    c_6 = c_5;
    g_3 = g_2;
    let _e135 = g_3;
    let _e136 = g_3;
    let _e143 = g_3;
    let _e144 = g_3;
    let _e148 = g_3;
    let _e150 = c_6;
    return ((1f - (_e135 * _e136)) / (12.566371f * pow(max(((1f + (_e143 * _e144)) - ((2f * _e148) * _e150)), 0.000001f), 1.5f)));
}

fn phaseMie(c_7: f32) -> vec3<f32> {
    var c_8: f32;

    c_8 = c_7;
    let _e132 = c_8;
    let _e133 = global.uMieG;
    let _e135 = phaseCS(_e132, _e133.x);
    let _e136 = c_8;
    let _e137 = global.uMieG;
    let _e139 = phaseCS(_e136, _e137.y);
    let _e140 = c_8;
    let _e141 = global.uMieG;
    let _e143 = phaseCS(_e140, _e141.z);
    let _e145 = c_8;
    let _e146 = global.uMieGL;
    let _e148 = phaseHG(_e145, _e146.x);
    let _e149 = c_8;
    let _e150 = global.uMieGL;
    let _e152 = phaseHG(_e149, _e150.y);
    let _e153 = c_8;
    let _e154 = global.uMieGL;
    let _e156 = phaseHG(_e153, _e154.z);
    let _e158 = global.uMieF;
    return mix(vec3<f32>(_e135, _e139, _e143), vec3<f32>(_e148, _e152, _e156), _e158);
}

fn distToTop(r_6: f32, mu_4: f32) -> f32 {
    var r_7: f32;
    var mu_5: f32;
    var disc_1: f32;

    r_7 = r_6;
    mu_5 = mu_4;
    let _e134 = r_7;
    let _e135 = r_7;
    let _e137 = mu_5;
    let _e138 = mu_5;
    let _e143 = global.uTop;
    let _e144 = global.uTop;
    disc_1 = (((_e134 * _e135) * ((_e137 * _e138) - 1f)) + (_e143 * _e144));
    let _e149 = r_7;
    let _e151 = mu_5;
    let _e153 = disc_1;
    return max(0f, ((-(_e149) * _e151) + sqrt(max(_e153, 0f))));
}

fn hitsGround(r_8: f32, mu_6: f32, gr: f32) -> bool {
    var r_9: f32;
    var mu_7: f32;
    var gr_1: f32;

    r_9 = r_8;
    mu_7 = mu_6;
    gr_1 = gr;
    let _e136 = mu_7;
    let _e139 = r_9;
    let _e140 = r_9;
    let _e142 = mu_7;
    let _e143 = mu_7;
    let _e148 = gr_1;
    let _e149 = gr_1;
    return ((_e136 < 0f) && ((((_e139 * _e140) * ((_e142 * _e143) - 1f)) + (_e148 * _e149)) >= 0f));
}

fn transmittanceToTop(r_10: f32, mu_8: f32) -> vec3<f32> {
    var r_11: f32;
    var mu_9: f32;
    var uv_2: vec2<f32>;

    r_11 = r_10;
    mu_9 = mu_8;
    let _e134 = r_11;
    let _e135 = global.uBottom;
    let _e136 = global.uTop;
    let _e138 = mu_9;
    let _e139 = transmittanceUV(clamp(_e134, _e135, _e136), _e138);
    uv_2 = _e139;
    let _e148 = uv_2;
    uv_2 = (vec2<f32>(0.001953125f, 0.0078125f) + (_e148 * vec2<f32>(0.99609375f, 0.984375f)));
    let _e158 = uv_2;
    let _e160 = textureSampleLevel(tTransTexture, tTransSampler, _e158, 0f);
    return _e160.xyz;
}

fn sunTransmittance(r_12: f32, mu_10: f32) -> vec3<f32> {
    var r_13: f32;
    var mu_11: f32;
    var Rg: f32;
    var sinH: f32;
    var cosH: f32;
    var vis: f32;

    r_13 = r_12;
    mu_11 = mu_10;
    let _e134 = mu_11;
    let _e135 = liftMu(_e134);
    mu_11 = _e135;
    let _e136 = global.uGround;
    let _e137 = global.uTrueK;
    Rg = (_e136 * max(_e137, 1f));
    let _e142 = Rg;
    let _e143 = Rg;
    let _e144 = r_13;
    let _e145 = global.uGround;
    sinH = (_e142 / (_e143 + max((_e144 - _e145), 0f)));
    let _e154 = sinH;
    let _e155 = sinH;
    cosH = -(sqrt(max(0f, (1f - (_e154 * _e155)))));
    let _e162 = cosH;
    let _e165 = cosH;
    let _e168 = mu_11;
    vis = smoothstep((_e162 - 0.004f), (_e165 + 0.004f), _e168);
    let _e171 = r_13;
    let _e172 = mu_11;
    let _e173 = transmittanceToTop(_e171, _e172);
    let _e174 = vis;
    return (_e173 * _e174);
}

fn sunAtTrue(rK: f32, Rk: f32, mu_12: f32) -> vec3<f32> {
    var rK_1: f32;
    var Rk_1: f32;
    var mu_13: f32;
    var rD: f32;
    var gK: f32;
    var sinH_1: f32;
    var cosH_1: f32;

    rK_1 = rK;
    Rk_1 = Rk;
    mu_13 = mu_12;
    let _e136 = global.uRadius;
    let _e137 = rK_1;
    let _e138 = Rk_1;
    let _e140 = drawnH((_e137 - _e138));
    rD = (_e136 + _e140);
    let _e143 = Rk_1;
    let _e144 = global.uGround;
    let _e145 = global.uRadius;
    let _e147 = realH((_e144 - _e145));
    gK = (_e143 + _e147);
    let _e150 = gK;
    let _e151 = rK_1;
    let _e152 = gK;
    sinH_1 = (_e150 / max(_e151, _e152));
    let _e158 = sinH_1;
    let _e159 = sinH_1;
    cosH_1 = -(sqrt(max(0f, (1f - (_e158 * _e159)))));
    let _e166 = rD;
    let _e167 = global.uBottom;
    let _e168 = global.uTop;
    let _e170 = mu_13;
    let _e171 = transmittanceToTop(clamp(_e166, _e167, _e168), _e170);
    let _e172 = cosH_1;
    let _e175 = cosH_1;
    let _e178 = mu_13;
    return (_e171 * smoothstep((_e172 - 0.004f), (_e175 + 0.004f), _e178));
}

fn multiScatterAt(r_14: f32, muT: f32) -> vec3<f32> {
    var r_15: f32;
    var muT_1: f32;
    var uv_3: vec2<f32>;

    r_15 = r_14;
    muT_1 = muT;
    let _e134 = muT_1;
    let _e139 = r_15;
    let _e140 = global.uBottom;
    let _e142 = global.uTop;
    let _e143 = global.uBottom;
    uv_3 = vec2<f32>(((_e134 * 0.5f) + 0.5f), ((_e139 - _e140) / (_e142 - _e143)));
    let _e148 = uv_3;
    uv_3 = clamp(_e148, vec2(0f), vec2(1f));
    let _e158 = uv_3;
    uv_3 = (vec2(0.015625f) + (_e158 * 0.96875f));
    let _e164 = uv_3;
    let _e166 = textureSampleLevel(tMSTexture, tMSSampler, _e164, 0f);
    return _e166.xyz;
}

fn multiScatter(r_16: f32, muS: f32) -> vec3<f32> {
    var r_17: f32;
    var muS_1: f32;

    r_17 = r_16;
    muS_1 = muS;
    let _e134 = r_17;
    let _e135 = muS_1;
    let _e136 = liftMu(_e135);
    let _e137 = multiScatterAt(_e134, _e136);
    return _e137;
}

fn skyTrueEl(e: f32) -> f32 {
    var e_1: f32;
    var zd_2: f32;
    var hD_1: f32;
    var hT_1: f32;
    var local_7: f32;

    e_1 = e;
    let _e132 = global.uSkyView;
    let _e134 = global.uSkyView;
    if (_e132.y <= _e134.z) {
        let _e137 = e_1;
        return _e137;
    }
    let _e139 = e_1;
    zd_2 = (1.5707963f - _e139);
    let _e143 = global.uSkyView;
    hD_1 = (1.5707963f + _e143.y);
    let _e148 = global.uSkyView;
    hT_1 = (1.5707963f + _e148.z);
    let _e153 = zd_2;
    let _e154 = hD_1;
    if (_e153 <= _e154) {
        let _e156 = zd_2;
        let _e157 = hT_1;
        let _e159 = hD_1;
        local_7 = ((_e156 * _e157) / _e159);
    } else {
        let _e161 = hT_1;
        let _e162 = zd_2;
        let _e163 = hD_1;
        let _e166 = hT_1;
        let _e170 = hD_1;
        local_7 = (_e161 + (((_e162 - _e163) * (3.1415927f - _e166)) / (3.1415927f - _e170)));
    }
    let _e175 = local_7;
    return (1.5707963f - _e175);
}

fn skyFar(D: vec3<f32>) -> vec3<f32> {
    var D_1: vec3<f32>;
    var s: f32;
    var el: f32;
    var hD_2: vec3<f32>;
    var hl: f32;
    var local_8: f32;
    var az: f32;
    var v: f32;

    D_1 = D;
    let _e132 = global.uSkyView;
    if (_e132.x <= 0f) {
        return vec3(0f);
    }
    let _e138 = D_1;
    let _e139 = global.uSkyUp;
    s = clamp(dot(_e138, _e139), -1f, 1f);
    let _e146 = s;
    let _e148 = skyTrueEl(asin(_e146));
    el = _e148;
    let _e150 = D_1;
    let _e151 = global.uSkyUp;
    let _e152 = s;
    hD_2 = (_e150 - (_e151 * _e152));
    let _e156 = hD_2;
    hl = length(_e156);
    let _e159 = hl;
    if (_e159 > 0.00001f) {
        let _e162 = hD_2;
        let _e163 = hl;
        let _e166 = global.uSkySunH;
        local_8 = acos(clamp(dot((_e162 / vec3(_e163)), _e166), -1f, 1f));
    } else {
        local_8 = 0f;
    }
    let _e175 = local_8;
    az = _e175;
    let _e179 = el;
    let _e182 = el;
    v = (0.5f + ((0.5f * sign(_e179)) * sqrt((abs(_e182) / 1.5707963f))));
    let _e190 = az;
    let _e193 = v;
    let _e196 = textureSampleLevel(tSkyViewTexture, tSkyViewSampler, vec2<f32>((_e190 / 3.1415927f), _e193), 0f);
    let _e198 = global.uSkyView;
    return (_e196.xyz * _e198.x);
}

fn hash13_(p3_: vec3<f32>) -> f32 {
    var p3_1: vec3<f32>;

    p3_1 = p3_;
    let _e132 = p3_1;
    p3_1 = fract((_e132 * 0.1031f));
    let _e136 = p3_1;
    let _e137 = p3_1;
    let _e138 = p3_1;
    p3_1 = (_e136 + vec3(dot(_e137, (_e138.zyx + vec3(31.32f)))));
    let _e146 = p3_1;
    let _e148 = p3_1;
    let _e151 = p3_1;
    return fract(((_e146.x + _e148.y) * _e151.z));
}

fn vnoise(p_2: vec3<f32>) -> f32 {
    var p_3: vec3<f32>;
    var i: vec3<f32>;
    var f: vec3<f32>;
    var u: vec3<f32>;
    var n000_: f32;
    var n100_: f32;
    var n010_: f32;
    var n110_: f32;
    var n001_: f32;
    var n101_: f32;
    var n011_: f32;
    var n111_: f32;

    p_3 = p_2;
    let _e132 = p_3;
    i = floor(_e132);
    let _e135 = p_3;
    f = fract(_e135);
    let _e138 = f;
    let _e139 = f;
    let _e143 = f;
    u = ((_e138 * _e139) * (vec3(3f) - (2f * _e143)));
    let _e149 = i;
    let _e150 = hash13_(_e149);
    n000_ = _e150;
    let _e152 = i;
    let _e161 = hash13_((_e152 + vec3<f32>(1f, 0f, 0f)));
    n100_ = _e161;
    let _e163 = i;
    let _e172 = hash13_((_e163 + vec3<f32>(0f, 1f, 0f)));
    n010_ = _e172;
    let _e174 = i;
    let _e183 = hash13_((_e174 + vec3<f32>(1f, 1f, 0f)));
    n110_ = _e183;
    let _e185 = i;
    let _e194 = hash13_((_e185 + vec3<f32>(0f, 0f, 1f)));
    n001_ = _e194;
    let _e196 = i;
    let _e205 = hash13_((_e196 + vec3<f32>(1f, 0f, 1f)));
    n101_ = _e205;
    let _e207 = i;
    let _e216 = hash13_((_e207 + vec3<f32>(0f, 1f, 1f)));
    n011_ = _e216;
    let _e218 = i;
    let _e227 = hash13_((_e218 + vec3<f32>(1f, 1f, 1f)));
    n111_ = _e227;
    let _e229 = n000_;
    let _e230 = n100_;
    let _e231 = u;
    let _e234 = n010_;
    let _e235 = n110_;
    let _e236 = u;
    let _e239 = u;
    let _e242 = n001_;
    let _e243 = n101_;
    let _e244 = u;
    let _e247 = n011_;
    let _e248 = n111_;
    let _e249 = u;
    let _e252 = u;
    let _e255 = u;
    return ((mix(mix(mix(_e229, _e230, _e231.x), mix(_e234, _e235, _e236.x), _e239.y), mix(mix(_e242, _e243, _e244.x), mix(_e247, _e248, _e249.x), _e252.y), _e255.z) * 2f) - 1f);
}

fn fbm3_(p_4: vec3<f32>, oct: i32) -> f32 {
    var p_5: vec3<f32>;
    var oct_1: i32;
    var s_1: f32 = 0f;
    var a: f32 = 0.5f;
    var i_1: i32 = 0i;

    p_5 = p_4;
    oct_1 = oct;
    loop {
        let _e141 = i_1;
        if !((_e141 < 8i)) {
            break;
        }
        {
            let _e148 = i_1;
            let _e149 = oct_1;
            if (_e148 >= _e149) {
                break;
            }
            let _e151 = s_1;
            let _e152 = a;
            let _e153 = p_5;
            let _e154 = vnoise(_e153);
            s_1 = (_e151 + (_e152 * _e154));
            let _e157 = p_5;
            p_5 = (((NROT * _e157) * 2.02f) + vec3(1.7f));
            let _e164 = a;
            a = (_e164 * 0.5f);
        }
        continuing {
            let _e145 = i_1;
            i_1 = (_e145 + 1i);
        }
    }
    let _e167 = s_1;
    return _e167;
}

fn ign(p_6: vec2<f32>) -> f32 {
    var p_7: vec2<f32>;

    p_7 = p_6;
    let _e135 = p_7;
    return fract((52.982918f * fract(dot(_e135, vec2<f32>(0.06711056f, 0.00583715f)))));
}

fn airLight(p_8: vec3<f32>, r_18: f32) -> vec3<f32> {
    var p_9: vec3<f32>;
    var r_19: f32;
    var hgt: f32;

    p_9 = p_8;
    r_19 = r_18;
    let _e137 = global.uAurora;
    if (_e137.w <= 0f) {
        return vec3(0f);
    }
    let _e143 = r_19;
    let _e144 = global.uRadius;
    let _e146 = global.uTop;
    let _e147 = global.uRadius;
    hgt = ((_e143 - _e144) / (_e146 - _e147));
    let _e151 = global.uAurora;
    let _e153 = hgt;
    let _e163 = global.uAirglowCol;
    let _e165 = global.uTop;
    let _e166 = global.uRadius;
    return (((_e151.w * exp(-(pow(((_e153 - 0.6f) / 0.03f), 2f)))) * _e163) / vec3((_e165 - _e166)));
}

fn auroraArcs(pf: vec3<f32>, blur: f32) -> f32 {
    var pf_1: vec3<f32>;
    var blur_1: f32;
    var ml: f32;
    var aml: f32;
    var band: f32;
    var local_9: vec3<f32>;
    var e1_: vec3<f32>;
    var e2_: vec3<f32>;
    var mlon: f32;
    var cs: vec2<f32>;
    var local_10: f32;
    var side: f32;
    var b: f32 = 0f;
    var j: i32 = 0i;
    var fj: f32;
    var wig: f32;
    var lineLat: f32;
    var w0_: f32;
    var w: f32;
    var d_5: f32;
    var arc: f32;
    var rays: f32;

    pf_1 = pf;
    blur_1 = blur;
    let _e137 = pf_1;
    let _e138 = global.uMagAxis;
    ml = asin(clamp(dot(_e137, _e138), -1f, 1f));
    let _e146 = ml;
    aml = abs(_e146);
    let _e149 = global.uAurora;
    if (_e149.y < 0f) {
        let _e154 = pf_1;
        let _e159 = global.uTime;
        let _e165 = textureSampleLevel(tNoiseTexture, tNoiseSampler, ((_e154 * 3f) + vec3<f32>(0f, 0f, (_e159 * 0.002f))), 0f);
        return (0.3f * _e165.x);
    }
    let _e168 = aml;
    let _e169 = global.uAurora;
    let _e172 = global.uAurora;
    band = exp(-(pow(((_e168 - _e169.y) / _e172.z), 2f)));
    let _e180 = band;
    if (_e180 < 0.02f) {
        return 0f;
    }
    let _e184 = global.uMagAxis;
    let _e185 = global.uMagAxis;
    if (abs(_e185.z) < 0.9f) {
        local_9 = vec3<f32>(0f, 0f, 1f);
    } else {
        local_9 = vec3<f32>(1f, 0f, 0f);
    }
    let _e199 = local_9;
    e1_ = normalize(cross(_e184, _e199));
    let _e203 = global.uMagAxis;
    let _e204 = e1_;
    e2_ = cross(_e203, _e204);
    let _e207 = pf_1;
    let _e208 = e2_;
    let _e210 = pf_1;
    let _e211 = e1_;
    mlon = atan2(dot(_e207, _e208), dot(_e210, _e211));
    let _e215 = mlon;
    let _e217 = mlon;
    cs = vec2<f32>(cos(_e215), sin(_e217));
    let _e221 = ml;
    if (_e221 > 0f) {
        local_10 = 0f;
    } else {
        local_10 = 5.3f;
    }
    let _e227 = local_10;
    side = _e227;
    loop {
        let _e233 = j;
        if !((_e233 < 2i)) {
            break;
        }
        {
            let _e240 = j;
            fj = f32(_e240);
            let _e243 = cs;
            let _e245 = (_e243 * 0.6f);
            let _e246 = side;
            let _e247 = fj;
            let _e251 = global.uTime;
            let _e259 = textureSampleLevel(tNoiseTexture, tNoiseSampler, vec3<f32>(_e245.x, _e245.y, ((_e246 + (_e247 * 2.7f)) + (_e251 * 0.0015f))), 0f);
            wig = (_e259.x - 0.5f);
            let _e264 = wig;
            let _e266 = cs;
            let _e268 = (_e266 * 2.3f);
            let _e269 = side;
            let _e270 = fj;
            let _e274 = global.uTime;
            let _e282 = textureSampleLevel(tNoiseTexture, tNoiseSampler, vec3<f32>(_e268.x, _e268.y, ((_e269 + (_e270 * 1.3f)) + (_e274 * 0.004f))), 0f);
            wig = (_e264 + (0.45f * (_e282.x - 0.5f)));
            let _e288 = global.uAurora;
            let _e290 = fj;
            let _e293 = global.uAurora;
            let _e299 = wig;
            let _e300 = global.uAurora;
            lineLat = ((_e288.y + (((_e290 - 0.5f) * _e293.z) * 0.9f)) + ((_e299 * _e300.z) * 2.2f));
            let _e307 = global.uAurora;
            w0_ = (_e307.z * 0.035f);
            let _e312 = w0_;
            let _e313 = w0_;
            let _e315 = blur_1;
            let _e316 = blur_1;
            w = sqrt(((_e312 * _e313) + (_e315 * _e316)));
            let _e321 = aml;
            let _e322 = lineLat;
            let _e324 = w;
            d_5 = ((_e321 - _e322) / _e324);
            let _e327 = d_5;
            let _e329 = d_5;
            let _e332 = w0_;
            let _e334 = w;
            arc = ((exp((-(_e327) * _e329)) * _e332) / _e334);
            let _e337 = arc;
            if (_e337 < 0.01f) {
                continue;
            }
            let _e340 = cs;
            let _e342 = (_e340 * 5f);
            let _e343 = side;
            let _e344 = fj;
            let _e348 = global.uTime;
            let _e356 = textureSampleLevel(tNoiseTexture, tNoiseSampler, vec3<f32>(_e342.x, _e342.y, ((_e343 + (_e344 * 0.61f)) + (_e348 * 0.02f))), 0f);
            rays = _e356.x;
            let _e359 = b;
            let _e360 = arc;
            let _e363 = rays;
            let _e365 = rays;
            b = (_e359 + (_e360 * (0.25f + ((1.8f * _e363) * _e365))));
        }
        continuing {
            let _e237 = j;
            j = (_e237 + 1i);
        }
    }
    let _e370 = b;
    let _e371 = band;
    return (_e370 * _e371);
}

fn auroraRay(D_2: vec3<f32>, tca_1: f32, perp_1: vec3<f32>, tMax: f32, jitter: f32, near: ptr<function, vec3<f32>>, far: ptr<function, vec3<f32>>) {
    var D_3: vec3<f32>;
    var tca_2: f32;
    var perp_2: vec3<f32>;
    var tMax_1: f32;
    var jitter_1: f32;
    var H_1: f32;
    var aLo: f32;
    var aHi: f32;
    var pp: f32;
    var K: i32 = 28i;
    var slab: f32;
    var i_2: i32 = 0i;
    var x: f32;
    var a_1: f32;
    var s_2: f32;
    var prof: f32;
    var col: vec3<f32>;
    var k_2: i32;
    var local_11: f32;
    var t: f32;
    var p_10: vec3<f32>;
    var mu_14: f32;
    var blur_2: f32;
    var b_1: f32;
    var e_2: vec3<f32>;

    D_3 = D_2;
    tca_2 = tca_1;
    perp_2 = perp_1;
    tMax_1 = tMax;
    jitter_1 = jitter;
    (*near) = vec3(0f);
    (*far) = vec3(0f);
    let _e149 = global.uAurora;
    if (_e149.x <= 0f) {
        return;
    }
    let _e153 = global.uTop;
    let _e154 = global.uRadius;
    H_1 = (_e153 - _e154);
    let _e157 = global.uRadius;
    let _e159 = H_1;
    aLo = (_e157 + (0.55f * _e159));
    let _e163 = global.uRadius;
    let _e165 = H_1;
    aHi = (_e163 + (0.98f * _e165));
    let _e169 = perp_2;
    let _e170 = perp_2;
    pp = dot(_e169, _e170);
    let _e173 = pp;
    let _e174 = aHi;
    let _e175 = aHi;
    if (_e173 >= (_e174 * _e175)) {
        return;
    }
    let _e180 = aHi;
    let _e181 = aLo;
    let _e183 = K;
    slab = ((_e180 - _e181) / f32(_e183));
    loop {
        let _e189 = i_2;
        let _e190 = K;
        if !((_e189 < _e190)) {
            break;
        }
        {
            let _e196 = i_2;
            let _e198 = jitter_1;
            let _e200 = K;
            x = ((f32(_e196) + _e198) / f32(_e200));
            let _e204 = aLo;
            let _e205 = aHi;
            let _e206 = x;
            a_1 = mix(_e204, _e205, _e206);
            let _e209 = pp;
            let _e210 = a_1;
            let _e211 = a_1;
            if (_e209 >= (_e210 * _e211)) {
                continue;
            }
            let _e214 = a_1;
            let _e215 = a_1;
            let _e217 = pp;
            s_2 = sqrt(((_e214 * _e215) - _e217));
            let _e223 = x;
            let _e227 = x;
            prof = (smoothstep(0f, 0.04f, _e223) * exp((-2.5f * _e227)));
            let _e232 = global.uAuroraLo;
            let _e233 = global.uAuroraHi;
            let _e236 = x;
            let _e240 = prof;
            let _e242 = global.uAurora;
            let _e245 = H_1;
            col = (((mix(_e232, _e233, vec3(smoothstep(0.3f, 0.85f, _e236))) * _e240) * _e242.x) / vec3(_e245));
            k_2 = 0i;
            loop {
                let _e251 = k_2;
                if !((_e251 < 2i)) {
                    break;
                }
                {
                    let _e258 = k_2;
                    if (_e258 == 0i) {
                        let _e261 = tca_2;
                        let _e262 = s_2;
                        local_11 = (_e261 - _e262);
                    } else {
                        let _e264 = tca_2;
                        let _e265 = s_2;
                        local_11 = (_e264 + _e265);
                    }
                    let _e268 = local_11;
                    t = _e268;
                    let _e270 = t;
                    let _e273 = t;
                    let _e274 = tMax_1;
                    if ((_e270 <= 0f) || (_e273 >= _e274)) {
                        continue;
                    }
                    let _e277 = t;
                    let _e278 = tca_2;
                    let _e280 = D_3;
                    let _e282 = perp_2;
                    p_10 = (((_e277 - _e278) * _e280) - _e282);
                    let _e285 = t;
                    let _e286 = tca_2;
                    let _e288 = a_1;
                    mu_14 = ((_e285 - _e286) / _e288);
                    let _e291 = slab;
                    let _e293 = mu_14;
                    let _e294 = mu_14;
                    let _e301 = mu_14;
                    let _e306 = t;
                    let _e307 = gPixA;
                    let _e310 = a_1;
                    blur_2 = ((((_e291 * sqrt(max((1f - (_e293 * _e294)), 0f))) / max(abs(_e301), 0.04f)) + (_e306 * _e307)) / _e310);
                    let _e313 = global.uToFixed;
                    let _e314 = p_10;
                    let _e315 = a_1;
                    let _e319 = blur_2;
                    let _e320 = auroraArcs((_e313 * (_e314 / vec3(_e315))), _e319);
                    b_1 = _e320;
                    let _e322 = b_1;
                    if (_e322 <= 0f) {
                        continue;
                    }
                    let _e325 = col;
                    let _e326 = b_1;
                    let _e328 = slab;
                    let _e330 = mu_14;
                    e_2 = (((_e325 * _e326) * _e328) / vec3(max(abs(_e330), 0.04f)));
                    let _e337 = k_2;
                    if (_e337 == 0i) {
                        let _e340 = (*near);
                        let _e341 = e_2;
                        (*near) = (_e340 + _e341);
                    } else {
                        let _e343 = (*far);
                        let _e344 = e_2;
                        (*far) = (_e343 + _e344);
                    }
                }
                continuing {
                    let _e255 = k_2;
                    k_2 = (_e255 + 1i);
                }
            }
        }
        continuing {
            let _e193 = i_2;
            i_2 = (_e193 + 1i);
        }
    }
    return;
}

fn blackbodyGlow(T: f32) -> vec3<f32> {
    var T_1: f32;
    var g_4: f32;

    T_1 = T;
    let _e135 = T_1;
    if (_e135 < 650f) {
        return vec3(0f);
    }
    let _e143 = T_1;
    g_4 = max(0f, (0.0287f + (0.000237f * (_e143 - 1000f))));
    let _e151 = g_4;
    let _e157 = T_1;
    let _e163 = g_4;
    return (vec3<f32>(1f, _e151, 0f) * ((600000f * exp((-24060f / _e157))) / (0.2126f + (0.7152f * _e163))));
}

fn airHeatGlow(r_20: f32) -> vec3<f32> {
    var r_21: f32;
    var local_12: vec3<f32>;

    r_21 = r_20;
    let _e135 = global.uThermal;
    if (_e135.x > 0f) {
        let _e139 = global.uThermal;
        let _e141 = global.uThermal;
        let _e143 = r_21;
        let _e144 = global.uRadius;
        let _e150 = blackbodyGlow((_e139.x - (_e141.z * max((_e143 - _e144), 0f))));
        local_12 = _e150;
    } else {
        local_12 = vec3(0f);
    }
    let _e154 = local_12;
    return _e154;
}

fn heightCubeAt(d_6: vec3<f32>) -> f32 {
    var d_7: vec3<f32>;
    var a_2: vec3<f32>;
    var local_13: i32;
    var local_14: i32;
    var local_15: i32;
    var local_16: i32;
    var local_17: i32;
    var f_1: i32;
    var local_18: array<vec3<f32>, 6> = HC_N;
    var dn: f32;
    var local_19: array<vec3<f32>, 6> = HC_U;
    var local_20: array<vec3<f32>, 6> = HC_V;
    var uv_4: vec2<f32>;

    d_7 = d_6;
    let _e138 = d_7;
    a_2 = abs(_e138);
    let _e141 = a_2;
    let _e143 = a_2;
    let _e146 = a_2;
    let _e148 = a_2;
    if ((_e141.x >= _e143.y) && (_e146.x >= _e148.z)) {
        let _e152 = d_7;
        if (_e152.x >= 0f) {
            local_13 = 0i;
        } else {
            local_13 = 1i;
        }
        let _e159 = local_13;
        local_17 = _e159;
    } else {
        let _e160 = a_2;
        let _e162 = a_2;
        if (_e160.y >= _e162.z) {
            let _e165 = d_7;
            if (_e165.y >= 0f) {
                local_14 = 2i;
            } else {
                local_14 = 3i;
            }
            let _e172 = local_14;
            local_16 = _e172;
        } else {
            let _e173 = d_7;
            if (_e173.z >= 0f) {
                local_15 = 4i;
            } else {
                local_15 = 5i;
            }
            let _e180 = local_15;
            local_16 = _e180;
        }
        let _e182 = local_16;
        local_17 = _e182;
    }
    let _e184 = local_17;
    f_1 = _e184;
    let _e186 = d_7;
    let _e187 = f_1;
    let _e191 = local_18[_e187];
    dn = dot(_e186, _e191);
    let _e194 = d_7;
    let _e195 = f_1;
    let _e199 = local_19[_e195];
    let _e201 = dn;
    let _e204 = d_7;
    let _e205 = f_1;
    let _e209 = local_20[_e205];
    let _e211 = dn;
    uv_4 = (((vec2<f32>(atan((dot(_e194, _e199) / _e201)), atan((dot(_e204, _e209) / _e211))) / vec2(0.785398f)) * 0.5f) + vec2(0.5f));
    let _e224 = uv_4;
    let _e225 = f_1;
    let _e229 = vec3<f32>(_e224.x, _e224.y, f32(_e225));
    let _e234 = textureSampleLevel(tHeightCubeTexture, tHeightCubeSampler, _e229.xy, i32(_e229.z), 0f);
    return _e234.x;
}

fn terrainShadow(pF: vec3<f32>, up: vec3<f32>, sF: vec3<f32>, R: f32) -> f32 {
    var pF_1: vec3<f32>;
    var up_1: vec3<f32>;
    var sF_1: vec3<f32>;
    var R_1: f32;
    var texel: f32;
    var top: f32;
    var r0_: f32;
    var below: f32;
    var o: vec3<f32>;
    var t_1: f32;
    var sh: f32 = 1f;
    var i_3: i32 = 0i;
    var qp: vec3<f32>;
    var rq: f32;
    var d_8: f32;

    pF_1 = pF;
    up_1 = up;
    sF_1 = sF;
    R_1 = R;
    let _e144 = global.uHeightCube;
    let _e148 = up_1;
    let _e149 = sF_1;
    if ((_e144.x < 0.5f) || (dot(_e148, _e149) < -0.2f)) {
        return 1f;
    }
    let _e156 = global.uHeightCube;
    texel = _e156.w;
    let _e159 = R_1;
    let _e160 = global.uHeightCube;
    top = (_e159 + _e160.z);
    let _e164 = pF_1;
    r0_ = length(_e164);
    let _e168 = R_1;
    let _e169 = up_1;
    let _e170 = heightCubeAt(_e169);
    let _e172 = r0_;
    below = max(0f, ((_e168 + _e170) - _e172));
    let _e176 = pF_1;
    let _e177 = up_1;
    let _e178 = texel;
    o = (_e176 + ((_e177 * _e178) * 0.1f));
    let _e184 = texel;
    t_1 = _e184;
    loop {
        let _e190 = i_3;
        if !((_e190 < 28i)) {
            break;
        }
        {
            let _e197 = o;
            let _e198 = sF_1;
            let _e199 = t_1;
            qp = (_e197 + (_e198 * _e199));
            let _e203 = qp;
            rq = length(_e203);
            let _e206 = rq;
            let _e207 = top;
            if (_e206 > _e207) {
                break;
            }
            let _e209 = rq;
            let _e210 = R_1;
            let _e211 = qp;
            let _e212 = rq;
            let _e215 = heightCubeAt((_e211 / vec3(_e212)));
            let _e218 = below;
            let _e219 = t_1;
            let _e222 = texel;
            d_8 = ((_e209 - (_e210 + _e215)) + (_e218 * exp((-(_e219) / (3f * _e222)))));
            let _e229 = sh;
            let _e230 = d_8;
            let _e231 = t_1;
            sh = min(_e229, clamp(((_e230 / (_e231 * 0.035f)) + 0.5f), 0f, 1f));
            let _e241 = sh;
            if (_e241 <= 0f) {
                break;
            }
            let _e244 = t_1;
            t_1 = (_e244 * 1.35f);
        }
        continuing {
            let _e194 = i_3;
            i_3 = (_e194 + 1i);
        }
    }
    let _e247 = sh;
    return _e247;
}

fn airShadow(pF_2: vec3<f32>, sF_2: vec3<f32>, R_2: f32) -> f32 {
    var pF_3: vec3<f32>;
    var sF_3: vec3<f32>;
    var R_3: f32;
    var texel_1: f32;
    var top_1: f32;
    var t_2: f32;
    var sh_1: f32 = 1f;
    var i_4: i32 = 0i;
    var qp_1: vec3<f32>;
    var rq_1: f32;

    pF_3 = pF_2;
    sF_3 = sF_2;
    R_3 = R_2;
    let _e142 = global.uHeightCube;
    texel_1 = _e142.w;
    let _e145 = R_3;
    let _e146 = global.uHeightCube;
    top_1 = (_e145 + _e146.z);
    let _e150 = texel_1;
    t_2 = _e150;
    loop {
        let _e156 = i_4;
        if !((_e156 < 16i)) {
            break;
        }
        {
            let _e163 = pF_3;
            let _e164 = sF_3;
            let _e165 = t_2;
            qp_1 = (_e163 + (_e164 * _e165));
            let _e169 = qp_1;
            rq_1 = length(_e169);
            let _e172 = rq_1;
            let _e173 = top_1;
            if (_e172 > _e173) {
                break;
            }
            let _e175 = sh_1;
            let _e176 = rq_1;
            let _e177 = R_3;
            let _e178 = qp_1;
            let _e179 = rq_1;
            let _e182 = heightCubeAt((_e178 / vec3(_e179)));
            let _e185 = t_2;
            sh_1 = min(_e175, clamp((((_e176 - (_e177 + _e182)) / (_e185 * 0.035f)) + 0.5f), 0f, 1f));
            let _e195 = sh_1;
            if (_e195 <= 0f) {
                break;
            }
            let _e198 = t_2;
            t_2 = (_e198 * 1.6f);
        }
        continuing {
            let _e160 = i_4;
            i_4 = (_e160 + 1i);
        }
    }
    let _e201 = sh_1;
    return _e201;
}

fn cloudN(n: f32) -> f32 {
    var n_1: f32;

    n_1 = n;
    let _e140 = n_1;
    return (0.55f + ((_e140 - 0.682f) * 4.3f));
}

fn cloudBias(cover: f32) -> f32 {
    var cover_1: f32;

    cover_1 = cover;
    let _e139 = cover_1;
    let _e147 = cover_1;
    let _e155 = cover_1;
    return ((((_e139 - 0.5f) * 0.3f) + (0.5f * smoothstep(0.8f, 1f, _e147))) - (0.5f * (1f - smoothstep(0f, 0.2f, _e155))));
}

fn cloudFade(foot: f32, L: f32) -> f32 {
    var foot_1: f32;
    var L_1: f32;

    foot_1 = foot;
    L_1 = L;
    let _e143 = foot_1;
    let _e146 = L_1;
    return smoothstep(1f, 4f, ((_e143 * 64f) / _e146));
}

fn cloudMapSmooth(uv_5: vec2<f32>) -> vec3<f32> {
    var uv_6: vec2<f32>;
    var sz: vec2<f32>;
    var st: vec2<f32>;
    var i_5: vec2<f32>;
    var f_2: vec2<f32>;
    var f2_: vec2<f32>;
    var f3_: vec2<f32>;
    var w0_1: vec2<f32>;
    var w1_: vec2<f32>;
    var w2_: vec2<f32>;
    var w3_: vec2<f32>;
    var g0_: vec2<f32>;
    var g1_: vec2<f32>;
    var h0_: vec2<f32>;
    var h1_: vec2<f32>;

    uv_6 = uv_5;
    let _e140 = textureDimensions(tCloudMapTexture, 0i);
    sz = vec2<f32>(vec2<i32>(_e140));
    let _e144 = uv_6;
    let _e145 = sz;
    st = ((_e144 * _e145) - vec2(0.5f));
    let _e151 = st;
    i_5 = floor(_e151);
    let _e154 = st;
    let _e155 = i_5;
    f_2 = (_e154 - _e155);
    let _e158 = f_2;
    let _e159 = f_2;
    f2_ = (_e158 * _e159);
    let _e162 = f2_;
    let _e163 = f_2;
    f3_ = (_e162 * _e163);
    let _e168 = f_2;
    let _e173 = f2_;
    let _e176 = f3_;
    w0_1 = ((((vec2(1f) - (3f * _e168)) + (3f * _e173)) - _e176) / vec2(6f));
    let _e184 = f2_;
    let _e189 = f3_;
    w1_ = (((vec2(4f) - (6f * _e184)) + (3f * _e189)) / vec2(6f));
    let _e198 = f_2;
    let _e203 = f2_;
    let _e207 = f3_;
    w2_ = ((((vec2(1f) + (3f * _e198)) + (3f * _e203)) - (3f * _e207)) / vec2(6f));
    let _e214 = f3_;
    w3_ = (_e214 / vec2(6f));
    let _e219 = w0_1;
    let _e220 = w1_;
    g0_ = (_e219 + _e220);
    let _e223 = w2_;
    let _e224 = w3_;
    g1_ = (_e223 + _e224);
    let _e227 = i_5;
    let _e231 = w1_;
    let _e232 = g0_;
    let _e235 = sz;
    h0_ = (((_e227 - vec2(0.5f)) + (_e231 / _e232)) / _e235);
    let _e238 = i_5;
    let _e242 = w3_;
    let _e243 = g1_;
    let _e246 = sz;
    h1_ = (((_e238 + vec2(1.5f)) + (_e242 / _e243)) / _e246);
    let _e249 = g0_;
    let _e251 = g0_;
    let _e253 = h0_;
    let _e255 = textureSampleLevel(tCloudMapTexture, tCloudMapSampler, _e253, 0f);
    let _e258 = g1_;
    let _e260 = h1_;
    let _e262 = h0_;
    let _e266 = textureSampleLevel(tCloudMapTexture, tCloudMapSampler, vec2<f32>(_e260.x, _e262.y), 0f);
    let _e271 = g1_;
    let _e273 = g0_;
    let _e275 = h0_;
    let _e277 = h1_;
    let _e281 = textureSampleLevel(tCloudMapTexture, tCloudMapSampler, vec2<f32>(_e275.x, _e277.y), 0f);
    let _e284 = g1_;
    let _e286 = h1_;
    let _e288 = textureSampleLevel(tCloudMapTexture, tCloudMapSampler, _e286, 0f);
    return ((_e249.y * ((_e251.x * _e255.xyz) + (_e258.x * _e266.xyz))) + (_e271.y * ((_e273.x * _e281.xyz) + (_e284.x * _e288.xyz))));
}

fn cloudClimate(dirF: vec3<f32>) -> f32 {
    var dirF_1: vec3<f32>;
    var lat: f32;
    var cm: vec3<f32>;

    dirF_1 = dirF;
    let _e139 = dirF_1;
    lat = asin(clamp(_e139.y, -1f, 1f));
    let _e147 = global.uCloudMapMean;
    if (_e147 <= 0f) {
        let _e151 = lat;
        return (0.12f * cos((abs(_e151) * 6f)));
    }
    let _e157 = dirF_1;
    let _e159 = dirF_1;
    let _e166 = lat;
    let _e172 = cloudMapSmooth(vec2<f32>(((atan2(_e157.z, _e159.x) / 6.2832f) + 0.5f), ((_e166 / 3.14159f) + 0.5f)));
    cm = _e172;
    let _e174 = cm;
    let _e176 = cm;
    let _e180 = global.uCloudYear;
    let _e184 = cm;
    let _e188 = global.uCloudYear;
    let _e192 = global.uCloudMapMean;
    return ((((_e174.x + ((_e176.y - 0.5f) * _e180.x)) + ((_e184.z - 0.5f) * _e188.y)) - _e192) * 0.8f);
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
    var local_21: f32;
    var a_3: f32;
    var local_22: f32;
    var b_2: f32;
    var spread: f32;

    q_1 = q;
    foot_3 = foot_2;
    bias_1 = bias;
    clim_1 = clim;
    let _e145 = global.uRadius;
    L0_ = (_e145 * 1f);
    let _e149 = global.uRadius;
    L1_ = (_e149 * 0.236f);
    let _e153 = foot_3;
    let _e154 = L0_;
    let _e155 = cloudFade(_e153, _e154);
    f0_ = _e155;
    let _e157 = foot_3;
    let _e158 = L1_;
    let _e159 = cloudFade(_e157, _e158);
    f1_ = _e159;
    let _e161 = q_1;
    qz = (_e161 * vec3<f32>(0.5f, 1f, 0.5f));
    let _e168 = f0_;
    if (_e168 > 0.999f) {
        local_21 = 0.682f;
    } else {
        let _e172 = qz;
        let _e173 = L0_;
        let _e177 = textureSampleLevel(tNoiseTexture, tNoiseSampler, (_e172 / vec3(_e173)), 0f);
        let _e180 = f0_;
        local_21 = mix(_e177.x, 0.682f, _e180);
    }
    let _e183 = local_21;
    a_3 = _e183;
    let _e185 = f1_;
    if (_e185 > 0.999f) {
        local_22 = 0.682f;
    } else {
        let _e189 = qz;
        let _e190 = L1_;
        let _e197 = textureSampleLevel(tNoiseTexture, tNoiseSampler, ((_e189 / vec3(_e190)) + vec3(0.5f)), 0f);
        let _e200 = f1_;
        local_22 = mix(_e197.x, 0.682f, _e200);
    }
    let _e203 = local_22;
    b_2 = _e203;
    let _e206 = f0_;
    let _e209 = f1_;
    spread = length(vec2<f32>((0.124f * _e206), (0.083f * _e209)));
    let _e215 = bias_1;
    let _e217 = spread;
    let _e220 = bias_1;
    let _e222 = spread;
    let _e224 = a_3;
    let _e227 = b_2;
    let _e231 = cloudN(((_e224 * 0.6f) + (_e227 * 0.4f)));
    let _e232 = clim_1;
    return smoothstep(((0.6f - _e215) - _e217), ((0.8f - _e220) + _e222), (_e231 + _e232));
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
    let _e145 = q_3;
    let _e146 = foot_5;
    let _e147 = bias_3;
    let _e148 = dirF_3;
    let _e149 = cloudClimate(_e148);
    let _e150 = cloudCoverC(_e145, _e146, _e147, _e149);
    return _e150;
}

fn cloudDetail(q_4: vec3<f32>, foot_6: f32) -> f32 {
    var q_5: vec3<f32>;
    var foot_7: f32;
    var L2_: f32;
    var f_3: f32;
    var local_23: f32;

    q_5 = q_4;
    foot_7 = foot_6;
    let _e141 = global.uRadius;
    L2_ = (_e141 * 0.064f);
    let _e145 = foot_7;
    let _e146 = L2_;
    let _e147 = cloudFade(_e145, _e146);
    f_3 = _e147;
    let _e149 = f_3;
    if (_e149 > 0.999f) {
        local_23 = 0.682f;
    } else {
        let _e153 = q_5;
        let _e154 = L2_;
        let _e158 = textureSampleLevel(tNoiseTexture, tNoiseSampler, (_e153 / vec3(_e154)), 0f);
        let _e161 = f_3;
        local_23 = mix(_e158.x, 0.682f, _e161);
    }
    let _e164 = local_23;
    return _e164;
}

fn cloudGens(dirF_4: vec3<f32>, gA: ptr<function, vec3<f32>>, gB: ptr<function, vec3<f32>>) {
    var dirF_5: vec3<f32>;
    var T_2: f32;
    var ph: f32;
    var s_3: f32;
    var a_4: f32;
    var fa: f32;
    var b_3: f32;
    var fb: f32;
    var j_1: f32;
    var fj_1: f32;
    var wa: f32;

    dirF_5 = dirF_4;
    let _e141 = global.uCloudClock;
    T_2 = _e141.z;
    let _e144 = T_2;
    if (_e144 <= 0f) {
        {
            (*gA) = vec3<f32>(1f, 0f, 0f);
            (*gB) = vec3(0f);
            return;
        }
    }
    let _e154 = dirF_5;
    let _e158 = dirF_5;
    let _e163 = dirF_5;
    let _e169 = dirF_5;
    let _e173 = dirF_5;
    let _e178 = dirF_5;
    ph = ((((1.1f * _e154.x) + (0.7f * _e158.z)) - (0.5f * _e163.y)) + (0.35f * sin((((2.3f * _e169.y) + (1.7f * _e173.x)) - (0.9f * _e178.z)))));
    let _e186 = global.uCloudClock;
    let _e188 = T_2;
    let _e190 = ph;
    s_3 = (((_e186.x / _e188) + _e190) + 4f);
    let _e195 = s_3;
    a_4 = floor(_e195);
    let _e198 = s_3;
    let _e199 = a_4;
    fa = (_e198 - _e199);
    let _e202 = s_3;
    b_3 = floor((_e202 + 0.5f));
    let _e207 = s_3;
    let _e210 = b_3;
    fb = ((_e207 + 0.5f) - _e210);
    let _e214 = dirF_5;
    let _e224 = dirF_5;
    let _e236 = dirF_5;
    j_1 = (0.065f * ((sin((dot(_e214, vec3<f32>(5.1f, 3.7f, -4.3f)) + 1.3f)) + sin((dot(_e224, vec3<f32>(-3.9f, 7.3f, 6.1f)) + 0.4f))) + (0.6f * sin((dot(_e236, vec3<f32>(11.3f, -8.9f, 7.7f)) + 2.1f)))));
    let _e250 = s_3;
    let _e251 = j_1;
    fj_1 = fract((_e250 + _e251));
    let _e259 = fj_1;
    wa = smoothstep(0.4f, 0.6f, (1f - abs(((2f * _e259) - 1f))));
    let _e267 = wa;
    let _e268 = fa;
    let _e271 = T_2;
    let _e274 = global.uCloudClock;
    let _e276 = a_4;
    (*gA) = vec3<f32>(_e267, ((_e268 - 0.5f) * _e271), (2f * (_e274.y + _e276)));
    let _e281 = wa;
    let _e283 = fb;
    let _e286 = T_2;
    let _e289 = global.uCloudClock;
    let _e291 = b_3;
    (*gB) = vec3<f32>((1f - _e281), ((_e283 - 0.5f) * _e286), ((2f * (_e289.y + _e291)) + 1f));
    return;
}

fn cloudGenOff(idx: f32) -> vec3<f32> {
    var idx_1: f32;
    var h_4: u32;

    idx_1 = idx;
    let _e139 = idx_1;
    h_4 = (u32(_e139) * 2654435761u);
    let _e144 = h_4;
    let _e145 = h_4;
    h_4 = (_e144 ^ (_e145 >> 15u));
    let _e149 = h_4;
    h_4 = (_e149 * 2246822519u);
    let _e152 = h_4;
    let _e153 = h_4;
    h_4 = (_e152 ^ (_e153 >> 13u));
    let _e157 = h_4;
    let _e161 = h_4;
    let _e167 = h_4;
    return (((vec3<f32>(f32((_e157 & 1023u)), f32(((_e161 >> 10u) & 1023u)), f32(((_e167 >> 20u) & 1023u))) / vec3(1024f)) - vec3(0.5f)) * 400000f);
}

fn cloudAdvect(pf_2: vec3<f32>, dirF_6: vec3<f32>, g_5: vec3<f32>) -> vec3<f32> {
    var pf_3: vec3<f32>;
    var dirF_7: vec3<f32>;
    var g_6: vec3<f32>;
    var lat_1: f32;
    var U: f32;
    var east: vec3<f32>;

    pf_3 = pf_2;
    dirF_7 = dirF_6;
    g_6 = g_5;
    let _e143 = dirF_7;
    lat_1 = asin(clamp(_e143.y, -1f, 1f));
    let _e151 = global.uCloudWind;
    let _e153 = lat_1;
    let _e154 = global.uCloudWind;
    let _e159 = global.uCloudWind;
    let _e165 = global.uCloudWind;
    let _e167 = lat_1;
    let _e169 = lat_1;
    U = (_e151.x * (sin((((_e153 * _e154.y) * 2f) + (_e159.z * 6.2832f))) + (_e165.w * exp(((-(_e167) * _e169) * 40f)))));
    let _e178 = dirF_7;
    let _e182 = dirF_7;
    east = normalize((vec3<f32>(-(_e178.z), 0f, _e182.x) + vec3<f32>(0.000001f, 0f, 0f)));
    let _e192 = pf_3;
    let _e193 = east;
    let _e194 = U;
    let _e196 = g_6;
    let _e200 = g_6;
    let _e202 = cloudGenOff(_e200.z);
    return ((_e192 + ((_e193 * _e194) * _e196.y)) + _e202);
}

fn cloudCoverG(pf_4: vec3<f32>, dirF_8: vec3<f32>, foot_8: f32, bias_4: f32) -> f32 {
    var pf_5: vec3<f32>;
    var dirF_9: vec3<f32>;
    var foot_9: f32;
    var bias_5: f32;
    var gA_1: vec3<f32>;
    var gB_1: vec3<f32>;
    var c_9: f32 = 0f;
    var clim_2: f32;

    pf_5 = pf_4;
    dirF_9 = dirF_8;
    foot_9 = foot_8;
    bias_5 = bias_4;
    let _e147 = dirF_9;
    cloudGens(_e147, (&gA_1), (&gB_1));
    let _e154 = dirF_9;
    let _e155 = cloudClimate(_e154);
    clim_2 = _e155;
    let _e157 = gA_1;
    if (_e157.x > 0.005f) {
        let _e161 = c_9;
        let _e162 = gA_1;
        let _e164 = pf_5;
        let _e165 = dirF_9;
        let _e166 = gA_1;
        let _e167 = cloudAdvect(_e164, _e165, _e166);
        let _e168 = foot_9;
        let _e169 = bias_5;
        let _e170 = clim_2;
        let _e171 = cloudCoverC(_e167, _e168, _e169, _e170);
        c_9 = (_e161 + (_e162.x * _e171));
    }
    let _e174 = gB_1;
    if (_e174.x > 0.005f) {
        let _e178 = c_9;
        let _e179 = gB_1;
        let _e181 = pf_5;
        let _e182 = dirF_9;
        let _e183 = gB_1;
        let _e184 = cloudAdvect(_e181, _e182, _e183);
        let _e185 = foot_9;
        let _e186 = bias_5;
        let _e187 = clim_2;
        let _e188 = cloudCoverC(_e184, _e185, _e186, _e187);
        c_9 = (_e178 + (_e179.x * _e188));
    }
    let _e191 = c_9;
    return _e191;
}

fn cloudDensity(pFixedDir: vec3<f32>, foot_10: f32) -> f32 {
    var pFixedDir_1: vec3<f32>;
    var foot_11: f32;
    var pf_6: vec3<f32>;
    var gA_2: vec3<f32>;
    var gB_2: vec3<f32>;
    var d_9: f32 = 0f;
    var clim_3: f32;
    var j_2: i32 = 0i;
    var local_24: vec3<f32>;
    var g_7: vec3<f32>;
    var q_6: vec3<f32>;
    var cov: f32;

    pFixedDir_1 = pFixedDir;
    foot_11 = foot_10;
    let _e141 = pFixedDir_1;
    let _e142 = global.uRadius;
    pf_6 = (_e141 * _e142);
    let _e147 = pFixedDir_1;
    cloudGens(_e147, (&gA_2), (&gB_2));
    let _e154 = pFixedDir_1;
    let _e155 = cloudClimate(_e154);
    clim_3 = _e155;
    loop {
        let _e159 = j_2;
        if !((_e159 < 2i)) {
            break;
        }
        {
            let _e166 = j_2;
            if (_e166 == 0i) {
                let _e169 = gA_2;
                local_24 = _e169;
            } else {
                let _e170 = gB_2;
                local_24 = _e170;
            }
            let _e172 = local_24;
            g_7 = _e172;
            let _e174 = g_7;
            if (_e174.x <= 0.005f) {
                continue;
            }
            let _e178 = pf_6;
            let _e179 = pFixedDir_1;
            let _e180 = g_7;
            let _e181 = cloudAdvect(_e178, _e179, _e180);
            q_6 = _e181;
            let _e183 = q_6;
            let _e184 = foot_11;
            let _e185 = global.uCloud;
            let _e187 = cloudBias(_e185.z);
            let _e188 = clim_3;
            let _e189 = cloudCoverC(_e183, _e184, _e187, _e188);
            cov = _e189;
            let _e191 = d_9;
            let _e192 = g_7;
            let _e194 = cov;
            let _e198 = q_6;
            let _e199 = foot_11;
            let _e200 = cloudDetail(_e198, _e199);
            let _e201 = cov;
            d_9 = (_e191 + ((_e192.x * _e194) * smoothstep(0.15f, 0.55f, ((_e200 * _e201) + 0.25f))));
        }
        continuing {
            let _e163 = j_2;
            j_2 = (_e163 + 1i);
        }
    }
    let _e208 = d_9;
    return _e208;
}

fn march(t0_: f32, t1_: f32, D_4: vec3<f32>, tca_3: f32, perp_3: vec3<f32>, cosTheta: f32, jitter_2: f32, L_2: ptr<function, vec3<f32>>, T_3: ptr<function, vec3<f32>>, steps: i32, Lm: ptr<function, vec3<f32>>) {
    var t0_1: f32;
    var t1_1: f32;
    var D_5: vec3<f32>;
    var tca_4: f32;
    var perp_4: vec3<f32>;
    var cosTheta_1: f32;
    var jitter_3: f32;
    var steps_1: i32;
    var dt: f32;
    var sq: bool;
    var upC_2: vec3<f32>;
    var kT: f32;
    var pR: f32;
    var pM: vec3<f32>;
    var moon: bool;
    var cosM: f32;
    var pRm: f32;
    var pMm: vec3<f32>;
    var i_6: i32 = 0i;
    var t_3: f32;
    var dti: f32;
    var u_1: f32;
    var p_11: vec3<f32>;
    var r_22: f32;
    var nT: vec3<f32>;
    var muV: f32;
    var sR: vec3<f32>;
    var sM: vec3<f32>;
    var e_3: vec3<f32>;
    var muS_2: f32;
    var sunT: vec3<f32>;
    var ms: vec3<f32>;
    var S: vec3<f32>;
    var Ts: vec3<f32>;
    var eSafe: vec3<f32>;
    var muM: f32;
    var mT: vec3<f32>;
    var mms: vec3<f32>;
    var Sm: vec3<f32>;
    var te: f32;

    t0_1 = t0_;
    t1_1 = t1_;
    D_5 = D_4;
    tca_4 = tca_3;
    perp_4 = perp_3;
    cosTheta_1 = cosTheta;
    jitter_3 = jitter_2;
    steps_1 = steps;
    let _e156 = t1_1;
    let _e157 = t0_1;
    if (_e156 <= _e157) {
        return;
    }
    let _e159 = t1_1;
    let _e160 = t0_1;
    let _e162 = steps_1;
    dt = ((_e159 - _e160) / f32(_e162));
    let _e166 = t0_1;
    let _e169 = global.uCenter;
    let _e171 = global.uRadius;
    let _e174 = global.uHaze;
    sq = ((_e166 < 1f) && ((length(_e169) - _e171) < (4f * _e174.y)));
    let _e180 = global.uCenter;
    upC_2 = normalize(-(_e180));
    let _e184 = global.uCenter;
    let _e186 = global.uRadius;
    let _e188 = trueK((length(_e184) - _e186));
    kT = _e188;
    let _e190 = cosTheta_1;
    let _e191 = phaseRayleigh(_e190);
    pR = _e191;
    let _e193 = cosTheta_1;
    let _e194 = phaseMie(_e193);
    pM = _e194;
    let _e196 = global.uMoonE;
    moon = (_e196.y > 0f);
    let _e201 = D_5;
    let _e202 = global.uMoonDir;
    cosM = dot(_e201, _e202);
    let _e205 = cosM;
    let _e206 = phaseRayleigh(_e205);
    pRm = _e206;
    let _e208 = cosM;
    let _e209 = phaseMie(_e208);
    pMm = _e209;
    loop {
        let _e213 = i_6;
        if !((_e213 < 32i)) {
            break;
        }
        {
            let _e220 = i_6;
            let _e221 = steps_1;
            if (_e220 >= _e221) {
                break;
            }
            let _e223 = t0_1;
            let _e224 = i_6;
            let _e226 = jitter_3;
            let _e228 = dt;
            t_3 = (_e223 + ((f32(_e224) + _e226) * _e228));
            let _e232 = dt;
            dti = _e232;
            let _e234 = sq;
            if _e234 {
                {
                    let _e235 = i_6;
                    let _e237 = jitter_3;
                    let _e239 = steps_1;
                    u_1 = ((f32(_e235) + _e237) / f32(_e239));
                    let _e243 = t0_1;
                    let _e244 = t1_1;
                    let _e245 = t0_1;
                    let _e247 = u_1;
                    let _e249 = u_1;
                    t_3 = (_e243 + (((_e244 - _e245) * _e247) * _e249));
                    let _e252 = t1_1;
                    let _e253 = t0_1;
                    let _e257 = u_1;
                    let _e259 = steps_1;
                    dti = (((((_e252 - _e253) * 2f) * _e257) / f32(_e259)) + 0.001f);
                }
            }
            let _e264 = t_3;
            let _e265 = tca_4;
            let _e267 = D_5;
            let _e269 = perp_4;
            p_11 = (((_e264 - _e265) * _e267) - _e269);
            let _e272 = p_11;
            r_22 = length(_e272);
            let _e275 = p_11;
            let _e276 = r_22;
            let _e277 = upC_2;
            let _e278 = kT;
            let _e279 = trueUp(_e275, _e276, _e277, _e278);
            nT = _e279;
            let _e281 = D_5;
            let _e282 = nT;
            muV = dot(_e281, _e282);
            let _e287 = muV;
            let _e288 = muV;
            gHazeH = sqrt(max(0f, (1f - (_e287 * _e288))));
            let _e296 = r_22;
            mediumAt(_e296, (&sR), (&sM), (&e_3));
            let _e303 = nT;
            let _e304 = global.uSunDir;
            muS_2 = dot(_e303, _e304);
            let _e307 = r_22;
            let _e308 = muS_2;
            let _e309 = sunTransmittance(_e307, _e308);
            sunT = _e309;
            let _e311 = global.uHeightCube;
            let _e315 = r_22;
            let _e316 = global.uRadius;
            let _e317 = global.uHeightCube;
            if ((_e311.x > 0.5f) && (_e315 < (_e316 + _e317.z))) {
                let _e322 = sunT;
                let _e323 = global.uToFixed;
                let _e324 = p_11;
                let _e326 = global.uToFixed;
                let _e327 = global.uSunDir;
                let _e329 = global.uRadius;
                let _e330 = airShadow((_e323 * _e324), (_e326 * _e327), _e329);
                sunT = (_e322 * _e330);
            }
            let _e332 = r_22;
            let _e333 = muS_2;
            let _e334 = multiScatter(_e332, _e333);
            ms = _e334;
            let _e336 = sR;
            let _e337 = sunT;
            let _e338 = pR;
            let _e340 = ms;
            let _e343 = sM;
            let _e344 = sunT;
            let _e345 = pM;
            let _e347 = ms;
            S = ((_e336 * ((_e337 * _e338) + _e340)) + (_e343 * ((_e344 * _e345) + _e347)));
            let _e352 = e_3;
            let _e354 = dti;
            Ts = exp((-(_e352) * _e354));
            let _e358 = e_3;
            eSafe = max(_e358, vec3(0.00000000000001f));
            let _e363 = (*L_2);
            let _e364 = (*T_3);
            let _e365 = S;
            let _e366 = S;
            let _e367 = Ts;
            let _e371 = eSafe;
            let _e373 = gAirSun;
            (*L_2) = (_e363 + (((_e364 * (_e365 - (_e366 * _e367))) / _e371) * _e373));
            let _e376 = moon;
            if _e376 {
                {
                    let _e377 = nT;
                    let _e378 = global.uMoonDir;
                    muM = dot(_e377, _e378);
                    let _e381 = r_22;
                    let _e382 = muM;
                    let _e383 = sunTransmittance(_e381, _e382);
                    mT = _e383;
                    let _e385 = r_22;
                    let _e386 = muM;
                    let _e387 = multiScatter(_e385, _e386);
                    mms = _e387;
                    let _e389 = sR;
                    let _e390 = mT;
                    let _e391 = pRm;
                    let _e393 = mms;
                    let _e396 = sM;
                    let _e397 = mT;
                    let _e398 = pMm;
                    let _e400 = mms;
                    Sm = ((_e389 * ((_e390 * _e391) + _e393)) + (_e396 * ((_e397 * _e398) + _e400)));
                    let _e405 = (*Lm);
                    let _e406 = (*T_3);
                    let _e407 = Sm;
                    let _e408 = Sm;
                    let _e409 = Ts;
                    let _e413 = eSafe;
                    (*Lm) = (_e405 + ((_e406 * (_e407 - (_e408 * _e409))) / _e413));
                }
            }
            let _e416 = gEm;
            let _e417 = (*T_3);
            let _e418 = p_11;
            let _e419 = r_22;
            let _e420 = airLight(_e418, _e419);
            let _e422 = dti;
            gEm = (_e416 + ((_e417 * _e420) * _e422));
            let _e425 = global.uThermal;
            if (_e425.x > 0f) {
                {
                    let _e429 = t0_1;
                    let _e430 = i_6;
                    let _e432 = dt;
                    let _e436 = dt;
                    let _e439 = e_3;
                    te = ((_e429 + (f32(_e430) * _e432)) + min((0.5f * _e436), (1f / max(_e439.y, 0.000000000001f))));
                    let _e447 = gEm;
                    let _e448 = (*T_3);
                    let _e451 = Ts;
                    let _e454 = te;
                    let _e455 = tca_4;
                    let _e457 = D_5;
                    let _e459 = perp_4;
                    let _e462 = airHeatGlow(length((((_e454 - _e455) * _e457) - _e459)));
                    gEm = (_e447 + ((_e448 * (vec3(1f) - _e451)) * _e462));
                }
            }
            let _e465 = (*T_3);
            let _e466 = Ts;
            (*T_3) = (_e465 * _e466);
        }
        continuing {
            let _e217 = i_6;
            i_6 = (_e217 + 1i);
        }
    }
    return;
}

fn main_1() {
    var px: vec2<i32>;
    var ndc: vec2<f32>;
    var dView: vec3<f32>;
    var D_6: vec3<f32>;
    var depth: f32;
    var local_25: f32;
    var sceneDist: f32;
    var hit: vec2<f32>;
    var skyPx: bool;
    var local_26: f32;
    var tca_5: f32;
    var perp_5: vec3<f32>;
    var t0_2: f32;
    var t1_2: f32;
    var g_8: vec2<f32>;
    var cosTheta_2: f32;
    var jitter_4: f32;
    var steps_2: i32;
    var L_3: vec3<f32> = vec3(0f);
    var T_4: vec3<f32> = vec3(1f);
    var Lm_1: vec3<f32> = vec3(0f);
    var tc: f32 = -1f;
    var graze: f32 = 1f;
    var rc: f32;
    var ch: vec2<f32>;
    var camR: f32;
    var local_27: f32;
    var cand: f32;
    var hb: f32;
    var Hc: f32;
    var aNear: vec3<f32>;
    var aFar: vec3<f32>;
    var local_28: vec3<f32>;
    var far_1: vec3<f32>;
    var em1_: vec3<f32>;
    var pc: vec3<f32>;
    var rc_1: f32;
    var up_2: vec3<f32>;
    var dens: f32;
    var alpha: f32;
    var L2_1: vec3<f32> = vec3(0f);
    var T2_: vec3<f32> = vec3(1f);
    var Lm2_: vec3<f32> = vec3(0f);
    var cl: vec3<f32> = vec3(0f);
    var clm: vec3<f32> = vec3(0f);
    var upT: vec3<f32>;
    var muS_3: f32;
    var sunT_1: vec3<f32>;
    var amb: vec3<f32>;
    var fromBelow: bool;
    var lambert: f32;
    var silver: f32;
    var lit: vec3<f32>;
    var muM_1: f32;
    var lm: f32;

    let _e139 = vUv_1;
    let _e140 = depthPixel(_e139);
    px = _e140;
    let _e142 = px;
    let _e148 = textureDimensions(tDepthTexture, 0i);
    ndc = ((((vec2<f32>(_e142) + vec2(0.5f)) / vec2<f32>(vec2<i32>(_e148))) * 2f) - vec2(1f));
    let _e159 = ndc;
    ndc.y = -(_e159.y);
    let _e162 = ndc;
    let _e164 = global.uTanHalf;
    let _e167 = ndc;
    let _e169 = global.uTanHalf;
    dView = normalize(vec3<f32>((_e162.x * _e164.x), (_e167.y * _e169.y), -1f));
    let _e177 = global.uCamRot;
    let _e178 = dView;
    D_6 = normalize((_e177 * _e178));
    let _e182 = D_6;
    let _e183 = fwidth(_e182);
    gPixA = length(_e183);
    let _e185 = px;
    let _e187 = textureLoad(tDepthTexture, _e185, 0i);
    depth = _e187.x;
    let _e190 = depth;
    let _e191 = isSkyDepth(_e190);
    if _e191 {
        local_25 = 1000000000000000000000000000000f;
    } else {
        let _e193 = depth;
        let _e194 = viewZFromDepth(_e193);
        let _e195 = dView;
        local_25 = (_e194 / max(-(_e195.z), 0.0001f));
    }
    let _e202 = local_25;
    sceneDist = _e202;
    let _e204 = global.uCenter;
    let _e205 = global.uTop;
    let _e206 = D_6;
    let _e207 = raySphere(_e204, _e205, _e206);
    hit = _e207;
    let _e209 = hit;
    let _e213 = hit;
    let _e215 = hit;
    let _e219 = hit;
    let _e221 = sceneDist;
    if (((_e209.y <= 0f) || (_e213.x > _e215.y)) || (_e219.x > _e221)) {
        {
            outL = vec4(0f);
            outT = vec4(1f);
            return;
        }
    }
    let _e228 = sceneDist;
    let _e231 = sceneDist;
    let _e232 = hit;
    skyPx = ((_e228 > 100000000000000000000000000000f) || (_e231 > _e232.y));
    let _e237 = skyPx;
    if _e237 {
        let _e239 = global.uSkyView;
        local_26 = (1f - _e239.x);
    } else {
        local_26 = 1f;
    }
    let _e244 = local_26;
    gHazeK = _e244;
    let _e245 = gHazeK;
    gAirSun = _e245;
    let _e246 = global.uCenter;
    let _e247 = D_6;
    tca_5 = dot(_e246, _e247);
    let _e250 = global.uCenter;
    let _e251 = tca_5;
    let _e252 = D_6;
    perp_5 = (_e250 - (_e251 * _e252));
    let _e256 = hit;
    t0_2 = max(_e256.x, 0f);
    let _e261 = hit;
    let _e263 = sceneDist;
    t1_2 = min(_e261.y, _e263);
    let _e266 = global.uCenter;
    let _e267 = global.uGround;
    let _e268 = D_6;
    let _e269 = raySphere(_e266, _e267, _e268);
    g_8 = _e269;
    let _e271 = g_8;
    let _e275 = g_8;
    let _e277 = g_8;
    let _e281 = g_8;
    if (((_e271.y > 0f) && (_e275.x < _e277.y)) && (_e281.x > 0f)) {
        let _e286 = t1_2;
        let _e287 = g_8;
        t1_2 = min(_e286, _e287.x);
    }
    let _e290 = D_6;
    let _e291 = global.uSunDir;
    cosTheta_2 = dot(_e290, _e291);
    let _e295 = gl_FragCoord_1;
    let _e297 = ign(_e295.xy);
    jitter_4 = _e297;
    let _e299 = global.uSteps;
    steps_2 = i32(_e299);
    gEm = vec3(0f);
    let _e318 = global.uCloudOn;
    if (_e318 > 0.5f) {
        {
            let _e321 = global.uRadius;
            let _e322 = global.uCloud;
            rc = (_e321 + _e322.x);
            let _e326 = global.uCenter;
            let _e327 = rc;
            let _e328 = D_6;
            let _e329 = raySphere(_e326, _e327, _e328);
            ch = _e329;
            let _e331 = global.uCenter;
            camR = length(_e331);
            let _e334 = ch;
            let _e338 = ch;
            let _e340 = ch;
            if ((_e334.y > 0f) && (_e338.x < _e340.y)) {
                {
                    let _e344 = camR;
                    let _e345 = rc;
                    if (_e344 > _e345) {
                        let _e347 = ch;
                        local_27 = _e347.x;
                    } else {
                        let _e349 = ch;
                        local_27 = _e349.y;
                    }
                    let _e352 = local_27;
                    cand = _e352;
                    let _e354 = cand;
                    let _e355 = t0_2;
                    let _e357 = cand;
                    let _e358 = t1_2;
                    if ((_e354 > _e355) && (_e357 < _e358)) {
                        let _e361 = cand;
                        tc = _e361;
                    }
                }
            } else {
                let _e362 = camR;
                let _e363 = rc;
                let _e365 = tca_5;
                let _e366 = t0_2;
                let _e369 = tca_5;
                let _e370 = t1_2;
                if (((_e362 > _e363) && (_e365 > _e366)) && (_e369 < _e370)) {
                    {
                        let _e373 = perp_5;
                        let _e375 = rc;
                        hb = (length(_e373) - _e375);
                        let _e378 = global.uCloud;
                        Hc = max((_e378.y * 0.25f), 1f);
                        let _e385 = hb;
                        let _e387 = Hc;
                        if (_e385 < (6f * _e387)) {
                            {
                                let _e390 = tca_5;
                                tc = _e390;
                                let _e394 = hb;
                                let _e396 = Hc;
                                graze = (1f - exp((-7.4f * exp((-(_e394) / _e396)))));
                            }
                        }
                    }
                }
            }
        }
    }
    let _e404 = D_6;
    let _e405 = tca_5;
    let _e406 = perp_5;
    let _e407 = hit;
    let _e409 = sceneDist;
    let _e411 = jitter_4;
    auroraRay(_e404, _e405, _e406, min(_e407.y, _e409), _e411, (&aNear), (&aFar));
    let _e416 = skyPx;
    if _e416 {
        let _e417 = D_6;
        let _e418 = skyFar(_e417);
        local_28 = _e418;
    } else {
        local_28 = vec3(0f);
    }
    let _e422 = local_28;
    far_1 = _e422;
    let _e424 = tc;
    if (_e424 < 0f) {
        {
            let _e427 = t0_2;
            let _e428 = t1_2;
            let _e429 = D_6;
            let _e430 = tca_5;
            let _e431 = perp_5;
            let _e432 = cosTheta_2;
            let _e433 = jitter_4;
            let _e436 = steps_2;
            march(_e427, _e428, _e429, _e430, _e431, _e432, _e433, (&L_3), (&T_4), _e436, (&Lm_1));
            let _e441 = L_3;
            let _e442 = far_1;
            let _e444 = global.uSunE;
            let _e446 = Lm_1;
            let _e447 = global.uMoonE;
            let _e450 = gEm;
            let _e452 = aNear;
            let _e454 = T_4;
            let _e455 = aFar;
            let _e457 = ((((((_e441 + _e442) * _e444) + (_e446 * _e447)) + _e450) + _e452) + (_e454 * _e455));
            outL = vec4<f32>(_e457.x, _e457.y, _e457.z, 1f);
            let _e463 = T_4;
            outT = vec4<f32>(_e463.x, _e463.y, _e463.z, 1f);
            return;
        }
    }
    let _e469 = t0_2;
    let _e470 = tc;
    let _e471 = D_6;
    let _e472 = tca_5;
    let _e473 = perp_5;
    let _e474 = cosTheta_2;
    let _e475 = jitter_4;
    let _e478 = steps_2;
    march(_e469, _e470, _e471, _e472, _e473, _e474, _e475, (&L_3), (&T_4), ((_e478 / 2i) + 2i), (&Lm_1));
    let _e487 = gEm;
    em1_ = _e487;
    gEm = vec3(0f);
    let _e491 = tc;
    let _e492 = tca_5;
    let _e494 = D_6;
    let _e496 = perp_5;
    pc = (((_e491 - _e492) * _e494) - _e496);
    let _e499 = pc;
    rc_1 = length(_e499);
    let _e502 = pc;
    let _e503 = rc_1;
    up_2 = (_e502 / vec3(_e503));
    let _e507 = global.uToFixed;
    let _e508 = up_2;
    let _e511 = tc;
    let _e512 = gPixA;
    let _e514 = cloudDensity(normalize((_e507 * _e508)), (_e511 * _e512));
    dens = _e514;
    let _e516 = dens;
    let _e517 = global.uCloudColor;
    let _e523 = graze;
    alpha = (clamp((_e516 * _e517.w), 0f, 1f) * _e523);
    let _e535 = tc;
    let _e536 = t1_2;
    let _e537 = D_6;
    let _e538 = tca_5;
    let _e539 = perp_5;
    let _e540 = cosTheta_2;
    let _e541 = jitter_4;
    let _e544 = steps_2;
    march(_e535, _e536, _e537, _e538, _e539, _e540, _e541, (&L2_1), (&T2_), ((_e544 / 2i) + 2i), (&Lm2_));
    let _e559 = alpha;
    if (_e559 > 0.002f) {
        {
            let _e562 = pc;
            let _e563 = rc_1;
            let _e564 = global.uCenter;
            let _e567 = global.uCenter;
            let _e569 = global.uRadius;
            let _e571 = trueK((length(_e567) - _e569));
            let _e572 = trueUp(_e562, _e563, normalize(-(_e564)), _e571);
            upT = _e572;
            let _e574 = upT;
            let _e575 = global.uSunDir;
            muS_3 = dot(_e574, _e575);
            let _e578 = rc_1;
            let _e579 = muS_3;
            let _e580 = sunTransmittance(_e578, _e579);
            sunT_1 = _e580;
            let _e582 = rc_1;
            let _e583 = muS_3;
            let _e584 = multiScatter(_e582, _e583);
            amb = (_e584 * 6f);
            let _e588 = D_6;
            let _e589 = up_2;
            fromBelow = (dot(_e588, _e589) > 0f);
            let _e594 = muS_3;
            let _e603 = muS_3;
            lambert = ((max(_e594, 0f) * 0.6f) + (0.4f * smoothstep(-0.1f, 0.3f, _e603)));
            let _e610 = cosTheta_2;
            silver = (1f + (1.5f * pow(max(_e610, 0f), 12f)));
            let _e618 = global.uCloudColor;
            let _e620 = sunT_1;
            let _e621 = lambert;
            let _e623 = silver;
            let _e628 = amb;
            lit = (_e618.xyz * ((((_e620 * _e621) * _e623) / vec3(3.1415927f)) + _e628));
            let _e632 = fromBelow;
            if _e632 {
                let _e633 = lit;
                let _e636 = dens;
                lit = (_e633 * mix(0.55f, 0.18f, _e636));
            }
            let _e639 = lit;
            cl = _e639;
            let _e640 = global.uMoonE;
            if (_e640.y > 0f) {
                {
                    let _e644 = upT;
                    let _e645 = global.uMoonDir;
                    muM_1 = dot(_e644, _e645);
                    let _e648 = muM_1;
                    let _e657 = muM_1;
                    lm = ((max(_e648, 0f) * 0.6f) + (0.4f * smoothstep(-0.1f, 0.3f, _e657)));
                    let _e662 = global.uCloudColor;
                    let _e664 = rc_1;
                    let _e665 = muM_1;
                    let _e666 = sunTransmittance(_e664, _e665);
                    let _e667 = lm;
                    let _e672 = rc_1;
                    let _e673 = muM_1;
                    let _e674 = multiScatter(_e672, _e673);
                    clm = (_e662.xyz * (((_e666 * _e667) / vec3(3.1415927f)) + (_e674 * 6f)));
                    let _e679 = fromBelow;
                    if _e679 {
                        let _e680 = clm;
                        let _e683 = dens;
                        clm = (_e680 * mix(0.55f, 0.18f, _e683));
                    }
                }
            }
        }
    }
    let _e686 = T_4;
    let _e688 = alpha;
    let _e691 = T2_;
    let _e692 = ((_e686 * (1f - _e688)) * _e691);
    outT = vec4<f32>(_e692.x, _e692.y, _e692.z, 1f);
    let _e698 = L_3;
    let _e699 = T_4;
    let _e701 = alpha;
    let _e703 = L2_1;
    let _e705 = alpha;
    let _e706 = cl;
    let _e712 = alpha;
    let _e714 = far_1;
    let _e717 = global.uSunE;
    let _e719 = Lm_1;
    let _e720 = T_4;
    let _e722 = alpha;
    let _e724 = Lm2_;
    let _e726 = alpha;
    let _e727 = clm;
    let _e732 = global.uMoonE;
    let _e735 = em1_;
    let _e737 = T_4;
    let _e739 = alpha;
    let _e742 = gEm;
    let _e745 = aNear;
    let _e747 = T_4;
    let _e749 = alpha;
    let _e752 = T2_;
    let _e754 = aFar;
    let _e756 = ((((((((_e698 + (_e699 * (((1f - _e701) * _e703) + (_e705 * _e706)))) + ((1f - _e712) * _e714)) * _e717) + ((_e719 + (_e720 * (((1f - _e722) * _e724) + (_e726 * _e727)))) * _e732)) + _e735) + ((_e737 * (1f - _e739)) * _e742)) + _e745) + (((_e747 * (1f - _e749)) * _e752) * _e754));
    outL = vec4<f32>(_e756.x, _e756.y, _e756.z, 1f);
    return;
}

@fragment 
fn main(@location(0) vUv: vec2<f32>, @builtin(position) gl_FragCoord: vec4<f32>) -> FragmentOutput {
    vUv_1 = vUv;
    gl_FragCoord_1 = gl_FragCoord;
    main_1();
    let _e176 = outL;
    let _e178 = outT;
    return FragmentOutput(_e176, _e178);
}
`;
