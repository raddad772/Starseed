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
      "name": "uSeason",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 96
    }
  ],
  "textures": [
    {
      "name": "tDetail",
      "type": "sampler2D",
      "count": 0,
      "binding": 1,
      "samplerBinding": 2
    },
    {
      "name": "tSeasonMap",
      "type": "sampler2D",
      "count": 0,
      "binding": 3,
      "samplerBinding": 4
    },
    {
      "name": "tSeasonIce",
      "type": "sampler2D",
      "count": 0,
      "binding": 5,
      "samplerBinding": 6
    }
  ],
  "bytes": 112,
  "group": 1,
  "attributes": []
};
export const code = /* wgsl */`
struct Params {
    uBodyIndex: f32,
    uSunDir: vec3<f32>,
    uCenter: vec3<f32>,
    uRadius: f32,
    uToFixed: mat3x3<f32>,
    uSeason: vec4<f32>,
}

struct FragmentOutput {
    @location(0) gAlbedo: vec4<f32>,
    @location(1) gNormal: vec4<f32>,
    @location(2) gEmission: vec4<f32>,
    @location(3) gSurface: vec4<f32>,
}

const PI: f32 = 3.1415927f;
const FROST_NL: f32 = 180f;
const FROST_NT: f32 = 9f;
const FROST_TILT0_: f32 = -40f;
const FROST_DTILT: f32 = 10f;
const SNOW_DEPTH_PER_MM: f32 = 0.003333f;
const DDF_SNOW: f32 = 4f;
const HC_N: array<vec3<f32>, 6> = array<vec3<f32>, 6>(vec3<f32>(1f, 0f, 0f), vec3<f32>(-1f, 0f, 0f), vec3<f32>(0f, 1f, 0f), vec3<f32>(0f, -1f, 0f), vec3<f32>(0f, 0f, 1f), vec3<f32>(0f, 0f, -1f));
const HC_U: array<vec3<f32>, 6> = array<vec3<f32>, 6>(vec3<f32>(0f, 0f, -1f), vec3<f32>(0f, 0f, 1f), vec3<f32>(1f, 0f, 0f), vec3<f32>(1f, 0f, 0f), vec3<f32>(1f, 0f, 0f), vec3<f32>(-1f, 0f, 0f));
const HC_V: array<vec3<f32>, 6> = array<vec3<f32>, 6>(vec3<f32>(0f, 1f, 0f), vec3<f32>(0f, 1f, 0f), vec3<f32>(0f, 0f, -1f), vec3<f32>(0f, 0f, 1f), vec3<f32>(0f, 1f, 0f), vec3<f32>(0f, 1f, 0f));

@group(1) @binding(0) 
var<uniform> global: Params;
@group(1) @binding(1) 
var tDetailTexture: texture_2d<f32>;
@group(1) @binding(2) 
var tDetailSampler: sampler;
@group(1) @binding(3) 
var tSeasonMapTexture: texture_2d<f32>;
@group(1) @binding(4) 
var tSeasonMapSampler: sampler;
@group(1) @binding(5) 
var tSeasonIceTexture: texture_2d<f32>;
@group(1) @binding(6) 
var tSeasonIceSampler: sampler;
var<private> gAlbedo: vec4<f32>;
var<private> gNormal: vec4<f32>;
var<private> gEmission: vec4<f32>;
var<private> gSurface: vec4<f32>;
var<private> vWorld_1: vec3<f32>;
var<private> vN_1: vec3<f32>;
var<private> vFp_1: vec3<f32>;
var<private> vAux_1: vec4<f32>;
var<private> cloudDirZ: f32 = 1f;
var<private> cloudTotZ: f32 = 1f;

fn octEncode(n: vec3<f32>) -> vec2<f32> {
    var n_1: vec3<f32>;
    var local: f32;
    var local_1: f32;
    var local_2: vec2<f32>;

    n_1 = n;
    let _e25 = n_1;
    let _e26 = n_1;
    let _e29 = n_1;
    let _e33 = n_1;
    n_1 = (_e25 / vec3(((abs(_e26.x) + abs(_e29.y)) + abs(_e33.z))));
    let _e39 = n_1;
    if (_e39.z >= 0f) {
        let _e43 = n_1;
        local_2 = _e43.xy;
    } else {
        let _e46 = n_1;
        let _e51 = n_1;
        if (_e51.x >= 0f) {
            local = 1f;
        } else {
            local = -1f;
        }
        let _e59 = local;
        let _e60 = n_1;
        if (_e60.y >= 0f) {
            local_1 = 1f;
        } else {
            local_1 = -1f;
        }
        let _e68 = local_1;
        local_2 = ((vec2(1f) - abs(_e46.yx)) * vec2<f32>(_e59, _e68));
    }
    let _e72 = local_2;
    return _e72;
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
    let _e37 = albedo_1;
    let _e42 = clamp(_e37, vec3(0f), vec3(1f));
    let _e43 = ao_1;
    gAlbedo = vec4<f32>(_e42.x, _e42.y, _e42.z, clamp(_e43, 0f, 1f));
    let _e51 = normal_1;
    let _e53 = octEncode(normalize(_e51));
    let _e54 = roughness_1;
    let _e55 = global.uBodyIndex;
    gNormal = vec4<f32>(_e53.x, _e53.y, _e54, _e55);
    gEmission = vec4<f32>(0f, 0f, 0f, 1f);
    let _e64 = trans_1;
    let _e65 = wet_1;
    let _e67 = F0_1;
    gSurface = vec4<f32>(_e64, _e65, 0f, _e67);
    return;
}

fn seasonIceNow(dirF: vec3<f32>) -> f32 {
    var dirF_1: vec3<f32>;
    var m: vec4<f32>;

    dirF_1 = dirF;
    let _e29 = dirF_1;
    let _e31 = dirF_1;
    let _e38 = dirF_1;
    let _e51 = textureSampleLevel(tSeasonIceTexture, tSeasonIceSampler, vec2<f32>(((atan2(_e29.z, _e31.x) / 6.28319f) + 0.5f), ((asin(clamp(_e38.y, -1f, 1f)) / 3.14159f) + 0.5f)), 0f);
    m = _e51;
    let _e53 = m;
    let _e59 = m;
    let _e65 = global.uSeason;
    let _e70 = m;
    let _e76 = global.uSeason;
    return ((((_e53.z - 0.5f) * 100f) + (((_e59.x - 0.5f) * 100f) * cos(_e65.x))) + (((_e70.y - 0.5f) * 100f) * sin(_e76.x)));
}

fn meltPond(Tair: f32, n_2: f32) -> f32 {
    var Tair_1: f32;
    var n_3: f32;
    var f: f32;
    var local_3: f32;

    Tair_1 = Tair;
    n_3 = n_2;
    let _e35 = Tair_1;
    f = (0.45f * smoothstep(-0.5f, 4f, _e35));
    let _e39 = f;
    if (_e39 > 0f) {
        let _e43 = f;
        let _e46 = f;
        let _e49 = n_3;
        local_3 = (1f - smoothstep((_e43 - 0.06f), (_e46 + 0.06f), _e49));
    } else {
        local_3 = 0f;
    }
    let _e54 = local_3;
    return _e54;
}

fn seaMeanT(dirF_2: vec3<f32>) -> f32 {
    var dirF_3: vec3<f32>;

    dirF_3 = dirF_2;
    let _e29 = dirF_3;
    let _e31 = dirF_3;
    let _e38 = dirF_3;
    let _e51 = textureSampleLevel(tSeasonMapTexture, tSeasonMapSampler, vec2<f32>(((atan2(_e29.z, _e31.x) / 6.28319f) + 0.5f), ((asin(clamp(_e38.y, -1f, 1f)) / 3.14159f) + 0.5f)), 0f);
    return ((_e51.w * 120f) - 60f);
}

fn tri(p: vec3<f32>, w: vec3<f32>, period: f32) -> vec4<f32> {
    var p_1: vec3<f32>;
    var w_1: vec3<f32>;
    var period_1: f32;

    p_1 = p;
    w_1 = w;
    period_1 = period;
    let _e44 = p_1;
    let _e46 = period_1;
    let _e50 = textureSampleLevel(tDetailTexture, tDetailSampler, (_e44.yz / vec2(_e46)), 0f);
    let _e51 = w_1;
    let _e54 = p_1;
    let _e56 = period_1;
    let _e63 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e54.zx / vec2(_e56)) + vec2(0.37f)), 0f);
    let _e64 = w_1;
    let _e68 = p_1;
    let _e70 = period_1;
    let _e77 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e68.xy / vec2(_e70)) + vec2(0.71f)), 0f);
    let _e78 = w_1;
    return (((_e50 * _e51.x) + (_e63 * _e64.y)) + (_e77 * _e78.z));
}

fn main_1() {
    var foot: f32;
    var rel: vec3<f32>;
    var r: f32;
    var up: vec3<f32>;
    var N: vec3<f32>;
    var muS: f32;
    var upF: vec3<f32>;
    var w_2: vec3<f32>;
    var dI: vec4<f32>;
    var dJ: vec4<f32>;
    var local_4: f32;
    var Tair_2: f32;
    var local_5: f32;
    var thaw: f32;
    var snowy: f32;
    var alb: vec3<f32>;
    var local_6: f32;
    var pond: f32;
    var berg: bool;
    var block: bool;
    var wall: bool;
    var sail: bool;
    var hw: f32;
    var side: f32;
    var band: f32;
    var notch: f32;
    var pF: vec3<f32>;
    var local_7: f32;
    var N2_: vec3<f32>;
    var b1_: vec4<f32>;
    var b2_: vec4<f32>;
    var local_8: vec3<f32>;
    var t1_: vec3<f32>;
    var t2_: vec3<f32>;
    var s1_: vec4<f32>;
    var s2_: vec4<f32>;
    var t1_1: vec3<f32>;
    var t2_1: vec3<f32>;

    let _e38 = vWorld_1;
    let _e39 = fwidth(_e38);
    foot = length(_e39);
    let _e42 = vWorld_1;
    let _e43 = global.uCenter;
    rel = (_e42 - _e43);
    let _e46 = rel;
    r = length(_e46);
    let _e49 = rel;
    let _e50 = r;
    up = (_e49 / vec3(_e50));
    let _e54 = vN_1;
    N = normalize(_e54);
    let _e57 = up;
    let _e58 = global.uSunDir;
    muS = dot(_e57, _e58);
    let _e61 = vFp_1;
    upF = normalize(_e61);
    let _e64 = upF;
    w_2 = pow(abs(_e64), vec3(4f));
    let _e70 = w_2;
    let _e71 = w_2;
    let _e73 = w_2;
    let _e76 = w_2;
    w_2 = (_e70 / vec3(((_e71.x + _e73.y) + _e76.z)));
    let _e81 = vFp_1;
    let _e82 = w_2;
    let _e84 = tri(_e81, _e82, 512f);
    dI = _e84;
    let _e86 = vFp_1;
    let _e87 = w_2;
    let _e89 = tri(_e86, _e87, 64f);
    dJ = _e89;
    let _e91 = global.uSeason;
    if (_e91.z > 0.5f) {
        let _e95 = upF;
        let _e96 = seaMeanT(_e95);
        let _e97 = upF;
        let _e98 = seasonIceNow(_e97);
        local_4 = (_e96 + _e98);
    } else {
        local_4 = -10f;
    }
    let _e103 = local_4;
    Tair_2 = _e103;
    let _e105 = global.uSeason;
    if (_e105.z > 0.5f) {
        let _e112 = Tair_2;
        local_5 = smoothstep(-1f, 2f, _e112);
    } else {
        local_5 = 0f;
    }
    let _e116 = local_5;
    thaw = _e116;
    let _e120 = vAux_1;
    let _e122 = dJ;
    let _e132 = thaw;
    snowy = (smoothstep(0.3f, 0.7f, (_e120.x + ((_e122.w - 0.5f) * 0.25f))) * (1f - (0.7f * _e132)));
    let _e145 = snowy;
    let _e150 = dI;
    alb = (mix(vec3<f32>(0.42f, 0.52f, 0.6f), vec3<f32>(0.82f, 0.86f, 0.9f), vec3(_e145)) * (0.9f + (0.2f * _e150.x)));
    let _e156 = vAux_1;
    let _e160 = global.uSeason;
    if ((_e156.w < 0.25f) && (_e160.z > 0.5f)) {
        let _e165 = Tair_2;
        let _e166 = dJ;
        let _e170 = vFp_1;
        let _e171 = w_2;
        let _e173 = tri(_e170, _e171, 8f);
        let _e178 = meltPond(_e165, ((_e166.x * 0.6f) + (_e173.x * 0.4f)));
        local_6 = _e178;
    } else {
        local_6 = 0f;
    }
    let _e181 = local_6;
    pond = _e181;
    let _e183 = alb;
    let _e188 = pond;
    alb = mix(_e183, vec3<f32>(0.12f, 0.32f, 0.45f), vec3(_e188));
    let _e191 = vAux_1;
    berg = (_e191.w > 2.5f);
    let _e196 = vAux_1;
    block = (_e196.w > 1.5f);
    let _e201 = vAux_1;
    let _e205 = block;
    wall = ((_e201.w > 0.75f) && !(_e205));
    let _e209 = vAux_1;
    let _e213 = vAux_1;
    sail = ((_e209.w > 0.25f) && (_e213.w < 0.75f));
    let _e219 = wall;
    if _e219 {
        let _e224 = alb;
        let _e227 = vAux_1;
        let _e229 = vAux_1;
        alb = mix(vec3<f32>(0.3f, 0.46f, 0.58f), _e224, vec3(smoothstep(0.35f, 0.65f, (_e227.z / max(_e229.y, 0.01f)))));
    }
    let _e237 = sail;
    if _e237 {
        let _e248 = vFp_1;
        let _e249 = w_2;
        let _e251 = tri(_e248, _e249, 2f);
        alb = mix(vec3<f32>(0.5f, 0.62f, 0.7f), vec3<f32>(0.85f, 0.88f, 0.92f), vec3(smoothstep(0.35f, 0.6f, _e251.x)));
    }
    let _e256 = block;
    if _e256 {
        let _e263 = vFp_1;
        let _e264 = w_2;
        let _e266 = tri(_e263, _e264, 1f);
        let _e277 = vN_1;
        let _e279 = up;
        alb = mix((vec3<f32>(0.32f, 0.52f, 0.6f) * (0.85f + (0.3f * _e266.x))), vec3<f32>(0.86f, 0.89f, 0.93f), vec3(smoothstep(0.45f, 0.75f, dot(normalize(_e277), _e279))));
    }
    let _e284 = berg;
    if _e284 {
        {
            let _e285 = r;
            let _e286 = global.uRadius;
            hw = (_e285 - _e286);
            let _e292 = vN_1;
            let _e294 = up;
            side = (1f - smoothstep(0.35f, 0.75f, dot(normalize(_e292), _e294)));
            let _e301 = hw;
            let _e304 = vFp_1;
            let _e305 = w_2;
            let _e307 = tri(_e304, _e305, 64f);
            band = (0.5f + (0.5f * sin(((_e301 * 1.7f) + ((_e307.x - 0.5f) * 9f)))));
            let _e321 = hw;
            notch = (1f - smoothstep(0.2f, 1.2f, _e321));
            let _e335 = vFp_1;
            let _e336 = w_2;
            let _e338 = tri(_e335, _e336, 8f);
            let _e345 = band;
            let _e350 = side;
            alb = mix(vec3<f32>(0.88f, 0.91f, 0.95f), ((vec3<f32>(0.55f, 0.72f, 0.84f) * (0.9f + (0.2f * _e338.x))) * mix(1f, 0.75f, (_e345 * 0.8f))), vec3(_e350));
            let _e353 = alb;
            let _e358 = notch;
            let _e359 = side;
            alb = mix(_e353, vec3<f32>(0.25f, 0.45f, 0.6f), vec3(((_e358 * _e359) * 0.8f)));
        }
    }
    let _e365 = global.uToFixed;
    let _e366 = rel;
    pF = (_e365 * _e366);
    let _e369 = up;
    let _e370 = N;
    let _e371 = wall;
    let _e372 = sail;
    let _e374 = block;
    if ((_e371 || _e372) || _e374) {
        local_7 = 1f;
    } else {
        local_7 = 0.5f;
    }
    let _e379 = local_7;
    N2_ = normalize(mix(_e369, _e370, vec3(_e379)));
    let _e384 = berg;
    if _e384 {
        {
            let _e385 = vFp_1;
            let _e386 = w_2;
            let _e388 = tri(_e385, _e386, 8f);
            b1_ = _e388;
            let _e390 = vFp_1;
            let _e391 = w_2;
            let _e393 = tri(_e390, _e391, 2f);
            b2_ = _e393;
            let _e395 = N2_;
            let _e396 = N2_;
            if (abs(_e396.y) < 0.9f) {
                local_8 = vec3<f32>(0f, 1f, 0f);
            } else {
                local_8 = vec3<f32>(1f, 0f, 0f);
            }
            let _e410 = local_8;
            t1_ = normalize(cross(_e395, _e410));
            let _e414 = N2_;
            let _e415 = t1_;
            t2_ = cross(_e414, _e415);
            let _e418 = N2_;
            let _e419 = b1_;
            let _e423 = t1_;
            let _e425 = b1_;
            let _e429 = t2_;
            let _e435 = b2_;
            let _e439 = t1_;
            let _e441 = b2_;
            let _e445 = t2_;
            let _e453 = foot;
            N2_ = normalize(((_e418 + ((((_e419.y - 0.5f) * _e423) + ((_e425.z - 0.5f) * _e429)) * 0.9f)) + (((((_e435.y - 0.5f) * _e439) + ((_e441.z - 0.5f) * _e445)) * 0.5f) * (1f - smoothstep(0.3f, 3f, _e453)))));
        }
    }
    let _e459 = wall;
    let _e460 = sail;
    let _e462 = block;
    if !(((_e459 || _e460) || _e462)) {
        {
            let _e465 = vFp_1;
            let _e466 = w_2;
            let _e468 = tri(_e465, _e466, 2f);
            s1_ = _e468;
            let _e470 = vFp_1;
            let _e471 = w_2;
            let _e473 = tri(_e470, _e471, 8f);
            s2_ = _e473;
            let _e475 = up;
            let _e480 = up;
            t1_1 = normalize(cross(_e475, (vec3<f32>(0f, 1f, 0f) + (_e480 * 0.01f))));
            let _e487 = up;
            let _e488 = t1_1;
            t2_1 = cross(_e487, _e488);
            let _e491 = N2_;
            let _e492 = s1_;
            let _e496 = t1_1;
            let _e498 = s1_;
            let _e502 = t2_1;
            let _e510 = foot;
            let _e515 = s2_;
            let _e519 = t1_1;
            let _e521 = s2_;
            let _e525 = t2_1;
            let _e533 = foot;
            N2_ = normalize(((_e491 + (((((_e492.y - 0.5f) * _e496) + ((_e498.z - 0.5f) * _e502)) * 0.35f) * (1f - smoothstep(0.2f, 2f, _e510)))) + (((((_e515.y - 0.5f) * _e519) + ((_e521.z - 0.5f) * _e525)) * 0.25f) * (1f - smoothstep(1f, 8f, _e533)))));
        }
    }
    let _e539 = alb;
    let _e540 = N2_;
    let _e543 = snowy;
    let _e547 = pond;
    materialOutput(_e539, _e540, mix(0.22f, 0.7f, _e543), 1f, 0f, _e547, 0.02f);
    return;
}

@fragment 
fn main(@location(0) vWorld: vec3<f32>, @location(1) vN: vec3<f32>, @location(2) vFp: vec3<f32>, @location(3) vAux: vec4<f32>) -> FragmentOutput {
    vWorld_1 = vWorld;
    vN_1 = vN;
    vFp_1 = vFp;
    vAux_1 = vAux;
    main_1();
    let _e75 = gAlbedo;
    let _e77 = gNormal;
    let _e79 = gEmission;
    let _e81 = gSurface;
    return FragmentOutput(_e75, _e77, _e79, _e81);
}
`;
