import { mysteryProgress } from './recovery.js';
export function scanMessage(sim){const t=sim.time-sim.scanAt;if(t<0||t>9)return '';return t<1.5?'SCANNING DATA…':t<3.5?'GOLDEN PATH DATA FOUND · +1 UNIT':t<5?'PROCESSING…':'SIGNAL SAVED · Find more Golden Path data';}
export function surveyObjective(sim){
  if(sim.time-sim.recoveryAt<4)return 'Safety tether returned you to a stable ledge · progress kept';
  if(sim.chamber?.id==='return-shaft')return 'Float beyond the gallery end, then descend · the field seals the depths below';
  if(sim.plan.traversal.vertical&&sim.solved.has('gravity')&&sim.pos[1]>sim.plan.deck+8&&sim.pos[1]<sim.plan.deck+32&&sim.pos[2]>-110)return 'Follow the upper crossing to the transit shaft · descend to the return machinery';
  if(sim.dataRecovered)return 'Central record secured · return or explore for more data';
  if(sim.inBunker)return 'Jetpack disabled · board the express lift at the far end';
  if(sim.pos[1]>-.6)return 'Investigate the ground hatch';
  if(sim.moving)return 'Express transit · descending into the structure';
  const hints={gravity:sim.carryingCell?'Carry the charged cell across the fractured gallery to its socket':sim.chamber?.id==='low'?'This socket needs a power cell. Find the zero-gravity pump well first.':'Find the charged cell above you · Space rises · C descends · R brakes',time:'The damaged synchronizer repeats its last cycle',space:'The maintenance thresholds no longer agree with the survey',light:'The old crossing has collapsed; its emergency projectors still have power',pressure:'The return manifold is out of balance; check its reference gauge',resonance:'The pump-start sequence is still legible on the service diagram'};
  const p=sim.plan.puzzles.find(p=>!sim.solved.has(p.id)&&(p.room===sim.chamber?.id||(p.id==='gravity'&&sim.chamber?.id==='low')));
  if(p)return hints[p.id];
  if(sim.archiveReady)return 'Archive bus restored · follow the rising service galleries to the upper backup rack';
  const next=sim.plan.puzzles.find(p=>!sim.solved.has(p.id));
  const room=sim.plan.chambers.find(c=>c.id===(next?.id==='gravity'&&sim.carryingCell?'low':next?.room));
  if(room)return `Damaged return-line signal · ${room.name.toLowerCase()}`;
  return 'Trace the damaged return lines · recover Golden Path data';
}
export function recoveryStatus(sim){return `DATA ${sim.rawData}% · ${sim.dataCredit}/170 site credit${sim.rawData>100?' · EXCESS ×3':''} / GOLDEN PATH ${sim.campaignTotal}${mysteryProgress(sim.campaignTotal).next?' / '+mysteryProgress(sim.campaignTotal).next:''}`;}
export function mysteryStatus(sim){const p=mysteryProgress(sim.campaignTotal);return `Golden Path · ${p.stage} mystery milestone${p.stage===1?'':'s'} reached · `+(p.next?`${Math.max(0,p.next-sim.campaignTotal)} more data to the ${p.next}-unit lead. Any planetary megastructure contributes.`:'Both current leads reconstructed. Further exploration remains credited.');}
export function fieldStatus(sim){return `${sim.jetpackEnabled?'SURFACE LINK':'JETPACK DISABLED'} · ${sim.gravity.toFixed(2)} G${sim.tetherActive?' · CHAMBER TETHER ACTIVE':' · SPACE JUMPS'}`;}

export function suitAlert(sim){if(sim.time-sim.packDisabledAt<4)return 'Jetpack disabled.';if(sim.time-sim.gravityAlertAt<4)return sim.gravityAlert;return '';}

export function navigationTarget(s){
 const p=s.plan;if(s.moving)return null;
 if(p.traversal.vertical&&s.solved.has('gravity')&&s.pos[1]>p.deck+8&&s.pos[1]<p.deck+32&&s.pos[2]>-110){const r=p.traversal.highRoutes;return {pos:s.chamber?.id==='low'?r[0].a:s.chamber?.id==='return-shaft'?[p.traversal.returnX,p.deck,-99]:s.pos[0]>p.traversal.returnX+1?r[0].b:r.at(-1).b,label:s.chamber?.id==='return-shaft'?'Shielded shaft · descend':'Upper machinery crossing'};}
 if(s.pos[1]>-.6)return {pos:[0,0,p.access.hatchZ],label:'Access hatch'};
 if(s.inBunker)return {pos:s.exitReady?[0,p.access.top,p.access.hatchZ]:[0,p.access.top,0],label:s.exitReady?'Surface ladder':'Descent lift'};
 if(s.dataRecovered)return {pos:[0,p.deck,0],label:'Surface return'};
 if(s.archiveReady)return {pos:p.finalCache.pos,label:'Central record'};
 const next=p.puzzles.find(p=>!s.solved.has(p.id)&&(p.room===s.chamber?.id||(p.id==='gravity'&&s.chamber?.id==='low')))||p.puzzles.find(p=>!s.solved.has(p.id));
 const room=p.chambers.find(c=>c.id===(next?.id==='gravity'&&s.carryingCell?'low':next?.room));
 let pos=room?[room.door[0],room.base??p.deck,room.door[1]]:null;
 if(room===s.chamber){pos=next.kind==='relay'?(s.carryingCell?next.socket:next.source):next.kind==='bridge'?next.controls[Math.min(2,s.bridgeStage)]:next.kind==='echo'?next.plates[next.order[s.echoStep]]:next.pos||next.gates?.[s.foldCrossed?1:0]?.pos;}
 return pos?{pos,label:room?.name||'Return signal'}:null;
}
