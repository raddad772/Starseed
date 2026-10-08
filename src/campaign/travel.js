import { recordSystemDetails } from './surveyCatalogue.js';
import * as THREE from 'three';
import { getSystem } from '../gen/systemCache.js';
import { canonical, systemRecipe } from '../gen/systemRecipe.js';
import { Universe } from '../sim/universe.js';
import { lockRadius } from '../sim/ftl.js';
import { VESSEL_TYPES } from '../sim/vesselTypes.js';
import { applyCampaignEvent } from './state.js';
import { ensureGalaxy, resolveSystem, GALAXY_VERSION } from './galaxy.js';
import { validateFlight, validateLocalState, bodyCatalogue } from './flight.js';

const fail=message=>{throw Error(message);};
const object=v=>v&&typeof v==='object'&&!Array.isArray(v);
export function validateGalaxy(c) {
  const g=c.galaxy;if(g===undefined)return;
  if(!object(g)||g.version!==GALAXY_VERSION||c.generation.versions.galaxy!==GALAXY_VERSION||!object(g.systems)||!Number.isSafeInteger(g.nextItemId)||g.nextItemId<1||Object.keys(g.systems).length>512)fail('Invalid galaxy state.');
  const receiver=c.generation.storyAnchors.receiver;
  if(!object(receiver)||typeof receiver.systemId!=='string'||receiver.systemId.length>200||typeof receiver.seed!=='string'||!receiver.seed||receiver.seed.length>200||receiver.systemId===`system/${c.generation.galaxySeed}`||receiver.seed===c.generation.galaxySeed||(receiver.bodyId!==undefined&&(!Number.isInteger(receiver.bodyId)||receiver.bodyId<1||receiver.bodyId>512)))fail('Invalid receiver anchor.');
  const current=resolveSystem(c,g.currentSystemId);
  if(!c.world||current.id!==g.currentSystemId||current.seed!==c.world.seed)fail('The current flight does not match its galactic address.');
  if(canonical(systemRecipe(current.definition||current.seed))!==canonical(systemRecipe(c.world.definition||c.world.seed)))fail('The flight recipe does not match its chart');
  const ids=new Set(c.world.items.map(i=>i.id));
  for(const [id,memory] of Object.entries(g.systems)) {
    const system=resolveSystem(c,id);
    if(id===g.currentSystemId||system.id!==id||!object(memory)||memory.seed!==system.seed||!object(memory.navSites))fail('Invalid stored system.');
    if(canonical(systemRecipe(system.definition||system.seed))!==canonical(systemRecipe(memory.definition||memory.seed)))fail('Stored system recipe differs from its chart');
    validateLocalState(memory);
    for(const sites of Object.values(memory.navSites)) {
      if(!Array.isArray(sites))fail('Invalid remembered landing sites.');
      for(const pair of sites)if(!Array.isArray(pair)||pair.length!==2||!bodyCatalogue(memory.definition||memory.seed).has(pair[0])||(pair[1]!=='orbit'&&(!object(pair[1])||typeof pair[1].label!=='string'||!Array.isArray(pair[1].dirF)||pair[1].dirF.length!==3||!pair[1].dirF.every(Number.isFinite))))fail('Invalid remembered landing site.');
    }
    for(const item of memory.items) { if(ids.has(item.id))fail('An item appears in more than one system.');ids.add(item.id); }
  }
  if([...ids].some(id=>id>=g.nextItemId))fail('The expedition item sequence would reuse an existing item.');
}

export function travelBlocker(c) {
  if(c.story.intro.tutorial&&c.story.intro.status!=='complete')return 'Finish or skip the introduction before departure.';
  if(c.players.some(p=>p.siteReturn||!['seat','ship'].includes(p.mode)))return 'Bring everyone aboard a vessel before gathering the fleet, including any away crew.';
  if(c.world.vessels.some(v=>v.dead))return 'Recover destroyed vessels before gathering the fleet.';
  if(c.world.vessels.some(v=>v.ftl.state!=='idle'&&v.ftl.state!=='cooldown'))return 'Drop out of local FTL before gathering the fleet.';
  return null;
}

// An explicit fleet regroup and passage. It does not impersonate a physical FTL
// integrator or advance the shared clock. Local dropped items stay in their system.
export function prepareJourney(source,destinationId) {
  validateFlight(source);
  let c=ensureGalaxy(structuredClone(source));
  // Older saves acquire their global item high-water mark on first navigation.
  c.galaxy.nextItemId=Math.max(c.galaxy.nextItemId,...c.world.items.map(i=>i.id+1));
  validateGalaxy(c);
  const blocked=travelBlocker(c);if(blocked)fail(blocked);
  const destination=resolveSystem(c,destinationId),g=c.galaxy,w=c.world;
  if(destination.id===g.currentSystemId)fail('The fleet is already in that system.');
  const memory=g.systems[destination.id]||{seed:destination.seed,items:[],sites:[],siteStorage:{},navSites:{}};
  g.systems[g.currentSystemId]={seed:w.seed,...(w.definition?{definition:w.definition}:{}),items:w.items.filter(i=>i.frame==='surface'||i.frame==='orbit'),sites:w.sites,siteStorage:w.siteStorage,navSites:Object.fromEntries(w.vessels.map(v=>[v.id,v.nav.sites]))};
  delete g.systems[destination.id];g.currentSystemId=destination.id;
  if(destination.definition)w.definition=destination.definition;else delete w.definition;
  w.seed=destination.seed;w.items=[...w.items.filter(i=>i.holder!==null||i.frame==='vessel'),...memory.items];
  w.sites=memory.sites;w.siteStorage=memory.siteStorage;
  const system=getSystem(w.definition||w.seed),universe=new Universe(system);universe.update(c.clock.simulationSeconds);
  const roots=w.vessels.filter(v=>!v.parent),ships=new Map(w.vessels.map(v=>[v.id,v]));
  function extent(v){return Math.max(VESSEL_TYPES[v.type].radius||1,...w.vessels.filter(child=>child.parent===v.id).map(child=>Math.hypot(...child.lpos)+extent(child)));}
  const clearance=Math.max(...roots.map(extent))*3;
  const spacing=Math.min(.03,Math.PI/Math.max(1,roots.length));
  const preferred=universe.bodies[destination.bodyId??system.startBodyId];
  const candidates=[preferred,...universe.bodies.filter(b=>b.data.kind==='planet'&&b!==preferred)];
  const minimum=b=>Math.max(b.R+Math.max(b.atmHeight*1.5,b.relief+30000)+clearance,clearance/(2*Math.sin(spacing/2)));
  const mirror=c.generation.storyAnchors.mirror;
  const enclosed=mirror?.version===1&&mirror.seed===w.seed&&Number.isFinite(mirror.radius)&&mirror.radius>universe.star.R;
  const body=enclosed?universe.star:candidates.find(b=>b&&!b.isStar&&minimum(b)<b.soi*.45);
  if(!body)fail('No safe fleet arrival orbit is available in this system.');
  w.respawn={body:body.id,dir:[1,0,0]};w.startDir=[1,0,0];w.startSiteKnown=false;w.startChoice=`orbit:${body.id}`;
  // Wide, co-planar circular orbits; preserve every nested deck/cargo frame.
  const radius=enclosed?mirror.radius+Math.max(30000,clearance):Math.max(minimum(body),Math.min(body.soi*.45,Math.max(lockRadius(body)*1.1,body.R+body.atmHeight*2+150000)));
  const arrivalSpacing=enclosed?2*Math.asin(Math.min(.1,clearance/(2*radius))):spacing;
  const axis=new THREE.Vector3(0,1,0).applyQuaternion(body.qTilt),base=new THREE.Vector3(1,0,0).applyQuaternion(body.qTilt);
  const tangent=axis.clone().cross(base);
  for(const v of w.vessels) {
    v.body=body.id;v.landed=false;v.groundContact=false;v.rails=false;
    v.angVel=v.accelW=v.accel=v.targetVel=[0,0,0];v.cruise=v.slip=v.climb=v.idleTime=0;
    v.assist=1;v.targetFrame='none';v.refVessel=null;
    v.ftl={state:'idle',timer:0,speed:0,throttle:0,effect:0,nav:null};
    v.nav={travelMode:v.nav.travelMode,order:null,sites:memory.navSites[v.id]||[]};
  }
  roots.forEach((v,i)=>{
    const angle=(i-(roots.length-1)/2)*arrivalSpacing;
    const dir=base.clone().multiplyScalar(Math.cos(angle)).addScaledVector(tangent,Math.sin(angle)),pro=axis.clone().cross(dir);
    v.pos=dir.clone().multiplyScalar(radius).toArray();v.vel=pro.clone().multiplyScalar(Math.sqrt(body.GM/radius)).toArray();
    v.quat=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(pro.clone().cross(dir),dir,pro.clone().negate())).toArray();
    v.rails=true;v.railR0=[...v.pos];v.railV0=[...v.vel];v.railT0=c.clock.simulationSeconds;
  });
  const placed=new Set(roots.map(v=>v.id));
  function place(v) {
    if(placed.has(v.id))return;
    const parent=ships.get(v.parent);place(parent);
    const q=new THREE.Quaternion(...parent.quat);
    v.pos=new THREE.Vector3(...v.lpos).applyQuaternion(q).add(new THREE.Vector3(...parent.pos)).toArray();
    v.quat=q.clone().multiply(new THREE.Quaternion(...v.lquat)).toArray();v.vel=[...parent.vel];
    placed.add(v.id);
  }
  for(const v of w.vessels)place(v);
  for(const p of c.players){p.body=body.id;p.target=null;p.siteReturn=false;p.grounded=false;p.swimming=false;}
  c=applyCampaignEvent(c,{id:`arrival/${destination.id}`,type:'system.arrived',systemId:destination.id});
  recordSystemDetails(c,system);
  validateFlight(c);validateGalaxy(c);return c;
}

// Votes belong to a destination, a runtime and its current crew; never to a save.
export class JourneyConsent {
  constructor(){this.cancel();}
  cancel(){this.game=null;this.destination=null;this.members=[];this.votes=new Set();}
  sync(game){if(this.game&&(game!==this.game||this.members.join()!==game.players.map(p=>p.index).join()))this.cancel();}
  vote(game,destination,index){
    this.sync(game);const members=game.players.map(p=>p.index);
    if(!members.includes(index))return false;
    if(game!==this.game||destination!==this.destination){this.cancel();this.game=game;this.destination=destination;this.members=members;}
    this.votes.add(index);return members.every(i=>this.votes.has(i));
  }
}
