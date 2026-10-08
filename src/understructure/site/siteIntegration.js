// Megastructure sites in the game. One per living planet (PlanetSurveySites),
// entered by the later visitors' hatch and lift, which only goes down. A site sits in the planet's
// own frame under its hatch: inside, a player is physically there (their
// body-fixed position follows them through it), and leaves by the hatch lift
// or by the founders' lift, which comes up at its own gate wherever its shaft
// meets the surface. The structure, its gates and its finds are the world's
// (shared by everyone there); the walker, compass, map, sound and HUD are each
// player's own.
import * as THREE from 'three';
import { planSite } from '../plan/sitePlan.js';
import { compileSite } from '../plan/compile.js';
import { inside } from '../plan/geom2.js';
import { buildSiteScene } from './siteScene.js';
import { SiteWalker } from './siteWalker.js';
import { SiteMechanisms } from './siteMechanisms.js';
import { SiteGuide } from './siteGuide.js';
import { SiteCompass } from './siteCompass.js';
import { SiteMap } from './siteMap.js';
import { SiteSound } from './siteSound.js';
import { PlanetSurveySites } from '../planetSites.js';
import { surveyEnvironment } from '../generatorHall.js';
import { bankRecovery } from '../recovery.js';
import { THEME_NAMES } from '../plan/themes.js';

const LIFT_DOWN = 6, LIFT_UP = 6; // (up: the founders' lift)
const credit = (r) => Math.min(170, Math.min(r, 100) + 3 * Math.max(0, r - 100));

// the site's frame on the planet: local x right, y up, z back from the hatch's heading
function hatchFrame(body, dir, heading) {
  const up = dir.clone().normalize();
  const forward = heading.clone().addScaledVector(up, -heading.dot(up)).normalize();
  const right = forward.clone().cross(up).normalize();
  const rot = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(right, up, forward.clone().negate()));
  return { up, rot, hatch: up.clone().multiplyScalar(body.R + body.groundHeight(up) + 0.06) };
}

function hatchMarker(color = 0xd8b377) {
  const root = new THREE.Group();
  const metal = new THREE.MeshStandardMaterial({ color: 0x3a4446, roughness: 0.7, metalness: 0.4 });
  const glow = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.5 });
  const box = (w, h, d, x, y, z, m) => { const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); mesh.position.set(x, y, z); root.add(mesh); };
  // a dark hatch in a frame, a thin lit rim, and a pennant to find it by
  box(3.4, 0.25, 3.4, 0, 0.12, 0, metal); box(2.4, 0.08, 2.4, 0, 0.28, 0, metal);
  for (const [w, d, x, z] of [[2.5, 0.05, 0, 1.22], [2.5, 0.05, 0, -1.22], [0.05, 2.5, 1.22, 0], [0.05, 2.5, -1.22, 0]]) box(w, 0.03, d, x, 0.33, z, glow);
  box(0.08, 3.2, 0.08, 1.9, 1.6, 1.9, metal); box(0.8, 0.3, 0.03, 2.3, 3.0, 1.9, glow);
  return root;
}

export class SurfaceSites {
  constructor(game) {
    this.game = game; this.sites = [];
    this.planetSites = new PlanetSurveySites(game.seed, { storage: game.campaignStorage });
    this.saveAll = () => { for (const p of game.players) p.understructure?.save(); };
    addEventListener('pagehide', this.saveAll);
  }

  // the planet's site, found near this player on first arrival (as the survey did)
  addNear(player) {
    const b = player.body;
    const old = this.sites.find((s) => s.body.id === b.id);
    if (old) return old;
    const entrance = this.planetSites.get(b, () => {
      const up = player.fPos.clone().normalize(), away = player.heading.clone().negate(), right = away.clone().cross(up).normalize();
      const height = b.groundHeight(up);
      for (const distance of [14, 20, 28]) for (const angle of [0, 0.7, -0.7, 1.4, -1.4]) {
        const dir = player.fPos.clone().addScaledVector(away, distance * Math.cos(angle)).addScaledVector(right, distance * Math.sin(angle)).normalize();
        if (!b.isWaterAt(dir) && Math.abs(b.groundHeight(dir) - height) < 2) return { dir: dir.toArray(), heading: away.toArray() };
      }
      return null;
    });
    if (!entrance) return null;
    const dir = new THREE.Vector3(...entrance.dir), heading = new THREE.Vector3(...entrance.heading);
    const f = hatchFrame(b, dir, heading);
    const seed = `${this.game.seed}-${b.id}-${dir.toArray().map((x) => Math.round(x * 1e6)).join('-')}`;
    const env = surveyEnvironment(b.data);
    const plan = planSite(seed, { environment: { water: env.wet } });
    // the breach room right under the hatch
    const st = plan.nodes.find((n) => n.id === 'staging');
    const origin = f.hatch.clone().sub(new THREE.Vector3(st.center[0], plan.surfaceY, st.center[1]).applyQuaternion(f.rot));
    // (frame: the hatch and its heading, as campaign saves record a site)
    const site = { body: b, plan, seed, rot: f.rot, origin, saveKey: `starseed.site.v1.${encodeURIComponent(seed)}`, hatch: f.hatch, frame: { position: f.hatch, rotation: f.rot }, marker: hatchMarker() };
    // where the founders' shaft meets the surface: their gate
    const ac = plan.access.center, top = this.toBody(site, [ac[0], plan.surfaceY, ac[1]]).normalize();
    site.gate = top.clone().multiplyScalar(b.R + b.groundHeight(top) + 0.06);
    site.gateMarker = hatchMarker(0xc9a2ff);
    this.sites.push(site);
    this.game.engine.scene.add(site.marker, site.gateMarker);
    const terrain = this.game.world.terrainOf(b.id);
    terrain?.addClearing(f.up.clone().multiplyScalar(b.R), 6);
    terrain?.addClearing(top.clone().multiplyScalar(b.R), 6);
    return site;
  }

  toBody(site, local, out = new THREE.Vector3()) { return out.set(local[0], local[1], local[2]).applyQuaternion(site.rot).add(site.origin); }
  toLocal(site, bodyPos) { const v = bodyPos.clone().sub(site.origin).applyQuaternion(site.rot.clone().invert()); return [v.x, v.y, v.z]; }

  nearest(p) {
    if (p.mode !== 'surface' || p.understructure) return null;
    let best = null, distance = Infinity;
    for (const s of this.sites) if (s.body === p.body) { const d = s.hatch.distanceTo(p.fPos); if (d < distance) { best = s; distance = d; } }
    return distance < 120 ? { site: best, distance } : null;
  }

  interact(p, input) {
    const near = this.nearest(p);
    if (!near || near.distance > 4 || !p.grounded || !input.hit('KeyF')) return false;
    if (!this.game.engine.webgpu) { this.game.message('Renderer is still preparing.'); return true; }
    p.understructure = new SiteSession(this.game, p, near.site, this);
    return true;
  }

  // (in survey mode a hatch stays hidden until someone has walked within 12 m of it)
  revealed(site) { return this.game.campaignStorage?.getItem(`starseed.survey.reveal.${site.saveKey}`) === 'true'; }
  hidden(site) { return this.game.campaign?.rules?.exploration === 'survey' && !this.revealed(site); }

  prompt(p) {
    const near = this.nearest(p);
    if (near && this.hidden(near.site)) return;
    if (near && !p.prompt) p.prompt = { key: near.distance <= 4 ? 'F' : null, text: near.distance <= 4 ? 'Take the lift down' : `Hatch · ${Math.round(near.distance)} m` };
  }

  render(camPos) {
    for (const s of this.sites) {
      if (this.game.players.some((p) => p.mode === 'surface' && p.body === s.body && p.fPos.distanceTo(s.hatch) < 12)) this.game.campaignStorage?.setItem(`starseed.survey.reveal.${s.saveKey}`, 'true');
      s.marker.visible = !this.hidden(s);
      for (const [m, at] of [[s.marker, s.hatch], [s.gateMarker, s.gate]]) {
        m.position.copy(at).applyQuaternion(s.body.q).add(s.body.pos).sub(camPos);
        m.quaternion.copy(s.body.q).multiply(s.rot);
      }
    }
  }

  dispose() {
    removeEventListener('pagehide', this.saveAll);
    for (const p of this.game.players) p.understructure?.leave(false);
    for (const s of this.sites) { s.marker.removeFromParent(); s.gateMarker.removeFromParent(); }
    this.sites.length = 0;
  }
}

// The world's part of a site: built when someone first goes in, kept after.
function siteWorld(site, storage) {
  if (site.world) return site.world;
  let saved = {}; try { saved = JSON.parse(storage.getItem(site.saveKey) || '{}'); } catch { /* */ }
  const compiled = compileSite(site.plan), visual = buildSiteScene(site.plan, compiled);
  const mech = new SiteMechanisms(compiled, visual.collision, visual.root, visual.mat, saved.mech || {});
  site.world = { compiled, visual, mech, collected: new Set(saved.collected || []), tickAt: -1, saved };
  return site.world;
}

export class SiteSession {
  constructor(game, player, site, sites) {
    this.game = game; this.player = player; this.site = site; this.sites = sites;
    this.storage = game.campaignStorage || localStorage;
    this.ledgerKey = `starseed.golden-path.${new URLSearchParams(location.search).has('surveyTest') ? 'test' : 'campaign'}.v1`;
    const w = this.w = siteWorld(site, this.storage), plan = site.plan;
    const st = plan.nodes.find((n) => n.id === 'staging');
    this.walker = new SiteWalker(w.visual.collision, { pos: [st.center[0], plan.surfaceY - 1.2, st.center[1]], yaw: w.compiled.spawn.yaw });
    this.ride = { kind: 'down', t: 0, from: plan.surfaceY - 1.2, to: st.y0, x: st.center[0], z: st.center[1] };
    this.guide = new SiteGuide(plan); this.map = new SiteMap(plan, w.compiled, w.saved.map || {});
    this.sound = new SiteSound(plan, w.compiled);
    this.time = 0; this.lastSave = 0; this.flashlight = true; this.notice = ''; this.noticeUntil = 0;
    const camera = new THREE.PerspectiveCamera(73, 1, 0.08, 3200); camera.rotation.order = 'YXZ';
    this.view = { camera, width: 1, height: 1, rect: { x: 0, y: 0, w: 1, h: 1 }, meterRef: 0.18, maxExposure: 3, exposureBias: 1.3 };
    this.engine = { scene: w.visual.scene, view: this.view, minExposure: 0.05, pixelRatio: game.engine.pixelRatio, time: 0 };
    this.hud = new SiteHUD(player);
    player.ui.quick?.close?.(); player.ui.suit?.close?.();
    if (game.map?.open && game.map.owner === player) game.map.toggle(player);
    game.setWarp?.(0); player.jetOn = false; player.prompt = null; player.ui.root.style.visibility = 'hidden';
    this.sound.unlock();
    this.toast(`${plan.themes.map((t) => THEME_NAMES[t]).join(' + ')} · going down`, false);
  }

  raw() { return [...this.w.collected].reduce((s, id) => s + (this.site.plan.finds.find((f) => f.id === id)?.units || 0), 0); }
  toast(m, speak = true) { if (!m) return; this.notice = m; this.noticeUntil = performance.now() + Math.max(3500, m.length * 70); if (speak) this.sound.say(m, m); }

  save() {
    try { this.storage.setItem(this.site.saveKey, JSON.stringify({ collected: [...this.w.collected], mech: this.w.mech.save(), map: this.map.save() })); } catch { /* */ }
    const r = bankRecovery(this.storage, this.ledgerKey, this.site.saveKey, this.raw());
    if (r.newLead) this.toast('Golden Path: a new lead');
  }

  offer() {
    const p = this.walker.pos, plan = this.site.plan;
    if (this.ride) return null;
    let best = null, bd = 2.4;
    for (const f of plan.finds) {
      if (this.w.collected.has(f.id) || f.kind === 'entry-scan') continue;
      const d = Math.hypot(f.pos[0] - p[0], (f.pos[1] - p[1]) * 0.6, f.pos[2] - p[2]);
      if (d < bd) { bd = d; best = f; }
    }
    const m = this.w.mech.offer(p);
    if (m && (!best || bd > 1.2)) return { type: 'mech', text: m.text, act: m.act };
    if (best) return { type: 'find', find: best, text: best.kind === 'record' ? 'Take the site record' : best.kind === 'crawler' ? 'Pull data from the crawler' : 'Take the data shard' };
    const acc = plan.nodes.find((n) => n.id === 'access'), rec = plan.finds.find((f) => f.kind === 'record');
    if (Math.abs(p[1] - acc.y0) < 1 && inside([p[0], p[2]], plan.access.poly, 0)) return this.w.collected.has(rec.id) ? { type: 'founders', text: "Take the founders' lift up" } : { type: 'sealed', text: 'Lift sealed: needs the site record' };
    return null;
  }

  interact() {
    const o = this.offer();
    if (!o) return;
    if (o.type === 'mech') { const msg = o.act(); this.toast(msg, /open|lit|aligned|restored|unsealed/i.test(msg)); this.save(); return; }
    if (o.type === 'find') {
      const before = credit(this.raw()); this.w.collected.add(o.find.id); const r = this.raw();
      if (o.find.kind === 'record') this.toast(`Site record +${o.find.units} · founders' lift unlocked`);
      else this.toast(`Data +${credit(r) - before} · site ${r}% · credit ${credit(r)}/170`, false);
      this.save(); return;
    }
    if (o.type === 'founders') { const a = this.site.plan.access; this.ride = { kind: 'founders', t: 0, from: this.walker.pos[1], to: a.y0 + 34, x: this.walker.pos[0], z: this.walker.pos[2] }; return; }
    this.toast(o.text, false);
  }

  // (the controller's layout inside: spacewalk's in zero-g, A up and B down)
  get padMode() { return this.walker && this.walker.gravity === 0 ? 'eva' : 'foot'; }

  update(dt, input, mouse) {
    const w = this.walker;
    w.yaw -= mouse.dx; w.pitch = THREE.MathUtils.clamp(w.pitch - mouse.dy, -1.45, 1.45);
    // (the game's keys on foot: F (a controller's X) uses, L (LT) the hand light; E uses too)
    if (input.hit('KeyL')) { this.flashlight = !this.flashlight; this.toast(this.flashlight ? 'Hand light on' : 'Hand light off', false); }
    if (input.hit('KeyF') || input.hit('KeyE')) this.interact();
    if (this.ride) {
      const r = this.ride, dur = r.kind === 'down' ? LIFT_DOWN : LIFT_UP;
      r.t = Math.min(1, r.t + dt / dur);
      const e = r.t < 0.5 ? 2 * r.t * r.t : 1 - (2 - 2 * r.t) ** 2 / 2;
      w.pos = [r.x, r.from + (r.to - r.from) * e, r.z]; w.vel = [0, 0, 0];
      if (r.t >= 1) {
        if (r.kind === 'down') {
          this.ride = null; w.grounded = true; w.safe = { pos: w.pos.slice(), yaw: w.yaw };
          const scan = this.site.plan.finds.find((f) => f.kind === 'entry-scan');
          if (scan && !this.w.collected.has(scan.id)) { this.w.collected.add(scan.id); this.toast('Entry scan: data +1'); this.save(); }
        }
        else { this.leave(true, r.kind === 'founders' ? this.site.gate : this.site.hatch); return; }
      }
    } else {
      w.step(dt, { forward: input.axis('KeyS', 'KeyW'), strafe: input.axis('KeyA', 'KeyD'), jump: input.down('Space'), up: input.down('Space'), down: input.down('KeyC'), brake: input.down('KeyR') || input.down('KeyX'), fast: input.down('ShiftLeft') || input.down('ShiftRight') });
    }
    this.time += dt;
    // the world's part ticks once a frame, whoever is down here
    if (this.w.tickAt !== this.game.lastFrame) { this.w.tickAt = this.game.lastFrame; this.w.mech.update(dt, w.pos); }
    const a = w.takeAlert(); if (a) this.toast(a);
    // where you are, in the planet's frame: you are physically here; and in the world (the
    // planet keeps moving and turning while you are down here: the world camera goes with you)
    const p = this.player, b = this.site.body;
    this.sites.toBody(this.site, w.pos, p.fPos); p.fVel.set(0, 0, 0); p.body = b;
    p.camPos.copy(p.fPos).applyQuaternion(b.q).add(b.pos);
    this.map.visit(w.pos);
    this.lastSave += dt; if (this.lastSave > 10) { this.lastSave = 0; this.save(); }
  }

  render(first, dt) {
    const { view, walker: w, player } = this;
    view.width = player.view.width; view.height = player.view.height; view.rect = player.view.rect;
    const c = view.camera; c.aspect = player.view.camera.aspect; c.fov = player.view.camera.fov; c.updateProjectionMatrix();
    c.position.set(w.pos[0], w.pos[1] + 1.68, w.pos[2]); c.rotation.set(w.pitch, w.yaw, 0); c.updateMatrixWorld();
    this.w.visual.update(c, this.time, { flashlight: this.flashlight, collected: this.w.collected });
    this.engine.time = this.time; this.engine.pixelRatio = this.game.engine.pixelRatio;
    this.sound.update({ pos: w.pos, yaw: w.yaw, grounded: w.grounded, zeroG: w.gravity === 0, time: this.time }, !this.game.paused && this.game.players[0] === player);
    this.game.engine.webgpu.render(this.engine, first);
    this.hud.update(this, c);
  }

  leave(restore = true, at = this.site.hatch) {
    this.save();
    const p = this.player;
    if (restore) { const dir = at.clone().normalize(); p.placeOnSurface(this.site.body, dir, new THREE.Vector3(0, 1, 0).applyQuaternion(this.site.rot).cross(dir).normalize()); p.fade = 1; }
    p.understructure = null; p.ui.root.style.visibility = '';
    this.hud.dispose(); this.sound.voice.stop();
    this.game.engine.webgpu?.releaseView(this.view);
    this.game.engine.adaptReset = true;
    if (restore) p.ui.hud?.message?.(at === this.site.gate ? "Up through the founders' gate" : 'Back at the hatch', 'nav');
  }
}

// The player's HUD while inside: depth and field, objective and credit, the
// compass, the corner map, prompts and messages, laid over their view.
class SiteHUD {
  constructor(player) {
    this.player = player;
    const root = this.root = document.createElement('div');
    Object.assign(root.style, { position: 'fixed', pointerEvents: 'none', font: '12px ui-monospace, monospace', color: '#e3e9da', zIndex: 5 });
    root.innerHTML = '<div data-k="tele" style="position:absolute;right:24px;top:20px;text-align:right"></div><div data-k="prompt" style="position:absolute;left:50%;top:62%;transform:translateX(-50%);padding:10px 16px;background:#111b18db;border:1px solid #e3e9da30"></div><div data-k="toast" style="position:absolute;left:50%;bottom:110px;transform:translateX(-50%);padding:12px 20px;background:#162624ec;border-left:2px solid #e8b777;max-width:560px"></div><div data-k="foot" style="position:absolute;left:24px;bottom:22px"></div>';
    document.body.append(root);
    this.k = Object.fromEntries([...root.querySelectorAll('[data-k]')].map((e) => [e.dataset.k, e]));
    this.compass = new SiteCompass(root); this.compass.canvas.style.left = '24px'; this.compass.canvas.style.top = '20px';
    this.mini = document.createElement('canvas'); Object.assign(this.mini.style, { position: 'absolute', right: '24px', top: '110px', width: '210px', height: '150px', border: '1px solid #e3e9da30' }); root.append(this.mini);
  }
  update(s, camera) {
    const r = this.player.view.rect;
    Object.assign(this.root.style, { left: `${r.x}px`, top: `${r.y}px`, width: `${r.w}px`, height: `${r.h}px` });
    const w = s.walker, plan = s.site.plan, rec = plan.finds.find((f) => f.kind === 'record'), raw = s.raw();
    this.k.tele.innerHTML = `${(plan.surfaceY - w.pos[1]).toFixed(0)} m down<br>field ${w.gravity.toFixed(2)} g`;
    const o = s.offer(); this.k.prompt.style.display = o ? '' : 'none'; if (o) this.k.prompt.innerHTML = `<b style="color:#e8b777;padding-right:12px">${this.player.input.device === 'pad' ? 'X' : 'F'}</b>${o.text}`;
    const showToast = performance.now() < s.noticeUntil; this.k.toast.style.display = showToast ? '' : 'none'; if (showToast) this.k.toast.textContent = s.notice;
    this.k.foot.innerHTML = `${s.w.collected.has(rec.id) ? "Founders' lift" : 'Site record'}<br><span style="color:#e8b777">${raw}% · credit ${credit(raw)}/170</span>`;
    let tgt = s.guide.target(w.pos, { recordTaken: s.w.collected.has(rec.id), recordPos: rec.pos });
    const need = s.w.collected.has(rec.id) ? null : s.w.mech.objective(s.guide.reached, w.pos); if (need) tgt = need;
    const rel = new THREE.Vector3(tgt.pos[0] - camera.position.x, tgt.pos[1] + 1.2 - camera.position.y, tgt.pos[2] - camera.position.z);
    const flat = Math.hypot(rel.x, rel.z), rise = tgt.pos[1] - w.pos[1];
    rel.applyQuaternion(camera.quaternion.clone().invert());
    this.compass.draw([rel.x, rel.y, rel.z], `${Math.round(flat)} m`, Math.abs(rise) > 1.5 ? `${rise > 0 ? '▲' : '▼'} ${Math.abs(Math.round(rise))} m · ${tgt.label}` : tgt.label);
    s.map.draw(this.mini, { player: w.pos, yaw: w.yaw, target: tgt.pos, finds: plan.finds.filter((f) => s.w.collected.has(f.id)), mini: true });
  }
  dispose() { this.root.remove(); }
}
