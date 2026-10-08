// Standalone survey of a graph-planned site (megasite.html): plan, compile,
// draw with the deferred WebGPU renderer, walk it.
import * as THREE from 'three';
import { DeferredRenderer } from '../../render/webgpu/renderer.js';
import { planSite } from '../plan/sitePlan.js';
import { compileSite } from '../plan/compile.js';
import { inside } from '../plan/geom2.js';
import { buildSiteScene } from './siteScene.js';
import { SiteWalker } from './siteWalker.js';
import { SiteGuide } from './siteGuide.js';
import { SiteCompass } from './siteCompass.js';
import { SiteMechanisms } from './siteMechanisms.js';
import { THEME_NAMES } from '../plan/themes.js';

const $ = (id) => document.getElementById(id), params = new URLSearchParams(location.search);
const seed = params.get('seed') || 'SUMP-07';
const plan = planSite(seed, { environment: { water: params.get('environment') !== 'barren' } });
const site = compileSite(plan);
const visual = buildSiteScene(plan, site);
const walker = new SiteWalker(visual.collision, site.spawn);
const guide = new SiteGuide(plan), compass = new SiteCompass(document.body);
const recordFind = plan.finds.find((f) => f.kind === 'record');
const saveKey = `starseed.megasite.${params.has('test') ? 'test.' : ''}v1.${plan.seed}`;
let saved = {}; try { saved = JSON.parse(localStorage.getItem(saveKey) || '{}'); } catch { /* private window */ }
if (params.has('reset')) saved = {};
const state = { flashlight: true, collected: new Set(saved.collected || []), returned: false };
const mech = new SiteMechanisms(site, visual.collision, visual.root, visual.mat, saved.mech || {});
const finds = new Map(plan.finds.map((f) => [f.id, f]));
const raw = () => [...state.collected].reduce((s, id) => s + (finds.get(id)?.units || 0), 0);
const credit = (r) => Math.min(170, Math.min(r, 100) + 3 * Math.max(0, r - 100));
const save = () => { try { localStorage.setItem(saveKey, JSON.stringify({ collected: [...state.collected], mech: mech.save() })); } catch { /* ignore */ } };

const canvas = $('view'), camera = new THREE.PerspectiveCamera(73, 1, 0.08, 3200); camera.rotation.order = 'YXZ';
const view = { camera, width: 1, height: 1, rect: { x: 0, y: 0, w: 1, h: 1 }, meterRef: 0.18, maxExposure: 3, exposureBias: 1.3 };
const engine = { scene: visual.scene, view, minExposure: 0.05, pixelRatio: 1 };
let renderer, running = false, last = 0, time = 0, frame = 0, notice = '', noticeUntil = 0;
const keys = new Set(), errors = [];
$('site').textContent = plan.seed; $('seed').value = plan.seed;
$('kinds').textContent = `${plan.themes.map((t) => THEME_NAMES[t]).join(' + ')} · ${plan.landmarks.map((l) => l.name.toLowerCase()).join(' · ')} · ${plan.nodes.filter((n) => n.kind === 'crossing').length} crossings · ${plan.nodes.filter((n) => n.kind === 'climb').length} climbs`;

function fail(e) { errors.push(String(e?.stack || e)); $('fatal').hidden = false; $('fatal').textContent = 'The survey could not start: ' + (e?.message || e); running = false; }
addEventListener('error', (e) => fail(e.error || e.message)); addEventListener('unhandledrejection', (e) => fail(e.reason));
function toast(m) { if (!m) return; notice = m; noticeUntil = performance.now() + Math.max(3500, m.length * 70); }
function resize() {
  const ratio = Math.min(devicePixelRatio || 1, 1.5), w = Math.max(1, Math.floor(innerWidth * ratio)), h = Math.max(1, Math.floor(innerHeight * ratio));
  canvas.width = w; canvas.height = h; Object.assign(view, { width: w, height: h, rect: { x: 0, y: 0, w, h } }); camera.aspect = w / h; camera.updateProjectionMatrix();
}
function start() { running = true; $('intro').hidden = true; $('start').textContent = 'Resume'; canvas.focus(); canvas.requestPointerLock?.()?.catch?.(() => {}); last = performance.now(); }
function pause() { running = false; keys.clear(); document.exitPointerLock?.(); $('intro').hidden = false; save(); }
$('start').onclick = start;
const load = (seedValue) => { const u = new URL(location.href); u.searchParams.set('seed', seedValue); location.href = u.href; };
$('generate').onclick = () => load($('seed').value);
$('seed').addEventListener('keydown', (e) => { if (e.key === 'Enter') load($('seed').value); });
$('random').onclick = () => { const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', b = new Uint32Array(8); crypto.getRandomValues(b); load([...b].map((x, i) => (i === 4 ? '-' : '') + a[x % a.length]).join('')); };
addEventListener('resize', resize);
addEventListener('keydown', (e) => {
  if (e.target instanceof HTMLInputElement || e.metaKey || e.ctrlKey) return;
  if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'KeyC', 'KeyR', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
  keys.add(e.code); if (e.repeat) return;
  if (e.code === 'Escape') pause();
  if (!running) return;
  if (e.code === 'KeyF') { state.flashlight = !state.flashlight; toast(state.flashlight ? 'Hand light on' : 'Hand light off'); }
  if (e.code === 'KeyE') interact();
});
addEventListener('keyup', (e) => keys.delete(e.code));
canvas.addEventListener('pointerdown', () => { if (running && document.pointerLockElement !== canvas) canvas.requestPointerLock?.()?.catch?.(() => {}); });
addEventListener('mousemove', (e) => { if (running && document.pointerLockElement === canvas) { walker.yaw -= e.movementX * 0.002; walker.pitch = Math.max(-1.45, Math.min(1.45, walker.pitch - e.movementY * 0.002)); } });

// what you can reach: a find within 2.4 m, or the founders' lift once the record is in hand
function offer() {
  const p = walker.pos;
  let best = null, bd = 2.4;
  for (const f of plan.finds) {
    if (state.collected.has(f.id) || f.kind === 'entry-scan') continue;
    const d = Math.hypot(f.pos[0] - p[0], (f.pos[1] - p[1]) * 0.6, f.pos[2] - p[2]);
    if (d < bd) { bd = d; best = f; }
  }
  const m = mech.offer(p);
  if (m && (!best || bd > 1.2)) return { type: 'mech', text: m.text, act: m.act };
  if (best) return { type: 'find', find: best, text: best.kind === 'record' ? 'Take the site record' : best.kind === 'crawler' ? 'Pull data from the crawler' : 'Take the data shard' };
  const access = plan.nodes.find((n) => n.id === 'access');
  if (Math.abs(p[1] - access.y0) < 1 && inside([p[0], p[2]], plan.access.poly, 0)) {
    return state.collected.has(plan.finds.find((f) => f.kind === 'record').id)
      ? { type: 'exit', text: "Take the founders' lift up" }
      : { type: 'sealed', text: "Lift sealed: needs the site record" };
  }
  return null;
}
function interact() {
  const o = offer();
  if (!o) return;
  if (o.type === 'mech') { toast(o.act()); save(); return; }
  if (o.type === 'find') {
    const before = raw();
    state.collected.add(o.find.id);
    const r = raw(), c = credit(r), gained = c - credit(before);
    toast(o.find.kind === 'record'
      ? `Site record +${o.find.units} · founders' lift unlocked`
      : `Data +${gained} · site ${r}% · credit ${c}/170${r > 100 ? ' (×3 past 100%)' : ''}`);
    save();
  } else if (o.type === 'exit') { state.returned = true; toast('The lift rises toward daylight. Survey complete: you can come back to explore further.'); pause(); }
  else toast(o.text);
}

function zoneName() {
  const p = walker.pos;
  for (const s of site.spaces) if (p[1] >= s.y0 - 0.5 && p[1] <= s.y1 && inside([p[0], p[2]], s.poly, 0)) return s.name;
  return 'SERVICE PASSAGE';
}
function hud() {
  $('zone').textContent = zoneName();
  $('depth').innerHTML = `−${(240 - walker.pos[1]).toFixed(1).padStart(5, '0')} <small>M</small>`;
  const g = walker.gravity; $('gravity').textContent = `LOCAL FIELD ${g.toFixed(2)} G`;
  document.body.classList.toggle('zero-g', g === 0); $('floatHelp').hidden = g !== 0;
  const r = raw(); $('count').textContent = `${String(r).padStart(3, '0')}%`; $('credit').textContent = `CREDIT ${credit(r)} / 170`;
  const o = running ? offer() : null; $('prompt').hidden = !o; if (o) $('prompt').innerHTML = `<b>E</b>${o.text}`;
  const a = walker.takeAlert(); if (a) toast(a);
  $('toast').textContent = performance.now() < noticeUntil ? notice : ''; $('toast').hidden = !$('toast').textContent;
  // the compass: where the route goes next, in camera space
  let tgt = guide.target(walker.pos, { recordTaken: state.collected.has(recordFind.id), recordPos: recordFind.pos });
  const need = state.collected.has(recordFind.id) ? null : mech.objective(guide.reached, walker.pos);
  if (need) tgt = need;
  const eye = camera.position, rel = new THREE.Vector3(tgt.pos[0] - eye.x, tgt.pos[1] + 1.2 - eye.y, tgt.pos[2] - eye.z);
  const flat = Math.hypot(rel.x, rel.z), rise = tgt.pos[1] - walker.pos[1];
  rel.applyQuaternion(camera.quaternion.clone().invert());
  compass.draw([rel.x, rel.y, rel.z], `${Math.round(flat)} m`, Math.abs(rise) > 1.5 ? `${rise > 0 ? '▲' : '▼'} ${Math.abs(Math.round(rise))} m · ${tgt.label}` : tgt.label);
  $('objective').textContent = state.collected.has(plan.finds.find((f) => f.kind === 'record').id) ? "Founders' lift" : 'Site record';
}
function render() {
  camera.position.set(walker.pos[0], walker.pos[1] + 1.68, walker.pos[2]); camera.rotation.set(walker.pitch, walker.yaw, 0); camera.updateMatrixWorld();
  hud();
  visual.update(camera, time, state); engine.time = time; renderer.render(engine); frame++;
}
function input() {
  return {
    forward: Number(keys.has('KeyW')) - Number(keys.has('KeyS')), strafe: Number(keys.has('KeyD')) - Number(keys.has('KeyA')),
    jump: keys.has('Space'), down: keys.has('KeyC'), brake: keys.has('KeyR'), fast: keys.has('ShiftLeft') || keys.has('ShiftRight'),
    turn: Number(keys.has('ArrowLeft')) - Number(keys.has('ArrowRight')), look: Number(keys.has('ArrowUp')) - Number(keys.has('ArrowDown')),
  };
}
// the suit's entry scan: the first unit of Golden Path data, found on arrival
const entryScan = plan.finds.find((f) => f.kind === 'entry-scan');
function scanOnArrival() {
  if (!entryScan || state.collected.has(entryScan.id) || !running) return;
  state.collected.add(entryScan.id); save();
  toast('Entry scan: data +1');
}
function loop(now) {
  requestAnimationFrame(loop);
  if (document.hidden) return;
  const dt = Math.min((now - last) / 1000, 0.1); if (now - last < 1000 / 60) return; last = now;
  if (running) { walker.step(dt, input()); time += dt; mech.update(dt, walker.pos); if (time > 1.5) scanOnArrival(); }
  render();
}
if (params.has('test')) window.siteTest = { plan, site, walker, state, guide, mech, visual, errors, render, start, pause, interact, offer, raw, credit, get renderer() { return renderer; }, get frame() { return frame; }, engine };
try { resize(); renderer = await DeferredRenderer.create(canvas, fail); engine.webgpu = renderer; $('start').disabled = false; $('start').textContent = 'Start'; render(); last = performance.now(); requestAnimationFrame(loop); }
catch (e) { fail(e); }
