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
      "name": "uRockFar",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 256
    },
    {
      "name": "uLightPos",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 272
    },
    {
      "name": "uLightDir",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 288
    }
  ],
  "textures": [],
  "bytes": 304,
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
      "name": "rA",
      "type": "vec4",
      "location": 5
    },
    {
      "name": "rB",
      "type": "vec4",
      "location": 6
    },
    {
      "name": "rC",
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
    uRockFar: f32,
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
var<private> rA_1: vec4<f32>;
var<private> rB_1: vec4<f32>;
var<private> rC_1: f32;
var<private> vD: f32;
var<private> gl_Position: vec4<f32>;

fn h1_(x: f32) -> f32 {
    var x_1: f32;

    x_1 = x;
    let _e24 = x_1;
    return fract((sin((_e24 * 91.3458f)) * 47453.547f));
}

fn h3_(x_2: f32) -> vec3<f32> {
    var x_3: f32;

    x_3 = x_2;
    let _e24 = x_3;
    let _e25 = h1_(_e24);
    let _e26 = x_3;
    let _e29 = h1_((_e26 + 17.13f));
    let _e30 = x_3;
    let _e33 = h1_((_e30 + 41.71f));
    return vec3<f32>(_e25, _e29, _e33);
}

fn rockShape(v: vec3<f32>, lp: ptr<function, vec3<f32>>, ln: ptr<function, vec3<f32>>) {
    var v_1: vec3<f32>;
    var seed: f32;
    var round: f32;
    var rr: f32 = 1f;
    var fn_: vec3<f32>;
    var k: i32 = 0i;
    var n: vec3<f32>;
    var d: f32;
    var c: f32;
    var t: f32;
    var sy: f32;

    v_1 = v;
    let _e26 = rA_1;
    seed = _e26.x;
    let _e29 = rA_1;
    round = _e29.z;
    let _e34 = v_1;
    fn_ = _e34;
    loop {
        let _e38 = k;
        if !((_e38 < 7i)) {
            break;
        }
        {
            let _e45 = seed;
            let _e48 = k;
            let _e53 = h3_(((_e45 * 31.7f) + (f32(_e48) * 7.13f)));
            n = normalize(((_e53 * 2f) - vec3(1f)));
            let _e63 = seed;
            let _e66 = k;
            let _e71 = h1_(((_e63 * 13.1f) + (f32(_e66) * 3.7f)));
            d = (0.55f + (0.35f * _e71));
            let _e75 = v_1;
            let _e76 = n;
            c = dot(_e75, _e76);
            let _e79 = c;
            if (_e79 > 0.05f) {
                {
                    let _e82 = d;
                    let _e83 = c;
                    t = (_e82 / _e83);
                    let _e86 = t;
                    let _e87 = rr;
                    if (_e86 < _e87) {
                        {
                            let _e89 = t;
                            rr = _e89;
                            let _e90 = n;
                            fn_ = _e90;
                        }
                    }
                }
            }
        }
        continuing {
            let _e42 = k;
            k = (_e42 + 1i);
        }
    }
    let _e91 = rr;
    let _e93 = round;
    rr = mix(_e91, 1f, _e93);
    let _e95 = fn_;
    let _e96 = v_1;
    let _e97 = round;
    fn_ = normalize(mix(_e95, _e96, vec3((_e97 * 0.85f))));
    let _e105 = seed;
    sy = (0.5f + (0.4f * fract((_e105 * 7.31f))));
    let _e112 = v_1;
    let _e113 = rr;
    (*lp) = (_e112 * _e113);
    let _e116 = (*lp);
    let _e118 = sy;
    let _e120 = sy;
    let _e123 = rA_1;
    (*lp).y = ((_e116.y * _e118) + (_e120 * (1f - (2f * _e123.w))));
    let _e129 = fn_;
    let _e131 = fn_;
    let _e133 = sy;
    let _e135 = fn_;
    (*ln) = normalize(vec3<f32>(_e129.x, (_e131.y / _e133), _e135.z));
    return;
}

fn rockShown() -> f32 {
    var o: vec4<f32>;
    var far: f32;

    let _e22 = global.modelMatrix;
    let _e23 = instance0_1;
    let _e24 = instance1_1;
    let _e25 = instance2_1;
    let _e26 = instance3_1;
    o = ((_e22 * mat4x4<f32>(vec4<f32>(_e23.x, _e23.y, _e23.z, _e23.w), vec4<f32>(_e24.x, _e24.y, _e24.z, _e24.w), vec4<f32>(_e25.x, _e25.y, _e25.z, _e25.w), vec4<f32>(_e26.x, _e26.y, _e26.z, _e26.w))) * vec4<f32>(0f, 0f, 0f, 1f));
    let _e56 = global.uRockFar;
    let _e59 = rB_1;
    far = (_e56 * (0.02f + (0.4f * _e59.x)));
    let _e67 = far;
    let _e69 = far;
    let _e70 = o;
    return (1f - smoothstep((0.7f * _e67), _e69, length(_e70.xyz)));
}

fn main_1() {
    var lp_1: vec3<f32>;
    var ln_1: vec3<f32>;
    var wp: vec4<f32>;

    let _e25 = position_1;
    rockShape(normalize(_e25), (&lp_1), (&ln_1));
    let _e31 = global.modelMatrix;
    let _e32 = instance0_1;
    let _e33 = instance1_1;
    let _e34 = instance2_1;
    let _e35 = instance3_1;
    let _e58 = lp_1;
    let _e59 = rockShown();
    let _e60 = (_e58 * _e59);
    wp = ((_e31 * mat4x4<f32>(vec4<f32>(_e32.x, _e32.y, _e32.z, _e32.w), vec4<f32>(_e33.x, _e33.y, _e33.z, _e33.w), vec4<f32>(_e34.x, _e34.y, _e34.z, _e34.w), vec4<f32>(_e35.x, _e35.y, _e35.z, _e35.w))) * vec4<f32>(_e60.x, _e60.y, _e60.z, 1f));
    let _e68 = global.uLightPos;
    let _e69 = wp;
    let _e72 = global.uLightDir;
    vD = dot((_e68 - _e69.xyz), _e72);
    let _e75 = global.projectionMatrix;
    let _e76 = global.viewMatrix;
    let _e78 = wp;
    gl_Position = ((_e75 * _e76) * _e78);
    let _e81 = gl_Position;
    gl_Position.y = -(_e81.y);
    let _e86 = gl_Position;
    let _e88 = gl_Position;
    gl_Position.z = (0.5f * (_e86.z + _e88.w));
    return;
}

@vertex 
fn main(@location(0) position: vec3<f32>, @location(1) instance0_: vec4<f32>, @location(2) instance1_: vec4<f32>, @location(3) instance2_: vec4<f32>, @location(4) instance3_: vec4<f32>, @location(5) rA: vec4<f32>, @location(6) rB: vec4<f32>, @location(7) rC: f32) -> VertexOutput {
    position_1 = position;
    instance0_1 = instance0_;
    instance1_1 = instance1_;
    instance2_1 = instance2_;
    instance3_1 = instance3_;
    rA_1 = rA;
    rB_1 = rB;
    rC_1 = rC;
    main_1();
    let _e49 = vD;
    let _e51 = gl_Position;
    return VertexOutput(_e49, _e51);
}
`;
