import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {Ship} from '../../src/sim/ship.js';
import {VESSEL_TYPES} from '../../src/sim/vesselTypes.js';
import {applyPropulsion,thrustAccelerationAlong} from '../../src/sim/propulsion.js';

function flight(key) {
 const R=6371000,body={R,GM:9.81*R**2,pos:new THREE.Vector3(),vel:new THREE.Vector3(),q:new THREE.Quaternion(),qInv:new THREE.Quaternion(),omega:new THREE.Vector3(),solid:true,relief:0,atmHeight:1e5,atm:null,
  data:{name:'Airless test planet',Tsurf:290},groundHeight:()=>0,floorAt:()=>0,groundNormal:(p,out)=>out.copy(p).normalize(),atmosphereAt:()=>({pressure:0,density:0,temperature:3})};
 const game={t:0,vessels:[],universe:{bodies:[body]}},s=new Ship(game,VESSEL_TYPES[key]);game.vessels.push(s);s.body=body;
 s.pos.set(0,R+1000,0);s.vel.set(0,-100,0);s.agl=995;s.gear=1;s.legAttach=s.type.legAttach?.map(p=>new THREE.Vector3(...p));
 return s;
}
test('the same emergency descent respects era thrust and structural limits',()=>{
 const result=[];
 for(const key of ['pioneer_nomad','expedition_hearth','horizon_neptune3']) {
  const s=flight(key),F=new THREE.Vector3(),T=new THREE.Vector3();let lowest=Infinity;
  for(let i=0;i<50*120&&!s.dead;i++) {
   s.game.t+=1/120;s.computeControl(1/120,F,T);s.step(1/120,F,T);s.environment(1/120);s.tryLand(1/120);
   lowest=Math.min(lowest,s.agl);
   assert.ok(s.thrustLocal.y<=s.limits.belly+1e-5,'Assistance must never invent lift');
  }
  result.push({s,lowest});
 }
 assert.ok(result[0].s.dead,'Pioneer cannot stop 100 m/s in 1 km with 0.3g net lift');
 assert.ok(!result[1].s.dead&&result[1].s.hull<1,'Expedition reaches the surface in a survivable hard landing');
 assert.ok(!result[2].s.dead&&result[2].s.hull===1&&result[2].lowest>500,'Horizon recovers well above terrain');
});
test('payload mass and fan atmosphere change the predicted lift envelope',()=>{
 const s=flight('horizon_neptune3'),u=new THREE.Vector3(0,1,0),base=thrustAccelerationAlong(s,u);
 s.effMass*=2;assert.ok(Math.abs(thrustAccelerationAlong(s,u)-base/2)<1e-10);
 const fan=flight('expedition_skimmer');fan.env.density=0;
 assert.equal(thrustAccelerationAlong(fan,u),0);
 assert.ok(fan.maxUpAccel()<0,'An atmospheric fan cannot hover in vacuum');
});
test('pod stopping prediction matches the actual force support without moving pods',()=>{
 const s=flight('expedition_porter');assert.ok(s.type.vectorPods);s.podTilt=.43;
 const n=new THREE.Vector3(.2,.7,-.4).normalize();let best=-Infinity;
 for(const x of [-s.limits.lateral,s.limits.lateral])for(const y of [-s.limits.down,0,s.limits.belly])for(const z of [-s.limits.main,0,s.limits.retro]) {
  const f=new THREE.Vector3(x,y,z);applyPropulsion(s,f,new THREE.Vector3(),0);best=Math.max(best,f.dot(n)/s.effMass);
 }
 assert.ok(Math.abs(best-thrustAccelerationAlong(s,n))<1e-9);assert.equal(s.podTilt,.43);
});
test('newer hulls tolerate harder impacts but remain destructible',()=>{
 const ships=['pioneer_nomad','expedition_hearth','horizon_neptune3'].map(flight);
 for(const s of ships){s.game.t=1;s.impact(12);}
 assert.ok(ships[0].hull<ships[1].hull&&ships[1].hull<ships[2].hull);
 for(const s of ships){s.game.t=2;s.impact(60);assert.ok(s.dead);}
});
