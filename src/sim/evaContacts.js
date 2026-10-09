import * as THREE from 'three';

const RADIUS = 0.3, SKIN = 0.002;
// EVA position is the eye. Four overlapping balls cover the suit below it.
const PROBES = [-1.38, -0.94, -0.5, -0.06];
const hollowHulls = new WeakMap();

// Some older exterior hulls are filled boxes. Where an authored hold has its
// own interior walls, cut that empty space out before using the hull for EVA.
// Keep the moving door slabs: opening a ramp must never remove a closed door.
// (near: an optional box {min, max}, in the ship's frame: only the colliders that might touch it,
// from a grid over a big ship's thousands)
export function evaColliders(v, near = null) {
  const t = v.type, all = v.colliders();
  // (a hull built with its own outside collision, solid but where it's open: that and the rest)
  if (t.hullColliders) {
    if (!near) return t.hullColliders.concat(all);
    return nearBoxes(staticGrid(t, () => t.hullColliders.concat(t.colliders || [])), near).concat(all.slice((t.colliders || []).length));
  }
  if (!t.inner || !t.zones?.some(z => z.kind === 'hold')) return all;
  let hull = hollowHulls.get(t);
  if (!hull) {
    hull = t.colliders;
    for (const cut of t.zones.filter(z => z.kind === 'hold')) hull = hull.flatMap(box => {
      if (box.min.some((x, i) => x >= cut.max[i] || box.max[i] <= cut.min[i])) return [box];
      const core = {min:[...box.min], max:[...box.max]}, pieces = [];
      for (let i = 0; i < 3; i++) {
        if (core.min[i] < cut.min[i]) {
          const piece = {min:[...core.min], max:[...core.max]};piece.max[i] = cut.min[i];pieces.push(piece);core.min[i] = cut.min[i];
        }
        if (core.max[i] > cut.max[i]) {
          const piece = {min:[...core.min], max:[...core.max]};piece.min[i] = cut.max[i];pieces.push(piece);core.max[i] = cut.max[i];
        }
      }
      return pieces;
    });
    hull = [...hull, ...t.inner];
    hollowHulls.set(t, hull);
  }
  return [...hull, ...all.slice(t.colliders.length)];
}

// A uniform grid over a ship's fixed boxes (its doors' slabs move, and are added as they stand)
const GRID_CELL = 8, grids = new WeakMap();
function staticGrid(t, list) {
  let g = grids.get(t);
  if (g) return g;
  const boxes = list(), cells = new Map();
  if (boxes.length > 200) boxes.forEach((b, n) => {
    const lo = b.min.map(x => Math.floor(x / GRID_CELL)), hi = b.max.map(x => Math.floor(x / GRID_CELL));
    for (let i = lo[0]; i <= hi[0]; i++) for (let j = lo[1]; j <= hi[1]; j++) for (let k = lo[2]; k <= hi[2]; k++) {
      const key = `${i},${j},${k}`; let c = cells.get(key); if (!c) cells.set(key, c = []); c.push(n);
    }
  });
  grids.set(t, g = { boxes, cells, small: boxes.length <= 200, stamp: new Uint32Array(boxes.length), mark: 0 });
  return g;
}
function nearBoxes(g, near) {
  if (g.small) return g.boxes.slice();
  const out = [], m = ++g.mark;
  const lo = near.min.map(x => Math.floor(x / GRID_CELL)), hi = near.max.map(x => Math.floor(x / GRID_CELL));
  for (let i = lo[0]; i <= hi[0]; i++) for (let j = lo[1]; j <= hi[1]; j++) for (let k = lo[2]; k <= hi[2]; k++) {
    const c = g.cells.get(`${i},${j},${k}`);
    if (c) for (const n of c) if (g.stamp[n] !== m) { g.stamp[n] = m; out.push(g.boxes[n]); }
  }
  return out;
}

// Sweep against the same authored boxes used by spacecraft contacts. Sweeping
// prevents a fast astronaut from tunnelling through a thin hull between frames.
function hitBox(start, delta, box, offset) {
  const p = start.clone().add(offset), d = delta.clone();
  const angle = box.angle || 0, c = Math.cos(angle), s = Math.sin(angle);
  if (angle) {
    const y = p.y - box.hinge[0], z = p.z - box.hinge[1];
    p.y = box.hinge[0] + y*c + z*s; p.z = box.hinge[1] - y*s + z*c;
    const dy = d.y; d.y = dy*c + d.z*s; d.z = -dy*s + d.z*c;
  }
  let enter = -Infinity, leave = Infinity, axis = 0, sign = 1;
  let inside = true, depth = Infinity, pushAxis = 0, pushSign = 1;
  for (let i = 0; i < 3; i++) {
    const lo = box.min[i] - RADIUS, hi = box.max[i] + RADIUS;
    const x = p.getComponent(i), v = d.getComponent(i);
    if (x <= lo || x >= hi) inside = false;
    if (x-lo < depth) { depth = x-lo; pushAxis=i; pushSign=-1; }
    if (hi-x < depth) { depth = hi-x; pushAxis=i; pushSign=1; }
    if (Math.abs(v) < 1e-12) { if (x < lo || x > hi) return null; continue; }
    const a = (lo-x)/v, b = (hi-x)/v, near = Math.min(a,b);
    if (near > enter) { enter=near; axis=i; sign=v>0?-1:1; }
    leave = Math.min(leave, Math.max(a,b));
  }
  if (!inside && (enter < 0 || enter > 1 || leave < enter)) return null;
  const normal = new THREE.Vector3().setComponent(inside?pushAxis:axis, inside?pushSign:sign);
  if (angle) { const y=normal.y, z=normal.z; normal.y=y*c-z*s; normal.z=y*s+z*c; }
  return {t:inside?0:enter, depth:inside?depth:0, normal};
}

export function sweepSuit(start, end, up, boxes) {
  const p=start.clone(), remaining=end.clone().sub(start), normals=[];
  for (let pass=0; pass<6; pass++) {
    let first=null;
    for (const offset of PROBES) for (const box of boxes) {
      const hit=hitBox(p,remaining,box,up.clone().multiplyScalar(offset));
      if (hit && (!first || hit.t < first.t || (hit.t===first.t && hit.depth>first.depth))) first=hit;
    }
    if (!first) { p.add(remaining); break; }
    p.addScaledVector(remaining,first.t).addScaledVector(first.normal,first.depth+SKIN);
    remaining.multiplyScalar(1-first.t);
    const into=remaining.dot(first.normal);
    if (into<0) remaining.addScaledVector(first.normal,-into);
    normals.push(first.normal);
  }
  return {pos:p,normals};
}

export function collideEva(player, dt) {
  for (const v of player.game.vessels) {
    if (v.dead || v.body!==player.body || v.type.frameOnly) continue;
    const qi=v.quat.clone().invert(), end=v.bodyToLocal(player.ePos,new THREE.Vector3());
    const surfaceVelocity=v.pointVelocity(end,new THREE.Vector3());
    const relative=player.eVel.clone().sub(surfaceVelocity).applyQuaternion(qi);
    if (end.length() > v.type.radius+2+relative.length()*dt) continue;
    const start=end.clone().addScaledVector(relative,-dt);
    // (the boxes near the sweep: the suit's probes reach 1.4 m below the eye, its balls 0.3 m round)
    const reach=2;
    const boxes=evaColliders(v,{min:[0,1,2].map(i=>Math.min(start.getComponent(i),end.getComponent(i))-reach),max:[0,1,2].map(i=>Math.max(start.getComponent(i),end.getComponent(i))+reach)});
    if (!boxes.length) continue;
    const up=new THREE.Vector3(0,1,0).applyQuaternion(player.evaQuat).applyQuaternion(qi);
    const contact=sweepSuit(start,end,up,boxes);
    if (!contact.normals.length) continue;
    for (const normal of contact.normals) {
      const speed=relative.dot(normal);
      if (speed<0) relative.addScaledVector(normal,-speed);
    }
    player.ePos.copy(contact.pos).applyQuaternion(v.quat).add(v.pos);
    player.eVel.copy(relative).applyQuaternion(v.quat).add(v.pointVelocity(contact.pos,new THREE.Vector3()));
  }
}
