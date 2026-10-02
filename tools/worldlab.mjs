// World lab: run the world simulation on a generated planet and render
// before / after maps, outside the game.
//
//   node tools/worldlab.mjs SEED [bodyId|start] [--N 128] [--steps 100] [--dt 1e5]
//        [--K 1e-5] [--up 5e6] [--out scratch-dir] [--W 1024]
//
// Writes <out>/<name>-map.png (before above, after below: hillshade, rivers,
// lakes) and <out>/<name>-zoom.png (a region around the biggest river, before
// left, after right), and prints timings.

import { generateSystem } from '../src/gen/system.js';
import { TerrainGenerator, S_LEN, S_H, S_MOIST, S_TEMP } from '../src/gen/terrain.js';
import { SimGrid } from '../src/gen/worldsim/grid.js';
import { Erosion } from '../src/gen/worldsim/erosion.js';
import { Tectonics } from '../src/gen/worldsim/tectonics.js';
import { Impacts } from '../src/gen/worldsim/impacts.js';
import { planetHistory } from '../src/gen/worldsim/history.js';
import { barrenWorld } from '../src/gen/worldsim/barren.js';
import { stagnantWorld } from '../src/gen/worldsim/stagnant.js';
import { worldSim } from '../src/gen/worldsim/world.js';
import { findFeatures } from '../src/gen/worldsim/features.js';
import { ROCKS } from '../src/gen/worldsim/lithology.js';
import { Rng } from '../src/core/rng.js';
import { writePNG } from './png.mjs';
import fs from 'node:fs';

const args = process.argv.slice(2);
const flag = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const pos = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--')));
const seed = pos[0] || 'FSPB-8DTW';
const N = +flag('N', 128), steps = +flag('steps', 100), dt = +flag('dt', 1e5);
const K = +flag('K', 1e-5), upT = +flag('up', 5e6), kd = +flag('kd', 0);
// 'auto' (default): the world's history picks the processes (worldsim/world.js);
// 'tect' / 'stagnant' / 'barren': force one; 'smooth' / 'raw': erode the old generator's surface
const init = flag('init', 'auto');
const Nt = +flag('Nt', 128), myr = +flag('myr', 200);
const deepK = +flag('deepK', 3e-7), deepKd = +flag('deepKd', 2); // erosion alongside the plates (0: none)
const out = flag('out', '.'), W = +flag('W', 1024), W_ = W;
fs.mkdirSync(out, { recursive: true });

const sys = generateSystem(seed);
const body = sys.bodies[pos[1] && pos[1] !== 'start' ? +pos[1] : sys.startBodyId];
const p = body.terrain;
const gen = new TerrainGenerator(p);
const R = body.R;
const ms = (t) => `${(performance.now() - t).toFixed(0)} ms`;
console.log(`${body.name} (${body.label}) R ${(R / 1000).toFixed(0)} km, ocean ${(p.ocean * 100).toFixed(0)}% ${p.liquid || ''}, relief ${p.relief.toFixed(0)} m`);

// the world's history first: its story, and the climate the epochs run under
const HIST = planetHistory(body, sys.bodies[0]);
console.log(`history: ${HIST.age.toFixed(2)} Gyr, volcanic activity ${HIST.activity}${HIST.lifeEver === false || (HIST.life && HIST.life.never) ? ', no life ever' : ''}${HIST.regime ? ', ' + HIST.regime + ' lid' : ''}`);
for (const l of HIST.summary) console.log('  ' + l);
fs.mkdirSync(out, { recursive: true });
drawHistory(HIST, `${out}/${body.name}-history.png`);
if (args.includes('--history')) process.exit(0);

let t0 = performance.now();
if (init === 'auto') {
  const host = body.parentId > 0 ? sys.bodies[body.parentId] : null;
  const Wd = worldSim(body, sys.bodies[0], { N: +flag('N', 256), Nt, myr: +flag('myr', 300), steps: +flag('steps', 60), dt: +flag('dt', 2.5e5), host, log: (m) => console.log(m) });
  console.log(`in ${ms(t0)}${Wd.stats ? ' ' + JSON.stringify(Wd.stats) : ''}${Wd.riverStyle ? ', rivers ' + Wd.riverStyle : ''}`);
  const name = `${body.name}-auto-${Wd.path}`;
  let rgb;
  if (Wd.path === 'plates') rgb = render(Wd.G, Wd.h, Wd.E, W_);
  else if (Wd.path === 'stagnant') rgb = renderBarren(Wd.G, { h: Wd.h, mare: Wd.volc, fresh: new Float32Array(Wd.G.n), river: Wd.river }, W_, [1.0, 0.72, 0.52]);
  else rgb = renderBarren(Wd.G, Wd, W_, p.icy ? [0.92, 0.97, 1.05] : [1, 0.98, 0.95]);
  // what a surveyor would name first
  const F = findFeatures(Wd.G, Wd.h, { E: Wd.E, scale: body.R / body.radiusM, craters: Wd.craters || [], volcanoes: Wd.volcanoes, glaciers: Wd.glaciers, top: 5 });
  if (Wd.glaciers) paintIce(rgb, W_, Wd.G, Wd.glaciers.ice);
  const ll = (f) => `${f.lat.toFixed(0)},${f.lon.toFixed(0)}`;
  console.log('features:');
  console.log('  peaks:    ' + F.peaks.map((f) => `${Math.round(f.height)} m (prominence ${Math.round(f.prominence)}) @${ll(f)}`).join('; '));
  console.log('  ranges:   ' + F.ranges.map((f) => `${Math.round(f.lengthKm)} km long, ${Math.round(f.areaKm2 / 1000)}k km2, top ${Math.round(f.peak)} m`).join('; '));
  if (F.rivers.length) console.log('  rivers:   ' + F.rivers.map((f) => `${Math.round(f.lengthKm)} km to the sea @${ll(f)}`).join('; '));
  if (F.gorges.length) console.log('  gorges:   ' + F.gorges.map((f) => `${f.kind} ${Math.round(f.depth)} m deep @${ll(f)}`).join('; '));
  if (F.lakes.length) console.log('  lakes:    ' + F.lakes.map((f) => `${Math.round(f.areaKm2)} km2, ${Math.round(f.depth)} m deep`).join('; '));
  if (F.trenches.length) console.log('  trenches: ' + F.trenches.map((f) => `${Math.round(f.depth)} m @${ll(f)}`).join('; '));
  if (F.craters.length) console.log('  craters:  ' + F.craters.map((f) => `${Math.round(f.diameterKm)} km`).join('; '));
  if (F.highest) console.log(`  highest:  ${Math.round(F.highest.height)} m @${ll(F.highest)}`);
  if (F.deepestWet) console.log(`  deepest wet spot: ${Math.round(F.deepestWet.depth)} m below sea level @${ll(F.deepestWet)}`);
  if (F.lowestDry) console.log(`  deepest dry spot: ${Math.round(-F.lowestDry.height)} m below sea level @${ll(F.lowestDry)}`);
  if (F.continents.length) console.log('  continents: ' + F.continents.map((f) => `${Math.round(f.areaKm2 / 1e6 * 10) / 10}M km2`).join('; '));
  if (F.islands.length) console.log('  islands:  ' + F.islands.map((f) => `${Math.round(f.areaKm2 / 1000)}k km2`).join('; '));
  if (F.archipelagos.length) console.log('  groups:   ' + F.archipelagos.map((f) => `${f.kind} of ${f.islands} over ${Math.round(f.spanKm)} km @${ll(f)}`).join('; '));
  if (F.waterfalls.length) console.log('  waterfall sites (steepest river drops): ' + F.waterfalls.map((f) => `${Math.round(f.drop)} m @${ll(f)}`).join('; '));
  if (F.cliffs.length) console.log('  cliffs:   ' + F.cliffs.map((f) => `${Math.round(f.drop)} m @${ll(f)}`).join('; '));
  if (F.plateaus.length) console.log('  plateaus: ' + F.plateaus.map((f) => `${Math.round(f.areaKm2 / 1000)}k km2 at ${Math.round(f.height)} m`).join('; '));
  if (F.iceFields && F.iceFields.length) console.log('  ice:      ' + F.iceFields.map((f) => `${f.kind} ${Math.round(f.areaKm2 / 1000)}k km2, ${Math.round(f.thickness)} m thick`).join('; '));
  if (F.fjords && F.fjords.length) console.log('  fjords:   ' + F.fjords.map((f) => `cut ${Math.round(f.depthCut)} m @${ll(f)}`).join('; '));
  if (F.volcanoes && F.volcanoes.length) console.log('  volcanoes: ' + F.volcanoes.map((f) => (f.heightM ? `${Math.round(f.heightM)} m shield` : 'hotspot') + ` @${ll(f)}`).join('; '));
  markFeatures(rgb, W_, F);
  writePNG(`${out}/${name}-map.png`, W_, W_ / 2, rgb);
  if (Wd.rock) {
    writePNG(`${out}/${name}-rock.png`, W_, W_ / 2, renderRock(Wd.G, Wd.h, Wd.rock, W_));
    const counts = {}; for (const r of Wd.rock) { if (true) counts[ROCKS[r].name] = (counts[ROCKS[r].name] || 0) + 1; }
    console.log('  exposed rock: ' + Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${(v / Wd.G.n * 100).toFixed(0)}%`).join(', '));
  }
  console.log(`wrote ${out}/${name}-map.png`);
  process.exit(0);
}
const G = new SimGrid(N, R);
console.log(`grid N=${N}: ${G.n} cells, ~${(G.spacing / 1000).toFixed(1)} km, built in ${ms(t0)}`);

// a stagnant-lid world (Mars-like): giants on a volcanic rise, a rift canyon,
// impacts, and an early wet era from the history
if (init === 'stagnant') {
  t0 = performance.now();
  const ev = (k) => HIST.events.find((e) => e.kind === k);
  const wet = ev('seas') && ev('drying') ? [ev('seas').t, ev('drying').t] : null;
  const water = body.comp.water || 0;
  const seaFrac = wet ? Math.min(0.35, Math.max(0, Math.log10(Math.max(water, 1e-7) / 1e-5) * 0.12)) : 0;
  const S = stagnantWorld(G, { rng: new Rng(p.seed).fork('stagnant'), body, age: HIST.age, scale: G.R / body.radiusM, wet, seaFrac, tier: HIST.tier, volcEnd: 1 + 15 * Math.pow(body.massEarth, 0.6) });
  console.log(`stagnant: ${JSON.stringify(S.stats)}, wet era ${wet ? wet.map((x) => x.toFixed(2)).join('-') + ' Gyr, sea ' + (seaFrac * 100).toFixed(0) + '%' : 'none'}, in ${ms(t0)}`);
  const name = `${body.name}-N${N}-stagnant`;
  writePNG(`${out}/${name}-map.png`, W_, W_ / 2, renderBarren(G, { h: S.h, mare: S.volc, fresh: new Float32Array(G.n), river: S.river }, W_, [1.0, 0.72, 0.52]));
  console.log(`wrote ${out}/${name}-map.png`);
  process.exit(0);
}

// a barren world: the whole age of impacts (and lava in the basins while it's hot)
if (init === 'barren') {
  t0 = performance.now();
  const massE = body.massEarth;
  const W = barrenWorld(G, { rng: new Rng(p.seed).fork('barren'), body, age: HIST.age, scale: G.R / body.radiusM, volcEnd: 1 + 15 * Math.pow(massE, 0.6), rate: +flag('impacts', 1) });
  console.log(`barren: ${W.stats.craters} craters >= ${(3 * G.spacing / 1000 / (G.R / body.radiusM)).toFixed(0)} km (real), ${W.stats.basins} basins, ${W.stats.flooded} flooded, biggest ${W.stats.biggest.toFixed(0)} km, in ${ms(t0)}`);
  const name = `${body.name}-N${N}-barren`;
  const mapRGB = renderBarren(G, W, W_);
  writePNG(`${out}/${name}-map.png`, W_, W_ / 2, mapRGB);
  console.log(`wrote ${out}/${name}-map.png`);
  process.exit(0);
}

// the generator's terrain, low-passed to the grid: the starting surface
t0 = performance.now();
const s = new Float64Array(S_LEN);
const h0 = new Float64Array(G.n), rain = new Float64Array(G.n), temp = new Float64Array(G.n);
for (let c = 0; c < G.n; c++) {
  gen.sample(G.dir[c * 3], G.dir[c * 3 + 1], G.dir[c * 3 + 2], G.spacing, s);
  h0[c] = s[S_H]; temp[c] = s[S_TEMP];
  rain[c] = Math.max(0.05, s[S_MOIST]) * (s[S_TEMP] > 263 ? 1 : 0.3);
}
console.log(`sampled in ${ms(t0)}`);
const sea = !!p.liquid && p.liquid !== 'lava' && p.ocean > 0;

// plate tectonics on a coarse grid, from the generator's continents: its
// heights and uplift become the erosion's starting surface and uplift
let Ut = null, hotDirs = [];
const pressure = body.atmosphere ? body.atmosphere.pressure || 0 : 0;
const impactRate = +flag('impacts', 1); // 1 = realistic
if (init === 'tect') {
  t0 = performance.now();
  const Gt = new SimGrid(Nt, R);
  const cont = new Float64Array(Gt.n), relief = new Float64Array(Gt.n), rainT = new Float64Array(Gt.n);
  for (let c = 0; c < Gt.n; c++) {
    gen.sample(Gt.dir[c * 3], Gt.dir[c * 3 + 1], Gt.dir[c * 3 + 2], Gt.spacing, s);
    cont[c] = Math.min(1, Math.max(0, (s[S_H] + 600) / 700));
    relief[c] = Math.min(25, Math.max(0, s[S_H]) / 150 * 0.6); // its ranges: old, thick crust (km)
    rainT[c] = Math.max(0.05, s[S_MOIST]) * (s[S_TEMP] > 263 ? 1 : 0.3);
  }
  const hotFlag = flag('hot', null);
  const T = new Tectonics(Gt, { rng: new Rng(p.seed).fork('tectonics'), plates: p.plates, cont, relief, ocean: p.ocean, hotspots: hotFlag == null ? undefined : +hotFlag, volcanism: p.volcanism, activity: HIST.tier });
  if (impactRate > 0) T.impacts = new Impacts(Gt, { rng: new Rng(p.seed).fork('impacts'), g: body.gravity, pressure, rate: impactRate });
  console.log(`volcanic activity: ${T.activity.name}, ${T.hot.length} hotspots`);
  const ht = new Float64Array(Gt.n), ut = new Float64Array(Gt.n);
  T.heights(ht, null);
  const Et = deepK > 0 ? new Erosion(Gt, ht, { sea, K: deepK, rain: rainT, m: 0.45, kd: deepKd }) : null;
  const frames = [];
  const every = myr / 5, tdt = +flag('tdt', 0.5);
  for (let k = 0; k <= myr / tdt; k++) {
    const tm = k * tdt;
    if (tm % every === 0) { T.heights(ht, null); frames.push(renderPlates(Gt, ht, T, 512)); }
    if (tm < myr) {
      if (Et) Et.rainK = HIST.series.t.length ? HIST.at(myr - tm, 'rain') : 1; // the climate then, vs now
      if (Et) T.stepEroded(tdt, Et); else T.step(tdt);
    }
    if (tm % 40 === 0) {
      let ages = 0, na = 0;
      for (let c = 0; c < Gt.n; c++) { const P = T.plates[T.owner[c]], q = T.src[c]; if (P.cont[q] < 0.5) { ages += P.age[q]; na++; } }
      const land = []; for (let c = 0; c < Gt.n; c++) if (ht[c] > 0) land.push(ht[c]); land.sort((a, b) => a - b);
      let ca = 0, ta = 0, cv = 0; for (let c = 0; c < Gt.n; c++) { ta += Gt.area[c]; const P = T.plates[T.owner[c]]; if (P.cont[T.src[c]] > 0.5) { ca += Gt.area[c]; cv += Gt.area[c] * P.thick[T.src[c]]; } }
      const live = T.plates.filter((q) => !q.dead).length;
      let frameCont = 0; for (const q of T.plates) if (!q.dead) for (let x = 0; x < Gt.n; x++) if (q.own[x] && q.cont[x] > 0.5) frameCont++;
      process.stdout.write(`  [frame continental cells ${frameCont}, visible ${(() => { let v = 0; for (let c = 0; c < Gt.n; c++) if (T.plates[T.owner[c]].cont[T.src[c]] > 0.5) v++; return v; })()}]\n`);
      console.log(`  ${tm} Myr: ${live} plates, collapse x${(T.collapse ?? 1).toFixed(2)}, continental crust ${(ca / ta * 100).toFixed(0)}% (mean ${(cv / ca).toFixed(1)} km), sea level ${(T.seaLevel ?? 0).toFixed(0)} m, land ${(landFrac(ht) * 100).toFixed(0)}%, median land ${(land[land.length >> 1] || 0).toFixed(0)} m, mean sea-floor age ${(ages / na).toFixed(0)} Myr ${JSON.stringify(T.stats || {})}`); if (T.stats) for (const k in T.stats) T.stats[k] = 0;
    }
  }
  T.heights(ht, ut);
  hotDirs = T.hot.map((H) => H.at);
  if (T.impacts) console.log(`impacts (>= ${(3 * Gt.spacing / 1000).toFixed(0)} km): ${T.impacts.events.map((e) => `${e.D.toFixed(0)} km @${e.t} Myr`).join(', ') || 'none'}`);
  console.log('events:', (T.events || []).map((e) => `${e.t} Myr ${e.kind} ${e.plate}->${e.into}`).join(', ') || 'none');
  console.log(`tectonics N=${Nt} (${(Gt.spacing / 1000).toFixed(1)} km), ${p.plates} plates, ${myr} Myr in ${ms(t0)}; heights ${min(ht).toFixed(0)}..${max(ht).toFixed(0)} m, land ${(landFrac(ht) * 100).toFixed(0)}%, sea level moved ${T.seaLevel.toFixed(0)} m`);
  const sheet = new Uint8Array(1024 * 768 * 3);
  frames.forEach((f, i) => { const ox = (i % 2) * 512, oy = Math.floor(i / 2) * 256; for (let y = 0; y < 256; y++) sheet.set(f.subarray(y * 512 * 3, (y + 1) * 512 * 3), ((oy + y) * 1024 + ox) * 3); });
  writePNG(`${out}/${body.name}-plates.png`, 1024, 768, sheet);
  Ut = new Float64Array(G.n);
  const d = [0, 0, 0];
  for (let c = 0; c < G.n; c++) {
    d[0] = G.dir[c * 3]; d[1] = G.dir[c * 3 + 1]; d[2] = G.dir[c * 3 + 2];
    h0[c] = Gt.sample(ht, d); Ut[c] = Gt.sample(ut, d);
  }
}

// uplift: the starting surface, smoothed, raised over upT years (the ranges
// and continents stay where the generator put them; the valleys are cut anew)
const up = smooth(G, Float64Array.from(h0, (x) => Math.max(0, x)), 3);
let h;
if (init === 'raw') h = Float64Array.from(h0);
else if (init === 'tect') { h = new Float64Array(G.n); for (let c = 0; c < G.n; c++) h[c] = h0[c] + (h0[c] > 0 ? jitter(c) * 5 : 0); }
else {
  // land: the smoothed shape plus a metre of jitter (water needs something to
  // choose its first paths by); the sea floor as generated
  h = new Float64Array(G.n);
  for (let c = 0; c < G.n; c++) h[c] = h0[c] < 0 ? h0[c] : Math.max(0.5, up[c]) + jitter(c);
}
const E = new Erosion(G, h, { sea, K, rain, m: 0.45, kd });
for (let c = 0; c < G.n; c++) E.U[c] = Ut ? Ut[c] : h0[c] > 0 ? up[c] / upT : 0;

// rivers on the starting surface, for the "before" maps
const before = new Erosion(G, Float64Array.from(h0), { sea, K, rain });
before.findBase(); before.route(); before.drain();

const Ef = impactRate > 0 ? new Impacts(G, { rng: new Rng(p.seed).fork('impacts-fine'), g: body.gravity, pressure, rate: impactRate }) : null;
t0 = performance.now();
for (let k = 0; k < steps; k++) {
  if (Ef) Ef.step(dt / 1e6, 3 * G.spacing / 1000, (c, dh) => { h[c] += h[c] < 0 ? dh * 0.5 : dh; }, k * dt / 1e6);
  E.step(dt);
  if ((k + 1) % Math.max(1, steps / 5 | 0) === 0) console.log(`  ${((k + 1) * dt / 1e6).toFixed(1)} Myr  max ${max(h).toFixed(0)} m  land ${(landFrac(h) * 100).toFixed(1)}%`);
}
const per = (performance.now() - t0) / steps;
console.log(`${steps} steps in ${ms(t0)} (${per.toFixed(0)} ms/step)`);
// keep the generator's relief: scale the land so its 99th percentile matches
const q0 = landQuantile(h0, 0.99), q1 = landQuantile(h, 0.99);
if (Ef) console.log(`fine-epoch impacts (>= ${(3 * G.spacing / 1000).toFixed(0)} km): ${Ef.events.map((e) => `${e.D.toFixed(0)} km`).join(', ') || 'none'}`);
const sc = q1 > 0 && !Ut ? q0 / q1 : 1; // (tectonic heights are physical: left as they are)
for (let c = 0; c < G.n; c++) if (h[c] > 0) h[c] *= sc;
console.log(`land p99 ${q1.toFixed(0)} m -> ${q0.toFixed(0)} m (x${sc.toFixed(2)}), land ${(landFrac(h0) * 100).toFixed(1)}% -> ${(landFrac(h) * 100).toFixed(1)}%`);
E.findBase(); E.route(); E.drain();

// ---- maps
const name = `${body.name}-N${N}-${init}${kd ? '-kd' + kd : ''}`;
const top = render(G, h0, before, W), bot = render(G, h, E, W);
const H = W / 2;
const both = new Uint8Array(W * H * 2 * 3);
both.set(top, 0); both.set(bot, W * H * 3);
writePNG(`${out}/${name}-map.png`, W, H * 2, both);
// a region around the biggest river's mouth (--at mouth) or the highest peak (--at peak)
const at = flag('at', 'mouth'), zoomKm = +flag('zoom', 900);
let mouth = -1;
for (let c = 0; c < G.n; c++) if (!E.base[c] && E.rcv[c] >= 0 && E.base[E.rcv[c]] && (mouth < 0 || E.A[c] > E.A[mouth])) mouth = c;
if (mouth < 0) { let m = 0; for (let c = 0; c < G.n; c++) if (E.A[c] > E.A[m]) m = c; mouth = m; }
if (at === 'peak') { let m = 0; for (let c = 0; c < G.n; c++) if (h[c] > h[m]) m = c; mouth = m; }
if (at === 'hot' && hotDirs.length) mouth = G.cellAt(...hotDirs[0]);
if (/^-?[\d.]+,-?[\d.]+$/.test(at)) { // lat,lon in degrees (as on the maps: lon from the left edge)
  const [la, lo] = at.split(',').map((x) => +x * Math.PI / 180);
  mouth = G.cellAt(Math.cos(la) * Math.cos(lo), Math.sin(la), Math.cos(la) * Math.sin(lo));
}
const Z = 640, span = Math.min(1.2, zoomKm * 1e3 / R); // gnomonic half-width (radians-ish)
const zl = renderZoom(G, h0, before, mouth, Z, span), zr = renderZoom(G, h, E, mouth, Z, span);
const zz = new Uint8Array(Z * 2 * Z * 3);
for (let y = 0; y < Z; y++) {
  zz.set(zl.subarray(y * Z * 3, (y + 1) * Z * 3), y * Z * 2 * 3);
  zz.set(zr.subarray(y * Z * 3, (y + 1) * Z * 3), (y * Z * 2 + Z) * 3);
}
writePNG(`${out}/${name}-zoom-${at}${zoomKm}.png`, Z * 2, Z, zz);
console.log(`wrote ${out}/${name}-map.png, ${name}-zoom.png`);

// ---------------------------------------------------------------- helpers

function smooth(G, f, iters) {
  const { nStart, nbr } = G;
  let a = f, b = new Float64Array(G.n);
  for (let it = 0; it < iters; it++) {
    for (let c = 0; c < G.n; c++) {
      let sum = a[c] * 2, w = 2;
      for (let e = nStart[c]; e < nStart[c + 1]; e++) { sum += a[nbr[e]]; w++; }
      b[c] = sum / w;
    }
    [a, b] = [b, a];
  }
  return a;
}
function jitter(c) { let x = Math.imul(c ^ 0x9e3779b9, 0x85ebca6b); x ^= x >>> 13; x = Math.imul(x, 0xc2b2ae35); x ^= x >>> 16; return (x >>> 0) / 4294967296; }
// the history as a chart: temperature, CO2 (log), O2, ice over the world's age, events marked
function drawHistory(H, path) {
  const W = 1000, rows = 4, rh = 90, Hh = rows * rh + 20;
  const rgb = new Uint8Array(W * Hh * 3).fill(16);
  const s = H.series, n = s.t.length;
  const put = (x, y, c) => { if (x < 0 || y < 0 || x >= W || y >= Hh) return; const i = (y * W + x) * 3; rgb[i] = c[0]; rgb[i + 1] = c[1]; rgb[i + 2] = c[2]; };
  const panels = [
    ['T', (v) => v, [220, 120, 60], 240, 360],
    ['pCO2', (v) => Math.log10(Math.max(v, 1e-5)), [200, 200, 200], -4, 1.5],
    ['pO2', (v) => v, [90, 170, 255], 0, 0.5],
    ['ice', (v) => v, [230, 240, 255], 0, 1],
  ];
  panels.forEach(([key, f, col, lo, hi], r) => {
    const y0 = r * rh + 5;
    for (let x = 0; x < W; x++) put(x, y0 + rh - 6, [50, 50, 50]);
    if (key === 'T') for (const T of [273, 300]) { const y = y0 + Math.round((1 - (T - lo) / (hi - lo)) * (rh - 10)); for (let x = 0; x < W; x += 4) put(x, y, [70, 70, 90]); }
    let py = null;
    for (let i = 0; i < n; i++) {
      const x = Math.round(s.t[i] / H.age * (W - 1));
      const v = (f(s[key][i]) - lo) / (hi - lo);
      const y = y0 + Math.round((1 - Math.max(0, Math.min(1, v))) * (rh - 10));
      if (py != null) for (let yy = Math.min(py, y); yy <= Math.max(py, y); yy++) put(x, yy, col);
      put(x, y, col); py = y;
      if (s.snowball[i]) put(x, y0, [255, 255, 255]);
    }
  });
  for (const e of H.events) { const x = Math.round(e.t / H.age * (W - 1)); for (let y = 0; y < Hh; y += 2) put(x, y, [120, 200, 120]); }
  writePNG(path, W, Hh, rgb);
}
// a barren world's map: grey by height, shaded; maria dark, fresh ejecta bright
function renderBarren(G, Wd, w, tint = [1, 0.98, 0.95]) {
  const hh = w / 2, rgb = new Uint8Array(w * hh * 3), Z = new Float64Array(w * hh), M = new Float64Array(w * hh), F = new Float64Array(w * hh), RV = new Float64Array(w * hh);
  let rmax = 0; if (Wd.river) for (const x of Wd.river) rmax = Math.max(rmax, x);
  const d = [0, 0, 0], uv = { face: 0, u: 0, v: 0 };
  let lo = Infinity, hi = -Infinity;
  for (let c = 0; c < G.n; c++) { lo = Math.min(lo, Wd.h[c]); hi = Math.max(hi, Wd.h[c]); }
  for (let y = 0; y < hh; y++) for (let x = 0; x < w; x++) {
    const lat = Math.PI / 2 - (y + 0.5) / hh * Math.PI, lon = (x + 0.5) / w * 2 * Math.PI;
    d[0] = Math.cos(lat) * Math.cos(lon); d[1] = Math.sin(lat); d[2] = Math.cos(lat) * Math.sin(lon);
    const i = y * w + x;
    Z[i] = G.sample(Wd.h, d, uv); M[i] = G.sample(Wd.mare, d, uv); F[i] = G.sample(Wd.fresh, d, uv);
    if (Wd.river) RV[i] = G.sample(Wd.river, d, uv);
  }
  for (let y = 0; y < hh; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x, lat = Math.PI / 2 - (y + 0.5) / hh * Math.PI;
    const mx = Math.max(0.05, Math.cos(lat)) * 2 * Math.PI * G.R / w, my = Math.PI * G.R / hh;
    const zx = (Z[y * w + Math.min(w - 1, x + 1)] - Z[y * w + Math.max(0, x - 1)]) / (2 * mx) * 1.5;
    const zy = (Z[Math.min(hh - 1, y + 1) * w + x] - Z[Math.max(0, y - 1) * w + x]) / (2 * my) * 1.5;
    const nl = Math.sqrt(zx * zx + zy * zy + 1);
    const shade = Math.max(0.2, Math.min(1.5, (zx * 0.6 + zy * 0.6 + 0.85) / nl / 0.85));
    let g = 120 + 50 * (Z[i] - lo) / Math.max(1, hi - lo);
    g = g * (1 - 0.45 * M[i]) + 90 * F[i];
    if (rmax > 0 && RV[i] > rmax * 0.003) g *= 0.6 + 0.4 * (1 - Math.min(1, Math.log(RV[i] / (rmax * 0.003)) / 4)); // old valleys
    rgb[i * 3] = Math.min(255, g * shade * tint[0]); rgb[i * 3 + 1] = Math.min(255, g * shade * tint[1]); rgb[i * 3 + 2] = Math.min(255, g * shade * tint[2]);
  }
  return rgb;
}
// glacier ice over an equirectangular map
function paintIce(rgb, w, G, ice) {
  const hh = w / 2, d = [0, 0, 0];
  for (let y = 0; y < hh; y++) for (let x = 0; x < w; x++) {
    const lat = Math.PI / 2 - (y + 0.5) / hh * Math.PI, lon = (x + 0.5) / w * 2 * Math.PI;
    const c = G.cellAt(Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon));
    if (ice[c] <= 0) continue;
    const i = (y * w + x) * 3, k = Math.min(0.85, 0.45 + ice[c] / 2000);
    rgb[i] += (235 - rgb[i]) * k; rgb[i + 1] += (243 - rgb[i + 1]) * k; rgb[i + 2] += (250 - rgb[i + 2]) * k;
  }
}
// marks on an equirectangular map: peaks white triangles, river mouths cyan, gorges orange, trenches violet
function markFeatures(rgb, w, F) {
  const hh = w / 2;
  const dot = (f, col, r) => {
    const x = Math.round(((f.lon + 360) % 360) / 360 * w), y = Math.round((90 - f.lat) / 180 * hh);
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      if (Math.abs(dx) + Math.abs(dy) > r + 1) continue;
      const X = (x + dx + w) % w, Y = y + dy;
      if (Y < 0 || Y >= hh) continue;
      const i = (Y * w + X) * 3; rgb[i] = col[0]; rgb[i + 1] = col[1]; rgb[i + 2] = col[2];
    }
  };
  F.trenches.forEach((f) => dot(f, [170, 90, 230], 3));
  F.gorges.forEach((f) => dot(f, [255, 150, 40], 3));
  F.rivers.forEach((f) => dot(f, [60, 230, 255], 3));
  F.peaks.forEach((f, i) => dot(f, i === 0 ? [255, 40, 40] : [255, 255, 255], i === 0 ? 5 : 3));
}
// the exposed rock's colour, shaded by the relief (the sea a flat dark blue over its floor's rock)
function renderRock(G, h, rock, w) {
  const hh = w / 2, rgb = new Uint8Array(w * hh * 3), Z = new Float64Array(w * hh);
  const cols = ROCKS.map((r) => [parseInt(r.color.slice(1, 3), 16), parseInt(r.color.slice(3, 5), 16), parseInt(r.color.slice(5, 7), 16)]);
  const d = [0, 0, 0], uv = { face: 0, u: 0, v: 0 }, cellOf = new Int32Array(w * hh);
  for (let y = 0; y < hh; y++) for (let x = 0; x < w; x++) {
    const lat = Math.PI / 2 - (y + 0.5) / hh * Math.PI, lon = (x + 0.5) / w * 2 * Math.PI;
    d[0] = Math.cos(lat) * Math.cos(lon); d[1] = Math.sin(lat); d[2] = Math.cos(lat) * Math.sin(lon);
    Z[y * w + x] = G.sample(h, d, uv); cellOf[y * w + x] = G.cellAt(d[0], d[1], d[2]);
  }
  for (let y = 0; y < hh; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x, lat = Math.PI / 2 - (y + 0.5) / hh * Math.PI;
    const mx = Math.max(0.05, Math.cos(lat)) * 2 * Math.PI * G.R / w, my = Math.PI * G.R / hh;
    const zx = (Z[y * w + Math.min(w - 1, x + 1)] - Z[y * w + Math.max(0, x - 1)]) / (2 * mx) * 3;
    const zy = (Z[Math.min(hh - 1, y + 1) * w + x] - Z[Math.max(0, y - 1) * w + x]) / (2 * my) * 3;
    const shade = Math.max(0.35, Math.min(1.3, (zx * 0.6 + zy * 0.6 + 0.85) / Math.sqrt(zx * zx + zy * zy + 1) / 0.85));
    let c = cols[rock[cellOf[i]]];
    if (Z[i] < 0) c = c.map((v, k) => v * 0.35 + [20, 50, 90][k] * 0.65);
    rgb[i * 3] = Math.min(255, c[0] * (Z[i] < 0 ? 1 : shade)); rgb[i * 3 + 1] = Math.min(255, c[1] * (Z[i] < 0 ? 1 : shade)); rgb[i * 3 + 2] = Math.min(255, c[2] * (Z[i] < 0 ? 1 : shade));
  }
  return rgb;
}
function min(a) { let m = Infinity; for (const x of a) if (x < m) m = x; return m; }
// a tectonics frame: heights, each plate tinted, boundaries dark, trenches red
function renderPlates(Gt, ht, T, w) {
  const hh = w / 2, rgb = new Uint8Array(w * hh * 3);
  const own = new Int16Array(w * hh), d = [0, 0, 0];
  const tint = (q) => [((q * 97) % 255), ((q * 57 + 80) % 255), ((q * 151 + 40) % 255)];
  for (let y = 0; y < hh; y++) for (let x = 0; x < w; x++) {
    const lat = Math.PI / 2 - (y + 0.5) / hh * Math.PI, lon = (x + 0.5) / w * 2 * Math.PI;
    d[0] = Math.cos(lat) * Math.cos(lon); d[1] = Math.sin(lat); d[2] = Math.cos(lat) * Math.sin(lon);
    const c = Gt.cellAt(d[0], d[1], d[2]);
    own[y * w + x] = T.owner[c];
    const z = Gt.sample(ht, d), col = hypso(z), tc = tint(T.owner[c]);
    const i = (y * w + x) * 3;
    for (let q = 0; q < 3; q++) rgb[i + q] = col[q] * 0.8 + tc[q] * 0.2;
    if (T.trench[c] > 0.3) { rgb[i] = 200; rgb[i + 1] = 40; rgb[i + 2] = 40; }
  }
  for (let y = 0; y < hh; y++) for (let x = 0; x < w - 1; x++) {
    const i = y * w + x;
    if (own[i] !== own[i + 1] || (y < hh - 1 && own[i] !== own[i + w])) { rgb[i * 3] *= 0.3; rgb[i * 3 + 1] *= 0.3; rgb[i * 3 + 2] *= 0.3; }
  }
  return rgb;
}
function max(a) { let m = -Infinity; for (const x of a) if (x > m) m = x; return m; }
function landFrac(a) { let k = 0; for (const x of a) if (x >= 0) k++; return k / a.length; }
function landQuantile(a, q) { const L = Float64Array.from(a).filter((x) => x > 0).sort(); return L.length ? L[Math.min(L.length - 1, Math.floor(L.length * q))] : 0; }

// colour for a height (m) on this world
function hypso(z) {
  if (z < 0) {
    const d = Math.min(1, -z / 5000);
    return [18 + 40 * (1 - d), 50 + 70 * (1 - d), 95 + 80 * (1 - d)];
  }
  const stops = [[0, [70, 110, 60]], [600, [110, 135, 75]], [1800, [150, 140, 95]], [3500, [130, 110, 90]], [5500, [175, 170, 165]], [8000, [245, 245, 248]]];
  for (let i = 1; i < stops.length; i++) {
    if (z <= stops[i][0]) {
      const [z0, a] = stops[i - 1], [z1, b] = stops[i], t = (z - z0) / (z1 - z0);
      return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
    }
  }
  return stops[stops.length - 1][1];
}

// shaded relief + lakes + rivers into rgb; px(d) maps a direction to a pixel
// ([x, y] or null), dirAt(x, y, out) the reverse; mPerPx: metres per pixel
function paint(G, h, E, w, hh, dirAt, px, mPerPx) {
  const rgb = new Uint8Array(w * hh * 3);
  const Z = new Float64Array(w * hh), lake = new Float64Array(w * hh);
  const d = [0, 0, 0], uv = { face: 0, u: 0, v: 0 };
  const depth = new Float64Array(G.n);
  for (let c = 0; c < G.n; c++) depth[c] = E.base[c] ? 0 : Math.max(0, E.fill[c] - h[c]);
  for (let y = 0; y < hh; y++) for (let x = 0; x < w; x++) {
    dirAt(x, y, d);
    Z[y * w + x] = G.sample(h, d, uv);
    lake[y * w + x] = G.sample(depth, d, uv);
  }
  const ex = 6; // vertical exaggeration for the shading
  for (let y = 0; y < hh; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x, z = Z[i];
    const [mx, my] = mPerPx(x, y);
    const zx = (Z[y * w + Math.min(w - 1, x + 1)] - Z[y * w + Math.max(0, x - 1)]) / (2 * mx) * ex;
    const zy = (Z[Math.min(hh - 1, y + 1) * w + x] - Z[Math.max(0, y - 1) * w + x]) / (2 * my) * ex;
    const nl = Math.sqrt(zx * zx + zy * zy + 1);
    const shade = z < 0 ? 1 : Math.max(0.25, Math.min(1.35, (zx * 0.6 + zy * 0.6 + 0.85) / nl / 0.85));
    let col = hypso(z);
    if (z >= 0 && lake[i] > 2) col = [40, 90, 150];
    rgb[i * 3] = Math.min(255, col[0] * shade); rgb[i * 3 + 1] = Math.min(255, col[1] * shade); rgb[i * 3 + 2] = Math.min(255, col[2] * shade);
  }
  // rivers: each cell with enough water to its receiver
  let amax = 0;
  for (let c = 0; c < G.n; c++) if (!E.base[c] && E.A[c] > amax) amax = E.A[c];
  // rivers: drainage over a share of the biggest, and at least ~60 cells' worth
  let meanA = 0; for (let c = 0; c < G.n; c++) meanA += G.area[c] * E.rain[c]; meanA /= G.n;
  const thr = Math.max(amax * 0.004, meanA * 60);
  const a = [0, 0, 0], b = [0, 0, 0];
  for (let c = 0; c < G.n; c++) {
    if (E.base[c] || E.A[c] < thr) continue;
    const r = E.rcv[c];
    if (r < 0) continue;
    a[0] = G.dir[c * 3]; a[1] = G.dir[c * 3 + 1]; a[2] = G.dir[c * 3 + 2];
    b[0] = G.dir[r * 3]; b[1] = G.dir[r * 3 + 1]; b[2] = G.dir[r * 3 + 2];
    const pa = px(a), pb = px(b);
    if (!pa || !pb || Math.abs(pa[0] - pb[0]) > w / 2) continue;
    const k = Math.min(1, Math.log(E.A[c] / thr) / Math.log(amax / thr) * 1.3 + 0.35);
    const wide = E.A[c] > thr * 30 ? 1 : 0;
    line(rgb, w, hh, pa, pb, wide, [30, 90, 200], k);
  }
  return rgb;
}

function line(rgb, w, hh, a, b, wide, col, k) {
  const n = Math.max(1, Math.ceil(Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]))));
  for (let s = 0; s <= n; s++) {
    const x = Math.round(a[0] + (b[0] - a[0]) * s / n), y = Math.round(a[1] + (b[1] - a[1]) * s / n);
    for (let oy = 0; oy <= wide; oy++) for (let ox = 0; ox <= wide; ox++) {
      const X = x + ox, Y = y + oy;
      if (X < 0 || Y < 0 || X >= w || Y >= hh) continue;
      const i = (Y * w + X) * 3;
      for (let q = 0; q < 3; q++) rgb[i + q] = rgb[i + q] + (col[q] - rgb[i + q]) * k;
    }
  }
}

// equirectangular, the whole world
function render(G, h, E, w) {
  const hh = w / 2;
  const dirAt = (x, y, d) => {
    const lat = Math.PI / 2 - (y + 0.5) / hh * Math.PI, lon = (x + 0.5) / w * 2 * Math.PI;
    d[0] = Math.cos(lat) * Math.cos(lon); d[1] = Math.sin(lat); d[2] = Math.cos(lat) * Math.sin(lon);
  };
  const px = (d) => {
    const lat = Math.asin(Math.max(-1, Math.min(1, d[1])));
    let lon = Math.atan2(d[2], d[0]); if (lon < 0) lon += 2 * Math.PI;
    return [lon / (2 * Math.PI) * w - 0.5, (Math.PI / 2 - lat) / Math.PI * hh - 0.5];
  };
  const mPerPx = (x, y) => {
    const lat = Math.PI / 2 - (y + 0.5) / hh * Math.PI;
    return [Math.max(0.05, Math.cos(lat)) * 2 * Math.PI * G.R / w, Math.PI * G.R / hh];
  };
  return paint(G, h, E, w, hh, dirAt, px, mPerPx);
}

// gnomonic, a region around cell c0, half-width `span` (tangent units)
function renderZoom(G, h, E, c0, w, span) {
  const C = [G.dir[c0 * 3], G.dir[c0 * 3 + 1], G.dir[c0 * 3 + 2]];
  let e1 = Math.abs(C[1]) < 0.9 ? cross([0, 1, 0], C) : cross([1, 0, 0], C);
  e1 = nrm(e1);
  const e2 = cross(C, e1);
  const dirAt = (x, y, d) => {
    const a = ((x + 0.5) / w * 2 - 1) * span, b = (1 - (y + 0.5) / w * 2) * span;
    d[0] = C[0] + a * e1[0] + b * e2[0]; d[1] = C[1] + a * e1[1] + b * e2[1]; d[2] = C[2] + a * e1[2] + b * e2[2];
    const l = Math.hypot(d[0], d[1], d[2]); d[0] /= l; d[1] /= l; d[2] /= l;
  };
  const px = (d) => {
    const dc = d[0] * C[0] + d[1] * C[1] + d[2] * C[2];
    if (dc <= 0.1) return null;
    const a = (d[0] * e1[0] + d[1] * e1[1] + d[2] * e1[2]) / dc, b = (d[0] * e2[0] + d[1] * e2[1] + d[2] * e2[2]) / dc;
    return [(a / span + 1) / 2 * w - 0.5, (1 - b / span) / 2 * w - 0.5];
  };
  const m = 2 * span * G.R / w;
  return paint(G, h, E, w, w, dirAt, px, () => [m, m]);
}
function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
function nrm(a) { const l = Math.hypot(a[0], a[1], a[2]); return [a[0] / l, a[1] / l, a[2] / l]; }
