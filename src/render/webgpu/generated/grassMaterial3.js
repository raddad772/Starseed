// Generated offline from the existing renderer equations. See tools/shaders/.
export const layout = {
  "uniforms": [
    {
      "name": "uBodyIndex",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 0
    }
  ],
  "textures": [],
  "bytes": 16,
  "group": 1,
  "attributes": []
};
export const code = /* wgsl */`
struct Params {
    uBodyIndex: f32,
}

struct FragmentOutput {
    @location(0) gAlbedo: vec4<f32>,
    @location(1) gNormal: vec4<f32>,
    @location(2) gEmission: vec4<f32>,
    @location(3) gSurface: vec4<f32>,
}

const PI: f32 = 3.1415927f;

@group(1) @binding(0) 
var<uniform> global: Params;
var<private> gAlbedo: vec4<f32>;
var<private> gNormal: vec4<f32>;
var<private> gEmission: vec4<f32>;
var<private> gSurface: vec4<f32>;
var<private> vGA_1: f32;
var<private> vGSide_1: f32;
var<private> vGT_1: f32;
var<private> vGK_1: f32;
var<private> vGS_1: f32;
var<private> vNormal_1: vec3<f32>;
var<private> vTint_1: vec3<f32>;

fn octEncode(n: vec3<f32>) -> vec2<f32> {
    var n_1: vec3<f32>;
    var local: f32;
    var local_1: f32;
    var local_2: vec2<f32>;

    n_1 = n;
    let _e9 = n_1;
    let _e10 = n_1;
    let _e13 = n_1;
    let _e17 = n_1;
    n_1 = (_e9 / vec3(((abs(_e10.x) + abs(_e13.y)) + abs(_e17.z))));
    let _e23 = n_1;
    if (_e23.z >= 0f) {
        let _e27 = n_1;
        local_2 = _e27.xy;
    } else {
        let _e30 = n_1;
        let _e35 = n_1;
        if (_e35.x >= 0f) {
            local = 1f;
        } else {
            local = -1f;
        }
        let _e43 = local;
        let _e44 = n_1;
        if (_e44.y >= 0f) {
            local_1 = 1f;
        } else {
            local_1 = -1f;
        }
        let _e52 = local_1;
        local_2 = ((vec2(1f) - abs(_e30.yx)) * vec2<f32>(_e43, _e52));
    }
    let _e56 = local_2;
    return _e56;
}

fn materialOutput(albedo: vec3<f32>, normal: vec3<f32>, roughness: f32, ao: f32, trans: f32, wet: f32, F0_: f32) {
    var albedo_1: vec3<f32>;
    var normal_1: vec3<f32>;
    var roughness_1: f32;
    var ao_1: f32;
    var trans_1: f32;
    var wet_1: f32;
    var F0_1: f32;

    albedo_1 = albedo;
    normal_1 = normal;
    roughness_1 = roughness;
    ao_1 = ao;
    trans_1 = trans;
    wet_1 = wet;
    F0_1 = F0_;
    let _e21 = albedo_1;
    let _e26 = clamp(_e21, vec3(0f), vec3(1f));
    let _e27 = ao_1;
    gAlbedo = vec4<f32>(_e26.x, _e26.y, _e26.z, clamp(_e27, 0f, 1f));
    let _e35 = normal_1;
    let _e37 = octEncode(normalize(_e35));
    let _e38 = roughness_1;
    let _e39 = global.uBodyIndex;
    gNormal = vec4<f32>(_e37.x, _e37.y, _e38, _e39);
    gEmission = vec4<f32>(0f, 0f, 0f, 1f);
    let _e48 = trans_1;
    let _e49 = wet_1;
    let _e51 = F0_1;
    gSurface = vec4<f32>(_e48, _e49, 0f, _e51);
    return;
}

fn main_1() {
    var albedo_2: vec3<f32>;

    let _e14 = vTint_1;
    let _e17 = vGT_1;
    let _e24 = vGK_1;
    albedo_2 = ((_e14 * mix(0.3f, 1f, pow(_e17, 0.8f))) * (0.82f + (0.36f * _e24)));
    let _e29 = albedo_2;
    let _e30 = vNormal_1;
    materialOutput(_e29, normalize(_e30), 0.85f, 1f, 0f, 0f, 0.04f);
    let _e38 = vGS_1;
    gEmission.w = -(exp(-(_e38)));
    return;
}

@fragment 
fn main(@location(0) vGA: f32, @location(1) vGSide: f32, @location(2) vGT: f32, @location(3) vGK: f32, @location(4) vGS: f32, @location(5) vNormal: vec3<f32>, @location(6) vTint: vec3<f32>) -> FragmentOutput {
    vGA_1 = vGA;
    vGSide_1 = vGSide;
    vGT_1 = vGT;
    vGK_1 = vGK;
    vGS_1 = vGS;
    vNormal_1 = vNormal;
    vTint_1 = vTint;
    main_1();
    let _e41 = gAlbedo;
    let _e43 = gNormal;
    let _e45 = gEmission;
    let _e47 = gSurface;
    return FragmentOutput(_e41, _e43, _e45, _e47);
}
`;
