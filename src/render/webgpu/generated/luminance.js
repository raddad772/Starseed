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
    },
    {
      "name": "uRef",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 16
    },
    {
      "name": "uNearCut",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 20
    }
  ],
  "textures": [
    {
      "name": "tColor",
      "type": "sampler2D",
      "count": 0,
      "binding": 1,
      "samplerBinding": 2
    },
    {
      "name": "tDepth",
      "type": "sampler2D",
      "count": 0,
      "binding": 3,
      "samplerBinding": 4
    }
  ],
  "bytes": 32,
  "group": 0
};
export const code = /* wgsl */`
struct Params {
    uDepthMode: f32,
    uNear: f32,
    uFar: f32,
    uLogDepthFC: f32,
    uRef: f32,
    uNearCut: f32,
}

struct FragmentOutput {
    @location(0) fragmentColor: vec4<f32>,
}

@group(0) @binding(0) 
var<uniform> global: Params;
@group(0) @binding(1) 
var tColorTexture: texture_2d<f32>;
@group(0) @binding(2) 
var tColorSampler: sampler;
@group(0) @binding(3) 
var tDepthTexture: texture_2d<f32>;
@group(0) @binding(4) 
var tDepthSampler: sampler;
var<private> fragmentColor: vec4<f32>;
var<private> vUv_1: vec2<f32>;

fn finite_isnan(x: f32) -> bool {
    var x_1: f32;

    x_1 = x;
    let _e19 = x_1;
    return ((bitcast<u32>(_e19) & 2147483647u) > 2139095040u);
}

fn finite_isnan_1(x_2: vec2<f32>) -> vec2<bool> {
    var x_3: vec2<f32>;

    x_3 = x_2;
    let _e21 = x_3.x;
    let _e22 = finite_isnan(_e21);
    let _e25 = x_3.y;
    let _e26 = finite_isnan(_e25);
    return vec2<bool>(_e22, _e26);
}

fn finite_isnan_2(x_4: vec3<f32>) -> vec3<bool> {
    var x_5: vec3<f32>;

    x_5 = x_4;
    let _e21 = x_5.x;
    let _e22 = finite_isnan(_e21);
    let _e25 = x_5.y;
    let _e26 = finite_isnan(_e25);
    let _e29 = x_5.z;
    let _e30 = finite_isnan(_e29);
    return vec3<bool>(_e22, _e26, _e30);
}

fn finite_isnan_3(x_6: vec4<f32>) -> vec4<bool> {
    var x_7: vec4<f32>;

    x_7 = x_6;
    let _e21 = x_7.x;
    let _e22 = finite_isnan(_e21);
    let _e25 = x_7.y;
    let _e26 = finite_isnan(_e25);
    let _e29 = x_7.z;
    let _e30 = finite_isnan(_e29);
    let _e33 = x_7.w;
    let _e34 = finite_isnan(_e33);
    return vec4<bool>(_e22, _e26, _e30, _e34);
}

fn finite_isinf(x_8: f32) -> bool {
    var x_9: f32;

    x_9 = x_8;
    let _e19 = x_9;
    return ((bitcast<u32>(_e19) & 2147483647u) == 2139095040u);
}

fn finite_isinf_1(x_10: vec2<f32>) -> vec2<bool> {
    var x_11: vec2<f32>;

    x_11 = x_10;
    let _e21 = x_11.x;
    let _e22 = finite_isinf(_e21);
    let _e25 = x_11.y;
    let _e26 = finite_isinf(_e25);
    return vec2<bool>(_e22, _e26);
}

fn finite_isinf_2(x_12: vec3<f32>) -> vec3<bool> {
    var x_13: vec3<f32>;

    x_13 = x_12;
    let _e21 = x_13.x;
    let _e22 = finite_isinf(_e21);
    let _e25 = x_13.y;
    let _e26 = finite_isinf(_e25);
    let _e29 = x_13.z;
    let _e30 = finite_isinf(_e29);
    return vec3<bool>(_e22, _e26, _e30);
}

fn finite_isinf_3(x_14: vec4<f32>) -> vec4<bool> {
    var x_15: vec4<f32>;

    x_15 = x_14;
    let _e21 = x_15.x;
    let _e22 = finite_isinf(_e21);
    let _e25 = x_15.y;
    let _e26 = finite_isinf(_e25);
    let _e29 = x_15.z;
    let _e30 = finite_isinf(_e29);
    let _e33 = x_15.w;
    let _e34 = finite_isinf(_e33);
    return vec4<bool>(_e22, _e26, _e30, _e34);
}

fn viewZFromDepth(d: f32) -> f32 {
    var d_1: f32;
    var c: f32;
    var dd: f32;

    d_1 = d;
    let _e19 = global.uDepthMode;
    if (_e19 < 0.5f) {
        {
            let _e22 = global.uNear;
            let _e23 = global.uFar;
            let _e24 = global.uNear;
            c = (_e22 / (_e23 - _e24));
            let _e28 = global.uFar;
            let _e29 = global.uNear;
            let _e31 = global.uFar;
            let _e32 = global.uNear;
            dd = ((_e28 * _e29) / (_e31 - _e32));
            let _e36 = dd;
            let _e37 = d_1;
            let _e38 = c;
            return (_e36 / max((_e37 + _e38), 0.000000000000000000000000000001f));
        }
    }
    let _e43 = d_1;
    let _e44 = global.uLogDepthFC;
    return (exp2((_e43 * _e44)) - 1f);
}

fn isSkyDepth(d_2: f32) -> bool {
    var d_3: f32;
    var local: bool;

    d_3 = d_2;
    let _e19 = global.uDepthMode;
    if (_e19 < 0.5f) {
        let _e22 = d_3;
        local = (_e22 <= 0f);
    } else {
        let _e25 = d_3;
        local = (_e25 >= 1f);
    }
    let _e29 = local;
    return _e29;
}

fn depthPixel(uv: vec2<f32>) -> vec2<i32> {
    var uv_1: vec2<f32>;

    uv_1 = uv;
    let _e19 = uv_1;
    let _e21 = textureDimensions(tDepthTexture, 0i);
    return vec2<i32>(((_e19 * vec2<f32>(vec2<i32>(_e21))) + vec2(0.25f)));
}

fn main_1() {
    var c_1: vec3<f32> = vec3(0f);
    var l: f32;
    var x_16: f32;
    var d_4: f32;
    var sky: bool;
    var w: f32;
    var dz: f32;
    var local_1: f32;
    var local_2: f32;
    var near: f32;
    var local_3: f32;
    var local_4: f32;
    var ws: f32;
    var x2_: f32;

    let _e21 = c_1;
    let _e22 = vUv_1;
    let _e36 = textureSampleLevel(tColorTexture, tColorSampler, (_e22 + vec2<f32>(-0.001953125f, -0.001953125f)), 0f);
    c_1 = (_e21 + _e36.xyz);
    let _e39 = c_1;
    let _e40 = vUv_1;
    let _e53 = textureSampleLevel(tColorTexture, tColorSampler, (_e40 + vec2<f32>(0.001953125f, -0.001953125f)), 0f);
    c_1 = (_e39 + _e53.xyz);
    let _e56 = c_1;
    let _e57 = vUv_1;
    let _e70 = textureSampleLevel(tColorTexture, tColorSampler, (_e57 + vec2<f32>(-0.001953125f, 0.001953125f)), 0f);
    c_1 = (_e56 + _e70.xyz);
    let _e73 = c_1;
    let _e74 = vUv_1;
    let _e86 = textureSampleLevel(tColorTexture, tColorSampler, (_e74 + vec2<f32>(0.001953125f, 0.001953125f)), 0f);
    c_1 = (_e73 + _e86.xyz);
    let _e89 = c_1;
    l = dot((_e89 * 0.25f), vec3<f32>(0.2126f, 0.7152f, 0.0722f));
    let _e98 = l;
    let _e99 = finite_isnan(_e98);
    let _e100 = l;
    let _e101 = finite_isinf(_e100);
    if (_e99 || _e101) {
        l = 0f;
    }
    let _e104 = l;
    let _e105 = global.uRef;
    x_16 = clamp((_e104 / max(_e105, 0.000000001f)), 0.015625f, 64f);
    let _e115 = vUv_1;
    let _e117 = textureSampleLevel(tDepthTexture, tDepthSampler, _e115, 0f);
    d_4 = _e117.x;
    let _e120 = d_4;
    let _e121 = isSkyDepth(_e120);
    sky = _e121;
    let _e125 = vUv_1;
    w = (1f - (0.6f * length((_e125 - vec2(0.5f)))));
    let _e133 = d_4;
    let _e134 = viewZFromDepth(_e133);
    dz = _e134;
    let _e136 = global.uNearCut;
    if (_e136 > 0f) {
        let _e139 = dz;
        let _e140 = global.uNearCut;
        if (_e139 < _e140) {
            local_1 = 0.01f;
        } else {
            local_1 = 1f;
        }
        let _e145 = local_1;
        local_2 = _e145;
    } else {
        let _e150 = dz;
        local_2 = mix(0.25f, 1f, smoothstep(3f, 12f, _e150));
    }
    let _e154 = local_2;
    near = _e154;
    let _e156 = w;
    let _e157 = sky;
    if _e157 {
        let _e162 = x_16;
        local_3 = mix(0.35f, 0.04f, smoothstep(0.25f, 1f, _e162));
    } else {
        let _e165 = near;
        local_3 = _e165;
    }
    let _e167 = local_3;
    w = (_e156 * _e167);
    let _e169 = sky;
    if _e169 {
        let _e170 = w;
        let _e175 = x_16;
        local_4 = ((_e170 * 0.6f) * smoothstep(12f, 40f, _e175));
    } else {
        let _e178 = w;
        local_4 = _e178;
    }
    let _e180 = local_4;
    ws = _e180;
    let _e182 = x_16;
    let _e183 = x_16;
    x2_ = (_e182 * _e183);
    let _e186 = x_16;
    let _e188 = w;
    let _e190 = w;
    let _e191 = x2_;
    let _e192 = x2_;
    let _e194 = ws;
    let _e196 = ws;
    fragmentColor = vec4<f32>((log2(_e186) * _e188), _e190, ((_e191 * _e192) * _e194), _e196);
    return;
}

@fragment 
fn main(@location(0) vUv: vec2<f32>) -> FragmentOutput {
    vUv_1 = vUv;
    main_1();
    let _e27 = fragmentColor;
    return FragmentOutput(_e27);
}
`;
