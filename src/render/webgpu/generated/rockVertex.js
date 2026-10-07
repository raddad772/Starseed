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
      "name": "uRockFar",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
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
      "name": "rA",
      "type": "vec4",
      "location": 7
    },
    {
      "name": "rB",
      "type": "vec4",
      "location": 8
    },
    {
      "name": "rC",
      "type": "float",
      "location": 9
    }
  ]
};
export const code = /* wgsl */`
struct Params {
    modelMatrix: mat4x4<f32>,
    viewMatrix: mat4x4<f32>,
    projectionMatrix: mat4x4<f32>,
    uRockFar: f32,
}

struct VertexOutput {
    @location(0) vWorld: vec3<f32>,
    @location(1) vLocal: vec3<f32>,
    @location(2) vLocalN: vec3<f32>,
    @location(3) vAx: vec3<f32>,
    @location(4) vAy: vec3<f32>,
    @location(5) vAz: vec3<f32>,
    @location(6) vR: vec4<f32>,
    @location(7) vCol: vec3<f32>,
    @location(8) vTa: f32,
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
var<private> rA_1: vec4<f32>;
var<private> rB_1: vec4<f32>;
var<private> rC_1: f32;
var<private> vWorld: vec3<f32>;
var<private> vLocal: vec3<f32>;
var<private> vLocalN: vec3<f32>;
var<private> vAx: vec3<f32>;
var<private> vAy: vec3<f32>;
var<private> vAz: vec3<f32>;
var<private> vR: vec4<f32>;
var<private> vCol: vec3<f32>;
var<private> vTa: f32;
var<private> gl_Position: vec4<f32>;

fn h1_(x: f32) -> f32 {
    var x_1: f32;

    x_1 = x;
    let _e21 = x_1;
    return fract((sin((_e21 * 91.3458f)) * 47453.547f));
}

fn h3_(x_2: f32) -> vec3<f32> {
    var x_3: f32;

    x_3 = x_2;
    let _e21 = x_3;
    let _e22 = h1_(_e21);
    let _e23 = x_3;
    let _e26 = h1_((_e23 + 17.13f));
    let _e27 = x_3;
    let _e30 = h1_((_e27 + 41.71f));
    return vec3<f32>(_e22, _e26, _e30);
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
    let _e23 = rA_1;
    seed = _e23.x;
    let _e26 = rA_1;
    round = _e26.z;
    let _e31 = v_1;
    fn_ = _e31;
    loop {
        let _e35 = k;
        if !((_e35 < 7i)) {
            break;
        }
        {
            let _e42 = seed;
            let _e45 = k;
            let _e50 = h3_(((_e42 * 31.7f) + (f32(_e45) * 7.13f)));
            n = normalize(((_e50 * 2f) - vec3(1f)));
            let _e60 = seed;
            let _e63 = k;
            let _e68 = h1_(((_e60 * 13.1f) + (f32(_e63) * 3.7f)));
            d = (0.55f + (0.35f * _e68));
            let _e72 = v_1;
            let _e73 = n;
            c = dot(_e72, _e73);
            let _e76 = c;
            if (_e76 > 0.05f) {
                {
                    let _e79 = d;
                    let _e80 = c;
                    t = (_e79 / _e80);
                    let _e83 = t;
                    let _e84 = rr;
                    if (_e83 < _e84) {
                        {
                            let _e86 = t;
                            rr = _e86;
                            let _e87 = n;
                            fn_ = _e87;
                        }
                    }
                }
            }
        }
        continuing {
            let _e39 = k;
            k = (_e39 + 1i);
        }
    }
    let _e88 = rr;
    let _e90 = round;
    rr = mix(_e88, 1f, _e90);
    let _e92 = fn_;
    let _e93 = v_1;
    let _e94 = round;
    fn_ = normalize(mix(_e92, _e93, vec3((_e94 * 0.85f))));
    let _e102 = seed;
    sy = (0.5f + (0.4f * fract((_e102 * 7.31f))));
    let _e109 = v_1;
    let _e110 = rr;
    (*lp) = (_e109 * _e110);
    let _e113 = (*lp);
    let _e115 = sy;
    let _e117 = sy;
    let _e120 = rA_1;
    (*lp).y = ((_e113.y * _e115) + (_e117 * (1f - (2f * _e120.w))));
    let _e126 = fn_;
    let _e128 = fn_;
    let _e130 = sy;
    let _e132 = fn_;
    (*ln) = normalize(vec3<f32>(_e126.x, (_e128.y / _e130), _e132.z));
    return;
}

fn rockShown() -> f32 {
    var o: vec4<f32>;
    var far: f32;

    let _e19 = global.modelMatrix;
    let _e20 = instance0_1;
    let _e21 = instance1_1;
    let _e22 = instance2_1;
    let _e23 = instance3_1;
    o = ((_e19 * mat4x4<f32>(vec4<f32>(_e20.x, _e20.y, _e20.z, _e20.w), vec4<f32>(_e21.x, _e21.y, _e21.z, _e21.w), vec4<f32>(_e22.x, _e22.y, _e22.z, _e22.w), vec4<f32>(_e23.x, _e23.y, _e23.z, _e23.w))) * vec4<f32>(0f, 0f, 0f, 1f));
    let _e53 = global.uRockFar;
    let _e56 = rB_1;
    far = (_e53 * (0.02f + (0.4f * _e56.x)));
    let _e64 = far;
    let _e66 = far;
    let _e67 = o;
    return (1f - smoothstep((0.7f * _e64), _e66, length(_e67.xyz)));
}

fn main_1() {
    var lp_1: vec3<f32>;
    var ln_1: vec3<f32>;
    var k_1: f32;
    var M: mat4x4<f32>;
    var wp: vec4<f32>;
    var R3_: mat3x3<f32>;

    let _e30 = position_1;
    rockShape(normalize(_e30), (&lp_1), (&ln_1));
    let _e36 = rockShown();
    k_1 = _e36;
    let _e38 = global.modelMatrix;
    let _e39 = instance0_1;
    let _e40 = instance1_1;
    let _e41 = instance2_1;
    let _e42 = instance3_1;
    M = (_e38 * mat4x4<f32>(vec4<f32>(_e39.x, _e39.y, _e39.z, _e39.w), vec4<f32>(_e40.x, _e40.y, _e40.z, _e40.w), vec4<f32>(_e41.x, _e41.y, _e41.z, _e41.w), vec4<f32>(_e42.x, _e42.y, _e42.z, _e42.w)));
    let _e66 = M;
    let _e67 = lp_1;
    let _e68 = k_1;
    let _e69 = (_e67 * _e68);
    wp = (_e66 * vec4<f32>(_e69.x, _e69.y, _e69.z, 1f));
    let _e77 = wp;
    vWorld = _e77.xyz;
    let _e79 = lp_1;
    let _e80 = rB_1;
    vLocal = (_e79 * _e80.x);
    let _e83 = ln_1;
    vLocalN = _e83;
    let _e84 = M;
    let _e93 = mat3x3<f32>(_e84[0].xyz, _e84[1].xyz, _e84[2].xyz);
    let _e94 = rB_1;
    let _e96 = vec3(_e94.x);
    R3_ = mat3x3<f32>((_e93[0] / _e96), (_e93[1] / _e96), (_e93[2] / _e96));
    let _e107 = R3_[0];
    vAx = _e107;
    let _e110 = R3_[1];
    vAy = _e110;
    let _e113 = R3_[2];
    vAz = _e113;
    let _e114 = rA_1;
    vR = _e114;
    let _e115 = rB_1;
    vCol = _e115.yzw;
    let _e117 = rC_1;
    vTa = _e117;
    let _e119 = global.projectionMatrix;
    let _e120 = global.viewMatrix;
    let _e122 = wp;
    gl_Position = ((_e119 * _e120) * _e122);
    return;
}

@vertex 
fn main(@location(0) position: vec3<f32>, @location(1) normal: vec3<f32>, @location(2) instance0_: vec4<f32>, @location(3) instance1_: vec4<f32>, @location(4) instance2_: vec4<f32>, @location(5) instance3_: vec4<f32>, @location(6) instanceColor: vec3<f32>, @location(7) rA: vec4<f32>, @location(8) rB: vec4<f32>, @location(9) rC: f32) -> VertexOutput {
    position_1 = position;
    normal_1 = normal;
    instance0_1 = instance0_;
    instance1_1 = instance1_;
    instance2_1 = instance2_;
    instance3_1 = instance3_;
    instanceColor_1 = instanceColor;
    rA_1 = rA;
    rB_1 = rB;
    rC_1 = rC;
    main_1();
    let _e69 = vWorld;
    let _e71 = vLocal;
    let _e73 = vLocalN;
    let _e75 = vAx;
    let _e77 = vAy;
    let _e79 = vAz;
    let _e81 = vR;
    let _e83 = vCol;
    let _e85 = vTa;
    let _e87 = gl_Position;
    return VertexOutput(_e69, _e71, _e73, _e75, _e77, _e79, _e81, _e83, _e85, _e87);
}
`;
