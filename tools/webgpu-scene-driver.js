// Runs inside the test iframe. Never load in a player's tab.
import * as THREE from 'three';
import { floraOf } from '../src/sim/floraField.js';
import * as tk from './testkit.js';
import * as S from './scenic.js';
import { capture, measure, measureCulling, measureReference } from './webgpu-compare.js';
const report = (data, image, name) => parent.postMessage({type:'webgpu-test',report:data,image,name},location.origin);
try {
  report({stage:'Preparing world and renderer'});
  await tk.ready();
  const gm=window.game; await gm.engine.webgpuReady; S.setup();
  const name=new URLSearchParams(location.search).get('testView')||'wood';
  report({stage:'Building scene'});
  const world=name==='rings'?{}:await S.waitWorld(3,400); if(world.timeout) throw new Error('Earth simulation timed out: '+JSON.stringify(world));
  const b=S.body(3), lat=(name==='gorge'?3.05651:18.66)*Math.PI/180,lon=(name==='gorge'?-39.70748:-59.63)*Math.PI/180;
  const up=new THREE.Vector3(Math.cos(lat)*Math.cos(lon),Math.sin(lat),Math.cos(lat)*Math.sin(lon));
  const north=new THREE.Vector3(0,1,0).addScaledVector(up,-up.y).normalize();
  const east=new THREE.Vector3().crossVectors(north,up).normalize();
  gm.debugFree=false;gm.player.placeOnSurface(b,up,north.clone().multiplyScalar(Math.cos(40*Math.PI/180)).addScaledVector(east,Math.sin(40*Math.PI/180)));gm.player.pitch=-0.1;
  if(name==='gorge'){const base=up.clone(),p=base.clone().multiplyScalar(b.R).addScaledVector(east,70).addScaledVector(north,-124).normalize(),target=base.clone().multiplyScalar(b.R).addScaledVector(east,86).addScaledVector(north,-157).normalize();gm.player.placeOnSurface(b,p,target.sub(p).normalize());gm.player.pitch=0.05;const t=S.findTime(b,up,40,false);window._scenicT=t;gm.t=t;gm.universe.update(t);}
  if(name==='space'||name==='rings'){gm.debugFree=true;const planet=gm.universe.bodies.find(b=>name==='space'?b.data.name==='Saturn':b.data.rings);if(!planet)throw Error('No ringed world in this seed');S.orbit(planet.data.id,name==='rings'?5:3.2,70);}
  if(name==='vessel'){gm.debugFree=false;gm.startAboard();}
  if(name==='elevated'){gm.debugFree=true;gm.freecam.placeAt(b,18.66,-59.63,150,40,-20);}
  report({stage:'Streaming '+name+' terrain'});await S.drain(35);
  let treePlacement;
  if(name==='wood'){
    const spawn=gm.player.fPos.clone(),trees=floraOf(b).near(spawn,200).filter(t=>t.kind==='tree').map(t=>({t,p:new THREE.Vector3(t.x,t.y,t.z)})).filter(e=>e.p.distanceTo(spawn)>15).sort((a,c)=>a.p.distanceToSquared(spawn)-c.p.distanceToSquared(spawn));
    if(!trees.length)throw Error('No tree beyond 15 m in the wood fixture');
    const {t,p}=trees[0],away=spawn.clone().sub(p).projectOnPlane(p.clone().normalize()).normalize(),at=p.clone().addScaledVector(away,3);
    gm.player.placeOnSurface(b,at.clone().normalize(),away.clone().negate());gm.player.pitch=-0.1;
    treePlacement={spawnDistance:p.distanceTo(spawn),cameraDistance:3,treeHeight:t.h};await S.drain(15);
  }
  for(let i=0;i<10;i++){gm.frame(performance.now());await new Promise(r=>setTimeout(r,0));}
  report({stage:'Capturing both renderers'});
  const native=gm.engine.renderer.isNativeWebGPU;
  const shot=native?{sideBySide:await gm.engine.webgpu.captureURL(),stats:gm.engine.webgpu.stats}:await capture(gm),timing=await measure(gm,5),culling=await measureCulling(gm,5),referenceTiming=await measureReference(gm,5);
  const saturn=gm.universe.bodies.find(b=>name==='rings'?b.data.rings:b.data.name==='Saturn');
  const diagnostics={native:!!native,planet:(name==='space'||name==='rings')?{name:saturn.data.name,id:saturn.data.id,rings:saturn.data.rings,position:gm.camPos.distanceTo(saturn.pos)/saturn.R}:null};
  report({stage:'Complete',world,treePlacement,diagnostics,stats:shot.stats,timing,culling,referenceTiming,error:gm.engine.webgpuError?.message},shot.sideBySide,(native?'native-':'')+name);
} catch(error){report({stage:'Failed',error:error.stack||String(error)});}
finally { window.debugHold=true; }
