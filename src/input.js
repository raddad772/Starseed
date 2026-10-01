// Keyboard / mouse / gamepad state with per-frame edge detection and pointer
// lock. A gamepad's buttons stand in for keyboard keys (see padLayout.js), so
// the game reads one set of controls whatever is in your hands.

import { BTN, PAD_LAYOUT, leftStickAxes } from './padLayout.js';

export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.hits = new Set();
    this.wheel = 0;
    this.buttons = 0;
    this.clicks = 0;
    this.locked = false;
    this.enabled = true;
    this.sensitivity = 1;
    this.invertY = false;
    this.cx = 0; this.cy = 0;         // cursor, client px (target picking when not captured)
    this.cursorIn = false;
    // Look movement is gathered twice. Safari drops mousemove events while
    // the page is busy, and the movement in a dropped event is lost (WebKit
    // bug 235116), so on a heavy frame the view turns only a fraction of the
    // way. Its pointermove events now keep the motion they replaced as
    // coalesced events. Each frame uses whichever source saw more movement:
    // a lossy source can only read low.
    this.mSum = [0, 0]; this.pSum = [0, 0];
    // gamepad
    this.pad = null;          // the Gamepad in use (null when none)
    this.padKeys = new Set(); // keys its buttons hold down this frame
    this.padAxes = {};        // 'KeyS|KeyW' -> analog left-stick value
    this.padLook = { x: 0, y: 0 }; // right stick, shaped (flight: the stick itself)
    this.padPrev = [];
    this.padDt = 0;
    this.padMode = 'foot';
    this.lb = { down: false, t: 0, used: false };
    this.onPadPause = null;
    this.padLookRate = 2.8;   // rad/s at full deflection, on foot
    this.stats = { m: 0, p: 0, mPx: 0, pPx: 0, t0: performance.now(), rate: null, src: 'mousemove' };
    window.addEventListener('keydown', (e) => {
      if (!this.enabled) return;
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (!e.repeat) this.hits.add(e.code);
      this.keys.add(e.code);
      if (['Space', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyF'].includes(e.code)) e.preventDefault();
    });
    window.addEventListener('keyup', (e) => { this.keys.delete(e.code); });
    window.addEventListener('blur', () => { this.keys.clear(); this.buttons = 0; });
    window.addEventListener('mousemove', (e) => {
      if (!this.enabled) return;
      this.cx = e.clientX; this.cy = e.clientY; this.cursorIn = true;
      if (this.locked || this.buttons & 2) {
        this.mSum[0] += e.movementX; this.mSum[1] += e.movementY;
        this.stats.m++; this.stats.mPx += Math.abs(e.movementX) + Math.abs(e.movementY);
      }
    });
    window.addEventListener('pointermove', (e) => {
      if (!this.enabled || e.pointerType !== 'mouse' || !(this.locked || this.buttons & 2)) return;
      const list = e.getCoalescedEvents ? e.getCoalescedEvents() : null;
      const evs = list && list.length ? list : [e];
      for (const c of evs) {
        const x = c.movementX || 0, y = c.movementY || 0;
        this.pSum[0] += x; this.pSum[1] += y;
        this.stats.pPx += Math.abs(x) + Math.abs(y);
      }
      this.stats.p += evs.length;
    });
    document.addEventListener('mouseleave', () => { this.cursorIn = false; });
    window.addEventListener('blur', () => { this.cursorIn = false; });
    canvas.addEventListener('mousedown', (e) => {
      this.buttons |= (1 << e.button);
      if (e.button === 0) this.clicks++;
    });
    window.addEventListener('mouseup', (e) => { this.buttons &= ~(1 << e.button); });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    canvas.addEventListener('wheel', (e) => { this.wheel += Math.sign(e.deltaY); e.preventDefault(); }, { passive: false });
    document.addEventListener('pointerlockchange', () => { this.locked = document.pointerLockElement === canvas; });
  }

  // OS-adjusted movement: the pointer speed and acceleration you are used to
  // (raw counts skip macOS acceleration and make looking around sluggish)
  requestLock() {
    try {
      const p = this.canvas.requestPointerLock();
      if (p && p.catch) p.catch(() => {});
    } catch (e) { /* pointer lock is optional: right-drag still looks around */ }
  }
  releaseLock() { if (document.pointerLockElement) document.exitPointerLock(); }

  down(code) { return this.keys.has(code) || this.padKeys.has(code); }
  hit(code) { return this.hits.has(code); }
  // keys give -1/0/1; a stick bound to the same pair adds its analog value
  axis(neg, pos) {
    let v = (this.down(pos) ? 1 : 0) - (this.down(neg) ? 1 : 0);
    const a = this.padAxes[neg + '|' + pos], b = this.padAxes[pos + '|' + neg];
    if (a) v += a; else if (b) v -= b;
    return Math.max(-1, Math.min(1, v));
  }

  // Read the first connected gamepad (once per frame, before the game reads
  // input). mode: 'flight' (seated), 'foot', 'eva' picks the layout.
  pollPad(mode, dt) {
    this.padKeys.clear();
    this.padAxes = {};
    this.padLook.x = this.padLook.y = 0;
    this.padMode = mode;
    this.padDt = dt;
    let gp = null;
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const p of pads) if (p && p.connected && p.mapping === 'standard') { gp = p; break; }
    if (!gp) for (const p of pads) if (p && p.connected && p.buttons.length >= 16 && p.axes.length >= 4) { gp = p; break; }
    if (!gp) { this.pad = null; this.padPrev.length = 0; return; }
    if (!this.pad) this.padPrev.length = 0;
    this.pad = gp;
    if (!this.enabled) return;
    const pressed = (i) => { const b = gp.buttons[i]; return !!b && (b.pressed || b.value > 0.4); };
    const L = PAD_LAYOUT[mode];
    for (const [name, i] of Object.entries(BTN)) {
      const now = pressed(i), was = !!this.padPrev[i];
      this.padPrev[i] = now;
      if (name === 'LB') continue;
      if (name === 'START') { if (now && !was && this.onPadPause) this.onPadPause(); continue; }
      const m = L.buttons[name];
      if (!m || !now) continue;
      this.padKeys.add(m[0]);
      if (!was) this.hits.add(m[0]);
    }
    // sticks: radial dead zone, rescaled to full range
    const dz = (x, y, d) => { const r = Math.hypot(x, y); if (r < d) return [0, 0]; const k = Math.min(1, (r - d) / (1 - d)) / r; return [x * k, y * k]; };
    const [lx, ly] = dz(gp.axes[0] || 0, gp.axes[1] || 0, 0.14);
    const [rx, ry] = dz(gp.axes[2] || 0, gp.axes[3] || 0, 0.12);
    // LB: held, it shifts the left stick; tapped (no stick use), next target
    const lbNow = pressed(BTN.LB);
    if (lbNow && !this.lb.down) { this.lb.t = performance.now(); this.lb.used = false; }
    if (lbNow && Math.hypot(lx, ly) > 0.3) this.lb.used = true;
    if (!lbNow && this.lb.down && !this.lb.used && performance.now() - this.lb.t < 350) this.hits.add('Tab');
    this.lb.down = lbNow;
    for (const [key, [c, sgn]] of Object.entries(leftStickAxes(mode, lbNow))) this.padAxes[key] = (c === 'x' ? lx : ly) * sgn;
    // right stick, shaped for fine aim near the centre
    const shape = (v) => Math.sign(v) * (0.35 * Math.abs(v) + 0.65 * Math.abs(v) ** 3);
    this.padLook.x = shape(rx);
    this.padLook.y = shape(ry) * (this.invertY ? -1 : 1);
  }
  // Look deltas (radians) for this frame
  mouse() {
    const m = Math.abs(this.mSum[0]) + Math.abs(this.mSum[1]);
    const p = Math.abs(this.pSum[0]) + Math.abs(this.pSum[1]);
    const src = p > m ? this.pSum : this.mSum;
    const s = 0.003 * this.sensitivity;
    const r = { dx: src[0] * s, dy: src[1] * s * (this.invertY ? -1 : 1) };
    // on foot / spacewalking the right stick turns the view at a rate (in
    // flight it is the stick itself: see Game.pilotControls)
    if (this.padMode !== 'flight' && (this.padLook.x || this.padLook.y)) {
      const k = this.padLookRate * Math.min(this.padDt, 0.1) * Math.sqrt(this.sensitivity);
      r.dx += this.padLook.x * k;
      r.dy += this.padLook.y * k * 0.75;
    }
    this.mSum[0] = this.mSum[1] = this.pSum[0] = this.pSum[1] = 0;
    // once a second of looking around: events and travel per source (pause menu)
    const st = this.stats, now = performance.now();
    if (m || p) st.src = p > m ? 'pointer (coalesced)' : 'mousemove';
    if (now - st.t0 > 1000) {
      const k = 1000 / (now - st.t0);
      if (st.m || st.p) st.rate = { m: st.m * k, p: st.p * k, mPx: st.mPx * k, pPx: st.pPx * k, src: st.src };
      st.m = st.p = st.mPx = st.pPx = 0; st.t0 = now;
    }
    return r;
  }
  endFrame() { this.hits.clear(); this.wheel = 0; this.clicks = 0; }
}
