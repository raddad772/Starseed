// Terrain surface shading.

import * as THREE from 'three';
import { GLSL_SURFACE_ATMO, GLSL_CLOUD_N, GLSL_CLOUD_SHADOW, GLSL_THERMAL } from './atmosphere.js';
import { GLSL_NOISE } from './glsl.js';
import { MAT_UNIFORMS, GLSL_MATERIALS, trackMaterial } from './materials.js';
import { GLSL_TERRAIN_SHADOW } from './terrainShadow.js';
import { GLSL_SUN_SHADOW } from './sunShadows.js';
import { GLSL_LIQUID } from './liquid.js';
import { detailData } from '../gen/detail.js';
import { GLSL_SEASON } from './season.js';

export const DETAIL_PERIOD = 4096; // metres; every detail tile period divides this

const VERT = /* glsl */`
#define NEAR_OVERLAP 0.97
attribute vec3 morph;
attribute vec4 nrm;
attribute vec4 mnrm;
attribute vec4 col;
attribute vec4 mcol;
attribute vec4 mat;
attribute vec4 ext;
attribute vec4 liq;        // (a liquid's surface: chunkbuilder.js; 0 on land)
attribute vec4 flw;        // (running water's way down and speed / 9 m/s)
attribute float occ;       // (volume chunks: how much rock overhangs; 0 where absent)
attribute vec4 cls0;       // each material class's share (gen/matclasses.js: 0..3, 4..7, 8..11)
attribute vec4 cls1;
attribute vec4 cls2;
uniform vec3 uCamLocal;
uniform vec2 uMorph;
uniform vec3 uOriginMod;
uniform vec3 uOriginRel;   // (this mesh's origin less the terrain's near anchor: planetTerrain.js)
uniform vec3 uNearOff;     // this mesh's origin less the near field's centre (body-fixed)
uniform vec2 uNear;
uniform vec3 uNearUp;
uniform float uNearMode;
varying vec3 vNearRel;
varying vec3 vAnchorPos;
varying float vOcc;
varying vec3 vWorldPos;
varying vec3 vNormal;
varying vec3 vFixedPos;
varying vec3 vFixedNormal;
varying vec4 vCol;
varying vec4 vMat;
varying vec4 vExt;
varying vec4 vLiq;
varying vec4 vFlw;
varying float vShore;
varying float vMorphK;
varying vec4 vCls0;
varying vec4 vCls1;
varying vec4 vCls2;
#include <common>
#include <logdepthbuf_pars_vertex>
void main() {
  float d = distance(morph, uCamLocal);
  float m = clamp((d - uMorph.x) / max(uMorph.y - uMorph.x, 1e-3), 0.0, 1.0);
  vec3 p = mix(position, morph, m);
  vec3 n = normalize(mix(nrm.xyz, mnrm.xyz, m));
  vCol = mix(col, mcol, m);
  vMat = mat;
  vExt = ext;
  vLiq = liq;
  vFlw = flw;
  // (its height against the water, signed: chunkbuilder.js; > 0 under it)
  vShore = mix(nrm.w, mnrm.w, m);
  vCls0 = cls0; vCls1 = cls1; vCls2 = cls2;
  vMorphK = m;
  // (a heightfield mesh reaches a little way in under the near field's last ring, a little
  // low: wherever the two surfaces' heights differ at the ring's edge, one covers the joint)
  if (uNear.x > 0.5 && uNearMode < 0.5) {
    vec3 rel = uNearOff + p;
    float dn = length(rel - uNearUp * dot(rel, uNearUp));
    p -= uNearUp * (0.4 * (1.0 - smoothstep(NEAR_OVERLAP * uNear.y, uNear.y, dn)));
  }
  vec4 wp = modelMatrix * vec4(p, 1.0);
  vWorldPos = wp.xyz;
  vNormal = normalize(mat3(modelMatrix) * n);
  vFixedPos = uOriginMod + p;
  vFixedNormal = n;
  vNearRel = uNearOff + p;
  vAnchorPos = uOriginRel + p;
  vOcc = occ;
  gl_Position = projectionMatrix * viewMatrix * wp;
  #include <logdepthbuf_vertex>
}
`;

// the rivers' water (gen/terrain.js riverRibbons): a surface of its own at its level, its chunk's
// place; the terrain's varyings as its water has them
const RIBBON_VERT = /* glsl */`
attribute vec4 nrm;
attribute vec4 liq;
attribute vec4 flw;
attribute vec2 rib;        // across it (-1..1), its mean depth (m)
attribute vec4 col;        // (the sea's or a lake's own colour where it's deep, sqrt-coded; 0 a river's)
uniform vec3 uOriginMod;
uniform vec3 uOriginRel;
uniform vec3 uNearOff;
varying vec3 vNearRel;
varying vec3 vAnchorPos;
varying float vOcc;
varying vec3 vWorldPos;
varying vec3 vNormal;
varying vec3 vFixedPos;
varying vec3 vFixedNormal;
varying vec4 vCol;
varying vec4 vMat;
varying vec4 vExt;
varying vec4 vLiq;
varying vec4 vFlw;
varying float vShore;
varying float vMorphK;
varying vec4 vCls0;
varying vec4 vCls1;
varying vec4 vCls2;
varying vec2 vRib;
#include <common>
#include <logdepthbuf_pars_vertex>
void main() {
  vec3 n = normalize(nrm.xyz);
  vCol = col; vMat = vec4(0.0); vExt = vec4(0.0, 1.0, 0.0, 0.5);
  vLiq = liq; vFlw = flw; vRib = rib;
  vShore = 1.0; vMorphK = 0.0; vOcc = 0.0;
  vCls0 = vec4(0.0); vCls1 = vec4(0.0); vCls2 = vec4(0.0);
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  vNormal = normalize(mat3(modelMatrix) * n);
  vFixedPos = uOriginMod + position;
  vFixedNormal = n;
  vNearRel = uNearOff + position;
  vAnchorPos = uOriginRel + position;
  gl_Position = projectionMatrix * viewMatrix * wp;
  #include <logdepthbuf_vertex>
}
`;

const FRAG = /* glsl */`
#define NEAR_OVERLAP 0.97
uniform vec3 uSunDir;
uniform vec3 uSunE;
uniform vec3 uCenter;
uniform float uRadius;
uniform mat3 uToFixed;
uniform sampler2D tDetail;
uniform float uTime;
uniform vec4 uCloud;
uniform float uCloudOn;
uniform float uCloudOpacity;
uniform vec3 uLavaColor;
uniform vec3 uOriginMod;
uniform float uFallTop;     // (this chunk's biggest fall: falls.js; 0 none)
uniform vec3 uFallFoot;
uniform float uFallW;
uniform vec4 uFall1;
uniform vec4 uFall2;
uniform vec3 uAmbientFloor;
uniform float uDebug;
// the near field (volume.js): x on, y its radius; uNearMode 0 a heightfield mesh (gives way to
// the volume inside, but for its water), 1 a volume chunk (shown only inside)
uniform vec2 uNear;
uniform vec3 uNearUp;      // the up at its centre: the cut is a vertical cylinder, any height
uniform float uNearMode;
uniform vec2 uNearBand;    // (a volume chunk) its ring's band from the centre
varying vec3 vNearRel;
varying vec3 vAnchorPos;
varying float vOcc;
varying vec3 vWorldPos;
varying vec3 vNormal;
varying vec3 vFixedPos;
varying vec3 vFixedNormal;
varying vec4 vCol;
varying vec4 vMat;
varying vec4 vExt;
varying vec4 vLiq;
varying vec4 vFlw;
varying float vShore;
varying float vMorphK;
varying vec4 vCls0;
varying vec4 vCls1;
varying vec4 vCls2;
#include <common>
#include <logdepthbuf_pars_fragment>
${GLSL_SURFACE_ATMO}
${GLSL_NOISE}

uniform sampler3D tNoise;
uniform sampler2D tCloudMap;
uniform float uCloudMapMean;
${GLSL_SEASON}
${GLSL_CLOUD_N}
${GLSL_CLOUD_SHADOW}
${GLSL_THERMAL}
${GLSL_TERRAIN_SHADOW}
${GLSL_SUN_SHADOW}
${GLSL_LIQUID}
#ifdef RIBBON
// a river's water over what's drawn (engine.js's water pass): the image so far and its depth,
// copied, read under it; the camera's projection for where a ray lands on the screen
uniform sampler2D tOpaque;
uniform sampler2D tWaterDepth;
uniform float uZMode, uZNear, uZFar, uZLogFC;
uniform mat4 projectionMatrix;
varying vec2 vRib;
// (the depth there as the eye's distance along its axis: engine.js's reversed or logarithmic depth)
float sceneZ(vec2 uv) {
  float d = texelFetch(tWaterDepth, ivec2(uv * vec2(textureSize(tWaterDepth, 0))), 0).r;
  if (uZMode < 0.5) return d <= 0.0 ? 1e9 : (uZFar * uZNear / (uZFar - uZNear)) / max(d + uZNear / (uZFar - uZNear), 1e-30);
  return d >= 1.0 ? 1e9 : exp2(d * uZLogFC) - 1.0;
}
// (a point's place on the screen, and how far along the eye's axis)
vec3 onScreen(vec3 p) {
  vec4 c = projectionMatrix * viewMatrix * vec4(p, 1.0);
  return vec3(c.xy / max(c.w, 1e-6) * 0.5 + 0.5, c.w);
}
#endif
#if MAT_MODE > 0
uniform vec2 uWindRipple;   // sand's ripples on this world: strength, spacing over Earth's (materials.js)
${GLSL_MATERIALS}
#endif

// detail texture: r = height noise, g/b = slope (encoded), a = secondary noise
vec4 tri(vec3 p, vec3 w, float period) {
  vec4 a = texture(tDetail, p.yz / period);
  vec4 b = texture(tDetail, p.zx / period + 0.37);
  vec4 c = texture(tDetail, p.xy / period + 0.71);
  return a * w.x + b * w.y + c * w.z;
}
// the same at the full-size texels: for a point that's one and the same over many pixels (a floe's
// middle: liquid.js floeState), whose coordinates jump between neighbouring pixels at its edge, where the
// GPU's mip choice from them read a blurred level, a different floe for those pixels (dashes along leads)
vec4 tri0(vec3 p, vec3 w, float period) {
  vec4 a = textureLod(tDetail, p.yz / period, 0.0);
  vec4 b = textureLod(tDetail, p.zx / period + 0.37, 0.0);
  vec4 c = textureLod(tDetail, p.xy / period + 0.71, 0.0);
  return a * w.x + b * w.y + c * w.z;
}
// triplanar bump: perturbs the planet-fixed normal
vec3 triBump(vec3 p, vec3 n, vec3 w, float period, float strength) {
  vec2 gx = texture(tDetail, p.yz / period).gb * 2.0 - 1.0;
  vec2 gy = texture(tDetail, p.zx / period + 0.37).gb * 2.0 - 1.0;
  vec2 gz = texture(tDetail, p.xy / period + 0.71).gb * 2.0 - 1.0;
  vec3 bx = vec3(0.0, gx.x, gx.y);
  vec3 by = vec3(gy.y, 0.0, gy.x);
  vec3 bz = vec3(gz.x, gz.y, 0.0);
  vec3 g = bx * w.x + by * w.y + bz * w.z;
  return normalize(n - g * strength);
}

void main() {
  #include <logdepthbuf_fragment>
  // (a pixel's span on the ground: the cloud shadows' noise fades where it is finer)
  float foot = length(fwidth(vWorldPos));
  // (the scanned surfaces' screen derivatives, here in uniform control flow: read in branches)
  vec3 dpx = dFdx(vFixedPos), dpy = dFdy(vFixedPos);
  vec3 albedo = vCol.rgb * vCol.rgb;
  float waterEnc = vCol.a;
#ifndef RIBBON
  if (uNear.x > 0.5) {
    float dn = length(vNearRel - uNearUp * dot(vNearRel, uNearUp));
    if (uNearMode < 0.5) { if (dn < NEAR_OVERLAP * uNear.y && vShore <= 0.0) discard; }
    else if (dn < uNearBand.x || dn > uNearBand.y) discard;
  }
#endif
  float veg = vMat.r, snow = vMat.g, rock = vMat.b, sand = vMat.a;
  float emissive = vExt.r, wet = vExt.g, rough = vExt.b;
  vec3 rel = vWorldPos - uCenter;
  float r = length(rel);
  vec3 up = rel / r;
  float dist = length(vWorldPos);
  vec3 N = normalize(vNormal);
  float muS = dot(up, uSunDir);
  vec3 sunT = atmoSunTransmittance(r, muS);
  vec3 skyE = atmoSkyIrradiance(r, muS);

  // (the clouds': their shadows, and the sky's light under them)
  sunT *= cloudLight(rel, r, muS, foot, sunT, skyE);
  // (the ground's own shadows: a ridge's across the valley)
  vec3 pF = uToFixed * rel;
  sunT *= terrainShadow(pF, normalize(pF), uToFixed * uSunDir, uRadius);
  // (and finer near the camera: the sun's shadow maps)
  sunT *= sunShadowMap(vWorldPos, N);

  // ---- detail (planet-fixed, precision-safe coordinates)
  vec3 fp = vFixedPos;
  vec3 fn = normalize(vFixedNormal);
  vec3 w = pow(abs(fn), vec3(4.0));
  w /= (w.x + w.y + w.z);
  float fineK = 1.0 - smoothstep(60.0, 900.0, dist);
  float midK = 1.0 - smoothstep(600.0, 9000.0, dist);
  float farK = 1.0 - smoothstep(6000.0, 90000.0, dist);
  // (the shore: where the vertices' signed height against the water crosses 0)
  float isWater = vShore > 0.0 ? 1.0 : 0.0;
  float gRough = 0.8, gAO = 1.0;   // (the scanned surfaces' roughness and occlusion: materials.js)
  if (isWater < 0.5) {
    // (d0: the detail's whole period, 4 km)
    vec4 d0 = tri(fp, w, ${DETAIL_PERIOD.toFixed(1)});
    vec4 d1 = tri(fp, w, 512.0);
    vec4 d2 = tri(fp, w, 64.0);
    // the seasons' snow, over the year-round snow the ground was made with (vMat.g): white over what
    // grows and what lies bare, its own surface in place of theirs; none on a bed under water or on a
    // lava's glow
    vec4 c0 = vCls0, c1 = vCls1, c2 = vCls2;
    if (uSeason.z > 0.5) {
      float sn = seasonSnow(uToFixed * up, fn, vExt.a * 120.0 - 60.0, mix(d2.r, d1.r, smoothstep(250.0, 1000.0, dist)) * 0.7 + d0.a * 0.3);
      sn *= (1.0 - smoothstep(0.0, 0.02, waterEnc)) * (1.0 - smoothstep(0.0, 0.1, emissive));
      // (the year-round snow showing: a glacier's bare ice, its ablation zone, isn't; a winter's snow
      // covers it too)
      float snow0 = snow * (1.0 - c2.w);
      if (sn > snow0) {
        float k = (1.0 - sn) / max(1.0 - snow0, 1e-3);
        albedo = mix(albedo, uSnowCol, (sn - snow0) / max(1.0 - snow0, 1e-3));
        veg *= k; rock *= k; sand *= k;
        c0 *= k; c1 *= k; c2 = vec4(c2.xy * k, c2.z + (sn - snow0), c2.w * k);
        snow = max(snow, sn);
      }
    }
#if MAT_MODE > 0
    // the scanned surfaces (materials.js), over the large patches and brightness the 4 km and 512 m
    // detail tiles give: the near tile within a few hundred metres, the 16 m one out to ~3 km
    float rockAmt = clamp(rock + rough * 0.3, 0.0, 1.0);
    float cover = smoothstep(0.38, 0.66, d1.a + (d0.a - 0.5) * 0.8) * midK;
    albedo = mix(albedo, albedo * vec3(1.35, 1.12, 0.62), veg * cover * 0.55);
    float bare = smoothstep(0.6, 0.78, d1.r + (d0.r - 0.5) * 0.8) * veg * midK;
    albedo = mix(albedo, albedo * vec3(1.9, 1.45, 1.1) + vec3(0.012, 0.009, 0.006), bare * 0.55);
    // (and the tens of metres between the scans' 16 m and the 512 m tile: the 64 m tile, moved by the
    // 4 km one so it makes no lattice)
    float v = (d0.r - 0.5) * 0.25 * midK + (d1.r - 0.5) * 0.55 * farK + (d2.r - 0.5) * 0.3 * midK * (0.4 + 1.2 * d0.a);
    albedo *= 1.0 + v * mix(0.85, 1.35, rockAmt) * (1.0 - snow * 0.6);
    // (none of the fine materials on a bed deep under the water's own surface, chunkbuilder.js: ~5 to 20 m)
    float under = 1.0 - smoothstep(0.03, 0.06, waterEnc);
    float kF = (1.0 - smoothstep(60.0, 260.0, dist)) * under;
    float kM = (1.0 - smoothstep(1800.0, 3500.0, dist)) * mix(0.6, 1.0, smoothstep(5.0, 60.0, dist)) * under;
    MatS ms = matGround(c0, c1, c2, fp, dpx, dpy, fn, kF, kM);
    albedo *= ms.ratio;
    // (glacier ice: its body blue)
    albedo *= mix(vec3(1.0), vec3(0.74, 0.88, 1.0), c2.w);
    gRough = ms.rough; gAO = ms.ao;
    // sand: the wind's ripples, as far as this world's air works its sand
    if (vCls1.z > 0.05 && uWindRipple.x > 0.0 && under > 0.0) {
      vec3 upL = uToFixed * up;
      ms.n = sandRippleN(vAnchorPos, dpx, dpy, ms.n, uWindRipple.y, foot, uWindRipple.x * min(vCls1.z * 1.5, 1.0), cross(vec3(0.0, 1.0, 0.0), upL), upL, windSense(upL));
    }
    N = normalize(mix(N, normalize(transpose(uToFixed) * ms.n), 0.9));
#else
    vec4 d3 = tri(fp, w, 8.0);
    float grainK = 1.0 - smoothstep(8.0, 140.0, dist);
    vec4 d4 = grainK > 0.0 ? tri(fp, w, 1.0) : vec4(0.5);
    float rockAmt = clamp(rock + rough * 0.3, 0.0, 1.0);
    // patchy ground cover: lush / dry swathes and bare soil in vegetated land: the 64 m tile's patches
    // near, the 512 m tile's further off (the 64 m ones, alike every 64 m, read from a km off as a
    // lattice of spots), both moved by the 4 km tile so no two neighbourhoods match
    float pK = smoothstep(250.0, 1000.0, dist);
    float cover = smoothstep(0.38, 0.66, mix(d2.a, d1.a, pK) + (d0.a - 0.5) * 0.8) * midK;
    albedo = mix(albedo, albedo * vec3(1.35, 1.12, 0.62), veg * cover * 0.55);
    float bare = smoothstep(0.6, 0.78, mix(d2.r, d1.r, pK) + (d0.r - 0.5) * 0.8) * veg * midK;
    albedo = mix(albedo, albedo * vec3(1.9, 1.45, 1.1) + vec3(0.012, 0.009, 0.006), bare * 0.55);
    // snow thins out over rocks and in wind-scoured patches
    albedo = mix(albedo, albedo * 0.72, snow * smoothstep(0.55, 0.8, d3.a) * fineK * 0.6);
    // multi-scale brightness variation down to sub-metre grain
    float v = (d0.r - 0.5) * 0.25 * midK + (d1.r - 0.5) * 0.55 * farK + (d2.r - 0.5) * 0.45 * midK * (0.4 + 1.2 * d0.a) + (d3.a - 0.5) * 0.45 * fineK + (d4.r - 0.5) * 0.5 * grainK;
    albedo *= 1.0 + v * mix(0.85, 1.35, rockAmt) * (1.0 - snow * 0.6);
    // bump detail: rock strong, vegetation soft, snow smooth
    vec3 nf = fn;
    float bumpK = mix(0.45, 1.25, rockAmt) * (1.0 - snow * 0.6);
    nf = triBump(fp, nf, w, 64.0, 0.55 * bumpK * midK);
    nf = triBump(fp, nf, w, 8.0, 0.55 * bumpK * fineK);
    nf = triBump(fp, nf, w, 1.0, 0.45 * bumpK * grainK);
    // planet-fixed -> world: apply the same rotation as the geometry
    vec3 nWorld = normalize(transpose(uToFixed) * nf);
    N = normalize(mix(N, nWorld, 0.85));
#endif
  }

  float ndl = max(dot(N, uSunDir), 0.0);
  vec3 color;
  vec3 dbgW = vec3(-1.0);
  if (isWater > 0.5) {
    // ---- an open liquid (liquid.js): its waves by the wind, the sun's glitter on them by what the
    // pixel resolves, the sky's reflection by the liquid's own index, its body's colour by depth,
    // foam; frozen by the season
    vec3 V = normalize(-vWorldPos);
    vec3 upF = uToFixed * up;
    // (its own values, a shore's triangle's land vertices left out: they hold none)
    vec3 lq = vLiq.x > 0.02 ? vLiq.yzw / vLiq.x : vec3(0.0, 0.75, 1.0);
    float kind = lq.x, Tm = lq.y * 120.0 - 60.0;
    bool river = kind > 0.55 && kind < 0.85;
    float flow = river ? lq.z : 0.0;
    float fetch = kind < 0.2 ? 1.0 : river ? 0.2 : kind > 0.85 ? 0.05 : lq.z;
#ifdef RIBBON
    // (how deep it is here: down to the bed the eye sees through it, the image's depth behind it)
    vec3 sc = onScreen(vWorldPos);
    float zW = sc.z, zB = sceneZ(gl_FragCoord.xy / vec2(textureSize(tWaterDepth, 0)));
    float depthW = min(max(dot(vWorldPos - vWorldPos * (zB / zW), up), 0.0), 60.0);
    // (over a fall's face, the sheet's own thickness: its unit discharge over its speed there, a few
    // tenths of a metre; the rock behind it seen through where it isn't broken white)
    float fallK0 = smoothstep(0.13, 0.3, 1.0 - dot(normalize(vFixedNormal), uToFixed * up));
    if (fallK0 > 0.0) {
      float zf0 = uFallTop > 0.0 ? max(uFallTop - r, 0.0) : 4.0;
      depthW = mix(depthW, clamp(max(vRib.y, 0.1) * max(vFlw.w * 9.0, 0.5) / (sqrt(2.0 * uLiquid2.x * zf0) + 0.5), 0.03, 1.0), fallK0);
    }
#else
    float depthW = vShore * vShore * 64.0;
#endif
    // (smooth noise for the waves: their crests' bends, from the 512 m tile, and their groups' heights)
    vec4 nW = tri(fp, w, 512.0), nG = tri(fp, w, 64.0);
    vec2 wn = vec2(nW.r - 0.5, nW.a - 0.5) * 2.0;
    vec4 grp = clamp(vec4(nG.r, nG.a, nW.a, nW.r) * 1.6 - 0.3, 0.0, 1.0);
    vec3 nF; float wr, foam;
    // (how it runs: chunkbuilder.js's flw, slower toward its banks where the land's zero comes in)
    float fv = max(vFlw.w, 0.0) * 9.0;
#ifdef RIBBON
    // (across it, as Manning's has it at each depth: slower in its shallows toward the banks; and no
    // faster than critical for its depth: a mobile bed's riffles and bars rise and fall until the flow
    // over them stays about there (Grant 1997), its surface over a riffle higher than a smooth level)
    fv *= pow(clamp(depthW / max(vRib.y, 0.05), 0.0, 2.0), 0.667);
    fv = min(fv, sqrt(uLiquid2.x * max(depthW, 0.05)));
#endif
    liquidSurface(fp, fn, upF, kind, flow, fetch, depthW, foot, wn, grp, vFlw.xyz, fv, nF, wr, foam);
    // (the sea's ice: how close its pack is here (liquid.js seaIceCover); the waves die in it, the short
    // chop at once and the swell within a few floes (Squire 2007), so its leads lie calm, no whitecaps)
    vec2 tsf = liquidTs(Tm, kind, flow, upF);
    float ice = 1.0 - smoothstep(tsf.y - 4.0, tsf.y + 4.0, tsf.x), iceC = kind < 0.2 && ice > 0.0 ? seaIceCover(ice, nW.a, nG.r) : 0.0;
    // (the leads freeze over by how cold it is, under snow by the winter's fall: a month's of the year's
    // twelve, a day's of its days)
    float pDay = uSeason.z > 0.5 ? 12.0 * seasonYear(upF).z * DDF_SNOW / max(uSeason.y, 1.0) : 0.0;
    vec2 lead = vec2(0.0);
    // (the air over the pack, which the leads freeze by: its ice keeps the sea's heat from it, worldsim/
    // season.js seasonIce; the open sea's own where the world keeps no year)
    float Tair = uSeason.z > 0.5 ? Tm + seasonIceNow(upF) : tsf.x;
    vec4 fl = kind < 0.2 ? seaFloes(fp, upF, w, ice, iceC, foot, max(tsf.y - Tair, 0.0), pDay, lead) : vec4(ice, 0.0, 1.0, 0.0);
    float calm = smoothstep(0.05, 0.6, max(iceC, fl.w));
    nF = normalize(mix(nF, upF, 0.9 * calm)); wr *= 1.0 - 0.8 * calm; foam *= 1.0 - calm;
    // (a falling sheet carries no river's ripples: its own surface, streaked below)
    if (river) nF = normalize(mix(nF, fn, smoothstep(0.13, 0.3, 1.0 - dot(fn, upF))));
    // (a river's water carries silt, the more the faster it runs: a water world's rivers browner
    // than its lakes)
#ifndef RIBBON
    if (river && uLiquid2.y > 0.9) albedo = mix(albedo, vec3(0.055, 0.045, 0.025), clamp(0.25 + 0.3 * fv, 0.0, 0.75));
#endif
    vec3 Nw = normalize(transpose(uToFixed) * nF);
    // (the waves' normal can face away from a grazing eye: lean it back)
    Nw = normalize(Nw + V * max(0.0, 0.02 - dot(Nw, V)));
    float NdV = max(dot(Nw, V), 1e-3), ndlW = max(dot(Nw, uSunDir), 0.0);
    float F0 = uLiquid.x;
    float F = F0 + (max(1.0 - wr, F0) - F0) * pow(1.0 - NdV, 5.0);
    // the sky in the reflected direction: its light, brighter toward the horizon, and the sun's aureole
    vec3 R = reflect(-V, Nw);
    float el = max(dot(R, up), 0.0);
    vec3 skyRefl = uSunE * skyE / PI * (0.7 + 1.1 * pow(1.0 - el, 3.0)) + uSunE * sunT * 0.05 * pow(max(dot(R, uSunDir), 0.0), 12.0);
#ifdef RIBBON
    vec3 body;
    {
      // ---- what's under it, seen through it. The bed (the image drawn so far) where the eye's ray,
      // bent at the surface (Snell, by the liquid's index), reaches it; dimmed over the light's way
      // down to it and back up by what the water absorbs and its silt scatters back (K ~ a + bb), and
      // the light its silt scatters back up added (a deep column's reflectance ~0.33 bb / (a + bb):
      // Gordon et al. 1975). The silt's load by how fast it runs (a suspended-sediment rating curve,
      // C ~ Q^1-2, and at a section v ~ Q^0.34: ~v^3), some 30 g/m^3 at 1 m/s; its scattering
      // 0.25 m^2/g, 2% of it back; its absorption a mineral's, yellow-brown (more in the blue). And
      // its dissolved organic matter's (liquid.js uLiquid3.w), at the image's 610, 545 and 465 nm
      float nI = (1.0 - sqrt(F0)) > 0.0 ? (1.0 + sqrt(F0)) / (1.0 - sqrt(F0)) : 1.33;
      vec3 Tr = refract(-V, Nw, 1.0 / nI);
      float cT = max(-dot(Tr, up), 0.2);
      vec3 sb = onScreen(vWorldPos + Tr * (depthW / cT));
      vec2 uvB = clamp(sb.xy, vec2(0.0), vec2(1.0));
      // (not something above the water the bend looked across to)
      if (sceneZ(uvB) < zW) uvB = sc.xy;
      vec3 bed = texture(tOpaque, uvB).rgb;
      // (a river's load by its speed; the sea's a coastal sea's few g/m^3, and in the surf where the waves
      // stir up its bed much more; a lake's a little)
      float ssc = river ? clamp(30.0 * fv * fv * fv, 0.5, 3000.0) : kind < 0.2 ? 5.0 + 40.0 * (1.0 - smoothstep(0.0, 2.0, depthW)) : 3.0;
      // (dissolved organic matter: a river's the most, a lake's some, the open sea's little)
      vec3 a = uLiquid3.rgb + ssc * vec3(0.012, 0.02, 0.035) + uLiquid3.w * (river ? 1.0 : kind < 0.2 ? 0.02 : 0.5) * vec3(0.078, 0.207, 0.687);
      vec3 bb = vec3(0.019 * 0.25 * ssc);
      vec3 K = a + bb;
      float cS = sqrt(max(1.0 - (1.0 - muS * muS) / (nI * nI), 0.04));
      vec3 Tb = exp(-K * depthW * (1.0 / cT + 1.0 / cS));
      vec3 Ed = uSunE * sunT * max(muS, 0.0) + uSunE * skyE;
      // (where it's deep: the sea's or a lake's own colour, as the terrain draws it from afar, so the two
      // meet without a step; a river's its silt's scatter)
      vec3 deep = dot(vCol.rgb, vec3(1.0)) > 0.001 ? vCol.rgb * vCol.rgb / PI * (uSunE * sunT * max(muS, 0.0) * 0.6 + uSunE * skyE * 0.5) : 0.33 * bb / K / PI * Ed;
      body = bed * Tb + deep * (1.0 - exp(-K * depthW * (1.0 / cT + 1.0)));
    }
    // ---- what it reflects: the banks and trees drawn (a ray marched across the image's depth),
    // else the sky
    {
      vec3 Rf = reflect(-V, Nw);
      float hitK = 0.0;
      vec3 hitC = vec3(0.0);
      // (where it reflects enough to show: not looking straight down into it. The ray stepped in clip
      // space, where it's a straight line: each step an add, not a projection. Not in the pack's calm leads:
      // the floes beside them aren't in the image it reads (drawn with the water), only the bed under them
      // and the far sea's ice, its false hits a dashed white line down every lead; they mirror the sky)
      if (dot(Rf, up) > 0.0 && F > 0.035 && calm < 0.5) {
        vec4 C0 = projectionMatrix * viewMatrix * vec4(vWorldPos, 1.0), CD = projectionMatrix * viewMatrix * vec4(Rf, 0.0);
        float t0 = 0.0, t = 0.3 + 0.01 * zW;
        for (int i = 0; i < 16; i++) {
          vec4 c = C0 + CD * t;
          if (c.w <= 0.0) break;
          vec2 q = c.xy / c.w * 0.5 + 0.5;
          if (q.x < 0.0 || q.y < 0.0 || q.x > 1.0 || q.y > 1.0) break;
          float zs = sceneZ(q);
          if (c.w > zs && c.w - zs < max(0.6, 0.35 * t)) {
            // (found between t0 and t: narrowed)
            float lo = t0, hi = t;
            for (int k = 0; k < 5; k++) {
              float tm = 0.5 * (lo + hi);
              vec4 cm = C0 + CD * tm;
              if (cm.w > sceneZ(cm.xy / cm.w * 0.5 + 0.5)) hi = tm; else lo = tm;
            }
            vec4 ch = C0 + CD * hi;
            vec2 qh = ch.xy / ch.w * 0.5 + 0.5, e = min(qh, 1.0 - qh);
            hitK = smoothstep(0.0, 0.08, min(e.x, e.y));
            hitC = texture(tOpaque, qh).rgb;
            break;
          }
          t0 = t;
          t *= 1.45;
        }
      }
      skyRefl = mix(skyRefl, hitC, hitK);
    }
#else
    vec3 body = albedo / PI * (uSunE * sunT * max(muS, 0.0) * 0.6 + uSunE * skyE * 0.5);
    // (a river drawn by the mesh, from afar: its water as the near surface's (RIBBON), deep, its bed unseen)
    if (river && uLiquid2.y > 0.9) {
      float ssc = clamp(30.0 * fv * fv * fv, 0.5, 3000.0);
      vec3 a = uLiquid3.rgb + ssc * vec3(0.012, 0.02, 0.035) + uLiquid3.w * vec3(0.078, 0.207, 0.687), bb = vec3(0.019 * 0.25 * ssc);
      body = 0.33 * bb / (a + bb) / PI * (uSunE * sunT * max(muS, 0.0) + uSunE * skyE);
    }
#endif
    // the sun's glitter: GGX by the waves the pixel can't resolve
    vec3 H = normalize(V + uSunDir);
    float a2 = wr * wr * wr * wr, a2s = max(a2, 1e-7);
    float NdH = max(dot(Nw, H), 0.0), VdH = max(dot(V, H), 0.0);
    float Dg = a2s / (PI * pow(NdH * NdH * (a2s - 1.0) + 1.0, 2.0));
    float kg = (wr + 1.0) * (wr + 1.0) / 8.0;
    float Gg = NdV / (NdV * (1.0 - kg) + kg) * ndlW / (ndlW * (1.0 - kg) + kg);
    float Fs = F0 + (1.0 - F0) * pow(1.0 - VdH, 5.0);
    color = body * (1.0 - F) + skyRefl * F + uSunE * sunT * Dg * Gg * Fs / (4.0 * NdV) * step(0.0, muS);
    // foam: white, matte
    vec3 lit = uSunE * sunT * max(dot(up, uSunDir), 0.0) + uSunE * skyE;
    // a fall (falls.js): where a river runs steep, a sheet down the face, as fast as it has fallen
    // (sqrt(2 g z) from its lip, to what the air lets it), streaked by the detail noise drawn out down
    // it and carried at that speed (two phases faded in turn, so a speed that grows down it doesn't
    // shear them), white as far as the air breaks it up; and churned white where it lands
    float fallK = river ? smoothstep(0.13, 0.3, 1.0 - dot(fn, upF)) : 0.0, dbgWhite = 0.0;
    if (fallK > 0.0) {
      vec3 dn = upF - fn * dot(upF, fn);
      vec3 down = -dn / max(length(dn), 1e-4), acr = normalize(cross(fn, down));
      float zf = uFallTop > 0.0 ? max(uFallTop - r, 0.0) : 4.0;
      float v = min(sqrt(2.0 * uFall1.x * zf) + 0.3, uFall1.y);
      float L = 1.0 + 0.35 * v;
      float t1 = fract(uTime * 0.4), t2 = fract(uTime * 0.4 + 0.5), wa = 1.0 - abs(2.0 * t1 - 1.0);
      // (ropes a metre or few across, drawn out down the fall and carried at its speed: the noise at
      // two scales across the face)
      vec2 q = vec2(dot(fp, acr) * 0.03, dot(fp, down) * 0.03 / L);
      float sA = texture(tDetail, q - vec2(0.0, v * t1 * 2.5 * 0.03 / L)).r + 0.5 * texture(tDetail, q * 2.0 - vec2(0.0, v * t1 * 5.0 * 0.03 / L)).a;
      float sB = texture(tDetail, q + vec2(0.37, 0.0) - vec2(0.0, v * t2 * 2.5 * 0.03 / L)).r + 0.5 * texture(tDetail, q * 2.0 + vec2(0.11, 0.0) - vec2(0.0, v * t2 * 5.0 * 0.03 / L)).a;
      float st = 0.5 + (mix(sB, sA, wa) - 0.75) * 1.6;
      // (glassy at its lip, breaking up as it falls: its turbulent surface takes in air from the lip
      // down, white streaks that thicken, until it's broken through at Horeni's length (1956: ~6 q^0.32
      // m, q its unit discharge, m^2/s); the sooner the denser the air tears it. Its water thinner
      // toward its sides, torn there first)
#ifdef RIBBON
      float edge = 1.0 - vRib.x * vRib.x, qU = max(vRib.y, 0.1) * max(vFlw.w * 9.0, 0.3);
#else
      float edge = 1.0, qU = max(vFlw.w * 9.0, 0.3);
#endif
      float br = clamp(zf / (6.0 * pow(qU, 0.32)), 0.0, 1.0);
      float aer = mix(0.25, 0.95, uFall2.y) * smoothstep(0.0, 0.5, zf);
      float jets = smoothstep(0.62 - 0.5 * br, 0.8 - 0.5 * br, st + 0.3 * (edge - 1.0));
      float white = clamp(aer * jets, 0.0, 1.0);
      dbgWhite = white;
      vec3 nS = normalize(Nw + transpose(uToFixed) * acr * (st - 0.5) * 0.8);
      vec3 litS = uSunE * sunT * max(dot(nS, uSunDir), 0.0) + uSunE * skyE * 0.6;
      color = mix(color, mix(color * 0.8, vec3(0.8) / PI * litS, white), fallK);
      foam *= 1.0 - fallK;
    }
    if (uFallTop > 0.0) {
      float dF = length(vFixedPos - uOriginMod - uFallFoot) / max(uFallW * 1.2 + 2.0, 2.0);
      foam = max(foam, (1.0 - smoothstep(0.25, 1.0, dF)) * mix(0.35, 0.95, uFall2.y) * (0.6 + 0.8 * (grp.x - 0.5)) * (1.0 - fallK));
    }
    color = mix(color, vec3(0.75) / PI * lit, clamp(foam, 0.0, 1.0));
    // frozen: the sea's ice as floes (liquid.js seaFloes: gen/liquidice.js reads the same, so where it's
    // drawn is where it bears you), their rims blue-grey where their sides and wet edges show, the young
    // ones grey, the old under snow; a lake's and a pond's ice whole, under snow where it's long frozen.
    // The leads between whole floes freeze over as they age (liquid.js leadIce): open water just opened,
    // then nilas, grey and grey-white ice by its thickness (albedo ~0.07 rising to ~0.4 over a few tens
    // of cm: Brandt et al. 2005), under snow once it bears it
    if (ice > 0.0) {
      vec4 dI = nW, dJ = nG;
      if (kind < 0.2) {
        float lIce = smoothstep(0.3, 1.5, lead.x) * (1.0 - fl.x);
        vec3 lAlb = mix(vec3(0.07 + 0.33 * (1.0 - exp(-lead.x / 10.0))) * vec3(0.92, 0.97, 1.0), vec3(0.82, 0.86, 0.9), lead.y);
        color = mix(color, lAlb / PI * (uSunE * sunT * max(muS, 0.0) + uSunE * skyE), lIce);
        albedo = mix(albedo, lAlb, lIce);
      }
      ice = fl.x;
      // (snow on a floe as old as it is, drifted a little across it)
      float snowy = smoothstep(0.3, 0.7, fl.z + (dJ.a - 0.5) * 0.25) * (1.0 - 0.7 * fl.y / max(fl.x, 1e-3));
      vec3 iceAlb = mix(vec3(0.42, 0.52, 0.6), vec3(0.82, 0.86, 0.9), snowy) * (0.9 + 0.2 * dI.r);
      vec3 N2 = normalize(mix(up, N, 0.5));
      vec3 iceCol = iceAlb / PI * (uSunE * sunT * max(dot(N2, uSunDir), 0.0) + uSunE * skyE * (0.5 + 0.5 * dot(N2, up)));
      float NdH2 = max(dot(N2, H), 0.0);
      iceCol += uSunE * sunT * pow(NdH2, mix(400.0, 40.0, snowy)) * 0.04 * step(0.0, muS);
      color = mix(color, iceCol, ice);
      albedo = mix(albedo, iceAlb, ice);
    }
    dbgW = uDebug > 6.5 ? vec3(fallK, dbgWhite, river ? 1.0 : 0.0) : uDebug < 2.5 ? vec3(ice) : uDebug < 3.5 ? vec3(Tm / 40.0) : uDebug < 4.5 ? vec3(foam) : uDebug < 5.5 ? vLiq.xyz : vec3(wr * 4.0);
  } else {
    float wrap = 0.5 + 0.5 * dot(N, up);
    vec3 direct = uSunE * sunT * ndl;
    vec3 ambient = uSunE * skyE * wrap + uAmbientFloor;
    // far off the ground's small roughness goes unresolved, but its shadows don't: rocks,
    // furrows and a forest's canopy darken it, the more so with the sun low
    float farK = smoothstep(1500.0, 12000.0, dist);
    float hidden = max(clamp(0.25 + 0.55 * rough + 0.35 * rock, 0.0, 1.0) * (1.0 - 0.6 * snow), veg * 0.85);
    albedo *= 1.0 - farK * hidden * (0.25 + 0.35 * (1.0 - clamp(muS, 0.0, 1.0)));
#if MAT_MODE > 0
    color = albedo / PI * (direct * mix(1.0, gAO, 0.35) + ambient * gAO);
#else
    color = albedo / PI * (direct + ambient);
#endif
    // (under overhangs and in caves: little sky and less sun)
    color *= 1.0 - 0.94 * vOcc;
    vec3 V = normalize(-vWorldPos);
    vec3 H = normalize(V + uSunDir);
#if MAT_MODE > 0
    // the sun's gloss (GGX) by the surface's own roughness, a film of water glossier; ice's index
    // lower than rock's
    float rg = clamp(mix(gRough, 0.12, wet * 0.8), 0.05, 1.0), a2 = rg * rg * rg * rg;
    float NdH = max(dot(N, H), 0.0), NdV = max(dot(N, V), 1e-3), VdH = max(dot(V, H), 0.0);
    float Dg = a2 / (PI * pow(NdH * NdH * (a2 - 1.0) + 1.0, 2.0));
    float kk = (rg + 1.0) * (rg + 1.0) / 8.0;
    float Gg = NdV / (NdV * (1.0 - kk) + kk) * ndl / (ndl * (1.0 - kk) + kk);
    float F0 = 0.04 - 0.02 * vCls2.w;
    float Fs = F0 + (1.0 - F0) * pow(1.0 - VdH, 5.0);
    color += uSunE * sunT * Dg * Gg * Fs / (4.0 * NdV);
    // glints: snow's grains, and quartz sand's, fewer, near enough to tell apart
    float gw = vCls2.z + 0.6 * vCls1.z;
    if (gw > 0.05 && dist < 60.0 && muS > 0.0) {
      float g = grainGlint(fp, N, H, mix(0.9, 0.97, vCls1.z / max(gw, 1e-3)));
      color += uSunE * sunT * g * 25.0 * gw * (1.0 - smoothstep(15.0, 60.0, dist));
    }
#else
    // wet / icy sheen
    // (an airless world's ground is regolith, frost included: matte, no gloss)
    float sp = pow(max(dot(N, H), 0.0), mix(20.0, 120.0, snow)) * (0.03 + 0.25 * snow + 0.3 * wet) * (uHasAtmo > 0.5 ? 1.0 : 0.1);
    color += uSunE * sunT * sp * ndl;
#endif
  }
  // a hot world's ground glows at its own temperature (emissivity 1 - albedo), less the higher it
  // stands; and under a sky its air makes opaque, it gives back the air's glow from all round (albedo
  // x the air's light: without it the ground read darker than the air, which an oven's walls don't)
  if (uThermal.x > 0.0) {
    vec3 a = clamp(albedo, 0.0, 1.0);
    color += (vec3(1.0) - a) * blackbodyGlow(uThermal.x - uThermal.y * (r - uRadius));
    color += a * (vec3(1.0) - atmoSunTransmittance(r, 1.0)) * blackbodyGlow(uThermal.x - uThermal.z * max(r - uRadius, 0.0));
  }
  // molten rock glows regardless of lighting
  if (emissive > 0.01) {
    float flick = 0.85 + 0.15 * sin(uTime * 1.7 + vFixedPos.x * 0.05 + vFixedPos.z * 0.07);
    float crust = smoothstep(0.35, 0.65, tri(fp, w, 128.0).a);
    color += uLavaColor * emissive * flick * mix(1.0, 0.15, crust * (1.0 - emissive * 0.5));
  }
  if (uDebug > 1.5) color = (dbgW.x < 0.0 ? vec3(0.5, 0.0, 0.5) * waterEnc * 50.0 : dbgW) * (uDebug > 7.5 ? 0.02 : 1.0);
  else if (uDebug > 0.5) color = mix(color, vec3(vMorphK, 1.0 - vMorphK, 0.0) * 0.2, 0.5);
  gl_FragColor = vec4(color, 1.0);
}
`;

// Tileable detail texture: value-noise fBm on a periodic lattice; g/b store slopes (gen/detail.js)
export function makeDetailTexture(size = 256) {
  const data = detailData(size);
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

// a chunk's rivers' water (planetTerrain.js): its chunk's material's uniforms (its place, its falls),
// and the water pass's (engine.js: the image and its depth under it)
export const RIBBON_PASS = { scene: null, uniforms: null };
export function makeRibbonMaterial(chunkMat) {
  const m = new THREE.ShaderMaterial({
    uniforms: { ...chunkMat.uniforms, ...RIBBON_PASS.uniforms },
    vertexShader: RIBBON_VERT,
    fragmentShader: FRAG,
  });
  m.defines = { RIBBON: 1 };
  return trackMaterial(m);
}

export function makeTerrainMaterial(shared) {
  return trackMaterial(new THREE.ShaderMaterial({
    uniforms: {
      ...shared,
      ...MAT_UNIFORMS,
      uCamLocal: { value: new THREE.Vector3() },
      uMorph: { value: new THREE.Vector2(1e9, 2e9) },
      uOriginMod: { value: new THREE.Vector3() },
      uNearOff: { value: new THREE.Vector3() },
      uNearMode: { value: 0 },
      uNearBand: { value: new THREE.Vector2(0, 0) },
      // (this chunk's biggest fall, planetTerrain.js: its lip's radius (0 none), its foot (chunk-local), its width)
      uOriginRel: { value: new THREE.Vector3() },
      uFallTop: { value: 0 },
      uFallFoot: { value: new THREE.Vector3() },
      uFallW: { value: 0 },
    },
    vertexShader: VERT,
    fragmentShader: FRAG,
  }));
}
