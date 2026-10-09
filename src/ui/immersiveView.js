// The immersive pilot interface (the Horizon and Expedition fleets' pilot seats): V from the cockpit
// view takes the ship's walls away from the pilot's eyes, the whole sky and ground round them, and
// draws the hull's outline faint where it is, so they still know where their ship ends (landing,
// docking, threading a hangar). It's the pilot's own view: anyone else (a split screen's other
// player, someone outside) sees the ship as it is, and it still casts its shadow.
import * as THREE from 'three';

export const hasImmersiveView = (t) => t.era === 'Horizon' || t.era === 'Expedition';
export const immersiveFor = (p) => p.camMode === 'immersive' && p.flying && hasImmersiveView(p.vessel.type);

// For one view: the vessel's own meshes off the camera's layer (the sun's shadow maps take casters
// whatever their layer: render/webgpu/shadows.js); what was hidden, to put back after the view.
export function hideFromView(v) {
  const hidden = [];
  v.visual?.model?.root?.traverse((o) => { if (o.isMesh && o.layers.isEnabled(0)) { o.layers.disable(0); hidden.push(o); } });
  return hidden;
}
export function restoreView(hidden) { for (const o of hidden) o.layers.enable(0); }

// The hull's outline in the vessel's frame, as segments [ax, ay, az, bx, by, bz, ...]: each skin's
// section at every station (or ring), and lines along it between them (tools/blender/exterior.py
// exports the skins: lofted squircles, (x/w)^4 + ((y-mid)/half)^4 = 1, or a mesh's section rings).
const outlines = new WeakMap();
export function hullOutline(t) {
  if (outlines.has(t)) return outlines.get(t);
  const seg = [];
  const line = (a, b) => seg.push(a[0], a[1], a[2], b[0], b[1], b[2]);
  for (const sk of t.skins || []) {
    let rings, along;
    if (sk.stations) {
      const n = 32;
      rings = sk.stations.map(([z, w, low, high]) => Array.from({ length: n }, (_, i) => {
        const c = Math.cos((i + 0.5) * Math.PI * 2 / n), s = Math.sin((i + 0.5) * Math.PI * 2 / n);
        return [sk.x + w * Math.sign(c) * Math.sqrt(Math.abs(c)), (low + high) / 2 + (high - low) / 2 * Math.sign(s) * Math.sqrt(Math.abs(s)), z];
      }));
      along = Array.from({ length: 8 }, (_, k) => k * 4);
    } else {
      rings = sk.rings.map(([z, pts]) => pts.map(([x, y]) => [x, y, z]));
      along = rings[0].map((_, i) => i);
    }
    for (const r of rings) r.forEach((p, i) => line(p, r[(i + 1) % r.length]));
    for (let k = 0; k + 1 < rings.length; k++) for (const i of along) line(rings[k][i], rings[k + 1][i]);
  }
  const out = new Float32Array(seg);
  outlines.set(t, out);
  return out;
}

const _o = new THREE.Vector3(), _x = new THREE.Vector3(), _y = new THREE.Vector3(), _z = new THREE.Vector3(), _q = new THREE.Quaternion();
const _a = new THREE.Vector3(), _b = new THREE.Vector3();
// (fading with distance: four strengths, one path each)
const LEVELS = 4;

// Drawn on the player's HUD (ui/hud.js draw), under everything else on it.
export function drawImmersive(hud, v) {
  const g = hud.game, ctx = hud.ctx, cam = g.engine.camera, t = v.type;
  const seg = hullOutline(t);
  // (the vessel's frame in the camera's: its origin and axes)
  const qi = _q.copy(g.camQuat).invert();
  v.localToWorld(_o.set(0, 0, 0), _o);
  v.localToWorld(_x.set(1, 0, 0), _x).sub(_o).applyQuaternion(qi);
  v.localToWorld(_y.set(0, 1, 0), _y).sub(_o).applyQuaternion(qi);
  v.localToWorld(_z.set(0, 0, 1), _z).sub(_o).applyQuaternion(qi);
  _o.sub(g.camPos).applyQuaternion(qi);
  const tan = Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2), sx = 0.5 * hud.w / (tan * cam.aspect), sy = 0.5 * hud.h / tan, cx = hud.w / 2, cy = hud.h / 2;
  const toCam = (out, i) => out.copy(_o).addScaledVector(_x, seg[i]).addScaledVector(_y, seg[i + 1]).addScaledVector(_z, seg[i + 2]);
  const size = Math.max(10, ...(t.size || [10])), NEAR = -0.05;
  const paths = Array.from({ length: LEVELS }, () => new Path2D());
  for (let i = 0; i < seg.length; i += 6) {
    const a = toCam(_a, i), b = toCam(_b, i + 3);
    if (a.z > NEAR && b.z > NEAR) continue;
    if (a.z > NEAR) a.lerp(b, (NEAR - a.z) / (b.z - a.z));
    else if (b.z > NEAR) b.lerp(a, (NEAR - b.z) / (a.z - b.z));
    // (the near hull plain, the far end of a long ship fainter)
    const d = Math.min(a.length(), b.length()), k = Math.min(LEVELS - 1, Math.floor(LEVELS * d / (size * 1.2)));
    paths[k].moveTo(cx + sx * a.x / -a.z, cy - sy * a.y / -a.z);
    paths[k].lineTo(cx + sx * b.x / -b.z, cy - sy * b.y / -b.z);
  }
  ctx.save();
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#8fe6ff';
  paths.forEach((path, k) => { ctx.globalAlpha = 0.42 * (1 - k / LEVELS); ctx.stroke(path); });
  // the feet, where the gear is down: where the ship will stand
  if (v.legAttach && v.gear > 0.05) {
    ctx.globalAlpha = 0.75; ctx.strokeStyle = '#6ade8f';
    const drop = v.legLength * v.gear;
    for (const f of v.legAttach) {
      const p = _a.copy(_o).addScaledVector(_x, f.x).addScaledVector(_y, f.y - drop).addScaledVector(_z, f.z);
      if (p.z > NEAR) continue;
      const x = cx + sx * p.x / -p.z, y = cy - sy * p.y / -p.z;
      ctx.beginPath(); ctx.moveTo(x - 5, y); ctx.lineTo(x + 5, y); ctx.moveTo(x, y - 5); ctx.lineTo(x, y + 5); ctx.stroke();
    }
  }
  ctx.restore();
}
