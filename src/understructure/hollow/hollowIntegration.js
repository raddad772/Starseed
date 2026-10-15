// The Hollow Moon in the game. Which moons (by rule, in any system: SOL is only a test bed): the largest solid
// moon of the first world that has hosted life is the founders' spinning one; one more of the system's
// sizeable solid moons is a still, abandoned hollow. Each has a gate at its north pole (on its spin axis,
// body-fixed y), an express lift from it down the founders' shaft through the crust, the moon's weight
// falling to nothing on the way, to the hub at the sphere's pole. Inside, the world (its scene, its physics)
// is everyone's; the walker, HUD and the rides are each player's own. Leave by the hub's lift.
import * as THREE from 'three';
import { hostedLife } from '../../gen/lifeHistory.js';
import { Rng } from '../../core/rng.js';
import { hollowWorld } from './hollowWorld.js';
import { buildHollowScene } from './hollowScene.js';
import { FieldWalker } from '../site/fieldWalker.js';

const MIN_R = 8000;            // (a moon at least this big, drawn: its sphere 1.2 km across)
const LIFT = 70;               // (the express lift's run down or up the shaft, s)
const CARRIAGE = 75;           // (a stairway's carriage, s)

// the system's hollow moons: { spinning, still } (bodies, or null)
export function hollowMoons(seed, bodies) {
  const moons = bodies.filter((b) => b.solid && b.data.kind === 'moon' && b.R >= MIN_R);
  const living = bodies.filter((b) => b.data.kind === 'planet' && hostedLife(b)).sort((a, c) => (a.data.orbit?.a || 0) - (c.data.orbit?.a || 0));
  let spinning = null;
  for (const p of living) { const ms = moons.filter((m) => m.parent === p).sort((a, c) => c.R - a.R); if (ms.length) { spinning = ms[0]; break; } }
  const rest = moons.filter((m) => m !== spinning);
  const still = rest.length ? Rng.fromString(`${seed}:still-hollow`).pick(rest) : null;
  return { spinning, still };
}

// the world part: made when someone first goes in, kept after
function hollowSiteWorld(site) {
  if (site.world) return site.world;
  const b = site.body, top = b.R + b.groundHeight(new THREE.Vector3(0, 1, 0));
  const w = hollowWorld(site.seed, { moonR: top, moonG: b.data.gravity || 1.6, still: site.still });
  site.world = { w, visual: buildHollowScene(w), top };
  return site.world;
}

export class HollowSession {
  constructor(game, player, site, sites) {
    this.game = game; this.player = player; this.site = site; this.sites = sites;
    const W = this.W = hollowSiteWorld(site), w = W.w;
    this.walker = new FieldWalker(W.visual.collision, { pos: [0.6, W.top - 3, 0], up: [0, 1, 0], fwd: [1, 0, 0] });
    this.hub = w.Rs - w.hubDepth * 0.6;
    this.ride = { kind: 'down', t: 0, dur: LIFT, from: [0.6, W.top - 3, 0], to: [0.6, this.hub, 0] };
    this.time = 0; this.flashlight = true; this.notice = ''; this.noticeUntil = 0;
    const camera = new THREE.PerspectiveCamera(73, 1, 0.1, 20000);
    this.view = { camera, width: 1, height: 1, rect: { x: 0, y: 0, w: 1, h: 1 }, meterRef: 0.18, maxExposure: 3, exposureBias: 1.3 };
    this.engine = { scene: W.visual.scene, view: this.view, minExposure: 0.05, pixelRatio: game.engine.pixelRatio, time: 0 };
    this.hud = new HollowHUD(player);
    player.ui.quick?.close?.(); player.ui.suit?.close?.();
    if (game.map?.open && game.map.owner === player) game.map.toggle(player);
    game.setWarp?.(0); player.jetOn = false; player.prompt = null; player.ui.root.style.visibility = 'hidden';
    this.toast(site.still ? "The founders' shaft, long dead · going down" : "The founders' shaft · going down");
  }

  toast(m) { if (!m) return; this.notice = m; this.noticeUntil = performance.now() + Math.max(3500, m.length * 70); }
  save() { /* (nothing of a player's kept yet) */ }
  get padMode() { return this.walker.gravity < 0.012 ? 'eva' : 'foot'; }

  // what F does here: the hub's lift up, or a stairway's carriage down or up
  offer() {
    if (this.ride) return null;
    const p = this.walker.pos, w = this.W.w;
    if (Math.hypot(p[0], p[2]) < 14 && p[1] > w.Rs - w.hubDepth - 4) return { text: 'Take the lift up to the surface', act: () => { this.ride = { kind: 'up', t: 0, dur: LIFT, from: p.slice(), to: [0.6, this.W.top - 3, 0] }; } };
    for (const s of this.W.visual.stairs) {
      const a = s.path[0], b = s.path.at(-1);
      if (Math.hypot(p[0] - a[0], p[1] - a[1], p[2] - a[2]) < 18) return { text: 'Ride the carriage down the cap', act: () => { this.ride = { kind: 'carriage', t: 0, dur: CARRIAGE, path: s.path }; } };
      if (Math.hypot(p[0] - b[0], p[1] - b[1], p[2] - b[2]) < 18) return { text: 'Ride the carriage up to the hub', act: () => { this.ride = { kind: 'carriage', t: 0, dur: CARRIAGE, path: s.path.slice().reverse() }; } };
    }
    return null;
  }

  update(dt, input, mouse) {
    const w = this.walker;
    w.turn(-mouse.dx); w.look(-mouse.dy);
    if (input.hit('KeyL')) { this.flashlight = !this.flashlight; this.toast(this.flashlight ? 'Hand light on' : 'Hand light off'); }
    if (input.hit('KeyF') || input.hit('KeyE')) { const o = this.offer(); if (o) o.act(); }
    if (this.ride) {
      const r = this.ride; r.t = Math.min(1, r.t + dt / r.dur);
      const e = r.t < 0.5 ? 2 * r.t * r.t : 1 - (2 - 2 * r.t) ** 2 / 2;
      if (r.path) {
        const f = e * (r.path.length - 1), i = Math.min(r.path.length - 2, Math.floor(f)), k = f - i, a = r.path[i], b = r.path[i + 1];
        const q = [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k], rho = Math.hypot(q[0], q[2]) || 1;
        w.pos = [q[0] - q[0] / rho * 1.2, q[1], q[2] - q[2] / rho * 1.2];
      } else w.pos = r.from.map((x, j) => x + (r.to[j] - x) * e);
      w.vel = [0, 0, 0]; w.step(0, {});
      const gv = this.W.visual.collision.fieldAt(w.pos); w.gravity = Math.hypot(...gv) / 9.81;
      if (r.t >= 1) {
        this.ride = null; w.grounded = false;
        if (r.kind === 'down') this.toast(this.W.w.still ? 'The hub: no weight, no light' : 'The hub: weightless on the axis · the stairways go down from its rim');
        if (r.kind === 'up') { this.leave(true); return; }
      }
    } else {
      w.step(dt, { forward: input.axis('KeyS', 'KeyW'), strafe: input.axis('KeyA', 'KeyD'), jump: input.down('Space'), up: input.down('Space'), down: input.down('KeyC'), brake: input.down('KeyR') || input.down('KeyX'), fast: input.down('ShiftLeft') || input.down('ShiftRight') });
    }
    this.time += dt;
    const a = w.takeAlert(); if (a) this.toast(a);
    // (where you are on the moon: its body-fixed frame is the site's, centred on it, its axis the spin's)
    const p = this.player, b = this.site.body;
    p.fPos.set(w.pos[0], w.pos[1], w.pos[2]); p.fVel.set(0, 0, 0); p.body = b;
    p.camPos.copy(p.fPos).applyQuaternion(b.q).add(b.pos);
  }

  render(first) {
    const { view, walker: w, player } = this;
    view.width = player.view.width; view.height = player.view.height; view.rect = player.view.rect;
    const c = view.camera; c.aspect = player.view.camera.aspect; c.fov = player.view.camera.fov; c.updateProjectionMatrix();
    c.position.set(...w.eye()); c.quaternion.copy(w.cameraQuaternion()); c.updateMatrixWorld();
    this.W.visual.update(c, this.time, { flashlight: this.flashlight });
    this.engine.time = this.time; this.engine.pixelRatio = this.game.engine.pixelRatio;
    this.game.engine.webgpu.render(this.engine, first);
    this.hud.update(this);
  }

  leave(restore = true) {
    const p = this.player;
    if (restore) { const dir = this.site.hatch.clone().normalize(); p.placeOnSurface(this.site.body, dir, new THREE.Vector3(1, 0, 0)); p.fade = 1; }
    p.understructure = null; p.ui.root.style.visibility = '';
    this.hud.dispose();
    this.game.engine.webgpu?.releaseView(this.view);
    this.game.engine.adaptReset = true;
    if (restore) p.ui.hud?.message?.("Up through the founders' gate", 'nav');
  }
}

// a player's HUD inside: how high over the land (or how deep in the shaft), the field, the prompt, messages
class HollowHUD {
  constructor(player) {
    this.player = player;
    const root = this.root = document.createElement('div');
    Object.assign(root.style, { position: 'fixed', pointerEvents: 'none', font: '12px ui-monospace, monospace', color: '#e3e9da', zIndex: 5 });
    root.innerHTML = '<div data-k="tele" style="position:absolute;right:24px;top:20px;text-align:right"></div><div data-k="prompt" style="position:absolute;left:50%;top:62%;transform:translateX(-50%);padding:10px 16px;background:#111b18db;border:1px solid #e3e9da30"></div><div data-k="toast" style="position:absolute;left:50%;bottom:110px;transform:translateX(-50%);padding:12px 20px;background:#162624ec;border-left:2px solid #e8b777;max-width:560px"></div>';
    document.body.append(root);
    this.k = Object.fromEntries([...root.querySelectorAll('[data-k]')].map((e) => [e.dataset.k, e]));
  }
  update(s) {
    const r = this.player.view.rect;
    Object.assign(this.root.style, { left: `${r.x}px`, top: `${r.y}px`, width: `${r.w}px`, height: `${r.h}px` });
    const p = s.walker.pos, w = s.W.w, rho = Math.hypot(p[0], p[2]);
    const where = p[1] > w.Rh ? `${(s.W.top - p[1]).toFixed(0)} m down the shaft` : `${(w.Rs - rho).toFixed(0)} m over the land · lat ${(Math.atan2(p[1], rho) * 180 / Math.PI).toFixed(1)}°`;
    this.k.tele.innerHTML = `${where}<br>field ${s.walker.gravity.toFixed(3)} g`;
    const o = s.offer(); this.k.prompt.style.display = o ? '' : 'none'; if (o) this.k.prompt.innerHTML = `<b style="color:#e8b777;padding-right:12px">${this.player.input.device === 'pad' ? 'X' : 'F'}</b>${o.text}`;
    const show = performance.now() < s.noticeUntil; this.k.toast.style.display = show ? '' : 'none'; if (show) this.k.toast.textContent = s.notice;
  }
  dispose() { this.root.remove(); }
}
