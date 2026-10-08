import * as THREE from 'three';
import * as tk from './testkit.js';
import { orbitalReadiness } from '../src/sim/arrival.js';
const checks=[],check=(ok,label)=>{if(!ok)throw Error(label);checks.push(label);};
const report=data=>parent.postMessage({type:'orbital-loading',report:{...data,checks}},location.origin);
try {
  await tk.ready(60000);const g=window.game;window.debugHold=true;await g.engine.webgpuReady;
  check(g.state==='playing','Actual orbital terrain reaches readiness');
  const body=g.players[0].currentBody(),status=new Map(g.universe.bodies.map(b=>[b.id,'ready']));
  status.set(body.id,'queued');
  // Delay a history completion without running a second expensive world simulation.
  g.worldSims={status,phase:new Map(),request(){}};
  g.beginLoading('space','Loading planetary history');g.loadTimer=100;
  await window.debugRun(500,16);
  const cover=document.querySelector('#arrivalLoading');
  check(g.state==='loading'&&cover.style.display==='flex','Orbital loading bar stays visible beyond the old timeout');
  check(cover.textContent.includes('planetary history'),'Loading bar identifies the unfinished history');
  window.dispatchEvent(new KeyboardEvent('keydown',{key:'x',code:'KeyX',bubbles:true}));cover.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));
  check(cover.style.display==='flex','Key and pointer input cannot skip required loading');
  report({stage:'History held',canRelease:true});
  await new Promise(resolve=>{const listener=e=>{if(e.source===parent&&e.origin===location.origin&&e.data.type==='release-orbital-history'){window.removeEventListener('message',listener);resolve();}};window.addEventListener('message',listener);});
  status.set(body.id,'ready');await window.debugRun(30000,16,()=>g.state!=='playing');
  check(g.state==='playing'&&cover.style.display==='none','The loading bar closes when nearby worlds are ready');
  const ready=orbitalReadiness(g);check(ready.pending===0&&!ready.unmeasured,'Visible orbital terrain is complete when flight resumes');
  g.worldSims=null;
  const p=g.players[0],s=g.yacht;if(s.parent)s.leaveParent();s.nav.cancel(null);s.doors.ramp.open=s.doors.ramp.target=1;
  s.angVel.set(0,0,0);g.setCur(p);p.mode='eva';p.vessel=null;p.body=s.body;p.evaQuat.copy(s.quat);p.camMode='first';
  const local=new THREE.Vector3(2.5,.8,30);s.localToBody(local,p.ePos);s.pointVelocity(local,p.eVel);
  p.eVel.add(new THREE.Vector3(0,0,-4).applyQuaternion(s.quat));
  const input={axis:()=>0,down:()=>false,hit:()=>false};
  for(let i=0;i<250&&p.mode==='eva';i++){g.advanceVessels(.01);p.updateEva(.01,input,{dx:0,dy:0});}
  check(p.mode==='ship'&&p.vessel===s,`Floating through Neptune’s open garage enters its walking frame (${p.mode}, ${s.bodyToLocal(p.ePos,new THREE.Vector3()).toArray().map(n=>n.toFixed(2))})`);
  g.paused=true;const gpu=g.engine.webgpu;gpu.device.pushErrorScope('validation');g.frame(performance.now());await gpu.device.queue.onSubmittedWorkDone();
  const error=await gpu.device.popErrorScope();check(!error,error?.message||'Native garage render validates');
  check(document.querySelector('#errorLine').hidden,'No runtime errors');
  report({stage:'Passed'});
} catch(error) {report({stage:'Failed',error:error.stack||String(error)});}
finally {window.debugHold=true;}
