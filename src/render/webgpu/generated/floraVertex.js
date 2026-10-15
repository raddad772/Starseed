// Generated offline from the existing renderer equations. See tools/shaders/.
export const layout = {
  "uniforms": [
    {
      "name": "modelMatrix",
      "type": "mat4",
      "count": 0,
      "align": 16,
      "size": 64,
      "stride": 64,
      "offset": 0
    },
    {
      "name": "viewMatrix",
      "type": "mat4",
      "count": 0,
      "align": 16,
      "size": 64,
      "stride": 64,
      "offset": 64
    },
    {
      "name": "projectionMatrix",
      "type": "mat4",
      "count": 0,
      "align": 16,
      "size": 64,
      "stride": 64,
      "offset": 128
    },
    {
      "name": "uTime",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 192
    },
    {
      "name": "uCenter",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 208
    },
    {
      "name": "uToFixed",
      "type": "mat3",
      "count": 0,
      "align": 16,
      "size": 48,
      "stride": 48,
      "offset": 224
    },
    {
      "name": "uTopY",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 272
    },
    {
      "name": "uWindV",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 288
    },
    {
      "name": "uFadeStart",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 304
    },
    {
      "name": "uFadeEnd",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 308
    },
    {
      "name": "uSeason",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 320
    }
  ],
  "textures": [
    {
      "name": "tSeasonMap",
      "type": "sampler2D",
      "count": 0,
      "binding": 1,
      "samplerBinding": 2
    }
  ],
  "bytes": 336,
  "group": 0,
  "attributes": [
    {
      "name": "position",
      "type": "vec3",
      "location": 0
    },
    {
      "name": "normal",
      "type": "vec3",
      "location": 1
    },
    {
      "name": "instance0",
      "type": "vec4",
      "location": 2
    },
    {
      "name": "instance1",
      "type": "vec4",
      "location": 3
    },
    {
      "name": "instance2",
      "type": "vec4",
      "location": 4
    },
    {
      "name": "instance3",
      "type": "vec4",
      "location": 5
    },
    {
      "name": "instanceColor",
      "type": "vec3",
      "location": 6
    },
    {
      "name": "part",
      "type": "float",
      "location": 7
    },
    {
      "name": "ao",
      "type": "float",
      "location": 8
    },
    {
      "name": "tuv",
      "type": "vec2",
      "location": 9
    },
    {
      "name": "fTa",
      "type": "float",
      "location": 10
    }
  ]
};
export const code = /* wgsl */`
struct Params {
    modelMatrix: mat4x4<f32>,
    viewMatrix: mat4x4<f32>,
    projectionMatrix: mat4x4<f32>,
    uTime: f32,
    uCenter: vec3<f32>,
    uToFixed: mat3x3<f32>,
    uTopY: f32,
    uWindV: vec4<f32>,
    uFadeStart: f32,
    uFadeEnd: f32,
    uSeason: vec4<f32>,
}

struct VertexOutput {
    @location(0) vUv: vec2<f32>,
    @location(1) vWorld: vec3<f32>,
    @location(2) vNormal: vec3<f32>,
    @location(3) vPart: f32,
    @location(4) vAo: f32,
    @location(5) vTint: vec3<f32>,
    @location(6) vDist: f32,
    @location(7) vSnow: vec3<f32>,
    @location(8) vLocal: vec3<f32>,
    @location(9) vTop: f32,
    @builtin(position) gl_Position: vec4<f32>,
}

const PI: f32 = 3.1415927f;
const FROST_NL: f32 = 180f;
const FROST_NT: f32 = 9f;
const FROST_TILT0_: f32 = -40f;
const FROST_DTILT: f32 = 10f;
const SNOW_DEPTH_PER_MM: f32 = 0.003333f;
const DDF_SNOW: f32 = 4f;

@group(0) @binding(0) 
var<uniform> global: Params;
@group(0) @binding(1) 
var tSeasonMapTexture: texture_2d<f32>;
@group(0) @binding(2) 
var tSeasonMapSampler: sampler;
var<private> position_1: vec3<f32>;
var<private> normal_1: vec3<f32>;
var<private> instance0_1: vec4<f32>;
var<private> instance1_1: vec4<f32>;
var<private> instance2_1: vec4<f32>;
var<private> instance3_1: vec4<f32>;
var<private> instanceColor_1: vec3<f32>;
var<private> part_1: f32;
var<private> ao_1: f32;
var<private> tuv_1: vec2<f32>;
var<private> fTa_1: f32;
var<private> vUv: vec2<f32>;
var<private> vWorld: vec3<f32>;
var<private> vNormal: vec3<f32>;
var<private> vPart: f32;
var<private> vAo: f32;
var<private> vTint: vec3<f32>;
var<private> vDist: f32;
var<private> vSnow: vec3<f32>;
var<private> vLocal: vec3<f32>;
var<private> vTop: f32;
var<private> gl_Position: vec4<f32>;

fn seasonYear(dirF: vec3<f32>) -> vec3<f32> {
    var dirF_1: vec3<f32>;
    var m: vec4<f32>;

    dirF_1 = dirF;
    let _e48 = dirF_1;
    let _e50 = dirF_1;
    let _e57 = dirF_1;
    let _e70 = textureSampleLevel(tSeasonMapTexture, tSeasonMapSampler, vec2<f32>(((atan2(_e48.z, _e50.x) / 6.28319f) + 0.5f), ((asin(clamp(_e57.y, -1f, 1f)) / 3.14159f) + 0.5f)), 0f);
    m = _e70;
    let _e72 = m;
    let _e78 = m;
    let _e84 = m;
    let _e86 = m;
    return vec3<f32>(((_e72.x - 0.5f) * 100f), ((_e78.y - 0.5f) * 100f), ((_e84.z * _e86.z) * 600f));
}

fn seasonSWE(dirF_2: vec3<f32>, Ta: f32) -> f32 {
    var dirF_3: vec3<f32>;
    var Ta_1: f32;
    var yr: vec3<f32>;
    var a1_: f32;
    var b1_: f32;
    var P: f32;
    var A: f32;
    var local: f32;
    var th: f32;
    var acc: f32;
    var fall: f32;
    var mr: f32;
    var thaw: f32;
    var x: f32;

    dirF_3 = dirF_2;
    Ta_1 = Ta;
    let _e50 = dirF_3;
    let _e51 = seasonYear(_e50);
    yr = _e51;
    let _e53 = yr;
    a1_ = _e53.x;
    let _e56 = yr;
    b1_ = _e56.y;
    let _e59 = yr;
    P = _e59.z;
    let _e62 = a1_;
    let _e63 = b1_;
    A = length(vec2<f32>(_e62, _e63));
    let _e67 = Ta_1;
    let _e68 = A;
    if (_e67 >= _e68) {
        return 0f;
    }
    let _e71 = Ta_1;
    let _e72 = A;
    if (_e71 <= -(_e72)) {
        local = 0f;
    } else {
        let _e76 = Ta_1;
        let _e78 = A;
        local = acos(clamp((-(_e76) / _e78), -1f, 1f));
    }
    let _e86 = local;
    th = _e86;
    let _e89 = P;
    acc = ((12f * _e89) / 6.28319f);
    let _e94 = acc;
    let _e97 = th;
    fall = (_e94 * (6.28319f - (2f * _e97)));
    let _e102 = global.uSeason;
    mr = (_e102.y / 6.28319f);
    let _e107 = mr;
    let _e109 = Ta_1;
    let _e111 = th;
    let _e114 = A;
    let _e116 = th;
    thaw = (_e107 * (((2f * _e109) * _e111) + ((2f * _e114) * sin(_e116))));
    let _e122 = thaw;
    let _e125 = fall;
    if ((_e122 + 50f) <= _e125) {
        return 10000f;
    }
    let _e128 = th;
    if (_e128 <= 0f) {
        return 0f;
    }
    let _e132 = global.uSeason;
    let _e134 = b1_;
    let _e135 = a1_;
    x = (_e132.x - atan2(_e134, _e135));
    let _e139 = x;
    let _e141 = x;
    x = (_e139 - (6.28319f * floor(((_e141 + 3.14159f) / 6.28319f))));
    let _e149 = x;
    let _e150 = th;
    if (_e149 > _e150) {
        let _e152 = acc;
        let _e153 = x;
        let _e154 = th;
        return (_e152 * (_e153 - _e154));
    }
    let _e157 = x;
    let _e158 = th;
    if (_e157 < -(_e158)) {
        let _e161 = acc;
        let _e162 = x;
        let _e165 = th;
        return (_e161 * ((_e162 + 6.28319f) - _e165));
    }
    let _e169 = fall;
    let _e170 = mr;
    let _e171 = Ta_1;
    let _e172 = x;
    let _e173 = th;
    let _e176 = A;
    let _e177 = x;
    let _e179 = th;
    return max(0f, (_e169 - (_e170 * ((_e171 * (_e172 + _e173)) + (_e176 * (sin(_e177) + sin(_e179)))))));
}

fn main_1() {
    var p: vec3<f32>;
    var im: mat4x4<f32> = mat4x4<f32>(vec4<f32>(1f, 0f, 0f, 0f), vec4<f32>(0f, 1f, 0f, 0f), vec4<f32>(0f, 0f, 1f, 0f), vec4<f32>(0f, 0f, 0f, 1f));
    var phase: f32;
    var wp: vec4<f32>;
    var leaf: bool;
    var sway: f32;
    var local_1: f32;
    var dirF_4: vec3<f32>;
    var swe: f32;
    var yr_1: vec3<f32>;
    var Tn: f32;
    var upW: vec3<f32>;
    var ny: f32;

    let _e52 = position_1;
    p = _e52;
    let _e62 = instance0_1;
    let _e63 = instance1_1;
    let _e64 = instance2_1;
    let _e65 = instance3_1;
    im = mat4x4<f32>(vec4<f32>(_e62.x, _e62.y, _e62.z, _e62.w), vec4<f32>(_e63.x, _e63.y, _e63.z, _e63.w), vec4<f32>(_e64.x, _e64.y, _e64.z, _e64.w), vec4<f32>(_e65.x, _e65.y, _e65.z, _e65.w));
    let _e87 = p;
    let _e89 = global.uFadeStart;
    let _e90 = global.uFadeEnd;
    let _e91 = global.modelMatrix;
    let _e92 = im;
    p = (_e87 * (1f - smoothstep(_e89, _e90, length(((_e91 * _e92) * vec4<f32>(0f, 0f, 0f, 1f)).xyz))));
    let _e107 = im[3];
    let _e113 = im[3];
    phase = ((_e107.x * 0.37f) + (_e113.z * 0.23f));
    let _e119 = global.modelMatrix;
    let _e120 = im;
    let _e122 = p;
    wp = ((_e119 * _e120) * vec4<f32>(_e122.x, _e122.y, _e122.z, 1f));
    let _e130 = part_1;
    let _e133 = part_1;
    leaf = ((_e130 > 0.5f) && (_e133 < 1.5f));
    let _e140 = global.uTime;
    let _e143 = phase;
    let _e148 = global.uWindV;
    let _e154 = global.uTime;
    let _e157 = phase;
    sway = ((0.0012f + ((0.0007f * sin(((_e140 * 1.3f) + _e143))) * (0.4f + _e148.w))) + (0.0003f * sin(((_e154 * 3.1f) + (_e157 * 2.1f)))));
    let _e165 = wp;
    let _e167 = wp;
    let _e169 = global.uWindV;
    let _e171 = p;
    let _e173 = p;
    let _e176 = sway;
    let _e178 = leaf;
    if _e178 {
        local_1 = 1f;
    } else {
        local_1 = 0.8f;
    }
    let _e182 = local_1;
    let _e185 = (_e167.xyz + (_e169.xyz * (((_e171.y * _e173.y) * _e176) * _e182)));
    wp.x = _e185.x;
    wp.y = _e185.y;
    wp.z = _e185.z;
    let _e192 = leaf;
    if _e192 {
        let _e193 = wp;
        let _e195 = wp;
        let _e197 = global.uTime;
        let _e200 = p;
        let _e205 = phase;
        let _e209 = global.uTime;
        let _e212 = p;
        let _e219 = global.uTime;
        let _e222 = p;
        let _e231 = global.uWindV;
        let _e236 = (_e195.xyz + ((vec3<f32>(sin((((_e197 * 7f) + (_e200.x * 3.1f)) + _e205)), (0.5f * sin(((_e209 * 5.3f) + (_e212.y * 2.3f)))), cos(((_e219 * 6.3f) + (_e222.z * 2.7f)))) * 0.03f) * sqrt(length(_e231.xyz))));
        wp.x = _e236.x;
        wp.y = _e236.y;
        wp.z = _e236.z;
    }
    let _e243 = global.modelMatrix;
    let _e253 = im;
    let _e264 = normal_1;
    vNormal = normalize(((mat3x3<f32>(_e243[0].xyz, _e243[1].xyz, _e243[2].xyz) * mat3x3<f32>(_e253[0].xyz, _e253[1].xyz, _e253[2].xyz)) * _e264));
    let _e269 = p;
    let _e273 = im[1];
    vSnow = vec3<f32>(0f, 0f, (_e269.y * length(_e273.xyz)));
    let _e278 = p;
    let _e280 = global.uTopY;
    vTop = (_e278.y / max(_e280, 0.001f));
    let _e284 = p;
    let _e287 = im[3];
    vLocal = (_e284 + (_e287.xyz * 0.0137f));
    let _e292 = global.uSeason;
    if (_e292.z > 0.5f) {
        {
            let _e296 = global.uToFixed;
            let _e297 = global.modelMatrix;
            let _e298 = im;
            let _e307 = global.uCenter;
            dirF_4 = normalize((_e296 * (((_e297 * _e298) * vec4<f32>(0f, 0f, 0f, 1f)).xyz - _e307)));
            let _e312 = dirF_4;
            let _e313 = fTa_1;
            let _e314 = seasonSWE(_e312, _e313);
            swe = min(_e314, 3000f);
            let _e318 = dirF_4;
            let _e319 = seasonYear(_e318);
            yr_1 = _e319;
            let _e321 = fTa_1;
            let _e322 = yr_1;
            let _e324 = global.uSeason;
            let _e329 = yr_1;
            let _e331 = global.uSeason;
            Tn = ((_e321 + (_e322.x * cos(_e324.x))) + (_e329.y * sin(_e331.x)));
            let _e339 = swe;
            let _e349 = Tn;
            vSnow.x = ((1f - exp((-(_e339) / 12f))) * (1f - smoothstep(-3f, 1.5f, _e349)));
            let _e354 = swe;
            vSnow.y = (_e354 * SNOW_DEPTH_PER_MM);
            let _e356 = part_1;
            let _e359 = vSnow;
            if ((_e356 < 0.5f) && (_e359.x > 0f)) {
                {
                    let _e364 = global.modelMatrix;
                    let _e376 = im[1];
                    upW = normalize((mat3x3<f32>(_e364[0].xyz, _e364[1].xyz, _e364[2].xyz) * _e376.xyz));
                    let _e381 = vNormal;
                    let _e382 = upW;
                    ny = dot(_e381, _e382);
                    let _e385 = wp;
                    let _e387 = wp;
                    let _e389 = vSnow;
                    let _e396 = ny;
                    let _e399 = upW;
                    let _e401 = vNormal;
                    let _e402 = upW;
                    let _e403 = ny;
                    let _e409 = (_e387.xyz + (((_e389.x * 0.05f) * smoothstep(-0.15f, 0.35f, _e396)) * (_e399 + (0.6f * (_e401 - (_e402 * _e403))))));
                    wp.x = _e409.x;
                    wp.y = _e409.y;
                    wp.z = _e409.z;
                }
            }
        }
    }
    let _e416 = wp;
    vWorld = _e416.xyz;
    let _e418 = part_1;
    vPart = _e418;
    let _e419 = ao_1;
    vAo = _e419;
    let _e420 = tuv_1;
    vUv = _e420;
    vTint = vec3(1f);
    let _e423 = instanceColor_1;
    vTint = _e423;
    let _e424 = wp;
    vDist = length(_e424.xyz);
    let _e428 = global.projectionMatrix;
    let _e429 = global.viewMatrix;
    let _e431 = wp;
    gl_Position = ((_e428 * _e429) * _e431);
    return;
}

@vertex 
fn main(@location(0) position: vec3<f32>, @location(1) normal: vec3<f32>, @location(2) instance0_: vec4<f32>, @location(3) instance1_: vec4<f32>, @location(4) instance2_: vec4<f32>, @location(5) instance3_: vec4<f32>, @location(6) instanceColor: vec3<f32>, @location(7) part: f32, @location(8) ao: f32, @location(9) tuv: vec2<f32>, @location(10) fTa: f32) -> VertexOutput {
    position_1 = position;
    normal_1 = normal;
    instance0_1 = instance0_;
    instance1_1 = instance1_;
    instance2_1 = instance2_;
    instance3_1 = instance3_;
    instanceColor_1 = instanceColor;
    part_1 = part;
    ao_1 = ao;
    tuv_1 = tuv;
    fTa_1 = fTa;
    main_1();
    let _e105 = vUv;
    let _e107 = vWorld;
    let _e109 = vNormal;
    let _e111 = vPart;
    let _e113 = vAo;
    let _e115 = vTint;
    let _e117 = vDist;
    let _e119 = vSnow;
    let _e121 = vLocal;
    let _e123 = vTop;
    let _e125 = gl_Position;
    return VertexOutput(_e105, _e107, _e109, _e111, _e113, _e115, _e117, _e119, _e121, _e123, _e125);
}
`;
