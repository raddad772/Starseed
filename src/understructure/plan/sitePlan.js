// Graph-first megastructure planner.
//
// A founders' outpost under a world with (or that once had) life: a few huge
// machine volumes (archive vaults, generator halls, sampling shafts, cisterns)
// and the founders' own access shaft, sealed from outside. A later visitor
// tunnelled down and broke in at an arbitrary point: that break-in is where the
// player starts. The route is planned first: a single climbing path from the
// break-in to the data core beside the access shaft, crossing the big volumes
// on catwalks at higher and higher levels, with at least one other space and a
// climb between two crossings of the same volume. Passages run through the
// gaps between the volumes, hugging their hulls. Short dead-end spurs hold
// most of the optional finds. It is not a maze: the main route has no choices
// beyond those spurs.
//
// Plan coordinates: x, z in plan (metres), y up; y = 0 is the break-in level
// (the old DECK). Nothing here builds meshes: compile.js turns a plan into
// floors, walls and collision.

import { Rng, normalizeSeed } from '../../core/rng.js';
import * as G from './geom2.js';
import { pickThemes, placeGates } from './themes.js';

export const PLAN_VERSION = 2;
export const SURFACE_Y = 240; // the break-in level is this far below the surface

const KINDS = {
  archive: { name: 'ARCHIVE VAULT', r: [30, 48], pit: [18, 34], head: [14, 26], sides: [6, 8] },
  generator: { name: 'GENERATOR HALL', r: [32, 50], pit: [20, 40], head: [16, 30], sides: [6, 8] },
  sampler: { name: 'SAMPLING SHAFT', r: [20, 30], pit: [40, 80], head: [30, 60], sides: [7, 9] },
  cistern: { name: 'CISTERN', r: [28, 44], pit: [24, 40], head: [10, 20], sides: [5, 7], wet: true },
  exchange: { name: 'HEAT EXCHANGE', r: [26, 40], pit: [14, 26], head: [12, 24], sides: [5, 6] },
};
const CORRIDOR_W = 2.2;       // corridor half-width (room to walk two abreast, not a crawl)
const CORRIDOR_H = 4.2;       // its height
const SPUR_W = 0.8;           // a spur's width, of a corridor's
const SPUR_H = 3.6;
const ROUTE_CLEAR = 4.5;      // paths keep this far from other volumes' footprints
const WALL_GAP = 1.0;         // minimum solid between two spaces
const STUB = ROUTE_CLEAR + 0.6;
const SLAB = 1.2;             // floor/ceiling slab between stacked spaces

const r2 = (v) => Math.round(v * 100) / 100;

export function planSite(seed = 'SUMP-07', { themes = [], environment = {} } = {}) {
  seed = normalizeSeed(seed) || 'SUMP-07';
  const root = Rng.fromString(`megaplan-v${PLAN_VERSION}:${seed}`);
  let last = null;
  for (let attempt = 0; attempt < 80; attempt++) {
    const plan = tryPlan(seed, root.fork(attempt), themes, environment);
    if (plan.ok) { plan.attempt = attempt; return plan; }
    last = plan;
  }
  throw new Error(`megastructure plan failed for ${seed}: ${last?.why}`);
}

function tryPlan(seed, rng, themes, environment) {
  const wet = environment.water !== false;
  const fail = (why) => ({ ok: false, why });

  // --- 1. Machine volumes and the order the route crosses them -------------
  const pool = Object.keys(KINDS).filter((k) => wet || !KINDS[k].wet);
  rng.fork('kinds').shuffle(pool);
  const nBig = rng.chance(0.6) ? 3 : 2;
  const kinds = pool.slice(0, nBig);
  const order = visitOrder(rng.fork('order'), nBig);
  const hr = rng.fork('heights');
  const heights = [];
  let h = hr.range(0, 3);
  for (let i = 0; i < order.length; i++) { heights.push(r2(h)); h += hr.range(9, 15); }
  const hTop = r2(h - hr.range(0, 4));

  const landmarks = [];
  const lr = rng.fork('landmarks');
  for (let i = 0; i < nBig; i++) {
    const K = KINDS[kinds[i]], hv = heights.filter((_, j) => order[j] === i);
    const r = lr.range(...K.r), sides = lr.int(...K.sides), aspect = lr.range(0.68, 1);
    landmarks.push({
      id: `L${i}`, kind: kinds[i], name: K.name, r, sides, aspect, rot: lr.range(0, Math.PI),
      y0: r2(Math.min(...hv) - lr.range(...K.pit)), y1: r2(Math.max(...hv) + lr.range(...K.head)),
    });
  }
  if (!packLandmarks(lr, landmarks)) return fail('landmark packing');
  // founders' access shaft beside the last volume crossed, out from the cluster
  const lastL = landmarks[order.at(-1)], cl = clusterCentre(landmarks);
  const access = { id: 'ACCESS', kind: 'access', name: 'FOUNDERS ACCESS', r: lr.range(8, 11), sides: 8, aspect: 1, rot: lr.range(0, 1), y0: r2(hTop - 8), y1: SURFACE_Y };
  if (!placeBeside(lr, access, lastL, landmarks, cl, [10, 20])) return fail('access placement');
  const vols = [...landmarks, access];
  // the data core: beside the founders' shaft, facing the way the route arrives
  const core = { id: 'core', kind: 'core', name: 'DATA CORE', y0: hTop, y1: r2(hTop + lr.range(5, 6.5)), gravity: 1 };
  {
    const toward = G.norm(G.sub(lastL.center, access.center)), a0 = Math.atan2(toward[1], toward[0]);
    let ok = false;
    for (let t = 0; t < 80 && !ok; t++) {
      const a = a0 + (t % 2 ? 1 : -1) * Math.floor((t + 1) / 2) * 0.22, rr = lr.range(5, 6.5);
      const d = access.r + rr + lr.range(6, 9), c = G.add(access.center, [Math.cos(a) * d, Math.sin(a) * d]);
      core.poly = G.regularPoly(c[0], c[1], rr, rr * lr.range(0.8, 1), lr.pick([6, 7, 8]), lr.range(0, Math.PI));
      core.center = c;
      ok = vols.every((v) => !G.polysOverlap(core.poly, v.poly, v === access ? 5 : 7));
    }
    if (!ok) return fail('core placement');
  }

  // --- 2. The break-in: a rough staging room outside the first volume --------
  const firstL = landmarks[order[0]];
  const staging = { id: 'staging', kind: 'staging', name: 'BREACH STAGING', y0: heights[0], y1: heights[0] + 5.6, gravity: 1 };
  {
    let ok = false;
    for (let t = 0; t < 60 && !ok; t++) {
      const away = G.norm(G.sub(firstL.center, cl));
      const a = Math.atan2(away[1], away[0]) + lr.range(-1.2, 1.2);
      const d = firstL.r + lr.range(16, 26);
      const c = G.add(firstL.center, [Math.cos(a) * d, Math.sin(a) * d]);
      staging.poly = G.regularPoly(c[0], c[1], lr.range(7, 9), lr.range(5.5, 7), 6, lr.range(0, Math.PI));
      ok = [...vols, core].every((v) => !G.polysOverlap(staging.poly, v.poly, 6));
    }
    if (!ok) return fail('staging placement');
    staging.center = G.centroid(staging.poly);
  }

  // --- 3. Route: crossings joined by chains of rooms through the gaps -------
  const S = new Space();
  for (const v of vols) S.addSolid(v.poly, v.y0, v.y1, v.id, true);
  S.addSolid(staging.poly, staging.y0, staging.y1, staging.id);
  S.addSolid(core.poly, core.y0, core.y1, core.id);
  const nodes = [staging], links = [], route = [staging.id];
  const pr = rng.fork('portals'), cr = rng.fork('chains');
  let prevOut = { p: staging.center, y: heights[0], node: staging, ownPoly: staging.poly };
  const crossings = [];
  for (let i = 0; i <= order.length; i++) {
    const final = i === order.length;
    const L = final ? core : landmarks[order[i]];
    const y = final ? hTop : heights[i];
    const nextC = final ? null : (i + 1 < order.length ? landmarks[order[i + 1]].center : core.center);
    const entry = portalOn(pr, L, prevOut.p, y, null);
    const exit = final ? null : portalOn(pr, L, nextC, y, entry.face);
    const chain = buildChain(cr.fork(i), S, prevOut, entry, L, i, final ? core.id : `X${i}`);
    if (!chain) return fail(`chain ${i}`);
    for (const n of chain.nodes) { nodes.push(n); route.push(n.id); }
    links.push(...chain.links);
    if (final) break;
    const cross = { id: `X${i}`, kind: 'crossing', landmark: L.id, visit: i, name: L.name, y0: y, y1: y + CORRIDOR_H + 0.4, gravity: 1, entry, exit, walk: [entry.at, exit.at] };
    for (const c of crossings) if (c.landmark === L.id && Math.abs(c.y0 - y) < 6) return fail('stacked crossings');
    cross.poly = G.segRect(cross.walk[0], cross.walk[1], 1.4, 0.4);
    nodes.push(cross); route.push(cross.id); crossings.push(cross);
    prevOut = { p: exit.out, y, node: cross, portal: exit };
  }
  nodes.push(core); route.push(core.id);
  // a short passage from the core into the founders' shaft, onto its lift deck
  {
    const ae = portalOn(pr, access, core.center, hTop, null);
    const lk = { id: 'kcore', a: core.id, b: 'access', kind: 'corridor', main: true, path: [core.center, ae.out, ae.at].map(([x, z]) => [r2(x), hTop, r2(z)]), width: CORRIDOR_W, height: CORRIDOR_H };
    const blocked = S.inBand(hTop - 1, hTop + 4, [core.id, access.id]).some((o) => segs(lk).some((sg) => G.polysOverlap(sg.poly, o.poly, 0.3)));
    if (blocked) return fail('core to access');
    links.push(lk); for (const sg of segs(lk)) S.addSolid(sg.poly, sg.y0, sg.y1, lk.id);
    const acc = { id: 'access', kind: 'access', landmark: access.id, name: 'FOUNDERS ACCESS', y0: hTop, y1: hTop + CORRIDOR_H + 0.4, gravity: 1, entry: ae, walk: [ae.at, G.lerp(ae.at, access.center, 0.85)] };
    acc.poly = G.segRect(acc.walk[0], acc.walk[1], 1.4, 0.4);
    nodes.push(acc); route.push(acc.id); crossings.push(acc);
  }

  // --- 4. Spurs: short dead ends off the route -------------------------------
  const spurs = addSpurs(rng.fork('spurs'), S, nodes, links);
  addCollapses(rng.fork('collapses'), S, nodes, links);

  // every doorway needs a facet of its own: drop spurs that would not leave room
  // for one, and re-plan if a doorway on the route cannot have one
  for (let guard = 0; guard < 12; guard++) {
    const bad = facetDoors(nodes, links, true);
    if (!bad.length) break;
    const spur = bad.find((l) => !l.main);
    if (!spur) return fail('door facets');
    links.splice(links.indexOf(spur), 1);
    if (spur.kind === 'collapse') continue;   // (a fall of rock: just not there)
    const dead = spur.a.startsWith('D') ? spur.a : spur.b;
    for (let i = links.length - 1; i >= 0; i--) if (links[i].a === dead) links.splice(i, 1);   // (and its own falls)
    nodes.splice(nodes.findIndex((n) => n.id === dead), 1);
    spurs.splice(spurs.findIndex((n) => n.id === dead), 1);
  }
  facetDoors(nodes, links, false);

  // --- 5. Machinery inside the big volumes -----------------------------------
  const machines = [];
  const mr = rng.fork('machines');
  for (const L of landmarks) machines.push(...fillMachinery(mr.fork(L.id), L, crossings.filter((c) => c.landmark === L.id)));

  // --- 6. Finds ---------------------------------------------------------------
  // --- 7. Themes: three of six, each with a gate on the route and its keys -------
  const siteThemes = pickThemes(Rng.fromString(`megaplan-themes:${seed}`), themes);
  const gates = placeGates(rng.fork('gates'), { nodes, links, route, spurs }, siteThemes);

  const finds = placeFinds(rng.fork('finds'), nodes, spurs, crossings, links, gates);

  const plan = {
    ok: true, version: PLAN_VERSION, seed, themes: siteThemes, gates, environment, surfaceY: SURFACE_Y,
    landmarks, access, nodes, links, route, machines, finds,
    entry: { node: 'staging', tunnel: G.lerp(staging.center, G.add(staging.center, G.norm(G.sub(staging.center, cl))), 4) },
    exit: { node: 'access' },
  };
  plan.stats = stats(plan);
  return plan;
}

// A visit order over nBig volumes: no volume twice in a row, every volume at
// least twice, 4-6 visits.
function visitOrder(rng, n) {
  for (;;) {
    const len = n === 2 ? 4 : rng.int(5, 6), seq = [];
    for (let i = 0; i < len; i++) {
      const opts = [...Array(n).keys()].filter((k) => k !== seq.at(-1));
      seq.push(rng.pick(opts));
    }
    const counts = Array(n).fill(0);
    for (const k of seq) counts[k]++;
    if (counts.every((c) => c >= 2)) return seq;
  }
}

function clusterCentre(ls) {
  let x = 0, z = 0;
  for (const l of ls) { x += l.center[0]; z += l.center[1]; }
  return [x / ls.length, z / ls.length];
}

function shape(l, c) {
  l.center = c;
  l.poly = G.regularPoly(c[0], c[1], l.r, l.r * l.aspect, l.sides, l.rot);
}

// Volumes close together but never touching: 12-26 m gaps.
function packLandmarks(rng, ls) {
  shape(ls[0], [0, 0]);
  for (let i = 1; i < ls.length; i++) {
    let ok = false;
    for (let t = 0; t < 200 && !ok; t++) {
      const host = ls[rng.int(0, i - 1)], a = rng.range(0, Math.PI * 2);
      const d = host.r + ls[i].r + rng.range(12, 26);
      shape(ls[i], G.add(host.center, [Math.cos(a) * d, Math.sin(a) * d]));
      ok = ls.slice(0, i).every((o) => !G.polysOverlap(ls[i].poly, o.poly, 12));
    }
    if (!ok) return false;
  }
  return true;
}

function placeBeside(rng, v, host, others, cl, gap) {
  for (let t = 0; t < 200; t++) {
    const away = G.norm(G.sub(host.center, cl));
    const a = Math.atan2(away[1], away[0]) + rng.range(-1.4, 1.4);
    const d = host.r + v.r + rng.range(...gap);
    shape(v, G.add(host.center, [Math.cos(a) * d, Math.sin(a) * d]));
    if (others.every((o) => !G.polysOverlap(v.poly, o.poly, gap[0]))) return true;
  }
  return false;
}

// A doorway on the face of volume L that best faces point `toward` (and is not
// face `avoid`), at height y. `at` is on the wall, `out` is STUB outside it.
function portalOn(rng, L, toward, y, avoid) {
  const P = L.poly, want = G.norm(G.sub(toward, L.center));
  let faces = P.map((a, i) => {
    const b = P[(i + 1) % P.length], n = G.norm([b[1] - a[1], a[0] - b[0]]);
    return { i, a, b, n, score: G.dot(n, want) };
  });
  const longest = Math.max(...faces.map((f) => G.dist(f.a, f.b)));
  faces = faces.filter((f) => f.i !== avoid && G.dist(f.a, f.b) >= Math.min(8, longest * 0.7)).sort((p, q) => q.score - p.score);
  const f = faces[rng.chance(0.75) ? 0 : Math.min(1, faces.length - 1)];
  const at = G.lerp(f.a, f.b, rng.range(0.3, 0.7));
  return { face: f.i, at, n: f.n, out: G.add(at, G.mul(f.n, STUB)), y };
}

// Occupied space: plan footprints with a height band.
class Space {
  constructor() { this.items = []; }
  addSolid(poly, y0, y1, id, volume = false) { this.items.push({ poly, y0, y1, id, volume }); }
  inBand(y0, y1, skip = []) { return this.items.filter((s) => s.y1 + SLAB > y0 && s.y0 - SLAB < y1 && !skip.includes(s.id)); }
}

// Free room radius at p among footprints `obs` (distance to the nearest).
function clearance(p, obs) {
  let d = Infinity;
  for (const o of obs) d = Math.min(d, G.sdPoly(p, o.poly));
  return d;
}

// Rooms from prev.p (outside the previous space) to the target portal: the
// shortest way around everything in the height band, a climb room where the
// gap is widest, and one or two ordinary rooms spaced along the way.
// Down the middle of the gaps when they are wide enough (rooms then fit on
// the line), hugging the hulls when they are not.
function buildChain(rng, S, prev, entry, L, idx, targetId) {
  for (const clear of [7.5, 6, ROUTE_CLEAR]) {
    const got = buildChainAt(rng.fork(clear), S, prev, entry, L, idx, targetId, clear);
    if (got) return got;
  }
  return null;
}

function buildChainAt(rng, S, prev, entry, L, idx, targetId, clearance) {
  const ya = prev.y, yb = entry.y, dy = yb - ya;
  const band = [Math.min(ya, yb) - 1, Math.max(ya, yb) + 6];
  const obsAll = S.inBand(band[0], band[1]);
  const obsRaw = obsAll.filter((o) => o.id !== prev.node.id);
  const start = prev.p, goal = entry.out;
  const inflated = obsRaw.map((o) => {
    // never let the endpoints sit inside an inflated obstacle
    const lim = Math.min(G.sdPoly(start, o.poly), G.sdPoly(goal, o.poly)) - 0.3;
    return G.inflate(o.poly, Math.max(0.5, Math.min(clearance, lim)));
  });
  const core = G.shortestPath(start, goal, inflated);
  if (!core) return null;
  // the route as vertices; stubs through the walls at both ends; rooms are vertices too
  let path = [...(prev.portal ? [{ p: prev.portal.at, fixed: true }] : []), ...core.map((p) => ({ p })), { p: entry.at, fixed: true }];
  const pts = () => path.map((v) => v.p);
  const placed = [];
  const hitsInflated = (a, b) => inflated.some((o) => G.segHitsPoly(a, b, o));
  const segClear = (a, b, skipRooms) => placed.every((r) => skipRooms.includes(r) || !G.segHitsPoly(a, b, r.fat));

  // a room of radius r near arc length s, offset across the route if need be
  const tryRoom = (s, r, room) => {
    const P = pts(), at = G.along(P, s);
    if (path[at.seg].fixed && at.seg === 0 && prev.portal) return null;
    if (at.seg >= path.length - 2) return null; // not in the stub into the next volume
    const nrm = G.perp(at.dir);
    for (const o of [0, 3, -3, 6, -6, 9, -9, 13, -13]) {
      const c = G.add(at.p, G.mul(nrm, o));
      room.place(c, at.dir);
      if (obsAll.some((q) => G.polysOverlap(room.poly, q.poly, WALL_GAP))) continue;
      if (placed.some((q) => G.polysOverlap(room.poly, q.poly, WALL_GAP + 2))) continue;
      const i = at.seg, v0 = path[i], v1 = path[i + 1];
      if (hitsInflated(v0.p, c) || hitsInflated(c, v1.p)) continue;
      if (!segClear(v0.p, c, [v0.room]) || !segClear(c, v1.p, [v1.room])) continue;
      // nor may the detour cross another stretch of the route
      let tangled = false;
      for (let k = 1; k < path.length && !tangled; k++) {
        if (k === i + 1) continue;
        const a = path[k - 1].p, b = path[k].p;
        tangled = G.segsCross(v0.p, c, a, b) || G.segsCross(c, v1.p, a, b);
      }
      if (tangled) continue;
      // the two passages at a room must not touch just outside its wall
      // (a climb room's ways in and out are a storey or more apart: they cannot)
      if (room.kind !== 'climb' && stubsTouch(room.poly, c, v0.p, v1.p)) continue;
      if (!facetsOk(room.poly, c, [G.sub(v0.p, c), G.sub(v1.p, c)])) continue;
      if (v0.room && i > 0 && !facetsOk(v0.room.poly, v0.p, [G.sub(path[i - 1].p, v0.p), G.sub(c, v0.p)])) continue;
      if (v1.room && i + 2 < path.length && !facetsOk(v1.room.poly, v1.p, [G.sub(c, v1.p), G.sub(path[i + 2].p, v1.p)])) continue;
      if (v0.room && v0.room.kind !== 'climb' && i > 0 && stubsTouch(v0.room.poly, v0.p, path[i - 1].p, c)) continue;
      if (v1.room && v1.room.kind !== 'climb' && i + 2 < path.length && stubsTouch(v1.room.poly, v1.p, c, path[i + 2].p)) continue;
      // no other stretch of the route may pass through the new room
      const fat = G.inflate(room.poly, CORRIDOR_W + 0.3);
      let crosses = false;
      for (let k = 1; k < path.length && !crosses; k++) if (k !== i + 1) crosses = G.segHitsPoly(path[k - 1].p, path[k].p, fat);
      if (crosses) continue;
      room.fat = fat;
      path.splice(i + 1, 0, { p: c, room });
      placed.push(room);
      return room;
    }
    return null;
  };
  const roomMaker = (id, kind, r, mode, aspect0) => {
    const sides = kind === 'gallery' ? rng.pick([6, 8]) : rng.pick([5, 6, 6, 7, 8]), twist = kind === 'gallery' ? rng.range(-0.08, 0.08) : rng.range(-0.3, 0.3);
    const aspect = aspect0 ?? (kind === 'climb' ? rng.range(0.85, 1) : rng.range(0.62, 0.95));
    const room = { id, kind: kind === 'gallery' ? 'room' : kind, gallery: kind === 'gallery', gravity: 1, mode, name: kind === 'climb' ? (mode === 'zero-g' ? 'NULL WELL' : 'BROKEN DECKS') : kind === 'gallery' ? 'PIPE GALLERY' : 'SERVICE SPACE' };
    room.place = (c, dir) => { room.center = c; room.poly = G.regularPoly(c[0], c[1], r, r * aspect, sides, Math.atan2(dir[1], dir[0]) + twist); };
    return room;
  };

  const climb = Math.abs(dy) > 3.5;
  if (climb) {
    const mode0 = Math.abs(dy) >= 11 ? 'zero-g' : 'low-g';
    const r0 = mode0 === 'zero-g' ? rng.range(4.5, 6.5) : rng.range(6.5, 9);
    // a low-gravity room needs space for its decks to spiral without stacking
    // overhead; where there is not, the climb is a zero-g well instead
    const sizes = mode0 === 'zero-g' ? [[r0, 'zero-g'], [r0 * 0.8, 'zero-g'], [4.2, 'zero-g']] : [[r0, 'low-g'], [Math.max(6.2, r0 * 0.85), 'low-g'], [5.2, 'zero-g'], [4.2, 'zero-g']];
    let got = null;
    for (const [r, mode] of sizes) {
      const room = roomMaker(`C${idx}`, 'climb', r, mode);
      room.name = mode === 'zero-g' ? 'NULL WELL' : 'BROKEN DECKS'; room.mode = mode;
      const L0 = G.polylineLength(pts());
      for (const f of [0.5, 0.35, 0.65, 0.2, 0.8, 0.1, 0.9]) if ((got = tryRoom(L0 * f, r, room))) break;
      if (got) break;
    }
    if (!got) return null;
  }
  // ordinary rooms: one per ~26 m of route, at least one
  const want = Math.max(1, Math.min(3, Math.round(G.polylineLength(pts()) / 26)));
  for (let k = 0; k < want; k++) {
    const r = rng.range(5.5, 8.5), room = roomMaker(`R${idx}.${k}`, 'room', r);
    const f = (k + 1) / (want + 1) + rng.range(-0.08, 0.08);
    for (const df of [0, 0.12, -0.12, 0.24, -0.24]) if (tryRoom(G.polylineLength(pts()) * Math.max(0.05, Math.min(0.95, f + df)), r, room)) break;
  }
  // break up long stretches: a gallery along the route, or a small junction
  for (let t = 0, extra = 0; t < 10; t++) {
    const P = pts(), cum = [0];
    for (let i = 1; i < P.length; i++) cum.push(cum[i - 1] + G.dist(P[i - 1], P[i]));
    const stops = [0, ...path.map((v, i) => (v.room ? cum[i] : null)).filter((x) => x !== null), cum.at(-1)];
    let worst = 0, at = 0;
    for (let i = 1; i < stops.length; i++) if (stops[i] - stops[i - 1] > worst) { worst = stops[i] - stops[i - 1]; at = (stops[i] + stops[i - 1]) / 2; }
    if (worst <= 28) break;
    if (t === 9 && worst > 34) return null; // still a long bare passage: plan this stretch another way
    const long = Math.min(11, worst / 3.2);
    const tries = [roomMaker(`G${idx}.${extra}`, 'gallery', long, null, rng.range(0.28, 0.4)), roomMaker(`J${idx}.${extra}`, 'room', 3.2)];
    let ok = false;
    for (const room of tries) {
      const r = room.gallery ? long : 3.2;
      for (const df of [0, 4, -4, 8, -8]) if ((ok = !!tryRoom(at + df, r, room))) break;
      if (ok) break;
    }
    if (ok) extra++;
  }
  if (!placed.length && Math.abs(dy) > 0.5) return null;
  // heights: rooms before the climb at ya, after it at yb
  let y = ya;
  for (const v of path) {
    if (!v.room) continue;
    const n = v.room;
    if (n.kind === 'climb') {
      n.y0 = r2(Math.min(ya, yb)); n.top = r2(yb); n.y1 = r2(Math.max(ya, yb) + 5.2); n.climb = { from: r2(ya), to: r2(yb) };
      n.gravity = n.mode === 'zero-g' ? 0 : 0.25; y = yb;
    } else { n.y0 = r2(y); n.y1 = r2(y + rng.range(5.5, 8.5)); }
  }
  if (!climb) y = yb;
  // links: previous space -> rooms -> next volume, each corridor at its level
  const links = [], nodes = placed.slice().sort((a, b) => path.findIndex((v) => v.room === a) - path.findIndex((v) => v.room === b));
  let from = prev.node.id, run = [], level = ya;
  for (const v of path) {
    if (v.room) {
      const n = v.room, yIn = n.kind === 'climb' ? ya : n.y0;
      run.push([...v.p, yIn]);
      links.push(corridor(`k${idx}.${links.length}`, from, n.id, run.map(([x, z, yy]) => [x, z, yy ?? yIn])));
      from = n.id; level = n.kind === 'climb' ? yb : n.y0;
      run = [[...v.p, level]];
    } else run.push([...v.p, null]);
  }
  links.push(corridor(`k${idx}.${links.length}`, from, targetId, run.map(([x, z, yy]) => [x, z, yy ?? level])));
  // the last corridor must arrive at the portal's height
  for (const q of links.at(-1).path) q[1] = r2(yb);
  // nor may a passage brush a hall it doesn't open into (one let in close to an end, so the end
  // isn't inside it, is kept clear on the rest of the way)
  const halls = obsAll.filter((o) => o.volume);
  for (let k = 0; k < links.length; k++) {
    const l = links[k], opens = new Set([l.a, l.b, k === 0 ? prev.node.landmark : null, k === links.length - 1 ? L?.id : null]);
    for (const sg of segs(l)) for (const o of halls) if (!opens.has(o.id) && sg.y1 + SLAB > o.y0 && sg.y0 - SLAB < o.y1 && G.polysOverlap(sg.poly, o.poly, 0.3)) return null;
  }
  for (const n of nodes) { S.addSolid(n.poly, n.y0, n.y1, n.id); delete n.place; delete n.fat; }
  for (const l of links) for (const seg of segs(l)) S.addSolid(seg.poly, seg.y0, seg.y1, l.id);
  return { nodes, links, lastId: nodes.at(-1)?.id ?? prev.node.id };
}

// Do the passages from room centre c toward a and toward b overlap in the
// first stretch outside the room (each with its walls and a margin)?
function stubsTouch(poly, c, a, b) {
  const fat = G.inflate(poly, WALL_GAP * 0.5);
  const stub = (to) => {
    const d = G.norm(G.sub(to, c)), L = G.dist(c, to);
    let lo = 0, hi = L;
    for (let k = 0; k < 24; k++) { const m = (lo + hi) / 2; if (G.inside(G.add(c, G.mul(d, m)), fat)) lo = m; else hi = m; }
    const s0 = Math.min(hi, L), s1 = Math.min(L, s0 + 5);
    if (s1 - s0 < 0.2) return null;
    return G.segRect(G.add(c, G.mul(d, s0)), G.add(c, G.mul(d, s1)), CORRIDOR_W + 0.5 + 0.2);
  };
  const p = stub(a), q = stub(b);
  return !!(p && q && G.polysOverlap(p, q, 0));
}

function arcOf(path, p) {
  let s = 0, best = Infinity, at = 0;
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1], b = path[i], e = G.sub(b, a), L = G.len(e);
    const t = L > 0 ? Math.max(0, Math.min(1, G.dot(G.sub(p, a), e) / (L * L))) : 0;
    const d = G.dist(p, G.lerp(a, b, t));
    if (d < best) { best = d; at = s + t * L; }
    s += L;
  }
  return at;
}
function subPath(path, s0, s1) {
  const out = [];
  let s = 0;
  for (let i = 1; i < path.length; i++) {
    s += G.dist(path[i - 1], path[i]);
    if (s > s0 + 0.01 && s < s1 - 0.01) out.push(path[i]);
  }
  return out;
}

function mkRoom(rng, id, kind, c, dir, r, ya, yb, mode) {
  const sides = rng.pick([5, 6, 6, 7, 8]);
  const rot = Math.atan2(dir[1], dir[0]) + rng.range(-0.25, 0.25);
  const aspect = kind === 'climb' ? 1 : rng.range(0.62, 0.95);
  const poly = G.regularPoly(c[0], c[1], r, r * aspect, sides, rot);
  const room = { id, kind, poly, center: c, gravity: 1, name: kind === 'climb' ? (mode === 'zero-g' ? 'NULL WELL' : 'BROKEN DECKS') : 'SERVICE SPACE' };
  if (kind === 'climb') {
    room.mode = mode; room.gravity = mode === 'zero-g' ? 0 : 0.25;
    room.y0 = r2(Math.min(ya, yb)); room.top = r2(yb); room.y1 = r2(Math.max(ya, yb) + 5.2);
    room.climb = { from: r2(ya), to: r2(yb) };
  } else {
    room.y0 = r2(ya); room.y1 = r2(ya + rng.range(5.5, 8.5));
  }
  return room;
}

function corridor(id, a, b, pts) {
  const path = pts.map(([x, z, y]) => [r2(x), r2(y), r2(z)]);
  return { id, a, b, kind: 'corridor', main: true, path, width: CORRIDOR_W, height: CORRIDOR_H };
}

// Plan footprints of a link's segments, for the occupancy record.
export function segs(l) {
  const out = [];
  for (let i = 1; i < l.path.length; i++) {
    const a = l.path[i - 1], b = l.path[i];
    if (Math.hypot(b[0] - a[0], b[2] - a[2]) < 0.05) continue;
    out.push({ poly: G.segRect([a[0], a[2]], [b[0], b[2]], l.width + 0.3), y0: Math.min(a[1], b[1]), y1: Math.max(a[1], b[1]) + l.height, a, b });
  }
  return out;
}

// Dead-end spurs off ordinary rooms and catwalk balconies off crossings.
// Ways that are ways no more: short passages off rooms and dead ends that end a few metres in at
// a fall of rock (the structure goes on past them, out of reach). Kept clear like any passage
function addCollapses(rng, S, nodes, links) {
  const hosts = nodes.filter((n) => n.kind === 'room' || n.kind === 'deadend');   // (the founders' ways: not off the visitors' rock)
  rng.shuffle(hosts);
  const target = rng.int(3, 6), w = CORRIDOR_W * 0.9;
  let made = 0;
  for (const h of hosts) {
    if (made >= target) break;
    const c = G.centroid(h.poly), y = h.y0;
    const attached = links.filter((l) => l.a === h.id || l.b === h.id), linked = attached.map((l) => l.id);
    const outDirs = attached.map((l) => { const q = l.a === h.id ? l.path[1] : l.path.at(-2); return G.norm(G.sub([q[0], q[2]], c)); });
    for (let t = 0; t < 8; t++) {
      const a = rng.range(0, Math.PI * 2), d = [Math.cos(a), Math.sin(a)];
      if (outDirs.some((o) => G.dot(o, d) > Math.cos(60 * Math.PI / 180))) continue;
      if (!facetsOk(h.poly, c, [...outDirs, d], w + 0.6)) continue;
      let lo = 0, hi = 40;
      for (let k = 0; k < 24; k++) { const m = (lo + hi) / 2; if (G.sdPoly(G.add(c, G.mul(d, m)), h.poly) < 0) lo = m; else hi = m; }
      const edge = G.add(c, G.mul(d, lo)), end = G.add(edge, G.mul(d, rng.range(5, 9)));
      const out = G.segRect(G.add(edge, G.mul(d, 0.6)), end, w + 0.3 + 0.5);
      const obs = S.inBand(y - 1, y + CORRIDOR_H + 2, [h.id]);
      if (obs.some((o) => !linked.includes(o.id) && G.polysOverlap(out, o.poly, WALL_GAP))) continue;
      S.addSolid(G.segRect(c, end, w + 0.3), y, y + CORRIDOR_H, `c${made}`);
      links.push({ id: `c${made}`, a: h.id, b: null, kind: 'collapse', main: false, path: [[r2(c[0]), y, r2(c[1])], [r2(end[0]), y, r2(end[1])]], width: w, height: CORRIDOR_H });
      outDirs.push(d); linked.push(`c${made}`); made++;
      break;
    }
  }
}

function addSpurs(rng, S, nodes, links) {
  const spurs = [];
  const hosts = nodes.filter((n) => n.kind === 'room' || n.kind === 'staging');
  rng.shuffle(hosts);
  const target = rng.int(5, 8);
  for (const h of hosts) {
    if (spurs.length >= target) break;
    const c = G.centroid(h.poly), y = h.y0;
    for (let t = 0; t < 10; t++) {
      const a = rng.range(0, Math.PI * 2), L = rng.range(10, 22), r = rng.range(4, 6);
      const d = [Math.cos(a), Math.sin(a)], end = G.add(c, G.mul(d, L));
      const room = { id: `D${spurs.length}`, kind: 'deadend', name: 'DEAD END', poly: G.regularPoly(end[0], end[1], r, r * rng.range(0.7, 1), rng.pick([5, 6, 8]), a), center: end, y0: y, y1: r2(y + rng.range(4.5, 6)), gravity: 1, spur: true };
      const corr = { poly: G.segRect(c, end, CORRIDOR_W * SPUR_W + 0.3), y0: y, y1: y + SPUR_H };
      const obs = S.inBand(y - 1, y + SPUR_H + 2, [h.id]);
      if (G.polysOverlap(room.poly, h.poly, WALL_GAP + 2)) continue;
      const attached = links.filter((l) => l.a === h.id || l.b === h.id), linked = attached.map((l) => l.id);
      const outDirs = attached.map((l) => { const q = l.a === h.id ? l.path[1] : l.path.at(-2); return G.norm(G.sub([q[0], q[2]], c)); });
      if (outDirs.some((o) => G.dot(o, d) > Math.cos(80 * Math.PI / 180))) continue;
      if (!facetsOk(h.poly, c, [...outDirs, d])) continue;
      if (obs.some((o) => G.polysOverlap(room.poly, o.poly, WALL_GAP))) continue;
      if (obs.some((o) => !linked.includes(o.id) && G.polysOverlap(corr.poly, o.poly, 0.4) && !G.polysOverlap(o.poly, h.poly, 0))) continue;
      S.addSolid(room.poly, room.y0, room.y1, room.id);
      S.addSolid(corr.poly, y, y + SPUR_H, `s${spurs.length}`);
      nodes.push(room);
      links.push({ id: `s${spurs.length}`, a: h.id, b: room.id, kind: 'corridor', main: false, path: [[r2(c[0]), y, r2(c[1])], [r2(end[0]), y, r2(end[1])]], width: CORRIDOR_W * SPUR_W, height: SPUR_H });
      spurs.push(room);
      break;
    }
  }
  return spurs;
}

// Can a room (poly, centre c) give each of its doorways (directions dirs, from
// the centre) a facet wide enough, with no facet slicing into another's span?
function facetsOk(poly, c, dirs, half = CORRIDOR_W + 0.6) {
  const fs = [];
  for (const u0 of dirs) {
    const u = G.norm(u0), side = G.perp(u);
    const fits = (s) => [1, -1].every((k) => G.inside(G.add(G.add(c, G.mul(u, s)), G.mul(side, k * half)), poly, 1e-6));
    if (!fits(0)) return false;
    let lo = 0, hi = Math.max(...poly.map((p) => G.dot(G.sub(p, c), u)));
    for (let k = 0; k < 24; k++) { const m = (lo + hi) / 2; if (fits(m)) lo = m; else hi = m; }
    if (lo < 0.8) return false;
    fs.push({ u, side, s: lo });
  }
  for (const f of fs) for (const g of fs) {
    if (f === g) continue;
    for (const k of [1, -1]) { const e = G.add(G.mul(f.u, f.s), G.mul(f.side, k * half)); if (G.dot(e, g.u) > g.s + 0.02) return false; }
  }
  return true;
}

// Every doorway gets a flat facet of its own: the room's polygon is cut
// square to the passage where it arrives, wide enough for the door and its
// jambs, so no doorway straddles a corner.
function facetDoors(nodes, links, dryRun) {
  const bad = [];
  for (const n of nodes) {
    if (n.kind === 'crossing' || n.kind === 'access') continue;
    const c = n.center || G.centroid(n.poly), orig = n.poly;
    // each doorway's facet, measured against the room's own outline...
    const doors = [];
    for (const l of links.filter((q) => q.a === n.id || q.b === n.id)) {
      const q = l.a === n.id ? l.path[1] : l.path.at(-2);
      const u = G.norm(G.sub([q[0], q[2]], c)), side = G.perp(u), half = l.width + 0.6;
      const fits = (s) => [1, -1].every((k) => G.inside(G.add(G.add(c, G.mul(u, s)), G.mul(side, k * half)), orig, 1e-6));
      let lo = 0, hi = Math.max(...orig.map((p) => G.dot(G.sub(p, c), u)));
      if (!fits(lo)) { bad.push(l); continue; }
      for (let k = 0; k < 30; k++) { const m = (lo + hi) / 2; if (fits(m)) lo = m; else hi = m; }
      if (lo < 0.8) { bad.push(l); continue; }
      doors.push({ l, u, side, half, s: lo, d: G.dot(c, u) + lo, at: G.add(c, G.mul(u, lo)) });
    }
    // ...all cut at once; a doorway fails only if another facet slices its span
    let poly = orig;
    for (const d of doors) poly = G.clipHalf(poly, d.u, d.d);
    for (const d of doors) {
      const ends = [G.add(d.at, G.mul(d.side, d.half)), G.add(d.at, G.mul(d.side, -d.half))];
      if (doors.some((o) => o !== d && ends.some((e) => G.dot(e, o.u) > o.d + 0.02))) bad.push(d.l);
    }
    if (!dryRun) n.poly = G.dedupe(poly.map((p) => [r2(p[0]), r2(p[1])]), 0.15);
  }
  return bad;
}

// Giant forms inside a volume: kept clear of its catwalks.
function fillMachinery(rng, L, crossings) {
  const out = [];
  const kindOf = { archive: 'rack', generator: 'reactor', sampler: 'column', cistern: 'tank', exchange: 'exchanger' }[L.kind];
  const n = L.kind === 'sampler' ? 1 : rng.int(4, 9);
  for (let t = 0; t < 300 && out.length < n; t++) {
    const a = rng.range(0, Math.PI * 2), rr = Math.sqrt(rng.next()) * L.r * 0.8;
    const c = L.kind === 'sampler' ? L.center : G.add(L.center, [Math.cos(a) * rr, Math.sin(a) * rr * L.aspect]);
    const r = L.kind === 'sampler' ? L.r * 0.32 : rng.range(3.5, 9);
    if (G.sdPoly(c, L.poly) > -(r + 2)) continue;
    const clear = crossings.every((x) => G.sdPoly(c, x.poly) > r + 2.5) && out.every((m) => G.dist(m.center, c) > m.r + r + 3);
    if (!clear) continue;
    out.push({ id: `${L.id}m${out.length}`, kind: kindOf, landmark: L.id, center: [r2(c[0]), r2(c[1])], r: r2(r), y0: L.y0, y1: r2(L.y1 - rng.range(0, 12)) });
  }
  return out;
}

// 1 unit at the break-in (the entry scan), 90 at the data core, and 33 more
// single units: enough to pass 100 and reach the 170 credit cap.
function placeFinds(rng, nodes, spurs, crossings, links, gates) {
  const finds = [];
  // (a climb's find on the ledge inside its top doorway, not in the air over the well: where the
  // passage out at the top leaves the room, 0.7 m in)
  const topLedge = (n) => {
    const l = links.find((k) => (k.a === n.id && Math.abs(k.path[0][1] - n.top) < 0.3) || (k.b === n.id && Math.abs(k.path.at(-1)[1] - n.top) < 0.3));
    if (!l) return null;
    const path = l.a === n.id ? l.path : [...l.path].reverse(), c = [path[0][0], path[0][2]], q = [path[1][0], path[1][2]], d = G.norm(G.sub(q, c));
    let lo = 0, hi = G.dist(c, q);
    for (let k = 0; k < 30; k++) { const m = (lo + hi) / 2; if (G.sdPoly(G.add(c, G.mul(d, m)), n.poly) < 0) lo = m; else hi = m; }
    const p = G.add(c, G.mul(d, Math.max(0, lo - 0.7)));
    return [p[0], n.top, p[1]];
  };
  // (and off a catwalk's span that comes and goes)
  const spanOf = new Map(gates.filter((g) => g.kind === 'span').map((g) => [g.node, g.span]));
  const put = (node, pos, units, kind) => finds.push({ id: `f${finds.length}`, node: node.id, pos: pos.map(r2), units, kind });
  const staging = nodes.find((n) => n.id === 'staging'), core = nodes.find((n) => n.kind === 'core');
  put(staging, [staging.center[0], staging.y0, staging.center[1]], 1, 'entry-scan');
  put(core, [core.center[0], core.y0, core.center[1]], 90, 'record');
  const slots = [];
  for (const s of spurs) for (let k = 0; k < 3; k++) slots.push({ node: s, weight: 3 });
  for (const x of crossings.filter((c) => c.kind === 'crossing')) for (let k = 0; k < 2; k++) slots.push({ node: x, weight: 2, walk: x.walk });
  for (const n of nodes.filter((n) => n.kind === 'climb')) slots.push({ node: n, weight: 2, top: true });
  for (const n of nodes.filter((n) => n.kind === 'room')) slots.push({ node: n, weight: 1 });
  rng.shuffle(slots);
  slots.sort((a, b) => b.weight - a.weight);
  let need = 33;
  for (let pass = 0; need > 0 && pass < 6; pass++) {
    for (const s of slots) {
      if (need <= 0) break;
      const n = s.node;
      let pos;
      if (s.walk) {
        const L = G.dist(s.walk[0], s.walk[1]), sp = spanOf.get(n.id);
        let t = rng.range(0.2, 0.8);
        for (let k = 0; sp && k < 12 && t * L > sp.from - 1.5 && t * L < sp.to + 1.5; k++) t = rng.range(0.2, 0.8);
        if (sp && t * L > sp.from - 1.5 && t * L < sp.to + 1.5) t = (sp.from - 1.5) / L > 0.15 ? (sp.from - 1.5) / L : (sp.to + 1.5) / L;
        const p = G.lerp(s.walk[0], s.walk[1], t); pos = [p[0], n.y0, p[1]];
      } else if (s.top) { pos = topLedge(n); if (!pos) continue; }
      else { const c = n.center || G.centroid(n.poly), j = [rng.range(-1.5, 1.5), rng.range(-1.5, 1.5)]; pos = [c[0] + j[0], n.y0, c[1] + j[1]]; }
      put(n, pos, 1, s.walk ? 'catwalk-cache' : n.kind === 'deadend' ? 'crawler' : 'shard');
      need--;
    }
  }
  return finds;
}

function stats(plan) {
  const main = plan.links.filter((l) => l.main && l.kind === 'corridor');
  const lens = main.map((l) => { let s = 0; for (let i = 1; i < l.path.length; i++) s += Math.hypot(l.path[i][0] - l.path[i - 1][0], l.path[i][2] - l.path[i - 1][2]); return s; });
  const rooms = plan.nodes.filter((n) => ['room', 'climb', 'core'].includes(n.kind));
  const units = plan.finds.reduce((s, f) => s + f.units, 0);
  return {
    volumes: plan.landmarks.length, crossings: plan.nodes.filter((n) => n.kind === 'crossing').length,
    routeRooms: rooms.length, spurs: plan.nodes.filter((n) => n.kind === 'deadend').length,
    climbs: plan.nodes.filter((n) => n.kind === 'climb').map((n) => `${n.mode} ${r2(n.climb.to - n.climb.from)}m`),
    corridorMax: r2(Math.max(...lens)), corridorTotal: r2(lens.reduce((a, b) => a + b, 0)),
    rise: r2(plan.nodes.find((n) => n.id === 'access').y0 - plan.nodes[0].y0),
    finds: plan.finds.length, rawUnits: units,
  };
}
