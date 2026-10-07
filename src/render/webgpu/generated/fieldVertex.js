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
    },
    {
      "name": "uv",
      "type": "vec2",
      "location": 2
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
    @location(0) vUv: vec2<f32>,
    @location(1) vN: vec3<f32>,
    @location(2) vView: vec3<f32>,
    @builtin(position) gl_Position: vec4<f32>,
}

const PI: f32 = 3.1415927f;

@group(0) @binding(0) 
var<uniform> global: Params;
var<private> position_1: vec3<f32>;
var<private> normal_1: vec3<f32>;
var<private> uv_1: vec2<f32>;
var<private> vUv: vec2<f32>;
var<private> vN: vec3<f32>;
var<private> vView: vec3<f32>;
var<private> gl_Position: vec4<f32>;

fn main_1() {
    var wp: vec4<f32>;

    let _e13 = uv_1;
    vUv = _e13;
    let _e14 = global.modelMatrix;
    let _e15 = position_1;
    wp = (_e14 * vec4<f32>(_e15.x, _e15.y, _e15.z, 1f));
    let _e23 = global.modelMatrix;
    let _e33 = normal_1;
    vN = normalize((mat3x3<f32>(_e23[0].xyz, _e23[1].xyz, _e23[2].xyz) * _e33));
    let _e36 = wp;
    vView = -(_e36.xyz);
    let _e40 = global.projectionMatrix;
    let _e41 = global.viewMatrix;
    let _e43 = wp;
    gl_Position = ((_e40 * _e41) * _e43);
    return;
}

@vertex 
fn main(@location(0) position: vec3<f32>, @location(1) normal: vec3<f32>, @location(2) uv: vec2<f32>) -> VertexOutput {
    position_1 = position;
    normal_1 = normal;
    uv_1 = uv;
    main_1();
    let _e27 = vUv;
    let _e29 = vN;
    let _e31 = vView;
    let _e33 = gl_Position;
    return VertexOutput(_e27, _e29, _e31, _e33);
}
`;
