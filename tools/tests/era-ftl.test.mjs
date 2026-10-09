import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { FTL } from '../../src/sim/ftl.js';
import { VESSEL_TYPES } from '../../src/sim/vesselTypes.js';
import { PIONEER_TYPES } from '../../src/sim/layouts/pioneer.data.js';
import { EXPEDITION_TYPES } from '../../src/sim/layouts/expedition.data.js';

const capitals=['pioneer_caravan','pioneer_anchor','expedition_longreach','expedition_crosscurrent'];
function drive(type) {
  const game={universe:{bodies:[]},vessels:[],aboardOf:()=>[],setWarp:()=>{}};
  const ship={type,big:type.big,pos:new THREE.Vector3(1e8,0,0),vel:new THREE.Vector3(),quat:new THREE.Quaternion(),
    ctrl:{fwd:0},body:{GM:1e12,data:{name:'Test primary'}},targetVel:new THREE.Vector3(),angVel:new THREE.Vector3(),
    getWorldPos(out){return out.copy(this.pos);},checkSOI(){}};
  return new FTL(game,ship);
}

test('early carriers and tenders match later capitals through spool, cruise and cooldown',()=>{
  const reference=drive(VESSEL_TYPES.carrier);
  const drives=[...capitals,'horizon_meridian','horizon_confluence'].map(key=>drive(VESSEL_TYPES[key]));
  for(const f of [reference,...drives]) {
    f.toggle();assert.equal(f.state,'spool');assert.equal(f.timer,reference.spoolTime);
    f.update(reference.spoolTime);assert.equal(f.state,'cruise');
    for(let i=0;i<20;i++)f.update(.5);
  }
  for(const f of drives){
    assert.equal(f.vmax,reference.vmax,f.ship.type.key);
    assert.equal(f.speed,reference.speed,f.ship.type.key);
    assert.deepEqual(f.ship.pos.toArray(),reference.ship.pos.toArray(),f.ship.type.key);
  }
  for(const f of [reference,...drives]){
    f.toggle();assert.equal(f.state,'cooldown');assert.equal(f.timer,reference.coolTime);
    f.update(reference.coolTime);assert.equal(f.state,'idle');
  }
});

test('early small craft remain unable to engage FTL',()=>{
  for(const t of Object.values({...PIONEER_TYPES,...EXPEDITION_TYPES}).filter(t=>!capitals.includes(t.key))){
    const f=drive(t);f.toggle();f.update(60);assert.equal(f.state,'idle',t.key);
    assert.equal(f.speed,0,t.key);
  }
});
