// A ship's expedition journal. Entries use surveyed world data and are shared
// by its bridge, laboratory and family atlas for the lifetime of this vessel.
export async function recordLocalSurvey(game, vessel) {
  const body = vessel.body;
  if (!body?.solid) throw new Error('Move into the vicinity of a solid world to record a surface survey.');
  const result = await game.requestSurvey(body);
  if (!result) throw new Error('Surface survey data is unavailable.');
  const entry = {
    bodyId: body.id, name: body.data.name, label: body.data.label || 'World',
    gravity: body.data.gravity, pressure: body.data.atmosphere?.pressure || 0,
    day: game.t / 86400, sites: (result.sites || []).map(s => ({ ...s })),
    habitable: !!result.habitable,
  };
  (vessel.explorationLog ||= new Map()).set(body.id, entry);
  return entry;
}

export function nearbyShipStation(vessel, player) {
  if (player.vessel !== vessel || player.mode !== 'ship') return null;
  const p = player.sPos, room = vessel.interior.roomAt(p, .1);
  let closest = null, distance = Infinity;
  for (const station of vessel.type.stations || []) {
    if (room?.id !== station.room) continue;
    const d = Math.hypot(p.x - station.pos[0], p.z - station.pos[2]);
    if (Math.abs(p.y - station.pos[1]) < .8 && d < (station.reach || 1.15) && d < distance) {
      closest = station; distance = d;
    }
  }
  return closest;
}
