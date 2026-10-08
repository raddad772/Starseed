import test from 'node:test';
import assert from 'node:assert/strict';
import {lambert,hohmann,stateAfter,clearArc,rendezvousWindow} from '../../src/core/transfers.js';
const norm=a=>Math.hypot(...a),dist=(a,b)=>norm(a.map((x,i)=>x-b[i]));
const mu=3.986004418e14,r=7e6,v=Math.sqrt(mu/r),period=2*Math.PI*Math.sqrt(r**3/mu);
test('Lambert reaches known circular and eccentric future states in both directions',()=>{
 for(const direction of [1,-1])for(const factor of [.72,1,1.12])for(const dt of [300,1200,2600]){
  const initial=[0,0,-v*factor*direction],target=stateAfter([r,0,0],initial,dt,mu);
  const sol=lambert([r,0,0],target.pos,dt,mu,{normal:[0,direction,0]});assert.ok(sol);
  const end=stateAfter([r,0,0],sol.v1,dt,mu);
  assert.ok(dist(end.pos,target.pos)<.1,'arrival error under 10 cm');assert.ok(dist(sol.v1,initial)<.001);
 }
});
test('Hohmann ellipse arrives at the opposite apsis with the predicted burn budget',()=>{
 for(const r2 of [8e6,4.2164e7,6.9e6]){
  const h=hohmann(r,r2,mu),end=stateAfter([r,0,0],[0,0,-(v+h.departure)],h.seconds,mu);
  assert.ok(Math.abs(norm(end.pos)-r2)<.01);assert.ok(end.pos[0]<0);
  assert.ok(Math.abs(norm(end.vel)+h.arrival-Math.sqrt(mu/r2))<1e-7);
 }
});
test('window search predicts the moving target and rejects primary intersections',()=>{
 const r2=9e6,v2=Math.sqrt(mu/r2),target=t=>stateAfter([0,0,-r2],[v2,0,0],t,mu);
 const plan=rendezvousWindow({r:[r,0,0],v:[0,0,-v],mu,target,clearance:6.5e6,acceleration:12,samples:12});
 assert.ok(plan);const end=stateAfter(plan.r,plan.vDeparture,plan.seconds,mu);
 assert.ok(dist(end.pos,target(plan.arrival).pos)<.1);assert.ok(clearArc(plan.r,plan.vDeparture,plan.seconds,mu,6.5e6));
 assert.ok(plan.deltaV>0&&plan.burnSeconds<plan.seconds*.45);
 const opposite=lambert([r,0,0],[0,0,-r],50,mu);assert.ok(opposite);assert.equal(clearArc([r,0,0],opposite.v1,50,mu,6.5e6),false);
});
test('invalid and collinear Lambert requests fail without NaNs',()=>{
 assert.equal(lambert([r,0,0],[-r,0,0],period/2,mu),null);
 assert.equal(lambert([r,0,0],[0,0,-r],0,mu),null);
 assert.equal(lambert([r,0,0],[0,0,-r],1,-1),null);
});
