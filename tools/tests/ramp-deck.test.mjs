import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { deckBelow, restHeight, VESSEL_TYPES } from '../../src/sim/vesselTypes.js';
import { Game } from '../../src/game.js';
import { Ship } from '../../src/sim/ship.js';

const ramp = angle => ({min:[-5,0,25],max:[5,4.8,25.14],hinge:[0,25],angle});
test('hover pads find the deployed ramp surface throughout its slope',()=>{
  const angle=2.15,r=ramp(angle);
  for(const along of [.1,1,2,3,4.7]){
    const z=25+along*Math.sin(angle),y=along*Math.cos(angle);
    assert(Math.abs(deckBelow([r],{x:0,y:y+.7,z},6)-y)<1e-8);
  }
});
test('ramp height queries respect footprint, reach and the surface above the probe',()=>{
  const r=ramp(2.15),p={x:0,y:1,z:27};
  assert.equal(deckBelow([r],{...p,x:6}),-Infinity);
  assert.equal(deckBelow([r],{...p,z:31}),-Infinity);
  assert.equal(deckBelow([r],{...p,y:-5}),-Infinity);
  assert.equal(deckBelow([r],p,.1),-Infinity);
  assert.equal(deckBelow([ramp(0)],{x:0,y:1,z:27}),-Infinity);
});
test('horizontal ramp and ordinary decks retain their top surfaces',()=>{
  assert(Math.abs(deckBelow([ramp(Math.PI/2)],{x:0,y:1,z:27}))<1e-8);
  assert.equal(deckBelow([{min:[-3,-.2,0],max:[3,0,4]}],{x:0,y:1,z:2}),0);
});

test('landing placement starts just above terrain below the reference radius',()=>{
  const elevation=-120,b={R:35000,groundHeight:()=>elevation,floorAt:()=>elevation,
    q:new THREE.Quaternion(),qInv:new THREE.Quaternion(),omega:new THREE.Vector3()};
  let placedHeight;
  const g={t:0,universe:{update(){}},world:{terrainOf:()=>null},
    stepVessel(s){
      placedHeight=s.pos.length()-b.R;s.landed=true;
      s.landedPosF.copy(s.pos);s.landedQuatF.copy(s.quat);
    }};
  const s=new Ship(g,VESSEL_TYPES.horizon_neptune3);
  // Keep this regression about placement, without atmosphere or terrain streaming.
  s.syncLanded=()=>{};
  Game.prototype.landShipAt.call(g,b,new THREE.Vector3(0,1,0),null,s);
  assert(Math.abs(placedHeight-(elevation+restHeight(s.type,s.mass)))<1e-6);
});

test('garage speed limits apply to hosted driving while surface speed stays unchanged',()=>{
  const s=new Ship({universe:{}},VESSEL_TYPES.runabout);
  s.zone={groundSpeedLimit:3};s.ctrl.fwd=1;s.lvel.set(0,0,-3);s.legState.fill(1);
  s.body={omega:new THREE.Vector3()};s.vel.set(0,0,-3);
  const force=new THREE.Vector3(),torque=new THREE.Vector3();
  s.groundControl(1/120,force,torque,true);assert(Math.abs(force.z)<1e-8);
  s.groundControl(1/120,force,torque,false);assert(force.z<0);
});
