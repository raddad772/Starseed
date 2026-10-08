import { systemCacheStatus } from '../gen/systemCache.js';
import { chart, resolveSystem, ensureGalaxy, parseAddress, distancePc, CENTRAL_OBJECT, CELL_PC } from '../campaign/galaxy.js';
import { travelBlocker } from '../campaign/travel.js';

export function renderGalaxyMap(root,{saves,state,consent,onVote,onCancel,onLocal}) {
  const doc=root.ownerDocument,g=saves.game();
  root.replaceChildren();root.classList.add('galaxyPage');
  const el=(tag,text,parent=root,cls)=>{const e=doc.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;parent.append(e);return e;};
  if(!g?.placed){el('p','Start an expedition to chart a route.');return;}
  const c=ensureGalaxy(saves.activate(g));consent.sync(g);
  if(state.campaignId!==c.campaignId){for(const key of Object.keys(state))delete state[key];state.campaignId=c.campaignId;}
  state.center ||= [0,0];state.zoom ||= 1;
  state.selected ||= c.story.quests['quest/first-receiver']?.targetSystemId||c.galaxy.currentSystemId;
  let entries=chart(c,state.center),selected;
  try{selected=resolveSystem(c,state.selected);}catch{selected=resolveSystem(c,c.galaxy.currentSystemId);state.selected=selected.id;}
  const current=resolveSystem(c,c.galaxy.currentSystemId);
  const rerender=()=>renderGalaxyMap(root,{saves,state,consent,onVote,onCancel,onLocal});
  function select(id,center=false){
    const s=resolveSystem(c,id);if(s.id!==state.selected)onCancel(false);
    state.selected=s.id;
    if(center){const [x,z]=s.address.split(':').map(Number);state.center=[x,z];state.zoom=1;}
    rerender();
  }
  const button=(label,fn,parent)=>{const b=el('button',label,parent);b.type='button';b.onclick=fn;return b;};
  const head=el('div',undefined,root,'galaxyHead');
  el('h2','Expedition chart',head);el('p','An overhead view of the region · distances in parsecs',head);
  const actions=el('div',undefined,head,'galaxyActions');
  button('Fleet',()=>select(current.id,true),actions);
  const target=c.story.quests['quest/first-receiver']?.targetSystemId;
  if(target)button('Transmission',()=>select(target,true),actions);
  button('Local system',onLocal,actions);
  const layout=el('div',undefined,root,'galaxyLayout'),mapBox=el('div',undefined,layout,'galaxyChart');
  const ns='http://www.w3.org/2000/svg';
  const svg=doc.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 900 600');svg.setAttribute('role','img');svg.setAttribute('aria-label','Overhead star chart. Select systems in the destination list.');mapBox.append(svg);
  const draw=(tag,attrs,text)=>{const e=doc.createElementNS(ns,tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,v);if(text)e.textContent=text;svg.append(e);return e;};
  const wide=state.center[0]===0&&state.center[1]===0;
  const span=(wide?42:24)/state.zoom,cx=wide?17:24+state.center[0]*CELL_PC,cz=state.center[1]*CELL_PC;
  const project=p=>[450+(p[0]-cx)*820/span,300-(p[2]-cz)*820/span];
  const visible=p=>p[0]>24&&p[0]<876&&p[1]>26&&p[1]<574;
  for(let x=Math.floor((cx-span/2)/5)*5;x<cx+span/2;x+=5){const [px]=project([x,0,0]);draw('line',{x1:px,x2:px,y1:22,y2:578,class:'galaxyGrid'});draw('text',{x:px+4,y:590,class:'galaxyAxis'},`${x} pc`);}
  for(let z=Math.floor((cz-span/2)/5)*5;z<cz+span/2;z+=5){const [,py]=project([0,0,z]);if(py>20&&py<575){draw('line',{x1:22,x2:878,y1:py,y2:py,class:'galaxyGrid'});draw('text',{x:25,y:py-4,class:'galaxyAxis'},`${z} pc`);}}
  const bh=project(CENTRAL_OBJECT.position);
  if(visible(bh)){
    draw('line',{x1:bh[0],x2:bh[0],y1:bh[1]-96,y2:bh[1]+96,class:'galaxyJet'});
    draw('ellipse',{cx:bh[0],cy:bh[1],rx:31,ry:9,class:'galaxyCoreRing'});
    draw('circle',{cx:bh[0],cy:bh[1],r:14,class:'galaxyCore'});
    draw('text',{x:bh[0],y:bh[1]+35,'text-anchor':'middle',class:'galaxyLabel'},'Central black hole');
    draw('text',{x:bh[0],y:bh[1]+50,'text-anchor':'middle',class:'galaxyAxis'},'Reference landmark');
  }
  const a=project(current.position),b=project(selected.position);
  draw('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],class:'galaxyRoute'});
  if(!entries.some(e=>e.id===selected.id))entries.push(selected);
  for(const star of entries){
    const [x,y]=project(star.position);if(!visible([x,y]))continue;
    const here=star.id===current.id,picked=star.id===selected.id,lead=star.id===target;
    if(here||picked||lead)draw('circle',{cx:x,cy:y,r:picked?12:8,class:here?'galaxyFleetRing':'galaxySelection'});
    const color=`rgb(${star.summary.color.map(n=>Math.round(n*255)).join(',')})`;
    const dot=draw('circle',{cx:x,cy:y,r:here?4:2.5,fill:color,class:'galaxyStar'});dot.style.cursor='pointer';
    const title=doc.createElementNS(ns,'title');title.textContent=`${star.summary.name} · ${star.address}`;dot.append(title);dot.onclick=()=>select(star.id);
    if(here||picked||lead)draw('text',{x:x+15,y:y-10,class:'galaxyLabel'},here?'Fleet':lead?'Transmission':star.summary.name);
  }
  const mapControls=el('div',undefined,mapBox,'galaxyActions');
  for(const [label,dx,dz]of [['←',-2,0],['↑',0,2],['↓',0,-2],['→',2,0]])button(label,()=>{state.center=[state.center[0]+dx,state.center[1]+dz].map(n=>Math.max(-100000,Math.min(100000,n)));state.zoom=1;rerender();},mapControls).setAttribute('aria-label',`Chart ${label}`);
  button('−',()=>{state.zoom=Math.max(.5,state.zoom/1.5);rerender();},mapControls).setAttribute('aria-label','Zoom out');
  button('+',()=>{state.zoom=Math.min(4,state.zoom*1.5);rerender();},mapControls).setAttribute('aria-label','Zoom in');
  el('small','200 stars per chart window · arrows extend the chart · star heights are shown in the route card',mapBox);
  const side=el('aside',undefined,layout,'galaxyDetails');
  el('h3',selected.id===target?'Transmission receiver':selected.summary.name,side);
  el('p',`${selected.summary.name} · ${selected.summary.spectral} · ${selected.summary.nPlanets} planets`,side);
  const dist=distancePc(current,selected),here=selected.id===current.id;
  el('p',here?'Your fleet is here':`${dist.toFixed(2)} pc · ${(dist*3.26156).toFixed(2)} light-years from your fleet`,side,'galaxyDistance');
  el('p',`Address ${selected.address} · height ${selected.position[1].toFixed(2)} pc`,side);
  el('p',c.discoveries.systems[selected.id]?.visited?'Visited · local discoveries retained':'Charted · surface survey available on arrival',side);
  const survey=c.discoveries.systems[selected.id];
  if(survey?.details){
    const known=el('details',undefined,side);el('summary',`Survey record · ${survey.details.bodies.length} bodies`,known);
    for(const b of survey.details.bodies)el('p',`${b.name} · ${b.kind} · ${b.label}${b.life==='present'?' · life detected':b.life==='past'?' · former life':''}${survey.visitedBodies?.includes(b.id)?' · landed':''}`,known);
  }else el('p',`Life potential: ${{promising:'promising', 'possible-moons':'possible on moons',low:'low'}[selected.summary.lifePotential]} · formation estimate, awaiting survey`,side);
  if(systemCacheStatus(selected.definition||selected.seed).ready)el('small','System data prepared · terrain loads separately',side);
  let blocked;try{blocked=travelBlocker(saves.snapshot());}catch(e){blocked=e.message;}
  const pending=consent.game===g&&consent.destination===selected.id;
  const travel=button(pending?'Player 1 agrees':'Gather fleet & travel',()=>onVote(selected.id,0),side);travel.className='primary';travel.disabled=here||!!blocked||!!saves.loading;
  if(blocked)el('p',blocked,side,'note');
  if(pending){el('p','Waiting for the crew. Player 2: A agrees, B cancels. Either player can cancel before departure.',side);button('Cancel departure',()=>onCancel(),side);}
  el('p','This early fleet-passage mode gathers every vessel into orbit at the destination. Everyone must be aboard. Supplies aboard travel with you; items left on worlds stay there. Local flight orders are cleared.',side,'note');
  el('p','The simulation clock stays fixed during passage, with no fuel cost. Preparing the destination can still take time.',side,'note');
  const status=el('p',saves.status,side);status.dataset.campaignStatus='';status.setAttribute('role','status');
  const browse=el('div',undefined,root,'galaxyBrowse');
  const label=el('label','Find a charted star',browse),search=el('input',undefined,label);search.placeholder='Name or address';search.type='search';search.value=state.filter||'';
  const selectBox=el('select',undefined,browse);selectBox.setAttribute('aria-label','Chart destinations');
  const fill=()=>{selectBox.replaceChildren();const filter=search.value.toLowerCase();for(const e of entries.filter(e=>`${e.summary.name} ${e.address} ${e.id===target?'transmission':''}`.toLowerCase().includes(filter))){const opt=el('option',`${e.id===current.id?'● ':''}${e.summary.name} · ${e.address}${e.id===target?' · Transmission':''}`,selectBox);opt.value=e.id;opt.selected=e.id===selected.id;}};
  fill();search.oninput=()=>{state.filter=search.value;fill();};selectBox.onchange=()=>select(selectBox.value);
  const addressLabel=el('label','Go to a cell address',browse),address=el('input',undefined,addressLabel);address.placeholder='3:0:2';address.setAttribute('aria-label','Cell address');
  button('Chart address',()=>{try{select(parseAddress(address.value),true);}catch(e){status.textContent=e.message;}},browse);
  el('p','The central symbol marks the black hole’s location. Its flight-sky rendering and the physical mirrored enclosure are still to come.',root,'note');
}
