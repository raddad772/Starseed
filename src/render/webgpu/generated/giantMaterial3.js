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
      "name": "uSunDir",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 16
    },
    {
      "name": "uCenter",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 32
    },
    {
      "name": "uRadius",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 44
    },
    {
      "name": "uToFixed",
      "type": "mat3",
      "count": 0,
      "align": 16,
      "size": 48,
      "stride": 48,
      "offset": 48
    },
    {
      "name": "uRingParams",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 96
    },
    {
      "name": "uPal",
      "type": "vec3",
      "count": 6,
      "align": 16,
      "size": 12,
      "stride": 16,
      "offset": 112
    },
    {
      "name": "uBands",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 208
    },
    {
      "name": "uTurb",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 212
    },
    {
      "name": "uJetPhase",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 216
    },
    {
      "name": "uEqJet",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 220
    },
    {
      "name": "uStorm",
      "type": "vec4",
      "count": 3,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 224
    },
    {
      "name": "uStormCol",
      "type": "vec3",
      "count": 3,
      "align": 16,
      "size": 12,
      "stride": 16,
      "offset": 272
    },
    {
      "name": "uStormSpin",
      "type": "float",
      "count": 3,
      "align": 16,
      "size": 4,
      "stride": 16,
      "offset": 320
    },
    {
      "name": "uNumStorms",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 368
    },
    {
      "name": "uPolar",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 384
    },
    {
      "name": "uHexagon",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 396
    },
    {
      "name": "uGiantTime",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 400
    },
    {
      "name": "uRingShape",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 416
    }
  ],
  "textures": [],
  "bytes": 432,
  "group": 1,
  "attributes": []
};
export const code = /* wgsl */`
struct Std140_uStormSpin { @align(16) @size(16) value: f32 }
struct Params {
    uBodyIndex: f32,
    uSunDir: vec3<f32>,
    uCenter: vec3<f32>,
    uRadius: f32,
    uToFixed: mat3x3<f32>,
    uRingParams: vec3<f32>,
    uPal: array<vec3<f32>, 6>,
    uBands: f32,
    uTurb: f32,
    uJetPhase: f32,
    uEqJet: f32,
    uStorm: array<vec4<f32>, 3>,
    uStormCol: array<vec3<f32>, 3>,
    uStormSpin: array<Std140_uStormSpin, 3>,
    uNumStorms: f32,
    uPolar: vec3<f32>,
    uHexagon: f32,
    uGiantTime: f32,
    uRingShape: vec4<f32>,
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
var<private> vObj_1: vec3<f32>;
var<private> vWorld_1: vec3<f32>;
var<private> vNormalW_1: vec3<f32>;

fn octEncode(n: vec3<f32>) -> vec2<f32> {
    var n_1: vec3<f32>;
    var local: f32;
    var local_1: f32;
    var local_2: vec2<f32>;

    n_1 = n;
    let _e45 = n_1;
    let _e46 = n_1;
    let _e49 = n_1;
    let _e53 = n_1;
    n_1 = (_e45 / vec3(((abs(_e46.x) + abs(_e49.y)) + abs(_e53.z))));
    let _e59 = n_1;
    if (_e59.z >= 0f) {
        let _e63 = n_1;
        local_2 = _e63.xy;
    } else {
        let _e66 = n_1;
        let _e71 = n_1;
        if (_e71.x >= 0f) {
            local = 1f;
        } else {
            local = -1f;
        }
        let _e79 = local;
        let _e80 = n_1;
        if (_e80.y >= 0f) {
            local_1 = 1f;
        } else {
            local_1 = -1f;
        }
        let _e88 = local_1;
        local_2 = ((vec2(1f) - abs(_e66.yx)) * vec2<f32>(_e79, _e88));
    }
    let _e92 = local_2;
    return _e92;
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
    let _e57 = albedo_1;
    let _e62 = clamp(_e57, vec3(0f), vec3(1f));
    let _e63 = ao_1;
    gAlbedo = vec4<f32>(_e62.x, _e62.y, _e62.z, clamp(_e63, 0f, 1f));
    let _e71 = normal_1;
    let _e73 = octEncode(normalize(_e71));
    let _e74 = roughness_1;
    let _e75 = global.uBodyIndex;
    gNormal = vec4<f32>(_e73.x, _e73.y, _e74, _e75);
    gEmission = vec4<f32>(0f, 0f, 0f, 1f);
    let _e84 = trans_1;
    let _e85 = wet_1;
    let _e87 = F0_1;
    gSurface = vec4<f32>(_e84, _e85, 0f, _e87);
    return;
}

fn hash13_(p3_: vec3<f32>) -> f32 {
    var p3_1: vec3<f32>;

    p3_1 = p3_;
    let _e48 = p3_1;
    p3_1 = fract((_e48 * 0.1031f));
    let _e52 = p3_1;
    let _e53 = p3_1;
    let _e54 = p3_1;
    p3_1 = (_e52 + vec3(dot(_e53, (_e54.zyx + vec3(31.32f)))));
    let _e62 = p3_1;
    let _e64 = p3_1;
    let _e67 = p3_1;
    return fract(((_e62.x + _e64.y) * _e67.z));
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
    let _e48 = p_1;
    i = floor(_e48);
    let _e51 = p_1;
    f = fract(_e51);
    let _e54 = f;
    let _e55 = f;
    let _e59 = f;
    u = ((_e54 * _e55) * (vec3(3f) - (2f * _e59)));
    let _e65 = i;
    let _e66 = hash13_(_e65);
    n000_ = _e66;
    let _e68 = i;
    let _e77 = hash13_((_e68 + vec3<f32>(1f, 0f, 0f)));
    n100_ = _e77;
    let _e79 = i;
    let _e88 = hash13_((_e79 + vec3<f32>(0f, 1f, 0f)));
    n010_ = _e88;
    let _e90 = i;
    let _e99 = hash13_((_e90 + vec3<f32>(1f, 1f, 0f)));
    n110_ = _e99;
    let _e101 = i;
    let _e110 = hash13_((_e101 + vec3<f32>(0f, 0f, 1f)));
    n001_ = _e110;
    let _e112 = i;
    let _e121 = hash13_((_e112 + vec3<f32>(1f, 0f, 1f)));
    n101_ = _e121;
    let _e123 = i;
    let _e132 = hash13_((_e123 + vec3<f32>(0f, 1f, 1f)));
    n011_ = _e132;
    let _e134 = i;
    let _e143 = hash13_((_e134 + vec3<f32>(1f, 1f, 1f)));
    n111_ = _e143;
    let _e145 = n000_;
    let _e146 = n100_;
    let _e147 = u;
    let _e150 = n010_;
    let _e151 = n110_;
    let _e152 = u;
    let _e155 = u;
    let _e158 = n001_;
    let _e159 = n101_;
    let _e160 = u;
    let _e163 = n011_;
    let _e164 = n111_;
    let _e165 = u;
    let _e168 = u;
    let _e171 = u;
    return ((mix(mix(mix(_e145, _e146, _e147.x), mix(_e150, _e151, _e152.x), _e155.y), mix(mix(_e158, _e159, _e160.x), mix(_e163, _e164, _e165.x), _e168.y), _e171.z) * 2f) - 1f);
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
        let _e57 = i_1;
        if !((_e57 < 8i)) {
            break;
        }
        {
            let _e64 = i_1;
            let _e65 = oct_1;
            if (_e64 >= _e65) {
                break;
            }
            let _e67 = s;
            let _e68 = a;
            let _e69 = p_3;
            let _e70 = vnoise(_e69);
            s = (_e67 + (_e68 * _e70));
            let _e73 = p_3;
            p_3 = (((NROT * _e73) * 2.02f) + vec3(1.7f));
            let _e80 = a;
            a = (_e80 * 0.5f);
        }
        continuing {
            let _e61 = i_1;
            i_1 = (_e61 + 1i);
        }
    }
    let _e83 = s;
    return _e83;
}

fn palette(t: f32) -> vec3<f32> {
    var t_1: f32;
    var i_2: f32;
    var f_1: f32;
    var a_1: vec3<f32>;
    var b: vec3<f32>;

    t_1 = t;
    let _e49 = t_1;
    t_1 = (clamp(_e49, 0f, 1f) * 5f);
    let _e55 = t_1;
    i_2 = floor(_e55);
    let _e60 = t_1;
    f_1 = smoothstep(0f, 1f, fract(_e60));
    let _e66 = global.uPal[0];
    a_1 = _e66;
    let _e70 = global.uPal[1];
    b = _e70;
    let _e72 = i_2;
    if (_e72 < 1f) {
        {
            let _e77 = global.uPal[0];
            a_1 = _e77;
            let _e80 = global.uPal[1];
            b = _e80;
        }
    } else {
        let _e81 = i_2;
        if (_e81 < 2f) {
            {
                let _e86 = global.uPal[1];
                a_1 = _e86;
                let _e89 = global.uPal[2];
                b = _e89;
            }
        } else {
            let _e90 = i_2;
            if (_e90 < 3f) {
                {
                    let _e95 = global.uPal[2];
                    a_1 = _e95;
                    let _e98 = global.uPal[3];
                    b = _e98;
                }
            } else {
                let _e99 = i_2;
                if (_e99 < 4f) {
                    {
                        let _e104 = global.uPal[3];
                        a_1 = _e104;
                        let _e107 = global.uPal[4];
                        b = _e107;
                    }
                } else {
                    {
                        let _e110 = global.uPal[4];
                        a_1 = _e110;
                        let _e113 = global.uPal[5];
                        b = _e113;
                    }
                }
            }
        }
    }
    let _e114 = a_1;
    let _e115 = b;
    let _e116 = f_1;
    return mix(_e114, _e115, vec3(_e116));
}

fn giantColor(d: vec3<f32>, detail: f32, bandShade: ptr<function, f32>) -> vec3<f32> {
    var d_1: vec3<f32>;
    var detail_1: f32;
    var lat: f32;
    var lon: f32;
    var jet: f32;
    var shift: f32;
    var p_4: vec3<f32>;
    var i_3: i32 = 0i;
    var s_1: vec4<f32>;
    var c: vec3<f32>;
    var dd: f32;
    var r: f32;
    var k: f32;
    var ang: f32;
    var axis: vec3<f32>;
    var q: vec3<f32>;
    var w: vec3<f32>;
    var turb: f32;
    var wp: vec3<f32>;
    var w1_: f32;
    var w2_: f32;
    var latW: f32;
    var bandF: f32;
    var bandG: f32;
    var t_2: f32;
    var col: vec3<f32>;
    var streak: f32;
    var i_4: i32 = 0i;
    var s_2: vec4<f32>;
    var c_1: vec3<f32>;
    var e: vec3<f32>;
    var dd_1: f32;
    var m: f32;
    var pol: f32;
    var a_2: f32;
    var hex: f32;
    var edge: f32;

    d_1 = d;
    detail_1 = detail;
    let _e52 = d_1;
    lat = asin(clamp(_e52.y, -1f, 1f));
    let _e60 = d_1;
    let _e62 = d_1;
    lon = atan2(_e60.z, _e62.x);
    let _e66 = lat;
    let _e67 = global.uBands;
    let _e71 = global.uJetPhase;
    let _e76 = global.uEqJet;
    let _e77 = lat;
    let _e79 = lat;
    jet = (sin((((_e66 * _e67) * 2f) + (_e71 * 6.28f))) + (_e76 * exp(((-(_e77) * _e79) * 40f))));
    let _e87 = jet;
    let _e88 = global.uGiantTime;
    shift = ((_e87 * _e88) * 0.00004f);
    let _e93 = lon;
    let _e94 = shift;
    let _e97 = lat;
    let _e100 = lat;
    let _e102 = lon;
    let _e103 = shift;
    let _e106 = lat;
    p_4 = vec3<f32>((cos((_e93 + _e94)) * cos(_e97)), sin(_e100), (sin((_e102 + _e103)) * cos(_e106)));
    loop {
        let _e113 = i_3;
        if !((_e113 < 3i)) {
            break;
        }
        {
            let _e120 = i_3;
            let _e122 = global.uNumStorms;
            if (f32(_e120) >= _e122) {
                break;
            }
            let _e124 = i_3;
            let _e126 = global.uStorm[_e124];
            s_1 = _e126;
            let _e128 = s_1;
            let _e131 = s_1;
            let _e135 = s_1;
            let _e138 = s_1;
            let _e141 = s_1;
            c = vec3<f32>((cos(_e128.y) * cos(_e131.x)), sin(_e135.x), (sin(_e138.y) * cos(_e141.x)));
            let _e147 = p_4;
            let _e148 = c;
            dd = distance(_e147, _e148);
            let _e151 = s_1;
            r = _e151.z;
            let _e154 = dd;
            let _e155 = r;
            if (_e154 < (_e155 * 1.6f)) {
                {
                    let _e160 = dd;
                    let _e161 = r;
                    k = (1f - (_e160 / (_e161 * 1.6f)));
                    let _e167 = i_3;
                    let _e169 = global.uStormSpin[_e167].value;
                    let _e170 = k;
                    let _e172 = k;
                    let _e176 = global.uGiantTime;
                    let _e179 = i_3;
                    let _e181 = global.uStormSpin[_e179].value;
                    ang = ((((_e169 * _e170) * _e172) * 5f) + ((_e176 * 0.0004f) * _e181));
                    let _e185 = c;
                    axis = _e185;
                    let _e187 = p_4;
                    let _e188 = axis;
                    let _e189 = p_4;
                    let _e190 = axis;
                    q = (_e187 - (_e188 * dot(_e189, _e190)));
                    let _e195 = axis;
                    let _e196 = q;
                    w = cross(_e195, _e196);
                    let _e199 = axis;
                    let _e200 = p_4;
                    let _e201 = axis;
                    let _e204 = q;
                    let _e205 = ang;
                    let _e209 = w;
                    let _e210 = ang;
                    p_4 = (((_e199 * dot(_e200, _e201)) + (_e204 * cos(_e205))) + (_e209 * sin(_e210)));
                }
            }
        }
        continuing {
            let _e117 = i_3;
            i_3 = (_e117 + 1i);
        }
    }
    let _e214 = global.uTurb;
    let _e217 = lat;
    let _e218 = global.uBands;
    let _e222 = global.uJetPhase;
    turb = (_e214 * (0.35f + (0.65f * abs(cos((((_e217 * _e218) * 2f) + (_e222 * 6.28f)))))));
    let _e232 = p_4;
    wp = (_e232 * 3f);
    let _e236 = wp;
    let _e246 = fbm3_(((_e236 * vec3<f32>(1f, 5f, 1f)) + vec3(2f)), 4i);
    w1_ = _e246;
    let _e248 = wp;
    let _e260 = detail_1;
    let _e263 = fbm3_((((_e248 * vec3<f32>(1f, 5f, 1f)) * 2.3f) + vec3(7f)), i32((3f + _e260)));
    w2_ = _e263;
    let _e265 = lat;
    let _e266 = w1_;
    let _e269 = w2_;
    let _e273 = turb;
    latW = (_e265 + (((_e266 * 0.05f) + (_e269 * 0.025f)) * _e273));
    let _e277 = latW;
    let _e278 = global.uBands;
    let _e282 = global.uJetPhase;
    let _e287 = latW;
    let _e288 = global.uBands;
    bandF = sin(((((_e277 * _e278) * 2f) + (_e282 * 6.28f)) + (0.6f * sin(((_e287 * _e288) * 0.7f)))));
    let _e297 = latW;
    let _e298 = global.uBands;
    let _e306 = fbm3_(vec3<f32>(((_e297 * _e298) * 1.3f), 0f, 0.5f), 3i);
    bandG = _e306;
    let _e310 = bandF;
    let _e314 = bandG;
    let _e318 = w2_;
    let _e320 = turb;
    t_2 = (((0.5f + (0.35f * _e310)) + (0.3f * _e314)) + ((0.12f * _e318) * _e320));
    let _e324 = bandF;
    (*bandShade) = _e324;
    let _e325 = t_2;
    let _e326 = palette(_e325);
    col = _e326;
    let _e328 = lon;
    let _e331 = shift;
    let _e335 = latW;
    let _e341 = detail_1;
    let _e344 = fbm3_(vec3<f32>(((_e328 * 12f) + (_e331 * 10f)), (_e335 * 160f), 0f), i32((2f + _e341)));
    streak = _e344;
    let _e346 = col;
    let _e349 = streak;
    col = (_e346 * (0.92f + (0.12f * _e349)));
    loop {
        let _e355 = i_4;
        if !((_e355 < 3i)) {
            break;
        }
        {
            let _e362 = i_4;
            let _e364 = global.uNumStorms;
            if (f32(_e362) >= _e364) {
                break;
            }
            let _e366 = i_4;
            let _e368 = global.uStorm[_e366];
            s_2 = _e368;
            let _e370 = s_2;
            let _e373 = s_2;
            let _e377 = s_2;
            let _e380 = s_2;
            let _e383 = s_2;
            c_1 = vec3<f32>((cos(_e370.y) * cos(_e373.x)), sin(_e377.x), (sin(_e380.y) * cos(_e383.x)));
            let _e389 = p_4;
            let _e390 = c_1;
            e = (_e389 - _e390);
            let _e393 = e;
            let _e396 = s_2;
            let _e399 = e;
            dd_1 = length(vec2<f32>((length(_e393.xz) / _e396.w), _e399.y));
            let _e404 = s_2;
            let _e406 = s_2;
            let _e410 = dd_1;
            m = smoothstep(_e404.z, (_e406.z * 0.55f), _e410);
            let _e413 = col;
            let _e414 = i_4;
            let _e416 = global.uStormCol[_e414];
            let _e419 = w2_;
            let _e423 = m;
            col = mix(_e413, (_e416 * (0.85f + (0.25f * _e419))), vec3((_e423 * 0.85f)));
        }
        continuing {
            let _e359 = i_4;
            i_4 = (_e359 + 1i);
        }
    }
    let _e430 = lat;
    pol = smoothstep(0.85f, 1.25f, abs(_e430));
    let _e434 = global.uHexagon;
    let _e437 = lat;
    if ((_e434 > 0.5f) && (_e437 > 1.2f)) {
        {
            let _e441 = lon;
            let _e442 = global.uGiantTime;
            a_2 = (_e441 + (_e442 * 0.00002f));
            let _e448 = a_2;
            hex = ((cos((3f * _e448)) * 0.5f) + 0.5f);
            let _e458 = lat;
            let _e461 = hex;
            edge = smoothstep(0.02f, 0f, abs((_e458 - (1.36f - (0.03f * _e461)))));
            let _e468 = col;
            let _e469 = global.uPolar;
            let _e472 = edge;
            col = mix(_e468, (_e469 * 1.3f), vec3((_e472 * 0.7f)));
        }
    }
    let _e477 = col;
    let _e478 = global.uPolar;
    let _e479 = pol;
    col = mix(_e477, _e478, vec3((_e479 * 0.75f)));
    let _e484 = col;
    return _e484;
}

fn ringHash(x: f32) -> f32 {
    var x_1: f32;

    x_1 = x;
    let _e49 = x_1;
    let _e52 = global.uRingShape;
    return fract((sin(((_e49 * 127.1f) + _e52.w)) * 43758.547f));
}

fn ringNoise1_(x_2: f32) -> f32 {
    var x_3: f32;
    var i_5: f32;
    var f_2: f32;

    x_3 = x_2;
    let _e49 = x_3;
    i_5 = floor(_e49);
    let _e52 = x_3;
    f_2 = fract(_e52);
    let _e55 = i_5;
    let _e56 = ringHash(_e55);
    let _e57 = i_5;
    let _e60 = ringHash((_e57 + 1f));
    let _e63 = f_2;
    return mix(_e56, _e60, smoothstep(0f, 1f, _e63));
}

fn ringDensity(r_1: f32) -> f32 {
    var r_2: f32;
    var t_3: f32;
    var d_2: f32;
    var i_6: i32 = 0i;
    var g: f32;
    var wdt: f32;

    r_2 = r_1;
    let _e49 = r_2;
    let _e50 = global.uRingShape;
    let _e53 = global.uRingShape;
    let _e55 = global.uRingShape;
    t_3 = ((_e49 - _e50.x) / (_e53.y - _e55.x));
    let _e60 = t_3;
    let _e63 = t_3;
    if ((_e60 < 0f) || (_e63 > 1f)) {
        return 0f;
    }
    let _e70 = t_3;
    let _e73 = ringNoise1_((_e70 * 13f));
    let _e77 = t_3;
    let _e80 = ringNoise1_((_e77 * 61f));
    let _e84 = t_3;
    let _e87 = ringNoise1_((_e84 * 233f));
    d_2 = (((0.55f + (0.25f * _e73)) + (0.15f * _e80)) + (0.1f * _e87));
    let _e91 = d_2;
    let _e94 = t_3;
    let _e98 = t_3;
    d_2 = (_e91 * (smoothstep(0f, 0.06f, _e94) * smoothstep(1f, 0.9f, _e98)));
    let _e102 = d_2;
    let _e107 = t_3;
    d_2 = (_e102 * mix(0.35f, 1f, smoothstep(0.1f, 0.3f, _e107)));
    loop {
        let _e113 = i_6;
        if !((_e113 < 4i)) {
            break;
        }
        {
            let _e120 = i_6;
            let _e122 = global.uRingShape;
            if (f32(_e120) >= _e122.z) {
                break;
            }
            let _e127 = i_6;
            let _e133 = ringHash(((f32(_e127) * 7.3f) + 1f));
            g = (0.35f + (0.55f * _e133));
            let _e139 = i_6;
            let _e145 = ringHash(((f32(_e139) * 3.1f) + 2f));
            wdt = (0.004f + (0.02f * _e145));
            let _e149 = d_2;
            let _e150 = wdt;
            let _e153 = wdt;
            let _e154 = t_3;
            let _e155 = g;
            d_2 = (_e149 * smoothstep((_e150 * 0.5f), _e153, abs((_e154 - _e155))));
        }
        continuing {
            let _e117 = i_6;
            i_6 = (_e117 + 1i);
        }
    }
    let _e160 = d_2;
    return clamp(_e160, 0f, 1f);
}

fn main_1() {
    var N: vec3<f32>;
    var rel: vec3<f32>;
    var dist: f32;
    var detail_2: f32;
    var bs: f32;
    var col_1: vec3<f32>;
    var muS: f32;
    var sunT: f32 = 1f;
    var pf: vec3<f32>;
    var sf: vec3<f32>;
    var t_4: f32;
    var rr: f32;

    let _e47 = vNormalW_1;
    N = normalize(_e47);
    let _e50 = vWorld_1;
    let _e51 = global.uCenter;
    rel = (_e50 - _e51);
    let _e54 = vWorld_1;
    dist = length(_e54);
    let _e59 = global.uRadius;
    let _e62 = global.uRadius;
    let _e65 = dist;
    detail_2 = (2f * (1f - smoothstep((_e59 * 0.5f), (_e62 * 6f), _e65)));
    let _e71 = vObj_1;
    let _e73 = detail_2;
    let _e76 = giantColor(normalize(_e71), _e73, (&bs));
    col_1 = _e76;
    let _e78 = N;
    let _e79 = global.uSunDir;
    muS = dot(_e78, _e79);
    let _e84 = global.uRingParams;
    if (_e84.z > 0f) {
        {
            let _e88 = global.uToFixed;
            let _e89 = rel;
            pf = (_e88 * _e89);
            let _e92 = global.uToFixed;
            let _e93 = global.uSunDir;
            sf = (_e92 * _e93);
            let _e96 = sf;
            if (abs(_e96.y) > 0.0001f) {
                {
                    let _e101 = pf;
                    let _e104 = sf;
                    t_4 = (-(_e101.y) / _e104.y);
                    let _e108 = t_4;
                    if (_e108 > 0f) {
                        {
                            let _e111 = pf;
                            let _e112 = sf;
                            let _e113 = t_4;
                            rr = length((_e111 + (_e112 * _e113)).xz);
                            let _e119 = rr;
                            let _e120 = global.uRingParams;
                            let _e123 = rr;
                            let _e124 = global.uRingParams;
                            if ((_e119 > _e120.x) && (_e123 < _e124.y)) {
                                let _e128 = sunT;
                                let _e131 = rr;
                                let _e132 = ringDensity(_e131);
                                let _e134 = global.uRingParams;
                                sunT = (_e128 * (1f - ((0.85f * _e132) * _e134.z)));
                            }
                        }
                    }
                }
            }
        }
    }
    let _e139 = col_1;
    let _e140 = N;
    materialOutput(_e139, _e140, 0.9f, 1f, 0f, 0f, 0f);
    let _e147 = sunT;
    gEmission.w = -(_e147);
    return;
}

@fragment 
fn main(@location(0) vObj: vec3<f32>, @location(1) vWorld: vec3<f32>, @location(2) vNormalW: vec3<f32>) -> FragmentOutput {
    vObj_1 = vObj;
    vWorld_1 = vWorld;
    vNormalW_1 = vNormalW;
    main_1();
    let _e63 = gAlbedo;
    let _e65 = gNormal;
    let _e67 = gEmission;
    let _e69 = gSurface;
    return FragmentOutput(_e63, _e65, _e67, _e69);
}
`;
