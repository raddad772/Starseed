// Generated offline from the existing renderer equations. See tools/shaders/.
export const layout = {
  "uniforms": [
    {
      "name": "uDt",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 0
    },
    {
      "name": "uLevel",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 4
    },
    {
      "name": "uReset",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 8
    },
    {
      "name": "uRef",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 12
    },
    {
      "name": "uUp",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 16
    },
    {
      "name": "uDown",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 20
    },
    {
      "name": "uStrength",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 24
    }
  ],
  "textures": [
    {
      "name": "tLum",
      "type": "sampler2D",
      "count": 0,
      "binding": 1,
      "samplerBinding": 2
    },
    {
      "name": "tPrev",
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
    uDt: f32,
    uLevel: f32,
    uReset: f32,
    uRef: f32,
    uUp: f32,
    uDown: f32,
    uStrength: f32,
}

struct FragmentOutput {
    @location(0) fragmentColor: vec4<f32>,
}

@group(0) @binding(0) 
var<uniform> global: Params;
@group(0) @binding(1) 
var tLumTexture: texture_2d<f32>;
@group(0) @binding(2) 
var tLumSampler: sampler;
@group(0) @binding(3) 
var tPrevTexture: texture_2d<f32>;
@group(0) @binding(4) 
var tPrevSampler: sampler;
var<private> fragmentColor: vec4<f32>;
var<private> vUv_1: vec2<f32>;

fn finite_isnan(x: f32) -> bool {
    var x_1: f32;

    x_1 = x;
    let _e21 = x_1;
    return ((bitcast<u32>(_e21) & 2147483647u) > 2139095040u);
}

fn finite_isnan_1(x_2: vec2<f32>) -> vec2<bool> {
    var x_3: vec2<f32>;

    x_3 = x_2;
    let _e23 = x_3.x;
    let _e24 = finite_isnan(_e23);
    let _e27 = x_3.y;
    let _e28 = finite_isnan(_e27);
    return vec2<bool>(_e24, _e28);
}

fn finite_isnan_2(x_4: vec3<f32>) -> vec3<bool> {
    var x_5: vec3<f32>;

    x_5 = x_4;
    let _e23 = x_5.x;
    let _e24 = finite_isnan(_e23);
    let _e27 = x_5.y;
    let _e28 = finite_isnan(_e27);
    let _e31 = x_5.z;
    let _e32 = finite_isnan(_e31);
    return vec3<bool>(_e24, _e28, _e32);
}

fn finite_isnan_3(x_6: vec4<f32>) -> vec4<bool> {
    var x_7: vec4<f32>;

    x_7 = x_6;
    let _e23 = x_7.x;
    let _e24 = finite_isnan(_e23);
    let _e27 = x_7.y;
    let _e28 = finite_isnan(_e27);
    let _e31 = x_7.z;
    let _e32 = finite_isnan(_e31);
    let _e35 = x_7.w;
    let _e36 = finite_isnan(_e35);
    return vec4<bool>(_e24, _e28, _e32, _e36);
}

fn finite_isinf(x_8: f32) -> bool {
    var x_9: f32;

    x_9 = x_8;
    let _e21 = x_9;
    return ((bitcast<u32>(_e21) & 2147483647u) == 2139095040u);
}

fn finite_isinf_1(x_10: vec2<f32>) -> vec2<bool> {
    var x_11: vec2<f32>;

    x_11 = x_10;
    let _e23 = x_11.x;
    let _e24 = finite_isinf(_e23);
    let _e27 = x_11.y;
    let _e28 = finite_isinf(_e27);
    return vec2<bool>(_e24, _e28);
}

fn finite_isinf_2(x_12: vec3<f32>) -> vec3<bool> {
    var x_13: vec3<f32>;

    x_13 = x_12;
    let _e23 = x_13.x;
    let _e24 = finite_isinf(_e23);
    let _e27 = x_13.y;
    let _e28 = finite_isinf(_e27);
    let _e31 = x_13.z;
    let _e32 = finite_isinf(_e31);
    return vec3<bool>(_e24, _e28, _e32);
}

fn finite_isinf_3(x_14: vec4<f32>) -> vec4<bool> {
    var x_15: vec4<f32>;

    x_15 = x_14;
    let _e23 = x_15.x;
    let _e24 = finite_isinf(_e23);
    let _e27 = x_15.y;
    let _e28 = finite_isinf(_e27);
    let _e31 = x_15.z;
    let _e32 = finite_isinf(_e31);
    let _e35 = x_15.w;
    let _e36 = finite_isinf(_e35);
    return vec4<bool>(_e24, _e28, _e32, _e36);
}

fn main_1() {
    var m: vec4<f32>;
    var logAvg: f32;
    var local: f32;
    var hi: f32;
    var stops: f32;
    var avg: f32;
    var prev: f32;
    var local_1: f32;
    var local_2: f32;
    var speed: f32;
    var local_3: f32;
    var k: f32;

    let _e22 = global.uLevel;
    let _e23 = textureSampleLevel(tLumTexture, tLumSampler, vec2(0.5f), _e22);
    m = _e23;
    let _e25 = m;
    let _e27 = m;
    logAvg = (_e25.x / max(_e27.y, 0.000001f));
    let _e33 = m;
    if (_e33.w > 0.001f) {
        let _e37 = m;
        let _e39 = m;
        local = log2(max((sqrt(sqrt((_e37.z / _e39.w))) * 0.25f), 0.000001f));
    } else {
        local = -99f;
    }
    let _e52 = local;
    hi = _e52;
    let _e54 = logAvg;
    let _e55 = global.uStrength;
    let _e57 = hi;
    let _e59 = global.uUp;
    let _e61 = global.uDown;
    stops = clamp(max((_e54 * _e55), _e57), -(_e59), _e61);
    let _e64 = global.uRef;
    let _e68 = stops;
    avg = (log2(max(_e64, 0.000000001f)) + _e68);
    let _e74 = textureSampleLevel(tPrevTexture, tPrevSampler, vec2(0.5f), 0f);
    prev = _e74.x;
    let _e77 = avg;
    let _e78 = finite_isnan(_e77);
    let _e79 = avg;
    let _e80 = finite_isinf(_e79);
    if (_e78 || _e80) {
        let _e82 = prev;
        let _e83 = finite_isnan(_e82);
        let _e84 = prev;
        let _e85 = finite_isinf(_e84);
        if (_e83 || _e85) {
            let _e87 = global.uRef;
            local_1 = log2(max(_e87, 0.000000001f));
        } else {
            let _e91 = prev;
            local_1 = _e91;
        }
        let _e93 = local_1;
        avg = _e93;
    }
    let _e94 = prev;
    let _e95 = finite_isnan(_e94);
    let _e96 = prev;
    let _e97 = finite_isinf(_e96);
    if (_e95 || _e97) {
        let _e99 = avg;
        prev = _e99;
    }
    let _e100 = avg;
    let _e101 = prev;
    if (_e100 > _e101) {
        local_2 = 1.1f;
    } else {
        local_2 = 0.6f;
    }
    let _e106 = local_2;
    speed = _e106;
    let _e108 = global.uReset;
    if (_e108 > 0.5f) {
        local_3 = 1f;
    } else {
        let _e113 = global.uDt;
        let _e115 = speed;
        local_3 = (1f - exp((-(_e113) * _e115)));
    }
    let _e120 = local_3;
    k = _e120;
    let _e122 = prev;
    let _e123 = avg;
    let _e124 = k;
    fragmentColor = vec4<f32>(mix(_e122, _e123, _e124), 0f, 0f, 1f);
    return;
}

@fragment 
fn main(@location(0) vUv: vec2<f32>) -> FragmentOutput {
    vUv_1 = vUv;
    main_1();
    let _e29 = fragmentColor;
    return FragmentOutput(_e29);
}
`;
