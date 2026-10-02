// Stagnant-lid worlds: one rigid shell, no moving plates (Mars; also worlds
// whose plates stopped). With nothing carrying the crust away, a mantle plume
// stays under the same spot for Gyr: volcanoes grow into giants (taller on
// weaker gravity: Olympus Mons) on a broad volcanic rise, and the strain of
// that load can split a great rift canyon off it. The two hemispheres often
// differ (a dichotomy: low northern plains, old southern highlands).
// Impacts follow the lunar chronology (impacts.js). While the history says
// there was water, rain cuts valley networks (erosion.js) and a sea can fill
// the lowlands; then the world dries and they're left as relics.
//
// Heights in metres on a SimGrid; constructed landforms (volcanoes, craters,
// the canyon) are drawn scaled whole with a little vertical exaggeration (as
// impacts.js does).

import * as dm from '../../core/dmath.js';
import { hashInts } from '../../core/rng.js';
import { Impacts } from './impacts.js';
import { Erosion } from './erosion.js';
import { smoothField } from './tectonics.js';

const DT_MYR = 10;
const VEXAG = 2.5;

// opts: { rng, body, age (Gyr), scale (game/real), wet: [t0, t1] Gyr since formation or null,
//         seaFrac: ocean fraction in the wet era, tier: volcanic activity 0..3, volcEnd (Gyr) }
export function stagnantWorld(G, opts) {
  const { rng, body } = opts, n = G.n, d = G.dir;
  const scale = opts.scale, age = opts.age;
  const g = body.gravity;
  const dot = (c, v) => d[c * 3] * v[0] + d[c * 3 + 1] * v[1] + d[c * 3 + 2] * v[2];
  const h = new Float64Array(n), volc = new Float32Array(n), river = new Float32Array(n);
  // ---- the primordial crust: broad swells, and often a dichotomy
  const lump = new Float64Array(n), wob = new Float64Array(n);
  for (let c = 0; c < n; c++) { lump[c] = (hashInts(c, rng.u32()) >>> 0) / 4294967296; wob[c] = (hashInts(c, rng.u32()) >>> 0) / 4294967296; }
  smoothField(G, lump, Math.round(G.N / 6)); smoothField(G, wob, Math.round(G.N / 10));
  const dich = rng.next() < 0.65 ? { pole: rng.unitVector(), drop: rng.range(2500, 6000) * scale * VEXAG * 2 } : null;
  for (let c = 0; c < n; c++) {
    h[c] = (lump[c] - 0.5) * 3000 * scale * VEXAG * 2;
    if (dich) h[c] -= dich.drop * dm.smoothstep(-0.15, 0.2, dot(c, dich.pole) + (wob[c] - 0.5) * 0.5);
  }
  // ---- the volcanic province and its giants
  const tier = opts.tier ?? 1;
  const volcEnd = opts.volcEnd ?? age;
  const nShield = [rng.range(0, 1.5), rng.range(1, 3.5), rng.range(3, 5.5), rng.range(5, 8.5)][tier] | 0;
  const rise = nShield > 0 ? { at: dich ? tilt(rng, dich.pole, rng.range(1.2, 1.9)) : rng.unitVector(), R: rng.range(0.25, 0.45), H: rng.range(4000, 9000) * scale * VEXAG * 1.5 } : null;
  const shields = [];
  for (let i = 0; i < nShield; i++) {
    const giant = i === 0;
    const at = rise && rng.next() < 0.75 ? tilt(rng, rise.at, rng.range(0, rise.R * 1.1)) : rng.unitVector();
    const Hreal = (giant ? 22000 : rng.range(5000, 14000)) * dm.clamp(3.7 / g, 0.35, 2.5); // m: taller on weak gravity
    const Rreal = (giant ? 300e3 : rng.range(80e3, 220e3)) * dm.clamp(3.7 / g, 0.6, 1.6);
    shields.push({ at, H: Hreal * scale * VEXAG, R: Rreal * scale, t0: rng.range(0.1, 0.6) * volcEnd, t1: volcEnd * rng.range(0.6, 1), cells: null });
  }
  const canyon = rise && rng.next() < 0.6 ? makeCanyon(rng, rise, scale) : null;
  // ---- the bombardment, the volcanoes, the wet era, through time
  const imp = new Impacts(G, { rng: rng.fork('impacts'), g, pressure: body.atmosphere ? body.atmosphere.pressure : 0, scale });
  const dMin = 6 * G.spacing / 1000;
  const wet = opts.wet;
  let E = null, sl = 0;
  const hs = new Float64Array(n);
  const stats = { craters: 0, shields: nShield, wetSteps: 0, canyon: !!canyon, dichotomy: !!dich };
  for (let t = 0; t < age; t += DT_MYR / 1000) {
    stats.craters += imp.step(DT_MYR, dMin, (c, dh) => { h[c] += dh; }, t * 1000, t).length;
    // the rise swells, the shields build, while the interior is hot
    if (rise && t < volcEnd * 0.7) {
      const k = DT_MYR / 1000 / (volcEnd * 0.7);
      for (let c = 0; c < n; c++) { const a = dm.acos(Math.min(1, dot(c, rise.at))); if (a < rise.R * 1.5) { const u = a / rise.R; h[c] += rise.H * k * dm.exp(-u * u * 1.5); } }
    }
    for (const S of shields) {
      if (t < S.t0 || t > S.t1) continue;
      if (!S.cells) S.cells = near(G, S.at, 1.6 * S.R / G.R);
      const k = DT_MYR / 1000 / (S.t1 - S.t0);
      for (let i = 0; i < S.cells.length; i += 2) {
        const c = S.cells[i], u = S.cells[i + 1] * G.R / S.R;
        if (u < 1.6) { h[c] += S.H * k * dm.pow(Math.max(0, 1 - u / 1.6), 1.6); volc[c] = 1; }
      }
    }
    if (canyon && t > canyon.t && !canyon.done) { carveCanyon(G, h, canyon); canyon.done = true; }
    // rain while there's water: valleys, lakes in craters, a sea in the lows
    if (wet && t >= wet[0] && t < wet[1]) {
      if (!E) E = new Erosion(G, hs, { sea: opts.seaFrac > 0.02, K: 3e-6, rain: 1, m: 0.45, kd: 1 });
      sl = opts.seaFrac > 0.02 ? quantile(h, opts.seaFrac) : 0;
      for (let c = 0; c < n; c++) hs[c] = h[c] - sl;
      E.rainK = Math.min(1, (wet[1] - t) / 0.15); // drying out toward the end
      E.step(DT_MYR * 1e6);
      for (let c = 0; c < n; c++) { h[c] = hs[c] + sl; if (!E.base[c]) river[c] = Math.max(river[c], E.A[c]); }
      stats.wetSteps++;
    }
  }
  return { h, volc, river, impacts: imp, stats, seaLevelWet: sl, rise, shields, dich };
}

function tilt(rng, at, ang) {
  // a direction ang radians from `at`, in a random direction
  const r = rng.unitVector();
  let p = [r[1] * at[2] - r[2] * at[1], r[2] * at[0] - r[0] * at[2], r[0] * at[1] - r[1] * at[0]];
  const l = Math.hypot(p[0], p[1], p[2]) || 1; p = p.map((x) => x / l);
  const c = dm.cos(ang), s = dm.sin(ang);
  return [at[0] * c + p[0] * s, at[1] * c + p[1] * s, at[2] * c + p[2] * s];
}

function near(G, at, ang) {
  const d = G.dir, out = [];
  const c0 = G.cellAt(at[0], at[1], at[2]);
  const seen = new Set([c0]), q = [c0];
  for (let i = 0; i < q.length; i++) {
    const c = q[i];
    const a = dm.acos(Math.min(1, d[c * 3] * at[0] + d[c * 3 + 1] * at[1] + d[c * 3 + 2] * at[2]));
    if (a > ang && c !== c0) continue;
    out.push(c, a);
    for (let e = G.nStart[c]; e < G.nStart[c + 1]; e++) { const o = G.nbr[e]; if (!seen.has(o)) { seen.add(o); q.push(o); } }
  }
  return out;
}

// a great rift canyon running off the rise (Valles Marineris: ~4000 km long,
// up to ~7 km deep), opened when the rise is grown
function makeCanyon(rng, rise, scale) {
  const start = tilt(rng, rise.at, rise.R * 0.9);
  // heading: away from the rise
  const away = [start[0] - rise.at[0], start[1] - rise.at[1], start[2] - rise.at[2]];
  return { start, away, len: rng.range(0.35, 0.7), width: rng.range(80e3, 200e3) * scale, depth: rng.range(4000, 8000) * scale * VEXAG * 1.5, t: rng.range(0.8, 2.0), done: false };
}

function carveCanyon(G, h, C) {
  // walk a great circle from start in the away direction, cutting a trough
  const n = G.n, d = G.dir;
  const s = C.start;
  let t = [C.away[0], C.away[1], C.away[2]];
  const k = t[0] * s[0] + t[1] * s[1] + t[2] * s[2];
  t = [t[0] - s[0] * k, t[1] - s[1] * k, t[2] - s[2] * k];
  const l = Math.hypot(t[0], t[1], t[2]) || 1; t = t.map((x) => x / l);
  const nrm = [s[1] * t[2] - s[2] * t[1], s[2] * t[0] - s[0] * t[2], s[0] * t[1] - s[1] * t[0]]; // the plane's normal
  const halfW = C.width / 2 / G.R;
  for (let c = 0; c < n; c++) {
    const x = d[c * 3], y = d[c * 3 + 1], z = d[c * 3 + 2];
    const off = Math.abs(x * nrm[0] + y * nrm[1] + z * nrm[2]);
    if (off > halfW * 2) continue;
    // along the path: the angle from start toward t
    const along = dm.atan2(x * t[0] + y * t[1] + z * t[2], x * s[0] + y * s[1] + z * s[2]);
    if (along < 0 || along > C.len) continue;
    const ends = dm.smoothstep(0, 0.08, along) * dm.smoothstep(C.len, C.len - 0.12, along);
    const u = off / halfW;
    h[c] -= C.depth * ends * (u < 1 ? 1 : Math.max(0, 1 - (u - 1) * 2)) * (0.7 + 0.3 * dm.cos(along * 9));
  }
}

function quantile(a, q) {
  if (q <= 0) return -Infinity;
  const s = Float64Array.from(a).sort();
  return s[Math.min(s.length - 1, Math.floor(s.length * q))];
}
