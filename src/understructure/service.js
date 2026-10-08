import { Rng } from '../core/rng.js';
import { insidePolygon,ribbon,outsideSegments,subtractMany } from './oblique.js';

// A legible trunk with chamber-scale silhouettes and short blind branches.
// Polygon boundaries are shared by the renderer, collision and discovered map.
export function serviceSector(seed,deck,chambers){
 const rng=Rng.fromString(seed).fork('service-chambers-v2'),rooms=[],links=[];
 const room=(id,name,x,z,n,rx,rz,height=7)=>{
  const angle=rng.range(-.06,.06),polygon=Array.from({length:n},(_,i)=>[x+Math.cos(angle+i*2*Math.PI/n)*rx,z+Math.sin(angle+i*2*Math.PI/n)*rz]);
  const r={id,name,center:[x,z],polygon,height,deck};rooms.push(r);return r;
 };
 const intake=room('intake-hall','INTAKE DISTRIBUTOR',0,-42,6,39,29,10);
 const exchange=room('lower-exchange','LOWER RETURN EXCHANGE',0,-96,6,36,26,12);
 const west=room('west-store','BLIND FILTER VAULT',-48,-76,5,10,11);
 const east=room('east-store','DISUSED FILTER VAULT',48,-76,5,10,11);
 const a=room('manifold','RETURN MANIFOLD',-40,20,6,12,11);
 const b=room('blank','UNASSIGNED CAVITY',-16,20,5,7,9);
 const c=room('cables','CABLE BASEMENT',16,20,5,8,11);
 const d=room('bypass','BYPASS MANIFOLD',40,20,6,12,11);
 const e=room('blind-stub','BLIND INSPECTION STUB',-56,40,6,8,8);
 const f=room('filter-store','ABANDONED FILTER STORE',40,44,5,8,8);
 const connect=(a,b,width=6)=>links.push({id:'service-link-'+links.length,name:'SERVICE CONNECTION',a,b,polygon:ribbon(a.map((v,i)=>v-(b[i]-v)/Math.hypot(b[0]-a[0],b[1]-a[1])*(Math.abs(a[0])===72?2:0)),b.map((v,i)=>v+(v-a[i])/Math.hypot(b[0]-a[0],b[1]-a[1])*(Math.abs(b[0])===72?2:0)),width),height:4,deck});
 connect([0,-2],intake.center,4);connect(intake.center,exchange.center,7);
 connect(exchange.center,[0,-124],4);
 connect(intake.center,a.center);connect(a.center,b.center);connect(a.center,e.center);
 connect(intake.center,c.center);connect(c.center,d.center);connect(d.center,f.center);
 connect(exchange.center,west.center);connect(exchange.center,east.center);
 for(const c of chambers){const near=c.door[0]>0?72:-72;const parent=c.door[1]<-70?exchange:intake;connect(parent.center,[near,c.door[1]],6);connect([near,c.door[1]],[c.door[0]-c.doorSide*2,c.door[1]],4);}
 const regions=[...rooms,...links],floors=[],walls=[];for(const r of regions){const xs=r.polygon.map(p=>p[0]),zs=r.polygon.map(p=>p[1]);r.bounds=[Math.min(...xs),Math.max(...xs),Math.min(...zs),Math.max(...zs)];}
 const openings=[ribbon([-56,40],[-89,46],4.4),ribbon([0,0],[0,-3],4),ribbon([0,-121],[0,-128],4),...chambers.map(c=>ribbon([c.door[0]+c.doorSide*2,c.door[1]],[c.door[0]-c.doorSide*3,c.door[1]],4))];
 for(const [i,r] of regions.entries()){
  for(const polygon of subtractMany(r.polygon,regions.slice(0,i).map(q=>q.polygon)))floors.push({polygon,region:r.id,height:r.height});
  const clips=regions.filter(q=>q!==r).map(q=>q.polygon).concat(openings);
  for(let j=0;j<r.polygon.length;j++)for(const [a,b] of outsideSegments(r.polygon[j],r.polygon[(j+1)%r.polygon.length],clips))walls.push({a,b,height:r.height,region:r.id});
 }
 return {rooms,links,regions,floors,walls};
}
export const serviceAt=(sector,x,z)=>sector.regions.find(r=>x>=r.bounds[0]&&x<=r.bounds[1]&&z>=r.bounds[2]&&z<=r.bounds[3]&&insidePolygon(r.polygon,x,z));
