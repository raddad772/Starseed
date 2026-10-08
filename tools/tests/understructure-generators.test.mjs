import test from 'node:test';
import assert from 'node:assert/strict';
import { generateUnderstructure,DECK } from '../../src/understructure/layout.js';
import { generatorCycle,surveyEnvironment } from '../../src/understructure/generatorHall.js';
import { UnderstructureSimulation } from '../../src/understructure/simulation.js';
import { surveyMapData } from '../../src/understructure/surveyMap.js';
import { descend,climbCollection,descendCollection,walkLine } from './understructure-walk.js';
import * as THREE from 'three';
import { buildGeneratorHall } from '../../src/understructure/generatorVisual.js';

test('seeded survivor covers all six positions, all wounds and preserves existing circuits and data',()=>{
  const living=new Set(),wounds=new Set();
  for(let i=0;i<100;i++){
    const p=generateUnderstructure('CORE-'+i,'gravity-light'),h=p.generator;
    assert.deepEqual(h,generateUnderstructure(p.seed,'gravity-light').generator);living.add(h.active);wounds.add(h.wound);
    assert.equal(h.cores.filter(c=>c.active).length,1);
    assert.equal(h.cores[h.active].id,h.active);
    const barren=generateUnderstructure(p.seed,'gravity-light',surveyEnvironment({}));
    assert.equal(barren.generator.environment.life,false);assert.equal(barren.generator.environment.wet,false);assert.notEqual(barren.generator.wound,'aquifer');
    assert.deepEqual(p.tiles,barren.tiles);assert.deepEqual(p.puzzles,barren.puzzles);assert.deepEqual(p.fragments,barren.fragments);
    assert.equal(p.fragments.reduce((n,f)=>n+f.value,90),125);
  }
  assert.equal(living.size,6);assert.equal(wounds.size,3);
  assert.deepEqual(surveyEnvironment({life:{vegColor:[.2,.4,.1]},hydrosphere:{water:'liquid'}}),{life:true,wet:true,vegetation:[.2,.4,.1]});
});
test('generator envelope is continuous, deterministic, bounded and slow even across cycle boundaries',()=>{
  const h=generateUnderstructure('SUMP-07').generator;let last=generatorCycle(h,-50),min=1,max=0;
  for(let i=-5000;i<5000;i++){
    const time=i/100,p=generatorCycle(h,time);assert.deepEqual(p,generatorCycle(h,time));
    assert.ok(p.power>=.16&&p.power<=1);assert.ok(p.sag>=.68&&p.sag<=1);assert.ok(Math.abs(p.power-last.power)<.01);last=p;
    min=Math.min(min,p.power);max=Math.max(max,p.power);
  }
  assert.ok(max-min>.8);
});
test('optional lookout is reachable and returnable through ordinary walking; discoveries survive reload',()=>{
  const s=new UnderstructureSimulation(generateUnderstructure('SUMP-07','pressure-resonance'));
  assert.ok(!surveyMapData(s.plan,s).boxes.some(b=>b.id==='fault-lookout'));
  descend(s);climbCollection(s);walkLine(s,0,-268);walkLine(s,0,-330);
  assert.equal(s.pos[1],DECK+42);assert.equal(s.offer()?.id,'rupture');s.interact();
  assert.ok(s.recorded.has('rupture'));assert.ok(s.lookoutSeen);assert.ok(surveyMapData(s.plan,s,'raised').boxes.some(b=>b.id==='fault-lookout'));
  const restored=new UnderstructureSimulation(s.plan,s.save());assert.ok(restored.lookoutSeen);assert.ok(restored.recorded.has('rupture'));
  assert.equal(s.collision.canStand(10,-330,s.state,.42),false,'Balcony edge must be closed');
  assert.equal(s.collision.canStand(3,-308,s.state,.42),false,'Bridge edge must be closed');
  walkLine(s,0,-268);descendCollection(s);assert.equal(s.pos[1],DECK);assert.equal(s.solved.size,0,'Lookout should not require or solve circuits');
});

test('rendered reactor towers, damaged walls and rock leave capsule headroom along every crossing and the lookout bridge',()=>{
  for(const seed of ['SUMP-07','HALL-6','HALL-8']){
    const plan=generateUnderstructure(seed),root=new THREE.Group(),scene=new THREE.Scene(),mat={},surfaces=[];
    const probeMaterial=new THREE.MeshBasicMaterial({side:THREE.DoubleSide});
    const addGeometry=g=>{g.computeBoundingBox();const mesh=new THREE.Mesh(g,probeMaterial);mesh.updateMatrixWorld();surfaces.push(mesh);};
    const box=(x,y,z,w,h,d)=>{const g=new THREE.BoxGeometry(w,h,d);g.translate(x,y,z);addGeometry(g);};
    const cylinder=(a,b,r,m,n=8)=>{const delta=new THREE.Vector3(...b).sub(new THREE.Vector3(...a)),g=new THREE.CylinderGeometry(r,r,delta.length(),n);g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize()));g.translate(...a.map((x,i)=>(x+b[i])/2));addGeometry(g);};
    buildGeneratorHall(plan,{root,scene,mat,box,cylinder,label:()=>{},addGeometry});
    const segments=[...plan.routes.filter(r=>!r.covered),plan.generator.spur,{a:[-58,DECK,-204],b:[58,DECK,-204]},{a:[0,DECK,-128],b:[0,DECK,-280]}];
    const ray=new THREE.Raycaster(new THREE.Vector3(),new THREE.Vector3(0,1,0),0,1.7);
    for(const {a,b} of segments){const n=Math.ceil(Math.hypot(...a.map((v,i)=>v-b[i])));for(let i=0;i<=n;i++)for(const offset of [-.35,0,.35]){
      const p=a.map((v,k)=>v+(b[k]-v)*i/n);p[a[0]===b[0]?0:2]+=offset;ray.ray.origin.set(p[0],p[1]+.2,p[2]);
      const candidates=surfaces.filter(m=>{const b=m.geometry.boundingBox;return p[0]>=b.min.x&&p[0]<=b.max.x&&p[2]>=b.min.z&&p[2]<=b.max.z&&b.max.y>p[1]+.2&&b.min.y<p[1]+1.9;});
      assert.equal(ray.intersectObjects(candidates,false).length,0,`${seed}: visible obstruction at ${p}`);
    }}
    for(const m of surfaces)m.geometry.dispose();probeMaterial.dispose();root.traverse(o=>o.geometry?.dispose());for(const m of Object.values(mat))m.dispose();
  }
});
