import { DECK, TILE, key, makeCollision } from './layout.js';

// Small kinematic controller, deliberately separate from vessel/general rigid-body physics.
// Units: metres, seconds; +Y up. Authoritative walkable surfaces come from the generator.
export class UnderstructureSimulation {
  constructor(plan, saved = {}) {
    this.plan=plan;this.collision=makeCollision(plan);this.pos=[...plan.spawn];this.yaw=0;this.pitch=-.12;
    this.hatchAmount=0;this.hatchOpen=false;this.liftY=0;this.liftTarget=0;this.riding=false;
    this.flashlight=true;this.time=0;this.discovered=new Set((saved.discovered||[]).filter(x=>typeof x==='string'));
    this.recorded=new Set((saved.recorded||[]).filter(x=>plan.samples.some(s=>s.id===x)));
    this.beacons=(saved.beacons||[]).filter(p=>Array.isArray(p)&&p.length===3&&p.every(Number.isFinite)).slice(-40);
    this.reservoirSeen=!!saved.reservoirSeen;this.returned=false;
  }
  get state(){return {y:this.pos[1],liftY:this.liftY,hatchOpen:this.hatchOpen&&this.hatchAmount>.98};}
  get moving(){return Math.abs(this.liftTarget-this.liftY)>.001;}
  get onPlatform(){return Math.abs(this.pos[0])<1.55&&Math.abs(this.pos[2])<1.55&&Math.abs(this.pos[1]-this.liftY)<.5;}
  get zone(){return this.pos[1]>-2?'SURFACE ACCESS':this.moving?'ACCESS SHAFT':this.pos[2]<-122?'LOWER COLLECTION / EXTENT UNKNOWN':'SERVICE STRATUM / −028';}
  offer(){
    const [x,y,z]=this.pos;
    if(y>-2&&Math.hypot(x,z)<4.6&&!this.hatchOpen)return {type:'hatch',text:'Open access hatch'};
    if(this.onPlatform&&!this.moving&&this.hatchAmount>.98)return {type:'lift',text:this.liftY>-2?'Descend to service level':'Return to the surface'};
    if(!this.moving&&Math.abs(y-DECK)<.4&&Math.hypot(x,z+3.6)<2.6&&this.liftY>-2)return {type:'call',text:'Call access lift'};
    if(this.moving)return null;
    const sample=this.plan.samples.find(s=>!this.recorded.has(s.id)&&Math.hypot(x-s.pos[0],y-s.pos[1],z-s.pos[2])<2.8);
    if(sample)return {type:'sample',id:sample.id,text:'Record signal'};
    return null;
  }
  interact(){
    const offer=this.offer();if(!offer)return null;
    if(offer.type==='hatch'){this.hatchOpen=true;return 'The access circuit still has power.';}
    if(offer.type==='lift'){this.riding=true;this.liftTarget=this.liftY>-2?DECK:0;return this.liftTarget===0?'Ascending · surface access':'Descending · service stratum';}
    if(offer.type==='call'){this.liftTarget=DECK;return 'Access lift called.';}
    if(offer.type==='sample'){this.recorded.add(offer.id);return this.plan.samples.find(s=>s.id===offer.id).title;}
  }
  step(dt,input={}) {
    // Substeps keep the capsule from crossing walls even after a slow rendered frame.
    dt=Math.min(Math.max(dt,0),.25);
    for(let t=0;t<dt;t+=1/120)this._step(Math.min(1/120,dt-t),input);
    if(this.pos[1]<-20){
      for(const t of this.plan.tiles)if(Math.hypot(this.pos[0]-t.x*TILE,this.pos[2]-t.z*TILE)<11)this.discovered.add(key(t.x,t.z));
      if(this.pos[2]<-126)this.reservoirSeen=true;
    }
    if(this.recorded.size===3&&this.pos[1]>-1&&Math.hypot(this.pos[0],this.pos[2])>4)this.returned=true;
  }
  _step(dt,input) {
    this.time+=dt;this.hatchAmount=Math.min(1,this.hatchAmount+(this.hatchOpen?dt*.7:0));
    if(this.moving){const d=this.liftTarget-this.liftY;this.liftY+=Math.sign(d)*Math.min(Math.abs(d),dt*3.5);if(Math.abs(this.liftY-this.liftTarget)<.001)this.liftY=this.liftTarget;if(this.riding)this.pos[1]=this.liftY;}
    else this.riding=false;
    this.yaw+=(input.turn||0)*dt*1.5;this.pitch=Math.max(-1.4,Math.min(1.4,this.pitch+(input.look||0)*dt));
    if(this.riding)return;
    let f=input.forward||0,s=input.strafe||0;const len=Math.hypot(f,s);if(!len)return;f/=Math.max(1,len);s/=Math.max(1,len);
    const speed=input.fast?5.5:3.1,dx=(-Math.sin(this.yaw)*f+Math.cos(this.yaw)*s)*speed*dt,dz=(-Math.cos(this.yaw)*f-Math.sin(this.yaw)*s)*speed*dt;
    for(const [axis,delta] of [[0,dx],[2,dz]]){
      const x=this.pos[0]+(axis===0?delta:0),z=this.pos[2]+(axis===2?delta:0);
      if(this.collision.canStand(x,z,this.state,.42)) {this.pos[axis]+=delta;this.pos[1]=this.collision.floorAt(x,z,this.state);}
    }
  }
  beacon(){
    if(this.moving||this.beacons.length>=40)return false;
    if(this.beacons.some(p=>Math.hypot(p[0]-this.pos[0],p[1]-this.pos[1],p[2]-this.pos[2])<2))return false;
    this.beacons.push([...this.pos]);return true;
  }
  save(){return {version:1,discovered:[...this.discovered],recorded:[...this.recorded],beacons:this.beacons,reservoirSeen:this.reservoirSeen};}
}
