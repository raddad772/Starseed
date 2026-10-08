import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { captureFlight,restoreFlight } from '../../src/campaign/flight.js';
import { encodeCampaign,decodeCampaign } from '../../src/campaign/save.js';
import { CampaignSiteStorage } from '../../src/campaign/siteStorage.js';
import { FlightSaves } from '../../src/campaign/session.js';

import { game } from './campaign-fixture.mjs';

function roundtrip(g){return decodeCampaign(encodeCampaign(captureFlight(g,g.campaign)));}

test('JSON flight round trip restores two players, nested frames, cargo, inventory, heat and the exact epoch',()=>{
 const g=game(),p=g.addPlayer({});p.ownShip=g.wayfarer;p.mode='eva';p.ePos.set(g.startBody.R+12345,456,789);p.eVel.set(2,3,4);
 g.ship.dockAt(g.tender,g.tender.type.zones[0],new THREE.Vector3(1,2,3),new THREE.Quaternion());g.tender.cargo=g.ship;g.ship.hull=.6;g.ship.hullTemp=777;g.ship.entry.heatLoad=4200;
 g.tender.turnovers[0].angle=.8;g.tender.turnovers[0].phase='rotating';g.tender.turnovers[0].requested='outer';
 const held=g.items.create('mug',p),loose=g.items.create('toolbox');g.items.place(loose,'vessel',g.ship,new THREE.Vector3(1,2,3),new THREE.Quaternion());
 const c=roundtrip(g),h=game();restoreFlight(h,c,{inputForPlayer:()=>({})});
 assert.equal(h.t,g.t);assert.equal(h.vessels.length,g.vessels.length);assert.equal(h.players.length,2);assert.equal(h.ship.parent,h.tender);assert.equal(h.tender.cargo,h.ship);assert.equal(h.ship.hullTemp,777);assert.equal(h.ship.hull,.6);assert.equal(h.ship.entry.heatLoad,4200);assert.deepEqual(h.ship.lpos.toArray(),[1,2,3]);
 assert.equal(h.tender.turnovers[0].frame.frameState,h.tender.turnovers[0]);assert.equal(h.tender.turnovers[0].angle,.8);assert.equal(h.tender.deckFrames[0].deckHost,h.tender);
 assert.equal(h.items.list.find(i=>i.id===held.id).holder,h.players[1]);assert.equal(h.items.list.find(i=>i.id===loose.id).vessel,h.ship);assert.deepEqual(h.players[1].ePos.toArray(),p.ePos.toArray());assert.equal(h.players[1].warpRequestIndex,0);assert.equal(h.warpIndex,0);
 assert.deepEqual(roundtrip(h).world.vessels,c.world.vessels);
});

test('saved orbit, FTL phase and navigation intent survive without replaying burn commands',()=>{
 const g=game();g.ship.rails=true;g.ship.railR0=[1e7,0,0];g.ship.railV0=[0,42,0];g.ship.railT0=456;g.ship.ftl.state='cruise';g.ship.ftl.speed=15000;g.ship.ftl.nav={aim:g.startBody,legLimit:120000};
 g.ship.nav.active=true;g.ship.nav.dest={kind:'orbit',body:g.startBody,name:'Earth'};g.ship.auto={vel:new THREE.Vector3(1,2,3)};
 const c=roundtrip(g),h=game();restoreFlight(h,c);assert.equal(h.ship.ftl.state,'cruise');assert.equal(h.ship.ftl.speed,15000);assert.equal(h.ship.ftl.nav.aim,h.startBody);assert.equal(h.ship.nav.active,false);assert.equal(h.ship.auto,null);assert.equal(h.ship.nav.savedOrder.body,h.startBody);assert.equal(h.ship.railT0,456);assert.equal(h.ship.assist,1);
});

test('moving lift position, route and reservations survive a reload',()=>{
 const g=game(),l=g.carrier.turbolift,c=l.cars[0],to=l.stations.find(s=>s.node!==c.node);c.queue=[to.id];
 for(let i=0;i<500&&c.state!=='run';i++)l.update(.1,[]);
 assert.equal(c.state,'run');l.update(.4,[]);
 const saved=roundtrip(g),h=game();restoreFlight(h,saved);const restored=h.carrier.turbolift;
 assert.deepEqual(restored.cars[0].pos.toArray(),c.pos.toArray());assert.equal(restored.cars[0].state,'run');
 l.update(.1,[]);restored.update(.1,[]);assert.deepEqual(restored.cars[0].pos.toArray(),c.pos.toArray());
});

test('missing controller retains player two and their inventory for rejoin',()=>{
 const g=game(),p=g.addPlayer({});p.mode='ship';p.vessel=g.ship;p.ownShip=g.wayfarer;p.sPos.set(1,2,3);g.items.create('medkit',p);
 const h=game();restoreFlight(h,roundtrip(g));assert.equal(h.players.length,1);assert.equal(h.awayPlayers[1].vessel,h.ship);assert.equal(h.items.list[0].holder,h.awayPlayers[1]);
});

test('malformed graphs and changed vessel/generator versions are rejected before mutation',()=>{
 const c=roundtrip(game());
 for(const mutate of [s=>s.world.vessels[0].parent=s.world.vessels[0].id,s=>s.world.vessels[0].signature='old',s=>s.world.systemVersion++,s=>s.players[0].vessel='missing',s=>s.players[0].deathShown=true,s=>s.world.vessels[0].quat=[0,0,0,0],s=>s.world.vessels[0].cargo=s.world.vessels[1].id]){
  const bad=structuredClone(c);mutate(bad);const g=game(),ship=g.ship;assert.throws(()=>restoreFlight(g,bad));assert.equal(g.ship,ship);assert.equal(g.vessels[0],ship);
 }
 const bad=structuredClone(c);bad.world.items.push({id:1,kind:'mug',holder:'unknown',frame:null,vessel:null,body:null,pos:[0,0,0],quat:[0,0,0,1],r0:null,v0:null,t0:0});assert.throws(()=>encodeCampaign(bad),/ownership/);
});

test('site storage is isolated, portable and preserves recovery high-water values',()=>{
 const source=new CampaignSiteStorage({'starseed.survey.v1.SOL.3.anchor.auto':JSON.stringify({fragments:['entry-signal'],sectorsSeen:['hexwell'],beacons:[[1,2,3]]}),'starseed.golden-path.campaign.v1':JSON.stringify({version:1,sites:{'starseed.survey.v1.SOL.3.anchor.auto':125}})});
 const g=game();g.campaignStorage=source;const saves=new FlightSaves({game:()=>g,load(){}});const c=decodeCampaign(saves.exportJSON());assert.equal(Object.values(c.recovery.highestRawBySite)[0],125);assert.equal(Object.keys(c.discoveries.sites).length,1);
 const second=new CampaignSiteStorage(c.world.siteStorage);second.setItem('starseed.survey.v1.SOL.3.anchor.auto','{}');assert.notEqual(source.getItem('starseed.survey.v1.SOL.3.anchor.auto'),'{}');
 g.campaign=c;assert.equal(saves.snapshot().story.journal.length,c.story.journal.length);
});

test('blocked legacy browser storage does not prevent exporting a flight',()=>{
 const descriptor=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
 Object.defineProperty(globalThis,'localStorage',{configurable:true,get(){throw Error('Storage blocked');}});
 try{
  const g=game();delete g.campaign;g.surfaceSurveys.planetSites={};
  const saves=new FlightSaves({game:()=>g,load(){}});
  assert.equal(decodeCampaign(saves.exportJSON()).saveKind,'single-system-flight');
  const blocked={get length(){throw Error('Storage blocked');},getItem(){throw Error('Storage blocked');}};
  assert.deepEqual(CampaignSiteStorage.adopt('SOL',blocked).snapshot(),{});
 }finally{if(descriptor)Object.defineProperty(globalThis,'localStorage',descriptor);else delete globalThis.localStorage;}
});

test('overlapping save requests commit one consistent snapshot and failed writes retain the live record',async()=>{
 const g=game();let resolve,calls=0;const storage={save:async c=>{calls++;await new Promise(r=>resolve=r);return {...c,revision:1};}};
 const saves=new FlightSaves({game:()=>g,load(){},storage});const a=saves.save(),b=saves.save();assert.equal(a,b);g.t+=123;resolve();const result=await a;assert.equal(calls,1);assert.equal(result.clock.simulationSeconds,123456);assert.equal(g.campaign.revision,1);
 storage.save=async()=>{throw Error('Quota exhausted');};await assert.rejects(saves.save(),/Quota/);assert.equal(g.campaign.revision,1);assert.match(saves.status,/Save failed/);
});

test('landed body-fixed poses and surface/orbit items retain their reference frames',()=>{
 const g=game();g.ship.landed=true;g.ship.landedPosF.set(g.startBody.R+12,1,2);g.ship.landedQuatF.setFromAxisAngle(new THREE.Vector3(0,1,0),.4);
 const surface=g.items.create('lamp');g.items.place(surface,'surface',g.startBody,new THREE.Vector3(g.startBody.R+5,0,0),new THREE.Quaternion());
 const orbit=g.items.create('mug');Object.assign(orbit,{frame:'orbit',body:g.startBody,r0:[g.startBody.R+60000,0,0],v0:[0,300,0],t0:g.t});
 const c=roundtrip(g),h=game();restoreFlight(h,c);assert.equal(h.ship.landed,true);assert.deepEqual(h.ship.landedPosF.toArray(),g.ship.landedPosF.toArray());assert.deepEqual(h.ship.landedQuatF.toArray(),g.ship.landedQuatF.toArray());
 assert.equal(h.items.list[0].body,h.startBody);assert.equal(h.items.list[0].frame,'surface');assert.deepEqual(h.items.list[1].r0,orbit.r0);assert.equal(h.items.list[1].t0,g.t);
});

test('load requests serialize and saving waits until reconstruction finishes',async()=>{
 const g=game(),c=roundtrip(g);let finish,started;const began=new Promise(r=>started=r),done=new Promise(r=>finish=r);let calls=0;
 const saves=new FlightSaves({game:()=>g,storage:{load:async()=>({campaign:c})},load:async()=>{calls++;started();await done;}});
 const a=saves.load(c.campaignId),b=saves.load(c.campaignId);assert.equal(a,b);await began;await assert.rejects(saves.save(),/finish loading/);finish();await a;assert.equal(calls,1);assert.equal(saves.loading,null);
});
