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
var<private> vD_1: f32;

fn main_1() {
    let _e2 = vD_1;
    fragmentColor = vec4<f32>(_e2, 0f, 0f, 1f);
    return;
}

@fragment 
fn main(@location(0) vD: f32) -> FragmentOutput {
    vD_1 = vD;
    main_1();
    let _e7 = fragmentColor;
    return FragmentOutput(_e7);
}
`;
