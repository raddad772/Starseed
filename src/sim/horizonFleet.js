import * as THREE from 'three';
import { eraFleet } from './eraFleets.js';
import { HORIZON_TYPES } from './layouts/horizon.data.js';
export function spawnHorizonFleet(g) {
  // (made once: a lost craft is parked again with the rest, eraFleets.js, not made anew)
  if (g.horizonFleet) return g.horizonFleet;
  const base = g.carrier;
  const offsets = [[4200,500,0],[5300,500,0],[4800,600,-500],[4900,600,-500],[5000,600,-500],[5100,600,-500],[5150,600,-500]];
  g.horizonFleet = Object.entries(HORIZON_TYPES).map(([key,t], i) => {
    const v = g.addVessel(key, t.className.split(' — ')[0], `H-${String(i + 1).padStart(2, '0')}`);
    v.body = base.body; v.pos.copy(base.pos).add(new THREE.Vector3(...offsets[i]).applyQuaternion(base.quat));
    v.vel.copy(base.vel); v.quat.copy(base.quat); v.assist = 0; v.gearTarget = v.gear = 0;
    return v;
  });
  const porter = g.horizonFleet.find(v => v.type.key === 'horizon_cradle');
  const skimmer = g.horizonFleet.find(v => v.type.key === 'horizon_drift');
  g.clampCargo(porter, skimmer, false, false);
  const family = g.horizonFleet.find(v => v.type.key === 'horizon_neptune3');
  const runabout = g.addVessel('runabout', 'Neptune 3 surface runabout', 'H-03-R');
  g.horizonFleet.push(runabout);
  g.clampCargo(family, runabout, false, true);
  return g.horizonFleet;
}
export function boardHorizon(g, key = 'meridian') {
  if (g.player.vessel) g.player.releaseControls(g.player.vessel);
  g.setWarp(0);
  const v = eraFleet(g, 'horizon').find(v => v.type.key === `horizon_${key}`);
  g.player.placeAboard(v, new THREE.Vector3(...v.type.seats[0].stand), new THREE.Vector3(0,0,-1));
  g.player.grounded = false; g.player.sVel.set(0,0,0);
  g.player.lastSeat = { vessel: v, seat: 0 };
  g.message(`${v.name} · Horizon era · ${v.type.atmosphericThrust ? 'atmosphere-only fans' : 'artificial gravity'} · F interacts · R ramp · Y cargo clamp`, 'nav');
  return v;
}
