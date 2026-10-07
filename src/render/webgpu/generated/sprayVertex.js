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
      "name": "uFall1",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 192
    },
    {
      "name": "uFall2",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 208
    },
    {
      "name": "uTime",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 224
    },
    {
      "name": "uPixH",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 228
    },
    {
      "name": "uSunDir",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 240
    },
    {
      "name": "uSunE",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 256
    },
    {
      "name": "uMoonDir",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 272
    },
    {
      "name": "uMoonE",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 288
    },
    {
      "name": "uCenter",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 304
    },
    {
      "name": "uHasAtmo",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 316
    },
    {
      "name": "uBottom",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 320
    },
    {
      "name": "uTop",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 324
    },
    {
      "name": "uGround",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 328
    },
    {
      "name": "uTrueK",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 332
    },
    {
      "name": "uSunLift",
      "type": "vec2",
      "count": 0,
      "align": 8,
      "size": 8,
      "stride": 8,
      "offset": 336
    }
  ],
  "textures": [
    {
      "name": "tTrans",
      "type": "sampler2D",
      "count": 0,
      "binding": 1,
      "samplerBinding": 2
    },
    {
      "name": "tIrr",
      "type": "sampler2D",
      "count": 0,
      "binding": 3,
      "samplerBinding": 4
    }
  ],
  "bytes": 352,
  "group": 0,
  "attributes": [
    {
      "name": "position",
      "type": "vec3",
      "location": 0
    },
    {
      "name": "uv",
      "type": "vec2",
      "location": 1
    },
    {
      "name": "aFoot",
      "type": "vec3",
      "location": 2
    },
    {
      "name": "aUp",
      "type": "vec3",
      "location": 3
    },
    {
      "name": "aFall",
      "type": "vec4",
      "location": 4
    },
    {
      "name": "aSeed",
      "type": "vec4",
      "location": 5
    },
    {
      "name": "corner",
      "type": "vec2",
      "location": 6
    }
  ]
};
export const code = /* wgsl */`
struct Params {
    modelMatrix: mat4x4<f32>,
    viewMatrix: mat4x4<f32>,
    projectionMatrix: mat4x4<f32>,
    uFall1_: vec4<f32>,
    uFall2_: vec4<f32>,
    uTime: f32,
    uPixH: f32,
    uSunDir: vec3<f32>,
    uSunE: vec3<f32>,
    uMoonDir: vec3<f32>,
    uMoonE: vec3<f32>,
    uCenter: vec3<f32>,
    uHasAtmo: f32,
    uBottom: f32,
    uTop: f32,
    uGround: f32,
    uTrueK: f32,
    uSunLift: vec2<f32>,
}

struct VertexOutput {
    @location(0) vCol: vec3<f32>,
    @location(1) vA: f32,
    @location(2) vUv: vec2<f32>,
    @location(3) vMist: f32,
    @location(4) vS: vec2<f32>,
    @location(5) vZ: f32,
    @location(6) vK: f32,
    @builtin(position) gl_Position: vec4<f32>,
}

const PI: f32 = 3.1415927f;

@group(0) @binding(0) 
var<uniform> global: Params;
@group(0) @binding(1) 
var tTransTexture: texture_2d<f32>;
@group(0) @binding(2) 
var tTransSampler: sampler;
@group(0) @binding(3) 
var tIrrTexture: texture_2d<f32>;
@group(0) @binding(4) 
var tIrrSampler: sampler;
var<private> position_1: vec3<f32>;
var<private> uv_3: vec2<f32>;
var<private> aFoot_1: vec3<f32>;
var<private> aUp_1: vec3<f32>;
var<private> aFall_1: vec4<f32>;
var<private> aSeed_1: vec4<f32>;
var<private> corner_1: vec2<f32>;
var<private> vCol: vec3<f32>;
var<private> vA: f32;
var<private> vUv: vec2<f32>;
var<private> vMist: f32;
var<private> vS: vec2<f32>;
var<private> vZ: f32;
var<private> vK: f32;
var<private> gl_Position: vec4<f32>;

fn lensTrueZ(zd: f32) -> f32 {
    var zd_1: f32;
    var hD: f32;
    var hT: f32;
    var local: f32;

    zd_1 = zd;
    let _e58 = global.uSunLift;
    hD = (1.5707963f + _e58.x);
    let _e63 = global.uSunLift;
    hT = (1.5707963f + _e63.y);
    let _e67 = zd_1;
    let _e68 = hD;
    if (_e67 <= _e68) {
        let _e70 = zd_1;
        let _e71 = hT;
        let _e73 = hD;
        local = ((_e70 * _e71) / _e73);
    } else {
        let _e75 = hT;
        let _e76 = zd_1;
        let _e77 = hD;
        let _e80 = hT;
        let _e84 = hD;
        local = (_e75 + (((_e76 - _e77) * (3.1415927f - _e80)) / (3.1415927f - _e84)));
    }
    let _e89 = local;
    return _e89;
}

fn liftMu(mu: f32) -> f32 {
    var mu_1: f32;

    mu_1 = mu;
    let _e57 = global.uSunLift;
    let _e59 = global.uSunLift;
    if (_e57.x <= _e59.y) {
        let _e62 = mu_1;
        return _e62;
    }
    let _e63 = mu_1;
    let _e69 = lensTrueZ(acos(clamp(_e63, -1f, 1f)));
    return cos(_e69);
}

fn transmittanceUV(r: f32, mu_2: f32) -> vec2<f32> {
    var r_1: f32;
    var mu_3: f32;
    var H: f32;
    var rho: f32;
    var disc: f32;
    var d: f32;
    var dMin: f32;
    var dMax: f32;

    r_1 = r;
    mu_3 = mu_2;
    let _e60 = global.uTop;
    let _e61 = global.uTop;
    let _e63 = global.uBottom;
    let _e64 = global.uBottom;
    H = sqrt(max(0f, ((_e60 * _e61) - (_e63 * _e64))));
    let _e71 = r_1;
    let _e72 = r_1;
    let _e74 = global.uBottom;
    let _e75 = global.uBottom;
    rho = sqrt(max(0f, ((_e71 * _e72) - (_e74 * _e75))));
    let _e81 = r_1;
    let _e82 = r_1;
    let _e84 = mu_3;
    let _e85 = mu_3;
    let _e90 = global.uTop;
    let _e91 = global.uTop;
    disc = (((_e81 * _e82) * ((_e84 * _e85) - 1f)) + (_e90 * _e91));
    let _e96 = r_1;
    let _e98 = mu_3;
    let _e100 = disc;
    d = max(0f, ((-(_e96) * _e98) + sqrt(max(_e100, 0f))));
    let _e107 = global.uTop;
    let _e108 = r_1;
    dMin = (_e107 - _e108);
    let _e111 = rho;
    let _e112 = H;
    dMax = (_e111 + _e112);
    let _e115 = d;
    let _e116 = dMin;
    let _e118 = dMax;
    let _e119 = dMin;
    let _e124 = rho;
    let _e125 = H;
    return vec2<f32>(((_e115 - _e116) / max((_e118 - _e119), 0.000001f)), (_e124 / max(_e125, 0.000001f)));
}

fn atmoSunTransmittance(r_2: f32, mu_4: f32) -> vec3<f32> {
    var r_3: f32;
    var mu_5: f32;
    var Rg: f32;
    var sinH: f32;
    var cosH: f32;
    var vis: f32;
    var uv_1: vec2<f32>;

    r_3 = r_2;
    mu_5 = mu_4;
    let _e59 = mu_5;
    let _e60 = liftMu(_e59);
    mu_5 = _e60;
    let _e61 = global.uGround;
    let _e62 = global.uTrueK;
    Rg = (_e61 * max(_e62, 1f));
    let _e67 = Rg;
    let _e68 = Rg;
    let _e69 = r_3;
    let _e70 = global.uGround;
    sinH = (_e67 / (_e68 + max((_e69 - _e70), 0f)));
    let _e79 = sinH;
    let _e80 = sinH;
    cosH = -(sqrt(max(0f, (1f - (_e79 * _e80)))));
    let _e87 = cosH;
    let _e90 = cosH;
    let _e93 = mu_5;
    vis = smoothstep((_e87 - 0.01f), (_e90 + 0.01f), _e93);
    let _e96 = global.uHasAtmo;
    if (_e96 < 0.5f) {
        let _e99 = vis;
        return vec3(_e99);
    }
    let _e101 = r_3;
    let _e102 = global.uBottom;
    let _e103 = global.uTop;
    let _e105 = mu_5;
    let _e106 = transmittanceUV(clamp(_e101, _e102, _e103), _e105);
    uv_1 = _e106;
    let _e115 = uv_1;
    uv_1 = (vec2<f32>(0.001953125f, 0.0078125f) + (_e115 * vec2<f32>(0.99609375f, 0.984375f)));
    let _e125 = uv_1;
    let _e127 = textureSampleLevel(tTransTexture, tTransSampler, _e125, 0f);
    let _e129 = vis;
    return (_e127.xyz * _e129);
}

fn atmoSkyIrradiance(r_4: f32, mu_6: f32) -> vec3<f32> {
    var r_5: f32;
    var mu_7: f32;
    var uv_2: vec2<f32>;

    r_5 = r_4;
    mu_7 = mu_6;
    let _e59 = global.uHasAtmo;
    if (_e59 < 0.5f) {
        return vec3(0f);
    }
    let _e64 = mu_7;
    let _e65 = liftMu(_e64);
    mu_7 = _e65;
    let _e66 = mu_7;
    let _e71 = r_5;
    let _e72 = global.uGround;
    let _e74 = global.uTop;
    let _e75 = global.uGround;
    uv_2 = vec2<f32>(((_e66 * 0.5f) + 0.5f), clamp(((_e71 - _e72) / (_e74 - _e75)), 0f, 1f));
    let _e90 = uv_2;
    uv_2 = (vec2<f32>(0.0078125f, 0.03125f) + (_e90 * vec2<f32>(0.984375f, 0.9375f)));
    let _e100 = uv_2;
    let _e102 = textureSampleLevel(tIrrTexture, tIrrSampler, _e100, 0f);
    return _e102.xyz;
}

fn main_1() {
    var mist: bool;
    var g: f32;
    var vImp: f32;
    var e1_: vec3<f32>;
    var e2_: vec3<f32>;
    var al: f32;
    var local_1: f32;
    var local_2: f32;
    var local_3: f32;
    var local_4: f32;
    var wind: vec3<f32>;
    var az: f32;
    var out1_: vec3<f32>;
    var p: vec3<f32>;
    var vel: vec3<f32> = vec3(0f);
    var life: f32;
    var size: f32;
    var a: f32;
    var t: f32;
    var vOut: f32;
    var k: f32;
    var el: f32;
    var v0_: f32;
    var v0v: vec3<f32>;
    var tau: f32;
    var vT: vec3<f32>;
    var up0_: f32;
    var t_1: f32;
    var wp: vec4<f32>;
    var rel: vec3<f32>;
    var r_6: f32;
    var up: vec3<f32>;
    var muS: f32;
    var sunT: vec3<f32>;
    var skyE: vec3<f32>;
    var toCam: vec3<f32>;
    var cosT: f32;
    var local_5: f32;
    var hg: f32;
    var phase: f32;
    var c: vec3<f32>;
    var A: f32;
    var d_1: f32;
    var bowC: vec3<f32>;
    var muM: f32;
    var cosM: f32;
    var moonT: vec3<f32>;
    var phM: f32;
    var Am: f32;
    var dm: f32;
    var local_6: f32;
    var mv: vec4<f32>;
    var ds: vec3<f32>;
    var L: f32;
    var pix: f32;
    var local_7: vec2<f32>;
    var ax: vec2<f32>;

    let _e55 = aFall_1;
    mist = (_e55.w < 0f);
    let _e60 = global.uFall1_;
    g = _e60.x;
    let _e63 = aFall_1;
    vImp = _e63.x;
    let _e66 = aUp_1;
    e1_ = normalize((cross(_e66, vec3<f32>(0f, 1f, 0f)) + vec3<f32>(0.00001f, 0f, 0f)));
    let _e79 = aUp_1;
    let _e80 = e1_;
    e2_ = cross(_e79, _e80);
    let _e83 = aUp_1;
    al = abs(asin(clamp(_e83.y, -1f, 1f)));
    let _e92 = e1_;
    let _e93 = al;
    let _e96 = al;
    if ((_e93 < 0.52f) || (_e96 > 1.05f)) {
        local_1 = -1f;
    } else {
        local_1 = 1f;
    }
    let _e104 = local_1;
    let _e106 = global.uFall2_;
    let _e109 = al;
    if (_e109 < 0.09f) {
        local_4 = 0.45f;
    } else {
        let _e113 = al;
        if (_e113 < 0.52f) {
            local_3 = 0.9f;
        } else {
            let _e117 = al;
            if (_e117 < 1.05f) {
                local_2 = 1.25f;
            } else {
                local_2 = 0.8f;
            }
            let _e123 = local_2;
            local_3 = _e123;
        }
        let _e125 = local_3;
        local_4 = _e125;
    }
    let _e127 = local_4;
    wind = ((((_e92 * _e104) * _e106.w) * _e127) * 0.4f);
    let _e132 = aSeed_1;
    az = (_e132.y * 6.2832f);
    let _e137 = e1_;
    let _e138 = az;
    let _e141 = e2_;
    let _e142 = az;
    out1_ = ((_e137 * cos(_e138)) + (_e141 * sin(_e142)));
    let _e154 = mist;
    if _e154 {
        {
            let _e157 = aSeed_1;
            let _e162 = global.uFall2_;
            life = (mix(6f, 16f, _e157.w) * (1f + (0.02f / max(_e162.x, 0.002f))));
            let _e169 = life;
            life = min(_e169, 60f);
            let _e172 = global.uTime;
            let _e173 = life;
            let _e175 = aSeed_1;
            let _e179 = life;
            t = (fract(((_e172 / _e173) + _e175.x)) * _e179);
            let _e182 = vImp;
            let _e185 = aSeed_1;
            vOut = (_e182 * mix(0.15f, 0.35f, _e185.z));
            let _e190 = aFoot_1;
            let _e191 = out1_;
            let _e192 = vOut;
            let _e197 = t;
            let _e205 = aUp_1;
            let _e206 = vImp;
            let _e211 = aSeed_1;
            let _e215 = aSeed_1;
            let _e226 = t;
            let _e233 = global.uFall2_;
            let _e235 = t;
            let _e240 = wind;
            let _e241 = t;
            let _e244 = t;
            p = (((_e190 + (((_e191 * _e192) * 1.2f) * (1f - exp((-(_e197) / 1.2f))))) + (_e205 * ((((_e206 * 0.24f) * mix(0.25f, 1.5f, pow(fract(((_e211.x * 7.31f) + (_e215.w * 3.17f))), 2f))) * (1f - exp((-(_e226) / 3f)))) - (_e233.x * _e235)))) + (_e240 * (_e241 - (3f * (1f - exp((-(_e244) / 3f)))))));
            let _e254 = t;
            let _e255 = life;
            k = (_e254 / _e255);
            let _e260 = aFall_1;
            let _e266 = aSeed_1;
            let _e272 = k;
            size = (((0.4f + (0.07f * _e260.z)) * mix(0.5f, 1.5f, _e266.z)) * mix(0.3f, 1.6f, sqrt(_e272)));
            let _e277 = global.uFall2_;
            let _e282 = k;
            let _e288 = k;
            a = (((0.045f * _e277.y) * smoothstep(0f, 0.12f, _e282)) * (1f - smoothstep(0.45f, 1f, _e288)));
        }
    } else {
        {
            let _e294 = aSeed_1;
            el = mix(0.45f, 1.35f, _e294.z);
            let _e298 = vImp;
            let _e301 = aSeed_1;
            v0_ = (_e298 * mix(0.2f, 0.55f, _e301.w));
            let _e306 = out1_;
            let _e307 = el;
            let _e310 = v0_;
            let _e312 = aUp_1;
            let _e313 = el;
            let _e316 = v0_;
            v0v = (((_e306 * cos(_e307)) * _e310) + ((_e312 * sin(_e313)) * _e316));
            let _e320 = global.uFall1_;
            tau = _e320.w;
            let _e323 = aUp_1;
            let _e325 = global.uFall1_;
            let _e327 = g;
            let _e328 = tau;
            let _e332 = wind;
            vT = ((-(_e323) * min(_e325.z, (_e327 * _e328))) + _e332);
            let _e335 = el;
            let _e337 = v0_;
            up0_ = (sin(_e335) * _e337);
            let _e341 = up0_;
            let _e343 = g;
            let _e346 = up0_;
            let _e347 = global.uFall1_;
            life = (clamp((((2f * _e341) / _e343) / (1f + (_e346 / max(_e347.z, 0.01f)))), 0.15f, 12f) + 0.1f);
            let _e359 = global.uTime;
            let _e360 = life;
            let _e362 = aSeed_1;
            let _e366 = life;
            t_1 = (fract(((_e359 / _e360) + _e362.x)) * _e366);
            let _e369 = aFoot_1;
            let _e370 = vT;
            let _e371 = t_1;
            let _e374 = v0v;
            let _e375 = vT;
            let _e377 = tau;
            let _e380 = t_1;
            let _e382 = tau;
            p = ((_e369 + (_e370 * _e371)) + (((_e374 - _e375) * _e377) * (1f - exp((-(_e380) / _e382)))));
            let _e388 = vT;
            let _e389 = v0v;
            let _e390 = vT;
            let _e392 = t_1;
            let _e394 = tau;
            vel = (_e388 + ((_e389 - _e390) * exp((-(_e392) / _e394))));
            let _e400 = aFall_1;
            let _e405 = aSeed_1;
            size = ((0.5f * _e400.y) * mix(0.6f, 1.4f, _e405.y));
            let _e411 = t_1;
            let _e412 = life;
            let _e418 = t_1;
            let _e419 = life;
            a = (smoothstep(0f, 0.05f, (_e411 / _e412)) * (1f - smoothstep(0.75f, 1f, (_e418 / _e419))));
        }
    }
    let _e424 = global.modelMatrix;
    let _e425 = p;
    wp = (_e424 * vec4<f32>(_e425.x, _e425.y, _e425.z, 1f));
    let _e433 = wp;
    let _e435 = global.uCenter;
    rel = (_e433.xyz - _e435);
    let _e438 = rel;
    r_6 = length(_e438);
    let _e441 = rel;
    let _e442 = r_6;
    up = (_e441 / vec3(_e442));
    let _e446 = up;
    let _e447 = global.uSunDir;
    muS = dot(_e446, _e447);
    let _e450 = r_6;
    let _e451 = muS;
    let _e452 = atmoSunTransmittance(_e450, _e451);
    sunT = _e452;
    let _e454 = r_6;
    let _e455 = muS;
    let _e456 = atmoSkyIrradiance(_e454, _e455);
    skyE = _e456;
    let _e458 = wp;
    toCam = normalize(-(_e458.xyz));
    let _e463 = global.uSunDir;
    let _e465 = toCam;
    cosT = dot(-(_e463), _e465);
    let _e468 = mist;
    if _e468 {
        local_5 = 0.75f;
    } else {
        local_5 = 0.5f;
    }
    let _e472 = local_5;
    hg = _e472;
    let _e475 = hg;
    let _e476 = hg;
    let _e480 = hg;
    let _e481 = hg;
    let _e485 = hg;
    let _e487 = cosT;
    phase = (((1f - (_e475 * _e476)) / pow(((1f + (_e480 * _e481)) - ((2f * _e485) * _e487)), 1.5f)) * 0.25f);
    let _e496 = global.uSunE;
    let _e497 = sunT;
    let _e499 = phase;
    let _e501 = global.uSunE;
    let _e502 = skyE;
    c = (((_e496 * _e497) * _e499) + (((_e501 * _e502) / vec3(3.1415927f)) * 0.8f));
    let _e511 = mist;
    if !(_e511) {
        {
            let _e513 = toCam;
            let _e514 = global.uSunDir;
            A = acos(clamp(dot(_e513, _e514), -1f, 1f));
            let _e522 = A;
            let _e523 = global.uFall2_;
            d_1 = ((_e522 - _e523.z) * 57.2958f);
            let _e529 = d_1;
            let _e538 = d_1;
            let _e547 = d_1;
            bowC = vec3<f32>(exp(-(pow(((_e529 - 0.8f) / 0.45f), 2f))), exp(-(pow(((_e538 - 0.1f) / 0.45f), 2f))), exp(-(pow(((_e547 + 0.7f) / 0.45f), 2f))));
            let _e558 = c;
            let _e559 = global.uSunE;
            let _e560 = sunT;
            let _e562 = bowC;
            c = (_e558 + (((_e559 * _e560) * _e562) * 0.12f));
        }
    }
    let _e567 = global.uMoonE;
    if (_e567.y > 0f) {
        {
            let _e571 = up;
            let _e572 = global.uMoonDir;
            muM = dot(_e571, _e572);
            let _e575 = global.uMoonDir;
            let _e577 = toCam;
            cosM = dot(-(_e575), _e577);
            let _e580 = r_6;
            let _e581 = muM;
            let _e584 = atmoSunTransmittance(_e580, max(_e581, 0f));
            let _e587 = muM;
            moonT = (_e584 * step(-0.02f, _e587));
            let _e592 = hg;
            let _e593 = hg;
            let _e597 = hg;
            let _e598 = hg;
            let _e602 = hg;
            let _e604 = cosM;
            phM = (((1f - (_e592 * _e593)) / pow(((1f + (_e597 * _e598)) - ((2f * _e602) * _e604)), 1.5f)) * 0.25f);
            let _e613 = c;
            let _e614 = global.uMoonE;
            let _e615 = moonT;
            let _e617 = phM;
            let _e619 = global.uMoonE;
            let _e620 = r_6;
            let _e621 = muM;
            let _e622 = atmoSkyIrradiance(_e620, _e621);
            c = (_e613 + (((_e614 * _e615) * _e617) + (((_e619 * _e622) / vec3(3.1415927f)) * 0.8f)));
            let _e631 = mist;
            if !(_e631) {
                {
                    let _e633 = toCam;
                    let _e634 = global.uMoonDir;
                    Am = acos(clamp(dot(_e633, _e634), -1f, 1f));
                    let _e642 = Am;
                    let _e643 = global.uFall2_;
                    dm = ((_e642 - _e643.z) * 57.2958f);
                    let _e649 = c;
                    let _e650 = global.uMoonE;
                    let _e651 = moonT;
                    let _e653 = dm;
                    let _e662 = dm;
                    let _e671 = dm;
                    c = (_e649 + (((_e650 * _e651) * vec3<f32>(exp(-(pow(((_e653 - 0.8f) / 0.45f), 2f))), exp(-(pow(((_e662 - 0.1f) / 0.45f), 2f))), exp(-(pow(((_e671 + 0.7f) / 0.45f), 2f))))) * 0.12f));
                }
            }
        }
    }
    let _e685 = c;
    vCol = _e685;
    let _e686 = a;
    vA = _e686;
    let _e687 = corner_1;
    vUv = _e687;
    let _e688 = mist;
    if _e688 {
        local_6 = 1f;
    } else {
        local_6 = 0f;
    }
    let _e692 = local_6;
    vMist = _e692;
    let _e693 = aSeed_1;
    vS = _e693.zw;
    let _e695 = global.viewMatrix;
    let _e696 = wp;
    mv = (_e695 * _e696);
    vK = 0f;
    let _e700 = mist;
    if _e700 {
        let _e701 = mv;
        let _e703 = mv;
        let _e705 = corner_1;
        let _e706 = size;
        let _e708 = (_e703.xy + (_e705 * _e706));
        mv.x = _e708.x;
        mv.y = _e708.y;
    } else {
        {
            let _e713 = global.viewMatrix;
            let _e714 = global.modelMatrix;
            let _e715 = vel;
            let _e717 = (_e715 * 0.033f);
            ds = (_e713 * (_e714 * vec4<f32>(_e717.x, _e717.y, _e717.z, 0f))).xyz;
            let _e727 = ds;
            L = length(_e727.xy);
            let _e732 = mv;
            let _e742 = global.projectionMatrix[1][1];
            let _e743 = global.uPixH;
            pix = ((2f * max(-(_e732.z), 0.05f)) / (_e742 * max(_e743, 1f)));
            let _e749 = size;
            let _e751 = pix;
            size = max(_e749, (0.75f * _e751));
            let _e754 = L;
            if (_e754 > 0.0001f) {
                let _e757 = ds;
                let _e759 = L;
                local_7 = (_e757.xy / vec2(_e759));
            } else {
                local_7 = vec2<f32>(0f, 1f);
            }
            let _e766 = local_7;
            ax = _e766;
            let _e768 = mv;
            let _e770 = mv;
            let _e772 = ds;
            let _e777 = ax;
            let _e778 = corner_1;
            let _e782 = L;
            let _e784 = size;
            let _e788 = ax;
            let _e791 = ax;
            let _e794 = corner_1;
            let _e797 = size;
            let _e800 = (_e770.xy + (((-(_e772.xy) * 0.5f) + ((_e777 * _e778.x) * ((0.5f * _e782) + _e784))) + ((vec2<f32>(-(_e788.y), _e791.x) * _e794.y) * _e797)));
            mv.x = _e800.x;
            mv.y = _e800.y;
            let _e806 = L;
            let _e809 = L;
            let _e811 = size;
            vK = ((0.5f * _e806) / ((0.5f * _e809) + _e811));
            let _e814 = vA;
            let _e816 = aFall_1;
            let _e819 = L;
            let _e821 = size;
            let _e824 = size;
            let _e826 = size;
            vA = (_e814 * min(0.9f, (_e816.w / (((0.835f * _e819) * _e821) + ((0.69f * _e824) * _e826)))));
        }
    }
    let _e832 = mv;
    vZ = -(_e832.z);
    let _e836 = global.projectionMatrix;
    let _e837 = mv;
    gl_Position = (_e836 * _e837);
    return;
}

@vertex 
fn main(@location(0) position: vec3<f32>, @location(1) uv: vec2<f32>, @location(2) aFoot: vec3<f32>, @location(3) aUp: vec3<f32>, @location(4) aFall: vec4<f32>, @location(5) aSeed: vec4<f32>, @location(6) corner: vec2<f32>) -> VertexOutput {
    position_1 = position;
    uv_3 = uv;
    aFoot_1 = aFoot;
    aUp_1 = aUp;
    aFall_1 = aFall;
    aSeed_1 = aSeed;
    corner_1 = corner;
    main_1();
    let _e89 = vCol;
    let _e91 = vA;
    let _e93 = vUv;
    let _e95 = vMist;
    let _e97 = vS;
    let _e99 = vZ;
    let _e101 = vK;
    let _e103 = gl_Position;
    return VertexOutput(_e89, _e91, _e93, _e95, _e97, _e99, _e101, _e103);
}
`;
