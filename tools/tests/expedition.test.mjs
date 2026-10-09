import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import { EXPEDITION_TYPES } from '../../src/sim/layouts/expedition.data.js';
import { VESSEL_TYPES } from '../../src/sim/vesselTypes.js';
import { Ship } from '../../src/sim/ship.js';
import { RoomInterior } from '../../src/sim/interiors.js';
import { Player } from '../../src/sim/player.js';
import { applyPropulsion, thrustAvailability } from '../../src/sim/propulsion.js';
import { PIONEER_TYPES } from '../../src/sim/layouts/pioneer.data.js';
import { requestAirlock, interactAirlock } from '../../src/sim/airlocks.js';
const game = {universe:{},players:[],items:null};
const vessel = t => { const v=new Ship(game,t);v.body={GM:9.81e6};v.pos.set(0,1000,0);v.interior=new RoomInterior(v,t);return v; };
const overlaps = (a,b) => a.min.every((v,i)=>v<b.max[i]-1e-5 && a.max[i]>b.min[i]+1e-5);
for(const t of Object.values(EXPEDITION_TYPES)) {
 test(`${t.key}: GLB nodes, metre bounds, materials and animations match the runtime manifest`,()=>{
  assert.equal(VESSEL_TYPES[t.key],t);assert.equal(t.interiorGravity,'natural');assert.equal(t.ftl,["expedition_crosscurrent", "expedition_longreach"].includes(t.key));
  const b=readFileSync(new URL('../../'+t.model,import.meta.url));assert.equal(b.readUInt32LE(0),0x46546c67);
  const g=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)));const names=new Set(g.nodes.map(n=>n.name));
  const authored=JSON.parse(g.nodes.find(n=>n.name===t.key).extras.game_manifest);assert.equal(authored.ftl,t.ftl);
  for(const p of t.parts)assert(names.has(p.node),p.node);
  for(const m of g.meshes)for(const p of m.primitives){assert('POSITION'in p.attributes);assert('NORMAL'in p.attributes);if(g.materials[p.material].extras?.semantic==='Hull')assert('COLOR_0'in p.attributes);}
  assert(g.materials.some(m=>m.extras?.semantic==='Hull'));
  for(const bx of [...t.rooms,...t.solids,...t.colliders])assert(bx.min.every((n,i)=>Number.isFinite(n)&&n<bx.max[i]),JSON.stringify(bx));
  assert.equal(new Set(t.rooms.map(r=>r.id)).size,t.rooms.length,'room IDs must be unique');
  assert(t.seats.some(s=>s.pilot));assert(t.parts.length>0);assert(t.probes.every(p=>p.every(Number.isFinite)));
 });
 test(`${t.key}: every compartment connects to the bridge via authored doors`,()=>{
  const ids=new Set(['bridge']);let n=0;do{n=ids.size;for(const d of t.slideDoors){if(ids.has(d.rooms[0]))ids.add(d.rooms[1]);if(ids.has(d.rooms[1]))ids.add(d.rooms[0]);}}while(n!==ids.size);
  for(const r of t.rooms.filter(r=>r.type!=='door'))assert(ids.has(r.id),r.id);
  // A 60 cm wide, 1.8 m tall avatar must clear each open doorway.
  for(const d of t.slideDoors){
   const axis=d.axis==='x'?0:2,u=axis===0?2:0,c=[0,d.y0+.91,0];c[axis]=d.plane;c[u]=(d.u0+d.u1)/2;
   const body={min:c.map((v,i)=>v-(i===1?.90:.295)),max:c.map((v,i)=>v+(i===1?.90:.295))};
   const walls=t.solids.filter(b=>!b.door&&overlaps(body,b));assert.equal(walls.length,0,`${d.id}: doorway blocked by ${JSON.stringify(walls)}`);
  }
 });
 test(`${t.key}: airlocks cycle and remain interlocked when reversed or obstructed`,()=>{
  for(const a of t.airlocks) {
  const v=vessel(t),inner=v.doors[a.inner],outer=v.doors[a.outer];
  const tick=(n,walkers=[])=>{for(let i=0;i<n;i++){v.updateSlideDoors(.05,walkers);assert(!(inner.open>.001&&outer.open>.001));}};
  requestAirlock(v,a.id,'inner');tick(160);assert(inner.open>.99);assert.equal(v.airlocks[a.id].pressure,1);
  requestAirlock(v,a.id,'outer');tick(200);assert(outer.open>.99);assert.equal(v.airlocks[a.id].pressure,0);
  const d=t.slideDoors.find(d=>d.id===a.outer);const p=new THREE.Vector3(d.axis==='x'?d.plane:(d.u0+d.u1)/2,d.y0,d.axis==='z'?d.plane:(d.u0+d.u1)/2);
  requestAirlock(v,a.id,'inner');tick(50,[p]);assert(outer.open>.99);assert.equal(inner.open,0);
  tick(200);assert(inner.open>.99);assert.equal(outer.open,0);
  requestAirlock(v,a.id,'outer');tick(8);requestAirlock(v,a.id,'inner');tick(200);assert(inner.open>.99);
  }
 });
}
test('sealed garage locks transfer the player internally and keep the cabin isolated',()=>{
 for(const key of ['hearth','kestrel']) {
  const v=vessel(EXPEDITION_TYPES['expedition_'+key]),a=v.type.airlocks.find(a=>a.outerRoom),p=new Player(game);game.players=[p];
  const entry=v.type.entries.find(e=>e.airlock===a.id);p.placeAboard(v,new THREE.Vector3(...entry.inside),new THREE.Vector3(0,0,1));
  requestAirlock(v,a.id,'outer');for(let i=0;i<200;i++)v.updateSlideDoors(.05,[]);
  interactAirlock(v,p,{hit:key=>key==='KeyF'});assert.equal(p.vessel,v);assert.equal(p.mode,'ship');assert.equal(v.interior.roomAt(p.sPos).id,a.outerRoom);assert.equal(v.interior.pressureAt(p.sPos),0);
  assert.equal(v.doors[a.inner].open,0);v.env.pressure=.8;assert.equal(v.interior.pressureAt(p.sPos),.8);
  v.doors[a.outer].open=0;v.doors[a.outer].target=0;interactAirlock(v,p,{hit:key=>key==='KeyF'});assert.equal(v.airlocks[a.id].requested,'outer');
 }
});
test('Porter and Hearth fit Skimmer, and Porter has a clear sideways unloading corridor',()=>{
 const c=EXPEDITION_TYPES.expedition_skimmer;
 for(const key of ['porter','hearth']) {
  const h=EXPEDITION_TYPES['expedition_'+key];assert(c.size.every((s,i)=>s<=h.clamp.fits[i]),key+' declared fit');
  const p=h.clamp.pos.map((v,i)=>v+c.cargo.offset[i]);
  for(const x of key==='porter'?[-12,-9,-6,-3,0,3,6,9,12]:[0]){
   const box={min:c.bounds[0].map((v,i)=>v+p[i]+(i===0?x:0)),max:c.bounds[1].map((v,i)=>v+p[i]+(i===0?x:0))};
   const hits=h.colliders.filter(b=>overlaps(box,b));assert.equal(hits.length,0,`${key} offset ${x}: ${JSON.stringify(hits)}`);
  }
 }
});
test('Kestrel fits the Pioneer Trail rover inside its rear bay',()=>{
 const h=EXPEDITION_TYPES.expedition_kestrel,c=PIONEER_TYPES.pioneer_trail,p=h.clamp.pos.map((v,i)=>v+c.cargo.offset[i]);
 assert(c.size.every((s,i)=>s<=h.clamp.fits[i]));
 const box={min:c.bounds[0].map((v,i)=>v+p[i]),max:c.bounds[1].map((v,i)=>v+p[i])};assert.equal(h.colliders.filter(b=>overlaps(box,b)).length,0);
});
test('the open Crosscurrent center is clear above the service cradles',()=>{
 const h=EXPEDITION_TYPES.expedition_crosscurrent,center={min:[-12,0,-30],max:[12,8,35]};
 assert.equal(h.colliders.filter(b=>overlaps(center,b)).length,0);
 assert.equal(h.zones.filter(z=>z.kind==='pad').length,4);assert.equal(EXPEDITION_TYPES.expedition_longreach.zones.length,4);
});
test('all deployed landing probes clear the feet at normal suspension sag',()=>{
 for(const t of Object.values(EXPEDITION_TYPES).filter(t=>t.legs)){
  const floor=Math.min(...t.legAttach.map(p=>p[1]))-t.legLength+.12;
  assert(t.probes.every(p=>p[1]>=floor-.01),t.key);
 }
});
test('fan-only Skimmer loses translation and attitude thrust in vacuum, including inside a parent',()=>{
 const v=vessel(EXPEDITION_TYPES.expedition_skimmer),F=new THREE.Vector3(1,2,3),T=new THREE.Vector3(4,5,6);
 applyPropulsion(v,F,T,.1);assert.equal(F.length(),0);assert.equal(T.length(),0);
 v.env.density=.6125;F.set(2,4,6);T.set(4,6,8);applyPropulsion(v,F,T,.1);assert.deepEqual(F.toArray(),[1,2,3]);assert.equal(thrustAvailability(v),.5);
 v.parent={};v.zone={pressure:0};assert.equal(thrustAvailability(v),0);v.zone.pressure=1;assert.equal(thrustAvailability(v),1);
 assert.equal(thrustAvailability(vessel(EXPEDITION_TYPES.expedition_moth)),1);
});
test('Porter main thrust follows its actual rotating pod axes during the transition',()=>{
 const v=vessel(EXPEDITION_TYPES.expedition_porter),F=new THREE.Vector3(0,1000,0),T=new THREE.Vector3();
 applyPropulsion(v,F,T,.1);assert(Math.abs(v.podTilt-.065)<1e-10);assert(F.y<1000);assert(F.z<0);assert(Math.abs(F.y/(-F.z)-Math.tan(v.podTilt))<1e-9);
 for(let i=0;i<40;i++){F.set(0,1000,0);applyPropulsion(v,F,T,.1);}assert.equal(v.podTilt,Math.PI/2);assert(Math.abs(F.y-1000)<1e-8);assert(Math.abs(F.z)<1e-8);
 F.set(0,0,-1000);applyPropulsion(v,F,T,.1);assert(v.podTilt<Math.PI/2);assert(F.y>0);
});
test('open ramps provide a continuous sloped floor and a closed ramp blocks exit',()=>{
 for(const key of ['hearth','kestrel']){
  const t=EXPEDITION_TYPES['expedition_'+key],v=vessel(t),r=t.ramps[0],d=t.doors.find(d=>d.id===r.door);
  assert.equal(v.interior.rampAt(0,r.hinge[1]+.3),null);v.doors[r.door].open=1;
  for(const frac of [.1,.5,.9]){
   const z=r.hinge[1]+r.length*Math.sin(d.angle)*frac;
   assert(Math.abs(v.interior.rampAt(0,z)-(r.hinge[0]+r.length*Math.cos(d.angle)*frac))<1e-8);
  }
 }
});
test('family and long-endurance crews have the declared number of sleep berths',()=>{
 for(const key of ['longreach','crosscurrent','hearth']){
  const t=EXPEDITION_TYPES['expedition_'+key];assert.equal(t.rooms.reduce((n,r)=>n+(r.berths||0),0),t.crewCapacity);
 }
});
