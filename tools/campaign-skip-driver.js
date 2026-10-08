import { CampaignStorage } from '../src/campaign/storage.js';
const checks=[],check=(ok,label)=>{if(!ok)throw Error(label);checks.push(label);};
const report=data=>parent.postMessage({type:'campaign-intro-test',report:{...data,checks}},location.origin);
const wait=async fn=>{const end=performance.now()+45000;while(!fn()){if(performance.now()>end)throw Error('New expedition timed out');await new Promise(r=>setTimeout(r,50));}};
let storage;
try{
 await wait(()=>window.flightSaves&&document.querySelector('.expeditionSetup'));window.debugHold=true;
 storage=new CampaignStorage({name:'starseed-skip-test-'+crypto.randomUUID()});window.flightSaves.storage=storage;
 let form=document.querySelector('.expeditionSetup');form.elements.seed.value='SOL';form.elements.intro.value='skip';form.requestSubmit();
 await wait(()=>window.game?.launched);let g=window.game;
 await window.debugRun(12000,16,(n,gm)=>gm.state!=='playing'||n<3);
 check(g.ship.type.key==='horizon_neptune3'&&g.vessels.length===g.horizonFleet.length+1,'Easy creates Horizon and its carried craft exactly once');
 check(g.campaign.story.intro.presentation==='skipped'&&g.campaign.story.journal.length===4,'Skipping from setup records the incident, first lead and basics');
 window.flightSaves.tick(performance.now());await window.flightSaves.pending;
 check(g.campaign.revision===1&&g.paused,'Initial checkpoint saves while the briefing is paused');
 window.joinP2(99);const oldId=g.campaign.campaignId;window.openNewExpedition();
 form=document.querySelector('.expeditionSetup');form.elements.flight.value='hard';form.elements.intro.value='skip';form.requestSubmit();
 await wait(()=>window.game!==g&&window.game?.launched);g=window.game;
 check(g.ship.type.key==='pioneer_nomad'&&g.players.length===2,'Starting another expedition provisions Pioneer and retains the second controller');
 check(g.intro.consent.pending&&g.campaign.story.intro.status==='pending','Setup skip waits for the other active player');
 g.players[1].input.padRouter({hits:new Set(['B']),held:new Set(),lx:0,ly:0,lt:0,rt:0},.016);
 check(!g.intro.consent.pending&&g.campaign.story.intro.status==='pending','Player two can cancel skip through the real controller route');
 g.intro.vote(0);g.players[1].input.padRouter({hits:new Set(['A']),held:new Set(),lx:0,ly:0,lt:0,rt:0},.016);
 check(g.campaign.story.intro.presentation==='skipped'&&document.querySelector('.storyLog').textContent.includes('The survey tender'),'Controller agreement completes the shared intro and refreshes the log');
 await window.debugRun(12000,16,(n,gm)=>gm.state!=='playing'||n<3);window.flightSaves.tick(performance.now());await window.flightSaves.pending;
 const slots=await storage.list();check(slots.length===2&&slots.some(s=>s.id===oldId),'New expedition leaves the previous save slot intact');
 const gpu=g.engine.webgpu;gpu.device.pushErrorScope('validation');for(let i=0;i<3;i++){g.frame(performance.now());await gpu.device.queue.onSubmittedWorkDone();}const error=await gpu.device.popErrorScope();check(!error,error?.message||'Pioneer split-screen renders without WebGPU validation errors');
 check(!document.querySelector('#errorLine:not([hidden])'),'Skip and fleet replacement raise no runtime errors');
 report({stage:'Passed',mode:'skip',vessels:g.vessels.length});
}catch(error){report({stage:'Failed',error:error.stack||String(error),status:document.querySelector('.expeditionSetup [role=status]')?.textContent});}
finally{window.debugHold=true;if(storage){await storage.close();indexedDB.deleteDatabase(storage.name);}}
