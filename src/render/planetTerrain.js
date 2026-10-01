// Quadtree level-of-detail terrain for one solid body.
//
// Six cube-face quadtrees. A node splits when the camera is within
// SPLIT_K * (its arc size); its children replace it only once all four meshes
// have arrived from the workers, so the surface never has holes. Each mesh
// morphs toward its parent's shape over the outer part of its distance band
// (see chunkbuilder.js), making splits/merges invisible. Horizon culling skips
// nodes hidden behind the planet's limb.

import * as THREE from 'three';
import { FACES, dirFromFaceUV, chunkArcSize } from '../gen/cubesphere.js';
import { CHUNK_N, chunkIndices } from '../gen/chunkbuilder.js';
import { makeTerrainMaterial, DETAIL_PERIOD } from './terrainMaterial.js';
import { FloraSet } from './floraRender.js';

const FLORA_DIST = 1600;

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
    const relief = body.data.terrain ? body.data.terrain.relief : 10000;
    this.minSurface = this.R + (this.hasSea ? 0 : -relief * 1.2);
    this.debug = false;
    this.floraLevel = Math.max(2, this.maxLevel - 3);
    this.floraSet = null;
    this.floraCount = 0;
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
    // hide everything not selected this frame, recycle stale meshes
    this.collect();
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
    const extra = top > this.minSurface ? Math.acos(Math.min(1, this.minSurface / top)) : 0;
    return ang - node.ang <= this.horizonAng + extra;
  }

  select(node) {
    node.lastSeen = this.frame;
    if (!this.overHorizon(node)) return;
    const dist = this.nodeDistance(node);
    if (node.level === this.floraLevel && dist < FLORA_DIST) this.floraVisit(node, dist);
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
      }, () => { this.pendingCount--; if (node.near) { this.pendingNear--; node.near = false; } node.state = 0; });
    } else if (node.state === 1 && node.job) {
      this.pool.reprioritize(node.job, this.priority(node, dist));
    }
  }

  floraVisit(node, dist) {
    node.floraFrame = this.frame;
    node.floraDist = dist;
    if (node.flora) this.floraSet.updateNode(node.flora, dist);
    if (node.flora || node.floraJob) return;
    if (!this.floraSet) this.floraSet = new FloraSet(this.body, this.shared);
    const gen = this.generation;
    node.floraJob = this.pool.submit({
      type: 'flora', body: this.body.id, face: node.face, level: node.level, ix: node.ix, iy: node.iy, maxLevel: this.maxLevel,
    }, this.priority(node, dist) + 4);
    node.floraJob.promise.then((data) => {
      if (gen !== this.generation || !node.floraJob) return;
      node.flora = this.floraSet.build(data);
      node.flora.visible = node.floraFrame === this.frame;
      this.floraSet.updateNode(node.flora, node.floraDist || 0);
      this.floraCount += node.flora.userData.count;
      this.group.add(node.flora);
    }, () => { node.floraJob = null; });
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
    g.setIndex(indexAttr());
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(d.bsphere[0], d.bsphere[1], d.bsphere[2]), d.bsphere[3]);
    const m = new THREE.Mesh(g, makeTerrainMaterial(this.shared));
    m.position.set(d.origin[0], d.origin[1], d.origin[2]);
    m.matrixAutoUpdate = false;
    m.updateMatrix();
    m.visible = false;
    m.userData.origin = d.origin;
    const om = m.material.uniforms.uOriginMod.value;
    const P = DETAIL_PERIOD;
    om.set(((d.origin[0] % P) + P) % P, ((d.origin[1] % P) + P) % P, ((d.origin[2] % P) + P) % P);
    node.mesh = m;
    node.minH = d.minH; node.maxH = d.maxH;
    if (node.children) for (const c of node.children) if (c.state !== 2) { c.minH = d.minH; c.maxH = d.maxH; }
    node.state = 2;
    this.group.add(m);
    this.meshCount++;
  }

  show(node, dist) {
    if (dist < 50 && node.level > this.deepest) this.deepest = node.level;
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
    if (node.mesh) {
      this.group.remove(node.mesh);
      node.mesh.geometry.dispose();
      node.mesh.material.dispose();
      node.mesh = null;
      this.meshCount--;
    }
    if (node.floraJob && !node.flora) this.pool.cancel(node.floraJob);
    node.floraJob = null;
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
    if (!this.floraSet) this.floraSet = new FloraSet(this.body, this.shared);
    this.floraSet.clearings.push({ pos: posF.clone().setLength(this.R), r });
    if (this.floraSet.clearings.length > 8) this.floraSet.clearings.shift();
    const walk = (node) => {
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

  // true when every visible node near the camera is at full requested detail
  isSettled() { return this.pendingCount === 0; }

  setDebug(on) {
    this.debug = on;
    this.shared.uDebug.value = on ? 1 : 0;
  }

  dispose() {
    this.generation++;
    for (const r of this.roots) this.disposeNode(r);
  }
}
