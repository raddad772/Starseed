// Portable single-system flight state. No renderer objects or controls cross this boundary.
import * as THREE from 'three';
import { VESSEL_TYPES, pilotSeat } from '../sim/vesselTypes.js';
import { ITEM_TYPES } from '../sim/items.js';
import { Player } from '../sim/player.js';
import { GENERATOR_VERSION, generateSystem } from '../gen/system.js';
import { SIM_VERSION } from '../gen/worldsim/snapshot.js';
import { LEN_SCALE } from '../core/units.js';
import { setLivery } from '../render/glbShip.js';

export const FLIGHT_VERSION = 1;
const VECTORS = ['pos','vel','angVel','landedPosF','lpos','lvel','lang','accelW','targetVel','accel'];
const QUATS = ['quat','landedQuatF','lquat'];
const NUMBERS = ['assist','gearTarget','gear','rampTarget','ramp','hull','hullTemp','heatGlow','heatFlux','cruise','slip','climb','idleTime','lastImpact','railT0','_thermalT','podTilt'];
const FLAGS = ['landed','rails','attached','dead','groundContact'];
const PVECS = ['sPos','sVel','fPos','fVel','ePos','eVel','heading'];
const PNUMS = ['seat','pitch','headYaw','headPitch','jetFuel','bob','footstep'];
const PFLAGS = ['grounded','swimming','deathShown'];
const ALIASES = ['ship','yacht','wayfarer','tender','carrier','orbitalStation','ship2','fighter','lifter','crate','cart','dropship','tank','tenderYacht','neptuneRunabout','tenderRunabout'];
const GROUPS = ['pods','pioneerFleet','expeditionFleet','horizonFleet'];
const clone = value => JSON.parse(JSON.stringify(value));
const pick = (o, keys, fallback) => Object.fromEntries(keys.map(k => [k, o[k] === undefined ? fallback : o[k]]));
const vectors = (o, keys) => Object.fromEntries(keys.map(k => [k, o[k].toArray()]));
const fail = text => { throw Error(text); };
const obj = x => !!x && typeof x === 'object' && !Array.isArray(x);
const str = x => typeof x === 'string' && x.length > 0 && x.length <= 200;
const vec = (x,n=3) => Array.isArray(x) && x.length===n && x.every(Number.isFinite);
const quat = x => vec(x,4) && Math.abs(Math.hypot(...x)-1)<.001;
const unique = list => new Set(list).size===list.length;

// A changed hull layout/physics definition must not silently move saved passengers.
const signatures=new WeakMap(),bodyCatalogues=new Map();
export function vesselSignature(type) {
  if(signatures.has(type))return signatures.get(type);
  const text=JSON.stringify(type); let h=2166136261;
  for(let i=0;i<text.length;i++)h=Math.imul(h^text.charCodeAt(i),16777619);
  const result=(h>>>0).toString(16);signatures.set(type,result);return result;
}
function targetRef(target, ids) {
  if (!target) return null;
  if (target.isVessel) return { vessel: ids.get(target.v) };
  if (Number.isInteger(target.id)) return { body: target.id };
  return fail('This navigation target cannot be saved yet.');
}
function navIntent(nav, ids) {
  if (!nav?.active && !nav?.savedOrder) return null;
  const d=nav.savedOrder || nav.dest;
  if (d.point) return fail('Finish or cancel the moving-person rendezvous before saving.');
  return {kind:d.kind,name:d.name||'',label:d.label||'',body:d.body?.id??null,vessel:d.v?ids.get(d.v):null,dirF:d.dirF?.toArray()??null};
}
function liftState(lift) {
  if(!lift)return null;
  return { cars:lift.cars.map(c=>({ ...pick(c,['id','node','state','t','doors','dwell','queue','leg','axis','dest'],null),pos:c.pos.toArray(),legs:c.legs?.map(L=>({...L,a:L.a.toArray(),b:L.b.toArray()}))??null })),sw:clone(lift.sw),landing:clone(lift.landing),holds:[...lift.holds].map(([k,c])=>[k,c.id]) };
}

export function captureFlight(game, campaign) {
  if(!game.placed || game.state!=='playing')fail('Wait until the current flight has finished loading before saving.');
  if(game.players.some(p=>p.deathShown))fail('Recover the crew before saving a new flight snapshot.');
  const ids=new Map(game.vessels.map(v=>[v,v.campaignId ||= crypto.randomUUID()]));
  const persons=[...game.players,...(game.awayPlayers||[]).filter(p=>p&&!game.players.includes(p))].sort((a,b)=>a.index-b.index);
  const playerIds=new Map(persons.map(p=>[p,`player/${p.index+1}`]));
  const ref=v=>v?ids.get(v)??fail('A vessel reference is no longer in the fleet.'):null;
  // Site progress is captured without exiting or disturbing the active player.
  for(const p of game.players)p.understructure?.save();
  const c=structuredClone(campaign);
  c.saveKind='single-system-flight'; c.clock.simulationSeconds=game.t;
  c.fleet={provisioned:true,vesselIds:[...ids.values()]};
  c.players=persons.map(p=>({id:playerIds.get(p),index:p.index,active:game.players.includes(p),label:p.label,mode:p.mode,body:p.body.id,vessel:ref(p.vessel),ownShip:ref(p.ownShip),lastSeat:p.lastSeat?{vessel:ref(p.lastSeat.vessel),seat:p.lastSeat.seat}:null,target:targetRef(p.target,ids),...vectors(p,PVECS),evaQuat:p.evaQuat.toArray(),...pick(p,PNUMS,0),...pick(p,PFLAGS,false),siteReturn:!!p.understructure}));
  c.world={version:FLIGHT_VERSION,seed:game.seed,systemVersion:GENERATOR_VERSION,worldVersion:SIM_VERSION,lengthScale:LEN_SCALE,worldsim:!!game.worldSims,simN:game.worldSims?.N??null,
    fleetEra:game.fleetEra??null,startDir:game.startDir?.toArray()??[1,0,0],startChoice:game.startChoice??'surface',respawn:{body:game.respawnInfo?.body.id??game.startBody.id,dir:game.respawnInfo?.dir.toArray()??[1,0,0]},
    aliases:Object.fromEntries(ALIASES.map(k=>[k,ref(game[k])])),groups:Object.fromEntries(GROUPS.map(k=>[k,(game[k]||[]).map(ref)])),
    vessels:game.vessels.map(v=>({id:ref(v),type:v.type.key,signature:vesselSignature(v.type),name:v.name,registry:v.registry||'',body:v.body.id,parent:ref(v.parent),zone:v.zone?clone(v.zone):null,cargo:v.cargo?.parent===v&&v.cargo.attached?ref(v.cargo):null,refVessel:ref(v.refVessel),home:v.home?{host:ref(v.home.host),hatch:clone(v.home.hatch)}:null,hatchKey:v.hatchKey??null,
      ...vectors(v,VECTORS),...vectors(v,QUATS),...pick(v,NUMBERS,0),...pick(v,FLAGS,false),deathCause:v.deathCause,targetFrame:v.targetFrame,railR0:[...v.railR0],railV0:[...v.railV0],legState:[...v.legState],legComp:[...v.legComp],heatLoad:v.entry.heatLoad,
      doors:clone(v.doors),airlocks:clone(v.airlocks),livery:v.livery?clone(v.livery):null,lift:liftState(v.turbolift),deckHost:ref(v.deckHost),deckFrames:(v.deckFrames||[]).map(ref),turnovers:(v.turnovers||[]).map(s=>({...pick(s,['pad','z','angle','phase','side','requested','door','pressure'],null),frame:ref(s.frame),deck:ref(s.deck)})),
      ftl:{...pick(v.ftl,['state','timer','speed','throttle','effect'],0),nav:v.ftl.nav?{aim:targetRef(v.ftl.nav.aim,ids),legLimit:v.ftl.nav.legLimit??null}:null},nav:{travelMode:v.nav.travelMode,order:navIntent(v.nav,ids),sites:[...v.nav.sites].map(([id,s])=>[id,s==='orbit'?s:{dirF:s.dirF.toArray(),label:s.label}])}})),
    items:game.items.list.map(it=>({id:it.id,kind:it.kind,holder:it.holder?playerIds.get(it.holder):null,frame:it.frame,vessel:ref(it.vessel),body:it.body?.id??null,pos:it.pos.toArray(),quat:it.quat.toArray(),r0:it.r0&&[...it.r0],v0:it.v0&&[...it.v0],t0:it.t0})),
    siteStorage:game.campaignStorage?.snapshot()??{},sites:game.surfaceSurveys.sites.map(s=>({body:s.body.id,position:s.frame.position.toArray(),heading:new THREE.Vector3(0,0,-1).applyQuaternion(s.frame.rotation).toArray()}))};
  validateFlight(c);return c;
}

export function validateFlight(c) {
  const w=c.world;
  if(!obj(w)||w.version!==FLIGHT_VERSION)fail('Unsupported live flight snapshot.');
  if(!str(w.seed)||w.systemVersion!==GENERATOR_VERSION||w.worldVersion!==SIM_VERSION||w.lengthScale!==LEN_SCALE)fail('This save needs a different world generator version.');
  if(c.generation.versions.system!==w.systemVersion||c.generation.versions.world!==w.worldVersion||c.generation.localLengthScale!==w.lengthScale)fail('Conflicting generation metadata.');
  if(c.clock.epoch!=='2026-10-05T00:00:00Z'||!Number.isFinite(c.clock.simulationSeconds)||Math.abs(c.clock.simulationSeconds)>1e12)fail('Unsupported flight epoch or time.');
  if(typeof w.worldsim!=='boolean'||(w.simN!==null&&(!Number.isInteger(w.simN)||w.simN<8||w.simN>1024)))fail('Invalid terrain settings.');
  if(!bodyCatalogues.has(w.seed)){if(bodyCatalogues.size>=8)bodyCatalogues.delete(bodyCatalogues.keys().next().value);bodyCatalogues.set(w.seed,new Set(generateSystem(w.seed).bodies.map(b=>b.id)));}
  const bodies=bodyCatalogues.get(w.seed);
  if(!Array.isArray(w.vessels)||!w.vessels.length||w.vessels.length>512||!w.vessels.every(v=>obj(v)&&str(v.id))||!unique(w.vessels.map(v=>v.id)))fail('Invalid or duplicate vessels.');
  const ships=new Map(w.vessels.map(v=>[v.id,v])), reference=id=>id===null||ships.has(id), body=id=>bodies.has(id);
  const target=t=>t===null||(obj(t)&&((Object.keys(t).length===1&&ships.has(t.vessel))||(Object.keys(t).length===1&&body(t.body))));
  const numbers=(o,keys)=>keys.every(k=>Number.isFinite(o[k]));
  if(!obj(c.fleet)||c.fleet.provisioned!==true||!Array.isArray(c.fleet.vesselIds)||!unique(c.fleet.vesselIds)||c.fleet.vesselIds.length!==ships.size||c.fleet.vesselIds.some(id=>!ships.has(id)))fail('Invalid fleet manifest.');
  if(!obj(w.aliases)||!w.aliases.ship||!obj(w.groups)||!vec(w.startDir)||!vec(w.respawn?.dir)||!body(w.respawn?.body))fail('Invalid flight start references.');
  if(![null,'pioneer','expedition','horizon'].includes(w.fleetEra)||typeof w.startChoice!=='string')fail('Invalid fleet or start policy.');
  for(const k of ALIASES)if(!reference(w.aliases[k]))fail('Missing named vessel.');
  for(const k of GROUPS)if(!Array.isArray(w.groups[k])||w.groups[k].some(id=>!ships.has(id))||!unique(w.groups[k]))fail('Invalid fleet group.');
  for(const v of w.vessels){
    const type=VESSEL_TYPES[v.type];if(!type||v.signature!==vesselSignature(type))fail(`Vessel layout changed or is unavailable: ${v.type}.`);
    if(!str(v.name)||typeof v.registry!=='string'||!body(v.body)||![v.parent,v.cargo,v.refVessel,v.deckHost].every(reference))fail('Invalid vessel references.');
    if(!VECTORS.every(k=>vec(v[k]))||!QUATS.every(k=>quat(v[k]))||!numbers(v,NUMBERS)||!FLAGS.every(k=>typeof v[k]==='boolean')||!vec(v.railR0)||!vec(v.railV0)||!vec(v.legState,4)||!vec(v.legComp,4)||!Number.isFinite(v.heatLoad))fail('Invalid vessel motion.');
    const frameValid=['none','surface','inertial','deck','coast'].includes(v.targetFrame)||(typeof v.targetFrame==='string'&&v.targetFrame.startsWith('vessel:')&&v.targetFrame.length<=207);
    if(![0,1,2].includes(v.assist)||v.hull<0||v.hull>1||v.hullTemp<0||typeof v.deathCause!=='string'||!frameValid)fail('Invalid vessel controls or condition.');
    for(const k of ['gear','gearTarget','ramp','rampTarget'])if(v[k]<0||v[k]>1)fail('Invalid landing gear or ramp.');
    if(v.parent){if(v.landed||v.rails||v.body!==ships.get(v.parent).body||!obj(v.zone))fail('Invalid parent frame.');let p=v,seen=new Set();while(p){if(seen.has(p.id))fail('Cyclic vessel attachment.');seen.add(p.id);p=ships.get(p.parent);}}
    else if(v.attached||v.zone!==null)fail('Attachment has no host.');
    if(v.zone){for(const k of ['min','max','pad'])if(v.zone[k]!==undefined&&!vec(v.zone[k]))fail('Invalid attachment geometry.');if(v.zone.gravity!==undefined&&v.zone.gravity!=='host'&&!Number.isFinite(v.zone.gravity))fail('Invalid attachment gravity.');if(v.zone.pressure!==undefined&&(!Number.isFinite(v.zone.pressure)||v.zone.pressure<0))fail('Invalid attachment pressure.');}
    if(v.cargo&&(ships.get(v.cargo).parent!==v.id||!ships.get(v.cargo).attached))fail('Cargo does not belong to its clamp.');
    if(v.home&&(!obj(v.home)||!ships.has(v.home.host)||!vec(v.home.hatch)))fail('Invalid home berth.');
    if(!obj(v.doors)||!obj(v.airlocks)||!Object.values(v.doors).every(d=>obj(d)&&numbers(d,['open','target'])&&d.open>=0&&d.open<=1&&d.target>=0&&d.target<=1))fail('Invalid door state.');
    if((type.doors||[]).concat(type.slideDoors||[]).some(d=>!v.doors[d.id]))fail('Missing saved door.');
    for(const a of type.airlocks||[]){const s=v.airlocks[a.id];if(!obj(s)||!numbers(s,['pressure','remaining'])||!['sealed','closing','cycling','open'].includes(s.phase)||![null,'inner','outer'].includes(s.requested))fail('Invalid airlock state.');}
    if(!Array.isArray(v.deckFrames)||v.deckFrames.some(id=>!ships.has(id))||!Array.isArray(v.turnovers))fail('Invalid deck structure.');
    for(const s of v.turnovers)if(!ships.has(s.frame)||!ships.has(s.deck)||ships.get(s.frame).parent!==v.id||!numbers(s,['pad','z','angle','door','pressure'])||!['open','closing','pressure','rotating','opening'].includes(s.phase)||!['inner','outer'].includes(s.side)||!['inner','outer'].includes(s.requested))fail('Invalid gravity turnover.');
    if(!obj(v.ftl)||!['idle','spool','cruise','cooldown'].includes(v.ftl.state)||!numbers(v.ftl,['timer','speed','throttle','effect'])||(v.ftl.nav&&(!target(v.ftl.nav.aim)||(v.ftl.nav.legLimit!==null&&!Number.isFinite(v.ftl.nav.legLimit)))))fail('Invalid FTL state.');
    if(!obj(v.nav)||!['auto','conventional','ftl'].includes(v.nav.travelMode)||!Array.isArray(v.nav.sites))fail('Invalid navigation state.');
    for(const [id,s] of v.nav.sites)if(!body(id)||(s!=='orbit'&&(!obj(s)||!vec(s.dirF)||typeof s.label!=='string')))fail('Invalid saved landing site.');
    const d=v.nav.order;if(d&&(!obj(d)||!['site','orbit','dock','meet','park','hold'].includes(d.kind)||!reference(d.vessel)||(d.body!==null&&!body(d.body))||(d.dirF!==null&&!vec(d.dirF))||(['site','orbit'].includes(d.kind)&&d.body===null)||(['dock','meet'].includes(d.kind)&&!d.vessel)))fail('Invalid navigation order.');
    if(v.livery&&(!obj(v.livery)||!['main','second','stripe'].every(k=>/^#[0-9a-f]{6}$/i.test(v.livery[k]))))fail('Invalid livery.');
    validateLift(v.lift,type.turbolift);
  }
  const players=c.players;
  if(!Array.isArray(players)||!players.length||players.length>2||!unique(players.map(p=>p.id))||!unique(players.map(p=>p.index))||!players.some(p=>p.index===0&&p.active))fail('Invalid player manifest.');
  const people=new Set(players.map(p=>p.id)),seats=new Set();
  for(const p of players){
    if(p.deathShown)fail('Recover the crew before saving a new flight snapshot.');
    if(!str(p.id)||!str(p.label)||![0,1].includes(p.index)||typeof p.active!=='boolean'||!['seat','ship','surface','eva'].includes(p.mode)||!body(p.body)||![p.vessel,p.ownShip].every(reference)||!target(p.target)||!PVECS.every(k=>vec(p[k]))||!quat(p.evaQuat)||!numbers(p,PNUMS)||!PFLAGS.every(k=>typeof p[k]==='boolean'))fail('Invalid player state.');
    if(['seat','ship'].includes(p.mode)&&(!p.vessel||ships.get(p.vessel).body!==p.body))fail('Player has no valid vessel frame.');
    if(p.mode==='seat'){const key=p.vessel+'/'+p.seat;if(!Number.isInteger(p.seat)||!VESSEL_TYPES[ships.get(p.vessel).type].seats?.[p.seat]||(p.active&&seats.has(key)))fail('Invalid or duplicate seat occupant.');if(p.active)seats.add(key);}
    if(p.lastSeat&&(!ships.has(p.lastSeat.vessel)||!VESSEL_TYPES[ships.get(p.lastSeat.vessel).type].seats?.[p.lastSeat.seat]))fail('Invalid remembered seat.');
  }
  if(!Array.isArray(w.items)||w.items.length>10000||!unique(w.items.map(i=>i.id)))fail('Invalid item registry.');
  for(const i of w.items){
    if(!Number.isSafeInteger(i.id)||i.id<1||!Object.hasOwn(ITEM_TYPES,i.kind)||!vec(i.pos)||!quat(i.quat)||!Number.isFinite(i.t0))fail('Invalid inventory item.');
    if(i.holder!==null){if(!people.has(i.holder)||i.frame!==null||i.vessel!==null||i.body!==null)fail('Item has conflicting ownership.');}
    else if(i.frame==='vessel'){if(!ships.has(i.vessel)||i.body!==null)fail('Invalid item vessel frame.');}
    else if(['surface','orbit'].includes(i.frame)){if(!body(i.body)||i.vessel!==null||(i.frame==='orbit'&&(!vec(i.r0)||!vec(i.v0))))fail('Invalid item planetary frame.');}
    else fail('Item has no owner or location.');
  }
  if(!obj(w.siteStorage)||!Object.entries(w.siteStorage).every(([k,v])=>(k.startsWith('starseed.survey.')||k.startsWith('starseed.golden-path.'))&&typeof v==='string'))fail('Invalid campaign site storage.');
  if(!Array.isArray(w.sites)||w.sites.some(s=>!body(s.body)||!vec(s.position)||!vec(s.heading)))fail('Invalid site entrance.');
  return c;
}
function validateLift(lift,spec){
  if(!spec){if(lift!==null)fail('Unexpected turbolift.');return;}
  if(!obj(lift)||!Array.isArray(lift.cars)||lift.cars.length!==1||!obj(lift.sw)||!obj(lift.landing)||!Array.isArray(lift.holds))fail('Invalid turbolift.');
  for(const c of lift.cars){
    if(c.id!=='car'||!vec(c.pos)||![c.t,c.doors,c.dwell,c.leg].every(Number.isFinite)||!['idle','opening','open','closing','wait','switch','run'].includes(c.state)||!['x','y','z'].includes(c.axis)||!Array.isArray(c.queue)||c.queue.some(id=>!spec.stations.some(s=>s.id===id))||(c.node!==null&&!spec.nodes[c.node]))fail('Invalid lift car.');
    if(c.legs!==null){if(!Array.isArray(c.legs)||!c.legs.length||!Number.isInteger(c.leg)||c.leg<0||c.leg>=c.legs.length)fail('Invalid lift route.');for(const L of c.legs)if(!vec(L.a)||!vec(L.b)||![0,1,2].includes(L.axis)||![-1,1].includes(L.sign)||![L.len,L.vp,L.acc,L.t1,L.T].every(Number.isFinite)||!spec.nodes[L.from]||!spec.nodes[L.to]||!Array.isArray(L.keys)||!Array.isArray(L.sw))fail('Invalid lift leg.');}
    else if(['wait','switch','run'].includes(c.state))fail('Moving lift has no route.');
  }
  if(lift.holds.some(([k,id])=>typeof k!=='string'||!['car','spare'].includes(id)))fail('Invalid lift reservation.');
  for(const key of Object.keys(spec.switches||{}))if(!obj(lift.sw[key])||![lift.sw[key].at,lift.sw[key].want].every(Number.isFinite))fail('Invalid lift switch.');
  for(const s of spec.stations)if(!Number.isFinite(lift.landing[s.id]))fail('Invalid lift landing.');
}

// Called only on a fresh game created with deferStart. Validation precedes mutation.
export function restoreFlight(game,c,{inputForPlayer}={}) {
  validateFlight(c);if(game.seed!==c.world.seed)fail('Restore requires the saved system.');
  const w=c.world;
  game.t=c.clock.simulationSeconds;game.universe.update(game.t);game.warpIndex=0;
  for(const v of [...game.vessels])game.removeVessel(v);
  game.items.list=[]; game.items.nextId=1;
  const ships=new Map();
  game.restoringFleet=true;
  try{for(const s of w.vessels)ships.set(s.id,game.addVessel(s.type,s.name,s.registry));}finally{game.restoringFleet=false;}
  const ref=id=>id?ships.get(id):null,target=t=>t?(t.vessel?ref(t.vessel).target:game.universe.bodies[t.body]):null;
  for(const s of w.vessels){const v=ref(s.id);v.campaignId=s.id;v.body=game.universe.bodies[s.body];
    for(const k of [...VECTORS,...QUATS])v[k].fromArray(s[k]);Object.assign(v,pick(s,[...NUMBERS,...FLAGS,'deathCause','targetFrame']));
    v.railR0=[...s.railR0];v.railV0=[...s.railV0];v.legState=[...s.legState];v.legComp=[...s.legComp];v.entry.heatLoad=s.heatLoad;
    v.parent=ref(s.parent);v.zone=v.parent?.type.zones?.find(z=>JSON.stringify(z)===JSON.stringify(s.zone))||clone(s.zone);v.cargo=ref(s.cargo);v.refVessel=ref(s.refVessel);v.children=[];v.home=s.home?{host:ref(s.home.host),hatch:clone(s.home.hatch)}:null;v.hatchKey=s.hatchKey;
    v.doors=clone(s.doors);v.airlocks=clone(s.airlocks);v.deckHost=ref(s.deckHost);v.deckFrames=s.deckFrames.map(ref);v.turnovers=s.turnovers.map(t=>({...t,host:v,frame:ref(t.frame),deck:ref(t.deck)}));for(const t of v.turnovers)t.frame.frameState=t;
    if(s.livery){v.livery=clone(s.livery);const m=v.visual?.hull||v.visual?.model?.hull;if(m)setLivery(m,v.livery);}
    if(s.lift){const l=v.turbolift;l.sw=clone(s.lift.sw);l.landing=clone(s.lift.landing);s.lift.cars.forEach((saved,i)=>{const car=l.cars[i];Object.assign(car,clone(saved));car.pos=new THREE.Vector3(...saved.pos);car.legs=saved.legs?.map(L=>({...clone(L),a:new THREE.Vector3(...L.a),b:new THREE.Vector3(...L.b)}))??null;l.place(car);});l.holds=new Map(s.lift.holds.map(([key,id])=>[key,id==='spare'?l.spare:l.cars.find(c=>c.id===id)]));}
    Object.assign(v.ftl,pick(s.ftl,['state','timer','speed','throttle','effect']));v.ftl.nav=s.ftl.nav?{aim:target(s.ftl.nav.aim),legLimit:s.ftl.nav.legLimit}:null;
    v.nav.travelMode=s.nav.travelMode;v.nav.sites=new Map(s.nav.sites.map(([id,p])=>[id,p==='orbit'?p:{dirF:new THREE.Vector3(...p.dirF),label:p.label}]));
    const d=s.nav.order;v.nav.savedOrder=d?{kind:d.kind,name:d.name,label:d.label,body:d.body===null?null:game.universe.bodies[d.body],v:ref(d.vessel),dirF:d.dirF?new THREE.Vector3(...d.dirF):null}:null;
    if(d){v.assist=1;v.targetFrame='none';} // Stored intent waits for explicit re-engagement; never replay a stale burn.
  }
  for(const v of ships.values())if(v.parent)v.parent.children.push(v);
  for(const key of ALIASES)game[key]=ref(w.aliases[key]);for(const key of GROUPS)game[key]=w.groups[key].map(ref);
  game.fleetEra=w.fleetEra;game.startDir=new THREE.Vector3(...w.startDir);game.startChoice=w.startChoice;game.respawnInfo={body:game.universe.bodies[w.respawn.body],dir:new THREE.Vector3(...w.respawn.dir)};
  const players=new Map();game.awayPlayers=[];
  for(const saved of c.players){let p=game.players[saved.index];if(!p){const input=saved.active&&inputForPlayer?.(saved.index);p=input?game.addPlayer(input):new Player(game,saved.index);if(!input)game.awayPlayers[saved.index]=p;}players.set(saved.id,p);
    Object.assign(p,pick(saved,['label','mode',...PNUMS,...PFLAGS]));for(const k of PVECS)p[k].fromArray(saved[k]);p.evaQuat.fromArray(saved.evaQuat);p.body=game.universe.bodies[saved.body];p.vessel=ref(saved.vessel);p.ownShip=ref(saved.ownShip);p.lastSeat=saved.lastSeat?{vessel:ref(saved.lastSeat.vessel),seat:saved.lastSeat.seat}:null;p.target=target(saved.target);p.warpRequestIndex=0;p.travelIndex=0;p.jetOn=false;
    if(game.players.includes(p)&&p.mode==='seat'&&pilotSeat(p.vessel.type)===p.seat)p.vessel.pilot=p;
  }
  game.items.list=[];
  for(const saved of w.items){const it=game.items.create(saved.kind,saved.holder?players.get(saved.holder):null);Object.assign(it,pick(saved,['id','frame','t0','r0','v0']));it.vessel=ref(saved.vessel);it.body=saved.body===null?null:game.universe.bodies[saved.body];it.pos.fromArray(saved.pos);it.quat.fromArray(saved.quat);}
  game.items.nextId=Math.max(0,...w.items.map(i=>i.id))+1;
  game.resumeSavedPlayer=(p,away)=>{
    Object.assign(p,pick(away,['label','mode',...PNUMS,...PFLAGS,'body','vessel','ownShip','lastSeat','target']));for(const k of PVECS)p[k].copy(away[k]);p.evaQuat.copy(away.evaQuat);
    if(p.vessel?.dead||(p.mode==='seat'&&p.seatHolder(p.vessel,p.seat))){game.regroup(p);return;}
    if(p.mode==='seat'&&pilotSeat(p.vessel.type)===p.seat)p.vessel.pilot=p;
  };
  game.placed=true;game.startPending=null;game.joinPending=null;game.arrival=null;game.state='playing';game.paused=true;
  game.siteReturnNotice=c.players.some(p=>p.siteReturn);game.savedNavigationNotice=w.vessels.some(v=>v.nav.order);
  return game;
}
