// Rivers' channels as lines: each river record's stretch of channel, the meander trace
// (meanders.js) laid along its river's smoothed line by its phase, built once and kept, so the
// river, its floodplain and its canyon all read the one line. Each point carries the channel's
// half width, its banks' level and where it was moving (the meander model's migration), and the
// trace's cut-off loops (oxbows) come along as their own pieces.
//
// Points are kept as the line's place (on its river's smoothed line) and its swing off it, so a
// river seen from afar is drawn nearer its line from the same build: its loops only where the
// sampling can see them (minW under ~6 widths), so they never alias.
//
// A record's channel: { pts (Float32: base x, y, z, swing x, y, z), at (Float32: half width
// (m), banks' ground (m, as drawn), migration x, y, z (per channel width: which way and how far,
// the model's root mean square 1), t along the record's frame, the channel's width (m)), pc (each piece's first point, and the end), kind (0 channel,
// 1 oxbow), age (an oxbow's), groups (bounds of runs of up to 8 segments: x, y, z, radius; and
// gi: piece, first point, segments), bound (x, y, z, radius), maxHalf, fr (its frame), J0, J1,
// W0, W1, sw (the swing's three values and its ends' fades) }

import * as dm from '../core/dmath.js';
import { meanderField, meanderPoint } from './meanders.js';
import { RIVER_REC } from './worldsim/refine.js';

const GROUP = 8;

// A river's profile by the rock its bed crosses. Stream power at steady state has a channel's slope
// go as its rock's erodibility to the -1/n (n ~ 1: Whipple and Tucker 1999), so a river stands
// steeper over a resistant bed and gentler over a soft one. And where a resistant bed lies over a
// markedly softer one (the soft eroding at half its rate or more: lithology.js's k), the plunge pool
// undercuts the soft beneath it and the cap breaks back with its face standing (Niagara's dolostone
// over shale: Gilbert 1907; Lamb and Dietrich 2009): the drop the cap's run would carry stands at
// its downstream edge, a fall, its top a lip near level; where a river leaves hard rock for its own
// alluvium, the same (a fall line). Loose ground erodes alike: a lowland river stays smooth.
// The world sim's heights hold at the ends of windows WIN_RECS reaches long (~2-3 km: the scale a
// river's knickzones gather its relief over; Niagara's falls carry half the drop between its lakes,
// 58 km apart, so this is if anything short), and within one the drop goes where the rock puts it.
// Each window worked out once, for every reach in it (gen._rivWin). Returns t -> m for reach r, or
// null (none of this: its smooth profile)
const WIN_RECS = 16, NSEG = 16;
// (how far a fall's lip has worn back in its middle, of its water's width: Niagara's Horseshoe Falls
// stands back a few tenths of its width from its ends)
export const HORSESHOE = 0.3;
// (a fall zone's floats: buildChannel's ch.zones)
export const ZONE = 8;
// (a braided river's threads: each the channel's curve this much of a period on from the last, the
// golden ratio's part, so no two run alike)
const THREAD_SHIFT = 0.381966;
function riverProfile(gen, r) {
  const Lk = gen._rivLinks(), up = Lk.up, dn = Lk.dn;
  const dnOf = (q) => { const n = dn[q]; return n >= 0 && up[n] === q ? n : -1; };
  const upOf = (q) => { const u = up[q]; return u >= 0 && dn[u] === q ? u : -1; };
  // (its place along its stretch of river, from the stretch's head: the window it's in)
  let head = r, pos = 0;
  for (let g = 0; g < 100000; g++) { const u = upOf(head); if (u < 0 || u === r) break; head = u; pos++; }
  const w0 = pos - (pos % WIN_RECS);
  const C = gen._rivWin || (gen._rivWin = new Map()), key = head * 65536 + (w0 / WIN_RECS);
  let W = C.get(key);
  if (!W) {
    if (C.size > 4000) C.clear();
    // (the window's reaches, downstream)
    const recs = [];
    let q = head;
    for (let i = 0; i < w0 && q >= 0; i++) q = dnOf(q);
    for (let i = 0; i < WIN_RECS && q >= 0; i++) { recs.push(q); q = dnOf(q); }
    W = windowProfile(gen, recs);
    C.set(key, W);
  }
  const P = W && W.get(r);
  if (!P) return null;
  const { H, steps, len } = P, n = NSEG;
  // (each face: steep, a few metres across at most, in the ground's metres: its top's t and its foot's)
  const faces = [];
  for (let j = 0; j < steps.length; j += 2) {
    const e = Math.max(1, 0.1 * Math.abs(steps[j + 1]) * gen.hScale) / Math.max(len, 1);
    faces.push(steps[j] - e, steps[j] + e);
  }
  const fn = (t) => {
    const f = Math.min(n - 1e-9, Math.max(0, t * n)), i = Math.floor(f);
    let h = H[i] + (H[i + 1] - H[i]) * (f - i);
    for (let j = 0; j < steps.length; j += 2) h -= steps[j + 1] * dm.smoothstep(faces[j], faces[j + 1], t);
    return h;
  };
  fn.faces = faces;
  return fn;
}
// a window's reaches' profiles: Map(reach -> { H (NSEG + 1 heights, the sim's m), steps (t, drop
// pairs), len }), or null
function windowProfile(gen, recs) {
  const Rv = gen.snap.riv, rec = Rv.rec, m = recs.length;
  if (!m) return null;
  const N = m * NSEG, k = new Float64Array(N), drop = new Float64Array(N), lens = new Float64Array(m);
  const fr = new Float64Array(9);
  const hsAt = (q, t) => { const b = q * RIVER_REC, u = 1 - t; return (u * u * rec[b + 9] + 2 * t * u * rec[b + 10] + t * t * rec[b + 11]) / gen.hScale; };
  const D = hsAt(recs[0], 0) - hsAt(recs[m - 1], 1);
  if (!(D > 0.5)) return null;
  for (let j = 0; j < m; j++) {
    const q = recs[j];
    gen._meanderFrame(q, fr);
    lens[j] = Math.sqrt((fr[6] - fr[0]) ** 2 + (fr[7] - fr[1]) ** 2 + (fr[8] - fr[2]) ** 2) * gen.R;
    for (let i = 0; i < NSEG; i++) {
      const t = (i + 0.5) / NSEG, u = 1 - t, a0 = u * u, a1 = 2 * t * u, a2 = t * t;
      const x = a0 * fr[0] + a1 * fr[3] + a2 * fr[6], y = a0 * fr[1] + a1 * fr[4] + a2 * fr[7], z = a0 * fr[2] + a1 * fr[5] + a2 * fr[8];
      const l = Math.sqrt(x * x + y * y + z * z);
      // (its bed's rock: a little under its banks, in the ground's metres (hs: the sim's, hScale to them))
      k[j * NSEG + i] = gen._channelRockK(x / l, y / l, z / l, hsAt(q, t) * gen.hScale - 1);
      // (each piece's drop as the smooth profile has it; a rise (the sim's sampling) none)
      drop[j * NSEG + i] = Math.max(0, hsAt(q, i / NSEG) - hsAt(q, (i + 1) / NSEG)) / k[j * NSEG + i];
    }
  }
  // (caps: each run of one rock with markedly softer rock just below it, in the window)
  const steps = [];
  for (let a = 0; a < N;) {
    let b = a;
    while (b + 1 < N && k[b + 1] === k[a]) b++;
    if (b + 1 < N && k[b + 1] >= 1.5 * k[a]) {
      let run = 0;
      for (let i = a; i <= b; i++) { run += 0.9 * drop[i]; drop[i] *= 0.1; }
      steps.push(b + 1, run);
    }
    a = b + 1;
  }
  let total = 0;
  for (let i = 0; i < N; i++) total += drop[i];
  for (let j = 1; j < steps.length; j += 2) total += steps[j];
  if (!(total > 1e-9)) return null;
  const sc = D / total, out = new Map();
  let h = hsAt(recs[0], 0), si = 0;
  for (let j = 0; j < m; j++) {
    const H = new Float64Array(NSEG + 1), st = [];
    H[0] = h;
    for (let i = 0; i < NSEG; i++) {
      // (a step at this piece's upstream edge: within this reach, just inside it)
      while (si < steps.length && steps[si] === j * NSEG + i) { st.push(Math.max(i / NSEG, 0.5 / NSEG / 4), steps[si + 1] * sc); si += 2; }
      H[i + 1] = H[i] - drop[j * NSEG + i] * sc;
    }
    // (H: the reach's heights without its steps; riverProfile takes them off where they stand)
    out.set(recs[j], { H, steps: st, len: lens[j] });
    let stepSum = 0;
    for (let s = 1; s < st.length; s += 2) stepSum += st[s];
    h = H[NSEG] - stepSum;
  }
  return out;
}

// the swing (how much of the trace's sway: 0..1) at t along a record's frame
export function chanSwing(ch, t) {
  const s = ch.sw, Ae = t < 0.5 ? s[0] : s[2];
  return (Ae + (s[1] - Ae) * (t < 0.5 ? 2 * t : 2 - 2 * t)) * (s[3] ? 1 : dm.smoothstep(0, 1, t)) * (s[4] ? 1 : dm.smoothstep(0, 1, 1 - t));
}

// its threads past one where it braids (0..3) at t along a record's frame (gen._meanderB's, carried
// between its ends as the swing is; none at a river's source or its end)
export function chanBraid(ch, t) {
  const s = ch.br, Ae = t < 0.5 ? s[0] : s[2];
  return (Ae + (s[1] - Ae) * (t < 0.5 ? 2 * t : 2 - 2 * t)) * (s[3] ? 1 : dm.smoothstep(0, 1, t)) * (s[4] ? 1 : dm.smoothstep(0, 1, 1 - t));
}

// record r's channel, built (gen: the terrain generator: its snapshot's river index, links,
// swing and frames)
export function buildChannel(gen, r, building) {
  const Rv = gen.snap.riv, rec = Rv.rec, b = r * RIVER_REC, R = gen.R, Lk = gen._rivLinks(), MA = gen._meanderA();
  const F = gen._mf || (gen._mf = meanderField()), P = F.P;
  const dnOf = (q) => { const n = Lk.dn[q]; return n >= 0 && Lk.up[n] === q ? n : -1; };
  const fr = gen._meanderFrame(r, new Float64Array(9));
  const up = Lk.up[r], dn = dnOf(r), wq = 2 * Rv.half[r], ph0 = Rv.phase ? Rv.phase[r] : NaN;
  const len = Math.sqrt((fr[6] - fr[0]) ** 2 + (fr[7] - fr[1]) ** 2 + (fr[8] - fr[2]) ** 2) * R;
  // (its phase where it meets the record up its river and the one down it, shared with them; and
  // its width there, so the channel carries on from one to the next without a step)
  const phU = up >= 0 && Rv.phase ? 0.5 * (Rv.phase[up] + ph0) : NaN, phD = dn >= 0 && Rv.phase ? 0.5 * (ph0 + Rv.phase[dn]) : NaN;
  let J0 = phU === phU ? phU : phD === phD ? 2 * ph0 - phD : ph0 + 0.5 * len / wq, J1 = phD === phD ? phD : 2 * ph0 - J0;
  if (!(J0 === J0)) { J0 = 0.5 * len / wq; J1 = -J0; }
  const W0 = up >= 0 ? 0.5 * (wq + 2 * Rv.half[up]) : wq, W1 = dn >= 0 ? 0.5 * (wq + 2 * Rv.half[dn]) : wq;
  const Aq = Rv.phase ? MA[r] : 0;
  const sw = [up >= 0 ? 0.5 * (Aq + MA[up]) : Aq, Aq, dn >= 0 ? 0.5 * (Aq + MA[dn]) : Aq, up >= 0 ? 1 : 0, dn >= 0 ? 1 : 0];
  const MB = gen._meanderB ? gen._meanderB() : null, Bq = MB && Rv.phase ? MB[r] : 0;
  const br = [up >= 0 && MB ? 0.5 * (Bq + MB[up]) : Bq, Bq, dn >= 0 && MB ? 0.5 * (Bq + MB[dn]) : Bq, up >= 0 ? 1 : 0, dn >= 0 ? 1 : 0];
  const ch = { pts: null, at: null, pc: null, kind: null, age: null, groups: null, gi: null, bound: new Float64Array(4), maxHalf: 0, fr, J0, J1, W0, W1, sw, br };
  // (a river's source: it starts narrow, its width growing over its first record)
  const head = up < 0;
  const P3 = [], A6 = [], pcs = [], kinds = [], ages = [];
  let open = false;
  const hsSmooth = (t) => { const u = 1 - t; return (u * u * rec[b + 9] + 2 * t * u * rec[b + 10] + t * t * rec[b + 11]) / gen.hScale; };
  const hsOf = (gen._channelRockK && gen.snap && riverProfile(gen, r)) || hsSmooth;
  const emit = (X, Y, mx, my, wf = 1) => {
    const t = Math.max(0, Math.min(1, (X - J0) / (J1 - J0))), u = 1 - t, a0 = u * u, a1 = 2 * t * u, a2 = t * t;
    let px = a0 * fr[0] + a1 * fr[3] + a2 * fr[6], py = a0 * fr[1] + a1 * fr[4] + a2 * fr[7], pz = a0 * fr[2] + a1 * fr[5] + a2 * fr[8];
    const pl = Math.sqrt(px * px + py * py + pz * pz); px /= pl; py /= pl; pz /= pl;
    const tx = 2 * (u * (fr[3] - fr[0]) + t * (fr[6] - fr[3])), ty = 2 * (u * (fr[4] - fr[1]) + t * (fr[7] - fr[4])), tz = 2 * (u * (fr[5] - fr[2]) + t * (fr[8] - fr[5]));
    // (across it: up crossed with its way down, the side the trace's +y lies)
    let nx = py * tz - pz * ty, ny = pz * tx - px * tz, nz = px * ty - py * tx;
    const nl = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1; nx /= nl; ny /= nl; nz /= nl;
    const wm = W0 + (W1 - W0) * t, off = wm * Y / R;
    P3.push(px, py, pz, nx * off, ny * off, nz * off);
    // (where the channel was moving there, per channel width: along the valley (x, up it) and
    // across (y), as the trace lies on the ground)
    const dX = 1 / (J1 - J0), tl = R * dX, gx = mx * tl, gy = my;
    const half = 0.5 * wm * wf * (head ? 0.15 + 0.85 * dm.smoothstep(0, 0.9, t) : 1);
    A6.push(half, hsOf(t), (gx * tx + gy * nx * wm) / wm, (gx * ty + gy * ny * wm) / wm, (gx * tz + gy * nz * wm) / wm, t, wm);
  };
  const end = () => {
    if (!open) return;
    open = false;
    // (a piece of one point is none)
    if (P3.length / 6 - pcs[pcs.length - 1] < 2) { const s = pcs.pop(); P3.length = s * 6; A6.length = s * 7; kinds.pop(); ages.pop(); }
    else pcs.push(P3.length / 6);
  };
  const begin = (kind, age) => { end(); pcs.push(P3.length / 6); kinds.push(kind); ages.push(age); open = true; };
  // (how freely it swings at phase X: chanSwing between its ends, and past them on toward the swing of
  // the record up or down its river, as that record has it: a segment of the channel crossing from
  // one record into the next has its ends where both put them, so their channels meet)
  const lo = Math.min(J0, J1), hi = Math.max(J0, J1);
  const phUp = up >= 0 && Rv.phase ? Rv.phase[up] : NaN, phDn = dn >= 0 && Rv.phase ? Rv.phase[dn] : NaN;
  const aOfX = (X) => {
    const t = (X - J0) / (J1 - J0);
    if (t < 0 && phUp === phUp && phUp !== J0) return dm.clamp(sw[0] + (MA[up] - sw[0]) * Math.min(1, (X - J0) / (phUp - J0)), 0, 1);
    if (t > 1 && phDn === phDn && phDn !== J1) return dm.clamp(sw[2] + (MA[dn] - sw[2]) * Math.min(1, (X - J1) / (phDn - J1)), 0, 1);
    return chanSwing(ch, dm.clamp(t, 0, 1));
  };
  // (and its threads past one, alike)
  const nbOfX = (X) => {
    if (!MB) return 0;
    const t = (X - J0) / (J1 - J0);
    if (t < 0 && phUp === phUp && phUp !== J0) return Math.max(0, br[0] + (MB[up] - br[0]) * Math.min(1, (X - J0) / (phUp - J0)));
    if (t > 1 && phDn === phDn && phDn !== J1) return Math.max(0, br[2] + (MB[dn] - br[2]) * Math.min(1, (X - J1) / (phDn - J1)));
    return chanBraid(ch, dm.clamp(t, 0, 1));
  };
  // the channel's points in period p: each the family's (meanders.js) at the swing its own phase has
  // (found by turns: a point's phase moves with its swing, slowly)
  // A braided river's threads (thread j > 0: where it has more than j - 1 past one): each the same
  // curve a part of a period on (THREAD_SHIFT), so they cross and part, the bars between them; as
  // wide as each other, the water shared among them (each 1 / sqrt(1 + nb) of its width: width goes
  // as the root of the water, its regime's). Where it has fewer, a thread is drawn in onto the first
  // and lies along it, so threads part and rejoin along the river without ends
  const fpt = {}, fps = {}, fpd = {}, n0 = F.n;
  const family = (p, j = 0) => {
    const sh = p * P, X = new Float64Array(n0 + 1), Y = new Float64Array(n0 + 1), MX = new Float64Array(n0 + 1), MY = new Float64Array(n0 + 1), WF = new Float64Array(n0 + 1), SJ = new Float64Array(n0 + 1);
    const ks = Math.round(n0 * ((j * THREAD_SHIFT) % 1));
    for (let k = 0; k <= n0; k++) {
      // (a point whose every swing puts it well outside the record's phases: any of them will do)
      const xa = F.xlo[k] + sh, xb = F.xhi[k] + sh;
      let a = sw[1];
      if (xb > lo - 2 && xa < hi + 2) for (let it = 0; it < 3; it++) { meanderPoint(F, k, a, fpt); a = aOfX(fpt.x + sh); }
      meanderPoint(F, k, a, fpt);
      const nb = nbOfX(fpt.x + sh);
      X[k] = fpt.x + sh; Y[k] = fpt.y; MX[k] = fpt.mx; MY[k] = fpt.my; WF[k] = 1 / Math.sqrt(1 + nb); SJ[k] = 1;
      if (j > 0) {
        const sj = dm.clamp(nb - (j - 1), 0, 1);
        meanderPoint(F, (k + ks) % n0, a, fps);
        // (and each drifting across the braidplain on its own, slowly, a couple of widths either way:
        // the trace read a quarter as fast; without it the threads crossed at the same knots, a rope)
        const kf = k * 0.25 + ks * 0.61 + 97 * j, i0 = Math.floor(kf), fr = kf - i0;
        meanderPoint(F, i0 % n0, 0.6, fpd); const d0 = fpd.y;
        meanderPoint(F, (i0 + 1) % n0, 0.6, fpd);
        Y[k] = fpt.y + sj * (fps.y - fpt.y + 0.35 * (d0 + (fpd.y - d0) * fr)); MX[k] = MY[k] = 0; SJ[k] = sj;
      }
    }
    return { X, Y, MX, MY, WF, SJ };
  };
  // the stretch of a line (closed: the channel, its points per period from family(); else an oxbow:
  // x unwrapped, y, n points) whose phases lie between the record's ends
  const lay = (xu0, y0, n, closed, kind, age, j = 0) => {
    const nseg = closed ? n : n - 1;
    let pa = 0, pb = 0;
    if (closed) { pa = Math.floor((lo - F.xhi[0]) / P) - 1; pb = Math.ceil((hi - F.xlo[0]) / P) + 1; }
    else {
      // (an oxbow lies in one period of the trace: the copies of it near the record's phases)
      let mn = Infinity, mxX = -Infinity;
      for (let k = 0; k < n; k++) { mn = Math.min(mn, xu0[k]); mxX = Math.max(mxX, xu0[k]); }
      pa = Math.floor((lo - mxX) / P); pb = Math.ceil((hi - mn) / P);
    }
    for (let p = pa; p <= pb; p++) {
      let xu, y, mx = null, my = null, wf = null, sj = null, sh = 0;
      if (closed) { const q = family(p, j); xu = q.X; y = q.Y; mx = q.MX; my = q.MY; wf = q.WF; sj = q.SJ; } else { xu = xu0; y = y0; sh = p * P; }
      for (let k = 0; k < nseg; k++) {
        const k1 = k + 1, Xa = xu[k] + sh, Xb = xu[k1] + sh, i1 = k1;
        const dX = Xb - Xa;
        let f0 = 0, f1 = 1;
        if (dX !== 0) { const fl = (lo - Xa) / dX, fh = (hi - Xa) / dX; f0 = Math.max(0, Math.min(fl, fh)); f1 = Math.min(1, Math.max(fl, fh)); }
        else if (Xa < lo || Xa > hi) f1 = -1;
        // (a thread lying along the first: none of its own there)
        if (j > 0 && sj[k] < 0.01 && sj[i1] < 0.01) f1 = -1;
        if (f0 > f1) { end(); continue; }
        const at = (f) => emit(Xa + dX * f, y[k] + (y[i1] - y[k]) * f, mx ? mx[k] + (mx[i1] - mx[k]) * f : 0, my ? my[k] + (my[i1] - my[k]) * f : 0, wf ? wf[k] + (wf[i1] - wf[k]) * f : 1);
        if (!open || f0 > 0) { end(); begin(kind, age); at(f0); }
        at(f1);
        if (f1 < 1) end();
      }
      if (!closed) end();
    }
    end();
  };
  if (!F.oxu) {
    F.oxu = F.lines.slice(1).map((L) => { const n = L.x.length, o = new Float64Array(n); o[0] = L.x[0]; for (let k = 1; k < n; k++) { let dx = L.x[k] - L.x[k - 1]; if (dx < -P / 2) dx += P; if (dx > P / 2) dx -= P; o[k] = o[k - 1] + dx; } return o; });
    // (each point's phase over the family: the least and most any swing puts it at)
    F.xlo = new Float64Array(n0 + 1); F.xhi = new Float64Array(n0 + 1);
    for (let k = 0; k <= n0; k++) { let a = Infinity, z = -Infinity; for (const Lv of F.levels) { a = Math.min(a, Lv.xu[k]); z = Math.max(z, Lv.xu[k]); } F.xlo[k] = a; F.xhi[k] = z; }
  }
  if (hi - lo > 1e-6) {
    lay(null, null, n0, true, 0, 0);
    // (a braided river's other threads, as many as it has here)
    const nbMax = Math.max(br[0], br[1], br[2]);
    for (let j = 1; j <= 3 && nbMax > j - 1 + 0.01; j++) lay(null, null, n0, true, 0, 0, j);
    // (its cut-off loops: lakes while young, swales once filled; only where it has grown its loops
    // whole, the trace's own (they're its))
    if (Math.max(sw[0], sw[1], sw[2]) > 0.9) F.lines.forEach((L, li) => { if (li && L.age < 0.8) lay(F.oxu[li - 1], L.y, L.x.length, false, 1, L.age); });
  } else {
    begin(0, 0); emit(J0, 0, 0, 0); emit(J1, 0, 0, 0); end();
  }
  // (where its profile steps (a fall: riverProfile), points at each face's top and foot, so its
  // channel drops there, over the face's few metres, not across the trace's whole segment. And each
  // fall's lip a horseshoe: a cap breaks back as its plunge pool undercuts it, the faster the more
  // water goes over (Gilbert 1907), and a channel's water goes over deepest in its middle (its unit
  // discharge ~ depth^5/3), so its lip has worn back furthest there: Niagara's Horseshoe. Its middle
  // HORSESHOE of the water's width behind its edges. And its water leaves the lip at the brink's
  // speed: through critical depth at a free overfall, the brink's depth ~0.715 of it (Rouse 1936),
  // so v = q / (0.715 (q^2 / g)^1/3) for its unit discharge q; falling free from there it lands
  // v sqrt(2 drop / g) out. Zones (ZONE floats: ta, tb, from that far above its lip to past where it
  // lands; t0, t1 its face; how far back its middle stands, m; its water's half width, m; the brink's
  // speed, m/s; how far out it lands, m), read across the channel by sampleSnap and riverRibbons,
  // with points at their ends too)
  if (hsOf.faces && hsOf.faces.length) {
    const W = {}, g = (gen.p && gen.p.g) || 9.81, L = Math.max(len, 1);
    ch.prof = hsOf; ch.len = len; ch.zones = [];
    for (let j = 0; j < hsOf.faces.length; j += 2) {
      const t0 = hsOf.faces[j], t1 = hsOf.faces[j + 1], half = 0.5 * (W0 + (W1 - W0) * t0);
      if (gen._riverWater) gen._riverWater(half, 0, hsOf(t0), 0, W); else { W.xw = half; W.v = 1; W.dm = 0.5; }
      const xw = Math.max(0.5, W.xw), dmax = HORSESHOE * 2 * xw, q = Math.max(1e-3, W.v * W.dm);
      const vb = q / (0.715 * Math.cbrt(q * q / g)), drop = Math.max(0, (hsOf(t0) - hsOf(t1)) * gen.hScale), xl = vb * Math.sqrt(2 * drop / g);
      ch.zones.push(Math.max(0, t0 - (dmax + 1) / L), Math.min(1, t1 + (xl + 2) / L), t0, t1, dmax, xw, vb, xl);
    }
    const F = [...hsOf.faces];
    for (let z = 0; z < ch.zones.length; z += ZONE) F.push(ch.zones[z], ch.zones[z + 1]);
    const P2 = [], A2 = [], pc2 = [];
    for (let q = 0; q < pcs.length; q += 2) {
      pc2.push(P2.length / 6);
      for (let k = pcs[q]; k < pcs[q + 1]; k++) {
        if (k > pcs[q] && kinds[q / 2] === 0) {
          const ta = A6[(k - 1) * 7 + 5], tb = A6[k * 7 + 5], lo = Math.min(ta, tb), hi = Math.max(ta, tb), ins = [];
          for (const te of F) if (te > lo && te < hi) ins.push(te);
          ins.sort((x, y) => (ta < tb ? x - y : y - x));
          for (const te of ins) {
            const f = (te - ta) / (tb - ta), a = (k - 1) * 6, b = k * 6, c = (k - 1) * 7, d = k * 7;
            for (let i = 0; i < 6; i++) P2.push(P3[a + i] + f * (P3[b + i] - P3[a + i]));
            A2.push(A6[c] + f * (A6[d] - A6[c]), hsOf(te), A6[c + 2] + f * (A6[d + 2] - A6[c + 2]), A6[c + 3] + f * (A6[d + 3] - A6[c + 3]), A6[c + 4] + f * (A6[d + 4] - A6[c + 4]), te, A6[c + 6] + f * (A6[d + 6] - A6[c + 6]));
          }
        }
        for (let i = 0; i < 6; i++) P2.push(P3[k * 6 + i]);
        for (let i = 0; i < 7; i++) A2.push(A6[k * 7 + i]);
      }
      pc2.push(P2.length / 6);
    }
    P3.length = 0; A6.length = 0; pcs.length = 0;
    for (const v of P2) P3.push(v);
    for (const v of A2) A6.push(v);
    for (const v of pc2) pcs.push(v);
  }
  // (where it runs into another river, on to that one's channel: it ends on its own valley's
  // line, and the other's channel may swing well off its own)
  const into = Lk.dn[r];
  if (dn < 0 && into >= 0 && building && !building.has(into)) {
    // (its channel's last point: where the channel piece reaching t = 1 ends)
    let e = -1;
    for (let q = 0; q < pcs.length; q += 2) if (kinds[q / 2] === 0) { const last = pcs[q + 1] - 1; if (A6[last * 7 + 5] > 0.999) e = last; }
    if (e >= 0) {
      const ex = P3[e * 6] + P3[e * 6 + 3], ey = P3[e * 6 + 1] + P3[e * 6 + 4], ez = P3[e * 6 + 2] + P3[e * 6 + 5];
      // (the nearest point of its channel, as its line's place and its swing off it, so the join
      // follows it when it's drawn nearer its line)
      let best = Infinity, bb = null, bo = null, bh = 0, bw = 0;
      for (const q of [into, Lk.up[into], dnOf(into)]) {
        if (q < 0 || q === r || building.has(q)) continue;
        const och = gen._chan(q, building);
        if (!och) continue;
        const o = chanNearest(och, ex, ey, ez, 0, _cn, 0);
        if (o.d2 < best) {
          best = o.d2;
          const k = o.p * 6, f = o.f, g = 1 - f, Q = och.pts;
          bb = [g * Q[k] + f * Q[k + 6], g * Q[k + 1] + f * Q[k + 7], g * Q[k + 2] + f * Q[k + 8]];
          bo = [o.x - bb[0], o.y - bb[1], o.z - bb[2]]; bh = o.hs; bw = o.wm;
        }
      }
      const gap = Math.sqrt(best) * R, half = A6[e * 7], wi = 2 * Rv.half[into];
      if (bb && gap < 2 * F.half * wi + 3 * W1 && gap > 0.5) {
        begin(0, 0);
        P3.push(P3[e * 6], P3[e * 6 + 1], P3[e * 6 + 2], P3[e * 6 + 3], P3[e * 6 + 4], P3[e * 6 + 5]); A6.push(half, A6[e * 7 + 1], 0, 0, 0, 1, A6[e * 7 + 6]);
        P3.push(bb[0], bb[1], bb[2], bo[0], bo[1], bo[2]); A6.push(half, Math.min(bh, A6[e * 7 + 1]), 0, 0, 0, 1, bw);
        end();
      }
    }
  }
  ch.pts = Float32Array.from(P3); ch.at = Float32Array.from(A6);
  ch.pc = Int32Array.from(pcs); ch.kind = Uint8Array.from(kinds); ch.age = Float32Array.from(ages);
  // (bounds of each run of up to eight segments, over the line and its swing both, so any
  // nearness drawn between them is inside; and the whole)
  const gb = [], gi = [], np = ch.pts.length / 6;
  let mh = 0;
  for (let q = 0; q < ch.kind.length; q++) {
    const p0 = ch.pc[2 * q], p1 = ch.pc[2 * q + 1];
    for (let s = p0; s < p1 - 1; s += GROUP) {
      const s1 = Math.min(p1 - 1, s + GROUP);
      let cx = 0, cy = 0, cz = 0, k = 0, m = 0, gh = 0;
      for (let p = s; p <= s1; p++) { const o = p * 6; cx += 2 * ch.pts[o] + ch.pts[o + 3]; cy += 2 * ch.pts[o + 1] + ch.pts[o + 4]; cz += 2 * ch.pts[o + 2] + ch.pts[o + 5]; k += 2; gh = Math.max(gh, ch.at[p * 7]); }
      cx /= k; cy /= k; cz /= k;
      for (let p = s; p <= s1; p++) {
        const o = p * 6;
        for (let f = 0; f <= 1; f++) { const dx = ch.pts[o] + f * ch.pts[o + 3] - cx, dy = ch.pts[o + 1] + f * ch.pts[o + 4] - cy, dz = ch.pts[o + 2] + f * ch.pts[o + 5] - cz; m = Math.max(m, dx * dx + dy * dy + dz * dz); }
      }
      gb.push(cx, cy, cz, Math.sqrt(m) * 1.0001 + 1e-9); gi.push(q, s, s1 - s);
      mh = Math.max(mh, gh);
    }
  }
  ch.groups = Float64Array.from(gb); ch.gi = Int32Array.from(gi); ch.maxHalf = mh; ch.nOx = ch.kind.reduce((a, k) => a + k, 0); ch.r = r;
  {
    let cx = 0, cy = 0, cz = 0, m = 0;
    for (let p = 0; p < np; p++) { cx += ch.pts[p * 6]; cy += ch.pts[p * 6 + 1]; cz += ch.pts[p * 6 + 2]; }
    if (np) { cx /= np; cy /= np; cz /= np; }
    const G = ch.groups;
    for (let g = 0; g < G.length; g += 4) { const dx = G[g] - cx, dy = G[g + 1] - cy, dz = G[g + 2] - cz; m = Math.max(m, Math.sqrt(dx * dx + dy * dy + dz * dz) + G[g + 3]); }
    ch.bound[0] = cx; ch.bound[1] = cy; ch.bound[2] = cz; ch.bound[3] = m * 1.0001 + 1e-9;
  }
  return ch;
}

// the nearest point of a channel's kind-k pieces (0 the channel, 1 its oxbows) to (x, y, z),
// sampled minW apart (its swing drawn where its loops can be seen: full at 2 widths, none past 6):
// into out { d2 (squared, unit sphere), p (segment's first point), f (along it), x, y, z, half,
// hs, mx, my, mz, t, wm, age, ch }. With keep, out is left alone unless something is nearer
// than out.d2 already is (so several channels can be searched in turn)
export const nfOf = (wm, minW) => minW <= 2 * wm ? 1 : minW >= 6 * wm ? 0 : dm.smoothstep(6 * wm, 2 * wm, minW);
const _cn = { d2: Infinity, p: -1, f: 0, x: 0, y: 0, z: 0, half: 0, hs: 0, mx: 0, my: 0, mz: 0, t: 0, wm: 0, age: 0, ch: null };
// the way the water runs at the point chanNearest last found (out): down its channel (unit,
// planet-fixed, into d: the way its t grows, a record running downstream from its start), and the
// water's slope there (the sim's heights over the ground's metres), or -1 where it can't be told.
// R: the world's radius (m)
export function chanFlow(out, R, d) {
  const ch = out.ch, p = out.p;
  if (!ch || !(p >= 0)) return -1;
  const P = ch.pts, A = ch.at, n = A.length / 7;
  if (p + 1 >= n) return -1;
  const o = p * 6, oa = p * 7;
  const dx = P[o + 6] + P[o + 9] - P[o] - P[o + 3], dy = P[o + 7] + P[o + 10] - P[o + 1] - P[o + 4], dz = P[o + 8] + P[o + 11] - P[o + 2] - P[o + 5];
  const L = Math.sqrt(dx * dx + dy * dy + dz * dz);
  if (!(L > 0)) return -1;
  const sg = A[oa + 12] >= A[oa + 5] ? 1 : -1;
  d[0] = sg * dx / L; d[1] = sg * dy / L; d[2] = sg * dz / L;
  return Math.abs(A[oa + 8] - A[oa + 1]) / (L * R);
}

export function chanNearest(ch, x, y, z, minW, out, kind = 0, keep = false) {
  if (!keep) { out.d2 = Infinity; out.ch = null; }
  const G = ch.groups, gi = ch.gi, P = ch.pts, A = ch.at;
  let bd = out.d2, bp = -1, bf = 0;
  for (let g = 0, q = 0; g < G.length; g += 4, q += 3) {
    if (ch.kind[gi[q]] !== kind) continue;
    const dx = G[g] - x, dy = G[g + 1] - y, dz = G[g + 2] - z, lb = Math.sqrt(dx * dx + dy * dy + dz * dz) - G[g + 3];
    if (lb > 0 && lb * lb >= bd) continue;
    const s0 = gi[q + 1], s1 = s0 + gi[q + 2];
    let o = s0 * 6, nf = nfOf(A[s0 * 7 + 6], minW), ax = P[o] + nf * P[o + 3], ay = P[o + 1] + nf * P[o + 4], az = P[o + 2] + nf * P[o + 5];
    for (let s = s0; s < s1; s++) {
      o += 6; nf = nfOf(A[(s + 1) * 7 + 6], minW);
      const bx = P[o] + nf * P[o + 3], by = P[o + 1] + nf * P[o + 4], bz = P[o + 2] + nf * P[o + 5];
      const ux = bx - ax, uy = by - ay, uz = bz - az, L2 = ux * ux + uy * uy + uz * uz;
      const f = L2 > 0 ? Math.max(0, Math.min(1, ((x - ax) * ux + (y - ay) * uy + (z - az) * uz) / L2)) : 0;
      const ex = ax + f * ux - x, ey = ay + f * uy - y, ez = az + f * uz - z, d2 = ex * ex + ey * ey + ez * ez;
      if (d2 < bd) { bd = d2; bp = s; bf = f; }
      ax = bx; ay = by; az = bz;
    }
  }
  if (bp < 0) return out;
  const o = bp * 6, oa = bp * 7, f = bf, g = 1 - f, n0 = nfOf(A[oa + 6], minW), n1 = nfOf(A[oa + 13], minW);
  out.d2 = bd; out.p = bp; out.f = bf; out.ch = ch;
  out.x = g * (P[o] + n0 * P[o + 3]) + f * (P[o + 6] + n1 * P[o + 9]);
  out.y = g * (P[o + 1] + n0 * P[o + 4]) + f * (P[o + 7] + n1 * P[o + 10]);
  out.z = g * (P[o + 2] + n0 * P[o + 5]) + f * (P[o + 8] + n1 * P[o + 11]);
  out.half = g * A[oa] + f * A[oa + 7]; out.hs = g * A[oa + 1] + f * A[oa + 8];
  out.mx = g * A[oa + 2] + f * A[oa + 9]; out.my = g * A[oa + 3] + f * A[oa + 10]; out.mz = g * A[oa + 4] + f * A[oa + 11];
  out.t = g * A[oa + 5] + f * A[oa + 12]; out.wm = g * A[oa + 6] + f * A[oa + 13];
  // (which piece: an oxbow's age)
  if (kind) { let q = 0; while (q + 1 < ch.kind.length && ch.pc[2 * q + 1] <= bp) q++; out.age = ch.age[q]; }
  return out;
}
// a fresh out for chanNearest
export const nearOut = () => ({ d2: Infinity, p: -1, f: 0, x: 0, y: 0, z: 0, half: 0, hs: 0, mx: 0, my: 0, mz: 0, t: 0, wm: 0, age: 0, ch: null });
