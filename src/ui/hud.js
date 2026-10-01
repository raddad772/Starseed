// Heads-up display: instrument clusters (DOM) and symbology (canvas).
// Colour semantics follow avionics practice: magenta = active nav,
// cyan = target / selected, green = engaged / OK, amber = caution, red = warning.

import * as THREE from 'three';
import * as U from '../core/units.js';
import { ASSIST_NAMES } from '../sim/ship.js';
import { lockRadius } from '../sim/ftl.js';

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

export class Hud {
  constructor(game) {
    this.game = game;
    this.canvas = $('hudCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.flight = $('flightData');
    this.nav = $('navData');
    this.strip = $('modeStrip');
    this.msgBox = $('messages');
    this.promptEl = $('prompt');
    this.loadingEl = $('loading');
    this.overlay = $('overlay');
    this.msgs = [];
    this.textTimer = 0;
    this.helpOn = false;
    this.resize();
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.dpr = dpr;
    this.w = window.innerWidth; this.h = window.innerHeight;
    this.canvas.width = this.w * dpr; this.canvas.height = this.h * dpr;
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

  setLoading(text) {
    if (!text) { this.loadingEl.hidden = true; return; }
    this.loadingEl.hidden = false;
    this.loadingEl.textContent = text;
  }

  toggleHelp() {
    this.helpOn = !this.helpOn;
    if (!this.helpOn) { this.overlay.hidden = true; this.overlay.innerHTML = ''; return; }
    this.overlay.hidden = false;
    this.overlay.innerHTML = `<div class="card"><h2>Controls</h2><div class="keys">
      <kbd>W A S D</kbd><span>Walk · ship: forward/back thrust, strafe</span>
      <kbd>Space / C</kbd><span>Jump, jetpack · ship: belly thrusters up / down</span>
      <kbd>Q / E</kbd><span>Roll (ship, EVA)</span><kbd>Shift</kbd><span>Sprint · boost</span>
      <kbd>X</kbd><span>Brake (FULL assist) · EVA stabiliser</span>
      <kbd>F</kbd><span>Interact: seat, ramp, board</span><kbd>Z</kbd><span>Flight assist OFF / ROT / FULL</span>
      <kbd>G / R / L</kbd><span>Gear · ramp · floodlights</span><kbd>J</kbd><span>FTL drive</span>
      <kbd>, / .</kbd><span>Time warp</span><kbd>M / Tab</kbd><span>System map · cycle target</span>
      <kbd>V</kbd><span>Chase camera</span><kbd>K</kbd><span>Settlement survey markers</span><kbd>B</kbd><span>Summon ship</span>
      <kbd>Right mouse / Alt</kbd><span>Free look from the pilot seat</span></div>
      <button id="closeHelp" type="button">Close</button></div>`;
    $('closeHelp').onclick = () => this.toggleHelp();
  }

  showDeath(cause, onRespawn) {
    this.overlay.hidden = false;
    this.overlay.innerHTML = `<div class="card"><h2 class="c-warn">Ship lost</h2><p>${cause}</p><button id="respawnBtn" class="primary" type="button">Restart at the landing site</button></div>`;
    const btn = $('respawnBtn');
    btn.onclick = () => { this.overlay.hidden = true; this.overlay.innerHTML = ''; onRespawn(); this.game.input.requestLock(); };
    this.game.input.releaseLock();
  }

  update(dt) {
    const g = this.game;
    for (const m of this.msgs) { m.t += dt; if (m.t > 6) m.el.style.opacity = '0'; }
    while (this.msgs.length && this.msgs[0].t > 7) this.msgs.shift().el.remove();
    if (g.state !== 'playing' || g.map.open) {
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      if (g.map.open) { this.flight.hidden = this.nav.hidden = true; this.strip.hidden = false; this.updateStrip(); }
      return;
    }
    this.flight.hidden = this.nav.hidden = this.strip.hidden = false;
    this.textTimer -= dt;
    if (this.textTimer <= 0) { this.textTimer = 0.1; this.updateText(); this.updateStrip(); }
    const p = g.player.prompt;
    if (p) { this.promptEl.hidden = false; this.promptEl.innerHTML = `<kbd>${p.key}</kbd>${p.text}`; } else this.promptEl.hidden = true;
    this.draw();
    this.updateScreens();
  }

  // -------------------------------------------------------------------- text

  state() {
    const g = this.game, s = g.ship, p = g.player;
    const piloting = p.mode === 'seat';
    const body = piloting || p.mode === 'ship' ? s.body : p.body;
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
    if (piloting || p.mode === 'ship') {
      const sv = s.surfaceVel(_v3);
      const up = _v.copy(s.pos).normalize();
      const vs = sv.dot(up);
      const gs = Math.sqrt(Math.max(0, sv.lengthSq() - vs * vs));
      row('Alt', body.giant ? fmtAlt(alt) + ' (1 bar)' : fmtAlt(alt));
      if (isFinite(s.agl) && s.agl < 20000) row('Radar', fmtAlt(Math.max(0, s.agl)), s.agl < 50 ? 'c-caution' : '');
      row('V/S', (vs >= 0 ? '+' : '') + vs.toFixed(vs > -100 && vs < 100 ? 1 : 0) + ' m/s', vs < -15 && s.agl < 2000 ? 'c-warn' : '');
      row('Gnd spd', U.fmtSpeed(gs));
      row('Orb spd', U.fmtSpeed(s.vel.length()));
      const prop = s.accel.clone().addScaledVector(s.pos, body.GM / Math.pow(s.pos.length(), 3));
      row('G-load', (s.landed ? 1 : prop.length() / 9.81).toFixed(2) + ' g');
      const lift = s.limits.belly / s.mass;
      row('Gravity', (gLocal / 9.81).toFixed(2) + ' g', gLocal > lift ? 'c-warn' : (gLocal > lift * 0.75 ? 'c-caution' : ''));
      if (gLocal > lift && !s.landed) row('Lift', gLocal > s.limits.main / s.mass ? 'NO ESCAPE THRUST' : 'NOSE UP: main drive', 'c-warn');
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
      if (p.mode === 'eva') row('Speed', U.fmtSpeed(p.eVel.clone().sub(s.vel).length()) + ' rel ship');
    }
    // local solar time
    if (body.solid && !body.data.rotation.locked) {
      const pf = (p.mode === 'surface' ? p.fPos.clone() : s.pos.clone().applyQuaternion(body.qInv)).normalize();
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
    if ((piloting || p.mode === 'ship') && !s.landed && g.ftl.state !== 'cruise') {
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
    nrow('Mission day', (g.t / 86400).toFixed(2));
    if (g.showSites) {
      const res = g.settlements.get(body.id);
      nrow('Survey', res ? `${res.sites.length} ${res.habitable ? 'city' : 'outpost'} sites` : 'surveying…', 'c-ok');
    }
    this.nav.innerHTML = `<h3>Navigation</h3><div class="rows">${nrows.join('')}</div>`;
  }

  updateStrip() {
    const g = this.game, s = g.ship, p = g.player;
    const chips = [];
    const chip = (t, cls = '') => chips.push(`<span class="chip ${cls}">${t}</span>`);
    if (p.mode === 'seat') {
      chip(`FA ${ASSIST_NAMES[s.assist]}`, s.assist === 0 ? 'caution' : 'on');
      if (s.assist === 2 && s.targetFrame === 'surface') { if (Math.abs(s.cruise) > 0.5) chip(`CRUISE ${U.fmtSpeed(s.cruise)}`, 'nav'); if (Math.abs(s.climb) > 0.3) chip(`CLIMB ${s.climb > 0 ? '+' : ''}${s.climb.toFixed(1)}`, 'nav'); if (s.heatLimited) chip('HEAT LIMIT', 'caution'); }
      else if (s.assist === 2 && s.targetVel.length() > 0.5) chip(`HOLD ${U.fmtSpeed(s.targetVel.length())}`, 'nav');
      chip(s.gear > 0.99 ? 'GEAR DN' : (s.gear < 0.01 ? 'GEAR UP' : 'GEAR ···'), s.gear > 0.99 ? 'on' : (s.gear < 0.01 ? '' : 'caution'));
      if (s.ramp > 0.01) chip(s.ramp > 0.99 ? 'RAMP OPEN' : 'RAMP ···', 'caution');
      if (g.shipVisual.floodOn) chip('LIGHTS', 'on');
      const f = g.ftl;
      const lock = f.massLock();
      if (f.state === 'cruise') chip('FTL CRUISE', 'nav');
      else if (f.state === 'spool') chip(`FTL ${f.timer.toFixed(1)}`, 'nav');
      else if (f.state === 'cooldown') chip(`FTL COOL ${f.timer.toFixed(0)}`, 'caution');
      else if (lock) chip('FTL LOCKED');
      else { const obs = f.pathObstruction(); chip(obs ? `FTL PATH ✕ ${obs.data.name.toUpperCase()}` : 'FTL READY', obs ? 'caution' : 'on'); }
      if (s.landed) chip('LANDED', 'on');
      if (g.camMode === 'chase') chip('CHASE CAM');
    } else {
      chip(p.mode === 'eva' ? 'EVA' : (p.mode === 'ship' ? 'ABOARD' : (p.swimming ? 'SWIMMING' : 'ON FOOT')), 'on');
      chip(`JET ${Math.round(p.jetFuel * 100)}%`, p.jetFuel < 0.2 ? 'caution' : '');
    }
    if (g.warp > 1) chip(`WARP ×${g.warp.toLocaleString()}`, 'nav');
    chip('H HELP');
    this.strip.innerHTML = chips.join('');
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
    const g = this.game, s = g.ship, p = g.player;
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
    this.drawBodyLabels();
    if (g.showSites) this.drawSites();
    if (piloting) {
      this.drawAttitude();
      this.drawStick();
      this.drawAltTape();
    }
    if (g.target) this.drawTarget(g.target);
  }

  drawStick() {
    const s = this.game.ship, ctx = this.ctx;
    const cx = this.w / 2, cy = this.h / 2;
    const r = 46;
    ctx.strokeStyle = 'rgba(230,239,243,0.12)';
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = COL.tgt;
    ctx.beginPath(); ctx.arc(cx + s.stick.x * r, cy + s.stick.y * r, 2.5, 0, Math.PI * 2); ctx.fill();
  }

  drawAttitude() {
    const g = this.game, s = g.ship, ctx = this.ctx;
    const body = s.body;
    const cx = this.w / 2, cy = this.h / 2;
    const up = _v2.copy(s.pos).normalize();
    // flight path marker: velocity relative to the surface (or orbital outside)
    const near = s.altitude < Math.max(body.atmHeight * 1.5, 60000);
    const vel = near ? s.surfaceVel(_v3) : _v3.copy(s.vel);
    if (vel.length() > 2) {
      const pt = this.project(_v.copy(g.camPos).addScaledVector(vel.normalize(), 1e6), {});
      if (!pt.behind) {
        ctx.strokeStyle = COL.ok;
        ctx.beginPath(); ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
        ctx.moveTo(pt.x - 14, pt.y); ctx.lineTo(pt.x - 6, pt.y); ctx.moveTo(pt.x + 6, pt.y); ctx.lineTo(pt.x + 14, pt.y);
        ctx.moveTo(pt.x, pt.y - 6); ctx.lineTo(pt.x, pt.y - 12);
        ctx.stroke();
      }
      const rp = this.project(_v.copy(g.camPos).addScaledVector(vel, -1e6), {});
      if (!rp.behind) {
        ctx.strokeStyle = COL.cau;
        ctx.beginPath(); ctx.arc(rp.x, rp.y, 6, 0, Math.PI * 2); ctx.moveTo(rp.x - 4, rp.y - 4); ctx.lineTo(rp.x + 4, rp.y + 4); ctx.moveTo(rp.x + 4, rp.y - 4); ctx.lineTo(rp.x - 4, rp.y + 4); ctx.stroke();
      }
    }
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
    const g = this.game, s = g.ship, ctx = this.ctx;
    const body = s.body;
    const x = this.w - 300, y0 = this.h * 0.28, y1 = this.h * 0.72;
    const alt = s.altitude;
    ctx.textAlign = 'left';
    if (body.giant) {
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
    const vs = s.surfaceVel(_v3).dot(up);
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
    marks.sort((a, b) => a.rank - b.rank);
    const boxes = [];
    for (const m of marks) {
      const isT = g.target === m.b;
      ctx.fillStyle = isT ? COL.tgt : 'rgba(230,239,243,0.7)';
      ctx.strokeStyle = ctx.fillStyle;
      ctx.beginPath(); ctx.arc(m.x, m.y, 3, 0, Math.PI * 2); ctx.stroke();
      // de-clutter: a label that would overlap a higher-ranked one is dropped
      const text = `${m.b.data.name}  ${U.fmtDist(m.d)}`;
      const box = { x0: m.x + 6, x1: m.x + 10 + ctx.measureText(text).width, y0: m.y - 8, y1: m.y + 8 };
      if (boxes.some((o) => box.x0 < o.x1 && box.x1 > o.x0 && box.y0 < o.y1 && box.y1 > o.y0)) continue;
      boxes.push(box);
      ctx.fillText(text, m.x + 8, m.y);
    }
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

  updateScreens() {
    const g = this.game, s = g.ship;
    const body = s.body;
    const o = s.landed ? null : s.orbit();
    const C = { ok: '#6ade8f', cau: '#f1b43a', warn: '#ff5248', nav: '#e65bd9' };
    const P = s.env.pressure;
    g.shipVisual.drawScreens({
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
