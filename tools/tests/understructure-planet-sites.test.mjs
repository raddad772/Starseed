import test from 'node:test';
import assert from 'node:assert/strict';
import { generateSystem } from '../../src/gen/system.js';
import { MEGASTRUCTURE_CHANCE, hasPlanetMegastructure, PlanetSurveySites } from '../../src/understructure/planetSites.js';
import { SurfaceSurveys } from '../../src/understructure/integration.js';

const planet = (id = 2) => ({id, solid:true, data:{kind:'planet', life:{density:1}}});
const entrance = {dir:[0,1,0], heading:[0,0,-1]};
const memory = () => {const map=new Map();return {getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v)};};

test('playtest chance is 100%, exclusively on solid life-bearing planets',()=>{
 assert.equal(MEGASTRUCTURE_CHANCE,1);
 for(const seed of ['SOL','FSPB-8DTW','SURVEY-TEST'])for(const data of generateSystem(seed).bodies){
  const body={id:data.id,solid:!!data.solid,data};
  assert.equal(hasPlanetMegastructure(seed,body),!!(data.solid&&data.kind==='planet'&&data.life),data.name);
 }
 assert.equal(hasPlanetMegastructure('SOL',planet()),true);
 for(const body of [{...planet(),solid:false},{...planet(),data:{kind:'planet',life:null}},{...planet(),data:{kind:'moon',life:{}}}])assert.equal(hasPlanetMegastructure('SOL',body),false);
});
test('1% rarity uses a stable planet roll, independent of visitation order',()=>{
 let present=0;
 for(let id=0;id<10000;id++){
  const body=planet(id),roll=hasPlanetMegastructure('RARITY',body,.01);
  assert.equal(roll,hasPlanetMegastructure('RARITY',{...body},.01));
  assert.equal(hasPlanetMegastructure('RARITY',body,0),false);
  assert.equal(hasPlanetMegastructure('RARITY',body,1),true);
  if(roll)present++;
 }
 assert.ok(present>60&&present<140,`Expected about 100 of 10,000 deterministic planets, got ${present}`);
});
test('changing landing site or reloading reuses one saved entrance per planet',()=>{
 const storage=memory(),sites=new PlanetSurveySites('SOL',{storage});let placements=0;
 const first=sites.get(planet(),()=>{placements++;return entrance;});
 assert.equal(sites.get(planet(),()=>{throw Error('Must not place a second entrance');}),first);
 const reloaded=new PlanetSurveySites('SOL',{storage});
 assert.deepEqual(reloaded.get(planet(),()=>{throw Error('Must restore the first entrance after reload');}),first);
 assert.equal(placements,1);
 const elsewhere={dir:[1,0,0],heading:[0,0,1]};
 assert.deepEqual(reloaded.get(planet(3),()=>elsewhere),elsewhere);
 assert.deepEqual(new PlanetSurveySites('OTHER',{storage}).get(planet(),()=>elsewhere),elsewhere);
 // The renderer manager must also reuse its one marker, regardless of proximity.
 const marker={body:planet(),frame:{position:{distanceTo:()=>1e6}}};
 assert.equal(SurfaceSurveys.prototype.addNear.call({sites:[marker]},{body:planet()}),marker);
});
test('failed placement can retry, while barren planets and zero chance never place',()=>{
 const sites=new PlanetSurveySites('SOL',{storage:null});
 assert.equal(sites.get(planet(),()=>null),null);
 assert.deepEqual(sites.get(planet(),()=>entrance),entrance);
 const no=new PlanetSurveySites('SOL',{chance:0,storage:null});
 assert.equal(no.get(planet(),()=>{throw Error('No site on failed planet roll');}),null);
 assert.equal(sites.get({...planet(5),data:{kind:'planet',life:null}},()=>{throw Error('No site on barren planet');}),null);
});
