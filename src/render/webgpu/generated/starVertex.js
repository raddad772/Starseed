// Generated offline from the existing renderer equations. See tools/shaders/.
export const layout = {
  "uniforms": [
    {
      "name": "modelMatrix",
      "type": "mat4",
      "count": 0,
      "align": 16,
      "size": 64,
      "stride": 64,
      "offset": 0
    },
    {
      "name": "viewMatrix",
      "type": "mat4",
      "count": 0,
      "align": 16,
      "size": 64,
      "stride": 64,
      "offset": 64
    },
    {
      "name": "projectionMatrix",
      "type": "mat4",
      "count": 0,
      "align": 16,
      "size": 64,
      "stride": 64,
      "offset": 128
    },
    {
      "name": "uViewport",
      "type": "vec2",
      "count": 0,
      "align": 8,
      "size": 8,
      "stride": 8,
      "offset": 192
    },
    {
      "name": "uPixelRatio",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 200
    },
    {
      "name": "uTwinkle",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 204
    },
    {
      "name": "uTime",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 208
    },
    {
      "name": "uExtinction",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 212
    },
    {
      "name": "uKey",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 216
    },
    {
      "name": "uMinExp",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 220
    },
    {
      "name": "uMaxExp",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 224
    },
    {
      "name": "uStarExp",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 228
    },
    {
      "name": "uLensUp",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 240
    },
    {
      "name": "uLensK",
      "type": "vec2",
      "count": 0,
      "align": 8,
      "size": 8,
      "stride": 8,
      "offset": 256
    }
  ],
  "textures": [
    {
      "name": "tAdapt",
      "type": "sampler2D",
      "count": 0,
      "binding": 1,
      "samplerBinding": 2
    }
  ],
  "bytes": 272,
  "group": 0,
  "attributes": [
    {
      "name": "aStar",
      "type": "vec3",
      "location": 0
    },
    {
      "name": "corner",
      "type": "vec2",
      "location": 1
    },
    {
      "name": "aColor",
      "type": "vec3",
      "location": 2
    },
    {
      "name": "aSize",
      "type": "float",
      "location": 3
    }
  ]
};
export const code = /* wgsl */`
struct Params {
    modelMatrix: mat4x4<f32>,
    viewMatrix: mat4x4<f32>,
    projectionMatrix: mat4x4<f32>,
    uViewport: vec2<f32>,
    uPixelRatio: f32,
    uTwinkle: f32,
    uTime: f32,
    uExtinction: f32,
    uKey: f32,
    uMinExp: f32,
    uMaxExp: f32,
    uStarExp: f32,
    uLensUp: vec4<f32>,
    uLensK: vec2<f32>,
}

struct VertexOutput {
    @location(1) vQuad: vec2<f32>,
    @location(0) vColor: vec3<f32>,
    @builtin(position) gl_Position: vec4<f32>,
}

@group(0) @binding(0) 
var<uniform> global: Params;
@group(0) @binding(1) 
var tAdaptTexture: texture_2d<f32>;
@group(0) @binding(2) 
var tAdaptSampler: sampler;
var<private> aStar_1: vec3<f32>;
var<private> corner_1: vec2<f32>;
var<private> vQuad: vec2<f32>;
var<private> aColor_1: vec3<f32>;
var<private> aSize_1: f32;
var<private> vColor: vec3<f32>;
var<private> gl_Position: vec4<f32>;

fn lensDir(d: vec3<f32>, toDrawn: bool) -> vec3<f32> {
    var d_1: vec3<f32>;
    var toDrawn_1: bool;
    var up: vec3<f32>;
    var c: f32;
    var z: f32;
    var hD: f32;
    var hT: f32;
    var local: f32;
    var local_1: f32;
    var local_2: f32;
    var z2_: f32;
    var h: vec3<f32>;
    var hl: f32;

    d_1 = d;
    toDrawn_1 = toDrawn;
    let _e40 = global.uLensUp;
    let _e44 = global.uLensK;
    let _e46 = global.uLensK;
    if ((_e40.w < 0.5f) || (_e44.x <= _e46.y)) {
        let _e50 = d_1;
        return _e50;
    }
    let _e51 = global.uLensUp;
    up = _e51.xyz;
    let _e54 = d_1;
    let _e55 = up;
    c = clamp(dot(_e54, _e55), -1f, 1f);
    let _e62 = c;
    z = acos(_e62);
    let _e66 = global.uLensK;
    hD = (1.5707963f + _e66.x);
    let _e71 = global.uLensK;
    hT = (1.5707963f + _e71.y);
    let _e75 = toDrawn_1;
    if _e75 {
        let _e76 = z;
        let _e77 = hT;
        if (_e76 <= _e77) {
            let _e79 = z;
            let _e80 = hD;
            let _e82 = hT;
            local = ((_e79 * _e80) / _e82);
        } else {
            let _e84 = hD;
            let _e85 = z;
            let _e86 = hT;
            let _e89 = hD;
            let _e93 = hT;
            local = (_e84 + (((_e85 - _e86) * (3.1415927f - _e89)) / (3.1415927f - _e93)));
        }
        let _e98 = local;
        local_2 = _e98;
    } else {
        let _e99 = z;
        let _e100 = hD;
        if (_e99 <= _e100) {
            let _e102 = z;
            let _e103 = hT;
            let _e105 = hD;
            local_1 = ((_e102 * _e103) / _e105);
        } else {
            let _e107 = hT;
            let _e108 = z;
            let _e109 = hD;
            let _e112 = hT;
            let _e116 = hD;
            local_1 = (_e107 + (((_e108 - _e109) * (3.1415927f - _e112)) / (3.1415927f - _e116)));
        }
        let _e121 = local_1;
        local_2 = _e121;
    }
    let _e123 = local_2;
    z2_ = _e123;
    let _e125 = d_1;
    let _e126 = up;
    let _e127 = c;
    h = (_e125 - (_e126 * _e127));
    let _e131 = h;
    hl = length(_e131);
    let _e134 = hl;
    if (_e134 < 0.000001f) {
        let _e137 = d_1;
        return _e137;
    }
    let _e138 = up;
    let _e139 = z2_;
    let _e142 = h;
    let _e143 = hl;
    let _e146 = z2_;
    return ((_e138 * cos(_e139)) + ((_e142 / vec3(_e143)) * sin(_e146)));
}

fn main_1() {
    var wp: vec3<f32>;
    var wl: f32;
    var mv: vec4<f32>;
    var tw: f32;
    var expo: f32;
    var boost: f32;

    let _e36 = global.modelMatrix;
    let _e37 = aStar_1;
    wp = (_e36 * vec4<f32>(_e37.x, _e37.y, _e37.z, 1f)).xyz;
    let _e46 = wp;
    wl = length(_e46);
    let _e49 = global.viewMatrix;
    let _e50 = wp;
    let _e51 = wl;
    let _e55 = lensDir((_e50 / vec3(_e51)), true);
    let _e56 = wl;
    let _e57 = (_e55 * _e56);
    mv = (_e49 * vec4<f32>(_e57.x, _e57.y, _e57.z, 1f));
    let _e66 = global.projectionMatrix;
    let _e67 = mv;
    gl_Position = (_e66 * _e67);
    let _e70 = global.uTwinkle;
    let _e73 = global.uTime;
    let _e75 = aStar_1;
    let _e84 = aStar_1;
    tw = (1f + ((_e70 * 0.45f) * sin(((_e73 * (7f + (fract((_e75.x * 0.137f)) * 9f))) + _e84.y))));
    let _e91 = global.uKey;
    let _e95 = textureSampleLevel(tAdaptTexture, tAdaptSampler, vec2(0.5f), 0f);
    let _e99 = global.uMinExp;
    let _e100 = global.uMaxExp;
    expo = clamp((_e91 / exp2(_e95.x)), _e99, _e100);
    let _e103 = global.uStarExp;
    let _e104 = expo;
    let _e110 = global.uTwinkle;
    boost = mix(clamp((_e103 / _e104), 1f, 12f), 1f, clamp((_e110 * 2f), 0f, 1f));
    let _e118 = aColor_1;
    let _e119 = tw;
    let _e121 = global.uExtinction;
    let _e123 = boost;
    vColor = (((_e118 * _e119) * _e121) * _e123);
    let _e125 = corner_1;
    vQuad = ((_e125 * 0.5f) + vec2(0.5f));
    let _e131 = gl_Position;
    let _e133 = gl_Position;
    let _e135 = corner_1;
    let _e136 = aSize_1;
    let _e138 = global.uPixelRatio;
    let _e140 = global.uViewport;
    let _e142 = gl_Position;
    let _e145 = (_e133.xy + ((((_e135 * _e136) * _e138) / _e140) * _e142.w));
    gl_Position.x = _e145.x;
    gl_Position.y = _e145.y;
    return;
}

@vertex 
fn main(@location(0) aStar: vec3<f32>, @location(1) corner: vec2<f32>, @location(2) aColor: vec3<f32>, @location(3) aSize: f32) -> VertexOutput {
    aStar_1 = aStar;
    corner_1 = corner;
    aColor_1 = aColor;
    aSize_1 = aSize;
    main_1();
    let _e53 = vQuad;
    let _e55 = vColor;
    let _e57 = gl_Position;
    return VertexOutput(_e53, _e55, _e57);
}
`;
