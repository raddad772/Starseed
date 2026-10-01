// Paint: your ships' liveries (a screen app, from the quick menu's Suit
// computer). Pick a ship, a part of its paint (main, second, stripe), then a
// colour: the hull's paint mask takes it at once. A livery is world state on
// the vessel (v.livery): everyone sees the same paint.

import { THEME } from '../screens/kit.js';
import { setLivery, DEFAULT_LIVERY } from '../../render/glbShip.js';

const W = 860, H = 560;
const PARTS = [['main', 'Main'], ['second', 'Second'], ['stripe', 'Stripe']];
const PALETTE = [
  '#e8e8e2', '#b9bec4', '#737a82', '#41464c', '#1d2125', '#f0d9a8',
  '#8c2418', '#a8323e', '#c4572a', '#d9a441', '#e5d36a', '#8a5a3a',
  '#3f6b3a', '#6aa36a', '#2f5d7c', '#4fa3c7', '#3a3f7a', '#7c5ab8',
];

// the material carrying a ship's paint, if it has one (the Blender-built ships)
export function hullOf(v) {
  const vis = v.visual;
  return vis && (vis.hull || (vis.model && vis.model.hull)) || null;
}

export class PaintApp {
  constructor(game) {
    this.game = game;
    this.w = W; this.h = H;
    this.title = 'Paint';
    this.sel = 0;
    this.part = 'main';
  }

  ships() {
    const g = this.game;
    return g.vessels.filter((v) => !v.dead && g.listed(v) && hullOf(v));
  }

  livery(v) { return v.livery || (v.livery = { ...(v.type.livery || DEFAULT_LIVERY) }); }

  paint(v, part, colour) {
    const L = this.livery(v);
    L[part] = colour;
    setLivery(hullOf(v), L);
  }

  draw(ui) {
    const g = this.game, ships = this.ships();
    ui.rect(0, 0, W, 50, 'rgba(79,214,230,0.06)');
    ui.rect(0, 49, W, 1, THEME.hair);
    ui.text('SUIT', 24, 31, { size: 13, weight: 700, color: THEME.dim, spacing: 3 });
    ui.text('PAINT', 82, 31, { size: 18, weight: 700, color: THEME.target, spacing: 4 });
    ui.text('your ships\' liveries', W - 24, 31, { size: 13, color: THEME.dim, align: 'right' });
    if (!ships.length) { ui.text('No ship here takes paint.', 24, 96, { size: 15, color: THEME.dim }); return; }
    this.sel = Math.min(this.sel, ships.length - 1);
    // the ships
    const hit = ui.list('ships', 24, 70, 300, H - 140, ships.length, 52, (i, x, y, w, h, f) => {
      const v = ships[i], L = this.livery(v);
      ui.text(v.name, x + 14, y + 22, { size: 15, weight: 700, color: f ? THEME.target : THEME.ink, maxW: w - 90 });
      ui.text(v.type.className, x + 14, y + 40, { size: 12, color: THEME.dim, maxW: w - 90 });
      PARTS.forEach(([k], j) => ui.rect(x + w - 70 + j * 20, y + 16, 16, 16, L[k], THEME.hair));
    }, { selected: this.sel });
    if (!ui.focus) ui.preferFocus('ships#' + this.sel);
    if (hit >= 0) { this.sel = hit; ui.setFocus('part-main'); }
    const v = ships[this.sel], L = this.livery(v);
    const X = 348;
    ui.text(v.name.toUpperCase(), X, 92, { size: 16, weight: 700, color: THEME.ink, spacing: 2, maxW: W - X - 24 });
    // the part being painted
    PARTS.forEach(([k, label], j) => {
      const bx = X + j * 162;
      if (ui.button('part-' + k, bx, 108, 150, 46, label, { sub: L[k].toUpperCase(), tone: this.part === k ? 'target' : undefined })) this.part = k;
      ui.rect(bx + 118, 120, 22, 22, L[k], this.part === k ? THEME.target : THEME.hair);
    });
    // the colours
    const cols = 6, cw = 70, gap = 10, top = 180;
    PALETTE.forEach((c, i) => {
      const cx = X + (i % cols) * (cw + gap), cy = top + Math.floor(i / cols) * (cw - 10 + gap);
      const id = 'col-' + i;
      if (ui.control(id, cx, cy, cw, cw - 10)) this.paint(v, this.part, c);
      const f = ui.focused(id), on = L[this.part] === c;
      ui.rect(cx, cy, cw, cw - 10, c, f ? THEME.target : (on ? THEME.ink : THEME.hair));
      if (f) ui.rect(cx + 2, cy + 2, cw - 4, cw - 14, null, THEME.target);
    });
    const ry = top + 3 * (cw - 10 + gap) + 8;
    if (ui.button('reset', X, ry, 200, 40, 'Factory colours')) {
      v.livery = { ...(v.type.livery || DEFAULT_LIVERY) };
      setLivery(hullOf(v), v.livery);
    }
    ui.text('Pick a ship, a part, then a colour · Backspace (B): close', 24, H - 26, { size: 12, color: THEME.dim, maxW: W - 48 });
  }
}
