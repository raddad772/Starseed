import { DECK, LIFT_SECONDS } from '../../src/understructure/layout.js';
// Shared by the CPU suite and finite WebGPU fixture. Only normal movement and
// look inputs drive the character; routes never assign a new player position.
export function walkLine(sim, x, z) {
  for(let i=0;i<2000;i++) {
    if(sim.zeroG)return flyTo(sim,[x,sim.pos[1],z]);
    const dx=x-sim.pos[0],dz=z-sim.pos[2],distance=Math.hypot(dx,dz);
    if(distance<.001)return;
    sim.yaw=Math.atan2(-dx,-dz);
    const before=[...sim.pos];
    sim.step(Math.min(.1,distance/5.5),{forward:1,fast:true});
    if(Math.hypot(sim.pos[0]-before[0],sim.pos[2]-before[2])<.00001)
      throw Error(`Blocked walking toward ${x},${z} at ${sim.pos}`);
  }
  throw Error(`Walk did not reach ${x},${z}`);
}

export function flyTo(sim,target) {
  for(let i=0;i<6000;i++) {
    if(!sim.zeroG){walkLine(sim,target[0],target[2]);return;}
    const delta=target.map((v,i)=>v-sim.pos[i]),distance=Math.hypot(...delta);
    if(distance<.045&&Math.hypot(...sim.velocity)<.08){sim.step(.1,{brake:true});return;}
    const speed=Math.min(3,distance*1.5),desired=delta.map(d=>d/Math.max(distance,.0001)*speed);
    const thrust=desired.map((v,i)=>(v-sim.velocity[i])*2.5/3.2);
    // World-oriented pilot inputs, fed through the production thruster controller.
    sim.yaw=0;sim.pitch=0;
    sim.step(1/30,{strafe:thrust[0],vertical:thrust[1],forward:-thrust[2]});
  }
  throw Error(`Flight did not reach ${target}; stopped at ${sim.pos}`);
}

export function walkRoute(sim,x,z) {
  const k=(x,z)=>`${x},${z}`,start=[Math.round(sim.pos[0]/4)*4,Math.round(sim.pos[2]/4)*4];
  const queue=[start],parents=new Map([[k(...start),null]]),target=k(x,z);
  for(let i=0;i<queue.length&&!parents.has(target);i++) {
    const [a,b]=queue[i];
    for(const [dx,dz] of [[4,0],[-4,0],[0,4],[0,-4]]) {
      const nx=a+dx,nz=b+dz,id=k(nx,nz);
      if(Math.abs(nx)>80||nz>4||nz< -288||parents.has(id))continue;
      if(!sim.collision.canStand(nx,nz,sim.state,.42))continue;
      parents.set(id,k(a,b));queue.push([nx,nz]);
    }
  }
  if(!parents.has(target))throw Error(`No route to ${target}`);
  const route=[];
  for(let id=target;id!==null;id=parents.get(id))route.push(id.split(',').map(Number));
  for(const [a,b] of route.reverse())walkLine(sim,a,b);
}

export function advance(sim,secs,input={}){for(let t=0;t<secs;t+=1/60)sim.step(Math.min(1/60,secs-t),input);}
export function descend(sim){walkLine(sim,0,4);sim.interact();advance(sim,1.5);walkLine(sim,0,0);sim.interact();advance(sim,LIFT_SECONDS+.1);walkLine(sim,0,-4);}
export function solvePuzzles(sim){
  for(const p of sim.plan.puzzles){
    if(p.kind==='relay'){
      walkRoute(sim,76,-52);walkLine(sim,82,-52);flyTo(sim,p.source);sim.interact();
      flyTo(sim,[96,DECK+.05,-52]);flyTo(sim,[77,DECK+.05,-52]);walkLine(sim,76,-52);
      walkRoute(sim,76,-100);walkLine(sim,84,-100);for(const x of [96,109,122,136])jumpTo(sim,x,-100);sim.interact();
      for(const x of [122,109,96,84])jumpTo(sim,x,-100);walkLine(sim,76,-100);
    }
    if(p.kind==='phase'){
      walkRoute(sim,-76,-100);walkLine(sim,-96,-100);
      for(let i=0;i<800&&!sim.phase.ready;i++)sim.step(1/60);
      sim.interact();walkLine(sim,-76,-100);
    }
    if(p.kind==='fold'){
      walkRoute(sim,-76,-100);walkLine(sim,-104,-100);walkLine(sim,-104,-108);sim.interact();
      sim.yaw=0;const before=sim.foldCount;
      for(let i=0;i<120&&sim.foldCount===before;i++)sim.step(1/60,{forward:1});
      if(sim.foldCount===before)throw Error('Fold did not transport walker');
      sim.interact();walkLine(sim,sim.pos[0],-38.8);walkLine(sim,-81,-38.8);walkLine(sim,-81,-28);walkLine(sim,-76,-28);
    }
    if(p.kind==='bridge'){walkRoute(sim,76,-20);walkLine(sim,84,-20);sim.interact();walkLine(sim,106,-20);sim.interact();walkLine(sim,134,-20);sim.interact();walkLine(sim,76,-20);}
    if(p.kind==='pressure'){walkRoute(sim,-76,-28);walkLine(sim,-81,-28);walkLine(sim,-81,-41);walkLine(sim,-96,-41);for(let i=0;i<3&&!sim.solved.has(p.id);i++)sim.interact();walkLine(sim,-81,-41);walkLine(sim,-81,-28);walkLine(sim,-76,-28);}
    if(p.kind==='echo'){walkRoute(sim,-76,-100);for(const i of p.order){walkLine(sim,p.plates[i][0],p.plates[i][2]);sim.interact();}walkLine(sim,-76,-100);}
    if(!sim.solved.has(p.id))throw Error('Circuit not solved: '+p.id);
  }
}
export function retrieveSiteRecord(sim){walkRoute(sim,0,-264);sim.interact();if(!sim.dataRecovered)throw Error('Site record not recovered');}

// Jump with ordinary input, steer to the ledge in flight, then wait for landing.
export function jumpTo(sim,x,z){
 const recovery=sim.recoveries;sim.step(1/60);sim.step(1/60,{vertical:1});
 for(let i=0;i<500;i++){const dx=x-sim.pos[0],dz=z-sim.pos[2],distance=Math.hypot(dx,dz);sim.yaw=Math.atan2(-dx,-dz);sim.step(1/60,{forward:distance>.025?Math.min(1,distance/(5.5/60)):0,fast:true});
 if(sim.recoveries!==recovery)throw Error('Jump fell short of '+x+','+z);
 if(distance<.05&&sim.grounded&&Math.abs(sim.velocity[1])<.001){sim.step(.02);return;}}
 throw Error('Jump did not land '+[x,z]+' at '+sim.pos);
}
