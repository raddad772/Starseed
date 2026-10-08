import { Rng } from '../core/rng.js';
// Scenic, seeded manifestations never gate progress or change collision/gravity.
export function manifestationPlan(seed,service,deck){
 const rng=Rng.fromString(seed).fork('quiet-manifestations'),rooms=[service.rooms.find(r=>r.id==='intake-hall'),service.rooms.find(r=>r.id==='lower-exchange'),rng.pick(service.rooms.filter(r=>!r.excavated&&!r.id.includes('hall')&&!r.id.includes('exchange')))];
 return rooms.map((r,i)=>({id:r.id,kind:i===1?'sheen':'seep',pos:[r.center[0]+(i===0?6:0),deck+r.height-.35,r.center[1]],floor:deck,phase:rng.range(0,90),period:rng.range(64,110),duration:rng.range(18,28),hue:rng.next()}));
}
export function manifestationReading(m,time){const t=(time+m.phase)%m.period,cycle=Math.floor((time+m.phase)/m.period),envelope=t<m.duration?Math.sin(Math.PI*t/m.duration)**2:0;return {cycle,envelope,strength:m.kind==='seep'?.16+envelope*.7:envelope};}
