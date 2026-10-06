// Dev-only: looking at a world's animals in a browser test (not loaded by the game).
// In the page:  const C = await import('/tools/faunacam.js'); await C.toHerds(); await C.atHerd(1, 6);
// (after testkit's ready()). toHerds() stands you on land near the start where the food web's grazers
// are thick; atHerd(level, dist) by the nearest herd of a level; atFlock(dist) floats a free camera by
// the nearest flock, looking at it; list() the herds and flocks about.
import { faunaOf, herdsNear, herdAt, flyerAt, realmOf, activeTime } from '/src/sim/fauna.js';

const g = () => window.game;
const B = () => g().player.currentBody();
export const fauna = () => faunaOf(B());
export function terrain() { for (const it of g().world.items.values ? g().world.items.values() : g().world.items) if (it.body === B() && it.terrain) return it.terrain; return null; }
export function tame(on = true) { const t = terrain(); if (t && t.faunaSet) t.faunaSet.tame = on; }
const here = () => { const p = g().player, b = B(); return p.mode === 'surface' ? p.fPos.clone() : (p.mode === 'eva' ? p.ePos.clone() : g().ship.pos.clone()).applyQuaternion(b.qInv); };

// the herds and flocks within reach of you, nearest first: { h, c (body-fixed centre), d, y }
export function list(reach = 1400) {
  const b = B(), F = fauna(), V = b.pos.constructor, t = g().universe.t, o = {}, at = here();
  if (!F) return [];
  return herdsNear(F, b, at, reach, []).map((h) => {
    if (h.flyer) flyerAt(b, h, 0, t, o); else herdAt(b, h, activeTime(F.clock, h, t), o);
    const c = new V().fromArray(h.home).multiplyScalar(b.R).addScaledVector(new V().fromArray(h.E), o.x).addScaledVector(new V().fromArray(h.N), o.z);
    return { h, c, d: c.distanceTo(at), y: o.y || 0 };
  }).sort((a, c) => a.d - c.d);
}
// stand on the land with grazers at least `dens` a km2 nearest where you are
export async function toHerds(dens = 30) {
  const p = g().player, b = B(), V = b.pos.constructor, F = fauna(), start = here().normalize(), d = [0, 0, 0];
  let best = -1, bd = -2;
  for (let c = 0; c < F.Gc.n; c++) { if (!(F.eco.dens[0][c] > dens) || (F.s.realm && F.s.realm[c] < 0)) continue; F.Gc.centre(c, d); const dot = d[0] * start.x + d[1] * start.y + d[2] * start.z; if (dot > bd) { bd = dot; best = c; } }
  F.Gc.centre(best, d);
  const dir = new V(...d);
  g().debugFree = false;
  p.placeOnSurface(b, dir, new V(0, 1, 0).cross(dir).normalize());
  await window.debugRun(4000, 16);
  return { realm: realmOf(F, F.s.realm ? F.s.realm[best] : -1).name, dens: Math.round(F.eco.dens[0][best]) };
}
// stand dist m from the k-th nearest herd of a level (side: radians round it), looking at it
export async function atHerd(level = 1, dist = 6, k = 0, side = 0, pitch = -0.15, settle = 6000) {
  const p = g().player, b = B(), V = b.pos.constructor, L = list().filter((x) => !x.h.flyer && x.h.level === level);
  if (!L[k]) return 'none';
  const { h, c } = L[k], E = new V().fromArray(h.E), N = new V().fromArray(h.N);
  const away = E.clone().multiplyScalar(Math.cos(side)).addScaledVector(N, Math.sin(side));
  g().debugFree = false;
  p.placeOnSurface(b, c.clone().addScaledVector(away, -dist), away.clone());
  p.pitch = pitch;
  await window.debugRun(settle, 16);
  return describe(h);
}
// a free camera dist m from the k-th nearest flock, a little below it, looking at it
export async function atFlock(dist = 8, k = 0, settle = 3000, big = null) {
  const b = B(), V = b.pos.constructor, L = list().filter((x) => x.h.flyer && (big == null || (x.h.sp.design.size === 'large') === big));
  if (!L[k]) return 'none';
  const { h } = L[k], fc = g().freecam, M = new (await import('three')).Matrix4();
  const aim = () => {
    const o = {}, t = g().universe.t;
    flyerAt(b, h, 0, t, o);
    const up = new V().fromArray(h.home).multiplyScalar(b.R).addScaledVector(new V().fromArray(h.E), o.x).addScaledVector(new V().fromArray(h.N), o.z).normalize();
    const c = up.clone().multiplyScalar(b.R + Math.max(0, b.groundHeight(up)) + o.y);
    const side = new V().fromArray(h.N);
    const eye = c.clone().addScaledVector(side, -dist).addScaledVector(up, -dist * 0.3);
    fc.ref = b; fc.posF.copy(eye);
    M.lookAt(eye, c, up); fc.quatF.setFromRotationMatrix(M);
  };
  g().debugFree = true;
  aim();
  await window.debugRun(settle, 16, () => { aim(); });
  return describe(h);
}
export function describe(h) {
  const sp = h.sp, D = sp.design, t = terrain();
  return { name: sp.name, role: sp.role, realm: realmOf(fauna(), sp.realm).name, n: h.n, kg: +sp.massKg.toFixed(2), size: +(D.span || D.len).toFixed(2), habitat: sp.habitat, drawn: t && t.faunaSet ? t.faunaSet.count : 0 };
}
// a free camera following the k-th nearest herd of a level from dist m off at eye height (it walks on as
// the terrain loads round it); side: radians round it
export async function watchHerd(level = 1, dist = 7, k = 0, side = 0, settle = 6000, eye = 1.4) {
  const b = B(), V = b.pos.constructor, L = list().filter((x) => !x.h.flyer && x.h.level === level);
  if (!L[k]) return 'none';
  const { h } = L[k], fc = g().freecam, M = new (await import('three')).Matrix4();
  const E = new V().fromArray(h.E), N = new V().fromArray(h.N);
  // (a side of it on dry ground to watch from)
  let away = null;
  { const o = {}; herdAt(b, h, activeTime(fauna().clock, h, g().universe.t), o); const c0 = new V().fromArray(h.home).multiplyScalar(b.R).addScaledVector(E, o.x).addScaledVector(N, o.z);
    for (let k = 0; k < 12 && !away; k++) { const a = side + k * Math.PI / 6, w = E.clone().multiplyScalar(Math.cos(a)).addScaledVector(N, Math.sin(a)); if (!b.isWaterAt(c0.clone().addScaledVector(w, -dist))) away = w; } }
  if (!away) away = E.clone();
  const aim = () => {
    const o = {}, t = g().universe.t;
    herdAt(b, h, activeTime(fauna().clock, h, t), o);
    const c = new V().fromArray(h.home).multiplyScalar(b.R).addScaledVector(E, o.x).addScaledVector(N, o.z);
    const up = c.clone().normalize(), at = up.clone().multiplyScalar(b.R + b.groundHeight(up) + h.sp.design.hipH);
    const e0 = c.clone().addScaledVector(away, -dist), eu = e0.clone().normalize();
    const eyeP = eu.clone().multiplyScalar(b.R + Math.max(0.3, b.groundHeight(eu)) + eye);
    fc.ref = b; fc.posF.copy(eyeP);
    M.lookAt(eyeP, at, up); fc.quatF.setFromRotationMatrix(M);
  };
  g().debugFree = true;
  aim();
  await window.debugRun(settle, 16, () => { aim(); });
  return describe(h);
}
