import { Rng } from '../core/rng.js';

// Visit graph first; repeated visits reference one physical volume at distinct
// elevations. Room footprints and connecting spans are compiled from this plan.
export function traversalGraph(seed,themes,deck){
 const rng=Rng.fromString(seed).fork('traversal-graph'),vertical=themes.includes('gravity'),returnX=rng.pick([-16,-20]);
 const volumes=[
  {id:'intake-hall',name:'INTAKE MACHINERY VOLUME',center:[0,-42],sides:6,rx:39,rz:29,height:32},
  {id:'lower-exchange',name:'RETURN MACHINERY VOLUME',center:[0,-96],sides:6,rx:36,rz:26,height:30},
  {id:'blind-stub',name:'BLIND INSPECTION BREACH',center:[-56,40],sides:5,rx:8,rz:8,height:7},
 ];
 const visits=[{id:'entry',volume:'excavation-staging',height:0},{id:'intake-lower',volume:'intake-hall',height:0}];
 if(vertical)visits.push({id:'shaft-ascent',volume:'null',height:12},{id:'broken-crossing',volume:'low',height:16.8},{id:'intake-upper',volume:'intake-hall',height:16.8},{id:'return-upper',volume:'return-shaft',height:18.6});
 visits.push({id:'return-lower',volume:'lower-exchange',height:0},{id:'collection',volume:'reservoir',height:0},{id:'record',volume:'reservoir',height:42});
 const edges=visits.slice(1).map((v,i)=>({from:visits[i].id,to:v.id,mode:v.id==='shaft-ascent'?'zero-g-ascent':v.id==='broken-crossing'?'low-gravity-jumps':v.id==='return-lower'&&vertical?'zero-g-descent':'squeeze',heightChange:v.height-visits[i].height}));
 const highRoutes=[];
 if(vertical){
  highRoutes.push({id:'intake-upper-crossing',a:[12,deck+16.8,-52],b:[returnX,deck+16.8,-52],width:4,covered:false});
  const seam=[[returnX,deck+16.8,-52],[returnX,deck+16.8,-56],[returnX,deck+18.6,-92],[returnX,deck+18.6,-96]];
  for(let i=1;i<seam.length;i++)highRoutes.push({id:i===1?'upper-pressure-seam':'upper-pressure-seam-'+i,a:seam[i-1],b:seam[i],width:4,covered:true,smoothGrade:true,bank:i===2?.12:0});
 }

 return {vertical,volumes,visits,edges,highRoutes,returnX};
}
