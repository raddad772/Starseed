import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { game } from './campaign-fixture.mjs';
import { captureFlight,restoreFlight } from '../../src/campaign/flight.js';
import { finishIntroduction } from '../../src/campaign/tutorial.js';
import { encodeCampaign,decodeCampaign } from '../../src/campaign/save.js';
import { chart,resolveSystem,ensureGalaxy,parseAddress,distancePc } from '../../src/campaign/galaxy.js';
import { prepareJourney,JourneyConsent } from '../../src/campaign/travel.js';
import { FlightSaves } from '../../src/campaign/session.js';
import { generateSystem } from '../../src/gen/system.js';
import { Universe } from '../../src/sim/universe.js';

function expedition(){const g=game();g.players[0].mode='ship';g.players[0].vessel=g.ship;g.campaign=finishIntroduction(g.campaign,'skipped');return g;}
const snapshot=g=>decodeCampaign(encodeCampaign(ensureGalaxy(captureFlight(g,g.campaign))));
function restored(c){const g=game();g.seed=c.world.seed;g.system=generateSystem(g.seed);g.universe=new Universe(g.system);g.startBody=g.universe.bodies[g.system.startBodyId];restoreFlight(g,c,{inputForPlayer:()=>({})});g.campaign=c;return g;}

test('the initial 200-star chart is deterministic, compact and extendable by cell address',()=>{
 const c=snapshot(expedition()),a=chart(c),b=chart(c);
 assert.equal(a.length,200);assert.deepEqual(a,b);assert.equal(new Set(a.map(s=>s.id)).size,200);
 const far=resolveSystem(c,parseAddress('52:-18:7'));assert.ok(distancePc(a[0],far)>100);assert.equal(far.id,'star/52/-18/7');
 assert.ok(!JSON.stringify(c).includes('position'));assert.ok(JSON.stringify(c.galaxy).length<180);
 for(const value of ['x:0:1','0:0:8','100001:0:1','1.2:0:1'])assert.throws(()=>parseAddress(value));
});

test('catalogue summaries match generated stars and the pinned receiver has a life planet',()=>{
 const c=snapshot(expedition());
 for(const id of ['system/SOL',c.generation.storyAnchors.receiver.systemId,'star/3/-2/5']){
  const e=resolveSystem(c,id),sys=generateSystem(e.seed);assert.equal(e.summary.name,sys.star.name);assert.equal(e.summary.spectral,sys.star.spectral);
  if(e.bodyId!==undefined){assert.equal(sys.bodies[e.bodyId].kind,'planet');assert.ok(sys.bodies[e.bodyId].life);}
 }
 assert.equal(resolveSystem(c,parseAddress('0:0:1')).id,c.generation.storyAnchors.receiver.systemId);
});

test('outward and return passages preserve nested cargo, away crew, hull, inventory and local discoveries',()=>{
 const g=expedition(),p=g.addPlayer({});p.mode='ship';p.vessel=g.ship;p.ownShip=g.wayfarer;
 g.ship.dockAt(g.tender,g.tender.type.zones[0],new THREE.Vector3(1,2,3),new THREE.Quaternion());g.tender.cargo=g.ship;g.ship.hull=.61;g.ship.hullTemp=620;g.ship.entry.heatLoad=450;
 const held=g.items.create('medkit',p),aboard=g.items.create('mug');g.items.place(aboard,'vessel',g.ship,new THREE.Vector3(1,2,3),new THREE.Quaternion());
 const dropped=g.items.create('lamp');g.items.place(dropped,'surface',g.startBody,new THREE.Vector3(g.startBody.R,0,0),new THREE.Quaternion());
 const adrift=g.items.create('toolbox');Object.assign(adrift,{frame:'orbit',body:g.startBody,r0:[g.startBody.R+10000,0,0],v0:[0,120,0],t0:g.t});
 g.campaignStorage.setItem('starseed.survey.test',JSON.stringify({beacons:[[1,2,3]]}));g.ship.nav.sites.set(g.startBody.id,'orbit');
 const c=snapshot(g),source=JSON.stringify(c),target=c.generation.storyAnchors.receiver.systemId;
 const arrival=decodeCampaign(encodeCampaign(prepareJourney(c,target)));
 assert.equal(JSON.stringify(c),source);assert.equal(arrival.campaignId,c.campaignId);assert.equal(arrival.clock.simulationSeconds,c.clock.simulationSeconds);
 assert.equal(arrival.story.quests['quest/first-receiver'].step,'survey-receiver');assert.deepEqual(arrival.fleet,c.fleet);assert.equal(arrival.players.length,2);
 const ship=arrival.world.vessels.find(v=>v.id===c.world.aliases.ship);assert.equal(ship.hull,.61);assert.equal(ship.hullTemp,620);assert.equal(ship.parent,c.world.aliases.tender);assert.deepEqual(ship.lpos,[1,2,3]);assert.deepEqual(ship.nav.sites,[]);
 assert.deepEqual(arrival.world.items.map(i=>i.id),[held.id,aboard.id]);assert.deepEqual(arrival.galaxy.systems['system/SOL'].items.map(i=>i.id),[dropped.id,adrift.id]);
 const loaded=restored(arrival);assert.equal(loaded.items.nextId,5);assert.equal(loaded.ship.parent,loaded.tender);assert.equal(loaded.players[1].vessel,loaded.ship);
 const back=decodeCampaign(encodeCampaign(prepareJourney(arrival,'system/SOL')));
 assert.deepEqual(back.world.siteStorage,c.world.siteStorage);assert.deepEqual(back.world.items,c.world.items);assert.deepEqual(back.world.vessels.find(v=>v.id===ship.id).nav.sites,c.world.vessels.find(v=>v.id===ship.id).nav.sites);
 assert.equal(back.story.journal.length,arrival.story.journal.length);assert.equal(back.galaxy.systems['system/SOL'],undefined);
});

test('new item IDs never collide with items left in another system after save/reload',()=>{
 const g=expedition(),it=g.items.create('lamp');g.items.place(it,'surface',g.startBody,new THREE.Vector3(g.startBody.R,0,0),new THREE.Quaternion());
 const c=snapshot(g),out=prepareJourney(c,c.generation.storyAnchors.receiver.systemId),loaded=restored(out);
 const newItem=loaded.items.create('supplies',loaded.players[0]);assert.notEqual(newItem.id,it.id);
 const back=prepareJourney(snapshot(loaded),'system/SOL');assert.deepEqual(back.world.items.map(i=>i.id),[newItem.id,it.id]);
});

test('unsafe crew, active local FTL and corrupt unloaded systems are rejected without mutation',()=>{
 const c=snapshot(expedition()),target=c.generation.storyAnchors.receiver.systemId;
 for(const mutate of [s=>s.players[0].mode='eva',s=>s.world.vessels[0].ftl.state='cruise',s=>s.world.vessels[0].dead=true]){const bad=structuredClone(c);mutate(bad);const before=JSON.stringify(bad);assert.throws(()=>prepareJourney(bad,target));assert.equal(JSON.stringify(bad),before);}
 const out=prepareJourney(c,target);
 for(const mutate of [s=>s.galaxy.currentSystemId='star/3/3/3',s=>s.galaxy.nextItemId=0,s=>s.galaxy.systems['system/SOL'].sites.push({body:9999,position:[0,0,0],heading:[1,0,0]}),s=>s.galaxy.systems['system/SOL'].items.push({id:1,kind:'mug',holder:'player/1',frame:null,vessel:null,body:null,pos:[0,0,0],quat:[0,0,0,1],r0:null,v0:null,t0:0})]){const bad=structuredClone(out);mutate(bad);assert.throws(()=>encodeCampaign(bad));}
});

test('crew consent resets on route, participant or runtime change and can be cancelled',()=>{
 const a={players:[{index:0},{index:1}]},b={players:[{index:0},{index:1}]},vote=new JourneyConsent();
 assert.equal(vote.vote(a,'there',0),false);assert.equal(vote.vote(a,'elsewhere',1),false);assert.equal(vote.vote(a,'elsewhere',0),true);
 vote.cancel();assert.equal(vote.destination,null);assert.equal(vote.vote(a,'there',0),false);vote.sync(b);assert.equal(vote.destination,null);
 vote.vote(a,'there',0);a.players.pop();vote.sync(a);assert.equal(vote.destination,null);assert.equal(vote.vote(a,'there',0),true);
});

test('departure is durable before loading; arrival is a separate revision',async()=>{
 let g=expedition();const writes=[],loads=[];
 const storage={async save(c){writes.push(structuredClone(c));return {...structuredClone(c),revision:c.revision+1};}};
 const saves=new FlightSaves({game:()=>g,storage,load:async c=>{assert.equal(writes.length,1);loads.push(c);g=restored(c);}});
 const target=g.campaign.generation.storyAnchors.receiver.systemId;
 await saves.travel(target);assert.equal(writes.length,2);assert.equal(loads.length,1);assert.equal(writes[0].world.seed,'SOL');assert.equal(writes[1].revision,1);assert.equal(g.campaign.revision,2);assert.equal(saves.loading,null);
});

test('storage and renderer failures retain a recoverable departure and report arrival save failure',async()=>{
 for(const stage of ['departure','load','arrival']){
  let g=expedition(),count=0,loaded=false;const original=g;
  const saves=new FlightSaves({game:()=>g,storage:{async save(c){count++;if((stage==='departure'&&count===1)||(stage==='arrival'&&count===2))throw Error('fixture disk failure');return {...structuredClone(c),revision:c.revision+1};}},load:async c=>{loaded=true;if(stage==='load')throw Error('fixture renderer failure');g=restored(c);}});
  await assert.rejects(saves.travel(g.campaign.generation.storyAnchors.receiver.systemId),/fixture/);
  assert.equal(saves.loading,null);assert.equal(loaded,stage!=='departure');
  if(stage!=='arrival')assert.equal(g,original);else {assert.equal(g.campaign.revision,1);assert.match(saves.status,/arrival was not saved/);}
 }
});

import { Game } from '../../src/game.js';
import { provisionExpedition,seatExpeditionPlayer } from '../../src/campaign/newGame.js';
import { VESSEL_TYPES } from '../../src/sim/vesselTypes.js';
for(const flight of ['easy','medium','hard'])test(`${flight} fleet passage preserves its cargo and places assemblies in separated circular orbits`,()=>{
 const g=game();g.surfaceSurveys.planetSites={};g.placeInOrbit=Game.prototype.placeInOrbit;g.clampCargo=Game.prototype.clampCargo;g.beginLoading=()=>{};
 provisionExpedition(g,{rules:{flight}});seatExpeditionPlayer(g,g.players[0]);seatExpeditionPlayer(g,g.addPlayer({}));g.campaign=finishIntroduction(g.campaign,'skipped');
 const c=snapshot(g),out=prepareJourney(c,c.generation.storyAnchors.receiver.systemId),h=restored(out);
 assert.equal(h.players[1].vessel,h.ship2);assert.equal(h.vessels.length,g.vessels.length);
 for(const v of g.vessels.filter(v=>v.parent)){const other=h.vessels.find(s=>s.campaignId===v.campaignId);assert.equal(other.parent.campaignId,v.parent.campaignId);assert.deepEqual(other.lpos.toArray(),v.lpos.toArray());}
 const roots=out.world.vessels.filter(v=>!v.parent);
 for(const v of roots){const body=h.universe.bodies[v.body],r=Math.hypot(...v.pos);assert.ok(r<body.soi*.5&&r>body.R+body.atmHeight);assert.ok(Math.abs(Math.hypot(...v.vel)**2*r/body.GM-1)<1e-10);for(const b of roots.filter(b=>b!==v))assert.ok(Math.hypot(...v.pos.map((n,i)=>n-b.pos[i]))>VESSEL_TYPES[v.type].radius+VESSEL_TYPES[b.type].radius);}
});
