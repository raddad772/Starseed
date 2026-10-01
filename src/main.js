// Bootstrap: seed handling, briefing screen, pause menu, main loop.

import { Game } from './game.js';
import { Input } from './input.js';
import { generateSystem } from './gen/system.js';
import { renderBriefing, startOptions } from './ui/briefing.js';
import { randomSeedString, normalizeSeed } from './core/rng.js';
import { TEST_SCENES } from './ui/testScenes.js';
import { PadMenu } from './ui/padMenu.js';

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
const DEFAULT_SEED = 'FSPB-8DTW';

function readSeed() {
  const fromHash = location.hash.length > 1 ? decodeURIComponent(location.hash.slice(1)) : '';
  return normalizeSeed(params.get('seed') || fromHash) || DEFAULT_SEED;
}

function fatal(msg) {
  const d = document.createElement('div');
  d.id = 'fatal';
  d.textContent = msg;
  document.body.appendChild(d);
}

// Surface unexpected errors instead of failing silently
function reportError(msg) {
  console.error(msg);
  const el = $('errorLine');
  if (el) { el.hidden = false; el.textContent = 'Error: ' + String(msg).slice(0, 160); }
}
window.addEventListener('error', (e) => reportError(e.message || e.error));
window.addEventListener('unhandledrejection', (e) => reportError(e.reason && (e.reason.stack || e.reason.message) || e.reason));

let game = null;
let seed = readSeed();
let launched = false;
const canvas = $('view');
const input = new Input(canvas);
const settings = loadSettings();
applySettings();

function loadSettings() {
  const def = { sensitivity: 1, invertY: false, fov: 72, scale: 1, tone: 'agx' };
  try { return Object.assign(def, JSON.parse(localStorage.getItem('starseed.settings') || '{}')); } catch (e) { return def; }
}
function saveSettings() { try { localStorage.setItem('starseed.settings', JSON.stringify(settings)); } catch (e) { /* optional */ } }
function applySettings() {
  input.sensitivity = settings.sensitivity;
  input.invertY = settings.invertY;
  if (game) { game.engine.setFov(settings.fov); game.engine.toneCurve = settings.tone; }
}

let startChoice = null;
function showBriefing(s) {
  const sys = generateSystem(s);
  renderBriefing(sys, { starLine: $('starLine'), schematic: $('schematic'), table: $('planetTable') });
  $('seedInput').value = s;
  // where to begin (the first is the default)
  const opts = startOptions(sys);
  if (!opts.some((o) => o.key === startChoice)) startChoice = opts[0].key;
  const box = $('startPick');
  box.innerHTML = opts.map((o) => `<button type="button" role="radio" data-start="${o.key}" aria-checked="${o.key === startChoice}"><b>${o.title}</b><span>${o.sub}</span></button>`).join('');
  for (const el of box.querySelectorAll('[data-start]')) {
    el.onclick = () => {
      startChoice = el.dataset.start;
      for (const b of box.querySelectorAll('[data-start]')) b.setAttribute('aria-checked', String(b === el));
      // the view behind the briefing moves to the chosen start
      if (game && previewed !== startChoice) { game.requestStart(startChoice); previewed = startChoice; }
    };
    el.ondblclick = () => { startChoice = el.dataset.start; launchGame(); };
  }
}

// The start shown behind the briefing (null once you have played on from it:
// Launch then carries on where you were, and picking any start moves you there)
let previewed = null;

function boot(s) {
  if (game) { game.dispose(); game = null; }
  try {
    game = new Game(canvas, input, s, {
      workers: params.get('workers') ? +params.get('workers') : undefined,
      renderScale: params.get('scale') ? +params.get('scale') : settings.scale,
      reversedDepth: params.get('logdepth') ? false : undefined,
    });
  } catch (err) {
    console.error(err);
    fatal('Could not start the renderer (' + err.message + '). Starseed Infinite needs a browser with WebGL 2.');
    return;
  }
  window.game = game;
  game.hud.onHelpClosed = showPause;
  if (startChoice) { game.requestStart(startChoice); previewed = startChoice; } // the briefing shows the chosen start live
  applySettings();
  try {
    const q = new URLSearchParams(location.search);
    q.set('seed', s);
    history.replaceState(null, '', `?${q.toString()}#${s}`); // the #SEED form survives hosts that drop query strings
  } catch (e) { /* sandboxed */ }
}

$('newSeed').addEventListener('click', () => { seed = randomSeedString(); showBriefing(seed); boot(seed); });
$('seedInput').addEventListener('change', () => {
  const s = normalizeSeed($('seedInput').value);
  if (!s || s === seed) return;
  seed = s; showBriefing(seed); boot(seed);
});
function enterGame() {
  launched = true;
  $('briefing').hidden = true;
  $('hud').hidden = false;
  input.requestLock();
  canvas.focus();
}
function launchGame() {
  enterGame();
  previewed = null;
  if (game) game.launch();
}
// back to the briefing from the game (the pause menu's Change system)
function toBriefing() {
  const ov = $('overlay');
  ov.hidden = true; ov.innerHTML = '';
  launched = false;
  if (game) { game.setPaused(false); game.launched = false; }
  input.releaseLock();
  $('hud').hidden = true;
  $('briefing').hidden = false;
}
$('launch').addEventListener('click', launchGame);
canvas.addEventListener('click', () => {
  if (launched && !input.locked && game && !game.map.open && $('overlay').hidden) input.requestLock();
});
document.addEventListener('pointerlockchange', () => {
  if (!launched || !game) return;
  if (!document.pointerLockElement && !game.map.open && $('overlay').hidden && !game.deathShown) showPause();
});

// what the last second of mouse look looked like, per input source
function mouseDiag() {
  const r = input.stats.rate;
  if (!r) return '';
  return `<div class="label" style="text-transform:none; letter-spacing:0; opacity:0.7">Mouse input: mousemove ${r.m.toFixed(0)}/s (${r.mPx.toFixed(0)} px/s) · pointer ${r.p.toFixed(0)}/s (${r.pPx.toFixed(0)} px/s) · using ${r.src}</div>`;
}

function showPause() {
  const ov = $('overlay');
  ov.hidden = false;
  if (game) game.setPaused(true);
  const url = `${location.origin}${location.pathname}?seed=${encodeURIComponent(seed)}`;
  ov.innerHTML = `<div class="card">
    <h2>Paused</h2>
    <div class="rows" style="grid-template-columns:auto 1fr; gap:8px 14px; align-items:center">
      <label class="label" for="setSens">Mouse</label><input id="setSens" type="range" min="0.2" max="6" step="0.05" value="${settings.sensitivity}">
      <label class="label" for="setFov">Field of view</label><input id="setFov" type="range" min="55" max="100" step="1" value="${settings.fov}">
      <label class="label" for="setScale">Resolution</label><input id="setScale" type="range" min="0.5" max="1" step="0.05" value="${settings.scale}">
      <label class="label" for="setInv">Invert Y</label><input id="setInv" type="checkbox" ${settings.invertY ? 'checked' : ''}>
      <label class="label" for="setTone">Highlights</label><select id="setTone"><option value="agx" ${settings.tone !== 'aces' ? 'selected' : ''}>Wide range (AgX)</option><option value="aces" ${settings.tone === 'aces' ? 'selected' : ''}>Punchy (ACES)</option></select>
    </div>
 ${mouseDiag()}
    <div class="label">System seed</div>
    <div class="seedrow"><input id="shareUrl" readonly value="${url}" aria-label="Share link"><button id="copyUrl" type="button">Copy link</button></div>
    <div class="seedrow"><button id="resume" class="primary" type="button" data-pad-back>Resume</button><button id="padHelp" type="button">Controls</button><button id="tests" type="button">Test scenes</button><button id="toBriefing" type="button">Change system</button></div>
  </div>`;
  $('setSens').oninput = (e) => { settings.sensitivity = +e.target.value; applySettings(); saveSettings(); };
  $('setFov').oninput = (e) => { settings.fov = +e.target.value; applySettings(); saveSettings(); };
  $('setScale').onchange = (e) => { settings.scale = +e.target.value; saveSettings(); if (game) { game.engine.renderScale = settings.scale; game.engine.resize(); } };
  $('setInv').onchange = (e) => { settings.invertY = e.target.checked; applySettings(); saveSettings(); };
  $('setTone').onchange = (e) => { settings.tone = e.target.value; applySettings(); saveSettings(); };
  $('copyUrl').onclick = () => {
    const el = $('shareUrl');
    navigator.clipboard.writeText(el.value).then(() => { $('copyUrl').textContent = 'Copied'; }, () => { el.select(); });
  };
  $('resume').onclick = resume;
  $('tests').onclick = showTests;
  $('padHelp').onclick = () => { ov.hidden = true; ov.innerHTML = ''; if (game) game.hud.toggleHelp('pad'); };
  $('toBriefing').onclick = toBriefing;
}

// jump to the spots the lighting / exposure / carrier tests use
function showTests() {
  const ov = $('overlay');
  ov.hidden = false;
  ov.innerHTML = `<div class="card help"><h2>Test scenes</h2>
    <div class="scenes">${TEST_SCENES.map((t, i) => `<button type="button" data-scene="${i}"><b>${t.label}</b><span>${t.note}</span></button>`).join('')}</div>
    <label class="check"><input id="meterOn" type="checkbox" ${game && game.showMeter ? 'checked' : ''}> Show the exposure readout (top of the screen)</label>
    <div class="seedrow"><button id="testsBack" type="button" data-pad-back>Back</button></div></div>`;
  for (const el of ov.querySelectorAll('[data-scene]')) el.onclick = () => { if (game) { TEST_SCENES[+el.dataset.scene].run(game); resume(); } };
  $('meterOn').onchange = (e) => { if (game) game.showMeter = e.target.checked; };
  $('testsBack').onclick = showPause;
}

function resume() {
  const ov = $('overlay');
  ov.hidden = true; ov.innerHTML = '';
  if (game) game.setPaused(false);
  input.requestLock();
}

// Start on a gamepad: launch from the briefing, pause, or resume from the
// pause menu (or close help)
input.onPadPause = () => {
  if (!game) return;
  if (!launched) { if (!$('briefing').hidden && $('overlay').hidden) launchGame(); return; }
  const ov = $('overlay');
  if (game.map.open) game.map.toggle();
  if (ov.hidden) { input.releaseLock(); showPause(); }
  else if (game.hud.helpOn) game.hud.toggleHelp();
  else if (ov.querySelector('#resume')) resume();
};

// The controller drives whatever menu is open (see padMenu.js) and the map;
// otherwise it flies and walks (padLayout.js)
const padMenu = new PadMenu();
function openMenu() {
  const ov = $('overlay');
  if (!ov.hidden && ov.firstElementChild) return ov.firstElementChild;
  if (!$('briefing').hidden) return $('briefing').querySelector('.panel');
  return null;
}
input.padRouter = (ps, dt) => {
  if (!game) return false;
  const menu = openMenu();
  if (!menu && !game.map.open) { padMenu.setCur(null); return false; }
  if (ps.hits.has('START')) { input.onPadPause(); return true; }
  if (menu) {
    // R3: the controller layout (from the pause menu), or close it
    if (ps.hits.has('R3') && (game.hud.helpOn || menu.querySelector('#resume'))) {
      if (!game.hud.helpOn) { $('overlay').hidden = true; $('overlay').innerHTML = ''; }
      game.hud.toggleHelp('pad');
      return true;
    }
    padMenu.update(menu, ps, dt, input.usingPad);
    return true;
  }
  game.map.padUpdate(ps, dt);
  return true;
};
window.addEventListener('gamepadconnected', (e) => {
  if (game) game.message(`Controller connected · R3 or H shows its layout`, 'nav');
  if (game && game.hud.helpOn) game.hud.refreshHelp();
});

showBriefing(seed);
boot(seed);

let manual = false;
function loop(now) {
  if (game && !manual && !window.debugHold) game.frame(now); // debugHold: tests step frames themselves
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// Debug driver for hidden tabs (rAF is paused there): steps frames for `ms`
// of wall time, yielding through MessageChannel so worker results land.
const chan = new MessageChannel();
let resolveTick = null;
chan.port1.onmessage = () => { const r = resolveTick; resolveTick = null; if (r) r(); };
const tick = () => new Promise((r) => { resolveTick = r; chan.port2.postMessage(0); });
window.debugRun = async (ms = 1000, frameMs = 16, onFrame = null) => {
  manual = true;
  const end = performance.now() + ms;
  let n = 0;
  while (performance.now() < end) {
    const t0 = performance.now();
    if (onFrame && onFrame(n, game) === false) break;
    game.frame(performance.now());
    n++;
    while (performance.now() - t0 < frameMs) await tick();
  }
  manual = false;
  return n;
};
window.launch = () => $('launch').click();
