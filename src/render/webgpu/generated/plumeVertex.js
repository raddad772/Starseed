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
    }
  ],
  "textures": [],
  "bytes": 192,
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
    }
  ]
};
export const code = /* wgsl */`
struct Params {
    modelMatrix: mat4x4<f32>,
    viewMatrix: mat4x4<f32>,
    projectionMatrix: mat4x4<f32>,
}

struct VertexOutput {
    @location(0) vLocal: vec3<f32>,
    @location(1) vN: vec3<f32>,
    @location(2) vView: vec3<f32>,
    @builtin(position) gl_Position: vec4<f32>,
}

const PI: f32 = 3.1415927f;

@group(0) @binding(0) 
var<uniform> global: Params;
var<private> position_1: vec3<f32>;
var<private> normal_1: vec3<f32>;
var<private> vLocal: vec3<f32>;
var<private> vN: vec3<f32>;
var<private> vView: vec3<f32>;
var<private> gl_Position: vec4<f32>;

fn main_1() {
    var wp: vec4<f32>;

    let _e12 = position_1;
    vLocal = _e12;
    let _e13 = global.modelMatrix;
    let _e14 = position_1;
    wp = (_e13 * vec4<f32>(_e14.x, _e14.y, _e14.z, 1f));
    let _e22 = global.modelMatrix;
    let _e32 = normal_1;
    vN = normalize((mat3x3<f32>(_e22[0].xyz, _e22[1].xyz, _e22[2].xyz) * _e32));
    let _e35 = wp;
    vView = -(_e35.xyz);
    let _e39 = global.projectionMatrix;
    let _e40 = global.viewMatrix;
    let _e42 = wp;
    gl_Position = ((_e39 * _e40) * _e42);
    return;
}

@vertex 
fn main(@location(0) position: vec3<f32>, @location(1) normal: vec3<f32>) -> VertexOutput {
    position_1 = position;
    normal_1 = normal;
    main_1();
    let _e23 = vLocal;
    let _e25 = vN;
    let _e27 = vView;
    let _e29 = gl_Position;
    return VertexOutput(_e23, _e25, _e27, _e29);
}
`;
