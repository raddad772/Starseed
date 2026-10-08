// Shared by the CPU suite and finite WebGPU fixture. Only normal movement and
// look inputs drive the character; routes never assign a new player position.
export function walkLine(sim, x, z) {
  for(let i=0;i<2000;i++) {
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
