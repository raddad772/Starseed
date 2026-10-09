// Detailed system data is a disposable cache, never the galactic chart or a save file.
import { attachHistorySampler } from './worldsim/historySampler.js';
import { openSystemCache, writeSystemCache } from './systemDiskCache.js';
import { generateSystem, GENERATOR_VERSION } from './system.js';
import { addRockyRings } from './rings.js';
import { systemRecipe, systemIdentity, fingerprint } from './systemRecipe.js';
import { LEN_SCALE, HEIGHT_SCALE } from '../core/units.js';
import { SIM_VERSION } from './worldsim/snapshot.js';

export const SYSTEM_CACHE_VERSION = 1;
export const systemCacheKey = input => `system/${SYSTEM_CACHE_VERSION}/${GENERATOR_VERSION}/${SIM_VERSION}/${LEN_SCALE}/${HEIGHT_SCALE}/${fingerprint(systemRecipe(input))}`;
const memory=new Map(), pending=new Map();
const MAX_MEMORY_BYTES=24*1024*1024, MAX_RECORD_BYTES=8*1024*1024;
let memoryBytes=0, queue=Promise.resolve();
export function systemCacheStatus(input) { const r=memory.get(systemCacheKey(input));return r?{ready:true,bytes:r.bytes,source:r.source}:{ready:false,pending:pending.has(systemCacheKey(input))}; }
export function systemRecord(input, system) {
  system=structuredClone({...system,bodies:system.bodies.map(b=>b.history?{...b,history:{...b.history,at:undefined}}:b)});
  const json=JSON.stringify(system);
  return {key:systemCacheKey(input),bytes:json.length*2,digest:fingerprint(json),system};
}
export function validSystemRecord(input,r) {
  if(r?.key!==systemCacheKey(input)||!(r.bytes>0)||r.system?.seed!==systemIdentity(input)||r.system.version!==GENERATOR_VERSION||r.system.star?.soi!==Infinity||!Array.isArray(r.system.bodies)||r.system.bodies[0]?.kind!=='star')return false;
  try{const json=JSON.stringify(r.system);return r.bytes===json.length*2&&r.digest===fingerprint(json);}catch{return false;}
}

function remember(r,source) {
  const old=memory.get(r.key);if(old)memoryBytes-=old.bytes;
  memory.delete(r.key);
  if(r.bytes>MAX_RECORD_BYTES)return;
  while(memory.size && (memory.size>=6 || memoryBytes+r.bytes>MAX_MEMORY_BYTES)) {const [key,entry]=memory.entries().next().value;memoryBytes-=entry.bytes;memory.delete(key);}
  memory.set(r.key,{...r,source});memoryBytes+=r.bytes;
}
export function getSystem(input) {
  const key=systemCacheKey(input);
  if(!memory.has(key)) {
    const r=systemRecord(input,generateSystem(input));remember(r,'generated');
    void openSystemCache().then(async db=>{try{await writeSystemCache(db,r);}finally{db?.close();}});
    if(!memory.has(key))return revive(r.system);
  }
  const r=memory.get(key);
  memory.delete(key);memory.set(key,r);
  // Every runtime gets its own copy: world sims attach snapshots to body terrain data.
  return revive(structuredClone(r.system));
}
export function prepareSystem(input) {
  const recipe=systemRecipe(input),key=systemCacheKey(recipe);
  if(memory.has(key))return Promise.resolve(systemCacheStatus(recipe));
  if(pending.has(key))return pending.get(key);
  const work=queue.catch(()=>{}).then(async()=>{
    if(memory.has(key))return systemCacheStatus(recipe);
    if(typeof Worker==='undefined'){getSystem(recipe);return systemCacheStatus(recipe);}
    const result=await new Promise((resolve,reject)=>{
      const w=new Worker(new URL('../workers/systemWorker.js'+globalThis.location.search,import.meta.url),{type:'module'});
      const finish=(fn,value)=>{clearTimeout(timer);w.terminate();fn(value);};
      const timer=setTimeout(()=>finish(reject,Error('System preparation timed out')),45000);
      w.onmessage=e=>e.data.error?finish(reject,Error(e.data.error)):finish(resolve,e.data);
      w.onerror=e=>finish(reject,Error(e.message));w.postMessage({recipe});
    });
    if(!validSystemRecord(recipe,result.record))throw Error('Invalid prepared system');
    remember(result.record,result.source);return systemCacheStatus(recipe);
  });
  queue=work;pending.set(key,work);
  work.then(()=>pending.delete(key),()=>pending.delete(key));return work;
}
export function clearSystemMemory(){memory.clear();memoryBytes=0;}

// (and a system cached or bundled before rocky worlds had rings gets them: rings.js, deterministic)
function revive(system){for(const b of system.bodies)if(b.history)attachHistorySampler(b.history);return addRockyRings(system);}
