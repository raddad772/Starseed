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
      "name": "uCamLocal",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 192
    },
    {
      "name": "uMorph",
      "type": "vec2",
      "count": 0,
      "align": 8,
      "size": 8,
      "stride": 8,
      "offset": 208
    },
    {
      "name": "uOriginMod",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 224
    },
    {
      "name": "uOriginRel",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 240
    },
    {
      "name": "uNearOff",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 256
    },
    {
      "name": "uNear",
      "type": "vec2",
      "count": 0,
      "align": 8,
      "size": 8,
      "stride": 8,
      "offset": 272
    },
    {
      "name": "uNearUp",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 288
    },
    {
      "name": "uNearMode",
      "type": "float",
      "count": 0,
      "align": 4,
      "size": 4,
      "stride": 4,
      "offset": 300
    }
  ],
  "textures": [],
  "bytes": 304,
  "group": 0,
  "attributes": [
    {
      "name": "position",
      "type": "vec3",
      "location": 0
    },
    {
      "name": "morph",
      "type": "vec3",
      "location": 1
    },
    {
      "name": "nrm",
      "type": "vec4",
      "location": 2
    },
    {
      "name": "mnrm",
      "type": "vec4",
      "location": 3
    },
    {
      "name": "col",
      "type": "vec4",
      "location": 4
    },
    {
      "name": "mcol",
      "type": "vec4",
      "location": 5
    },
    {
      "name": "mat",
      "type": "vec4",
      "location": 6
    },
    {
      "name": "ext",
      "type": "vec4",
      "location": 7
    },
    {
      "name": "liq",
      "type": "vec4",
      "location": 8
    },
    {
      "name": "flw",
      "type": "vec4",
      "location": 9
    },
    {
      "name": "occ",
      "type": "float",
      "location": 10
    }
  ]
};
export const code = /* wgsl */`
struct Params {
    modelMatrix: mat4x4<f32>,
    viewMatrix: mat4x4<f32>,
    projectionMatrix: mat4x4<f32>,
    uCamLocal: vec3<f32>,
    uMorph: vec2<f32>,
    uOriginMod: vec3<f32>,
    uOriginRel: vec3<f32>,
    uNearOff: vec3<f32>,
    uNear: vec2<f32>,
    uNearUp: vec3<f32>,
    uNearMode: f32,
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
    @builtin(position) gl_Position: vec4<f32>,
}

const PI: f32 = 3.1415927f;

@group(0) @binding(0) 
var<uniform> global: Params;
var<private> position_1: vec3<f32>;
var<private> morph_1: vec3<f32>;
var<private> nrm_1: vec4<f32>;
var<private> mnrm_1: vec4<f32>;
var<private> col_1: vec4<f32>;
var<private> mcol_1: vec4<f32>;
var<private> mat_1: vec4<f32>;
var<private> ext_1: vec4<f32>;
var<private> liq_1: vec4<f32>;
var<private> flw_1: vec4<f32>;
var<private> occ_1: f32;
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
var<private> gl_Position: vec4<f32>;

fn main_1() {
    var d: f32;
    var m: f32;
    var p: vec3<f32>;
    var n: vec3<f32>;
    var rel: vec3<f32>;
    var dn: f32;
    var wp: vec4<f32>;

    let _e51 = morph_1;
    let _e52 = global.uCamLocal;
    d = distance(_e51, _e52);
    let _e55 = d;
    let _e56 = global.uMorph;
    let _e59 = global.uMorph;
    let _e61 = global.uMorph;
    m = clamp(((_e55 - _e56.x) / max((_e59.y - _e61.x), 0.001f)), 0f, 1f);
    let _e71 = position_1;
    let _e72 = morph_1;
    let _e73 = m;
    p = mix(_e71, _e72, vec3(_e73));
    let _e77 = nrm_1;
    let _e79 = mnrm_1;
    let _e81 = m;
    n = normalize(mix(_e77.xyz, _e79.xyz, vec3(_e81)));
    let _e86 = col_1;
    let _e87 = mcol_1;
    let _e88 = m;
    vCol = mix(_e86, _e87, vec4(_e88));
    let _e91 = mat_1;
    vMat = _e91;
    let _e92 = ext_1;
    vExt = _e92;
    let _e93 = liq_1;
    vLiq = _e93;
    let _e94 = flw_1;
    vFlw = _e94;
    let _e95 = nrm_1;
    let _e97 = mnrm_1;
    let _e99 = m;
    vShore = mix(_e95.w, _e97.w, _e99);
    let _e101 = m;
    vMorphK = _e101;
    let _e102 = global.uNear;
    let _e106 = global.uNearMode;
    if ((_e102.x > 0.5f) && (_e106 < 0.5f)) {
        {
            let _e110 = global.uNearOff;
            let _e111 = p;
            rel = (_e110 + _e111);
            let _e114 = rel;
            let _e115 = global.uNearUp;
            let _e116 = rel;
            let _e117 = global.uNearUp;
            dn = length((_e114 - (_e115 * dot(_e116, _e117))));
            let _e123 = p;
            let _e124 = global.uNearUp;
            let _e128 = global.uNear;
            let _e131 = global.uNear;
            let _e133 = dn;
            p = (_e123 - (_e124 * (0.4f * (1f - smoothstep((0.97f * _e128.y), _e131.y, _e133)))));
        }
    }
    let _e139 = global.modelMatrix;
    let _e140 = p;
    wp = (_e139 * vec4<f32>(_e140.x, _e140.y, _e140.z, 1f));
    let _e148 = wp;
    vWorldPos = _e148.xyz;
    let _e150 = global.modelMatrix;
    let _e160 = n;
    vNormal = normalize((mat3x3<f32>(_e150[0].xyz, _e150[1].xyz, _e150[2].xyz) * _e160));
    let _e163 = global.uOriginMod;
    let _e164 = p;
    vFixedPos = (_e163 + _e164);
    let _e166 = n;
    vFixedNormal = _e166;
    let _e167 = global.uNearOff;
    let _e168 = p;
    vNearRel = (_e167 + _e168);
    let _e170 = global.uOriginRel;
    let _e171 = p;
    vAnchorPos = (_e170 + _e171);
    let _e173 = occ_1;
    vOcc = _e173;
    let _e175 = global.projectionMatrix;
    let _e176 = global.viewMatrix;
    let _e178 = wp;
    gl_Position = ((_e175 * _e176) * _e178);
    return;
}

@vertex 
fn main(@location(0) position: vec3<f32>, @location(1) morph: vec3<f32>, @location(2) nrm: vec4<f32>, @location(3) mnrm: vec4<f32>, @location(4) col: vec4<f32>, @location(5) mcol: vec4<f32>, @location(6) mat: vec4<f32>, @location(7) ext: vec4<f32>, @location(8) liq: vec4<f32>, @location(9) flw: vec4<f32>, @location(10) occ: f32) -> VertexOutput {
    position_1 = position;
    morph_1 = morph;
    nrm_1 = nrm;
    mnrm_1 = mnrm;
    col_1 = col;
    mcol_1 = mcol;
    mat_1 = mat;
    ext_1 = ext;
    liq_1 = liq;
    flw_1 = flw;
    occ_1 = occ;
    main_1();
    let _e103 = vNearRel;
    let _e105 = vWorldPos;
    let _e107 = vNormal;
    let _e109 = vFixedPos;
    let _e111 = vFixedNormal;
    let _e113 = vCol;
    let _e115 = vMat;
    let _e117 = vExt;
    let _e119 = vLiq;
    let _e121 = vFlw;
    let _e123 = vShore;
    let _e125 = vMorphK;
    let _e127 = gl_Position;
    return VertexOutput(_e103, _e105, _e107, _e109, _e111, _e113, _e115, _e117, _e119, _e121, _e123, _e125, _e127);
}
`;
