// The near field: where the ground is drawn and felt as a volume (gen/volume.js) round the
// player on a world, so cliffs, overhangs and caves are solid. Its anchor (the lattice's local
// frame) stays put while the player is within ANCHOR_RANGE of it; its centre follows the player.
// The renderer meshes the field inside NEAR_RADIUS of the centre (render/planetTerrain.js); the
// physics asks for the floor under a point (the first rock below it, so a cave has a floor and
// an overhang a roof) and for the way out of rock.

import { VolumeField, anchorAt } from '../gen/volume.js';

export const NEAR_RADIUS = 160;      // m: the finest ring (walked on); coarser ones beyond
// the rendered rings: cell size 2^level m, the band (m from the centre) each draws; 'high' only
// up off the ground
export const NEAR_RINGS = [
  { level: 0, r0: 0, r1: NEAR_RADIUS },
  { level: 1, r0: NEAR_RADIUS, r1: 400 },
  { level: 2, r0: 400, r1: 1000 },
  { level: 3, r0: 1000, r1: 2500, high: true },
];
const ANCHOR_RANGE = 1500;           // m: how far the player goes before the lattice re-anchors
const NEAR_ALT = 2500;               // m above the ground: higher, there's no near field

export class NearGround {
  constructor(body) {
    this.body = body;
    this.field = null;
    this.anchor = null;
    this.anchorId = 0;
    this.centre = [0, 0, 0];
    this.active = false;
    // (set by the renderer once the chunks round the centre are meshed: until then the
    // heightfield is drawn and walked on, so nobody stands on rock they can't see)
    this.ready = false;
    this._l = [0, 0, 0];
    this._g = [0, 0, 0];
  }

  // pos: the player's body-fixed position (THREE.Vector3); spot: where the craft's coming down
  // (body-fixed unit direction, sim/landingFocus.js), or null
  update(pos, spot = null) {
    const b = this.body, gen = b.terrain;
    if (!gen || !b.solid) { this.active = false; this.prefetch = false; return; }
    const r = pos.length();
    this.alt = r - b.R - Math.max(0, b.groundHeight(pos));
    // coming down to a known spot: the lattice is anchored there from the first and its finest
    // rings made ahead (render/planetTerrain.js), so nothing's made again on the way in; the
    // field is the player's own once they're within reach of it
    this.prefetch = false;
    if (spot) {
      const s = this._s || (this._s = pos.clone());
      s.copy(spot).multiplyScalar(b.R + Math.max(0, b.groundHeight(spot)));
      const a = this.anchor;
      // (moved: by direction over the ground; the anchor's origin is on the datum, not the ground)
      const moved = a ? Math.acos(Math.max(-1, Math.min(1, (spot.x * a.u[0] + spot.y * a.u[1] + spot.z * a.u[2]) / spot.length()))) * b.R : Infinity;
      if (!this.field || this.field.gen !== gen || moved > 200) {
        this.anchor = anchorAt([s.x, s.y, s.z], b.R);
        this.field = new VolumeField(gen, this.anchor);
        this.anchorId++;
        this.ready = false;
        b.groundEpoch = (b.groundEpoch || 0) + 1;
      }
      const up = s.clone().normalize(), d = pos.clone().sub(s), across = d.addScaledVector(up, -d.dot(up)).length();
      this.active = this.alt < NEAR_ALT && across < ANCHOR_RANGE;
      if (this.active) { this.centre[0] = pos.x; this.centre[1] = pos.y; this.centre[2] = pos.z; }
      else { this.prefetch = true; this.ready = false; this.centre[0] = s.x; this.centre[1] = s.y; this.centre[2] = s.z; }
      return;
    }
    this.active = this.alt < NEAR_ALT;
    if (!this.active) return;
    const a = this.anchor;
    const far = !a || Math.hypot(pos.x - a.o[0], pos.y - a.o[1], pos.z - a.o[2]) - (r - b.R) > ANCHOR_RANGE;
    if (!this.field || this.field.gen !== gen || far) {
      this.anchor = anchorAt([pos.x, pos.y, pos.z], b.R);
      this.field = new VolumeField(gen, this.anchor);
      this.anchorId++;
      this.ready = false;
      b.groundEpoch = (b.groundEpoch || 0) + 1;   // (the heightfield's ground under it till it's meshed)
    }
    this.centre[0] = pos.x; this.centre[1] = pos.y; this.centre[2] = pos.z;
  }

  // whether body-fixed point p is well inside the near field
  within(p) {
    // (ready, but its field not swapped in yet: a jump of hundreds of metres re-anchors it)
    if (!this.active || !this.ready || !this.field) return false;
    // (horizontally: the volume is meshed in a vertical cylinder round the centre)
    const c = this.centre, dx = p.x - c[0], dy = p.y - c[1], dz = p.z - c[2], cl = Math.hypot(c[0], c[1], c[2]);
    const up = (dx * c[0] + dy * c[1] + dz * c[2]) / cl;
    return Math.sqrt(Math.max(0, dx * dx + dy * dy + dz * dz - up * up)) < NEAR_RADIUS - 10;
  }

  // radial height (m above datum) of local-frame point (x, y, z)
  heightOf(x, y, z) {
    const a = this.anchor;
    const px = a.o[0] + x * a.e[0] + y * a.u[0] + z * a.n[0], py = a.o[1] + x * a.e[1] + y * a.u[1] + z * a.n[1], pz = a.o[2] + x * a.e[2] + y * a.u[2] + z * a.n[2];
    return Math.sqrt(px * px + py * py + pz * pz) - this.body.R;
  }

  // the floor under body-fixed point p: the first rock below p + step (m), within `down` below;
  // from inside rock, the surface above it (up to 30 m). Radial height above datum, or null
  floorBelow(p, step = 0.6, down = 80) {
    const f = this.field, L = f.toLocal(p.x, p.y, p.z, this._l);
    const x = L[0], z = L[2];
    let y = L[1] + step, v = f.densityLocal(x, y, z);
    if (v > 0) {
      // in rock: climb to the air above (a teleport, a step up the generator didn't expect)
      for (let k = 0; k < 120 && v > 0; k++) { const y2 = y + 0.25, v2 = f.densityLocal(x, y2, z); if (v2 <= 0) { return this.heightOf(x, y + 0.25 * v / (v - v2), z); } y = y2; v = v2; }
      return null;
    }
    const n = Math.ceil((down + step) / 0.25);
    for (let k = 0; k < n; k++) {
      const y2 = y - 0.25, v2 = f.densityLocal(x, y2, z);
      if (v2 > 0) return this.heightOf(x, y - 0.25 * v / (v - v2), z);
      y = y2; v = v2;
    }
    return null;
  }

  // density at body-fixed point p (positive in rock), and its gradient (body-fixed, into rock)
  densityAt(p, grad = null) {
    const f = this.field, L = f.toLocal(p.x, p.y, p.z, this._l);
    const d = f.densityLocal(L[0], L[1], L[2]);
    if (grad) {
      const e = 0.35, a = this.anchor;
      const gx = (f.densityLocal(L[0] + e, L[1], L[2]) - f.densityLocal(L[0] - e, L[1], L[2])) / (2 * e);
      const gy = (f.densityLocal(L[0], L[1] + e, L[2]) - f.densityLocal(L[0], L[1] - e, L[2])) / (2 * e);
      const gz = (f.densityLocal(L[0], L[1], L[2] + e) - f.densityLocal(L[0], L[1], L[2] - e)) / (2 * e);
      grad.set(gx * a.e[0] + gy * a.u[0] + gz * a.n[0], gx * a.e[1] + gy * a.u[1] + gz * a.n[1], gx * a.e[2] + gy * a.u[2] + gz * a.n[2]);
    }
    return d;
  }
}
