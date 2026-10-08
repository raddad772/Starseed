import * as THREE from 'three';
import { Rng } from '../core/rng.js';
import { manifestationReading } from './phenomena.js';
export function buildManifestations(plan,root){
 const rng=Rng.fromString(plan.seed).fork('manifestation-motes'),pose=new THREE.Object3D(),effects=[];
 const size=32,data=new Uint8Array(size*size*4);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const r=Math.hypot((x+.5)/size*2-1,(y+.5)/size*2-1),i=(y*size+x)*4;data.set([255,255,255,Math.round(Math.max(0,1-r)**2*255)],i);}
 const texture=new THREE.DataTexture(data,size,size);texture.needsUpdate=true;texture.magFilter=THREE.LinearFilter;
 for(const m of plan.manifestations){
  const n=m.kind==='seep'?70:36,material=new THREE.MeshBasicMaterial({map:texture,color:'#ffffff',transparent:true,opacity:.25,depthWrite:false,side:THREE.DoubleSide}),mesh=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1),material,n);mesh.userData.noLocalShadow=true;root.add(mesh);
  const parts=Array.from({length:n},(_,i)=>({angle:rng.range(0,Math.PI*2),radius:rng.range(.2,2),phase:rng.next(),size:m.kind==='seep'?rng.range(.035,.16):rng.range(.5,1.1)}));
  for(let i=0;i<n;i++)mesh.setColorAt(i,new THREE.Color().setHSL((m.hue+i/n*.75)%1,.7,.44));effects.push({m,parts,mesh,material});
 }
 return {effects,update(camera,time){for(const {m,parts,mesh,material} of effects){const reading=manifestationReading(m,time);material.opacity=reading.strength*(m.kind==='seep'?.45:.075);mesh.visible=reading.strength>.005;
  parts.forEach((p,i)=>{const a=p.angle+time*.045,phase=(time*.018+p.phase)%1;pose.position.set(m.pos[0]+Math.cos(a)*p.radius,m.kind==='seep'?m.pos[1]-phase*3.7:m.pos[1]-.3+Math.sin(a)*.12,m.pos[2]+Math.sin(a)*p.radius);pose.quaternion.copy(camera.quaternion);pose.scale.set(m.kind==='sheen'?p.size*3:p.size,p.size,1);pose.updateMatrix();mesh.setMatrixAt(i,pose.matrix);});mesh.instanceMatrix.needsUpdate=true;
 }}};
}
