// Walk a compiled site's main route with the real walker and collision, the
// way a player would: steer along passages and catwalks, float up zero-g
// wells, jump up the low-gravity decks. Used by the Node test and in a page.
import * as THREE from 'three';
import { solidGeometries } from '../../src/understructure/plan/solidMesh.js';
import { SiteCollision } from '../../src/understructure/site/siteCollision.js';
import { SiteWalker } from '../../src/understructure/site/siteWalker.js';
import { inside, centroid } from '../../src/understructure/plan/geom2.js';

export function siteCollision(site) {
  const meshes = [...solidGeometries(site.solids).values()].map((g) => new THREE.Mesh(g));
  return new SiteCollision(meshes, site.zones);
}

const DT = 1 / 30;

// Steps the walker toward (x, z) until within tol; false if it stops making progress.
function walkTo(w, target, { tol = 0.6, limit = 60, jump = null } = {}) {
  let best = Infinity, since = 0;
  for (let t = 0; t < limit; t += DT) {
    const dx = target[0] - w.pos[0], dz = target[2] - w.pos[2], d = Math.hypot(dx, dz);
    if (d < tol && (target[1] === undefined || Math.abs(w.pos[1] - target[1]) < 0.6)) return true;
    w.yaw = Math.atan2(-dx, -dz); w.pitch = 0;
    // ease off near the target (and in the air, steer for it): momentum carries
    w.step(DT, { forward: d > 0.2 ? Math.min(1, d / 2.5) : 0, jump: jump ? jump(d) : false });
    if (d < best - 0.01) { best = d; since = 0; } else if ((since += DT) > 3) return false;
  }
  return false;
}

// Zero gravity, as a player does it: rise up the middle of the well, hold
// just above the top doorway's sill, then push out through the doorway.
function floatUp(w, room, exitPt) {
  const c = room.center, hold = room.top + 0.25;
  const dir = [exitPt[0] - c[0], exitPt[2] - c[1]], dl = Math.hypot(...dir) || 1;
  const door = [c[0] + dir[0] / dl * 9, c[1] + dir[1] / dl * 9]; // a point out through the doorway
  for (let t = 0; t < 60; t += DT) {
    if (w.gravity !== 0 && w.grounded && Math.abs(w.pos[1] - room.top) < 0.5) return true;
    const rising = w.pos[1] < hold - 0.15;
    const tx = rising ? c[0] : door[0], tz = rising ? c[1] : door[1];
    const dx = tx - w.pos[0], dz = tz - w.pos[2], d = Math.hypot(dx, dz);
    w.yaw = Math.atan2(-dx, -dz); w.pitch = 0;
    const vy = w.vel[1], err = hold - w.pos[1];
    const up = rising ? vy < 1.6 : err > 0.08 && vy < 0.3, down = !rising && (err < -0.08 && vy > -0.3);
    const hv = Math.hypot(w.vel[0], w.vel[2]);
    w.step(DT, { forward: rising ? (d > 0.6 ? 0.5 : 0) : 1, up, down, brake: (rising && d < 0.6 && hv > 0.4) || (!rising && Math.abs(vy) > 0.5) });
  }
  return false;
}

// Low gravity, as a player does it: hop from deck to deck, jumping at the
// edge of the one you are on; after a fall, start again from the lowest deck.
function jumpUp(w, room, decks) {
  let k = 0, falls = 0;
  for (let t = 0; t < 90 && k < decks.length; t += DT) {
    const d = decks[k], dx = d.c[0] - w.pos[0], dz = d.c[1] - w.pos[2], dist = Math.hypot(dx, dz);
    if (w.grounded && dist < 0.8 && Math.abs(w.pos[1] - d.y) < 0.4) { k++; continue; }
    if (w.grounded && w.pos[1] >= d.y - 0.1 && k < decks.length - 1) { k++; continue; } // already up past it
    if (w.grounded && k > 0 && w.pos[1] < decks[k - 1].y - 0.6) { k = 0; if (++falls > 6) return { ok: false, at: d }; continue; }
    w.yaw = Math.atan2(-dx, -dz); w.pitch = 0;
    let jump = false, back = false;
    if (w.grounded && d.y > w.pos[1] + 0.3 && dist < 1.3) back = true; // too close underneath: step back for a run-up
    else if (w.grounded && d.y > w.pos[1] + 0.3) {
      const ax = w.pos[0] - Math.sin(w.yaw) * 0.6, az = w.pos[2] - Math.cos(w.yaw) * 0.6;
      const edge = w.col.supportAt(ax, az, w.pos[1] + 0.3, 0.2, 0.6) === null;
      jump = dist < 2.2 || edge;
    }
    w.step(DT, { forward: back ? -0.6 : dist > 0.2 ? Math.min(1, dist / 2.5) : 0, jump });
  }
  return k >= decks.length ? { ok: true } : { ok: false, at: decks[Math.min(k, decks.length - 1)] };
}

// Follow a polyline at floor level by pure pursuit: steer for a point a
// little way ahead along the line, the way a player walks a corridor.
function follow(w, line, { look = 1.6, limit = 120 } = {}) {
  const segLen = [], cum = [0];
  for (let i = 1; i < line.length; i++) { segLen.push(Math.hypot(line[i][0] - line[i - 1][0], line[i][2] - line[i - 1][2])); cum.push(cum[i - 1] + segLen[i - 1]); }
  const total = cum.at(-1);
  const project = () => { // arc length of the closest point on the line
    let best = Infinity, at = 0;
    for (let i = 1; i < line.length; i++) {
      const a = line[i - 1], b = line[i], ex = b[0] - a[0], ez = b[2] - a[2], L2 = ex * ex + ez * ez || 1;
      const t = Math.max(0, Math.min(1, ((w.pos[0] - a[0]) * ex + (w.pos[2] - a[2]) * ez) / L2));
      const d = Math.hypot(a[0] + ex * t - w.pos[0], a[2] + ez * t - w.pos[2]);
      if (d < best) { best = d; at = cum[i - 1] + t * segLen[i - 1]; }
    }
    return at;
  };
  const pointAt = (s) => {
    s = Math.max(0, Math.min(total, s));
    for (let i = 1; i < line.length; i++) if (s <= cum[i] || i === line.length - 1) { const t = segLen[i - 1] ? (s - cum[i - 1]) / segLen[i - 1] : 0; return [line[i - 1][0] + (line[i][0] - line[i - 1][0]) * t, line[i - 1][2] + (line[i][2] - line[i - 1][2]) * t]; }
  };
  let bestS = -1, since = 0;
  for (let t = 0; t < limit; t += DT) {
    const s = project();
    const end = line.at(-1);
    if (total - s < 0.5 && Math.hypot(end[0] - w.pos[0], end[2] - w.pos[2]) < 0.8) return true;
    const p = pointAt(s + look), dx = p[0] - w.pos[0], dz = p[1] - w.pos[2];
    w.yaw = Math.atan2(-dx, -dz); w.pitch = 0;
    w.step(DT, { forward: 1 });
    if (s > bestS + 0.02) { bestS = s; since = 0; } else if ((since += DT) > 3) return false;
  }
  return false;
}

export function walkRoute(plan, site, col = siteCollision(site)) {
  const w = new SiteWalker(col, site.spawn);
  const byId = new Map(plan.nodes.map((n) => [n.id, n]));
  const report = { ok: false, reached: [], fail: null, walker: w };
  const at = () => w.pos.map((v) => v.toFixed(2)).join(',');
  for (let i = 1; i < plan.route.length; i++) {
    const a = plan.route[i - 1], b = plan.route[i], n = byId.get(b), prev = byId.get(a);
    const l = plan.links.find((q) => q.a === a && q.b === b);
    if (!l) { report.fail = `no link ${a}->${b}`; return report; }
    // the passage, joined onto the end of the catwalk or room we are leaving
    const line = [[w.pos[0], w.pos[1], w.pos[2]], ...l.path.slice(prev.kind === 'climb' ? 1 : 0)];
    if (n.walk) line.push([n.walk[1][0], n.y0, n.walk[1][1]]);
    if (n.kind === 'climb') line.pop(); // stop at the well's doorway side, not its middle
    if (!follow(w, line)) { report.fail = `stuck on ${l.id}${n.walk ? '+' + b : ''} at ${at()}`; return report; }
    if (n.kind === 'climb') {
      const out = plan.links.find((q) => q.a === b), exitPt = out.path[1];
      if (n.mode === 'zero-g') {
        if (!walkTo(w, [n.center[0], undefined, n.center[1]], { tol: 1.2, limit: 15 }) && w.gravity !== 0) { report.fail = `could not enter ${b} at ${at()}`; return report; }
        if (!floatUp(w, n, exitPt)) { report.fail = `zero-g climb failed in ${b} at ${at()}`; return report; }
      } else {
        const decks = site.solids.filter((s) => s.floor && s.w0 > n.y0 && s.w1 <= n.top + 0.01 && inside(centroid(s.poly), n.poly, 0))
          .map((s) => ({ c: centroid(s.poly), y: s.w1 })).sort((p, q) => p.y - q.y);
        const r = jumpUp(w, n, decks);
        if (!r.ok) { report.fail = `low-g climb failed in ${b} at deck y ${r.at.y.toFixed(2)}, walker at ${at()}`; return report; }
      }
    }
    if (Math.abs(w.pos[1] - n.y0) > 0.6 && n.kind !== 'climb') { report.fail = `${b}: walker at y ${w.pos[1].toFixed(2)}, floor ${n.y0}`; return report; }
    report.reached.push(b);
  }
  report.ok = true;
  return report;
}
