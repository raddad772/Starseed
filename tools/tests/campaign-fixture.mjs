import * as THREE from 'three';
import { generateSystem } from '../../src/gen/system.js';
import { Universe } from '../../src/sim/universe.js';
import { Ship } from '../../src/sim/ship.js';
import { VESSEL_TYPES } from '../../src/sim/vesselTypes.js';
import { FTL } from '../../src/sim/ftl.js';
import { NavComputer } from '../../src/sim/navComputer.js';
import { Turbolift } from '../../src/sim/turbolift.js';
import { Player } from '../../src/sim/player.js';
import { Items } from '../../src/sim/items.js';
import { initDeckFrames } from '../../src/sim/deckFrames.js';
import { createCampaign } from '../../src/campaign/state.js';
import { CampaignSiteStorage } from '../../src/campaign/siteStorage.js';

export function game(){
 const g={seed:'SOL',opts:{},system:generateSystem('SOL'),t:123456,players:[],vessels:[],placed:true,state:'playing',fleetEra:null,surfaceSurveys:{sites:[]},campaignStorage:new CampaignSiteStorage(),message(){},aboardOf(){return []}};
 g.universe=new Universe(g.system);g.universe.update(g.t);g.startBody=g.universe.bodies[g.system.startBodyId];g.startDir=new THREE.Vector3(1,0,0);g.respawnInfo={body:g.startBody,dir:g.startDir};
 g.addVessel=(key,name,registry)=>{const v=new Ship(g,VESSEL_TYPES[key],name);v.registry=registry;v.body=g.startBody;v.pos.set(v.body.R+10000,0,0);v.ftl=new FTL(g,v);v.nav=new NavComputer(g,v);if(v.type.turbolift)v.turbolift=new Turbolift(v,v.type.turbolift);v.target={isVessel:true,v};g.vessels.push(v);if(!g.restoringFleet)initDeckFrames(g,v);return v;};
 g.removeVessel=v=>g.vessels.splice(g.vessels.indexOf(v),1);
 g.items=new Items(g);g.addPlayer=input=>{const p=new Player(g,g.players.length);p.input=input;p.body=g.startBody;p.ui={hud:{message(){}}};g.players.push(p);return p;};g.addPlayer({});
 g.ship=g.yacht=g.addVessel('yacht','Home','Y');g.wayfarer=g.addVessel('shuttle','Scout','S');g.tender=g.addVessel('tender','Tender','T');g.carrier=g.addVessel('carrier','Carrier','C');
 g.players[0].ownShip=g.ship;g.players[0].fPos.set(g.startBody.R,0,0);
 g.campaign=createCampaign({seed:g.seed});return g;
}
