import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { HORIZON_TYPES as H } from '../../src/sim/layouts/horizon.data.js';
import { VESSEL_TYPES as T } from '../../src/sim/vesselTypes.js';
import { recordLocalSurvey, nearbyShipStation } from '../../src/sim/exploration.js';
const ship=H.horizon_neptune3;

test('Neptune 3 accommodates the family of seven plus a guest at night and at dinner',()=>{
  assert.equal(ship.rooms.reduce((n,r)=>n+(r.berths||0),0),8);
  assert.equal(ship.seats.filter(s=>s.label==='Family dining seat').length,7);
  assert.equal(ship.seats.filter(s=>s.label==='Guest dining seat').length,1);
  assert.equal(ship.seats.filter(s=>s.label==='Guest dining seat').length,1);
  assert.equal(ship.seats.filter(s=>s.label==='Guest dining seat').length,1);
  assert.equal(ship.rooms.find(r=>r.id==='commons').diningPlaces,8);
});

test('an astronaut can walk from the bridge to every station, berth, service and seat exit',()=>{
const step=.15,rad=.30,min=[-17.1,-24],max=[17.1,25.05],nx=228,nz=327,cells=new Uint8Array(nx*nz),heights=new Float32Array(nx*nz);
const rooms=ship.rooms.filter(r=>r.type!=='exterior');
const obstacles=ship.solids.filter(s=>!s.door&&s.kind!=='step');
const floors=ship.solids.filter(s=>s.kind==='step');
const coordinates=i=>[min[0]+(i%nx+.5)*step,min[1]+(Math.floor(i/nx)+.5)*step];
for(let i=0;i<cells.length;i++){
 const [x,z]=coordinates(i);const rs=rooms.filter(r=>x>=r.min[0]&&x<=r.max[0]&&z>=r.min[2]&&z<=r.max[2]);
 let f=rs.length?Math.max(...rs.map(r=>r.min[1])):0;
 for(const s of floors)if(x>=s.min[0]&&x<=s.max[0]&&z>=s.min[2]&&z<=s.max[2])f=Math.max(f,s.max[1]);heights[i]=f;
 if(!rs.length||obstacles.some(s=>s.max[1]>f+.36&&s.min[1]<f+1.8&&x>s.min[0]-rad&&x<s.max[0]+rad&&z>s.min[2]-rad&&z<s.max[2]+rad))cells[i]=1;
}
const index=p=>Math.floor((p[2]-min[1])/step)*nx+Math.floor((p[0]-min[0])/step);
const start=index(ship.seats[0].stand);assert.equal(cells[start],0,'pilot access');const queue=[start];if(queue.length)cells[start]=2;
for(let j=0;j<queue.length;j++){const i=queue[j],x=i%nx,z=Math.floor(i/nx);for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const a=x+dx,b=z+dz;if(a<0||a>=nx||b<0||b>=nz)continue;const k=b*nx+a;if(cells[k]===0&&Math.abs(heights[i]-heights[k])<=.36){cells[k]=2;queue.push(k);}}}
const targets=[...ship.walkTargets,...ship.seats.map((s,i)=>({id:'seat-exit-'+i,pos:s.stand}))];
const failures=targets.filter(t=>cells[index(t.pos)]!==2).map(t=>({...t,cell:cells[index(t.pos)],hits:obstacles.filter(s=>s.max[1]>t.pos[1]+.36&&s.min[1]<t.pos[1]+1.8&&t.pos[0]>s.min[0]-rad&&t.pos[0]<s.max[0]+rad&&t.pos[2]>s.min[2]-rad&&t.pos[2]<s.max[2]+rad)}));
  assert.deepEqual(failures,[]);
});

test('runabout restraint sits at floor level and the aft exit lane clears the hull',()=>{
  const mount=ship.clamp.positionsByType.runabout;
  assert.equal(mount[1],.65);
  assert.equal(ship.zones.find(z=>z.kind==='hold').groundSpeedLimit,3);
  // Runabout is parked nose toward the aft ramp, including its rollbar.
  for(const z of [ship.clamp.positionsByType.runabout[2],21,23]){
    const lo=[-1.3,mount[1]-.51,z-2.2],hi=[1.3,mount[1]+1.91,z+2.2];
    assert(!ship.solids.some(s=>!s.door&&lo.every((a,i)=>a<s.max[i]-.001&&hi[i]>s.min[i]+.001)),`exit at ${z}`);
  }
  assert(T.runabout.size.every((v,i)=>v<=ship.clamp.fits[i]));
});

test('stations cannot be operated from another room or while seated',()=>{
  const station=ship.stations[0],v={type:ship,interior:{roomAt:()=>({id:station.room})}};
  const p={vessel:v,mode:'ship',sPos:new THREE.Vector3(...station.pos)};
  assert.equal(nearbyShipStation(v,p),station);
  v.interior.roomAt=()=>({id:'other'});assert.equal(nearbyShipStation(v,p),null);
  v.interior.roomAt=()=>({id:station.room});p.mode='seat';assert.equal(nearbyShipStation(v,p),null);
});

test('survey stations share real world results without duplicate journal entries',async()=>{
  const body={id:'world-1',solid:true,data:{name:'First Light',label:'Temperate world',gravity:9.81,atmosphere:{pressure:1.2}}};
  const v={body},g={t:86400,requestSurvey:async b=>{assert.equal(b,body);return {sites:[{name:'Coast',dir:[1,0,0]}],habitable:true};}};
  const first=await recordLocalSurvey(g,v);assert.equal(first.sites[0].name,'Coast');assert.equal(first.pressure,1.2);
  g.t=172800;await recordLocalSurvey(g,v);assert.equal(v.explorationLog.size,1);assert.equal(v.explorationLog.get(body.id).day,2);
  g.requestSurvey=async()=>{throw Error('Survey unavailable');};
  await assert.rejects(recordLocalSurvey(g,v),/Survey unavailable/);assert.equal(v.explorationLog.size,1);
});


test('guest suite and enlarged family rooms keep docking access in shared space',()=>{
  const bedrooms=ship.rooms.filter(r=>r.berths);
  assert.equal(bedrooms.length,4);
  for(const id of ['parents','kids-a','kids-b']){const r=bedrooms.find(r=>r.id===id);assert(r.max[0]-r.min[0]>9.8,id+' width');}
  assert.equal(bedrooms.find(r=>r.id==='guest').berths,1);
  assert.equal(ship.accommodation.loungeCore,'open');
  const port=ship.ports.find(p=>p.id==='forward-dock');assert(port);
  const room=ship.rooms.find(r=>r.id===port.room);assert.equal(room.type,'airlock');
  const inner=ship.slideDoors.find(d=>d.id===port.innerDoor);assert(inner.rooms.includes('commons'));
  assert(inner.rooms.every(id=>!bedrooms.some(r=>r.id===id)));
});
