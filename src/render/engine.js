// Rendering engine: camera-relative (floating origin) scene, HDR pipeline.
//
// Frame: main scene -> HDR target with float depth
//        background (sky cubemap) where depth is empty
//        atmosphere passes (far to near), each a full-screen march
//        luminance -> eye adaptation -> bloom -> tonemap to screen
// The Three camera always sits at the origin; every object is positioned at
// (world - cameraWorld) in double precision before Three builds matrices.

import * as THREE from 'three';
import { FULLSCREEN_VERT, GLSL_DEPTH } from './glsl.js';
import { renderFullscreen } from './atmosphere.js';
import { VOLUME_COMPOSITE_FRAG } from './volume.js';

const BG_FRAG = /* glsl */`
${GLSL_DEPTH}
uniform sampler2D tColor;
uniform sampler2D tDepth;
uniform samplerCube tSky;
uniform mat3 uCamRot;
uniform vec2 uTanHalf;
uniform float uSkyGain;
varying vec2 vUv;
void main() {
  vec4 c = texture(tColor, vUv);
  float d = texture(tDepth, vUv).r;
  if (isSkyDepth(d)) {
    vec2 ndc = vUv * 2.0 - 1.0;
    vec3 dv = normalize(vec3(ndc.x * uTanHalf.x, ndc.y * uTanHalf.y, -1.0));
    vec3 D = uCamRot * dv;
    c.rgb += texture(tSky, D).rgb * uSkyGain;
  }
  gl_FragColor = vec4(c.rgb, 1.0);
}
`;

const LUM_FRAG = /* glsl */`
uniform sampler2D tColor;
varying vec2 vUv;
void main() {
  vec3 c = vec3(0.0);
  c += texture(tColor, vUv + vec2(-0.25, -0.25) / 128.0).rgb;
  c += texture(tColor, vUv + vec2(0.25, -0.25) / 128.0).rgb;
  c += texture(tColor, vUv + vec2(-0.25, 0.25) / 128.0).rgb;
  c += texture(tColor, vUv + vec2(0.25, 0.25) / 128.0).rgb;
  float l = dot(c * 0.25, vec3(0.2126, 0.7152, 0.0722));
  // centre-weighted mean of clamped linear luminance: exposes for the lit
  // subject (a geometric mean would be dominated by black sky), while the
  // clamp keeps a tiny sun disk from crushing the whole frame
  float w = 1.0 - 0.6 * length(vUv - 0.5);
  float lc = clamp(l, 0.0, 24.0);
  // mean and energy-weighted (squared) mean: small bright subjects against
  // black space should still pull the exposure down
  // alpha: 4th-power mean, which tracks a bright subject covering only a few
  // percent of the frame. Scaled x20 so sunlit values (~0.05) stay well inside
  // half-float range; clamped at 0.6 so the sun disk itself cannot dominate.
  float l4 = min(l * 20.0, 12.0);
  l4 *= l4;
  gl_FragColor = vec4(lc * w, w, lc * lc * w, l4 * l4 * w);
}
`;

const ADAPT_FRAG = /* glsl */`
uniform sampler2D tLum;
uniform sampler2D tPrev;
uniform float uDt;
uniform float uLevel;
uniform float uReset;
varying vec2 vUv;
void main() {
  vec4 m = textureLod(tLum, vec2(0.5), uLevel);
  float mean = m.x / max(m.y, 1e-4);
  float rms = sqrt(max(m.z / max(m.y, 1e-4), 0.0));
  float p4 = sqrt(sqrt(max(m.a / max(m.y, 1e-4), 0.0))) / 20.0;
  float avg = log2(max(max(max(mean, rms * 0.3), p4 * 0.5), 1e-7));
  float prev = texture(tPrev, vec2(0.5)).r;
  float speed = avg > prev ? 1.6 : 0.9; // adapt to bright faster than to dark
  float k = uReset > 0.5 ? 1.0 : 1.0 - exp(-uDt * speed);
  gl_FragColor = vec4(mix(prev, avg, k), 0.0, 0.0, 1.0);
}
`;

const BRIGHT_FRAG = /* glsl */`
uniform sampler2D tColor;
uniform sampler2D tAdapt;
uniform float uKey;
uniform float uMinExp;
uniform float uMaxExp;
uniform vec2 uTexel;
varying vec2 vUv;
void main() {
  float exposure = clamp(uKey / exp2(texture(tAdapt, vec2(0.5)).r), uMinExp, uMaxExp);
  vec3 c = vec3(0.0);
  c += texture(tColor, vUv + uTexel * vec2(-1.0, -1.0)).rgb;
  c += texture(tColor, vUv + uTexel * vec2(1.0, -1.0)).rgb;
  c += texture(tColor, vUv + uTexel * vec2(-1.0, 1.0)).rgb;
  c += texture(tColor, vUv + uTexel * vec2(1.0, 1.0)).rgb;
  c *= 0.25 * exposure;
  float l = max(max(c.r, c.g), c.b);
  float soft = clamp(l - 0.8, 0.0, 2.0);
  soft = soft * soft / 8.0;
  float contrib = max(soft, l - 1.6) / max(l, 1e-5);
  gl_FragColor = vec4(min(c * contrib, vec3(4000.0)), 1.0);
}
`;

const DOWN_FRAG = /* glsl */`
uniform sampler2D tSrc;
uniform vec2 uTexel;
varying vec2 vUv;
void main() {
  // 13-tap downsample (Jimenez 2014)
  vec3 a = texture(tSrc, vUv + uTexel * vec2(-2.0, 2.0)).rgb;
  vec3 b = texture(tSrc, vUv + uTexel * vec2(0.0, 2.0)).rgb;
  vec3 c = texture(tSrc, vUv + uTexel * vec2(2.0, 2.0)).rgb;
  vec3 d = texture(tSrc, vUv + uTexel * vec2(-2.0, 0.0)).rgb;
  vec3 e = texture(tSrc, vUv).rgb;
  vec3 f = texture(tSrc, vUv + uTexel * vec2(2.0, 0.0)).rgb;
  vec3 g = texture(tSrc, vUv + uTexel * vec2(-2.0, -2.0)).rgb;
  vec3 h = texture(tSrc, vUv + uTexel * vec2(0.0, -2.0)).rgb;
  vec3 i = texture(tSrc, vUv + uTexel * vec2(2.0, -2.0)).rgb;
  vec3 j = texture(tSrc, vUv + uTexel * vec2(-1.0, 1.0)).rgb;
  vec3 k = texture(tSrc, vUv + uTexel * vec2(1.0, 1.0)).rgb;
  vec3 l = texture(tSrc, vUv + uTexel * vec2(-1.0, -1.0)).rgb;
  vec3 m = texture(tSrc, vUv + uTexel * vec2(1.0, -1.0)).rgb;
  vec3 r = e * 0.125 + (a + c + g + i) * 0.03125 + (b + d + f + h) * 0.0625 + (j + k + l + m) * 0.125;
  gl_FragColor = vec4(r, 1.0);
}
`;

const UP_FRAG = /* glsl */`
uniform sampler2D tSrc;
uniform sampler2D tBase;
uniform vec2 uTexel;
uniform float uRadius;
varying vec2 vUv;
void main() {
  vec2 o = uTexel * uRadius;
  vec3 s = texture(tSrc, vUv + vec2(-o.x, o.y)).rgb + 2.0 * texture(tSrc, vUv + vec2(0.0, o.y)).rgb + texture(tSrc, vUv + o).rgb
    + 2.0 * texture(tSrc, vUv + vec2(-o.x, 0.0)).rgb + 4.0 * texture(tSrc, vUv).rgb + 2.0 * texture(tSrc, vUv + vec2(o.x, 0.0)).rgb
    + texture(tSrc, vUv - o).rgb + 2.0 * texture(tSrc, vUv + vec2(0.0, -o.y)).rgb + texture(tSrc, vUv + vec2(o.x, -o.y)).rgb;
  gl_FragColor = vec4(texture(tBase, vUv).rgb + s / 16.0, 1.0);
}
`;

const TONEMAP_FRAG = /* glsl */`
uniform sampler2D tColor;
uniform sampler2D tBloom;
uniform sampler2D tAdapt;
uniform float uKey;
uniform float uMinExp;
uniform float uMaxExp;
uniform float uExposureBias;
uniform float uBloom;
uniform vec3 uWhiteBalance;
uniform float uTime;
uniform float uVignette;
uniform vec3 uFlash;
uniform float uRadial;
varying vec2 vUv;
vec3 aces(vec3 x) {
  const float a = 2.51, b = 0.03, c = 2.43, d = 0.59, e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}
vec3 toSRGB(vec3 c) {
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}
void main() {
  float exposure = clamp(uKey / exp2(texture(tAdapt, vec2(0.5)).r), uMinExp, uMaxExp) * uExposureBias;
  vec3 c = texture(tColor, vUv).rgb;
  if (uRadial > 0.001) {
    // FTL: radial streaks + blue shift ahead
    vec2 d = vUv - 0.5;
    vec3 acc = c;
    for (int i = 1; i < 10; i++) acc += texture(tColor, 0.5 + d * (1.0 - uRadial * 0.05 * float(i))).rgb;
    c = mix(c, acc / 10.0 * vec3(0.85, 0.95, 1.25), clamp(uRadial, 0.0, 1.0));
  }
  c *= exposure;
  c += texture(tBloom, vUv).rgb * uBloom;
  c *= uWhiteBalance;
  c += uFlash;
  float v = 1.0 - uVignette * pow(length(vUv - 0.5) * 1.25, 2.4);
  c *= v;
  c = aces(c);
  // blue-noise-ish dither to hide banding in skies
  float n = fract(sin(dot(gl_FragCoord.xy + uTime, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
  gl_FragColor = vec4(toSRGB(c) + n / 255.0, 1.0);
}
`;

function hdrTarget(w, h, opts = {}) {
  return new THREE.WebGLRenderTarget(w, h, {
    type: THREE.HalfFloatType, format: THREE.RGBAFormat,
    minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
    depthBuffer: false, stencilBuffer: false, generateMipmaps: false, ...opts,
  });
}

export class Engine {
  constructor(canvas, opts = {}) {
    const tryReversed = opts.reversedDepth !== false;
    let renderer = new THREE.WebGLRenderer({
      canvas, antialias: false, alpha: false, stencil: false, depth: true,
      powerPreference: 'high-performance', reversedDepthBuffer: tryReversed,
      logarithmicDepthBuffer: false,
    });
    this.reversed = !!(renderer.capabilities.reversedDepthBuffer);
    if (!this.reversed) {
      renderer.dispose();
      renderer = new THREE.WebGLRenderer({
        canvas, antialias: false, alpha: false, stencil: false, depth: true,
        powerPreference: 'high-performance', logarithmicDepthBuffer: true,
      });
    }
    this.renderer = renderer;
    // a shader that fails to compile silently drops whatever it draws: surface it
    renderer.debug.onShaderError = (gl, program, vs, fs) => {
      const log = [vs, fs].map((sh) => gl.getShaderInfoLog(sh) || '').join(' ').trim();
      const msg = `Shader compile failed: ${log || gl.getProgramInfoLog(program)}`;
      console.error(msg);
      window.dispatchEvent(new ErrorEvent('error', { message: msg }));
    };
    renderer.autoClear = false;
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderScale = opts.renderScale || 1;
    this.near = 0.05;
    this.far = 1e13;
    this.camera = new THREE.PerspectiveCamera(70, 1, this.near, this.far);
    this.camera.matrixAutoUpdate = true;
    this.scene = new THREE.Scene();
    this.scene.matrixWorldAutoUpdate = true;
    this.transparentScene = new THREE.Scene();
    this.atmospheres = []; // {atmo, active} set per frame
    this.exposureBias = 1;
    this.bloomStrength = 0.9;
    this.whiteBalance = new THREE.Vector3(1, 1, 1);
    this.flash = new THREE.Vector3(0, 0, 0);
    this.vignette = 0.35;
    this.time = 0;
    this.adaptReset = true;
    this.minExposure = 0.04;
    this.maxExposure = 260;
    this._buildTargets();
    this._buildMaterials();
    this.resize();
  }

  get depthMode() { return this.reversed ? 0 : 1; }

  _buildTargets() {
    const w = 4, h = 4;
    this.depthTex = new THREE.DepthTexture(w, h, THREE.FloatType);
    this.depthTex.format = THREE.DepthFormat;
    this.depthTex.minFilter = THREE.NearestFilter;
    this.depthTex.magFilter = THREE.NearestFilter;
    this.rtScene = hdrTarget(w, h, { depthBuffer: true, depthTexture: this.depthTex });
    this.rtA = hdrTarget(w, h);
    this.rtB = hdrTarget(w, h);
    // transparent pass shares the scene depth
    this.rtLum = hdrTarget(128, 128, { minFilter: THREE.LinearMipmapLinearFilter, generateMipmaps: true });
    this.rtAdapt = [hdrTarget(1, 1, { type: THREE.FloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter }),
      hdrTarget(1, 1, { type: THREE.FloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter })];
    this.adaptIdx = 0;
    this.bloomLevels = [];
    // half-resolution volume pass output: [0] in-scattered light, [1] transmittance
    this.rtVolume = new THREE.WebGLRenderTarget(w, h, {
      count: 2, type: THREE.HalfFloatType, format: THREE.RGBAFormat,
      minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, depthBuffer: false, stencilBuffer: false,
    });
  }

  _buildMaterials() {
    const mk = (frag, uniforms) => new THREE.ShaderMaterial({ uniforms, vertexShader: FULLSCREEN_VERT, fragmentShader: frag, depthTest: false, depthWrite: false });
    const depthU = () => ({ uDepthMode: { value: this.depthMode }, uNear: { value: this.near }, uFar: { value: this.far }, uLogDepthFC: { value: Math.log2(this.far + 1) } });
    this.depthUniforms = depthU;
    this.bgMat = mk(BG_FRAG, { tColor: { value: null }, tDepth: { value: null }, tSky: { value: null }, uCamRot: { value: new THREE.Matrix3() }, uTanHalf: { value: new THREE.Vector2() }, uSkyGain: { value: 1 }, ...depthU() });
    this.lumMat = mk(LUM_FRAG, { tColor: { value: null } });
    this.adaptMat = mk(ADAPT_FRAG, { tLum: { value: this.rtLum.texture }, tPrev: { value: null }, uDt: { value: 0.016 }, uLevel: { value: 7 }, uReset: { value: 1 } });
    this.brightMat = mk(BRIGHT_FRAG, { tColor: { value: null }, tAdapt: { value: null }, uKey: { value: 0.18 }, uMinExp: { value: 0.04 }, uMaxExp: { value: 260 }, uTexel: { value: new THREE.Vector2() } });
    this.downMat = mk(DOWN_FRAG, { tSrc: { value: null }, uTexel: { value: new THREE.Vector2() } });
    this.upMat = mk(UP_FRAG, { tSrc: { value: null }, tBase: { value: null }, uTexel: { value: new THREE.Vector2() }, uRadius: { value: 1 } });
    this.volCompMat = mk(VOLUME_COMPOSITE_FRAG, { tColor: { value: null }, tDepth: { value: null }, tL: { value: null }, tT: { value: null }, uLowSize: { value: new THREE.Vector2() }, ...depthU() });
    this.toneMat = mk(TONEMAP_FRAG, {
      tColor: { value: null }, tBloom: { value: null }, tAdapt: { value: null },
      uKey: { value: 0.18 }, uMinExp: { value: 0.04 }, uMaxExp: { value: 260 }, uExposureBias: { value: 1 }, uBloom: { value: 0.9 },
      uWhiteBalance: { value: this.whiteBalance }, uTime: { value: 0 }, uVignette: { value: 0.35 }, uFlash: { value: this.flash }, uRadial: { value: 0 },
    });
  }

  resize() {
    const c = this.renderer.domElement;
    const w = c.clientWidth || window.innerWidth, h = c.clientHeight || window.innerHeight;
    const pr = Math.min(window.devicePixelRatio || 1, 2) * this.renderScale;
    this.renderer.setPixelRatio(pr);
    this.renderer.setSize(w, h, false);
    const W = Math.max(2, Math.floor(w * pr)), H = Math.max(2, Math.floor(h * pr));
    this.width = W; this.height = H; this.pixelRatio = pr;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.rtScene.setSize(W, H);
    this.rtA.setSize(W, H);
    this.rtB.setSize(W, H);
    this.rtVolume.setSize(Math.max(1, W >> 1), Math.max(1, H >> 1));
    for (const l of this.bloomLevels) l.dispose();
    this.bloomLevels = [];
    let bw = W >> 1, bh = H >> 1;
    for (let i = 0; i < 6 && bw >= 8 && bh >= 8; i++) {
      this.bloomLevels.push(hdrTarget(bw, bh));
      bw >>= 1; bh >>= 1;
    }
    this.bloomUp = this.bloomLevels.map((l) => hdrTarget(l.width, l.height));
  }

  setFov(deg) { this.camera.fov = deg; this.camera.updateProjectionMatrix(); }

  get tanHalf() {
    const t = Math.tan(THREE.MathUtils.degToRad(this.camera.fov) / 2);
    return new THREE.Vector2(t * this.camera.aspect, t);
  }

  // GPU timing (EXT_disjoint_timer_query_webgl2) for profiling
  gpuBegin() {
    const gl = this.renderer.getContext();
    if (this._tq === undefined) this._tq = gl.getExtension('EXT_disjoint_timer_query_webgl2');
    const ext = this._tq;
    if (!ext) return;
    this._queries = this._queries || [];
    // harvest finished queries
    while (this._queries.length) {
      const q = this._queries[0];
      if (!gl.getQueryParameter(q, gl.QUERY_RESULT_AVAILABLE)) break;
      if (!gl.getParameter(ext.GPU_DISJOINT_EXT)) {
        const ns = gl.getQueryParameter(q, gl.QUERY_RESULT);
        this.gpuMs = (this.gpuMs || 0) * 0.85 + ns / 1e6 * 0.15;
      }
      gl.deleteQuery(q);
      this._queries.shift();
    }
    if (this._queries.length > 4) return;
    const q = gl.createQuery();
    gl.beginQuery(ext.TIME_ELAPSED_EXT, q);
    this._activeQuery = q;
  }
  // optional fine-grained timing of individual passes (debug)
  passBegin(label) {
    if (!this.profilePasses || !this._tq) return;
    const gl = this.renderer.getContext();
    if (this._activeQuery) { gl.endQuery(this._tq.TIME_ELAPSED_EXT); this._queries.push(this._activeQuery); this._activeQuery = null; }
    this._passQ = this._passQ || [];
    const q = gl.createQuery();
    gl.beginQuery(this._tq.TIME_ELAPSED_EXT, q);
    this._passQ.push({ q, label });
    this._passActive = q;
  }
  passEnd() {
    if (!this.profilePasses || !this._passActive) return;
    const gl = this.renderer.getContext();
    gl.endQuery(this._tq.TIME_ELAPSED_EXT);
    this._passActive = null;
  }
  harvestPasses() {
    if (!this._passQ) return null;
    const gl = this.renderer.getContext();
    const out = {};
    const keep = [];
    for (const p of this._passQ) {
      if (gl.getQueryParameter(p.q, gl.QUERY_RESULT_AVAILABLE)) {
        out[p.label] = (out[p.label] || 0) + gl.getQueryParameter(p.q, gl.QUERY_RESULT) / 1e6;
        gl.deleteQuery(p.q);
      } else keep.push(p);
    }
    this._passQ = keep;
    return out;
  }

  gpuEnd() {
    if (!this._activeQuery) return;
    const gl = this.renderer.getContext();
    gl.endQuery(this._tq.TIME_ELAPSED_EXT);
    this._queries.push(this._activeQuery);
    this._activeQuery = null;
  }

  // atmos: list of {material, body}, ordered far -> near
  render(dt, sky, atmos) {
    this.gpuBegin();
    this._render(dt, sky, atmos);
    this.gpuEnd();
  }

  _render(dt, sky, atmos) {
    const r = this.renderer;
    const cam = this.camera;
    this.time += dt;
    cam.updateMatrixWorld();
    const camRot = new THREE.Matrix3().setFromMatrix4(cam.matrixWorld);
    const tanHalf = this.tanHalf;

    // 1. opaque scene into the HDR target
    this.passBegin('scene');
    r.setRenderTarget(this.rtScene);
    r.setClearColor(0x000000, 1);
    r.clear(true, true, false);
    r.render(this.scene, cam);
    this.passEnd();

    // 2. background where nothing was drawn
    const bg = this.bgMat.uniforms;
    bg.tColor.value = this.rtScene.texture;
    bg.tDepth.value = this.depthTex;
    bg.tSky.value = sky ? sky.cubeRT.texture : null;
    bg.uCamRot.value.copy(camRot);
    bg.uTanHalf.value.copy(tanHalf);
    this.passBegin('background');
    renderFullscreen(r, this.bgMat, this.rtA);
    this.passEnd();
    let src = this.rtA, dst = this.rtB;

    // 3. atmospheres
    for (const a of atmos) {
      const u = a.material.uniforms;
      u.tColor.value = src.texture;
      u.tDepth.value = this.depthTex;
      u.uCamRot.value.copy(camRot);
      u.uTanHalf.value.copy(tanHalf);
      u.uDepthMode.value = this.depthMode;
      u.uNear.value = this.near; u.uFar.value = this.far; u.uLogDepthFC.value = Math.log2(this.far + 1);
      if (u.uSteps && u.uSigma === undefined) u.uTime.value = this.time;
      this.passBegin(a.material.uniforms.uSigma ? 'volume' : 'atmosphere');
      if (a.halfRes) {
        renderFullscreen(r, a.material, this.rtVolume);
        this.passEnd();
        this.passBegin('composite');
        const c = this.volCompMat.uniforms;
        c.tColor.value = src.texture;
        c.tDepth.value = this.depthTex;
        c.tL.value = this.rtVolume.textures[0];
        c.tT.value = this.rtVolume.textures[1];
        c.uLowSize.value.set(this.rtVolume.width, this.rtVolume.height);
        c.uDepthMode.value = this.depthMode;
        renderFullscreen(r, this.volCompMat, dst);
      } else renderFullscreen(r, a.material, dst);
      this.passEnd();
      const t = src; src = dst; dst = t;
    }

    // 3b. additive / transparent effects (plumes, particles) on top, depth-tested
    let anyFx = false;
    this.transparentScene.traverseVisible((o) => { if (o.isMesh) anyFx = true; });
    if (anyFx) {
      this.passBegin('transparent');
      // draw into src using the scene depth: re-bind via a temporary target sharing depth
      if (!this._fxTarget) {
        this._fxTarget = hdrTarget(this.width, this.height, { depthBuffer: true, depthTexture: this.depthTex });
      }
      if (this._fxTarget.width !== this.width || this._fxTarget.height !== this.height) this._fxTarget.setSize(this.width, this.height);
      // copy src into fx target color, then render transparents
      this._copyMat = this._copyMat || new THREE.ShaderMaterial({ uniforms: { tSrc: { value: null } }, vertexShader: FULLSCREEN_VERT, fragmentShader: 'uniform sampler2D tSrc; varying vec2 vUv; void main(){ gl_FragColor = texture(tSrc, vUv); }', depthTest: false, depthWrite: false });
      this._copyMat.uniforms.tSrc.value = src.texture;
      renderFullscreen(r, this._copyMat, this._fxTarget);
      r.setRenderTarget(this._fxTarget);
      r.render(this.transparentScene, cam);
      src = this._fxTarget;
      this.passEnd();
    }

    // 4. eye adaptation
    this.passBegin('post');
    this.lumMat.uniforms.tColor.value = src.texture;
    renderFullscreen(r, this.lumMat, this.rtLum);
    const prev = this.rtAdapt[this.adaptIdx], next = this.rtAdapt[1 - this.adaptIdx];
    this.adaptMat.uniforms.tPrev.value = prev.texture;
    this.adaptMat.uniforms.uDt.value = Math.min(dt, 0.25);
    this.adaptMat.uniforms.uReset.value = this.adaptReset ? 1 : 0;
    this.adaptReset = false;
    renderFullscreen(r, this.adaptMat, next);
    this.adaptIdx = 1 - this.adaptIdx;
    const adapt = next.texture;

    // 5. bloom
    let bloomTex = null;
    if (this.bloomLevels.length && this.bloomStrength > 0) {
      const b = this.brightMat.uniforms;
      b.tColor.value = src.texture; b.tAdapt.value = adapt;
      b.uTexel.value.set(1 / this.width, 1 / this.height);
      b.uMinExp.value = this.minExposure; b.uMaxExp.value = this.maxExposure;
      renderFullscreen(r, this.brightMat, this.bloomLevels[0]);
      for (let i = 1; i < this.bloomLevels.length; i++) {
        const s = this.bloomLevels[i - 1];
        this.downMat.uniforms.tSrc.value = s.texture;
        this.downMat.uniforms.uTexel.value.set(1 / s.width, 1 / s.height);
        renderFullscreen(r, this.downMat, this.bloomLevels[i]);
      }
      let up = this.bloomLevels[this.bloomLevels.length - 1];
      for (let i = this.bloomLevels.length - 2; i >= 0; i--) {
        this.upMat.uniforms.tSrc.value = up.texture;
        this.upMat.uniforms.tBase.value = this.bloomLevels[i].texture;
        this.upMat.uniforms.uTexel.value.set(1 / up.width, 1 / up.height);
        this.upMat.uniforms.uRadius.value = 1.0;
        renderFullscreen(r, this.upMat, this.bloomUp[i]);
        up = this.bloomUp[i];
      }
      bloomTex = up.texture;
    }

    // 6. tonemap to the canvas
    const t = this.toneMat.uniforms;
    t.tColor.value = src.texture;
    t.tBloom.value = bloomTex;
    t.tAdapt.value = adapt;
    t.uExposureBias.value = this.exposureBias;
    t.uBloom.value = bloomTex ? this.bloomStrength * 0.06 : 0;
    t.uTime.value = this.time;
    t.uVignette.value = this.vignette + (this.radialBlur || 0) * 0.4;
    t.uRadial.value = this.radialBlur || 0;
    t.uMinExp.value = this.minExposure; t.uMaxExp.value = this.maxExposure;
    renderFullscreen(r, this.toneMat, null);
    this.passEnd();
  }
}
