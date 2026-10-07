// Generated offline from the existing renderer equations. See tools/shaders/.
export const layout = {
  "uniforms": [
    {
      "name": "uDepthMode",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 0
    },
    {
      "name": "uNear",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 4
    },
    {
      "name": "uFar",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 8
    },
    {
      "name": "uLogDepthFC",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 12
    }
  ],
  "textures": [
    {
      "name": "tDetail",
      "type": "sampler2D",
      "count": 0,
      "binding": 1,
      "samplerBinding": 2
    },
    {
      "name": "tSceneDepth",
      "type": "sampler2D",
      "count": 0,
      "binding": 3,
      "samplerBinding": 4
    }
  ],
  "bytes": 16,
  "group": 1,
  "attributes": []
};
export const code = /* wgsl */`
struct Params {
    uDepthMode: f32,
    uNear: f32,
    uFar: f32,
    uLogDepthFC: f32,
}

struct FragmentOutput {
    @location(0) fragmentColor: vec4<f32>,
}

const PI: f32 = 3.1415927f;

@group(1) @binding(0) 
var<uniform> global: Params;
@group(1) @binding(1) 
var tDetailTexture: texture_2d<f32>;
@group(1) @binding(2) 
var tDetailSampler: sampler;
@group(1) @binding(3) 
var tSceneDepthTexture: texture_2d<f32>;
@group(1) @binding(4) 
var tSceneDepthSampler: sampler;
var<private> fragmentColor: vec4<f32>;
var<private> vCol_1: vec3<f32>;
var<private> vA_1: f32;
var<private> vUv_1: vec2<f32>;
var<private> vMist_1: f32;
var<private> vS_1: vec2<f32>;
var<private> vZ_1: f32;
var<private> vK_1: f32;
var<private> gl_FragCoord_1: vec4<f32>;

fn viewZFromDepth(d: f32) -> f32 {
    var d_1: f32;
    var c: f32;
    var dd: f32;

    d_1 = d;
    let _e23 = global.uDepthMode;
    if (_e23 < 0.5f) {
        {
            let _e26 = global.uNear;
            let _e27 = global.uFar;
            let _e28 = global.uNear;
            c = (_e26 / (_e27 - _e28));
            let _e32 = global.uFar;
            let _e33 = global.uNear;
            let _e35 = global.uFar;
            let _e36 = global.uNear;
            dd = ((_e32 * _e33) / (_e35 - _e36));
            let _e40 = dd;
            let _e41 = d_1;
            let _e42 = c;
            return (_e40 / max((_e41 + _e42), 0.000000000000000000000000000001f));
        }
    }
    let _e47 = d_1;
    let _e48 = global.uLogDepthFC;
    return (exp2((_e47 * _e48)) - 1f);
}

fn isSkyDepth(d_2: f32) -> bool {
    var d_3: f32;
    var local: bool;

    d_3 = d_2;
    let _e23 = global.uDepthMode;
    if (_e23 < 0.5f) {
        let _e26 = d_3;
        local = (_e26 <= 0f);
    } else {
        let _e29 = d_3;
        local = (_e29 >= 1f);
    }
    let _e33 = local;
    return _e33;
}

fn main_1() {
    var local_1: f32;
    var r: f32;
    var dRaw: f32;
    var local_2: f32;
    var zs: f32;
    var local_3: f32;
    var soft: f32;
    var local_4: f32;
    var a: f32;

    let _e21 = vMist_1;
    if (_e21 > 0.5f) {
        let _e24 = vUv_1;
        local_1 = length(_e24);
    } else {
        let _e26 = vUv_1;
        let _e29 = vK_1;
        let _e34 = vK_1;
        let _e39 = vUv_1;
        local_1 = length(vec2<f32>((max((abs(_e26.x) - _e29), 0f) / max((1f - _e34), 0.001f)), _e39.y));
    }
    let _e44 = local_1;
    r = _e44;
    let _e46 = r;
    if (_e46 > 1f) {
        discard;
    }
    let _e50 = gl_FragCoord_1;
    let _e54 = textureLoad(tSceneDepthTexture, vec2<i32>(_e50.xy), 0i);
    dRaw = _e54.x;
    let _e57 = dRaw;
    let _e58 = isSkyDepth(_e57);
    if _e58 {
        local_2 = 1000000000000000000000000000000f;
    } else {
        let _e60 = dRaw;
        let _e61 = viewZFromDepth(_e60);
        local_2 = _e61;
    }
    let _e63 = local_2;
    zs = _e63;
    let _e65 = vZ_1;
    let _e66 = zs;
    if (_e65 > _e66) {
        discard;
    }
    let _e68 = zs;
    let _e69 = vZ_1;
    let _e71 = vMist_1;
    if (_e71 > 0.5f) {
        local_3 = 1.5f;
    } else {
        local_3 = 0.4f;
    }
    let _e77 = local_3;
    soft = clamp(((_e68 - _e69) / _e77), 0f, 1f);
    let _e83 = vA_1;
    let _e84 = soft;
    let _e86 = vMist_1;
    if (_e86 > 0.5f) {
        let _e92 = r;
        local_4 = (1f - smoothstep(0.2f, 1f, _e92));
    } else {
        let _e97 = r;
        let _e99 = r;
        local_4 = exp(((-4.5f * _e97) * _e99));
    }
    let _e103 = local_4;
    a = ((_e83 * _e84) * _e103);
    let _e106 = vMist_1;
    if (_e106 > 0.5f) {
        let _e109 = a;
        let _e112 = vUv_1;
        let _e115 = vS_1;
        let _e118 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e112 * 0.25f) + _e115), 0f);
        a = (_e109 * (0.4f + (1.2f * _e118.w)));
    }
    let _e123 = vCol_1;
    let _e124 = a;
    fragmentColor = vec4<f32>(_e123.x, _e123.y, _e123.z, _e124);
    return;
}

@fragment 
fn main(@location(0) vCol: vec3<f32>, @location(1) vA: f32, @location(2) vUv: vec2<f32>, @location(3) vMist: f32, @location(4) vS: vec2<f32>, @location(5) vZ: f32, @location(6) vK: f32, @builtin(position) gl_FragCoord: vec4<f32>) -> FragmentOutput {
    vCol_1 = vCol;
    vA_1 = vA;
    vUv_1 = vUv;
    vMist_1 = vMist;
    vS_1 = vS;
    vZ_1 = vZ;
    vK_1 = vK;
    gl_FragCoord_1 = gl_FragCoord;
    main_1();
    let _e51 = fragmentColor;
    return FragmentOutput(_e51);
}
`;
