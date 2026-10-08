// Headless fixture using the game's integration, controller, thermal model,
// contacts, SOI changes and analytic coast. Only rendering/input are omitted.
import * as THREE from 'three';
import { Game, WARP_LEVELS } from '../src/game.js';
import { Ship, VesselTarget } from '../src/sim/ship.js';
import { NavComputer } from '../src/sim/navComputer.js';
import { FTL } from '../src/sim/ftl.js';
import { VESSEL_TYPES } from '../src/sim/vesselTypes.js';
import { bodyState } from '../src/sim/orbitalRoutes.js';
export function testBody({R=1e6,GM=1e12,atm=null,atmHeight=0,...extra}={}) {
 return {R,GM,solid:true,relief:0,atm,atmHeight,children:[],parent:null,soi:Infinity,
  pos:new THREE.Vector3(),vel:new THREE.Vector3(),relPos:new THREE.Vector3(),relVel:new THREE.Vector3(),omega:new THREE.Vector3(),q:new THREE.Quaternion(),qInv:new THREE.Quaternion(),qTilt:new THREE.Quaternion(),
  data:{name:'Fixture'},groundHeight:()=>0,floorAt:()=>0,groundNormal:(p,out)=>out.copy(p).normalize(),orientationAt(t,out){return out.setFromAxisAngle(new THREE.Vector3(0,1,0),this.omega.y*t);},
  atmosphereAt(alt,out={}){Object.assign(out,{density:atm?1.225*Math.exp(-alt/8000):0,pressure:atm?Math.exp(-alt/8000):0,temperature:atm?Math.max(200,288-alt*.0065):3,soundSpeed:340});return out;},...extra};
}
export function orbitalFlight(key='pioneer_nomad',bodies=[testBody()]) {
 const game={t:0,warpIndex:0,vessels:[],players:[],cur:null,startDir:new THREE.Vector3(1,0,0),messages:[],tell:()=>{},aboardOf:()=>[],setCur(){},
  universe:{bodies,update(t){for(const b of bodies){const s=bodyState(b,t);b.pos.fromArray(s.pos);b.vel.fromArray(s.vel);if(b.parent){b.relPos.copy(b.pos).sub(b.parent.pos);b.relVel.copy(b.vel).sub(b.parent.vel);}b.orientationAt(t,b.q);b.qInv.copy(b.q).invert();}}},
  get warp(){return WARP_LEVELS[this.warpIndex];},setWarp(i){this.warpIndex=i;}};
 for(const k of ['railClearance','advanceVessels','rootMode','stepVessel','railSteps','railStep','rotateOnly','stepChild'])game[k]=Game.prototype[k];
 const addShip=k=>{const s=new Ship(game,VESSEL_TYPES[k],k);s.body=bodies[0];s.ftl=new FTL(game,s);s.nav=new NavComputer(game,s);s.nav.say=(text)=>game.messages.push(text);s.target=new VesselTarget(s);s.legAttach=s.type.legAttach?.map(a=>new THREE.Vector3(...a));game.vessels.push(s);return s;};
 const ship=addShip(key);
 game.universe.update(0);
 const step=(dt=.1)=>{for(const v of game.vessels)v.nav.update(dt);game.advanceVessels(dt);};
 const coastStep=(max=60)=>{ship.nav.update(.1);let dt=.1;if(ship.auto?.coast&&game.rootMode(ship,false)==='rails')dt=Math.max(.1,Math.min(max,(ship.nav.nextEventAt-game.t)));game.warpIndex=dt>.4?6:0;game.advanceVessels(dt);};
 const surface=(s=ship)=>{s.pos.set(s.body.R+60,0,0);s.vel.copy(s.frameVel(new THREE.Vector3()));s.quat.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(1,0,0));s.agl=60;s.env.density=s.body.atmosphereAt(60).density;};
 const orbit=(s=ship,alt=30000,phase=0)=>{const r=s.body.R+alt,sp=Math.sqrt(s.body.GM/r);s.pos.set(r*Math.cos(phase),0,-r*Math.sin(phase));s.vel.set(-sp*Math.sin(phase),0,-sp*Math.cos(phase));s.quat.setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3().crossVectors(s.vel,s.pos).normalize(),s.pos.clone().normalize(),s.vel.clone().normalize().negate()));s.coastEnv();};
 return {game,ship,step,coastStep,surface,orbit,addShip};
}
