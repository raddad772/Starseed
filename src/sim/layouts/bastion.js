// Bastion-class carrier: the layout the game walks and flies (rooms, doors,
// lifts, the turbolift, seats, bays, hull colliders). The model is Dave's
// refit in Blender (assets/blender/fleet-refit.blend, exported by
// tools/blender/export_refit.py); this file follows it: its rooms are the
// model's room:* meshes, its hull colliders come from the exterior mesh
// (tools/blender/hull_colliders.py -> bastion-hull.data.js). (The first model
// was built from this file by tools/blender/build_carrier.py.) Plain data, no
// three.js, so Node can read it.
//
// Ship frame (metres): x to starboard, y up, z aft (the nose points to -z).
// y = 0 is the flight deck, level with both bay floors. 1250 m long
// (z -682 .. 572), 470 m across the bays.
//
//   Deck 1 +42  bridge, astrogation, ready room           (the island)
//   Deck 2 +37  briefing, sensors, officers, island lounge (the island)
//   Deck 3 +12  prow lounge and mess, crew quarters, medical, recreation
//   Deck 4   0  armory, flight ops, lockers, workshop, cargo lift; three
//               cross-passages into the two flight bays
//   Deck 5 -12  yacht dock (forward), hydroponics, life support, cargo
//               holds, reactor
//   Engineering (aft, z 262..340, y -24..+24): the FTL core, catwalks at
//               decks 3, 4 and 5
// Lifts: forward (decks 1-5), midship (3-5), aft (3-5), each beside the spine.
// Turbolift: one car on a guideway at y 22 from the bridge to engineering,
// with a branch across to both bays (see TURBOLIFT).
// Launchable craft: the captain's yacht in a ventral recess under the forward
// hull (boarded from the yacht dock on deck 5 by the transfer lift) and 16
// escape pods in tubes up to the dorsal plating, two at each of eight pod
// stations on deck 3.
//
// Rooms are boxes { id, name, deck, type, min, max }; two rooms connect where
// their boxes overlap (a door is a small box overlapping both). Windows are
// openings in a room wall, on the hull side.

import { HULL_BOXES } from './bastion-hull.data.js';

const G = 9.81;
export const DECKS = { 1: 42, 2: 37, 3: 12, 4: 0, 5: -12 };
const H = 4; // clear height of an ordinary room

const box = (min, max) => ({ min, max });
const rooms = [], doors = [], windows = [], solids = [];
// crew-cabin slots (z of the cabin's fore end) given to escape pod stations
const POD_SLOTS = [-170, -120, -70, 24];
export const PODS = [];

function room(id, name, deck, type, min, max, extra = {}) {
  const r = { id, name, deck, type, min, max, ...extra };
  rooms.push(r);
  return r;
}
// a doorway 2 m wide between a room and the spine (x side: -1 port, +1 starboard)
function sideDoor(deck, side, zc, a, b) {
  const y = DECKS[deck];
  const x0 = side < 0 ? -4.6 : 1.4, x1 = side < 0 ? -1.4 : 4.6;
  doors.push({ id: `door-${a}-${b}`, rooms: [a, b], ...box([x0, y, zc - 1], [x1, y + 2.6, zc + 1]) });
}
function win(roomId, wall, u0, u1, y0, y1) { windows.push({ room: roomId, wall, u0, u1, y0, y1 }); }

// ---------------------------------------------------------------- deck 1: bridge (island)
{
  const y = DECKS[1];
  room('bridge', 'Bridge', 1, 'bridge', [-20, y, -296], [20, y + 7, -270]); // (front wall just inside the island's leaning window face)
  win('bridge', '-z', -18, 18, y + 1.5, y + 6);
  room('d1-hall', 'Bridge corridor', 1, 'corridor', [-3, y, -271], [3, y + H, -219]);
  room('l1-d1', 'Forward lift lobby', 1, 'lobby', [-3, y, -220], [10, y + H, -208]);
  room('astrogation', 'Astrogation', 1, 'astrogation', [-22, y, -262], [-4, y + H, -244]);
  room('ready-room', "Captain's ready room", 1, 'office', [4, y, -262], [18, y + H, -250]);
  doors.push({ id: 'door-astro', rooms: ['d1-hall', 'astrogation'], ...box([-4.6, y, -254], [-2.4, y + 2.6, -252]) });
  doors.push({ id: 'door-ready', rooms: ['d1-hall', 'ready-room'], ...box([2.4, y, -257], [4.6, y + 2.6, -255]) });
  solids.push({ room: 'bridge', kind: 'console', ...box([-16, y, -295.5], [16, y + 1.1, -293]) });  // forward stations
  solids.push({ room: 'bridge', kind: 'console', ...box([-19.5, y, -290], [-17, y + 1.1, -276]) }); // port stations
  solids.push({ room: 'bridge', kind: 'console', ...box([17, y, -290], [19.5, y + 1.1, -276]) });   // starboard stations
  solids.push({ room: 'astrogation', kind: 'holotable', ...box([-16, y, -256], [-10, y + 1.0, -250]) });
  solids.push({ room: 'ready-room', kind: 'desk', ...box([12, y, -260], [16, y + 0.8, -257]) });
}

// ---------------------------------------------------------------- deck 2: command (island)
{
  const y = DECKS[2];
  room('d2-hall', 'Command deck corridor', 2, 'corridor', [-2, y, -219], [2, y + H, -132]);
  room('l1-d2', 'Forward lift lobby', 2, 'lobby', [-3, y, -220], [10, y + H, -208]);
  room('briefing', 'Briefing room', 2, 'briefing', [3, y, -200], [22, y + H, -182]);
  room('sensors', 'Sensors and comms', 2, 'sensors', [-22, y, -200], [-3, y + H, -182]);
  sideDoor(2, 1, -191, 'd2-hall', 'briefing');
  sideDoor(2, -1, -191, 'd2-hall', 'sensors');
  solids.push({ room: 'briefing', kind: 'table', ...box([8, y, -195], [17, y + 0.8, -187]) });
  solids.push({ room: 'sensors', kind: 'console', ...box([-21.5, y, -199], [-19, y + 1.1, -183]) });
  for (let i = 0; i < 4; i++) {
    const z0 = -176 + i * 10;
    for (const side of [-1, 1]) {
      const id = `officer-${side < 0 ? 'p' : 's'}${i + 1}`;
      room(id, `Officer's cabin ${side < 0 ? 'P' : 'S'}${i + 1}`, 2, 'cabin', side < 0 ? [-12, y, z0] : [3, y, z0], side < 0 ? [-3, y + H, z0 + 8] : [12, y + H, z0 + 8]);
      sideDoor(2, side, z0 + 4, 'd2-hall', id);
    }
  }
  room('island-lounge', 'Island lounge', 2, 'lounge', [-25.5, y, -134], [25.5, y + H, -100.5]); // (the island's aft end: windows aft and to the sides)
  win('island-lounge', '+z', -21, 21, y + 1, y + 3.5);
  win('island-lounge', '-x', -130, -104, y + 1, y + 3.5);
  win('island-lounge', '+x', -130, -104, y + 1, y + 3.5);
}

// ---------------------------------------------------------------- deck 3: habitation
{
  const y = DECKS[3];
  room('prow-lounge', 'Prow lounge and mess', 3, 'mess', [-57.5, y, -256], [57.5, y + 6, -226]); // (wall to wall: windows in both hull sides)
  win('prow-lounge', '-x', -252, -230, y + 1.5, y + 5);
  win('prow-lounge', '+x', -252, -230, y + 1.5, y + 5);
  solids.push({ room: 'prow-lounge', kind: 'counter', ...box([-12, y, -229], [12, y + 1.1, -227]) });
  for (const [x, z] of [[-40, -248], [-40, -236], [-24, -248], [-24, -236], [24, -248], [24, -236], [40, -248], [40, -236]]) {
    solids.push({ room: 'prow-lounge', kind: 'table', ...box([x - 2.5, y, z - 1.5], [x + 2.5, y + 0.8, z + 1.5]) });
  }
  room('d3-spine', 'Habitation spine', 3, 'corridor', [-2, y, -227], [2, y + H, 263]);
  room('l1-d3', 'Forward lift lobby', 3, 'lobby', [1, y, -220], [10, y + H, -208]);
  room('l2-d3', 'Midship lift lobby', 3, 'lobby', [1, y, -32], [10, y + H, -22]);
  room('l3-d3', 'Aft lift lobby', 3, 'lobby', [1, y, 234], [10, y + H, 246]);
  // crew quarters: two-berth cabins either side of the spine
  let n = 0;
  const cabinsAt = (z0s) => {
    for (const z0 of z0s) {
      if (POD_SLOTS.includes(z0)) continue; // an escape pod station takes this slot
      for (const side of [-1, 1]) {
        if (side > 0 && z0 >= -40 && z0 < -20) continue; // (the midship lift lobby)
        n++;
        const id = `cabin-${n}`;
        room(id, `Crew cabin ${n}`, 3, 'cabin', side < 0 ? [-14, y, z0] : [3, y, z0], side < 0 ? [-3, y + H, z0 + 8] : [14, y + H, z0 + 8]);
        sideDoor(3, side, z0 + 4, 'd3-spine', id);
      }
    }
  };
  cabinsAt(Array.from({ length: 15 }, (_, i) => -200 + i * 10)); // z -200 .. -60
  cabinsAt(Array.from({ length: 6 }, (_, i) => 4 + i * 10));     // z 4 .. 54
  // escape pod stations: a passage out to the hull side and two pod hatches
  let pod = 0;
  for (const z0 of POD_SLOTS) {
    for (const side of [-1, 1]) {
      const sfx = `${side < 0 ? 'p' : 's'}${z0}`;
      room(`pod-pass-${sfx}`, 'Escape pod passage', 3, 'corridor', side < 0 ? [-15.6, y, z0 + 2] : [1.4, y, z0 + 2], side < 0 ? [-1.4, y + H, z0 + 6] : [15.6, y + H, z0 + 6]);
      room(`pod-station-${sfx}`, 'Escape pod station', 3, 'podstation', side < 0 ? [-57, y, z0] : [15, y, z0], side < 0 ? [-15, y + H, z0 + 8] : [57, y + H, z0 + 8]);
      for (const dz of [2, 6]) {
        pod++;
        PODS.push({
          id: `pod-${pod}`, label: `Escape pod ${pod}`,
          hatch: [side * 56, y, z0 + dz],                     // where you board, at the station's outer wall
          // the pod at the top of its tube, nose up under the dorsal plating (y 36): the refit's
          // hull reaches out to the bays, so there's no flank to leave by
          dock: { pos: [side * 59.5, 30, z0 + dz], axis: [0, 1, 0] },
          launch: { dir: [0, 1, 0], speed: 25 },
        });
      }
    }
  }
  // bay control galleries, one over each bay
  room('gallery-pass-p', 'Port gallery passage', 3, 'corridor', [-92, y, -12], [-1.4, y + H, -8]);
  room('gallery-p', 'Port bay control', 3, 'baycontrol', [-101, y, -20], [-90, y + H, 0]);
  win('gallery-p', '-x', -18, -2, y + 1, y + 3.5);
  room('gallery-pass-s', 'Starboard gallery passage', 3, 'corridor', [1.4, y, -12], [92, y + H, -8]);
  room('gallery-s', 'Starboard bay control', 3, 'baycontrol', [90, y, -20], [101, y + H, 0]);
  win('gallery-s', '+x', -18, -2, y + 1, y + 3.5);
  room('medical', 'Medical bay', 3, 'medical', [-26, y, 80], [-3, y + H, 104]);
  room('recreation', 'Recreation and gym', 3, 'recreation', [3, y, 80], [26, y + H, 104]);
  sideDoor(3, -1, 92, 'd3-spine', 'medical');
  sideDoor(3, 1, 92, 'd3-spine', 'recreation');
  for (let i = 0; i < 4; i++) solids.push({ room: 'medical', kind: 'bed', ...box([-24, y, 83 + i * 5], [-21, y + 0.8, 85 + i * 5]) });
}

// ---------------------------------------------------------------- deck 4: flight deck
{
  const y = DECKS[4];
  room('armory', 'Armory and magazine', 4, 'armory', [-24, y, -256], [24, y + H, -226]);
  room('d4-spine', 'Flight deck spine', 4, 'corridor', [-2, y, -227], [2, y + H, 263]);
  room('l1-d4', 'Forward lift lobby', 4, 'lobby', [1, y, -220], [10, y + H, -208]);
  room('l2-d4', 'Midship lift lobby', 4, 'lobby', [1, y, -32], [10, y + H, -22]);
  room('l3-d4', 'Aft lift lobby', 4, 'lobby', [1, y, 234], [10, y + H, 246]);
  room('flight-ops', 'Flight operations', 4, 'flightops', [-26, y, -150], [-3, y + H, -126]);
  room('lockers', "Pilots' ready room and lockers", 4, 'lockers', [3, y, -150], [26, y + H, -126]);
  sideDoor(4, -1, -138, 'd4-spine', 'flight-ops');
  sideDoor(4, 1, -138, 'd4-spine', 'lockers');
  room('workshop', 'Workshop and fabrication', 4, 'workshop', [-26, y, 90], [-3, y + H, 150]);
  room('cargo-lift', 'Cargo lift', 4, 'cargo', [3, y, 90], [26, y + H, 150]);
  sideDoor(4, -1, 120, 'd4-spine', 'workshop');
  sideDoor(4, 1, 120, 'd4-spine', 'cargo-lift');
  for (const zc of [-100, 40, 200]) room(`cross-${zc}`, 'Bay passage', 4, 'corridor', [-102.6, y, zc - 2], [102.6, y + H, zc + 2], { pressureDoors: [-96, -102, 96, 102] });
  solids.push({ room: 'flight-ops', kind: 'console', ...box([-25.5, y, -149], [-23, y + 1.1, -127]) });
  solids.push({ room: 'workshop', kind: 'bench', ...box([-25, y, 95], [-21, y + 1.0, 145]) });
}

// ---------------------------------------------------------------- deck 5: stores and life support
{
  const y = DECKS[5];
  // forward: the yacht dock, over the ventral recess where the yacht rides
  room('l1-d5', 'Forward lift lobby', 5, 'lobby', [1, y, -220], [10, y + H, -208]);
  room('d5-fwd', 'Yacht dock corridor', 5, 'corridor', [-2, y, -233], [2, y + H, -207]);
  room('yacht-dock', 'Yacht dock', 5, 'yachtdock', [-12, y, -252], [12, y + H, -232]);
  solids.push({ room: 'yacht-dock', kind: 'console', ...box([-11.5, y, -251], [-9, y + 1.1, -244]) });
  room('d5-spine', 'Stores spine', 5, 'corridor', [-2, y, -36], [2, y + H, 263]);
  room('l2-d5', 'Midship lift lobby', 5, 'lobby', [1, y, -32], [10, y + H, -22]);
  room('l3-d5', 'Aft lift lobby', 5, 'lobby', [1, y, 234], [10, y + H, 246]);
  room('hydroponics', 'Hydroponics', 5, 'hydroponics', [-40, y, -36], [-4, y + 8, 60]);
  room('life-support', 'Life support', 5, 'lifesupport', [4, y, -18], [40, y + 8, 60]);
  room('hold-a', 'Cargo hold A', 5, 'hold', [-40, y, 90], [-4, y + 10, 180]);
  room('hold-b', 'Cargo hold B', 5, 'hold', [4, y, 90], [40, y + 10, 180]);
  sideDoor(5, -1, 12, 'd5-spine', 'hydroponics');
  sideDoor(5, 1, 12, 'd5-spine', 'life-support');
  sideDoor(5, -1, 135, 'd5-spine', 'hold-a');
  sideDoor(5, 1, 135, 'd5-spine', 'hold-b');
  for (let i = 0; i < 6; i++) for (const x of [-34, -24, -14]) solids.push({ room: 'hydroponics', kind: 'planter', ...box([x - 3, y, -30 + i * 15], [x + 3, y + 1.0, -22 + i * 15]) });
  for (let i = 0; i < 5; i++) solids.push({ room: 'hold-a', kind: 'crates', ...box([-36, y, 96 + i * 16], [-26, y + 4 + (i % 2) * 3, 104 + i * 16]) });
  for (let i = 0; i < 5; i++) solids.push({ room: 'hold-b', kind: 'crates', ...box([26, y, 96 + i * 16], [36, y + 3 + ((i + 1) % 2) * 3, 104 + i * 16]) });
  room('reactor', 'Reactor', 5, 'reactor', [-20, y, 340], [20, y + 6, 378]);
}

// ---------------------------------------------------------------- engineering (aft)
export const ENGINE_HALL = box([-40, -24, 262], [40, 24, 340]); // one tall space, open between the catwalks
export const FTL_CORE = { center: [0, 300], radius: 6, y0: -24, y1: 24 };
for (const d of [3, 4, 5]) {
  const y = DECKS[d];
  room(`eng-walk-d${d}`, `Engineering catwalk, deck ${d}`, d, 'catwalk', [-30, y, 262], [30, y + H, 270]);
  room(`eng-in-d${d}`, 'Engineering catwalk', d, 'catwalk', [-1.25, y, 269], [1.25, y + H, 288]);
  room(`eng-ring-f-d${d}`, 'Core gallery', d, 'catwalk', [-12.5, y, 287.5], [12.5, y + H, 290]);
  room(`eng-ring-a-d${d}`, 'Core gallery', d, 'catwalk', [-12.5, y, 310], [12.5, y + H, 312.5]);
  room(`eng-ring-p-d${d}`, 'Core gallery', d, 'catwalk', [-12.5, y, 287.5], [-10, y + H, 312.5]);
  room(`eng-ring-s-d${d}`, 'Core gallery', d, 'catwalk', [10, y, 287.5], [12.5, y + H, 312.5]);
}
room('eng-control', 'Engine control', 4, 'engcontrol', [-12, DECKS[4], 258], [12, DECKS[4] + H, 264]);
win('eng-control', '+z', -10, 10, DECKS[4] + 1, DECKS[4] + 3.5);
room('reactor-pass', 'Reactor access', 5, 'corridor', [-1.25, DECKS[5], 312], [1.25, DECKS[5] + H, 341]);
solids.push({ room: 'eng-control', kind: 'console', ...box([-10, DECKS[4], 258.5], [10, DECKS[4] + 1.1, 260.5]) });

// ---------------------------------------------------------------- flight bays
// Open at the forward end (z -220) behind a force field; floors level with
// deck 4. Seven pads in each, along the outer side (the ones painted on the
// model's floor: four of 40 m, three long ones); ships park nose to the mouth.
const BAY = { x0: 103, x1: 229, y0: 0, y1: 33, z0: -220, z1: 510 };
const PAD_X = 192.35;
export const PADS_Z = [-111.65, -36, 28, 92, 156, 248.5, 412.7];
const bays = [];
for (const side of [-1, 1]) {
  const id = side < 0 ? 'bay-p' : 'bay-s';
  const name = side < 0 ? 'Port bay' : 'Starboard bay';
  const xa = side < 0 ? -BAY.x1 : BAY.x0, xb = side < 0 ? -BAY.x0 : BAY.x1;
  room(id, name, 4, 'bay', [xa - 1, BAY.y0, BAY.z0 - 0.5], [xb + 1, BAY.y1 + 1, BAY.z1], { open: ['-z'], capture: true });
  bays.push({
    name, kind: 'hangar', side,
    min: [xa, BAY.y0, BAY.z0], max: [xb, BAY.y1, BAY.z1],
    gravity: G, pressure: 1,
    // the opening: a face of the box, its outward normal and extent
    mouth: { normal: [0, 0, -1], at: BAY.z0, u: [xa, xb], v: [BAY.y0, BAY.y1] },
    pads: PADS_Z.map((z) => [side * PAD_X, 0, z]),
  });
}

// ---------------------------------------------------------------- the captain's yacht
// Rides in a recess under the forward hull, its belly continuing the keel
// line; boarded through the hatch in the yacht dock's floor, launched by
// dropping it clear of the recess.
export const YACHT = {
  label: "Captain's yacht",
  recess: box([-14, -28, -254], [14, -21, -200]),     // cut up into the hull (the fairing rings it)
  dock: { pos: [0, -25.5, -227], heading: [0, 0, -1] }, // nose forward (its belly half a metre below the hull)
  size: [26.4, 6.9, 48.4],                            // beam, height, length
  hatch: [0, DECKS[5], -235],                         // the transfer lift in the yacht dock's floor, down to its dorsal hatch
  launch: { dir: [0, -1, 0], speed: 6 },
};

// ---------------------------------------------------------------- lifts
export const LIFTS = [
  { label: 'Forward lift', x: 8.5, z: -214, stops: [1, 2, 3, 4, 5].map((d) => ({ deck: d, y: DECKS[d] })) },
  { label: 'Midship lift', x: 8.5, z: -27, stops: [3, 4, 5].map((d) => ({ deck: d, y: DECKS[d] })) },
  { label: 'Aft lift', x: 8.5, z: 240, stops: [3, 4, 5].map((d) => ({ deck: d, y: DECKS[d] })) },
];

// ---------------------------------------------------------------- the turbolift
// Upright ropeless cars on a guideway at y 22, between decks 3 and 2: a
// shaft up to the bridge, the line aft to engineering, and a branch across
// both bays to a shaft down into each. A car stops, then transfers axes at a
// junction (the switch tongues move while it stands); between stops it runs
// on its linear motors. One car in service, the spare in its siding by
// engineering. Positions are the car's floor; its doors are at its ends
// (z -1.55: the -z end, z +1.55: the +z end), two leaves sliding apart.
// (From the model's bastion:turbolift_system: route, stations and rig.)
const TL_Y = 22;
export const TURBOLIFT = {
  label: 'Turbolift',
  car: { half: [1.48, 1.48], height: 2.7, door: 1.55, leaf: 1.04 },
  nodes: {
    bridge: [12, 42, -266], jb: [12, TL_Y, -266],
    jh: [12, TL_Y, 193], js: [12, TL_Y, 230], je: [12, TL_Y, 256],
    e1: [25, TL_Y, 256], engineering: [25, 0, 256], siding: [25, TL_Y, 230],
    s1: [107, TL_Y, 193], hangar_starboard: [107, 0, 193],
    p1: [-107, TL_Y, 193], hangar_port: [-107, 0, 193],
  },
  edges: [['bridge', 'jb'], ['jb', 'jh'], ['jh', 'js'], ['js', 'je'], ['je', 'e1'], ['e1', 'engineering'], ['js', 'siding'],
    ['jh', 's1'], ['s1', 'hangar_starboard'], ['jh', 'p1'], ['p1', 'hangar_port']],
  // the junctions into the shafts: tongues (named in the model) that clear the way for a car
  // going up or down (horizontal ones slide apart along `axis`; vertical ones rise to the guideway)
  switches: {
    jb: { name: 'bridge', axis: 2 },
    e1: { name: 'engineering', axis: 0, vertical: true },
    s1: { name: 'starboard', axis: 0, vertical: true },
    p1: { name: 'port', axis: 0, vertical: true },
  },
  // end: the car's door end facing the landing; door: the landing door's plane (its leaves
  // slide 1.14 m apart); panel: the call panel beside it; landing: the room you wait in
  stations: [
    { id: 'bridge', label: 'Bridge', about: 'the bridge, astrogation, the ready room', deck: 1, node: 'bridge', end: -1, door: [12, 42, -267.7], panel: [13.2, 42, -268.85], landing: 'tl-landing-bridge' },
    { id: 'engineering', label: 'Engineering', about: 'engine control, the FTL core, the catwalks', deck: 4, node: 'engineering', end: 1, door: [25, 0, 257.7], panel: [26.2, 0, 258.85], landing: 'tl-landing-engineering' },
    { id: 'hangar_port', label: 'Port bay', about: 'the port flight bay, inboard wall', deck: 4, node: 'hangar_port', end: -1, door: [-107, 0, 191.3], panel: [-105.8, 0, 190.15], landing: 'bay-p' },
    { id: 'hangar_starboard', label: 'Starboard bay', about: 'the starboard flight bay, inboard wall', deck: 4, node: 'hangar_starboard', end: -1, door: [107, 0, 191.3], panel: [108.2, 0, 190.15], landing: 'bay-s' },
  ],
  spare: 'siding',
  start: 'hangar_starboard',
  // runs (m/s, m/s^2: the cars' plating takes up most of the push), and the pauses
  run: { h: [50, 6], v: [12, 4] },
  switchTime: 1.2, doorTime: 1.4, dwell: 6,
};
// the landings by the bridge and engineering (the bays are their own), and the doorways:
// walkable while both the landing's door and the car's are open (see Turbolift)
room('tl-landing-bridge', 'Turbolift landing', 1, 'lobby', [10.5, DECKS[1], -271.2], [13.5, DECKS[1] + H, -267.6]);
room('tl-landing-engineering', 'Turbolift landing', 4, 'lobby', [23.5, DECKS[4], 257.6], [26.5, DECKS[4] + H, 263.2]);
for (const st of TURBOLIFT.stations) {
  const [x, y, z] = st.door, e = st.end; // (the landing is on the e side of the door's plane, the car on the other)
  const za = z + e * 1.4, zb = z - e * 1.3;
  room(`tl-${st.id}`, 'Turbolift door', st.deck, 'door', [x - 1.12, y, Math.min(za, zb)], [x + 1.12, y + 2.5, Math.max(za, zb)], { turbolift: st.id });
}
// the shafts standing in the bays: walls for walkers (the car's own space is
// walkable while it stands there with its doors open: `shaft`; riders pass
// through it and the guideway's mouth: `ride`), boxes for craft
const TL_SHAFT_BOXES = [];
for (const s of [-1, 1]) {
  const X = (a, b) => [Math.min(s * a, s * b), Math.max(s * a, s * b)];
  const sb = (xa, xb, y0, y1, z0, z1, extra) => {
    const [x0, x1] = X(xa, xb);
    return { ...box([x0, y0, z0], [x1, y1, z1]), ...extra };
  };
  const st = s < 0 ? 'hangar_port' : 'hangar_starboard', room_ = s < 0 ? 'bay-p' : 'bay-s';
  solids.push(
    sb(103.82, 105.5, 0, 21.17, 189.82, 196.18, { room: room_, kind: 'shaft' }),       // the shaft's inboard wall, under the guideway's mouth
    sb(108.5, 110.18, 0, 26.03, 189.82, 196.18, { room: room_, kind: 'shaft' }),       // outboard
    sb(105.5, 108.5, 0, 26.03, 194.6, 196.18, { room: room_, kind: 'shaft' }),         // behind the car
    sb(105.5, 108.5, 3.2, 26.03, 189.82, 191.3, { room: room_, kind: 'shaft' }),       // over the landing door
    sb(105.5, 108.5, 0, 26.03, 191.3, 194.6, { room: room_, kind: 'shaft', shaft: st, ride: true }), // the car's own space
    sb(105.32, 105.5, 0, 3.38, 186, 189.82, { room: room_, kind: 'shaft' }),           // the portal in front of the door
    sb(108.5, 108.68, 0, 3.38, 186, 189.82, { room: room_, kind: 'shaft' }),
    sb(105.32, 108.68, 3.2, 3.38, 186, 189.82, { room: room_, kind: 'shaft' }),
    sb(102, 105.5, 21.17, 26.03, 189.82, 196.18, { room: room_, kind: 'shaft', ride: true }), // the guideway, out to the bay's wall
  );
  TL_SHAFT_BOXES.push(sb(103.82, 110.18, -0.83, 26.03, 189.82, 196.18), sb(105.32, 108.68, 0, 3.38, 186, 189.82), sb(102, 103.82, 21.17, 26.03, 189.82, 196.18));
}

// ---------------------------------------------------------------- seats
export const SEATS = [
  { pilot: true, pos: [0, DECKS[1], -282], eye: [0, DECKS[1] + 1.35, -282.3], stand: [0, DECKS[1], -279], heading: [0, 0, 1], label: 'Command seat', room: 'bridge' },
];

// ---------------------------------------------------------------- the hull (outside)
// The shapes small craft collide with: boxes fitted to the refit's exterior
// mesh, the bays left hollow (floor, walls, roof, aft wall), their mouths open
// (bastion-hull.data.js, made by tools/blender/hull_colliders.py); and the
// turbolift's shafts standing in the bays.
export const HULL = {
  // the drives: six main nozzles (three across, two high) and two flattened ones behind each bay
  engines: { xs: [-57.6, 0, 57.6], ys: [-10, 16], radius: 12.5, z: 570 },
  podEngines: { xs: [151.7, 180.3], y: 10, radius: 6, z: 553 },
  yachtFairing: box([-21.4, -28, -254], [21.4, -27.7, -200]),
};
const colliders = HULL_BOXES.map(([min, max]) => box(min, max));
for (const b of TL_SHAFT_BOXES) colliders.push(box(b.min, b.max));

// ---------------------------------------------------------------- lights
// Ceiling fixtures: one every ~14 m along each room (bays: two rows, brighter)
const lights = [];
for (const r of rooms) {
  const lx = r.max[0] - r.min[0], lz = r.max[2] - r.min[2];
  const bay = r.type === 'bay';
  const n = Math.max(1, Math.round(Math.max(lx, lz) / (bay ? 60 : 14)));
  const along = lz >= lx ? 2 : 0;
  const rows = bay ? [0.3, 0.7] : [0.5];
  for (const f of rows) for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const p = [0, r.max[1] - (bay ? 1.5 : 0.25), 0];
    p[along] = r.min[along] + (r.max[along] - r.min[along]) * t;
    const other = along === 2 ? 0 : 2;
    p[other] = r.min[other] + (r.max[other] - r.min[other]) * f;
    lights.push({ room: r.id, pos: p, color: bay ? 0xfff0dc : (r.type === 'bridge' || r.type === 'astrogation' ? 0xb8dcff : 0xffe2c4), intensity: bay ? 900 : (r.type === 'corridor' ? 6 : 10), range: bay ? 120 : 22 });
  }
}

export const BASTION = {
  name: 'Bastion-class carrier',
  length: 1254,
  decks: DECKS,
  rooms, doors, windows, solids, lights,
  lifts: LIFTS, turbolift: TURBOLIFT, seats: SEATS, bays,
  yacht: YACHT, pods: PODS,
  hull: HULL, colliders,
  engineHall: ENGINE_HALL, ftlCore: FTL_CORE,
};
