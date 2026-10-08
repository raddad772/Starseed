// Plan-view (x, z) geometry for the site planner: convex polygons, their
// offsets and overlaps, and shortest paths around them. Polygons are arrays of
// [x, z], convex and counter-clockwise (positive signed area).

export const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
export const mul = (a, s) => [a[0] * s, a[1] * s];
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
export const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
export const len = (a) => Math.hypot(a[0], a[1]);
export const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
export const norm = (a) => { const l = Math.hypot(a[0], a[1]) || 1; return [a[0] / l, a[1] / l]; };
export const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
export const perp = (a) => [-a[1], a[0]]; // 90 degrees counter-clockwise

export function area(poly) {
  let s = 0;
  for (let i = 0; i < poly.length; i++) s += cross(poly[i], poly[(i + 1) % poly.length]);
  return s / 2;
}
export function ccw(poly) { return area(poly) < 0 ? poly.slice().reverse() : poly; }
export function centroid(poly) {
  let cx = 0, cz = 0, a = 0;
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i], q = poly[(i + 1) % poly.length], c = cross(p, q);
    a += c; cx += (p[0] + q[0]) * c; cz += (p[1] + q[1]) * c;
  }
  return a ? [cx / (3 * a), cz / (3 * a)] : poly[0].slice();
}

// An ellipse-ish convex polygon: `sides` corners on radii rx (local x) and rz,
// rotated by rot about (cx, cz).
export function regularPoly(cx, cz, rx, rz, sides, rot = 0) {
  const out = [], c = Math.cos(rot), s = Math.sin(rot);
  for (let i = 0; i < sides; i++) {
    const t = (i + 0.5) / sides * Math.PI * 2;
    const x = Math.cos(t) * rx, z = Math.sin(t) * rz;
    out.push([cx + x * c - z * s, cz + x * s + z * c]);
  }
  return ccw(out);
}
// A rectangle of half-sizes (a along dir, b across) centred on c.
export function orientedRect(c, dir, a, b) {
  const d = norm(dir), n = perp(d);
  return ccw([
    add(add(c, mul(d, -a)), mul(n, -b)), add(add(c, mul(d, a)), mul(n, -b)),
    add(add(c, mul(d, a)), mul(n, b)), add(add(c, mul(d, -a)), mul(n, b)),
  ]);
}
// The thick segment a-b (half-width w), extended by `ext` past both ends.
export function segRect(a, b, w, ext = 0) {
  const d = norm(sub(b, a)), L = dist(a, b);
  return orientedRect(lerp(a, b, 0.5), d, L / 2 + ext, w);
}

// Offset a convex polygon outward by d (mitred, with the mitre clipped so a
// sharp corner never reaches more than 1.6 d out).
export function inflate(poly, d) {
  if (d === 0) return poly.slice();
  const n = poly.length, out = [];
  for (let i = 0; i < n; i++) {
    const p0 = poly[(i + n - 1) % n], p1 = poly[i], p2 = poly[(i + 1) % n];
    // outward normals of a CCW polygon point to the right of each edge
    const o0 = norm(perp(sub(p0, p1))), o1 = norm(perp(sub(p1, p2)));
    const m = norm(add(o0, o1)), cosHalf = Math.max(dot(m, o0), 1e-3);
    out.push(add(p1, mul(o0, d)), add(p1, mul(o1, d)), add(p1, mul(m, Math.min(d / cosHalf, 1.6 * d))));
  }
  return convexHull(out);
}

export function convexHull(pts) {
  const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (p.length < 3) return p;
  const lower = [], upper = [];
  for (const q of p) {
    while (lower.length >= 2 && cross(sub(lower.at(-1), lower.at(-2)), sub(q, lower.at(-2))) <= 0) lower.pop();
    lower.push(q);
  }
  for (let i = p.length - 1; i >= 0; i--) {
    const q = p[i];
    while (upper.length >= 2 && cross(sub(upper.at(-1), upper.at(-2)), sub(q, upper.at(-2))) <= 0) upper.pop();
    upper.push(q);
  }
  upper.pop(); lower.pop();
  return lower.concat(upper);
}

// Strictly inside (by more than eps) a convex CCW polygon.
export function inside(p, poly, eps = 1e-6) {
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    if (cross(sub(b, a), sub(p, a)) / dist(a, b) <= eps) return false;
  }
  return true;
}
// Signed distance to a convex polygon (negative inside).
export function sdPoly(p, poly) {
  let maxOut = -Infinity, outside = false, best = Infinity;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length], e = sub(b, a);
    const s = -cross(e, sub(p, a)) / len(e); // >0 outside this edge
    if (s > 0) outside = true;
    maxOut = Math.max(maxOut, s);
    const t = Math.max(0, Math.min(1, dot(sub(p, a), e) / dot(e, e)));
    best = Math.min(best, dist(p, add(a, mul(e, t))));
  }
  return outside ? best : maxOut;
}

// Does segment a-b pass through the interior of convex poly (shrunk by eps,
// so grazing an edge or running along it does not count)?
export function segHitsPoly(a, b, poly, eps = 1e-4) {
  let t0 = 0, t1 = 1;
  const d = sub(b, a);
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i], q = poly[(i + 1) % poly.length], e = sub(q, p);
    const nrm = norm([e[1], -e[0]]); // outward
    const num = dot(nrm, sub(a, p)) + eps, den = dot(nrm, d);
    if (Math.abs(den) < 1e-12) { if (num > 0) return false; continue; }
    const t = -num / den;
    if (den > 0) t1 = Math.min(t1, t); else t0 = Math.max(t0, t);
    if (t0 > t1) return false;
  }
  return t1 - t0 > 1e-9;
}

// Separating-axis overlap of two convex polygons, with clearance c.
export function polysOverlap(P, Q, c = 0) {
  for (const poly of [P, Q]) {
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length];
      const ax = norm([b[1] - a[1], a[0] - b[0]]);
      let pMin = Infinity, pMax = -Infinity, qMin = Infinity, qMax = -Infinity;
      for (const v of P) { const s = dot(v, ax); pMin = Math.min(pMin, s); pMax = Math.max(pMax, s); }
      for (const v of Q) { const s = dot(v, ax); qMin = Math.min(qMin, s); qMax = Math.max(qMax, s); }
      if (pMax + c <= qMin || qMax + c <= pMin) return false;
    }
  }
  return true;
}

// Shortest path from s to t around convex obstacles (a visibility graph).
// Obstacles should already be inflated by the clearance wanted. Returns the
// polyline [s, ..., t] or null.
export function shortestPath(s, t, obstacles) {
  const blocked = (a, b) => obstacles.some((o) => segHitsPoly(a, b, o));
  if (!blocked(s, t)) return [s, t];
  const nodes = [s, t];
  for (const o of obstacles) for (const v of o) if (!obstacles.some((q) => q !== o && inside(v, q, 1e-3))) nodes.push(v);
  const n = nodes.length, D = new Float64Array(n).fill(Infinity), prev = new Int32Array(n).fill(-1), done = new Uint8Array(n);
  D[0] = 0;
  for (;;) {
    let u = -1, best = Infinity;
    for (let i = 0; i < n; i++) if (!done[i] && D[i] < best) { best = D[i]; u = i; }
    if (u < 0 || u === 1) break;
    done[u] = 1;
    for (let v = 0; v < n; v++) {
      if (done[v] || v === u) continue;
      const w = D[u] + dist(nodes[u], nodes[v]);
      if (w < D[v] && !blocked(nodes[u], nodes[v])) { D[v] = w; prev[v] = u; }
    }
  }
  if (!isFinite(D[1])) return null;
  const path = [];
  for (let i = 1; i >= 0; i = prev[i]) { path.push(nodes[i]); if (i === 0) break; }
  return path.reverse();
}

// Do segments a-b and c-d cross (properly, not merely touching at an end)?
export function segsCross(a, b, c, d) {
  const d1 = cross(sub(b, a), sub(c, a)), d2 = cross(sub(b, a), sub(d, a));
  const d3 = cross(sub(d, c), sub(a, c)), d4 = cross(sub(d, c), sub(b, c));
  return d1 * d2 < -1e-9 && d3 * d4 < -1e-9;
}

export function polylineLength(path) {
  let L = 0;
  for (let i = 1; i < path.length; i++) L += dist(path[i - 1], path[i]);
  return L;
}
// Point at arc length s along a polyline, with the local direction.
export function along(path, s) {
  for (let i = 1; i < path.length; i++) {
    const L = dist(path[i - 1], path[i]);
    if (s <= L || i === path.length - 1) {
      const t = L > 0 ? Math.max(0, Math.min(1, s / L)) : 0;
      return { p: lerp(path[i - 1], path[i], t), dir: norm(sub(path[i], path[i - 1])), seg: i - 1 };
    }
    s -= L;
  }
  return { p: path.at(-1).slice(), dir: [1, 0], seg: path.length - 2 };
}
