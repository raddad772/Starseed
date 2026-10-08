// Where the route goes next from where you are: the furthest route space you
// have reached, and a point in the one after it. Inside a climb room, its top
// doorway; at the core, the record; once the record is taken, the lift.
import { inside } from '../plan/geom2.js';

export class SiteGuide {
  constructor(plan) {
    this.plan = plan;
    this.byId = new Map(plan.nodes.map((n) => [n.id, n]));
    this.vols = new Map([...plan.landmarks, plan.access].map((L) => [L.id, L]));
    this.route = plan.route.map((id) => this.byId.get(id));
    this.reached = 0;
  }

  // is p in route space n?
  within(n, p) {
    const xz = [p[0], p[2]];
    if (n.kind === 'crossing' || n.kind === 'access') {
      const L = this.vols.get(n.landmark);
      return Math.abs(p[1] - n.y0) < 1.5 && inside(xz, L.poly, 0);
    }
    return p[1] >= n.y0 - 0.5 && p[1] <= n.y1 && inside(xz, n.poly, 0);
  }

  // the doorway point at the top of a climb room
  topExit(n) {
    const out = this.plan.links.find((l) => l.a === n.id);
    const c = n.center, q = out.path[1], d = [q[0] - c[0], q[2] - c[1]], L = Math.hypot(...d) || 1;
    const r = Math.min(...n.poly.map((v) => Math.hypot(v[0] - c[0], v[1] - c[1])));
    return [c[0] + d[0] / L * (r + 1.5), n.top, c[1] + d[1] / L * (r + 1.5)];
  }

  entryOf(n) {
    if (n.walk) return [n.walk[0][0], n.y0, n.walk[0][1]];
    return [n.center[0], n.y0, n.center[1]];
  }

  target(p, { recordTaken, recordPos }) {
    for (let i = this.route.length - 1; i > this.reached; i--) if (this.within(this.route[i], p)) { this.reached = i; break; }
    const here = this.route[this.reached];
    if (recordTaken) { const a = this.byId.get('access'); return { pos: [a.walk[1][0], a.y0, a.walk[1][1]], label: "FOUNDERS' LIFT" }; }
    if (here.kind === 'core') return { pos: recordPos, label: 'SITE RECORD' };
    if (here.kind === 'climb' && this.within(here, p) && p[1] < here.top - 0.3) return { pos: this.topExit(here), label: 'UP' };
    const next = this.route[Math.min(this.reached + 1, this.route.length - 1)];
    return { pos: this.entryOf(next), label: next.name };
  }
}
