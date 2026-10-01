// Inventory: what you carry (a screen app, on I). Pick a row to put that
// item down in front of you: on the floor of the ship you're in, on the
// ground, or adrift beside you on a spacewalk. The items are world state
// (game.items); this screen only reads them and asks to move one.

import { THEME } from '../screens/kit.js';
import { ITEM_TYPES } from '../../sim/items.js';

const W = 760, H = 520;

export class InventoryApp {
  constructor(game) {
    this.game = game;
    this.w = W; this.h = H;
    this.title = 'Inventory';
  }

  draw(ui) {
    const g = this.game, p = g.player;
    const held = g.items.heldBy(p);
    const mass = held.reduce((m, it) => m + ITEM_TYPES[it.kind].mass, 0);
    ui.rect(0, 0, W, 50, 'rgba(79,214,230,0.06)');
    ui.rect(0, 49, W, 1, THEME.hair);
    ui.text('SUIT', 24, 31, { size: 13, weight: 700, color: THEME.dim, spacing: 3 });
    ui.text('INVENTORY', 82, 31, { size: 18, weight: 700, color: THEME.target, spacing: 4 });
    ui.text(`${held.length} item${held.length === 1 ? '' : 's'} · ${mass.toFixed(1)} kg`, W - 24, 31, { size: 13, color: THEME.dim, align: 'right', mono: true });
    const seated = p.mode === 'seat';
    if (!held.length) {
      ui.text('Nothing carried. Look at something within reach and press F to pick it up.', 24, 96, { size: 15, color: THEME.dim, maxW: W - 48 });
    } else {
      const hit = ui.list('inv', 24, 70, W - 48, H - 140, held.length, 58, (i, x, y, w, h, f) => {
        const T = ITEM_TYPES[held[i].kind];
        ui.text(T.name, x + 16, y + 24, { size: 16, weight: 700, color: f ? THEME.target : THEME.ink });
        ui.text(T.desc, x + 16, y + 44, { size: 12, color: THEME.dim, maxW: w - 140 });
        ui.text(`${T.mass} kg`, x + w - 16, y + 24, { size: 13, color: THEME.dim, align: 'right', mono: true });
      }, { disabled: () => seated });
      if (!ui.focus || !ui.focus.startsWith('inv#')) ui.preferFocus('inv#0');
      if (hit >= 0) g.putDownItem(held[hit]);
    }
    const where = seated ? 'Get out of the seat to put things down'
      : `Enter (A): put it down in front of you${p.mode === 'ship' ? ` · in ${p.vessel.name}` : p.mode === 'surface' ? ` · on ${p.body.data.name}` : ' · adrift'} · I or Backspace (B): close`;
    ui.text(where, 24, H - 26, { size: 12, color: THEME.dim, maxW: W - 48 });
  }
}
