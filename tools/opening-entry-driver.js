const checks=[],check=(ok,label)=>{if(!ok)throw Error(label);checks.push(label);};
const wait=async fn=>{const end=performance.now()+45000;while(!fn()){if(performance.now()>end)throw Error('Entry flow timed out');await new Promise(r=>setTimeout(r,50));}};
const button=text=>[...document.querySelectorAll('button')].find(b=>b.textContent===text);
try{
 await wait(()=>window.flightSaves&&document.querySelector('.openingTitle'));window.debugHold=true;
 let g=window.game;await g.engine.webgpuReady;
 check(g.players[0].mode==='eva'&&!g.launched,'The main menu starts outside the craft before the story');
 check(g.seed!=='SOL'&&g.mirrorShell.radius>0,'The story opens at its mirrored system, not Earth');
 check(!g.worldSims||g.worldSims.status.size===0,'Preview never queues detailed world simulation');
 const previewId=g.campaign.campaignId;
 button('Free exploration').click();g=window.game;
 check(!document.querySelector('#briefing').hidden&&!g.campaign,'Free exploration exposes the existing world picker without creating a story');
 check(g.placed&&g.players[0].mode==='eva'&&g.startDir===null,'Orbital preview is placed before a surface survey');
 document.querySelector('[data-st=custom]').click();
 check(!document.querySelector('#worldPick').hidden&&document.querySelectorAll('[data-world]').length>0,'Choose a world lists planets and moons');
 button('Main menu').click();g=window.game;
 check(!!document.querySelector('.openingTitle')&&g.campaign.campaignId!==previewId,'Main menu restores the mirrored EVA preview');
 await g.engine.webgpuReady;const gpu=g.engine.webgpu;gpu.device.pushErrorScope('validation');
 await window.debugRun(5000,16,(n,gm)=>gm.state!=='playing'||n<5);
 check(g.engine.mirrorShell?.height>0,'Native reflection pass receives positive metre-scale exterior altitude');
 const error=await gpu.device.popErrorScope();check(!error,error?.message||'Mirror renders without WebGPU validation errors');
 check(!document.querySelector('#errorLine:not([hidden])'),'Entry flow raises no uncaught runtime errors');
 parent.postMessage({type:'opening-entry',report:{stage:'Passed',checks}},location.origin);
}catch(error){parent.postMessage({type:'opening-entry',report:{stage:'Failed',checks,error:error.stack||String(error)}},location.origin);}
finally{window.debugHold=true;}
