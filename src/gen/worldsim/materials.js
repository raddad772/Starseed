// Every substance a world is made of, in one table (WORLDSIM.md 16b): rocks,
// sediments, sands, ices, liquids, biological ones. The sim's processes, the
// renderer (one pipeline, no world-type buckets: item 19) and later the player's
// diving read the same properties:
//
//   phase      triple point (Tt K, Pt bar), critical temperature (Tc), normal boiling or
//              sublimation point (Tb) and heat of vaporisation (L kJ/mol): vapour pressure
//   bulk       density (kg/m^3: buoyancy, pressure at depth), viscosity (Pa s at Tref,
//              rising as exp(B (1/T - 1/Tref)) as it cools: basalt runs, rhyolite barely),
//              heat capacity (J/kg/K)
//   optics     colour (solids), deep and shallow colours (liquids: what light they
//              absorb), refractive index n (how much the surface reflects:
//              ((n-1)/(n+1))^2 straight on, more at grazing angles), roughness
//   glow       nothing special: anything hot glows as a blackbody (emissivity ~0.9)
//   chemistry  tags: acid, oxidiser, reducer, carbonate (dissolves in acid), salt
//              (dissolves in water), fuel (burns where there's oxygen)
//   solids     erodibility (x the rivers' K), the angle it stands at (cliffs); what a river
//              running over it carries and builds its banks of: its bed's median grain (D50, m)
//              and the silt and clay in its banks (fines, %), typical of what each weathers to
//              (granite to grus, coarse sand and fine gravel; sandstone back to its own sand;
//              shale and a playa's salt to mud; limestone and basalt to clay soils over a bed of
//              their own gravel; chalk to silt over flint gravel)
//
// Reactions between them (REACTIONS) are rules the processes apply as rates at the
// planet's coarse scale; the local detail may one day run them cell by cell.

import * as dm from '../../core/dmath.js';

export const MATERIALS = {
  // ---- rocks (lithology.js's layers)
  granite:   { kind: 'rock', rho: 2700, cp: 790, n: 1.55, color: '#8f8580', k: 0.45, stand: 70, grain: 2e-3, fines: 10 },
  basalt:    { kind: 'rock', rho: 2950, cp: 840, n: 1.6, color: '#3e3c3a', k: 0.6, stand: 75, grain: 1e-2, fines: 45 },
  andesite:  { kind: 'rock', rho: 2750, cp: 820, n: 1.57, color: '#6b6560', k: 0.65, stand: 70, grain: 8e-3, fines: 35 },
  sandstone: { kind: 'rock', rho: 2300, cp: 800, n: 1.54, color: '#b9875a', k: 1.0, stand: 60, grain: 2.5e-4, fines: 10 },
  shale:     { kind: 'rock', rho: 2400, cp: 800, n: 1.54, color: '#5f6457', k: 2.0, stand: 30, grain: 6e-5, fines: 80 },
  limestone: { kind: 'rock', rho: 2600, cp: 840, n: 1.6, color: '#bdb7a6', k: 0.8, stand: 65, grain: 1e-2, fines: 50, tags: ['carbonate'] },
  chalk:     { kind: 'rock', rho: 2000, cp: 840, n: 1.6, color: '#e9e6dc', k: 1.4, stand: 55, grain: 5e-3, fines: 60, tags: ['carbonate'] },
  alluvium:  { kind: 'sediment', rho: 1900, cp: 800, n: 1.54, color: '#7c6a52', k: 3.0, stand: 25, grain: 1e-3, fines: 25 },
  salt:      { kind: 'rock', rho: 2170, cp: 880, n: 1.54, color: '#e8dfd8', k: 4.0, stand: 35, grain: 3e-5, fines: 70, tags: ['salt'] },
  regolith:  { kind: 'sediment', rho: 1800, cp: 750, n: 1.6, color: '#77746e', k: 2.2, stand: 30, grain: 1e-3, fines: 15 },
  ice:       { kind: 'ice', rho: 917, cp: 2100, n: 1.31, color: '#e4eef5', k: 1.2, stand: 40, grain: 5e-3, fines: 10 },
  'quartz sand': { kind: 'sediment', rho: 1600, cp: 800, n: 1.54, color: '#d9c08a', k: 3.0, stand: 20, grain: 2.5e-4, fines: 2 },
  'coral sand':  { kind: 'sediment', rho: 1500, cp: 840, n: 1.6, color: '#f2ece0', k: 3.0, stand: 20, grain: 5e-4, fines: 2, tags: ['carbonate'] },
  'black sand':  { kind: 'sediment', rho: 1700, cp: 840, n: 1.6, color: '#2b2a2a', k: 3.0, stand: 20, grain: 3e-4, fines: 3 },
  // ---- liquids (liquids.js: what pools on the surface)
  water:     { kind: 'liquid', Tt: 273.16, Pt: 0.006, Tc: 647, Tb: 373.15, L: 40.7, rho: 1000, cp: 4186, mu: 1.0e-3, Tref: 293, B: 1800, n: 1.333, deep: '#0b2a4a', shallow: '#1f7f8f' },
  // (water with ~10% ammonia: liquid down to ~240 K; the eutectic, 33%, to 176 K)
  'ammonia-water': { kind: 'liquid', Tt: 240, Pt: 0.001, Tc: 600, Tb: 370, L: 40, rho: 950, cp: 4300, mu: 2.5e-3, Tref: 250, B: 2000, n: 1.34, deep: '#1a2c3a', shallow: '#4f7f86' },
  CO2:       { kind: 'liquid', Tt: 216.6, Pt: 5.18, Tc: 304.1, Tb: 194.7, L: 26.1, rho: 1100, cp: 2000, mu: 1.0e-4, Tref: 250, B: 600, n: 1.2, deep: '#22303a', shallow: '#7d96a3' },
  nitrogen:  { kind: 'liquid', Tt: 63.15, Pt: 0.125, Tc: 126.2, Tb: 77.4, L: 5.57, rho: 808, cp: 2040, mu: 1.6e-4, Tref: 77, B: 300, n: 1.2, deep: '#2a3644', shallow: '#93a8ba' },
  methane:   { kind: 'liquid', Tt: 90.7, Pt: 0.117, Tc: 190.6, Tb: 111.7, L: 8.19, rho: 422, cp: 3480, mu: 1.2e-4, Tref: 110, B: 400, n: 1.27, deep: '#1d1712', shallow: '#3a2e22', tags: ['fuel', 'reducer'] },
  ethane:    { kind: 'liquid', Tt: 90.4, Pt: 1.1e-5, Tc: 305.3, Tb: 184.6, L: 14.7, rho: 545, cp: 2400, mu: 1.7e-4, Tref: 180, B: 500, n: 1.37, deep: '#1d1712', shallow: '#3a2e22', tags: ['fuel', 'reducer'] },
  ammonia:   { kind: 'liquid', Tt: 195.4, Pt: 0.061, Tc: 405.5, Tb: 239.8, L: 23.3, rho: 682, cp: 4700, mu: 2.5e-4, Tref: 240, B: 700, n: 1.33, deep: '#1b2630', shallow: '#6f8790', tags: ['reducer'] },
  SO2:       { kind: 'liquid', Tt: 197.6, Pt: 0.0167, Tc: 430.7, Tb: 263.1, L: 24.9, rho: 1460, cp: 1360, mu: 3.7e-4, Tref: 263, B: 800, n: 1.35, deep: '#3a3418', shallow: '#a89a52', tags: ['acid'] },
  // (molten sulfur thickens a thousandfold near 430 K as its rings open into chains)
  sulfur:    { kind: 'liquid', Tt: 388, Pt: 1e-5, Tc: 1314, Tb: 717.8, L: 45, rho: 1820, cp: 1000, mu: 1.0e-2, Tref: 400, B: 0, n: 1.9, deep: '#3a1a08', shallow: '#c4661c' },
  // lava: basalt runs (~100 Pa s at 1450 K), andesite and rhyolite far stiffer
  lava:      { kind: 'liquid', Tt: 1250, Pt: 0, Tc: 4000, Tb: 3000, L: 400, rho: 2700, cp: 1200, mu: 100, Tref: 1450, B: 25000, n: 1.6, deep: '#1a0d08', shallow: '#3a1d10' },
  brine:     { kind: 'liquid', Tt: 252, Pt: 0.006, Tc: 650, Tb: 381, L: 40.7, rho: 1200, cp: 3300, mu: 2.0e-3, Tref: 293, B: 1900, n: 1.38, deep: '#20343c', shallow: '#5f8a86', tags: ['salt'] },
  // ---- ices on the ground
  'CO2 ice': { kind: 'ice', rho: 1560, cp: 1000, n: 1.41, color: '#eef0f2' },
  'nitrogen ice': { kind: 'ice', rho: 1030, cp: 1300, n: 1.22, color: '#f2e6e0' },   // (pinkish where light cooks it to tholins)
  'methane ice': { kind: 'ice', rho: 520, cp: 2000, n: 1.3, color: '#f0ece0' },
  'SO2 frost': { kind: 'ice', rho: 1900, cp: 900, n: 1.4, color: '#f2edc8' },
  // ---- made by life
  reef:      { kind: 'bio', rho: 2400, cp: 840, n: 1.6, color: '#d8cdb6', k: 0.8, stand: 70, tags: ['carbonate'] },
  peat:      { kind: 'bio', rho: 1100, cp: 1900, n: 1.5, color: '#3a2a1c', k: 2.5, stand: 30, tags: ['fuel'] },
};

// how much a surface reflects straight on (Fresnel, against air)
export function reflectance(name) {
  const n = MATERIALS[name] ? MATERIALS[name].n : 1.5;
  return ((n - 1) / (n + 1)) * ((n - 1) / (n + 1));
}

// viscosity (Pa s) at T K
export function viscosity(name, T) {
  const m = MATERIALS[name];
  if (!m || m.mu == null) return null;
  return m.mu * dm.exp(dm.clamp(m.B * (1 / Math.max(T, 1) - 1 / m.Tref), -30, 30));
}

export const has = (name, tag) => !!(MATERIALS[name] && MATERIALS[name].tags && MATERIALS[name].tags.includes(tag));

// the sea's acidity from the air's CO2 and SO2 (bar): ~8.2 at Earth's CO2 today,
// falling ~0.45 per tenfold CO2; sulfur gases acidify further (a volcanic world's
// seas); carbonate shells and reefs need the sea above ~7.6
export function seaPH(pCO2, pSO2 = 0) {
  return dm.clamp(8.2 - 0.45 * dm.log10(Math.max(pCO2, 1e-7) / 2.8e-4) - 0.5 * dm.log10(1 + pSO2 / 1e-6), 1, 9);
}
export const carbonateOK = (pH) => dm.smoothstep(7.3, 7.8, pH);

// reactions: a with b (or with a condition) makes something; the processes apply them
// as rates at this scale (where each is used is noted)
export const REACTIONS = [
  { a: 'lava', b: 'water', makes: ['basalt', 'black sand', 'steam'], note: 'quenched: pillow basalt and glassy sand; new land where the lava builds out (coasts.js black sand; tectonics volcanic islands)' },
  { a: 'lava', b: 'ice', makes: ['water', 'basalt'], note: 'flat-topped volcanoes (tuyas) where a hotspot erupted under an ice sheet, as tall as the ice was thick (world.js; terrain stamps them); meltwater floods (to do)' },
  { a: 'acid', b: 'carbonate', makes: ['CO2', 'brine'], note: 'acid seas dissolve shells and limestone: no reefs or chalk below pH ~7.6 (coasts.js, lithology marineRock)' },
  { a: 'water', b: 'salt', makes: ['brine'], note: 'closed basins concentrate salt (erosion.js lakes)' },
  { a: 'ammonia', b: 'water', makes: ['ammonia-water'], note: 'antifreeze: liquid to ~176 K (liquids.js)' },
  { a: 'fuel', b: 'O2', when: 'O2 > ~17% of the air', makes: ['CO2', 'ash'], note: 'wildfire: keeps grasslands open, limits oxygen (life.js fire)' },
  { a: 'water', b: 'rock', makes: ['clay', 'soil'], note: 'weathering draws down CO2 (evolve.js thermostat); soil from it (soil.js)' },
];
