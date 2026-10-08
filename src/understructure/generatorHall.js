import { Rng } from '../core/rng.js';

// Planet facts constrain the dressing; the standalone survey is a wet, living demo.
export function surveyEnvironment(body) {
  if(!body)return {life:true,wet:true,vegetation:null};
  const hydro=body.hydrosphere;
  return {life:!!body.life,wet:hydro?.water==='liquid'||hydro?.liquid==='water',vegetation:body.life?.vegColor||null};
}

export function generatorHall(seed,deck,environment=surveyEnvironment()) {
  const rng=Rng.fromString(seed).fork('wounded-generator-hall-v1');
  const wound=rng.pick(environment.wet?['shear','igneous','aquifer']:['shear','igneous']);
  const active=rng.int(0,5),cores=[];
  for(const z of [-149,-189,-246])for(const x of [-31,31]){
    const id=cores.length;
    cores.push({id,x,z,active:id===active,radius:10.5,base:deck-22,top:deck+45,damage:rng.range(.2,.9)});
  }
  return {environment,wound,active,cores,phase:rng.range(0,27),period:rng.range(18,27),
    name:wound==='shear'?'FAULTED GENERATOR HALL':wound==='igneous'?'BURIED GENERATOR HALL':'DROWNED GENERATOR HALL',
    breach:{x:24,bottom:deck-12,top:deck+57,z:-286},
    spur:{id:'rupture-spur',a:[0,deck+42,-268],b:[0,deck+42,-326],width:4},
    lookout:[-9,9,-334,-321,deck+42],
    horizon:{near:-350,far:-1250,width:560,bottom:deck-280,ceiling:deck+115},
    sample:{id:'rupture',pos:[0,deck+42,-330],title:'The planet came later',text:wound==='igneous'?'A cooled intrusion has poured through several decks. The surviving service bridge was braced around the rock afterward. Far beyond it, another distribution level answers the working generator.':wound==='aquifer'?'Groundwater has found the fault and filled the machine foundations. The surviving service bridge continues through the breach. The apparent far wall resolves into more decks, hundreds of metres away.':'The fault has displaced several decks, yet a later service bridge threads the fracture. Neither the rock nor the repair tells you which part of this place was here first.'}};
}

// Slow, bounded restart envelopes, not frame-random flashing. Can be sampled at
// any time (including a rewound machinery clock) without accumulating state.
export function generatorCycle(hall,time) {
  const t=((time+hall.phase)%hall.period+hall.period)%hall.period;
  const swell=(center,width)=>Math.max(0,1-Math.abs(t-center)/width)**2;
  const surge=Math.max(swell(4,2.6)*.35,swell(9,3.1),swell(13.5,2.1)*.48);
  const spark=swell(10.7,.6);
  return {power:.16+surge*.84,sag:1-surge*.32,spark};
}

export function generatorFloor(hall,x,z,y) {
  const [a,b,c,d,h]=hall.lookout;
  if(Math.abs(y-h)>.4)return null;
  if(x>=a&&x<=b&&z>=c&&z<=d)return h;
  if(Math.abs(x)<=hall.spur.width/2&&z<=hall.spur.a[2]&&z>=hall.spur.b[2])return h;
  return null;
}
