import { mysteryProgress } from './recovery.js';
export function scanMessage(sim){const t=sim.time-sim.scanAt;if(t<0||t>9)return '';return t<1.5?'SCANNING DATA…':t<3.5?'GOLDEN PATH DATA FOUND · +1 UNIT':t<5?'PROCESSING…':'SIGNAL SAVED · Find more Golden Path data';}
export function surveyObjective(sim){
  if(sim.time-sim.recoveryAt<4)return 'Safety tether returned you to a stable ledge · progress kept';
  if(sim.dataRecovered)return 'Central record secured · return or explore for more data';
  if(sim.pos[1]>-2)return 'Investigate the ground hatch';
  if(sim.moving)return 'Express transit · service level 08';
  const hints={gravity:sim.carryingCell?'An empty supply socket lies beyond the fractured return deck':'A live supply cell is stranded above the pump well',time:'The damaged synchronizer repeats its last cycle',space:'The maintenance thresholds no longer agree with the survey',light:'The old crossing has collapsed; its emergency projectors still have power',pressure:'The return manifold is out of balance; check its reference gauge',resonance:'The pump-start sequence is still legible on the service diagram'};
  const p=sim.plan.puzzles.find(p=>!sim.solved.has(p.id)&&(p.room===sim.chamber?.id||(p.id==='gravity'&&sim.chamber?.id==='low')));
  return p?hints[p.id]:sim.archiveReady?'Archive bus restored · follow the rising service galleries to the upper backup rack':'Trace the damaged return lines · recover Golden Path data';
}
export function recoveryStatus(sim){return `DATA ${sim.rawData}% · ${sim.dataCredit}/170 site credit${sim.rawData>100?' · EXCESS ×3':''} / GOLDEN PATH ${sim.campaignTotal}${mysteryProgress(sim.campaignTotal).next?' / '+mysteryProgress(sim.campaignTotal).next:''}`;}
export function mysteryStatus(sim){const p=mysteryProgress(sim.campaignTotal);return `Golden Path · ${p.stage} mystery milestone${p.stage===1?'':'s'} reached · `+(p.next?`${Math.max(0,p.next-sim.campaignTotal)} more data to the ${p.next}-unit lead. Any planetary megastructure contributes.`:'Both current leads reconstructed. Further exploration remains credited.');}
export function fieldStatus(sim){return `PACK OFFLINE · ${sim.gravity.toFixed(2)} G${sim.tetherActive?' · CHAMBER TETHER ACTIVE':sim.chamber?.kind==='platforms'?' · SPACE JUMPS':''}`;}
