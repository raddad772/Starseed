// Climate through the year (WORLDSIM.md checklist 11), on a coarse SimGrid:
// monthly temperature, rain and snow, and the Köppen climate of every place.
//
//   sunlight     daily-mean insolation by latitude and month from the axial tilt,
//                the orbit's eccentricity and where perihelion falls in the year
//                (a tidally locked world: a fixed day side, no seasons)
//   temperature  an energy balance per cell through the year: oceans store heat (mild
//                coasts, harsh continental interiors), snow and ice brighten the
//                ground, heat spreads poleward (more in thick air and on slow spinners,
//                most on a locked world), heat goes to space faster the hotter it is
//                (so a day side can't run away), calibrated so the year's mean is the
//                world's own (its history)
//   currents     the oceans' gyres: cold currents up the west coasts of the subtropics
//                (cool, foggy, rainless: the Atacama's and the Namib's), warm currents
//                down the east coasts (the Gulf Stream's mild winters)
//   winds        belts from the rotation rate (trades, westerlies, polar easterlies:
//                more belts on fast spinners), shifting with the sun through the year;
//                locked worlds: from the night side toward the day side
//   rain         water evaporates off warm seas (land gives back only part of what fell
//                on it), rides the wind, and falls where air rises (the rain belt that
//                follows the sun, windward slopes, ground warmer than the air around it)
//                or cools; the sinking subtropics, the lee of mountains, the far
//                interiors, winter continents and cold-current coasts stay dry: deserts
//   Köppen       from monthly temperature and rain: tropical, arid, temperate,
//                continental and polar climates with their seasons
//
// Deterministic (dmath). Units: K, mm/month.

import * as dm from '../../core/dmath.js';

const MONTHS = 12, STEPS = 48, YEARS = 4, PASSES = 14;
const SIGMA_EARTH = 1361; // W/m^2 at 1 S_earth

// opts: { h (heights on G, m), S (x Earth), obliquity, ecc, perihelion (solar longitude, rad),
//   locked, substellar ([x,y,z] in the body frame), rotH (rotation period, hours), retro
//   (spins backward), hadley, pressure (bar), Tmean (target annual mean, K), albedo, yearDays,
//   sea (optional: which cells are sea; else those below sea level) }
export function climate(G, opts) {
  const n = G.n, d = G.dir, h = opts.h;
  const sea = opts.sea ? Uint8Array.from(opts.sea) : new Uint8Array(n);
  if (!opts.sea) for (let c = 0; c < n; c++) sea[c] = h[c] < 0 ? 1 : 0;
  const lat = new Float64Array(n);
  for (let c = 0; c < n; c++) lat[c] = dm.asin(Math.max(-1, Math.min(1, d[c * 3 + 1])));
  const P = Math.max(opts.pressure || 0, 0.001);
  // ---- sunlight by month
  const Q = new Float64Array(MONTHS * n);
  const S0 = opts.S * SIGMA_EARTH, obl = opts.obliquity || 0, e = opts.ecc || 0, peri = opts.perihelion || 0;
  for (let m = 0; m < MONTHS; m++) {
    const L = dm.TWO_PI * (m + 0.5) / MONTHS;               // solar longitude from the equinox
    const dec = dm.asin(dm.sin(obl) * dm.sin(L));
    const nu = L - peri, dist = (1 + e * dm.cos(nu)) / (1 - e * e);
    for (let c = 0; c < n; c++) {
      let q;
      if (opts.locked) {
        const ss = opts.substellar || [1, 0, 0];
        q = S0 * Math.max(0, d[c * 3] * ss[0] + d[c * 3 + 1] * ss[1] + d[c * 3 + 2] * ss[2]);
      } else {
        const ph = lat[c], x = -dm.tan(ph) * dm.tan(dec);
        const h0 = x >= 1 ? 0 : x <= -1 ? dm.PI : dm.acos(x);
        q = S0 / dm.PI * (h0 * dm.sin(ph) * dm.sin(dec) + dm.cos(ph) * dm.cos(dec) * dm.sin(h0));
      }
      Q[m * n + c] = Math.max(0, q) * dist * dist;
    }
  }
  // ---- energy balance, the classic seasonal way: each cell keeps its own heat
  // capacity (land swings with the seasons, the sea is slow) and is tied to the
  // mean of its latitude band (the air mixes fast along a band); the band means
  // carry heat poleward by diffusion (an implicit solve, so any time step holds).
  // A locked world's "bands" are rings round its day side's middle.
  const yearS = (opts.yearDays || 365) * 86400, dt = yearS / STEPS;
  // (the season reaches deeper into ground and sea in a long year: depth ~ sqrt(period))
  const deep = dm.sqrt(dm.clamp((opts.yearDays || 365) / 365, 0.25, 9));
  const Cocean = 4.2e6 * 50 * deep, Cland = 1e7 * (0.5 + 0.5 * Math.min(P, 4)) * deep;
  const GAMMA = 5 * Math.min(2, dm.sqrt(P));    // W/m^2/K: band mixing (land and sea keep their own seasons)
  // poleward spread: thick air carries more; a slow spinner's Hadley cells reach the poles
  // and a locked world's air sweeps the day side's heat round to the night
  const spinK = opts.locked ? 3 : dm.clamp(dm.pow(Math.max(opts.rotH || 24, 1) / 24, 0.3), 0.5, 3);
  // (W/m^2/K in sin(latitude): ~0.5 for an Earth, as energy-balance models fit its observed
  // equator-to-pole gradient, ~27 C to ~-25 C in the year's mean (North et al. 1981))
  const Dm = 0.5 * dm.sqrt(P) * spinK * (opts.locked ? 2 : 1);
  const NB = 36;
  const bandOf = new Int32Array(n);
  for (let c = 0; c < n; c++) {
    let x = d[c * 3 + 1];
    if (opts.locked) { const ss = opts.substellar || [1, 0, 0]; x = d[c * 3] * ss[0] + d[c * 3 + 1] * ss[1] + d[c * 3 + 2] * ss[2]; }
    bandOf[c] = Math.min(NB - 1, Math.max(0, Math.floor((x + 1) / 2 * NB)));
  }
  const bandA = new Float64Array(NB), bandC = new Float64Array(NB), Tb = new Float64Array(NB);
  // (the band's capacity as its cells' harmonic mean: then heat spread as equal energy per
  // area moves the band's area-mean temperature exactly as the band solve says)
  for (let c = 0; c < n; c++) { bandA[bandOf[c]] += G.area[c]; bandC[bandOf[c]] += G.area[c] / (sea[c] ? Cocean : Cland); }
  for (let b = 0; b < NB; b++) bandC[b] = bandA[b] > 0 ? bandA[b] / bandC[b] : Cocean;
  // the gyres' heat: cold currents (eastern sides of ocean basins) and warm ones (western), W/m^2
  const cur = gyres(G, sea, lat, opts.retro ? -1 : 1, !!opts.locked);
  const Fg = new Float64Array(n);
  for (let c = 0; c < n; c++) Fg[c] = 35 * cur.warm[c] - 45 * cur.cold[c];
  const target = opts.Tmean || 288;
  const T = new Float64Array(n).fill(target);
  const Tm = new Float64Array(MONTHS * n);
  // heat to space, A (T/target)^ex: a blackbody's T^4, softened where water vapour
  // traps more as it warms (the slope near the mean ~2 W/m^2/K on an Earth); A (the
  // outgoing heat at the mean) found by bisection so the year's mean is the world's
  // own: ice makes the response steep and two-valued (snowball or not), so each try
  // starts from the same state
  let wet = 0;
  for (let c = 0; c < n; c++) wet += sea[c];
  const ex = 4 - 1.5 * Math.min(1, P) * (wet > 0.02 * n ? 1 : 0.3);
  const T0 = 40, TSTEP = 0.25, NT = 4000, olrTab = new Float64Array(NT + 1);
  for (let i = 0; i <= NT; i++) olrTab[i] = dm.pow((T0 + i * TSTEP) / target, ex);
  const olr = (t) => { let f = (t - T0) / TSTEP; if (f < 0) f = 0; if (f > NT - 1) f = NT - 1; const i = f | 0; return olrTab[i] + (olrTab[i + 1] - olrTab[i]) * (f - i); };
  let A = 240, Alo = 2, Ahi = 20000;
  // a locked water world's day side wears a thick cloud deck (a big part of why it stays mild)
  const cloud = new Float64Array(n);
  if (opts.locked && wet > 0.02 * n) { const ss = opts.substellar || [1, 0, 0]; for (let c = 0; c < n; c++) cloud[c] = 0.25 * Math.min(1, P) * Math.max(0, d[c * 3] * ss[0] + d[c * 3 + 1] * ss[1] + d[c * 3 + 2] * ss[2]); }
  // (life's cover, if given: forests darken the land; snow on a forest still shows dark)
  const vegCover = opts.cover || null, vegForest = opts.forest || null;
  // (snow needs air to carry the water to it: in a thin air the vapour freezes out at the
  // coldest place, the cold trap, which sets its frost point: the ice lies only where the ground
  // is nearly as cold as that (Mars' caps, and its winter pole's frost), the rest bare however
  // cold; as the terrain's own snow rule has it)
  const thinK = 1 - dm.clamp(dm.log10(P) + 2, 0, 1);
  let iceLo = 261, iceHi = 271;
  const albedoOf = (c, Tc) => {
    const darken = vegCover && !sea[c] ? 0.05 * vegCover[c] * (0.4 + 0.6 * (vegForest ? vegForest[c] : 0)) : 0;
    const base = (sea[c] ? 0.1 : 0.16 - darken) + cloud[c]; // (clouds even out land and sea, seen from space)
    const ice = (Tc < iceLo ? 1 : Tc < iceHi ? (iceHi - Tc) / 10 : 0) * (vegForest && !sea[c] ? 1 - 0.5 * vegForest[c] * (vegCover ? vegCover[c] : 1) : 1);
    return Math.min(0.8, base + (0.6 - base) * ice + (opts.albedo ?? 0.3) - 0.22);
  };
  // the poleward diffusion of band means in x = sin(lat): d/dx (D (1 - x^2) dT/dx), implicit (tridiagonal)
  const dx = 2 / NB, aa = new Float64Array(NB), bb = new Float64Array(NB), cc = new Float64Array(NB), rr = new Float64Array(NB);
  const Tb2 = new Float64Array(NB);
  const diffuse = () => {
    for (let b = 0; b < NB; b++) {
      const xl = -1 + b * dx, xh = xl + dx;
      const kl = b > 0 ? Dm * (1 - xl * xl) / (dx * dx) : 0, kh = b < NB - 1 ? Dm * (1 - xh * xh) / (dx * dx) : 0;
      const cdt = bandC[b] / dt;
      aa[b] = -kl; cc[b] = -kh; bb[b] = cdt + kl + kh; rr[b] = cdt * Tb[b];
    }
    for (let b = 1; b < NB; b++) { const m = aa[b] / bb[b - 1]; bb[b] -= m * cc[b - 1]; rr[b] -= m * rr[b - 1]; }
    Tb2[NB - 1] = rr[NB - 1] / bb[NB - 1];
    for (let b = NB - 2; b >= 0; b--) Tb2[b] = (rr[b] - cc[b] * Tb2[b + 1]) / bb[b];
  };
  for (let pass = 0; pass < PASSES; pass++) {
    A = dm.sqrt(Alo * Ahi);
    T.fill(target);
    for (let y = 0; y < YEARS; y++) {
      for (let s = 0; s < STEPS; s++) {
        const m = Math.floor(s * MONTHS / STEPS);
        // band means, then their poleward spread: the air brings it as the same heat per
        // square metre to land and sea alike (so land warms by more degrees, the sea by fewer)
        Tb.fill(0);
        for (let c = 0; c < n; c++) Tb[bandOf[c]] += T[c] * G.area[c];
        for (let b = 0; b < NB; b++) Tb[b] = bandA[b] > 0 ? Tb[b] / bandA[b] : 0;
        diffuse();
        for (let c = 0; c < n; c++) { const b = bandOf[c]; T[c] += (Tb2[b] - Tb[b]) * bandC[b] / (sea[c] ? Cocean : Cland); }
        if (thinK > 0) { let tmin = 1e9; for (let c = 0; c < n; c++) if (T[c] < tmin) tmin = T[c]; iceLo = 261 + (Math.min(261, tmin + 6) - 261) * thinK; iceHi = iceLo + 10; }
        // each cell: sunlight, the currents, heat to space (linearised about now), and the pull of its band
        for (let c = 0; c < n; c++) {
          const C = sea[c] ? Cocean : Cland, o = A * olr(T[c]), slope = ex * o / T[c];
          const src = Q[m * n + c] * (1 - albedoOf(c, T[c])) + Fg[c] - o + slope * T[c] + GAMMA * Tb2[bandOf[c]];
          T[c] = (C / dt * T[c] + src) / (C / dt + slope + GAMMA);
        }
        if (y === YEARS - 1 && s % (STEPS / MONTHS) === STEPS / MONTHS - 1) for (let c = 0; c < n; c++) Tm[m * n + c] = T[c];
      }
    }
    // shift the outgoing heat so the year's mean matches the world's
    let mean = 0, wt = 0;
    for (let m = 0; m < MONTHS; m++) for (let c = 0; c < n; c++) { mean += Tm[m * n + c] * G.area[c]; wt += G.area[c]; }
    mean /= wt;
    if (opts.debug) opts.debug(`pass ${pass}: A ${A.toFixed(1)}, mean ${(mean - 273.15).toFixed(1)} C`);
    if (Math.abs(mean - target) < 0.3) break;
    if (mean > target) Alo = A; else Ahi = A;
  }
  // heights: the lapse rate on land
  const lapse = opts.lapse ?? 0.0065;
  for (let m = 0; m < MONTHS; m++) for (let c = 0; c < n; c++) if (!sea[c]) Tm[m * n + c] -= lapse * h[c];
  // ---- winds and rain, month by month
  const geo = edgeGeometry(G);
  // the cold currents' coasts: land within two cells of a cold current sits under the
  // sea's cool, stable air (fog, no rain)
  const coolCoast = new Float64Array(n);
  for (let c = 0; c < n; c++) {
    if (sea[c]) continue;
    for (let k = G.nStart[c]; k < G.nStart[c + 1]; k++) {
      const o = G.nbr[k];
      coolCoast[c] = Math.max(coolCoast[c], cur.cold[o]);
      for (let k2 = G.nStart[o]; k2 < G.nStart[o + 1]; k2++) coolCoast[c] = Math.max(coolCoast[c], 0.7 * cur.cold[G.nbr[k2]]);
    }
  }
  const Pm = new Float64Array(MONTHS * n);
  const nH = Math.max(1, opts.hadley || 3), spin = opts.retro ? -1 : 1;
  const zm = new Float64Array(37), zn = new Float64Array(37);
  for (let m = 0; m < MONTHS; m++) {
    const Tmm = Tm.subarray(m * n, (m + 1) * n);
    // the thermal equator: where the zonal mean is warmest this month
    zm.fill(0); zn.fill(0);
    for (let c = 0; c < n; c++) { const b = Math.round(lat[c] * 180 / dm.PI / 2.5) + 18; if (b >= 0 && b <= 36 && Math.abs(lat[c] - (b - 18) * 2.5 * dm.PI / 180) < 0.05) { zm[b] += Tmm[c]; zn[b]++; } }
    let best = 0, bestT = -1e9;
    for (let b = 0; b <= 36; b++) if (zn[b] && zm[b] / zn[b] > bestT) { bestT = zm[b] / zn[b]; best = (b - 18) * 2.5 * dm.PI / 180; }
    const itcz = opts.locked ? 0 : best * 0.7;
    // the air: each band's mean at sea level, cooling with height over land. Ground
    // warmer than its band's air heats it from below (it rises: showers, the summer
    // monsoon), colder ground chills it (stable: winter continents, cold-current coasts, dry)
    Tb.fill(0);
    for (let c = 0; c < n; c++) Tb[bandOf[c]] += (Tmm[c] + (sea[c] ? 0 : lapse * Math.max(0, h[c]))) * G.area[c];
    for (let b = 0; b < NB; b++) Tb[b] = bandA[b] > 0 ? Tb[b] / bandA[b] : 0;
    const stab = new Float64Array(n), Tair = new Float64Array(n);
    for (let c = 0; c < n; c++) {
      const lift = sea[c] ? 0 : lapse * Math.max(0, h[c]);
      Tair[c] = Tb[bandOf[c]] - lift;
      stab[c] = dm.clamp(1 + (Tmm[c] + lift - Tb[bandOf[c]]) / 8, 0.2, 2) * (1 - 0.8 * coolCoast[c]);
    }
    const wind = windField(G, lat, itcz, nH, opts.locked ? opts.substellar : null, spin);
    rainMonth(G, geo, h, sea, Tmm, Tair, stab, wind, itcz, lat, Pm.subarray(m * n, (m + 1) * n), opts.locked, vegCover);
  }
  // global scale: ~1000 mm/yr on an Earth, rising ~2.5%/K, with the sea's share; the rise
  // spent by ~330 K (a hothouse's rain is heavy, not millions of times Earth's), and none reaching
  // the ground as the surface nears water's critical point (647 K: no liquid at any pressure; a
  // 1,200 K greenhouse world drew e^24 times Earth's rain, all its land rainforest)
  let ocean = 0, tot = 0;
  for (let c = 0; c < n; c++) { tot += G.area[c]; if (sea[c]) ocean += G.area[c]; }
  const Tm0 = opts.Tmean || 288;
  const want = 1000 / 12 * dm.exp(0.025 * (Math.min(Tm0, 330) - 288)) * (1 - dm.smoothstep(400, 647, Tm0)) * Math.sqrt(Math.max(0.02, ocean / tot) / 0.7) * Math.min(1, P / 0.2);
  let have = 0;
  for (let m = 0; m < MONTHS; m++) for (let c = 0; c < n; c++) have += Pm[m * n + c] * G.area[c];
  have /= tot * MONTHS;
  const k = have > 0 ? want / have : 0;
  for (let i = 0; i < Pm.length; i++) Pm[i] *= k;
  // ---- the year in sum, and Köppen
  const Tann = new Float64Array(n), Pann = new Float64Array(n), snow = new Float64Array(n);
  const koppen = new Array(n);
  for (let c = 0; c < n; c++) {
    let tS = 0, pS = 0, sn = 0;
    for (let m = 0; m < MONTHS; m++) { const t = Tm[m * n + c], p = Pm[m * n + c]; tS += t; pS += p; if (t < 273) sn += p; }
    Tann[c] = tS / MONTHS; Pann[c] = pS; snow[c] = sn;
    koppen[c] = sea[c] ? 'sea' : koppenOf(c, n, Tm, Pm, lat[c] >= 0);
  }
  return { Tm, Pm, Tann, Pann, snow, koppen, sea, upwell: cur.cold };
}

// each neighbour link's direction as (east, north) unit components: from the
// neighbour toward the cell in the neighbour's frame (what the wind carries in), and
// from the cell toward the neighbour in the cell's (the slope the wind climbs)
function edgeGeometry(G) {
  const d = G.dir, m = G.nbr.length;
  const inE = new Float64Array(m), inN = new Float64Array(m), upE = new Float64Array(m), upN = new Float64Array(m);
  const dirEN = (fx, fy, fz, tx, ty, tz) => {
    const ox = tx - fx, oy = ty - fy, oz = tz - fz;
    const el = dm.sqrt(fz * fz + fx * fx) || 1, east = (ox * -fz + oz * fx) / el;
    const n0 = -fx * fy, n1 = fx * fx + fz * fz, n2 = -fz * fy, nl = dm.sqrt(n0 * n0 + n1 * n1 + n2 * n2) || 1;
    const north = (ox * n0 + oy * n1 + oz * n2) / nl, l = dm.sqrt(east * east + north * north) || 1;
    return [east / l, north / l];
  };
  for (let c = 0; c < G.n; c++) for (let k = G.nStart[c]; k < G.nStart[c + 1]; k++) {
    const o = G.nbr[k];
    const a = dirEN(d[o * 3], d[o * 3 + 1], d[o * 3 + 2], d[c * 3], d[c * 3 + 1], d[c * 3 + 2]);
    const b = dirEN(d[c * 3], d[c * 3 + 1], d[c * 3 + 2], d[o * 3], d[o * 3 + 1], d[o * 3 + 2]);
    inE[k] = a[0]; inN[k] = a[1]; upE[k] = b[0]; upN[k] = b[1];
  }
  return { inE, inN, upE, upN };
}

// the oceans' gyres, from each sea cell's distance (degrees of arc along its latitude)
// to land eastward and westward: within ~20 deg of a coast lying to the east, in the
// subtropics, a cold current (the trades push the surface water off that coast and cold
// water wells up); within ~20 deg of a coast to the west, a warm current running poleward
// (the western sides of ocean gyres are their fast, warm ones). Wide basins only.
function gyres(G, sea, lat, spin, locked) {
  const n = G.n, d = G.dir, cold = new Float64Array(n), warm = new Float64Array(n);
  if (locked) return { cold, warm };
  const STEP = 1.5 * dm.PI / 180, MAXK = 24;
  const reach = (c, dir) => {
    const cl = dm.cos(lat[c]), y = d[c * 3 + 1], lon = dm.atan2(d[c * 3 + 2], d[c * 3]);
    for (let k = 1; k <= MAXK; k++) {
      const L = lon + dir * k * STEP / cl;
      if (!sea[G.cellAt(cl * dm.cos(L), y, cl * dm.sin(L))]) return k * 1.5;
    }
    return 99;
  };
  for (let c = 0; c < n; c++) {
    if (!sea[c]) continue;
    const la = Math.abs(lat[c]) * 180 / dm.PI;
    if (la > 62 || la < 6) continue;
    const dE = reach(c, spin), dW = reach(c, -spin);
    const wC = dm.smoothstep(8, 15, la) * (1 - dm.smoothstep(35, 45, la));
    const wW = dm.smoothstep(15, 25, la) * (1 - dm.smoothstep(45, 60, la));
    cold[c] = wC * Math.max(0, 1 - dE / 20) * Math.min(1, dW / 15);
    warm[c] = wW * Math.max(0, 1 - dW / 20) * Math.min(1, dE / 15);
  }
  return { cold, warm };
}

// prevailing surface wind (east, north) per cell; spin -1: the world turns backward (the belts mirror)
function windField(G, lat, itcz, nH, substellar, spin = 1) {
  const n = G.n, u = new Float64Array(n), v = new Float64Array(n);
  const band = dm.HALF_PI / nH;
  for (let c = 0; c < n; c++) {
    if (substellar) {
      // toward the day side's middle: the surface flow of a locked world
      const d = G.dir, s = substellar;
      const x = d[c * 3], y = d[c * 3 + 1], z = d[c * 3 + 2];
      const dot = x * s[0] + y * s[1] + z * s[2];
      const tx = s[0] - dot * x, ty = s[1] - dot * y, tz = s[2] - dot * z; // toward the substellar point, along the ground
      const el = dm.sqrt(z * z + x * x) || 1; // east: (-z, 0, x)
      const n0 = -x * y, n1 = x * x + z * z, n2 = -z * y, nl = dm.sqrt(n0 * n0 + n1 * n1 + n2 * n2) || 1; // north
      u[c] = (tx * -z + tz * x) / el; v[c] = (tx * n0 + ty * n1 + tz * n2) / nl;
      const l = dm.sqrt(u[c] * u[c] + v[c] * v[c]) || 1; u[c] /= l; v[c] /= l;
      continue;
    }
    const rel = lat[c] - itcz, a = Math.abs(rel), k = Math.min(nH - 1, Math.floor(a / band));
    const toward = rel > 0 ? -1 : 1;            // north component pointing toward the rain belt
    // alternate: easterlies flowing toward the belt, westerlies flowing away, ...
    const east = k % 2 === 0 ? -1 : 1;
    const merid = k % 2 === 0 ? toward : -toward;
    u[c] = east * spin * 0.85; v[c] = merid * 0.5;
  }
  return { u, v, band };
}

// a month's rain: evaporation, carried downwind, rained out where air rises or cools.
// T: the ground's temperature (evaporation); Tair: the air's (what it can hold);
// stab: how readily the air rises off this ground this month (warm ground, unstable)
function rainMonth(G, geo, h, sea, T, Tair, stab, wind, itcz, lat, out, locked, cover) {
  const n = G.n;
  const qs = (t) => dm.exp(0.0687 * (t - 273)); // water the air can hold (relative, Clausius-Clapeyron)
  // (a cell's evaporation fills only a small part of what the air holds: air crossing a
  // cell picks up a day's evaporation, and holds a couple of weeks' worth)
  const EVAP = 0.08;
  const Es = new Float64Array(n), r = new Float64Array(n);
  for (let c = 0; c < n; c++) {
    Es[c] = EVAP * qs(T[c]);
    // how readily it rains here: the rising rain belt, the sinking subtropics (where the
    // Hadley cells come down, warming and drying: the great deserts' belt), fronts, slopes
    const a = Math.abs(lat[c] - itcz), band = wind.band;
    const rise = locked ? 0.25 + 0.75 * Math.max(0, 1 - a) : (a < 0.18 ? 1.0 : (Math.abs(a - band) < 0.2 ? 0.04 : (a > band && a < 2 * band ? 0.45 : 0.25)));
    // upslope: the wind blowing into higher ground
    let up = 0;
    for (let k = G.nStart[c]; k < G.nStart[c + 1]; k++) {
      const dz = Math.max(0, h[G.nbr[k]]) - Math.max(0, h[c]);
      if (dz <= 0) continue;
      const along = geo.upE[k] * wind.u[c] + geo.upN[k] * wind.v[c];
      if (along > 0) up = Math.max(up, along * dz / 1000);
    }
    // (over the open sea it rains out less: the sea exports moisture to the land)
    r[c] = Math.min(0.9, (0.015 + 0.1 * rise) * stab[c] * (sea[c] ? 0.5 : 1) + 0.3 * up);
  }
  // carry the moisture downwind to a steady state. The sea evaporates freely; land gives
  // back at most 60% of what rained on it (plants and soil: a desert has nothing to give)
  let q = new Float64Array(n), q2 = new Float64Array(n);
  const prev = new Float64Array(n);
  for (let it = 0; it < 80; it++) {
    for (let c = 0; c < n; c++) {
      // what arrives: from the upwind neighbours
      let inflow = 0, wsum = 0;
      for (let k = G.nStart[c]; k < G.nStart[c + 1]; k++) {
        const o = G.nbr[k];
        const along = geo.inE[k] * wind.u[o] + geo.inN[k] * wind.v[o];
        if (along > 0) { inflow += along * q[o]; wsum += along; }
      }
      // (land hands back what rained on it: bare ground ~20%, plant cover up to ~70%:
      // forests carry the rain far inland, the Amazon's way)
      const back = cover ? 0.2 + 0.5 * cover[c] : 0.6;
      const E = sea[c] ? Es[c] : Math.min(back * Es[c], back * prev[c]);
      const held = E + (wsum > 0 ? inflow / wsum * 0.99 : 0);
      // too much for the air to hold (cold): it comes out
      const cap = qs(Tair[c]) * 1.2;
      const over = Math.max(0, held - cap);
      q2[c] = held - over;
      out[c] = r[c] * q2[c] + over;
      q2[c] *= 1 - r[c];
    }
    prev.set(out);
    const t = q; q = q2; q2 = t;
  }
}

// Köppen climate from 12 months (K, mm); north: the northern hemisphere
function koppenOf(c, n, Tm, Pm, north) {
  const t = [], p = [];
  for (let m = 0; m < 12; m++) { t.push(Tm[m * n + c] - 273.15); p.push(Pm[m * n + c]); }
  const tMax = Math.max(...t), tMin = Math.min(...t), tAnn = t.reduce((a, b) => a + b) / 12, pAnn = p.reduce((a, b) => a + b);
  // (months count from the northern spring equinox: the north's summer half is 0-5)
  const sumIdx = north ? [0, 1, 2, 3, 4, 5] : [6, 7, 8, 9, 10, 11];
  const winIdx = north ? [6, 7, 8, 9, 10, 11] : [0, 1, 2, 3, 4, 5];
  const pSum = sumIdx.reduce((a, i) => a + p[i], 0), pWin = winIdx.reduce((a, i) => a + p[i], 0);
  if (tMax < 10) return tMax < 0 ? 'EF' : 'ET';
  const th = 20 * tAnn + (pSum >= 0.7 * pAnn ? 280 : pSum >= 0.3 * pAnn ? 140 : 0);
  if (pAnn < th) return (pAnn < th / 2 ? 'BW' : 'BS') + (tAnn >= 18 ? 'h' : 'k');
  const pDry = Math.min(...p);
  if (tMin >= 18) return pDry >= 60 ? 'Af' : pDry >= 100 - pAnn / 25 ? 'Am' : 'Aw';
  const sDry = Math.min(...sumIdx.map((i) => p[i])), wDry = Math.min(...winIdx.map((i) => p[i]));
  const sWet = Math.max(...sumIdx.map((i) => p[i])), wWet = Math.max(...winIdx.map((i) => p[i]));
  const season = sDry < 40 && sDry < wWet / 3 ? 's' : wDry < sWet / 10 ? 'w' : 'f';
  const warm = t.filter((x) => x >= 10).length;
  const sub = tMax >= 22 ? 'a' : warm >= 4 ? 'b' : tMin < -38 ? 'd' : 'c';
  return (tMin > -3 ? 'C' : 'D') + season + sub;
}

// where perihelion falls in a world's year: the sun's longitude in its sky then, from the northern spring
// equinox (as universe.js solarLongitude reckons the year: N the equinox, axis x the orbit's normal; M a
// quarter on), the sun seen against the periapsis (-P); axis its spin axis, orbit the one round its star
function periLongitude(axis, orbit) {
  const W = orbit.W, P = orbit.P;
  let nx = axis[1] * W[2] - axis[2] * W[1], ny = axis[2] * W[0] - axis[0] * W[2], nz = axis[0] * W[1] - axis[1] * W[0];
  const l = Math.sqrt(nx * nx + ny * ny + nz * nz);
  if (l < 1e-9) return 0;
  nx /= l; ny /= l; nz /= l;
  const mx = W[1] * nz - W[2] * ny, my = W[2] * nx - W[0] * nz, mz = W[0] * ny - W[1] * nx;
  return dm.atan2(-(P[0] * mx + P[1] * my + P[2] * mz), -(P[0] * nx + P[1] * ny + P[2] * nz));
}

// the climate's inputs from the body and its star (a moon's year is its planet's: its eccentricity and
// perihelion that orbit's, and its seasons its spin axis against that orbit's plane, not its own round
// the planet's)
export function climateOpts(body, star, host) {
  const cl = body.terrain.climate, r = body.rotation;
  const yr = body.kind === 'moon' && host ? host : body, W = yr !== body && yr.orbit && yr.orbit.W;
  const obl = W && r.axis ? dm.acos(dm.clamp(r.axis[0] * W[0] + r.axis[1] * W[1] + r.axis[2] * W[2], -1, 1)) : r.obliquity;
  return {
    // (a moon: less its time in its planet's shadow)
    S: body.insolation * (1 - (body.eclipse || 0)), obliquity: obl,
    ecc: yr.orbitE || 0, perihelion: yr.orbit && yr.orbit.P && r.axis ? periLongitude(r.axis, yr.orbit) : 0,
    // (a moon locked to its planet still sees its star rise and set: its day is its orbit)
    locked: !!cl.locked && body.kind !== 'moon', substellar: cl.substellar, rotH: r.locked ? (body.kind === 'moon' && host && body.orbit && body.orbit.aReal ? 2 * Math.PI * Math.sqrt(body.orbit.aReal ** 3 / (6.674e-11 * host.massEarth * 5.972e24)) / 3600 : 1e4) : Math.abs(r.periodRealH || 24), retro: !!r.retrograde, hadley: cl.hadley,
    pressure: body.atmosphere ? body.atmosphere.pressure : 0, Tmean: body.Tsurf, albedo: body.albedo, lapse: cl.lapse,
    yearDays: 365.25 * Math.sqrt(body.aAU * body.aAU * body.aAU / star.mass),
  };
}
// run it on heights from another grid (seaSrc: which source cells are sea, else below sea level)
export function climateOn(Gc, Gsrc, hsrc, o, seaSrc, veg) {
  const hc = new Float64Array(Gc.n), d = [0, 0, 0], uv = { face: 0, u: 0, v: 0 };
  const sea = seaSrc ? new Uint8Array(Gc.n) : null;
  for (let c = 0; c < Gc.n; c++) {
    d[0] = Gc.dir[c * 3]; d[1] = Gc.dir[c * 3 + 1]; d[2] = Gc.dir[c * 3 + 2]; hc[c] = Gsrc.sample(hsrc, d, uv);
    if (sea) sea[c] = seaSrc[Gsrc.cellAt(d[0], d[1], d[2])];
  }
  const out = climate(Gc, { ...o, h: hc, sea, cover: veg ? veg.cover : null, forest: veg ? veg.forest : null });
  out.h = hc;
  return out;
}

// the broad biome of a Köppen class
export function biomeOfKoppen(k) {
  if (k === 'sea') return 'sea';
  if (k === 'EF') return 'ice';
  if (k === 'ET') return 'tundra';
  if (k.startsWith('BW')) return 'desert';
  if (k.startsWith('BS')) return 'steppe';
  if (k === 'Af' || k === 'Am') return 'rainforest';
  if (k === 'Aw') return 'savanna';
  if (k[0] === 'C') return k[1] === 's' ? 'mediterranean' : 'temperate forest';
  if (k[0] === 'D') return k[2] === 'c' || k[2] === 'd' ? 'boreal forest' : 'continental forest';
  return 'other';
}
