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
}

struct VertexOutput {
    @location(0) vN: vec3<f32>,
    @location(1) vObj: vec3<f32>,
    @location(2) vView: vec3<f32>,
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
var<private> vN: vec3<f32>;
var<private> vObj: vec3<f32>;
var<private> vView: vec3<f32>;
var<private> gl_Position: vec4<f32>;

fn main_1() {
    var wp: vec4<f32>;

    let _e17 = position_1;
    vObj = normalize(_e17);
    let _e19 = global.modelMatrix;
    let _e29 = normal_1;
    vN = normalize((mat3x3<f32>(_e19[0].xyz, _e19[1].xyz, _e19[2].xyz) * _e29));
    let _e32 = global.modelMatrix;
    let _e33 = position_1;
    wp = (_e32 * vec4<f32>(_e33.x, _e33.y, _e33.z, 1f));
    let _e41 = wp;
    vView = -(_e41.xyz);
    let _e45 = global.projectionMatrix;
    let _e46 = global.viewMatrix;
    let _e48 = wp;
    gl_Position = ((_e45 * _e46) * _e48);
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
    let _e43 = vN;
    let _e45 = vObj;
    let _e47 = vView;
    let _e49 = gl_Position;
    return VertexOutput(_e43, _e45, _e47, _e49);
}
`;
