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
      "name": "uTrunkSky",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 192
    },
    {
      "name": "uTrunkSkyVP",
      "type": "mat4",
      "count": 0,
      "align": 16,
      "size": 64,
      "stride": 64,
      "offset": 208
    },
    {
      "name": "uWindT",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 272
    },
    {
      "name": "uGrassWind",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 276
    },
    {
      "name": "uWindL",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 288
    },
    {
      "name": "uBladeW",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 300
    },
    {
      "name": "uFadeR",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 304
    },
    {
      "name": "uFadeIn",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 308
    },
    {
      "name": "uPatchK",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 312
    },
    {
      "name": "uCover",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 320
    },
    {
      "name": "uCoverL",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 336
    },
    {
      "name": "uSunShadowDir",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 352
    }
  ],
  "textures": [
    {
      "name": "tShadowAtlas",
      "type": "sampler2D",
      "count": 0,
      "binding": 1,
      "samplerBinding": 2
    }
  ],
  "bytes": 368,
  "group": 0,
  "attributes": [
    {
      "name": "position",
      "type": "vec3",
      "location": 0
    },
    {
      "name": "normal",
      "type": "vec3",
      "location": 1
    },
    {
      "name": "instance0",
      "type": "vec4",
      "location": 2
    },
    {
      "name": "instance1",
      "type": "vec4",
      "location": 3
    },
    {
      "name": "instance2",
      "type": "vec4",
      "location": 4
    },
    {
      "name": "instance3",
      "type": "vec4",
      "location": 5
    },
    {
      "name": "instanceColor",
      "type": "vec3",
      "location": 6
    },
    {
      "name": "aBlade",
      "type": "vec4",
      "location": 7
    },
    {
      "name": "aV",
      "type": "vec2",
      "location": 8
    },
    {
      "name": "iCorner",
      "type": "vec4",
      "location": 9
    },
    {
      "name": "iBare",
      "type": "vec4",
      "location": 10
    },
    {
      "name": "iGrass",
      "type": "vec4",
      "location": 11
    },
    {
      "name": "iWave",
      "type": "vec3",
      "location": 12
    },
    {
      "name": "iForm",
      "type": "vec4",
      "location": 13
    }
  ]
};
export const code = /* wgsl */`
struct Params {
    modelMatrix: mat4x4<f32>,
    viewMatrix: mat4x4<f32>,
    projectionMatrix: mat4x4<f32>,
    uTrunkSky: vec4<f32>,
    uTrunkSkyVP: mat4x4<f32>,
    uWindT: f32,
    uGrassWind: f32,
    uWindL: vec3<f32>,
    uBladeW: f32,
    uFadeR: f32,
    uFadeIn: f32,
    uPatchK: f32,
    uCover: vec4<f32>,
    uCoverL: vec3<f32>,
    uSunShadowDir: vec3<f32>,
}

struct VertexOutput {
    @location(0) vGA: f32,
    @location(1) vGSide: f32,
    @location(2) vGT: f32,
    @location(3) vGK: f32,
    @location(4) vGS: f32,
    @location(5) vNormal: vec3<f32>,
    @location(6) vTint: vec3<f32>,
    @builtin(position) gl_Position: vec4<f32>,
}

const PI: f32 = 3.1415927f;

@group(0) @binding(0) 
var<uniform> global: Params;
@group(0) @binding(1) 
var tShadowAtlasTexture: texture_2d<f32>;
@group(0) @binding(2) 
var tShadowAtlasSampler: sampler;
var<private> position_1: vec3<f32>;
var<private> normal_1: vec3<f32>;
var<private> instance0_1: vec4<f32>;
var<private> instance1_1: vec4<f32>;
var<private> instance2_1: vec4<f32>;
var<private> instance3_1: vec4<f32>;
var<private> instanceColor_1: vec3<f32>;
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
var<private> vNormal: vec3<f32>;
var<private> vTint: vec3<f32>;
var<private> gl_Position: vec4<f32>;

fn trunkSumV(wp: vec3<f32>) -> f32 {
    var wp_1: vec3<f32>;
    var c: vec4<f32>;
    var uv: vec2<f32>;
    var n: i32;

    wp_1 = wp;
    let _e42 = global.uTrunkSky;
    if (_e42.x < 0.5f) {
        return 0f;
    }
    let _e47 = global.uTrunkSkyVP;
    let _e48 = wp_1;
    c = (_e47 * vec4<f32>(_e48.x, _e48.y, _e48.z, 1f));
    let _e56 = c;
    let _e58 = c;
    uv = (((_e56.xy / vec2(_e58.w)) * 0.5f) + vec2(0.5f));
    let _e68 = uv;
    let _e73 = uv;
    if (any((_e68 < vec2(0f))) || any((_e73 > vec2(1f)))) {
        return 0f;
    }
    let _e80 = global.uTrunkSky;
    n = i32(_e80.w);
    let _e84 = global.uTrunkSky;
    let _e87 = uv;
    let _e88 = global.uTrunkSky;
    let _e94 = n;
    let _e101 = textureLoad(tShadowAtlasTexture, (vec2<i32>(_e84.yz) + clamp(vec2<i32>((_e87 * _e88.w)), vec2(0i), vec2((_e94 - 1i)))), 0i);
    return _e101.x;
}

fn grassHash(p: vec3<f32>) -> f32 {
    var p_1: vec3<f32>;

    p_1 = p;
    let _e54 = p_1;
    return fract((sin(dot(_e54, vec3<f32>(127.1f, 311.7f, 74.7f))) * 43758.547f));
}

fn grassHash3_(p_2: vec3<f32>) -> vec3<f32> {
    var p_3: vec3<f32>;

    p_3 = p_2;
    let _e54 = p_3;
    let _e60 = p_3;
    let _e66 = p_3;
    return fract((sin(vec3<f32>(dot(_e54, vec3<f32>(127.1f, 311.7f, 74.7f)), dot(_e60, vec3<f32>(269.5f, 183.3f, 246.1f)), dot(_e66, vec3<f32>(113.5f, 271.9f, 124.6f)))) * 43758.547f));
}

fn grassNoise3_(p_4: vec3<f32>, per: f32) -> vec3<f32> {
    var p_5: vec3<f32>;
    var per_1: f32;
    var i: vec3<f32>;
    var f: vec3<f32>;
    var a: vec3<f32>;
    var b: vec3<f32>;
    var c_1: vec3<f32>;
    var d: vec3<f32>;
    var e: vec3<f32>;
    var g: vec3<f32>;
    var h: vec3<f32>;
    var k: vec3<f32>;

    p_5 = p_4;
    per_1 = per;
    let _e56 = p_5;
    i = floor(_e56);
    let _e59 = p_5;
    f = fract(_e59);
    let _e62 = f;
    let _e63 = f;
    let _e67 = f;
    f = ((_e62 * _e63) * (vec3(3f) - (2f * _e67)));
    let _e72 = i;
    let _e73 = per_1;
    let _e74 = vec3(_e73);
    let _e79 = grassHash3_((_e72 - (floor((_e72 / _e74)) * _e74)));
    a = _e79;
    let _e81 = i;
    let _e86 = (_e81 + vec3<f32>(1f, 0f, 0f));
    let _e87 = per_1;
    let _e88 = vec3(_e87);
    let _e93 = grassHash3_((_e86 - (floor((_e86 / _e88)) * _e88)));
    b = _e93;
    let _e95 = i;
    let _e100 = (_e95 + vec3<f32>(0f, 1f, 0f));
    let _e101 = per_1;
    let _e102 = vec3(_e101);
    let _e107 = grassHash3_((_e100 - (floor((_e100 / _e102)) * _e102)));
    c_1 = _e107;
    let _e109 = i;
    let _e114 = (_e109 + vec3<f32>(1f, 1f, 0f));
    let _e115 = per_1;
    let _e116 = vec3(_e115);
    let _e121 = grassHash3_((_e114 - (floor((_e114 / _e116)) * _e116)));
    d = _e121;
    let _e123 = i;
    let _e128 = (_e123 + vec3<f32>(0f, 0f, 1f));
    let _e129 = per_1;
    let _e130 = vec3(_e129);
    let _e135 = grassHash3_((_e128 - (floor((_e128 / _e130)) * _e130)));
    e = _e135;
    let _e137 = i;
    let _e142 = (_e137 + vec3<f32>(1f, 0f, 1f));
    let _e143 = per_1;
    let _e144 = vec3(_e143);
    let _e149 = grassHash3_((_e142 - (floor((_e142 / _e144)) * _e144)));
    g = _e149;
    let _e151 = i;
    let _e156 = (_e151 + vec3<f32>(0f, 1f, 1f));
    let _e157 = per_1;
    let _e158 = vec3(_e157);
    let _e163 = grassHash3_((_e156 - (floor((_e156 / _e158)) * _e158)));
    h = _e163;
    let _e165 = i;
    let _e170 = (_e165 + vec3<f32>(1f, 1f, 1f));
    let _e171 = per_1;
    let _e172 = vec3(_e171);
    let _e177 = grassHash3_((_e170 - (floor((_e170 / _e172)) * _e172)));
    k = _e177;
    let _e179 = a;
    let _e180 = b;
    let _e181 = f;
    let _e185 = c_1;
    let _e186 = d;
    let _e187 = f;
    let _e191 = f;
    let _e195 = e;
    let _e196 = g;
    let _e197 = f;
    let _e201 = h;
    let _e202 = k;
    let _e203 = f;
    let _e207 = f;
    let _e211 = f;
    return mix(mix(mix(_e179, _e180, vec3(_e181.x)), mix(_e185, _e186, vec3(_e187.x)), vec3(_e191.y)), mix(mix(_e195, _e196, vec3(_e197.x)), mix(_e201, _e202, vec3(_e203.x)), vec3(_e207.y)), vec3(_e211.z));
}

fn grassNoise1_(p_6: vec3<f32>) -> f32 {
    var p_7: vec3<f32>;
    var i_1: vec3<f32>;
    var f_1: vec3<f32>;

    p_7 = p_6;
    let _e54 = p_7;
    i_1 = floor(_e54);
    let _e57 = p_7;
    f_1 = fract(_e57);
    let _e60 = f_1;
    let _e61 = f_1;
    let _e65 = f_1;
    f_1 = ((_e60 * _e61) * (vec3(3f) - (2f * _e65)));
    let _e70 = i_1;
    let _e71 = grassHash(_e70);
    let _e72 = i_1;
    let _e78 = grassHash((_e72 + vec3<f32>(1f, 0f, 0f)));
    let _e79 = f_1;
    let _e82 = i_1;
    let _e88 = grassHash((_e82 + vec3<f32>(0f, 1f, 0f)));
    let _e89 = i_1;
    let _e95 = grassHash((_e89 + vec3<f32>(1f, 1f, 0f)));
    let _e96 = f_1;
    let _e99 = f_1;
    let _e102 = i_1;
    let _e108 = grassHash((_e102 + vec3<f32>(0f, 0f, 1f)));
    let _e109 = i_1;
    let _e115 = grassHash((_e109 + vec3<f32>(1f, 0f, 1f)));
    let _e116 = f_1;
    let _e119 = i_1;
    let _e125 = grassHash((_e119 + vec3<f32>(0f, 1f, 1f)));
    let _e126 = i_1;
    let _e132 = grassHash((_e126 + vec3<f32>(1f, 1f, 1f)));
    let _e133 = f_1;
    let _e136 = f_1;
    let _e139 = f_1;
    return mix(mix(mix(_e71, _e78, _e79.x), mix(_e88, _e95, _e96.x), _e99.y), mix(mix(_e108, _e115, _e116.x), mix(_e125, _e132, _e133.x), _e136.y), _e139.z);
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
    var wp_2: vec3<f32>;
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
    let _e54 = iWave_1;
    let _e60 = grassHash(((_e54 * 0.731f) + vec3(0.17f)));
    ps = _e60;
    let _e62 = ps;
    rq = floor((_e62 * 4f));
    let _e67 = aBlade_1;
    bx = _e67.xy;
    let _e70 = rq;
    if (_e70 < 1f) {
        let _e73 = bx;
        local_2 = _e73;
    } else {
        let _e74 = rq;
        if (_e74 < 2f) {
            let _e77 = bx;
            let _e80 = bx;
            local_1 = vec2<f32>(-(_e77.y), _e80.x);
        } else {
            let _e83 = rq;
            if (_e83 < 3f) {
                let _e86 = bx;
                local = -(_e86);
            } else {
                let _e88 = bx;
                let _e90 = bx;
                local = vec2<f32>(_e88.y, -(_e90.x));
            }
            let _e95 = local;
            local_1 = _e95;
        }
        let _e97 = local_1;
        local_2 = _e97;
    }
    let _e99 = local_2;
    bx = _e99;
    let _e100 = ps;
    if (fract((_e100 * 7.13f)) > 0.5f) {
        let _e107 = bx;
        bx.x = -(_e107.x);
    }
    let _e110 = bx;
    cc = _e110;
    let _e112 = iForm_1;
    if (_e112.x > 0.01f) {
        {
            let _e118 = iForm_1;
            let _e121 = global.uPatchK;
            cs = (mix(0.3f, 0.5f, _e118.x) * _e121);
            let _e124 = ps;
            ca = (fract((_e124 * 3.71f)) * 6.2832f);
            let _e131 = ca;
            c0_ = cos(_e131);
            let _e134 = ca;
            s0_ = sin(_e134);
            let _e137 = c0_;
            let _e138 = bx;
            let _e141 = s0_;
            let _e142 = bx;
            let _e146 = s0_;
            let _e148 = bx;
            let _e151 = c0_;
            let _e152 = bx;
            q = vec2<f32>(((_e137 * _e138.x) + (_e141 * _e142.y)), ((-(_e146) * _e148.x) + (_e151 * _e152.y)));
            let _e158 = q;
            let _e159 = cs;
            cell = floor((_e158 / vec2(_e159)));
            let _e164 = cell;
            let _e165 = ps;
            let _e171 = grassHash3_(vec3<f32>(_e164.x, _e164.y, (_e165 * 17f)));
            jh = _e171;
            let _e173 = cell;
            let _e174 = jh;
            let _e177 = cs;
            cq = ((_e173 + _e174.xy) * _e177);
            let _e180 = c0_;
            let _e181 = cq;
            let _e184 = s0_;
            let _e185 = cq;
            let _e189 = s0_;
            let _e190 = cq;
            let _e193 = c0_;
            let _e194 = cq;
            cc = vec2<f32>(((_e180 * _e181.x) - (_e184 * _e185.y)), ((_e189 * _e190.x) + (_e193 * _e194.y)));
            let _e199 = bx;
            let _e200 = cc;
            let _e201 = bx;
            let _e202 = cc;
            let _e206 = jh;
            let _e212 = iForm_1;
            bx = mix(_e199, (_e200 + ((_e201 - _e202) * (0.08f + (0.2f * _e206.z)))), vec2(_e212.x));
        }
    }
    let _e216 = aBlade_1;
    let _e218 = ps;
    rr = fract((_e216.z + (_e218 * 0.618f)));
    let _e224 = global.modelMatrix;
    let _e225 = im_1;
    let _e227 = bx;
    let _e230 = bx;
    pc = ((_e224 * _e225) * vec4<f32>(_e227.x, 0f, _e230.y, 1f));
    let _e236 = pc;
    dc = length(_e236.xyz);
    let _e240 = bx;
    u0_ = ((_e240.x * 0.5f) + 0.5f);
    let _e247 = bx;
    v0_ = ((_e247.y * 0.5f) + 0.5f);
    let _e254 = iBare_1;
    let _e256 = iBare_1;
    let _e258 = u0_;
    let _e260 = iBare_1;
    let _e262 = iBare_1;
    let _e264 = u0_;
    let _e266 = v0_;
    gb = mix(mix(_e254.x, _e256.y, _e258), mix(_e260.z, _e262.w, _e264), _e266);
    let _e270 = global.uFadeR;
    let _e273 = global.uFadeR;
    let _e274 = dc;
    let _e277 = global.uFadeIn;
    let _e280 = global.uFadeIn;
    let _e283 = dc;
    fade = ((1f - smoothstep((_e270 * 0.7f), _e273, _e274)) * smoothstep((_e277 - 8f), (_e280 + 2f), _e283));
    let _e287 = rr;
    let _e288 = iGrass_1;
    let _e294 = gb;
    let _e299 = fade;
    if (_e287 >= (((_e288.x * 1.5f) * smoothstep(0.25f, 0.75f, (_e294 + 0.25f))) * _e299)) {
        return vec3(0f);
    }
    let _e304 = im_1;
    let _e314 = bx;
    let _e317 = bx;
    off = (mat3x3<f32>(_e304[0].xyz, _e304[1].xyz, _e304[2].xyz) * vec3<f32>(_e314.x, 0f, _e317.y));
    let _e322 = iWave_1;
    let _e323 = off;
    wp_2 = (_e322 + _e323);
    let _e326 = wp_2;
    let _e331 = grassNoise3_((_e326 / vec3(3.2f)), 640f);
    nz = _e331;
    let _e333 = nz;
    n1_ = _e333.x;
    let _e336 = nz;
    n2_ = _e336.y;
    let _e339 = iGrass_1;
    let _e342 = n1_;
    let _e347 = gb;
    let _e349 = n2_;
    let _e356 = fade;
    dens = (((_e339.x * (0.5f + _e342)) * smoothstep(0.25f, 0.75f, (_e347 + (0.5f * (_e349 - 0.5f))))) * _e356);
    let _e359 = dens;
    let _e363 = pc;
    let _e365 = trunkSumV(_e363.xyz);
    dens = (_e359 * (1f - smoothstep(0.08f, 0.3f, _e365)));
    let _e369 = aV_1;
    vGT = _e369.x;
    let _e371 = rr;
    vGK = fract((_e371 * 13.71f));
    let _e376 = dens;
    let _e381 = aV_1;
    vGS = ((1.5f * min(_e376, 1f)) * (1f - _e381.x));
    let _e385 = rr;
    let _e386 = dens;
    if (_e385 >= _e386) {
        return vec3(0f);
    }
    let _e390 = aV_1;
    t = _e390.x;
    let _e393 = aV_1;
    side = _e393.y;
    let _e396 = rr;
    k1_ = fract((_e396 * 7.31f));
    let _e401 = rr;
    let _e404 = aBlade_1;
    k2_ = fract(((_e401 * 3.17f) + (_e404.w * 0.13f)));
    let _e411 = iGrass_1;
    let _e415 = nz;
    snow = (_e411.w * (0.4f + (1.2f * _e415.z)));
    let _e421 = iGrass_1;
    let _e425 = k1_;
    let _e431 = n2_;
    let _e435 = snow;
    hb = (((_e421.y * (0.45f + (0.9f * _e425))) * (0.75f + (0.5f * _e431))) - _e435);
    let _e438 = hb;
    if (_e438 < 0.02f) {
        return vec3(0f);
    }
    let _e443 = snow;
    held = exp((-(_e443) * 6f));
    let _e449 = aBlade_1;
    let _e451 = ps;
    yaw = (_e449.w + (_e451 * 6.2832f));
    let _e456 = yaw;
    let _e458 = yaw;
    f_2 = vec2<f32>(cos(_e456), sin(_e458));
    let _e462 = f_2;
    let _e465 = f_2;
    p_8 = vec2<f32>(-(_e462.y), _e465.x);
    let _e469 = f_2;
    let _e470 = iGrass_1;
    let _e475 = k2_;
    let _e481 = held;
    B = (((_e469 * _e470.z) * (0.15f + (0.85f * _e475))) * (0.4f + (0.6f * _e481)));
    let _e486 = im_1;
    let _e497 = global.uWindL;
    wl = (transpose(mat3x3<f32>(_e486[0].xyz, _e486[1].xyz, _e486[2].xyz)) * _e497);
    let _e500 = wl;
    if (length(_e500.xz) > 0.0001f) {
        let _e505 = wl;
        local_3 = normalize(_e505.xz);
    } else {
        local_3 = vec2<f32>(1f, 0f);
    }
    let _e512 = local_3;
    wd = _e512;
    let _e516 = wp_2;
    let _e520 = global.uWindL;
    let _e521 = global.uWindT;
    let _e526 = k1_;
    let _e531 = grassNoise1_((((_e516 / vec3(7f)) - (_e520 * (_e521 * 0.6f))) + vec3((_e526 * 0.12f))));
    g_1 = smoothstep(0.2f, 0.85f, _e531);
    let _e534 = B;
    let _e535 = wd;
    let _e536 = global.uGrassWind;
    let _e540 = g_1;
    let _e546 = k2_;
    let _e550 = held;
    B = (_e534 + ((((_e535 * _e536) * (0.25f + (0.75f * _e540))) * (0.7f + (0.6f * _e546))) * _e550));
    let _e553 = B;
    let _e556 = iForm_1;
    B = (_e553 * mix(1f, 0.35f, _e556.z));
    let _e560 = bx;
    let _e561 = cc;
    out2_ = (_e560 - _e561);
    let _e564 = iForm_1;
    let _e568 = out2_;
    let _e569 = out2_;
    if ((_e564.w > 0f) && (dot(_e568, _e569) > 0.00000001f)) {
        let _e574 = B;
        let _e575 = out2_;
        let _e577 = iForm_1;
        let _e582 = k2_;
        B = (_e574 + ((normalize(_e575) * _e577.w) * (0.7f + (0.6f * _e582))));
    }
    let _e587 = B;
    bl = length(_e587);
    let _e590 = bl;
    if (_e590 > 1.2f) {
        let _e593 = B;
        let _e595 = bl;
        B = (_e593 * (1.2f / _e595));
    }
    let _e598 = bx;
    u = ((_e598.x * 0.5f) + 0.5f);
    let _e605 = bx;
    v = ((_e605.y * 0.5f) + 0.5f);
    let _e612 = iCorner_1;
    let _e614 = iCorner_1;
    let _e616 = u;
    let _e618 = iCorner_1;
    let _e620 = iCorner_1;
    let _e622 = u;
    let _e624 = v;
    hg = mix(mix(_e612.x, _e614.y, _e616), mix(_e618.z, _e620.w, _e622), _e624);
    let _e627 = global.uBladeW;
    let _e628 = iForm_1;
    let _e633 = k2_;
    let _e639 = iGrass_1;
    let _e645 = t;
    w = ((((_e627 * _e628.y) * (0.6f + (0.8f * _e633))) * (1f + (0.6f * _e639.y))) * pow((1f - _e645), 0.7f));
    vGA = 1f;
    let _e652 = side;
    vGSide = _e652;
    let _e653 = global.uCover;
    if (_e653.x > 0.5f) {
        {
            let _e657 = global.modelMatrix;
            let _e668 = global.uCoverL;
            lM = (transpose(mat3x3<f32>(_e657[0].xyz, _e657[1].xyz, _e657[2].xyz)) * _e668);
            let _e673 = im_1[0];
            let _e675 = lM;
            let _e679 = im_1[2];
            let _e681 = lM;
            hL = vec2<f32>(dot(_e673.xyz, _e675), dot(_e679.xyz, _e681));
            let _e685 = hL;
            let _e686 = hL;
            if (dot(_e685, _e686) > 0.0000000001f) {
                {
                    let _e690 = hL;
                    hL = normalize(_e690);
                    let _e692 = hL;
                    let _e695 = hL;
                    p_8 = vec2<f32>(-(_e692.y), _e695.x);
                }
            }
            let _e698 = w;
            wv = (_e698 * 0.64f);
            let _e702 = wv;
            let _e703 = global.uCover;
            we = max(_e702, _e703.y);
            let _e707 = wv;
            let _e708 = we;
            vGA = (_e707 / max(_e708, 0.000001f));
            let _e712 = we;
            w = _e712;
        }
    }
    let _e713 = bx;
    let _e714 = B;
    let _e715 = hb;
    let _e717 = t;
    let _e719 = t;
    let _e721 = p_8;
    let _e722 = w;
    let _e724 = side;
    let _e727 = global.uPatchK;
    xz = (_e713 + (((((_e714 * _e715) * _e717) * _e719) + ((_e721 * _e722) * _e724)) * _e727));
    let _e731 = xz;
    let _e733 = hg;
    let _e734 = snow;
    let _e736 = hb;
    let _e737 = t;
    let _e741 = B;
    let _e742 = B;
    let _e745 = t;
    let _e750 = xz;
    return vec3<f32>(_e731.x, ((_e733 + _e734) + ((_e736 * _e737) * (1f - ((0.3f * dot(_e741, _e742)) * _e745)))), _e750.y);
}

fn main_1() {
    var p_9: vec3<f32>;
    var wp_3: vec4<f32>;

    let _e54 = instance0_1;
    let _e55 = instance1_1;
    let _e56 = instance2_1;
    let _e57 = instance3_1;
    let _e79 = grassBlade(mat4x4<f32>(vec4<f32>(_e54.x, _e54.y, _e54.z, _e54.w), vec4<f32>(_e55.x, _e55.y, _e55.z, _e55.w), vec4<f32>(_e56.x, _e56.y, _e56.z, _e56.w), vec4<f32>(_e57.x, _e57.y, _e57.z, _e57.w)));
    p_9 = _e79;
    let _e81 = global.modelMatrix;
    let _e82 = instance0_1;
    let _e83 = instance1_1;
    let _e84 = instance2_1;
    let _e85 = instance3_1;
    let _e108 = p_9;
    wp_3 = ((_e81 * mat4x4<f32>(vec4<f32>(_e82.x, _e82.y, _e82.z, _e82.w), vec4<f32>(_e83.x, _e83.y, _e83.z, _e83.w), vec4<f32>(_e84.x, _e84.y, _e84.z, _e84.w), vec4<f32>(_e85.x, _e85.y, _e85.z, _e85.w))) * vec4<f32>(_e108.x, _e108.y, _e108.z, 1f));
    let _e116 = global.modelMatrix;
    let _e127 = instance0_1;
    let _e128 = instance1_1;
    let _e129 = instance2_1;
    let _e130 = instance3_1;
    vNormal = normalize((mat3x3<f32>(_e116[0].xyz, _e116[1].xyz, _e116[2].xyz) * mat4x4<f32>(vec4<f32>(_e127.x, _e127.y, _e127.z, _e127.w), vec4<f32>(_e128.x, _e128.y, _e128.z, _e128.w), vec4<f32>(_e129.x, _e129.y, _e129.z, _e129.w), vec4<f32>(_e130.x, _e130.y, _e130.z, _e130.w))[1].xyz));
    let _e156 = instanceColor_1;
    vTint = _e156;
    let _e157 = vGS;
    let _e158 = vNormal;
    let _e159 = global.uSunShadowDir;
    vGS = (_e157 / max(dot(_e158, _e159), 0.08f));
    let _e165 = global.projectionMatrix;
    let _e166 = global.viewMatrix;
    let _e168 = wp_3;
    gl_Position = ((_e165 * _e166) * _e168);
    return;
}

@vertex 
fn main(@location(0) position: vec3<f32>, @location(1) normal: vec3<f32>, @location(2) instance0_: vec4<f32>, @location(3) instance1_: vec4<f32>, @location(4) instance2_: vec4<f32>, @location(5) instance3_: vec4<f32>, @location(6) instanceColor: vec3<f32>, @location(7) aBlade: vec4<f32>, @location(8) aV: vec2<f32>, @location(9) iCorner: vec4<f32>, @location(10) iBare: vec4<f32>, @location(11) iGrass: vec4<f32>, @location(12) iWave: vec3<f32>, @location(13) iForm: vec4<f32>) -> VertexOutput {
    position_1 = position;
    normal_1 = normal;
    instance0_1 = instance0_;
    instance1_1 = instance1_;
    instance2_1 = instance2_;
    instance3_1 = instance3_;
    instanceColor_1 = instanceColor;
    aBlade_1 = aBlade;
    aV_1 = aV;
    iCorner_1 = iCorner;
    iBare_1 = iBare;
    iGrass_1 = iGrass;
    iWave_1 = iWave;
    iForm_1 = iForm;
    main_1();
    let _e107 = vGA;
    let _e109 = vGSide;
    let _e111 = vGT;
    let _e113 = vGK;
    let _e115 = vGS;
    let _e117 = vNormal;
    let _e119 = vTint;
    let _e121 = gl_Position;
    return VertexOutput(_e107, _e109, _e111, _e113, _e115, _e117, _e119, _e121);
}
`;
