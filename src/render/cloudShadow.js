// The clouds' light on the ground near the camera: a map, over a square of the ground round the point
// under the camera, of how much of the sun gets through the near volume's decks (volume.js: the clouds
// the sky draws there, their shapes and their wind) and how much of the sky's light the cloud overhead
// lets down. The ground's, the plants' and the rocks' shaders read it (atmosphere.js cloudLight);
// beyond it, the far shell's cover.
//
// Per texel, for the ground at the datum there: the sun's way up through the decks, marched (its optical
// depth: the decks' density times the volume's extinction, uSigma), its direct share exp(-tau); and the
// column overhead: its total transmission of the light falling on it, a cloud of optical depth tau
// scattering almost nothing away but sending it on mostly forward (water droplets, g ~0.85), about
// 1 / (1 + 3 (1 - g) tau / 4) (Bohren 1987: the two-stream result for a non-absorbing layer), and of
// that the part still direct (exp(-tau / mu)). Mipmapped: a level as wide as the patch of deck a point
// on the ground sees overhead is the sky dome's mean, what lights it diffusely.

import * as THREE from 'three';
import { FULLSCREEN_VERT } from './glsl.js';
import { GLSL_CLOUD_N } from './atmosphere.js';
import { GLSL_DECKS } from './volume.js';

export const CS_SIZE = 256;

export const CLOUD_SHADOW_FRAG = /* glsl */`
precision highp float;
precision highp sampler3D;
uniform sampler3D tNoise;
uniform sampler2D tCloudMap;
uniform float uCloudMapMean;
uniform float uRadius;
uniform vec4 uDeck[3];
uniform float uNumDecks;
uniform float uMode;
uniform float uSigma;
uniform vec2 uShape;
uniform float uBands;
uniform float uJetPhase;
uniform float uEqJet;
uniform float uWindMax;
uniform float uTime;
uniform vec3 uO;      // the patch's middle (body-fixed, on the datum)
uniform vec3 uE;      // its axes
uniform vec3 uN;
uniform float uL;     // its side (m)
uniform vec3 uSunF;   // the sun's way (body-fixed)
varying vec2 vUv;
out highp vec4 outC;
${GLSL_CLOUD_N}
${GLSL_DECKS}
// the distance from p (inside the sphere of radius rr) along unit d to it
float toRadius(vec3 p, vec3 d, float rr) { float b = dot(p, d), c = dot(p, p) - rr * rr; return -b + sqrt(max(b * b - c, 0.0)); }
// the decks' optical depth over n steps from p along d between distances t0 and t1
float tauAlong(vec3 p, vec3 d, float t0, float t1, float foot) {
  const int N = 8;
  float dt = (t1 - t0) / float(N), tau = 0.0;
  for (int s = 0; s < N; s++) {
    vec3 x = p + d * (t0 + (float(s) + 0.5) * dt);
    float r = length(x), h = r - uRadius, lat, fr;
    vec3 dirF;
    vec3 q = cloudCoordF(x, r, dirF, lat);
    for (int k = 0; k < 3; k++) {
      if (float(k) >= uNumDecks) break;
      if (h < uDeck[k].x || h > uDeck[k].y) continue;
      tau += deckDensity(k, q, h, coverage(k, dirF, q, foot), false, fr) * uSigma * dt;
    }
  }
  return tau;
}
void main() {
  vec2 xy = (vUv - 0.5) * uL;
  vec3 g = normalize(uO + uE * xy.x + uN * xy.y), G = g * uRadius;
  float sb = 1e9, st = -1e9;
  for (int i = 0; i < 3; i++) { if (float(i) >= uNumDecks) break; sb = min(sb, uDeck[i].x); st = max(st, uDeck[i].y); }
  float foot = uL / ${CS_SIZE}.0, muS = dot(g, uSunF);
  // (the sun's way up through the decks; none from below the horizon)
  float tauS = muS > 0.0 ? tauAlong(G, uSunF, toRadius(G, uSunF, uRadius + max(sb, 0.0)), toRadius(G, uSunF, uRadius + st), foot) : 30.0;
  // (and straight up)
  float tauU = tauAlong(G, g, max(sb, 0.0), st, foot);
  outC = vec4(exp(-tauS), 1.0 / (1.0 + 0.1125 * tauU), exp(-tauU / max(muS, 0.05)), 1.0);
}
`;

export class CloudShadow {
  // volume: the world's VolumePass (its decks' uniforms, shared); R: the datum's radius
  constructor(volume, R) {
    const vu = volume.material.uniforms;
    this.R = R;
    this.rt = new THREE.WebGLRenderTarget(CS_SIZE, CS_SIZE, {
      type: THREE.HalfFloatType, depthBuffer: false, generateMipmaps: true,
      minFilter: THREE.LinearMipmapLinearFilter, magFilter: THREE.LinearFilter, wrapS: THREE.ClampToEdgeWrapping, wrapT: THREE.ClampToEdgeWrapping,
    });
    const own = { uO: { value: new THREE.Vector3() }, uE: { value: new THREE.Vector3() }, uN: { value: new THREE.Vector3() }, uL: { value: 20000 }, uSunF: { value: new THREE.Vector3() } };
    const uniforms = { ...own };
    for (const k of ['tNoise', 'tCloudMap', 'uCloudMapMean', 'uRadius', 'uDeck', 'uNumDecks', 'uMode', 'uSigma', 'uShape', 'uBands', 'uJetPhase', 'uEqJet', 'uWindMax', 'uTime']) uniforms[k] = vu[k];
    this.own = own;
    this.material = new THREE.ShaderMaterial({ uniforms, vertexShader: FULLSCREEN_VERT, fragmentShader: CLOUD_SHADOW_FRAG, depthTest: false, depthWrite: false, glslVersion: THREE.GLSL3 });
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material);
    this.quad.frustumCulled = false;
    this.scene = new THREE.Scene();
    this.scene.add(this.quad);
    this.cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    // (the deck's optical depth where its cover is whole, as the volume reckons the decks above a point:
    // the far shell's stand-in, beyond the map)
    const dk = volume.decks[0];
    this.tauFull = dk ? dk.density * (dk.top - dk.base) * 0.4 * vu.uSigma.value : 0;
    // the surfaces' uniforms (world.js puts them in the shared set)
    this.uniforms = {
      tCloudShadow: { value: this.rt.texture },
      uCSOrigin: { value: new THREE.Vector3() }, uCSE: { value: new THREE.Vector3(1, 0, 0) }, uCSN: { value: new THREE.Vector3(0, 0, 1) },
      uCSInvL: { value: 0 }, uCSLod: { value: 0 }, uCSOn: { value: 0 }, uCloudTau: { value: this.tauFull },
    };
    this.base = dk ? Math.max(0, Math.min(...volume.decks.map((d) => d.base))) : 2000;
  }

  // camF: the camera's position, body-fixed (m); sunF: the sun's way, body-fixed (unit); on: whether to draw it
  update(renderer, camF, sunF, on) {
    const U = this.uniforms;
    U.uCSOn.value = on ? 1 : 0;
    if (!on) return;
    const R = this.R, up = camF.clone().normalize(), alt = camF.length() - R;
    // (a patch some way past where the decks' shadows can be told apart: a few times the camera's height
    // or the decks', 16 to 96 km across; its texels' size snapped so the patch steps by whole ones)
    const L = Math.min(96000, Math.max(16000, 6 * Math.max(alt, this.base)));
    const t = L / CS_SIZE;
    const E = new THREE.Vector3(0, 1, 0).cross(up);
    if (E.lengthSq() < 1e-8) E.set(1, 0, 0);
    E.normalize();
    const N = up.clone().cross(E).normalize();
    // (its middle on the datum under the camera, held to the texel grid along its axes so the shadows
    // don't crawl as the camera moves)
    const o = up.clone().multiplyScalar(R), ex = Math.round(o.dot(E) / t) * t, nx = Math.round(o.dot(N) / t) * t;
    o.addScaledVector(E, ex - o.dot(E)).addScaledVector(N, nx - o.dot(N));
    const own = this.own;
    own.uO.value.copy(o); own.uE.value.copy(E); own.uN.value.copy(N); own.uL.value = L; own.uSunF.value.copy(sunF);
    const prev = renderer.getRenderTarget();
    renderer.setRenderTarget(this.rt);
    renderer.render(this.scene, this.cam);
    renderer.setRenderTarget(prev);
    U.uCSOrigin.value.copy(o); U.uCSE.value.copy(E); U.uCSN.value.copy(N); U.uCSInvL.value = 1 / L;
    // (the level as wide as the patch of deck a point sees overhead: the dome out to ~60 degrees from the
    // zenith, about 3.5 times the decks' height across)
    U.uCSLod.value = Math.max(0, Math.log2(3.5 * this.base / t));
  }

  dispose() { this.rt.dispose(); this.material.dispose(); this.quad.geometry.dispose(); }
}

// the surfaces' uniforms where a world has no near volume: no map; the far shell's cover with a deck's
// optical depth from its thickness (as the volume reckons it: density 0.9, extinction 0.003 / m)
export function noCloudShadow(clouds) {
  const white = new THREE.DataTexture(new Uint16Array([15360, 15360, 15360, 15360]), 1, 1, THREE.RGBAFormat, THREE.HalfFloatType);
  white.needsUpdate = true;
  return {
    tCloudShadow: { value: white }, uCSOrigin: { value: new THREE.Vector3() }, uCSE: { value: new THREE.Vector3(1, 0, 0) }, uCSN: { value: new THREE.Vector3(0, 0, 1) },
    uCSInvL: { value: 0 }, uCSLod: { value: 0 }, uCSOn: { value: 0 }, uCloudTau: { value: clouds ? 0.9 * clouds.thickness * 0.4 * 0.003 : 0 },
  };
}
