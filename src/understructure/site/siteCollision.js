// Collision against a compiled site: the triangle BVH of the solids that are
// drawn (walls, ceilings, rails, machinery: GeometryCollision's capsule test),
// plus the ground under a point (a downward ray against the upward faces),
// plus the gravity zones. Positions are in the site's own frame.
import * as THREE from 'three';
import { GeometryCollision } from '../geometryCollision.js';
import { inside, sdPoly, dot, sub, perp } from '../plan/geom2.js';

const _n = new THREE.Vector3(), _d = new THREE.Vector3();

export class SiteCollision extends GeometryCollision {
  constructor(meshes, zones) {
    super(meshes);
    this.zones = zones;
    this.unbounded = true;
    // parts that come and go (gates): blockers, floors, and fold portals
    this.blockers = []; this.floors = []; this.portals = [];
  }
  addBlocker(b) { this.blockers.push(b); }
  addFloor(f) { this.floors.push(f); }
  addPortal(p) { this.portals.push(p); }

  // A capsule against the active blockers (extruded polygons); sets lastHit like a wall.
  _blocked(x, y, z, radius) {
    for (const b of this.blockers) {
      if (!b.active() || y + 1.9 <= b.y0 || y >= b.y1) continue;
      const d = sdPoly([x, z], b.poly);
      if (d < radius - 0.02) {
        // the normal of the nearest edge, pointing out of the blocker
        let best = Infinity, nx = 0, nz = 0;
        for (let i = 0; i < b.poly.length; i++) {
          const a = b.poly[i], c = b.poly[(i + 1) % b.poly.length], e = sub(c, a), L = Math.hypot(...e), n = [e[1] / L, -e[0] / L];
          const out = dot(sub([x, z], a), n);
          if (Math.abs(out - d) < best) { best = Math.abs(out - d); nx = n[0]; nz = n[1]; }
        }
        this.lastHit = { normal: { x: nx, y: 0, z: nz }, depth: radius - d };
        return true;
      }
    }
    return false;
  }

  // Did a step from p to q pass through an active fold frame? Then where to, and the turn.
  portal(p, q) {
    for (const f of this.portals) {
      if (!f.active()) continue;
      for (const [A, B, sgn] of [[f.a, f.b, 1], [f.b, f.a, -1]]) {
        const sp = dot(sub([p[0], p[2]], [A.pos[0], A.pos[2]]), A.dir) * sgn, sq = dot(sub([q[0], q[2]], [A.pos[0], A.pos[2]]), A.dir) * sgn;
        if (!(sp < 0 && sq >= 0)) continue;
        const lat = dot(sub([q[0], q[2]], [A.pos[0], A.pos[2]]), perp(A.dir));
        if (Math.abs(lat) > A.half || q[1] < A.pos[1] - 0.6 || q[1] > A.pos[1] + 2.6) continue;
        const turn = Math.atan2(B.dir[1], B.dir[0]) - Math.atan2(A.dir[1], A.dir[0]);
        const c = Math.cos(turn), s = Math.sin(turn), rx = q[0] - A.pos[0], rz = q[2] - A.pos[2];
        return { pos: [B.pos[0] + rx * c - rz * s, q[1] - A.pos[1] + B.pos[1], B.pos[2] + rx * s + rz * c], turn };
      }
    }
    return null;
  }

  // GeometryCollision.clear, but anything wholly below the step height is
  // stepped over whatever way it faces (a slab's edge whose normal rounds to
  // -0.004 up is not a wall), and a level face counts as upward.
  clear(x, y, z, radius = 0.4, step = 0) {
    if (this.blockers.length && this._blocked(x, y, z, radius)) return false;
    const c = this.capsule; c.radius = radius; c.start.set(x, y + radius, z); c.end.set(x, y + 1.9 - radius, z);
    this.query.min.set(x - radius, y, z - radius); this.query.max.set(x + radius, y + 1.9, z + radius);
    const stack = [this.root];
    while (stack.length) {
      const node = stack.pop();
      if (!node.box.intersectsBox(this.query)) continue;
      if (!node.list) { stack.push(node.left, node.right); continue; }
      for (const item of node.list) {
        if (!item.box.intersectsBox(this.query)) continue;
        if (item.box.max.y <= y + step + 1e-4) continue; // wholly below the step: walked over
        let triangle = item.triangle; triangle.getNormal(this.normal);
        if (this.normal.dot(_d.copy(c.start).sub(triangle.a)) < 0) triangle = this.reverse.set(triangle.c, triangle.b, triangle.a);
        const hit = this.test.triangleCapsuleIntersect(c, triangle);
        if (hit && hit.depth > 0.025) {
          if (hit.normal.y >= -1e-3 && triangle.closestPointToPoint(c.start, this.contact).y <= y + step) continue;
          this.lastHit = { triangle: triangle.clone(), ...hit };
          return false;
        }
      }
    }
    return true;
  }

  // The highest walkable face under (x, z) between yTop and yTop - drop, or null.
  floorBelow(x, z, yTop, drop = 60) {
    let best = null;
    const stack = [this.root];
    while (stack.length) {
      const node = stack.pop(), b = node.box;
      if (x < b.min.x || x > b.max.x || z < b.min.z || z > b.max.z || b.min.y > yTop || b.max.y < yTop - drop) continue;
      if (!node.list) { stack.push(node.left, node.right); continue; }
      for (const { triangle: t, box } of node.list) {
        if (x < box.min.x || x > box.max.x || z < box.min.z || z > box.max.z || box.min.y > yTop) continue;
        t.getNormal(_n);
        if (_n.y < 0.55) continue; // walls, steep faces and undersides are not floors (solids face outward)
        const y = heightOn(t, x, z);
        if (y === null || y > yTop + 1e-4 || y < yTop - drop) continue;
        if (best === null || y > best) best = y;
      }
    }
    for (const f of this.floors) {
      if (!f.active() || f.y > yTop + 1e-4 || f.y < yTop - drop) continue;
      if (inside([x, z], f.poly, 0) && (best === null || f.y > best)) best = f.y;
    }
    return best;
  }

  // Ground under the capsule: the centre and four points round it.
  supportAt(x, z, yTop, r = 0.3, drop = 60) {
    let best = this.floorBelow(x, z, yTop, drop);
    for (const [dx, dz] of [[r, 0], [-r, 0], [0, r], [0, -r]]) {
      const f = this.floorBelow(x + dx * 0.6, z + dz * 0.6, yTop, drop);
      if (f !== null && (best === null || f > best)) best = f;
    }
    return best;
  }

  zoneAt(x, y, z) {
    for (const zn of this.zones) if (y >= zn.y0 - 0.1 && y <= zn.y1 && inside([x, z], zn.poly, 0)) return zn;
    return null;
  }
  gravityAt(x, y, z) { return this.zoneAt(x, y + 0.9, z)?.gravity ?? 1; }
}

// Height of triangle t's plane at (x, z), if (x, z) is inside it in plan.
function heightOn(t, x, z) {
  const { a, b, c } = t;
  const v0x = c.x - a.x, v0z = c.z - a.z, v1x = b.x - a.x, v1z = b.z - a.z, v2x = x - a.x, v2z = z - a.z;
  const d00 = v0x * v0x + v0z * v0z, d01 = v0x * v1x + v0z * v1z, d02 = v0x * v2x + v0z * v2z;
  const d11 = v1x * v1x + v1z * v1z, d12 = v1x * v2x + v1z * v2z, den = d00 * d11 - d01 * d01;
  if (Math.abs(den) < 1e-12) return null;
  const u = (d11 * d02 - d01 * d12) / den, v = (d00 * d12 - d01 * d02) / den;
  if (u < -1e-6 || v < -1e-6 || u + v > 1 + 1e-6) return null;
  return a.y + u * (c.y - a.y) + v * (b.y - a.y);
}
