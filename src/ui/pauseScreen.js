// The pause screen: Map / pause opens one screen with tabs across the top,
// like many games (Dave). Map: the system map, full screen, with the focused
// world's card; Planets: a catalog of the system's worlds (a small picture
// drawn from the generator, the zone from the star, the biomes present, the
// basics) and a field to look up another system by its seed; Settings: the
// old pause menu (mouse, field of view, players, share link, change system,
// test scenes); Controls: the keyboard and controller layouts.
// Esc / Start open it on Settings, M / View on the map; LB / RB switch tabs
// (the pad menu does that for any '.tabs' bar), B / Resume closes it.

import { generateSystem } from '../gen/system.js';
import { giantPortrait, portraitLook } from '../gen/portrait.js';
import { drawSchematic } from './briefing.js';
import { normalizeSeed, randomSeedString } from '../core/rng.js';

const TABS = [['map', 'Map'], ['planets', 'Planets'], ['settings', 'Settings'], ['controls', 'Controls']];
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const GAS = { N2: 'N₂', O2: 'O₂', CO2: 'CO₂', CH4: 'CH₄', H2: 'H₂', He: 'He', Ar: 'Ar', H2O: 'H₂O', SO2: 'SO₂', NH3: 'NH₃', Ne: 'Ne', CO: 'CO', H2S: 'H₂S' };
const agoText = (gyr) => gyr >= 1 ? `${gyr.toFixed(1)} Gyr ago` : gyr >= 0.001 ? `${Math.round(gyr * 1000)} Myr ago` : gyr >= 1e-6 ? `${Math.round(gyr * 1e6)} kyr ago` : `${Math.max(1, Math.round(gyr * 1e9))} yr ago`;

// where a world sits around its star: the habitable zone (conservative and
// optimistic edges) and the formation-era snow line
export function zoneOf(sys, b) {
  const p = b.kind === 'moon' ? sys.bodies.find((x) => x.id === b.parentId) : b;
  const a = p.aAU, hz = sys.hz, snow = sys.disk.snowLine;
  let z;
  if (a < hz.optimisticInner) z = 'Inner system, too hot for liquid water';
  else if (a < hz.inner) z = 'Habitable zone, warm edge';
  else if (a <= hz.outer) z = 'Habitable zone';
  else if (a <= hz.optimisticOuter) z = 'Habitable zone, cool edge';
  else if (a < snow) z = 'Outer system, inside the snow line';
  else z = 'Beyond the snow line';
  return b.kind === 'moon' ? `${z} · moon of ${p.name}` : z;
}

export class PauseScreen {
  // o: { el, game(), settings, saveSettings(), applySettings(), input, resume(),
  //      toBriefing(), travel(seed), tests, players: { info(), join(), leave() } }
  constructor(o) {
    this.o = o;
    this.el = o.el;
    this.open = false;
    this.tab = 'settings';
    this.catSeed = null;      // the system the catalog shows (null: the current one)
    this.portraits = new Map(); // 'seed:id' -> { img: ImageData, cover } | 'pending'
    this.ctrlTab = 'keys';    // the controls tab: 'keys' or a pad mode
  }

  get game() { return this.o.game(); }

  show(tab) {
    const g = this.game;
    if (tab) this.tab = tab;
    this.open = true;
    this.el.hidden = false;
    if (g) g.setPaused(true);
    document.getElementById('hud').hidden = true;
    const title = document.getElementById('titleCard');
    if (title) title.classList.add('out'); // (the opening title card is done with)
    this.o.input.releaseLock();
    this.render();
  }

  hide() {
    const g = this.game;
    this.closeMap();
    this.open = false;
    this.el.hidden = true;
    this.el.innerHTML = '';
    document.getElementById('hud').hidden = false;
    if (g) g.setPaused(false);
  }

  setTab(t) {
    if (t === this.tab && this.el.firstElementChild) return;
    if (this.tab === 'map' && t !== 'map') this.closeMap();
    this.tab = t;
    this.render();
  }

  // the map takes the whole screen behind a see-through page
  openMap() {
    const g = this.game;
    if (!g) return;
    g.map.openFull(g.players[0]);
  }
  closeMap() {
    const g = this.game;
    if (g && g.map.open && g.map.full) g.map.close();
  }

  // ------------------------------------------------------------ pages

  render() {
    const tabs = TABS.map(([k, label]) => `<button type="button" data-ptab="${k}" class="${k === this.tab || (k === 'settings' && this.tab === 'tests') ? 'on' : ''}">${label}</button>`).join('');
    this.el.innerHTML = `<div class="pause ${this.tab === 'map' ? 'mapmode' : ''}">
      <div class="bar"><h2>Paused</h2><div class="tabs">${tabs}</div><span class="grow"></span><button id="resume" type="button" class="primary" data-pad-back>Resume</button></div>
      <div class="page">${this.page()}</div></div>`;
    for (const b of this.el.querySelectorAll('[data-ptab]')) b.onclick = () => this.setTab(b.dataset.ptab);
    this.el.querySelector('#resume').onclick = () => this.o.resume();
    if (this.tab === 'map') { this.openMap(); this.wireMap(); }
    else if (this.tab === 'planets') this.wirePlanets();
    else if (this.tab === 'settings') this.wireSettings();
    else if (this.tab === 'tests') this.wireTests();
    else if (this.tab === 'controls') this.wireControls();
  }

  page() {
    switch (this.tab) {
      case 'map': return this.mapPage();
      case 'planets': return this.planetsPage();
      case 'tests': return this.testsPage();
      case 'controls': return this.controlsPage();
      default: return this.settingsPage();
    }
  }

  // ---- map: the 3D map behind, the focused world's card on the right
  mapPage() {
    return `<div class="mapPanel" id="mapPanel"></div>`;
  }

  wireMap() { this._panelFor = undefined; this.tick(); }

  // each frame while open: keep the map's card on the focused world
  tick() {
    if (!this.open || this.tab !== 'map') return;
    const g = this.game, panel = this.el.querySelector('#mapPanel');
    if (!g || !panel) return;
    const b = g.map.focus;
    if (b === this._panelFor) return;
    this._panelFor = b;
    if (!b || b.isStar) {
      const s = g.system.star;
      panel.innerHTML = `<div class="world sun"><div><h4>${esc(s.name)} <span>${s.spectral} star</span></h4>
        <p class="note">Drag to turn the map, wheel to zoom, click a world (controller: right stick, triggers, D-pad left / right) to focus it.</p></div></div>`;
      return;
    }
    const sb = g.system.bodies.find((x) => x.id === b.id);
    panel.innerHTML = this.card(g.system, sb, true, true, g.seed);
    this.fillPortraits(panel, g.system, true);
    this.wireCardButtons(panel);
  }

  // ---- the catalog
  catalogSystem() {
    const g = this.game;
    if (!this.catSeed || (g && this.catSeed === g.seed)) return { sys: g.system, current: true, seed: g.seed };
    if (!this._cat || this._cat.seed !== this.catSeed) this._cat = { seed: this.catSeed, sys: generateSystem(this.catSeed) };
    return { sys: this._cat.sys, current: false, seed: this.catSeed };
  }

  planetsPage() {
    const { sys, current, seed } = this.catalogSystem();
    const s = sys.star;
    const order = [];
    for (const pl of sys.bodies.filter((b) => b.kind === 'planet')) order.push(pl, ...sys.bodies.filter((b) => b.kind === 'moon' && b.parentId === pl.id));
    return `<div class="cat">
      <div class="catHead">
        <div><div class="label">${current ? 'This system' : 'Another system'}</div>
          <h3>${esc(s.name)} <span>${s.catalog} · ${s.spectral} · ${s.luminosity.toFixed(2)} L☉ · ${Math.round(s.teff)} K · ${s.age.toFixed(1)} Gyr · ${order.filter((b) => b.kind === 'planet').length} planets, ${order.filter((b) => b.kind === 'moon').length} moons</span></h3></div>
        <div class="seedrow"><label class="label" for="catSeed">Seed</label><input id="catSeed" value="${esc(seed)}" spellcheck="false" aria-label="System seed">
          <button id="catLook" type="button">Look up</button><button id="catRandom" type="button">Random</button>
          ${current ? '' : `<button id="catHere" type="button">Back to this system</button><button id="catTravel" type="button" class="primary">Travel there</button>`}</div>
      </div>
      <canvas class="schematic" id="catSchem"></canvas>
      <div class="worlds">${order.map((b) => this.card(sys, b, current, false, seed)).join('')}</div>
    </div>`;
  }

  // one world: its picture and what it is
  card(sys, b, current, onMap, seed) {
    const fmtT = (K) => `${Math.round(K - 273.15)} °C`;
    const rows = [];
    const row = (k, v) => rows.push(`<dt>${k}</dt><dd>${v}</dd>`);
    row('Zone', esc(zoneOf(sys, b)));
    if (b.kind === 'moon') row('Orbit', `${Math.round(b.orbit.a / 1000).toLocaleString()} km${b.eclipse >= 0.01 ? ` · in its planet's shadow ${(b.eclipse * 100).toFixed(b.eclipse < 0.1 ? 1 : 0)}% of the time` : ''}`);
    else row('Orbit', `${b.aAU.toFixed(2)} AU · ${b.insolation >= 0.1 ? b.insolation.toFixed(2) : b.insolation.toFixed(3)}× Earth's sunlight`);
    row('Day', b.rotation.locked ? 'tidally locked' : `${b.rotation.periodRealH.toFixed(1)} h`);
    if (b.solid) row('Surface', `${fmtT(b.Tsurf)} (${fmtT(b.Tmin)} to ${fmtT(b.Tmax)})`);
    else row('Cloud tops', `${Math.round(b.Teq)} K`);
    const gee = b.gravity / 9.81;
    row('Gravity', `${gee >= 0.1 ? gee.toFixed(2) : gee.toFixed(3)} g · ${b.radiusEarth >= 0.1 ? b.radiusEarth.toFixed(2) + ' Earth radii' : Math.round(b.R / 1000).toLocaleString() + ' km radius'}`);
    const a = b.atmosphere;
    if (a && a.type !== 'giant') {
      const gases = Object.entries(a.comp || {}).sort((x, y) => y[1] - x[1]).slice(0, 2).map(([k, f]) => `${GAS[k] || k} ${Math.round(f * 100)}%`).join(', ');
      row('Air', `${a.pressure < 0.01 ? a.pressure.toExponential(1) : a.pressure.toFixed(2)} bar${gases ? ' · ' + gases : ''}`);
    } else if (!a && b.solid) row('Air', 'none');
    if (b.terrain && b.terrain.ocean > 0.01 && b.terrain.liquid) row('Seas', `${Math.round(b.terrain.ocean * 100)}% ${b.terrain.liquid}`);
    // life and history (worldsim/evolve.js: stages, chemistry, extinctions, what's under way now)
    const H = b.history;
    if (H && H.lifeStage > 0) {
      const chem = H.solvent && H.solvent !== 'water' ? ` · in ${H.solvent}` : '';
      row('Life', `${esc(H.lifeStageName)}${chem}${H.diversity > 0.02 ? ` · diversity ${Math.round(H.diversity * 100)}% of Earth's` : ''}`);
    } else if (H && H.lifeEver) {
      const last = (H.extinctions || []).filter((e) => e.loss >= 0.99).pop();
      row('Life', `none now${last ? ` (ended ${agoText(last.ago)})` : ''}`);
    } else if (b.life) row('Life', esc(b.life.level));
    if (H && b.solid && H.airType && H.airType !== 'none') row('Sky', esc(H.airType) + (H.seaPH != null ? ` · seas pH ${H.seaPH.toFixed(1)}` : ''));
    if (H && b.solid) row('Field', H.field > 0.05 ? `${H.field.toFixed(1)}× Earth's` : 'none');
    const now = [];
    if (H && H.fresh) now.push(H.fresh.kind === 'just-boiled' ? `struck ${agoText(H.fresh.agoYears / 1e9)}: ${H.fresh.phase}` : `struck ${agoText(H.fresh.agoYears / 1e9)}: impact winter, ${Math.round(H.fresh.light * 100)}% daylight`);
    if (H && H.eruption) now.push('flood basalts erupting');
    if (H && H.recovering) now.push(`recovering from a die-off ${Math.round(H.recovering.agoMyr)} Myr ago`);
    if (now.length) row('Now', esc(now.join(' · ')));
    if (b.moons && b.moons.length) row('Moons', `${b.moons.length}${b.rings ? ' · rings' : ''}`);
    else if (b.rings) row('Rings', 'yes');
    if (b.esi > 0.3) row('ESI', b.esi.toFixed(2));
    const key = `${seed}:${b.id}`;
    const home = current && b.id === sys.startBodyId;
    const btns = current ? `<div class="cardBtns">${onMap ? '' : `<button type="button" data-showmap="${b.id}">Show on map</button>`}<button type="button" data-target="${b.id}">Target</button>${onMap ? `<button type="button" data-catalog="${b.id}">In the catalog</button>` : ''}</div>` : '';
    return `<article class="world ${b.kind === 'moon' ? 'moon' : ''}" data-world="${b.id}">
      <canvas width="96" height="96" data-portrait="${key}" data-body="${b.id}"></canvas>
      <div><h4>${esc(b.name)} <span>${esc(b.label)}${home ? ' · your landing site' : ''}</span></h4>
        <dl>${rows.join('')}</dl>
        <div class="cover" data-cover="${key}">${b.solid ? '<span class="note">surveying…</span>' : ''}</div>
        ${btns}</div></article>`;
  }

  wirePlanets() {
    const { sys, current, seed } = this.catalogSystem();
    const root = this.el;
    const canvas = root.querySelector('#catSchem');
    if (canvas) requestAnimationFrame(() => drawSchematic(sys, canvas));
    const input = root.querySelector('#catSeed');
    const look = () => {
      const s = normalizeSeed(input.value);
      if (!s) { input.classList.add('bad'); return; }
      this.catSeed = s;
      this.render();
    };
    root.querySelector('#catLook').onclick = look;
    input.onchange = look;
    input.onkeydown = (e) => { if (e.key === 'Enter') look(); e.stopPropagation(); };
    root.querySelector('#catRandom').onclick = () => { this.catSeed = randomSeedString(); this.render(); };
    const here = root.querySelector('#catHere');
    if (here) here.onclick = () => { this.catSeed = null; this.render(); };
    const go = root.querySelector('#catTravel');
    if (go) go.onclick = () => this.o.travel(seed);
    this.fillPortraits(root, sys, current);
    this.wireCardButtons(root);
  }

  wireCardButtons(root) {
    const g = this.game;
    for (const b of root.querySelectorAll('[data-target]')) b.onclick = () => {
      const body = g.universe.bodies[+b.dataset.target];
      g.players[0].target = body;
      g.requestSurvey(body, 80);
      b.textContent = 'Targeted';
    };
    for (const b of root.querySelectorAll('[data-showmap]')) b.onclick = () => {
      this.setTab('map');
      g.map.select(g.universe.bodies[+b.dataset.showmap]);
    };
    for (const b of root.querySelectorAll('[data-catalog]')) b.onclick = () => {
      this.setTab('planets');
      const card = this.el.querySelector(`[data-world="${b.dataset.catalog}"]`);
      if (card) { card.scrollIntoView({ block: 'center' }); card.classList.add('hl'); }
    };
  }

  // pictures (and what covers each world) from the terrain workers; giants here
  fillPortraits(root, sys, current) {
    const g = this.game;
    for (const cv of root.querySelectorAll('canvas[data-portrait]')) {
      const key = cv.dataset.portrait, id = +cv.dataset.body;
      const b = sys.bodies.find((x) => x.id === id);
      const have = this.portraits.get(key);
      if (have && have !== 'pending') { this.paint(cv, key, have); continue; }
      if (have === 'pending') continue;
      if (b.giant) { const r = giantPortrait(b, { size: 96 }); this.store(key, r); continue; }
      if (!b.terrain) continue;
      this.portraits.set(key, 'pending');
      const msg = { type: 'portrait', body: current ? b.id : key, options: { size: 96, ...portraitLook(b) } };
      if (!current) msg.terrain = b.terrain;
      g.pool.submit(msg, 30).promise.then((r) => this.store(key, r), (err) => { console.warn('portrait', err); this.portraits.delete(key); });
    }
  }

  store(key, r) {
    const img = new ImageData(new Uint8ClampedArray(r.px), r.size, r.size);
    const rec = { img, cover: r.cover };
    this.portraits.set(key, rec);
    for (const cv of this.el.querySelectorAll(`canvas[data-portrait="${key}"]`)) this.paint(cv, key, rec);
  }

  paint(cv, key, rec) {
    const ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, cv.width, cv.height);
    if (rec.img.width === cv.width) ctx.putImageData(rec.img, 0, 0);
    else { createImageBitmap(rec.img).then((bm) => ctx.drawImage(bm, 0, 0, cv.width, cv.height)); }
    const box = cv.parentElement.querySelector(`[data-cover="${key}"]`);
    if (box && rec.cover) box.innerHTML = rec.cover.slice(0, 6).map((c) => `<span class="chip">${esc(c.name)} ${Math.round(c.frac * 100)}%</span>`).join('');
  }

  // ---- settings (the old pause menu)
  settingsPage() {
    const S = this.o.settings, g = this.game;
    const P = this.o.players.info();
    const url = `${location.origin}${location.pathname}?seed=${encodeURIComponent(g ? g.seed : '')}`;
    const r = this.o.input.stats.rate;
    const mouse = r ? `<div class="label" style="text-transform:none; letter-spacing:0; opacity:0.7">Mouse input: mousemove ${r.m.toFixed(0)}/s (${r.mPx.toFixed(0)} px/s) · pointer ${r.p.toFixed(0)}/s (${r.pPx.toFixed(0)} px/s) · using ${r.src}</div>` : '';
    return `<div class="card">
      <div class="rows" style="grid-template-columns:auto 1fr; gap:8px 14px; align-items:center">
        <label class="label" for="setSens">Mouse</label><input id="setSens" type="range" min="0.2" max="6" step="0.05" value="${S.sensitivity}">
        <label class="label" for="setFov">Field of view</label><input id="setFov" type="range" min="55" max="100" step="1" value="${S.fov}">
        <label class="label" for="setScale">Resolution</label><input id="setScale" type="range" min="0.5" max="1" step="0.05" value="${S.scale}">
        <label class="label" for="setInv">Invert Y</label><input id="setInv" type="checkbox" ${S.invertY ? 'checked' : ''}>
        <label class="label" for="setTone">Highlights</label><select id="setTone"><option value="agx" ${S.tone !== 'aces' ? 'selected' : ''}>Wide range (AgX)</option><option value="aces" ${S.tone === 'aces' ? 'selected' : ''}>Punchy (ACES)</option></select>
      </div>
      ${mouse}
      <div class="label">Players</div>
      <div class="seedrow">${P.count > 1
        ? `<span class="label" style="text-transform:none; letter-spacing:0">Player 2 on controller ${P.pad + 1}</span><button id="p2Leave" type="button">Remove player 2</button><select id="setSplit" aria-label="Split screen"><option value="top-bottom" ${S.split !== 'side-by-side' ? 'selected' : ''}>Split top / bottom</option><option value="side-by-side" ${S.split === 'side-by-side' ? 'selected' : ''}>Split side by side</option></select>`
        : `<button id="p2Join" type="button">Add player 2</button><span id="p2Hint" class="label" style="text-transform:none; letter-spacing:0">${P.waiting ? 'Press Start on player 2\'s controller' : 'or press Start on a second controller'}</span>`}</div>
      <div class="label">System seed</div>
      <div class="seedrow"><input id="shareUrl" readonly value="${url}" aria-label="Share link"><button id="copyUrl" type="button">Copy link</button></div>
      <div class="seedrow"><button id="tests" type="button">Test scenes</button><button id="toBriefing" type="button">Change system</button></div>
    </div>`;
  }

  wireSettings() {
    const $ = (id) => this.el.querySelector('#' + id);
    const S = this.o.settings, save = () => { this.o.applySettings(); this.o.saveSettings(); };
    $('setSens').oninput = (e) => { S.sensitivity = +e.target.value; save(); };
    $('setFov').oninput = (e) => { S.fov = +e.target.value; save(); };
    $('setScale').onchange = (e) => { S.scale = +e.target.value; save(); const g = this.game; if (g) { g.engine.renderScale = S.scale; g.layout(); } };
    $('setInv').onchange = (e) => { S.invertY = e.target.checked; save(); };
    $('setTone').onchange = (e) => { S.tone = e.target.value; save(); };
    $('copyUrl').onclick = () => {
      const el = $('shareUrl');
      navigator.clipboard.writeText(el.value).then(() => { $('copyUrl').textContent = 'Copied'; }, () => { el.select(); });
    };
    $('tests').onclick = () => this.setTab('tests');
    $('toBriefing').onclick = () => this.o.toBriefing();
    if ($('p2Join')) $('p2Join').onclick = () => { $('p2Hint').textContent = this.o.players.join(); };
    if ($('p2Leave')) $('p2Leave').onclick = () => { this.o.players.leave(); this.render(); };
    if ($('setSplit')) $('setSplit').onchange = (e) => { S.split = e.target.value; save(); };
  }

  // ---- test scenes (from Settings)
  testsPage() {
    return `<div class="card help"><h2>Test scenes</h2>
      <div class="scenes">${this.o.tests.map((t, i) => `<button type="button" data-scene="${i}"><b>${t.label}</b><span>${t.note}</span></button>`).join('')}</div>
      <label class="check"><input id="meterOn" type="checkbox" ${this.game && this.game.showMeter ? 'checked' : ''}> Show the exposure readout (top of the screen)</label>
      <div class="seedrow"><button id="testsBack" type="button">Back to settings</button></div></div>`;
  }

  wireTests() {
    for (const el of this.el.querySelectorAll('[data-scene]')) el.onclick = () => { const g = this.game; if (g) { this.o.tests[+el.dataset.scene].run(g); this.o.resume(); } };
    this.el.querySelector('#meterOn').onchange = (e) => { if (this.game) this.game.showMeter = e.target.checked; };
    this.el.querySelector('#testsBack').onclick = () => this.setTab('settings');
  }

  // ---- controls: the keyboard, then the controller in each mode
  controlsPage() {
    const g = this.game;
    const sub = [['keys', 'Keyboard &amp; mouse'], ['flight', 'Controller · flight'], ['foot', 'Controller · on foot'], ['eva', 'Controller · spacewalk']];
    const body = g ? g.screenHud.helpBody(this.ctrlTab === 'keys' ? 'keys' : 'pad', this.ctrlTab === 'keys' ? 'flight' : this.ctrlTab) : '';
    return `<div class="card help"><div class="tabs sub">${sub.map(([k, l]) => `<button type="button" data-ctab="${k}" class="${k === this.ctrlTab ? 'on' : ''}">${l}</button>`).join('')}</div>${body}</div>`;
  }

  wireControls() {
    for (const b of this.el.querySelectorAll('[data-ctab]')) b.onclick = () => { this.ctrlTab = b.dataset.ctab; this.render(); };
  }
}
