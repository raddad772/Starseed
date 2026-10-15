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
      "name": "uSeason",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 192
    },
    {
      "name": "uOriginMod",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 208
    },
    {
      "name": "uOriginRel",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 224
    },
    {
      "name": "uNearOff",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 240
    },
    {
      "name": "uSurfSea",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 252
    },
    {
      "name": "uLiquid",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 256
    },
    {
      "name": "uLiquid2",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 272
    },
    {
      "name": "uTime",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 288
    },
    {
      "name": "uToFixed",
      "type": "mat3",
      "count": 0,
      "align": 16,
      "size": 48,
      "stride": 48,
      "offset": 304
    },
    {
      "name": "uCenter",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 352
    },
    {
      "name": "uColourCube",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 368
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
      "name": "tColourCube",
      "type": "sampler2DArray",
      "count": 0,
      "binding": 3,
      "samplerBinding": 4
    }
  ],
  "bytes": 384,
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
      "name": "nrm",
      "type": "vec4",
      "location": 2
    },
    {
      "name": "liq",
      "type": "vec4",
      "location": 3
    },
    {
      "name": "flw",
      "type": "vec4",
      "location": 4
    },
    {
      "name": "rib",
      "type": "vec4",
      "location": 5
    },
    {
      "name": "col",
      "type": "vec4",
      "location": 6
    }
  ]
};
export const code = /* wgsl */`
struct Params {
    modelMatrix: mat4x4<f32>,
    viewMatrix: mat4x4<f32>,
    projectionMatrix: mat4x4<f32>,
    uSeason: vec4<f32>,
    uOriginMod: vec3<f32>,
    uOriginRel: vec3<f32>,
    uNearOff: vec3<f32>,
    uSurfSea: f32,
    uLiquid: vec4<f32>,
    uLiquid2_: vec4<f32>,
    uTime: f32,
    uToFixed: mat3x3<f32>,
    uCenter: vec3<f32>,
    uColourCube: vec4<f32>,
}

struct VertexOutput {
    @location(0) vNearRel: vec3<f32>,
    @location(1) vWorldPos: vec3<f32>,
    @location(2) vNormal: vec3<f32>,
    @location(3) vFixedPos: vec3<f32>,
    @location(4) vFixedNormal: vec3<f32>,
    @location(5) vCol: vec4<f32>,
    @location(6) vMat: vec4<f32>,
    @location(7) vExt: vec4<f32>,
    @location(8) vLiq: vec4<f32>,
    @location(9) vFlw: vec4<f32>,
    @location(10) vShore: f32,
    @location(11) vMorphK: f32,
    @location(12) vRib: vec2<f32>,
    @builtin(position) gl_Position: vec4<f32>,
}

const PI: f32 = 3.1415927f;
const SURF_A: f32 = 0.1f;

@group(0) @binding(0) 
var<uniform> global: Params;
@group(0) @binding(1) 
var tDetailTexture: texture_2d<f32>;
@group(0) @binding(2) 
var tDetailSampler: sampler;
@group(0) @binding(3) 
var tColourCubeTexture: texture_2d_array<f32>;
@group(0) @binding(4) 
var tColourCubeSampler: sampler;
var<private> position_1: vec3<f32>;
var<private> uv_1: vec2<f32>;
var<private> nrm_1: vec4<f32>;
var<private> liq_1: vec4<f32>;
var<private> flw_1: vec4<f32>;
var<private> rib_1: vec4<f32>;
var<private> col_1: vec4<f32>;
var<private> vNearRel: vec3<f32>;
var<private> vAnchorPos: vec3<f32>;
var<private> vOcc: f32;
var<private> vWorldPos: vec3<f32>;
var<private> vNormal: vec3<f32>;
var<private> vFixedPos: vec3<f32>;
var<private> vFixedNormal: vec3<f32>;
var<private> vCol: vec4<f32>;
var<private> vMat: vec4<f32>;
var<private> vExt: vec4<f32>;
var<private> vLiq: vec4<f32>;
var<private> vFlw: vec4<f32>;
var<private> vShore: f32;
var<private> vMorphK: f32;
var<private> vCls0_: vec4<f32>;
var<private> vCls1_: vec4<f32>;
var<private> vCls2_: vec4<f32>;
var<private> vRib: vec2<f32>;
var<private> gl_Position: vec4<f32>;

fn colourCubeShore(a: f32) -> f32 {
    var a_1: f32;

    a_1 = a;
    let _e42 = a_1;
    let _e49 = global.uColourCube;
    return ((((_e42 * 255f) - 128f) / 127f) * _e49.w);
}

fn colourCubeShoreSmooth(d: vec3<f32>) -> f32 {
    var d_1: vec3<f32>;
    var a_2: vec3<f32>;
    var N: vec3<f32>;
    var U: vec3<f32>;
    var V: vec3<f32>;
    var f: f32;
    var dn: f32;
    var S: f32;
    var x: vec2<f32>;
    var i: vec2<f32>;
    var t: vec2<f32>;
    var t2_: vec2<f32>;
    var t3_: vec2<f32>;
    var w0_: vec2<f32>;
    var w1_: vec2<f32>;
    var w2_: vec2<f32>;
    var w3_: vec2<f32>;
    var g0_: vec2<f32>;
    var g1_: vec2<f32>;
    var h0_: vec2<f32>;
    var h1_: vec2<f32>;
    var e: vec2<f32>;
    var a00_: f32;
    var a10_: f32;
    var a01_: f32;
    var a11_: f32;

    d_1 = d;
    let _e42 = d_1;
    a_2 = abs(_e42);
    let _e49 = a_2;
    let _e51 = a_2;
    let _e54 = a_2;
    let _e56 = a_2;
    if ((_e49.x >= _e51.y) && (_e54.x >= _e56.z)) {
        {
            let _e60 = d_1;
            if (_e60.x >= 0f) {
                {
                    f = 0f;
                    N = vec3<f32>(1f, 0f, 0f);
                    U = vec3<f32>(0f, 0f, -1f);
                }
            } else {
                {
                    f = 1f;
                    N = vec3<f32>(-1f, 0f, 0f);
                    U = vec3<f32>(0f, 0f, 1f);
                }
            }
            V = vec3<f32>(0f, 1f, 0f);
        }
    } else {
        let _e88 = a_2;
        let _e90 = a_2;
        if (_e88.y >= _e90.z) {
            {
                U = vec3<f32>(1f, 0f, 0f);
                let _e97 = d_1;
                if (_e97.y >= 0f) {
                    {
                        f = 2f;
                        N = vec3<f32>(0f, 1f, 0f);
                        V = vec3<f32>(0f, 0f, -1f);
                    }
                } else {
                    {
                        f = 3f;
                        N = vec3<f32>(0f, -1f, 0f);
                        V = vec3<f32>(0f, 0f, 1f);
                    }
                }
            }
        } else {
            {
                V = vec3<f32>(0f, 1f, 0f);
                let _e125 = d_1;
                if (_e125.z >= 0f) {
                    {
                        f = 4f;
                        N = vec3<f32>(0f, 0f, 1f);
                        U = vec3<f32>(1f, 0f, 0f);
                    }
                } else {
                    {
                        f = 5f;
                        N = vec3<f32>(0f, 0f, -1f);
                        U = vec3<f32>(-1f, 0f, 0f);
                    }
                }
            }
        }
    }
    let _e149 = d_1;
    let _e150 = N;
    dn = dot(_e149, _e150);
    let _e153 = global.uColourCube;
    S = max(_e153.y, 1f);
    let _e158 = d_1;
    let _e159 = U;
    let _e161 = dn;
    let _e164 = d_1;
    let _e165 = V;
    let _e167 = dn;
    let _e179 = S;
    x = (((((vec2<f32>(atan((dot(_e158, _e159) / _e161)), atan((dot(_e164, _e165) / _e167))) / vec2(0.7853982f)) * 0.5f) + vec2(0.5f)) * _e179) - vec2(0.5f));
    let _e185 = x;
    i = floor(_e185);
    let _e188 = x;
    let _e189 = i;
    t = (_e188 - _e189);
    let _e192 = t;
    let _e193 = t;
    t2_ = (_e192 * _e193);
    let _e196 = t2_;
    let _e197 = t;
    t3_ = (_e196 * _e197);
    let _e202 = t;
    let _e207 = t2_;
    let _e210 = t3_;
    w0_ = ((((vec2(1f) - (3f * _e202)) + (3f * _e207)) - _e210) / vec2(6f));
    let _e218 = t2_;
    let _e223 = t3_;
    w1_ = (((vec2(4f) - (6f * _e218)) + (3f * _e223)) / vec2(6f));
    let _e232 = t;
    let _e237 = t2_;
    let _e241 = t3_;
    w2_ = ((((vec2(1f) + (3f * _e232)) + (3f * _e237)) - (3f * _e241)) / vec2(6f));
    let _e248 = t3_;
    w3_ = (_e248 / vec2(6f));
    let _e253 = w0_;
    let _e254 = w1_;
    g0_ = (_e253 + _e254);
    let _e257 = w2_;
    let _e258 = w3_;
    g1_ = (_e257 + _e258);
    let _e261 = i;
    let _e265 = w1_;
    let _e266 = g0_;
    let _e269 = S;
    h0_ = (((_e261 - vec2(0.5f)) + (_e265 / _e266)) / vec2(_e269));
    let _e273 = i;
    let _e277 = w3_;
    let _e278 = g1_;
    let _e281 = S;
    h1_ = (((_e273 + vec2(1.5f)) + (_e277 / _e278)) / vec2(_e281));
    let _e286 = S;
    e = vec2((0.5f / _e286));
    let _e290 = h0_;
    let _e292 = h0_;
    let _e295 = e;
    let _e297 = e;
    let _e300 = clamp(vec2<f32>(_e290.x, _e292.y), _e295, (vec2(1f) - _e297));
    let _e301 = f;
    let _e304 = vec3<f32>(_e300.x, _e300.y, _e301);
    let _e309 = textureSampleLevel(tColourCubeTexture, tColourCubeSampler, _e304.xy, i32(_e304.z), 0f);
    a00_ = _e309.w;
    let _e312 = h1_;
    let _e314 = h0_;
    let _e317 = e;
    let _e319 = e;
    let _e322 = clamp(vec2<f32>(_e312.x, _e314.y), _e317, (vec2(1f) - _e319));
    let _e323 = f;
    let _e326 = vec3<f32>(_e322.x, _e322.y, _e323);
    let _e331 = textureSampleLevel(tColourCubeTexture, tColourCubeSampler, _e326.xy, i32(_e326.z), 0f);
    a10_ = _e331.w;
    let _e334 = h0_;
    let _e336 = h1_;
    let _e339 = e;
    let _e341 = e;
    let _e344 = clamp(vec2<f32>(_e334.x, _e336.y), _e339, (vec2(1f) - _e341));
    let _e345 = f;
    let _e348 = vec3<f32>(_e344.x, _e344.y, _e345);
    let _e353 = textureSampleLevel(tColourCubeTexture, tColourCubeSampler, _e348.xy, i32(_e348.z), 0f);
    a01_ = _e353.w;
    let _e356 = h1_;
    let _e358 = h1_;
    let _e361 = e;
    let _e363 = e;
    let _e366 = clamp(vec2<f32>(_e356.x, _e358.y), _e361, (vec2(1f) - _e363));
    let _e367 = f;
    let _e370 = vec3<f32>(_e366.x, _e366.y, _e367);
    let _e375 = textureSampleLevel(tColourCubeTexture, tColourCubeSampler, _e370.xy, i32(_e370.z), 0f);
    a11_ = _e375.w;
    let _e378 = g0_;
    let _e380 = g0_;
    let _e382 = a00_;
    let _e384 = g1_;
    let _e386 = a10_;
    let _e390 = g1_;
    let _e392 = g0_;
    let _e394 = a01_;
    let _e396 = g1_;
    let _e398 = a11_;
    let _e403 = colourCubeShore(((_e378.y * ((_e380.x * _e382) + (_e384.x * _e386))) + (_e390.y * ((_e392.x * _e394) + (_e396.x * _e398)))));
    return _e403;
}

fn surfSea(U_1: f32, g: f32) -> vec4<f32> {
    var U_2: f32;
    var g_1: f32;
    var H0_: f32;
    var T: f32;
    var w: f32;

    U_2 = U_1;
    g_1 = g;
    let _e45 = U_2;
    let _e47 = U_2;
    let _e49 = g_1;
    H0_ = (((0.21f * _e45) * _e47) / _e49);
    let _e53 = U_2;
    let _e55 = g_1;
    T = clamp(((10f * _e53) / _e55), 3f, 16f);
    let _e62 = T;
    w = (6.2832f / _e62);
    let _e65 = H0_;
    let _e66 = T;
    let _e67 = w;
    let _e68 = g_1;
    let _e69 = T;
    let _e71 = T;
    return vec4<f32>(_e65, _e66, _e67, (((_e68 * _e69) * _e71) / 6.2832f));
}

fn surfLag(fp: vec3<f32>) -> f32 {
    var fp_1: vec3<f32>;
    var q: f32 = 0.001533981f;

    fp_1 = fp;
    let _e45 = fp_1;
    let _e51 = q;
    let _e57 = fp_1;
    let _e63 = q;
    return ((2f * sin(dot(_e45, (vec3<f32>(13f, 7f, -9f) * _e51)))) + (1.3f * sin((dot(_e57, (vec3<f32>(-5f, 11f, 8f) * _e63)) + 1.7f))));
}

fn surfOut(h: f32, x_1: f32) -> f32 {
    var h_1: f32;
    var x_2: f32;
    var xd: f32;
    var local: f32;

    h_1 = h;
    x_2 = x_1;
    let _e45 = h_1;
    xd = pow((max(_e45, 0f) / SURF_A), 1.5f);
    let _e52 = x_2;
    let _e55 = global.uColourCube;
    if ((_e52 < 0f) && (_e55.x < 0.5f)) {
        let _e60 = xd;
        local = _e60;
    } else {
        let _e61 = xd;
        let _e62 = x_2;
        let _e67 = xd;
        let _e68 = x_2;
        local = mix(_e61, max(_e62, 0f), smoothstep(150f, 300f, max(_e67, _e68)));
    }
    let _e73 = local;
    return _e73;
}

fn surfPhase(fp_2: vec3<f32>, xo: f32, sea: vec4<f32>, g_2: f32, t_1: f32) -> f32 {
    var fp_3: vec3<f32>;
    var xo_1: f32;
    var sea_1: vec4<f32>;
    var g_3: f32;
    var t_2: f32;

    fp_3 = fp_2;
    xo_1 = xo;
    sea_1 = sea;
    g_3 = g_2;
    t_2 = t_1;
    let _e51 = sea_1;
    let _e53 = t_2;
    let _e55 = xo_1;
    let _e61 = g_3;
    let _e67 = fp_3;
    let _e68 = surfLag(_e67);
    return ((_e51.z * (_e53 + ((1.5f * pow(max(_e55, 0f), 0.6667f)) / sqrt((_e61 * SURF_A))))) + _e68);
}

fn surfWave(n: f32) -> f32 {
    var n_1: f32;

    n_1 = n;
    let _e47 = n_1;
    let _e56 = n_1;
    return ((0.5f + (0.35f * (0.5f + (0.5f * sin((_e47 * 0.8976f)))))) + (0.3f * fract((sin(((_e56 * 12.9898f) + 4.1414f)) * 43758.547f))));
}

fn surfAt(h_2: f32, ph: f32, sea_2: vec4<f32>, fw: f32) -> vec4<f32> {
    var h_3: f32;
    var ph_1: f32;
    var sea_3: vec4<f32>;
    var fw_1: f32;
    var n_2: f32;
    var p: f32;
    var local_1: f32;
    var hw: f32;
    var hd: f32;
    var Hs: f32;
    var hb: f32;
    var H: f32;
    var br: f32;
    var c: f32;
    var eU: f32;
    var dU: f32;
    var local_2: f32;
    var back: f32;
    var local_3: f32;
    var dback: f32;
    var eB: f32;
    var dB: f32;
    var local_4: f32;
    var foam: f32;

    h_3 = h_2;
    ph_1 = ph;
    sea_3 = sea_2;
    fw_1 = fw;
    let _e49 = ph_1;
    n_2 = floor((_e49 / 6.2832f));
    let _e54 = ph_1;
    let _e57 = n_2;
    p = ((_e54 / 6.2832f) - _e57);
    let _e60 = sea_3;
    let _e62 = p;
    let _e64 = fw_1;
    if (_e62 > (1f - _e64)) {
        let _e67 = n_2;
        let _e70 = surfWave((_e67 + 1f));
        local_1 = _e70;
    } else {
        let _e71 = n_2;
        let _e72 = surfWave(_e71);
        local_1 = _e72;
    }
    let _e74 = local_1;
    hw = (_e60.x * _e74);
    let _e78 = sea_3;
    hd = (0.1f * _e78.w);
    let _e82 = hw;
    let _e84 = hd;
    let _e85 = h_3;
    Hs = (_e82 * max(1f, pow((_e84 / max(_e85, 0.05f)), 0.25f)));
    let _e94 = hw;
    let _e95 = hd;
    hb = pow(((_e94 * pow(_e95, 0.25f)) / 0.78f), 0.8f);
    let _e104 = Hs;
    let _e106 = h_3;
    H = min(_e104, (0.78f * max(_e106, 0f)));
    let _e113 = hb;
    let _e116 = hb;
    let _e118 = h_3;
    br = smoothstep((1.25f * _e113), (0.85f * _e116), _e118);
    let _e124 = p;
    c = (0.5f + (0.5f * cos((6.2832f * _e124))));
    let _e130 = H;
    let _e131 = c;
    let _e132 = c;
    eU = (_e130 * ((_e131 * _e132) - 0.375f));
    let _e138 = H;
    let _e141 = c;
    let _e146 = p;
    dU = ((_e138 * ((((-2f * _e141) * 0.5f) * sin((6.2832f * _e146))) * 6.2832f)) / 6.2832f);
    let _e156 = p;
    let _e158 = fw_1;
    if (_e156 < (1f - _e158)) {
        let _e162 = p;
        let _e164 = fw_1;
        local_2 = pow((1f - (_e162 / (1f - _e164))), 1.5f);
    } else {
        let _e171 = fw_1;
        let _e174 = p;
        local_2 = smoothstep((1f - _e171), 1f, _e174);
    }
    let _e177 = local_2;
    back = _e177;
    let _e179 = p;
    let _e181 = fw_1;
    if (_e179 < (1f - _e181)) {
        let _e187 = fw_1;
        let _e191 = p;
        let _e193 = fw_1;
        local_3 = ((-1.5f / (1f - _e187)) * pow(max((1f - (_e191 / (1f - _e193))), 0f), 0.5f));
    } else {
        let _e203 = p;
        let _e206 = fw_1;
        let _e210 = p;
        let _e213 = fw_1;
        let _e214 = fw_1;
        let _e216 = fw_1;
        local_3 = (((6f * ((_e203 - 1f) + _e206)) * (1f - _e210)) / ((_e213 * _e214) * _e216));
    }
    let _e220 = local_3;
    dback = _e220;
    let _e222 = H;
    let _e223 = back;
    eB = (_e222 * (_e223 - 0.3f));
    let _e228 = H;
    let _e229 = dback;
    dB = ((_e228 * _e229) / 6.2832f);
    let _e234 = br;
    let _e235 = p;
    let _e237 = fw_1;
    if (_e235 > (1f - _e237)) {
        let _e241 = fw_1;
        let _e244 = p;
        local_4 = smoothstep((1f - _e241), 1f, _e244);
    } else {
        let _e246 = p;
        local_4 = exp((-(_e246) / 0.2f));
    }
    let _e252 = local_4;
    foam = (_e234 * _e252);
    let _e255 = eU;
    let _e256 = eB;
    let _e257 = br;
    let _e259 = dU;
    let _e260 = dB;
    let _e261 = br;
    let _e263 = foam;
    let _e264 = br;
    return vec4<f32>(mix(_e255, _e256, _e257), mix(_e259, _e260, _e261), _e263, _e264);
}

fn surfNoise(p_1: vec3<f32>, n_3: vec3<f32>, period: f32, foot: f32) -> vec4<f32> {
    var p_2: vec3<f32>;
    var n_4: vec3<f32>;
    var period_1: f32;
    var foot_1: f32;
    var w_1: vec3<f32>;
    var l: f32;

    p_2 = p_1;
    n_4 = n_3;
    period_1 = period;
    foot_1 = foot;
    let _e49 = n_4;
    w_1 = pow(abs(_e49), vec3(4f));
    let _e55 = w_1;
    let _e56 = w_1;
    let _e58 = w_1;
    let _e61 = w_1;
    w_1 = (_e55 / vec3(((_e56.x + _e58.y) + _e61.z)));
    let _e66 = foot_1;
    let _e69 = period_1;
    l = log2(max(((_e66 * 256f) / _e69), 1f));
    let _e75 = p_2;
    let _e77 = period_1;
    let _e80 = l;
    let _e81 = textureSampleLevel(tDetailTexture, tDetailSampler, (_e75.yz / vec2(_e77)), _e80);
    let _e82 = w_1;
    let _e85 = p_2;
    let _e87 = period_1;
    let _e93 = l;
    let _e94 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e85.zx / vec2(_e87)) + vec2(0.37f)), _e93);
    let _e95 = w_1;
    let _e99 = p_2;
    let _e101 = period_1;
    let _e107 = l;
    let _e108 = textureSampleLevel(tDetailTexture, tDetailSampler, ((_e99.xy / vec2(_e101)) + vec2(0.71f)), _e107);
    let _e109 = w_1;
    return (((_e81 * _e82.x) + (_e94 * _e95.y)) + (_e108 * _e109.z));
}

fn main_1() {
    var n_5: vec3<f32>;
    var shift: f32 = 0f;
    var fq: f32 = 1f;
    var lift: f32 = 0f;
    var local_5: f32;
    var lk: f32;
    var wp0_: vec4<f32>;
    var upF: vec3<f32>;
    var fp_4: vec3<f32>;
    var al: f32;
    var local_6: f32;
    var local_7: f32;
    var local_8: f32;
    var local_9: f32;
    var sea4_: vec4<f32>;
    var local_10: f32;
    var h_4: f32;
    var hb_1: f32;
    var local_11: f32;
    var shoreX: f32;
    var nW: vec4<f32>;
    var nG: vec4<f32>;
    var ph_2: f32;
    var sp: f32;
    var Lh: f32;
    var sf: vec4<f32>;
    var wp: vec4<f32>;

    let _e59 = nrm_1;
    n_5 = normalize(_e59.xyz);
    let _e63 = col_1;
    vCol = _e63;
    vMat = vec4(0f);
    vExt = vec4<f32>(0f, 1f, 0f, 0.5f);
    let _e71 = liq_1;
    vLiq = _e71;
    let _e72 = flw_1;
    vFlw = _e72;
    vShore = 1f;
    vMorphK = 0f;
    vOcc = 0f;
    let _e80 = global.uSeason;
    let _e84 = rib_1;
    let _e86 = rib_1;
    let _e89 = rib_1;
    let _e91 = rib_1;
    if ((_e80.z > 0.5f) && (((_e84.z * _e86.z) + (_e89.w * _e91.w)) > 0f)) {
        {
            let _e99 = rib_1;
            let _e101 = global.uSeason;
            let _e106 = rib_1;
            let _e108 = global.uSeason;
            fq = clamp(((1f + (_e99.z * cos(_e101.x))) + (_e106.w * sin(_e108.x))), 0.02f, 4f);
            let _e117 = rib_1;
            let _e120 = fq;
            let _e128 = rib_1;
            let _e132 = rib_1;
            shift = clamp(((1.5f * _e117.y) * (pow(_e120, 0.4f) - 1f)), (-1.5f * _e128.y), (1.2f * _e132.y));
        }
    }
    let _e136 = rib_1;
    let _e138 = rib_1;
    let _e140 = shift;
    vRib = vec2<f32>(_e136.x, max((_e138.y + (_e140 / 1.5f)), 0.02f));
    let _e149 = liq_1;
    if (_e149.x > 0.02f) {
        let _e153 = liq_1;
        let _e155 = liq_1;
        local_5 = (_e153.y / _e155.x);
    } else {
        local_5 = 1f;
    }
    let _e160 = local_5;
    lk = _e160;
    let _e162 = global.uSurfSea;
    let _e165 = lk;
    let _e168 = lk;
    let _e171 = lk;
    let _e177 = rib_1;
    if (((_e162 > 0.5f) && ((_e165 < 0.2f) || ((_e168 > 0.3f) && (_e171 < 0.55f)))) && (_e177.y > 0f)) {
        {
            let _e182 = global.modelMatrix;
            let _e183 = position_1;
            wp0_ = (_e182 * vec4<f32>(_e183.x, _e183.y, _e183.z, 1f));
            let _e191 = global.uToFixed;
            let _e192 = wp0_;
            let _e194 = global.uCenter;
            upF = (_e191 * normalize((_e192.xyz - _e194)));
            let _e199 = global.uOriginMod;
            let _e200 = position_1;
            fp_4 = (_e199 + _e200);
            let _e203 = upF;
            al = abs(asin(clamp(_e203.y, -1f, 1f)));
            let _e212 = global.uLiquid;
            let _e214 = al;
            if (_e214 < 0.09f) {
                local_8 = 0.45f;
            } else {
                let _e218 = al;
                if (_e218 < 0.52f) {
                    local_7 = 0.9f;
                } else {
                    let _e222 = al;
                    if (_e222 < 1.05f) {
                        local_6 = 1.25f;
                    } else {
                        local_6 = 0.8f;
                    }
                    let _e228 = local_6;
                    local_7 = _e228;
                }
                let _e230 = local_7;
                local_8 = _e230;
            }
            let _e232 = local_8;
            let _e234 = lk;
            if (_e234 < 0.2f) {
                local_9 = 1f;
            } else {
                let _e240 = liq_1;
                let _e242 = liq_1;
                local_9 = mix(0.3f, 1f, (_e240.w / _e242.x));
            }
            let _e247 = local_9;
            let _e249 = global.uLiquid2_;
            let _e251 = surfSea(((_e212.y * _e232) * _e247), _e249.x);
            sea4_ = _e251;
            let _e254 = sea4_;
            let _e256 = lk;
            if (_e256 < 0.2f) {
                local_10 = 1f;
            } else {
                let _e261 = liq_1;
                let _e264 = liq_1;
                local_10 = ((0.3f * _e261.w) / _e264.x);
            }
            let _e268 = local_10;
            let _e269 = global.uLiquid;
            sea4_.x = (_e254.x * (_e268 * _e269.z));
            let _e273 = rib_1;
            h_4 = _e273.y;
            let _e276 = sea4_;
            let _e281 = sea4_;
            hb_1 = pow((((_e276.x * 1.3f) * pow((0.1f * _e281.w), 0.25f)) / 0.78f), 0.8f);
            let _e292 = h_4;
            let _e294 = hb_1;
            let _e299 = sea4_;
            if ((_e292 < ((2f * _e294) + 0.5f)) && (_e299.x > 0.02f)) {
                {
                    let _e304 = global.uColourCube;
                    if (_e304.x > 0.5f) {
                        let _e308 = upF;
                        let _e309 = colourCubeShoreSmooth(_e308);
                        let _e310 = global.uColourCube;
                        local_11 = (_e309 * _e310.z);
                    } else {
                        local_11 = -1f;
                    }
                    let _e316 = local_11;
                    shoreX = _e316;
                    let _e318 = fp_4;
                    let _e319 = n_5;
                    let _e322 = surfNoise(_e318, _e319, 512f, 0f);
                    nW = _e322;
                    let _e324 = fp_4;
                    let _e325 = n_5;
                    let _e328 = surfNoise(_e324, _e325, 64f, 0f);
                    nG = _e328;
                    let _e330 = fp_4;
                    let _e331 = h_4;
                    let _e332 = shoreX;
                    let _e333 = surfOut(_e331, _e332);
                    let _e334 = sea4_;
                    let _e335 = global.uLiquid2_;
                    let _e337 = global.uTime;
                    let _e338 = surfPhase(_e330, _e333, _e334, _e335.x, _e337);
                    let _e340 = nG;
                    let _e354 = nW;
                    ph_2 = ((_e338 + (1.6f * (clamp(((_e340.w * 1.6f) - 0.3f), 0f, 1f) - 0.5f))) + (0.8f * (_e354.x - 0.5f)));
                    let _e362 = wp0_;
                    sp = max(0.6f, (length(_e362.xyz) / 35f));
                    let _e369 = sea4_;
                    let _e371 = global.uLiquid2_;
                    let _e373 = h_4;
                    Lh = (_e369.y * sqrt((_e371.x * max(_e373, 0.05f))));
                    let _e380 = h_4;
                    let _e381 = ph_2;
                    let _e382 = sea4_;
                    let _e384 = sp;
                    let _e386 = Lh;
                    let _e391 = surfAt(_e380, _e381, _e382, clamp(((3f * _e384) / _e386), 0.07f, 0.4f));
                    sf = _e391;
                    let _e393 = sf;
                    let _e397 = hb_1;
                    let _e400 = hb_1;
                    let _e404 = h_4;
                    let _e410 = Lh;
                    let _e411 = sp;
                    lift = ((_e393.x * (1f - smoothstep((1.5f * _e397), ((2f * _e400) + 0.5f), _e404))) * smoothstep(4f, 10f, (_e410 / _e411)));
                }
            }
        }
    }
    let _e415 = shift;
    let _e416 = lift;
    shift = (_e415 + _e416);
    let _e418 = global.modelMatrix;
    let _e419 = position_1;
    let _e420 = n_5;
    let _e421 = shift;
    let _e423 = (_e419 + (_e420 * _e421));
    wp = (_e418 * vec4<f32>(_e423.x, _e423.y, _e423.z, 1f));
    let _e431 = wp;
    vWorldPos = _e431.xyz;
    let _e433 = global.modelMatrix;
    let _e443 = n_5;
    vNormal = normalize((mat3x3<f32>(_e433[0].xyz, _e433[1].xyz, _e433[2].xyz) * _e443));
    let _e446 = global.uOriginMod;
    let _e447 = position_1;
    let _e449 = n_5;
    let _e450 = shift;
    vFixedPos = ((_e446 + _e447) + (_e449 * _e450));
    let _e453 = n_5;
    vFixedNormal = _e453;
    let _e454 = global.uNearOff;
    let _e455 = position_1;
    let _e457 = n_5;
    let _e458 = shift;
    vNearRel = ((_e454 + _e455) + (_e457 * _e458));
    let _e461 = global.uOriginRel;
    let _e462 = position_1;
    let _e464 = n_5;
    let _e465 = shift;
    vAnchorPos = ((_e461 + _e462) + (_e464 * _e465));
    let _e469 = global.projectionMatrix;
    let _e470 = global.viewMatrix;
    let _e472 = wp;
    gl_Position = ((_e469 * _e470) * _e472);
    return;
}

@vertex 
fn main(@location(0) position: vec3<f32>, @location(1) uv: vec2<f32>, @location(2) nrm: vec4<f32>, @location(3) liq: vec4<f32>, @location(4) flw: vec4<f32>, @location(5) rib: vec4<f32>, @location(6) col: vec4<f32>) -> VertexOutput {
    position_1 = position;
    uv_1 = uv;
    nrm_1 = nrm;
    liq_1 = liq;
    flw_1 = flw;
    rib_1 = rib;
    col_1 = col;
    main_1();
    let _e105 = vNearRel;
    let _e107 = vWorldPos;
    let _e109 = vNormal;
    let _e111 = vFixedPos;
    let _e113 = vFixedNormal;
    let _e115 = vCol;
    let _e117 = vMat;
    let _e119 = vExt;
    let _e121 = vLiq;
    let _e123 = vFlw;
    let _e125 = vShore;
    let _e127 = vMorphK;
    let _e129 = vRib;
    let _e131 = gl_Position;
    return VertexOutput(_e105, _e107, _e109, _e111, _e113, _e115, _e117, _e119, _e121, _e123, _e125, _e127, _e129, _e131);
}
`;
