// Meridian Reach orbital port: metres, +Y is the gravity-plated deck normal.
// Structural boxes are shared by rendering, vessel contact and the walker.
const box=(min,max,material='hull',insideFace=null)=>({min,max,material,insideFace});
const rooms=[
 {id:'port-bay',name:'01 · Heavy freight bay',min:[-82,0,-70],max:[-16,28,45],open:['-z'],capture:true},
 {id:'starboard-bay',name:'02 · Arrival bay',min:[16,0,-70],max:[82,28,45],open:['-z'],capture:true},
 {id:'concourse',name:'Arrivals concourse',min:[-16,0,22],max:[16,6,38]},
 {id:'spine',name:'Service spine',min:[-6,0,-50],max:[6,5,100]},
 {id:'traffic',name:'Traffic and customs',min:[-14,0,-68],max:[14,5,-50]},
 {id:'medical',name:'Medical',min:[-28,0,55],max:[-6,5,78]},
 {id:'quarters',name:'Crew quarters',min:[6,0,55],max:[28,5,78]},
 {id:'engineering',name:'Engineering',min:[-28,0,82],max:[-6,5,98]},
 {id:'life-support',name:'Life support',min:[6,0,82],max:[28,5,98]},
 {id:'garden',name:'Hydroponics',min:[-26,0,100],max:[26,7,136]},
 {id:'control',name:'Orbital control',min:[-15,42,64],max:[15,49,90]},
];
const structure=[],passages=new Map();
for(const room of rooms) {
 const [x,y,z]=room.min,[X,Y,Z]=room.max;
 structure.push(box([x-1,y-1.4,z-1],[X+1,y,Z+1],'deck',2));
 structure.push(box([x-1,Y,z-1],[X+1,Y+1.2,Z+1],room.id==='garden'?'glass':'hull',3));
 for(const axis of [0,2])for(const sign of [-1,1]) {
  if(room.open?.includes((sign<0?'-':'+')+(axis===0?'x':'z')))continue;
  const u=axis===0?2:0,plane=(sign<0?room.min:room.max)[axis],cuts=[];
  for(const other of rooms) {
   if(other===room||other.min[1]!==y||other.min[axis]>plane+.01||other.max[axis]<plane-.01)continue;
   const lo=Math.max(room.min[u],other.min[u]),hi=Math.min(room.max[u],other.max[u]);
   if(hi-lo<2)continue;
   const crosses=other.min[axis]<plane-.01&&other.max[axis]>plane+.01;
   const width=crosses?hi-lo:Math.min(4,hi-lo),mid=(lo+hi)/2;
   cuts.push([mid-width/2,mid+width/2,Math.min(Y,other.max[1],crosses?Y:y+3.8)]);
   if(!crosses) {
    const min=[x,y,z],max=[X,Math.min(Y,other.max[1],y+3.8),Z];
    min[axis]=plane-1.1;max[axis]=plane+1.1;min[u]=mid-width/2;max[u]=mid+width/2;
    const id=`passage-${axis}-${plane}-${mid}-${y}`;
    passages.set(id,{id,name:'Doorway',type:'passage',min,max});
   }
  }
  cuts.sort((a,b)=>a[0]-b[0]);
  const wall=(a,b,base=y,top=Y)=>{
   if(b-a<.01||top-base<.01)return;
   const mn=[x,base,z],mx=[X,top,Z];mn[axis]=plane+(sign<0?-1:0);mx[axis]=plane+(sign<0?0:1);mn[u]=a;mx[u]=b;
   structure.push(box(mn,mx,room.id==='control'&&axis===2&&sign<0?'glass':'hull',axis*2+(sign>0?1:0)));
  };
  let start=room.min[u];
  for(const [a,b,h] of cuts){wall(start,a);wall(a,b,h);start=Math.max(start,b);}
  wall(start,room.max[u]);
 }
}
// Machinery stays aft of the approach lanes. These boxes are also solid in EVA.
structure.push(box([-9,-20,88],[9,0,124],'reactor'),box([-5,5,69],[5,42,85],'hull'));
for(const side of [-1,1]) {
 const ext=(a,b,y0,y1,z0,z1,m)=>structure.push(box([side>0?a:-b,y0,z0],[side>0?b:-a,y1,z1],m));
 ext(28,164,-8,-5,104,109,'truss');
 ext(88,164,-8.2,-7.6,72,172,'solar');
 ext(32,78,-16,-15.2,142,204,'radiator');
 ext(0,95,38,41,77,82,'truss');
 // External stores, clear of the flight bays.
 for(let i=0;i<3;i++)ext(37,60,-4,10,58+i*18,72+i*18,'cargo');
}
const furniture=[];
for(const side of [-1,1])for(let i=0;i<3;i++) {
 const x=side*24;furniture.push(box([x-2,0,58+i*6],[x+2,1,61+i*6],side<0?'medical':'bunk'));
}
for(const x of [-17,-7,7,17])furniture.push(box([x-2,0,105],[x+2,.8,131],'planter'));
for(const x of [-21,21])furniture.push(box([x-3,0,86],[x+3,2.8,93],'equipment'));
for(const x of [-9,0,9])furniture.push(box([x-2,42,65],[x+2,43.1,67],'console'));
const zones=[-1,1].map((side,i)=>({name:i?'02 · Arrival bay':'01 · Heavy freight bay',kind:'hangar',min:[side<0?-82:16,0,-70],max:[side<0?-16:82,28,45],gravity:9.81,pressure:1,pads:[[side*49,0,-8]],mouth:{normal:[0,0,-1],at:-70},maxCraftSize:[54,22,95]}));
// Conservative contact boxes for the curved external habitation ring.
const ringContacts=Array.from({length:64},(_,i)=>{
 const a=i*Math.PI/32,b=(i+1)*Math.PI/32,x=[Math.cos(a)*96,Math.cos(b)*96],z=[80+Math.sin(a)*96,80+Math.sin(b)*96];
 return box([Math.min(...x)-6.5,37.5,Math.min(...z)-6.5],[Math.max(...x)+6.5,50.5,Math.max(...z)+6.5]);
});
const lights=[];
for(const z of zones)for(const x of [z.min[0]+12,z.max[0]-12])for(const pz of [-50,-8,30])lights.push({pos:[x,25,pz],color:0xd4e7ff,intensity:120,range:65});
for(const r of rooms.slice(2)) {
 const length=r.max[2]-r.min[2],count=Math.max(1,Math.ceil(length/18));
 for(let i=0;i<count;i++)lights.push({pos:[(r.min[0]+r.max[0])/2,r.max[1]-.3,r.min[2]+length*(i+.5)/count],color:r.id==='garden'?0xe6ddc1:0xd6e6ff,intensity:8,range:26});
}
export const ORBITAL_STATION={
 key:'orbital_station',className:'Meridian Reach orbital port',station:true,big:true,ftl:false,
 mass:1.2e8,I:[2e12,3e12,2e12],thrust:{main:.003,retro:.003,belly:.003,down:.003,lateral:.003},alpha:[.001,.001,.001],rate:[.005,.005,.005],
 hullRating:2,maxDynPressure:1800,aero:{cd:[15000,45000,7000],wing:0},radius:245,bounds:[[-166,-22,-76],[166,80,206]],
 rooms:[...rooms,...passages.values()],zones,structure,furniture,colliders:[...structure,...furniture,...ringContacts],solids:[...structure,...furniture],lights,
 lifts:[{a:[0,0,76],b:[0,42,76],label:'Orbital control lift'}],
 seats:[{pos:[0,42,69],eye:[0,43.5,68.7],stand:[0,42,72],heading:[0,0,-1],label:'Traffic watch'}],
 engines:[],probes:[[-84,0,-72],[84,0,-72],[-165,-8,170],[165,-8,170],[0,-20,120]],
};
