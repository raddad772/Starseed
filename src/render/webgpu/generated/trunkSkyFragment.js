// Generated offline from the existing renderer equations. See tools/shaders/.
export const layout = {
  "uniforms": [],
  "textures": [],
  "bytes": 16,
  "group": 1,
  "attributes": []
};
export const code = /* wgsl */`
struct FragmentOutput {
    @location(0) fragmentColor: vec4<f32>,
}

var<private> fragmentColor: vec4<f32>;
var<private> vC_1: vec2<f32>;
var<private> vR_1: f32;
var<private> vH_1: f32;
var<private> vE_1: f32;

fn main_1() {
    var q: f32;
    var d: f32;
    var local: f32;
    var o: f32;

    let _e5 = vC_1;
    q = length(_e5);
    let _e8 = q;
    if (_e8 > 1f) {
        discard;
    }
    let _e11 = q;
    let _e12 = vE_1;
    d = (_e11 * _e12);
    let _e15 = d;
    let _e16 = vR_1;
    if (_e15 <= _e16) {
        local = 0.5f;
    } else {
        let _e19 = vR_1;
        let _e20 = d;
        let _e25 = vH_1;
        let _e27 = vH_1;
        let _e29 = vH_1;
        let _e30 = vH_1;
        let _e32 = d;
        let _e33 = d;
        local = ((((asin((_e19 / _e20)) / 3.1415927f) * _e25) * _e27) / ((_e29 * _e30) + (_e32 * _e33)));
    }
    let _e38 = local;
    o = _e38;
    let _e41 = o;
    let _e48 = q;
    fragmentColor = vec4<f32>((-(log((1f - _e41))) * (1f - smoothstep(0.85f, 1f, _e48))), 0f, 0f, 1f);
    return;
}

@fragment 
fn main(@location(0) vC: vec2<f32>, @location(1) vR: f32, @location(2) vH: f32, @location(3) vE: f32) -> FragmentOutput {
    vC_1 = vC;
    vR_1 = vR;
    vH_1 = vH;
    vE_1 = vE;
    main_1();
    let _e19 = fragmentColor;
    return FragmentOutput(_e19);
}
`;
