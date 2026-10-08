import { DECK, TILE, key } from './layout.js';

// Discovery-limited three-dimensional survey data, shared by both game hosts.
// The canvas projection avoids a second GPU renderer and never reveals unseen rooms.
export function surveyMapData(plan,sim,layer='all') {
  const boxes=[],links=[],markers=[];
  const add=(id,name,bounds,color,kind='room')=>boxes.push({id,name,bounds,color,kind});
  if(layer==='all'||layer==='surface'){
    add('surface','Surface hatch',[-2,2,-2,2,-.4,0],'#bad7cf','surface');
    if(sim.discovered.size||sim.pos[1]<-2){add('shaft','Express lift · 240 m',[-1,1,-1,1,DECK,0],'#e8b777','shaft');links.push({a:[0,0,0],b:[0,DECK,0],kind:'lift'});}
  }
  if(layer!=='surface'){
    if(layer!=='raised')for(const t of plan.tiles)if(sim.discovered.has(key(t.x,t.z)))add('tile:'+key(t.x,t.z),t.region.startsWith('room:')?plan.rooms[Number(t.region.split(':')[1])].kind:'Service conduit',[t.x*TILE-1.9,t.x*TILE+1.9,t.z*TILE-1.9,t.z*TILE+1.9,DECK-.4,DECK+3.8],'#678fa1','tile');
    if(sim.reservoirSeen&&layer!=='raised'){
      add('reservoir',plan.generator.name+' · record repository',[-64,64,-286,-122,plan.reservoir.bottom,plan.reservoir.ceiling],'#3a8395','shell');
      for(const p of plan.walkways)add('catwalk','Collection catwalk',[...p,DECK-.5,DECK],'#75a3ac','path');
    }
    if(sim.reservoirSeen&&layer!=='surface')for(const r of plan.routes){if(layer==='service'&&Math.min(r.a[1],r.b[1])>DECK)continue;const [a,b]=[r.a,r.b];add(r.id,r.covered?'Collection service gallery':'Collection upper crossing',[Math.min(a[0],b[0])-2,Math.max(a[0],b[0])+2,Math.min(a[2],b[2])-2,Math.max(a[2],b[2])+2,Math.min(a[1],b[1])-.2,Math.max(a[1],b[1])],r.covered?'#789080':'#d8c799','path');links.push({a,b,kind:'gallery'});}
    if(sim.reservoirSeen&&layer!=='service')for(const c of plan.generator.cores)add('generator-'+c.id,`Generator ${c.id+1} · ${c.active?'intermittent output':'dormant'}`,[c.x-c.radius,c.x+c.radius,c.z-c.radius,c.z+c.radius,c.base,c.top],c.active?'#e5b46e':'#647b80','shell');
    if(sim.lookoutSeen&&layer!=='service'){
      const h=plan.generator,r=h.spur,[a,b,c,d,y]=h.lookout;
      add(r.id,'Fault inspection bridge',[-2,2,r.b[2],r.a[2],y-.4,y],'#d8c799','path');
      add('fault-lookout','Fault lookout · distant extent unsurveyed',[a,b,c,d,y-.4,y],'#d8c799','path');links.push({a:r.a,b:r.b,kind:'gallery'});
    }
    if(layer!=='raised')for(const region of plan.oblique.regions)if(sim.sectorsSeen.has(region.id)){
      const polygon=region.polygon,xs=polygon.map(p=>p[0]),zs=polygon.map(p=>p[1]);
      boxes.push({id:region.id,name:region.name,polygon,bounds:[Math.min(...xs),Math.max(...xs),Math.min(...zs),Math.max(...zs),DECK-(region.inner?18:0),DECK+region.height],color:'#739da2',kind:'shell'});
      for(const f of plan.oblique.floors.filter(f=>f.region===region.id)){const xs=f.polygon.map(p=>p[0]),zs=f.polygon.map(p=>p[1]);boxes.push({id:region.id+'-deck',name:region.name,polygon:f.polygon,bounds:[Math.min(...xs),Math.max(...xs),Math.min(...zs),Math.max(...zs),DECK-.3,DECK],color:f.bridge?'#d8c799':'#75a3ac',kind:'path'});}
    }
    for(const room of plan.chambers)if(sim.chambersSeen.has(room.id)){
      const color=sim.chamber?.id===room.id?'#ffd391':room.color;
      add(room.id,room.name+` · ${(room.kind==='zero-g'?0:room.gravity??1).toFixed(2)} G`,[...room.bounds,DECK,room.ceiling],color,'shell');
      for(const p of room.walkways)if(layer!=='raised')add(room.id,room.name,[...p,DECK-.4,DECK],color,'path');
      for(const p of room.platforms||[])if(layer==='all'||(layer==='service'?p[4]===DECK:p[4]>DECK))add(room.id,room.name,[...p.slice(0,4),p[4]-.6,p[4]],color,'path');
      for(const [i,p] of (room.bridges||[]).entries())if(layer!=='raised')add(room.id,`Bridge ${i+1} · ${sim.bridgeStage>i?'solid':'unpowered'}`,[...p.slice(0,4),p[4]-.15,p[4]],sim.bridgeStage>i?'#9ffff2':'#37616c',sim.bridgeStage>i?'bridge':'ghost');
      if(room.id==='low')for(let i=1;i<room.platforms.length;i++){const a=room.platforms[i-1],b=room.platforms[i];links.push({a:[(a[0]+a[1])/2,a[4],-100],b:[(b[0]+b[1])/2,b[4],-100],kind:'jump'});}
      if(room.id==='null'&&room.kind==='zero-g')links.push({a:[96,DECK,-52],b:[96,DECK+12,-52],kind:'tether'});
    }
    for(const p of plan.puzzles)if(sim.chambersSeen.has(p.room)){
      const pos=p.socket||p.pos||p.controls?.at(-1)||p.plates?.[0]||p.gates?.[0].pos;
      // A socket in another chamber is revealed only when that chamber is surveyed.
      if(p.id==='gravity'&&!sim.chambersSeen.has('low')){markers.push({pos:p.source,label:'Return cell',kind:'objective'});continue;}
      markers.push({pos,label:p.name+(sim.solved.has(p.id)?' · restored':''),kind:sim.solved.has(p.id)?'complete':'objective'});
    }
    if(sim.reservoirSeen)markers.push({pos:plan.finalCache.pos,label:sim.dataRecovered?'Central record recovered':'Central backup · +90%',kind:sim.dataRecovered?'complete':'objective'});
    if(sim.foldActive){const p=plan.puzzles.find(p=>p.id==='space');if(p&&p.gates.every(g=>plan.chambers.some(c=>sim.chambersSeen.has(c.id)&&g.pos[0]>=c.bounds[0]&&g.pos[0]<=c.bounds[1]&&g.pos[2]>=c.bounds[2]&&g.pos[2]<=c.bounds[3])))links.push({a:p.gates[0].pos,b:p.gates[1].pos,kind:'fold'});}
  }
  if(layer!=='surface')for(const f of plan.fragments)if(sim.fragmentsSeen.has(f.id))markers.push({pos:f.pos,label:`${f.title} · ${f.value}%${sim.fragments.has(f.id)?' recovered':''}`,kind:sim.fragments.has(f.id)?'complete':'objective'});
  for(const p of sim.beacons)markers.push({pos:p,label:'Return beacon',kind:'beacon'});
  return {boxes,links,markers};
}
export function mapProject(point,{azimuth,elevation,center,scale,width,height,pan=[0,0]}){
  const x=point[0]-center[0],y=point[1]-center[1],z=point[2]-center[2],u=x*Math.cos(azimuth)-z*Math.sin(azimuth),depth=x*Math.sin(azimuth)+z*Math.cos(azimuth);
  return [width/2+u*scale+pan[0],height/2+(-y*Math.cos(elevation)+depth*Math.sin(elevation))*scale+pan[1],depth*Math.cos(elevation)+y*Math.sin(elevation)];
}

export class SurveyMap {
  constructor(canvas){
    this.canvas=canvas;this.layer='all';this.azimuth=-.45;this.elevation=.75;this.zoom=1;this.pan=[0,0];this.selected=null;this.listeners=[];
    canvas.tabIndex=0;canvas.setAttribute('aria-label','Three-dimensional survey map. Drag to rotate, wheel to zoom.');canvas.style.touchAction='none';
    this.toolbar=document.createElement('div');this.toolbar.style.cssText='display:flex;flex-wrap:wrap;gap:8px;align-items:center;font:11px monospace;margin:8px 0;color:#b6d6da';
    const title=document.createElement('span');title.textContent='3D SURVEY';title.style.marginRight='auto';
    this.select=document.createElement('select');this.select.setAttribute('aria-label','Map level');for(const [value,text] of [['all','All levels'],['service','Service deck'],['raised','Raised paths'],['surface','Surface & shaft']])this.select.add(new Option(text,value));
    const reset=document.createElement('button');reset.textContent='Fit';reset.setAttribute('aria-label','Fit survey map');
    const top=document.createElement('button');top.textContent='Top';top.setAttribute('aria-label','Top view');
    for(const el of [this.select,reset,top])el.style.cssText='font:11px monospace;color:#d4e9df;background:#18323a;border:1px solid #54717c;padding:6px;cursor:pointer';
    this.toolbar.append(title,this.select,reset,top);canvas.before(this.toolbar);
    this.info=document.createElement('div');this.info.style.cssText='font:11px/1.7 monospace;color:#b1c7c9;margin:8px 0';canvas.after(this.info);
    this.on(this.select,'change',()=>{this.layer=this.select.value;this.zoom=1;this.pan=[0,0];this.redraw();});
    this.on(reset,'click',()=>{this.zoom=1;this.pan=[0,0];this.selected=null;this.redraw();});
    this.on(top,'click',()=>{this.elevation=Math.PI/2;this.redraw();});
    this.on(canvas,'wheel',e=>{e.preventDefault();this.zoom=Math.max(.4,Math.min(7,this.zoom*Math.exp(-e.deltaY*.001)));this.redraw();},{passive:false});
    this.on(canvas,'pointerdown',e=>{canvas.focus();canvas.setPointerCapture(e.pointerId);this.drag={x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,pan:e.shiftKey||e.button===2};});
    this.on(canvas,'pointermove',e=>{if(!this.drag)return;const dx=e.clientX-this.drag.x,dy=e.clientY-this.drag.y;if(this.drag.pan){this.pan[0]+=dx;this.pan[1]+=dy;}else{this.azimuth+=dx*.008;this.elevation=Math.max(.12,Math.min(Math.PI/2,this.elevation+dy*.007));}this.drag.x=e.clientX;this.drag.y=e.clientY;this.redraw();});
    this.on(canvas,'pointerup',e=>{if(this.drag&&Math.hypot(e.clientX-this.drag.startX,e.clientY-this.drag.startY)<5){const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*canvas.width/r.width,y=(e.clientY-r.top)*canvas.height/r.height;this.selected=this.hit?.filter(h=>Math.hypot(h.x-x,h.y-y)<28).sort((a,b)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y))[0]?.name||null;}this.drag=null;this.redraw();});
    this.on(canvas,'pointercancel',()=>this.drag=null);this.on(canvas,'contextmenu',e=>e.preventDefault());
    this.on(canvas,'keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','=','0'].includes(e.key))return;e.preventDefault();e.stopPropagation();if(e.key==='ArrowLeft')this.azimuth-=.12;if(e.key==='ArrowRight')this.azimuth+=.12;if(e.key==='ArrowUp')this.elevation=Math.min(Math.PI/2,this.elevation+.1);if(e.key==='ArrowDown')this.elevation=Math.max(.12,this.elevation-.1);if(['+','='].includes(e.key))this.zoom=Math.min(7,this.zoom*1.15);if(e.key==='-')this.zoom=Math.max(.4,this.zoom/1.15);if(e.key==='0'){this.zoom=1;this.pan=[0,0];}this.redraw();});
  }
  on(el,event,fn,options){el.addEventListener(event,fn,options);this.listeners.push(()=>el.removeEventListener(event,fn,options));}
  redraw(){if(this.sim)this.draw(this.sim);}
  input(dt,input,mouse){this.azimuth+=input.axis('ArrowLeft','ArrowRight')*dt;this.elevation=Math.max(.12,Math.min(Math.PI/2,this.elevation+input.axis('ArrowDown','ArrowUp')*dt));if(input.usingPad){this.azimuth+=mouse.dx;this.elevation=Math.max(.12,Math.min(Math.PI/2,this.elevation+mouse.dy));}this.redraw();}
  draw(sim){
    this.sim=sim;const {boxes,links,markers}=surveyMapData(sim.plan,sim,this.layer),c=this.canvas,ctx=c.getContext('2d');
    const pts=boxes.flatMap(b=>{const [a,d,e,f,y,h]=b.bounds;return [[a,y,e],[d,h,f]];});if(!pts.length)pts.push([0,DECK,0]);
    const min=[0,1,2].map(i=>Math.min(...pts.map(p=>p[i]))),max=[0,1,2].map(i=>Math.max(...pts.map(p=>p[i]))),center=min.map((a,i)=>(a+max[i])/2);
    const basis={azimuth:this.azimuth,elevation:this.elevation,center,scale:1,width:0,height:0};
    const corners=boxes.flatMap(b=>{const [a,d,e,f,y,h]=b.bounds;return [a,d].flatMap(x=>[e,f].flatMap(z=>[y,h].map(v=>mapProject([x,v,z],basis))));});
    const lo=[0,1].map(i=>Math.min(...corners.map(p=>p[i]),-8)),hi=[0,1].map(i=>Math.max(...corners.map(p=>p[i]),8));
    const scale=Math.min((c.width-52)/Math.max(35,hi[0]-lo[0]),(c.height-82)/Math.max(35,hi[1]-lo[1]))*this.zoom;
    const view={...basis,width:c.width,height:c.height,scale,pan:[this.pan[0]-(hi[0]+lo[0])/2*scale,this.pan[1]-(hi[1]+lo[1])/2*scale]};this.view=view;const p=v=>mapProject(v,view);
    ctx.fillStyle='#071821';ctx.fillRect(0,0,c.width,c.height);ctx.strokeStyle='#15343f';ctx.lineWidth=1;for(let x=0;x<c.width;x+=32){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,c.height);ctx.stroke();}for(let y=0;y<c.height;y+=32){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(c.width,y);ctx.stroke();}
    const line=(a,b,color,dash=[])=>{ctx.strokeStyle=color;ctx.setLineDash(dash);ctx.beginPath();ctx.moveTo(...p(a).slice(0,2));ctx.lineTo(...p(b).slice(0,2));ctx.stroke();ctx.setLineDash([]);};
    const faces=[];this.hit=[];
    for(const b of boxes){
      if(b.polygon){
        const lo=b.bounds[4],hi=b.bounds[5],bottom=b.polygon.map(v=>p([v[0],lo,v[1]])),top=b.polygon.map(v=>p([v[0],hi,v[1]])),n=top.length;
        this.hit.push({x:top.reduce((s,v)=>s+v[0],0)/n,y:top.reduce((s,v)=>s+v[1],0)/n,name:b.name});
        for(const verts of [bottom,top,...bottom.map((v,i)=>[v,bottom[(i+1)%n],top[(i+1)%n],top[i]])])faces.push({verts,color:b.color,kind:b.kind,depth:verts.reduce((s,v)=>s+v[2],0)/verts.length});
        continue;
      }
      const [x0,x1,z0,z1,y0,y1]=b.bounds,v=[[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1],[x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1]].map(p);this.hit.push({x:(v[0][0]+v[6][0])/2,y:(v[0][1]+v[6][1])/2,name:b.name});
      for(const inds of [[0,1,2,3],[4,5,6,7],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]])faces.push({verts:inds.map(i=>v[i]),color:b.color,kind:b.kind,depth:inds.reduce((n,i)=>n+v[i][2],0)/4});
    }
    faces.sort((a,b)=>b.depth-a.depth);for(const f of faces){ctx.beginPath();f.verts.forEach((v,i)=>i?ctx.lineTo(v[0],v[1]):ctx.moveTo(v[0],v[1]));ctx.closePath();ctx.fillStyle=f.color+(['shell','shaft','ghost'].includes(f.kind)?'0b':'45');ctx.strokeStyle=f.color+(f.kind==='tile'?'42':'a0');ctx.setLineDash(f.kind==='ghost'?[3,3]:[]);ctx.fill();ctx.stroke();}ctx.setLineDash([]);
    for(const l of links){ctx.lineWidth=l.kind==='lift'?2:1.5;line(l.a,l.b,l.kind==='fold'?'#dcacf5':l.kind==='jump'?'#b6c9fa':'#ffcf90',[4,4]);}ctx.lineWidth=1;
    if(this.layer!=='surface')for(let i=1;i<sim.route.length;i++)line(sim.route[i-1],sim.route[i],'#b3eee44a');
    for(const m of markers){const [x,y]=p(m.pos);ctx.fillStyle=m.kind==='complete'?'#8bd5b1':'#ffce82';ctx.beginPath();ctx.arc(x,y,m.kind==='beacon'?2.5:4,0,Math.PI*2);ctx.fill();this.hit.push({x,y,name:m.label});}
    const a=p(sim.pos),ahead=p([sim.pos[0]-Math.sin(sim.yaw)*8,sim.pos[1],sim.pos[2]-Math.cos(sim.yaw)*8]),angle=Math.atan2(ahead[1]-a[1],ahead[0]-a[0]);ctx.save();ctx.translate(a[0],a[1]);ctx.rotate(angle);ctx.fillStyle='#fff3bd';ctx.strokeStyle='#071821';ctx.beginPath();ctx.moveTo(10,0);ctx.lineTo(-6,-5);ctx.lineTo(-3,0);ctx.lineTo(-6,5);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
    ctx.fillStyle='#bcd3d6';ctx.font='11px monospace';const north=p([center[0],center[1],center[2]-12]),origin=p(center);ctx.strokeStyle='#769ba4';ctx.beginPath();ctx.moveTo(c.width-38,38);ctx.lineTo(c.width-38+(north[0]-origin[0])*1.5,38+(north[1]-origin[1])*1.5);ctx.stroke();ctx.fillText('N',c.width-40+(north[0]-origin[0])*1.8,38+(north[1]-origin[1])*1.8);
    ctx.fillText(`${Math.round(Math.abs(sim.pos[1]))} m depth  /  ${sim.gravity.toFixed(2)} G`,14,22);
    this.info.textContent=(this.selected||sim.zone)+' · '+'Drag orbit · Shift-drag pan · wheel / + − zoom · arrows tilt/rotate. Amber: you & objectives · teal: surveyed · dashed: links. Unexplored rooms hidden.';
  }
  dispose(){for(const off of this.listeners)off();this.toolbar.remove();this.info.remove();}
}
