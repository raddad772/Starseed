// The ground's colour and its shore as seen from afar (gen/colourmap.js), the six cube faces in one array
// texture: the terrain's far chunks, their vertices kilometres apart, read their colour and where the water
// is from it past where it's finer than they are (terrainMaterial.js, webgpu/shaders.js TERRAIN), so from
// orbit a coast, a forest's edge, the shallows are the map's fineness, not the vertices' blocks. Built by the
// workers in strips (a face is seconds' work: in one job it held a worker from the near ground's chunks),
// when the world is near; again when its terrain changes. ?cmap=0 turns it off, ?cmap=N its size.
import * as THREE from 'three';
import { COLOUR_SHORE_R } from '../gen/colourmap.js';

const q = typeof location !== 'undefined' ? /[?&]cmap=(\d+)/.exec(location.search) : null;
export const COLOUR_SIZE = q ? +q[1] : 1024;
const STRIP = 64;

export class ColourCube {
  constructor(body, pool) {
    this.body = body;
    this.pool = pool;
    this.state = 0;   // 0 none, 1 building, 2 ready
    const blank = new THREE.DataArrayTexture(new Uint8Array(4 * 6), 1, 1, 6);
    blank.needsUpdate = true;
    // x on, y face size (texels), z a texel's width (m), w the shore distance's reach (texels)
    this.uniforms = { tColourCube: { value: blank }, uColourCube: { value: new THREE.Vector4(0, 1, 1, 0) } };
  }

  build() {
    if (!COLOUR_SIZE || this.state === 1) return;
    this.state = 1;
    const gen = this.gen = (this.gen || 0) + 1, size = COLOUR_SIZE, n = size * size;
    const jobs = this.jobs = [];
    for (let face = 0; face < 6; face++) for (let j0 = 0; j0 < size; j0 += STRIP) {
      jobs.push(this.pool.submit({ type: 'cface', body: this.body.data.id, face, size, j0, j1: Math.min(size, j0 + STRIP) }, 13));
    }
    Promise.all(jobs.map((jb, k) => jb.promise.then((r) => ({ face: Math.floor(k / Math.ceil(size / STRIP)), j0: (k % Math.ceil(size / STRIP)) * STRIP, px: r.px })))).then((strips) => {
      if (gen !== this.gen) return;
      const px = new Uint8Array(6 * n * 4);
      for (const s of strips) px.set(s.px, (s.face * n + s.j0 * size) * 4);
      for (let f = 0; f < 6; f++) shoreDistance(px, f * n * 4, size);
      const t = new THREE.DataArrayTexture(px, size, size, 6);
      t.magFilter = t.minFilter = THREE.LinearFilter; t.generateMipmaps = false;
      t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
      t.needsUpdate = true;
      const old = this.uniforms.tColourCube.value;
      this.uniforms.tColourCube.value = t;
      this.uniforms.uColourCube.value.set(1, size, (Math.PI / 2) * this.body.R / size, COLOUR_SHORE_R);
      if (old) old.dispose();
      this.state = 2; this.jobs = null;
    }, () => { if (gen === this.gen) this.state = 0; });
  }

  // the terrain changed under it (a simulated world arrived): build it again (what's still queued for the
  // old one dropped: a minute's work that would only be thrown away)
  invalidate() {
    if (this.jobs) for (const jb of this.jobs) this.pool.cancel(jb);
    this.jobs = null;
    this.state = 0; this.gen = (this.gen || 0) + 1; this.uniforms.uColourCube.value.x = 0;
  }
}

// a face's shore distance into its texels' alpha (they come with 255 for water, 0 for land): two passes,
// chamfer (1 along, 1.4 across), to the nearest texel of the other kind less half a texel, signed (+ under
// the water), COLOUR_SHORE_R texels each way over the byte's half
function shoreDistance(px, o, size) {
  const R = COLOUR_SHORE_R, n = size * size, wet = new Uint8Array(n), D = new Float32Array(n).fill(R + 1);
  for (let k = 0; k < n; k++) wet[k] = px[o + k * 4 + 3] > 127 ? 1 : 0;
  for (let j = 0; j < size; j++) for (let i = 0; i < size; i++) {
    const k = j * size + i, w = wet[k];
    if ((i > 0 && wet[k - 1] !== w) || (i < size - 1 && wet[k + 1] !== w) || (j > 0 && wet[k - size] !== w) || (j < size - 1 && wet[k + size] !== w)) D[k] = 0.5;
  }
  const relax = (k, q2, c) => { if (D[q2] + c < D[k]) D[k] = D[q2] + c; };
  for (let j = 0; j < size; j++) for (let i = 0; i < size; i++) {
    const k = j * size + i;
    if (i > 0) relax(k, k - 1, 1);
    if (j > 0) { relax(k, k - size, 1); if (i > 0) relax(k, k - size - 1, 1.414); if (i < size - 1) relax(k, k - size + 1, 1.414); }
  }
  for (let j = size - 1; j >= 0; j--) for (let i = size - 1; i >= 0; i--) {
    const k = j * size + i;
    if (i < size - 1) relax(k, k + 1, 1);
    if (j < size - 1) { relax(k, k + size, 1); if (i < size - 1) relax(k, k + size + 1, 1.414); if (i > 0) relax(k, k + size - 1, 1.414); }
  }
  for (let k = 0; k < n; k++) px[o + k * 4 + 3] = Math.max(1, Math.min(255, Math.round(128 + (wet[k] ? 1 : -1) * Math.min(D[k], R) / R * 127)));
}

// the lookup (terrainMaterial.js): a planet-fixed direction's texel (rgb the colour's square root, a the
// shore's distance: 0.5 at the shore, more under the water), and how much the map stands for the vertices
// at a distance (m): from thirty of its texels away, all of it by sixty (the far chunks' vertices are then
// coarser than its texels)
export const GLSL_COLOUR_CUBE = /* glsl */`
uniform highp sampler2DArray tColourCube;
uniform vec4 uColourCube;
float colourCubeK(float dist) { return uColourCube.x * smoothstep(30.0 * uColourCube.z, 60.0 * uColourCube.z, dist); }
// (its alpha as the shore's distance, texels (+ under the water); and as the mesh's vShore has it, over
// four of them)
float colourCubeShore(float a) { return (a * 255.0 - 128.0) / 127.0 * uColourCube.w; }
float colourCubeShoreV(float a) { return clamp(colourCubeShore(a) / 4.0, -1.0, 1.0); }
vec4 colourCubeAt(vec3 d) {
  vec3 a = abs(d), N, U, V;
  float f;
  if (a.x >= a.y && a.x >= a.z) {
    if (d.x >= 0.0) { f = 0.0; N = vec3(1.0, 0.0, 0.0); U = vec3(0.0, 0.0, -1.0); } else { f = 1.0; N = vec3(-1.0, 0.0, 0.0); U = vec3(0.0, 0.0, 1.0); }
    V = vec3(0.0, 1.0, 0.0);
  } else if (a.y >= a.z) {
    U = vec3(1.0, 0.0, 0.0);
    if (d.y >= 0.0) { f = 2.0; N = vec3(0.0, 1.0, 0.0); V = vec3(0.0, 0.0, -1.0); } else { f = 3.0; N = vec3(0.0, -1.0, 0.0); V = vec3(0.0, 0.0, 1.0); }
  } else {
    V = vec3(0.0, 1.0, 0.0);
    if (d.z >= 0.0) { f = 4.0; N = vec3(0.0, 0.0, 1.0); U = vec3(1.0, 0.0, 0.0); } else { f = 5.0; N = vec3(0.0, 0.0, -1.0); U = vec3(-1.0, 0.0, 0.0); }
  }
  float dn = dot(d, N);
  vec2 uv = vec2(atan(dot(d, U) / dn), atan(dot(d, V) / dn)) / 0.7853981634 * 0.5 + 0.5, h = vec2(0.5 / max(uColourCube.y, 1.0));
  return textureLod(tColourCube, vec3(clamp(uv, h, 1.0 - h), f), 0.0);
}
// its shore's distance (texels) read smoothly: the texels' cubic B-spline, four filtered reads (Sigg and
// Hadwiger 2005), its slope unbroken from texel to texel (the surf's crests' slopes: liquid.js; read
// bilinearly they turned at every texel's edge, slabs of the sea lit apart)
float colourCubeShoreSmooth(vec3 d) {
  vec3 a = abs(d), N, U, V;
  float f;
  if (a.x >= a.y && a.x >= a.z) {
    if (d.x >= 0.0) { f = 0.0; N = vec3(1.0, 0.0, 0.0); U = vec3(0.0, 0.0, -1.0); } else { f = 1.0; N = vec3(-1.0, 0.0, 0.0); U = vec3(0.0, 0.0, 1.0); }
    V = vec3(0.0, 1.0, 0.0);
  } else if (a.y >= a.z) {
    U = vec3(1.0, 0.0, 0.0);
    if (d.y >= 0.0) { f = 2.0; N = vec3(0.0, 1.0, 0.0); V = vec3(0.0, 0.0, -1.0); } else { f = 3.0; N = vec3(0.0, -1.0, 0.0); V = vec3(0.0, 0.0, 1.0); }
  } else {
    V = vec3(0.0, 1.0, 0.0);
    if (d.z >= 0.0) { f = 4.0; N = vec3(0.0, 0.0, 1.0); U = vec3(1.0, 0.0, 0.0); } else { f = 5.0; N = vec3(0.0, 0.0, -1.0); U = vec3(-1.0, 0.0, 0.0); }
  }
  float dn = dot(d, N), S = max(uColourCube.y, 1.0);
  vec2 x = (vec2(atan(dot(d, U) / dn), atan(dot(d, V) / dn)) / 0.7853981634 * 0.5 + 0.5) * S - 0.5;
  vec2 i = floor(x), t = x - i, t2 = t * t, t3 = t2 * t;
  vec2 w0 = (1.0 - 3.0 * t + 3.0 * t2 - t3) / 6.0, w1 = (4.0 - 6.0 * t2 + 3.0 * t3) / 6.0, w2 = (1.0 + 3.0 * t + 3.0 * t2 - 3.0 * t3) / 6.0, w3 = t3 / 6.0;
  vec2 g0 = w0 + w1, g1 = w2 + w3, h0 = (i - 0.5 + w1 / g0) / S, h1 = (i + 1.5 + w3 / g1) / S, e = vec2(0.5 / S);
  float a00 = textureLod(tColourCube, vec3(clamp(vec2(h0.x, h0.y), e, 1.0 - e), f), 0.0).a, a10 = textureLod(tColourCube, vec3(clamp(vec2(h1.x, h0.y), e, 1.0 - e), f), 0.0).a;
  float a01 = textureLod(tColourCube, vec3(clamp(vec2(h0.x, h1.y), e, 1.0 - e), f), 0.0).a, a11 = textureLod(tColourCube, vec3(clamp(vec2(h1.x, h1.y), e, 1.0 - e), f), 0.0).a;
  return colourCubeShore(g0.y * (g0.x * a00 + g1.x * a10) + g1.y * (g0.x * a01 + g1.x * a11));
}
`;
