// Grass near the camera (LIFE.md 5; Dave: "put some grass on that and it could be pretty"): tufts of
// blades on the ground within ~30 m (thick near, thinning off), as thick as the country's plants are open (the life map's cover and
// its open share: a grassland thick, a forest floor thin; none on sand, bare rock, ice, water or frozen
// ground), where grasses have evolved (evolve.js plantGrade 4; before them, ferns' broader fronds),
// coloured from the world's own foliage pigment toward its dry colour where its rain is short, taller
// where it's wetter and warmer (and the pull lighter), swaying in the wind. Tufts placed by each 8 m
// tile's own hash in the cube face's coordinates (the same for everyone), on the ground under them (the
// tile's heights, as the finest mesh draws them); fading out with distance so none pops.
import * as THREE from 'three';
import { dirFromFaceUV, faceUVFromDir } from '../gen/cubesphere.js';
import { S_LEN, S_H, S_TEMP, S_SAND, S_ICE, S_WDEPTH, S_RIVR } from '../gen/terrain.js';
import { fmix32 } from '../core/rng.js';

const TILE = 8, RADIUS = 30, PER_M2 = 14, CAP = 36000, HIGH = 60, MOVE = 1.2, NEAR = 9;
const _m = new THREE.Matrix4(), _x = new THREE.Vector3(), _y = new THREE.Vector3(), _z = new THREE.Vector3(), _c = new THREE.Color();

// a tuft: blades (narrow and tapering for grass; broad, few and arching for fern fronds), unit high, its
// normals all up (lit as the ground is under it: no dark backs), darker at the foot
function tuftGeometry(fern) {
  const pos = [], col = [], idx = [], nrm = [];
  const blades = fern ? 4 : 7, SEG = 2;
  let h = 0x9e3779b9;
  const rnd = () => { h = fmix32((h + 0x6d2b79f5) >>> 0); return h / 4294967296; };
  for (let b = 0; b < blades; b++) {
    const a = (b + rnd() * 0.6) / blades * Math.PI * 2, lean = (fern ? 0.55 : 0.12) + rnd() * (fern ? 0.3 : 0.22), len = 0.55 + 0.45 * rnd();
    const w0 = fern ? 0.07 : 0.016, ca = Math.cos(a), sa = Math.sin(a), base = pos.length / 3;
    const ox = (rnd() - 0.5) * 0.12, oz = (rnd() - 0.5) * 0.12;   // (blades from a spread of roots)
    for (let s = 0; s <= SEG; s++) {
      const t = s / SEG, w = w0 * (fern ? Math.sin(Math.PI * Math.min(1, t * 1.15)) + 0.15 : 1 - t * 0.92);
      const out = lean * t * t * len, up = len * (t - 0.5 * lean * t * t * (fern ? 0.8 : 0.3));
      const cx = ox + ca * out, cz = oz + sa * out;
      pos.push(cx - sa * w, up, cz + ca * w, cx + sa * w, up, cz - ca * w);
      const k = 0.55 + 0.45 * t;
      col.push(k, k, k, k, k, k);
      nrm.push(0, 1, 0, 0, 1, 0);
    }
    for (let s = 0; s < SEG; s++) { const i = base + s * 2; idx.push(i, i + 1, i + 2, i + 1, i + 3, i + 2); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  return g;
}

export class GrassSet {
  constructor(body, group) {
    this.body = body; this.group = group;
    const d = body.data, H = d.history || {};
    this.grade = H.plantGrade ?? -1;
    this.fern = this.grade < 4;
    this.veg = (d.life && d.life.vegColor) || [0.1, 0.2, 0.05];
    this.dry = (d.life && d.life.dryColor) || this.veg;
    this.gK = Math.pow(9.81 / Math.max(d.gravity || 9.81, 1), 0.3);
    this.mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, metalness: 0, side: THREE.DoubleSide });
    this.time = { value: 0 };
    this.mat.onBeforeCompile = (sh) => {
      sh.uniforms.uWindT = this.time;
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uWindT;')
        .replace('#include <begin_vertex>', `#include <begin_vertex>
  {
    // (the wind: a gust that runs across the field, each tuft a little its own, the tips most)
    vec3 ip = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
    float ph = uWindT * 1.6 + dot(ip, vec3(0.31, 0.17, 0.23));
    float bend = (0.10 * sin(ph) + 0.04 * sin(ph * 2.7 + 1.3)) * position.y * position.y;
    transformed.x += bend; transformed.z += 0.5 * bend;
  }`);
    };
    this.mesh = new THREE.InstancedMesh(tuftGeometry(this.fern), this.mat, CAP);
    this.mesh.count = 0; this.mesh.frustumCulled = false;
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.setColorAt(0, _c.set(1, 1, 1));
    group.add(this.mesh);
    this.tiles = new Map(); this.at = null; this.origin = new THREE.Vector3();
    this._s = new Float64Array(S_LEN); this._uv = { face: 0, u: 0, v: 0 };
  }

  // camF: the camera, body-fixed
  update(camF) {
    const b = this.body, gen = b.terrain, R = b.R, now = performance.now() / 1000;
    this.time.value += Math.min(0.1, Math.max(0, now - (this._t || now))); this._t = now;   // (the wind's: render time)
    if (!gen || !gen.snap || !gen.snap.s.cover || this.grade < 1 || camF.length() - R > HIGH + 2000) { this.mesh.visible = false; return; }
    const up = _y.copy(camF).normalize(), alt = camF.length() - R - b.groundHeight(up);
    if (alt > HIGH) { this.mesh.visible = false; return; }
    this.mesh.visible = true;
    if (this.at && this.at.distanceTo(camF) < MOVE) return;
    this.at = (this.at || new THREE.Vector3()).copy(camF);
    this.origin.set(Math.round(camF.x / 64) * 64, Math.round(camF.y / 64) * 64, Math.round(camF.z / 64) * 64);
    // the tiles about: on the camera's face, within reach
    const uv = faceUVFromDir([up.x, up.y, up.z], this._uv), NT = Math.round(Math.PI * 0.5 * R / TILE);
    const ci = Math.floor((uv.u + 1) * 0.5 * NT), cj = Math.floor((uv.v + 1) * 0.5 * NT), k = Math.ceil(RADIUS / TILE) + 1;
    let n = 0;
    const live = new Set();
    for (let i = ci - k; i <= ci + k && n < CAP; i++) for (let j = cj - k; j <= cj + k && n < CAP; j++) {
      if (i < 0 || j < 0 || i >= NT || j >= NT) continue;
      const key = uv.face * 1e10 + i * 1e5 + j;
      let T = this.tiles.get(key);
      if (!T) { T = this.tile(uv.face, i, j, NT); this.tiles.set(key, T); }
      live.add(key);
      if (!T.n) continue;
      for (let q = 0; q < T.n && n < CAP; q++) {
        const o = q * 7, px = T.p[o], py = T.p[o + 1], pz = T.p[o + 2];
        const dx = px - camF.x, dy = py - camF.y, dz = pz - camF.z, d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (d > RADIUS) continue;
        // (thinned with distance, the ones kept a little bigger to cover for those gone; shrunk toward
        // nothing at the edge of its reach: no tuft pops in)
        const keep = d < NEAR ? 1 : Math.max(0.2, NEAR / d);
        if (T.p[o + 6] > keep) continue;
        const s = T.p[o + 4] * (1 + 0.6 * (1 - keep)) * Math.min(1, (RADIUS - d) / (RADIUS * 0.3));
        _y.set(px, py, pz).normalize();
        _x.copy(T.e).addScaledVector(_y, -T.e.dot(_y)).normalize();
        _z.crossVectors(_x, _y);
        const c = Math.cos(T.p[o + 3]), sn = Math.sin(T.p[o + 3]);
        const X = _x.clone().multiplyScalar(c).addScaledVector(_z, sn), Z = _z.multiplyScalar(c).addScaledVector(_x, -sn);
        _m.makeBasis(X.multiplyScalar(s), _y.multiplyScalar(s), Z.multiplyScalar(s)).setPosition(px - this.origin.x, py - this.origin.y, pz - this.origin.z);
        this.mesh.setMatrixAt(n, _m);
        const t = T.p[o + 5];
        _c.setRGB(T.col[0] + (T.col[3] - T.col[0]) * t, T.col[1] + (T.col[4] - T.col[1]) * t, T.col[2] + (T.col[5] - T.col[2]) * t);
        this.mesh.setColorAt(n, _c);
        n++;
      }
    }
    for (const key of this.tiles.keys()) if (!live.has(key) && this.tiles.size > 600) this.tiles.delete(key);
    this.mesh.count = n;
    this.mesh.position.copy(this.origin);
    this.mesh.instanceMatrix.needsUpdate = true;
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
  }

  // one tile's tufts: how thick its country grows them, where each stands (its own hash), its colour
  tile(face, i, j, NT) {
    const b = this.body, gen = b.terrain, R = b.R, s = this._s, snap = gen.snap;
    const du = 2 / NT, u0 = -1 + i * du, v0 = -1 + j * du, dc = [0, 0, 0];
    dirFromFaceUV(face, u0 + du * 0.5, v0 + du * 0.5, dc);
    gen.sample(dc[0], dc[1], dc[2], 4, s);
    const T = { n: 0, p: null, e: null, col: null };
    const tC = s[S_TEMP] - 273.15;
    if (s[S_SAND] > 0.3 || s[S_ICE] > 0 || s[S_WDEPTH] > 0.05 || s[S_RIVR] > 0 || tC < -4 || (gen.p.liquid && s[S_H] < 1.5)) return T;
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
    const thick = Math.max(0, Math.min(1, c)) * (Math.min(1, open) + 0.25 * Math.min(1, forest));
    const nT = Math.round(PER_M2 * TILE * TILE * Math.min(1, thick * 1.5) * (0.75 + 0.5 * ((fmix32(face * 7919 + i * 104729 + j) & 1023) / 1023)));
    if (nT < 1) return T;
    // (its heights: the ground at 5 x 5 points, the tufts' between)
    const hg = new Float64Array(25), d = [0, 0, 0];
    const V = new THREE.Vector3();
    for (let a = 0; a < 5; a++) for (let bb = 0; bb < 5; bb++) { dirFromFaceUV(face, u0 + du * a / 4, v0 + du * bb / 4, d); hg[a * 5 + bb] = b.groundHeight(V.set(d[0], d[1], d[2])); }
    // (too steep: bare rock)
    const span = TILE / 4;
    let steep = 0;
    for (let a = 0; a < 4; a++) for (let bb = 0; bb < 4; bb++) steep = Math.max(steep, Math.abs(hg[(a + 1) * 5 + bb] - hg[a * 5 + bb]) / span, Math.abs(hg[a * 5 + bb + 1] - hg[a * 5 + bb]) / span);
    if (steep > 0.9) return T;
    const wet = Math.min(1, Math.max(0, (P - 300) / 1200)), warm = Math.min(1, Math.max(0, (tC + 4) / 24));
    const H = (this.fern ? 0.4 : 0.15 + 0.25 * wet) * (0.6 + 0.4 * warm) * this.gK;
    const dryK = 1 - wet;
    T.col = [...this.veg.map((x, k) => (x + (this.dry[k] - x) * dryK * 0.7) * 1.25), ...this.dry.map((x) => x * 1.2)];
    T.e = new THREE.Vector3(...(() => { const e = [0, 0, 0]; dirFromFaceUV(face, u0 + du, v0 + du * 0.5, e); return [e[0] - dc[0], e[1] - dc[1], e[2] - dc[2]]; })()).normalize();
    T.p = new Float64Array(nT * 7);
    let hsh = fmix32((face * 0x9e3779b1) ^ (i * 0x85ebca6b) ^ (j * 0xc2b2ae35));
    const rnd = () => { hsh = fmix32((hsh + 0x6d2b79f5) >>> 0); return hsh / 4294967296; };
    for (let q = 0; q < nT; q++) {
      const fu = rnd(), fv = rnd();
      dirFromFaceUV(face, u0 + du * fu, v0 + du * fv, d);
      const ga = fu * 4, gb = fv * 4, ia = Math.min(3, Math.floor(ga)), ib = Math.min(3, Math.floor(gb)), ta = ga - ia, tb = gb - ib;
      const gh = (hg[ia * 5 + ib] * (1 - ta) + hg[(ia + 1) * 5 + ib] * ta) * (1 - tb) + (hg[ia * 5 + ib + 1] * (1 - ta) + hg[(ia + 1) * 5 + ib + 1] * ta) * tb;
      const r = R + gh - 0.03, o = q * 7;
      T.p[o] = d[0] * r; T.p[o + 1] = d[1] * r; T.p[o + 2] = d[2] * r;
      T.p[o + 3] = rnd() * Math.PI * 2; T.p[o + 4] = H * (0.6 + 0.8 * rnd()); T.p[o + 5] = rnd() * 0.5 * (0.3 + dryK); T.p[o + 6] = rnd();
    }
    T.n = nT;
    return T;
  }

  dispose() { this.group.remove(this.mesh); this.mesh.dispose(); this.mesh.geometry.dispose(); this.mat.dispose(); }
}
