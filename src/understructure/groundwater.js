import * as THREE from 'three';
import { Rng } from '../core/rng.js';

// Local visual flow with fixed instance counts, separate from world fluid physics.
// Each streak falls continuously, then wraps at the roof crack. Pools sit on rock.
export function buildGroundwater(plan,{root,mat,cylinder}) {
  const h=plan.generator,streams=[];
  if(!h.environment.wet)return {streams,update(){}};
  const rng=Rng.fromString(plan.seed).fork('groundwater-flow'),large=h.wound==='aquifer';
  const top=plan.deck+67,bottom=plan.deck-39.7,height=top-bottom,n=large?128:36;
  mat.waterFoam=new THREE.MeshStandardMaterial({color:'#d4e3dd',emissive:'#507783',emissiveIntensity:.18,roughness:.55});
  const streaks=new THREE.InstancedMesh(new THREE.CylinderGeometry(.06,.08,1,5),mat.waterFoam,n*2);
  const impacts=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.07,0),mat.waterFoam,24);
  streaks.name='falling-groundwater';impacts.name='groundwater-impact';
  // Constant conservative bounds cover every animated instance, including wraps.
  streaks.boundingSphere=new THREE.Sphere(new THREE.Vector3(0,(top+bottom)/2,-307),height*.55);
  impacts.boundingSphere=new THREE.Sphere(new THREE.Vector3(0,bottom+1,-307),20);
  root.add(streaks,impacts);
  const ripples=[],particles=[],dummy=new THREE.Object3D();
  for(const side of [-1,1]){
    const x=side*14,z=-307,radius=large?.42:.065;
    streams.push({x,z,top,bottom,radius});
    cylinder([x,bottom-.2,z],[x,bottom-.08,z],large?3.2:1.2,'water',24);
    for(let i=0;i<n;i++){
      const a=rng.range(0,Math.PI*2),r=radius*rng.range(.6,1.2);
      particles.push({x:x+Math.cos(a)*r,z:z+Math.sin(a)*r,phase:rng.next(),speed:rng.range(11,17),length:rng.range(large?1.2:.25,large?3.6:.9),width:large?1:.45});
    }
    for(let i=0;i<4;i++){
      const mesh=new THREE.Mesh(new THREE.TorusGeometry(1,.018,4,32),mat.waterFoam);mesh.rotation.x=Math.PI/2;root.add(mesh);ripples.push({mesh,x,z,phase:i/4});
    }
  }
  function update(time){
    particles.forEach((p,i)=>{
      const distance=((time*p.speed+p.phase*height)%height+height)%height;
      dummy.position.set(p.x,top-distance,p.z);dummy.rotation.set(0,0,0);
      dummy.scale.set(p.width,Math.min(p.length,Math.max(.01,2*Math.min(distance,height-distance))),p.width);dummy.updateMatrix();streaks.setMatrixAt(i,dummy.matrix);
    });streaks.instanceMatrix.needsUpdate=true;
    for(let i=0;i<24;i++){
      const stream=streams[i%2],age=((time*.8+i*.381)%1+1)%1,a=i*2.399;
      const radius=(large?2.8:.8)*age;
      dummy.position.set(stream.x+Math.cos(a)*radius,bottom+.1+(large?3:1)*4*age*(1-age),stream.z+Math.sin(a)*radius);
      dummy.scale.setScalar((1-age)*(large?1.4:.6));dummy.updateMatrix();impacts.setMatrixAt(i,dummy.matrix);
    }impacts.instanceMatrix.needsUpdate=true;
    for(const r of ripples){const age=((time*.55+r.phase)%1+1)%1;r.mesh.position.set(r.x,bottom+.025,r.z);const radius=.2+age*(large?2.7:.9);r.mesh.scale.set(radius,radius,1-age*.9);}
  }
  update(0);
  return {streams,streaks,impacts,ripples,update};
}
