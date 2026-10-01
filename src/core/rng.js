// Seeded hashing and random numbers. Generation code never touches Math.random.
//
// Every entity derives its own stream with fork(label), keyed by the parent's
// *seed* rather than its state, so adding a draw in one subsystem never shifts
// the numbers another subsystem sees (planet 3 stays planet 3 when moon code
// changes).

import * as dm from './dmath.js';

export function fmix32(h) {
  h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

// cyrb53-style string hash, returns two 32-bit words
export function hashStr(str, seed = 0) {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return [h1 >>> 0, h2 >>> 0];
}

// Integer lattice hash -> uint32
export function hash3i(x, y, z, seed) {
  let h = seed >>> 0;
  h = fmix32(h ^ Math.imul(x | 0, 0x8da6b343));
  h = fmix32(h ^ Math.imul(y | 0, 0xd8163841));
  h = fmix32(h ^ Math.imul(z | 0, 0xcb1ab31f));
  return h;
}
export function hash3f(x, y, z, seed) { return hash3i(x, y, z, seed) / 4294967296; }

export function hashInts(a, b, c = 0, d = 0) {
  return fmix32(fmix32(fmix32(fmix32(a >>> 0) ^ (b >>> 0)) ^ (c >>> 0)) ^ (d >>> 0));
}

export class Rng {
  constructor(key) {
    this.key = [key[0] >>> 0, key[1] >>> 0, key[2] >>> 0, key[3] >>> 0];
    this.a = this.key[0] | 0; this.b = this.key[1] | 0; this.c = this.key[2] | 0; this.d = this.key[3] | 0;
    for (let i = 0; i < 15; i++) this.u32();
  }

  static fromString(s) {
    const [a, b] = hashStr(s, 0x9e3779b9);
    const [c, d] = hashStr(s, 0x7f4a7c15);
    return new Rng([a, b, c, d]);
  }

  fork(label) {
    const s = typeof label === 'number' ? '#' + label : String(label);
    const k = this.key;
    const [h1, h2] = hashStr(s, k[0] ^ 0x5bd1e995);
    const [h3, h4] = hashStr(s, k[1] ^ k[2] ^ k[3]);
    return new Rng([fmix32(h1 ^ k[2]), fmix32(h2 ^ k[3]), fmix32(h3 ^ k[0]), fmix32(h4 ^ k[1])]);
  }

  // A 32-bit seed for sub-systems (noise tables etc.)
  seed32(label) { return this.fork(label).u32(); }

  u32() { // sfc32
    let a = this.a, b = this.b, c = this.c, d = this.d;
    const t = (((a + b) | 0) + d) | 0;
    d = (d + 1) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    c = (c + t) | 0;
    this.a = a; this.b = b; this.c = c; this.d = d;
    return t >>> 0;
  }

  next() { // uniform [0,1) with 53 random bits
    const hi = this.u32() >>> 5, lo = this.u32() >>> 6;
    return (hi * 67108864 + lo) / 9007199254740992;
  }
  range(a, b) { return a + (b - a) * this.next(); }
  int(a, b) { return a + Math.floor(this.next() * (b - a + 1)); } // inclusive
  chance(p) { return this.next() < p; }
  pick(arr) { return arr[Math.floor(this.next() * arr.length)]; }
  sign() { return this.next() < 0.5 ? -1 : 1; }

  normal(mu = 0, sigma = 1) {
    let u = this.next();
    if (u < 1e-300) u = 1e-300;
    const v = this.next();
    return mu + sigma * dm.sqrt(-2 * dm.log(u)) * dm.cos(dm.TWO_PI * v);
  }
  lognormal(median, sigmaLn) { return median * dm.exp(this.normal(0, sigmaLn)); }
  rayleigh(sigma) {
    let u = this.next();
    if (u < 1e-300) u = 1e-300;
    return sigma * dm.sqrt(-2 * dm.log(u));
  }
  logUniform(a, b) { return a * dm.exp(this.next() * dm.log(b / a)); }
  // Power law p(x) ~ x^alpha on [a,b], alpha != -1
  powerLaw(a, b, alpha) {
    const u = this.next(), k = alpha + 1;
    const ak = dm.pow(a, k), bk = dm.pow(b, k);
    return dm.pow(ak + u * (bk - ak), 1 / k);
  }
  weighted(entries) { // [[weight, value], ...]
    let total = 0;
    for (const e of entries) total += e[0];
    let u = this.next() * total;
    for (const e of entries) { u -= e[0]; if (u < 0) return e[1]; }
    return entries[entries.length - 1][1];
  }
  unitVector() {
    const z = this.range(-1, 1);
    const phi = this.range(0, dm.TWO_PI);
    const s = dm.sqrt(1 - z * z);
    return [s * dm.cos(phi), s * dm.sin(phi), z];
  }
  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }
}

// Human-friendly seeds: 8 chars from an unambiguous alphabet, shown as XXXX-XXXX
const SEED_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function randomSeedString() {
  // The only non-deterministic draw in the program: picking a NEW seed.
  const buf = new Uint32Array(8);
  crypto.getRandomValues(buf);
  let s = '';
  for (let i = 0; i < 8; i++) {
    if (i === 4) s += '-';
    s += SEED_ALPHABET[buf[i] % SEED_ALPHABET.length];
  }
  return s;
}
export function normalizeSeed(s) {
  return String(s || '').trim().toUpperCase().replace(/\s+/g, '-').slice(0, 48);
}
