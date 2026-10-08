// The quick menu, for the rarer actions (after No Man's Sky's): a short list
// in the lower-left corner, categories first, then each one's actions. It
// opens with the D-pad's left (` on the keyboard) and leaves the sticks to
// you, so you keep flying or walking while you choose.
//   Pad: up / down move, A or right enters a category or does the action,
//        B or left goes back (and closes from the top).
//   Keyboard: arrows or the wheel move, 1-9 pick a row, Enter / right
//        choose, Backspace / left go back, ` closes.
// An action presses a key for you (the same key its own key or button
// presses, so it does exactly what that does) or runs a function. Most close
// the menu; repeatable ones (time warp, assist, camera) keep it open.

import * as THREE from 'three';
import { ASSIST_NAMES } from '../sim/ship.js';
import { WARP_LEVELS } from '../sim/warpConsent.js';
import { padGlyph } from '../padLayout.js';

const ROWS = 8;                                 // rows shown at once
const REPEAT_FIRST = 0.38, REPEAT_NEXT = 0.11;  // s: held up / down on the pad
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

export class QuickMenu {
  constructor(game, el = document.querySelector('.quickMenu')) {
    this.game = game;
    this.el = el; // (one per player, in their HUD)
    this.open = false;
    this.path = [];   // ids of the categories entered
    this.sel = 0;     // highlighted row
    this.top = 0;     // first row shown
    this.redraw = 0;
    this.held = null; this.hold = 0;
  }

  // ------------------------------------------------------------ contents

  // what the menu holds right now: only what makes sense where you are
  tree() {
    const g = this.game, p = g.player, v = g.piloted;
    const rows = [];
    if (v) {
      const items = [];
      if (v.type.legs && !v.type.ground) items.push({ label: 'Landing gear', value: v.gearTarget > 0.5 ? 'down' : 'up', key: 'KeyG' });
      if (v.type.ramp) items.push({ label: 'Ramp', value: v.rampTarget > 0.5 ? 'open' : 'closed', key: 'KeyR' });
      const rd = (v.type.doors || []).find((d) => d.ramp);
      if (rd) items.push({ label: 'Ramp', value: v.doors[rd.id].target > 0.5 ? 'open' : 'closed', key: 'KeyR' });
      if (v.type.clamp) items.push({ label: v.type.clamp.name, value: v.cargo ? v.cargo.name : 'empty', key: 'KeyY' });
      // the doors of what it carries (a container under a lifter), and
      // craft in the same stack you can climb into (the cart in that container)
      for (const c of g.craftStack(v)) {
        for (const d of c.type.doors || []) {
          if (d.ramp && c === v) continue;
          const st = c.doors[d.id];
          items.push({ label: `${c.name}: ${d.label}`, value: st.target > 0.5 ? 'open' : 'closed', stay: true, run: () => { st.target = st.target > 0.5 ? 0 : 1; g.audio.clunk(); } });
        }
        if (c !== v && c.type.seatOnly && c.type.seats.length && !c.home) {
          items.push({ label: `Climb into ${c.name}`, value: c.type.className.toLowerCase(), run: () => { if (p.sitDown(0, c)) { p.fade = 1; g.message(`${c.name} · ${c.type.className}${c.type.help ? ' · ' + c.type.help : ''}`, 'nav'); } } });
        }
      }
      if (v.visual.landing) items.push({ label: 'Landing lights', value: (v.visual.landing.on ? 'on' : 'off') + (v.lightsForce == null ? ' · auto' : ''), key: 'KeyL' });
      items.push({ label: 'Flight assist', value: ASSIST_NAMES[v.assist], key: 'KeyZ', stay: true });
      items.push({ label: 'Camera', value: { first: 'cockpit', chase: 'chase', landing: 'landing' }[g.camMode] || 'cockpit', key: 'KeyV', stay: true });
      items.push({ label: 'FTL drive', value: this.ftlText(v), key: 'KeyJ' });
      items.push({ label: 'Leave the seat', key: 'KeyF' });
      rows.push({ id: 'ship', label: v.name, items });
    } else {
      const items = [];
      const ls = p.lastSeat;
      if (ls && !ls.vessel.dead) items.push({ label: 'Back to the pilot seat', value: ls.vessel.name, key: 'KeyP' });
      if (p.mode === 'surface' && p.ship && !p.ship.dead) items.push({ label: 'Summon your ship', value: p.ship.name, run: () => g.summonShip() });
      if (items.length) rows.push({ id: 'yours', label: 'Your ship', items });
    }
    // aboard a big ship: places to walk to
    if (p.mode === 'ship' && p.vessel.big) {
      const items = p.vessel.interior.destinations().map((d) => ({
        label: d.label, value: g.route && g.route.v === p.vessel && g.route.label === d.label ? 'on route' : '',
        run: () => { g.route = { v: p.vessel, label: d.label }; g.message(`Route: ${d.label} · follow the marker`, 'nav'); },
      }));
      if (g.route) items.push({ label: 'Clear the route', run: () => { g.route = null; g.message('Route cleared'); } });
      if (items.length) rows.push({ id: 'routes', label: 'Find your way', value: g.route ? g.route.label : '', items });
    }
    rows.push({
      id: 'targets', label: 'Targets', value: g.target ? g.target.data.name : '',
      items: g.targetList().filter((t) => t !== p.currentBody()).map((t) => ({
        label: t.data.name, value: (t === g.target ? '◆ ' : '') + this.distText(t.pos.distanceTo(g.camPos)),
        run: () => { g.target = t; g.message(`Target: ${t.data.name}`, 'target'); if (!t.isVessel) g.requestSurvey(t, 80); },
      })),
    });
    rows.push(this.navMenu());
    rows.push({
      id: 'nav', label: 'Navigation', items: [
        { label: 'Target under the reticle', key: 'KeyT' },
        { label: 'System map', key: 'KeyM' },
        { label: 'Settlement survey markers', value: g.showSites ? 'on' : 'off', key: 'KeyK' },
        { label: 'Escape pods in lists', value: g.showUnlisted ? 'shown' : 'hidden', run: () => { g.showUnlisted = !g.showUnlisted; }, stay: true },
      ],
    });
    rows.push({
      id: 'time', label: 'Time', value: `×${g.warp.toLocaleString()}`, items: [
        { label: 'Request faster time', value: `requested ×${WARP_LEVELS[p.warpRequestIndex || 0].toLocaleString()}`, key: 'Period', stay: true },
        { label: 'Request slower time', key: 'Comma', stay: true },
        { label: 'Cancel time warp', run: () => g.setWarp(0) },
      ],
    });
    rows.push({ id: 'suit', label: 'Suit computer', items: [
      { label: 'Inventory', value: `${g.items.heldBy(p).length} carried`, run: () => this.game.suit.show(this.game.inventoryApp) },
      { label: 'Fleet', value: 'your ships and their orders', run: () => this.game.suit.show(this.game.fleetApp) },
      { label: 'Paint', value: 'your ships\' liveries', run: () => this.game.suit.show(this.game.paintApp) },
    ] });
    rows.push({ label: 'Controls', key: 'KeyH' });
    return rows;
  }

  // the nav computer: go / stop, and where on the target world to land
  navMenu() {
    const g = this.game, nav = g.nav, t = g.target;
    const items = [{ label: nav.active ? 'Stop the nav computer' : 'Fly there', value: nav.active ? nav.destText() : (t ? t.data.name : 'no target'), key: 'KeyN' }];
    items.push({ id: 'route', label: 'Travel mode', value: nav.travelMode, items: [
      { label: 'Automatic', value: 'FTL when useful', run: () => nav.setTravelMode('auto') },
      { label: 'Conventional', value: 'orbital transfers and launch windows', run: () => nav.setTravelMode('conventional') },
      ...(nav.ship.type.ftl === false ? [] : [{ label: 'Prefer FTL', value: 'warp drive for long legs', run: () => nav.setTravelMode('ftl') }]),
    ] });
    if (t && !t.isVessel && t.solid) {
      const chosen = nav.sites.get(t.id);
      const res = g.settlements.get(t.id);
      if (!res) g.requestSurvey(t, 85);
      const choose = (site, label) => ({ label, value: '', run: () => { nav.chooseSite(t, site); g.message(`Nav computer: ${t.data.name}, ${site === 'orbit' ? 'stay in orbit' : (site ? site.label : 'the best site')}`, 'nav'); } });
      const sites = [choose(null, t === g.startBody ? 'The landing site' : 'The best site'), choose('orbit', 'Stay in orbit')];
      if (res) for (const sp of res.spots || []) sites.push({ ...choose({ dirF: new THREE.Vector3(...sp.dir), label: sp.label.toLowerCase() }, sp.label), value: `${sp.biome} · ${sp.temperatureC} °C` });
      else sites.push({ label: 'Surveying…', value: '' });
      items.push({ id: 'landat', label: 'Land at', value: chosen === 'orbit' ? 'orbit' : (chosen ? chosen.label : 'best site'), items: sites });
      if(nav.canLand&&!nav.active&&chosen!=='orbit')items.push({label:'Guide to landing site',value:'manual controls · flying boxes',run:()=>{
        nav.landingGuide.select(nav.destinationFor(t));g.message('Landing guide selected · controls remain with you. Follow the boxes, match speed, then hover and settle.','nav');
      }});
    }
    if(nav.canLand){
      items.push({label:'Landing guide',value:nav.landingGuide.enabled?'on':'off',stay:true,run:()=>{nav.landingGuide.enabled=!nav.landingGuide.enabled;}});
      if(nav.landingGuide.dest)items.push({label:'Rejoin from this direction',value:'reset approach corridor',run:()=>nav.landingGuide.rejoin()});
    }
    return { id: 'navc', label: 'Nav computer', value: nav.active ? nav.status().phase.toLowerCase() : (t ? t.data.name : ''), items };
  }

  ftlText(v) {
    const f = v.ftl;
    if (v.parent) return 'docked';
    if (f.state === 'idle') return f.massLock() ? 'mass locked' : 'ready';
    return f.state;
  }

  distText(m) {
    if (m < 1e4) return `${Math.round(m)} m`;
    if (m < 1e9) return `${Math.round(m / 1000).toLocaleString()} km`;
    return `${(m / 1.496e11).toFixed(2)} AU`;
  }

  // the rows of the current level (a category that vanished drops you back)
  rows() {
    let rows = this.tree();
    const path = [];
    for (const id of this.path) {
      const c = rows.find((r) => r.id === id && r.items);
      if (!c) break;
      path.push(id);
      rows = c.items;
      this.title = c.label;
    }
    if (path.length !== this.path.length) { this.path = path; this.sel = 0; }
    if (!this.path.length) this.title = 'Quick menu';
    return rows;
  }

  // ------------------------------------------------------------ control

  toggle() { if (this.open) this.close(); else this.show(); }

  show() {
    this.open = true;
    this.path = []; this.sel = 0; this.top = 0;
    this.render();
  }

  close() {
    this.open = false;
    this.el.hidden = true;
  }

  move(d) {
    const n = this.rows().length;
    if (!n) return;
    this.sel = (this.sel + d + n) % n;
    this.render();
  }

  back() {
    if (!this.path.length) { this.close(); return; }
    const id = this.path.pop();
    const rows = this.rows();
    this.sel = Math.max(0, rows.findIndex((r) => r.id === id));
    this.render();
  }

  choose(i = this.sel) {
    const rows = this.rows();
    const r = rows[i];
    if (!r) return;
    this.sel = i;
    if (r.items) {
      if (!r.items.length) return;
      this.path.push(r.id);
      this.sel = 0; this.top = 0;
      this.render();
      return;
    }
    const g = this.game;
    if (r.key) g.input.hits.add(r.key); // read later this frame, as if pressed
    if (r.run) r.run();
    if (r.stay) this.redraw = 0.05; // show the new value once it has happened
    else this.close();
  }

  // Each frame, after the pad is read and before the game reads its keys
  update(dt) {
    const g = this.game, input = g.input;
    if (g.paused || g.map.open || g.state !== 'playing' || !g.launched) { if (this.open) this.close(); return; }
    if (input.hit('Backquote')) { this.toggle(); return; }
    if (!this.open) return;
    if (input.hit('ArrowUp') || input.wheel < 0) this.move(-1);
    if (input.hit('ArrowDown') || input.wheel > 0) this.move(1);
    if (input.hit('ArrowRight') || input.hit('Enter') || input.hit('NumpadEnter')) this.choose();
    else if (input.hit('ArrowLeft') || input.hit('Backspace')) this.back();
    for (let i = 1; i <= 9; i++) if (input.hit('Digit' + i) || input.hit('Numpad' + i)) { this.choose(i - 1); break; }
    if (!this.open) return;
    this.redraw -= dt;
    if (this.redraw <= 0) this.render();
  }

  // The pad while the menu is open: the D-pad and A / B are the menu's (the
  // sticks, triggers and shoulder buttons still fly and walk). Returns the
  // buttons it took.
  pad(ps, dt) {
    let d = ps.held.has('UP') ? -1 : (ps.held.has('DOWN') ? 1 : 0);
    if (d !== this.held) { this.held = d; this.hold = REPEAT_FIRST; if (d) this.move(d); }
    else if (d) { this.hold -= dt; if (this.hold <= 0) { this.hold = REPEAT_NEXT; this.move(d); } }
    if (ps.hits.has('A') || ps.hits.has('RIGHT')) this.choose();
    else if (ps.hits.has('B') || ps.hits.has('LEFT')) this.back();
    return TAKEN;
  }

  // ------------------------------------------------------------ drawing

  render() {
    this.redraw = 0.1;
    const rows = this.rows();
    if (this.sel >= rows.length) this.sel = Math.max(0, rows.length - 1);
    if (this.sel < this.top) this.top = this.sel;
    if (this.sel >= this.top + ROWS) this.top = this.sel - ROWS + 1;
    this.top = Math.max(0, Math.min(this.top, rows.length - ROWS));
    const pad = this.game.input.usingPad;
    const shown = rows.slice(this.top, this.top + ROWS);
    const li = shown.map((r, k) => {
      const i = this.top + k;
      const num = !pad && i < 9 ? `<span class="qn">${i + 1}</span>` : '<span class="qn"></span>';
      const val = r.items ? `${r.value ? esc(r.value) + ' ' : ''}<b>▸</b>` : esc(r.value || '');
      return `<li class="${i === this.sel ? 'sel' : ''}${r.items ? ' cat' : ''}">${num}<span class="ql">${esc(r.label)}</span><span class="qv">${val}</span></li>`;
    }).join('');
    const more = (up) => `<div class="qmore">${up ? (this.top > 0 ? '▴' : '') : (this.top + ROWS < rows.length ? '▾' : '')}</div>`;
    const hint = pad
      ? `${padGlyph('A')} choose ${padGlyph('B')} ${this.path.length ? 'back' : 'close'}`
      : `<kbd>1</kbd>–<kbd>9</kbd> / <kbd>Enter</kbd> choose · <kbd>⌫</kbd> back · <kbd>\`</kbd> close`;
    const title = this.path.length ? `Quick menu ▸ ${esc(this.title)}` : 'Quick menu';
    this.el.innerHTML = `<h3>${title}</h3>${more(true)}<ol>${li || '<li class="empty">Nothing here right now</li>'}</ol>${more(false)}<div class="qhint">${hint}</div>`;
    this.el.hidden = false;
  }
}

const TAKEN = new Set(['UP', 'DOWN', 'LEFT', 'RIGHT', 'A', 'B']);
