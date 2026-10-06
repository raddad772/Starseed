// Preserve authored layouts while bringing the Blender habitation and EVA refits into play.
import { HALYARD_REFIT, BASTION_REFIT } from './layouts/established.data.js';
const room=(id,name,min,max,extra={})=>({id,name,min,max,type:'cabin',...extra});
function sideLock(t,{id,f,inner,outer,z,width,lo,hi,nodes,host}) {
 t.airlocks ||= []; t.entries ||= []; t.parts ||= []; t.slideDoors ||= [];t.solids ||= [];
 t.rooms.push(room(id,'EVA airlock',lo,hi,{type:'airlock',airlock:id,open:[outer>inner?'+x':'-x'],gate:{[outer>inner?'+x':'-x']:id+'-outer'}}));
 const dir=Math.sign(outer-inner);
 t.rooms.push(room(id+'-entry','Suit-lock doorway',[inner-.5,f,z-width/2],[inner+.5,f+2.2,z+width/2],{type:'door'}));
 for(const [role,plane] of [['inner',inner],['outer',outer]]) {
  const door=id+'-'+role;
  t.slideDoors.push({id:door,axis:'x',plane,u0:z-width/2,u1:z+width/2,y0:f,y1:f+2.2,rooms:[host,id],airlock:id,modeled:true});
  t.solids.push({min:[plane-.055,f,z-width/2],max:[plane+.055,f+2.2,z+width/2],door,kind:'door'});
  for(const side of [-1,1]) t.parts.push({node:nodes(role,side),door,slide:[0,0,-side*(width/2+.04)]});
 }
 t.airlocks.push({id,inner:id+'-inner',outer:id+'-outer',room:id,cycleSeconds:5});
 t.entries.push({label:'EVA airlock',inside:[(inner+outer)/2,f,z],outside:[outer+dir*.85,f,z],heading:[-dir,0,0],airlock:id});
}
// The legacy raster exports include closed leaves and thin boundary strips.
// Cut the authored moving-door aperture out of static walking collision only.
function clearDoorways(t) {
 for (const d of t.slideDoors || []) {
  const axis=d.axis==='x'?0:2,across=axis===0?2:0;
  const cut={min:[0,d.y0-.02,0],max:[0,d.y1,0]};
  cut.min[axis]=d.plane-.35;cut.max[axis]=d.plane+.35;
  cut.min[across]=d.u0;cut.max[across]=d.u1;
  t.solids=(t.solids||[]).flatMap(b=>{
   if(b.door||b.shaft||b.ride||b.min.some((v,i)=>v>=cut.max[i]||b.max[i]<=cut.min[i]))return [b];
   const core={...b,min:b.min.slice(),max:b.max.slice()},out=[];
   for(let i=0;i<3;i++){
    if(core.min[i]<cut.min[i]){const piece={...core,min:core.min.slice(),max:core.max.slice()};piece.max[i]=cut.min[i];out.push(piece);core.min[i]=cut.min[i];}
    if(core.max[i]>cut.max[i]){const piece={...core,min:core.min.slice(),max:core.max.slice()};piece.min[i]=cut.max[i];out.push(piece);core.max[i]=cut.max[i];}
   }
   return out;
  });
 }
}
export function applyEstablishedRefit({carrier:c,tender:t,yacht:y,lifter:l,tank,aux}) {
 Object.assign(t,HALYARD_REFIT);
 t.hatches=[{key:'tender-yacht',label:'Family launch',pos:[0,-6.8,-126.5]}];
 c.solids=[...c.solids.filter(s=>!BASTION_REFIT.rooms.includes(s.room)),...BASTION_REFIT.solids];
 c.areas=BASTION_REFIT.science;c.crewCapacity=84;c.interiorFinish='furnished-v1';
 c.rooms.push(room('bridge-eva-prep','Bridge suit preparation',[20,42,-282],[24.1,44.7,-278.5]));
 c.rooms.push(room('bridge-eva-link','Bridge EVA doorway',[19.5,42,-280.8],[20.5,44.2,-279.2],{type:'door'}));
 sideLock(c,{id:'bridge-eva',f:42,inner:24.1,outer:28.86,z:-280,width:1.6,lo:[24.1,42,-282],hi:[28.86,44.7,-278.5],host:'bridge-eva-prep',nodes:(r,s)=>`bastion:bridge_eva_${r}_${s}`});
 c.rooms.push(room('bridge-eva-platform','Bridge EVA platform',[29,42,-282],[33,46,-278.5],{vacuum:true,capture:true,open:['+x','-x','+z','-z','+y']}));
 c.lights.push({pos:[23,44.4,-280.2],color:0xffe3bd,intensity:12,range:11});
 l.rooms=l.rooms.filter(r=>r.id!=='hatch');l.entries=[];l.vectorPods={rate:.7};
 l.rooms.push(room('lock-link','Suit lock doorway',[-2.4,1.8,-12.2],[-1.7,4,-10.8],{type:'door'}));
 sideLock(l,{id:'eva',f:1.8,inner:-2.336,outer:-4.396,z:-11.5,width:1.4,lo:[-4.396,1.8,-13],hi:[-2.336,4.3,-10.2],host:'deck',nodes:(r,s)=>`lifter:eva_${r}_${s}`});
 for(const n of ['FL','FR','RL','RR'])l.parts.push({node:'engine_'+n,channel:'podTilt',axis:[1,0,0]});
 l.crewCapacity=2;l.interiorFinish='furnished-v1';
 y.skipNodes=['yacht:hover_vehicle'];
 y.legAttach=[[-9.8,-2.3,-10],[9.8,-2.3,-10],[-9.8,-2.3,17],[9.8,-2.3,17]];y.legLength=2.14;
 for(const side of [-1,1])for(const end of ['fore','aft'])y.parts.push({node:'gear_'+(side<0?'port_':'starboard_')+end,channel:'gearRotate',axis:[0,0,-1],angle:side*Math.PI/2});
 y.parts.push({node:'dorsal_hatch',channel:'homeHatch',slide:[0,0,2.95]});
 const rampAngle=Math.asin(3.52/Math.hypot(9.3,.09))-Math.atan2(.09,9.3);
 y.parts.push({node:'bay_door',door:'ramp',axis:[1,0,0],angle:-1.75,hinge:[0,2,25.045]},{node:'ramp_pivot',channel:'rampPivot',slide:[0,.24,3.3],angle:rampAngle});
 for(let i=0;i<3;i++)y.parts.push({node:'ramp_section_'+(i+1),door:'ramp',slide:[0,0,3*i]});
 y.doors=[{id:'ramp',label:'Garage ramp',ramp:true,min:[-3.3,-1.1,25.045],max:[3.3,2,25.205],hinge:[-1.08,25],angle:Math.PI/2+rampAngle,speed:.35,panel:[3.6,0,25],panelIn:[2.7,.2,23],interlock:'garage'}];
 y.ramps=[{door:'ramp',width:6.4,hinge:[-1.08,25],length:9.3}];
 y.rooms.push(room('garage','Runabout garage',[-3.3,-1.1,12.3],[3.3,2.1,25.05],{type:'bay',pressureDoor:'ramp',open:['+z'],gate:{'+z':'ramp'}}));
 y.slideDoors.find(d=>d.id==='garage').interlock='ramp';
 y.clamp={name:'Runabout restraint',pos:[0,-.5,18],reach:[1.5,1,2],fits:[6.4,3.1,10]};
 y.crewCapacity=7;y.interiorFinish='furnished-v1';
 y.rooms.push(room('eva','Port EVA airlock',[-13.2,-1.1,7.2],[-8.2,1.2,9.5],{type:'airlock',airlock:'eva'}));
 y.airlocks=[{id:'eva',inner:'airlock-in',outer:'airlock-out',room:'eva',cycleSeconds:5}];
 for(const d of y.slideDoors)if(d.id.startsWith('airlock-'))d.airlock='eva';
 y.entries[0].airlock='eva';
 y.inner=[{min:[-3.4,-1.4,12.15],max:[3.4,-1.1,25.1]},{min:[-3.4,2.1,12.15],max:[3.4,2.5,25.1]},{min:[-3.4,-1.1,12.15],max:[-3.3,2.1,25.1]},{min:[3.3,-1.1,12.15],max:[3.4,2.1,25.1]},{min:[-3.3,-1.1,12.15],max:[3.3,2.1,12.3]},{min:[-5,3.55,-1.2],max:[5,3.7,11.2]}];
 y.zones=[{name:'Runabout garage',kind:'hold',min:[-3.2,-1.1,12.3],max:[3.2,2.1,25.05],gravity:9.81,pressure:0,door:'ramp',snug:true},{name:'Dorsal scout pad',kind:'pad',min:[-5,3.7,-1],max:[5,14,11],gravity:9.81,pressure:0,pad:[0,3.7,5],whenFree:true}];
 y.rooms.push(room('roof','Dorsal scout pad',[-5,3.7,-1],[5,10,11],{capture:true,vacuum:true,whenFree:true,open:['-x','+x','-z','+z','+y']}));
 for(const type of [c,t,l,y,tank])for(const b of type.colliders||[])for(let i=0;i<3;i++)if(b.min[i]===b.max[i]){b.min[i]-=.025;b.max[i]+=.025;}
 tank.combatEnabled=false;tank.interiorFinish='furnished-v1';
 for(const type of [c,t,l,y,tank,aux])if(type)clearDoorways(type);
}
