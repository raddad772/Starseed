import { Rng } from '../core/rng.js';

const cross=(a,b)=>a[0]*b[1]-a[1]*b[0],sub=(a,b)=>[a[0]-b[0],a[1]-b[1]];
const area=p=>Math.abs(p.reduce((v,a,i)=>v+cross(a,p[(i+1)%p.length]),0))/2;
export const lerp2=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
export function insidePolygon(p,x,z){return p.every((a,i)=>cross(sub(p[(i+1)%p.length],a),[x-a[0],z-a[1]])>=-.00001);}
function half(poly,a,b,side){
  const out=[],edge=sub(b,a),value=p=>cross(edge,sub(p,a))*side;
  for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length],u=value(p),v=value(q);if(u>=-1e-8)out.push(p);if((u>0&&v<0)||(u<0&&v>0))out.push(lerp2(p,q,u/(u-v)));}
  return out;
}
export function intersectPolygon(poly,clip){for(let i=0;i<clip.length&&poly.length>=3;i++)poly=half(poly,clip[i],clip[(i+1)%clip.length],1);return poly;}
export function subtractPolygon(poly,clip){const out=[];for(let i=0;i<clip.length&&poly.length>=3;i++){const a=clip[i],b=clip[(i+1)%clip.length],piece=half(poly,a,b,-1);if(piece.length>=3&&area(piece)>1e-6)out.push(piece);poly=half(poly,a,b,1);}return out;}
export function subtractMany(poly,clips){let pieces=[poly];for(const clip of clips)pieces=pieces.flatMap(p=>subtractPolygon(p,clip));return pieces;}
export function outsideSegments(a,b,clips,outward=0){
  const d=sub(b,a),cuts=[0,1];
  for(const poly of clips)for(let i=0;i<poly.length;i++){const p=poly[i],e=sub(poly[(i+1)%poly.length],p),den=cross(d,e);if(Math.abs(den)<1e-8){if(Math.abs(cross(sub(p,a),d))<1e-6)for(const q of [p,poly[(i+1)%poly.length]]){const t=((q[0]-a[0])*d[0]+(q[1]-a[1])*d[1])/(d[0]*d[0]+d[1]*d[1]);if(t>0&&t<1)cuts.push(t);}continue;}const delta=sub(p,a),t=cross(delta,e)/den,u=cross(delta,d)/den;if(t>0&&t<1&&u>=0&&u<=1)cuts.push(t);}
  cuts.sort((a,b)=>a-b);const result=[];for(let i=1;i<cuts.length;i++){if(cuts[i]-cuts[i-1]<1e-6)continue;const p=lerp2(a,b,(cuts[i]+cuts[i-1])/2);const len=Math.hypot(...d);p[0]+=d[1]/len*outward;p[1]-=d[0]/len*outward;if(!clips.some(c=>insidePolygon(c,...p)))result.push([lerp2(a,b,cuts[i-1]),lerp2(a,b,cuts[i])]);}return result;
}
export const exposedSegments=(a,b,clips)=>outsideSegments(a,b,clips,.0001);
export const rectangle=([a,b,c,d])=>[[a,c],[b,c],[b,d],[a,d]];
export function ribbon(a,b,width){const d=sub(b,a),len=Math.hypot(...d),n=[-d[1]/len*width/2,d[0]/len*width/2];return [[a[0]-n[0],a[1]-n[1]],[b[0]-n[0],b[1]-n[1]],[b[0]+n[0],b[1]+n[1]],[a[0]+n[0],a[1]+n[1]]];}
const regular=(x,z,n,r,angle)=>Array.from({length:n},(_,i)=>[x+Math.cos(angle+i*Math.PI*2/n)*r,z+Math.sin(angle+i*Math.PI*2/n)*r]);

export function obliqueSector(seed,deck,entryPolygon){
  const rng=Rng.fromString(seed).fork('oblique-service-sector-v1'),rooms=[];
  for(const [id,name,x,z,n,r,h] of [['wedge','WEDGE MANIFOLD',-89,46,3,16,6],['pentagon','FIVE-WAY EXCHANGE',-115,88,5,18,8],['hexwell','SIX-SIDED DISTRIBUTION WELL',-157,42,6,24,27]]){
    const angle=rng.range(.08,.3),polygon=regular(x,z,n,r,angle),room={id,name,center:[x,z],polygon,height:h,deck,sides:n};
    room.inner=n===6?polygon.map(p=>lerp2([x,z],p,.85)):null;rooms.push(room);
  }
  const entry={id:'old-stub',center:[-56,40],polygon:entryPolygon||[[-62,34],[-50,34],[-50,46],[-62,46]]};
  const links=[[entry,rooms[0]],[rooms[0],rooms[1]],[rooms[1],rooms[2]],[rooms[2],rooms[0]]].map(([a,b],i)=>({id:'oblique-link-'+i,name:'Oblique service conduit',a:a.center,b:b.center,polygon:ribbon(a.center,b.center,4.4),height:4,deck}));
  const footprints=[entry,...rooms].map(r=>r.polygon),floors=[],bridges=[],walls=[];
  for(const room of rooms){
    if(!room.inner)floors.push({region:room.id,polygon:room.polygon});
    else{
      floors.push(...subtractPolygon(room.polygon,room.inner).map(p=>({region:room.id,polygon:p})));
      for(const angle of [.38,1.51]){
        const a=room.center.map((v,i)=>v+[Math.cos(angle),Math.sin(angle)][i]*-30),b=room.center.map((v,i)=>v+[Math.cos(angle),Math.sin(angle)][i]*30);
        const polygon=intersectPolygon(ribbon(a,b,3.4),room.inner);
        bridges.push({a,b,polygon});
      }
      for(let i=0;i<bridges.length;i++)floors.push(...subtractMany(bridges[i].polygon,bridges.slice(0,i).map(b=>b.polygon)).map(p=>({region:room.id,polygon:p,bridge:true})));
    }
    for(let i=0;i<room.polygon.length;i++)for(const [a,b] of exposedSegments(room.polygon[i],room.polygon[(i+1)%room.polygon.length],links.map(l=>l.polygon)))walls.push({a,b,height:room.height,region:room.id});
  }
  for(const link of links){
    floors.push(...subtractMany(link.polygon,footprints).map(p=>({region:link.id,polygon:p})));
    for(const [i,j] of [[0,1],[2,3]])for(const [a,b] of exposedSegments(link.polygon[i],link.polygon[j],footprints))walls.push({a,b,height:4,region:link.id});
  }
  const points=floors.flatMap(f=>f.polygon),bounds=[Math.min(...points.map(p=>p[0])),Math.max(...points.map(p=>p[0])),Math.min(...points.map(p=>p[1])),Math.max(...points.map(p=>p[1]))];
  return {rooms,links,entry,floors,bridges,walls,bounds,regions:[...rooms,...links]};
}

export function obliqueFloor(sector,x,z){const [a,b,c,d]=sector.bounds;if(x<a||x>b||z<c||z>d)return false;return sector.floors.some(f=>insidePolygon(f.polygon,x,z));}
