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
      "name": "uLivery",
      "type": "vec2",
      "count": 0,
      "align": 8,
      "size": 8,
      "stride": 8,
      "offset": 32
    },
    {
      "name": "uPaint1",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 48
    },
    {
      "name": "uPaint2",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 64
    },
    {
      "name": "uPaint3",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 80
    },
    {
      "name": "uEmissive",
      "type": "vec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 96
    },
    {
      "name": "uPBR",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 112
    },
    {
      "name": "uFlags",
      "type": "vec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 128
    },
    {
      "name": "uNormalScale",
      "type": "vec2",
      "count": 0,
      "align": 8,
      "size": 8,
      "stride": 8,
      "offset": 144
    },
    {
      "name": "mapTransform",
      "type": "mat3",
      "count": 0,
      "align": 16,
      "size": 48,
      "stride": 48,
      "offset": 160
    },
    {
      "name": "normalMapTransform",
      "type": "mat3",
      "count": 0,
      "align": 16,
      "size": 48,
      "stride": 48,
      "offset": 208
    },
    {
      "name": "roughnessMapTransform",
      "type": "mat3",
      "count": 0,
      "align": 16,
      "size": 48,
      "stride": 48,
      "offset": 256
    },
    {
      "name": "metalnessMapTransform",
      "type": "mat3",
      "count": 0,
      "align": 16,
      "size": 48,
      "stride": 48,
      "offset": 304
    },
    {
      "name": "emissiveMapTransform",
      "type": "mat3",
      "count": 0,
      "align": 16,
      "size": 48,
      "stride": 48,
      "offset": 352
    },
    {
      "name": "aoMapTransform",
      "type": "mat3",
      "count": 0,
      "align": 16,
      "size": 48,
      "stride": 48,
      "offset": 400
    },
    {
      "name": "alphaMapTransform",
      "type": "mat3",
      "count": 0,
      "align": 16,
      "size": 48,
      "stride": 48,
      "offset": 448
    },
    {
      "name": "uChannels",
      "type": "ivec4",
      "count": 0,
      "align": 16,
      "size": 16,
      "stride": 16,
      "offset": 496
    },
    {
      "name": "uChannels2",
      "type": "ivec3",
      "count": 0,
      "align": 16,
      "size": 12,
      "stride": 12,
      "offset": 512
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
  "bytes": 528,
  "group": 1,
  "attributes": []
};
export const code = /* wgsl */`
struct Params {
    uBodyIndex: f32,
    uBase: vec4<f32>,
    uLivery: vec2<f32>,
    uPaint1_: vec3<f32>,
    uPaint2_: vec3<f32>,
    uPaint3_: vec3<f32>,
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
var<private> vObjPos_1: vec3<f32>;
var<private> vObjN_1: vec3<f32>;
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
    let _e59 = n_1;
    let _e60 = n_1;
    let _e63 = n_1;
    let _e67 = n_1;
    n_1 = (_e59 / vec3(((abs(_e60.x) + abs(_e63.y)) + abs(_e67.z))));
    let _e73 = n_1;
    if (_e73.z >= 0f) {
        let _e77 = n_1;
        local_2 = _e77.xy;
    } else {
        let _e80 = n_1;
        let _e85 = n_1;
        if (_e85.x >= 0f) {
            local = 1f;
        } else {
            local = -1f;
        }
        let _e93 = local;
        let _e94 = n_1;
        if (_e94.y >= 0f) {
            local_1 = 1f;
        } else {
            local_1 = -1f;
        }
        let _e102 = local_1;
        local_2 = ((vec2(1f) - abs(_e80.yx)) * vec2<f32>(_e93, _e102));
    }
    let _e106 = local_2;
    return _e106;
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
    let _e71 = albedo_1;
    let _e76 = clamp(_e71, vec3(0f), vec3(1f));
    let _e77 = ao_1;
    gAlbedo = vec4<f32>(_e76.x, _e76.y, _e76.z, clamp(_e77, 0f, 1f));
    let _e85 = normal_1;
    let _e87 = octEncode(normalize(_e85));
    let _e88 = roughness_1;
    let _e89 = global.uBodyIndex;
    gNormal = vec4<f32>(_e87.x, _e87.y, _e88, _e89);
    gEmission = vec4<f32>(0f, 0f, 0f, 1f);
    let _e98 = trans_1;
    let _e99 = wet_1;
    let _e101 = F0_1;
    gSurface = vec4<f32>(_e98, _e99, 0f, _e101);
    return;
}

fn texUV(channel: i32, transform: mat3x3<f32>) -> vec2<f32> {
    var channel_1: i32;
    var transform_1: mat3x3<f32>;
    var local_3: vec2<f32>;
    var local_4: vec2<f32>;

    channel_1 = channel;
    transform_1 = transform;
    let _e69 = transform_1;
    let _e70 = channel_1;
    if (_e70 == 1i) {
        let _e73 = vUv1_1;
        local_4 = _e73;
    } else {
        let _e74 = channel_1;
        if (_e74 == 2i) {
            let _e77 = vUv2_1;
            local_3 = _e77;
        } else {
            let _e78 = vUv_1;
            local_3 = _e78;
        }
        let _e80 = local_3;
        local_4 = _e80;
    }
    let _e82 = local_4;
    return (_e69 * vec3<f32>(_e82.x, _e82.y, 1f)).xy;
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
    var local_5: f32;
    var mask: vec4<f32>;
    var paint: vec3<f32>;
    var an: vec3<f32>;
    var local_6: vec2<f32>;
    var local_7: vec2<f32>;
    var q: vec2<f32>;
    var f: vec2<f32>;
    var fw: vec2<f32>;
    var fade: f32;
    var seam: f32;
    var tone: f32;
    var rough: f32;
    var metal: f32;
    var ao_2: f32;
    var emit: vec3<f32>;
    var local_8: vec3<f32>;
    var N: vec3<f32>;
    var mapN: vec3<f32>;
    var q1_: vec3<f32>;
    var q0_: vec3<f32>;
    var T: vec3<f32>;
    var B: vec3<f32>;
    var scale: f32;

    let _e65 = vWorld_1;
    let _e66 = dpdx(_e65);
    dpX = _e66;
    let _e68 = vWorld_1;
    let _e69 = dpdy(_e68);
    dpY = _e69;
    let _e71 = global.uChannels;
    let _e73 = global.normalMapTransform;
    let _e74 = texUV(_e71.y, _e73);
    nUV = _e74;
    let _e76 = nUV;
    let _e77 = dpdx(_e76);
    dx = _e77;
    let _e79 = nUV;
    let _e80 = dpdy(_e79);
    dy = _e80;
    let _e82 = global.uChannels;
    let _e84 = global.mapTransform;
    let _e85 = texUV(_e82.x, _e84);
    uv0_ = _e85;
    let _e87 = global.uChannels;
    let _e89 = global.roughnessMapTransform;
    let _e90 = texUV(_e87.z, _e89);
    uvR = _e90;
    let _e92 = global.uChannels;
    let _e94 = global.metalnessMapTransform;
    let _e95 = texUV(_e92.w, _e94);
    uvM = _e95;
    let _e97 = global.uChannels2_;
    let _e99 = global.emissiveMapTransform;
    let _e100 = texUV(_e97.x, _e99);
    uvE = _e100;
    let _e102 = global.uChannels2_;
    let _e104 = global.aoMapTransform;
    let _e105 = texUV(_e102.y, _e104);
    uvA = _e105;
    let _e107 = global.uChannels2_;
    let _e109 = global.alphaMapTransform;
    let _e110 = texUV(_e107.z, _e109);
    uvAlpha = _e110;
    let _e112 = global.uBase;
    let _e113 = uv0_;
    let _e114 = uv0_;
    let _e115 = dpdx(_e114);
    let _e116 = uv0_;
    let _e117 = dpdy(_e116);
    let _e118 = textureSampleGrad(mapTexture, mapSampler, _e113, _e115, _e117);
    base = (_e112 * _e118);
    let _e121 = global.uLivery;
    if (_e121.x > 0.5f) {
        {
            let _e125 = vColor_1;
            let _e126 = _e125.xyz;
            let _e127 = global.uLivery;
            if (_e127.y > 0.5f) {
                let _e131 = vColor_1;
                local_5 = _e131.w;
            } else {
                local_5 = 0f;
            }
            let _e135 = local_5;
            mask = vec4<f32>(_e126.x, _e126.y, _e126.z, _e135);
            let _e141 = global.uPaint1_;
            let _e142 = global.uPaint2_;
            let _e143 = mask;
            let _e147 = global.uPaint3_;
            let _e148 = mask;
            paint = mix(mix(_e141, _e142, vec3(_e143.y)), _e147, vec3(_e148.z));
            let _e153 = vObjN_1;
            an = abs(_e153);
            let _e156 = an;
            let _e158 = an;
            let _e160 = an;
            if (_e156.x > max(_e158.y, _e160.z)) {
                let _e164 = vObjPos_1;
                local_7 = _e164.zy;
            } else {
                let _e166 = an;
                let _e168 = an;
                if (_e166.y > _e168.z) {
                    let _e171 = vObjPos_1;
                    local_6 = _e171.xz;
                } else {
                    let _e173 = vObjPos_1;
                    local_6 = _e173.xy;
                }
                let _e176 = local_6;
                local_7 = _e176;
            }
            let _e178 = local_7;
            q = _e178;
            let _e180 = q;
            f = (fract((_e180 / vec2<f32>(9f, 4.5f))) - vec2(0.5f));
            let _e190 = q;
            let _e195 = fwidth((_e190 / vec2<f32>(9f, 4.5f)));
            fw = _e195;
            let _e200 = fw;
            let _e202 = fw;
            fade = (1f - smoothstep(0.03f, 0.12f, max(_e200.x, _e202.y)));
            let _e208 = fade;
            let _e212 = fw;
            let _e218 = f;
            let _e227 = fw;
            let _e233 = f;
            seam = (_e208 * max((1f - smoothstep(0f, ((1.5f * _e212.x) + 0.004f), (0.5f - abs(_e218.x)))), (1f - smoothstep(0f, ((1.5f * _e227.y) + 0.004f), (0.5f - abs(_e233.y))))));
            let _e242 = q;
            tone = fract((sin(dot(floor((_e242 / vec2<f32>(9f, 4.5f))), vec2<f32>(12.9898f, 78.233f))) * 43758.547f));
            let _e257 = base;
            let _e259 = base;
            let _e261 = paint;
            let _e264 = tone;
            let _e270 = seam;
            let _e276 = mask;
            let _e281 = (_e259.xyz * (((_e261 * (0.9f + (0.12f * _e264))) * (1f - (0.35f * _e270))) * (1f - (0.45f * _e276.w))));
            base.x = _e281.x;
            base.y = _e281.y;
            base.z = _e281.z;
        }
    } else {
        let _e288 = global.uFlags;
        if (_e288.x > 0.5f) {
            let _e292 = base;
            let _e293 = vColor_1;
            base = (_e292 * _e293);
        } else {
            let _e295 = base;
            let _e297 = base;
            let _e299 = vColor_1;
            let _e301 = (_e297.xyz * _e299.xyz);
            base.x = _e301.x;
            base.y = _e301.y;
            base.z = _e301.z;
        }
    }
    let _e309 = base;
    let _e311 = uvAlpha;
    let _e312 = uvAlpha;
    let _e313 = dpdx(_e312);
    let _e314 = uvAlpha;
    let _e315 = dpdy(_e314);
    let _e316 = textureSampleGrad(alphaMapTexture, alphaMapSampler, _e311, _e313, _e315);
    base.w = (_e309.w * _e316.y);
    let _e319 = global.uPBR;
    let _e321 = uvR;
    let _e322 = uvR;
    let _e323 = dpdx(_e322);
    let _e324 = uvR;
    let _e325 = dpdy(_e324);
    let _e326 = textureSampleGrad(roughnessMapTexture, roughnessMapSampler, _e321, _e323, _e325);
    rough = (_e319.x * _e326.y);
    let _e330 = global.uPBR;
    let _e332 = uvM;
    let _e333 = uvM;
    let _e334 = dpdx(_e333);
    let _e335 = uvM;
    let _e336 = dpdy(_e335);
    let _e337 = textureSampleGrad(metalnessMapTexture, metalnessMapSampler, _e332, _e334, _e336);
    metal = (_e330.y * _e337.z);
    let _e342 = uvA;
    let _e343 = uvA;
    let _e344 = dpdx(_e343);
    let _e345 = uvA;
    let _e346 = dpdy(_e345);
    let _e347 = textureSampleGrad(aoMapTexture, aoMapSampler, _e342, _e344, _e346);
    let _e349 = global.uPBR;
    ao_2 = mix(1f, _e347.x, _e349.w);
    let _e353 = global.uEmissive;
    let _e354 = uvE;
    let _e355 = uvE;
    let _e356 = dpdx(_e355);
    let _e357 = uvE;
    let _e358 = dpdy(_e357);
    let _e359 = textureSampleGrad(emissiveMapTexture, emissiveMapSampler, _e354, _e356, _e358);
    emit = (_e353 * _e359.xyz);
    let _e363 = global.uFlags;
    if (_e363.w > 0.5f) {
        let _e367 = dpX;
        let _e368 = dpY;
        local_8 = cross(_e367, _e368);
    } else {
        let _e370 = vNormal_1;
        local_8 = _e370;
    }
    let _e372 = local_8;
    N = normalize(_e372);
    let _e376 = gl_FrontFacing_1;
    if !(_e376) {
        let _e378 = N;
        N = -(_e378);
    }
    let _e380 = nUV;
    let _e381 = dx;
    let _e382 = dy;
    let _e383 = textureSampleGrad(normalMapTexture, normalMapSampler, _e380, _e381, _e382);
    mapN = ((_e383.xyz * 2f) - vec3(1f));
    let _e391 = global.uFlags;
    if (_e391.z > 0.5f) {
        {
            let _e395 = mapN;
            let _e397 = mapN;
            let _e399 = global.uNormalScale;
            let _e400 = (_e397.xy * _e399);
            mapN.x = _e400.x;
            mapN.y = _e400.y;
            let _e405 = dpY;
            let _e406 = N;
            q1_ = cross(_e405, _e406);
            let _e409 = N;
            let _e410 = dpX;
            q0_ = cross(_e409, _e410);
            let _e413 = q1_;
            let _e414 = dx;
            let _e417 = q0_;
            let _e418 = dy;
            T = ((_e413 * _e414.x) + (_e417 * _e418.x));
            let _e423 = q1_;
            let _e424 = dx;
            let _e427 = q0_;
            let _e428 = dy;
            B = ((_e423 * _e424.y) + (_e427 * _e428.y));
            let _e433 = T;
            let _e434 = T;
            let _e436 = B;
            let _e437 = B;
            scale = inverseSqrt(max(max(dot(_e433, _e434), dot(_e436, _e437)), 0.00000000000000000001f));
            let _e444 = T;
            let _e445 = mapN;
            let _e447 = scale;
            let _e450 = B;
            let _e451 = mapN;
            let _e453 = scale;
            let _e457 = N;
            let _e458 = mapN;
            N = normalize((((_e444 * (_e445.x * _e447)) + (_e450 * (_e451.y * _e453))) + (_e457 * _e458.z)));
        }
    }
    let _e463 = base;
    let _e465 = global.uPBR;
    if (_e463.w < _e465.z) {
        discard;
    }
    let _e468 = base;
    let _e470 = N;
    let _e471 = rough;
    let _e475 = ao_2;
    materialOutput(_e468.xyz, _e470, clamp(_e471, 0.04f, 1f), _e475, 0f, 0f, 0.04f);
    let _e480 = metal;
    gSurface.z = _e480;
    let _e481 = gEmission;
    let _e483 = emit;
    gEmission.x = _e483.x;
    gEmission.y = _e483.y;
    gEmission.z = _e483.z;
    let _e490 = global.uFlags;
    if (_e490.y > 0.5f) {
        {
            let _e494 = gAlbedo;
            gAlbedo.x = 0f;
            gAlbedo.y = 0f;
            gAlbedo.z = 0f;
            let _e501 = gEmission;
            let _e503 = gEmission;
            let _e505 = base;
            let _e507 = (_e503.xyz + _e505.xyz);
            gEmission.x = _e507.x;
            gEmission.y = _e507.y;
            gEmission.z = _e507.z;
            return;
        }
    } else {
        return;
    }
}

@fragment 
fn main(@location(0) vObjPos: vec3<f32>, @location(1) vObjN: vec3<f32>, @location(2) vWorld: vec3<f32>, @location(3) vNormal: vec3<f32>, @location(4) vColor: vec4<f32>, @location(5) vUv: vec2<f32>, @location(6) vUv1_: vec2<f32>, @location(7) vUv2_: vec2<f32>, @builtin(front_facing) gl_FrontFacing: bool) -> FragmentOutput {
    vObjPos_1 = vObjPos;
    vObjN_1 = vObjN;
    vWorld_1 = vWorld;
    vNormal_1 = vNormal;
    vColor_1 = vColor;
    vUv_1 = vUv;
    vUv1_1 = vUv1_;
    vUv2_1 = vUv2_;
    gl_FrontFacing_1 = gl_FrontFacing;
    main_1();
    let _e111 = gAlbedo;
    let _e113 = gNormal;
    let _e115 = gEmission;
    let _e117 = gSurface;
    return FragmentOutput(_e111, _e113, _e115, _e117);
}
`;
