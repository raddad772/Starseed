// Runs inside the test iframe. Never load in a player's tab.
import * as THREE from 'three';
import * as tk from './testkit.js';
import * as S from './scenic.js';
import { capture, measure, measureCulling } from './webgpu-compare.js';
const report = (data, image, name) => parent.postMessage({type:'webgpu-test',report:data,image,name},location.origin);
try {
  report({stage:'Preparing world and renderer'});
  await tk.ready();
  const gm=window.game; await gm.engine.webgpuReady; S.setup();
  report({stage:'Building Earth climate and terrain'});
  const world=await S.waitWorld(3,400); if(world.timeout) throw new Error('Earth simulation timed out: '+JSON.stringify(world));
  const name=new URLSearchParams(location.search).get('testView')||'wood';
  const b=S.body(3), lat=(name==='gorge'?3.05651:18.66)*Math.PI/180,lon=(name==='gorge'?-39.70748:-59.63)*Math.PI/180;
  const up=new THREE.Vector3(Math.cos(lat)*Math.cos(lon),Math.sin(lat),Math.cos(lat)*Math.sin(lon));
  const north=new THREE.Vector3(0,1,0).addScaledVector(up,-up.y).normalize();
  const east=new THREE.Vector3().crossVectors(north,up).normalize();
  gm.debugFree=false;gm.player.placeOnSurface(b,up,north.clone().multiplyScalar(Math.cos(40*Math.PI/180)).addScaledVector(east,Math.sin(40*Math.PI/180)));gm.player.pitch=-0.1;
  if(name==='gorge'){const base=up.clone(),p=base.clone().multiplyScalar(b.R).addScaledVector(east,70).addScaledVector(north,-124).normalize(),target=base.clone().multiplyScalar(b.R).addScaledVector(east,86).addScaledVector(north,-157).normalize();gm.player.placeOnSurface(b,p,target.sub(p).normalize());gm.player.pitch=0.05;const t=S.findTime(b,up,40,false);window._scenicT=t;gm.t=t;gm.universe.update(t);}
  if(name==='space'){gm.debugFree=true;S.orbit(gm.universe.bodies.find(b=>b.data.name==='Saturn').data.id,3.2,70);}
  if(name==='vessel'){gm.debugFree=false;gm.startAboard();}
  if(name==='elevated'){gm.debugFree=true;gm.freecam.placeAt(b,18.66,-59.63,150,40,-20);}
  report({stage:'Streaming '+name+' terrain'});await S.drain(35);
  for(let i=0;i<10;i++){gm.frame(performance.now());await new Promise(r=>setTimeout(r,0));}
  report({stage:'Capturing both renderers'});
  const shot=await capture(gm),timing=await measure(gm,5),culling=await measureCulling(gm,5);
  report({stage:'Complete',world,stats:shot.stats,timing,culling,error:gm.engine.webgpuError?.message},shot.sideBySide,name);
} catch(error){report({stage:'Failed',error:error.stack||String(error)});}
finally { window.debugHold=true; }
