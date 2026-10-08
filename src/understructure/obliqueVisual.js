import * as THREE from 'three';
import { outsideSegments,subtractMany,lerp2 } from './oblique.js';

export function buildObliqueSector(plan,{addGeometry,box,cylinder,label,lamp}){
  const sector=plan.oblique,y=plan.deck;
  function panel(polygon,height,material,down=false){
    const vertices=[];for(let i=1;i<polygon.length-1;i++)for(const j of down?[0,i,i+1]:[0,i+1,i])vertices.push(polygon[j][0],height,polygon[j][1]);
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.computeVertexNormals();addGeometry(g,material);
  }
  function beam(a,b,lo,hi,width=.24,material='concrete'){
    const dx=b[0]-a[0],dz=b[1]-a[1],g=new THREE.BoxGeometry(Math.hypot(dx,dz),hi-lo,width);g.rotateY(-Math.atan2(dz,dx));g.translate((a[0]+b[0])/2,(lo+hi)/2,(a[1]+b[1])/2);addGeometry(g,material);
  }
  for(const f of sector.floors){panel(f.polygon,y-.04,f.bridge?'metal':'floor');panel(f.polygon,y-.3,'metal',true);}
  for(const wall of sector.walls)beam(wall.a,wall.b,y-.3,y+Math.min(4,wall.height));
  for(const room of sector.rooms){
    panel(room.polygon,y+room.height,'concrete',true);
    // Tall chambers retain structure above their person-sized corridor mouths.
    if(room.height>4)for(let i=0;i<room.polygon.length;i++)beam(room.polygon[i],room.polygon[(i+1)%room.polygon.length],y+4,y+room.height);
    const [x,z]=room.center;
    if(room.inner){
      panel(room.polygon,y-18,'dark');
      for(let i=0;i<room.inner.length;i++){
        const a=room.inner[i],b=room.inner[(i+1)%room.inner.length];
        for(const [u,v] of outsideSegments(a,b,sector.bridges.map(b=>b.polygon)))for(const h of [.5,1.1])cylinder([u[0],y+h,u[1]],[v[0],y+h,v[1]],.045,'rust');
        const p=lerp2(room.center,room.polygon[i],.94);cylinder([p[0],y-18,p[1]],[p[0],y+room.height,p[1]],.45,'metal');lamp(p[0],y+3,p[1],'cyan');
      }
      for(let i=0;i<sector.bridges.length;i++){
        const bridge=sector.bridges[i];
        for(let j=0;j<bridge.polygon.length;j++){
          const a=bridge.polygon[j],b=bridge.polygon[(j+1)%bridge.polygon.length];
          // Ignore bridge end caps at the surrounding walkway and open the crossing.
          if(Math.hypot(a[0]-b[0],a[1]-b[1])<5)continue;
          for(const [u,v] of outsideSegments(a,b,sector.bridges.filter((_,n)=>n!==i).map(b=>b.polygon)))for(const h of [.5,1.1])cylinder([u[0],y+h,u[1]],[v[0],y+h,v[1]],.045,'rust');
        }
      }
      // Service trunks turn with the six-sided structure, above the bridge headroom.
      for(let i=0;i<room.inner.length;i++){const a=room.inner[i],b=room.inner[(i+1)%room.inner.length];cylinder([a[0],y+9,a[1]],[b[0],y+9,b[1]],.7,'rust',12);}
    }else{
      for(let i=0;i<room.polygon.length;i++){const a=lerp2(room.center,room.polygon[i],.72),b=lerp2(room.center,room.polygon[(i+1)%room.polygon.length],.72);cylinder([a[0],y+room.height-1,a[1]],[b[0],y+room.height-1,b[1]],room.sides===3?.4:.2,'rust',12);}
      lamp(x,y+room.height-.3,z,'amber');
    }
    const a=room.polygon[1],b=room.polygon[2],p=lerp2(a,b,.5),toward=lerp2(p,room.center,.025);
    label(room.name,toward[0],y+2.7,toward[1],{size:.55,face:Math.atan2(room.center[0]-p[0],room.center[1]-p[1])});
  }
  for(const link of sector.links){
    for(const poly of subtractMany(link.polygon,[sector.entry.polygon,...sector.rooms.map(r=>r.polygon)]))panel(poly,y+4,'concrete',true);
    const midpoint=lerp2(link.a,link.b,.5);lamp(midpoint[0],y+3.8,midpoint[1],'amber');
  }
}
