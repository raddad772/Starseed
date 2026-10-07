// Generated offline from the existing renderer equations. See tools/shaders/.
export const layout = {
  "uniforms": [
    {
      "name": "uTime",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 0
    },
    {
      "name": "uSize",
      "type": "vec2",
      "count": 0,
      "align": 8,
      "size": 8,
      "stride": 8,
      "offset": 8
    }
  ],
  "textures": [],
  "bytes": 16,
  "group": 1,
  "attributes": []
};
export const code = /* wgsl */`
struct Params {
    uTime: f32,
    uSize: vec2<f32>,
}

struct FragmentOutput {
    @location(0) fragmentColor: vec4<f32>,
}

const PI: f32 = 3.1415927f;

@group(1) @binding(0) 
var<uniform> global: Params;
var<private> fragmentColor: vec4<f32>;
var<private> vUv_1: vec2<f32>;
var<private> vN_1: vec3<f32>;
var<private> vView_1: vec3<f32>;

fn main_1() {
    var p: vec2<f32>;
    var r: vec2<f32> = vec2<f32>(1f, 1.7320508f);
    var h: vec2<f32>;
    var a: vec2<f32>;
    var b: vec2<f32>;
    var local: vec2<f32>;
    var g: vec2<f32>;
    var edge: f32;
    var wave: f32;
    var facing: f32;
    var frame: f32;
    var c: vec3<f32>;

    let _e9 = vUv_1;
    let _e10 = global.uSize;
    p = ((_e9 * _e10) / vec2(6f));
    let _e20 = r;
    h = (_e20 * 0.5f);
    let _e24 = p;
    let _e25 = r;
    let _e30 = h;
    a = ((_e24 - (floor((_e24 / _e25)) * _e25)) - _e30);
    let _e33 = p;
    let _e34 = h;
    let _e35 = (_e33 - _e34);
    let _e36 = r;
    let _e41 = h;
    b = ((_e35 - (floor((_e35 / _e36)) * _e36)) - _e41);
    let _e44 = a;
    let _e45 = a;
    let _e47 = b;
    let _e48 = b;
    if (dot(_e44, _e45) < dot(_e47, _e48)) {
        let _e51 = a;
        local = _e51;
    } else {
        let _e52 = b;
        local = _e52;
    }
    let _e54 = local;
    g = _e54;
    let _e58 = g;
    let _e63 = g;
    let _e69 = g;
    edge = smoothstep(0.38f, 0.5f, max(((abs(_e58.x) * 0.866f) + (abs(_e63.y) * 0.5f)), abs(_e69.y)));
    let _e77 = global.uTime;
    let _e80 = vUv_1;
    let _e85 = vUv_1;
    let _e89 = global.uTime;
    wave = (0.5f + (0.5f * sin((((_e77 * 0.8f) + (_e80.x * 18f)) + sin(((_e85.y * 9f) + _e89))))));
    let _e98 = vN_1;
    let _e100 = vView_1;
    facing = (1f - abs(dot(normalize(_e98), normalize(_e100))));
    let _e108 = vUv_1;
    let _e111 = vUv_1;
    let _e115 = vUv_1;
    let _e118 = vUv_1;
    frame = smoothstep(0.03f, 0f, (min(min(_e108.x, (1f - _e111.x)), min(_e115.y, (1f - _e118.y))) * 8f));
    let _e131 = edge;
    let _e134 = wave;
    let _e136 = facing;
    let _e140 = frame;
    c = (vec3<f32>(0.25f, 0.6f, 1f) * (((((_e131 * 0.0035f) * _e134) + (_e136 * 0.004f)) + (_e140 * 0.04f)) + 0.0003f));
    let _e148 = c;
    fragmentColor = vec4<f32>(_e148.x, _e148.y, _e148.z, 1f);
    return;
}

@fragment 
fn main(@location(0) vUv: vec2<f32>, @location(1) vN: vec3<f32>, @location(2) vView: vec3<f32>) -> FragmentOutput {
    vUv_1 = vUv;
    vN_1 = vN;
    vView_1 = vView;
    main_1();
    let _e21 = fragmentColor;
    return FragmentOutput(_e21);
}
`;
