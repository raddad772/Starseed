import { CampaignStorage } from '../src/campaign/storage.js';
import { encodeCampaign,decodeCampaign } from '../src/campaign/save.js';
const checks=[],check=(ok,label)=>{if(!ok)throw Error(label);checks.push(label);};
const report=data=>parent.postMessage({type:'campaign-intro-test',report:{...data,checks}},location.origin);
const wait=async(fn,seconds=30)=>{const end=performance.now()+seconds*1000;while(!fn()){if(performance.now()>end)throw Error('Timed out waiting for setup');await new Promise(r=>setTimeout(r,50));}};
let storage;
try{
 await wait(()=>window.flightSaves&&document.querySelector('.openingTitle'));window.debugHold=true;
 check(window.game.players[0].mode==='eva'&&!!window.game.mirrorShell,'First run shows EVA beside the craft and the system-sized mirror');
 check(!window.game.launched&&window.game.campaign.revision===0,'Title preview does not begin or autosave the story');
 check([...document.querySelectorAll('.openingTitle button')].some(b=>b.textContent==='Free exploration'),'Free exploration is offered separately');
 storage=new CampaignStorage({name:'starseed-intro-test-'+crypto.randomUUID()});window.flightSaves.storage=storage;
 document.querySelector('.openingTitle .primary').click();
 const form=document.querySelector('.expeditionSetup');form.elements.label.value='Our hopeful expedition';form.elements.flight.value='medium';form.elements.exploration.value='survey';form.elements.puzzles.value='assisted';form.requestSubmit();
 await wait(()=>window.game?.launched);let g=window.game;await window.debugRun(12000,16,(n,gm)=>gm.state!=='playing'||n<4);
 check(g.state==='playing'&&g.fleetEra==='expedition','Medium choice launches the Expedition fleet through normal loading');
 check(g.vessels.length===8&&g.ship.type.key==='expedition_hearth','Only the selected fleet and survey reference are provisioned');
 check(g.campaign.rules.exploration==='survey'&&g.campaign.rules.puzzles==='assisted','Independent exploration and traversal choices persist');
 check(g.players[0].mode==='eva'&&g.intro.state.step==='welcome'&&!g.paused,'Start game enters the daughter’s invitation on EVA');
 check(!g.worldSims||g.worldSims.status.size===0,'The mirror opening requests no planetary history simulation');
 window.joinP2(99);check(g.players.length===1&&g.vessels.length===8,'Second controller cannot join during the tutorial');
 window.pauseScreen.show('settings');check(document.querySelector('#p2Join').disabled,'Settings explains and enforces the single-player introduction');window.pauseScreen.show('expedition');
 g.intro.act();check(g.players[0].flying,'Boarding reaches the real pilot seat');g.intro.act();window.pauseScreen.hide();g.paused=false;
 await window.debugRun(80);check(g.intro.state.step==='translate','Target selection advances the live lesson');
 // Move the real craft through flight controls, not a synthetic tutorial event.
 g.players[0].input.keys.add('KeyD');await window.debugRun(16000,16,()=>g.intro.state.step==='translate');g.players[0].input.keys.delete('KeyD');
 check(['brake','scan'].includes(g.intro.state.step),'Physical translation satisfies the movement lesson');
 g.players[0].input.keys.add('KeyA');await window.debugRun(12000,16,()=>g.intro.state.step!=='scan');g.players[0].input.keys.delete('KeyA');check(g.intro.state.step==='scan','Opposite thrust advances the relative-speed lesson');
 g.intro.act();await window.debugRun(800);g.paused=true;
 const scan=g.intro.state.scanSeconds;check(scan>0&&scan<2,'Scan records partial progress only while stable');
 const saved=await window.flightSaves.save();await window.flightSaves.load(saved.campaignId);g=window.game;
 check(g.intro.state.step==='scan'&&g.intro.state.scanSeconds===scan,'Loading resumes the exact tutorial checkpoint');
 check(!!g.mirrorShell&&g.players[0].body.isStar,'The physical mirror and exterior stellar frame survive JSON restore');
 check(g.players.length===1,'Mid-tutorial reload stays single-player');
 await window.debugRun(12000,16,(n,gm)=>gm.state!=='playing'||n<3);window.pauseScreen.hide();g.paused=false;
 await window.debugRun(1800);check(g.intro.state.step==='anomaly','Stable scanning completes after resume');
 g.intro.act();await window.debugRun(7600);check(g.intro.state.step==='closed','Timed survey incident finishes without disabling flight');
 g.intro.act();g.intro.probe(0);g.intro.probe(1);check(g.campaign.story.intro.status==='pending','Incomplete probe evidence cannot finish the introduction');g.intro.probe(2);
 check(g.campaign.story.intro.presentation==='played'&&g.campaign.story.quests['quest/first-receiver'].step==='travel-to-receiver','Three observations record the incident and first destination');
 window.joinP2(99);check(g.players.length===2&&g.players[1].vessel===g.ship2,'Multiplayer unlocks after the played introduction without adding a craft');
 const json=encodeCampaign(window.flightSaves.snapshot());check(decodeCampaign(json).story.journal.length===4,'Completed intro and Story Log survive portable JSON');
 const gpu=g.engine.webgpu;gpu.device.pushErrorScope('validation');for(let i=0;i<3;i++){g.frame(performance.now());await gpu.device.queue.onSubmittedWorkDone();}const error=await gpu.device.popErrorScope();check(!error,error?.message||'Tutorial split-screen renders without WebGPU validation errors');
 window.pauseScreen.show('expedition');check(document.querySelector('.storyLog').textContent.includes('The survey tender'),'Pause page exposes the completed story and basics');
 check(!document.querySelector('#errorLine:not([hidden])'),'No uncaught runtime error surfaced');
 report({stage:'Passed',bytes:new TextEncoder().encode(json).length,vessels:g.vessels.length});
}catch(error){report({stage:'Failed',error:error.stack||String(error),step:window.game?.intro?.state.step,status:document.querySelector('.expeditionSetup [role=status]')?.textContent});}
finally{window.debugHold=true;if(storage){await storage.close();indexedDB.deleteDatabase(storage.name);}}
