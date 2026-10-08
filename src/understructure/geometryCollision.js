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
}
