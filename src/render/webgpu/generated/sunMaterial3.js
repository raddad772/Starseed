// Generated offline from the existing renderer equations. See tools/shaders/.
export const layout = {
  "uniforms": [
    {
      "name": "uBodyIndex",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 0
    },
    {
      "name": "uColor",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 16
    },
    {
      "name": "uRadiance",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 28
    },
    {
      "name": "uTime",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 32
    },
    {
      "name": "uDiscT",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 48
    }
  ],
  "textures": [],
  "bytes": 64,
  "group": 1,
  "attributes": []
};
export const code = /* wgsl */`
struct Params {
    uBodyIndex: f32,
    uColor: vec3<f32>,
    uRadiance: f32,
    uTime: f32,
    uDiscT: vec3<f32>,
}

struct FragmentOutput {
    @location(0) gAlbedo: vec4<f32>,
    @location(1) gNormal: vec4<f32>,
    @location(2) gEmission: vec4<f32>,
    @location(3) gSurface: vec4<f32>,
}

const PI: f32 = 3.1415927f;
const NROT: mat3x3<f32> = mat3x3<f32>(vec3<f32>(0f, 0.8f, 0.6f), vec3<f32>(-0.8f, 0.36f, -0.48f), vec3<f32>(-0.6f, -0.48f, 0.64f));

@group(1) @binding(0) 
var<uniform> global: Params;
var<private> gAlbedo: vec4<f32>;
var<private> gNormal: vec4<f32>;
var<private> gEmission: vec4<f32>;
var<private> gSurface: vec4<f32>;
var<private> vN_1: vec3<f32>;
var<private> vObj_1: vec3<f32>;
var<private> vView_1: vec3<f32>;

fn octEncode(n: vec3<f32>) -> vec2<f32> {
    var n_1: vec3<f32>;
    var local: f32;
    var local_1: f32;
    var local_2: vec2<f32>;

    n_1 = n;
    let _e17 = n_1;
    let _e18 = n_1;
    let _e21 = n_1;
    let _e25 = n_1;
    n_1 = (_e17 / vec3(((abs(_e18.x) + abs(_e21.y)) + abs(_e25.z))));
    let _e31 = n_1;
    if (_e31.z >= 0f) {
        let _e35 = n_1;
        local_2 = _e35.xy;
    } else {
        let _e38 = n_1;
        let _e43 = n_1;
        if (_e43.x >= 0f) {
            local = 1f;
        } else {
            local = -1f;
        }
        let _e51 = local;
        let _e52 = n_1;
        if (_e52.y >= 0f) {
            local_1 = 1f;
        } else {
            local_1 = -1f;
        }
        let _e60 = local_1;
        local_2 = ((vec2(1f) - abs(_e38.yx)) * vec2<f32>(_e51, _e60));
    }
    let _e64 = local_2;
    return _e64;
}

fn materialOutput(albedo: vec3<f32>, normal: vec3<f32>, roughness: f32, ao: f32, trans: f32, wet: f32, F0_: f32) {
    var albedo_1: vec3<f32>;
    var normal_1: vec3<f32>;
    var roughness_1: f32;
    var ao_1: f32;
    var trans_1: f32;
    var wet_1: f32;
    var F0_1: f32;

    albedo_1 = albedo;
    normal_1 = normal;
    roughness_1 = roughness;
    ao_1 = ao;
    trans_1 = trans;
    wet_1 = wet;
    F0_1 = F0_;
    let _e29 = albedo_1;
    let _e34 = clamp(_e29, vec3(0f), vec3(1f));
    let _e35 = ao_1;
    gAlbedo = vec4<f32>(_e34.x, _e34.y, _e34.z, clamp(_e35, 0f, 1f));
    let _e43 = normal_1;
    let _e45 = octEncode(normalize(_e43));
    let _e46 = roughness_1;
    let _e47 = global.uBodyIndex;
    gNormal = vec4<f32>(_e45.x, _e45.y, _e46, _e47);
    gEmission = vec4<f32>(0f, 0f, 0f, 1f);
    let _e56 = trans_1;
    let _e57 = wet_1;
    let _e59 = F0_1;
    gSurface = vec4<f32>(_e56, _e57, 0f, _e59);
    return;
}

fn hash13_(p3_: vec3<f32>) -> f32 {
    var p3_1: vec3<f32>;

    p3_1 = p3_;
    let _e17 = p3_1;
    p3_1 = fract((_e17 * 0.1031f));
    let _e21 = p3_1;
    let _e22 = p3_1;
    let _e23 = p3_1;
    p3_1 = (_e21 + vec3(dot(_e22, (_e23.zyx + vec3(31.32f)))));
    let _e31 = p3_1;
    let _e33 = p3_1;
    let _e36 = p3_1;
    return fract(((_e31.x + _e33.y) * _e36.z));
}

fn vnoise(p: vec3<f32>) -> f32 {
    var p_1: vec3<f32>;
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

    p_1 = p;
    let _e17 = p_1;
    i = floor(_e17);
    let _e20 = p_1;
    f = fract(_e20);
    let _e23 = f;
    let _e24 = f;
    let _e28 = f;
    u = ((_e23 * _e24) * (vec3(3f) - (2f * _e28)));
    let _e34 = i;
    let _e35 = hash13_(_e34);
    n000_ = _e35;
    let _e37 = i;
    let _e46 = hash13_((_e37 + vec3<f32>(1f, 0f, 0f)));
    n100_ = _e46;
    let _e48 = i;
    let _e57 = hash13_((_e48 + vec3<f32>(0f, 1f, 0f)));
    n010_ = _e57;
    let _e59 = i;
    let _e68 = hash13_((_e59 + vec3<f32>(1f, 1f, 0f)));
    n110_ = _e68;
    let _e70 = i;
    let _e79 = hash13_((_e70 + vec3<f32>(0f, 0f, 1f)));
    n001_ = _e79;
    let _e81 = i;
    let _e90 = hash13_((_e81 + vec3<f32>(1f, 0f, 1f)));
    n101_ = _e90;
    let _e92 = i;
    let _e101 = hash13_((_e92 + vec3<f32>(0f, 1f, 1f)));
    n011_ = _e101;
    let _e103 = i;
    let _e112 = hash13_((_e103 + vec3<f32>(1f, 1f, 1f)));
    n111_ = _e112;
    let _e114 = n000_;
    let _e115 = n100_;
    let _e116 = u;
    let _e119 = n010_;
    let _e120 = n110_;
    let _e121 = u;
    let _e124 = u;
    let _e127 = n001_;
    let _e128 = n101_;
    let _e129 = u;
    let _e132 = n011_;
    let _e133 = n111_;
    let _e134 = u;
    let _e137 = u;
    let _e140 = u;
    return ((mix(mix(mix(_e114, _e115, _e116.x), mix(_e119, _e120, _e121.x), _e124.y), mix(mix(_e127, _e128, _e129.x), mix(_e132, _e133, _e134.x), _e137.y), _e140.z) * 2f) - 1f);
}

fn fbm3_(p_2: vec3<f32>, oct: i32) -> f32 {
    var p_3: vec3<f32>;
    var oct_1: i32;
    var s: f32 = 0f;
    var a: f32 = 0.5f;
    var i_1: i32 = 0i;

    p_3 = p_2;
    oct_1 = oct;
    loop {
        let _e26 = i_1;
        if !((_e26 < 8i)) {
            break;
        }
        {
            let _e33 = i_1;
            let _e34 = oct_1;
            if (_e33 >= _e34) {
                break;
            }
            let _e36 = s;
            let _e37 = a;
            let _e38 = p_3;
            let _e39 = vnoise(_e38);
            s = (_e36 + (_e37 * _e39));
            let _e42 = p_3;
            p_3 = (((NROT * _e42) * 2.02f) + vec3(1.7f));
            let _e49 = a;
            a = (_e49 * 0.5f);
        }
        continuing {
            let _e30 = i_1;
            i_1 = (_e30 + 1i);
        }
    }
    let _e52 = s;
    return _e52;
}

fn main_1() {
    var mu: f32;
    var limb: vec3<f32>;
    var gran: f32;
    var spots: f32;
    var c: vec3<f32>;

    let _e19 = vN_1;
    let _e21 = vView_1;
    mu = clamp(dot(normalize(_e19), normalize(_e21)), 0f, 1f);
    let _e31 = mu;
    let _e38 = mu;
    let _e45 = mu;
    limb = vec3<f32>((1f - (0.52f * (1f - _e31))), (1f - (0.6f * (1f - _e38))), (1f - (0.7f * (1f - _e45))));
    let _e53 = vObj_1;
    let _e56 = global.uTime;
    let _e62 = fbm3_(((_e53 * 160f) + vec3((_e56 * 0.002f))), 4i);
    gran = (0.92f + (0.08f * _e62));
    let _e68 = vObj_1;
    let _e75 = fbm3_(((_e68 * 9f) + vec3(3f)), 5i);
    let _e83 = vObj_1;
    spots = (smoothstep(0.62f, 0.7f, ((_e75 * 0.5f) + 0.5f)) * smoothstep(0.75f, 0.2f, abs(_e83.y)));
    let _e89 = global.uColor;
    let _e90 = global.uRadiance;
    let _e92 = limb;
    let _e94 = gran;
    let _e98 = spots;
    let _e102 = global.uDiscT;
    c = (((((_e89 * _e90) * _e92) * _e94) * (1f - (0.7f * _e98))) * _e102);
    let _e107 = vN_1;
    materialOutput(vec3(0f), normalize(_e107), 0.8f, 1f, 0f, 0f, 0.04f);
    let _e114 = gEmission;
    let _e116 = c;
    gEmission.x = _e116.x;
    gEmission.y = _e116.y;
    gEmission.z = _e116.z;
    return;
}

@fragment 
fn main(@location(0) vN: vec3<f32>, @location(1) vObj: vec3<f32>, @location(2) vView: vec3<f32>) -> FragmentOutput {
    vN_1 = vN;
    vObj_1 = vObj;
    vView_1 = vView;
    main_1();
    let _e35 = gAlbedo;
    let _e37 = gNormal;
    let _e39 = gEmission;
    let _e41 = gSurface;
    return FragmentOutput(_e35, _e37, _e39, _e41);
}
`;
