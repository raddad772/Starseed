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
    let _e53 = p_1;
    return fract((sin(dot(_e53, vec3<f32>(127.1f, 311.7f, 74.7f))) * 43758.547f));
}

fn grassHash3_(p_2: vec3<f32>) -> vec3<f32> {
    var p_3: vec3<f32>;

    p_3 = p_2;
    let _e53 = p_3;
    let _e59 = p_3;
    let _e65 = p_3;
    return fract((sin(vec3<f32>(dot(_e53, vec3<f32>(127.1f, 311.7f, 74.7f)), dot(_e59, vec3<f32>(269.5f, 183.3f, 246.1f)), dot(_e65, vec3<f32>(113.5f, 271.9f, 124.6f)))) * 43758.547f));
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
    let _e55 = p_5;
    i = floor(_e55);
    let _e58 = p_5;
    f = fract(_e58);
    let _e61 = f;
    let _e62 = f;
    let _e66 = f;
    f = ((_e61 * _e62) * (vec3(3f) - (2f * _e66)));
    let _e71 = i;
    let _e72 = per_1;
    let _e73 = vec3(_e72);
    let _e78 = grassHash3_((_e71 - (floor((_e71 / _e73)) * _e73)));
    a = _e78;
    let _e80 = i;
    let _e85 = (_e80 + vec3<f32>(1f, 0f, 0f));
    let _e86 = per_1;
    let _e87 = vec3(_e86);
    let _e92 = grassHash3_((_e85 - (floor((_e85 / _e87)) * _e87)));
    b = _e92;
    let _e94 = i;
    let _e99 = (_e94 + vec3<f32>(0f, 1f, 0f));
    let _e100 = per_1;
    let _e101 = vec3(_e100);
    let _e106 = grassHash3_((_e99 - (floor((_e99 / _e101)) * _e101)));
    c_1 = _e106;
    let _e108 = i;
    let _e113 = (_e108 + vec3<f32>(1f, 1f, 0f));
    let _e114 = per_1;
    let _e115 = vec3(_e114);
    let _e120 = grassHash3_((_e113 - (floor((_e113 / _e115)) * _e115)));
    d = _e120;
    let _e122 = i;
    let _e127 = (_e122 + vec3<f32>(0f, 0f, 1f));
    let _e128 = per_1;
    let _e129 = vec3(_e128);
    let _e134 = grassHash3_((_e127 - (floor((_e127 / _e129)) * _e129)));
    e = _e134;
    let _e136 = i;
    let _e141 = (_e136 + vec3<f32>(1f, 0f, 1f));
    let _e142 = per_1;
    let _e143 = vec3(_e142);
    let _e148 = grassHash3_((_e141 - (floor((_e141 / _e143)) * _e143)));
    g = _e148;
    let _e150 = i;
    let _e155 = (_e150 + vec3<f32>(0f, 1f, 1f));
    let _e156 = per_1;
    let _e157 = vec3(_e156);
    let _e162 = grassHash3_((_e155 - (floor((_e155 / _e157)) * _e157)));
    h = _e162;
    let _e164 = i;
    let _e169 = (_e164 + vec3<f32>(1f, 1f, 1f));
    let _e170 = per_1;
    let _e171 = vec3(_e170);
    let _e176 = grassHash3_((_e169 - (floor((_e169 / _e171)) * _e171)));
    k = _e176;
    let _e178 = a;
    let _e179 = b;
    let _e180 = f;
    let _e184 = c_1;
    let _e185 = d;
    let _e186 = f;
    let _e190 = f;
    let _e194 = e;
    let _e195 = g;
    let _e196 = f;
    let _e200 = h;
    let _e201 = k;
    let _e202 = f;
    let _e206 = f;
    let _e210 = f;
    return mix(mix(mix(_e178, _e179, vec3(_e180.x)), mix(_e184, _e185, vec3(_e186.x)), vec3(_e190.y)), mix(mix(_e194, _e195, vec3(_e196.x)), mix(_e200, _e201, vec3(_e202.x)), vec3(_e206.y)), vec3(_e210.z));
}

fn grassNoise1_(p_6: vec3<f32>) -> f32 {
    var p_7: vec3<f32>;
    var i_1: vec3<f32>;
    var f_1: vec3<f32>;

    p_7 = p_6;
    let _e53 = p_7;
    i_1 = floor(_e53);
    let _e56 = p_7;
    f_1 = fract(_e56);
    let _e59 = f_1;
    let _e60 = f_1;
    let _e64 = f_1;
    f_1 = ((_e59 * _e60) * (vec3(3f) - (2f * _e64)));
    let _e69 = i_1;
    let _e70 = grassHash(_e69);
    let _e71 = i_1;
    let _e77 = grassHash((_e71 + vec3<f32>(1f, 0f, 0f)));
    let _e78 = f_1;
    let _e81 = i_1;
    let _e87 = grassHash((_e81 + vec3<f32>(0f, 1f, 0f)));
    let _e88 = i_1;
    let _e94 = grassHash((_e88 + vec3<f32>(1f, 1f, 0f)));
    let _e95 = f_1;
    let _e98 = f_1;
    let _e101 = i_1;
    let _e107 = grassHash((_e101 + vec3<f32>(0f, 0f, 1f)));
    let _e108 = i_1;
    let _e114 = grassHash((_e108 + vec3<f32>(1f, 0f, 1f)));
    let _e115 = f_1;
    let _e118 = i_1;
    let _e124 = grassHash((_e118 + vec3<f32>(0f, 1f, 1f)));
    let _e125 = i_1;
    let _e131 = grassHash((_e125 + vec3<f32>(1f, 1f, 1f)));
    let _e132 = f_1;
    let _e135 = f_1;
    let _e138 = f_1;
    return mix(mix(mix(_e70, _e77, _e78.x), mix(_e87, _e94, _e95.x), _e98.y), mix(mix(_e107, _e114, _e115.x), mix(_e124, _e131, _e132.x), _e135.y), _e138.z);
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
    let _e53 = iWave_1;
    let _e59 = grassHash(((_e53 * 0.731f) + vec3(0.17f)));
    ps = _e59;
    let _e61 = ps;
    rq = floor((_e61 * 4f));
    let _e66 = aBlade_1;
    bx = _e66.xy;
    let _e69 = rq;
    if (_e69 < 1f) {
        let _e72 = bx;
        local_2 = _e72;
    } else {
        let _e73 = rq;
        if (_e73 < 2f) {
            let _e76 = bx;
            let _e79 = bx;
            local_1 = vec2<f32>(-(_e76.y), _e79.x);
        } else {
            let _e82 = rq;
            if (_e82 < 3f) {
                let _e85 = bx;
                local = -(_e85);
            } else {
                let _e87 = bx;
                let _e89 = bx;
                local = vec2<f32>(_e87.y, -(_e89.x));
            }
            let _e94 = local;
            local_1 = _e94;
        }
        let _e96 = local_1;
        local_2 = _e96;
    }
    let _e98 = local_2;
    bx = _e98;
    let _e99 = ps;
    if (fract((_e99 * 7.13f)) > 0.5f) {
        let _e106 = bx;
        bx.x = -(_e106.x);
    }
    let _e109 = aBlade_1;
    let _e111 = ps;
    rr = fract((_e109.z + (_e111 * 0.618f)));
    let _e117 = global.modelMatrix;
    let _e118 = im_1;
    let _e120 = bx;
    let _e123 = bx;
    pc = ((_e117 * _e118) * vec4<f32>(_e120.x, 0f, _e123.y, 1f));
    let _e129 = pc;
    dc = length(_e129.xyz);
    let _e133 = bx;
    u0_ = ((_e133.x * 0.5f) + 0.5f);
    let _e140 = bx;
    v0_ = ((_e140.y * 0.5f) + 0.5f);
    let _e147 = iBare_1;
    let _e149 = iBare_1;
    let _e151 = u0_;
    let _e153 = iBare_1;
    let _e155 = iBare_1;
    let _e157 = u0_;
    let _e159 = v0_;
    gb = mix(mix(_e147.x, _e149.y, _e151), mix(_e153.z, _e155.w, _e157), _e159);
    let _e163 = global.uFadeR;
    let _e166 = global.uFadeR;
    let _e167 = dc;
    let _e170 = global.uFadeIn;
    let _e173 = global.uFadeIn;
    let _e176 = dc;
    fade = ((1f - smoothstep((_e163 * 0.7f), _e166, _e167)) * smoothstep((_e170 - 8f), (_e173 + 2f), _e176));
    let _e180 = rr;
    let _e181 = iGrass_1;
    let _e187 = gb;
    let _e192 = fade;
    if (_e180 >= (((_e181.x * 1.5f) * smoothstep(0.25f, 0.75f, (_e187 + 0.25f))) * _e192)) {
        return vec3(0f);
    }
    let _e197 = im_1;
    let _e207 = bx;
    let _e210 = bx;
    off = (mat3x3<f32>(_e197[0].xyz, _e197[1].xyz, _e197[2].xyz) * vec3<f32>(_e207.x, 0f, _e210.y));
    let _e215 = iWave_1;
    let _e216 = off;
    wp_2 = (_e215 + _e216);
    let _e219 = wp_2;
    let _e224 = grassNoise3_((_e219 / vec3(3.2f)), 640f);
    nz = _e224;
    let _e226 = nz;
    n1_ = _e226.x;
    let _e229 = nz;
    n2_ = _e229.y;
    let _e232 = iGrass_1;
    let _e235 = n1_;
    let _e240 = gb;
    let _e242 = n2_;
    let _e249 = fade;
    dens = (((_e232.x * (0.5f + _e235)) * smoothstep(0.25f, 0.75f, (_e240 + (0.5f * (_e242 - 0.5f))))) * _e249);
    let _e252 = dens;
    let _e256 = pc;
    let _e258 = trunkSumV(_e256.xyz);
    dens = (_e252 * (1f - smoothstep(0.08f, 0.3f, _e258)));
    let _e262 = aV_1;
    vGT = _e262.x;
    let _e264 = rr;
    vGK = fract((_e264 * 13.71f));
    let _e269 = dens;
    let _e274 = aV_1;
    vGS = ((1.5f * min(_e269, 1f)) * (1f - _e274.x));
    let _e278 = rr;
    let _e279 = dens;
    if (_e278 >= _e279) {
        return vec3(0f);
    }
    let _e283 = aV_1;
    t = _e283.x;
    let _e286 = aV_1;
    side = _e286.y;
    let _e289 = rr;
    k1_ = fract((_e289 * 7.31f));
    let _e294 = rr;
    let _e297 = aBlade_1;
    k2_ = fract(((_e294 * 3.17f) + (_e297.w * 0.13f)));
    let _e304 = iGrass_1;
    let _e308 = nz;
    snow = (_e304.w * (0.4f + (1.2f * _e308.z)));
    let _e314 = iGrass_1;
    let _e318 = k1_;
    let _e324 = n2_;
    let _e328 = snow;
    hb = (((_e314.y * (0.45f + (0.9f * _e318))) * (0.75f + (0.5f * _e324))) - _e328);
    let _e331 = hb;
    if (_e331 < 0.02f) {
        return vec3(0f);
    }
    let _e336 = snow;
    held = exp((-(_e336) * 6f));
    let _e342 = aBlade_1;
    let _e344 = ps;
    yaw = (_e342.w + (_e344 * 6.2832f));
    let _e349 = yaw;
    let _e351 = yaw;
    f_2 = vec2<f32>(cos(_e349), sin(_e351));
    let _e355 = f_2;
    let _e358 = f_2;
    p_8 = vec2<f32>(-(_e355.y), _e358.x);
    let _e362 = f_2;
    let _e363 = iGrass_1;
    let _e368 = k2_;
    let _e374 = held;
    B = (((_e362 * _e363.z) * (0.15f + (0.85f * _e368))) * (0.4f + (0.6f * _e374)));
    let _e379 = im_1;
    let _e390 = global.uWindL;
    wl = (transpose(mat3x3<f32>(_e379[0].xyz, _e379[1].xyz, _e379[2].xyz)) * _e390);
    let _e393 = wl;
    if (length(_e393.xz) > 0.0001f) {
        let _e398 = wl;
        local_3 = normalize(_e398.xz);
    } else {
        local_3 = vec2<f32>(1f, 0f);
    }
    let _e405 = local_3;
    wd = _e405;
    let _e409 = wp_2;
    let _e413 = global.uWindL;
    let _e414 = global.uWindT;
    let _e419 = k1_;
    let _e424 = grassNoise1_((((_e409 / vec3(7f)) - (_e413 * (_e414 * 0.6f))) + vec3((_e419 * 0.12f))));
    g_1 = smoothstep(0.2f, 0.85f, _e424);
    let _e427 = B;
    let _e428 = wd;
    let _e429 = global.uGrassWind;
    let _e433 = g_1;
    let _e439 = k2_;
    let _e443 = held;
    B = (_e427 + ((((_e428 * _e429) * (0.25f + (0.75f * _e433))) * (0.7f + (0.6f * _e439))) * _e443));
    let _e446 = B;
    bl = length(_e446);
    let _e449 = bl;
    if (_e449 > 1.2f) {
        let _e452 = B;
        let _e454 = bl;
        B = (_e452 * (1.2f / _e454));
    }
    let _e457 = bx;
    u = ((_e457.x * 0.5f) + 0.5f);
    let _e464 = bx;
    v = ((_e464.y * 0.5f) + 0.5f);
    let _e471 = iCorner_1;
    let _e473 = iCorner_1;
    let _e475 = u;
    let _e477 = iCorner_1;
    let _e479 = iCorner_1;
    let _e481 = u;
    let _e483 = v;
    hg = mix(mix(_e471.x, _e473.y, _e475), mix(_e477.z, _e479.w, _e481), _e483);
    let _e486 = global.uBladeW;
    let _e489 = k2_;
    let _e495 = iGrass_1;
    let _e501 = t;
    w = (((_e486 * (0.6f + (0.8f * _e489))) * (1f + (0.6f * _e495.y))) * pow((1f - _e501), 0.7f));
    vGA = 1f;
    let _e508 = side;
    vGSide = _e508;
    let _e509 = global.uCover;
    if (_e509.x > 0.5f) {
        {
            let _e513 = global.modelMatrix;
            let _e524 = global.uCoverL;
            lM = (transpose(mat3x3<f32>(_e513[0].xyz, _e513[1].xyz, _e513[2].xyz)) * _e524);
            let _e529 = im_1[0];
            let _e531 = lM;
            let _e535 = im_1[2];
            let _e537 = lM;
            hL = vec2<f32>(dot(_e529.xyz, _e531), dot(_e535.xyz, _e537));
            let _e541 = hL;
            let _e542 = hL;
            if (dot(_e541, _e542) > 0.0000000001f) {
                {
                    let _e546 = hL;
                    hL = normalize(_e546);
                    let _e548 = hL;
                    let _e551 = hL;
                    p_8 = vec2<f32>(-(_e548.y), _e551.x);
                }
            }
            let _e554 = w;
            wv = (_e554 * 0.64f);
            let _e558 = wv;
            let _e559 = global.uCover;
            we = max(_e558, _e559.y);
            let _e563 = wv;
            let _e564 = we;
            vGA = (_e563 / max(_e564, 0.000001f));
            let _e568 = we;
            w = _e568;
        }
    }
    let _e569 = bx;
    let _e570 = B;
    let _e571 = hb;
    let _e573 = t;
    let _e575 = t;
    let _e577 = p_8;
    let _e578 = w;
    let _e580 = side;
    let _e583 = global.uPatchK;
    xz = (_e569 + (((((_e570 * _e571) * _e573) * _e575) + ((_e577 * _e578) * _e580)) * _e583));
    let _e587 = xz;
    let _e589 = hg;
    let _e590 = snow;
    let _e592 = hb;
    let _e593 = t;
    let _e597 = B;
    let _e598 = B;
    let _e601 = t;
    let _e606 = xz;
    return vec3<f32>(_e587.x, ((_e589 + _e590) + ((_e592 * _e593) * (1f - ((0.3f * dot(_e597, _e598)) * _e601)))), _e606.y);
}

fn main_1() {
    var p_9: vec3<f32>;
    var wp_3: vec4<f32>;

    let _e53 = instance0_1;
    let _e54 = instance1_1;
    let _e55 = instance2_1;
    let _e56 = instance3_1;
    let _e78 = grassBlade(mat4x4<f32>(vec4<f32>(_e53.x, _e53.y, _e53.z, _e53.w), vec4<f32>(_e54.x, _e54.y, _e54.z, _e54.w), vec4<f32>(_e55.x, _e55.y, _e55.z, _e55.w), vec4<f32>(_e56.x, _e56.y, _e56.z, _e56.w)));
    p_9 = _e78;
    let _e80 = global.modelMatrix;
    let _e81 = instance0_1;
    let _e82 = instance1_1;
    let _e83 = instance2_1;
    let _e84 = instance3_1;
    let _e107 = p_9;
    wp_3 = ((_e80 * mat4x4<f32>(vec4<f32>(_e81.x, _e81.y, _e81.z, _e81.w), vec4<f32>(_e82.x, _e82.y, _e82.z, _e82.w), vec4<f32>(_e83.x, _e83.y, _e83.z, _e83.w), vec4<f32>(_e84.x, _e84.y, _e84.z, _e84.w))) * vec4<f32>(_e107.x, _e107.y, _e107.z, 1f));
    let _e115 = global.modelMatrix;
    let _e126 = instance0_1;
    let _e127 = instance1_1;
    let _e128 = instance2_1;
    let _e129 = instance3_1;
    vNormal = normalize((mat3x3<f32>(_e115[0].xyz, _e115[1].xyz, _e115[2].xyz) * mat4x4<f32>(vec4<f32>(_e126.x, _e126.y, _e126.z, _e126.w), vec4<f32>(_e127.x, _e127.y, _e127.z, _e127.w), vec4<f32>(_e128.x, _e128.y, _e128.z, _e128.w), vec4<f32>(_e129.x, _e129.y, _e129.z, _e129.w))[1].xyz));
    let _e155 = instanceColor_1;
    vTint = _e155;
    let _e156 = vGS;
    let _e157 = vNormal;
    let _e158 = global.uSunShadowDir;
    vGS = (_e156 / max(dot(_e157, _e158), 0.08f));
    let _e164 = global.projectionMatrix;
    let _e165 = global.viewMatrix;
    let _e167 = wp_3;
    gl_Position = ((_e164 * _e165) * _e167);
    return;
}

@vertex 
fn main(@location(0) position: vec3<f32>, @location(1) normal: vec3<f32>, @location(2) instance0_: vec4<f32>, @location(3) instance1_: vec4<f32>, @location(4) instance2_: vec4<f32>, @location(5) instance3_: vec4<f32>, @location(6) instanceColor: vec3<f32>, @location(7) aBlade: vec4<f32>, @location(8) aV: vec2<f32>, @location(9) iCorner: vec4<f32>, @location(10) iBare: vec4<f32>, @location(11) iGrass: vec4<f32>, @location(12) iWave: vec3<f32>) -> VertexOutput {
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
    main_1();
    let _e103 = vGA;
    let _e105 = vGSide;
    let _e107 = vGT;
    let _e109 = vGK;
    let _e111 = vGS;
    let _e113 = vNormal;
    let _e115 = vTint;
    let _e117 = gl_Position;
    return VertexOutput(_e103, _e105, _e107, _e109, _e111, _e113, _e115, _e117);
}
`;
