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
//
// And the grass's: a blade is thinner than the sun maps' texels, and drawn into them its shadow came and
// went as the sun moved a hair a frame and the blades swayed, a low sun's long shadows flickering across
// the field. So the blades (on layer COVER_LAYER) are drawn into a map of their own (0..24 m, ~5 cm), each
// as a share of the light it takes: turned to face the sun, widened to a few texels and as much fainter,
// faded across its width, the shares added: what falls on the ground beneath (the snow between the blades)
// a sum that moves smoothly as they do. A receiver takes the sun by exp(-k sum) (grassCover).
import * as THREE from 'three';
import { floraOf } from '../sim/floraField.js';

export const SHADOW_LAYER = 3;
export const SKY_LAYER = 4;
export const COVER_LAYER = 5;
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
const SKY_RN = SKY_CASCADES[0].size / 2;   // (the rings' texture: each block's side, half the map's)
// (the grass's cover: in the atlas's corner the sky maps leave, beside them)
const COVER = { far: 24, size: 1024 };
const COVER_ORG = [SKY_CASCADES.length * SKY_CASCADES[0].size, CASCADES[0].size];
// (the least width a blade's drawn there: 2.5 of its texels, so its share of each texel it crosses
// changes smoothly as it moves, never a texel's centre in or out)
export const COVER_MIN_W = 2.5 * 2 * COVER.far / COVER.size;
// (the trunks' hold on the sky at their feet: in the corner beside the grass's, 0..32 m at 12.5 cm)
const TRUNKS = { far: 32, size: 512 };
const TRUNKS_ORG = [COVER_ORG[0] + COVER.size, CASCADES[0].size];
// (and the rocks' beside them, the same reach and texels: kept apart, so the ground round a boulder takes
// its darkness but not a trunk's bare soil, and a rock's own top isn't darkened by itself)
const ROCKS_ORG = [TRUNKS_ORG[0] + TRUNKS.size, TRUNKS_ORG[1]];
// the share of the sky (cosine-weighted) an upright trunk of radius r and height h hides from a point on
// the ground d from its axis: the wedge of azimuth it spans, 2 asin(r / d), from the horizon to the
// elevation of its top (sin^2 of it, cosine-weighted), half the sky against it. Drawn from overhead as
// -ln(1 - share), added, so the trunks round a point hide its sky as exp(-sum) leaves it
const TRUNK_VERT = /* glsl */`
attribute vec2 corner;
attribute vec4 aT;       // (its base (body-fixed, from the set's middle), its radius)
attribute float aH;      // (its height to its crown)
uniform float uExt;
varying vec2 vC;
varying float vR;
varying float vH;
varying float vE;
void main() {
  float e = uExt * aT.w;
  vec4 mv = modelViewMatrix * vec4(aT.xyz, 1.0);
  mv.xy += corner * e;
  vC = corner; vR = aT.w; vH = aH; vE = e;
  gl_Position = projectionMatrix * mv;
}`;
const TRUNK_FRAG = /* glsl */`
varying vec2 vC;
varying float vR;
varying float vH;
varying float vE;
void main() {
  float q = length(vC);
  if (q > 1.0) discard;
  float d = q * vE;
  float o = d <= vR ? 0.5 : asin(vR / d) / 3.14159265 * vH * vH / (vH * vH + d * d);
  gl_FragColor = vec4(-log(1.0 - o) * (1.0 - smoothstep(0.85, 1.0, q)), 0.0, 0.0, 1.0);
}`;
const TRUNK_EXT = 10;   // (a trunk's quad: this many of its radii out, where it hides ~3% of the sky)
const TRUNK_MAX = 1024;

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

// the canopy round each point of a sky map, once a map's drawn, for its receivers (skyShadowMap): the
// softened map's share and share-times-top (both linear) averaged over the point itself and four rings
// round it (the rings skyShadowMap weighs, 2 to 33 m out), 16 taps a ring from the softened map's mip
// chain; and its mean over 180 m (skyShadowMap's early out). Three RGBA blocks a map, side by side, half
// its texels: A the point's and ring 1's, B rings 2 and 3, C ring 4's and the mean. Read so, a receiving
// point takes 3 reads, not the 26 it took walking the rings itself: in a wood 9 ms of a 59 ms GPU frame,
// 0.8 ms so (against the walk, where a point's 10 to 20 m under the tops: means within 0.015, r 0.94; just
// under them a little darker, the tops averaged before the falloff)
const RINGS_FRAG = /* glsl */`
uniform highp sampler2D tSoft;
uniform float uU0;     // the map (0 near, 1 far)
uniform float uBlock;  // which block: 0 A, 1 B, 2 C
uniform float uExt;    // the map's half-side (m)
uniform float uNTex;   // the map's texels across
uniform vec2 uOutOrg;
uniform float uOutN;
vec2 soft(vec2 uv, float lod) {
  uv = clamp(uv, vec2(0.5 / uNTex), vec2(1.0 - 0.5 / uNTex));
  return textureLod(tSoft, vec2((uU0 + uv.x) * ${(1 / SKY_CASCADES.length).toFixed(6)}, uv.y), lod).rg;
}
vec2 ring(vec2 uv, float j) {
  float a = j == 1.0 ? 1.0 : j == 2.0 ? 3.5 : j == 3.0 ? 9.0 : 20.0;
  float b = j == 1.0 ? 3.5 : j == 2.0 ? 9.0 : j == 3.0 ? 20.0 : 45.0;
  float r = (a + b) * 0.5 / (2.0 * uExt);
  // (each tap the mean of the texels round it, near as wide as the taps' spacing)
  float lod = max(0.0, log2(6.2831853 * r * uNTex / 16.0) - 0.5);
  vec2 acc = vec2(0.0);
  for (int k = 0; k < 16; k++) {
    float ang = (float(k) + 0.5 * j) * 0.39269908;
    acc += soft(uv + vec2(cos(ang), sin(ang)) * r, lod);
  }
  return acc / 16.0;
}
void main() {
  vec2 uv = (gl_FragCoord.xy - uOutOrg) / uOutN;
  if (uBlock < 0.5) gl_FragColor = vec4(soft(uv, 1.0), ring(uv, 1.0));
  else if (uBlock < 1.5) gl_FragColor = vec4(ring(uv, 2.0), ring(uv, 3.0));
  else gl_FragColor = vec4(ring(uv, 4.0), soft(uv, log2(180.0 * uNTex / (2.0 * uExt))).r, 0.0);
}`;

// shared by every receiving material (terrain, plants): x on, y the first cascade's reach, z the
// second's; per cascade the light's view-projection, its position and its texel (m)
export const SUN_SHADOW_UNIFORMS = {
  uSunShadow: { value: new THREE.Vector4(0, 0, 0, 0) },
  tShadowAtlas: { value: null },
  uSunShadowVP0: { value: new THREE.Matrix4() }, uSunShadowVP1: { value: new THREE.Matrix4() },
  uSunShadowL0: { value: new THREE.Vector4() }, uSunShadowL1: { value: new THREE.Vector4() },   // xyz light position, w texel
  uSunShadowDir: { value: new THREE.Vector3(0, 1, 0) },
  // (the grass's cover: x on, y z its corner in the atlas, w its size; its view-projection)
  uGrassCover: { value: new THREE.Vector4(0, 0, 0, 1) },
  uGrassCoverVP: { value: new THREE.Matrix4() },
  // (the trunks' hold on the sky: x on, y z its corner in the atlas, w its size; its view-projection)
  uTrunkSky: { value: new THREE.Vector4(0, 0, 0, 1) },
  uRockSky: { value: new THREE.Vector4(0, 0, 0, 1) },   // (the rocks': x on, y z their corner)
  uTrunkSkyVP: { value: new THREE.Matrix4() },
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
  tSkyRings: { value: null },
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
    // (the grass's cover: its shares added, which a float target takes only with EXT_float_blend)
    this.coverCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.coverCam.layers.set(COVER_LAYER);
    this.cover = null;   // (render: whether the GPU can add into the atlas)
    // (the trunks round the camera, a quad each, drawn from overhead into their corner of the atlas, added:
    // a set of them asked of the world's flora as the camera moves on, held body-fixed from its middle)
    this.trunkCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const tg = new THREE.InstancedBufferGeometry();
    tg.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(12), 3));
    tg.setAttribute('corner', new THREE.Float32BufferAttribute([-1, -1, 1, -1, 1, 1, -1, 1], 2));
    tg.setIndex([0, 1, 2, 0, 2, 3]);
    tg.setAttribute('aT', new THREE.InstancedBufferAttribute(new Float32Array(TRUNK_MAX * 4), 4));
    tg.setAttribute('aH', new THREE.InstancedBufferAttribute(new Float32Array(TRUNK_MAX), 1));
    tg.instanceCount = 0;
    this.trunkMesh = new THREE.Mesh(tg, new THREE.ShaderMaterial({
      uniforms: { uExt: { value: TRUNK_EXT } }, vertexShader: TRUNK_VERT, fragmentShader: TRUNK_FRAG, side: THREE.DoubleSide,
      blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, depthTest: false, depthWrite: false,
    }));
    this.trunkMesh.frustumCulled = false; this.trunkMesh.matrixAutoUpdate = false;
    this.trunkScene = new THREE.Scene();
    this.trunkScene.add(this.trunkMesh);
    // (the rocks round it likewise, a set of their own drawn into their own corner)
    const rg = new THREE.InstancedBufferGeometry();
    for (const k of ['position', 'corner']) rg.setAttribute(k, tg.attributes[k]);
    rg.setIndex(tg.index);
    rg.setAttribute('aT', new THREE.InstancedBufferAttribute(new Float32Array(TRUNK_MAX * 4), 4));
    rg.setAttribute('aH', new THREE.InstancedBufferAttribute(new Float32Array(TRUNK_MAX), 1));
    rg.instanceCount = 0;
    this.rockMesh = new THREE.Mesh(rg, this.trunkMesh.material);
    this.rockMesh.frustumCulled = false; this.rockMesh.matrixAutoUpdate = false;
    this.rockScene = new THREE.Scene();
    this.rockScene.add(this.rockMesh);
    this.trunkMid = new THREE.Vector3(); this.trunkAt = null; this.trunkBody = null;
    this.held = new THREE.Vector3(0, 1, 0); this.heldBody = null;   // (the sun as the maps hold it: body-fixed)
    this.bodyUp = new THREE.Vector3(0, 1, 0); this.bodyX = new THREE.Vector3(1, 0, 0);
    SUN_SHADOW_UNIFORMS.tShadowAtlas.value = this.atlas.texture;
    // (the sky maps softened, side by side: BLUR_FRAG)
    const n = SKY_CASCADES[0].size;
    // (mipmapped: its coarse levels the canopy's mean over a wide reach, for skyShadowMap's early out)
    this.skySoft = new THREE.WebGLRenderTarget(n * SKY_CASCADES.length, n, { type: THREE.HalfFloatType, format: THREE.RGFormat, minFilter: THREE.LinearMipmapLinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false, generateMipmaps: true });
    // (the rings round each point of it, for the receivers: RINGS_FRAG)
    this.skyRings = new THREE.WebGLRenderTarget(3 * SKY_CASCADES.length * SKY_RN, SKY_RN, { type: THREE.HalfFloatType, format: THREE.RGBAFormat, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false, generateMipmaps: false });
    SKY_SHADOW_UNIFORMS.tSkyRings.value = this.skyRings.texture;
    this.ringMat = new THREE.ShaderMaterial({
      uniforms: { tSoft: { value: this.skySoft.texture }, uU0: { value: 0 }, uBlock: { value: 0 }, uExt: { value: 1 }, uNTex: { value: n }, uOutOrg: { value: new THREE.Vector2() }, uOutN: { value: SKY_RN } },
      vertexShader: BLUR_VERT, fragmentShader: RINGS_FRAG, depthTest: false, depthWrite: false,
    });
    this.blurMat = new THREE.ShaderMaterial({
      uniforms: { tAtlas: { value: this.atlas.texture }, uOrg: { value: new THREE.Vector2() }, uN: { value: n }, uD: { value: 0 }, uOutOrg: { value: new THREE.Vector2() } },
      vertexShader: BLUR_VERT, fragmentShader: BLUR_FRAG, depthTest: false, depthWrite: false,
    });
    const quad = this.blurQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.blurMat);
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

  // sky map i's rings (RINGS_FRAG) into its three blocks of skyRings
  _rings(renderer, i) {
    const t = this.skyRings, u = this.ringMat.uniforms, m = SKY_RN;
    u.uU0.value = i; u.uExt.value = SKY_CASCADES[i].far; u.uNTex.value = SKY_CASCADES[i].size;
    this.blurQuad.material = this.ringMat;
    for (let k = 0; k < 3; k++) {
      const x = (i * 3 + k) * m;
      u.uBlock.value = k; u.uOutOrg.value.set(x, 0);
      t.viewport.set(x, 0, m, m); t.scissor.set(x, 0, m, m); t.scissorTest = true;
      renderer.setRenderTarget(t);
      renderer.render(this.blurScene, this.blurCam);
    }
    this.blurQuad.material = this.blurMat;
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
  _swap(scene, layer, key = 'shadowMat') {
    const swapped = this._swapped || (this._swapped = []);
    swapped.length = 0;
    scene.traverse((o) => {
      if (!o.isMesh || !o.layers.isEnabled(layer)) return;
      swapped.push(o, o.material, o.geometry);
      o.material = o.userData[key] || this.mat;
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
    const texel = 2 * far / size, up = Math.abs(dir.dot(this.bodyUp)) < 0.99 ? this.bodyUp : this.bodyX;
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

  // the trunks round the camera (the world's flora, sim/floraField.js: what's walked round) into their map,
  // asked again as the camera moves on a couple of metres; qB the body's turn (body-fixed to world)
  _trunkMap(renderer, qB) {
    const U = SUN_SHADOW_UNIFORMS, b = this.body, fl = b && floraOf(b), g = this.trunkMesh.geometry, gr = this.rockMesh.geometry;
    if (!fl) { U.uTrunkSky.value.x = 0; U.uRockSky.value.x = 0; return; }
    const camF = _tc.copy(this.anchor).negate().applyQuaternion(this.bodyQInv);
    if (this.trunkBody !== b || !this.trunkAt || this.trunkAt.distanceToSquared(camF) > 4) {
      this.trunkBody = b;
      this.trunkAt = (this.trunkAt || new THREE.Vector3()).copy(camF);
      this.trunkMid.copy(camF);
      const list = fl.near(camF, TRUNKS.far + 6, this._tl || (this._tl = []));
      const T = g.attributes.aT.array, H = g.attributes.aH.array, TR = gr.attributes.aT.array, HR = gr.attributes.aH.array;
      let n = 0, nr = 0;
      for (const it of list) {
        if (it.kind === 'tree' && n < TRUNK_MAX) {
          T[n * 4] = it.x - camF.x; T[n * 4 + 1] = it.y - camF.y; T[n * 4 + 2] = it.z - camF.z; T[n * 4 + 3] = it.r;
          // (its bole: the crown over it the canopy's map's)
          H[n] = 0.5 * it.h;
          n++;
        } else if (it.kind === 'rock' && it.hc !== undefined && nr < TRUNK_MAX) {
          // (a rock as a short wide trunk: as wide as it meets the ground (its bulge over that where its
          // middle stands above it), as high as a dome of its height hides the sky, ~0.65 of it)
          const top = it.hc + it.r, foot = it.hc > 0 ? 0.9 * it.r : Math.sqrt(Math.max(0, it.r * it.r - it.hc * it.hc));
          if (top < 0.1 || foot < 0.1) continue;
          TR[nr * 4] = it.x - camF.x; TR[nr * 4 + 1] = it.y - camF.y; TR[nr * 4 + 2] = it.z - camF.z; TR[nr * 4 + 3] = foot;
          HR[nr] = 0.65 * top;
          nr++;
        }
      }
      g.instanceCount = n; gr.instanceCount = nr;
      g.attributes.aT.needsUpdate = true; g.attributes.aH.needsUpdate = true;
      gr.attributes.aT.needsUpdate = true; gr.attributes.aH.needsUpdate = true;
    }
    if (!g.instanceCount && !gr.instanceCount) { U.uTrunkSky.value.x = 0; U.uRockSky.value.x = 0; return; }
    // (the sets in the world: from their middle, turned with the body, camera-relative)
    for (const m of [this.trunkMesh, this.rockMesh]) {
      m.matrix.compose(_tp.copy(this.trunkMid).applyQuaternion(qB).add(this.anchor), qB, _one);
      m.matrixWorld.copy(m.matrix);
    }
    const cam = this.trunkCam, up = _tu.copy(this.anchor).negate().normalize();
    this._place(cam, up, TRUNKS.far, TRUNKS.size, 2000, 6000);
    renderer.setClearColor(0x000000, 1);
    this._region(renderer, TRUNKS_ORG, TRUNKS.size);
    if (g.instanceCount) renderer.render(this.trunkScene, cam);
    this._region(renderer, ROCKS_ORG, TRUNKS.size);
    if (gr.instanceCount) renderer.render(this.rockScene, cam);
    renderer.setClearColor(0xffffff, 1);
    U.uTrunkSkyVP.value.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
    U.uTrunkSky.value.set(1, TRUNKS_ORG[0], TRUNKS_ORG[1], TRUNKS.size);
    U.uRockSky.value.set(1, ROCKS_ORG[0], ROCKS_ORG[1], TRUNKS.size);
  }

  // the maps for this frame: the camera at the world's origin (positions are camera-relative)
  render(renderer, scene) {
    const U = SUN_SHADOW_UNIFORMS, K = SKY_SHADOW_UNIFORMS;
    U.tShadowAtlas.value = this.atlas.texture; K.tSkyRings.value = this.skyRings.texture;
    if (!this.on || !this.active) { U.uSunShadow.value.x = 0; U.uGrassCover.value.x = 0; U.uTrunkSky.value.x = 0; U.uRockSky.value.x = 0; K.uSkyShadow.value.x = 0; this.skyBody = null; return; }
    // (the maps held to the ground: their cameras turned with the body, the sun held in its frame and moved
    // on a tenth of a degree at a time. Snapped to the world's centre 100 km off as the world turned under a
    // fixed sun, the maps slid up to half a texel a frame, every leaf's and blade's shadow flickering; held
    // so, between the sun's steps they don't change at all)
    const qB = _q2.copy(this.bodyQInv).invert();
    this.bodyUp.set(0, 1, 0).applyQuaternion(qB); this.bodyX.set(1, 0, 0).applyQuaternion(qB);
    const sF = _sf.copy(this.sunDir).applyQuaternion(this.bodyQInv);
    if (this.heldBody !== this.body || sF.dot(this.held) < HOLD_COS) { this.held.copy(sF); this.heldBody = this.body; }
    const s = _sh.copy(this.held).applyQuaternion(qB);
    const prevTarget = renderer.getRenderTarget(), prevClear = renderer.getClearColor(_c), prevAlpha = renderer.getClearAlpha();
    renderer.setClearColor(0xffffff, 1);
    // the sun's
    let swapped = this._swap(scene, SHADOW_LAYER);
    for (let i = 0; i < swapped.length; i += 3) if (swapped[i].userData.shadowNearOnly) swapped[i].userData._shVis = swapped[i].visible;
    // (each caster's distance from the camera, its bounding sphere's near side: a map's frustum runs ~2.7 km
    // up the sun's way, and drew every chunk and wood along it; past a few times a map's reach none of them
    // shadows it (a 20 m crown at a 5 degree sun reaches 230 m), the coarse heights' march (terrainShadow.js)
    // has the hills)
    const dist = this._dist || (this._dist = []);
    dist.length = 0;
    for (let i = 0; i < swapped.length; i += 3) {
      const o = swapped[i], g = o.geometry;
      if (!o.visible) { dist.push(null); continue; }   // (hidden: left so; a sphere round the camera's distance is below 0)
      // (an instanced set's own sphere, round all its instances; the geometry's is one instance's)
      if (o.isInstancedMesh) { if (!o.boundingSphere) o.computeBoundingSphere(); } else if (!g.boundingSphere) g.computeBoundingSphere();
      const bs = o.isInstancedMesh ? o.boundingSphere : g.boundingSphere, sc = o.matrixWorld.getMaxScaleOnAxis();
      dist.push(_v.copy(bs.center).applyMatrix4(o.matrixWorld).length() - bs.radius * sc);
    }
    // (the far map drawn every other frame: between, its last drawing read through the ground's move since,
    // the camera-relative frame then (the world's centre, its turn) against now's; drawn afresh when the sun's
    // stepped or the camera's gone 30 m. Its ~1400 draws: the shadows' CPU 10.7 ms a frame so 8.4 in a wood,
    // the GPU's ~0.5 ms. Drawn on the frames the sky's maps aren't, below)
    const Mnow = _mA.compose(this.anchor, qB, _one), F1 = this._f1;
    const camB = _cb.set(0, 0, 0).applyMatrix4(_mB.copy(Mnow).invert());
    const reuse = F1 && (this.frame & 1) === 0 && F1.held.equals(this.held) && F1.body === this.body && F1.camB.distanceTo(camB) < 30;
    CASCADES.forEach((c, i) => {
      const D = c.far * 6 + 2000, cam = this.cams[i];
      if (i > 0) { this._nearOnly(swapped, false); this._far(swapped); }
      if (i === 1 && reuse) {
        // (now's point -> then's: M0 M^-1; the light's place then -> now's: M M0^-1)
        _mC.copy(F1.M).multiply(_mB);
        U.uSunShadowVP1.value.multiplyMatrices(F1.vp, _mC);
        _mC.copy(Mnow).multiply(_mD.copy(F1.M).invert());
        const L = _v.copy(F1.L).applyMatrix4(_mC);
        U.uSunShadowL1.value.set(L.x, L.y, L.z, F1.texel);
        return;
      }
      const reach = c.far * 4 + 300;
      for (let k = 0, j = 0; k < swapped.length; k += 3, j++) {
        if (dist[j] === null) continue;
        const o = swapped[k];
        o.visible = dist[j] < reach && (i === 0 || !o.userData.shadowNearOnly);
      }
      const texel = this._place(cam, s, c.far, c.size, D, D + c.far * 1.5);
      this._region(renderer, SUN_ORG[i], c.size);
      renderer.render(scene, cam);
      U['uSunShadowVP' + i].value.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
      U['uSunShadowL' + i].value.set(cam.position.x, cam.position.y, cam.position.z, texel);
      if (i === 1) {
        const f = this._f1 || (this._f1 = { vp: new THREE.Matrix4(), M: new THREE.Matrix4(), L: new THREE.Vector3(), texel: 0, held: new THREE.Vector3(), camB: new THREE.Vector3(), body: null });
        f.vp.copy(U.uSunShadowVP1.value); f.M.copy(Mnow); f.L.copy(cam.position); f.texel = texel; f.held.copy(this.held); f.camB.copy(camB); f.body = this.body;
      }
    });
    for (let k = 0, j = 0; k < swapped.length; k += 3, j++) if (dist[j] !== null) swapped[k].visible = true;
    this._restore(swapped);
    U.uSunShadowDir.value.copy(s);
    U.uSunShadow.value.set(1, CASCADES[0].far, CASCADES[1].far, 0);
    // the grass's cover: its shares added (blending one to one, no depth), cleared to none
    if (this.cover === null) this.cover = !!(renderer.extensions.has('EXT_float_blend') && renderer.extensions.get('EXT_float_blend'));
    if (this.cover) {
      swapped = this._swap(scene, COVER_LAYER, 'coverMat');
      const cam = this.coverCam, D = COVER.far * 6 + 2000;
      this._place(cam, s, COVER.far, COVER.size, D, D + COVER.far * 3);
      renderer.setClearColor(0x000000, 1);
      this._region(renderer, COVER_ORG, COVER.size);
      renderer.render(scene, cam);
      renderer.setClearColor(0xffffff, 1);
      this._restore(swapped);
      U.uGrassCoverVP.value.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
      U.uGrassCover.value.set(1, COVER_ORG[0], COVER_ORG[1], COVER.size);
      // the trunks' hold on the sky round their feet, added likewise
      this._trunkMap(renderer, qB);
    } else { U.uGrassCover.value.x = 0; U.uTrunkSky.value.x = 0; U.uRockSky.value.x = 0; }
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
        this._rings(renderer, i);
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
const _one = new THREE.Vector3(1, 1, 1);
const _v = new THREE.Vector3(), _r = new THREE.Vector3(), _u = new THREE.Vector3(), _w = new THREE.Vector3(), _cb = new THREE.Vector3();
const _mA = new THREE.Matrix4(), _mB = new THREE.Matrix4(), _mC = new THREE.Matrix4(), _mD = new THREE.Matrix4();
const _m = new THREE.Matrix4(), _m2 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _c = new THREE.Color();
const _q2 = new THREE.Quaternion(), _sf = new THREE.Vector3(), _sh = new THREE.Vector3();
const _tc = new THREE.Vector3(), _tp = new THREE.Vector3(), _tu = new THREE.Vector3();
const HOLD_COS = Math.cos(0.1 * Math.PI / 180);

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
// the grass over a point beneath it (the ground, the snow between the blades): the blades' shares of the
// light along the sun, added (the cover map; the sun through them exp(-k sum), Beer's law); faded out at
// the map's edge; 0 none
uniform vec4 uGrassCover;
uniform mat4 uGrassCoverVP;
float grassCover(vec3 wp) {
  if (uGrassCover.x < 0.5) return 0.0;
  vec4 c = uGrassCoverVP * vec4(wp, 1.0);
  vec2 uv = c.xy / c.w * 0.5 + 0.5;
  float e = max(abs(uv.x * 2.0 - 1.0), abs(uv.y * 2.0 - 1.0));
  if (e >= 1.0) return 0.0;
  int n = int(uGrassCover.w);
  vec2 st = uv * uGrassCover.w - 0.5, fr = fract(st);
  ivec2 p0 = ivec2(floor(st)), org = ivec2(uGrassCover.yz), hi = ivec2(n - 1);
  float a = texelFetch(tShadowAtlas, org + clamp(p0, ivec2(0), hi), 0).r;
  float b = texelFetch(tShadowAtlas, org + clamp(p0 + ivec2(1, 0), ivec2(0), hi), 0).r;
  float d = texelFetch(tShadowAtlas, org + clamp(p0 + ivec2(0, 1), ivec2(0), hi), 0).r;
  float f = texelFetch(tShadowAtlas, org + clamp(p0 + ivec2(1, 1), ivec2(0), hi), 0).r;
  float sum = mix(mix(a, b, fr.x), mix(d, f, fr.x), fr.y);
  return sum * (1.0 - smoothstep(0.75, 1.0, e));
}
// the sky a point sees past the trunks round it (1 all of it): their shares hidden, added as -ln(1 - share)
// (the trunks' map); faded out at the map's edge. At a trunk's foot half the sky (the trunk a wall
// there), a sixth two radii out, a twelfth at four: in any weather the ground darkened round its foot
uniform vec4 uTrunkSky;
uniform vec4 uRockSky;
uniform mat4 uTrunkSkyVP;
// (a map's sum round wp, its corner of the atlas at o: 0 off the map)
float atlasSum(vec2 o, vec3 wp) {
  vec4 c = uTrunkSkyVP * vec4(wp, 1.0);
  vec2 uv = c.xy / c.w * 0.5 + 0.5;
  float e = max(abs(uv.x * 2.0 - 1.0), abs(uv.y * 2.0 - 1.0));
  if (e >= 1.0) return 0.0;
  int n = int(uTrunkSky.w);
  vec2 st = uv * uTrunkSky.w - 0.5, fr = fract(st);
  ivec2 p0 = ivec2(floor(st)), org = ivec2(o), hi = ivec2(n - 1);
  float a = texelFetch(tShadowAtlas, org + clamp(p0, ivec2(0), hi), 0).r;
  float b = texelFetch(tShadowAtlas, org + clamp(p0 + ivec2(1, 0), ivec2(0), hi), 0).r;
  float d = texelFetch(tShadowAtlas, org + clamp(p0 + ivec2(0, 1), ivec2(0), hi), 0).r;
  float f = texelFetch(tShadowAtlas, org + clamp(p0 + ivec2(1, 1), ivec2(0), hi), 0).r;
  float sum = mix(mix(a, b, fr.x), mix(d, f, fr.x), fr.y);
  return sum * (1.0 - smoothstep(0.75, 1.0, e));
}
// (the trunks' sum round wp: 0.69 at a trunk, 0.18 two radii out, 0.08 at four)
float trunkSum(vec3 wp) { return uTrunkSky.x < 0.5 ? 0.0 : atlasSum(uTrunkSky.yz, wp); }
// (the rocks': a boulder hides the sky round its foot as a short wide trunk)
float rockSum(vec3 wp) { return uRockSky.x < 0.5 ? 0.0 : atlasSum(uRockSky.yz, wp); }
float trunkSky(vec3 wp) { return exp(-trunkSum(wp) - rockSum(wp)); }
`;

// the sky a receiver sees past the canopy (1 all of it; after GLSL_SUN_SHADOW, whose atlas it reads): wp
// the point (camera-relative world). From the
// map overhead round it, rings of taps out to 45 m (under a closed canopy 12 m up, nine tenths of the sky): where the canopy's top stands dh over the point at a
// tap in a ring between radii a and b, it hides the sky between zenith angles atan(a/dh) and atan(b/dh),
// b^2/(b^2+dh^2) - a^2/(a^2+dh^2) of the sky's light (cosine-weighted); the leaves let a little through
// the trunks' sum for a vertex shader (one read, nearest: a grass blade's root), with its own uniforms
export const GLSL_TRUNK_VS = /* glsl */`
uniform vec4 uTrunkSky;
uniform mat4 uTrunkSkyVP;
uniform highp sampler2D tShadowAtlas;
float trunkSumV(vec3 wp) {
  if (uTrunkSky.x < 0.5) return 0.0;
  vec4 c = uTrunkSkyVP * vec4(wp, 1.0);
  vec2 uv = c.xy / c.w * 0.5 + 0.5;
  if (any(lessThan(uv, vec2(0.0))) || any(greaterThan(uv, vec2(1.0)))) return 0.0;
  int n = int(uTrunkSky.w);
  return texelFetch(tShadowAtlas, ivec2(uTrunkSky.yz) + clamp(ivec2(uv * uTrunkSky.w), ivec2(0), ivec2(n - 1)), 0).r;
}
`;

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
uniform highp sampler2D tSkyRings;
uniform vec2 uSkyD;
// (one ring's part of the sky hidden: sc its canopy's mean share and share-times-top (RINGS_FRAG), the ring
// a to b m out, d the point's depth below the map's camera less its bias; the canopy above it hides the
// sky between the elevations its edges subtend, cosine-weighted)
float skyRing(vec2 sc, float d, float D, float a, float b) {
  if (sc.r <= 0.003) return 0.0;
  float dh = d - (D + sc.g / sc.r);
  if (dh <= 0.0) return 0.0;
  float h2 = dh * dh;
  return sc.r * (b * b / (b * b + h2) - a * a / (a * a + h2 + 1e-6));
}
float skyShadowMap(float u0, float D, mat4 VP, vec4 L, vec3 upF, float ext, vec3 pF) {
  vec4 c = VP * vec4(pF, 1.0);
  vec2 uv = c.xy / c.w * 0.5 + 0.5;
  float edge = 45.0 / (2.0 * ext);
  if (any(lessThan(uv, vec2(edge))) || any(greaterThan(uv, vec2(1.0 - edge)))) return -1.0;
  uv = clamp(uv, vec2(0.5 / ${SKY_RN.toFixed(1)}), vec2(1.0 - 0.5 / ${SKY_RN.toFixed(1)}));
  const float NB = ${(3 * SKY_CASCADES.length).toFixed(1)};
  float x0 = u0 * 3.0;
  // (no canopy anywhere near: its mean over 180 m, nothing. Most of an open view's ground)
  vec4 C = textureLod(tSkyRings, vec2((x0 + 2.0 + uv.x) / NB, uv.y), 0.0);
  if (C.b < 0.002) return 0.0;
  vec4 A = textureLod(tSkyRings, vec2((x0 + uv.x) / NB, uv.y), 0.0);
  vec4 B = textureLod(tSkyRings, vec2((x0 + 1.0 + uv.x) / NB, uv.y), 0.0);
  // (a bias: the point's own leaves, a texel and a little more, aren't over it)
  float d = dot(L.xyz - pF, upF) - (0.3 + 1.5 * L.w);
  return clamp(skyRing(A.xy, d, D, 0.0, 1.0) + skyRing(A.zw, d, D, 1.0, 3.5) + skyRing(B.xy, d, D, 3.5, 9.0) + skyRing(B.zw, d, D, 9.0, 20.0) + skyRing(C.xy, d, D, 20.0, 45.0), 0.0, 1.0);
}
// how much of the sky (cosine-weighted) the canopy hides from wp, 0..1
float skyBlocked(vec3 wp) {
  if (uSkyShadow.x < 0.5) return 0.0;
  float dist = length(wp);
  if (dist > uSkyShadow.z) return 0.0;
  vec3 pF = uSkyToFixed * (wp - uSkyCenter);
  float bl = -1.0;
  if (dist < uSkyShadow.y) bl = skyShadowMap(0.0, uSkyD.x, uSkyShadowVP0, uSkyShadowL0, uSkyShadowUp0, uSkyShadow.y, pF);
  if (bl < 0.0) bl = skyShadowMap(1.0, uSkyD.y, uSkyShadowVP1, uSkyShadowL1, uSkyShadowUp1, uSkyShadow.z, pF);
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
    float shT = trunkSky(vShWorld);
    reflectedLight.indirectDiffuse *= (1.0 - shB) * shT; reflectedLight.indirectSpecular *= (1.0 - shB) * shT;
    reflectedLight.indirectDiffuse += BRDF_Lambert(material.diffuseColor) * shB * 0.1 * (uCanopySun + uCanopySky) * uLeafTint;
  }`);
  };
  const key = own ? own.toString() : '';
  mat.customProgramCacheKey = () => 'shadowed|' + key;
  mat.needsUpdate = true;
  return mat;
}
