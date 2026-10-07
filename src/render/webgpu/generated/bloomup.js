// Generated offline from the existing renderer equations. See tools/shaders/.
export const layout = {
  "uniforms": [
    {
      "name": "uTexel",
      "type": "vec2",
      "count": 0,
      "align": 8,
      "size": 8,
      "stride": 8,
      "offset": 0
    },
    {
      "name": "uRadius",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 8
    }
  ],
  "textures": [
    {
      "name": "tSrc",
      "type": "sampler2D",
      "count": 0,
      "binding": 1,
      "samplerBinding": 2
    },
    {
      "name": "tBase",
      "type": "sampler2D",
      "count": 0,
      "binding": 3,
      "samplerBinding": 4
    }
  ],
  "bytes": 16,
  "group": 0,
  "attributes": []
};
export const code = /* wgsl */`
struct Params {
    uTexel: vec2<f32>,
    uRadius: f32,
}

struct FragmentOutput {
    @location(0) fragmentColor: vec4<f32>,
}

@group(0) @binding(0) 
var<uniform> global: Params;
@group(0) @binding(1) 
var tSrcTexture: texture_2d<f32>;
@group(0) @binding(2) 
var tSrcSampler: sampler;
@group(0) @binding(3) 
var tBaseTexture: texture_2d<f32>;
@group(0) @binding(4) 
var tBaseSampler: sampler;
var<private> fragmentColor: vec4<f32>;
var<private> vUv_1: vec2<f32>;

fn main_1() {
    var o: vec2<f32>;
    var s: vec3<f32>;

    let _e10 = global.uTexel;
    let _e11 = global.uRadius;
    o = (_e10 * _e11);
    let _e14 = vUv_1;
    let _e15 = o;
    let _e18 = o;
    let _e23 = textureSampleLevel(tSrcTexture, tSrcSampler, (_e14 + vec2<f32>(-(_e15.x), _e18.y)), 0f);
    let _e26 = vUv_1;
    let _e28 = o;
    let _e33 = textureSampleLevel(tSrcTexture, tSrcSampler, (_e26 + vec2<f32>(0f, _e28.y)), 0f);
    let _e37 = vUv_1;
    let _e38 = o;
    let _e41 = textureSampleLevel(tSrcTexture, tSrcSampler, (_e37 + _e38), 0f);
    let _e45 = vUv_1;
    let _e46 = o;
    let _e53 = textureSampleLevel(tSrcTexture, tSrcSampler, (_e45 + vec2<f32>(-(_e46.x), 0f)), 0f);
    let _e58 = vUv_1;
    let _e60 = textureSampleLevel(tSrcTexture, tSrcSampler, _e58, 0f);
    let _e65 = vUv_1;
    let _e66 = o;
    let _e72 = textureSampleLevel(tSrcTexture, tSrcSampler, (_e65 + vec2<f32>(_e66.x, 0f)), 0f);
    let _e76 = vUv_1;
    let _e77 = o;
    let _e80 = textureSampleLevel(tSrcTexture, tSrcSampler, (_e76 - _e77), 0f);
    let _e84 = vUv_1;
    let _e86 = o;
    let _e92 = textureSampleLevel(tSrcTexture, tSrcSampler, (_e84 + vec2<f32>(0f, -(_e86.y))), 0f);
    let _e96 = vUv_1;
    let _e97 = o;
    let _e99 = o;
    let _e105 = textureSampleLevel(tSrcTexture, tSrcSampler, (_e96 + vec2<f32>(_e97.x, -(_e99.y))), 0f);
    s = ((((((((_e23.xyz + (2f * _e33.xyz)) + _e41.xyz) + (2f * _e53.xyz)) + (4f * _e60.xyz)) + (2f * _e72.xyz)) + _e80.xyz) + (2f * _e92.xyz)) + _e105.xyz);
    let _e109 = vUv_1;
    let _e111 = textureSampleLevel(tBaseTexture, tBaseSampler, _e109, 0f);
    let _e113 = s;
    let _e117 = (_e111.xyz + (_e113 / vec3(16f)));
    fragmentColor = vec4<f32>(_e117.x, _e117.y, _e117.z, 1f);
    return;
}

@fragment 
fn main(@location(0) vUv: vec2<f32>) -> FragmentOutput {
    vUv_1 = vUv;
    main_1();
    let _e19 = fragmentColor;
    return FragmentOutput(_e19);
}
`;
