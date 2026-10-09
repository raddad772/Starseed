// The site's gates at play: state, what you can do near them, how they look,
// and which of their parts block, carry or fold space.
//   door (weight, pressure, resonance)  a slab filling a doorway until solved
//   span (light, time)                   a gap in a catwalk; a bridge or a cycling deck
//   fold (distance)                      rubble in a passage; frames joining its two sides
import * as THREE from 'three';
import { inside, inflate } from '../plan/geom2.js';
import { THEME_NAMES } from '../plan/themes.js';

const REACH = 2.8;
// (how near a glitch the suit picks it up, and how far away again before it will say so again)
const ANOMALY_NEAR = 10, ANOMALY_REARM = 22;
const ANOMALY_SAYS = { temporal: 'Warning: temporal anomaly detected.', spatial: 'Warning: spatial anomaly detected.' };

export class SiteMechanisms {
  constructor(site, collision, root, mat, saved = {}) {
    this.site = site; this.gates = site.gates; this.time = 0;
    this.solved = new Set(saved.solved || []);
    this.relays = new Set(saved.relays || []);
    this.terminals = new Set(saved.terminals || []);
    this.valves = { ...(saved.valves || {}) };
    this.carrying = saved.carrying || null; // the cell's key id
    this.cellsDelivered = new Set(saved.cellsDelivered || []);
    this.plates = {}; // gate id -> progress
    this.visual = new Map();
    const glow = (c, i = 1.4) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: i });
    const M = { slab: mat.metal, dark: mat.dark, amber: glow('#ffb860'), cyan: glow('#9ff0e0'), red: glow('#ff6040', 1.2), light: new THREE.MeshStandardMaterial({ color: '#9ff0ea', emissive: '#7fe8e0', emissiveIntensity: 1.1, transparent: true, opacity: 0.55, depthWrite: false }), fold: new THREE.MeshStandardMaterial({ color: '#c8b8ff', emissive: '#a890ff', emissiveIntensity: 1.2, transparent: true, opacity: 0.35, depthWrite: false, side: THREE.DoubleSide }) };
    // a time span: solid, solid and about to go, and the ghost of it while it's gone (fainter to stronger as it comes back)
    M.timeOn = new THREE.MeshStandardMaterial({ color: '#c9b48a', emissive: '#ffcf7a', emissiveIntensity: 0.55, metalness: 0.4, roughness: 0.5 });
    M.timeDim = new THREE.MeshStandardMaterial({ color: '#6a604c', emissive: '#ff9a40', emissiveIntensity: 0.08, metalness: 0.4, roughness: 0.5 });
    M.ghost = [0.07, 0.16, 0.3].map((o) => new THREE.MeshStandardMaterial({ color: '#ffd59a', emissive: '#ffb860', emissiveIntensity: 0.9, transparent: true, opacity: o, depthWrite: false }));
    this.M = M;
    // doors that work (plan/compile.js placeWorkingDoors): a powered one lifts as you come; a
    // flickering one jumps between wrecked (open) and whole (shut), its corner lamps telling which
    this.working = (site.workingDoors || []).map((d) => {
      const v = { d, open: d.kind === 'flicker' ? 0 : 0 }, h = d.y1 - d.y0, yaw = Math.atan2(d.along[0], d.along[1]) - Math.PI / 2;
      const at = (s, o, y) => [d.mid[0] + d.along[0] * s + d.inward[0] * o, y, d.mid[1] + d.along[1] * s + d.inward[1] * o];
      const box = (w, hh, dp, pos, m) => { const g = new THREE.Mesh(new THREE.BoxGeometry(w, hh, dp), m); g.position.set(...pos); g.rotation.y = yaw; root.add(g); return g; };
      if (d.kind === 'powered') {
        v.panel = box(d.width + 0.06, h, 0.18, at(0, 0, d.y0 + h / 2), mat.metal);
        // its lit frame: both jambs and the lintel, both faces
        for (const o of [-0.32, 0.32]) {
          for (const sg of [-1, 1]) box(0.07, h, 0.05, at(sg * (d.width / 2 + 0.06), o, d.y0 + h / 2), M.cyan);
          box(d.width + 0.2, 0.07, 0.05, at(0, o, d.y1 + 0.05), M.cyan);
        }
      } else {
        v.whole = box(d.width + 0.06, h, 0.2, at(0, 0, d.y0 + h / 2), mat.rust);
        // the wreck: what's left of it hanging from the lintel and the jambs
        v.wreck = new THREE.Group(); root.add(v.wreck);
        for (const [s0, w, hh, y] of [[-0.42, 0.26, h * 0.55, d.y1 - h * 0.27], [0.4, 0.3, h * 0.35, d.y1 - h * 0.17], [0.05, d.width * 0.8, 0.45, d.y1 - 0.22], [-0.46, 0.16, h * 0.3, d.y0 + h * 0.15]]) {
          const g = new THREE.Mesh(new THREE.BoxGeometry(w, hh, 0.16), mat.rust); g.position.set(...at(s0 * d.width, 0, y)); g.rotation.set(0, yaw, (s0 > 0 ? -1 : 1) * 0.12); v.wreck.add(g);
        }
        v.tells = [-1, 1].flatMap((sg) => [-0.35, 0.35].map((o) => box(0.14, 0.14, 0.14, at(sg * (d.width / 2 + 0.2), o, d.y1 + 0.15), M.red)));
      }
      // (never shut on you: whoever's in the doorway when it turns stays in the gap till they step out)
      v.gap = inflate(d.barrier.poly, 0.45);
      collision.addBlocker({ poly: d.barrier.poly, y0: d.y0, y1: d.y1, active: () => v.open < 0.7 && !v.inGap });
      return v;
    });
    for (const g of this.gates) {
      const v = {};
      if (g.kind === 'door') {
        // the door slab: drawn here (it moves), collided with as a blocker
        const b = g.door, h = b.y1 - b.y0;
        const geo = new THREE.BoxGeometry(b.width + 0.1, h, 0.35);
        v.slab = new THREE.Mesh(geo, M.slab);
        v.slab.position.set(b.mid[0] + b.inward[0] * -0.2, b.y0 + h / 2, b.mid[1] + b.inward[1] * -0.2);
        v.slab.rotation.y = Math.atan2(b.along[0], b.along[1]) - Math.PI / 2;
        v.lamp = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.06), M.red); v.lamp.position.set(0, h / 2 - 0.35, -0.2); v.slab.add(v.lamp);
        root.add(v.slab);
        v.open = this.solved.has(g.id) ? 1 : 0;
        collision.addBlocker({ poly: g.barrier.poly, y0: g.barrier.y0, y1: g.barrier.y1, active: () => !this.solved.has(g.id) });
        // the control beside it
        v.control = this._control(g, root, M);
      } else if (g.kind === 'span') {
        const f = g.floor, shape = new THREE.Shape(f.poly.map(([x, z]) => new THREE.Vector2(x, -z)));
        const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.12, bevelEnabled: false }); geo.rotateX(-Math.PI / 2); geo.translate(0, f.y - 0.12, 0);
        if (g.theme === 'time') {
          // a deck that falls and comes back: hung on a pivot at its middle, to drop and tumble
          const cx = f.poly.reduce((a, q) => a + q[0], 0) / f.poly.length, cz = f.poly.reduce((a, q) => a + q[1], 0) / f.poly.length;
          const local = geo.clone(); local.translate(-cx, -f.y, -cz);
          v.pivot = new THREE.Group(); v.pivot.position.set(cx, f.y, cz); root.add(v.pivot);
          v.bridge = new THREE.Mesh(local, M.timeOn); v.pivot.add(v.bridge);
          v.axis = new THREE.Vector3(g.axis?.[0] ?? 1, 0, g.axis?.[1] ?? 0).normalize();
          // its ghost where it'll be, while it's gone; and a lamp at each corner telling where it is in its cycle
          v.ghost = new THREE.Mesh(geo, M.ghost[0]); root.add(v.ghost);
          v.tells = f.poly.map(([x, z]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.16), M.cyan); m.position.set(x, f.y + 0.95, z); root.add(m); const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 6), mat.metal); post.position.set(x, f.y + 0.45, z); root.add(post); return m; });
        } else { v.bridge = new THREE.Mesh(geo, M.light); root.add(v.bridge); }
        collision.addFloor({ poly: f.poly, y: f.y, active: () => this.spanPresent(g) });
      } else if (g.kind === 'fold') {
        v.membranes = g.frames.map((fr) => {
          const m = new THREE.Mesh(new THREE.PlaneGeometry(fr.half * 2, 2.6), M.fold);
          m.position.set(fr.pos[0], fr.pos[1] + 1.35, fr.pos[2]); m.rotation.y = Math.atan2(fr.dir[0], fr.dir[1]);
          root.add(m); return m;
        });
        collision.addPortal({ a: g.frames[0], b: g.frames[1], active: () => this.solved.has(g.id) });
      }
      // key props
      v.keys = new Map();
      for (const k of g.keys) v.keys.set(k.id, this._keyProp(k, root, M, mat));
      this.visual.set(g.id, v);
    }
    // the place's glitches, where they are (AnomalySense, below, is who has noticed them): out of
    // step with time (a span that comes and goes, a door between wrecked and whole), or space folded
    // (a distance gate's frames)
    const centre = (poly) => [0, 1].map((k) => poly.reduce((a, q) => a + q[k], 0) / poly.length);
    this.anomalies = [
      ...this.working.filter((v) => v.d.kind === 'flicker').map((v) => ({ pos: [v.d.mid[0], v.d.y0, v.d.mid[1]], r: ANOMALY_NEAR, kind: 'temporal' })),
      ...this.gates.filter((g) => g.kind === 'span' && g.theme === 'time').map((g) => {
        const [cx, cz] = centre(g.floor.poly), size = Math.max(...g.floor.poly.map(([x, z]) => Math.hypot(x - cx, z - cz)));
        return { pos: [cx, g.floor.y, cz], r: ANOMALY_NEAR + size, kind: 'temporal' };
      }),
      ...this.gates.filter((g) => g.kind === 'fold').map((g) => ({ pos: g.collapse.p, r: ANOMALY_NEAR + 3, kind: 'spatial' })),
    ];
  }

  _control(g, root, M) {
    const grp = new THREE.Group(); grp.position.set(...g.control.pos);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 1.2, 8), this.M.slab); post.position.y = 0.6; grp.add(post);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.36, 0.2), g.theme === 'gravity' ? M.amber : g.theme === 'pressure' ? M.cyan : M.amber); head.position.y = 1.35; grp.add(head);
    root.add(grp); return grp;
  }

  _keyProp(k, root, M, mat) {
    const grp = new THREE.Group(); grp.position.set(...k.pos);
    if (k.kind === 'cell') {
      const cell = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.7, 10), M.amber); cell.position.y = k.floating ? 0 : 0.5; grp.add(cell);
      const cage = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.03, 6, 16), mat.metal); cage.rotation.x = Math.PI / 2; cage.position.y = cell.position.y; grp.add(cage);
    } else if (k.kind === 'relay') {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.18, 1.3, 6), mat.metal); post.position.y = 0.65; grp.add(post);
      const cap = new THREE.Mesh(new THREE.OctahedronGeometry(0.2), this.relays.has(k.id) ? M.cyan : M.dark); cap.position.y = 1.45; grp.add(cap); grp.userData.cap = cap;
    } else if (k.kind === 'terminal') {
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 1.0, 6), mat.metal); base.position.y = 0.5; grp.add(base);
      const screen = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.45, 0.06), this.terminals.has(k.id) ? M.cyan : M.dark); screen.position.set(0, 1.2, 0); screen.rotation.x = -0.4; grp.add(screen); grp.userData.cap = screen;
    } else if (k.kind === 'valve') {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 1.0, 8), mat.metal); post.position.y = 0.5; grp.add(post);
      const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.05, 6, 14), mat.rust); wheel.position.y = 1.05; grp.add(wheel); grp.userData.wheel = wheel;
    } else if (k.kind === 'plates') {
      const g = this.gates.find((q) => q.keys.includes(k));
      grp.position.set(0, 0, 0);
      grp.userData.plates = g.plates.map((p) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.75, 0.08, 12), M.dark); m.position.set(p[0], p[1] + 0.04, p[2]); grp.add(m); return m; });
    }
    root.add(grp); return grp;
  }

  spanPresent(g) {
    if (g.theme === 'light') return this.solved.has(g.id);
    const c = g.cycle, ph = ((this.time + c.offset) % c.period + c.period) % c.period;
    return ph < c.open;
  }
  phase(g) { const c = g.cycle; return ((this.time + c.offset) % c.period + c.period) % c.period; }

  // what you can do from position p (feet), or null
  offer(p) {
    let best = null, bd = REACH;
    const consider = (pos, o) => { const d = Math.hypot(pos[0] - p[0], (pos[1] - p[1]) * 0.5, pos[2] - p[2]); if (d < bd) { bd = d; best = o; } };
    for (const g of this.gates) {
      if (this.solved.has(g.id)) continue;
      for (const k of g.keys) {
        if (k.kind === 'cell' && !this.carrying && !this.cellsDelivered.has(k.id)) consider(k.pos, { text: 'Take the charged cell', act: () => { this.carrying = k.id; return 'Cell taken'; } });
        if (k.kind === 'relay' && !this.relays.has(k.id)) consider(k.pos, { text: 'Close the relay', act: () => { this.relays.add(k.id); this._checkLight(g); return this.solved.has(g.id) ? 'Bridge lit' : 'Relay closed: one more'; } });
        if (k.kind === 'terminal' && !this.terminals.has(k.id)) consider(k.pos, { text: 'Align the fold frames', act: () => { this.terminals.add(k.id); this.solved.add(g.id); return 'Frames aligned'; } });
        if (k.kind === 'valve') consider(k.pos, { text: `Turn the valve (${this.valves[g.id] || 0} of 5, the door wants ${g.reference})`, act: () => { this.valves[g.id] = ((this.valves[g.id] || 0) + 1) % 6; if (this.valves[g.id] === g.reference) { this.solved.add(g.id); return 'Pressure matched: door unsealed'; } return `Valve at ${this.valves[g.id]}`; } });
      }
      if (g.kind === 'door' && g.theme === 'gravity') consider(g.control.pos, this.carrying ? { text: 'Seat the cell', act: () => { this.cellsDelivered.add(this.carrying); this.carrying = null; this.solved.add(g.id); return 'Power restored: door open'; } } : { text: 'Unpowered door: needs a charged cell', act: () => 'Needs a charged cell' });
      if (g.kind === 'door' && g.theme === 'resonance') consider(g.control.pos, { text: 'Sealed: the floor plates before it', act: () => 'Step on the plates in the order they light' });
      if (g.kind === 'door' && g.theme === 'pressure') consider(g.control.pos, { text: `Sealed: pressure reference ${g.reference}`, act: () => `Match the valve to ${g.reference}` });
    }
    return best;
  }

  _checkLight(g) { if (g.keys.every((k) => this.relays.has(k.id))) this.solved.add(g.id); }

  // the next thing the route asks for, for the compass: a key before its lock
  objective(routeIndex, p) {
    for (const g of this.gates) {
      if (this.solved.has(g.id) || g.at < routeIndex || g.theme === 'time') continue;
      if (g.at > routeIndex + 4) return null;
      if (g.theme === 'gravity') return this.carrying ? { pos: g.control.pos, label: 'SOCKET' } : { pos: g.keys[0].pos, label: 'CELL' };
      const k = g.keys.find((q) => !(this.relays.has(q.id) || this.terminals.has(q.id)));
      if (g.theme === 'resonance' || g.theme === 'pressure') return { pos: g.keys[0].pos, label: THEME_NAMES[g.theme].toUpperCase() };
      if (k) return { pos: k.pos, label: k.kind.toUpperCase() };
    }
    return null;
  }

  update(dt, p) {
    this.time += dt;
    for (const v of this.working) {
      const d = v.d, h = d.y1 - d.y0;
      v.inGap = p[1] > d.y0 - 0.5 && p[1] < d.y1 && inside([p[0], p[2]], v.gap, 0);
      if (d.kind === 'powered') {
        // lifts when you're near and on its level, quick enough not to stop you; drops behind you
        const near = Math.hypot(p[0] - d.mid[0], p[2] - d.mid[1]) < 4.2 && p[1] > d.y0 - 1 && p[1] < d.y1;
        v.open += Math.sign((near ? 1 : 0) - v.open) * Math.min(Math.abs((near ? 1 : 0) - v.open), dt / 0.4);
        v.panel.position.y = d.y0 + h / 2 + v.open * (h - 0.25);
      } else {
        const c = d.cycle, ph = ((this.time + c.offset) % c.period + c.period) % c.period, on = ph < c.open, blink = Math.floor(this.time * 9) % 2 === 0;
        const turning = on ? ph > c.open - 1.2 : ph > c.period - 1.2;
        v.open = on ? 1 : 0;
        // (about to turn: it glitches between the two)
        const showWreck = turning && blink ? !on : on;
        v.wreck.visible = showWreck; v.whole.visible = !showWreck;
        const lamp = turning ? (blink ? this.M.amber : this.M.dark) : on ? this.M.cyan : this.M.red;
        for (const t of v.tells) t.material = lamp;
      }
    }
    for (const g of this.gates) {
      const v = this.visual.get(g.id);
      if (g.kind === 'door') {
        const target = this.solved.has(g.id) ? 1 : 0;
        v.open += Math.sign(target - v.open) * Math.min(Math.abs(target - v.open), dt / 1.4);
        v.slab.position.y = g.door.y0 + (g.door.y1 - g.door.y0) / 2 + v.open * (g.door.y1 - g.door.y0 - 0.15);
        v.lamp.material = this.solved.has(g.id) ? this.M.cyan : this.M.red;
      } else if (g.kind === 'span') {
        if (g.theme === 'light') v.bridge.visible = this.solved.has(g.id);
        else {
          // solid (steady), about to go (its glow stuttering for the last 1.5 s), gone (a ghost that
          // strengthens as it comes back, flickering just before); the corner lamps the same: cyan,
          // amber blinking, red, amber
          const c = g.cycle, ph = this.phase(g), on = ph < c.open, blink = Math.floor(this.time * 8) % 2 === 0;
          const going = on && ph > c.open - 1.5, coming = !on && ph > c.period - 1.5;
          // gone, it falls: down the pit under gravity, tumbling, till it meets the floor; then the
          // same played backwards, rising into place just as it's due (shuddering before it goes)
          let y = 0, ang = 0, back = false;
          if (on) { if (going) y = 0.03 * Math.sin(this.time * 53) * Math.min(1, (ph - (c.open - 1.5)) / 1.5); }
          else {
            const D = c.period - c.open, t = ph - c.open, tt = t < D / 2 ? t : D - t, depth = Math.max(2, g.floor.y - g.pitFloor - 0.6);
            back = t >= D / 2;
            y = -Math.min(depth, 4.905 * tt * tt); ang = 0.85 * Math.min(tt, Math.sqrt(depth / 4.905));
          }
          v.pivot.position.y = g.floor.y + y; v.pivot.quaternion.setFromAxisAngle(v.axis, ang);
          v.bridge.material = back ? this.M.timeOn : going && blink ? this.M.timeDim : this.M.timeOn;
          v.ghost.visible = !on; v.ghost.material = this.M.ghost[coming ? (blink ? 2 : 1) : 0];
          const lamp = on ? (going ? (blink ? this.M.amber : this.M.dark) : this.M.cyan) : (coming ? (blink ? this.M.amber : this.M.dark) : this.M.red);
          for (const t of v.tells) t.material = lamp;
        }
      } else if (g.kind === 'fold') for (const m of v.membranes) m.visible = this.solved.has(g.id);
      for (const k of g.keys) {
        const prop = v.keys.get(k.id);
        if (k.kind === 'cell') prop.visible = this.carrying !== k.id && !this.cellsDelivered.has(k.id);
        if (k.kind === 'relay' || k.kind === 'terminal') prop.userData.cap.material = (this.relays.has(k.id) || this.terminals.has(k.id)) ? this.M.cyan : this.M.dark;
        if (k.kind === 'valve') prop.userData.wheel.rotation.z = (this.valves[g.id] || 0) * 1.1;
        if (k.kind === 'plates' && !this.solved.has(g.id)) this._plates(g, prop, p);
        if (k.kind === 'plates' && this.solved.has(g.id)) for (const m of prop.userData.plates) m.material = this.M.cyan;
      }
    }
  }

  // plates: show the order (a slow pulse round them), follow your steps; a wrong
  // step just starts again
  _plates(g, prop, p) {
    const prog = this.plates[g.id] || 0, shown = Math.floor(this.time / 0.8) % 4;
    g.plates.forEach((pl, i) => {
      const on = Math.hypot(p[0] - pl[0], p[2] - pl[2]) < 0.75 && Math.abs(p[1] - pl[1]) < 0.5;
      const rank = g.order.indexOf(i);
      if (on && rank === prog) this.plates[g.id] = prog + 1;
      else if (on && rank > prog) this.plates[g.id] = 0;
      const lit = rank < (this.plates[g.id] || 0) || rank === shown;
      prop.userData.plates[i].material = lit ? (rank < (this.plates[g.id] || 0) ? this.M.cyan : this.M.amber) : this.M.dark;
    });
    if ((this.plates[g.id] || 0) >= 3) this.solved.add(g.id);
  }

  save() { return { solved: [...this.solved], relays: [...this.relays], terminals: [...this.terminals], valves: this.valves, carrying: this.carrying, cellsDelivered: [...this.cellsDelivered] }; }
}

// A suit's sense for the site's glitches (one per player): the first time you come near one it says
// so, and again once you've been well away. Near means on about its level: a glitch a floor below
// or above, through the rock, isn't noticed; one met within a few seconds of another is the same.
export class AnomalySense {
  constructor(anomalies) { this.anomalies = anomalies; this.armed = anomalies.map(() => true); this.time = 0; this.last = -Infinity; this.alert = null; }
  update(dt, p) {
    this.time += dt;
    this.anomalies.forEach((a, i) => {
      const d = Math.hypot(p[0] - a.pos[0], p[2] - a.pos[2]), dy = Math.abs(p[1] - a.pos[1]);
      if (this.armed[i] && d < a.r && dy < 6) {
        this.armed[i] = false;
        if (this.time - this.last > 6) this.alert = ANOMALY_SAYS[a.kind];
        this.last = this.time;
      } else if (!this.armed[i] && (d > a.r + ANOMALY_REARM || dy > 16)) this.armed[i] = true;
    });
  }
  takeAlert() { const a = this.alert; this.alert = null; return a; }
}
