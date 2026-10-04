// The ground's shadows on itself: each pixel marches toward the sun through a coarse copy of the
// world's heights (gen/heightmap.js, the six cube faces in one array texture) and is shadowed where
// the ray passes under the ground: a mountain's shadow across the valley below it, on the plain at
// sunset, on the night side's edge from orbit. Coarse (a face SIZE texels: ~300 m on an Earth drawn at
// 1/64); finer relief near the camera is the near shadows' (to come). ?hshadow=0 turns it off.
import * as THREE from 'three';

const q = typeof location !== 'undefined' ? /[?&]hshadow=(\d+)/.exec(location.search) : null;
export const SHADOW_SIZE = q ? +q[1] : 512;

export class HeightCube {
  constructor(body, pool) {
    this.body = body;
    this.pool = pool;
    this.state = 0;   // 0 none, 1 building, 2 ready
    const blank = new THREE.DataArrayTexture(new Uint16Array(6), 1, 1, 6);
    blank.format = THREE.RedFormat; blank.type = THREE.HalfFloatType; blank.needsUpdate = true;
    // x on, y face size (texels), z the highest ground (m), w a texel's width (m)
    this.uniforms = { tHeightCube: { value: blank }, uHeightCube: { value: new THREE.Vector4(0, 1, 0, 1) } };
  }

  // its six faces from the workers (again when the world's terrain changes: generation)
  build() {
    if (!SHADOW_SIZE || this.state === 1) return;
    this.state = 1;
    const gen = this.gen = (this.gen || 0) + 1, size = SHADOW_SIZE;
    const jobs = [0, 1, 2, 3, 4, 5].map((face) => this.pool.submit({ type: 'hface', body: this.body.data.id, face, size }, 12));
    Promise.all(jobs.map((j) => j.promise)).then((faces) => {
      if (gen !== this.gen) return;
      const n = size * size, half = new Uint16Array(6 * n);
      let top = -Infinity;
      faces.forEach((r, f) => {
        const h = r.h;
        for (let k = 0; k < n; k++) { half[f * n + k] = THREE.DataUtils.toHalfFloat(h[k]); if (h[k] > top) top = h[k]; }
      });
      const t = new THREE.DataArrayTexture(half, size, size, 6);
      t.format = THREE.RedFormat; t.type = THREE.HalfFloatType;
      t.magFilter = t.minFilter = THREE.LinearFilter; t.generateMipmaps = false;
      t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
      t.needsUpdate = true;
      const old = this.uniforms.tHeightCube.value;
      this.uniforms.tHeightCube.value = t;
      this.uniforms.uHeightCube.value.set(1, size, top, (Math.PI / 2) * this.body.R / size);
      if (old) old.dispose();
      this.state = 2;
    }, () => { if (gen === this.gen) this.state = 0; });
  }

  // the terrain changed under it (a simulated world arrived): build it again
  invalidate() { this.state = 0; this.gen = (this.gen || 0) + 1; }
}

// the march. pF: the point from the world's centre, its up, sF the sun (all planet-fixed); R the
// datum. Steps from a texel out, growing 1.35x, until above the highest ground; a soft edge (~2
// degrees: the heights are coarse). A pixel in a hollow finer than the texels stands below their
// surface: that depth is let go of over the first few texels, so it doesn't shade itself.
export const GLSL_TERRAIN_SHADOW = /* glsl */`
uniform highp sampler2DArray tHeightCube;
uniform vec4 uHeightCube;
const vec3 HC_N[6] = vec3[6](vec3(1, 0, 0), vec3(-1, 0, 0), vec3(0, 1, 0), vec3(0, -1, 0), vec3(0, 0, 1), vec3(0, 0, -1));
const vec3 HC_U[6] = vec3[6](vec3(0, 0, -1), vec3(0, 0, 1), vec3(1, 0, 0), vec3(1, 0, 0), vec3(1, 0, 0), vec3(-1, 0, 0));
const vec3 HC_V[6] = vec3[6](vec3(0, 1, 0), vec3(0, 1, 0), vec3(0, 0, -1), vec3(0, 0, 1), vec3(0, 1, 0), vec3(0, 1, 0));
float heightCubeAt(vec3 d) {
  vec3 a = abs(d);
  int f = a.x >= a.y && a.x >= a.z ? (d.x >= 0.0 ? 0 : 1) : a.y >= a.z ? (d.y >= 0.0 ? 2 : 3) : (d.z >= 0.0 ? 4 : 5);
  float dn = dot(d, HC_N[f]);
  vec2 uv = vec2(atan(dot(d, HC_U[f]) / dn), atan(dot(d, HC_V[f]) / dn)) / 0.785398 * 0.5 + 0.5;
  return textureLod(tHeightCube, vec3(uv, float(f)), 0.0).r;
}
float terrainShadow(vec3 pF, vec3 up, vec3 sF, float R) {
  if (uHeightCube.x < 0.5 || dot(up, sF) < -0.2) return 1.0;
  float texel = uHeightCube.w, top = R + uHeightCube.z;
  float r0 = length(pF);
  float below = max(0.0, R + heightCubeAt(up) - r0);
  vec3 o = pF + up * texel * 0.1;
  float t = texel, sh = 1.0;
  for (int i = 0; i < 28; i++) {
    vec3 qp = o + sF * t;
    float rq = length(qp);
    if (rq > top) break;
    float d = rq - (R + heightCubeAt(qp / rq)) + below * exp(-t / (3.0 * texel));
    sh = min(sh, clamp(d / (t * 0.035) + 0.5, 0.0, 1.0));
    if (sh <= 0.0) break;
    t *= 1.35;
  }
  return sh;
}
// the same for a point in the air (pF planet-fixed, above the ground): the air in a mountain's shadow
// gives no sunlight back, its haze dark between you and the shadowed ground (it hid the shadow) and a
// low sun's shafts through the gaps; fewer, longer steps
float airShadow(vec3 pF, vec3 sF, float R) {
  float texel = uHeightCube.w, top = R + uHeightCube.z;
  float t = texel, sh = 1.0;
  for (int i = 0; i < 16; i++) {
    vec3 qp = pF + sF * t;
    float rq = length(qp);
    if (rq > top) break;
    sh = min(sh, clamp((rq - (R + heightCubeAt(qp / rq))) / (t * 0.035) + 0.5, 0.0, 1.0));
    if (sh <= 0.0) break;
    t *= 1.6;
  }
  return sh;
}
`;
