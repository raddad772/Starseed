import test from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../../src/game.js';
import { game } from './campaign-fixture.mjs';
import { provisionExpedition,seatExpeditionPlayer } from '../../src/campaign/newGame.js';
import { advanceTutorial,finishIntroduction,tutorialIsActive } from '../../src/campaign/tutorial.js';
import { captureFlight,restoreFlight } from '../../src/campaign/flight.js';
import { encodeCampaign,decodeCampaign } from '../../src/campaign/save.js';
import { FlightSaves } from '../../src/campaign/session.js';
import { generateUnderstructure,DECK } from '../../src/understructure/layout.js';
import { UnderstructureSimulation } from '../../src/understructure/simulation.js';
import { SurfaceSurveys } from '../../src/understructure/integration.js';
import * as THREE from 'three';

function expedition(rules={flight:'easy'}){
 const g=game();g.surfaceSurveys.planetSites={};g.placeInOrbit=Game.prototype.placeInOrbit;g.clampCargo=Game.prototype.clampCargo;g.beginLoading=()=>{};
 provisionExpedition(g,{rules});return g;
}
for(const [flight,era,lead]of [['easy','horizon','neptune3'],['medium','expedition','hearth'],['hard','pioneer','nomad']])test(`${flight} creates only its selected fleet once, carries cargo and survives JSON restore`,()=>{
 const g=expedition({flight});assert.equal(g.ship.type.key,`${era}_${lead}`);assert.equal(g.players[0].vessel,g.ship);
 assert(g.vessels.every(v=>v.type.key.startsWith(era+'_')||['runabout','pod'].includes(v.type.key)));
 assert(g[era+'Fleet'].some(v=>v.cargo?.attached));const count=g.vessels.length;
 assert.throws(()=>provisionExpedition(g,{rules:{flight}}),/already/);assert.equal(g.vessels.length,count);
 g.campaign=finishIntroduction(g.campaign,'skipped');const p=g.addPlayer({});seatExpeditionPlayer(g,p);assert.equal(p.vessel,g.ship2);assert.equal(g.vessels.length,count);
 const saved=decodeCampaign(encodeCampaign(captureFlight(g,g.campaign))),h=game();restoreFlight(h,saved,{inputForPlayer:()=>({})});
 assert.equal(h.vessels.length,count);assert.equal(h.players[1].vessel,h.ship2);assert.equal(saved.story.intro.tutorial.step,'ready');
});
test('tutorial gates use actual targeting, relative displacement, braking and continuous stable scan time',()=>{
 const t=expedition().campaign.story.intro.tutorial;t.step='target';
 const m={targeted:false,offset:[0,0,1200],range:1200,relativeSpeed:0};advanceTutorial(t,m,.1);assert.equal(t.step,'target');
 m.targeted=true;advanceTutorial(t,m,.1);assert.equal(t.step,'translate');advanceTutorial(t,m,.1);assert.equal(t.step,'translate');
 m.offset[2]+=15;m.relativeSpeed=4;advanceTutorial(t,m,.1);assert.equal(t.step,'brake');advanceTutorial(t,m,.1);assert.equal(t.step,'brake');
 m.relativeSpeed=1;advanceTutorial(t,m,.1);assert.equal(t.step,'scan');for(let i=0;i<40;i++)advanceTutorial(t,m,.1);assert.equal(t.step,'scan');
 t.scanning=true;for(let i=0;i<10;i++)advanceTutorial(t,m,.1);m.relativeSpeed=4;advanceTutorial(t,m,.1);assert.equal(t.scanSeconds,0);
 m.relativeSpeed=1;for(let i=0;i<21;i++)advanceTutorial(t,m,.1);assert.equal(t.step,'anomaly');
});
test('played and skipped intros have the same canonical story, destination and fleet without duplicate rewards',()=>{
 const g=expedition(),base=captureFlight(g,g.campaign),played=finishIntroduction(base,'played'),skipped=finishIntroduction(base,'skipped');
 for(const key of ['facts','quests','journal','appliedOneTimeEffects'])assert.deepEqual(played.story[key],skipped.story[key]);
 assert.deepEqual(played.fleet,skipped.fleet);assert.deepEqual(played.world,skipped.world);assert.deepEqual(finishIntroduction(played,'skipped'),played);
 assert.equal(decodeCampaign(encodeCampaign(skipped)).story.intro.tutorial.step,'ready');
});
test('mid-lesson saves retain scan/probe progress and reject inconsistent checkpoints',()=>{
 const g=expedition(),t=g.campaign.story.intro.tutorial;t.step='scan';t.scanning=true;t.scanSeconds=.75;
 const c=decodeCampaign(encodeCampaign(captureFlight(g,g.campaign)));assert.equal(c.story.intro.tutorial.scanSeconds,.75);
 for(const mutate of [s=>s.story.intro.tutorial.step='ready',s=>s.story.intro.tutorial.referenceId='missing',s=>s.story.intro.tutorial.probes=[0,0],s=>s.story.intro.tutorial.scanSeconds=-1]){const bad=structuredClone(c);mutate(bad);assert.throws(()=>encodeCampaign(bad));}
});
test('the tutorial blocks joining until completed and restores legacy player two as away crew',()=>{
 const g=expedition({flight:'medium'});let disposed=false;
 assert.equal(tutorialIsActive(g.campaign),true);
 assert.equal(Game.prototype.joinPlayer.call(g,{dispose(){disposed=true;}}),null);assert.equal(disposed,true);assert.equal(g.players.length,1);
 // An older tutorial snapshot can still contain an active second player.
 const p=g.addPlayer({});seatExpeditionPlayer(g,p);const held=g.items.create('mug',p);
 const saved=decodeCampaign(encodeCampaign(captureFlight(g,g.campaign))),h=game();let inputs=0;
 restoreFlight(h,saved,{inputForPlayer:()=>{inputs++;return {};}});
 assert.equal(inputs,0);assert.equal(h.players.length,1);assert.equal(h.awayPlayers[1].ownShip,h.ship2);assert.equal(h.items.list.find(i=>i.id===held.id).holder,h.awayPlayers[1]);
 h.campaign=saved;const solo=captureFlight(h,h.campaign);assert.equal(solo.players[1].active,false);
 h.campaign=finishIntroduction(h.campaign,'skipped');assert.equal(tutorialIsActive(h.campaign),false);
 h.setCur=()=>{};const rejoined=Game.prototype.joinPlayer.call(h,{});assert.equal(rejoined.vessel,h.ship2);assert.equal(h.players.length,2);
});
test('a story checkpoint during an asynchronous save survives and schedules the next revision',async()=>{
 const g=expedition();let finish;const saves=new FlightSaves({game:()=>g,load(){},storage:{save:async c=>{await new Promise(r=>finish=r);return {...c,revision:1,savedAt:new Date().toISOString()};}}});
 const pending=saves.save();g.campaign=finishIntroduction(g.campaign,'skipped');saves.checkpoint();finish();await pending;
 assert.equal(g.campaign.story.intro.status,'complete');assert.equal(g.campaign.revision,1);assert.equal(saves.nextAuto,0);
});
test('campaign recovery and a close flagship approach do not use legacy carrier berths',()=>{
 const g=expedition({flight:'medium'});g.setWarp=()=>{};g.campaign=finishIntroduction(g.campaign,'skipped');
 g.ship.pos.copy(g.carrier.pos);assert.doesNotThrow(()=>Game.prototype.berthYachtIfHome.call(g));
 g.ship.dead=true;g.ship.hull=0;g.ship.hullTemp=3000;g.respawnCampaign();assert.equal(g.ship.dead,false);assert.equal(g.ship.hull,1);assert.equal(g.ship.hullTemp,290);assert.equal(g.players[0].vessel,g.ship);
 g.ship.assist=2;g.ship.refVessel=g.carrier;g.ship.targetFrame='vessel:'+g.carrier.name;
 assert.equal(decodeCampaign(encodeCampaign(captureFlight(g,g.campaign))).world.vessels.find(v=>v.id===g.ship.campaignId).refVessel,g.carrier.campaignId);
});
test('new-game and story checkpoints save while paused without enabling periodic paused autosaves',async()=>{
 const g=expedition();g.launched=true;g.paused=true;let writes=0;
 const saves=new FlightSaves({game:()=>g,load(){},storage:{save:async c=>({...c,revision:++writes})}});
 saves.nextAuto=0;saves.tick(1);assert.equal(writes,0);saves.checkpoint();saves.tick(1);await saves.pending;assert.equal(writes,1);
 saves.nextAuto=0;saves.tick(2);assert.equal(writes,1);
});
test('assisted traversal allows bounded platform lift while standard traversal retains ballistic jumps',()=>{
 const plan=generateUnderstructure('NEW-THEMES','gravity'),a=new UnderstructureSimulation(plan),b=new UnderstructureSimulation(plan);
 a.assistedTraversal=true;a.pos=[84,DECK,-100];b.pos=[84,DECK,-100];
 for(let i=0;i<600;i++){a.step(.01,{vertical:1});b.step(.01,{vertical:1});}
 assert(a.pos[1]>DECK+5);assert.equal(b.pos[1],DECK);assert(a.pos[1]+1.9<=a.chamber.ceiling+.001);
 a.pos=[0,DECK,-20];assert.equal(a.jetpackEnabled,false);
});
test('survey discoveries hide distant access markers and remain revealed across portable storage copies',()=>{
 const g=expedition({exploration:'survey'}),p=g.players[0];p.mode='surface';p.body=g.startBody;p.fPos.set(100,0,0);
 const site={saveKey:'test-site',body:g.startBody,frame:{position:new THREE.Vector3(),rotation:new THREE.Quaternion()},marker:new THREE.Object3D()};
 const surveys={game:g,sites:[site],revealed:SurfaceSurveys.prototype.revealed};const draw=()=>SurfaceSurveys.prototype.render.call(surveys,new THREE.Vector3());
 draw();assert.equal(site.marker.visible,false);g.campaign.rules.exploration='guided';draw();assert.equal(site.marker.visible,true);
 g.campaign.rules.exploration='survey';p.fPos.set(10,0,0);draw();assert.equal(site.marker.visible,true);p.fPos.set(100,0,0);draw();assert.equal(site.marker.visible,true);
 const copy=JSON.parse(JSON.stringify(g.campaignStorage.snapshot()));assert.equal(copy['starseed.survey.reveal.test-site'],'true');
});
