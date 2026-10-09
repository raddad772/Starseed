import * as THREE from 'three';
import { parkEra } from '../sim/eraFleets.js';
import { pilotSeat } from '../sim/vesselTypes.js';
import { createCampaign } from './state.js';
import { CampaignSiteStorage,bindSiteStorage } from './siteStorage.js';
import { createTutorial } from './tutorial.js';
import { placeMirrorFleet,placeOutsideCraft,syncChildren,parkAtBase,OPENING_HEIGHT } from './mirrorScene.js';
import { CAST } from './lines.js';

const LEADS={horizon:'horizon_neptune3',expedition:'expedition_hearth',pioneer:'pioneer_nomad'};
const SECOND={horizon:'horizon_shorebird',expedition:'expedition_kestrel',pioneer:'pioneer_hopper'};

export function provisionExpedition(g,{rules,label='Our expedition',campaign}){
  if(g.campaign?.fleet.provisioned)throw Error('This expedition already has its fleet.');
  const c=campaign||createCampaign({seed:g.seed,label,rules,simulationSeconds:g.t});
  g.campaign=c;bindSiteStorage(g,new CampaignSiteStorage());
  g.startDir=new THREE.Vector3(1,0,0);g.respawnInfo={body:g.startBody,dir:g.startDir.clone()};
  g.fleetEra=c.rules.startingFleetEra;
  // Existing era factories use a positioning reference, not the legacy carrier's equipment.
  g.carrier=g.ship;g.ship.body=g.startBody;
  const starters=[...g.vessels],fleet=parkEra(g,g.fleetEra),lead=fleet.find(v=>v.type.key===LEADS[g.fleetEra]);
  for(const v of starters)g.removeVessel(v);
  g.ship=g.yacht=lead;g.carrier=fleet[0];g.tender=null;g.wayfarer=null;
  g.ship2=fleet.find(v=>v.type.key===SECOND[g.fleetEra]);
  for(const v of g.vessels)v.campaignId=crypto.randomUUID();
  // (your daughter's craft, out on the survey: the lesson's reference and the one that will cross)
  const reference=g.addVessel('pod',`${CAST.daughter}'s tender`,'SURVEY-01');reference.campaignId=crypto.randomUUID();
  placeMirrorFleet(g,reference);
  const forward=new THREE.Vector3(0,0,-1).applyQuaternion(reference.quat);
  // Place the active training craft together, clear of the large research vessels.
  placeTrainingCraft(g,lead,reference,forward,-1200,0);
  placeTrainingCraft(g,g.ship2,reference,forward,-1200,200);
  parkAtBase(g,[reference,lead]);
  c.story.intro.tutorial=createTutorial(reference.campaignId);
  c.fleet={provisioned:true,vesselIds:g.vessels.map(v=>v.campaignId)};
  g.placed=true;g.startChoice='expedition';g.startPending=null;
  installCampaignJoin(g);
  placeOutsideCraft(g);
  g.startDir=null; // No surface landing site has been surveyed in this opening.
  g.beginLoading('space','Preparing your expedition');
  return c;
}
function placeTrainingCraft(g,v,ref,forward,distance,side){
  if(v.parent)v.leaveParent();v.rails=false;v.landed=false;v.body=ref.body;
  v.pos.copy(ref.pos).addScaledVector(forward,distance).addScaledVector(new THREE.Vector3(1,0,0).applyQuaternion(ref.quat),side);
  v.vel.copy(ref.vel);v.quat.copy(ref.quat);v.angVel.set(0,0,0);v.assist=1;
  v.targetVel.copy(ref.vel);v.targetFrame='none';v.gear=v.gearTarget=0;
  syncChildren(v);
}
export function seatExpeditionPlayer(g,p){
  const previous=g.cur;
  g.setCur?.(p);
  try {
  const v=p.index===0?g.ship:g.ship2;
  p.ownShip=v;p.body=v.body;p.deathShown=false;p.respawnT=0;
  const seat=v.type.seats.findIndex((s,i)=>!p.seatHolder(v,i));
  if(seat>=0)p.sitDown(!p.seatHolder(v,pilotSeat(v.type))?pilotSeat(v.type):seat,v);
  else p.placeAboard(v,new THREE.Vector3(...v.type.seats[0].stand),new THREE.Vector3(0,0,-1));
  } finally { g.setCur?.(previous||null); }
}
export function installCampaignJoin(g){
  if(!g.campaign?.story.intro.tutorial)return;
  g.joinCampaignPlayer=p=>seatExpeditionPlayer(g,p);
  // Campaign fleets do not have the legacy carrier's berth layout or spare craft.
  g.respawnCampaign=()=>{
    for(const p of g.players){const v=p.ownShip||g.ship;
      if(v.dead){
        v.nav.cancel(null);v.ftl.state='idle';v.ftl.speed=0;v.hullTemp=290;v.entry.heatLoad=0;
        const shellAltitude=g.mirrorShell?.body===v.body?g.mirrorShell.radius+OPENING_HEIGHT-v.body.R:0;
        g.placeInOrbit(v,v.body,Math.max(v.body.atmHeight*2,80000,shellAltitude),.4+p.index*.003);v.assist=1;
      }
      seatExpeditionPlayer(g,p);
    }
    g.setWarp(0);g.beginLoading('space','Returning to the expedition');
  };
}
