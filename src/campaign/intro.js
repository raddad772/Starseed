import * as THREE from 'three';
import { applyCampaignEvent } from './state.js';
import { INTRO_COPY,advanceTutorial,finishIntroduction,IntroConsent } from './tutorial.js';
import { installCampaignJoin,seatExpeditionPlayer } from './newGame.js';

export class FlightIntro {
  constructor(game,{checkpoint=()=>{},openLog=()=>{}}={}){
    this.game=game;this.checkpoint=checkpoint;this.openLog=openLog;this.consent=new IntroConsent();
    installCampaignJoin(game);
    this.hud=document.createElement('aside');this.hud.className='introHud';this.hud.setAttribute('aria-label','Flight tutorial');document.body.append(this.hud);
    this.title=document.createElement('strong');this.text=document.createElement('p');this.metrics=document.createElement('small');this.hud.append(this.title,this.text,this.metrics);
    this.revision=0;this.render();
  }
  get state(){return this.game.campaign.story.intro.tutorial;}
  get active(){return this.state.step!=='ready';}
  get reference(){return this.game.vessels.find(v=>v.campaignId===this.state.referenceId);}
  get members(){return this.game.players.map(p=>p.index);}
  measurements(){
    const p=this.game.players[0],v=p.vessel,ref=this.reference;
    if(!v||v.body!==ref?.body||v.dead||p.deathShown)return {valid:false,targeted:false,range:Infinity,relativeSpeed:Infinity,offset:[0,0,0]};
    const delta=v.pos.clone().sub(ref.pos),relative=v.vel.clone().sub(ref.vel);
    return {valid:true,targeted:p.target===ref.target,range:delta.length(),relativeSpeed:relative.length(),offset:delta.applyQuaternion(ref.quat.clone().invert()).toArray()};
  }
  update(dt){
    const g=this.game;this.consent.sync(this.members);
    this.hud.hidden=!g.launched||g.paused||g.state!=='playing'||!this.active;
    if(!this.active)return;
    if(g.state!=='playing'||g.paused||!g.launched)return;
    const m=this.measurements();
    if(this.active){
      for(const p of g.players)if(p.input.hit('Enter'))this.consent.pending?this.vote(p.index):p.index===0&&this.act();
      if(m.valid&&advanceTutorial(this.state,m,dt)){
        if(this.state.step==='scan')g.campaign=applyCampaignEvent(g.campaign,{id:'tutorial/flight',type:'tutorial.practised',lessonId:'flight'});
        this.changed();
      }
    }
    this.metrics.textContent=m.valid?`${Math.round(m.range)} m to reference · ${m.relativeSpeed.toFixed(1)} m/s relative · Enter: lesson action · Esc → Expedition: tutorial controls`:'Return to your craft with P, or use Retry from Expedition.';
    this.render();
  }
  render(){
    const [title,text]=INTRO_COPY[this.state.step];
    this.title.textContent=this.consent.pending?'Skip introduction?':title;
    this.text.textContent=this.consent.pending?'Each player must agree. Player 2: press A on your controller. B cancels. Joining or leaving clears the request.':text;
  }
  changed(){this.revision++;this.render();this.checkpoint();}
  act(action='next'){
    const g=this.game,t=this.state;
    if(action==='skip'){this.vote(0);return;}
    if(action==='cancel'){this.consent.cancel();this.changed();return;}
    if(action==='retry'){this.retry();return;}
    if(action==='assist'){
      const p=g.players[0];if(!p.flying)throw Error('Return to the pilot seat first (P).');
      p.target=this.reference.target;p.vessel.nav.order({kind:'meet',v:this.reference,name:'Survey reference'});return;
    }
    if(t.step==='welcome')t.step='target';
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
  vote(index){if(this.consent.vote(index,this.members))this.finish('skipped');else this.changed();}
  finish(presentation){
    if(!this.active)return;
    this.game.campaign=finishIntroduction(this.game.campaign,presentation);this.consent.cancel();this.changed();
    this.game.message('First lead recorded · Pause → Expedition → Story Log','nav');
  }
  retry(){
    if(!this.active)return;
    const g=this.game,ref=this.reference;
    if(ref.dead)g.placeInOrbit(ref,g.startBody,Math.max(100000,ref.pos.length()-ref.body.R),.4);
    for(const p of g.players){const v=p.ownShip;if(!v)continue;
      if(v.parent)v.leaveParent();v.nav.cancel(null);v.ftl.state='idle';v.ftl.speed=0;
      v.dead=false;v.hull=1;v.hullTemp=290;v.landed=false;v.rails=false;v.body=ref.body;
      v.pos.copy(ref.pos).add(new THREE.Vector3(p.index*200,0,1200).applyQuaternion(ref.quat));v.vel.copy(ref.vel);v.quat.copy(ref.quat);v.angVel.set(0,0,0);
      v.assist=1;v.targetFrame='none';v.targetVel.copy(ref.vel);seatExpeditionPlayer(g,p);
    }
    if(['target','translate','brake','scan'].includes(this.state.step)){this.state.step='target';this.state.origin=null;this.state.scanning=false;this.state.scanSeconds=0;}
    this.changed();
  }
  dispose(){this.hud.remove();}
}
