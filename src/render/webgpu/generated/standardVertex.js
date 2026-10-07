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
      "name": "normalMatrix",
      "type": "mat3",
      "count": 0,
      "align": 16,
      "size": 48,
      "stride": 48,
      "offset": 192
    },
    {
      "name": "uUseColor",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 240
    }
  ],
  "textures": [],
  "bytes": 256,
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
      "name": "uv",
      "type": "vec2",
      "location": 7
    },
    {
      "name": "uv1",
      "type": "vec2",
      "location": 8
    },
    {
      "name": "uv2",
      "type": "vec2",
      "location": 9
    },
    {
      "name": "color",
      "type": "vec4",
      "location": 10
    }
  ]
};
export const code = /* wgsl */`
struct Params {
    modelMatrix: mat4x4<f32>,
    viewMatrix: mat4x4<f32>,
    projectionMatrix: mat4x4<f32>,
    normalMatrix: mat3x3<f32>,
    uUseColor: f32,
}

struct VertexOutput {
    @location(0) vWorld: vec3<f32>,
    @location(1) vNormal: vec3<f32>,
    @location(2) vColor: vec4<f32>,
    @location(3) vUv: vec2<f32>,
    @location(4) vUv1_: vec2<f32>,
    @location(5) vUv2_: vec2<f32>,
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
var<private> uv_1: vec2<f32>;
var<private> uv1_1: vec2<f32>;
var<private> uv2_1: vec2<f32>;
var<private> color_1: vec4<f32>;
var<private> vWorld: vec3<f32>;
var<private> vNormal: vec3<f32>;
var<private> vColor: vec4<f32>;
var<private> vUv: vec2<f32>;
var<private> vUv1_: vec2<f32>;
var<private> vUv2_: vec2<f32>;
var<private> gl_Position: vec4<f32>;

fn main_1() {
    var im: mat4x4<f32>;
    var wp: vec4<f32>;
    var im3_: mat3x3<f32>;
    var n: vec3<f32>;

    let _e28 = instance0_1;
    let _e29 = instance1_1;
    let _e30 = instance2_1;
    let _e31 = instance3_1;
    im = mat4x4<f32>(vec4<f32>(_e28.x, _e28.y, _e28.z, _e28.w), vec4<f32>(_e29.x, _e29.y, _e29.z, _e29.w), vec4<f32>(_e30.x, _e30.y, _e30.z, _e30.w), vec4<f32>(_e31.x, _e31.y, _e31.z, _e31.w));
    let _e54 = global.modelMatrix;
    let _e55 = im;
    let _e57 = position_1;
    wp = ((_e54 * _e55) * vec4<f32>(_e57.x, _e57.y, _e57.z, 1f));
    let _e65 = im;
    im3_ = mat3x3<f32>(_e65[0].xyz, _e65[1].xyz, _e65[2].xyz);
    let _e76 = normal_1;
    let _e79 = im3_[0];
    let _e82 = im3_[0];
    let _e86 = im3_[1];
    let _e89 = im3_[1];
    let _e93 = im3_[2];
    let _e96 = im3_[2];
    n = (_e76 / max(vec3<f32>(dot(_e79, _e82), dot(_e86, _e89), dot(_e93, _e96)), vec3(0.000000000001f)));
    let _e104 = wp;
    vWorld = _e104.xyz;
    let _e106 = global.normalMatrix;
    let _e107 = im3_;
    let _e109 = n;
    vNormal = normalize(((_e106 * _e107) * _e109));
    let _e114 = color_1;
    let _e115 = global.uUseColor;
    let _e118 = instanceColor_1;
    vColor = (mix(vec4(1f), _e114, vec4(_e115)) * vec4<f32>(_e118.x, _e118.y, _e118.z, 1f));
    let _e125 = uv_1;
    vUv = _e125;
    let _e126 = uv1_1;
    vUv1_ = _e126;
    let _e127 = uv2_1;
    vUv2_ = _e127;
    let _e129 = global.projectionMatrix;
    let _e130 = global.viewMatrix;
    let _e132 = wp;
    gl_Position = ((_e129 * _e130) * _e132);
    return;
}

@vertex 
fn main(@location(0) position: vec3<f32>, @location(1) normal: vec3<f32>, @location(2) instance0_: vec4<f32>, @location(3) instance1_: vec4<f32>, @location(4) instance2_: vec4<f32>, @location(5) instance3_: vec4<f32>, @location(6) instanceColor: vec3<f32>, @location(7) uv: vec2<f32>, @location(8) uv1_: vec2<f32>, @location(9) uv2_: vec2<f32>, @location(10) color: vec4<f32>) -> VertexOutput {
    position_1 = position;
    normal_1 = normal;
    instance0_1 = instance0_;
    instance1_1 = instance1_;
    instance2_1 = instance2_;
    instance3_1 = instance3_;
    instanceColor_1 = instanceColor;
    uv_1 = uv;
    uv1_1 = uv1_;
    uv2_1 = uv2_;
    color_1 = color;
    main_1();
    let _e69 = vWorld;
    let _e71 = vNormal;
    let _e73 = vColor;
    let _e75 = vUv;
    let _e77 = vUv1_;
    let _e79 = vUv2_;
    let _e81 = gl_Position;
    return VertexOutput(_e69, _e71, _e73, _e75, _e77, _e79, _e81);
}
`;
