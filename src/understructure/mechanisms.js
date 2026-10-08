import * as THREE from 'three';
import { DECK } from './layout.js';

// Readable, small controls stay beside the phenomenon they affect. These are
// game mechanisms, not general physics or recursive portal rendering.
export function buildMechanisms(plan,{root,mat,box,cylinder,label}) {
  let cell,sweep,phaseGlow;const fragments=[];const gateVeils=[],indicators=[],pressureBars=[],echoPlates=[];
  function mesh(w,h,d,material,pos){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(...pos);root.add(m);return m;}
  function status(id,pos){const m=mesh(.2,.16,.12,mat.amber,pos);indicators.push({id,mesh:m});}
  for(const p of plan.puzzles){
    if(p.kind==='relay'){
      cell=mesh(.36,.65,.36,mat.cyan,[p.source[0],p.source[1]+1,p.source[2]]);
      const [x,y,z]=p.socket;box(x,y+.65,z+1,.65,1.3,.45,'metal');box(x,y+1.3,z+1,.43,.2,.48,'rust');
      label('AUXILIARY SUPPLY',x,y+2.2,z+1,{size:.4});status(p.id,[x,y+1.5,z+1]);
    }
    if(p.kind==='phase'){
      const [x,y,z]=p.pos;box(x,y+.65,z-1.5,3.2,1.3,.45,'metal');
      box(x,y+1.6,z-1.5,3.2,.7,.12,'dark');
      box(x+(p.target-.5)*2.8,y+1.6,z-1.42,p.window*2.8,.42,.04,'cyan');
      sweep=mesh(.07,.64,.035,mat.amber,[x,y+1.6,z-1.37]);
      phaseGlow=label('SYNC CONTACT',x,y+2.2,z-1.4,{size:.48});status(p.id,[x+1.5,y+1.3,z-1.4]);
    }
    if(p.kind==='bridge')for(const [i,pos] of p.controls.entries()){const [x,y,z]=pos;box(x,y+.65,z-1.8,.55,1.3,.4,'metal');cylinder([x,y+.5,z-1.8],[x,y+.5,z-5],.16,'rust');box(x,y+.25,z-3,2,.5,2,'concrete');label(i===2?'SERVICE RETURN':`EMERGENCY DECK ${i+1}`,x,y+2.1,z-1.8,{size:.38});status(i===2?'light':'bridge:'+i,[x,y+1.5,z-1.8]);}
    if(p.kind==='pressure'){const [x,y,z]=p.pos;box(x,y+.8,z+1.4,2,1.6,.35,'metal');label(`PRESSURE / SET ${p.target}`,x,y+2.4,z+1.4,{size:.55});for(let i=1;i<=3;i++){const m=mesh(.35,.2,.08,mat.rust,[x+(i-2)*.5,y+1.6,z+1.15]);pressureBars.push({mesh:m,value:i});}}
    if(p.kind==='echo'){label(p.order.map(i=>i+1).join('  →  '),-96,DECK+3,-93.8,{size:1,color:'#dfb07d'});for(const [i,pos] of p.plates.entries()){const [x,y,z]=pos;box(x,y+.5,z,.8,1,.45,'metal');const m=mesh(.5,.12,.55,mat.amber,[x,y+1.1,z]);echoPlates.push({mesh:m,index:i});label(`PUMP ${i+1}`,x,y+1.8,z,{size:.35});cylinder([x,y+1.3,z-.9],[x,y+6,z-.9],.35,'rust');box(x,y+.12,z-.4,1.5,.24,1.8,'concrete');}}
    if(p.kind==='fold')for(const g of p.gates){
      const group=new THREE.Group();group.position.set(...g.pos);group.rotation.y=Math.atan2(g.normal[0],g.normal[1]);root.add(group);
      for(const x of [-1.35,1.35]){const frame=new THREE.Mesh(new THREE.BoxGeometry(.22,3.4,.45),mat.metal);frame.position.set(x,1.7,0);group.add(frame);}
      const lintel=new THREE.Mesh(new THREE.BoxGeometry(2.9,.2,.45),mat.amber);lintel.position.y=3.4;group.add(lintel);
      const veil=new THREE.Mesh(new THREE.PlaneGeometry(2.5,3.3),new THREE.MeshBasicMaterial({color:'#030d13',transparent:true,opacity:.9,side:THREE.DoubleSide,depthWrite:false}));veil.position.y=1.65;group.add(veil);gateVeils.push(veil);
      label('RETURN '+p.mark,g.pos[0],DECK+3.85,g.pos[2],{size:.55,face:group.rotation.y});
      // A painted approach arrow, with the same mark on both ends.
      for(const s of [-1,1])box(g.pos[0]-g.normal[0]*1.4+(g.normal[1]*s*.65),DECK+.025,g.pos[2]-g.normal[1]*1.4-(g.normal[0]*s*.65),.16,.04,.16,'amber');
    }
  }
  for(const f of plan.fragments){const [x,y,z]=f.pos;box(x,y+.65,z+1.4,.7,1.3,.4,'metal');box(x+.33,y+.9,z+1.65,.08,.55,.04,'rust');const m=mesh(.2,.12,.045,mat.cyan,[x,y+1,z+1.63]);fragments.push({id:f.id,mesh:m});}
  const a=plan.finalCache.pos,y=a[1];
  box(a[0],y+.8,a[2]-1,1.4,1.6,.5,'metal');box(a[0],y+1.5,a[2]-.73,1.12,.6,.05,'dark');
  const record=mesh(.6,.22,.12,mat.amber,[a[0],y+1.5,a[2]-.68]);
  label('BACKUP / CENTRAL RECORD',a[0],y+2.4,a[2]-1,{size:.6});
  return {update(state){
    for(const f of fragments)f.mesh.material=state.fragments.has(f.id)?mat.dark:mat.cyan;
    if(cell){cell.visible=!state.carryingCell&&!state.solved.has('gravity');cell.rotation.y=state.time*.35;}
    if(sweep){const p=plan.puzzles.find(p=>p.id==='time');sweep.position.x=p.pos[0]+(state.phase.value-.5)*2.8;sweep.material=state.phase.ready?mat.cyan:mat.amber;phaseGlow.visible=!state.solved.has('time');}
    for(const i of indicators)i.mesh.material=(i.id.startsWith('bridge:')?state.bridgeStage>Number(i.id.split(':')[1]):state.solved.has(i.id))?mat.cyan:mat.amber;
    for(const p of pressureBars)p.mesh.material=state.pressure>=p.value?mat.cyan:mat.rust;
    const echo=plan.puzzles.find(p=>p.id==='resonance');for(const p of echoPlates)p.mesh.material=state.solved.has('resonance')||echo.order[state.echoStep]===p.index?mat.cyan:mat.rust;
    for(const v of gateVeils)v.material.opacity=state.foldActive ? .94 : .25;
    record.material=state.archiveReady?mat.cyan:mat.amber;record.visible=!state.dataRecovered;
  }};
}
