import test from 'node:test';
import assert from 'node:assert/strict';
import { generateUnderstructure,makeCollision,key,TILE,DECK } from '../../src/understructure/layout.js';
import { UnderstructureSimulation } from '../../src/understructure/simulation.js';

function connected(plan){const cells=new Set(plan.tiles.map(t=>key(t.x,t.z))),seen=new Set(['0,0']),queue=[[0,0]];for(let i=0;i<queue.length;i++){const [x,z]=queue[i];for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const k=key(x+dx,z+dz);if(cells.has(k)&&!seen.has(k)){seen.add(k);queue.push([x+dx,z+dz]);}}}return seen;}
function advance(s,secs,input={}){for(let t=0;t<secs;t+=1/60)s.step(Math.min(1/60,secs-t),input);}

test('seeded layouts are repeatable and branch differently',()=>{
 assert.deepEqual(generateUnderstructure('A'),generateUnderstructure('A'));
 assert.notDeepEqual(generateUnderstructure('A').edges,generateUnderstructure('B').edges);
});
test('100 seeds: every basement, signal and reservoir entrance is connected',()=>{
 for(let i=0;i<100;i++){const p=generateUnderstructure(`SITE-${i}`),seen=connected(p);assert.equal(seen.size,p.tiles.length);for(const r of p.rooms)assert.ok(seen.has(key(r.x,r.z)));assert.ok(seen.has('0,-30'));const c=makeCollision(p);for(const s of p.samples)assert.ok(c.canStand(s.pos[0],s.pos[2],{y:DECK,liftY:DECK,hatchOpen:true},.42),s.id);}
});
test('walk from surface onto lift, descend continuously, exit and return',()=>{
 const s=new UnderstructureSimulation(generateUnderstructure());advance(s,2.9,{forward:1});assert.equal(s.offer().type,'hatch');s.interact();advance(s,1.5);advance(s,.8,{forward:1});assert.ok(s.onPlatform);s.interact();let prev=s.pos[1];for(let i=0;i<480;i++){s.step(1/60,{forward:1});assert.ok(s.pos[1]<=prev+.001);assert.ok(Math.abs(s.pos[1]-prev)<=3.5/60+.001);assert.ok(Math.abs(s.pos[2])<1.55);prev=s.pos[1];}advance(s,1);assert.equal(s.pos[1],DECK);
 advance(s,2,{forward:1});assert.ok(s.pos[2]<-4);advance(s,2,{forward:-1});assert.ok(s.onPlatform);s.interact();advance(s,9);assert.equal(s.pos[1],0);advance(s,2,{forward:-1});assert.ok(s.pos[2]>4);
});
test('hatch opening is impassable when the lift is away; walls resist long-frame movement',()=>{
 const p=generateUnderstructure(),s=new UnderstructureSimulation(p);s.hatchOpen=true;s.hatchAmount=1;s.liftY=DECK;s.liftTarget=DECK;s.pos=[0,0,3];advance(s,5,{forward:1});assert.ok(s.pos[2]>2.3);
 s.pos=[0,DECK,-8];for(let i=0;i<200;i++)s.step(.25,{strafe:1,fast:true});assert.ok(s.pos[0]<1.6);assert.equal(s.pos[1],DECK);
});
test('catwalks have continuous junctions and prevent walking into reservoir void',()=>{
 const p=generateUnderstructure(),s=new UnderstructureSimulation(p);s.hatchOpen=true;s.hatchAmount=1;s.liftY=DECK;s.liftTarget=DECK;s.pos=[0,DECK,-118];advance(s,49,{forward:1});assert.ok(s.pos[2]<-268);assert.equal(s.pos[1],DECK);assert.ok(s.reservoirSeen);
 s.pos=[0,DECK,-204];advance(s,10,{strafe:1});assert.ok(s.pos[0]>30);s.pos=[0,DECK,-150];advance(s,5,{strafe:1});assert.ok(s.pos[0]<1.6);
});
test('survey and beacons persist per site without inventing unvisited map data',()=>{
 const p=generateUnderstructure(),s=new UnderstructureSimulation(p);s.pos=[...p.samples[0].pos];s.step(.02);s.interact();assert.ok(s.recorded.has('intake'));assert.ok(s.beacon());assert.equal(s.beacon(),false);assert.ok(s.discovered.size<p.tiles.length);
 const restored=new UnderstructureSimulation(p,JSON.parse(JSON.stringify(s.save())));assert.deepEqual(restored.save(),s.save());assert.deepEqual(restored.pos,p.spawn);
});
