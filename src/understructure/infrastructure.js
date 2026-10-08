// Ordinary, often unrewarding infrastructure. Forked streams keep the original
// service grid and puzzles stable when dressing or optional branches change.
export function addUtilityAnnex({rooms,carve,line,rng,tile,deck}){
  const specs=[[-10,5,2,2,'Return manifold'],[-4,5,1,1,'Unassigned room'],[4,5,1,2,'Cable basement'],[10,5,2,2,'Bypass manifold'],[-14,10,1,1,'Blind inspection stub'],[10,11,1,1,'Abandoned filter store']];
  const annex=[];
  for(const [x,z,rx,rz,kind] of specs){const id=rooms.length,r={id,x,z,rx,rz,kind,code:`R/${rng.int(100,899)}`,utility:true};rooms.push(r);annex.push(id);for(let a=-rx;a<=rx;a++)for(let b=-rz;b<=rz;b++)carve(x+a,z+b,`room:${id}`);}
  for(const route of [[[-6,-7],[-6,-1],[-10,-1],[-10,5],[-4,5],[4,5],[10,5],[10,-1],[6,-1],[6,-7]],[[-10,5],[-10,10],[-14,10]],[[10,5],[10,11]]])for(let i=1;i<route.length;i++)line(route[i-1],route[i]);
  const equipment=[];
  for(const id of annex){const r=rooms[id],x=r.x*tile,z=r.z*tile;
    if(r.kind==='Unassigned room')continue;
    for(const side of [-1,1]){
      // Corner machinery leaves both crossing aisles and every doorway clear.
      const px=x+side*(r.rx*tile-.6),pz=z+r.rz*tile-.7;
      equipment.push({room:id,bounds:[px-1.1,px+1.1,pz-1.05,pz+1.05,deck,deck+1.9],kind:r.kind.includes('manifold')?'pump':'cabinet'});
    }
  }
  return {annex,equipment};
}
export function reservoirRoutes(deck){
  const points=[[-62,deck,-204],[-72,deck,-204],[-72,deck+12,-174],[-62,deck+12,-174],[62,deck+12,-174],[72,deck+12,-174],[72,deck+26,-224],[62,deck+26,-224],[-62,deck+26,-224],[-72,deck+26,-224],[-72,deck+42,-268],[-62,deck+42,-268],[62,deck+42,-268]];
  const routes=[];const add=(a,b)=>routes.push({id:'collection-route-'+routes.length,a,b,width:4,covered:Math.abs(a[0])>64||Math.abs(b[0])>64});
  for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i];if(a[1]===b[1])add(a,b);else{const n=Math.hypot(b[0]-a[0],b[2]-a[2]),f=2.4/n,c=[a[0]+(b[0]-a[0])*f,a[1],a[2]+(b[2]-a[2])*f],d=[b[0]-(b[0]-a[0])*f,b[1],b[2]-(b[2]-a[2])*f];add(a,c);add(c,d);add(d,b);}}
  return routes;
}
export function routeFloor(route,x,z){const dx=route.b[0]-route.a[0],dz=route.b[2]-route.a[2],n=dx*dx+dz*dz,t=((x-route.a[0])*dx+(z-route.a[2])*dz)/n;
  if(t<-.001||t>1.001)return null;const clamped=Math.max(0,Math.min(1,t));if(Math.hypot(x-route.a[0]-dx*clamped,z-route.a[2]-dz*clamped)>route.width/2)return null;
  return route.a[1]+(route.b[1]-route.a[1])*clamped;
}
export function dataFragments(deck){
  const entries=[[-56,deck,40,1],[40,deck,44,3],[-16,deck,20,1],[-48,deck,-76,3],[48,deck,-76,3],[-24,deck,-100,1],[24,deck,-100,3],[-24,deck,-28,3],[48,deck+12,-174,3],[-48,deck+26,-224,3],[-72,deck+12,-174,3],[72,deck+26,-224,3],[-72,deck+42,-268,3],[-40,deck,20,1]];
  return [{id:'entry-signal',pos:[0,deck,-12],value:1,title:'Damaged survey crawler signal',automatic:true},...entries.map(([x,y,z,value],i)=>({id:'fragment-'+i,pos:[x,y,z],value,title:value===1?'Maintenance crawler log':i<8?'Maintenance memory fragment':'Relay buffer fragment'}))];
}
