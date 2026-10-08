import { buildStaging } from './stagingVisual.js';
import * as THREE from 'three';
import { outsideSegments,insidePolygon,ribbon,rectangle,subtractMany } from './oblique.js';

export function buildService(plan,{addGeometry,box,cylinder,pipe,lamp,label}){
 const y=plan.deck,sector=plan.service;
 const panel=(poly,h,material,down=false)=>{const v=[];for(let i=1;i<poly.length-1;i++)for(const j of down?[0,i,i+1]:[0,i+1,i])v.push(poly[j][0],h,poly[j][1]);const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.computeVertexNormals();addGeometry(g,material);};
 const wall=(a,b,lo,hi)=>{const v=[a[0],lo,a[1],b[0],lo,b[1],a[0],hi,a[1],b[0],lo,b[1],b[0],hi,b[1],a[0],hi,a[1]],g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.computeVertexNormals();addGeometry(g,'concrete');};
 const fieldHoles=plan.chambers.filter(c=>c.openVolume).map(c=>rectangle(c.bounds));
 for(const f of sector.floors){for(const poly of subtractMany(f.polygon,fieldHoles))panel(poly,y,'floor');panel(f.polygon,y+f.height,'concrete',true);}
 const upperHoles=[...plan.traversal.highRoutes.map(r=>({polygon:ribbon([r.a[0],r.a[2]],[r.b[0],r.b[2]],4.5),lo:Math.min(r.a[1],r.b[1])-.1,hi:Math.max(r.a[1],r.b[1])+3.7})),...plan.chambers.filter(c=>c.base>y).map(c=>({polygon:rectangle(c.bounds),lo:c.base-(c.pitDepth??0)-.5,hi:c.ceiling+.5}))];
 const upperWall=(a,b,lo,hi)=>{
  const dx=b[0]-a[0],dz=b[1]-a[1],len=dx*dx+dz*dz,at=p=>((p[0]-a[0])*dx+(p[1]-a[1])*dz)/len;
  const ts=[0,1,...upperHoles.flatMap(h=>outsideSegments(a,b,[h.polygon]).flatMap(pair=>pair.map(at)))].sort((a,b)=>a-b);
  for(let i=1;i<ts.length;i++){if(ts[i]-ts[i-1]<.00001)continue;const t=(ts[i-1]+ts[i])/2,p=[a[0]+dx*t,a[1]+dz*t],aa=[a[0]+dx*ts[i-1],a[1]+dz*ts[i-1]],bb=[a[0]+dx*ts[i],a[1]+dz*ts[i]];let start=lo;
   for(const h of [...upperHoles.filter(h=>insidePolygon(h.polygon,...p)).sort((a,b)=>a.lo-b.lo),{lo:hi,hi}]){if(h.lo>start)wall(aa,bb,start,Math.min(hi,h.lo));start=Math.max(start,h.hi);if(start>=hi)break;}
  }
 };
 for(const w of sector.walls)wall(w.a,w.b,y-.2,y+Math.min(4,w.height));
 for(const room of sector.rooms){
  const [x,z]=room.center,h=room.height;
  for(let i=0;i<room.polygon.length;i++)upperWall(room.polygon[i],room.polygon[(i+1)%room.polygon.length],y+4,y+h);
  if(room.excavated){buildStaging(plan,{box,cylinder,pipe,lamp,addGeometry});continue;}
  if(room.id==='intake-hall')for(const xx of [-20,20]){
   cylinder([xx,y,-32],[xx,y+26,-32],5.8,'metal',20);
   for(const yy of [2,9,17,24])cylinder([xx,y+yy,-32],[xx,y+yy+.35,-32],6.15,'rust',20);
   pipe([[xx,y+24,-32],[xx,y+27,-32],[xx,y+27,-42],[xx,y+33,-42]],1.4,'rust');
   lamp(xx+(xx<0?6.2:-6.2),y+4,-34,'amber',300);
  }
  if(room.id==='lower-exchange'){
   cylinder([14,y+6,-110],[14,y+6,-82],5,'metal',20);
   for(const zz of [-108,-100,-92,-84])cylinder([14,y+6,zz],[14,y+6,zz+.3],5.4,'rust',20);
   lamp(7.5,y+4,-95,'amber',300);
  }
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
