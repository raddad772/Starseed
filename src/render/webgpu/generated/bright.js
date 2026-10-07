// Generated offline from the existing renderer equations. See tools/shaders/.
export const layout = {
  "uniforms": [
    {
      "name": "uNightShift",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 0
    },
    {
      "name": "uKey",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 4
    },
    {
      "name": "uMinExp",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 8
    },
    {
      "name": "uMaxExp",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 12
    },
    {
      "name": "uTexel",
      "type": "vec2",
      "count": 0,
      "align": 8,
      "size": 8,
      "stride": 8,
      "offset": 16
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
      "name": "tAdapt",
      "type": "sampler2D",
      "count": 0,
      "binding": 3,
      "samplerBinding": 4
    }
  ],
  "bytes": 32,
  "group": 0,
  "attributes": []
};
export const code = /* wgsl */`
struct Params {
    uNightShift: f32,
    uKey: f32,
    uMinExp: f32,
    uMaxExp: f32,
    uTexel: vec2<f32>,
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
var tAdaptTexture: texture_2d<f32>;
@group(0) @binding(4) 
var tAdaptSampler: sampler;
var<private> fragmentColor: vec4<f32>;
var<private> vUv_1: vec2<f32>;

fn finite_isnan(x: f32) -> bool {
    var x_1: f32;

    x_1 = x;
    let _e17 = x_1;
    return ((bitcast<u32>(_e17) & 2147483647u) > 2139095040u);
}

fn finite_isnan_1(x_2: vec2<f32>) -> vec2<bool> {
    var x_3: vec2<f32>;

    x_3 = x_2;
    let _e19 = x_3.x;
    let _e20 = finite_isnan(_e19);
    let _e23 = x_3.y;
    let _e24 = finite_isnan(_e23);
    return vec2<bool>(_e20, _e24);
}

fn finite_isnan_2(x_4: vec3<f32>) -> vec3<bool> {
    var x_5: vec3<f32>;

    x_5 = x_4;
    let _e19 = x_5.x;
    let _e20 = finite_isnan(_e19);
    let _e23 = x_5.y;
    let _e24 = finite_isnan(_e23);
    let _e27 = x_5.z;
    let _e28 = finite_isnan(_e27);
    return vec3<bool>(_e20, _e24, _e28);
}

fn finite_isnan_3(x_6: vec4<f32>) -> vec4<bool> {
    var x_7: vec4<f32>;

    x_7 = x_6;
    let _e19 = x_7.x;
    let _e20 = finite_isnan(_e19);
    let _e23 = x_7.y;
    let _e24 = finite_isnan(_e23);
    let _e27 = x_7.z;
    let _e28 = finite_isnan(_e27);
    let _e31 = x_7.w;
    let _e32 = finite_isnan(_e31);
    return vec4<bool>(_e20, _e24, _e28, _e32);
}

fn finite_isinf(x_8: f32) -> bool {
    var x_9: f32;

    x_9 = x_8;
    let _e17 = x_9;
    return ((bitcast<u32>(_e17) & 2147483647u) == 2139095040u);
}

fn finite_isinf_1(x_10: vec2<f32>) -> vec2<bool> {
    var x_11: vec2<f32>;

    x_11 = x_10;
    let _e19 = x_11.x;
    let _e20 = finite_isinf(_e19);
    let _e23 = x_11.y;
    let _e24 = finite_isinf(_e23);
    return vec2<bool>(_e20, _e24);
}

fn finite_isinf_2(x_12: vec3<f32>) -> vec3<bool> {
    var x_13: vec3<f32>;

    x_13 = x_12;
    let _e19 = x_13.x;
    let _e20 = finite_isinf(_e19);
    let _e23 = x_13.y;
    let _e24 = finite_isinf(_e23);
    let _e27 = x_13.z;
    let _e28 = finite_isinf(_e27);
    return vec3<bool>(_e20, _e24, _e28);
}

fn finite_isinf_3(x_14: vec4<f32>) -> vec4<bool> {
    var x_15: vec4<f32>;

    x_15 = x_14;
    let _e19 = x_15.x;
    let _e20 = finite_isinf(_e19);
    let _e23 = x_15.y;
    let _e24 = finite_isinf(_e23);
    let _e27 = x_15.z;
    let _e28 = finite_isinf(_e27);
    let _e31 = x_15.w;
    let _e32 = finite_isinf(_e31);
    return vec4<bool>(_e20, _e24, _e28, _e32);
}

fn main_1() {
    var aT: f32;
    var exposure: f32;
    var c: vec3<f32> = vec3(0f);
    var wsum: f32 = 0f;
    var i: i32 = 0i;
    var local: f32;
    var local_1: f32;
    var o: vec2<f32>;
    var t: vec3<f32>;
    var w: f32;
    var l: f32;
    var soft: f32;
    var contrib: f32;

    let _e19 = textureSampleLevel(tAdaptTexture, tAdaptSampler, vec2(0.5f), 0f);
    aT = _e19.x;
    let _e22 = global.uKey;
    let _e23 = aT;
    let _e31 = aT;
    let _e32 = global.uNightShift;
    let _e39 = global.uMinExp;
    let _e40 = global.uMaxExp;
    exposure = clamp(((_e22 / exp2(_e23)) * exp2((-0.1f * max(0f, (-8f - (_e31 - _e32)))))), _e39, _e40);
    loop {
        let _e50 = i;
        if !((_e50 < 4i)) {
            break;
        }
        {
            let _e57 = i;
            let _e60 = i;
            if ((_e57 == 0i) || (_e60 == 2i)) {
                local = -1f;
            } else {
                local = 1f;
            }
            let _e68 = local;
            let _e69 = i;
            if (_e69 < 2i) {
                local_1 = -1f;
            } else {
                local_1 = 1f;
            }
            let _e76 = local_1;
            o = vec2<f32>(_e68, _e76);
            let _e79 = vUv_1;
            let _e80 = global.uTexel;
            let _e81 = o;
            let _e85 = textureSampleLevel(tColorTexture, tColorSampler, (_e79 + (_e80 * _e81)), 0f);
            t = _e85.xyz;
            let _e88 = t;
            let _e89 = finite_isnan_2(_e88);
            let _e91 = t;
            let _e92 = finite_isinf_2(_e91);
            if (any(_e89) || any(_e92)) {
                t = vec3(0f);
            }
            let _e97 = t;
            let _e98 = exposure;
            t = min((_e97 * _e98), vec3(10000f));
            let _e105 = t;
            let _e107 = t;
            let _e110 = t;
            w = (1f / (1f + max(max(_e105.x, _e107.y), _e110.z)));
            let _e116 = c;
            let _e117 = t;
            let _e118 = w;
            c = (_e116 + (_e117 * _e118));
            let _e121 = wsum;
            let _e122 = w;
            wsum = (_e121 + _e122);
        }
        continuing {
            let _e54 = i;
            i = (_e54 + 1i);
        }
    }
    let _e124 = c;
    let _e125 = wsum;
    c = (_e124 / vec3(max(_e125, 0.000001f)));
    let _e130 = c;
    let _e132 = c;
    let _e135 = c;
    l = max(max(_e130.x, _e132.y), _e135.z);
    let _e139 = l;
    soft = clamp((_e139 - 0.8f), 0f, 2f);
    let _e146 = soft;
    let _e147 = soft;
    soft = ((_e146 * _e147) / 8f);
    let _e151 = soft;
    let _e152 = l;
    let _e156 = l;
    contrib = (max(_e151, (_e152 - 1.6f)) / max(_e156, 0.00001f));
    let _e161 = c;
    let _e162 = contrib;
    let _e166 = min((_e161 * _e162), vec3(4000f));
    fragmentColor = vec4<f32>(_e166.x, _e166.y, _e166.z, 1f);
    return;
}

@fragment 
fn main(@location(0) vUv: vec2<f32>) -> FragmentOutput {
    vUv_1 = vUv;
    main_1();
    let _e25 = fragmentColor;
    return FragmentOutput(_e25);
}
`;
