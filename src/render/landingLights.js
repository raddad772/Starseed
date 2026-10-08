// Landing lights: wide floods under a flyable craft's belly (every small or medium craft; the big
// ships have their deck masts), so a night landing lights the ground round and ahead of where it
// comes down. Three spots a craft: one under the nose tipped forward, a pair aft and outboard tipped
// out. Placed from the hull's probes, clear of what hangs below the belly (its legs, a ramp, a slung
// load): outdoors the native renderer casts no local shadows, so whatever is in a beam is lit by it.
// On by themselves in the dark while the craft's low or its gear's down (and a little after it
// lands); L flips them (vessel.lightsForce: world state, everyone sees them) until the automatic
// choice comes round to agree, and then it has them again.
import * as THREE from 'three';

const ANGLE = 1.05, PENUMBRA = 0.5;   // (a 60 degree half-angle, full inside 30)
const NOSE_TILT = 25, OUT_TILT = 15, AFT_TILT = 8; // (degrees off straight down)
const LOW = 800, GEAR_LOW = 5000;     // (m above the ground: on below LOW, or below GEAR_LOW gear down)
const HOLD = 20;                      // (s they stay on after touchdown)
const FADE = 0.5;                     // (s to come up or go out)
const DARK = 0.01;                    // (the sun's light on level ground, of Earth's: ~1000 lux, about sunset)
const COLOR = 0xfff0dc;

// flyable small and medium craft (not the big ships, stations, frames or ground vehicles)
export function hasLandingLights(type) {
  return !!type && !type.big && !type.station && !type.frameOnly && !type.ground && (type.thrust?.belly || 0) > 0;
}

const rad = (d) => d * Math.PI / 180;
const norm = (v) => { const l = Math.hypot(...v); return v.map((x) => x / l); };

// what of the craft's own hangs below its belly, as points: the legs down (attach to foot), a
// clamp's load box, ramps lowered (hinge [y, z], running away from the middle)
function obstacles(type, legs, ramps) {
  const out = [], len = type.legLength || 1.5;
  for (const a of legs || []) {
    const [x, y, z] = a.isVector3 ? a.toArray() : a;
    for (let k = 0; k <= 4; k++) out.push([x, y - len * k / 4, z]);
  }
  const c = type.clamp;
  if (c?.fits) for (const i of [-1, 0, 1]) for (const j of [-1, 1]) for (const k of [-1, 0, 1]) out.push([c.pos[0] + i * c.fits[0] / 2, c.pos[1] + j * c.fits[1] / 2, c.pos[2] + k * c.fits[2] / 2]);
  for (const r of ramps || []) {
    const s = Math.sign(r.hinge[1]) || 1;
    for (const i of [-1, 0, 1]) for (const a of [0.35, 0.7]) for (let k = 0; k <= 3; k++) out.push([i * r.width / 2, r.hinge[0] - Math.sin(a) * r.length * k / 3, r.hinge[1] + s * Math.cos(a) * r.length * k / 3]);
  }
  return out;
}

// is any of pts inside a beam from pos along dir (unit), a couple of degrees to spare
function blocked(pos, dir, pts) {
  const c = Math.cos(ANGLE + rad(2));
  for (const p of pts) {
    const d = [p[0] - pos[0], p[1] - pos[1], p[2] - pos[2]], l = Math.hypot(...d);
    if (l > 1e-3 && (d[0] * dir[0] + d[1] * dir[1] + d[2] * dir[2]) / l > c) return true;
  }
  return false;
}

// The spots in the craft's frame (x right, y up, -z forward): [{ pos, dir }]. legs: the vessel's
// own leg attach points where its model has them (the shuttle's), else its type's; ramps: extra
// ramps beyond type.ramps.
export function landingLightSpots(type, { legs = type.legAttach, ramps = type.ramps } = {}) {
  const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  if (type.probes?.length) for (const p of type.probes) for (let i = 0; i < 3; i++) { lo[i] = Math.min(lo[i], p[i]); hi[i] = Math.max(hi[i], p[i]); }
  else {
    const r = type.radius || 8, s = type.size || [r * 0.8, r * 0.35, r * 2];
    for (let i = 0; i < 3; i++) { lo[i] = -s[i] / 2; hi[i] = s[i] / 2; }
  }
  const L = hi[2] - lo[2], cx = (lo[0] + hi[0]) / 2, half = (hi[0] - lo[0]) / 2, y = lo[1] + 0.1;
  const pts = obstacles(type, legs, ramps);
  const t = Math.tan(rad(NOSE_TILT)), o = Math.tan(rad(OUT_TILT)), a = Math.tan(rad(AFT_TILT));
  const spots = [{ pos: [cx, y, lo[2] + 0.12 * L], dir: norm([0, -1, -t]), step: [0, 0, -0.5] }];
  for (const s of [-1, 1]) spots.push({ pos: [cx + s * 0.75 * half, y, hi[2] - 0.25 * L], dir: norm([s * o, -1, a]), step: [s * 0.5, 0, 0.25] });
  // (nudged forward, or out and aft, until nothing of the craft's is in the beam)
  return spots.map(({ pos, dir, step }) => {
    for (let i = 0; i < 16 && blocked(pos, dir, pts); i++) for (let k = 0; k < 3; k++) pos[k] += step[k];
    return { pos, dir };
  });
}

const _w = new THREE.Vector3(), _u = new THREE.Vector3(), _s = new THREE.Vector3();

export class LandingLights {
  // parent: the group that carries the craft's exterior (moves and turns with it)
  constructor(vessel, parent, opts) {
    this.v = vessel;
    this.on = false; this.level = 0; this.landedFor = HOLD; // (found landed: long since, not just down)
    // (candela a spot, a touch more for a bigger craft: it's seen from further and flies higher; a
    // 60 kcd spot gives ~0.6 lux 300 m down, three times a full moon, and its range runs to ~0.05 lux)
    this.cd = 54000 * THREE.MathUtils.clamp(Math.sqrt((vessel.type.radius || 10) / 16), 0.5, 1.6);
    const range = 4.5 * Math.sqrt(this.cd);
    this.group = new THREE.Group(); this.group.name = 'landing-lights'; this.group.visible = false;
    this.lights = landingLightSpots(vessel.type, opts).map(({ pos, dir }) => {
      const l = new THREE.SpotLight(COLOR, 0, range, ANGLE, PENUMBRA, 2);
      l.position.fromArray(pos);
      l.target.position.fromArray(pos).add(_u.fromArray(dir));
      this.group.add(l, l.target);
      return l;
    });
    parent.add(this.group);
  }

  // dark where the craft is: the sun's light on level ground there (no air, no clouds: about sunset)
  dark() {
    const v = this.v, u = v.game?.universe;
    if (!u) return false;
    const w = v.getWorldPos(_w), up = _u.copy(v.pos).normalize();
    return u.sunIlluminance(w) * Math.max(0, up.dot(_s.copy(u.star.pos).sub(w).normalize())) < DARK;
  }

  // the automatic choice: dark, over solid ground, low or gear down, not landed long
  auto(dt) {
    const v = this.v;
    this.landedFor = v.landed ? this.landedFor + dt : 0;
    if (v.dead || v.parent || !v.body?.solid || !this.dark()) return false;
    if (v.landed) return this.landedFor < HOLD;
    return v.agl < LOW || (v.gearTarget > 0.5 && v.agl < GEAR_LOW);
  }

  // L: the other way from how they are now; returns whether they're on
  toggle() {
    this.on = !this.on;
    this.v.lightsForce = this.on;
    return this.on;
  }

  // dt 0 (a second view): the same state, drawn with this view's light gain
  update(dt) {
    const v = this.v;
    if (dt > 0) {
      const auto = this.auto(dt);
      if (v.lightsForce === auto) v.lightsForce = null;
      this.on = v.lightsForce ?? auto;
      this.level = THREE.MathUtils.clamp(this.level + (this.on ? dt : -dt) / FADE, 0, 1);
    }
    // (in the scene's light: candela over Earth's sunlight's 1e5 lux, with the pre-exposure gain,
    // as the hand light: render/world.js)
    const e = this.level * this.level * (3 - 2 * this.level);
    const k = e * this.cd / 1e5 * (v.game?.world?.sunGain || 1);
    this.group.visible = k > 0;
    for (const l of this.lights) l.intensity = k;
  }
}
