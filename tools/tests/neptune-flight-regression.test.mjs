import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { Game } from '../../src/game.js';
import { Player } from '../../src/sim/player.js';
import { WorldSims } from '../../src/sim/worldSims.js';
import { sweepSuit, collideEva, evaColliders } from '../../src/sim/evaContacts.js';
import { makeInterior } from '../../src/sim/interiors.js';
import { orbitalFlight } from '../orbital-flight-fixture.js';

const V=(...p)=>new THREE.Vector3(...p);
test('orbital placement does not require a landing-site survey',()=>{
  let spawned=false,applied=null;
  const g={opts:{startChoice:'orbit:3'},startBody:{id:3},spawnFleet(){spawned=true;},applyStart(key){applied=key;},startSim(){throw Error('should not simulate before orbital placement');},requestSurvey(){throw Error('should not survey before orbital placement');}};
  Game.prototype.begin.call(g);
  assert.equal(spawned,true);assert.equal(g.placed,true);assert.equal(applied,'orbit:3');assert.equal(g.startDir,null);
});
test('entering orbit waits for planetary history and ignores a stale world selection',async()=>{
  let complete,progress;
  const body={solid:true,data:{name:'Fixture',terrain:{}}};
  const g={worldSims:{},startToken:1,startSim(b,callback){assert.equal(b,body);progress=callback;return new Promise(resolve=>complete=resolve);}};
  Game.prototype.waitForOrbitalHistory.call(g,body);assert.equal(g.loadHold,true);
  progress('running','climate');assert.match(g.loadText,/Generating Fixture.*climate/);
  complete();await Promise.resolve();assert.equal(g.loadHold,false);
  Game.prototype.waitForOrbitalHistory.call(g,body);g.startToken=2;g.loadText='New selection';complete();await Promise.resolve();
  assert.equal(g.loadHold,true);assert.equal(g.loadText,'New selection');
});
test('planetary history uses the cached snapshot without queuing generation',async()=>{
  const snapshot={N:12,fixture:true};
  let read,applied;
  const db={transaction(){return{objectStore(){return{get(key){assert.equal(key,'fixture-history');read={result:snapshot};return read;}};}};}};
  const ws={status:new Map(),dbP:Promise.resolve(db),key:()=> 'fixture-history',_apply(...args){applied=args;},_next(){throw Error('cached history must not generate');}};
  const pending=WorldSims.prototype.request.call(ws,3);await Promise.resolve();
  assert.equal(ws.status.get(3),'queued');read.onsuccess();await pending;
  assert.deepEqual(applied,[3,snapshot,true]);
});
test('leaving a world while its cache read is pending cannot apply or generate it',async()=>{
  let read;
  const db={transaction(){return{objectStore(){return{get(){read={result:null};return read;}};}};}};
  const ws={status:new Map(),dbP:Promise.resolve(db),key:()=> 'fixture-history',_apply(){throw Error('disposed history applied');},_next(){throw Error('disposed worker started');}};
  const pending=WorldSims.prototype.request.call(ws,3);await Promise.resolve();ws.disposed=true;read.onsuccess();await pending;
});
function berthed() {
  const f=orbitalFlight('yacht'),g=f.game,c=f.addShip('carrier');
  f.orbit(c);g.carrier=c;g.yacht=g.ship=f.ship;g.audio={clunk(){}};
  for (const k of ['berth','berthYacht','launchCraft']) g[k]=Game.prototype[k];
  g.berthYacht();return {...f,host:c};
}
test('nav launches Neptune from its ventral berth through the existing launch controller',()=>{
  const {game:g,ship:s,host}=berthed();
  assert.equal(s.zone.kind,'berth');
  assert.equal(s.nav.order({kind:'park'}),true);
  assert.doesNotThrow(()=>s.nav.update(1/120));
  assert.equal(s.auto.move,true);
  g.stepChild(s,1/120);
  assert.equal(s.parent,null);assert.equal(s.attached,false);
  const local=host.bodyToLocal(s.pos,V());
  assert.ok(local.y < host.type.layout.yacht.dock.pos[1]-8);
  assert.ok(s.vel.toArray().every(Number.isFinite));
});
test('cargo holds are not offered as autonomous flight bays',()=>{
  const {ship:s}=orbitalFlight('yacht');
  assert.equal(s.nav.fitsBay({kind:'hold',min:[-100,-100,-100],max:[100,100,100]}),false);
  assert.equal(s.nav.fitsBay({kind:'pad'}),true);
});
test('both V views clear the carrier while berthed and return to Neptune after launch',()=>{
  const {game:g,ship:s,host}=berthed();
  const p=new Player(g);g.players=[p];p.ownShip=s;p.body=s.body;p.mode='seat';p.vessel=s;s.pilot=p;
  Object.defineProperties(g,{player:{get:()=>p},piloted:{get:()=>s},camMode:{get:()=>p.camMode},camPos:{get:()=>p.camPos},camQuat:{get:()=>p.camQuat},chaseQuat:{get:()=>p.chaseQuat}});
  for (const mode of ['chase','landing']) {
    p.camMode=mode;Game.prototype.updateCamera.call(g,1/60);
    assert.ok(p.camPos.distanceTo(host.getWorldPos(V())) > host.type.radius,mode);
  }
  g.launchCraft(s);p.camMode='chase';Game.prototype.updateCamera.call(g,1/60);
  const d=p.camPos.distanceTo(s.getWorldPos(V()));assert.ok(d>s.type.radius && d<s.type.radius*3);
});
test('swept EVA suit stops at thin hulls and slides along them without tunnelling',()=>{
  const wall={min:[0,-10,-10],max:[.05,10,10]};
  const hit=sweepSuit(V(-10,2,0),V(10,2,3),V(0,1,0),[wall]);
  assert.ok(hit.pos.x<-.3);assert.ok(Math.abs(hit.pos.z-3)<1e-6);
  assert.ok(hit.normals.length);
  const away=sweepSuit(hit.pos,hit.pos.clone().add(V(-2,0,0)),V(0,1,0),[wall]);
  assert.equal(away.normals.length,0);
});
test('EVA collides with a rotated, moving hull in its own frame',()=>{
  const {game:g,ship:s}=orbitalFlight('yacht');frozen(s);
  s.quat.setFromAxisAngle(V(0,1,0),Math.PI/3);s.vel.set(900,20,400);
  s.type={...s.type,inner:null}; // This fixture replaces the entire hull with one moving wall.
  s.colliders=()=>[{min:[0,-10,-10],max:[.05,10,10]}];
  const p=new Player(g);p.body=s.body;p.mode='eva';p.evaQuat.copy(s.quat);
  p.ePos.copy(V(2,2,0).applyQuaternion(s.quat).add(s.pos));
  p.eVel.copy(V(40,0,3).applyQuaternion(s.quat).add(s.vel));
  collideEva(p,.1);
  assert.ok(s.bodyToLocal(p.ePos,V()).x<-.3);
  const rel=p.eVel.clone().sub(s.vel).applyQuaternion(s.quat.clone().invert());
  assert.ok(Math.abs(rel.x)<1e-6);assert.ok(Math.abs(rel.z-3)<1e-6);
});
function frozen(s){s.pos.set(1e6,0,0);s.angVel.set(0,0,0);}
test('EVA respects a swung door and an open doorway',()=>{
  const door={min:[-3,0,-.05],max:[3,5,.05],hinge:[0,0],angle:Math.PI/2};
  const hit=sweepSuit(V(0,4,2),V(0,-4,2),V(0,1,0),[door]);
  assert.ok(hit.normals.some(n=>n.y>.99));
  const opening=[{min:[-4,-4,-.05],max:[-1,4,.05]},{min:[1,-4,-.05],max:[4,4,.05]}];
  assert.equal(sweepSuit(V(0,2,-2),V(0,2,2),V(0,1,0),opening).normals.length,0);
});
test('Neptune garage accepts EVA through its open ramp while its closed door and side hull stop suits',()=>{
  const {ship:s}=orbitalFlight('yacht');
  const sweep=(x=0)=>sweepSuit(V(x,.8,30),V(x,.8,22),V(0,1,0),evaColliders(s));
  assert.ok(sweep().pos.z>25);
  s.doors.ramp.open=1;assert.equal(sweep().pos.z,22);assert.equal(sweep(2.5).pos.z,22);
  assert.ok(sweep(4).pos.z>25);
});
test('an EVA astronaut floating into Neptune’s open garage joins the walking frame',()=>{
  const {game:g,ship:s}=orbitalFlight('yacht');s.interior=makeInterior(s);s.doors.ramp.open=1;
  s.pos.set(1030000,0,0);s.vel.set(0,0,0);s.body.GM=0;
  const p=new Player(g);p.mode='eva';p.body=s.body;p.ePos.copy(s.pos).add(V(2.5,.8,30));p.eVel.set(0,0,-4);
  const input={axis:()=>0,down:()=>false,hit:()=>false};
  for(let i=0;i<200&&p.mode==='eva';i++)p.updateEva(.01,input,{dx:0,dy:0});
  assert.equal(p.mode,'ship');assert.equal(p.vessel===s,true);assert.ok(p.sPos.z<25.05);
});
