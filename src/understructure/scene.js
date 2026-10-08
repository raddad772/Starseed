import { buildManifestations } from './manifestationVisual.js';
import { buildAirDust } from './dustVisual.js';
import { buildZeroGWonder } from './zeroGVisual.js';
import { GeometryCollision } from './geometryCollision.js';
import { lightingCells } from './visibility.js';
import { buildWaymarks } from './waymarks.js';
import { walkwaySlabs } from './surfaces.js';
import { buildService } from './serviceVisual.js';
import { buildObliqueSector } from './obliqueVisual.js';
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { Rng } from '../core/rng.js';
import { DECK, terrainHeight } from './layout.js';
import { buildChambers } from './chambers.js';
import { buildGeneratorHall } from './generatorVisual.js';
import { buildMegavault } from './megavault.js';
import { collectionSideWall,buildCollectionRoutes } from './infrastructureVisual.js';
import { buildMechanisms } from './mechanisms.js';
import { buildAccess } from './accessVisual.js';
import { decayMaps,buildDecayDetails } from './decayVisual.js';

export function buildScene(plan) {
  const rng=Rng.fromString(plan.seed).fork('surfaces'), scene=new THREE.Scene();
  scene.background=new THREE.Color('#87908a'); scene.fog=new THREE.FogExp2('#87908a',.006);
  scene.userData.localShadows=true;
  const root=new THREE.Group(); scene.add(root);
  const batches=new Map(), lamps=[], landmarks=[],collisionMeshes=[];
  function texture() {
    const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d');
    ctx.fillStyle='#999d94';ctx.fillRect(0,0,256,256);
    for(let i=0;i<13000;i++){const v=rng.int(60,170);ctx.fillStyle=`rgba(${v},${v},${v},${rng.range(.05,.22)})`;ctx.fillRect(rng.int(0,255),rng.int(0,255),rng.int(1,3),rng.int(1,5));}
    ctx.fillStyle='#20282030';ctx.fillRect(0,0,256,2);ctx.fillRect(0,0,2,256);
    for(let i=0;i<35;i++){ctx.fillStyle='#303e3012';ctx.fillRect(rng.int(0,255),0,rng.int(2,5),rng.int(25,255));}
    const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(1,1);t.colorSpace=THREE.SRGBColorSpace;return t;
  }
  const tex=texture(),concreteMaps=decayMaps(plan.seed,'concrete'),floorMaps=decayMaps(plan.seed,'floor'),metalMaps=decayMaps(plan.seed,'metal'),rustMaps=decayMaps(plan.seed,'rust');
  // The raw renderer consumes meshes, not Three's background/fog convenience fields.
  const skyGeo=new THREE.SphereGeometry(410,32,16),skyColors=[];
  for(let i=0;i<skyGeo.attributes.position.count;i++){
    const h=skyGeo.attributes.position.getY(i)/410,c=new THREE.Color('#acaa90').lerp(new THREE.Color('#526e76'),Math.max(0,h));skyColors.push(c.r,c.g,c.b);
  }
  skyGeo.setAttribute('color',new THREE.Float32BufferAttribute(skyColors,3));
  const sky=new THREE.Mesh(skyGeo,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide}));scene.add(sky);
  const sunDisc=new THREE.Mesh(new THREE.SphereGeometry(6,16,12),new THREE.MeshBasicMaterial({color:'#ffe3b1'}));sunDisc.position.set(-180,160,-290);scene.add(sunDisc);
  const mat={
    concrete:new THREE.MeshStandardMaterial({color:'#ffffff',...concreteMaps,roughness:1,normalScale:new THREE.Vector2(.65,.65)}),
    floor:new THREE.MeshStandardMaterial({color:'#ffffff',...floorMaps,roughness:1,normalScale:new THREE.Vector2(.4,.4)}),
    metal:new THREE.MeshStandardMaterial({color:'#ffffff',...metalMaps,roughness:1,metalness:.4,normalScale:new THREE.Vector2(.5,.5)}),
    rust:new THREE.MeshStandardMaterial({color:'#ffffff',...rustMaps,roughness:1,metalness:.1}),
    weathered:new THREE.MeshStandardMaterial({color:'#ffffff',...concreteMaps,roughness:1,normalScale:new THREE.Vector2(.65,.65),vertexColors:true}),
    rock:new THREE.MeshStandardMaterial({color:'#60554a',...concreteMaps,roughness:1}),
    dust:new THREE.MeshStandardMaterial({color:'#bbb298',...floorMaps,roughness:1}),
    stain:new THREE.MeshStandardMaterial({color:'#263d33',roughness:1}),
    dark:new THREE.MeshStandardMaterial({color:'#152626',roughness:.78}),
    amber:new THREE.MeshStandardMaterial({color:'#d2ae6e',emissive:'#ffc075',emissiveIntensity:1.3}),
    cyan:new THREE.MeshStandardMaterial({color:'#9dbab1',emissive:'#b9efe0',emissiveIntensity:1.1}),
    ground:new THREE.MeshStandardMaterial({color:'#6c7260',map:tex,roughness:1}),
    water:new THREE.MeshStandardMaterial({color:'#1b3e3a',metalness:.55,roughness:.23}),
    distant:new THREE.MeshStandardMaterial({color:'#2c4248',roughness:.9}),
    abyss:new THREE.MeshStandardMaterial({color:'#0a1a22',roughness:1}),
  };
  for(const name of ['concrete','floor','metal','rust','weathered','dust','rock'])mat[name].userData.webgpu={kind:'survey'};
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
    // Physical markings are an unknown script; the suit supplies translations.
    const glyph=Rng.fromString(text),count=7;ctx.strokeStyle=color;ctx.lineWidth=5;ctx.lineCap='square';
    for(let i=0;i<count;i++){const x=40+i*67;ctx.beginPath();ctx.moveTo(x,30);ctx.lineTo(x,96);for(let j=0;j<3;j++){const yy=34+j*25;ctx.moveTo(x,yy);ctx.lineTo(x+glyph.pick([13,25,36]),yy+glyph.pick([-12,0,12]));}ctx.stroke();if(glyph.chance(.5)){ctx.beginPath();ctx.arc(x+33,82,7,0,Math.PI*2);ctx.stroke();}}
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(size*4,size),new THREE.MeshStandardMaterial({map:t,roughness:1,transparent:true,depthWrite:false,side:THREE.DoubleSide}));mesh.position.set(x,y,z);mesh.rotation.y=face;root.add(mesh);return mesh;
  }
  function pipe(points,r,material='rust',closed=false){
    const p=points.map(p=>new THREE.Vector3(...p)),curve=new THREE.CurvePath();
    const corner=i=>{const a=p[(i-1+p.length)%p.length],b=p[i],c=p[(i+1)%p.length],d=Math.min(r*2.4,a.distanceTo(b)*.45,b.distanceTo(c)*.45);return {b,u:b.clone().lerp(a,d/a.distanceTo(b)),v:b.clone().lerp(c,d/b.distanceTo(c))};};
    let last=closed?corner(p.length-1).v:p[0];
    for(let i=closed?0:1;i<(closed?p.length:p.length-1);i++){const {b,u,v}=corner(i);curve.add(new THREE.LineCurve3(last,u));curve.add(new THREE.QuadraticBezierCurve3(u,b,v));last=v;}
    if(!closed)curve.add(new THREE.LineCurve3(last,p.at(-1)));
    addGeometry(new THREE.TubeGeometry(curve,Math.max(24,points.length*16),r,12,closed),material);
  }
  function lamp(x,y,z,color='amber',power=95) {
    box(x,y+.06,z,.95,.18,.4,'metal');box(x,y-.045,z,.73,.04,.25,color);
    for(const sign of [-1,1])box(x+sign*.43,y-.04,z,.055,.16,.4,'dark');
    lamps.push({pos:new THREE.Vector3(x,y-.15,z),color:color==='amber'?0xffcb8e:0xb9e0d4,power});
  }
  // Terrain is triangulated around, rather than across, a four-metre hatch opening.
  const verts=[],N=130,S=4;
  for(let iz=-N/2;iz<N/2;iz++)for(let ix=-N/2;ix<N/2;ix++) {
    const x=ix*S-2,z=iz*S-2;if(x===-2&&z===plan.access.hatchZ-2)continue;
    const a=[x,terrainHeight(x,z),z],b=[x+S,terrainHeight(x+S,z),z],c=[x+S,terrainHeight(x+S,z+S),z+S],d=[x,terrainHeight(x,z+S),z+S];
    verts.push(...a,...d,...b,...b,...d,...c);
  }
  const ground=new THREE.BufferGeometry();ground.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));ground.computeVertexNormals();addGeometry(ground,'ground');
  for(let i=0;i<110;i++) {
    const x=rng.range(-170,170),z=rng.range(-180,100);if(Math.hypot(x,z)<16)continue;
    const r=rng.range(.2,1.4),g=new THREE.IcosahedronGeometry(r,0);g.scale(1,.65,1.2);g.translate(x,terrainHeight(x,z)+r*.25,z);addGeometry(g,'ground');
  }
  const {hatch,lift}=buildAccess(plan,{root,mat,box,cylinder,lamp,label});
  buildService(plan,{addGeometry,box,cylinder,pipe,lamp,label});
  buildObliqueSector(plan,{addGeometry,box,cylinder,pipe,label,lamp});
  // A hundred-metre generator volume, crossed on four service levels.
  const R=plan.reservoir;
  box(0,R.bottom-.6,(R.near+R.far)/2,128,1,164,'dark');
  collectionSideWall(plan,-1,{box});collectionSideWall(plan,1,{box});
  // Front wall leaves a real 4 m door from the service conduit.
  box(-33,(R.bottom+R.ceiling)/2,R.near+.3,62,R.ceiling-R.bottom,.6);box(33,(R.bottom+R.ceiling)/2,R.near+.3,62,R.ceiling-R.bottom,.6);
  box(0,(R.ceiling+DECK+4)/2,R.near+.3,4,R.ceiling-DECK-4,.6);box(0,(R.bottom+DECK)/2,R.near+.3,4,DECK-R.bottom,.6);
  box(0,R.ceiling+.4,-204,128,.8,164);
  const water=new THREE.Mesh(new THREE.PlaneGeometry(127,163,16,24),mat.water);water.rotation.x=-Math.PI/2;water.position.set(0,R.water,-204);root.add(water);
  walkwaySlabs(plan.walkways,DECK,.7,'floor',{addGeometry});
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
  for(let rz=-140;rz>-280;rz-=16){const z=plan.routes.some(r=>!r.covered&&Math.abs(r.a[2]-rz)<2.5)?rz-4:rz;lamp(-2.8,DECK+3.8,z,'amber');box(-2.8,DECK+4,z,.1,.3,.1,'metal');cylinder([-2.8,DECK+4,z],[-2.8,R.ceiling,z],.027,'metal');}
  for(let z=-130;z>-280;z-=16){box(0,R.ceiling-1,z,128,2,1);}
  for(const x of [-57,57]) {cylinder([x,DECK+8,-121.8],[x,DECK+8,-286.2],1.4,'rust',16);}
  label('Σ / 104',-44,DECK+7,-285.5,{size:3});
  for(const sample of plan.samples){
    const p=[sample.pos[0],sample.pos[1],sample.pos[2]+1.3];
    box(p[0]+1.4,p[1]+1,p[2],.25,1.7,.3,'metal');box(p[0]+1.4,p[1]+1.75,p[2],.32,.09,.36,'cyan');
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.12,.015,5,16),mat.amber);ring.position.set(p[0]+1.4,p[1]+1.4,p[2]+.16);root.add(ring);landmarks.push(ring);
  }
  buildCollectionRoutes(plan,{root,mat,box,cylinder,pipe,label,lamp});
  buildCollectionRoutes({...plan,routes:plan.traversal.highRoutes,routeLandings:plan.traversal.highRoutes.map(r=>r.b),reservoir:{ceiling:plan.deck+30}},{root,mat,box,cylinder,pipe,label,lamp});
  const mechanisms=buildMechanisms(plan,{root,scene,mat,box,cylinder,label});
  const chamberVisuals=buildChambers(plan,{root,scene,mat,box,cylinder,label,lamp,addGeometry});
  buildMegavault(plan,{box,cylinder,label});
  const generatorVisuals=buildGeneratorHall(plan,{root,scene,mat,box,cylinder,label,addGeometry});
  const manifestations=buildManifestations(plan,root);
  const dust=buildAirDust(plan,root);
  const wonder=buildZeroGWonder(plan,root);
  const decay=buildDecayDetails(plan,{addGeometry});

  const waymarks=buildWaymarks(plan,{root,mat,addGeometry});
  const ambient=new THREE.HemisphereLight(0xc4d8d2,0x303b2e,1.8);scene.add(ambient);
  const sun=new THREE.DirectionalLight(0xffdfaf,2.4);sun.position.set(-60,70,-100);scene.add(sun);
  const portals=lightingCells(plan);
  const lights=lamps.map(f=>{const l=new THREE.SpotLight(f.color,f.power||95,38,1.2,.4,2);l.position.copy(f.pos);l.target.position.copy(f.pos).add(new THREE.Vector3(0,-1,0));l.castShadow=true;l.userData.rectAspect=2.4;l.userData.cells=portals.membership(f.pos);l.userData.power=f.power||95;scene.add(l,l.target);return l;});
  // Broad reservoir maintenance lighting leaves the volume legible beyond the hand lamp.
  const hallLights=[];
  for(const x of [-38,38])for(const z of [-160,-220,-274]){
    box(x,DECK-11.8,z,2.3,.7,2.3,'metal');box(x,DECK-12.22,z,1.8,.12,1.8,'cyan');cylinder([x,DECK-11.5,z],[x,R.ceiling,z],.12,'metal');const l=new THREE.PointLight(0x8bb9ac,250,65,2);l.position.set(x,DECK-12.4,z);scene.add(l);hallLights.push(l);
  }
  for(const [m,geoms] of batches) {const merged=mergeGeometries(geoms);const mesh=new THREE.Mesh(merged,mat[m]);mesh.userData.noLocalShadow=m==='weathered';root.add(mesh);if(['concrete','floor','metal','rust','rock'].includes(m))collisionMeshes.push(mesh);for(const g of geoms)g.dispose();}
  root.traverse(o=>{if(o.isMesh&&!o.isInstancedMesh&&!o.userData.dynamicCollision&&!o.parent?.userData.dynamicCollision&&!o.userData.noLocalShadow&&!o.material.transparent&&(o.userData.architectureCollision||[mat.metal,mat.rust,mat.concrete,mat.floor].includes(o.material))&&!collisionMeshes.includes(o))collisionMeshes.push(o);});
  const collider=new GeometryCollision(collisionMeshes);
  const flashlight=new THREE.SpotLight(0xe2efe0,120,120,Math.PI/7,.65,1.15);flashlight.castShadow=true;flashlight.userData.shadowPriority=1;scene.add(flashlight,flashlight.target);
  const beaconGroup=new THREE.Group();scene.add(beaconGroup);
  const skyColor=new THREE.Color('#87908a'),belowColor=new THREE.Color('#0a1b1c');
  const hatchLight=new THREE.SpotLight(0xe0e9df,55,9,.7,.85,2);hatchLight.position.set(0,1,plan.access.hatchZ);hatchLight.target.position.set(0,plan.access.top,plan.access.hatchZ);hatchLight.castShadow=true;hatchLight.userData.shadowPriority=.5;scene.add(hatchLight,hatchLight.target);
  function update(camera,dt,time,state) {
    // Spread the outdoor transition over the whole ladder descent. The open
    // hatch retains a physical pool of daylight after the exterior fill fades.
    const underground=THREE.MathUtils.smoothstep(1.7-camera.position.y,0,4.2);sky.visible=camera.position.y>-6;sunDisc.visible=sky.visible;
    scene.background.copy(skyColor).lerp(belowColor,underground);scene.fog.color.copy(scene.background);scene.fog.density=THREE.MathUtils.lerp(.006,.012,underground);
    ambient.intensity=THREE.MathUtils.lerp(1.8,.085,underground);sun.intensity=2.4*(1-underground);hatchLight.intensity=55*state.hatchAmount;
    hatch.rotation.z=state.hatchAmount*Math.PI*.53;lift.position.y=state.liftY;
    flashlight.position.copy(camera.position);flashlight.target.position.set(0,-.03,-1).applyQuaternion(camera.quaternion).add(camera.position);flashlight.intensity=state.flashlight?120:0;
    const visible=portals.visible(camera);for(const light of lights){light.visible=light.position.distanceToSquared(camera.position)<(light.distance+2)**2||!visible||!light.userData.cells.length||light.userData.cells.some(id=>visible.has(id));}

    water.position.y=R.water+Math.sin(time*.23)*.09;
    landmarks.forEach((m,i)=>{m.rotation.z=time*.2+i;});
    manifestations.update(camera,time);dust.update(camera,time);wonder.update(time,state);chamberVisuals.update(time,state);mechanisms.update(state);generatorVisuals.update(time);
    for(const l of hallLights)l.intensity=180*generatorVisuals.reading.sag;
  }
  function addBeacon(p){const m=new THREE.Mesh(new THREE.ConeGeometry(.14,.25,6),mat.amber);m.position.set(p[0],p[1]+.13,p[2]);beaconGroup.add(m);}
  return {scene,update,addBeacon,collider,materials:mat,generator:generatorVisuals,decay,manifestations,dust,wonder,waymarks,lights,portals,flashlight};
}
