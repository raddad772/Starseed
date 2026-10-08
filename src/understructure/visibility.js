import * as THREE from 'three';
import { insidePolygon,intersectPolygon,rectangle,ribbon } from './oblique.js';

// Conservative current-camera portal traversal for illumination only. Emissive
// fixture meshes are never distance-switched. No queries or frame-old results.
export function lightingCells(plan){
 const y=plan.deck,R=plan.reservoir;
 const cells=[...plan.service.regions,...plan.oblique.regions].map(r=>({id:r.id,polygon:r.polygon,lo:y-.5,hi:y+r.height}));
 for(const c of plan.chambers)cells.push({id:c.id,polygon:rectangle(c.bounds),lo:y-12,hi:c.ceiling});
 cells.push({id:'hall',polygon:rectangle([-64,64,R.far,R.near]),lo:R.bottom,hi:R.ceiling},
  {id:'shaft',polygon:rectangle([-2,2,-2,2]),lo:y,hi:plan.access.top+.5},
  {id:'bunker',polygon:rectangle(plan.access.room),lo:plan.access.top-.2,hi:.5});
 for(const [i,r] of plan.routes.entries())if(r.covered)cells.push({id:'gallery-'+i,polygon:ribbon([r.a[0],r.a[2]],[r.b[0],r.b[2]],4.4),lo:Math.min(r.a[1],r.b[1])-.4,hi:Math.max(r.a[1],r.b[1])+3.6});
 const edges=cells.map(()=>[]);
 for(let i=0;i<cells.length;i++)for(let j=i+1;j<cells.length;j++){
  const a=cells[i],b=cells[j],lo=Math.max(a.lo,b.lo),hi=Math.min(a.hi,b.hi);if(hi<lo)continue;
  const p=intersectPolygon(a.polygon,b.polygon);if(p.length<2)continue;
  const xs=p.map(p=>p[0]),zs=p.map(p=>p[1]);const box=new THREE.Box3(new THREE.Vector3(Math.min(...xs)-.1,lo,Math.min(...zs)-.1),new THREE.Vector3(Math.max(...xs)+.1,hi,Math.max(...zs)+.1));
  edges[i].push({to:j,box});edges[j].push({to:i,box});
 }
 const membership=p=>cells.flatMap((c,i)=>p.y>=c.lo-1&&p.y<=c.hi+.4&&insidePolygon(c.polygon,p.x,p.z)?[i]:[]);
 return {cells,edges,membership,visible(camera){
  const start=membership(camera.position);if(!start.length)return null;
  const frustum=new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
  const seen=new Set(start),queue=[...start];for(let k=0;k<queue.length;k++)for(const edge of edges[queue[k]])if(!seen.has(edge.to)&&frustum.intersectsBox(edge.box)){seen.add(edge.to);queue.push(edge.to);}return seen;
 }};
}
