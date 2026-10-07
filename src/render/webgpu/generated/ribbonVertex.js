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
    }
  ],
  "textures": [],
  "bytes": 256,
  "group": 0,
  "attributes": [
    {
      "name": "position",
      "type": "vec3",
      "location": 0
    },
    {
      "name": "nrm",
      "type": "vec4",
      "location": 1
    },
    {
      "name": "liq",
      "type": "vec4",
      "location": 2
    },
    {
      "name": "flw",
      "type": "vec4",
      "location": 3
    },
    {
      "name": "rib",
      "type": "vec4",
      "location": 4
    },
    {
      "name": "col",
      "type": "vec4",
      "location": 5
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

@group(0) @binding(0) 
var<uniform> global: Params;
var<private> position_1: vec3<f32>;
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

fn main_1() {
    var n: vec3<f32>;
    var shift: f32 = 0f;
    var fq: f32 = 1f;
    var wp: vec4<f32>;

    let _e39 = nrm_1;
    n = normalize(_e39.xyz);
    let _e43 = col_1;
    vCol = _e43;
    vMat = vec4(0f);
    vExt = vec4<f32>(0f, 1f, 0f, 0.5f);
    let _e51 = liq_1;
    vLiq = _e51;
    let _e52 = flw_1;
    vFlw = _e52;
    vShore = 1f;
    vMorphK = 0f;
    vOcc = 0f;
    let _e60 = global.uSeason;
    let _e64 = rib_1;
    let _e66 = rib_1;
    let _e69 = rib_1;
    let _e71 = rib_1;
    if ((_e60.z > 0.5f) && (((_e64.z * _e66.z) + (_e69.w * _e71.w)) > 0f)) {
        {
            let _e79 = rib_1;
            let _e81 = global.uSeason;
            let _e86 = rib_1;
            let _e88 = global.uSeason;
            fq = clamp(((1f + (_e79.z * cos(_e81.x))) + (_e86.w * sin(_e88.x))), 0.02f, 4f);
            let _e97 = rib_1;
            let _e100 = fq;
            let _e108 = rib_1;
            let _e112 = rib_1;
            shift = clamp(((1.5f * _e97.y) * (pow(_e100, 0.4f) - 1f)), (-1.5f * _e108.y), (1.2f * _e112.y));
        }
    }
    let _e116 = rib_1;
    let _e118 = rib_1;
    let _e120 = shift;
    vRib = vec2<f32>(_e116.x, max((_e118.y + (_e120 / 1.5f)), 0.02f));
    let _e127 = global.modelMatrix;
    let _e128 = position_1;
    let _e129 = n;
    let _e130 = shift;
    let _e132 = (_e128 + (_e129 * _e130));
    wp = (_e127 * vec4<f32>(_e132.x, _e132.y, _e132.z, 1f));
    let _e140 = wp;
    vWorldPos = _e140.xyz;
    let _e142 = global.modelMatrix;
    let _e152 = n;
    vNormal = normalize((mat3x3<f32>(_e142[0].xyz, _e142[1].xyz, _e142[2].xyz) * _e152));
    let _e155 = global.uOriginMod;
    let _e156 = position_1;
    let _e158 = n;
    let _e159 = shift;
    vFixedPos = ((_e155 + _e156) + (_e158 * _e159));
    let _e162 = n;
    vFixedNormal = _e162;
    let _e163 = global.uNearOff;
    let _e164 = position_1;
    let _e166 = n;
    let _e167 = shift;
    vNearRel = ((_e163 + _e164) + (_e166 * _e167));
    let _e170 = global.uOriginRel;
    let _e171 = position_1;
    let _e173 = n;
    let _e174 = shift;
    vAnchorPos = ((_e170 + _e171) + (_e173 * _e174));
    let _e178 = global.projectionMatrix;
    let _e179 = global.viewMatrix;
    let _e181 = wp;
    gl_Position = ((_e178 * _e179) * _e181);
    return;
}

@vertex 
fn main(@location(0) position: vec3<f32>, @location(1) nrm: vec4<f32>, @location(2) liq: vec4<f32>, @location(3) flw: vec4<f32>, @location(4) rib: vec4<f32>, @location(5) col: vec4<f32>) -> VertexOutput {
    position_1 = position;
    nrm_1 = nrm;
    liq_1 = liq;
    flw_1 = flw;
    rib_1 = rib;
    col_1 = col;
    main_1();
    let _e77 = vNearRel;
    let _e79 = vWorldPos;
    let _e81 = vNormal;
    let _e83 = vFixedPos;
    let _e85 = vFixedNormal;
    let _e87 = vCol;
    let _e89 = vMat;
    let _e91 = vExt;
    let _e93 = vLiq;
    let _e95 = vFlw;
    let _e97 = vShore;
    let _e99 = vMorphK;
    let _e101 = vRib;
    let _e103 = gl_Position;
    return VertexOutput(_e77, _e79, _e81, _e83, _e85, _e87, _e89, _e91, _e93, _e95, _e97, _e99, _e101, _e103);
}
`;
