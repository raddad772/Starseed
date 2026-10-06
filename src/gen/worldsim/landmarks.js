// A world's landmarks: names for what the feature finder found (features.js), and the
// short list the game shows (the catalog). Names come from the same syllables as the
// system's (names.js), deterministic from the seed and the body, each kind in its own
// form ("Mount X", "X River", "Lake X", "the X Desert") and none used twice.

import { Rng } from '../../core/rng.js';
import { makeName } from '../names.js';
import { GridLite } from './grid.js';
import * as dm from '../../core/dmath.js';

// each kind's forms (# is the name)
const FORMS = {
  peaks: ['Mount #', '# Peak', 'Mount #'],
  ranges: ['the # Mountains', 'the # Range'],
  rivers: ['the # River', 'the # River', 'the #'],
  lakes: ['Lake #', 'Lake #', '# Water'],
  saltLakes: ['the # Salt Lake', 'the # Salt Lake', '# Salt Pan'],
  deserts: ['the # Desert', 'the # Waste'],
  duneSeas: ['the # Erg', 'the # Sand Sea'],
  forests: ['the # Forest', 'the # Woods'],
  reefs: ['the # Reef', 'the Great # Reef'],
  tuyas: ['# Table', '# Tuya'],
  volcanoes: ['Mount #', '# Volcano'],
  trenches: ['the # Deep', 'the # Trench'],
  craters: ['# Crater', '# Basin'],
  beaches: ['# Strand', '# Sands'],
  iceFields: ['the # Ice', 'the # Ice Cap'],
  gorges: ['the # Gorge', 'the # Canyon'],
  waterfalls: ['# Falls', '# Force'],
};
// on a world with no surface liquid now: what its wetter past carved, dry
const DRY = {
  rivers: ['the # Valley', 'the # Valley', 'the # Channel'],
  lakes: ['the # Basin', '# Playa', '# Dry Lake'],
  saltLakes: ['the # Salt Pan', 'the # Salt Flat'],
  waterfalls: ['# Dry Falls', 'the # Cataract'],
};

// names every listed feature (sets .name) in place; key: a string (seed and body); dry: the
// world has no surface liquid now (its rivers and lakes are dry valleys and basins)
export function nameLandmarks(F, key, dry = false) {
  const used = new Set();
  const root = Rng.fromString('landmarks|' + key);
  for (const kind of Object.keys(FORMS)) {
    const list = F[kind];
    if (!Array.isArray(list)) continue;
    const rng = root.fork(kind);
    // (short names read best on a map: mostly two syllables, now and then three)
    const pick = () => { let n = makeName(rng, 2, rng.chance(0.2) ? 3 : 2); for (let k = 0; k < 4 && n.length > 9; k++) n = makeName(rng, 2, 2); return n; };
    for (const f of list) {
      let n = pick();
      for (let k = 0; k < 6 && used.has(n); k++) n = pick();
      used.add(n);
      const set = dry ? { ...FORMS, ...DRY } : FORMS;
      const forms = kind === 'lakes' && f.salt ? set.saltLakes : set[kind];
      f.name = forms[rng.int(0, forms.length - 1)].replace('#', n);
    }
  }
  return F;
}

const km = (x) => x >= 1e6 ? `${(x / 1e6).toFixed(1)}M` : x >= 1e4 ? `${Math.round(x / 1000)}k` : `${Math.round(x).toLocaleString('en-US')}`;
const cap = (s) => s[0].toUpperCase() + s.slice(1);

// the headline landmarks for the game, most striking first: [{ kind, name, text, lat, lon }]
export function landmarks(F, dry = false) {
  const out = [];
  const add = (kind, f, text) => { if (f && f.name) out.push({ kind, name: cap(f.name), text, lat: f.lat, lon: f.lon }); };
  // (a world nearly all sea: no "peak" a few metres above it, no river a cell long)
  if (F.peaks && F.peaks[0] && F.peaks[0].height >= 50) add('peak', F.peaks[0], `${Math.round(F.peaks[0].height).toLocaleString('en-US')} m`);
  if (F.rivers && F.rivers[0] && F.rivers[0].lengthKm >= 10) add('river', F.rivers[0], `${km(F.rivers[0].lengthKm)} km${dry ? ', dry' : ''}`);
  const lake = F.lakes && F.lakes.find((l) => !l.underIce);
  if (lake) add('lake', lake, `${km(lake.areaKm2)} km²${dry ? ', dry' : ''}`);
  if (F.reefs && F.reefs[0]) add('reef', F.reefs[0], `${km(F.reefs[0].lengthKm)} km`);
  if (F.deserts && F.deserts[0]) add('desert', F.deserts[0], `${km(F.deserts[0].areaKm2)} km²`);
  if (F.forests && F.forests[0]) add('forest', F.forests[0], `${F.forests[0].kind}, ${km(F.forests[0].areaKm2)} km²`);
  if (F.tuyas && F.tuyas[0]) add('tuya', F.tuyas[0], `${Math.round(F.tuyas[0].heightM)} m, erupted under the ice`);
  if (F.trenches && F.trenches[0]) add('trench', F.trenches[0], `${Math.round(F.trenches[0].depth).toLocaleString('en-US')} m deep`);
  if (F.beaches && F.beaches[0]) add('beach', F.beaches[0], `${km(F.beaches[0].lengthKm)} km of ${F.beaches[0].sand}`);
  if (F.iceFields && F.iceFields[0]) add('ice', F.iceFields[0], `${F.iceFields[0].kind}, ${km(F.iceFields[0].areaKm2)} km²`);
  if (F.craters && F.craters[0]) add('crater', F.craters[0], `${km(F.craters[0].diameterKm)} km across`);
  return out;
}

// Where to watch the aurora: land under a magnetic pole's oval, where its arcs stand overhead (the
// field's oval: bodies.js airGlow), dark (the winter's longest night, from the latitude and the axial
// tilt), and clear (the clouds the game draws: snapshot.js's cloud, more where it rains): Abisko's,
// Fairbanks'. Read from a world's snapshot (s) whenever it's applied, cached or new, so no world
// needs simulating again for it. key: the landmarks' (seed and body). A landmark, or null (no
// field, no air, no land under the oval)
export function auroraLandmark(s, body, key) {
  const atm = body.atmosphere, glow = atm && atm.render && atm.render.glow;
  if (!glow || !(glow.ovalLat > 0) || !(glow.aurora > 0) || !s.h) return null;
  // (on the climate grid, with its clouds; a world simulated without a climate, on its own grid,
  // its skies not known)
  const G = new GridLite(s.N, s.R), cl = !!(s.Nc && s.cloud), Gc = cl ? new GridLite(s.Nc, s.R) : G, m = Gc.n, ax = glow.magAxis, d = [0, 0, 0];
  const obl = Math.abs((body.rotation && body.rotation.obliquity) || 0);
  let best = null;
  for (let c = 0; c < m; c += cl ? 1 : 3) {
    Gc.centre(c, d);
    const fc = cl ? G.cellAt(d[0], d[1], d[2]) : c;
    if (!(s.h[fc] > 0) || (s.ice && s.ice[fc] > 0)) continue;
    const mlat = dm.asin(Math.min(1, Math.abs(d[0] * ax[0] + d[1] * ax[1] + d[2] * ax[2])));
    const u = (mlat - glow.ovalLat) / (1.5 * glow.ovalWidth), under = dm.exp(-u * u);
    if (under < 0.3) continue;
    // (the winter's longest night, its share of the day: polar night where the tilt brings it)
    const t = dm.tan(Math.min(1.55, Math.abs(dm.asin(d[1])))) * dm.tan(Math.min(1.55, obl));
    const night = t >= 1 ? 1 : 1 - dm.acos(Math.min(1, t)) / Math.PI;
    const clear = cl ? 1 - s.cloud[c] : 0.7;
    const score = under * (0.4 + night) * clear * clear;
    if (!best || score > best.score) best = { score, night, clear, lat: dm.asin(d[1]) * 180 / Math.PI, lon: dm.atan2(d[2], d[0]) * 180 / Math.PI };
  }
  if (!best) return null;
  const rng = Rng.fromString('landmarks|' + key).fork('aurora');
  const forms = ['the # Lights', '# Skywatch', 'the # Overlook'];
  // (its lights' colours: each the air's glow has strongly, bodies.js airGlow's low arcs)
  let n = makeName(rng, 2, 2);
  for (let k = 0; k < 4 && n.length > 9; k++) n = makeName(rng, 2, 2);
  const lo = glow.colorLow || [0, 1, 0], mx = Math.max(lo[0], lo[1], lo[2], 1e-6);
  const cols = [lo[1] > 0.75 * mx ? 'green' : null, lo[2] > 0.75 * mx ? 'violet' : null, lo[0] > 0.75 * mx ? 'red' : null].filter(Boolean);
  const dark = best.night > 0.99 ? 'the sun stays down in midwinter' : `winter nights ${Math.round(best.night * 100)}% of the day`;
  return {
    kind: 'aurora', name: cap(forms[rng.int(0, forms.length - 1)].replace('#', n)),
    text: `under the auroral oval, its lights ${cols.join(' and ')}; ${dark}${cl ? `, skies ${best.clear > 0.6 ? 'mostly clear' : best.clear > 0.4 ? 'often clear' : 'often clouded'}` : ''}`,
    lat: best.lat, lon: best.lon,
  };
}

// names a world's places (places.js) in place: a continent by its name alone, an island "X Island" or
// "the Isle of X", an islet a cay in warm seas and a skerry in cold ones, an archipelago "the X Islands"
const PLACE_FORMS = {
  continent: ['#'],
  'large island': ['# Island', 'the Isle of #', '# Island'],
  island: ['# Island', '# Isle', '# Island'],
  isletWarm: ['# Cay', '# Key', '# Islet'],
  isletCold: ['# Skerry', '# Rock', '# Holm'],
  archipelago: ['the # Islands', 'the # Isles', 'the # Islands'],
};
export function namePlaces(P, key) {
  if (!P) return P;
  const root = Rng.fromString('places|' + key), used = new Set();
  const pick = (rng) => { let nm = makeName(rng, 2, rng.chance(0.25) ? 3 : 2); for (let k = 0; k < 6 && (used.has(nm) || nm.length > 9); k++) nm = makeName(rng, 2, 2); used.add(nm); return nm; };
  const one = (p, kind) => {
    const rng = root.fork(`${kind}${p.id ?? p.members[0]}`);
    const forms = kind === 'islet' ? (Math.abs(p.lat) < 30 ? PLACE_FORMS.isletWarm : PLACE_FORMS.isletCold) : PLACE_FORMS[kind];
    p.name = forms[rng.int(0, forms.length - 1)].replace('#', pick(rng));
    p.name = p.name[0].toUpperCase() + p.name.slice(1);
  };
  for (const p of P.places) if (!p.named) one(p, p.kind);
  for (const g of P.groups) one(g, 'archipelago');
  return P;
}
