// Runs inside the test iframe. Never load in a player's tab.
import * as THREE from 'three';
import * as tk from './testkit.js';
import { readRGBA } from '../src/render/webgpu/device.js';
import * as S from './scenic.js';
import { capture, measure, measureCulling, measureReference } from './webgpu-compare.js';
const yieldChannel=new MessageChannel();let resolveYield;yieldChannel.port1.onmessage=()=>resolveYield?.();
const yieldNow=()=>new Promise(resolve=>{resolveYield=resolve;yieldChannel.port2.postMessage(0);});
const report = (data, image, name) => parent.postMessage({type:'webgpu-test',report:data,image,name},location.origin);
try {
  report({stage:'Preparing world and renderer'});
  await tk.ready();
  const gm=window.game; await gm.engine.webgpuReady; S.setup();
  const name=new URLSearchParams(location.search).get('testView')||'wood';
  report({stage:'Building scene'});
  if(name==='map'){
    if(!gm.engine.renderer.isNativeWebGPU)throw Error('Select Native startup only for the map fixture');
    gm.map.openFull(gm.players[0]);gm.map.focus=gm.universe.star;gm.map.dist=1.5e10;gm.frame(performance.now());
    const gpu=gm.engine.webgpu,m=gpu.map,shot=await readRGBA(gpu.device,m.color,m.target.width,m.target.height,gpu.format);
    let bright=0;for(let i=0;i<shot.pixels.length;i+=4)if(Math.max(shot.pixels[i],shot.pixels[i+1],shot.pixels[i+2])>40)bright++;
    if(bright<100)throw Error('System map has no visible orbit/body geometry');
    const cv=document.createElement('canvas');cv.width=shot.width;cv.height=shot.height;cv.getContext('2d').putImageData(new ImageData(shot.pixels,shot.width,shot.height),0,0);
    report({stage:'Complete',native:true,map:true,brightPixels:bright,bodies:gm.map.items.length,error:gm.engine.webgpuError?.message},cv.toDataURL('image/png'),'native-map');
  } else {
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
    const spawn=gm.player.fPos.clone(),trees=[],candidate=new THREE.Vector3(),im=new THREE.Matrix4();
    // The render instances have been seated on the refined near-volume ground;
    // the simulation scatter positions may still carry the original coarse height.
    gm.engine.scene.traverseVisible(o=>{
      if(!o.isInstancedMesh||o.userData.kind!=='tree'||!o.userData.view)return;
      const a=o.instanceMatrix,data=a.isInterleavedBufferAttribute?a.data.array:a.array,stride=a.data?.stride||16,offset=a.offset||0;
      for(let i=0;i<o.count;i++){
        im.fromArray(data,offset+i*stride);candidate.setFromMatrixPosition(im).applyMatrix4(o.matrixWorld).add(gm.camPos).sub(b.pos).applyQuaternion(b.qInv);
        const d=candidate.distanceTo(spawn);if(d>15&&d<200)trees.push({p:candidate.clone(),d});
      }
    });
    trees.sort((a,b)=>a.d-b.d);if(!trees.length)throw Error('No seated tree beyond 15 m in the wood fixture');
    const {p,d}=trees[0],up=p.clone().normalize(),away=spawn.clone().sub(p).projectOnPlane(up).normalize();
    const cameraF=p.clone().addScaledVector(away,3).addScaledVector(up,1.7),normal=cameraF.clone().normalize(),targetF=p.clone().addScaledVector(up,0.3);
    const northF=new THREE.Vector3(0,1,0).addScaledVector(normal,-normal.y).normalize(),eastF=new THREE.Vector3().crossVectors(northF,normal).normalize(),look=targetF.clone().sub(cameraF).normalize();
    const heading=Math.atan2(look.dot(eastF),look.dot(northF))*180/Math.PI,pitch=Math.asin(look.dot(normal))*180/Math.PI;
    gm.debugFree=true;gm.freecam.placeAt(b,Math.asin(normal.y)*180/Math.PI,Math.atan2(normal.z,normal.x)*180/Math.PI,1.7,heading,pitch);
    gm.freecam.posF.copy(cameraF);gm.freecam.sync();
    treePlacement={spawnDistance:d,cameraDistance:cameraF.distanceTo(p),horizontalDistance:3,eyeAboveSeatedBase:1.7,pitch};await S.drain(15);

  }
  for(let i=0;i<10;i++){gm.frame(performance.now());await yieldNow();}
  report({stage:'Capturing both renderers'});
  const native=gm.engine.renderer.isNativeWebGPU;
  const shot=native?{sideBySide:await gm.engine.webgpu.captureURL(),stats:gm.engine.webgpu.stats}:await capture(gm),timing=await measure(gm,5),culling=await measureCulling(gm,5),referenceTiming=await measureReference(gm,5);
  const saturn=gm.universe.bodies.find(b=>name==='rings'?b.data.rings:b.data.name==='Saturn');
  const diagnostics={native:!!native,planet:(name==='space'||name==='rings')?{name:saturn.data.name,id:saturn.data.id,rings:saturn.data.rings,position:gm.camPos.distanceTo(saturn.pos)/saturn.R}:null};
  report({stage:'Complete',world,treePlacement,diagnostics,stats:shot.stats,timing,culling,referenceTiming,error:gm.engine.webgpuError?.message},shot.sideBySide,(native?'native-':'')+name);
  }
} catch(error){report({stage:'Failed',error:error.stack||String(error)});}
finally { window.debugHold=true;yieldChannel.port1.close();yieldChannel.port2.close(); }
