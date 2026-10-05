// Per-body render objects and their per-frame camera-relative placement.

import * as THREE from 'three';
import { PlanetTerrain } from './planetTerrain.js';
import { cloudMapPixels } from '../gen/worldsim/snapshot.js';
import { DDF_SNOW, snowsBySeason } from '../gen/worldsim/season.js';
import { Atmosphere, blankCloudMap, thermalUniform, cloudLife } from './atmosphere.js';
import { makeStarMesh } from './sky.js';
import { makeGiantMesh, makeRingMesh } from './giant.js';
import { VolumePass } from './volume.js';
import { CloudShadow, noCloudShadow } from './cloudShadow.js';
import { loadMaterials, windRipple } from './materials.js';
import { HeightCube } from './terrainShadow.js';
import { SUN_SHADOW_UNIFORMS } from './sunShadows.js';
import { Liquid } from './liquid.js';
import { fallPhysics, FallFx } from './falls.js';
import { RIBBON_PASS } from './terrainMaterial.js';
import * as U from '../core/units.js';

const _v = new THREE.Vector3(), _v2 = new THREE.Vector3(), _v3 = new THREE.Vector3(), _v4 = new THREE.Vector3();
const _m4 = new THREE.Matrix4(), _sl = new THREE.Vector3();
// (a world's seasons before its climate's year arrives: none)
const _blankSeason = (() => { const t = new THREE.DataTexture(new Uint8Array([128, 128, 0, 255]), 1, 1, THREE.RGBAFormat); t.needsUpdate = true; return t; })();
function blankSeasonMap() { return _blankSeason; }

export class WorldRenderer {
  constructor(engine, universe, pool, detailTex, cloudNoise) {
    this.engine = engine;
    this.cloudNoise = cloudNoise;
    this.u = universe;
    this.pool = pool;
    FallFx.soft = { scene: engine.softScene, uniforms: engine.softUniforms };
    RIBBON_PASS.scene = engine.waterScene; RIBBON_PASS.uniforms = engine.waterUniforms;
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
    if (it.heightCube) it.heightCube.invalidate();
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

  // a world's seasons arrived (worldSims.js: worldsim/season.js seasonMap, its climate's year by place):
  // its land's snow follows them from here
  setSeasonMap(bodyId, map) {
    const it = this.items.find((x) => x.body.data && x.body.data.id === bodyId);
    if (!it || !it.shared || !it.shared.tSeasonMap) return;
    const tex = new THREE.DataTexture(map.px, map.w, map.h, THREE.RGBAFormat);
    tex.wrapS = THREE.RepeatWrapping; tex.magFilter = THREE.LinearFilter; tex.minFilter = THREE.LinearFilter; tex.needsUpdate = true;
    const old = it.shared.tSeasonMap.value;
    it.shared.tSeasonMap.value = tex;
    if (old && old !== _blankSeason) old.dispose();
    // (y: the snow's melt over the year per degree above freezing, mm: its degree-day factor times its
    // year's days)
    // (z: on, where its snow comes and goes with them)
    const p = it.body.data.terrain;
    it.shared.uSeason.value.set(0, DDF_SNOW * map.yearDays, p && snowsBySeason(p) ? 1 : 0, 0);
  }

  // where the sun stands in a world's year (rad): its longitude along the world's sky from the northern
  // spring equinox, the climate's months' own (climate.js: 0 the equinox, pi/2 the north's midsummer),
  // from the sun's direction against the spin axis and the orbit's plane (a moon's: its planet's)
  solarLongitude(it) {
    const b = it.body, host = b.data.kind === 'moon' && b.parent ? b.parent : b;
    if (!it.orbitN) {
      const p = new THREE.Vector3(), v = new THREE.Vector3();
      this.u.bodyStateAt(host, this.u.t, p, v);
      it.orbitN = p.cross(v).normalize();
    }
    const ax = _v3.set(0, 1, 0).applyQuaternion(b.q);
    // (N: the spring equinox, where the sun crosses the equator heading north; M a quarter on)
    const N = _v4.copy(ax).cross(it.orbitN);
    if (N.lengthSq() < 1e-12) return 0;
    N.normalize();
    const s = it.shared.uSunDir.value, M = _sl.copy(it.orbitN).cross(N);
    return Math.atan2(s.dot(M), s.dot(N));
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
    // (the ground's shadows on itself: its coarse heights, built when it's near: terrainShadow.js)
    if (b.solid) it.heightCube = new HeightCube(b, this.pool);
    // (its seas', lakes' and rivers' liquid: liquid.js)
    if (b.solid) it.liquid = new Liquid(b, b.data.insolation || this.u.sunIlluminance(b.pos));
    // (and the air's: its shadows in the haze, the sky pass's and the near volume's)
    if (it.heightCube && a) for (const k of ['tHeightCube', 'uHeightCube']) a.material.uniforms[k] = it.heightCube.uniforms[k];
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
      ...(it.heightCube ? it.heightCube.uniforms : {}),
      ...(it.liquid ? it.liquid.uniforms : {}),
      ...(it.liquid ? (it.falls = fallPhysics(b, it.liquid.U)).uniforms : {}),
      ...SUN_SHADOW_UNIFORMS,
      uNear: { value: new THREE.Vector2(0, 0) },
      uNearUp: { value: new THREE.Vector3(0, 1, 0) },
      // (the seasons on its land: its climate's year by place, setSeasonMap; where the sun stands in its
      // year, set each frame: terrainMaterial.js seasonSnow)
      tSeasonMap: { value: blankSeasonMap() },
      uSeason: { value: new THREE.Vector4(0, 0, 0, 0) },
      uSnowCol: { value: new THREE.Vector3(...(b.data.terrain && b.data.terrain.palette && b.data.terrain.palette.snow || [0.85, 0.87, 0.9])) },
    };
    if (a) {
      const clouds = b.data.atmosphere && b.data.atmosphere.clouds;
      if (b.giant) it.volume = new VolumePass(b, a, this.cloudNoise, 0);
      else if (clouds && clouds.type !== 'sulfuric') it.volume = new VolumePass(b, a, this.cloudNoise, 1);
      if (it.volume && it.heightCube) for (const k of ['tHeightCube', 'uHeightCube']) it.volume.material.uniforms[k] = it.heightCube.uniforms[k];
      // (the clouds' wind, the near volume's, and the world's clock: every shader drawing them, the sky's,
      // the volume's, their shadows' and the ground's, reads the same generations)
      const vu = it.volume && it.volume.material.uniforms, w = it.cloudWind = { value: vu ? new THREE.Vector4(vu.uWindMax.value, vu.uBands.value, vu.uJetPhase.value, vu.uEqJet.value) : new THREE.Vector4(12, 3, 0, 0) };
      // (and the world's clock as they read it, set each frame: its generations as long as its winds' shear lets them last)
      it.cloudClock = { value: new THREE.Vector4(0, 0, cloudLife(w.value.x, w.value.y, w.value.w, b.R), 0) };
      for (const Uf of [it.shared, a.material.uniforms, vu]) if (Uf) { Uf.uCloudClock = it.cloudClock; Uf.uCloudWind = it.cloudWind; }
      // (its clouds' shadows and overcast light on the ground near the camera, from the near volume's decks)
      if (it.volume && !b.giant) it.cloudShadow = new CloudShadow(it.volume, b.R, clouds);
      // (the far shell's cover reads the noise on every world: bound only beside a near volume, a
      // sulfuric deck, which has none, read nothing and was never drawn, its world a ball of haze)
      a.material.uniforms.tNoise.value = this.cloudNoise;
    }
    Object.assign(it.shared, it.cloudShadow ? it.cloudShadow.uniforms : noCloudShadow(b.data.atmosphere && b.data.atmosphere.clouds));
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
    // (the near sun shadows follow the nearest solid world the camera is low over: sunShadows.js)
    const ss = this.engine.sunShadows;
    let ssBest = Infinity;
    if (ss) ss.active = false;
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
      if (ss && b.solid && it.terrain && dist - b.R < 60000 && dist - b.R < ssBest) {
        ssBest = dist - b.R; ss.active = true; ss.sunDir.copy(sh.uSunDir.value); ss.anchor.copy(_v);
      }
      _m4.makeRotationFromQuaternion(b.qInv);
      sh.uToFixed.value.setFromMatrix4(_m4);
      sh.uTime.value = this.timeSec;
      if (it.cloudClock) { const c = it.cloudClock.value, t = this.u.t, Y = Math.floor(t / c.z); c.set(t - Y * c.z, Y + 1048576, c.z, 0); }
      if (sh.uSeason && sh.uSeason.value.z > 0) sh.uSeason.value.x = this.solarLongitude(it);
      if (it.liquid) it.liquid.update(this.timeSec, _v2.copy(sh.uSunDir.value).applyMatrix3(sh.uToFixed.value));
      const angular = (b.R + (it.atmo ? it.atmo.top - b.R : 0)) / Math.max(dist, 1) * pxPerRad;
      if (it.terrain) {
        _v2.copy(camWorld).sub(b.pos).applyQuaternion(b.qInv);
        it.group.visible = angular > 0.6;
        if (it.group.visible) it.terrain.update(_v2);
        if (it.heightCube && it.heightCube.state === 0 && angular > 40) it.heightCube.build();
      }
      // (the clouds' shadows and the overcast's light on the ground near the camera, when it's low enough
      // to see the ground under them: cloudShadow.js, the near volume's decks on the wind)
      if (it.cloudShadow) {
        const camF = _v3.copy(camWorld).sub(b.pos).applyQuaternion(b.qInv), top = it.volume.decks.reduce((m, d) => Math.max(m, d.top), 0);
        const on = it.group.visible && camF.length() - b.R < top + 22000;   // (where the sky draws the near volume's decks)
        if (on) it.volume.material.uniforms.uTime.value = this.timeSec;
        it.cloudShadow.update(this.engine.renderer, camF, _v4.copy(sh.uSunDir.value).applyMatrix3(sh.uToFixed.value).normalize(), on);
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
