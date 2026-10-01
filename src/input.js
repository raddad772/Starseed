// Keyboard / mouse state with per-frame edge detection and pointer lock.

export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.hits = new Set();
    this.mdx = 0; this.mdy = 0;
    this.wheel = 0;
    this.buttons = 0;
    this.clicks = 0;
    this.locked = false;
    this.enabled = true;
    this.sensitivity = 1;
    this.invertY = false;
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
      if (this.locked) { this.mdx += e.movementX; this.mdy += e.movementY; }
      else if (this.buttons & 2) { this.mdx += e.movementX; this.mdy += e.movementY; }
    });
    canvas.addEventListener('mousedown', (e) => {
      this.buttons |= (1 << e.button);
      if (e.button === 0) this.clicks++;
    });
    window.addEventListener('mouseup', (e) => { this.buttons &= ~(1 << e.button); });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    canvas.addEventListener('wheel', (e) => { this.wheel += Math.sign(e.deltaY); e.preventDefault(); }, { passive: false });
    document.addEventListener('pointerlockchange', () => { this.locked = document.pointerLockElement === canvas; });
  }

  requestLock() {
    try {
      const p = this.canvas.requestPointerLock({ unadjustedMovement: true });
      if (p && p.catch) p.catch(() => { try { const q = this.canvas.requestPointerLock(); if (q && q.catch) q.catch(() => {}); } catch (e) { /* optional */ } });
    } catch (e) { /* pointer lock is optional */ }
  }
  releaseLock() { if (document.pointerLockElement) document.exitPointerLock(); }

  down(code) { return this.keys.has(code); }
  hit(code) { return this.hits.has(code); }
  axis(neg, pos) { return (this.down(pos) ? 1 : 0) - (this.down(neg) ? 1 : 0); }
  mouse() {
    const s = 0.0022 * this.sensitivity;
    const r = { dx: this.mdx * s, dy: this.mdy * s * (this.invertY ? -1 : 1) };
    this.mdx = 0; this.mdy = 0;
    return r;
  }
  endFrame() { this.hits.clear(); this.wheel = 0; this.clicks = 0; }
}
