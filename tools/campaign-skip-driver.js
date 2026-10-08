import { CampaignStorage } from '../src/campaign/storage.js';
const checks=[],check=(ok,label)=>{if(!ok)throw Error(label);checks.push(label);};
const report=data=>parent.postMessage({type:'campaign-intro-test',report:{...data,checks}},location.origin);
const wait=async fn=>{const end=performance.now()+45000;while(!fn()){if(performance.now()>end)throw Error('New expedition timed out');await new Promise(r=>setTimeout(r,50));}};
let storage;
try{
 await wait(()=>window.flightSaves&&document.querySelector('.openingTitle'));window.debugHold=true;
 storage=new CampaignStorage({name:'starseed-skip-test-'+crypto.randomUUID()});window.flightSaves.storage=storage;
 document.querySelector('.openingTitle .primary').click();
 let form=document.querySelector('.expeditionSetup');form.elements.intro.value='skip';form.requestSubmit();
 await wait(()=>window.game?.launched);let g=window.game;
 await window.debugRun(12000,16,(n,gm)=>gm.state!=='playing'||n<3);
 check(g.ship.type.key==='horizon_neptune3'&&g.vessels.length===g.horizonFleet.length+1,'Easy creates Horizon and its carried craft exactly once');
 check(g.campaign.story.intro.presentation==='skipped'&&g.campaign.story.journal.length===4,'Skipping from setup records the incident, first lead and basics');
 window.flightSaves.tick(performance.now());await window.flightSaves.pending;
 check(g.campaign.revision===1&&!g.paused,'Initial checkpoint saves and play starts directly');
 window.joinP2(99);const oldId=g.campaign.campaignId;window.openNewExpedition();
 form=document.querySelector('.expeditionSetup');form.elements.flight.value='hard';form.elements.intro.value='skip';form.requestSubmit();
 await wait(()=>window.game!==g&&window.game?.launched);g=window.game;
 check(g.ship.type.key==='pioneer_nomad'&&g.players.length===1,'A new expedition starts solo even when the previous expedition had two players');
 check(g.campaign.story.intro.presentation==='skipped','Setup skip completes immediately without co-op consent');
 window.joinP2(99);check(g.players.length===2&&g.players[1].vessel===g.ship2,'Multiplayer is available immediately after skipping');
 await window.debugRun(12000,16,(n,gm)=>gm.state!=='playing'||n<3);window.flightSaves.tick(performance.now());await window.flightSaves.pending;
 window.openNewExpedition();form=document.querySelector('.expeditionSetup');form.elements.flight.value='hard';form.elements.intro.value='play';form.requestSubmit();
 await wait(()=>window.game!==g&&window.game?.launched);g=window.game;
 check(g.players.length===1&&g.intro.active,'Starting the playable introduction from co-op is solo');
 window.joinP2(99);check(g.players.length===1,'Player two remains blocked during the playable introduction');
 g.intro.act('skip');window.joinP2(99);check(g.players.length===2&&!g.intro.active,'Skipping from the tutorial unlocks multiplayer');
 await window.debugRun(12000,16,(n,gm)=>gm.state!=='playing'||n<3);window.flightSaves.tick(performance.now());await window.flightSaves.pending;
 const slots=await storage.list();check(slots.length===3&&slots.some(s=>s.id===oldId),'New expedition leaves the previous save slot intact');
 const gpu=g.engine.webgpu;gpu.device.pushErrorScope('validation');for(let i=0;i<3;i++){g.frame(performance.now());await gpu.device.queue.onSubmittedWorkDone();}const error=await gpu.device.popErrorScope();check(!error,error?.message||'Pioneer split-screen renders without WebGPU validation errors');
 check(!document.querySelector('#errorLine:not([hidden])'),'Skip and fleet replacement raise no runtime errors');
 report({stage:'Passed',mode:'skip',vessels:g.vessels.length});
}catch(error){report({stage:'Failed',error:error.stack||String(error),status:document.querySelector('.expeditionSetup [role=status]')?.textContent});}
finally{window.debugHold=true;if(storage){await storage.close();indexedDB.deleteDatabase(storage.name);}}
