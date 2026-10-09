import * as THREE from 'three';
import { applyCampaignEvent } from './state.js';
import { INTRO_COPY,advanceTutorial,finishIntroduction } from './tutorial.js';
import { installCampaignJoin,seatExpeditionPlayer } from './newGame.js';
import { Dialogue } from './dialogue.js';
import { LINES,WELCOME_NUDGE,PROLOGUE } from './lines.js';

// the opening shot: held level on the mirror's horizon under the central black hole (it above, its
// reflection below) while your thoughts run, then turned back to your craft as she calls
const TURN_SECONDS = 2.5;

export class FlightIntro {
  constructor(game,{checkpoint=()=>{},openLog=()=>{}}={}){
    this.game=game;this.checkpoint=checkpoint;this.openLog=openLog;
    installCampaignJoin(game);
    this.hud=document.createElement('aside');this.hud.className='introHud';this.hud.setAttribute('aria-label','Flight tutorial');document.body.append(this.hud);
    this.title=document.createElement('strong');this.text=document.createElement('p');this.metrics=document.createElement('small');this.hud.append(this.title,this.text,this.metrics);
    this.revision=0;this.render();
    this.hud.hidden=!game.launched;
    // (what's said: her line on the spacewalk, and a nudge if you're still outside; not saved)
    this.dialogue=new Dialogue(document);this.outside=0;this.nudges=0;this.welcomed=false;
  }
  get state(){return this.game.campaign.story.intro.tutorial;}
  get active(){return this.state.step!=='ready';}
  get reference(){return this.game.vessels.find(v=>v.campaignId===this.state.referenceId);}
  measurements(){
    const p=this.game.players[0],v=p.vessel,ref=this.reference;
    if(!p.aboard||!v||v.body!==ref?.body||v.dead||p.deathShown)return {valid:false,targeted:false,range:Infinity,relativeSpeed:Infinity,offset:[0,0,0]};
    const delta=v.pos.clone().sub(ref.pos),relative=v.vel.clone().sub(ref.vel);
    return {valid:true,targeted:p.target===ref.target,range:delta.length(),relativeSpeed:relative.length(),offset:delta.applyQuaternion(ref.quat.clone().invert()).toArray()};
  }
  update(dt){
    const g=this.game,live=g.launched&&!g.paused&&g.state==='playing';
    // (on the spacewalk the scene and her voice say it; the lesson card waits until you're aboard)
    this.hud.hidden=!live||!this.active||this.state.step==='welcome';
    this.dialogue.hidden=!live;
    if(live)this.dialogue.update(dt);
    if(!this.active)return;
    if(!live)return;
    if(this.state.step==='welcome'&&this.prologueStep(dt))return;
    if(this.state.step==='welcome'){
      if(!this.welcomed){this.welcomed=true;this.dialogue.say(LINES.welcome);}
      this.outside+=dt;
      if(this.nudges<WELCOME_NUDGE.max&&this.outside>=WELCOME_NUDGE.first+this.nudges*WELCOME_NUDGE.every){this.nudges++;this.dialogue.say(LINES.hurry);}
    }
    const m=this.measurements();
    if(this.state.step==='welcome'&&g.players[0].flying){this.state.step='target';this.changed();}
    if(this.active){
      if(g.players[0].input.hit('Enter'))this.act();
      if(m.valid&&advanceTutorial(this.state,m,dt)){
        if(this.state.step==='scan')g.campaign=applyCampaignEvent(g.campaign,{id:'tutorial/flight',type:'tutorial.practised',lessonId:'flight'});
        this.changed();
      }
    }
    this.metrics.textContent=m.valid?`${Math.round(m.range)} m to reference · ${m.relativeSpeed.toFixed(1)} m/s relative · Enter: lesson action · Esc → Expedition: tutorial controls`:'Return to your craft with P, or use Retry from Expedition.';
    this.render();
  }
  // the prologue (runtime only, not saved; a reload at this step plays it again): true while it
  // holds the scene
  prologueStep(dt){
    const g=this.game,p=g.players[0],pr=this.prologue||(this.prologue={phase:'start',t:0});
    if(pr.phase==='done')return false;
    if(pr.phase==='start'){
      const shell=g.engine.mirrorShell,hole=g.engine.central;
      if(!shell||!hole||p.mode!=='eva'){pr.phase='done';return false;}
      const n=shell.normal,d=hole.dir.clone().normalize(),h=d.clone().addScaledVector(n,-d.dot(n));
      if(h.lengthSq()<1e-6){pr.phase='done';return false;}
      h.normalize();
      pr.shot=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(new THREE.Vector3(),h,n));
      pr.back=p.evaQuat.clone();
      p.heldView=pr.shot.clone();document.body.classList.add('cinematic');
      for(const line of PROLOGUE)this.dialogue.say(line);
      pr.phase='voice';return true;
    }
    // (Enter: on to her line)
    const skip=p.input?.hit('Enter');
    if(pr.phase==='voice'&&(this.dialogue.idle||skip)){
      if(skip)this.dialogue.clear();
      pr.phase='turn';pr.t=0;this.welcomed=true;this.dialogue.say(LINES.welcome);
    }
    if(pr.phase==='turn'){
      pr.t+=dt;const k=Math.min(1,pr.t/TURN_SECONDS),e=k*k*(3-2*k);
      p.heldView.copy(pr.shot).slerp(pr.back,e);
      if(k>=1){p.heldView=null;p.evaQuat.copy(pr.back);document.body.classList.remove('cinematic');pr.phase='done';}
    }
    return true;
  }
  render(){
    const [title,text]=INTRO_COPY[this.state.step];
    this.title.textContent=title;
    this.text.textContent=text;
  }
  changed(){this.revision++;this.render();this.checkpoint();}
  act(action='next'){
    const g=this.game,t=this.state;
    if(action==='skip'){this.finish('skipped');return;}
    if(action==='retry'){this.retry();return;}
    if(action==='assist'){
      const p=g.players[0];if(!p.flying)throw Error('Return to the pilot seat first (P).');
      p.target=this.reference.target;p.vessel.nav.order({kind:'meet',v:this.reference,name:'Survey reference'});return;
    }
    if(t.step==='welcome'){
      g.players[0].recallSeat();
      if(g.players[0].flying)t.step='target';
    }
    else if(t.step==='target')g.players[0].target=this.reference.target;
    else if(['translate','brake'].includes(t.step)){this.act('assist');return;}
    else if(t.step==='scan'){t.scanning=true;g.players[0].target=this.reference.target;}
    else if(t.step==='anomaly'){t.step='crossing';t.elapsed=0;}
    else if(t.step==='closed')t.step='analysis';
    else if(t.step==='ready'){this.openLog();return;}
    this.changed();
  }
  probe(index){
    if(this.state.step!=='analysis'||![0,1,2].includes(index))return;
    if(!this.state.probes.includes(index))this.state.probes.push(index);
    if(this.state.probes.length===3)this.finish('played');else this.changed();
  }
  finish(presentation){
    if(!this.active)return;
    this.game.campaign=finishIntroduction(this.game.campaign,presentation);this.changed();
    this.game.message('First lead recorded · multiplayer is now available · Pause → Expedition → Story Log','nav');
  }
  retry(){
    if(!this.active)return;
    const g=this.game,ref=this.reference;
    if(ref.dead)g.placeInOrbit(ref,ref.body,Math.max(100000,ref.pos.length()-ref.body.R),.4);
    for(const p of g.players){const v=p.ownShip;if(!v)continue;
      if(v.parent)v.leaveParent();v.nav.cancel(null);v.ftl.state='idle';v.ftl.speed=0;
      v.dead=false;v.hull=1;v.hullTemp=290;v.landed=false;v.rails=false;v.body=ref.body;
      v.pos.copy(ref.pos).add(new THREE.Vector3(p.index*200,0,1200).applyQuaternion(ref.quat));v.vel.copy(ref.vel);v.quat.copy(ref.quat);v.angVel.set(0,0,0);
      v.assist=1;v.targetFrame='none';v.targetVel.copy(ref.vel);seatExpeditionPlayer(g,p);
    }
    if(['target','translate','brake','scan'].includes(this.state.step)){this.state.step='target';this.state.origin=null;this.state.scanning=false;this.state.scanSeconds=0;}
    this.changed();
  }
  dispose(){this.hud.remove();this.dialogue.dispose();document.body.classList.remove('cinematic');if(this.game.players[0])this.game.players[0].heldView=null;}
}
