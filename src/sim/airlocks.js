// Pressure doors are simulation state. Rendering and proximity cannot bypass this interlock.
export function initAirlocks(v) {
  v.airlocks = Object.fromEntries((v.type.airlocks || []).map(a => [a.id, { pressure: 1, requested: null, phase: 'sealed', remaining: 0 }]));
}
export function requestAirlock(v, id, side) {
  const a = v.type.airlocks?.find(a => a.id === id), s = v.airlocks?.[id];
  if (!a || !s || !['inner', 'outer'].includes(side)) return false;
  s.requested = side; s.phase = 'closing'; s.remaining = a.cycleSeconds;
  v.doors[a.inner].target = v.doors[a.outer].target = 0;
  return true;
}
export function updateAirlocks(v, dt, walkers = []) {
  for (const a of v.type.airlocks || []) {
    const s = v.airlocks[a.id], inner = v.doors[a.inner], outer = v.doors[a.outer];
    if (!s) continue;
    if (s.phase === 'closing') {
      inner.target = outer.target = 0;
      if (inner.open < .001 && outer.open < .001) s.phase = 'cycling';
    }
    if (s.phase === 'cycling') {
      s.remaining = Math.max(0, s.remaining - dt);
      const externalPressure = v.parent ? (v.zone?.pressure ?? 0) : (v.env?.pressure || 0);
      const target = s.requested === 'inner' ? 1 : externalPressure;
      s.pressure += Math.sign(target - s.pressure) * Math.min(Math.abs(target - s.pressure), dt / a.cycleSeconds);
      if (s.remaining === 0) { s.pressure = target; s.phase = 'open'; v.doors[a[s.requested]].target = 1; }
    }
    // Check both the commanded and actual opposite leaf, including interrupted cycles.
    if (outer.open > .001) inner.target = 0;
    if (inner.open > .001) outer.target = 0;
    for (const id of [a.inner, a.outer]) {
      const d = v.type.slideDoors.find(d => d.id === id), st = v.doors[id];
      const occupied = walkers.some(p => Math.abs((d.axis === 'x' ? p.x : p.z) - d.plane) < .48 &&
        (d.axis === 'x' ? p.z : p.x) > d.u0 - .3 && (d.axis === 'x' ? p.z : p.x) < d.u1 + .3 && p.y < d.y1 && p.y + 1.8 > d.y0);
      if (occupied && st.target < st.open) continue; // hold a closing door without opening the other one
      const delta = st.target - st.open, step = dt * .7;
      st.open += Math.sign(delta) * Math.min(Math.abs(delta), step);
    }
  }
}
export function outerAirlockOpen(v, id) {
  const a = v.type.airlocks?.find(a => a.id === id);
  return !!a && v.doors[a.outer].open > .95;
}
export function airlockPressure(v, room) {
  if(room?.pressureDoor && v.doors[room.pressureDoor]?.open>.02)return v.parent?(v.zone?.pressure??0):(v.env?.pressure||0);
  return room?.airlock ? v.airlocks?.[room.airlock]?.pressure ?? 1 : room?.vacuum ? (v.parent ? (v.zone?.pressure ?? 0) : (v.env?.pressure || 0)) : 1;
}
// Cabin-side call button and chamber controls; exit remains the normal F boarding action.
export function interactAirlock(v, pl, input) {
  const p = pl.sPos, room = v.interior.roomAt(p, .1);
  for (const a of v.type.airlocks || []) {
    const state = v.airlocks[a.id];
    if (room?.airlock === a.id) {
      const busy = state.phase === 'closing' || state.phase === 'cycling';
      if (busy) { pl.prompt = { key: null, text: `Airlock · ${state.phase} · ${state.pressure.toFixed(2)} bar` }; return true; }
      if (outerAirlockOpen(v, a.id)) {
        pl.prompt = { key: 'F / R', text: a.outerRoom ? 'F: enter cargo bay · R: cycle back to cabin' : 'F: exit airlock · R: cycle back to cabin' };
        if (input.hit('KeyR')) { requestAirlock(v, a.id, 'inner'); return true; }
        if (input.hit('KeyF')) {
          const e = v.type.entries.find(e => e.airlock === a.id);
          pl.sPos.fromArray(e.outside);
          if (!a.outerRoom) pl.exitVessel();
          else { pl.sVel.set(0,0,0); pl.grounded = false; }
          pl.fade = 1;
        }
        return true;
      }
      pl.prompt = { key: 'F / R', text: a.outerRoom ? 'F: cycle to cargo bay · R: open cabin door' : 'F: cycle to EVA · R: open cabin door' };
      if (input.hit('KeyF')) requestAirlock(v, a.id, 'outer');
      else if (input.hit('KeyR')) requestAirlock(v, a.id, 'inner');
      return true;
    }
    if (room?.id === a.outerRoom) {
      const outer = v.type.slideDoors.find(d => d.id === a.outer);
      const along = outer.axis === 'x' ? p.x : p.z, across = outer.axis === 'x' ? p.z : p.x;
      if (Math.abs(along - outer.plane) < 1.5 && across > outer.u0 - .25 && across < outer.u1 + .25 && v.doors[a.outer].open < .95) {
        pl.prompt = { key: 'F', text: 'Cycle airlock to cargo bay' };
        if (input.hit('KeyF')) requestAirlock(v, a.id, 'outer');
        return true;
      }
    }
    const d = v.type.slideDoors.find(d => d.id === a.inner);
    const across = d.axis === 'x' ? p.z : p.x, along = d.axis === 'x' ? p.x : p.z;
    if (Math.abs(along - d.plane) < 1.5 && across > d.u0 - .25 && across < d.u1 + .25 && Math.abs(p.y - d.y0) < 1.2 && v.doors[a.inner].open < .95) {
      pl.prompt = { key: 'F', text: state.phase === 'cycling' ? 'Airlock pressure cycle in progress' : 'Cycle airlock to cabin' };
      if (input.hit('KeyF') && state.phase !== 'cycling') requestAirlock(v, a.id, 'inner');
      return true;
    }
  }
  return false;
}
