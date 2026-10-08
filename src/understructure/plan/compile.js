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
const DOOR_H = 4.4;

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
// An upright many-sided drum centred on (x, z), its top scaled by taper.
function drum(x, z, r, y0, y1, mat, sides = 16, taper = 1, rot = 0, aspect = 1) {
  return { o: [x, 0, z], u: X, v: Z, w: Y, poly: G.regularPoly(0, 0, r, r * aspect, sides, rot), w0: y0, w1: y1, mat, taper };
}
// An irregular tapering shard from a along dir for length L, radius r.
function shard(rng, a, dir, L, r, mat) {
  const w = norm3(dir);
  let u = Math.abs(w[1]) > 0.9 ? [1, 0, 0] : cross3([0, 1, 0], w); u = norm3(u); const v = cross3(w, u);
  const k = rng.int(5, 8), poly = [];
  for (let i = 0; i < k; i++) { const t = (i + rng.range(-0.25, 0.25)) / k * Math.PI * 2, rr = r * rng.range(0.7, 1.15); poly.push([Math.cos(t) * rr, Math.sin(t) * rr]); }
  return { o: a, u, v, w, poly: G.convexHull(poly), w0: 0, w1: L, mat, taper: rng.range(0.08, 0.35) };
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
  const solids = [], lamps = [], zones = [], markers = [], water = [], seeps = [], stats = { doorFails: 0, bent: 0, breaks: 0, roofs: 0 };
  // (water gets in on a wet world: more of it deep down, by the cistern, and through the visitors' rock)
  const wet = plan.environment?.water !== false;
  const ys = plan.nodes.map((q) => q.y0), yLo = Math.min(...ys), yHi = Math.max(...ys), cistern = plan.landmarks.find((L) => L.kind === 'cistern');
  const drips = [];
  const faults = siteFaults(plan, new Map(plan.nodes.map((n) => [n.id, n])));
  // (what's above a patch of ceiling: nothing within `need` m, or it stays whole)
  const occupied = [
    ...plan.nodes.filter((q) => q.poly && q.kind !== 'crossing').map((q) => ({ poly: q.poly, y0: q.y0, y1: q.y1 })),
    ...[...plan.landmarks, plan.access].map((L) => ({ poly: L.poly, y0: L.y0, y1: L.y1 })),
    ...plan.links.flatMap((l) => l.path.slice(1).map((b, i) => { const a = l.path[i]; return { poly: G.segRect([a[0], a[2]], [b[0], b[2]], l.width + WALL), y0: Math.min(a[1], b[1]), y1: Math.max(a[1], b[1]) + l.height }; })),
  ];
  const clearAbove = (poly, yBase, need) => occupied.every((o) => o.y1 <= yBase + 0.05 || o.y0 > yBase + need || !G.polysOverlap(poly, o.poly, 0));
  const wetness = (n) => {
    const c = n.center || G.centroid(n.poly);
    let p = 0.12 + 0.4 * (1 - (n.y0 - yLo) / Math.max(1, yHi - yLo));
    if (cistern && G.dist(c, cistern.center) < cistern.r + 30 && n.y0 < cistern.y1) p += 0.3;
    if (n.kind === 'staging') p += 0.4;
    return Math.min(0.9, p);
  };
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
      d.link = l.id;
      addDoor(sh.id, d);
      const trimmed = [ex.at, ...start.slice(ex.i)];
      if (end === 'a') { pts = trimmed; capA = d.ends; } else { pts = trimmed.reverse(); capB = d.ends; }
    }
    if (pts.length < 2) continue;
    const tunnel = l.a === 'staging' || l.b === 'staging', mats = tunnel ? { floor: 'rock', ceiling: 'rock', wall: 'rock' } : { floor: 'floor', ceiling: 'concrete', wall: 'concrete' };
    const def = l.kind === 'collapse' ? null : passageDeform(pts, faults, wet && y < yLo + (yHi - yLo) * 0.35, Rng.fromString(`megasite-bend:${plan.seed}:${l.id}`));
    if (def) { stats.bent++; if (def.fault) stats.faultBends = (stats.faultBends || 0) + 1; if (def.gap) stats.gaps = (stats.gaps || 0) + 1; if (bentPassage(solids, drips, water, pts, y, w, h, capA, capB, mats, def, wet, clearAbove, Rng.fromString(`megasite-break:${plan.seed}:${l.id}`))) stats.breaks++; else if (def.gap) def.gap = null; }
    else passage(solids, pts, y, w, h, capA, capB, mats);
    if (l.kind === 'collapse') { collapseEnd(solids, pts, y, w, h, rng); if (wet && rng.chance(0.6)) trickle(seeps, water, G.add(pts.at(-1), G.mul(G.norm(G.sub(pts.at(-2), pts.at(-1))), 0.25)), G.norm(G.sub(pts.at(-2), pts.at(-1))), y, y + h - 0.3, rng); continue; }   // (dark: nobody lit a way that ends)
    sideDoors(solids, seeps, water, pts, y, w, h, tunnel, wet, rng, def);
    // lamps along the way (down with a sagging ceiling; none where it's broken open)
    const len = G.polylineLength(pts);
    for (let s = 6; s < len - 3; s += rng.range(9, 14)) {
      if (def?.gap && s > def.gap[0] - 1.2 && s < def.gap[1] + 1.2) continue;
      const at = G.along(pts, s), dy = def ? def.dy(s) : 0;
      lamps.push({ pos: [at.p[0], y + h + dy - 0.2, at.p[1]], color: tunnel ? 'work' : 'amber', power: tunnel ? 60 : 70, mount: 'ceiling', top: y + h + dy });
    }
  }

  // --- rooms --------------------------------------------------------------------
  for (const n of plan.nodes) {
    if (n.kind === 'crossing' || n.kind === 'access') continue;
    const T = WALL, outer = n.poly.map((_, i) => offsetVertex(n.poly, i, T));
    const rock = n.kind === 'staging';
    let roomHole = null;
    solids.push(vprism(outer, n.y0 - SLAB, n.y0, rock ? 'rock' : 'floor', { floor: true }));
    if (rock) ceilingWithHole(solids, outer, breakInShaft(n), n.y1, n.y1 + SLAB, 'rock');
    else {
      const brk = n.kind !== 'climb' && n.kind !== 'core' && roomBreak(n, faults, clearAbove, Rng.fromString(`megasite-break:${plan.seed}:${n.id}`), wet ? Math.max(0, wetness(n) - 0.3) : 0);
      if (brk) { ceilingWithHole(solids, outer, brk.hole, n.y1, n.y1 + SLAB, 'concrete'); brokenRoof(solids, drips, water, brk.hole, n.y1, n.y1 + SLAB, n.y0, wet, Rng.fromString(`megasite-roof:${plan.seed}:${n.id}`), plan.finds.filter((f) => f.node === n.id).map((f) => [f.pos[0], f.pos[2]])); roomHole = brk.hole; stats.roofs++; }
      else solids.push(vprism(outer, n.y1, n.y1 + SLAB, 'concrete'));
    }
    roomWalls(solids, n.poly, T, n.y0, n.y1, doorsOf.get(n.id) || [], rock ? 'rock' : 'concrete');
    const c = n.center || G.centroid(n.poly);
    if (n.kind === 'climb') {
      zones.push({ id: n.id, name: n.name, poly: n.poly, y0: n.y0, y1: n.y1, gravity: n.gravity });
      if (n.mode === 'low-g') lowGDecks(solids, n, rng, doorsOf.get(n.id) || []);
      else exitLedge(solids, n, doorsOf.get(n.id) || []);
      wellLamps(lamps, n, doorsOf.get(n.id) || []);
    } else {
      let q = c;
      if (roomHole) { const hc = G.centroid(roomHole), away = G.sub(c, hc), dd = G.dist(c, hc); if (dd < 3) q = G.add(hc, G.mul(dd > 0.01 ? G.norm(away) : [1, 0], 3)); if (!G.inside(q, G.inflate(n.poly, -0.8))) q = c; }
      lamps.push({ pos: [q[0], n.y1 - 0.2, q[1]], color: n.kind === 'core' ? 'cyan' : 'amber', power: n.kind === 'core' ? 110 : 80, mount: 'ceiling', top: n.y1 });
    }
    // doorways that no longer open, on walls with none of their own (the place goes on past
    // them); water in, here and there
    const used = falseDoors(solids, n, doorsOf.get(n.id) || [], rng);
    if (wet) roomWater(seeps, water, n, doorsOf.get(n.id) || [], used, rng, wetness(n));

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
        if (doorClear && walkClear) {
          solids.push(vprism(G.orientedRect(p, e, 0.5, 0.6), L.y0, top, 'metal'));
          // a glowing strip up some ribs: from any catwalk you can see how far the hall goes
          if (rng.chance(0.35)) solids.push(vprism(G.orientedRect(G.add(p, G.mul(nIn, 0.62)), e, 0.07, 0.03), L.y0 + 2, top - 2, rng.chance(0.5) ? 'amber' : 'cyan', { glow: true }));
        }
      }
    }
    if (L.kind !== 'access') dressHall(solids, lamps, L, top, doorsOf.get(L.id) || [], plan.nodes.filter((q) => q.walk && q.landmark === L.id), rng.fork(L.id));
  }
  // crossings: catwalks with rails, hung from the volume
  const spanOf = new Map((plan.gates || []).filter((g) => g.kind === 'span').map((g) => [g.node, g]));
  for (const n of plan.nodes.filter((q) => q.kind === 'crossing' || q.kind === 'access')) {
    const [a, b] = n.walk, y = n.y0, d = G.norm(G.sub(b, a)), side = G.perp(d), len = G.dist(a, b);
    const halfW = 1.3;
    // the deck in pieces: whole, or broken round a gate's span (ragged ends)
    const gate = spanOf.get(n.id);
    const pieces = gate ? [[0, gate.span.from], [gate.span.to, len]] : [[0, len]];
    const at = (s) => G.add(a, G.mul(d, s));
    for (const [s0, s1] of pieces) {
      solids.push(vprism(G.ccw([G.add(at(s0), G.mul(side, halfW)), G.add(at(s1), G.mul(side, halfW)), G.add(at(s1), G.mul(side, -halfW)), G.add(at(s0), G.mul(side, -halfW))]), y - 0.3, y, 'metal', { floor: true }));
      for (const sg of [-1, 1]) {
        const o = G.mul(side, sg * (halfW - 0.08));
        const r0 = s0 === 0 ? 1.2 : s0 + 0.3, r1 = s1 === len ? (n.kind === 'access' ? len : len - 1.2) : s1 - 0.3;
        if (r1 - r0 < 0.5) continue;
        const p0 = G.add(at(r0), o), p1 = G.add(at(r1), o);
        solids.push(beam([p0[0], y + 1.1, p0[1]], [p1[0], y + 1.1, p1[1]], 0.05, 0.05, 'rust', 6));
        solids.push(beam([p0[0], y + 0.55, p0[1]], [p1[0], y + 0.55, p1[1]], 0.035, 0.035, 'metal', 6));
        for (let s = r0; s < r1 + 0.01; s += 2.6) {
          const p = G.add(at(s), o);
          solids.push(beam([p[0], y, p[1]], [p[0], y + 1.1, p[1]], 0.04, 0.04, 'metal', 6));
        }
      }
    }
    if (gate) {
      // torn deck plates hanging off the broken ends
      for (const [s, sgn] of [[gate.span.from, 1], [gate.span.to, -1]]) {
        const p = at(s), q = G.add(p, G.mul(d, sgn * 1.4));
        solids.push(beam([p[0] + side[0] * rng.range(-0.8, 0.8), y - 0.15, p[1] + side[1] * rng.range(-0.8, 0.8)], [q[0], y - rng.range(1.2, 2.4), q[1]], 0.45, 0.06, 'rust', 4));
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
    for (let s = 5, k = 0; s < len - 2; s += 12, k++) { const p = G.add(a, G.mul(d, s)), q = G.add(p, G.mul(side, (k % 2 ? 1 : -1) * (halfW - 0.15))); lamps.push({ pos: [q[0], y + 2.6, q[1]], color: 'amber', power: 75, mount: 'post', base: y }); }
  }
  const live = new Map(); // one surviving generator per generator hall
  for (const L of plan.landmarks) { const ms = plan.machines.filter((m) => m.landmark === L.id && m.kind === 'reactor'); if (ms.length) live.set(rng.pick(ms).id, true); }
  for (const m of plan.machines) machine(solids, lamps, m, vols.get(m.landmark), rng, live.has(m.id));
  conduits(solids, plan, rng.fork('conduits'));
  const intr = intrusions(solids, lamps, plan, doorsOf, rng.fork('intrusions'));
  for (const L of plan.landmarks) if (L.kind === 'cistern') water.push({ poly: L.poly, y: L.y0 + (Math.min(...plan.nodes.filter((n) => n.landmark === L.id).map((n) => n.y0)) - L.y0) * 0.45 });

  // the later visitors' way in: a rough shaft from the breach room up to the surface
  {
    const st = byId.get('staging'), hole = breakInShaft(st);
    roomWalls(solids, hole, 0.8, st.y1, plan.surfaceY, [], 'rock');
    for (let y = st.y1 + 6; y < plan.surfaceY - 2; y += rng.range(9, 15)) lamps.push({ pos: [st.center[0] + 1.2, y, st.center[1]], color: 'work', power: 40, wall: true, range: 16, mount: 'cable', top: plan.surfaceY });
  }
  const gates = compileGates(solids, lamps, plan, byId, vols, doorsOf, rng.fork('gates'));
  for (const f of plan.finds) markers.push({ ...f });
  const s0 = byId.get('staging'), first = plan.links.find((l) => l.a === 'staging');
  const look = first ? [first.path[1][0], first.path[1][2]] : G.add(s0.center, [0, -1]);
  return {
    solids, lamps, zones, markers, water, stats, doors: doorsOf, seeps: [...seeps, ...intr.seeps], drips, faults, gates,
    machinesLive: plan.machines.filter((m) => live.has(m.id)).map((m) => [m.center[0], (m.y0 + m.y1) / 2, m.center[1]]),
    spawn: { pos: [s0.center[0], s0.y0, s0.center[1]], yaw: Math.atan2(-(look[0] - s0.center[0]), -(look[1] - s0.center[1])) },
    spaces: [...plan.nodes.filter((n) => n.kind !== 'crossing' && n.kind !== 'access').map((n) => ({ id: n.id, name: n.name, poly: n.poly, y0: n.y0, y1: n.y1 })),
      ...[...plan.landmarks, plan.access].map((L) => ({ id: L.id, name: L.name, poly: L.poly, y0: L.y0, y1: L.y1 }))],
  };
}

// Gates for the runtime: what blocks (a door slab filling a doorway, a gap in
// a catwalk, rubble in a passage) and what opens it. The blocking parts that
// come and go are not solids: the runtime adds them to collision itself.
function compileGates(out, lamps, plan, byId, vols, doorsOf, rng) {
  const res = [];
  for (const g of plan.gates || []) {
    const r = { ...g };
    if (g.kind === 'door') {
      const n = byId.get(g.node), shellId = n.kind === 'crossing' ? n.landmark : n.id, poly = n.kind === 'crossing' ? vols.get(n.landmark).poly : n.poly;
      const T = n.kind === 'crossing' ? VOL_WALL : WALL;
      const d = (doorsOf.get(shellId) || []).find((q) => q.link === g.link);
      if (!d) continue;
      const a = poly[d.edge], b = poly[(d.edge + 1) % poly.length], A = offsetVertex(poly, d.edge, T), B = offsetVertex(poly, (d.edge + 1) % poly.length, T);
      const P = (t) => G.lerp(a, b, t), Q = (t) => G.lerp(A, B, t);
      r.barrier = { poly: G.ccw([P(d.inner[0]), P(d.inner[1]), Q(d.outer[1]), Q(d.outer[0])]), y0: d.y0, y1: d.y1 };
      const mid = G.lerp(P(d.inner[0]), P(d.inner[1]), 0.5), inward = G.norm(G.perp(G.sub(b, a)));
      // the control beside the door, on the side you arrive from (outside the room)
      const outPt = G.add(G.lerp(Q(d.outer[0]), Q(d.outer[1]), 0.5), G.mul(inward, -0.6)), along = G.norm(G.sub(b, a));
      r.control = { pos: [...G.add(outPt, G.mul(along, (G.dist(P(d.inner[0]), P(d.inner[1])) / 2 + 0.7))), d.y0], face: Math.atan2(-inward[0], -inward[1]) };
      r.control.pos = [r.control.pos[0], d.y0, r.control.pos[1]];
      r.door = { mid, inward, along, width: G.dist(P(d.inner[0]), P(d.inner[1])), y0: d.y0, y1: d.y1 };
    } else if (g.kind === 'span') {
      const n = byId.get(g.node), [a, b] = n.walk, dd = G.norm(G.sub(b, a)), side = G.perp(dd);
      const p0 = G.add(a, G.mul(dd, g.span.from - 0.05)), p1 = G.add(a, G.mul(dd, g.span.to + 0.05));
      r.floor = { poly: G.ccw([G.add(p0, G.mul(side, 1.3)), G.add(p1, G.mul(side, 1.3)), G.add(p1, G.mul(side, -1.3)), G.add(p0, G.mul(side, -1.3))]), y: g.span.y };
    } else if (g.kind === 'fold') {
      const l = plan.links.find((q) => q.id === g.link), y = l.path[0][1], w = l.width;
      const c = g.collapse, dir = c.dir, side = G.perp(dir), cp = [c.p[0], c.p[2]];
      // rubble filling the passage: a slab you cannot pass and broken rock over it
      out.push(vprism(G.orientedRect(cp, dir, 0.8, w + 0.4), y, y + 3.1, 'rock'));
      for (let k = 0; k < 6; k++) {
        const q = G.add(cp, G.mul(side, rng.range(-w, w)));
        out.push(shard(rng, [q[0], y + rng.range(0, 1.5), q[1]], [dir[0] * rng.sign() * 0.6 + rng.range(-0.3, 0.3), rng.range(0.2, 1), dir[1] * rng.sign() * 0.6 + rng.range(-0.3, 0.3)], rng.range(1.2, 2.4), rng.range(0.5, 1.1), 'rock'));
      }
      r.frames = g.frames.map((f) => {
        const p = [f.p[0], f.p[2]], s2 = G.perp(f.dir);
        for (const sg of [-1, 1]) { const q = G.add(p, G.mul(s2, sg * (w - 0.12))); out.push(vprism(G.orientedRect(q, f.dir, 0.18, 0.12), y, y + 2.9, 'metal')); }
        const q0 = G.add(p, G.mul(s2, -(w - 0.12))), q1 = G.add(p, G.mul(s2, w - 0.12));
        out.push(beam([q0[0], y + 2.75, q0[1]], [q1[0], y + 2.75, q1[1]], 0.18, 0.15, 'metal', 4));
        return { pos: [p[0], y, p[1]], dir: f.dir, half: w - 0.3 };
      });
    }
    res.push(r);
  }
  return res;
}

// The break-in shaft's outline (centred over the breach room).
export function breakInShaft(st) { return G.regularPoly(st.center[0], st.center[1], 1.9, 1.9, 7, 0.3); }

// A slab over the outer outline with a convex hole in it: one convex piece per
// hole edge (the outline cut to the wedge from the centre through that edge,
// beyond the edge).
function ceilingWithHole(out, outer, hole, y0, y1, mat) {
  const c = G.centroid(hole), n = hole.length;
  for (let i = 0; i < n; i++) {
    const a = hole[i], b = hole[(i + 1) % n];
    let piece = outer;
    // the wedge between the rays c->a and c->b (keep the side of each ray facing the other)
    const ra = G.sub(a, c), rb = G.sub(b, c);
    const na = G.norm([ra[1], -ra[0]]), nb = G.norm([-rb[1], rb[0]]); // left of c->a, right of c->b
    piece = G.clipHalf(piece, na, G.dot(c, na));
    piece = G.clipHalf(piece, nb, G.dot(c, nb));
    // beyond the hole's edge a-b
    const e = G.sub(b, a), inward = G.norm(G.perp(e)); // CCW: left is inside the hole
    piece = G.clipHalf(piece, inward, G.dot(a, inward));
    if (piece.length >= 3 && Math.abs(G.area(piece)) > 0.01) out.push(vprism(G.ccw(piece), y0, y1, mat));
  }
}

// The doorway at the top of a climb room, as a point just inside it.
function topDoor(n, doors) {
  const d = doors.filter((q) => Math.abs(q.y0 - n.climb.to) < 0.5)[0];
  if (!d) return null;
  const P = n.poly, a = P[d.edge], b = P[(d.edge + 1) % P.length];
  const mid = G.lerp(a, b, (d.inner[0] + d.inner[1]) / 2), inward = G.norm(G.perp(G.sub(b, a))); // CCW: left of an edge is inside
  return { at: mid, inward, along: G.norm(G.sub(b, a)) };
}
// A doorway that no longer opens: a frame proud of the wall and a corroded panel in it, rusted
// or welded shut, or jammed a hand's width open on darkness. c on the wall's face, n into the space
function sealedDoor(out, c, n, y, dh, rng) {
  const along = G.perp(n), dw = rng.range(0.9, 1.3);
  const at = (s, o) => G.add(G.add(c, G.mul(along, s)), G.mul(n, o));
  for (const s of [-dw - 0.15, dw + 0.15]) out.push(vprism(G.orientedRect(at(s, 0.13), along, 0.15, 0.13), y, y + dh + 0.3, 'metal'));
  out.push(vprism(G.orientedRect(at(0, 0.13), along, dw + 0.3, 0.13), y + dh, y + dh + 0.3, 'metal'));
  const kind = rng.pick(['rusted', 'welded', 'jammed']);
  if (kind === 'jammed') {
    const gap = rng.range(0.15, 0.35);
    out.push(vprism(G.orientedRect(at(gap / 2, 0.07), along, dw - gap / 2, 0.06), y, y + dh, 'rust', { sealed: kind }));
    out.push(vprism(G.orientedRect(at(-dw + gap / 2, 0.012), along, gap / 2, 0.01), y, y + dh, 'dark'));
  } else {
    out.push(vprism(G.orientedRect(at(0, 0.07), along, dw, 0.06), y, y + dh, 'rust', { sealed: kind }));
    if (kind === 'welded') out.push(vprism(G.orientedRect(at(0, 0.14), along, 0.035, 0.02), y + 0.1, y + dh - 0.1, 'metal'));   // (the bead down its seam)
  }
}
// A room's false doors (up a zero-g well, at any level clear of its real ones): the edges used
function falseDoors(out, n, doors, rng) {
  const used = new Set();
  if (n.kind === 'core' || n.kind === 'staging' || n.mode === 'low-g') return used;
  const P = n.poly, m = P.length, max = n.kind === 'deadend' ? 1 : 2, order = [...Array(m).keys()];
  rng.shuffle(order);
  for (const i of order) {
    if (used.size >= max) break;
    const a = P[i], b = P[(i + 1) % m];
    if (G.dist(a, b) < 3.6 || !rng.chance(0.32)) continue;
    const y = n.kind === 'climb' ? rng.range(n.y0 + 1, n.y1 - 4) : n.y0, dh = Math.min(n.y1 - y - 0.4, rng.range(2.6, 3.4));
    if (doors.some((d) => d.edge === i && y < d.y1 + 0.5 && y + dh > d.y0 - 0.5)) continue;
    sealedDoor(out, G.lerp(a, b, rng.range(0.42, 0.58)), G.norm(G.perp(G.sub(b, a))), y, dh, rng);
    used.add(i);
  }
  return used;
}
// Water finding its way in: a trickle down a wall from a crack under the ceiling, a puddle where it
// lands. c on the wall's face, n into the space
function trickle(seeps, water, c, n, y0, y1, rng) {
  seeps.push({ x: c[0] + n[0] * 0.03, z: c[1] + n[1] * 0.03, y0, y1, w: rng.range(0.12, 0.3), n: [n[0], n[1]], phase: rng.range(0, 6.3) });
  // (spread from the foot of the wall, ragged)
  const p = G.add(c, G.mul(n, rng.range(0.35, 0.6))), R = rng.range(0.45, 0.95), k = rng.int(9, 13), a0 = rng.range(0, Math.PI * 2), poly = [];
  for (let i = 0; i < k; i++) { const a = a0 + (i / k) * Math.PI * 2, r = R * rng.range(0.55, 1); poly.push([p[0] + Math.cos(a) * r, p[1] + Math.sin(a) * r * 0.8]); }
  water.push({ poly, y: y0 + 0.012, puddle: true, seed: rng.int(0, 1e6) });
}
function roomWater(seeps, water, n, doors, used, rng, p) {
  if (!rng.chance(p) || n.mode === 'low-g') return;
  const P = n.poly, m = P.length;
  for (let k = rng.int(1, n.kind === 'staging' ? 3 : 2); k > 0; k--) {
    const i = rng.int(0, m - 1), a = P[i], b = P[(i + 1) % m];
    if (used.has(i) || doors.some((d) => d.edge === i)) continue;
    used.add(i);
    trickle(seeps, water, G.lerp(a, b, rng.range(0.15, 0.85)), G.norm(G.perp(G.sub(b, a))), n.y0, n.y1 - 0.2, rng);
  }
}
// Along a longer passage: a doorway or two that no longer open, and now and then water down a wall
function sideDoors(out, seeps, water, pts, y, w, h, tunnel, wet, rng, def = null) {
  const len = G.polylineLength(pts);
  if (!tunnel && len > 12) for (let s = rng.range(4, 8); s < len - 4; s += rng.range(9, 18)) {
    if (!rng.chance(0.55)) continue;
    const a = G.along(pts, s - 1.9), b = G.along(pts, s + 1.9), at = G.along(pts, s);
    if (a.seg !== b.seg || (def && s > def.a - 2.5 && s < def.b + 2.5)) continue;   // (not round a bend, nor on walls that have moved)
    const k = rng.chance(0.5) ? 1 : -1, nrm = G.perp(at.dir);
    sealedDoor(out, G.add(at.p, G.mul(nrm, k * w)), G.mul(nrm, -k), y, Math.min(h - 0.4, rng.range(2.6, 3.4)), rng);
  }
  if (wet && len > 6 && rng.chance(tunnel ? 0.8 : 0.18)) {
    const at = G.along(pts, rng.range(2, len - 2)), k = rng.chance(0.5) ? 1 : -1, nrm = G.perp(at.dir);
    trickle(seeps, water, G.add(at.p, G.mul(nrm, k * w)), G.mul(nrm, -k), y, y + h - 0.2, rng);
  }
}
// Where a passage fell in: rock across it, and rubble heaped back from it, highest at the fall
function collapseEnd(out, pts, y, w, h, rng) {
  const e = pts.at(-1), d = G.norm(G.sub(e, pts.at(-2))), side = G.perp(d);
  out.push(vprism(G.orientedRect(G.add(e, G.mul(d, 0.6)), d, 0.8, w + WALL), y - SLAB, y + h + SLAB * 0.75, 'rock'));
  for (let k = 0; k < 18; k++) {
    const back = rng.range(0, 3.4), rise = (1 - back / 3.6) * h * 0.9, p = G.add(G.add(e, G.mul(d, -back)), G.mul(side, rng.range(-w * 0.9, w * 0.9)));
    if (k % 3 === 2) { out.push(shard(rng, [p[0], y - 0.25 + rng.range(0, rise * 0.4), p[1]], [rng.range(-0.7, 0.7), 1, rng.range(-0.7, 0.7)], rng.range(0.5, 0.6 + rise * 0.7), rng.range(0.35, 0.8), 'rock')); continue; }
    // (broken blocks of the passage itself, tumbled)
    const a = rng.range(0, Math.PI), y0 = y - 0.2 + rng.range(0, rise * 0.55), sz = rng.range(0.35, 0.95);
    out.push({ o: [p[0], 0, p[1]], u: X, v: Z, w: Y, poly: G.orientedRect([0, 0], [Math.cos(a), Math.sin(a)], sz, sz * rng.range(0.5, 0.9)), w0: y0, w1: y0 + sz * rng.range(0.6, 1.3), mat: rng.chance(0.6) ? 'concrete' : 'rock', taper: rng.range(0.55, 0.9) });
  }
  // and a slab of the ceiling down across it
  const s0 = G.add(G.add(e, G.mul(d, -1.2)), G.mul(side, -w * 0.95)), s1 = G.add(G.add(e, G.mul(d, -0.4)), G.mul(side, w * 0.95));
  out.push(beam([s0[0], y + h * 0.35, s0[1]], [s1[0], y + h * 0.75, s1[1]], 0.5, 0.18, 'concrete'));
}
// The ground's own history in the place: a fault or two across it, the first through the breach (the
// visitors came down where the wound had cracked the shell). What crosses one has moved with it: a
// passage sagged and rolled, a ceiling broken open where it runs, water getting in
function siteFaults(plan, byId) {
  const fr = Rng.fromString(`megasite-faults:${plan.seed}`), st = byId.get('staging');
  const one = (p, k) => { const a = fr.range(0, Math.PI); return { p, d: [Math.cos(a), Math.sin(a)], n: [-Math.sin(a), Math.cos(a)], sag: fr.range(0.35, 0.8) * k, roll: fr.range(4, 9) * (fr.chance(0.5) ? 1 : -1) * Math.PI / 180 * k, zone: fr.range(6, 10), broken: fr.range(0.7, 0.95) }; };
  const out = [one(st.center, 1)];
  if (fr.chance(0.75)) out.push(one(fr.pick(plan.landmarks).center, 0.75));
  const rooms = plan.nodes.filter((n) => n.kind === 'room');
  if (rooms.length && fr.chance(0.5)) out.push(one(fr.pick(rooms).center, 0.6));   // (and a lesser one)
  return out;
}
// How a passage has moved, within one straight run of it and clear of its ends (so its doorways
// still meet): sagged and rolled where a fault crosses, a stretch of ceiling broken there; deep
// down on a wet world, settled a little in the middle of its longest run
function passageDeform(pts, faults, deep, rng) {
  const len = G.polylineLength(pts);
  const bump = (a, b) => (s) => (s <= a || s >= b ? 0 : 0.5 - 0.5 * Math.cos(2 * Math.PI * (s - a) / (b - a)));
  let s0 = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const A = pts[i], B = pts[i + 1], L = G.dist(A, B);
    for (const f of faults) {
      const da = G.dot(G.sub(A, f.p), f.n), db = G.dot(G.sub(B, f.p), f.n);
      if (da * db > 0 || da === db) continue;
      const sc = s0 + L * da / (da - db), a = Math.max(sc - f.zone, s0 + 0.5, 2.5), b = Math.min(sc + f.zone, s0 + L - 0.5, len - 2.5);
      if (b - a < 3) continue;
      const k = bump(a, b), g = Math.min(rng.range(1.2, 2.2), b - a - 1), m = Math.min(Math.max(sc, a + g / 2 + 0.4), b - g / 2 - 0.4);
      const gap = g > 0.9 && rng.chance(f.broken) ? [m - g / 2, m + g / 2] : null;
      // (no steeper than ~10 degrees at its steepest: a short stretch can't sag far)
      const sag = Math.min(f.sag, (b - a) * 0.055);
      return { a, b, sc, dy: (s) => -sag * k(s), roll: (s) => f.roll * k(s), gap, fault: true };
    }
    s0 += L;
  }
  if (deep && rng.chance(0.45)) {
    let bl = 0, bs = 0; s0 = 0;
    for (let i = 0; i < pts.length - 1; i++) { const L = G.dist(pts[i], pts[i + 1]); if (L > bl) { bl = L; bs = s0; } s0 += L; }
    const a = Math.max(bs + 0.5, 2.5), b = Math.min(bs + bl - 0.5, len - 2.5);
    if (b - a >= 6) {
      // (settling under the load, its ceiling cracked through at the lowest point now and then)
      const k = bump(a, b), sag = rng.range(0.15, 0.35), roll = rng.range(1, 2.5) * (rng.chance(0.5) ? 1 : -1) * Math.PI / 180, m = (a + b) / 2, g = rng.range(1.0, 1.8);
      return { a, b, sc: m, dy: (s) => -sag * k(s), roll: (s) => roll * k(s), gap: rng.chance(0.35) ? [m - g / 2, m + g / 2] : null };
    }
  }
  return null;
}
// a polyline from arc length s0 to s1
function cutPolyline(pts, s0, s1) {
  const out = [G.along(pts, s0).p];
  let s = 0;
  for (let i = 1; i < pts.length; i++) { s += G.dist(pts[i - 1], pts[i]); if (s > s0 + 1e-6 && s < s1 - 1e-6) out.push(pts[i]); }
  out.push(G.along(pts, s1).p);
  return out;
}
// A passage that has moved (passageDeform): built as usual up to the stretch, which is laid in short
// pieces each tipped and rolled as the ground took it; where its ceiling broke, the walls go up to
// rock, with water through it on a wet world
function bentPassage(out, drips, water, pts, y, w, h, capA, capB, mats, D, wet, clearAbove, rng) {
  const len = G.polylineLength(pts);
  passage(out, cutPolyline(pts, 0, D.a), y, w, h, capA, null, mats);
  passage(out, cutPolyline(pts, D.b, len), y, w, h, null, capB, mats);
  const d = G.along(pts, (D.a + D.b) / 2).dir, side = G.perp(d);
  let gap = D.gap;
  if (gap && !clearAbove(G.segRect(G.along(pts, gap[0]).p, G.along(pts, gap[1]).p, w + WALL + 0.3), y + h, 4)) gap = null;
  const frame = (s0, s1) => {
    const dy0 = D.dy(s0), dy1 = D.dy(s1), r = D.roll((s0 + s1) / 2), c = G.along(pts, (s0 + s1) / 2).p;
    const u = norm3([d[0] * (s1 - s0), dy1 - dy0, d[1] * (s1 - s0)]);
    let v = [side[0] * Math.cos(r), Math.sin(r), side[1] * Math.cos(r)];
    const k = u[0] * v[0] + u[1] * v[1] + u[2] * v[2]; v = norm3([v[0] - u[0] * k, v[1] - u[1] * k, v[2] - u[2] * k]);
    let wv = cross3(v, u); if (wv[1] < 0) wv = wv.map((x) => -x);
    return { o: [c[0], y + (dy0 + dy1) / 2, c[1]], u, v, w: wv, half: (s1 - s0) / 2 };
  };
  const R = (a0, a1, b0, b1) => [[a0, b0], [a1, b0], [a1, b1], [a0, b1]];
  const n = Math.ceil((D.b - D.a) / 1.1), step = (D.b - D.a) / n, W = w + WALL;
  for (let k = 0; k < n; k++) {
    const s0 = D.a + k * step, s1 = s0 + step, F = frame(s0, s1), hl = F.half + 0.04, open = gap && (s0 + s1) / 2 > gap[0] && (s0 + s1) / 2 < gap[1];
    const piece = (poly, w0, w1, mat, extra) => out.push({ o: F.o, u: F.u, v: F.v, w: F.w, poly, w0, w1, mat, ...extra });
    piece(R(-hl, hl, -W, W), -SLAB, 0, mats.floor, { floor: true });
    piece(R(-hl, hl, w, W), 0, open ? h + 1.1 : h, mats.wall, { wall: true });
    piece(R(-hl, hl, -W, -w), 0, open ? h + 1.1 : h, mats.wall, { wall: true });
    if (!open) piece(R(-hl, hl, -W, W), h, h + SLAB * 0.75, mats.ceiling);
  }
  if (!gap) return false;
  // the break: its ends closed up to the rock, the rock over it, the ceiling's broken edges hanging,
  // what fell under it, and the water through it
  const g0 = D.a + Math.round((gap[0] - D.a) / step) * step, g1 = D.a + Math.round((gap[1] - D.a) / step) * step;
  const F = frame(g0, g1), gl = F.half + 0.04;
  const piece = (poly, w0, w1, mat) => out.push({ o: F.o, u: F.u, v: F.v, w: F.w, poly, w0, w1, mat });
  piece(R(-gl - 0.2, gl + 0.2, -W, W), h + 1.1, h + 2.3, 'rock');
  piece(R(-gl - 0.25, -gl + 0.05, -W, W), h, h + 1.1, mats.ceiling); piece(R(gl - 0.05, gl + 0.25, -W, W), h, h + 1.1, mats.ceiling);
  const at = (a, b, hh) => [F.o[0] + F.u[0] * a + F.v[0] * b + F.w[0] * hh, F.o[1] + F.u[1] * a + F.v[1] * b + F.w[1] * hh, F.o[2] + F.u[2] * a + F.v[2] * b + F.w[2] * hh];
  for (const e of [-gl, gl]) for (let k = 0; k < 3; k++) {
    const p = at(e, rng.range(-w * 0.85, w * 0.85), h + 0.05);
    out.push(shard(rng, p, [rng.range(-0.3, 0.3), -1, rng.range(-0.3, 0.3)], rng.range(0.35, 1.1), rng.range(0.1, 0.24), 'concrete'));
    if (rng.chance(0.5)) out.push(beam(p, [p[0] + rng.range(-0.4, 0.4), p[1] - rng.range(0.5, 1.4), p[2] + rng.range(-0.4, 0.4)], 0.025, 0.025, 'rust'));
  }
  for (let k = 0; k < 7; k++) {
    // (fallen to the sides, or kicked there: the middle of the way clear)
    const p = at(rng.range(-gl, gl), (rng.chance(0.5) ? 1 : -1) * rng.range(w * 0.5, w * 0.85), 0), a = rng.range(0, Math.PI), sz = rng.range(0.2, 0.6);
    out.push({ o: [p[0], 0, p[2]], u: X, v: Z, w: Y, poly: G.orientedRect([0, 0], [Math.cos(a), Math.sin(a)], sz, sz * rng.range(0.5, 0.9)), w0: p[1] - 0.15, w1: p[1] + Math.min(0.3, sz * rng.range(0.4, 0.7)), mat: rng.chance(0.6) ? 'concrete' : 'rock', taper: rng.range(0.55, 0.9) });   // (low enough to walk over)
  }
  if (wet) for (let k = rng.int(1, 3); k > 0; k--) {
    const b = rng.range(-w * 0.7, w * 0.7), top = at(rng.range(-gl * 0.7, gl * 0.7), b, h + 1.1), foot = at(0, b, 0);
    drips.push({ x: top[0], z: top[2], top: top[1], floor: foot[1] + 0.02, period: rng.range(0.7, 2.2), phase: rng.range(0, 3) });
    puddle(water, [top[0], top[2]], foot[1] + 0.012, rng);
  }
  return true;
}
// A room's broken ceiling, where a fault runs under it with nothing close above: a ragged hole
// along the fault, inside the room
function roomBreak(n, faults, clearAbove, rng, settled = 0) {
  const c = n.center || G.centroid(n.poly), a = rng.range(0, Math.PI);
  const tries = faults.map((f) => ({ f, off: G.dot(G.sub(c, f.p), f.n) })).filter(({ f, off }) => Math.abs(off) < G.dist(c, n.poly[0]) * 0.55 && rng.chance(f.broken));
  // (or settled: cracked anywhere)
  if (!tries.length && rng.chance(settled)) tries.push({ f: { d: [Math.cos(a), Math.sin(a)], n: [-Math.sin(a), Math.cos(a)], p: G.add(c, [rng.range(-1.5, 1.5), rng.range(-1.5, 1.5)]) }, off: 0 });
  for (const { f } of tries) {
    const off = G.dot(G.sub(c, f.p), f.n);
    const hc = G.add(G.sub(c, G.mul(f.n, off)), G.mul(f.d, rng.range(-1.5, 1.5))), pts = [];
    for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2 + rng.range(-0.3, 0.3), r = rng.range(0.9, 1.8); pts.push(G.add(hc, G.add(G.mul(f.d, Math.cos(a) * r * 1.4), G.mul(f.n, Math.sin(a) * r)))); }
    const hole = G.ccw(G.convexHull(pts));
    if (hole.some((p) => G.sdPoly(p, n.poly) > -1)) continue;
    if (!clearAbove(G.inflate(hole, 1.2), n.y1 + SLAB, 3.5)) continue;
    return { hole };
  }
  return null;
}
// Over a broken ceiling: rock a little above the hole, broken rock round its sides, the slab's edge
// hanging in, what fell on the floor below, and the water through it
function brokenRoof(out, drips, water, hole, y0, y1, floor, wet, rng, avoid = []) {
  const c = G.centroid(hole);
  out.push(vprism(G.inflate(hole, 0.6), y1 + 0.7, y1 + 2.2, 'rock'));
  for (let i = 0; i < hole.length; i++) {
    const a = hole[i], b = hole[(i + 1) % hole.length], m = G.lerp(a, b, 0.5), o = G.norm(G.sub(m, c));
    out.push(shard(rng, [m[0] + o[0] * 0.25, y1 - 0.05, m[1] + o[1] * 0.25], [rng.range(-0.2, 0.2), 1, rng.range(-0.2, 0.2)], 1.0, rng.range(0.35, 0.6), 'rock'));
    if (rng.chance(0.6)) out.push(shard(rng, [m[0] - o[0] * 0.1, y0 + 0.02, m[1] - o[1] * 0.1], [rng.range(-0.3, 0.3), -1, rng.range(-0.3, 0.3)], rng.range(0.3, 0.9), rng.range(0.08, 0.2), 'concrete'));
    if (rng.chance(0.35)) out.push(beam([m[0], y0 + 0.1, m[1]], [m[0] + rng.range(-0.4, 0.4), y0 - rng.range(0.4, 1.2), m[1] + rng.range(-0.4, 0.4)], 0.025, 0.025, 'rust'));
  }
  for (let k = 0; k < 6; k++) {
    const p = G.add(c, [rng.range(-1.6, 1.6), rng.range(-1.6, 1.6)]), a = rng.range(0, Math.PI), sz = rng.range(0.2, 0.55);
    if (avoid.some((q) => G.dist(q, p) < sz + 1.0)) continue;
    out.push({ o: [p[0], 0, p[1]], u: X, v: Z, w: Y, poly: G.orientedRect([0, 0], [Math.cos(a), Math.sin(a)], sz, sz * rng.range(0.5, 0.9)), w0: floor - 0.15, w1: floor + Math.min(0.2, sz * rng.range(0.3, 0.6)), mat: rng.chance(0.5) ? 'concrete' : 'rock', taper: rng.range(0.55, 0.9) });   // (low: walked over)
  }
  if (wet) for (let k = rng.int(1, 3); k > 0; k--) {
    const p = G.add(c, [rng.range(-0.7, 0.7), rng.range(-0.7, 0.7)]);
    drips.push({ x: p[0], z: p[1], top: y1 + 0.7, floor: floor + 0.02, period: rng.range(0.6, 2.0), phase: rng.range(0, 3) });
    puddle(water, p, floor + 0.012, rng);
  }
}
function puddle(water, p, y, rng) {
  const R = rng.range(0.45, 0.95), k = rng.int(9, 13), a0 = rng.range(0, Math.PI * 2), poly = [];
  for (let i = 0; i < k; i++) { const a = a0 + (i / k) * Math.PI * 2, r = R * rng.range(0.55, 1); poly.push([p[0] + Math.cos(a) * r, p[1] + Math.sin(a) * r * 0.8]); }
  water.push({ poly, y, puddle: true });
}
// A well's lights: on brackets on its walls every ~7 m of rise, going round it, never in a doorway
function wellLamps(lamps, n, doors) {
  const P = n.poly, m = P.length;
  let k = 0;
  for (let y = n.y0 + 4; y < n.y1 - 1; y += 7) {
    for (let t = 0; t < m; t++) {
      const i = (k * 3 + t) % m, a = P[i], b = P[(i + 1) % m];
      if (doors.some((d) => d.edge === i && y > d.y0 - 1 && y < d.y1 + 1)) continue;
      const nIn = G.norm(G.perp(G.sub(b, a))), q = G.add(G.lerp(a, b, 0.5), G.mul(nIn, 0.3));
      lamps.push({ pos: [q[0], y, q[1]], color: 'cyan', power: 55, wall: true, mount: 'wall', n: nIn });
      break;
    }
    k++;
  }
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

// Machines: no boxes. Drums that step in and out, tapering domes and cones,
// collars, and glowing index strips you can see across the hall.
function machine(out, lamps, m, L, rng, alive) {
  const [x, z] = m.center, r = m.r, y0 = m.y0, y1 = m.y1, rot = rng.range(0, 1);
  const strip = (rr, a, b, mat) => { const t = rng.range(0, Math.PI * 2), p = [x + Math.cos(t) * (rr + 0.05), z + Math.sin(t) * (rr + 0.05)]; out.push(vprism(G.orientedRect(p, [-Math.sin(t), Math.cos(t)], 0.08, 0.05), a, b, mat, { glow: true })); };
  if (m.kind === 'rack') {
    // archive stacks: tall six-sided towers, banded, capped by a tapering crown
    const crown = y1 - r * 1.2;
    out.push(drum(x, z, r, y0, crown, 'concrete', 6, 1, rot));
    out.push(drum(x, z, r, crown, y1, 'metal', 6, 0.45, rot));
    for (let y = y0 + 6; y < crown - 2; y += rng.range(5, 8)) out.push(drum(x, z, r + 0.45, y, y + 0.5, 'metal', 6, 1, rot));
    for (let k = 0; k < 3; k++) strip(r, y0 + 3, crown - 1, 'cyan');
  } else if (m.kind === 'reactor') {
    // generators: a drum on a wider plinth, collars, a stepped dome; one still runs
    out.push(drum(x, z, r * 1.25, y0, y0 + 3, 'concrete', 20, 0.8, rot));
    out.push(drum(x, z, r, y0 + 3, y1 - r * 0.9, 'concrete', 20, 1, rot));
    out.push(drum(x, z, r, y1 - r * 0.9, y1 - r * 0.35, 'metal', 20, 0.62, rot));
    out.push(drum(x, z, r * 0.62, y1 - r * 0.35, y1, 'metal', 16, 0.35, rot));
    for (let y = y0 + 6; y < y1 - r; y += rng.range(7, 11)) out.push(drum(x, z, r + 0.6, y, y + 0.9, 'rust', 20, 1, rot));
    if (alive) {
      out.push(drum(x, z, r + 0.15, y0 + (y1 - y0) * 0.45, y0 + (y1 - y0) * 0.45 + 1.4, 'record', 20, 1, rot, 1));
      lamps.push({ pos: [x + r + 2, y0 + (y1 - y0) * 0.45, z], color: 'core', power: 260, wall: true, range: 60, mount: 'none' });
    } else if (rng.chance(0.5)) strip(r, y0 + 4, y1 - r, 'amber');
  } else if (m.kind === 'column') {
    out.push(drum(x, z, r * 1.4, y0, y0 + 6, 'concrete', 24, 0.72, rot));
    out.push(drum(x, z, r, y0 + 6, y1 - 4, 'metal', 24, 1, rot));
    out.push(drum(x, z, r, y1 - 4, y1, 'metal', 24, 0.5, rot));
    for (let y = y0 + 10; y < y1 - 6; y += 9) out.push(drum(x, z, r + 1.2, y, y + 1.6, 'rust', 24, 1, rot));
    for (let k = 0; k < 4; k++) strip(r, y0 + 6, y1 - 4, 'cyan');
  } else if (m.kind === 'tank') {
    out.push(drum(x, z, r * 0.5, y0, y0 + r * 0.7, 'rust', 18, 2, rot)); // a cone widening up to the tank
    out.push(drum(x, z, r, y0 + r * 0.7, y1 - 6, 'rust', 18, 1, rot));
    out.push(drum(x, z, r, y1 - 6, y1 - 4, 'metal', 18, 0.6, rot));
  } else {
    // heat exchangers: banks of leaning tubes round a core
    out.push(drum(x, z, r * 0.3, y0, y1, 'metal', 12, 1, rot));
    for (let k = 0; k < 6; k++) {
      const a = k / 6 * Math.PI * 2 + rot, p = [x + Math.cos(a) * r * 0.65, z + Math.sin(a) * r * 0.65];
      out.push(beam([p[0], y0, p[1]], [x + Math.cos(a + 0.5) * r * 0.32, y1, z + Math.sin(a + 0.5) * r * 0.32], r * 0.16, r * 0.16, 'metal', 12));
    }
  }
}

// Storeys round a hall: ledges with rows of small lamps, roof beams to a
// central hub, and a glow far down in the pit. Scale you can read.
function dressHall(out, lamps, L, top, doors, walks, rng) {
  const P = L.poly, n = P.length, c = L.center;
  const clearOfWalks = (p, y) => walks.every((q) => Math.abs(q.y0 - y) > 3.5 || G.sdPoly(p, q.poly) > 2.5);
  for (let y = L.y0 + rng.range(7, 10); y < top - 5; y += rng.range(10, 14)) {
    for (let i = 0; i < n; i++) {
      const a = P[i], b = P[(i + 1) % n], e = G.sub(b, a), len = G.len(e), nIn = G.norm(G.perp(e));
      // break the ledge at doorways on this face near this height
      const gaps = doors.filter((d) => d.edge === i && d.y0 < y + 4 && d.y1 > y - 4).map((d) => [d.inner[0] - 0.06, d.inner[1] + 0.06]);
      let s0 = 0.02;
      const run = (t0, t1) => {
        if ((t1 - t0) * len < 2) return;
        const p0 = G.lerp(a, b, t0), p1 = G.lerp(a, b, t1);
        const foot = G.ccw([p0, p1, G.add(p1, G.mul(nIn, 0.9)), G.add(p0, G.mul(nIn, 0.9))]);
        if (!clearOfWalks(G.lerp(p0, p1, 0.5), y)) return;
        out.push(vprism(foot, y - 0.45, y, 'concrete'));
        for (let t = 0.5; t < (t1 - t0) * len - 0.5; t += rng.range(5, 8)) {
          const q = G.add(G.lerp(p0, p1, t / ((t1 - t0) * len)), G.mul(nIn, 0.75));
          out.push(vprism(G.orientedRect(q, e, 0.18, 0.08), y + 0.02, y + 0.2, rng.chance(0.8) ? 'amber' : 'cyan', { glow: true }));
        }
      };
      for (const [g0, g1] of gaps.sort((p, q) => p[0] - q[0])) { run(s0, g0); s0 = Math.max(s0, g1); }
      run(s0, 0.98);
    }
    // a couple of real lights per storey, washing the walls
    for (let k = 0; k < 2; k++) {
      const i = rng.int(0, n - 1), a = P[i], b = P[(i + 1) % n], q = G.add(G.lerp(a, b, rng.range(0.3, 0.7)), G.mul(G.norm(G.perp(G.sub(b, a))), 1.2));
      lamps.push({ pos: [q[0], y + 0.3, q[1]], color: 'amber', power: 140, wall: true, range: 45, mount: 'floor', base: y, n: G.norm(G.perp(G.sub(b, a))) });
    }
  }
  // roof beams from each corner to a hanging hub
  const hub = G.regularPoly(c[0], c[1], L.r * 0.16, L.r * 0.16, 8, 0);
  out.push(drum(c[0], c[1], L.r * 0.16, top - 9, top - 3, 'metal', 8, 0.6));
  for (let i = 0; i < n; i++) out.push(beam([P[i][0], top - 1.4, P[i][1]], [c[0], top - 3.5, c[1]], 0.5, 0.8, 'metal', 4));
  // far down: a dim glow in the pit, and the hub's own light
  for (let k = 0; k < 3; k++) {
    const t = rng.range(0, Math.PI * 2), rr = L.r * rng.range(0.2, 0.6), p = [c[0] + Math.cos(t) * rr, c[1] + Math.sin(t) * rr * L.aspect];
    lamps.push({ pos: [p[0], L.y0 + 1.5, p[1]], color: 'deep', power: 120, wall: true, range: 40, mount: 'none' });
    out.push(vprism(G.regularPoly(p[0], p[1], 0.6, 0.6, 6, t), L.y0, L.y0 + 0.2, 'deep', { glow: true }));
  }
  lamps.push({ pos: [c[0], top - 9.2, c[1]], color: 'cyan', power: 200, range: 70, mount: 'ceiling', top: top - 9 });
  void hub;
}

// Pipes slung between machines across a hall, clear of the catwalks.
function conduits(out, plan, rng) {
  for (const L of plan.landmarks) {
    const ms = plan.machines.filter((m) => m.landmark === L.id);
    const walks = plan.nodes.filter((q) => q.walk && q.landmark === L.id);
    for (let k = 0; k < Math.min(6, ms.length * 2); k++) {
      const a = rng.pick(ms), b = rng.pick(ms);
      if (a === b) continue;
      const y = rng.range(L.y0 + 4, L.y1 - 6), r = rng.range(0.35, 0.9);
      const pa = G.add(a.center, G.mul(G.norm(G.sub(b.center, a.center)), a.r)), pb = G.add(b.center, G.mul(G.norm(G.sub(a.center, b.center)), b.r));
      const hits = walks.some((w) => Math.abs(w.y0 - y) < r + 2.6 && (G.segHitsPoly(pa, pb, G.inflate(w.poly, r + 0.4)) || G.sdPoly(pa, w.poly) < r + 0.5));
      if (hits) continue;
      out.push(beam([pa[0], y, pa[1]], [pb[0], y + rng.range(-2, 2), pb[1]], r, r, rng.chance(0.5) ? 'rust' : 'metal', 12));
    }
  }
}

// Geological wounds: rock bursting through a hall's wall (always one in the
// first hall you reach, on the way in), rubble below, water seeping on wet worlds.
function intrusions(out, lamps, plan, doorsOf, rng) {
  const seeps = [];
  const first = plan.nodes.find((n) => n.kind === 'crossing');
  const halls = [plan.landmarks.find((L) => L.id === first.landmark), ...rng.shuffle(plan.landmarks.filter((L) => L.id !== first.landmark)).slice(0, 1)];
  const wet = plan.environment?.water !== false;
  for (const L of halls) {
    const walks = plan.nodes.filter((q) => q.walk && q.landmark === L.id);
    const doors = doorsOf.get(L.id) || [];
    // a face without doorways near the first crossing's height
    const y0 = L === halls[0] ? first.y0 : rng.range(L.y0 + 8, L.y1 - 10);
    const faces = L.poly.map((a, i) => ({ i, a, b: L.poly[(i + 1) % L.poly.length] })).filter((f) => !doors.some((d) => d.edge === f.i && Math.abs(d.y0 - y0) < 12));
    if (!faces.length) continue;
    const f = L === halls[0] ? faces.sort((p, q) => G.sdPoly(G.lerp(p.a, p.b, 0.5), first.poly) - G.sdPoly(G.lerp(q.a, q.b, 0.5), first.poly))[0] : rng.pick(faces);
    const nIn = G.norm(G.perp(G.sub(f.b, f.a)));
    const yc = y0 + rng.range(2, 6);
    let placed = 0;
    // one break in the wall: a jagged cluster of shards from a common centre,
    // big ones and many small ones, splayed like a burst
    const tWall = rng.range(0.3, 0.7), heart = G.add(G.lerp(f.a, f.b, tWall), G.mul(nIn, -1.2));
    for (let k = 0; k < 26 && placed < 14; k++) {
      const big = placed < 4;
      const base = G.add(heart, G.mul(G.norm(G.sub(f.b, f.a)), rng.range(-4, 4)));
      const y = yc + rng.range(-4, 4), len = big ? rng.range(5, 9) : rng.range(2, 5), r = big ? rng.range(2.2, 3.6) : rng.range(0.7, 1.8);
      const dir = [nIn[0] + rng.range(-0.7, 0.7), rng.range(-0.7, 0.35), nIn[1] + rng.range(-0.7, 0.7)];
      const s = shard(rng, [base[0], y, base[1]], dir, len, r, 'rock');
      // keep every catwalk clear (sampled along the shard's axis)
      const w = norm3(dir);
      let ok = true;
      for (let t = 0; t <= len && ok; t += 1) {
        const p = [base[0] + w[0] * t, y + w[1] * t, base[1] + w[2] * t], rr = r * (1 - t / len * 0.7) + 2.2;
        ok = walks.every((q) => Math.abs(q.y0 + 1 - p[1]) > rr || G.sdPoly([p[0], p[2]], q.poly) > rr);
      }
      if (!ok) continue;
      out.push(s); placed++;
      // rubble on the pit floor below
      const tip = [base[0] + w[0] * len * 0.6, base[1] + w[2] * len * 0.6];
      if (big) for (let j = 0; j < 4; j++) out.push(shard(rng, [tip[0] + rng.range(-4, 4), L.y0 - 0.3, tip[1] + rng.range(-4, 4)], [rng.range(-0.5, 0.5), 1, rng.range(-0.5, 0.5)], rng.range(0.8, 2.6), rng.range(0.5, 1.8), 'rock'));
      if (wet && placed <= 2) seeps.push({ x: tip[0], z: tip[1], y0: L.y0, y1: y, w: rng.range(0.6, 1.4), yaw: Math.atan2(nIn[1], nIn[0]) });
    }
    if (placed) { const m = G.lerp(f.a, f.b, 0.5); lamps.push({ pos: [m[0] + nIn[0] * 0.45, yc + 4, m[1] + nIn[1] * 0.45], color: 'work', power: 90, range: 30, mount: 'wall', n: nIn }); }
  }
  return { seeps };
}
