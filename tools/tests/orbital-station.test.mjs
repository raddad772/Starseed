import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {stationFlight} from '../station-flight-fixture.js';
import {ORBITAL_STATION as S} from '../../src/sim/layouts/orbitalStation.js';
import {RoomInterior} from '../../src/sim/interiors.js';
import {Ship} from '../../src/sim/ship.js';
import {hullEnvelope} from '../../src/sim/reentry.js';

for(const key of ['lifter','horizon_neptune3'])test(`${key} approaches, lands and launches from an orbiting station`,()=>{
 const {ship,host,body,game,step}=stationFlight(key),r0=host.pos.length(),p0=host.pos.clone();
 assert.ok(host.orbit().bound);assert.ok(ship.nav.order({kind:'dock',v:host}));
 for(let i=0;i<240*120&&!ship.attached&&!ship.dead;i++)step();
 assert.ok(ship.attached&&ship.parent===host,ship.deathCause||ship.nav.phase);assert.equal(ship.hull,1);assert.equal(ship.zone.pressure,1);
 assert.ok(host.pos.distanceTo(p0)>1000,'Host must really move along its orbit');
 assert.ok(Math.abs(host.pos.length()-r0)<.01);assert.ok(host.pos.length()>body.R);
 assert.ok(ship.nav.fitsBay(ship.zone));assert.ok(hullEnvelope(ship.type).size[2]<ship.zone.max[2]-ship.zone.min[2]);
 const landedAt=game.t;ship.nav.order({kind:'hold'});
 for(let i=0;i<90*120&&ship.parent&&!ship.dead;i++)step();
 assert.equal(ship.parent,null);assert.equal(ship.hull,1);assert.ok(!ship.dead);
 assert.ok(host.bodyToLocal(ship.pos,new THREE.Vector3()).z<-70);assert.ok(game.t>landedAt);
});
test('all station rooms connect through open doorways or the control lift',()=>{
 const {host}=stationFlight(),I=new RoomInterior(host,S),graph=I.graph(),seen=new Set([0]),queue=[0];
 for(let i=0;i<queue.length;i++)for(const e of graph[queue[i]])if(!seen.has(e.to)){seen.add(e.to);queue.push(e.to);}
 assert.equal(seen.size,S.rooms.length);
 for(const passage of S.rooms.filter(r=>r.type==='passage')) {
  const axis=passage.max[0]-passage.min[0]<passage.max[2]-passage.min[2]?0:2;
  const p=new THREE.Vector3(...passage.min.map((v,i)=>(v+passage.max[i])/2));p.y=passage.min[1];p.setComponent(axis,passage.min[axis]-.4);
  const player={sPos:p,sVel:new THREE.Vector3(),_room:I.roomAt(p)},end=passage.max[axis]+.4;
  for(let i=0;i<120&&p.getComponent(axis)<end;i++){p.setComponent(axis,p.getComponent(axis)+.04);I.confine(player);}
  assert.ok(p.getComponent(axis)>=end-.05,'Blocked '+passage.id);
 }
});
test('occupied station bays hold arrivals outside and oversized hulls are rejected',()=>{
 const {ship,host,game}=stationFlight();
 for(const z of S.zones)host.children.push({zone:z,lpos:new THREE.Vector3(...z.pads[0]),attached:true});
 ship.nav.order({kind:'dock',v:host});ship.nav.update(1/30);ship.nav.update(1/30);
 assert.ok(ship.nav.active);assert.equal(ship.nav.phase,'station');assert.equal(ship.nav.dest.kind,'hold');assert.equal(ship.parent,null);
 const type={...ship.type,bounds:[[-100,-50,-100],[100,50,100]]},large=new Ship(game,type);
 assert.equal(game.zoneAdmits(host,S.zones[0],large),false);
});
