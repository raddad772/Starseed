import { surveyEnvironment } from './generatorHall.js';
import * as THREE from 'three';
import { DeferredRenderer } from '../render/webgpu/renderer.js';
import { generateUnderstructure } from './layout.js';
import { buildScene } from './scene.js';
import { UnderstructureSimulation } from './simulation.js';
import { SurveyMap } from './surveyMap.js';
import { surveyObjective,fieldStatus,recoveryStatus,mysteryStatus,scanMessage } from './guidance.js';
import { bankRecovery,mysteryEntries } from './recovery.js';
import { THEME_NAMES,THEME_PROFILES } from './anomalies.js';

const $=id=>document.getElementById(id),params=new URLSearchParams(location.search);
const plan=generateUnderstructure(params.get('seed')||'SUMP-07',params.get('theme')||'auto',params.get('environment')==='barren'?surveyEnvironment({}):undefined),saveKey=`starseed.understructure.${params.has('test')?'test.':''}v2.${plan.seed}.${plan.themes.join('-')}`;
let saved={};try{saved=JSON.parse(localStorage.getItem(saveKey)||'{}');}catch{}
if(params.has('test')&&params.has('reset'))saved={};
const sim=new UnderstructureSimulation(plan,saved),visual=buildScene(plan),canvas=$('view');
const mapView=new SurveyMap($('map'));
for(const profile of THEME_PROFILES){const value=profile.join('-');if(!Array.from($('theme').options).some(o=>o.value===value))$('theme').add(new Option(profile.map(t=>THEME_NAMES[t]).join(' + '),value));}
const camera=new THREE.PerspectiveCamera(73,1,.08,3200);camera.rotation.order='YXZ';
const view={camera,width:1,height:1,rect:{x:0,y:0,w:1,h:1},meterRef:.18,maxExposure:3,exposureBias:1.3};
const engine={scene:visual.scene,view,minExposure:.05,pixelRatio:1};
let renderer,running=false,last=0,frame=0,lastSave=0,toastTimer,dirty=true;
const keys=new Set(),errors=[];
$('themes').textContent=plan.themes.map(t=>THEME_NAMES[t]).join(' + ');$('theme').value=params.get('theme')||'auto';
$('site').textContent=plan.seed;$('seed').value=plan.seed;$('start').disabled=true;$('start').textContent='Preparing survey…';
for(const p of sim.beacons)visual.addBeacon(p);
function fail(error){errors.push(String(error?.stack||error));$('fatal').hidden=false;$('fatal').textContent='The survey could not start: '+(error?.message||error);running=false;}
window.addEventListener('error',e=>fail(e.error||e.message));window.addEventListener('unhandledrejection',e=>fail(e.reason));
const ledgerKey=`starseed.golden-path.${params.has('test')?'test':'demo'}.v1`;
function syncData(){const result=bankRecovery(localStorage,ledgerKey,plan.seed,sim.rawData);sim.campaignTotal=result.total;if(result.newLead)toast('GOLDEN PATH · New lead reconstructed · open J / field notes');}
syncData();
function save(){syncData();try{localStorage.setItem(saveKey,JSON.stringify(sim.save()));}catch{} }
function toast(message){if(!message)return;$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,4500);}
function resize(){const ratio=Math.min(devicePixelRatio||1,1.5);const w=Math.max(1,Math.floor(innerWidth*ratio)),h=Math.max(1,Math.floor(innerHeight*ratio));canvas.width=w;canvas.height=h;Object.assign(view,{width:w,height:h,rect:{x:0,y:0,w,h}});camera.aspect=w/h;camera.updateProjectionMatrix();dirty=true;}
function panel(id){const el=$(id);el.hidden=!el.hidden;if(!el.hidden){document.exitPointerLock?.();keys.clear();if(id==='mapPanel'){drawMap();$('map').focus();}else drawNotes();}dirty=true;}
function pause(){running=false;keys.clear();document.exitPointerLock?.();$('intro').hidden=false;$('start').innerHTML='Resume survey <span>↗</span>';save();dirty=true;}
function start(){running=true;$('intro').hidden=true;$('mapPanel').hidden=true;$('notesPanel').hidden=true;canvas.focus();canvas.requestPointerLock?.()?.catch?.(()=>toast('Mouse capture unavailable. Drag to look, or use arrow keys.'));last=performance.now();dirty=true;}
$('start').onclick=start;$('pause').onclick=pause;
$('generate').onclick=()=>{const u=new URL(location.href);u.searchParams.set('seed',$('seed').value);u.searchParams.set('theme',$('theme').value);location.href=u.href;};
$('seed').addEventListener('keydown',e=>{if(e.key==='Enter')$('generate').click();});
$('mapButton').onclick=()=>panel('mapPanel');$('notesButton').onclick=()=>panel('notesPanel');
for(const el of document.querySelectorAll('[data-close]'))el.onclick=()=>{$(el.dataset.close).hidden=true;dirty=true;};
window.addEventListener('resize',resize);window.addEventListener('blur',()=>{keys.clear();});
document.addEventListener('visibilitychange',()=>{keys.clear();last=performance.now();if(document.hidden)save();else dirty=true;});
window.addEventListener('pagehide',()=>{save();renderer?.dispose();});
window.addEventListener('keydown',e=>{
  if((e.target instanceof HTMLInputElement||e.target instanceof HTMLSelectElement)||e.metaKey||e.ctrlKey||e.altKey)return;
  if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','KeyC','KeyR'].includes(e.code))e.preventDefault();
  keys.add(e.code);if(e.repeat)return;
  if(e.code==='Escape'){if(!$('mapPanel').hidden||!$('notesPanel').hidden){$('mapPanel').hidden=$('notesPanel').hidden=true;}else pause();}
  if(e.code==='KeyM')panel('mapPanel');if(e.code==='KeyJ')panel('notesPanel');
  if(!running||!$('mapPanel').hidden||!$('notesPanel').hidden)return;
  if(e.code==='KeyE'){toast(sim.interact());save();dirty=true;}
  if(e.code==='KeyT'){if(sim.teleport()){toast('Site record returned. You can descend again to keep exploring.');save();}else toast('Surface return unlocks when the site record is recovered.');dirty=true;}
  if(e.code==='KeyF'){sim.flashlight=!sim.flashlight;toast(sim.flashlight?'Hand light on':'Hand light off');dirty=true;}
  if(e.code==='KeyB'){if(sim.beacon()){visual.addBeacon(sim.beacons.at(-1));toast('Return beacon placed.');save();}else toast('Move farther from your last beacon. Up to 40 per site.');dirty=true;}
});
window.addEventListener('keyup',e=>keys.delete(e.code));
let drag=false;
canvas.addEventListener('pointerdown',()=>{drag=true;if(running&&document.pointerLockElement!==canvas)canvas.requestPointerLock?.()?.catch?.(()=>{});});
window.addEventListener('pointerup',()=>drag=false);
window.addEventListener('mousemove',e=>{if(running&&(document.pointerLockElement===canvas||drag)){sim.yaw-=e.movementX*.002;sim.pitch=Math.max(-1.4,Math.min(1.4,sim.pitch-e.movementY*.002));dirty=true;}});
function drawNotes(){const parent=$('notes');parent.replaceChildren();for(const entry of mysteryEntries(sim.campaignTotal)){const h=document.createElement('h3'),p=document.createElement('p');h.textContent=entry.title;p.textContent=entry.text;parent.append(h,p);}const summary=document.createElement('p');summary.textContent=recoveryStatus(sim)+' · '+mysteryStatus(sim);parent.append(summary);if(!sim.recorded.size){const p=document.createElement('p');p.textContent='No records yet. Find the lit survey contacts and press E nearby.';parent.append(p);}for(const sample of plan.samples.filter(s=>sim.recorded.has(s.id))){const a=document.createElement('article'),h=document.createElement('h3'),p=document.createElement('p');h.textContent=sample.title;p.textContent=sample.text;a.append(h,p);parent.append(a);}}
function drawMap(){mapView.draw(sim);$('mapStats').textContent=`${sim.discovered.size} surveyed sections · ${sim.beacons.length} return beacons`;}
function updateHUD(){
  $('zone').textContent=sim.zone;$('depth').innerHTML=`${sim.pos[1]>=0?'+':'−'}${Math.abs(sim.pos[1]).toFixed(1).padStart(5,'0')} <small>M</small>`;
  $('count').textContent=`${String(sim.recorded.size).padStart(2,'0')} / ${String(plan.samples.length).padStart(2,'0')}`;
  $('signal').textContent=sim.pos[1]>-2?'SUBSURFACE RETURN · UNCLASSIFIED':`LIVE CIRCUIT · ${Math.floor(sim.time/11)%2?'RETURN':'INTAKE'} CYCLE`;
  $('objective').textContent=sim.returned?'Data returned · further exploration is optional':surveyObjective(sim);
  $('circuits').textContent=`RETURN CIRCUITS ${sim.solved.size}/${plan.puzzles.length} · ${recoveryStatus(sim)}`;
  const scan=scanMessage(sim);if(scan){$('toast').textContent=scan;$('toast').hidden=false;$('toast').dataset.scan='yes';}else if($('toast').dataset.scan){$('toast').hidden=true;delete $('toast').dataset.scan;}
  $('clock').hidden=!plan.themes.includes('time')||sim.pos[1]>-2;
  $('clock').textContent=`MACHINERY CLOCK / ${sim.machinery.state}`;
  const showPhase=sim.offer()?.type==='phase';$('phasePanel').hidden=!showPhase;
  if(showPhase){const p=plan.puzzles.find(p=>p.id==='time');$('phaseBand').style.left=`${(p.target-p.window/2)*100}%`;$('phaseBand').style.width=`${p.window*100}%`;$('phaseSweep').style.left=`${sim.phase.value*100}%`;$('phaseText').textContent=sim.phase.ready?'ALIGNED · PRESS E':'Press E when the amber line reaches the pale band';}
  $('gravity').textContent=fieldStatus(sim);
  $('floatHelp').hidden=!sim.zeroG;
  document.body.classList.toggle('zero-g',sim.zeroG);
  const offer=sim.offer();$('prompt').hidden=!offer||!running||!$('mapPanel').hidden||!$('notesPanel').hidden;
  if(offer)$('prompt').innerHTML=`<b>E</b>${offer.text}`;
  if(!$('mapPanel').hidden)drawMap();
}
function render(){updateHUD();camera.position.set(sim.pos[0],sim.pos[1]+1.68,sim.pos[2]);camera.rotation.set(sim.pitch,sim.yaw,0);camera.updateMatrixWorld();visual.update(camera,0,sim.time,sim);engine.time=sim.time;renderer.render(engine);frame++;dirty=false;}
function loop(now){requestAnimationFrame(loop);if(document.hidden)return;const dt=Math.min((now-last)/1000,.1);if(now-last<1000/30)return;last=now;
  if(running&&$('mapPanel').hidden&&$('notesPanel').hidden){sim.step(dt,{forward:Number(keys.has('KeyW'))-Number(keys.has('KeyS')),strafe:Number(keys.has('KeyD'))-Number(keys.has('KeyA')),vertical:Number(keys.has('Space'))-Number(keys.has('KeyC')),brake:keys.has('KeyR'),turn:Number(keys.has('ArrowLeft'))-Number(keys.has('ArrowRight')),look:Number(keys.has('ArrowUp'))-Number(keys.has('ArrowDown')),fast:keys.has('ShiftLeft')||keys.has('ShiftRight')});dirty=true;}
  if(dirty)render();if((sim.rawData!==sim.lastBankedData)||(running&&now-lastSave>10000)){save();sim.lastBankedData=sim.rawData;lastSave=now;}}
// Explicitly opt-in diagnostics. No script runs in Dave's live sandbox tab.
if(params.has('test'))window.understructureTest={plan,sim,errors,saveKey,get renderer(){return renderer;},get frame(){return frame;},render,save,pause,start,engine,visual};
try{resize();renderer=await DeferredRenderer.create(canvas,fail);engine.webgpu=renderer;$('start').disabled=false;$('start').innerHTML='Begin survey <span>↗</span>';updateHUD();render();last=performance.now();requestAnimationFrame(loop);}catch(e){fail(e);}
