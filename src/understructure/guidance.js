import { mysteryProgress } from './recovery.js';
export function scanMessage(sim){const t=sim.time-sim.scanAt;if(t<0||t>9)return '';return t<1.5?'SCANNING DATA…':t<3.5?'GOLDEN PATH DATA FOUND · +1 UNIT':t<5?'PROCESSING…':'SIGNAL SAVED · Find more Golden Path data';}
export function surveyObjective(sim){
  if(sim.time-sim.recoveryAt<4)return 'Safety tether returned you to a stable ledge · progress kept';
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
  if(room){const dx=room.door[0]-sim.pos[0],dz=room.door[1]-sim.pos[2],angle=Math.atan2(-dx,-dz)-sim.yaw,turn=Math.atan2(Math.sin(angle),Math.cos(angle)),bearing=Math.abs(turn)<.5?'ahead':Math.abs(turn)>2.6?'behind':turn>0?'to your left':'to your right';return `Damaged return-line signal · ${Math.round(Math.hypot(dx,dz))} m ${bearing} · ${room.name.toLowerCase()}`;}
  return 'Trace the damaged return lines · recover Golden Path data';
}
export function recoveryStatus(sim){return `DATA ${sim.rawData}% · ${sim.dataCredit}/170 site credit${sim.rawData>100?' · EXCESS ×3':''} / GOLDEN PATH ${sim.campaignTotal}${mysteryProgress(sim.campaignTotal).next?' / '+mysteryProgress(sim.campaignTotal).next:''}`;}
export function mysteryStatus(sim){const p=mysteryProgress(sim.campaignTotal);return `Golden Path · ${p.stage} mystery milestone${p.stage===1?'':'s'} reached · `+(p.next?`${Math.max(0,p.next-sim.campaignTotal)} more data to the ${p.next}-unit lead. Any planetary megastructure contributes.`:'Both current leads reconstructed. Further exploration remains credited.');}
export function fieldStatus(sim){return `${sim.jetpackEnabled?'SURFACE LINK':'JETPACK DISABLED'} · ${sim.gravity.toFixed(2)} G${sim.tetherActive?' · CHAMBER TETHER ACTIVE':' · SPACE JUMPS'}`;}

export function suitAlert(sim){if(sim.time-sim.packDisabledAt<4)return 'Jetpack disabled.';if(sim.time-sim.gravityAlertAt<4)return sim.gravityAlert;return '';}
