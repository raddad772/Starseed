// The site's glitches at play (plan/glitches.js): how each looks and moves, on the site's own clock (the
// same for everyone there), what of it you can't walk through, and where they are for the suit's sense
// (AnomalySense). The weight patches are the site's zones (plan/compile.js): the walker feels them and
// says so itself.
import * as THREE from 'three';
import * as G from '../plan/geom2.js';

// (what the suit calls each theme's: the weight patches the walker's own warnings)
const SENSE = { time: 'temporal', space: 'spatial', light: 'photonic', pressure: 'pressure', resonance: 'acoustic' };

// a glitch's own steady randomness (how its rubble lies), from its id
function rand(id) {
  let h = 2166136261;
  for (const c of id) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
}
const yawOf = (d) => Math.atan2(d[0], d[1]);
// (a cycle's phase, 0..1)
const cyc = (t, period, off = 0) => (((t + off) / period) % 1 + 1) % 1;

export class SiteGlitches {
  constructor(site, collision, root, mat) {
    this.time = 0;
    const glow = (c, i = 1.2, o = 1) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: i, ...(o < 1 ? { transparent: true, opacity: o, depthWrite: false } : {}) });
    const veil = (c, o) => new THREE.MeshStandardMaterial({ color: c, roughness: 1, transparent: true, opacity: o, depthWrite: false, side: THREE.DoubleSide });
    this.M = {
      fold: new THREE.MeshStandardMaterial({ color: '#c8b8ff', emissive: '#a890ff', emissiveIntensity: 1.1, transparent: true, opacity: 0.3, depthWrite: false, side: THREE.DoubleSide }),
      warm: glow('#ffe2b0', 1.6), cyan: glow('#9ff0e0', 1.3), off: new THREE.MeshStandardMaterial({ color: '#2a2a26', roughness: 0.8 }),
      core: glow('#fff4dc', 2.2, 0.95), halo: glow('#ffe9c4', 0.35, 0.07), dust: glow('#cfc9bc', 0.25),
      puff: new THREE.MeshStandardMaterial({ color: '#e6ecec', roughness: 1, map: softDisc(), transparent: true, opacity: 0.3, depthWrite: false, side: THREE.DoubleSide }),
      mist: new THREE.MeshStandardMaterial({ color: '#d4dcdc', roughness: 1, map: softDisc(), transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide }),
      seam: glow('#ffd9a0', 0.2), past: glow('#ffcf7a', 0.35),
      clean: new THREE.MeshStandardMaterial({ color: '#a9b0ae', roughness: 0.35, metalness: 0.1, transparent: true, opacity: 0.35, depthWrite: false }),
      wall: new THREE.MeshStandardMaterial({ color: '#dfe6e6', roughness: 1, map: softDisc(), transparent: true, opacity: 0.35, depthWrite: false, side: THREE.DoubleSide }),
      echo: [0.5, 0.34, 0.22, 0.12, 0.05].map((o) => veil('#8a8a82', o)),
    };
    this.parts = [];
    for (const g of site.glitches || []) {
      const make = BUILD[g.kind];
      if (make) this.parts.push(make(g, { root, mat, M: this.M, collision, rnd: rand(g.id) }));
    }
    this.anomalies = (site.glitches || []).filter((g) => SENSE[g.theme]).map((g) => ({ pos: [g.center[0], g.y0, g.center[1]], r: (g.set ? 16 : 10) + (g.r || 2), kind: SENSE[g.theme] }));
  }
  // (where each player is, this frame: each tells it; the site moves once a frame for them all)
  touch(p) { (this.near || (this.near = [])).push(p.slice()); }
  update(dt, p = null) {
    if (p) this.touch(p);
    this.time += dt;
    const occ = this.near || []; this.near = [];
    for (const u of this.parts) u(this.time, occ, dt);
  }
}

// a point on the glitch's floor: in its room, within reach of its middle; in its passage, along its
// stretch and short of its walls
function spot(g, rnd, reach = 1) {
  if (g.node) { const a = rnd() * Math.PI * 2, rr = Math.sqrt(rnd()) * Math.max(0.6, g.r - 1.2) * reach; return [g.center[0] + Math.cos(a) * rr, g.center[1] + Math.sin(a) * rr]; }
  const s = (rnd() * 2 - 1) * 4 * reach, w = (rnd() * 2 - 1) * Math.max(0.3, g.width - 0.7);
  return [g.center[0] + g.dir[0] * s - g.dir[1] * w, g.center[1] + g.dir[1] * s + g.dir[0] * w];
}
// where a passage's wall is, on its side (and which way is into the passage), at its middle
function passageWall(g, side = g.side || 1) {
  const n = [-g.dir[1] * side, g.dir[0] * side];
  return { mid: G.add(g.center, G.mul(n, g.width)), inward: G.mul(n, -1), along: g.dir };
}

const BUILD = {
  // weight falls to a third: the loose rubble afloat overhead, turning, bobbing
  lull(g, { root, mat, rnd }) {
    const bits = [];
    for (let i = 0; i < 14; i++) {
      const m = new THREE.Mesh(new THREE.DodecahedronGeometry(0.1 + rnd() * 0.22, 0), rnd() < 0.6 ? mat.concrete : mat.rock);
      const [x, z] = spot(g, rnd);
      bits.push({ m, x, z, h: 2.0 + rnd() * Math.min(1.8, g.y1 - g.y0 - 2.6), ph: rnd() * 6.3, sp: 0.25 + rnd() * 0.4, rot: [rnd() - 0.5, rnd() - 0.5, rnd() - 0.5] });
      root.add(m);
    }
    return (t) => { for (const b of bits) { b.m.position.set(b.x, g.y0 + b.h + 0.22 * Math.sin(t * b.sp + b.ph), b.z); b.m.rotation.set(t * b.rot[0], t * b.rot[1] + b.ph, t * b.rot[2]); } };
  },
  // weight near double: the floor cracked out from its middle, its grit pressed flat, the dust in the
  // air falling fast
  press(g, { root, mat, M, rnd }) {
    const c = g.center, y = g.y0 + 0.012;
    // (each crack a jagged run out from the middle, hairline and flush, a few short legs each turned a little)
    for (let i = 0; i < 11; i++) {
      let a = rnd() * Math.PI * 2, r = rnd() * 0.4, x = c[0] + Math.cos(a) * r, z = c[1] + Math.sin(a) * r;
      const L = 0.8 + rnd() * (g.node ? Math.min(3, g.r - 0.8) : 2), legs = 3 + Math.floor(rnd() * 3);
      for (let k = 0; k < legs; k++) {
        const l = L / legs, h = a + (rnd() - 0.5) * 0.9, dx = Math.cos(h) * l, dz = Math.sin(h) * l;
        const m = new THREE.Mesh(new THREE.BoxGeometry(0.028 * (1 - k / (legs + 1)), 0.004, l + 0.02), mat.dark);
        m.position.set(x + dx / 2, y - 0.006, z + dz / 2); m.rotation.y = Math.atan2(dx, dz); root.add(m);
        x += dx; z += dz;
      }
    }
    for (let i = 0; i < 7; i++) { const [x, z] = spot(g, rnd, 0.5); const m = new THREE.Mesh(new THREE.DodecahedronGeometry(0.14 + rnd() * 0.14, 0), mat.rock); m.scale.set(1.3, 0.22, 1.3); m.position.set(x, g.y0 + 0.03, z); m.rotation.y = rnd() * 6; root.add(m); }
    const N = 30, dust = new THREE.InstancedMesh(new THREE.SphereGeometry(0.018, 5, 3), M.dust, N), at = [];
    for (let i = 0; i < N; i++) at.push({ xz: spot(g, rnd), ph: rnd() });
    dust.frustumCulled = false; root.add(dust);
    const _m = new THREE.Matrix4(), top = Math.min(g.y1 - 0.3, g.y0 + 4.5), fall = Math.sqrt(2 * (top - g.y0) / (9.81 * 1.8));
    return (t) => {
      at.forEach((d, i) => { const u = cyc(t, fall * 1.6, d.ph * fall * 1.6) * 1.6 * fall; const yy = Math.max(g.y0, top - 0.5 * 9.81 * 1.8 * u * u); _m.makeTranslation(d.xz[0], yy, d.xz[1]); dust.setMatrixAt(i, _m); });
      dust.instanceMatrix.needsUpdate = true;
    };
  },
  // a fall of rubble rising back into the ceiling it came from (the fall played backwards: fast off the
  // floor, slowing into place), held there whole a moment, then falling again
  rewind(g, { root, mat, M, rnd, collision }) {
    const pile = g.pile || g.center, top = Math.min(g.y1 - 0.45, g.y0 + 6), blocks = [], off = rnd() * 15;
    for (let i = 0; i < 7; i++) {
      const sx = 0.35 + rnd() * 0.4, sy = 0.25 + rnd() * 0.3, sz = 0.35 + rnd() * 0.4;
      const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), rnd() < 0.7 ? mat.concrete : mat.rock);
      const a = rnd() * Math.PI * 2, rr = 0.2 + rnd() * 1.1, rest = [pile[0] + Math.cos(a) * rr, g.y0 + sy / 2, pile[1] + Math.sin(a) * rr];
      const up = [pile[0] + ((i % 3) - 1) * 0.62, top - 0.15, pile[1] + (Math.floor(i / 3) - 1) * 0.62];
      const q0 = new THREE.Quaternion().setFromEuler(new THREE.Euler(rnd() * 0.6 - 0.3, rnd() * 6.3, rnd() * 0.6 - 0.3));
      const b = { m, rest, up, q0, mat: m.material, resting: true, inside: false };
      // (lying, it's solid; it never rises out from under you, nor lands on you)
      const foot = G.orientedRect([rest[0], rest[2]], [Math.cos(a), Math.sin(a)], sx / 2 + 0.05, sz / 2 + 0.05);
      b.foot = G.inflate(foot, 0.4);
      collision.addBlocker({ poly: foot, y0: g.y0, y1: g.y0 + sy, active: () => b.resting && !b.inside });
      blocks.push(b); root.add(m);
    }
    const P = 15, RISE = 2.4, HOLD = 1.6, _q = new THREE.Quaternion(), _e = new THREE.Quaternion();
    return (t, occ) => {
      const ph = cyc(t, P, off) * P, t0 = 7, t1 = t0 + RISE, t2 = t1 + HOLD, fallT = Math.sqrt(2 * (top - g.y0) / 9.81);
      for (const b of blocks) {
        const inside = b.inside = occ.some((p) => Math.abs(p[1] - g.y0) < 1.5 && G.inside([p[0], p[2]], b.foot, 0));
        let u = 0; // 0 resting, 1 in place overhead
        if (ph >= t0 && ph < t1) { const s = (ph - t0) / RISE; u = 1 - (1 - s) * (1 - s); }
        else if (ph >= t1 && ph < t2) u = 1;
        else if (ph >= t2 && ph < t2 + fallT) { const s = ph - t2, dy = 0.5 * 9.81 * s * s; u = Math.max(0, 1 - dy / (top - g.y0)); }
        // (someone standing where it lies: it stays put this time)
        if (inside && b.resting) u = 0;
        b.resting = u === 0;
        b.m.position.set(b.rest[0] + (b.up[0] - b.rest[0]) * u, b.rest[1] + (b.up[1] - b.rest[1]) * u, b.rest[2] + (b.up[2] - b.rest[2]) * u);
        b.m.quaternion.copy(_q.copy(b.q0).slerp(_e.identity(), u));
        b.m.material = u > 0.98 ? M.past : b.mat;
      }
    };
  },
  // a dead lamp lit now and then as it was in the founders' day: warm and clean, stuttering on, for a
  // breath or two, then dead again
  flare(g, { root, mat, M, rnd }) {
    const w = g.wall, y = g.y0 + Math.min(3.4, (g.y1 - g.y0) * 0.6), at = G.add(w.mid, G.mul(w.inward, 0.14)), off = rnd() * 11;
    const grp = new THREE.Group(); grp.position.set(at[0], y, at[1]); grp.rotation.y = yawOf(w.inward); root.add(grp);
    const housing = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.3, 0.24), mat.metal); grp.add(housing);
    const panel = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.12, 0.05), M.off); panel.position.set(0, -0.1, 0.11); grp.add(panel);
    const light = new THREE.PointLight(0xffe2b0, 0, 18, 2); light.position.set(0, -0.4, 0.7); grp.add(light);
    return (t) => {
      const ph = cyc(t, 11, off) * 11, lit = ph < 2.6 && (ph > 0.45 || Math.floor(t * 14) % 3 === 0);
      panel.material = lit ? M.warm : M.off; light.intensity = lit ? 70 : 0;
    };
  },
  // a stretch of passage folded away: step into the near frame and out of the far one (and back)
  skip(g, { root, M, collision }) {
    const ms = g.frames.map((f) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(f.half * 2 + 0.3, 3.0), M.fold);
      m.position.set(f.pos[0], f.pos[1] + 1.5, f.pos[2]); m.rotation.y = yawOf(f.dir); root.add(m); return m;
    });
    collision.addPortal({ a: g.frames[0], b: g.frames[1], active: () => true });
    return (t) => { for (const [i, m] of ms.entries()) m.scale.set(1 + 0.02 * Math.sin(t * 3.1 + i), 1 + 0.03 * Math.sin(t * 2.3 + i * 2), 1); };
  },
  // one fallen block by the wall, and its echoes on down the passage, each fainter, drifting on and
  // fading as the next comes out of it
  repeat(g, { root, mat, M, collision }) {
    const side = g.side || 1, n = [-g.dir[1] * side, g.dir[0] * side], c = G.add(g.center, G.mul(n, g.width - 0.75)), yaw = yawOf(g.dir);
    const geo = new THREE.BoxGeometry(0.75, 0.6, 1.0), block = new THREE.Mesh(geo, mat.concrete);
    block.position.set(c[0], g.y0 + 0.3, c[1]); block.rotation.y = yaw + 0.25; root.add(block);
    collision.addBlocker({ poly: G.orientedRect(c, [Math.sin(yaw + 0.25), Math.cos(yaw + 0.25)], 0.55, 0.42), y0: g.y0, y1: g.y0 + 0.6, active: () => true });
    const echoes = M.echo.map((m) => { const e = new THREE.Mesh(geo, m); e.rotation.y = yaw + 0.25; root.add(e); return e; });
    return (t) => {
      const f = cyc(t, 5);
      echoes.forEach((e, k) => { const s = 1.7 * (k + f); e.position.set(c[0] + g.dir[0] * s, g.y0 + 0.3, c[1] + g.dir[1] * s); e.visible = k + f > 0.25; });
    };
  },
  // light with nothing giving it, hanging in a room and drifting about it
  pool(g, { root, M, rnd }) {
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 8), M.core), halo = new THREE.Mesh(new THREE.SphereGeometry(0.75, 16, 10), M.halo);
    const light = new THREE.PointLight(0xfff1d6, 35, 14, 2), off = rnd() * 50, R = Math.max(0.5, (g.r || 2) - 1.5) * 0.6;
    root.add(core, halo, light);
    return (t) => {
      const x = g.center[0] + R * Math.sin((t + off) * 0.13), z = g.center[1] + R * Math.cos((t + off) * 0.093), y = g.y0 + Math.min(3, (g.y1 - g.y0) * 0.5) + 0.35 * Math.sin((t + off) * 0.21);
      for (const o of [core, halo, light]) o.position.set(x, y, z);
      halo.scale.setScalar(1 + 0.08 * Math.sin(t * 1.7));
    };
  },
  // a lamp blinking, and its light reaching the floor a second after it (the lamp lit, the floor dark;
  // then the floor lit, the lamp gone dark)
  lag(g, { root, mat, M, rnd }) {
    let at, y, face;
    if (g.node) { at = g.center; y = Math.min(g.y1 - 0.25, g.y0 + 3.6); face = null; }
    else { const w = passageWall(g); at = G.add(w.mid, G.mul(w.inward, 0.12)); y = g.y0 + 3.0; face = w.inward; }
    const grp = new THREE.Group(); grp.position.set(at[0], y, at[1]); if (face) grp.rotation.y = yawOf(face); root.add(grp);
    const housing = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.22, 0.6), mat.metal); grp.add(housing);
    // (in a room, hung from the ceiling on a rod)
    if (!face && g.y1 - y > 0.4) { const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, g.y1 - y, 6), mat.metal); rod.position.y = (g.y1 - y) / 2; grp.add(rod); }
    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.05, 0.46), M.off); panel.position.y = -0.12; grp.add(panel);
    const below = face ? G.add(at, G.mul(face, 1.2)) : at;
    const disc = new THREE.Mesh(new THREE.CircleGeometry(1.5, 24), M.halo); disc.rotation.x = -Math.PI / 2; disc.position.set(below[0], g.y0 + 0.02, below[1]); disc.visible = false; root.add(disc);
    const light = new THREE.PointLight(0xffe7c2, 0, 12, 2); light.position.set(below[0], y - 0.6, below[1]); root.add(light);
    const P = 2.2 + rnd() * 0.8, LAG = 1.1;
    return (t) => {
      const on = cyc(t, P) < 0.5, there = cyc(t - LAG, P) < 0.5;
      panel.material = on ? M.warm : M.off; light.intensity = there ? 45 : 0; disc.visible = there;
    };
  },
  // vapour jetting from a crack in a wall, in bursts
  vent(g, { root, mat, M, rnd }) {
    const w = g.node ? g.wall : passageWall(g), base = G.add(w.mid, G.mul(w.inward, 0.04)), y = g.y0 + 1.1 + rnd() * 0.6, off = rnd() * 7;
    const crack = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.5, 0.05), mat.dark); crack.position.set(base[0], y, base[1]); crack.rotation.set(0, yawOf(w.inward), 0.2); root.add(crack);
    // (each puff two soft discs crossed, turned about the jet: vapour from any side, no edge to it)
    const puffs = [], disc = new THREE.PlaneGeometry(0.6, 0.6);
    for (let i = 0; i < 16; i++) {
      const m = new THREE.Group(), pm = M.puff.clone();
      for (const a of [0, Math.PI / 2]) { const q = new THREE.Mesh(disc, pm); q.rotation.y = a; m.add(q); }
      m.rotation.set(rnd() * 6, rnd() * 6, 0); root.add(m); puffs.push({ m, pm, k: i / 16, h: (rnd() - 0.5) * 1.1 });
    }
    return (t) => {
      const on = cyc(t, 7, off) < 0.5;
      for (const q of puffs) {
        const age = cyc(t * 0.9, 1, q.k);
        q.m.visible = on;
        if (!on) continue;
        const r = 0.15 + age * 2.6;
        q.m.position.set(base[0] + w.inward[0] * r, y + q.h * 0.6 + age * 0.7, base[1] + w.inward[1] * r);
        q.m.scale.setScalar(0.4 + age * 3.2); q.pm.opacity = 0.22 * (1 - age) * Math.min(1, age * 6);
      }
    };
  },
  // a sealed hatch in the wall bowing in and out, slowly, and the mist on the floor rising and sinking
  // with it
  breath(g, { root, mat, M, rnd }) {
    const w = g.wall, at = G.add(w.mid, G.mul(w.inward, 0.1)), off = rnd() * 6;
    const grp = new THREE.Group(); grp.position.set(at[0], g.y0 + 1.25, at[1]); grp.rotation.y = yawOf(w.inward); root.add(grp);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.4, 0.14), mat.metal); grp.add(frame);
    const hatch = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.0, 0.2), mat.rust); hatch.position.z = 0.05; grp.add(hatch);
    // (its seam, lit from behind where it lifts off its seat)
    const seamM = M.seam.clone(), seam = new THREE.Mesh(new THREE.BoxGeometry(1.7, 2.1, 0.04), seamM); seam.position.z = 0.02; grp.add(seam);
    // (the mist: two soft layers over the floor, the room's width)
    const R = Math.max(1.5, g.r - 0.3), layers = [0, 1].map((k) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(R * 2.4, R * 2.4), M.mist); m.rotation.set(-Math.PI / 2, 0, k * 0.8); root.add(m); return m; });
    return (t) => {
      const b = 0.5 + 0.5 * Math.sin(2 * Math.PI * (t + off) / 6.5);
      hatch.scale.z = 0.6 + 1.6 * b; hatch.position.z = 0.05 + 0.12 * b;
      seamM.emissiveIntensity = 0.1 + 1.6 * b * b;
      layers.forEach((m, k) => m.position.set(g.center[0], g.y0 + 0.12 + (0.35 + 0.25 * k) * b, g.center[1]));
    };
  },
  // a conduit singing: standing in the room, shivering, rings lit at its antinodes, each pair in turn
  hum(g, { root, mat, M, collision }) {
    const w = g.wall, at = G.add(w.mid, G.mul(w.inward, 0.55)), h = g.y1 - g.y0;
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, h, 12), mat.metal); pipe.position.set(at[0], g.y0 + h / 2, at[1]); root.add(pipe);
    collision.addBlocker({ poly: G.regularPoly(at[0], at[1], 0.24, 0.24, 8, 0), y0: g.y0, y1: g.y1, active: () => true });
    const ringM = [0, 1, 2].map(() => M.cyan.clone()), rings = ringM.map((m, k) => { const r = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.035, 6, 18), m); r.rotation.x = Math.PI / 2; r.position.set(at[0], g.y0 + h * (k + 0.5) / 3, at[1]); root.add(r); return r; });
    const light = new THREE.PointLight(0x9ff0e0, 0, 7, 2); light.position.set(at[0] + w.inward[0] * 0.4, g.y0 + h / 2, at[1] + w.inward[1] * 0.4); root.add(light);
    return (t) => {
      const s = Math.sin(2 * Math.PI * 0.8 * t);
      ringM.forEach((m, k) => { m.emissiveIntensity = 0.3 + 2.2 * Math.max(0, (k % 2 ? -s : s)) ** 2; });
      rings.forEach((r) => { r.scale.setScalar(1 + 0.05 * Math.abs(s)); });
      pipe.position.x = at[0] + 0.006 * Math.sin(t * 91); light.intensity = 6 + 10 * s * s;
    };
  },
  // the dust on the floor drawn into a standing wave's still lines (Chladni's figures), scattering and
  // drawn into the next mode's
  figure(g, { root, rnd }) {
    const size = Math.min(5, 2 * Math.max(1, g.r - 0.8)), modes = [[2, 5], [3, 7], [1, 6], [4, 7], [3, 8], [5, 8]].sort(() => rnd() - 0.5);
    const mats = modes.map(([n, m]) => new THREE.MeshStandardMaterial({ color: '#ddd5c4', map: chladni(n, m), transparent: true, opacity: 0, depthWrite: false, roughness: 1 }));
    const geo = new THREE.PlaneGeometry(size, size); geo.rotateX(-Math.PI / 2);
    const planes = mats.map((m) => { const p = new THREE.Mesh(geo, m); p.position.set(g.center[0], g.y0 + 0.015, g.center[1]); p.rotation.y = rnd() * 6; root.add(p); return p; });
    const HOLD = 6;
    return (t) => {
      const k = Math.floor(t / HOLD), f = t / HOLD - k;
      planes.forEach((p, i) => {
        const cur = k % planes.length === i, prev = (k + planes.length - 1) % planes.length === i;
        // (the last figure scatters as the next draws in)
        p.material.opacity = cur ? Math.min(1, f / 0.3) * 0.9 : prev ? Math.max(0, 1 - f / 0.2) * 0.9 : 0;
        p.visible = p.material.opacity > 0.01;
      });
    };
  },

  // ---- the set pieces ----
  // a hall's crossing in a deep lull, and the hall's loose rubble a slow cloud wheeling round it over the pit
  drift(g, { root, mat, rnd }) {
    const N = 70, cloud = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 0), mat.rock, N), bits = [];
    cloud.frustumCulled = false; root.add(cloud);
    const H = g.hall.center, R0 = Math.min(g.hall.r * 0.85, 26), m = g.center;
    // (round the catwalk, close enough for a hand light to find: within a few metres to a dozen of its line,
    // above and below its deck, each wheeling slowly about the hall's axis)
    const [wa, wb] = g.walk;
    for (let i = 0; i < N; i++) {
      const u = rnd(), q = [wa[0] + (wb[0] - wa[0]) * u, wa[1] + (wb[1] - wa[1]) * u], off = (2.5 + rnd() * 9) * (rnd() < 0.5 ? 1 : -1);
      const p = [q[0] - g.dir[1] * off, q[1] + g.dir[0] * off];
      const a = Math.atan2(p[1] - H[1], p[0] - H[0]), r = Math.min(R0, Math.max(3, Math.hypot(p[0] - H[0], p[1] - H[1])));
      bits.push({ a, r, y: g.y0 + (rnd() * 2 - 1) * 6 + 1, s: 0.15 + Math.pow(rnd(), 2) * 0.8, w: (0.004 + rnd() * 0.006) * (rnd() < 0.5 ? 1 : -1), ph: rnd() * 6.3, rot: [rnd() - 0.5, rnd() - 0.5, rnd() - 0.5] });
    }
    const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3();
    return (t) => {
      bits.forEach((b, i) => {
        const a = b.a + b.w * t;
        _p.set(H[0] + Math.cos(a) * b.r, b.y + 0.6 * Math.sin(t * 0.17 + b.ph), H[1] + Math.sin(a) * b.r);
        _q.setFromEuler(_e.set(t * b.rot[0] * 0.3, t * b.rot[1] * 0.3 + b.ph, t * b.rot[2] * 0.3)); _s.setScalar(b.s);
        cloud.setMatrixAt(i, _m.compose(_p, _q, _s));
      });
      cloud.instanceMatrix.needsUpdate = true;
    };
  },
  // a room flickering back to how it was now and then: its wall panels lit, its floor clean, its console on
  was(g, { root, mat, M, rnd }) {
    const grp = new THREE.Group(), off = rnd() * 13; grp.visible = false; root.add(grp);
    const poly = g.poly, n = poly.length, cx = g.center[0], cz = g.center[1];
    for (let i = 0; i < n; i++) {
      const a = poly[i], b = poly[(i + 1) % n], L = Math.hypot(b[0] - a[0], b[1] - a[1]), mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2;
      const inx = cx - mx, inz = cz - mz, il = Math.hypot(inx, inz) || 1;
      const strip = new THREE.Mesh(new THREE.BoxGeometry(L * 0.8, 0.14, 0.04), M.warm);
      strip.position.set(mx + inx / il * 0.12, g.y0 + Math.min(3, (g.y1 - g.y0) * 0.55), mz + inz / il * 0.12); strip.rotation.y = Math.atan2(b[0] - a[0], b[1] - a[1]) - Math.PI / 2;
      grp.add(strip);
    }
    const shape = new THREE.Shape(poly.map(([x, z]) => new THREE.Vector2(x, -z)));
    const floor = new THREE.Mesh(new THREE.ShapeGeometry(shape), M.clean); floor.rotation.x = -Math.PI / 2; floor.position.y = g.y0 + 0.012; grp.add(floor);
    const desk = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 0.7), mat.metal); desk.position.set(cx, g.y0 + 0.45, cz); grp.add(desk);
    const screen = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.5, 0.05), M.cyan); screen.position.set(cx, g.y0 + 1.25, cz - 0.2); screen.rotation.x = -0.3; grp.add(screen);
    const light = new THREE.PointLight(0xfff0d8, 0, 16, 2); light.position.set(cx, Math.min(g.y1 - 0.5, g.y0 + 4), cz); root.add(light);
    return (t) => {
      const ph = cyc(t, 13, off) * 13, on = ph < 3.4, edge = ph < 0.5 || (ph > 2.9 && ph < 3.4);
      const shown = on && (!edge || Math.floor(t * 15) % 2 === 0);
      grp.visible = shown; light.intensity = shown ? 22 : 0;
    };
  },
  // a dead end's passage folding back on itself for a while: on into its far frame, out of its near one
  loop(g, { root, M, collision }) {
    const c = g.cycle, clock = { t: 0 }, active = () => cyc(clock.t, c.period) * c.period < c.open;
    const ms = g.frames.map((f) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(f.half * 2 + 0.3, 2.9), M.fold.clone());
      m.position.set(f.pos[0], f.pos[1] + 1.45, f.pos[2]); m.rotation.y = yawOf(f.dir); root.add(m); return m;
    });
    collision.addPortal({ a: g.frames[0], b: g.frames[1], oneWay: true, active });
    return (t) => {
      clock.t = t;
      const ph = cyc(t, c.period) * c.period, on = ph < c.open, going = on && ph > c.open - 2;
      for (const m of ms) { m.visible = on; m.material.opacity = going ? 0.12 + 0.18 * (Math.floor(t * 8) % 2) : 0.3; }
    };
  },
  // sourceless lights swarming slowly over a hall's pit round its crossing
  motes(g, { root, M, rnd }) {
    const N = 60, sw = new THREE.InstancedMesh(new THREE.SphereGeometry(0.13, 8, 6), M.core, N), m = g.center, bits = [];
    sw.frustumCulled = false; root.add(sw);
    for (let i = 0; i < N; i++) bits.push({ r: 3 + rnd() * 12, a: rnd() * 6.3, y: g.y0 + (rnd() * 2 - 1) * 6, w: (0.05 + rnd() * 0.12) * (rnd() < 0.5 ? 1 : -1), ph: rnd() * 6.3 });
    const lights = [0, 1].map(() => { const l = new THREE.PointLight(0xfff1d6, 25, 14, 2); root.add(l); return l; });
    const _m = new THREE.Matrix4();
    return (t) => {
      bits.forEach((b, i) => { const a = b.a + b.w * t; _m.makeTranslation(m[0] + Math.cos(a) * b.r, b.y + 1.2 * Math.sin(t * 0.3 + b.ph), m[1] + Math.sin(a) * b.r); sw.setMatrixAt(i, _m); });
      sw.instanceMatrix.needsUpdate = true;
      lights.forEach((l, k) => { const b = bits[k * 7], a = b.a + b.w * t; l.position.set(m[0] + Math.cos(a) * b.r, b.y + 1.2 * Math.sin(t * 0.3 + b.ph), m[1] + Math.sin(a) * b.r); });
    };
  },
  // a wall of mist sweeping down a passage now and then, shoving whoever it passes along with it
  front(g, { root, M, rnd, collision }) {
    const W = g.width * 2 + 0.4, H = g.y1 - g.y0, off = rnd() * 20, P = 20, RUN = 6;
    const layers = [0, 0.7, 1.4].map((k) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(W * 1.6, H * 1.6), M.wall.clone()); m.rotation.y = yawOf(g.dir); m.userData.k = k; root.add(m); return m; });
    const state = { s: -1 };
    // (its shove: along the passage at the front's own pace, on those within a metre and a half of it)
    collision.addPush((p) => {
      if (state.s < 0 || p[1] < g.y0 - 0.5 || p[1] > g.y1) return null;
      const rx = p[0] - g.from[0], rz = p[2] - g.from[1], al = rx * g.dir[0] + rz * g.dir[1], ac = Math.abs(-rx * g.dir[1] + rz * g.dir[0]);
      if (ac > g.width + 0.3 || Math.abs(al - state.s) > 1.5) return null;
      const v = g.len / RUN * 0.8; return [g.dir[0] * v, g.dir[1] * v];
    });
    return (t) => {
      const ph = cyc(t, P, off) * P;
      state.s = ph < RUN ? (ph / RUN) * g.len : -1;
      for (const m of layers) {
        m.visible = state.s >= 0;
        if (!m.visible) continue;
        const s = state.s - m.userData.k, fade = Math.min(1, ph / 0.8, (RUN - ph) / 0.8);
        m.position.set(g.from[0] + g.dir[0] * s, g.y0 + H / 2, g.from[1] + g.dir[1] * s); m.material.opacity = 0.35 * fade;
      }
    };
  },
  // a crossing's rails singing: lit at their antinodes, each half of them in turn
  chorus(g, { root, M }) {
    const [a, b] = g.walk, L = Math.hypot(b[0] - a[0], b[1] - a[1]), d = [(b[0] - a[0]) / L, (b[1] - a[1]) / L], side = [-d[1], d[0]];
    const geo = new THREE.SphereGeometry(0.1, 8, 6), mats = [M.cyan.clone(), M.cyan.clone()];
    const meshes = mats.map((m, k) => { const n = Math.floor(L / 1.2) * 2, im = new THREE.InstancedMesh(geo, m, n); im.frustumCulled = false; root.add(im); return im; });
    const _m = new THREE.Matrix4(), count = [0, 0];
    for (let s = 1.2, i = 0; s < L - 0.6; s += 1.2, i++) {
      for (const sg of [-1, 1]) {
        const k = i % 2, x = a[0] + d[0] * s + side[0] * sg * 1.25, z = a[1] + d[1] * s + side[1] * sg * 1.25;
        meshes[k].setMatrixAt(count[k]++, _m.makeTranslation(x, g.y0 + 1.05, z));
      }
    }
    meshes.forEach((m, k) => { m.count = count[k]; m.instanceMatrix.needsUpdate = true; });
    return (t) => { const s = Math.sin(2 * Math.PI * 0.6 * t); mats[0].emissiveIntensity = 0.2 + 2.4 * Math.max(0, s) ** 2; mats[1].emissiveIntensity = 0.2 + 2.4 * Math.max(0, -s) ** 2; };
  },
};

// a soft round spot: white, its alpha falling off from the middle (a puff's)
let _soft = null;
function softDisc(S = 64) {
  if (_soft) return _soft;
  const data = new Uint8Array(S * S * 4);
  for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) {
    const r = Math.hypot((i + 0.5) / S * 2 - 1, (j + 0.5) / S * 2 - 1), a = Math.max(0, 1 - r) ** 2, k = (j * S + i) * 4;
    data[k] = data[k + 1] = data[k + 2] = 255; data[k + 3] = Math.round(255 * a);
  }
  _soft = new THREE.DataTexture(data, S, S, THREE.RGBAFormat); _soft.magFilter = THREE.LinearFilter; _soft.minFilter = THREE.LinearFilter; _soft.needsUpdate = true;
  return _soft;
}
// a square plate's mode (n, m): the dust gathered on its still lines, as a texture (alpha the dust)
function chladni(n, m, S = 256) {
  const data = new Uint8Array(S * S * 4);
  for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) {
    const x = (i + 0.5) / S, y = (j + 0.5) / S, X = x * 2 - 1, Y = y * 2 - 1;
    const f = Math.cos(n * Math.PI * x) * Math.cos(m * Math.PI * y) - Math.cos(m * Math.PI * x) * Math.cos(n * Math.PI * y);
    const edge = Math.max(0, 1 - Math.max(0, Math.hypot(X, Y) - 0.8) / 0.2);
    const a = Math.exp(-((f / 0.05) ** 2)) * edge, k = (j * S + i) * 4;
    data[k] = 221; data[k + 1] = 213; data[k + 2] = 196; data[k + 3] = Math.round(255 * Math.min(1, a * 1.15));
  }
  const tex = new THREE.DataTexture(data, S, S, THREE.RGBAFormat);
  tex.colorSpace = THREE.SRGBColorSpace; tex.magFilter = THREE.LinearFilter; tex.minFilter = THREE.LinearFilter; tex.needsUpdate = true;
  return tex;
}
