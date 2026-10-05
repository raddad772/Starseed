// The world's clock: one for everyone. Universe time (game.t, s) counts from an agreed instant,
// WORLD_EPOCH, at the game's own pace (a game second is a real one; the worlds' days and years are
// their own, scaled with the lengths: units.js TIME_SCALE), so every client opening a system at the
// same moment sees its sun, its seasons and its clouds the same. World state, not a player's: a
// player's own clock runs ahead of it only by what they've warped (single player) or held still
// (paused, loading), the offset game.t - shared.
//
// For trying the seasons: ?date=2027-01-15 (or 2027-01-15T06:00) sets the clock as if it were that
// moment (UTC); ?clock=+30d (or -6h, +90m, +3600s) moves it from now. Neither is shared; a test's own.

export const WORLD_EPOCH_MS = Date.UTC(2026, 9, 5);   // (2026-10-05 00:00 UTC: when the clock started)

// the shared clock now (s since the epoch)
export function sharedNow() { return (Date.now() - WORLD_EPOCH_MS) / 1000; }

// a test's offset from the URL (s), or 0
export function clockOffsetFromURL(search = typeof location !== 'undefined' ? location.search : '') {
  const q = new URLSearchParams(search || '');
  const d = q.get('date');
  if (d) {
    const ms = Date.parse(/T/.test(d) ? (/Z|[+-]\d\d:?\d\d$/.test(d) ? d : d + 'Z') : d + 'T00:00:00Z');
    if (ms === ms) return (ms - Date.now()) / 1000;
  }
  const c = q.get('clock');
  const m = c && /^([+-]?\d+(?:\.\d+)?)([smhd]?)$/.exec(c.trim());
  if (m) return +m[1] * { '': 1, s: 1, m: 60, h: 3600, d: 86400 }[m[2]];
  return 0;
}

export class WorldClock {
  constructor(offset = clockOffsetFromURL()) {
    // (the offset this client starts at: a test's; the warps and pauses after are game.t's own)
    this.offset0 = offset;
  }
  // the time to start the world at
  now() { return sharedNow() + this.offset0; }
  // how far a time stands ahead of the shared clock (s)
  aheadOf(t) { return t - sharedNow(); }
}

// the clock as words: the shared date and time at universe time t (UTC), and how far this client's
// clock stands from the shared one when it's off by more than a minute
export function clockText(t) {
  const d = new Date(WORLD_EPOCH_MS + t * 1000), ahead = t - sharedNow();
  const span = (s) => { s = Math.abs(s); return s >= 86400 ? `${(s / 86400).toFixed(1)} days` : s >= 3600 ? `${(s / 3600).toFixed(1)} h` : `${Math.round(s / 60)} min`; };
  return `${d.toISOString().slice(0, 16).replace('T', ' ')} UTC${Math.abs(ahead) > 60 ? ` · ${span(ahead)} ${ahead > 0 ? 'ahead of' : 'behind'} the shared clock` : ''}`;
}

// a world's season at universe time t (universe: sim/universe.js; b its body): where its sun stands
// overhead (its latitude, the body's own frame, y its spin axis) and which way it's heading, as the
// northern hemisphere's season; null for a world without seasons (locked, or its axis upright)
export function seasonText(universe, b, t) {
  const r = b.data.rotation;
  if (!r || r.locked || Math.abs(Math.sin(r.obliquity)) < 0.02) return null;
  const host = b.data.kind === 'moon' && b.parent ? b.parent : b, P = host.data.orbit && host.data.orbit.period;
  if (!(P > 0) || !(P < Infinity)) return null;
  const sunLat = (tt) => {
    const pos = b._seasonP || (b._seasonP = b.pos.clone()), q = b._seasonQ || (b._seasonQ = b.q.clone());
    universe.bodyStateAt(b, tt, pos);
    b.orientationAt(tt, q);
    return Math.asin(Math.max(-1, Math.min(1, pos.negate().normalize().applyQuaternion(q.invert()).y)));
  };
  const lat = sunLat(t), rising = sunLat(t + P / 100) > lat;
  const name = lat >= 0 ? (rising ? 'spring' : 'summer') : (rising ? 'winter' : 'autumn');
  const deg = Math.abs(lat * 180 / Math.PI);
  return `northern ${name} · the sun overhead at ${deg.toFixed(deg < 10 ? 1 : 0)}° ${lat >= 0 ? 'N' : 'S'}, heading ${rising ? 'north' : 'south'}`;
}
