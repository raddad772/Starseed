import * as THREE from 'three';
import { outsideSegments } from './oblique.js';

export function buildService(plan,{addGeometry,box,cylinder,pipe,lamp,label}){
 const y=plan.deck,sector=plan.service;
 const panel=(poly,h,material,down=false)=>{const v=[];for(let i=1;i<poly.length-1;i++)for(const j of down?[0,i,i+1]:[0,i+1,i])v.push(poly[j][0],h,poly[j][1]);const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.computeVertexNormals();addGeometry(g,material);};
 const wall=(a,b,lo,hi)=>{const v=[a[0],lo,a[1],b[0],lo,b[1],a[0],hi,a[1],b[0],lo,b[1],b[0],hi,b[1],a[0],hi,a[1]],g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.computeVertexNormals();addGeometry(g,'concrete');};
 for(const f of sector.floors){panel(f.polygon,y,'floor');panel(f.polygon,y+f.height,'concrete',true);}
 for(const w of sector.walls)wall(w.a,w.b,y-.2,y+Math.min(4,w.height));
 for(const room of sector.rooms){
  const [x,z]=room.center,h=room.height;
  for(let i=0;i<room.polygon.length;i++)wall(room.polygon[i],room.polygon[(i+1)%room.polygon.length],y+4,y+h);
  // Large trunks turn upward into the structure, with continuous curved elbows.
  const count=room.id.includes('manifold')?2:1,radius=count===2?.72:.46;
  for(let n=0;n<count;n++){
   const px=x+(n-(count-1)/2)*2.2,cross=[];
   room.polygon.forEach((a,i)=>{const b=room.polygon[(i+1)%room.polygon.length];if((a[0]-px)*(b[0]-px)<=0&&Math.abs(a[0]-b[0])>.001)cross.push(a[1]+(b[1]-a[1])*(px-a[0])/(b[0]-a[0]));});
   const lo=Math.min(...cross)+2.3,hi=Math.max(...cross)-2.3,py=y+h-1.65;
   pipe([[px,y+h+.3,lo],[px,py,lo],[px,py,hi],[px,y+h+.3,hi]],radius,'rust');
   for(let zz=lo+2;zz<hi-1;zz+=4){cylinder([px,py,zz-.075],[px,py,zz+.075],radius+.09,'metal',12);cylinder([px,py+radius,zz],[px,y+h,zz],.05,'metal');}
  }
  for(const sign of [-1,1]){const px=x+sign*2.4;lamp(px,y+h-.22,z,'amber',450);}
  const a=room.polygon[1],b=room.polygon[2],mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2;
  label(room.id,mx+(x-mx)*.002,y+2.4,mz+(z-mz)*.002,{size:.42,face:Math.atan2(x-mx,z-mz)});
 }
 for(const link of sector.links){
  // Lights on the low connector soffits establish the main line through a hub.
  const clipped=outsideSegments(link.a,link.b,sector.rooms.map(r=>r.polygon));
  for(const [a,b] of clipped){const len=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.ceil(len/9));for(let i=0;i<n;i++){const t=(i+.5)/n;lamp(a[0]+(b[0]-a[0])*t,y+3.8,a[1]+(b[1]-a[1])*t,'cyan');}}
 }
}
