export const THEME_PROFILES=[['gravity','time'],['gravity'],['space'],['time'],['gravity','space'],['time','space']];
export const THEME_NAMES={gravity:'Weight',time:'Time',space:'Distance'};
export function siteThemes(rng,requested='auto') {
  const valid=THEME_PROFILES.find(p=>p.join('-')===requested);
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
  if(themes.includes('gravity'))out.push({id:'gravity',kind:'relay',room:'null',name:'Return-cell circuit',source:[96,deck+12,-52],socket:[82,deck,-52]});
  if(themes.includes('time'))out.push({id:'time',kind:'phase',room:'resonance',name:'Transit synchronizer',pos:[-96,deck,-100],period:r.int(7,10),offset:r.range(0,6),target:r.pick([.3,.5,.7]),window:.28});
  if(themes.includes('space'))out.push({id:'space',kind:'fold',room:'resonance',name:'Folded return line',mark:r.pick(['II','IV','VI']),
    gates:[{pos:[-104,deck,-110],normal:[0,-1]},{pos:[-100,deck,-41],normal:[-1,0]}]});
  return out;
}
