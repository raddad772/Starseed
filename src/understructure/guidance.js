export function surveyObjective(sim){
  if(sim.time-sim.recoveryAt<4)return 'Safety tether returned you to a stable ledge · progress kept';
  const p=sim.plan.puzzles.find(p=>!sim.solved.has(p.id));
  const hints={gravity:sim.carryingCell?'East / Light-Load Transit · jump to the raised return socket':'East / Null Well · use the field tether to retrieve the cell',time:'Southwest / synchronizer · interact inside the lit interval',space:'Southwest / return frame · link, cross, reconnect',light:'Northeast / Photon Causeway · latch both bridges and connect the far relay',pressure:'Northwest / cistern · set the valve to the reference pressure',resonance:'Southwest / resonators · follow the displayed plate sequence'};
  return sim.dataRecovered?'Site record secured · return or keep exploring':sim.pos[1]>-2?'Open the hatch, step onto the platform and descend':sim.moving?'Express transit · service level 08':p?hints[p.id]:'Repository open · retrieve the record at the far end of lower collection';
}
export function fieldStatus(sim){return `PACK OFFLINE · ${sim.gravity.toFixed(2)} G${sim.tetherActive?' · CHAMBER TETHER ACTIVE':sim.chamber?.kind==='platforms'?' · SPACE JUMPS, HOLDING DOES NOT THRUST':''}`;}
