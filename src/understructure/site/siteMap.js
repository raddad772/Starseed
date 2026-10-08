// A Metroid Prime style map: every space you have entered is drawn as its 3D
// outline (floor and ceiling polygons joined at the corners), the passages
// you have walked as their centre lines, catwalks across the halls as bars.
// A small one stays up in the corner (a plan of your own floor, the way you face
// up); M opens the full one (drag to orbit, wheel to zoom). Canvas 2D, no second
// GPU context.
import { inside } from '../plan/geom2.js';

const MINI_RANGE = 36;   // m from you to the corner map's rim

export class SiteMap {
  constructor(plan, site, saved = {}) {
    this.plan = plan; this.site = site;
    this.seen = new Set(saved.seen || []);
    this.walked = new Set(saved.walked || []);
    this.vols = new Map([...plan.landmarks, plan.access].map((L) => [L.id, L]));
    this.view = { yaw: 0.7, pitch: 0.75, zoom: 1, pan: [0, 0] };
  }

  // note where you are: spaces entered, passages walked
  visit(p) {
    for (const n of this.plan.nodes) {
      if (this.seen.has(n.id)) continue;
      if (n.walk) { const L = this.vols.get(n.landmark); if (Math.abs(p[1] - n.y0) < 2 && inside([p[0], p[2]], L.poly, 0)) { this.seen.add(n.id); this.seen.add(L.id); } }
      else if (p[1] >= n.y0 - 0.5 && p[1] <= n.y1 && inside([p[0], p[2]], n.poly, 0)) this.seen.add(n.id);
    }
    for (const l of this.plan.links) {
      if (this.walked.has(l.id)) continue;
      const y = l.path[0][1];
      if (Math.abs(p[1] - y) > 1.5) continue;
      for (let i = 1; i < l.path.length; i++) {
        const a = l.path[i - 1], b = l.path[i], ex = b[0] - a[0], ez = b[2] - a[2], L2 = ex * ex + ez * ez || 1;
        const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * ex + (p[2] - a[2]) * ez) / L2));
        if (Math.hypot(a[0] + ex * t - p[0], a[2] + ez * t - p[2]) < l.width + 0.3) { this.walked.add(l.id); break; }
      }
    }
  }

  save() { return { seen: [...this.seen], walked: [...this.walked] }; }

  // draw into a 2D canvas: everything seen, around the player
  draw(canvas, { player, yaw, target, finds = [], gates = [], mini = false }) {
    const ratio = Math.min(devicePixelRatio || 1, 2), W = canvas.clientWidth, H = canvas.clientHeight;
    if (canvas.width !== W * ratio || canvas.height !== H * ratio) { canvas.width = W * ratio; canvas.height = H * ratio; }
    const g = canvas.getContext('2d'); g.setTransform(ratio, 0, 0, ratio, 0, 0); g.clearRect(0, 0, W, H);
    if (mini) { this.drawMini(g, W, H, { player, yaw, target, finds, gates }); return; }
    g.fillStyle = 'rgba(8,16,17,0.9)'; g.fillRect(0, 0, W, H);
    const v = this.view, cy = Math.cos(mini ? yaw + Math.PI : v.yaw), sy = Math.sin(mini ? yaw + Math.PI : v.yaw), cp = Math.cos(mini ? 1.05 : v.pitch), sp = Math.sin(mini ? 1.05 : v.pitch);
    const scale = (mini ? 3.2 : 4.4) * (mini ? 1 : v.zoom), centre = [player[0] + (mini ? 0 : v.pan[0]), player[1], player[2] + (mini ? 0 : v.pan[1])];
    const P = (x, y, z) => {
      const dx = x - centre[0], dy = y - centre[1], dz = z - centre[2];
      const rx = dx * cy - dz * sy, rz = dx * sy + dz * cy;
      return [W / 2 + rx * scale, H / 2 + (-dy * cp + rz * sp) * scale, dy * sp + rz * cp];
    };
    const prism = (poly, y0, y1, stroke, fill) => {
      const lo = poly.map(([x, z]) => P(x, y0, z)), hi = poly.map(([x, z]) => P(x, y1, z));
      g.beginPath(); lo.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]))); g.closePath();
      if (fill) { g.fillStyle = fill; g.fill(); }
      g.strokeStyle = stroke; g.stroke();
      g.beginPath(); hi.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]))); g.closePath(); g.stroke();
      g.beginPath(); for (let i = 0; i < lo.length; i++) { g.moveTo(lo[i][0], lo[i][1]); g.lineTo(hi[i][0], hi[i][1]); } g.stroke();
    };
    g.lineWidth = 1;
    // halls you have been in: their outline at each catwalk level you crossed, faint
    for (const L of this.vols.values()) {
      if (!this.seen.has(L.id)) continue;
      const levels = this.plan.nodes.filter((n) => n.walk && n.landmark === L.id && this.seen.has(n.id));
      for (const n of levels) {
        const ring = L.poly.map(([x, z]) => P(x, n.y0, z));
        g.strokeStyle = 'rgba(160,200,190,0.35)'; g.beginPath(); ring.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]))); g.closePath(); g.stroke();
        const a = P(n.walk[0][0], n.y0, n.walk[0][1]), b = P(n.walk[1][0], n.y0, n.walk[1][1]);
        g.strokeStyle = 'rgba(232,183,119,0.9)'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); g.lineWidth = 1;
      }
    }
    // passages walked
    g.strokeStyle = 'rgba(227,233,218,0.55)'; g.lineWidth = 2;
    for (const l of this.plan.links) {
      if (!this.walked.has(l.id)) continue;
      g.beginPath(); l.path.forEach((q, i) => { const s = P(q[0], q[1], q[2]); i ? g.lineTo(s[0], s[1]) : g.moveTo(s[0], s[1]); }); g.stroke();
    }
    g.lineWidth = 1;
    // rooms entered, as outlines
    for (const n of this.plan.nodes) {
      if (n.walk || !this.seen.has(n.id)) continue;
      const col = n.kind === 'climb' ? 'rgba(160,231,239,0.85)' : n.kind === 'core' ? 'rgba(201,162,255,0.9)' : n.kind === 'staging' ? 'rgba(224,140,110,0.85)' : 'rgba(227,233,218,0.75)';
      prism(n.poly, n.y0, n.kind === 'climb' ? n.y1 : n.y0 + 2.6, col, 'rgba(227,233,218,0.05)');
    }
    // finds taken, gates still shut, the target, you
    for (const f of finds) { const s = P(...f.pos); g.fillStyle = 'rgba(159,240,224,0.8)'; g.fillRect(s[0] - 1.5, s[1] - 1.5, 3, 3); }
    for (const gt of gates) { const s = P(...gt.pos); g.strokeStyle = '#ff7a48'; g.strokeRect(s[0] - 3.5, s[1] - 3.5, 7, 7); }
    if (target) { const s = P(...target); g.strokeStyle = '#e8b777'; g.beginPath(); g.arc(s[0], s[1], 5, 0, Math.PI * 2); g.stroke(); }
    const me = P(...player), dir = P(player[0] - Math.sin(yaw) * 4, player[1], player[2] - Math.cos(yaw) * 4);
    g.fillStyle = '#e8b777'; g.beginPath(); g.arc(me[0], me[1], 3.2, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#e8b777'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(me[0], me[1]); g.lineTo(dir[0], dir[1]); g.stroke();
  }

  // the corner map: a plan of your own floor round you (MINI_RANGE m), the way you face up, in a
  // circle; spaces seen on other floors faint, what's off it (the target) a mark on the rim
  drawMini(g, W, H, { player, yaw, target, finds, gates }) {
    const cx = W / 2, cy = H / 2, R = Math.min(W, H) / 2 - 3, k = R / MINI_RANGE, py = player[1];
    const c = Math.cos(yaw), s = Math.sin(yaw);
    // (right = (cos yaw, -sin yaw), ahead = (-sin yaw, -cos yaw) in x, z; ahead is up)
    const P = (x, z) => { const dx = x - player[0], dz = z - player[2]; return [cx + (dx * c - dz * s) * k, cy + (dx * s + dz * c) * k]; };
    const near = (y, lo = 3.5, hi = 3.5) => y > py - lo && y < py + hi;
    const ring = (poly) => { g.beginPath(); poly.forEach(([x, z], i) => { const q = P(x, z); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }); g.closePath(); };
    g.save();
    g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.fillStyle = 'rgba(8,16,17,0.66)'; g.fill(); g.clip();
    g.lineWidth = 1;
    // halls you've been in: their outline, and the catwalk on your floor
    for (const L of this.vols.values()) {
      if (!this.seen.has(L.id)) continue;
      const levels = this.plan.nodes.filter((n) => n.walk && n.landmark === L.id && this.seen.has(n.id));
      const here = levels.find((n) => near(n.y0, 2.5, 2.5));
      ring(L.poly); g.strokeStyle = here ? 'rgba(160,200,190,0.5)' : 'rgba(160,200,190,0.16)'; g.stroke();
      if (here) {
        const a = P(here.walk[0][0], here.walk[0][1]), b = P(here.walk[1][0], here.walk[1][1]);
        g.strokeStyle = 'rgba(232,183,119,0.9)'; g.lineWidth = 3; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); g.lineWidth = 1;
      }
    }
    // rooms entered: yours bright, the rest faint
    for (const n of this.plan.nodes) {
      if (n.walk || !this.seen.has(n.id)) continue;
      const top = n.kind === 'climb' ? n.y1 : n.y0 + 2.6, mine = py > n.y0 - 1.5 && py < top + 1;
      const col = n.kind === 'climb' ? '160,231,239' : n.kind === 'core' ? '201,162,255' : n.kind === 'staging' ? '224,140,110' : '227,233,218';
      ring(n.poly);
      if (mine) { g.fillStyle = `rgba(${col},0.1)`; g.fill(); }
      g.strokeStyle = `rgba(${col},${mine ? 0.85 : 0.14})`; g.lineWidth = mine ? 1.5 : 1; g.stroke(); g.lineWidth = 1;
    }
    // passages walked on your floor
    g.strokeStyle = 'rgba(227,233,218,0.6)'; g.lineWidth = 3;
    for (const l of this.plan.links) {
      if (!this.walked.has(l.id) || !near(l.path[0][1], 2, 2)) continue;
      g.beginPath(); l.path.forEach((q, i) => { const p = P(q[0], q[2]); i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); }); g.stroke();
    }
    g.lineWidth = 1;
    for (const f of finds) { if (!near(f.pos[1])) continue; const p = P(f.pos[0], f.pos[2]); g.fillStyle = 'rgba(159,240,224,0.8)'; g.fillRect(p[0] - 1.5, p[1] - 1.5, 3, 3); }
    for (const gt of gates) { if (!near(gt.pos[1])) continue; const p = P(gt.pos[0], gt.pos[2]); g.strokeStyle = '#ff7a48'; g.strokeRect(p[0] - 3, p[1] - 3, 6, 6); }
    g.restore();
    // the target: on the map, or a mark on the rim its way (hollow when it's on another floor)
    if (target) {
      const p = P(target[0], target[2]), dx = p[0] - cx, dy = p[1] - cy, d = Math.hypot(dx, dy), other = !near(target[1], 2.5, 2.5);
      g.strokeStyle = g.fillStyle = '#e8b777'; g.lineWidth = 1.5;
      if (d < R - 6) { g.beginPath(); g.arc(p[0], p[1], 4.5, 0, Math.PI * 2); g.stroke(); }
      else {
        const ux = dx / d, uy = dy / d, tx = cx + ux * (R - 2), ty = cy + uy * (R - 2);
        g.beginPath(); g.moveTo(tx, ty); g.lineTo(tx - ux * 8 - uy * 4.5, ty - uy * 8 + ux * 4.5); g.lineTo(tx - ux * 8 + uy * 4.5, ty - uy * 8 - ux * 4.5); g.closePath();
        other ? g.stroke() : g.fill();
      }
    }
    g.strokeStyle = 'rgba(227,233,218,0.35)'; g.lineWidth = 1; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.stroke();
    // you, facing up
    g.fillStyle = '#e8b777'; g.beginPath(); g.moveTo(cx, cy - 6); g.lineTo(cx + 4.2, cy + 4.5); g.lineTo(cx, cy + 2.4); g.lineTo(cx - 4.2, cy + 4.5); g.closePath(); g.fill();
  }
}
