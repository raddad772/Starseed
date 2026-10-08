import { mysteryEntries } from './recovery.js';
import { SurveyMap } from './surveyMap.js';
import { surveyObjective,fieldStatus,recoveryStatus,mysteryStatus,scanMessage } from './guidance.js';
import { THEME_NAMES } from './anomalies.js';

// Per-player DOM, no global event handlers or additional animation loop.
export class SurveyHUD {
  constructor(player,session) {
    this.player=player;this.session=session;this.panel=null;this.notice='';this.noticeUntil=0;
    this.el=document.createElement('section');this.el.className='sectorHUD';
    this.el.style.cssText='position:absolute;pointer-events:none;color:#dce9dc;font:13px/1.6 monospace;box-sizing:border-box;padding:24px;text-shadow:0 1px 3px #000;z-index:15;overflow:hidden';
    this.status=document.createElement('div');this.status.style.cssText='max-width:650px;background:#091b20b8;padding:14px 18px;border-left:2px solid #8acabb';
    this.actions=document.createElement('div');this.actions.style.cssText='position:absolute;bottom:24px;left:24px;right:24px;white-space:pre-line;background:#091b20b8;padding:12px 18px';
    this.sheet=document.createElement('div');this.sheet.style.cssText='position:absolute;inset:155px 24px 135px;overflow:auto;background:#0b2026f0;padding:20px;pointer-events:auto';this.sheet.hidden=true;
    this.el.append(this.status,this.sheet,this.actions);document.getElementById('hud').append(this.el);
    this.soundButton=document.createElement('button');this.soundButton.style.cssText='position:absolute;right:24px;top:24px;pointer-events:auto';
    const updateSound=()=>{this.soundButton.textContent=session.sound.enabled?'Sound on':'Sound off';this.soundButton.setAttribute('aria-pressed',String(session.sound.enabled));};
    this.soundButton.onclick=()=>{session.sound.setEnabled(!session.sound.enabled);updateSound();};updateSound();this.el.append(this.soundButton);
  }
  toast(text){if(text){this.notice=text;this.noticeUntil=performance.now()+5000;}}
  toggle(panel){this.mapView?.dispose();this.mapView=null;this.panel=this.panel===panel?null:panel;if(this.panel)document.exitPointerLock?.();this.sheet.hidden=!this.panel;this.sheet.replaceChildren();if(this.panel==='map'){this.map=document.createElement('canvas');this.map.width=640;this.map.height=600;this.map.style.cssText='max-width:100%;max-height:100%;object-fit:contain';this.sheet.append(this.map);this.mapView=new SurveyMap(this.map);this.map.focus();}if(this.panel==='notes')this.notes();}
  notes(){const {sim,plan}=this.session;const head=document.createElement('p');head.textContent=plan.themes.map(t=>THEME_NAMES[t]).join(' + ')+' · '+sim.recorded.size+' observations · '+recoveryStatus(sim)+' · '+mysteryStatus(sim);this.sheet.append(head);for(const entry of mysteryEntries(sim.campaignTotal)){const h=document.createElement('h3'),p=document.createElement('p');h.textContent=entry.title;p.textContent=entry.text;this.sheet.append(h,p);}for(const sample of plan.samples.filter(s=>sim.recorded.has(s.id))){const h=document.createElement('h3'),p=document.createElement('p');h.textContent=sample.title;p.textContent=sample.text;this.sheet.append(h,p);}}
  drawMap(){this.mapView.draw(this.session.sim);}
  update(){
    const {sim,plan}=this.session,rc=this.player.view.rect;Object.assign(this.el.style,{left:rc.x+'px',top:rc.y+'px',width:rc.w+'px',height:rc.h+'px'});
    const objective=surveyObjective(sim);
    this.status.textContent=`${sim.zone} · ${Math.abs(sim.pos[1]).toFixed(1)} m depth\n${fieldStatus(sim)}\n${objective}\n${recoveryStatus(sim)}`;this.status.style.whiteSpace='pre-line';
    const pad=this.player.input.usingPad,use=pad?'X':'E',offer=sim.offer();
    const controls=pad?'Sticks move/look · X use · LT light · B beacon · View map · D-pad right notes · RB return': 'WASD move · E use · F light · B beacon · M map · J notes · T return';
    const float=sim.zeroG?(pad?'\nChamber tether · A rise · Y descend · R3 brake':'\nChamber tether · Space rise · C descend · R brake'):'';
    const phase=offer?.type==='phase'?` · sweep ${Math.round(sim.phase.value*100)}% · ${sim.phase.ready?'ALIGNED':'wait for alignment'}`:'';
    this.actions.textContent=(this.panel?`${this.panel.toUpperCase()} · press ${this.panel==='map'?(pad?'View':'M'):(pad?'D-pad right':'J')} to close`:offer?`${use} · ${offer.text}${phase}`:objective)+'\n'+(scanMessage(sim)?scanMessage(sim)+'\n':performance.now()<this.noticeUntil?this.notice+'\n':'')+controls+float;
    if(this.panel==='map')this.drawMap();
  }
  dispose(){this.mapView?.dispose();this.el.remove();}
}
