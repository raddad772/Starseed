// The velocity markers (Dave: "an empty circle or crosshair that is on a virtual 360 sphere around
// you ... And a solid circle can show the opposite of the direction, so you can burn against your
// velocity"): where you're going, prograde (an empty circle with three ticks), and its opposite,
// retrograde (a solid disc), each drawn on the sky round you as a direction, not a place. In view, on
// it; off the screen, or behind you, pinned to the screen's edge with an arrow the way to turn to it.
// Point the nose at the solid disc and burn to slow. Beside prograde, what the speed is against and how
// much: TGT a targeted craft within 50 km (closing to dock), SHIP the craft a spacewalker left, SRF the
// ground near a world (its air and its turning carry you), ORB the orbit about it.
import * as THREE from 'three';
import * as U from '../core/units.js';

const TGT_RANGE = 50000;
const _q = new THREE.Quaternion(), _d = new THREE.Vector3(), _u = new THREE.Vector3(), _w = new THREE.Vector3();
const _p = { x: 0, y: 0, a: 0, edge: false }, _r = { x: 0, y: 0, a: 0, edge: false };

// the velocity the markers show (world axes, into out) and what it's against
export function markerVelocity(g, out) {
  const p = g.player, s = g.focus, tgt = g.target;
  const eva = p.mode === 'eva';
  // (a craft targeted close by: against it)
  if (tgt && tgt.isVessel && tgt.v !== s) {
    const at = eva ? _w.copy(p.ePos).add(p.body.pos) : s.getWorldPos(_w);
    if (tgt.pos.distanceTo(at) < TGT_RANGE) {
      if (eva) out.copy(p.eVel).add(p.body.vel); else s.getWorldVel(out);
      return { vel: out.sub(tgt.vel), tag: 'TGT' };
    }
  }
  if (eva) {
    if (p.nearShip) return { vel: out.copy(p.eVel).sub(p.nearShip.vel), tag: 'SHIP' };
    return { vel: out.copy(p.eVel), tag: 'ORB' };
  }
  const near = s.altitude < Math.max(s.body.atmHeight * 1.5, 60000);
  return near ? { vel: s.surfaceVel(out), tag: 'SRF' } : { vel: out.copy(s.vel), tag: 'ORB' };
}

// where a direction (world axes, unit) falls on the screen: in view (m px inside its edges), or pinned
// to the edge toward it round the sphere (a: the way to turn, screen radians)
function place(hud, dir, m, out) {
  const g = hud.game, cam = g.engine.camera, cx = hud.w / 2, cy = hud.h / 2;
  _d.copy(dir).applyQuaternion(_q.copy(g.camQuat).invert());
  if (_d.z < -1e-6) {
    const t = Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2);
    out.x = (_d.x / -_d.z) / (t * cam.aspect) * cx + cx;
    out.y = -(_d.y / -_d.z) / t * cy + cy;
    if (out.x >= m && out.x <= hud.w - m && out.y >= m && out.y <= hud.h - m) { out.edge = false; return out; }
  }
  // (its side of the view, in front or behind; straight behind, down)
  const a = Math.abs(_d.x) + Math.abs(_d.y) > 1e-9 ? Math.atan2(-_d.y, _d.x) : Math.PI / 2;
  const rx = cx - m, ry = cy - m, k = Math.min(rx / Math.abs(Math.cos(a) || 1e-6), ry / Math.abs(Math.sin(a) || 1e-6));
  out.x = cx + Math.cos(a) * k; out.y = cy + Math.sin(a) * k; out.a = a; out.edge = true;
  return out;
}

function edgeArrow(ctx, pt) {
  ctx.save(); ctx.translate(pt.x, pt.y); ctx.rotate(pt.a);
  ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(-5, -7); ctx.lineTo(-5, 7); ctx.closePath(); ctx.fill();
  ctx.restore();
}

// draw them for velocity vel (world axes) against tag; col: the HUD's colours (hud.js COL)
export function drawVelocityMarkers(hud, vel, tag, col) {
  const sp = vel.length();
  if (!(sp > 0.05)) return;
  const ctx = hud.ctx, u = _u.copy(vel).divideScalar(sp), M = 56;
  ctx.lineWidth = 1.5;
  // prograde: an empty circle, its ticks left, right and up
  const P = place(hud, u, M, _p);
  ctx.strokeStyle = col.ok; ctx.fillStyle = col.ok;
  if (P.edge) edgeArrow(ctx, P);
  const px = P.edge ? P.x - Math.cos(P.a) * 22 : P.x, py = P.edge ? P.y - Math.sin(P.a) * 22 : P.y;
  ctx.beginPath(); ctx.arc(px, py, 7, 0, Math.PI * 2);
  ctx.moveTo(px - 15, py); ctx.lineTo(px - 7, py); ctx.moveTo(px + 7, py); ctx.lineTo(px + 15, py);
  ctx.moveTo(px, py - 7); ctx.lineTo(px, py - 14);
  ctx.stroke();
  ctx.textAlign = P.edge && Math.cos(P.a) > 0.5 ? 'right' : 'left';
  ctx.fillText(`${tag} ${U.fmtSpeed(sp)}`, px + (ctx.textAlign === 'right' ? -18 : 18), py + 12);
  ctx.textAlign = 'left';
  // retrograde: a solid disc
  const R = place(hud, u.negate(), M, _r);
  ctx.fillStyle = col.cau;
  if (R.edge) edgeArrow(ctx, R);
  const rx = R.edge ? R.x - Math.cos(R.a) * 20 : R.x, ry = R.edge ? R.y - Math.sin(R.a) * 20 : R.y;
  ctx.beginPath(); ctx.arc(rx, ry, 6, 0, Math.PI * 2); ctx.fill();
}
