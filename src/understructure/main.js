import * as THREE from 'three';
import { DeferredRenderer } from '../render/webgpu/renderer.js';
import { generateUnderstructure, TILE, DECK, key } from './layout.js';
import { buildScene } from './scene.js';
import { UnderstructureSimulation } from './simulation.js';

const $=id=>document.getElementById(id),params=new URLSearchParams(location.search);
const plan=generateUnderstructure(params.get('seed')||'SUMP-07'),saveKey=`starseed.understructure.${params.has('test')?'test.':''}v1.${plan.seed}`;
let saved={};try{saved=JSON.parse(localStorage.getItem(saveKey)||'{}');}catch{}
if(params.has('test'))saved={};
const sim=new UnderstructureSimulation(plan,saved),visual=buildScene(plan),canvas=$('view');
const camera=new THREE.PerspectiveCamera(73,1,.08,900);camera.rotation.order='YXZ';
const view={camera,width:1,height:1,rect:{x:0,y:0,w:1,h:1},meterRef:.18,maxExposure:3,exposureBias:1.3};
const engine={scene:visual.scene,view,minExposure:.05,pixelRatio:1};
let renderer,running=false,last=0,frame=0,lastSave=0,toastTimer,dirty=true;
const keys=new Set(),errors=[];
$('site').textContent=plan.seed;$('seed').value=plan.seed;$('start').disabled=true;$('start').textContent='Preparing survey…';
for(const p of sim.beacons)visual.addBeacon(p);
function fail(error){errors.push(String(error?.stack||error));$('fatal').hidden=false;$('fatal').textContent='The survey could not start: '+(error?.message||error);running=false;}
window.addEventListener('error',e=>fail(e.error||e.message));window.addEventListener('unhandledrejection',e=>fail(e.reason));
function save(){try{localStorage.setItem(saveKey,JSON.stringify(sim.save()));}catch{} }
function toast(message){if(!message)return;$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,4500);}
function resize(){const ratio=Math.min(devicePixelRatio||1,1.5);const w=Math.max(1,Math.floor(innerWidth*ratio)),h=Math.max(1,Math.floor(innerHeight*ratio));canvas.width=w;canvas.height=h;Object.assign(view,{width:w,height:h,rect:{x:0,y:0,w,h}});camera.aspect=w/h;camera.updateProjectionMatrix();dirty=true;}
function panel(id){const el=$(id);el.hidden=!el.hidden;if(!el.hidden){document.exitPointerLock?.();keys.clear();if(id==='mapPanel')drawMap();else drawNotes();}dirty=true;}
function pause(){running=false;keys.clear();document.exitPointerLock?.();$('intro').hidden=false;$('start').innerHTML='Resume survey <span>↗</span>';save();dirty=true;}
function start(){running=true;$('intro').hidden=true;$('mapPanel').hidden=true;$('notesPanel').hidden=true;canvas.focus();canvas.requestPointerLock?.()?.catch?.(()=>toast('Mouse capture unavailable. Drag to look, or use arrow keys.'));last=performance.now();dirty=true;}
$('start').onclick=start;$('pause').onclick=pause;
$('generate').onclick=()=>{const u=new URL(location.href);u.searchParams.set('seed',$('seed').value);location.href=u.href;};
$('seed').addEventListener('keydown',e=>{if(e.key==='Enter')$('generate').click();});
$('mapButton').onclick=()=>panel('mapPanel');$('notesButton').onclick=()=>panel('notesPanel');
for(const el of document.querySelectorAll('[data-close]'))el.onclick=()=>{$(el.dataset.close).hidden=true;dirty=true;};
window.addEventListener('resize',resize);window.addEventListener('blur',()=>{keys.clear();});
document.addEventListener('visibilitychange',()=>{keys.clear();last=performance.now();if(document.hidden)save();else dirty=true;});
window.addEventListener('pagehide',()=>{save();renderer?.dispose();});
window.addEventListener('keydown',e=>{
  if(e.target instanceof HTMLInputElement)return;
  if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();
  keys.add(e.code);if(e.repeat)return;
  if(e.code==='Escape'){if(!$('mapPanel').hidden||!$('notesPanel').hidden){$('mapPanel').hidden=$('notesPanel').hidden=true;}else pause();}
  if(e.code==='KeyM')panel('mapPanel');if(e.code==='KeyJ')panel('notesPanel');
  if(!running)return;
  if(e.code==='KeyE'){toast(sim.interact());save();dirty=true;}
  if(e.code==='KeyF'){sim.flashlight=!sim.flashlight;toast(sim.flashlight?'Hand light on':'Hand light off');dirty=true;}
  if(e.code==='KeyB'){if(sim.beacon()){visual.addBeacon(sim.beacons.at(-1));toast('Return beacon placed.');save();}else toast('Move farther from your last beacon. Up to 40 per site.');dirty=true;}
});
window.addEventListener('keyup',e=>keys.delete(e.code));
let drag=false;
canvas.addEventListener('pointerdown',()=>{drag=true;if(running&&document.pointerLockElement!==canvas)canvas.requestPointerLock?.()?.catch?.(()=>{});});
window.addEventListener('pointerup',()=>drag=false);
window.addEventListener('mousemove',e=>{if(running&&(document.pointerLockElement===canvas||drag)){sim.yaw-=e.movementX*.002;sim.pitch=Math.max(-1.4,Math.min(1.4,sim.pitch-e.movementY*.002));dirty=true;}});
function drawNotes(){const parent=$('notes');parent.replaceChildren();if(!sim.recorded.size){const p=document.createElement('p');p.textContent='No records yet. Find the lit survey contacts and press E nearby.';parent.append(p);}for(const sample of plan.samples.filter(s=>sim.recorded.has(s.id))){const a=document.createElement('article'),h=document.createElement('h3'),p=document.createElement('p');h.textContent=sample.title;p.textContent=sample.text;a.append(h,p);parent.append(a);}}
function drawMap(){const c=$('map'),ctx=c.getContext('2d'),scale=1.65,ox=240,oz=40;ctx.clearRect(0,0,c.width,c.height);ctx.fillStyle='#0c1718';ctx.fillRect(0,0,c.width,c.height);
  ctx.strokeStyle='#b9dcc00c';ctx.lineWidth=1;for(let x=0;x<c.width;x+=32){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,c.height);ctx.stroke();}for(let z=0;z<c.height;z+=32){ctx.beginPath();ctx.moveTo(0,z);ctx.lineTo(c.width,z);ctx.stroke();}
  ctx.fillStyle='#87a99b';for(const t of plan.tiles)if(sim.discovered.has(key(t.x,t.z)))ctx.fillRect(ox+(t.x*TILE-2)*scale,oz+(-t.z*TILE-2)*scale,TILE*scale-.5,TILE*scale-.5);
  if(sim.reservoirSeen){ctx.strokeStyle='#607f76';ctx.strokeRect(ox-64*scale,oz+122*scale,128*scale,164*scale);ctx.fillStyle='#87a99b';for(const [a,b,c,d] of plan.walkways)ctx.fillRect(ox+a*scale,oz-d*scale,(b-a)*scale,(d-c)*scale);ctx.fillStyle='#78958b';ctx.font='10px monospace';ctx.fillText('COLLECTION VOLUME',ox-57*scale,oz+150*scale);}
  ctx.fillStyle='#e8b777';for(const p of sim.beacons){ctx.beginPath();ctx.arc(ox+p[0]*scale,oz-p[2]*scale,2.5,0,Math.PI*2);ctx.fill();}
  ctx.strokeStyle='#e8b777';ctx.strokeRect(ox-5,oz-5,10,10);ctx.fillStyle='#a8baaf';ctx.font='10px monospace';ctx.fillText('SURFACE / 07',ox+10,oz+4);
  ctx.save();ctx.translate(ox+sim.pos[0]*scale,oz-sim.pos[2]*scale);ctx.rotate(-sim.yaw);ctx.fillStyle='#fff8da';ctx.beginPath();ctx.moveTo(0,7);ctx.lineTo(-4,-4);ctx.lineTo(4,-4);ctx.closePath();ctx.fill();ctx.restore();
  $('mapStats').textContent=`${sim.discovered.size} surveyed sections · ${sim.beacons.length} return beacons`;
}
function updateHUD(){
  $('zone').textContent=sim.zone;$('depth').innerHTML=`${sim.pos[1]>=0?'+':'−'}${Math.abs(sim.pos[1]).toFixed(1).padStart(5,'0')} <small>M</small>`;
  $('count').textContent=`${String(sim.recorded.size).padStart(2,'0')} / 03`;
  $('signal').textContent=sim.pos[1]>-2?'SUBSURFACE RETURN · UNCLASSIFIED':`LIVE CIRCUIT · ${Math.floor(sim.time/11)%2?'RETURN':'INTAKE'} CYCLE`;
  $('objective').textContent=sim.returned?'Survey returned · the structure continues beyond this sector':sim.recorded.size===3?'Bring the survey back to the surface':!sim.hatchOpen?'Investigate the surface hatch':sim.pos[1]>-2?'Step onto the platform · E to descend':!sim.recorded.has('intake')?'Record the live circuit near the shaft':!sim.recorded.has('archive')?'Survey the eastern service branches':'Follow the trunk drain into lower collection';
  const offer=sim.offer();$('prompt').hidden=!offer||!running||!$('mapPanel').hidden||!$('notesPanel').hidden;
  if(offer)$('prompt').innerHTML=`<b>E</b>${offer.text}`;
  if(!$('mapPanel').hidden)drawMap();
}
function render(){camera.position.set(sim.pos[0],sim.pos[1]+1.68,sim.pos[2]);camera.rotation.set(sim.pitch,sim.yaw,0);camera.updateMatrixWorld();visual.update(camera,0,sim.time,sim);engine.time=sim.time;renderer.render(engine);frame++;dirty=false;}
function loop(now){requestAnimationFrame(loop);if(document.hidden)return;const dt=Math.min((now-last)/1000,.1);if(now-last<1000/30)return;last=now;
  if(running&&$('mapPanel').hidden&&$('notesPanel').hidden){sim.step(dt,{forward:Number(keys.has('KeyW'))-Number(keys.has('KeyS')),strafe:Number(keys.has('KeyD'))-Number(keys.has('KeyA')),turn:Number(keys.has('ArrowLeft'))-Number(keys.has('ArrowRight')),look:Number(keys.has('ArrowUp'))-Number(keys.has('ArrowDown')),fast:keys.has('ShiftLeft')||keys.has('ShiftRight')});dirty=true;}
  if(dirty){updateHUD();render();}if(running&&now-lastSave>10000){save();lastSave=now;}}
// Explicitly opt-in diagnostics. No script runs in Dave's live sandbox tab.
if(params.has('test'))window.understructureTest={plan,sim,errors,get renderer(){return renderer;},get frame(){return frame;},render,save,pause,start,engine,visual};
try{resize();renderer=await DeferredRenderer.create(canvas,fail);engine.webgpu=renderer;$('start').disabled=false;$('start').innerHTML='Begin survey <span>↗</span>';updateHUD();render();last=performance.now();requestAnimationFrame(loop);}catch(e){fail(e);}
