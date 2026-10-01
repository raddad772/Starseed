// Game orchestration: universe time and warp, vessel/player simulation,
// camera, lighting, start sequence, settlement surveys, events.
//
// Vessels form a hierarchy of coordinate spaces: free vessels move in their
// body's inertial frame (physics or analytic rails); vessels inside a big
// ship's zone fly in that ship's frame or sit docked in it, and everything is
// stepped on one clock, parents before children.

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
import { Ship, ASSIST_NAMES, VesselTarget } from './sim/ship.js';
import { VESSEL_TYPES, insideBox } from './sim/vesselTypes.js';
import { makeInterior } from './sim/interiors.js';
import { Player, lookQuat } from './sim/player.js';
import { FTL, lockRadius } from './sim/ftl.js';
import { ShipVisual } from './render/shipVisual.js';
import { BigShipVisual } from './render/bigShipVisual.js';
import { LightRig } from './render/lightRig.js';
import { Hud } from './ui/hud.js';
import { MapView } from './ui/map.js';
import { AudioEngine } from './audio.js';
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
    this.lights = new LightRig(this.engine);
    this.camPos = new THREE.Vector3();
    this.camQuat = new THREE.Quaternion();
    this.t = 0;
    this.warpIndex = 0;
    this.freecam = new FreeCam(this);
    this.vessels = [];
    this.ship = this.addVessel('shuttle', 'Wayfarer', 'SV-27');
    this.player = new Player(this);
    this.player.vessel = this.ship;
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
  // the vessel being flown, if any
  get piloted() { return this.player.mode === 'seat' ? this.player.vessel : null; }
  // the vessel the player is aboard, else their own ship
  get focus() { return this.player.aboard ? this.player.vessel : this.ship; }
  get ftl() { return this.focus.ftl; }
  get shipVisual() { return this.ship.visual; }

  message(text, kind) { this.hud.message(text, kind); }

  addVessel(typeKey, name, registry) {
    const v = new Ship(this, VESSEL_TYPES[typeKey], name);
    v.registry = registry;
    v.body = this.startBody;
    v.ftl = new FTL(this, v);
    v.interior = makeInterior(v);
    v.target = new VesselTarget(v);
    v.visual = v.big ? new BigShipVisual(this.engine, v) : new ShipVisual(this.engine, v);
    // lit by big ships' fixtures (a shuttle's cabin stays sealed from them)
    this.lights.adopt(v.visual.model.root, v.big ? null : (o) => o.name === 'interior');
    this.vessels.push(v);
    return v;
  }

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
    this.spawnFleet(b);
    // player stands off the ship's port bow, looking back at it
    const sp = this.ship.landedPosF.clone();
    const sq = this.ship.landedQuatF.clone();
    const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(sq);
    const left = new THREE.Vector3(-1, 0, 0).applyQuaternion(sq);
    const pp = sp.clone().addScaledVector(fwd, 9).addScaledVector(left, 19);
    const toShip = sp.clone().sub(pp);
    this.player.placeOnSurface(b, pp.normalize(), toShip);
    this.player.pitch = 0.04;
    this.player.lastSeat = { vessel: this.ship, seat: 0 };
    this.ship.rampTarget = 1; this.ship.ramp = 1;
    this.state = 'loading';
    this.loadTimer = 0;
    this.hud.setLoading(`Descending to ${b.data.name}…`);
    this.respawnInfo = { body: b, dir: this.startDir.clone() };
    this.placed = true;
    if (this.startPending) this.applyStart(this.startPending);
  }

  // ------------------------------------------------------------------ where to begin
  // 'orbit:<bodyId>' (the default: floating beside your ship in orbit),
  // 'carrier' (in Bastion's hangar) or 'surface' (the landing site)

  requestStart(key) {
    this.startChoice = key;
    if (!this.placed) { this.startPending = key; return; }
    this.applyStart(key);
  }

  applyStart(key) {
    this.startPending = null;
    if (key === 'carrier') this.startAboard();
    else if (key && key.startsWith('orbit:')) {
      const b = this.universe.bodies[+key.slice(6)];
      if (b) this.startInOrbit(b);
    }
  }

  // The opening shot: a spot in orbit composed like a film still. The body
  // fills the lower part of the view with its sunlit side, the sun is behind
  // or beside the camera so your ship (floating ahead, ramp down) is lit,
  // a ringed giant is seen from above its rings, a moon's planet hangs in the
  // sky behind, and the orbit is just outside the FTL mass lock. Searched
  // over camera positions and view directions, best score wins.
  composeOrbitView(b) {
    const R = b.R;
    const giant = !b.solid;
    const rings = b.data.rings;
    let r = Math.max(lockRadius(b) * 1.08, R * 1.35);
    if (giant) r = Math.max(r, (rings ? rings.outer : R) * 1.25, R * 2.6);
    if (b.soi && isFinite(b.soi)) r = Math.min(r, b.soi * 0.5);
    const rho = Math.asin(Math.min(0.999, R / r));       // angular radius
    const theta = giant ? rho * 0.85 + 0.05 : rho + 0.1; // body centre below the view centre
    const alpha = Math.PI / 2 - theta;                    // view depression below horizontal
    const S = this.universe.star.pos.clone().sub(b.pos).normalize(); // sun direction
    const ringN = rings ? new THREE.Vector3(0, 1, 0).applyQuaternion(b.qTilt || b.q) : null;
    const parent = b.parent && b.parent.R > R * 2 ? b.parent : null;
    const N = 320, K = 16;
    const p = new THREE.Vector3(), h = new THREE.Vector3(), D = new THREE.Vector3(), e1 = new THREE.Vector3(), e2 = new THREE.Vector3();
    const ray = new THREE.Vector3(), hit = new THREE.Vector3();
    let best = null;
    for (let i = 0; i < N; i++) {
      const z = 1 - (i + 0.5) / N * 2, rr = Math.sqrt(1 - z * z), th = i * 2.399963;
      p.set(Math.cos(th) * rr, z, Math.sin(th) * rr);
      const day = p.dot(S);
      if (day < -0.1) continue; // a night-side camera can only see a dark planet
      e1.set(0, 1, 0).cross(p); if (e1.lengthSq() < 1e-6) e1.set(1, 0, 0).cross(p); e1.normalize();
      e2.copy(p).cross(e1).normalize();
      for (let k = 0; k < K; k++) {
        const psi = (k / K) * Math.PI * 2;
        h.copy(e1).multiplyScalar(Math.cos(psi)).addScaledVector(e2, Math.sin(psi));
        D.copy(h).multiplyScalar(Math.cos(alpha)).addScaledVector(p, -Math.sin(alpha)).normalize();
        const ds = D.dot(S);
        if (ds > -0.15) continue; // the sun must be behind the camera's plane: a lit ship, no glare
        // side light models the ship and shows the terminator: best ~130 deg off the view
        const ang = Math.acos(THREE.MathUtils.clamp(ds, -1, 1));
        let score = 1 - Math.abs(ang - 2.27) / 0.9;
        // how much of the planet in the lower half of the frame is daylit
        let lit = 0, hits = 0;
        for (const [dy, dx] of [[0.12, 0], [0.25, 0], [0.38, 0], [0.25, -0.35], [0.25, 0.35]]) {
          ray.copy(D).addScaledVector(p.clone().addScaledVector(D, -p.dot(D)).normalize(), -dy).addScaledVector(h.clone().cross(p).normalize(), dx).normalize();
          // ray from the camera (at r p) against the sphere of radius R
          const o = p.clone().multiplyScalar(r);
          const bq = o.dot(ray), c = o.lengthSq() - R * R, disc = bq * bq - c;
          if (disc < 0) continue;
          hits++;
          hit.copy(o).addScaledVector(ray, -bq - Math.sqrt(disc)).normalize();
          if (hit.dot(S) > 0.12) lit++;
        }
        score += hits ? (lit / hits) * 1.5 : -1;
        // ringed giants: seen from 12-40 deg above the ring plane, on its sunlit face
        if (ringN) {
          const el = Math.asin(THREE.MathUtils.clamp(p.dot(ringN), -1, 1));
          const ae = Math.abs(el);
          score += ae > 0.2 && ae < 0.7 ? 0.8 : -0.4;
          if (Math.sign(el) === Math.sign(S.dot(ringN))) score += 0.4;
        }
        // a moon's planet hanging in the sky behind the shot: in the frame
        // and clear of the moon's own disk
        if (parent) {
          const toP = parent.pos.clone().sub(b.pos.clone().addScaledVector(p, r)).normalize();
          const off = Math.acos(THREE.MathUtils.clamp(toP.dot(D), -1, 1));
          const fromMoon = Math.acos(THREE.MathUtils.clamp(-toP.dot(p), -1, 1)); // angle from the moon's centre
          const clear = fromMoon > rho + 0.04;
          score += clear ? (off < 0.5 ? 2.2 : (off < 0.75 ? 0.8 : 0)) : -0.5;
        }
        if (!best || score > best.score) best = { score, p: p.clone(), h: h.clone(), D: D.clone(), alpha };
      }
    }
    if (!best) { // (no daylit composition: take any)
      p.copy(S); e1.set(0, 1, 0).cross(p).normalize();
      best = { score: 0, p: p.clone(), h: e1.clone(), D: e1.clone().multiplyScalar(Math.cos(alpha)).addScaledVector(p, -Math.sin(alpha)).normalize(), alpha };
    }
    best.r = r;
    return best;
  }

  // Float beside your ship in orbit of b, its ramp lowered toward you
  startInOrbit(b) {
    const view = this.composeOrbitView(b);
    const p = this.player, s = this.ship;
    const r = view.r;
    const P = view.p.clone().multiplyScalar(r);
    const vel = view.h.clone().multiplyScalar(Math.sqrt(b.GM / r));
    // the camera: looking down the composed view
    const camQ = lookQuat(view.p, view.h, -view.alpha, new THREE.Quaternion());
    const camUp = new THREE.Vector3(0, 1, 0).applyQuaternion(camQ);
    // the ship 30 m ahead and a little low, aft end (ramp) turned toward you
    if (s.parent) s.leaveParent();
    s.body = b; s.dead = false; s.hull = 1; s.landed = false; s.rails = false;
    s.pos.copy(P).addScaledVector(view.D, 30).addScaledVector(camUp, -3.5);
    s.vel.copy(vel);
    // turned 35 deg one way or the other: whichever shows you its sunlit flank
    const S = this.universe.star.pos.clone().sub(b.pos).normalize();
    let pose = null;
    for (const sgn of [1, -1]) {
      const back = view.D.clone().negate().applyAxisAngle(camUp, 0.62 * sgn);
      const upS = camUp.clone().addScaledVector(back, -camUp.dot(back)).normalize();
      const right = upS.clone().cross(back).normalize();
      const flank = right.dot(view.D) < 0 ? right : right.clone().negate(); // the side facing you
      const lit = flank.dot(S) + 0.5 * back.dot(S);
      if (!pose || lit > pose.lit) pose = { lit, m: new THREE.Matrix4().makeBasis(right, upS, back) };
    }
    s.quat.setFromRotationMatrix(pose.m);
    s.angVel.set(0, 0, 0);
    s.assist = 2;
    s.gearTarget = 0; s.gear = 0;
    s.rampTarget = 1; s.ramp = 1;
    s.targetVel.copy(s.vel); s.targetFrame = 'inertial';
    s.pilotPresent = false;
    // you: on a spacewalk, matched to the ship
    if (p.vessel) p.vessel.pilotPresent = false;
    p.vessel = null;
    p.mode = 'eva';
    p.body = b;
    p.ePos.copy(P);
    p.eVel.copy(vel);
    p.evaQuat.copy(camQ);
    p.jetFuel = 1;
    p.lastSeat = { vessel: s, seat: 0 };
    this.target = s.target;
    this.route = null;
    this.setWarp(0);
    // let the view stream in, then roll the title
    this.state = 'loading';
    this.loadMode = 'orbit';
    this.loadTimer = 0;
    this.settleTime = 0;
    this.hud.setLoading(`Arriving in orbit of ${b.data.name}…`);
    this.engine.adaptReset = true;
    this.openingBody = b;
    this.openingAlt = r - b.R;
  }

  rollTitle() {
    const b = this.openingBody;
    if (!b) return;
    this.openingBody = null;
    const alt = this.openingAlt;
    const pad = !!this.input.pad;
    this.hud.showTitle([
      `${this.system.star.name} system`,
      `In orbit of ${b.data.name} · ${b.data.label} · ${alt >= 1e6 ? (alt / 1e6).toFixed(1) + ' thousand km' : Math.round(alt / 1000).toLocaleString() + ' km'} up`,
      pad ? 'Your ship waits with its ramp down: drift over (left stick, A / B) or press Y for the pilot seat'
        : 'Your ship waits with its ramp down: drift over (W A S D, Space / C) or press P for the pilot seat',
    ]);
  }

  // The two big ships, coasting in circular orbits above the FTL mass lock:
  // the tender ahead of the landing site, the carrier behind it
  spawnFleet(b) {
    if (!this.tender) {
      this.tender = this.addVessel('tender', 'Halyard', 'TND-4471');
      this.carrier = this.addVessel('carrier', 'Bastion', 'CV-01');
    }
    const lockAlt = lockRadius(b) - b.R;
    this.placeInOrbit(this.tender, b, lockAlt + 90000, 0.35);
    this.placeInOrbit(this.carrier, b, lockAlt + 280000, -0.45);
    // compile the big ships' shaders now, not the first time one comes into view
    const r = this.engine.renderer;
    if (r.compileAsync) {
      r.compileAsync(this.engine.scene, this.engine.camera).catch(() => {});
      r.compileAsync(this.engine.transparentScene, this.engine.camera).catch(() => {});
    }
  }

  // circular equatorial orbit, phase measured from the landing site; nose
  // prograde, dorsal side out; no spin: big ships just keep their course
  placeInOrbit(v, b, alt, phase) {
    for (const c of v.children.slice()) c.leaveParent();
    v.dead = false; v.hull = 1; v.landed = false; v.rails = false;
    if (v.parent) v.leaveParent();
    v.body = b;
    const axis = _v1.set(0, 1, 0).applyQuaternion(b.qTilt).normalize();
    const site = (this.startDir || new THREE.Vector3(1, 0, 0)).clone().applyQuaternion(b.q);
    const e1 = site.addScaledVector(axis, -site.dot(axis)).normalize();
    const e2 = axis.clone().cross(e1).normalize();
    const r = b.R + alt;
    const dir = e1.clone().multiplyScalar(Math.cos(phase)).addScaledVector(e2, Math.sin(phase));
    v.pos.copy(dir).multiplyScalar(r);
    const pro = axis.clone().cross(dir).normalize();
    v.vel.copy(pro).multiplyScalar(Math.sqrt(b.GM / r));
    const m = new THREE.Matrix4().makeBasis(pro.clone().cross(dir).normalize(), dir, pro.clone().negate());
    v.quat.setFromRotationMatrix(m);
    v.angVel.set(0, 0, 0);
    v.targetFrame = 'none';
    v.enterRails();
  }

  // the carrier exists once the start sequence has placed the fleet
  requestStartAboard() { this.requestStart('carrier'); }

  // Alternative start: the shuttle parked in the carrier's hangar, the player
  // on the deck beside it
  startAboard() {
    this.startAboardPending = false;
    const c = this.carrier;
    if (!c || c.dead) return;
    const s = this.ship;
    const deckY = 2.35;
    s.dead = false; s.hull = 1;
    s.dockAt(c, c.type.zones[0], new THREE.Vector3(-70, deckY, -60), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2));
    s.rampTarget = 1; s.ramp = 1;
    s.assist = 2;
    this.player.placeAboard(c, new THREE.Vector3(-52, 0, -44), new THREE.Vector3(-0.6, 0, -0.8));
    this.player.lastSeat = { vessel: s, seat: 0 };
    this.target = this.tender ? this.tender.target : null;
    this.state = 'playing';
    this.hud.setLoading(null);
    this.engine.adaptReset = true;
    this.message(`Aboard ${c.name} · ${c.type.className} · hangar deck`, 'nav');
    this.message(`Your shuttle ${s.name} is on pad 2 · its ramp is down`);
  }

  // Lands the ship (settled pose) at a body-fixed direction
  landShipAt(b, dirF, headingF) {
    const s = this.ship;
    if (s.parent) s.leaveParent();
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
      this.stepVessel(s, PHYS_DT, true);
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
      if (i > 2) for (const v of this.vessels) if (!v.dead && !v.landed && !v.parent && !v.rails) v.enterRails();
    }
  }

  warpBlocker() {
    const p = this.player;
    for (const v of this.vessels) if (!v.dead && v.ftl && (v.ftl.state === 'cruise' || v.ftl.state === 'spool')) return 'FTL active';
    if (p.mode === 'eva') return 'EVA in progress';
    if (p.mode === 'surface' && !p.grounded) return 'not on the ground';
    const piloted = this.piloted;
    for (const v of this.vessels) {
      if (v.dead || v.landed) continue;
      const mine = v === piloted;
      if (v.parent) {
        if (!v.attached) return mine ? `manoeuvring inside ${v.parent.name}` : `${v.name} is manoeuvring inside ${v.parent.name}`;
        continue;
      }
      if (mine && v.wantsForce() && v.assist !== 2) return 'thrusting';
      const alt = v.altitude;
      if (v.body.atm && alt < v.body.atmHeight) return mine ? 'inside an atmosphere' : `${v.name} is in an atmosphere`;
      if (alt < v.safeAltitude()) return mine ? 'too close to the surface' : `${v.name} is flying near the surface`;
    }
    return null;
  }

  toggleRamp(v = this.player.aboard ? this.player.vessel : this.ship) {
    if (!v || !v.type.ramp) return;
    v.rampTarget = v.rampTarget > 0.5 ? 0 : 1;
    this.message(v.rampTarget ? 'Ramp lowering' : 'Ramp closing');
    this.audio.clunk();
  }

  cycleAssist() {
    const s = this.piloted;
    if (!s) return;
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
    if (p.mode !== 'surface') return;
    const up = p.fPos.clone().normalize();
    const fwd = p.heading.clone();
    const dest = up.clone().multiplyScalar(b.R).addScaledVector(fwd, 45).normalize();
    if (this.ship.ftl.state === 'cruise') this.ship.ftl.state = 'idle';
    this.landShipAt(b, dest, fwd.clone().negate());
    this.ship.rampTarget = 1; this.ship.ramp = 1;
    this.message('Ship summoned', 'nav');
  }

  // bodies and ships, nearest first
  targetList() {
    const wp = this.camPos;
    const mine = this.player.aboard ? this.player.vessel.root : null;
    const list = this.universe.bodies.slice();
    for (const v of this.vessels) if (!v.dead && v.root !== mine && v !== this.player.vessel) list.push(v.target);
    return list.sort((a, b) => a.pos.distanceTo(wp) - b.pos.distanceTo(wp));
  }

  // Target whatever is under the cursor (under the reticle when the mouse is
  // captured): the body or ship whose on-screen disc holds that point, the
  // most central hit winning; small things get a generous pick radius
  targetUnderCursor() {
    const hud = this.hud, inp = this.input;
    const rect = this.canvas.getBoundingClientRect();
    const px = inp.locked || !inp.cursorIn ? rect.left + rect.width / 2 : inp.cx;
    const py = inp.locked || !inp.cursorIn ? rect.top + rect.height / 2 : inp.cy;
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(this.engine.camera.fov) / 2);
    const pxPerUnit = hud.h / (2 * tanHalf); // screen px per (size / depth)
    const pt = {};
    let best = null, bestScore = Infinity;
    for (const c of this.targetList()) {
      hud.project(c.pos, pt);
      if (pt.behind) continue;
      const size = c.isVessel ? c.v.type.radius * 0.6 : c.R;
      const r = Math.max(18, size / pt.depth * pxPerUnit);
      const d = Math.hypot(pt.x - px, pt.y - py);
      if (d > r) continue;
      const score = d / r + (c.isVessel ? 0 : 0.05); // a ship in front of a planet wins
      if (score < bestScore) { bestScore = score; best = c; }
    }
    if (!best) { this.message('Nothing under the cursor to target', 'caution'); return; }
    this.target = best;
    this.message(`Target: ${best.data.name}`, 'target');
    if (!best.isVessel) this.requestSurvey(best, 80);
  }

  cycleTarget(dir = 1) {
    const list = this.targetList();
    const cur = this.target ? list.indexOf(this.target) : -1;
    let i = (cur + dir + list.length) % list.length;
    if (list[i] === this.player.currentBody() && list.length > 1) i = (i + dir + list.length) % list.length;
    this.target = list[i];
    this.message(`Target: ${this.target.data.name}`, 'target');
    if (!this.target.isVessel) this.requestSurvey(this.target, 80);
  }

  // ------------------------------------------------------------------ frame

  frame(now) {
    let dtReal = Math.min(0.1, Math.max(0.0005, (now - this.lastFrame) / 1000));
    this.lastFrame = now;
    this.fps = this.fps * 0.95 + (1 / dtReal) * 0.05;
    const t0 = performance.now();
    const input = this.input;
    const pm = this.player.mode;
    input.pollPad(pm === 'seat' ? 'flight' : (pm === 'eva' ? 'eva' : 'foot'), dtReal);
    this.handleGlobalKeys(input);
    if (this.state === 'loading') this.updateLoading(dtReal);
    if (this.state === 'playing' && !this.paused) this.simulate(dtReal);
    else if (this.state !== 'playing') this.universe.update(this.t);
    this.updateCamera(dtReal);
    this.engine.camera.position.set(0, 0, 0);
    this.engine.camera.quaternion.copy(this.camQuat);
    this.computeLighting();
    this.lights.update(this.camPos, this.camQuat, this.lighting, this.vessels);
    this.updateMeter();
    for (const v of this.vessels) v.visual.update(dtReal, this.camPos, this.lighting);
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
    if (this.paused) { if (input.hit('KeyH')) this.hud.toggleHelp(); return; }
    if (input.hit('KeyM')) this.map.toggle();
    if (this.state !== 'playing') return;
    if (input.hit('Comma')) this.setWarp(this.warpIndex - 1);
    if (input.hit('Period')) this.setWarp(this.warpIndex + 1);
    if (input.hit('Tab')) {
      const pl = this.player;
      if (pl.mode === 'ship' && pl.vessel.big) this.cycleRoute(input.down('ShiftLeft') ? -1 : 1);
      else this.cycleTarget(input.down('ShiftLeft') ? -1 : 1);
    }
    if (input.hit('KeyT')) this.targetUnderCursor();
    if (input.hit('KeyK')) { this.showSites = !this.showSites; this.message(this.showSites ? 'Settlement survey overlay on' : 'Settlement survey overlay off'); }
    if (input.hit('KeyH')) this.hud.toggleHelp();
    if (input.hit('KeyP')) this.player.recallSeat();
    const v = this.piloted;
    if (v) {
      if (input.hit('KeyZ')) this.cycleAssist();
      if (input.hit('KeyG') && v.type.legs) { v.gearTarget = v.gearTarget > 0.5 ? 0 : 1; this.message(v.gearTarget ? 'Gear down' : 'Gear up'); this.audio.clunk(); }
      if (input.hit('KeyR')) this.toggleRamp(v);
      if (input.hit('KeyL') && v === this.ship) { this.ship.visual.floodOn = !this.ship.visual.floodOn; }
      if (input.hit('KeyJ')) v.ftl.toggle();
      if (input.hit('KeyV')) {
        this.camMode = { first: 'chase', chase: 'landing', landing: 'first' }[this.camMode] || 'first';
        this.message({ first: 'Cockpit view', chase: 'Chase view', landing: 'Landing view: level, above and behind' }[this.camMode], 'nav');
      }
    }
  }

  updateLoading(dt) {
    this.loadTimer += dt;
    this.universe.update(this.t);
    if (!this.respawnInfo) return;
    const pending = this.world.pendingNear();
    const orbit = this.loadMode === 'orbit';
    const terr = this.world.terrainOf(this.player.currentBody().id);
    const deepEnough = orbit || !terr || terr.deepest >= terr.maxLevel - 1;
    const name = this.player.currentBody().data.name;
    this.hud.setLoading(`${orbit ? `Arriving in orbit of ${name}` : `Descending to ${name}`}… ${pending ? pending + ' terrain tiles' : ''}`);
    if (pending === 0 && deepEnough) this.settleTime += dt; else this.settleTime = 0;
    if ((this.settleTime > 0.4 && this.loadTimer > 1) || this.loadTimer > (orbit ? 10 : 25)) {
      this.state = 'playing';
      this.hud.setLoading(null);
      this.engine.adaptReset = true;
      this.loadMode = null;
      if (orbit) { this.rollTitle(); return; }
      this.message(`${name}: ${this.player.currentBody().data.label}`, 'nav');
      if (this.site) this.message(`Landing site: ${this.site.biome}, ${this.site.reasons.slice(0, 2).join(', ')}`);
    }
  }

  simulate(dtReal) {
    const warp = this.warp;
    let dt = dtReal * warp;
    const p = this.player;
    // player input -> the piloted vessel's controls (before the warp guard reads them)
    const mouse = this.input.mouse();
    for (const v of this.vessels) { const c = v.ctrl; c.fwd = c.strafe = c.lift = c.pitch = c.yaw = c.roll = 0; c.boost = c.brake = false; }
    const pv = this.piloted;
    if (pv) this.pilotControls(pv, dtReal, mouse);
    // warp guard: thrust input or atmosphere drops rails warp
    if (warp > 4) {
      const why = this.warpBlocker();
      const thrusting = pv && (pv.ctrl.fwd || pv.ctrl.lift || pv.ctrl.strafe);
      if (why || thrusting) { this.setWarp(thrusting ? 0 : 2); dt = dtReal * this.warp; }
    }
    this.advanceVessels(dt);
    // FTL drives: spool, cruise (moving the whole hierarchy), cooldown
    for (const v of this.vessels) {
      if (v.dead || !v.ftl) continue;
      const cruising = v.ftl.state === 'cruise';
      v.ftl.update(dtReal);
      if (cruising || v.ftl.state === 'cruise') {
        this.rotateOnly(v, dtReal);
        v.coastEnv();
        this.syncTree(v);
      }
    }
    this.checkZones();
    this.chooseReference(pv);
    // player. A spacewalker moves at orbital speed in the inertial frame, and
    // someone on foot may be falling beside a ship, so both integrate exactly
    // the step the world took (sub-stepped, one-shot keys delivered once);
    // aboard, frames are local and slow time is harmless.
    const quiet = this._quietInput || (this._quietInput = {
      down: (c) => this.input.down(c), axis: (a, b) => this.input.axis(a, b), hit: () => false,
      get buttons() { return 0; },
    });
    if (p.mode === 'eva' || (p.mode === 'surface' && this.warp <= 4)) {
      const pdt = dtReal * this.warp;
      const n = Math.max(1, Math.ceil(pdt / 0.02));
      for (let i = 0; i < n && (p.mode === 'eva' || p.mode === 'surface'); i++) p.update(pdt / n, i === 0 ? this.input : quiet, i === 0 ? mouse : { dx: 0, dy: 0 });
    } else if (p.mode !== 'seat') {
      // (stepping out converts against the vessel's end-of-frame state, so the
      // player is already level with the world's clock when they leave)
      p.update(Math.min(dtReal * Math.min(this.warp, 4), 0.05), this.input, mouse);
    } else p.update(dtReal, this.input, mouse);
    if (p.aboard && p.vessel.dead && !this.deathShown) this.onDeath(p.vessel.deathCause);
  }

  pilotControls(s, dt, mouse) {
    const c = s.ctrl, input = this.input;
    c.fwd = input.axis('KeyS', 'KeyW');
    c.strafe = input.axis('KeyA', 'KeyD');
    c.lift = input.axis('KeyC', 'Space') || (input.down('ControlLeft') ? -1 : 0);
    c.roll = input.axis('KeyE', 'KeyQ');
    c.boost = input.down('ShiftLeft');
    c.brake = input.down('KeyX');
    // virtual stick: mouse motion deflects it, it springs back to centre
    const freeLook = input.buttons & 2 || input.down('AltLeft');
    if (!freeLook) {
      s.stick.x += mouse.dx * 7; s.stick.y += mouse.dy * 7;
    }
    s.stick.multiplyScalar(Math.exp(-dt / 0.22));
    // a gamepad's right stick is the stick itself
    const pl = input.padLook;
    if (pl.x || pl.y) s.stick.set(pl.x, pl.y);
    if (s.stick.length() > 1) s.stick.normalize();
    const dz = (v) => Math.abs(v) < 0.015 ? 0 : v;
    c.pitch = -dz(s.stick.y);
    c.yaw = -dz(s.stick.x);
    if (s.ftl.state === 'cruise') { c.pitch *= 0.35; c.yaw *= 0.35; c.roll *= 0.5; }
  }

  // rotation integration while coasting on rails or carried by the FTL bubble
  rotateOnly(s, dt) {
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

  stepVessel(s, h, settling = false) {
    const F = this._cf || (this._cf = new THREE.Vector3());
    const T = this._ct || (this._ct = new THREE.Vector3());
    s.computeControl(h, F, T);
    if (settling) F.set(0, 0, 0); // unpiloted: drop onto the legs
    s.step(h, F, T);
    s.environment(h);
    s.tryLand(h);
    if (settling) s.legComp.fill(0);
  }

  // a vessel inside a host's space: docked (ride along) or flying in its frame
  stepChild(v, h) {
    if (v.attached && !(v === this.piloted && v.wantsMove())) { v.holdAttached(); return; }
    const F = this._cf || (this._cf = new THREE.Vector3());
    const T = this._ct || (this._ct = new THREE.Vector3());
    v.computeControlLocal(h, F, T);
    v.stepLocal(h, F, T);
    v.tryLandLocal(h);
    if (!v.attached && !v.insideZone(v.zone, 3)) {
      const host = v.parent;
      v.leaveParent();
      if (v === this.focus) this.message(`Clear of ${host.name}`, 'nav');
    }
  }

  // re-derive a moved vessel's passengers
  syncTree(v) {
    for (const c of v.children) {
      if (c.attached) c.holdAttached(); else c.syncFromParent();
      this.syncTree(c);
    }
  }

  // how each free vessel moves this frame
  rootMode(v, highWarp) {
    if (v.landed) return 'landed';
    if (v.ftl && v.ftl.state === 'cruise') return 'ftl';
    const inSpace = v.altitude > (v.body.atm ? v.body.atmHeight * 1.02 : 0) && v.altitude > v.safeAltitude();
    if (!inSpace) return 'physics';
    if (highWarp) return 'rails';
    if (v === this.piloted) return (!v.wantsForce() && v.assist !== 2) ? 'rails' : 'physics';
    // nobody at the controls: it just keeps its course
    return 'rails';
  }

  railSteps(v, dt) {
    const r0 = v.pos.length();
    const vmag = Math.max(1, v.vel.length());
    return Math.min(400, Math.max(1, Math.ceil(dt * vmag / Math.max(2000, (r0 - v.body.R) * 0.05))));
  }

  advanceVessels(dt) {
    const highWarp = this.warp > 4;
    const roots = [], kids = [];
    for (const v of this.vessels) if (!v.dead) (v.parent ? kids : roots).push(v);
    kids.sort((a, b) => a.depth - b.depth);
    let n = 1, physics = false;
    for (const v of roots) {
      v._mode = this.rootMode(v, highWarp);
      if (v._mode === 'rails') { if (!v.rails) v.enterRails(); n = Math.max(n, this.railSteps(v, dt)); }
      else if (v._mode !== 'ftl') v.rails = false;
      if (v._mode === 'physics') physics = true;
    }
    for (const v of kids) if (!v.attached || (v === this.piloted && v.wantsMove())) physics = true;
    // a piloted ship can leave its legs or its rails at any moment: its
    // contacts need fine steps from the first one (they are stiff springs)
    if (physics || (this.piloted && !highWarp)) n = Math.max(n, Math.min(64, Math.ceil(dt / PHYS_DT)));
    n = Math.min(400, n);
    const h = dt / n;
    for (let i = 0; i < n; i++) {
      this.t += h;
      this.universe.update(this.t);
      let abort = false;
      for (const v of roots) {
        if (v.dead) continue;
        if (v._mode === 'landed') { if (v === this.piloted) this.stepVessel(v, h); else v.syncLanded(); }
        else if (v._mode === 'rails') abort = this.railStep(v, h) || abort;
        else if (v._mode === 'physics') {
          this.stepVessel(v, h);
          if (v.checkSOI() && v === this.focus) this.message(`Entered ${v.body.data.name}'s sphere of influence`, 'nav');
        }
      }
      for (const v of kids) if (!v.dead && v.parent) this.stepChild(v, h);
      if (abort && highWarp) break;
    }
    for (const v of roots) if (v._mode === 'rails' && !v.dead) { v.thrustLocal.set(0, 0, 0); v.coastEnv(); }
  }

  // one analytic step; returns true when the vessel has to leave its rails
  railStep(v, h) {
    v.railsState(this.t, v.pos, v.vel);
    this.rotateOnly(v, h);
    if (v.checkSOI() && v === this.focus) this.message(`Entered ${v.body.data.name}'s sphere of influence`, 'nav');
    const alt = v.altitude;
    if ((v.body.atm && alt < v.body.atmHeight) || alt < v.safeAltitude()) {
      v.rails = false;
      v._mode = 'physics';
      if (this.warp > 1) {
        this.setWarp(0);
        this.message(v.body.atm && alt < v.body.atmHeight ? `${v === this.focus ? 'Atmospheric entry' : v.name + ' entering the atmosphere'}: warp stopped` : `${v === this.focus ? 'Surface proximity' : v.name + ' near the surface'}: warp stopped`, 'caution');
      }
      return true;
    }
    if (v === this.piloted && v.wantsForce() && this.warp <= 4) { v.rails = false; v._mode = 'physics'; return true; }
    return false;
  }

  // free craft that enter a big ship's zone join its coordinate space
  checkZones() {
    for (const v of this.vessels) {
      if (v.dead || v.big || v.parent || v.landed || (v.ftl && v.ftl.state === 'cruise')) continue;
      for (const h of this.vessels) {
        if (!h.big || h.dead || h === v || h.body !== v.body || !h.type.zones) continue;
        if (h.pos.distanceToSquared(v.pos) > Math.pow(h.type.radius + 60, 2)) continue;
        const local = h.bodyToLocal(v.pos, _v1);
        const z = h.type.zones.find((zz) => insideBox(zz, local));
        if (z) {
          v.enterParent(h, z);
          if (v === this.focus) this.message(`${z.kind === 'hangar' ? 'Entering' : 'Over'} ${h.name} · ${z.name} · artificial gravity`, 'nav');
          break;
        }
      }
    }
  }

  // FULL assist near a big ship holds velocity relative to it
  chooseReference(pv) {
    if (!pv || pv.big || pv.parent) return;
    let best = null, bd = 30000;
    for (const h of this.vessels) {
      if (!h.big || h.dead || h.body !== pv.body) continue;
      const d = h.pos.distanceTo(pv.pos) - h.type.radius;
      if (d < bd) { bd = d; best = h; }
    }
    if (best !== pv.refVessel) {
      if (best) this.message(`Flight assist referenced to ${best.name}`, 'nav');
      pv.refVessel = best;
    }
  }

  // ------------------------------------------------------------------ camera

  updateCamera(dt) {
    if (this.debugFree) { this.freecam.update(dt, dt, this.input); return; }
    const p = this.player;
    if (this.state === 'loading' && !this.respawnInfo) return;
    const pv = this.piloted;
    if (this.camMode === 'landing' && pv) {
      // locked landing view: level with the local horizon (the host's deck
      // inside a big ship), above and behind along the ship's heading, aimed
      // a little ahead of the ground under it; rigid, no lag
      const s = pv;
      const R = s.type.radius;
      const wp = s.getWorldPos(_v1);
      const up = s.parent ? _v2.set(0, 1, 0).applyQuaternion(s.parent.quat) : _v2.copy(s.pos).normalize();
      const fh = _v3.set(0, 0, -1).applyQuaternion(s.quat);
      fh.addScaledVector(up, -fh.dot(up));
      if (fh.lengthSq() < 1e-6) { fh.set(0, 1, 0).applyQuaternion(s.quat); fh.addScaledVector(up, -fh.dot(up)); } // nose vertical: use the dorsal side
      if (fh.lengthSq() < 1e-6) fh.set(1, 0, 0).addScaledVector(up, -up.x);
      fh.normalize();
      this.camPos.copy(wp).addScaledVector(fh, -1.5 * R).addScaledVector(up, 0.95 * R);
      const aim = wp.clone().addScaledVector(fh, 0.35 * R).addScaledVector(up, -0.3 * R);
      const m = new THREE.Matrix4().lookAt(this.camPos, aim, up);
      this.camQuat.setFromRotationMatrix(m);
      this.chaseQuat.copy(s.quat);
      return;
    }
    if (this.camMode === 'chase' && pv) {
      const s = pv;
      const R = s.type.radius;
      const wp = s.getWorldPos(_v1);
      this.chaseQuat.slerp(s.quat, 1 - Math.exp(-dt * 5));
      const off = _v2.set(0, R * 0.34, R * 1.9).applyQuaternion(this.chaseQuat);
      this.camPos.copy(wp).add(off);
      const m = new THREE.Matrix4().lookAt(this.camPos, _v3.copy(wp).addScaledVector(_v2.set(0, 2, 0).applyQuaternion(this.chaseQuat), R / 16), _v2.set(0, 1, 0).applyQuaternion(this.chaseQuat));
      this.camQuat.setFromRotationMatrix(m);
      return;
    }
    const s = p.aboard ? p.vessel : this.ship;
    this.chaseQuat.copy(s.quat);
    p.computeCamera(this.camPos, this.camQuat);
    // shake: thrust, re-entry, landing impact
    const shake = Math.min(1, s.heatGlow * 0.5 + (p.mode === 'seat' ? (s.thrustLocal.length() / s.limits.main) * (s.big ? 0.05 : 0.15) + s.env.dynPressure / 4e5 : 0)) + (s.ftl.state === 'cruise' ? 0.05 : 0);
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

  // the pause menu freezes the world and silences it
  setPaused(on) {
    this.paused = on;
    const c = this.audio && this.audio.ctx;
    if (c) { if (on) c.suspend(); else c.resume(); }
  }

  // ------------------------------------------------------------------ onboard routes

  // Tab aboard a big ship: walk to a seat, a pad, the hangar or your ship
  cycleRoute(dir) {
    const v = this.player.vessel;
    const list = v.interior.destinations();
    if (!list.length) return;
    const cur = this.route && this.route.v === v ? list.findIndex((d) => d.label === this.route.label) : -1;
    const i = cur + dir;
    if (i < 0 || i >= list.length) {
      if (cur >= 0) { this.route = null; this.message('Route cleared'); return; }
      const j = dir > 0 ? 0 : list.length - 1;
      this.route = { v, label: list[j].label };
    } else this.route = { v, label: list[i].label };
    this.message(`Route: ${this.route.label} · follow the marker`, 'nav');
  }

  // the next leg of the active route, for the HUD (null when none)
  routeStep() {
    const r = this.route, p = this.player;
    if (!r) return null;
    if (p.mode !== 'ship' || p.vessel !== r.v || r.v.dead) {
      if (p.vessel !== r.v || r.v.dead) this.route = null;
      return null;
    }
    const dest = r.v.interior.destinations().find((d) => d.label === r.label);
    if (!dest) { this.route = null; return null; }
    const step = r.v.interior.nextStep(p.sPos, dest.at);
    if (!step) return null;
    if (step.kind === 'goal' && Math.hypot(p.sPos.x - dest.at.x, p.sPos.z - dest.at.z) < 2.2) {
      this.message(`Arrived: ${r.label}`, 'ok');
      this.route = null;
      return null;
    }
    step.dest = dest;
    return step;
  }

  // Exposure anchor (incident-light metering): the luminance of an 18% grey
  // card lit by whatever lights the camera's surroundings: sun and sky
  // outdoors, the fixtures inside a big ship's rooms. The frame's own
  // brightness only adjusts around this (see the engine's ADAPT pass), so
  // looking at the sun or a bright sky no longer plunges the ground into
  // darkness, and the exposure stays steady as you look around.
  updateMeter() {
    const L = this.lighting, rig = this.lights;
    const lum = (c) => 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
    let E = rig.camE;
    if (!rig.inside) E += 0.5 * L.sunIntensity * lum(L.sunColor) + lum(L.skyColor);
    this.engine.meterRef = Math.max(1e-7, 0.18 * E / Math.PI);
    // from a pilot seat the world outside sets the exposure, not the cockpit
    this.engine.meterNearCut = this.player.mode === 'seat' && this.camMode === 'first' ? 3.5 : 0;
  }

  updateSkyStars(dt) {
    const sm = this.sky.starMat.uniforms;
    const e = this.engine;
    sm.uPixelRatio.value = e.pixelRatio;
    sm.tAdapt.value = e.rtAdapt[e.adaptIdx].texture; // last frame's eye adaptation
    sm.uMinExp.value = e.minExposure; sm.uMaxExp.value = e.maxExposure;
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
    // lift rides and seat recalls fade through black
    e.exposureBias = 1 - 0.98 * Math.min(1, this.player.fade * 1.4);
    e.radialBlur = this.focus.ftl.effect;
  }

  // ------------------------------------------------------------------ events

  onShipLanded(s) {
    if (this.state === 'playing' && s === this.focus) this.message('Touchdown', 'ok');
  }
  onDocked(s) {
    if (this.state !== 'playing') return;
    if (s === this.focus) this.message(`Docked · ${s.parent.name} · ${s.zone.name}`, 'ok');
    this.audio.clunk();
  }
  onUndock(s) {
    if (this.state === 'playing' && s === this.focus) this.message(`Released from ${s.parent.name}`, 'nav');
  }
  onSoiChange(s, from, to) { if (this.state === 'playing' && s === this.focus) this.message(`Now orbiting ${to.data.name}`, 'nav'); }
  onModeChange(mode) {
    if (mode === 'seat') {
      const v = this.player.vessel;
      if (v.big) this.message(`${v.name} command seat: ${v.type.className} · W/S thrust · Z flight assist · J FTL · P back to your last seat`, 'nav');
      else this.message('Pilot seat: W/S thrust · Space/C lift · Z flight assist · G gear · J FTL', 'nav');
    }
    if (mode === 'eva') this.message('EVA: WASD/Space/C jetpack · X stabilise · Q/E roll · P back to your seat', 'nav');
  }
  onShipDamage(s, dmg, why) {
    if (s !== this.focus) return;
    if (dmg > 0.02) this.message(`Hull damage ${(dmg * 100).toFixed(0)}%`, 'warn');
    this.engine.flash.set(0.3, 0.05, 0.02);
  }
  onShipDestroyed(s, cause) {
    const p = this.player;
    if (p.aboard && (p.vessel === s || p.vessel.dead)) this.onDeath(cause);
    else this.message(`${s.name} destroyed: ${cause}`, 'warn');
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
    for (const v of this.vessels) { v.ftl.state = 'idle'; v.ftl.speed = 0; }
    this.landShipAt(b, ri.dir, null);
    // lost big ships are replaced on their old orbits
    if (this.tender && this.tender.dead) this.placeInOrbit(this.tender, b, lockRadius(b) - b.R + 90000, 0.35);
    if (this.carrier && this.carrier.dead) this.placeInOrbit(this.carrier, b, lockRadius(b) - b.R + 280000, -0.45);
    this.ship.rampTarget = 1; this.ship.ramp = 1;
    const p = this.player;
    p.vessel = this.ship;
    p.mode = 'ship';
    p.sPos.set(0, 0, 2);
    p.sVel.set(0, 0, 0);
    p.heading.set(0, 0, -1);
    p.pitch = 0;
    p.body = b;
    p.sitDown(0, this.ship);
    this.state = 'loading';
    this.loadTimer = 0;
    this.settleTime = 0;
    // started in orbit: begin again there
    if (this.startChoice && this.startChoice.startsWith('orbit:')) this.applyStart(this.startChoice);
  }

  dispose() {
    this.pool.dispose();
    this.audio.dispose && this.audio.dispose();
  }
}

export { U };
