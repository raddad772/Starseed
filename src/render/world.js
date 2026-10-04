// Per-body render objects and their per-frame camera-relative placement.

import * as THREE from 'three';
import { PlanetTerrain } from './planetTerrain.js';
import { cloudMapPixels } from '../gen/worldsim/snapshot.js';
import { Atmosphere, blankCloudMap, thermalUniform } from './atmosphere.js';
import { makeStarMesh } from './sky.js';
import { makeGiantMesh, makeRingMesh } from './giant.js';
import { VolumePass } from './volume.js';
import { loadMaterials, windRipple } from './materials.js';
import * as U from '../core/units.js';

const _v = new THREE.Vector3(), _v2 = new THREE.Vector3();
const _m4 = new THREE.Matrix4();

export class WorldRenderer {
  constructor(engine, universe, pool, detailTex, cloudNoise) {
    this.engine = engine;
    this.cloudNoise = cloudNoise;
    this.u = universe;
    this.pool = pool;
    this.detailTex = detailTex;
    // (the ground's scanned materials: a neutral stand-in until they arrive)
    loadMaterials(engine.renderer).catch((e) => console.warn('ground materials:', e.message));
    this.items = [];
    const starColor = universe.system.star.color;
    this.starColor = new THREE.Vector3(starColor[0], starColor[1], starColor[2]);
    for (const b of universe.bodies) this.items.push(this.makeItem(b));
    this.timeSec = 0;
  }

  // a body's terrain data changed (a simulated world arrived: worldSims.js): drop its
  // meshes and build them again from the new data
  rebuildTerrain(bodyId) {
    const it = this.items.find((x) => x.body.data && x.body.data.id === bodyId);
    if (!it || !it.terrain) return;
    it.group.remove(it.terrain.group);
    it.terrain.dispose();
    it.terrain = new PlanetTerrain(it.body, this.pool, it.shared);
    it.group.add(it.terrain.group);
    // its clouds where its climate puts them
    const snap = it.body.data.terrain && it.body.data.terrain.snapshot;
    // (baked with the snapshot; a snapshot cached before that, baked here, coarser)
    const map = !snap ? null : snap.cloudPx ? { px: snap.cloudPx, w: snap.cloudW, h: snap.cloudW / 2 } : cloudMapPixels(snap, 256);
    if (map && it.atmo) {
      const tex = new THREE.DataTexture(map.px, map.w, map.h, THREE.RedFormat);
      // (its mean over the globe, rows weighted by their area: the clouds move about it)
      let sum = 0, wsum = 0;
      for (let y = 0; y < map.h; y++) {
        const w = Math.cos(((y + 0.5) / map.h - 0.5) * Math.PI);
        for (let x = 0; x < map.w; x++) sum += w * map.px[y * map.w + x];
        wsum += w * map.w;
      }
      const mean = Math.max(1e-3, sum / wsum / 255);
      tex.wrapS = THREE.RepeatWrapping; tex.magFilter = THREE.LinearFilter; tex.minFilter = THREE.LinearFilter; tex.needsUpdate = true;
      for (const m of [it.atmo.material, it.volume && it.volume.material]) if (m && m.uniforms.tCloudMap) { m.uniforms.tCloudMap.value = tex; m.uniforms.uCloudMapMean.value = mean; }
    }
  }

  makeItem(b) {
    const it = { body: b, group: new THREE.Group(), atmo: null, terrain: null, mesh: null, shared: null, point: null };
    it.group.matrixAutoUpdate = true;
    if (b.isStar) {
      it.mesh = makeStarMesh(b.data);
      it.group.add(it.mesh);
      this.engine.scene.add(it.group);
      return it;
    }
    // atmosphere first (surfaces sample its LUTs)
    if (b.atm && b.atm.render) it.atmo = new Atmosphere(this.engine.renderer, b);
    const a = it.atmo;
    it.shared = {
      uSunDir: { value: new THREE.Vector3(1, 0, 0) },
      uSunE: { value: new THREE.Vector3(1, 1, 1) },
      uCenter: { value: new THREE.Vector3() },
      uRadius: { value: b.R },
      uToFixed: { value: new THREE.Matrix3() },
      tDetail: { value: this.detailTex },
      uTime: { value: 0 },
      uHasAtmo: { value: a ? 1 : 0 },
      uBottom: { value: a ? a.bottom : b.R },
      uTop: { value: a ? a.top : b.R + 1 },
      uGround: { value: a ? a.ground : b.R },
      tTrans: { value: a ? a.trans.texture : null },
      tIrr: { value: a ? a.irr.texture : null },
      uCloud: { value: a ? a.material.uniforms.uCloud.value : new THREE.Vector4() },
      uCloudOn: { value: a ? a.material.uniforms.uCloudOn.value : 0 },
      uCloudOpacity: { value: a ? a.material.uniforms.uCloudColor.value.w : 0 },
      uLavaColor: { value: b.data.terrain && b.data.terrain.palette && b.data.terrain.palette.lava ? new THREE.Vector3(...b.data.terrain.palette.lava) : new THREE.Vector3(3.2, 0.75, 0.12) },   // (the body's own glow: blackbody at its melt's temperature)
      uAmbientFloor: { value: new THREE.Vector3(0.0004, 0.0004, 0.0005) },
      uDebug: { value: 0 },
      tNoise: { value: this.cloudNoise },
      // (the atmosphere's own: rebuildTerrain hands the climate's cloud map to all three)
      tCloudMap: a ? a.material.uniforms.tCloudMap : { value: blankCloudMap() },
      uCloudMapMean: a ? a.material.uniforms.uCloudMapMean : { value: 0 },
      uThermal: a ? a.material.uniforms.uThermal : { value: thermalUniform(b) },
      uWindRipple: { value: windRipple(b) },
      uNear: { value: new THREE.Vector2(0, 0) },
      uNearUp: { value: new THREE.Vector3(0, 1, 0) },
    };
    if (a) {
      const clouds = b.data.atmosphere && b.data.atmosphere.clouds;
      if (b.giant) it.volume = new VolumePass(b, a, this.cloudNoise, 0);
      else if (clouds && clouds.type !== 'sulfuric') it.volume = new VolumePass(b, a, this.cloudNoise, 1);
      // (the far shell's cover reads the noise on every world: bound only beside a near volume, a
      // sulfuric deck, which has none, read nothing and was never drawn, its world a ball of haze)
      a.material.uniforms.tNoise.value = this.cloudNoise;
    }
    if (b.solid) {
      it.terrain = new PlanetTerrain(b, this.pool, it.shared);
      it.group.add(it.terrain.group);
    } else if (b.giant) {
      it.mesh = makeGiantMesh(b, it.shared);
      it.group.add(it.mesh);
    }
    if (b.data.rings) {
      it.rings = makeRingMesh(b, it.shared);
      it.ringGroup = new THREE.Group();
      it.ringGroup.add(it.rings);
      this.engine.transparentScene.add(it.ringGroup);
    }
    // far-away point sprite so planets show as bright dots
    this.engine.scene.add(it.group);
    return it;
  }

  update(camWorld, dt) {
    this.timeSec += dt;
    this.flash = 0;
    const out = [];
    const cam = this.engine.camera;
    const pxPerRad = this.engine.height / (THREE.MathUtils.degToRad(cam.fov));
    for (const it of this.items) {
      const b = it.body;
      _v.copy(b.pos).sub(camWorld);
      it.group.position.copy(_v);
      it.group.quaternion.copy(b.q);
      const dist = _v.length();
      it.dist = dist;
      if (b.isStar) {
        it.mesh.material.uniforms.uTime.value = this.timeSec;
        continue;
      }
      // lighting: direction to the star from the body centre
      const sh = it.shared;
      sh.uSunDir.value.copy(b.pos).negate().normalize();
      const E = this.u.sunIlluminance(b.pos);
      sh.uSunE.value.copy(this.starColor).multiplyScalar(E);
      sh.uCenter.value.copy(_v);
      _m4.makeRotationFromQuaternion(b.qInv);
      sh.uToFixed.value.setFromMatrix4(_m4);
      sh.uTime.value = this.timeSec;
      const angular = (b.R + (it.atmo ? it.atmo.top - b.R : 0)) / Math.max(dist, 1) * pxPerRad;
      if (it.terrain) {
        _v2.copy(camWorld).sub(b.pos).applyQuaternion(b.qInv);
        it.group.visible = angular > 0.6;
        if (it.group.visible) it.terrain.update(_v2);
      }
      if (it.mesh && b.giant) {
        it.mesh.visible = angular > 0.6;
        it.mesh.material.uniforms.uCamFixed && it.mesh.material.uniforms.uCamFixed.value.copy(camWorld).sub(b.pos).applyQuaternion(b.qInv);
      }
      if (it.ringGroup) {
        it.ringGroup.position.copy(_v);
        it.ringGroup.quaternion.copy(b.qTilt);
        it.ringGroup.visible = angular > 0.5 && !(it.volActive && dist - b.R < 60000);
        const ru = it.rings.material.uniforms;
        ru.uPlanetCenter.value.copy(_v);
      }
      if (it.atmo && angular > 1.5) {
        // volumetric mode near giants' cloud tops and inside rocky worlds' weather
        const alt = dist - b.R;
        let useVol = false;
        if (it.volume) {
          const top = it.volume.decks.reduce((m, d) => Math.max(m, d.top), 0);
          useVol = b.giant ? alt < top + 600000 : alt < top + 22000;
        }
        it.volActive = useVol;
        if (it.mesh && b.giant) it.mesh.visible = it.mesh.visible && !useVol;
        const mat = useVol ? it.volume.material : it.atmo.material;
        const u = mat.uniforms;
        u.uCenter.value.copy(_v);
        u.uSunDir.value.copy(sh.uSunDir.value);
        u.uSunE.value.copy(sh.uSunE.value);
        u.uToFixed.value.copy(sh.uToFixed.value);
        if (useVol) {
          u.uTime.value = this.timeSec;
          this.flash = it.volume.updateLightning(dt, _v);
        } else {
          // fewer steps for small / distant atmospheres
          u.uSteps.value = angular > 200 ? 16 : (angular > 30 ? 12 : 8);
        }
        out.push({ material: mat, body: b, halfRes: true });
      }
    }
    out.sort((x, y) => this.items[y.body.id].dist - this.items[x.body.id].dist);
    return out;
  }

  terrainOf(bodyId) { return this.items[bodyId].terrain; }

  pendingNear() {
    let n = 0;
    for (const it of this.items) if (it.terrain) n += it.terrain.pendingNear;
    return n;
  }

  pendingChunks() {
    let n = 0;
    for (const it of this.items) if (it.terrain) n += it.terrain.pendingCount;
    return n;
  }
}

export function sunEFor(universe, worldPos) {
  return universe.sunIlluminance(worldPos);
}

export { U };
