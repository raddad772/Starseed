// Runs inside the test iframe. Never load in a player's tab.
import * as THREE from 'three';
import * as tk from './testkit.js';
import * as S from './scenic.js';
import { capture, measure } from './webgpu-compare.js';
const report = (data, image, name) => parent.postMessage({type:'webgpu-test',report:data,image,name},location.origin);
try {
  report({stage:'Preparing world and renderer'});
  await tk.ready();
  const gm=window.game; await gm.engine.webgpuReady; S.setup();
  report({stage:'Building Earth climate and terrain'});
  const world=await S.waitWorld(3,400); if(world.timeout) throw new Error('Earth simulation timed out: '+JSON.stringify(world));
  const b=S.body(3), lat=18.66*Math.PI/180,lon=-59.63*Math.PI/180;
  const up=new THREE.Vector3(Math.cos(lat)*Math.cos(lon),Math.sin(lat),Math.cos(lat)*Math.sin(lon));
  const north=new THREE.Vector3(0,1,0).addScaledVector(up,-up.y).normalize();
  const east=new THREE.Vector3().crossVectors(north,up).normalize();
  gm.debugFree=false;gm.player.placeOnSurface(b,up,north.multiplyScalar(Math.cos(40*Math.PI/180)).addScaledVector(east,Math.sin(40*Math.PI/180)));gm.player.pitch=-0.1;
  report({stage:'Streaming wood terrain'});await S.drain(35);
  for(let i=0;i<10;i++){gm.frame(performance.now());await new Promise(r=>setTimeout(r,0));}
  report({stage:'Capturing both renderers'});
  const shot=await capture(gm),timing=await measure(gm,5);
  report({stage:'Complete',world,stats:shot.stats,timing,error:gm.engine.webgpuError?.message},shot.sideBySide,'wood');
} catch(error){report({stage:'Failed',error:error.stack||String(error)});}
finally { window.debugHold=true; }
