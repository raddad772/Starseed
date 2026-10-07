// Generated offline from the existing renderer equations. See tools/shaders/.
export const layout = {
  "uniforms": [
    {
      "name": "uThrottle",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 0
    },
    {
      "name": "uTime",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 4
    },
    {
      "name": "uColor",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 16
    },
    {
      "name": "uVacuum",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 28
    }
  ],
  "textures": [],
  "bytes": 32,
  "group": 1,
  "attributes": []
};
export const code = /* wgsl */`
struct Params {
    uThrottle: f32,
    uTime: f32,
    uColor: vec3<f32>,
    uVacuum: f32,
}

struct FragmentOutput {
    @location(0) fragmentColor: vec4<f32>,
}

const PI: f32 = 3.1415927f;

@group(1) @binding(0) 
var<uniform> global: Params;
var<private> fragmentColor: vec4<f32>;
var<private> vLocal_1: vec3<f32>;
var<private> vN_1: vec3<f32>;
var<private> vView_1: vec3<f32>;

fn main_1() {
    var t: f32;
    var edge: f32;
    var core: f32;
    var flick: f32;
    var diamonds: f32;
    var fade: f32;
    var c: vec3<f32>;

    let _e13 = vLocal_1;
    t = clamp(-(_e13.y), 0f, 1f);
    let _e20 = vN_1;
    let _e22 = vView_1;
    edge = abs(dot(normalize(_e20), normalize(_e22)));
    let _e27 = edge;
    let _e30 = global.uVacuum;
    core = pow(_e27, mix(2.5f, 1.2f, _e30));
    let _e36 = global.uTime;
    let _e39 = t;
    let _e45 = global.uTime;
    let _e48 = t;
    flick = (0.85f + ((0.15f * sin(((_e36 * 63f) + (_e39 * 30f)))) * sin(((_e45 * 41f) + (_e48 * 11f)))));
    let _e58 = t;
    let _e61 = global.uTime;
    let _e72 = global.uVacuum;
    diamonds = mix((0.75f + (0.25f * pow(abs(sin(((_e58 * 18f) - (_e61 * 2f)))), 6f))), 1f, _e72);
    let _e76 = t;
    let _e79 = t;
    fade = ((1f - _e76) * (1f - _e79));
    let _e83 = global.uColor;
    let _e84 = core;
    let _e86 = fade;
    let _e88 = flick;
    let _e90 = diamonds;
    let _e92 = global.uThrottle;
    c = (((((_e83 * _e84) * _e86) * _e88) * _e90) * _e92);
    let _e95 = c;
    let _e100 = edge;
    let _e105 = t;
    let _e110 = global.uThrottle;
    c = (_e95 + ((((vec3<f32>(1f, 0.95f, 0.9f) * pow(_e100, 8f)) * pow((1f - _e105), 6f)) * _e110) * 3f));
    let _e115 = c;
    let _e117 = (_e115 * 60f);
    fragmentColor = vec4<f32>(_e117.x, _e117.y, _e117.z, 1f);
    return;
}

@fragment 
fn main(@location(0) vLocal: vec3<f32>, @location(1) vN: vec3<f32>, @location(2) vView: vec3<f32>) -> FragmentOutput {
    vLocal_1 = vLocal;
    vN_1 = vN;
    vView_1 = vView;
    main_1();
    let _e25 = fragmentColor;
    return FragmentOutput(_e25);
}
`;
