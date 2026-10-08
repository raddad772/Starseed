import { insidePolygon } from './oblique.js';
import { generatorCycle } from './generatorHall.js';
import { Rng } from '../core/rng.js';
import { routeFloor } from './infrastructure.js';

const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export function roomAcoustics(plan,state){
  const [x,y,z]=state.pos,deck=plan.deck;
  let width=4,length=12,height=4,material='concrete',outside=y>-.6;
  if(outside)return {material:'soil',decay:.12,delay:.01,wet:0,volume:0};
  if(y> -4){width=6;length=12;height=2.82;}
  else if(state.moving){width=4;length=4;height=240;material='metal';}
  else if(z<-122){width=z<-286?560:128;length=z<-286?900:164;height=100;
    const route=plan.routes.find(r=>{const floor=routeFloor(r,x,z);return floor!==null&&Math.abs(floor-y)<.4;});
    if(route){material=route.covered?'concrete':'metal';if(route.covered){width=4;length=Math.hypot(route.b[0]-route.a[0],route.b[2]-route.a[2]);height=3.5;}}
    else if(z<-286&&z>-321)material='metal';
  }
  else{
    const polygon=[...plan.service.rooms,...plan.oblique.rooms].find(r=>insidePolygon(r.polygon,x,z));
    const chamber=plan.chambers.find(r=>x>=r.bounds[0]&&x<=r.bounds[1]&&z>=r.bounds[2]&&z<=r.bounds[3]);

    if(polygon){const xs=polygon.polygon.map(p=>p[0]),zs=polygon.polygon.map(p=>p[1]);width=Math.max(...xs)-Math.min(...xs);length=Math.max(...zs)-Math.min(...zs);height=polygon.height+(polygon.inner?18:0);material=polygon.inner&&plan.oblique.bridges.some(b=>insidePolygon(b.polygon,x,z))?'metal':'concrete';}
    else if(chamber){width=chamber.bounds[1]-chamber.bounds[0];length=chamber.bounds[3]-chamber.bounds[2];height=chamber.ceiling-deck;}

  }
  const volume=width*length*height,surface=2*(width*length+width*height+length*height);
  // A bounded Sabine approximation for hard, irregular rooms. No acoustic raycast
  // or hidden GPU query is needed; the same dimensions drive the visible rooms.
  return {material,volume,decay:clamp(.161*volume/(surface*.18),.35,4.8),delay:clamp(4*volume/surface/343,.012,.24),wet:clamp(volume/2500,.12,.65)};
}

export function soundField(plan,state){
  const [x,y,z]=state.pos,below=clamp((-y-1)/8),live=plan.generator.cores[plan.generator.active];
  const distance=Math.hypot(x-live.x,(y-plan.deck)*.35,z-live.z);
  const hall=z<-122?1:.06,generator=hall/(1+distance/45)*(.3+generatorCycle(plan.generator,state.time).power*.7);
  const water=plan.generator.environment.wet?Math.max(z<-286?1/(1+Math.abs(z+307)/35):0,state.chamber?.id==='upfall'&&!state.flowPaused? .48:0):0;
  const dx=live.x-x,dz=live.z-z,pan=clamp((dx*Math.cos(state.yaw)-dz*Math.sin(state.yaw))/Math.max(5,Math.hypot(dx,dz)),-1,1);
  return {below,air:below*.085,rumble:below*.13,generator:below*generator*.11,water:below*water*.12,lift:state.moving?.13:0,pan};
}

export function noiseSamples(seed,length){
  const rng=Rng.fromString(seed),samples=new Float32Array(length);let low=0;
  for(let i=0;i<length;i++){low=low*.965+(rng.next()*2-1)*.035;samples[i]=low*2.4+(rng.next()*2-1)*.1;}
  // Short seam crossfade keeps continuous ambience free of periodic clicks.
  const fade=Math.min(512,Math.floor(length/8));for(let i=0;i<fade;i++){const t=i/fade;samples[length-fade+i]=samples[length-fade+i]*(1-t)+samples[i]*t;}
  return samples;
}

export class FootstepTracker {
  constructor(){this.previous=null;this.travel=0;}
  update(state,active=true){
    const before=this.previous;this.previous=[...state.pos];
    if(!active||!before||state.zeroG||state.moving||state.grounded===false){this.travel=0;return false;}
    const distance=Math.hypot(state.pos[0]-before[0],state.pos[2]-before[2]);
    if(distance>2||Math.abs(state.pos[1]-before[1])>1){this.travel=0;return false;}
    this.travel+=distance;if(this.travel<1.55)return false;this.travel%=1.55;return true;
  }
}
