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
    @location(1) vWorld: vec3<f32>,
    @builtin(position) gl_Position: vec4<f32>,
}

const PI: f32 = 3.1415927f;

@group(0) @binding(0) 
var<uniform> global: Params;
var<private> position_1: vec3<f32>;
var<private> vLocal: vec3<f32>;
var<private> vWorld: vec3<f32>;
var<private> gl_Position: vec4<f32>;

fn main_1() {
    var wp: vec4<f32>;

    let _e10 = position_1;
    vLocal = _e10;
    let _e11 = global.modelMatrix;
    let _e12 = position_1;
    wp = (_e11 * vec4<f32>(_e12.x, _e12.y, _e12.z, 1f));
    let _e20 = wp;
    vWorld = _e20.xyz;
    let _e23 = global.projectionMatrix;
    let _e24 = global.viewMatrix;
    let _e26 = wp;
    gl_Position = ((_e23 * _e24) * _e26);
    return;
}

@vertex 
fn main(@location(0) position: vec3<f32>) -> VertexOutput {
    position_1 = position;
    main_1();
    let _e17 = vLocal;
    let _e19 = vWorld;
    let _e21 = gl_Position;
    return VertexOutput(_e17, _e19, _e21);
}
`;
