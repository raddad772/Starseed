import * as THREE from 'three';
import { ACCESS } from './access.js';

export function buildAccess(plan,{root,mat,box,cylinder,lamp,label}){
  const {halfWidth:hx,halfDepth:hz,hatchZ:Z,top:Y}=ACCESS,deck=plan.deck;
  function slab(x0,x1,z0,z1,y,h,cx,cz,material){
    for(const [a,b,c,d] of [[x0,cx-hx,z0,z1],[cx+hx,x1,z0,z1],[cx-hx,cx+hx,z0,cz-hz],[cx-hx,cx+hx,cz+hz,z1]])
      if(b>a&&d>c)box((a+b)/2,y,(c+d)/2,b-a,h,d-c,material);
  }
  slab(-2,2,Z-2,Z+2,-.04,.08,0,Z,'ground');
  slab(-3,3,-2,10,Y-.16,.32,0,0,'floor');
  slab(-3,3,-2,10,-.23,.3,0,Z,'concrete');
  slab(-2,2,-2,2,deck-.16,.32,0,0,'floor');
  for(const x of [-3.15,3.15])box(x,(Y-.38)/2,4,.3,-.38-Y,12.6);
  for(const z of [-2.15,10.15])box(0,(Y-.38)/2,z,6,-.38-Y,.3);
  for(const x of [-hx-.1,hx+.1])box(x,.04,Z,.2,.08,2*hz+.4,'metal');
  for(const s of [-1,1])box(0,.04,Z+s*(hz+.1),2*hx,.08,.2,'metal');
  box(1.35,.35,Z+.8,.35,.7,.3,'metal');box(1.35,.59,Z+.958,.16,.1,.015,'amber');
  const hatch=new THREE.Group();hatch.position.set(-hx,.06,Z);root.add(hatch);
  const lid=new THREE.Mesh(new THREE.BoxGeometry(2*hx-.02,.1,2*hz-.02),mat.metal);lid.position.set(hx,-.05,0);hatch.add(lid);
  for(let x=-.45;x<=.45;x+=.3){const rib=new THREE.Mesh(new THREE.BoxGeometry(.025,.025,2*hz-.12),mat.rust);rib.position.set(x+hx,.01,0);hatch.add(rib);}
  // A fixed ladder ends in a room, with room to stand and inspect the lift.
  for(const x of [-.46,.46])cylinder([x,Y,Z+.65],[x,.22,Z+.65],.04,'metal');
  for(let y=Y+.2;y<.2;y+=.28)cylinder([-.46,y,Z+.65],[.46,y,Z+.65],.035,'rust');
  for(const z of [2.8,7])lamp(-2.75,-.55,z,'cyan');
  box(2.77,Y+.8,6,.3,1.6,2.8,'metal');box(2.56,Y+1.1,6,.06,.5,1.8,'dark');
  box(-2.72,Y+.25,4,.4,.5,2.7,'metal');
  label('access circuit',2.615,Y+1.5,6,{size:.32,face:-Math.PI/2});
  const lift=new THREE.Group();root.add(lift);
  const platform=new THREE.Mesh(new THREE.BoxGeometry(2*hx-.06,.25,2*hz-.06),mat.metal);platform.position.y=-.15;lift.add(platform);
  const inset=new THREE.Mesh(new THREE.BoxGeometry(2*hx-.2,.04,2*hz-.2),mat.floor);inset.position.y=-.015;lift.add(inset);
  // The slab above conceals the shaft tops; there are no faces at terrain height.
  function wall(x,z,w,d,lo,hi){box(x,(lo+hi)/2,z,w,hi-lo,d);}
  wall(-2.25,0,.5,4.5,deck,Y-.34);wall(0,2.25,4,.5,deck,Y-.34);
  wall(0,-2.25,4,.5,deck+4,Y-.34);
  // Recessed shaft windows look into an actual, much larger structural void.
  const windows=[[-68,-44],[-138,-98],[-202,-166]];let low=deck;
  for(const [lo,hi] of [...windows].sort((a,b)=>a[0]-b[0])){
    wall(2.25,0,.5,4.5,low,lo);for(const z of [-1.95,1.95])wall(2.25,z,.5,.6,lo,hi);
    for(const h of [lo,hi])box(2.01,h,0,.1,.15,3.6,'metal');low=hi;
  }wall(2.25,0,.5,4.5,low,Y-.34);
  // Distant architecture is visible scenery, with no hidden traversable rooms.
  box(54,-222,0,104,1,112,'dark');box(54,-25,0,104,1,112,'concrete');
  box(106,-123,0,1,196,112,'distant');
  for(const z of [-56,56])box(54,-123,z,104,196,1,'distant');
  for(const x of [24,64,96])for(const z of [-35,35]){
    cylinder([x,-222,z],[x,-25,z],3.2,'concrete',10);
    for(const y of [-58,-118,-178])box(x,y,z-3.3,1.6,.25,.1,'cyan');
  }
  for(const y of [-78,-148,-210]){box(54,y,18,104,.6,4,'metal');cylinder([3,y+1,16],[105,y+1,16],.12,'rust');}
  for(let y=-7;y>deck;y-=8){cylinder([-1.8,y,1.8],[-1.8,y-8,1.8],.06,'metal');lamp(-1.93,y,0,'cyan');}
  box(0,deck+3.15,-2.24,3,.42,.12,'metal');
  label('access return',0,deck+3.15,-2.16,{size:.3});
  return {hatch,lift};
}
