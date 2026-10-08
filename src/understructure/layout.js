import { manifestationPlan } from './phenomena.js';
import { serviceSector,serviceAt } from './service.js';
import { ACCESS,accessFloor } from './access.js';
export { ACCESS } from './access.js';
import { obliqueSector,obliqueFloor,insidePolygon } from './oblique.js';
// Seeded local infrastructure prototype. World generation and walking consume the same plan.
import { Rng, normalizeSeed } from '../core/rng.js';
import { reservoirRoutes,routeFloor,dataFragments } from './infrastructure.js';
import { generatorHall,generatorFloor } from './generatorHall.js';
import { siteThemes,makePuzzles,LEGACY_PROFILES } from './anomalies.js';

export const TILE = 4;
export const DECK = -240;
export const LIFT_SECONDS = 4.2;
// Old integrated saves predate explicit theme metadata; preserve their original selection.
export function restoredProfile(seed,requested,saved){if(requested&&requested!=='auto')return requested;if(Array.isArray(saved?.themes))return saved.themes.join('-');if(saved?.version&&saved.version<=2)return Rng.fromString(`understructure-v1:${normalizeSeed(seed)}`).fork('themes').pick(LEGACY_PROFILES).join('-');return 'auto';}
export const key = (x, z) => `${x},${z}`;
export function generateUnderstructure(seed = 'SUMP-07',profile='auto',environment) {
  seed = normalizeSeed(seed) || 'SUMP-07';
  const rng = Rng.fromString(`understructure-v1:${seed}`);
  const themes=siteThemes(rng,profile),puzzles=makePuzzles(themes,rng,DECK);
  const chambers=[
    {id:'null',name:'NULL WELL',kind:'zero-g',bounds:[78,110,-66,-38],ceiling:DECK+rng.int(20,24),door:[78,-52],doorSide:-1,
      walkways:[[78,110,-66,-38]],color:'#9adfea'},
    {id:'upfall',name:'UPFALL CISTERN',kind:'upfall',bounds:[-114,-78,-44,-12],ceiling:DECK+rng.int(13,17),door:[-78,-28],doorSide:1,
      walkways:[[-114,-108,-44,-12],[-84,-78,-44,-12],[-114,-78,-44,-38],[-114,-78,-18,-12],[-114,-78,-29.6,-26.4]],color:'#9edac4'},
    {id:'resonance',name:'RESONANCE HALL',kind:'resonance',bounds:[-114,-78,-118,-82],ceiling:DECK+rng.int(12,16),door:[-78,-100],doorSide:1,
      walkways:[[-114,-78,-118,-82]],color:'#dfb07d'},
  ];

  if(themes.includes('gravity')){
    chambers[1].gravity=1.6;
    chambers.push({id:'low',name:'FRACTURED RETURN GALLERY',kind:'platforms',gravity:.22,bounds:[78,142,-118,-82],ceiling:DECK+17,door:[78,-100],doorSide:-1,walkways:[],color:'#b7cffa',platforms:[[78,88,-104,-96,DECK],[93,99,-104,-96,DECK+1.2],[106,112,-104,-96,DECK+2.4],[119,125,-104,-96,DECK+3.6],[132,142,-106,-94,DECK+4.8]]});

  }
  if(themes.includes('light')){
    chambers.push({id:'light',name:'OVERFLOW SERVICE CROSSING',kind:'platforms',gravity:1,bounds:[78,138,-36,-4],ceiling:DECK+14,door:[78,-20],doorSide:-1,walkways:[],color:'#9ff0ea',platforms:[[78,88,-24,-16,DECK],[102,110,-24,-16,DECK],[126,138,-26,-14,DECK]],bridges:[[88,102,-22,-18,DECK],[110,126,-22,-18,DECK]]});

  }
  const decay=rng.fork('broken-service-decks');
  for(const c of chambers.filter(c=>c.kind==='platforms'))for(const [i,p] of c.platforms.entries()){if(i>0&&i<c.platforms.length-1){const shift=decay.range(-1.2,1.2);p[2]+=shift;p[3]+=shift;if(c.id==='low'){p[0]+=decay.range(-.5,.5);p[1]+=decay.range(-.5,.5);}}}
  const nullChamber=chambers[0];
  if(!themes.includes('gravity')){nullChamber.kind='observation';nullChamber.name=themes.includes('time')?'DELAY WELL':'PARALLAX WELL';chambers[1].name='RETURN CISTERN';}
  if(themes.includes('space'))chambers[2].name='FOLD EXCHANGE';
  nullChamber.obstacles=[
    {center:[87,DECK+7,-60],radius:2.5}, {center:[103,DECK+12,-42],radius:2.4},
    {center:[104,DECK+4,-61],radius:2.1}, {center:[87,DECK+15,-44],radius:2},
  ];
  const service=serviceSector(seed,DECK,chambers),rooms=service.rooms,edges=service.links.map(l=>[l.a,l.b]);
  const utility={equipment:[{kind:'expedition-case',bounds:[-6,-4,-5,-3,DECK,DECK+.85]},{kind:'drill-base',bounds:[4,5.4,-8.2,-4.8,DECK,DECK+.9]}]},walls=[],tiles=[];
  // Coarse samples are navigation diagnostics only, never visible architecture.
  for(let x=-19;x<=19;x++)for(let z=-31;z<=14;z++)if(serviceAt(service,x*TILE,z*TILE))tiles.push({x,z,region:'service'});
  tiles.push({x:0,z:0,region:'access'});
  const samples=[
    {id:'intake',pos:[0,DECK,-20],title:'An occupied frequency',text:'The lift ends in a much later excavation. Someone brought equipment down here and cut through the outer skin. The abandoned drill, cable and support frames do not match the architecture beyond. This was a break-in, not an entrance.'},
    {id:'archive',pos:[24,DECK,-52],title:'Maintenance without occupants',text:'Replacement filters are stacked beside a live return line. None of the fittings match the dimensions of the doors.'},
    {id:'reservoir',pos:[0,DECK,-264],title:'A reservoir with no catchment',text:'No intake, watershed or active weather system accounts for this volume. The maintenance catwalks continue beyond the reach of the hand light.'},
    {id:'null',pos:[96,DECK+(themes.includes('gravity')?12:0),-52],title:themes.includes('gravity')?'Weight ends at the sill':'A pocket in the machinery',text:themes.includes('gravity')?'The planet is still above you. Inside this well, loose concrete hangs without support. Gravity returns exactly at the amber threshold, with no measurable change outside it.':'This little room faces a structural void over a kilometre across. The handrails and service doors continue in rows until they become too small to resolve.'},
    {id:'upfall',pos:[-96,DECK,-41],title:'Return flow',text:'Water falls upward into dry ceiling drains. Closing the return valve suspends the moving columns in place. Neither state explains where the water goes.'},
    {id:'resonance',pos:[-96,DECK,-100],title:'An answer in intervals',text:'A touch at the central plate travels through the hanging resonators. The lights return in a sequence unlike their spacing. It resembles an acknowledgment.'},
  ];
  if(!themes.includes('gravity')){samples.find(s=>s.id==='upfall').title='The return line';samples.find(s=>s.id==='upfall').text=themes.includes('time')?'The same water passes this instrument again. Machinery pauses and rewinds in a twelve-second cycle; your own movements remain unaffected.':'The marked return threshold connects this cistern to a room that the survey places much farther away. The route is stable, but its measured length is not.';}
  // Keep structural columns clear of the crossing and far perimeter catwalks.
  const generator=generatorHall(seed,DECK,environment);samples.push(generator.sample);
  const pillars=[];
  for(let z=-140;z>-280;z-=24)for(const x of [-51,51])pillars.push({x,z,width:3,depth:4});
  const routes=reservoirRoutes(DECK),routeLandings=[routes[0].a,routes.at(-1).b,...routes.slice(1).filter((r,i)=>{const q=routes[i];return Math.abs((r.b[0]-r.a[0])*(q.b[2]-q.a[2])-(r.b[2]-r.a[2])*(q.b[0]-q.a[0]))>.001;}).map(r=>r.a)],fragments=dataFragments(DECK);
  return {version:5,manifestations:manifestationPlan(seed,service,DECK),service,oblique:obliqueSector(seed,DECK,service.rooms.find(r=>r.id==='blind-stub').polygon),generator,utility,routes,routeLandings,fragments,finalCache:{pos:[56,DECK+42,-268],value:90},seed,themes,puzzles,tiles,walls,rooms,edges,samples,
    deck:DECK,shaft:{min:[-2,-2],max:[2,2]},reservoir:{x:64,near:-122,far:-286,bottom:DECK-40,water:DECK-25,ceiling:DECK+60},
    walkways:[[-2,2,-286,-120],[-64,64,-126,-122],[-64,64,-286,-282],[-64,-60,-286,-122],[60,64,-286,-122],[-64,64,-206,-202]],
    access:{...ACCESS},megavault:{near:110,far:1710,zMin:-652,zMax:548,ceiling:-4,bottom:-904},
    pillars,chambers,spawn:[0,0,14]};
}

export function chamberAt(plan,x,z) {
  return plan.chambers.find(c=>x>=c.bounds[0]&&x<=c.bounds[1]&&z>=c.bounds[2]&&z<=c.bounds[3])||null;
}

export function terrainHeight(x,z) {
  const r=Math.hypot(x,z),blend=Math.max(0,Math.min(1,(r-14)/70));
  return blend*blend*(5+3*Math.sin(x*.035)+4*Math.cos(z*.025)+2*Math.sin((x+z)*.067));
}

export function makeCollision(plan) {
  let geometry=null;const clear=(x,y,z,step=0)=>!geometry||y>-30||geometry.clear(x,y,z,.4,step);
  function floorAt(x,z,{y=0,liftY=ACCESS.top,hatchOpen=false,bridgeStage=0}={}) {
    const entry=accessFloor(x,z,{y,liftY,hatchOpen});if(entry!==undefined)return entry;
    if(y>-2)return Math.hypot(x,z)<240?terrainHeight(x,z):null;
    const room=chamberAt(plan,x,z);
    if(room?.kind==='platforms'){const surfaces=[...room.platforms,...(room.bridges||[]).slice(0,bridgeStage)];return surfaces.filter(([a,b,c,d,top])=>x>=a&&x<=b&&z>=c&&z<=d&&top<=y+.45).reduce((best,p)=>best===null?p[4]:Math.max(best,p[4]),null);}
    const lookout=generatorFloor(plan.generator,x,z,y);if(lookout!==null)return lookout;
    const landing=plan.routeLandings.find(p=>Math.abs(x-p[0])<=2&&Math.abs(z-p[2])<=2&&Math.abs(y-p[1])<.4);if(landing)return landing[1];
    const levels=plan.routes.map(r=>routeFloor(r,x,z)).filter(h=>h!==null&&Math.abs(h-y)<.8);
    if(levels.length)return levels.sort((a,b)=>Math.abs(a-y)-Math.abs(b-y))[0];
    if(Math.abs(y-DECK)>.8)return null;
    if(Math.abs(x)<=2&&Math.abs(z)<=2)return DECK;
    if(obliqueFloor(plan.oblique,x,z))return DECK;
    if(serviceAt(plan.service,x,z))return DECK;
    if(plan.walkways.some(([x0,x1,z0,z1])=>x>x0&&x<x1&&z>z0&&z<z1))return DECK;
    if(plan.chambers.some(c=>c.walkways.some(([x0,x1,z0,z1])=>x>=x0&&x<=x1&&z>=z0&&z<=z1)))return DECK;
    return null;
  }
  function canStand(x,z,state,radius=.3) {
    if(!clear(x,state.y,z,.25))return false;
    if(state.y<-2)for(const f of plan.fragments)if(f.value===1&&state.y<f.pos[1]+.8&&state.y+1.9>f.pos[1]){
      const dx=x-f.pos[0]-1.25,dz=z-f.pos[2]-1.35;if(Math.abs(dx)<.6+radius&&Math.abs(dz)<.6+radius)return false;
    }
    if(state.y<-2)for(const o of plan.utility.equipment){const [a,b,c,d,lo,hi]=o.bounds;if(state.y+1.9>lo&&state.y<hi&&x+radius>a&&x-radius<b&&z+radius>c&&z-radius<d)return false;}
    if(state.y>ACCESS.top-.5&&state.y<-.6&&((x+radius>2.4&&z+radius>4.6&&z-radius<7.4)||(x-radius< -2.5&&z+radius>2.65&&z-radius<5.35)))return false;
    const floor=floorAt(x,z,state); if(floor===null||Math.abs(floor-state.y)>.42)return false;
    for(let i=0;i<12;i++) {
      const a=i*Math.PI/6,f=floorAt(x+Math.cos(a)*radius,z+Math.sin(a)*radius,state);
      if(f===null||Math.abs(f-floor)>.42)return false;
    }
    return true;
  }
  function canFloat(x,y,z,radius=.42) {
    const room=plan.chambers.find(c=>c.kind==='zero-g');if(!room)return false;const [x0,x1,z0,z1]=room.bounds;
    if(y<DECK||y+1.9>room.ceiling)return false;
    // Only the low doorway opens through the chamber shell. Floating above it
    // cannot switch the character back to walking or snap them down to the floor.
    for(let i=0;i<12;i++) {
      const a=i*Math.PI/6,px=x+Math.cos(a)*radius,pz=z+Math.sin(a)*radius;
      if(px>=x0&&px<=x1&&pz>=z0&&pz<=z1)continue;
      if(px<x0&&px>=x0-2&&Math.abs(pz-room.door[1])<=1.85&&y<=DECK+.18)continue;
      return false;
    }
    // Suspended blocks use spherical clearance envelopes, including their slow rotation.
    for(const o of room.obstacles){const cy=Math.max(y+.42,Math.min(y+1.48,o.center[1]));if(Math.hypot(x-o.center[0],cy-o.center[1],z-o.center[2])<o.radius+radius)return false;}
    return clear(x,y,z);
  }
  function canTraverse(x,y,z,room,radius=.42){
    if(y+1.9>room.ceiling)return false;
    const [a,b,c,d]=room.bounds;
    // Capsule stays in the chamber except through its low entrance.
    for(let i=0;i<12;i++){const angle=i*Math.PI/6,px=x+Math.cos(angle)*radius,pz=z+Math.sin(angle)*radius;if(px>=a&&px<=b&&pz>=c&&pz<=d)continue;if(px<a&&px>=a-2&&Math.abs(pz-room.door[1])<=1.85&&Math.abs(y-DECK)<.2)continue;return false;}
    return clear(x,y,z);
  }
  function floorBelow(x,z,y,state){
    if(y>-.6)return floorAt(x,z,{...state,y:0});
    if(y>ACCESS.top-.5)return floorAt(x,z,{...state,y:ACCESS.top});
    const candidates=[DECK,...plan.routes.map(r=>routeFloor(r,x,z)).filter(h=>h!==null),...plan.chambers.flatMap(c=>(c.platforms||[]).map(p=>p[4]))];
    return candidates.filter(h=>h<=y+.05).sort((a,b)=>b-a).map(h=>floorAt(x,z,{...state,y:h})).find(h=>h!==null&&h<=y+.05)??null;
  }
  function ceilingAt(x,y,z){
    if(y>-.6)return Infinity;
    if(y>ACCESS.top-.5)return -.38;
    const c=chamberAt(plan,x,z);if(c)return c.ceiling;
    const r=serviceAt(plan.service,x,z)||plan.oblique.regions.find(r=>insidePolygon(r.polygon,x,z));
    if(r)return DECK+r.height;
    const route=plan.routes.find(r=>r.covered&&routeFloor(r,x,z)!==null);if(route)return routeFloor(route,x,z)+3.5;
    return plan.reservoir.ceiling;
  }
  function canJumpMove(x,y,z,state){
    const c=chamberAt(plan,x,z);
    if(c?.kind==='platforms')return canTraverse(x,y,z,c);
    const floor=floorBelow(x,z,y,state);if(floor===null)return false;
    return clear(x,y,z)&&canStand(x,z,{...state,y:floor},.42)&&y+1.9<=ceilingAt(x,y,z)+.001;
  }
  return {setGeometry(value){geometry=value;},floorAt,floorBelow,ceilingAt,canJumpMove,canStand,canFloat,canTraverse};

}
