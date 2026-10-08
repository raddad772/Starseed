import { hostedLife } from '../gen/lifeHistory.js';
import { Rng } from '../core/rng.js';

// Discovery tuning: 100% while playtesting; set to 0.01 for roughly 1 in 100
// currently or formerly life-bearing planets. The roll belongs to the planet, never a landing site.
export const MEGASTRUCTURE_CHANCE = 1;
export function hasPlanetMegastructure(seed, body, chance = MEGASTRUCTURE_CHANCE) {
  if (!body.solid || body.data.kind !== 'planet' || !hostedLife(body)) return false;
  return Rng.fromString(`${seed}:megastructure-presence:${body.id}`).chance(chance);
}

const vector = a => Array.isArray(a) && a.length === 3 && a.every(Number.isFinite) && Math.hypot(...a) > .001;
const validEntrance = r => r && vector(r.dir) && vector(r.heading);

// The first suitable arrival places the entrance nearby for discovery. Save its
// body-fixed direction so later starts and reloads cannot create another site.
export class PlanetSurveySites {
  constructor(seed, { chance = MEGASTRUCTURE_CHANCE, storage } = {}) {
    this.seed = seed;
    this.chance = chance;
    this.entrances = new Map();
    try { this.storage = storage === undefined ? globalThis.localStorage : storage; } catch {}
  }
  get(body, locate) {
    if (!hasPlanetMegastructure(this.seed, body, this.chance)) return null;
    if (this.entrances.has(body.id)) return this.entrances.get(body.id);
    const key = `starseed.survey.planet.v1.${encodeURIComponent(this.seed)}.${body.id}`;
    let entrance;
    try { entrance = JSON.parse(this.storage?.getItem(key) || 'null'); } catch {}
    if (!validEntrance(entrance)) entrance = locate();
    if (!validEntrance(entrance)) return null; // unsuitable terrain: try on the next arrival
    this.entrances.set(body.id, entrance);
    try { this.storage?.setItem(key, JSON.stringify(entrance)); } catch {}
    return entrance;
  }
}
