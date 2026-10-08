import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { Rng } from '../core/rng.js';
import { TILE, DECK, key, terrainHeight } from './layout.js';
import { buildChambers } from './chambers.js';
import { buildMegavault } from './megavault.js';
import { buildMechanisms } from './mechanisms.js';

export function buildScene(plan) {
  const rng=Rng.fromString(plan.seed).fork('surfaces'), scene=new THREE.Scene();
  scene.background=new THREE.Color('#87908a'); scene.fog=new THREE.FogExp2('#87908a',.006);
  const root=new THREE.Group(); scene.add(root);
  const batches=new Map(), lamps=[], landmarks=[];
  function texture() {
    const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d');
    ctx.fillStyle='#999d94';ctx.fillRect(0,0,256,256);
    for(let i=0;i<13000;i++){const v=rng.int(60,170);ctx.fillStyle=`rgba(${v},${v},${v},${rng.range(.05,.22)})`;ctx.fillRect(rng.int(0,255),rng.int(0,255),rng.int(1,3),rng.int(1,5));}
    ctx.fillStyle='#20282030';ctx.fillRect(0,0,256,2);ctx.fillRect(0,0,2,256);
    for(let i=0;i<35;i++){ctx.fillStyle='#303e3012';ctx.fillRect(rng.int(0,255),0,rng.int(2,5),rng.int(25,255));}
    const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(1,1);t.colorSpace=THREE.SRGBColorSpace;return t;
  }
  const tex=texture();
  // The raw renderer consumes meshes, not Three's background/fog convenience fields.
  const skyGeo=new THREE.SphereGeometry(410,32,16),skyColors=[];
  for(let i=0;i<skyGeo.attributes.position.count;i++){
    const h=skyGeo.attributes.position.getY(i)/410,c=new THREE.Color('#acaa90').lerp(new THREE.Color('#526e76'),Math.max(0,h));skyColors.push(c.r,c.g,c.b);
  }
  skyGeo.setAttribute('color',new THREE.Float32BufferAttribute(skyColors,3));
  const sky=new THREE.Mesh(skyGeo,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide}));scene.add(sky);
  const sunDisc=new THREE.Mesh(new THREE.SphereGeometry(6,16,12),new THREE.MeshBasicMaterial({color:'#ffe3b1'}));sunDisc.position.set(-180,160,-290);scene.add(sunDisc);
  const mat={
    concrete:new THREE.MeshStandardMaterial({color:'#747e72',map:tex,roughness:.96}),
    floor:new THREE.MeshStandardMaterial({color:'#525e55',map:tex,roughness:.87}),
    metal:new THREE.MeshStandardMaterial({color:'#394b46',roughness:.6,metalness:.55}),
    rust:new THREE.MeshStandardMaterial({color:'#8c6342',roughness:.9,metalness:.25}),
    dark:new THREE.MeshStandardMaterial({color:'#152626',roughness:.78}),
    amber:new THREE.MeshStandardMaterial({color:'#d2ae6e',emissive:'#ffc075',emissiveIntensity:1.3}),
    cyan:new THREE.MeshStandardMaterial({color:'#9dbab1',emissive:'#b9efe0',emissiveIntensity:1.1}),
    ground:new THREE.MeshStandardMaterial({color:'#6c7260',map:tex,roughness:1}),
    water:new THREE.MeshStandardMaterial({color:'#1b3e3a',metalness:.55,roughness:.23}),
    distant:new THREE.MeshStandardMaterial({color:'#2c4248',roughness:.9}),
    abyss:new THREE.MeshStandardMaterial({color:'#0a1a22',roughness:1}),
  };
  function addGeometry(g,m){
    if(g.index){const indexed=g;g=g.toNonIndexed();indexed.dispose();}
    const uv=[],p=g.attributes.position,n=g.attributes.normal;
    for(let i=0;i<p.count;i++){
      const ax=Math.abs(n.getX(i)),ay=Math.abs(n.getY(i)),az=Math.abs(n.getZ(i));
      uv.push((ax>Math.max(ay,az)?p.getZ(i):p.getX(i))/3,(ay>Math.max(ax,az)?p.getZ(i):p.getY(i))/3);
    }
    g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
    if(!batches.has(m))batches.set(m,[]);batches.get(m).push(g);
  }
  function box(x,y,z,w,h,d,m='concrete'){const g=new THREE.BoxGeometry(w,h,d);g.translate(x,y,z);addGeometry(g,m);}
  function cylinder(a,b,r,m='rust',segments=8){const dir=new THREE.Vector3().subVectors(new THREE.Vector3(...b),new THREE.Vector3(...a));const g=new THREE.CylinderGeometry(r,r,dir.length(),segments);g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),dir.normalize()));g.translate((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);addGeometry(g,m);}
  function label(text,x,y,z,{size=1.3,face=0,color='#bcc9b6'}={}) {
    const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');
    ctx.fillStyle=color;ctx.font='bold 62px monospace';ctx.textAlign='center';ctx.textBaseline='middle';const measured=ctx.measureText(text).width;if(measured>480)ctx.font=`bold ${Math.floor(62*480/measured)}px monospace`;ctx.fillText(text,256,64);
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(size*4,size),new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,side:THREE.DoubleSide}));mesh.position.set(x,y,z);mesh.rotation.y=face;root.add(mesh);return mesh;
  }
  function lamp(x,y,z,color='amber') {box(x,y,z,.7,.07,.22,color);lamps.push({pos:new THREE.Vector3(x,y-.18,z),color:color==='amber'?0xffcb8e:0xb9e0d4});}
  // Terrain is triangulated around, rather than across, a four-metre hatch opening.
  const verts=[],N=130,S=4;
  for(let iz=-N/2;iz<N/2;iz++)for(let ix=-N/2;ix<N/2;ix++) {
    const x=ix*S-2,z=iz*S-2;if(x===-2&&z===-2)continue;
    const a=[x,terrainHeight(x,z),z],b=[x+S,terrainHeight(x+S,z),z],c=[x+S,terrainHeight(x+S,z+S),z+S],d=[x,terrainHeight(x,z+S),z+S];
    verts.push(...a,...d,...b,...b,...d,...c);
  }
  const ground=new THREE.BufferGeometry();ground.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));ground.computeVertexNormals();addGeometry(ground,'ground');
  for(let i=0;i<110;i++) {
    const x=rng.range(-170,170),z=rng.range(-180,100);if(Math.hypot(x,z)<16)continue;
    const r=rng.range(.2,1.4),g=new THREE.IcosahedronGeometry(r,0);g.scale(1,.65,1.2);g.translate(x,terrainHeight(x,z)+r*.25,z);addGeometry(g,'ground');
  }
  // A person-sized hatch covers a 1.3 x 1.7 m opening. Fill the coarse terrain
  // tile around it; the larger shaft is entirely concealed beneath this collar.
  const {halfWidth:hx,halfDepth:hz}=plan.access;
  function collar(y,material){for(const s of [-1,1]){box(s*(2+hx)/2,y,0,2-hx,.32,4,material);box(0,y,s*(2+hz)/2,2*hx,.32,2-hz,material);}}
  collar(-.16,'ground');collar(DECK-.16,'floor');
  box(-hx-.1,.04,0,.2,.08,2*hz+.4,'metal');box(hx+.1,.04,0,.2,.08,2*hz+.4,'metal');
  box(0,.04,-hz-.1,2*hx,.08,.2,'metal');box(0,.04,hz+.1,2*hx,.08,.2,'metal');
  for(let x=-.5;x<=.5;x+=.25)box(x,.087,hz+.1,.08,.008,.12,'rust');
  box(1.35,.35,.8,.35,.7,.3,'metal');box(1.35,.59,.958,.16,.1,.015,'amber');
  const hatch=new THREE.Group();hatch.position.set(-hx,.06,0);root.add(hatch);
  const lid=new THREE.Mesh(new THREE.BoxGeometry(2*hx-.02,.1,2*hz-.02),mat.metal);lid.position.set(hx,-.05,0);hatch.add(lid);
  for(let x=-.45;x<=.45;x+=.3){const rib=new THREE.Mesh(new THREE.BoxGeometry(.025,.025,2*hz-.12),mat.rust);rib.position.set(x+hx,.01,0);hatch.add(rib);}
  const lift=new THREE.Group();root.add(lift);
  const platform=new THREE.Mesh(new THREE.BoxGeometry(2*hx-.06,.25,2*hz-.06),mat.metal);platform.position.y=-.15;lift.add(platform);
  const inset=new THREE.Mesh(new THREE.BoxGeometry(2*hx-.2,.04,2*hz-.2),mat.floor);inset.position.y=-.015;lift.add(inset);
  // The three shaft walls are solid; the fourth opens onto the basement only at its landing.
  box(-2.25,DECK/2,0,.5,-DECK,4.5);box(2.25,DECK/2,0,.5,-DECK,4.5);box(0,DECK/2,2.25,4,.0-DECK,.5);
  box(0,(DECK+4)/2,-2.25,4,-DECK-4,.5);
  for(let y=-3;y>DECK;y-=4){cylinder([-1.8,y,1.8],[-1.8,y-4,1.8],.06,'metal');lamp(1.93,y,0,'cyan');}
  for(let level=1;level<=8;level++){const y=-level*30;label(String(level).padStart(2,'0')+' / TRANSIT',0,y+2,-1.99,{size:.4});box(0,y,-2.01,3.8,.15,.07,'amber');}
  const tileSet=new Set(plan.tiles.map(t=>key(t.x,t.z)));
  for(const t of plan.tiles) {
    if(t.x===0&&t.z===0)continue;
    const x=t.x*TILE,z=t.z*TILE;
    box(x,DECK-.17,z,TILE,.3,TILE,'floor');box(x,DECK+4.2,z,TILE,.3,TILE);
    // A drain down the trunk, transverse slabs and overhead utilities provide a consistent direction.
    if(t.x===0||t.region==='conduit') {
      box(x,DECK+.015,z,.32,.025,3.8,'dark');
      for(let d=-1.5;d<2;d+=.5)box(x,DECK+.035,z+d,.33,.02,.045,'metal');
      cylinder([x+1.35,DECK+3.4,z-2],[x+1.35,DECK+3.4,z+2],.13);
    }
    if(t.x===0&&t.z<-2&&!tileSet.has(key(t.x-1,t.z))&&!tileSet.has(key(t.x+1,t.z))) {
      // An inward-facing half-round culvert, with a person-height spring line.
      const points=[];
      for(let j=0;j<16;j++){
        const a=j*Math.PI/16,b=(j+1)*Math.PI/16;
        const A=[x+1.97*Math.cos(a),DECK+2+1.97*Math.sin(a),z-2],B=[x+1.97*Math.cos(b),DECK+2+1.97*Math.sin(b),z-2];
        const C=[B[0],B[1],z+2],D=[A[0],A[1],z+2];points.push(...A,...D,...B,...B,...D,...C);
      }
      const arch=new THREE.BufferGeometry();arch.setAttribute('position',new THREE.Float32BufferAttribute(points,3));arch.computeVertexNormals();addGeometry(arch,'concrete');
    }
    if((t.x*3+t.z)%4===0)lamp(x,DECK+3.95,z,t.region.startsWith('room:')?'amber':'cyan');
    if(t.z%3===0&&t.x===0){box(-1.9,DECK+2,z,.18,4,.22,'metal');box(1.9,DECK+2,z,.18,4,.22,'metal');box(0,DECK+3.8,z,3.8,.2,.22,'metal');}
  }
  for(const wall of plan.walls){if(wall.region==='access'&&wall.z>=-2)continue;box(wall.x,DECK+2,wall.z,wall.axis==='x'?4:.24,4,wall.axis==='z'?4:.24);}
  for(const room of plan.rooms) {
    const x=room.x*TILE,z=room.z*TILE;
    // Recessed, wall-mounted equipment keeps the entire walkable plan free of hidden obstacles.
    const back=z-room.rz*TILE-1.83;
    if(!tileSet.has(key(room.x,room.z-room.rz-1))) {
      label(room.code,x,DECK+2.45,back+.1,{size:.45});
      for(let n=-1;n<=1;n++){box(x+n*1.15,DECK+1,back,.8,1.4,.16,'metal');box(x+n*1.15,DECK+1.3,back+.095,.07,.08,.025,'amber');}
    }
    if(room.kind==='Storm collector')for(let i=-1;i<=1;i++)cylinder([x+i*1.2,DECK+3.7,z-room.rz*4],[x+i*1.2,DECK+3.7,z+room.rz*4],.22,'rust');
  }
  label('RETURN / 07',0,DECK+2.7,-5,{size:.5,face:Math.PI});
  label('LOWER COLLECTION',0,DECK+3.2,-117.8,{size:.7});
  // Reservoir: the walkway is twenty-five metres above water, under a buried twenty-two-metre vault.
  const R=plan.reservoir;
  box(0,R.bottom-.6,(R.near+R.far)/2,128,1,164,'dark');
  box(-64.4,(R.bottom+R.ceiling)/2,-204,.8,R.ceiling-R.bottom,164);box(64.4,(R.bottom+R.ceiling)/2,-204,.8,R.ceiling-R.bottom,164);
  box(0,(R.bottom+R.ceiling)/2,R.far-.4,128,R.ceiling-R.bottom,.8);
  // Front wall leaves a real 4 m door from the service conduit.
  box(-33,(R.bottom+R.ceiling)/2,R.near+.3,62,R.ceiling-R.bottom,.6);box(33,(R.bottom+R.ceiling)/2,R.near+.3,62,R.ceiling-R.bottom,.6);
  box(0,(R.ceiling+DECK+4)/2,R.near+.3,4,R.ceiling-DECK-4,.6);box(0,(R.bottom+DECK)/2,R.near+.3,4,DECK-R.bottom,.6);
  box(0,R.ceiling+.4,-204,128,.8,164);
  const water=new THREE.Mesh(new THREE.PlaneGeometry(127,163,16,24),mat.water);water.rotation.x=-Math.PI/2;water.position.set(0,R.water,-204);root.add(water);
  for(const [x0,x1,z0,z1] of plan.walkways)box((x0+x1)/2,DECK-.35,(z0+z1)/2,x1-x0,.7,z1-z0,'floor');
  function rail(x0,z0,x1,z1){cylinder([x0,DECK+1.1,z0],[x1,DECK+1.1,z1],.055,'rust');cylinder([x0,DECK+.52,z0],[x1,DECK+.52,z1],.035,'metal');const len=Math.hypot(x1-x0,z1-z0),n=Math.ceil(len/4);for(let i=0;i<=n;i++){const t=i/n;cylinder([x0+(x1-x0)*t,DECK,z0+(z1-z0)*t],[x0+(x1-x0)*t,DECK+1.1,z0+(z1-z0)*t],.035,'metal');}}
  // Rail gaps at the crossing and the perimeter keep all branches passable.
  for(const x of [-1.95,1.95]) {rail(x,-126,x,-202);rail(x,-206,x,-282);}
  for(const x of [-60,60]){rail(x,-126,x,-202);rail(x,-206,x,-282);}
  for(const z of [-126,-202,-206,-282]){rail(-60,z,-2,z);rail(2,z,60,z);}
  for(const {x,z,width,depth} of plan.pillars) {
    box(x,(R.bottom+R.ceiling)/2,z,width,R.ceiling-R.bottom,depth);box(x,R.ceiling-2,z,7,4,8);
    box(x,DECK+3,z+2.02,1.3,.1,.04,'cyan');lamps.push({pos:new THREE.Vector3(x,DECK+3,z+3),color:0x9ecfc0});
    cylinder([x-.9,R.bottom,z+2.2],[x-.9,R.ceiling,z+2.2],.23,'rust');
  }
  for(let z=-140;z>-280;z-=16){lamp(0,DECK+3.8,z,'amber');box(0,DECK+4,z,.1,.3,.1,'metal');cylinder([0,DECK+4,z],[0,R.ceiling,z],.027,'metal');}
  for(let z=-130;z>-280;z-=16){box(0,R.ceiling-1,z,128,2,1);}
  for(const x of [-57,57]) {cylinder([x,DECK+8,-123],[x,DECK+8,-282],1.4,'rust',16);}
  label('Σ / 104',0,DECK+7,-285.5,{size:3});
  label('NO CATCHMENT',0,DECK+2.5,-279,{size:.45,color:'#92ac9b'});
  for(const sample of plan.samples){
    const p=sample.pos;
    box(p[0]+1.4,p[1]+1,p[2],.25,1.7,.3,'metal');box(p[0]+1.4,p[1]+1.75,p[2],.32,.09,.36,'cyan');
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.12,.015,5,16),mat.amber);ring.position.set(p[0]+1.4,p[1]+1.4,p[2]+.16);root.add(ring);landmarks.push(ring);
  }
  const mechanisms=buildMechanisms(plan,{root,mat,box,label});
  const chamberVisuals=buildChambers(plan,{root,scene,mat,box,cylinder,label,lamp});
  buildMegavault(plan,{box,cylinder,label});
  for(const [m,geoms] of batches) {const merged=mergeGeometries(geoms);const mesh=new THREE.Mesh(merged,mat[m]);root.add(mesh);for(const g of geoms)g.dispose();}
  const ambient=new THREE.HemisphereLight(0xc4d8d2,0x303b2e,1.8);scene.add(ambient);
  const sun=new THREE.DirectionalLight(0xffdfaf,2.4);sun.position.set(-60,70,-100);scene.add(sun);
  const lights=Array.from({length:12},()=>{const l=new THREE.PointLight(0xffd0a0,22,15,1.5);scene.add(l);return l;});
  // Broad reservoir maintenance lighting leaves the volume legible beyond the hand lamp.
  for(const x of [-38,38])for(const z of [-160,-220,-274]){
    const l=new THREE.PointLight(0x8bb9ac,950,85,2);l.position.set(x,DECK-12,z);scene.add(l);
  }
  const flashlight=new THREE.SpotLight(0xe2efe0,55,48,Math.PI/5,.7,1.35);scene.add(flashlight,flashlight.target);
  const beaconGroup=new THREE.Group();scene.add(beaconGroup);
  const skyColor=new THREE.Color('#87908a'),belowColor=new THREE.Color('#0a1b1c');
  let lastLight=0;
  function update(camera,dt,time,state) {
    const underground=THREE.MathUtils.smoothstep(-camera.position.y,2,9);sky.visible=camera.position.y>-6;sunDisc.visible=sky.visible;
    scene.background.copy(skyColor).lerp(belowColor,underground);scene.fog.color.copy(scene.background);scene.fog.density=THREE.MathUtils.lerp(.006,.012,underground);
    ambient.intensity=THREE.MathUtils.lerp(1.8,.95,underground);sun.intensity=2.4*(1-underground);
    hatch.rotation.z=state.hatchAmount*Math.PI*.53;lift.position.y=state.liftY;
    flashlight.position.copy(camera.position);flashlight.target.position.set(0,-.03,-1).applyQuaternion(camera.quaternion).add(camera.position);flashlight.intensity=state.flashlight?55:0;
    if(time-lastLight>.3){lastLight=time;const near=lamps.map(l=>[l,l.pos.distanceToSquared(camera.position)]).sort((a,b)=>a[1]-b[1]);lights.forEach((light,i)=>{const pick=near[i];light.position.copy(pick[0].pos);light.color.setHex(pick[0].color);light.intensity=pick[1]<2500?45:0;});}
    water.position.y=R.water+Math.sin(time*.23)*.09;
    landmarks.forEach((m,i)=>{m.rotation.z=time*.2+i;});
    chamberVisuals.update(time,state);mechanisms.update(state);
  }
  function addBeacon(p){const m=new THREE.Mesh(new THREE.ConeGeometry(.14,.25,6),mat.amber);m.position.set(p[0],p[1]+.13,p[2]);beaconGroup.add(m);}
  return {scene,update,addBeacon,materials:mat};
}
