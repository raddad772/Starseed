import test from 'node:test';
import assert from 'node:assert/strict';
import { generateUnderstructure,DECK } from '../../src/understructure/layout.js';
import { UnderstructureSimulation } from '../../src/understructure/simulation.js';
import { surveyMapData } from '../../src/understructure/surveyMap.js';
import { insidePolygon,intersectPolygon } from '../../src/understructure/oblique.js';
import { descend,walkRoute,walkOblique } from './understructure-walk.js';
import * as THREE from 'three';
import { buildObliqueSector } from '../../src/understructure/obliqueVisual.js';
import { buildDataDrone } from '../../src/understructure/dataDrones.js';
const area=p=>Math.abs(p.reduce((s,a,i)=>{const b=p[(i+1)%p.length];return s+a[0]*b[1]-a[1]*b[0];},0))/2;

test('polygon wing forms a walkable return loop with no overlapping floor faces',()=>{
  for(const seed of ['SUMP-07','HALL-6','ODD-1','ODD-2','ODD-3','ODD-4']){
    const s=new UnderstructureSimulation(generateUnderstructure(seed,'pressure-resonance')),wing=s.plan.oblique;
    assert.deepEqual(wing.rooms.map(r=>r.sides),[3,5,6]);assert.ok(wing.links.every(l=>l.a[0]!==l.b[0]&&l.a[1]!==l.b[1]));
    for(let i=0;i<wing.floors.length;i++)for(let j=i+1;j<wing.floors.length;j++)assert.ok(area(intersectPolygon(wing.floors[i].polygon,wing.floors[j].polygon))<.001,seed+' has coincident floors');
    descend(s);walkRoute(s,-56,40);for(const id of ['wedge','hexwell','pentagon','wedge']){const room=wing.rooms.find(r=>r.id===id);walkOblique(s,...room.center);assert.equal(s.pos[1],DECK);assert.ok(s.sectorsSeen.has(id));}
    walkOblique(s,-56,40);walkRoute(s,0,-12);
    const saved=new UnderstructureSimulation(s.plan,s.save()),map=surveyMapData(s.plan,saved);assert.ok(map.boxes.some(b=>b.id==='hexwell'&&b.polygon.length===6));assert.ok(map.boxes.some(b=>b.id==='wedge'&&b.polygon.length===3));
    const well=wing.rooms.find(r=>r.inner),voidPoint=[well.center[0]+8,well.center[1]-8];assert.ok(insidePolygon(well.inner,...voidPoint));assert.equal(s.collision.floorAt(...voidPoint,{...s.state,y:DECK}),null);
  }
});
test('one-unit finds retain their rewards but belong to solid non-humanoid crawlers',()=>{
  const s=new UnderstructureSimulation(generateUnderstructure('SUMP-07'));descend(s);assert.equal(s.rawData,0);walkRoute(s,0,-12);assert.equal(s.rawData,1);
  for(const f of s.plan.fragments.filter(f=>f.value===1)){assert.match(f.title,/crawler/i);assert.equal(s.collision.canStand(f.pos[0]+1.25,f.pos[2]+1.35,{...s.state,y:f.pos[1]},.42),false);assert.ok(s.collision.canStand(f.pos[0],f.pos[2],{...s.state,y:f.pos[1]},.42));}
});

test('visible polygon walls and bridge rails leave headroom on the actual walking route',()=>{
  const s=new UnderstructureSimulation(generateUnderstructure('SUMP-07')),surfaces=[],material=new THREE.MeshBasicMaterial({side:THREE.DoubleSide});
  const addGeometry=g=>{g.computeBoundingBox();const mesh=new THREE.Mesh(g,material);mesh.updateMatrixWorld();surfaces.push(mesh);};
  const cylinder=(a,b,r,m,n=8)=>{const delta=new THREE.Vector3(...b).sub(new THREE.Vector3(...a)),g=new THREE.CylinderGeometry(r,r,delta.length(),n);g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize()));g.translate(...a.map((v,i)=>(v+b[i])/2));addGeometry(g);};
  buildObliqueSector(s.plan,{addGeometry,cylinder,pipe:(p,r)=>p.slice(1).forEach((b,i)=>cylinder(p[i],b,r)),box:()=>{},lamp:()=>{},label:()=>{}});
  descend(s);walkRoute(s,-56,40);const path=[];for(const r of s.plan.oblique.rooms)path.push(...walkOblique(s,...r.center));path.push(...walkOblique(s,-56,40));
  const ray=new THREE.Raycaster(new THREE.Vector3(),new THREE.Vector3(0,1,0),0,1.7);
  for(const [x,z] of path){ray.ray.origin.set(x,DECK+.2,z);const candidates=surfaces.filter(m=>{const b=m.geometry.boundingBox;return x>=b.min.x&&x<=b.max.x&&z>=b.min.z&&z<=b.max.z&&b.max.y>DECK+.2&&b.min.y<DECK+1.9;});assert.equal(ray.intersectObjects(candidates,false).length,0,`Rendered obstruction at ${x},${z}`);}
  for(const m of surfaces)m.geometry.dispose();material.dispose();
});

test('crawler motion is small and stops after its log is recovered',()=>{
  const root=new THREE.Group(),material=new THREE.MeshStandardMaterial(),mat=Object.fromEntries(['metal','rust','dark','amber','cyan'].map(k=>[k,material]));
  const f=generateUnderstructure('SUMP-07').fragments[0],drone=buildDataDrone(f,0,{root,mat});drone.update({time:1,fragments:new Set()});const a=drone.sensor.rotation.y;drone.update({time:2,fragments:new Set()});assert.notEqual(a,drone.sensor.rotation.y);assert.ok(Math.abs(drone.sensor.rotation.y)<.2);
  drone.update({time:5,fragments:new Set([f.id])});const done=drone.sensor.rotation.y;drone.update({time:10,fragments:new Set([f.id])});assert.equal(drone.sensor.rotation.y,done);root.traverse(o=>o.geometry?.dispose());material.dispose();
});
