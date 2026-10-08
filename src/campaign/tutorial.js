// Saved tutorial state contains evidence and checkpoints, never input bindings or timers from wall time.
import { applyCampaignEvent } from './state.js';
import { pinReceiver } from './galaxy.js';

export const INTRO_STEPS = ['welcome','target','translate','brake','scan','anomaly','crossing','closed','analysis','ready'];
export const INTRO_COPY = {
  welcome: ['A home you bring along', 'Your expedition has spent years studying the enormous black hole and a nearby system enclosed by a perfect mirror. Before the next survey, get comfortable with your craft. There is no hurry.', 'Begin flight practice'],
  target: ['Find the survey reference', 'Select the survey reference craft: Tab cycles targets, or use the button below. On a controller, aim at its marker and press RB.', 'Select survey reference'],
  translate: ['A small change in velocity', 'W/S translates forward/back, A/D sideways and Space/C vertically. On a controller, use the left stick; H or R3 shows the full layout. Move at least 12 m relative to the reference craft. Light inputs are enough.', 'Use navigation assistance'],
  brake: ['Match velocity', 'Apply a short opposite burn to reduce drift: A if you moved with D, S if you used W. Settle below 2 m/s relative speed. ROT assistance lets you coast; X braking belongs to FULL assistance and its current reference frame. Enter lets the nav computer help match the reference craft.', 'Match with navigation'],
  scan: ['Take a baseline reading', 'Keep within 1.8 km of the reference and below 3 m/s relative speed for a two-second calibration. Then open the live survey telemetry from the mirror. You can fly manually or use the nav computer.', 'Start calibration'],
  anomaly: ['An unexpected return', 'Daughter: “I’m getting something here.” A patch of the mirror no longer matches the reflected sky. You: “Hold there. Let’s get a second baseline.” The survey feed shows an opening. Daughter: “There’s room. I can take a look.” You: “No. Stay outside. Wait for me.”', 'Follow the survey feed'],
  crossing: ['The opening', 'She chooses to cross. “I’m through. There’s—” The transponder disappears as the mirror closes. The probes keep recording. The crew is already working to recover the last telemetry.', null],
  closed: ['A signal to follow', 'Your calls receive no answer, but the crew has found another transmission. Analyst: “It wasn’t hers. The probes caught an outgoing burst.” Bring the three recordings together. There is no survival timer; the expedition will find a way forward.', 'Analyse the recordings'],
  analysis: ['Reconstruct the bearing', 'Compare the three probe recordings below. Their timestamps have been corrected for light-travel time. Together they identify a nearby system that may have been the intended receiver.', null],
  ready: ['The expedition is ready', 'The first destination and the evidence are in your Story Log. You can practise, explore and prepare at your own pace. Your family’s story leads toward reunion.', 'Open Story Log']
};

export function createTutorial(referenceId) {
  return {version:1,step:'welcome',referenceId,elapsed:0,scanSeconds:0,scanning:false,origin:null,probes:[]};
}
export const tutorialIsActive = campaign => !!campaign?.story.intro.tutorial && campaign.story.intro.status !== 'complete';
export function validateTutorial(t, campaign) {
  if(!t || t.version!==1 || !INTRO_STEPS.includes(t.step) || typeof t.referenceId!=='string' || !t.referenceId || !Number.isFinite(t.elapsed) || t.elapsed<0 || !Number.isFinite(t.scanSeconds) || t.scanSeconds<0 || typeof t.scanning!=='boolean' || (t.origin!==null&&(!Array.isArray(t.origin)||t.origin.length!==3||!t.origin.every(Number.isFinite))) || !Array.isArray(t.probes) || new Set(t.probes).size!==t.probes.length || t.probes.some(p=>![0,1,2].includes(p))) throw Error('Invalid tutorial checkpoint.');
  if(campaign?.world&&!campaign.world.vessels.some(v=>v.id===t.referenceId))throw Error('Tutorial reference craft is missing.');
  if(t.elapsed>7.1||t.scanSeconds>2.1)throw Error('Invalid tutorial progress.');
  if(campaign?.world&&(!campaign.world.aliases.ship2||campaign.world.aliases.ship2===campaign.world.aliases.ship))throw Error('Tutorial needs both assigned expedition craft.');
  if(campaign && ((t.step==='ready') !== (campaign.story.intro.status==='complete')))throw Error('Tutorial and story checkpoints disagree.');
}
export function advanceTutorial(t, measurements, dt) {
  if(!Number.isFinite(dt)||dt<0)return false;
  const before=t.step;
  if(t.step==='target'&&measurements.targeted){t.step='translate';t.origin=[...measurements.offset];}
  else if(t.step==='translate'&&t.origin&&Math.hypot(...measurements.offset.map((v,i)=>v-t.origin[i]))>=12)t.step='brake';
  else if(t.step==='brake'&&measurements.relativeSpeed<2)t.step='scan';
  else if(t.step==='scan'&&t.scanning){
    t.scanSeconds=measurements.range<=1800&&measurements.relativeSpeed<3?t.scanSeconds+Math.min(dt,.1):0;
    if(t.scanSeconds>=2){t.step='anomaly';t.scanning=false;}
  } else if(t.step==='crossing'){t.elapsed+=Math.min(dt,.1);if(t.elapsed>=7)t.step='closed';}
  return before!==t.step;
}
export function finishIntroduction(campaign,presentation) {
  if(campaign.story.intro.status==='complete'&&campaign.story.facts.destinationIdentified)return campaign;
  let c=applyCampaignEvent(campaign,{id:'intro/incident',type:'intro.completed',presentation});
  const receiver=pinReceiver(c);
  c.generation.storyAnchors.receiver=receiver;
  c=applyCampaignEvent(c,{id:'intro/bearing',type:'signal.bearingResolved',systemId:receiver.systemId});
  if(c.story.intro.tutorial)c.story.intro.tutorial={...c.story.intro.tutorial,step:'ready',scanning:false};
  return c;
}
