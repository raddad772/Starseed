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
    },
    {
      "name": "fpos",
      "type": "vec3",
      "location": 7
    },
    {
      "name": "aux",
      "type": "vec4",
      "location": 8
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
var<private> fpos_1: vec3<f32>;
var<private> aux_1: vec4<f32>;
var<private> vWorld: vec3<f32>;
var<private> vN: vec3<f32>;
var<private> vFp: vec3<f32>;
var<private> vAux: vec4<f32>;
var<private> gl_Position: vec4<f32>;

fn main_1() {
    var wp: vec4<f32>;

    let _e20 = global.modelMatrix;
    let _e21 = position_1;
    wp = (_e20 * vec4<f32>(_e21.x, _e21.y, _e21.z, 1f));
    let _e29 = wp;
    vWorld = _e29.xyz;
    let _e31 = global.modelMatrix;
    let _e41 = normal_1;
    vN = normalize((mat3x3<f32>(_e31[0].xyz, _e31[1].xyz, _e31[2].xyz) * _e41));
    let _e44 = fpos_1;
    vFp = _e44;
    let _e45 = aux_1;
    vAux = _e45;
    let _e47 = global.projectionMatrix;
    let _e48 = global.viewMatrix;
    let _e50 = wp;
    gl_Position = ((_e47 * _e48) * _e50);
    return;
}

@vertex 
fn main(@location(0) position: vec3<f32>, @location(1) normal: vec3<f32>, @location(2) instance0_: vec4<f32>, @location(3) instance1_: vec4<f32>, @location(4) instance2_: vec4<f32>, @location(5) instance3_: vec4<f32>, @location(6) instanceColor: vec3<f32>, @location(7) fpos: vec3<f32>, @location(8) aux: vec4<f32>) -> VertexOutput {
    position_1 = position;
    normal_1 = normal;
    instance0_1 = instance0_;
    instance1_1 = instance1_;
    instance2_1 = instance2_;
    instance3_1 = instance3_;
    instanceColor_1 = instanceColor;
    fpos_1 = fpos;
    aux_1 = aux;
    main_1();
    let _e53 = vWorld;
    let _e55 = vN;
    let _e57 = vFp;
    let _e59 = vAux;
    let _e61 = gl_Position;
    return VertexOutput(_e53, _e55, _e57, _e59, _e61);
}
`;
