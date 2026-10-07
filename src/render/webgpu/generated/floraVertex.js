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

    let _e48 = position_1;
    p = _e48;
    let _e58 = instance0_1;
    let _e59 = instance1_1;
    let _e60 = instance2_1;
    let _e61 = instance3_1;
    im = mat4x4<f32>(vec4<f32>(_e58.x, _e58.y, _e58.z, _e58.w), vec4<f32>(_e59.x, _e59.y, _e59.z, _e59.w), vec4<f32>(_e60.x, _e60.y, _e60.z, _e60.w), vec4<f32>(_e61.x, _e61.y, _e61.z, _e61.w));
    let _e83 = p;
    let _e85 = global.uFadeStart;
    let _e86 = global.uFadeEnd;
    let _e87 = global.modelMatrix;
    let _e88 = im;
    p = (_e83 * (1f - smoothstep(_e85, _e86, length(((_e87 * _e88) * vec4<f32>(0f, 0f, 0f, 1f)).xyz))));
    let _e103 = im[3];
    let _e109 = im[3];
    phase = ((_e103.x * 0.37f) + (_e109.z * 0.23f));
    let _e115 = global.modelMatrix;
    let _e116 = im;
    let _e118 = p;
    wp = ((_e115 * _e116) * vec4<f32>(_e118.x, _e118.y, _e118.z, 1f));
    let _e126 = part_1;
    let _e129 = part_1;
    leaf = ((_e126 > 0.5f) && (_e129 < 1.5f));
    let _e136 = global.uTime;
    let _e139 = phase;
    let _e144 = global.uWindV;
    let _e150 = global.uTime;
    let _e153 = phase;
    sway = ((0.0012f + ((0.0007f * sin(((_e136 * 1.3f) + _e139))) * (0.4f + _e144.w))) + (0.0003f * sin(((_e150 * 3.1f) + (_e153 * 2.1f)))));
    let _e161 = wp;
    let _e163 = wp;
    let _e165 = global.uWindV;
    let _e167 = p;
    let _e169 = p;
    let _e172 = sway;
    let _e174 = leaf;
    if _e174 {
        local_1 = 1f;
    } else {
        local_1 = 0.8f;
    }
    let _e178 = local_1;
    let _e181 = (_e163.xyz + (_e165.xyz * (((_e167.y * _e169.y) * _e172) * _e178)));
    wp.x = _e181.x;
    wp.y = _e181.y;
    wp.z = _e181.z;
    let _e188 = leaf;
    if _e188 {
        let _e189 = wp;
        let _e191 = wp;
        let _e193 = global.uTime;
        let _e196 = p;
        let _e201 = phase;
        let _e205 = global.uTime;
        let _e208 = p;
        let _e215 = global.uTime;
        let _e218 = p;
        let _e227 = global.uWindV;
        let _e232 = (_e191.xyz + ((vec3<f32>(sin((((_e193 * 7f) + (_e196.x * 3.1f)) + _e201)), (0.5f * sin(((_e205 * 5.3f) + (_e208.y * 2.3f)))), cos(((_e215 * 6.3f) + (_e218.z * 2.7f)))) * 0.03f) * sqrt(length(_e227.xyz))));
        wp.x = _e232.x;
        wp.y = _e232.y;
        wp.z = _e232.z;
    }
    let _e239 = global.modelMatrix;
    let _e249 = im;
    let _e260 = normal_1;
    vNormal = normalize(((mat3x3<f32>(_e239[0].xyz, _e239[1].xyz, _e239[2].xyz) * mat3x3<f32>(_e249[0].xyz, _e249[1].xyz, _e249[2].xyz)) * _e260));
    let _e265 = p;
    let _e269 = im[1];
    vSnow = vec3<f32>(0f, 0f, (_e265.y * length(_e269.xyz)));
    let _e274 = p;
    let _e276 = global.uTopY;
    vTop = (_e274.y / max(_e276, 0.001f));
    let _e280 = p;
    let _e283 = im[3];
    vLocal = (_e280 + (_e283.xyz * 0.0137f));
    let _e288 = global.uSeason;
    if (_e288.z > 0.5f) {
        {
            let _e292 = global.uToFixed;
            let _e293 = global.modelMatrix;
            let _e294 = im;
            let _e303 = global.uCenter;
            dirF_4 = normalize((_e292 * (((_e293 * _e294) * vec4<f32>(0f, 0f, 0f, 1f)).xyz - _e303)));
            let _e308 = dirF_4;
            let _e309 = fTa_1;
            let _e310 = seasonSWE(_e308, _e309);
            swe = min(_e310, 3000f);
            let _e314 = dirF_4;
            let _e315 = seasonYear(_e314);
            yr_1 = _e315;
            let _e317 = fTa_1;
            let _e318 = yr_1;
            let _e320 = global.uSeason;
            let _e325 = yr_1;
            let _e327 = global.uSeason;
            Tn = ((_e317 + (_e318.x * cos(_e320.x))) + (_e325.y * sin(_e327.x)));
            let _e335 = swe;
            let _e345 = Tn;
            vSnow.x = ((1f - exp((-(_e335) / 12f))) * (1f - smoothstep(-3f, 1.5f, _e345)));
            let _e350 = swe;
            vSnow.y = (_e350 * SNOW_DEPTH_PER_MM);
            let _e352 = part_1;
            let _e355 = vSnow;
            if ((_e352 < 0.5f) && (_e355.x > 0f)) {
                {
                    let _e360 = global.modelMatrix;
                    let _e372 = im[1];
                    upW = normalize((mat3x3<f32>(_e360[0].xyz, _e360[1].xyz, _e360[2].xyz) * _e372.xyz));
                    let _e377 = vNormal;
                    let _e378 = upW;
                    ny = dot(_e377, _e378);
                    let _e381 = wp;
                    let _e383 = wp;
                    let _e385 = vSnow;
                    let _e392 = ny;
                    let _e395 = upW;
                    let _e397 = vNormal;
                    let _e398 = upW;
                    let _e399 = ny;
                    let _e405 = (_e383.xyz + (((_e385.x * 0.05f) * smoothstep(-0.15f, 0.35f, _e392)) * (_e395 + (0.6f * (_e397 - (_e398 * _e399))))));
                    wp.x = _e405.x;
                    wp.y = _e405.y;
                    wp.z = _e405.z;
                }
            }
        }
    }
    let _e412 = wp;
    vWorld = _e412.xyz;
    let _e414 = part_1;
    vPart = _e414;
    let _e415 = ao_1;
    vAo = _e415;
    let _e416 = tuv_1;
    vUv = _e416;
    vTint = vec3(1f);
    let _e419 = instanceColor_1;
    vTint = _e419;
    let _e420 = wp;
    vDist = length(_e420.xyz);
    let _e424 = global.projectionMatrix;
    let _e425 = global.viewMatrix;
    let _e427 = wp;
    gl_Position = ((_e424 * _e425) * _e427);
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
    let _e97 = vUv;
    let _e99 = vWorld;
    let _e101 = vNormal;
    let _e103 = vPart;
    let _e105 = vAo;
    let _e107 = vTint;
    let _e109 = vDist;
    let _e111 = vSnow;
    let _e113 = vLocal;
    let _e115 = vTop;
    let _e117 = gl_Position;
    return VertexOutput(_e97, _e99, _e101, _e103, _e105, _e107, _e109, _e111, _e113, _e115, _e117);
}
`;
