import * as THREE from 'three';
import { eraFleet } from './eraFleets.js';
import { PIONEER_TYPES } from './layouts/pioneer.data.js';
// Deliberately opt-in: adding an era must not replace the established fleet or save positions.
export function spawnPioneerFleet(g) {
  // (made once: a lost craft is parked again with the rest, eraFleets.js, not made anew)
  if (g.pioneerFleet) return g.pioneerFleet;
  const base = g.carrier;
  const offsets = [[1800,0,0], [2000,0,0], [2140,0,0], [2200,0,0], [2250,0,0], [2290,0,0], [2330,0,0]];
  g.pioneerFleet = Object.entries(PIONEER_TYPES).map(([key,t], i) => {
    const v = g.addVessel(key, t.className.split(' — ')[0], `P-${String(i + 1).padStart(2, '0')}`);
    v.body = base.body; v.pos.copy(base.pos).add(new THREE.Vector3(...offsets[i]).applyQuaternion(base.quat));
    v.vel.copy(base.vel); v.quat.copy(base.quat); v.assist = 0; v.gearTarget = v.gear = t.ground ? 1 : 0;
    return v;
  });
  // The rover is cargo, carried on the Gantry's open frame; Y releases it.
  const gantry = g.pioneerFleet.find(v => v.type.key === 'pioneer_gantry'), trail = g.pioneerFleet.find(v => v.type.key === 'pioneer_trail');
  g.clampCargo(gantry, trail, false, false);
  return g.pioneerFleet;
}
export function boardPioneer(g, key = 'caravan') {
  if (g.player.vessel) g.player.releaseControls(g.player.vessel);
  g.setWarp(0);
  const fleet = eraFleet(g, 'pioneer'), v = fleet.find(v => v.type.key === `pioneer_${key}`);
  g.player.placeAboard(v, new THREE.Vector3(...v.type.seats[0].stand), new THREE.Vector3(0,0,-1));
  g.player.grounded = false; g.player.sVel.set(0,0,0);
  g.player.lastSeat = { vessel: v, seat: 0 };
  g.message(`${v.name} · Pioneer era · freefall: WASD / Space / C, X brakes · F interacts`, 'nav');
  return v;
}
