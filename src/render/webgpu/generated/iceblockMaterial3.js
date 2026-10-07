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
    let _e40 = p_1;
    let _e42 = period_1;
    let _e46 = textureSampleLevel(tDetailTexture, tDetailSampler, (_e40.yz / vec2(_e42)), 0f);
    let _e47 = w_1;
    let _e50 = p_1;
    let _e52 = period_1;
    let _e59 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e50.zx / vec2(_e52)) + vec2(0.37f)), 0f);
    let _e60 = w_1;
    let _e64 = p_1;
    let _e66 = period_1;
    let _e73 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e64.xy / vec2(_e66)) + vec2(0.71f)), 0f);
    let _e74 = w_1;
    return (((_e46 * _e47.x) + (_e59 * _e60.y)) + (_e73 * _e74.z));
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

    let _e34 = vWorld_1;
    let _e35 = fwidth(_e34);
    foot = length(_e35);
    let _e38 = vWorld_1;
    let _e39 = global.uCenter;
    rel = (_e38 - _e39);
    let _e42 = rel;
    r = length(_e42);
    let _e45 = rel;
    let _e46 = r;
    up = (_e45 / vec3(_e46));
    let _e50 = vN_1;
    N = normalize(_e50);
    let _e53 = up;
    let _e54 = global.uSunDir;
    muS = dot(_e53, _e54);
    let _e57 = vFp_1;
    upF = normalize(_e57);
    let _e60 = upF;
    w_2 = pow(abs(_e60), vec3(4f));
    let _e66 = w_2;
    let _e67 = w_2;
    let _e69 = w_2;
    let _e72 = w_2;
    w_2 = (_e66 / vec3(((_e67.x + _e69.y) + _e72.z)));
    let _e77 = vFp_1;
    let _e78 = w_2;
    let _e80 = tri(_e77, _e78, 512f);
    dI = _e80;
    let _e82 = vFp_1;
    let _e83 = w_2;
    let _e85 = tri(_e82, _e83, 64f);
    dJ = _e85;
    let _e87 = global.uSeason;
    if (_e87.z > 0.5f) {
        let _e91 = upF;
        let _e92 = seaMeanT(_e91);
        let _e93 = upF;
        let _e94 = seasonIceNow(_e93);
        local_4 = (_e92 + _e94);
    } else {
        local_4 = -10f;
    }
    let _e99 = local_4;
    Tair_2 = _e99;
    let _e101 = global.uSeason;
    if (_e101.z > 0.5f) {
        let _e108 = Tair_2;
        local_5 = smoothstep(-1f, 2f, _e108);
    } else {
        local_5 = 0f;
    }
    let _e112 = local_5;
    thaw = _e112;
    let _e116 = vAux_1;
    let _e118 = dJ;
    let _e128 = thaw;
    snowy = (smoothstep(0.3f, 0.7f, (_e116.x + ((_e118.w - 0.5f) * 0.25f))) * (1f - (0.7f * _e128)));
    let _e141 = snowy;
    let _e146 = dI;
    alb = (mix(vec3<f32>(0.42f, 0.52f, 0.6f), vec3<f32>(0.82f, 0.86f, 0.9f), vec3(_e141)) * (0.9f + (0.2f * _e146.x)));
    let _e152 = vAux_1;
    let _e156 = global.uSeason;
    if ((_e152.w < 0.25f) && (_e156.z > 0.5f)) {
        let _e161 = Tair_2;
        let _e162 = dJ;
        let _e166 = vFp_1;
        let _e167 = w_2;
        let _e169 = tri(_e166, _e167, 8f);
        let _e174 = meltPond(_e161, ((_e162.x * 0.6f) + (_e169.x * 0.4f)));
        local_6 = _e174;
    } else {
        local_6 = 0f;
    }
    let _e177 = local_6;
    pond = _e177;
    let _e179 = alb;
    let _e184 = pond;
    alb = mix(_e179, vec3<f32>(0.12f, 0.32f, 0.45f), vec3(_e184));
    let _e187 = vAux_1;
    berg = (_e187.w > 2.5f);
    let _e192 = vAux_1;
    block = (_e192.w > 1.5f);
    let _e197 = vAux_1;
    let _e201 = block;
    wall = ((_e197.w > 0.75f) && !(_e201));
    let _e205 = vAux_1;
    let _e209 = vAux_1;
    sail = ((_e205.w > 0.25f) && (_e209.w < 0.75f));
    let _e215 = wall;
    if _e215 {
        let _e220 = alb;
        let _e223 = vAux_1;
        let _e225 = vAux_1;
        alb = mix(vec3<f32>(0.3f, 0.46f, 0.58f), _e220, vec3(smoothstep(0.35f, 0.65f, (_e223.z / max(_e225.y, 0.01f)))));
    }
    let _e233 = sail;
    if _e233 {
        let _e244 = vFp_1;
        let _e245 = w_2;
        let _e247 = tri(_e244, _e245, 2f);
        alb = mix(vec3<f32>(0.5f, 0.62f, 0.7f), vec3<f32>(0.85f, 0.88f, 0.92f), vec3(smoothstep(0.35f, 0.6f, _e247.x)));
    }
    let _e252 = block;
    if _e252 {
        let _e259 = vFp_1;
        let _e260 = w_2;
        let _e262 = tri(_e259, _e260, 1f);
        let _e273 = vN_1;
        let _e275 = up;
        alb = mix((vec3<f32>(0.32f, 0.52f, 0.6f) * (0.85f + (0.3f * _e262.x))), vec3<f32>(0.86f, 0.89f, 0.93f), vec3(smoothstep(0.45f, 0.75f, dot(normalize(_e273), _e275))));
    }
    let _e280 = berg;
    if _e280 {
        {
            let _e281 = r;
            let _e282 = global.uRadius;
            hw = (_e281 - _e282);
            let _e288 = vN_1;
            let _e290 = up;
            side = (1f - smoothstep(0.35f, 0.75f, dot(normalize(_e288), _e290)));
            let _e297 = hw;
            let _e300 = vFp_1;
            let _e301 = w_2;
            let _e303 = tri(_e300, _e301, 64f);
            band = (0.5f + (0.5f * sin(((_e297 * 1.7f) + ((_e303.x - 0.5f) * 9f)))));
            let _e317 = hw;
            notch = (1f - smoothstep(0.2f, 1.2f, _e317));
            let _e331 = vFp_1;
            let _e332 = w_2;
            let _e334 = tri(_e331, _e332, 8f);
            let _e341 = band;
            let _e346 = side;
            alb = mix(vec3<f32>(0.88f, 0.91f, 0.95f), ((vec3<f32>(0.55f, 0.72f, 0.84f) * (0.9f + (0.2f * _e334.x))) * mix(1f, 0.75f, (_e341 * 0.8f))), vec3(_e346));
            let _e349 = alb;
            let _e354 = notch;
            let _e355 = side;
            alb = mix(_e349, vec3<f32>(0.25f, 0.45f, 0.6f), vec3(((_e354 * _e355) * 0.8f)));
        }
    }
    let _e361 = global.uToFixed;
    let _e362 = rel;
    pF = (_e361 * _e362);
    let _e365 = up;
    let _e366 = N;
    let _e367 = wall;
    let _e368 = sail;
    let _e370 = block;
    if ((_e367 || _e368) || _e370) {
        local_7 = 1f;
    } else {
        local_7 = 0.5f;
    }
    let _e375 = local_7;
    N2_ = normalize(mix(_e365, _e366, vec3(_e375)));
    let _e380 = berg;
    if _e380 {
        {
            let _e381 = vFp_1;
            let _e382 = w_2;
            let _e384 = tri(_e381, _e382, 8f);
            b1_ = _e384;
            let _e386 = vFp_1;
            let _e387 = w_2;
            let _e389 = tri(_e386, _e387, 2f);
            b2_ = _e389;
            let _e391 = N2_;
            let _e392 = N2_;
            if (abs(_e392.y) < 0.9f) {
                local_8 = vec3<f32>(0f, 1f, 0f);
            } else {
                local_8 = vec3<f32>(1f, 0f, 0f);
            }
            let _e406 = local_8;
            t1_ = normalize(cross(_e391, _e406));
            let _e410 = N2_;
            let _e411 = t1_;
            t2_ = cross(_e410, _e411);
            let _e414 = N2_;
            let _e415 = b1_;
            let _e419 = t1_;
            let _e421 = b1_;
            let _e425 = t2_;
            let _e431 = b2_;
            let _e435 = t1_;
            let _e437 = b2_;
            let _e441 = t2_;
            let _e449 = foot;
            N2_ = normalize(((_e414 + ((((_e415.y - 0.5f) * _e419) + ((_e421.z - 0.5f) * _e425)) * 0.9f)) + (((((_e431.y - 0.5f) * _e435) + ((_e437.z - 0.5f) * _e441)) * 0.5f) * (1f - smoothstep(0.3f, 3f, _e449)))));
        }
    }
    let _e455 = wall;
    let _e456 = sail;
    let _e458 = block;
    if !(((_e455 || _e456) || _e458)) {
        {
            let _e461 = vFp_1;
            let _e462 = w_2;
            let _e464 = tri(_e461, _e462, 2f);
            s1_ = _e464;
            let _e466 = vFp_1;
            let _e467 = w_2;
            let _e469 = tri(_e466, _e467, 8f);
            s2_ = _e469;
            let _e471 = up;
            let _e476 = up;
            t1_1 = normalize(cross(_e471, (vec3<f32>(0f, 1f, 0f) + (_e476 * 0.01f))));
            let _e483 = up;
            let _e484 = t1_1;
            t2_1 = cross(_e483, _e484);
            let _e487 = N2_;
            let _e488 = s1_;
            let _e492 = t1_1;
            let _e494 = s1_;
            let _e498 = t2_1;
            let _e506 = foot;
            let _e511 = s2_;
            let _e515 = t1_1;
            let _e517 = s2_;
            let _e521 = t2_1;
            let _e529 = foot;
            N2_ = normalize(((_e487 + (((((_e488.y - 0.5f) * _e492) + ((_e494.z - 0.5f) * _e498)) * 0.35f) * (1f - smoothstep(0.2f, 2f, _e506)))) + (((((_e511.y - 0.5f) * _e515) + ((_e517.z - 0.5f) * _e521)) * 0.25f) * (1f - smoothstep(1f, 8f, _e529)))));
        }
    }
    let _e535 = alb;
    let _e536 = N2_;
    let _e539 = snowy;
    let _e543 = pond;
    materialOutput(_e535, _e536, mix(0.22f, 0.7f, _e539), 1f, 0f, _e543, 0.02f);
    return;
}

@fragment 
fn main(@location(0) vWorld: vec3<f32>, @location(1) vN: vec3<f32>, @location(2) vFp: vec3<f32>, @location(3) vAux: vec4<f32>) -> FragmentOutput {
    vWorld_1 = vWorld;
    vN_1 = vN;
    vFp_1 = vFp;
    vAux_1 = vAux;
    main_1();
    let _e67 = gAlbedo;
    let _e69 = gNormal;
    let _e71 = gEmission;
    let _e73 = gSurface;
    return FragmentOutput(_e67, _e69, _e71, _e73);
}
`;
