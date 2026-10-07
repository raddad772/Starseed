// Generated offline from the existing renderer equations. See tools/shaders/.
export const layout = {
  "uniforms": [
    {
      "name": "uTex",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 0
    }
  ],
  "textures": [
    {
      "name": "tLeaf",
      "type": "sampler2D",
      "count": 0,
      "binding": 1,
      "samplerBinding": 2
    }
  ],
  "bytes": 16,
  "group": 1,
  "attributes": []
};
export const code = /* wgsl */`
struct Params {
    uTex: f32,
}

struct FragmentOutput {
    @location(0) fragmentColor: vec4<f32>,
}

@group(1) @binding(0) 
var<uniform> global: Params;
@group(1) @binding(1) 
var tLeafTexture: texture_2d<f32>;
@group(1) @binding(2) 
var tLeafSampler: sampler;
var<private> fragmentColor: vec4<f32>;
var<private> vD_1: f32;
var<private> vUv_1: vec2<f32>;
var<private> vPart_1: f32;

fn main_1() {
    var uvDx: vec2<f32>;
    var uvDy: vec2<f32>;
    var tx: vec2<f32>;
    var ddx: vec2<f32>;
    var ddy: vec2<f32>;
    var mip: f32;

    let _e8 = vUv_1;
    let _e9 = dpdx(_e8);
    uvDx = _e9;
    let _e11 = vUv_1;
    let _e12 = dpdy(_e11);
    uvDy = _e12;
    let _e14 = global.uTex;
    let _e17 = vPart_1;
    let _e21 = vPart_1;
    if (((_e14 > 0.5f) && (_e17 > 0.5f)) && (_e21 < 1.5f)) {
        {
            let _e25 = vUv_1;
            let _e27 = textureDimensions(tLeafTexture, 0i);
            tx = (_e25 * vec2<f32>(vec2<i32>(_e27)));
            let _e32 = uvDx;
            let _e34 = textureDimensions(tLeafTexture, 0i);
            ddx = (_e32 * vec2<f32>(vec2<i32>(_e34)));
            let _e39 = uvDy;
            let _e41 = textureDimensions(tLeafTexture, 0i);
            ddy = (_e39 * vec2<f32>(vec2<i32>(_e41)));
            let _e48 = ddx;
            let _e49 = ddx;
            let _e51 = ddy;
            let _e52 = ddy;
            mip = max(0f, (0.5f * log2(max(dot(_e48, _e49), dot(_e51, _e52)))));
            let _e59 = vUv_1;
            let _e60 = uvDx;
            let _e61 = uvDy;
            let _e62 = textureSampleGrad(tLeafTexture, tLeafSampler, _e59, _e60, _e61);
            let _e66 = mip;
            if ((_e62.w * (1f + (0.3f * _e66))) < 0.5f) {
                discard;
            }
        }
    }
    let _e72 = vD_1;
    fragmentColor = vec4<f32>(_e72, 0f, 0f, 1f);
    return;
}

@fragment 
fn main(@location(0) vD: f32, @location(1) vUv: vec2<f32>, @location(2) vPart: f32) -> FragmentOutput {
    vD_1 = vD;
    vUv_1 = vUv;
    vPart_1 = vPart;
    main_1();
    let _e21 = fragmentColor;
    return FragmentOutput(_e21);
}
`;
