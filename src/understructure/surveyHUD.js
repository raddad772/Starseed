import { TILE,key } from './layout.js';
import { THEME_NAMES } from './anomalies.js';

// Per-player DOM, no global event handlers or additional animation loop.
export class SurveyHUD {
  constructor(player,session) {
    this.player=player;this.session=session;this.panel=null;this.notice='';this.noticeUntil=0;
    this.el=document.createElement('section');this.el.className='sectorHUD';
    this.el.style.cssText='position:absolute;pointer-events:none;color:#dce9dc;font:13px/1.6 monospace;box-sizing:border-box;padding:24px;text-shadow:0 1px 3px #000;z-index:15;overflow:hidden';
    this.status=document.createElement('div');this.status.style.cssText='max-width:650px;background:#091b20b8;padding:14px 18px;border-left:2px solid #8acabb';
    this.actions=document.createElement('div');this.actions.style.cssText='position:absolute;bottom:24px;left:24px;right:24px;white-space:pre-line;background:#091b20b8;padding:12px 18px';
    this.sheet=document.createElement('div');this.sheet.style.cssText='position:absolute;inset:120px 24px 135px;overflow:auto;background:#0b2026f0;padding:20px;pointer-events:auto';this.sheet.hidden=true;
    this.el.append(this.status,this.sheet,this.actions);document.getElementById('hud').append(this.el);
  }
  toast(text){if(text){this.notice=text;this.noticeUntil=performance.now()+5000;}}
  toggle(panel){this.panel=this.panel===panel?null:panel;this.sheet.hidden=!this.panel;this.sheet.replaceChildren();if(this.panel==='map'){this.map=document.createElement('canvas');this.map.width=640;this.map.height=600;this.map.style.cssText='max-width:100%;max-height:100%;object-fit:contain';this.sheet.append(this.map);}if(this.panel==='notes')this.notes();}
  notes(){const {sim,plan}=this.session;const head=document.createElement('p');head.textContent=plan.themes.map(t=>THEME_NAMES[t]).join(' + ')+' · '+sim.recorded.size+' observations';this.sheet.append(head);for(const sample of plan.samples.filter(s=>sim.recorded.has(s.id))){const h=document.createElement('h3'),p=document.createElement('p');h.textContent=sample.title;p.textContent=sample.text;this.sheet.append(h,p);}}
  drawMap(){const {sim,plan}=this.session,c=this.map,ctx=c.getContext('2d'),scale=1.75,ox=320,oz=45;ctx.fillStyle='#0c1718';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='#8bb1a2';for(const t of plan.tiles)if(sim.discovered.has(key(t.x,t.z)))ctx.fillRect(ox+(t.x*TILE-2)*scale,oz+(-t.z*TILE-2)*scale,TILE*scale-.5,TILE*scale-.5);const paths=sim.reservoirSeen?[...plan.walkways]:[];for(const room of plan.chambers)if(sim.chambersSeen.has(room.id))paths.push(...room.walkways);for(const [a,b,c,d] of paths)ctx.fillRect(ox+a*scale,oz-d*scale,(b-a)*scale,(d-c)*scale);ctx.fillStyle='#e8b777';for(const p of sim.beacons){ctx.beginPath();ctx.arc(ox+p[0]*scale,oz-p[2]*scale,3,0,Math.PI*2);ctx.fill();}ctx.font='12px monospace';ctx.fillText('SURFACE ACCESS',ox+12,oz);ctx.save();ctx.translate(ox+sim.pos[0]*scale,oz-sim.pos[2]*scale);ctx.rotate(-sim.yaw);ctx.fillStyle='#fff8da';ctx.beginPath();ctx.moveTo(0,8);ctx.lineTo(-5,-5);ctx.lineTo(5,-5);ctx.closePath();ctx.fill();ctx.restore();}
  update(){
    const {sim,plan}=this.session,rc=this.player.view.rect;Object.assign(this.el.style,{left:rc.x+'px',top:rc.y+'px',width:rc.w+'px',height:rc.h+'px'});
    const hints={gravity:sim.carryingCell?'Connect the cell at the amber socket beside the Null Well':'East branch → Null Well · retrieve the floating cell, 12 m up',time:'Southwest branch → synchronizer · interact inside the lit interval',space:'Southwest branch → return frame · link it, cross, reconnect'};
    const next=plan.puzzles.find(p=>!sim.solved.has(p.id));
    const objective=sim.dataRecovered?'Site record secured · return or keep exploring':sim.pos[1]>-2?'Open the hatch, step onto the platform and descend':sim.moving?'Express transit · service level 08':next?hints[next.id]:'Repository open · retrieve the record at the far end of lower collection';
    this.status.textContent=`${sim.zone} · ${Math.abs(sim.pos[1]).toFixed(1)} m depth\n${objective}\nCircuits ${sim.solved.size}/${plan.puzzles.length} · observations ${sim.recorded.size}/${plan.samples.length}`;this.status.style.whiteSpace='pre-line';
    const pad=this.player.input.usingPad,use=pad?'X':'E',offer=sim.offer();
    const controls=pad?'Sticks move/look · X use · LT light · B beacon · View map · D-pad right notes · RB return': 'WASD move · E use · F light · B beacon · M map · J notes · T return';
    const float=sim.zeroG?(pad?'\nZero gravity · A rise · Y descend · R3 brake':'\nZero gravity · Space rise · C descend · R brake'):'';
    const phase=offer?.type==='phase'?` · sweep ${Math.round(sim.phase.value*100)}% · ${sim.phase.ready?'ALIGNED':'wait for alignment'}`:'';
    this.actions.textContent=(this.panel?`${this.panel.toUpperCase()} · press ${this.panel==='map'?(pad?'View':'M'):(pad?'D-pad right':'J')} to close`:offer?`${use} · ${offer.text}${phase}`:objective)+'\n'+(performance.now()<this.noticeUntil?this.notice+'\n':'')+controls+float;
    if(this.panel==='map')this.drawMap();
  }
  dispose(){this.el.remove();}
}
