// Quadtree level-of-detail terrain for one solid body.
//
// Six cube-face quadtrees. A node splits when the camera is within
// SPLIT_K * (its arc size); its children replace it only once all four meshes
// have arrived from the workers, so the surface never has holes. Each mesh
// morphs toward its parent's shape over the outer part of its distance band
// (see chunkbuilder.js), making splits/merges invisible. Horizon culling skips
// nodes hidden behind the planet's limb.

import * as THREE from 'three';
import { SHADOW_LAYER } from './sunShadows.js';
import { RockSet } from './rockRender.js';
import { FACES, dirFromFaceUV, chunkArcSize } from '../gen/cubesphere.js';
import { CHUNK_N, chunkIndices, FALL_STRIDE } from '../gen/chunkbuilder.js';
import { FallFx } from './falls.js';
import { makeTerrainMaterial, DETAIL_PERIOD } from './terrainMaterial.js';
import { FloraSet } from './floraRender.js';
import { floraOf } from '../sim/floraField.js';
import { VCHUNK } from '../gen/volume.js';

// each material class's share (12 a vertex, matclasses.js) as three vec4 attributes over one buffer
function setClassAttrs(g, cls) {
  const ib = new THREE.InterleavedBuffer(cls, 12);
  for (let k = 0; k < 3; k++) g.setAttribute('cls' + k, new THREE.InterleavedBufferAttribute(ib, 4, k * 4, true));
}
import { NEAR_RINGS } from '../sim/nearGround.js';

const FLORA_DIST = 1600;
const STONE_DIST = 120, STONE_DROP = 200;   // (the small stones near the camera: gen/rocks.js scatterStones)

const SPLIT_K = 2.2;
const MORPH_START = 0.62;

let sharedIndex = null;
function indexAttr() {
  if (!sharedIndex) sharedIndex = new THREE.BufferAttribute(chunkIndices(CHUNK_N), 1);
  return sharedIndex;
}

class Node {
  constructor(face, level, ix, iy, parent, R) {
    this.face = face; this.level = level; this.ix = ix; this.iy = iy; this.parent = parent;
    this.children = null;
    this.mesh = null;
    this.job = null;
    this.state = 0; // 0 none, 1 requested, 2 ready
    this.arc = chunkArcSize(level, R);
    const n = 1 << level, s = 2 / n;
    const c = [0, 0, 0];
    dirFromFaceUV(face, -1 + (ix + 0.5) * s, -1 + (iy + 0.5) * s, c);
    this.dir = new THREE.Vector3(c[0], c[1], c[2]);
    // angular radius (corner distance) for culling
    const k = [0, 0, 0];
    dirFromFaceUV(face, -1 + ix * s, -1 + iy * s, k);
    this.cosAng = this.dir.x * k[0] + this.dir.y * k[1] + this.dir.z * k[2];
    this.ang = Math.acos(Math.min(1, this.cosAng));
    this.minH = parent ? parent.minH : -12000;
    this.maxH = parent ? parent.maxH : 25000;
    this.lastSeen = 0;
    this.visible = false;
  }
}

export class PlanetTerrain {
  constructor(body, pool, sharedUniforms) {
    this.body = body;
    this.pool = pool;
    this.R = body.R;
    this.maxLevel = body.maxLevel;
    this.shared = sharedUniforms;
    this.group = new THREE.Group();
    this.group.matrixAutoUpdate = true;
    this.roots = [];
    for (let f = 0; f < 6; f++) this.roots.push(new Node(f, 0, 0, 0, null, this.R));
    this.frame = 0;
    this.meshCount = 0;
    this.pendingCount = 0;
    this.pendingNear = 0;
    this.visibleList = [];
    this.generation = 0;
    this.camLocal = new THREE.Vector3();
    this.hasSea = !!(body.data.terrain && body.data.terrain.ocean > 0 && body.data.terrain.liquid);
    const relief = body.data.terrain ? body.relief : 10000;
    this.minSurface = this.R + (this.hasSea ? 0 : -relief * 1.2);
    this.debug = false;
    this.floraLevel = Math.max(2, this.maxLevel - 3);
    this.floraSet = null;
    this.floraCount = 0;
    // the near field's volume chunks (gen/volume.js), by lattice key
    this.near = new Map();
    this.nearAnchor = null;
    this._nl = [0, 0, 0];
  }

  // camFixed: camera position in the body-fixed frame (relative to centre)
  update(camFixed, frustumCheck) {
    this.frame++;
    this.camLocal.copy(camFixed);
    const camDist = camFixed.length();
    this.camDist = camDist;
    // horizon: angle from the sub-camera point at which the surface sphere is tangent
    this.horizonAng = camDist > this.minSurface ? Math.acos(Math.min(1, this.minSurface / camDist)) : Math.PI;
    this.camDir = this.camDir || new THREE.Vector3();
    this.camDir.copy(camFixed).divideScalar(Math.max(camDist, 1));
    this.visibleList.length = 0;
    this.deepest = 0; // finest level shown right under the camera
    for (const r of this.roots) this.select(r);
    // (stones of nodes no longer near: dropped)
    if (this.stoneNodes) for (const node of this.stoneNodes) if (node.stoneFrame !== this.frame) this.dropStones(node);
    // hide everything not selected this frame, recycle stale meshes
    this.collect();
    this.nearUpdate();
    return this.visibleList;
  }

  nodeDistance(node) {
    const midH = (node.minH + node.maxH) * 0.5;
    const cx = node.dir.x * (this.R + midH), cy = node.dir.y * (this.R + midH), cz = node.dir.z * (this.R + midH);
    const dx = this.camLocal.x - cx, dy = this.camLocal.y - cy, dz = this.camLocal.z - cz;
    const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const rad = node.arc * 0.75 + (node.maxH - node.minH) * 0.5;
    return Math.max(0, d - rad);
  }

  overHorizon(node) {
    if (this.camDist <= this.minSurface * 1.0001) return true;
    const cosA = node.dir.x * this.camDir.x + node.dir.y * this.camDir.y + node.dir.z * this.camDir.z;
    const ang = Math.acos(Math.max(-1, Math.min(1, cosA)));
    const top = this.R + Math.max(node.maxH, 0);
    const extra = top > this.minSurface ? Math.acos(Math.max(-1, Math.min(1, this.minSurface / top))) : 0;
    return ang - node.ang <= this.horizonAng + extra;
  }

  select(node) {
    node.lastSeen = this.frame;
    if (!this.overHorizon(node)) return;
    const dist = this.nodeDistance(node);
    if (node.level === this.floraLevel && dist < FLORA_DIST) this.floraVisit(node, dist);
    if (node.level === this.floraLevel + 2 && dist < STONE_DROP) this.stoneVisit(node, dist);
    const wantSplit = node.level < this.maxLevel && dist < SPLIT_K * node.arc;
    if (wantSplit) {
      if (!node.children) {
        const L = node.level + 1, x = node.ix * 2, y = node.iy * 2;
        node.children = [
          new Node(node.face, L, x, y, node, this.R), new Node(node.face, L, x + 1, y, node, this.R),
          new Node(node.face, L, x, y + 1, node, this.R), new Node(node.face, L, x + 1, y + 1, node, this.R),
        ];
      }
      let ready = true;
      for (const c of node.children) {
        c.lastSeen = this.frame;
        if (c.state !== 2) { ready = false; this.request(c, this.nodeDistance(c)); }
      }
      if (ready) {
        for (const c of node.children) this.select(c);
        return;
      }
    }
    if (node.state !== 2) { this.request(node, dist); return; }
    this.show(node, dist);
  }

  request(node, dist) {
    if (node.state === 0) {
      node.state = 1;
      this.pendingCount++;
      node.near = dist < 3000;
      if (node.near) this.pendingNear++;
      const gen = this.generation;
      node.job = this.pool.submit({
        type: 'chunk', body: this.body.id, face: node.face, level: node.level, ix: node.ix, iy: node.iy, N: CHUNK_N,
      }, this.priority(node, dist));
      node.job.promise.then((data) => {
        this.pendingCount--;
        if (node.near) { this.pendingNear--; node.near = false; }
        if (gen !== this.generation || node.state !== 1) return;
        this.buildMesh(node, data);
        // (made from the ground as it was before a tile arrived: made again)
        if (node.restale) { node.restale = false; node.stale = true; }
      }, () => { this.pendingCount--; if (node.near) { this.pendingNear--; node.near = false; } node.state = 0; });
    } else if (node.state === 1 && node.job) {
      this.pool.reprioritize(node.job, this.priority(node, dist));
    }
  }

  // the ground changed in a patch of a face (u0..u1, v0..v1: a terrain tile arrived): the chunks
  // over it are built again, each drawn as it was until its new mesh is in (and its plants
  // scattered again on the new ground)
  // (only chunks fine enough to show it: vertices no further apart than maxSpacing m)
  invalidate(face, u0, v0, u1, v1, maxSpacing = Infinity) {
    const walk = (node) => {
      const s = 2 / (1 << node.level), nu = -1 + node.ix * s, nv = -1 + node.iy * s;
      if (node.face !== face || nu > u1 || nu + s < u0 || nv > v1 || nv + s < v0) return;
      if (node.arc / CHUNK_N <= maxSpacing) {
        if (node.state === 2) node.stale = true;
        else if (node.state === 1) node.restale = true;
      }
      if (node.children) for (const c of node.children) walk(c);
    };
    for (const r of this.roots) walk(r);
  }

  refresh(node, dist) {
    node.stale = false;
    const gen = this.generation;
    node.refreshJob = this.pool.submit({
      type: 'chunk', body: this.body.id, face: node.face, level: node.level, ix: node.ix, iy: node.iy, N: CHUNK_N,
    }, this.priority(node, dist) + 1);
    this.pendingCount++;
    node.refreshJob.promise.then((data) => {
      this.pendingCount--;
      node.refreshJob = null;
      if (gen !== this.generation || node.state !== 2 || !node.mesh) return;
      const old = node.mesh, shown = old.visible;
      this.group.remove(old); old.geometry.dispose(); old.material.dispose(); disposeKids(old); this.meshCount--;
      this.buildMesh(node, data);
      node.mesh.visible = shown;
      if (node.flora) {
        this.group.remove(node.flora); this.floraCount -= node.flora.userData.count;
        for (const m of node.flora.children) m.dispose();
        node.flora = null; node.floraJob = null;
      }
    }, () => { this.pendingCount--; node.refreshJob = null; node.stale = true; });
  }

  // the flora set, its clearings the body's own (shared with the world's flora field)
  ensureFloraSet() {
    if (this.floraSet) return;
    this.floraSet = new FloraSet(this.body, this.shared);
    this.floraSet.clearings = this.body.floraClearings || (this.body.floraClearings = []);
    // (the ground's rocks: gen/rocks.js, carried with the flora; drawn in their node's flora group)
    this.rockSet = new RockSet(this.body, this.shared);
    this.rockSet.clearings = this.floraSet.clearings;
  }

  floraVisit(node, dist) {
    node.floraFrame = this.frame;
    node.floraDist = dist;
    if (node.flora) this.floraSet.updateNode(node.flora, dist);
    if (node.flora || node.floraJob) return;
    this.ensureFloraSet();
    const gen = this.generation;
    node.floraJob = this.pool.submit({
      type: 'flora', body: this.body.id, face: node.face, level: node.level, ix: node.ix, iy: node.iy, maxLevel: this.maxLevel,
    }, this.priority(node, dist) + 4);
    node.floraJob.promise.then((data) => {
      if (gen !== this.generation || !node.floraJob) return;
      // (the world's flora field gets the same scatter: solid trees where they're drawn)
      const field = floraOf(this.body);
      if (field) field.ingest(node.face, node.ix, node.iy, data);
      node.flora = this.floraSet.build(data);
      const rocks = this.rockSet.build(data);
      if (rocks) { node.flora.add(rocks); node.flora.userData.count += rocks.userData.count; }
      node.flora.visible = node.floraFrame === this.frame;
      this.floraSet.updateNode(node.flora, node.floraDist || 0);
      this.floraCount += node.flora.userData.count;
      this.group.add(node.flora);
    }, () => { node.floraJob = null; });
  }

  // the small stones of a node near the camera (one level finer than the flora's two)
  stoneVisit(node, dist) {
    node.stoneFrame = this.frame;
    if (node.stones) { node.stones.visible = node.state === 2; return; }
    if (node.stoneJob || dist >= STONE_DIST) return;
    this.ensureFloraSet();
    const gen = this.generation;
    (this.stoneNodes || (this.stoneNodes = new Set())).add(node);
    node.stoneJob = this.pool.submit({ type: 'stones', body: this.body.id, face: node.face, level: node.level, ix: node.ix, iy: node.iy, maxLevel: this.maxLevel }, this.priority(node, dist) + 5);
    node.stoneJob.promise.then((data) => {
      if (gen !== this.generation || !node.stoneJob) return;
      node.stoneJob = null;
      node.stones = this.rockSet.build(data);
      if (node.stones) { node.stones.position.set(data.origin[0], data.origin[1], data.origin[2]); this.group.add(node.stones); }
    }, () => { node.stoneJob = null; });
  }
  dropStones(node) {
    if (node.stoneJob) { this.pool.cancel(node.stoneJob); node.stoneJob = null; }
    if (node.stones) { this.group.remove(node.stones); node.stones.dispose(); node.stones = null; }
    if (this.stoneNodes) this.stoneNodes.delete(node);
  }

  priority(node, dist) {
    // coarse levels first (they unblock whole regions), then by distance
    return node.level * 0.6 + Math.log2(1 + dist / Math.max(node.arc, 1)) * 1.5 - (node.level < 3 ? 100 : 0);
  }

  buildMesh(node, d) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(d.position, 3));
    g.setAttribute('morph', new THREE.BufferAttribute(d.morph, 3));
    g.setAttribute('nrm', new THREE.BufferAttribute(d.nrm, 4, true));
    g.setAttribute('mnrm', new THREE.BufferAttribute(d.mnrm, 4, true));
    g.setAttribute('col', new THREE.BufferAttribute(d.col, 4, true));
    g.setAttribute('mcol', new THREE.BufferAttribute(d.mcol, 4, true));
    g.setAttribute('mat', new THREE.BufferAttribute(d.mat, 4, true));
    g.setAttribute('ext', new THREE.BufferAttribute(d.ext, 4, true));
    g.setAttribute('liq', new THREE.BufferAttribute(d.liq, 4, true));
    setClassAttrs(g, d.cls);
    g.setIndex(indexAttr());
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(d.bsphere[0], d.bsphere[1], d.bsphere[2]), d.bsphere[3]);
    const m = new THREE.Mesh(g, makeTerrainMaterial(this.shared));
    m.layers.enable(SHADOW_LAYER);   // (it casts the near sun shadows)
    m.position.set(d.origin[0], d.origin[1], d.origin[2]);
    m.matrixAutoUpdate = false;
    m.updateMatrix();
    m.visible = false;
    m.userData.origin = d.origin;
    const om = m.material.uniforms.uOriginMod.value;
    const P = DETAIL_PERIOD;
    om.set(((d.origin[0] % P) + P) % P, ((d.origin[1] % P) + P) % P, ((d.origin[2] % P) + P) % P);
    // (its falls: the sheet's speed by how far it has fallen from the biggest one's lip, and their
    // spray and mist: falls.js)
    if (d.falls && this.shared.uFall1) {
      let best = 0, bw = -1;
      for (let f = 0; f < d.falls.length; f += FALL_STRIDE) { const w = (d.falls[f + 3] - d.falls[f + 4]) * d.falls[f + 5]; if (w > bw) { bw = w; best = f; } }
      const u = m.material.uniforms;
      u.uFallTop.value = d.falls[best + 3];
      u.uFallFoot.value.set(d.falls[best], d.falls[best + 1], d.falls[best + 2]);
      u.uFallW.value = d.falls[best + 5];
      this.fallFx = this.fallFx || new FallFx(this.shared);
      const fx = this.fallFx.make(d.falls, d.origin);
      if (fx) m.add(fx);
    }
    node.mesh = m;
    node.minH = d.minH; node.maxH = d.maxH;
    if (node.children) for (const c of node.children) if (c.state !== 2) { c.minH = d.minH; c.maxH = d.maxH; }
    node.state = 2;
    this.group.add(m);
    this.meshCount++;
  }

  show(node, dist) {
    if (dist < 50 && node.level > this.deepest) this.deepest = node.level;
    if (node.stale && !node.refreshJob) this.refresh(node, dist);
    const m = node.mesh;
    m.visible = true;
    node.visible = true;
    node.shownFrame = this.frame;
    const u = m.material.uniforms;
    const o = m.userData.origin;
    u.uCamLocal.value.set(this.camLocal.x - o[0], this.camLocal.y - o[1], this.camLocal.z - o[2]);
    const end = SPLIT_K * node.arc * 2;
    if (node.level === 0) u.uMorph.value.set(1e30, 2e30);
    else u.uMorph.value.set(end * MORPH_START, end * 0.985);
    this.visibleList.push(node);
  }

  collect() {
    const frame = this.frame;
    const walk = (node) => {
      if (node.mesh && node.shownFrame !== frame) node.mesh.visible = false;
      if (node.flora) node.flora.visible = node.floraFrame === frame;
      if (node.children) {
        let anyUsed = false;
        for (const c of node.children) {
          walk(c);
          if (frame - c.lastSeen < 240 || c.children) anyUsed = true;
        }
        // prune subtrees not needed for ~4 s
        if (!anyUsed) {
          for (const c of node.children) this.disposeNode(c);
          node.children = null;
        }
      }
    };
    for (const r of this.roots) walk(r);
  }

  disposeNode(node) {
    if (node.children) { for (const c of node.children) this.disposeNode(c); node.children = null; }
    if (node.job && node.state === 1) {
      if (this.pool.cancel(node.job)) { this.pendingCount--; if (node.near) { this.pendingNear--; node.near = false; } }
    }
    if (node.refreshJob) { if (this.pool.cancel(node.refreshJob)) this.pendingCount--; node.refreshJob = null; }
    node.stale = node.restale = false;
    if (node.mesh) {
      this.group.remove(node.mesh);
      node.mesh.geometry.dispose();
      node.mesh.material.dispose();
      disposeKids(node.mesh);
      node.mesh = null;
      this.meshCount--;
    }
    if (node.floraJob && !node.flora) this.pool.cancel(node.floraJob);
    node.floraJob = null;
    this.dropStones(node);
    if (node.flora) {
      this.group.remove(node.flora);
      this.floraCount -= node.flora.userData.count;
      for (const m of node.flora.children) m.dispose();
      node.flora = null;
    }
    node.state = 0;
  }

  // Clear flora around a body-fixed point (landing sites); rebuilds affected nodes
  addClearing(posF, r) {
    this.ensureFloraSet();
    this.floraSet.clearings.push({ pos: posF.clone().setLength(this.R), r });
    if (this.floraSet.clearings.length > 8) this.floraSet.clearings.shift();
    const field = floraOf(this.body);
    if (field) field.prune(posF.clone().setLength(this.R), r);
    const walk = (node) => {
      if (node.stones && node.dir.clone().multiplyScalar(this.R).distanceTo(posF) < node.arc + r) this.dropStones(node);
      if (node.flora) {
        const c = node.dir.clone().multiplyScalar(this.R);
        if (c.distanceTo(posF) < node.arc + r) {
          this.group.remove(node.flora);
          this.floraCount -= node.flora.userData.count;
          for (const m of node.flora.children) m.dispose();
          node.flora = null; node.floraJob = null;
        }
      }
      if (node.children) for (const ch of node.children) walk(ch);
    };
    for (const root of this.roots) walk(root);
  }

  // the near field (sim/nearGround.js): its volume meshed in chunks, in rings round its centre
  // that coarsen outward (NEAR_RINGS: 1 m cells to 160 m, 2 m to 400 m, 4 m to 1 km, and 8 m to
  // 2.5 km once you're up off the ground), nearest first. A ring is drawn once it has all been
  // meshed (each mesh only inside its ring's band); the heightfield gives way out to the last
  // ring drawn (terrainMaterial.js)
  nearUpdate() {
    const ng = this.body.near, on = !!(ng && ng.active && ng.field);
    const u = this.shared.uNear.value;
    if (!on) { u.set(0, 0); for (const ch of this.near.values()) if (ch.mesh) ch.mesh.visible = false; return; }
    if (ng.anchor !== this.nearAnchor || ng.field.gen !== this.nearGen) {
      this.disposeNear(); this.nearAnchor = ng.anchor; this.nearGen = ng.field.gen; this.ringShown = NEAR_RINGS.map(() => false);
    }
    const F = ng.field, c = ng.centre, L = F.toLocal(c[0], c[1], c[2], this._nl);
    const want = new Set();
    // (the outermost ring only up off the ground, with some hysteresis)
    this.highRing = ng.alt > 150 || (this.highRing && ng.alt > 100);
    for (let ri = 0; ri < NEAR_RINGS.length; ri++) {
      const ring = NEAR_RINGS[ri];
      if (ring.high && !this.highRing) continue;
      const lv = ring.level, S = 1 << lv, size = VCHUNK * S;
      let pending = 0;
      const ci0 = Math.floor((L[0] - ring.r1) / size), ci1 = Math.floor((L[0] + ring.r1) / size);
      const ck0 = Math.floor((L[2] - ring.r1) / size), ck1 = Math.floor((L[2] + ring.r1) / size);
      for (let ci = ci0; ci <= ci1; ci++) for (let ck = ck0; ck <= ck1; ck++) {
        const x0 = ci * size, x1 = x0 + size, z0 = ck * size, z1 = z0 + size;
        const dx = Math.max(x0 - L[0], 0, L[0] - x1), dz = Math.max(z0 - L[2], 0, L[2] - z1);
        const dmin = Math.hypot(dx, dz), dmax = Math.hypot(Math.max(Math.abs(x0 - L[0]), Math.abs(x1 - L[0])), Math.max(Math.abs(z0 - L[2]), Math.abs(z1 - L[2])));
        if (dmin > ring.r1 || dmax < ring.r0) continue;
        // the footprint's surface from a few of its columns' heights, to the lattice's y (the
        // tangent plane drops away from the anchor by rho^2 / 2R); room above for overhangs,
        // below for caves (deep near the player)
        let hmin = Infinity, hmax = -Infinity;
        for (let a = 0; a <= 2; a++) for (let b2 = 0; b2 <= 2; b2++) {
          const col = F.colAt(Math.round(x0 + a * size / 2), Math.round(z0 + b2 * size / 2));
          if (col.Hc < hmin) hmin = col.Hc;
          if (col.Hc > hmax) hmax = col.Hc;
        }
        const sag = (((x0 + x1) / 2) ** 2 + ((z0 + z1) / 2) ** 2) / (2 * this.R);
        const pad = 16 + size * 0.25;
        const y0 = hmin - sag - (lv === 0 && dmin < 48 ? 60 : pad), y1 = hmax - sag + pad;
        for (let cj = Math.floor(y0 / size); cj <= Math.floor(y1 / size); cj++) {
          const dy = Math.max(cj * size - L[1], 0, L[1] - (cj + 1) * size), dist = Math.hypot(dmin, dy);
          const key = lv + ':' + ci + ',' + cj + ',' + ck;
          want.add(key);
          let ch = this.near.get(key);
          if (!ch) { ch = { key, level: lv, ring: ri, ci, cj, ck, mesh: null, job: null, state: 0 }; this.near.set(key, ch); }
          // (ring by ring: the two nearest before the heightfield's tiles, the far ones after)
          const pr = (ri < 2 ? 0.5 + ri * 4 : 20 + ri * 4) + Math.min(3.5, dist / (40 * S));
          if (ch.state === 0) this.requestNear(ch, ng, pr);
          else if (ch.state === 1) this.pool.reprioritize(ch.job, pr);
          if (ch.state !== 2) pending++;
        }
      }
      if (pending === 0) this.ringShown[ri] = true;
    }
    // the volume takes over (drawn, and walked on) once the first ring is meshed; the heightfield
    // gives way out to the last ring drawn in an unbroken run from the centre
    if (this.ringShown[0]) ng.ready = true;
    let cover = 0;
    for (let ri = 0; ri < NEAR_RINGS.length; ri++) {
      if (!this.ringShown[ri] || (NEAR_RINGS[ri].high && !this.highRing)) break;
      cover = NEAR_RINGS[ri].r1;
    }
    u.set(ng.ready ? 1 : 0, cover);
    const cl = Math.hypot(c[0], c[1], c[2]);
    this.shared.uNearUp.value.set(c[0] / cl, c[1] / cl, c[2] / cl);
    // chunks no longer wanted go once they're well outside their ring (or it's off)
    for (const [key, ch] of this.near) {
      if (want.has(key)) continue;
      const ring = NEAR_RINGS[ch.ring], size = VCHUNK * (1 << ch.level);
      const dx = Math.max(ch.ci * size - L[0], 0, L[0] - (ch.ci + 1) * size), dz = Math.max(ch.ck * size - L[2], 0, L[2] - (ch.ck + 1) * size);
      if ((ring.high && !this.highRing) || Math.hypot(dx, dz) > ring.r1 + 2 * size) this.disposeNearChunk(ch);
    }
    // where each mesh sits from the centre (the shader's cut between rings, and the heightfield)
    for (const ch of this.near.values()) {
      if (!ch.mesh) continue;
      const o = ch.mesh.userData.origin, ring = NEAR_RINGS[ch.ring];
      const uu = ch.mesh.material.uniforms;
      uu.uNearOff.value.set(o[0] - c[0], o[1] - c[1], o[2] - c[2]);
      uu.uNearBand.value.set(ring.r0, ring.r1);
      ch.mesh.visible = ng.ready && this.ringShown[ch.ring] && ring.r1 <= cover;
    }
    for (const node of this.visibleList) {
      const o = node.mesh.userData.origin;
      node.mesh.material.uniforms.uNearOff.value.set(o[0] - c[0], o[1] - c[1], o[2] - c[2]);
    }
  }

  requestNear(ch, ng, priority) {
    ch.state = 1;
    const gen = this.generation, anchor = ng.anchor;
    ch.job = this.pool.submit({ type: 'vchunk', body: this.body.id, anchor, ci: ch.ci, cj: ch.cj, ck: ch.ck, level: ch.level }, priority);
    ch.job.promise.then((data) => {
      if (gen !== this.generation || anchor !== this.nearAnchor || this.near.get(ch.key) !== ch) return;
      ch.state = 2;
      ch.job = null;
      if (data.mesh) ch.mesh = this.buildNearMesh(data.mesh);
    }, () => { ch.state = 0; ch.job = null; });
  }

  buildNearMesh(d) {
    const g = new THREE.BufferGeometry();
    const pos = new THREE.BufferAttribute(d.position, 3), nrm = new THREE.BufferAttribute(d.nrm, 4, true), col = new THREE.BufferAttribute(d.col, 4, true);
    // (no morphing: the same buffers stand for the morph targets)
    g.setAttribute('position', pos); g.setAttribute('morph', pos);
    g.setAttribute('nrm', nrm); g.setAttribute('mnrm', nrm);
    g.setAttribute('col', col); g.setAttribute('mcol', col);
    g.setAttribute('mat', new THREE.BufferAttribute(d.mat, 4, true));
    g.setAttribute('ext', new THREE.BufferAttribute(d.ext, 4, true));
    setClassAttrs(g, d.cls);
    g.setAttribute('occ', new THREE.BufferAttribute(d.occ, 1, true));
    g.setIndex(new THREE.BufferAttribute(d.index, 1));
    g.computeBoundingSphere();
    const m = new THREE.Mesh(g, makeTerrainMaterial(this.shared));
    m.layers.enable(SHADOW_LAYER);   // (it casts the near sun shadows)
    m.position.set(d.origin[0], d.origin[1], d.origin[2]);
    m.matrixAutoUpdate = false;
    m.updateMatrix();
    m.userData.origin = d.origin;
    const uu = m.material.uniforms, P = DETAIL_PERIOD;
    uu.uMorph.value.set(1e30, 2e30);
    uu.uNearMode.value = 1;
    uu.uOriginMod.value.set(((d.origin[0] % P) + P) % P, ((d.origin[1] % P) + P) % P, ((d.origin[2] % P) + P) % P);
    this.group.add(m);
    return m;
  }

  disposeNearChunk(ch) {
    if (ch.job && ch.state === 1) this.pool.cancel(ch.job);
    if (ch.mesh) { this.group.remove(ch.mesh); ch.mesh.geometry.dispose(); ch.mesh.material.dispose(); ch.mesh = null; }
    this.near.delete(ch.key);
  }

  disposeNear() { for (const ch of [...this.near.values()]) this.disposeNearChunk(ch); }

  // true when every visible node near the camera is at full requested detail
  isSettled() { return this.pendingCount === 0; }

  setDebug(on) {
    this.debug = on;
    this.shared.uDebug.value = on ? 1 : 0;
  }

  dispose() {
    this.generation++;
    for (const r of this.roots) this.disposeNode(r);
    this.disposeNear();
    if (this.rockSet) this.rockSet.dispose();
    if (this.fallFx) this.fallFx.material.dispose();
  }
}

// (a chunk mesh's children: its falls' spray and mist, their material the world's own)
function disposeKids(m) {
  for (const c of m.children) { c.geometry.dispose(); if (!c.userData.sharedMaterial) c.material.dispose(); }
}
