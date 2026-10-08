import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import * as THREE from 'three';
import { Rng } from '../core/rng.js';
import { outsideSegments,insidePolygon } from './oblique.js';
import { horizontalPanel } from './surfaces.js';

export function buildWaymarks(plan,{root,mat,addGeometry}){
 const rng=Rng.fromString(plan.seed).fork('faded-waymarks'),y=plan.deck;
 // Broken painted bands, physically on surfaces. No arrows, English or quest meaning.
 const palettes=['#ac8f58','#769b95','#98695b'],batches=palettes.map(()=>[]);
 for(const [i,link] of plan.service.links.entries()){
  const dx=link.b[0]-link.a[0],dz=link.b[1]-link.a[1],len=Math.hypot(dx,dz),nx=-dz/len,nz=dx/len;

  for(let t=0;t<len;t+=.7){if(rng.chance(.19))continue;const end=Math.min(len,t+rng.range(.35,.69));
   for(const offset of [1.12,1.35]){const a=[link.a[0]+dx*t/len+nx*offset,link.a[1]+dz*t/len+nz*offset],b=[link.a[0]+dx*end/len+nx*offset,link.a[1]+dz*end/len+nz*offset],w=.035;
    const p=[[a[0]-nx*w,a[1]-nz*w],[b[0]-nx*w,b[1]-nz*w],[b[0]+nx*w,b[1]+nz*w],[a[0]+nx*w,a[1]+nz*w]],g=horizontalPanel(p,y+.012);batches[i%3].push(g);
   }
  }
 }
 for(const [i,geoms] of batches.entries()){if(!geoms.length)continue;const m=new THREE.Mesh(mergeGeometries(geoms),new THREE.MeshStandardMaterial({color:palettes[i],roughness:1}));m.userData.noLocalShadow=true;root.add(m);for(const g of geoms)g.dispose();}
 if(!plan.generator.environment.life)return {colonies:0};
 const glow=new THREE.MeshBasicMaterial({color:'#ffffff',vertexColors:true,side:THREE.DoubleSide,transparent:true,opacity:.65,depthWrite:false}),positions=[],colors=[];
 const rooms=[...plan.service.rooms.filter(r=>!r.excavated),...plan.oblique.rooms,...plan.chambers.map(c=>({center:[(c.bounds[0]+c.bounds[1])/2,(c.bounds[2]+c.bounds[3])/2],polygon:[[c.bounds[0],c.bounds[2]],[c.bounds[1],c.bounds[2]],[c.bounds[1],c.bounds[3]],[c.bounds[0],c.bounds[3]]],height:c.ceiling-y}))];let colonies=0;
 for(const room of rooms){
  const [cx,cz]=room.center;
  // Fine irregular islands trace ceiling perimeter and seams; they do not floodlight it.
  for(let side=0;side<room.polygon.length;side++){
   const a=room.polygon[side],b=room.polygon[(side+1)%room.polygon.length];
   for(let t=.08;t<.95;t+=.045){if(rng.chance(.25))continue;const x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t,px=x+(cx-x)*.07,pz=z+(cz-z)*.07;
    const r=rng.range(.08,.45),h=y+room.height-.035;const col=new THREE.Color('#60b89c').multiplyScalar(rng.range(.15,.7));
    for(let k=0;k<6;k++){const angles=[k*Math.PI/3,(k+1)*Math.PI/3];positions.push(px,h,pz);colors.push(col.r,col.g,col.b,.55);for(const angle of angles){positions.push(px+Math.cos(angle)*r*rng.range(.6,1.2),h,pz+Math.sin(angle)*r);colors.push(col.r,col.g,col.b,0);}}
    colonies++;
   }
  }
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,4));g.computeVertexNormals();const m=new THREE.Mesh(g,glow);m.userData.noLocalShadow=true;root.add(m);return {colonies};
}
