// Plan -> solids. Everything static in a site is a convex solid: an oriented
// prism (a convex polygon in a local u-v plane, extruded along w). The same
// list is drawn, collided with by walkers (a triangle BVH) and handed to the
// rigid-body solver as fixed hulls, so the three can never disagree.
//
// Doorways are real holes through thick walls: the jambs follow the passage's
// own lines through the wall, the sill of a doorway in a big volume's wall is
// the wall below it, and floor slabs meet edge to edge (never stacked), so no
// two faces share a plane.

import * as G from './geom2.js';
import { Rng } from '../../core/rng.js';
import { SURFACE_Y } from './sitePlan.js';

const WALL = 0.5;      // room and passage walls
const VOL_WALL = 2.2;  // the big volumes' shells
const SLAB = 0.4;
const DOOR_H = 3.0;

const X = [1, 0, 0], Y = [0, 1, 0], Z = [0, 0, 1];
// A vertical prism: polygon in plan (x, z), from y0 to y1.
export const vprism = (poly, y0, y1, mat, extra) => ({ o: [0, 0, 0], u: X, v: Z, w: Y, poly, w0: y0, w1: y1, mat, ...extra });

// A box from a to b (centre line), half-sizes across (hw) and vertically (hh).
function beam(a, b, hw, hh, mat, sides = 4) {
  const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], L = Math.hypot(...d);
  const w = d.map((x) => x / L);
  let u = Math.abs(w[1]) > 0.9 ? [1, 0, 0] : cross3([0, 1, 0], w);
  u = norm3(u); const v = cross3(w, u);
  const poly = sides === 4 ? [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]] : G.regularPoly(0, 0, hw, hh, sides, 0);
  return { o: a, u, v, w, poly, w0: 0, w1: L, mat };
}
const cross3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm3 = (a) => { const l = Math.hypot(...a) || 1; return a.map((x) => x / l); };

// Mitred offset of vertex i of a convex CCW polygon, outward by d.
function offsetVertex(poly, i, d) {
  const n = poly.length, p0 = poly[(i + n - 1) % n], p1 = poly[i], p2 = poly[(i + 1) % n];
  const o0 = G.norm(G.perp(G.sub(p0, p1))), o1 = G.norm(G.perp(G.sub(p1, p2)));
  const m = G.norm(G.add(o0, o1)), c = Math.max(G.dot(m, o0), 0.35);
  return G.add(p1, G.mul(m, d / c));
}
function intersectLines(p, dir, a, b) { // point on line a-b hit by the line through p along dir
  const e = G.sub(b, a), den = G.cross(dir, e);
  if (Math.abs(den) < 1e-9) return null;
  const t = G.cross(G.sub(a, p), dir) / den;
  return { t, at: G.add(a, G.mul(e, t)) };
}

// Walls of a convex room: thickness T outward from poly, floor..ceiling,
// with doorways. A doorway: { edge, inner: [s0, s1] params on the inner edge,
// outer: [t0, t1] on the outer edge, y0, y1 }. Each face is cut into vertical
// strips at every jamb; a strip is solid except where a doorway crossing it
// is open, so doorways stacked at different heights on one face both stay open.
function roomWalls(out, poly, T, yf, yc, doors, mat) {
  const n = poly.length, outer = poly.map((_, i) => offsetVertex(poly, i, T));
  for (let i = 0; i < n; i++) {
    const a = poly[i], b = poly[(i + 1) % n], A = outer[i], B = outer[(i + 1) % n];
    const P = (s) => G.lerp(a, b, s), Q = (t) => G.lerp(A, B, t);
    const ds = doors.filter((d) => d.edge === i);
    let cuts = [[0, 0], [1, 1]];
    for (const d of ds) cuts.push([d.inner[0], d.outer[0]], [d.inner[1], d.outer[1]]);
    cuts.sort((p, q) => p[0] - q[0]);
    // jambs of overlapping doorways may cross through the wall: square them up then
    if (cuts.some((c, k) => k && c[1] < cuts[k - 1][1] - 1e-6)) {
      const e = G.sub(B, A), L2 = G.dot(e, e), nrm = G.norm(G.perp(G.sub(a, b)));
      cuts = cuts.map(([s0]) => [s0, Math.max(0, Math.min(1, G.dot(G.sub(G.add(P(s0), G.mul(nrm, T)), A), e) / L2))]);
      cuts[0][1] = 0; cuts.at(-1)[1] = 1;
    }
    for (let k = 1; k < cuts.length; k++) {
      const [s0, t0] = cuts[k - 1], [s1, t1] = cuts[k];
      if ((s1 - s0) * G.dist(a, b) < 0.02 && (t1 - t0) * G.dist(A, B) < 0.02) continue;
      const mid = (s0 + s1) / 2;
      const open = ds.filter((d) => d.inner[0] <= mid && d.inner[1] >= mid).map((d) => [d.y0, d.y1]).sort((p, q) => p[0] - q[0]);
      let y = yf;
      const foot = G.ccw([P(s0), P(s1), Q(t1), Q(t0)]);
      for (const [o0, o1] of open) {
        if (o0 - y > 0.02) out.push(vprism(foot, y, o0, mat, { wall: true }));
        y = Math.max(y, o1);
      }
      if (yc - y > 0.02) out.push(vprism(foot, y, yc, mat, { wall: true }));
    }
  }
  return outer;
}

// A doorway where a passage (centre line p0 -> p1 crossing the wall, half-width w)
// passes through edge i of poly with wall thickness T.
function doorway(poly, T, cross, dir, w, y0, y1) {
  const n = poly.length, side = G.perp(dir);
  // the face the passage crosses: the one its crossing point lies on (at a
  // shared corner, the one it meets most squarely)
  let best = null;
  for (let i = 0; i < n; i++) {
    const a = poly[i], b = poly[(i + 1) % n], e = G.sub(b, a);
    const t = Math.max(0, Math.min(1, G.dot(G.sub(cross, a), e) / G.dot(e, e)));
    const d = G.dist(cross, G.add(a, G.mul(e, t))) - 0.02 * Math.abs(G.dot(G.norm(G.perp(e)), dir));
    if (!best || d < best.d) best = { i, d };
  }
  if (!best) return null;
  const i = best.i, a = poly[i], b = poly[(i + 1) % n];
  const A = offsetVertex(poly, i, T), B = offsetVertex(poly, (i + 1) % n, T);
  const L = (sgn) => G.add(cross, G.mul(side, sgn * w));
  const s = [intersectLines(L(-1), dir, a, b), intersectLines(L(1), dir, a, b)];
  const t = [intersectLines(L(-1), dir, A, B), intersectLines(L(1), dir, A, B)];
  if (s.some((q) => !q) || t.some((q) => !q)) return null;
  const clamp = (x) => Math.max(0.02, Math.min(0.98, x));
  const si = [clamp(Math.min(s[0].t, s[1].t)), clamp(Math.max(s[0].t, s[1].t))];
  const ti = [clamp(Math.min(t[0].t, t[1].t)), clamp(Math.max(t[0].t, t[1].t))];
  // the passage's own ends on the outer face, for trimming it
  const ends = [t[0].at, t[1].at];
  return { edge: i, inner: si, outer: ti, y0, y1, ends, sign: G.dot(side, G.sub(t[1].at, t[0].at)) > 0 ? 1 : -1 };
}

// Passage solids along a 2D centre line (flat at y), half-width w, from
// endpoint caps given as [left, right] points (or null for square ends).
function passage(out, pts, y, w, h, capA, capB, mats) {
  const n = pts.length;
  const L = [], R = [], Lo = [], Ro = [];
  for (let i = 0; i < n; i++) {
    const dIn = i > 0 ? G.norm(G.sub(pts[i], pts[i - 1])) : G.norm(G.sub(pts[1], pts[0]));
    const dOut = i < n - 1 ? G.norm(G.sub(pts[i + 1], pts[i])) : dIn;
    const nIn = G.perp(dIn), nOut = G.perp(dOut), m = G.norm(G.add(nIn, nOut));
    const k = 1 / Math.max(G.dot(m, nIn), 0.4);
    L.push(G.add(pts[i], G.mul(m, w * k))); R.push(G.add(pts[i], G.mul(m, -w * k)));
    Lo.push(G.add(pts[i], G.mul(m, (w + WALL) * k))); Ro.push(G.add(pts[i], G.mul(m, -(w + WALL) * k)));
  }
  // square the ends onto the walls they meet
  const fit = (cap, i, d) => {
    if (!cap) return;
    for (const [arr, off] of [[L, w], [R, -w], [Lo, w + WALL], [Ro, -(w + WALL)]]) {
      const base = G.add(pts[i], G.mul(G.perp(d), off));
      const hit = intersectLines(base, d, cap[0], cap[1]);
      if (hit) arr[i] = hit.at;
    }
  };
  fit(capA, 0, G.norm(G.sub(pts[1], pts[0]))); fit(capB, n - 1, G.norm(G.sub(pts[n - 1], pts[n - 2])));
  const quad = (p, q, r, s, y0, y1, mat, extra) => {
    const poly = G.ccw([p, q, r, s]);
    if (Math.abs(G.area(poly)) < 1e-3) return;
    if (G.convexHull(poly).length === 4) out.push(vprism(G.convexHull(poly), y0, y1, mat, extra));
    else { out.push(vprism(G.ccw([p, q, r]), y0, y1, mat, extra)); out.push(vprism(G.ccw([p, r, s]), y0, y1, mat, extra)); }
  };
  for (let i = 0; i < n - 1; i++) {
    quad(Lo[i], Lo[i + 1], Ro[i + 1], Ro[i], y - SLAB, y, mats.floor, { floor: true });
    quad(Lo[i], Lo[i + 1], Ro[i + 1], Ro[i], y + h, y + h + SLAB * 0.75, mats.ceiling);
    quad(L[i], L[i + 1], Lo[i + 1], Lo[i], y, y + h, mats.wall, { wall: true });
    quad(R[i], R[i + 1], Ro[i + 1], Ro[i], y, y + h, mats.wall, { wall: true });
  }
}

// Trim a centre line where it leaves (from its start) a convex polygon.
function exitPoint(pts, poly) {
  for (let i = 1; i < pts.length; i++) {
    if (G.inside(pts[i], poly)) continue;
    const a = pts[i - 1], b = pts[i];
    let lo = 0, hi = 1;
    for (let k = 0; k < 30; k++) { const m = (lo + hi) / 2; if (G.inside(G.lerp(a, b, m), poly)) lo = m; else hi = m; }
    return { i, at: G.lerp(a, b, hi), dir: G.norm(G.sub(b, a)) };
  }
  return null;
}

export function compileSite(plan) {
  const rng = Rng.fromString(`megasite:${plan.seed}`);
  const solids = [], lamps = [], zones = [], markers = [], water = [], stats = { doorFails: 0 };
  const byId = new Map(plan.nodes.map((n) => [n.id, n]));
  const vols = new Map([...plan.landmarks, plan.access].map((L) => [L.id, L]));
  const doorsOf = new Map(); // node or volume id -> doorways
  const addDoor = (id, d) => { if (!doorsOf.has(id)) doorsOf.set(id, []); doorsOf.get(id).push(d); };
  const shellOf = (id) => {
    const n = byId.get(id);
    if (n && (n.kind === 'crossing' || n.kind === 'access')) { const L = vols.get(n.landmark ?? 'ACCESS'); return { id: L.id, poly: L.poly, T: VOL_WALL }; }
    return n ? { id: n.id, poly: n.poly, T: WALL } : null;
  };

  // --- passages, and the doorways they cut ------------------------------------
  for (const l of plan.links) {
    const y = l.path[0][1], w = l.width, h = Math.min(DOOR_H, l.height);
    let pts = l.path.map((p) => [p[0], p[2]]);
    const A = shellOf(l.a), B = shellOf(l.b);
    // leave A: through its wall
    let capA = null, capB = null;
    for (const [end, sh] of [['a', A], ['b', B]]) {
      if (!sh) continue;
      const seq = end === 'a' ? pts : pts.slice().reverse();
      // a crossing's passage starts on the volume's wall line: step out from just inside
      const inner = sh.poly, outerPoly = G.inflate(inner, sh.T);
      const start = seq.slice();
      if (!G.inside(start[0], inner)) {
        const c = G.centroid(inner);
        start.unshift(G.lerp(start[0], c, 0.02));
      }
      const ex = exitPoint(start, outerPoly);
      const exIn = exitPoint(start, inner);
      if (!ex || !exIn) { stats.doorFails++; continue; }
      const yy = end === 'a' ? y : l.path.at(-1)[1];
      const d = doorway(inner, sh.T, exIn.at, exIn.dir, w, yy, yy + h);
      if (!d) { stats.doorFails++; continue; }
      addDoor(sh.id, d);
      const trimmed = [ex.at, ...start.slice(ex.i)];
      if (end === 'a') { pts = trimmed; capA = d.ends; } else { pts = trimmed.reverse(); capB = d.ends; }
    }
    if (pts.length < 2) continue;
    const tunnel = l.a === 'staging' || l.b === 'staging';
    passage(solids, pts, y, w, h, capA, capB, tunnel ? { floor: 'rock', ceiling: 'rock', wall: 'rock' } : { floor: 'floor', ceiling: 'concrete', wall: 'concrete' });
    // lamps along the way
    const len = G.polylineLength(pts);
    for (let s = 6; s < len - 3; s += rng.range(9, 14)) {
      const at = G.along(pts, s);
      lamps.push({ pos: [at.p[0], y + h - 0.25, at.p[1]], color: tunnel ? 'work' : 'amber', power: tunnel ? 60 : 70 });
    }
  }

  // --- rooms --------------------------------------------------------------------
  for (const n of plan.nodes) {
    if (n.kind === 'crossing' || n.kind === 'access') continue;
    const T = WALL, outer = n.poly.map((_, i) => offsetVertex(n.poly, i, T));
    const rock = n.kind === 'staging';
    solids.push(vprism(outer, n.y0 - SLAB, n.y0, rock ? 'rock' : 'floor', { floor: true }));
    solids.push(vprism(outer, n.y1, n.y1 + SLAB, rock ? 'rock' : 'concrete'));
    roomWalls(solids, n.poly, T, n.y0, n.y1, doorsOf.get(n.id) || [], rock ? 'rock' : 'concrete');
    const c = n.center || G.centroid(n.poly);
    if (n.kind === 'climb') {
      zones.push({ id: n.id, name: n.name, poly: n.poly, y0: n.y0, y1: n.y1, gravity: n.gravity });
      if (n.mode === 'low-g') lowGDecks(solids, n, rng, doorsOf.get(n.id) || []);
      else exitLedge(solids, n, doorsOf.get(n.id) || []);
      for (let y = n.y0 + 4; y < n.y1 - 1; y += 7) lamps.push({ pos: [c[0], y, c[1]], color: 'cyan', power: 55, wall: true });
    } else lamps.push({ pos: [c[0], n.y1 - 0.25, c[1]], color: n.kind === 'core' ? 'cyan' : 'amber', power: n.kind === 'core' ? 110 : 80 });

  }

  // --- the big volumes ----------------------------------------------------------
  for (const L of [...plan.landmarks, plan.access]) {
    const top = L.kind === 'access' ? L.y0 + 38 : L.y1; // the founders' gate seals the shaft above
    const outer = L.poly.map((_, i) => offsetVertex(L.poly, i, VOL_WALL));
    solids.push(vprism(outer, L.y0 - 1.2, L.y0, 'dark', { floor: true }));
    solids.push(vprism(outer, top, top + 1.5, L.kind === 'access' ? 'metal' : 'concrete'));
    roomWalls(solids, L.poly, VOL_WALL, L.y0, top, doorsOf.get(L.id) || [], 'concrete');
    // giant ribs on the inside faces (no right angles: they follow each face)
    for (let i = 0; i < L.poly.length; i++) {
      const a = L.poly[i], b = L.poly[(i + 1) % L.poly.length], e = G.sub(b, a), len = G.len(e), nIn = G.norm(G.perp(e));
      for (let s = 7; s < len - 4; s += 11) {
        const p = G.add(G.lerp(a, b, s / len), G.mul(nIn, 0.6));
        const doorClear = (doorsOf.get(L.id) || []).every((d) => d.edge !== i || s / len < d.inner[0] - 0.08 || s / len > d.inner[1] + 0.08);
        const walkClear = plan.nodes.every((q) => !q.walk || q.landmark !== L.id || G.sdPoly(p, q.poly) > 2.2);
        if (doorClear && walkClear) solids.push(vprism(G.orientedRect(p, e, 0.5, 0.6), L.y0, top, 'metal'));
      }
    }
  }
  // crossings: catwalks with rails, hung from the volume
  for (const n of plan.nodes.filter((q) => q.kind === 'crossing' || q.kind === 'access')) {
    const [a, b] = n.walk, y = n.y0, d = G.norm(G.sub(b, a)), side = G.perp(d), len = G.dist(a, b);
    const halfW = 1.3;
    solids.push(vprism(G.ccw([G.add(a, G.mul(side, halfW)), G.add(b, G.mul(side, halfW)), G.add(b, G.mul(side, -halfW)), G.add(a, G.mul(side, -halfW))]), y - 0.3, y, 'metal', { floor: true }));
    for (const sg of [-1, 1]) {
      const o = G.mul(side, sg * (halfW - 0.08));
      const p0 = G.add(G.add(a, o), G.mul(d, 1.2)), p1 = G.add(G.add(b, o), G.mul(d, n.kind === 'access' ? 0 : -1.2));
      solids.push(beam([p0[0], y + 1.1, p0[1]], [p1[0], y + 1.1, p1[1]], 0.05, 0.05, 'rust', 6));
      solids.push(beam([p0[0], y + 0.55, p0[1]], [p1[0], y + 0.55, p1[1]], 0.035, 0.035, 'metal', 6));
      for (let s = 1.2; s < len - 1.1; s += 2.6) {
        const p = G.add(G.add(a, o), G.mul(d, s));
        solids.push(beam([p[0], y, p[1]], [p[0], y + 1.1, p[1]], 0.04, 0.04, 'metal', 6));
      }
    }
    const L = vols.get(n.landmark ?? 'ACCESS');
    // hangers up to the volume's roof
    const above = plan.nodes.filter((q) => q.kind === 'crossing' && q.landmark === n.landmark && q.y0 > y);
    if (L.kind !== 'access') for (let s = 8; s < len - 4; s += 16) {
      const p = G.add(a, G.mul(d, s));
      for (const sg of [-1, 1]) {
        const q = G.add(p, G.mul(side, sg * halfW));
        if (above.some((o) => G.sdPoly(q, G.inflate(o.poly, 1)) < 0)) continue;
        solids.push(beam([q[0], y, q[1]], [q[0], L.y1, q[1]], 0.06, 0.06, 'metal', 6));
      }
    }
    for (let s = 5; s < len - 2; s += 12) { const p = G.add(a, G.mul(d, s)); lamps.push({ pos: [p[0], y + 2.6, p[1]], color: 'amber', power: 75 }); }
  }
  for (const m of plan.machines) machine(solids, lamps, m, vols.get(m.landmark), rng);
  for (const L of plan.landmarks) if (L.kind === 'cistern') water.push({ poly: L.poly, y: L.y0 + (Math.min(...plan.nodes.filter((n) => n.landmark === L.id).map((n) => n.y0)) - L.y0) * 0.45 });

  for (const f of plan.finds) markers.push({ ...f });
  const s0 = byId.get('staging'), first = plan.links.find((l) => l.a === 'staging');
  const look = first ? [first.path[1][0], first.path[1][2]] : G.add(s0.center, [0, -1]);
  return {
    solids, lamps, zones, markers, water, stats, doors: doorsOf,
    spawn: { pos: [s0.center[0], s0.y0, s0.center[1]], yaw: Math.atan2(-(look[0] - s0.center[0]), -(look[1] - s0.center[1])) },
    spaces: [...plan.nodes.filter((n) => n.kind !== 'crossing' && n.kind !== 'access').map((n) => ({ id: n.id, name: n.name, poly: n.poly, y0: n.y0, y1: n.y1 })),
      ...[...plan.landmarks, plan.access].map((L) => ({ id: L.id, name: L.name, poly: L.poly, y0: L.y0, y1: L.y1 }))],
  };
}

// The doorway at the top of a climb room, as a point just inside it.
function topDoor(n, doors) {
  const d = doors.filter((q) => Math.abs(q.y0 - n.climb.to) < 0.5)[0];
  if (!d) return null;
  const P = n.poly, a = P[d.edge], b = P[(d.edge + 1) % P.length];
  const mid = G.lerp(a, b, (d.inner[0] + d.inner[1]) / 2), inward = G.norm(G.perp(G.sub(b, a))); // CCW: left of an edge is inside
  return { at: mid, inward, along: G.norm(G.sub(b, a)) };
}
// A ledge inside the top doorway of a zero-g well, to step out onto.
function exitLedge(out, n, doors) {
  const t = topDoor(n, doors);
  if (!t) return;
  const c = G.add(t.at, G.mul(t.inward, 0.6));
  out.push(vprism(G.orientedRect(c, t.along, 1.5, 0.6), n.climb.to - 0.3, n.climb.to, 'metal', { floor: true }));
}
// Broken decks rising round a low-gravity room, ending at a landing inside its
// top doorway: one ledge per ~1.5 m of rise.
function lowGDecks(out, n, rng, doors) {
  const c = n.center, rise = n.climb.to - n.climb.from, steps = Math.max(2, Math.ceil(rise / 1.4));
  const rmin = Math.min(...n.poly.map((p) => G.dist(p, c)));
  const Rc = Math.max(2.6, rmin - 1.7), rd = 1.2;
  // neighbours a clear 0.6 m apart round the spiral
  const minStep = 2 * Math.asin(Math.min(0.99, (2 * rd + 0.6) / (2 * Rc)));
  const t = topDoor(n, doors);
  const bottom = doors.find((d) => Math.abs(d.y0 - n.climb.from) < 0.5);
  const angleOf = (d) => { const P = n.poly, a = P[d.edge], b = P[(d.edge + 1) % P.length], m = G.lerp(a, b, (d.inner[0] + d.inner[1]) / 2); return Math.atan2(m[1] - c[1], m[0] - c[0]); };
  const aIn = bottom ? angleOf(bottom) : rng.range(0, Math.PI * 2);
  const aEnd = t ? Math.atan2(t.at[1] - c[1], t.at[0] - c[0]) : aIn + Math.PI;
  const turn = rng.sign();
  // start well to one side of the way in (nothing low hangs in front of it),
  // then spread the decks evenly round to the top doorway, adding whole turns as needed
  const aStart = aIn + turn * 0.9;
  let span = ((aEnd - aStart) * turn) % (Math.PI * 2); if (span < 0) span += Math.PI * 2;
  while (span / Math.max(1, steps - 1) < minStep) span += Math.PI * 2;
  const step = span / Math.max(1, steps - 1);
  for (let k = 1; k < steps; k++) {
    const a = aStart + turn * step * (k - 1), y = n.climb.from + rise * k / steps;
    const p = G.add(c, [Math.cos(a) * Rc, Math.sin(a) * Rc]);
    out.push(vprism(G.regularPoly(p[0], p[1], rd + rng.range(0, 0.25), rd * rng.range(0.75, 0.95), rng.pick([5, 6]), a + rng.range(-0.4, 0.4)), y - 0.35, y, 'metal', { floor: true }));
    out.push(beam([p[0], n.y0, p[1]], [p[0], y - 0.35, p[1]], 0.12, 0.12, 'rust', 6));
  }
  if (t) {
    const L = G.add(t.at, G.mul(t.inward, 1.2));
    out.push(vprism(G.orientedRect(L, t.along, 1.8, 1.2), n.climb.to - 0.35, n.climb.to, 'metal', { floor: true }));
  }
}

// Machines: no boxes. Stacked many-sided drums, collars and struts.
function machine(out, lamps, m, L, rng) {
  const [x, z] = m.center, r = m.r, y0 = m.y0, y1 = m.y1;
  const drum = (rr, a, b, mat, sides = 16) => out.push(vprism(G.regularPoly(x, z, rr, rr, sides, rng.range(0, 1)), a, b, mat));
  if (m.kind === 'rack') {
    // archive stacks: tall hexagonal towers banded with shelving collars
    drum(r, y0, y1, 'concrete', 6);
    for (let y = y0 + 6; y < y1 - 2; y += rng.range(5, 8)) drum(r + 0.45, y, y + 0.5, 'metal', 6);
    lamps.push({ pos: [x + r + 0.6, Math.min(y1 - 3, y0 + (y1 - y0) * 0.6), z], color: 'cyan', power: 40, wall: true });
  } else if (m.kind === 'reactor') {
    drum(r, y0, y1 - r * 0.6, 'concrete', 20);
    drum(r * 0.8, y1 - r * 0.6, y1 - r * 0.25, 'metal', 20);
    drum(r * 0.45, y1 - r * 0.25, y1, 'metal', 16);
    for (let y = y0 + 5; y < y1 - r; y += rng.range(7, 11)) drum(r + 0.6, y, y + 0.9, 'rust', 20);
  } else if (m.kind === 'column') {
    drum(r, y0, y1, 'metal', 24);
    for (let y = y0 + 4; y < y1 - 2; y += 9) drum(r + 1.2, y, y + 1.6, 'rust', 24);
  } else if (m.kind === 'tank') {
    drum(r, y0, y1 - 6, 'rust', 18); drum(r * 0.6, y1 - 6, y1 - 4, 'metal', 18);
  } else {
    // heat exchangers: banks of leaning tubes
    for (let k = 0; k < 5; k++) {
      const a = k / 5 * Math.PI * 2, p = [x + Math.cos(a) * r * 0.6, z + Math.sin(a) * r * 0.6];
      out.push(beam([p[0], y0, p[1]], [x + Math.cos(a + 0.6) * r * 0.3, y1, z + Math.sin(a + 0.6) * r * 0.3], r * 0.22, r * 0.22, 'metal', 12));
    }
  }
}
