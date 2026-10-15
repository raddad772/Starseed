// The Hollow Moon on its own page (hollow.html?seed=&still=1&moonR=): its world, drawn with the deferred
// WebGPU renderer, walked with the field walker; the stairways' carriages ridden down and up the caps.
import * as THREE from 'three';
import { DeferredRenderer } from '../../render/webgpu/renderer.js';
import { hollowWorld } from './hollowWorld.js';
import { buildHollowScene } from './hollowScene.js';
import { FieldWalker } from '../site/fieldWalker.js';

const $ = (id) => document.getElementById(id), params = new URLSearchParams(location.search);
const world = hollowWorld(params.get('seed') || 'HOLLOW-1', { moonR: +(params.get('moonR') || 27000), moonG: +(params.get('moonG') || 1.62), still: params.has('still') });
const visual = buildHollowScene(world);
const walker = new FieldWalker(visual.collision, visual.spawn);
const canvas = $('view'), camera = new THREE.PerspectiveCamera(73, 1, 0.1, 20000);
const view = { camera, width: 1, height: 1, rect: { x: 0, y: 0, w: 1, h: 1 }, meterRef: 0.18, maxExposure: 3, exposureBias: 1.3 };
const engine = { scene: visual.scene, view, minExposure: 0.05, pixelRatio: 1 };
let renderer, running = false, last = 0, time = 0, notice = '', noticeUntil = 0, ride = null, flashlight = true;
const keys = new Set(), errors = [];
$('site').textContent = world.seed;
$('kinds').textContent = world.still ? 'a still hollow, long abandoned' : `a sphere ${(2 * world.Rs / 1000).toFixed(1)} km across, turning once in ${(2 * Math.PI / world.omega).toFixed(0)} s: 1 g at its equator`;

function fail(e) { errors.push(String(e?.stack || e)); $('fatal').hidden = false; $('fatal').textContent = 'The Hollow Moon could not start: ' + (e?.message || e); running = false; }
addEventListener('error', (e) => fail(e.error || e.message)); addEventListener('unhandledrejection', (e) => fail(e.reason));
function toast(m) { if (!m) return; notice = m; noticeUntil = performance.now() + Math.max(3500, m.length * 70); }
function resize() {
  const ratio = Math.min(devicePixelRatio || 1, 1.5), w = Math.max(1, Math.floor(innerWidth * ratio)), h = Math.max(1, Math.floor(innerHeight * ratio));
  canvas.width = w; canvas.height = h; Object.assign(view, { width: w, height: h, rect: { x: 0, y: 0, w, h } }); camera.aspect = w / h; camera.updateProjectionMatrix();
}
function start() { running = true; $('intro').hidden = true; $('start').textContent = 'Resume'; canvas.focus(); canvas.requestPointerLock?.()?.catch?.(() => {}); last = performance.now(); }
function pause() { running = false; keys.clear(); document.exitPointerLock?.(); $('intro').hidden = false; }
$('start').onclick = start;
addEventListener('keydown', (e) => { if (e.code === 'Escape') { pause(); return; } keys.add(e.code); if (e.code === 'KeyF') interact(); if (e.code === 'KeyL') { flashlight = !flashlight; toast(flashlight ? 'Hand light on' : 'Hand light off'); } });
addEventListener('keyup', (e) => keys.delete(e.code));
addEventListener('mousemove', (e) => { if (!running || document.pointerLockElement !== canvas) return; walker.turn(-e.movementX * 0.0022); walker.look(-e.movementY * 0.0022); });
addEventListener('resize', resize);

// the stairways' carriages: at a stairway's top (by the hub) or its foot (at the land's edge), F rides it
function nearStair() {
  const p = walker.pos;
  for (const s of visual.stairs) {
    const a = s.path[0], b = s.path.at(-1);
    if (Math.hypot(p[0] - a[0], p[1] - a[1], p[2] - a[2]) < 18) return { s, down: true };
    if (Math.hypot(p[0] - b[0], p[1] - b[1], p[2] - b[2]) < 18) return { s, down: false };
  }
  return null;
}
function interact() { if (ride) return; const n = nearStair(); if (!n) return; ride = { path: n.down ? n.s.path : n.s.path.slice().reverse(), t: 0, dur: 75 }; toast(n.down ? 'The carriage down the cap' : 'The carriage up to the hub'); }
// (along the path at an ease, a few metres off the stair's side, in toward the axis by a body's height)
function rideStep(dt) {
  const r = ride; r.t = Math.min(1, r.t + dt / r.dur);
  const e = r.t < 0.5 ? 2 * r.t * r.t : 1 - (2 - 2 * r.t) ** 2 / 2, f = e * (r.path.length - 1), i = Math.min(r.path.length - 2, Math.floor(f)), k = f - i;
  const a = r.path[i], b = r.path[i + 1], q = [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
  const rho = Math.hypot(q[0], q[2]) || 1, inward = [-q[0] / rho, 0, -q[2] / rho];
  walker.pos = [q[0] + inward[0] * 1.2, q[1], q[2] + inward[2] * 1.2]; walker.vel = [0, 0, 0];
  walker.step(0, {});
  if (r.t >= 1) { ride = null; walker.grounded = false; toast(r.path[0][1] * r.path.at(-1)[1] > 0 && Math.abs(r.path.at(-1)[1]) > Math.abs(r.path[0][1]) ? 'At the hub' : 'At the land\'s edge'); }
}

function input() {
  const ax = (a, b) => Number(keys.has(b)) - Number(keys.has(a));
  return { forward: ax('KeyS', 'KeyW'), strafe: ax('KeyA', 'KeyD'), jump: keys.has('Space'), up: keys.has('Space'), down: keys.has('KeyC'), brake: keys.has('KeyR'), fast: keys.has('ShiftLeft') || keys.has('ShiftRight') };
}
function hud() {
  const p = walker.pos, rho = Math.hypot(p[0], p[2]), lat = Math.atan2(p[1], rho) * 180 / Math.PI;
  $('zone').textContent = p[1] > world.Rs - world.hubDepth - 5 ? 'NORTH HUB' : p[1] < -(world.Rs - world.hubDepth - 5) ? 'SOUTH HUB' : Math.abs(lat) < 3 ? 'THE SEA' : Math.abs(lat) < 46 ? 'THE LAND' : 'THE CAP';
  $('depth').innerHTML = `${(world.Rs - rho).toFixed(0)} <small>M UP</small>`;
  $('gravity').textContent = `LOCAL FIELD ${walker.gravity.toFixed(2)} G · LAT ${lat.toFixed(1)}°`;
  $('floatHelp').hidden = walker.gravity > 0.012;
  const n = !ride && nearStair(); $('prompt').hidden = !n; if (n) $('prompt').innerHTML = `<b>F</b>${n.down ? 'Ride the carriage down' : 'Ride the carriage up'}`;
  const a = walker.takeAlert(); if (a) toast(a);
  $('toast').textContent = performance.now() < noticeUntil ? notice : ''; $('toast').hidden = !$('toast').textContent;
}
function render() {
  camera.position.set(...walker.eye()); camera.quaternion.copy(walker.cameraQuaternion()); camera.updateMatrixWorld();
  hud(); visual.update(camera, time, { flashlight });
  engine.time = time; renderer.render(engine);
}
function loop(now) {
  requestAnimationFrame(loop);
  if (document.hidden) return;
  const dt = Math.min((now - last) / 1000, 0.1); last = now;
  if (running) {
    if (keys.has('ArrowLeft')) walker.turn(1.8 * dt); if (keys.has('ArrowRight')) walker.turn(-1.8 * dt);
    if (keys.has('ArrowUp')) walker.look(1.4 * dt); if (keys.has('ArrowDown')) walker.look(-1.4 * dt);
    if (ride) rideStep(dt); else walker.step(dt, input());
    time += dt;
  }
  render();
}
// (for tests: stand somewhere at a latitude and longitude, on the land)
function standAt(latDeg, thetaDeg, lookTheta = 90) {
  const lat = latDeg * Math.PI / 180, th = thetaDeg * Math.PI / 180, r = world.Rs - 2;
  walker.pos = [Math.cos(lat) * Math.cos(th) * r, Math.sin(lat) * r, Math.cos(lat) * Math.sin(th) * r]; walker.vel = [0, 0, 0]; walker.grounded = false;
  walker.up = [-Math.cos(th), 0, -Math.sin(th)]; const lt = lookTheta * Math.PI / 180; walker.fwd = [-Math.sin(th) * Math.cos(lt), Math.sin(lt) * 0 + Math.cos(lt) * 0, Math.cos(th) * Math.cos(lt)];
  walker.fwd = [-Math.sin(th), 0, Math.cos(th)]; if (lookTheta === 0) walker.fwd = [0, 1, 0];
}
if (params.has('test')) window.hollowTest = { world, visual, walker, render, start, pause, standAt, interact, get ride() { return ride; }, errors, engine };
try { resize(); renderer = await DeferredRenderer.create(canvas, fail); engine.webgpu = renderer; $('start').disabled = false; $('start').textContent = 'Start'; render(); last = performance.now(); requestAnimationFrame(loop); }
catch (e) { fail(e); }
