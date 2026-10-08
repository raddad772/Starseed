// Seeded local infrastructure prototype. World generation and walking consume the same plan.
import { Rng, normalizeSeed } from '../core/rng.js';

export const TILE = 4;
export const DECK = -28;
export const key = (x, z) => `${x},${z}`;
export function generateUnderstructure(seed = 'SUMP-07') {
  seed = normalizeSeed(seed) || 'SUMP-07';
  const rng = Rng.fromString(`understructure-v1:${seed}`);
  const tiles = new Map(), rooms = [], edges = [];
  const carve = (x,z,region='conduit') => { if (!tiles.has(key(x,z))) tiles.set(key(x,z), {x,z,region}); };
  const line = (a,b) => {
    let x=a[0],z=a[1]; carve(x,z);
    while(x!==b[0]) {x+=Math.sign(b[0]-x);carve(x,z);}
    while(z!==b[1]) {z+=Math.sign(b[1]-z);carve(x,z);}
  };
  // The shaft and initial passage align with the actual hole in the surface mesh.
  for(let z=0;z>=-7;z--) carve(0,z,'access');
  const kinds = ['Valve basement','Cable exchange','Storm collector','Filter annex','Service archive'];
  for(let row=0;row<4;row++) for(let col=0;col<5;col++) {
    const x=(col-2)*6,z=-7-row*6,id=row*5+col;
    const rx=rng.int(1,2),rz=rng.int(1,2);
    const room={id,x,z,rx,rz,kind:kinds[rng.int(0,kinds.length-1)],code:`${String(row+1).padStart(2,'0')}/${String(rng.int(100,899))}`};
    rooms.push(room);
    for(let a=-rx;a<=rx;a++)for(let b=-rz;b<=rz;b++)carve(x+a,z+b,`room:${id}`);
  }
  // Connected spanning tree with extra circuits. Every room is reachable; each seed changes routes.
  const visited=new Set([2]),stack=[2];
  while(stack.length) {
    const a=stack.at(-1),c=a%5,r=Math.floor(a/5);
    const candidates=[];
    if(c>0)candidates.push(a-1);if(c<4)candidates.push(a+1);if(r>0)candidates.push(a-5);if(r<3)candidates.push(a+5);
    const options=candidates.filter(n=>!visited.has(n));
    if(!options.length){stack.pop();continue;}
    const b=rng.pick(options);visited.add(b);stack.push(b);edges.push([a,b]);
  }
  for(const room of rooms)for(const b of [room.id%5<4?room.id+1:-1,room.id<15?room.id+5:-1]) {
    if(b>=0&&!edges.some(([x,y])=>(x===room.id&&y===b)||(y===room.id&&x===b))&&rng.chance(.3))edges.push([room.id,b]);
  }
  for(const [a,b] of edges)line([rooms[a].x,rooms[a].z],[rooms[b].x,rooms[b].z]);
  // An intentional trunk route makes the huge reservoir a discoverable landmark.
  line([0,-7],[0,-30]);
  const walls=[];
  for(const t of tiles.values())for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]) {
    if(tiles.has(key(t.x+dx,t.z+dz)))continue;
    if(t.x===0&&t.z===-30&&dz===-1)continue;
    walls.push({x:t.x*TILE+dx*TILE/2,z:t.z*TILE+dz*TILE/2,axis:dx?'z':'x',region:t.region});
  }
  const samples=[
    {id:'intake',pos:[0,DECK,-20],title:'An occupied frequency',text:'The access circuit draws power in eleven-second intervals. The pulse continues far below the surveyed level.'},
    {id:'archive',pos:[24,DECK,-52],title:'Maintenance without occupants',text:'Replacement filters are stacked beside a live return line. None of the fittings match the dimensions of the doors.'},
    {id:'reservoir',pos:[0,DECK,-264],title:'A reservoir with no catchment',text:'The water is flowing toward the surface. No intake, watershed or active weather system accounts for its volume.'},
  ];
  return {version:1,seed,tiles:[...tiles.values()],walls,rooms,edges,samples,
    deck:DECK,shaft:{min:[-2,-2],max:[2,2]},reservoir:{x:64,near:-122,far:-286,bottom:-68,water:-53,ceiling:-6},
    walkways:[[-2,2,-286,-120],[-64,64,-126,-122],[-64,64,-286,-282],[-64,-60,-286,-122],[60,64,-286,-122],[-64,64,-206,-202]],
    spawn:[0,0,12]};
}

export function terrainHeight(x,z) {
  const r=Math.hypot(x,z),blend=Math.max(0,Math.min(1,(r-14)/70));
  return blend*blend*(5+3*Math.sin(x*.035)+4*Math.cos(z*.025)+2*Math.sin((x+z)*.067));
}

export function makeCollision(plan) {
  const occupied=new Set(plan.tiles.map(t=>key(t.x,t.z)));
  function floorAt(x,z,{y=0,liftY=0,hatchOpen=false}={}) {
    const shaft=Math.abs(x)<2&&Math.abs(z)<2;
    if(shaft) {
      if(!hatchOpen&&y>-2)return 0;
      return Math.abs(y-liftY)<.8?liftY:null;
    }
    if(y>-2)return Math.hypot(x,z)<240?terrainHeight(x,z):null;
    if(Math.abs(y-DECK)>.8)return null;
    if(occupied.has(key(Math.floor((x+2)/TILE),Math.floor((z+2)/TILE))))return DECK;
    if(plan.walkways.some(([x0,x1,z0,z1])=>x>x0&&x<x1&&z>z0&&z<z1))return DECK;
    return null;
  }
  function canStand(x,z,state,radius=.3) {
    const floor=floorAt(x,z,state); if(floor===null||Math.abs(floor-state.y)>.42)return false;
    for(let i=0;i<12;i++) {
      const a=i*Math.PI/6,f=floorAt(x+Math.cos(a)*radius,z+Math.sin(a)*radius,state);
      if(f===null||Math.abs(f-floor)>.42)return false;
    }
    return true;
  }
  return {floorAt,canStand};
}
