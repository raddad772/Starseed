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
      "name": "uBase",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 16
    },
    {
      "name": "uEmissive",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 32
    },
    {
      "name": "uPBR",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 48
    },
    {
      "name": "uFlags",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 64
    },
    {
      "name": "uNormalScale",
      "type": "vec2",
      "count": 0,
      "align": 8,
      "size": 8,
      "stride": 8,
      "offset": 80
    },
    {
      "name": "mapTransform",
      "type": "mat3",
      "count": 0,
      "align": 16,
      "size": 48,
      "stride": 48,
      "offset": 96
    },
    {
      "name": "normalMapTransform",
      "type": "mat3",
      "count": 0,
      "align": 16,
      "size": 48,
      "stride": 48,
      "offset": 144
    },
    {
      "name": "roughnessMapTransform",
      "type": "mat3",
      "count": 0,
      "align": 16,
      "size": 48,
      "stride": 48,
      "offset": 192
    },
    {
      "name": "metalnessMapTransform",
      "type": "mat3",
      "count": 0,
      "align": 16,
      "size": 48,
      "stride": 48,
      "offset": 240
    },
    {
      "name": "emissiveMapTransform",
      "type": "mat3",
      "count": 0,
      "align": 16,
      "size": 48,
      "stride": 48,
      "offset": 288
    },
    {
      "name": "aoMapTransform",
      "type": "mat3",
      "count": 0,
      "align": 16,
      "size": 48,
      "stride": 48,
      "offset": 336
    },
    {
      "name": "alphaMapTransform",
      "type": "mat3",
      "count": 0,
      "align": 16,
      "size": 48,
      "stride": 48,
      "offset": 384
    },
    {
      "name": "uChannels",
      "type": "ivec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 432
    },
    {
      "name": "uChannels2",
      "type": "ivec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 448
    }
  ],
  "textures": [
    {
      "name": "map",
      "type": "sampler2D",
      "count": 0,
      "binding": 1,
      "samplerBinding": 2
    },
    {
      "name": "normalMap",
      "type": "sampler2D",
      "count": 0,
      "binding": 3,
      "samplerBinding": 4
    },
    {
      "name": "roughnessMap",
      "type": "sampler2D",
      "count": 0,
      "binding": 5,
      "samplerBinding": 6
    },
    {
      "name": "metalnessMap",
      "type": "sampler2D",
      "count": 0,
      "binding": 7,
      "samplerBinding": 8
    },
    {
      "name": "emissiveMap",
      "type": "sampler2D",
      "count": 0,
      "binding": 9,
      "samplerBinding": 10
    },
    {
      "name": "aoMap",
      "type": "sampler2D",
      "count": 0,
      "binding": 11,
      "samplerBinding": 12
    },
    {
      "name": "alphaMap",
      "type": "sampler2D",
      "count": 0,
      "binding": 13,
      "samplerBinding": 14
    }
  ],
  "bytes": 464,
  "group": 1,
  "attributes": []
};
export const code = /* wgsl */`
struct Params {
    uBodyIndex: f32,
    uBase: vec4<f32>,
    uEmissive: vec3<f32>,
    uPBR: vec4<f32>,
    uFlags: vec4<f32>,
    uNormalScale: vec2<f32>,
    mapTransform: mat3x3<f32>,
    normalMapTransform: mat3x3<f32>,
    roughnessMapTransform: mat3x3<f32>,
    metalnessMapTransform: mat3x3<f32>,
    emissiveMapTransform: mat3x3<f32>,
    aoMapTransform: mat3x3<f32>,
    alphaMapTransform: mat3x3<f32>,
    uChannels: vec4<i32>,
    uChannels2_: vec3<i32>,
}

struct FragmentOutput {
    @location(0) gAlbedo: vec4<f32>,
    @location(1) gNormal: vec4<f32>,
    @location(2) gEmission: vec4<f32>,
    @location(3) gSurface: vec4<f32>,
}

const PI: f32 = 3.1415927f;

@group(1) @binding(0) 
var<uniform> global: Params;
@group(1) @binding(1) 
var mapTexture: texture_2d<f32>;
@group(1) @binding(2) 
var mapSampler: sampler;
@group(1) @binding(3) 
var normalMapTexture: texture_2d<f32>;
@group(1) @binding(4) 
var normalMapSampler: sampler;
@group(1) @binding(5) 
var roughnessMapTexture: texture_2d<f32>;
@group(1) @binding(6) 
var roughnessMapSampler: sampler;
@group(1) @binding(7) 
var metalnessMapTexture: texture_2d<f32>;
@group(1) @binding(8) 
var metalnessMapSampler: sampler;
@group(1) @binding(9) 
var emissiveMapTexture: texture_2d<f32>;
@group(1) @binding(10) 
var emissiveMapSampler: sampler;
@group(1) @binding(11) 
var aoMapTexture: texture_2d<f32>;
@group(1) @binding(12) 
var aoMapSampler: sampler;
@group(1) @binding(13) 
var alphaMapTexture: texture_2d<f32>;
@group(1) @binding(14) 
var alphaMapSampler: sampler;
var<private> gAlbedo: vec4<f32>;
var<private> gNormal: vec4<f32>;
var<private> gEmission: vec4<f32>;
var<private> gSurface: vec4<f32>;
var<private> vWorld_1: vec3<f32>;
var<private> vNormal_1: vec3<f32>;
var<private> vColor_1: vec4<f32>;
var<private> vUv_1: vec2<f32>;
var<private> vUv1_1: vec2<f32>;
var<private> vUv2_1: vec2<f32>;
var<private> gl_FrontFacing_1: bool;

fn octEncode(n: vec3<f32>) -> vec2<f32> {
    var n_1: vec3<f32>;
    var local: f32;
    var local_1: f32;
    var local_2: vec2<f32>;

    n_1 = n;
    let _e51 = n_1;
    let _e52 = n_1;
    let _e55 = n_1;
    let _e59 = n_1;
    n_1 = (_e51 / vec3(((abs(_e52.x) + abs(_e55.y)) + abs(_e59.z))));
    let _e65 = n_1;
    if (_e65.z >= 0f) {
        let _e69 = n_1;
        local_2 = _e69.xy;
    } else {
        let _e72 = n_1;
        let _e77 = n_1;
        if (_e77.x >= 0f) {
            local = 1f;
        } else {
            local = -1f;
        }
        let _e85 = local;
        let _e86 = n_1;
        if (_e86.y >= 0f) {
            local_1 = 1f;
        } else {
            local_1 = -1f;
        }
        let _e94 = local_1;
        local_2 = ((vec2(1f) - abs(_e72.yx)) * vec2<f32>(_e85, _e94));
    }
    let _e98 = local_2;
    return _e98;
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
    let _e63 = albedo_1;
    let _e68 = clamp(_e63, vec3(0f), vec3(1f));
    let _e69 = ao_1;
    gAlbedo = vec4<f32>(_e68.x, _e68.y, _e68.z, clamp(_e69, 0f, 1f));
    let _e77 = normal_1;
    let _e79 = octEncode(normalize(_e77));
    let _e80 = roughness_1;
    let _e81 = global.uBodyIndex;
    gNormal = vec4<f32>(_e79.x, _e79.y, _e80, _e81);
    gEmission = vec4<f32>(0f, 0f, 0f, 1f);
    let _e90 = trans_1;
    let _e91 = wet_1;
    let _e93 = F0_1;
    gSurface = vec4<f32>(_e90, _e91, 0f, _e93);
    return;
}

fn texUV(channel: i32, transform: mat3x3<f32>) -> vec2<f32> {
    var channel_1: i32;
    var transform_1: mat3x3<f32>;
    var local_3: vec2<f32>;
    var local_4: vec2<f32>;

    channel_1 = channel;
    transform_1 = transform;
    let _e59 = transform_1;
    let _e60 = channel_1;
    if (_e60 == 1i) {
        let _e63 = vUv1_1;
        local_4 = _e63;
    } else {
        let _e64 = channel_1;
        if (_e64 == 2i) {
            let _e67 = vUv2_1;
            local_3 = _e67;
        } else {
            let _e68 = vUv_1;
            local_3 = _e68;
        }
        let _e70 = local_3;
        local_4 = _e70;
    }
    let _e72 = local_4;
    return (_e59 * vec3<f32>(_e72.x, _e72.y, 1f)).xy;
}

fn main_1() {
    var dpX: vec3<f32>;
    var dpY: vec3<f32>;
    var nUV: vec2<f32>;
    var dx: vec2<f32>;
    var dy: vec2<f32>;
    var uv0_: vec2<f32>;
    var uvR: vec2<f32>;
    var uvM: vec2<f32>;
    var uvE: vec2<f32>;
    var uvA: vec2<f32>;
    var uvAlpha: vec2<f32>;
    var base: vec4<f32>;
    var rough: f32;
    var metal: f32;
    var ao_2: f32;
    var emit: vec3<f32>;
    var local_5: vec3<f32>;
    var N: vec3<f32>;
    var mapN: vec3<f32>;
    var q1_: vec3<f32>;
    var q0_: vec3<f32>;
    var T: vec3<f32>;
    var B: vec3<f32>;
    var scale: f32;

    let _e55 = vWorld_1;
    let _e56 = dpdx(_e55);
    dpX = _e56;
    let _e58 = vWorld_1;
    let _e59 = dpdy(_e58);
    dpY = _e59;
    let _e61 = global.uChannels;
    let _e63 = global.normalMapTransform;
    let _e64 = texUV(_e61.y, _e63);
    nUV = _e64;
    let _e66 = nUV;
    let _e67 = dpdx(_e66);
    dx = _e67;
    let _e69 = nUV;
    let _e70 = dpdy(_e69);
    dy = _e70;
    let _e72 = global.uChannels;
    let _e74 = global.mapTransform;
    let _e75 = texUV(_e72.x, _e74);
    uv0_ = _e75;
    let _e77 = global.uChannels;
    let _e79 = global.roughnessMapTransform;
    let _e80 = texUV(_e77.z, _e79);
    uvR = _e80;
    let _e82 = global.uChannels;
    let _e84 = global.metalnessMapTransform;
    let _e85 = texUV(_e82.w, _e84);
    uvM = _e85;
    let _e87 = global.uChannels2_;
    let _e89 = global.emissiveMapTransform;
    let _e90 = texUV(_e87.x, _e89);
    uvE = _e90;
    let _e92 = global.uChannels2_;
    let _e94 = global.aoMapTransform;
    let _e95 = texUV(_e92.y, _e94);
    uvA = _e95;
    let _e97 = global.uChannels2_;
    let _e99 = global.alphaMapTransform;
    let _e100 = texUV(_e97.z, _e99);
    uvAlpha = _e100;
    let _e102 = global.uBase;
    let _e103 = uv0_;
    let _e104 = uv0_;
    let _e105 = dpdx(_e104);
    let _e106 = uv0_;
    let _e107 = dpdy(_e106);
    let _e108 = textureSampleGrad(mapTexture, mapSampler, _e103, _e105, _e107);
    base = (_e102 * _e108);
    let _e111 = global.uFlags;
    if (_e111.x > 0.5f) {
        let _e115 = base;
        let _e116 = vColor_1;
        base = (_e115 * _e116);
    } else {
        let _e118 = base;
        let _e120 = base;
        let _e122 = vColor_1;
        let _e124 = (_e120.xyz * _e122.xyz);
        base.x = _e124.x;
        base.y = _e124.y;
        base.z = _e124.z;
    }
    let _e132 = base;
    let _e134 = uvAlpha;
    let _e135 = uvAlpha;
    let _e136 = dpdx(_e135);
    let _e137 = uvAlpha;
    let _e138 = dpdy(_e137);
    let _e139 = textureSampleGrad(alphaMapTexture, alphaMapSampler, _e134, _e136, _e138);
    base.w = (_e132.w * _e139.y);
    let _e142 = global.uPBR;
    let _e144 = uvR;
    let _e145 = uvR;
    let _e146 = dpdx(_e145);
    let _e147 = uvR;
    let _e148 = dpdy(_e147);
    let _e149 = textureSampleGrad(roughnessMapTexture, roughnessMapSampler, _e144, _e146, _e148);
    rough = (_e142.x * _e149.y);
    let _e153 = global.uPBR;
    let _e155 = uvM;
    let _e156 = uvM;
    let _e157 = dpdx(_e156);
    let _e158 = uvM;
    let _e159 = dpdy(_e158);
    let _e160 = textureSampleGrad(metalnessMapTexture, metalnessMapSampler, _e155, _e157, _e159);
    metal = (_e153.y * _e160.z);
    let _e165 = uvA;
    let _e166 = uvA;
    let _e167 = dpdx(_e166);
    let _e168 = uvA;
    let _e169 = dpdy(_e168);
    let _e170 = textureSampleGrad(aoMapTexture, aoMapSampler, _e165, _e167, _e169);
    let _e172 = global.uPBR;
    ao_2 = mix(1f, _e170.x, _e172.w);
    let _e176 = global.uEmissive;
    let _e177 = uvE;
    let _e178 = uvE;
    let _e179 = dpdx(_e178);
    let _e180 = uvE;
    let _e181 = dpdy(_e180);
    let _e182 = textureSampleGrad(emissiveMapTexture, emissiveMapSampler, _e177, _e179, _e181);
    emit = (_e176 * _e182.xyz);
    let _e186 = global.uFlags;
    if (_e186.w > 0.5f) {
        let _e190 = dpX;
        let _e191 = dpY;
        local_5 = cross(_e190, _e191);
    } else {
        let _e193 = vNormal_1;
        local_5 = _e193;
    }
    let _e195 = local_5;
    N = normalize(_e195);
    let _e199 = gl_FrontFacing_1;
    if !(_e199) {
        let _e201 = N;
        N = -(_e201);
    }
    let _e203 = nUV;
    let _e204 = dx;
    let _e205 = dy;
    let _e206 = textureSampleGrad(normalMapTexture, normalMapSampler, _e203, _e204, _e205);
    mapN = ((_e206.xyz * 2f) - vec3(1f));
    let _e214 = global.uFlags;
    if (_e214.z > 0.5f) {
        {
            let _e218 = mapN;
            let _e220 = mapN;
            let _e222 = global.uNormalScale;
            let _e223 = (_e220.xy * _e222);
            mapN.x = _e223.x;
            mapN.y = _e223.y;
            let _e228 = dpY;
            let _e229 = N;
            q1_ = cross(_e228, _e229);
            let _e232 = N;
            let _e233 = dpX;
            q0_ = cross(_e232, _e233);
            let _e236 = q1_;
            let _e237 = dx;
            let _e240 = q0_;
            let _e241 = dy;
            T = ((_e236 * _e237.x) + (_e240 * _e241.x));
            let _e246 = q1_;
            let _e247 = dx;
            let _e250 = q0_;
            let _e251 = dy;
            B = ((_e246 * _e247.y) + (_e250 * _e251.y));
            let _e256 = T;
            let _e257 = T;
            let _e259 = B;
            let _e260 = B;
            scale = inverseSqrt(max(max(dot(_e256, _e257), dot(_e259, _e260)), 0.00000000000000000001f));
            let _e267 = T;
            let _e268 = mapN;
            let _e270 = scale;
            let _e273 = B;
            let _e274 = mapN;
            let _e276 = scale;
            let _e280 = N;
            let _e281 = mapN;
            N = normalize((((_e267 * (_e268.x * _e270)) + (_e273 * (_e274.y * _e276))) + (_e280 * _e281.z)));
        }
    }
    let _e286 = base;
    let _e288 = global.uPBR;
    if (_e286.w < _e288.z) {
        discard;
    }
    let _e291 = base;
    let _e293 = N;
    let _e294 = rough;
    let _e298 = ao_2;
    materialOutput(_e291.xyz, _e293, clamp(_e294, 0.04f, 1f), _e298, 0f, 0f, 0.04f);
    let _e303 = metal;
    gSurface.z = _e303;
    let _e304 = gEmission;
    let _e306 = emit;
    gEmission.x = _e306.x;
    gEmission.y = _e306.y;
    gEmission.z = _e306.z;
    let _e313 = global.uFlags;
    if (_e313.y > 0.5f) {
        {
            let _e317 = gAlbedo;
            gAlbedo.x = 0f;
            gAlbedo.y = 0f;
            gAlbedo.z = 0f;
            let _e324 = gEmission;
            let _e326 = gEmission;
            let _e328 = base;
            let _e330 = (_e326.xyz + _e328.xyz);
            gEmission.x = _e330.x;
            gEmission.y = _e330.y;
            gEmission.z = _e330.z;
            return;
        }
    } else {
        return;
    }
}

@fragment 
fn main(@location(0) vWorld: vec3<f32>, @location(1) vNormal: vec3<f32>, @location(2) vColor: vec4<f32>, @location(3) vUv: vec2<f32>, @location(4) vUv1_: vec2<f32>, @location(5) vUv2_: vec2<f32>, @builtin(front_facing) gl_FrontFacing: bool) -> FragmentOutput {
    vWorld_1 = vWorld;
    vNormal_1 = vNormal;
    vColor_1 = vColor;
    vUv_1 = vUv;
    vUv1_1 = vUv1_;
    vUv2_1 = vUv2_;
    gl_FrontFacing_1 = gl_FrontFacing;
    main_1();
    let _e95 = gAlbedo;
    let _e97 = gNormal;
    let _e99 = gEmission;
    let _e101 = gSurface;
    return FragmentOutput(_e95, _e97, _e99, _e101);
}
`;
