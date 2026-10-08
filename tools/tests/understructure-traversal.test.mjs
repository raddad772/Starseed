import test from 'node:test';
import assert from 'node:assert/strict';
import {generateUnderstructure,DECK,makeCollision} from '../../src/understructure/layout.js';
import {routeFloor} from '../../src/understructure/infrastructure.js';
import {surveyMapData} from '../../src/understructure/surveyMap.js';
import {UnderstructureSimulation} from '../../src/understructure/simulation.js';
import {descend,solveGravityRoute} from './understructure-walk.js';

test('guided vertical loop revisits one machinery volume only after two different spaces',()=>{
 for(const seed of ['SUMP-07','SITE-93','SIDEWAYS']){
  const p=generateUnderstructure(seed,'gravity-light'),g=p.traversal;
  assert.equal(p.service.rooms.length,4);const visits=g.visits.filter(v=>v.volume==='intake-hall');assert.equal(visits.length,2);
  const a=g.visits.indexOf(visits[0]),b=g.visits.indexOf(visits[1]);assert.deepEqual(g.visits.slice(a+1,b).map(v=>v.volume),['null','low']);assert.ok(visits[1].height-visits[0].height>16);
  const s=new UnderstructureSimulation(p);descend(s);solveGravityRoute(s);assert.equal(s.recoveries,0);assert.ok(s.chambersSeen.has('null')&&s.chambersSeen.has('low')&&s.chambersSeen.has('return-shaft'));assert.equal(s.pos[1],DECK);assert.ok(s.solved.has('gravity'));
 }
});
test('settled passage climbs and rolls continuously back to flat doorway thresholds',()=>{
 const p=generateUnderstructure('SUMP-07','gravity'),r=p.traversal.highRoutes.find(r=>r.bank),c=makeCollision(p),x=r.a[0],z=(r.a[2]+r.b[2])/2;
 assert.ok(r.b[1]>r.a[1]);const left=routeFloor(r,x-1,z),right=routeFloor(r,x+1,z);assert.ok(Math.abs(left-right)>.1);assert.equal(c.ceilingAt(x,left,z),routeFloor(r,x,z)+3.5);
 for(const endpoint of [r.a,r.b])assert.ok(Math.abs(routeFloor(r,x+1,endpoint[2])-routeFloor(r,x-1,endpoint[2]))<1e-8);
 for(let i=1;i<35;i++){const t=i/36,zz=r.a[2]+(r.b[2]-r.a[2])*t,h=routeFloor(r,x+.8,zz);assert.ok(c.canStand(x+.8,zz,{y:h},.42));}
});
test('the transit field blocks the inaccessible shaft and recovered data disappears from the map',()=>{
 const p=generateUnderstructure('SUMP-07','gravity'),s=new UnderstructureSimulation(p),x=p.traversal.returnX;
 assert.equal(s.collision.canFloat(x,DECK-.01,-99),false);assert.equal(s.collision.canFloat(x,DECK+4,-99),true);
 const f=p.fragments.find(f=>!f.automatic);s.fragmentsSeen.add(f.id);assert.ok(surveyMapData(p,s).markers.some(m=>m.pos===f.pos));s.fragments.add(f.id);assert.ok(!surveyMapData(p,s).markers.some(m=>m.pos===f.pos));
});
