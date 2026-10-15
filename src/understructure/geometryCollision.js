import * as THREE from 'three';
import { Octree } from 'three/addons/math/Octree.js';
import { Capsule } from 'three/addons/math/Capsule.js';

// Static triangle BVH made from the same meshes that are drawn. Splitting by
// centroid stores a large wall once, rather than duplicating it into octants.
export class GeometryCollision {
 constructor(meshes){
  const triangles=[];for(const mesh of meshes){mesh.updateWorldMatrix(true,false);const g=mesh.geometry,p=g.attributes.position,idx=g.index;
   for(let i=0;i<(idx?.count||p.count);i+=3){const v=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(p,idx?idx.getX(i+j):i+j).applyMatrix4(mesh.matrixWorld));const triangle=new THREE.Triangle(...v),box=new THREE.Box3().setFromPoints(v);triangles.push({triangle,box,center:box.getCenter(new THREE.Vector3())});}
  }
  this.count=triangles.length;this.test=new Octree();this.capsule=new Capsule();this.query=new THREE.Box3();this.reverse=new THREE.Triangle();this.normal=new THREE.Vector3();this.contact=new THREE.Vector3();
  const build=list=>{const box=new THREE.Box3();for(const t of list)box.union(t.box);if(list.length<=16)return {box,list};const size=box.getSize(new THREE.Vector3()),axis=size.x>size.y&&size.x>size.z?'x':size.y>size.z?'y':'z';list.sort((a,b)=>a.center[axis]-b.center[axis]);const mid=list.length>>1;return {box,left:build(list.slice(0,mid)),right:build(list.slice(mid))};};
  this.root=build(triangles);
 }
 clear(x,y,z,radius=.4,step=0){
  const c=this.capsule;c.radius=radius;c.start.set(x,y+radius,z);c.end.set(x,y+1.9-radius,z);
  this.query.min.set(x-radius,y,z-radius);this.query.max.set(x+radius,y+1.9,z+radius);const stack=[this.root];
  while(stack.length){const node=stack.pop();if(!node.box.intersectsBox(this.query))continue;if(!node.list){stack.push(node.left,node.right);continue;}
   for(const item of node.list){if(!item.box.intersectsBox(this.query))continue;let triangle=item.triangle;triangle.getNormal(this.normal);if(this.normal.dot(c.start.clone().sub(triangle.a))<0)triangle=this.reverse.set(triangle.c,triangle.b,triangle.a);
    const hit=this.test.triangleCapsuleIntersect(c,triangle);if(hit&&hit.depth>.025){if(hit.normal.y>=0&&triangle.closestPointToPoint(c.start,this.contact).y<=y+step)continue;this.lastHit={triangle:triangle.clone(),...hit};return false;}
   }
  }return true;
 }
 // The same with "up" any way (a unit vector: where weight points away from): the capsule along it from the feet
 // at p, faces wholly within `step` above the feet walked over, and an upward face under them stood on.
 clearUp(p,up,radius=.4,step=0){
  const c=this.capsule,u=_u.set(up[0],up[1],up[2]);c.radius=radius;c.start.set(p[0],p[1],p[2]).addScaledVector(u,radius);c.end.set(p[0],p[1],p[2]).addScaledVector(u,1.9-radius);
  this.query.makeEmpty().expandByPoint(c.start).expandByPoint(c.end).expandByScalar(radius);const stack=[this.root],P=_p.set(p[0],p[1],p[2]);
  while(stack.length){const node=stack.pop();if(!node.box.intersectsBox(this.query))continue;if(!node.list){stack.push(node.left,node.right);continue;}
   for(const item of node.list){if(!item.box.intersectsBox(this.query))continue;let triangle=item.triangle;
    // (wholly below the step: walked over)
    if(Math.max(_d.subVectors(triangle.a,P).dot(u),_e.subVectors(triangle.b,P).dot(u),_f.subVectors(triangle.c,P).dot(u))<=step+1e-4)continue;
    triangle.getNormal(this.normal);if(this.normal.dot(_d.copy(c.start).sub(triangle.a))<0)triangle=this.reverse.set(triangle.c,triangle.b,triangle.a);
    const hit=this.test.triangleCapsuleIntersect(c,triangle);if(hit&&hit.depth>.025){if(hit.normal.dot(u)>=-1e-3&&_e.subVectors(triangle.closestPointToPoint(c.start,this.contact),P).dot(u)<=step)continue;this.lastHit={triangle:triangle.clone(),...hit};return false;}
   }
  }return true;
 }
 // The highest walkable face (facing up within ~57 degrees) under p along -up, between top above the feet and drop
 // below them: its height over the feet along up (m), or null.
 floorAlong(p,up,top,drop){
  const u=_u.set(up[0],up[1],up[2]),ray=_ray;ray.origin.set(p[0],p[1],p[2]).addScaledVector(u,top);ray.direction.copy(u).negate();
  const len=top+drop;let best=null;const stack=[this.root];
  while(stack.length){const node=stack.pop();if(!node.box.containsPoint(ray.origin)){if(!ray.intersectBox(node.box,_h)||_h.distanceTo(ray.origin)>len)continue;}if(!node.list){stack.push(node.left,node.right);continue;}
   for(const {triangle:t} of node.list){t.getNormal(this.normal);if(this.normal.dot(u)<0.55)continue;const q=ray.intersectTriangle(t.a,t.b,t.c,false,_h);if(!q)continue;const d=q.distanceTo(ray.origin);if(d>len)continue;const h=top-d;if(best===null||h>best)best=h;}
  }return best;
 }
}
const _u=new THREE.Vector3(),_p=new THREE.Vector3(),_d=new THREE.Vector3(),_e=new THREE.Vector3(),_f=new THREE.Vector3(),_h=new THREE.Vector3(),_ray=new THREE.Ray();
