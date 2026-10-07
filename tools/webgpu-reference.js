// Test-only WebGL reference. Never imported by a normal game launch.
import * as THREE from 'three';
import { FULLSCREEN_VERT } from '../src/render/glsl.js';
import { renderFullscreen } from '../src/render/atmosphere.js';
import { recordPasses } from '../src/render/webgpu/record.js';
import { passes } from '../src/render/webgpu/generated/passes.js';
function hdrTarget(w, h, opts = {}) {
  return new THREE.WebGLRenderTarget(w, h, {
    type: THREE.HalfFloatType, format: THREE.RGBAFormat,
    minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
    depthBuffer: false, stencilBuffer: false, generateMipmaps: false, ...opts,
  });
}

// One view of the world: its own camera, render targets and eye adaptation,
// drawn into its own rectangle of the canvas (the whole of it, or one half
// of a split screen). The same pipeline will draw into a texture for screens
// inside the world (a viewscreen).

export function create(engine,opts){
 const canvas=document.createElement('canvas');
 let renderer=new THREE.WebGLRenderer({canvas,antialias:false,alpha:false,stencil:false,depth:true,powerPreference:'high-performance',reversedDepthBuffer:opts.reversedDepth!==false});
 engine.reversed=renderer.capabilities.reversedDepthBuffer;
 if(!engine.reversed){renderer.dispose();renderer=new THREE.WebGLRenderer({canvas,antialias:false,alpha:false,stencil:false,depth:true,powerPreference:'high-performance',logarithmicDepthBuffer:true});}
 renderer.outputColorSpace=THREE.LinearSRGBColorSpace;renderer.toneMapping=THREE.NoToneMapping;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.autoClear=false;
 recordPasses(renderer,passes.map(p=>p.key));engine._render=referenceRender;engine.passBegin=engine.passEnd=()=>{};
 return renderer;
}
function referenceRender(dt, sky, atmos, animate) {
    const r = this.renderer;
    const V = this.view;
    const cam = V.camera;
    if (animate) this.time += dt;
    cam.updateMatrixWorld();
    const camRot = new THREE.Matrix3().setFromMatrix4(cam.matrixWorld);
    const tanHalf = this.tanHalf;

    // 0. the near sun shadows' maps (once a frame)
    if (animate && this.sunShadows) { this.passBegin('shadows'); this.sunShadows.render(r, this.scene); this.passEnd(); }
    // 1. opaque scene into the HDR target
    this.passBegin('scene');
    r.setRenderTarget(V.rtScene);
    r.setClearColor(0x000000, 1);
    r.clear(true, true, false);
    r.render(this.scene, cam);
    this.passEnd();

    // 1b. the rivers' water
    if (this.waterScene.children.length && this.syncOwned(this.waterScene)) {
      this.passBegin('water');
      // (copies of the image and its depth: read where the water's drawn, into the image itself)
      this._copyMat = this._copyMat || new THREE.ShaderMaterial({ uniforms: { tSrc: { value: null } }, vertexShader: FULLSCREEN_VERT, fragmentShader: 'uniform sampler2D tSrc; varying vec2 vUv; void main(){ gl_FragColor = texture(tSrc, vUv); }', depthTest: false, depthWrite: false });
      this._depthCopyMat = this._depthCopyMat || new THREE.ShaderMaterial({ uniforms: { tSrc: { value: null } }, vertexShader: FULLSCREEN_VERT, fragmentShader: 'uniform sampler2D tSrc; void main(){ gl_FragColor = vec4(texelFetch(tSrc, ivec2(gl_FragCoord.xy), 0).r, 0.0, 0.0, 1.0); }', depthTest: false, depthWrite: false });
      if (!V.rtWaterDepth) V.rtWaterDepth = new THREE.WebGLRenderTarget(V.width, V.height, { type: THREE.FloatType, format: THREE.RedFormat, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, depthBuffer: false, stencilBuffer: false, generateMipmaps: false });
      if (V.rtWaterDepth.width !== V.width || V.rtWaterDepth.height !== V.height) V.rtWaterDepth.setSize(V.width, V.height);
      this._copyMat.uniforms.tSrc.value = V.rtScene.texture;
      renderFullscreen(r, this._copyMat, V.rtA);
      this._depthCopyMat.uniforms.tSrc.value = V.depthTex;
      renderFullscreen(r, this._depthCopyMat, V.rtWaterDepth);
      const wu = this.waterUniforms;
      wu.tOpaque.value = V.rtA.texture; wu.tWaterDepth.value = V.rtWaterDepth.texture;
      wu.uZMode.value = this.depthMode; wu.uZNear.value = this.near; wu.uZFar.value = this.far; wu.uZLogFC.value = Math.log2(this.far + 1);
      r.setRenderTarget(V.rtScene);
      r.render(this.waterScene, cam);
      this.passEnd();
    }

    // 2. background where nothing was drawn
    const bg = this.bgMat.uniforms;
    bg.tColor.value = V.rtScene.texture;
    bg.tDepth.value = V.depthTex;
    bg.tSky.value = sky ? sky.cubeRT.texture : null;
    bg.uCamRot.value.copy(camRot);
    bg.uTanHalf.value.copy(tanHalf);
    this.passBegin('background');
    renderFullscreen(r, this.bgMat, V.rtA);
    this.passEnd();
    let src = V.rtA, dst = V.rtB;

    // 3. atmospheres
    for (const a of atmos) {
      const u = a.material.uniforms;
      u.tColor.value = src.texture;
      u.tDepth.value = V.depthTex;
      u.uCamRot.value.copy(camRot);
      u.uTanHalf.value.copy(tanHalf);
      u.uDepthMode.value = this.depthMode;
      u.uNear.value = this.near; u.uFar.value = this.far; u.uLogDepthFC.value = Math.log2(this.far + 1);
      if (u.uSteps && u.uSigma === undefined) u.uTime.value = this.time;
      this.passBegin(a.material.uniforms.uSigma ? 'volume' : 'atmosphere');
      if (a.halfRes) {
        renderFullscreen(r, a.material, V.rtVolume);
        this.passEnd();
        this.passBegin('composite');
        const c = this.volCompMat.uniforms;
        c.tColor.value = src.texture;
        c.tDepth.value = V.depthTex;
        c.tL.value = V.rtVolume.textures[0];
        c.tT.value = V.rtVolume.textures[1];
        c.uLowSize.value.set(V.rtVolume.width, V.rtVolume.height);
        c.uDepthMode.value = this.depthMode;
        renderFullscreen(r, this.volCompMat, dst);
      } else renderFullscreen(r, a.material, dst);
      this.passEnd();
      const t = src; src = dst; dst = t;
    }

    // 3a. soft particles, by hand against the scene's depth (src has none attached: no feedback)
    if (this.softScene.children.length && this.syncOwned(this.softScene)) {
      this.passBegin('soft');
      const su = this.softUniforms;
      su.tSceneDepth.value = V.depthTex; su.uDepthMode.value = this.depthMode; su.uNear.value = this.near; su.uFar.value = this.far; su.uLogDepthFC.value = Math.log2(this.far + 1); su.uPixH.value = V.height;
      r.setRenderTarget(src);
      r.render(this.softScene, cam);
      this.passEnd();
    }

    // 3b. additive / transparent effects (plumes, particles) on top, depth-tested
    let anyFx = false;
    this.transparentScene.traverseVisible((o) => { if (o.isMesh) anyFx = true; });
    if (anyFx) {
      this.passBegin('transparent');
      // draw into src using the scene depth: re-bind via a temporary target sharing depth
      if (!V.fxTarget) V.fxTarget = hdrTarget(V.width, V.height, { depthBuffer: true, depthTexture: V.depthTex });
      if (V.fxTarget.width !== V.width || V.fxTarget.height !== V.height) V.fxTarget.setSize(V.width, V.height);
      // copy src into fx target color, then render transparents
      this._copyMat = this._copyMat || new THREE.ShaderMaterial({ uniforms: { tSrc: { value: null } }, vertexShader: FULLSCREEN_VERT, fragmentShader: 'uniform sampler2D tSrc; varying vec2 vUv; void main(){ gl_FragColor = texture(tSrc, vUv); }', depthTest: false, depthWrite: false });
      this._copyMat.uniforms.tSrc.value = src.texture;
      renderFullscreen(r, this._copyMat, V.fxTarget);
      r.setRenderTarget(V.fxTarget);
      r.render(this.transparentScene, cam);
      src = V.fxTarget;
      this.passEnd();
    }

    V.lastHDR = src; // (debug readback)

    // 4. eye adaptation
    this.passBegin('post');
    this.lumMat.uniforms.tColor.value = src.texture;
    this.lumMat.uniforms.uRef.value = V.meterRef;
    this.lumMat.uniforms.tDepth.value = V.depthTex;
    this.lumMat.uniforms.uNearCut.value = V.meterNearCut || 0;
    this.lumMat.uniforms.uDepthMode.value = this.depthMode;
    renderFullscreen(r, this.lumMat, V.rtLum);
    const prev = V.rtAdapt[V.adaptIdx], next = V.rtAdapt[1 - V.adaptIdx];
    this.adaptMat.uniforms.tLum.value = V.rtLum.texture;
    this.adaptMat.uniforms.tPrev.value = prev.texture;
    this.adaptMat.uniforms.uDt.value = Math.min(dt, 0.25);
    this.adaptMat.uniforms.uReset.value = V.adaptReset ? 1 : 0;
    this.adaptMat.uniforms.uRef.value = V.meterRef;
    this.adaptMat.uniforms.uUp.value = this.meterUp;
    this.adaptMat.uniforms.uDown.value = this.meterDown;
    this.adaptMat.uniforms.uStrength.value = this.meterStrength;
    V.adaptReset = false;
    renderFullscreen(r, this.adaptMat, next);
    V.adaptIdx = 1 - V.adaptIdx;
    const adapt = next.texture;

    // 5. bloom
    let bloomTex = null;
    if (V.bloomLevels.length && this.bloomStrength > 0) {
      const b = this.brightMat.uniforms;
      b.tColor.value = src.texture; b.tAdapt.value = adapt;
      b.uTexel.value.set(1 / V.width, 1 / V.height);
      b.uMinExp.value = this.minExposure; b.uMaxExp.value = V.maxExposure; b.uNightShift.value = V.nightShift || 0;
      renderFullscreen(r, this.brightMat, V.bloomLevels[0]);
      for (let i = 1; i < V.bloomLevels.length; i++) {
        const s = V.bloomLevels[i - 1];
        this.downMat.uniforms.tSrc.value = s.texture;
        this.downMat.uniforms.uTexel.value.set(1 / s.width, 1 / s.height);
        renderFullscreen(r, this.downMat, V.bloomLevels[i]);
      }
      let up = V.bloomLevels[V.bloomLevels.length - 1];
      for (let i = V.bloomLevels.length - 2; i >= 0; i--) {
        this.upMat.uniforms.tSrc.value = up.texture;
        this.upMat.uniforms.tBase.value = V.bloomLevels[i].texture;
        this.upMat.uniforms.uTexel.value.set(1 / up.width, 1 / up.height);
        this.upMat.uniforms.uRadius.value = 1.0;
        renderFullscreen(r, this.upMat, V.bloomUp[i]);
        up = V.bloomUp[i];
      }
      bloomTex = up.texture;
    }

    // 6. tonemap into the view's rectangle of the canvas
    const t = this.toneMat.uniforms;
    t.tColor.value = src.texture;
    t.tBloom.value = bloomTex;
    t.tAdapt.value = adapt;
    t.uExposureBias.value = V.exposureBias;
    t.uFlash.value = V.flash;
    t.uNightShift.value = V.nightShift || 0;
    t.uToneCurve.value = this.toneCurve === 'aces' ? 0 : 1;
    t.uBloom.value = bloomTex ? this.bloomStrength * 0.06 : 0;
    t.uTime.value = this.time;
    t.uVignette.value = this.vignette + (V.radialBlur || 0) * 0.4;
    t.uRadial.value = V.radialBlur || 0;
    t.uMinExp.value = this.minExposure; t.uMaxExp.value = V.maxExposure;
    t.uEncode.value = V.out ? 0 : 1;
    if (V.out) renderFullscreen(r, this.toneMat, V.out);
    else {
      const rc = V.rect;
      r.setViewport(rc.x, (this.cssH || rc.h) - rc.y - rc.h, rc.w, rc.h); // (GL: from the bottom)
      renderFullscreen(r, this.toneMat, null);
    }
    this.passEnd();
  }
