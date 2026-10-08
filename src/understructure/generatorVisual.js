import * as THREE from 'three';
import { Rng } from '../core/rng.js';
import { generatorCycle } from './generatorHall.js';
import { buildGroundwater } from './groundwater.js';

export function buildGeneratorHall(plan,{root,scene,mat,box,cylinder,label,addGeometry}) {
  const h=plan.generator,deck=plan.deck,rng=Rng.fromString(plan.seed).fork('generator-dressing-v1');
  mat.rock=new THREE.MeshStandardMaterial({color:h.wound==='igneous'?'#525552':'#887967',map:mat.concrete?.map||null,roughness:1,flatShading:true});mat.rock.userData.webgpu={kind:'survey'};
  mat.mineral=new THREE.MeshStandardMaterial({color:'#89988a',roughness:.88});
  mat.colony=new THREE.MeshStandardMaterial({color:'#738d54',roughness:.95});
  const veg=h.environment.vegetation;if(Array.isArray(veg)&&veg.length===3&&veg.every(Number.isFinite))mat.colony.color.setRGB(...veg);
  mat.core=new THREE.MeshStandardMaterial({color:'#ffd9a0',emissive:'#ff9d45',emissiveIntensity:1,roughness:.4});
  mat.spark=new THREE.MeshBasicMaterial({color:'#ffe7b1'});
  mat.vaultNear=new THREE.MeshStandardMaterial({color:'#35515b',emissive:'#183039',emissiveIntensity:.5,roughness:1});
  mat.vaultFar=new THREE.MeshStandardMaterial({color:'#426371',emissive:'#2a4550',emissiveIntensity:.65,roughness:1});
  mat.vaultBack=new THREE.MeshBasicMaterial({color:'#192d35'});
  mat.runway=new THREE.MeshStandardMaterial({color:'#739689',emissive:'#8dc9bb',emissiveIntensity:.6});
  const live=new THREE.Group();live.name='surviving-generator-'+h.active;root.add(live);
  function ring(x,y,z,r,t,m){const g=new THREE.TorusGeometry(r,t,6,32);g.rotateX(Math.PI/2);g.translate(x,y,z);addGeometry(g,m);}
  function rock(x,y,z,sx,sy,sz,material='rock'){
    const g=new THREE.IcosahedronGeometry(1,1);g.scale(sx,sy,sz);g.rotateY(rng.range(-1,1));g.translate(x,y,z);addGeometry(g,material);
  }
  for(const core of h.cores){
    const {x,z,id,base,top}=core;
    // Tower supports and containment coils leave large, readable voids between them.
    cylinder([x,base-4,z],[x,base,z],12.5,'concrete',16);
    cylinder([x,base,z],[x,base+7,z],9,'dark',16);
    cylinder([x,top-5,z],[x,top,z],10,'metal',16);
    for(let i=0;i<8;i++){
      const a=i*Math.PI/4,px=x+Math.cos(a)*9.2,pz=z+Math.sin(a)*9.2;
      cylinder([px,base+3,pz],[px,top-2,pz],.85,i%2?'metal':'rust',6);
      box(px,deck+29,pz,2,6,2,'metal');
    }
    for(const y of [base+8,deck-3,deck+14,deck+31,top-3]){
      ring(x,y,z,10.5,1.15,'metal');ring(x,y+.9,z,10.5,.13,'rust');
    }
    for(const s of [-1,1]){
      cylinder([x+s*8,base+4,z],[x+s*13,base+4,z],1.5,'rust',12);
      cylinder([x+s*13,base+4,z],[x+s*13,deck-27,z],1.5,'rust',12);
    }
    label(String(id+1).padStart(2,'0'),x,top-2,z+10.05,{size:2.3,color:'#b0b3a2'});
    if(core.active){
      live.position.set(x,0,z);
      const plasma=new THREE.Mesh(new THREE.CylinderGeometry(2.5,3.8,52,16),mat.core);plasma.position.y=deck+9;live.add(plasma);
      for(const y of [deck-3,deck+14,deck+31]){
        const coil=new THREE.Mesh(new THREE.TorusGeometry(6.4,.38,8,40),mat.core);coil.rotation.x=Math.PI/2;coil.position.y=y;live.add(coil);
      }
    }else{
      cylinder([x,base+6,z],[x,top-4,z],3.7,'dark',10);
      // Disconnected containment sleeves and a fallen coil below the walking decks.
      for(let i=0;i<3;i++){const a=rng.range(0,6.28),px=x+Math.cos(a)*5.5,pz=z+Math.sin(a)*5.5;cylinder([px,base+8,pz],[px,deck+10+core.damage*15,pz],1.1,'metal',6);}
      rock(x+3,deck-28,z+5,6,2,4,'metal');
    }
  }
  const current=h.cores[h.active],glow=new THREE.PointLight(0xffb674,6500,125,2);
  glow.position.set(current.x,deck+16,current.z);scene.add(glow);
  const underglow=new THREE.PointLight(0xe58d43,2100,70,2);underglow.position.set(current.x,deck-13,current.z);scene.add(underglow);
  const sparkGroup=new THREE.Group();root.add(sparkGroup);
  for(let i=0;i<12;i++){
    const a=rng.range(0,6.28),m=new THREE.Mesh(new THREE.BoxGeometry(.1,rng.range(.2,.65),.1),mat.spark);
    m.userData.spark=[Math.cos(a)*rng.range(1,3),rng.range(0,1),Math.sin(a)*rng.range(1,3)];sparkGroup.add(m);
  }
  sparkGroup.position.set(current.x+8,deck+31,current.z);
  // The supply bus can be followed from the living machine towards the archive.
  for(const core of h.cores){const {x,z}=core;cylinder([x,core.top+3,z],[x,deck+52,z],.5,'rust');cylinder([x,deck+52,z],[0,deck+52,z],.5,'rust');}
  cylinder([0,deck+52,-149],[0,deck+52,-278],.65,'rust',12);
  for(let z=-151;z>-278;z-=12)box(0,deck+51.8,z,1.8,.15,.5,'runway');

  // A real opening in the end wall: rock occupies its edges, never the safe bridge.
  const b=h.breach,R=plan.reservoir;
  for(const s of [-1,1])box(s*(64+b.x)/2,(R.bottom+R.ceiling)/2,b.z-.4,64-b.x,R.ceiling-R.bottom,.8);
  box(0,(R.bottom+b.bottom)/2,b.z-.4,b.x*2,b.bottom-R.bottom,.8);
  box(0,(b.top+R.ceiling)/2,b.z-.4,b.x*2,R.ceiling-b.top,.8);
  // Continuous bedrock backs the chipped faces; no isolated floating boulders.
  for(const side of [-1,1])box(side*40,deck+22,-321,30,128,72,'rock');
  box(0,deck+82,-321,120,30,72,'rock');box(0,deck-46,-321,120,12,72,'rock');
  for(const side of [-1,1]){
    for(let i=0;i<8;i++)rock(side*rng.range(29,43),deck-17+i*10,-299+rng.range(-8,2),rng.range(5,10),rng.range(7,13),rng.range(5,10));
    for(let i=0;i<6;i++)rock(side*rng.range(26,43),deck+rng.range(-30,70),-302-i*12,9,rng.range(12,24),13);
    for(let i=0;i<8;i++){const y=deck-4+i*7;cylinder([side*24,y,-286],[side*rng.range(19,23),y+rng.range(-2,2),-289],.08,'rust');}
    // Old decks are offset by the fault. The later bracing threads between them.
    for(const y of [deck-10,deck+15,deck+52]){
      box(side*42,y+(side>0?6:0),-311,29,1.5,37,'concrete');
      cylinder([side*25,y,-293],[side*33,y-9,-320],.45,'metal');
    }
  }
  if(h.wound==='igneous'){
    for(let i=0;i<15;i++){const y=deck-30+i*5;rock(-19-i*.45,y,-292,5,5.5,4,'dark');}
    for(let i=0;i<7;i++)rock(-21+i*6,deck-27,-310-i*3,6,2,7,'dark');
  }
  if(h.environment.wet){
    for(const side of [-1,1]){
      for(let i=0;i<8;i++)rock(side*22,deck-17+i*9,-290,2,3,.5,'mineral');
    }
  }
  if(h.environment.life&&h.environment.wet){
    // Sparse native-coloured colonies at damp, sheltered rock seams. No deep roots.
    for(let i=0;i<65;i++){
      const side=i%2?1:-1,x=side*24.94,y=deck+rng.range(-7,50),z=rng.range(-313,-291);
      const patch=new THREE.IcosahedronGeometry(1,1);patch.scale(.16,rng.range(.3,1.2),rng.range(.4,1.1));patch.translate(x,y,z);addGeometry(patch,'colony');
    }
  }
  // Optional high service bridge and refuge platform. Collider uses these exact extents.
  const y=deck+42,spur=h.spur,p=h.lookout;
  box(0,y-.26,(-270-321)/2,spur.width,.44,51,'metal');
  box((p[0]+p[1])/2,y-.34,(p[2]+p[3])/2,p[1]-p[0],.6,p[3]-p[2],'floor');
  const rail=(a,b)=>{for(const dy of [.5,1.1])cylinder([a[0],y+dy,a[1]],[b[0],y+dy,b[1]],.05,'rust');const n=Math.ceil(Math.hypot(a[0]-b[0],a[1]-b[1])/4);for(let i=0;i<=n;i++)cylinder([a[0]+(b[0]-a[0])*i/n,y,a[1]+(b[1]-a[1])*i/n],[a[0]+(b[0]-a[0])*i/n,y+1.1,a[1]+(b[1]-a[1])*i/n],.045,'metal');};
  for(const s of [-1,1]){rail([s*1.9,-270.5],[s*1.9,-321]);rail([s*2,-321],[s*8.8,-321]);rail([s*8.8,-321],[s*8.8,-333.8]);}
  rail([-8.8,-333.8],[8.8,-333.8]);
  for(let z=-278;z>-326;z-=8){for(const s of [-1,1]){cylinder([s*2.1,y-.3,z],[s*20,y-16,z-4],.3,'metal');box(s*1.8,y+.06,z,.15,.06,.9,'amber');}}
  box(0,y+3,-287,4.5,.65,.18,'dark');
  for(const side of [-1,1])cylinder([side*2.15,y,-287],[side*2.15,y+3.35,-287],.08,'metal');
  label('FAULT INSPECTION',0,y+3,-286.895,{size:.42,color:'#c0b392'});

  // Several-depth parallax vista, not a screen-space skybox. This extent is scenery.
  const v=h.horizon,c=(v.near+v.far)/2,d=v.near-v.far;
  box(0,v.bottom-4,c,v.width,8,d,'vaultBack');box(0,v.ceiling+4,c,v.width,8,d,'vaultBack');
  for(const s of [-1,1])box(s*v.width/2,(v.bottom+v.ceiling)/2,c,8,v.ceiling-v.bottom,d,'vaultBack');
  box(0,(v.bottom+v.ceiling)/2,v.far-4,v.width,v.ceiling-v.bottom,8,'vaultBack');
  for(const z of [-402,-590,-835,-1120]){
    const distant=z< -700?'vaultFar':'vaultNear';
    for(const x of [-185,-93,93,185]){
      box(x,(v.bottom+v.ceiling)/2,z,12,v.ceiling-v.bottom,18,distant);
      for(const level of [-210,-92,0,74]){box(x,deck+level,z,25,9,28,distant);box(x,deck+level+5,z+14.1,7,1.2,.15,'runway');}
    }
    for(const level of [-210,-92,74]){
      box(0,deck+level,z,v.width,4,14,distant);
      for(let x=-240;x<=240;x+=12)box(x,deck+level+2.2,z+7,2.2,.35,.5,'runway');
    }
    // Broken central deck leaves a view down into the vertical continuation.
    for(const s of [-1,1])box(s*150,deck,z,245,4,20,distant);
  }
  for(const x of [-56,56]){
    cylinder([x,v.bottom,-665],[x,v.ceiling,-665],21,'vaultNear',12);
    for(let yy=v.bottom+25;yy<v.ceiling;yy+=36)ring(x,yy,-665,22,1.5,'vaultFar');
  }
  // Human-sized maintenance bays make the apparent scale unambiguous.
  for(let x=-190;x<=190;x+=14){box(x,deck+77,-394.9,3,4,.18,'dark');box(x,deck+79.3,-394.7,3,.16,.1,'amber');}
  const faultLight=new THREE.PointLight(0xb7c5ad,450,75,2);faultLight.position.set(0,deck+47,-305);scene.add(faultLight);
  const farGlow=new THREE.PointLight(0x69988e,10000,420,2);farGlow.position.set(0,deck-40,-520);scene.add(farGlow);
  const groundwater=buildGroundwater(plan,{root,mat,cylinder});
  let reading=generatorCycle(h,0);
  return {get reading(){return reading;},live,groundwater,update(time){
    groundwater.update(time);
    reading=generatorCycle(h,time);mat.core.emissiveIntensity=.65+reading.power*3.2;
    glow.intensity=1800+reading.power*9500;underglow.intensity=800+reading.power*2800;
    mat.runway.emissiveIntensity=1.8*reading.sag;farGlow.intensity=8000+reading.power*5000;
    sparkGroup.visible=reading.spark>.01;
    for(const m of sparkGroup.children){const [x,y,z]=m.userData.spark;m.position.set(x*(1+reading.spark),-y*5*(1-reading.spark),z*(1+reading.spark));}
  }};
}
