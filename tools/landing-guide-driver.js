// Loaded only by the explicit owned test fixture, never by normal startup.
import * as THREE from 'three';
import * as tk from './testkit.js';
import { QuickMenu } from '../src/ui/quickMenu.js';
const report=(data,image,name)=>parent.postMessage({type:'landing-guide-test',report:data,image,name},location.origin);
const check=(ok,label)=>{if(!ok)throw Error(label);};
const yieldNow=()=>new Promise(r=>setTimeout(r,0));
const checks=[];
try{
 await tk.ready(60000);const gm=window.game;await gm.engine.webgpuReady;window.debugHold=true;
 const gpu=gm.engine.webgpu,s=gm.ship,b=gm.startBody,p=gm.player,site=gm.startDir.clone();
 gpu.device.pushErrorScope('validation');s.nav.cancel(null);if(s.parent)s.leaveParent();p.sitDown(0,s);
 gm.paused=true;gm.target=b;gm.camMode='first';gm.debugFree=false;s.landed=false;s.rails=false;s.dead=false;s.hull=1;s.ftl.state='idle';s.gear=s.gearTarget=1;
 const back=new THREE.Vector3(0,1,0).cross(site).normalize(),gh=b.groundHeight(site);
 const place=(distance,height,speed=0,down=0)=>{
  const fixed=site.clone().multiplyScalar(Math.cos(distance/b.R)).addScaledVector(back,Math.sin(distance/b.R)),up=fixed.clone().applyQuaternion(b.q);
  s.pos.copy(up).multiplyScalar(b.R+gh+height);s.angVel.set(0,0,0);
  const toward=site.clone().applyQuaternion(b.q).addScaledVector(up,-site.clone().applyQuaternion(b.q).dot(up)).normalize();
  s.quat.setFromRotationMatrix(new THREE.Matrix4().lookAt(new THREE.Vector3(),toward,up));s.frameVel(s.vel);s.vel.addScaledVector(toward,speed).addScaledVector(up,down);s.agl=height-2.5;s.environment(0);
 };
 place(3000,400,45,-4);const assist=s.assist;
 const menu=new QuickMenu(gm,document.createElement('div')),items=menu.navMenu().items;
 items.find(i=>i.label==='Guide to landing site').run();
 check(!s.nav.active&&s.assist===assist,'Manual guide must not engage autopilot or change assist');checks.push('Quick menu selects guide without engaging autopilot');
 const hud=p.ui.hud;if(hud.titleEl)hud.titleEl.classList.add('out');
 const shot=async(name)=>{
  for(let i=0;i<8;i++){gm.frame(performance.now());await gpu.device.queue.onSubmittedWorkDone();await yieldNow();}
  const reading=s.nav.landingGuide.update();check(reading&&!reading.waiting,'Expected surface guidance');
  const raw=await gpu.captureURL(),img=new Image();img.src=raw;await img.decode();
  const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const ctx=c.getContext('2d');ctx.drawImage(img,0,0);ctx.drawImage(hud.canvas,0,0,c.width,c.height);
  report({stage:'Captured',name,checks,range:reading.range,cues:reading.caution,boxes:reading.gates.length},c.toDataURL(),name);return reading;
 };
 let reading=await shot('landing-corridor');check(reading.gates.length>=4,'Approach boxes missing');checks.push('Projected boxes, site marker and speed/descent guidance draw on native flight view');
 const route=s.nav.landingGuide.route;s.quat.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),Math.PI));
 await shot('landing-turned-away');check(s.nav.landingGuide.route===route,'Fast view turn moved the corridor');checks.push('Immediate 180-degree view change preserves fixed route');
 place(7,28,5,-9);s.gear=0;reading=await shot('landing-hover');check(reading.final&&reading.caution.includes('LOWER GEAR'),'Final hover cues missing');checks.push('Final hover exposes drift, descent and gear warning');
 s.nav.landingGuide.enabled=false;check(s.nav.landingGuide.update()===null,'Guide toggle did not hide');checks.push('Guide toggle hides all guidance');
 s.nav.landingGuide.enabled=true;place(3000,400,45,-4);await shot('landing-corridor-final');
 check(!s.nav.active&&s.assist===assist,'Rendering guidance changed flight controls');
 const error=await gpu.device.popErrorScope();check(!error,error?.message);check(!gm.engine.webgpuError,gm.engine.webgpuError?.message);
 report({stage:'Passed',checks,native:true,autopilot:false});
}catch(error){report({stage:'Failed',checks,error:error.stack||String(error)});}
finally{window.debugHold=true;}
