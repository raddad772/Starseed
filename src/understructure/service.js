import { Rng } from '../core/rng.js';
import { insidePolygon,ribbon,exposedSegments,rectangle,subtractMany } from './oblique.js';

// A legible trunk with chamber-scale silhouettes and short blind branches.
// Polygon boundaries are shared by the renderer, collision and discovered map.
export function serviceSector(seed,deck,chambers,traversal){
 const rng=Rng.fromString(seed).fork('service-chambers-v2'),rooms=[],links=[];
 const room=(id,name,x,z,n,rx,rz,height=7)=>{
  const angle=rng.range(-.06,.06),polygon=Array.from({length:n},(_,i)=>[x+Math.cos(angle+i*2*Math.PI/n)*rx,z+Math.sin(angle+i*2*Math.PI/n)*rz]);
  const r={id,name,center:[x,z],polygon,height,deck};rooms.push(r);return r;
 };
 for(const v of traversal.volumes)room(v.id,v.name,...v.center,v.sides,v.rx,v.rz,v.height);
 const intake=rooms.find(r=>r.id==='intake-hall'),exchange=rooms.find(r=>r.id==='lower-exchange'),e=rooms.find(r=>r.id==='blind-stub');
 const connect=(a,b,width=6)=>links.push({id:'service-link-'+links.length,name:'SERVICE CONNECTION',a,b,polygon:ribbon(a.map((v,i)=>v-(b[i]-v)/Math.hypot(b[0]-a[0],b[1]-a[1])*(Math.abs(a[0])===72?2:.7)),b.map((v,i)=>v+(v-a[i])/Math.hypot(b[0]-a[0],b[1]-a[1])*(Math.abs(b[0])===72?2:.7)),width),height:4,deck});
 const staging={id:'excavation-staging',name:'ABANDONED EXCAVATION',center:[0,-6],polygon:rectangle([-7,7,-10,-2]),height:5,deck,excavated:true};rooms.unshift(staging);
 connect([0,-10],intake.center,4);connect(intake.center,exchange.center,7);
 connect(exchange.center,[0,-124],4);
 // One narrow optional intrusion, not a circuit of interchangeable rooms.
 connect(intake.center,[-40,-4],4.4);connect([-40,-4],[-40,20],4.4);connect([-40,20],e.center,4.4);
 connect(exchange.center,[-50,-72],8);connect(exchange.center,[50,-72],8);
 for(const c of chambers.filter(c=>(c.base??deck)===deck&&!c.openVolume)){const near=c.door[0]>0?72:-72;const parent=c.door[1]<-70?exchange:intake;connect(parent.center,[near,c.door[1]],4.4);connect([near,c.door[1]],[c.door[0]-c.doorSide*2,c.door[1]],4);}
 const regions=[...rooms,...links],floors=[],walls=[];for(const r of regions){const xs=r.polygon.map(p=>p[0]),zs=r.polygon.map(p=>p[1]);r.bounds=[Math.min(...xs),Math.max(...xs),Math.min(...zs),Math.max(...zs)];}
 const external=[rectangle([-2,2,-2,2]),rectangle([-64,64,-286,-122]),...chambers.filter(c=>(c.base??deck)===deck&&!c.openVolume).map(c=>rectangle(c.bounds))];
 const openings=[...external,ribbon([-56,40],[-89,46],4.4)];
 for(const [i,r] of regions.entries()){
  for(const polygon of subtractMany(r.polygon,[...regions.slice(0,i).map(q=>q.polygon),...external]))floors.push({polygon,region:r.id,height:r.height});
  const clips=regions.filter(q=>q!==r).map(q=>q.polygon).concat(openings);
  for(let j=0;j<r.polygon.length;j++)for(const [a,b] of exposedSegments(r.polygon[j],r.polygon[(j+1)%r.polygon.length],clips))walls.push({a,b,height:r.height,region:r.id});
 }
 const seen=new Set();
 return {rooms,links,regions,floors,walls:walls.filter(w=>{const k=[w.a,w.b].map(p=>p.map(v=>v.toFixed(4)).join(',')).sort().join(';');if(seen.has(k))return false;seen.add(k);return true;})};
}
export const serviceAt=(sector,x,z)=>sector.regions.find(r=>x>=r.bounds[0]&&x<=r.bounds[1]&&z>=r.bounds[2]&&z<=r.bounds[3]&&insidePolygon(r.polygon,x,z));
