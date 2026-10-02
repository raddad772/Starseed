// A world's landmarks: names for what the feature finder found (features.js), and the
// short list the game shows (the catalog). Names come from the same syllables as the
// system's (names.js), deterministic from the seed and the body, each kind in its own
// form ("Mount X", "X River", "Lake X", "the X Desert") and none used twice.

import { Rng } from '../../core/rng.js';
import { makeName } from '../names.js';

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
  if (F.peaks && F.peaks[0]) add('peak', F.peaks[0], `${Math.round(F.peaks[0].height).toLocaleString('en-US')} m`);
  if (F.rivers && F.rivers[0]) add('river', F.rivers[0], `${km(F.rivers[0].lengthKm)} km${dry ? ', dry' : ''}`);
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
