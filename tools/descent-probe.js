// Orbit-to-surface descent on the nav computer, watching the ground stream in
// (a test tab only, never Dave's). In the page:
//   const D = await import('/tools/descent-probe.js'); await D.start({ altKm: 150 });
//   D.status()        // progress: phase, altitude, speed, terrain work outstanding
//   D.report()        // when landed: frame-time percentiles by altitude band, stalls, shots taken
// Nothing detailed is cached: only planetary histories (world sim, refinement) and
// system definitions come from IndexedDB; the terrain pyramid's tiles are made again
// (their cache is skipped for the run), and every terrain chunk and the near ground's
// volume are built live by the workers as the craft comes down. The site is the dry
// spot ahead with the sun highest over it; the view is the landing camera; the nav
// computer's wait for a launch window runs at time warp, those frames left
// out of the timings.
const SHOTS_KM = [100, 30, 10, 3, 1, 0.3, 0.1, 0.02];

export async function start({ altKm = 150, shotsTo = 'http://127.0.0.1:8799/', cold = true, cam = 'landing' } = {}) {
  const THREE = await import('three');
  const TS = (await import('/src/ui/testScenes.js')).TEST_SCENES;
  const g = window.game, s = g.ship, b = g.startBody;
  TS.find((x) => x.label === 'Low orbit, day side').run(g);
  if (cold && g.worldSims) g.worldSims.noPyrCache = true;
  g.camMode = cam;
  if (altKm !== 150) { const r = b.R + altKm * 1000, u = s.pos.clone().normalize(); s.pos.copy(u).multiplyScalar(r); s.vel.setLength(Math.sqrt(b.GM / r)); }
  // a dry landing site ahead on the track (body-fixed), where the sun stands highest
  const fixed = (w) => w.clone().applyQuaternion(b.qInv);
  const u0 = s.pos.clone().normalize(), ahead = s.vel.clone().normalize(), sun = b.pos.clone().negate().normalize();
  let dirF = null, best = -2;
  for (let a = 0.35; a < 1.6; a += 0.04) for (const side of [0, 0.05, -0.05, 0.1, -0.1]) {
    const w = u0.clone().multiplyScalar(Math.cos(a)).addScaledVector(ahead, Math.sin(a)).addScaledVector(u0.clone().cross(ahead).normalize(), side).normalize();
    const d = fixed(w);
    if (b.isWaterAt(d) || !(b.groundHeight(d) > 20)) continue;
    const up = w.dot(sun);
    if (up > best) { best = up; dirF = d; }
  }
  const P = window._descent = { g, s, b, dirF, sunUp: best, t0: performance.now(), log: [], frames: [], shots: [], stalls: [], done: false, shotsTo, nextShot: 0 };
  // every frame's interval, with the height it was at
  let last = performance.now();
  const tick = (now) => {
    if (P.done) return;
    const dt = now - last; last = now;
    const warp = (g.player.warpRequestIndex || 0) > 0;
    P.frames.push([dt, s.agl, warp]);
    if (dt > 100 && !warp) P.stalls.push({ ms: Math.round(dt), aglM: Math.round(s.agl), phase: s.nav.phase, t: Math.round((now - P.t0) / 1000) });
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  // twice a second: where the craft is and what the ground still owes
  P.timer = setInterval(() => sample(P), 500);
  if (!dirF) throw Error('no dry site found ahead');
  s.nav.order({ kind: 'site', body: b, dirF: dirF.clone(), label: 'probe site' });
  return { site: dirF.toArray().map((v) => +v.toFixed(4)), groundM: Math.round(b.groundHeight(dirF)), body: b.data.name, sunElevDeg: Math.round(Math.asin(best) * 180 / Math.PI) };
}

function terrainOf(P) { return P.g.world.items.find((i) => i.body === P.b)?.terrain; }

function sample(P) {
  const { g, s, b } = P;
  const T = terrainOf(P), ng = b.near;
  const surfV = s.vel.clone().sub(b.omega ? b.omega.clone().cross(s.pos) : s.vel.clone().multiplyScalar(0)).length();
  // (the nav computer's long waits at warp)
  const stage = s.nav.flight?.stage || '';
  g.player.warpRequestIndex = /Waiting for launch window/.test(stage) ? 5 : 0;   // (not the coast: warped, it overran its arrival braking)
  const tiles = g.tiles;
  const row = {
    t: +((performance.now() - P.t0) / 1000).toFixed(1), phase: s.nav.phase, active: s.nav.active, aglM: Math.round(s.agl), vMs: Math.round(surfV), landed: s.landed,
    pending: T?.pendingCount ?? null, pendingNear: T?.pendingNear ?? null, loading: T?.loadingCount ? T.loadingCount() : null, visible: T?.visibleList?.length ?? null,
    nearReady: !!ng?.ready, nearActive: !!ng?.active, pool: g.pool?.pending?.size ?? null, fps: Math.round(g.fps || 0),
    stage, warp: g.player.warpRequestIndex > 0, tilesMissing: tiles?.missing ?? null, siteMissing: tiles?.missingSite ?? null, focus: !!tiles?.focus,
    lights: !!s.visual?.landing?.on, dead: !!s.dead, prefetch: !!ng?.prefetch, anchors: ng?.anchorId ?? 0, nearChunks: T?.near ? [...T.near.values()].filter((c) => c.state === 2).length : 0, belly: !!s.nav.flight?._onBelly || !!s.nav._entryPilot?._onBelly,
    cover: !![...document.querySelectorAll('body *')].find((e) => e.children.length === 0 && /Arriving/.test(e.textContent) && e.offsetParent !== null),
  };
  P.log.push(row);
  // pictures at set heights
  const km = s.agl / 1000;
  if (P.nextShot < SHOTS_KM.length && km < SHOTS_KM[P.nextShot]) { shot(P, `descent_${String(P.nextShot).padStart(2, '0')}_${SHOTS_KM[P.nextShot]}km`); P.nextShot++; }
  if ((s.landed && !s.nav.active) || s.dead || row.t > 1200) { P.done = true; P.end = s.dead ? `destroyed: ${s.deathCause}` : s.landed ? 'landed' : 'timed out'; clearInterval(P.timer); g.player.warpRequestIndex = 0; shot(P, 'descent_99_end'); }
}

function shot(P, name) {
  try {
    P.g.frame(performance.now());
    const url = document.querySelector('canvas').toDataURL('image/jpeg', 0.82);
    P.shots.push(name);
    fetch(P.shotsTo, { method: 'POST', body: name + '|' + url }).catch(() => {});
  } catch (e) { P.shots.push(name + ' failed: ' + e.message); }
}

export function status() {
  const P = window._descent; if (!P) return null;
  return { ...P.log.at(-1), shots: P.shots.length, stalls: P.stalls.length, done: P.done };
}

// frame times by height band, the worst stalls, and how much ground was still owed near the end
export function report() {
  const P = window._descent; if (!P) return null;
  const bands = [[1e9, 100000], [100000, 20000], [20000, 5000], [5000, 1000], [1000, 200], [200, -1e9]];
  const pct = (a, q) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return +s[Math.min(s.length - 1, Math.floor(q * s.length))].toFixed(1); };
  const byBand = bands.map(([hi, lo]) => {
    const f = P.frames.filter(([, h, warp]) => !warp && h <= hi && h > lo).map(([d]) => d);
    return { band: `${hi > 1e8 ? '∞' : hi / 1000}–${lo < 0 ? 0 : lo / 1000} km`, frames: f.length, p50: pct(f, 0.5), p95: pct(f, 0.95), p99: pct(f, 0.99), max: f.length ? Math.round(Math.max(...f)) : null };
  });
  const near = P.log.filter((r) => r.aglM < 1500);
  return {
    duration: P.log.at(-1)?.t, end: P.end, landed: P.s.landed, phaseSeen: [...new Set(P.log.map((r) => r.phase))],
    siteTilesInAt: P.log.find((r) => r.focus && r.siteMissing === 0)?.aglM ?? null, bellyShare: +(P.log.filter((r) => r.belly).length / Math.max(1, P.log.filter((r) => r.phase === 'descend' || r.phase === 'land').length)).toFixed(2),
    byBand, stalls: P.stalls.sort((a, b) => b.ms - a.ms).slice(0, 10), coverShown: P.log.some((r) => r.cover),
    nearReadyAt: near.find((r) => r.nearReady)?.aglM ?? null,
    pendingAtLanding: P.log.at(-1)?.pending, maxPendingBelow1500m: near.length ? Math.max(...near.map((r) => r.pending ?? 0)) : null,
    shots: P.shots,
  };
}
