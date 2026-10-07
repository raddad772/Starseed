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
    }
  ],
  "textures": [
    {
      "name": "tSrc",
      "type": "sampler2D",
      "count": 0,
      "binding": 1,
      "samplerBinding": 2
    }
  ],
  "bytes": 16,
  "group": 0,
  "attributes": []
};
export const code = /* wgsl */`
struct Params {
    uTexel: vec2<f32>,
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
var<private> fragmentColor: vec4<f32>;
var<private> vUv_1: vec2<f32>;

fn main_1() {
    var a: vec3<f32>;
    var b: vec3<f32>;
    var c: vec3<f32>;
    var d: vec3<f32>;
    var e: vec3<f32>;
    var f: vec3<f32>;
    var g: vec3<f32>;
    var h: vec3<f32>;
    var i: vec3<f32>;
    var j: vec3<f32>;
    var k: vec3<f32>;
    var l: vec3<f32>;
    var m: vec3<f32>;
    var r: vec3<f32>;

    let _e6 = vUv_1;
    let _e7 = global.uTexel;
    let _e15 = textureSampleLevel(tSrcTexture, tSrcSampler, (_e6 + (_e7 * vec2<f32>(-2f, 2f))), 0f);
    a = _e15.xyz;
    let _e18 = vUv_1;
    let _e19 = global.uTexel;
    let _e26 = textureSampleLevel(tSrcTexture, tSrcSampler, (_e18 + (_e19 * vec2<f32>(0f, 2f))), 0f);
    b = _e26.xyz;
    let _e29 = vUv_1;
    let _e30 = global.uTexel;
    let _e37 = textureSampleLevel(tSrcTexture, tSrcSampler, (_e29 + (_e30 * vec2<f32>(2f, 2f))), 0f);
    c = _e37.xyz;
    let _e40 = vUv_1;
    let _e41 = global.uTexel;
    let _e49 = textureSampleLevel(tSrcTexture, tSrcSampler, (_e40 + (_e41 * vec2<f32>(-2f, 0f))), 0f);
    d = _e49.xyz;
    let _e52 = vUv_1;
    let _e54 = textureSampleLevel(tSrcTexture, tSrcSampler, _e52, 0f);
    e = _e54.xyz;
    let _e57 = vUv_1;
    let _e58 = global.uTexel;
    let _e65 = textureSampleLevel(tSrcTexture, tSrcSampler, (_e57 + (_e58 * vec2<f32>(2f, 0f))), 0f);
    f = _e65.xyz;
    let _e68 = vUv_1;
    let _e69 = global.uTexel;
    let _e78 = textureSampleLevel(tSrcTexture, tSrcSampler, (_e68 + (_e69 * vec2<f32>(-2f, -2f))), 0f);
    g = _e78.xyz;
    let _e81 = vUv_1;
    let _e82 = global.uTexel;
    let _e90 = textureSampleLevel(tSrcTexture, tSrcSampler, (_e81 + (_e82 * vec2<f32>(0f, -2f))), 0f);
    h = _e90.xyz;
    let _e93 = vUv_1;
    let _e94 = global.uTexel;
    let _e102 = textureSampleLevel(tSrcTexture, tSrcSampler, (_e93 + (_e94 * vec2<f32>(2f, -2f))), 0f);
    i = _e102.xyz;
    let _e105 = vUv_1;
    let _e106 = global.uTexel;
    let _e114 = textureSampleLevel(tSrcTexture, tSrcSampler, (_e105 + (_e106 * vec2<f32>(-1f, 1f))), 0f);
    j = _e114.xyz;
    let _e117 = vUv_1;
    let _e118 = global.uTexel;
    let _e125 = textureSampleLevel(tSrcTexture, tSrcSampler, (_e117 + (_e118 * vec2<f32>(1f, 1f))), 0f);
    k = _e125.xyz;
    let _e128 = vUv_1;
    let _e129 = global.uTexel;
    let _e138 = textureSampleLevel(tSrcTexture, tSrcSampler, (_e128 + (_e129 * vec2<f32>(-1f, -1f))), 0f);
    l = _e138.xyz;
    let _e141 = vUv_1;
    let _e142 = global.uTexel;
    let _e150 = textureSampleLevel(tSrcTexture, tSrcSampler, (_e141 + (_e142 * vec2<f32>(1f, -1f))), 0f);
    m = _e150.xyz;
    let _e153 = e;
    let _e156 = a;
    let _e157 = c;
    let _e159 = g;
    let _e161 = i;
    let _e166 = b;
    let _e167 = d;
    let _e169 = f;
    let _e171 = h;
    let _e176 = j;
    let _e177 = k;
    let _e179 = l;
    let _e181 = m;
    r = ((((_e153 * 0.125f) + ((((_e156 + _e157) + _e159) + _e161) * 0.03125f)) + ((((_e166 + _e167) + _e169) + _e171) * 0.0625f)) + ((((_e176 + _e177) + _e179) + _e181) * 0.125f));
    let _e187 = r;
    fragmentColor = vec4<f32>(_e187.x, _e187.y, _e187.z, 1f);
    return;
}

@fragment 
fn main(@location(0) vUv: vec2<f32>) -> FragmentOutput {
    vUv_1 = vUv;
    main_1();
    let _e13 = fragmentColor;
    return FragmentOutput(_e13);
}
`;
