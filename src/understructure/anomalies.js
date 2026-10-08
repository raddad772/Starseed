export const LEGACY_PROFILES=[['gravity','time'],['gravity'],['space'],['time'],['gravity','space'],['time','space']];
export const THEME_NAMES={gravity:'Weight',time:'Time',space:'Distance',light:'Light',pressure:'Pressure',resonance:'Resonance'};
const ids=Object.keys(THEME_NAMES);
export const THEME_PROFILES=[...LEGACY_PROFILES,...ids.filter(x=>!['gravity','time','space'].includes(x)).map(x=>[x]),...ids.flatMap((a,i)=>ids.slice(i+1).filter(b=>!LEGACY_PROFILES.some(p=>p.includes(a)&&p.includes(b))).map(b=>[a,b]))];
export function siteThemes(rng,requested='auto') {
  const valid=THEME_PROFILES.find(p=>p.length===requested.split('-').length&&p.every(id=>requested.split('-').includes(id)));
  return [...(valid||rng.fork('themes').pick(THEME_PROFILES))];
}
// A continuous, deterministic machinery loop: forward, hold, then rewind.
// The player and input clock never run backward.
export function machineryClock(time) {
  const t=((time%12)+12)%12;
  return t<5?{time:t,state:'FORWARD'}:t<7?{time:5,state:'HELD'}:{time:12-t,state:'REWIND'};
}
export function phaseReading(time,puzzle) {
  const value=((time+puzzle.offset)%puzzle.period)/puzzle.period;
  return {value,ready:Math.abs(value-puzzle.target)<=puzzle.window/2};
}
export function makePuzzles(themes,rng,deck) {
  const r=rng.fork('puzzles'),out=[];
  if(themes.includes('gravity'))out.push({id:'gravity',kind:'relay',room:'null',name:'Return-cell circuit',source:[96,deck+12,-52],socket:[136,deck+4.8,-100]});
  if(themes.includes('time'))out.push({id:'time',kind:'phase',room:'resonance',name:'Transit synchronizer',pos:[-96,deck,-100],period:r.int(7,10),offset:r.range(0,6),target:r.pick([.3,.5,.7]),window:.28});
  if(themes.includes('space'))out.push({id:'space',kind:'fold',room:'resonance',name:'Folded return line',mark:r.pick(['II','IV','VI']),
    gates:[{pos:[-104,deck,-110],normal:[0,-1]},{pos:[-100,deck,-41],normal:[-1,0]}]});
  if(themes.includes('light'))out.push({id:'light',kind:'bridge',room:'light',name:'Solid-light relay',controls:[[84,deck,-20],[106,deck,-20],[134,deck,-20]]});
  if(themes.includes('pressure'))out.push({id:'pressure',kind:'pressure',room:'upfall',name:'Pressure equaliser',pos:[-96,deck,-41],target:r.int(1,3)});
  if(themes.includes('resonance')){const order=r.pick([[0,2,1],[1,0,2],[2,1,0],[2,0,1]]);out.push({id:'resonance',kind:'echo',room:'resonance',name:'Resonance return',order,plates:[[-104,deck,-94],[-96,deck,-94],[-88,deck,-94]]});}
  return out;
}
