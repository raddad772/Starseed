import * as THREE from 'three';
import { DECK,TILE } from './layout.js';

export function dressUtilities(plan,{box,cylinder,label,lamp}){
  for(const r of plan.rooms){
    const x=r.x*TILE,z=r.z*TILE,rx=r.rx*TILE+1.6,rz=r.rz*TILE+1.6;
    if(r.kind==='Unassigned room'){box(x,DECK+.006,z,rx*1.4,.01,rz*.8,'stain');continue;}
    const count=r.kind.includes('manifold')?2:1+(r.id%3),radius=r.kind.includes('manifold')?.95:.22+(r.id%3)*.13;
    for(let i=0;i<count;i++){
      const px=x+(i-(count-1)/2)*(radius*2+.5),y=DECK+3.15;
      cylinder([px,y,z-rz],[px,y,z+rz],radius,'rust',12);
      for(let zz=z-rz+.5;zz<z+rz;zz+=3.6){cylinder([px,y,zz-.08],[px,y,zz+.08],radius+.08,'metal',12);box(px,DECK+4,zz,radius*2+.3,.1,.12,'metal');}
    }
    if(r.utility){label(r.code,x,DECK+2.6,z-rz+.12,{size:.4,color:'#878d7d'});lamp(x,DECK+3.9,z,'amber');}
    // Damp tide marks, disconnected conduit and blank equipment pads are not pickups.
    box(x-rx+.15,DECK+.018,z+rz-1,1.3,.025,1.5,'stain');
    if(r.id%3===0)box(x+rx-1,DECK+.018,z-rz+1,1.3,.025,1.5,'stain');
    if(r.id%4===0){cylinder([x-rx+.6,DECK+2.7,z-rz],[x-rx+.6,DECK+2.7,z-1.5],.13,'dark');}
  }
  for(const o of plan.utility.equipment){const [a,b,c,d,lo,hi]=o.bounds,x=(a+b)/2,z=(c+d)/2;
    box(x,lo+.12,z,b-a,.24,d-c,'concrete');
    if(o.kind==='pump'){cylinder([x,lo+.24,z],[x,hi,z],.85,'metal',12);cylinder([x,hi-.1,z],[x,hi,z],1,'rust',12);}
    else{box(x,(lo+hi)/2,z,b-a,hi-lo,d-c,'metal');for(let y=lo+.45;y<hi;y+=.4)box(x,y,d+.015,b-a-.2,.035,.02,'rust');}
  }
}

// Make actual rectangular openings in the reservoir walls where the covered
// galleries leave and return. No coincident filler wall remains in a doorway.
export function collectionSideWall(plan,side,{box}){
  const R=plan.reservoir,holes=[];
  for(const r of plan.routes){const a=r.a,b=r.b,x=side*64;if((a[0]-x)*(b[0]-x)<0&&a[2]===b[2])holes.push({z:a[2],y:a[1]});}
  const zs=[R.far,R.near,...holes.flatMap(h=>[h.z-2.2,h.z+2.2])].sort((a,b)=>a-b);
  for(let i=1;i<zs.length;i++){const z=(zs[i-1]+zs[i])/2,d=zs[i]-zs[i-1];if(d<.001)continue;const cut=holes.filter(h=>Math.abs(z-h.z)<2.2).sort((a,b)=>a.y-b.y);let low=R.bottom;
    for(const h of [...cut,{y:R.ceiling,terminal:true}]){if(h.y>low)box(side*64.4,(low+h.y)/2,z,.8,h.y-low,d);low=h.y+(h.terminal?0:3.6);}
  }
}

export function buildCollectionRoutes(plan,{root,mat,box,cylinder,label,lamp}){
  function panel(points,material){const g=new THREE.BufferGeometry(),v=[];for(const i of [0,2,1,0,3,2,0,1,2,0,2,3])v.push(...points[i]);g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.computeVertexNormals();const uv=[];for(let i=0;i<v.length;i+=3)uv.push((v[i]+v[i+2])/3,v[i+1]/3);g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));root.add(new THREE.Mesh(g,mat[material]));}
  function strip(a,b,width,offset,material){
    const dx=b[0]-a[0],dz=b[2]-a[2],length=Math.hypot(dx,dz),nx=-dz/length*width/2,nz=dx/length*width/2;
    panel([[a[0]+nx,a[1]+offset,a[2]+nz],[b[0]+nx,b[1]+offset,b[2]+nz],[b[0]-nx,b[1]+offset,b[2]-nz],[a[0]-nx,a[1]+offset,a[2]-nz]],material);
  }
  // Mitered corridor boundaries seal bends without a wall across the walking line.
  const groups=[];for(const r of plan.routes){if(!r.covered)continue;const last=groups.at(-1);if(last&&last.at(-1).b===r.a)last.push(r);else groups.push([r]);}
  for(const group of groups){const pts=[group[0].a,...group.map(r=>r.b)],norms=group.map(r=>{const dx=r.b[0]-r.a[0],dz=r.b[2]-r.a[2],len=Math.hypot(dx,dz);return [-dz/len,dx/len];});
    for(const side of [-1,1]){const edge=pts.map((p,i)=>{const a=norms[Math.max(0,i-1)],b=norms[Math.min(i,norms.length-1)],k=2.2*side/(1+a[0]*b[0]+a[1]*b[1]);return [p[0]+(a[0]+b[0])*k,p[1],p[2]+(a[1]+b[1])*k];});for(let i=1;i<edge.length;i++){const a=edge[i-1],b=edge[i];panel([a,b,[b[0],b[1]+3.5,b[2]],[a[0],a[1]+3.5,a[2]]],'concrete');}}
    for(const p of [pts[0],pts.at(-1),...pts.filter((p,i)=>i>0&&i<pts.length-1&&Math.abs(norms[i][0]-norms[i-1][0])+Math.abs(norms[i][1]-norms[i-1][1])>.1)])box(p[0],p[1]+3.55,p[2],4.5,.1,4.5,'concrete');
  }
  for(const p of plan.routeLandings)box(p[0],p[1]-.17,p[2],4,.3,4,'floor');
  for(const r of plan.routes){
    const {a,b,width,covered}=r,dx=b[0]-a[0],dz=b[2]-a[2],length=Math.hypot(dx,dz),nx=-dz/length,nz=dx/length;
    strip(a,b,width,-.04,covered?'floor':'metal');strip(a,b,width,-.3,'metal');
    if(covered)strip(a,b,width+1,3.5,'concrete');
    for(const side of [-1,1]){
      if(!covered){
        // Rail ends stop short of junctions so the walking route is visibly open.
        const inset=2.5/length;
        for(const h of [.55,1.1]){
          const start=[a[0]+dx*inset+nx*side*1.9,a[1]+h,a[2]+dz*inset+nz*side*1.9],end=[b[0]-dx*inset+nx*side*1.9,b[1]+h,b[2]-dz*inset+nz*side*1.9];
          // The optional fault bridge joins the north edge of the highest crossing.
          if(a[2]===-268&&b[2]===-268&&side===-1){cylinder(start,[-2.4,start[1],start[2]],.045,'rust');cylinder([2.4,end[1],end[2]],end,.045,'rust');}
          else cylinder(start,end,.045,'rust');
        }
      }
      const n=Math.ceil(length/5);for(let i=1;i<n;i++){const t=i/n,x=a[0]+dx*t+nx*side*1.9,z=a[2]+dz*t+nz*side*1.9,y=a[1]+(b[1]-a[1])*t;if(!covered&&!(a[2]===-268&&side===-1&&Math.abs(x)<2.5))cylinder([x,y,z],[x,y+1.1,z],.04,'metal');}
    }
    const n=Math.ceil(length/7);for(let i=1;i<n;i++){const t=i/n,x=a[0]+dx*t,z=a[2]+dz*t,y=a[1]+(b[1]-a[1])*t;
      if(covered){lamp(x,y+3.35,z,'amber');cylinder([x+nx*1.55,y+2.8,z+nz*1.55],[x+dx/n+nx*1.55,y+(b[1]-a[1])/n+2.8,z+dz/n+nz*1.55],.18,'rust');}
      else {for(const side of [-1,1])if(!(a[2]===-268&&Math.abs(x)<2.5))cylinder([x+nx*side*2.2,y-.2,z+nz*side*2.2],[x+nx*side*2.2,plan.reservoir.ceiling,z+nz*side*2.2],.055,'metal');lamp(x+nx*2.2,y+2.8,z+nz*2.2,'cyan');}
    }
    if(covered&&a[1]!==b[1]){
      // Shallow stair nosings read as an old service stair; the capsule uses a ramp.
      const steps=Math.ceil(Math.abs(b[1]-a[1])/.2);for(let i=1;i<steps;i++){const t=i/steps,p=[a[0]+dx*t,a[1]+(b[1]-a[1])*t+.015,a[2]+dz*t];cylinder([p[0]+nx*1.9,p[1],p[2]+nz*1.9],[p[0]-nx*1.9,p[1],p[2]-nz*1.9],.018,'metal');}
    }
  }
  for(const [i,r] of plan.routes.filter(r=>!r.covered).entries())label(`COLLECTION / SERVICE ${i+2}`,r.b[0]-3,r.b[1]+2.2,r.b[2]+1.8,{size:.45,face:Math.PI,color:'#a0a994'});
}
