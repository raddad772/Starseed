// Game orchestration: universe time and warp, ship/player simulation,
// camera, lighting, start sequence, settlement surveys, events.

import * as THREE from 'three';
import { generateSystem } from './gen/system.js';
import { Universe } from './sim/universe.js';
import { Engine } from './render/engine.js';
import { WorkerPool } from './render/workerPool.js';
import { WorldRenderer } from './render/world.js';
import { Sky } from './render/sky.js';
import { makeDetailTexture } from './render/terrainMaterial.js';
import { makeCloudNoise } from './render/noise3d.js';
import { FreeCam } from './sim/freecam.js';
import { Ship, ASSIST_NAMES } from './sim/ship.js';
import { Player } from './sim/player.js';
import { FTL } from './sim/ftl.js';
import { ShipVisual } from './render/shipVisual.js';
import { Hud } from './ui/hud.js';
import { MapView } from './ui/map.js';
import { AudioEngine } from './audio.js';
import { SHIP_INTERIOR } from './render/shipModel.js';
import * as U from './core/units.js';

export const WARP_LEVELS = [1, 2, 4, 10, 50, 100, 1000, 10000, 100000];
const PHYS_DT = 1 / 120;
const _v1 = new THREE.Vector3(), _v2 = new THREE.Vector3(), _v3 = new THREE.Vector3();
const _q1 = new THREE.Quaternion();

export class Game {
  constructor(canvas, input, seed, opts = {}) {
    this.canvas = canvas;
    this.input = input;
    this.seed = seed;
    this.opts = opts;
    this.system = generateSystem(seed);
    this.universe = new Universe(this.system);
    this.engine = new Engine(canvas, { renderScale: opts.renderScale || 1, reversedDepth: opts.reversedDepth });
    const terrainBodies = this.system.bodies.filter((b) => b.terrain).map((b) => ({ id: b.id, terrain: b.terrain }));
    const nWorkers = opts.workers || Math.max(1, Math.min(4, (navigator.hardwareConcurrency || 4) - 2));
    this.pool = new WorkerPool(nWorkers, terrainBodies);
    this.detailTex = makeDetailTexture();
    this.sky = new Sky(this.engine.renderer, seed);
    this.engine.scene.add(this.sky.points);
    this.cloudNoise = makeCloudNoise(64);
    this.world = new WorldRenderer(this.engine, this.universe, this.pool, this.detailTex, this.cloudNoise);
    this.camPos = new THREE.Vector3();
    this.camQuat = new THREE.Quaternion();
    this.t = 0;
    this.warpIndex = 0;
    this.freecam = new FreeCam(this);
    this.ship = new Ship(this);
    this.ship.body = this.startBody;
    this.shipVisual = new ShipVisual(this.engine, this.ship);
    this.player = new Player(this);
    this.ftl = new FTL(this, this.ship);
    this.ship.ftl = this.ftl;
    this.hud = new Hud(this);
    this.map = new MapView(this);
    this.audio = new AudioEngine(this);
    this.camMode = 'first';
    this.chaseQuat = new THREE.Quaternion();
    this.target = null;
    this.settlements = new Map();
    this.surveyJobs = new Map();
    this.showSites = false;
    this.state = 'loading';
    this.lastFrame = performance.now();
    this.fps = 60;
    this.paused = false;
    this.stats = { frameMs: 16 };
    this.debugFree = false;
    this.lighting = {
      sunDir: new THREE.Vector3(1, 0, 0), sunColor: new THREE.Color(), sunIntensity: 1,
      skyColor: new THREE.Color(), groundColor: new THREE.Color(), skyIntensity: 1, up: new THREE.Vector3(0, 1, 0),
    };
    this.loadTimer = 0;
    this.settleTime = 0;
    this.respawnInfo = null;
    // white balance: partial chromatic adaptation to the star's colour
    const sc = this.system.star.color;
    const adapt = 0.55;
    this.engine.whiteBalance.set(1 / (1 + (sc[0] - 1) * adapt), 1 / (1 + (sc[1] - 1) * adapt), 1 / (1 + (sc[2] - 1) * adapt));
    window.addEventListener('resize', () => { this.engine.resize(); this.hud.resize(); this.map.resize(); });
    this.begin();
  }

  get startBody() { return this.universe.bodies[this.system.startBodyId]; }
  get warp() { return WARP_LEVELS[this.warpIndex]; }

  message(text, kind) { this.hud.message(text, kind); }

  // ------------------------------------------------------------------ start sequence

  begin() {
    const b = this.startBody;
    this.hud.setLoading(`Surveying ${b.data.name} for a landing site…`);
    this.requestSurvey(b, -50).then((res) => {
      const site = res && res.sites && res.sites[0];
      this.placeStart(b, site ? new THREE.Vector3(...site.dir) : this.fallbackSite(b), site);
    }, (err) => {
      console.error(err);
      this.placeStart(b, this.fallbackSite(b), null);
    });
  }

  fallbackSite(b) {
    const gen = b.terrain;
    const s = new Float64Array(16);
    for (let i = 0; i < 2000; i++) {
      const z = 1 - (i + 0.5) / 2000 * 2, r = Math.sqrt(1 - z * z), th = i * 2.399963;
      const d = [Math.cos(th) * r, z * 0.8, Math.sin(th) * r];
      gen.sample(d[0], d[1], d[2], 2000, s);
      if (s[0] > 20 && s[0] < 1500) return new THREE.Vector3(...d).normalize();
    }
    return new THREE.Vector3(1, 0, 0);
  }

  requestSurvey(b, priority = 50) {
    if (!b.solid) return Promise.resolve(null);
    if (this.settlements.has(b.id)) return Promise.resolve(this.settlements.get(b.id));
    if (this.surveyJobs.has(b.id)) return this.surveyJobs.get(b.id);
    const job = this.pool.submit({ type: 'analyze', body: b.id, options: { level: 6 } }, priority);
    const p = job.promise.then((r) => { this.settlements.set(b.id, r.result); return r.result; });
    this.surveyJobs.set(b.id, p);
    return p;
  }

  // time when the sun stands ~elev degrees over the morning horizon at dirF
  findMorning(b, dirF, elevDeg = 16, t0 = 0) {
    if (b.data.rotation.locked) return t0;
    const P = Math.abs(b.data.rotation.periodGame);
    const step = P / 900;
    const pos = new THREE.Vector3(), q = new THREE.Quaternion();
    const target = Math.sin(THREE.MathUtils.degToRad(elevDeg));
    let prev = null;
    for (let t = t0; t < t0 + P * 1.05; t += step) {
      this.universe.bodyStateAt(b, t, pos);
      b.orientationAt(t, q);
      const sunF = pos.negate().normalize().applyQuaternion(q.invert());
      const e = sunF.dot(dirF);
      if (prev !== null && prev < target && e >= target) return t;
      prev = e;
    }
    return t0;
  }

  placeStart(b, dirF, site) {
    this.site = site;
    this.startDir = dirF.clone().normalize();
    this.t = this.findMorning(b, this.startDir, 30);
    this.universe.update(this.t);
    this.landShipAt(b, this.startDir, null);
    // player stands off the ship's port bow, looking back at it
    const up = this.startDir.clone();
    const sp = this.ship.landedPosF.clone();
    const sq = this.ship.landedQuatF.clone();
    const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(sq);
    const left = new THREE.Vector3(-1, 0, 0).applyQuaternion(sq);
    const pp = sp.clone().addScaledVector(fwd, 9).addScaledVector(left, 19);
    const toShip = sp.clone().sub(pp);
    this.player.placeOnSurface(b, pp.normalize(), toShip);
    this.player.pitch = 0.04;
    this.ship.rampTarget = 1; this.ship.ramp = 1;
    this.state = 'loading';
    this.loadTimer = 0;
    this.hud.setLoading(`Descending to ${b.data.name}…`);
    this.respawnInfo = { body: b, dir: this.startDir.clone() };
  }

  // Lands the ship (settled pose) at a body-fixed direction
  landShipAt(b, dirF, headingF) {
    const up = dirF.clone().normalize();
    let north = new THREE.Vector3(0, 1, 0).addScaledVector(up, -up.y);
    if (north.lengthSq() < 1e-6) north = new THREE.Vector3(1, 0, 0).addScaledVector(up, -up.x);
    north.normalize();
    const east = north.clone().cross(up).normalize();
    const fwd = headingF ? headingF.clone().addScaledVector(up, -headingF.dot(up)).normalize() : east;
    // fit the local ground plane under the four feet
    const right = fwd.clone().cross(up).normalize();
    const samples = [[-3, -6.6], [3, -6.6], [-3.1, 6.2], [3.1, 6.2], [0, 0]];
    let hs = 0;
    const nrm = new THREE.Vector3();
    const R = b.R;
    const pts = [];
    for (const [x, z] of samples) {
      const p = up.clone().multiplyScalar(R).addScaledVector(right, x).addScaledVector(fwd, -z);
      const h = b.groundHeight(p.normalize());
      pts.push(p.clone().multiplyScalar(R + h));
      hs = Math.max(hs, h);
    }
    nrm.copy(pts[1].clone().sub(pts[2])).cross(pts[0].clone().sub(pts[3])).normalize();
    if (nrm.dot(up) < 0) nrm.negate();
    if (nrm.dot(up) < 0.94) nrm.copy(up); // too steep: stay level, legs take the slack
    const upS = nrm;
    const fwdS = fwd.clone().addScaledVector(upS, -fwd.dot(upS)).normalize();
    const rightS = fwdS.clone().cross(upS).normalize();
    const m = new THREE.Matrix4().makeBasis(rightS, upS, fwdS.clone().negate());
    const quatF = new THREE.Quaternion().setFromRotationMatrix(m);
    const ground = b.groundHeight(up);
    const posF = up.clone().multiplyScalar(R + Math.max(ground, hs) + 2.35);
    const s = this.ship;
    s.body = b;
    s.dead = false; s.hull = 1; s.hullTemp = 290;
    s.landed = false; s.rails = false;
    s.pos.copy(posF).applyQuaternion(b.q);
    s.frameVel(s.vel);
    s.quat.copy(b.q).multiply(quatF);
    s.angVel.copy(b.omega).applyQuaternion(s.quat.clone().invert());
    s.gear = s.gearTarget = 1;
    s.targetVel.set(0, 0, 0); s.targetFrame = 'surface';
    s.cruise = s.slip = s.climb = 0;
    s.assist = 2;
    // a clearing in any vegetation around the landing spot
    const terr = this.world.terrainOf(b.id);
    if (terr) terr.addClearing(up.clone().multiplyScalar(R), 22);
    // settle on the legs (time advances with the physics: the surface is
    // moving at hundreds of m/s in the inertial frame the ship integrates in)
    for (let i = 0; i < 900 && !s.landed; i++) {
      this.t += PHYS_DT;
      this.universe.update(this.t);
      this.stepShip(PHYS_DT, true);
    }
    if (!s.landed) {
      s.landed = true;
      s.landedPosF.copy(s.pos).applyQuaternion(b.qInv);
      s.landedQuatF.copy(b.qInv).multiply(s.quat);
      s.syncLanded();
    }
  }

  // ------------------------------------------------------------------ controls

  setWarp(i) {
    i = Math.max(0, Math.min(WARP_LEVELS.length - 1, i));
    if (i > 2) {
      const why = this.warpBlocker();
      if (why) { this.message(`Time warp limited: ${why}`, 'caution'); i = Math.min(i, 2); }
    }
    if (i !== this.warpIndex) {
      this.warpIndex = i;
      if (i > 2 && !this.ship.landed && !this.ship.rails) this.ship.enterRails();
    }
  }

  warpBlocker() {
    const s = this.ship, p = this.player;
    if (this.ftl.state === 'cruise' || this.ftl.state === 'spool') return 'FTL active';
    if (p.mode === 'eva') return 'EVA in progress';
    if (p.mode === 'surface' && !p.grounded) return 'not on the ground';
    if (!s.landed) {
      if (s.wantsForce() && s.assist !== 2) return 'thrusting';
      const alt = s.altitude;
      if (s.body.atm && alt < s.body.atmHeight) return 'inside an atmosphere';
      if (alt < s.safeAltitude()) return 'too close to the surface';
    }
    return null;
  }

  toggleRamp() {
    const s = this.ship;
    s.rampTarget = s.rampTarget > 0.5 ? 0 : 1;
    this.message(s.rampTarget ? 'Ramp lowering' : 'Ramp closing');
    this.audio.clunk();
  }

  cycleAssist() {
    const s = this.ship;
    s.assist = (s.assist + 1) % 3;
    if (s.assist === 2) {
      // engage velocity hold at the current velocity (no lurch): the
      // controller re-initialises its targets from the present motion
      s.targetFrame = 'none';
    }
    this.message(`Flight assist: ${ASSIST_NAMES[s.assist]}`, s.assist === 0 ? 'caution' : 'nav');
  }

  summonShip() {
    const p = this.player;
    const b = p.body;
    const up = p.fPos.clone().normalize();
    const fwd = p.heading.clone();
    const dest = up.clone().multiplyScalar(b.R).addScaledVector(fwd, 45).normalize();
    this.landShipAt(b, dest, fwd.clone().negate());
    this.ship.rampTarget = 1; this.ship.ramp = 1;
    this.message('Ship summoned', 'nav');
  }

  cycleTarget(dir = 1) {
    const wp = this.camPos;
    const list = this.universe.bodies.slice().sort((a, b) => a.pos.distanceTo(wp) - b.pos.distanceTo(wp));
    const cur = this.target ? list.indexOf(this.target) : -1;
    let i = (cur + dir + list.length) % list.length;
    if (list[i] === this.player.currentBody() && list.length > 1) i = (i + dir + list.length) % list.length;
    this.target = list[i];
    this.message(`Target: ${this.target.data.name}`, 'target');
    this.requestSurvey(this.target, 80);
  }

  // ------------------------------------------------------------------ frame

  frame(now) {
    let dtReal = Math.min(0.1, Math.max(0.0005, (now - this.lastFrame) / 1000));
    this.lastFrame = now;
    this.fps = this.fps * 0.95 + (1 / dtReal) * 0.05;
    const t0 = performance.now();
    const input = this.input;
    this.handleGlobalKeys(input);
    if (this.state === 'loading') this.updateLoading(dtReal);
    if (this.state === 'playing' && !this.paused) this.simulate(dtReal);
    else if (this.state !== 'playing') this.universe.update(this.t);
    this.updateCamera(dtReal);
    this.engine.camera.position.set(0, 0, 0);
    this.engine.camera.quaternion.copy(this.camQuat);
    this.computeLighting();
    this.shipVisual.update(dtReal, this.camPos, this.lighting);
    const atmos = this.world.update(this.camPos, dtReal);
    this.updateSkyStars(dtReal);
    this.updateEffects(dtReal);
    if (this.map.open) this.map.render(dtReal);
    else this.engine.render(dtReal, this.sky, atmos);
    this.pool.pump();
    this.hud.update(dtReal);
    this.audio.update(dtReal);
    input.endFrame();
    this.stats.frameMs = this.stats.frameMs * 0.9 + (performance.now() - t0) * 0.1;
  }

  handleGlobalKeys(input) {
    if (this.debugFree) return;
    if (input.hit('KeyM')) this.map.toggle();
    if (this.state !== 'playing') return;
    if (input.hit('Comma')) this.setWarp(this.warpIndex - 1);
    if (input.hit('Period')) this.setWarp(this.warpIndex + 1);
    if (input.hit('Tab')) this.cycleTarget(input.down('ShiftLeft') ? -1 : 1);
    if (input.hit('KeyK')) { this.showSites = !this.showSites; this.message(this.showSites ? 'Settlement survey overlay on' : 'Settlement survey overlay off'); }
    if (input.hit('KeyH')) this.hud.toggleHelp();
    const seated = this.player.mode === 'seat';
    if (seated) {
      if (input.hit('KeyZ')) this.cycleAssist();
      if (input.hit('KeyG')) { this.ship.gearTarget = this.ship.gearTarget > 0.5 ? 0 : 1; this.message(this.ship.gearTarget ? 'Gear down' : 'Gear up'); this.audio.clunk(); }
      if (input.hit('KeyR')) this.toggleRamp();
      if (input.hit('KeyL')) { this.shipVisual.floodOn = !this.shipVisual.floodOn; }
      if (input.hit('KeyJ')) this.ftl.toggle();
      if (input.hit('KeyV')) this.camMode = this.camMode === 'first' ? 'chase' : 'first';
    }
  }

  updateLoading(dt) {
    this.loadTimer += dt;
    this.universe.update(this.t);
    if (!this.respawnInfo) return;
    const pending = this.world.pendingNear();
    const terr = this.world.terrainOf(this.player.currentBody().id);
    const deepEnough = !terr || terr.deepest >= terr.maxLevel - 1;
    this.hud.setLoading(`Descending to ${this.player.currentBody().data.name}… ${pending ? pending + ' terrain tiles' : ''}`);
    if (pending === 0 && deepEnough) this.settleTime += dt; else this.settleTime = 0;
    if ((this.settleTime > 0.4 && this.loadTimer > 1) || this.loadTimer > 25) {
      this.state = 'playing';
      this.hud.setLoading(null);
      this.engine.adaptReset = true;
      this.message(`${this.player.currentBody().data.name}: ${this.player.currentBody().data.label}`, 'nav');
      if (this.site) this.message(`Landing site: ${this.site.biome}, ${this.site.reasons.slice(0, 2).join(', ')}`);
    }
  }

  simulate(dtReal) {
    const warp = this.warp;
    let dt = dtReal * warp;
    const s = this.ship, p = this.player;
    // player input -> ship controls (before the warp guard reads them)
    const mouse = this.input.mouse();
    if (p.mode === 'seat') this.pilotControls(dtReal, mouse);
    else { const c = s.ctrl; c.fwd = c.strafe = c.lift = c.pitch = c.yaw = c.roll = 0; c.boost = c.brake = false; }
    // warp guard: thrust input or atmosphere drops rails warp
    if (warp > 4) {
      const why = this.warpBlocker();
      const thrusting = p.mode === 'seat' && (s.ctrl.fwd || s.ctrl.lift || s.ctrl.strafe);
      if (why || thrusting) { this.setWarp(thrusting ? 0 : 2); dt = dtReal * this.warp; }
    }
    // ship
    if (this.ftl.state === 'cruise') {
      this.t += dtReal;
      this.universe.update(this.t);
      this.ftl.update(dtReal);
      this.rotateOnly(dtReal);
      s.coastEnv();
    } else {
      this.ftl.update(dtReal);
      // the drive may have just engaged: no Newtonian step this frame
      if (this.ftl.state === 'cruise') { this.t += dtReal; this.universe.update(this.t); s.rails = false; }
      else this.advanceShip(dt);
    }
    // player (surface physics at frame rate, interior moves with the ship)
    if (p.mode !== 'seat') p.update(Math.min(dtReal * Math.min(warp, 4), 0.05), this.input, p.mode === 'seat' ? { dx: 0, dy: 0 } : mouse);
    else p.update(dtReal, this.input, mouse);
    if (s.dead && !this.deathShown) this.onDeath(s.deathCause);
  }

  pilotControls(dt, mouse) {
    const s = this.ship, c = s.ctrl, input = this.input;
    c.fwd = input.axis('KeyS', 'KeyW');
    c.strafe = input.axis('KeyA', 'KeyD');
    c.lift = input.axis('KeyC', 'Space') || (input.down('ControlLeft') ? -1 : 0);
    c.roll = input.axis('KeyE', 'KeyQ');
    c.boost = input.down('ShiftLeft');
    c.brake = input.down('KeyX');
    // virtual stick: mouse motion deflects it, it springs back to centre
    const freeLook = input.buttons & 2 || input.down('AltLeft');
    if (!freeLook) {
      s.stick.x += mouse.dx * 9; s.stick.y += mouse.dy * 9;
    }
    s.stick.multiplyScalar(Math.exp(-dt / 0.22));
    if (s.stick.length() > 1) s.stick.normalize();
    const dz = (v) => Math.abs(v) < 0.015 ? 0 : v;
    c.pitch = -dz(s.stick.y);
    c.yaw = -dz(s.stick.x);
    if (this.ftl.state === 'cruise') { c.pitch *= 0.35; c.yaw *= 0.35; c.roll *= 0.5; }
  }

  // rotation integration while the FTL bubble carries the ship
  rotateOnly(dt) {
    const s = this.ship;
    const F = _v1, T = _v2;
    const save = s.assist;
    s.assist = 1;
    s.computeControl(dt, F, T);
    s.assist = save;
    const I = s.I, w = s.angVel;
    w.x += T.x / I.x * dt; w.y += T.y / I.y * dt; w.z += T.z / I.z * dt;
    const wl = w.length();
    if (wl > 1e-9) { _q1.setFromAxisAngle(_v3.copy(w).divideScalar(wl), wl * dt); s.quat.multiply(_q1).normalize(); }
    s.thrustLocal.set(0, 0, 0);
  }

  stepShip(h, settling = false) {
    const s = this.ship;
    const F = this._cf || (this._cf = new THREE.Vector3());
    const T = this._ct || (this._ct = new THREE.Vector3());
    s.computeControl(h, F, T);
    if (settling) F.set(0, 0, 0); // unpiloted: drop onto the legs
    s.step(h, F, T);
    s.environment(h);
    s.tryLand(h);
    if (settling) s.legComp.fill(0);
  }

  advanceShip(dt) {
    const s = this.ship;
    if (s.dead) { this.t += dt; this.universe.update(this.t); return; }
    const highWarp = this.warp > 4;
    const coasting = !s.landed && (highWarp || (!s.wantsForce() && s.assist !== 2)) && s.altitude > (s.body.atm ? s.body.atmHeight * 1.02 : 0) && s.altitude > s.safeAltitude();
    if (coasting) {
      if (!s.rails) s.enterRails();
      // propagate in sub-steps so atmosphere / SOI / surface events are not skipped
      const r0 = s.pos.length();
      const vmag = Math.max(1, s.vel.length());
      const n = Math.min(400, Math.max(1, Math.ceil(dt * vmag / Math.max(2000, (r0 - s.body.R) * 0.05))));
      const h = dt / n;
      for (let i = 0; i < n; i++) {
        this.t += h;
        this.universe.update(this.t);
        s.railsState(this.t, s.pos, s.vel);
        this.rotateOnly(h);
        const alt = s.altitude;
        if (s.checkSOI()) { this.message(`Entered ${s.body.data.name}'s sphere of influence`, 'nav'); }
        if ((s.body.atm && alt < s.body.atmHeight) || alt < s.safeAltitude()) {
          s.rails = false;
          if (this.warp > 1) { this.setWarp(0); this.message(s.body.atm && alt < s.body.atmHeight ? 'Atmospheric entry: warp stopped' : 'Surface proximity: warp stopped', 'caution'); }
          break;
        }
        if (s.wantsForce() && !highWarp) { s.rails = false; break; }
      }
      s.thrustLocal.set(0, 0, 0);
      s.coastEnv();
      return;
    }
    s.rails = false;
    if (s.landed && highWarp) {
      this.t += dt;
      this.universe.update(this.t);
      s.syncLanded();
      return;
    }
    const n = Math.min(64, Math.max(1, Math.ceil(dt / PHYS_DT)));
    const h = dt / n;
    for (let i = 0; i < n; i++) {
      this.t += h;
      this.universe.update(this.t);
      this.stepShip(h);
      s.checkSOI();
      if (s.dead) break;
    }
  }

  // ------------------------------------------------------------------ camera

  updateCamera(dt) {
    if (this.debugFree) { this.freecam.update(dt, dt, this.input); return; }
    const p = this.player, s = this.ship;
    if (this.state === 'loading' && !this.respawnInfo) return;
    if (this.camMode === 'chase' && p.mode === 'seat') {
      const wp = s.getWorldPos(_v1);
      this.chaseQuat.slerp(s.quat, 1 - Math.exp(-dt * 5));
      const off = _v2.set(0, 5.5, 30).applyQuaternion(this.chaseQuat);
      this.camPos.copy(wp).add(off);
      const m = new THREE.Matrix4().lookAt(this.camPos, _v3.copy(wp).addScaledVector(_v2.set(0, 2, 0).applyQuaternion(this.chaseQuat), 1), _v2.set(0, 1, 0).applyQuaternion(this.chaseQuat));
      this.camQuat.setFromRotationMatrix(m);
      return;
    }
    this.chaseQuat.copy(s.quat);
    p.computeCamera(this.camPos, this.camQuat);
    // shake: thrust, re-entry, landing impact
    const shake = Math.min(1, s.heatGlow * 0.5 + (p.mode === 'seat' ? (s.thrustLocal.length() / s.limits.main) * 0.15 + s.env.dynPressure / 4e5 : 0)) + (this.ftl.state === 'cruise' ? 0.05 : 0);
    if (shake > 0.002) {
      const a = shake * 0.004;
      _q1.setFromEuler(new THREE.Euler((Math.random() - 0.5) * a, (Math.random() - 0.5) * a, (Math.random() - 0.5) * a));
      this.camQuat.multiply(_q1);
    }
  }

  // Sun / sky light for standard materials at the camera's location
  computeLighting() {
    const L = this.lighting;
    const b = this.universe.dominantBody(this.camPos);
    const star = this.universe.star;
    L.sunDir.copy(star.pos).sub(this.camPos).normalize();
    const E = this.universe.sunIlluminance(this.camPos);
    const sc = this.system.star.color;
    let tr = [1, 1, 1], sky = [0, 0, 0];
    const it = this.world.items[b.id];
    const rel = _v1.copy(this.camPos).sub(b.pos);
    const r = rel.length();
    L.up.copy(rel).normalize();
    if (it && it.atmo) {
      const mu = L.up.dot(L.sunDir);
      tr = it.atmo.transmittance(r, mu);
      sky = it.atmo.skyIrradiance(r, mu);
    } else if (!b.isStar) {
      // airless: hard planet shadow
      const sinH = b.R / Math.max(r, b.R);
      const cosH = -Math.sqrt(Math.max(0, 1 - sinH * sinH));
      const mu = L.up.dot(L.sunDir);
      const vis = THREE.MathUtils.clamp((mu - cosH) / 0.01 + 0.5, 0, 1);
      tr = [vis, vis, vis];
    }
    const sr = sc[0] * tr[0], sg = sc[1] * tr[1], sb = sc[2] * tr[2];
    const mx = Math.max(sr, sg, sb, 1e-6);
    L.sunColor.setRGB(sr / mx, sg / mx, sb / mx);
    L.sunIntensity = E * mx;
    L.skyColor.setRGB(sky[0] * sc[0] * E, sky[1] * sc[1] * E, sky[2] * sc[2] * E);
    L.skyIntensity = 1;
    const mu = Math.max(0, L.up.dot(L.sunDir));
    const ga = 0.18;
    L.groundColor.setRGB((sr * E * mu + sky[0] * E) * ga * 0.5, (sg * E * mu + sky[1] * E) * ga * 0.5, (sb * E * mu + sky[2] * E) * ga * 0.5);
    // night-time floodlights come on automatically while landing
    this.ambientDark = L.sunIntensity < 0.02;
  }

  updateSkyStars(dt) {
    const sm = this.sky.starMat.uniforms;
    sm.uPixelRatio.value = this.engine.pixelRatio;
    sm.uTime.value += dt;
    const dom = this.universe.dominantBody(this.camPos);
    let tw = 0, ext = 1;
    if (dom && dom.atm && dom.atm.render) {
      const alt = this.camPos.distanceTo(dom.pos) - dom.R;
      const a = dom.atmosphereAt(alt);
      const surf = dom.atmosphereAt(0);
      const f = surf.pressure > 0 ? a.pressure / surf.pressure : 0;
      tw = Math.min(1, f * 2);
      ext = Math.exp(-f * Math.min(4, surf.pressure) * 0.25);
    }
    sm.uTwinkle.value = tw;
    sm.uExtinction.value = ext;
  }

  updateEffects(dt) {
    const e = this.engine;
    // dark adaptation deep inside giants (eyes / sensors open right up)
    const dom = this.universe.dominantBody(this.camPos);
    const depth = dom.giant ? -(this.camPos.distanceTo(dom.pos) - dom.R) : 0;
    e.maxExposure = 260 * (1 + Math.min(12, Math.max(0, depth / 15000)));
    e.flash.multiplyScalar(Math.exp(-dt * 3));
    // lightning lights up the whole view a little
    if (this.world.flash > 0) e.flash.addScalar(this.world.flash * 0.02);
    e.radialBlur = this.ftl.effect;
  }

  // ------------------------------------------------------------------ events

  onShipLanded(s) {
    if (this.state === 'playing') {
      const v = s.lastTouchdown || 0;
      this.message('Touchdown', 'ok');
    }
  }
  onSoiChange(s, from, to) { if (this.state === 'playing') this.message(`Now orbiting ${to.data.name}`, 'nav'); }
  onModeChange(mode) {
    if (mode === 'seat') this.message('Pilot seat: W/S thrust · Space/C lift · Z flight assist · G gear · J FTL', 'nav');
    if (mode === 'eva') this.message('EVA: WASD/Space/C jetpack · X stabilise · Q/E roll', 'nav');
  }
  onShipDamage(s, dmg, why) { if (dmg > 0.02) this.message(`Hull damage ${(dmg * 100).toFixed(0)}%`, 'warn'); this.engine.flash.set(0.3, 0.05, 0.02); }
  onShipDestroyed(s, cause) {
    const p = this.player;
    if (p.mode === 'seat' || p.mode === 'ship') this.onDeath(cause);
    else this.message(`Your ship was destroyed: ${cause}`, 'warn');
  }

  onDeath(cause) {
    if (this.deathShown) return;
    this.deathShown = true;
    this.setWarp(0);
    this.engine.flash.set(2, 1.2, 0.8);
    this.hud.showDeath(cause, () => this.respawn());
    this.audio.boom();
  }

  respawn() {
    this.deathShown = false;
    const ri = this.respawnInfo;
    const b = ri.body;
    this.ftl.state = 'idle'; this.ftl.speed = 0;
    this.landShipAt(b, ri.dir, null);
    this.ship.rampTarget = 1; this.ship.ramp = 1;
    this.player.mode = 'ship';
    this.player.sPos.set(0, 0, 2);
    this.player.sVel.set(0, 0, 0);
    this.player.heading.set(0, 0, -1);
    this.player.pitch = 0;
    this.player.body = b;
    this.player.sitDown(0);
    this.state = 'loading';
    this.loadTimer = 0;
    this.settleTime = 0;
  }

  dispose() {
    this.pool.dispose();
    this.audio.dispose && this.audio.dispose();
  }
}
