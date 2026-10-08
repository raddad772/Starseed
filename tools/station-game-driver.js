// Finite test driver, loaded only by tools/tests/station.html in an owned tab.
import * as THREE from 'three';
import * as tk from './testkit.js';
const report=(data,image,name)=>parent.postMessage({type:'station-test',report:data,image,name},location.origin);
const check=(ok,label)=>{if(!ok)throw Error(label);};
const yieldNow=()=>new Promise(r=>setTimeout(r,0));
try {
 await tk.ready(60000);const gm=window.game;await gm.engine.webgpuReady;
 for(let i=0;i<80&&!gm.orbitalStation;i++)await window.debugRun(1000,16);
 window.debugHold=true;
 const host=gm.orbitalStation;check(host,'Normal fleet startup must spawn an orbital station');
 const gpu=gm.engine.webgpu,ship=gm.lifter;gpu.device.pushErrorScope('validation');
 check(ship&&host.body&&host.rails,'Station and heavy lifter must exist in the normal game');
 report({stage:'Framing station',planet:host.body.data.name,altitude:host.altitude,bays:host.type.zones.map(z=>z.name)});
 const camera=(position,target)=>{
  gm.debugFree=true;gm.camPos.copy(host.localToWorld(new THREE.Vector3(...position),new THREE.Vector3()));
  const look=host.localToWorld(new THREE.Vector3(...target),new THREE.Vector3()),up=new THREE.Vector3(0,1,0).applyQuaternion(host.quat);
  gm.camQuat.setFromRotationMatrix(new THREE.Matrix4().lookAt(gm.camPos,look,up));gm.freecam.setRef(host.body);gm.engine.adaptReset=true;
 };
  const shot=async(name,position,target,extra={})=>{
  const paused=gm.paused;gm.paused=true;
  camera(position,target);
  for(let i=0;i<15;i++){gm.frame(performance.now());await gpu.device.queue.onSubmittedWorkDone();await yieldNow();}
  const image=await gpu.captureURL();gm.paused=paused;report({stage:'Captured',planet:host.body.data.name,altitude:host.altitude,...extra},image,name);
 };
 await shot('orbital-station', [270,180,-300],[0,16,45]);
 ship.nav.cancel(null);if(ship.parent)ship.leaveParent();ship.landed=false;ship.rails=false;ship.dead=false;ship.hull=1;ship.hullTemp=290;ship.ftl.state='idle';
 ship.body=host.body;ship.pos.copy(host.localToBody(new THREE.Vector3(-49,14,-160),new THREE.Vector3()));ship.vel.copy(host.vel);ship.angVel.set(0,0,0);
 ship.quat.copy(host.quat).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),Math.PI));ship.gear=ship.gearTarget=1;
 const dest=ship.nav.destinationFor(host.target);check(dest.kind==='dock','Normal target selection must offer docking');check(ship.nav.order(dest),'Docking order must be accepted');
 report({stage:'Flying Atlas into the bay'});
 const simulate=async(seconds,done)=>{
  for(let i=0;i<seconds*30&&!done()&&!ship.dead;i++) {
   ship.nav.update(1/30);gm.advanceVessels(1/30);gm.checkZones();
   if(i%90===0)await yieldNow();
  }
 };
 await simulate(240,()=>ship.attached&&ship.parent===host);
 check(ship.attached&&ship.parent===host,'Atlas must land: '+ship.deathCause+' / '+ship.nav.phase);check(ship.hull===1,'Atlas must arrive without damage');
 await shot('orbital-station-landed',[-25,3,30],[-49,3,-15],{landed:true,hull:ship.hull,zone:ship.zone.name});
 await shot('orbital-station-control',[9,44,86],[0,44,64],{interior:'Orbital control'});
 ship.nav.order({kind:'hold'});report({stage:'Launching Atlas'});
 await simulate(90,()=>!ship.parent);check(!ship.parent&&!ship.dead&&ship.hull===1,'Atlas must leave the bay undamaged');
 await shot('orbital-station-departure',[-90,40,-160],[-49,10,-65],{departed:true,hull:ship.hull});
 const error=await gpu.device.popErrorScope();check(!error,error?.message);check(!gm.engine.webgpuError,gm.engine.webgpuError?.message);
 report({stage:'Passed',planet:host.body.data.name,orbit:host.orbit().bound,altitude:host.altitude,targetDocking:true,landed:true,departed:true,hull:ship.hull,bays:2,native:true});
}catch(error){report({stage:'Failed',error:error.stack||String(error)});}
finally{window.debugHold=true;}
