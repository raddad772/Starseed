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
      "name": "uOriginF",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 192
    },
    {
      "name": "uBlockKind",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 204
    }
  ],
  "textures": [],
  "bytes": 208,
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
    }
  ]
};
export const code = /* wgsl */`
struct Params {
    modelMatrix: mat4x4<f32>,
    viewMatrix: mat4x4<f32>,
    projectionMatrix: mat4x4<f32>,
    uOriginF: vec3<f32>,
    uBlockKind: f32,
}

struct VertexOutput {
    @location(0) vWorld: vec3<f32>,
    @location(1) vN: vec3<f32>,
    @location(2) vFp: vec3<f32>,
    @location(3) vAux: vec4<f32>,
    @builtin(position) gl_Position: vec4<f32>,
}

const PI: f32 = 3.1415927f;

@group(0) @binding(0) 
var<uniform> global: Params;
var<private> position_1: vec3<f32>;
var<private> normal_1: vec3<f32>;
var<private> instance0_1: vec4<f32>;
var<private> instance1_1: vec4<f32>;
var<private> instance2_1: vec4<f32>;
var<private> instance3_1: vec4<f32>;
var<private> instanceColor_1: vec3<f32>;
var<private> vWorld: vec3<f32>;
var<private> vN: vec3<f32>;
var<private> vFp: vec3<f32>;
var<private> vAux: vec4<f32>;
var<private> gl_Position: vec4<f32>;

fn main_1() {
    var lp: vec4<f32>;
    var wp: vec4<f32>;
    var im: mat3x3<f32>;

    let _e22 = instance0_1;
    let _e23 = instance1_1;
    let _e24 = instance2_1;
    let _e25 = instance3_1;
    let _e47 = position_1;
    lp = (mat4x4<f32>(vec4<f32>(_e22.x, _e22.y, _e22.z, _e22.w), vec4<f32>(_e23.x, _e23.y, _e23.z, _e23.w), vec4<f32>(_e24.x, _e24.y, _e24.z, _e24.w), vec4<f32>(_e25.x, _e25.y, _e25.z, _e25.w)) * vec4<f32>(_e47.x, _e47.y, _e47.z, 1f));
    let _e55 = global.modelMatrix;
    let _e56 = lp;
    wp = (_e55 * _e56);
    let _e59 = wp;
    vWorld = _e59.xyz;
    let _e61 = instance0_1;
    let _e62 = instance1_1;
    let _e63 = instance2_1;
    let _e64 = instance3_1;
    let _e85 = mat4x4<f32>(vec4<f32>(_e61.x, _e61.y, _e61.z, _e61.w), vec4<f32>(_e62.x, _e62.y, _e62.z, _e62.w), vec4<f32>(_e63.x, _e63.y, _e63.z, _e63.w), vec4<f32>(_e64.x, _e64.y, _e64.z, _e64.w));
    im = mat3x3<f32>(_e85[0].xyz, _e85[1].xyz, _e85[2].xyz);
    let _e96 = global.modelMatrix;
    let _e106 = im;
    let _e108 = normal_1;
    let _e111 = im[0];
    let _e114 = im[0];
    let _e118 = im[1];
    let _e121 = im[1];
    let _e125 = im[2];
    let _e128 = im[2];
    vN = normalize(((mat3x3<f32>(_e96[0].xyz, _e96[1].xyz, _e96[2].xyz) * _e106) * (_e108 / vec3<f32>(dot(_e111, _e114), dot(_e118, _e121), dot(_e125, _e128)))));
    let _e134 = global.uOriginF;
    let _e135 = lp;
    vFp = (_e134 + _e135.xyz);
    let _e141 = global.uBlockKind;
    vAux = vec4<f32>(0f, 0f, 0f, _e141);
    let _e144 = global.projectionMatrix;
    let _e145 = global.viewMatrix;
    let _e147 = wp;
    gl_Position = ((_e144 * _e145) * _e147);
    return;
}

@vertex 
fn main(@location(0) position: vec3<f32>, @location(1) normal: vec3<f32>, @location(2) instance0_: vec4<f32>, @location(3) instance1_: vec4<f32>, @location(4) instance2_: vec4<f32>, @location(5) instance3_: vec4<f32>, @location(6) instanceColor: vec3<f32>) -> VertexOutput {
    position_1 = position;
    normal_1 = normal;
    instance0_1 = instance0_;
    instance1_1 = instance1_;
    instance2_1 = instance2_;
    instance3_1 = instance3_;
    instanceColor_1 = instanceColor;
    main_1();
    let _e49 = vWorld;
    let _e51 = vN;
    let _e53 = vFp;
    let _e55 = vAux;
    let _e57 = gl_Position;
    return VertexOutput(_e49, _e51, _e53, _e55, _e57);
}
`;
