import * as THREE from 'three';
import { hullEnvelope } from './reentry.js';
import { surfaceTargets } from './surfaceGuidance.js';

const clamp=THREE.MathUtils.clamp;
const tangent=(dir,up)=>dir.clone().addScaledVector(up,-dir.dot(up)).normalize();

// A corridor is fixed in the world's rotating frame, not rebuilt around the
// pilot every frame. Changing the landing site or explicitly rejoining resets it.
export function landingCorridor(ship,dest) {
  const body=dest.body,site=dest.dirF.clone().normalize(),current=ship.pos.clone().normalize().applyQuaternion(body.qInv);
  let back=tangent(current,site);
  if(back.lengthSq()<.5)back=tangent(new THREE.Vector3(0,0,1).applyQuaternion(ship.quat).applyQuaternion(body.qInv),site);
  if(back.lengthSq()<.5)back=tangent(Math.abs(site.y)<.9?new THREE.Vector3(0,1,0):new THREE.Vector3(1,0,0),site);
  const normal=new THREE.Vector3().crossVectors(site,back).normalize();
  const size=hullEnvelope(ship.type).size,gh=body.groundHeight(site),hover=Math.max(40,size[1]/2+12);
  const span=Math.min(body.R*.45,150000,Math.max(10000,Math.acos(clamp(site.dot(current),-1,1))*body.R*1.2));
  const distances=[0,80,160,280,450];for(let d=700;d<span;d=d*1.28+100)distances.push(d);distances.push(span);
  const gates=distances.sort((a,b)=>a-b).map(distance=>{
    const angle=distance/body.R,up=site.clone().multiplyScalar(Math.cos(angle)).addScaledVector(back,Math.sin(angle));
    const width=Math.max(size[0]/2+12,Math.min(180,20+distance*.025));
    const halfHeight=Math.max(size[1]/2+8,Math.min(90,14+distance*.012));
    let ground=body.groundHeight(up);
    for(const side of [-1,1])ground=Math.max(ground,body.groundHeight(up.clone().multiplyScalar(body.R).addScaledVector(normal,side*width).normalize()));
    const altitude=Math.max(gh+hover+distance*.12,ground+halfHeight+12);
    return {distance,up,width,halfHeight,altitude,terrainRaised:altitude>gh+hover+distance*.12+1};
  });
  // Carry higher terrain clearance back up the approach so an obstruction
  // produces an early climb/level leg, rather than a sudden dip into a valley.
  for(let i=1;i<gates.length;i++)gates[i].altitude=Math.max(gates[i].altitude,gates[i-1].altitude);
  const foot=Math.max(5,size[0]/2),ahead=new THREE.Vector3().crossVectors(normal,site);
  let slope=0;
  for(const v of [normal,ahead])for(const sign of [-1,1])slope=Math.max(slope,Math.abs(body.groundHeight(site.clone().multiplyScalar(body.R).addScaledVector(v,foot*sign).normalize())-gh)/foot);
  return {body,site,back,normal,gates,gh,hover,slope};
}

export class LandingGuide {
  constructor(nav){this.nav=nav;this.enabled=true;this.dest=null;this.route=null;}
  select(dest){if(dest?.kind!=='site')return false;this.dest=dest;this.enabled=true;this.route=null;return true;}
  rejoin(){this.route=null;}
  update(){
    const nav=this.nav,s=nav.ship;
    if(nav.active){if(nav.dest?.kind==='site')this.dest=nav.dest;else return null;}
    const d=this.dest,b=s.body;
    if(!this.enabled||!d||s.parent||s.dead||s.type.ground||!s.type.legs||s.ftl?.state==='cruise')return null;
    if(d.body!==b)return {message:'Landing guide · arrive at '+d.name,waiting:true};
    if(!d.dirF)return {message:'Landing guide · surveying a landing site',waiting:true};
    const range=Math.acos(clamp(s.pos.clone().normalize().dot(d.dirF.clone().applyQuaternion(b.q)),-1,1))*b.R;
    // Orbital transfer comes first. Do not draw an apparently safe tunnel
    // through the planet or imply boxes can substitute for a deorbit burn.
    if(range>Math.min(140000,b.R*.4)||s.altitude>Math.max(20000,b.atmHeight||0)||s.surfaceVel(new THREE.Vector3()).length()>2500)
      return {message:'Landing guide · deorbit / slow to surface approach',waiting:true};
    if(!this.route||this.route.body!==b||this.route.site.distanceTo(d.dirF)>1e-8)this.route=landingCorridor(s,d);
    const r=this.route,up=s.pos.clone().normalize(),fixed=up.clone().applyQuaternion(b.qInv);
    const along=Math.atan2(fixed.dot(r.back),fixed.dot(r.site))*b.R,cross=Math.asin(clamp(fixed.dot(r.normal),-1,1))*b.R;
    const next=r.gates.find(g=>g.distance>=Math.max(0,along))||r.gates.at(-1),index=r.gates.indexOf(next),prev=r.gates[Math.max(0,index-1)];
    const t=clamp((along-prev.distance)/Math.max(1,next.distance-prev.distance),0,1),altitude=THREE.MathUtils.lerp(prev.altitude,next.altitude,t);
    const height=s.pos.length()-b.R-r.gh;
    const final=range<80&&height<150,relative=s.surfaceVel(new THREE.Vector3());
    const toward=tangent(r.site.clone().applyQuaternion(b.q),up),closing=relative.dot(toward);
    // Follow the slope while on-path, then add altitude correction. Shared
    // heat and terrain limits still override the desired descent rate.
    const slope=(next.altitude-prev.altitude)/Math.max(1,next.distance-prev.distance);
    const targets=surfaceTargets(s,{up,range,height,targetHeight:altitude-r.gh,verticalFeed:-slope*Math.max(0,closing)});
    const drift=Math.sqrt(Math.max(0,targets.speed**2-closing**2));
    let targetSpeed=targets.vh,targetVertical=targets.vv;
    if(final){targetSpeed=Math.min(3,range*.3);targetVertical=range>12?0:-clamp((s.agl||0)*.3,1,6);}
    if(s.landed){targetSpeed=0;targetVertical=0;}
    const netUp=s.maxUpAccel?.()??targets.a-targets.g,down=Math.max(0,-targets.vr);
    const stopping=down>0?(netUp>0?down*down/(2*netUp):Infinity):0;
    const caution=[];
    if(targets.a<=targets.g*1.04)caution.push('INSUFFICIENT LOADED THRUST');
    if(stopping>Math.max(0,s.agl-8))caution.push('ARREST DESCENT');
    if(targets.speed>targetSpeed*1.18+5)caution.push('BRAKE');
    if(targets.speed>targets.heat*1.05)caution.push('HOLD ALTITUDE · HOT ENTRY');
    if(along<-35)caution.push('TURN BACK TO SITE');
    else if(Math.abs(cross)>next.width*1.5)caution.push('REJOIN CORRIDOR');
    if(height<150&&s.gear<.99)caution.push('LOWER GEAR');
    if(r.slope>Math.tan(12*Math.PI/180))caution.push('SITE SLOPE · CHECK GROUND');
    if(targets.vv>2&&height<altitude-r.gh-30)caution.push('CLIMB TO PATH');
    const world=v=>v.clone().applyQuaternion(b.q).add(b.pos);
    const gates=r.gates.filter(g=>g.distance<=along+10).slice(-8).map(g=>{
      const center=g.up.clone().multiplyScalar(b.R+g.altitude);
      const corners=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([x,y])=>world(center.clone().addScaledVector(r.normal,x*g.width).addScaledVector(g.up,y*g.halfHeight)));
      return {...g,center:world(center),corners};
    });
    const site=world(r.site.clone().multiplyScalar(b.R+r.gh));
    return {gates,site,label:d.label||d.name||'Landing site',range,cross,along,altitudeError:s.pos.length()-b.R-altitude,
      speed:targets.speed,vertical:targets.vr,targetSpeed,targetVertical,drift,closing,stopping,final,landed:s.landed,
      caution,message:s.landed?'TOUCHDOWN':final?'HOVER · SETTLE':'SURFACE APPROACH'};
  }
}
