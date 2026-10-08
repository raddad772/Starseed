// Finite native renderer/input integration check, only loaded by its test page.
import * as THREE from 'three';
import * as tk from './testkit.js';
import { Input } from '../src/input.js';
const report=(data,image)=>parent.postMessage({type:'navigation-test',report:data,image},location.origin);
const checks=[];const check=(ok,label)=>{if(!ok)throw Error(label);checks.push(label);};
const tick=()=>new Promise(r=>setTimeout(r,0));
try {
 await tk.ready(60000);const gm=window.game;await gm.engine.webgpuReady;window.debugHold=true;
 const gpu=gm.engine.webgpu;gpu.device.pushErrorScope('validation');
 const p1=gm.players[0],ship=p1.ship,b=ship.body;
 ship.nav.cancel(null);if(ship.parent)ship.leaveParent();ship.landed=false;ship.rails=false;ship.dead=false;ship.ftl.state='idle';
 gm.placeInOrbit(ship,b,Math.max(b.atmHeight*1.5,b.relief*1.6+50000,b.R*.15),.7);ship.assist=1;p1.sitDown(0,ship);
 const p2=gm.joinPlayer(new Input(gm.input.canvas,{kbm:false,padIndex:99}));
 check(!!p2,'Second pilot joins at normal time');
 const second=p2.ship;if(second.parent)second.leaveParent();second.landed=false;second.rails=false;second.nav.cancel(null);second.ftl.state='idle';
 gm.placeInOrbit(second,b,ship.altitude,1.1);second.assist=1;p2.sitDown(0,second);
 gm.setCur(p1);gm.setWarp(6);check(gm.warp===1,'P1 alone cannot accelerate shared time');
 gm.setCur(p2);gm.setWarp(4);check(gm.warp===50,'Both pilots agree; lower request sets the rate');
 gm.setWarp(0);check(gm.warp===1,'P2 cancels warp immediately');
 gm.setWarp(6);gm.setCur(p1);gm.setWarp(0);check(gm.warp===1,'P1 cancels warp immediately');
 gm.setCur(null);
 const nav=ship.nav;nav.setTravelMode('conventional');
 check(nav.order({kind:'meet',v:second}),'Conventional rendezvous order accepted');
 for(let i=0;i<3;i++){nav.update(.033);gm.advanceVessels(.033);}
 check(!!nav.flight?.arc,'Orbital launch window and moving-target transfer calculated');
 check(Number.isFinite(nav.flight.arc.deltaV)&&nav.flight.arc.deltaV>0,'Plan exposes finite maneuver budget');
 gm.setCur(p1);gm.setWarp(8);gm.setCur(p2);gm.setWarp(8);gm.setCur(null);
 // Test the real event limiter independently of whether this seed chooses an
 // immediate departure or a wait, then restore the guidance event.
 const event=nav.nextEventAt;nav.nextEventAt=gm.t+.04;gm.updateWarp(.033);
 check(gm.warp===1,'Scheduled maneuver prevents a high-warp step from skipping it');nav.nextEventAt=event;
 gm.setCur(p1);gm.setWarp(0);gm.setCur(p2);gm.setWarp(0);gm.setCur(p1);
 const routeMenu=p1.ui.quick.navMenu().items.find(i=>i.id==='route');
 check(routeMenu?.items.some(i=>i.label==='Conventional'),'Quick menu offers conventional and FTL routing');
 gm.setWarp(6);gm.setCur(p2);gm.setWarp(0);gm.setCur(null);
 gm.paused=true;gm.camMode='chase';
 for(let i=0;i<8;i++){gm.frame(performance.now());await gpu.device.queue.onSubmittedWorkDone();await tick();}
 check(p1.ui.hud.nav.textContent.includes('Warp requests')&&p2.ui.hud.nav.textContent.includes('Warp requests'),'Both HUDs show both players’ requests');
 check(p1.ui.hud.nav.textContent.includes('Maneuvers'),'HUD shows the live orbital maneuver budget');
 const error=await gpu.device.popErrorScope();check(!error,error?.message||'Native WebGPU validation clean');
 check(!gm.engine.webgpuError,'Native renderer remains healthy');
 const result={stage:'Passed',checks,planet:b.data.name,route:nav.travelMode,phase:nav.status()?.phase,waitSeconds:nav.status()?.wait,deltaV:nav.status()?.deltaV,requests:gm.players.map(p=>p.warpRequestIndex),sharedWarp:gm.warp,native:true};
 report(result,await gpu.captureURL());
}catch(error){report({stage:'Failed',checks,error:error.stack||String(error)});}
finally{window.debugHold=true;}
