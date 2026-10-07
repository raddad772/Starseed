// Falls of any liquid (a river's water over a cliff band, methane off Titan's scarps), by the world's
// gravity and air. The chunks find them (gen/chunkbuilder.js findFalls: a run of river steeper than
// ~37 degrees, its lip and its foot: at the mesh's few metres a cascade more than a plunge); here:
//   the sheet    (the terrain's shader, uFall*) down the face at sqrt(2 g z) for the z it has fallen,
//                to what the air lets it: a few times its drops' terminal speed, so on Titan's low
//                gravity and thick air a slow, heavy pour; streaked white as far as the air breaks it
//   spray        drops thrown up off the foot by its impact, each falling back on its own arc: drag
//                toward its terminal speed (the larger the air's density, the sooner), none without
//                air (ballistic: higher and longer in low gravity)
//   mist         where the air shatters the drops (their Weber number, the air's density against the
//                liquid's surface tension), the finest of them carried off on the air the fall drags
//                down and out, rising, drifting on the wind, settling at their Stokes speed (hanging
//                for minutes in Titan's air at its gravity, seconds on Earth); none in a vacuum
//   rainbow      in the spray, at the angle the liquid's own index of refraction makes: 42 degrees
//                from the antisolar point for water, ~49 for methane
import * as THREE from 'three';
import { MATERIALS } from '../gen/worldsim/materials.js';
import { SIGMA } from './liquid.js';
import { GLSL_SURFACE_ATMO } from './atmosphere.js';
import { FALL_STRIDE } from '../gen/chunkbuilder.js';
import { GLSL_DEPTH } from './glsl.js';

// the world's falls' physics: uFall1 (g, the sheet's top speed, its drops' terminal speed, their drag
// time), uFall2 (the mist's settling speed, how much of a fall the air turns to mist, the rainbow's
// angle (rad), the wind)
export function fallPhysics(b, wind) {
  const d = b.data || {}, name = (d.hydrosphere && d.hydrosphere.liquid) || 'water';
  const M = MATERIALS[name] || MATERIALS.water;
  const g = d.gravity || 9.8, T = Math.max(d.Tsurf || 288, 30);
  const a = d.atmosphere, P = a ? a.pressure || 0 : 0;
  const rhoA = P > 0 ? P * 1e5 * ((a.mu || 29) / 1000) / (8.314 * T) : 0;
  const muA = 1.8e-5 * Math.pow(T / 288, 0.7);   // (the air's viscosity: Sutherland's, roughly)
  const sigma = SIGMA[name] || 0.03, rhoL = M.rho;
  // drops: the largest a fall's spray holds (half its capillary length, ~1.4 mm of water on Earth),
  // falling at their terminal speed in this air (Cd ~0.5); in a vacuum none (their drag time long)
  const rD = Math.min(0.003, 0.5 * Math.sqrt(sigma / (rhoL * g)));
  const vDrop = rhoA > 1e-4 ? Math.sqrt(8 * rD * rhoL * g / (3 * 0.5 * rhoA)) : 1e3;
  const tau = Math.min(vDrop / g, 1e3);
  // the sheet falls near freely until it breaks up; then at about its drops' pace: a few times theirs
  const vSheet = Math.min(3 * vDrop, 80);
  // mist: ~20 um droplets settling by Stokes' law
  const rM = 2e-5, vMist = rhoA > 1e-4 ? 2 / 9 * (rhoL - rhoA) * g * rM * rM / muA : 0;
  // how much the air shatters: the drops' Weber number at the sheet's speed
  const We = rhoA * vSheet * vSheet * 2 * rD / sigma;
  const mist = rhoA > 1e-4 ? smooth(1, 30, We) : 0;
  // the primary bow: the least deviation through one internal reflection, for its index n
  const n = M.n, ci = Math.sqrt(Math.max(0, (n * n - 1) / 3)), i = Math.acos(Math.min(1, ci));
  const D = Math.PI + 2 * i - 4 * Math.asin(Math.sin(i) / n), bow = Math.PI - D;
  return {
    uniforms: {
      uFall1: { value: new THREE.Vector4(g, vSheet, vDrop, tau) },
      uFall2: { value: new THREE.Vector4(vMist, mist, bow, wind || 0) },
    },
    info: { name, g, rhoA, vDrop, vSheet, vMist, mist, bowDeg: bow * 180 / Math.PI },
  };
}
function smooth(a, b, x) { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); }

const VERT = /* glsl */`
attribute vec3 aFoot;     // (chunk-local, the planet's frame)
attribute vec3 aUp;
attribute vec4 aFall;     // its impact speed, its width, its drop, 1 for mist
attribute vec4 aSeed;
attribute vec2 corner;
uniform vec4 uFall1;
uniform vec4 uFall2;
uniform float uTime;
uniform vec3 uSunDir;
uniform vec3 uSunE;
uniform vec3 uCenter;
varying vec3 vCol;
varying float vA;
varying vec2 vUv;
varying float vMist;
varying vec2 vS;
varying float vZ;
#include <common>
${GLSL_SURFACE_ATMO}
void main() {
  bool mist = aFall.w > 0.5;
  float g = uFall1.x, vImp = aFall.x;
  vec3 e1 = normalize(cross(aUp, vec3(0.0, 1.0, 0.0)) + vec3(1e-5, 0.0, 0.0)), e2 = cross(aUp, e1);
  // (the wind: the prevailing one of its latitude, as the waves', liquid.js)
  float al = abs(asin(clamp(aUp.y, -1.0, 1.0)));
  vec3 wind = e1 * (al < 0.52 || al > 1.05 ? -1.0 : 1.0) * uFall2.w * (al < 0.09 ? 0.45 : al < 0.52 ? 0.9 : al < 1.05 ? 1.25 : 0.8) * 0.4;
  float az = aSeed.y * 6.2832;
  vec3 out1 = e1 * cos(az) + e2 * sin(az);
  vec3 p; float life, size, a;
  if (mist) {
    // carried out on the air the fall drags down (spent in a second or so), lifted by it, drifting
    // on the wind, settling at its Stokes speed; spreading as it goes
    life = mix(6.0, 16.0, aSeed.w) * (1.0 + 0.02 / max(uFall2.x, 0.002));
    life = min(life, 60.0);
    float t = fract(uTime / life + aSeed.x) * life;
    float vOut = vImp * mix(0.15, 0.35, aSeed.z);
    p = aFoot + out1 * vOut * 1.2 * (1.0 - exp(-t / 1.2)) + aUp * (vImp * 0.08 * 3.0 * (1.0 - exp(-t / 3.0)) - uFall2.x * t)
      + wind * (t - 3.0 * (1.0 - exp(-t / 3.0)));
    float k = t / life;
    // (a haze of it: many small wisps, not a few puffs)
    size = (0.3 + 0.05 * aFall.z) * mix(0.5, 1.4, aSeed.z) * mix(0.35, 1.0, sqrt(k));
    a = 0.07 * uFall2.y * smoothstep(0.0, 0.12, k) * (1.0 - smoothstep(0.5, 1.0, k));
  } else {
    // a drop thrown up off the foot: toward its terminal speed (down, and with the wind) at its drag
    // time; ballistic in a vacuum
    float el = mix(0.45, 1.35, aSeed.z), v0 = vImp * mix(0.2, 0.55, aSeed.w);
    vec3 v0v = out1 * cos(el) * v0 + aUp * sin(el) * v0;
    float tau = uFall1.w;
    vec3 vT = -aUp * min(uFall1.z, g * tau) + wind;
    // (its time aloft: the ballistic arc's, shortened by drag)
    float up0 = sin(el) * v0;
    life = clamp(2.0 * up0 / g / (1.0 + up0 / max(uFall1.z, 0.01)), 0.15, 12.0) + 0.1;
    float t = fract(uTime / life + aSeed.x) * life;
    p = aFoot + vT * t + (v0v - vT) * tau * (1.0 - exp(-t / tau));
    // (each one a little cloud of the drops thrown together, millimetres each: faint, a haze where many are)
    size = mix(0.08, 0.3, aSeed.y);
    a = 0.2 * smoothstep(0.0, 0.05, t / life) * (1.0 - smoothstep(0.75, 1.0, t / life));
  }
  vec4 wp = modelMatrix * vec4(p, 1.0);
  // lit as the air there is: the sun through the air (a forward-scattering phase: bright against the
  // sun), the sky's light; in the spray, the bow
  vec3 rel = wp.xyz - uCenter;
  float r = length(rel);
  vec3 up = rel / r;
  float muS = dot(up, uSunDir);
  vec3 sunT = atmoSunTransmittance(r, muS);
  vec3 skyE = atmoSkyIrradiance(r, muS);
  vec3 toCam = normalize(-wp.xyz);
  float cosT = dot(-uSunDir, toCam);
  float hg = mist ? 0.75 : 0.5;
  float phase = (1.0 - hg * hg) / pow(1.0 + hg * hg - 2.0 * hg * cosT, 1.5) * 0.25;
  vec3 c = uSunE * sunT * phase + uSunE * skyE / PI * 0.8;
  if (!mist) {
    // (the bow: its angle from the antisolar point; red outside, violet in)
    float A = acos(clamp(dot(toCam, uSunDir), -1.0, 1.0)), d = (A - uFall2.z) * 57.2958;
    vec3 bowC = vec3(exp(-pow((d - 0.8) / 0.45, 2.0)), exp(-pow((d - 0.1) / 0.45, 2.0)), exp(-pow((d + 0.7) / 0.45, 2.0)));
    // (faint: a few drops among many at its angle, a shimmer across the spray, not lit beads)
    c += uSunE * sunT * bowC * 0.12;
  }
  vCol = c;
  vA = a;
  vUv = corner;
  vMist = mist ? 1.0 : 0.0;
  vS = aSeed.zw;
  vec4 mv = viewMatrix * wp;
  mv.xy += corner * size;
  vZ = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`;

const FRAG = /* glsl */`
uniform sampler2D tDetail;
varying vec3 vCol;
varying float vA;
varying vec2 vUv;
varying float vMist;
varying vec2 vS;
varying float vZ;
uniform sampler2D tSceneDepth;
${GLSL_DEPTH}
#include <common>
void main() {
  float r = length(vUv);
  if (r > 1.0) discard;
  // (behind the scene's surface: hidden; near it: faded over a metre or so (a drop's spray less))
  float dRaw = texelFetch(tSceneDepth, ivec2(gl_FragCoord.xy), 0).r;
  float zs = isSkyDepth(dRaw) ? 1e30 : viewZFromDepth(dRaw);
  if (vZ > zs) discard;
  float soft = clamp((zs - vZ) / (vMist > 0.5 ? 1.5 : 0.2), 0.0, 1.0);
  float a = vA * soft * (1.0 - smoothstep(0.2, 1.0, r));
  // (a puff of mist, or of spray, uneven within)
  a *= 0.4 + 1.2 * texture(tDetail, vUv * 0.25 + vS).a;
  gl_FragColor = vec4(vCol, a);
}
`;

// a world's falls' spray and mist: one material, a set of particles for each chunk with falls (a child
// of its mesh, shown and dropped with it)
export class FallFx {
  // (world.js: the engine's soft-particle scene and its depth uniforms)
  static soft = null;
  constructor(shared) {
    this.material = new THREE.ShaderMaterial({
      uniforms: { ...shared, ...(FallFx.soft ? FallFx.soft.uniforms : {}) }, vertexShader: VERT, fragmentShader: FRAG,
      transparent: true, depthWrite: false, depthTest: false,
    });
  }
  // falls: chunkbuilder.js's (FALL_STRIDE floats each); origin: the chunk's (the planet's frame)
  // (frozen 0..1: a hard freeze's share, its spray and mist the less)
  make(falls, origin, frozen = 0) {
    const g = this.material.uniforms.uFall1.value.x, vSheet = this.material.uniforms.uFall1.value.y, mistK = this.material.uniforms.uFall2.value.y;
    const foot = [], upv = [], fall = [], seed = [];
    let rs = (falls[0] * 7919 + falls[1] * 104729 + falls[2] * 1299709) | 0;
    const rnd = () => { rs = (rs * 1664525 + 1013904223) >>> 0; return rs / 4294967296; };
    for (let f = 0; f < falls.length; f += FALL_STRIDE) {
      const x = falls[f], y = falls[f + 1], z = falls[f + 2], drop = falls[f + 3] - falls[f + 4], width = falls[f + 5];
      const ax = falls[f + 7], ay = falls[f + 8], az = falls[f + 9], dir = Math.hypot(ax, ay, az) > 0.5;
      const vImp = Math.min(Math.sqrt(2 * g * drop), vSheet);
      const ux = origin[0] + x, uy = origin[1] + y, uz = origin[2] + z, ul = Math.hypot(ux, uy, uz);
      // (its share of particles: by its width and how hard it lands)
      const nSpray = Math.round(Math.min(1200, Math.max(48, width * vImp * 4)) * (1 - frozen));
      const nMist = Math.round(Math.min(720, Math.max(0, width * Math.sqrt(drop) * 3.6)) * mistK * (1 - frozen));
      for (let k = 0; k < nSpray + nMist; k++) {
        // (along the line it lands on, its lip's width; a ring of it where that way isn't known)
        const s = (rnd() - 0.5) * width;
        if (dir) foot.push(x + ax * s, y + ay * s, z + az * s);
        else {
          const nx = ux / ul, ny = uy / ul, nz = uz / ul, el = Math.hypot(nz, nx) || 1, e1x = nz / el, e1z = -nx / el;
          const e2x = ny * e1z, e2y = nz * e1x - nx * e1z, e2z = -ny * e1x, a = rnd() * 6.2832, rr = 0.5 * width * Math.sqrt(rnd());
          foot.push(x + rr * (Math.cos(a) * e1x + Math.sin(a) * e2x), y + rr * Math.sin(a) * e2y, z + rr * (Math.cos(a) * e1z + Math.sin(a) * e2z));
        }
        upv.push(ux / ul, uy / ul, uz / ul);
        fall.push(vImp, width, drop, k >= nSpray ? 1 : 0);
        seed.push(rnd(), rnd(), rnd(), rnd());
      }
    }
    const n = foot.length / 3;
    if (!n) return null;
    const geo = new THREE.InstancedBufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(12), 3));
    geo.setAttribute('corner', new THREE.Float32BufferAttribute([-1, -1, 1, -1, 1, 1, -1, 1], 2));
    geo.setIndex([0, 1, 2, 0, 2, 3]);
    geo.setAttribute('aFoot', new THREE.InstancedBufferAttribute(new Float32Array(foot), 3));
    geo.setAttribute('aUp', new THREE.InstancedBufferAttribute(new Float32Array(upv), 3));
    geo.setAttribute('aFall', new THREE.InstancedBufferAttribute(new Float32Array(fall), 4));
    geo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(new Float32Array(seed), 4));
    geo.instanceCount = n;
    const m = new THREE.Mesh(geo, this.material);
    m.frustumCulled = false;
    m.matrixAutoUpdate = false;
    m.userData.sharedMaterial = true;
    return m;
  }
}
