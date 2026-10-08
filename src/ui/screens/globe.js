// A world as a globe on a screen app (the nav computer's: ui/apps/fleet.js): its own colours with no
// clouds (ui/globeMap.js), its relief, lit by its sun as it stands now (the night side dark), turned
// with a drag or the right stick, zoomed with the wheel. A click without a drag picks the spot under
// it; A with the globe highlighted picks the one under the cross at its middle.
import { THEME } from './kit.js';

const inside = (r, p) => p && p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const RES = 360;        // pixels across the globe's picture (scaled to fit)
const RELIEF = 8;       // how much the ground's slopes are made to show at this scale
const NIGHT = 0.22;     // the night side's light (dark, its ground still made out)

export class GlobeView {
  constructor() {
    this.lon = 0; this.lat = 0.35; this.zoom = 1;
    this.canvas = null; this.drawn = '';
    this.drag = null;
  }

  // to look straight down on body-fixed unit direction d
  lookAt(d) { this.lat = Math.asin(clamp(d.y, -1, 1)); this.lon = Math.atan2(d.z, d.x); }

  // the view's frame, body-fixed: c toward the viewer, u up the picture, r to its right (east, for a
  // world turning about +y)
  frame() {
    const cl = Math.cos(this.lat), sl = Math.sin(this.lat), co = Math.cos(this.lon), so = Math.sin(this.lon);
    return { c: [cl * co, sl, cl * so], u: [-sl * co, cl, -sl * so], r: [so, 0, -co] };
  }

  // picture point (-1..1 each way, up positive) -> body-fixed unit direction, or null off the disc
  unproject(px, py, F = this.frame()) {
    const x = px / this.zoom, y = py / this.zoom, r2 = x * x + y * y;
    if (r2 > 1) return null;
    const z = Math.sqrt(1 - r2);
    return [F.r[0] * x + F.u[0] * y + F.c[0] * z, F.r[1] * x + F.u[1] * y + F.c[1] * z, F.r[2] * x + F.u[2] * y + F.c[2] * z];
  }

  // body-fixed direction -> picture point, and whether it's on the near side
  project(d, F = this.frame()) {
    const l = Math.hypot(d[0], d[1], d[2]) || 1;
    return { x: (d[0] * F.r[0] + d[1] * F.r[1] + d[2] * F.r[2]) / l * this.zoom, y: (d[0] * F.u[0] + d[1] * F.u[1] + d[2] * F.u[2]) / l * this.zoom, near: (d[0] * F.c[0] + d[1] * F.c[1] + d[2] * F.c[2]) / l > 0 };
  }

  // the picture (only when something it shows has changed)
  render(map, sun, R) {
    const key = `${this.lon.toFixed(4)}|${this.lat.toFixed(4)}|${this.zoom.toFixed(3)}|${sun.map((v) => v.toFixed(2)).join()}|${map.w}`;
    if (key === this.drawn) return;
    this.drawn = key;
    const N = RES;
    if (!this.canvas) { this.canvas = document.createElement('canvas'); this.canvas.width = this.canvas.height = N; this.img = this.canvas.getContext('2d').createImageData(N, N); }
    const F = this.frame(), px = this.img.data, { w, h, rgb, elev } = map;
    const texel = 2 * Math.PI * R / w, k = RELIEF / (2 * texel);
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const o = (j * N + i) * 4, d = this.unproject((i + 0.5) / N * 2 - 1, 1 - (j + 0.5) / N * 2, F);
      if (!d) { px[o + 3] = 0; continue; }
      const lat = Math.asin(clamp(d[1], -1, 1)), lon = Math.atan2(d[2], d[0]);
      const ti = ((Math.floor((lon + Math.PI) / (2 * Math.PI) * w) % w) + w) % w, tj = clamp(Math.floor((Math.PI / 2 - lat) / Math.PI * h), 0, h - 1), t = tj * w + ti;
      // (relief: the slope east and north, tipping the surface's normal; lit by the sun)
      const ex = elev[tj * w + (ti + 1) % w] - elev[tj * w + (ti - 1 + w) % w];
      const ny = elev[Math.max(0, tj - 1) * w + ti] - elev[Math.min(h - 1, tj + 1) * w + ti];
      const cl = Math.cos(lat), east = [-Math.sin(lon), 0, Math.cos(lon)], north = [-Math.sin(lat) * Math.cos(lon), cl, -Math.sin(lat) * Math.sin(lon)];
      const sx = ex * k / Math.max(0.2, cl), sy = ny * k;
      const n0 = d[0] - east[0] * sx - north[0] * sy, n1 = d[1] - east[1] * sx - north[1] * sy, n2 = d[2] - east[2] * sx - north[2] * sy;
      const nl = Math.hypot(n0, n1, n2), lit = Math.max(0, (n0 * sun[0] + n1 * sun[1] + n2 * sun[2]) / nl);
      // (the terminator soft, as the sky's glow carries a little past it)
      const day = clamp((d[0] * sun[0] + d[1] * sun[1] + d[2] * sun[2]) * 6 + 0.5, 0, 1);
      const L = NIGHT + (1 - NIGHT) * lit * day;
      px[o] = rgb[t * 3] * L; px[o + 1] = rgb[t * 3 + 1] * L; px[o + 2] = rgb[t * 3 + 2] * L; px[o + 3] = 255;
    }
    this.canvas.getContext('2d').putImageData(this.img, 0, 0);
  }

  // Draw at (x, y), side S. opts: map (or null while it's made), R (the world's radius), sun (body-fixed
  // unit toward the sun), marks [{ d, color, ring }], picked (direction or null). Returns a body-fixed
  // direction picked this frame, or null
  draw(ui, x, y, S, { map, R, sun, marks = [], picked = null, id = 'globe' }) {
    const g = ui.g, inp = ui.in, rect = { x, y, w: S, h: S };
    // (a focusable control for the D-pad and A; the mouse's press, drag and click handled here)
    const activated = ui.control(id, x, y, S, S) && !inp.press;
    const focused = ui.focused(id);
    ui.rect(x, y, S, S, THEME.panel, focused ? THEME.target : THEME.hair);
    if (!map) {
      ui.text('Mapping the world…', x + S / 2, y + S / 2, { size: 14, color: THEME.dim, align: 'center' });
      return null;
    }
    let pick = null;
    const toPic = (p) => ({ px: (p.x - x) / S * 2 - 1, py: 1 - (p.y - y) / S * 2 });
    // drag to turn, click to pick
    if (inp.press && inside(rect, inp.pointer)) this.drag = { x: inp.pointer.x, y: inp.pointer.y, moved: 0 };
    if (this.drag && inp.pointer) {
      const dx = inp.pointer.x - this.drag.x, dy = inp.pointer.y - this.drag.y;
      if (dx || dy) {
        this.drag.moved += Math.abs(dx) + Math.abs(dy);
        const k = 2 / S / this.zoom * 1.6;
        this.lon -= dx * k; this.lat = clamp(this.lat + dy * k, -1.45, 1.45);
        this.drag.x = inp.pointer.x; this.drag.y = inp.pointer.y;
      }
      if (!inp.down) {
        if (this.drag.moved < 4) { const q = toPic(inp.pointer); pick = this.unproject(q.px, q.py); }
        this.drag = null;
      }
    } else if (this.drag && !inp.down) this.drag = null;
    // the wheel over it zooms; the right stick turns it; A picks under the cross
    if (inp.scroll && inside(rect, inp.pointer)) this.zoom = clamp(this.zoom * Math.pow(1.18, -inp.scroll), 1, 24);
    if (inp.look && (Math.abs(inp.look.x) > 0.05 || Math.abs(inp.look.y) > 0.05)) {
      const dt = inp.dt || 1 / 60;
      this.lon -= inp.look.x * dt * 1.4 / this.zoom; this.lat = clamp(this.lat - inp.look.y * dt * 1.4 / this.zoom, -1.45, 1.45);
    }
    if (activated) pick = this.unproject(0, 0);
    // the picture
    this.render(map, sun, R);
    g.save();
    g.imageSmoothingEnabled = true;
    g.drawImage(this.canvas, x, y, S, S);
    // marks on the near side
    const F = this.frame(), at = (d) => { const p = this.project(d, F); return p.near && Math.abs(p.x) <= 1 && Math.abs(p.y) <= 1 ? [x + (p.x + 1) / 2 * S, y + (1 - p.y) / 2 * S] : null; };
    for (const m of marks) {
      const p = at(m.d); if (!p) continue;
      g.strokeStyle = g.fillStyle = m.color || THEME.target; g.lineWidth = 1.5;
      g.beginPath(); g.arc(p[0], p[1], m.ring ? 6 : 3, 0, Math.PI * 2); m.ring ? g.stroke() : g.fill();
    }
    if (picked) {
      const p = at(picked);
      if (p) { g.strokeStyle = THEME.caution; g.lineWidth = 2; g.beginPath(); g.arc(p[0], p[1], 8, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.moveTo(p[0] - 12, p[1]); g.lineTo(p[0] - 5, p[1]); g.moveTo(p[0] + 5, p[1]); g.lineTo(p[0] + 12, p[1]); g.moveTo(p[0], p[1] - 12); g.lineTo(p[0], p[1] - 5); g.moveTo(p[0], p[1] + 5); g.lineTo(p[0], p[1] + 12); g.stroke(); }
    }
    // the cross at the middle, for the D-pad's pick
    if (focused && !inp.pointer) { g.strokeStyle = 'rgba(230,239,243,0.6)'; g.lineWidth = 1; const cx = x + S / 2, cy = y + S / 2; g.beginPath(); g.moveTo(cx - 10, cy); g.lineTo(cx + 10, cy); g.moveTo(cx, cy - 10); g.lineTo(cx, cy + 10); g.stroke(); }
    g.restore();
    ui.text(this.zoom > 1.05 ? `×${this.zoom.toFixed(1)}` : 'drag to turn · wheel to zoom · click to pick', x + S - 8, y + S - 8, { size: 11, color: THEME.faint, align: 'right' });
    return pick;
  }
}
