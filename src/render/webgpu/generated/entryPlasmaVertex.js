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
      "name": "uRadii",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 192
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
    }
  ]
};
export const code = /* wgsl */`
struct Params {
    modelMatrix: mat4x4<f32>,
    viewMatrix: mat4x4<f32>,
    projectionMatrix: mat4x4<f32>,
    uRadii: vec3<f32>,
}

struct VertexOutput {
    @location(0) vLocal: vec3<f32>,
    @location(1) vNormalLocal: vec3<f32>,
    @location(2) vN: vec3<f32>,
    @location(3) vView: vec3<f32>,
    @builtin(position) gl_Position: vec4<f32>,
}

const PI: f32 = 3.1415927f;

@group(0) @binding(0)
var<uniform> global: Params;
var<private> position_1: vec3<f32>;
var<private> normal_1: vec3<f32>;
var<private> vLocal: vec3<f32>;
var<private> vNormalLocal: vec3<f32>;
var<private> vN: vec3<f32>;
var<private> vView: vec3<f32>;
var<private> gl_Position: vec4<f32>;

fn main_1() {
    var wp: vec4<f32>;

    let _e15 = position_1;
    vLocal = _e15;
    let _e16 = normal_1;
    let _e17 = global.uRadii;
    vNormalLocal = normalize((_e16 / _e17));
    let _e20 = global.modelMatrix;
    let _e21 = position_1;
    let _e22 = global.uRadii;
    let _e23 = (_e21 * _e22);
    wp = (_e20 * vec4<f32>(_e23.x, _e23.y, _e23.z, 1f));
    let _e31 = global.modelMatrix;
    let _e41 = vNormalLocal;
    vN = (mat3x3<f32>(_e31[0].xyz, _e31[1].xyz, _e31[2].xyz) * _e41);
    let _e43 = wp;
    vView = -(_e43.xyz);
    let _e47 = global.projectionMatrix;
    let _e48 = global.viewMatrix;
    let _e50 = wp;
    gl_Position = ((_e47 * _e48) * _e50);
    return;
}

@vertex
fn main(@location(0) position: vec3<f32>, @location(1) normal: vec3<f32>) -> VertexOutput {
    position_1 = position;
    normal_1 = normal;
    main_1();
    let _e27 = vLocal;
    let _e29 = vNormalLocal;
    let _e31 = vN;
    let _e33 = vView;
    let _e35 = gl_Position;
    return VertexOutput(_e27, _e29, _e31, _e33, _e35);
}
`;
