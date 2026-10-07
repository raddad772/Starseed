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
      "name": "uLowSize",
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
      "name": "tDepth",
      "type": "sampler2D",
      "count": 0,
      "binding": 3,
      "samplerBinding": 4
    },
    {
      "name": "tL",
      "type": "sampler2D",
      "count": 0,
      "binding": 5,
      "samplerBinding": 6
    },
    {
      "name": "tT",
      "type": "sampler2D",
      "count": 0,
      "binding": 7,
      "samplerBinding": 8
    }
  ],
  "bytes": 32,
  "group": 0,
  "attributes": []
};
export const code = /* wgsl */`
struct Params {
    uDepthMode: f32,
    uNear: f32,
    uFar: f32,
    uLogDepthFC: f32,
    uLowSize: vec2<f32>,
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
@group(0) @binding(5) 
var tLTexture: texture_2d<f32>;
@group(0) @binding(6) 
var tLSampler: sampler;
@group(0) @binding(7) 
var tTTexture: texture_2d<f32>;
@group(0) @binding(8) 
var tTSampler: sampler;
var<private> fragmentColor: vec4<f32>;
var<private> vUv_1: vec2<f32>;

fn viewZFromDepth(d: f32) -> f32 {
    var d_1: f32;
    var c: f32;
    var dd: f32;

    d_1 = d;
    let _e21 = global.uDepthMode;
    if (_e21 < 0.5f) {
        {
            let _e24 = global.uNear;
            let _e25 = global.uFar;
            let _e26 = global.uNear;
            c = (_e24 / (_e25 - _e26));
            let _e30 = global.uFar;
            let _e31 = global.uNear;
            let _e33 = global.uFar;
            let _e34 = global.uNear;
            dd = ((_e30 * _e31) / (_e33 - _e34));
            let _e38 = dd;
            let _e39 = d_1;
            let _e40 = c;
            return (_e38 / max((_e39 + _e40), 0.000000000000000000000000000001f));
        }
    }
    let _e45 = d_1;
    let _e46 = global.uLogDepthFC;
    return (exp2((_e45 * _e46)) - 1f);
}

fn isSkyDepth(d_2: f32) -> bool {
    var d_3: f32;
    var local: bool;

    d_3 = d_2;
    let _e21 = global.uDepthMode;
    if (_e21 < 0.5f) {
        let _e24 = d_3;
        local = (_e24 <= 0f);
    } else {
        let _e27 = d_3;
        local = (_e27 >= 1f);
    }
    let _e31 = local;
    return _e31;
}

fn depthPixel(uv: vec2<f32>) -> vec2<i32> {
    var uv_1: vec2<f32>;

    uv_1 = uv;
    let _e21 = uv_1;
    let _e23 = textureDimensions(tDepthTexture, 0i);
    return vec2<i32>(((_e21 * vec2<f32>(vec2<i32>(_e23))) + vec2(0.25f)));
}

fn linZ(uv_2: vec2<f32>) -> f32 {
    var uv_3: vec2<f32>;
    var d_4: f32;
    var local_1: f32;

    uv_3 = uv_2;
    let _e22 = uv_3;
    let _e23 = depthPixel(_e22);
    let _e25 = textureLoad(tDepthTexture, _e23, 0i);
    d_4 = _e25.x;
    let _e28 = d_4;
    let _e29 = isSkyDepth(_e28);
    if _e29 {
        local_1 = 1000000000000f;
    } else {
        let _e31 = d_4;
        let _e32 = viewZFromDepth(_e31);
        local_1 = _e32;
    }
    let _e34 = local_1;
    return _e34;
}

fn zGap(a: f32, b: f32) -> f32 {
    var a_1: f32;
    var b_1: f32;

    a_1 = a;
    b_1 = b;
    let _e24 = a_1;
    let _e25 = b_1;
    let _e28 = a_1;
    let _e29 = b_1;
    return (abs((_e24 - _e25)) / max(max(_e28, _e29), 0.001f));
}

fn main_1() {
    var scene: vec4<f32>;
    var z0_: f32;
    var p: vec2<f32>;
    var i: vec2<f32>;
    var f: vec2<f32>;
    var L: vec3<f32> = vec3(0f);
    var T: vec3<f32> = vec3(0f);
    var wsum: f32 = 0f;
    var gap: f32 = 1000000000000000000000000000000f;
    var k: i32 = 0i;
    var c_1: vec2<f32>;
    var uv_4: vec2<f32>;
    var zc: f32;
    var local_2: f32;
    var local_3: f32;
    var wb: f32;
    var wd: f32;
    var w: f32;
    var k_1: i32 = 0i;
    var uv_5: vec2<f32>;
    var g: f32;

    let _e20 = vUv_1;
    let _e22 = textureSampleLevel(tColorTexture, tColorSampler, _e20, 0f);
    scene = _e22;
    let _e24 = vUv_1;
    let _e25 = linZ(_e24);
    z0_ = _e25;
    let _e27 = vUv_1;
    let _e28 = global.uLowSize;
    p = ((_e27 * _e28) - vec2(0.5f));
    let _e34 = p;
    i = floor(_e34);
    let _e37 = p;
    let _e38 = i;
    f = (_e37 - _e38);
    loop {
        let _e53 = k;
        if !((_e53 < 4i)) {
            break;
        }
        {
            let _e60 = k;
            let _e64 = k;
            c_1 = vec2<f32>(f32((_e60 & 1i)), f32((_e64 >> 1u)));
            let _e71 = i;
            let _e72 = c_1;
            let _e77 = global.uLowSize;
            uv_4 = (((_e71 + _e72) + vec2(0.5f)) / _e77);
            let _e80 = uv_4;
            let _e81 = linZ(_e80);
            zc = _e81;
            let _e83 = c_1;
            if (_e83.x > 0.5f) {
                let _e87 = f;
                local_2 = _e87.x;
            } else {
                let _e90 = f;
                local_2 = (1f - _e90.x);
            }
            let _e94 = local_2;
            let _e95 = c_1;
            if (_e95.y > 0.5f) {
                let _e99 = f;
                local_3 = _e99.y;
            } else {
                let _e102 = f;
                local_3 = (1f - _e102.y);
            }
            let _e106 = local_3;
            wb = (_e94 * _e106);
            let _e111 = z0_;
            let _e112 = zc;
            let _e115 = z0_;
            wd = (1f / (0.02f + (abs((_e111 - _e112)) / max(_e115, 0.001f))));
            let _e122 = wb;
            let _e123 = wd;
            w = ((_e122 * _e123) + 0.000001f);
            let _e128 = L;
            let _e129 = uv_4;
            let _e131 = textureSampleLevel(tLTexture, tLSampler, _e129, 0f);
            let _e133 = w;
            L = (_e128 + (_e131.xyz * _e133));
            let _e136 = T;
            let _e137 = uv_4;
            let _e139 = textureSampleLevel(tTTexture, tTSampler, _e137, 0f);
            let _e141 = w;
            T = (_e136 + (_e139.xyz * _e141));
            let _e144 = wsum;
            let _e145 = w;
            wsum = (_e144 + _e145);
            let _e147 = gap;
            let _e148 = z0_;
            let _e149 = zc;
            let _e150 = zGap(_e148, _e149);
            gap = min(_e147, _e150);
        }
        continuing {
            let _e57 = k;
            k = (_e57 + 1i);
        }
    }
    let _e152 = L;
    let _e153 = wsum;
    L = (_e152 / vec3(_e153));
    let _e156 = T;
    let _e157 = wsum;
    T = (_e156 / vec3(_e157));
    let _e160 = gap;
    if (_e160 > 0.1f) {
        {
            loop {
                let _e165 = k_1;
                if !((_e165 < 16i)) {
                    break;
                }
                {
                    let _e172 = i;
                    let _e173 = k_1;
                    let _e179 = k_1;
                    let _e191 = global.uLowSize;
                    uv_5 = (((_e172 + vec2<f32>((f32((_e173 & 3i)) - 1f), (f32((_e179 >> 2u)) - 1f))) + vec2(0.5f)) / _e191);
                    let _e194 = z0_;
                    let _e195 = uv_5;
                    let _e196 = linZ(_e195);
                    let _e197 = zGap(_e194, _e196);
                    g = _e197;
                    let _e199 = g;
                    let _e200 = gap;
                    if (_e199 < _e200) {
                        {
                            let _e202 = g;
                            gap = _e202;
                            let _e203 = uv_5;
                            let _e205 = textureSampleLevel(tLTexture, tLSampler, _e203, 0f);
                            L = _e205.xyz;
                            let _e207 = uv_5;
                            let _e209 = textureSampleLevel(tTTexture, tTSampler, _e207, 0f);
                            T = _e209.xyz;
                        }
                    }
                }
                continuing {
                    let _e169 = k_1;
                    k_1 = (_e169 + 1i);
                }
            }
        }
    }
    let _e211 = scene;
    let _e213 = T;
    let _e215 = L;
    let _e216 = ((_e211.xyz * _e213) + _e215);
    let _e217 = scene;
    fragmentColor = vec4<f32>(_e216.x, _e216.y, _e216.z, _e217.w);
    return;
}

@fragment 
fn main(@location(0) vUv: vec2<f32>) -> FragmentOutput {
    vUv_1 = vUv;
    main_1();
    let _e33 = fragmentColor;
    return FragmentOutput(_e33);
}
`;
