// Generated offline from the existing renderer equations. See tools/shaders/.
export const layout = {
  "uniforms": [
    {
      "name": "uU0",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 0
    },
    {
      "name": "uBlock",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 4
    },
    {
      "name": "uExt",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 8
    },
    {
      "name": "uNTex",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 12
    },
    {
      "name": "uOutOrg",
      "type": "vec2",
      "count": 0,
      "align": 8,
      "size": 8,
      "stride": 8,
      "offset": 16
    },
    {
      "name": "uOutN",
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
      "name": "tSoft",
      "type": "sampler2D",
      "count": 0,
      "binding": 1,
      "samplerBinding": 2
    }
  ],
  "bytes": 32,
  "group": 0,
  "attributes": []
};
export const code = /* wgsl */`
struct Params {
    uU0_: f32,
    uBlock: f32,
    uExt: f32,
    uNTex: f32,
    uOutOrg: vec2<f32>,
    uOutN: f32,
}

struct FragmentOutput {
    @location(0) fragmentColor: vec4<f32>,
}

@group(0) @binding(0) 
var<uniform> global: Params;
@group(0) @binding(1) 
var tSoftTexture: texture_2d<f32>;
@group(0) @binding(2) 
var tSoftSampler: sampler;
var<private> fragmentColor: vec4<f32>;
var<private> gl_FragCoord_1: vec4<f32>;

fn soft(uv: vec2<f32>, lod: f32) -> vec2<f32> {
    var uv_1: vec2<f32>;
    var lod_1: f32;

    uv_1 = uv;
    lod_1 = lod;
    let _e19 = uv_1;
    let _e21 = global.uNTex;
    let _e26 = global.uNTex;
    uv_1 = clamp(_e19, vec2((0.5f / _e21)), vec2((1f - (0.5f / _e26))));
    let _e31 = global.uU0_;
    let _e32 = uv_1;
    let _e37 = uv_1;
    let _e40 = lod_1;
    let _e41 = textureSampleLevel(tSoftTexture, tSoftSampler, vec2<f32>(((_e31 + _e32.x) * 0.5f), _e37.y), _e40);
    return _e41.xy;
}

fn ring(uv_2: vec2<f32>, j: f32) -> vec2<f32> {
    var uv_3: vec2<f32>;
    var j_1: f32;
    var local: f32;
    var local_1: f32;
    var local_2: f32;
    var a: f32;
    var local_3: f32;
    var local_4: f32;
    var local_5: f32;
    var b: f32;
    var r: f32;
    var lod_2: f32;
    var acc: vec2<f32> = vec2(0f);
    var k: i32 = 0i;
    var ang: f32;

    uv_3 = uv_2;
    j_1 = j;
    let _e19 = j_1;
    if (_e19 == 1f) {
        local_2 = 1f;
    } else {
        let _e23 = j_1;
        if (_e23 == 2f) {
            local_1 = 3.5f;
        } else {
            let _e27 = j_1;
            if (_e27 == 3f) {
                local = 9f;
            } else {
                local = 20f;
            }
            let _e33 = local;
            local_1 = _e33;
        }
        let _e35 = local_1;
        local_2 = _e35;
    }
    let _e37 = local_2;
    a = _e37;
    let _e39 = j_1;
    if (_e39 == 1f) {
        local_5 = 3.5f;
    } else {
        let _e43 = j_1;
        if (_e43 == 2f) {
            local_4 = 9f;
        } else {
            let _e47 = j_1;
            if (_e47 == 3f) {
                local_3 = 20f;
            } else {
                local_3 = 45f;
            }
            let _e53 = local_3;
            local_4 = _e53;
        }
        let _e55 = local_4;
        local_5 = _e55;
    }
    let _e57 = local_5;
    b = _e57;
    let _e59 = a;
    let _e60 = b;
    let _e65 = global.uExt;
    r = (((_e59 + _e60) * 0.5f) / (2f * _e65));
    let _e71 = r;
    let _e73 = global.uNTex;
    lod_2 = max(0f, (log2((((6.2831855f * _e71) * _e73) / 16f)) - 0.5f));
    loop {
        let _e87 = k;
        if !((_e87 < 16i)) {
            break;
        }
        {
            let _e94 = k;
            let _e97 = j_1;
            ang = ((f32(_e94) + (0.5f * _e97)) * 0.3926991f);
            let _e103 = acc;
            let _e104 = uv_3;
            let _e105 = ang;
            let _e107 = ang;
            let _e110 = r;
            let _e113 = lod_2;
            let _e114 = soft((_e104 + (vec2<f32>(cos(_e105), sin(_e107)) * _e110)), _e113);
            acc = (_e103 + _e114);
        }
        continuing {
            let _e91 = k;
            k = (_e91 + 1i);
        }
    }
    let _e116 = acc;
    return (_e116 / vec2(16f));
}

fn main_1() {
    var uv_4: vec2<f32>;

    let _e16 = gl_FragCoord_1;
    let _e18 = global.uOutOrg;
    let _e20 = global.uOutN;
    uv_4 = ((_e16.xy - _e18) / vec2(_e20));
    let _e24 = global.uBlock;
    if (_e24 < 0.5f) {
        let _e27 = uv_4;
        let _e29 = soft(_e27, 1f);
        let _e30 = uv_4;
        let _e32 = ring(_e30, 1f);
        fragmentColor = vec4<f32>(_e29.x, _e29.y, _e32.x, _e32.y);
        return;
    } else {
        let _e38 = global.uBlock;
        if (_e38 < 1.5f) {
            let _e41 = uv_4;
            let _e43 = ring(_e41, 2f);
            let _e44 = uv_4;
            let _e46 = ring(_e44, 3f);
            fragmentColor = vec4<f32>(_e43.x, _e43.y, _e46.x, _e46.y);
            return;
        } else {
            let _e52 = uv_4;
            let _e54 = ring(_e52, 4f);
            let _e55 = uv_4;
            let _e57 = global.uNTex;
            let _e60 = global.uExt;
            let _e64 = soft(_e55, log2(((180f * _e57) / (2f * _e60))));
            fragmentColor = vec4<f32>(_e54.x, _e54.y, _e64.x, 0f);
            return;
        }
    }
}

@fragment 
fn main(@builtin(position) gl_FragCoord: vec4<f32>) -> FragmentOutput {
    gl_FragCoord_1 = gl_FragCoord;
    main_1();
    let _e21 = fragmentColor;
    return FragmentOutput(_e21);
}
`;
