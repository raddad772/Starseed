// Bootstrap: seed handling, briefing screen, pause menu, main loop.

import { Game } from './game.js';
import { Input } from './input.js';
import { generateSystem } from './gen/system.js';
import { renderBriefing, startOptions } from './ui/briefing.js';
import { randomSeedString, normalizeSeed } from './core/rng.js';
import { TEST_SCENES } from './ui/testScenes.js';
import { PadMenu } from './ui/padMenu.js';
import { PauseScreen } from './ui/pauseScreen.js';

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
  const def = { sensitivity: 1, invertY: false, fov: 72, scale: 1, tone: 'agx', split: 'top-bottom' };
  try { return Object.assign(def, JSON.parse(localStorage.getItem('starseed.settings') || '{}')); } catch (e) { return def; }
}
function saveSettings() { try { localStorage.setItem('starseed.settings', JSON.stringify(settings)); } catch (e) { /* optional */ } }
function applySettings() {
  input.sensitivity = settings.sensitivity;
  input.invertY = settings.invertY;
  if (game) {
    game.engine.toneCurve = settings.tone;
    game.engine.fovBase = settings.fov;
    if (game.engine.layout !== settings.split) { game.engine.layout = settings.split; game.layout(); }
    else game.engine.setFov(settings.fov);
    for (const p of game.players.slice(1)) { p.input.sensitivity = settings.sensitivity; p.input.invertY = settings.invertY; }
  }
}

// ---------------------------------------------------------------- player 2
// A second player joins with a controller of their own: Start on a
// controller nobody uses, or "Add player 2" in the pause menu then Start on
// any controller (player 1's own: player 1 keeps the keyboard and mouse).
// The screen splits; each player has their own HUD, screens and shuttle.
let p2Pad = null;          // the gamepad index player 2 plays with (kept across a change of system)
let joinWait = false;      // the pause menu asked for player 2's Start

function makeP2Input(padIndex) {
  const inp = new Input(canvas, { kbm: false, padIndex });
  inp.sensitivity = settings.sensitivity;
  inp.invertY = settings.invertY;
  inp.pollPad('foot', 0); // (the Start press that joined is not a pause)
  inp.endFrame();
  inp.padRouter = padRouterFor(1);
  inp.onPadPause = input.onPadPause;
  return inp;
}

function joinP2(padIndex) {
  if (!game || game.players.length > 1) return;
  p2Pad = padIndex;
  game.joinPlayer(makeP2Input(padIndex));
}

function leaveP2() {
  p2Pad = null;
  if (game && game.players[1]) game.leavePlayer(game.players[1]);
}

// each frame: a free controller's Start (in play), or any's (the pause menu asked)
function watchJoin() {
  if (!game || game.players.length > 1 || !launched) { joinWait = false; return; }
  const pads = Input.padsPressing('START', !joinWait);
  if (!pads.length) return;
  const wasWaiting = joinWait;
  joinWait = false;
  joinP2(pads[0]);
  if (wasWaiting) resume();
}

let startChoice = null;
let briefSys = null;          // the system the briefing shows
let startTab = 'suggested';   // 'suggested' | 'custom' (choose a world)
let customWorld = null;       // the world picked on the custom tab (body id)

// pick a start: mark it everywhere it is listed and show it behind the briefing
function pickStart(key) {
  startChoice = key;
  for (const b of $('briefing').querySelectorAll('[data-start]')) b.setAttribute('aria-checked', String(b.dataset.start === key));
  if (game && previewed !== startChoice) { game.requestStart(startChoice); previewed = startChoice; }
}
const pickButton = (key, title, sub, extra = '') => `<button type="button" role="radio" data-start="${key}" aria-checked="${key === startChoice}" ${extra}><b>${title}</b><span>${sub}</span></button>`;
function wirePicks(box) {
  for (const el of box.querySelectorAll('[data-start]')) {
    el.onclick = () => pickStart(el.dataset.start);
    el.ondblclick = () => { pickStart(el.dataset.start); launchGame(); };
  }
}

function setStartTab(tab) {
  startTab = tab;
  for (const b of document.querySelectorAll('.startTabs [data-st]')) b.classList.toggle('on', b.dataset.st === tab);
  $('startPick').hidden = tab !== 'suggested';
  $('customPick').hidden = tab !== 'custom';
  if (tab === 'custom' && customWorld === null && briefSys) showWorld(briefSys.startBodyId, false);
}
for (const b of document.querySelectorAll('.startTabs [data-st]')) b.onclick = () => setStartTab(b.dataset.st);

// Choose a world: every planet and moon; picking one shows it from orbit
// and lists where on it you can land (from its terrain survey)
function renderWorlds(sys) {
  const box = $('worldPick');
  const order = [];
  for (const pl of sys.bodies.filter((b) => b.kind === 'planet')) order.push(pl, ...sys.bodies.filter((b) => b.kind === 'moon' && b.parentId === pl.id));
  box.innerHTML = order.map((b) =>
    `<button type="button" role="radio" data-world="${b.id}" class="${b.kind === 'moon' ? 'moon' : ''}" aria-checked="${b.id === customWorld}"><b>${b.name}</b><span>${b.label}</span></button>`).join('');
  for (const el of box.querySelectorAll('[data-world]')) el.onclick = () => showWorld(+el.dataset.world, true);
}

function showWorld(id, preview) {
  customWorld = id;
  for (const b of $('worldPick').querySelectorAll('[data-world]')) b.setAttribute('aria-checked', String(+b.dataset.world === id));
  const sb = briefSys.bodies.find((b) => b.id === id);
  $('siteHead').textContent = `Where on ${sb.name}`;
  const box = $('sitePick');
  const orbit = pickButton(`orbit:${id}`, 'In orbit', `Floating beside your ship above ${sb.name}`);
  const body = game && game.universe.bodies[id];
  box.innerHTML = orbit + (body && body.solid ? pickButton('', 'Surveying…', 'Finding places to land', 'disabled') : '');
  wirePicks(box);
  if (preview) pickStart(`orbit:${id}`);
  if (!body || !body.solid) return;
  game.requestSurvey(body, 90).then((res) => {
    if (customWorld !== id) return;
    const spots = (res && res.spots) || [];
    box.innerHTML = orbit + spots.map((sp) => pickButton(`site:${id}:${sp.key}`, sp.label,
      `${sp.biome} · ${sp.temperatureC} °C · ${sp.elevation.toLocaleString()} m`)).join('');
    wirePicks(box);
  });
}

function showBriefing(s) {
  const sys = generateSystem(s);
  renderBriefing(sys, { starLine: $('starLine'), schematic: $('schematic'), table: $('planetTable') });
  $('seedInput').value = s;
  // where to begin (the first is the default; a new system starts afresh)
  const opts = startOptions(sys);
  if (!opts.some((o) => o.key === startChoice)) startChoice = opts[0].key;
  briefSys = sys;
  customWorld = null;
  const box = $('startPick');
  box.innerHTML = opts.map((o) => pickButton(o.key, o.title, o.sub)).join('');
  wirePicks(box);
  renderWorlds(sys);
  $('sitePick').innerHTML = '';
  $('siteHead').textContent = '';
  setStartTab('suggested');
}

// The start shown behind the briefing (null once you have played on from it:
// Launch then carries on where you were, and picking any start moves you there)
let previewed = null;

function boot(s) {
  if (game) { game.dispose(); game = null; }
  try {
    game = new Game(canvas, input, s, {
      workers: params.get('workers') ? +params.get('workers') : undefined,
      worldsim: params.get('worldsim') !== '0', simN: params.get('simN') ? +params.get('simN') : undefined,
      simWorkers: params.get('simWorkers') ? +params.get('simWorkers') : undefined,
      testSpot: params.get('test') || undefined,
      renderScale: params.get('scale') ? +params.get('scale') : settings.scale,
      reversedDepth: params.get('logdepth') ? false : undefined,
    });
  } catch (err) {
    console.error(err);
    fatal('Could not start the renderer (' + err.message + '). Starseed Infinite needs a browser with WebGL 2.');
    return;
  }
  window.game = game;
  game.screenHud.onHelpClosed = () => showPause();
  // player 1's M: the pause screen's map (anyone else's: the map in their own view)
  game.onMapKey = (p) => {
    if (p !== game.players[0]) { game.map.toggle(p); return; }
    if (pause.open) { if (pause.tab === 'map') resume(); else pause.setTab('map'); }
    else showPause('map');
  };
  game.onPausedHelp = () => pause.setTab('controls');
  if (startChoice) { game.requestStart(startChoice); previewed = startChoice; } // the briefing shows the chosen start live
  applySettings();
  if (p2Pad !== null) game.joinPlayer(makeP2Input(p2Pad)); // (player 2 stays on in a new system)
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
  if (pause.open) pause.hide();
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
// Esc on the pause screen resumes (the pointer is already free there)
window.addEventListener('keydown', (e) => {
  if (e.code !== 'Escape' || !pause.open || (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT'))) return;
  if (game && game.screenHud.helpOn) game.screenHud.toggleHelp(); else resume();
});

// The pause screen (Map / Planets / Settings / Controls tabs: see pauseScreen.js)
const pause = new PauseScreen({
  el: $('overlay'), game: () => game, settings, saveSettings, applySettings, input, tests: TEST_SCENES,
  resume: () => resume(), toBriefing: () => toBriefing(),
  // another system's seed from the catalog: its briefing, to pick where to begin
  travel: (s) => { toBriefing(); seed = s; showBriefing(seed); boot(seed); },
  players: {
    info: () => ({ count: game ? game.players.length : 1, pad: p2Pad, waiting: joinWait }),
    join: () => {
      if (!Input.padIndices().length) return 'Connect a controller for player 2 first (and press any button on it)';
      joinWait = true;
      return 'Press Start on player 2\'s controller';
    },
    leave: () => leaveP2(),
  },
});

function showPause(tab) {
  if (!game) return;
  if (game.map.open && !game.map.full) game.map.toggle(game.map.owner); // (a player's own map closes)
  pause.show(tab || (pause.tab === 'map' ? 'settings' : pause.tab));
}

function resume() {
  joinWait = false;
  if (pause.open) pause.hide();
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
  if (ov.hidden) { input.releaseLock(); showPause(); }
  else if (game.screenHud.helpOn) game.screenHud.toggleHelp();
  else if (pause.open) resume();
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
// Player i's controller: their suit's screen, their quick menu, the map when
// it's theirs; menus (pause, help, the briefing) are player 1's to drive,
// though anyone's Start pauses and resumes
function padRouterFor(i) {
  return (ps, dt) => {
    if (!game) return false;
    const p = game.players[i];
    if (!p) return false;
    const menu = openMenu();
    if (!menu && p.ui.suit.open) { if (i === 0) padMenu.setCur(null); return p.ui.suit.pad(ps, dt); }
    if (!menu && !(game.map.open && game.map.owner === p)) { if (i === 0) padMenu.setCur(null); return p.ui.quick.open ? p.ui.quick.pad(ps, dt) : false; }
    if (ps.hits.has('START')) { input.onPadPause(); return true; }
    if (menu && i > 0) return true;
    if (!menu) { game.map.padUpdate(ps, dt); return true; }
    return padRouterMenu(menu, ps, dt);
  };
}
input.padRouter = padRouterFor(0);
function padRouterMenu(menu, ps, dt) {
  const hud = game.players[0].ui.hud;
  if (pause.open) {
    // R3: the controls tab; View: the map (or back from it)
    if (ps.hits.has('R3')) { pause.setTab('controls'); return true; }
    if (ps.hits.has('VIEW')) { if (pause.tab === 'map') resume(); else pause.setTab('map'); return true; }
    if (pause.tab === 'map') {
      // the map takes the sticks, the triggers and the D-pad's left / right
      game.map.padUpdate(ps, dt, true);
      ps = { ...ps, hits: new Set([...ps.hits].filter((h) => h !== 'LEFT' && h !== 'RIGHT')), held: new Set([...ps.held].filter((h) => h !== 'LEFT' && h !== 'RIGHT')), lx: 0, ly: 0, lt: 0, rt: 0 };
    }
  }
  // R3: the controller layout (from the help card), or close it
  if (ps.hits.has('R3') && hud.helpOn) {
    hud.toggleHelp('pad');
    return true;
  }
  padMenu.update(menu, ps, dt, input.usingPad);
  return true;
}
window.addEventListener('gamepadconnected', (e) => {
  if (game) game.message(`Controller connected · R3 or H shows its layout`, 'nav');
  if (game && game.screenHud.helpOn) game.screenHud.refreshHelp();
});

showBriefing(seed);
boot(seed);

let manual = false;
function loop(now) {
  if (game && !manual && !window.debugHold) { watchJoin(); game.frame(now); pause.tick(); } // debugHold: tests step frames themselves
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
    watchJoin();
    game.frame(performance.now());
    pause.tick();
    n++;
    while (performance.now() - t0 < frameMs) await tick();
  }
  manual = false;
  return n;
};
window.launch = () => $('launch').click();
window.joinP2 = joinP2; window.leaveP2 = leaveP2; // (tests: a stubbed controller's index)
window.pauseScreen = pause;
