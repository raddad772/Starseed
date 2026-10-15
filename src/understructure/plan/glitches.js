// The themes through a site, not only at their gates (Dave, 2026-10-09: "more of each theme's glitches
// and set pieces through a site, not one gate each"). Each of the site's three themes shows itself in a
// few more places, along the route and down its spurs: odd, and harmless, and never in the way, so the
// route can be walked through every one of them. None on a gate's place or its keys', none in the
// breach room, the data core or the founders' access, none in a climb (its own gravity).
//   gravity    lull    a patch where weight falls to a third, the loose rubble afloat in it
//              press   a patch where it nearly doubles, the floor cracked out from it
//   time       rewind  a fall of rubble rising back into the ceiling it came from, and falling again
//              flare   a dead lamp lit now and then as it was when the founders were here
//   space      skip    a stretch of passage folded away: into its near frame, out of its far one
//              repeat  one fallen block seen again and again down a passage, fainter each time
//   light      pool    light with nothing giving it, hanging in a room, drifting
//              lag     a lamp whose light reaches the floor a second after it blinks
//   pressure   vent    vapour jetting from a crack in a wall
//              breath  a sealed hatch bowing in and out, a mist on the floor rising and sinking with it
//   resonance  hum     a conduit singing, rings lit where it moves most
//              figure  the dust on a floor drawn into one standing wave's lines, then another's
// And each theme's set piece, one bigger moment a site (where it has the place for it):
//   gravity    drift   a hall's crossing in a deep lull, the hall's loose rubble a slow cloud round it
//   time       was     a room flickering back to how it was: its panels lit, its floor clean, a console on
//   space      loop    a dead end's passage folding back on itself for a while: on into its far frame and
//                      out of its near one, again, until it lets you through (back out, always)
//   light      motes   sourceless lights swarming slowly over a hall's pit round its crossing
//   pressure   front   a wall of mist sweeping down a passage now and then, shoving you along with it
//   resonance  chorus  a crossing's rails singing, lit at their antinodes in turn
// The runtime draws and runs them (site/siteGlitches.js); the gravity patches are zones, the skips
// fold frames (plan/compile.js)
import * as G from './geom2.js';

export const GLITCH_KINDS = { gravity: ['lull', 'press'], time: ['rewind', 'flare'], space: ['skip', 'repeat'], light: ['pool', 'lag'], pressure: ['vent', 'breath'], resonance: ['hum', 'figure'] };
// (where each can be: a room's floor or wall, a passage's straight)
const IN_ROOM = new Set(['lull', 'press', 'rewind', 'flare', 'pool', 'lag', 'vent', 'breath', 'hum', 'figure']);
const IN_PASSAGE = new Set(['lull', 'press', 'skip', 'repeat', 'lag', 'vent']);
// (each site theme's count: a few, spread down the route)
const PER_THEME = 3;
// (the weight in a lull and a press, the planet's own times this)
export const LULL_G = 0.3, PRESS_G = 1.8, DRIFT_G = 0.15;
export const SET_PIECES = { gravity: 'drift', time: 'was', space: 'loop', light: 'motes', pressure: 'front', resonance: 'chorus' };

const r2 = (v) => Math.round(v * 100) / 100;

export function placeGlitches(rng, { nodes, links, route, gates, landmarks = [] }, themes) {
  const byId = new Map(nodes.map((n) => [n.id, n])), idx = new Map(route.map((id, i) => [id, i]));
  const taken = new Set(['staging', 'core', 'access']);
  for (const g of gates) { if (g.node) taken.add(g.node); if (g.link) taken.add(g.link); for (const k of g.keys) taken.add(k.node); }
  // the places: rooms and dead ends by their floors and their free walls; passages by their longest
  // straight, each with where it falls on the route
  const places = [];
  for (const n of nodes) {
    if (!(n.kind === 'room' || n.kind === 'deadend') || taken.has(n.id) || !n.poly) continue;
    const at = n.kind === 'deadend' ? idx.get(links.find((l) => l.b === n.id)?.a) : idx.get(n.id);
    if (at === undefined) continue;
    const c = n.center || G.centroid(n.poly), r = Math.max(0.5, -G.sdPoly(c, n.poly));
    // (its wall furthest from every doorway: the passages' ends at it)
    const ends = links.filter((l) => l.a === n.id || l.b === n.id).flatMap((l) => [l.path[0], l.path.at(-1)].map((q) => [q[0], q[2]]));
    let wall = null, far = -1;
    for (let i = 0; i < n.poly.length; i++) {
      const a = n.poly[i], b = n.poly[(i + 1) % n.poly.length], m = G.lerp(a, b, 0.5), L = G.dist(a, b);
      const d = Math.min(...ends.map((e) => G.dist(e, m)), 99);
      if (L >= 2.6 && d > far) { far = d; wall = { mid: m, along: G.norm(G.sub(b, a)), inward: G.norm(G.perp(G.sub(b, a))), len: L }; }
    }
    if (wall && G.dot(wall.inward, G.sub(c, wall.mid)) < 0) wall.inward = G.mul(wall.inward, -1);
    places.push({ room: n, at, c, r, wall: far > 2.5 ? wall : null });
  }
  for (const l of links) {
    if (l.kind !== 'corridor' || taken.has(l.id)) continue;
    const at = l.main ? Math.max(idx.get(l.a) ?? 0, idx.get(l.b) ?? 0) : idx.get(l.a);
    if (at === undefined) continue;
    // (the longest straight, a few metres clear of its ends: no doorway in it)
    let best = null;
    for (let i = 1; i < l.path.length; i++) {
      const a = [l.path[i - 1][0], l.path[i - 1][2]], b = [l.path[i][0], l.path[i][2]], L = G.dist(a, b);
      if (Math.abs(l.path[i][1] - l.path[i - 1][1]) > 0.05) continue;
      if (!best || L > best.L) best = { a, b, L, y: l.path[i][1] };
    }
    if (!best || best.L < 16) continue;
    places.push({ link: l, at, seg: best });
  }
  // each theme a few, of its kinds in turn, at places spread down the route (and never two in one place)
  const out = [], used = new Set();
  rng.shuffle(themes.slice()).forEach((theme) => {
    const kinds = rng.shuffle((GLITCH_KINDS[theme] || []).slice());
    const want = [0.2, 0.5, 0.8].slice(0, PER_THEME).map((t) => t * route.length + rng.range(-1, 1));
    for (let k = 0; k < want.length; k++) {
      // (its kind in turn; where none of that kind fits any more, the other)
      for (const kind of [kinds[k % kinds.length], kinds[(k + 1) % kinds.length]]) {
        const fits = places.filter((q) => !used.has(q) && (q.room ? IN_ROOM.has(kind) && (!['vent', 'breath', 'flare', 'hum'].includes(kind) || q.wall) : IN_PASSAGE.has(kind)));
        if (!fits.length) continue;
        fits.sort((a, b) => Math.abs(a.at - want[k]) - Math.abs(b.at - want[k]));
        const q = fits[0];
        used.add(q);
        out.push(glitchAt(rng, `x${out.length}`, theme, kind, q));
        break;
      }
    }
  });
  // the set pieces: each theme's own kind of place, nearest the middle of the route, not one a glitch or
  // a gate already holds
  const usedIds = new Set([...out.map((g) => g.node || g.link), ...taken]);
  for (const g of gates) if (g.kind === 'span') usedIds.add(g.node);
  const byL = new Map(landmarks.map((L) => [L.id, L]));
  for (const theme of themes) {
    const kind = SET_PIECES[theme], mid = route.length * rng.range(0.4, 0.6);
    let opts = [];
    if (kind === 'drift' || kind === 'motes' || kind === 'chorus') opts = nodes.filter((n) => n.kind === 'crossing' && idx.has(n.id) && !usedIds.has(n.id) && byL.has(n.landmark)).map((n) => ({ n, at: idx.get(n.id) }));
    else if (kind === 'was') opts = places.filter((q) => q.room && q.room.kind === 'room' && !usedIds.has(q.room.id) && q.r >= 2.5).map((q) => ({ q, at: q.at }));
    else if (kind === 'front') opts = places.filter((q) => q.link && q.link.main && !usedIds.has(q.link.id) && q.seg.L >= 20).map((q) => ({ q, at: q.at }));
    else if (kind === 'loop') opts = links.filter((l) => !l.main && l.kind === 'corridor' && l.b && !usedIds.has(l.id) && !usedIds.has(l.b) && G.dist([l.path[0][0], l.path[0][2]], [l.path.at(-1)[0], l.path.at(-1)[2]]) >= 14).map((l) => ({ l, at: idx.get(l.a) ?? 0 }));
    if (!opts.length) continue;
    opts.sort((a, b) => Math.abs(a.at - mid) - Math.abs(b.at - mid));
    const o = opts[0], g = { id: `p${theme[0]}`, theme, kind, at: o.at, set: true };
    if (o.n) {
      const n = o.n, L = byL.get(n.landmark), [a, b] = n.walk, d = G.norm(G.sub(b, a)), m = G.lerp(a, b, 0.5);
      usedIds.add(n.id);
      Object.assign(g, { node: n.id, y0: n.y0, y1: n.y1, center: m.map(r2), walk: [a.map(r2), b.map(r2)], dir: d.map(r2), hall: { center: L.center.map(r2), y0: L.y0, y1: L.y1, r: r2(L.r || 20) } });
      // (the deep lull over the catwalk and a little either side of it, from its deck to well over head)
      if (kind === 'drift') g.zone = { poly: G.orientedRect(m, d, G.dist(a, b) / 2 - 1.5, 2.2).map((p) => p.map(r2)), y0: n.y0 - 0.5, y1: n.y0 + 8, gravity: DRIFT_G };
    } else if (o.q && o.q.room) {
      const n = o.q.room; usedIds.add(n.id);
      Object.assign(g, { node: n.id, y0: n.y0, y1: n.y1, center: o.q.c.map(r2), r: r2(o.q.r), poly: n.poly.map((p) => p.map(r2)) });
    } else if (o.q) {
      const l = o.q.link, { a, b, L, y } = o.q.seg, d = G.norm(G.sub(b, a)); usedIds.add(l.id);
      Object.assign(g, { link: l.id, y0: y, y1: y + (l.height || 4), center: G.lerp(a, b, 0.5).map(r2), dir: d.map(r2), width: l.width, from: a.map(r2), len: r2(L) });
    } else {
      const l = o.l, a = [l.path[0][0], l.path[0][2]], b = [l.path.at(-1)[0], l.path.at(-1)[2]], d = G.norm(G.sub(b, a)), L = G.dist(a, b), y = l.path[0][1];
      usedIds.add(l.id); usedIds.add(l.b);
      const P = (sd) => { const p = G.add(a, G.mul(d, sd)); return [r2(p[0]), y, r2(p[1])]; };
      // (on into the far frame, out of the near one; a passage back out not turned round)
      Object.assign(g, { link: l.id, node: l.b, y0: y, y1: y + (l.height || 3.6), center: G.lerp(a, b, 0.5).map(r2), dir: d.map(r2), width: l.width, frames: [{ pos: P(L - 4), dir: d.map(r2), half: r2(l.width - 0.25) }, { pos: P(3.5), dir: d.map(r2), half: r2(l.width - 0.25) }], cycle: { period: 27, open: 18 } });
    }
    out.push(g);
  }
  return out.sort((a, b) => a.at - b.at);
}

// One glitch at a place: where it stands and what it needs there
function glitchAt(rng, id, theme, kind, q) {
  const g = { id, theme, kind, at: q.at };
  if (q.room) {
    const n = q.room;
    g.node = n.id; g.y0 = n.y0; g.y1 = n.y1; g.center = [r2(q.c[0]), r2(q.c[1])]; g.r = r2(q.r);
    if (q.wall) g.wall = { mid: q.wall.mid.map(r2), along: q.wall.along.map(r2), inward: q.wall.inward.map(r2), len: r2(q.wall.len) };
    // (a weight patch fills the room, its walls in: the doorways' sills stay the planet's)
    if (kind === 'lull' || kind === 'press') g.zone = { poly: G.inflate(n.poly, -0.6).map((p) => p.map(r2)), y0: n.y0, y1: n.y1, gravity: kind === 'lull' ? LULL_G : PRESS_G };
    // (rubble lies against a wall, out of the way across the room)
    if (kind === 'rewind') { const w = q.wall || { mid: G.add(q.c, [q.r, 0]), inward: [-1, 0] }; g.pile = G.add(w.mid, G.mul(w.inward, 1.3)).map(r2); }
  } else {
    const l = q.link, { a, b, L, y } = q.seg, d = G.norm(G.sub(b, a)), m = L / 2 + rng.range(-L * 0.12, L * 0.12);
    const P = (s) => G.add(a, G.mul(d, s)).map(r2);
    // (width: the passage's half-width)
    g.link = l.id; g.y0 = y; g.y1 = y + (l.height || 4); g.dir = d.map(r2); g.width = l.width; g.center = P(m);
    if (kind === 'lull' || kind === 'press') g.zone = { poly: G.orientedRect(P(m), d, Math.min(5, L / 2 - 3), l.width + 0.2).map((p) => p.map(r2)), y0: y, y1: g.y1, gravity: kind === 'lull' ? LULL_G : PRESS_G };
    // (the fold's frames 7 m apart along the straight, facing along it)
    if (kind === 'skip') g.frames = [m - 3.5, m + 3.5].map((s) => { const p = P(s); return { pos: [p[0], y, p[1]], dir: d.map(r2), half: r2(l.width - 0.3) }; });
    // (the one block by a wall, its echoes on down the passage)
    if (kind === 'repeat' || kind === 'vent' || kind === 'lag') g.side = rng.sign();
  }
  return g;
}
