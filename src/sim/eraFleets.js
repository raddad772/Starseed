// The eras' fleets (Pioneer, Expedition, Horizon: one model a craft, src/sim/layouts/*.data.js): one
// era's at a time, parked round the start world (Dave: "at some point you'll pick an era for your fleet
// and get all of them more or less. In orbit around starting world works"; "you'll only get one fleet
// of them at a time"). Its craft in a line along a circular orbit, above the FTL mass lock as the big
// ships are and between Halyard's and Bastion's heights, each a few hundred metres clear of the next,
// on rails like the big ships until someone comes; the carried ones in their hosts' clamps. Which era:
// game.fleetEra (?era=pioneer|expedition|horizon; none by default while the eras are designed: Dave
// is working them out, the current fleet of Bastion, Halyard and the Neptune 2 likely an era of its own);
// boarding another era's craft (a test scene) gives this one up for it. World state: placed by the start, again
// on a fresh start or when one of its craft was lost.
import { lockRadius } from './ftl.js';
import * as U from '../core/units.js';
import { spawnPioneerFleet } from './pioneerFleet.js';
import { spawnExpeditionFleet } from './expeditionFleet.js';
import { spawnHorizonFleet } from './horizonFleet.js';

// (heights over the lock at the old tenth-size scale, as game.js FLEET_K reads Halyard's and Bastion's;
// phase: round from the landing site, radians)
const ERAS = {
  pioneer: { spawn: spawnPioneerFleet, alt: 150000, phase: 0.8, carried: [['pioneer_gantry', 'pioneer_trail']] },
  expedition: { spawn: spawnExpeditionFleet, alt: 190000, phase: 0.1, carried: [['expedition_porter', 'expedition_skimmer']] },
  horizon: { spawn: spawnHorizonFleet, alt: 230000, phase: -0.15, carried: [['horizon_cradle', 'horizon_drift']] },
};
const FLEET_K = U.LEN_SCALE / 0.1, GAP = 300;

// an era's craft (made the first time), parked in their line round body b
export function parkEra(g, key, b = g.startBody) {
  const E = ERAS[key], fleet = g[`${key}Fleet`] || E.spawn(g);
  if (!b) return fleet;
  const alt = lockRadius(b) - b.R + E.alt * FLEET_K, r = b.R + alt;
  const cargo = new Set(E.carried.map(([, c]) => c));
  let s = 0, prev = 0;
  for (const v of fleet) {
    if (cargo.has(v.type.key)) continue;
    s += prev + v.type.radius + (prev ? GAP : 0);
    g.placeInOrbit(v, b, alt, E.phase + s / r);
    v.assist = 0; v.gearTarget = v.gear = 0;
    prev = v.type.radius;
  }
  for (const [h, c] of E.carried) {
    const host = fleet.find((v) => v.type.key === h), craft = fleet.find((v) => v.type.key === c);
    craft.dead = false; craft.hull = 1;
    g.clampCargo(host, craft, false, false);
  }
  return fleet;
}

export const ERA_KEYS = Object.keys(ERAS);

// the chosen era's fleet round the start world (and no other era's); none chosen, none (the eras are
// still being designed: ?era= or a test scene's boarding picks one for now)
export function parkEraFleets(g, b = g.startBody) {
  if (!ERAS[g.fleetEra]) g.fleetEra = ERAS[g.opts && g.opts.era] ? g.opts.era : null;
  for (const key of ERA_KEYS) if (key !== g.fleetEra) dropEra(g, key);
  if (g.fleetEra) parkEra(g, g.fleetEra, b);
}

// an era's craft out of the world
function dropEra(g, key) {
  const fleet = g[`${key}Fleet`];
  if (!fleet) return;
  for (const v of fleet) g.removeVessel(v);
  g[`${key}Fleet`] = null;
}

// an era's craft for boarding (a test scene): that era the fleet now (the other given up), parked
// again first if one of its craft was lost
export function eraFleet(g, key) {
  if (g.fleetEra !== key) { g.fleetEra = key; parkEraFleets(g); return g[`${key}Fleet`]; }
  const fleet = g[`${key}Fleet`];
  return fleet && fleet.every((v) => !v.dead) ? fleet : parkEra(g, key);
}
