import * as THREE from 'three';
import { Rng } from '../core/rng.js';
import { manifestationReading } from './phenomena.js';
import { spectralHazeTexture } from './spectralHaze.js';
export function buildManifestations(plan,root){
 const rng=Rng.fromString(plan.seed).fork('manifestation-motes'),pose=new THREE.Object3D(),effects=[];
 const texture=spectralHazeTexture();
 for(const m of plan.manifestations){
  const n=m.kind==='seep'?30:24,material=new THREE.MeshBasicMaterial({map:texture,color:'#ffffff',transparent:true,opacity:.25,depthWrite:false,side:THREE.DoubleSide}),mesh=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1),material,n);mesh.userData.noLocalShadow=true;root.add(mesh);
  const parts=Array.from({length:n},()=>({angle:rng.range(0,Math.PI*2),radius:rng.range(.2,1.8),phase:rng.next(),size:m.kind==='seep'?rng.range(.7,1.5):rng.range(1,2),roll:rng.range(-.65,.65)}));
  for(let i=0;i<n;i++)mesh.setColorAt(i,new THREE.Color().setHSL((m.hue+i/n*.4)%1,.22,.67));effects.push({m,parts,mesh,material});
 }
 return {effects,update(camera,time){for(const {m,parts,mesh,material} of effects){const reading=manifestationReading(m,time);material.opacity=reading.strength*(m.kind==='seep'?.24:.11);mesh.visible=reading.strength>.005;
  parts.forEach((p,i)=>{const a=p.angle+time*.025,phase=(time*.01+p.phase)%1,fade=Math.sin(Math.PI*phase)**.45;pose.position.set(m.pos[0]+Math.cos(a)*p.radius,m.kind==='seep'?m.pos[1]-.5-phase*3.2:m.pos[1]-.5+Math.sin(a)*.12,m.pos[2]+Math.sin(a)*p.radius);pose.quaternion.copy(camera.quaternion);pose.rotateZ(p.roll+Math.sin(time*.08+p.angle)*.12);pose.scale.set(p.size*(m.kind==='sheen'?3:2.1)*fade,p.size*fade,1);pose.updateMatrix();mesh.setMatrixAt(i,pose.matrix);});mesh.instanceMatrix.needsUpdate=true;
 }}};
}
