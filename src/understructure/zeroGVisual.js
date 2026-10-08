import * as THREE from 'three';
import { Rng } from '../core/rng.js';

export function buildZeroGWonder(plan,root){
 const room=plan.chambers.find(c=>c.kind==='zero-g');if(!room)return {update(){},stats:{motes:0,mist:0}};
 const rng=Rng.fromString(plan.seed).fork('zero-g-wonder'),[a,b,c,d]=room.bounds,count=360,pose=new THREE.Object3D(),particles=[];
 const motes=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,0),new THREE.MeshBasicMaterial({color:'#ffffff'}),count);motes.userData.noLocalShadow=true;root.add(motes);
 for(let i=0;i<count;i++){const p=new THREE.Vector3(rng.range(a+1,b-1),rng.range(plan.deck+1,room.ceiling-1),rng.range(c+1,d-1));particles.push({p,v:new THREE.Vector3(),home:p.clone(),r:rng.range(.012,.035),phase:rng.range(0,6.28)});motes.setColorAt(i,new THREE.Color().setHSL(i/count,.65,.2+rng.next()*.25));}
 const size=64,data=new Uint8Array(size*size*4);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const r=Math.hypot((x+.5)/size*2-1,(y+.5)/size*2-1),j=(y*size+x)*4;data.set([137,176,183,Math.max(0,Math.round((1-r)**3*(r<1?130:0)))],j);}
 const texture=new THREE.DataTexture(data,size,size);texture.needsUpdate=true;texture.magFilter=THREE.LinearFilter;texture.colorSpace=THREE.SRGBColorSpace;
 const mist=new THREE.InstancedMesh(new THREE.PlaneGeometry(5,5),new THREE.MeshBasicMaterial({map:texture,transparent:true,opacity:.055,depthWrite:false,side:THREE.DoubleSide}),28);mist.userData.noLocalShadow=true;root.add(mist);
 let last=0;const player=new THREE.Vector3(),delta=new THREE.Vector3(),q=new THREE.Quaternion();
 return {stats:{motes:count,mist:28},update(time,state){
  const dt=Math.max(0,Math.min(.05,time-last));last=time;player.set(state.pos[0],state.pos[1]+1,state.pos[2]);q.setFromEuler(new THREE.Euler(state.pitch,state.yaw,0,'YXZ'));
  particles.forEach((p,i)=>{
   delta.copy(p.p).sub(player);const distance=delta.length();if(state.zeroG&&distance<3&&distance>.01){p.v.addScaledVector(delta,(1-distance/3)*dt*2.2/distance);p.v.x+=state.velocity[0]*dt*.15;p.v.y+=state.velocity[1]*dt*.15;p.v.z+=state.velocity[2]*dt*.15;}
   p.v.addScaledVector(p.home.clone().sub(p.p),dt*.06);p.v.multiplyScalar(Math.exp(-dt*.65));p.p.addScaledVector(p.v,dt);p.p.x=Math.max(a+.3,Math.min(b-.3,p.p.x));p.p.y=Math.max(plan.deck+.3,Math.min(room.ceiling-.3,p.p.y));p.p.z=Math.max(c+.3,Math.min(d-.3,p.p.z));
   pose.position.copy(p.p);pose.position.y+=Math.sin(time*.12+p.phase)*.12;pose.quaternion.setFromEuler(new THREE.Euler(time*.13,p.phase,time*.21));pose.scale.setScalar(p.r*(.65+.35*Math.sin(time*.7+p.phase)**2));pose.updateMatrix();motes.setMatrixAt(i,pose.matrix);
   if(i<28){pose.position.copy(p.p);pose.quaternion.copy(q);pose.scale.setScalar(1+Math.sin(time*.04+p.phase)*.18);pose.updateMatrix();mist.setMatrixAt(i,pose.matrix);}
  });motes.instanceMatrix.needsUpdate=true;mist.instanceMatrix.needsUpdate=true;
 }};
}
