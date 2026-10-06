// Grass near the camera (LIFE.md 5; Dave: "put some grass on that and it could be pretty", "you need SO
// much more grass"): blades, each a few triangles shaped, bent and coloured in the vertex shader (after
// Peter Adams's GLSL triangle grass: many thin blades, dark at their feet, the wind's gusts running across
// them), in 2 m patches whose feet follow the ground (the patch's four corners' heights, as the drawn
// ground has them), hundreds to the square metre where the country grows them thick. As thick as the
// country's plants are open (the life map's cover; under a wood's closed stands only a few, shaded out:
// gen/life/stands.js); none on sand, bare rock, ice, water or frozen ground; where grasses have evolved
// (evolve.js plantGrade 4; before them, ferns' broader fronds); coloured from the world's own foliage
// pigment toward its dry colour where its rain is short (no texture's colours over it); as tall as it
// grows left to itself (a dry steppe's a hand high, a wet warm country's a metre and more: "long and wild
// when it can"); bent by the wind where you stand (sim/wind.js), its gusts running across in its way.
// Patches by each 8 m tile's own hash in the cube face's coordinates (the same for everyone), each tile
// its own meshes (culled by view), its blades full near, fewer and broader further, thinned out at the
// edge of its reach.
import * as THREE from 'three';
import { dirFromFaceUV, faceUVFromDir } from '../gen/cubesphere.js';
import { S_LEN, S_H, S_TEMP, S_SAND, S_ICE, S_WDEPTH, S_RIVR } from '../gen/terrain.js';
import { fmix32 } from '../core/rng.js';
import { FireField } from '../sim/fireField.js';
import { receiveShadows, COVER_LAYER, COVER_MIN_W, SHADOW_LIGHT_UNIFORMS } from './sunShadows.js';
import { standAt } from '../gen/life/stands.js';
import { floraSpecies, meadowAt } from '../gen/flora.js';
import { snowWaterNow, SNOW_DEPTH_PER_MM } from './season.js';

const TILE = 8, PPT = 4, NEAR_R = 16, MID_R = 44, FAR_R = 160, FAR_TILE = 32, HIGH = 120, MOVE = 1.2;
// (near and middle: 8 m tiles of 2 m patches; far: 32 m tiles of 8 m patches, their blades broader and fewer
// to the metre, fading in as the middle's fade out: the field's texture and its line to ~160 m)
const LOD = { near: { blades: 1400, seg: 2, width: 0.007 }, mid: { blades: 600, seg: 1, width: 0.014 }, far: { blades: 650, seg: 1, width: 0.0055 } };
const _c = new THREE.Color(), _y = new THREE.Vector3();

// a patch's blades over [-1, 1]^2 m (the patch's own frame, y up), each seg segments under a single tip:
//   aBlade (x, z, r, yaw): its foot, its own random (kept where r is under the patch's density), its way
//   aV (t, side): along it 0..1, its edge (-1, +1; 0 the tip)
function bladeGeometry(nb, seg, seed) {
  const per = seg * 2 + 1, nv = nb * per;
  const A = new Float32Array(nv * 4), W = new Float32Array(nv * 2), P = new Float32Array(nv * 3), idx = new Uint32Array(nb * (seg * 2 - 1) * 3);
  let h = seed >>> 0;
  const rnd = () => { h = fmix32((h + 0x6d2b79f5) >>> 0); return h / 4294967296; };
  let v = 0, k = 0;
  for (let b = 0; b < nb; b++) {
    const x = rnd() * 2 - 1, z = rnd() * 2 - 1, r = rnd(), yaw = rnd() * Math.PI * 2, base = v;
    for (let s = 0; s <= seg; s++) {
      for (const sd of s === seg ? [0] : [-1, 1]) {
        A[v * 4] = x; A[v * 4 + 1] = z; A[v * 4 + 2] = r; A[v * 4 + 3] = yaw;
        W[v * 2] = s / seg; W[v * 2 + 1] = sd;
        P[v * 3] = x; P[v * 3 + 1] = s / seg; P[v * 3 + 2] = z;
        v++;
      }
    }
    for (let s = 0; s < seg; s++) {
      const i = base + s * 2;
      if (s === seg - 1) { idx[k++] = i; idx[k++] = i + 1; idx[k++] = i + 2; }
      else { idx[k++] = i; idx[k++] = i + 1; idx[k++] = i + 2; idx[k++] = i + 1; idx[k++] = i + 3; idx[k++] = i + 2; }
    }
  }
  // (normals all up, lit as the ground is: and a material without them is drawn flat-shaded)
  const N = new Float32Array(nv * 3);
  for (let i = 0; i < nv; i++) N[i * 3 + 1] = 1;
  return {
    position: new THREE.BufferAttribute(P, 3), normal: new THREE.BufferAttribute(N, 3), aBlade: new THREE.BufferAttribute(A, 4), aV: new THREE.BufferAttribute(W, 2),
    index: new THREE.BufferAttribute(idx.subarray(0, k), 1),
  };
}

// a blade's shape, from its patch's instance data
//   iCorner: the ground's heights at the patch's corners over its centre's plane (u-v-, u+v-, u-v+, u+v+)
//   iGrass: density (0..1), height (m), how wild (its own lean), the season's snow on it now (m)
//   iBare: where it grows at the patch's corners (1, 0 bare: a creek's bed, sand, rock showing), blended
//   across it, ragged by its clumps (a patch all or nothing was a square)
//   iWave: where the patch lies (body-fixed x, y, z, each wrapped at 2048 m): its noises' place
const GLSL_BLADE = /* glsl */`
attribute vec4 aBlade;
attribute vec2 aV;
attribute vec4 iCorner;
attribute vec4 iBare;
attribute vec4 iGrass;
attribute vec3 iWave;
uniform float uWindT;
uniform float uGrassWind;
uniform vec3 uWindL;
uniform float uBladeW;
uniform float uFadeR;
uniform float uFadeIn;
uniform float uPatchK;
// (drawing into the grass's cover map (sunShadows.js): x on, y the least width a blade's drawn (m); and
// the light's way (world))
uniform vec4 uCover;
uniform vec3 uCoverL;
varying float vGA;
varying float vGSide;
varying float vGT;
varying float vGK;
varying float vGS;   // (the sward's leaves above this point of the blade: its optical depth straight down)
float grassHash(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
vec3 grassHash3(vec3 p) {
  return fract(sin(vec3(dot(p, vec3(127.1, 311.7, 74.7)), dot(p, vec3(269.5, 183.3, 246.1)), dot(p, vec3(113.5, 271.9, 124.6)))) * 43758.5453);
}
// smooth noise over the ground's place in 3D (body-fixed: the ground's own metres, the same every way
// along it; read in two of its axes it was stretched north-south, streaks lying in parallel lines), three
// values at once; its lattice wrapping every per cells (the patches' place wraps at 2048 m: no seam there)
vec3 grassNoise3(vec3 p, float per) {
  vec3 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  vec3 a = grassHash3(mod(i, per)), b = grassHash3(mod(i + vec3(1.0, 0.0, 0.0), per));
  vec3 c = grassHash3(mod(i + vec3(0.0, 1.0, 0.0), per)), d = grassHash3(mod(i + vec3(1.0, 1.0, 0.0), per));
  vec3 e = grassHash3(mod(i + vec3(0.0, 0.0, 1.0), per)), g = grassHash3(mod(i + vec3(1.0, 0.0, 1.0), per));
  vec3 h = grassHash3(mod(i + vec3(0.0, 1.0, 1.0), per)), k = grassHash3(mod(i + vec3(1.0, 1.0, 1.0), per));
  return mix(mix(mix(a, b, f.x), mix(c, d, f.x), f.y), mix(mix(e, g, f.x), mix(h, k, f.x), f.y), f.z);
}
float grassNoise1(vec3 p) {
  vec3 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(grassHash(i), grassHash(i + vec3(1.0, 0.0, 0.0)), f.x), mix(grassHash(i + vec3(0.0, 1.0, 0.0)), grassHash(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
    mix(mix(grassHash(i + vec3(0.0, 0.0, 1.0)), grassHash(i + vec3(1.0, 0.0, 1.0)), f.x), mix(grassHash(i + vec3(0.0, 1.0, 1.0)), grassHash(i + vec3(1.0, 1.0, 1.0)), f.x), f.y), f.z);
}
vec3 grassBlade(mat4 im) {
  // (the patch's own turn of the blades' layout, mirrored or not, and its own share of them: every patch
  // drew the same layout, a pattern repeating every 2 m, a grid)
  float ps = grassHash(iWave * 0.731 + 0.17);
  float rq = floor(ps * 4.0);
  vec2 bx = aBlade.xy;
  bx = rq < 1.0 ? bx : rq < 2.0 ? vec2(-bx.y, bx.x) : rq < 3.0 ? -bx : vec2(bx.y, -bx.x);
  if (fract(ps * 7.13) > 0.5) bx.x = -bx.x;
  float rr = fract(aBlade.z + ps * 0.618);
  vec4 pc = modelMatrix * im * vec4(bx.x, 0.0, bx.y, 1.0);
  float dc = length(pc.xyz);
  vec3 off = mat3(im) * vec3(bx.x, 0.0, bx.y);
  vec3 wp = iWave + off;
  // (its thickness and height by the lie of the ground a few metres across, smooth over the patches' edges:
  // clumps and thin places, not squares; and the season's snow drifted and hollowed)
  vec3 nz = grassNoise3(wp / 3.2, 640.0);
  float n1 = nz.x, n2 = nz.y;
  float u0 = bx.x * 0.5 + 0.5, v0 = bx.y * 0.5 + 0.5;
  float gb = mix(mix(iBare.x, iBare.y, u0), mix(iBare.z, iBare.w, u0), v0);
  float dens = iGrass.x * (0.5 + n1) * smoothstep(0.25, 0.75, gb + 0.5 * (n2 - 0.5)) * (1.0 - smoothstep(uFadeR * 0.7, uFadeR, dc)) * smoothstep(uFadeIn - 8.0, uFadeIn + 2.0, dc);
  vGT = aV.x; vGK = fract(rr * 13.71);
  // (the sun reaching down into the sward through the blades above: Beer's law over their leaf area, ~3 in
  // a thick meadow (half of it facing the light, Monsi and Saeki 1953), the tips in the sun, the feet in
  // the shade; the slant through it added by the material)
  vGS = 1.5 * min(dens, 1.0) * (1.0 - aV.x);
  if (rr >= dens) return vec3(0.0);
  float t = aV.x, side = aV.y;
  float k1 = fract(rr * 7.31), k2 = fract(rr * 3.17 + aBlade.w * 0.13);
  // (out of the season's snow, its depth drifted and hollowed a few metres across: the tips standing up out
  // of a thin fall, buried by a deep one, held still by it)
  float snow = iGrass.w * (0.4 + 1.2 * nz.z);
  float hb = iGrass.y * (0.45 + 0.9 * k1) * (0.75 + 0.5 * n2) - snow;
  if (hb < 0.02) return vec3(0.0);
  float held = exp(-snow * 6.0);
  float yaw = aBlade.w + ps * 6.2832;
  vec2 f = vec2(cos(yaw), sin(yaw)), p = vec2(-f.y, f.x);
  // (its own lean, the wilder the more; the wind's bend, its gusts patches of stronger wind (cat's paws) a
  // few metres across running downwind over the field, not waves in parallel lines)
  vec2 B = f * iGrass.z * (0.15 + 0.85 * k2) * (0.4 + 0.6 * held);
  vec3 wl = transpose(mat3(im)) * uWindL;
  vec2 wd = length(wl.xz) > 1e-4 ? normalize(wl.xz) : vec2(1.0, 0.0);
  float g = smoothstep(0.2, 0.85, grassNoise1(wp / 7.0 - uWindL * (uWindT * 0.6) + k1 * 0.12));
  B += wd * uGrassWind * (0.25 + 0.75 * g) * (0.7 + 0.6 * k2) * held;
  float bl = length(B);
  if (bl > 1.2) B *= 1.2 / bl;
  float u = bx.x * 0.5 + 0.5, v = bx.y * 0.5 + 0.5;
  float hg = mix(mix(iCorner.x, iCorner.y, u), mix(iCorner.z, iCorner.w, u), v);
  float w = uBladeW * (0.6 + 0.8 * k2) * (1.0 + 0.6 * iGrass.y) * pow(1.0 - t, 0.7);
  // (into the cover map: turned to face the light, as wide as it looks on average (2/pi of it), widened to
  // the least width and as much fainter)
  vGA = 1.0; vGSide = side;
  if (uCover.x > 0.5) {
    vec3 lM = transpose(mat3(modelMatrix)) * uCoverL;
    vec2 hL = vec2(dot(im[0].xyz, lM), dot(im[2].xyz, lM));
    if (dot(hL, hL) > 1e-10) { hL = normalize(hL); p = vec2(-hL.y, hL.x); }
    float wv = w * 0.64, we = max(wv, uCover.y);
    vGA = wv / max(we, 1e-6); w = we;
  }
  vec2 xz = bx + (B * hb * t * t + p * w * side) * uPatchK;
  return vec3(xz.x, hg + snow + hb * t * (1.0 - 0.3 * dot(B, B) * t), xz.y);
}
`;

// a wavelength (nm) as the eye sees it, linear RGB (a rough fit to the CIE curves: Bruton's), past our
// eyes' ends what a flower reflecting there shows us: ultraviolet a pale violet, near-infrared a deep red
function nmRGB(l) {
  let r = 0, g = 0, b = 0;
  if (l < 400) { r = 0.55; g = 0.45; b = 0.85; }
  else if (l < 440) { r = (440 - l) / 40 * 0.6; b = 1; }
  else if (l < 490) { g = (l - 440) / 50; b = 1; }
  else if (l < 510) { g = 1; b = (510 - l) / 20; }
  else if (l < 580) { r = (l - 510) / 70; g = 1; }
  else if (l < 645) { r = 1; g = (645 - l) / 65; }
  else if (l < 750) { r = 1 - 0.4 * (l - 645) / 105; }
  else { r = 0.5; g = 0.05; b = 0.08; }
  return [r * r, g * g, b * b].map((x) => 0.04 + 0.6 * x);
}

export class GrassSet {
  constructor(body, group, pool, shared = null) {
    this.body = body; this.group = group; this.shared = shared;
    // (the recent centuries' fires where it stands: gen/life/fire.js; a tile's grass made again as its
    // fire tile comes in)
    this.fire = pool ? new FireField(body, pool) : null;
    if (this.fire) this.fire.onTile = () => this.invalidate();
    const d = body.data, H = d.history || {};
    this.grade = H.plantGrade ?? -1;
    this.fern = this.grade < 4;
    this.veg = (d.life && d.life.vegColor) || [0.1, 0.2, 0.05];
    this.dry = (d.life && d.life.dryColor) || this.veg;
    this.gK = Math.pow(9.81 / Math.max(d.gravity || 9.81, 1), 0.3);
    // (the flora's species: its meadows, open ground among the stands where no tree stands: flora.js)
    this.species = body._floraSpecies || (body._floraSpecies = floraSpecies(d.terrain));
    this.time = { value: 0 };
    // (the wind: how hard it bends the blades and its way (setWind); a light air barely)
    this.windAmp = { value: 0.3 };
    this.windL = { value: new THREE.Vector3(1, 0, 0) };
    // the blades' shapes, near and further (fewer, broader); a material each (its width, its reach)
    this.geo = {};
    this.mats = {};
    this.coverMats = {};
    for (const [k, L] of Object.entries(LOD)) {
      this.geo[k] = bladeGeometry(this.fern ? Math.round(L.blades * 0.35) : L.blades, L.seg, 0x9e3779b9 ^ (k === 'near' ? 1 : 2));
      const U = {
        uWindT: this.time, uGrassWind: this.windAmp, uWindL: this.windL, uBladeW: { value: L.width * (this.fern ? 5 : 1) * (k === 'far' ? 4 : 1) },
        uFadeR: { value: k === 'near' ? 1e6 : k === 'mid' ? MID_R : FAR_R }, uFadeIn: { value: k === 'far' ? MID_R - 4 : -1e6 }, uPatchK: { value: k === 'far' ? 0.25 : 1 },
        uCover: { value: new THREE.Vector4(0, 0, 0, 0) }, uCoverL: { value: new THREE.Vector3(0, 1, 0) },
      };
      const m = new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0, side: THREE.DoubleSide });
      m.onBeforeCompile = (sh) => {
        Object.assign(sh.uniforms, U);
        sh.vertexShader = sh.vertexShader.replace('#include <common>', `#include <common>\n${GLSL_BLADE}\nuniform vec3 uSunShadowDir;`)
          .replace('#include <beginnormal_vertex>', 'vec3 objectNormal = vec3(0.0, 1.0, 0.0);\n#ifdef USE_TANGENT\nvec3 objectTangent = vec3(1.0, 0.0, 0.0);\n#endif')
          .replace('#include <begin_vertex>', 'vec3 transformed = grassBlade(instanceMatrix);\n  vGS /= max(dot(normalize(mat3(modelMatrix) * instanceMatrix[1].xyz), uSunShadowDir), 0.08);');
        // (both faces lit as the ground is; dark at the foot, light at the tip, a little each its own; the
        // key light's direct share by the sward above, the slant through it the longer the lower the light)
        sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vGT;\nvarying float vGK;\nvarying float vGS;')
          .replace('#include <normal_fragment_begin>', '#include <normal_fragment_begin>\n  normal = normalize( vNormal );')
          .replace('#include <color_fragment>', '#include <color_fragment>\n  diffuseColor.rgb *= mix(0.3, 1.0, pow(vGT, 0.8)) * (0.82 + 0.36 * vGK);')
          .replace('#include <aomap_fragment>', '#include <aomap_fragment>\n  { float sw = exp(-vGS); reflectedLight.directDiffuse *= sw; reflectedLight.directSpecular *= sw; }');
      };
      m.customProgramCacheKey = () => 'grass-blades';
      // (in the sun's shadows and the canopy's: sunShadows.js. It casts none into them: a blade's shadow is
      // thinner than the map's texel, and as the sun moved (a game day's three hours: a hair a frame) and the
      // blades swayed, each came and went frame by frame, a low sun's long shadows flickering across the
      // field (Dave: "flickering every frame dramatically"); the sward shades itself, above, and its shadows
      // on the ground beneath go into the cover map, a share of the light each, faded across its width)
      receiveShadows(m);
      this.mats[k] = m;
      if (k !== 'far') this.coverMats[k] = new THREE.ShaderMaterial({
        uniforms: { ...U, ...SHADOW_LIGHT_UNIFORMS, uCover: { value: new THREE.Vector4(1, COVER_MIN_W, 0, 0) }, uCoverL: SHADOW_LIGHT_UNIFORMS.uLightDir },
        vertexShader: `${GLSL_BLADE}
void main() { gl_Position = projectionMatrix * viewMatrix * modelMatrix * instanceMatrix * vec4(grassBlade(instanceMatrix), 1.0); }`,
        fragmentShader: `varying float vGA;
varying float vGSide;
void main() { gl_FragColor = vec4(vGA * 2.0 * max(0.0, 1.0 - abs(vGSide)), 0.0, 0.0, 1.0); }`,
        side: THREE.DoubleSide, depthTest: false, depthWrite: false,
        blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, blendEquation: THREE.AddEquation,
      });
    }
    // flowers, where flowering plants have evolved (plantGrade 3+): heads coloured in their pollinators'
    // window (the land's animals' eyes: biosphere.js seeing), spread across it and away from the
    // foliage's own colour, and white
    const win = d.life && d.life.biosphere && d.life.biosphere.seeing && d.life.biosphere.seeing.land;
    this.flowerCols = [];
    if (this.grade >= 3) {
      const lo = win ? win.lo : 400, hi = win ? win.hi : 700;
      for (const f of [0.12, 0.45, 0.85]) this.flowerCols.push(nmRGB(lo + (hi - lo) * f));
      this.flowerCols.push([0.62, 0.62, 0.58]);
      this.flowerGeo = new THREE.CircleGeometry(1, 6); this.flowerGeo.rotateX(-Math.PI / 2);
      this.fmat = new THREE.MeshStandardMaterial({ roughness: 0.7, side: THREE.DoubleSide });
      this.fmat.onBeforeCompile = (sh) => { sh.fragmentShader = sh.fragmentShader.replace('#include <normal_fragment_begin>', '#include <normal_fragment_begin>\n  normal = normalize( vNormal );'); };
      receiveShadows(this.fmat);
    }
    this.tiles = new Map(); this.farTiles = new Map(); this.at = null; this.visible = true;
    this._s = new Float64Array(S_LEN); this._uv = { face: 0, u: 0, v: 0 };
  }

  // the wind where the camera is (sim/wind.js): its speed (m/s) bending the blades, its gusts, its way
  // (body-fixed)
  setWind(speed, gust, dirF) {
    this.windAmp.value = Math.min(1.4, (speed / 9) * (0.75 + 0.5 * gust));
    if (dirF) this.windL.value.copy(dirF);
  }

  // the ground under its tiles changed (finer terrain came, the near field built anew): made again
  invalidate() {
    for (const T of this.tiles.values()) this.dropTile(T);
    for (const T of this.farTiles.values()) this.dropTile(T);
    this.tiles.clear(); this.farTiles.clear(); this.at = null;
  }

  dropTile(T) {
    for (const m of Object.values(T.meshes || {})) { if (m) { this.group.remove(m); m.geometry.dispose(); } }
    if (T.flowers) { this.group.remove(T.flowers); T.flowers.dispose(); }
    T.meshes = null; T.flowers = null;
  }

  // camF: the camera, body-fixed
  update(camF) {
    // (the near field's volume made again round a new anchor: the tiles' heights from it again)
    const nf = this.body.near && this.body.near.field;
    if (nf !== this._nf) { this._nf = nf; this.invalidate(); }
    // (the season moved on (its snow, its dry months): made again, every few days of its year)
    const Ls = this.body.solarLongitude();
    if (this._L0 === undefined || Math.abs(Math.atan2(Math.sin(Ls - this._L0), Math.cos(Ls - this._L0))) > 0.03) { this._L0 = Ls; this.invalidate(); }
    const b = this.body, gen = b.terrain, R = b.R, now = performance.now() / 1000;
    this.time.value += Math.min(0.1, Math.max(0, now - (this._t || now))); this._t = now;   // (the wind's: render time)
    const show = (v) => {
      if (v === this.visible) return;
      this.visible = v;
      for (const T of [...this.tiles.values(), ...this.farTiles.values()]) {
        for (const m of Object.values(T.meshes || {})) if (m) m.visible = v && m.userData.on;
        if (T.flowers) T.flowers.visible = v && T.flowers.userData.on;
      }
    };
    if (!gen || !gen.snap || !gen.snap.s.cover || this.grade < 1 || camF.length() - R > HIGH + 2000) { show(false); return; }
    const up = _y.copy(camF).normalize(), alt = camF.length() - R - b.groundHeight(up);
    if (alt > HIGH) { show(false); return; }
    show(true);
    if (this.at && this.at.distanceTo(camF) < MOVE) return;
    this.at = (this.at || new THREE.Vector3()).copy(camF);
    // the tiles about: on the camera's face, within reach, nearest first; each its meshes for its distance
    const uv = faceUVFromDir([up.x, up.y, up.z], this._uv), NT = Math.round(Math.PI * 0.5 * R / TILE);
    const ci = Math.floor((uv.u + 1) * 0.5 * NT), cj = Math.floor((uv.v + 1) * 0.5 * NT), k = Math.ceil(MID_R / TILE) + 1;
    const order = this._order || (this._order = (() => { const o = []; for (let a = -k; a <= k; a++) for (let c = -k; c <= k; c++) o.push([a, c]); return o.sort((p, q) => p[0] * p[0] + p[1] * p[1] - q[0] * q[0] - q[1] * q[1]); })());
    const live = new Set();
    let built = 0, more = false;
    for (const [oi, oj] of order) {
      const i = ci + oi, j = cj + oj;
      if (i < 0 || j < 0 || i >= NT || j >= NT) continue;
      const key = uv.face * 1e10 + i * 1e5 + j;
      let T = this.tiles.get(key);
      // (a few new tiles a frame at most, the nearest first: the rest the frames after, the grass filling in)
      if (!T) { if (built >= 6) { more = true; continue; } T = this.tile(uv.face, i, j, NT); this.tiles.set(key, T); built++; }
      live.add(key);
      if (!T.n) continue;
      const dist = T.pos.distanceTo(camF) - TILE * 0.7;
      const lod = dist < NEAR_R ? 'near' : dist < MID_R ? 'mid' : null;
      T.meshes = T.meshes || {};
      for (const L of Object.keys(LOD)) {
        let m = T.meshes[L];
        if (L === lod && !m) m = T.meshes[L] = this.tileMesh(T, L);
        if (m) { m.userData.on = L === lod; m.visible = m.userData.on && this.visible; }
      }
      if (T.flowers) { T.flowers.userData.on = dist < NEAR_R + 8; T.flowers.visible = T.flowers.userData.on && this.visible; }
    }
    for (const [key, T] of this.tiles) if (!live.has(key)) { this.dropTile(T); if (this.tiles.size > 400) this.tiles.delete(key); }
    // the far tier: 32 m tiles to ~160 m (their 8 m patches' blades fading in past the middle tier's reach)
    const NF = Math.round(Math.PI * 0.5 * R / FAR_TILE), fi = Math.floor((uv.u + 1) * 0.5 * NF), fj = Math.floor((uv.v + 1) * 0.5 * NF), kf = Math.ceil(FAR_R / FAR_TILE) + 1;
    const orderF = this._orderF || (this._orderF = (() => { const o = []; for (let a = -kf; a <= kf; a++) for (let c = -kf; c <= kf; c++) o.push([a, c]); return o.sort((p, q) => p[0] * p[0] + p[1] * p[1] - q[0] * q[0] - q[1] * q[1]); })());
    const liveF = new Set();
    let builtF = 0;
    for (const [oi, oj] of orderF) {
      const i = fi + oi, j = fj + oj;
      if (i < 0 || j < 0 || i >= NF || j >= NF) continue;
      const key = uv.face * 1e10 + i * 1e5 + j;
      let T = this.farTiles.get(key);
      if (!T) { if (builtF >= 2) { more = true; continue; } T = this.tile(uv.face, i, j, NF, FAR_TILE); this.farTiles.set(key, T); builtF++; }
      liveF.add(key);
      if (!T.n) continue;
      const dist = T.pos.distanceTo(camF) - FAR_TILE * 0.7;
      const on = dist < FAR_R && T.pos.distanceTo(camF) + FAR_TILE * 0.7 > MID_R - 10;
      T.meshes = T.meshes || {};
      if (on && !T.meshes.far) T.meshes.far = this.tileMesh(T, 'far', FAR_TILE);
      if (T.meshes.far) { T.meshes.far.userData.on = on; T.meshes.far.visible = on && this.visible; }
    }
    for (const [key, T] of this.farTiles) if (!liveF.has(key)) { this.dropTile(T); if (this.farTiles.size > 200) this.farTiles.delete(key); }
    if (more) this.at = null;
  }

  // a tile's patches as an instanced mesh of a level's blades (its own copy of the instance data; the
  // blades' buffers shared)
  tileMesh(T, L, size = TILE) {
    const G = this.geo[L], g = new THREE.BufferGeometry();
    g.setAttribute('position', G.position); g.setAttribute('normal', G.normal); g.setAttribute('aBlade', G.aBlade); g.setAttribute('aV', G.aV); g.setIndex(G.index);
    g.setAttribute('iCorner', new THREE.InstancedBufferAttribute(T.corner, 4));
    g.setAttribute('iBare', new THREE.InstancedBufferAttribute(T.bare, 4));
    g.setAttribute('iGrass', new THREE.InstancedBufferAttribute(T.grass, 4));
    g.setAttribute('iWave', new THREE.InstancedBufferAttribute(T.wave, 3));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), size * 0.75 + 2);
    const m = new THREE.InstancedMesh(g, this.mats[L], T.n);
    m.instanceMatrix.array.set(T.mat);
    m.instanceColor = new THREE.InstancedBufferAttribute(T.col.slice(), 3);
    m.position.copy(T.pos);
    m.frustumCulled = true;
    m.boundingSphere = new THREE.Sphere(new THREE.Vector3(), size * 0.75 + 2);
    if (this.coverMats[L]) { m.layers.enable(COVER_LAYER); m.userData.coverMat = this.coverMats[L]; }
    this.group.add(m);
    return m;
  }

  // one tile's patches: how thick its country grows them, their ground, their colour (its own hash)
  tile(face, i, j, NT, size = TILE) {
    const b = this.body, gen = b.terrain, R = b.R, s = this._s, snap = gen.snap;
    const du = 2 / NT, u0 = -1 + i * du, v0 = -1 + j * du, dc = [0, 0, 0];
    dirFromFaceUV(face, u0 + du * 0.5, v0 + du * 0.5, dc);
    gen.sample(dc[0], dc[1], dc[2], 4, s);
    const T = { n: 0, pos: new THREE.Vector3(dc[0] * R, dc[1] * R, dc[2] * R) };
    const tC = s[S_TEMP] - 273.15;
    if (tC < -4) return T;
    // (where it can't grow, patch by patch (a creek's bed, sand, a steep face: only there bare, not the whole
    // tile): its water, ice, sand (the rock showing a sand: quartz, coral, black (lithology.js), or a beach's
    // on low ground by the sea, as the terrain shades it: terrain.js shadeSnap))
    const s2 = this._s2 || (this._s2 = new Float64Array(S_LEN));
    const bare = (dd) => {
      gen.sample(dd[0], dd[1], dd[2], 2, s2);
      if (s2[S_SAND] > 0.3 || s2[S_ICE] > 0 || s2[S_WDEPTH] > 0.05 || s2[S_RIVR] > 0 || (gen.p.liquid && s2[S_H] < 0.25)) return true;
      if (snap.rockAt) {
        const hs = s2[S_H] / (gen.hScale || 1);
        if (snap.rockAt(dd[0], dd[1], dd[2], hs) >= 11) return true;
        if (gen.p.liquid === 'water' && s2[S_H] < 14 && snap.rockPyr && snap.rockAt(dd[0], dd[1], dd[2], hs, 0) >= 11) return true;
      }
      return false;
    };
    // (the country's plants: their cover and how open they stand, its rain)
    const c = snap.Gc ? snap.Gc.sample(snap.s.cover, dc) : 0.5, open = snap.s.open ? snap.Gc.sample(snap.s.open, dc) : 0.5, forest = snap.s.forest ? snap.Gc.sample(snap.s.forest, dc) : 0;
    const P = snap.s.P ? snap.Gc.sample(snap.s.P, dc) : 800;
    // (its fires: none the year one's burned, then a flush of green for a few years (a crown fire's opening
    // in a forest: the stands, below))
    let green = 0, ash = 1;
    const F = this.fire ? this.fire.at(dc) : null;
    if (F) {
      if (F.ageG < 1) ash = 0.1;
      else if (F.ageG < 4) green = 1 - F.ageG / 4;
    } else if (this.fire && this.fire.active) T.wait = true;
    // (as thick as the country's green cover; under a wood's stands (gen/life/stands.js) thinned, each patch
    // by the stand where it lies: a closed canopy's shade keeps a few; its crown fires' openings and the open
    // country between grassed over)
    const fo = Math.min(1, forest), share = Math.min(1, c * 1.2) * fo;
    const thick = Math.min(1, Math.max(0, c) * 1.5) * ash;
    if (thick < 0.02) return T;
    // (its ground: the heights at the patches' corners, 5 x 5, as the drawn ground has them: the near
    // field's volume where it's built (sim/nearGround.js), the heightfield's finest mesh beyond)
    const hg = new Float64Array(25), gC = new Float32Array(25), cd = new Float64Array(75), d = [0, 0, 0], V = new THREE.Vector3();
    for (let a = 0; a < 5; a++) for (let bb = 0; bb < 5; bb++) {
      dirFromFaceUV(face, u0 + du * a / 4, v0 + du * bb / 4, d);
      cd[(a * 5 + bb) * 3] = d[0]; cd[(a * 5 + bb) * 3 + 1] = d[1]; cd[(a * 5 + bb) * 3 + 2] = d[2];
      gC[a * 5 + bb] = bare(d) ? 0 : 1;
      const g0 = b.groundHeight(V.set(d[0], d[1], d[2]));
      hg[a * 5 + bb] = b.near && b.near.field ? b.floorAt(V.multiplyScalar(R + g0 + 0.3)) : g0;
    }
    const span = size / PPT;
    // (the tile's own centre on its ground: its meshes there, culled and ranked by distance from there)
    T.pos.set(dc[0], dc[1], dc[2]).multiplyScalar(R + hg[12]);
    const wet = Math.min(1, Math.max(0, (P - 300) / 1200)), warm = Math.min(1, Math.max(0, (tC + 4) / 24));
    // (the season now (worldsim/season.js: the place's year, its swing about its mean and its cold half's
    // rain): this month's warmth and rain, the snow on the ground; a month whose rain is under twice its
    // warmth is dry (Gaussen), the grass cured to straw, in a cold one dormant, browned)
    let snowD = 0, monthDry = 0, cold = 0;
    const yr = this._yr || (this._yr = [0, 0, 0]);
    if (snap.season && snap.season(dc[0], dc[1], dc[2], yr)) {
      const L = b.solarLongitude(), A = Math.hypot(yr[0], yr[1]), ph = L - Math.atan2(yr[1], yr[0]), Tm = tC + A * Math.cos(ph);
      const sh = this.shared;
      if (sh && sh.uSeason && sh.uSeason.value.z > 0.5) {
        const swe = snowWaterNow(yr[0], yr[1], yr[2], tC, L, sh.uSeason.value.y);
        if (swe >= 1e4) return T;
        snowD = swe * SNOW_DEPTH_PER_MM;
      }
      const Pw = Math.max(0, (P - 6 * yr[2]) / 6), Pm = yr[2] + (Pw - yr[2]) * (0.5 + 0.5 * Math.cos(ph));
      const sm = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
      monthDry = Tm > 0 ? sm(1.2, 0.5, Pm / Math.max(2 * Tm, 1)) : 0;
      cold = sm(6, -2, Tm);
    }
    // (how tall it grows, left to itself (Dave: "growing long and wild when it can"): a dry steppe's a hand
    // high, a wet warm country's a metre and more, the cold's low; a burn's regrowth short its first years;
    // taller under a light pull. Grazing to come: the herds' densities, sim/fauna.js)
    const wetG = Math.min(1, Math.max(0, (P - 250) / 1500));
    const H = (this.fern ? 0.4 + 0.5 * wet : 0.1 + 1.3 * Math.pow(wetG, 1.5)) * (0.4 + 0.6 * warm) * (1 - 0.6 * green) * this.gK;
    const dryK = 1 - wet;
    // (its colour: the foliage's where it's wet, straw where it's dry (the world's dry colour, as the ground
    // shades its open country), a fresh burn's green flush; some patches drier)
    const k0 = Math.min(1, 0.55 * dryK + 0.8 * monthDry + 0.7 * cold) * (1 - green);
    const base = this.veg.map((x, q) => (x + (this.dry[q] - x) * k0) * (1.35 + 0.3 * green));
    const dryTip = this.dry.map((x) => x * 1.45);
    // (the patches: their frames, their corners, their density, height and colour)
    const n = PPT * PPT, mat = new Float32Array(n * 16), corner = new Float32Array(n * 4), grows = new Float32Array(n * 4), grass = new Float32Array(n * 4), wave = new Float32Array(n * 3), col = new Float32Array(n * 3);
    let hsh = fmix32((face * 0x9e3779b1) ^ (i * 0x85ebca6b) ^ (j * 0xc2b2ae35));
    const rnd = () => { hsh = fmix32((hsh + 0x6d2b79f5) >>> 0); return hsh / 4294967296; };
    const M = new THREE.Matrix4(), X = new THREE.Vector3(), Y = new THREE.Vector3(), Z = new THREE.Vector3(), Pp = new THREE.Vector3();
    let q = 0;
    for (let a = 0; a < PPT; a++) for (let bb = 0; bb < PPT; bb++) {
      const c00 = hg[a * 5 + bb], c10 = hg[(a + 1) * 5 + bb], c01 = hg[a * 5 + bb + 1], c11 = hg[(a + 1) * 5 + bb + 1], h0 = (c00 + c10 + c01 + c11) / 4;
      dirFromFaceUV(face, u0 + du * (a + 0.5) / PPT, v0 + du * (bb + 0.5) / PPT, d);
      // (too steep (bare rock), or where it can't grow: at its corners, blended across it (the shader))
      const steep = Math.max(Math.abs(c10 - c00), Math.abs(c11 - c01), Math.abs(c01 - c00), Math.abs(c11 - c10)) / span;
      const g00 = gC[a * 5 + bb], g10 = gC[(a + 1) * 5 + bb], g01 = gC[a * 5 + bb + 1], g11 = gC[(a + 1) * 5 + bb + 1];
      if (steep > 0.9 || g00 + g10 + g01 + g11 === 0) { rnd(); rnd(); rnd(); continue; }
      const kS = share > 0 ? standAt(gen, d, s, share, true).k * (1 - meadowAt(gen, d, h0, this.species)) : 0;
      rnd();
      const dens = thick * (1 - 0.68 * kS) * (this.fern ? 0.6 : 1);
      if (dens < 0.01) { rnd(); rnd(); continue; }
      Y.set(d[0], d[1], d[2]);
      // (the frame in metres from its own corners, its blades over [-1, 1]: the cube-sphere's cells aren't
      // squares of the tile's nominal size (away from a face's middle lines up to a third smaller, and
      // skewed); drawn as such, neighbouring patches overlapped and the blades doubled along every edge,
      // lines across the field (Dave))
      const i00 = (a * 5 + bb) * 3, i10 = ((a + 1) * 5 + bb) * 3, i01 = (a * 5 + bb + 1) * 3, i11 = ((a + 1) * 5 + bb + 1) * 3;
      X.set(cd[i10] + cd[i11] - cd[i00] - cd[i01], cd[i10 + 1] + cd[i11 + 1] - cd[i00 + 1] - cd[i01 + 1], cd[i10 + 2] + cd[i11 + 2] - cd[i00 + 2] - cd[i01 + 2]).multiplyScalar(R / 4);
      Z.set(cd[i01] + cd[i11] - cd[i00] - cd[i10], cd[i01 + 1] + cd[i11 + 1] - cd[i00 + 1] - cd[i10 + 1], cd[i01 + 2] + cd[i11 + 2] - cd[i00 + 2] - cd[i10 + 2]).multiplyScalar(R / 4);
      X.addScaledVector(Y, -X.dot(Y)); Z.addScaledVector(Y, -Z.dot(Y));
      Pp.set(d[0] * (R + h0), d[1] * (R + h0), d[2] * (R + h0)).sub(T.pos);
      M.makeBasis(X, Y, Z).setPosition(Pp);
      mat.set(M.elements, q * 16);
      corner[q * 4] = c00 - h0; corner[q * 4 + 1] = c10 - h0; corner[q * 4 + 2] = c01 - h0; corner[q * 4 + 3] = c11 - h0;
      grows[q * 4] = g00; grows[q * 4 + 1] = g10; grows[q * 4 + 2] = g01; grows[q * 4 + 3] = g11;
      rnd();
      const Hp = H;
      grass[q * 4] = Math.min(1, dens); grass[q * 4 + 1] = Hp; grass[q * 4 + 2] = (this.fern ? 0.7 : 0.12 + 0.45 * Math.min(1, Hp / 1.2)) / Math.max(1, Hp * 0.6); grass[q * 4 + 3] = snowD;
      const wx = d[0] * R, wy = d[1] * R, wz = d[2] * R;
      wave[q * 3] = wx - 2048 * Math.floor(wx / 2048); wave[q * 3 + 1] = wy - 2048 * Math.floor(wy / 2048); wave[q * 3 + 2] = wz - 2048 * Math.floor(wz / 2048);
      rnd();
      const tdr = 0.25 * (0.3 + dryK);
      // (the shade's grass under a stand darker, greener: no sun to dry it)
      for (let cc = 0; cc < 3; cc++) col[q * 3 + cc] = (base[cc] + (dryTip[cc] - base[cc]) * tdr * (1 - kS)) * (1 - 0.25 * kS);
      q++;
    }
    T.n = q; T.mat = mat.subarray(0, q * 16); T.corner = corner.subarray(0, q * 4); T.bare = grows.subarray(0, q * 4); T.grass = grass.subarray(0, q * 4); T.wave = wave.subarray(0, q * 3); T.col = col.subarray(0, q * 3);
    // (its flowers: an open, moist grassland's most, a fresh burn's a flush of them; a few heads in a patch,
    // over the grass)
    const fl = this.flowerCols.length ? Math.min(0.25, 0.06 * Math.min(1, open * 1.5) * (0.5 + wet) * (1 + 2 * green)) : 0;
    const per = size === TILE ? Math.round(fl * 40) : 0;
    if (per > 0 && q) {
      const fm = new THREE.InstancedMesh(this.flowerGeo, this.fmat, q * per);
      const P2 = new THREE.Vector3(), Mf = new THREE.Matrix4(), Sf = new THREE.Matrix4();
      let f = 0;
      for (let p = 0; p < q; p++) {
        M.fromArray(T.mat, p * 16);
        for (let e = 0; e < per; e++) {
          const x = rnd() * 2 - 1, z = rnd() * 2 - 1, u = x * 0.5 + 0.5, v = z * 0.5 + 0.5;
          const hgp = (T.corner[p * 4] * (1 - u) + T.corner[p * 4 + 1] * u) * (1 - v) + (T.corner[p * 4 + 2] * (1 - u) + T.corner[p * 4 + 3] * u) * v;
          const fs = 0.02 + 0.025 * rnd();
          P2.set(x, hgp + T.grass[p * 4 + 1] * (0.7 + 0.3 * rnd()), z).applyMatrix4(M);
          Sf.makeScale(fs, fs, fs);
          Mf.extractRotation(M).multiply(Sf).setPosition(P2);
          fm.setMatrixAt(f, Mf);
          const fc = this.flowerCols[Math.floor(rnd() * this.flowerCols.length)];
          fm.setColorAt(f, _c.setRGB(fc[0], fc[1], fc[2]));
          f++;
        }
      }
      fm.count = f; fm.position.copy(T.pos); fm.frustumCulled = false; fm.visible = false;
      this.group.add(fm);
      T.flowers = fm;
    }
    return T;
  }

  dispose() {
    this.invalidate();
    for (const L of Object.keys(this.mats)) this.mats[L].dispose();
    for (const L of Object.keys(this.coverMats)) this.coverMats[L].dispose();
    if (this.fmat) { this.fmat.dispose(); this.flowerGeo.dispose(); }
  }
}
