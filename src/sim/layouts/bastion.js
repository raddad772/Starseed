// Bastion-class carrier: the layout, the one source for both the game (rooms
// you walk, doors, lifts, seats, bays, hull colliders) and the Blender build
// that makes the model from it (tools/blender/build_carrier.py, fed by
// tools/export-layout.mjs). Plain data, no three.js, so Node can read it.
//
// Ship frame (metres): x to starboard, y up, z aft (the nose points to -z).
// y = 0 is the flight deck, level with both bay floors. 900 m long.
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
// Launchable craft: the captain's yacht in a ventral recess under the forward
// hull (boarded from the yacht dock on deck 5) and 16 escape pods in tubes in
// the hull flanks, two at each of eight pod stations on deck 3.
//
// Rooms are boxes { id, name, deck, type, min, max }; two rooms connect where
// their boxes overlap (a door is a small box overlapping both). Windows are
// openings in a room wall, on the hull side.

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
          dock: { pos: [side * 59.5, y + 1.6, z0 + dz], axis: [side, 0, 0] }, // the pod in its tube, nose outward
          launch: { dir: [side, 0, 0], speed: 25 },
        });
      }
    }
  }
  // bay control galleries, one over each bay
  room('gallery-pass-p', 'Port gallery passage', 3, 'corridor', [-56, y, -12], [-1.4, y + H, -8]);
  room('gallery-p', 'Port bay control', 3, 'baycontrol', [-65, y, -20], [-54, y + H, 0]);
  win('gallery-p', '-x', -18, -2, y + 1, y + 3.5);
  room('gallery-pass-s', 'Starboard gallery passage', 3, 'corridor', [1.4, y, -12], [56, y + H, -8]);
  room('gallery-s', 'Starboard bay control', 3, 'baycontrol', [54, y, -20], [65, y + H, 0]);
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
  for (const zc of [-100, 40, 200]) room(`cross-${zc}`, 'Bay passage', 4, 'corridor', [-66.6, y, zc - 2], [66.6, y + H, zc + 2], { pressureDoors: [-60, -66, 60, 66] });
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
// Open at the forward end (z -150) behind a force field; floors level with
// deck 4. Seven pads in each, along the outer side; ships park nose to the mouth.
const BAY = { x0: 67, x1: 133, y0: 0, y1: 25, z0: -150, z1: 321 };
export const PADS_Z = [-100, -36, 28, 92, 156, 220, 284];
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
    pads: PADS_Z.map((z) => [side * 114, 0, z]),
  });
}

// ---------------------------------------------------------------- the captain's yacht
// Rides in a recess under the forward hull, its belly continuing the keel
// line; boarded through the hatch in the yacht dock's floor, launched by
// dropping it clear of the recess.
export const YACHT = {
  label: "Captain's yacht",
  recess: box([-11, -28, -254], [11, -21, -200]),     // cut up into the hull
  dock: { pos: [0, -25.5, -227], heading: [0, 0, -1] }, // nose forward (its belly 2 m below the hull)
  size: [18, 9, 46],                                  // beam, height, length
  hatch: [0, DECKS[5], -242],                         // in the yacht dock's floor
  launch: { dir: [0, -1, 0], speed: 6 },
};

// ---------------------------------------------------------------- lifts
export const LIFTS = [
  { label: 'Forward lift', x: 8.5, z: -214, stops: [1, 2, 3, 4, 5].map((d) => ({ deck: d, y: DECKS[d] })) },
  { label: 'Midship lift', x: 8.5, z: -27, stops: [3, 4, 5].map((d) => ({ deck: d, y: DECKS[d] })) },
  { label: 'Aft lift', x: 8.5, z: 240, stops: [3, 4, 5].map((d) => ({ deck: d, y: DECKS[d] })) },
];

// ---------------------------------------------------------------- seats
export const SEATS = [
  { pilot: true, pos: [0, DECKS[1], -282], eye: [0, DECKS[1] + 1.35, -282.3], stand: [0, DECKS[1], -279], heading: [0, 0, 1], label: 'Command seat', room: 'bridge' },
];

// ---------------------------------------------------------------- the hull (outside)
// The shapes the Blender build models and small craft collide with. The bays
// are left hollow (floor, walls, roof, aft wall), the mouth open.
export const HULL = {
  // the main hull's section: narrower on top, widest at the shoulders, sides sloping in below
  core: box([-60, -28, -280], [60, 36, 420]),
  section: { top: [38, 36], shoulder: [60, 18], bottom: [52, -28] },
  prow: { tip: -450 },
  island: { ...box([-30, 36, -300], [30, 50, -100]), frontLean: 8, top: 20, shoulder: [26, 44] }, // the front leans forward 8 m
  spine: box([-16, 36, -88], [16, 42, 380]), // (its nose slopes up over the first 12 m: clear of the island lounge's aft windows)
  pods: { x: [60, 140], y: [-6, 28], z: [-150, 330], wall: 6, roof: 2, floor: 6 }, // (roof and walls meet the bays' rooms)
  podEngines: { x: [84, 116], y: [2, 18], z: [330, 356] },
  engines: { xs: [-36, 0, 36], ys: [-10, 16], radius: 11, z: [420, 446], block: box([-50, -22, 400], [50, 30, 420]) },
  keel: box([-16, -36, -200], [16, -28, 100]),
};
const P = HULL.pods;
const colliders = [
  box([-60, -28, -280], [60, 18, 420]), box([-46, 18, -280], [46, 36, 420]), // the main hull, its sloped top in two steps
  box([-46, -24, -340], [46, 28, -280]), box([-30, -18, -400], [30, 20, -340]), box([-16, -10, -450], [16, 10, -400]), // the prow, stepped
  box([-30, 36, -300], [30, 50, -100]),
  HULL.spine,
  HULL.keel,
  box([-50, -22, 420], [50, 30, 446]),
];
for (const s of [-1, 1]) {
  const xo = s * P.x[1], xi = s * P.x[0];
  const lo = (a, b) => Math.min(a, b), hi = (a, b) => Math.max(a, b);
  colliders.push(
    box([lo(xo - s * P.wall, xo), P.y[0], P.z[0]], [hi(xo - s * P.wall, xo), P.y[1], P.z[1]]),       // outer wall
    box([lo(xi, xi + s * P.wall), P.y[0], P.z[0]], [hi(xi, xi + s * P.wall), P.y[1], P.z[1]]),       // inner wall
    box([lo(xi, xo), P.y[0], P.z[0]], [hi(xi, xo), 0, P.z[1]]),                                     // floor (top at deck 4)
    box([lo(xi, xo), P.y[1] - P.roof, P.z[0]], [hi(xi, xo), P.y[1], P.z[1]]),                         // roof
    box([lo(xi, xo), P.y[0], BAY.z1], [hi(xi, xo), P.y[1], P.z[1]]),                                // aft wall
    box([lo(s * 84, s * 116), 4, 330], [hi(s * 84, s * 116), 20, 356]),                             // bay engine
  );
}

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
  length: 900,
  decks: DECKS,
  rooms, doors, windows, solids, lights,
  lifts: LIFTS, seats: SEATS, bays,
  yacht: YACHT, pods: PODS,
  hull: HULL, colliders,
  engineHall: ENGINE_HALL, ftlCore: FTL_CORE,
};
