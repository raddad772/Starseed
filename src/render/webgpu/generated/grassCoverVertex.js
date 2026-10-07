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
      "name": "modelViewMatrix",
      "type": "mat4",
      "count": 0,
      "align": 16,
      "size": 64,
      "stride": 64,
      "offset": 64
    },
    {
      "name": "viewMatrix",
      "type": "mat4",
      "count": 0,
      "align": 16,
      "size": 64,
      "stride": 64,
      "offset": 128
    },
    {
      "name": "projectionMatrix",
      "type": "mat4",
      "count": 0,
      "align": 16,
      "size": 64,
      "stride": 64,
      "offset": 192
    },
    {
      "name": "uWindT",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 256
    },
    {
      "name": "uGrassWind",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 260
    },
    {
      "name": "uWindL",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 272
    },
    {
      "name": "uBladeW",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 284
    },
    {
      "name": "uFadeR",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 288
    },
    {
      "name": "uFadeIn",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 292
    },
    {
      "name": "uPatchK",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 296
    },
    {
      "name": "uCover",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 304
    },
    {
      "name": "uCoverL",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 320
    }
  ],
  "textures": [],
  "bytes": 336,
  "group": 0,
  "attributes": [
    {
      "name": "position",
      "type": "vec3",
      "location": 0
    },
    {
      "name": "instance0",
      "type": "vec4",
      "location": 1
    },
    {
      "name": "instance1",
      "type": "vec4",
      "location": 2
    },
    {
      "name": "instance2",
      "type": "vec4",
      "location": 3
    },
    {
      "name": "instance3",
      "type": "vec4",
      "location": 4
    },
    {
      "name": "aBlade",
      "type": "vec4",
      "location": 5
    },
    {
      "name": "aV",
      "type": "vec2",
      "location": 6
    },
    {
      "name": "iCorner",
      "type": "vec4",
      "location": 7
    },
    {
      "name": "iBare",
      "type": "vec4",
      "location": 8
    },
    {
      "name": "iGrass",
      "type": "vec4",
      "location": 9
    },
    {
      "name": "iWave",
      "type": "vec3",
      "location": 10
    }
  ]
};
export const code = /* wgsl */`
struct Params {
    modelMatrix: mat4x4<f32>,
    modelViewMatrix: mat4x4<f32>,
    viewMatrix: mat4x4<f32>,
    projectionMatrix: mat4x4<f32>,
    uWindT: f32,
    uGrassWind: f32,
    uWindL: vec3<f32>,
    uBladeW: f32,
    uFadeR: f32,
    uFadeIn: f32,
    uPatchK: f32,
    uCover: vec4<f32>,
    uCoverL: vec3<f32>,
}

struct VertexOutput {
    @location(0) vGA: f32,
    @location(1) vGSide: f32,
    @location(2) vGT: f32,
    @location(3) vGK: f32,
    @location(4) vGS: f32,
    @builtin(position) gl_Position: vec4<f32>,
}

@group(0) @binding(0) 
var<uniform> global: Params;
var<private> position_1: vec3<f32>;
var<private> instance0_1: vec4<f32>;
var<private> instance1_1: vec4<f32>;
var<private> instance2_1: vec4<f32>;
var<private> instance3_1: vec4<f32>;
var<private> aBlade_1: vec4<f32>;
var<private> aV_1: vec2<f32>;
var<private> iCorner_1: vec4<f32>;
var<private> iBare_1: vec4<f32>;
var<private> iGrass_1: vec4<f32>;
var<private> iWave_1: vec3<f32>;
var<private> vGA: f32;
var<private> vGSide: f32;
var<private> vGT: f32;
var<private> vGK: f32;
var<private> vGS: f32;
var<private> gl_Position: vec4<f32>;

fn grassHash(p: vec3<f32>) -> f32 {
    var p_1: vec3<f32>;

    p_1 = p;
    let _e44 = p_1;
    return fract((sin(dot(_e44, vec3<f32>(127.1f, 311.7f, 74.7f))) * 43758.547f));
}

fn grassHash3_(p_2: vec3<f32>) -> vec3<f32> {
    var p_3: vec3<f32>;

    p_3 = p_2;
    let _e44 = p_3;
    let _e50 = p_3;
    let _e56 = p_3;
    return fract((sin(vec3<f32>(dot(_e44, vec3<f32>(127.1f, 311.7f, 74.7f)), dot(_e50, vec3<f32>(269.5f, 183.3f, 246.1f)), dot(_e56, vec3<f32>(113.5f, 271.9f, 124.6f)))) * 43758.547f));
}

fn grassNoise3_(p_4: vec3<f32>, per: f32) -> vec3<f32> {
    var p_5: vec3<f32>;
    var per_1: f32;
    var i: vec3<f32>;
    var f: vec3<f32>;
    var a: vec3<f32>;
    var b: vec3<f32>;
    var c: vec3<f32>;
    var d: vec3<f32>;
    var e: vec3<f32>;
    var g: vec3<f32>;
    var h: vec3<f32>;
    var k: vec3<f32>;

    p_5 = p_4;
    per_1 = per;
    let _e46 = p_5;
    i = floor(_e46);
    let _e49 = p_5;
    f = fract(_e49);
    let _e52 = f;
    let _e53 = f;
    let _e57 = f;
    f = ((_e52 * _e53) * (vec3(3f) - (2f * _e57)));
    let _e62 = i;
    let _e63 = per_1;
    let _e64 = vec3(_e63);
    let _e69 = grassHash3_((_e62 - (floor((_e62 / _e64)) * _e64)));
    a = _e69;
    let _e71 = i;
    let _e76 = (_e71 + vec3<f32>(1f, 0f, 0f));
    let _e77 = per_1;
    let _e78 = vec3(_e77);
    let _e83 = grassHash3_((_e76 - (floor((_e76 / _e78)) * _e78)));
    b = _e83;
    let _e85 = i;
    let _e90 = (_e85 + vec3<f32>(0f, 1f, 0f));
    let _e91 = per_1;
    let _e92 = vec3(_e91);
    let _e97 = grassHash3_((_e90 - (floor((_e90 / _e92)) * _e92)));
    c = _e97;
    let _e99 = i;
    let _e104 = (_e99 + vec3<f32>(1f, 1f, 0f));
    let _e105 = per_1;
    let _e106 = vec3(_e105);
    let _e111 = grassHash3_((_e104 - (floor((_e104 / _e106)) * _e106)));
    d = _e111;
    let _e113 = i;
    let _e118 = (_e113 + vec3<f32>(0f, 0f, 1f));
    let _e119 = per_1;
    let _e120 = vec3(_e119);
    let _e125 = grassHash3_((_e118 - (floor((_e118 / _e120)) * _e120)));
    e = _e125;
    let _e127 = i;
    let _e132 = (_e127 + vec3<f32>(1f, 0f, 1f));
    let _e133 = per_1;
    let _e134 = vec3(_e133);
    let _e139 = grassHash3_((_e132 - (floor((_e132 / _e134)) * _e134)));
    g = _e139;
    let _e141 = i;
    let _e146 = (_e141 + vec3<f32>(0f, 1f, 1f));
    let _e147 = per_1;
    let _e148 = vec3(_e147);
    let _e153 = grassHash3_((_e146 - (floor((_e146 / _e148)) * _e148)));
    h = _e153;
    let _e155 = i;
    let _e160 = (_e155 + vec3<f32>(1f, 1f, 1f));
    let _e161 = per_1;
    let _e162 = vec3(_e161);
    let _e167 = grassHash3_((_e160 - (floor((_e160 / _e162)) * _e162)));
    k = _e167;
    let _e169 = a;
    let _e170 = b;
    let _e171 = f;
    let _e175 = c;
    let _e176 = d;
    let _e177 = f;
    let _e181 = f;
    let _e185 = e;
    let _e186 = g;
    let _e187 = f;
    let _e191 = h;
    let _e192 = k;
    let _e193 = f;
    let _e197 = f;
    let _e201 = f;
    return mix(mix(mix(_e169, _e170, vec3(_e171.x)), mix(_e175, _e176, vec3(_e177.x)), vec3(_e181.y)), mix(mix(_e185, _e186, vec3(_e187.x)), mix(_e191, _e192, vec3(_e193.x)), vec3(_e197.y)), vec3(_e201.z));
}

fn grassNoise1_(p_6: vec3<f32>) -> f32 {
    var p_7: vec3<f32>;
    var i_1: vec3<f32>;
    var f_1: vec3<f32>;

    p_7 = p_6;
    let _e44 = p_7;
    i_1 = floor(_e44);
    let _e47 = p_7;
    f_1 = fract(_e47);
    let _e50 = f_1;
    let _e51 = f_1;
    let _e55 = f_1;
    f_1 = ((_e50 * _e51) * (vec3(3f) - (2f * _e55)));
    let _e60 = i_1;
    let _e61 = grassHash(_e60);
    let _e62 = i_1;
    let _e68 = grassHash((_e62 + vec3<f32>(1f, 0f, 0f)));
    let _e69 = f_1;
    let _e72 = i_1;
    let _e78 = grassHash((_e72 + vec3<f32>(0f, 1f, 0f)));
    let _e79 = i_1;
    let _e85 = grassHash((_e79 + vec3<f32>(1f, 1f, 0f)));
    let _e86 = f_1;
    let _e89 = f_1;
    let _e92 = i_1;
    let _e98 = grassHash((_e92 + vec3<f32>(0f, 0f, 1f)));
    let _e99 = i_1;
    let _e105 = grassHash((_e99 + vec3<f32>(1f, 0f, 1f)));
    let _e106 = f_1;
    let _e109 = i_1;
    let _e115 = grassHash((_e109 + vec3<f32>(0f, 1f, 1f)));
    let _e116 = i_1;
    let _e122 = grassHash((_e116 + vec3<f32>(1f, 1f, 1f)));
    let _e123 = f_1;
    let _e126 = f_1;
    let _e129 = f_1;
    return mix(mix(mix(_e61, _e68, _e69.x), mix(_e78, _e85, _e86.x), _e89.y), mix(mix(_e98, _e105, _e106.x), mix(_e115, _e122, _e123.x), _e126.y), _e129.z);
}

fn grassBlade(im: mat4x4<f32>) -> vec3<f32> {
    var im_1: mat4x4<f32>;
    var ps: f32;
    var rq: f32;
    var bx: vec2<f32>;
    var local: vec2<f32>;
    var local_1: vec2<f32>;
    var local_2: vec2<f32>;
    var rr: f32;
    var pc: vec4<f32>;
    var dc: f32;
    var u0_: f32;
    var v0_: f32;
    var gb: f32;
    var fade: f32;
    var off: vec3<f32>;
    var wp: vec3<f32>;
    var nz: vec3<f32>;
    var n1_: f32;
    var n2_: f32;
    var dens: f32;
    var t: f32;
    var side: f32;
    var k1_: f32;
    var k2_: f32;
    var snow: f32;
    var hb: f32;
    var held: f32;
    var yaw: f32;
    var f_2: vec2<f32>;
    var p_8: vec2<f32>;
    var B: vec2<f32>;
    var wl: vec3<f32>;
    var local_3: vec2<f32>;
    var wd: vec2<f32>;
    var g_1: f32;
    var bl: f32;
    var u: f32;
    var v: f32;
    var hg: f32;
    var w: f32;
    var lM: vec3<f32>;
    var hL: vec2<f32>;
    var wv: f32;
    var we: f32;
    var xz: vec2<f32>;

    im_1 = im;
    let _e44 = iWave_1;
    let _e50 = grassHash(((_e44 * 0.731f) + vec3(0.17f)));
    ps = _e50;
    let _e52 = ps;
    rq = floor((_e52 * 4f));
    let _e57 = aBlade_1;
    bx = _e57.xy;
    let _e60 = rq;
    if (_e60 < 1f) {
        let _e63 = bx;
        local_2 = _e63;
    } else {
        let _e64 = rq;
        if (_e64 < 2f) {
            let _e67 = bx;
            let _e70 = bx;
            local_1 = vec2<f32>(-(_e67.y), _e70.x);
        } else {
            let _e73 = rq;
            if (_e73 < 3f) {
                let _e76 = bx;
                local = -(_e76);
            } else {
                let _e78 = bx;
                let _e80 = bx;
                local = vec2<f32>(_e78.y, -(_e80.x));
            }
            let _e85 = local;
            local_1 = _e85;
        }
        let _e87 = local_1;
        local_2 = _e87;
    }
    let _e89 = local_2;
    bx = _e89;
    let _e90 = ps;
    if (fract((_e90 * 7.13f)) > 0.5f) {
        let _e97 = bx;
        bx.x = -(_e97.x);
    }
    let _e100 = aBlade_1;
    let _e102 = ps;
    rr = fract((_e100.z + (_e102 * 0.618f)));
    let _e108 = global.modelMatrix;
    let _e109 = im_1;
    let _e111 = bx;
    let _e114 = bx;
    pc = ((_e108 * _e109) * vec4<f32>(_e111.x, 0f, _e114.y, 1f));
    let _e120 = pc;
    dc = length(_e120.xyz);
    let _e124 = bx;
    u0_ = ((_e124.x * 0.5f) + 0.5f);
    let _e131 = bx;
    v0_ = ((_e131.y * 0.5f) + 0.5f);
    let _e138 = iBare_1;
    let _e140 = iBare_1;
    let _e142 = u0_;
    let _e144 = iBare_1;
    let _e146 = iBare_1;
    let _e148 = u0_;
    let _e150 = v0_;
    gb = mix(mix(_e138.x, _e140.y, _e142), mix(_e144.z, _e146.w, _e148), _e150);
    let _e154 = global.uFadeR;
    let _e157 = global.uFadeR;
    let _e158 = dc;
    let _e161 = global.uFadeIn;
    let _e164 = global.uFadeIn;
    let _e167 = dc;
    fade = ((1f - smoothstep((_e154 * 0.7f), _e157, _e158)) * smoothstep((_e161 - 8f), (_e164 + 2f), _e167));
    let _e171 = rr;
    let _e172 = iGrass_1;
    let _e178 = gb;
    let _e183 = fade;
    if (_e171 >= (((_e172.x * 1.5f) * smoothstep(0.25f, 0.75f, (_e178 + 0.25f))) * _e183)) {
        return vec3(0f);
    }
    let _e188 = im_1;
    let _e198 = bx;
    let _e201 = bx;
    off = (mat3x3<f32>(_e188[0].xyz, _e188[1].xyz, _e188[2].xyz) * vec3<f32>(_e198.x, 0f, _e201.y));
    let _e206 = iWave_1;
    let _e207 = off;
    wp = (_e206 + _e207);
    let _e210 = wp;
    let _e215 = grassNoise3_((_e210 / vec3(3.2f)), 640f);
    nz = _e215;
    let _e217 = nz;
    n1_ = _e217.x;
    let _e220 = nz;
    n2_ = _e220.y;
    let _e223 = iGrass_1;
    let _e226 = n1_;
    let _e231 = gb;
    let _e233 = n2_;
    let _e240 = fade;
    dens = (((_e223.x * (0.5f + _e226)) * smoothstep(0.25f, 0.75f, (_e231 + (0.5f * (_e233 - 0.5f))))) * _e240);
    let _e243 = aV_1;
    vGT = _e243.x;
    let _e245 = rr;
    vGK = fract((_e245 * 13.71f));
    let _e250 = dens;
    let _e255 = aV_1;
    vGS = ((1.5f * min(_e250, 1f)) * (1f - _e255.x));
    let _e259 = rr;
    let _e260 = dens;
    if (_e259 >= _e260) {
        return vec3(0f);
    }
    let _e264 = aV_1;
    t = _e264.x;
    let _e267 = aV_1;
    side = _e267.y;
    let _e270 = rr;
    k1_ = fract((_e270 * 7.31f));
    let _e275 = rr;
    let _e278 = aBlade_1;
    k2_ = fract(((_e275 * 3.17f) + (_e278.w * 0.13f)));
    let _e285 = iGrass_1;
    let _e289 = nz;
    snow = (_e285.w * (0.4f + (1.2f * _e289.z)));
    let _e295 = iGrass_1;
    let _e299 = k1_;
    let _e305 = n2_;
    let _e309 = snow;
    hb = (((_e295.y * (0.45f + (0.9f * _e299))) * (0.75f + (0.5f * _e305))) - _e309);
    let _e312 = hb;
    if (_e312 < 0.02f) {
        return vec3(0f);
    }
    let _e317 = snow;
    held = exp((-(_e317) * 6f));
    let _e323 = aBlade_1;
    let _e325 = ps;
    yaw = (_e323.w + (_e325 * 6.2832f));
    let _e330 = yaw;
    let _e332 = yaw;
    f_2 = vec2<f32>(cos(_e330), sin(_e332));
    let _e336 = f_2;
    let _e339 = f_2;
    p_8 = vec2<f32>(-(_e336.y), _e339.x);
    let _e343 = f_2;
    let _e344 = iGrass_1;
    let _e349 = k2_;
    let _e355 = held;
    B = (((_e343 * _e344.z) * (0.15f + (0.85f * _e349))) * (0.4f + (0.6f * _e355)));
    let _e360 = im_1;
    let _e371 = global.uWindL;
    wl = (transpose(mat3x3<f32>(_e360[0].xyz, _e360[1].xyz, _e360[2].xyz)) * _e371);
    let _e374 = wl;
    if (length(_e374.xz) > 0.0001f) {
        let _e379 = wl;
        local_3 = normalize(_e379.xz);
    } else {
        local_3 = vec2<f32>(1f, 0f);
    }
    let _e386 = local_3;
    wd = _e386;
    let _e390 = wp;
    let _e394 = global.uWindL;
    let _e395 = global.uWindT;
    let _e400 = k1_;
    let _e405 = grassNoise1_((((_e390 / vec3(7f)) - (_e394 * (_e395 * 0.6f))) + vec3((_e400 * 0.12f))));
    g_1 = smoothstep(0.2f, 0.85f, _e405);
    let _e408 = B;
    let _e409 = wd;
    let _e410 = global.uGrassWind;
    let _e414 = g_1;
    let _e420 = k2_;
    let _e424 = held;
    B = (_e408 + ((((_e409 * _e410) * (0.25f + (0.75f * _e414))) * (0.7f + (0.6f * _e420))) * _e424));
    let _e427 = B;
    bl = length(_e427);
    let _e430 = bl;
    if (_e430 > 1.2f) {
        let _e433 = B;
        let _e435 = bl;
        B = (_e433 * (1.2f / _e435));
    }
    let _e438 = bx;
    u = ((_e438.x * 0.5f) + 0.5f);
    let _e445 = bx;
    v = ((_e445.y * 0.5f) + 0.5f);
    let _e452 = iCorner_1;
    let _e454 = iCorner_1;
    let _e456 = u;
    let _e458 = iCorner_1;
    let _e460 = iCorner_1;
    let _e462 = u;
    let _e464 = v;
    hg = mix(mix(_e452.x, _e454.y, _e456), mix(_e458.z, _e460.w, _e462), _e464);
    let _e467 = global.uBladeW;
    let _e470 = k2_;
    let _e476 = iGrass_1;
    let _e482 = t;
    w = (((_e467 * (0.6f + (0.8f * _e470))) * (1f + (0.6f * _e476.y))) * pow((1f - _e482), 0.7f));
    vGA = 1f;
    let _e489 = side;
    vGSide = _e489;
    let _e490 = global.uCover;
    if (_e490.x > 0.5f) {
        {
            let _e494 = global.modelMatrix;
            let _e505 = global.uCoverL;
            lM = (transpose(mat3x3<f32>(_e494[0].xyz, _e494[1].xyz, _e494[2].xyz)) * _e505);
            let _e510 = im_1[0];
            let _e512 = lM;
            let _e516 = im_1[2];
            let _e518 = lM;
            hL = vec2<f32>(dot(_e510.xyz, _e512), dot(_e516.xyz, _e518));
            let _e522 = hL;
            let _e523 = hL;
            if (dot(_e522, _e523) > 0.0000000001f) {
                {
                    let _e527 = hL;
                    hL = normalize(_e527);
                    let _e529 = hL;
                    let _e532 = hL;
                    p_8 = vec2<f32>(-(_e529.y), _e532.x);
                }
            }
            let _e535 = w;
            wv = (_e535 * 0.64f);
            let _e539 = wv;
            let _e540 = global.uCover;
            we = max(_e539, _e540.y);
            let _e544 = wv;
            let _e545 = we;
            vGA = (_e544 / max(_e545, 0.000001f));
            let _e549 = we;
            w = _e549;
        }
    }
    let _e550 = bx;
    let _e551 = B;
    let _e552 = hb;
    let _e554 = t;
    let _e556 = t;
    let _e558 = p_8;
    let _e559 = w;
    let _e561 = side;
    let _e564 = global.uPatchK;
    xz = (_e550 + (((((_e551 * _e552) * _e554) * _e556) + ((_e558 * _e559) * _e561)) * _e564));
    let _e568 = xz;
    let _e570 = hg;
    let _e571 = snow;
    let _e573 = hb;
    let _e574 = t;
    let _e578 = B;
    let _e579 = B;
    let _e582 = t;
    let _e587 = xz;
    return vec3<f32>(_e568.x, ((_e570 + _e571) + ((_e573 * _e574) * (1f - ((0.3f * dot(_e578, _e579)) * _e582)))), _e587.y);
}

fn main_1() {
    let _e43 = global.projectionMatrix;
    let _e44 = global.viewMatrix;
    let _e46 = global.modelMatrix;
    let _e48 = instance0_1;
    let _e49 = instance1_1;
    let _e50 = instance2_1;
    let _e51 = instance3_1;
    let _e74 = instance0_1;
    let _e75 = instance1_1;
    let _e76 = instance2_1;
    let _e77 = instance3_1;
    let _e99 = grassBlade(mat4x4<f32>(vec4<f32>(_e74.x, _e74.y, _e74.z, _e74.w), vec4<f32>(_e75.x, _e75.y, _e75.z, _e75.w), vec4<f32>(_e76.x, _e76.y, _e76.z, _e76.w), vec4<f32>(_e77.x, _e77.y, _e77.z, _e77.w)));
    gl_Position = ((((_e43 * _e44) * _e46) * mat4x4<f32>(vec4<f32>(_e48.x, _e48.y, _e48.z, _e48.w), vec4<f32>(_e49.x, _e49.y, _e49.z, _e49.w), vec4<f32>(_e50.x, _e50.y, _e50.z, _e50.w), vec4<f32>(_e51.x, _e51.y, _e51.z, _e51.w))) * vec4<f32>(_e99.x, _e99.y, _e99.z, 1f));
    let _e107 = gl_Position;
    gl_Position.y = -(_e107.y);
    let _e112 = gl_Position;
    let _e114 = gl_Position;
    gl_Position.z = (0.5f * (_e112.z + _e114.w));
    return;
}

@vertex 
fn main(@location(0) position: vec3<f32>, @location(1) instance0_: vec4<f32>, @location(2) instance1_: vec4<f32>, @location(3) instance2_: vec4<f32>, @location(4) instance3_: vec4<f32>, @location(5) aBlade: vec4<f32>, @location(6) aV: vec2<f32>, @location(7) iCorner: vec4<f32>, @location(8) iBare: vec4<f32>, @location(9) iGrass: vec4<f32>, @location(10) iWave: vec3<f32>) -> VertexOutput {
    position_1 = position;
    instance0_1 = instance0_;
    instance1_1 = instance1_;
    instance2_1 = instance2_;
    instance3_1 = instance3_;
    aBlade_1 = aBlade;
    aV_1 = aV;
    iCorner_1 = iCorner;
    iBare_1 = iBare;
    iGrass_1 = iGrass;
    iWave_1 = iWave;
    main_1();
    let _e81 = vGA;
    let _e83 = vGSide;
    let _e85 = vGT;
    let _e87 = vGK;
    let _e89 = vGS;
    let _e91 = gl_Position;
    return VertexOutput(_e81, _e83, _e85, _e87, _e89, _e91);
}
`;
