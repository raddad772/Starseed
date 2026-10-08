import { walkwaySlabs } from './surfaces.js';
import * as THREE from 'three';
import { DECK } from './layout.js';
import { buildTransitShaft } from './transitShaftVisual.js';

// Distinct infrastructure rooms attach to the seeded service graph. Their
// structural footprint and gravity volume come from the collision plan.
export function buildChambers(plan,{root,scene,mat,box,cylinder,label,lamp,addGeometry}) {
  const drifting=[],droplets=[],resonators=[],bridges=[],waterSurfaces=[],waterRipples=[],waterStreams=[],gravity=plan.themes.includes('gravity');
  const poolMaterial=new THREE.MeshStandardMaterial({color:'#527980',roughness:.085,metalness:.48});
  const streamMaterial=new THREE.MeshStandardMaterial({color:'#abc8cd',transparent:true,opacity:.24,depthWrite:false,roughness:.045,metalness:.25,side:THREE.DoubleSide});
  const accents={null:0x96ddec,upfall:0x97d9c4,resonance:0xffbf78,low:0x9dbeff,light:0x82eadf};
  function light(x,y,z,color,power,range){const l=new THREE.PointLight(color,power,range,2);l.position.set(x,y,z);scene.add(l);return l;}
  function ring(x,y,z,r,material,axis='y',tube=.1){const mesh=new THREE.Mesh(new THREE.TorusGeometry(r,tube,6,48),material);if(axis==='y')mesh.rotation.x=Math.PI/2;if(axis==='x')mesh.rotation.y=Math.PI/2;mesh.position.set(x,y,z);root.add(mesh);return mesh;}
  function rails(x0,z0,x1,z1){for(const y of [DECK+.55,DECK+1.1])cylinder([x0,y,z0],[x1,y,z1],.04,'rust');const n=Math.ceil(Math.hypot(x1-x0,z1-z0)/3);for(let i=0;i<=n;i++)cylinder([x0+(x1-x0)*i/n,DECK,z0+(z1-z0)*i/n],[x0+(x1-x0)*i/n,DECK+1.1,z0+(z1-z0)*i/n],.04,'metal');}
  for(const c of plan.chambers) {
    if(c.openVolume){buildTransitShaft(c,{root,scene,mat,box,cylinder,lamp});continue;}
    const DECK=c.base??plan.deck;
    const [x0,x1,z0,z1]=c.bounds,cx=(x0+x1)/2,cz=(z0+z1)/2,h=c.ceiling-DECK,w=x1-x0,d=z1-z0,doorX=c.door[0],doorZ=c.door[1];
    box(cx,c.ceiling+.25,cz,w,.5,d);
    box(cx,DECK+h/2,z0-.22,w,h,.44);box(cx,DECK+h/2,z1+.22,w,h,.44);
    // Slice each wall around every doorway, including elevated return openings.
    for(const x of [x0,x1]){
      const holes=[...(c.exits||[]).filter(e=>e.axis==='x'&&e.coordinate===x)];
      if(doorX===x)holes.push({center:doorZ,y:DECK,halfWidth:2});
      // The pump well's outer wall is a window into the megavault.
      if(c.id==='null'&&x===x1){
        box(x+.22,DECK+.3,cz,.44,.6,d);box(x+.22,c.ceiling-.6,cz,.44,1.2,d);
        for(const z of [z0+1.5,z1-1.5])box(x+.22,(DECK+.6+c.ceiling-1.2)/2,z,.44,h-1.8,3);
        for(const z of [z0+3,cz,z1-3])box(x-.12,DECK+h/2,z,.45,h-1.8,.2,'metal');
        const glass=new THREE.Mesh(new THREE.PlaneGeometry(d-6,h-1.8),new THREE.MeshBasicMaterial({color:'#6badbd',transparent:true,opacity:.035,depthWrite:false,side:THREE.DoubleSide}));
        glass.rotation.y=Math.PI/2;glass.position.set(x-.04,DECK+h/2,cz);root.add(glass);
        continue;
      }
      const cuts=[z0,z1,...holes.flatMap(e=>[e.center-e.halfWidth,e.center+e.halfWidth])].sort((a,b)=>a-b);
      for(let i=1;i<cuts.length;i++){
        const z=(cuts[i-1]+cuts[i])/2,depth=cuts[i]-cuts[i-1];if(depth<.001)continue;
        const openings=holes.filter(e=>Math.abs(z-e.center)<e.halfWidth).sort((a,b)=>a.y-b.y);let lo=DECK;
        for(const e of [...openings,{y:c.ceiling,terminal:true}]){if(e.y>lo)box(x+(x===x0?-.22:.22),(lo+e.y)/2,z,.44,e.y-lo,depth);lo=e.y+(e.terminal?0:4);}
      }
      for(const e of holes){for(const z of [e.center-e.halfWidth+.1,e.center+e.halfWidth-.1])box(x,e.y+2,z,.16,4,.12,'amber');box(x,e.y+3.9,e.center,.16,.12,e.halfWidth*2,'cyan');}
    }
    walkwaySlabs(c.walkways,DECK,.5,'floor',{addGeometry});
    for(const z of [doorZ-1.9,doorZ+1.9])box(doorX,DECK+2,z,.18,4,.14,'amber');
    box(doorX,DECK+.025,doorZ,.24,.05,3.8,'amber');box(doorX,DECK+3.95,doorZ,.18,.12,4,'amber');
    const face=c.doorSide*Math.PI/2;
    label(c.name,doorX+c.doorSide*.101,DECK+3.95,doorZ,{size:.09,face});
    label('RETURN / 1.00 G',doorX-c.doorSide*.101,DECK+3.95,doorZ,{size:.09,face:-face,color:'#e8b777'});
    // The long low approach contrasts with the unexpectedly tall volume.
    for(const s of [-1,1])for(let z=z0+3;z<z1;z+=7){box(s===-1?x0+.2:x1-.2,DECK+h/2,z,.25,h,.3,'metal');}
    for(const x of [cx-6,cx+6]){lamp(x,c.ceiling-.24,cz,'cyan');cylinder([x,c.ceiling-.15,cz],[x,c.ceiling,cz],.08,'metal');}
    if(c.kind==='platforms'){
      const pit=c.pitDepth??12;
      box(cx,DECK-pit,cz,w,1,d,'dark');
      for(const z of [z0-.22,z1+.22])box(cx,DECK-pit/2,z,w,pit,.44,'concrete');
      for(const x of [x0-.22,x1+.22])box(x,DECK-pit/2,cz,.44,pit,d,'concrete');
      for(let x=x0+6;x<x1;x+=12)lamp(x,DECK-pit+1.5,z0+.5,'cyan');
      // These are surviving service slabs on old piers, not floating numbered pads.
      label(c.id==='low'?'RETURN MAIN / SUBSIDENCE':'OVERFLOW / ACCESS DECK LOST',cx,DECK+6,z0+.2,{size:.7,color:'#989f88'});
      const pipeZ=z0+5;
      cylinder([x0,DECK+2.8,pipeZ],[x1,DECK+2.8,pipeZ],2.1,'rust',16);
      for(let x=x0+2;x<x1;x+=9){cylinder([x,DECK+2.8,pipeZ],[x+.25,DECK+2.8,pipeZ],2.3,'metal',16);box(x,DECK+(3-pit)/2,pipeZ,2,pit+3,4,'concrete');}
      for(const [i,p] of c.platforms.entries()){const [a,b,e,f,y]=p,mid=(a+b)/2;
        box(mid,y-.55,(e+f)/2,b-a,1.1,f-e,'floor');
        cylinder([mid,y-.4,f-.3],[mid,y-.4,f+.4],.055,'metal');cylinder([mid,y-.4,f+.4],[mid,y+2.9,f+.4],.055,'metal');lamp(mid,y+2.8,f+.4,'cyan',145);
        for(const z of [e+1,f-1]){box(mid,(y-1.12+DECK-pit+1)/2,z,2,y-1.12-DECK+pit-1,1.5,'concrete');box(mid,y-.7,z,b-a,.25,.22,'metal');}
        // Broken edge bars and a fallen span below explain the missing deck.
        if(i<c.platforms.length-1){const next=c.platforms[i+1];for(const z of [e+1,e+2.5,f-1])cylinder([b-.3,y-.15,z],[b+.65,y-.4,z+.2],.035,'rust');const west=next[0]<a,left=west?next[1]:b,right=west?a:next[0];box((left+right)/2,DECK-pit+1.2,(e+f)/2,Math.max(.1,right-left),.35,f-e,'concrete');}
        for(const z of [e,f]){cylinder([a+.6,y+1,z],[Math.min(b-.6,a+2.5),y+.65,z],.045,'rust');cylinder([a+.6,y,z],[a+.6,y+1,z],.04,'metal');}
        box(mid,y+.015,f-.6,b-a-.8,.025,.07,'rust');
      }
      for(const [i,p] of (c.bridges||[]).entries()){const [a,b,e,f,y]=p;const material=new THREE.MeshStandardMaterial({color:'#75e6dc',emissive:'#3a9f99',emissiveIntensity:.6,transparent:true,opacity:.72,roughness:.25,side:THREE.DoubleSide});const mesh=new THREE.Mesh(new THREE.BoxGeometry(b-a,.13,f-e),material);mesh.position.set((a+b)/2,y-.07,(e+f)/2);root.add(mesh);bridges.push({mesh,index:i});for(const z of [e,f]){box((a+b)/2,y-.15,z,b-a,.04,.035,'metal');for(const x of [a,b]){box(x,y-.1,z,.5,.5,.6,'metal');box(x,y+.17,z,.18,.05,.3,'cyan');}}}
    } else if(c.kind==='zero-g') {
      label('PUMP WELL / FIELD FAULT',cx,DECK+16,z0+.3,{size:1.3,color:'#9adfea'});
      // Level rings and a plumb guide make the vertical distance legible.
      for(const y of [DECK+3,DECK+9,DECK+15]) {
        ring(cx,y,cz,10,mat.rust,'y',.08);
        for(const x of [x0+.3,x1-.3])box(x,y,cz,.08,.08,d-.6,'cyan');
        for(const z of [z0+.3,z1-.3])box(cx,y,z,w-.6,.08,.08,'cyan');
      }
      // Chamber ring walls stop well outside the central vertical route.
      const sample=plan.samples.find(s=>s.id==='null');
      ring(sample.pos[0],sample.pos[1]-1,sample.pos[2],3.6,mat.metal,'y',.16);cylinder([cx,DECK+17,z0+3],[cx,c.ceiling,z0+3],1.8,'rust',16);
      for(let y=DECK+.6;y<c.ceiling-1;y+=1.5)box(x0+.25,y,doorZ,.07,.38,.16,'amber');
      for(const [i,o] of c.obstacles.entries()) {
        const mesh=new THREE.Mesh(new THREE.BoxGeometry(o.radius*1.05,o.radius*.7,o.radius*.95),mat.concrete);
        mesh.userData.dynamicCollision=true;mesh.position.set(...o.center);root.add(mesh);drifting.push({mesh,phase:i*1.9,center:o.center});
        const band=new THREE.Mesh(new THREE.BoxGeometry(o.radius*1.06,.08,o.radius*.98),mat.rust);mesh.add(band);
      }
      for(let i=0;i<38;i++) {
        const angle=i*2.39996,r=5+(i%7)*.7,y=DECK+2+(i*3.7%(h-4));
        const m=new THREE.Mesh(new THREE.IcosahedronGeometry(.045+(i%3)*.015,0),mat.cyan);
        m.position.set(cx+Math.cos(angle)*r,y,cz+Math.sin(angle)*r);root.add(m);drifting.push({mesh:m,phase:i,center:m.position.toArray()});
      }
      label('SERVICE TETHER / FIELD FAULT',x1-.1,DECK+2.5,cz,{size:.55,face:-Math.PI/2,color:'#9adfea'});
      label('GRAVITY RETURN / FLOOR ACCESS',doorX+.11,DECK+5,doorZ,{size:.5,face:Math.PI/2,color:'#e8b777'});
    } else if(c.id==='null') {
      label('OBSERVATION / 07',cx,DECK+10,z0+.3,{size:1.2});
      // Ordinary suspended equipment gives this room a different reading in sites without weight anomalies.
      for(const o of c.obstacles){const [x,y,z]=o.center;box(x,y,z,2.5,1.6,2.3,'metal');cylinder([x,y+.8,z],[x,c.ceiling,z],.06,'rust');}
    } else if(c.kind==='upfall') {
      // Two sunken pools flank a dry central crossing; the edge rails match collision.
      box(cx,DECK-6,cz,w,1,d,'dark');
      for(const z of [z0-.22,z1+.22])box(cx,DECK-3,z,w,6,.44);
      for(const x of [x0-.22,x1+.22])box(x,DECK-3,cz,.44,6,d);
      for(const [a,b] of [[z0+6,cz-1.6],[cz+1.6,z1-6]]){
        const g=new THREE.PlaneGeometry(w-12,b-a,32,16);g.rotateX(-Math.PI/2);const pool=new THREE.Mesh(g,poolMaterial);pool.position.set(cx,DECK-1.7,(a+b)/2);root.add(pool);waterSurfaces.push(pool);
        rails(x0+6,a,x1-6,a);rails(x0+6,b,x1-6,b);
        rails(x0+6,a,x0+6,b);rails(x1-6,a,x1-6,b);
      }
      for(const z of [cz-6,cz+6])for(const x of [cx-7,cx+7]) {
        cylinder([x,c.ceiling-1.3,z],[x,c.ceiling,z],1.4,'metal',16);
        ring(x,c.ceiling-1.32,z,1.3,mat.cyan,'y',.09);
        light(x,c.ceiling-1.6,z,0xbdd5db,65,25);
        const stream=new THREE.Mesh(new THREE.CylinderGeometry(.11,.14,h-.1,12,20,true),streamMaterial);stream.position.set(x,DECK-1.3+(h-.1)/2,z);stream.userData.noLocalShadow=true;root.add(stream);waterStreams.push({mesh:stream,base:stream.geometry.attributes.position.array.slice()});
        for(let i=0;i<3;i++){const ripple=ring(x,DECK-1.64,z,1,new THREE.MeshBasicMaterial({color:'#b3cdd1',transparent:true,opacity:.2,depthWrite:false}),'y',.012);waterRipples.push({mesh:ripple,phase:i/3});}
        for(let i=0;i<28;i++) {
          const a=i*2.39996;droplets.push({x:x+Math.cos(a)*.8,z:z+Math.sin(a)*.8,phase:i/28,low:DECK-1.3,height:h+.2,radius:.09+(i%3)*.03});
        }
      }
      label(gravity?'RETURN PRESSURE / NEGATIVE':'RETURN PRESSURE / CYCLIC',cx,DECK+6,z0+.15,{size:.65,color:'#9edac4'});
      box(cx,DECK+.035,z0+3,7,.04,.15,'cyan');
      label('HOLD  /  RETURN',cx,DECK+2,z0+.12,{size:.5});
    } else {
      // Huge resonators hang above a completely clear human-scale floor.
      ring(cx,DECK+.05,cz,5,mat.rust,'y',.07);
      ring(cx,DECK+.06,cz,2,mat.amber,'y',.04);
      const offset=(plan.seed.length%7)*.13;
      for(let i=0;i<12;i++) {
        const a=i*Math.PI/6+offset,x=cx+Math.cos(a)*11,z=cz+Math.sin(a)*11,bottom=DECK+4+(i%4)*1.1;
        cylinder([x,bottom,z],[x,c.ceiling-.5,z],.85,'metal',16);
        cylinder([x,c.ceiling-.5,z],[x,c.ceiling,z],.1,'rust');
        const glow=new THREE.MeshStandardMaterial({color:'#8a5a32',emissive:'#ffb85f',emissiveIntensity:.3});
        const m=ring(x,bottom-.05,z,1,glow,'y',.1);resonators.push({mesh:m,material:glow,delay:i*.22});
      }
      label('PUMP RETURN / 12',cx,DECK+7,z0+.12,{size:1.1,color:'#dfb07d'});
      for(const z of [z0+2,z1-2])for(let x=x0+3;x<x1;x+=5)lamp(x,DECK+.35,z,'amber');
    }
  }
  const waterMaterial=new THREE.MeshStandardMaterial({color:'#abc5c8',transparent:true,opacity:.58,depthWrite:false,roughness:.055,metalness:.25});
  const waterDrops=new THREE.InstancedMesh(new THREE.SphereGeometry(1,14,10),waterMaterial,droplets.length),pose=new THREE.Object3D();
  waterDrops.frustumCulled=false;root.add(waterDrops);
  return {
    update(time,state) {
      for(const pool of waterSurfaces){const p=pool.geometry.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,Math.sin(p.getX(i)*1.5+state.flowTime*1.4)*.018+Math.sin(p.getZ(i)*2.1-state.flowTime)*.012);p.needsUpdate=true;pool.geometry.computeVertexNormals();}
      for(const {mesh,base} of waterStreams){const p=mesh.geometry.attributes.position;for(let i=0;i<p.count;i++){const y=base[i*3+1],wave=y*2-state.flowTime*(gravity?-4:4);p.setX(i,base[i*3]+Math.sin(wave)*.025);p.setZ(i,base[i*3+2]+Math.cos(wave*.7)*.025);}p.needsUpdate=true;mesh.geometry.computeVertexNormals();}
      for(const r of waterRipples){const phase=(state.flowTime*.5+r.phase)%1;r.mesh.scale.setScalar(.2+phase*1.9);r.mesh.material.opacity=(1-phase)*.18;}
      for(const b of bridges)b.mesh.visible=state.bridgeStage>b.index;
      for(const d of drifting){d.mesh.position.y=d.center[1]+Math.sin(state.machinery.time*.18+d.phase)*.16;d.mesh.rotation.set(state.machinery.time*.045+d.phase,state.machinery.time*.065+d.phase,Math.sin(state.machinery.time*.07+d.phase)*.2);}
      droplets.forEach((d,i)=>{pose.position.set(d.x,d.low+(gravity?((state.flowTime*.22+d.phase)%1):1-((state.flowTime*.22+d.phase)%1))*d.height,d.z);pose.scale.set(d.radius*.6,d.radius*(1.1+.35*Math.sin(state.flowTime*3+i)),d.radius*.6);pose.updateMatrix();waterDrops.setMatrixAt(i,pose.matrix);});waterDrops.instanceMatrix.needsUpdate=true;
      for(const r of resonators){const age=time-state.resonanceAt-r.delay,pulse=age>=0?Math.exp(-age*1.5)*Math.max(0,Math.cos(age*4)):0;r.material.emissiveIntensity=.3+pulse*6;}
    },
  };
}
