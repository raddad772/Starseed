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
var<private> vQuad_1: vec2<f32>;
var<private> vColor_1: vec3<f32>;

fn main_1() {
    var q: vec2<f32>;
    var r2_: f32;
    var a: f32;

    let _e3 = vQuad_1;
    q = ((_e3 * 2f) - vec2(1f));
    let _e10 = q;
    let _e11 = q;
    r2_ = dot(_e10, _e11);
    let _e14 = r2_;
    a = exp((-(_e14) * 4f));
    let _e20 = a;
    if (_e20 < 0.01f) {
        discard;
    }
    let _e23 = vColor_1;
    let _e24 = a;
    let _e25 = (_e23 * _e24);
    fragmentColor = vec4<f32>(_e25.x, _e25.y, _e25.z, 1f);
    return;
}

@fragment 
fn main(@location(1) vQuad: vec2<f32>, @location(0) vColor: vec3<f32>) -> FragmentOutput {
    vQuad_1 = vQuad;
    vColor_1 = vColor;
    main_1();
    let _e11 = fragmentColor;
    return FragmentOutput(_e11);
}
`;
