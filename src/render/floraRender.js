// Instanced flora and rocks for one planet.

import * as THREE from 'three';
import { Rng } from '../core/rng.js';
import { floraSpecies, FLORA_KINDS } from '../gen/flora.js';
import { GLSL_SURFACE_ATMO, GLSL_CLOUD_N, GLSL_CLOUD_SHADOW } from './atmosphere.js';
import { GLSL_TERRAIN_SHADOW } from './terrainShadow.js';
import { GLSL_SUN_SHADOW, SHADOW_LAYER } from './sunShadows.js';

// ---------------------------------------------------------------- geometry

function finalize(parts) {
  // parts: [{geo, part, ao(y)}] -> merged non-indexed geometry with part/ao attributes
  const pos = [], nrm = [], partA = [], aoA = [];
  for (const { geo, part, aoBase = 0.6 } of parts) {
    const g = geo.index ? geo.toNonIndexed() : geo;
    g.computeVertexNormals();
    const p = g.attributes.position.array, n = g.attributes.normal.array;
    let maxY = 0;
    for (let i = 1; i < p.length; i += 3) maxY = Math.max(maxY, p[i]);
    for (let i = 0; i < p.length; i += 3) {
      pos.push(p[i], p[i + 1], p[i + 2]);
      nrm.push(n[i], n[i + 1], n[i + 2]);
      partA.push(part);
      aoA.push(Math.min(1, aoBase + (1 - aoBase) * Math.max(0, p[i + 1]) / Math.max(maxY, 1e-3)));
    }
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  out.setAttribute('part', new THREE.Float32BufferAttribute(partA, 1));
  out.setAttribute('ao', new THREE.Float32BufferAttribute(aoA, 1));
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

function treeGeometry(sp, rng) {
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
  parts.push({ geo: crown, part: 1, aoBase: 0.5 });
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
uniform float uTime;
uniform float uWind;
uniform float uFadeStart;
uniform float uFadeEnd;
varying vec3 vWorld;
varying vec3 vNormal;
varying float vPart;
varying float vAo;
varying vec3 vTint;
varying float vDist;
#include <common>
#include <logdepthbuf_pars_vertex>
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
  float bend = (part > 0.5 && part < 1.5) ? 1.0 : 0.25;
  p.x += sin(uTime * 1.4 + phase) * uWind * p.y * p.y * 0.012 * bend;
  p.z += cos(uTime * 1.1 + phase * 1.3) * uWind * p.y * p.y * 0.008 * bend;
  vec4 wp = modelMatrix * im * vec4(p, 1.0);
  vWorld = wp.xyz;
  vNormal = normalize(mat3(modelMatrix) * mat3(im) * normal);
  vPart = part;
  vAo = ao;
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
varying vec3 vWorld;
varying vec3 vNormal;
varying float vPart;
varying float vAo;
varying vec3 vTint;
varying float vDist;
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
  vec3 sunT = atmoSunTransmittance(r, muS) * cloudShadow(rel, r, muS, foot) * terrainShadow(pF, normalize(pF), uToFixed * uSunDir, uRadius) * sunShadowMap(vWorld, N);
  vec3 skyE = atmoSkyIrradiance(r, muS);
  vec3 albedo = vPart < 0.5 ? uTrunk : vTint;
  float ndl = max(dot(N, uSunDir), 0.0);
  float trans = vPart > 0.5 && vPart < 1.5 ? max(0.0, -dot(N, uSunDir)) * 0.35 : 0.0;
  vec3 c = albedo / PI * (uSunE * sunT * (ndl + trans) * vAo + (uSunE * skyE * (0.55 + 0.45 * dot(N, up)) + uAmbientFloor) * vAo);
  gl_FragColor = vec4(c, 1.0);
}
`;

export class FloraSet {
  constructor(body, shared) {
    const t = body.data.terrain;
    this.species = floraSpecies(t);
    const sp = this.species;
    const rng = new Rng(t.seed).fork('floraGeo');
    const pal = t.palette;
    this.geos = {
      tree: treeGeometry(sp, rng.fork('tree')),
      shrub: shrubGeometry(sp, rng.fork('shrub')),
      plant: plantGeometry(sp, rng.fork('plant')),
      rock: rockGeometry(rng.fork('rock'), sp.crystals),
      boulder: rockGeometry(rng.fork('boulder'), false),
    };
    this.treeFar = treeFarGeometry(sp);
    this.kindDist = { tree: 1500, shrub: 380, plant: 130, rock: 320, boulder: 1300 };
    this.clearings = []; // {pos: Vector3 body-fixed on the datum sphere, r}
    this.R = body.R;
    const trunk = pal.soil ? pal.soil.map((x) => x * 0.6) : [0.1, 0.08, 0.06];
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        ...shared,
        uWind: { value: body.atm ? Math.min(1.5, 0.3 + body.atm.pressure * 0.5) : 0 },
        uTrunk: { value: new THREE.Vector3(...trunk) },
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
      m.uniforms.uFadeEnd.value = this.kindDist[k] * 0.98;
      m.uniforms.uFadeStart.value = this.kindDist[k] * 0.7;
      this.materials[k] = m;
    }
    this.colors = {
      veg: pal.veg || [0.1, 0.1, 0.1], vegDry: pal.vegDry || [0.2, 0.18, 0.12],
      rock: pal.rock, rock2: pal.rock2,
    };
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
      mesh.layers.enable(SHADOW_LAYER);
      mesh.frustumCulled = false;
      mesh.userData.kind = kind;
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
      total += n;
    }
    group.userData.count = total;
    return group;
  }

  // per-frame: hide kinds beyond their draw distance, swap distant trees to the impostor
  updateNode(group, dist) {
    for (const m of group.children) {
      const kind = m.userData.kind;
      if (!(kind in this.kindDist)) continue;   // (another's: the ground's rocks fade themselves)
      m.visible = dist < this.kindDist[kind];
      if (kind === 'tree') m.geometry = dist < 450 ? this.geos.tree : this.treeFar;
    }
  }

  dispose() {
    for (const k in this.geos) this.geos[k].dispose();
    this.treeFar.dispose();
    this.material.dispose();
    for (const k in this.materials) this.materials[k].dispose();
  }
}
