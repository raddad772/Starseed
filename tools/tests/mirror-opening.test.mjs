import test from 'node:test';
import assert from 'node:assert/strict';
import { game } from './campaign-fixture.mjs';
import { Game } from '../../src/game.js';
import { provisionExpedition,seatExpeditionPlayer } from '../../src/campaign/newGame.js';
import { keepOutsideMirror,restoreMirror } from '../../src/campaign/mirrorScene.js';
import { captureFlight,restoreFlight } from '../../src/campaign/flight.js';
import { encodeCampaign,decodeCampaign } from '../../src/campaign/save.js';
import { finishIntroduction } from '../../src/campaign/tutorial.js';
import { prepareJourney } from '../../src/campaign/travel.js';

function opening(){const g=game();g.surfaceSurveys.planetSites={};g.placeInOrbit=Game.prototype.placeInOrbit;g.clampCargo=Game.prototype.clampCargo;g.beginLoading=()=>{};provisionExpedition(g,{rules:{flight:'easy'}});return g;}
test('mirror encloses every planetary apocentre; fleet and EVA start outside it',()=>{
 const g=opening(),radius=g.mirrorShell.radius;
 for(const b of g.system.bodies.filter(b=>b.kind==='planet'))assert.ok(radius>b.orbit.a*(1+b.orbit.e));
 for(const v of g.vessels)assert.ok(v.pos.length()>radius,v.name);
 assert.equal(g.startDir,null);assert.equal(g.players[0].mode,'eva');
});
test('closed mirror arrests inward ship and EVA motion while preserving tangential velocity',()=>{
 const g=opening(),s=g.ship,p=g.players[0],radius=g.mirrorShell.radius;
 s.pos.set(radius-50,0,0);s.vel.set(-12,3,4);p.ePos.set(radius-2,0,0);p.eVel.set(-8,2,5);
 keepOutsideMirror(g);
 assert.ok(s.pos.length()>radius+s.type.radius);assert.deepEqual(s.vel.toArray(),[0,3,4]);
 assert.ok(p.ePos.length()>radius);assert.deepEqual(p.eVel.toArray(),[0,2,5]);
});
test('EVA saves retain the mirror, boarding recall and unknown landing-site state',()=>{
 const g=opening(),saved=decodeCampaign(encodeCampaign(captureFlight(g,g.campaign))),h=game();
 restoreFlight(h,saved);h.campaign=saved;restoreMirror(h);
 assert.equal(h.startDir,null);assert.equal(h.players[0].mode,'eva');assert.ok(h.players[0].lastSeat.vessel===h.ship);
 assert.equal(h.mirrorShell.radius,g.mirrorShell.radius);
 h.seed='another-system';restoreMirror(h);assert.equal(h.mirrorShell,null);
});
test('returning to the mirror system arrives outside the enclosure',()=>{
 const g=opening();seatExpeditionPlayer(g,g.players[0]);g.campaign=finishIntroduction(g.campaign,'skipped');
 const saved=captureFlight(g,g.campaign),out=prepareJourney(saved,saved.generation.storyAnchors.receiver.systemId);
 const back=prepareJourney(out,`system/${g.campaign.generation.galaxySeed}`);
 for(const v of back.world.vessels){assert.equal(v.body,g.universe.star.id);assert.ok(Math.hypot(...v.pos)>g.mirrorShell.radius);}
 const roots=back.world.vessels.filter(v=>!v.parent);assert.ok(Math.hypot(...roots[0].pos.map((x,i)=>x-roots[1].pos[i]))<100000);
});
