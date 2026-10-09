// A small chart into an addressable region. Coordinates are parsecs, never flight metres.
// Only a selected system builds planets; chart entries use the generator's cheap head.
import { Rng, hashStr } from '../core/rng.js';
import { summarizeSystem } from '../gen/system.js';

import { systemRecipe, systemIdentity, canonical } from '../gen/systemRecipe.js';
import { RECEIVER_PRESETS } from './openingSystems.js';

export const GALAXY_VERSION = 1;
export const CELL_PC = 4;
export const STARS_PER_CELL = 8;
export const CENTRAL_OBJECT = { name: 'Central black hole', position: [0, 0, 0] };
// the mirror survey system, 3 pc from the hole (sim/centralObject.js: a sun-like star there keeps
// planets out past 30 AU, and the hole's disk gives it a quarter of Earth's sunlight)
const origin = [3, 0, 0];
export const CHART_ORIGIN = origin;
// no charted star nearer the hole than 1.5 pc, where its tides would strip a star's planets beyond
// ~18 AU: one that falls nearer is set out along its way from the hole, into 1.5-2.25 pc
const CLEAR_PC = 1.5;
function clearOfHole(p) {
  const r = Math.hypot(...p);
  if (r >= CLEAR_PC) return p;
  if (r < 1e-6) return [CLEAR_PC * 1.25, p[1], p[2]];
  const k = (CLEAR_PC + (CLEAR_PC - r) * 0.5) / r;
  return p.map(n => n * k);
}
const receiverOffset = [1.7, .35, 1.1];
const summaries = new Map();
function summary(source) {
  const seed=canonical(systemRecipe(source));
  if (!summaries.has(seed)) {
    if (summaries.size >= 256) summaries.delete(summaries.keys().next().value);
    summaries.set(seed, summarizeSystem(source));
  }
  return summaries.get(seed);
}
const systemId = seed => `system/${seed}`;
export function addressId(x, z, slot) {
  if (![x,z,slot].every(Number.isSafeInteger) || Math.abs(x)>100000 || Math.abs(z)>100000 || slot<0 || slot>=STARS_PER_CELL) throw Error('Use a cell address x:z:star, with star 0–7 and cell coordinates within ±100000.');
  return `star/${x}/${z}/${slot}`;
}
export function parseAddress(text) {
  const m = /^(-?\d+):(-?\d+):(\d+)$/.exec(text.trim());
  if (!m) throw Error('Enter an address such as 3:0:2.');
  return addressId(+m[1], +m[2], +m[3]);
}
function receiverAnchor(c) {
  return c.generation.storyAnchors.receiver || {systemId:systemId(`${c.generation.galaxySeed}-RECEIVER`),seed:`${c.generation.galaxySeed}-RECEIVER`,label:'Transmission receiver'};
}

// Pin a real life-bearing receiver once. Existing provisional addresses stay stable;
// only their previously ungenerated seed is resolved. Already visited worlds never reroll.
export function pinReceiver(c) {
  const old = receiverAnchor(c);
  if (old.catalogueVersion === GALAXY_VERSION || c.discoveries.systems[old.systemId]?.visited) return old;
  const placement=c.generation.systemPlacements?.['0:0:1'];
  if(placement)return {...old,seed:systemIdentity(placement.definition),catalogueVersion:GALAXY_VERSION};
  const pool=RECEIVER_PRESETS.filter(p=>p.seed!==c.generation.galaxySeed);
  const chosen=c.generation.galaxySeed==='FSPB-8DTW'?RECEIVER_PRESETS[0]:c.generation.galaxySeed==='SOL'?RECEIVER_PRESETS[1]:pool[hashStr(c.generation.galaxySeed)[0]%pool.length];
  return {...old,...chosen,catalogueVersion:GALAXY_VERSION};
}
export function ensureGalaxy(c) {
  if (c.galaxy) return c;
  if(c.generation.versions.galaxy!==GALAXY_VERSION)throw Error('This expedition needs a different galaxy catalogue version.');
  c.generation.storyAnchors.receiver=pinReceiver(c);
  c.galaxy={version:GALAXY_VERSION,currentSystemId:systemId(c.generation.galaxySeed),systems:{},nextItemId:Math.max(1,...(c.world?.items||[]).map(i=>i.id+1))};
  const id=c.galaxy.currentSystemId;
  c.discoveries.systems[id]={...c.discoveries.systems[id],knowledge:'charted',visited:true};
  return c;
}

export function resolveSystem(c, id) {
  const seed=c.generation.galaxySeed, receiver=receiverAnchor(c);
  let entry;
  if(id===systemId(seed)||id===addressId(0,0,0)) entry={id:systemId(seed),seed,position:[...origin],address:'0:0:0',role:'origin',label:'Mirror survey system'};
  else if(id===receiver.systemId||id===addressId(0,0,1)) entry={id:receiver.systemId,seed:receiver.seed,position:origin.map((n,i)=>n+receiverOffset[i]),address:'0:0:1',role:'receiver',label:'Transmission receiver',bodyId:receiver.bodyId};
  else {
    const match=/^star\/(-?\d+)\/(-?\d+)\/(\d+)$/.exec(id);
    if(!match || addressId(+match[1],+match[2],+match[3])!==id)throw Error('This system has no address in the expedition chart.');
    const [,xs,zs,ns]=match,x=+xs,z=+zs,n=+ns;
    const rng=Rng.fromString(`galaxy/v${GALAXY_VERSION}/${seed}/${id}`);
    const key=hashStr(`galaxy/v${GALAXY_VERSION}/${seed}/${id}`).map(n=>n.toString(16).padStart(8,'0')).join('');
    entry={id,seed:`G-${key.toUpperCase()}`,address:`${x}:${z}:${n}`,position:clearOfHole([origin[0]+(x+rng.range(-.45,.45))*CELL_PC,rng.range(-1.5,1.5),origin[2]+(z+rng.range(-.45,.45))*CELL_PC]),role:null};
  }
  const placement=c.generation.systemPlacements?.[entry.address];
  if(placement)entry={...entry,...(placement.position?{position:[...placement.position]}:{}),...(placement.label?{label:placement.label}:{}),seed:systemIdentity(placement.definition),definition:systemRecipe(placement.definition)};
  return {...entry,summary:summary(entry.definition||entry.seed)};
}
export function chart(c, center=[0,0]) {
  const entries=[];
  for(let x=Math.max(-100000,center[0]-2);x<=Math.min(100000,center[0]+2);x++)for(let z=Math.max(-100000,center[1]-2);z<=Math.min(100000,center[1]+2);z++)for(let n=0;n<STARS_PER_CELL;n++)entries.push(resolveSystem(c,addressId(x,z,n)));
  for(const id of [c.galaxy?.currentSystemId,systemId(c.generation.galaxySeed),c.story.quests['quest/first-receiver']?.targetSystemId,...Object.keys(c.discoveries.systems)]) {
    if(id&&!entries.some(e=>e.id===id)) { try { entries.push(resolveSystem(c,id)); } catch { /* Older discovery records need no speculative position. */ } }
  }
  return entries;
}
export const distancePc = (a,b) => Math.hypot(...a.position.map((n,i)=>n-b.position[i]));
