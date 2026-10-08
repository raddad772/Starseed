import test from 'node:test';
import assert from 'node:assert/strict';
import { generateUnderstructure,DECK } from '../../src/understructure/layout.js';
import { UnderstructureSimulation } from '../../src/understructure/simulation.js';
import { suitAlert,surveyObjective } from '../../src/understructure/guidance.js';
import { surveyMapData } from '../../src/understructure/surveyMap.js';
import { insidePolygon,intersectPolygon } from '../../src/understructure/oblique.js';
import { advance,enterBunker,descend,walkLine } from './understructure-walk.js';
const make=()=>new UnderstructureSimulation(generateUnderstructure('SUMP-07','gravity-light'));
test('ordinary rooms allow ballistic jumping and retain horizontal momentum on release',()=>{
 const s=make();descend(s);walkLine(s,0,-42);s.yaw=0;s.step(.1,{forward:1,fast:true});const before=[...s.pos];s.step(.15,{forward:1,fast:true,vertical:1});const takeoff=[...s.pos];advance(s,.2,{});
 assert.ok(s.pos[1]>before[1]+.5);assert.ok(s.pos[2]<takeoff[2]-.9,'Releasing movement must preserve airborne travel');assert.ok(Math.abs(s.velocity[2])>5);
 advance(s,1.3);assert.equal(s.pos[1],DECK);assert.ok(s.grounded);assert.equal(s.velocity[1],0);
});
test('bunker entry disables the pack, alerts, supports jumping and keeps the ceiling solid',()=>{
 const s=make();enterBunker(s);assert.ok(s.inBunker);assert.equal(suitAlert(s),'Jetpack disabled.');walkLine(s,0,4);let high=-Infinity;
 for(let i=0;i<100;i++){s.step(.01,{vertical:1});high=Math.max(high,s.pos[1]);assert.ok(s.pos[1]+1.9<=-.38+.001);}assert.ok(high>-3.2+.5);assert.equal(s.pos[1],-3.2);
});
test('gravity transition alerts describe entry and planetary restoration, once per transition',()=>{
 const s=make();s.pos=[84,DECK,-100];s.step(.01);assert.equal(suitAlert(s),'Warning: reduced gravity detected.');const at=s.gravityAlertAt;advance(s,.4);assert.equal(s.gravityAlertAt,at);walkLine(s,76,-100);assert.equal(suitAlert(s),'Regular planetary body gravity restored.');advance(s,5);assert.equal(suitAlert(s),'');
 s.pos=[82,DECK,-52];s.step(.01);assert.equal(suitAlert(s),'Warning: zero gravity detected.');
});
test('the socket explains its separate source room without offering local flight controls',()=>{
 const s=make(),p=s.plan.puzzles.find(p=>p.id==='gravity');s.pos=[...p.socket];const text=s.interact();assert.match(text,/separate zero-gravity pump well/);assert.doesNotMatch(text,/Space|above/);assert.match(surveyObjective(s),/Find the zero-gravity pump well first/);
});
test('entering a chamber records its complete outline and no tile cubes or unseen rooms',()=>{
 const s=make();descend(s);walkLine(s,0,-42);const data=surveyMapData(s.plan,s,'service'),room=s.plan.service.rooms.find(r=>r.id==='intake-hall');
 const shown=data.boxes.find(b=>b.id===room.id);assert.deepEqual(shown.polygon,room.polygon);assert.ok(!data.boxes.some(b=>b.kind==='tile'));assert.ok(!data.boxes.some(b=>b.id==='filter-store'));assert.deepEqual(new UnderstructureSimulation(s.plan,s.save()).serviceSeen,s.serviceSeen);
});
test('service chamber floors have no coincident faces and include nonorthogonal connections',()=>{
 const p=make().plan;const area=p=>Math.abs(p.reduce((a,v,i)=>{const q=p[(i+1)%p.length];return a+v[0]*q[1]-v[1]*q[0];},0))/2;
 assert.ok(p.service.links.filter(l=>l.a[0]!==l.b[0]&&l.a[1]!==l.b[1]).length>=6);
 const f=p.service.floors;for(let i=0;i<f.length;i++)for(let j=i+1;j<f.length;j++)assert.ok(area(intersectPolygon(f[i].polygon,f[j].polygon))<.001);
 assert.ok(p.service.rooms.some(r=>r.polygon.length===5));assert.ok(p.service.rooms.some(r=>r.polygon.length===6));
});
