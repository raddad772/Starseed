// Sun shadows near the camera, finer than the height cube's (terrainShadow.js: ~300 m texels): two
// cascades of shadow maps around the camera, 0..120 m and 120 m..1.2 km, 2048 a side (~12 cm, ~1.2 m a
// texel). Each holds the distance along the sun to the nearest caster (a float, not a depth buffer:
// the same whatever the main view's depth (reversed-Z or logarithmic)); the casters are what's on
// layer SHADOW_LAYER (terrain, the near volume, plants). ?sunshadow=0 turns them off.
import * as THREE from 'three';

export const SHADOW_LAYER = 3;
const q = typeof location !== 'undefined' ? /[?&]sunshadow=(\d)/.exec(location.search) : null;
const ON = !(q && q[1] === '0');
const CASCADES = [{ far: 120, size: 2048 }, { far: 1200, size: 2048 }];

// shared by every receiving material (terrain, plants): x on, y the first cascade's reach, z the
// second's; per cascade the light's view-projection, its position and its texel (m)
export const SUN_SHADOW_UNIFORMS = {
  uSunShadow: { value: new THREE.Vector4(0, 0, 0, 0) },
  tSunShadow0: { value: null }, tSunShadow1: { value: null },
  uSunShadowVP0: { value: new THREE.Matrix4() }, uSunShadowVP1: { value: new THREE.Matrix4() },
  uSunShadowL0: { value: new THREE.Vector4() }, uSunShadowL1: { value: new THREE.Vector4() },   // xyz light position, w texel
  uSunShadowDir: { value: new THREE.Vector3(0, 1, 0) },
};

// the light's position and direction for the cascade being drawn: shared by every caster's shadow
// material (this file's, and a caster's own: userData.shadowMat, e.g. render/rockRender.js)
export const SHADOW_LIGHT_UNIFORMS = { uLightPos: { value: new THREE.Vector3() }, uLightDir: { value: new THREE.Vector3() } };

// the casters' material: the distance from the light along the sun
const DEPTH_VERT = /* glsl */`
uniform vec3 uLightPos;
uniform vec3 uLightDir;
varying float vD;
void main() {
  vec4 p = vec4(position, 1.0);
  #ifdef USE_INSTANCING
  p = instanceMatrix * p;
  #endif
  vec4 wp = modelMatrix * p;
  vD = dot(uLightPos - wp.xyz, uLightDir);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;
const DEPTH_FRAG = /* glsl */`
varying float vD;
void main() { gl_FragColor = vec4(vD, 0.0, 0.0, 1.0); }`;

export class SunShadows {
  constructor() {
    this.on = ON;
    this.sunDir = new THREE.Vector3(0, 1, 0);
    this.active = false;   // (a sun overhead some ground: world.js sets it each frame)
    this.anchor = new THREE.Vector3();   // (the near world's centre, camera-relative: the snap's fixed point)
    this.cams = CASCADES.map(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1));
    for (const c of this.cams) c.layers.set(SHADOW_LAYER);
    this.targets = CASCADES.map((c) => {
      const t = new THREE.WebGLRenderTarget(c.size, c.size, { type: THREE.FloatType, format: THREE.RedFormat, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, depthBuffer: true, generateMipmaps: false });
      return t;
    });
    this.mat = new THREE.ShaderMaterial({ uniforms: { ...SHADOW_LIGHT_UNIFORMS }, vertexShader: DEPTH_VERT, fragmentShader: DEPTH_FRAG, side: THREE.DoubleSide });
    SUN_SHADOW_UNIFORMS.tSunShadow0.value = this.targets[0].texture;
    SUN_SHADOW_UNIFORMS.tSunShadow1.value = this.targets[1].texture;
  }

  // the maps for this frame: the camera at the world's origin (positions are camera-relative)
  render(renderer, scene) {
    const U = SUN_SHADOW_UNIFORMS;
    if (!this.on || !this.active) { U.uSunShadow.value.x = 0; return; }
    const s = this.sunDir, up = Math.abs(s.y) < 0.99 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
    const prevTarget = renderer.getRenderTarget(), prevClear = renderer.getClearColor(new THREE.Color()), prevAlpha = renderer.getClearAlpha();
    // (each caster drawn in its shadow material: its own where it has one, its shape made in its
    // vertex shader; this one's otherwise)
    const swapped = this._swapped || (this._swapped = []);
    swapped.length = 0;
    scene.traverse((o) => {
      if (!o.isMesh || !o.layers.isEnabled(SHADOW_LAYER)) return;
      swapped.push(o, o.material);
      o.material = o.userData.shadowMat || this.mat;
    });
    renderer.setClearColor(0xffffff, 1);
    CASCADES.forEach((c, i) => {
      const cam = this.cams[i], texel = 2 * c.far / c.size, D = c.far * 6 + 2000;
      // (snapped to its texels on the world's centre, a point fixed to the ground: positions are the
      // camera's, and snapped on it the shadows' edges would crawl as the camera moves)
      cam.position.copy(s).multiplyScalar(D);
      cam.up.copy(up);
      cam.lookAt(0, 0, 0);
      cam.updateMatrixWorld();
      const v = this.anchor.clone().applyMatrix4(cam.matrixWorldInverse);
      const right = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0), upv = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 1);
      cam.position.addScaledVector(right, v.x - Math.round(v.x / texel) * texel).addScaledVector(upv, v.y - Math.round(v.y / texel) * texel);
      cam.updateMatrixWorld();
      cam.left = -c.far; cam.right = c.far; cam.top = c.far; cam.bottom = -c.far;
      cam.near = 0; cam.far = D + c.far * 1.5;
      cam.updateProjectionMatrix();
      SHADOW_LIGHT_UNIFORMS.uLightPos.value.copy(cam.position);
      SHADOW_LIGHT_UNIFORMS.uLightDir.value.copy(s);
      renderer.setRenderTarget(this.targets[i]);
      renderer.clear(true, true, false);
      renderer.render(scene, cam);
      U['uSunShadowVP' + i].value.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
      U['uSunShadowL' + i].value.set(cam.position.x, cam.position.y, cam.position.z, texel);
    });
    U.uSunShadowDir.value.copy(s);
    U.uSunShadow.value.set(1, CASCADES[0].far, CASCADES[1].far, 0);
    for (let i = 0; i < swapped.length; i += 2) swapped[i].material = swapped[i + 1];
    swapped.length = 0;
    renderer.setClearColor(prevClear, prevAlpha);
    renderer.setRenderTarget(prevTarget);
  }
}

// a receiver's side: wp the point (camera-relative world), N its normal; 1 lit, 0 shadowed. Each
// cascade's own map, the near one's edge fading into the far one's, the far one's into none (the
// height cube's shadows carry on beyond); 3x3 taps, bilinear; a bias of a texel or so, more on slopes the sun
// grazes
export const GLSL_SUN_SHADOW = /* glsl */`
uniform vec4 uSunShadow;
uniform highp sampler2D tSunShadow0;
uniform highp sampler2D tSunShadow1;
uniform mat4 uSunShadowVP0;
uniform mat4 uSunShadowVP1;
uniform vec4 uSunShadowL0;
uniform vec4 uSunShadowL1;
uniform vec3 uSunShadowDir;
float sunShadowTap(highp sampler2D t, mat4 VP, vec4 L, vec3 wp, float bias) {
  vec4 c = VP * vec4(wp, 1.0);
  vec2 uv = c.xy / c.w * 0.5 + 0.5;
  if (any(lessThan(uv, vec2(0.0))) || any(greaterThan(uv, vec2(1.0)))) return 1.0;
  float d = dot(L.xyz - wp, uSunShadowDir) - bias;
  ivec2 sz = textureSize(t, 0);
  // (a 3x3 box of comparisons, each read bilinearly between the four texels round it: where an
  // edge lies within a texel it moves smoothly across it, not a whole texel at a time (stairs))
  vec2 st = uv * vec2(sz) - 0.5, fr = fract(st);
  ivec2 p0 = ivec2(floor(st));
  float cmp[16];
  for (int j = 0; j < 4; j++) for (int i = 0; i < 4; i++) cmp[j * 4 + i] = d <= texelFetch(t, clamp(p0 + ivec2(i - 1, j - 1), ivec2(0), sz - 1), 0).r ? 1.0 : 0.0;
  float lit = 0.0;
  for (int j = 0; j < 3; j++) for (int i = 0; i < 3; i++)
    lit += mix(mix(cmp[j * 4 + i], cmp[j * 4 + i + 1], fr.x), mix(cmp[j * 4 + i + 4], cmp[j * 4 + i + 5], fr.x), fr.y);
  return lit / 9.0;
}
float sunShadowMap(vec3 wp, vec3 N) {
  if (uSunShadow.x < 0.5) return 1.0;
  float dist = length(wp);
  if (dist > uSunShadow.z) return 1.0;
  float ndl = max(dot(N, uSunShadowDir), 0.05);
  float slope = sqrt(1.0 - ndl * ndl) / ndl;
  float s1 = sunShadowTap(tSunShadow1, uSunShadowVP1, uSunShadowL1, wp, uSunShadowL1.w * (1.5 + min(slope, 6.0)));
  float sh = mix(s1, 1.0, smoothstep(0.85 * uSunShadow.z, uSunShadow.z, dist));
  if (dist < uSunShadow.y) {
    float s0 = sunShadowTap(tSunShadow0, uSunShadowVP0, uSunShadowL0, wp, uSunShadowL0.w * (1.5 + min(slope, 6.0)));
    sh = mix(s0, sh, smoothstep(0.75 * uSunShadow.y, uSunShadow.y, dist));
  }
  return sh;
}
`;
