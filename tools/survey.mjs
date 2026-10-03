// Terrain survey, outside the game: for each world, its world sim and its refinement (both
// cached), a whole-world map, and at each of its landmarks the ground at three scales: the
// refinement's (~400 km across), and two finer levels of the terrain pyramid made there
// (~60 km and ~12 km). Coloured as the game colours it, lit from the north-west.
//
//   node tools/survey.mjs --out DIR [--cache DIR] [--W 1200] [--marks 6] [--gorges N] [--threads 4] SEED[:bodyId] ...
//
// (--gorges N: also views at the world's N deepest canyon-country gorges, world.js, first;
// --gorgeRock a,b: only those cut in these rocks, e.g. sandstone,shale,limestone)
//
// Writes DIR/<seed>-<body>-world.png and DIR/<seed>-<body>-<n>-<kind>-<scale>.png, and a
// DIR/survey.json listing them (for a contact sheet). The refinement and pyramid run the tile
// sim as the game does (the integer sim, compiled: the GPU's results bit for bit), the
// refinement's tiles on --threads workers (tools/surveyWorker.mjs); --float 1 runs the
// floating-point sim instead (alike, not bit for bit). The caches keep the two apart.

import fs from 'fs';
import path from 'path';
import { generateSystem } from '../src/gen/system.js';
import { worldSim, simOptsFor } from '../src/gen/worldsim/world.js';
import { packSnapshot, simNFor, SIM_VERSION } from '../src/gen/worldsim/snapshot.js';
import { findFeatures } from '../src/gen/worldsim/features.js';
import { nameLandmarks, landmarks } from '../src/gen/worldsim/landmarks.js';
import { ROCKS } from '../src/gen/worldsim/lithology.js';
import { TerrainGenerator, S_H, S_LEN } from '../src/gen/terrain.js';
import { prepareTile, refineLevel, tileAt } from '../src/gen/localsim.js';
import { runInt } from '../src/gpu/itile.js';
import { Worker } from 'worker_threads';
import os from 'os';
import { newRefine, putTile, toStorable, fromStorable, TileSet, RefineReader, riverIndex } from '../src/gen/worldsim/refine.js';
import v8 from 'v8';
import { TILE_VERSION } from '../src/gen/tileshape.js';
import { dunePatches } from '../src/gen/dunes.js';
import { faceUVFromDir } from '../src/gen/cubesphere.js';
import { GridLite } from '../src/gen/worldsim/grid.js';
import { writePNG } from './png.mjs';

const args = process.argv.slice(2), opt = {}, worlds = [];
for (let i = 0; i < args.length; i++) { if (args[i].startsWith('--')) opt[args[i].slice(2)] = args[++i]; else worlds.push(args[i]); }
const OUT = opt.out || 'survey', CACHE = opt.cache || OUT, W = +(opt.W || 1200), MARKS = +(opt.marks || 6);
const FLOAT = opt.float === '1', THREADS = +(opt.threads || Math.min(4, os.cpus().length));
fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(CACHE, { recursive: true });
const TY = { h: Float32Array, water: Float32Array, rock: Uint8Array, ice: Uint16Array, river: Uint8Array, melt: Uint8Array, relief: Uint16Array, rcv: Uint8Array, Tsea: Float32Array, P: Float32Array, cover: Float32Array, forest: Float32Array, open: Float32Array, cloud: Float32Array, cloudPx: Uint8Array, crat: Uint8Array, dunes: Uint8Array, gorge: Uint16Array };
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
const list = fs.existsSync(path.join(OUT, 'survey.json')) ? JSON.parse(fs.readFileSync(path.join(OUT, 'survey.json'))) : {};

for (const w of worlds) {
  const [seed, bid] = w.split(':');
  const sys = generateSystem(seed), b = bid != null ? sys.bodies[+bid] : sys.bodies[sys.startBodyId];
  if (!b.terrain || !b.solid) { log(seed, b.name, 'has no solid surface: skipped'); continue; }
  const N = simNFor(b), tag = `${seed}-${b.id}`;
  log(`${seed}: ${b.name} (${b.label || b.kind}), R ${Math.round(b.R / 1000)} km, sim N ${N}`);
  // the world sim (and its landmarks), cached
  const sf = path.join(CACHE, `snap-${seed}-${b.id}-N${N}-v${SIM_VERSION}.json`);
  let snap;
  if (fs.existsSync(sf)) { snap = JSON.parse(fs.readFileSync(sf)); for (const k in TY) if (snap[k]) snap[k] = TY[k].from(snap[k]); if (snap.dunes) snap.dunePatch = dunePatches(); }
  else {
    const t0 = performance.now();
    const Wd = worldSim(b, sys.bodies[0], { N, myr: 150, steps: 40, ...simOptsFor(b, sys), log: () => {} });
    snap = packSnapshot(Wd, b);
    try {
      const F = findFeatures(Wd.G, Wd.h, { E: Wd.E, scale: b.R / b.radiusM, craters: Wd.craters || [], volcanoes: Wd.volcanoes, tuyas: Wd.tuyas, glaciers: Wd.glaciers, coasts: Wd.coasts, rock: Wd.rock, rockNames: ROCKS.map((r) => r.name), climate: Wd.climate, Gc: Wd.Gc, dunes: Wd.dunes, mesas: Wd.mesas, soil: Wd.soil, drowned: Wd.drowned, top: 5 });
      const dry = !b.terrain.liquid || b.terrain.liquid === 'lava';
      snap.landmarks = landmarks(nameLandmarks(F, `${seed}|${b.id}`, dry), dry);
    } catch (e) { snap.landmarks = []; }
    const o = {}; for (const k in snap) if (k !== 'dunePatch') o[k] = ArrayBuffer.isView(snap[k]) ? Array.from(snap[k]) : snap[k];
    fs.writeFileSync(sf, JSON.stringify(o));
    log(`  world sim in ${((performance.now() - t0) / 1000).toFixed(0)} s`);
  }
  let gen = new TerrainGenerator({ ...b.terrain, snapshot: snap });
  // its refinement, cached
  const rf = path.join(CACHE, `ref-${seed}-${b.id}-N${N}-v${SIM_VERSION}-r${TILE_VERSION}${FLOAT ? 'f' : 'i'}`);
  let R;
  if (fs.existsSync(rf + '.v8')) R = fromStorable(v8.deserialize(fs.readFileSync(rf + '.v8')));
  else {
    const t0 = performance.now(), L = refineLevel(gen), n = 1 << L;
    R = newRefine(L, false);
    const parts = await refineTiles(seed, b.id, snap, n, (p) => putTile(R, p));
    R.riv = riverIndex(parts, snap.N, snap.R);
    fs.writeFileSync(rf + '.v8', v8.serialize(toStorable(R)));
    log(`  refinement (${6 * n * n} tiles) in ${((performance.now() - t0) / 1000).toFixed(0)} s`);
  }
  const pyr = new Map();
  gen = new TerrainGenerator({ ...b.terrain, snapshot: snap, refine: R, pyr });
  const entry = list[tag] = { seed, body: b.name, label: b.label || '', world: `${tag}-world.png`, marks: [] };
  // the whole world
  {
    const t0 = performance.now(), H = W / 2, rgb = new Uint8Array(W * H * 3), s = new Float64Array(S_LEN), col = [0, 0, 0], mat = new Float64Array(8);
    const hh = new Float64Array(W * H), minW = Math.PI * b.R / H;
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      const lat = Math.PI / 2 - (j + 0.5) / H * Math.PI, lon = (i + 0.5) / W * 2 * Math.PI - Math.PI;
      gen.sample(Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon), minW, s); hh[j * W + i] = s[S_H];
    }
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      const lat = Math.PI / 2 - (j + 0.5) / H * Math.PI, lon = (i + 0.5) / W * 2 * Math.PI - Math.PI;
      gen.sample(Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon), minW, s);
      const px = Math.PI * b.R / H, gx = (hh[j * W + Math.min(W - 1, i + 1)] - hh[j * W + Math.max(0, i - 1)]) / (2 * px * Math.max(0.05, Math.cos(lat))), gy = (hh[Math.max(0, j - 1) * W + i] - hh[Math.min(H - 1, j + 1) * W + i]) / (2 * px);
      shadePixel(gen, s, gx, gy, b, col, mat, rgb, (j * W + i) * 3);
    }
    writePNG(path.join(OUT, entry.world), W, H, rgb);
    log(`  world map in ${((performance.now() - t0) / 1000).toFixed(0)} s`);
  }
  // each landmark at three scales
  const marks = (snap.landmarks || []).slice(0, MARKS);
  // (canyon country's deepest gorges, one per place)
  if (opt.gorges && snap.gorge) {
    const Gl = new GridLite(snap.N, snap.R), cells = [];
    const want = opt.gorgeRock ? opt.gorgeRock.split(',') : null;
    snap.gorge.forEach((v, c) => { if (v && (!want || want.includes(ROCKS[snap.rock[c]].name))) cells.push(c); });
    cells.sort((x, y) => snap.gorge[y] - snap.gorge[x]);
    const got = [], d = [0, 0, 0];
    for (const c of cells) {
      if (got.length >= +opt.gorges) break;
      Gl.centre(c, d);
      if (got.some((q) => q.d[0] * d[0] + q.d[1] * d[1] + q.d[2] * d[2] > Math.cos(20 * Gl.spacing / Gl.R))) continue;
      got.push({ d: d.slice(), name: `gorge ${snap.gorge[c]} m`, kind: 'gorge', text: `${snap.gorge[c]} m below the plateau, in ${ROCKS[snap.rock[c]].name}`, lat: Math.asin(d[1]) * 180 / Math.PI, lon: Math.atan2(d[2], d[0]) * 180 / Math.PI });
    }
    marks.unshift(...got);
  }
  for (let m = 0; m < marks.length; m++) {
    const lm = marks[m], la = lm.lat * Math.PI / 180, lo = lm.lon * Math.PI / 180;
    const d = [Math.cos(la) * Math.cos(lo), Math.sin(la), Math.cos(la) * Math.sin(lo)], uv = {};
    faceUVFromDir(d, uv);
    const t0 = performance.now();
    // the pyramid there: two levels over the refinement, each on the last
    let parent = null;
    for (const L of [R.L + 2, R.L + 4]) {
      const t = tileAt(uv.face, uv.u, uv.v, L);
      const reader = parent || new RefineReader(R);
      const P = prepareTile(gen, t.face, t.ti, t.tj, { kind: 'pyr', L, parent: reader, inflow: opt.pyrIn !== '0' });
      if (FLOAT) P.steps(); else P.fromInts(runInt(P.ints()));
      const T = P.finish();
      const rw = new Uint8Array(T.rockC.length);
      for (let o = 0; o < rw.length; o++) rw[o] = (T.rockC[o] & 31) | (T.water[o] << 5);
      let set = pyr.get(L);
      if (!set) { set = new TileSet(L); pyr.set(L, set); }
      set.put(t.face, t.ti, t.tj, { h: T.h, rw, fl: T.fl, rcv: T.rcv });
      parent = new RefineReader(set);
    }
    gen.snap.attachPyr(pyr);
    const mk = { name: lm.name, kind: lm.kind, text: lm.text, lat: lm.lat, lon: lm.lon, maps: [] };
    for (const km of (opt.scales ? opt.scales.split(",").map(Number) : [400, 60, 12])) {
      const file = `${tag}-${m}-${lm.kind}-${km}km.png`;
      mapAt(gen, b, d, km * 1000, 320, path.join(OUT, file));
      mk.maps.push({ km, file });
    }
    entry.marks.push(mk);
    log(`  ${lm.kind} ${lm.name} (${lm.text}) at ${lm.lat.toFixed(1)}, ${lm.lon.toFixed(1)}: ${((performance.now() - t0) / 1000).toFixed(0)} s`);
    pyr.clear(); gen.snap.attachPyr(pyr);
  }
  fs.writeFileSync(path.join(OUT, 'survey.json'), JSON.stringify(list, null, 1));
}

// a pixel as the game colours the ground (its shade), lit from the north-west; the sea flat
function shadePixel(gen, s, gx, gy, b, col, mat, rgb, o) {
  gen.shade(s, Math.hypot(gx, gy), col, mat);
  const sea = s[S_H] < 0 && b.terrain.liquid && b.terrain.liquid !== 'lava';
  const nl = Math.hypot(gx, gy, 1), sh = sea ? 1 : Math.max(0.12, (gx * 0.5 - gy * 0.5 + 0.7) / nl / 0.86);
  const g = (v) => Math.round(255 * Math.min(1, Math.pow(Math.max(0, v * 0.85 * sh), 1 / 2.2)));
  rgb[o] = g(col[0]); rgb[o + 1] = g(col[1]); rgb[o + 2] = g(col[2]);
}

// a square map (span m across, px pixels) centred on direction d, north up
function mapAt(gen, b, d, span, px, file) {
  const e = [-d[2], 0, d[0]], el = Math.hypot(e[0], e[2]) || 1; e[0] /= el; e[2] /= el;
  const nn = [d[1] * e[2] - d[2] * e[1], d[2] * e[0] - d[0] * e[2], d[0] * e[1] - d[1] * e[0]];
  const step = span / px, s = new Float64Array(S_LEN), hh = new Float64Array(px * px), dirs = new Float64Array(px * px * 3);
  for (let j = 0; j < px; j++) for (let i = 0; i < px; i++) {
    const x = (i - px / 2) * step / b.R, y = (px / 2 - j) * step / b.R;
    let a0 = d[0] + x * e[0] + y * nn[0], a1 = d[1] + x * e[1] + y * nn[1], a2 = d[2] + x * e[2] + y * nn[2];
    const l = Math.hypot(a0, a1, a2); a0 /= l; a1 /= l; a2 /= l;
    const o = j * px + i; dirs[o * 3] = a0; dirs[o * 3 + 1] = a1; dirs[o * 3 + 2] = a2;
    gen.sample(a0, a1, a2, step, s); hh[o] = s[S_H];
  }
  const rgb = new Uint8Array(px * px * 3), col = [0, 0, 0], mat = new Float64Array(8);
  for (let j = 0; j < px; j++) for (let i = 0; i < px; i++) {
    const o = j * px + i, gx = (hh[j * px + Math.min(px - 1, i + 1)] - hh[j * px + Math.max(0, i - 1)]) / (2 * step), gy = (hh[Math.max(0, j - 1) * px + i] - hh[Math.min(px - 1, j + 1) * px + i]) / (2 * step);
    gen.sample(dirs[o * 3], dirs[o * 3 + 1], dirs[o * 3 + 2], step, s);
    shadePixel(gen, s, gx, gy, b, col, mat, rgb, o * 3);
  }
  writePNG(file, px, px, rgb);
}

// a world's refinement tiles on THREADS workers; put(p) as each comes back. Its rivers' parts
// in tile order (riverIndex keeps their order)
function refineTiles(seed, body, snap, n, put) {
  const jobs = [];
  for (let f = 0; f < 6; f++) for (let tj = 0; tj < n; tj++) for (let ti = 0; ti < n; ti++) jobs.push([f, ti, tj]);
  const parts = new Array(jobs.length), sn = {};
  for (const k in snap) if (k !== 'dunePatch') sn[k] = snap[k];
  let next = 0, done = 0;
  return new Promise((resolve, reject) => {
    const ws = [];
    const give = (w) => { if (next < jobs.length) { w.job = next++; w.postMessage(jobs[w.job]); } };
    for (let k = 0; k < Math.min(THREADS, jobs.length); k++) {
      const w = new Worker(new URL('./surveyWorker.mjs', import.meta.url), { workerData: { seed, body, snap: sn, float: FLOAT } });
      w.on('message', ({ p, riv }) => {
        put(p); parts[w.job] = riv;
        if (++done === jobs.length) { for (const x of ws) x.terminate(); resolve(parts); } else give(w);
      });
      w.on('error', (e) => { for (const x of ws) x.terminate(); reject(e); });
      ws.push(w); give(w);
    }
  });
}
