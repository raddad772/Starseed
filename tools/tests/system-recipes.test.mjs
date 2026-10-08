import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';
import { generateSystem,summarizeSystem } from '../../src/gen/system.js';
import { systemIdentity,systemRecipe } from '../../src/gen/systemRecipe.js';
import { getSystem,systemRecord,validSystemRecord,systemCacheKey,clearSystemMemory,prepareSystem } from '../../src/gen/systemCache.js';
import { encodeSystemPack,decodeSystemPack } from '../../src/gen/systemPack.js';
import { chart,ensureGalaxy,resolveSystem } from '../../src/campaign/galaxy.js';
import { validatePlacements } from '../../src/campaign/systemPlacements.js';
import { RECEIVER_PRESETS } from '../../src/campaign/openingSystems.js';
import { createCampaign } from '../../src/campaign/state.js';
import { systemDetails,surveyTargets,recordSystemDetails } from '../../src/campaign/surveyCatalogue.js';
import { lifeHistory } from '../../src/gen/lifeHistory.js';
import { hasPlanetMegastructure } from '../../src/understructure/planetSites.js';
import { game } from './campaign-fixture.mjs';
import { finishIntroduction } from '../../src/campaign/tutorial.js';
import { captureFlight,restoreFlight } from '../../src/campaign/flight.js';
import { prepareJourney } from '../../src/campaign/travel.js';
import { encodeCampaign,decodeCampaign } from '../../src/campaign/save.js';
import { Universe } from '../../src/sim/universe.js';

const handmade=JSON.parse(await readFile(new URL('../../content/systems/handmade-example.json',import.meta.url)));
test('ordinary generator v1 seeds remain byte-for-byte unchanged',()=>{
  for(const [seed,hash] of [['SOL','9706649666f50cda1a07e9adf3acec4c07fa326efb3ed43a4ae072b14f0a0c49'],['FSPB-8DTW','880cfbe6f300940d9a59669001dae2a3b6282031116d13d883915f396eb4f08a']])assert.equal(createHash('sha256').update(JSON.stringify(generateSystem(seed))).digest('hex'),hash);
});
test('authored inputs and sparse overrides pass through the same physical generator',()=>{
  const s=generateSystem(handmade),h=summarizeSystem(handmade);
  assert.equal(s.star.name,'Hearthlight');assert.equal(s.star.mass,.92);assert.equal(s.bodies.length,4);assert.equal(s.startBodyId,2);assert.equal(h.nPlanets,3);assert.equal(h.mass,s.star.mass);
  assert.equal(s.bodies[2].rotation.periodRealH,26);assert.equal(s.bodies[2].aAU,.85);assert.ok(s.bodies[2].GM>0);
  const r={version:1,seed:'SOL',planetOverrides:{2:{name:'Garden'}}},sol=generateSystem(r);
  assert.equal(sol.bodies[3].name,'Garden');assert.equal(sol.bodies[3].moons.length,1);
  assert.equal(sol.bodies[3].GM,generateSystem('SOL').bodies[3].GM);
  assert.equal(systemIdentity({seed:r.seed,planetOverrides:r.planetOverrides,version:1}),systemIdentity(r));
  assert.notEqual(systemIdentity(r),systemIdentity({...r,planetOverrides:{2:{name:'Garden II'}}}));
});
test('malformed authoring and unsupported physical inputs fail explicitly',()=>{
  for(const r of [{...handmade,version:2},{...handmade,luminosity:2},{...handmade,star:{mass:0}}, {...handmade,planets:[{...handmade.planets[0],comp:{iron:1,rock:1,water:0,envelope:0}}]}, {version:1,seed:'SOL',planetOverrides:{22:{name:'missing'}}}])assert.throws(()=>systemRecipe(r));
  assert.throws(()=>generateSystem({...handmade,planets:[...handmade.planets].reverse()}),/increasing/);
  assert.throws(()=>generateSystem({...handmade,star:{mass:3,age:12}}),/main-sequence/);
  assert.throws(()=>generateSystem({...handmade,startPlanet:0,planets:[{...handmade.planets[0],moons:[{aKm:1,massEarth:.1,comp:handmade.planets[0].comp}]}]}),/moon/);
});
test('cached systems preserve history queries, typed arrays and runtime isolation',async()=>{
  clearSystemMemory();await prepareSystem('SOL');
  const a=getSystem('SOL'),b=getSystem('SOL');
  assert.ok(a.bodies[3].history.series.t instanceof Float64Array);
  assert.equal(a.bodies[3].history.at(200,'T'),b.bodies[3].history.at(200,'T'));
  a.bodies[3].history.series.T[0]=-999;a.bodies[3].terrain.snapshot={test:1};
  assert.notEqual(getSystem('SOL').bodies[3].history.series.T[0],-999);assert.equal(b.bodies[3].terrain.snapshot,undefined);
  const rec=systemRecord('SOL',b);assert.ok(validSystemRecord('SOL',rec));
  assert.ok(validSystemRecord('SOL',decodeSystemPack(encodeSystemPack(rec))));
  rec.system.bodies[3].R=7;assert.equal(validSystemRecord('SOL',rec),false);
  assert.notEqual(systemCacheKey(handmade),systemCacheKey({...handmade,star:{...handmade.star,name:'Other'}}));
});
test('map placements override seeds and positions without generating a body catalogue',()=>{
  const c=createCampaign({seed:'FSPB-8DTW'});c.generation.systemPlacements={'1:0:2':{definition:handmade,position:[30,2,4],label:'Authored test'}};
  validatePlacements(c.generation.systemPlacements);
  const e=resolveSystem(c,'star/1/0/2');assert.equal(e.summary.name,'Hearthlight');assert.deepEqual(e.position,[30,2,4]);assert.equal(e.id,'star/1/0/2');
  assert.equal(chart(c).length,200);assert.equal(c.world,null);assert.equal(c.discoveries.systems[e.id],undefined);
  assert.throws(()=>validatePlacements({'01:0:2':{definition:handmade}}));
});
test('authored destinations survive fleet passage, portable save, reconstruction and return',()=>{
  const g=game();g.players[0].mode='ship';g.players[0].vessel=g.ship;g.campaign=finishIntroduction(g.campaign,'skipped');
  g.campaign.generation.systemPlacements={'1:0:2':{definition:handmade,position:[30,2,4]}};
  const before=ensureGalaxy(captureFlight(g,g.campaign)),arrived=decodeCampaign(encodeCampaign(prepareJourney(before,'star/1/0/2')));
  const h=game();h.seed=arrived.world.seed;h.system=getSystem(arrived.world.definition);h.universe=new Universe(h.system);h.startBody=h.universe.bodies[h.system.startBodyId];restoreFlight(h,arrived,{inputForPlayer:()=>({})});
  assert.equal(h.system.star.name,'Hearthlight');assert.equal(arrived.world.seed,systemIdentity(handmade));assert.ok(arrived.discoveries.systems['star/1/0/2'].details);
  const back=decodeCampaign(encodeCampaign(prepareJourney(arrived,'system/SOL')));assert.equal(back.world.definition,undefined);assert.deepEqual(back.galaxy.systems['star/1/0/2'].definition,systemRecipe(handmade));
  const bad=structuredClone(arrived);delete bad.world.definition;assert.throws(()=>encodeCampaign(bad),/recipe/);
});
test('opening presets have life-bearing planets and three distinct landable survey choices',()=>{
  for(const p of RECEIVER_PRESETS){const s=generateSystem(p.seed),b=s.bodies[p.bodyId],details=systemDetails(s),targets=surveyTargets(details);assert.ok(b.solid&&b.kind==='planet'&&b.life);assert.equal(targets.length,3);assert.equal(new Set(targets.map(t=>t.bodyId)).size,3);assert.deepEqual(targets,surveyTargets(details));}
});
test('former life qualifies, while habitability alone and moons do not create planetary sites',()=>{
  const body={id:2,solid:true,data:{kind:'planet',life:null,history:{lifeEver:true,lifeStage:0}}};
  assert.equal(lifeHistory(body),'past');assert.equal(hasPlanetMegastructure('past',body,1),true);
  body.data.history={lifeEver:false,lifeStage:0};assert.equal(hasPlanetMegastructure('past',body,1),false);
  body.data.history={lifeEver:true,lifeStage:0};body.data.kind='moon';assert.equal(hasPlanetMegastructure('past',body,1),false);
});
test('visited details stay compact and do not leak full histories or unvisited worlds',()=>{
  const c=ensureGalaxy(createCampaign({seed:'SOL'})),s=generateSystem('SOL');recordSystemDetails(c,s,[3]);
  const d=c.discoveries.systems['system/SOL'];assert.deepEqual(d.visitedBodies,[3]);assert.ok(JSON.stringify(d).length<16000);assert.equal(JSON.stringify(d).includes('series'),false);assert.equal(c.discoveries.systems[c.generation.storyAnchors.receiver.systemId],undefined);
});
test('shipped opening bundles match the current cache version, seeds and lossless format',async()=>{
  const root=new URL('../../assets/systems/',import.meta.url),index=JSON.parse(await readFile(new URL('index.json',root)));
  const c=ensureGalaxy(createCampaign({seed:index.region}));
  for(const id of [c.galaxy.currentSystemId,c.generation.storyAnchors.receiver.systemId,'star/0/0/2','star/0/0/3']){
    const e=resolveSystem(c,id),r=decodeSystemPack(gunzipSync(await readFile(new URL(index.systems[systemCacheKey(e.definition||e.seed)],root))).toString());assert.ok(validSystemRecord(e.definition||e.seed,r));
  }
});
