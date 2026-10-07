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
    }
  ],
  "textures": [],
  "bytes": 288,
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
}

struct VertexOutput {
    @location(0) vD: f32,
    @builtin(position) gl_Position: vec4<f32>,
}

@group(0) @binding(0) 
var<uniform> global: Params;
var<private> position_1: vec3<f32>;
var<private> instance0_1: vec4<f32>;
var<private> instance1_1: vec4<f32>;
var<private> instance2_1: vec4<f32>;
var<private> instance3_1: vec4<f32>;
var<private> vD: f32;
var<private> gl_Position: vec4<f32>;

fn main_1() {
    var p: vec4<f32>;
    var wp: vec4<f32>;

    let _e18 = position_1;
    p = vec4<f32>(_e18.x, _e18.y, _e18.z, 1f);
    let _e25 = instance0_1;
    let _e26 = instance1_1;
    let _e27 = instance2_1;
    let _e28 = instance3_1;
    let _e50 = p;
    p = (mat4x4<f32>(vec4<f32>(_e25.x, _e25.y, _e25.z, _e25.w), vec4<f32>(_e26.x, _e26.y, _e26.z, _e26.w), vec4<f32>(_e27.x, _e27.y, _e27.z, _e27.w), vec4<f32>(_e28.x, _e28.y, _e28.z, _e28.w)) * _e50);
    let _e52 = global.modelMatrix;
    let _e53 = p;
    wp = (_e52 * _e53);
    let _e56 = global.uLightPos;
    let _e57 = wp;
    let _e60 = global.uLightDir;
    vD = dot((_e56 - _e57.xyz), _e60);
    let _e63 = global.projectionMatrix;
    let _e64 = global.viewMatrix;
    let _e66 = wp;
    gl_Position = ((_e63 * _e64) * _e66);
    let _e69 = gl_Position;
    gl_Position.y = -(_e69.y);
    let _e74 = gl_Position;
    let _e76 = gl_Position;
    gl_Position.z = (0.5f * (_e74.z + _e76.w));
    return;
}

@vertex 
fn main(@location(0) position: vec3<f32>, @location(1) instance0_: vec4<f32>, @location(2) instance1_: vec4<f32>, @location(3) instance2_: vec4<f32>, @location(4) instance3_: vec4<f32>) -> VertexOutput {
    position_1 = position;
    instance0_1 = instance0_;
    instance1_1 = instance1_;
    instance2_1 = instance2_;
    instance3_1 = instance3_;
    main_1();
    let _e35 = vD;
    let _e37 = gl_Position;
    return VertexOutput(_e35, _e37);
}
`;
