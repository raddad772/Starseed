// Game orchestration: universe time and warp, vessel/player simulation,
// camera, lighting, start sequence, settlement surveys, events.
//
// Vessels form a hierarchy of coordinate spaces: free vessels move in their
// body's inertial frame (physics or analytic rails); vessels inside a big
// ship's zone fly in that ship's frame or sit docked in it, and everything is
// stepped on one clock, parents before children.

import { WorldSims } from './sim/worldSims.js';
import * as THREE from 'three';
import { generateSystem } from './gen/system.js';
import { S_LEN, S_H, S_WDEPTH } from './gen/terrain.js';
import { Universe } from './sim/universe.js';
import { Engine } from './render/engine.js';
import { WorkerPool } from './render/workerPool.js';
import { WorldRenderer } from './render/world.js';
import { Sky } from './render/sky.js';
import { makeDetailTexture } from './render/terrainMaterial.js';
import { makeCloudNoise } from './render/noise3d.js';
import { FreeCam } from './sim/freecam.js';
import { Ship, ASSIST_NAMES, VesselTarget } from './sim/ship.js';
import { VESSEL_TYPES, insideBox, restHeight } from './sim/vesselTypes.js';
import { makeInterior } from './sim/interiors.js';
import { Player, lookQuat } from './sim/player.js';
import { FTL, lockRadius } from './sim/ftl.js';
import { NavComputer } from './sim/navComputer.js';
import { ShipVisual } from './render/shipVisual.js';
import { BigShipVisual } from './render/bigShipVisual.js';
import { GlbCraftVisual } from './render/glbShip.js';
import { LightRig } from './render/lightRig.js';
import { Hud } from './ui/hud.js';
import { QuickMenu } from './ui/quickMenu.js';
import { SuitScreen } from './ui/screens/suit.js';
import { FleetApp } from './ui/apps/fleet.js';
import { LiftApp } from './ui/apps/lift.js';
import { InventoryApp } from './ui/apps/inventory.js';
import { PaintApp } from './ui/apps/paint.js';
import { Items, ITEM_TYPES, STARTER_KIT } from './sim/items.js';
import { ItemVisuals } from './render/itemVisuals.js';
import { MapView } from './ui/map.js';
import { AudioEngine } from './audio.js';
import * as U from './core/units.js';

export const WARP_LEVELS = [1, 2, 4, 10, 50, 100, 1000, 10000, 100000];
const PHYS_DT = 1 / 120;
const _v1 = new THREE.Vector3(), _v2 = new THREE.Vector3(), _v3 = new THREE.Vector3();
const _q1 = new THREE.Quaternion();
const _qd = new THREE.Vector3();
// a direction (x, y, z) turned by q (a shared vector: use at once)
const _q1Dir = (q, x, y, z) => _qd.set(x, y, z).applyQuaternion(q);

export class Game {
  constructor(canvas, input, seed, opts = {}) {
    this.canvas = canvas;
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
    // simulated worlds (WORLDSIM.md step 7; opt-in for now: ?worldsim=1)
    if (opts.worldsim) { this.worldSims = new WorldSims(this, { N: opts.simN || 192, hiN: opts.simHiN, workers: opts.simWorkers }); }
    this.lights = new LightRig(this.engine);
    this.t = 0;
    this.warpIndex = 0;
    this.freecam = new FreeCam(this);
    this.vessels = [];
    this.ship = this.addVessel('shuttle', 'Wayfarer', 'SV-27');
    // things you carry and put down (world state), and what draws them
    this.items = new Items(this);
    this.itemVisuals = new ItemVisuals(this.engine, this.items);
    // what the game sees of the controls while the suit's screen has them
    this.blockedInput = { down: () => false, axis: () => 0, hit: () => false, get buttons() { return 0; }, padAxes: {}, padLook: { x: 0, y: 0 } };
    this.map = new MapView(this);
    // The players. Their characters are world state; their controls, view,
    // camera mode, target, route, HUD and screens are theirs alone (see
    // addPlayer). `cur` is the player whose controls or view are being
    // handled right now (null: the world's own turn), and everything that
    // asks for "the player" (this.player, this.hud, this.camPos, ...) gets
    // that one, or player 1 outside anyone's turn.
    this.players = [];
    this.cur = null;
    this.addPlayer(input).vessel = this.ship;
    this.audio = new AudioEngine(this);
    this.settlements = new Map();
    this.surveyJobs = new Map();
    this.showSites = false;
    this.showUnlisted = false; // escape pods in ship lists and markers
    this.state = 'loading';
    this.loadText = 'Surveying for a landing site';
    this.loadProgress = 0;
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
    window.addEventListener('resize', () => this.layout());
    this.begin();
  }

  // ------------------------------------------------------------------ players

  get player() { return this.cur || this.players[0]; }
  // the whole screen's own things (loading cover, title card, help, the
  // restart card) belong to player 1's HUD
  get screenHud() { return this.players[0].ui.hud; }
  get input() { return this.player.input; }
  get hud() { return this.player.ui.hud; }
  get quick() { return this.player.ui.quick; }
  get suit() { return this.player.ui.suit; }
  get fleetApp() { return this.player.ui.fleetApp; }
  get liftApp() { return this.player.ui.liftApp; }
  get inventoryApp() { return this.player.ui.inventoryApp; }
  get paintApp() { return this.player.ui.paintApp; }
  get camPos() { return this.player.camPos; }
  get camQuat() { return this.player.camQuat; }
  get chaseQuat() { return this.player.chaseQuat; }
  get camMode() { return this.player.camMode; }
  set camMode(m) { this.player.camMode = m; }
  get target() { return this.player.target; }
  set target(t) { this.player.target = t; }
  get route() { return this.player.route; }
  set route(r) { this.player.route = r; }
  get deathShown() { return this.player.deathShown; }
  set deathShown(on) { this.player.deathShown = on; }

  // whose turn it is (their controls, their view being drawn)
  setCur(p) {
    this.cur = p;
    if (p) this.engine.view = p.view;
  }

  // A player: their character, plus what is theirs alone (controls, view,
  // HUD, screens, starter kit). Player 1 exists from the start; player 2
  // joins with a controller of their own (joinPlayer).
  addPlayer(input) {
    const i = this.players.length;
    const p = new Player(this, i);
    p.input = input;
    if (i > 0) this.engine.setViewCount(i + 1);
    // their HUD and suit screen: player 1's are in the page, others' are copies of them
    let root = document.querySelector('.hudView'), suitEl = document.querySelector('.suitScreen');
    if (i > 0) {
      root = root.cloneNode(true);
      root.dataset.player = String(i);
      for (const el of root.querySelectorAll('.messages, .flightData, .navData, .modeStrip, .quickMenu, .prompt')) el.innerHTML = '';
      root.querySelector('.quickMenu').hidden = root.querySelector('.prompt').hidden = true;
      document.getElementById('hud').appendChild(root);
      const se = suitEl.cloneNode(true);
      se.dataset.player = String(i);
      se.hidden = true;
      document.querySelectorAll('.suitScreen')[i - 1].after(se);
      suitEl = se;
    }
    p.ui = { root, suitEl };
    this.players.push(p);
    p.view = this.engine.views[i];
    p.ui.hud = new Hud(this, p, root);
    p.ui.quick = new QuickMenu(this, root.querySelector('.quickMenu'));
    p.ui.suit = new SuitScreen(this, suitEl);
    p.ui.fleetApp = new FleetApp(this);
    p.ui.liftApp = new LiftApp(this);
    p.ui.inventoryApp = new InventoryApp(this);
    p.ui.paintApp = new PaintApp(this);
    // what they carry: kept from when they left, else the starter kit
    const away = this.awayPlayers && this.awayPlayers[i];
    if (away) { for (const it of this.items.heldBy(away)) it.holder = p; this.awayPlayers[i] = null; }
    else for (const k of STARTER_KIT) this.items.create(k, p);
    this.layout();
    return p;
  }

  // Player 2 joins with their own controller (an Input made for it): beside
  // player 1, with a shuttle of their own parked beside player 1's
  joinPlayer(input) {
    if (this.players.length >= 2) return null;
    if (!this.placed) { this.joinPending = input; return null; } // (after the start is placed)
    const p = this.addPlayer(input);
    if (!this.ship2) this.ship2 = this.addVessel('shuttle', 'Kittiwake', 'SV-28');
    p.ownShip = this.ship2;
    this.regroup(p);
    this.setCur(null);
    this.message(`${p.label} joined · their shuttle ${this.ship2.name} is beside ${this.players[0].label}'s`, 'nav');
    return p;
  }

  // a player leaves: their screen half closes; what they carry waits for
  // them (it's theirs again when a player joins in their place) and their
  // ship stays where it is
  leavePlayer(p) {
    if (!p || p === this.players[0]) return;
    if (p.mode === 'seat') p.releaseControls(p.vessel);
    (this.awayPlayers || (this.awayPlayers = []))[p.index] = p;
    if (this.map.open && this.map.owner === p) this.map.toggle(p);
    p.ui.suit.close();
    p.ui.root.remove();
    p.ui.suitEl.remove();
    if (p.input && p.input.dispose) p.input.dispose();
    this.players.splice(this.players.indexOf(p), 1);
    if (this.cur === p) this.cur = null;
    this.engine.setViewCount(this.players.length);
    this.players.forEach((q, i) => { q.view = this.engine.views[i]; });
    this.engine.view = this.players[0].view;
    this.layout();
    this.message(`${p.label} left`, 'nav');
  }

  // each player's view and HUD on the canvas (a resize, a player joining or leaving)
  layout() {
    this.engine.resize();
    for (const p of this.players) {
      p.ui.hud.resize();
      const rc = p.view.rect, st = p.ui.suitEl.style;
      if (this.players.length > 1) { st.left = rc.x + 'px'; st.top = rc.y + 'px'; st.width = rc.w + 'px'; st.height = rc.h + 'px'; st.right = st.bottom = 'auto'; }
      else st.left = st.top = st.width = st.height = st.right = st.bottom = '';
    }
    this.map.resize();
  }

  // a message on the screen of the player whose turn it is (everyone's,
  // outside anyone's turn)
  message(text, kind) {
    if (this.cur) this.cur.ui.hud.message(text, kind);
    else for (const p of this.players) p.ui.hud.message(text, kind);
  }

  // what a player watches: the craft they're aboard, else their own ship
  focusOf(p) { return p.aboard ? p.vessel : p.ship; }

  // A message about vessel v for the players watching it (others get
  // `other`, if given)
  tell(v, text, kind, other = null) {
    for (const p of this.players) {
      const t = this.focusOf(p) === v ? text : other;
      if (t) p.ui.hud.message(t, kind);
    }
  }

  // the players aboard v, or anything it carries / is carried in
  aboardOf(v) {
    return this.players.filter((p) => p.aboard && (p.vessel === v || p.vessel.root === v.root));
  }

  // Player p beside player L (player 1 by default: just joined, after a new
  // start; after being lost, whoever plays on), and their ship beside L's
  regroup(p, L = this.players[0]) {
    if (p === L || !L) return;
    p.deathShown = false;
    p.respawnT = 0;
    if (p.mode === 'seat') p.releaseControls(p.vessel);
    p.route = null;
    p.target = L.target;
    p.fade = 1;
    p.moveLatch = false;
    // (their ship comes along, unless someone else is aboard it)
    const own = p.ship;
    if (own && own !== L.ship && !this.aboardOf(own).some((q) => q !== p)) this.placeShipBeside(own, L.ship);
    if (L.aboard && L.vessel && !L.vessel.dead) {
      const v = L.vessel;
      if (L.mode === 'ship') p.placeAboard(v, L.sPos.clone(), L.heading.clone());
      else {
        const s = v.type.seats[L.seat] || v.type.seats[0];
        p.vessel = v; p.mode = 'ship';
        p.sPos.set(s.stand[0], s.stand[1], s.stand[2]); p.sVel.set(0, 0, 0);
        p.heading.set(s.heading[0], 0, s.heading[2]).normalize();
        p.body = v.body; p.grounded = true; p._room = null;
        if (v.type.seatOnly && !v.type.rooms) p.exitVessel(); // (an open vehicle, a pod: beside it)
      }
    } else if (L.mode === 'surface' && L.body) {
      const up = L.fPos.clone().normalize();
      const side = L.heading.clone().cross(up).normalize();
      p.placeOnSurface(L.body, L.fPos.clone().addScaledVector(side, 1.6), L.heading.clone());
      p.pitch = L.pitch;
    } else if (L.body) {
      p.vessel = null; p.mode = 'eva'; p.body = L.body;
      p.ePos.copy(L.ePos).addScaledVector(_v1.set(1, 0, 0).applyQuaternion(L.evaQuat), 2.5);
      p.eVel.copy(L.eVel);
      p.evaQuat.copy(L.evaQuat);
      p.jetFuel = 1;
    }
    p.lastSeat = own && !own.dead ? { vessel: own, seat: 0 } : null;
  }

  // Ship s (another player's shuttle) by ref (player 1's): parked beside it
  // on the ground, on a free pad of the same bay, flying in formation off
  // its side in space, or on the ground under it when it flies low
  placeShipBeside(s, ref) {
    for (const c of s.children.slice()) c.leaveParent();
    if (s.parent) s.leaveParent();
    s.dead = false; s.hull = 1; s.hullTemp = 290; s.landed = false; s.rails = false;
    s.ftl.state = 'idle'; s.ftl.speed = 0;
    s.nav.cancel(null);
    s.pilot = null;
    s.assist = 2;
    if (!ref || ref.dead) ref = this.ship.dead ? null : this.ship;
    if (!ref) { const ri = this.respawnInfo; if (ri) this.landShipAt(ri.body, ri.dir.clone(), null, s); return; }
    if (ref.parent && ref.zone) {
      // a free pad in the same bay (else 30 m inboard of ref)
      const host = ref.parent, z = ref.zone;
      const busy = (pos) => host.children.some((c) => c !== s && !c.dead && c.lpos.distanceTo(pos) < 16);
      let at = null;
      for (const pd of z.pads || []) { const pos = new THREE.Vector3(pd[0], pd[1] + 2.35, pd[2]); if (!busy(pos)) { at = pos; break; } }
      if (!at) at = ref.lpos.clone().add(_v1.set(-30 * Math.sign(ref.lpos.x || 1), 0, 0));
      s.body = host.body;
      s.dockAt(host, z, at, new THREE.Quaternion());
      s.rampTarget = s.ramp = 1;
      return;
    }
    const b = ref.body;
    const low = !ref.landed && b.solid && (ref.altitude < ref.safeAltitude() || (b.atm && ref.altitude < b.atmHeight));
    if (ref.landed || low) {
      // on the ground 40 m off its right side, the same way round
      const posF = ref.landed ? ref.landedPosF.clone() : ref.pos.clone().applyQuaternion(b.qInv);
      const qF = ref.landed ? ref.landedQuatF.clone() : b.qInv.clone().multiply(ref.quat);
      const up = posF.clone().normalize();
      const right = _v1.set(1, 0, 0).applyQuaternion(qF);
      right.addScaledVector(up, -right.dot(up)).normalize();
      const fwd = _v2.set(0, 0, -1).applyQuaternion(qF);
      this.landShipAt(b, up.multiplyScalar(b.R).addScaledVector(right, 40).normalize(), fwd.clone(), s);
      s.rampTarget = s.ramp = 1;
      return;
    }
    // in space: 60 m off its right side, matched
    s.body = b;
    s.pos.copy(ref.pos).addScaledVector(_v1.set(1, 0, 0).applyQuaternion(ref.quat), 60);
    s.vel.copy(ref.vel);
    s.quat.copy(ref.quat);
    s.angVel.set(0, 0, 0);
    s.targetVel.copy(s.vel); s.targetFrame = 'inertial';
    s.gearTarget = s.gear = 0;
    s.rampTarget = s.ramp = 0;
    if (ref.rails) s.enterRails();
  }

  get startBody() { return this.universe.bodies[this.system.startBodyId]; }
  get warp() { return WARP_LEVELS[this.warpIndex]; }
  // how fast player p's own ship travels (travel compression), or 1
  travelRate(p) { return p.travelIndex > 0 ? WARP_LEVELS[p.travelIndex] : 1; }
  // the vessel the player is flying, if any (a passenger flies nothing)
  get piloted() { return this.player.flying ? this.player.vessel : null; }
  // the vessel the player is aboard, else their own ship
  get focus() { return this.focusOf(this.player); }
  get ftl() { return this.focus.ftl; }
  // the nav computer of the ship you're in (or your own ship)
  get nav() { return this.focus.nav; }
  get shipVisual() { return this.ship.visual; }


  addVessel(typeKey, name, registry) {
    const v = new Ship(this, VESSEL_TYPES[typeKey], name);
    v.registry = registry;
    v.body = this.startBody;
    v.ftl = new FTL(this, v);
    v.nav = new NavComputer(this, v);
    v.interior = makeInterior(v);
    v.target = new VesselTarget(v);
    v.visual = v.big ? new BigShipVisual(this.engine, v) : (v.type.template ? new GlbCraftVisual(this.engine, v) : new ShipVisual(this.engine, v));
    if (v.type.legAttach) v.legAttach = v.type.legAttach.map((a) => new THREE.Vector3(...a));
    // lit by big ships' fixtures (a shuttle's cabin stays sealed from them)
    this.lights.adopt(v.visual.model.root, v.big ? null : (o) => o.name === 'interior');
    if (v.type.viewscreen) this.addScreen(v);
    this.vessels.push(v);
    return v;
  }

  // A live screen aboard a craft (type.viewscreen): a camera on its hull,
  // drawn through the same pipeline as a player's view into a texture, on a
  // panel in one of its rooms. Player state, in the end: drawn only while a
  // player is in that room (it costs a second render of the world).
  addScreen(v) {
    const d = v.type.viewscreen;
    const view = this.engine.makeOffscreenView(d.res, Math.round(d.res * d.size[1] / d.size[0]), d.fov);
    const mat = new THREE.MeshBasicMaterial({ map: view.out.texture, color: new THREE.Color(2.4, 2.4, 2.4) }); // (as bright as the other screens)
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(d.size[0], d.size[1]), mat);
    mesh.position.fromArray(d.at);
    mesh.visible = false;
    v.visual.model.root.add(mesh);
    const look = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), d.pitch || 0);
    (this.screens || (this.screens = [])).push({ v, d, view, mesh, look, frame: 0 });
  }

  // the screens someone is watching: drawn (every other frame) before the players' views
  renderScreens(dtReal) {
    for (const sc of this.screens || []) {
      const p = sc.v.dead ? null : this.players.find((q) => q.aboard && q.vessel === sc.v && q._room && q._room.id === sc.d.room);
      sc.mesh.visible = !!p && sc.frame > 0;
      if (!p) { sc.frame = 0; continue; } // (shows nothing stale when someone comes back)
      if (sc.frame++ & 1) continue;
      this.setCur(p);
      const e = this.engine;
      // the player's camera, borrowed for the pass (everything placed
      // relative to it), then given back
      const keepPos = (this._kp || (this._kp = new THREE.Vector3())).copy(p.camPos), keepQuat = (this._kq || (this._kq = new THREE.Quaternion())).copy(p.camQuat);
      sc.v.localToWorld(p.camPos.fromArray(sc.d.cam), p.camPos);
      p.camQuat.copy(sc.v.quat).multiply(sc.look);
      e.view = sc.view;
      this.screenPass = true;
      e.camera.position.set(0, 0, 0);
      e.camera.quaternion.copy(p.camQuat);
      this.computeLighting();
      this.lights.update(this.camPos, this.camQuat, this.lighting, this.vessels, this.items.lights(this.camPos, this._lamps || (this._lamps = [])));
      this.updateMeter();
      for (const v of this.vessels) v.visual.update(0, this.camPos, this.lighting);
      this.itemVisuals.update(this.camPos);
      const was = sc.mesh.visible;
      sc.mesh.visible = false; // (not in its own picture)
      const atmos = this.world.update(this.camPos, 0);
      this.updateSkyStars(0);
      this.updateEffects(dtReal * 2);
      e.render(dtReal * 2, this.sky, atmos, false);
      sc.mesh.visible = was;
      this.screenPass = false;
      p.camPos.copy(keepPos); p.camQuat.copy(keepQuat);
    }
  }

  // ------------------------------------------------------------------ start sequence

  begin() {
    const b = this.startBody;
    this.loadText = `Surveying ${b.data.name} for a landing site`;
    this.screenHud.setLoading(this.loadText, 0);
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
    const s = new Float64Array(S_LEN);
    for (let i = 0; i < 2000; i++) {
      const z = 1 - (i + 0.5) / 2000 * 2, r = Math.sqrt(1 - z * z), th = i * 2.399963;
      const d = [Math.cos(th) * r, z * 0.8, Math.sin(th) * r];
      gen.sample(d[0], d[1], d[2], 2000, s);
      if (s[S_H] > 20 && s[S_H] < 1500 && !(s[S_WDEPTH] > 0)) return new THREE.Vector3(...d).normalize();
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
    this.respawnInfo = { body: b, dir: this.startDir.clone() };
    this.placed = true;
    this.applyStart(this.startPending || 'surface');
    if (this.joinPending) { const inp = this.joinPending; this.joinPending = null; this.joinPlayer(inp); }
  }

  // the other players back beside player 1 (after a new start)
  regroupAll() { for (const p of this.players.slice(1)) this.regroup(p); }

  // On the ground beside your parked ship, off its port bow, looking back at
  // it: the home landing site, or a spot chosen on any world (spot: a
  // survey's start spot, for the arrival message)
  startOnSurface(b = this.startBody, dir = this.startDir, spot = null) {
    const s = this.ship, p = this.players[0];
    this.respawnInfo = { body: b, dir: dir.clone() };
    const here = s.landed && !s.parent && s.body === b && s.landedPosF.clone().normalize().dot(dir) > 0.99999;
    if (!here) {
      if (this.sunElevation(b, dir) < 0.17) { this.t = this.findMorning(b, dir, 30, this.t); this.universe.update(this.t); }
      this.landShipAt(b, dir, null);
    }
    const sp = s.landedPosF.clone();
    const sq = s.landedQuatF.clone();
    const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(sq);
    const left = new THREE.Vector3(-1, 0, 0).applyQuaternion(sq);
    const pp = sp.clone().addScaledVector(fwd, 9).addScaledVector(left, 19);
    const toShip = sp.clone().sub(pp);
    if (p.vessel) p.releaseControls(p.vessel);
    p.vessel = null;
    p.placeOnSurface(b, pp.normalize(), toShip);
    p.pitch = 0.04;
    p.lastSeat = { vessel: s, seat: 0 };
    s.rampTarget = 1; s.ramp = 1;
    this.target = null;
    this.route = null;
    this.setWarp(0);
    this.regroupAll();
    const name = b.data.name, site = !spot && b === this.startBody ? this.site : null;
    this.beginLoading('surface', `Descending to ${name}`, () => {
      this.message(`${name}: ${b.data.label}`, 'nav');
      if (spot) this.message(`${spot.label} · ${spot.biome} · ${spot.temperatureC} °C · ${spot.elevation.toLocaleString()} m`);
      else if (site) this.message(`Landing site: ${site.biome}, ${site.reasons.slice(0, 2).join(', ')}`);
    });
  }

  // A spot picked on the start screen ('site:<body>:<spot key>'): the body's
  // survey says where; the cover stays up (and the world holds) until it does
  startAtSpot(b, spotKey) {
    const token = this.startToken;
    this.beginLoading('surface', `Surveying ${b.data.name}`);
    this.loadHold = true;
    this.requestSurvey(b, 90).then((res) => {
      if (token !== this.startToken) return; // another start was picked meanwhile
      this.loadHold = false;
      const spot = res && res.spots && res.spots.find((sp) => sp.key === spotKey);
      this.startOnSurface(b, spot ? new THREE.Vector3(...spot.dir) : this.fallbackSite(b), spot);
    }, (err) => { console.error(err); if (token === this.startToken) { this.loadHold = false; this.startOnSurface(b, this.fallbackSite(b), null); } });
  }

  // sine of the sun's elevation over the horizon at a body-fixed direction, now
  sunElevation(b, dirF) {
    const pos = new THREE.Vector3(), q = new THREE.Quaternion();
    this.universe.bodyStateAt(b, this.t, pos);
    b.orientationAt(this.t, q);
    return pos.negate().normalize().applyQuaternion(q.invert()).dot(dirF);
  }

  // Hold the world while the view streams in behind the loading cover.
  // mode: 'surface' waits for the finest terrain under you, 'space' only for
  // what is in view; arrive() runs once the view is ready and the game launched
  beginLoading(mode, text, arrive) {
    this.state = 'loading';
    this.loadMode = mode;
    this.loadText = text;
    this.loadTimer = 0;
    this.settleTime = 0;
    this.loadProgress = 0;
    this.loadPeak = 0;
    this.arrival = arrive || null;
    this.engine.adaptReset = true;
    this.screenHud.setLoading(text, 0);
  }

  // every vessel as at the start: drives idle, the big ships on their home orbits
  resetFleet() {
    const b = this.startBody;
    for (const v of this.vessels) { v.ftl.state = 'idle'; v.ftl.speed = 0; }
    if (this.tender) this.placeInOrbit(this.tender, b, lockRadius(b) - b.R + 90000, 0.35);
    if (this.carrier) this.placeInOrbit(this.carrier, b, lockRadius(b) - b.R + 280000, -0.45);
    this.dockCarried();
  }

  // the player is in the game (the briefing closed): say where they are
  launch() {
    this.launched = true;
    this.everLaunched = true;
    this.arrive();
  }

  arrive() {
    if (this.state !== 'playing' || !this.launched || !this.arrival) return;
    const f = this.arrival;
    this.arrival = null;
    f();
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
    for (const v of this.vessels) if (v.nav) v.nav.cancel(null);
    this.openingBody = null;
    this.loadHold = false;
    this.startToken = (this.startToken || 0) + 1;
    if (this.everLaunched) this.resetFleet(); // a fresh start after playing: nothing left mid-flight
    if (key === 'carrier' && this.carrier && !this.carrier.dead) this.startAboard();
    else if (key && key.startsWith('orbit:') && this.universe.bodies[+key.slice(6)]) this.startInOrbit(this.universe.bodies[+key.slice(6)]);
    else if (key && key.startsWith('site:') && this.universe.bodies[+key.split(':')[1]]) this.startAtSpot(this.universe.bodies[+key.split(':')[1]], key.split(':')[2]);
    else this.startOnSurface();
    // the simulated worlds, the one we start at first
    if (this.worldSims) {
      const id = key && key.startsWith('orbit:') ? +key.slice(6) : key && key.startsWith('site:') ? +key.split(':')[1] : (this.ship && this.ship.body && this.ship.body.data ? this.ship.body.data.id : null);
      this.worldSims.requestAll(id);
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
    const p = this.players[0], s = this.ship;
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
    s.pilot = null;
    // you: on a spacewalk, matched to the ship
    if (p.vessel) p.releaseControls(p.vessel);
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
    this.regroupAll();
    // let the view stream in, then roll the title
    this.openingBody = b;
    this.openingAlt = r - b.R;
    this.beginLoading('space', `Arriving in orbit of ${b.data.name}`, () => this.rollTitle());
  }

  rollTitle() {
    const b = this.openingBody;
    if (!b) return;
    this.openingBody = null;
    const alt = this.openingAlt;
    const pad = this.input.usingPad;
    this.screenHud.showTitle([
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
    this.dockCarried();
    // compile the big ships' shaders now, not the first time one comes into view
    const r = this.engine.renderer;
    if (r.compileAsync) {
      r.compileAsync(this.engine.scene, this.engine.camera).catch(() => {});
      r.compileAsync(this.engine.transparentScene, this.engine.camera).catch(() => {});
    }
  }

  // The carrier's own craft, in their places: the yacht in its recess under
  // the hull, the escape pods in their tubes (made the first time)
  dockCarried() {
    const c = this.carrier;
    if (!c || c.dead) return;
    const L = c.type.layout;
    if (!this.yacht) {
      this.yacht = this.addVessel('yacht', 'Kestrel', 'CV-01-Y');
      this.pods = L.pods.map((p, i) => this.addVessel('pod', `Pod ${i + 1}`, `CV-01-P${i + 1}`));
    }
    const put = (v, key, pos, quat, hatch) => {
      v.dead = false; v.hull = 1; v.hullTemp = 290; v.landed = false;
      v.ftl.state = 'idle';
      v.nav.cancel(null);
      v.hatchKey = key;
      v.home = { host: c, hatch };
      const zone = { name: `${v.type.className} berth`, kind: 'berth', min: [pos[0] - 1, pos[1] - 1, pos[2] - 1], max: [pos[0] + 1, pos[1] + 1, pos[2] + 1], gravity: 0, pressure: 1 };
      v.dockAt(c, zone, new THREE.Vector3(...pos), quat);
    };
    put(this.yacht, 'yacht', L.yacht.dock.pos, new THREE.Quaternion(), L.yacht.hatch);
    L.pods.forEach((p, i) => {
      // nose out of the tube: the pod's -z along the tube's axis
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, -1), new THREE.Vector3(...p.dock.axis));
      put(this.pods[i], p.id, p.dock.pos, q, p.hatch);
    });
    this.parkCraft();
  }

  // The carrier's vehicles and landers, parked in the starboard bay (made the
  // first time): the lander on the first pad, the lifter on the third with
  // the hover-tank inboard of it (the lifter's cradle carries it), the
  // container inboard of the fourth with its door open toward the bay's mouth
  // and the cart in front of it, the dropship on the fifth. (The shuttle has
  // the second pad.)
  parkCraft() {
    const c = this.carrier;
    const bay = c.type.zones.find((z) => z.side > 0) || c.type.zones[0];
    if (!this.cart) {
      this.fighter = this.addVessel('fighter', 'Kite', 'CV-01-F1');
      this.lifter = this.addVessel('lifter', 'Atlas', 'CV-01-L1');
      this.crate = this.addVessel('crate', 'Container 1', 'CV-01-C1');
      this.cart = this.addVessel('cart', 'Mule', 'CV-01-V1');
      this.dropship = this.addVessel('dropship', 'Cheyenne', 'CV-01-D1');
      this.tank = this.addVessel('tank', 'Bulldog', 'CV-01-T1');
    }
    const yaw = (deg) => new THREE.Quaternion().setFromAxisAngle(_v1.set(0, 1, 0), deg * Math.PI / 180);
    const park = (v, x, z, deg, mass) => {
      v.dead = false; v.hull = 1; v.hullTemp = 290; v.landed = false;
      v.ftl.state = 'idle';
      v.nav.cancel(null);
      if (v.cargo) v.cargo = null;
      for (const d of Object.values(v.doors)) d.open = d.target = 0;
      v.dockAt(c, bay, new THREE.Vector3(x, bay.min[1] + restHeight(v.type, mass), z), yaw(deg));
    };
    const P = bay.pads;
    park(this.fighter, P[0][0], P[0][2], 0);
    park(this.lifter, P[2][0], P[2][2], 0);
    park(this.crate, P[3][0] - 26, P[3][2], 180);
    park(this.cart, P[3][0] - 26, P[3][2] - 14, 180);
    park(this.dropship, P[4][0], P[4][2], 0);
    park(this.tank, P[2][0] - 26, P[2][2], 0);
    this.crate.doors.rear.open = this.crate.doors.rear.target = 1;
    this.dropship.doors.ramp.open = this.dropship.doors.ramp.target = 1; // (ramp down: walk in)
  }

  // ------------------------------------------------------------------ volumes, clamps, doors

  // Whether a volume takes a craft: behind a door only while it is open, and
  // a snug one (a container's hold) only what fits inside it
  zoneAdmits(h, z, v) {
    if (z.door && h.doors[z.door] && h.doors[z.door].open < 0.6) return false;
    if (z.snug) {
      const r2 = v.type.radius * 2;
      const s = (v.type.size || [r2, r2, r2]).slice().sort((a, b) => a - b);
      const d = [z.max[0] - z.min[0], z.max[1] - z.min[1], z.max[2] - z.min[2]].sort((a, b) => a - b);
      if (s.some((x, i) => x > d[i] + 0.05)) return false;
    }
    return true;
  }

  // A craft that has left its volume goes into the next one up that holds
  // it: out of a container, the bay the container stands in (or hangs in,
  // clamped under a lifter: a clamp is not a volume, so the lifter is
  // skipped); out of the bay, the planet's frame.
  rehome(v, from) {
    for (let h = from; h; h = h.parent) {
      if (!h.type.zones || h.dead) continue;
      const local = h.bodyToLocal(v.pos, _v1);
      const z = h.type.zones.find((zz) => insideBox(zz, local) && this.zoneAdmits(h, zz, v));
      if (z) { v.enterParent(h, z); return h; }
    }
    return null;
  }

  // Take cargo into a clamp, rigidly, at its clamp position, lined up either
  // way round (turned: facing backwards; by default whichever is nearer). It
  // keeps whatever it carries (a cart in a container).
  clampCargo(v, cargo, say = true, turned = null) {
    const cl = v.type.clamp;
    if (turned === null) turned = _v2.set(0, 0, -1).applyQuaternion(cargo.quat).applyQuaternion(_q1.copy(v.quat).invert()).z > 0;
    const q = new THREE.Quaternion();
    if (turned) q.setFromAxisAngle(_v1.set(0, 1, 0), Math.PI);
    const off = cargo.type.cargo.offset;
    const pos = new THREE.Vector3(cl.pos[0] + off[0], cl.pos[1] + off[1], cl.pos[2] + off[2]);
    const f = cl.fits;
    const zone = { name: cl.name, kind: 'clamp', gravity: 'host', pressure: 0,
      min: [pos.x - f[0] / 2, pos.y - f[1] / 2, pos.z - f[2] / 2], max: [pos.x + f[0] / 2, pos.y + f[1] / 2, pos.z + f[2] / 2] };
    cargo.dockAt(v, zone, pos, q);
    cargo.landed = false;
    v.cargo = cargo;
    if (say) { this.message(`${v.name}: ${cargo.name} clamped`, 'nav'); this.audio.clunk(); }
  }

  // Y in a craft with a clamp: let go of the cargo, or take the one under it
  toggleClamp(v) {
    const cl = v.type.clamp;
    if (!cl) return;
    if (v.cargo && !v.cargo.dead && v.cargo.parent === v) {
      const c = v.cargo;
      v.cargo = null;
      c.attached = false;
      c.leaveParent();
      this.rehome(c, v.parent);
      c.idleTime = 0;
      this.message(`${v.name}: ${c.name} released`, 'nav');
      this.audio.clunk();
      return;
    }
    let best = null, bestD = Infinity;
    const qi = _q1.copy(v.quat).invert();
    for (const c of this.vessels) {
      if (c === v || c.dead || !c.type.cargo || c.body !== v.body) continue;
      if (c.parent && c.parent.cargo === c) continue; // (in someone else's clamp)
      const off = c.type.cargo.offset;
      const d = _v1.copy(c.pos).sub(v.pos).applyQuaternion(qi).sub(_v2.set(cl.pos[0] + off[0], cl.pos[1] + off[1], cl.pos[2] + off[2]));
      if (Math.abs(d.x) > cl.reach[0] || Math.abs(d.y) > cl.reach[1] || Math.abs(d.z) > cl.reach[2]) continue;
      // lined up with the clamp (either way round), upright, and small enough
      const fz = _v2.set(0, 0, -1).applyQuaternion(c.quat).applyQuaternion(qi).z;
      const uy = _v3.set(0, 1, 0).applyQuaternion(c.quat).applyQuaternion(qi).y;
      if (Math.abs(fz) < 0.94 || uy < 0.9) continue;
      const sz = c.type.size;
      if (sz[0] > cl.fits[0] || sz[1] > cl.fits[1] || sz[2] > cl.fits[2]) continue;
      if (d.length() < bestD) { bestD = d.length(); best = c; }
    }
    if (best) this.clampCargo(v, best);
    else this.message(`${v.name}: nothing in the ${cl.name.toLowerCase()}'s reach · line up over the cargo`, 'caution');
  }

  // ------------------------------------------------------------------ items

  // Looking at an item within reach on foot: F picks it up. True when it
  // took the prompt (an item you aim at comes before seats and doors nearby).
  itemInteract(p, input) {
    // (the eye as of now: last frame's camera is hundreds of metres behind a
    // planet moving along its orbit)
    const eye = this._eye || (this._eye = new THREE.Vector3()), eq = this._eyeQ || (this._eyeQ = new THREE.Quaternion());
    p.computeCamera(eye, eq);
    const it = this.items.lookAt(eye, _v3.set(0, 0, -1).applyQuaternion(eq));
    if (!it) return false;
    const T = ITEM_TYPES[it.kind];
    p.prompt = { key: 'F', text: `Pick up the ${T.name.toLowerCase()}` };
    if (input.hit('KeyF')) {
      this.items.pickUp(it, p);
      this.message(`${T.name} picked up · ${this.items.heldBy(p).length} carried · I: inventory`);
    }
    return true;
  }

  putDownItem(it) {
    const where = this.items.putDown(it, this.player);
    if (!where) { this.message('Get out of the seat to put things down', 'caution'); return; }
    this.message(`${ITEM_TYPES[it.kind].name} put down · ${where === 'space' ? 'adrift' : where}`);
    this.audio.clunk();
  }

  // A craft and the small craft stacked with it: what it carries (all the way
  // down: the cart in the container under the lifter) and what carries it
  // (up to, not including, a big ship)
  craftStack(v) {
    const out = [v];
    const down = (c) => { for (const k of c.children) if (!k.dead) { out.push(k); down(k); } };
    down(v);
    for (let h = v.parent; h && !h.big; h = h.parent) out.push(h);
    return out;
  }

  // On foot near a craft you sit in: get in. Near a door's panel: open or
  // close it. (Doors are world state on their vessel: anyone can work them.)
  craftInteract(p, input) {
    // reach from the eye (a door panel is at chest height, a seat's step on the ground)
    const me = p.computeCamera(_v1, this._eyeQ2 || (this._eyeQ2 = new THREE.Quaternion())) || _v1;
    let best = null, bestD = Infinity;
    for (const v of this.vessels) {
      // (a craft in its berth is boarded through its host's hatch; away from it, like any other)
      if (v.dead || v.big || (v.home && v.parent)) continue;
      if (v.getWorldPos(_v2).distanceToSquared(me) > Math.pow(v.type.radius + 6, 2)) continue;
      const mine = v === p.vessel; // (aboard: its door panels; its seats are the cabin's own)
      // an open vehicle: get in from beside it (craft you walk into: by the ramp or a hatch)
      const s = !mine && v.type.seatOnly && !v.type.rooms && v.type.seats[0];
      if (s) {
        for (const [pt, lim] of [[s.stand, 3.0], [s.pos, 3.2]]) { // (a stand point is on the ground, 1.7 m below the eye)
          const d = v.localToWorld(_v2.fromArray(pt), _v2).distanceTo(me) - lim;
          if (d < 0 && d < bestD) { bestD = d; best = { v }; }
        }
      }
      for (const dr of v.type.doors || []) {
        for (const pt of [dr.panel, dr.panelIn]) {
          if (!pt) continue;
          const d = v.localToWorld(_v2.fromArray(pt), _v2).distanceTo(me) - 2.2;
          if (d < 0 && d < bestD) { bestD = d; best = { v, dr }; }
        }
      }
      if (!mine) {
        for (const e of v.type.entries || []) {
          if (e.whenFree && v.parent) continue;
          const d = v.localToWorld(_v2.fromArray(e.outside), _v2).distanceTo(me) - 2.6;
          if (d < 0 && d < bestD) { bestD = d; best = { v, entry: e }; }
        }
      }
    }
    if (!best) return;
    if (best.dr) {
      const st = best.v.doors[best.dr.id], opening = st.target < 0.5;
      p.prompt = { key: 'F', text: `${opening ? 'Open' : 'Close'} the ${best.dr.label}` };
      if (input.hit('KeyF')) { st.target = opening ? 1 : 0; this.audio.clunk(); }
      return;
    }
    const v = best.v;
    if (best.entry) {
      const e = best.entry;
      p.prompt = { key: 'F', text: `Climb into ${v.name} · ${e.label}` };
      if (input.hit('KeyF')) {
        p.fade = 1;
        if (e.canopy) v.boardingT = 1.6;
        p.enterVessel(v, new THREE.Vector3(...e.inside), new THREE.Vector3(), new THREE.Vector3(...(e.heading || [0, 0, -1])));
        p.grounded = true;
      }
      return;
    }
    const holder = p.seatHolder(v, 0);
    if (holder) { p.prompt = { key: null, text: `${v.name} · ${holder.label} is in it` }; return; }
    p.prompt = { key: 'F', text: `Get in ${v.name} · ${v.type.className.toLowerCase()}` };
    if (input.hit('KeyF') && p.sitDown(0, v)) {
      p.fade = 1;
      v.boardingT = 1.6; // (a canopy lifts)
      this.message(`${v.name} · ${v.type.className}${v.type.help ? ' · ' + v.type.help : ''}`, 'nav');
    }
  }

  // a craft leaving its berth: thrown clear along its launch direction
  launchCraft(v) {
    const L = v.type.launch, host = v.parent;
    v.attached = false;
    v.lpos.add(new THREE.Vector3(...L.clear).applyQuaternion(v.lquat));
    v.lvel.copy(new THREE.Vector3(...L.dir).applyQuaternion(v.lquat).multiplyScalar(L.speed));
    v.leaveParent();
    v.idleTime = 0;
    this.tell(v, `${v.name} launched from ${host.name}`, 'nav');
    this.audio.clunk();
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

  // a lift's panel: pick a deck (F at a lift door with several stops)
  openLift(vessel, lift, at) {
    this.liftApp.setup(vessel, lift, at);
    this.suit.show(this.liftApp);
  }

  // Alternative start: the shuttle parked in the carrier's hangar, the player
  // on the deck beside it
  startAboard() {
    this.startAboardPending = false;
    const c = this.carrier;
    if (!c || c.dead) return;
    const s = this.ship;
    const deckY = 2.35; // (the shuttle's centre over a deck, gear down)
    s.dead = false; s.hull = 1;
    // on the second pad of the starboard bay, nose to the bay's mouth
    const bay = c.type.zones.find((z) => z.side > 0) || c.type.zones[0];
    const pad = bay.pads[1];
    s.dockAt(c, bay, new THREE.Vector3(pad[0], pad[1] + deckY, pad[2]), new THREE.Quaternion());
    s.rampTarget = 1; s.ramp = 1;
    s.assist = 2;
    // you: inboard of it, by its ramp, looking at it
    const p = this.players[0];
    if (p.mode === 'seat') p.releaseControls(p.vessel);
    p.placeAboard(c, new THREE.Vector3(pad[0] - 20, pad[1], pad[2] + 22), new THREE.Vector3(0.6, 0, -0.8));
    p.lastSeat = { vessel: s, seat: 0 };
    p.target = this.tender ? this.tender.target : null;
    p.route = null;
    this.setWarp(0);
    this.regroupAll();
    this.beginLoading('space', `Boarding ${c.name}`, () => {
      this.message(`Aboard ${c.name} · ${c.type.className} · ${bay.name}`, 'nav');
      this.message(`Your shuttle ${s.name} is on pad 2 · its ramp is down · Tab finds your way (the bridge is up the forward lift)`);
    });
  }

  // Lands a ship (yours by default; settled pose) at a body-fixed direction
  landShipAt(b, dirF, headingF, s = this.ship) {
    if (s.parent) s.leaveParent();
    const up = dirF.clone().normalize();
    let north = new THREE.Vector3(0, 1, 0).addScaledVector(up, -up.y);
    if (north.lengthSq() < 1e-6) north = new THREE.Vector3(1, 0, 0).addScaledVector(up, -up.x);
    north.normalize();
    const east = north.clone().cross(up).normalize();
    const fwd = headingF ? headingF.clone().addScaledVector(up, -headingF.dot(up)).normalize() : east;
    // fit the local ground plane under the four feet (any craft's: its leg
    // attachments; the shuttle's by default)
    const right = fwd.clone().cross(up).normalize();
    const samples = s.type.legAttach && s.type.key !== 'shuttle' ? [...s.type.legAttach.map((a) => [a[0], a[2]]), [0, 0]] : [[-3, -6.6], [3, -6.6], [-3.1, 6.2], [3.1, 6.2], [0, 0]];
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
    // its centre over the ground as it rests on its legs (2.35 m: the shuttle)
    const rest = s.type.legAttach && s.type.key !== 'shuttle' ? restHeight(s.type, s.mass) : 2.35;
    const posF = up.clone().multiplyScalar(R + Math.max(ground, hs) + rest);
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
    // a clearing in any vegetation around the landing spot (as wide as the craft)
    const terr = this.world.terrainOf(b.id);
    if (terr) terr.addClearing(up.clone().multiplyScalar(R), Math.max(22, s.type.radius + 8));
    // settle on the legs (time advances with the physics: the surface is
    // moving at hundreds of m/s in the inertial frame the ship integrates in),
    // then the clock goes back: a landed ship is fixed to the ground, and
    // nothing else (another player, a ship in flight) was stepped meanwhile
    const t0 = this.t;
    for (let i = 0; i < 900 && !s.landed; i++) {
      this.t += PHYS_DT;
      this.universe.update(this.t);
      this.stepVessel(s, PHYS_DT, true);
    }
    if (!s.landed) {
      s.landed = true;
      s.landedPosF.copy(s.pos).applyQuaternion(b.qInv);
      s.landedQuatF.copy(b.qInv).multiply(s.quat);
    }
    this.t = t0;
    this.universe.update(t0);
    s.syncLanded();
  }

  // ------------------------------------------------------------------ controls

  setWarp(i) {
    i = Math.max(0, Math.min(WARP_LEVELS.length - 1, i));
    // (a player stepping down below what their own ship travels at: the
    // compression steps down first)
    const me = this.cur;
    if (me && me.travelIndex > 0 && i < me.travelIndex) {
      me.travelIndex = i > this.warpIndex ? i : 0;
      this.message(me.travelIndex ? `Your ship travels ×${WARP_LEVELS[i].toLocaleString()}` : 'Travel compression off', 'nav');
      if (me.travelIndex) return;
    }
    if (i > 2) {
      const all = this.warpBlockers();
      if (all.length) {
        // Held back by someone else only: the asking player's own ship can
        // still travel faster (travel compression: their ship alone, not the
        // clock, so the sun, the planets and everyone else keep world time)
        const own = me ? all.filter((b) => b.who === me || (b.v && me.aboard && b.v.root === me.vessel.root)) : all;
        const can = me && !own.length && this.canCompress(me);
        if (can) {
          me.travelIndex = i;
          this.message(`Time warp held (${all[0].why}) · your ship alone travels ×${WARP_LEVELS[i].toLocaleString()}`, 'nav');
        } else this.message(`Time warp limited: ${all[0].why}`, 'caution');
        i = Math.min(i, 2);
      }
    }
    if (i !== this.warpIndex) {
      this.warpIndex = i;
      if (i > 2) for (const v of this.vessels) if (!v.dead && !v.landed && !v.parent && !v.rails) v.enterRails();
    }
  }

  // Why time can't go faster than x4 now, if it can't. There is one clock
  // (world state), so it runs only as fast as every player's situation
  // allows: anyone on a spacewalk, in the air, or flying low holds it.
  warpBlocker() {
    const all = this.warpBlockers();
    return all.length ? all[0].why : null;
  }

  // every reason, with the player (who) or vessel (v) it comes from
  warpBlockers() {
    const many = this.players.length > 1;
    const who = (p) => (many ? ` (${p.label})` : '');
    const out = [];
    for (const v of this.vessels) if (!v.dead && v.ftl && (v.ftl.state === 'cruise' || v.ftl.state === 'spool')) out.push({ v, why: 'FTL active' });
    for (const p of this.players) {
      if (p.mode === 'eva') out.push({ who: p, why: `EVA in progress${who(p)}` });
      else if (p.mode === 'surface' && !p.grounded) out.push({ who: p, why: `not on the ground${who(p)}` });
    }
    for (const v of this.vessels) {
      if (v.dead || v.landed) continue;
      const pl = v.pilot;
      if (v.parent) {
        if (!v.attached) out.push({ v, who: pl, why: pl ? `manoeuvring inside ${v.parent.name}${who(pl)}` : `${v.name} is manoeuvring inside ${v.parent.name}` });
        continue;
      }
      if (pl && v.wantsForce() && v.assist !== 2) { out.push({ v, who: pl, why: `thrusting${who(pl)}` }); continue; }
      const alt = v.altitude;
      if (v.body.atm && alt < v.body.atmHeight) out.push({ v, who: pl, why: pl ? `inside an atmosphere${who(pl)}` : `${v.name} is in an atmosphere` });
      else if (alt < v.safeAltitude()) out.push({ v, who: pl, why: pl ? `too close to the surface${who(pl)}` : `${v.name} is flying near the surface` });
    }
    return out;
  }

  // Whether player p's ship can travel faster than the clock: coasting free
  // in space (not landed, not in a host, out of any air and well up, its
  // drive idle), nobody else aboard it, no other player within 50 km
  canCompress(p) {
    if (!p.aboard || !p.vessel) return false;
    const r = p.vessel.root;
    if (r.dead || r.parent || r.landed || (r.ftl && r.ftl.state !== 'idle')) return false;
    if ((r.body.atm && r.altitude < r.body.atmHeight * 1.02) || r.altitude < r.safeAltitude()) return false;
    const rp = r.getWorldPos(_v1);
    for (const q of this.players) {
      if (q === p) continue;
      if (q.aboard && q.vessel.root === r) return false;
      if (q.worldPos(_v2).distanceTo(rp) < 50000) return false;
    }
    return true;
  }

  // Travel compression, after the world's step: each compressing player's
  // ship coasts ahead along its orbit by the time it gains on the clock
  // (its rails anchor moves back), carrying everything aboard. It stops
  // when the ship can't (a burn, air, another player near) or nobody holds
  // the clock any more (then the clock itself goes faster).
  compressTravel(dtReal) {
    for (const v of this.vessels) v._compress = false;
    for (const p of this.players) {
      if (!(p.travelIndex > 0)) continue;
      if (!this.canCompress(p)) {
        p.travelIndex = 0;
        p.ui.hud.message('Travel compression off: your ship is no longer coasting alone in space', 'caution');
        continue;
      }
      if (!this.warpBlockers().length) { // (nobody holds the clock: it goes this fast for everyone)
        const k = p.travelIndex;
        p.travelIndex = 0;
        this.setCur(p); this.setWarp(k); this.setCur(null);
        continue;
      }
      const r = p.vessel.root;
      r._compress = true; // (it coasts on rails from the next step)
      if (!r.rails) continue; // (a burn: world time until it coasts again)
      // (in steps along the orbit, like the clock's own warp: a step into air or
      // too near the ground ends it there)
      const extra = dtReal * Math.max(0, WARP_LEVELS[p.travelIndex] - this.warp);
      const n = this.railSteps(r, extra), h = extra / n;
      for (let i = 0; i < n; i++) {
        r.railT0 -= h;
        r.railsState(this.t, r.pos, r.vel);
        r.checkSOI(); // (a new body re-anchors its rails and says so)
        if ((r.body.atm && r.altitude < r.body.atmHeight * 1.02) || r.altitude < r.safeAltitude()) {
          p.travelIndex = 0;
          p.ui.hud.message('Travel compression off: near the ground or in the air', 'caution');
          break;
        }
      }
      this.syncTree(r);
    }
  }

  toggleRamp(v = this.player.aboard ? this.player.vessel : this.player.ship) {
    const rd = v && (v.type.doors || []).find((d) => d.ramp);
    if (rd) {
      const st = v.doors[rd.id];
      st.target = st.target > 0.5 ? 0 : 1;
      this.message(st.target ? `${v.name}: ${rd.label} lowering` : `${v.name}: ${rd.label} closing`);
      this.audio.clunk();
      return;
    }
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
    const p = this.player, s = p.ship;
    const b = p.body;
    if (p.mode !== 'surface' || !s) return;
    if (s.pilot && s.pilot !== p) { this.message(`${s.name} is flying · ${s.pilot.label} has it`, 'caution'); return; }
    if (this.aboardOf(s).length) { this.message(`${s.name} has someone aboard`, 'caution'); return; }
    const up = p.fPos.clone().normalize();
    const fwd = p.heading.clone();
    const dest = up.clone().multiplyScalar(b.R).addScaledVector(fwd, 45).normalize();
    if (s.ftl.state === 'cruise') s.ftl.state = 'idle';
    this.landShipAt(b, dest, fwd.clone().negate(), s);
    s.rampTarget = 1; s.ramp = 1;
    this.message('Ship summoned', 'nav');
  }

  // bodies and ships, nearest first
  // whether a ship belongs in lists, pickers and markers (escape pods only
  // when shown, or when you're in one)
  listed(v) {
    return !v.type.unlisted || this.showUnlisted || (this.player.aboard && this.player.vessel === v);
  }

  targetList() {
    const wp = this.camPos;
    const mine = this.player.aboard ? this.player.vessel.root : null;
    const list = this.universe.bodies.slice();
    // (craft riding in or on another ship are part of it, not targets of their own)
    for (const v of this.vessels) if (!v.dead && v.root !== mine && v !== this.player.vessel && !(v.parent && v.attached) && this.listed(v)) list.push(v.target);
    return list.sort((a, b) => a.pos.distanceTo(wp) - b.pos.distanceTo(wp));
  }

  // Target whatever is under the cursor (under the reticle when the mouse is
  // captured): the body or ship whose on-screen disc holds that point, the
  // most central hit winning; small things get a generous pick radius
  targetUnderCursor() {
    const hud = this.hud, inp = this.input;
    // (in the player's own view: hud.project gives points in it)
    const rect = this.canvas.getBoundingClientRect(), vr = this.player.view.rect;
    const aim = inp.locked || !inp.cursorIn || !inp.kbm;
    const px = aim ? vr.w / 2 : inp.cx - rect.left - vr.x;
    const py = aim ? vr.h / 2 : inp.cy - rect.top - vr.y;
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

  // One frame: every player's controls, the world, then each player's view
  // (the whole screen, or their half of a split screen)
  frame(now) {
    let dtReal = Math.min(0.1, Math.max(0.0005, (now - this.lastFrame) / 1000));
    this.lastFrame = now;
    this.fps = this.fps * 0.95 + (1 / dtReal) * 0.05;
    const t0 = performance.now();
    for (const p of this.players) {
      this.setCur(p);
      // (a passenger's controller works as on foot: the right stick looks around)
      const pm = p.mode;
      p.input.pollPad(pm === 'seat' ? (p.flying ? 'flight' : 'foot') : (pm === 'eva' ? 'eva' : 'foot'), dtReal);
      p.ui.suit.update(dtReal);
      if (!p.ui.suit.open) p.ui.quick.update(dtReal);
      this.handleGlobalKeys(p.input);
    }
    this.setCur(null);
    if (this.state === 'loading') this.updateLoading(dtReal);
    if (this.state === 'playing' && !this.paused) this.simulate(dtReal);
    else if (this.state !== 'playing') this.universe.update(this.t);
    // a player lost while others play on comes back beside player 1
    for (const p of this.players) {
      if (!(p.respawnT > 0) || this.paused || (p.respawnT -= dtReal) > 0) continue;
      const L = p.regroupTo && this.players.includes(p.regroupTo) && !p.regroupTo.deathShown ? p.regroupTo : this.players.find((q) => q !== p && !q.deathShown);
      if (!L) { p.respawnT = 0.5; continue; } // (everyone lost: wait for player 1's restart)
      this.regroup(p, L);
      p.ui.hud.message(`Back beside ${L.label}${p.ownShip ? ` · ${p.ownShip.name} is parked by ${L.label}'s ship` : ''}`, 'nav');
    }
    if (this.map.open && this.map.full) {
      // the pause screen's map: the whole screen, nothing else drawn
      this.setCur(this.map.owner || this.players[0]);
      this.map.render(dtReal, { x: 0, y: 0, w: this.engine.cssW || window.innerWidth, h: this.engine.cssH || window.innerHeight });
    } else {
      this.renderScreens(dtReal);
      this.players.forEach((p, i) => this.renderView(p, i === 0, dtReal));
    }
    this.setCur(null);
    this.pool.pump();
    this.setCur(this.players[0]); // (the sound is player 1's)
    this.audio.update(dtReal);
    this.setCur(null);
    for (const p of this.players) p.input.endFrame();
    this.stats.frameMs = this.stats.frameMs * 0.9 + (performance.now() - t0) * 0.1;
  }

  // Player p's view: everything placed relative to their camera, lit for
  // where they are, drawn into their part of the canvas, their HUD over it.
  // Things that move with time (animations, effects) advance in the first
  // view only.
  renderView(p, first, dtReal) {
    this.setCur(p);
    const dtA = first ? dtReal : 0;
    this.updateCamera(dtReal);
    this.engine.camera.position.set(0, 0, 0);
    this.engine.camera.quaternion.copy(this.camQuat);
    this.computeLighting();
    this.lights.update(this.camPos, this.camQuat, this.lighting, this.vessels, this.items.lights(this.camPos, this._lamps || (this._lamps = [])));
    this.updateMeter();
    for (const v of this.vessels) v.visual.update(dtA, this.camPos, this.lighting);
    this.itemVisuals.update(this.camPos);
    const atmos = this.world.update(this.camPos, dtA);
    this.updateSkyStars(dtA);
    this.updateEffects(dtReal);
    if (this.map.open && this.map.owner === p) this.map.render(dtReal, p.view.rect);
    else this.engine.render(dtReal, this.sky, atmos, first);
    p.ui.hud.update(dtReal);
  }

  handleGlobalKeys(input) {
    if (this.debugFree || this.suit.open) return;
    if (this.paused) {
      // (the pause screen: H its controls tab, M its map)
      if (input.hit('KeyH')) { if (this.onPausedHelp) this.onPausedHelp(); else this.screenHud.toggleHelp(); }
      if (input.hit('KeyM') && this.onMapKey) this.onMapKey(this.player);
      return;
    }
    // (player 1's M opens the pause screen's map: main.js sets onMapKey)
    if (input.hit('KeyM')) { if (this.onMapKey) this.onMapKey(this.player); else this.map.toggle(this.player); }
    if (this.state !== 'playing') return;
    // (travelling faster than the clock: the keys step your own ship's rate)
    const wi = this.player.travelIndex > 0 ? this.player.travelIndex : this.warpIndex;
    if (input.hit('Comma')) this.setWarp(wi - 1);
    if (input.hit('Period')) this.setWarp(wi + 1);
    if (input.hit('Tab')) {
      const pl = this.player;
      if (pl.mode === 'ship' && pl.vessel.big) this.cycleRoute(input.down('ShiftLeft') ? -1 : 1);
      else this.cycleTarget(input.down('ShiftLeft') ? -1 : 1);
    }
    if (input.hit('KeyT')) this.targetUnderCursor();
    if (input.hit('KeyK')) { this.showSites = !this.showSites; this.message(this.showSites ? 'Settlement survey overlay on' : 'Settlement survey overlay off'); }
    if (input.hit('KeyH')) this.screenHud.toggleHelp();
    if (input.hit('KeyP')) this.player.recallSeat();
    if (input.hit('KeyU')) this.suit.show(this.fleetApp);
    if (input.hit('KeyI')) this.suit.show(this.inventoryApp);
    if (input.hit('KeyN')) {
      const pv = this.player.vessel;
      if (this.player.aboard && pv.pilot && pv.pilot !== this.player) this.message(`${pv.name}'s nav computer: ${pv.pilot.label} has the controls`, 'caution');
      else if (this.player.aboard) pv.nav.toggle();
      else this.message('Nav computer: board a ship, or give orders from the Fleet app in your suit (U)', 'caution');
    }
    const v = this.piloted;
    if (v) {
      if (input.hit('KeyZ')) this.cycleAssist();
      if (input.hit('KeyY')) this.toggleClamp(v);
      if (input.hit('KeyG') && v.type.legs && !v.type.ground) { v.gearTarget = v.gearTarget > 0.5 ? 0 : 1; this.message(v.gearTarget ? 'Gear down' : 'Gear up'); this.audio.clunk(); }
      if (input.hit('KeyR')) this.toggleRamp(v);
      if (input.hit('KeyL') && v.type.key === 'shuttle') { v.visual.floodOn = !v.visual.floodOn; }
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
    if (!this.respawnInfo || this.loadHold) { // surveying: no measure yet, creep toward 10%
      this.loadProgress = 0.1 * (1 - Math.exp(-this.loadTimer / 2));
      this.screenHud.setLoading(this.loadText, this.loadProgress);
      return;
    }
    const pending = this.world.pendingNear();
    const space = this.loadMode === 'space';
    const terr = this.world.terrainOf(this.player.currentBody().id);
    const deepEnough = space || !terr || terr.deepest >= terr.maxLevel - 1;
    if (pending === 0 && deepEnough) this.settleTime += dt; else this.settleTime = 0;
    // progress: on the surface the terrain refines level by level under you
    // (later levels take longer: cubed to keep pace with the clock), then the
    // last tiles drain; in space only the tiles in view drain; then a settle
    const levels = space || !terr ? 1 : Math.min(1, terr.deepest / (terr.maxLevel - 1)) ** 3;
    if (deepEnough) this.loadPeak = Math.max(this.loadPeak, pending);
    const drain = !deepEnough ? 0 : (this.loadPeak ? 1 - pending / this.loadPeak : (this.loadTimer > 0.5 ? 1 : 0));
    const f = space || !terr ? 0.1 + 0.8 * drain : 0.1 + 0.5 * levels + 0.3 * drain;
    this.loadProgress = Math.max(this.loadProgress, Math.min(0.99, f + 0.1 * Math.min(1, this.settleTime / 0.4)));
    this.screenHud.setLoading(this.loadText, this.loadProgress);
    if ((this.settleTime > 0.4 && this.loadTimer > 1) || this.loadTimer > (space ? 10 : 25)) {
      this.state = 'playing';
      this.screenHud.setLoading(null);
      this.engine.adaptReset = true;
      this.loadMode = null;
      this.arrive();
    }
  }

  simulate(dtReal) {
    const warp = this.warp;
    let dt = dtReal * warp;
    for (const v of this.vessels) { const c = v.ctrl; c.fwd = c.strafe = c.lift = c.pitch = c.yaw = c.roll = 0; c.boost = c.brake = false; }
    // each player's input -> the controls of the craft they fly (before the
    // warp guard reads them); none of it while their suit's screen has them
    for (const p of this.players) {
      this.setCur(p);
      p._in = p.ui.suit.open ? this.blockedInput : p.input;
      p._mouse = p.ui.suit.open ? { dx: 0, dy: 0 } : p.input.mouse();
      const pv = this.piloted;
      if (!pv) continue;
      this.pilotControls(pv, dtReal, p._mouse, p._in);
      // nav computers fly their ships (any flight input from a pilot takes over)
      if (pv.nav.active) {
        const c = pv.ctrl;
        if (c.fwd || c.strafe || c.lift || c.roll || c.brake || pv.stick.length() > 0.35) pv.nav.cancel('off: manual control');
      }
    }
    this.setCur(null);
    // the simulated worlds: one a player is on or near (within half its radius) gets a finer sim
    if (this.worldSims && (this._wsT = (this._wsT || 0) + dtReal) > 2) {
      this._wsT = 0;
      const near = new Set();
      for (const p of this.players) {
        const v = p.vessel, b = v ? v.body : p.body;
        if (!b || !b.data || !b.terrain || (v && v.parent)) continue;
        const r = p.mode === 'surface' ? b.R : v ? v.pos.length() : p.ePos.length();
        if (r - b.R < 0.5 * b.R) near.add(b.data.id);
      }
      this.worldSims.tick(near);
    }
    for (const v of this.vessels) v.nav.update(dtReal);
    // warp guard: thrust input or atmosphere drops rails warp
    if (warp > 4) {
      const why = this.warpBlocker();
      const thrusting = this.vessels.some((v) => v.pilot && !v.dead && (v.ctrl.fwd || v.ctrl.lift || v.ctrl.strafe));
      if (why || thrusting) { this.setWarp(thrusting ? 0 : 2); dt = dtReal * this.warp; }
    }
    this.advanceVessels(dt);
    this.compressTravel(dtReal);
    for (const v of this.vessels) if (v.type.doors && !v.dead) v.updateDoors(dt);
    // big ships' sliding doors, for the players walking aboard (at walking pace, like them)
    for (const v of this.vessels) {
      if (!v.type.slideDoors || v.dead) continue;
      const walkers = this._walkers || (this._walkers = []);
      walkers.length = 0;
      for (const p of this.players) if (p.mode === 'ship' && p.vessel === v) walkers.push(p.sPos);
      v.updateSlideDoors(dtReal * Math.min(this.warp, 4), walkers);
    }
    this.items.update();
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
    for (const v of this.vessels) if (v.pilot && !v.dead) this.chooseReference(v);
    for (const p of this.players) { this.setCur(p); this.stepPlayer(p, dtReal); }
    this.setCur(null);
  }

  // A player's character. A spacewalker moves at orbital speed in the
  // inertial frame, and someone on foot may be falling beside a ship, so both
  // integrate exactly the step the world took (sub-stepped, one-shot keys
  // delivered once); aboard, frames are local and slow time is harmless.
  stepPlayer(p, dtReal) {
    const input = p._in || p.input, mouse = p._mouse || { dx: 0, dy: 0 };
    const quiet = p._quiet || (p._quiet = {
      down: (c) => (p._in || p.input).down(c), axis: (a, b) => (p._in || p.input).axis(a, b), hit: () => false,
      get buttons() { return 0; },
    });
    if (p.respawnT > 0) return; // (lost: back shortly)
    if (p.mode === 'eva' || (p.mode === 'surface' && this.warp <= 4)) {
      const pdt = dtReal * this.warp;
      const n = Math.max(1, Math.ceil(pdt / 0.02));
      for (let i = 0; i < n && (p.mode === 'eva' || p.mode === 'surface'); i++) p.update(pdt / n, i === 0 ? input : quiet, i === 0 ? mouse : { dx: 0, dy: 0 });
    } else if (p.mode !== 'seat') {
      // (stepping out converts against the vessel's end-of-frame state, so the
      // player is already level with the world's clock when they leave)
      p.update(Math.min(dtReal * Math.min(this.warp, 4), 0.05), input, mouse);
    } else p.update(dtReal, input, mouse);
    if (p.aboard && p.vessel.dead && !p.deathShown) this.onDeath(p.vessel.deathCause, p);
  }

  pilotControls(s, dt, mouse, input = this.input) {
    const c = s.ctrl;
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

  // Rotation while coasting on rails or carried by the FTL bubble. Time warp
  // takes steps of seconds, far longer than the rate damper's 0.18 s, so the
  // body rates move toward the commanded rates by at most what the thrusters
  // can do in the step and never past them (an explicit step overshot, and
  // any residual rate grew into a spin)
  rotateOnly(s, dt) {
    const w = s.angVel, L = s.limits;
    if (s.assist === 0) {
      const c = s.ctrl;
      w.x += c.pitch * L.alpha.x * dt; w.y += c.yaw * L.alpha.y * dt; w.z += c.roll * L.alpha.z * dt;
    } else {
      const tr = s.rateCommand(_v1, dt < 0.1);
      const step = (cur, want, a) => cur + THREE.MathUtils.clamp(want - cur, -a * dt, a * dt);
      w.set(step(w.x, tr.x, L.alpha.x), step(w.y, tr.y, L.alpha.y), step(w.z, tr.z, L.alpha.z));
    }
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
    // craft in a berth (the yacht, the pods) launch on any move order
    if (v.attached && v.type.launch && (v.pilot || v.auto) && v.wantsMove()) { this.launchCraft(v); return; }
    if (v.attached && !((v.pilot || v.auto) && v.wantsMove())) { v.holdAttached(); return; }
    const F = this._cf || (this._cf = new THREE.Vector3());
    const T = this._ct || (this._ct = new THREE.Vector3());
    v.computeControlLocal(h, F, T);
    v.stepLocal(h, F, T);
    v.tryLandLocal(h);
    if (!v.attached && !v.insideZone(v.zone, v.zone.exitMargin ?? 3)) {
      const host = v.parent;
      v.leaveParent();
      const into = this.rehome(v, host.parent);
      this.tell(v, into ? `Out of ${host.name} · ${into.name} · ${v.zone.name}` : `Clear of ${host.name}`, 'nav');
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
    // (a ship travelling faster than the clock coasts, its assist resting as in a
    // warp, until its pilot touches the thrusters)
    if (v._compress) { const c = v.ctrl; if (!(c.fwd || c.strafe || c.lift || c.brake)) return 'rails'; }
    if (v.pilot || v.auto) return (!v.wantsForce() && v.assist !== 2) ? 'rails' : 'physics';
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
    // what each craft weighs with everything attached to it (a lifter with a
    // container with a cart in it)
    const sum = (v) => { let m = v.mass; for (const c of v.children) if (c.attached && !c.dead) m += sum(c); return (v.effMass = m); };
    for (const v of this.vessels) if (!v.dead) sum(v);
    kids.sort((a, b) => a.depth - b.depth);
    let n = 1, physics = false;
    for (const v of roots) {
      v._mode = this.rootMode(v, highWarp);
      if (v._mode === 'rails') { if (!v.rails) v.enterRails(); n = Math.max(n, this.railSteps(v, dt)); }
      else if (v._mode !== 'ftl') v.rails = false;
      if (v._mode === 'physics') physics = true;
    }
    for (const v of kids) if (!v.attached || ((v.pilot || v.auto) && v.wantsMove())) physics = true;
    // a piloted ship can leave its legs or its rails at any moment: its
    // contacts need fine steps from the first one (they are stiff springs)
    if (physics || (this.vessels.some((v) => (v.pilot || v.auto) && !v.dead) && !highWarp)) n = Math.max(n, Math.min(64, Math.ceil(dt / PHYS_DT)));
    n = Math.min(400, n);
    const h = dt / n;
    for (let i = 0; i < n; i++) {
      this.t += h;
      this.universe.update(this.t);
      let abort = false;
      for (const v of roots) {
        if (v.dead) continue;
        if (v._mode === 'landed') { if (v.pilot || v.auto) this.stepVessel(v, h); else v.syncLanded(); }
        else if (v._mode === 'rails') abort = this.railStep(v, h) || abort;
        else if (v._mode === 'physics') {
          this.stepVessel(v, h);
          if (v.checkSOI()) this.tell(v, `Entered ${v.body.data.name}'s sphere of influence`, 'nav');
        }
        v._stepT = this.t; // (now at this step's time: see Ship.contactsVessels)
      }
      for (const v of kids) if (!v.dead && v.parent) this.stepChild(v, h);
      // a craft that left its host in this step (launched from a berth, out
      // of a bay's mouth) flies free from the next one: it must not sit out
      // the rest of the frame while the clock (and its old host) moves on
      for (let k = kids.length - 1; k >= 0; k--) {
        const v = kids[k];
        if (v.parent || v.dead) continue;
        kids.splice(k, 1);
        v._mode = this.rootMode(v, highWarp);
        if (v._mode === 'rails' && !v.rails) v.enterRails();
        roots.push(v);
      }
      if (abort && highWarp) break;
    }
    for (const v of roots) if (v._mode === 'rails' && !v.dead) { v.thrustLocal.set(0, 0, 0); v.coastEnv(); }
  }

  // one analytic step; returns true when the vessel has to leave its rails
  railStep(v, h) {
    v.railsState(this.t, v.pos, v.vel);
    this.rotateOnly(v, h);
    if (v.checkSOI()) this.tell(v, `Entered ${v.body.data.name}'s sphere of influence`, 'nav');
    const alt = v.altitude;
    if ((v.body.atm && alt < v.body.atmHeight) || alt < v.safeAltitude()) {
      v.rails = false;
      v._mode = 'physics';
      if (this.warp > 1) {
        this.setWarp(0);
        const air = v.body.atm && alt < v.body.atmHeight;
        this.tell(v, `${air ? 'Atmospheric entry' : 'Surface proximity'}: warp stopped`, 'caution', `${v.name} ${air ? 'entering the atmosphere' : 'near the surface'}: warp stopped`);
      }
      return true;
    }
    const c = v.ctrl, input = c.fwd || c.strafe || c.lift || c.brake;
    if (v.pilot && this.warp <= 4 && (v._compress ? input : v.wantsForce())) { v.rails = false; v._mode = 'physics'; return true; }
    return false;
  }

  // Craft that come inside another's volume (a bay, a container's hold) join
  // its coordinate space. Hosts are in the same frame as the craft: both free
  // on the same body, or both inside the same host (a cart in the bay driving
  // into a container standing there).
  checkZones() {
    for (const v of this.vessels) {
      if (v.dead || v.big || v.attached || v.landed || (v.ftl && v.ftl.state === 'cruise')) continue;
      for (const h of this.vessels) {
        if (h === v || h.dead || !h.type.zones || h.parent !== v.parent || (!v.parent && h.body !== v.body)) continue;
        let local;
        if (v.parent) {
          if (h.lpos.distanceToSquared(v.lpos) > Math.pow(h.type.radius + 60, 2)) continue;
          local = _v1.copy(v.lpos).sub(h.lpos).applyQuaternion(_q1.copy(h.lquat).invert());
        } else {
          if (h.pos.distanceToSquared(v.pos) > Math.pow(h.type.radius + 60, 2)) continue;
          local = h.bodyToLocal(v.pos, _v1);
        }
        const z = h.type.zones.find((zz) => insideBox(zz, local) && this.zoneAdmits(h, zz, v));
        if (z) {
          if (v.parent) v.leaveParent();
          v.enterParent(h, z);
          this.tell(v, z.kind === 'hold' ? `Into ${h.name}` : `${z.kind === 'hangar' ? 'Entering' : 'Over'} ${h.name} · ${z.name} · artificial gravity`, 'nav');
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
      if (best) this.tell(pv, `Flight assist referenced to ${best.name}`, 'nav');
      pv.refVessel = best;
    }
  }

  // ------------------------------------------------------------------ camera

  updateCamera(dt) {
    const p = this.player;
    if (this.debugFree && p === this.players[0]) { this.freecam.update(dt, dt, this.input); return; }
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
      // above and behind, the craft low in the frame and the way ahead in
      // view; the camera lags a turn a little, catching up faster the further
      // round it falls (it must never end up out in front)
      const s = pv;
      const R = s.type.radius;
      const wp = s.getWorldPos(_v1);
      const lag = this.chaseQuat.angleTo(s.quat);
      this.chaseQuat.slerp(s.quat, 1 - Math.exp(-dt * (lag > 0.8 ? 14 : 5)));
      const off = _v2.set(0, R * 0.62, R * 2.1).applyQuaternion(this.chaseQuat);
      this.camPos.copy(wp).add(off);
      const aim = _v3.copy(wp).addScaledVector(_q1Dir(this.chaseQuat, 0, 0, -1), R * 0.7).addScaledVector(_q1Dir(this.chaseQuat, 0, 1, 0), R * 0.2);
      const m = new THREE.Matrix4().lookAt(this.camPos, aim, _v2.set(0, 1, 0).applyQuaternion(this.chaseQuat));
      this.camQuat.setFromRotationMatrix(m);
      return;
    }
    const s = p.aboard ? p.vessel : p.ship;
    this.chaseQuat.copy(s.quat);
    p.computeCamera(this.camPos, this.camQuat);
    // shake: thrust, re-entry, landing impact
    const shake = Math.min(1, s.heatGlow * 0.5 + (p.mode === 'seat' ? (s.limits.main > 0 ? s.thrustLocal.length() / s.limits.main : 0) * (s.big ? 0.05 : 0.15) + s.env.dynPressure / 4e5 : 0)) + (s.ftl.state === 'cruise' ? 0.05 : 0);
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
    if (c && c.state !== 'closed') (on ? c.suspend() : c.resume()).catch(() => {}); // (a game being replaced closes it)
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
    if (!rig.inside && !this.inCabin()) E += 0.5 * L.sunIntensity * lum(L.sunColor) + lum(L.skyColor);
    this.engine.meterRef = Math.max(1e-7, 0.18 * E / Math.PI);
    // from a pilot seat the world outside sets the exposure, not the cockpit
    this.engine.meterNearCut = !this.screenPass && this.player.mode === 'seat' && this.camMode === 'first' ? 3.5 : 0;
  }

  // walking in a closed room of a small craft (the yacht's salon, the
  // tank's compartment with its ramp up): lit by its own lamps, not the sun
  inCabin() {
    const p = this.player, v = p.vessel;
    if (this.screenPass || p.mode !== 'ship' || !v || v.big || !v.type.lights || !p._room || !v.interior.openSides) return false;
    return v.interior.openSides(p._room).length === 0;
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
    if (this.state === 'playing') this.tell(s, 'Touchdown', 'ok');
  }
  onDocked(s) {
    if (this.state !== 'playing') return;
    this.tell(s, `Docked · ${s.parent.name} · ${s.zone.name}`, 'ok');
    this.audio.clunk();
  }
  onUndock(s) {
    if (this.state === 'playing') this.tell(s, `Released from ${s.parent.name}`, 'nav');
  }
  onSoiChange(s, from, to) { if (this.state === 'playing') this.tell(s, `Now orbiting ${to.data.name}`, 'nav'); }
  onModeChange(mode) {
    if (mode === 'seat') {
      const p = this.player, v = p.vessel;
      const seat = v.type.seats[p.seat] || v.type.seats[0];
      if (v.pilot !== p) this.message(`${seat ? seat.label : 'Seat'} · ${v.pilot ? `${v.pilot.label} is flying ${v.name}` : `riding along: the ${(v.type.seats.find((x) => x.pilot) || { label: 'pilot seat' }).label.toLowerCase()} flies ${v.name}`} · look around freely · F to stand`, 'nav');
      else if (v.big) this.message(`${v.name} command seat: ${v.type.className} · W/S thrust · Z flight assist · J FTL · P back to your last seat`, 'nav');
      else this.message('Pilot seat: W/S thrust · Space/C lift · Z flight assist · G gear · J FTL', 'nav');
    }
    if (mode === 'eva') this.message('EVA: WASD/Space/C jetpack · X stabilise · Q/E roll · P back to your seat', 'nav');
  }
  // a white / coloured flash in the views of the players watching v
  flashFor(v, r, g, b) {
    for (const p of this.players) if (this.focusOf(p) === v || (p.aboard && p.vessel.root === v.root)) p.view.flash.set(r, g, b);
  }
  onShipDamage(s, dmg, why) {
    if (dmg > 0.02) this.tell(s, `Hull damage ${(dmg * 100).toFixed(0)}%`, 'warn');
    for (const p of this.players) if (this.focusOf(p) === s) p.view.flash.set(0.3, 0.05, 0.02);
  }
  onShipDestroyed(s, cause) {
    for (const p of this.players) {
      if (p.aboard && (p.vessel === s || p.vessel.dead)) this.onDeath(cause, p);
      else p.ui.hud.message(`${s.name} destroyed: ${cause}`, 'warn');
    }
  }

  // Lost with the ship. With someone still playing you're back beside them a
  // few seconds later (your shuttle parked by theirs); alone, player 1 gets
  // the restart card (and anyone else lost comes back beside them after)
  onDeath(cause, p = this.player) {
    if (p.deathShown) return;
    p.deathShown = true;
    this.setWarp(0);
    p.view.flash.set(2, 1.2, 0.8);
    this.audio.boom();
    if (p.mode === 'seat') p.releaseControls(p.vessel);
    const partner = this.players.find((q) => q !== p && !q.deathShown && !(q.aboard && q.vessel.dead));
    if (partner || p !== this.players[0]) {
      p.regroupTo = partner || this.players[0];
      p.ui.hud.message(`Lost: ${cause} · back beside ${p.regroupTo.label} in a moment`, 'warn');
      p.respawnT = 3;
      return;
    }
    this.players[0].ui.hud.showDeath(cause, () => this.respawn());
  }

  // player 1 starts again at the landing site (or their chosen orbit)
  respawn() {
    this.setCur(null);
    this.players[0].deathShown = false;
    for (const v of this.vessels) v.nav.cancel(null);
    const ri = this.respawnInfo;
    const b = ri.body;
    for (const v of this.vessels) { v.ftl.state = 'idle'; v.ftl.speed = 0; }
    this.landShipAt(b, ri.dir, null);
    // lost big ships are replaced on their old orbits
    if (this.tender && this.tender.dead) this.placeInOrbit(this.tender, b, lockRadius(b) - b.R + 90000, 0.35);
    if (this.carrier && this.carrier.dead) { this.placeInOrbit(this.carrier, b, lockRadius(b) - b.R + 280000, -0.45); this.dockCarried(); }
    this.ship.rampTarget = 1; this.ship.ramp = 1;
    const p = this.players[0];
    p.vessel = this.ship;
    p.mode = 'ship';
    p.sPos.set(0, 0, 2);
    p.sVel.set(0, 0, 0);
    p.heading.set(0, 0, -1);
    p.pitch = 0;
    p.body = b;
    p.sitDown(0, this.ship);
    this.beginLoading('surface', `Descending to ${b.data.name}`, () => this.message(`${b.data.name}: ${b.data.label}`, 'nav'));
    // started in orbit: begin again there
    if (this.startChoice && this.startChoice.startsWith('orbit:')) this.applyStart(this.startChoice);
    for (const q of this.players.slice(1)) if (q.deathShown) this.regroup(q);
  }

  dispose() {
    // (other players' HUD and suit copies, and their controllers)
    for (const p of this.players.slice(1)) { p.ui.root.remove(); p.ui.suitEl.remove(); if (p.input.dispose) p.input.dispose(); }
    this.pool.dispose();
    if (this.worldSims) this.worldSims.dispose();
    this.audio.dispose && this.audio.dispose();
  }
}

export { U };
