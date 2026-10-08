import * as THREE from 'three';
import { Rng,hash3f } from '../core/rng.js';

// A bounded field of world-anchored dust. Standard lit material means the hand
// light and real fixtures reveal it; it does not glow with the light switched off.
export function buildAirDust(plan,root){
 const key=Rng.fromString(plan.seed).fork('air-dust').u32(),count=500,pose=new THREE.Object3D(),anchors=[];
 const material=new THREE.MeshStandardMaterial({color:'#aeb8aa',roughness:1,transparent:true,opacity:.22,depthWrite:false,side:THREE.DoubleSide});
 const mesh=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1),material,count);mesh.userData.noLocalShadow=true;mesh.frustumCulled=false;root.add(mesh);let cell='';
 return {mesh,stats:{count},update(camera,time){
  mesh.visible=camera.position.y<-.6;if(!mesh.visible)return;
  const cx=Math.floor(camera.position.x/8),cy=Math.floor(camera.position.y/8),cz=Math.floor(camera.position.z/8),id=[cx,cy,cz].join(',');
  if(id!==cell){cell=id;anchors.length=0;for(let x=cx-2;x<=cx+2;x++)for(let y=cy-2;y<=cy+2;y++)for(let z=cz-2;z<=cz+2;z++)for(let i=0;i<4;i++){
   const h=n=>hash3f(x,y,z,key+i*17+n);anchors.push({x:(x+h(0))*8,y:(y+h(1))*8,z:(z+h(2))*8,phase:h(3)*6.28,r:.012+h(4)*.023});
  }}
  anchors.forEach((p,i)=>{pose.position.set(p.x+Math.sin(time*.04+p.phase)*.15,p.y+Math.sin(time*.035+p.phase)*.2,p.z+Math.cos(time*.028+p.phase)*.15);pose.quaternion.copy(camera.quaternion);const distance=pose.position.distanceTo(camera.position),fade=Math.min(1,Math.max(0,(distance-.35)/1.5))*Math.min(1,Math.max(0,(22-distance)/6));pose.scale.set(p.r*fade,p.r*.65*fade,1);pose.updateMatrix();mesh.setMatrixAt(i,pose.matrix);});mesh.instanceMatrix.needsUpdate=true;
 }};
}
