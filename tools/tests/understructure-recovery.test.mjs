import test from 'node:test';
import assert from 'node:assert/strict';
import { generateUnderstructure,DECK,makeCollision } from '../../src/understructure/layout.js';
import { UnderstructureSimulation } from '../../src/understructure/simulation.js';
import { creditedData,recordRecovery,mysteryProgress,mysteryEntries } from '../../src/understructure/recovery.js';
import { routeFloor } from '../../src/understructure/infrastructure.js';
import { scanMessage } from '../../src/understructure/guidance.js';
import { descend,walkRoute,walkLine,advance,climbCollection,descendCollection,solvePuzzles } from './understructure-walk.js';
const make=(seed='DECAY')=>new UnderstructureSimulation(generateUnderstructure(seed,'gravity-light'));

test('per-site excess credits triple, caps at 170, never duplicates and unlocks cumulative 200/500 leads',()=>{
 assert.equal(creditedData(90),90);assert.equal(creditedData(100),100);assert.equal(creditedData(101),103);assert.equal(creditedData(110),130);assert.equal(creditedData(125),170);assert.equal(creditedData(10000),170);
 let r=recordRecovery({},'one',110);assert.equal(r.total,130);assert.equal(r.stage,0);r=recordRecovery(r.ledger,'one',110);assert.equal(r.gained,0);r=recordRecovery(r.ledger,'one',90);assert.equal(r.total,130);r=recordRecovery(r.ledger,'two',90);assert.equal(r.total,220,'Other sites below 100 do not get a triple multiplier');assert.equal(r.stage,1);assert.ok(r.newLead);assert.equal(r.next,500);
 r=recordRecovery(r.ledger,'three',125);assert.equal(r.total,390);r=recordRecovery(r.ledger,'four',110);assert.equal(r.total,520);assert.equal(r.stage,2);assert.ok(r.newLead);assert.equal(mysteryEntries(r.total).length,2);assert.equal(mysteryProgress(200).next,500);
 const early=recordRecovery(recordRecovery({},'x',25).ledger,'x',115),late=recordRecovery(recordRecovery({},'x',90).ledger,'x',115);assert.equal(early.total,late.total,'Collection order must not alter rewards');
});
test('entry scan automatically awards one unit once and plays its readable sequence',()=>{
 const s=make();descend(s);walkLine(s,0,-12);assert.ok(s.fragments.has('entry-signal'));assert.equal(s.rawData,1);assert.match(scanMessage(s),/SCANNING|GOLDEN PATH/);s.time=s.scanAt+2;assert.match(scanMessage(s),/GOLDEN PATH DATA FOUND/);s.time=s.scanAt+4;assert.match(scanMessage(s),/PROCESSING/);s.time=s.scanAt+6;assert.match(scanMessage(s),/Find more/);
 const saved=new UnderstructureSimulation(s.plan,s.save());descend(saved);walkLine(saved,0,-12);assert.equal(saved.rawData,1);assert.equal(scanMessage(saved),'');
});
test('utility loop, blind rooms and solid machinery remain traversable without mandatory rewards',()=>{
 for(const seed of ['DECAY','SUMP-07','SITE-93']){const s=make(seed);descend(s);const before=s.solved.size;
  for(const [x,z] of [[-40,20],[-16,20],[16,20],[40,20],[40,44],[-56,40]])walkRoute(s,x,z);
  assert.equal(s.solved.size,before);assert.ok(s.plan.utility.annex.some(id=>{const room=s.plan.rooms[id];return !s.plan.fragments.some(f=>Math.abs(f.pos[0]-room.x*4)<room.rx*4+2&&Math.abs(f.pos[2]-room.z*4)<room.rz*4+2);}));
  for(const o of s.plan.utility.equipment){const [a,b,c,d,y]=o.bounds;assert.equal(s.collision.canStand((a+b)/2,(c+d)/2,{...s.state,y},.42),false);}
 }
});
test('same collection volume is crossed at three heights, returns by walking, and final cache alone grants 90',()=>{
 const s=make();descend(s);solvePuzzles(s);const heights=[];climbCollection(s,(r)=>{if(!r.covered)heights.push(s.pos[1]);});assert.deepEqual(heights,[DECK+12,DECK+26,DECK+42]);walkLine(s,56,-268);const before=s.rawData;s.interact();assert.equal(s.rawData-before,90);assert.ok(s.exitReady);assert.ok(s.rawData<100,'Extraction must not require finding all fragments');const once=s.rawData;s.interact();assert.equal(s.rawData,once);descendCollection(s);assert.equal(s.pos[1],DECK);walkRoute(s,0,-12);
});
test('all fragments have accessible supports and enough optional data to reach the site cap',()=>{
 const p=generateUnderstructure('DATA','pressure-resonance'),c=makeCollision(p);assert.ok(p.fragments.reduce((n,f)=>n+f.value,90)>=124);
 for(const f of p.fragments)assert.ok(c.canStand(f.pos[0],f.pos[2],{y:f.pos[1],liftY:DECK,hatchOpen:true},.42),f.id);
 assert.equal(creditedData(90+p.fragments.reduce((n,f)=>n+f.value,0)),170);
});

test('normal exploration can recover every fragment, reach 170 credit, and persist without duplication',()=>{
 const s=make('SUMP-07');descend(s);solvePuzzles(s);
 for(const f of s.plan.fragments.filter(f=>!f.automatic&&f.pos[1]===DECK)){walkRoute(s,f.pos[0],f.pos[2]);assert.equal(s.offer()?.id,f.id);s.interact();}
 walkRoute(s,-60,-204);walkLine(s,-62,-204);
 for(const r of s.plan.routes){const dx=r.b[0]-r.a[0],dz=r.b[2]-r.a[2];const fragments=s.plan.fragments.filter(f=>!s.fragments.has(f.id)&&f.pos[1]>DECK&&routeFloor(r,f.pos[0],f.pos[2])===f.pos[1]).sort((a,b)=>(a.pos[0]-b.pos[0])*dx+(a.pos[2]-b.pos[2])*dz);for(const f of fragments){walkLine(s,f.pos[0],f.pos[2]);assert.equal(s.offer()?.id,f.id);s.interact();}walkLine(s,r.b[0],r.b[2]);}
 walkLine(s,56,-268);s.interact();assert.equal(s.fragments.size,s.plan.fragments.length);assert.equal(s.rawData,125);assert.equal(s.dataCredit,170);
 const restored=new UnderstructureSimulation(s.plan,s.save());assert.equal(restored.rawData,125);assert.equal(restored.dataCredit,170);assert.ok(restored.exitReady);
 const bank=recordRecovery({},'site',s.rawData);assert.equal(recordRecovery(bank.ledger,'site',restored.rawData).gained,0);
});
