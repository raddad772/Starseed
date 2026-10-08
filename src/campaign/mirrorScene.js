import * as THREE from 'three';
import { GAME_AU } from '../core/units.js';
import { pilotSeat } from '../sim/vesselTypes.js';

export function mirrorRadius(system){
  const outer=Math.max(0,...system.bodies.filter(b=>b.kind==='planet').map(b=>(b.orbit?.a||0)*(1+(b.orbit?.e||0))));
  return Math.max(20*GAME_AU,outer*1.15);
}
export function restoreMirror(g){
  const anchor=g.campaign?.generation.storyAnchors.mirror;
  g.mirrorShell=anchor?.version===1&&anchor.seed===g.seed&&Number.isFinite(anchor.radius)&&anchor.radius>g.universe.star.R
    ?{radius:anchor.radius,body:g.universe.star}:null;
}
export function placeMirrorFleet(g,reference){
  const radius=mirrorRadius(g.system),star=g.universe.star;
  g.campaign.generation.storyAnchors.mirror={version:1,seed:g.seed,systemId:`system/${g.campaign.generation.galaxySeed}`,radius,label:'Mirrored enclosure'};
  restoreMirror(g);
  g.placeInOrbit(reference,star,radius+30000-star.R,0);
  const roots=g.vessels.filter(v=>!v.parent&&v!==reference);
  roots.forEach((v,i)=>{
    v.nav.cancel(null);v.body=star;v.landed=false;v.rails=false;
    v.pos.copy(reference.pos).add(new THREE.Vector3((i+1)*8000,1000,5000).applyQuaternion(reference.quat));
    v.vel.copy(reference.vel);v.quat.copy(reference.quat);v.angVel.set(0,0,0);v.assist=1;v.targetFrame='none';
  });
  for(const root of roots)syncChildren(root);
}
export function syncChildren(root){for(const child of root.children){child.syncFromParent();syncChildren(child);}}
export function placeOutsideCraft(g,p=g.players[0]){
  const v=g.ship;
  if(p.vessel)p.releaseControls(p.vessel);
  p.ownShip=v;p.vessel=null;p.mode='eva';p.body=v.body;
  const local=new THREE.Vector3(v.type.radius*2,12,v.type.radius*1.3);
  v.localToBody(local,p.ePos);v.pointVelocity(local,p.eVel);
  const world=p.ePos.clone().add(v.body.pos),aim=v.getWorldPos(new THREE.Vector3());
  const up=new THREE.Vector3(0,1,0).applyQuaternion(v.quat);
  p.evaQuat.setFromRotationMatrix(new THREE.Matrix4().lookAt(world,aim,up));
  p.lastSeat={vessel:v,seat:pilotSeat(v.type)};p.target=v.target;p.camMode='first';p.jetFuel=1;
}
export function updateMirrorView(g){
  const shell=g.mirrorShell;
  if(!shell){g.engine.mirrorShell=null;return;}
  const relative=g.camPos.clone().sub(shell.body.pos),distance=relative.length();
  g.engine.mirrorShell={normal:relative.divideScalar(distance),height:distance-shell.radius,radius:shell.radius};
}
export function keepOutsideMirror(g){
  const shell=g.mirrorShell;if(!shell)return;
  const stop=(pos,vel,margin)=>{
    const r=pos.length(),min=shell.radius+margin;
    if(r>=min)return false;
    const normal=pos.clone().divideScalar(r||1);if(!r)normal.set(1,0,0);
    pos.copy(normal).multiplyScalar(min);
    const inward=vel.dot(normal);if(inward<0)vel.addScaledVector(normal,-inward);
    return true;
  };
  for(const v of g.vessels)if(!v.dead&&!v.parent&&v.body===shell.body&&stop(v.pos,v.vel,v.type.radius+2)){
    v.rails=false;v.nav.cancel('the mirror is closed');v.ftl.state='idle';v.ftl.speed=0;syncChildren(v);
  }
  for(const p of g.players)if(p.mode==='eva'&&p.body===shell.body)stop(p.ePos,p.eVel,2);
}
