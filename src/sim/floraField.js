// Trees and boulders as solid things.
//
// The flora a planet shows is deterministic: gen/flora.js scatters it per
// terrain node from the planet's seed (the renderer runs that in its workers
// for the ground near the camera). The world needs the same trees wherever
// anything moves, watched or not, so this field computes them itself, on
// demand, per node, and keeps the solid ones in a spatial hash: tree trunks
// (upright cylinders) and rocks (spheres, sunk a little as drawn). Shrubs and
// small plants are passable. Clearings (around landing sites) are shared with
// the renderer through the body, so what you see is what you hit.
//
// World state (a function of the seed): physics, the walker and the nav
// computer query it; the renderer may hand it nodes it has already built
// (identical, so it just saves the work).

import { scatterFlora, floraSpecies } from '../gen/flora.js';
import { faceUVFromDir } from '../gen/cubesphere.js';
import { ROCK_STRIDE, rockShapeOf } from '../gen/rocks.js';

const CELL = 16; // m: spatial hash cell (body-fixed)
// trunk radius at the base, as a fraction of the tree's height (render/floraRender.js)
const TRUNK = { conifer: 0.035, broadleaf: 0.045, bulb: 0.03, fern: 0.04, mushroom: 0.07, spire: 0.05 };

export class FloraField {
  constructor(body) {
    this.body = body;
    this.level = Math.max(2, body.maxLevel - 3);
    this.nodes = new Map();     // 'face:ix:iy' -> true once added
    this.cells = new Map();     // hash -> [items]
    this.count = 0;
    if (!body.floraClearings) body.floraClearings = []; // {pos: body-fixed on the datum sphere, r}
    const gen = body.terrain;
    this.species = gen ? floraSpecies(gen.p) : null;
    this._fu = { face: 0, u: 0, v: 0 };
  }

  get active() { return !!(this.species && (this.species.life > 0 || this.species.densityRock > 0)); }

  nodeKey(dir) {
    faceUVFromDir(dir, this._fu);
    const n = 1 << this.level, s = 2 / n;
    const ix = Math.min(n - 1, Math.max(0, Math.floor((this._fu.u + 1) / s)));
    const iy = Math.min(n - 1, Math.max(0, Math.floor((this._fu.v + 1) / s)));
    return [this._fu.face, ix, iy];
  }

  // make sure the node under a body-fixed point is loaded
  ensure(p) {
    const len = Math.hypot(p.x, p.y, p.z);
    const [f, ix, iy] = this.nodeKey([p.x / len, p.y / len, p.z / len]);
    const key = `${f}:${ix}:${iy}`;
    if (this.nodes.has(key)) return;
    this.nodes.set(key, true);
    const gen = this.body.terrain;
    this.add(scatterFlora(gen, f, this.level, ix, iy, this.body.maxLevel, this.species));
  }

  // a node's scatter result (from here, or the same one the renderer built)
  ingest(face, ix, iy, data) {
    const key = `${face}:${ix}:${iy}`;
    if (this.nodes.has(key)) return;
    this.nodes.set(key, true);
    this.add(data);
  }

  add(data) {
    const o = data.origin, sp = this.species, R = this.body.R;
    const clear = this.body.floraClearings;
    const put = (it) => {
      const k = this.hash(it.x, it.y, it.z);
      let c = this.cells.get(k);
      if (!c) this.cells.set(k, c = []);
      c.push(it);
      this.count++;
    };
    const cleared = (x, y, z) => {
      if (!clear.length) return false;
      const l = Math.hypot(x, y, z), k = R / l;
      for (const c of clear) {
        const dx = x * k - c.pos.x, dy = y * k - c.pos.y, dz = z * k - c.pos.z;
        if (dx * dx + dy * dy + dz * dz < c.r * c.r) return true;
      }
      return false;
    };
    const trees = data.tree, rocks = [data.rock, data.boulder];
    for (let i = 0; i < trees.length; i += 8) {
      const x = o[0] + trees[i], y = o[1] + trees[i + 1], z = o[2] + trees[i + 2];
      if (cleared(x, y, z)) continue;
      const s = trees[i + 3], tint = trees[i + 5];
      const H = sp.treeHeight * s * (0.85 + 0.3 * tint);
      const l = Math.hypot(x, y, z);
      put({ kind: 'tree', x, y, z, ux: x / l, uy: y / l, uz: z / l, r: Math.max(0.12, (TRUNK[sp.tree] || 0.04) * sp.treeHeight * s), h: H });
    }
    for (const arr of rocks) {
      for (let i = 0; i < arr.length; i += 8) {
        const s = arr[i + 3];
        const r = 0.75 * s;
        if (r < 0.3) continue; // (pebbles: wheels roll over them)
        const x = o[0] + arr[i], y = o[1] + arr[i + 1], z = o[2] + arr[i + 2];
        if (cleared(x, y, z)) continue;
        const l = Math.hypot(x, y, z);
        // drawn sunk by a quarter of its size, a squashed sphere: its middle a little under the ground
        put({ kind: 'rock', x: x - x / l * 0.25 * s, y: y - y / l * 0.25 * s, z: z - z / l * 0.25 * s, ux: x / l, uy: y / l, uz: z / l, r, h: 0 });
      }
    }
    // the ground's own rocks (gen/rocks.js): a sphere through each, as tall as it stands out of the
    // ground and centred where its middle is (render/rockRender.js draws the same shape)
    const geo = data.geo;
    if (geo) for (let i = 0; i < geo.length; i += ROCK_STRIDE) {
      const rad = geo[i + 3];
      if (rad < 0.3) continue;   // (pebbles: wheels roll over them)
      const x = o[0] + geo[i], y = o[1] + geo[i + 1], z = o[2] + geo[i + 2];
      if (cleared(x, y, z)) continue;
      const l = Math.hypot(x, y, z), sh = rockShapeOf(geo[i + 6], geo[i + 9]);
      const up = rad * sh.sy * (1 - 2 * sh.sink);   // (its middle above the ground)
      put({ kind: 'rock', x: x + x / l * up, y: y + y / l * up, z: z + z / l * up, ux: x / l, uy: y / l, uz: z / l, r: rad * (0.55 + 0.35 * sh.sy), h: 0 });
    }
  }

  // a new clearing (body-fixed point on the datum sphere): what stood there is gone
  prune(posF, r) {
    const R = this.body.R, m = r + 40;
    for (let a = Math.floor((posF.x - m) / CELL); a <= Math.floor((posF.x + m) / CELL); a++) {
      for (let b = Math.floor((posF.y - m) / CELL); b <= Math.floor((posF.y + m) / CELL); b++) {
        for (let c = Math.floor((posF.z - m) / CELL); c <= Math.floor((posF.z + m) / CELL); c++) {
          const key = `${a}:${b}:${c}`, cell = this.cells.get(key);
          if (!cell) continue;
          const keep = cell.filter((it) => {
            const l = Math.hypot(it.x, it.y, it.z), k = R / l;
            const dx = it.x * k - posF.x, dy = it.y * k - posF.y, dz = it.z * k - posF.z;
            return dx * dx + dy * dy + dz * dz >= r * r;
          });
          this.count -= cell.length - keep.length;
          this.cells.set(key, keep);
        }
      }
    }
  }

  hash(x, y, z) { return `${Math.floor(x / CELL)}:${Math.floor(y / CELL)}:${Math.floor(z / CELL)}`; }

  // Solid things within `radius` of a body-fixed point (loads the nodes there)
  near(p, radius, out = []) {
    out.length = 0;
    if (!this.active) return out;
    this.ensure(p);
    // (the edges of a node: its neighbours too)
    const l = Math.hypot(p.x, p.y, p.z);
    const tx = Math.abs(p.y / l) < 0.9 ? [p.z, 0, -p.x] : [0, -p.z, p.y];
    const tl = Math.hypot(tx[0], tx[1], tx[2]);
    for (const [a, b] of [[1, 0], [-1, 0]]) {
      const k = (radius + 4) / tl;
      this.ensure({ x: p.x + tx[0] * k * a, y: p.y + tx[1] * k * a, z: p.z + tx[2] * k * a });
    }
    const ty = [p.y * tx[2] / l - p.z * tx[1] / l, p.z * tx[0] / l - p.x * tx[2] / l, p.x * tx[1] / l - p.y * tx[0] / l];
    const tyl = Math.hypot(ty[0], ty[1], ty[2]);
    for (const a of [1, -1]) {
      const k = (radius + 4) / tyl;
      this.ensure({ x: p.x + ty[0] * k * a, y: p.y + ty[1] * k * a, z: p.z + ty[2] * k * a });
    }
    const c0 = Math.floor((p.x - radius - 30) / CELL), c1 = Math.floor((p.x + radius + 30) / CELL);
    const d0 = Math.floor((p.y - radius - 30) / CELL), d1 = Math.floor((p.y + radius + 30) / CELL);
    const e0 = Math.floor((p.z - radius - 30) / CELL), e1 = Math.floor((p.z + radius + 30) / CELL);
    const r2 = radius * radius;
    for (let a = c0; a <= c1; a++) for (let b = d0; b <= d1; b++) for (let c = e0; c <= e1; c++) {
      const cell = this.cells.get(`${a}:${b}:${c}`);
      if (!cell) continue;
      for (const it of cell) {
        const dx = it.x - p.x, dy = it.y - p.y, dz = it.z - p.z;
        if (dx * dx + dy * dy + dz * dz < r2 + (it.h + it.r) * (it.h + it.r) + 2 * radius * (it.h + it.r)) out.push(it);
      }
    }
    return out;
  }
}

// one field per body, made when first needed
export function floraOf(body) {
  if (!body || !body.solid || !body.data.terrain) return null;
  return body._flora || (body._flora = new FloraField(body));
}
