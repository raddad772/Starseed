import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { orbitalFlight,testBody } from '../orbital-flight-fixture.js';
import { stationFlight } from '../station-flight-fixture.js';
import { makeOrbit } from '../../src/core/kepler.js';
import { bodyState,planetaryWindow } from '../../src/sim/orbitalRoutes.js';
import { maneuverAuthority } from '../../src/sim/orbitalFlight.js';
const generations=['pioneer_nomad','expedition_hearth','horizon_neptune3'];
function run(f,frames=180000,maxCoast=30,until=()=>!f.ship.nav.active){
 const phases=new Set();let maxHeat=0,coasts=0;
 for(let i=0;i<frames&&!until()&&!f.ship.dead;i++){
  f.coastStep(maxCoast);phases.add(f.ship.nav.status()?.phase);maxHeat=Math.max(maxHeat,f.ship.hullTemp);
  if(f.ship.auto?.coast)coasts++;
  assert.ok(Number.isFinite(f.ship.pos.length()),'finite physical state');
 }
 assert.equal(f.ship.dead,false,f.ship.deathCause);assert.ok(until(),f.ship.nav.status()?.phase+' '+f.game.messages.join('; '));
 assert.equal(f.ship.hull,1);return {phases,maxHeat,coasts};
}
function earth(){const b=testBody({R:6.371e6,GM:3.986e14,atm:{},atmHeight:100000});b.omega.y=7.292115e-5;return b;}
for(const key of generations){
 test(`${key}: curved atmospheric ascent reaches a lasting, unpowered orbit`,()=>{
  const f=orbitalFlight(key,[earth()]);f.surface();const start=f.ship.pos.clone().normalize();f.ship.nav.order({kind:'park'});
  const {phases,maxHeat}=run(f,120000,30);
  assert.ok(phases.has('Gravity turn'));assert.ok(phases.has('Circularizing'));
  const o=f.ship.orbit();assert.ok(o.bound&&o.rp>f.ship.body.R+f.ship.body.atmHeight);assert.ok(o.e<.002);
  assert.ok(start.angleTo(f.ship.pos.clone().normalize())>.1,'launch builds substantial downrange motion');
  assert.ok(maxHeat<f.ship.entryProfile.limit);assert.equal(f.ship.assist,1,'completion must not re-enable gravity-cancelling velocity hold');
  f.game.advanceVessels(200);assert.ok(f.ship.orbit().rp>f.ship.body.R+f.ship.body.atmHeight);
 });
 test(`${key}: timed deorbit and shallow entry land at a rotating surface site`,()=>{
  const f=orbitalFlight(key,[earth()]);f.orbit(f.ship,130000);
  f.ship.nav.setTravelMode('conventional');f.ship.nav.order({kind:'site',body:f.ship.body,dirF:new THREE.Vector3(Math.cos(1),0,-Math.sin(1)),label:'test site'});
  const result=run(f,180000,30);
  assert.ok(result.phases.has('Waiting for launch window'));assert.ok(result.phases.has('Departure burn'));assert.ok(result.coasts>0);
  assert.ok(f.ship.landed);assert.ok(f.ship.nav.hopDistance()<20);assert.ok(result.maxHeat<f.ship.entryProfile.limit);
 });
}
for(const key of ['pioneer_nomad','expedition_hearth'])test(`${key}: transfer intercepts an orbiting target and matches its velocity`,()=>{
 const f=orbitalFlight(key);f.orbit();const host=f.addShip('orbital_station');f.orbit(host,100000,1.5);host.enterRails();
 f.ship.nav.setTravelMode('conventional');f.ship.nav.order({kind:'meet',v:host});
 const result=run(f,100000,120,()=>f.ship.nav.phase==='station');
 assert.ok(result.coasts>0);assert.ok(f.ship.pos.distanceTo(host.pos)>host.type.radius);
 assert.ok(f.ship.vel.distanceTo(host.vel)<2.1);
});
for(const key of ['pioneer_nomad','expedition_hearth'])test(`${key}: final docking respects weak reverse and side thrusters`,()=>{
 const f=stationFlight(key);f.ship.nav.order({kind:'dock',v:f.host});
 for(let i=0;i<500*120&&!f.ship.attached&&!f.ship.dead;i++)f.step();
 assert.ok(f.ship.attached,f.ship.deathCause||f.ship.nav.phase);assert.equal(f.ship.hull,1);
});
function system(){
 const star=testBody({R:1e7,GM:1e17,isStar:true,solid:false,data:{name:'Sun'}});
 const origin=testBody({parent:star,soi:6e7,data:{name:'Origin',orbit:makeOrbit({a:6e9,e:.01,i:0,Om:0,w:0,M0:0},star.GM)}});
 const destination=testBody({R:8e5,GM:5e11,parent:star,soi:8e7,data:{name:'Destination',orbit:makeOrbit({a:9e9,e:.02,i:0,Om:0,w:0,M0:1.8},star.GM)}});
 star.children=[origin,destination];return {star,origin,destination};
}
test('planetary window samples immutable future ephemerides and budgets escape and capture',()=>{
 const {star,origin,destination}=system(),before=[origin,destination].map(b=>b.pos.toArray());
 const route=planetaryWindow(origin,destination,0,10,b=>b.R+30000);
 assert.ok(route.departure>86400);assert.ok(route.deltaV>0&&route.burnSeconds>0&&route.arrival>route.departure);
 assert.deepEqual([origin,destination].map(b=>b.pos.toArray()),before);
 const p=bodyState(destination,route.arrival,star);assert.ok(Math.hypot(...p.pos)>destination.data.orbit.a*.9);
});
test('conventional interplanetary flight escapes, coasts on the shared ephemeris, and captures',()=>{
 const {star,origin,destination}=system(),f=orbitalFlight('expedition_hearth',[star,origin,destination]);f.ship.body=origin;f.orbit();
 f.ship.nav.setTravelMode('conventional');assert.ok(f.ship.nav.order({kind:'orbit',body:destination}));
 const result=run(f,100000,10000);
 assert.equal(f.ship.body,destination);assert.ok(result.phases.has('Waiting for planetary window'));assert.ok(result.phases.has('Coasting to capture'));
 assert.ok(f.ship.orbit().bound&&f.ship.orbit().rp>destination.R);assert.equal(f.ship.ftl.state,'idle');assert.ok(f.game.t>86400);
});
test('burn commands honor carried mass and engine limits; inadequate loaded lift is rejected',()=>{
 const f=orbitalFlight();f.orbit();const s=f.ship,free=maneuverAuthority(s).acceleration;
 s.effMass=s.mass*3;assert.ok(Math.abs(maneuverAuthority(s).acceleration-free/3)<1e-9);
 s.auto={thrust:new THREE.Vector3(1e9,-1e9,1e9)};s.assist=2;
 const F=new THREE.Vector3(),T=new THREE.Vector3();s.computeControl(.01,F,T);
 assert.ok(Math.abs(F.x)<=s.limits.lateral&&F.y>=-s.limits.down&&F.y<=s.limits.belly&&F.z>=-s.limits.main&&F.z<=s.limits.retro);
 const heavy=orbitalFlight('pioneer_nomad',[earth()]);heavy.surface();heavy.ship.effMass=heavy.ship.mass*3;
 assert.equal(heavy.ship.nav.order({kind:'park'}),false);assert.match(heavy.game.messages.at(-1),/insufficient loaded thrust/);
});
test('changing parking altitude burns, coasts, then circularizes instead of flying radially',()=>{
 const f=orbitalFlight();f.orbit(f.ship,300000);f.ship.nav.order({kind:'park'});
 const result=run(f,80000,60);assert.ok(result.coasts>0);assert.ok(result.phases.has('Transfer coast'));
 assert.ok(Math.abs(f.ship.altitude-30000)<1000);assert.ok(f.ship.orbit().e<.01);
});
test('terrain broad-phase padding is not reported as a phantom landing surface',()=>{
 const f=orbitalFlight('horizon_neptune3');f.surface();f.ship.pos.set(f.ship.body.R+240,0,0);
 f.ship.contacts(.01,new THREE.Vector3(),new THREE.Vector3());assert.ok(f.ship.agl>180);
});
test('an inclined moon encounter coasts safely through its SOI and captures with real thrust',()=>{
 const planet=testBody({data:{name:'Planet'}}),moon=testBody({R:120000,GM:1e10,parent:planet,soi:1500000,data:{name:'Moon',orbit:makeOrbit({a:18000000,e:.02,i:.1,Om:.2,w:0,M0:.8},planet.GM)}});
 planet.children=[moon];const f=orbitalFlight('pioneer_nomad',[planet,moon]);f.orbit();f.ship.nav.setTravelMode('conventional');f.ship.nav.order({kind:'orbit',body:moon});
 const result=run(f,100000,1000);assert.equal(f.ship.body,moon);assert.ok(result.phases.has('Coasting to capture'));
 assert.ok(f.ship.orbit().bound&&f.ship.orbit().rp>moon.R+2000);
});
