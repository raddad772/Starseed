import { navigationTarget } from './guidance.js';
export function compassReading(sim){const target=navigationTarget(sim);if(!target)return null;const dx=target.pos[0]-sim.pos[0],dz=target.pos[2]-sim.pos[2],angle=Math.atan2(-dx,-dz)-sim.yaw;return {...target,distance:Math.hypot(dx,dz),vertical:target.pos[1]-sim.pos[1],angle:Math.atan2(Math.sin(angle),Math.cos(angle))};}
export class SurveyCompass {
 constructor(parent){this.canvas=document.createElement('canvas');this.canvas.width=this.canvas.height=240;this.canvas.setAttribute('role','img');this.canvas.style.cssText='position:absolute;right:24px;top:75px;width:116px;height:116px;pointer-events:none;z-index:16';parent.append(this.canvas);}
 update(sim){const r=compassReading(sim),c=this.canvas.getContext('2d');this.canvas.hidden=!r;if(!r)return;this.canvas.setAttribute('aria-label',`${r.label}, ${Math.round(r.distance)} metres${r.vertical>3?', above':r.vertical<-3?', below':''}`);c.clearRect(0,0,240,240);c.save();c.translate(120,120);c.fillStyle='#071c20d9';c.beginPath();c.arc(0,0,110,0,Math.PI*2);c.fill();c.strokeStyle='#8fb8ad';c.lineWidth=2;c.stroke();
 for(let i=0;i<24;i++){const a=i*Math.PI/12-sim.yaw;c.beginPath();c.moveTo(Math.sin(a)*98,-Math.cos(a)*98);c.lineTo(Math.sin(a)*(i%6?92:85),-Math.cos(a)*(i%6?92:85));c.stroke();}
 c.save();c.rotate(-r.angle);c.fillStyle='#e1c088';c.beginPath();c.moveTo(0,-79);c.lineTo(-12,-47);c.lineTo(0,-53);c.lineTo(12,-47);c.closePath();c.fill();c.restore();
 c.fillStyle='#dfede5';c.textAlign='center';c.font='27px monospace';c.fillText(Math.round(r.distance)+' m',0,10);c.font='17px monospace';c.fillStyle='#a7c6bc';c.fillText(r.vertical>3?'↑ '+Math.round(r.vertical)+' m':r.vertical<-3?'↓ '+Math.round(-r.vertical)+' m':'SIGNAL',0,38);c.restore();}
 dispose(){this.canvas.remove();}
}
