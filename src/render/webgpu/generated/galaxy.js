// Generated offline from the existing renderer equations. See tools/shaders/.
export const layout = {
  "uniforms": [
    {
      "name": "uFace",
      "type": "int",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 0
    },
    {
      "name": "uGalNormal",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 16
    },
    {
      "name": "uGalCenter",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 32
    },
    {
      "name": "uSeed",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 44
    },
    {
      "name": "uNebulaA",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 48
    },
    {
      "name": "uNebulaB",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 64
    }
  ],
  "textures": [],
  "bytes": 80,
  "group": 0,
  "attributes": []
};
export const code = /* wgsl */`
struct Params {
    uFace: i32,
    uGalNormal: vec3<f32>,
    uGalCenter: vec3<f32>,
    uSeed: f32,
    uNebulaA: vec3<f32>,
    uNebulaB: vec3<f32>,
}

struct FragmentOutput {
    @location(0) fragmentColor: vec4<f32>,
}

const NROT: mat3x3<f32> = mat3x3<f32>(vec3<f32>(0f, 0.8f, 0.6f), vec3<f32>(-0.8f, 0.36f, -0.48f), vec3<f32>(-0.6f, -0.48f, 0.64f));

@group(0) @binding(0) 
var<uniform> global: Params;
var<private> fragmentColor: vec4<f32>;
var<private> vUv_1: vec2<f32>;

fn cubeDirection(uv: vec2<f32>) -> vec3<f32> {
    var uv_1: vec2<f32>;
    var p: vec2<f32>;

    uv_1 = uv;
    let _e16 = uv_1;
    p = ((_e16 * 2f) - vec2(1f));
    let _e23 = global.uFace;
    if (_e23 == 0i) {
        let _e27 = p;
        let _e30 = p;
        return vec3<f32>(1f, -(_e27.y), -(_e30.x));
    }
    let _e34 = global.uFace;
    if (_e34 == 1i) {
        let _e39 = p;
        let _e42 = p;
        return vec3<f32>(-1f, -(_e39.y), _e42.x);
    }
    let _e45 = global.uFace;
    if (_e45 == 2i) {
        let _e48 = p;
        let _e51 = p;
        return vec3<f32>(_e48.x, 1f, _e51.y);
    }
    let _e54 = global.uFace;
    if (_e54 == 3i) {
        let _e57 = p;
        let _e61 = p;
        return vec3<f32>(_e57.x, -1f, -(_e61.y));
    }
    let _e65 = global.uFace;
    if (_e65 == 4i) {
        let _e68 = p;
        let _e70 = p;
        return vec3<f32>(_e68.x, -(_e70.y), 1f);
    }
    let _e75 = p;
    let _e78 = p;
    return vec3<f32>(-(_e75.x), -(_e78.y), -1f);
}

fn hash13_(p3_: vec3<f32>) -> f32 {
    var p3_1: vec3<f32>;

    p3_1 = p3_;
    let _e16 = p3_1;
    p3_1 = fract((_e16 * 0.1031f));
    let _e20 = p3_1;
    let _e21 = p3_1;
    let _e22 = p3_1;
    p3_1 = (_e20 + vec3(dot(_e21, (_e22.zyx + vec3(31.32f)))));
    let _e30 = p3_1;
    let _e32 = p3_1;
    let _e35 = p3_1;
    return fract(((_e30.x + _e32.y) * _e35.z));
}

fn vnoise(p_1: vec3<f32>) -> f32 {
    var p_2: vec3<f32>;
    var i: vec3<f32>;
    var f: vec3<f32>;
    var u: vec3<f32>;
    var n000_: f32;
    var n100_: f32;
    var n010_: f32;
    var n110_: f32;
    var n001_: f32;
    var n101_: f32;
    var n011_: f32;
    var n111_: f32;

    p_2 = p_1;
    let _e16 = p_2;
    i = floor(_e16);
    let _e19 = p_2;
    f = fract(_e19);
    let _e22 = f;
    let _e23 = f;
    let _e27 = f;
    u = ((_e22 * _e23) * (vec3(3f) - (2f * _e27)));
    let _e33 = i;
    let _e34 = hash13_(_e33);
    n000_ = _e34;
    let _e36 = i;
    let _e45 = hash13_((_e36 + vec3<f32>(1f, 0f, 0f)));
    n100_ = _e45;
    let _e47 = i;
    let _e56 = hash13_((_e47 + vec3<f32>(0f, 1f, 0f)));
    n010_ = _e56;
    let _e58 = i;
    let _e67 = hash13_((_e58 + vec3<f32>(1f, 1f, 0f)));
    n110_ = _e67;
    let _e69 = i;
    let _e78 = hash13_((_e69 + vec3<f32>(0f, 0f, 1f)));
    n001_ = _e78;
    let _e80 = i;
    let _e89 = hash13_((_e80 + vec3<f32>(1f, 0f, 1f)));
    n101_ = _e89;
    let _e91 = i;
    let _e100 = hash13_((_e91 + vec3<f32>(0f, 1f, 1f)));
    n011_ = _e100;
    let _e102 = i;
    let _e111 = hash13_((_e102 + vec3<f32>(1f, 1f, 1f)));
    n111_ = _e111;
    let _e113 = n000_;
    let _e114 = n100_;
    let _e115 = u;
    let _e118 = n010_;
    let _e119 = n110_;
    let _e120 = u;
    let _e123 = u;
    let _e126 = n001_;
    let _e127 = n101_;
    let _e128 = u;
    let _e131 = n011_;
    let _e132 = n111_;
    let _e133 = u;
    let _e136 = u;
    let _e139 = u;
    return ((mix(mix(mix(_e113, _e114, _e115.x), mix(_e118, _e119, _e120.x), _e123.y), mix(mix(_e126, _e127, _e128.x), mix(_e131, _e132, _e133.x), _e136.y), _e139.z) * 2f) - 1f);
}

fn fbm3_(p_3: vec3<f32>, oct: i32) -> f32 {
    var p_4: vec3<f32>;
    var oct_1: i32;
    var s: f32 = 0f;
    var a: f32 = 0.5f;
    var i_1: i32 = 0i;

    p_4 = p_3;
    oct_1 = oct;
    loop {
        let _e25 = i_1;
        if !((_e25 < 8i)) {
            break;
        }
        {
            let _e32 = i_1;
            let _e33 = oct_1;
            if (_e32 >= _e33) {
                break;
            }
            let _e35 = s;
            let _e36 = a;
            let _e37 = p_4;
            let _e38 = vnoise(_e37);
            s = (_e35 + (_e36 * _e38));
            let _e41 = p_4;
            p_4 = (((NROT * _e41) * 2.02f) + vec3(1.7f));
            let _e48 = a;
            a = (_e48 * 0.5f);
        }
        continuing {
            let _e29 = i_1;
            i_1 = (_e29 + 1i);
        }
    }
    let _e51 = s;
    return _e51;
}

fn h31_(p_5: vec3<f32>) -> f32 {
    var p_6: vec3<f32>;

    p_6 = p_5;
    let _e17 = p_6;
    let _e18 = global.uSeed;
    let _e21 = hash13_((_e17 + vec3(_e18)));
    return _e21;
}

fn starfield(d: vec3<f32>, cells: f32, density: f32, bright: f32) -> vec3<f32> {
    var d_1: vec3<f32>;
    var cells_1: f32;
    var density_1: f32;
    var bright_1: f32;
    var p_7: vec3<f32>;
    var ip: vec3<f32>;
    var acc: vec3<f32> = vec3(0f);
    var x: i32 = -1i;
    var y: i32;
    var z: i32;
    var c: vec3<f32>;
    var h: f32;
    var sp: vec3<f32>;
    var sd: vec3<f32>;
    var ang: f32;
    var mag: f32;
    var t: f32;
    var col: vec3<f32>;

    d_1 = d;
    cells_1 = cells;
    density_1 = density;
    bright_1 = bright;
    let _e23 = d_1;
    let _e24 = cells_1;
    p_7 = (_e23 * _e24);
    let _e27 = p_7;
    ip = floor(_e27);
    loop {
        let _e36 = x;
        if !((_e36 <= 1i)) {
            break;
        }
        y = -1i;
        loop {
            let _e46 = y;
            if !((_e46 <= 1i)) {
                break;
            }
            z = -1i;
            loop {
                let _e56 = z;
                if !((_e56 <= 1i)) {
                    break;
                }
                {
                    let _e63 = ip;
                    let _e64 = x;
                    let _e65 = y;
                    let _e66 = z;
                    c = (_e63 + vec3<f32>(f32(_e64), f32(_e65), f32(_e66)));
                    let _e73 = c;
                    let _e74 = h31_(_e73);
                    h = _e74;
                    let _e76 = h;
                    let _e77 = density_1;
                    if (_e76 > _e77) {
                        continue;
                    }
                    let _e79 = c;
                    let _e80 = c;
                    let _e84 = h31_((_e80 + vec3(1.3f)));
                    let _e85 = c;
                    let _e89 = h31_((_e85 + vec3(7.1f)));
                    let _e90 = c;
                    let _e94 = h31_((_e90 + vec3(3.7f)));
                    sp = (_e79 + vec3<f32>(_e84, _e89, _e94));
                    let _e98 = sp;
                    sd = normalize(_e98);
                    let _e101 = sd;
                    let _e102 = d_1;
                    let _e109 = cells_1;
                    ang = (acos(clamp(dot(_e101, _e102), -1f, 1f)) * _e109);
                    let _e112 = c;
                    let _e116 = h31_((_e112 + vec3(9.9f)));
                    mag = pow(_e116, 6f);
                    let _e120 = c;
                    let _e124 = h31_((_e120 + vec3(4.4f)));
                    t = _e124;
                    let _e134 = t;
                    let _e135 = t;
                    col = mix(vec3<f32>(1f, 0.72f, 0.5f), vec3<f32>(0.75f, 0.85f, 1f), vec3((_e134 * _e135)));
                    let _e140 = acc;
                    let _e141 = col;
                    let _e142 = ang;
                    let _e144 = ang;
                    let _e150 = mag;
                    let _e152 = bright_1;
                    acc = (_e140 + (((_e141 * exp(((-(_e142) * _e144) * 9f))) * _e150) * _e152));
                }
                continuing {
                    let _e60 = z;
                    z = (_e60 + 1i);
                }
            }
            continuing {
                let _e50 = y;
                y = (_e50 + 1i);
            }
        }
        continuing {
            let _e40 = x;
            x = (_e40 + 1i);
        }
    }
    let _e155 = acc;
    return _e155;
}

fn main_1() {
    var d_2: vec3<f32>;
    var b: f32;
    var toward: f32;
    var band: f32;
    var wide: f32;
    var bulge: f32;
    var n1_: f32;
    var n2_: f32;
    var glow: f32;
    var lane: f32;
    var mw: vec3<f32>;
    var col_1: vec3<f32>;
    var neb: f32;
    var nebA: f32;
    var nebB: f32;

    let _e15 = vUv_1;
    let _e16 = cubeDirection(_e15);
    d_2 = normalize(_e16);
    let _e19 = d_2;
    let _e20 = global.uGalNormal;
    b = dot(_e19, _e20);
    let _e23 = d_2;
    let _e24 = global.uGalCenter;
    toward = ((dot(_e23, _e24) * 0.5f) + 0.5f);
    let _e31 = b;
    let _e33 = b;
    band = exp(((-(_e31) * _e33) / 0.012f));
    let _e39 = b;
    let _e41 = b;
    wide = exp(((-(_e39) * _e41) / 0.08f));
    let _e48 = toward;
    let _e56 = b;
    let _e58 = b;
    bulge = (exp((-(pow((1f - _e48), 2f)) / 0.025f)) * exp(((-(_e56) * _e58) / 0.05f)));
    let _e65 = d_2;
    let _e69 = fbm3_((_e65 * 6f), 6i);
    n1_ = ((_e69 * 0.5f) + 0.5f);
    let _e75 = d_2;
    let _e82 = fbm3_(((_e75 * 22f) + vec3(3f)), 5i);
    n2_ = ((_e82 * 0.5f) + 0.5f);
    let _e88 = band;
    let _e91 = n1_;
    let _e97 = toward;
    let _e101 = wide;
    let _e105 = bulge;
    let _e111 = n2_;
    glow = (((((_e88 * (0.55f + (0.45f * _e91))) * (0.6f + (0.6f * _e97))) + (_e101 * 0.18f)) + (_e105 * 1.4f)) * (0.7f + (0.6f * _e111)));
    let _e118 = d_2;
    let _e125 = fbm3_(((_e118 * 9f) + vec3(11f)), 6i);
    let _e131 = b;
    let _e133 = b;
    lane = (smoothstep(0.52f, 0.72f, ((_e125 * 0.5f) + 0.5f)) * exp(((-(_e131) * _e133) / 0.004f)));
    let _e140 = glow;
    let _e143 = lane;
    glow = (_e140 * (1f - (0.85f * _e143)));
    let _e155 = bulge;
    let _e157 = toward;
    let _e162 = glow;
    mw = (mix(vec3<f32>(0.55f, 0.62f, 0.85f), vec3<f32>(1f, 0.86f, 0.62f), vec3((_e155 + (0.3f * _e157)))) * _e162);
    let _e165 = mw;
    col_1 = (_e165 * 0.00022f);
    let _e169 = col_1;
    let _e170 = d_2;
    let _e174 = band;
    let _e178 = starfield(_e170, 420f, (0.03f + (0.2f * _e174)), 0.0003f);
    col_1 = (_e169 + _e178);
    let _e180 = col_1;
    let _e181 = d_2;
    let _e185 = band;
    let _e189 = starfield(_e181, 160f, (0.025f + (0.08f * _e185)), 0.0006f);
    col_1 = (_e180 + _e189);
    let _e193 = d_2;
    let _e200 = fbm3_(((_e193 * 3f) + vec3(5f)), 6i);
    let _e206 = b;
    let _e208 = b;
    neb = (smoothstep(0.55f, 0.85f, ((_e200 * 0.5f) + 0.5f)) * exp(((-(_e206) * _e208) / 0.03f)));
    let _e215 = neb;
    let _e218 = d_2;
    let _e222 = fbm3_((_e218 * 13f), 4i);
    nebA = (_e215 * smoothstep(0.4f, 0.8f, ((_e222 * 0.5f) + 0.5f)));
    let _e232 = d_2;
    let _e239 = fbm3_(((_e232 * 4f) - vec3(7f)), 6i);
    let _e245 = b;
    let _e247 = b;
    let _e254 = nebA;
    nebB = ((smoothstep(0.62f, 0.9f, ((_e239 * 0.5f) + 0.5f)) * exp(((-(_e245) * _e247) / 0.06f))) * (1f - _e254));
    let _e258 = col_1;
    let _e259 = global.uNebulaA;
    let _e260 = nebA;
    let _e264 = global.uNebulaB;
    let _e265 = nebB;
    col_1 = (_e258 + (((_e259 * _e260) * 0.00016f) + ((_e264 * _e265) * 0.0001f)));
    let _e271 = col_1;
    fragmentColor = vec4<f32>(_e271.x, _e271.y, _e271.z, 1f);
    return;
}

@fragment 
fn main(@location(0) vUv: vec2<f32>) -> FragmentOutput {
    vUv_1 = vUv;
    main_1();
    let _e21 = fragmentColor;
    return FragmentOutput(_e21);
}
`;
