// Fleet: your ships, what each is doing, and orders for them (a screen app).
//   fleet   every ship with its state; the selected one's details and orders
//   dest    where to send it: worlds (planets with their moons) and ships
//   world   in orbit, or (small craft) one of the world's landing sites
//   ship    dock with it (small craft to a big ship) or come alongside
// Back steps out a view; Q / E (LB / RB) pick the previous / next ship.

import * as THREE from 'three';
import { THEME } from '../screens/kit.js';
import { GlobeView } from '../screens/globe.js';
import { globeMap } from '../globeMap.js';
import { S_H, S_TEMP, S_MOIST, S_LEN } from '../../gen/terrain.js';
import { biomeName } from '../../gen/settlements.js';
import { fmtEta } from '../../sim/navComputer.js';
import * as U from '../../core/units.js';

const W = 1100, H = 660;
const TONE = { ok: THEME.ok, nav: THEME.nav, caution: THEME.caution, warn: THEME.warn };

export class FleetApp {
  constructor(game) {
    this.game = game;
    this.w = W; this.h = H;
    this.title = 'Fleet';
    this.sel = 0;
    this.view = 'fleet';
    this.pick = null; // the world or ship being chosen in the world / ship views
  }

  // (escape pods only when shown from the quick menu; vehicles and cargo
  // take no flight orders)
  get ships() { return this.game.vessels.filter((v) => this.game.listed(v) && !v.type.ground && !v.type.cargo); }
  get ship() { return this.ships[Math.min(this.sel, this.ships.length - 1)]; }

  onOpen() {
    // start on the ship you're in, else your own
    const g = this.game, i = this.ships.indexOf(g.player.aboard ? g.player.vessel : g.player.ship);
    if (i >= 0) this.sel = i;
    this.view = 'fleet';
  }

  back() {
    if (this.view === 'world' || this.view === 'ship') { this.view = 'dest'; return true; }
    if (this.view === 'dest') { this.view = 'fleet'; return true; }
    return false;
  }

  // ------------------------------------------------------------ drawing

  draw(ui) {
    const g = this.game, inp = ui.in;
    if (inp.tab) { this.sel = (this.sel + inp.tab + this.ships.length) % this.ships.length; if (this.view !== 'fleet') this.view = 'fleet'; }
    // header
    ui.rect(0, 0, W, 50, 'rgba(79,214,230,0.06)');
    ui.rect(0, 49, W, 1, THEME.hair);
    ui.text('SUIT UPLINK', 24, 31, { size: 13, weight: 700, color: THEME.dim, spacing: 3 });
    ui.text('FLEET', 160, 31, { size: 18, weight: 700, color: THEME.target, spacing: 4 });
    ui.text(`${g.system.star.name} system · day ${(g.t / 86400).toFixed(2)}`, W - 24, 31, { size: 13, color: THEME.dim, align: 'right', mono: true });
    this.drawShipList(ui);
    const x0 = 430, y0 = 72, w = W - x0 - 24;
    if (this.view === 'fleet') this.drawShip(ui, x0, y0, w);
    else if (this.view === 'dest') this.drawDest(ui, x0, y0, w);
    else if (this.view === 'world') this.drawWorld(ui, x0, y0, w);
    else if (this.view === 'ship') this.drawShipPick(ui, x0, y0, w);
    // footer
    ui.rect(0, H - 34, W, 34, 'rgba(0,0,0,0.25)');
    ui.text(this.view === 'fleet' ? 'Pick a ship · its orders on the right · Q / E (LB / RB) next ship · U or Backspace (B) closes'
      : 'Backspace (B) goes back · Q / E (LB / RB) next ship', 24, H - 12, { size: 12, color: THEME.dim });
    ui.text(this.youText(), W - 24, H - 12, { size: 12, color: THEME.dim, align: 'right' });
  }

  youText() {
    const p = this.game.player;
    if (p.aboard) return `You: aboard ${p.vessel.name}`;
    if (p.mode === 'eva') return `You: spacewalk near ${p.body.data.name}`;
    return `You: on ${p.body.data.name}`;
  }

  drawShipList(ui) {
    const g = this.game;
    ui.text('YOUR SHIPS', 24, 80, { size: 12, weight: 700, color: THEME.dim, spacing: 2 });
    const hit = ui.list('ships', 24, 92, 386, H - 92 - 50, this.ships.length, 92, (i, x, y, w, h, f) => {
      const v = this.ships[i], st = v.nav.describe();
      ui.text(v.name, x + 16, y + 28, { size: 19, weight: 700, color: f ? THEME.target : THEME.ink });
      ui.text(v.type.className, x + w - 14, y + 27, { size: 12, color: THEME.dim, align: 'right' });
      ui.text(st.state.toUpperCase(), x + 16, y + 54, { size: 12, weight: 700, color: TONE[st.tone] || THEME.ink, spacing: 1.5 });
      ui.text(st.line, x + 16, y + 75, { size: 13, color: THEME.dim, maxW: w - 30 });
      if (g.player.aboard && g.player.vessel.root === v.root && (g.player.vessel === v)) ui.text('YOU', x + w - 14, y + 54, { size: 11, weight: 700, color: THEME.target, align: 'right', spacing: 1.5 });
    }, { selected: this.sel });
    if (hit >= 0) { this.sel = hit; this.view = 'fleet'; }
  }

  // ---- the selected ship and its orders

  drawShip(ui, x, y, w) {
    const g = this.game, v = this.ship, nav = v.nav, st = nav.describe();
    ui.text(v.name, x, y + 30, { size: 30, weight: 700 });
    ui.text(`${v.type.className} · ${v.registry || ''}`, x, y + 54, { size: 13, color: THEME.dim });
    ui.rect(x, y + 70, w, 1, THEME.hair);
    const rows = [
      ['State', st.state, TONE[st.tone]],
      ['', st.line, THEME.dim],
      ['Hull', `${Math.round(v.hull * 100)}%`, v.hull < 0.5 ? THEME.caution : THEME.ink],
    ];
    if (!v.dead && !v.parent && !v.landed) rows.push(['Near', `${v.body.data.name} · ${U.fmtDist(v.altitude)} up`, THEME.ink]);
    if (nav.active) {
      const s = nav.status();
      if (s.wait > 0) rows.push(['Window in', fmtEta(s.wait), THEME.nav]);
      rows.push(['Order', nav.orderText(), THEME.nav], ['Doing', `${s.phase} · ${fmtEta(s.eta)}`, THEME.nav]);
    }
    let yy = y + 100;
    for (const [k, val, col] of rows) {
      if (k) ui.text(k.toUpperCase(), x, yy, { size: 12, weight: 700, color: THEME.dim, spacing: 1.5 });
      ui.text(val, x + 110, yy, { size: 16, color: col || THEME.ink, maxW: w - 110 });
      yy += 30;
    }
    if (v.dead) return;
    // orders
    yy = Math.max(yy + 14, y + 300);
    ui.text('ORDERS', x, yy, { size: 12, weight: 700, color: THEME.dim, spacing: 2 });
    yy += 14;
    const bw = (w - 12) / 2, bh = 58;
    const inSpace = !v.landed && !v.parent;
    const buttons = [
      { id: 'o-dest', label: 'Set destination', sub: v.big ? 'an orbit, or alongside a ship' : 'a world, a landing site, an orbit or a ship', go: () => { this.view = 'dest'; } },
      { id: 'o-come', label: 'Come to me', sub: this.comeText(v), go: () => v.nav.comeToPlayer(), disabled: g.player.aboard && g.player.vessel === v },
      { id: 'o-park', label: 'Park in orbit', sub: `around ${v.body.data.name}`, go: () => v.nav.order({ kind: 'park' }), disabled: v.body.isStar },
      { id: 'o-hold', label: 'Hold position', sub: v.big ? 'coast where it is' : 'keep station right here', go: () => v.nav.order({ kind: 'hold' }), disabled: !inSpace && !v.parent },
    ];
    buttons.push({id:'o-route',label:`Travel: ${nav.travelMode}`,sub:'switch automatic / conventional orbital transfers',go:()=>nav.setTravelMode(nav.travelMode==='conventional'?'auto':'conventional')});
    if (nav.active) buttons.push({ id: 'o-stop', label: 'Cancel the order', sub: 'stop and coast', go: () => nav.cancel('order cancelled'), tone: 'caution' });
    buttons.forEach((b, i) => {
      const bx = x + (i % 2) * (bw + 12), by = yy + Math.floor(i / 2) * (bh + 10);
      if (ui.button(b.id, bx, by, bw, bh, b.label, { sub: b.sub, disabled: b.disabled, tone: b.tone })) b.go();
    });
    ui.preferFocus('o-dest');
  }

  comeText(v) {
    const p = this.game.player;
    if (p.aboard) return v.nav.canLand && p.vessel.root.big ? `dock aboard ${p.vessel.root.name}` : `alongside ${p.vessel.root.name}`;
    if (p.mode === 'eva') return 'alongside you on your spacewalk';
    return v.nav.canLand ? `land beside you on ${p.body.data.name}` : `into orbit of ${p.body.data.name}`;
  }

  // ---- where to: worlds and ships

  destinations() {
    const g = this.game, v = this.ship, out = [];
    const sys = g.universe.bodies;
    for (const pl of sys.filter((b) => b.data.kind === 'planet')) {
      out.push({ kind: 'world', b: pl });
      for (const m of sys.filter((b) => b.data.kind === 'moon' && b.parent === pl)) out.push({ kind: 'world', b: m, moon: true });
    }
    for (const s of g.vessels) if (s !== v && !s.dead && g.listed(s)) out.push({ kind: 'ship', s });
    return out;
  }

  drawDest(ui, x, y, w) {
    const v = this.ship, list = this.destinations();
    ui.text(`Where should ${v.name} go?`, x, y + 26, { size: 22, weight: 700 });
    const here = v.getWorldPos(new THREE.Vector3());
    ui.preferFocus('dest#0');
    const hit = ui.list('dest', x, y + 50, w, H - y - 50 - 50, list.length, 46, (i, rx, ry, rw, rh, f) => {
      const d = list[i];
      if (d.kind === 'world') {
        const b = d.b;
        ui.text(`${d.moon ? '↳ ' : ''}${b.data.name}`, rx + 14 + (d.moon ? 14 : 0), ry + 28, { size: 16, weight: 700, color: f ? THEME.target : THEME.ink });
        ui.text(`${b.data.label}${b.data.rings ? ', ringed' : ''}`, rx + 230, ry + 28, { size: 13, color: THEME.dim, maxW: 220 });
        ui.text(U.fmtDist(b.pos.distanceTo(here)), rx + rw - 14, ry + 28, { size: 13, color: THEME.dim, align: 'right', mono: true });
      } else {
        const s = d.s;
        ui.text(s.name, rx + 14, ry + 28, { size: 16, weight: 700, color: f ? THEME.target : THEME.nav });
        ui.text(s.type.className, rx + 230, ry + 28, { size: 13, color: THEME.dim, maxW: 220 });
        ui.text(U.fmtDist(s.getWorldPos(new THREE.Vector3()).distanceTo(here)), rx + rw - 14, ry + 28, { size: 13, color: THEME.dim, align: 'right', mono: true });
      }
    });
    if (hit >= 0) {
      const d = list[hit];
      this.pick = d.kind === 'world' ? d.b : d.s;
      this.view = d.kind === 'world' ? 'world' : 'ship';
      if (d.kind === 'world' && d.b.solid && v.nav.canLand) this.game.requestSurvey(d.b, 85);
    }
  }

  // ---- a world: orbit, or where on it to land

  worldOptions() {
    const g = this.game, v = this.ship, b = this.pick, out = [{ label: 'In orbit', sub: `arrive in orbit of ${b.data.name}`, dest: { kind: 'orbit', body: b } }];
    if (!v.nav.canLand || !b.solid) return out;
    if (b === g.startBody && g.startDir) out.push({ label: 'The landing site', sub: 'where you started out', dest: { kind: 'site', body: b, dirF: g.startDir.clone(), label: 'the landing site' } });
    const res = g.settlements.get(b.id);
    if (!res) { out.push({ label: 'Surveying…', sub: 'finding places to land', disabled: true }); return out; }
    for (const sp of res.spots || []) out.push({ label: sp.label, sub: `${sp.biome} · ${sp.temperatureC} °C · ${sp.elevation.toLocaleString()} m`, dest: { kind: 'site', body: b, dirF: new THREE.Vector3(...sp.dir), label: sp.label.toLowerCase() } });
    return out;
  }

  drawWorld(ui, x, y, w) {
    const g = this.game, v = this.ship, b = this.pick, opts = this.worldOptions();
    ui.text(`${v.name} to ${b.data.name}`, x, y + 26, { size: 22, weight: 700 });
    ui.text(b.data.label, x, y + 48, { size: 13, color: THEME.dim });
    // a world it can land on: the world itself, to turn and pick a spot on (no clouds, its sun as it is)
    let lx = x, lw = w;
    if (v.nav.canLand && b.solid) {
      const S = Math.min(H - y - 64 - 50, Math.round(w * 0.52));
      const sunF = g.universe.star.pos.clone().sub(b.pos).normalize().applyQuaternion(b.qInv);
      if (this.globeFor !== b) {
        this.globeFor = b; this.globe = new GlobeView(); this.chosen = null; this.focusedOpt = null;
        this.globe.lookAt(v.body === b ? v.pos.clone().applyQuaternion(b.qInv).normalize() : sunF);   // (where you are over it, else its day side)
      }
      const marks = [];
      for (const o of opts) if (o.dest?.dirF) marks.push({ d: o.dest.dirF.toArray(), color: o.dest.label === 'the landing site' ? THEME.ok : THEME.target, ring: o.dest.label === 'the landing site' });
      if (v.body === b) marks.push({ d: v.pos.clone().applyQuaternion(b.qInv).toArray(), color: THEME.nav, ring: true });
      const d = this.globe.draw(ui, x, y + 64, S, { map: globeMap(g, b), R: b.R, sun: [sunF.x, sunF.y, sunF.z], marks, picked: this.chosen ? this.chosen.d : null });
      if (d) this.chosen = this.describe(b, d, sunF);
      lx = x + S + 24; lw = w - S - 24;
    }
    const panelH = this.chosen ? 176 : 0, listH = H - y - 64 - 50 - (panelH ? panelH + 12 : 0);
    ui.preferFocus('world#0');
    const hit = ui.list('world', lx, y + 64, lw, listH, opts.length, 56, (i, rx, ry, rw, rh, f) => {
      const o = opts[i];
      ui.text(o.label, rx + 14, ry + 24, { size: 16, weight: 700, color: o.disabled ? THEME.faint : (f ? THEME.target : THEME.ink) });
      ui.text(o.sub, rx + 14, ry + 44, { size: 12, color: THEME.dim, maxW: rw - 28 });
      // (a site highlighted: the globe turns to it)
      if (f && o.dest?.dirF && this.globe && this.focusedOpt !== o.label) { this.focusedOpt = o.label; this.globe.lookAt(o.dest.dirF); }
    }, { disabled: (i) => !!opts[i].disabled });
    if (hit >= 0 && opts[hit].dest && v.nav.order(opts[hit].dest)) this.view = 'fleet';
    // the spot picked on the globe: what's there, and the order to land on it
    const c = this.chosen;
    if (c) {
      const py = y + 64 + listH + 12;
      ui.rect(lx, py, lw, panelH, THEME.panel, THEME.hair);
      ui.text('Chosen spot', lx + 14, py + 24, { size: 16, weight: 700, color: THEME.caution });
      ui.text(`${Math.abs(c.lat).toFixed(2)}° ${c.lat >= 0 ? 'N' : 'S'}  ${Math.abs(c.lon).toFixed(2)}° ${c.lon >= 0 ? 'E' : 'W'}`, lx + lw - 14, py + 24, { size: 12, color: THEME.dim, align: 'right', mono: true });
      ui.text(c.water ? `water · ${c.biome || ''}` : `${c.biome || 'ground'} · ${Math.round(c.gh).toLocaleString()} m · ${c.slope.toFixed(0)}° slope`, lx + 14, py + 50, { size: 13, color: THEME.ink, maxW: lw - 28 });
      ui.text(`${c.Tc != null ? `${Math.round(c.Tc)} °C · ` : ''}${c.day > 0.05 ? 'daylight' : c.day > -0.05 ? 'twilight' : 'night'}`, lx + 14, py + 72, { size: 13, color: THEME.dim, maxW: lw - 28 });
      if (ui.button('land-here', lx + 14, py + panelH - 62, lw - 28, 46, c.water ? 'Water: no ground to land on' : 'Land here', { primary: !c.water, tone: 'nav', disabled: c.water })) {
        if (v.nav.order({ kind: 'site', body: b, dirF: c.dirF.clone(), label: 'the chosen spot' })) this.view = 'fleet';
      }
    }
  }

  // what's at body-fixed direction d on world b: height, water, what grows (or doesn't), its slope,
  // and whether the sun is up there
  describe(b, d, sunF) {
    const dirF = new THREE.Vector3(d[0], d[1], d[2]).normalize();
    const gh = b.groundHeight(dirF), water = !!(b.isWaterAt && b.isWaterAt(dirF));
    let Tc = null, biome = null;
    const gen = b.terrain;
    if (gen && gen.sample) {
      const s = new Float64Array(S_LEN);
      gen.sample(dirF.x, dirF.y, dirF.z, b.R / 2000, s);
      Tc = s[S_TEMP] - 273.15; biome = biomeName(Tc, s[S_MOIST], s[S_H], water);
    }
    // (the steepest rise over a craft's footprint, ~20 m)
    const e1 = new THREE.Vector3(0, 1, 0).cross(dirF); if (e1.lengthSq() < 1e-6) e1.set(1, 0, 0); e1.normalize();
    const e2 = dirF.clone().cross(e1).normalize(), f = 20 / b.R;
    let slope = 0;
    for (const [a, c] of [[1, 0], [0, 1], [-1, 0], [0, -1]]) slope = Math.max(slope, Math.abs(b.groundHeight(dirF.clone().addScaledVector(e1, a * f).addScaledVector(e2, c * f).normalize()) - gh) / 20);
    return { d, dirF, gh, water, Tc, biome, slope: Math.atan(slope) * 180 / Math.PI, lat: Math.asin(dirF.y) * 180 / Math.PI, lon: (b.omega && b.omega.y < 0 ? 1 : -1) * Math.atan2(dirF.z, dirF.x) * 180 / Math.PI, day: dirF.dot(sunF) };   // (east the way it turns)
  }

  // ---- a ship: dock with it, or come alongside

  drawShipPick(ui, x, y, w) {
    const v = this.ship, s = this.pick;
    ui.text(`${v.name} to ${s.name}`, x, y + 26, { size: 22, weight: 700 });
    ui.text(s.type.className, x, y + 48, { size: 13, color: THEME.dim });
    const canDock = v.nav.canLand && s.big && s.type.zones;
    const opts = [];
    if (canDock) opts.push({ label: `Dock aboard ${s.name}`, sub: s.type.zones.map((z) => z.name).join(' · '), dest: { kind: 'dock', v: s } });
    opts.push({ label: 'Come alongside', sub: 'close in and keep station beside it', dest: { kind: 'meet', v: s } });
    let yy = y + 70;
    ui.preferFocus('ship-0');
    for (const [i, o] of opts.entries()) {
      if (ui.button(`ship-${i}`, x, yy, w, 62, o.label, { sub: o.sub })) { if (v.nav.order(o.dest)) this.view = 'fleet'; }
      yy += 72;
    }
  }
}
