// Owned, finite browser fixture. Route helpers drive the production capsule with
// movement inputs; no puzzle flags, record progress or return state are injected.
import * as THREE from 'three';
import * as tk from './testkit.js';
import { Input } from '../src/input.js';
import { descend,solvePuzzles,retrieveSiteRecord,walkRoute,advance,ascendSurface } from './tests/understructure-walk.js';
const report=(data,image,name)=>parent.postMessage({type:'survey-test',report:data,image,name},location.origin);
const check=(ok,message)=>{if(!ok)throw Error(message);};
const yieldNow=()=>new Promise(r=>setTimeout(r,0));
let restoreSave,site,gm;
try {
 await tk.ready(60000);gm=window.game;await gm.engine.webgpuReady;window.debugHold=true;
 const p=gm.players[0],gpu=gm.engine.webgpu,ship=gm.ship,station=gm.orbitalStation;
 gpu.device.pushErrorScope('validation');check(gm.state==='playing','Normal game must load');
 if(p.mode!=='surface')gm.startOnSurface();
 for(let i=0;i<60&&gm.state!=='playing';i++)await window.debugRun(1000,16);
 site=gm.surfaceSurveys.sites[0];check(site,'Normal surface start must create an access hatch');
 site.profile='gravity-light';restoreSave=localStorage.getItem(site.saveKey);localStorage.removeItem(site.saveKey);
 // Fixture starts at the real hatch; entry itself uses the normal F interaction.
 const near=site.frame.position.clone().add(new THREE.Vector3(0,0,3).applyQuaternion(site.frame.rotation));
 p.placeOnSurface(site.body,near.normalize(),new THREE.Vector3(0,0,-1).applyQuaternion(site.frame.rotation));
 gm.paused=false;gm.debugFree=false;
 const tick=(key)=>{p.input.hits.clear();if(key)p.input.hits.add(key);gm.simulate(1/60);p.input.endFrame();};
 const shot=async(name,extra={})=>{
  const paused=gm.paused;gm.paused=true;
  for(let i=0;i<12;i++){gm.frame(performance.now());await gpu.device.queue.onSubmittedWorkDone();await yieldNow();}
  report({stage:'Captured',...extra},await gpu.captureURL(),name);gm.paused=paused;
 };
 await shot('survey-world-hatch',{body:site.body.data.name});
 const anchor=p.fPos.clone(),heading=p.heading.clone(),t0=gm.t,originalQ=site.body.q.clone();
 tick('KeyF');check(p.understructure,'F must enter through the normal surface interaction');const first=p.understructure;
 check(!p.jetOn,'Sector must stop the outside jetpack');check(first.sim.pos[1]===0&&!first.sim.hatchOpen,'World F must not leak into local F');
 check(gm.engine.webgpu===gpu&&gm.ship===ship&&gm.orbitalStation===station,'Sector must preserve renderer and fleet');
 gm.setWarp(3);check(gm.warp===1,'Survey must hold universe at normal speed');
 tick('KeyM');check(first.hud.panel==='map'&&!gm.map.open,'Local map must own M');tick('KeyM');
 descend(first.sim);check(first.sim.pos[1]===-240,'Actual lift must descend');tick();
 check(!Object.keys(gpu.opaque.uniformOverrides).length||gpu.shadows.state,'Renderer initially has world shadows');
 await shot('survey-underground',{themes:first.plan.themes,depth:first.sim.pos[1]});
 check(Object.keys(gpu.opaque.uniformOverrides).length===0,'World shadow bindings must not leak into sector');
 const bindingCount=gpu.lightBindings.entries.size;
 for(let i=0;i<30;i++){gm.renderView(p,true,1/60);await gpu.device.queue.onSubmittedWorkDone();if(i%5===0)await yieldNow();}
 check(gpu.lightBindings.entries.size===bindingCount,'Scene lighting bindings must remain bounded over repeated frames');
 report({stage:'Solving '+first.plan.themes.join(' + ')+' circuits'});
 solvePuzzles(first.sim);tick('KeyM');check(first.hud.mapView,'Integrated 3D map missing');await shot('survey-3d-map');tick('KeyM');retrieveSiteRecord(first.sim);tick();
 await shot('survey-record',{record:first.sim.dataRecovered,circuits:first.sim.solved.size});
 // A second player stays in the world while P1 remains underground.
 const inp2=new Input(gm.canvas,{kbm:false,padIndex:31});const p2=gm.joinPlayer(inp2);check(p2,'Second player joins');
 await shot('survey-split',{players:2});
 check(gpu.lastView===p2.view&&Object.entries(gpu.shadows.uniforms).every(([k,v])=>gpu.opaque.uniformOverrides[k]===v),'World view must restore outdoor shadow bindings after local view');
 gm.leavePlayer(p2);
 for(let i=0;i<120;i++){tick();if(i%8===0)await yieldNow();}
 check(gm.t>t0+1&&site.body.q.angleTo(originalQ)>0,'Universe and rotating planet must continue while inside');
 tick('KeyT');check(!p.understructure,'T must return to the world after retrieval');
 check(gm.players[0]===p&&gm.ship===ship&&gm.engine.webgpu===gpu&&!gpu.disposed,'Return must preserve live objects');
 check(p.body===site.body&&p.fPos.distanceTo(anchor)<.08&&p.heading.angleTo(heading)<.001,'Return must restore body-fixed entrance position and heading');
 check(!gpu.targets.has(first.view)&&!gpu.sceneLights.has(first.view),'Sector target and fallback lighting must be released');
 await shot('survey-world-return',{record:true,body:p.body.data.name});
 tick('KeyF');check(p.understructure?.sim.dataRecovered,'Re-entry must restore the saved record');
 const second=p.understructure;tick();check(p.understructure===second,'Saved returned flag must not immediately eject the player');
 descend(second.sim);tick();walkRoute(second.sim,0,0);check(second.sim.offer()?.type==='lift','Restored site must support lift return');
 second.sim.interact();advance(second.sim,4.3);tick();check(p.understructure===second,'Lift must stop in the access bunker');ascendSurface(second.sim);tick();check(!p.understructure,'Climbing out of bunker must return to world');
 check(!gpu.targets.has(second.view),'Repeated entry must release sector targets');
 const error=await gpu.device.popErrorScope();check(!error,error?.message);check(!gm.engine.webgpuError,gm.engine.webgpuError?.message);
 report({stage:'Passed',native:true,physicalHatch:true,sharedRenderer:true,themes:first.plan.themes,circuits:first.sim.solved.size,record:true,shortcutReturn:true,liftReturn:true,savedProgress:true,splitScreen:true,boundedLightingBindings:true,worldTimeAdvanced:gm.t-t0,positionError:p.fPos.distanceTo(anchor)});
}catch(error){report({stage:'Failed',error:error.stack||String(error)});}
finally{window.debugHold=true;for(const p of gm?.players||[])p.understructure?.leave(false);if(site){if(restoreSave===null)localStorage.removeItem(site.saveKey);else if(restoreSave!==undefined)localStorage.setItem(site.saveKey,restoreSave);}}
