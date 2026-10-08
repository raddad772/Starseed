import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { generateUnderstructure,DECK } from '../../src/understructure/layout.js';
import { buildScene } from '../../src/understructure/scene.js';
import { UnderstructureSimulation } from '../../src/understructure/simulation.js';
import { descend,walkLine,walkRoute,flyTo,climbCollection,descendCollection,walkOblique,solvePuzzles,retrieveSiteRecord } from './understructure-walk.js';
import { chooseSuitVoice,SuitVoice,noticeDuration } from '../../src/understructure/suitVoice.js';
import { compassReading } from '../../src/understructure/compass.js';
import { manifestationReading } from '../../src/understructure/phenomena.js';
// Rendering is tested in the native fixture. CPU scene construction only needs
// a canvas sink for glyphs; collision consumes real, unchanged mesh positions.
globalThis.document={createElement:()=>({getContext:()=>new Proxy({},{get:()=>()=>{}})})};
const plan=generateUnderstructure('SUMP-07','gravity-light'),visual=buildScene(plan);
const make=()=>{const s=new UnderstructureSimulation(plan);s.collision.setGeometry(visual.collider);return s;};
test('actual architectural geometry allows entry, ascent routes and chamber access',()=>{
 const s=make();descend(s);walkLine(s,0,-20);walkRoute(s,0,-150);climbCollection(s);descendCollection(s);walkRoute(s,76,-52);walkLine(s,76,-52);solvePuzzles(s);retrieveSiteRecord(s);assert.ok(s.dataRecovered);
});
test('zero-g top equipment and ceiling block the player capsule using drawn triangles',()=>{
 const s=make();assert.equal(s.collision.canFloat(95.7,DECK+18,-63),false,'Pump riser');assert.equal(s.collision.canFloat(104,DECK+8.5,-52),false,'Level ring');assert.equal(s.collision.canFloat(94,plan.chambers[0].ceiling-1,-52),false);assert.ok(s.collision.canFloat(96,DECK+10,-52));assert.ok(visual.collider.count>10000);
});
test('hand light range and fixed fixtures reveal space without moving fixture selection',()=>{
 assert.equal(visual.flashlight.distance,120);assert.ok(visual.lights.length>100);const positions=visual.lights.map(l=>l.position.clone());const s=make(),camera=new THREE.PerspectiveCamera(73,1,.08,3200);s.pos=[0,DECK,-42];camera.position.set(0,DECK+1.68,-42);camera.updateMatrixWorld();visual.update(camera,0,0,s);camera.rotation.y=Math.PI;camera.updateMatrixWorld();visual.update(camera,0,0,s);assert.ok(visual.lights.every((l,i)=>l.position.equals(positions[i])));assert.ok(visual.lights.filter(l=>l.visible).length>3);assert.ok(visual.waymarks.colonies>100);assert.equal(visual.wonder.stats.motes,360);
});
test('compass bearing rotates with heading and vertical objective displacement survives',()=>{
 const s=make();s.pos=[0,DECK,-42];const a=compassReading(s);s.yaw=Math.PI/2;const b=compassReading(s);assert.ok(Math.abs(Math.atan2(Math.sin(a.angle-b.angle),Math.cos(a.angle-b.angle))-Math.PI/2)<1e-6);s.pos=[96,DECK,-52];assert.equal(compassReading(s).vertical,12);
});
test('female voice preference, non-overlap, mute and persistent readable instructions',()=>{
 const female={name:'Samantha',lang:'en-US'},male={name:'Alex',lang:'en-US',default:true};assert.equal(chooseSuitVoice([male,female]),female);
 const spoken=[],synth={getVoices:()=>[male,female],speak:u=>{spoken.push(u);u.onstart();},cancel:()=>{}};const v=new SuitVoice({synth,Utterance:class{constructor(text){this.text=text;}},storage:null});v.unlock();v.active=true;v.speak('Jetpack disabled.','pack');v.speak('Data found.','data');assert.equal(spoken.length,1);spoken[0].onend();assert.equal(spoken.length,2);assert.equal(spoken[0].voice,female);v.setEnabled(false);assert.equal(v.current,null);assert.equal(v.queue.length,0);
 const s=make();s.pos=[...plan.puzzles.find(p=>p.id==='gravity').source];s.interact();assert.match(s.noticeLog.at(-1),/Cell acquired/);assert.deepEqual(new UnderstructureSimulation(plan,s.save()).noticeLog,s.noticeLog);assert.ok(noticeDuration('A '.repeat(40))>14000);
});

test('doorway cuts preserve corridor side walls all the way to the neighboring room',()=>{
 const ray=new THREE.Raycaster();visual.scene.updateMatrixWorld(true);
 for(const c of plan.chambers)for(const dz of [-1,1]){
  ray.set(new THREE.Vector3(c.door[0]+c.doorSide,DECK+1.6,c.door[1]),new THREE.Vector3(0,0,dz));
  const hits=ray.intersectObjects(visual.scene.children,true).filter(h=>!h.object.material.transparent);
  assert.ok(hits.length&&hits[0].distance<2.21,c.id+' side wall missing');
 }
});
test('all six mechanisms remain reachable with rendered geometry collision enabled',()=>{
 for(const theme of ['time-space','pressure-resonance']){
  const p=generateUnderstructure('SUMP-07',theme),v=buildScene(p),s=new UnderstructureSimulation(p);s.collision.setGeometry(v.collider);descend(s);solvePuzzles(s);retrieveSiteRecord(s);assert.ok(s.exitReady,theme);
 }
});

test('quiet manifestations vary by site, occur outside zero-g, and fade without flashes',()=>{
 const a=generateUnderstructure('SUMP-07','gravity-light'),b=generateUnderstructure('SUMP-07','gravity-light'),c=generateUnderstructure('A','gravity-light');
 assert.deepEqual(a.manifestations,b.manifestations);assert.notDeepEqual(a.manifestations,c.manifestations);
 const s=new UnderstructureSimulation(a),before=s.save();
 for(const m of a.manifestations){
  assert.ok(a.service.rooms.some(r=>r.id===m.id));assert.ok(!a.chambers.some(r=>r.id===m.id));
  let prev=manifestationReading(m,0).strength;
  for(let time=1/60;time<m.period*2;time+=1/60){const v=manifestationReading(m,time).strength;assert.ok(v>=0&&v<=1);assert.ok(Math.abs(v-prev)<.004);prev=v;}
 }
 assert.deepEqual(s.save(),before);
});

test('ordinary dust is lit, bounded, and anchored to the world when the viewer moves',()=>{
 const camera=new THREE.PerspectiveCamera(),dust=visual.dust,pose=new THREE.Matrix4();camera.position.set(0,DECK+1.68,-26);dust.update(camera,10);
 assert.equal(dust.mesh.count,500);assert.equal(dust.mesh.material.emissive.getHex(),0);assert.equal(dust.mesh.material.depthWrite,false);
 dust.mesh.getMatrixAt(260,pose);const before=new THREE.Vector3().setFromMatrixPosition(pose);camera.position.x+=.1;dust.update(camera,10);dust.mesh.getMatrixAt(260,pose);assert.ok(before.distanceTo(new THREE.Vector3().setFromMatrixPosition(pose))<1e-7);
 assert.ok(Array.from(dust.mesh.instanceMatrix.array).every(Number.isFinite));camera.position.y=1;dust.update(camera,10);assert.equal(dust.mesh.visible,false);
});
