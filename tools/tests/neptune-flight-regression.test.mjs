import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { Game } from '../../src/game.js';
import { Player } from '../../src/sim/player.js';
import { sweepSuit, collideEva } from '../../src/sim/evaContacts.js';
import { orbitalFlight } from '../orbital-flight-fixture.js';

const V=(...p)=>new THREE.Vector3(...p);
test('orbital startup never waits for a planetary simulation or landing survey',()=>{
  let spawned=false,applied=null;
  const g={opts:{startChoice:'orbit:3'},startBody:{id:3},spawnFleet(){spawned=true;},applyStart(key){applied=key;},startSim(){throw Error('should not simulate before orbital placement');},requestSurvey(){throw Error('should not survey before orbital placement');}};
  Game.prototype.begin.call(g);
  assert.equal(spawned,true);assert.equal(g.placed,true);assert.equal(applied,'orbit:3');assert.equal(g.startDir,null);
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
