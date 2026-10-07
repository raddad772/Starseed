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
      "name": "uFlow",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 16
    }
  ],
  "textures": [],
  "bytes": 32,
  "group": 1,
  "attributes": []
};
export const code = /* wgsl */`
struct Params {
    uHeat: f32,
    uTime: f32,
    uFlow: vec3<f32>,
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
    var facing: f32;
    var rim: f32;
    var n: f32;
    var col: vec3<f32>;

    let _e12 = vN_1;
    let _e14 = global.uFlow;
    facing = max(0f, dot(normalize(_e12), -(_e14)));
    let _e20 = vN_1;
    let _e22 = vView_1;
    rim = (1f - abs(dot(normalize(_e20), normalize(_e22))));
    let _e30 = global.uTime;
    let _e33 = vLocal_1;
    n = (0.75f + (0.25f * sin(((_e30 * 40f) + dot(_e33, vec3<f32>(3.1f, 1.7f, 2.3f))))));
    let _e52 = facing;
    col = mix(vec3<f32>(1f, 0.35f, 0.08f), vec3<f32>(1f, 0.75f, 0.6f), vec3(_e52));
    let _e56 = col;
    let _e57 = facing;
    let _e60 = rim;
    let _e65 = global.uHeat;
    let _e67 = n;
    let _e70 = ((((_e56 * ((_e57 * 2f) + (_e60 * 0.6f))) * _e65) * _e67) * 40f);
    fragmentColor = vec4<f32>(_e70.x, _e70.y, _e70.z, 1f);
    return;
}

@fragment 
fn main(@location(0) vLocal: vec3<f32>, @location(1) vN: vec3<f32>, @location(2) vView: vec3<f32>) -> FragmentOutput {
    vLocal_1 = vLocal;
    vN_1 = vN;
    vView_1 = vView;
    main_1();
    let _e23 = fragmentColor;
    return FragmentOutput(_e23);
}
`;
