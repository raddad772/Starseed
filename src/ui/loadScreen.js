// A loading screen on arriving somewhere: the game's start, and any jump that carries the camera kilometres
// in a frame near a world (a warp's end, a respawn). The view is hidden behind a bar until the ground round
// the camera is in (its tiles, the terrain's chunks, the workers' jobs: what tools/scenic.js drain waits on),
// not the wrong terrain refining before you (Dave: "there's not much point seeing all the wrong terrain").
// Its progress: the share of the most work outstanding since it began that's done (never going back). Any
// key or click skips it; 90 s at most. None for tests (game.debugFree, ?loadscreen=0).

const MAX_MS = 90000, SETTLE_MS = 600, JUMP_M = 4000, NEAR_M = 60000;

export class LoadScreen {
  constructor(game) {
    this.game = game;
    this.off = typeof location !== 'undefined' && /[?&]loadscreen=0/.test(location.search);
    this.active = false;
    this.last = null;
    const el = this.el = document.createElement('div');
    el.style.cssText = 'position:fixed;inset:0;z-index:50;display:none;background:#05070b;color:#c9d3e0;font:15px system-ui,sans-serif;'
      + 'align-items:center;justify-content:center;flex-direction:column;gap:14px;cursor:default;user-select:none';
    el.innerHTML = '<div style="letter-spacing:.08em;opacity:.85">Arriving</div>'
      + '<div style="width:min(420px,70vw);height:6px;border-radius:3px;background:#1a2230;overflow:hidden"><div data-bar style="height:100%;width:0;background:#7fa7d9;transition:width .25s"></div></div>'
      + '<div data-note style="font-size:12px;opacity:.5">the ground round you coming in · any key to skip</div>';
    this.bar = el.querySelector('[data-bar]');
    document.body.appendChild(el);
    const skip = () => { if (this.active) this.end(); };
    window.addEventListener('keydown', skip, true);
    el.addEventListener('pointerdown', skip);
  }

  begin() {
    if (this.off || (this.game && this.game.debugFree)) return;
    this.active = true; this.t0 = performance.now(); this.most = 0; this.frac = 0; this.quietAt = 0;
    this.bar.style.width = '0';
    this.el.style.display = 'flex';
  }

  end() { this.active = false; this.el.style.display = 'none'; }

  // the work outstanding for the ground round the camera
  outstanding() {
    const g = this.game;
    let n = g.pool && g.pool.pending ? g.pool.pending.size : 0;
    if (g.tiles) n += (g.tiles.missing || 0) + (g.tiles.pending ? g.tiles.pending.size : 0);
    const b = g.universe && g.camPos ? g.universe.dominantBody(g.camPos) : null;
    const it = b && g.world && g.world.items.find((i) => i.body === b);
    if (it && it.terrain) n += it.terrain.pendingCount || 0;
    return n;
  }

  // each frame, after the game's
  update() {
    const g = this.game;
    if (!g || this.off) return;
    if (g.debugFree) { if (this.active) this.end(); return; }
    // (a jump: the camera kilometres from where it was a frame ago, near a world's ground)
    const p = g.camPos;
    if (p) {
      if (this.last && !this.active && this.last.distanceTo(p) > JUMP_M) {
        const b = g.universe.dominantBody(p);
        if (b && b.solid && p.distanceTo(b.pos) - b.R < NEAR_M) this.begin();
      }
      this.last = this.last ? this.last.copy(p) : p.clone();
    }
    if (!this.active) return;
    const now = performance.now(), n = this.outstanding();
    this.most = Math.max(this.most, n);
    this.frac = Math.max(this.frac, this.most > 0 ? 1 - n / this.most : 0);
    this.bar.style.width = (this.frac * 100).toFixed(1) + '%';
    if (n > 0) this.quietAt = 0;
    else if (!this.quietAt) this.quietAt = now;
    if ((this.quietAt && now - this.quietAt > SETTLE_MS) || now - this.t0 > MAX_MS) this.end();
  }
}
