import * as THREE from 'three';
import { Rng } from '../core/rng.js';
import { manifestationReading } from './phenomena.js';
import { spectralHazeTexture } from './spectralHaze.js';
export function buildManifestations(plan,root){
 const rng=Rng.fromString(plan.seed).fork('manifestation-motes'),pose=new THREE.Object3D(),effects=[];
 const texture=spectralHazeTexture();
 // Fill larger volumes with more small wisps. Particle dimensions stay fixed
 // in metres; room size controls only population and distribution.
 for(const m of plan.manifestations){
  const area=Math.abs(m.polygon.reduce((sum,p,i)=>{const q=m.polygon[(i+1)%m.polygon.length];return sum+p[0]*q[1]-q[0]*p[1];},0)/2),n=Math.min(1800,Math.max(60,Math.round(area*m.spread*m.spread*m.depth*.045))),material=new THREE.MeshBasicMaterial({map:texture,color:'#ffffff',transparent:true,opacity:.25,depthWrite:false,side:THREE.DoubleSide}),mesh=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1),material,n);mesh.userData.noLocalShadow=true;root.add(mesh);
  const parts=Array.from({length:n},()=>{const edge=rng.int(0,m.polygon.length-1),a=m.polygon[edge],b=m.polygon[(edge+1)%m.polygon.length],t=rng.next(),r=Math.sqrt(rng.next())*m.spread;return {x:(a[0]+(b[0]-a[0])*t-m.pos[0])*r,z:(a[1]+(b[1]-a[1])*t-m.pos[2])*r,angle:rng.range(0,Math.PI*2),phase:rng.next(),size:rng.range(.18,.45),roll:rng.range(-.9,.9)};});
  for(let i=0;i<n;i++)mesh.setColorAt(i,new THREE.Color().setHSL((m.hue+i/n*.4)%1,.22,.67));effects.push({m,parts,mesh,material});
 }
 return {effects,update(camera,time){for(const {m,parts,mesh,material} of effects){const reading=manifestationReading(m,time);material.opacity=reading.strength*(m.kind==='seep'?.24:.11);mesh.visible=reading.strength>.005;
  parts.forEach((p,i)=>{const a=p.angle+time*.32,phase=(time*.038+p.phase)%1,fade=Math.sin(Math.PI*phase)**.45;pose.position.set(m.pos[0]+p.x+Math.cos(a)*.75,m.pos[1]-.7-phase*m.depth+Math.sin(a*.8)*.22,m.pos[2]+p.z+Math.sin(a)*.75);pose.quaternion.copy(camera.quaternion);pose.rotateZ(p.roll+Math.sin(time*.55+p.angle)*.3);pose.scale.set(p.size*2.2*fade,p.size*(1+Math.sin(a)*.2)*fade,1);pose.updateMatrix();mesh.setMatrixAt(i,pose.matrix);});mesh.instanceMatrix.needsUpdate=true;
 }}};
}
