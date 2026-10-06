// Test scenes: jump straight to the situations being tuned (lighting,
// exposure, the carrier, jumping out of a falling ship), from the pause menu.
// The same spots the browser test scripts use, as buttons.

import * as THREE from 'three';
import { boardHorizon } from '../sim/horizonFleet.js';
import { boardExpedition } from '../sim/expeditionFleet.js';
import { boardPioneer } from '../sim/pioneerFleet.js';

// Where on the starting planet the sun stands elevDeg above the horizon (on
// the great circle through the landing site), and the way to face it.
function sunSpot(g, elevDeg, azOffDeg = 0) {
  const b = g.startBody;
  const sunF = g.universe.star.pos.clone().sub(b.pos).normalize().applyQuaternion(b.qInv);
  const site = g.startDir.clone().normalize();
  const axis = sunF.clone().cross(site);
  if (axis.lengthSq() < 1e-8) axis.set(0, 1, 0).cross(sunF);
  axis.normalize();
  const dirF = sunF.clone().applyAxisAngle(axis, (90 - elevDeg) * Math.PI / 180);
  const toSun = sunF.clone().addScaledVector(dirF, -sunF.dot(dirF)).normalize();
  if (azOffDeg) toSun.applyAxisAngle(dirF, azOffDeg * Math.PI / 180);
  return { b, dirF, toSun };
}

function leaveVessel(g) {
  const p = g.player;
  if (p.vessel) p.vessel.pilotPresent = false;
  p.vessel = null;
}

// hold the world while the terrain under the new spot streams in
function loadAt(g, b, dirF) {
  g.respawnInfo = { body: b, dir: dirF.clone() };
  g.beginLoading('surface', `Moving to the test spot on ${b.data.name}`);
}

function standFacingSun(g, elevDeg, azOffDeg, pitch) {
  const { b, dirF, toSun } = sunSpot(g, elevDeg, azOffDeg);
  leaveVessel(g);
  g.player.placeOnSurface(b, dirF, toSun);
  g.player.pitch = pitch;
  loadAt(g, b, dirF);
}

export const TEST_SCENES = [
  {label:'Halyard: family launch',note:'Seven berths, EVA lock and deployable two-person runabout',run:g=>{const v=g.tenderYacht;g.player.releaseControls(g.player.vessel);g.player.placeAboard(v,new THREE.Vector3(0,0,-9),new THREE.Vector3(0,0,-1));}},
  ...['meridian', 'confluence', 'neptune3', 'cradle', 'shorebird', 'lark', 'drift'].map(key => ({
    label: `Horizon: ${key === 'neptune3' ? 'Neptune 3' : key[0].toUpperCase() + key.slice(1)}`,
    note: 'Civilian field-drive fleet · furnished interiors · artificial gravity · F airlocks / seats · R ramps · Y cargo',
    run: g => boardHorizon(g, key),
  })),
  ...['longreach', 'crosscurrent', 'hearth', 'porter', 'kestrel', 'moth', 'skimmer'].map(key => ({
    label: `Expedition: ${key[0].toUpperCase() + key.slice(1)}`,
    note: 'Integrated exploration fleet · freefall · F airlocks / seats · R ramps · Y cargo · Skimmer needs atmosphere',
    run: g => boardExpedition(g, key),
  })),
  ...['caravan', 'anchor', 'nomad', 'gantry', 'hopper', 'firefly', 'trail'].map(key => ({
    label: `Pioneer: ${key[0].toUpperCase() + key.slice(1)}`,
    note: 'Early exploration fleet · no artificial gravity · F airlocks/seats · Space/C freefall, X brakes · Y cargo clamp',
    run: g => boardPioneer(g, key),
  })),
  {
    label: 'Sun 37° up, facing it',
    note: 'Morning light into the sun: the ground should set the exposure, the sky may blow out a little',
    run: (g) => standFacingSun(g, 37, 0, 0.15),
  },
  {
    label: 'Sun 37° up, behind you',
    note: 'Front-lit ground',
    run: (g) => standFacingSun(g, 37, 180, -0.05),
  },
  {
    label: 'Low sun, 6° up',
    note: 'Long shadows, reddened light',
    run: (g) => standFacingSun(g, 6, 40, 0.05),
  },
  {
    label: 'Carrier flight bay',
    note: 'Bastion\'s starboard bay beside the Wayfarer shuttle (your yacht in its recess under the bow): Tab for routes, Space to jetpack',
    run: (g) => g.startAboard(),
  },
  {
    label: 'Cargo run: the cart',
    note: 'In the bay cart in Bastion\'s starboard bay, the container\'s ramp ahead: drive in (W), park, F to get out',
    run: (g) => {
      g.startAboard();
      g.parkCraft();
      g.player.sitDown(0, g.cart);
    },
  },
  {
    label: 'Cargo run: the lifter',
    note: 'In the lifter on its pad; the container is a pad aft and inboard: lift (Space), hover over it, settle, Y clamps',
    run: (g) => {
      g.startAboard();
      g.parkCraft();
      g.player.sitDown(0, g.lifter);
    },
  },
  {
    label: 'Carrier bridge',
    note: 'Standing behind the command seat',
    run: (g) => {
      g.startAboard();
      const st = g.carrier.type.seats[0].stand;
      g.player.placeAboard(g.carrier, new THREE.Vector3(st[0], st[1], st[2] + 1.5), new THREE.Vector3(0, 0, -1));
    },
  },
  {
    label: 'Falling shuttle, ramp open',
    note: '3.5 km up, dropping at 110 m/s with flight assist off: walk aft down the ramp and jump',
    run: (g) => {
      const { b, dirF, toSun } = sunSpot(g, 40, 90);
      const s = g.ship, p = g.player;
      if (s.parent) s.leaveParent();
      leaveVessel(g);
      s.body = b; s.dead = false; s.hull = 1; s.landed = false; s.rails = false;
      const gh = Math.max(0, b.groundHeight(dirF));
      const pos = dirF.clone().multiplyScalar(b.R + gh + 3500).applyQuaternion(b.q);
      const up = pos.clone().normalize();
      const nose = toSun.clone().applyQuaternion(b.q).addScaledVector(up, 0).normalize();
      const air = b.omega.clone().cross(pos);
      s.pos.copy(pos);
      s.vel.copy(nose).multiplyScalar(60).addScaledVector(up, -110).add(air);
      const right = nose.clone().cross(up).normalize();
      s.quat.setFromRotationMatrix(new THREE.Matrix4().makeBasis(right, up, nose.clone().negate()));
      s.angVel.set(0, 0, 0);
      s.assist = 0;
      s.gearTarget = 0; s.gear = 0;
      s.rampTarget = 1; s.ramp = 1;
      s.targetVel.copy(s.vel); s.targetFrame = 'inertial';
      p.placeAboard(s, new THREE.Vector3(0, 0, 5.2), new THREE.Vector3(0, 0, 1));
      p.lastSeat = { vessel: s, seat: 0 };
      loadAt(g, b, dirF);
    },
  },
  {
    label: 'Tender docking deck',
    note: 'On Halyard\'s open deck in orbit: jetpack up off the deck into a spacewalk',
    run: (g) => {
      const t = g.tender;
      if (!t || t.dead) return;
      leaveVessel(g);
      g.player.placeAboard(t, new THREE.Vector3(0, 6, -28), new THREE.Vector3(0, 0, -1));
      g.beginLoading('space', 'Moving to the test spot');
    },
  },
  {
    label: 'Low orbit, day side',
    note: 'Seated, 150 km up over the sunlit side: exposure in space',
    run: (g) => {
      const b = g.startBody, s = g.ship, p = g.player;
      if (s.parent) s.leaveParent();
      leaveVessel(g);
      const sunW = g.universe.star.pos.clone().sub(b.pos).normalize();
      const radial = sunW.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0).cross(sunW).normalize(), 0.9);
      const r = b.R + 150000;
      s.body = b; s.dead = false; s.hull = 1; s.landed = false; s.rails = false;
      s.pos.copy(radial).multiplyScalar(r);
      const tang = new THREE.Vector3(0, 1, 0).cross(radial).normalize();
      s.vel.copy(tang).multiplyScalar(Math.sqrt(b.GM / r));
      // nose along the track, tipped down to look at the ground ahead
      const nose = tang.clone().addScaledVector(radial, -0.45).normalize();
      const up = radial.clone().addScaledVector(nose, -radial.dot(nose)).normalize();
      s.quat.setFromRotationMatrix(new THREE.Matrix4().makeBasis(nose.clone().cross(up).normalize(), up, nose.clone().negate()));
      s.angVel.set(0, 0, 0);
      s.assist = 2;
      s.gearTarget = 0; s.gear = 0; s.rampTarget = 0; s.ramp = 0;
      s.targetVel.copy(s.vel); s.targetFrame = 'inertial';
      p.sitDown(0, s);
      p.body = b;
      g.target = b;
      g.beginLoading('space', 'Moving to the test spot');
    },
  },
];
