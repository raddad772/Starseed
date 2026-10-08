// Read-only ephemerides and patched-conic route seeds. No world time or vessel
// state is changed while searching a launch window.
import { orbitState } from '../core/kepler.js';
import { lambert, hohmann } from '../core/transfers.js';
const norm = v => Math.hypot(...v);
const sub = (a,b) => a.map((x,i)=>x-b[i]);
export function bodyState(body, t, ancestor = null) {
  if (!body || body === ancestor) return {pos:[0,0,0],vel:[0,0,0]};
  const base = bodyState(body.parent,t,ancestor), p=[0,0,0], v=[0,0,0];
  if (body.data.orbit) orbitState(body.data.orbit,t,p,v);
  return {pos:p.map((x,i)=>x+base.pos[i]),vel:v.map((x,i)=>x+base.vel[i])};
}
export function commonPrimary(a,b) {
  const chain=new Set();for(let p=a;p;p=p.parent)chain.add(p);
  for(let p=b;p;p=p.parent)if(chain.has(p))return p;
  return null;
}
export function branchUnder(body,primary) {
  if(body===primary)return null;
  while(body?.parent && body.parent!==primary)body=body.parent;
  return body?.parent===primary?body:null;
}
export function planetaryWindow(from,to,now,acceleration,parkingRadius) {
  const primary=commonPrimary(from,to), source=branchUnder(from,primary), target=branchUnder(to,primary);
  if(!primary||!source||!target||source===target)return null;
  const p=source.data.orbit,q=target.data.orbit;
  if(!p||!q)return null;
  const H=hohmann(p.a,q.a,primary.GM);
  const synodic=2*Math.PI/Math.max(1e-12,Math.abs(p.n-q.n));
  const maxWait=Math.min(synodic,Math.max(p.period,q.period)*3);
  let best=null;
  // Coarse window search, then refine its time and duration. Cost includes the
  // escape/capture wells, not just the heliocentric velocity difference.
  const assess=(departure,seconds)=>{
    const a=bodyState(source,departure,primary),b=bodyState(target,departure+seconds,primary);
    const sol=lambert(a.pos,b.pos,seconds,primary.GM,{normal:p.W});if(!sol)return;
    const outgoing=sub(sol.v1,a.vel),incoming=sub(sol.v2,b.vel);
    const rp=parkingRadius(source),rt=parkingRadius(target);
    const dv1=Math.sqrt(norm(outgoing)**2+2*source.GM/rp)-Math.sqrt(source.GM/rp);
    const dv2=Math.sqrt(norm(incoming)**2+2*target.GM/rt)-Math.sqrt(target.GM/rt);
    // There must be time to brake inside the arrival sphere of influence.
    if(norm(incoming)**2/(2*acceleration)>target.soi*.45)return;
    const score=dv1+dv2+1e-8*(departure-now+seconds);
    if(!best||score<best.score)best={primary,source,target,departure,arrival:departure+seconds,seconds,outgoing,incoming,deltaV:dv1+dv2,burnSeconds:(dv1+dv2)/acceleration,score};
  };
  for(let i=0;i<=48;i++)for(const factor of [.65,.85,1,1.2,1.5])assess(now+maxWait*i/48,H.seconds*factor);
  if(!best)return null;
  for(let pass=0;pass<2;pass++){
    const center=best,step=maxWait/(48*4**pass),ds=H.seconds*.12/4**pass;
    for(let i=-4;i<=4;i++)for(let j=-2;j<=2;j++)assess(Math.max(now,center.departure+i*step/4),Math.max(H.seconds*.3,center.seconds+j*ds));
  }
  return best;
}
