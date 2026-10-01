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
  seats: [{ pos: SHIP_INTERIOR.seatPos[0].toArray(), eye: SHIP_INTERIOR.pilotEye.toArray(), stand: [0, 0.25, -8.4], heading: [0, 0, 1], label: 'Pilot seat' }],
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
  seats: [{ pos: [0, 9.5, -142], eye: [0, 10.85, -142.3], stand: [0, 9.5, -139.4], heading: [0, 0, 1], label: 'Command seat' }],
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
// 1.55 km long. A hangar bay open on the port side; a door from the hangar
// leads to a corridor and a lift up to the bridge atop the command tower.
export const CARRIER = {
  key: 'carrier',
  className: 'Bastion-class carrier',
  big: true,
  mass: 1.2e9,
  I: [2.3e14, 2.4e14, 9.3e12],
  thrust: { main: 0.12, retro: 0.04, belly: 0.03, down: 0.03, lateral: 0.02 },
  alpha: [0.004, 0.004, 0.01],
  rate: [0.02, 0.02, 0.03],
  hullRating: 20,
  maxDynPressure: 2500,
  aero: { cd: [1.6e5, 2.4e5, 4.4e4], wing: 0 },
  radius: 830,
  colliders: [
    box(-10, -100, -640, 130, 100, 640),   // starboard main hull
    box(-130, -100, -640, -10, 0, 640),    // port lower hull (top is the hangar deck)
    box(-130, 0, -640, -10, 100, -260),    // port hull fore of the hangar
    box(-130, 0, 160, -10, 100, 640),      // port hull aft of the hangar
    box(-130, 72, -260, -10, 100, 160),    // hangar roof
    box(-130, 0, -260, -124, 72, -240),    // fore door jamb
    box(-130, 0, 140, -124, 72, 160),      // aft door jamb
    box(-130, 64, -240, -124, 72, 140),    // door header
    box(-100, -80, -780, 100, 80, -640),   // bow
    box(-120, -90, 640, 120, 90, 720),     // engine block
    box(-40, 100, -560, 40, 114, 600),     // dorsal ridge
    box(20, 100, 380, 90, 210, 520),       // command tower
    box(-30, -114, -500, 30, -100, 500),   // keel
    box(-32, 0, -236, -12, 10, -196),      // hangar: container stacks
    box(-30, 0, 96, -12, 14, 136),
  ],
  zones: [
    { name: 'Hangar', kind: 'hangar', min: [-127, 0, -258], max: [-11, 70, 158], gravity: G, pressure: 1, door: { x: -130, y0: 0, y1: 64, z0: -240, z1: 140 } },
  ],
  rooms: [
    { name: 'Hangar deck', min: [-129.5, 0, -258.5], max: [-10.5, 70, 158.5], open: ['-x'], capture: true },
    { name: 'Hangar airlock', min: [-12, 0, -2.5], max: [-3, 4, 2.5] },
    { name: 'Starboard corridor', min: [-4, 0, -40], max: [2, 4, 42] },
    { name: 'Lift lobby', min: [1, 0, 32], max: [12, 4, 42] },
    { name: 'Bridge', min: [28, 196, 383], max: [82, 204, 416] },
  ],
  solids: [
    box(-130, 0, -260, -124, 72, -240),
    box(-130, 0, 140, -124, 72, 160),
    box(-32, 0, -236, -12, 10, -196),
    box(-30, 0, 96, -12, 14, 136),
    box(32, 196, 383.6, 78, 197.1, 386),   // bridge console
    // hangar: catwalks along the inboard wall and their rails
    ...[22, 44].flatMap((y) => [box(-16, y - 0.4, -258, -10.5, y, 158), box(-16.1, y, -258, -15.9, y + 1.1, 158)]),
    // overhead cranes: beam, trolley, hook cable
    ...[-100, 60].flatMap((z) => [box(-128, 58, z - 2, -12, 62, z + 2), box(-76, 52, z - 3, -64, 58, z + 3), box(-70.3, 20, z - 0.3, -69.7, 52, z + 0.3)]),
    // ribs on the inboard wall
    ...Array.from({ length: 21 }, (_, i) => box(-11.2, 0, -250 + i * 20 - 0.6, -10.5, 72, -250 + i * 20 + 0.6)),
  ],
  lifts: [
    { a: [10.6, 0, 37], b: [55, 196, 414.6], label: 'Bridge lift' },
  ],
  seats: [{ pos: [55, 196, 397], eye: [55, 197.35, 396.7], stand: [55, 196, 400.2], heading: [0, 0, 1], label: 'Command seat' }],
  lights: [
    ...[-220, -140, -60, 20, 100].flatMap((z) => [
      { pos: [-92, 67, z], color: 0xfff0dc, intensity: 900, range: 150 },
      { pos: [-42, 67, z], color: 0xfff0dc, intensity: 900, range: 150 },
    ]),
    { pos: [-1, 3.6, -20], color: 0xffe2c4, intensity: 7, range: 26 },
    { pos: [-1, 3.6, 22], color: 0xffe2c4, intensity: 7, range: 26 },
    { pos: [7, 3.6, 37], color: 0xffe2c4, intensity: 5, range: 16 },
    { pos: [55, 203, 400], color: 0xb8dcff, intensity: 36, range: 50 },
  ],
  engines: [[-75, -40, 770, 30], [0, -40, 770, 30], [75, -40, 770, 30], [-75, 40, 770, 30], [0, 40, 770, 30], [75, 40, 770, 30]],
  probes: [...hullCorners(-130, -114, -780, 130, 210, 770)],
};

export const VESSEL_TYPES = { shuttle: SHUTTLE, tender: TENDER, carrier: CARRIER };

// ---------------------------------------------------------------- box helpers (local frames)

// Penetration of a point into the nearest box surface: returns depth (> 0 when
// inside) and the outward normal of the face it is closest to.
export function boxPenetration(boxes, p, outN) {
  let best = 0;
  for (const b of boxes) {
    const mn = b.min, mx = b.max;
    if (p.x <= mn[0] || p.x >= mx[0] || p.y <= mn[1] || p.y >= mx[1] || p.z <= mn[2] || p.z >= mx[2]) continue;
    const d = [p.x - mn[0], mx[0] - p.x, p.y - mn[1], mx[1] - p.y, p.z - mn[2], mx[2] - p.z];
    let k = 0;
    for (let i = 1; i < 6; i++) if (d[i] < d[k]) k = i;
    if (d[k] > best) {
      best = d[k];
      outN.set(0, 0, 0);
      outN.setComponent(k >> 1, (k & 1) ? 1 : -1);
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
