import * as THREE from 'three';

// Clip in camera space before projecting. Even a gate crossing the near plane
// stays a bounded line segment; visibility never depends on the previous frame.
export function projectGuideEdge(a,b,{position,quaternion,fov,aspect,width,height}){
  const inverse=quaternion.clone().invert(),p=a.clone().sub(position).applyQuaternion(inverse),q=b.clone().sub(position).applyQuaternion(inverse),near=-.3;
  if(p.z>near&&q.z>near)return null;
  if(p.z>near)p.lerp(q,(near-p.z)/(q.z-p.z));
  if(q.z>near)q.lerp(p,(near-q.z)/(p.z-q.z));
  const scale=Math.tan(fov*Math.PI/360),screen=v=>[width/2+v.x/-v.z/scale/aspect*width/2,height/2-v.y/-v.z/scale*height/2];
  let [x0,y0]=screen(p),[x1,y1]=screen(q),lo=0,hi=1;const dx=x1-x0,dy=y1-y0;
  for(const [p,d] of [[-dx,x0],[dx,width-x0],[-dy,y0],[dy,height-y0]]){
    if(Math.abs(p)<1e-12){if(d<0)return null;continue;}const t=d/p;
    if(p<0)lo=Math.max(lo,t);else hi=Math.min(hi,t);if(lo>hi)return null;
  }
  return [[x0+dx*lo,y0+dy*lo],[x0+dx*hi,y0+dy*hi]];
}

export function drawLandingGuide(hud,state){
  if(!state)return;
  const {ctx,w,h,game:g}=hud,cx=w/2,cy=h/2;
  const cyan='#65dfec',amber='#ffc565',green='#8cf1b1',ink='#e4f0f4';
  const color=state.caution?.length?amber:state.landed?green:cyan;
  ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='11px "B612 Mono", monospace';
  if(state.waiting){ctx.fillStyle=cyan;ctx.fillText(state.message,cx,h*.72);ctx.restore();return;}
  const camera={position:g.camPos,quaternion:g.camQuat,fov:g.engine.camera.fov,aspect:g.engine.camera.aspect,width:w,height:h};
  const gates=state.landed?[]:state.gates;
  for(let i=0;i<gates.length;i++){
    const gate=gates[i];ctx.strokeStyle=color;ctx.globalAlpha=.24+.5*(i+1)/gates.length;ctx.lineWidth=i===gates.length-1?2:1.2;
    ctx.beginPath();for(let j=0;j<4;j++){
      const edge=projectGuideEdge(gate.corners[j],gate.corners[(j+1)%4],camera);if(!edge)continue;
      ctx.moveTo(...edge[0]);ctx.lineTo(...edge[1]);
    }ctx.stroke();
  }
  ctx.globalAlpha=1;
  // A site marker and off-screen cue remain useful in the final hover and
  // landing camera, when all forward approach gates are behind the pilot.
  const point=state.site.clone().sub(g.camPos).applyQuaternion(g.camQuat.clone().invert());
  const projected=hud.project(state.site,{});let x=projected.x,y=projected.y;
  ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=1.5;
  if(projected.behind||x<55||x>w-55||y<75||y>h-110){
    let dx=point.x,dy=-point.y;if(Math.hypot(dx,dy)<1e-5){dx=0;dy=1;}
    const a=Math.atan2(dy,dx),k=Math.min((w/2-55)/Math.max(1e-6,Math.abs(Math.cos(a))),(h/2-110)/Math.max(1e-6,Math.abs(Math.sin(a))));
    x=cx+Math.cos(a)*k;y=cy+Math.sin(a)*k;
    ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.beginPath();ctx.moveTo(9,0);ctx.lineTo(-7,-6);ctx.lineTo(-7,6);ctx.closePath();ctx.stroke();ctx.restore();
  }else{ctx.beginPath();ctx.arc(x,y,10,0,Math.PI*2);ctx.moveTo(x-15,y);ctx.lineTo(x+15,y);ctx.moveTo(x,y-15);ctx.lineTo(x,y+15);ctx.stroke();}
  ctx.fillText(state.range>=1000?(state.range/1000).toFixed(1)+' km':Math.round(state.range)+' m',x,y+24);
  const panelY=Math.max(130,h*.76),panelW=Math.min(414,w-32);
  ctx.fillStyle='#091b24dd';ctx.fillRect(cx-panelW/2,panelY-17,panelW,105);
  ctx.fillStyle=color;ctx.fillText(state.message+' · '+state.label.slice(0,26),cx,panelY);
  const velocity=n=>(n>0?'+':'')+n.toFixed(1);
  ctx.fillStyle=ink;ctx.fillText(`SPEED ${state.speed.toFixed(0)} → ${state.targetSpeed.toFixed(0)} m/s   V/S ${velocity(state.vertical)} → ${velocity(state.targetVertical)}`,cx,panelY+23);
  ctx.fillStyle=cyan;
  ctx.fillText(state.final?`DRIFT ${state.drift.toFixed(1)} m/s · ${state.range>12?'CENTER OVER SITE':'CHECK GROUND · DESCEND GENTLY'}`:
    `${Math.abs(state.cross)<5?'ON CENTER':Math.abs(state.cross).toFixed(0)+' m '+(state.cross>0?'RIGHT':'LEFT')} · ${Math.abs(state.altitudeError)<5?'ON GLIDE':Math.abs(state.altitudeError).toFixed(0)+' m '+(state.altitudeError>0?'HIGH':'LOW')}`,cx,panelY+44);
  ctx.fillStyle=state.caution.length?amber:ink;
  ctx.fillText(state.caution.slice(0,2).join(' · ')||(state.final?`GEAR DOWN · ${hud.keyName('KeyV','V')} CYCLES CAMERA`:'KEEP THE BOXES CENTERED · MATCH SPEED'),cx,panelY+67);
  ctx.restore();
}
