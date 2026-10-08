// Two-body transfer design, metres/seconds. Lambert solves one revolution-free
// conic; propagated arc checks reject paths through the primary. Finite burns
// are executed and corrected by guidance, not applied as velocity teleports.
import { propagate, orbitInfo } from './kepler.js';
const TAU=2*Math.PI;
const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
const norm=a=>Math.hypot(...a);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const diff=(a,b)=>a.map((x,i)=>x-b[i]);
function stump(z){
 if(Math.abs(z)<1e-4)return [.5-z/24+z*z/720-z*z*z/40320,1/6-z/120+z*z/5040-z*z*z/362880];
 const x=Math.sqrt(Math.abs(z));
 return z>0?[(1-Math.cos(x))/z,(x-Math.sin(x))/(x*x*x)]:[(Math.cosh(x)-1)/(-z),(Math.sinh(x)-x)/(x*x*x)];
}
export function lambert(r1,r2,seconds,mu,{normal,longWay=false}={}) {
 if(!(seconds>0&&mu>0)||![seconds,mu,...r1,...r2].every(Number.isFinite))return null;
 const scale=Math.max(norm(r1),norm(r2));if(!(scale>0))return null;
 const a=r1.map(x=>x/scale),b=r2.map(x=>x/scale),ra=norm(a),rb=norm(b);
 const cos=Math.max(-1,Math.min(1,dot(a,b)/(ra*rb)));
 if(Math.abs(cos)>1-1e-10)return null; // plane is ambiguous at collinearity
 if(normal)longWay=dot(cross(a,b),normal)<0;
 const A=(longWay?-1:1)*Math.sqrt(ra*rb*(1+cos));
 const time=seconds*Math.sqrt(mu/scale**3);
 const at=z=>{const [C,S]=stump(z);if(!(C>0))return null;const y=ra+rb+A*(z*S-1)/Math.sqrt(C);if(y<0)return null;return {y,t:(y/C)**1.5*S+A*Math.sqrt(y)};};
 let lo=0,step=1;
 while((at(lo)?.t??-Infinity)>time&&lo>-2048){lo-=step;step*=2;}
 const hiLimit=4*Math.PI*Math.PI-1e-5;
 let hi=hiLimit;
 if((at(hi)?.t??0)<time)return null;
 for(let i=0;i<90;i++){const mid=(lo+hi)/2,result=at(mid);if(!result||result.t<time)lo=mid;else hi=mid;}
 const result=at((lo+hi)/2);if(!result||Math.abs(result.t-time)>Math.max(1e-9,time*1e-8))return null;
 const f=1-result.y/ra,g=A*Math.sqrt(result.y),gd=1-result.y/rb;
 if(Math.abs(g)<1e-12)return null;
 const speed=Math.sqrt(mu/scale);
 return {v1:a.map((x,i)=>(b[i]-f*x)/g*speed),v2:a.map((x,i)=>(gd*b[i]-x)/g*speed),seconds,longWay};
}
export function hohmann(r1,r2,mu) {
 if(!(r1>0&&r2>0&&mu>0)||![r1,r2,mu].every(Number.isFinite))return null;
 const a=(r1+r2)/2,v1=Math.sqrt(mu/r1),v2=Math.sqrt(mu/r2);
 const departure=Math.sqrt(mu*(2/r1-1/a))-v1,arrival=v2-Math.sqrt(mu*(2/r2-1/a));
 const seconds=Math.PI*Math.sqrt(a**3/mu);
 return {departure,arrival,deltaV:Math.abs(departure)+Math.abs(arrival),seconds,phase:Math.PI-Math.sqrt(mu/r2**3)*seconds};
}
export function stateAfter(r,v,dt,mu){const pos=[0,0,0],vel=[0,0,0];propagate(r,v,dt,mu,pos,vel);return {pos,vel};}
export function clearArc(r,v,dt,mu,minimumRadius) {
 if(!(minimumRadius>0))return true;
 const o=orbitInfo(r,v,mu);
 if(norm(r)<minimumRadius||norm(stateAfter(r,v,dt,mu).pos)<minimumRadius)return false;
 return !(o.rp<minimumRadius&&Number.isFinite(o.timeToPe)&&o.timeToPe>=0&&o.timeToPe<=dt);
}
// Search a finite family of launch times and flight durations against the
// target's future state. Lower cost favours delta-v; waiting is shown explicitly.
// timeWeight: m/s of delta-v a second of waiting and flying is worth (by default next to nothing:
// the cheapest arc; a landing, with fuel to spare, weighs time)
export function rendezvousWindow({r,v,mu,target,epoch=0,maxWait,flightTimes,clearance=0,acceleration=1,samples=24,timeWeight}) {
 const o=orbitInfo(r,v,mu),period=o.bound?o.period:TAU*Math.sqrt(norm(r)**3/mu);
 maxWait=maxWait??period;
 flightTimes=flightTimes||[.18,.28,.4,.55,.75,1,1.4].map(f=>period*f);
 let best=null;
 for(let i=0;i<=samples;i++){
  const wait=maxWait*i/Math.max(1,samples);
  if(!clearArc(r,v,wait,mu,clearance))continue;
  const start=stateAfter(r,v,wait,mu);
  for(const tof of flightTimes){
   const end=target(epoch+wait+tof);if(!end)continue;
   for(const longWay of [false,true]){
    const sol=lambert(start.pos,end.pos,tof,mu,{longWay});if(!sol||!clearArc(start.pos,sol.v1,tof,mu,clearance))continue;
    const dv1=diff(sol.v1,start.vel),dv2=diff(end.vel,sol.v2),deltaV=norm(dv1)+norm(dv2);
    const burnSeconds=deltaV/Math.max(.001,acceleration);
    // An impulsive seed is not a usable plan when the burns occupy most of it.
    if(burnSeconds>tof*.45)continue;
    const score=deltaV+(timeWeight??.0005*Math.sqrt(mu/norm(r))/period)*(wait+tof);
    if(!best||score<best.score)best={epoch:epoch+wait,arrival:epoch+wait+tof,wait,seconds:tof,r:start.pos,vBefore:start.vel,vDeparture:sol.v1,vArrival:sol.v2,targetPosition:end.pos,targetVelocity:end.vel,dv1,dv2,deltaV,burnSeconds,score};
   }
  }
 }
 return best;
}
