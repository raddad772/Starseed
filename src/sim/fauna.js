// The animals about (LIFE.md 4), world state: a world's species (a few to each level of its food web,
// each suited to a country of its own) and its herds, each a home on the ground and a path through
// time, the same for everyone who comes: from the world's seed, the food web's numbers (gen/life/
// ecology.js) and the world clock alone. A herd grazes a spot, then walks on to the next, a step from
// the last (an AR(1) wander about its home: the country it ranges over), its animals milling round it
// while it grazes and filing after it when it moves. How each turns and steps, and when they run (from
// you, from a hunter), are the viewer's (render/faunaRender.js): world state when worlds are shared.
import * as THREE from 'three';
import { Rng, hash3i, fmix32 } from '../core/rng.js';
import { GridLite } from '../gen/worldsim/grid.js';
import { ecologyOf, LEVELS } from '../gen/life/ecology.js';
import { designCreature } from '../gen/life/creature.js';
import { lineagesOf, islandMass } from '../gen/life/lineage.js';
import { designFlyer } from '../gen/life/flyer.js';
import * as dm from '../core/dmath.js';
import { makeName } from '../gen/names.js';

export const CELL = 512;                        // m: the herds' lattice (in the body's frame)
const ROAM = [0, 120, 320, 450, 600];           // m: how far a level's herds range from home
export const SEG = 100;                         // s: a herd's leg: grazing a spot, then on to the next
const AR = 0.95, AR_N = 40;                     // (its wander: each spot ~ROAM/3 from the last)
const LEVEL_TEXT = ['', 'grazer', 'hunter', 'hunter of hunters', 'apex hunter'];

// a hash's stream of [0, 1)
const stream = (h) => () => { h = fmix32((h + 0x9e3779b9) >>> 0); return h / 4294967296; };

// a world's fauna: its food web on the map, its realms (each landmass's own animals: life/lineage.js)
// and their species; null where nothing walks its land (or its world sim isn't in yet: asked again)
export function faunaOf(b) {
  if (b._fauna !== undefined) return b._fauna;
  const life = b.data.life, bio = life && life.biosphere;
  if (!bio || !bio.land || !bio.land.clade) return (b._fauna = null);
  const gen = b.terrain, s = gen && gen.snap && gen.snap.s;
  if (!s || !s.P || !s.Tsea || !s.Nc) return null;
  const g = b.data.gravity || 9.81, eco = ecologyOf(s, bio, g, gen.p && gen.p.lapse ? gen.p.lapse : 0.0065);
  if (!eco) return (b._fauna = null);
  const Gc = new GridLite(s.Nc, s.R), G = new GridLite(s.N, s.R), m = Gc.n;
  const rng = (b.data.terrain && b.data.terrain.seed ? new Rng(b.data.terrain.seed) : Rng.fromString(`fauna|${b.data.name}`)).fork('fauna');
  // (the ruling lineage's radiation: since its era began, or the land's first animals; Myr ago)
  const eras = bio.land.eras || [], t0 = 1000 * (eras.length ? eras[eras.length - 1].ago : bio.land.since || 0.1);
  const F = { b, bio, eco, Gc, G, s, g, t0, herds: new Map(), seed: rng.fork('herds').u32(), rng,
    plan: bio.plans.find((p) => p.id === bio.land.plan) || bio.plans[0], palette: { veg: life.vegColor, dry: life.dryColor || life.vegColor },
    lineages: lineagesOf(s.realms, t0, rng.fork('lineages').u32()), realmCells: new Map(), realms: new Map(), cellKm2: 4 * Math.PI * (b.R / 1000) ** 2 / m };
  for (let c = 0; c < m; c++) { const r = s.realm ? s.realm[c] : -1; if (!F.realmCells.has(r)) F.realmCells.set(r, []); F.realmCells.get(r).push(c); }
  return (b._fauna = F);
}

// a realm's animals (built when first asked): its name, its share of the land, and its species, so
// many to a level as its land holds (species-area: ~A^0.35) and none of a level it can't keep a lasting
// number of (an island's hunters); each species of its own line (or one an interchange brought), sized
// by the island rule, suited to the climate of a place in it its level lives
export function realmOf(F, rid) {
  let R = F.realms.get(rid);
  if (R) return R;
  const { s, eco, Gc, G, bio, g } = F, cells = F.realmCells.get(rid) || [], node = F.lineages.nodes.get(rid);
  const r = F.rng.fork(`realm${rid}`), d = [0, 0, 0];
  let share = node && node.land != null ? node.land : 0;
  if (!node) { let all = 0; for (const [k, v] of F.realmCells) if (k >= 0 || !s.realm) all += v.length; share = s.realm ? cells.length / Math.max(all, 1) : 1; }
  R = { id: rid, name: makeName(r, 2, 3), share, island: share < 0.03, species: [], node };
  // (land life never reached: no plants, none to eat them)
  if (rid < 0 && s.realm) { F.realms.set(rid, R); return R; }
  const climAt = (c) => { Gc.centre(c, d); const h = Math.max(0, G.sample(s.h, d)); return { T: s.Tsea[c] - 273.15 - 0.0065 * h, P: s.P[c], forest: s.forest ? s.forest[c] : 0 }; };
  for (let k = 1; k <= LEVELS; k++) {
    const D = eco.dens[k - 1], live = [];
    let pop = 0;
    for (const c of cells) if (D[c] > 0) { live.push(c); pop += D[c] * F.cellKm2; }
    if (!live.length || pop < 30) continue;
    const many = Math.pow(Math.max(share, 1e-4) / 0.2, 0.35);
    const nSp = k === 1 ? dm.clamp(Math.round(1 + 2.5 * many), 1, 4) : k === 2 ? dm.clamp(Math.round(1 + many), 1, 2) : 1;
    // (its species are its parent realm's where they parted too lately for new ones: the same names)
    const ident = F.lineages.identOf(rid);
    for (let v = 0; v < nSp; v++) {
      const q = F.rng.fork(`species${ident}.${k}.${v}`);
      const { traits, from } = F.lineages.species(ident, k * 10 + v, q.next());
      // (its country: the climate of a place in the realm its level lives)
      const niche = climAt(live[Math.floor(r.fork(`niche${k}.${v}`).next() * live.length)]);
      const massKg = islandMass(eco.massKg[k] * Math.exp(0.4 * traits[0]), share);
      const key = `${F.b.data.name}|${ident}|${k}|${v}`;
      const design = designCreature(F.plan, bio.land.clade, k, massKg, g, F.palette, key, traits);
      const herd = k === 1 ? Math.max(1, Math.round(q.range(3, 12) / Math.max(1, Math.cbrt(massKg / 400)))) : k === 2 ? q.pick([1, 1, 2, 3]) : q.pick([1, 1, 2]);
      R.species.push({ level: k, v, key, name: makeName(q, 2, 3), realm: rid, from: from === ident ? rid : from, niche, habitat: habitatOf(niche), massKg, design, herd,
        role: LEVEL_TEXT[k], cold: eco.cold });
    }
  }
  // its flyers (biosphere.js flight): a small one or two, and a big soarer where they've evolved and
  // there's room; each its realm's own line
  const fl = bio.flight || {}, A = F.b.data.atmosphere, Tg = F.b.data.Tsurf || 288;
  const rho = A ? A.pressure * 1e5 * ((A.mu || 29) / 1000) / (8.314 * Tg) : 0;
  const ident = F.lineages.identOf(rid);
  const kinds = [];
  if (fl.small != null && rho > 0.05 && R.species.length) { kinds.push('small'); if (share > 0.05) kinds.push('small'); }
  if (fl.large != null && rho > 0.05 && R.species.length && share > 0.005) kinds.push('large');
  kinds.forEach((size, v) => {
    const q = F.rng.fork(`flyer${ident}.${v}`);
    const { traits, from } = F.lineages.species(ident, 90 + v, q.next());
    const key = `${F.b.data.name}|${ident}|f${v}`;
    const design = designFlyer(F.plan, size, g, rho, F.palette, key, traits);
    const flock = size === 'large' ? q.pick([1, 1, 2]) : Math.round(q.range(4, 18));
    R.species.push({ level: 0, flyer: true, v, key, name: makeName(q, 2, 3), realm: rid, from: from === ident ? rid : from, habitat: size === 'large' ? 'the high air, soaring' : 'flocks over the country',
      massKg: design.massKg, design, herd: flock, role: size === 'large' ? 'big flyer' : 'small flyer', cold: false });
  });
  F.realms.set(rid, R);
  return R;
}
// the realms by their share of the land, biggest first (the catalogue's)
export function realmsByLand(F) { return [...F.realmCells.keys()].filter((k) => k >= 0 || !F.s.realm).map((k) => realmOf(F, k)).sort((a, b) => b.share - a.share); }

// the country a species is suited to, in words
function habitatOf(n) {
  const t = n.T < 0 ? 'frozen' : n.T < 8 ? 'cold' : n.T < 18 ? 'temperate' : 'warm';
  const w = n.P < 250 ? 'desert' : n.P < 600 ? 'dry' : n.P < 1500 ? '' : 'wet';
  const land = n.forest > 0.5 ? 'forests' : n.P < 250 ? 'scrub' : n.P < 600 ? 'plains' : 'grasslands';
  return [t, w, land].filter(Boolean).join(' ');
}

// the species of a realm best suited to a place's climate (a herd's own luck where two countries meet)
function speciesFor(R, level, clim, luck) {
  let best = null, bd = Infinity;
  for (const sp of R.species) {
    if (sp.level !== level) continue;
    const dT = (clim.T - sp.niche.T) / 8, dP = Math.log((clim.P + 50) / (sp.niche.P + 50)) / 0.6;
    const j = (luck * (sp.v + 1) * 7.13) % 1, dd = dT * dT + dP * dP + 0.6 * j;
    if (dd < bd) { bd = dd; best = sp; }
  }
  return best;
}

// the herds whose homes lie within reach (m) of body-fixed point p: each built once (its home, its
// species, its size) and kept. A herd's home is a point of the body's 3D lattice of CELL cubes that
// falls within half a cell of the datum sphere, so many to a cube as the food web there feeds (each
// cube's own hash), carried out along its radius to the ground
export function herdsNear(F, b, p, reach, out = []) {
  out.length = 0;
  const R = b.R, C = CELL, r2 = (reach + C) * (reach + C);
  const i0 = Math.floor((p.x - reach) / C), i1 = Math.floor((p.x + reach) / C);
  const j0 = Math.floor((p.y - reach) / C), j1 = Math.floor((p.y + reach) / C);
  const k0 = Math.floor((p.z - reach) / C), k1 = Math.floor((p.z + reach) / C);
  const d = [0, 0, 0];
  for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) for (let k = k0; k <= k1; k++) {
    const cx = (i + 0.5) * C, cy = (j + 0.5) * C, cz = (k + 0.5) * C, cr = Math.hypot(cx, cy, cz);
    if (Math.abs(cr - R) > C) continue;
    const ex = cx - p.x, ey = cy - p.y, ez = cz - p.z;
    if (ex * ex + ey * ey + ez * ez > r2) continue;
    const ck = `${i},${j},${k}`;
    let list = F.herds.get(ck);
    if (!list) {
      list = cubeHerds(F, b, i, j, k);
      if (F.herds.size > 4000) F.herds.clear();
      F.herds.set(ck, list);
    }
    for (const h of list) {
      const hx = h.home[0] * R - p.x, hy = h.home[1] * R - p.y, hz = h.home[2] * R - p.z;
      if (hx * hx + hy * hy + hz * hz < (reach + h.roam) * (reach + h.roam)) out.push(h);
    }
  }
  return out;
}

function cubeHerds(F, b, i, j, k) {
  const R = b.R, C = CELL, list = [], d = [0, 0, 0];
  for (let lv = 1; lv <= LEVELS; lv++) {
    const rnd = stream(hash3i(i, j, k, (F.seed ^ Math.imul(lv, 0x632be5ab)) >>> 0));
    // (the cube's expected herds: its level's numbers at its middle a km2, over a herd's size)
    const cx = (i + 0.5) * C, cy = (j + 0.5) * C, cz = (k + 0.5) * C, cl = Math.hypot(cx, cy, cz);
    d[0] = cx / cl; d[1] = cy / cl; d[2] = cz / cl;
    const D = F.Gc.sample(F.eco.dens[lv - 1], d);
    const R0 = realmOf(F, F.s.realm ? F.s.realm[F.Gc.cellOf(d)] : -1), sp0 = R0.species.find((sp) => sp.level === lv);
    const lam = sp0 ? D / sp0.herd * C * C / 1e6 : 0;
    if (!(lam > 0)) continue;
    // (Poisson's count, by its product of uniforms; capped)
    let n = 0;
    for (let L = Math.exp(-Math.min(lam, 30)), q = rnd(); q > L && n < 24; q *= rnd()) n++;
    for (let m = 0; m < n; m++) {
      const x = (i + rnd()) * C, y = (j + rnd()) * C, z = (k + rnd()) * C, r = Math.hypot(x, y, z);
      const luck = rnd(), sizeLuck = rnd(), key = (rnd() * 4294967296) >>> 0;
      if (Math.abs(r - R) > C * 0.5) continue;
      const home = [x / r, y / r, z / r];
      // (its home on dry ground where its level lives)
      if (!(F.Gc.sample(F.eco.dens[lv - 1], home) > 0)) continue;
      if (b.isWaterAt(_hv.set(home[0], home[1], home[2]))) continue;
      const c = F.Gc.cellOf(home), h = Math.max(0, F.G.sample(F.s.h, home));
      const clim = { T: F.s.Tsea[c] - 273.15 - 0.0065 * h, P: F.s.P[c] };
      const sp = speciesFor(realmOf(F, F.s.realm ? F.s.realm[c] : -1), lv, clim, luck);
      if (!sp) continue;
      // (its tangent frame: east and north at its home; dry ground all round it, where it spreads)
      const E = Math.abs(home[1]) > 0.99 ? norm(cross([1, 0, 0], home)) : norm(cross([0, 1, 0], home)), N = cross(home, E);
      const size = Math.max(1, Math.round(sp.herd * (0.5 + sizeLuck))), rr = sp.design.len * (2.5 + 1.7 * Math.sqrt(size));
      let wetAround = false;
      for (const [ex, nz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (b.isWaterAt(_hv.set(home[0] * R + (E[0] * ex + N[0] * nz) * rr, home[1] * R + (E[1] * ex + N[1] * nz) * rr, home[2] * R + (E[2] * ex + N[2] * nz) * rr))) { wetAround = true; break; }
      if (wetAround) continue;
      list.push({ id: `${lv}:${i},${j},${k}:${m}`, level: lv, sp, n: size, home, E, N, roam: ROAM[lv], key, spots: new Map() });
    }
  }
  // its flocks: small flyers' over the land (a share of the country's grazing a km2, by its plants), the
  // big ones' fewer and alone
  for (const big of [false, true]) {
    const rnd = stream(hash3i(i, j, k, (F.seed ^ (big ? 0x7f4a7c15 : 0x2c1b3c6d)) >>> 0));
    const cx = (i + 0.5) * C, cy = (j + 0.5) * C, cz = (k + 0.5) * C, cl = Math.hypot(cx, cy, cz);
    d[0] = cx / cl; d[1] = cy / cl; d[2] = cz / cl;
    const c0 = F.Gc.cellOf(d), R0 = realmOf(F, F.s.realm ? F.s.realm[c0] : -1);
    const fls = R0.species.filter((sp) => sp.flyer && (sp.design.size === 'large') === big);
    if (!fls.length) continue;
    const lam = (big ? 0.1 : 3 * Math.min(1.5, Math.max(0.2, F.Gc.sample(F.eco.npp, d) / 600))) * C * C / 1e6;
    let n = 0;
    for (let L = Math.exp(-Math.min(lam, 30)), q = rnd(); q > L && n < 8; q *= rnd()) n++;
    for (let m = 0; m < n; m++) {
      const x = (i + rnd()) * C, y = (j + rnd()) * C, z = (k + rnd()) * C, r = Math.hypot(x, y, z);
      const pick = rnd(), key = (rnd() * 4294967296) >>> 0, size = rnd();
      if (Math.abs(r - R) > C * 0.5) continue;
      const home = [x / r, y / r, z / r];
      const sp = fls[Math.floor(pick * fls.length) % fls.length];
      const E = Math.abs(home[1]) > 0.99 ? norm(cross([1, 0, 0], home)) : norm(cross([0, 1, 0], home)), N = cross(home, E);
      list.push({ id: `f${big ? 1 : 0}:${i},${j},${k}:${m}`, flyer: true, level: 0, sp, n: Math.max(1, Math.round(sp.herd * (0.5 + size))), home, E, N, roam: big ? 400 : 250, key, spots: new Map() });
    }
  }
  return list;
}
const _hv = new THREE.Vector3(), _sv = new THREE.Vector3();
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]); return [a[0] / l, a[1] / l, a[2] / l]; };

// a herd's k-th grazing spot, metres east and north of its home: its wander (each step a hash's),
// pulled in toward home where it would stand in water
function spot(b, h, k) {
  let s = h.spots.get(k);
  if (s) return s;
  let x = 0, z = 0, w = 1;
  const c = h.roam * 0.5 * Math.sqrt(1 - AR * AR) * Math.sqrt(3);
  for (let j = 0; j < AR_N; j++, w *= AR) {
    const hh = fmix32((h.key ^ Math.imul((k - j) | 0, 0x2545f491)) >>> 0);
    x += w * c * ((hh & 0xffff) / 32768 - 1); z += w * c * ((hh >>> 16) / 32768 - 1);
  }
  const l = Math.hypot(x, z);
  if (l > h.roam) { x *= h.roam / l; z *= h.roam / l; }
  // (dry ground under all of the herd as it spreads there, and half way back to home: pulled in toward
  // home till it is; a flock's anywhere)
  const R = b.R, wet = (px, pz) => b.isWaterAt(_sv.set(h.home[0] * R + h.E[0] * px + h.N[0] * pz, h.home[1] * R + h.E[1] * px + h.N[1] * pz, h.home[2] * R + h.E[2] * px + h.N[2] * pz));
  const D = h.sp.design, rH = h.flyer ? 0 : D.len * (1.5 + 1.7 * Math.sqrt(h.n)) + D.len;
  for (let t = 0; t < 5; t++) {
    if (h.flyer ? !wet(x, z) : !(wet(x, z) || wet(x + rH, z) || wet(x - rH, z) || wet(x, z + rH) || wet(x, z - rH) || wet(x * 0.5, z * 0.5))) break;
    if (t === 4) { x = 0; z = 0; break; }
    x *= 0.45; z *= 0.45;
  }
  s = [x, z];
  if (h.spots.size > 8) h.spots.clear();
  h.spots.set(k, s);
  return s;
}

// where a herd is at world time t (s): out.x, out.z metres east and north of its home, out.moving,
// out.speed (m/s), out.hx, out.hz its heading. It grazes a spot through the start of its leg and walks on
// to the next through the end (at its walk, or faster where the next is far: a trot)
export function herdAt(b, h, t, out) {
  const k = Math.floor(t / SEG), f = t - k * SEG, a = spot(b, h, k), c = spot(b, h, k + 1);
  const dx = c[0] - a[0], dz = c[1] - a[1], dist = Math.hypot(dx, dz), D = h.sp.design;
  const speed = Math.max(D.walk * (h.sp.cold ? 0.7 : 1), dist / (0.8 * SEG)), moveT = dist / speed, t0 = SEG - moveT;
  out.hx = dist > 0 ? dx / dist : 0; out.hz = dist > 0 ? dz / dist : 1;
  if (f < t0 || dist < 0.5) { out.x = a[0]; out.z = a[1]; out.moving = false; out.speed = 0; }
  else { const u = (f - t0) / moveT; out.x = a[0] + dx * u; out.z = a[1] + dz * u; out.moving = true; out.speed = speed; }
  return out;
}

// where a herd's i-th animal is at world time t, metres east and north of its home: following the
// herd's path (each a few body lengths behind the one before it: a file on the move), milling round
// its centre while it grazes (a step or two to a spot of its own each ~12 s, then grazing there).
// out.graze: its head down
export function memberAt(b, h, i, t, out) {
  const D = h.sp.design, lag = i * D.len * 1.6 / Math.max(D.walk, 0.1);
  herdAt(b, h, t - lag, out);
  // (its own place in the herd, evenly spread on a sunflower's spiral a couple of body lengths apart,
  // and a spot near it it steps to every ~12 s)
  const rH = D.len * (1.5 + 1.7 * Math.sqrt(h.n)), gap = rH / Math.sqrt(h.n);
  const a = i * 2.39996 + (h.key & 1023) / 163, rr = rH * Math.sqrt((i + 0.5) / h.n);
  const P = 12, kk = Math.floor(t / P), u = Math.min(1, (t / P - kk) / 0.3), e = u * u * (3 - 2 * u);
  const p0 = mill(h.key, i, kk), p1 = mill(h.key, i, kk + 1);
  const k = out.moving ? 0.25 : 1;
  out.x += k * (rr * Math.cos(a) + 0.4 * gap * (p0[0] + (p1[0] - p0[0]) * e)); out.z += k * (rr * Math.sin(a) + 0.4 * gap * (p0[1] + (p1[1] - p0[1]) * e));
  // (its head down most of a grazing spell, up a few seconds in ten to look round)
  const vh = fmix32((h.key ^ Math.imul(i + 1, 0x68e31da4) ^ Math.imul(Math.floor(t / 5), 0x1b873593)) >>> 0);
  out.graze = !out.moving && (vh & 0xff) > 70 ? 1 : 0;
  return out;
}
const mill = (key, i, k) => {
  const hh = fmix32((key ^ Math.imul(i + 7, 0x27d4eb2f) ^ Math.imul(k | 0, 0x165667b1)) >>> 0);
  const a = (hh & 0xffff) / 65536 * Math.PI * 2, r = Math.sqrt((hh >>> 16) / 65536);
  return [Math.cos(a) * r, Math.sin(a) * r];
};

// where a flock is at world time t: out.x, out.z (m east and north of its home), out.y (m over the ground
// under it), out.flap (0..1: beating or gliding). Small flyers fly a figure of eight over their country
// at their cruise, rising and dipping, beating in bursts and gliding between; a big one soars, circling
// on a thermal (its radius a few of its turning circles), drifting from one to the next, beating now
// and then
export function flockAt(b, f, t, out) {
  const D = f.sp.design, ph = (f.key & 0xffff) / 65536 * 6.283;
  if (D.soar) {
    const k = Math.floor(t / 240), u = t / 240 - k, e = u * u * (3 - 2 * u), a = spot(b, f, k), c = spot(b, f, k + 1);
    const Rc = 25 + 40 * ((f.key >>> 16) & 0xff) / 255, w = D.cruise / Rc;
    out.x = a[0] + (c[0] - a[0]) * e + Rc * Math.cos(w * t + ph); out.z = a[1] + (c[1] - a[1]) * e + Rc * Math.sin(w * t + ph);
    out.y = 90 + 60 * Math.sin(0.011 * t + ph) + 30 * ((f.key >>> 8) & 0xff) / 255;
    out.flap = Math.sin(0.05 * t + ph * 3) > 0.92 ? 1 : 0;
  } else {
    const A = f.roam, w = D.cruise / (A * 2.4);
    out.x = A * Math.sin(w * t + ph); out.z = 0.55 * A * Math.sin(2 * w * t + ph * 1.7);
    out.y = 18 + 14 * Math.sin(0.07 * t + ph) + 10 * ((f.key >>> 8) & 0xff) / 255;
    out.flap = Math.sin(D.flapHz * 0.15 * t + ph) > -0.4 ? 1 : 0;
  }
  return out;
}
// a flock's i-th flyer: out.x, out.y, out.z from the flock's place (a loose ball a few spans across, each
// weaving in it), and the same at t (each a beat behind the one before it)
export function flyerAt(b, f, i, t, out) {
  const D = f.sp.design;
  flockAt(b, f, t - i * 0.15, out);
  if (f.n > 1) {
    const s = D.span * (1.5 + 1.2 * Math.sqrt(f.n)), a = i * 2.39996 + (f.key & 1023) / 163, rr = s * Math.sqrt((i + 0.5) / f.n);
    const wv = 0.6 + 0.2 * (i % 5);
    out.x += rr * Math.cos(a) + 0.3 * s * Math.sin(wv * t + i);
    out.z += rr * Math.sin(a) + 0.3 * s * Math.cos(0.8 * wv * t + i * 2);
    out.y += 0.5 * rr * Math.sin(a * 1.7) + 0.2 * s * Math.sin(1.3 * wv * t + i);
  }
  return out;
}

// the round of a day (LIFE.md 4: no animal standing about the same at all hours): grazers out by day,
// most of all in the morning and the evening, resting through the night; hunters about at dusk, through
// the night and at dawn, lying up in the heat of the day; flyers by day. Activity by the local solar hour
// (0..24), 0..1
const ACTIVE = {
  grazer: (hr) => { const day = smooth01(hr, 5, 7) * (1 - smooth01(hr, 19, 21)); return 0.04 + 0.96 * day * (0.8 + 0.25 * (bump(hr, 7.5, 1.5) + bump(hr, 18, 1.5))); },
  hunter: (hr) => { const night = 1 - smooth01(hr, 7, 9) * (1 - smooth01(hr, 17, 19)); return 0.15 + 0.85 * Math.max(night, 0.6 * (bump(hr, 6, 1.2) + bump(hr, 19, 1.2))); },
  flyer: (hr) => smooth01(hr, 5.5, 7) * (1 - smooth01(hr, 18.5, 20)),
};
const smooth01 = (x, a, b) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const bump = (x, c, w) => { const z = (x - c) / w; return Math.exp(-z * z); };
// (each one's day added up, quarter hours: the active time's own clock, per 24 h of hours)
const CUM = {};
for (const [k, f] of Object.entries(ACTIVE)) { const c = new Float64Array(97); for (let i = 0; i < 96; i++) c[i + 1] = c[i] + f((i + 0.5) / 4) / 4; CUM[k] = c; }
const kindOf = (h) => (h.flyer ? 'flyer' : h.level >= 2 ? 'hunter' : 'grazer');

// a world's day now, from its spin and the sun (as the HUD's local time; world state: the same at the
// same world time for everyone): { t, lonS, sign, P (its solar day, s; 0 locked) }. Set every frame
export function dayClock(b, t) {
  const rot = b.data.rotation || {}, w = b.omega ? b.omega.length() : 0;
  if (rot.locked || !(w > 0)) return { t, P: 0 };
  const sunF = b.pos.clone().negate().normalize().applyQuaternion(b.qInv), sign = Math.sign(rot.rate || 1);
  // (its solar day, not its spin's: the sun comes round a little late each day as it goes along its orbit
  // (a moon its planet's): with the spin's, the hour pinned here drifts a day a year, and the herds' own
  // clocks jumped a day's walk as it came round)
  const host = b.data.kind === 'moon' && b.parent ? b.parent : b, n = host.data.orbit ? host.data.orbit.n || 0 : 0;
  const ws = Math.max(w * 0.05, w - sign * n);
  return { t, lonS: Math.atan2(sunF.z, sunF.x), sign, P: 2 * Math.PI / ws };
}
// the local solar hour at a herd's home at time t, unwrapped (hours since a world-fixed start)
function hourAt(clock, h, t) {
  const lonP = Math.atan2(h.home[2], h.home[0]);
  let hr0 = ((clock.lonS - lonP) / (2 * Math.PI)) * 24 * clock.sign + 12 - clock.t * 24 / clock.P;
  hr0 = ((hr0 % 24) + 24) % 24;
  return hr0 + t * 24 / clock.P;
}
// how active a herd's kind is at time t (0..1), and its active time: the seconds of its own clock, which
// runs at its activity (its path's: a herd stays put through its rest, and walks on where it was)
export function activityAt(clock, h, t) {
  if (!clock || !clock.P) return 1;
  const u = hourAt(clock, h, t);
  return ACTIVE[kindOf(h)](u - 24 * Math.floor(u / 24));
}
// (its mean pace times the time, and a day's swing about it: no count of days, so nothing jumps where the
// local hour's reckoning wraps; its rate the activity of the hour, exactly)
export function activeTime(clock, h, t) {
  if (!clock || !clock.P) return t;
  const u = hourAt(clock, h, t), hr = u - 24 * Math.floor(u / 24), C = CUM[kindOf(h)], mean = C[96] / 24;
  const q = hr * 4, i = Math.min(95, Math.floor(q)), part = C[i] + (C[i + 1] - C[i]) * (q - i);
  return mean * t + (clock.P / 24) * (part - hr * mean);
}
