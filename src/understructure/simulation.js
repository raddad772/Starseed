import { DECK, TILE, LIFT_SECONDS, key, makeCollision, chamberAt } from './layout.js';
import { machineryClock,phaseReading } from './anomalies.js';

// Small kinematic controller, deliberately separate from vessel/general rigid-body physics.
// Units: metres, seconds; +Y up. Authoritative walkable surfaces come from the generator.
export class UnderstructureSimulation {
  constructor(plan, saved = {}) {
    if(!saved||typeof saved!=='object')saved={};
    const list=name=>Array.isArray(saved[name])?saved[name]:[];
    this.plan=plan;this.collision=makeCollision(plan);this.pos=[...plan.spawn];this.yaw=0;this.pitch=-.3;
    this.hatchAmount=0;this.hatchOpen=false;this.liftY=0;this.liftTarget=0;this.riding=false;
    this.liftStartY=0;this.liftElapsed=0;
    this.flashlight=true;this.time=0;this.discovered=new Set(list('discovered').filter(x=>typeof x==='string'));
    this.recorded=new Set(list('recorded').filter(x=>plan.samples.some(s=>s.id===x)));
    this.beacons=list('beacons').filter(p=>Array.isArray(p)&&p.length===3&&p.every(Number.isFinite)).slice(-40);
    this.solved=new Set(list('solved').filter(id=>plan.puzzles.some(p=>p.id===id)));
    this.dataRecovered=!!saved.dataRecovered;
    this.reservoirSeen=!!saved.reservoirSeen;this.returned=!!saved.returned&&this.exitReady;
    this.chambersSeen=new Set(list('chambersSeen').filter(id=>plan.chambers.some(c=>c.id===id)));
    this.velocity=[0,0,0];this.flowPaused=false;this.flowTime=0;this.resonanceAt=-100;
    this.carryingCell=!!saved.carryingCell;this.foldActive=false;this.foldCrossed=false;this.foldCooldown=0;this.foldCount=0;
  }
  get state(){return {y:this.pos[1],liftY:this.liftY,hatchOpen:this.hatchOpen&&this.hatchAmount>.98};}
  get moving(){return Math.abs(this.liftTarget-this.liftY)>.001;}
  get onPlatform(){return Math.abs(this.pos[0])<this.plan.access.halfWidth-.44&&Math.abs(this.pos[2])<this.plan.access.halfDepth-.44&&Math.abs(this.pos[1]-this.liftY)<.5;}
  get chamber(){return this.pos[1]<-2?chamberAt(this.plan,this.pos[0],this.pos[2]):null;}
  get zeroG(){return this.chamber?.kind==='zero-g';}
  get complete(){return this.recorded.size===this.plan.samples.length;}
  get archiveReady(){return this.solved.size===this.plan.puzzles.length;}
  get exitReady(){return this.dataRecovered;}
  get machinery(){return this.plan.themes.includes('time')?machineryClock(this.time):{time:this.time,state:'STEADY'};}
  get phase(){const p=this.plan.puzzles.find(p=>p.id==='time');return p?phaseReading(this.time,p):null;}
  get zone(){return this.pos[1]>-2?'SURFACE ACCESS':this.moving?'ACCESS SHAFT':this.chamber?.name|| (this.pos[2]<-122?'LOWER COLLECTION / EXTENT UNKNOWN':`SERVICE STRATUM / −${Math.abs(DECK)}`);}
  offer(){
    const [x,y,z]=this.pos;
    if(y>-2&&Math.hypot(x,z)<4.6&&!this.hatchOpen)return {type:'hatch',text:'Open access hatch'};
    if(this.onPlatform&&!this.moving&&this.hatchAmount>.98)return this.liftY<-2&&!this.exitReady?{type:'offline',text:'Transit offline · retrieve the site record'}:{type:'lift',text:this.liftY>-2?'Descend to service level':'Return to the surface'};
    if(!this.moving&&Math.abs(y-DECK)<.4&&Math.hypot(x,z+3.6)<2.6&&this.liftY>-2)return {type:'call',text:'Call access lift'};
    if(this.moving)return null;
    const near=p=>Math.hypot(x-p[0],y-p[1],z-p[2])<2.5;
    const archive=this.plan.samples.find(s=>s.id==='reservoir');
    if(!this.dataRecovered&&near(archive.pos))return {type:'archive_data',id:'reservoir',text:this.archiveReady?'Retrieve the site record':'Repository locked · restore the local circuits'};
    for(const p of this.plan.puzzles) {
      if(p.kind==='relay'&&!this.solved.has(p.id)){
        if(!this.carryingCell&&near(p.source))return {type:'cell',text:'Take charged return cell'};
        if(near(p.socket))return {type:'socket',text:this.carryingCell?'Connect return cell':'Return socket · cell suspended above'};
      }
      if(p.kind==='phase'&&!this.solved.has(p.id)&&near(p.pos))return {type:'phase',text:this.phase.ready?'Lock aligned transit bands':'Press when the sweep enters the lit band'};
      if(p.kind==='fold')for(let i=0;i<p.gates.length;i++)if(near(p.gates[i].pos))return {type:'fold',gate:i,text:this.foldCrossed&&!this.solved.has('space')?'Reconnect the far return terminal':this.foldActive?'Cross the marked threshold':'Link the folded return line'};
    }
    const sample=this.plan.samples.find(s=>!this.recorded.has(s.id)&&Math.hypot(x-s.pos[0],y-s.pos[1],z-s.pos[2])<2.8);
    if(sample)return {type:'sample',id:sample.id,text:'Record signal'};
    for(const id of ['upfall','resonance']) {
      const s=this.plan.samples.find(s=>s.id===id);
      if(Math.hypot(x-s.pos[0],y-s.pos[1],z-s.pos[2])<2.8)return {type:id,text:id==='resonance'?'Excite the resonators':this.flowPaused?'Restore return flow':'Hold return flow'};
    }
    return null;
  }
  interact(){
    const offer=this.offer();if(!offer)return null;
    if(offer.type==='hatch'){this.hatchOpen=true;return 'The access circuit still has power.';}
    if(offer.type==='lift'){this.riding=true;this._startLift(this.liftY>-2?DECK:0);return this.liftTarget===0?'Ascending · surface access':'Express descent · eight levels below';}
    if(offer.type==='call'){this._startLift(DECK);return 'Access lift called.';}
    if(offer.type==='offline')return 'The express lift used reserve power. Recover the site record to authorise surface return; the local circuits open its repository.';
    if(offer.type==='archive_data'){this.recorded.add('reservoir');if(!this.archiveReady)return 'Restore the marked circuits to open this repository. Each chamber shows what its mechanism needs.';this.dataRecovered=true;return 'Site record secured. T activates surface return; the access lift is also online.';}
    if(offer.type==='cell'){this.carryingCell=true;this.recorded.add('null');return 'Return cell acquired. Descend to the amber socket beside the entrance.';}
    if(offer.type==='socket'){if(!this.carryingCell)return 'The matching cell is in the luminous ring above. Space rises; C descends; R brakes.';this.solved.add('gravity');this.carryingCell=false;return this._circuitMessage();}
    if(offer.type==='phase'){if(!this.phase.ready)return 'Not aligned yet. The bright band marks the safe interval; try again whenever the sweep overlaps it.';this.solved.add('time');this.recorded.add('resonance');this.resonanceAt=this.time;return this._circuitMessage();}
    if(offer.type==='fold'){if(this.foldCrossed&&!this.solved.has('space')){this.solved.add('space');return this._circuitMessage();}this.foldActive=true;return 'Matched thresholds linked. Walk through the dark frame, then reconnect the terminal on the other side.';}
    if(offer.type==='sample'){this.recorded.add(offer.id);if(offer.id==='resonance')this.resonanceAt=this.time;return this.plan.samples.find(s=>s.id===offer.id).title;}
    if(offer.type==='resonance'){this.resonanceAt=this.time;return 'The sequence returns from somewhere deeper.';}
    if(offer.type==='upfall'){this.flowPaused=!this.flowPaused;return this.flowPaused?'Return flow held. The water stays suspended.':'Return flow restored.';}
  }
  _circuitMessage(){return this.archiveReady?'Repository unlocked. Retrieve the site record at the far end of lower collection.':`Repository circuit restored · ${this.solved.size} / ${this.plan.puzzles.length}`;}
  _startLift(y){this.liftStartY=this.liftY;this.liftElapsed=0;this.liftTarget=y;}
  teleport(){if(!this.exitReady||this.pos[1]>-2)return false;this.pos=[...this.plan.spawn];this.velocity=[0,0,0];this.liftY=this.liftTarget=0;this.riding=false;this.returned=true;return true;}
  step(dt,input={}) {
    // Substeps keep the capsule from crossing walls even after a slow rendered frame.
    dt=Math.min(Math.max(dt,0),.25);
    for(let t=0;t<dt;t+=1/120)this._step(Math.min(1/120,dt-t),input);
    if(this.chamber)this.chambersSeen.add(this.chamber.id);
    if(this.pos[1]<-2){
      for(const t of this.plan.tiles)if(Math.hypot(this.pos[0]-t.x*TILE,this.pos[2]-t.z*TILE)<11)this.discovered.add(key(t.x,t.z));
      if(this.pos[2]<-126)this.reservoirSeen=true;
    }
    if(this.exitReady&&this.pos[1]>-1&&Math.hypot(this.pos[0],this.pos[2])>4)this.returned=true;
  }
  _step(dt,input) {
    this.time+=dt;this.foldCooldown=Math.max(0,this.foldCooldown-dt);if(!this.flowPaused)this.flowTime=this.machinery.time;this.hatchAmount=Math.min(1,this.hatchAmount+(this.hatchOpen?dt*.7:0));
    if(this.moving){this.liftElapsed+=dt;const p=Math.min(1,this.liftElapsed/LIFT_SECONDS),ease=p*p*(3-2*p);this.liftY=this.liftStartY+(this.liftTarget-this.liftStartY)*ease;if(p===1||Math.abs(this.liftY-this.liftTarget)<.001)this.liftY=this.liftTarget;if(this.riding)this.pos[1]=this.liftY;}
    else this.riding=false;
    this.yaw+=(input.turn||0)*dt*1.5;this.pitch=Math.max(-1.4,Math.min(1.4,this.pitch+(input.look||0)*dt));
    if(this.riding)return;
    if(this.zeroG){this._float(dt,input);return;}
    let f=input.forward||0,s=input.strafe||0;const len=Math.hypot(f,s);if(!len)return;f/=Math.max(1,len);s/=Math.max(1,len);
    const speed=input.fast?5.5:3.1,dx=(-Math.sin(this.yaw)*f+Math.cos(this.yaw)*s)*speed*dt,dz=(-Math.cos(this.yaw)*f-Math.sin(this.yaw)*s)*speed*dt;
    const before=[...this.pos];
    for(const [axis,delta] of [[0,dx],[2,dz]]){
      const x=this.pos[0]+(axis===0?delta:0),z=this.pos[2]+(axis===2?delta:0);
      if(this.collision.canStand(x,z,this.state,.42)) {this.pos[axis]+=delta;this.pos[1]=this.collision.floorAt(x,z,this.state);}
    }
    if(this.zeroG)this.velocity=this.pos.map((p,i)=>(p-before[i])/dt);
    this._crossFold(before);
  }
  _crossFold(before) {
    const p=this.plan.puzzles.find(p=>p.id==='space');if(!p||!this.foldActive||this.foldCooldown>0)return;
    for(let i=0;i<2;i++) {
      const a=p.gates[i],b=p.gates[1-i],n=a.normal,t=[-n[1],n[0]];
      const from=(before[0]-a.pos[0])*n[0]+(before[2]-a.pos[2])*n[1],to=(this.pos[0]-a.pos[0])*n[0]+(this.pos[2]-a.pos[2])*n[1];
      const lateral=(this.pos[0]-a.pos[0])*t[0]+(this.pos[2]-a.pos[2])*t[1];
      if(((from<0&&to>=0)||(from>0&&to<=0))&&Math.abs(lateral)<1.1&&Math.abs(this.pos[1]-DECK)<.2){
        const bt=[-b.normal[1],b.normal[0]],direction=Math.sign(to-from);this.pos=[b.pos[0]+b.normal[0]*.8*direction+bt[0]*lateral,DECK,b.pos[2]+b.normal[1]*.8*direction+bt[1]*lateral];
        this.yaw+=Math.atan2(-b.normal[0],-b.normal[1])-Math.atan2(-n[0],-n[1]);
        this.velocity=[0,0,0];this.foldCooldown=.1;this.foldCrossed=true;this.foldCount++;break;
      }
    }
  }
  _float(dt,input) {
    let f=input.forward||0,s=input.strafe||0,u=input.vertical||0;
    const cp=Math.cos(this.pitch),sp=Math.sin(this.pitch),cy=Math.cos(this.yaw),sy=Math.sin(this.yaw);
    const thrust=[-sy*cp*f+cy*s,sp*f+u,-cy*cp*f-sy*s],n=Math.max(1,Math.hypot(...thrust));
    const acceleration=input.fast?5:3.2,cap=input.fast?6.5:4.5;
    for(let i=0;i<3;i++)this.velocity[i]=(this.velocity[i]+thrust[i]/n*acceleration*dt)*Math.exp(-(input.brake?8:.025)*dt);
    const speed=Math.hypot(...this.velocity);if(speed>cap)this.velocity=this.velocity.map(v=>v*cap/speed);
    for(const i of [0,1,2]) {
      const p=[...this.pos];p[i]+=this.velocity[i]*dt;
      if(this.collision.canFloat(...p))this.pos=p;else this.velocity[i]=0;
    }
    if(!this.zeroG){this.pos[1]=DECK;this.velocity=[0,0,0];}
  }
  beacon(){
    if(this.moving||this.beacons.length>=40)return false;
    if(this.beacons.some(p=>Math.hypot(p[0]-this.pos[0],p[1]-this.pos[1],p[2]-this.pos[2])<2))return false;
    this.beacons.push([...this.pos]);return true;
  }
  save(){return {version:2,discovered:[...this.discovered],recorded:[...this.recorded],beacons:this.beacons,reservoirSeen:this.reservoirSeen,returned:this.returned,chambersSeen:[...this.chambersSeen],solved:[...this.solved],carryingCell:this.carryingCell,dataRecovered:this.dataRecovered};}
}
