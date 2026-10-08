import test from 'node:test';
import assert from 'node:assert/strict';
import { generateUnderstructure,DECK } from '../../src/understructure/layout.js';
import { surfacePixels } from '../../src/understructure/decay.js';
import { roomAcoustics,soundField,FootstepTracker,noiseSamples } from '../../src/understructure/acoustics.js';
import { buildDecayDetails } from '../../src/understructure/decayVisual.js';
import { surveyEnvironment } from '../../src/understructure/generatorHall.js';
const state=(pos,extra={})=>({pos,yaw:0,time:0,moving:false,grounded:true,...extra});

test('weathering is seeded, materially varied and supplies finite linear normals/roughness',()=>{
  const a=surfacePixels('A','concrete'),b=surfacePixels('A','concrete'),c=surfacePixels('B','concrete');
  assert.deepEqual(a,b);assert.notDeepEqual(a.color,c.color);assert.notDeepEqual(a.color,surfacePixels('A','metal').color);
  const shades=new Set();for(let i=0;i<a.color.length;i+=4){shades.add(a.color[i]);const n=Array.from(a.normal.slice(i,i+3),v=>v/255*2-1);assert.ok(Math.abs(Math.hypot(...n)-1)<.02);assert.equal(a.color[i+3],255);assert.ok(a.roughness[i+1]>180);}
  assert.ok(shades.size>70,'Must have macroscopic wear and cracks, not a flat tint');
});

test('room dimensions control echo, while floor surfaces distinguish bridges from concrete',()=>{
  const p=generateUnderstructure('SUMP-07');
  const corridor=roomAcoustics(p,state([0,DECK,-12])),hall=roomAcoustics(p,state([0,DECK,-160]));
  assert.ok(hall.decay>corridor.decay*3);assert.ok(hall.delay>corridor.delay);assert.equal(corridor.material,'concrete');
  const well=p.oblique.rooms.find(r=>r.inner);assert.equal(roomAcoustics(p,state([well.center[0],DECK,well.center[1]])).material,'metal');
  assert.equal(roomAcoustics(p,state([0,0,12])).wet,0);
  const route=p.routes.find(r=>!r.covered);const mid=route.a.map((v,i)=>(v+route.b[i])/2);assert.equal(roomAcoustics(p,state(mid)).material,'metal');
});

test('footsteps require supported travel and never accumulate teleport/floating/pause steps',()=>{
  const f=new FootstepTracker();assert.equal(f.update(state([0,DECK,0])),false);
  assert.equal(f.update(state([0,DECK,1])),false);assert.equal(f.update(state([0,DECK,1.6])),true);
  assert.equal(f.update(state([0,DECK,1.6])),false);assert.equal(f.update(state([30,DECK,1.6])),false);
  for(let i=0;i<5;i++)assert.equal(f.update(state([30+i,DECK,1.6],{zeroG:true})),false);
  assert.equal(f.update(state([35,DECK,1.6],{grounded:false})),false);assert.equal(f.update(state([36,DECK,1.6]),false),false);
});

test('ambient water follows wet world/valve; generator sound follows the surviving core',()=>{
  const p=generateUnderstructure('A'),dry=generateUnderstructure('A','auto',surveyEnvironment({}));
  assert.ok(soundField(p,state([0,DECK+42,-307])).water>0);assert.equal(soundField(dry,state([0,DECK+42,-307])).water,0);
  assert.equal(soundField(p,state([-96,DECK,-28],{chamber:{id:'upfall'},flowPaused:true})).water,0);
  const live=p.generator.cores[p.generator.active],near=soundField(p,state([live.x,DECK,live.z])),far=soundField(p,state([0,DECK,-20]));assert.ok(near.generator>far.generator*8);
  assert.equal(soundField(p,state([0,0,12])).rumble,0);
  const noise=noiseSamples('A',48000),other=noiseSamples('B',48000);assert.deepEqual(noise,noiseSamples('A',48000));assert.notDeepEqual(noise,other);assert.ok(noise.every(v=>Number.isFinite(v)&&Math.abs(v)<1));
});

test('structural decay is deterministic, bounded and wet runoff is absent on dry planets',()=>{
  const build=p=>{const vertices=[];const stats=buildDecayDetails(p,{addGeometry(g){assert.ok(Array.from(g.attributes.position.array).every(Number.isFinite));vertices.push(...g.attributes.position.array);g.dispose();}});return {stats,vertices};};
  const a=build(generateUnderstructure('A')),b=build(generateUnderstructure('A'));assert.deepEqual(a,b);assert.ok(a.stats.bands>60&&a.stats.streaks>35&&a.stats.flakes>60);assert.ok(a.vertices.length<500000);
  assert.equal(build(generateUnderstructure('A','auto',surveyEnvironment({}))).stats.streaks,0);
});
