// Generated offline from the existing renderer equations. See tools/shaders/.
export const layout = {
  "uniforms": [
    {
      "name": "uOrg",
      "type": "vec2",
      "count": 0,
      "align": 8,
      "size": 8,
      "stride": 8,
      "offset": 0
    },
    {
      "name": "uN",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 8
    },
    {
      "name": "uD",
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
    }
  ],
  "textures": [
    {
      "name": "tAtlas",
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
    uOrg: vec2<f32>,
    uN: f32,
    uD: f32,
    uOutOrg: vec2<f32>,
}

struct FragmentOutput {
    @location(0) fragmentColor: vec4<f32>,
}

@group(0) @binding(0) 
var<uniform> global: Params;
@group(0) @binding(1) 
var tAtlasTexture: texture_2d<f32>;
@group(0) @binding(2) 
var tAtlasSampler: sampler;
var<private> fragmentColor: vec4<f32>;
var<private> gl_FragCoord_1: vec4<f32>;

fn main_1() {
    var px: vec2<i32>;
    var org: vec2<i32>;
    var hi: vec2<i32>;
    var c: f32 = 0f;
    var ch: f32 = 0f;
    var ws: f32 = 0f;
    var j: i32 = -2i;
    var i: i32;
    var local: f32;
    var local_1: f32;
    var local_2: f32;
    var local_3: f32;
    var w: f32;
    var m: f32;
    var local_4: f32;
    var cov: f32;

    let _e12 = gl_FragCoord_1;
    let _e14 = global.uOutOrg;
    px = vec2<i32>((_e12.xy - _e14));
    let _e18 = global.uOrg;
    org = vec2<i32>(_e18);
    let _e21 = global.uN;
    hi = vec2((i32(_e21) - 1i));
    loop {
        let _e36 = j;
        if !((_e36 <= 2i)) {
            break;
        }
        i = -2i;
        loop {
            let _e46 = i;
            if !((_e46 <= 2i)) {
                break;
            }
            {
                let _e53 = i;
                if (_e53 == 0i) {
                    local_1 = 6f;
                } else {
                    let _e57 = i;
                    if (abs(_e57) == 1i) {
                        local = 4f;
                    } else {
                        local = 1f;
                    }
                    let _e64 = local;
                    local_1 = _e64;
                }
                let _e66 = local_1;
                let _e67 = j;
                if (_e67 == 0i) {
                    local_3 = 6f;
                } else {
                    let _e71 = j;
                    if (abs(_e71) == 1i) {
                        local_2 = 4f;
                    } else {
                        local_2 = 1f;
                    }
                    let _e78 = local_2;
                    local_3 = _e78;
                }
                let _e80 = local_3;
                w = (_e66 * _e80);
                let _e83 = org;
                let _e84 = px;
                let _e85 = i;
                let _e86 = j;
                let _e91 = hi;
                let _e95 = textureLoad(tAtlasTexture, (_e83 + clamp((_e84 + vec2<i32>(_e85, _e86)), vec2(0i), _e91)), 0i);
                m = _e95.x;
                let _e98 = m;
                if (_e98 > 2f) {
                    local_4 = 1f;
                } else {
                    local_4 = 0f;
                }
                let _e104 = local_4;
                cov = _e104;
                let _e106 = c;
                let _e107 = w;
                let _e108 = cov;
                c = (_e106 + (_e107 * _e108));
                let _e111 = ch;
                let _e112 = w;
                let _e113 = cov;
                let _e115 = m;
                let _e116 = global.uD;
                ch = (_e111 + ((_e112 * _e113) * (_e115 - _e116)));
                let _e120 = ws;
                let _e121 = w;
                ws = (_e120 + _e121);
            }
            continuing {
                let _e50 = i;
                i = (_e50 + 1i);
            }
        }
        continuing {
            let _e40 = j;
            j = (_e40 + 1i);
        }
    }
    let _e123 = c;
    let _e124 = ws;
    let _e126 = ch;
    let _e127 = ws;
    fragmentColor = vec4<f32>((_e123 / _e124), (_e126 / _e127), 0f, 1f);
    return;
}

@fragment 
fn main(@builtin(position) gl_FragCoord: vec4<f32>) -> FragmentOutput {
    gl_FragCoord_1 = gl_FragCoord;
    main_1();
    let _e17 = fragmentColor;
    return FragmentOutput(_e17);
}
`;
