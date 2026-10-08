// Heads-up display: instrument clusters (DOM) and symbology (canvas).
// Colour semantics follow avionics practice: magenta = active nav,
// cyan = target / selected, green = engaged / OK, amber = caution, red = warning.

import * as THREE from 'three';
import * as U from '../core/units.js';
import { WARP_LEVELS } from '../sim/warpConsent.js';
import { fmtEta } from '../sim/navComputer.js';
import { ASSIST_NAMES } from '../sim/ship.js';
import { lockRadius } from '../sim/ftl.js';
import { PAD_LAYOUT, padDiagram, padButtonFor, padButtonText, padGlyph } from '../padLayout.js';
import { markerVelocity, drawVelocityMarkers } from './velMarkers.js';
import { drawLandingGuide } from './landingHUD.js';

const $ = (id) => document.getElementById(id);
const _v = new THREE.Vector3(), _v2 = new THREE.Vector3(), _v3 = new THREE.Vector3();
const _q = new THREE.Quaternion();

const COL = { ink: '#e6eff3', dim: '#9fb2bc', nav: '#e65bd9', tgt: '#4fd6e6', ok: '#6ade8f', cau: '#f1b43a', warn: '#ff5248' };

function fmtAlt(m) {
  const a = Math.abs(m);
  if (a < 10000) return m.toFixed(0) + ' m';
  if (a < 1e6) return (m / 1000).toFixed(1) + ' km';
  return (m / 1000).toFixed(0) + ' km';
}
function fmtP(p) {
  if (p <= 0) return '0';
  if (p < 0.001) return (p * 1e5).toFixed(1) + ' Pa';
  if (p < 1) return (p * 1000).toFixed(0) + ' mbar';
  return p.toFixed(p < 10 ? 2 : 0) + ' bar';
}

// One per player, over their view (root: its .hudView element). The loading
// cover, help, pause and the title card are the whole screen's.
export class Hud {
  constructor(game, player = null, root = document.querySelector('.hudView')) {
    this.game = game;
    this.player = player;
    this.root = root;
    const q = (c) => root.querySelector(c);
    this.canvas = q('.hudCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.flight = q('.flightData');
    this.nav = q('.navData');
    this.strip = q('.modeStrip');
    this.msgBox = q('.messages');
    this.promptEl = q('.prompt');
    this.tagEl = q('.playerTag');
    this.loadingEl = $('loading');
    this.overlay = $('overlay');
    this.msgs = [];
    this.textTimer = 0;
    this.helpOn = false;
    this.resize();
  }

  // over the player's view: the whole screen, or their half of it
  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.dpr = dpr;
    const rc = this.player && this.player.view ? this.player.view.rect : null;
    this.w = rc ? rc.w : window.innerWidth; this.h = rc ? rc.h : window.innerHeight;
    const st = this.root.style;
    if (rc) { st.left = rc.x + 'px'; st.top = rc.y + 'px'; st.width = rc.w + 'px'; st.height = rc.h + 'px'; st.right = st.bottom = 'auto'; }
    this.canvas.width = this.w * dpr; this.canvas.height = this.h * dpr;
    const n = this.game.players ? this.game.players.length : 1;
    if (this.tagEl) { this.tagEl.hidden = n < 2; if (this.player) this.tagEl.textContent = `P${this.player.index + 1}`; }
  }

  message(text, kind = '') {
    const d = document.createElement('div');
    d.textContent = text;
    if (kind === 'warn') d.className = 'warn';
    else if (kind === 'caution') d.className = 'caution';
    this.msgBox.appendChild(d);
    this.msgs.push({ el: d, t: 0 });
    while (this.msgs.length > 5) { const m = this.msgs.shift(); m.el.remove(); }
  }

  // the opening title card: game name, system, where you are, what to do
  showTitle(lines, ms = 9000) {
    let el = this.titleEl;
    if (!el) {
      el = this.titleEl = document.createElement('div');
      el.id = 'titleCard';
      el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }
    const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    el.innerHTML = `<div class="t1">STARSEED<span>INFINITE</span></div><div class="t2">${esc(lines[0])}</div><div class="t3">${esc(lines[1])}</div><div class="t4">${esc(lines[2])}</div>`;
    el.classList.remove('out');
    el.hidden = false;
    clearTimeout(this._titleT);
    this._titleT = setTimeout(() => el.classList.add('out'), ms);
  }

  // the loading cover: text plus progress 0..1; null fades it out
  // the button for a key on whatever the player last used: the controller's
  // (in the current mode's layout) or the keyboard's
  padButton(code) {
    const inp = this.player ? this.player.input : this.game.input;
    return inp.usingPad ? padButtonFor(code, inp.padMode) : null;
  }
  keyGlyph(code, keyLabel) {
    const b = this.padButton(code);
    return b ? padGlyph(b) : `<kbd>${keyLabel}</kbd>`;
  }
  keyName(code, keyLabel) {
    const b = this.padButton(code);
    return b ? padButtonText(b).toUpperCase() : keyLabel;
  }

  setLoading(text, frac = 0) {
    const el = this.loadingEl;
    if (!text) {
      if (el.hidden || el.classList.contains('out')) return;
      el.querySelector('.bar i').style.transform = 'scaleX(1)';
      el.querySelector('.pct').textContent = '100%';
      this._loadPct = 100;
      el.classList.add('out');
      clearTimeout(this._loadT);
      this._loadT = setTimeout(() => { el.hidden = true; }, 800);
      return;
    }
    clearTimeout(this._loadT);
    el.hidden = false;
    el.classList.remove('out');
    if (text !== this._loadText) { this._loadText = text; el.querySelector('#loadText').textContent = text + '…'; }
    const pct = Math.round(frac * 100);
    if (pct !== this._loadPct) {
      this._loadPct = pct;
      el.querySelector('.bar i').style.transform = `scaleX(${frac.toFixed(3)})`;
      el.querySelector('.pct').textContent = pct + '%';
      el.querySelector('.loadbox').setAttribute('aria-valuenow', String(pct));
    }
  }

  toggleHelp(tab) {
    this.helpOn = !this.helpOn;
    if (!this.helpOn) {
      this.overlay.hidden = true; this.overlay.innerHTML = '';
      if (this.game.paused && this.onHelpClosed) this.onHelpClosed(); // back to the pause menu
      return;
    }
    this.helpTab = tab || (this.game.input.usingPad ? 'pad' : 'keys');
    const pm = this.game.player.mode;
    this.padTab = pm === 'seat' ? 'flight' : (pm === 'eva' ? 'eva' : 'foot');
    this.refreshHelp();
  }

  // Controls: keyboard and mouse, or the controller diagram for one mode
  refreshHelp() {
    const tab = this.helpTab;
    const btn = (attr, val, on, text) => `<button type="button" ${attr}="${val}" class="${on ? 'on' : ''}">${text}</button>`;
    const body = this.helpBody(tab, this.padTab, true);
    this.overlay.hidden = false;
    this.overlay.innerHTML = `<div class="card help"><div class="tabs">${btn('data-tab', 'keys', tab === 'keys', 'Keyboard &amp; mouse')}${btn('data-tab', 'pad', tab === 'pad', 'Controller')}</div>
      ${body}<button id="closeHelp" type="button" data-pad-back data-pad-default>Close</button></div>`;
    for (const el of this.overlay.querySelectorAll('[data-tab]')) el.onclick = () => { this.helpTab = el.dataset.tab; this.refreshHelp(); };
    for (const el of this.overlay.querySelectorAll('[data-pm]')) el.onclick = () => { this.padTab = el.dataset.pm; this.refreshHelp(); };
    $('closeHelp').onclick = () => this.toggleHelp();
  }

  // the help's content: 'keys' (keyboard and mouse) or 'pad' (the controller
  // diagram for padTab: flight / foot / eva; subTabs: its own mode buttons)
  helpBody(tab, padTab = 'flight', subTabs = false) {
    const g = this.game;
    const btn = (attr, val, on, text) => `<button type="button" ${attr}="${val}" class="${on ? 'on' : ''}">${text}</button>`;
    const pad = g.input.pad;
    return tab === 'pad'
      ? `${subTabs ? `<div class="tabs sub">${['flight', 'foot', 'eva'].map((m) => btn('data-pm', m, m === padTab, PAD_LAYOUT[m].title)).join('')}</div>` : ''}
        ${padDiagram(padTab)}
        <p class="note">${pad ? `Connected: ${pad.id.replace(/</g, '&lt;')}` : 'No controller detected: connect one and press any button.'}</p>`
      : `<div class="keys">
      <kbd>Mouse</kbd><span>Look · seated: pitch and yaw</span>
      <kbd>W A S D</kbd><span>Walk · ship: forward/back thrust, strafe</span>
      <kbd>Space / C</kbd><span>Jump, hold for jetpack (also aboard big ships) · ship: up / down thrusters</span>
      <kbd>Q / E</kbd><span>Roll (ship, spacewalk)</span><kbd>Shift</kbd><span>Run · boost</span>
      <kbd>X</kbd><span>Brake (FULL assist) · spacewalk stabiliser</span>
      <kbd>F</kbd><span>Use: seats, ramps, lifts</span><kbd>Z</kbd><span>Flight assist OFF / ROT / FULL</span>
      <kbd>P</kbd><span>Back to your last pilot seat</span>
      <kbd>Tab</kbd><span>Next target, nearest first · aboard a big ship: route to the bridge, your ship, the hangar</span>
      <kbd>T</kbd><span>Target what's under the reticle</span><kbd>V</kbd><span>Cockpit · chase · landing view</span>
      <kbd>G / R / L</kbd><span>Gear · ramp · landing lights (automatic at night)</span><kbd>J</kbd><span>FTL drive</span>
      <kbd>, / .</kbd><span>Time warp</span><kbd>M</kbd><span>System map (pause screen) · Esc: pause screen</span>
      <kbd>N</kbd><span>Nav computer: fly to the target, door to door (N again to take the controls)</span>
      <kbd>U</kbd><span>Suit computer: Fleet, your ships and their orders</span>
      <kbd>\`</kbd><span>Quick menu: ship systems, targets, routes, time (1-9 pick, Backspace back)</span>
      <kbd>K</kbd><span>Settlement survey markers</span><kbd>B</kbd><span>Summon ship</span>
      <kbd>Right mouse / Alt</kbd><span>Free look from the pilot seat</span><kbd>Esc</kbd><span>Pause</span></div>`;
  }

  showDeath(cause, onRespawn) {
    this.overlay.hidden = false;
    this.overlay.innerHTML = `<div class="card"><h2 class="c-warn">Ship lost</h2><p>${cause}</p><button id="respawnBtn" class="primary" type="button" data-pad-default>Restart at the landing site</button></div>`;
    const btn = $('respawnBtn');
    btn.onclick = () => { this.overlay.hidden = true; this.overlay.innerHTML = ''; onRespawn(); this.game.input.requestLock(); };
    this.game.input.releaseLock();
  }

  update(dt) {
    const g = this.game;
    for (const m of this.msgs) { m.t += dt; if (m.t > 6) m.el.style.opacity = '0'; }
    while (this.msgs.length && this.msgs[0].t > 7) this.msgs.shift().el.remove();
    const onMap = g.map.open && g.map.owner === g.player;
    if (g.state !== 'playing' || onMap) {
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      if (onMap) { this.flight.hidden = this.nav.hidden = true; this.strip.hidden = false; this.updateStrip(); }
      return;
    }
    this.flight.hidden = this.nav.hidden = this.strip.hidden = false;
    this.textTimer -= dt;
    if (this.textTimer <= 0) { this.textTimer = 0.1; this.updateText(); this.updateStrip(); }
    const p = g.player.prompt;
    if (p) {
      const html = p.key ? `${this.keyGlyph(p.code || 'Key' + p.key, p.key)}${p.text}` : p.text;
      if (html !== this._promptHtml) { this._promptHtml = html; this.promptEl.innerHTML = html; }
      this.promptEl.hidden = false;
    } else this.promptEl.hidden = true;
    this.draw();
    this.updateScreens();
  }

  // -------------------------------------------------------------------- text

  state() {
    const g = this.game, s = g.focus, p = g.player;
    const piloting = p.mode === 'seat';
    const body = p.aboard ? s.body : p.body;
    const wp = p.worldPos(this._wp || (this._wp = new THREE.Vector3())); // own vector: rows reuse _v
    const rel = _v2.copy(wp).sub(body.pos);
    const r = rel.length();
    return { g, s, p, piloting, body, wp, r, alt: r - body.R };
  }

  updateText() {
    const st = this.state();
    const { g, s, p, piloting, body, alt } = st;
    const rows = [];
    const row = (k, v, cls = '') => rows.push(`<span class="label">${k}</span><span class="v ${cls}">${v}</span>`);
    const atm = body.atmosphereAt(alt);
    const gLocal = body.GM / (st.r * st.r);
    let head = `<h3>${body.data.name} · ${body.data.label}</h3>`;
    const host = s.parent;
    if (p.mode === 'ship' && (s.big || s.type.interiorGravity === 'natural')) {
      // walking aboard a big ship
      head = `<h3>${s.name} · ${s.type.className}</h3>`;
      const room = p._room;
      row('Deck', room ? room.name : '—');
      row('Gravity', s.type.interiorGravity === 'natural' ? `${(s.feltGravity(_v).length() / 9.81).toFixed(2)} g · natural` : '1.00 g · plating');
      row('Air', s.interior.vacuumAt(p.sPos) ? 'vacuum · suit sealed' : `${(s.interior.pressureAt ? s.interior.pressureAt(p.sPos) : 1).toFixed(2)} bar`, s.interior.vacuumAt(p.sPos) ? 'c-caution' : 'c-ok');
      row('Ship alt', fmtAlt(alt) + ' · ' + body.data.name);
      row('Ship hull', Math.round(s.hull * 100) + ' %', s.hull < 0.5 ? 'c-warn' : 'c-ok');
    } else if (p.aboard && host) {
      // inside a big ship's zone: flying over / docked on its deck
      head = `<h3>${host.name} · ${s.zone.name}</h3>`;
      row('Status', s.attached ? 'DOCKED' : 'manoeuvring', s.attached ? 'c-ok' : 'c-nav');
      if (isFinite(s.agl)) row('Deck clr', fmtAlt(Math.max(0, s.agl)), s.agl < 3 && !s.attached ? 'c-caution' : '');
      const lv = s.lvel;
      row('V/S', (lv.y >= 0 ? '+' : '') + lv.y.toFixed(1) + ' m/s', lv.y < -4 && s.agl < 30 ? 'c-warn' : '');
      row('Rel spd', U.fmtSpeed(lv.length()));
      row('Gravity', `${((typeof s.zone.gravity === 'number' ? s.zone.gravity : s.feltGravity(_v).length()) / 9.81).toFixed(2)} g · ${typeof s.zone.gravity === 'number' ? 'plating' : 'natural'}`);
      row('Hull', Math.round(s.hull * 100) + ' %', s.hull < 0.35 ? 'c-warn' : (s.hull < 0.75 ? 'c-caution' : 'c-ok'));
    } else if (piloting && s.type.ground) {
      // driving: speed, heading, the ground, the vehicle
      const up = _v.copy(s.pos).normalize();
      row('Speed', `${Math.round(this.groundSpeed(s) * 3.6)} km/h`);
      const fwd = _v2.set(0, 0, -1).applyQuaternion(s.quat);
      const northW = _v3.set(0, 1, 0).applyQuaternion(body.qTilt || body.q);
      northW.addScaledVector(up, -northW.dot(up));
      if (northW.lengthSq() > 1e-8) {
        northW.normalize();
        const eastW = northW.clone().cross(up);
        let hd = Math.atan2(fwd.dot(eastW), fwd.dot(northW)) * 57.2958;
        row('Heading', `${String(Math.round((hd + 360) % 360)).padStart(3, '0')}°`);
      }
      if (s.type.ground.kind === 'hover' && isFinite(s.agl)) row('Ride', `${Math.max(0, s.agl).toFixed(1)} m`);
      row('Gravity', (gLocal / 9.81).toFixed(2) + ' g');
      if (atm.pressure > 0) { row('Pressure', fmtP(atm.pressure)); row('Air temp', Math.round(atm.temperature) + ' K'); }
      row('Hull', Math.round(s.hull * 100) + ' %', s.hull < 0.35 ? 'c-warn' : (s.hull < 0.75 ? 'c-caution' : 'c-ok'));
    } else if (piloting || p.mode === 'ship') {
      const sv = s.surfaceVel(_v3);
      const up = _v.copy(s.pos).normalize();
      const vs = sv.dot(up);
      const gs = Math.sqrt(Math.max(0, sv.lengthSq() - vs * vs));
      row('Alt', body.giant ? fmtAlt(alt) + ' (1 bar)' : fmtAlt(alt));
      if (isFinite(s.agl) && s.agl < 20000) row('Radar', fmtAlt(Math.max(0, s.agl)), s.agl < 50 ? 'c-caution' : '');
      row('V/S', (vs >= 0 ? '+' : '') + vs.toFixed(vs > -100 && vs < 100 ? 1 : 0) + ' m/s', vs < -15 && s.agl < 2000 ? 'c-warn' : '');
      row('Gnd spd', U.fmtSpeed(gs));
      row('Orb spd', U.fmtSpeed(s.vel.length()));
      row('G-load', (s.landed ? 1 : s.accel.length() / 9.81).toFixed(2) + ' g');
      const lift = s.type.ground ? Infinity : s.limits.belly / s.mass; // (vehicles don't fly)
      row('Gravity', (gLocal / 9.81).toFixed(2) + ' g', gLocal > lift ? 'c-warn' : (gLocal > lift * 0.75 ? 'c-caution' : ''));
      if (s.type.ground) { /* no lift to warn about */ } else if (s.big) row('Lift', gLocal > s.limits.main / s.mass ? 'cannot land · too heavy' : 'cannot land', 'c-caution');
      else if (gLocal > lift && !s.landed) row('Lift', gLocal > s.limits.main / s.mass ? 'NO ESCAPE THRUST' : 'NOSE UP: main drive', 'c-warn');
      if (atm.pressure > 0) {
        const crush = atm.pressure > s.hullRating * 0.8;
        row('Pressure', fmtP(atm.pressure), crush ? 'c-warn' : (atm.pressure > s.hullRating * 0.5 ? 'c-caution' : ''));
        row('Air temp', Math.round(atm.temperature) + ' K');
      }
      row('Hull', Math.round(s.hull * 100) + ' %', s.hull < 0.35 ? 'c-warn' : (s.hull < 0.75 ? 'c-caution' : 'c-ok'));
      if (s.hullTemp > 500) row('Hull temp', Math.round(s.hullTemp) + ' K', s.hullTemp > 1600 ? 'c-warn' : 'c-caution');
    } else {
      row('Alt', fmtAlt(alt));
      row('Gravity', (gLocal / 9.81).toFixed(2) + ' g');
      if (atm.pressure > 0) { row('Pressure', fmtP(atm.pressure)); row('Air temp', `${Math.round(atm.temperature)} K (${Math.round(atm.temperature - 273.15)} °C)`); }
      else row('Atmosphere', 'none (vacuum)');
      row('Jetpack', Math.round(p.jetFuel * 100) + ' %', p.jetFuel < 0.2 ? 'c-caution' : 'c-ok');
      if (p.mode === 'surface' && body.solid) {
        const f = p.fPos.clone().normalize();
        row('Position', `${(Math.asin(f.y) * 57.2958).toFixed(2)}°, ${(Math.atan2(f.z, f.x) * 57.2958).toFixed(2)}°`);
      }
      if (p.mode === 'eva' && p.nearShip) row('Speed', U.fmtSpeed(p.eVel.clone().sub(p.nearShip.vel).length()) + ' rel ' + p.nearShip.name);
    }
    // local solar time
    if (body.solid && !body.data.rotation.locked) {
      const pf = (p.mode === 'surface' ? p.fPos.clone() : (p.aboard ? s.pos : p.ePos).clone().applyQuaternion(body.qInv)).normalize();
      const sunF = body.pos.clone().negate().normalize().applyQuaternion(body.qInv);
      const lonP = Math.atan2(pf.z, pf.x), lonS = Math.atan2(sunF.z, sunF.x);
      let hrs = ((lonS - lonP) / (2 * Math.PI)) * 24 * Math.sign(body.data.rotation.rate || 1) + 12;
      hrs = ((hrs % 24) + 24) % 24;
      row('Local time', `${String(Math.floor(hrs)).padStart(2, '0')}:${String(Math.floor((hrs % 1) * 60)).padStart(2, '0')}`);
    }
    this.flight.innerHTML = head + `<div class="rows">${rows.join('')}</div>`;

    // navigation cluster
    const nrows = [];
    const nrow = (k, v, cls = '') => nrows.push(`<span class="label">${k}</span><span class="v ${cls}">${v}</span>`);
    const tgt = g.target;
    if (tgt) {
      const d = tgt.pos.distanceTo(st.wp) - tgt.R;
      const relV = (piloting || p.mode === 'ship') ? s.getWorldVel(_v3).sub(tgt.vel) : _v3.set(0, 0, 0);
      const dir = _v.copy(tgt.pos).sub(st.wp).normalize();
      const closing = relV.dot(dir);
      nrow('Target', tgt.data.name, 'c-target');
      nrow('Type', tgt.data.label || '');
      nrow('Distance', U.fmtDist(d));
      if (Math.abs(closing) > 0.5) nrow('Closing', U.fmtSpeed(closing), closing > 0 ? '' : 'c-caution');
      if (closing > 1) nrow('ETA', U.fmtTime(d / closing));
    }
    if (p.aboard && s.refVessel && !host) {
      const rv = _v3.copy(s.vel).sub(_v2.copy(s.refVessel.vel));
      nrow('Ref', s.refVessel.name, 'c-target');
      nrow('Rel speed', U.fmtSpeed(rv.length()));
    }
    if (p.aboard && !s.landed && !s.type.ground && g.ftl.state !== 'cruise') {
      const o = s.orbit();
      nrow('Apoapsis', o.bound ? fmtAlt(o.ra - body.R) : 'escape', o.bound ? '' : 'c-caution');
      nrow('Periapsis', fmtAlt(o.rp - body.R), o.rp < body.R + (body.atmHeight || 0) ? 'c-caution' : '');
      if (o.bound) nrow('Period', U.fmtTime(o.period));
      if (o.bound && isFinite(o.timeToAp)) nrow('T to Ap', U.fmtTime(o.timeToAp));
      const axis = _v.set(0, 1, 0).applyQuaternion(body.qTilt);
      const inc = Math.acos(THREE.MathUtils.clamp(_v2.set(...o.h).normalize().dot(axis), -1, 1)) * 57.2958;
      nrow('Inclination', inc.toFixed(1) + '°');
    }
    if (g.ftl.state === 'cruise') {
      nrow('FTL speed', U.fmtSpeed(g.ftl.speed), 'c-nav');
      nrow('Throttle', Math.round(g.ftl.throttle * 100) + ' %');
    }
    const lock = g.ftl.massLock();
    if (piloting && lock && g.ftl.state !== 'cruise') nrow('Mass lock', `${lock.body.data.name} +${((lock.lock - lock.dist) / 1000).toFixed(0)} km`, 'c-caution');
    nrow('Time warp', `×${g.warp.toLocaleString()}`, g.warp > 1 ? 'c-nav' : '');
    if (g.players.length > 1) nrow('Warp requests', g.players.map(p => `${p.label}: ×${WARP_LEVELS[p.warpRequestIndex || 0].toLocaleString()}`).join(' · '), 'c-nav');
    nrow('Mission day', (g.t / 86400).toFixed(2));
    const ns = g.nav.status();
    if (ns) { nrow('Nav computer', ns.phase, 'c-nav'); nrow('Going to', ns.dest, 'c-nav'); nrow('Time to go', fmtEta(ns.eta), 'c-nav'); }
    if (ns?.wait > 0) nrow('Launch window in', fmtEta(ns.wait), 'c-nav');
    if (ns?.deltaV > 0) nrow('Maneuvers', `${U.fmtSpeed(ns.deltaV)} Δv · burn ${fmtEta(ns.burnSeconds)}`, 'c-nav');
    if (g.showSites) {
      const res = g.settlements.get(body.id);
      nrow('Survey', res ? `${res.sites.length} ${res.habitable ? 'city' : 'outpost'} sites` : 'surveying…', 'c-ok');
    }
    this.nav.innerHTML = `<h3>Navigation</h3><div class="rows">${nrows.join('')}</div>`;
  }

  updateStrip() {
    const g = this.game, s = g.focus, p = g.player;
    const chips = [];
    const chip = (t, cls = '') => chips.push(`<span class="chip ${cls}">${t}</span>`);
    const rampDoor = (s.type.doors || []).find((d) => d.ramp);
    if (p.mode === 'seat' && s.type.ground) {
      // a ground vehicle: how it moves, how fast, its ramp, where it is (no flight items)
      if (s.pilot !== p) chip(s.pilot ? `PASSENGER · ${s.pilot.label.toUpperCase()} DRIVING` : 'PASSENGER', 'nav');
      chip(s.type.ground.kind === 'hover' ? 'DRIVE · HOVER' : 'DRIVE · WHEELS', 'on');
      chip(`${Math.round(this.groundSpeed(s) * 3.6)} KM/H`);
      if (rampDoor) { const o = s.doors[rampDoor.id].open; if (o > 0.01) chip(o > 0.99 ? 'RAMP OPEN' : 'RAMP ···', 'caution'); }
      if (s.parent) chip(s.attached ? `PARKED · ${s.parent.name.toUpperCase()}` : `${s.zone.name.toUpperCase()} · ${s.parent.name.toUpperCase()}`, s.attached ? 'on' : 'nav');
      if (g.camMode === 'chase') chip('CHASE CAM');
    } else if (p.mode === 'seat') {
      if (s.pilot !== p) chip(s.pilot ? `PASSENGER · ${s.pilot.label.toUpperCase()} FLYING` : 'PASSENGER', 'nav');
      chip(`FA ${ASSIST_NAMES[s.assist]}`, s.assist === 0 ? 'caution' : 'on');
      if (s.assist === 2 && s.targetFrame === 'surface') { if (Math.abs(s.cruise) > 0.5) chip(`CRUISE ${U.fmtSpeed(s.cruise)}`, 'nav'); if (Math.abs(s.climb) > 0.3) chip(`CLIMB ${s.climb > 0 ? '+' : ''}${s.climb.toFixed(1)}`, 'nav'); if (s.heatLimited) chip('HEAT LIMIT', 'caution'); }
      else if (s.assist === 2 && !s.attached && !s.landed && s.targetVel.length() > 0.5) chip(`HOLD ${U.fmtSpeed(s.targetVel.length())}`, 'nav');
      if (s.type.legs) chip(s.gear > 0.99 ? 'GEAR DN' : (s.gear < 0.01 ? 'GEAR UP' : 'GEAR ···'), s.gear > 0.99 ? 'on' : (s.gear < 0.01 ? '' : 'caution'));
      if (s.ramp > 0.01) chip(s.ramp > 0.99 ? 'RAMP OPEN' : 'RAMP ···', 'caution');
      if (rampDoor) { const o = s.doors[rampDoor.id].open; if (o > 0.01) chip(o > 0.99 ? 'RAMP OPEN' : 'RAMP ···', 'caution'); }
      if (s.visual.landing?.on) chip('LIGHTS', 'on');
      if (s.parent) chip(s.attached ? `DOCKED · ${s.parent.name.toUpperCase()}` : `${s.zone.name.toUpperCase()} · ${s.parent.name.toUpperCase()}`, s.attached ? 'on' : 'nav');
      else if (s.refVessel && s.assist === 2) chip(`REF ${s.refVessel.name.toUpperCase()}`, 'nav');
      const f = g.ftl;
      const lock = f.massLock();
      if (s.parent) chip('FTL —');
      else if (f.state === 'cruise') chip('FTL CRUISE', 'nav');
      else if (f.state === 'spool') chip(`FTL ${f.timer.toFixed(1)}`, 'nav');
      else if (f.state === 'cooldown') chip(`FTL COOL ${f.timer.toFixed(0)}`, 'caution');
      else if (lock) chip('FTL LOCKED');
      else { const obs = f.pathObstruction(); chip(obs ? `FTL PATH ✕ ${obs.data.name.toUpperCase()}` : 'FTL READY', obs ? 'caution' : 'on'); }
      if (s.landed) chip('LANDED', 'on');
      if (g.camMode === 'chase') chip('CHASE CAM');
      if (g.camMode === 'landing') chip('LANDING CAM', 'on');
    } else {
      chip(p.mode === 'eva' ? 'EVA' : (p.mode === 'ship' ? `ABOARD ${s.name.toUpperCase()}` : (p.swimming ? 'SWIMMING' : 'ON FOOT')), 'on');
      chip(`JET ${Math.round(p.jetFuel * 100)}%`, p.jetFuel < 0.2 ? 'caution' : '');
      const tab = this.keyName('Tab', 'TAB');
      if (p.mode === 'ship' && p.vessel.big) chip(g.route ? `ROUTE · ${g.route.label.toUpperCase()} · ${tab} NEXT` : `${tab} · FIND YOUR WAY`, g.route ? 'nav' : '');
    }
    if (g.warp > 1) chip(`WARP ×${g.warp.toLocaleString()}`, 'nav');
    if ((p.warpRequestIndex || 0) > g.warpIndex) chip(`WARP REQUEST ×${WARP_LEVELS[p.warpRequestIndex].toLocaleString()} · WAITING`, 'nav');
    const ns = g.nav.status();
    if (ns) chip(`NAV · ${ns.phase.toUpperCase()} · ${fmtEta(ns.eta)}`, 'nav');
    if (p.mode !== 'seat' && p.lastSeat && !p.lastSeat.vessel.dead) chip(`${this.keyName('KeyP', 'P')} · ${p.lastSeat.vessel.name.toUpperCase()} SEAT`);
    chip(`${this.keyName('KeyH', 'H')} HELP`);
    this.strip.innerHTML = chips.join('');
  }

  // a vehicle's speed over what it drives on (the ground, or the deck it's on)
  groundSpeed(s) {
    return s.parent ? s.lvel.length() : s.surfaceVel(this._gsv || (this._gsv = new THREE.Vector3())).length();
  }

  // -------------------------------------------------------------------- canvas

  project(worldPos, out) {
    const g = this.game;
    const cam = g.engine.camera;
    _v.copy(worldPos).sub(g.camPos).applyQuaternion(_q.copy(g.camQuat).invert());
    if (_v.z >= -1e-6) { out.behind = true; out.x = _v.x; out.y = _v.y; return out; }
    const t = Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2);
    out.x = (_v.x / -_v.z) / (t * cam.aspect) * 0.5 * this.w + this.w / 2;
    out.y = -(_v.y / -_v.z) / t * 0.5 * this.h + this.h / 2;
    out.behind = false;
    out.depth = -_v.z;
    return out;
  }

  draw() {
    const g = this.game, s = g.focus, p = g.player;
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.w, this.h);
    ctx.lineWidth = 1.5;
    ctx.font = '11px "B612 Mono", monospace';
    ctx.textBaseline = 'middle';
    const cx = this.w / 2, cy = this.h / 2;
    const piloting = p.mode === 'seat';
    // reticle
    ctx.strokeStyle = 'rgba(230,239,243,0.55)';
    ctx.beginPath();
    if (piloting) {
      ctx.moveTo(cx - 14, cy); ctx.lineTo(cx - 5, cy); ctx.moveTo(cx + 5, cy); ctx.lineTo(cx + 14, cy);
      ctx.moveTo(cx, cy + 5); ctx.lineTo(cx, cy + 10);
    } else { ctx.arc(cx, cy, 2, 0, Math.PI * 2); }
    ctx.stroke();

    // the opening title card plays over a clean shot
    const cinematic = this.titleEl && !this.titleEl.classList.contains('out');
    if (!cinematic) this.drawBodyLabels();
    if (g.showSites) this.drawSites();
    if (piloting) {
      if (!s.type.ground) {
        if (!s.parent) this.drawAttitude();
        this.drawAltTape();
        if (!s.big) this.drawDockingGuides();
        if(s.pilot===p&&!s.parent)drawLandingGuide(this,s.nav.landingGuide.update());
      }
      this.drawStick();
    }
    if (p.mode === 'eva') { const mv = markerVelocity(g, _v3); drawVelocityMarkers(this, mv.vel, mv.tag, COL); }
    if (g.target) this.drawTarget(g.target);
    this.drawPlayers();
    this.drawNav();
    if (p.mode === 'ship') this.drawRoute();
    if (g.showMeter) this.drawMeter();
  }

  // dashed polyline through vessel-local floor points, clipped at the camera
  drawFloorPath(v, pts) {
    const g = this.game, ctx = this.ctx, cam = g.engine.camera;
    const qi = _q.copy(g.camQuat).invert();
    const t = Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2);
    const view = pts.map((p) => v.localToWorld(_v.copy(p).setY(p.y + 0.12), new THREE.Vector3()).sub(g.camPos).applyQuaternion(qi));
    const scr = (q) => [(q.x / -q.z) / (t * cam.aspect) * 0.5 * this.w + this.w / 2, -(q.y / -q.z) / t * 0.5 * this.h + this.h / 2];
    const NEAR = -0.3;
    ctx.save();
    ctx.strokeStyle = COL.nav;
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 9]);
    ctx.lineDashOffset = -performance.now() / 40; // marching towards the goal
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    for (let i = 0; i + 1 < view.length; i++) {
      let a = view[i].clone(), b = view[i + 1].clone();
      if (a.z > NEAR && b.z > NEAR) continue;
      if (a.z > NEAR) a.lerp(b, (NEAR - a.z) / (b.z - a.z));
      if (b.z > NEAR) b.lerp(a, (NEAR - b.z) / (a.z - b.z));
      const [x0, y0] = scr(a), [x1, y1] = scr(b);
      ctx.moveTo(x0, y0); ctx.lineTo(x1, y1);
    }
    ctx.stroke();
    ctx.restore();
  }

  // exposure readout (Test scenes): the anchor from the light where you are,
  // the exposure in use, and how far the view's own brightness moved it
  drawMeter() {
    const g = this.game, e = g.engine, ctx = this.ctx;
    const now = performance.now();
    if (!this._meterT || now - this._meterT > 300) { this._meterT = now; this._meterExp = e.readExposure(); }
    const anchor = Math.min(e.maxExposure, Math.max(e.minExposure, 0.18 / e.meterRef));
    const ev = Math.log2(this._meterExp / anchor);
    const where = g.lights.inside ? `inside ${g.lights.host.name}` : (g.lights.camE > 0 ? 'outdoors + ship lamps' : 'outdoors');
    ctx.fillStyle = COL.tgt;
    ctx.textAlign = 'center';
    ctx.fillText(`EXPOSURE ×${this._meterExp.toFixed(1)} · ANCHOR ×${anchor.toFixed(1)} (${where}) · VIEW ${ev >= 0 ? '+' : ''}${ev.toFixed(1)} EV · ${e.toneCurve.toUpperCase()}`, this.w / 2, 104);
    ctx.textAlign = 'left';
  }

  // the next leg of an onboard route: a doorway, a lift, or the destination
  drawRoute() {
    const g = this.game, ctx = this.ctx, p = g.player;
    const step = g.routeStep();
    if (!step) return;
    const v = p.vessel;
    // a dashed trail along the floor: through each doorway to the next lift
    // (or the destination itself when no lift is left on the way)
    const pts = [p.sPos.clone()];
    for (const leg of step.legs || []) { pts.push(leg.at.clone()); if (leg.kind === 'lift') break; }
    if (step.kind === 'goal' || !(step.legs || []).some((l) => l.kind === 'lift')) pts.push(step.dest.at.clone());
    this.drawFloorPath(v, pts);
    const w = v.localToWorld(_v2.copy(step.at).setY(step.at.y + 1.4), _v3);
    const pt = this.project(w, {});
    const cx = this.w / 2, cy = this.h / 2;
    const d = Math.hypot(step.at.x - p.sPos.x, step.at.z - p.sPos.z);
    const label = step.kind === 'goal' ? step.dest.label : (step.kind === 'lift' ? `${step.label} · F to ride` : `Door to ${step.room.name}`);
    ctx.strokeStyle = COL.nav; ctx.fillStyle = COL.nav;
    let x = pt.x, y = pt.y;
    const off = pt.behind || x < 30 || x > this.w - 30 || y < 30 || y > this.h - 30;
    if (off) {
      let dx = x - cx, dy = y - cy;
      if (pt.behind) { dx = -dx; dy = -dy; }
      const a = Math.atan2(dy, dx);
      const rx = this.w / 2 - 60, ry = this.h / 2 - 60;
      const k = Math.min(rx / Math.abs(Math.cos(a) || 1e-6), ry / Math.abs(Math.sin(a) || 1e-6));
      x = cx + Math.cos(a) * k; y = cy + Math.sin(a) * k;
      ctx.save(); ctx.translate(x, y); ctx.rotate(a);
      ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(-7, -8); ctx.lineTo(-7, 8); ctx.closePath(); ctx.fill();
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.moveTo(x, y - 10); ctx.lineTo(x + 10, y); ctx.lineTo(x, y + 10); ctx.lineTo(x - 10, y); ctx.closePath();
      ctx.moveTo(x, y + 10); ctx.lineTo(x, y + 26);
      ctx.stroke();
    }
    const tx = Math.min(Math.max(x + 16, 8), this.w - 260);
    ctx.fillText(`${label.toUpperCase()} · ${U.fmtDist(d)}`, tx, y - 4);
    if (step.kind !== 'goal') ctx.fillText(`→ ${step.dest.label.toUpperCase()}${step.dist ? ' · ' + U.fmtDist(step.dist) : ''}`, tx, y + 10);
  }

  drawStick() {
    const s = this.game.focus, ctx = this.ctx;
    const cx = this.w / 2, cy = this.h / 2;
    const r = 46;
    ctx.strokeStyle = 'rgba(230,239,243,0.12)';
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = COL.tgt;
    ctx.beginPath(); ctx.arc(cx + s.stick.x * r, cy + s.stick.y * r, 2.5, 0, Math.PI * 2); ctx.fill();
  }

  drawAttitude() {
    const g = this.game, s = g.focus, ctx = this.ctx;
    const body = s.body;
    const cx = this.w / 2, cy = this.h / 2;
    const up = _v2.copy(s.pos).normalize();
    // the velocity markers, prograde and retrograde on the sky round you (velMarkers.js)
    const near = s.altitude < Math.max(body.atmHeight * 1.5, 60000);
    const mv = markerVelocity(g, _v3);
    drawVelocityMarkers(this, mv.vel, mv.tag, COL);
    if (!near) return;
    // pitch ladder in the camera frame
    const camInv = _q.copy(g.camQuat).invert();
    const upC = up.clone().applyQuaternion(camInv);
    const fwdC = new THREE.Vector3(0, 0, -1);
    const pitch = Math.asin(THREE.MathUtils.clamp(fwdC.dot(upC), -1, 1));
    const roll = Math.atan2(upC.x, upC.y);
    const fovR = THREE.MathUtils.degToRad(g.engine.camera.fov);
    const pxPerRad = this.h / fovR;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-roll);
    ctx.strokeStyle = 'rgba(230,239,243,0.45)';
    ctx.fillStyle = 'rgba(230,239,243,0.6)';
    for (let d = -90; d <= 90; d += 10) {
      const y = (pitch - THREE.MathUtils.degToRad(d)) * pxPerRad;
      if (Math.abs(y) > this.h * 0.32) continue;
      const wdt = d === 0 ? 260 : 70;
      ctx.beginPath();
      if (d === 0) { ctx.moveTo(-wdt, y); ctx.lineTo(-40, y); ctx.moveTo(40, y); ctx.lineTo(wdt, y); }
      else {
        ctx.setLineDash(d < 0 ? [6, 5] : []);
        ctx.moveTo(-wdt, y); ctx.lineTo(-30, y); ctx.moveTo(30, y); ctx.lineTo(wdt, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      if (d !== 0) { ctx.fillText(String(d), wdt + 6, y); }
    }
    ctx.restore();
    // heading tape
    const north = new THREE.Vector3(0, 1, 0).applyQuaternion(body.qTilt);
    const n = north.addScaledVector(up, -north.dot(up));
    if (n.lengthSq() > 1e-8) {
      n.normalize();
      const east = n.clone().cross(up).negate();
      const fwdW = new THREE.Vector3(0, 0, -1).applyQuaternion(g.camQuat);
      const fh = fwdW.addScaledVector(up, -fwdW.dot(up));
      if (fh.lengthSq() > 1e-8) {
        fh.normalize();
        let hdg = Math.atan2(fh.dot(east), fh.dot(n)) * 57.2958;
        if (hdg < 0) hdg += 360;
        const y0 = 40;
        ctx.strokeStyle = 'rgba(230,239,243,0.45)';
        ctx.fillStyle = COL.ink;
        ctx.textAlign = 'center';
        for (let d = -60; d <= 60; d += 5) {
          const a = Math.round(hdg / 5) * 5 + d;
          const x = cx + (a - hdg) * 4;
          if (Math.abs(x - cx) > 240) continue;
          const aa = ((a % 360) + 360) % 360;
          ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y0 + (aa % 15 === 0 ? 8 : 4)); ctx.stroke();
          if (aa % 45 === 0) ctx.fillText(['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][aa / 45], x, y0 + 18);
        }
        ctx.fillStyle = COL.nav;
        ctx.fillText(String(Math.round(hdg)).padStart(3, '0'), cx, y0 - 10);
        ctx.textAlign = 'left';
      }
    }
  }

  // Altitude tape; on giants it becomes a pressure/depth gauge with cloud decks
  drawAltTape() {
    const g = this.game, s = g.focus, ctx = this.ctx;
    const body = s.body;
    const x = this.w - 300, y0 = this.h * 0.28, y1 = this.h * 0.72;
    const alt = s.altitude;
    ctx.textAlign = 'left';
    if (body.giant && !s.parent) {
      // log-pressure scale from 1 mbar to 200 bar
      const P = Math.max(1e-4, s.env.pressure || body.atmosphereAt(alt).pressure);
      const lp = (p) => (Math.log10(p) + 3) / (Math.log10(200) + 3);
      const yOf = (p) => y0 + lp(p) * (y1 - y0);
      ctx.strokeStyle = 'rgba(230,239,243,0.35)';
      ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke();
      ctx.fillStyle = COL.dim;
      ctx.fillText('PRESSURE', x - 4, y0 - 14);
      for (const p of [0.001, 0.01, 0.1, 1, 10, 100]) {
        const y = yOf(p);
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 8, y); ctx.stroke();
        ctx.fillText(p >= 1 ? `${p} bar` : `${p * 1000} mb`, x + 12, y);
      }
      // crush zone
      const r = s.hullRating;
      ctx.fillStyle = 'rgba(241,180,58,0.35)';
      ctx.fillRect(x - 6, yOf(r * 0.8), 6, yOf(r) - yOf(r * 0.8));
      ctx.fillStyle = 'rgba(255,82,72,0.55)';
      ctx.fillRect(x - 6, yOf(r), 6, Math.max(2, yOf(Math.min(200, r * 1.25)) - yOf(r)));
      ctx.fillStyle = COL.warn;
      ctx.fillText('CRUSH', x - 52, yOf(r * 1.1));
      // cloud decks
      for (const d of body.giant.decks) {
        const y = yOf(d.pressure);
        ctx.strokeStyle = COL.tgt;
        ctx.beginPath(); ctx.moveTo(x - 12, y); ctx.lineTo(x, y); ctx.stroke();
        ctx.fillStyle = COL.tgt;
        ctx.textAlign = 'right';
        ctx.fillText(d.name, x - 16, y);
        ctx.textAlign = 'left';
      }
      // current
      const y = yOf(P);
      ctx.fillStyle = COL.nav;
      ctx.beginPath(); ctx.moveTo(x + 2, y); ctx.lineTo(x + 12, y - 6); ctx.lineTo(x + 12, y + 6); ctx.fill();
      ctx.fillText(`${fmtP(P)} · ${fmtAlt(alt)}`, x + 16, y + 14);
      return;
    }
    // radar altitude tape near the ground
    if (!isFinite(s.agl) || s.agl > 3000) return;
    const agl = Math.max(0, s.agl);
    const span = agl < 100 ? 120 : (agl < 600 ? 800 : 3000);
    const yOf = (h) => y1 - (h / span) * (y1 - y0);
    ctx.strokeStyle = 'rgba(230,239,243,0.35)';
    ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke();
    ctx.fillStyle = COL.dim;
    ctx.fillText('RADAR ALT', x - 4, y0 - 14);
    const step = span / 6;
    for (let h = 0; h <= span; h += step) { const y = yOf(h); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 6, y); ctx.stroke(); ctx.fillText(`${Math.round(h)}`, x + 10, y); }
    const y = yOf(Math.min(agl, span));
    ctx.fillStyle = agl < 20 ? COL.cau : COL.ok;
    ctx.beginPath(); ctx.moveTo(x + 2, y); ctx.lineTo(x + 12, y - 6); ctx.lineTo(x + 12, y + 6); ctx.fill();
    // vertical speed bar
    const up = _v.copy(s.pos).normalize();
    const vs = s.parent ? s.lvel.y : s.surfaceVel(_v3).dot(up);
    const vy = THREE.MathUtils.clamp(-vs * 4, -120, 120);
    ctx.fillStyle = vs < -6 ? COL.warn : (vs < -2.5 ? COL.cau : COL.ok);
    ctx.fillRect(x - 14, (y0 + y1) / 2, 5, vy);
    ctx.fillStyle = COL.dim;
    ctx.fillText('V/S', x - 30, (y0 + y1) / 2 - 130);
  }

  drawBodyLabels() {
    const g = this.game, ctx = this.ctx;
    const pt = {};
    const curBody = g.player.currentBody();
    const marks = [];
    for (const b of g.universe.bodies) {
      if (b === curBody) continue;
      this.project(b.pos, pt);
      if (pt.behind) continue;
      if (pt.x < -50 || pt.x > this.w + 50 || pt.y < -50 || pt.y > this.h + 50) continue;
      const d = b.pos.distanceTo(g.camPos) - b.R;
      // the target first, then by apparent size: a giant outranks its moons
      marks.push({ b, x: pt.x, y: pt.y, d, rank: g.target === b ? -1 : d / b.R });
    }
    // ships: labelled when they are more than a dot but not filling the view
    const own = g.player.aboard ? g.focus.root : null;
    for (const v of g.vessels) {
      if (v.dead || v.root === own || (v.parent && v.attached) || !g.listed(v)) continue;
      const wp = v.getWorldPos(_v2);
      const d = wp.distanceTo(g.camPos);
      if (d < v.type.radius * 2.5 || d > 4e7) continue;
      this.project(wp, pt);
      if (pt.behind || pt.x < -50 || pt.x > this.w + 50 || pt.y < -50 || pt.y > this.h + 50) continue;
      marks.push({ b: v.target, x: pt.x, y: pt.y, d, rank: g.target === v.target ? -1 : d / (v.type.radius * 40), ship: true });
    }
    marks.sort((a, b) => a.rank - b.rank);
    const boxes = [];
    for (const m of marks) {
      const isT = g.target === m.b;
      ctx.fillStyle = isT ? COL.tgt : (m.ship ? COL.nav : 'rgba(230,239,243,0.7)');
      ctx.strokeStyle = ctx.fillStyle;
      ctx.beginPath();
      if (m.ship) ctx.rect(m.x - 3, m.y - 3, 6, 6); else ctx.arc(m.x, m.y, 3, 0, Math.PI * 2);
      ctx.stroke();
      // de-clutter: a label that would overlap a higher-ranked one is dropped
      const text = `${m.b.data.name}  ${U.fmtDist(m.d)}`;
      const box = { x0: m.x + 6, x1: m.x + 10 + ctx.measureText(text).width, y0: m.y - 8, y1: m.y + 8 };
      if (boxes.some((o) => box.x0 < o.x1 && box.x1 > o.x0 && box.y0 < o.y1 && box.y1 > o.y0)) continue;
      boxes.push(box);
      ctx.fillText(text, m.x + 8, m.y);
    }
  }

  // approach guides on nearby big ships: pads and hangar doors, coloured
  // amber = free, cyan = a craft inside, green = a craft clamped
  drawDockingGuides() {
    const g = this.game, ctx = this.ctx;
    const pt = {};
    // the yacht's recess under the carrier, while you fly the yacht near her: a ring where it berths
    // (up into it slowly, square to her: game.js berthYachtIfHome)
    const y = g.yacht, c = g.carrier;
    if (y && c && g.focus === y && !y.parent && !c.dead && c.type.layout && c.getWorldPos(_v).distanceTo(g.camPos) < c.type.radius + 9000) {
      const w = c.localToWorld(_v2.fromArray(c.type.layout.yacht.dock.pos), _v3);
      this.project(w, pt);
      if (!pt.behind && pt.x > -40 && pt.x < this.w + 40 && pt.y > -40 && pt.y < this.h + 40) {
        ctx.strokeStyle = COL.tgt; ctx.fillStyle = COL.tgt;
        ctx.beginPath(); ctx.arc(pt.x, pt.y, 14, 0, Math.PI * 2); ctx.moveTo(pt.x, pt.y - 20); ctx.lineTo(pt.x, pt.y - 8); ctx.stroke();
        ctx.fillText(`${c.name.toUpperCase()} · ${y.name.toUpperCase()} BERTH · ${U.fmtDist(w.distanceTo(g.camPos))}`, pt.x + 20, pt.y);
      }
    }
    for (const h of g.vessels) {
      if (!h.big || h.dead || !h.type.zones) continue;
      const d0 = h.getWorldPos(_v).distanceTo(g.camPos);
      if (d0 > h.type.radius + 9000 && !(g.target && g.target.v === h)) continue;
      for (const z of h.type.zones) {
        let local;
        if (z.kind === 'pad') local = _v2.set(z.pad[0], z.pad[1] + 14, z.pad[2]);
        else if (z.mouth) { // in front of a bay's mouth, at mid height
          const M = z.mouth, n = M.normal;
          local = _v2.set((z.min[0] + z.max[0]) / 2, (z.min[1] + z.max[1]) / 2, (z.min[2] + z.max[2]) / 2);
          if (n[0]) local.x = M.at + n[0] * 30; else local.z = M.at + n[2] * 30;
        } else local = _v2.set(z.door.x - 30, (z.door.y0 + z.door.y1) * 0.4, (z.door.z0 + z.door.z1) / 2);
        const w = h.localToWorld(local, _v3);
        this.project(w, pt);
        if (pt.behind || pt.x < -40 || pt.x > this.w + 40 || pt.y < -40 || pt.y > this.h + 40) continue;
        const dist = w.distanceTo(g.camPos);
        let state = 0;
        for (const c of h.children) if (c.zone === z) state = Math.max(state, c.attached ? 2 : 1);
        const col = state === 2 ? COL.ok : (state === 1 ? COL.tgt : COL.cau);
        ctx.strokeStyle = col; ctx.fillStyle = col;
        const r = z.kind === 'pad' ? 9 : 12;
        ctx.beginPath();
        if (z.kind === 'pad') {
          ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
          ctx.moveTo(pt.x - r - 7, pt.y); ctx.lineTo(pt.x - r + 3, pt.y); ctx.moveTo(pt.x + r - 3, pt.y); ctx.lineTo(pt.x + r + 7, pt.y);
        } else ctx.rect(pt.x - r * 1.6, pt.y - r, r * 3.2, r * 2);
        ctx.stroke();
        ctx.fillText(`${h.name.toUpperCase()} ${z.name.toUpperCase()} · ${U.fmtDist(dist)}${state === 2 ? ' · OCCUPIED' : ''}`, pt.x + r * 1.7 + 4, pt.y);
      }
    }
  }

  // the nav computer's next point: a magenta diamond (an edge arrow off screen)
  drawNav() {
    const st = this.game.nav.status();
    if (!st || !st.aim) return;
    const ctx = this.ctx;
    const pt = this.project(st.aim, {});
    const cx = this.w / 2, cy = this.h / 2;
    let x = pt.x, y = pt.y;
    ctx.strokeStyle = COL.nav; ctx.fillStyle = COL.nav;
    if (pt.behind || x < 30 || x > this.w - 30 || y < 30 || y > this.h - 30) {
      let dx = x - cx, dy = y - cy;
      if (pt.behind) { dx = -dx; dy = -dy; }
      const a = Math.atan2(dy, dx);
      const rx = this.w / 2 - 70, ry = this.h / 2 - 70;
      const k = Math.min(rx / Math.abs(Math.cos(a) || 1e-6), ry / Math.abs(Math.sin(a) || 1e-6));
      x = cx + Math.cos(a) * k; y = cy + Math.sin(a) * k;
      ctx.save(); ctx.translate(x, y); ctx.rotate(a);
      ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(-7, -8); ctx.lineTo(-7, 8); ctx.closePath(); ctx.fill();
      ctx.restore();
    } else {
      ctx.beginPath(); ctx.moveTo(x, y - 9); ctx.lineTo(x + 9, y); ctx.lineTo(x, y + 9); ctx.lineTo(x - 9, y); ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
    }
    const d = st.aim.distanceTo(this.game.camPos);
    const tx = Math.min(Math.max(x + 14, 8), this.w - 280);
    ctx.fillText(`NAV · ${st.aimLabel} · ${U.fmtDist(d)}`, tx, y - 4);
  }

  drawTarget(tgt) {
    const ctx = this.ctx;
    const pt = this.project(tgt.pos, {});
    const cx = this.w / 2, cy = this.h / 2;
    let x = pt.x, y = pt.y;
    const off = pt.behind || x < 20 || x > this.w - 20 || y < 20 || y > this.h - 20;
    ctx.strokeStyle = COL.tgt;
    ctx.fillStyle = COL.tgt;
    if (off) {
      let dx = x - cx, dy = y - cy;
      if (pt.behind) { dx = -dx; dy = -dy; }
      const a = Math.atan2(dy, dx);
      const rx = this.w / 2 - 40, ry = this.h / 2 - 40;
      const k = Math.min(rx / Math.abs(Math.cos(a) || 1e-6), ry / Math.abs(Math.sin(a) || 1e-6));
      x = cx + Math.cos(a) * k; y = cy + Math.sin(a) * k;
      ctx.save(); ctx.translate(x, y); ctx.rotate(a);
      ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(-6, -7); ctx.lineTo(-6, 7); ctx.closePath(); ctx.fill();
      ctx.restore();
    } else {
      ctx.beginPath(); ctx.moveTo(x, y - 12); ctx.lineTo(x + 12, y); ctx.lineTo(x, y + 12); ctx.lineTo(x - 12, y); ctx.closePath(); ctx.stroke();
    }
  }

  // the other players: a marker over each (at the screen's edge when out of
  // view) with how far away they are
  drawPlayers() {
    const g = this.game, me = g.player, ctx = this.ctx;
    if (!g.players || g.players.length < 2) return;
    const pt = {};
    const wp = this._pw || (this._pw = new THREE.Vector3());
    for (const q of g.players) {
      if (q === me || !q.body && !q.aboard) continue;
      q.worldPos(wp);
      const d = wp.distanceTo(g.camPos);
      // (over their head: their local up, or their craft's)
      const up = q.aboard ? _v2.set(0, 1, 0).applyQuaternion(q.vessel.quat) : _v2.copy(wp).sub(q.body.pos).normalize();
      wp.addScaledVector(up, 2.2);
      this.project(wp, pt);
      const cx = this.w / 2, cy = this.h / 2;
      let x = pt.x, y = pt.y;
      const off = pt.behind || x < 24 || x > this.w - 24 || y < 24 || y > this.h - 24;
      ctx.strokeStyle = ctx.fillStyle = COL.ok;
      if (off) {
        let dx = x - cx, dy = y - cy;
        if (pt.behind) { dx = -dx; dy = -dy; }
        const a = Math.atan2(dy, dx);
        const rx = this.w / 2 - 52, ry = this.h / 2 - 52;
        const k = Math.min(rx / Math.abs(Math.cos(a) || 1e-6), ry / Math.abs(Math.sin(a) || 1e-6));
        x = cx + Math.cos(a) * k; y = cy + Math.sin(a) * k;
        ctx.save(); ctx.translate(x, y); ctx.rotate(a);
        ctx.beginPath(); ctx.moveTo(9, 0); ctx.lineTo(-5, -6); ctx.lineTo(-5, 6); ctx.closePath(); ctx.fill();
        ctx.restore();
      } else {
        ctx.beginPath(); ctx.moveTo(x, y - 7); ctx.lineTo(x + 7, y); ctx.lineTo(x, y + 7); ctx.lineTo(x - 7, y); ctx.closePath(); ctx.stroke();
      }
      const where = q.aboard ? ` · ${q.vessel.name}` : '';
      ctx.textAlign = x > this.w - 160 ? 'right' : 'left';
      ctx.fillText(`P${q.index + 1}${where} · ${U.fmtDist(d)}`, x + (ctx.textAlign === 'right' ? -12 : 12), y);
      ctx.textAlign = 'left';
    }
  }

  drawSites() {
    const g = this.game, ctx = this.ctx;
    const body = g.player.currentBody();
    const res = g.settlements.get(body.id);
    if (!res) { g.requestSurvey(body, 60); return; }
    const pt = {};
    const wp = new THREE.Vector3();
    const boxes = []; // sites come best-ranked first; overlapping labels are dropped
    for (const s of res.sites) {
      const dir = wp.set(s.dir[0], s.dir[1], s.dir[2]);
      const h = body.groundHeight(dir);
      wp.multiplyScalar(body.R + Math.max(h, 0) + 30).applyQuaternion(body.q).add(body.pos);
      this.project(wp, pt);
      if (pt.behind || pt.x < 0 || pt.x > this.w || pt.y < 0 || pt.y > this.h) continue;
      // hide sites behind the planet's limb
      const toCam = g.camPos.clone().sub(wp);
      const nrm = wp.clone().sub(body.pos).normalize();
      if (toCam.dot(nrm) < -toCam.length() * 0.02 && toCam.length() > 2000) continue;
      const d = g.camPos.distanceTo(wp);
      ctx.strokeStyle = COL.ok; ctx.fillStyle = COL.ok;
      ctx.beginPath(); ctx.rect(pt.x - 5, pt.y - 5, 10, 10); ctx.stroke();
      const l1 = `${s.kind === 'city' ? 'SITE' : 'OUTPOST'} ${s.rank} · ${U.fmtDist(d)}`;
      const l2 = `${s.biome}${s.reasons.length ? ' · ' + s.reasons[0] : ''}`;
      const box = { x0: pt.x + 7, x1: pt.x + 11 + Math.max(ctx.measureText(l1).width, ctx.measureText(l2).width), y0: pt.y - 12, y1: pt.y + 15 };
      if (boxes.some((o) => box.x0 < o.x1 && box.x1 > o.x0 && box.y0 < o.y1 && box.y1 > o.y0)) continue;
      boxes.push(box);
      ctx.fillText(l1, pt.x + 9, pt.y - 4);
      ctx.fillStyle = 'rgba(106,222,143,0.75)';
      ctx.fillText(l2, pt.x + 9, pt.y + 9);
    }
  }

  // the cockpit displays of the shuttle you're in (anyone's)
  updateScreens() {
    const g = this.game, s = g.player.vessel;
    if (!(g.player.aboard && s && s.type.key === 'shuttle' && s.visual.drawScreens)) return;
    const body = s.body;
    const o = s.landed ? null : s.orbit();
    const C = { ok: '#6ade8f', cau: '#f1b43a', warn: '#ff5248', nav: '#e65bd9' };
    const P = s.env.pressure;
    s.visual.drawScreens({
      left: [
        ['ALT', fmtAlt(s.altitude)],
        ['RADAR', isFinite(s.agl) && s.agl < 20000 ? fmtAlt(Math.max(0, s.agl)) : '---'],
        ['SPD', U.fmtSpeed(s.surfaceVel(_v3).length())],
        ['FA', ASSIST_NAMES[s.assist], C.ok],
        ['PE', o ? fmtAlt(o.rp - body.R) : 'LANDED'],
        ['AP', o ? (o.bound ? fmtAlt(o.ra - body.R) : 'ESC') : '---'],
        ['WARP', '×' + g.warp, g.warp > 1 ? C.nav : undefined],
      ],
      right: [
        ['HULL', Math.round(s.hull * 100) + '%', s.hull < 0.5 ? C.warn : C.ok],
        ['PRESS', fmtP(P), P > s.hullRating * 0.8 ? C.warn : undefined],
        ['H TEMP', Math.round(s.hullTemp) + ' K', s.hullTemp > 1500 ? C.warn : undefined],
        ['GEAR', s.gear > 0.99 ? 'DOWN' : (s.gear < 0.01 ? 'UP' : 'MOVING')],
        ['RAMP', s.ramp > 0.99 ? 'OPEN' : (s.ramp < 0.01 ? 'SEALED' : 'MOVING'), s.ramp > 0.01 ? C.cau : C.ok],
        ['FTL', g.ftl.state.toUpperCase(), g.ftl.state === 'cruise' ? C.nav : undefined],
        ['BODY', body.data.name],
      ],
      wallTitle: `${body.data.name.toUpperCase()} · ${body.data.designation}`,
      wall: [
        body.data.label,
        `g ${(body.data.gravity / 9.81).toFixed(2)}  T ${Math.round(body.data.Tsurf)} K  ${body.atm ? fmtP(body.atm.pressure) : 'airless'}`,
        `day ${body.data.rotation.locked ? 'locked' : U.fmtTime(Math.abs(body.data.rotation.periodGame))}  ESI ${(body.data.esi || 0).toFixed(2)}`,
        body.data.life ? `life: ${body.data.life.level}` : (body.data.hydrosphere && body.data.hydrosphere.water === 'liquid' ? 'liquid water oceans' : ''),
      ],
    });
  }
}
