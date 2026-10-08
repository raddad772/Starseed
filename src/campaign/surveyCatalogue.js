import { lifeHistory } from '../gen/lifeHistory.js';

function interests(b) {
  const tags=[];
  const life=lifeHistory(b);
  if(life==='present')tags.push('living ecosystem');
  if(life==='past')tags.push('evidence of former life');
  if(b.rings)tags.push('rings');
  if(b.history?.tidal>.1)tags.push('tidal activity');
  if(b.hydrosphere?.liquid==='lava')tags.push('volcanic surface');
  if(b.hydrosphere?.oceanFraction>.05)tags.push('seas');
  if(b.history?.snowball)tags.push('ice-covered world');
  if(b.atmosphere?.pressure>1)tags.push('dense atmosphere');
  if(b.kind==='moon')tags.push('moon');
  return tags;
}
// Compact, portable discoveries. Never put history time-series or terrain arrays in JSON saves.
export function systemDetails(system) {
  return {version:1,seed:system.seed,bodies:system.bodies.filter(b=>b.kind!=='star').map(b=>({
    id:b.id,parentId:b.parentId,kind:b.kind,name:b.name,label:b.label,solid:!!b.solid,
    massEarth:b.massEarth,radiusKm:b.radiusM/1000,temperatureK:b.Tsurf,life:lifeHistory(b),interests:interests(b)
  }))};
}
// Prefer three different experiences. Selection is stable and includes moons;
// a gas giant is interesting to see but cannot satisfy a surface landing objective.
export function surveyTargets(details,count=3) {
  const choices=details.bodies.filter(b=>b.solid),picked=[],seen=new Set();
  while(picked.length<count && choices.length) {
    choices.sort((a,b)=>score(b)-score(a)||a.id-b.id);
    const b=choices.shift();picked.push(b);b.interests.forEach(t=>seen.add(t));
  }
  return picked.map(b=>({bodyId:b.id,name:b.name,reasons:b.interests.length?b.interests:['geological comparison']}));
  function score(b){return b.interests.reduce((s,t)=>s+(seen.has(t)?.1:t==='evidence of former life'?5:t==='living ecosystem'?4:1.5),0)+Math.min(2,b.radiusKm/6000);}
}
export function recordSystemDetails(c,system,visitedBodies=[]) {
  const id=c.galaxy?.currentSystemId||`system/${c.generation.galaxySeed}`;
  const old=c.discoveries.systems[id]||{};
  const details=old.details?.seed===system.seed?old.details:systemDetails(system);
  c.discoveries.systems[id]={...old,knowledge:old.knowledge||'charted',visited:true,details,visitedBodies:[...new Set([...(old.visitedBodies||[]),...visitedBodies])].sort((a,b)=>a-b)};
}
export function validateSurveyCatalogue(c) {
  for(const s of Object.values(c.discoveries.systems)) {
    if(s.details!==undefined) {
      const d=s.details;
      if(!s.visited||d?.version!==1||typeof d.seed!=='string'||!Array.isArray(d.bodies)||d.bodies.length>512)throw Error('Invalid detailed survey catalogue');
      const ids=new Set();
      for(const b of d.bodies) {
        if(!b||!Number.isInteger(b.id)||b.id<1||ids.has(b.id)||!Number.isInteger(b.parentId)||b.parentId<0||!['planet','moon'].includes(b.kind)||typeof b.name!=='string'||b.name.length>128||typeof b.label!=='string'||b.label.length>200||typeof b.solid!=='boolean'||![b.massEarth,b.radiusKm,b.temperatureK].every(Number.isFinite)||b.massEarth<=0||b.radiusKm<=0||!['present','past','none'].includes(b.life)||!Array.isArray(b.interests)||b.interests.length>16||b.interests.some(t=>typeof t!=='string'||t.length>128))throw Error('Invalid surveyed body');
        ids.add(b.id);
      }
      if(!Array.isArray(s.visitedBodies)||new Set(s.visitedBodies).size!==s.visitedBodies.length||s.visitedBodies.some(id=>!ids.has(id)))throw Error('Invalid surface visit record');
    }
  }
}
