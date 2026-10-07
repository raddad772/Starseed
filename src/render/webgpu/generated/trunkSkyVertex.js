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
      "name": "uExt",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 256
    }
  ],
  "textures": [],
  "bytes": 272,
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
      "name": "corner",
      "type": "vec2",
      "location": 5
    },
    {
      "name": "aT",
      "type": "vec4",
      "location": 6
    },
    {
      "name": "aH",
      "type": "float",
      "location": 7
    }
  ]
};
export const code = /* wgsl */`
struct Params {
    modelMatrix: mat4x4<f32>,
    modelViewMatrix: mat4x4<f32>,
    viewMatrix: mat4x4<f32>,
    projectionMatrix: mat4x4<f32>,
    uExt: f32,
}

struct VertexOutput {
    @location(0) vC: vec2<f32>,
    @location(1) vR: f32,
    @location(2) vH: f32,
    @location(3) vE: f32,
    @builtin(position) gl_Position: vec4<f32>,
}

@group(0) @binding(0) 
var<uniform> global: Params;
var<private> position_1: vec3<f32>;
var<private> instance0_1: vec4<f32>;
var<private> instance1_1: vec4<f32>;
var<private> instance2_1: vec4<f32>;
var<private> instance3_1: vec4<f32>;
var<private> corner_1: vec2<f32>;
var<private> aT_1: vec4<f32>;
var<private> aH_1: f32;
var<private> vC: vec2<f32>;
var<private> vR: f32;
var<private> vH: f32;
var<private> vE: f32;
var<private> gl_Position: vec4<f32>;

fn main_1() {
    var e: f32;
    var mv: vec4<f32>;

    let _e22 = global.uExt;
    let _e23 = aT_1;
    e = (_e22 * _e23.w);
    let _e27 = global.modelViewMatrix;
    let _e28 = aT_1;
    let _e29 = _e28.xyz;
    mv = (_e27 * vec4<f32>(_e29.x, _e29.y, _e29.z, 1f));
    let _e37 = mv;
    let _e39 = mv;
    let _e41 = corner_1;
    let _e42 = e;
    let _e44 = (_e39.xy + (_e41 * _e42));
    mv.x = _e44.x;
    mv.y = _e44.y;
    let _e49 = corner_1;
    vC = _e49;
    let _e50 = aT_1;
    vR = _e50.w;
    let _e52 = aH_1;
    vH = _e52;
    let _e53 = e;
    vE = _e53;
    let _e55 = global.projectionMatrix;
    let _e56 = mv;
    gl_Position = (_e55 * _e56);
    let _e59 = gl_Position;
    gl_Position.y = -(_e59.y);
    let _e64 = gl_Position;
    let _e66 = gl_Position;
    gl_Position.z = (0.5f * (_e64.z + _e66.w));
    return;
}

@vertex 
fn main(@location(0) position: vec3<f32>, @location(1) instance0_: vec4<f32>, @location(2) instance1_: vec4<f32>, @location(3) instance2_: vec4<f32>, @location(4) instance3_: vec4<f32>, @location(5) corner: vec2<f32>, @location(6) aT: vec4<f32>, @location(7) aH: f32) -> VertexOutput {
    position_1 = position;
    instance0_1 = instance0_;
    instance1_1 = instance1_;
    instance2_1 = instance2_;
    instance3_1 = instance3_;
    corner_1 = corner;
    aT_1 = aT;
    aH_1 = aH;
    main_1();
    let _e51 = vC;
    let _e53 = vR;
    let _e55 = vH;
    let _e57 = vE;
    let _e59 = gl_Position;
    return VertexOutput(_e51, _e53, _e55, _e57, _e59);
}
`;
