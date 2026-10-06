// The sea's floes near the camera as slabs (gen/floeslabs.js, built in the terrain workers): lit as the
// ground is (the air's light, the clouds', the hills' and the near sun's shadows, which they cast too),
// their tops the shading's own floes' white and blue-grey (the same snow by the floe's age and the same
// tiles: terrainMaterial.js's frozen sea), their sides ice under their snow. Built again as the camera
// moves on (~150 m) or the season does; nothing where the sea's open or the camera's high.
import * as THREE from 'three';
import { GLSL_SURFACE_ATMO, GLSL_CLOUD_N, GLSL_CLOUD_SHADOW } from './atmosphere.js';
import { GLSL_TERRAIN_SHADOW } from './terrainShadow.js';
import { GLSL_SUN_SHADOW, SHADOW_LAYER } from './sunShadows.js';

const REACH = 600, MOVE = 150, HIGH = 3000;

const VERT = /* glsl */`
attribute vec3 fpos;
attribute vec4 aux;   // the floe's age, its top's height, this point's height above the water, 1 a wall, 0.5 a sail
varying vec3 vWorld;
varying vec3 vN;
varying vec3 vFp;
varying vec4 vAux;
#include <common>
#include <logdepthbuf_pars_vertex>
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  vFp = fpos;
  vAux = aux;
  gl_Position = projectionMatrix * viewMatrix * wp;
  #include <logdepthbuf_vertex>
}
`;

// a ridge's blocks (instanced boxes): the same shading, its faces snow where they face up, ice where not
const BLOCK_VERT = /* glsl */`
varying vec3 vWorld;
varying vec3 vN;
varying vec3 vFp;
varying vec4 vAux;
uniform vec3 uOriginF;
uniform float uBlockKind;   // 2 a ridge's block, 3 an iceberg
#include <common>
#include <logdepthbuf_pars_vertex>
void main() {
  vec4 lp = instanceMatrix * vec4(position, 1.0);
  vec4 wp = modelMatrix * lp;
  vWorld = wp.xyz;
  // (its normal by the inverse of its stretch: a berg's sizes differ by its axes)
  mat3 im = mat3(instanceMatrix);
  vN = normalize(mat3(modelMatrix) * im * (normal / vec3(dot(im[0], im[0]), dot(im[1], im[1]), dot(im[2], im[2]))));
  vFp = uOriginF + lp.xyz;
  vAux = vec4(0.0, 0.0, 0.0, uBlockKind);
  gl_Position = projectionMatrix * viewMatrix * wp;
  #include <logdepthbuf_vertex>
}
`;

const FRAG = /* glsl */`
uniform vec3 uSunDir;
uniform vec3 uSunE;
uniform vec3 uCenter;
uniform float uRadius;
uniform mat3 uToFixed;
uniform vec4 uCloud;
uniform float uCloudOn;
uniform float uCloudOpacity;
uniform vec3 uAmbientFloor;
uniform sampler3D tNoise;
uniform sampler2D tCloudMap;
uniform float uCloudMapMean;
uniform sampler2D tDetail;
varying vec3 vWorld;
varying vec3 vN;
varying vec3 vFp;
varying vec4 vAux;
#include <common>
#include <logdepthbuf_pars_fragment>
${GLSL_SURFACE_ATMO}
${GLSL_CLOUD_N}
${GLSL_CLOUD_SHADOW}
${GLSL_TERRAIN_SHADOW}
${GLSL_SUN_SHADOW}
vec4 tri(vec3 p, vec3 w, float period) {
  return texture(tDetail, p.yz / period) * w.x + texture(tDetail, p.zx / period + 0.37) * w.y + texture(tDetail, p.xy / period + 0.71) * w.z;
}
void main() {
  #include <logdepthbuf_fragment>
  float foot = length(fwidth(vWorld));
  vec3 rel = vWorld - uCenter;
  float r = length(rel);
  vec3 up = rel / r, N = normalize(vN);
  float muS = dot(up, uSunDir);
  // (the floes' white and blue-grey as the frozen sea's shading has them: snow by the floe's age and the
  // 64 m tile, the 512 m tile's brightness)
  vec3 upF = normalize(vFp), w = pow(abs(upF), vec3(4.0));
  w /= w.x + w.y + w.z;
  vec4 dI = tri(vFp, w, 512.0), dJ = tri(vFp, w, 64.0);
  float snowy = smoothstep(0.3, 0.7, vAux.x + (dJ.a - 0.5) * 0.25);
  vec3 alb = mix(vec3(0.42, 0.52, 0.6), vec3(0.82, 0.86, 0.9), snowy) * (0.9 + 0.2 * dI.r);
  // (a side: the floe's ice, blue where it's wet by the water, under its top's snow; a ridge's sail:
  // broken blocks, blue ice and snow in their gaps, as liquid.js's frozen sea draws them further off)
  bool berg = vAux.w > 2.5, block = vAux.w > 1.5, wall = vAux.w > 0.75 && !block, sail = vAux.w > 0.25 && vAux.w < 0.75;
  if (wall) alb = mix(vec3(0.3, 0.46, 0.58), alb, smoothstep(0.35, 0.65, vAux.z / max(vAux.y, 0.01)));
  if (sail) alb = mix(vec3(0.5, 0.62, 0.7), vec3(0.85, 0.88, 0.92), smoothstep(0.35, 0.6, tri(vFp, w, 2.0).r));
  // (a block: snow on what faces up, its ice's blue-green on its broken faces)
  if (block) alb = mix(vec3(0.32, 0.52, 0.6) * (0.85 + 0.3 * tri(vFp, w, 1.0).r), vec3(0.86, 0.89, 0.93), smoothstep(0.45, 0.75, dot(normalize(vN), up)));
  // (an iceberg: a glacier's ice, white and blue with the air in it, under its snow; bluer low down where the
  // sea has washed it clear)
  if (berg) alb = mix(vec3(0.55, 0.72, 0.84) * (0.9 + 0.2 * tri(vFp, w, 8.0).r), vec3(0.88, 0.91, 0.95), smoothstep(0.35, 0.75, dot(normalize(vN), up))) * mix(0.8, 1.0, smoothstep(0.0, 3.0, r - uRadius));
  vec3 pF = uToFixed * rel;
  vec3 sunA = atmoSunTransmittance(r, muS), skyE = atmoSkyIrradiance(r, muS);
  // (a top's own shadow read 15 cm over it: in a low sun its flat face shadowed itself in stripes; a
  // sail's, half a metre and up, still falls on it)
  vec3 sunT = sunA * cloudLight(rel, r, muS, foot, sunA, skyE) * terrainShadow(pF, normalize(pF), uToFixed * uSunDir, uRadius) * sunShadowMap(vWorld + (wall || sail || block ? vec3(0.0) : up * 0.15), N);
  vec3 N2 = normalize(mix(up, N, wall || sail || block ? 1.0 : 0.5));
  vec3 color = alb / PI * (uSunE * sunT * max(dot(N2, uSunDir), 0.0) + (uSunE * skyE * (0.5 + 0.5 * dot(N2, up)) + uAmbientFloor));
  vec3 V = normalize(-vWorld), H = normalize(V + uSunDir);
  color += uSunE * sunT * pow(max(dot(N2, H), 0.0), mix(400.0, 40.0, snowy)) * 0.04 * step(0.0, muS);
  gl_FragColor = vec4(color, 1.0);
}
`;

// the instanced ice's material (a ridge's blocks: kind 2; icebergs: 3, render/bergRender.js)
export function makeIceMaterial(shared, kind) {
  return new THREE.ShaderMaterial({ uniforms: { ...shared, uOriginF: { value: new THREE.Vector3() }, uBlockKind: { value: kind } }, vertexShader: BLOCK_VERT, fragmentShader: FRAG });
}

// (for tools/glslcheck.mjs)
export const FLOE_SHADERS = { vertexShader: VERT, fragmentShader: FRAG };
export const BLOCK_SHADERS = { vertexShader: BLOCK_VERT, fragmentShader: FRAG };

export class FloeSet {
  constructor(body, pool, shared, group) {
    this.body = body; this.pool = pool; this.group = group;
    this.material = new THREE.ShaderMaterial({ uniforms: { ...shared }, vertexShader: VERT, fragmentShader: FRAG, side: THREE.DoubleSide });
    this.blockMat = makeIceMaterial(shared, 2);
    this.box = new THREE.BoxGeometry(1, 1, 1);
    this.mesh = null; this.blocks = null; this.job = null; this.at = null; this.L = 0;
  }
  // camF: the camera, body-fixed
  update(camF) {
    const b = this.body, R = b.R, alt = camF.length() - R;
    if (this.mesh) this.mesh.visible = alt < HIGH;
    if (this.blocks) this.blocks.visible = alt < HIGH;
    if (alt > HIGH || this.job) return;
    const dir = camF.clone().normalize(), L = b.solarLongitude ? b.solarLongitude() : 0;
    if (this.at && this.at.angleTo(dir) * R < MOVE && Math.abs(L - this.L) < 0.01) return;
    const sunF = this._s || (this._s = new THREE.Vector3());
    sunF.copy(b.pos).negate().normalize().applyQuaternion(b.qInv);
    this.at = dir; this.L = L;
    this.job = this.pool.submit({ type: 'floes', body: b.id, dir: [dir.x, dir.y, dir.z], sinSun: sunF.y, L, reach: REACH }, 2);
    this.job.promise.then((r) => { this.job = null; this.show(r); }, () => { this.job = null; });
  }
  show(r) {
    if (this.mesh) { this.group.remove(this.mesh); this.mesh.geometry.dispose(); this.mesh = null; }
    if (this.blocks) { this.group.remove(this.blocks); this.blocks.dispose(); this.blocks = null; }
    if (!r || !r.pos) return;
    // (a ridge's blocks: one box each, placed, turned and sized)
    const nb = r.blocks ? r.blocks.length / 10 : 0;
    if (nb) {
      const im = new THREE.InstancedMesh(this.box, this.blockMat, nb), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), sc = new THREE.Vector3();
      for (let i = 0; i < nb; i++) {
        const b = r.blocks, k = 10 * i;
        m4.compose(v.set(b[k], b[k + 1], b[k + 2]), q.set(b[k + 3], b[k + 4], b[k + 5], b[k + 6]), sc.set(b[k + 7], b[k + 8], b[k + 9]));
        im.setMatrixAt(i, m4);
      }
      im.instanceMatrix.needsUpdate = true;
      im.position.set(r.origin[0], r.origin[1], r.origin[2]);
      im.frustumCulled = false;
      im.layers.enable(SHADOW_LAYER);
      this.blockMat.uniforms.uOriginF.value.set(r.origin[0], r.origin[1], r.origin[2]);
      this.group.add(im);
      this.blocks = im;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(r.pos, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(r.nrm, 3));
    g.setAttribute('fpos', new THREE.BufferAttribute(r.fp, 3));
    g.setAttribute('aux', new THREE.BufferAttribute(r.aux, 4));
    g.setIndex(new THREE.BufferAttribute(r.idx, 1));
    const m = new THREE.Mesh(g, this.material);
    m.position.set(r.origin[0], r.origin[1], r.origin[2]);
    m.frustumCulled = false;
    m.layers.enable(SHADOW_LAYER);
    m.userData.kind = 'ice';
    this.group.add(m);
    this.mesh = m;
  }
  dispose() {
    if (this.job) this.pool.cancel(this.job);
    if (this.mesh) { this.group.remove(this.mesh); this.mesh.geometry.dispose(); }
    if (this.blocks) { this.group.remove(this.blocks); this.blocks.dispose(); }
    this.material.dispose(); this.blockMat.dispose(); this.box.dispose();
  }
}
