// Dev-only: framed screenshots for comparing worlds (a hidden test tab, with tools/testkit.js).
// A whole planet from space, side-lit; and scenic views of a landmark from a few km off, the sun
// low and behind the camera's shoulder. Time is held still (game.t pinned: it drives universe.update) while tiles load.
//
//   const S = await import('/tools/scenic.js'); S.setup();
//   await S.waitWorld(id);                       // its world sim and refinement (moved to the front)
//   await S.orbit(id, 3.2, 70); await S.drain(30); await S.shot('name');
//   await S.view(id, lat, lon, { dist: 8000, agl: 30, elev: 14 }); await S.drain(40); await S.shot('name2');
//
// shot() posts the canvas to a local receiver on 127.0.0.1:8799 (scratchpad shot_server.py).
import * as THREE from 'three';

const g = () => window.game;
const d2r = Math.PI / 180;
// (the pinned time on window: a re-imported copy of this module shares it with the frame hook)
const pin = () => window._scenicT ?? null, setPin = (t) => { window._scenicT = t; };

export function setup() {
  const gm = g();
  if (!gm._scenicFrame) {
    gm._scenicFrame = true;
    const f0 = gm.frame;
    gm.frame = function (t) { if (window._scenicT != null) { this.t = window._scenicT; this.universe.update(this.t); } window._scenicClouds && window._scenicClouds(); return f0.call(this, t); };
  }
  document.getElementById('hud').hidden = true;
  gm.debugFree = true;
}

export function body(id) { return g().universe.bodies.find((b) => b.data.id === id); }
const dirOf = (lat, lon) => new THREE.Vector3(Math.cos(lat * d2r) * Math.cos(lon * d2r), Math.sin(lat * d2r), Math.cos(lat * d2r) * Math.sin(lon * d2r));
const frameAt = (up) => {
  const north = new THREE.Vector3(0, 1, 0).addScaledVector(up, -up.y);
  if (north.lengthSq() < 1e-8) north.set(1, 0, 0).addScaledVector(up, -up.x);
  north.normalize();
  return { north, east: new THREE.Vector3().crossVectors(north, up).normalize() };
};

// its world sim and refinement to the front of the queue; resolves when both are ready
export async function waitWorld(id, maxS = 240) {
  const ws = g().worldSims, t0 = performance.now();
  ws.request(id);
  for (;;) {
    const q = ws.queue, mine = q.filter((j) => j.id === id), rest = q.filter((j) => j.id !== id);
    if (mine.length) { q.length = 0; q.push(...mine, ...rest); ws._next(); }
    const st = ws.status.get(id), r = ws.refine.get(id);
    if (st === 'ready' && r && r.status === 'ready') return { s: Math.round((performance.now() - t0) / 1000) };
    if (performance.now() - t0 > maxS * 1000) return { timeout: true, st, ref: r && [r.done, r.total, r.status] };
    await window.debugRun(2000, 16);
  }
}

// the sun at body-fixed direction up, at time t: elevation and azimuth (deg, from north to east)
export function sunAt(b, up, t) {
  const q = b.orientationAt(t, new THREE.Quaternion());
  const sunW = g().universe.star.pos.clone().sub(b.pos).normalize();
  const s = sunW.applyQuaternion(q.invert());
  const { north, east } = frameAt(up);
  return { elev: Math.asin(THREE.MathUtils.clamp(s.dot(up), -1, 1)) / d2r, az: Math.atan2(s.dot(east), s.dot(north)) / d2r };
}
// the next time (from now, within a day) the sun stands elevDeg up at up, rising (or setting)
export function findTime(b, up, elevDeg, setting = false) {
  const t0 = g().universe.t, rot = b.data.rotation, day = rot && rot.rate ? 2 * Math.PI / Math.abs(rot.rate) : 86400;
  const step = day / 2000;
  let prev = sunAt(b, up, t0).elev;
  for (let k = 1; k <= 2000; k++) {
    const t = t0 + k * step, e = sunAt(b, up, t).elev;
    if ((setting ? prev >= elevDeg && e < elevDeg : prev <= elevDeg && e > elevDeg)) return t;
    prev = e;
  }
  return t0;
}

// the whole planet from distR of its radii out, the sun sunDeg round from behind the camera
// (0: full disc lit, 90: half)
export function orbit(id, distR = 3.2, sunDeg = 70, t = null) {
  const gm = g(), b = body(id);
  if (t != null) setPin(t); else if (pin() == null) setPin(gm.universe.t);
  gm.t = pin(); gm.universe.update(gm.t); gm.frame(performance.now());
  const toSun = gm.universe.star.pos.clone().sub(b.pos).normalize();
  const axis = new THREE.Vector3(0, 1, 0).addScaledVector(toSun, -toSun.y).normalize().cross(toSun).normalize().cross(toSun).normalize();
  const dir = toSun.clone().applyAxisAngle(axis.lengthSq() > 0.5 ? axis : new THREE.Vector3(0, 1, 0), sunDeg * d2r).addScaledVector(new THREE.Vector3(0, 1, 0), 0.25).normalize();
  gm.camPos.copy(b.pos).addScaledVector(dir, b.R * distR);
  gm.camQuat.setFromRotationMatrix(new THREE.Matrix4().lookAt(gm.camPos, b.pos, new THREE.Vector3(0, 1, 0)));
  gm.freecam.setRef(b);
  gm.engine.adaptReset = true;
  return { alt_km: Math.round(b.R * (distR - 1) / 1000) };
}

// a landmark at (lat, lon) seen from dist m off, agl m above the ground, the sun elev deg up and
// side deg off straight behind the camera (130: over the shoulder); pitch toward the target's top
// (o.from: the camera's side of the target, deg from north to east; then the morning or the
// evening, whichever puts the sun further behind the camera)
export function view(id, lat, lon, o = {}) {
  const gm = g(), b = body(id), { dist = 8000, agl = 30, elev = 14, side = 130, setting = false, lift = 0 } = o;
  const tgt = dirOf(lat, lon);
  if (o.from != null && o.t == null) {
    const look = o.from + 180, off = (a) => Math.abs(((a - look) % 360 + 540) % 360 - 180);
    const tr = findTime(b, tgt, elev, false), ts = findTime(b, tgt, elev, true);
    setPin(off(sunAt(b, tgt, tr).az) >= off(sunAt(b, tgt, ts).az) ? tr : ts);
  } else setPin(o.t ?? findTime(b, tgt, elev, setting));
  gm.t = pin(); gm.universe.update(gm.t);
  const sun = sunAt(b, tgt, pin());
  // (looking along heading H, the sun side deg round from it; the camera dist behind the target)
  const H = (o.from != null ? o.from + 180 : sun.az + side) * d2r, { north, east } = frameAt(tgt);
  const back = north.clone().multiplyScalar(-Math.cos(H)).addScaledVector(east, -Math.sin(H));
  const cam = tgt.clone().addScaledVector(back, dist / b.R).normalize();
  const cf = frameAt(cam), to = tgt.clone().sub(cam);
  const head = Math.atan2(to.dot(cf.east), to.dot(cf.north)) / d2r;
  const hT = b.groundHeight(tgt.clone()), hC = b.groundHeight(cam.clone());
  const pitch = Math.atan2(hT + lift - (hC + agl), dist) / d2r;
  gm.debugFree = true;
  gm.freecam.placeAt(b, Math.asin(cam.y) / d2r, Math.atan2(cam.z, cam.x) / d2r, agl, head, pitch);
  return { sunElev: +sun.elev.toFixed(1), head: Math.round(head), pitch: +pitch.toFixed(1), hTarget: Math.round(hT), hCam: Math.round(hC) };
}

// run frames until the terrain under the camera is in (tiles and chunks), up to maxS seconds
export async function drain(maxS = 30) {
  const gm = g(), t0 = performance.now(), b = gm.universe.dominantBody(gm.camPos);
  const it = gm.world.items.find((i) => i.body === b) || gm.world.items.find((i) => i.body && i.body.data === b.data);
  const pt = it && it.terrain;
  do { await window.debugRun(2000, 16); } while ((gm.pool.pending.size || (pt && pt.pendingCount) || (gm.tiles && (gm.tiles.missing || gm.tiles.pending.size))) && performance.now() - t0 < maxS * 1000);
  return { pool: gm.pool.pending.size, chunks: pt ? pt.pendingCount : -1, tiles: gm.tiles ? gm.tiles.missing : -1, s: Math.round((performance.now() - t0) / 1000) };
}
export const settled = (d) => !d.pool && d.chunks <= 0 && !d.tiles;

// clouds off (true) or on for a body's atmosphere, kept each frame
export function clouds(id, on) {
  window._scenicClouds = () => {
    const it = g().world.items.find((i) => i.body && i.body.data && i.body.data.id === id);
    if (!it) return;
    const v = on ? 1 : 0;
    if (it.atmo && it.atmo.material.uniforms.uCloudOn) it.atmo.material.uniforms.uCloudOn.value = v;
    const fu = it.terrain && it.terrain.floraSet && it.terrain.floraSet.material.uniforms;
    if (fu && fu.uCloudOn) fu.uCloudOn.value = v;
    if (it.volume) it.volume.material.uniforms.uNumDecks.value = v;
  };
}

export async function shot(name, q = 0.9) {
  const gm = g(), cv = (gm.renderer || gm.engine.renderer).domElement;
  await window.debugRun(1500, 16);
  gm.frame(performance.now());
  const url = cv.toDataURL('image/jpeg', q);
  const r = await fetch('http://127.0.0.1:8799/', { method: 'POST', body: name + '|' + url });
  return r.text();
}

export function landmarks(id) {
  const s = body(id).data.terrain.snapshot;
  return (s && s.landmarks || []).map((l) => ({ kind: l.kind, name: l.name, text: l.text, lat: +l.lat.toFixed(3), lon: +l.lon.toFixed(3) }));
}
