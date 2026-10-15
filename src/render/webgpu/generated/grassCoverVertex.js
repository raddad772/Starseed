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
    },
    {
      "name": "iForm",
      "type": "vec4",
      "location": 11
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
var<private> iForm_1: vec4<f32>;
var<private> vGA: f32;
var<private> vGSide: f32;
var<private> vGT: f32;
var<private> vGK: f32;
var<private> vGS: f32;
var<private> gl_Position: vec4<f32>;

fn grassHash(p: vec3<f32>) -> f32 {
    var p_1: vec3<f32>;

    p_1 = p;
    let _e45 = p_1;
    return fract((sin(dot(_e45, vec3<f32>(127.1f, 311.7f, 74.7f))) * 43758.547f));
}

fn grassHash3_(p_2: vec3<f32>) -> vec3<f32> {
    var p_3: vec3<f32>;

    p_3 = p_2;
    let _e45 = p_3;
    let _e51 = p_3;
    let _e57 = p_3;
    return fract((sin(vec3<f32>(dot(_e45, vec3<f32>(127.1f, 311.7f, 74.7f)), dot(_e51, vec3<f32>(269.5f, 183.3f, 246.1f)), dot(_e57, vec3<f32>(113.5f, 271.9f, 124.6f)))) * 43758.547f));
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
    let _e47 = p_5;
    i = floor(_e47);
    let _e50 = p_5;
    f = fract(_e50);
    let _e53 = f;
    let _e54 = f;
    let _e58 = f;
    f = ((_e53 * _e54) * (vec3(3f) - (2f * _e58)));
    let _e63 = i;
    let _e64 = per_1;
    let _e65 = vec3(_e64);
    let _e70 = grassHash3_((_e63 - (floor((_e63 / _e65)) * _e65)));
    a = _e70;
    let _e72 = i;
    let _e77 = (_e72 + vec3<f32>(1f, 0f, 0f));
    let _e78 = per_1;
    let _e79 = vec3(_e78);
    let _e84 = grassHash3_((_e77 - (floor((_e77 / _e79)) * _e79)));
    b = _e84;
    let _e86 = i;
    let _e91 = (_e86 + vec3<f32>(0f, 1f, 0f));
    let _e92 = per_1;
    let _e93 = vec3(_e92);
    let _e98 = grassHash3_((_e91 - (floor((_e91 / _e93)) * _e93)));
    c = _e98;
    let _e100 = i;
    let _e105 = (_e100 + vec3<f32>(1f, 1f, 0f));
    let _e106 = per_1;
    let _e107 = vec3(_e106);
    let _e112 = grassHash3_((_e105 - (floor((_e105 / _e107)) * _e107)));
    d = _e112;
    let _e114 = i;
    let _e119 = (_e114 + vec3<f32>(0f, 0f, 1f));
    let _e120 = per_1;
    let _e121 = vec3(_e120);
    let _e126 = grassHash3_((_e119 - (floor((_e119 / _e121)) * _e121)));
    e = _e126;
    let _e128 = i;
    let _e133 = (_e128 + vec3<f32>(1f, 0f, 1f));
    let _e134 = per_1;
    let _e135 = vec3(_e134);
    let _e140 = grassHash3_((_e133 - (floor((_e133 / _e135)) * _e135)));
    g = _e140;
    let _e142 = i;
    let _e147 = (_e142 + vec3<f32>(0f, 1f, 1f));
    let _e148 = per_1;
    let _e149 = vec3(_e148);
    let _e154 = grassHash3_((_e147 - (floor((_e147 / _e149)) * _e149)));
    h = _e154;
    let _e156 = i;
    let _e161 = (_e156 + vec3<f32>(1f, 1f, 1f));
    let _e162 = per_1;
    let _e163 = vec3(_e162);
    let _e168 = grassHash3_((_e161 - (floor((_e161 / _e163)) * _e163)));
    k = _e168;
    let _e170 = a;
    let _e171 = b;
    let _e172 = f;
    let _e176 = c;
    let _e177 = d;
    let _e178 = f;
    let _e182 = f;
    let _e186 = e;
    let _e187 = g;
    let _e188 = f;
    let _e192 = h;
    let _e193 = k;
    let _e194 = f;
    let _e198 = f;
    let _e202 = f;
    return mix(mix(mix(_e170, _e171, vec3(_e172.x)), mix(_e176, _e177, vec3(_e178.x)), vec3(_e182.y)), mix(mix(_e186, _e187, vec3(_e188.x)), mix(_e192, _e193, vec3(_e194.x)), vec3(_e198.y)), vec3(_e202.z));
}

fn grassNoise1_(p_6: vec3<f32>) -> f32 {
    var p_7: vec3<f32>;
    var i_1: vec3<f32>;
    var f_1: vec3<f32>;

    p_7 = p_6;
    let _e45 = p_7;
    i_1 = floor(_e45);
    let _e48 = p_7;
    f_1 = fract(_e48);
    let _e51 = f_1;
    let _e52 = f_1;
    let _e56 = f_1;
    f_1 = ((_e51 * _e52) * (vec3(3f) - (2f * _e56)));
    let _e61 = i_1;
    let _e62 = grassHash(_e61);
    let _e63 = i_1;
    let _e69 = grassHash((_e63 + vec3<f32>(1f, 0f, 0f)));
    let _e70 = f_1;
    let _e73 = i_1;
    let _e79 = grassHash((_e73 + vec3<f32>(0f, 1f, 0f)));
    let _e80 = i_1;
    let _e86 = grassHash((_e80 + vec3<f32>(1f, 1f, 0f)));
    let _e87 = f_1;
    let _e90 = f_1;
    let _e93 = i_1;
    let _e99 = grassHash((_e93 + vec3<f32>(0f, 0f, 1f)));
    let _e100 = i_1;
    let _e106 = grassHash((_e100 + vec3<f32>(1f, 0f, 1f)));
    let _e107 = f_1;
    let _e110 = i_1;
    let _e116 = grassHash((_e110 + vec3<f32>(0f, 1f, 1f)));
    let _e117 = i_1;
    let _e123 = grassHash((_e117 + vec3<f32>(1f, 1f, 1f)));
    let _e124 = f_1;
    let _e127 = f_1;
    let _e130 = f_1;
    return mix(mix(mix(_e62, _e69, _e70.x), mix(_e79, _e86, _e87.x), _e90.y), mix(mix(_e99, _e106, _e107.x), mix(_e116, _e123, _e124.x), _e127.y), _e130.z);
}

fn grassBlade(im: mat4x4<f32>) -> vec3<f32> {
    var im_1: mat4x4<f32>;
    var ps: f32;
    var rq: f32;
    var bx: vec2<f32>;
    var local: vec2<f32>;
    var local_1: vec2<f32>;
    var local_2: vec2<f32>;
    var cc: vec2<f32>;
    var cs: f32;
    var ca: f32;
    var c0_: f32;
    var s0_: f32;
    var q: vec2<f32>;
    var cell: vec2<f32>;
    var jh: vec3<f32>;
    var cq: vec2<f32>;
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
    var out2_: vec2<f32>;
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
    let _e45 = iWave_1;
    let _e51 = grassHash(((_e45 * 0.731f) + vec3(0.17f)));
    ps = _e51;
    let _e53 = ps;
    rq = floor((_e53 * 4f));
    let _e58 = aBlade_1;
    bx = _e58.xy;
    let _e61 = rq;
    if (_e61 < 1f) {
        let _e64 = bx;
        local_2 = _e64;
    } else {
        let _e65 = rq;
        if (_e65 < 2f) {
            let _e68 = bx;
            let _e71 = bx;
            local_1 = vec2<f32>(-(_e68.y), _e71.x);
        } else {
            let _e74 = rq;
            if (_e74 < 3f) {
                let _e77 = bx;
                local = -(_e77);
            } else {
                let _e79 = bx;
                let _e81 = bx;
                local = vec2<f32>(_e79.y, -(_e81.x));
            }
            let _e86 = local;
            local_1 = _e86;
        }
        let _e88 = local_1;
        local_2 = _e88;
    }
    let _e90 = local_2;
    bx = _e90;
    let _e91 = ps;
    if (fract((_e91 * 7.13f)) > 0.5f) {
        let _e98 = bx;
        bx.x = -(_e98.x);
    }
    let _e101 = bx;
    cc = _e101;
    let _e103 = iForm_1;
    if (_e103.x > 0.01f) {
        {
            let _e109 = iForm_1;
            let _e112 = global.uPatchK;
            cs = (mix(0.3f, 0.5f, _e109.x) * _e112);
            let _e115 = ps;
            ca = (fract((_e115 * 3.71f)) * 6.2832f);
            let _e122 = ca;
            c0_ = cos(_e122);
            let _e125 = ca;
            s0_ = sin(_e125);
            let _e128 = c0_;
            let _e129 = bx;
            let _e132 = s0_;
            let _e133 = bx;
            let _e137 = s0_;
            let _e139 = bx;
            let _e142 = c0_;
            let _e143 = bx;
            q = vec2<f32>(((_e128 * _e129.x) + (_e132 * _e133.y)), ((-(_e137) * _e139.x) + (_e142 * _e143.y)));
            let _e149 = q;
            let _e150 = cs;
            cell = floor((_e149 / vec2(_e150)));
            let _e155 = cell;
            let _e156 = ps;
            let _e162 = grassHash3_(vec3<f32>(_e155.x, _e155.y, (_e156 * 17f)));
            jh = _e162;
            let _e164 = cell;
            let _e165 = jh;
            let _e168 = cs;
            cq = ((_e164 + _e165.xy) * _e168);
            let _e171 = c0_;
            let _e172 = cq;
            let _e175 = s0_;
            let _e176 = cq;
            let _e180 = s0_;
            let _e181 = cq;
            let _e184 = c0_;
            let _e185 = cq;
            cc = vec2<f32>(((_e171 * _e172.x) - (_e175 * _e176.y)), ((_e180 * _e181.x) + (_e184 * _e185.y)));
            let _e190 = bx;
            let _e191 = cc;
            let _e192 = bx;
            let _e193 = cc;
            let _e197 = jh;
            let _e203 = iForm_1;
            bx = mix(_e190, (_e191 + ((_e192 - _e193) * (0.08f + (0.2f * _e197.z)))), vec2(_e203.x));
        }
    }
    let _e207 = aBlade_1;
    let _e209 = ps;
    rr = fract((_e207.z + (_e209 * 0.618f)));
    let _e215 = global.modelMatrix;
    let _e216 = im_1;
    let _e218 = bx;
    let _e221 = bx;
    pc = ((_e215 * _e216) * vec4<f32>(_e218.x, 0f, _e221.y, 1f));
    let _e227 = pc;
    dc = length(_e227.xyz);
    let _e231 = bx;
    u0_ = ((_e231.x * 0.5f) + 0.5f);
    let _e238 = bx;
    v0_ = ((_e238.y * 0.5f) + 0.5f);
    let _e245 = iBare_1;
    let _e247 = iBare_1;
    let _e249 = u0_;
    let _e251 = iBare_1;
    let _e253 = iBare_1;
    let _e255 = u0_;
    let _e257 = v0_;
    gb = mix(mix(_e245.x, _e247.y, _e249), mix(_e251.z, _e253.w, _e255), _e257);
    let _e261 = global.uFadeR;
    let _e264 = global.uFadeR;
    let _e265 = dc;
    let _e268 = global.uFadeIn;
    let _e271 = global.uFadeIn;
    let _e274 = dc;
    fade = ((1f - smoothstep((_e261 * 0.7f), _e264, _e265)) * smoothstep((_e268 - 8f), (_e271 + 2f), _e274));
    let _e278 = rr;
    let _e279 = iGrass_1;
    let _e285 = gb;
    let _e290 = fade;
    if (_e278 >= (((_e279.x * 1.5f) * smoothstep(0.25f, 0.75f, (_e285 + 0.25f))) * _e290)) {
        return vec3(0f);
    }
    let _e295 = im_1;
    let _e305 = bx;
    let _e308 = bx;
    off = (mat3x3<f32>(_e295[0].xyz, _e295[1].xyz, _e295[2].xyz) * vec3<f32>(_e305.x, 0f, _e308.y));
    let _e313 = iWave_1;
    let _e314 = off;
    wp = (_e313 + _e314);
    let _e317 = wp;
    let _e322 = grassNoise3_((_e317 / vec3(3.2f)), 640f);
    nz = _e322;
    let _e324 = nz;
    n1_ = _e324.x;
    let _e327 = nz;
    n2_ = _e327.y;
    let _e330 = iGrass_1;
    let _e333 = n1_;
    let _e338 = gb;
    let _e340 = n2_;
    let _e347 = fade;
    dens = (((_e330.x * (0.5f + _e333)) * smoothstep(0.25f, 0.75f, (_e338 + (0.5f * (_e340 - 0.5f))))) * _e347);
    let _e350 = aV_1;
    vGT = _e350.x;
    let _e352 = rr;
    vGK = fract((_e352 * 13.71f));
    let _e357 = dens;
    let _e362 = aV_1;
    vGS = ((1.5f * min(_e357, 1f)) * (1f - _e362.x));
    let _e366 = rr;
    let _e367 = dens;
    if (_e366 >= _e367) {
        return vec3(0f);
    }
    let _e371 = aV_1;
    t = _e371.x;
    let _e374 = aV_1;
    side = _e374.y;
    let _e377 = rr;
    k1_ = fract((_e377 * 7.31f));
    let _e382 = rr;
    let _e385 = aBlade_1;
    k2_ = fract(((_e382 * 3.17f) + (_e385.w * 0.13f)));
    let _e392 = iGrass_1;
    let _e396 = nz;
    snow = (_e392.w * (0.4f + (1.2f * _e396.z)));
    let _e402 = iGrass_1;
    let _e406 = k1_;
    let _e412 = n2_;
    let _e416 = snow;
    hb = (((_e402.y * (0.45f + (0.9f * _e406))) * (0.75f + (0.5f * _e412))) - _e416);
    let _e419 = hb;
    if (_e419 < 0.02f) {
        return vec3(0f);
    }
    let _e424 = snow;
    held = exp((-(_e424) * 6f));
    let _e430 = aBlade_1;
    let _e432 = ps;
    yaw = (_e430.w + (_e432 * 6.2832f));
    let _e437 = yaw;
    let _e439 = yaw;
    f_2 = vec2<f32>(cos(_e437), sin(_e439));
    let _e443 = f_2;
    let _e446 = f_2;
    p_8 = vec2<f32>(-(_e443.y), _e446.x);
    let _e450 = f_2;
    let _e451 = iGrass_1;
    let _e456 = k2_;
    let _e462 = held;
    B = (((_e450 * _e451.z) * (0.15f + (0.85f * _e456))) * (0.4f + (0.6f * _e462)));
    let _e467 = im_1;
    let _e478 = global.uWindL;
    wl = (transpose(mat3x3<f32>(_e467[0].xyz, _e467[1].xyz, _e467[2].xyz)) * _e478);
    let _e481 = wl;
    if (length(_e481.xz) > 0.0001f) {
        let _e486 = wl;
        local_3 = normalize(_e486.xz);
    } else {
        local_3 = vec2<f32>(1f, 0f);
    }
    let _e493 = local_3;
    wd = _e493;
    let _e497 = wp;
    let _e501 = global.uWindL;
    let _e502 = global.uWindT;
    let _e507 = k1_;
    let _e512 = grassNoise1_((((_e497 / vec3(7f)) - (_e501 * (_e502 * 0.6f))) + vec3((_e507 * 0.12f))));
    g_1 = smoothstep(0.2f, 0.85f, _e512);
    let _e515 = B;
    let _e516 = wd;
    let _e517 = global.uGrassWind;
    let _e521 = g_1;
    let _e527 = k2_;
    let _e531 = held;
    B = (_e515 + ((((_e516 * _e517) * (0.25f + (0.75f * _e521))) * (0.7f + (0.6f * _e527))) * _e531));
    let _e534 = B;
    let _e537 = iForm_1;
    B = (_e534 * mix(1f, 0.35f, _e537.z));
    let _e541 = bx;
    let _e542 = cc;
    out2_ = (_e541 - _e542);
    let _e545 = iForm_1;
    let _e549 = out2_;
    let _e550 = out2_;
    if ((_e545.w > 0f) && (dot(_e549, _e550) > 0.00000001f)) {
        let _e555 = B;
        let _e556 = out2_;
        let _e558 = iForm_1;
        let _e563 = k2_;
        B = (_e555 + ((normalize(_e556) * _e558.w) * (0.7f + (0.6f * _e563))));
    }
    let _e568 = B;
    bl = length(_e568);
    let _e571 = bl;
    if (_e571 > 1.2f) {
        let _e574 = B;
        let _e576 = bl;
        B = (_e574 * (1.2f / _e576));
    }
    let _e579 = bx;
    u = ((_e579.x * 0.5f) + 0.5f);
    let _e586 = bx;
    v = ((_e586.y * 0.5f) + 0.5f);
    let _e593 = iCorner_1;
    let _e595 = iCorner_1;
    let _e597 = u;
    let _e599 = iCorner_1;
    let _e601 = iCorner_1;
    let _e603 = u;
    let _e605 = v;
    hg = mix(mix(_e593.x, _e595.y, _e597), mix(_e599.z, _e601.w, _e603), _e605);
    let _e608 = global.uBladeW;
    let _e609 = iForm_1;
    let _e614 = k2_;
    let _e620 = iGrass_1;
    let _e626 = t;
    w = ((((_e608 * _e609.y) * (0.6f + (0.8f * _e614))) * (1f + (0.6f * _e620.y))) * pow((1f - _e626), 0.7f));
    vGA = 1f;
    let _e633 = side;
    vGSide = _e633;
    let _e634 = global.uCover;
    if (_e634.x > 0.5f) {
        {
            let _e638 = global.modelMatrix;
            let _e649 = global.uCoverL;
            lM = (transpose(mat3x3<f32>(_e638[0].xyz, _e638[1].xyz, _e638[2].xyz)) * _e649);
            let _e654 = im_1[0];
            let _e656 = lM;
            let _e660 = im_1[2];
            let _e662 = lM;
            hL = vec2<f32>(dot(_e654.xyz, _e656), dot(_e660.xyz, _e662));
            let _e666 = hL;
            let _e667 = hL;
            if (dot(_e666, _e667) > 0.0000000001f) {
                {
                    let _e671 = hL;
                    hL = normalize(_e671);
                    let _e673 = hL;
                    let _e676 = hL;
                    p_8 = vec2<f32>(-(_e673.y), _e676.x);
                }
            }
            let _e679 = w;
            wv = (_e679 * 0.64f);
            let _e683 = wv;
            let _e684 = global.uCover;
            we = max(_e683, _e684.y);
            let _e688 = wv;
            let _e689 = we;
            vGA = (_e688 / max(_e689, 0.000001f));
            let _e693 = we;
            w = _e693;
        }
    }
    let _e694 = bx;
    let _e695 = B;
    let _e696 = hb;
    let _e698 = t;
    let _e700 = t;
    let _e702 = p_8;
    let _e703 = w;
    let _e705 = side;
    let _e708 = global.uPatchK;
    xz = (_e694 + (((((_e695 * _e696) * _e698) * _e700) + ((_e702 * _e703) * _e705)) * _e708));
    let _e712 = xz;
    let _e714 = hg;
    let _e715 = snow;
    let _e717 = hb;
    let _e718 = t;
    let _e722 = B;
    let _e723 = B;
    let _e726 = t;
    let _e731 = xz;
    return vec3<f32>(_e712.x, ((_e714 + _e715) + ((_e717 * _e718) * (1f - ((0.3f * dot(_e722, _e723)) * _e726)))), _e731.y);
}

fn main_1() {
    let _e44 = global.projectionMatrix;
    let _e45 = global.viewMatrix;
    let _e47 = global.modelMatrix;
    let _e49 = instance0_1;
    let _e50 = instance1_1;
    let _e51 = instance2_1;
    let _e52 = instance3_1;
    let _e75 = instance0_1;
    let _e76 = instance1_1;
    let _e77 = instance2_1;
    let _e78 = instance3_1;
    let _e100 = grassBlade(mat4x4<f32>(vec4<f32>(_e75.x, _e75.y, _e75.z, _e75.w), vec4<f32>(_e76.x, _e76.y, _e76.z, _e76.w), vec4<f32>(_e77.x, _e77.y, _e77.z, _e77.w), vec4<f32>(_e78.x, _e78.y, _e78.z, _e78.w)));
    gl_Position = ((((_e44 * _e45) * _e47) * mat4x4<f32>(vec4<f32>(_e49.x, _e49.y, _e49.z, _e49.w), vec4<f32>(_e50.x, _e50.y, _e50.z, _e50.w), vec4<f32>(_e51.x, _e51.y, _e51.z, _e51.w), vec4<f32>(_e52.x, _e52.y, _e52.z, _e52.w))) * vec4<f32>(_e100.x, _e100.y, _e100.z, 1f));
    let _e108 = gl_Position;
    gl_Position.y = -(_e108.y);
    let _e113 = gl_Position;
    let _e115 = gl_Position;
    gl_Position.z = (0.5f * (_e113.z + _e115.w));
    return;
}

@vertex 
fn main(@location(0) position: vec3<f32>, @location(1) instance0_: vec4<f32>, @location(2) instance1_: vec4<f32>, @location(3) instance2_: vec4<f32>, @location(4) instance3_: vec4<f32>, @location(5) aBlade: vec4<f32>, @location(6) aV: vec2<f32>, @location(7) iCorner: vec4<f32>, @location(8) iBare: vec4<f32>, @location(9) iGrass: vec4<f32>, @location(10) iWave: vec3<f32>, @location(11) iForm: vec4<f32>) -> VertexOutput {
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
    iForm_1 = iForm;
    main_1();
    let _e85 = vGA;
    let _e87 = vGSide;
    let _e89 = vGT;
    let _e91 = vGK;
    let _e93 = vGS;
    let _e95 = gl_Position;
    return VertexOutput(_e85, _e87, _e89, _e91, _e93, _e95);
}
`;
