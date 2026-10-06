// Oriented deck frames use the existing nested-vessel physics: each has a real
// local +Y floor. Underside craft and walkers therefore share one consistent frame.
import * as THREE from 'three';
const base={frameOnly:true,unlisted:true,big:false,ftl:false,mass:1,I:[1,1,1],thrust:{main:0,retro:0,belly:0,down:0,lateral:0},alpha:[0,0,0],rate:[0,0,0],hullRating:100,probes:[],seats:[],lights:[],parts:[],doors:[],slideDoors:[],interiorGravity:'artificial',aero:{cd:[0,0,0],wing:0}};
const open=['-x','+x','-z','+z','+y'];
export const DECK_FRAME_TYPES={
 tender_ventral_deck:{...base,key:'tender_ventral_deck',className:'Halyard ventral deck',radius:100,size:[40,.2,104],colliders:[{min:[-20,-.2,-92],max:[20,0,12]}],solids:[],rooms:[{id:'ventral',name:'Ventral docking deck',min:[-19.6,0,-91.6],max:[19.6,12,11.6],type:'exterior',capture:true,vacuum:true,open}],zones:[{name:'Ventral pad 3',kind:'pad',min:[-18,0,-90],max:[18,44,-40],pad:[0,0,-65],gravity:9.81,pressure:0},{name:'Ventral pad 4',kind:'pad',min:[-18,0,-40],max:[18,44,10],pad:[0,0,-14],gravity:9.81,pressure:0}]},
 tender_turnover:{...base,key:'tender_turnover',className:'Gravity turnover airlock',radius:3,colliders:[],solids:[],rooms:[{id:'chamber',name:'Sealed gravity-turnover chamber',min:[-1.15,-1.5,-1.48],max:[1.15,.9,1.48],type:'airlock'}]},
};
export class AttachedFrameVisual {
 constructor(engine){this.model={root:new THREE.Group(),loaded:true};engine.scene.add(this.model.root);this.ready=Promise.resolve(this);}
 update(){}
}
export function initDeckFrames(g,v){
 if(v.type.key!=='tender')return;
 const deck=g.addVessel('tender_ventral_deck',v.name+' ventral deck',v.registry+'-V');
 deck.dockAt(v,{name:'Ventral structure',gravity:0,pressure:0},new THREE.Vector3(0,-9.2,0),new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),Math.PI));
 deck.deckHost=v;v.deckFrames=[deck];v.turnovers=[];
 for(const [pad,z] of [[3,-65],[4,-14]]){
  const frame=g.addVessel('tender_turnover',`Pad ${pad} turnover`,v.registry+'-A'+pad);
  frame.dockAt(v,{name:'Turnover mechanism',gravity:0,pressure:1},new THREE.Vector3(17.4,-10.7,z-4.8),new THREE.Quaternion());
  const state={host:v,deck,frame,pad,z,angle:0,phase:'open',side:'inner',requested:'inner',door:1,pressure:1};
  frame.frameState=state;v.turnovers.push(state);
 }
}
export function requestTurnover(s,side){
 if(!['inner','outer'].includes(side)||s.phase!=='open')return false;
 if(side===s.side)return true;
 s.requested=side;s.phase='closing';return true;
}
export function updateDeckFrames(v,dt){
 for(const s of v.turnovers||[]){
  if(s.phase==='closing'){s.door=Math.max(0,s.door-dt/1.2);if(!s.door)s.phase='pressure';}
  else if(s.phase==='pressure'){
   const p=s.requested==='inner'?1:(v.parent?v.zone?.pressure||0:v.env?.pressure||0);s.pressure+=Math.sign(p-s.pressure)*Math.min(Math.abs(p-s.pressure),dt/5);
   if(Math.abs(s.pressure-p)<.0001)s.phase='rotating';
  }else if(s.phase==='rotating'){
   const a=s.requested==='inner'?0:Math.PI;s.angle+=Math.sign(a-s.angle)*Math.min(Math.abs(a-s.angle),dt*Math.PI/5);
   s.frame.lquat.setFromAxisAngle(new THREE.Vector3(0,0,-1),s.angle);s.frame.syncFromParent();
   if(Math.abs(s.angle-a)<.0001){s.side=s.requested;s.phase='opening';}
  }else if(s.phase==='opening'){s.door=Math.min(1,s.door+dt/1.2);if(s.door===1)s.phase='open';}
 }
}
const at=(p,q,d=1.7)=>Math.abs(p.y-q[1])<1.1&&Math.hypot(p.x-q[0],p.z-q[2])<d;
export function interactDeckFrames(v,pl,input){
 const s=v.frameState;
 if(s){
  if(s.phase!=='open'){pl.prompt={key:null,text:`Turnover airlock · ${s.phase} · ${s.pressure.toFixed(2)} bar`};return true;}
  pl.prompt={key:'F / R',text:`F: exit to ${s.side==='inner'?'ship':'ventral pad'} · R: seal and turn ${s.side==='inner'?'outward':'inward'}`};
  if(input.hit('KeyR'))requestTurnover(s,s.side==='inner'?'outer':'inner');
  if(input.hit('KeyF')){
   const dest=s.side==='inner'?s.host:s.deck,pos=s.side==='inner'?[17.4,-12.2,s.z-2.7]:[-17.4,0,s.z-7.1];
   pl.placeAboard(dest,new THREE.Vector3(...pos),new THREE.Vector3(0,0,s.side==='inner'?1:-1));pl.grounded=true;
  }
  return true;
 }
 const host=v.deckHost||v;
 for(const s of host.turnovers||[]){
  const side=v.deckHost?'outer':'inner',pos=side==='inner'?[17.4,-12.2,s.z-2.7]:[-17.4,0,s.z-7.1];
  if(!at(pl.sPos,pos))continue;
  const ready=s.phase==='open'&&s.side===side;
  pl.prompt={key:s.phase==='open'?'F':null,text:ready?'Enter gravity-turnover airlock':s.phase==='open'?'Call gravity-turnover chamber':`Turnover airlock · ${s.phase}`};
  if(input.hit('KeyF')){
   if(ready){pl.placeAboard(s.frame,new THREE.Vector3(0,-1.5,side==='inner'?1:-1),new THREE.Vector3(0,0,side==='inner'?-1:1));pl.grounded=true;}
   else requestTurnover(s,side);
  }
  return true;
 }
 return false;
}
