import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import { PIONEER_TYPES } from '../../src/sim/layouts/pioneer.data.js';
import { VESSEL_TYPES } from '../../src/sim/vesselTypes.js';
import { Ship } from '../../src/sim/ship.js';
import { RoomInterior } from '../../src/sim/interiors.js';
import { Player } from '../../src/sim/player.js';
import { requestAirlock } from '../../src/sim/airlocks.js';
const game = {universe:{},players:[],items:null};
const vessel = t => { const v=new Ship(game,t);v.body={GM:9.81e6};v.pos.set(0,1000,0);v.interior=new RoomInterior(v,t);return v; };
const overlaps = (a,b) => a.min.every((v,i)=>v<b.max[i]-1e-5 && a.max[i]>b.min[i]+1e-5);
for(const t of Object.values(PIONEER_TYPES)) {
 test(`${t.key}: GLB nodes, metre bounds, materials and animations match the runtime manifest`,()=>{
  assert.equal(VESSEL_TYPES[t.key],t);assert.equal(t.interiorGravity,'natural');assert.equal(t.ftl,["pioneer_anchor", "pioneer_caravan"].includes(t.key));
  const b=readFileSync(new URL('../../'+t.model,import.meta.url));assert.equal(b.readUInt32LE(0),0x46546c67);
  const g=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)));const names=new Set(g.nodes.map(n=>n.name));
  const authored=JSON.parse(g.nodes.find(n=>n.name===t.key).extras.game_manifest);assert.equal(authored.ftl,t.ftl);
  for(const p of t.parts)assert(names.has(p.node),p.node);
  for(const m of g.meshes)for(const p of m.primitives){assert('POSITION'in p.attributes);assert('NORMAL'in p.attributes);if(g.materials[p.material].extras?.semantic==='Hull')assert('COLOR_0'in p.attributes);}
  assert(g.materials.some(m=>m.extras?.semantic==='Hull'));
  for(const bx of [...t.rooms,...t.solids,...t.colliders])assert(bx.min.every((n,i)=>Number.isFinite(n)&&n<bx.max[i]),JSON.stringify(bx));
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
  const v=vessel(t), a=t.airlocks[0],inner=v.doors[a.inner],outer=v.doors[a.outer];
  const tick=(n,walkers=[])=>{for(let i=0;i<n;i++){v.updateSlideDoors(.05,walkers);assert(!(inner.open>.001&&outer.open>.001));}};
  requestAirlock(v,a.id,'inner');tick(160);assert(inner.open>.99);assert.equal(v.airlocks[a.id].pressure,1);
  requestAirlock(v,a.id,'outer');tick(200);assert(outer.open>.99);assert.equal(v.airlocks[a.id].pressure,0);
  const d=t.slideDoors.find(d=>d.id===a.outer);const p=new THREE.Vector3(d.axis==='x'?d.plane:(d.u0+d.u1)/2,d.y0,d.axis==='z'?d.plane:(d.u0+d.u1)/2);
  requestAirlock(v,a.id,'inner');tick(50,[p]);assert(outer.open>.99);assert.equal(inner.open,0);
  tick(200);assert(inner.open>.99);assert.equal(outer.open,0);
  requestAirlock(v,a.id,'outer');tick(8);requestAirlock(v,a.id,'inner');tick(200);assert(inner.open>.99);
 });
}
test('natural gravity: orbit, burn, planet and nested cargo use the correct acceleration',()=>{
 const v=vessel(PIONEER_TYPES.pioneer_firefly),out=new THREE.Vector3();assert.equal(v.feltGravity(out).length(),0);
 v.accel.set(0,0,-.98);assert.deepEqual(v.feltGravity(out).toArray(),[0,0,.98]);
 v.landed=true;assert(Math.abs(v.feltGravity(out).y+9.81)<1e-6);
 const child=vessel(PIONEER_TYPES.pioneer_trail);child.parent=v;child.zone={gravity:'host'};assert(Math.abs(child.feltGravity(out).y+9.81)<1e-6);
});
test('freefall preserves momentum, uses no floor adhesion, and responds to a burn',()=>{
 const v=vessel(PIONEER_TYPES.pioneer_caravan);const p=new Player(game);game.players=[p];p.placeAboard(v,new THREE.Vector3(0,.2,-30),new THREE.Vector3(0,0,-1));p.sVel.set(0,0,.1);
 const input={axis:()=>0,down:()=>false,hit:()=>false};p.updateShip(.1,input,{dx:0,dy:0});assert.equal(p.grounded,false);assert.equal(p.env.gravity,0);assert(Math.abs(p.sVel.z-.1)<1e-8);assert.equal(p.sPos.y,.2);
 v.accel.set(0,0,-1);p.updateShip(.1,input,{dx:0,dy:0});assert(Math.abs(p.sVel.z-.2)<1e-8);assert.equal(p.env.gravity,1);
});
test('both Pioneer cargo mounts fit Trail without intersecting the host structure',()=>{
 const t=PIONEER_TYPES.pioneer_trail;
 for(const host of [PIONEER_TYPES.pioneer_gantry,PIONEER_TYPES.pioneer_nomad]){
  assert(t.size.every((n,i)=>n<=host.clamp.fits[i]),host.key+' declared fit');
  const offset=host.clamp.pos.map((v,i)=>v+t.cargo.offset[i]);
  const rover={min:t.bounds[0].map((v,i)=>v+offset[i]),max:t.bounds[1].map((v,i)=>v+offset[i])};
  const hits=host.colliders.filter(b=>overlaps(b,rover));assert.equal(hits.length,0,host.key+' '+JSON.stringify(hits));
 }
});
test('existing fleet retains artificial interior gravity and proximity doors',()=>{
 assert.notEqual(VESSEL_TYPES.carrier.interiorGravity,'natural');const v=vessel(VESSEL_TYPES.carrier);assert(v.airlocks['bridge-eva']);
 const d=v.type.slideDoors.find(d=>!d.interlock&&!d.whenFree),p=new THREE.Vector3(d.axis==='x'?d.plane:(d.u0+d.u1)/2,d.y0,d.axis==='z'?d.plane:(d.u0+d.u1)/2);v.updateSlideDoors(.5,[p]);assert(v.doors[d.id].open>0);
});
test('fast freefall cannot pass through a shut pressure door',()=>{
 const v=vessel(PIONEER_TYPES.pioneer_caravan),p=new Player(game);game.players=[p];
 const d=v.type.slideDoors.find(d=>d.id==='bridge-passage');p.placeAboard(v,new THREE.Vector3(0,.1,d.plane-1),new THREE.Vector3(0,0,1));p.sVel.set(0,0,40);
 p.updateShip(.1,{axis:()=>0,down:()=>false,hit:()=>false},{dx:0,dy:0});assert(p.sPos.z<d.plane-.3);assert.equal(p.sVel.z,0);
});
test('an atmospheric airlock equalizes to the actual outside pressure',()=>{
 const v=vessel(PIONEER_TYPES.pioneer_hopper),a=v.type.airlocks[0];v.env.pressure=.7;requestAirlock(v,a.id,'outer');
 for(let i=0;i<200;i++)v.updateSlideDoors(.05,[]);assert.equal(v.airlocks[a.id].pressure,.7);assert(v.doors[a.outer].open>.99);
});
test('landing probes clear the ground before the suspension reaches its normal sag',()=>{
 for(const t of Object.values(PIONEER_TYPES).filter(t=>t.legs)){
  const foot=Math.min(...t.legAttach.map(p=>p[1]))-t.legLength+.12;
  assert(t.probes.every(p=>p[1]>=foot-.01),t.key+' hull or cargo platform would hit the ground before the feet');
 }
});
test('Trail wheel forces remain finite while steering under load',()=>{
 const v=vessel(PIONEER_TYPES.pioneer_trail),force=new THREE.Vector3();v.drive={steer:.6,throttle:.5,brake:0};
 v.wheelForce(force,new THREE.Vector3(0,0,-2),new THREE.Vector3(0,1,0),v.mass*9.81/4,0);assert(force.toArray().every(Number.isFinite));assert(force.length()>0);
});
