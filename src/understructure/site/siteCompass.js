// A 3D arrow in a glassy sphere: it points at the guide's target in true 3D
// (ahead, behind, up, down), drawn with a little projection in a 2D canvas.
// The widget is seen from slightly above, so an arrow pointing straight ahead
// still reads as pointing away.

const TILT = 0.7; // radians the widget is viewed from above

// arrow along +z: an octagonal shaft and a cone, as triangles
function arrowMesh() {
  const tris = [], N = 10, ring = (r, z) => Array.from({ length: N }, (_, i) => [Math.cos(i / N * Math.PI * 2) * r, Math.sin(i / N * Math.PI * 2) * r, z]);
  const s0 = ring(0.09, -0.62), s1 = ring(0.09, 0.18), h0 = ring(0.24, 0.18), tip = [0, 0, 0.7], tail = [0, 0, -0.62], neck = [0, 0, 0.18];
  for (let i = 0; i < N; i++) {
    const j = (i + 1) % N;
    tris.push([s0[i], s0[j], s1[j]], [s0[i], s1[j], s1[i]], [tail, s0[j], s0[i]]);
    tris.push([h0[i], h0[j], tip], [neck, h0[j], h0[i]]);
  }
  return tris;
}
const MESH = arrowMesh();

export class SiteCompass {
  constructor(parent) {
    this.canvas = document.createElement('canvas');
    Object.assign(this.canvas.style, { position: 'absolute', left: '36px', top: '96px', width: '132px', height: '150px', pointerEvents: 'none' });
    parent.append(this.canvas);
    this.ctx = this.canvas.getContext('2d');
  }

  // dir: target direction in camera space (x right, y up, z toward the viewer); info text below
  draw(dir, text, sub) {
    const ratio = Math.min(devicePixelRatio || 1, 2), W = 132, H = 150;
    if (this.canvas.width !== W * ratio) { this.canvas.width = W * ratio; this.canvas.height = H * ratio; }
    const g = this.ctx; g.setTransform(ratio, 0, 0, ratio, 0, 0); g.clearRect(0, 0, W, H);
    const cx = 66, cy = 60, R = 50;
    // the glass sphere
    const body = g.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
    body.addColorStop(0, 'rgba(210,235,230,0.22)'); body.addColorStop(0.7, 'rgba(120,160,160,0.10)'); body.addColorStop(1, 'rgba(200,230,225,0.28)');
    g.fillStyle = body; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(227,233,218,0.35)'; g.lineWidth = 1; g.stroke();
    // equator seen from above: where "level" is
    g.strokeStyle = 'rgba(227,233,218,0.18)'; g.beginPath(); g.ellipse(cx, cy, R * 0.98, R * Math.sin(TILT), 0, 0, Math.PI * 2); g.stroke();
    // the arrow: rotate +z onto dir, tilt the view, project
    const d = norm(dir), up = Math.abs(d[1]) > 0.95 ? [1, 0, 0] : [0, 1, 0];
    const xa = norm(cross(up, d)), ya = cross(d, xa);
    const ct = Math.cos(TILT), st = Math.sin(TILT);
    const view = (p) => {
      const w = [xa[0] * p[0] + ya[0] * p[1] + d[0] * p[2], xa[1] * p[0] + ya[1] * p[1] + d[1] * p[2], xa[2] * p[0] + ya[2] * p[1] + d[2] * p[2]];
      // camera space -> widget view (pitched down by TILT): forward (-z) leans up the screen
      return [w[0], w[1] * ct - w[2] * st, w[1] * st + w[2] * ct];
    };
    const light = norm([-0.4, 0.7, 0.6]);
    // painter's order (no culling: the mesh's winding is not relied on); shade the side facing us
    const faces = MESH.map((t) => {
      const v = t.map(view); let n = norm(cross(sub3(v[1], v[0]), sub3(v[2], v[0])));
      if (n[2] < 0) n = n.map((x) => -x);
      return { v, n, z: (v[0][2] + v[1][2] + v[2][2]) / 3 };
    }).sort((a, b) => a.z - b.z);
    for (const f of faces) {
      const k = 0.35 + 0.65 * Math.max(0, f.n[0] * light[0] + f.n[1] * light[1] + f.n[2] * light[2]);
      g.fillStyle = `rgb(${Math.round(232 * k)},${Math.round(183 * k)},${Math.round(119 * k)})`;
      g.beginPath();
      f.v.forEach((p, i) => { const s = R * 0.92 / (1 - p[2] * 0.18), x = cx + p[0] * s, y = cy - p[1] * s; i ? g.lineTo(x, y) : g.moveTo(x, y); });
      g.closePath(); g.fill();
    }
    // highlight on the glass
    g.fillStyle = 'rgba(255,255,255,0.10)'; g.beginPath(); g.ellipse(cx - R * 0.35, cy - R * 0.5, R * 0.32, R * 0.14, -0.5, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#e3e9da'; g.font = '11px ui-monospace, monospace'; g.textAlign = 'center';
    g.fillText(text, cx, cy + R + 16);
    if (sub) { g.fillStyle = '#a7b6a9'; g.font = '9px ui-monospace, monospace'; g.fillText(sub, cx, cy + R + 29); }
  }
}

const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const norm = (a) => { const l = Math.hypot(...a) || 1; return a.map((x) => x / l); };
