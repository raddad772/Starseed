// Procedural names (deterministic, from an Rng stream).

const ONSET = ['b', 'c', 'd', 'f', 'g', 'h', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'z', 'th', 'sh', 'ch',
  'kr', 'tr', 'dr', 'br', 'gr', 'st', 'vr', 'gl', 'cl', 'pr', 'sk', 'zh', 'ph', 'qu', 'x', 'y', 'l', 'n', 'r', 's',
  't', 'm', 'v', 'k', 'd'];
const NUCLEUS = ['a', 'e', 'i', 'o', 'u', 'a', 'e', 'i', 'o', 'a', 'ae', 'ai', 'ei', 'au', 'ou', 'ia', 'io', 'y', 'ea', 'oa', 'u', 'e'];
const CODA = ['', '', '', '', '', 'n', 'r', 's', 'l', 'm', 'th', 'x', 'nd', 'rk', 'st', 'sh', 'll', 'ss', 'nt', 'rn', 'ks', 'ld', 'r', 'n'];
const ENDINGS = ['', '', '', '', 'a', 'ia', 'on', 'us', 'is', 'ar', 'eth', 'ora', 'ux', 'ion', 'ae', 'ys'];
const VOWELS = /[aeiouy]/;

export function makeName(rng, minSyl = 2, maxSyl = 3) {
  for (let attempt = 0; attempt < 20; attempt++) {
    const n = rng.int(minSyl, maxSyl);
    let s = '';
    for (let i = 0; i < n; i++) {
      const onset = (i === 0 && rng.chance(0.22)) ? '' : rng.pick(ONSET);
      const nucleus = rng.pick(NUCLEUS);
      const coda = (i === n - 1 || rng.chance(0.25)) ? rng.pick(CODA) : '';
      s += onset + nucleus + coda;
    }
    if (n <= 2 && rng.chance(0.35)) {
      const end = rng.pick(ENDINGS);
      if (end && VOWELS.test(end[0]) && VOWELS.test(s[s.length - 1])) s = s.slice(0, -1);
      s += end;
    }
    // reject unpronounceable clusters and too-long names
    if (/[^aeiouy]{4,}/.test(s) || /[aeiouy]{4,}/.test(s) || s.length < 3 || s.length > 11) continue;
    if (/(.)\1\1/.test(s)) continue;
    return s[0].toUpperCase() + s.slice(1);
  }
  return 'Nameless';
}

export function catalogName(rng) {
  const kind = rng.int(0, 3);
  if (kind === 0) return 'HD ' + rng.int(1000, 299999);
  if (kind === 1) return 'GJ ' + rng.int(100, 9999);
  if (kind === 2) return 'KOI-' + rng.int(100, 9999);
  return 'TOI-' + rng.int(100, 6999);
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV'];
export function roman(n) { return ROMAN[n - 1] || String(n); }
export const PLANET_LETTERS = 'bcdefghijklmnop';
