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
      "name": "uCamRot",
      "type": "mat3",
      "count": 0,
      "align": 16,
      "size": 48,
      "stride": 48,
      "offset": 16
    },
    {
      "name": "uTanHalf",
      "type": "vec2",
      "count": 0,
      "align": 8,
      "size": 8,
      "stride": 8,
      "offset": 64
    },
    {
      "name": "uSkyGain",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 72
    },
    {
      "name": "uLensUp",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 80
    },
    {
      "name": "uLensK",
      "type": "vec2",
      "count": 0,
      "align": 8,
      "size": 8,
      "stride": 8,
      "offset": 96
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
      "name": "tSky",
      "type": "samplerCube",
      "count": 0,
      "binding": 5,
      "samplerBinding": 6
    }
  ],
  "bytes": 112,
  "group": 0,
  "attributes": []
};
export const code = /* wgsl */`
struct Params {
    uDepthMode: f32,
    uNear: f32,
    uFar: f32,
    uLogDepthFC: f32,
    uCamRot: mat3x3<f32>,
    uTanHalf: vec2<f32>,
    uSkyGain: f32,
    uLensUp: vec4<f32>,
    uLensK: vec2<f32>,
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
var tSkyTexture: texture_cube<f32>;
@group(0) @binding(6) 
var tSkySampler: sampler;
var<private> fragmentColor: vec4<f32>;
var<private> vUv_1: vec2<f32>;

fn viewZFromDepth(d: f32) -> f32 {
    var d_1: f32;
    var c: f32;
    var dd: f32;

    d_1 = d;
    let _e27 = global.uDepthMode;
    if (_e27 < 0.5f) {
        {
            let _e30 = global.uNear;
            let _e31 = global.uFar;
            let _e32 = global.uNear;
            c = (_e30 / (_e31 - _e32));
            let _e36 = global.uFar;
            let _e37 = global.uNear;
            let _e39 = global.uFar;
            let _e40 = global.uNear;
            dd = ((_e36 * _e37) / (_e39 - _e40));
            let _e44 = dd;
            let _e45 = d_1;
            let _e46 = c;
            return (_e44 / max((_e45 + _e46), 0.000000000000000000000000000001f));
        }
    }
    let _e51 = d_1;
    let _e52 = global.uLogDepthFC;
    return (exp2((_e51 * _e52)) - 1f);
}

fn isSkyDepth(d_2: f32) -> bool {
    var d_3: f32;
    var local: bool;

    d_3 = d_2;
    let _e27 = global.uDepthMode;
    if (_e27 < 0.5f) {
        let _e30 = d_3;
        local = (_e30 <= 0f);
    } else {
        let _e33 = d_3;
        local = (_e33 >= 1f);
    }
    let _e37 = local;
    return _e37;
}

fn depthPixel(uv: vec2<f32>) -> vec2<i32> {
    var uv_1: vec2<f32>;

    uv_1 = uv;
    let _e27 = uv_1;
    let _e29 = textureDimensions(tDepthTexture, 0i);
    return vec2<i32>(((_e27 * vec2<f32>(vec2<i32>(_e29))) + vec2(0.25f)));
}

fn lensDir(d_4: vec3<f32>, toDrawn: bool) -> vec3<f32> {
    var d_5: vec3<f32>;
    var toDrawn_1: bool;
    var up: vec3<f32>;
    var c_1: f32;
    var z: f32;
    var hD: f32;
    var hT: f32;
    var local_1: f32;
    var local_2: f32;
    var local_3: f32;
    var z2_: f32;
    var h: vec3<f32>;
    var hl: f32;

    d_5 = d_4;
    toDrawn_1 = toDrawn;
    let _e30 = global.uLensUp;
    let _e34 = global.uLensK;
    let _e36 = global.uLensK;
    if ((_e30.w < 0.5f) || (_e34.x <= _e36.y)) {
        let _e40 = d_5;
        return _e40;
    }
    let _e41 = global.uLensUp;
    up = _e41.xyz;
    let _e44 = d_5;
    let _e45 = up;
    c_1 = clamp(dot(_e44, _e45), -1f, 1f);
    let _e52 = c_1;
    z = acos(_e52);
    let _e56 = global.uLensK;
    hD = (1.5707963f + _e56.x);
    let _e61 = global.uLensK;
    hT = (1.5707963f + _e61.y);
    let _e65 = toDrawn_1;
    if _e65 {
        let _e66 = z;
        let _e67 = hT;
        if (_e66 <= _e67) {
            let _e69 = z;
            let _e70 = hD;
            let _e72 = hT;
            local_1 = ((_e69 * _e70) / _e72);
        } else {
            let _e74 = hD;
            let _e75 = z;
            let _e76 = hT;
            let _e79 = hD;
            let _e83 = hT;
            local_1 = (_e74 + (((_e75 - _e76) * (3.1415927f - _e79)) / (3.1415927f - _e83)));
        }
        let _e88 = local_1;
        local_3 = _e88;
    } else {
        let _e89 = z;
        let _e90 = hD;
        if (_e89 <= _e90) {
            let _e92 = z;
            let _e93 = hT;
            let _e95 = hD;
            local_2 = ((_e92 * _e93) / _e95);
        } else {
            let _e97 = hT;
            let _e98 = z;
            let _e99 = hD;
            let _e102 = hT;
            let _e106 = hD;
            local_2 = (_e97 + (((_e98 - _e99) * (3.1415927f - _e102)) / (3.1415927f - _e106)));
        }
        let _e111 = local_2;
        local_3 = _e111;
    }
    let _e113 = local_3;
    z2_ = _e113;
    let _e115 = d_5;
    let _e116 = up;
    let _e117 = c_1;
    h = (_e115 - (_e116 * _e117));
    let _e121 = h;
    hl = length(_e121);
    let _e124 = hl;
    if (_e124 < 0.000001f) {
        let _e127 = d_5;
        return _e127;
    }
    let _e128 = up;
    let _e129 = z2_;
    let _e132 = h;
    let _e133 = hl;
    let _e136 = z2_;
    return ((_e128 * cos(_e129)) + ((_e132 / vec3(_e133)) * sin(_e136)));
}

fn main_1() {
    var c_2: vec4<f32>;
    var d_6: f32;
    var ndc: vec2<f32>;
    var dv: vec3<f32>;
    var D: vec3<f32>;

    let _e26 = vUv_1;
    let _e28 = textureSampleLevel(tColorTexture, tColorSampler, _e26, 0f);
    c_2 = _e28;
    let _e30 = vUv_1;
    let _e32 = textureSampleLevel(tDepthTexture, tDepthSampler, _e30, 0f);
    d_6 = _e32.x;
    let _e35 = d_6;
    let _e36 = isSkyDepth(_e35);
    if _e36 {
        {
            let _e37 = vUv_1;
            ndc = ((_e37 * 2f) - vec2(1f));
            let _e45 = ndc;
            ndc.y = -(_e45.y);
            let _e48 = ndc;
            let _e50 = global.uTanHalf;
            let _e53 = ndc;
            let _e55 = global.uTanHalf;
            dv = normalize(vec3<f32>((_e48.x * _e50.x), (_e53.y * _e55.y), -1f));
            let _e63 = global.uCamRot;
            let _e64 = dv;
            D = (_e63 * _e64);
            let _e67 = c_2;
            let _e69 = c_2;
            let _e71 = D;
            let _e73 = lensDir(_e71, false);
            let _e75 = textureSampleLevel(tSkyTexture, tSkySampler, _e73, 0f);
            let _e77 = global.uSkyGain;
            let _e79 = (_e69.xyz + (_e75.xyz * _e77));
            c_2.x = _e79.x;
            c_2.y = _e79.y;
            c_2.z = _e79.z;
        }
    }
    let _e86 = c_2;
    let _e87 = _e86.xyz;
    fragmentColor = vec4<f32>(_e87.x, _e87.y, _e87.z, 1f);
    return;
}

@fragment 
fn main(@location(0) vUv: vec2<f32>) -> FragmentOutput {
    vUv_1 = vUv;
    main_1();
    let _e37 = fragmentColor;
    return FragmentOutput(_e37);
}
`;
