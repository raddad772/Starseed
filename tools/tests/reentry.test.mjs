import test from 'node:test';
import assert from 'node:assert/strict';
import {ENTRY_TIERS,entryTier,hullEnvelope,gasProperties,entryGeometry,stagnationHeat,integrateHullTemperature,radiatedFlux,heatSafeSpeed} from '../../src/sim/reentry.js';
const air=gasProperties({mu:28.97,comp:{N2:0.78,O2:0.21,Ar:0.01}}),body={size:[16,6,30],aero:{}};
const near=(a,b,relative=1e-6)=>assert.ok(Math.abs(a-b)<=Math.max(1e-8,Math.abs(b)*relative),`${a} != ${b}`);

test('stagnation heating scales with density, velocity and windward curvature',()=>{
 const q=stagnationHeat(.01,7000,1.6,air);
 near(stagnationHeat(.04,7000,1.6,air),q*2);
 near(stagnationHeat(.01,14000,1.6,air),q*8);
 near(stagnationHeat(.01,7000,6.4,air),q/2);
 assert.equal(stagnationHeat(0,7000,1.6,air),0);
 assert.equal(stagnationHeat(1,0,1.6,air),0);
 assert.ok(stagnationHeat(1e-15,7000,1.6,air)<=.5e-15*7000**3);
});
test('windward geometry follows hull dimensions and entry attitude',()=>{
 const nose=entryGeometry(body,{x:0,y:0,z:-1}),belly=entryGeometry(body,{x:0,y:-1,z:0});
 near(nose.radius,1.6);near(belly.radius,40);near(nose.projectedArea,Math.PI*24);near(belly.projectedArea,Math.PI*120);
 near(entryGeometry({size:[32,12,60]},{x:0,y:0,z:-1}).radius,nose.radius*2);
 assert.deepEqual(hullEnvelope({bounds:[[-2,-1,-8],[4,3,10]]}).center,[1,1,1]);
});
test('gas temperature response and hot-wall correction respect available energy',()=>{
 assert.ok(air.gamma>1.39&&air.gamma<1.41);
 const hydrogen=gasProperties({mu:2.016,comp:{H2:1}});assert.ok(hydrogen.cp>air.cp*10);
 assert.equal(stagnationHeat(1,100,1,air,290,1000),0);
 assert.ok(stagnationHeat(.001,7000,1,air,250,1600)<stagnationHeat(.001,7000,1,air,250,250));
});
test('radiative thermal balance converges and never overshoots at high warp',()=>{
 const p=ENTRY_TIERS.pioneer,q=300000,eq=(290**4+q/(p.emissivity*5.670374419e-8))**.25;
 let t=290;for(let i=0;i<300;i++)t=integrateHullTemperature(t,290,q,p,1);
 near(t,eq,.015);assert.ok(integrateHullTemperature(290,290,q,p,10000)<=eq);
 assert.ok(integrateHullTemperature(2200,3,0,p,10000)>=3);
 near(radiatedFlux(290,290,p),0);
});
test('thermal response is stable across physics step sizes',()=>{
 const run=dt=>{let t=290;for(let i=0;i<Math.round(20/dt);i++)t=integrateHullTemperature(t,250,600000,ENTRY_TIERS.pioneer,dt,.001);return t;};
 near(run(1/60),run(1/120),.001);
});
test('era protection increases forgiving entry envelope without removing heat damage',()=>{
 const profiles=['pioneer','expedition','horizon'].map(key=>entryTier({key:key+'_test'}));
 const limits=profiles.map(p=>heatSafeSpeed(.002,1.6,air,p));assert.ok(limits[0]<limits[1]&&limits[1]<limits[2]);
 const temperatures=profiles.map(p=>integrateHullTemperature(1600,250,600000,p,10));assert.ok(temperatures[0]>temperatures[1]&&temperatures[1]>temperatures[2]);
 assert.ok(profiles.every(p=>Number.isFinite(p.limit)&&p.damageRate>0));
});

import * as THREE from 'three';
import { Ship } from '../../src/sim/ship.js';
test('flight, vacuum and shelter clear aerodynamic heat and advance thermal time once',()=>{
 const game={t:0,universe:{bodies:[]}},ship=new Ship(game);
 ship.body={R:1e6,GM:1e12,atmHeight:100000,atm:{mu:28.97,comp:{N2:.78,O2:.22}},data:{name:'Fixture',Tsurf:290},omega:new THREE.Vector3(),q:new THREE.Quaternion(),qInv:new THREE.Quaternion(),relief:0,
  atmosphereAt:()=>({density:.001,pressure:.001,temperature:250})};
 ship.pos.set(0,1060000,0);ship.vel.set(0,0,-7000);
 const F=new THREE.Vector3(),T=new THREE.Vector3();ship.aero(60000,F,T);assert.ok(ship.heatFlux>100000&&F.z>0);
 game.t=.1;ship.environment(.1);assert.ok(ship.hullTemp>290&&ship.heatGlow>0);const hot=ship.hullTemp;
 ship.aero(150000,F,T);assert.equal(ship.heatFlux,0);assert.equal(ship.env.mach,0);
 game.t=.2;ship.environment(.1);assert.ok(ship.hullTemp<hot);
 ship.zone={pressure:1};game.t=.3;ship.zoneEnv();const sheltered=ship.hullTemp;ship.zoneEnv();ship.environment(.1);near(ship.hullTemp,sheltered);
 ship.heatFlux=123456;ship.pos.y=1200000;game.t=.4;ship.coastEnv();assert.equal(ship.heatFlux,0);assert.equal(ship.env.density,0);assert.equal(ship.env.mach,0);
});
