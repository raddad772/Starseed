// Screen apps: a small immediate-mode UI drawn into a 2D canvas.
//
// An app draws its whole screen every frame at a fixed logical size with
// these calls (buttons, rows, scrolling lists, text). Whoever shows the
// screen (a visor panel in your suit now; in-world consoles and a zoomed-in
// view later) only supplies the canvas and one input record per frame:
//   pointer      {x, y} in logical px, or null       pointerMoved: true when it moved
//   press        a click / tap at the pointer
//   nav          'up' | 'down' | 'left' | 'right' (D-pad, stick, arrow keys)
//   activate     press the highlighted control (A, Enter)
//   back         (B, Backspace)        tab: -1 / +1 (LB / RB)        scroll: rows
// The highlight follows the pointer when it moves; the D-pad moves it to the
// nearest control in that direction (lists step row by row and scroll).

export const THEME = {
  bg: '#050b11', panel: 'rgba(230,239,243,0.045)', panelHi: 'rgba(79,214,230,0.13)', hair: 'rgba(230,239,243,0.16)',
  ink: '#e6eff3', dim: '#9fb2bc', faint: 'rgba(159,178,188,0.55)',
  target: '#4fd6e6', nav: '#e65bd9', ok: '#6ade8f', caution: '#f1b43a', warn: '#ff5248',
  font: '"B612", "Helvetica Neue", Arial, sans-serif', mono: '"B612 Mono", ui-monospace, Menlo, monospace',
};

const inside = (r, p) => p && p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;

export class ScreenUI {
  constructor(w, h) {
    this.w = w; this.h = h;
    this.rects = new Map();
    this.prev = new Map();
    this.focus = null;
    this.scrolls = new Map(); // list id -> first row shown
    this.lists = new Map();   // list id -> { x, y, w, h, count, rowH } (this frame)
    this.defaultFocus = null;
  }

  // ------------------------------------------------------------ frame

  begin(g, input) {
    this.g = g;
    this.in = input;
    this.prev = this.rects;
    this.rects = new Map();
    this.lists.clear();
    this.pendingNav = input.nav || null;
    this.defaultFocus = null;
    if (input.pointer && input.pointerMoved) {
      for (const [id, r] of this.prev) if (!r.disabled && inside(r, input.pointer)) { this.focus = id; break; }
    }
    g.save();
    g.fillStyle = THEME.bg;
    g.fillRect(0, 0, this.w, this.h);
  }

  end() {
    const g = this.g;
    // the D-pad between controls: the nearest one in that direction
    if (this.pendingNav) {
      const cur = this.rects.get(this.focus);
      if (!cur) this.focus = this.firstFocus();
      else {
        const ax = cur.x + cur.w / 2, ay = cur.y + cur.h / 2;
        let best = null, bestCost = Infinity;
        for (const [id, r] of this.rects) {
          if (id === this.focus || r.disabled) continue;
          const bx = r.x + r.w / 2, by = r.y + r.h / 2;
          let along, across;
          switch (this.pendingNav) {
            case 'up': along = cur.y - (r.y + r.h); across = Math.abs(bx - ax); break;
            case 'down': along = r.y - (cur.y + cur.h); across = Math.abs(bx - ax); break;
            case 'left': along = cur.x - (r.x + r.w); across = Math.abs(by - ay); break;
            default: along = r.x - (cur.x + cur.w); across = Math.abs(by - ay);
          }
          if (along < -4) continue;
          const cost = Math.max(0, along) + across * 2.5;
          if (cost < bestCost) { bestCost = cost; best = id; }
        }
        if (best) this.focus = best;
      }
    }
    if (!this.rects.has(this.focus)) this.focus = this.firstFocus();
    g.restore();
  }

  firstFocus() {
    if (this.defaultFocus && this.rects.has(this.defaultFocus)) return this.defaultFocus;
    for (const [id, r] of this.rects) if (!r.disabled) return id;
    return null;
  }

  // the control highlighted when nothing else is (this frame)
  preferFocus(id) { this.defaultFocus = id; }
  setFocus(id) { this.focus = id; }

  // ------------------------------------------------------------ drawing

  rect(x, y, w, h, fill, stroke) {
    const g = this.g;
    if (fill) { g.fillStyle = fill; g.fillRect(x, y, w, h); }
    if (stroke) { g.strokeStyle = stroke; g.lineWidth = 1; g.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1); }
  }

  text(str, x, y, o = {}) {
    const g = this.g;
    g.font = `${o.weight || 400} ${o.size || 15}px ${o.mono ? THEME.mono : THEME.font}`;
    g.fillStyle = o.color || THEME.ink;
    g.textAlign = o.align || 'left';
    g.textBaseline = o.baseline || 'alphabetic';
    let s = String(str);
    if (o.spacing) g.letterSpacing = `${o.spacing}px`; else g.letterSpacing = '0px';
    if (o.maxW && g.measureText(s).width > o.maxW) {
      while (s.length > 1 && g.measureText(s + '…').width > o.maxW) s = s.slice(0, -1);
      s += '…';
    }
    g.fillText(s, x, y);
    return g.measureText(s).width;
  }

  // ------------------------------------------------------------ controls

  // a focusable area; true when activated this frame (click on it, or A /
  // Enter while it is highlighted)
  control(id, x, y, w, h, disabled = false) {
    const r = { x, y, w, h, disabled };
    this.rects.set(id, r);
    if (disabled) return false;
    const inp = this.in;
    if (inp.press && inside(r, inp.pointer)) { this.focus = id; return true; }
    return this.focus === id && !!inp.activate;
  }

  focused(id) { return this.focus === id; }

  button(id, x, y, w, h, label, o = {}) {
    const act = this.control(id, x, y, w, h, o.disabled);
    const f = this.focused(id) && !o.disabled;
    const tone = THEME[o.tone] || THEME.ink;
    this.rect(x, y, w, h, o.primary ? (f ? tone : 'rgba(0,0,0,0)') : (f ? THEME.panelHi : THEME.panel), f ? THEME.target : (o.primary ? tone : THEME.hair));
    const col = o.disabled ? THEME.faint : (o.primary ? (f ? THEME.bg : tone) : (f ? THEME.target : tone));
    if (o.sub) {
      this.text(label, x + 14, y + h / 2 - 3, { size: o.size || 15, weight: 700, color: col, maxW: w - 28 });
      this.text(o.sub, x + 14, y + h / 2 + 15, { size: 12, color: o.disabled ? THEME.faint : THEME.dim, maxW: w - 28 });
    } else {
      this.text(label.toUpperCase(), x + w / 2, y + h / 2 + 5, { size: o.size || 13, weight: 700, color: col, align: 'center', spacing: 1.5, maxW: w - 16 });
    }
    return act;
  }

  // A scrolling list. drawRow(i, x, y, w, h, focused) draws row i; returns
  // the index activated this frame, or -1. The D-pad steps row by row.
  list(id, x, y, w, h, count, rowH, drawRow, o = {}) {
    const inp = this.in;
    const vis = Math.max(1, Math.floor(h / rowH));
    let top = this.scrolls.get(id) || 0;
    // the highlight on one of our rows: up / down step through them all
    const key = (i) => `${id}#${i}`;
    let fi = -1;
    if (this.focus && this.focus.startsWith(id + '#')) fi = +this.focus.slice(id.length + 1);
    if (fi >= 0 && (this.pendingNav === 'up' || this.pendingNav === 'down')) {
      const ni = fi + (this.pendingNav === 'down' ? 1 : -1);
      if (ni >= 0 && ni < count) { fi = ni; this.focus = key(ni); this.pendingNav = null; }
    }
    if (fi >= count) { fi = count - 1; this.focus = count ? key(fi) : null; }
    // wheel / right stick over the list
    if (inp.scroll && (inside({ x, y, w, h }, inp.pointer) || fi >= 0)) top += inp.scroll;
    if (fi >= 0) { if (fi < top) top = fi; if (fi >= top + vis) top = fi - vis + 1; }
    top = Math.max(0, Math.min(top, count - vis));
    this.scrolls.set(id, top);
    let hit = -1;
    for (let k = 0; k < vis && top + k < count; k++) {
      const i = top + k, ry = y + k * rowH;
      const dis = o.disabled ? o.disabled(i) : false;
      if (this.control(key(i), x, ry, w, rowH - 2, dis)) hit = i;
      const f = this.focused(key(i));
      const sel = o.selected === i;
      this.rect(x, ry, w, rowH - 2, f ? THEME.panelHi : (sel ? 'rgba(230,239,243,0.07)' : THEME.panel), f ? THEME.target : (sel ? THEME.dim : null));
      if (sel) this.rect(x, ry, 3, rowH - 2, THEME.target);
      drawRow(i, x, ry, w, rowH - 2, f);
    }
    // scroll marks
    if (top > 0) this.text('▲', x + w - 12, y - 4, { size: 10, color: THEME.dim, align: 'center' });
    if (top + vis < count) this.text('▼', x + w - 12, y + vis * rowH + 10, { size: 10, color: THEME.dim, align: 'center' });
    this.lists.set(id, { x, y, w, h, count, rowH });
    return hit;
  }

  // the mouse cursor (drawn by the host when a pointer is in use)
  cursor(p) {
    const g = this.g;
    g.save();
    g.translate(p.x, p.y);
    g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 17); g.lineTo(4.5, 13); g.lineTo(8, 20); g.lineTo(10.5, 19); g.lineTo(7, 12); g.lineTo(12.5, 12); g.closePath();
    g.fillStyle = THEME.ink; g.fill();
    g.strokeStyle = THEME.bg; g.lineWidth = 1.2; g.stroke();
    g.restore();
  }
}
