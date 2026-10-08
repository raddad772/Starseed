import * as THREE from 'three';

// Non-humanoid inspection crawlers: one exhausted actuator, no weapons or limbs.
export function buildDataDrone(fragment,index,{root,mat}){
  const group=new THREE.Group();group.position.set(fragment.pos[0]+1.25,fragment.pos[1],fragment.pos[2]+1.35);group.rotation.y=.25+(index%3)*.4;root.add(group);
  const add=(g,m,x,y,z)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);group.add(o);return o;};
  add(new THREE.BoxGeometry(.62,.25,.82),mat.metal,0,.32,0);
  const cover=add(new THREE.BoxGeometry(.59,.06,.72),mat.rust,0,.48,.04);cover.rotation.z=-.15;
  add(new THREE.BoxGeometry(.23,.035,.25),mat.dark,.13,.49,-.12);
  const flap=add(new THREE.BoxGeometry(.24,.025,.29),mat.rust,.28,.52,-.12);flap.rotation.z=-.65;
  for(let i=0;i<3;i++)add(new THREE.BoxGeometry(.025,.02,.2),mat.dark,-.17+i*.045,.521,-.02);
  const wheels=[];
  for(const side of [-1,1])for(const z of [-.28,.28]){
    const wheel=add(new THREE.CylinderGeometry(.15,.15,.12,10),mat.dark,side*.34,.16,z);wheel.rotation.z=Math.PI/2;wheels.push(wheel);
    const hub=add(new THREE.BoxGeometry(.015,.15,.035),mat.rust,side*.41,.16,z);wheels.push(hub);
  }
  const sensor=new THREE.Group();sensor.position.set(0,.59,-.22);group.add(sensor);
  const housing=new THREE.Mesh(new THREE.BoxGeometry(.29,.13,.21),mat.metal);sensor.add(housing);
  const eye=new THREE.Mesh(new THREE.BoxGeometry(.18,.045,.012),mat.amber);eye.position.z=-.112;sensor.add(eye);
  // A bent cable spool and loose access flap give it a maintenance function.
  const spool=add(new THREE.TorusGeometry(.15,.035,5,12),mat.rust,-.12,.52,.24);spool.rotation.y=Math.PI/2;
  return {id:fragment.id,group,sensor,eye,update(state){
    const recovered=state.fragments.has(fragment.id),t=state.time+index*2.3,effort=Math.max(0,Math.sin(t*.45))**9;
    sensor.rotation.y=recovered?.08:Math.sin(t*.21)*.18;
    wheels[0].rotation.x=wheels[1].rotation.x=recovered?0:effort*.22;
    eye.material=recovered?mat.dark:(effort>.2?mat.cyan:mat.amber);
  }};
}
