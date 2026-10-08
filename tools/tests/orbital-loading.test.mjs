import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { orbitalReadiness } from '../../src/sim/arrival.js';
import { Game } from '../../src/game.js';

function fixture() {
  const bodies = [0, 1, 2].map((id) => ({id, R:100, atmHeight:0, solid:true, pos:new THREE.Vector3(id===2?1e8:id*20000,0,0),data:{name:['Home','Moon','Distant'][id],terrain:{}}}));
  const items=bodies.map(body=>({body,terrain:{frame:1,visibleList:[{}],pendingCount:0}}));
  const requests=[],status=new Map([[0,'ready'],[1,'ready'],[2,'running']]);
  const g={engine:{height:1000,camera:{fov:60}},players:[{camPos:new THREE.Vector3(200,0,0),currentBody:()=>bodies[0]}],
    world:{items,terrainOf:id=>items[id].terrain},worldSims:{status,phase:new Map(),request:id=>requests.push(id)}};
  return {g,bodies,items,status,requests};
}
test('arrival waits for nearby planet and moon histories, not distant background worlds',()=>{
  const {g,status,requests}=fixture();status.set(1,'queued');
  const waiting=orbitalReadiness(g);assert.equal(waiting.pending,1);assert.match(waiting.history,/Moon/);assert.deepEqual(requests,[0,1]);
  status.set(1,'ready');assert.equal(orbitalReadiness(g).pending,0);
});
test('orbital chunks count even beyond 3 km and a rebuilt world must render before readiness',()=>{
  const {g,items}=fixture();items[1].terrain.pendingCount=4;items[1].terrain.pendingNear=0;
  assert.equal(orbitalReadiness(g).pending,4);
  items[1].terrain={frame:0,visibleList:[],pendingCount:0};assert.equal(orbitalReadiness(g).unmeasured,true);
});
test('the mirror opening does not wait for enclosed planets it hides',()=>{
  const {g,bodies,requests}=fixture();g.mirrorShell={body:{pos:new THREE.Vector3()},radius:1e9};g.players[0].camPos.set(2e9,0,0);
  assert.equal(orbitalReadiness(g).pending,0);assert.deepEqual(requests,[]);
});
test('orbital loading cannot time out while nearby chunks or history have not finished',()=>{
  const {g,items,status}=fixture();let displayed;
  Object.assign(g,{state:'loading',loadMode:'space',loadTimer:99,settleTime:0,loadPeak:0,respawnInfo:{},player:g.players[0],
    universe:{update(){}},t:0,screenHud:{setLoading(text){displayed=text;}},arrive(){}});
  items[0].terrain.pendingCount=1;
  Game.prototype.updateLoading.call(g,1);assert.equal(g.state,'loading');assert.match(displayed,/nearby planets/);
  items[0].terrain.pendingCount=0;status.set(1,'failed');
  Game.prototype.updateLoading.call(g,1);assert.equal(g.state,'loading');assert.match(displayed,/Could not prepare Moon/);
  status.set(1,'ready');Game.prototype.updateLoading.call(g,.2);assert.equal(g.state,'loading');
  Game.prototype.updateLoading.call(g,.3);assert.equal(g.state,'playing');assert.equal(displayed,null);
});
