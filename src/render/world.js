// Per-body render objects and their per-frame camera-relative placement.

import * as THREE from 'three';
import { PlanetTerrain } from './planetTerrain.js';
import { cloudMapPixels } from '../gen/worldsim/snapshot.js';
import { DDF_SNOW, snowsBySeason } from '../gen/worldsim/season.js';
import { climateOpts } from '../gen/worldsim/climate.js';
import { frostCaps, frostPixels, FROST_NL, FROST_NS } from '../gen/frostcap.js';
import { Atmosphere, blankCloudMap, thermalUniform, cloudLife } from './atmosphere.js';
import { makeStarMesh } from './sky.js';
import { makeGiantMesh, makeRingMesh } from './giant.js';
import { VolumePass } from './volume.js';
import { CloudShadow, noCloudShadow } from './cloudShadow.js';
import { loadMaterials, windRipple } from './materials.js';
import { HeightCube } from './terrainShadow.js';
import { SUN_SHADOW_UNIFORMS, SKY_SHADOW_UNIFORMS } from './sunShadows.js';
import { moonLight } from './moonlight.js';
import { Liquid } from './liquid.js';
import { fallPhysics, FallFx } from './falls.js';
import { RIBBON_PASS } from './terrainMaterial.js';
import * as U from '../core/units.js';

const _v = new THREE.Vector3(), _v2 = new THREE.Vector3(), _v3 = new THREE.Vector3(), _v4 = new THREE.Vector3();
const _m4 = new THREE.Matrix4(), _up = new THREE.Vector3();
// (a world's seasons before its climate's year arrives: none)
const _blankSeason = (() => { const t = new THREE.DataTexture(new Uint8Array([128, 128, 0, 255]), 1, 1, THREE.RGBAFormat); t.needsUpdate = true; return t; })();
function blankSeasonMap() { return _blankSeason; }
// a world's seasonal frost where its thin air freezes out at the poles (Mars' CO2: gen/frostcap.js), as
// a texture by the solar longitude and latitude, or null: a solid world under a thin air (under ~0.05
// bar: one that carries little heat to its poles) with CO2 in it, and no liquid on it (a sea's heat; a
// lava or sulfur moon's poles hold no frost). A world locked to its star has no seasons: its night side's
// cold trap (the air collapsing onto it as CO2 ice) is another thing, not drawn yet
function frostTexture(d, sys) {
  const a = d.atmosphere, t = d.terrain;
  if (!a || !a.comp || !(a.comp.CO2 > 0) || !(a.pressure < 0.05) || !t || !t.climate || t.liquid || !sys || !sys.bodies) return null;
  const host = d.kind === 'moon' ? sys.bodies[d.parentId] : null, f = frostCaps(climateOpts(d, sys.bodies[0], host), a.pressure * 1e5 * a.comp.CO2);
  if (!f) return null;
  const tex = new THREE.DataTexture(frostPixels(f), FROST_NS, FROST_NL, THREE.RedFormat);
  tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.ClampToEdgeWrapping; tex.magFilter = THREE.LinearFilter; tex.minFilter = THREE.LinearFilter; tex.needsUpdate = true;
  return tex;
}
const _blankFrost = (() => { const t = new THREE.DataTexture(new Uint8Array([0]), 1, 1, THREE.RedFormat); t.needsUpdate = true; return t; })();

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
      // (with its year where the seasons have it, season.js cloudYearPixels: g, b the swing's two parts
      // about the year's cover r, so the texture blends them; the clouds turn them by the sun's place in
      // the year, uCloudYear)
      const yr = snap.cloudYearPx && snap.cloudYearPx.length === 2 * map.w * map.h ? snap.cloudYearPx : null;
      let px = map.px;
      if (yr) {
        px = new Uint8Array(4 * map.w * map.h);
        for (let i = 0, n = map.w * map.h; i < n; i++) { px[4 * i] = map.px[i]; px[4 * i + 1] = yr[2 * i]; px[4 * i + 2] = yr[2 * i + 1]; px[4 * i + 3] = 255; }
      }
      it.cloudYearOn = !!yr;
      const tex = new THREE.DataTexture(px, map.w, map.h, yr ? THREE.RGBAFormat : THREE.RedFormat);
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
    const texOf = (px) => { const t = new THREE.DataTexture(px, map.w, map.h, THREE.RGBAFormat); t.wrapS = THREE.RepeatWrapping; t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearFilter; t.needsUpdate = true; return t; };
    for (const [k, px] of [['tSeasonMap', map.px], ['tSeasonIce', map.icePx]]) {
      if (!px) continue;
      const old = it.shared[k].value;
      it.shared[k].value = texOf(px);
      if (old && old !== _blankSeason) old.dispose();
    }
    // (y: the snow's melt over the year per degree above freezing, mm: its degree-day factor times its
    // year's days)
    // (z: on, where its snow comes and goes with them)
    const p = it.body.data.terrain;
    it.shared.uSeason.value.set(0, DDF_SNOW * map.yearDays, p && snowsBySeason(p) ? 1 : 0, 0);
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
      // (the night's own light, the stars' and the air's glow, as moonlight is drawn: moonlight.js; a full
      // Moon ~100 times it)
      uAmbientFloor: { value: new THREE.Vector3(0.0001, 0.0001, 0.00013) },
      // (its moons' light: the brightest's direction and light, moonlight.js)
      uMoonDir: { value: new THREE.Vector3(0, 1, 0) },
      uMoonE: { value: new THREE.Vector3() },
      uDebug: { value: 0 },
      tNoise: { value: this.cloudNoise },
      // (the atmosphere's own: rebuildTerrain hands the climate's cloud map to all three)
      tCloudMap: a ? a.material.uniforms.tCloudMap : { value: blankCloudMap() },
      uCloudMapMean: a ? a.material.uniforms.uCloudMapMean : { value: 0 },
      uCloudYear: a ? a.material.uniforms.uCloudYear : { value: new THREE.Vector2() },
      uThermal: a ? a.material.uniforms.uThermal : { value: thermalUniform(b) },
      uWindRipple: { value: windRipple(b) },
      ...(it.heightCube ? it.heightCube.uniforms : {}),
      ...(it.liquid ? it.liquid.uniforms : {}),
      ...(it.liquid ? (it.falls = fallPhysics(b, it.liquid.U)).uniforms : {}),
      ...SUN_SHADOW_UNIFORMS,
      ...SKY_SHADOW_UNIFORMS,
      uNear: { value: new THREE.Vector2(0, 0) },
      uNearUp: { value: new THREE.Vector3(0, 1, 0) },
      // (the seasons on its land: its climate's year by place, setSeasonMap; where the sun stands in its
      // year, set each frame: terrainMaterial.js seasonSnow)
      tSeasonMap: { value: blankSeasonMap() },
      tSeasonIce: { value: blankSeasonMap() },
      uSeason: { value: new THREE.Vector4(0, 0, 0, 0) },
      uSnowCol: { value: new THREE.Vector3(...(b.data.terrain && b.data.terrain.palette && b.data.terrain.palette.snow || [0.85, 0.87, 0.9])) },
      // (a thin air's seasonal frost, Mars' CO2: frostTexture; where the sun stands in its year, set each
      // frame: season.js seasonFrost)
      tFrost: { value: _blankFrost },
      uFrost: { value: new THREE.Vector4(0, 0, 0, 0) },
    };
    if (b.solid) {
      const ft = frostTexture(b.data, this.u.system);
      if (ft) { it.shared.tFrost.value = ft; it.shared.uFrost.value.y = 1; }
    }
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
      // its night's light: its brightest moon's (or, from a moon, its planet's); none by day where the
      // camera is (the sun's thousands of times brighter: not worth the ground's shaders' while)
      const ml = it.moon = moonLight(this.u, b, it.moon);
      const camUp = _up.copy(_v).negate().normalize(), sunUp = camUp.dot(sh.uSunDir.value), near = dist - b.R < 60000;
      sh.uMoonDir.value.copy(ml.dir);
      sh.uMoonE.value.copy(this.starColor).multiplyScalar(near && sunUp > 0.1 ? 0 : ml.E);
      if (ss && b.solid && it.terrain && near && dist - b.R < ssBest) {
        // (the shadows the key light's: the sun's, or by night the moon's when it's up)
        const moonKey = ml.E > 0 && sunUp < -0.05 && camUp.dot(ml.dir) > 0.02;
        ssBest = dist - b.R; ss.active = true; ss.sunDir.copy(moonKey ? ml.dir : sh.uSunDir.value); ss.anchor.copy(_v); ss.bodyQInv.copy(b.qInv); ss.body = b;
        // (the leaves' colour for the light a canopy passes down: its foliage's, its brightness one)
        if (!it.leafTint) {
          const v = b.data.terrain && b.data.terrain.palette && b.data.terrain.palette.veg, Y = v ? 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2] : 0;
          it.leafTint = Y > 1e-4 ? v.map((x) => Math.min(2.5, x / Y)) : [1, 1, 1];
        }
        SKY_SHADOW_UNIFORMS.uLeafTint.value.set(...it.leafTint);
      }
      _m4.makeRotationFromQuaternion(b.qInv);
      sh.uToFixed.value.setFromMatrix4(_m4);
      sh.uTime.value = this.timeSec;
      if (it.cloudClock) { const c = it.cloudClock.value, t = this.u.t, Y = Math.floor(t / c.z); c.set(t - Y * c.z, Y + 1048576, c.z, 0); }
      if (sh.uSeason && sh.uSeason.value.z > 0) sh.uSeason.value.x = b.solarLongitude();
      if (sh.uFrost && sh.uFrost.value.y > 0) sh.uFrost.value.x = b.solarLongitude();
      // (the clouds' year: where the sun stands in it)
      if (it.atmo && it.atmo.material.uniforms.uCloudYear) {
        const L = it.cloudYearOn ? b.solarLongitude() : 0;
        it.atmo.material.uniforms.uCloudYear.value.set(it.cloudYearOn ? Math.cos(L) : 0, it.cloudYearOn ? Math.sin(L) : 0);
      }
      if (it.liquid) it.liquid.update(this.timeSec, _v2.copy(sh.uSunDir.value).applyMatrix3(sh.uToFixed.value));
      const angular = (b.R + (it.atmo ? it.atmo.top - b.R : 0)) / Math.max(dist, 1) * pxPerRad;
      if (it.terrain) {
        _v2.copy(camWorld).sub(b.pos).applyQuaternion(b.qInv);
        it.group.visible = angular > 0.6;
        it.terrain.worldT = this.u.t;
        if (it.group.visible) it.terrain.update(_v2);
        // (the dust the wind's raised where the camera is (sim/dust.js) in the sky's haze; none from high up:
        // it's a region's, the world seen whole its own air's)
        if (it.atmo) {
          const dk = it.group.visible && it.terrain.dust ? 1 - THREE.MathUtils.smoothstep(_v2.length() - b.R, 20000, 80000) : 0;
          it.atmo.setDust(this.engine.renderer, dk > 0 ? it.terrain.dust.tau * dk : 0, dk > 0 ? it.terrain.dust.salt * dk : 0);
        }
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
        if (u.uMoonE) { u.uMoonDir.value.copy(sh.uMoonDir.value); u.uMoonE.value.copy(sh.uMoonE.value); }
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
