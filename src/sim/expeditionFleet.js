import * as THREE from 'three';
import { eraFleet } from './eraFleets.js';
import { EXPEDITION_TYPES } from './layouts/expedition.data.js';
export function spawnExpeditionFleet(g) {
  // (made once: a lost craft is parked again with the rest, eraFleets.js, not made anew)
  if (g.expeditionFleet) return g.expeditionFleet;
  const base = g.carrier;
  const offsets = [[2800,0,0], [3010,0,0], [3140,0,0], [3200,0,0], [3250,0,0], [3290,0,0], [3330,0,0]];
  g.expeditionFleet = Object.entries(EXPEDITION_TYPES).map(([key,t], i) => {
    const v = g.addVessel(key, t.className.split(' — ')[0], `E-${String(i + 1).padStart(2, '0')}`);
    v.body = base.body; v.pos.copy(base.pos).add(new THREE.Vector3(...offsets[i]).applyQuaternion(base.quat));
    v.vel.copy(base.vel); v.quat.copy(base.quat); v.assist = 0; v.gearTarget = v.gear = 0;
    return v;
  });
  const porter = g.expeditionFleet.find(v => v.type.key === 'expedition_porter');
  const skimmer = g.expeditionFleet.find(v => v.type.key === 'expedition_skimmer');
  g.clampCargo(porter, skimmer, false, false);
  return g.expeditionFleet;
}
export function boardExpedition(g, key = 'longreach') {
  if (g.player.vessel) g.player.releaseControls(g.player.vessel);
  g.setWarp(0);
  const v = eraFleet(g, 'expedition').find(v => v.type.key === `expedition_${key}`);
  g.player.placeAboard(v, new THREE.Vector3(...v.type.seats[0].stand), new THREE.Vector3(0,0,-1));
  g.player.grounded = false; g.player.sVel.set(0,0,0);
  g.player.lastSeat = { vessel: v, seat: 0 };
  g.message(`${v.name} · Expedition era · ${v.type.atmosphericThrust ? 'atmosphere-only fans' : 'freefall cabin'} · F interacts · R ramp · Y cargo clamp`, 'nav');
  return v;
}
