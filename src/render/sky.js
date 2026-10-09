// Galactic background: a procedural cubemap (Milky Way band, dust lanes,
// nebulae, a faint star field) baked once on the GPU, plus ~6000 bright
// stars drawn as crisp points every frame (twinkling inside atmospheres).
// Star positions derive from the system seed, so a shared seed shares the sky.

import * as THREE from 'three';
import { Rng } from '../core/rng.js';
import { GLSL_NOISE } from './glsl.js';
import { blackbodyRGB } from '../gen/color.js';

const BAKE_VERT = /* glsl */`
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const BAKE_FRAG = /* glsl */`
${GLSL_NOISE}
uniform vec3 uGalNormal;
uniform vec3 uGalCenter;
uniform float uSeed;
uniform vec3 uNebulaA;
uniform vec3 uNebulaB;
varying vec3 vDir;

float h31(vec3 p) { return hash13(p + uSeed); }

vec3 starfield(vec3 d, float cells, float density, float bright) {
  vec3 p = d * cells;
  vec3 ip = floor(p);
  vec3 acc = vec3(0.0);
  for (int x = -1; x <= 1; x++) for (int y = -1; y <= 1; y++) for (int z = -1; z <= 1; z++) {
    vec3 c = ip + vec3(x, y, z);
    float h = h31(c);
    if (h > density) continue;
    vec3 sp = c + vec3(h31(c + 1.3), h31(c + 7.1), h31(c + 3.7));
    vec3 sd = normalize(sp);
    float ang = acos(clamp(dot(sd, d), -1.0, 1.0)) * cells;
    float mag = pow(h31(c + 9.9), 6.0);
    float t = h31(c + 4.4);
    vec3 col = mix(vec3(1.0, 0.72, 0.5), vec3(0.75, 0.85, 1.0), t * t);
    acc += col * exp(-ang * ang * 9.0) * mag * bright;
  }
  return acc;
}

void main() {
  vec3 d = normalize(vDir);
  float b = dot(d, uGalNormal);                 // sin(galactic latitude)
  float toward = dot(d, uGalCenter) * 0.5 + 0.5; // 1 toward the bulge
  float band = exp(-b * b / 0.012);
  float wide = exp(-b * b / 0.08);
  // (the bulge round the centre's own latitude: from above or below the plane it lies off the band)
  float bc = b - dot(uGalCenter, uGalNormal);
  float bulge = exp(-pow(1.0 - toward, 2.0) / 0.025) * exp(-bc * bc / 0.05);
  float n1 = fbm3(d * 6.0, 6) * 0.5 + 0.5;
  float n2 = fbm3(d * 22.0 + 3.0, 5) * 0.5 + 0.5;
  float glow = (band * (0.55 + 0.45 * n1) * (0.6 + 0.6 * toward) + wide * 0.18 + bulge * 1.4) * (0.7 + 0.6 * n2);
  // dust lanes: dark filaments hugging the plane
  float lane = smoothstep(0.52, 0.72, fbm3(d * 9.0 + 11.0, 6) * 0.5 + 0.5) * exp(-b * b / 0.004);
  glow *= 1.0 - 0.85 * lane;
  vec3 mw = mix(vec3(0.55, 0.62, 0.85), vec3(1.0, 0.86, 0.62), bulge + 0.3 * toward) * glow;
  // faint star haze + resolved faint stars, denser in the band
  vec3 col = mw * 2.2e-4;
  col += starfield(d, 420.0, 0.03 + 0.2 * band, 3.0e-4);
  col += starfield(d, 160.0, 0.025 + 0.08 * band, 6.0e-4);
  // two coloured nebulae (H-alpha red, reflection blue)
  float neb = smoothstep(0.55, 0.85, fbm3(d * 3.0 + 5.0, 6) * 0.5 + 0.5) * exp(-b * b / 0.03);
  float nebA = neb * smoothstep(0.4, 0.8, fbm3(d * 13.0, 4) * 0.5 + 0.5);
  float nebB = smoothstep(0.62, 0.9, fbm3(d * 4.0 - 7.0, 6) * 0.5 + 0.5) * exp(-b * b / 0.06) * (1.0 - nebA);
  col += uNebulaA * nebA * 1.6e-4 + uNebulaB * nebB * 1.0e-4;
  gl_FragColor = vec4(col, 1.0);
}
`;

// the sky's lens from low over a drawn world (atmosphere.js GLSL_MEDIUM lensTrueZ): x y z the camera's up
// (world), w on; and the drawn and the true horizon's dips (world.js sets them each frame): the stars through
// it as the sun is, rising and setting at the drawn skyline
export const SKY_LENS = { uLensUp: { value: new THREE.Vector4(0, 1, 0, 0) }, uLensK: { value: new THREE.Vector2(0, 0) } };
export const GLSL_LENS_DIR = /* glsl */`
uniform vec4 uLensUp;
uniform vec2 uLensK;
// a way (world, unit) through the lens: to the drawn sky (toDrawn) or back to the true one
vec3 lensDir(vec3 d, bool toDrawn) {
  if (uLensUp.w < 0.5 || uLensK.x <= uLensK.y) return d;
  vec3 up = uLensUp.xyz;
  float c = clamp(dot(d, up), -1.0, 1.0), z = acos(c);
  float hD = 1.5707963 + uLensK.x, hT = 1.5707963 + uLensK.y;
  float z2 = toDrawn ? (z <= hT ? z * hD / hT : hD + (z - hT) * (3.14159265 - hD) / (3.14159265 - hT))
    : (z <= hD ? z * hT / hD : hT + (z - hD) * (3.14159265 - hT) / (3.14159265 - hD));
  vec3 h = d - up * c;
  float hl = length(h);
  if (hl < 1e-6) return d;
  return up * cos(z2) + (h / hl) * sin(z2);
}
`;

const STAR_VERT = /* glsl */`
attribute vec3 color;
attribute float size;
uniform float uPixelRatio;
uniform float uTwinkle;
uniform float uTime;
uniform float uExtinction;
uniform sampler2D tAdapt;
uniform float uKey;
uniform float uMinExp;
uniform float uMaxExp;
uniform float uStarExp;
varying vec3 vColor;
#include <common>
#include <logdepthbuf_pars_vertex>
${GLSL_LENS_DIR}
void main() {
  // (through the sky's lens: SKY_LENS)
  vec3 wp = (modelMatrix * vec4(position, 1.0)).xyz;
  float wl = length(wp);
  vec4 mv = viewMatrix * vec4(lensDir(wp / wl, true) * wl, 1.0);
  gl_Position = projectionMatrix * mv;
  float tw = 1.0 + uTwinkle * 0.45 * sin(uTime * (7.0 + fract(position.x * 0.137) * 9.0) + position.y);
  // In space the stars stay visible beside a sunlit planet or ship (as the
  // eye sees them, not a camera): below the exposure they were set for, they
  // are brightened to match, up to 12x. Not inside an atmosphere: no stars
  // in a daytime sky.
  float expo = clamp(uKey / exp2(texture(tAdapt, vec2(0.5)).r), uMinExp, uMaxExp);
  float boost = mix(clamp(uStarExp / expo, 1.0, 12.0), 1.0, clamp(uTwinkle * 2.0, 0.0, 1.0));
  vColor = color * tw * uExtinction * boost;
  gl_PointSize = size * uPixelRatio;
  #include <logdepthbuf_vertex>
}
`;
const STAR_FRAG = /* glsl */`
varying vec3 vColor;
#include <common>
#include <logdepthbuf_pars_fragment>
void main() {
  #include <logdepthbuf_fragment>
  vec2 q = gl_PointCoord * 2.0 - 1.0;
  float r2 = dot(q, q);
  float a = exp(-r2 * 4.0);
  if (a < 0.01) discard;
  gl_FragColor = vec4(vColor * a, 1.0);
}
`;

export class Sky {
  constructor(renderer, seed) {
    const rng = Rng.fromString('sky/' + seed);
    const gn = rng.unitVector();
    const galNormal = new THREE.Vector3(gn[0], gn[1], gn[2]);
    const t = new THREE.Vector3(1, 0, 0).cross(galNormal).normalize();
    const galCenterPlane = t.clone().applyAxisAngle(galNormal, rng.range(0, Math.PI * 2));
    // this system's turn against the galaxy: its north (galNormal) and, in the galaxy's plane, the way
    // to the centre (galCenterPlane); the galaxy chart's frame turns into the world by them
    // (chartToWorld). galCenter: the true way to the centre, where its black hole is
    // (sim/centralObject.js), off the plane when the system is (placeInGalaxy)
    this.galNormal = galNormal;
    this.galCenterPlane = galCenterPlane;
    const galCenter = galCenterPlane.clone();
    this.galCenter = galCenter;

    const size = 1024;
    this.cubeRT = new THREE.WebGLCubeRenderTarget(size, { type: THREE.HalfFloatType, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter });
    const bakeScene = new THREE.Scene();
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uGalNormal: { value: galNormal }, uGalCenter: { value: galCenter }, uSeed: { value: rng.range(0, 100) },
        uNebulaA: { value: new THREE.Vector3(1.0, 0.25, 0.35) }, uNebulaB: { value: new THREE.Vector3(0.3, 0.5, 1.0) },
      },
      vertexShader: BAKE_VERT, fragmentShader: BAKE_FRAG, side: THREE.BackSide, depthWrite: false, depthTest: false,
    });
    // (version: bumped when the galaxy moves round it, and the native bake redone: webgpu/background.js)
    this.cubeRT.texture.userData.webgpuSky = { uniforms: mat.uniforms, version: 0 };
    bakeScene.add(new THREE.Mesh(new THREE.SphereGeometry(10, 32, 16), mat));
    const cc = new THREE.CubeCamera(1, 100, this.cubeRT);
    this.bake = () => {
      if (renderer.isNativeWebGPU) return;
      const prevAuto = renderer.autoClear;
      renderer.autoClear = true;
      cc.update(renderer, bakeScene);
      renderer.autoClear = prevAuto;
    };
    this.bake();

    // bright stars as points
    const N = 6000;
    const pos = new Float32Array(N * 3), col = new Float32Array(N * 3), size2 = new Float32Array(N);
    const D = 1e12;
    for (let i = 0; i < N; i++) {
      let d;
      // concentrate ~35% toward the galactic plane
      if (rng.chance(0.35)) {
        const u = rng.unitVector();
        const v = new THREE.Vector3(u[0], u[1], u[2]);
        const off = v.dot(galNormal) * (1 - rng.range(0, 0.9));
        v.addScaledVector(galNormal, -off).normalize();
        d = v;
      } else { const u = rng.unitVector(); d = new THREE.Vector3(u[0], u[1], u[2]); }
      pos[i * 3] = d.x * D; pos[i * 3 + 1] = d.y * D; pos[i * 3 + 2] = d.z * D;
      // magnitude distribution: N(<m) ~ 10^(0.5 m)
      const m = Math.log10(Math.pow(10, 0.5 * -1.5) + rng.next() * (Math.pow(10, 0.5 * 6.5) - Math.pow(10, 0.5 * -1.5))) / 0.5;
      const T = rng.weighted([[3, rng.range(3000, 4200)], [4, rng.range(4200, 6000)], [2.5, rng.range(6000, 9000)], [1, rng.range(9000, 25000)]]);
      size2[i] = starPoint(m, T, col, i);
    }
    this.background = { pos, col, size: size2 };
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.setAttribute('size', new THREE.BufferAttribute(size2, 1));
    this.starMat = new THREE.ShaderMaterial({
      uniforms: { ...SKY_LENS, uPixelRatio: { value: 1 }, uTwinkle: { value: 0 }, uTime: { value: 0 }, uExtinction: { value: 1 },
        tAdapt: { value: null }, uKey: { value: 0.18 }, uMinExp: { value: 0.04 }, uMaxExp: { value: 260 }, uStarExp: { value: 70 } },
      vertexShader: STAR_VERT, fragmentShader: STAR_FRAG,
      blending: THREE.AdditiveBlending, depthWrite: false, transparent: true,
    });
    this.points = new THREE.Points(g, this.starMat);
    this.points.frustumCulled = false;
    this.points.renderOrder = -10;
  }
}

// Star surface: limb darkening, granulation, faint spots
const SUN_VERT = /* glsl */`
varying vec3 vN;
varying vec3 vObj;
varying vec3 vView;
#include <common>
#include <logdepthbuf_pars_vertex>
void main() {
  vObj = normalize(position);
  vN = normalize(mat3(modelMatrix) * normal);
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vView = -wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
  #include <logdepthbuf_vertex>
}
`;
const SUN_FRAG = /* glsl */`
${GLSL_NOISE}
uniform vec3 uColor;
uniform float uRadiance;
uniform float uTime;
// (its light through the air where the camera is, as on the world's true size: atmosphere.js's
// transmittance; the drawn air's own is thinner, a setting sun white-hot through it)
uniform vec3 uDiscT;
varying vec3 vN;
varying vec3 vObj;
varying vec3 vView;
#include <common>
#include <logdepthbuf_pars_fragment>
void main() {
  #include <logdepthbuf_fragment>
  float mu = clamp(dot(normalize(vN), normalize(vView)), 0.0, 1.0);
  // Eddington-like limb darkening, slightly redder at the limb
  vec3 limb = vec3(1.0 - 0.52 * (1.0 - mu), 1.0 - 0.6 * (1.0 - mu), 1.0 - 0.7 * (1.0 - mu));
  float gran = 0.92 + 0.08 * fbm3(vObj * 160.0 + uTime * 0.002, 4);
  float spots = smoothstep(0.62, 0.7, fbm3(vObj * 9.0 + 3.0, 5) * 0.5 + 0.5) * smoothstep(0.75, 0.2, abs(vObj.y));
  vec3 c = uColor * uRadiance * limb * gran * (1.0 - 0.7 * spots) * uDiscT;
  gl_FragColor = vec4(c, 1.0);
}
`;

// a sky star's point: its colour (scaled by brightness) into col at i, its size returned; m its
// apparent magnitude, T its surface temperature (K)
function starPoint(m, T, col, i) {
  const flux = Math.pow(10, -0.4 * m);
  const c = blackbodyRGB(T);
  const k = 0.012 * Math.min(flux, 3) + 0.0012;
  col[i * 3] = c[0] * k; col[i * 3 + 1] = c[1] * k; col[i * 3 + 2] = c[2] * k;
  return 1.6 + Math.min(2.6, Math.sqrt(flux) * 1.5);
}

Sky.prototype.chartToWorld = function (p, v, w = new THREE.Vector3()) {
  // the galaxy chart's frame (pc; x, z its plane, y its north) turned into this system's world, for a
  // system at p from the hole: the chart's north to the sky's galactic north, and the chart's way to
  // the centre within the plane to the sky's (galCenterPlane)
  const N = this.galNormal, Cw = this.galCenterPlane;
  const E = new THREE.Vector3().crossVectors(Cw, N);
  let cx = -p[0], cz = -p[2];
  const l = Math.hypot(cx, cz);
  if (l < 1e-9) { cx = -1; cz = 0; } else { cx /= l; cz /= l; }
  // (along: on (cx, 0, cz); across: on its cross with north, (-cz, 0, cx))
  const along = v[0] * cx + v[2] * cz, across = -v[0] * cz + v[2] * cx;
  return w.copy(Cw).multiplyScalar(along).addScaledVector(N, v[1]).addScaledVector(E, across);
};

// where this system sits in the galaxy: p from the hole on the chart (pc). The centre's glow is baked
// again round the true way to it; stars: the charted systems round it ({position (chart, pc),
// luminosity (suns), teff (K)}), drawn as sky stars where they lie and as bright as they are from here
Sky.prototype.placeInGalaxy = function (p, stars = []) {
  const r = Math.hypot(...p);
  const was = this.galCenter.clone();
  this.chartToWorld(p, [-p[0] / r, -p[1] / r, -p[2] / r], this.galCenter).normalize();
  if (was.distanceToSquared(this.galCenter) > 1e-12) { this.cubeRT.texture.userData.webgpuSky.version++; this.bake(); }
  const bg = this.background, n = bg.size.length, m = stars.length;
  const pos = new Float32Array((n + m) * 3), col = new Float32Array((n + m) * 3), size = new Float32Array(n + m);
  pos.set(bg.pos); col.set(bg.col); size.set(bg.size);
  const w = new THREE.Vector3();
  for (let j = 0; j < m; j++) {
    const s = stars[j], v = s.position.map((x, k) => x - p[k]), d = Math.hypot(...v);
    if (!(d > 1e-6)) continue;
    this.chartToWorld(p, v.map(x => x / d), w).normalize().multiplyScalar(1e12);
    pos.set([w.x, w.y, w.z], (n + j) * 3);
    // (its apparent magnitude: bolometric, the Sun's absolute 4.74 at 10 pc)
    const mag = 4.74 - 2.5 * Math.log10(Math.max(s.luminosity, 1e-6)) + 5 * Math.log10(d / 10);
    size[n + j] = starPoint(mag, s.teff, col, n + j);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.setAttribute('size', new THREE.BufferAttribute(size, 1));
  const old = this.points.geometry;
  this.points.geometry = g;
  old.dispose();
};

export function makeStarMesh(starData) {
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Vector3(...starData.color) },
      uRadiance: { value: starData.surfaceRadiance },
      uTime: { value: 0 },
      uDiscT: { value: new THREE.Vector3(1, 1, 1) },
    },
    vertexShader: SUN_VERT, fragmentShader: SUN_FRAG,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(starData.R, 96, 48), mat);
  mesh.frustumCulled = false;
  return mesh;
}
