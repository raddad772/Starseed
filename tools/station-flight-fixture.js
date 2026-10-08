// Deterministic orbital fixture using the production navigation, frame changes,
// controls, contacts and docking code. No renderer or browser state is required.
import * as THREE from 'three';
import {Game} from '../src/game.js';
import {Ship,VesselTarget} from '../src/sim/ship.js';
import {NavComputer} from '../src/sim/navComputer.js';
import {FTL} from '../src/sim/ftl.js';
import {VESSEL_TYPES} from '../src/sim/vesselTypes.js';
export function stationFlight(key='lifter') {
 const body={R:1e6,GM:1e12,solid:true,relief:0,atmHeight:0,children:[],pos:new THREE.Vector3(),vel:new THREE.Vector3(),omega:new THREE.Vector3(),q:new THREE.Quaternion(),qInv:new THREE.Quaternion(),qTilt:new THREE.Quaternion(),
  data:{name:'Fixture'},groundHeight:()=>0,atmosphereAt:()=>({density:0,pressure:0,temperature:3})};
 const game={t:0,warpIndex:0,vessels:[],players:[],startDir:new THREE.Vector3(1,0,0),universe:{bodies:[body]},tell:()=>{},aboardOf:()=>[],rehome:Game.prototype.rehome,zoneAdmits:Game.prototype.zoneAdmits};
 const host=new Ship(game,VESSEL_TYPES.orbital_station,'Meridian Reach');host.ftl=new FTL(game,host);host.target=new VesselTarget(host);
 Game.prototype.placeInOrbit.call(game,host,body,1e5,0);
 const ship=new Ship(game,VESSEL_TYPES[key],key);ship.body=body;ship.legAttach=ship.type.legAttach.map(a=>new THREE.Vector3(...a));ship.ftl=new FTL(game,ship);ship.nav=new NavComputer(game,ship);
 ship.pos.copy(host.localToBody(new THREE.Vector3(-49,14,-160),new THREE.Vector3()));ship.vel.copy(host.vel);
 ship.quat.copy(host.quat).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),Math.PI));game.vessels.push(host,ship);
 const F=new THREE.Vector3(),T=new THREE.Vector3();let steps=0;
 const step=()=>{
  const dt=1/120;game.t+=dt;host.railsState(game.t,host.pos,host.vel);host._stepT=game.t;host.coastEnv();
  if(steps++%4===0)ship.nav.update(1/30);
  if(ship.parent)Game.prototype.stepChild.call(game,ship,dt);
  else{ship.computeControl(dt,F,T);ship.step(dt,F,T);ship.environment(dt);}
  Game.prototype.checkZones.call(game);
 };
 return {game,host,ship,body,step};
}
