import * as THREE from 'three';
import * as tk from './testkit.js';
const checks=[],check=(ok,label)=>{if(!ok)throw Error(label);checks.push(label);};
const report=data=>parent.postMessage({type:'neptune-flight',report:data},location.origin);
try {
 await tk.ready(60000);const g=window.game;await g.engine.webgpuReady;window.debugHold=true;
 const gpu=g.engine.webgpu;gpu.device.pushErrorScope('validation');
 const p=g.players[0],s=g.yacht;g.berthYacht();p.sitDown(0,s);g.setCur(p);
 p.camMode='chase';g.paused=true;
 for(let i=0;i<5;i++){g.frame(performance.now());await gpu.device.queue.onSubmittedWorkDone();}
 check(p.camPos.distanceTo(g.carrier.getWorldPos(new THREE.Vector3()))>g.carrier.type.radius,'Chase camera is outside the containing carrier');
 p.camMode='landing';g.frame(performance.now());await gpu.device.queue.onSubmittedWorkDone();
 check(p.camPos.distanceTo(g.carrier.getWorldPos(new THREE.Vector3()))>g.carrier.type.radius,'Landing camera is outside the containing carrier');
 g.target=g.tender.target;g.paused=false;g.input.hits.add('KeyN');g.handleGlobalKeys(g.input);g.input.endFrame();g.paused=true;
 check(s.nav.active,'N engages navigation at Neptune’s helm');
 s.nav.update(1/120);g.stepChild(s,1/120);
 check(!s.parent,'Navigation launches Neptune from its berth');
 s.nav.cancel(null);p.camMode='chase';g.frame(performance.now());await gpu.device.queue.onSubmittedWorkDone();
 check(p.camPos.distanceTo(s.getWorldPos(new THREE.Vector3()))<s.type.radius*3,'Chase camera follows Neptune after launch');
 const error=await gpu.device.popErrorScope();check(!error,error?.message||'Native WebGPU validation clean');
 check(document.querySelector('#errorLine').hidden,'No uncaught runtime errors');
 report({stage:'Passed',checks});
}catch(error){report({stage:'Failed',checks,error:error.stack||String(error)});}
finally{window.debugHold=true;}
