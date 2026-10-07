// Instanced flora and rocks for one planet.

import * as THREE from 'three';
import { Rng } from '../core/rng.js';
import { floraSpecies, FLORA_KINDS } from '../gen/flora.js';
import { GLSL_SURFACE_ATMO, GLSL_CLOUD_N, GLSL_CLOUD_SHADOW } from './atmosphere.js';
import { GLSL_TERRAIN_SHADOW } from './terrainShadow.js';
import { GLSL_MOON } from './moonlight.js';
import { GLSL_SEASON } from './season.js';
import { GLSL_SUN_SHADOW, GLSL_SKY_SHADOW, SHADOW_LAYER, SKY_LAYER, SHADOW_LIGHT_UNIFORMS } from './sunShadows.js';
import { growTree } from '../gen/life/tree.js';
import { treeGeometry as grownMesh } from './treeMesh.js';
import { ezTreeGeometry, barkTexture, leafTexture } from './ezTrees.js';

// ---------------------------------------------------------------- geometry

function finalize(parts, keepNormals = false) {
  // parts: [{geo, part, ao(y)}] -> merged non-indexed geometry with part/ao attributes (and tuv: a
  // textured part's uv, 0 for the rest)
  const pos = [], nrm = [], partA = [], aoA = [], uvA = [];
  for (const { geo, part, aoBase = 0.6 } of parts) {
    const g = geo.index ? geo.toNonIndexed() : geo;
    if (!keepNormals || !g.attributes.normal) g.computeVertexNormals();
    const p = g.attributes.position.array, n = g.attributes.normal.array, uv = g.attributes.uv ? g.attributes.uv.array : null;
    let maxY = 0;
    for (let i = 1; i < p.length; i += 3) maxY = Math.max(maxY, p[i]);
    for (let i = 0, v = 0; i < p.length; i += 3, v++) {
      pos.push(p[i], p[i + 1], p[i + 2]);
      nrm.push(n[i], n[i + 1], n[i + 2]);
      partA.push(part);
      aoA.push(Math.min(1, aoBase + (1 - aoBase) * Math.max(0, p[i + 1]) / Math.max(maxY, 1e-3)));
      uvA.push(uv ? uv[v * 2] : 0, uv ? uv[v * 2 + 1] : 0);
    }
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  out.setAttribute('part', new THREE.Float32BufferAttribute(partA, 1));
  out.setAttribute('ao', new THREE.Float32BufferAttribute(aoA, 1));
  out.setAttribute('tuv', new THREE.Float32BufferAttribute(uvA, 2));
  out.computeBoundingSphere();
  return out;
}

function noisy(geo, rng, amount) {
  const p = geo.attributes.position;
  const seen = new Map();
  for (let i = 0; i < p.count; i++) {
    const key = `${p.getX(i).toFixed(3)},${p.getY(i).toFixed(3)},${p.getZ(i).toFixed(3)}`;
    let k = seen.get(key);
    if (k === undefined) { k = 1 + (rng.next() - 0.5) * amount; seen.set(key, k); }
    p.setXYZ(i, p.getX(i) * k, p.getY(i) * k, p.getZ(i) * k);
  }
  return geo;
}

// a grown tree (gen/life/tree.js: its limbs by branching, its leaves in clusters) for the forms its
// history gives (a seed tree's, a flowering tree's, a tree fern's), its trunk as wide as the solid field
// takes it (sim/floraField.js TRUNK); the flora shader's parts: bark 0, foliage 1
const GROWN = { conifer: 0.035, broadleaf: 0.045, fern: 0.04 };
// (a tree's forms by its distance (m): FloraSet.treeNode)
const TREE_FULL = 90, TREE_MID = 300, TREE_ONE = 450, TREE_SORT_STEP = 8;
function grownTreeGeometry(sp) {
  const H = sp.treeHeight, form = sp.tree;
  const ts = { form, H, trunkR: GROWN[form] * H, key: `flora|${sp.seed}|${form}`, levels: form === 'fern' ? 1 : form === 'conifer' ? 2 : 3,
    spread: form === 'broadleaf' ? 0.6 : form === 'conifer' ? 0.32 : 0.2, leafSize: form === 'fern' ? H * 0.35 : form === 'conifer' ? H * 0.06 : H * 0.1, bark: [1, 1, 1], leaf: [1, 1, 1] };
  const t = growTree(ts, 0);
  // (held to the height the instances are scaled from)
  const k = H / Math.max(t.H, 1e-3);
  for (const sg of t.segs) { sg.a = sg.a.map((x) => x * k); sg.b = sg.b.map((x) => x * k); }
  for (const L of t.leaves) L.p = L.p.map((x) => x * k);
  const { bark, leaves } = grownMesh(t, ts, 1, true);
  return finalize([{ geo: bark, part: 0 }, { geo: leaves, part: 1, aoBase: 0.5 }]);
}

function treeGeometry(sp, rng, g) {
  // (EZ-Tree's for the forms it grows, textured; the grown placeholder for a tree fern, or if it fails)
  if (sp.tree === 'conifer' || sp.tree === 'broadleaf') {
    try {
      const ez = ezTreeGeometry(sp, g);
      if (ez) { const geo = finalize([{ geo: ez.bark, part: 0 }, { geo: ez.leaves, part: 1, aoBase: 0.55 }], true); geo.userData.ez = ez; return geo; }
    } catch (err) { console.warn('ez-tree:', err); }
  }
  if (GROWN[sp.tree]) return grownTreeGeometry(sp);
  const H = sp.treeHeight;
  const parts = [];
  const trunk = (h, r0, r1) => { const g = new THREE.CylinderGeometry(r1, r0, h, 7, 2, true); g.translate(0, h / 2, 0); return g; };
  switch (sp.tree) {
    case 'conifer': {
      parts.push({ geo: trunk(H * 0.35, H * 0.035, H * 0.02), part: 0 });
      for (let i = 0; i < 4; i++) {
        const c = new THREE.ConeGeometry(H * (0.24 - i * 0.045), H * 0.36, 9, 1);
        c.translate(0, H * (0.32 + i * 0.17), 0);
        parts.push({ geo: noisy(c, rng, 0.12), part: 1, aoBase: 0.45 });
      }
      break;
    }
    case 'broadleaf': {
      parts.push({ geo: trunk(H * 0.55, H * 0.045, H * 0.028), part: 0 });
      for (let i = 0; i < 4; i++) {
        const s = new THREE.IcosahedronGeometry(H * rng.range(0.16, 0.24), 1);
        s.translate(rng.range(-0.14, 0.14) * H, H * rng.range(0.55, 0.8), rng.range(-0.14, 0.14) * H);
        parts.push({ geo: noisy(s, rng, 0.25), part: 1, aoBase: 0.5 });
      }
      break;
    }
    case 'bulb': {
      const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(H * 0.08, H * 0.4, 0), new THREE.Vector3(-H * 0.04, H * 0.75, H * 0.05)]);
      parts.push({ geo: new THREE.TubeGeometry(curve, 8, H * 0.03, 6, false), part: 0 });
      const cap = new THREE.SphereGeometry(H * 0.2, 10, 8);
      cap.scale(1, 0.75, 1);
      cap.translate(-H * 0.04, H * 0.82, H * 0.05);
      parts.push({ geo: noisy(cap, rng, 0.1), part: 1, aoBase: 0.55 });
      break;
    }
    case 'fern': {
      parts.push({ geo: trunk(H * 0.7, H * 0.04, H * 0.03), part: 0 });
      for (let i = 0; i < 9; i++) {
        const f = new THREE.PlaneGeometry(H * 0.09, H * 0.42, 1, 3);
        f.translate(0, H * 0.21, 0);
        const pa = f.attributes.position;
        for (let k = 0; k < pa.count; k++) { const y = pa.getY(k); pa.setZ(k, -y * y / (H * 0.6)); }
        f.rotateX(-0.9); f.rotateY(i / 9 * Math.PI * 2);
        f.translate(0, H * 0.7, 0);
        parts.push({ geo: f, part: 1, aoBase: 0.6 });
      }
      break;
    }
    case 'mushroom': {
      parts.push({ geo: trunk(H * 0.6, H * 0.07, H * 0.05), part: 0 });
      const cap = new THREE.SphereGeometry(H * 0.32, 14, 6, 0, Math.PI * 2, 0, Math.PI * 0.45);
      cap.translate(0, H * 0.5, 0);
      parts.push({ geo: noisy(cap, rng, 0.06), part: 1, aoBase: 0.4 });
      break;
    }
    default: { // spire: stacked tapering segments
      for (let i = 0; i < 3; i++) {
        const c = new THREE.CylinderGeometry(H * (0.05 - i * 0.012), H * (0.08 - i * 0.015), H * 0.34, 6);
        c.translate(rng.range(-0.02, 0.02) * H, H * (0.17 + i * 0.3), 0);
        parts.push({ geo: c, part: i === 2 ? 1 : 0, aoBase: 0.5 });
      }
      const tip = new THREE.OctahedronGeometry(H * 0.08, 0);
      tip.translate(0, H * 0.98, 0);
      parts.push({ geo: tip, part: 1 });
    }
  }
  return finalize(parts);
}

// Distant-tree impostor: one tapered shape per form, ~14 triangles
function treeFarGeometry(sp) {
  const H = sp.treeHeight;
  const parts = [];
  const trunk = new THREE.CylinderGeometry(H * 0.03, H * 0.04, H * 0.5, 4, 1, true);
  trunk.translate(0, H * 0.25, 0);
  parts.push({ geo: trunk, part: 0 });
  let crown;
  if (sp.tree === 'conifer' || sp.tree === 'spire') { crown = new THREE.ConeGeometry(H * 0.22, H * 0.8, 5, 1); crown.translate(0, H * 0.58, 0); }
  else if (sp.tree === 'mushroom') { crown = new THREE.CylinderGeometry(H * 0.32, H * 0.3, H * 0.12, 6); crown.translate(0, H * 0.56, 0); }
  else { crown = new THREE.OctahedronGeometry(H * 0.26, 0); crown.translate(0, H * 0.72, 0); }
  // (its underside dark, as a crown's is in its own and its neighbours' shade)
  parts.push({ geo: crown, part: 1, aoBase: 0.1 });
  return finalize(parts);
}

function shrubGeometry(sp, rng) {
  const H = sp.shrubHeight;
  const parts = [];
  if (sp.shrub === 'blob') {
    for (let i = 0; i < 3; i++) {
      const s = new THREE.IcosahedronGeometry(H * rng.range(0.35, 0.55), 0);
      s.scale(1, 0.7, 1);
      s.translate(rng.range(-0.3, 0.3) * H, H * 0.3, rng.range(-0.3, 0.3) * H);
      parts.push({ geo: noisy(s, rng, 0.3), part: 1, aoBase: 0.35 });
    }
  } else {
    const n = sp.shrub === 'fan' ? 7 : 11;
    for (let i = 0; i < n; i++) {
      const f = new THREE.PlaneGeometry(H * (sp.shrub === 'fan' ? 0.35 : 0.12), H, 1, 2);
      f.translate(0, H / 2, 0);
      f.rotateX(-rng.range(0.15, 0.6)); f.rotateY(i / n * Math.PI * 2 + rng.range(0, 0.5));
      parts.push({ geo: f, part: 1, aoBase: 0.3 });
    }
  }
  return finalize(parts);
}

function plantGeometry(sp, rng) {
  const H = sp.plantHeight;
  const parts = [];
  const n = sp.plant === 'cups' ? 5 : 9;
  for (let i = 0; i < n; i++) {
    let g;
    if (sp.plant === 'cups') { g = new THREE.ConeGeometry(H * 0.18, H * 0.5, 6, 1, true); g.rotateX(Math.PI); g.translate(0, H * rng.range(0.4, 0.9), 0); }
    else { g = new THREE.PlaneGeometry(H * (sp.plant === 'stalks' ? 0.05 : 0.09), H * rng.range(0.6, 1.1), 1, 1); g.translate(0, H * 0.45, 0); g.rotateX(-rng.range(0.05, 0.5)); }
    g.rotateY(rng.range(0, Math.PI * 2));
    g.translate(rng.range(-0.25, 0.25) * H, 0, rng.range(-0.25, 0.25) * H);
    parts.push({ geo: g, part: 1, aoBase: 0.35 });
  }
  return finalize(parts);
}

function rockGeometry(rng, crystals) {
  if (crystals) {
    const parts = [];
    for (let i = 0; i < 5; i++) {
      const c = new THREE.CylinderGeometry(0, rng.range(0.12, 0.25), rng.range(0.8, 1.8), 6);
      c.translate(0, 0.5, 0);
      c.rotateZ(rng.range(-0.5, 0.5)); c.rotateX(rng.range(-0.5, 0.5));
      parts.push({ geo: c, part: 2, aoBase: 0.5 });
    }
    return finalize(parts);
  }
  const g = new THREE.IcosahedronGeometry(1, 1);
  noisy(g, rng, 0.55);
  g.scale(1, rng.range(0.45, 0.8), rng.range(0.7, 1.1));
  return finalize([{ geo: g, part: 2, aoBase: 0.55 }]);
}

// ---------------------------------------------------------------- material

const VERT = /* glsl */`
attribute float part;
attribute float ao;
attribute vec2 tuv;
// (the year's mean temperature where it stands, C: the scatter's (gen/flora.js), as the rocks' rC)
attribute float fTa;
varying vec2 vUv;
uniform float uTime;
uniform vec3 uCenter;
uniform mat3 uToFixed;
uniform float uTopY;   // (its top, in its geometry's units: a crown's height within it)
// (the wind: its way (world) times its speed over 10 m/s squared, its gust now: sim/wind.js)
uniform vec4 uWindV;
uniform float uFadeStart;
uniform float uFadeEnd;
varying vec3 vWorld;
varying vec3 vNormal;
varying float vPart;
varying float vAo;
varying vec3 vTint;
varying float vDist;
varying vec3 vSnow;   // x: the snow on its boughs now (0..1), y: the snow's depth on the ground (m), z: its height above its foot (m)
varying vec3 vLocal;
varying float vTop;   // (how far up it, 0..1)
#include <common>
#include <logdepthbuf_pars_vertex>
${GLSL_SEASON}
void main() {
  vec3 p = position;
  mat4 im = mat4(1.0);
  #ifdef USE_INSTANCING
  im = instanceMatrix;
  #endif
  // (shrunk into the ground over its last stretch of range: a screen-door fade left a scatter of
  // dark pixels, and a plant a pixel across reads as a speck, not as the ground's colour)
  p *= 1.0 - smoothstep(uFadeStart, uFadeEnd, length((modelMatrix * im * vec4(0.0, 0.0, 0.0, 1.0)).xyz));
  float phase = im[3].x * 0.37 + im[3].z * 0.23;
  vec4 wp = modelMatrix * im * vec4(p, 1.0);
  // (the wind: a lean along it as strong as its drag (its speed squared), a sway about that with its
  // gusts, the top most (a cantilever's bend, as the height squared): ~0.4 m at an 18 m top in a
  // 10 m/s wind, a few cm in a light air; the leaves fluttering)
  bool leaf = part > 0.5 && part < 1.5;
  float sway = 0.0012 + 0.0007 * sin(uTime * 1.3 + phase) * (0.4 + uWindV.w) + 0.0003 * sin(uTime * 3.1 + phase * 2.1);
  wp.xyz += uWindV.xyz * (p.y * p.y * sway * (leaf ? 1.0 : 0.8));
  if (leaf) wp.xyz += vec3(sin(uTime * 7.0 + p.x * 3.1 + phase), 0.5 * sin(uTime * 5.3 + p.y * 2.3), cos(uTime * 6.3 + p.z * 2.7)) * 0.03 * sqrt(length(uWindV.xyz));
  vNormal = normalize(mat3(modelMatrix) * mat3(im) * normal);
  // (the seasons' snow where it stands (season.js, the ground's snowpack, the same sums): on its boughs
  // while the month is freezing (a thaw, or a warm spell's sun, unloads them within a day or two); banked
  // round its foot as deep as it lies there)
  vSnow = vec3(0.0, 0.0, p.y * length(im[1].xyz));
  vTop = p.y / max(uTopY, 1e-3);
  vLocal = p + im[3].xyz * 0.0137;
  if (uSeason.z > 0.5) {
    vec3 dirF = normalize(uToFixed * ((modelMatrix * im * vec4(0.0, 0.0, 0.0, 1.0)).xyz - uCenter));
    float swe = min(seasonSWE(dirF, fTa), 3000.0);
    vec3 yr = seasonYear(dirF);
    float Tn = fTa + yr.x * cos(uSeason.x) + yr.y * sin(uSeason.x);
    vSnow.x = (1.0 - exp(-swe / 12.0)) * (1.0 - smoothstep(-3.0, 1.5, Tn));
    vSnow.y = swe * SNOW_DEPTH_PER_MM;
    // (on a bough it lies as a ridge a few cm deep along its top, wider than a twig and overhanging it:
    // seen from below or the side, a white line along it, not only from above)
    if (part < 0.5 && vSnow.x > 0.0) {
      vec3 upW = normalize(mat3(modelMatrix) * im[1].xyz);
      float ny = dot(vNormal, upW);
      wp.xyz += vSnow.x * 0.05 * smoothstep(-0.15, 0.35, ny) * (upW + 0.6 * (vNormal - upW * ny));
    }
  }
  vWorld = wp.xyz;
  vPart = part;
  vAo = ao;
  vUv = tuv;
  vTint = vec3(1.0);
  #ifdef USE_INSTANCING_COLOR
  vTint = instanceColor;
  #endif
  vDist = length(wp.xyz);
  gl_Position = projectionMatrix * viewMatrix * wp;
  #include <logdepthbuf_vertex>
}
`;

const FRAG = /* glsl */`
uniform vec3 uSunDir;
uniform vec3 uSunE;
uniform vec3 uCenter;
uniform vec3 uTrunk;
uniform vec3 uAmbientFloor;
uniform float uFadeStart;
uniform float uFadeEnd;
uniform sampler2D tBark;
uniform sampler2D tLeaf;
uniform float uTex;
varying vec2 vUv;
varying vec3 vWorld;
varying vec3 vNormal;
varying float vPart;
varying float vAo;
varying vec3 vTint;
varying float vDist;
varying vec3 vSnow;
varying vec3 vLocal;
varying float vTop;
uniform vec3 uSnowCol;
#include <common>
#include <logdepthbuf_pars_fragment>
${GLSL_SURFACE_ATMO}
uniform float uRadius;
uniform mat3 uToFixed;
uniform vec4 uCloud;
uniform float uCloudOn;
uniform float uCloudOpacity;
uniform sampler3D tNoise;
uniform sampler2D tCloudMap;
uniform float uCloudMapMean;
${GLSL_CLOUD_N}
${GLSL_CLOUD_SHADOW}
${GLSL_TERRAIN_SHADOW}
${GLSL_SUN_SHADOW}
${GLSL_SKY_SHADOW}
${GLSL_MOON}
void main() {
  #include <logdepthbuf_fragment>
  // (in the clouds' shadow as the ground under it is)
  float foot = length(fwidth(vWorld));
  vec3 N = normalize(vNormal);
  if (!gl_FrontFacing) N = -N;
  vec3 rel = vWorld - uCenter;
  float r = length(rel);
  vec3 up = rel / r;
  float muS = dot(up, uSunDir);
  vec3 pF = uToFixed * rel;
  vec3 sunA = atmoSunTransmittance(r, muS), skyE = atmoSkyIrradiance(r, muS);
  float keySh = sunShadowMap(vWorld, N), skyBl = skyBlocked(vWorld), skyK = 1.0 - skyBl;
  vec3 sunTop = sunA * cloudLight(rel, r, muS, foot, sunA, skyE) * terrainShadow(pF, normalize(pF), uToFixed * uSunDir, uRadius);
  vec3 sunT = sunTop * keySh;
  vec3 albedo = vPart < 0.5 ? uTrunk : vTint;
  // (EZ-Tree's: its bark's texture over the trunk's colour; its leaf sprite cut out by its alpha, its
  // brightness over the world's foliage colour: the leaves the world's own hue whatever the sprite's)
  if (uTex > 0.5) {
    if (vPart < 0.5) albedo = uTrunk * 2.4 * texture2D(tBark, vUv).rgb;
    else if (vPart < 1.5) {
      // (its alpha raised as the sprite shrinks with distance, its mips averaging the gaps: a far crown
      // stays whole, not a scatter of single bright pixels of sky sparkling through it)
      vec4 lt = texture2D(tLeaf, vUv);
      vec2 tx = vUv * vec2(textureSize(tLeaf, 0)), ddx = dFdx(tx), ddy = dFdy(tx);
      float mip = max(0.0, 0.5 * log2(max(dot(ddx, ddx), dot(ddy, ddy))));
      if (lt.a * (1.0 + 0.3 * mip) < 0.5) discard;
      albedo = vTint * (0.35 + 1.5 * dot(lt.rgb, vec3(0.3, 0.59, 0.11)));
    }
  }
  // (the snow on it: what lies open to the sky holds what fell on it, in clumps; and banked round its foot)
  float snowK = 0.0;
  if (vSnow.x + vSnow.y > 0.0) {
    float clump = texture(tNoise, vLocal * 0.9).r;
    vec3 Ng = normalize(vNormal);
    if (vPart < 0.5) {
      // (a bough's ridge (raised over its top, the vertex shader), a leaning trunk's upper side, inside the
      // crown as well: the leaves above take some, not all; what reaches a bough stays on it)
      snowK = vSnow.x * smoothstep(0.12, 0.4, dot(Ng, up)) * smoothstep(0.1, 0.4, 0.3 + 0.7 * clump);
    } else {
      // (a crown's leaves: wherever the sky's open over them (skyBlocked: the boughs and crowns around and
      // above), its top most, but down its sides too where it stands at a wood's edge or alone, in clumps;
      // the upper face more, but from below or the side the snow over a leaf a pixel or two across shows
      // round it too)
      float face = 0.65 + 0.35 * dot(Ng, up);
      float open = (1.0 - 0.6 * skyBl) * (0.6 + 0.4 * smoothstep(0.2, 0.8, vTop));
      snowK = vSnow.x * smoothstep(0.22, 0.5, open * face * (0.55 + 0.9 * clump));
    }
    snowK = max(snowK, 1.0 - smoothstep(vSnow.y - 0.03, vSnow.y + 0.03, vSnow.z));
    albedo = mix(albedo, uSnowCol, snowK * (vPart > 0.5 && vPart < 1.5 ? 0.9 : 1.0));
  }
  float ndl = max(dot(N, uSunDir), 0.0);
  float trans = vPart > 0.5 && vPart < 1.5 ? max(0.0, -dot(N, uSunDir)) * 0.35 * (1.0 - snowK) : 0.0;
  float leaf = vPart > 0.5 && vPart < 1.5 ? 0.35 : 0.0;
  vec3 moon = moonLit(rel, r, up, N, keySh, leaf, 0.55 + 0.45 * dot(N, up), skyK);
  vec3 c = albedo / PI * (uSunE * sunT * (ndl + trans) * vAo + (uSunE * (skyE * (0.55 + 0.45 * dot(N, up)) * skyK + canopyLit(skyBl, sunTop, muS, skyE)) + uAmbientFloor + moon) * vAo);
  c += albedo / PI * handLit(vWorld, N) * vAo;
  gl_FragColor = vec4(c, 1.0);
}
`;

// its shadow (sunShadows.js): the plant as drawn (shrunk into the ground at the end of its range, in the
// wind), its distance from the light; EZ-Tree's leaves cut out by their sprite's alpha, so a crown's
// shadow is dappled, not a block
const SHADOW_VERT = /* glsl */`
attribute float part;
attribute vec2 tuv;
uniform vec3 uLightPos;
uniform vec3 uLightDir;
uniform float uTime;
// (the wind: its way (world) times its speed over 10 m/s squared, its gust now: sim/wind.js)
uniform vec4 uWindV;
uniform float uFadeStart;
uniform float uFadeEnd;
varying float vD;
varying vec2 vUv;
varying float vPart;
void main() {
  vec3 p = position;
  mat4 im = mat4(1.0);
  #ifdef USE_INSTANCING
  im = instanceMatrix;
  #endif
  p *= 1.0 - smoothstep(uFadeStart, uFadeEnd, length((modelMatrix * im * vec4(0.0, 0.0, 0.0, 1.0)).xyz));
  float phase = im[3].x * 0.37 + im[3].z * 0.23;
  vec4 wp = modelMatrix * im * vec4(p, 1.0);
  // (the wind: a lean along it as strong as its drag (its speed squared), a sway about that with its
  // gusts, the top most (a cantilever's bend, as the height squared): ~0.4 m at an 18 m top in a
  // 10 m/s wind, a few cm in a light air; the leaves fluttering)
  bool leaf = part > 0.5 && part < 1.5;
  float sway = 0.0012 + 0.0007 * sin(uTime * 1.3 + phase) * (0.4 + uWindV.w) + 0.0003 * sin(uTime * 3.1 + phase * 2.1);
  wp.xyz += uWindV.xyz * (p.y * p.y * sway * (leaf ? 1.0 : 0.8));
  if (leaf) wp.xyz += vec3(sin(uTime * 7.0 + p.x * 3.1 + phase), 0.5 * sin(uTime * 5.3 + p.y * 2.3), cos(uTime * 6.3 + p.z * 2.7)) * 0.03 * sqrt(length(uWindV.xyz));
  vD = dot(uLightPos - wp.xyz, uLightDir);
  vUv = tuv;
  vPart = part;
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;
const SHADOW_FRAG = /* glsl */`
uniform sampler2D tLeaf;
uniform float uTex;
varying float vD;
varying vec2 vUv;
varying float vPart;
void main() {
  if (uTex > 0.5 && vPart > 0.5 && vPart < 1.5) {
    vec2 tx = vUv * vec2(textureSize(tLeaf, 0)), ddx = dFdx(tx), ddy = dFdy(tx);
    float mip = max(0.0, 0.5 * log2(max(dot(ddx, ddx), dot(ddy, ddy))));
    if (texture2D(tLeaf, vUv).a * (1.0 + 0.3 * mip) < 0.5) discard;
  }
  gl_FragColor = vec4(vD, 0.0, 0.0, 1.0);
}`;
function shadowMaterial(m) {
  const u = m.uniforms;
  return new THREE.ShaderMaterial({
    uniforms: { ...SHADOW_LIGHT_UNIFORMS, uTime: u.uTime, uWindV: u.uWindV, uFadeStart: u.uFadeStart, uFadeEnd: u.uFadeEnd, tLeaf: u.tLeaf, uTex: u.uTex },
    vertexShader: SHADOW_VERT, fragmentShader: SHADOW_FRAG, side: THREE.DoubleSide,
  });
}

// seat a node's plants and rocks (an object holding instanced meshes, its position the node's origin)
// on the ground as drawn now (Universe.floorAt: the near field's volume where it's built, else the
// heightfield's): the scatter's ground was the generator's as it was then, and as finer tiles came in or
// the near field was built over it, trees and boulders were left in the air or under the ground. A plant
// on the floor itself; a rock as deep in it as it was scattered (a corestone's cap only showing), never
// standing off it
const _sp = new THREE.Vector3(), _sd = new THREE.Vector3();
export function seatInstances(obj, b) {
  const R = b.R;
  obj.updateMatrix();
  const o = obj.position;
  obj.traverse((m) => {
    if (!m.isInstancedMesh || !m.count || m.userData.view) return;   // (a node's trees' views: their owner's seated)
    const a = m.instanceMatrix.array, n = m.count, rock = m.userData.kind === 'stone';
    const mo = m === obj ? null : m.position;
    let lift = m.userData.lift;
    if (!lift) {
      lift = m.userData.lift = new Float32Array(n);
      if (rock) for (let i = 0; i < n; i++) {
        const k = i * 16;
        _sp.set(o.x + a[k + 12], o.y + a[k + 13], o.z + a[k + 14]);
        if (mo) _sp.add(mo);
        const r = _sp.length();
        lift[i] = Math.min(0, r - R - b.groundHeight(_sd.copy(_sp).divideScalar(r)));
      }
    }
    for (let i = 0; i < n; i++) {
      const k = i * 16;
      if (a[k] === 0 && a[k + 1] === 0 && a[k + 2] === 0) continue;   // (cleared: scaled to nothing)
      _sp.set(o.x + a[k + 12], o.y + a[k + 13], o.z + a[k + 14]);
      if (mo) _sp.add(mo);
      const r = _sp.length();
      _sd.copy(_sp).divideScalar(r);
      // (from 3 m above where it stands: ground risen a little under it found too)
      const h = b.floorAt(_sp.copy(_sd).multiplyScalar(r + 3), 3);
      _sp.copy(_sd).multiplyScalar(R + h + lift[i]).sub(o);
      if (mo) _sp.sub(mo);
      a[k + 12] = _sp.x; a[k + 13] = _sp.y; a[k + 14] = _sp.z;
    }
    m.instanceMatrix.needsUpdate = true;
    m.boundingSphere = null;
  });
}

// release a node's mesh's own geometries (FloraSet.wrap): the shared buffers taken off them first, so
// disposing them frees only their own
function unwrap(m) {
  const w = m.userData.wraps;
  if (!w) return;
  for (const g of w.values()) {
    for (const k of Object.keys(g.attributes)) if (k !== 'fTa') g.deleteAttribute(k);
    g.setIndex(null);
    g.dispose();
  }
  w.clear();
}

export class FloraSet {
  constructor(body, shared) {
    const t = body.data.terrain;
    this.species = floraSpecies(t);
    const sp = this.species;
    const rng = new Rng(t.seed).fork('floraGeo');
    const pal = t.palette;
    this.geos = {
      tree: treeGeometry(sp, rng.fork('tree'), body.data.gravity || 9.81),
      shrub: shrubGeometry(sp, rng.fork('shrub')),
      plant: plantGeometry(sp, rng.fork('plant')),
      rock: rockGeometry(rng.fork('rock'), sp.crystals),
      boulder: rockGeometry(rng.fork('boulder'), false),
    };
    this.treeFar = treeFarGeometry(sp);
    // (EZ-Tree's middle distance: the same tree, lighter)
    this.treeMid = null;
    if (this.geos.tree.userData.ez) { try { const ez = ezTreeGeometry(sp, body.data.gravity || 9.81, 1); if (ez) this.treeMid = finalize([{ geo: ez.bark, part: 0 }, { geo: ez.leaves, part: 1, aoBase: 0.55 }], true); } catch (err) { console.warn('ez-tree mid:', err); } }
    this.kindDist = { tree: 1500, shrub: 380, plant: 130, rock: 320, boulder: 1300 };
    this.clearings = []; // {pos: Vector3 body-fixed on the datum sphere, r}
    this.R = body.R;
    const trunk = pal.soil ? pal.soil.map((x) => x * 0.6) : [0.1, 0.08, 0.06];
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        ...shared,
        uWindV: { value: new THREE.Vector4() },
        uTrunk: { value: new THREE.Vector3(...trunk) },
        tBark: { value: null }, tLeaf: { value: null }, uTex: { value: 0 },
        uFadeStart: { value: 1100 },
        uFadeEnd: { value: 1500 },
      },
      vertexShader: VERT, fragmentShader: FRAG, side: THREE.DoubleSide,
    });
    // one material per kind: each fades out over the last quarter of its range
    this.materials = {};
    for (const k of FLORA_KINDS) {
      const m = this.material.clone();
      for (const key in this.material.uniforms) if (shared[key]) m.uniforms[key] = shared[key];
      m.uniforms.uWindV = this.material.uniforms.uWindV;   // (one wind for all: setWind)
      m.uniforms.uFadeEnd.value = this.kindDist[k] * 0.98;
      m.uniforms.uFadeStart.value = this.kindDist[k] * 0.7;
      const gk = this.geos[k];
      if (!gk.boundingBox) gk.computeBoundingBox();
      m.uniforms.uTopY = { value: gk.boundingBox.max.y };
      // (the trees EZ-Tree grew: their textures)
      const ez = k === 'tree' && this.geos.tree.userData.ez;
      m.uniforms.uTex = { value: ez ? 1 : 0 };
      m.uniforms.tBark = { value: ez ? barkTexture(ez.barkType) : null };
      m.uniforms.tLeaf = { value: ez ? leafTexture(ez.leafType) : null };
      this.materials[k] = m;
    }
    // (the far trees' impostor: untextured)
    this.materials.treeFar = this.materials.tree.clone();
    for (const key in this.materials.tree.uniforms) if (key !== 'uTex') this.materials.treeFar.uniforms[key] = this.materials.tree.uniforms[key];
    this.materials.treeFar.uniforms.uTex = { value: 0 };
    if (!this.treeFar.boundingBox) this.treeFar.computeBoundingBox();
    this.materials.treeFar.uniforms.uTopY = { value: this.treeFar.boundingBox.max.y };
    // (and their shadows')
    this.shadowMats = {};
    for (const k in this.materials) this.shadowMats[k] = shadowMaterial(this.materials[k]);
    // (in the coarse shadow maps every tree its far form: sunShadows.js)
    this.shadowFarTree = { geo: this.treeFar, mat: this.shadowMats.treeFar };
    this.colors = {
      veg: pal.veg || [0.1, 0.1, 0.1], vegDry: pal.vegDry || [0.2, 0.18, 0.12],
      rock: pal.rock, rock2: pal.rock2,
    };
  }

  // the wind where the camera is (sim/wind.js): dirW its way (world axes), speed (m/s), gust (0..1)
  setWind(dirW, speed, gust) {
    const k = (speed / 10) * (speed / 10);
    this.material.uniforms.uWindV.value.set(dirW.x * k, dirW.y * k, dirW.z * k, gust);
  }

  // Build instanced meshes for one node's scatter data
  build(data) {
    const group = new THREE.Group();
    group.position.set(data.origin[0], data.origin[1], data.origin[2]);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), qr = new THREE.Quaternion();
    const pos = new THREE.Vector3(), up = new THREE.Vector3(), sc = new THREE.Vector3();
    const Y = new THREE.Vector3(0, 1, 0);
    const col = new THREE.Color();
    const o = data.origin;
    let total = 0;
    const wp = new THREE.Vector3();
    for (const kind of FLORA_KINDS) {
      const arr = data[kind];
      const n = arr.length / 8;
      if (!n) continue;
      const mesh = new THREE.InstancedMesh(this.geos[kind], this.materials[kind], n);
      // (each plant's year's mean temperature: the seasons' snow on it)
      const ta = new Float32Array(n);
      for (let i = 0; i < n; i++) ta[i] = arr[i * 8 + 7];
      mesh.userData.fTa = new THREE.InstancedBufferAttribute(ta, 1);
      mesh.geometry = this.wrap(mesh, this.geos[kind]);
      mesh.addEventListener('dispose', () => unwrap(mesh));
      mesh.layers.enable(SHADOW_LAYER);
      // (trees and shrubs take the sky from what's under them)
      if (kind === 'tree' || kind === 'shrub') mesh.layers.enable(SKY_LAYER);
      // (culled by its instances' bounds, three.js's InstancedMesh's own, made on first use once they're
      // placed: each view, the shadow maps' too, draws only the nodes it can see)
      mesh.frustumCulled = true;
      mesh.userData.kind = kind;
      mesh.userData.shadowMat = this.shadowMats[kind];
      if (kind === 'tree') mesh.userData.shadowFar = this.shadowFarTree;
      for (let i = 0; i < n; i++) {
        const k = i * 8;
        pos.set(arr[k], arr[k + 1], arr[k + 2]);
        // keep landing sites clear (horizontal distance on the datum sphere)
        wp.set(o[0] + arr[k], o[1] + arr[k + 1], o[2] + arr[k + 2]).setLength(this.R);
        let cleared = false;
        for (const c of this.clearings) if (wp.distanceToSquared(c.pos) < c.r * c.r) { cleared = true; break; }
        if (cleared) { m4.makeScale(0, 0, 0); mesh.setMatrixAt(i, m4); continue; }
        up.set(o[0] + arr[k], o[1] + arr[k + 1], o[2] + arr[k + 2]).normalize();
        q.setFromUnitVectors(Y, up);
        qr.setFromAxisAngle(Y, arr[k + 4]);
        q.multiply(qr);
        const s = arr[k + 3];
        if (kind === 'rock' || kind === 'boulder') {
          // tilt and sink rocks a little
          qr.setFromAxisAngle(new THREE.Vector3(1, 0, 0), (arr[k + 5] - 0.5) * 0.6);
          q.multiply(qr);
          pos.addScaledVector(up, -0.25 * s);
          sc.set(s, s, s);
        } else sc.set(s, s * (0.85 + 0.3 * arr[k + 5]), s);
        m4.compose(pos, q, sc);
        mesh.setMatrixAt(i, m4);
        const tint = arr[k + 5];
        let c;
        if (kind === 'rock' || kind === 'boulder') c = this.colors.rock.map((x, j) => x + (this.colors.rock2[j] - x) * tint);
        else {
          const dry = kind === 'plant' ? 0.5 * tint : 0.35 * tint;
          c = this.colors.veg.map((x, j) => (x + (this.colors.vegDry[j] - x) * dry) * (0.75 + 0.5 * tint));
        }
        col.setRGB(c[0], c[1], c[2], THREE.LinearSRGBColorSpace);
        mesh.setColorAt(i, col);
      }
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      group.add(mesh);
      if (kind === 'tree') this.treeViews(mesh, group);
      total += n;
    }
    group.userData.count = total;
    return group;
  }

  // a node's mesh's own form of one of the shared geometries: the same buffers, and its instances' own
  // attribute (fTa) besides (unwrap: its own released, the shared kept)
  wrap(m, base) {
    const w = m.userData.wraps || (m.userData.wraps = new Map());
    let g = w.get(base);
    if (!g) {
      g = new THREE.BufferGeometry();
      for (const k in base.attributes) g.setAttribute(k, base.attributes[k]);
      if (base.index) g.setIndex(base.index);
      if (!base.boundingSphere) base.computeBoundingSphere();
      if (!base.boundingBox) base.computeBoundingBox();
      g.boundingSphere = base.boundingSphere; g.boundingBox = base.boundingBox;
      g.userData = base.userData;
      g.setAttribute('fTa', m.userData.fTa);
      w.set(base, g);
    }
    return g;
  }

  // per-frame: hide kinds beyond their draw distance, each tree in its form for its distance (dist: the
  // node's nearest; cam: the camera, body-fixed)
  updateNode(group, dist, cam) {
    for (const m of group.children) {
      const kind = m.userData.kind;
      if (!(kind in this.kindDist) || m.userData.view) continue;   // (another's: the ground's rocks fade themselves)
      if (m.userData.views) { this.treeNode(m, group, dist, cam); continue; }
      m.visible = dist < this.kindDist[kind];
    }
  }

  // (a node's trees each in the form for its own distance: EZ-Tree's full one to TREE_FULL, its lighter
  // one to TREE_MID, the impostor beyond (no lighter one: full to TREE_ONE). The node's own mesh holds
  // them, hidden (seated, cleared: its buffers), its instances kept in order of distance as the camera
  // moves, and three views of its buffers draw them, the nearest full, the next lighter, the rest the
  // impostor. Chosen by the node's distance alone, a node ~200 m across drew every tree in it full once
  // its edge was inside 90 m: four in five of the full trees drawn were past 90 m, out to 300, and the
  // lighter ones out to 450; the trees' vertices were a fifth of the GPU's frame in a wood)
  treeViews(owner, group) {
    const n = owner.count, ud = owner.userData;
    if (!owner.instanceColor) owner.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(n * 3).fill(1), 3);
    ud.iib = [new THREE.InstancedInterleavedBuffer(owner.instanceMatrix.array, 16, 1), new THREE.InstancedInterleavedBuffer(owner.instanceColor.array, 3, 1), new THREE.InstancedInterleavedBuffer(ud.fTa.array, 1, 1)];
    ud.views = [0, 1, 2].map(() => {
      const v = new THREE.InstancedMesh(this.geos.tree, this.materials.tree, 0);
      v.userData.view = true; v.userData.kind = 'tree';
      v.userData.shadowFar = this.shadowFarTree;
      v.layers.mask = owner.layers.mask;
      v.frustumCulled = true;
      v.visible = false;
      v.addEventListener('dispose', () => unwrap(v));
      group.add(v);
      return v;
    });
    ud.cuts = [0, 0];   // (where the forms change in its order: none placed yet, all the impostor)
    ud.sortAt = null;   // (the camera, the mesh's own frame, at its last sort)
    owner.visible = false;
  }

  treeNode(owner, group, dist, cam) {
    const ud = owner.userData, show = dist < this.kindDist.tree;
    if (owner.instanceMatrix.version !== ud.mv) { ud.mv = owner.instanceMatrix.version; ud.iib[0].needsUpdate = true; }   // (seated anew)
    if (!owner.boundingSphere) owner.computeBoundingSphere();
    let place = !ud.placed;
    if (show && dist >= (this.treeMid ? TREE_MID : TREE_ONE)) {
      if (ud.cuts[0] || ud.cuts[1]) { ud.cuts = [0, 0]; place = true; }
      ud.sortAt = null;
    } else if (show && cam) {
      const p = owner.position, o = group.position;
      const cx = cam.x - o.x - p.x, cy = cam.y - o.y - p.y, cz = cam.z - o.z - p.z, a = ud.sortAt;
      if (!a || (cx - a[0]) ** 2 + (cy - a[1]) ** 2 + (cz - a[2]) ** 2 > TREE_SORT_STEP ** 2) {
        this.sortTrees(owner, cx, cy, cz);
        ud.sortAt = [cx, cy, cz];
        place = true;
      }
    }
    if (place) { this.placeViews(owner); ud.placed = true; }
    for (const v of ud.views) { v.visible = show && v.count > 0; v.boundingSphere = owner.boundingSphere; }
  }

  // (its instances in order of distance from (cx, cy, cz), and where the forms change)
  sortTrees(owner, cx, cy, cz) {
    const n = owner.count, ud = owner.userData;
    const M = owner.instanceMatrix.array, C = owner.instanceColor.array, T = ud.fTa.array, L = ud.lift;
    const d = ud.sortD || (ud.sortD = new Float32Array(n)), ord = ud.sortO || (ud.sortO = new Uint32Array(n));
    for (let i = 0; i < n; i++) { const k = i * 16, x = M[k + 12] - cx, y = M[k + 13] - cy, z = M[k + 14] - cz; d[i] = x * x + y * y + z * z; ord[i] = i; }
    ord.sort((a, b) => d[a] - d[b]);
    const M0 = M.slice(0, n * 16), C0 = C.slice(0, n * 3), T0 = T.slice(0, n), L0 = L ? L.slice(0, n) : null;
    const f2 = (this.treeMid ? TREE_FULL : TREE_ONE) ** 2, m2 = (this.treeMid ? TREE_MID : TREE_ONE) ** 2;
    let full = 0, mid = 0;
    for (let j = 0; j < n; j++) {
      const i = ord[j];
      for (let q = 0; q < 16; q++) M[j * 16 + q] = M0[i * 16 + q];
      C[j * 3] = C0[i * 3]; C[j * 3 + 1] = C0[i * 3 + 1]; C[j * 3 + 2] = C0[i * 3 + 2];
      T[j] = T0[i];
      if (L) L[j] = L0[i];
      if (d[i] < f2) full = j + 1;
      if (d[i] < m2) mid = j + 1;
    }
    ud.cuts = [full, mid];
    for (const b of ud.iib) b.needsUpdate = true;
  }

  // (the views on its buffers, each from its cut: a new attribute for each, as three's binding of them
  // takes no note of an offset changed)
  placeViews(owner) {
    const ud = owner.userData, n = owner.count, [mI, cI, tI] = ud.iib;
    const from = [0, ud.cuts[0], ud.cuts[1]], to = [ud.cuts[0], ud.cuts[1], n];
    const bases = [this.geos.tree, this.treeMid || this.geos.tree, this.treeFar];
    ud.views.forEach((v, j) => {
      const s = from[j];
      v.count = to[j] - s;
      v.instanceMatrix = new THREE.InterleavedBufferAttribute(mI, 16, s * 16);
      v.instanceColor = new THREE.InterleavedBufferAttribute(cI, 3, s * 3);
      v.userData.fTa = new THREE.InterleavedBufferAttribute(tI, 1, s);
      const g = this.wrap(v, bases[j]);
      g.setAttribute('fTa', v.userData.fTa);
      v.geometry = g;
      v.material = j === 2 ? this.materials.treeFar : this.materials.tree;
      v.userData.shadowMat = j === 2 ? this.shadowMats.treeFar : this.shadowMats.tree;
    });
  }

  dispose() {
    for (const k in this.geos) this.geos[k].dispose();
    this.treeFar.dispose();
    if (this.treeMid) this.treeMid.dispose();
    this.material.dispose();
    for (const k in this.materials) this.materials[k].dispose();
    for (const k in this.shadowMats) this.shadowMats[k].dispose();
  }
}
