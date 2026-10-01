// The suit's screen: screen apps shown on a visor panel, anywhere. While it
// is open it has the controls to itself (the world keeps running):
//   mouse   moves a cursor on the panel (the view stays put), click presses
//   keys    arrows move the highlight, Enter presses, Backspace goes back,
//           Q / E switch (an app's previous / next), U closes
//   pad     D-pad / left stick highlight, A press, B back, LB / RB switch,
//           right stick scrolls, Start pauses
// The same apps will run on in-world consoles and a zoomed-in view: they
// only ever see a ScreenUI and one input record per frame (screens/kit.js).

import { ScreenUI } from './kit.js';

const REPEAT_FIRST = 0.38, REPEAT_NEXT = 0.11;

export class SuitScreen {
  constructor(game, el = document.querySelector('.suitScreen')) {
    this.game = game;
    this.el = el; // (one per player, over their view)
    this.canvas = this.el.querySelector('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.open = false;
    this.app = null;
    this.ui = null;
    this.cursor = null;          // {x, y} logical, or null (no mouse in use)
    this.moved = false;
    this.ev = { press: false, nav: null, activate: false, back: false, tab: 0, scroll: 0 };
    this.held = null; this.hold = 0;
    // with the mouse free (not captured) the real cursor works on the panel
    this.canvas.addEventListener('mousemove', (e) => {
      if (!this.open || this.game.input.locked) return;
      this.cursor = this.toLogical(e.clientX, e.clientY);
      this.moved = true;
    });
    this.canvas.addEventListener('mousedown', (e) => {
      if (!this.open || this.game.input.locked) return;
      this.cursor = this.toLogical(e.clientX, e.clientY);
      if (e.button === 0) this.ev.press = true;
      e.preventDefault();
    });
    this.canvas.addEventListener('wheel', (e) => { if (this.open) { this.ev.scroll += Math.sign(e.deltaY); e.preventDefault(); } }, { passive: false });
  }

  toLogical(cx, cy) {
    const r = this.canvas.getBoundingClientRect();
    return { x: (cx - r.left) / r.width * this.app.w, y: (cy - r.top) / r.height * this.app.h };
  }

  show(app) {
    this.app = app;
    this.ui = new ScreenUI(app.w, app.h);
    // the panel takes the app's own shape
    const k = (app.w / app.h).toFixed(4);
    this.canvas.style.aspectRatio = `${app.w} / ${app.h}`;
    this.canvas.style.width = `min(${app.w}px, calc(100cqw - 32px), calc((100cqh - 32px) * ${k}))`;
    this.open = true;
    this.el.hidden = false;
    this.cursor = null;
    if (app.onOpen) app.onOpen();
  }

  close() {
    if (!this.open) return;
    this.open = false;
    this.el.hidden = true;
    if (this.app && this.app.onClose) this.app.onClose();
  }

  toggle(app) { if (this.open && this.app === app) this.close(); else this.show(app); }

  // the pad while open (via the input's pad router): all of it
  pad(ps, dt) {
    const ev = this.ev;
    let d = null;
    if (ps.held.has('UP') || ps.ly < -0.6) d = 'up';
    else if (ps.held.has('DOWN') || ps.ly > 0.6) d = 'down';
    else if (ps.held.has('LEFT') || ps.lx < -0.6) d = 'left';
    else if (ps.held.has('RIGHT') || ps.lx > 0.6) d = 'right';
    if (d !== this.held) { this.held = d; this.hold = REPEAT_FIRST; if (d) ev.nav = d; }
    else if (d) { this.hold -= dt; if (this.hold <= 0) { this.hold = REPEAT_NEXT; ev.nav = d; } }
    if (ps.hits.has('A')) ev.activate = true;
    if (ps.hits.has('B')) ev.back = true;
    if (ps.hits.has('LB')) ev.tab -= 1;
    if (ps.hits.has('RB')) ev.tab += 1;
    if (Math.abs(ps.ry) > 0.5) { this.scrollAcc = (this.scrollAcc || 0) + ps.ry * dt * 8; }
    if (Math.abs(this.scrollAcc || 0) >= 1) { ev.scroll += Math.trunc(this.scrollAcc); this.scrollAcc -= Math.trunc(this.scrollAcc); }
    if (ps.hits.has('START') && this.game.input.onPadPause) { this.close(); this.game.input.onPadPause(); }
    if (d || ps.hits.size) this.cursor = null; // the pad drives the highlight, not a cursor
    return true;
  }

  // Each frame, before the game reads its controls
  update(dt) {
    if (!this.open) return;
    const g = this.game, inp = g.input, ev = this.ev, app = this.app;
    if (g.paused || g.state !== 'playing') { this.close(); return; }
    // mouse: when captured, its motion moves our cursor (the view stays put)
    const m = inp.mouse();
    if (inp.locked && (m.dx || m.dy)) {
      const k = 1 / 0.003 * 0.9; // undo the look scaling: about one screen pixel per mouse count
      const c = this.cursor || { x: app.w / 2, y: app.h / 2 };
      c.x = Math.max(0, Math.min(app.w, c.x + m.dx / inp.sensitivity * k * (app.w / this.canvas.clientWidth)));
      c.y = Math.max(0, Math.min(app.h, c.y + (inp.invertY ? -m.dy : m.dy) / inp.sensitivity * k * (app.h / this.canvas.clientHeight)));
      this.cursor = c;
      this.moved = true;
    }
    if (inp.locked && inp.clicks) { ev.press = true; if (!this.cursor) this.cursor = { x: app.w / 2, y: app.h / 2 }; }
    if (inp.wheel) ev.scroll += inp.wheel;
    // keys
    if (inp.hit('ArrowUp')) ev.nav = 'up';
    if (inp.hit('ArrowDown')) ev.nav = 'down';
    if (inp.hit('ArrowLeft')) ev.nav = 'left';
    if (inp.hit('ArrowRight')) ev.nav = 'right';
    if (inp.hit('Enter') || inp.hit('NumpadEnter')) ev.activate = true;
    if (inp.hit('Backspace')) ev.back = true;
    if (inp.hit('KeyQ')) ev.tab -= 1;
    if (inp.hit('KeyE')) ev.tab += 1;
    for (const k of ['KeyU', 'KeyI']) if (inp.hit(k)) { inp.hits.delete(k); this.close(); return; } // (not on to the game, which would open it again)
    if (ev.nav) this.cursor = null;
    // draw
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = Math.round(this.canvas.clientWidth * dpr), ch = Math.round(this.canvas.clientHeight * dpr);
    if (this.canvas.width !== cw || this.canvas.height !== ch) { this.canvas.width = cw; this.canvas.height = ch; }
    const g2 = this.ctx;
    g2.setTransform(cw / app.w, 0, 0, ch / app.h, 0, 0);
    const input = { pointer: this.cursor, pointerMoved: this.moved, press: ev.press, nav: ev.nav, activate: ev.activate, back: ev.back, tab: ev.tab, scroll: ev.scroll };
    this.ui.begin(g2, input);
    app.draw(this.ui, dt);
    this.ui.end();
    if (this.cursor) this.ui.cursor(this.cursor);
    if (ev.back && !(app.back && app.back())) this.close();
    ev.press = ev.activate = ev.back = false; ev.nav = null; ev.tab = 0; ev.scroll = 0;
    this.moved = false;
  }
}
