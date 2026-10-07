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
var<private> vGA_1: f32;
var<private> vGSide_1: f32;

fn main_1() {
    let _e3 = vGA_1;
    let _e8 = vGSide_1;
    fragmentColor = vec4<f32>(((_e3 * 2f) * max(0f, (1f - abs(_e8)))), 0f, 0f, 1f);
    return;
}

@fragment 
fn main(@location(0) vGA: f32, @location(1) vGSide: f32) -> FragmentOutput {
    vGA_1 = vGA;
    vGSide_1 = vGSide;
    main_1();
    let _e11 = fragmentColor;
    return FragmentOutput(_e11);
}
`;
