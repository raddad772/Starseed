// Generated offline from the existing renderer equations. See tools/shaders/.
export const layout = {
  "uniforms": [
    {
      "name": "uHeat",
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
      "name": "uWake",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 8
    },
    {
      "name": "uFlow",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 16
    },
    {
      "name": "uColor",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 32
    }
  ],
  "textures": [],
  "bytes": 48,
  "group": 1,
  "attributes": []
};
export const code = /* wgsl */`
struct Params {
    uHeat: f32,
    uTime: f32,
    uWake: f32,
    uFlow: vec3<f32>,
    uColor: vec3<f32>,
}

struct FragmentOutput {
    @location(0) fragmentColor: vec4<f32>,
}

const PI: f32 = 3.1415927f;

@group(1) @binding(0)
var<uniform> global: Params;
var<private> fragmentColor: vec4<f32>;
var<private> vLocal_1: vec3<f32>;
var<private> vNormalLocal_1: vec3<f32>;
var<private> vN_1: vec3<f32>;
var<private> vView_1: vec3<f32>;

fn main_1() {
    var edge: f32;
    var facing: f32;
    var front: f32;
    var arc: f32;
    var bands: f32;
    var shell: f32;
    var t: f32;
    var streaks: f32;
    var wake: f32;
    var emission: f32;
    var core: vec3<f32>;

    let _e17 = vN_1;
    let _e19 = vView_1;
    edge = (1f - abs(dot(normalize(_e17), normalize(_e19))));
    let _e25 = vNormalLocal_1;
    let _e27 = global.uFlow;
    facing = dot(normalize(_e25), _e27);
    let _e33 = facing;
    front = smoothstep(-0.15f, 0.8f, _e33);
    let _e37 = facing;
    arc = pow(max(0f, _e37), 5f);
    let _e44 = vLocal_1;
    let _e50 = global.uTime;
    bands = (0.86f + (0.14f * sin((dot(_e44, vec3<f32>(5f, 9f, 3f)) - (_e50 * 4f)))));
    let _e58 = front;
    let _e61 = edge;
    let _e67 = arc;
    shell = ((_e58 * (0.035f + (0.9f * pow(_e61, 5f)))) + (_e67 * 0.055f));
    let _e72 = vLocal_1;
    t = clamp(_e72.y, 0f, 1f);
    let _e82 = vLocal_1;
    let _e84 = vLocal_1;
    let _e89 = t;
    let _e93 = global.uTime;
    streaks = (0.35f + (0.65f * pow((0.5f + (0.5f * sin((((atan2(_e82.z, _e84.x) * 7f) + (_e89 * 8f)) - (_e93 * 1.5f))))), 2f)));
    let _e107 = t;
    let _e110 = t;
    let _e116 = edge;
    let _e121 = streaks;
    wake = ((((smoothstep(0f, 0.12f, _e107) * pow((1f - _e110), 2f)) * pow((1f - _e116), 1.2f)) * _e121) * 0.45f);
    let _e126 = shell;
    let _e127 = wake;
    let _e128 = global.uWake;
    let _e130 = bands;
    let _e132 = global.uHeat;
    emission = ((mix(_e126, _e127, _e128) * _e130) * _e132);
    let _e135 = global.uColor;
    let _e140 = arc;
    let _e144 = global.uHeat;
    core = mix(_e135, vec3<f32>(0.72f, 0.86f, 1f), vec3(clamp(((_e140 * 0.5f) + (max(0f, (_e144 - 2.5f)) * 0.2f)), 0f, 0.7f)));
    let _e157 = core;
    let _e159 = (_e157 * 2.5f);
    let _e160 = emission;
    fragmentColor = vec4<f32>(_e159.x, _e159.y, _e159.z, clamp((_e160 * 0.22f), 0f, 0.8f));
    return;
}

@fragment
fn main(@location(0) vLocal: vec3<f32>, @location(1) vNormalLocal: vec3<f32>, @location(2) vN: vec3<f32>, @location(3) vView: vec3<f32>) -> FragmentOutput {
    vLocal_1 = vLocal;
    vNormalLocal_1 = vNormalLocal;
    vN_1 = vN;
    vView_1 = vView;
    main_1();
    let _e31 = fragmentColor;
    return FragmentOutput(_e31);
}
`;
