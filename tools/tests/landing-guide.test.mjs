import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { Ship } from '../../src/sim/ship.js';
import { NavComputer } from '../../src/sim/navComputer.js';
import { OrbitalFlight } from '../../src/sim/orbitalFlight.js';
import { surfaceTargets } from '../../src/sim/surfaceGuidance.js';
import { projectGuideEdge } from '../../src/ui/landingHUD.js';
const V=(...a)=>new THREE.Vector3(...a);
function fixture(){
 const b={id:'world',R:1e6,GM:9.81e12,solid:true,relief:0,atmHeight:0,pos:V(1e9,0,0),omega:V(),q:new THREE.Quaternion(),qInv:new THREE.Quaternion(),data:{name:'Test world'},groundHeight:()=>0};
 const g={t:0,players:[],universe:{bodies:[b]},aboardOf:()=>[],startBody:b,startDir:V(0,1,0)};
 const s=new Ship(g);s.body=b;s.nav=new NavComputer(g,s);s.pos.set(0,b.R+640,5000);s.agl=s.altitude;s.gear=1;
 const guide=s.nav.landingGuide;guide.select(s.nav.destinationFor(b));
 return {g,b,s,guide};
}
test('manual selection does not engage autopilot; corridor remains fixed while ship and planet move',()=>{
 const {s,b,guide}=fixture(),before={assist:s.assist,vel:s.vel.toArray(),quat:s.quat.toArray(),auto:s.auto};
 const first=guide.update(),route=guide.route;assert.ok(first.gates.length>3);assert.equal(s.nav.active,false);assert.deepEqual({assist:s.assist,vel:s.vel.toArray(),quat:s.quat.toArray(),auto:s.auto},before);
 s.pos.x+=120;guide.update();assert.equal(guide.route,route);assert.ok(Math.abs(guide.update().cross)>100);
 const a=guide.update().site.clone().sub(b.pos);b.q.setFromAxisAngle(V(0,0,1),.3);b.qInv.copy(b.q).invert();s.pos.applyQuaternion(b.q);
 const rotated=guide.update();assert.equal(guide.route,route);assert.ok(rotated.site.clone().sub(b.pos).distanceTo(a.applyQuaternion(b.q))<1e-6);
});
test('guide persists after releasing nav, follows site selection, and respects hide and orbit orders',()=>{
 const {s,b,guide}=fixture();s.nav.active=true;s.nav.dest=guide.dest;guide.update();s.nav.active=false;assert.ok(guide.update());
 s.nav.chooseSite(b,{dirF:V(.001,1,0).normalize(),label:'new spot'});assert.equal(guide.update().label,'new spot');
 guide.enabled=false;assert.equal(guide.update(),null);guide.enabled=true;s.nav.chooseSite(b,'orbit');assert.equal(guide.update(),null);
});
test('terminal guide catches gear, descent stopping distance and loaded thrust limits',()=>{
 const {s,b,guide}=fixture();s.pos.set(0,b.R+35,3);s.agl=35;s.vel.set(0,-100,12);s.gear=0;
 let state=guide.update();assert.ok(state.final);assert.ok(state.caution.includes('LOWER GEAR'));assert.ok(state.caution.includes('ARREST DESCENT'));assert.ok(state.caution.includes('BRAKE'));
 for(const k of ['main','belly'])s.limits[k]=s.effMass;
 state=guide.update();assert.ok(state.caution.includes('INSUFFICIENT LOADED THRUST'));assert.ok(state.targetSpeed<=3);
});
test('orbital and remote targets give a handoff instead of a misleading ground tunnel',()=>{
 const {s,b,guide}=fixture();s.pos.y=b.R+1e5;assert.ok(guide.update().waiting);s.pos.y=b.R+640;
 s.vel.set(3000,0,0);assert.ok(guide.update().waiting);s.vel.set(0,0,0);
 guide.dest={kind:'site',body:{},name:'Elsewhere'};assert.ok(guide.update().message.includes('Elsewhere'));
 guide.dest={kind:'site',body:b,dirF:null};assert.ok(guide.update().message.includes('surveying'));
});
test('terrain lifts the corridor and an overshoot requires turning back, not moving the tunnel',()=>{
 const {s,b,guide}=fixture();b.groundHeight=dir=>dir.z>.002&&dir.z<.004?900:0;
 guide.update();assert.ok(guide.route.gates.some(g=>g.terrainRaised));const route=guide.route;
 for(let i=1;i<route.gates.length;i++)assert.ok(route.gates[i].altitude>=route.gates[i-1].altitude);
 s.pos.z=-200;const state=guide.update();assert.equal(guide.route,route);assert.ok(state.caution.includes('TURN BACK TO SITE'));
});
test('near-ground autopilot and HUD share the same speed target including terrain caps',()=>{
 const {s}=fixture(),up=s.pos.clone().normalize(),heading=V(0,0,-1),args={up,heading,range:240,height:120,targetHeight:80};
 s.terrainAhead=()=>({need:3,vHmax:2});const expected=surfaceTargets(s,args);assert.equal(expected.vh,2);assert.equal(expected.vv,3);
 let command;s.nav.slew=(A,v)=>{command=v;};s.nav.level=()=>{};
 new OrbitalFlight(s.nav,'entry',()=>{}).surface({},args);
 const velocity=heading.clone().multiplyScalar(expected.vh).addScaledVector(up,expected.vv).add(s.frameVel(V()));assert.ok(command.distanceTo(velocity)<1e-8);
});
test('gate projection clips both the near plane and viewport without reversed huge boxes',()=>{
 const c={position:V(),quaternion:new THREE.Quaternion(),fov:70,aspect:1.6,width:800,height:500};
 assert.equal(projectGuideEdge(V(0,0,1),V(2,0,2),c),null);
 const edge=projectGuideEdge(V(-2,0,-2),V(2,0,2),c);assert.ok(edge);for(const p of edge)assert.ok(p[0]>=0&&p[0]<=800&&p[1]>=0&&p[1]<=500);
 assert.equal(projectGuideEdge(V(100,0,-2),V(120,0,-2),c),null);
});
test('on-slope guidance descends along the path while terrain can override it with a climb',()=>{
 const {s,guide}=fixture();s.vel.set(0,0,-45);let reading=guide.update();
 assert.ok(reading.targetVertical<-4,'Following a descending path needs descent even when near its height');
 s.terrainAhead=()=>({need:8,vHmax:10});reading=guide.update();assert.equal(reading.targetVertical,8);assert.equal(reading.targetSpeed,10);
});
