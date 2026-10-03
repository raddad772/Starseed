// A big ship's turbolift: cars on a guideway (world state on the vessel:
// where each car is, its doors, the stops it has been asked for; players
// only call it, ride it and pick where it goes).
//
// The guideway is a graph of nodes (stops and turns) joined by straight
// edges. A trip is the path through it cut into legs at every change of axis:
// the car stops at the end of each leg, and where the next leg goes up or
// down a shaft, or comes out of one, the junction's tongues move first while
// it stands. Before each leg the car takes its edges and nodes for itself; a
// car finding one taken waits (one car on a stretch at a time: the spare in
// its siding holds its own). A leg runs at constant acceleration up to the
// car's top speed for that axis, cruises, and comes down the same way; the
// run is worked out from the leg's length, so it doesn't depend on the frame
// rate. The landing doors open only with a car standing there, and with it
// (the doorway between them is walkable while both are open); a car leaves
// only once they're shut, and they won't shut on anyone in the doorway.

import * as THREE from 'three';

const AXES = ['x', 'y', 'z'];
const key = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);

export class Turbolift {
  constructor(vessel, spec) {
    this.v = vessel;
    this.spec = spec;
    this.nodes = {};
    for (const [k, p] of Object.entries(spec.nodes)) this.nodes[k] = new THREE.Vector3(...p);
    this.adj = {};
    for (const [a, b] of spec.edges) {
      (this.adj[a] || (this.adj[a] = [])).push(b);
      (this.adj[b] || (this.adj[b] = [])).push(a);
    }
    this.stations = spec.stations;
    this.byNode = {};
    for (const st of this.stations) this.byNode[st.node] = st;
    this.holds = new Map(); // edge or node key -> the car holding it
    // the junctions' tongues: 0 set for the guideway, 1 cleared for the shaft (moving between)
    this.sw = {};
    for (const k of Object.keys(spec.switches || {})) this.sw[k] = { at: 0, want: 0 };
    // the landing doors (0 shut .. 1 open) and the doorways' walkable state
    this.landing = {};
    for (const st of this.stations) {
      this.landing[st.id] = 0;
      vessel.doors[`tl-${st.id}`] = { open: 0, target: 0 };
    }
    this.cars = [this.makeCar('car', spec.start)];
    // the spare, parked in its siding: it holds the siding and the junction's edge into it
    this.spare = { id: 'spare', pos: this.nodes[spec.spare].clone(), node: spec.spare };
    if (spec.spare) {
      this.holds.set('n:' + spec.spare, this.spare);
      for (const n of this.adj[spec.spare] || []) this.holds.set(key(spec.spare, n), this.spare);
    }
  }

  makeCar(id, node) {
    const car = {
      id, node, pos: this.nodes[node].clone(),
      state: 'idle', t: 0, doors: 0, dwell: 0,
      queue: [], legs: null, leg: 0, axis: 'y',
      // the room you stand in, moved with the car
      room: { id: `tl-${id}`, name: 'Turbolift car', deck: null, type: 'turbolift', car: true, min: [0, 0, 0], max: [0, 0, 0] },
    };
    car.room.tl = car;
    this.holds.set('n:' + node, car);
    this.place(car);
    return car;
  }

  place(car) {
    const c = this.spec.car, p = car.pos, r = car.room;
    r.min[0] = p.x - c.half[0]; r.max[0] = p.x + c.half[0];
    r.min[1] = p.y; r.max[1] = p.y + c.height;
    r.min[2] = p.z - c.half[1]; r.max[2] = p.z + c.half[1];
  }

  rooms() { return this.cars.map((c) => c.room); }

  // the station a car stands at (doors may be open), or null on the move
  stationOf(car) {
    return car.state === 'run' || car.state === 'switch' || car.state === 'wait' ? null : this.byNode[car.node] || null;
  }

  // the car standing at (or bound for) a station
  carFor(stId) {
    return this.cars[0]; // (one car in service)
  }

  // ---------------------------------------------------------------- requests

  // someone at a landing wants a car here
  call(stId) {
    const car = this.carFor(stId);
    const st = this.stationOf(car);
    if (st && st.id === stId) {
      if (car.state === 'idle' || car.state === 'closing') { car.state = 'opening'; }
      car.dwell = this.spec.dwell;
      return 'here';
    }
    if (!car.queue.includes(stId)) car.queue.push(stId);
    return 'coming';
  }

  // someone in the car picks a stop: it goes there first
  send(car, stId) {
    const st = this.stationOf(car);
    if (st && st.id === stId) { if (car.state === 'idle') car.state = 'opening'; return; }
    car.queue = [stId, ...car.queue.filter((s) => s !== stId)];
    if (car.state === 'open' || car.state === 'opening') car.dwell = Math.min(car.dwell, 0.8);
  }

  // where a car is bound and how long it will take there, for the panels
  eta(car) {
    if (!car.legs) return null;
    let t = 0;
    for (let i = car.leg; i < car.legs.length; i++) {
      const L = car.legs[i];
      t += (i === car.leg && car.state === 'run') ? Math.max(0, L.T - car.t) : L.T + (L.sw ? this.spec.switchTime : 0);
    }
    return t;
  }

  // ---------------------------------------------------------------- planning

  path(from, to) {
    const prev = { [from]: null }, q = [from];
    while (q.length) {
      const n = q.shift();
      if (n === to) break;
      for (const m of this.adj[n] || []) if (!(m in prev)) { prev[m] = n; q.push(m); }
    }
    if (!(to in prev)) return null;
    const out = [];
    for (let n = to; n !== null; n = prev[n]) out.unshift(n);
    return out;
  }

  // the path cut into legs at each change of axis (or of direction), each with its run
  legs(path) {
    const out = [];
    let cur = null;
    for (let i = 0; i + 1 < path.length; i++) {
      const a = this.nodes[path[i]], b = this.nodes[path[i + 1]];
      const d = b.clone().sub(a);
      const ax = Math.abs(d.x) > 0.01 ? 0 : (Math.abs(d.y) > 0.01 ? 1 : 2);
      const sg = Math.sign(d.getComponent(ax));
      if (!cur || cur.axis !== ax || cur.sign !== sg) {
        cur = { from: path[i], to: path[i + 1], nodes: [path[i], path[i + 1]], axis: ax, sign: sg };
        out.push(cur);
      } else { cur.to = path[i + 1]; cur.nodes.push(path[i + 1]); }
    }
    for (const L of out) {
      L.a = this.nodes[L.from]; L.b = this.nodes[L.to];
      L.len = L.a.distanceTo(L.b);
      const [vmax, acc] = L.axis === 1 ? this.spec.run.v : this.spec.run.h;
      const vp = Math.min(vmax, Math.sqrt(acc * L.len));
      L.vp = vp; L.acc = acc;
      L.t1 = vp / acc;
      L.T = 2 * L.t1 + (L.len - vp * vp / acc) / vp;
      L.keys = [];
      for (let i = 0; i < L.nodes.length; i++) {
        L.keys.push('n:' + L.nodes[i]);
        if (i) L.keys.push(key(L.nodes[i - 1], L.nodes[i]));
      }
      // the junctions this leg runs into or out of: their tongues set for it
      L.sw = [];
      for (const n of [L.from, L.to]) if (this.sw[n]) L.sw.push([n, L.axis === 1 ? 1 : 0]);
    }
    return out;
  }

  // distance along a leg after t seconds of its run
  along(L, t) {
    if (t <= 0) return 0;
    if (t >= L.T) return L.len;
    if (t < L.t1) return 0.5 * L.acc * t * t;
    if (t > L.T - L.t1) { const r = L.T - t; return L.len - 0.5 * L.acc * r * r; }
    return 0.5 * L.acc * L.t1 * L.t1 + L.vp * (t - L.t1);
  }

  take(car, keys) {
    for (const k of keys) { const h = this.holds.get(k); if (h && h !== car) return false; }
    for (const k of keys) this.holds.set(k, car);
    return true;
  }

  release(car, keepNode) {
    for (const [k, h] of this.holds) if (h === car && k !== 'n:' + keepNode) this.holds.delete(k);
  }

  // ---------------------------------------------------------------- the clock

  // dt: seconds; walkers: positions (vessel frame) of the people aboard, for the doorways
  update(dt, walkers) {
    const S = this.spec;
    for (const car of this.cars) this.step(car, dt, walkers);
    // the junctions' tongues move toward what the next leg wants
    for (const s of Object.values(this.sw)) {
      const r = dt / S.switchTime;
      s.at += THREE.MathUtils.clamp(s.want - s.at, -r, r);
    }
    // the landing doors follow the car standing at each (shut without one), and the doorways
    for (const st of this.stations) {
      const car = this.cars.find((c) => this.stationOf(c) === st);
      const want = car ? car.doors : 0;
      const r = dt / S.doorTime;
      this.landing[st.id] += THREE.MathUtils.clamp(want - this.landing[st.id], -r, r);
      const d = this.v.doors[`tl-${st.id}`];
      d.open = d.target = car ? Math.min(car.doors, this.landing[st.id]) : 0;
    }
  }

  // someone standing in a car's doorway (in the doorway room, not in the car)
  doorwayBusy(car, walkers) {
    const st = this.stationOf(car);
    if (!st) return false;
    const dr = this.v.type.rooms.find((r) => r.id === `tl-${st.id}`);
    for (const w of walkers) {
      if (w.x < dr.min[0] || w.x > dr.max[0] || w.z < dr.min[2] || w.z > dr.max[2] || w.y < dr.min[1] - 0.6 || w.y > dr.max[1]) continue;
      if (!this.inCar(car, w)) return true;
    }
    return false;
  }

  // a point (vessel frame) inside a car's cabin; `at`: the car's floor position to test against
  inCar(car, p, at = car.pos, m = 0.05) {
    const c = this.spec.car;
    return Math.abs(p.x - at.x) <= c.half[0] + m && Math.abs(p.z - at.z) <= c.half[1] + m && p.y >= at.y - 0.7 && p.y <= at.y + c.height;
  }

  step(car, dt, walkers) {
    const S = this.spec;
    const doorRate = dt / S.doorTime;
    switch (car.state) {
      case 'idle':
        if (car.queue.length) {
          const to = this.stations.find((s) => s.id === car.queue[0]);
          if (to.node === car.node) { car.queue.shift(); car.state = 'opening'; break; }
          const p = this.path(car.node, to.node);
          if (!p) { car.queue.shift(); break; }
          car.legs = this.legs(p); car.leg = 0; car.dest = to.id;
          car.state = 'wait';
        }
        break;
      case 'opening':
        car.doors = Math.min(1, car.doors + doorRate);
        if (car.doors >= 1) { car.state = 'open'; car.dwell = S.dwell; }
        break;
      case 'open':
        car.dwell -= dt;
        if (this.doorwayBusy(car, walkers)) car.dwell = Math.max(car.dwell, 2);
        if (car.dwell <= 0) car.state = 'closing';
        break;
      case 'closing':
        if (this.doorwayBusy(car, walkers)) { car.state = 'opening'; break; }
        car.doors = Math.max(0, car.doors - doorRate);
        if (car.doors <= 0) car.state = 'idle';
        break;
      case 'wait': {
        const L = car.legs[car.leg];
        if (!this.take(car, L.keys)) break; // (another car on the stretch: wait for it)
        let moving = false;
        for (const [n, want] of L.sw) { this.sw[n].want = want; if (Math.abs(this.sw[n].at - want) > 1e-3) moving = true; }
        car.state = moving ? 'switch' : 'run';
        car.t = 0;
        break;
      }
      case 'switch': {
        const L = car.legs[car.leg];
        if (L.sw.every(([n, want]) => Math.abs(this.sw[n].at - want) < 1e-3)) { car.state = 'run'; car.t = 0; }
        break;
      }
      case 'run': {
        const L = car.legs[car.leg];
        car.t += dt;
        const s = this.along(L, car.t);
        car.pos.copy(L.a).addScaledVector(_d.copy(L.b).sub(L.a), L.len > 0 ? s / L.len : 1);
        car.axis = AXES[L.axis];
        car.node = null;
        if (car.t >= L.T) {
          car.pos.copy(L.b);
          car.node = L.to;
          this.release(car, L.to);
          car.leg++;
          if (car.leg >= car.legs.length) {
            car.legs = null;
            if (car.queue[0] === car.dest) car.queue.shift();
            car.dest = null;
            car.state = this.byNode[car.node] ? 'opening' : 'idle';
          } else car.state = 'wait';
        }
        break;
      }
    }
    this.place(car);
  }
}

const _d = new THREE.Vector3();
