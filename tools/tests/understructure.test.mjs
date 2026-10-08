import test from 'node:test';
import assert from 'node:assert/strict';
import { generateUnderstructure,makeCollision,key,DECK,LIFT_SECONDS,ACCESS } from '../../src/understructure/layout.js';
import { UnderstructureSimulation } from '../../src/understructure/simulation.js';
import { THEME_PROFILES,machineryClock } from '../../src/understructure/anomalies.js';
import { walkLine,walkRoute,flyTo,advance,descend,enterBunker,ascendSurface,solvePuzzles,retrieveSiteRecord,climbCollection,descendCollection } from './understructure-walk.js';
function connected(plan){const cells=new Set(plan.tiles.map(t=>key(t.x,t.z))),seen=new Set(['0,0']),queue=[[0,0]];for(let i=0;i<queue.length;i++){const [x,z]=queue[i];for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const k=key(x+dx,z+dz);if(cells.has(k)&&!seen.has(k)){seen.add(k);queue.push([x+dx,z+dz]);}}}return seen;}
const make=(seed='SUMP-07',theme='auto')=>new UnderstructureSimulation(generateUnderstructure(seed,theme));

test('100 deterministic sites: polygon chambers, accessible signals and one/two themes',()=>{
 assert.deepEqual(generateUnderstructure('A'),generateUnderstructure('A'));
 assert.notDeepEqual(generateUnderstructure('A').service.rooms,generateUnderstructure('B').service.rooms);
 for(let i=0;i<100;i++){const p=generateUnderstructure(`SITE-${i}`);assert.ok(p.service.rooms.every(r=>r.polygon.length>=5));assert.ok(p.themes.length>=1&&p.themes.length<=2);assert.equal(p.puzzles.length,p.themes.length);const c=makeCollision(p);for(const s of p.samples)assert.ok(s.id==='null'&&p.themes.includes('gravity')?c.canFloat(...s.pos):c.canStand(s.pos[0],s.pos[2],{y:s.pos[1],liftY:DECK,hatchOpen:true},.42),s.id);assert.equal(c.canFloat(999,DECK,999),false);}
});
test('person-sized hatch and continuous express lift descend eight levels in 4.2 seconds',()=>{
 const s=make();assert.equal(s.plan.access.halfWidth*2,1.3);assert.equal(s.plan.access.halfDepth*2,1.7);
 enterBunker(s);assert.equal(s.pos[1],ACCESS.top);assert.ok(s.inBunker);assert.equal(s.jetpackEnabled,false);walkLine(s,0,0);assert.ok(s.onPlatform);s.interact();let prev=ACCESS.top;
 for(let i=0;i<252;i++){s.step(1/60,{forward:1});assert.ok(s.pos[1]<=prev+.001);assert.ok(Math.abs(s.pos[1]-prev)<1.5);assert.ok(Math.abs(s.pos[2])<.001);prev=s.pos[1];}
 advance(s,.1);assert.equal(s.pos[1],DECK);assert.equal(DECK,-240);assert.equal(s.offer().type,'offline');walkLine(s,0,-4);assert.equal(s.pos[1],DECK);
});
test('open hatch has no floor with lift away; walls and catwalk edges contain long frames',()=>{
 const s=make();s.hatchOpen=true;s.hatchAmount=1;s.liftY=s.liftTarget=DECK;s.pos=[0,0,ACCESS.hatchZ+3];advance(s,5,{forward:1});assert.ok(s.pos[2]>ACCESS.hatchZ+1.25);
 s.pos=[0,DECK,-8];for(let i=0;i<200;i++)s.step(.25,{strafe:1,fast:true});assert.ok(s.pos[0]<1.6);
 s.pos=[0,DECK,-150];advance(s,5,{strafe:1});assert.ok(s.pos[0]<1.6);assert.equal(s.pos[1],DECK);
 for(const {x,z,width,depth} of s.plan.pillars)for(const [x0,x1,z0,z1] of s.plan.walkways)assert.ok(x+width/2<=x0||x-width/2>=x1||z+depth/2<=z0||z-depth/2>=z1);
});
test('all 21 theme profiles: walk, solve generated circuits, retrieve data, return by lift',()=>{
 for(const profile of THEME_PROFILES)for(const seed of ['SUMP-07','SITE-93']){
  const s=make(seed,profile.join('-'));descend(s);assert.equal(s.teleport(),false);
  climbCollection(s);walkLine(s,56,-268);assert.equal(s.offer().type,'archive_data');s.interact();assert.equal(s.dataRecovered,false);descendCollection(s);
  solvePuzzles(s);assert.ok(s.archiveReady);assert.equal(s.exitReady,false);retrieveSiteRecord(s);assert.ok(s.exitReady);
  walkRoute(s,0,0);assert.equal(s.offer().type,'lift');s.interact();advance(s,LIFT_SECONDS+.1);ascendSurface(s);assert.ok(s.returned);
  const restored=new UnderstructureSimulation(s.plan,JSON.parse(JSON.stringify(s.save())));assert.deepEqual(restored.save(),s.save());assert.ok(restored.dataRecovered);
 }
});
test('retrieval enables optional instant surface return and continued exploration',()=>{
 const s=make('SHORTCUT','space');descend(s);solvePuzzles(s);assert.equal(s.teleport(),false);retrieveSiteRecord(s);assert.ok(s.teleport());assert.deepEqual(s.pos,s.plan.spawn);assert.ok(s.returned);assert.deepEqual(s.velocity,[0,0,0]);descend(s);assert.equal(s.pos[1],DECK);assert.ok(s.dataRecovered);
});
test('zero-g inertia, braking, shell and floating obstacles; safe floor-level exit',()=>{
 const s=make('FLIGHT','gravity');s.pos=[76,DECK,-52];s.hatchOpen=true;s.hatchAmount=1;s.liftY=s.liftTarget=DECK;
 walkLine(s,82,-52);assert.ok(s.zeroG);advance(s,1,{brake:true});advance(s,1,{vertical:1});const y=s.pos[1];advance(s,.8);assert.ok(s.pos[1]>y+1);advance(s,1,{brake:true});assert.ok(Math.hypot(...s.velocity)<.01);
 flyTo(s,s.plan.puzzles[0].source);assert.equal(s.offer().type,'cell');s.interact();assert.ok(s.carryingCell);
 flyTo(s,[79,DECK+12,-52]);s.yaw=Math.PI/2;advance(s,8,{forward:1});assert.ok(s.pos[0]>=78.4);assert.ok(s.zeroG);
 flyTo(s,[96,DECK+12,-52]);for(let i=0;i<80;i++)s.step(.25,{vertical:1,fast:true});assert.ok(s.pos[1]+1.9<=s.plan.chambers[0].ceiling+.001);
 const o=s.plan.chambers[0].obstacles[0];assert.equal(s.collision.canFloat(o.center[0],o.center[1]-1,o.center[2]),false);
 flyTo(s,[96,DECK+.05,-52]);flyTo(s,[82,DECK+.05,-52]);s.interact();assert.ok(s.carryingCell);flyTo(s,[77,DECK+.05,-52]);assert.equal(s.zeroG,false);assert.equal(s.pos[1],DECK);advance(s,.1);assert.deepEqual(s.velocity,[0,0,0]);
});
test('machinery time holds and reverses while player time and progress remain forward',()=>{
 assert.equal(machineryClock(6).state,'HELD');assert.equal(machineryClock(8).state,'REWIND');assert.equal(machineryClock(12).time,0);
 const s=make('TIME','time');s.pos=[...s.plan.puzzles[0].pos];s.time=5;advance(s,1);assert.equal(s.machinery.time,5);advance(s,2);assert.ok(s.machinery.time<5);assert.ok(s.time>7);
 while(s.phase.ready)s.step(.1);assert.equal(s.solved.size,0);s.interact();assert.equal(s.solved.size,0);
 while(!s.phase.ready)s.step(.02);s.interact();assert.ok(s.solved.has('time'));advance(s,14);assert.ok(s.solved.has('time'));
});
test('paired folds change position and orientation immediately, support return and avoid ping-pong',()=>{
 const s=make('FOLD','space'),p=s.plan.puzzles[0];s.pos=[-104,DECK,-108];s.yaw=0;
 advance(s,.8,{forward:1});assert.equal(s.foldCount,0);s.pos=[-104,DECK,-108];s.interact();
 for(let i=0;i<90&&s.foldCount===0;i++)s.step(1/60,{forward:1});assert.equal(s.foldCount,1);assert.ok(s.collision.canStand(s.pos[0],s.pos[2],s.state,.42));assert.ok(Math.abs(s.yaw-Math.PI/2)<.001);s.interact();assert.ok(s.solved.has('space'));advance(s,1.1);assert.equal(s.foldCount,1);
 s.yaw-=Math.PI;for(let i=0;i<90&&s.foldCount===1;i++)s.step(1/60,{forward:1});assert.equal(s.foldCount,2);assert.ok(Math.hypot(s.pos[0]-p.gates[0].pos[0],s.pos[2]-p.gates[0].pos[2])<2);
});
test('cistern dry rim, valve, optional notes and saved partial progress',()=>{
 const s=make('VALVE','gravity');s.pos=[-96,DECK,-28];advance(s,4,{forward:1});assert.ok(s.pos[2]>-29.3);
 s.pos=[...s.plan.samples.find(s=>s.id==='upfall').pos];s.interact();s.interact();const t=s.flowTime;advance(s,2);assert.equal(s.flowTime,t);s.interact();advance(s,1);assert.notEqual(s.flowTime,t);
 s.pos=[...s.plan.puzzles[0].source];s.interact();assert.ok(s.carryingCell);assert.ok(s.beacon());assert.equal(s.beacon(),false);
 const restored=new UnderstructureSimulation(s.plan,JSON.parse(JSON.stringify(s.save())));assert.ok(restored.carryingCell);assert.deepEqual(restored.save(),s.save());assert.deepEqual(restored.pos,s.plan.spawn);
 assert.doesNotThrow(()=>new UnderstructureSimulation(s.plan,{recorded:3,discovered:null,beacons:{}}));assert.equal(new UnderstructureSimulation(s.plan,{returned:true,recorded:['intake','archive','reservoir']}).returned,false);
});
test('megavault is a real kilometre-scale volume beneath the surface',()=>{const p=generateUnderstructure(),v=p.megavault;assert.ok(v.far-v.near>=1600);assert.ok(v.ceiling-v.bottom>=900);assert.ok(v.ceiling<0);assert.ok(v.ceiling>DECK&&v.bottom<DECK);});
