// The sea's ice as solid things for whoever walks it: a pressure ridge's blocks near a point, the very
// blocks the slabs draw (gen/floeslabs.js ridgeBlocks: by the crack, the floe and the 1 m stretch), each an
// oriented box. The floes' tops and the ridges' tents are the ground (universe.js floeTopAt); these stand
// on them. World state (the seed and the world's clock): worked out on demand where someone is, the floes
// there kept a while.
import { S_LEN } from '../gen/terrain.js';
import { liquidNow, iceAt, floeOf, packIceAt, floeTop, floeRound } from '../gen/liquidice.js';
import { ridgeBlocks } from '../gen/floeslabs.js';

export class FloeField {
  constructor(body) {
    this.body = body;
    this.floes = new Map();   // a floe's hash -> its polygon, face, middle, roundness and top (as of L)
    this._s = new Float64Array(S_LEN);
  }
  // the blocks within radius (m) of body-fixed p ({x, y, z}), pushed to out as { kind: 'box', x, y, z (its
  // middle), q (its turn, x y z w), hx, hy, hz (half its size), r (round it), h: 0 }
  near(p, radius, out) {
    const b = this.body, gen = b.terrain;
    if (!gen) return out;
    const R = gen.R, l = Math.hypot(p.x, p.y, p.z);
    if (l - R > 20 || l - R < -10) return out;
    const d = [p.x / l, p.y / l, p.z / l], s = gen.sample(d[0], d[1], d[2], 8, this._s);
    const L = b.solarLongitude(), q = liquidNow(gen, s, d, 0, L, this._q || (this._q = {}));
    if (q.all || !(q.ice > 0) || !(q.kind < 0.2)) return out;
    // (the season moves the pack on: floes kept while the sun's moved less than ~half a degree)
    if (!(Math.abs(L - this.L) < 0.01)) { this.floes.clear(); this.L = L; }
    const iceF = iceAt(gen, L, q.ice);
    // (the floes about it: its own and those round it a little further than it asks)
    const ex = Math.abs(d[1]) < 0.9 ? [d[2], 0, -d[0]] : [0, -d[2], d[1]], el = Math.hypot(...ex);
    ex[0] /= el; ex[1] /= el; ex[2] /= el;
    const ey = [d[1] * ex[2] - d[2] * ex[1], d[2] * ex[0] - d[0] * ex[2], d[0] * ex[1] - d[1] * ex[0]];
    const seen = new Set(), k = radius + 3;
    for (const [a, c] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [0.7, 0.7], [-0.7, 0.7], [0.7, -0.7], [-0.7, -0.7]]) {
      const pp = [d[0] * R + (ex[0] * a + ey[0] * c) * k, d[1] * R + (ex[1] * a + ey[1] * c) * k, d[2] * R + (ex[2] * a + ey[2] * c) * k];
      const pl = Math.hypot(...pp);
      pp[0] *= R / pl; pp[1] *= R / pl; pp[2] *= R / pl;
      const F = floeOf(pp, iceF, {});
      if (!F.there || seen.has(F.id)) continue;
      seen.add(F.id);
      let fl = this.floes.get(F.id);
      if (!fl) {
        const P = { n: F.P.n, V: Float64Array.from(F.P.V), EI: Uint32Array.from(F.P.EI), ES: Float64Array.from(F.P.ES), id: F.P.id };
        let ridged = false;
        for (let i = 0; i < P.n; i++) if (P.ES[i] < 0) ridged = true;
        const top = floeTop(packIceAt(gen, F.mid, L, q.Tm, {}), F.id, F.size < 64);
        fl = { P, f: { ...F.f }, mid: F.mid.slice(), rr: floeRound(F.size, F.id), top, ridged };
        if (this.floes.size > 64) this.floes.clear();
        this.floes.set(F.id, fl);
      }
      if (!fl.ridged) continue;
      const r2 = (radius + 2) * (radius + 2);
      ridgeBlocks(fl.f, fl.P, fl.mid, fl.rr, fl.top, R, (x, y, z) => (x - p.x) ** 2 + (y - p.y) ** 2 + (z - p.z) ** 2 < r2, (c3, qt, bl, bt, bw) => {
        out.push({ kind: 'box', x: c3[0], y: c3[1], z: c3[2], q: qt, hx: bl / 2, hy: bt / 2, hz: bw / 2, r: Math.hypot(bl, bt, bw) / 2, h: 0 });
      });
    }
    return out;
  }
}
