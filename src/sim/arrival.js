// Wait only for worlds that have a rendered disc near the arriving players,
// plus their current world. Distant point stars/planets keep preparing in the
// background; detailed terrain continues streaming during the descent.
export function orbitalReadiness(g) {
  const pxPerRad = g.engine.height / (g.engine.camera.fov * Math.PI / 180);
  let pending = 0, unmeasured = g.engine.backend === 'webgpu' && !g.engine.webgpu, history = null, failed = null;
  for (const it of g.world.items) {
    const b = it.body;
    if (!it.terrain) continue;
    const enclosed = g.mirrorShell && b !== g.mirrorShell.body
      && b.pos.distanceTo(g.mirrorShell.body.pos) + b.R < g.mirrorShell.radius;
    const nearby = g.players.some(p => {
      if (enclosed && p.camPos.distanceTo(g.mirrorShell.body.pos) > g.mirrorShell.radius) return false;
      return p.currentBody() === b || (b.R + b.atmHeight) / Math.max(1, p.camPos.distanceTo(b.pos)) * pxPerRad > 0.6;
    });
    if (!nearby) continue;
    if (g.worldSims && b.solid && b.data.terrain) {
      g.worldSims.request(b.id);
      const status = g.worldSims.status.get(b.id);
      if (status === 'failed') failed ||= b.data.name;
      else if (status !== 'ready') {
        pending++;
        const phase = g.worldSims.phase.get(b.id);
        history ||= `${status === 'running' ? 'Generating' : 'Loading'} ${b.data.name}'s planetary history${phase ? ` · ${phase}` : ''}`;
      }
    }
    // pendingNear counts only chunks within 3 km, so it cannot gate an orbit.
    pending += it.terrain.pendingCount;
    unmeasured ||= !it.terrain.frame || !it.terrain.visibleList.length;
  }
  return { pending, unmeasured, history, failed };
}
