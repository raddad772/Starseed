// Vessel classes: mass, thrusters, colliders, docking zones, walkable layout
// and seats, all in each vessel's local frame (+X right, +Y up, -Z forward,
// metres). The render models are built from these same numbers, so the hull
// you see is the hull you bump into.
//
// Zones are volumes of a big ship that take smaller craft into its own
// coordinate space: inside one the craft flies (and lands) under the ship's
// artificial gravity, carried along with the ship. Rooms are where a person
// can walk; `open` sides lead out into space, `capture` rooms pull a drifting
// spacewalker onto their floor.

import { HULL_PROBES, SHIP_HULL_BOXES, SHIP_INTERIOR } from '../render/shipModel.js';
import { BASTION } from './layouts/bastion.js';

const box = (x0, y0, z0, x1, y1, z1) => ({ min: [x0, y0, z0], max: [x1, y1, z1] });
const G = 9.81;

// corners and edge midpoints of a bounding box (terrain contact = breakup)
function hullCorners(x0, y0, z0, x1, y1, z1) {
  const out = [];
  for (const x of [x0, (x0 + x1) / 2, x1]) for (const y of [y0, y1]) for (const z of [z0, (z0 + z1) / 2, z1]) out.push([x, y, z]);
  return out;
}

export const SHUTTLE = {
  key: 'shuttle',
  className: 'Wayfarer-class shuttle',
  big: false,
  mass: 42000,
  I: [2.6e6, 2.9e6, 0.55e6],
  thrust: { main: 12.0, retro: 2.0, belly: 7.0, down: 1.2, lateral: 2.0 }, // in g
  alpha: [1.4, 1.1, 2.2],
  rate: [1.1, 0.85, 1.7],
  hullRating: 100,
  legs: true, legLength: 1.75, ramp: true,
  aero: { cd: [62, 120, 7.5], wing: 48 },
  probes: HULL_PROBES,
  hullBoxes: SHIP_HULL_BOXES,
  radius: 16,
  seats: [{ pilot: true, pos: SHIP_INTERIOR.seatPos[0].toArray(), eye: SHIP_INTERIOR.pilotEye.toArray(), stand: [0, 0.25, -8.4], heading: [0, 0, 1], label: 'Pilot seat' }],
};

// ---------------------------------------------------------------- Halyard-class tender
// 330 m long. Two docking pads on a dorsal deck; lifts down to a spine
// corridor that runs forward to the bridge in the command module.
export const TENDER = {
  key: 'tender',
  className: 'Halyard-class tender',
  big: true,
  mass: 2.4e7,
  I: [2.2e11, 2.3e11, 5.0e9],
  thrust: { main: 0.8, retro: 0.25, belly: 0.3, down: 0.15, lateral: 0.1 },
  alpha: [0.04, 0.04, 0.08],
  rate: [0.08, 0.08, 0.12],
  hullRating: 40,
  maxDynPressure: 4000, // Pa: an open truss is torn apart by air
  aero: { cd: [2600, 9000, 900], wing: 0 },
  radius: 200,
  colliders: [
    box(-7, -8, -112, 7, 4, 122),          // spine
    box(-16, -12, -152, 16, 9, -112),      // command module
    box(-11, 9, -150, 11, 15.5, -126),     // bridge house
    box(-20, -2, -92, 20, 6, 12),          // docking deck
    box(14.5, 6, -67.5, 18.5, 9.5, -62.5), // pad 1 lift kiosk
    box(14.5, 6, -16.5, 18.5, 9.5, -11.5), // pad 2 lift kiosk
    box(-20, -16, 122, 20, 12, 165),       // drive section
    ...[35, 65, 95].flatMap((c) => [box(7.5, -12.5, c - 13, 20.5, 0.5, c + 13), box(-20.5, -12.5, c - 13, -7.5, 0.5, c + 13)]), // cargo pods
    box(20, -0.4, 128, 62, 0.4, 160),      // radiators
    box(-62, -0.4, 128, -20, 0.4, 160),
  ],
  zones: [
    { name: 'Pad 1', kind: 'pad', min: [-18, 6, -90], max: [18, 50, -40], gravity: G, pressure: 0, pad: [0, 6, -65] },
    { name: 'Pad 2', kind: 'pad', min: [-18, 6, -38], max: [18, 50, 10], gravity: G, pressure: 0, pad: [0, 6, -14] },
  ],
  rooms: [
    { name: 'Docking deck', min: [-19.6, 6, -91.6], max: [19.6, 12, 11.6], open: ['-x', '+x', '-z', '+z', '+y'], capture: true, vacuum: true },
    { name: 'Spine corridor', min: [-2, -1, -140], max: [2, 2.6, 10] },
    { name: 'Pad 1 lift lobby', min: [1, -1, -71], max: [9, 2.6, -60] },
    { name: 'Pad 2 lift lobby', min: [1, -1, -20], max: [9, 2.6, -9] },
    { name: 'Bridge', min: [-10, 9.5, -149], max: [10, 14.5, -127] },
  ],
  solids: [
    box(14.5, 6, -67.5, 18.5, 9.5, -62.5),
    box(14.5, 6, -16.5, 18.5, 9.5, -11.5),
    box(-7, 9.5, -148.6, 7, 10.6, -146.4), // bridge console
  ],
  lifts: [
    { a: [13.2, 6, -65], b: [7.8, -1, -65.5], label: 'Pad 1 lift' },
    { a: [13.2, 6, -14], b: [7.8, -1, -14.5], label: 'Pad 2 lift' },
    { a: [0, -1, -138.6], b: [0, 9.5, -128.4], label: 'Bridge lift' },
  ],
  seats: [{ pilot: true, pos: [0, 9.5, -142], eye: [0, 10.85, -142.3], stand: [0, 9.5, -139.4], heading: [0, 0, 1], label: 'Command seat' }],
  lights: [
    { pos: [0, 24, -65], color: 0xdfe9ff, intensity: 160, range: 80 },
    { pos: [0, 24, -14], color: 0xdfe9ff, intensity: 160, range: 80 },
    { pos: [0, 2.4, -110], color: 0xffe2c4, intensity: 7, range: 26 },
    { pos: [0, 2.4, -60], color: 0xffe2c4, intensity: 7, range: 26 },
    { pos: [0, 2.4, -10], color: 0xffe2c4, intensity: 7, range: 26 },
    { pos: [5, 2.4, -65.5], color: 0xffe2c4, intensity: 5, range: 14 },
    { pos: [5, 2.4, -14.5], color: 0xffe2c4, intensity: 5, range: 14 },
    { pos: [0, 14, -138], color: 0xb8dcff, intensity: 16, range: 30 },
  ],
  engines: [[-11, -6, 180, 6.5], [11, -6, 180, 6.5], [0, 6, 180, 6.5]],
  probes: [...hullCorners(-20, -16, -152, 20, 15.5, 180), [62, 0, 144], [-62, 0, 144]],
};

// ---------------------------------------------------------------- Bastion-class carrier
// 900 m, laid out like a naval ship (bridge, astrogation, quarters, medical,
// engineering...) with two flight bays open at the bow end. Its rooms, doors,
// lifts, bays and hull all come from src/sim/layouts/bastion.js, the same data
// the Blender build models it from (assets/models/bastion.glb).
// A doorway's sliding door (Star Trek style): the axis you walk through it
// along, the plane its two leaves close in (between the two rooms' walls, so
// they slide into the wall), the opening along the wall and its height
function slideDoor(d, rooms) {
  const ra = rooms.find((r) => r.id === d.rooms[0]), rb = rooms.find((r) => r.id === d.rooms[1]);
  const crosses = (r, ax) => !!r && [r.min[ax], r.max[ax]].some((pl) => d.min[ax] - 0.01 <= pl && pl <= d.max[ax] + 0.01);
  const longX = (d.max[0] - d.min[0]) >= (d.max[2] - d.min[2]);
  const ax = crosses(ra, 0) && !crosses(ra, 2) ? 0 : (crosses(ra, 2) && !crosses(ra, 0) ? 2 : (longX ? 0 : 2));
  let plane = (d.min[ax] + d.max[ax]) / 2;
  if (ra && rb) {
    const aLow = (ra.min[ax] + ra.max[ax]) < (rb.min[ax] + rb.max[ax]);
    const wa = aLow ? ra.max[ax] : ra.min[ax], wb = aLow ? rb.min[ax] : rb.max[ax];
    plane = Math.min(d.max[ax], Math.max(d.min[ax], (wa + wb) / 2));
  }
  const ua = ax === 0 ? 2 : 0;
  return { id: d.id, rooms: d.rooms, axis: ax === 0 ? 'x' : 'z', plane, u0: d.min[ua], u1: d.max[ua], y0: d.min[1], y1: d.max[1] };
}

export const CARRIER = (() => {
  const L = BASTION;
  // doorways are walkable boxes of their own (overlapping both rooms)
  const doorRooms = L.doors.map((d) => ({ id: d.id, name: 'Doorway', deck: null, type: 'door', min: d.min, max: d.max }));
  const H = L.hull;
  const e = H.engines;
  return {
    key: 'carrier',
    className: 'Bastion-class carrier',
    big: true,
    layout: L,
    model: 'assets/models/bastion.glb',
    mass: 2.4e8,
    I: [1.6e13, 1.7e13, 1.8e12],
    thrust: { main: 0.12, retro: 0.04, belly: 0.03, down: 0.03, lateral: 0.02 },
    alpha: [0.004, 0.004, 0.01],
    rate: [0.02, 0.02, 0.03],
    hullRating: 20,
    maxDynPressure: 2500,
    aero: { cd: [5.4e4, 8e4, 1.5e4], wing: 0 },
    radius: 480,
    colliders: L.colliders,
    zones: L.bays,
    rooms: [...L.rooms, ...doorRooms],
    // every doorway has a sliding door: world state (v.doors), opened by anyone near
    slideDoors: L.doors.map((d) => slideDoor(d, L.rooms)),
    solids: L.solids,
    lifts: L.lifts,
    seats: L.seats,
    lights: L.lights,
    // hatches to the craft it carries: board from inside the carrier
    hatches: [
      { key: 'yacht', label: L.yacht.label, pos: L.yacht.hatch },
      ...L.pods.map((p) => ({ key: p.id, label: p.label, pos: p.hatch })),
    ],
    engines: [...e.xs.flatMap((x) => e.ys.map((y) => [x, y, e.z[1], e.radius])),
      ...[-1, 1].flatMap((s) => [-8, 8].map((dx) => [s * 100 + dx, 10, H.podEngines.z[1] + 8, 5]))],
    probes: hullCorners(-140, -36, -450, 140, 63, 446),
  };
})();

// ---------------------------------------------------------------- craft carried by the carrier
// The captain's yacht (46 m, in a recess under the carrier's forward hull) and
// the escape pods (6 m, in tubes in its flanks). You sit in them rather than
// walk about; their models come from the carrier's file.
const boxCorners = (x0, y0, z0, x1, y1, z1) => hullCorners(x0, y0, z0, x1, y1, z1);
export const YACHT = {
  key: 'yacht', className: "Captain's yacht", big: false, seatOnly: true,
  model: CARRIER.model, template: 'yacht',
  mass: 60000, I: [4.0e6, 4.5e6, 1.0e6],
  thrust: { main: 9.0, retro: 2.0, belly: 5.0, down: 1.2, lateral: 2.0 },
  alpha: [1.2, 1.0, 2.0], rate: [1.0, 0.8, 1.5],
  hullRating: 80,
  legs: true, legLength: 1.6, legAttach: [[-6, -4.5, -12], [6, -4.5, -12], [-6, -4.5, 14], [6, -4.5, 14]],
  aero: { cd: [60, 140, 8], wing: 40 },
  probes: boxCorners(-9, -4.5, -23, 9, 4.5, 23),
  radius: 24,
  // walk-in: cockpit, salon, aft cabin. Docked under the carrier you come and
  // go by the hatch overhead (homeHatch, under it in the salon); landed, by
  // the port airlock (F from the ground under it climbs in)
  rooms: [
    { id: 'cockpit', name: 'Cockpit', type: 'cockpit', min: [-3.2, -2.0, -15.5], max: [3.2, 1.9, -8.5] },
    { id: 'salon', name: 'Salon', type: 'lounge', min: [-6, -2.5, -8.5], max: [6, 2.6, 9.5] },
    { id: 'cabin', name: "Captain's cabin", type: 'cabin', min: [-6, -2.5, 9.5], max: [6, 2.6, 17.5] },
    { id: 'door-fwd', name: 'Doorway', type: 'door', min: [-1, -2.5, -9.3], max: [1, 1.5, -7.7] },
    { id: 'door-aft', name: 'Doorway', type: 'door', min: [-1, -2.5, 8.7], max: [1, 1.5, 10.3] },
    // (it reaches 1 m into the salon: the two must overlap by more than a body's width to walk between them)
    { id: 'airlock', name: 'Airlock', type: 'door', min: [-9.4, -2.5, -1.0], max: [-5.0, 0.2, 1.0], open: ['-x'], exitTo: [-10.5, -5.8, 0], whenFree: true },
  ],
  entries: [{ label: 'airlock', outside: [-10.2, -5.8, 0], inside: [-7.4, -2.5, 0], heading: [1, 0, 0], whenFree: true }],
  homeHatch: [0, -2.5, -4], // (under the hatch to the carrier's yacht dock)
  solids: [
    { kind: 'console', ...box(-2.8, -2.0, -15.5, 2.8, -1.0, -14.8) },
    // (the port bench in two, either side of the airlock's doorway)
    { kind: 'bench', ...box(-5.9, -2.5, -6, -4.6, -1.9, -1.4) }, { kind: 'bench', ...box(-5.9, -2.5, 1.4, -4.6, -1.9, 4) },
    { kind: 'bench', ...box(4.6, -2.5, -6, 5.9, -1.9, 4) },
    { kind: 'table', ...box(-1.2, -2.5, -1.5, 1.2, -1.75, 1.5) },
    { kind: 'bed', ...box(-2, -2.5, 13, 2, -1.9, 17.4) },
  ],
  lights: [{ pos: [0, 2.4, -2], color: 0xffe2c4, intensity: 5, range: 14 }, { pos: [0, 2.4, 13], color: 0xffe2c4, intensity: 3, range: 9 }, { pos: [0, 1.7, -11.5], color: 0xb8dcff, intensity: 3, range: 7 }],
  seats: [{ pilot: true, pos: [0, -2.0, -13.4], eye: [0, -0.75, -13.8], stand: [0, -2.0, -11.6], heading: [0, 0, 1], label: 'Pilot seat' }],
  launch: { dir: [0, -1, 0], speed: 6, clear: [0, -8.5, 0] }, // (its roof sits 7 m up in the recess: out 1.5 m clear of the hull)
};
export const POD = {
  key: 'pod', className: 'Escape pod', big: false, seatOnly: true, ftl: false,
  unlisted: true, // (left out of ship lists and markers unless shown from the quick menu)
  model: CARRIER.model, template: 'pod', templateTurn: Math.PI / 2, // (modelled nose along +x)
  mass: 3000, I: [6000, 6000, 3000],
  thrust: { main: 3.0, retro: 1.0, belly: 2.5, down: 0.5, lateral: 1.0 },
  alpha: [1.0, 1.0, 1.5], rate: [0.8, 0.8, 1.2],
  hullRating: 120,
  legs: true, legLength: 0.8, legAttach: [[-1.1, -1.5, -1.2], [1.1, -1.5, -1.2], [-1.1, -1.5, 1.6], [1.1, -1.5, 1.6]],
  aero: { cd: [4, 12, 3], wing: 0 },
  probes: boxCorners(-1.5, -1.5, -3.2, 1.5, 1.5, 2.6),
  radius: 4,
  seats: [{ pilot: true, pos: [0, -0.4, 0], eye: [0, 0.35, -0.6], stand: [2.8, -1.4, 0], heading: [1, 0, 0], label: 'Pod seat' }],
  launch: { dir: [0, 0, -1], speed: 25, clear: [0, 0, -4] }, // (along its own nose: out of the tube)
};

// ---------------------------------------------------------------- vehicles and landers (rough drafts)
// Built in Blender by tools/blender/build_craft.py into one file. Ground
// vehicles stand on their legs too: wheels (short stiff springs, tyre grip,
// steered front pair) or hover pads (long soft springs, little grip, thrust
// to move). Cargo can be clamped into a lifter's cradle or a dropship's
// belly clamp: an attachment, not a volume, so whatever drives out of a
// clamped container lands in the next volume up (the bay, or the planet).
// Doors are world state on the vessel (v.doors[id].open, 0..1); a door's
// collider swings about its hinge (an x-axis rotation, see boxPenetration).
const CRAFT_MODEL = 'assets/models/craft.glb';

// legs that sag `sag` metres under the craft's own weight, damped to ratio zeta;
// hull probes scaled from the shuttle's by mass
function springs(mass, sag, zeta = 0.7) {
  const legK = mass * G / (4 * sag);
  return {
    legK, legC: 2 * zeta * Math.sqrt(legK * mass / 4),
    probeK: 5e6 * mass / 42000, probeC: 9e5 * mass / 42000,
  };
}
// a box's moments of inertia from its size
const inertia = (m, w, h, l) => [m / 12 * (h * h + l * l), m / 12 * (w * w + l * l), m / 12 * (w * w + h * h)];
const NO_THRUST = { main: 0, retro: 0, belly: 0, down: 0, lateral: 0 };

export const CART = {
  key: 'cart', className: 'Bay cart', big: false, seatOnly: true, ftl: false, model: CRAFT_MODEL, template: 'cart',
  livery: { main: '#d9a21b', second: '#2b2e33', stripe: '#16181b' },
  ground: { kind: 'wheels', drive: 0.45, vmax: 16, steer: 0.5, grip: 1.0 },
  mass: 900, I: inertia(900, 1.66, 1.4, 3.2), thrust: NO_THRUST, alpha: [1, 1, 1], rate: [1, 1, 1],
  hullRating: 50,
  // (golf-cart narrow: 1.66 m over the wheels, 35 cm to spare each side in a container)
  legs: true, legLength: 0.62, legAttach: [[-0.72, -0.25, -1.05], [0.72, -0.25, -1.05], [-0.72, -0.25, 1.05], [0.72, -0.25, 1.05]],
  ...springs(900, 0.08),
  aero: { cd: [2.0, 2.5, 1.2], wing: 0 },
  probes: hullCorners(-0.68, -0.35, -1.55, 0.68, 1.3, 1.55),
  colliders: [box(-0.83, -0.35, -1.55, 0.83, 0.4, 1.55)],
  radius: 2.5, size: [1.66, 1.8, 3.2],
  seats: [{ pilot: true, pos: [0, 0.1, 0.15], eye: [0, 1.22, 0.12], stand: [1.5, -0.75, 0.2], heading: [1, 0, 0], label: "Driver's seat" }],
  help: 'W/S drive · A/D steer · X or Space brake · Shift full power · F get out',
};

export const CRATE = {
  key: 'crate', className: 'Cargo container', big: false, seatOnly: true, ftl: false, model: CRAFT_MODEL, template: 'crate',
  livery: { main: '#a8432c', second: '#6e2b1c', stripe: '#e8e2d0' },
  cargo: { offset: [0, 0, 0] },
  mass: 2500, I: inertia(2500, 2.6, 3.2, 7.1), thrust: NO_THRUST, alpha: [1, 1, 1], rate: [1, 1, 1],
  hullRating: 30,
  legs: true, legLength: 0.3, legAttach: [[-1.1, -0.15, -3.2], [1.1, -0.15, -3.2], [-1.1, -0.15, 3.2], [1.1, -0.15, 3.2]],
  ...springs(2500, 0.03),
  aero: { cd: [18, 18, 7], wing: 0 },
  probes: hullCorners(-1.3, -0.15, -3.5, 1.3, 2.7, 3.5),
  // floor, roof, sides, front wall; the rear door is added from its state.
  // Outside it (craft beside it in a bay) the shell as built, its floor down
  // to the feet; inside the hold, every surface a metre thick outward, so a
  // wheel sagging into the floor is never nearer its underside (a thin plate
  // pushed what rested on it down through it).
  colliders: [box(-1.3, -0.45, -3.5, 1.3, 0, 3.5), box(-1.3, 2.5, -3.5, 1.3, 2.7, 3.5),
    box(-1.3, 0, -3.5, -1.18, 2.5, 3.5), box(1.18, 0, -3.5, 1.3, 2.5, 3.5), box(-1.18, 0, -3.5, 1.18, 2.5, -3.38)],
  inner: [box(-2.4, -1.2, -4.6, 2.4, 0, 3.5), box(-2.4, 2.5, -4.6, 2.4, 3.6, 3.5),
    box(-2.4, -1.2, -4.6, -1.18, 3.6, 3.5), box(1.18, -1.2, -4.6, 2.4, 3.6, 3.5), box(-2.4, -1.2, -4.6, 2.4, 3.6, -3.38)],
  // hinged along its bottom edge; open, it is the ramp down to the ground
  // (the collider slab is thicker than the door, outboard, so the ramp's top
  // face starts flush with the floor)
  // (103 degrees: its lip ends a little below the floor it stands on, under a wheel's sagging contact point)
  doors: [{ id: 'rear', label: 'container door', min: [-1.18, 0, 3.5], max: [1.18, 2.5, 3.9], hinge: [0, 3.5], angle: 1.8, speed: 0.5, panel: [1.5, 1.2, 3.6], panelIn: [1.05, 1.2, 3.0] }],
  zones: [{ name: 'Container hold', kind: 'hold', min: [-1.18, 0, -3.38], max: [1.18, 2.5, 3.5], gravity: 'host', pressure: 0, snug: true, door: 'rear', exitMargin: 0.4 }],
  egress: [0, 0.3, 6.8], // where someone climbing out of something inside ends up
  // walk-in too: the hold is a room, the open door a ramp down to the deck / ground
  rooms: [{ id: 'hold', name: 'Container hold', type: 'hold', min: [-1.18, 0, -3.38], max: [1.18, 2.5, 3.5], open: ['+z'], gate: { '+z': 'rear' } }],
  ramps: [{ door: 'rear', width: 2.36, hinge: [0, 3.5], length: 2.5 }],
  parts: [{ node: 'door', door: 'rear', hinge: [0, 0, 3.5], axis: [1, 0, 0], angle: 1.8 }],
  radius: 4.5, size: [2.6, 3.2, 7.1],
  seats: [],
};

export const TANK = {
  key: 'tank', className: 'Hover-tank', big: false, seatOnly: true, ftl: false, model: CRAFT_MODEL, template: 'tank',
  livery: { main: '#5d6a45', second: '#3a4130', stripe: '#c9b46a' },
  // pads hold a ride height (pad over the ground), pushing up to `push` g; on a
  // light world they pull down too, as far as making up `feel` g of weight in
  // all (on a 1 g world they don't: it gets a bit of air over a hill)
  ground: { kind: 'hover', drive: 0.45, vmax: 28, strafe: 0.3, yawRate: 0.9, yawAccel: 0.6, grip: 0.08, ride: 0.9, reach: 2.5, push: 3, feel: 1.0 },
  cargo: { offset: [0, 0, 0] },
  mass: 22000, I: inertia(22000, 4.4, 2.5, 8.4), thrust: NO_THRUST, alpha: [1, 1, 1], rate: [1, 1, 1],
  hullRating: 200,
  legs: true, legLength: 1.4, legAttach: [[-1.7, -0.45, -2.8], [1.7, -0.45, -2.8], [-1.7, -0.45, 2.8], [1.7, -0.45, 2.8]],
  ...springs(22000, 0.5, 0.8),
  aero: { cd: [20, 40, 10], wing: 0 },
  // a wedge (Battlezone): low nose, the body rising to the rear compartment
  probes: hullCorners(-2.2, -0.5, -4.2, 2.2, 2.0, 4.2),
  colliders: [box(-2.2, -0.5, -4.2, 2.2, 1.0, -2.5), box(-2.2, -0.5, -2.5, 2.2, 2.0, 4.2)],
  radius: 5, size: [4.4, 2.5, 8.4],
  // two seats under a canopy that lifts to climb in or out; behind them a
  // compartment for people or cargo, with a ramp at the back and a screen
  // showing outside
  rooms: [
    { id: 'cockpit', name: 'Cockpit', type: 'cockpit', min: [-1.2, -0.3, -2.8], max: [1.2, 1.7, -0.2] },
    { id: 'bay', name: 'Rear compartment', type: 'bay', min: [-1.6, -0.3, -0.2], max: [1.6, 1.8, 4.2], open: ['+z'], gate: { '+z': 'ramp' } },
    { id: 'door', name: 'Doorway', type: 'door', min: [-0.6, -0.3, -0.9], max: [0.6, 1.6, 0.5] },
  ],
  ramps: [{ door: 'ramp', width: 3.0, hinge: [-0.4, 4.2], length: 2.0 }],
  doors: [
    { id: 'ramp', label: 'rear ramp', ramp: true, min: [-1.5, -0.4, 4.2], max: [1.5, 1.6, 4.5], hinge: [-0.4, 4.2], angle: 2.12, speed: 0.6, panel: [2.3, 0.0, 3.8], panelIn: [1.3, 0.6, 3.4] },
    { id: 'canopy', label: 'canopy', auto: true, angle: 1.0, speed: 1.4 },
  ],
  parts: [{ node: 'ramp', door: 'ramp', hinge: [0, -0.4, 4.2], axis: [1, 0, 0], angle: 2.12 }, { node: 'canopy', door: 'canopy', hinge: [0, 1.85, -0.2], axis: [1, 0, 0], angle: 1.0 }],
  entries: [{ label: 'canopy', outside: [-3.1, -1.3, -1.6], inside: [-0.55, -0.3, -0.7], heading: [0, 0, -1], canopy: 'canopy' }],
  solids: [{ kind: 'console', ...box(-1.1, -0.3, -2.8, 1.1, 0.4, -2.45) },
    { kind: 'bench', ...box(-1.6, -0.3, 0.6, -1.2, 0.15, 3.6) }, { kind: 'bench', ...box(1.2, -0.3, 0.6, 1.6, 0.15, 3.6) }],
  lights: [{ pos: [0, 1.6, 2.0], color: 0xfff0da, intensity: 2.5, range: 6 }],
  seats: [{ pilot: true, pos: [-0.55, -0.3, -1.6], eye: [-0.55, 0.95, -1.95], stand: [-0.55, -0.3, -0.6], heading: [0, 0, -1], label: 'Driver\'s seat' },
    { pos: [0.55, -0.3, -1.6], eye: [0.55, 0.95, -1.95], stand: [0.55, -0.3, -0.6], heading: [0, 0, -1], label: 'Gunner\'s seat' }],
  // the compartment's screen: what a camera on the nose sees (drawn only while someone is in there)
  viewscreen: { at: [1.125, 0.925, -0.185], size: [0.75, 0.75], cam: [0, 1.05, -3.1], pitch: -0.05, fov: 62, room: 'bay', res: 320 },
  help: 'W/S drive · mouse turns · A/D strafe · Shift full power · R rear ramp · F out of the seat',
};

// Skycrane: cockpit forward, a spine over an open cradle, tall legs either
// side. Its origin is the cradle's: a clamped container's origin sits on it.
export const LIFTER = {
  key: 'lifter', className: 'Atlas-class lifter', big: false, seatOnly: true, ftl: false, model: CRAFT_MODEL, template: 'lifter',
  livery: { main: '#d98a1e', second: '#3a3d42', stripe: '#1c1e21' },
  mass: 45000, I: inertia(45000, 12, 6, 30), thrust: { main: 1.4, retro: 0.8, belly: 2.6, down: 0.4, lateral: 0.7 },
  alpha: [0.9, 0.7, 1.2], rate: [0.7, 0.6, 1.0],
  hullRating: 60,
  legs: true, legLength: 3.0, legAttach: [[-4.9, 2.1, -6.5], [4.9, 2.1, -6.5], [-4.9, 2.1, 6.5], [4.9, 2.1, 6.5]], // (a clamped container clears the ground by ~0.3 m)
  ...springs(45000, 0.17),
  aero: { cd: [60, 120, 25], wing: 0 },
  probes: [...hullCorners(-2.2, 1.5, -14.5, 2.2, 5.2, -9), ...hullCorners(-1.8, 2.9, -9, 1.8, 5.0, 12), [-5.8, 3.2, -6.5], [5.8, 3.2, -6.5], [-5.8, 3.2, 6.5], [5.8, 3.2, 6.5]],
  colliders: [box(-2.2, 1.5, -14.5, 2.2, 5.2, -9), box(-1.8, 2.9, -9, 1.8, 5.0, 12),
    box(-5.8, 3.2, -7.2, 5.8, 4.2, -5.8), box(-5.8, 3.2, 5.8, 5.8, 4.2, 7.2)],
  clamp: { name: 'Cargo cradle', pos: [0, 0, 0], reach: [2.2, 1.8, 3.2], fits: [4.6, 3.4, 9.0] },
  radius: 18, size: [12, 6, 30],
  // walk-in: a small flight deck in the cockpit pod, a hatch to port (F from
  // the ground beside it climbs in; walking out through it drops you there)
  rooms: [
    { id: 'deck', name: 'Flight deck', type: 'cockpit', min: [-1.8, 1.8, -13.6], max: [1.8, 4.6, -9.4] },
    { id: 'hatch', name: 'Hatch', type: 'door', min: [-2.6, 1.8, -12.2], max: [-1.2, 4.0, -10.8], open: ['-x'], exitTo: [-3.2, -0.6, -11.5] },
  ],
  entries: [{ label: 'hatch', outside: [-3.0, -0.6, -11.5], inside: [-0.8, 1.8, -11.5], heading: [1, 0, 0] }],
  solids: [{ kind: 'console', ...box(-1.6, 1.8, -13.6, 1.6, 2.8, -13.1) }],
  lights: [{ pos: [0, 4.4, -11.5], color: 0xfff0da, intensity: 3, range: 6 }],
  seats: [{ pilot: true, pos: [0, 1.8, -12.5], eye: [0, 3.0, -12.8], stand: [0, 1.8, -11.0], heading: [0, 0, 1], label: 'Pilot seat' }],
  help: 'Y clamps the cargo under you (or lets it go)',
};

// Troop bay with a rear ramp (walk-in), cockpit forward
export const DROPSHIP = {
  key: 'dropship', className: 'Cheyenne-class dropship', big: false, seatOnly: true, ftl: false, model: CRAFT_MODEL, template: 'dropship',
  livery: { main: '#5f6a5c', second: '#3c423b', stripe: '#a33a26' },
  mass: 38000, I: inertia(38000, 16, 6, 26), thrust: { main: 4.0, retro: 1.5, belly: 2.8, down: 0.6, lateral: 1.2 },
  alpha: [1.0, 0.8, 1.6], rate: [0.9, 0.7, 1.3],
  hullRating: 90,
  legs: true, legLength: 1.9, legAttach: [[-3.4, -1.0, -7.5], [3.4, -1.0, -7.5], [-3.4, -1.0, 6.5], [3.4, -1.0, 6.5]],
  ...springs(38000, 0.17),
  aero: { cd: [40, 90, 12], wing: 30 },
  probes: [...hullCorners(-2.2, -1.2, -14.5, 2.2, 2.6, 10.3), [-7.5, 0.9, 2], [7.5, 0.9, 2]],
  colliders: [box(-2.2, -1.2, -14.5, 2.2, 2.6, 10), box(-8.5, 0.4, -2, 8.5, 1.4, 6)],
  doors: [{ id: 'ramp', label: 'rear ramp', ramp: true, min: [-1.6, -1.2, 10], max: [1.6, 2.2, 10.35], hinge: [-1.2, 10], angle: 2.04, speed: 0.4, panel: [2.3, -0.8, 9.0], panelIn: [1.4, 0.3, 8.6] }], // (down past level onto the ground: a 1.5 m drop)
  parts: [{ node: 'ramp', door: 'ramp', hinge: [0, -1.2, 10], axis: [1, 0, 0], angle: 2.04 }],
  // walk-in: up the ramp into the troop bay, forward through the bulkhead to the cockpit
  rooms: [
    { id: 'bay', name: 'Troop bay', type: 'bay', min: [-1.6, -1.0, -6], max: [1.6, 2.2, 10], open: ['+z'], gate: { '+z': 'ramp' } },
    { id: 'cockpit', name: 'Cockpit', type: 'cockpit', min: [-1.3, -0.8, -11], max: [1.3, 1.9, -5.8] },
    { id: 'cockpit-door', name: 'Doorway', type: 'door', min: [-0.6, -1.0, -6.7], max: [0.6, 1.0, -5.1] }, // (through the bulkhead)
  ],
  ramps: [{ door: 'ramp', width: 3.2, hinge: [-1.2, 10], length: 3.4 }],
  solids: [{ kind: 'bench', ...box(-1.6, -1.0, -4.5, -1.15, -0.55, 8.5) }, { kind: 'bench', ...box(1.15, -1.0, -4.5, 1.6, -0.55, 8.5) },
    { kind: 'console', ...box(-1.2, -0.8, -11, 1.2, 0.1, -10.5) }],
  lights: [{ pos: [0, 2.0, 2], color: 0xfff0da, intensity: 4, range: 10 }, { pos: [0, 1.6, -8.5], color: 0xb8dcff, intensity: 3, range: 6 }],
  radius: 16, size: [17, 6, 25],
  seats: [{ pilot: true, pos: [-0.6, -0.8, -9.6], eye: [-0.6, 0.45, -10.0], stand: [-0.6, -0.8, -8.3], heading: [0, 0, 1], label: 'Pilot seat' },
    { pos: [0.6, -0.8, -9.6], eye: [0.6, 0.45, -10.0], stand: [0.6, -0.8, -8.3], heading: [0, 0, 1], label: "Co-pilot's seat" }],
  help: 'R rear ramp',
};

export const FIGHTER = {
  key: 'fighter', className: 'Kite-class lander', big: false, seatOnly: true, ftl: false, model: CRAFT_MODEL, template: 'fighter',
  livery: { main: '#9aa3ab', second: '#3e4c5e', stripe: '#c8372a' },
  mass: 9000, I: inertia(9000, 10, 3, 13), thrust: { main: 7.0, retro: 2.0, belly: 3.2, down: 0.8, lateral: 1.6 },
  alpha: [2.0, 1.6, 3.0], rate: [1.4, 1.1, 2.2],
  hullRating: 100,
  legs: true, legLength: 1.3, legAttach: [[-1.4, -0.9, -3.5], [1.4, -0.9, -3.5], [-2.4, -0.9, 2.5], [2.4, -0.9, 2.5]],
  ...springs(9000, 0.17),
  aero: { cd: [10, 30, 3], wing: 24 },
  probes: [...hullCorners(-1.2, -0.9, -6.5, 1.2, 1.2, 5.5), [-5, 0, 2.5], [5, 0, 2.5]],
  colliders: [box(-1.2, -0.9, -6.5, 1.2, 1.2, 5.5), box(-5, -0.1, 0.5, 5, 0.3, 4.5)],
  // its cockpit is its interior: the canopy lifts while you climb in or out
  doors: [{ id: 'canopy', label: 'canopy', auto: true, angle: 0.9, speed: 1.4 }],
  parts: [{ node: 'canopy', door: 'canopy', hinge: [0, 1.0, -0.8], axis: [1, 0, 0], angle: 0.9 }],
  radius: 8, size: [10, 3, 13],
  seats: [{ pilot: true, pos: [0, 0.6, -2.8], eye: [0, 1.5, -3.1], stand: [-2.9, -2.0, -2.5], heading: [-1, 0, 0], label: 'Pilot seat' }],
};

export const VESSEL_TYPES = {
  shuttle: SHUTTLE, tender: TENDER, carrier: CARRIER, yacht: YACHT, pod: POD,
  cart: CART, crate: CRATE, tank: TANK, lifter: LIFTER, dropship: DROPSHIP, fighter: FIGHTER,
};

// height of a craft's origin over the floor it stands on (legs sagging under
// `mass`, its own unless it carries something)
export function restHeight(type, mass = type.mass) {
  const low = Math.min(...type.legAttach.map((a) => a[1]));
  return -(low - type.legLength) - mass * G / (4 * (type.legK || 6.0e5));
}

// ---------------------------------------------------------------- box helpers (local frames)

// Penetration of a point into the nearest box surface: returns depth (> 0 when
// inside) and the outward normal of the face it is closest to. A box with an
// `angle` is swung by it about the x axis through its hinge ([y, z]): a door.
export function boxPenetration(boxes, p, outN) {
  let best = 0;
  for (const b of boxes) {
    const mn = b.min, mx = b.max;
    let px = p.x, py = p.y, pz = p.z, c = 1, s = 0;
    if (b.angle) {
      // the point in the box's unswung frame
      c = Math.cos(b.angle); s = Math.sin(b.angle);
      const y = p.y - b.hinge[0], z = p.z - b.hinge[1];
      py = b.hinge[0] + y * c + z * s; pz = b.hinge[1] - y * s + z * c;
    }
    if (px <= mn[0] || px >= mx[0] || py <= mn[1] || py >= mx[1] || pz <= mn[2] || pz >= mx[2]) continue;
    const d = [px - mn[0], mx[0] - px, py - mn[1], mx[1] - py, pz - mn[2], mx[2] - pz];
    let k = 0;
    for (let i = 1; i < 6; i++) if (d[i] < d[k]) k = i;
    if (d[k] > best) {
      best = d[k];
      outN.set(0, 0, 0);
      outN.setComponent(k >> 1, (k & 1) ? 1 : -1);
      if (b.angle) { const ny = outN.y, nz = outN.z; outN.y = ny * c - nz * s; outN.z = ny * s + nz * c; }
    }
  }
  return best;
}

// Highest box top at or below p (within reach), for radar altitude over decks
export function deckBelow(boxes, p, reach = 400) {
  let top = -Infinity;
  for (const b of boxes) {
    if (p.x < b.min[0] || p.x > b.max[0] || p.z < b.min[2] || p.z > b.max[2]) continue;
    const t = b.max[1];
    if (t <= p.y + 0.05 && t > top && p.y - t < reach) top = t;
  }
  return top;
}

export function insideBox(b, p, margin = 0) {
  return p.x >= b.min[0] - margin && p.x <= b.max[0] + margin && p.y >= b.min[1] - margin && p.y <= b.max[1] + margin && p.z >= b.min[2] - margin && p.z <= b.max[2] + margin;
}

// The seat that flies a craft (one per craft): marked `pilot`; any other
// seat is a passenger's (a co-pilot's, a gunner's) and flies nothing
export function pilotSeat(type) {
  const i = (type.seats || []).findIndex((s) => s.pilot);
  return i >= 0 ? i : 0;
}
