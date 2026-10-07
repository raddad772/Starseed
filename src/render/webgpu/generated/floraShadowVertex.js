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
      "name": "modelViewMatrix",
      "type": "mat4",
      "count": 0,
      "align": 16,
      "size": 64,
      "stride": 64,
      "offset": 64
    },
    {
      "name": "viewMatrix",
      "type": "mat4",
      "count": 0,
      "align": 16,
      "size": 64,
      "stride": 64,
      "offset": 128
    },
    {
      "name": "projectionMatrix",
      "type": "mat4",
      "count": 0,
      "align": 16,
      "size": 64,
      "stride": 64,
      "offset": 192
    },
    {
      "name": "uLightPos",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 256
    },
    {
      "name": "uLightDir",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 272
    },
    {
      "name": "uTime",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 284
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
    }
  ],
  "textures": [],
  "bytes": 320,
  "group": 0,
  "attributes": [
    {
      "name": "position",
      "type": "vec3",
      "location": 0
    },
    {
      "name": "instance0",
      "type": "vec4",
      "location": 1
    },
    {
      "name": "instance1",
      "type": "vec4",
      "location": 2
    },
    {
      "name": "instance2",
      "type": "vec4",
      "location": 3
    },
    {
      "name": "instance3",
      "type": "vec4",
      "location": 4
    },
    {
      "name": "part",
      "type": "float",
      "location": 5
    },
    {
      "name": "tuv",
      "type": "vec2",
      "location": 6
    }
  ]
};
export const code = /* wgsl */`
struct Params {
    modelMatrix: mat4x4<f32>,
    modelViewMatrix: mat4x4<f32>,
    viewMatrix: mat4x4<f32>,
    projectionMatrix: mat4x4<f32>,
    uLightPos: vec3<f32>,
    uLightDir: vec3<f32>,
    uTime: f32,
    uWindV: vec4<f32>,
    uFadeStart: f32,
    uFadeEnd: f32,
}

struct VertexOutput {
    @location(0) vD: f32,
    @location(1) vUv: vec2<f32>,
    @location(2) vPart: f32,
    @builtin(position) gl_Position: vec4<f32>,
}

@group(0) @binding(0) 
var<uniform> global: Params;
var<private> position_1: vec3<f32>;
var<private> instance0_1: vec4<f32>;
var<private> instance1_1: vec4<f32>;
var<private> instance2_1: vec4<f32>;
var<private> instance3_1: vec4<f32>;
var<private> part_1: f32;
var<private> tuv_1: vec2<f32>;
var<private> vD: f32;
var<private> vUv: vec2<f32>;
var<private> vPart: f32;
var<private> gl_Position: vec4<f32>;

fn main_1() {
    var p: vec3<f32>;
    var im: mat4x4<f32> = mat4x4<f32>(vec4<f32>(1f, 0f, 0f, 0f), vec4<f32>(0f, 1f, 0f, 0f), vec4<f32>(0f, 0f, 1f, 0f), vec4<f32>(0f, 0f, 0f, 1f));
    var phase: f32;
    var wp: vec4<f32>;
    var leaf: bool;
    var sway: f32;
    var local: f32;

    let _e30 = position_1;
    p = _e30;
    let _e40 = instance0_1;
    let _e41 = instance1_1;
    let _e42 = instance2_1;
    let _e43 = instance3_1;
    im = mat4x4<f32>(vec4<f32>(_e40.x, _e40.y, _e40.z, _e40.w), vec4<f32>(_e41.x, _e41.y, _e41.z, _e41.w), vec4<f32>(_e42.x, _e42.y, _e42.z, _e42.w), vec4<f32>(_e43.x, _e43.y, _e43.z, _e43.w));
    let _e65 = p;
    let _e67 = global.uFadeStart;
    let _e68 = global.uFadeEnd;
    let _e69 = global.modelMatrix;
    let _e70 = im;
    p = (_e65 * (1f - smoothstep(_e67, _e68, length(((_e69 * _e70) * vec4<f32>(0f, 0f, 0f, 1f)).xyz))));
    let _e85 = im[3];
    let _e91 = im[3];
    phase = ((_e85.x * 0.37f) + (_e91.z * 0.23f));
    let _e97 = global.modelMatrix;
    let _e98 = im;
    let _e100 = p;
    wp = ((_e97 * _e98) * vec4<f32>(_e100.x, _e100.y, _e100.z, 1f));
    let _e108 = part_1;
    let _e111 = part_1;
    leaf = ((_e108 > 0.5f) && (_e111 < 1.5f));
    let _e118 = global.uTime;
    let _e121 = phase;
    let _e126 = global.uWindV;
    let _e132 = global.uTime;
    let _e135 = phase;
    sway = ((0.0012f + ((0.0007f * sin(((_e118 * 1.3f) + _e121))) * (0.4f + _e126.w))) + (0.0003f * sin(((_e132 * 3.1f) + (_e135 * 2.1f)))));
    let _e143 = wp;
    let _e145 = wp;
    let _e147 = global.uWindV;
    let _e149 = p;
    let _e151 = p;
    let _e154 = sway;
    let _e156 = leaf;
    if _e156 {
        local = 1f;
    } else {
        local = 0.8f;
    }
    let _e160 = local;
    let _e163 = (_e145.xyz + (_e147.xyz * (((_e149.y * _e151.y) * _e154) * _e160)));
    wp.x = _e163.x;
    wp.y = _e163.y;
    wp.z = _e163.z;
    let _e170 = leaf;
    if _e170 {
        let _e171 = wp;
        let _e173 = wp;
        let _e175 = global.uTime;
        let _e178 = p;
        let _e183 = phase;
        let _e187 = global.uTime;
        let _e190 = p;
        let _e197 = global.uTime;
        let _e200 = p;
        let _e209 = global.uWindV;
        let _e214 = (_e173.xyz + ((vec3<f32>(sin((((_e175 * 7f) + (_e178.x * 3.1f)) + _e183)), (0.5f * sin(((_e187 * 5.3f) + (_e190.y * 2.3f)))), cos(((_e197 * 6.3f) + (_e200.z * 2.7f)))) * 0.03f) * sqrt(length(_e209.xyz))));
        wp.x = _e214.x;
        wp.y = _e214.y;
        wp.z = _e214.z;
    }
    let _e221 = global.uLightPos;
    let _e222 = wp;
    let _e225 = global.uLightDir;
    vD = dot((_e221 - _e222.xyz), _e225);
    let _e227 = tuv_1;
    vUv = _e227;
    let _e228 = part_1;
    vPart = _e228;
    let _e230 = global.projectionMatrix;
    let _e231 = global.viewMatrix;
    let _e233 = wp;
    gl_Position = ((_e230 * _e231) * _e233);
    let _e236 = gl_Position;
    gl_Position.y = -(_e236.y);
    let _e241 = gl_Position;
    let _e243 = gl_Position;
    gl_Position.z = (0.5f * (_e241.z + _e243.w));
    return;
}

@vertex 
fn main(@location(0) position: vec3<f32>, @location(1) instance0_: vec4<f32>, @location(2) instance1_: vec4<f32>, @location(3) instance2_: vec4<f32>, @location(4) instance3_: vec4<f32>, @location(5) part: f32, @location(6) tuv: vec2<f32>) -> VertexOutput {
    position_1 = position;
    instance0_1 = instance0_;
    instance1_1 = instance1_;
    instance2_1 = instance2_;
    instance3_1 = instance3_;
    part_1 = part;
    tuv_1 = tuv;
    main_1();
    let _e55 = vD;
    let _e57 = vUv;
    let _e59 = vPart;
    let _e61 = gl_Position;
    return VertexOutput(_e55, _e57, _e59, _e61);
}
`;
