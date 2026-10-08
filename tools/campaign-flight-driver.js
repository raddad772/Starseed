import * as THREE from 'three';
import * as tk from './testkit.js';
import { CampaignStorage } from '../src/campaign/storage.js';
import { createCampaign } from '../src/campaign/state.js';
import { bindSiteStorage,CampaignSiteStorage } from '../src/campaign/siteStorage.js';
import { encodeCampaign,decodeCampaign } from '../src/campaign/save.js';
const checks=[],check=(ok,label)=>{if(!ok)throw Error(label);checks.push(label);};
const report=data=>parent.postMessage({type:'campaign-flight-test',report:{...data,checks}},location.origin);
let storage;
try{
 await tk.ready(50000);let g=window.game;window.debugHold=true;g.paused=true;
 await g.engine.webgpuReady;
 const s=g.ship,b=s.body;if(s.parent)s.leaveParent();g.placeInOrbit(s,b,Math.max(50000,b.atmHeight*2),.6);s.assist=1;g.players[0].sitDown(0,s);s.hull=.61;s.hullTemp=612;
 window.joinP2(99);const p2=g.players[1];p2.sitDown(0,g.carrier);p2.body=g.carrier.body;
 const loose=g.items.heldBy(g.players[0])[0];g.items.place(loose,'vessel',g.ship,new THREE.Vector3(0,.2,0),new THREE.Quaternion());
 g.campaign=createCampaign({seed:g.seed,label:'Native restore test'});bindSiteStorage(g,new CampaignSiteStorage());
 const saves=window.flightSaves;storage=new CampaignStorage({name:'starseed-flight-test-'+crypto.randomUUID()});saves.storage=storage;
 const before=await saves.save(),n=g.vessels.length,t=g.t;check(before.saveKind==='single-system-flight','Live flight saves as portable JSON');check(before.players.length===2,'Both player records captured');
 check(before.world.vessels.length===n,'All vessels and attached deck frames captured');check(before.world.items.length===g.items.list.length,'Inventory registry captured once');
 const json=saves.exportJSON();check(decodeCampaign(json).world.seed==='SOL','Full save export validates');
 const bad=JSON.parse(json);bad.world.vessels[0].parent='missing';let rejected=false;try{await saves.import(JSON.stringify(bad));}catch{rejected=true;}check(rejected&&window.game===g,'Invalid import leaves the current game intact');
 const id=before.campaignId;s.hull=1;g.t+=1000;
 await saves.load(id);g=window.game;check(g.t===t,'Load restores the saved epoch without offline advancement');check(g!==s.game,'Load reconstructs a fresh game');
 check(g.vessels.length===n,'Load does not duplicate starter ships or attached frames');check(g.ship.hull===.61&&g.ship.hullTemp===612,'Hull damage and heat survive load');
 check(g.players.length===2&&g.players[1].vessel===g.carrier,'Both players return to their saved vessels');check(g.items.list.find(it=>it.id===loose.id).vessel===g.ship,'Loose cargo retains its vessel frame');check(g.warpIndex===0&&g.players.every(p=>p.warpRequestIndex===0),'Restore resets shared time consent');
 check(g.tender.turnovers.every(s=>s.frame.frameState===s&&s.frame.parent===g.tender),'Gravity turnover links restored');check(!document.querySelector('#fatal'),'Renderer reinitializes successfully');
 const gpu=g.engine.webgpu;gpu.device.pushErrorScope('validation');
 for(let i=0;i<5;i++){g.frame(performance.now());await gpu.device.queue.onSubmittedWorkDone();}
 const error=await gpu.device.popErrorScope();check(!error,error?.message||'Restored split-screen WebGPU frame validates');
 await window.debugRun(12000,16,(n,gm)=>gm.state!=='playing'||n<3);check(g.state==='playing','Restored terrain completes its normal loading gate');g.paused=true;await saves.save();check(g.campaign.revision===2,'Restored slot saves its next revision');
 window.pauseScreen.show('expedition');check(document.querySelector('[data-ptab="expedition"]').textContent==='Expedition','Pause menu exposes Expedition saves and Story Log');
 report({stage:'Passed',vessels:n,bytes:new TextEncoder().encode(json).length,time:t});
}catch(error){report({stage:'Failed',error:error.stack||String(error),cargo:window.game?.vessels.filter(v=>v.cargo).map(v=>({host:v.name,cargo:v.cargo.name,parent:v.cargo.parent?.name,attached:v.cargo.attached}))});}
finally{window.debugHold=true;if(storage){await storage.close();indexedDB.deleteDatabase(storage.name);}}
