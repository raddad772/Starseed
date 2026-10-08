import * as THREE from 'three';
import {mergeGeometries} from '../../vendor/addons/utils/BufferGeometryUtils.js';
import {fixtureLit,interiorMaterial} from './lightRig.js';
import {makeForceField} from './bigShips.js';

export class OrbitalStationVisual {
 constructor(engine,vessel) {
  this.v=vessel;this.engine=engine;this.time=0;
  const root=new THREE.Group();this.model={root,loaded:true};engine.scene.add(root);
  this.fx=new THREE.Group();engine.transparentScene.add(this.fx);this.fields=[];
  const metal=(color,roughness=.68)=>fixtureLit(new THREE.MeshStandardMaterial({color,metalness:.55,roughness}));
  const materials={hull:metal(0x8e9a9c),deck:metal(0x253240),truss:metal(0x344553),reactor:metal(0x444952),cargo:metal(0xae8152),solar:metal(0x152c4a,.35),radiator:metal(0x141a20),planter:metal(0x526454),equipment:metal(0x465a65),medical:metal(0xcbd6d5),bunk:metal(0x879898),console:metal(0x1e303c),glass:new THREE.MeshStandardMaterial({color:0x99c4d8,transparent:true,opacity:.18,depthWrite:false,roughness:.16,metalness:.1,side:THREE.DoubleSide})};
  const inside=interiorMaterial({color:0x7b8b98,metalness:.25,roughness:.78});
  const floor=interiorMaterial({color:0x263845,metalness:.2,roughness:.85});
  const amber=new THREE.MeshBasicMaterial({color:0xe0a551}),cyan=new THREE.MeshBasicMaterial({color:new THREE.Color(0x7cdeea).multiplyScalar(1.6)}),white=new THREE.MeshBasicMaterial({color:0xc7dce7});
  this.padMaterials=[];const batches=new Map();
  const add=(g,m,p=[0,0,0],rotation=null)=>{
   if(rotation)g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(rotation));
   g.translate(...p);
   if(Array.isArray(m)){const mesh=new THREE.Mesh(g,m);mesh.castShadow=mesh.receiveShadow=true;root.add(mesh);}
   else {if(!batches.has(m))batches.set(m,[]);batches.get(m).push(g);}
  };
  const block=(center,size,m)=>add(new THREE.BoxGeometry(...size),m,center);
  for(const s of [...vessel.type.structure,...vessel.type.furniture]) {
   const m=materials[s.material],size=s.max.map((x,i)=>x-s.min[i]),center=s.max.map((x,i)=>(x+s.min[i])/2);
   let faces=m;
   if(s.insideFace!==null&&s.insideFace!==undefined&&s.material!=='glass'){faces=Array(6).fill(m);faces[s.insideFace]=s.material==='deck'?floor:inside;}
   block(center,size,faces);
  }
  const label=(text,w,h,position,rotation=null)=>{
   const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=128;
   const c=canvas.getContext('2d');c.fillStyle='#10232d';c.fillRect(0,0,1024,128);c.fillStyle='#acd9e7';c.font='bold 64px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(text,512,67,990);
   const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
   add(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:texture}),position,rotation);
  };
  // Repeating ribs and edge lighting make the mouths legible from an approach.
  for(const [i,z] of vessel.type.zones.entries()) {
   const x=z.pads[0][0],padMat=new THREE.MeshBasicMaterial({color:0xe0a551});this.padMaterials.push(padMat);
   for(const pz of [-70,-45,-20,5,30,45]) {
    for(const sx of [z.min[0]-.7,z.max[0]+.7])block([sx,14,pz],[1.8,30,1.6],materials.truss);
    block([x,29,pz],[70,1.8,1.8],materials.truss);
   }
   for(const sx of [x-31,x+31])block([sx,14,-70.15],[.16,27,.08],cyan);
   block([x,27.5,-70.15],[65,.15,.08],cyan);
   for(const sx of [x-23,x+23])block([sx,.018,-9],[.3,.03,68],padMat);
   for(const pz of [-42,24])block([x,.018,pz],[46,.03,.3],padMat);
   for(let pz=-67;pz<29;pz+=8)block([x,.02,pz],[.25,.04,3],white);
   // Pedestrian route stays outside the marked landing envelope.
   for(const pz of [-50,-30,-10,10,30])block([x+(i?-29:29),.02,pz],[.65,.04,6],amber);
   label('MERIDIAN REACH  /  0'+(i+1),54,4,[x,33,-71]);
   label('0'+(i+1)+'  /  KEEP LANDING AREA CLEAR',43,2.6,[x,7,44.9],new THREE.Euler(0,Math.PI,0));
   const field=makeForceField(66,28);field.position.set(x,14,-70);this.fx.add(field);this.fields.push(field);
   // Overhead cargo crane and parked service gantry, out of the pad footprint.
   block([x,24,31],[62,1.4,2.5],materials.truss);
   block([x+(i?25:-25),19.5,31],[3,8,3],materials.cargo);
  }
  // Upper habitation/service ring, a recognisable silhouette above the port.
  add(new THREE.TorusGeometry(96,6.5,8,64),materials.hull,[0,44,80],new THREE.Euler(Math.PI/2,0,0));
  // Spaced navigation markers on the ring's outer edge.
  for(let i=0;i<48;i++) {
   const a=i*Math.PI/24,x=Math.cos(a)*102.5,z=80+Math.sin(a)*102.5;
   block([x,44,z],[1.2,.25,1.2],cyan);
  }
  for(const side of [-1,1])for(let z=76;z<172;z+=8) {
   block([side*126,-7.5,z],[76,.15,.2],materials.truss);
   for(const x of [90,108,126,144,162])block([side*x,-7.5,z+3.5],[.18,.15,7.8],materials.truss);
  }
  for(const side of [-1,1])for(let z=146;z<204;z+=5)block([side*55,-15.1,z],[45,.1,.15],materials.truss);
  // Communications mast, paired dishes and a shielded reactor below the spine.
  block([0,60,93],[1,36,1],materials.truss);
  for(const side of [-1,1]) {
   add(new THREE.SphereGeometry(7,24,12,0,Math.PI*2,0,Math.PI*.28),materials.hull,[side*18,57,93],new THREE.Euler(.45,0,side*.55));
   block([side*18,56,93],[.3,8,.3],materials.truss);
  }
  for(const r of vessel.type.rooms.slice(2).filter(r=>r.type!=='passage')) {
   const x=(r.min[0]+r.max[0])/2,z=r.max[2]-.04;
   label(r.name.toUpperCase(),Math.min(14,r.max[0]-r.min[0]-1),.65,[x,r.min[1]+2.8,z],new THREE.Euler(0,Math.PI,0));
   block([x,r.max[1]-.18,(r.min[2]+r.max[2])/2],[Math.min(8,r.max[0]-r.min[0]-1),.09,.18],white);
  }
  const leaves=metal(0x47755b);
  for(const x of [-17,-7,7,17])for(let z=107;z<131;z+=3) {
   add(new THREE.IcosahedronGeometry(.85,0),leaves,[x,1.6,z]);
  }
  label('ORBITAL CONTROL',18,1.5,[0,47,63.95]);
  label('LIFT  /  CONTROL',5,.6,[0,2.5,69]);
  for(const [material,list] of batches) {
   const geometry=mergeGeometries(list);list.forEach(g=>g.dispose());
   const mesh=new THREE.Mesh(geometry,material);mesh.castShadow=mesh.receiveShadow=true;root.add(mesh);
  }
 }
 update(dt,camWorld) {
  const v=this.v,root=this.model.root;this.time+=dt;
  root.position.copy(v.getWorldPos(new THREE.Vector3())).sub(camWorld);root.quaternion.copy(v.quat);
  this.fx.position.copy(root.position);this.fx.quaternion.copy(root.quaternion);
  root.visible=this.fx.visible=!v.dead&&root.position.length()<v.type.radius*1400;
  for(const f of this.fields)f.material.uniforms.uTime.value=this.time;
  for(let i=0;i<this.padMaterials.length;i++) {
   const guests=v.children.filter(c=>c.zone===v.type.zones[i]);
   this.padMaterials[i].color.set(guests.some(c=>c.attached)?0x70c790:guests.length?0x68cdda:0xe0a551);
  }
 }
 dispose() {
  const gs=new Set(),ms=new Set(),textures=new Set();
  for(const root of [this.model.root,this.fx]) {root.traverse(o=>{if(o.geometry)gs.add(o.geometry);for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[]) {ms.add(m);if(m.map)textures.add(m.map);}});root.removeFromParent();}
  gs.forEach(g=>g.dispose());ms.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());
 }
}
