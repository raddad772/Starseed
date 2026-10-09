// What's in the air besides its gas (WORLDSIM.md 19): each kind of aerosol simulated from its source to
// its sink, its particles' sizes from that, and their optics from what they're made of. One way for every
// world, the sky's colour arising from it, not set per kind of world (Dave: "we want this to arise from
// proper simulation"). The world's mean state; the weather's own dust on top of it (sim/dust.js).
//
//   tholin haze  the star's far UV breaking up methane high in the air (where it's taken: one optical depth
//                of methane down), a share of the carbon joining into haze, less as CO2 and oxygen take the
//                carbon's place (Trainer et al. 2006: the haze fails below CH4/CO2 ~0.1); its specks
//                (~0.05 um) sticking into fractal aggregates (dimension 2) as they fall, coagulating by
//                their Brownian motion, falling by Stokes' law with the slip a thin air gives (Cunningham),
//                stirred down by the air's eddies; their optics by Rayleigh-Debye-Gans for fractal
//                aggregates (Sorensen 2001), tholin's refractive index (Khare et al. 1984). Titan: ~3000
//                specks to an aggregate at the ground (Tomasko et al. 2008)
//   mineral dust the wind lifting sand into saltation past its threshold (Shao and Lu 2000: grain size, the
//                air's density, gravity, cohesion), the hopping sand blasting dust out of the soil
//                (White 1979; Marticorena and Bergametti 1995: more from a finer soil), in the size
//                spread brittle soil breaks into (Kok 2011); each size up for as long as it takes to
//                settle out of the mixed air or be rained out: the coarse fall within hours, the fine stay
//                weeks (in a thin air longer: the slip). Its absorption from the ground's own colour
//                (Hapke's reflectance of a powder inverted: a red ground's dust takes the blue)
//   sea salt     the wind's whitecaps over a sea of water (Gong 2003), swollen with water in the damp air
//   sulfate      SO2 oxidised to sulfuric-acid droplets (and a flood-basalt eruption's under way)
//   soot         an impact winter's
// Their optics by Mie theory (spheres: Bohren and Huffman) over their sizes, at the render's three
// wavelengths, the phase function fitted for the shader as a broad lobe and a forward one per colour
// (render/atmosphere.js phaseMie): coarse dust that takes the blue scatters what blue it keeps into its
// narrow forward peak (its diffraction, which absorption can't take), so round a Martian sun the sky is
// blue and the rest butterscotch (Lemmon et al. 2015).
import * as dm from '../../core/dmath.js';
import * as U from '../../core/units.js';

export const LAMBDA = [680e-9, 550e-9, 440e-9];   // the render's channels (m)
const KB = U.K_B, AMU = U.AMU;

// the angles the phase functions are sampled at (deg): fine near the forward peak
const THETA = [0, 0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180];
const NA = THETA.length;
const MU = Float64Array.from(THETA, (d) => dm.cos(d * dm.PI / 180));
// (trapezoid weights in cos: the integral over the sphere of f is 2 pi sum w f)
const WMU = (() => {
  const w = new Float64Array(NA);
  for (let j = 0; j < NA - 1; j++) { const d = (MU[j] - MU[j + 1]) * 0.5; w[j] += d; w[j + 1] += d; }
  return w;
})();

// ---- the air
// viscosity (Pa s) of the gases (Sutherland: eta0 at 273 K, its constant S)
const VISC = { N2: [1.663e-5, 107], CO2: [1.37e-5, 240], H2: [8.4e-6, 72], O2: [1.919e-5, 139], CH4: [1.03e-5, 198], Ar: [2.125e-5, 144], He: [1.87e-5, 79], H2O: [0.9e-5, 1064], NH3: [0.98e-5, 370], SO2: [1.17e-5, 416], CO: [1.66e-5, 136] };
function viscosity(comp, T) {
  let s = 0, w = 0;
  for (const k in comp) {
    const v = VISC[k] || VISC.N2, x = comp[k];
    s += x * v[0] * dm.pow(T / 273, 1.5) * (273 + v[1]) / (T + v[1]); w += x;
  }
  return w > 0 ? s / w : 1.7e-5;
}
function airOf(P, T, mu, g, comp) {
  const m = mu * AMU, eta = viscosity(comp, T);
  return { P, T, mu, g, m, eta, rho: P * m / (KB * T), H: KB * T / (m * g), comp };
}
// mean free path of the air's molecules at pressure p (m)
const mfp = (air, p) => air.eta / p * dm.sqrt(dm.PI * KB * air.T / (2 * air.m));
// Cunningham's slip: a particle of radius r falls and diffuses faster where the gas's molecules are far apart
const slip = (Kn) => 1 + Kn * (1.257 + 0.4 * dm.exp(-1.1 / Kn));
// a sphere's settling speed (m/s): radius r, density rhoP, at pressure p
function settle(air, r, rhoP, p = air.P) {
  return 2 * rhoP * air.g * r * r * slip(mfp(air, p) / r) / (9 * air.eta);
}
// the air's eddies: mixing (m^2/s) through the lower air, stirred by the sun's heat on the ground
const K_MIX = 50, K_DEEP = 2;
// dry deposition at the ground beyond settling: the turbulence carrying particles into the surface (m/s);
// over a sea more, its breaking waves and the swelling of salt by the damp air at the surface (Slinn and
// Slinn 1980)
const V_TURB = 1e-3, V_TURB_SEA = 5e-3;

// the belt's mean wind at ~10 m (m/s): the power the air carries from the sunlit ground to space,
// a share of which goes into its winds, dissipated against the ground (rho C_D U^3): the absorbed
// sunlight, the share of it the air carries (its infrared depth tau: a thin air lets the ground radiate
// straight to space, a Mars's air carrying a sixth of what an Earth's does), against its density.
// Earth's 7 m/s (sim/wind.js windBase)
const CHI_E = 1 - Math.exp(-0.84);
export function beltWind(P_bar, mu, T, tauIR, sunE = 1) {
  if (!(P_bar > 0)) return 0;
  const rho = P_bar * 1e5 * (mu / 1000) / (8.314 * Math.max(T, 30));
  const chi = 1 - dm.exp(-Math.max(0, tauIR || 0));
  const u = 7 * dm.cbrt(Math.max(sunE, 1e-4) * Math.max(chi / CHI_E, 0.02) * 1.2 / Math.max(rho, 1e-3));
  return Math.min(25, Math.max(0.3, u));
}

// ---- complex refractive indices at LAMBDA (n, k)
export const INDEX = {
  tholin:   [[1.65, 0.008], [1.67, 0.025], [1.69, 0.06]],    // Khare et al. 1984
  sulfate:  [[1.43, 1e-8], [1.43, 1e-8], [1.44, 1e-8]],       // ~75% sulfuric acid
  seasalt:  [[1.38, 2e-8], [1.38, 2e-8], [1.385, 3e-8]],      // swollen at ~80% humidity
  soot:     [[1.75, 0.43], [1.75, 0.44], [1.75, 0.45]],
  organic:  [[1.45, 0.001], [1.45, 0.002], [1.45, 0.005]],  // secondary organic (a little brown carbon)
};
// a dust's index from the ground it comes off: its reflectance (linear RGB) inverted through Hapke's
// equivalent-slab model of a powder (its single-scattering albedo, then the light's way through a grain:
// absorbed, and scattered inside it by its own flaws, s, which lengthens a weakly absorbed colour's way):
// grains ~3.5 um, s 6e4 /m, fitted to Mars' dust (its bright regions' reflectance against its measured
// index, Wolff et al. 2009: k 0.0098, 0.0038, 0.0012 at 440, 550, 670 nm; this gives 0.0088, 0.0041,
// 0.0012). A reddish ground's dust takes the blue, a grey one's little of anything
export function dustIndex(rgb, n = 1.55) {
  const Se = ((n - 1) * (n - 1)) / ((n + 1) * (n + 1)) + 0.05, Si = 1.014 - 4 / (n * (n + 1) * (n + 1)), D = 3.5e-6, sIn = 6e4;
  return [0, 1, 2].map((c) => {
    const r = dm.clamp(rgb[c], 0.005, 0.9), gam = (1 - r) / (1 + r), w = 1 - gam * gam;
    const th = dm.clamp((w - Se) / ((1 - Se) * (1 - Si) + Si * (w - Se)), 1e-4, 0.9999);
    // (sqrt(alpha (alpha + s)) D = -ln theta)
    const X = -dm.log(th) / D, alpha = (-sIn + dm.sqrt(sIn * sIn + 4 * X * X)) / 2;
    return [n, Math.max(1e-5, alpha * LAMBDA[c] / (4 * dm.PI))];
  });
}

// ---- Mie theory for a sphere (Bohren and Huffman's BHMIE): size parameter x, index n + ik. Returns
// [Qext, Qsca, g] and fills s11 with (|S1|^2 + |S2|^2)/2 at the angles MU
const _Dr = new Float64Array(2400), _Di = new Float64Array(2400);
const _pi0 = new Float64Array(NA), _pi1 = new Float64Array(NA);
const _s1r = new Float64Array(NA), _s1i = new Float64Array(NA), _s2r = new Float64Array(NA), _s2i = new Float64Array(NA);
export function mie(x, n, k, s11) {
  const nstop = Math.floor(x + 4 * dm.cbrt(x) + 2);
  const yr = n * x, yi = k * x, ymod = dm.sqrt(yr * yr + yi * yi);
  const nmx = Math.min(2399, Math.max(nstop, Math.ceil(ymod)) + 15);
  const iy2 = 1 / (yr * yr + yi * yi);
  _Dr[nmx] = 0; _Di[nmx] = 0;
  for (let j = nmx; j >= 1; j--) {
    const nyr = j * yr * iy2, nyi = -j * yi * iy2;
    const ar = _Dr[j] + nyr, ai = _Di[j] + nyi, ia = 1 / (ar * ar + ai * ai);
    _Dr[j - 1] = nyr - ar * ia; _Di[j - 1] = nyi + ai * ia;
  }
  for (let j = 0; j < NA; j++) { _pi0[j] = 0; _pi1[j] = 1; _s1r[j] = 0; _s1i[j] = 0; _s2r[j] = 0; _s2i[j] = 0; }
  let psi0 = dm.cos(x), psi1 = dm.sin(x), chi0 = -dm.sin(x), chi1 = dm.cos(x);
  let xi1r = psi1, xi1i = -chi1;
  let qsca = 0, gsca = 0, an1r = 0, an1i = 0, bn1r = 0, bn1i = 0;
  // 1/m
  const im2 = 1 / (n * n + k * k), mir = n * im2, mii = -k * im2;
  for (let e = 1; e <= nstop; e++) {
    const fn = (2 * e + 1) / (e * (e + 1));
    const psi = (2 * e - 1) * psi1 / x - psi0, chi = (2 * e - 1) * chi1 / x - chi0;
    const xir = psi, xii = -chi;
    const Dr = _Dr[e], Di = _Di[e];
    // a: (D/m + n/x)
    let Ar = Dr * mir - Di * mii + e / x, Ai = Dr * mii + Di * mir;
    // an = (A psi - psi1) / (A xi - xi1)
    let nr = Ar * psi - psi1, ni = Ai * psi;
    let dr = Ar * xir - Ai * xii - xi1r, di = Ar * xii + Ai * xir - xi1i;
    let id = 1 / (dr * dr + di * di);
    const anr = (nr * dr + ni * di) * id, ani = (ni * dr - nr * di) * id;
    // b: (m D + n/x)
    Ar = n * Dr - k * Di + e / x; Ai = n * Di + k * Dr;
    nr = Ar * psi - psi1; ni = Ai * psi;
    dr = Ar * xir - Ai * xii - xi1r; di = Ar * xii + Ai * xir - xi1i;
    id = 1 / (dr * dr + di * di);
    const bnr = (nr * dr + ni * di) * id, bni = (ni * dr - nr * di) * id;
    qsca += (2 * e + 1) * (anr * anr + ani * ani + bnr * bnr + bni * bni);
    gsca += fn * (anr * bnr + ani * bni);
    if (e > 1) gsca += ((e - 1) * (e + 1) / e) * (an1r * anr + an1i * ani + bn1r * bnr + bn1i * bni);
    for (let j = 0; j < NA; j++) {
      const p = _pi1[j], t = e * MU[j] * p - (e + 1) * _pi0[j];
      _s1r[j] += fn * (anr * p + bnr * t); _s1i[j] += fn * (ani * p + bni * t);
      _s2r[j] += fn * (anr * t + bnr * p); _s2i[j] += fn * (ani * t + bni * p);
      const pn = ((2 * e + 1) * MU[j] * p - (e + 1) * _pi0[j]) / e;
      _pi0[j] = p; _pi1[j] = pn;
    }
    psi0 = psi1; psi1 = psi; chi0 = chi1; chi1 = chi; xi1r = psi1; xi1i = -chi1;
    an1r = anr; an1i = ani; bn1r = bnr; bn1i = bni;
  }
  const x2 = x * x;
  qsca *= 2 / x2;
  const g = qsca > 0 ? (4 / x2) * gsca / qsca : 0;
  const qext = (4 / x2) * _s1r[0];
  for (let j = 0; j < NA; j++) s11[j] = 0.5 * (_s1r[j] * _s1r[j] + _s1i[j] * _s1i[j] + _s2r[j] * _s2r[j] + _s2i[j] * _s2i[j]);
  return [qext, qsca, g];
}

// a population's optics: per channel the extinction and scattering optical depths and the scattering's
// angular spread (dsig: sum of number x dsigma/dOmega at the angles, m^2/sr per m^2 of ground)
function newOptics() { return { ext: [0, 0, 0], sca: [0, 0, 0], ph: [new Float64Array(NA), new Float64Array(NA), new Float64Array(NA)] }; }
const _s11 = new Float64Array(NA);
// spheres of radius r, nCol of them over a m^2 of ground
function addSpheres(o, r, nCol, idx) {
  for (let c = 0; c < 3; c++) {
    const kw = 2 * dm.PI / LAMBDA[c], x = kw * r, [n, k] = idx[c];
    const [qe, qs] = mie(x, n, k, _s11);
    const area = dm.PI * r * r * nCol;
    o.ext[c] += qe * area; o.sca[c] += qs * area;
    const f = nCol / (kw * kw), ph = o.ph[c];
    for (let j = 0; j < NA; j++) ph[j] += _s11[j] * f;
  }
}
// fractal aggregates (Rayleigh-Debye-Gans: Sorensen 2001) of N specks of radius rm, dimension Df,
// prefactor kf; nCol of them over a m^2
function addAggregates(o, rm, N, nCol, idx, Df = 2, kf = 1.6) {
  const Rg = rm * dm.pow(N / kf, 1 / Df);
  for (let c = 0; c < 3; c++) {
    const kw = 2 * dm.PI / LAMBDA[c], [n, k] = idx[c];
    // (m^2 - 1)/(m^2 + 2)
    const m2r = n * n - k * k, m2i = 2 * n * k;
    const ar = m2r - 1, ai = m2i, br = m2r + 2, bi = m2i, ib = 1 / (br * br + bi * bi);
    const qr = (ar * br + ai * bi) * ib, qi = (ai * br - ar * bi) * ib;
    const F = qr * qr + qi * qi, E = qi;
    const sAbs = N * 4 * dm.PI * kw * rm * rm * rm * E;
    const a0 = N * N * kw * kw * kw * kw * rm * rm * rm * rm * rm * rm * F;
    let sSca = 0;
    const ph = o.ph[c];
    for (let j = 0; j < NA; j++) {
      const s2 = (1 - MU[j]) * 0.5, qRg2 = 4 * kw * kw * s2 * Rg * Rg;   // (q Rg)^2, q = 2 k sin(theta/2)
      const S = dm.pow(1 + 2 * qRg2 / (3 * Df), -Df / 2);
      const d = a0 * S * (1 + MU[j] * MU[j]) * 0.5;
      ph[j] += d * nCol;
      sSca += 2 * dm.PI * WMU[j] * d;
    }
    o.sca[c] += sSca * nCol; o.ext[c] += (sSca + sAbs) * nCol;
  }
}

// ---- the haze of a methane air
// FUV photons (< ~200 nm: methane's own and those its products take for it) at 1 AU from the Sun
// (photons/m^2/s), scaled by the star's activity: Titan's ~1e14 methane broken a m^2 a second (Yung et al.
// 1984); a share of the carbon to the haze (lab yields, a few % to ~10%: Titan's ~2e-13 kg/m^2/s,
// McKay et al. 2001)
const FUV_1AU = 4e16, HAZE_YIELD = 0.08, CH2 = 14 * AMU;
// band-mean FUV cross sections (m^2): what else in the air takes the photons first
const SIG_FUV = { CH4: 1.5e-21, CO2: 5e-22, H2O: 7e-22, O2: 1e-21, NH3: 1e-21 };
function tholinHaze(air, X, uv, out) {
  const ch4 = X.CH4 || 0;
  if (!(ch4 > 1e-6)) return null;
  let tot = 0;
  for (const k in SIG_FUV) tot += SIG_FUV[k] * (X[k] || 0);
  const share = SIG_FUV.CH4 * ch4 / tot;
  // (the haze's chemistry: CO2 and oxygen hand their O to the carbon, CO instead of haze)
  const carbon = ch4 / (ch4 + 5 * (X.CO2 || 0) + 50 * (X.O2 || 0));
  const F = uv * share * HAZE_YIELD * carbon * CH2;   // kg/m^2/s
  if (!(F > 1e-20)) return null;
  // (where it forms: the depth of one optical depth of methane to the FUV)
  const pTop = Math.min(air.P * 0.5, air.m * air.g / (SIG_FUV.CH4 * ch4));
  // (falling from there to the ground: its specks sticking together, layer by layer)
  const rm = 0.05e-6, rhoP = 1300, mMono = 4 / 3 * dm.PI * rm * rm * rm * rhoP;
  const o = newOptics(), L = 160, lr = dm.log(air.P / pTop) / L;
  let N = 1, ext0 = 0;
  for (let i = 0; i < L; i++) {
    const p = pTop * dm.exp((i + 0.5) * lr), dz = air.H * lr;
    const lam = mfp(air, p), Rm = rm * dm.pow(N, 0.46), m = N * mMono;
    const C = slip(lam / Rm);
    const vs = m * air.g * C / (6 * dm.PI * air.eta * Rm);
    const w = vs + K_DEEP / air.H;
    const rho = F / w;   // haze kg/m^3
    // (coagulation: equal aggregates' Brownian kernel, continuum with slip and free-molecular, the harmonic mean)
    const Rc = rm * dm.pow(N / 1.6, 0.5) * 1.29;
    const Kc = 8 * KB * air.T * C / (3 * air.eta), Kfm = dm.PI * 4 * Rc * Rc * dm.sqrt(16 * KB * air.T / (dm.PI * m));
    const Kk = Kc * Kfm / (Kc + Kfm);
    const nA = rho / m;
    addAggregates(o, rm, N, nA * dz, INDEX.tholin);
    if (i === L - 1) {
      // (the extinction at the ground, per m: the profile's scale)
      const t = newOptics();
      addAggregates(t, rm, N, nA, INDEX.tholin);
      ext0 = t.ext[1];
    }
    N += Kk * rho * (dz / w) / (2 * mMono);
  }
  out.haze = { flux: F, N: Math.round(N), pTop };
  return { name: 'tholin', o, H: ext0 > 0 ? o.ext[1] / ext0 : air.H };
}

// ---- dust off dry ground
const RHO_DUST = 2600;
// the threshold friction velocity of a grain of diameter D (Shao and Lu 2000)
const uStarT = (air, D) => dm.sqrt(0.0123 * (RHO_DUST / air.rho * air.g * D + 3e-4 / (air.rho * D)));
// the emitted dust's volume over sizes (Kok 2011: brittle fragmentation), dV/dlnD at diameter D (m)
function erf(x) {
  const s = x < 0 ? -1 : 1, a = Math.abs(x), t = 1 / (1 + 0.3275911 * a);
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * dm.exp(-a * a);
  return s * y;
}
const kokV = (D) => D * (1 + erf(dm.log(D / 3.4e-6) / (Math.SQRT2 * dm.log(3)))) * dm.exp(-dm.pow(D / 12e-6, 3));
// the mean of f(u) over the wind's spread (Weibull, shape 2, about its mean Um)
function overWinds(Um, f) {
  const c = Um / 0.8862, n = 160, du = 6 * c / n;
  let s = 0;
  for (let i = 0; i < n; i++) { const u = (i + 0.5) * du, z = u / c; s += f(u) * 2 * z / c * dm.exp(-z * z) * du; }
  return s;
}
// (the wind's push on the ground's loose grains: over land the 10 m wind ~0.7 of the open sea's (the
// land's roughness), its friction velocity over rough ground (z0 ~1 mm: pebbles and scrub), and the share
// of that the bare sand between them feels (Marticorena and Bergametti 1995's drag partition, ~0.55); and
// of dry ground, the share that's loose fine sediment (sand seas, playas, alluvial plains: ~0.3))
const Z0_LAND = 1e-3, Z0_SAND = 1e-5, LAND_WIND = 0.7, ERODIBLE = 0.3;
const F_EFF = 1 - dm.log(Z0_LAND / Z0_SAND) / dm.log(0.35 * dm.pow(10 / Z0_SAND, 0.8));
const US_K = 0.4 / dm.log(10 / Z0_LAND) * F_EFF;
// (dust devils: the sun-warmed ground's convection, its vortices lifting dust where the wind can't (most of
// Mars' between its storms). The work of a convective heat engine (Renno et al. 1998): the sensible heat the
// ground gives the air times its efficiency (the boundary layer's depth over the air's scale height x R/cp),
// ALPHA_DD kg lifted per J (Newman et al. 2002; Kahre et al. 2006: fitted to Mars' background dust,
// ~0.5, with the dust's shading of the ground it's lifted from: aerosolsOf))
const ALPHA_DD = 1.44e-9, GAMMA_TH = 3e-3, C_H = 4e-3, SIGMA = 5.670374419e-8;
const CP_R = { N2: 3.5, O2: 3.5, H2: 3.5, CO: 3.5, CO2: 4.4, CH4: 4.3, H2O: 4.0, Ar: 2.5, He: 2.5, NH3: 4.3, SO2: 4.8 };
function cpOf(comp) {
  let s = 0, w = 0;
  for (const k in comp) { s += comp[k] * (CP_R[k] || 4); w += comp[k]; }
  return w > 0 ? s / w : 3.5;
}
function mineralDust(air, src, Um, Fsurf, day, fines, idx, tauWet, out) {
  if (!(src > 0)) return null;
  const { F, Fsalt, Fdd, ut, Fs, pbl, alpha } = dustFlux(air, src, Um, Fsurf, day, fines);
  out.dust = { saltation: Fsalt * src * ERODIBLE, devils: Fdd * src * ERODIBLE, ut, Um, Fs, pbl };
  // (the weather's: what a place lifts in a wind U per unit of loose ground, against the world's mean)
  out.dustEmit = { ut, rho: air.rho, g: air.g, alpha, Fdd, Fmean: Fsalt + Fdd };
  if (!(F > 1e-22)) return null;
  return dustAloft(air, F, idx, tauWet, out);
}
// what the world's dry ground lifts, kg/m^2/s over the globe (the saltation in its winds, the dust devils
// of the sun-warmed ground's convection): F, and its parts
function dustFlux(air, src, Um, Fsurf, day, fines) {
  // (the sand's threshold: the least over its sizes, ~100 um grains)
  let ut = 1e9;
  for (let D = 2e-5; D < 1e-3; D *= 1.1) ut = Math.min(ut, uStarT(air, D));
  // (the saltation flux (White 1979) over the land's winds)
  const Q = Um > 0 ? overWinds(Um * LAND_WIND, (u) => {
    const us = US_K * u;
    if (us <= ut) return 0;
    const r = ut / us;
    return 2.61 * air.rho / air.g * us * us * us * (1 - r) * (1 + r) * (1 + r);
  }) : 0;
  const alpha = dm.pow(10, 0.134 * Math.min(fines, 20) - 6);
  // (the dust devils: the ground's sensible heat, the day-mean share of its sunlight the air takes by
  // convection against what the ground radiates; the boundary layer the day's heating raises through the
  // air's stable layering)
  const cpR = cpOf(air.comp), cp = cpR * 8.314 / (air.mu / 1000);
  const hc = air.rho * cp * C_H * Math.max(0.5, Um * LAND_WIND), hr = 4 * SIGMA * air.T * air.T * air.T;
  const Fs = Fsurf * hc / (hc + hr);
  const pbl = Math.min(2 * air.H, dm.sqrt(2 * Fs * Math.max(day, 3600) / 2 / (air.rho * cp * GAMMA_TH)));
  const eta = pbl / (cpR * air.H);
  const Fdd = ALPHA_DD * eta * Fs;
  const Fsalt = alpha * Q;
  const F = (Fsalt + Fdd) * src * ERODIBLE;   // kg/m^2/s over the globe
  return { F, Fsalt, Fdd, ut, Fs, pbl, alpha };
}
// the dust aloft from a flux F: in sizes, each up for as long as it settles out of its mixed layer or is
// rained out (its optics and mass in proportion to F)
function dustAloft(air, F, idx, tauWet, out) {
  const bins = 28, lo = dm.log(0.1e-6), hi = dm.log(40e-6), dl = (hi - lo) / bins;
  let wsum = 0;
  const wts = [];
  for (let b = 0; b < bins; b++) { const w = kokV(dm.exp(lo + (b + 0.5) * dl)); wts.push(w); wsum += w; }
  const o = newOptics();
  let col = 0, ext0 = 0;
  for (let b = 0; b < bins; b++) {
    const D = dm.exp(lo + (b + 0.5) * dl), r = D / 2;
    const vs = settle(air, r, RHO_DUST);
    const H = 1 / (1 / air.H + vs / K_MIX);
    const life = 1 / ((vs + V_TURB) / H + (tauWet > 0 ? 1 / tauWet : 0));
    const M = F * wts[b] / wsum * life;
    const nCol = M / (4 / 3 * dm.PI * r * r * r * RHO_DUST);
    const e0 = o.ext[1];
    addSpheres(o, r, nCol, idx);
    ext0 += (o.ext[1] - e0) / H;
    col += M;
  }
  out.dust.column = col;
  return { name: 'dust', o, H: ext0 > 0 ? o.ext[1] / ext0 : air.H };
}

// what a place's loose ground lifts a second per m^2 in a 10 m wind U (sim/dust.js, by aerosols.js's
// dustEmit: the world's threshold, air and dust devils), as mineralDust
export function dustEmission(e, U) {
  const us = US_K * U * LAND_WIND;
  let Q = 0;
  if (us > e.ut) { const r = e.ut / us; Q = 2.61 * e.rho / e.g * us * us * us * (1 - r) * (1 + r) * (1 + r); }
  return e.alpha * Q + e.Fdd;
}

// dust a time age (s) after it was lifted: each size's share of the lifted still up (its lifetime's
// e-folding), over the sizes brittle soil breaks into
function agedDust(air, idx, tauWet, age) {
  const bins = 28, lo = dm.log(0.1e-6), hi = dm.log(40e-6), dl = (hi - lo) / bins, o = newOptics();
  for (let b = 0; b < bins; b++) {
    const D = dm.exp(lo + (b + 0.5) * dl), r = D / 2, vs = settle(air, r, RHO_DUST);
    const H = 1 / (1 / air.H + vs / K_MIX);
    const life = 1 / ((vs + V_TURB) / H + (tauWet > 0 ? 1 / tauWet : 0));
    const M = kokV(D) * life * dm.exp(-age / life);
    addSpheres(o, r, M / (4 / 3 * dm.PI * r * r * r * RHO_DUST), idx);
  }
  return o;
}

// ---- sea salt from whitecaps on a sea of water (Gong 2003: particles/m^2/s/um of radius at 80% humidity)
function seaSalt(air, seaFrac, Um, tauWet, out) {
  if (!(seaFrac > 0) || !(Um > 0)) return null;
  // (<U^3.41> over the wind's spread)
  const u341 = overWinds(Um, (u) => dm.pow(u, 3.41));
  const bins = 24, lo = dm.log(0.05), hi = dm.log(15), dl = (hi - lo) / bins;   // r80, um
  const o = newOptics();
  let ext0 = 0, col = 0;
  for (let b = 0; b < bins; b++) {
    const r = dm.exp(lo + (b + 0.5) * dl), dr = r * dl;
    const A = 4.7 * dm.pow(1 + 30 * r, -0.017 * dm.pow(r, -1.44)), B = (0.433 - dm.log10(r)) / 0.433;
    const dF = 1.373 * u341 * dm.pow(r, -A) * (1 + 0.057 * dm.pow(r, 3.45)) * dm.pow(10, 1.607 * dm.exp(-B * B));
    const flux = dF * dr * seaFrac;   // particles/m^2/s over the globe
    const rm = r * 1e-6, vs = settle(air, rm, 1200);
    const H = Math.min(1500 * 9.81 / air.g, 1 / (1 / air.H + vs / K_MIX));
    const life = 1 / ((vs + V_TURB_SEA) / H + (tauWet > 0 ? 1 / tauWet : 0));
    const nCol = flux * life;
    col += nCol * 4 / 3 * dm.PI * dm.pow(rm / 2, 3) * 2160;
    const e0 = o.ext[1];
    addSpheres(o, rm, nCol, INDEX.seasalt);
    ext0 += (o.ext[1] - e0) / H;
  }
  out.salt = { column: col, u341 };
  return { name: 'seasalt', o, H: ext0 > 0 ? o.ext[1] / ext0 : air.H };
}

// a lognormal population (number median radius rg, geometric spread sg) of total mass M (kg/m^2, its
// particles of density rho), Mie over its sizes
function lognormal(M, rg, sg, rho, idx) {
  const o = newOptics(), bins = 18, ls = dm.log(sg), lo = dm.log(rg) - 3 * ls, dl = 6 * ls / bins;
  let vol = 0;
  const w = [];
  for (let b = 0; b < bins; b++) {
    const lr = lo + (b + 0.5) * dl, z = (lr - dm.log(rg)) / ls, r = dm.exp(lr);
    const n = dm.exp(-0.5 * z * z); w.push(n); vol += n * 4 / 3 * dm.PI * r * r * r;
  }
  const N = M / (rho * vol);
  for (let b = 0; b < bins; b++) addSpheres(o, dm.exp(lo + (b + 0.5) * dl), N * w[b], idx);
  return o;
}

// ---- the shader's phase function per channel: (1 - f) Cornette-Shanks(g) + f Henyey-Greenstein(G), fitted
// to the computed one (log space, at the sampled angles, the forward ones weighing as much as the rest)
const cs = (m, g) => 3 / (8 * dm.PI) * (1 - g * g) * (1 + m * m) / ((2 + g * g) * dm.pow(Math.max(1 + g * g - 2 * g * m, 1e-9), 1.5));
const hg = (m, g) => (1 - g * g) / (4 * dm.PI * dm.pow(Math.max(1 + g * g - 2 * g * m, 1e-12), 1.5));
const GS = [0.8, 0.85, 0.88, 0.9, 0.92, 0.94, 0.95, 0.96, 0.97, 0.98, 0.985, 0.99];
// (the lobes at the sampled angles, once: g from -0.2 to 0.9 in steps of 0.025, and the forward lobe's GS)
const G_STEPS = 45, CS_T = [], HG_T = [];
for (let i = 0; i < G_STEPS; i++) { const g = -0.2 + i * 0.025; CS_T.push(Float64Array.from(MU, (m) => cs(m, g))); }
for (const G of GS) HG_T.push(Float64Array.from(MU, (m) => hg(m, G)));
export function fitPhase(ph) {
  // (normalised to 1 over the sphere)
  let s = 0;
  for (let j = 0; j < NA; j++) s += 2 * dm.PI * WMU[j] * ph[j];
  const P = Float64Array.from(ph, (v) => dm.log(Math.max(v / Math.max(s, 1e-300), 1e-12)));
  const err = (gi, fi, Gi) => {
    const a = CS_T[gi], h = HG_T[Gi], f = fi * 0.025;
    let e = 0;
    for (let j = 0; j < NA; j++) { const d = dm.log((1 - f) * a[j] + f * h[j]) - P[j]; e += d * d; }
    return e;
  };
  // (coarse, then about the best: g and f in 0.1s over every other forward lobe; then each in quarter steps)
  let best = [0, 0, 0], bErr = 1e30;
  for (let gi = 0; gi < G_STEPS; gi += 4) for (let Gi = 0; Gi < GS.length; Gi += 2) for (let fi = 0; fi <= 36; fi += 4) {
    const e = err(gi, fi, Gi);
    if (e < bErr) { bErr = e; best = [gi, fi, Gi]; }
  }
  const [g0, f0, G0] = best;
  for (let gi = Math.max(0, g0 - 2); gi <= Math.min(G_STEPS - 1, g0 + 2); gi++) for (let Gi = Math.max(0, G0 - 2); Gi <= Math.min(GS.length - 1, G0 + 2); Gi++) for (let fi = Math.max(0, f0 - 4); fi <= Math.min(38, f0 + 4); fi++) {
    const e = err(gi, fi, Gi);
    if (e < bErr) { bErr = e; best = [gi, fi, Gi]; }
  }
  return [-0.2 + best[0] * 0.025, best[1] * 0.025, GS[best[2]]];
}

// ---- the world's aerosols: inputs from bodies.js (the history's air, the star's light, the ground)
//   P bar, T K (surface), mu, g, comp (fractions), tauIR (the air's infrared depth), sunE (its sunlight,
//   Earth's 1), uv (the star's FUV relative to the Sun's now), albedo, seaFrac, liquid (the seas' main
//   liquid), regolithRGB (linear), regolithN, fines (%), so2 (bar), eruption, sootTau
// Out: { pops: [{ name, tau: [ext x3], ssa: [x3], H, fit: [[g, f, G] x3] }], render: { mie, mieAbs, mieH,
// mieG, mieF, mieGL }, dust: the dust's per-unit optics (setDust), diag }
const LATENT = { water: 2.45e6, methane: 5.1e5, ethane: 4.9e5, nitrogen: 2.0e5, ammonia: 1.37e6, 'ammonia-water': 2.0e6, CO2: 3.5e5 };
export function aerosolsOf(w) {
  const diag = {};
  const air = airOf(w.P * 1e5, Math.max(40, w.T), w.mu, w.g, w.comp);
  const X = w.comp || {};
  const pops = [];
  // tholin haze (the star's UV high in the air: independent of what reaches the ground)
  const uv = FUV_1AU * w.sunE * (w.uv || 1) / 4;
  const th = tholinHaze(air, X, uv, diag);
  if (th) pops.push(th);
  // (the sunlight reaching the ground: through an acid deck, and the haze above (two-stream: what it
  // takes, and what it scatters back up))
  let tSurf = w.deckT ?? 1;
  if (th) {
    const o = th.o, tA = o.ext[1] - o.sca[1];
    tSurf *= dm.exp(-1.66 * tA) / (1 + 0.75 * o.sca[1] * 0.3);
  }
  const Um = beltWind(w.P, w.mu, w.T, w.tauIR, w.sunE * tSurf);
  const Fsurf = 340 * w.sunE * (1 - (w.albedo || 0.3)) * tSurf;
  // (the rain: the energy the sun gives evaporating the seas, a third of an Earth's absorbed sunlight;
  // aerosols rained out in ~a week at an Earth's rate, the land dry where it rains little)
  const rain = w.liquid && w.seaFrac > 0 ? 0.33 * Fsurf / (LATENT[w.liquid] || 1e6) : 0;
  const tauWet = rain > 0 ? 7 * 86400 * 3.2e-5 / rain : 0;
  const arid = rain > 0 ? dm.exp(-rain / 2.3e-5) : 1;
  diag.wind = Um; diag.rain = rain; diag.arid = arid; diag.tSurf = tSurf;
  // mineral dust: dry bare land
  const land = 1 - (w.seaFrac || 0);
  const dIdx = dustIndex(w.regolithRGB || [0.3, 0.25, 0.2], w.regolithN || 1.55);
  const du = mineralDust(air, land * arid, Um, Fsurf, w.day || 86400, w.fines ?? 15, dIdx, tauWet, diag);
  if (du) {
    // (the dust shades the ground that lifts it: what its column takes of the sunlight and scatters
    // back (two-stream, as the haze's above) the ground's convection and the winds don't get, so less is
    // lifted; the two settled together, as Mars' global storms end, at optical depths of a few. Its
    // optics and mass go as the flux)
    const lift = (k) => dustFlux(air, land * arid, beltWind(w.P, w.mu, w.T, w.tauIR, w.sunE * tSurf * k), Fsurf * k, w.day || 86400, w.fines ?? 15);
    const F0 = lift(1).F, tau0 = du.o.ext[1], ssa = du.o.sca[1] / Math.max(tau0, 1e-30);
    let k = 1, r = 1;
    for (let i = 0; i < 40; i++) {
      const tau = tau0 * r, kk = dm.exp(-1.66 * tau * (1 - ssa)) / (1 + 0.75 * tau * ssa * 0.3);
      k = dm.sqrt(k * kk); r = lift(k).F / F0;
    }
    for (let c = 0; c < 3; c++) { du.o.ext[c] *= r; du.o.sca[c] *= r; const ph = du.o.ph[c]; for (let a = 0; a < ph.length; a++) ph[a] *= r; }
    diag.dust.column *= r; diag.dust.shade = k;
    const e = lift(k); diag.dustEmit.Fdd = e.Fdd; diag.dustEmit.Fmean = e.Fsalt + e.Fdd;
    pops.push(du);
  }
  // sea salt
  if (w.liquid === 'water' && w.seaFrac > 0) { const ss = seaSalt(air, w.seaFrac, Um, tauWet, diag); if (ss) pops.push(ss); }
  // sulfate: SO2 oxidised (a week where there's water and its OH), a flood-basalt eruption's on top;
  // rained out where it rains, otherwise a stratospheric year
  {
    const colSO2 = (w.so2 || 0) * 1e5 / w.g * (64 / w.mu);
    const tauOx = rain > 0 ? 7 * 86400 : 3e7;
    let prod = 0.5 * colSO2 / tauOx * (98 / 64) * 1.7;
    if (w.eruption) prod += 3e10 / 3.156e7 / (4 * dm.PI * w.Rm * w.Rm) * (98 / 64) * 1.7;
    const life = 1 / ((tauWet > 0 ? 1 / Math.min(tauWet, 30 * 86400) : 0) + 1 / 3.156e7);
    // (no more than the air's water makes: each droplet's acid is SO3 + H2O, and it holds water besides,
    // ~75% acid by mass: ~0.39 kg of water a kg of droplets. Where the water's gone the sulfur stays a gas)
    const colH2O = (w.h2o || 0) * 1e5 / w.g * (18 / w.mu);
    const M = Math.min(prod * life, colH2O / 0.39);
    if (M > 1e-9 && !w.acidDeck) {
      const o = lognormal(M, 0.07e-6, 2.0, 1700, INDEX.sulfate);
      pops.push({ name: 'sulfate', o, H: Math.min(air.H, 6000 * 9.81 / w.g) });
      diag.sulfate = { column: M };
    }
  }
  // life's own haze: plants' terpenes oxidised into fine organic droplets (Guenther et al. 1995: ~1 Pg C a
  // year off an Earth's land plants, doubling every ~8 K warmer; ~5% condensing), the blue of a forest's
  // distance; and the sea's algae's DMS into sulfate (~25 Tg S a year: Lana et al. 2011; eukaryotic
  // plankton's, cyanobacteria making little)
  {
    // (the land's cover and its trees by the plants' stage: bare, crusts, ground cover, shrubs, forests)
    const fs = Number.isFinite(w.floraStage) ? Math.min(4, Math.max(-1, w.floraStage)) : -1;
    const veg = fs >= 0 ? [0, 0.1, 0.3, 0.5, 0.6][fs] : 0, trees = fs >= 0 ? [0, 0.2, 0.5, 1, 1][fs] : 0;
    const Fsoa = 3.2e-10 * dm.exp(0.09 * (w.T - 288)) * 0.05 * veg * trees * land;
    const lifeWet = 1 / ((tauWet > 0 ? 1 / tauWet : 0) + V_TURB / 2000 + 1 / 3e6);
    if (Fsoa > 1e-16) {
      const M = Fsoa * lifeWet;
      pops.push({ name: 'organic', o: lognormal(M, 0.06e-6, 1.8, 1300, INDEX.organic), H: Math.min(air.H, 2500 * 9.81 / w.g) });
      diag.organic = { column: M };
    }
    const algae = (w.lifeStage ?? 0) >= 4 ? 1 : (w.lifeStage ?? 0) >= 2 ? 0.1 : 0;
    const Fdms = w.liquid === 'water' ? 2.2e-12 * (98 / 32) * 1.7 * 0.7 * algae * (w.seaFrac || 0) : 0;
    if (Fdms > 1e-16) {
      const M = Fdms * lifeWet;
      pops.push({ name: 'sulfate (sea life)', o: lognormal(M, 0.07e-6, 2.0, 1700, INDEX.sulfate), H: Math.min(air.H, 2000 * 9.81 / w.g) });
      diag.dms = { column: M };
    }
  }
  // soot: an impact winter's (its optical depth from the impact)
  if (w.sootTau > 0.05) {
    const o = lognormal(1, 0.0118e-6, 2.0, 1800, INDEX.soot), k = w.sootTau / o.ext[1];
    for (let c = 0; c < 3; c++) { o.ext[c] *= k; o.sca[c] *= k; for (let j = 0; j < NA; j++) o.ph[c][j] *= k; }
    pops.push({ name: 'soot', o, H: 15000 * 9.81 / w.g });
  }
  // summed for the render: each channel's scattering and absorption at the ground (each population's
  // profile its own scale height; the sum's scale height keeping the column), its phase fitted
  const mie = [0, 0, 0], mieAbs = [0, 0, 0], ph = [new Float64Array(NA), new Float64Array(NA), new Float64Array(NA)];
  let col = 0, surf = 0;
  const out = [];
  for (const p of pops) {
    const { o, H } = p;
    for (let c = 0; c < 3; c++) {
      mie[c] += o.sca[c] / H; mieAbs[c] += (o.ext[c] - o.sca[c]) / H;
      for (let j = 0; j < NA; j++) ph[c][j] += o.ph[c][j];
    }
    col += o.ext[1]; surf += o.ext[1] / H;
    out.push({ name: p.name, tau: o.ext.slice(), ssa: o.ext.map((e, c) => e > 0 ? o.sca[c] / e : 1), H });
  }
  const H = surf > 0 ? col / surf : air.H;
  const fits = ph.map((a, c) => (out.length ? fitPhase(a) : [0.7, 0.15, 0.96]));
  // (the weather's own dust and spray on top (sim/dust.js, render/atmosphere.js setDust): their optics per
  // unit of optical depth at 550 nm. The dust carried from its sources hundreds of km upwind, a day or so
  // on the wind: the coarse settled out of it, so finer than the ground's own column (its extinction
  // falling with wavelength: a windy day's low sun pinker))
  const unit = (o) => ({ ext: o.ext.map((e) => e / o.ext[1]), ssa: o.ext.map((e, c) => e > 0 ? o.sca[c] / e : 1), fit: o.ph.map((a) => fitPhase(a)) });
  const dust = unit(agedDust(air, dIdx, tauWet, 86400));
  // (the world's mean dust and spray in the sum, which the weather's own take the place of where the
  // camera is (render/atmosphere.js setDust))
  const part = (p) => p ? { sca: p.o.sca.map((x) => x / p.H), abs: p.o.ext.map((x, c) => (x - p.o.sca[c]) / p.H), tau: p.o.ext[1], H: p.H } : null;
  const dustPart = part(du), saltPart = part(pops.find((p) => p.name === 'seasalt'));
  const emit = { dust: diag.dustEmit || null, dustTau: du ? du.o.ext[1] : 0, saltTau: saltPart ? saltPart.tau : 0, u341: diag.salt ? diag.salt.u341 : 0, seaFrac: w.seaFrac || 0 };
  const saltPop = pops.find((p) => p.name === 'seasalt');
  const salt = unit(saltPop ? saltPop.o : lognormal(1e-4, 0.3e-6, 2.0, 1200, INDEX.seasalt));
  return {
    pops: out, diag, wind: Um, tSurf,
    render: { mie, mieAbs, mieH: H, mieG: fits.map((f) => f[0]), mieF: fits.map((f) => f[1]), mieGL: fits.map((f) => f[2]) },
    dust, salt, dustPart, saltPart, emit, angstrom: col > 0 ? dm.log(Math.max(1e-12, pops.reduce((s, p) => s + p.o.ext[2], 0)) / Math.max(1e-12, pops.reduce((s, p) => s + p.o.ext[0], 0))) / dm.log(680 / 440) : 1,
  };
}
