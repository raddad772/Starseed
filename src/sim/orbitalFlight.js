// Finite-thrust flight guidance. Plans use osculating two-body arcs, but every
// maneuver goes through Ship.computeControl and the real engine/attitude model.
// Coast events are expressed in world time so all players share one ephemeris.
import * as THREE from 'three';
import { orbitInfo } from '../core/kepler.js';
import { lambert, hohmann, stateAfter, rendezvousWindow, clearArc } from '../core/transfers.js';
import { bodyState, commonPrimary, branchUnder, planetaryWindow } from './orbitalRoutes.js';
import { heatSafeSpeed, gasProperties } from './reentry.js';
const V=a=>new THREE.Vector3(...a), clamp=THREE.MathUtils.clamp;
import { maneuverAuthority, surfaceTargets } from './surfaceGuidance.js';
export { maneuverAuthority } from './surfaceGuidance.js';
export class OrbitalFlight {
  constructor(nav,kind,then) {
    this.nav=nav;this.s=nav.ship;this.g=nav.game;this.kind=kind;this.then=then;
    this.stage='Planning';this.event=Infinity;this.arc=null;this.command=new THREE.Vector3();
    this.deltaV=0;this.burnSeconds=0;this.wait=0;this.eta=Infinity;
  }
  get now(){return this.g.t;}
  get authority(){return maneuverAuthority(this.s);}
  get safeRadius(){const b=this.s.body;return b.R+Math.max((b.atmHeight||0)*1.03,(b.relief||0)*1.6+1500);}
  finish(){this.nav.flight=null;this.nav.nextEventAt=Infinity;this.then();}
  fail(why){this.nav.cancel(why,'caution');}
  thrust(A,accel,urgent=false) {
    const s=this.s,{belly,acceleration}=this.authority;
    const mag=accel.length();A.coast=false;A.orbital=true;
    if(!(mag>1e-8&&acceleration>0)){A.coast=true;return;}
    const dir=accel.clone().normalize(),up=s.pos.clone().normalize();
    if(belly){
      const nose=s.vel.clone().addScaledVector(dir,-s.vel.dot(dir));
      if(nose.lengthSq()<1)nose.set(0,0,-1).applyQuaternion(s.quat).addScaledVector(dir,-nose.dot(dir));
      if(nose.lengthSq()<1e-6)nose.set(1,0,0).addScaledVector(dir,-dir.x);
      if(nose.lengthSq()<1e-6)nose.set(0,0,1);
      this.nav.point(A,nose.normalize(),dir);
    }else this.nav.point(A,dir,up);
    const axis=new THREE.Vector3(0,belly?1:0,belly?0:-1).applyQuaternion(s.quat);
    // Turn before firing in space; atmospheric lift remains available while
    // banking. Turning holds high warp even when the main engine is idle.
    this.command.copy(accel).multiplyScalar(Math.min(1,acceleration/mag));
    if(!urgent&&axis.dot(dir)<.985)this.command.set(0,0,0);
    A.thrust=this.command;this.event=this.now;
  }
  coast(A,until,heading=null){
    A.coast=true;A.orbital=true;A.vel.copy(this.s.vel);this.event=until;
    if(heading)this.nav.point(A,heading,this.s.pos.clone().normalize());
  }
  update(A) {
    A.orbital=true;this.event=Infinity;this.wait=0;
    if(!(this.authority.acceleration>1e-5)){this.fail('no available thrust for this route');return;}
    if(this.kind==='park'||this.kind==='lock')this.parking(A);
    else if(this.kind==='rendezvous')this.rendezvous(A);
    else if(this.kind==='entry')this.entry(A);
    else if(this.kind==='journey')this.journey(A);
    if(this.nav.flight===this)this.nav.nextEventAt=this.event;
  }
  parking(A) {
    if(this.arc){this.flyArc(A);return;}
    const s=this.s,b=s.body,low=this.nav.parkRadius(b),radius=this.kind==='lock'?this.nav.lockOrbitRadius():low,o=s.orbit();
    if(this.kind==='lock'&&o.rp<this.safeRadius&&radius>low*1.01){this.insert(A,low,()=>{});return;}
    if(!this.parkTransfer&&o.bound&&o.rp>this.safeRadius&&Math.abs(s.pos.length()-radius)>Math.max(5000,radius*.01)){
      const normal=V(o.h).normalize(),tof=hohmann(s.pos.length(),radius,b.GM).seconds*.98;
      const goal=s.pos.clone().normalize().applyAxisAngle(normal,Math.PI*.98).multiplyScalar(radius);
      const velocity=new THREE.Vector3().crossVectors(normal,goal).setLength(Math.sqrt(b.GM/radius));
      const arrival=this.now+tof,target=t=>stateAfter(goal.toArray(),velocity.toArray(),t-arrival,b.GM);
      const plan=rendezvousWindow({r:s.pos.toArray(),v:s.vel.toArray(),mu:b.GM,target,epoch:this.now,maxWait:0,flightTimes:[tof],samples:0,clearance:this.safeRadius,acceleration:this.authority.acceleration});
      if(this.setArc(plan,target,()=>{this.arc=null;this.parkTransfer=true;}))this.flyArc(A);
      return;
    }
    this.insert(A,radius);
  }
  // Pitch/bank progressively into the orbital track while climbing. The radial
  // loop supplies only the gravity not already supported by horizontal motion.
  // As orbital speed builds, lift rolls into prograde thrust and then cuts off.
  insert(A,targetR,complete=()=>this.finish()) {
    const s=this.s,b=s.body,r=s.pos.length(),u=s.pos.clone().divideScalar(r),vr=s.vel.dot(u);
    const t=s.vel.clone().addScaledVector(u,-vr);
    if(t.lengthSq()<1)t.copy(b.omega).cross(u);
    if(t.lengthSq()<1)t.set(0,1,0).cross(u);
    if(t.lengthSq()<1e-8)t.set(1,0,0).cross(u);
    t.normalize();
    const vt=s.vel.dot(t),vc=Math.sqrt(b.GM/targetR),a=this.authority.acceleration,g=b.GM/r**2;
    if(r<b.R+1000&&a<g*1.04){this.fail('insufficient loaded thrust to reach orbit from this world');return;}
    const dr=targetR-r,air=s.env.density>1e-7;
    const heat=air?heatSafeSpeed(s.env.density,s.entry.radius,gasProperties(b.atm),s.entryProfile,s.env.temperature)*.82:Infinity;
    let vrGoal=Math.sign(dr)*Math.min(250,Math.sqrt(2*a*.14*Math.abs(dr)),Math.abs(dr)/30);
    const aerodynamicClimb=s.env.density>.01;
    if(aerodynamicClimb&&s.type.aero.wing>0)vrGoal=Math.min(vrGoal,Math.max(8,vt*.09));
    vrGoal=clamp(vrGoal,-Math.max(5,(r-this.safeRadius)/40),Math.sqrt(Math.max(0,heat*heat-vt*vt)));
    const aero=air&&s._lastAero?s._lastAero.clone().divideScalar(s.effMass):new THREE.Vector3();
    let ar=clamp(g-vt*vt/r+(vrGoal-vr)/18-aero.dot(u),-a*.95,a*.99);
    const at=clamp((Math.min(vc,heat*.94)-vt)/25+vr*vt/r-aero.dot(t),-Math.sqrt(Math.max(0,a*a-ar*ar)),Math.sqrt(Math.max(0,a*a-ar*ar)));
    const accel=u.clone().multiplyScalar(ar).addScaledVector(t,at);
    this.stage=r<b.R+(b.atmHeight||15000)?'Gravity turn':'Circularizing';
    this.eta=Math.max(Math.abs(dr)/Math.max(20,Math.abs(vrGoal)),Math.abs(vc-vt)/a);
    this.deltaV=Math.hypot(vc-vt,vr);this.burnSeconds=this.deltaV/a;
    this.thrust(A,accel,true);
    if(aerodynamicClimb){
      // Wings and weak lift engines cannot sustain the negative angle of
      // attack produced by tilting the belly forward at low altitude. Use the
      // forward engine while the wings fly; bank the lift axis in thin air.
      const pitch=Math.min(.12,Math.max(0,Math.atan2(vr,Math.max(50,vt))+.025));
      this.nav.point(A,t.clone().multiplyScalar(Math.cos(pitch)).addScaledVector(u,Math.sin(pitch)),u);
    }
    const o=s.orbit();
    if(o.bound&&o.rp>this.safeRadius&&Math.abs(dr)<Math.max(250,targetR*.001)&&Math.abs(vt-vc)<2&&Math.abs(vr)<2){this.coast(A,Infinity);complete();}
  }
  setArc(plan,target,done,{flyby=false,clearance=this.safeRadius}={}) {
    if(!plan){this.fail('no safe transfer window found with this ship’s thrust; try a higher parking orbit or another route');return false;}
    this.arc={...plan,body:this.s.body,target,done,flyby,clearance,state:'wait',nextCorrection:0};
    this.deltaV=plan.deltaV;this.burnSeconds=plan.burnSeconds;return true;
  }
  flyArc(A) {
    const p=this.arc,s=this.s,now=this.now,a=this.authority.acceleration,turn=this.authority.turn;
    if(s.body!==p.body){this.arc=null;p.done();return;}
    const left=p.arrival-now;this.eta=Math.max(0,left);this.wait=Math.max(0,p.epoch-now);
    const dep=V(p.dv1),lead=dep.length()/a*.55+turn;
    if(now<p.epoch-lead){this.stage='Waiting for launch window';this.coast(A,p.epoch-lead,dep);return;}
    const end=p.target(p.arrival);if(!end){this.fail('destination no longer available');return;}
    const incoming=V(p.vArrival).sub(V(end.vel)).length();
    const captureLead=p.flyby?0:incoming/a*1.8+turn+30;
    if(!p.flyby&&left<=captureLead){
      if(p.gate){this.arc=null;this.coast(A,this.now);p.done();return;}
      this.stage='Arrival braking';this.terminal(A,p);return;
    }
    if(left<=1){this.arc=null;p.done();return;}
    if(p.state==='coast'&&now<p.nextCorrection){this.stage='Transfer coast';this.coast(A,Math.min(p.nextCorrection,p.arrival-captureLead));return;}
    const sol=lambert(s.pos.toArray(),end.pos,left,s.body.GM,{normal:new THREE.Vector3().crossVectors(V(p.r),V(p.vDeparture)).toArray()});
    if(!sol||!clearArc(s.pos.toArray(),sol.v1,left,s.body.GM,p.clearance)){
      // Keep an already validated coast while waiting out numerical collinearity.
      if(p.state==='coast'){this.coast(A,now+1);return;}
      if(!p.flyby){
        const revised=rendezvousWindow({r:s.pos.toArray(),v:s.vel.toArray(),mu:s.body.GM,target:p.target,epoch:now,maxWait:0,flightTimes:[.8,1.15,1.5].map(x=>left*x),clearance:p.clearance,acceleration:a,samples:0});
        if(revised){this.setArc(revised,p.target,p.done,{clearance:p.clearance});this.arc.gate=p.gate;this.coast(A,now);return;}
      }
      this.fail('transfer arc no longer clears the primary; maneuver cancelled');return;
    }
    p.vArrival=sol.v2;
    const dv=V(sol.v1).sub(s.vel);this.deltaV=dv.length()+incoming;this.burnSeconds=this.deltaV/a;
    if(dv.length()<.25){
      p.state='coast';p.coasted=true;p.nextCorrection=Math.min(now+Math.max(10,left*.15),p.arrival-captureLead);
      this.stage='Transfer coast';this.coast(A,p.nextCorrection);return;
    }
    this.stage=p.coasted?'Course correction':'Departure burn';p.state='burn';
    this.thrust(A,dv.multiplyScalar(1/Math.max(1.5,s.big?8:2)));
  }
  terminal(A,p) {
    const s=this.s,a=this.authority.acceleration,target=p.target(this.now);
    const goal=V(target.pos),ref=V(target.vel),offset=goal.clone().sub(s.pos),range=offset.length();
    const closing=Math.min(Math.sqrt(2*a*range)*.5,range*.03);
    const cmd=offset.multiplyScalar(closing/Math.max(1,range)).add(ref).sub(s.vel);
    const dv=cmd.length();
    // Match the target's gravitational acceleration; relative guidance does
    // not spend an engine continuously cancelling the primary's gravity.
    const acc=cmd.divideScalar(Math.max(3,s.big?12:5));
    acc.addScaledVector(s.pos,s.body.GM/s.pos.length()**3);
    if(target.acc)acc.add(V(target.acc));else acc.addScaledVector(goal,-s.body.GM/goal.length()**3);
    this.thrust(A,acc);
    if(range<(p.gate?2500:800)&&s.vel.distanceTo(ref)<(p.gate?60:12)){
      this.arc=null;this.coast(A,Infinity);p.done();
    }
    this.deltaV=dv;this.burnSeconds=dv/a;
  }
  surface(A,{up,heading,range,height,targetHeight}) {
    const s=this.s,b=s.body,r=s.pos.length(),a=this.authority.acceleration;
    const {vh,vv,vr,horizontal,g,aero}=surfaceTargets(s,{up,range,height,targetHeight});
    if(height<250&&range<500){
      this.nav.slew(A,heading.clone().multiplyScalar(vh).addScaledVector(up,vv).add(s.frameVel(new THREE.Vector3())));
      this.nav.level(A,heading);return;
    }
    const inertialVr=s.vel.dot(up),inertialH=s.vel.clone().addScaledVector(up,-inertialVr);
    // Never fire toward the ground merely to maintain a descent rate while
    // aerodynamic drag is already supporting us. This also avoids a late
    // 180-degree engine reversal just before the landing flare.
    const ar=clamp(g-inertialH.lengthSq()/r+(vv-vr)/15-aero.dot(up),0,a*.99);
    const along=heading.clone().multiplyScalar(vh).sub(horizontal).divideScalar(12).addScaledVector(horizontal,vr/r);
    along.sub(aero.clone().addScaledVector(up,-aero.dot(up)));
    along.clampLength(0,Math.sqrt(Math.max(0,a*a-ar*ar)));
    this.thrust(A,along.addScaledVector(up,ar),true);
  }
  rendezvous(A) {
    if(this.arc){this.flyArc(A);return;}
    const s=this.s,o=this.nav.other;
    if(!o||o.body!==s.body){this.kind='journey';this.journey(A);return;}
    const epoch=this.now;
    const target=t=>{
      // Rebase on the live target for corrections if it maneuvered meanwhile.
      const rr=o.getWorldPos(new THREE.Vector3()).sub(s.body.pos).toArray(),vv=o.getWorldVel(new THREE.Vector3()).sub(s.body.vel).toArray();
      const state=stateAfter(rr,vv,t-this.now,s.body.GM);
      const up=V(state.pos).normalize().multiplyScalar(Math.max(1600,(o.type?.radius||30)*3));
      state.pos=state.pos.map((x,i)=>x+up.getComponent(i));return state;
    };
    const plan=rendezvousWindow({r:s.pos.toArray(),v:s.vel.toArray(),mu:s.body.GM,target,epoch,clearance:this.safeRadius,acceleration:this.authority.acceleration});
    if(this.setArc(plan,target,()=>this.finish()))this.flyArc(A);
  }
  entry(A) {
    if(this.arc){this.flyArc(A);return;}
    const s=this.s,b=s.body,d=this.nav.dest;
    if(!d.dirF){this.stage='Waiting for surface survey';this.coast(A,Infinity);return;}
    if(s.altitude<Math.max(b.atmHeight||0,15000)&&s.surfaceVel(new THREE.Vector3()).length()<800){this.finish();return;}
    const high=Math.max((b.atmHeight||0)*1.08,(b.relief||0)*1.6+8000);
    const radius=b.R+high,normal=new THREE.Vector3().crossVectors(s.pos,s.vel).normalize();
    const gate=t=>{
      const q=new THREE.Quaternion();if(b.orientationAt)b.orientationAt(t,q);else q.copy(b.q);
      const site=d.dirF.clone().applyQuaternion(q),tangent=new THREE.Vector3().crossVectors(normal,site).normalize();
      // Arrive up-range, with room for a shallow, powered entry corridor.
      const angle=Math.min(.65,Math.max(.025,high/.12/b.R));
      const up=site.clone().multiplyScalar(Math.cos(angle)).addScaledVector(tangent,-Math.sin(angle)).normalize();
      const track=new THREE.Vector3().crossVectors(normal,up).normalize();
      const pos=up.multiplyScalar(radius),vel=new THREE.Vector3().crossVectors(b.omega,pos).addScaledVector(track,Math.min(350,Math.sqrt(b.GM/radius)*.3));
      const acc=new THREE.Vector3().crossVectors(b.omega,new THREE.Vector3().crossVectors(b.omega,pos));
      return {pos:pos.toArray(),vel:vel.toArray(),acc:acc.toArray()};
    };
    const plan=rendezvousWindow({r:s.pos.toArray(),v:s.vel.toArray(),mu:b.GM,target:gate,epoch:this.now,clearance:this.safeRadius,acceleration:this.authority.acceleration});
    if(this.setArc(plan,gate,()=>this.finish())){this.arc.gate=true;this.flyArc(A);}
  }
  journey(A) {
    const s=this.s,d=this.nav.dest,targetBody=d.body||this.nav.other?.body;
    if(!targetBody){this.fail('destination has no orbital frame');return;}
    if(s.body===targetBody){
      this.arc=null;
      if(this.nav.other){this.kind='rendezvous';this.rendezvous(A);return;}
      const orbit=s.orbit(),a=this.authority.acceleration;
      const safeCapture=this.nav.parkRadius(s.body)*1.05;
      const radius=orbit.rp>=safeCapture?orbit.rp:Math.max(safeCapture,s.pos.length()*.9);
      const dv=Math.max(0,Math.sqrt(2*(orbit.energy+s.body.GM/radius))-Math.sqrt(s.body.GM/radius));
      const lead=dv/a*1.8+this.authority.turn+30;
      if(!this.captureRadius&&orbit.rp>=safeCapture&&s.pos.dot(s.vel)<0&&orbit.timeToPe>lead){
        this.stage='Coasting to capture';this.deltaV=dv;this.burnSeconds=dv/a;this.eta=orbit.timeToPe;
        this.coast(A,this.now+orbit.timeToPe-lead,s.vel.clone().negate());return;
      }
      this.captureRadius ||= radius;
      this.insert(A,this.captureRadius,()=>this.finish());this.stage='Orbit capture';return;
    }
    if(this.arc){this.flyArc(A);return;}
    const primary=commonPrimary(s.body,targetBody);
    if(!primary){this.fail('no shared primary for this route');return;}
    // An unsafe departure first establishes a parking orbit. Air-breathing
    // vehicles fail here as their actual available thrust falls away.
    const o=s.orbit();
    if(s.body!==primary&&(!o.bound||o.rp<this.safeRadius)&&s.pos.length()<this.nav.parkRadius(s.body)*1.2){this.insert(A,this.nav.parkRadius(s.body),()=>{});return;}
    if(s.body!==primary){
      if(s.body.parent!==primary||targetBody===primary){this.escape(A,primary,null);return;}
      if(!this.route||this.route.source!==s.body||this.route.arrival<this.now){
        this.stage='Calculating planetary launch window';
        this.route=planetaryWindow(s.body,targetBody,this.now,this.authority.acceleration,b=>this.nav.parkRadius(b));
        if(!this.route){this.fail('no safe planetary transfer window found for this hull');return;}
      }
      this.escape(A,primary,this.route);return;
    }
    this.interceptBody(A,branchUnder(targetBody,primary));
  }
  escape(A,primary,route) {
    const s=this.s,b=s.body,a=this.authority.acceleration;
    const desired=route?V(route.outgoing):V(bodyState(b,this.now,primary).vel).normalize().multiplyScalar(Math.sqrt(b.GM/b.soi));
    if(desired.length()<1)desired.set(1,0,0);
    const speed=Math.max(desired.length(),Math.sqrt(b.GM/b.soi));
    const tof=Math.max(300,b.soi/speed),period=s.orbit().period||3600;
    const earliest=route?Math.max(this.now,route.departure-tof*.5-period):this.now;
    if(this.now<earliest){this.stage='Waiting for planetary window';this.wait=earliest-this.now;this.eta=route.arrival-this.now;this.deltaV=route.deltaV;this.burnSeconds=route.burnSeconds;this.coast(A,earliest);return;}
    const exit=desired.clone().normalize().multiplyScalar(b.soi*1.03);
    const target=()=>({pos:exit.toArray(),vel:desired.toArray()});
    const plan=rendezvousWindow({r:s.pos.toArray(),v:s.vel.toArray(),mu:b.GM,target,epoch:this.now,maxWait:Math.min(period,tof),flightTimes:[.8,1,1.3].map(x=>tof*x),clearance:this.safeRadius,acceleration:a,samples:32});
    if(this.setArc(plan,target,()=>{this.arc=null;},{flyby:true}))this.flyArc(A);
  }
  interceptBody(A,target) {
    const s=this.s,b=s.body,epoch=this.now,a=this.authority.acceleration;
    if(!target){this.finish();return;}
    const bodyTarget=t=>bodyState(target,t,b);
    let plan;
    if(this.route&&this.route.target===target&&this.route.arrival>epoch+300){
      const end=bodyTarget(this.route.arrival),seconds=this.route.arrival-epoch;
      const sol=lambert(s.pos.toArray(),end.pos,seconds,b.GM,{normal:target.data.orbit.W});
      if(sol){const dv1=sol.v1.map((x,i)=>x-s.vel.getComponent(i)),dv2=end.vel.map((x,i)=>x-sol.v2[i]);plan={r:s.pos.toArray(),epoch,arrival:this.route.arrival,seconds,vDeparture:sol.v1,vArrival:sol.v2,dv1,dv2,deltaV:Math.hypot(...dv1)+Math.hypot(...dv2),burnSeconds:(Math.hypot(...dv1)+Math.hypot(...dv2))/a};}
    }
    if(!plan)plan=rendezvousWindow({r:s.pos.toArray(),v:s.vel.toArray(),mu:b.GM,target:bodyTarget,epoch,clearance:this.safeRadius,acceleration:a,samples:32});
    if(!plan){this.fail('no safe encounter with '+target.data.name);return;}
    // B-plane offset gives a safe periapsis rather than aiming through the
    // planet. The local gravity well then bends the arrival toward capture.
    const state=bodyTarget(plan.arrival),vinf=V(plan.vArrival).sub(V(state.vel));
    const rp=this.nav.parkRadius(target)*1.3,impact=rp*Math.sqrt(1+2*target.GM/(rp*Math.max(1,vinf.lengthSq())));
    const normal=V(target.data.orbit.W),offset=new THREE.Vector3().crossVectors(vinf,normal).normalize().multiplyScalar(impact);
    const aim=t=>{const st=bodyTarget(t);st.pos=st.pos.map((x,i)=>x+offset.getComponent(i));return st;};
    if(this.setArc(plan,aim,()=>{this.arc=null;},{flyby:true}))this.flyArc(A);
  }
}
