import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import fs from 'node:fs';
import { VESSEL_TYPES as T } from '../../src/sim/vesselTypes.js';
import { HORIZON_TYPES as H } from '../../src/sim/layouts/horizon.data.js';
import { Ship } from '../../src/sim/ship.js';
import { RoomInterior } from '../../src/sim/interiors.js';
import { Turbolift } from '../../src/sim/turbolift.js';
import { requestAirlock } from '../../src/sim/airlocks.js';
const g={universe:{},players:[],items:null};
const make=t=>{const v=new Ship(g,t);v.body={GM:9.81e6};v.pos.set(0,1000,0);if(t.turbolift)v.turbolift=new Turbolift(v,t.turbolift);v.interior=new RoomInterior(v,t);return v;};
const overlap=(a,b)=>a.min.every((v,i)=>v<b.max[i]-.001&&a.max[i]>b.min[i]+.001);
for(const t of [...Object.values(H),T.tender,T.lifter,T.carrier,T.yacht,T.tender_yacht]) {
 test(`${t.key}: exported animated nodes exist and geometry values are finite`,()=>{
  const bytes=fs.readFileSync(new URL('../../'+t.model,import.meta.url));const glb=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)));const names=new Set(glb.nodes.map(n=>n.extras?.name||n.name));
  for(const p of t.parts||[])assert(names.has(p.node)||names.has(t.template+':'+p.node),p.node);
  for(const b of [...t.rooms,...t.solids,...t.colliders])assert(b.min.every((v,i)=>Number.isFinite(v)&&v<b.max[i]),JSON.stringify(b));
 });
 test(`${t.key}: pressure interlocks hold during reversal and blocked-door closure`,()=>{
  const v=make(t);
  for(const a of t.airlocks||[]){
   const tick=(n,w=[])=>{for(let i=0;i<n;i++){v.updateSlideDoors(.05,w);assert(!(v.doors[a.inner].open>.001&&v.doors[a.outer].open>.001));}};
   requestAirlock(v,a.id,'inner');tick(200);assert(v.doors[a.inner].open>.99);
   requestAirlock(v,a.id,'outer');tick(220);assert(v.doors[a.outer].open>.99);
   const d=t.slideDoors.find(d=>d.id===a.outer),p=new THREE.Vector3(d.axis==='x'?d.plane:(d.u0+d.u1)/2,d.y0,d.axis==='z'?d.plane:(d.u0+d.u1)/2);
   requestAirlock(v,a.id,'inner');tick(50,[p]);assert(v.doors[a.outer].open>.99);tick(220);assert(v.doors[a.inner].open>.99);
  }
 });
}
for(const type of [T.tender,H.horizon_meridian,H.horizon_confluence])test(`${type.key}: transit reaches every stop with only its landing open`,()=>{
 const v=make(type),tl=v.turbolift;
 for(const [a,b] of tl.spec.edges)assert.equal(tl.spec.nodes[a].filter((v,i)=>Math.abs(v-tl.spec.nodes[b][i])>.01).length,1);
 for(const st of tl.stations){
  tl.send(tl.cars[0],st.id);let arrived=false;
  for(let i=0;i<8000;i++){
   tl.update(.05,[]);const active=tl.stations.filter(s=>tl.landing[s.id]>.01);assert(active.length<=1);
   if(tl.stationOf(tl.cars[0])===st&&tl.cars[0].doors>.99){arrived=true;break;}
  }
  assert(arrived,st.id);assert(tl.cars[0].pos.distanceTo(tl.nodes[st.node])<1e-5);
 }
});
test('Fleet doorways remain free of furniture and wall collisions',()=>{
 for(const t of [...Object.values(H),T.tender,T.carrier,T.yacht,T.lifter,T.tender_yacht])for(const d of t.slideDoors){
  const ax=d.axis==='x'?0:2,ua=ax===0?2:0,c=[0,d.y0+.91,0];c[ax]=d.plane;c[ua]=(d.u0+d.u1)/2;
  const body={min:c.map((v,i)=>v-(i===1?.9:.295)),max:c.map((v,i)=>v+(i===1?.9:.295))};
  assert.equal(t.solids.filter(s=>!s.door&&!s.ride&&!s.shaft&&overlap(s,body)).length,0,t.key+' '+d.id);
 }
});

// Turnover chambers may only open in the requested orientation, after equalization.
test('turnover seals, equalizes and rotates with no exposed moving chamber',async()=>{
 const {requestTurnover,updateDeckFrames}=await import('../../src/sim/deckFrames.js');
 const v={env:{pressure:0},turnovers:[]},frame={lquat:new THREE.Quaternion(),syncFromParent(){}};
 const state={host:v,frame,pad:3,angle:0,phase:'open',side:'inner',requested:'inner',door:1,pressure:1};v.turnovers=[state];
 for(const target of ['outer','inner']){
  assert(requestTurnover(state,target));
  for(let i=0;i<500;i++){
   updateDeckFrames(v,.04);
   if(state.phase==='rotating')assert.equal(state.door,0);
   if(state.door>.001)assert(Math.abs(state.angle-(state.side==='inner'?0:Math.PI))<.001);
  }
  assert.equal(state.side,target);assert.equal(state.phase,'open');assert.equal(state.pressure,target==='inner'?1:0);
 }
});
test('both yacht garages fit their independent runabout without solid-hull collisions',()=>{
 const c=T.runabout;
 for(const h of [T.yacht,T.tender_yacht]){
  assert(c.size.every((v,i)=>v<=h.clamp.fits[i]));
  // Model bounds relative to the runabout's origin, including rollbar and floor pods.
  const off=h.clamp.pos,body={min:[off[0]-1.3,off[1]-.51,off[2]-2.2],max:[off[0]+1.3,off[1]+1.91,off[2]+2.2]};
  assert.equal(h.inner.filter(b=>overlap(b,body)).length,0,h.key);
  assert.equal(h.solids.filter(b=>!b.door&&overlap(b,body)).length,0,h.key+' has no baked-in runabout collision');
 }
});

test('Halyard homes and commons share accessible main circulation',()=>{
 const t=T.tender,step=.2,rad=.29;
 for(const [id,start,targets] of [
  ['middle',[0,-113],[-1,1].flatMap(side=>Array.from({length:side<0?6:3},(_,i)=>[side*2.05,-115-i*(side<0?4.1:8.2)-(side<0?2.4:4.1)]))],
  ['upper',[0,-135],[-1,1].flatMap(side=>Array.from({length:3},(_,i)=>[side*5.2,-119.7-(i+.5)*4.7])).concat([[0,-126],[0,-141]])],
 ]){
  const r=t.rooms.find(r=>r.id===id),nx=Math.ceil((r.max[0]-r.min[0])/step),nz=Math.ceil((r.max[2]-r.min[2])/step),cells=new Uint8Array(nx*nz);
  const solids=t.solids.filter(b=>!b.door&&!b.shaft&&!b.ride&&b.max[1]>r.min[1]+.3&&b.min[1]<r.min[1]+1.8);
  for(let z=0;z<nz;z++)for(let x=0;x<nx;x++){const px=r.min[0]+(x+.5)*step,pz=r.min[2]+(z+.5)*step;if(solids.some(b=>px>b.min[0]-rad&&px<b.max[0]+rad&&pz>b.min[2]-rad&&pz<b.max[2]+rad))cells[z*nx+x]=1;}
  const index=p=>Math.floor((p[1]-r.min[2])/step)*nx+Math.floor((p[0]-r.min[0])/step),q=[index(start)];assert.equal(cells[q[0]],0,id+' start');cells[q[0]]=2;
  for(let k=0;k<q.length;k++){const u=q[k],x=u%nx,z=Math.floor(u/nx);for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+dx,zz=z+dz;if(xx<0||xx>=nx||zz<0||zz>=nz)continue;const v=zz*nx+xx;if(cells[v]===0){cells[v]=2;q.push(v);}}}
  for(const p of targets)assert.equal(cells[index(p)],2,id+' passage to '+p);
 }
});

test('Neptune 3 compartments do not overlap and its garage connection stays clear',()=>{
 const t=H.horizon_neptune3,rooms=t.rooms.filter(r=>!['door','exterior'].includes(r.type));
 for(let i=0;i<rooms.length;i++)for(let j=i+1;j<rooms.length;j++)assert(!overlap(rooms[i],rooms[j]),rooms[i].id+' overlaps '+rooms[j].id);
 const get=id=>rooms.find(r=>r.id===id),passage=get('passage'),lock=get('garage-lock'),garage=get('garage');
 assert.equal(passage.max[2],lock.min[2]);assert.equal(lock.max[2],garage.min[2]);
 assert.equal(passage.min[0],lock.min[0]);assert.equal(passage.max[0],lock.max[0]);
 // Human clearance through both doors and the entire sealed connecting chamber.
 for(let z=3.5;z<=7.5;z+=.1){const body={min:[-.3,.01,z-.3],max:[.3,1.81,z+.3]};assert(!t.solids.some(b=>!b.door&&overlap(b,body)),'Blocked at '+z);}
});
