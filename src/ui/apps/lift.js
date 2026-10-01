// Lift panel: the decks a lift serves, what's on each, and a ride to the one
// you pick (a screen app, opened by F at a lift door). The deck an active
// route wants is the one highlighted; 1-5 pick a deck straight away.

import { THEME } from '../screens/kit.js';

export class LiftApp {
  constructor(game) {
    this.game = game;
    this.w = 560; this.h = 400;
    this.title = 'Lift';
  }

  // which ship, which lift, and the stop you're standing at
  setup(vessel, lift, at) {
    this.v = vessel; this.lift = lift; this.at = at;
    this.h = 120 + lift.stops.length * 62;
    // what's on each deck, from the layout's rooms
    const rooms = vessel.type.layout ? vessel.type.layout.rooms : [];
    const SKIP = ['corridor', 'lobby', 'cabin', 'door', 'catwalk', 'podstation'];
    this.decks = lift.stops.map((st) => {
      const names = [];
      for (const r of rooms) {
        if (r.deck !== st.deck || SKIP.includes(r.type)) continue;
        const n = r.name.replace(/ (A|B)$/, 's');
        if (!names.includes(n)) names.push(n);
      }
      const cabins = rooms.some((r) => r.deck === st.deck && r.type === 'cabin');
      if (cabins) names.push('cabins');
      return names.slice(0, 4).join(' · ');
    });
    // the route's next lift ride, if it's this one
    this.want = -1;
    const step = this.game.routeStep && this.game.routeStep();
    const leg = step && step.legs && step.legs.find((l) => l.kind === 'lift');
    if (leg && leg.deck !== undefined) this.want = lift.stops.findIndex((st) => st.deck === leg.deck);
  }

  onOpen() { this.picked = false; }

  ride(i) {
    if (i === this.at || i < 0 || i >= this.lift.stops.length) return;
    const st = this.lift.stops[i];
    this.game.player.rideLift([this.lift.x, st.y, this.lift.z]);
    this.game.suit.close();
  }

  draw(ui) {
    const inp = this.game.input;
    for (let i = 0; i < this.lift.stops.length; i++) if (inp.hit('Digit' + this.lift.stops[i].deck)) { this.ride(i); return; }
    ui.rect(0, 0, this.w, 50, 'rgba(79,214,230,0.06)');
    ui.text(this.lift.label.toUpperCase(), 22, 32, { size: 16, weight: 700, color: THEME.target, spacing: 3 });
    ui.text(this.v.name, this.w - 22, 32, { size: 13, color: THEME.dim, align: 'right' });
    let y = 66;
    this.lift.stops.forEach((st, i) => {
      const here = i === this.at;
      if (ui.button(`deck-${st.deck}`, 22, y, this.w - 44, 54, `Deck ${st.deck}${here ? ' · you are here' : ''}`, { sub: this.decks[i] || '', disabled: here, tone: i === this.want ? 'nav' : undefined })) this.ride(i);
      y += 62;
    });
    const first = this.want >= 0 ? this.want : (this.at > 0 ? this.at - 1 : this.at + 1);
    ui.preferFocus(`deck-${this.lift.stops[Math.max(0, Math.min(first, this.lift.stops.length - 1))].deck}`);
    ui.text('Pick a deck · 1-5 · Backspace (B) to stay', 22, this.h - 18, { size: 12, color: THEME.dim });
  }
}
