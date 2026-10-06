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
import { SHADOW_LAYER, SHADOW_LIGHT_UNIFORMS, receiveShadows } from './sunShadows.js';
import { standAt } from '../gen/life/stands.js';
import { floraSpecies, meadowAt } from '../gen/flora.js';

const TILE = 8, PPT = 4, NEAR_R = 16, MID_R = 44, HIGH = 60, MOVE = 1.2;
const LOD = { near: { blades: 1400, seg: 2, width: 0.007 }, mid: { blades: 600, seg: 1, width: 0.014 } };
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

// a blade's shape, shared by the lit material and the shadows': from its patch's instance data
//   iCorner: the ground's heights at the patch's corners over its centre's plane (u-v-, u+v-, u-v+, u+v+)
//   iGrass: density (0..1), height (m), how wild (its own lean), (unused)
//   iWave: where the patch lies (body-fixed x, z, wrapped): the gusts' phase runs across it
const GLSL_BLADE = /* glsl */`
attribute vec4 aBlade;
attribute vec2 aV;
attribute vec4 iCorner;
attribute vec4 iGrass;
attribute vec2 iWave;
uniform float uWindT;
uniform float uGrassWind;
uniform vec3 uWindL;
uniform float uBladeW;
uniform float uFadeR;
varying float vGT;
varying float vGK;
vec3 grassBlade(mat4 im) {
  vec4 pc = modelMatrix * im * vec4(0.0, 0.0, 0.0, 1.0);
  float dens = iGrass.x * (1.0 - smoothstep(uFadeR * 0.7, uFadeR, length(pc.xyz)));
  vGT = aV.x; vGK = fract(aBlade.z * 13.71);
  if (aBlade.z >= dens) return vec3(0.0);
  float t = aV.x, side = aV.y;
  float k1 = fract(aBlade.z * 7.31), k2 = fract(aBlade.z * 3.17 + aBlade.w * 0.13);
  float hb = iGrass.y * (0.45 + 0.9 * k1);
  vec2 f = vec2(cos(aBlade.w), sin(aBlade.w)), p = vec2(-f.y, f.x);
  // (its own lean, the wilder the more; the wind's bend, a gust's wave running across in its way)
  vec2 B = f * iGrass.z * (0.15 + 0.85 * k2);
  vec3 wl = transpose(mat3(im)) * uWindL;
  vec2 wd = length(wl.xz) > 1e-4 ? normalize(wl.xz) : vec2(1.0, 0.0);
  vec3 off = mat3(im) * vec3(aBlade.x, 0.0, aBlade.y);
  vec2 wF = length(uWindL.xz) > 1e-4 ? normalize(uWindL.xz) : vec2(1.0, 0.0);
  float ph = dot(iWave + off.xz, wF) * 0.35 - uWindT * 2.2 + k1 * 0.6;
  float g = 0.5 + 0.5 * sin(ph) * (0.7 + 0.3 * sin(ph * 2.3 + 1.7));
  B += wd * uGrassWind * (0.25 + 0.75 * g) * (0.7 + 0.6 * k2);
  float bl = length(B);
  if (bl > 1.2) B *= 1.2 / bl;
  float u = aBlade.x * 0.5 + 0.5, v = aBlade.y * 0.5 + 0.5;
  float hg = mix(mix(iCorner.x, iCorner.y, u), mix(iCorner.z, iCorner.w, u), v);
  float w = uBladeW * (0.6 + 0.8 * k2) * (1.0 + 0.6 * iGrass.y) * pow(1.0 - t, 0.7);
  vec2 xz = vec2(aBlade.x, aBlade.y) + B * hb * t * t + p * w * side;
  return vec3(xz.x, hg + hb * t * (1.0 - 0.3 * dot(B, B) * t), xz.y);
}
`;

// its shadow (sunShadows.js): the blades as drawn, their distance from the light
function bladeDepthMaterial(uniforms) {
  return new THREE.ShaderMaterial({
    uniforms: { ...SHADOW_LIGHT_UNIFORMS, ...uniforms },
    vertexShader: `
uniform vec3 uLightPos;
uniform vec3 uLightDir;
varying float vD;
${GLSL_BLADE}
void main() {
  vec4 wp = modelMatrix * instanceMatrix * vec4(grassBlade(instanceMatrix), 1.0);
  vD = dot(uLightPos - wp.xyz, uLightDir);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`,
    fragmentShader: `
varying float vD;
void main() { gl_FragColor = vec4(vD, 0.0, 0.0, 1.0); }`,
    side: THREE.DoubleSide,
  });
}

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
  constructor(body, group, pool) {
    this.body = body; this.group = group;
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
    this.shadowMats = {};
    for (const [k, L] of Object.entries(LOD)) {
      this.geo[k] = bladeGeometry(this.fern ? Math.round(L.blades * 0.35) : L.blades, L.seg, 0x9e3779b9 ^ (k === 'near' ? 1 : 2));
      const U = { uWindT: this.time, uGrassWind: this.windAmp, uWindL: this.windL, uBladeW: { value: L.width * (this.fern ? 5 : 1) }, uFadeR: { value: k === 'near' ? 1e6 : MID_R } };
      const m = new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0, side: THREE.DoubleSide });
      m.onBeforeCompile = (sh) => {
        Object.assign(sh.uniforms, U);
        sh.vertexShader = sh.vertexShader.replace('#include <common>', `#include <common>\n${GLSL_BLADE}`)
          .replace('#include <beginnormal_vertex>', 'vec3 objectNormal = vec3(0.0, 1.0, 0.0);\n#ifdef USE_TANGENT\nvec3 objectTangent = vec3(1.0, 0.0, 0.0);\n#endif')
          .replace('#include <begin_vertex>', 'vec3 transformed = grassBlade(instanceMatrix);');
        // (both faces lit as the ground is; dark at the foot, light at the tip, a little each its own)
        sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vGT;\nvarying float vGK;')
          .replace('#include <normal_fragment_begin>', '#include <normal_fragment_begin>\n  normal = normalize( vNormal );')
          .replace('#include <color_fragment>', '#include <color_fragment>\n  diffuseColor.rgb *= mix(0.3, 1.0, pow(vGT, 0.8)) * (0.82 + 0.36 * vGK);');
      };
      m.customProgramCacheKey = () => 'grass-blades';
      // (in the sun's shadows and the canopy's: sunShadows.js)
      receiveShadows(m);
      this.mats[k] = m;
      this.shadowMats[k] = bladeDepthMaterial(U);
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
    this.tiles = new Map(); this.at = null; this.visible = true;
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
    this.tiles.clear(); this.at = null;
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
    const b = this.body, gen = b.terrain, R = b.R, now = performance.now() / 1000;
    this.time.value += Math.min(0.1, Math.max(0, now - (this._t || now))); this._t = now;   // (the wind's: render time)
    const show = (v) => {
      if (v === this.visible) return;
      this.visible = v;
      for (const T of this.tiles.values()) {
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
    if (more) this.at = null;
  }

  // a tile's patches as an instanced mesh of a level's blades (its own copy of the instance data; the
  // blades' buffers shared)
  tileMesh(T, L) {
    const G = this.geo[L], g = new THREE.BufferGeometry();
    g.setAttribute('position', G.position); g.setAttribute('normal', G.normal); g.setAttribute('aBlade', G.aBlade); g.setAttribute('aV', G.aV); g.setIndex(G.index);
    g.setAttribute('iCorner', new THREE.InstancedBufferAttribute(T.corner, 4));
    g.setAttribute('iGrass', new THREE.InstancedBufferAttribute(T.grass, 4));
    g.setAttribute('iWave', new THREE.InstancedBufferAttribute(T.wave, 2));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), TILE * 0.75 + 2);
    const m = new THREE.InstancedMesh(g, this.mats[L], T.n);
    m.instanceMatrix.array.set(T.mat);
    m.instanceColor = new THREE.InstancedBufferAttribute(T.col.slice(), 3);
    m.position.copy(T.pos);
    m.frustumCulled = true;
    m.boundingSphere = new THREE.Sphere(new THREE.Vector3(), TILE * 0.75 + 2);
    if (L === 'near') { m.layers.enable(SHADOW_LAYER); m.userData.shadowNearOnly = true; m.userData.shadowMat = this.shadowMats[L]; }
    this.group.add(m);
    return m;
  }

  // one tile's patches: how thick its country grows them, their ground, their colour (its own hash)
  tile(face, i, j, NT) {
    const b = this.body, gen = b.terrain, R = b.R, s = this._s, snap = gen.snap;
    const du = 2 / NT, u0 = -1 + i * du, v0 = -1 + j * du, dc = [0, 0, 0];
    dirFromFaceUV(face, u0 + du * 0.5, v0 + du * 0.5, dc);
    gen.sample(dc[0], dc[1], dc[2], 4, s);
    const T = { n: 0, pos: new THREE.Vector3(dc[0] * R, dc[1] * R, dc[2] * R) };
    const tC = s[S_TEMP] - 273.15;
    if (s[S_SAND] > 0.3 || s[S_ICE] > 0 || s[S_WDEPTH] > 0.05 || s[S_RIVR] > 0 || tC < -4 || (gen.p.liquid && s[S_H] < 0.25)) return T;
    // (nor on sand: the rock showing a sand (quartz, coral, black: lithology.js), or a beach's on low
    // ground by the sea, as the terrain shades it (terrain.js shadeSnap))
    if (snap.rockAt) {
      const hs = s[S_H] / (gen.hScale || 1);
      if (snap.rockAt(dc[0], dc[1], dc[2], hs) >= 11) return T;
      if (gen.p.liquid === 'water' && s[S_H] < 14 && snap.rockPyr && snap.rockAt(dc[0], dc[1], dc[2], hs, 0) >= 11) return T;
    }
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
    const hg = new Float64Array(25), d = [0, 0, 0], V = new THREE.Vector3();
    for (let a = 0; a < 5; a++) for (let bb = 0; bb < 5; bb++) {
      dirFromFaceUV(face, u0 + du * a / 4, v0 + du * bb / 4, d);
      const g0 = b.groundHeight(V.set(d[0], d[1], d[2]));
      hg[a * 5 + bb] = b.near && b.near.field ? b.floorAt(V.multiplyScalar(R + g0 + 0.3)) : g0;
    }
    // (too steep: bare rock)
    const span = TILE / PPT;
    let steep = 0;
    for (let a = 0; a < 4; a++) for (let bb = 0; bb < 4; bb++) steep = Math.max(steep, Math.abs(hg[(a + 1) * 5 + bb] - hg[a * 5 + bb]) / span, Math.abs(hg[a * 5 + bb + 1] - hg[a * 5 + bb]) / span);
    if (steep > 0.9) return T;
    // (the tile's own centre on its ground: its meshes there, culled and ranked by distance from there)
    T.pos.set(dc[0], dc[1], dc[2]).multiplyScalar(R + hg[12]);
    const wet = Math.min(1, Math.max(0, (P - 300) / 1200)), warm = Math.min(1, Math.max(0, (tC + 4) / 24));
    // (how tall it grows, left to itself (Dave: "growing long and wild when it can"): a dry steppe's a hand
    // high, a wet warm country's a metre and more, the cold's low; a burn's regrowth short its first years;
    // taller under a light pull. Grazing to come: the herds' densities, sim/fauna.js)
    const wetG = Math.min(1, Math.max(0, (P - 250) / 1500));
    const H = (this.fern ? 0.4 + 0.5 * wet : 0.1 + 1.3 * Math.pow(wetG, 1.5)) * (0.4 + 0.6 * warm) * (1 - 0.6 * green) * this.gK;
    const dryK = 1 - wet;
    // (its colour: the foliage's where it's wet, straw where it's dry (the world's dry colour, as the ground
    // shades its open country), a fresh burn's green flush; some patches drier)
    const k0 = Math.min(1, dryK * 1.1) * (1 - green);
    const base = this.veg.map((x, q) => (x + (this.dry[q] - x) * k0) * (1.35 + 0.3 * green));
    const dryTip = this.dry.map((x) => x * 1.45);
    // (the patches: their frames, their corners, their density, height and colour)
    const eu = [0, 0, 0], ev = [0, 0, 0];
    dirFromFaceUV(face, u0 + du, v0 + du * 0.5, eu); dirFromFaceUV(face, u0 + du * 0.5, v0 + du, ev);
    const EU = new THREE.Vector3(eu[0] - dc[0], eu[1] - dc[1], eu[2] - dc[2]), EV = new THREE.Vector3(ev[0] - dc[0], ev[1] - dc[1], ev[2] - dc[2]);
    const n = PPT * PPT, mat = new Float32Array(n * 16), corner = new Float32Array(n * 4), grass = new Float32Array(n * 4), wave = new Float32Array(n * 2), col = new Float32Array(n * 3);
    let hsh = fmix32((face * 0x9e3779b1) ^ (i * 0x85ebca6b) ^ (j * 0xc2b2ae35));
    const rnd = () => { hsh = fmix32((hsh + 0x6d2b79f5) >>> 0); return hsh / 4294967296; };
    const M = new THREE.Matrix4(), X = new THREE.Vector3(), Y = new THREE.Vector3(), Z = new THREE.Vector3(), Pp = new THREE.Vector3();
    let q = 0;
    for (let a = 0; a < PPT; a++) for (let bb = 0; bb < PPT; bb++) {
      const c00 = hg[a * 5 + bb], c10 = hg[(a + 1) * 5 + bb], c01 = hg[a * 5 + bb + 1], c11 = hg[(a + 1) * 5 + bb + 1], h0 = (c00 + c10 + c01 + c11) / 4;
      dirFromFaceUV(face, u0 + du * (a + 0.5) / PPT, v0 + du * (bb + 0.5) / PPT, d);
      const kS = share > 0 ? standAt(gen, d, s, share, true).k * (1 - meadowAt(gen, d, h0, this.species)) : 0;
      const dens = thick * (1 - 0.9 * kS) * (this.fern ? 0.6 : 1) * (0.8 + 0.4 * rnd());
      if (dens < 0.01) { rnd(); rnd(); continue; }
      Y.set(d[0], d[1], d[2]);
      X.copy(EU).addScaledVector(Y, -EU.dot(Y)).normalize();
      Z.copy(EV).addScaledVector(Y, -EV.dot(Y)).addScaledVector(X, -EV.dot(X)).normalize();
      // (the frame in metres: the patch's half-side along u and v, its blades over [-1, 1])
      const hs = span / 2;
      Pp.set(d[0] * (R + h0), d[1] * (R + h0), d[2] * (R + h0)).sub(T.pos);
      M.makeBasis(X.multiplyScalar(hs), Y, Z.multiplyScalar(hs)).setPosition(Pp);
      mat.set(M.elements, q * 16);
      corner[q * 4] = c00 - h0; corner[q * 4 + 1] = c10 - h0; corner[q * 4 + 2] = c01 - h0; corner[q * 4 + 3] = c11 - h0;
      const Hp = H * (0.85 + 0.3 * rnd());
      grass[q * 4] = Math.min(1, dens); grass[q * 4 + 1] = Hp; grass[q * 4 + 2] = (this.fern ? 0.7 : 0.12 + 0.45 * Math.min(1, Hp / 1.2)) / Math.max(1, Hp * 0.6); grass[q * 4 + 3] = 0;
      const wx = d[0] * R, wz = d[2] * R;
      wave[q * 2] = wx - 2048 * Math.floor(wx / 2048); wave[q * 2 + 1] = wz - 2048 * Math.floor(wz / 2048);
      const tdr = rnd() * 0.5 * (0.3 + dryK);
      for (let cc = 0; cc < 3; cc++) col[q * 3 + cc] = base[cc] + (dryTip[cc] - base[cc]) * tdr;
      q++;
    }
    T.n = q; T.mat = mat.subarray(0, q * 16); T.corner = corner.subarray(0, q * 4); T.grass = grass.subarray(0, q * 4); T.wave = wave.subarray(0, q * 2); T.col = col.subarray(0, q * 3);
    // (its flowers: an open, moist grassland's most, a fresh burn's a flush of them; a few heads in a patch,
    // over the grass)
    const fl = this.flowerCols.length ? Math.min(0.25, 0.06 * Math.min(1, open * 1.5) * (0.5 + wet) * (1 + 2 * green)) : 0;
    const per = Math.round(fl * 40);
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
    for (const L of Object.keys(this.mats)) { this.mats[L].dispose(); this.shadowMats[L].dispose(); }
    if (this.fmat) { this.fmat.dispose(); this.flowerGeo.dispose(); }
  }
}
