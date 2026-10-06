// Sun shadows near the camera, finer than the height cube's (terrainShadow.js: ~300 m texels): two
// cascades of shadow maps around the camera, 0..120 m and 120 m..1.2 km, 2048 a side (~12 cm, ~1.2 m a
// texel). Each holds the distance along the sun to the nearest caster (a float, not a depth buffer:
// the same whatever the main view's depth (reversed-Z or logarithmic)); the casters are what's on
// layer SHADOW_LAYER (terrain, the near volume, plants). ?sunshadow=0 turns them off.
//
// And the sky's: under a wood's canopy the ground sees little of the sky, in sun or under cloud. Two
// maps from straight overhead (0..150 m at ~30 cm, 150 m..1.4 km at ~2.7 m; ?skyshadow=0 off) hold the top of what's on
// layer SKY_LAYER (trees, shrubs); a receiver takes the sky's light by how much of the sky (cosine-
// weighted) the canopy over and around it hides. Held in the body's own frame (the ground turns under the
// camera), so drawn only every few frames.
import * as THREE from 'three';

export const SHADOW_LAYER = 3;
export const SKY_LAYER = 4;
const q = typeof location !== 'undefined' ? /[?&]sunshadow=(\d)/.exec(location.search) : null;
const ON = !(q && q[1] === '0');
const qs = typeof location !== 'undefined' ? /[?&]skyshadow=(\d)/.exec(location.search) : null;
const SKY_ON = !(qs && qs[1] === '0');
const CASCADES = [{ far: 120, size: 2048 }, { far: 1200, size: 2048 }];
const SKY_CASCADES = [{ far: 150, size: 1024 }, { far: 1400, size: 1024 }];
const SKY_EVERY = 4;   // (frames between a sky map's redraws; the two take turns)
// (all four in one texture, a texture unit being dear in the ground's shader: the sun's side by side along
// the bottom, the sky's above)
const SUN_ORG = CASCADES.map((c, i) => [i * CASCADES[0].size, 0]);
const SKY_ORG = SKY_CASCADES.map((c, i) => [i * SKY_CASCADES[0].size, CASCADES[0].size]);
const ATLAS_W = CASCADES.length * CASCADES[0].size, ATLAS_H = CASCADES[0].size + SKY_CASCADES[0].size;
const SKY_D = SKY_CASCADES.map((c) => 2000 + c.far);   // (each sky map's camera's height over the camera)

// the sky maps softened (Dave: blended, not squares): each texel's share of a 5x5 round it under canopy, and
// that share times the canopy top's depth below the map's camera less D, both linear so the hardware's
// blend between texels stays true (the depth after it: the second over the first); a crown's edge fades
// over a metre or so, its leaves' gaps averaged
const BLUR_VERT = /* glsl */`
void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const BLUR_FRAG = /* glsl */`
uniform highp sampler2D tAtlas;
uniform vec2 uOrg;
uniform float uN;
uniform float uD;
uniform vec2 uOutOrg;
void main() {
  ivec2 px = ivec2(gl_FragCoord.xy - uOutOrg), org = ivec2(uOrg), hi = ivec2(int(uN) - 1);
  float c = 0.0, ch = 0.0, ws = 0.0;
  for (int j = -2; j <= 2; j++) for (int i = -2; i <= 2; i++) {
    float w = (i == 0 ? 6.0 : abs(i) == 1 ? 4.0 : 1.0) * (j == 0 ? 6.0 : abs(j) == 1 ? 4.0 : 1.0);
    float m = texelFetch(tAtlas, org + clamp(px + ivec2(i, j), ivec2(0), hi), 0).r;
    float cov = m > 2.0 ? 1.0 : 0.0;
    c += w * cov; ch += w * cov * (m - uD); ws += w;
  }
  gl_FragColor = vec4(c / ws, ch / ws, 0.0, 1.0);
}`;

// shared by every receiving material (terrain, plants): x on, y the first cascade's reach, z the
// second's; per cascade the light's view-projection, its position and its texel (m)
export const SUN_SHADOW_UNIFORMS = {
  uSunShadow: { value: new THREE.Vector4(0, 0, 0, 0) },
  tShadowAtlas: { value: null },
  uSunShadowVP0: { value: new THREE.Matrix4() }, uSunShadowVP1: { value: new THREE.Matrix4() },
  uSunShadowL0: { value: new THREE.Vector4() }, uSunShadowL1: { value: new THREE.Vector4() },   // xyz light position, w texel
  uSunShadowDir: { value: new THREE.Vector3(0, 1, 0) },
};

// the sky's maps (body-fixed): x on, y the near map's reach, z the far one's, w the light a canopy lets
// through; per map its view-projection (body-fixed to clip), its camera (body-fixed; w its texel), its up;
// and now: the body's centre (camera-relative) and the turn from world to body-fixed
export const SKY_SHADOW_UNIFORMS = {
  uSkyShadow: { value: new THREE.Vector4(0, 0, 0, 0.12) },
  uSkyShadowVP0: { value: new THREE.Matrix4() }, uSkyShadowVP1: { value: new THREE.Matrix4() },
  uSkyShadowL0: { value: new THREE.Vector4() }, uSkyShadowL1: { value: new THREE.Vector4() },
  uSkyShadowUp0: { value: new THREE.Vector3(0, 1, 0) }, uSkyShadowUp1: { value: new THREE.Vector3(0, 1, 0) },
  uSkyCenter: { value: new THREE.Vector3() },
  uSkyToFixed: { value: new THREE.Matrix3() },
  tSkySoft: { value: null },
  uSkyD: { value: new THREE.Vector2(SKY_D[0], SKY_D[1]) },
  // (the light the canopy passes down (canopyLit): the leaves' colour, its brightness one (world.js, the
  // world near the camera); and for the three.js lit materials, the sun's and the sky's light on a level
  // canopy where the camera is (game.js computeLighting)
  uLeafTint: { value: new THREE.Vector3(1, 1, 1) },
  uCanopySun: { value: new THREE.Vector3() },
  uCanopySky: { value: new THREE.Vector3() },
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

// a caster's own shadow material whose shape moves in its vertex shader (grass in the wind): its patch
// works on 'transformed' (the vertex, model space) with its uniforms, declared in decl
export function depthMaterial(decl, patch, uniforms = {}) {
  return new THREE.ShaderMaterial({
    uniforms: { ...SHADOW_LIGHT_UNIFORMS, ...uniforms },
    vertexShader: decl + DEPTH_VERT.replace('vec4 p = vec4(position, 1.0);', `vec3 transformed = position;\n  ${patch}\n  vec4 p = vec4(transformed, 1.0);`),
    fragmentShader: DEPTH_FRAG, side: THREE.DoubleSide,
  });
}

export class SunShadows {
  constructor() {
    this.on = ON;
    this.sky = SKY_ON;   // (?skyshadow=0: the canopy's off)
    this.sunDir = new THREE.Vector3(0, 1, 0);
    this.active = false;   // (a sun overhead some ground: world.js sets it each frame)
    this.anchor = new THREE.Vector3();   // (the near world's centre, camera-relative: the snap's fixed point)
    this.bodyQInv = new THREE.Quaternion();   // (its turn: world to body-fixed; world.js sets it with the anchor)
    this.body = null;
    this.atlas = new THREE.WebGLRenderTarget(ATLAS_W, ATLAS_H, { type: THREE.FloatType, format: THREE.RedFormat, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, depthBuffer: true, generateMipmaps: false });
    this.cams = CASCADES.map(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1));
    for (const c of this.cams) c.layers.set(SHADOW_LAYER);
    this.skyCams = SKY_CASCADES.map(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1));
    for (const c of this.skyCams) c.layers.set(SKY_LAYER);
    this.frame = 0;
    this.skyBody = null;
    this.mat = new THREE.ShaderMaterial({ uniforms: { ...SHADOW_LIGHT_UNIFORMS }, vertexShader: DEPTH_VERT, fragmentShader: DEPTH_FRAG, side: THREE.DoubleSide });
    SUN_SHADOW_UNIFORMS.tShadowAtlas.value = this.atlas.texture;
    // (the sky maps softened, side by side: BLUR_FRAG)
    const n = SKY_CASCADES[0].size;
    this.skySoft = new THREE.WebGLRenderTarget(n * SKY_CASCADES.length, n, { type: THREE.HalfFloatType, format: THREE.RGFormat, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false, generateMipmaps: false });
    SKY_SHADOW_UNIFORMS.tSkySoft.value = this.skySoft.texture;
    this.blurMat = new THREE.ShaderMaterial({
      uniforms: { tAtlas: { value: this.atlas.texture }, uOrg: { value: new THREE.Vector2() }, uN: { value: n }, uD: { value: 0 }, uOutOrg: { value: new THREE.Vector2() } },
      vertexShader: BLUR_VERT, fragmentShader: BLUR_FRAG, depthTest: false, depthWrite: false,
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.blurMat);
    quad.frustumCulled = false;
    this.blurScene = new THREE.Scene(); this.blurScene.add(quad);
    this.blurCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  }

  // soften sky map i (BLUR_FRAG) into its square of skySoft
  _soften(renderer, i) {
    const n = SKY_CASCADES[i].size, t = this.skySoft, u = this.blurMat.uniforms;
    u.uOrg.value.set(SKY_ORG[i][0], SKY_ORG[i][1]); u.uN.value = n; u.uD.value = SKY_D[i]; u.uOutOrg.value.set(i * n, 0);
    t.viewport.set(i * n, 0, n, n); t.scissor.set(i * n, 0, n, n); t.scissorTest = true;
    renderer.setRenderTarget(t);
    renderer.render(this.blurScene, this.blurCam);
  }

  // draw into one map's square of the atlas, cleared
  _region(renderer, org, size) {
    const a = this.atlas;
    a.viewport.set(org[0], org[1], size, size); a.scissor.set(org[0], org[1], size, size); a.scissorTest = true;
    renderer.setRenderTarget(a);
    renderer.clear(true, true, false);
  }

  // (each caster on a layer drawn in its shadow material: its own where it has one, its shape made in its
  // vertex shader; this one's otherwise; those only for the near map hidden from the far ones)
  _swap(scene, layer) {
    const swapped = this._swapped || (this._swapped = []);
    swapped.length = 0;
    scene.traverse((o) => {
      if (!o.isMesh || !o.layers.isEnabled(layer)) return;
      swapped.push(o, o.material, o.geometry);
      o.material = o.userData.shadowMat || this.mat;
    });
    return swapped;
  }
  _restore(swapped) {
    for (let i = 0; i < swapped.length; i += 3) { swapped[i].material = swapped[i + 1]; swapped[i].geometry = swapped[i + 2]; }
    swapped.length = 0;
  }
  _nearOnly(swapped, show) {
    for (let i = 0; i < swapped.length; i += 3) if (swapped[i].userData.shadowNearOnly) swapped[i].visible = show && swapped[i].userData._shVis;
  }
  // (the coarse maps: a caster's lighter stand-in where it has one, userData.shadowFar { geo, mat }: a tree's
  // far form, its texels a metre and more across)
  _far(swapped) {
    for (let i = 0; i < swapped.length; i += 3) { const f = swapped[i].userData.shadowFar; if (f) { swapped[i].geometry = f.geo; swapped[i].material = f.mat; } }
  }

  // an orthographic camera at D along dir from the world's origin (the camera), looking back at it, its
  // square of half-side far snapped to its texels on the anchor (a point fixed to the ground: snapped on
  // the camera the shadows' edges would crawl as it moves)
  _place(cam, dir, far, size, D, depth) {
    const texel = 2 * far / size, up = Math.abs(dir.y) < 0.99 ? _Y : _X;
    cam.position.copy(dir).multiplyScalar(D);
    cam.up.copy(up);
    cam.lookAt(0, 0, 0);
    cam.updateMatrixWorld();
    const v = _v.copy(this.anchor).applyMatrix4(cam.matrixWorldInverse);
    const right = _r.setFromMatrixColumn(cam.matrixWorld, 0), upv = _u.setFromMatrixColumn(cam.matrixWorld, 1);
    cam.position.addScaledVector(right, v.x - Math.round(v.x / texel) * texel).addScaledVector(upv, v.y - Math.round(v.y / texel) * texel);
    cam.updateMatrixWorld();
    cam.left = -far; cam.right = far; cam.top = far; cam.bottom = -far;
    cam.near = 0; cam.far = depth;
    cam.updateProjectionMatrix();
    SHADOW_LIGHT_UNIFORMS.uLightPos.value.copy(cam.position);
    SHADOW_LIGHT_UNIFORMS.uLightDir.value.copy(dir);
    return texel;
  }

  // the maps for this frame: the camera at the world's origin (positions are camera-relative)
  render(renderer, scene) {
    const U = SUN_SHADOW_UNIFORMS, K = SKY_SHADOW_UNIFORMS;
    if (!this.on || !this.active) { U.uSunShadow.value.x = 0; K.uSkyShadow.value.x = 0; this.skyBody = null; return; }
    const s = this.sunDir;
    const prevTarget = renderer.getRenderTarget(), prevClear = renderer.getClearColor(_c), prevAlpha = renderer.getClearAlpha();
    renderer.setClearColor(0xffffff, 1);
    // the sun's
    let swapped = this._swap(scene, SHADOW_LAYER);
    for (let i = 0; i < swapped.length; i += 3) if (swapped[i].userData.shadowNearOnly) swapped[i].userData._shVis = swapped[i].visible;
    CASCADES.forEach((c, i) => {
      const D = c.far * 6 + 2000, cam = this.cams[i];
      if (i > 0) { this._nearOnly(swapped, false); this._far(swapped); }
      const texel = this._place(cam, s, c.far, c.size, D, D + c.far * 1.5);
      this._region(renderer, SUN_ORG[i], c.size);
      renderer.render(scene, cam);
      U['uSunShadowVP' + i].value.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
      U['uSunShadowL' + i].value.set(cam.position.x, cam.position.y, cam.position.z, texel);
    });
    this._nearOnly(swapped, true);
    this._restore(swapped);
    U.uSunShadowDir.value.copy(s);
    U.uSunShadow.value.set(1, CASCADES[0].far, CASCADES[1].far, 0);
    // the sky's: a map in its turn (both at once on a new world), straight down over the camera, held in the
    // body's frame
    K.uSkyCenter.value.copy(this.anchor);
    K.uSkyToFixed.value.setFromMatrix4(_m.makeRotationFromQuaternion(this.bodyQInv));
    const fresh = this.skyBody !== this.body;
    this.skyBody = this.body;
    const f = this.frame++ % SKY_EVERY;
    const due = SKY_CASCADES.map((c, i) => this.sky && (fresh || f === Math.round(i * SKY_EVERY / SKY_CASCADES.length)));
    if (due.some(Boolean)) {
      swapped = this._swap(scene, SKY_LAYER);
      const up = _w.copy(this.anchor).negate().normalize();
      // (world from body-fixed: the body's turn, then its centre)
      const toWorld = _m2.compose(this.anchor, _q.copy(this.bodyQInv).invert(), _one);
      SKY_CASCADES.forEach((c, i) => {
        if (!due[i]) return;
        const cam = this.skyCams[i], D = SKY_D[i];
        if (i > 0) this._far(swapped);
        const texel = this._place(cam, up, c.far, c.size, D, D + 4000);
        this._region(renderer, SKY_ORG[i], c.size);
        renderer.render(scene, cam);
        this._soften(renderer, i);
        K['uSkyShadowVP' + i].value.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse).multiply(toWorld);
        const L = _v.copy(cam.position).sub(this.anchor).applyQuaternion(this.bodyQInv);
        K['uSkyShadowL' + i].value.set(L.x, L.y, L.z, texel);
        K['uSkyShadowUp' + i].value.copy(up).applyQuaternion(this.bodyQInv);
      });
      this._restore(swapped);
    }
    K.uSkyShadow.value.set(this.sky ? 1 : 0, SKY_CASCADES[0].far, SKY_CASCADES[1].far, K.uSkyShadow.value.w);
    renderer.setClearColor(prevClear, prevAlpha);
    renderer.setRenderTarget(prevTarget);
  }
}
const _X = new THREE.Vector3(1, 0, 0), _Y = new THREE.Vector3(0, 1, 0), _one = new THREE.Vector3(1, 1, 1);
const _v = new THREE.Vector3(), _r = new THREE.Vector3(), _u = new THREE.Vector3(), _w = new THREE.Vector3();
const _m = new THREE.Matrix4(), _m2 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _c = new THREE.Color();

// a receiver's side: wp the point (camera-relative world), N its normal; 1 lit, 0 shadowed. Each
// cascade's own map, the near one's edge fading into the far one's, the far one's into none (the
// height cube's shadows carry on beyond); 3x3 taps, bilinear; a bias of a texel or so, more on slopes the sun
// grazes
export const GLSL_SUN_SHADOW = /* glsl */`
uniform vec4 uSunShadow;
uniform highp sampler2D tShadowAtlas;
uniform mat4 uSunShadowVP0;
uniform mat4 uSunShadowVP1;
uniform vec4 uSunShadowL0;
uniform vec4 uSunShadowL1;
uniform vec3 uSunShadowDir;
float sunShadowTap(ivec2 org, int n, mat4 VP, vec4 L, vec3 wp, float bias) {
  vec4 c = VP * vec4(wp, 1.0);
  vec2 uv = c.xy / c.w * 0.5 + 0.5;
  if (any(lessThan(uv, vec2(0.0))) || any(greaterThan(uv, vec2(1.0)))) return 1.0;
  float d = dot(L.xyz - wp, uSunShadowDir) - bias;
  ivec2 sz = ivec2(n);
  // (a 3x3 box of comparisons, each read bilinearly between the four texels round it: where an
  // edge lies within a texel it moves smoothly across it, not a whole texel at a time (stairs))
  vec2 st = uv * vec2(sz) - 0.5, fr = fract(st);
  ivec2 p0 = ivec2(floor(st));
  float cmp[16];
  for (int j = 0; j < 4; j++) for (int i = 0; i < 4; i++) cmp[j * 4 + i] = d <= texelFetch(tShadowAtlas, org + clamp(p0 + ivec2(i - 1, j - 1), ivec2(0), sz - 1), 0).r ? 1.0 : 0.0;
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
  float s1 = sunShadowTap(ivec2(${SUN_ORG[1][0]}, ${SUN_ORG[1][1]}), ${CASCADES[1].size}, uSunShadowVP1, uSunShadowL1, wp, uSunShadowL1.w * (1.5 + min(slope, 6.0)));
  float sh = mix(s1, 1.0, smoothstep(0.85 * uSunShadow.z, uSunShadow.z, dist));
  if (dist < uSunShadow.y) {
    float s0 = sunShadowTap(ivec2(${SUN_ORG[0][0]}, ${SUN_ORG[0][1]}), ${CASCADES[0].size}, uSunShadowVP0, uSunShadowL0, wp, uSunShadowL0.w * (1.5 + min(slope, 6.0)));
    sh = mix(s0, sh, smoothstep(0.75 * uSunShadow.y, uSunShadow.y, dist));
  }
  return sh;
}
`;

// the sky a receiver sees past the canopy (1 all of it; after GLSL_SUN_SHADOW, whose atlas it reads): wp
// the point (camera-relative world). From the
// map overhead round it, rings of taps out to 45 m (under a closed canopy 12 m up, nine tenths of the sky): where the canopy's top stands dh over the point at a
// tap in a ring between radii a and b, it hides the sky between zenith angles atan(a/dh) and atan(b/dh),
// b^2/(b^2+dh^2) - a^2/(a^2+dh^2) of the sky's light (cosine-weighted); the leaves let a little through
export const GLSL_SKY_SHADOW = /* glsl */`
uniform vec4 uSkyShadow;
uniform mat4 uSkyShadowVP0;
uniform mat4 uSkyShadowVP1;
uniform vec4 uSkyShadowL0;
uniform vec4 uSkyShadowL1;
uniform vec3 uSkyShadowUp0;
uniform vec3 uSkyShadowUp1;
uniform vec3 uSkyCenter;
uniform mat3 uSkyToFixed;
uniform highp sampler2D tSkySoft;
uniform vec2 uSkyD;
float skyShadowMap(float u0, float nTex, float D, mat4 VP, vec4 L, vec3 upF, float ext, vec3 pF) {
  vec4 c = VP * vec4(pF, 1.0);
  vec2 uv = c.xy / c.w * 0.5 + 0.5;
  float edge = 45.0 / (2.0 * ext);
  if (any(lessThan(uv, vec2(edge))) || any(greaterThan(uv, vec2(1.0 - edge)))) return -1.0;
  // (a bias: the point's own leaves, a texel and a little more, aren't over it)
  float d = dot(L.xyz - pF, upF) - (0.3 + 1.5 * L.w);
  float blocked = 0.0;
  for (int j = 0; j < 5; j++) {
    float a = j == 0 ? 0.0 : j == 1 ? 1.0 : j == 2 ? 3.5 : j == 3 ? 9.0 : 20.0;
    float b = j == 0 ? 1.0 : j == 1 ? 3.5 : j == 2 ? 9.0 : j == 3 ? 20.0 : 45.0;
    float r = j == 0 ? 0.0 : (a + b) * 0.5;
    int n = j == 0 ? 1 : 6;
    float acc = 0.0;
    for (int k = 0; k < 6; k++) {
      if (k >= n) break;
      float ang = (float(k) + 0.5 * float(j)) * 1.0471976;
      vec2 tuv = clamp(uv + vec2(cos(ang), sin(ang)) * (r / (2.0 * ext)), vec2(0.5 / nTex), vec2(1.0 - 0.5 / nTex));
      // (the softened map, blended between texels: the canopy's share there and its top)
      vec2 sc = texture(tSkySoft, vec2((u0 + tuv.x) * ${(1 / SKY_CASCADES.length).toFixed(6)}, tuv.y)).rg;
      if (sc.r > 0.003) {
        float dh = d - (D + sc.g / sc.r);
        if (dh > 0.0) { float h2 = dh * dh; acc += sc.r * (b * b / (b * b + h2) - a * a / (a * a + h2 + 1e-6)); }
      }
    }
    blocked += acc / float(n);
  }
  return clamp(blocked, 0.0, 1.0);
}
// how much of the sky (cosine-weighted) the canopy hides from wp, 0..1
float skyBlocked(vec3 wp) {
  if (uSkyShadow.x < 0.5) return 0.0;
  float dist = length(wp);
  if (dist > uSkyShadow.z) return 0.0;
  vec3 pF = uSkyToFixed * (wp - uSkyCenter);
  float bl = -1.0;
  if (dist < uSkyShadow.y) bl = skyShadowMap(0.0, ${SKY_CASCADES[0].size.toFixed(1)}, uSkyD.x, uSkyShadowVP0, uSkyShadowL0, uSkyShadowUp0, uSkyShadow.y, pF);
  if (bl < 0.0) bl = skyShadowMap(1.0, ${SKY_CASCADES[1].size.toFixed(1)}, uSkyD.y, uSkyShadowVP1, uSkyShadowL1, uSkyShadowUp1, uSkyShadow.z, pF);
  if (bl < 0.0) return 0.0;
  return bl * (1.0 - smoothstep(0.8 * uSkyShadow.z, uSkyShadow.z, dist));
}
float skyShadow(vec3 wp) { return 1.0 - skyBlocked(wp) * (1.0 - uSkyShadow.w); }
uniform vec3 uLeafTint;
uniform vec3 uCanopySun;
uniform vec3 uCanopySky;
// the light the canopy over a point passes down to it (bl: how much of its sky the canopy hides): the
// sun's and the sky's on the canopy's top (sunTop the sun's light there, its shadows by the ground and
// the clouds but not the leaves'; muS its height), through the leaves and scattered within them, a tenth
// of it, in the leaves' colour (a wood's floor in its green light, brighter under a sunlit crown than a
// clouded one); per the receiver's light (x its E)
vec3 canopyLit(float bl, vec3 sunTop, float muS, vec3 skyE) {
  return bl * 0.1 * (sunTop * max(muS, 0.0) + skyE) * uLeafTint;
}
`;

// a three.js lit material (the animals', the grass's) made to take both: its direct light (the sun) by the
// sun's maps, its sky's by the canopy's. Chains any onBeforeCompile it has
export function receiveShadows(mat) {
  const prev = mat.onBeforeCompile;
  const own = prev && prev !== THREE.Material.prototype.onBeforeCompile ? prev : null;
  mat.onBeforeCompile = (sh, r) => {
    if (own) own.call(mat, sh, r);
    Object.assign(sh.uniforms, SUN_SHADOW_UNIFORMS, SKY_SHADOW_UNIFORMS);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vShWorld;')
      .replace('#include <project_vertex>', `#include <project_vertex>
  {
    vec4 shw = vec4(transformed, 1.0);
    #ifdef USE_BATCHING
    shw = batchingMatrix * shw;
    #endif
    #ifdef USE_INSTANCING
    shw = instanceMatrix * shw;
    #endif
    vShWorld = (modelMatrix * shw).xyz;
  }`);
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>\nvarying vec3 vShWorld;\n${GLSL_SUN_SHADOW}\n${GLSL_SKY_SHADOW}`)
      .replace('#include <lights_fragment_end>', `#include <lights_fragment_end>
  {
    vec3 shN = normalize((vec4(normal, 0.0) * viewMatrix).xyz);
    float shS = sunShadowMap(vShWorld, shN);
    reflectedLight.directDiffuse *= shS; reflectedLight.directSpecular *= shS;
    float shB = skyBlocked(vShWorld);
    reflectedLight.indirectDiffuse *= 1.0 - shB; reflectedLight.indirectSpecular *= 1.0 - shB;
    reflectedLight.indirectDiffuse += BRDF_Lambert(material.diffuseColor) * shB * 0.1 * (uCanopySun + uCanopySky) * uLeafTint;
  }`);
  };
  const key = own ? own.toString() : '';
  mat.customProgramCacheKey = () => 'shadowed|' + key;
  mat.needsUpdate = true;
  return mat;
}
