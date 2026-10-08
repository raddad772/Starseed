import * as THREE from 'three';
import { rectangle,subtractMany,outsideSegments } from './oblique.js';

export function horizontalPanel(polygon,y,down=false){
 const v=[];for(let i=1;i<polygon.length-1;i++)for(const j of down?[0,i,i+1]:[0,i+1,i])v.push(polygon[j][0],y,polygon[j][1]);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.computeVertexNormals();return g;
}
// One surface owns each point, even at four-way walkway intersections.
export function walkwaySlabs(rects,y,thickness,material,{addGeometry}){
 const polygons=rects.map(rectangle);
 for(const [i,p] of polygons.entries()){
  for(const piece of subtractMany(p,polygons.slice(0,i))){addGeometry(horizontalPanel(piece,y),material);addGeometry(horizontalPanel(piece,y-thickness,true),material);}
  for(let j=0;j<4;j++)for(const [a,b] of outsideSegments(p[j],p[(j+1)%4],polygons.filter((_,k)=>k!==i))){
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([a[0],y,a[1],b[0],y,b[1],a[0],y-thickness,a[1],b[0],y,b[1],b[0],y-thickness,b[1],a[0],y-thickness,a[1]],3));g.computeVertexNormals();addGeometry(g,material);
  }
 }
}
