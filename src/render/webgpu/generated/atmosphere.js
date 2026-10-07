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
  "group": 0
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
    let _e134 = r_5;
    let _e135 = global.uRadius;
    h = (_e134 - _e135);
    let _e138 = h;
    let _e139 = global.uKnee;
    if (_e138 <= _e139) {
        let _e141 = h;
        local_2 = _e141;
    } else {
        let _e142 = global.uKnee;
        let _e143 = h;
        let _e144 = global.uKnee;
        let _e146 = global.uUpper;
        local_2 = (_e142 + ((_e143 - _e144) / _e146));
    }
    let _e150 = local_2;
    hr = _e150;
    let _e152 = hr;
    let _e154 = global.uRayleighH;
    dR = exp((-(_e152) / _e154));
    let _e158 = hr;
    let _e160 = global.uMieH;
    dM = exp((-(_e158) / _e160));
    let _e164 = global.uAbsExp;
    if (_e164 > 0.5f) {
        let _e167 = dR;
        local_3 = _e167;
    } else {
        let _e170 = h;
        let _e171 = global.uAbsCenter;
        let _e174 = global.uAbsWidth;
        local_3 = max(0f, (1f - (abs((_e170 - _e171)) / max(_e174, 1f))));
    }
    let _e181 = local_3;
    dA = _e181;
    let _e183 = global.uHaze;
    let _e185 = gHazeK;
    let _e187 = h;
    let _e191 = global.uHaze;
    let _e198 = global.uHazeCol;
    dH = (((_e183.x * _e185) * exp((-(max(_e187, 0f)) / max(_e191.y, 1f)))) * _e198);
    let _e201 = global.uRayleigh;
    let _e202 = dR;
    (*scatR) = (_e201 * _e202);
    let _e204 = global.uMie;
    let _e205 = dM;
    let _e207 = dH;
    (*scatM) = ((_e204 * _e205) + _e207);
    let _e209 = (*scatR);
    let _e210 = (*scatM);
    let _e212 = global.uMieAbs;
    let _e213 = dM;
    let _e216 = global.uAbs;
    let _e217 = dA;
    let _e220 = dH;
    let _e221 = global.uHaze;
    (*ext) = ((((_e209 + _e210) + (_e212 * _e213)) + (_e216 * _e217)) + (_e220 * _e221.z));
    return;
}

fn realH(h_1: f32) -> f32 {
    var h_2: f32;
    var local_4: f32;

    h_2 = h_1;
    let _e131 = h_2;
    let _e132 = global.uKnee;
    if (_e131 <= _e132) {
        let _e134 = h_2;
        local_4 = _e134;
    } else {
        let _e135 = global.uKnee;
        let _e136 = h_2;
        let _e137 = global.uKnee;
        let _e139 = global.uUpper;
        local_4 = (_e135 + ((_e136 - _e137) / _e139));
    }
    let _e143 = local_4;
    return _e143;
}

fn drawnH(hr_1: f32) -> f32 {
    var hr_2: f32;
    var local_5: f32;

    hr_2 = hr_1;
    let _e131 = hr_2;
    let _e132 = global.uKnee;
    if (_e131 <= _e132) {
        let _e134 = hr_2;
        local_5 = _e134;
    } else {
        let _e135 = global.uKnee;
        let _e136 = hr_2;
        let _e137 = global.uKnee;
        let _e139 = global.uUpper;
        local_5 = (_e135 + ((_e136 - _e137) * _e139));
    }
    let _e143 = local_5;
    return _e143;
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
    let _e134 = hr_4;
    let _e135 = drawnH(_e134);
    h_3 = _e135;
    let _e137 = hr_4;
    let _e139 = global.uRayleighH;
    dR_1 = exp((-(_e137) / _e139));
    let _e143 = hr_4;
    let _e145 = global.uMieH;
    dM_1 = exp((-(_e143) / _e145));
    let _e149 = global.uAbsExp;
    if (_e149 > 0.5f) {
        let _e152 = dR_1;
        local_6 = _e152;
    } else {
        let _e155 = h_3;
        let _e156 = global.uAbsCenter;
        let _e159 = global.uAbsWidth;
        local_6 = max(0f, (1f - (abs((_e155 - _e156)) / max(_e159, 1f))));
    }
    let _e166 = local_6;
    dA_1 = _e166;
    let _e168 = global.uHaze;
    let _e170 = gHazeK;
    let _e172 = hr_4;
    let _e176 = global.uHaze;
    let _e183 = global.uHazeCol;
    dH_1 = (((_e168.x * _e170) * exp((-(max(_e172, 0f)) / max(_e176.y, 1f)))) * _e183);
    let _e186 = global.uRayleigh;
    let _e187 = dR_1;
    (*scatR_1) = (_e186 * _e187);
    let _e189 = global.uMie;
    let _e190 = dM_1;
    let _e192 = dH_1;
    (*scatM_1) = ((_e189 * _e190) + _e192);
    let _e194 = (*scatR_1);
    let _e195 = (*scatM_1);
    let _e197 = global.uMieAbs;
    let _e198 = dM_1;
    let _e201 = global.uAbs;
    let _e202 = dA_1;
    let _e205 = dH_1;
    let _e206 = global.uHaze;
    (*ext_1) = ((((_e194 + _e195) + (_e197 * _e198)) + (_e201 * _e202)) + (_e205 * _e206.z));
    return;
}

fn phaseRayleigh(c_1: f32) -> f32 {
    var c_2: f32;

    c_2 = c_1;
    let _e137 = c_2;
    let _e138 = c_2;
    return (0.059683103f * (1f + (_e137 * _e138)));
}

fn phaseCS(c_3: f32, g: f32) -> f32 {
    var c_4: f32;
    var g_1: f32;
    var g2_: f32;

    c_4 = c_3;
    g_1 = g;
    let _e133 = g_1;
    let _e134 = g_1;
    g2_ = (_e133 * _e134);
    let _e143 = g2_;
    let _e146 = c_4;
    let _e147 = c_4;
    let _e153 = g2_;
    let _e156 = g2_;
    let _e159 = g_1;
    let _e161 = c_4;
    return ((0.119366206f * ((1f - _e143) * (1f + (_e146 * _e147)))) / ((2f + _e153) * pow(max(((1f + _e156) - ((2f * _e159) * _e161)), 0.0001f), 1.5f)));
}

fn phaseHG(c_5: f32, g_2: f32) -> f32 {
    var c_6: f32;
    var g_3: f32;

    c_6 = c_5;
    g_3 = g_2;
    let _e134 = g_3;
    let _e135 = g_3;
    let _e142 = g_3;
    let _e143 = g_3;
    let _e147 = g_3;
    let _e149 = c_6;
    return ((1f - (_e134 * _e135)) / (12.566371f * pow(max(((1f + (_e142 * _e143)) - ((2f * _e147) * _e149)), 0.000001f), 1.5f)));
}

fn phaseMie(c_7: f32) -> vec3<f32> {
    var c_8: f32;

    c_8 = c_7;
    let _e131 = c_8;
    let _e132 = global.uMieG;
    let _e134 = phaseCS(_e131, _e132.x);
    let _e135 = c_8;
    let _e136 = global.uMieG;
    let _e138 = phaseCS(_e135, _e136.y);
    let _e139 = c_8;
    let _e140 = global.uMieG;
    let _e142 = phaseCS(_e139, _e140.z);
    let _e144 = c_8;
    let _e145 = global.uMieGL;
    let _e147 = phaseHG(_e144, _e145.x);
    let _e148 = c_8;
    let _e149 = global.uMieGL;
    let _e151 = phaseHG(_e148, _e149.y);
    let _e152 = c_8;
    let _e153 = global.uMieGL;
    let _e155 = phaseHG(_e152, _e153.z);
    let _e157 = global.uMieF;
    return mix(vec3<f32>(_e134, _e138, _e142), vec3<f32>(_e147, _e151, _e155), _e157);
}

fn distToTop(r_6: f32, mu_4: f32) -> f32 {
    var r_7: f32;
    var mu_5: f32;
    var disc_1: f32;

    r_7 = r_6;
    mu_5 = mu_4;
    let _e133 = r_7;
    let _e134 = r_7;
    let _e136 = mu_5;
    let _e137 = mu_5;
    let _e142 = global.uTop;
    let _e143 = global.uTop;
    disc_1 = (((_e133 * _e134) * ((_e136 * _e137) - 1f)) + (_e142 * _e143));
    let _e148 = r_7;
    let _e150 = mu_5;
    let _e152 = disc_1;
    return max(0f, ((-(_e148) * _e150) + sqrt(max(_e152, 0f))));
}

fn hitsGround(r_8: f32, mu_6: f32, gr: f32) -> bool {
    var r_9: f32;
    var mu_7: f32;
    var gr_1: f32;

    r_9 = r_8;
    mu_7 = mu_6;
    gr_1 = gr;
    let _e135 = mu_7;
    let _e138 = r_9;
    let _e139 = r_9;
    let _e141 = mu_7;
    let _e142 = mu_7;
    let _e147 = gr_1;
    let _e148 = gr_1;
    return ((_e135 < 0f) && ((((_e138 * _e139) * ((_e141 * _e142) - 1f)) + (_e147 * _e148)) >= 0f));
}

fn transmittanceToTop(r_10: f32, mu_8: f32) -> vec3<f32> {
    var r_11: f32;
    var mu_9: f32;
    var uv_2: vec2<f32>;

    r_11 = r_10;
    mu_9 = mu_8;
    let _e133 = r_11;
    let _e134 = global.uBottom;
    let _e135 = global.uTop;
    let _e137 = mu_9;
    let _e138 = transmittanceUV(clamp(_e133, _e134, _e135), _e137);
    uv_2 = _e138;
    let _e147 = uv_2;
    uv_2 = (vec2<f32>(0.001953125f, 0.0078125f) + (_e147 * vec2<f32>(0.99609375f, 0.984375f)));
    let _e157 = uv_2;
    let _e159 = textureSampleLevel(tTransTexture, tTransSampler, _e157, 0f);
    return _e159.xyz;
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
    let _e133 = mu_11;
    let _e134 = liftMu(_e133);
    mu_11 = _e134;
    let _e135 = global.uGround;
    let _e136 = global.uTrueK;
    Rg = (_e135 * max(_e136, 1f));
    let _e141 = Rg;
    let _e142 = Rg;
    let _e143 = r_13;
    let _e144 = global.uGround;
    sinH = (_e141 / (_e142 + max((_e143 - _e144), 0f)));
    let _e153 = sinH;
    let _e154 = sinH;
    cosH = -(sqrt(max(0f, (1f - (_e153 * _e154)))));
    let _e161 = cosH;
    let _e164 = cosH;
    let _e167 = mu_11;
    vis = smoothstep((_e161 - 0.004f), (_e164 + 0.004f), _e167);
    let _e170 = r_13;
    let _e171 = mu_11;
    let _e172 = transmittanceToTop(_e170, _e171);
    let _e173 = vis;
    return (_e172 * _e173);
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
    let _e135 = global.uRadius;
    let _e136 = rK_1;
    let _e137 = Rk_1;
    let _e139 = drawnH((_e136 - _e137));
    rD = (_e135 + _e139);
    let _e142 = Rk_1;
    let _e143 = global.uGround;
    let _e144 = global.uRadius;
    let _e146 = realH((_e143 - _e144));
    gK = (_e142 + _e146);
    let _e149 = gK;
    let _e150 = rK_1;
    let _e151 = gK;
    sinH_1 = (_e149 / max(_e150, _e151));
    let _e157 = sinH_1;
    let _e158 = sinH_1;
    cosH_1 = -(sqrt(max(0f, (1f - (_e157 * _e158)))));
    let _e165 = rD;
    let _e166 = global.uBottom;
    let _e167 = global.uTop;
    let _e169 = mu_13;
    let _e170 = transmittanceToTop(clamp(_e165, _e166, _e167), _e169);
    let _e171 = cosH_1;
    let _e174 = cosH_1;
    let _e177 = mu_13;
    return (_e170 * smoothstep((_e171 - 0.004f), (_e174 + 0.004f), _e177));
}

fn multiScatterAt(r_14: f32, muT: f32) -> vec3<f32> {
    var r_15: f32;
    var muT_1: f32;
    var uv_3: vec2<f32>;

    r_15 = r_14;
    muT_1 = muT;
    let _e133 = muT_1;
    let _e138 = r_15;
    let _e139 = global.uBottom;
    let _e141 = global.uTop;
    let _e142 = global.uBottom;
    uv_3 = vec2<f32>(((_e133 * 0.5f) + 0.5f), ((_e138 - _e139) / (_e141 - _e142)));
    let _e147 = uv_3;
    uv_3 = clamp(_e147, vec2(0f), vec2(1f));
    let _e157 = uv_3;
    uv_3 = (vec2(0.015625f) + (_e157 * 0.96875f));
    let _e163 = uv_3;
    let _e165 = textureSampleLevel(tMSTexture, tMSSampler, _e163, 0f);
    return _e165.xyz;
}

fn multiScatter(r_16: f32, muS: f32) -> vec3<f32> {
    var r_17: f32;
    var muS_1: f32;

    r_17 = r_16;
    muS_1 = muS;
    let _e133 = r_17;
    let _e134 = muS_1;
    let _e135 = liftMu(_e134);
    let _e136 = multiScatterAt(_e133, _e135);
    return _e136;
}

fn skyTrueEl(e: f32) -> f32 {
    var e_1: f32;
    var zd_2: f32;
    var hD_1: f32;
    var hT_1: f32;
    var local_7: f32;

    e_1 = e;
    let _e131 = global.uSkyView;
    let _e133 = global.uSkyView;
    if (_e131.y <= _e133.z) {
        let _e136 = e_1;
        return _e136;
    }
    let _e138 = e_1;
    zd_2 = (1.5707963f - _e138);
    let _e142 = global.uSkyView;
    hD_1 = (1.5707963f + _e142.y);
    let _e147 = global.uSkyView;
    hT_1 = (1.5707963f + _e147.z);
    let _e152 = zd_2;
    let _e153 = hD_1;
    if (_e152 <= _e153) {
        let _e155 = zd_2;
        let _e156 = hT_1;
        let _e158 = hD_1;
        local_7 = ((_e155 * _e156) / _e158);
    } else {
        let _e160 = hT_1;
        let _e161 = zd_2;
        let _e162 = hD_1;
        let _e165 = hT_1;
        let _e169 = hD_1;
        local_7 = (_e160 + (((_e161 - _e162) * (3.1415927f - _e165)) / (3.1415927f - _e169)));
    }
    let _e174 = local_7;
    return (1.5707963f - _e174);
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
    let _e131 = global.uSkyView;
    if (_e131.x <= 0f) {
        return vec3(0f);
    }
    let _e137 = D_1;
    let _e138 = global.uSkyUp;
    s = clamp(dot(_e137, _e138), -1f, 1f);
    let _e145 = s;
    let _e147 = skyTrueEl(asin(_e145));
    el = _e147;
    let _e149 = D_1;
    let _e150 = global.uSkyUp;
    let _e151 = s;
    hD_2 = (_e149 - (_e150 * _e151));
    let _e155 = hD_2;
    hl = length(_e155);
    let _e158 = hl;
    if (_e158 > 0.00001f) {
        let _e161 = hD_2;
        let _e162 = hl;
        let _e165 = global.uSkySunH;
        local_8 = acos(clamp(dot((_e161 / vec3(_e162)), _e165), -1f, 1f));
    } else {
        local_8 = 0f;
    }
    let _e174 = local_8;
    az = _e174;
    let _e178 = el;
    let _e181 = el;
    v = (0.5f + ((0.5f * sign(_e178)) * sqrt((abs(_e181) / 1.5707963f))));
    let _e189 = az;
    let _e192 = v;
    let _e195 = textureSampleLevel(tSkyViewTexture, tSkyViewSampler, vec2<f32>((_e189 / 3.1415927f), _e192), 0f);
    let _e197 = global.uSkyView;
    return (_e195.xyz * _e197.x);
}

fn hash13_(p3_: vec3<f32>) -> f32 {
    var p3_1: vec3<f32>;

    p3_1 = p3_;
    let _e131 = p3_1;
    p3_1 = fract((_e131 * 0.1031f));
    let _e135 = p3_1;
    let _e136 = p3_1;
    let _e137 = p3_1;
    p3_1 = (_e135 + vec3(dot(_e136, (_e137.zyx + vec3(31.32f)))));
    let _e145 = p3_1;
    let _e147 = p3_1;
    let _e150 = p3_1;
    return fract(((_e145.x + _e147.y) * _e150.z));
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
    let _e131 = p_3;
    i = floor(_e131);
    let _e134 = p_3;
    f = fract(_e134);
    let _e137 = f;
    let _e138 = f;
    let _e142 = f;
    u = ((_e137 * _e138) * (vec3(3f) - (2f * _e142)));
    let _e148 = i;
    let _e149 = hash13_(_e148);
    n000_ = _e149;
    let _e151 = i;
    let _e160 = hash13_((_e151 + vec3<f32>(1f, 0f, 0f)));
    n100_ = _e160;
    let _e162 = i;
    let _e171 = hash13_((_e162 + vec3<f32>(0f, 1f, 0f)));
    n010_ = _e171;
    let _e173 = i;
    let _e182 = hash13_((_e173 + vec3<f32>(1f, 1f, 0f)));
    n110_ = _e182;
    let _e184 = i;
    let _e193 = hash13_((_e184 + vec3<f32>(0f, 0f, 1f)));
    n001_ = _e193;
    let _e195 = i;
    let _e204 = hash13_((_e195 + vec3<f32>(1f, 0f, 1f)));
    n101_ = _e204;
    let _e206 = i;
    let _e215 = hash13_((_e206 + vec3<f32>(0f, 1f, 1f)));
    n011_ = _e215;
    let _e217 = i;
    let _e226 = hash13_((_e217 + vec3<f32>(1f, 1f, 1f)));
    n111_ = _e226;
    let _e228 = n000_;
    let _e229 = n100_;
    let _e230 = u;
    let _e233 = n010_;
    let _e234 = n110_;
    let _e235 = u;
    let _e238 = u;
    let _e241 = n001_;
    let _e242 = n101_;
    let _e243 = u;
    let _e246 = n011_;
    let _e247 = n111_;
    let _e248 = u;
    let _e251 = u;
    let _e254 = u;
    return ((mix(mix(mix(_e228, _e229, _e230.x), mix(_e233, _e234, _e235.x), _e238.y), mix(mix(_e241, _e242, _e243.x), mix(_e246, _e247, _e248.x), _e251.y), _e254.z) * 2f) - 1f);
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
        let _e140 = i_1;
        if !((_e140 < 8i)) {
            break;
        }
        {
            let _e147 = i_1;
            let _e148 = oct_1;
            if (_e147 >= _e148) {
                break;
            }
            let _e150 = s_1;
            let _e151 = a;
            let _e152 = p_5;
            let _e153 = vnoise(_e152);
            s_1 = (_e150 + (_e151 * _e153));
            let _e156 = p_5;
            p_5 = (((NROT * _e156) * 2.02f) + vec3(1.7f));
            let _e163 = a;
            a = (_e163 * 0.5f);
        }
        continuing {
            let _e144 = i_1;
            i_1 = (_e144 + 1i);
        }
    }
    let _e166 = s_1;
    return _e166;
}

fn ign(p_6: vec2<f32>) -> f32 {
    var p_7: vec2<f32>;

    p_7 = p_6;
    let _e134 = p_7;
    return fract((52.982918f * fract(dot(_e134, vec2<f32>(0.06711056f, 0.00583715f)))));
}

fn airLight(p_8: vec3<f32>, r_18: f32) -> vec3<f32> {
    var p_9: vec3<f32>;
    var r_19: f32;
    var hgt: f32;

    p_9 = p_8;
    r_19 = r_18;
    let _e136 = global.uAurora;
    if (_e136.w <= 0f) {
        return vec3(0f);
    }
    let _e142 = r_19;
    let _e143 = global.uRadius;
    let _e145 = global.uTop;
    let _e146 = global.uRadius;
    hgt = ((_e142 - _e143) / (_e145 - _e146));
    let _e150 = global.uAurora;
    let _e152 = hgt;
    let _e162 = global.uAirglowCol;
    let _e164 = global.uTop;
    let _e165 = global.uRadius;
    return (((_e150.w * exp(-(pow(((_e152 - 0.6f) / 0.03f), 2f)))) * _e162) / vec3((_e164 - _e165)));
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
    let _e136 = pf_1;
    let _e137 = global.uMagAxis;
    ml = asin(clamp(dot(_e136, _e137), -1f, 1f));
    let _e145 = ml;
    aml = abs(_e145);
    let _e148 = global.uAurora;
    if (_e148.y < 0f) {
        let _e153 = pf_1;
        let _e158 = global.uTime;
        let _e164 = textureSampleLevel(tNoiseTexture, tNoiseSampler, ((_e153 * 3f) + vec3<f32>(0f, 0f, (_e158 * 0.002f))), 0f);
        return (0.3f * _e164.x);
    }
    let _e167 = aml;
    let _e168 = global.uAurora;
    let _e171 = global.uAurora;
    band = exp(-(pow(((_e167 - _e168.y) / _e171.z), 2f)));
    let _e179 = band;
    if (_e179 < 0.02f) {
        return 0f;
    }
    let _e183 = global.uMagAxis;
    let _e184 = global.uMagAxis;
    if (abs(_e184.z) < 0.9f) {
        local_9 = vec3<f32>(0f, 0f, 1f);
    } else {
        local_9 = vec3<f32>(1f, 0f, 0f);
    }
    let _e198 = local_9;
    e1_ = normalize(cross(_e183, _e198));
    let _e202 = global.uMagAxis;
    let _e203 = e1_;
    e2_ = cross(_e202, _e203);
    let _e206 = pf_1;
    let _e207 = e2_;
    let _e209 = pf_1;
    let _e210 = e1_;
    mlon = atan2(dot(_e206, _e207), dot(_e209, _e210));
    let _e214 = mlon;
    let _e216 = mlon;
    cs = vec2<f32>(cos(_e214), sin(_e216));
    let _e220 = ml;
    if (_e220 > 0f) {
        local_10 = 0f;
    } else {
        local_10 = 5.3f;
    }
    let _e226 = local_10;
    side = _e226;
    loop {
        let _e232 = j;
        if !((_e232 < 2i)) {
            break;
        }
        {
            let _e239 = j;
            fj = f32(_e239);
            let _e242 = cs;
            let _e244 = (_e242 * 0.6f);
            let _e245 = side;
            let _e246 = fj;
            let _e250 = global.uTime;
            let _e258 = textureSampleLevel(tNoiseTexture, tNoiseSampler, vec3<f32>(_e244.x, _e244.y, ((_e245 + (_e246 * 2.7f)) + (_e250 * 0.0015f))), 0f);
            wig = (_e258.x - 0.5f);
            let _e263 = wig;
            let _e265 = cs;
            let _e267 = (_e265 * 2.3f);
            let _e268 = side;
            let _e269 = fj;
            let _e273 = global.uTime;
            let _e281 = textureSampleLevel(tNoiseTexture, tNoiseSampler, vec3<f32>(_e267.x, _e267.y, ((_e268 + (_e269 * 1.3f)) + (_e273 * 0.004f))), 0f);
            wig = (_e263 + (0.45f * (_e281.x - 0.5f)));
            let _e287 = global.uAurora;
            let _e289 = fj;
            let _e292 = global.uAurora;
            let _e298 = wig;
            let _e299 = global.uAurora;
            lineLat = ((_e287.y + (((_e289 - 0.5f) * _e292.z) * 0.9f)) + ((_e298 * _e299.z) * 2.2f));
            let _e306 = global.uAurora;
            w0_ = (_e306.z * 0.035f);
            let _e311 = w0_;
            let _e312 = w0_;
            let _e314 = blur_1;
            let _e315 = blur_1;
            w = sqrt(((_e311 * _e312) + (_e314 * _e315)));
            let _e320 = aml;
            let _e321 = lineLat;
            let _e323 = w;
            d_5 = ((_e320 - _e321) / _e323);
            let _e326 = d_5;
            let _e328 = d_5;
            let _e331 = w0_;
            let _e333 = w;
            arc = ((exp((-(_e326) * _e328)) * _e331) / _e333);
            let _e336 = arc;
            if (_e336 < 0.01f) {
                continue;
            }
            let _e339 = cs;
            let _e341 = (_e339 * 5f);
            let _e342 = side;
            let _e343 = fj;
            let _e347 = global.uTime;
            let _e355 = textureSampleLevel(tNoiseTexture, tNoiseSampler, vec3<f32>(_e341.x, _e341.y, ((_e342 + (_e343 * 0.61f)) + (_e347 * 0.02f))), 0f);
            rays = _e355.x;
            let _e358 = b;
            let _e359 = arc;
            let _e362 = rays;
            let _e364 = rays;
            b = (_e358 + (_e359 * (0.25f + ((1.8f * _e362) * _e364))));
        }
        continuing {
            let _e236 = j;
            j = (_e236 + 1i);
        }
    }
    let _e369 = b;
    let _e370 = band;
    return (_e369 * _e370);
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
    let _e148 = global.uAurora;
    if (_e148.x <= 0f) {
        return;
    }
    let _e152 = global.uTop;
    let _e153 = global.uRadius;
    H_1 = (_e152 - _e153);
    let _e156 = global.uRadius;
    let _e158 = H_1;
    aLo = (_e156 + (0.55f * _e158));
    let _e162 = global.uRadius;
    let _e164 = H_1;
    aHi = (_e162 + (0.98f * _e164));
    let _e168 = perp_2;
    let _e169 = perp_2;
    pp = dot(_e168, _e169);
    let _e172 = pp;
    let _e173 = aHi;
    let _e174 = aHi;
    if (_e172 >= (_e173 * _e174)) {
        return;
    }
    let _e179 = aHi;
    let _e180 = aLo;
    let _e182 = K;
    slab = ((_e179 - _e180) / f32(_e182));
    loop {
        let _e188 = i_2;
        let _e189 = K;
        if !((_e188 < _e189)) {
            break;
        }
        {
            let _e195 = i_2;
            let _e197 = jitter_1;
            let _e199 = K;
            x = ((f32(_e195) + _e197) / f32(_e199));
            let _e203 = aLo;
            let _e204 = aHi;
            let _e205 = x;
            a_1 = mix(_e203, _e204, _e205);
            let _e208 = pp;
            let _e209 = a_1;
            let _e210 = a_1;
            if (_e208 >= (_e209 * _e210)) {
                continue;
            }
            let _e213 = a_1;
            let _e214 = a_1;
            let _e216 = pp;
            s_2 = sqrt(((_e213 * _e214) - _e216));
            let _e222 = x;
            let _e226 = x;
            prof = (smoothstep(0f, 0.04f, _e222) * exp((-2.5f * _e226)));
            let _e231 = global.uAuroraLo;
            let _e232 = global.uAuroraHi;
            let _e235 = x;
            let _e239 = prof;
            let _e241 = global.uAurora;
            let _e244 = H_1;
            col = (((mix(_e231, _e232, vec3(smoothstep(0.3f, 0.85f, _e235))) * _e239) * _e241.x) / vec3(_e244));
            k_2 = 0i;
            loop {
                let _e250 = k_2;
                if !((_e250 < 2i)) {
                    break;
                }
                {
                    let _e257 = k_2;
                    if (_e257 == 0i) {
                        let _e260 = tca_2;
                        let _e261 = s_2;
                        local_11 = (_e260 - _e261);
                    } else {
                        let _e263 = tca_2;
                        let _e264 = s_2;
                        local_11 = (_e263 + _e264);
                    }
                    let _e267 = local_11;
                    t = _e267;
                    let _e269 = t;
                    let _e272 = t;
                    let _e273 = tMax_1;
                    if ((_e269 <= 0f) || (_e272 >= _e273)) {
                        continue;
                    }
                    let _e276 = t;
                    let _e277 = tca_2;
                    let _e279 = D_3;
                    let _e281 = perp_2;
                    p_10 = (((_e276 - _e277) * _e279) - _e281);
                    let _e284 = t;
                    let _e285 = tca_2;
                    let _e287 = a_1;
                    mu_14 = ((_e284 - _e285) / _e287);
                    let _e290 = slab;
                    let _e292 = mu_14;
                    let _e293 = mu_14;
                    let _e300 = mu_14;
                    let _e305 = t;
                    let _e306 = gPixA;
                    let _e309 = a_1;
                    blur_2 = ((((_e290 * sqrt(max((1f - (_e292 * _e293)), 0f))) / max(abs(_e300), 0.04f)) + (_e305 * _e306)) / _e309);
                    let _e312 = global.uToFixed;
                    let _e313 = p_10;
                    let _e314 = a_1;
                    let _e318 = blur_2;
                    let _e319 = auroraArcs((_e312 * (_e313 / vec3(_e314))), _e318);
                    b_1 = _e319;
                    let _e321 = b_1;
                    if (_e321 <= 0f) {
                        continue;
                    }
                    let _e324 = col;
                    let _e325 = b_1;
                    let _e327 = slab;
                    let _e329 = mu_14;
                    e_2 = (((_e324 * _e325) * _e327) / vec3(max(abs(_e329), 0.04f)));
                    let _e336 = k_2;
                    if (_e336 == 0i) {
                        let _e339 = (*near);
                        let _e340 = e_2;
                        (*near) = (_e339 + _e340);
                    } else {
                        let _e342 = (*far);
                        let _e343 = e_2;
                        (*far) = (_e342 + _e343);
                    }
                }
                continuing {
                    let _e254 = k_2;
                    k_2 = (_e254 + 1i);
                }
            }
        }
        continuing {
            let _e192 = i_2;
            i_2 = (_e192 + 1i);
        }
    }
    return;
}

fn blackbodyGlow(T: f32) -> vec3<f32> {
    var T_1: f32;
    var g_4: f32;

    T_1 = T;
    let _e134 = T_1;
    if (_e134 < 650f) {
        return vec3(0f);
    }
    let _e142 = T_1;
    g_4 = max(0f, (0.0287f + (0.000237f * (_e142 - 1000f))));
    let _e150 = g_4;
    let _e156 = T_1;
    let _e162 = g_4;
    return (vec3<f32>(1f, _e150, 0f) * ((600000f * exp((-24060f / _e156))) / (0.2126f + (0.7152f * _e162))));
}

fn airHeatGlow(r_20: f32) -> vec3<f32> {
    var r_21: f32;
    var local_12: vec3<f32>;

    r_21 = r_20;
    let _e134 = global.uThermal;
    if (_e134.x > 0f) {
        let _e138 = global.uThermal;
        let _e140 = global.uThermal;
        let _e142 = r_21;
        let _e143 = global.uRadius;
        let _e149 = blackbodyGlow((_e138.x - (_e140.z * max((_e142 - _e143), 0f))));
        local_12 = _e149;
    } else {
        local_12 = vec3(0f);
    }
    let _e153 = local_12;
    return _e153;
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
    let _e137 = d_7;
    a_2 = abs(_e137);
    let _e140 = a_2;
    let _e142 = a_2;
    let _e145 = a_2;
    let _e147 = a_2;
    if ((_e140.x >= _e142.y) && (_e145.x >= _e147.z)) {
        let _e151 = d_7;
        if (_e151.x >= 0f) {
            local_13 = 0i;
        } else {
            local_13 = 1i;
        }
        let _e158 = local_13;
        local_17 = _e158;
    } else {
        let _e159 = a_2;
        let _e161 = a_2;
        if (_e159.y >= _e161.z) {
            let _e164 = d_7;
            if (_e164.y >= 0f) {
                local_14 = 2i;
            } else {
                local_14 = 3i;
            }
            let _e171 = local_14;
            local_16 = _e171;
        } else {
            let _e172 = d_7;
            if (_e172.z >= 0f) {
                local_15 = 4i;
            } else {
                local_15 = 5i;
            }
            let _e179 = local_15;
            local_16 = _e179;
        }
        let _e181 = local_16;
        local_17 = _e181;
    }
    let _e183 = local_17;
    f_1 = _e183;
    let _e185 = d_7;
    let _e186 = f_1;
    let _e190 = local_18[_e186];
    dn = dot(_e185, _e190);
    let _e193 = d_7;
    let _e194 = f_1;
    let _e198 = local_19[_e194];
    let _e200 = dn;
    let _e203 = d_7;
    let _e204 = f_1;
    let _e208 = local_20[_e204];
    let _e210 = dn;
    uv_4 = (((vec2<f32>(atan((dot(_e193, _e198) / _e200)), atan((dot(_e203, _e208) / _e210))) / vec2(0.785398f)) * 0.5f) + vec2(0.5f));
    let _e223 = uv_4;
    let _e224 = f_1;
    let _e228 = vec3<f32>(_e223.x, _e223.y, f32(_e224));
    let _e233 = textureSampleLevel(tHeightCubeTexture, tHeightCubeSampler, _e228.xy, i32(_e228.z), 0f);
    return _e233.x;
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
    let _e143 = global.uHeightCube;
    let _e147 = up_1;
    let _e148 = sF_1;
    if ((_e143.x < 0.5f) || (dot(_e147, _e148) < -0.2f)) {
        return 1f;
    }
    let _e155 = global.uHeightCube;
    texel = _e155.w;
    let _e158 = R_1;
    let _e159 = global.uHeightCube;
    top = (_e158 + _e159.z);
    let _e163 = pF_1;
    r0_ = length(_e163);
    let _e167 = R_1;
    let _e168 = up_1;
    let _e169 = heightCubeAt(_e168);
    let _e171 = r0_;
    below = max(0f, ((_e167 + _e169) - _e171));
    let _e175 = pF_1;
    let _e176 = up_1;
    let _e177 = texel;
    o = (_e175 + ((_e176 * _e177) * 0.1f));
    let _e183 = texel;
    t_1 = _e183;
    loop {
        let _e189 = i_3;
        if !((_e189 < 28i)) {
            break;
        }
        {
            let _e196 = o;
            let _e197 = sF_1;
            let _e198 = t_1;
            qp = (_e196 + (_e197 * _e198));
            let _e202 = qp;
            rq = length(_e202);
            let _e205 = rq;
            let _e206 = top;
            if (_e205 > _e206) {
                break;
            }
            let _e208 = rq;
            let _e209 = R_1;
            let _e210 = qp;
            let _e211 = rq;
            let _e214 = heightCubeAt((_e210 / vec3(_e211)));
            let _e217 = below;
            let _e218 = t_1;
            let _e221 = texel;
            d_8 = ((_e208 - (_e209 + _e214)) + (_e217 * exp((-(_e218) / (3f * _e221)))));
            let _e228 = sh;
            let _e229 = d_8;
            let _e230 = t_1;
            sh = min(_e228, clamp(((_e229 / (_e230 * 0.035f)) + 0.5f), 0f, 1f));
            let _e240 = sh;
            if (_e240 <= 0f) {
                break;
            }
            let _e243 = t_1;
            t_1 = (_e243 * 1.35f);
        }
        continuing {
            let _e193 = i_3;
            i_3 = (_e193 + 1i);
        }
    }
    let _e246 = sh;
    return _e246;
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
    let _e141 = global.uHeightCube;
    texel_1 = _e141.w;
    let _e144 = R_3;
    let _e145 = global.uHeightCube;
    top_1 = (_e144 + _e145.z);
    let _e149 = texel_1;
    t_2 = _e149;
    loop {
        let _e155 = i_4;
        if !((_e155 < 16i)) {
            break;
        }
        {
            let _e162 = pF_3;
            let _e163 = sF_3;
            let _e164 = t_2;
            qp_1 = (_e162 + (_e163 * _e164));
            let _e168 = qp_1;
            rq_1 = length(_e168);
            let _e171 = rq_1;
            let _e172 = top_1;
            if (_e171 > _e172) {
                break;
            }
            let _e174 = sh_1;
            let _e175 = rq_1;
            let _e176 = R_3;
            let _e177 = qp_1;
            let _e178 = rq_1;
            let _e181 = heightCubeAt((_e177 / vec3(_e178)));
            let _e184 = t_2;
            sh_1 = min(_e174, clamp((((_e175 - (_e176 + _e181)) / (_e184 * 0.035f)) + 0.5f), 0f, 1f));
            let _e194 = sh_1;
            if (_e194 <= 0f) {
                break;
            }
            let _e197 = t_2;
            t_2 = (_e197 * 1.6f);
        }
        continuing {
            let _e159 = i_4;
            i_4 = (_e159 + 1i);
        }
    }
    let _e200 = sh_1;
    return _e200;
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
    let _e139 = textureDimensions(tCloudMapTexture, 0i);
    sz = vec2<f32>(vec2<i32>(_e139));
    let _e143 = uv_6;
    let _e144 = sz;
    st = ((_e143 * _e144) - vec2(0.5f));
    let _e150 = st;
    i_5 = floor(_e150);
    let _e153 = st;
    let _e154 = i_5;
    f_2 = (_e153 - _e154);
    let _e157 = f_2;
    let _e158 = f_2;
    f2_ = (_e157 * _e158);
    let _e161 = f2_;
    let _e162 = f_2;
    f3_ = (_e161 * _e162);
    let _e167 = f_2;
    let _e172 = f2_;
    let _e175 = f3_;
    w0_1 = ((((vec2(1f) - (3f * _e167)) + (3f * _e172)) - _e175) / vec2(6f));
    let _e183 = f2_;
    let _e188 = f3_;
    w1_ = (((vec2(4f) - (6f * _e183)) + (3f * _e188)) / vec2(6f));
    let _e197 = f_2;
    let _e202 = f2_;
    let _e206 = f3_;
    w2_ = ((((vec2(1f) + (3f * _e197)) + (3f * _e202)) - (3f * _e206)) / vec2(6f));
    let _e213 = f3_;
    w3_ = (_e213 / vec2(6f));
    let _e218 = w0_1;
    let _e219 = w1_;
    g0_ = (_e218 + _e219);
    let _e222 = w2_;
    let _e223 = w3_;
    g1_ = (_e222 + _e223);
    let _e226 = i_5;
    let _e230 = w1_;
    let _e231 = g0_;
    let _e234 = sz;
    h0_ = (((_e226 - vec2(0.5f)) + (_e230 / _e231)) / _e234);
    let _e237 = i_5;
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
    var local_21: f32;
    var a_3: f32;
    var local_22: f32;
    var b_2: f32;
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
        local_21 = 0.682f;
    } else {
        let _e171 = qz;
        let _e172 = L0_;
        let _e176 = textureSampleLevel(tNoiseTexture, tNoiseSampler, (_e171 / vec3(_e172)), 0f);
        let _e179 = f0_;
        local_21 = mix(_e176.x, 0.682f, _e179);
    }
    let _e182 = local_21;
    a_3 = _e182;
    let _e184 = f1_;
    if (_e184 > 0.999f) {
        local_22 = 0.682f;
    } else {
        let _e188 = qz;
        let _e189 = L1_;
        let _e196 = textureSampleLevel(tNoiseTexture, tNoiseSampler, ((_e188 / vec3(_e189)) + vec3(0.5f)), 0f);
        let _e199 = f1_;
        local_22 = mix(_e196.x, 0.682f, _e199);
    }
    let _e202 = local_22;
    b_2 = _e202;
    let _e205 = f0_;
    let _e208 = f1_;
    spread = length(vec2<f32>((0.124f * _e205), (0.083f * _e208)));
    let _e214 = bias_1;
    let _e216 = spread;
    let _e219 = bias_1;
    let _e221 = spread;
    let _e223 = a_3;
    let _e226 = b_2;
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
    var f_3: f32;
    var local_23: f32;

    q_5 = q_4;
    foot_7 = foot_6;
    let _e140 = global.uRadius;
    L2_ = (_e140 * 0.064f);
    let _e144 = foot_7;
    let _e145 = L2_;
    let _e146 = cloudFade(_e144, _e145);
    f_3 = _e146;
    let _e148 = f_3;
    if (_e148 > 0.999f) {
        local_23 = 0.682f;
    } else {
        let _e152 = q_5;
        let _e153 = L2_;
        let _e157 = textureSampleLevel(tNoiseTexture, tNoiseSampler, (_e152 / vec3(_e153)), 0f);
        let _e160 = f_3;
        local_23 = mix(_e157.x, 0.682f, _e160);
    }
    let _e163 = local_23;
    return _e163;
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
    let _e140 = global.uCloudClock;
    T_2 = _e140.z;
    let _e143 = T_2;
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
    let _e187 = T_2;
    let _e189 = ph;
    s_3 = (((_e185.x / _e187) + _e189) + 4f);
    let _e194 = s_3;
    a_4 = floor(_e194);
    let _e197 = s_3;
    let _e198 = a_4;
    fa = (_e197 - _e198);
    let _e201 = s_3;
    b_3 = floor((_e201 + 0.5f));
    let _e206 = s_3;
    let _e209 = b_3;
    fb = ((_e206 + 0.5f) - _e209);
    let _e213 = dirF_5;
    let _e223 = dirF_5;
    let _e235 = dirF_5;
    j_1 = (0.065f * ((sin((dot(_e213, vec3<f32>(5.1f, 3.7f, -4.3f)) + 1.3f)) + sin((dot(_e223, vec3<f32>(-3.9f, 7.3f, 6.1f)) + 0.4f))) + (0.6f * sin((dot(_e235, vec3<f32>(11.3f, -8.9f, 7.7f)) + 2.1f)))));
    let _e249 = s_3;
    let _e250 = j_1;
    fj_1 = fract((_e249 + _e250));
    let _e258 = fj_1;
    wa = smoothstep(0.4f, 0.6f, (1f - abs(((2f * _e258) - 1f))));
    let _e266 = wa;
    let _e267 = fa;
    let _e270 = T_2;
    let _e273 = global.uCloudClock;
    let _e275 = a_4;
    (*gA) = vec3<f32>(_e266, ((_e267 - 0.5f) * _e270), (2f * (_e273.y + _e275)));
    let _e280 = wa;
    let _e282 = fb;
    let _e285 = T_2;
    let _e288 = global.uCloudClock;
    let _e290 = b_3;
    (*gB) = vec3<f32>((1f - _e280), ((_e282 - 0.5f) * _e285), ((2f * (_e288.y + _e290)) + 1f));
    return;
}

fn cloudGenOff(idx: f32) -> vec3<f32> {
    var idx_1: f32;
    var h_4: u32;

    idx_1 = idx;
    let _e138 = idx_1;
    h_4 = (u32(_e138) * 2654435761u);
    let _e143 = h_4;
    let _e144 = h_4;
    h_4 = (_e143 ^ (_e144 >> 15u));
    let _e148 = h_4;
    h_4 = (_e148 * 2246822519u);
    let _e151 = h_4;
    let _e152 = h_4;
    h_4 = (_e151 ^ (_e152 >> 13u));
    let _e156 = h_4;
    let _e160 = h_4;
    let _e166 = h_4;
    return (((vec3<f32>(f32((_e156 & 1023u)), f32(((_e160 >> 10u) & 1023u)), f32(((_e166 >> 20u) & 1023u))) / vec3(1024f)) - vec3(0.5f)) * 400000f);
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
    let _e191 = pf_3;
    let _e192 = east;
    let _e193 = U;
    let _e195 = g_6;
    let _e199 = g_6;
    let _e201 = cloudGenOff(_e199.z);
    return ((_e191 + ((_e192 * _e193) * _e195.y)) + _e201);
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
    let _e146 = dirF_9;
    cloudGens(_e146, (&gA_1), (&gB_1));
    let _e153 = dirF_9;
    let _e154 = cloudClimate(_e153);
    clim_2 = _e154;
    let _e156 = gA_1;
    if (_e156.x > 0.005f) {
        let _e160 = c_9;
        let _e161 = gA_1;
        let _e163 = pf_5;
        let _e164 = dirF_9;
        let _e165 = gA_1;
        let _e166 = cloudAdvect(_e163, _e164, _e165);
        let _e167 = foot_9;
        let _e168 = bias_5;
        let _e169 = clim_2;
        let _e170 = cloudCoverC(_e166, _e167, _e168, _e169);
        c_9 = (_e160 + (_e161.x * _e170));
    }
    let _e173 = gB_1;
    if (_e173.x > 0.005f) {
        let _e177 = c_9;
        let _e178 = gB_1;
        let _e180 = pf_5;
        let _e181 = dirF_9;
        let _e182 = gB_1;
        let _e183 = cloudAdvect(_e180, _e181, _e182);
        let _e184 = foot_9;
        let _e185 = bias_5;
        let _e186 = clim_2;
        let _e187 = cloudCoverC(_e183, _e184, _e185, _e186);
        c_9 = (_e177 + (_e178.x * _e187));
    }
    let _e190 = c_9;
    return _e190;
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
    let _e140 = pFixedDir_1;
    let _e141 = global.uRadius;
    pf_6 = (_e140 * _e141);
    let _e146 = pFixedDir_1;
    cloudGens(_e146, (&gA_2), (&gB_2));
    let _e153 = pFixedDir_1;
    let _e154 = cloudClimate(_e153);
    clim_3 = _e154;
    loop {
        let _e158 = j_2;
        if !((_e158 < 2i)) {
            break;
        }
        {
            let _e165 = j_2;
            if (_e165 == 0i) {
                let _e168 = gA_2;
                local_24 = _e168;
            } else {
                let _e169 = gB_2;
                local_24 = _e169;
            }
            let _e171 = local_24;
            g_7 = _e171;
            let _e173 = g_7;
            if (_e173.x <= 0.005f) {
                continue;
            }
            let _e177 = pf_6;
            let _e178 = pFixedDir_1;
            let _e179 = g_7;
            let _e180 = cloudAdvect(_e177, _e178, _e179);
            q_6 = _e180;
            let _e182 = q_6;
            let _e183 = foot_11;
            let _e184 = global.uCloud;
            let _e186 = cloudBias(_e184.z);
            let _e187 = clim_3;
            let _e188 = cloudCoverC(_e182, _e183, _e186, _e187);
            cov = _e188;
            let _e190 = d_9;
            let _e191 = g_7;
            let _e193 = cov;
            let _e197 = q_6;
            let _e198 = foot_11;
            let _e199 = cloudDetail(_e197, _e198);
            let _e200 = cov;
            d_9 = (_e190 + ((_e191.x * _e193) * smoothstep(0.15f, 0.55f, ((_e199 * _e200) + 0.25f))));
        }
        continuing {
            let _e162 = j_2;
            j_2 = (_e162 + 1i);
        }
    }
    let _e207 = d_9;
    return _e207;
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
    var sR: vec3<f32>;
    var sM: vec3<f32>;
    var e_3: vec3<f32>;
    var nT: vec3<f32>;
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
    let _e155 = t1_1;
    let _e156 = t0_1;
    if (_e155 <= _e156) {
        return;
    }
    let _e158 = t1_1;
    let _e159 = t0_1;
    let _e161 = steps_1;
    dt = ((_e158 - _e159) / f32(_e161));
    let _e165 = t0_1;
    let _e168 = global.uCenter;
    let _e170 = global.uRadius;
    let _e173 = global.uHaze;
    sq = ((_e165 < 1f) && ((length(_e168) - _e170) < (4f * _e173.y)));
    let _e179 = global.uCenter;
    upC_2 = normalize(-(_e179));
    let _e183 = global.uCenter;
    let _e185 = global.uRadius;
    let _e187 = trueK((length(_e183) - _e185));
    kT = _e187;
    let _e189 = cosTheta_1;
    let _e190 = phaseRayleigh(_e189);
    pR = _e190;
    let _e192 = cosTheta_1;
    let _e193 = phaseMie(_e192);
    pM = _e193;
    let _e195 = global.uMoonE;
    moon = (_e195.y > 0f);
    let _e200 = D_5;
    let _e201 = global.uMoonDir;
    cosM = dot(_e200, _e201);
    let _e204 = cosM;
    let _e205 = phaseRayleigh(_e204);
    pRm = _e205;
    let _e207 = cosM;
    let _e208 = phaseMie(_e207);
    pMm = _e208;
    loop {
        let _e212 = i_6;
        if !((_e212 < 32i)) {
            break;
        }
        {
            let _e219 = i_6;
            let _e220 = steps_1;
            if (_e219 >= _e220) {
                break;
            }
            let _e222 = t0_1;
            let _e223 = i_6;
            let _e225 = jitter_3;
            let _e227 = dt;
            t_3 = (_e222 + ((f32(_e223) + _e225) * _e227));
            let _e231 = dt;
            dti = _e231;
            let _e233 = sq;
            if _e233 {
                {
                    let _e234 = i_6;
                    let _e236 = jitter_3;
                    let _e238 = steps_1;
                    u_1 = ((f32(_e234) + _e236) / f32(_e238));
                    let _e242 = t0_1;
                    let _e243 = t1_1;
                    let _e244 = t0_1;
                    let _e246 = u_1;
                    let _e248 = u_1;
                    t_3 = (_e242 + (((_e243 - _e244) * _e246) * _e248));
                    let _e251 = t1_1;
                    let _e252 = t0_1;
                    let _e256 = u_1;
                    let _e258 = steps_1;
                    dti = (((((_e251 - _e252) * 2f) * _e256) / f32(_e258)) + 0.001f);
                }
            }
            let _e263 = t_3;
            let _e264 = tca_4;
            let _e266 = D_5;
            let _e268 = perp_4;
            p_11 = (((_e263 - _e264) * _e266) - _e268);
            let _e271 = p_11;
            r_22 = length(_e271);
            let _e277 = r_22;
            mediumAt(_e277, (&sR), (&sM), (&e_3));
            let _e284 = p_11;
            let _e285 = r_22;
            let _e286 = upC_2;
            let _e287 = kT;
            let _e288 = trueUp(_e284, _e285, _e286, _e287);
            nT = _e288;
            let _e290 = nT;
            let _e291 = global.uSunDir;
            muS_2 = dot(_e290, _e291);
            let _e294 = r_22;
            let _e295 = muS_2;
            let _e296 = sunTransmittance(_e294, _e295);
            sunT = _e296;
            let _e298 = global.uHeightCube;
            let _e302 = r_22;
            let _e303 = global.uRadius;
            let _e304 = global.uHeightCube;
            if ((_e298.x > 0.5f) && (_e302 < (_e303 + _e304.z))) {
                let _e309 = sunT;
                let _e310 = global.uToFixed;
                let _e311 = p_11;
                let _e313 = global.uToFixed;
                let _e314 = global.uSunDir;
                let _e316 = global.uRadius;
                let _e317 = airShadow((_e310 * _e311), (_e313 * _e314), _e316);
                sunT = (_e309 * _e317);
            }
            let _e319 = r_22;
            let _e320 = muS_2;
            let _e321 = multiScatter(_e319, _e320);
            ms = _e321;
            let _e323 = sR;
            let _e324 = sunT;
            let _e325 = pR;
            let _e327 = ms;
            let _e330 = sM;
            let _e331 = sunT;
            let _e332 = pM;
            let _e334 = ms;
            S = ((_e323 * ((_e324 * _e325) + _e327)) + (_e330 * ((_e331 * _e332) + _e334)));
            let _e339 = e_3;
            let _e341 = dti;
            Ts = exp((-(_e339) * _e341));
            let _e345 = e_3;
            eSafe = max(_e345, vec3(0.00000000000001f));
            let _e350 = (*L_2);
            let _e351 = (*T_3);
            let _e352 = S;
            let _e353 = S;
            let _e354 = Ts;
            let _e358 = eSafe;
            let _e360 = gAirSun;
            (*L_2) = (_e350 + (((_e351 * (_e352 - (_e353 * _e354))) / _e358) * _e360));
            let _e363 = moon;
            if _e363 {
                {
                    let _e364 = nT;
                    let _e365 = global.uMoonDir;
                    muM = dot(_e364, _e365);
                    let _e368 = r_22;
                    let _e369 = muM;
                    let _e370 = sunTransmittance(_e368, _e369);
                    mT = _e370;
                    let _e372 = r_22;
                    let _e373 = muM;
                    let _e374 = multiScatter(_e372, _e373);
                    mms = _e374;
                    let _e376 = sR;
                    let _e377 = mT;
                    let _e378 = pRm;
                    let _e380 = mms;
                    let _e383 = sM;
                    let _e384 = mT;
                    let _e385 = pMm;
                    let _e387 = mms;
                    Sm = ((_e376 * ((_e377 * _e378) + _e380)) + (_e383 * ((_e384 * _e385) + _e387)));
                    let _e392 = (*Lm);
                    let _e393 = (*T_3);
                    let _e394 = Sm;
                    let _e395 = Sm;
                    let _e396 = Ts;
                    let _e400 = eSafe;
                    (*Lm) = (_e392 + ((_e393 * (_e394 - (_e395 * _e396))) / _e400));
                }
            }
            let _e403 = gEm;
            let _e404 = (*T_3);
            let _e405 = p_11;
            let _e406 = r_22;
            let _e407 = airLight(_e405, _e406);
            let _e409 = dti;
            gEm = (_e403 + ((_e404 * _e407) * _e409));
            let _e412 = global.uThermal;
            if (_e412.x > 0f) {
                {
                    let _e416 = t0_1;
                    let _e417 = i_6;
                    let _e419 = dt;
                    let _e423 = dt;
                    let _e426 = e_3;
                    te = ((_e416 + (f32(_e417) * _e419)) + min((0.5f * _e423), (1f / max(_e426.y, 0.000000000001f))));
                    let _e434 = gEm;
                    let _e435 = (*T_3);
                    let _e438 = Ts;
                    let _e441 = te;
                    let _e442 = tca_4;
                    let _e444 = D_5;
                    let _e446 = perp_4;
                    let _e449 = airHeatGlow(length((((_e441 - _e442) * _e444) - _e446)));
                    gEm = (_e434 + ((_e435 * (vec3(1f) - _e438)) * _e449));
                }
            }
            let _e452 = (*T_3);
            let _e453 = Ts;
            (*T_3) = (_e452 * _e453);
        }
        continuing {
            let _e216 = i_6;
            i_6 = (_e216 + 1i);
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

    let _e138 = vUv_1;
    let _e139 = depthPixel(_e138);
    px = _e139;
    let _e141 = px;
    let _e147 = textureDimensions(tDepthTexture, 0i);
    ndc = ((((vec2<f32>(_e141) + vec2(0.5f)) / vec2<f32>(vec2<i32>(_e147))) * 2f) - vec2(1f));
    let _e158 = ndc;
    ndc.y = -(_e158.y);
    let _e161 = ndc;
    let _e163 = global.uTanHalf;
    let _e166 = ndc;
    let _e168 = global.uTanHalf;
    dView = normalize(vec3<f32>((_e161.x * _e163.x), (_e166.y * _e168.y), -1f));
    let _e176 = global.uCamRot;
    let _e177 = dView;
    D_6 = normalize((_e176 * _e177));
    let _e181 = D_6;
    let _e182 = fwidth(_e181);
    gPixA = length(_e182);
    let _e184 = px;
    let _e186 = textureLoad(tDepthTexture, _e184, 0i);
    depth = _e186.x;
    let _e189 = depth;
    let _e190 = isSkyDepth(_e189);
    if _e190 {
        local_25 = 1000000000000000000000000000000f;
    } else {
        let _e192 = depth;
        let _e193 = viewZFromDepth(_e192);
        let _e194 = dView;
        local_25 = (_e193 / max(-(_e194.z), 0.0001f));
    }
    let _e201 = local_25;
    sceneDist = _e201;
    let _e203 = global.uCenter;
    let _e204 = global.uTop;
    let _e205 = D_6;
    let _e206 = raySphere(_e203, _e204, _e205);
    hit = _e206;
    let _e208 = hit;
    let _e212 = hit;
    let _e214 = hit;
    let _e218 = hit;
    let _e220 = sceneDist;
    if (((_e208.y <= 0f) || (_e212.x > _e214.y)) || (_e218.x > _e220)) {
        {
            outL = vec4(0f);
            outT = vec4(1f);
            return;
        }
    }
    let _e227 = sceneDist;
    let _e230 = sceneDist;
    let _e231 = hit;
    skyPx = ((_e227 > 100000000000000000000000000000f) || (_e230 > _e231.y));
    let _e236 = skyPx;
    if _e236 {
        let _e238 = global.uSkyView;
        local_26 = (1f - _e238.x);
    } else {
        local_26 = 1f;
    }
    let _e243 = local_26;
    gHazeK = _e243;
    let _e244 = gHazeK;
    gAirSun = _e244;
    let _e245 = global.uCenter;
    let _e246 = D_6;
    tca_5 = dot(_e245, _e246);
    let _e249 = global.uCenter;
    let _e250 = tca_5;
    let _e251 = D_6;
    perp_5 = (_e249 - (_e250 * _e251));
    let _e255 = hit;
    t0_2 = max(_e255.x, 0f);
    let _e260 = hit;
    let _e262 = sceneDist;
    t1_2 = min(_e260.y, _e262);
    let _e265 = global.uCenter;
    let _e266 = global.uGround;
    let _e267 = D_6;
    let _e268 = raySphere(_e265, _e266, _e267);
    g_8 = _e268;
    let _e270 = g_8;
    let _e274 = g_8;
    let _e276 = g_8;
    let _e280 = g_8;
    if (((_e270.y > 0f) && (_e274.x < _e276.y)) && (_e280.x > 0f)) {
        let _e285 = t1_2;
        let _e286 = g_8;
        t1_2 = min(_e285, _e286.x);
    }
    let _e289 = D_6;
    let _e290 = global.uSunDir;
    cosTheta_2 = dot(_e289, _e290);
    let _e294 = gl_FragCoord_1;
    let _e296 = ign(_e294.xy);
    jitter_4 = _e296;
    let _e298 = global.uSteps;
    steps_2 = i32(_e298);
    gEm = vec3(0f);
    let _e317 = global.uCloudOn;
    if (_e317 > 0.5f) {
        {
            let _e320 = global.uRadius;
            let _e321 = global.uCloud;
            rc = (_e320 + _e321.x);
            let _e325 = global.uCenter;
            let _e326 = rc;
            let _e327 = D_6;
            let _e328 = raySphere(_e325, _e326, _e327);
            ch = _e328;
            let _e330 = global.uCenter;
            camR = length(_e330);
            let _e333 = ch;
            let _e337 = ch;
            let _e339 = ch;
            if ((_e333.y > 0f) && (_e337.x < _e339.y)) {
                {
                    let _e343 = camR;
                    let _e344 = rc;
                    if (_e343 > _e344) {
                        let _e346 = ch;
                        local_27 = _e346.x;
                    } else {
                        let _e348 = ch;
                        local_27 = _e348.y;
                    }
                    let _e351 = local_27;
                    cand = _e351;
                    let _e353 = cand;
                    let _e354 = t0_2;
                    let _e356 = cand;
                    let _e357 = t1_2;
                    if ((_e353 > _e354) && (_e356 < _e357)) {
                        let _e360 = cand;
                        tc = _e360;
                    }
                }
            } else {
                let _e361 = camR;
                let _e362 = rc;
                let _e364 = tca_5;
                let _e365 = t0_2;
                let _e368 = tca_5;
                let _e369 = t1_2;
                if (((_e361 > _e362) && (_e364 > _e365)) && (_e368 < _e369)) {
                    {
                        let _e372 = perp_5;
                        let _e374 = rc;
                        hb = (length(_e372) - _e374);
                        let _e377 = global.uCloud;
                        Hc = max((_e377.y * 0.25f), 1f);
                        let _e384 = hb;
                        let _e386 = Hc;
                        if (_e384 < (6f * _e386)) {
                            {
                                let _e389 = tca_5;
                                tc = _e389;
                                let _e393 = hb;
                                let _e395 = Hc;
                                graze = (1f - exp((-7.4f * exp((-(_e393) / _e395)))));
                            }
                        }
                    }
                }
            }
        }
    }
    let _e403 = D_6;
    let _e404 = tca_5;
    let _e405 = perp_5;
    let _e406 = hit;
    let _e408 = sceneDist;
    let _e410 = jitter_4;
    auroraRay(_e403, _e404, _e405, min(_e406.y, _e408), _e410, (&aNear), (&aFar));
    let _e415 = skyPx;
    if _e415 {
        let _e416 = D_6;
        let _e417 = skyFar(_e416);
        local_28 = _e417;
    } else {
        local_28 = vec3(0f);
    }
    let _e421 = local_28;
    far_1 = _e421;
    let _e423 = tc;
    if (_e423 < 0f) {
        {
            let _e426 = t0_2;
            let _e427 = t1_2;
            let _e428 = D_6;
            let _e429 = tca_5;
            let _e430 = perp_5;
            let _e431 = cosTheta_2;
            let _e432 = jitter_4;
            let _e435 = steps_2;
            march(_e426, _e427, _e428, _e429, _e430, _e431, _e432, (&L_3), (&T_4), _e435, (&Lm_1));
            let _e440 = L_3;
            let _e441 = far_1;
            let _e443 = global.uSunE;
            let _e445 = Lm_1;
            let _e446 = global.uMoonE;
            let _e449 = gEm;
            let _e451 = aNear;
            let _e453 = T_4;
            let _e454 = aFar;
            let _e456 = ((((((_e440 + _e441) * _e443) + (_e445 * _e446)) + _e449) + _e451) + (_e453 * _e454));
            outL = vec4<f32>(_e456.x, _e456.y, _e456.z, 1f);
            let _e462 = T_4;
            outT = vec4<f32>(_e462.x, _e462.y, _e462.z, 1f);
            return;
        }
    }
    let _e468 = t0_2;
    let _e469 = tc;
    let _e470 = D_6;
    let _e471 = tca_5;
    let _e472 = perp_5;
    let _e473 = cosTheta_2;
    let _e474 = jitter_4;
    let _e477 = steps_2;
    march(_e468, _e469, _e470, _e471, _e472, _e473, _e474, (&L_3), (&T_4), ((_e477 / 2i) + 2i), (&Lm_1));
    let _e486 = gEm;
    em1_ = _e486;
    gEm = vec3(0f);
    let _e490 = tc;
    let _e491 = tca_5;
    let _e493 = D_6;
    let _e495 = perp_5;
    pc = (((_e490 - _e491) * _e493) - _e495);
    let _e498 = pc;
    rc_1 = length(_e498);
    let _e501 = pc;
    let _e502 = rc_1;
    up_2 = (_e501 / vec3(_e502));
    let _e506 = global.uToFixed;
    let _e507 = up_2;
    let _e510 = tc;
    let _e511 = gPixA;
    let _e513 = cloudDensity(normalize((_e506 * _e507)), (_e510 * _e511));
    dens = _e513;
    let _e515 = dens;
    let _e516 = global.uCloudColor;
    let _e522 = graze;
    alpha = (clamp((_e515 * _e516.w), 0f, 1f) * _e522);
    let _e534 = tc;
    let _e535 = t1_2;
    let _e536 = D_6;
    let _e537 = tca_5;
    let _e538 = perp_5;
    let _e539 = cosTheta_2;
    let _e540 = jitter_4;
    let _e543 = steps_2;
    march(_e534, _e535, _e536, _e537, _e538, _e539, _e540, (&L2_1), (&T2_), ((_e543 / 2i) + 2i), (&Lm2_));
    let _e558 = alpha;
    if (_e558 > 0.002f) {
        {
            let _e561 = pc;
            let _e562 = rc_1;
            let _e563 = global.uCenter;
            let _e566 = global.uCenter;
            let _e568 = global.uRadius;
            let _e570 = trueK((length(_e566) - _e568));
            let _e571 = trueUp(_e561, _e562, normalize(-(_e563)), _e570);
            upT = _e571;
            let _e573 = upT;
            let _e574 = global.uSunDir;
            muS_3 = dot(_e573, _e574);
            let _e577 = rc_1;
            let _e578 = muS_3;
            let _e579 = sunTransmittance(_e577, _e578);
            sunT_1 = _e579;
            let _e581 = rc_1;
            let _e582 = muS_3;
            let _e583 = multiScatter(_e581, _e582);
            amb = (_e583 * 6f);
            let _e587 = D_6;
            let _e588 = up_2;
            fromBelow = (dot(_e587, _e588) > 0f);
            let _e593 = muS_3;
            let _e602 = muS_3;
            lambert = ((max(_e593, 0f) * 0.6f) + (0.4f * smoothstep(-0.1f, 0.3f, _e602)));
            let _e609 = cosTheta_2;
            silver = (1f + (1.5f * pow(max(_e609, 0f), 12f)));
            let _e617 = global.uCloudColor;
            let _e619 = sunT_1;
            let _e620 = lambert;
            let _e622 = silver;
            let _e627 = amb;
            lit = (_e617.xyz * ((((_e619 * _e620) * _e622) / vec3(3.1415927f)) + _e627));
            let _e631 = fromBelow;
            if _e631 {
                let _e632 = lit;
                let _e635 = dens;
                lit = (_e632 * mix(0.55f, 0.18f, _e635));
            }
            let _e638 = lit;
            cl = _e638;
            let _e639 = global.uMoonE;
            if (_e639.y > 0f) {
                {
                    let _e643 = upT;
                    let _e644 = global.uMoonDir;
                    muM_1 = dot(_e643, _e644);
                    let _e647 = muM_1;
                    let _e656 = muM_1;
                    lm = ((max(_e647, 0f) * 0.6f) + (0.4f * smoothstep(-0.1f, 0.3f, _e656)));
                    let _e661 = global.uCloudColor;
                    let _e663 = rc_1;
                    let _e664 = muM_1;
                    let _e665 = sunTransmittance(_e663, _e664);
                    let _e666 = lm;
                    let _e671 = rc_1;
                    let _e672 = muM_1;
                    let _e673 = multiScatter(_e671, _e672);
                    clm = (_e661.xyz * (((_e665 * _e666) / vec3(3.1415927f)) + (_e673 * 6f)));
                    let _e678 = fromBelow;
                    if _e678 {
                        let _e679 = clm;
                        let _e682 = dens;
                        clm = (_e679 * mix(0.55f, 0.18f, _e682));
                    }
                }
            }
        }
    }
    let _e685 = T_4;
    let _e687 = alpha;
    let _e690 = T2_;
    let _e691 = ((_e685 * (1f - _e687)) * _e690);
    outT = vec4<f32>(_e691.x, _e691.y, _e691.z, 1f);
    let _e697 = L_3;
    let _e698 = T_4;
    let _e700 = alpha;
    let _e702 = L2_1;
    let _e704 = alpha;
    let _e705 = cl;
    let _e711 = alpha;
    let _e713 = far_1;
    let _e716 = global.uSunE;
    let _e718 = Lm_1;
    let _e719 = T_4;
    let _e721 = alpha;
    let _e723 = Lm2_;
    let _e725 = alpha;
    let _e726 = clm;
    let _e731 = global.uMoonE;
    let _e734 = em1_;
    let _e736 = T_4;
    let _e738 = alpha;
    let _e741 = gEm;
    let _e744 = aNear;
    let _e746 = T_4;
    let _e748 = alpha;
    let _e751 = T2_;
    let _e753 = aFar;
    let _e755 = ((((((((_e697 + (_e698 * (((1f - _e700) * _e702) + (_e704 * _e705)))) + ((1f - _e711) * _e713)) * _e716) + ((_e718 + (_e719 * (((1f - _e721) * _e723) + (_e725 * _e726)))) * _e731)) + _e734) + ((_e736 * (1f - _e738)) * _e741)) + _e744) + (((_e746 * (1f - _e748)) * _e751) * _e753));
    outL = vec4<f32>(_e755.x, _e755.y, _e755.z, 1f);
    return;
}

@fragment 
fn main(@location(0) vUv: vec2<f32>, @builtin(position) gl_FragCoord: vec4<f32>) -> FragmentOutput {
    vUv_1 = vUv;
    gl_FragCoord_1 = gl_FragCoord;
    main_1();
    let _e173 = outL;
    let _e175 = outT;
    return FragmentOutput(_e173, _e175);
}
`;
