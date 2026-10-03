// Turbolift panel: the stops the car serves, what's at each, and where it's
// going now (a screen app, opened by F in a car). The stop an active route
// wants is the one highlighted; 1-4 pick a stop straight away.

import { THEME } from '../screens/kit.js';

export class TurboliftApp {
  constructor(game) {
    this.game = game;
    this.w = 560; this.h = 400;
    this.title = 'Turbolift';
  }

  // which ship, which car
  setup(vessel, car) {
    this.v = vessel; this.tl = vessel.turbolift; this.car = car;
    this.h = 140 + this.tl.stations.length * 62;
    // the route's next turbolift ride, if any
    this.want = -1;
    const step = this.game.routeStep && this.game.routeStep();
    const leg = step && step.legs && step.legs.find((l) => l.kind === 'lift' && l.station);
    if (leg) this.want = this.tl.stations.findIndex((st) => st.id === leg.station);
  }

  onOpen() {}

  pick(i) {
    const st = this.tl.stations[i];
    if (!st) return;
    this.tl.send(this.car, st.id);
    this.game.suit.close();
  }

  draw(ui) {
    const inp = this.game.input, tl = this.tl, car = this.car;
    for (let i = 0; i < tl.stations.length; i++) if (inp.hit('Digit' + (i + 1))) { this.pick(i); return; }
    const here = tl.stationOf(car);
    ui.rect(0, 0, this.w, 50, 'rgba(79,214,230,0.06)');
    ui.text(tl.spec.label.toUpperCase(), 22, 32, { size: 16, weight: 700, color: THEME.target, spacing: 3 });
    ui.text(this.v.name, this.w - 22, 32, { size: 13, color: THEME.dim, align: 'right' });
    const dest = car.dest && tl.stations.find((s) => s.id === car.dest);
    const eta = dest && tl.eta(car);
    const status = dest ? `On the way to the ${dest.label.toLowerCase()}${eta ? ` · ${Math.ceil(eta)} s` : ''}`
      : here ? `At the ${here.label.toLowerCase()} · deck ${here.deck}` : 'Between stops';
    ui.text(status, 22, 76, { size: 13, color: THEME.dim });
    let y = 92;
    tl.stations.forEach((st, i) => {
      const at = here === st && !dest;
      if (ui.button(`tl-${st.id}`, 22, y, this.w - 44, 54, `${i + 1} · ${st.label}${at ? ' · you are here' : ''}`, { sub: `Deck ${st.deck} · ${st.about || ''}`, disabled: at, tone: i === this.want ? 'nav' : undefined })) this.pick(i);
      y += 62;
    });
    const first = this.want >= 0 ? this.want : Math.max(0, tl.stations.findIndex((st) => st !== here));
    ui.preferFocus(`tl-${tl.stations[first].id}`);
    ui.text('Pick a stop · 1-4 · Backspace (B) to stay', 22, this.h - 18, { size: 12, color: THEME.dim });
  }
}
