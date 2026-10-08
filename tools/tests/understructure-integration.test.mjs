import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { accessFrame, surveySaveKey } from '../../src/understructure/integration.js';

test('surface access stays tangent and returns with a rotating, translating body',()=>{
 const body={R:10000,groundHeight:()=>12};
 const position=new THREE.Vector3(1,2,3).normalize().multiplyScalar(10012),heading=new THREE.Vector3(-2,1,0).normalize();
 const frame=accessFrame(body,position,heading),up=position.clone().normalize();
 assert.ok(Math.abs(frame.position.length()-10012.06)<1e-9);
 assert.ok(new THREE.Vector3(0,1,0).applyQuaternion(frame.rotation).distanceTo(up)<1e-12);
 assert.ok(new THREE.Vector3(0,0,-1).applyQuaternion(frame.rotation).dot(heading)>.999);
 const q=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),.8),origin=new THREE.Vector3(1e10,2e10,-1e10);
 const world=frame.position.clone().applyQuaternion(q).add(origin);
 assert.ok(world.clone().sub(origin).applyQuaternion(q.clone().invert()).distanceTo(frame.position)<1e-5);
 assert.ok(position.distanceTo(up.clone().multiplyScalar(10012))<1e-10,'anchor input must remain unchanged');
});
test('saved survey progress is isolated by system, body, site and theme profile',()=>{
 const dir=new THREE.Vector3(1,2,3).normalize(),base=surveySaveKey('SOL',2,dir);
 assert.equal(base,surveySaveKey('SOL',2,dir.clone()));
 for(const different of [surveySaveKey('OTHER',2,dir),surveySaveKey('SOL',3,dir),surveySaveKey('SOL',2,new THREE.Vector3(0,1,0)),surveySaveKey('SOL',2,dir,'gravity')])assert.notEqual(base,different);
});
