// Walkable interiors in vessel-local coordinates. Gravity plating pulls along
// the vessel's -Y. Each interior answers the same questions for the player:
// where is the floor, where may I stand, what can I use here, and did I just
// walk out (down a ramp, off a deck edge, out of a hangar door)?

import * as THREE from 'three';
import { SHIP_INTERIOR, SHIP_HULL_BOXES } from '../render/shipModel.js';

const RADIUS = 0.3;
const HEIGHT = 1.8;

function pushOutOfSolids(solids, p, vel) {
  for (const s of solids) {
    if (p.y + 1.7 < s.min[1] || p.y > s.max[1] - 0.25) continue;
    const ex = Math.max(s.min[0] - RADIUS - p.x, p.x - (s.max[0] + RADIUS), 0);
    const ez = Math.max(s.min[2] - RADIUS - p.z, p.z - (s.max[2] + RADIUS), 0);
    if (ex === 0 && ez === 0) {
      const dl = p.x - (s.min[0] - RADIUS), dr = (s.max[0] + RADIUS) - p.x;
      const df = p.z - (s.min[2] - RADIUS), db = (s.max[2] + RADIUS) - p.z;
      const m = Math.min(dl, dr, df, db);
      if (m === dl) { p.x -= dl; vel.x = Math.min(vel.x, 0); } else if (m === dr) { p.x += dr; vel.x = Math.max(vel.x, 0); }
      else if (m === df) { p.z -= df; vel.z = Math.min(vel.z, 0); } else { p.z += db; vel.z = Math.max(vel.z, 0); }
    }
  }
}

// Big-ship rooms: keep the body (RADIUS around, HEIGHT tall from the feet) out
// of solid boxes along whichever axis needs the smallest push, so you can
// land on a catwalk, bump your head on its underside, or walk into a crate.
function pushOutOfSolids3D(solids, p, vel) {
  for (const s of solids) {
    const ox = Math.min(p.x + RADIUS - s.min[0], s.max[0] - (p.x - RADIUS));
    const oz = Math.min(p.z + RADIUS - s.min[2], s.max[2] - (p.z - RADIUS));
    const oy = Math.min(p.y + HEIGHT - s.min[1], s.max[1] - p.y);
    if (ox <= 0 || oz <= 0 || oy <= 0) continue;
    const m = Math.min(ox, oy, oz);
    if (m === oy) {
      if (p.y + HEIGHT / 2 > (s.min[1] + s.max[1]) / 2) { p.y = s.max[1]; vel.y = Math.max(vel.y, 0); }
      else { p.y = s.min[1] - HEIGHT; vel.y = Math.min(vel.y, 0); }
    } else if (m === ox) {
      if (p.x > (s.min[0] + s.max[0]) / 2) { p.x = s.max[0] + RADIUS; vel.x = Math.max(vel.x, 0); }
      else { p.x = s.min[0] - RADIUS; vel.x = Math.min(vel.x, 0); }
    } else if (p.z > (s.min[2] + s.max[2]) / 2) { p.z = s.max[2] + RADIUS; vel.z = Math.max(vel.z, 0); }
    else { p.z = s.min[2] - RADIUS; vel.z = Math.min(vel.z, 0); }
  }
}

// ---------------------------------------------------------------- the shuttle

export class ShuttleInterior {
  constructor(vessel) {
    this.v = vessel;
    this.hullBoxes = SHIP_HULL_BOXES;
    this.sprint = 0.7;
  }

  rampAngle() {
    const I = SHIP_INTERIOR;
    return I.rampClosed + (I.rampOpen - I.rampClosed) * this.v.ramp;
  }

  floorAt(x, z) {
    const h = SHIP_INTERIOR.rampHinge;
    if (z > h.z && Math.abs(x) < SHIP_INTERIOR.rampWidth + 0.1) {
      const a = this.rampAngle();
      return -(z - h.z) * Math.tan(Math.max(a, 0));
    }
    if (z < -6.95) return 0.25;
    return 0;
  }

  ceilingClamp(pl) {
    if (pl.sPos.y + HEIGHT > 2.5 && pl.sPos.z < 7.15) { pl.sPos.y = Math.min(pl.sPos.y, 0.7); if (pl.sVel.y > 0) pl.sVel.y = 0; }
  }

  // keep the player inside; 'exit' once they walk off the end of the open ramp
  confine(pl) {
    const p = pl.sPos;
    const I = SHIP_INTERIOR;
    const rampOpen = this.v.ramp > 0.85;
    const rampMaxZ = I.rampHinge.z + I.rampLength * Math.cos(this.rampAngle()) + 0.5;
    let inside = false;
    for (const c of I.cells) {
      if (p.x >= c.min[0] + RADIUS - 0.01 && p.x <= c.max[0] - RADIUS + 0.01 && p.z >= c.min[2] + RADIUS - 0.01 && p.z <= c.max[2] - (c.max[2] > 7 ? 0 : RADIUS) + 0.01) inside = true;
    }
    if (rampOpen && p.z >= I.rampHinge.z - 0.3 && p.z <= rampMaxZ && Math.abs(p.x) <= I.rampWidth - RADIUS) inside = true;
    if (!inside) {
      let best = null, bd = Infinity;
      const cand = (x, z) => { const d = (x - p.x) ** 2 + (z - p.z) ** 2; if (d < bd) { bd = d; best = [x, z]; } };
      for (const c of I.cells) {
        const maxZ = c.max[2] > 7 && rampOpen ? c.max[2] + 0.5 : c.max[2] - RADIUS;
        cand(THREE.MathUtils.clamp(p.x, c.min[0] + RADIUS, c.max[0] - RADIUS), THREE.MathUtils.clamp(p.z, c.min[2] + RADIUS, maxZ));
      }
      if (rampOpen) cand(THREE.MathUtils.clamp(p.x, -I.rampWidth + RADIUS, I.rampWidth - RADIUS), THREE.MathUtils.clamp(p.z, I.rampHinge.z - 0.3, rampMaxZ));
      if (best) {
        if (best[0] !== p.x) pl.sVel.x = 0;
        if (best[1] !== p.z) pl.sVel.z = 0;
        p.x = best[0]; p.z = best[1];
      }
    }
    pushOutOfSolids(I.solids, p, pl.sVel);
    const rampEndZ = I.rampHinge.z + I.rampLength * Math.cos(this.rampAngle()) - 0.2;
    if (p.z > rampEndZ && this.v.ramp > 0.9) return 'exit';
    return 'ok';
  }

  // Is a ship-local point within the boardable volume (interior or open ramp)?
  boardable(p) {
    const I = SHIP_INTERIOR;
    if (this.v.ramp > 0.85) {
      const a = this.rampAngle();
      const endZ = I.rampHinge.z + I.rampLength * Math.cos(a);
      if (p.z > I.rampHinge.z - 0.2 && p.z < endZ - 0.3 && Math.abs(p.x) < I.rampWidth - 0.2) {
        const floor = this.floorAt(p.x, p.z);
        if (p.y > floor - 0.6 && p.y < floor + 1.2) return true;
      }
      if (p.z > 5 && p.z < 7.2 && Math.abs(p.x) < 1.8 && p.y > -0.3 && p.y < 2.2) return true;
    }
    return false;
  }

  interact(pl, input) {
    const seat = SHIP_INTERIOR.seatPos[0];
    const dSeat = Math.hypot(pl.sPos.x - seat.x, pl.sPos.z - seat.z);
    const nearRampCtl = Math.abs(pl.sPos.z - 6.4) < 1.6 && pl.sPos.z < 7.4;
    if (dSeat < 1.3) {
      pl.prompt = { key: 'F', text: 'Take the pilot seat' };
      if (input.hit('KeyF')) pl.sitDown(0);
    } else if (nearRampCtl) {
      pl.prompt = { key: 'F', text: this.v.rampTarget > 0.5 ? 'Close ramp' : 'Lower ramp' };
      if (input.hit('KeyF')) pl.game.toggleRamp(this.v);
    }
  }

  // a spacewalker is never pulled in; boarding goes through the ramp
  capture() { return null; }
  roomAt() { return null; }
  vacuumAt() { return false; }
}

// ---------------------------------------------------------------- big ships: rooms

export class RoomInterior {
  constructor(vessel, t) {
    this.v = vessel;
    this.rooms = t.rooms || [];
    this.solids = t.solids || [];
    this.lifts = t.lifts || [];
    this.seats = t.seats || [];
    this.hullBoxes = t.colliders || [];
    this.sprint = 1.3;
  }

  // room whose footprint holds (x, z) with its floor at or just below y
  roomAt(p, below = 0.6) {
    let best = null;
    for (const r of this.rooms) {
      if (p.x < r.min[0] || p.x > r.max[0] || p.z < r.min[2] || p.z > r.max[2]) continue;
      if (p.y < r.min[1] - below || p.y > r.max[1]) continue;
      if (!best || r.min[1] > best.min[1]) best = r;
    }
    return best;
  }

  // room floor, or the top of a solid (a container stack, a console) when
  // standing or landing on it
  floorAt(x, z, y) {
    const r = this.roomAt(_p.set(x, y, z));
    let f = r ? r.min[1] : null;
    for (const s of this.solids) {
      if (x < s.min[0] - 0.05 || x > s.max[0] + 0.05 || z < s.min[2] - 0.05 || z > s.max[2] + 0.05) continue;
      if (s.max[1] <= y + 0.35 && (f === null || s.max[1] > f)) f = s.max[1];
    }
    return f;
  }

  vacuumAt(p) { const r = this.roomAt(p); return !!(r && r.vacuum); }

  ceilingClamp(pl) {
    const r = this.roomAt(pl.sPos);
    if (r && !(r.open && r.open.includes('+y')) && pl.sPos.y + HEIGHT > r.max[1]) { pl.sPos.y = r.max[1] - HEIGHT; if (pl.sVel.y > 0) pl.sVel.y = 0; }
  }

  // walkable test with the body radius kept off closed walls
  fits(r, p) {
    const o = r.open || [];
    const x0 = r.min[0] + (o.includes('-x') ? 0 : RADIUS), x1 = r.max[0] - (o.includes('+x') ? 0 : RADIUS);
    const z0 = r.min[2] + (o.includes('-z') ? 0 : RADIUS), z1 = r.max[2] - (o.includes('+z') ? 0 : RADIUS);
    return p.x >= x0 && p.x <= x1 && p.z >= z0 && p.z <= z1 && p.y >= r.min[1] - 0.6 && p.y <= r.max[1];
  }

  confine(pl) {
    const p = pl.sPos;
    let ok = false;
    for (const r of this.rooms) if (this.fits(r, p)) { ok = true; pl._room = r; break; }
    if (!ok) {
      const prev = pl._room;
      // stepped off an open edge (a deck lip, a hangar door) into space
      if (prev && prev.open) {
        const out = (prev.open.includes('-x') && p.x < prev.min[0]) || (prev.open.includes('+x') && p.x > prev.max[0])
          || (prev.open.includes('-z') && p.z < prev.min[2]) || (prev.open.includes('+z') && p.z > prev.max[2])
          || (prev.open.includes('+y') && p.y > prev.max[1]);
        if (out) return 'exit';
      }
      // otherwise slide along the nearest wall of a room on this level
      let best = null, bd = Infinity;
      for (const r of this.rooms) {
        if (Math.abs(r.min[1] - (prev ? prev.min[1] : p.y)) > 0.7) continue;
        const o = r.open || [];
        const x = THREE.MathUtils.clamp(p.x, r.min[0] + (o.includes('-x') ? 0 : RADIUS), r.max[0] - (o.includes('+x') ? 0 : RADIUS));
        const z = THREE.MathUtils.clamp(p.z, r.min[2] + (o.includes('-z') ? 0 : RADIUS), r.max[2] - (o.includes('+z') ? 0 : RADIUS));
        const d = (x - p.x) ** 2 + (z - p.z) ** 2;
        if (d < bd) { bd = d; best = [x, z, r]; }
      }
      if (best) {
        if (best[0] !== p.x) pl.sVel.x = 0;
        if (best[1] !== p.z) pl.sVel.z = 0;
        p.x = best[0]; p.z = best[1];
        pl._room = best[2];
      }
    }
    pushOutOfSolids3D(this.solids, p, pl.sVel);
    return 'ok';
  }

  interact(pl, input) {
    const p = pl.sPos;
    for (let i = 0; i < this.seats.length; i++) {
      const s = this.seats[i];
      if (Math.hypot(p.x - s.pos[0], p.z - s.pos[2]) < 1.4 && Math.abs(p.y - s.pos[1]) < 1.2) {
        pl.prompt = { key: 'F', text: `Take the ${s.label.toLowerCase()} · fly ${this.v.name}` };
        if (input.hit('KeyF')) pl.sitDown(i);
        return;
      }
    }
    for (const l of this.lifts) {
      for (const [from, to] of [[l.a, l.b], [l.b, l.a]]) {
        if (Math.hypot(p.x - from[0], p.z - from[2]) < 2.0 && Math.abs(p.y - from[1]) < 1.5) {
          const up = to[1] > from[1];
          pl.prompt = { key: 'F', text: `${l.label} · ${up ? 'up' : 'down'}` };
          if (input.hit('KeyF')) pl.rideLift(to);
          return;
        }
      }
    }
  }

  // a drifting spacewalker inside a capture room is pulled onto its floor
  capture(p) {
    for (const r of this.rooms) {
      if (!r.capture) continue;
      // (a metre below an open top, so hovering at the rim cannot flicker in and out)
      const top = r.open && r.open.includes('+y') ? r.max[1] - 1 : r.max[1];
      if (p.x > r.min[0] && p.x < r.max[0] && p.z > r.min[2] && p.z < r.max[2] && p.y > r.min[1] - 0.3 && p.y < top) return r;
    }
    return null;
  }

  boardable() { return false; }

  // ---------------------------------------------------------------- wayfinding
  // Rooms are the nodes. Rooms on one level that overlap meet at a doorway
  // (the middle of the overlap); lifts join levels.
  graph() {
    if (this._graph) return this._graph;
    const R = this.rooms, adj = R.map(() => []);
    const V = (a) => new THREE.Vector3(a[0], a[1], a[2]);
    for (let i = 0; i < R.length; i++) for (let j = i + 1; j < R.length; j++) {
      const a = R[i], b = R[j];
      if (Math.abs(a.min[1] - b.min[1]) > 0.7) continue;
      const x0 = Math.max(a.min[0], b.min[0]), x1 = Math.min(a.max[0], b.max[0]);
      const z0 = Math.max(a.min[2], b.min[2]), z1 = Math.min(a.max[2], b.max[2]);
      if (x0 > x1 || z0 > z1) continue;
      const at = new THREE.Vector3((x0 + x1) / 2, Math.max(a.min[1], b.min[1]), (z0 + z1) / 2);
      adj[i].push({ to: j, at, kind: 'door' });
      adj[j].push({ to: i, at, kind: 'door' });
    }
    for (const l of this.lifts) {
      const ia = R.indexOf(this.roomAt(V(l.a), 1.0)), ib = R.indexOf(this.roomAt(V(l.b), 1.0));
      if (ia < 0 || ib < 0) continue;
      adj[ia].push({ to: ib, at: V(l.a), kind: 'lift', label: l.label });
      adj[ib].push({ to: ia, at: V(l.b), kind: 'lift', label: l.label });
    }
    return (this._graph = adj);
  }

  // The next leg from p toward q (vessel-local): a doorway, a lift to ride,
  // or q itself once in its room. Shortest walk (lift rides count 30 m).
  nextStep(p, q) {
    const R = this.rooms, adj = this.graph();
    // standing in a doorway is standing in both rooms: start from all of them
    const starts = [];
    R.forEach((r, i) => {
      if (p.x >= r.min[0] && p.x <= r.max[0] && p.z >= r.min[2] && p.z <= r.max[2] && p.y >= r.min[1] - 1.0 && p.y <= r.max[1]) starts.push(i);
    });
    const to = R.indexOf(this.roomAt(q, 1.0));
    if (!starts.length || to < 0) return null;
    if (starts.includes(to)) return { at: q, kind: 'goal', room: R[to] };
    const dist = R.map(() => Infinity), prev = R.map(() => null), pos = R.map(() => null), done = R.map(() => false);
    for (const i of starts) { dist[i] = 0; pos[i] = p; }
    for (;;) {
      let i = -1;
      for (let k = 0; k < R.length; k++) if (!done[k] && dist[k] < Infinity && (i < 0 || dist[k] < dist[i])) i = k;
      if (i < 0 || i === to) break;
      done[i] = true;
      for (const e of adj[i]) {
        const d = dist[i] + pos[i].distanceTo(e.at) + (e.kind === 'lift' ? 30 : 0);
        if (d < dist[e.to]) { dist[e.to] = d; prev[e.to] = { from: i, e }; pos[e.to] = e.kind === 'lift' ? this.liftExit(e) : e.at; }
      }
    }
    if (!prev[to]) return null;
    let k = to;
    const legs = [];
    while (prev[k]) { legs.unshift(prev[k].e); k = prev[k].from; }
    const first = legs[0];
    return { at: first.at, kind: first.kind, label: first.label, room: R[first.to], dist: dist[to] + pos[to].distanceTo(q), legs };
  }

  liftExit(e) {
    for (const l of this.lifts) {
      if (l.a[0] === e.at.x && l.a[1] === e.at.y && l.a[2] === e.at.z) return new THREE.Vector3(...l.b);
      if (l.b[0] === e.at.x && l.b[1] === e.at.y && l.b[2] === e.at.z) return new THREE.Vector3(...l.a);
    }
    return e.at;
  }

  // places worth walking to aboard: seats, landing pads, the hangar, and any
  // craft resting inside (to its ramp)
  destinations() {
    const v = this.v, out = [];
    for (const s of this.seats) out.push({ label: s.label, at: new THREE.Vector3(...s.stand) });
    for (const c of v.children) {
      if (c.dead || !c.type.ramp) continue;
      const I = SHIP_INTERIOR;
      const foot = new THREE.Vector3(0, 0, I.rampHinge.z + I.rampLength + 1.5).applyQuaternion(c.lquat).add(c.lpos);
      foot.y = Math.max(foot.y, this.floorAt(foot.x, foot.z, foot.y + 1) ?? foot.y);
      out.push({ label: `${c.name} · ramp`, at: foot });
    }
    for (const z of v.type.zones || []) {
      if (z.kind === 'pad') out.push({ label: `${z.name}`, at: new THREE.Vector3(z.pad[0] + 12, z.pad[1], z.pad[2]) });
      else {
        const r = this.rooms.find((rr) => rr.capture);
        if (r) out.push({ label: `${z.name} deck`, at: new THREE.Vector3((r.min[0] + r.max[0]) / 2, r.min[1], (r.min[2] + r.max[2]) / 2) });
      }
    }
    return out;
  }
}

const _p = new THREE.Vector3();

export function makeInterior(vessel) {
  return vessel.type.key === 'shuttle' ? new ShuttleInterior(vessel) : new RoomInterior(vessel, vessel.type);
}
