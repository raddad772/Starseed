// Themes and their gates. A site has three of the six themes; each places
// one gate on the route and the keys that open it, always earlier on the
// route (or down a dead end off it), so every site can be finished.
//   gravity    a door without power: its cell floats in an earlier zero-g well
//   time       a catwalk whose middle span comes and goes on a cycle
//   space      a collapsed passage; fold frames, aligned at a terminal, join it
//   light      a catwalk with its middle fallen away; two relays light a bridge
//   pressure   a sealed door; match the valve to the reference gauge
//   resonance  a sealed door; step on three plates in the order they light
import * as G from './geom2.js';

export const THEMES = ['gravity', 'time', 'space', 'light', 'pressure', 'resonance'];
export const THEME_NAMES = { gravity: 'Weight', time: 'Time', space: 'Distance', light: 'Light', pressure: 'Pressure', resonance: 'Resonance' };

export function pickThemes(rng, requested) {
  if (Array.isArray(requested) && requested.length) return requested.filter((t) => THEMES.includes(t)).slice(0, 3);
  return rng.shuffle(THEMES.slice()).slice(0, 3);
}

const r2 = (v) => Math.round(v * 100) / 100;
const pathLen = (l) => { let s = 0; for (let i = 1; i < l.path.length; i++) s += Math.hypot(l.path[i][0] - l.path[i - 1][0], l.path[i][2] - l.path[i - 1][2]); return s; };
// a point at arc length s along a link's path (plan) and its direction
function alongLink(l, s) { return G.along(l.path.map((p) => [p[0], p[2]]), s); }

export function placeGates(rng, { nodes, links, route, spurs }, themes) {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const idx = new Map(route.map((id, i) => [id, i]));
  const routeLink = (i) => links.find((l) => l.a === route[i - 1] && l.b === route[i]);
  const used = new Set(), gates = [];
  const free = (i) => ![...used].some((j) => Math.abs(j - i) < 3);
  const spursBefore = (i) => spurs.filter((s) => { const l = links.find((q) => q.b === s.id); return l && idx.get(l.a) < i; });
  const roomish = (n) => n && (n.kind === 'room' || n.kind === 'core');
  // candidate places for each kind of gate, by route index
  // (a locked door can be any doorway on the route into a room or a hall; a
  // valve or plates need a room with a floor before it)
  const doors = [], roomDoors = [], spans = [], folds = [];
  for (let i = 2; i < route.length - 1; i++) {
    const n = byId.get(route[i]), prev = byId.get(route[i - 1]), l = routeLink(i);
    if (!l) continue;
    if (roomish(n) || n.kind === 'crossing') { doors.push(i); if (roomish(prev)) roomDoors.push(i); }
    if (n.kind !== 'crossing' && prev.kind !== 'crossing' && prev.kind !== 'staging' && pathLen(l) >= 14) folds.push(i);
    if (n.kind === 'crossing' && G.dist(n.walk[0], n.walk[1]) >= 24) spans.push(i);
  }
  const order = rng.shuffle(themes.slice());
  const targets = rng.shuffle([0.3, 0.55, 0.8]);
  order.forEach((theme, k) => {
    const pool = theme === 'time' || theme === 'light' ? spans : theme === 'space' ? folds : theme === 'gravity' ? doors : roomDoors;
    const want = targets[k] * route.length;
    const options = pool.filter(free).sort((a, b) => Math.abs(a - want) - Math.abs(b - want));
    const i = options[0];
    if (i === undefined) return; // this site has no place for it: the theme sits out
    used.add(i);
    const n = byId.get(route[i]), prev = byId.get(route[i - 1]), l = routeLink(i);
    const g = { id: `g${gates.length}`, theme, at: i, keys: [] };
    const near = (node, off = 1.6) => { const c = node.center; const a = rng.range(0, Math.PI * 2); return [r2(c[0] + Math.cos(a) * off), node.y0, r2(c[1] + Math.sin(a) * off)]; };
    if (theme === 'time' || theme === 'light') {
      const [a, b] = n.walk, L = G.dist(a, b), gap = Math.min(9, L * 0.3), m = L / 2 + rng.range(-L * 0.1, L * 0.1);
      g.kind = 'span'; g.node = n.id;
      g.span = { from: r2(m - gap / 2), to: r2(m + gap / 2), y: n.y0 };
      if (theme === 'time') g.cycle = { period: r2(rng.range(10, 14)), open: r2(rng.range(4, 5.5)), offset: r2(rng.range(0, 10)) };
      else {
        const sp = rng.pick(spursBefore(i)) || prev;
        g.keys.push({ id: `${g.id}k0`, kind: 'relay', node: sp.id, pos: near(sp) });
        const t = 2.2 / L, p = G.lerp(a, b, t);
        g.keys.push({ id: `${g.id}k1`, kind: 'relay', node: n.id, pos: [r2(p[0]), n.y0, r2(p[1])] });
      }
    } else if (theme === 'space') {
      const L = pathLen(l), mid = L * rng.range(0.4, 0.6);
      g.kind = 'fold'; g.link = l.id;
      const at = (s) => { const q = alongLink(l, s); return { p: [r2(q.p[0]), l.path[0][1], r2(q.p[1])], dir: q.dir }; };
      g.collapse = at(mid);
      g.frames = [at(Math.max(2.5, mid - 3)), at(Math.min(L - 2.5, mid + 3))];
      const sp = rng.pick(spursBefore(i)) || prev;
      g.keys.push({ id: `${g.id}k0`, kind: 'terminal', node: sp.id, pos: near(sp) });
    } else {
      g.kind = 'door'; g.link = l.id; g.node = n.id;
      if (theme === 'gravity') {
        const wells = route.slice(0, i).map((id) => byId.get(id)).filter((q) => q.kind === 'climb' && q.mode === 'zero-g');
        const well = wells.at(-1);
        if (well) g.keys.push({ id: `${g.id}k0`, kind: 'cell', node: well.id, pos: [r2(well.center[0]), r2((well.y0 + well.top) / 2), r2(well.center[1])], floating: true });
        else { const sp = rng.pick(spursBefore(i)) || prev; g.keys.push({ id: `${g.id}k0`, kind: 'cell', node: sp.id, pos: near(sp) }); }
      } else if (theme === 'pressure') {
        g.reference = rng.int(2, 5);
        g.keys.push({ id: `${g.id}k0`, kind: 'valve', node: prev.id, pos: near(prev, 1.2) });
      } else if (theme === 'resonance') {
        const base = rng.range(0, Math.PI * 2), c = prev.center;
        g.order = rng.shuffle([0, 1, 2]);
        g.plates = [0, 1, 2].map((k2) => { const a = base + k2 * Math.PI * 2 / 3; return [r2(c[0] + Math.cos(a) * 1.8), prev.y0, r2(c[1] + Math.sin(a) * 1.8)]; });
        g.keys.push({ id: `${g.id}k0`, kind: 'plates', node: prev.id, pos: [r2(c[0]), prev.y0, r2(c[1])] });
      }
    }
    gates.push(g);
  });
  return gates.sort((p, q) => p.at - q.at);
}
