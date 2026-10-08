import * as THREE from 'three';
import { Rng } from '../core/rng.js';
import { outsideSegments } from './oblique.js';
import { surfacePixels } from './decay.js';

export function decayMaps(seed,kind){
  const pixels=surfacePixels(seed,kind),maps={};
  for(const [key,data] of Object.entries(pixels))if(key!=='size'){
    const t=new THREE.DataTexture(data,pixels.size,pixels.size);t.name='survey '+kind+' '+key;
    t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;t.anisotropy=4;
    t.colorSpace=key==='color'?THREE.SRGBColorSpace:THREE.NoColorSpace;t.needsUpdate=true;
    maps[key==='color'?'map':key==='normal'?'normalMap':'roughnessMap']=t;
  }
  return maps;
}

export function buildDecayDetails(plan,{addGeometry}){
  const rng=Rng.fromString(plan.seed).fork('structural-decay-v1'),wet=plan.generator.environment.wet,y=plan.deck;
  const stats={bands:0,streaks:0,flakes:0,wet};
  function wall(a,b,height){
    const dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);if(len<.7)return;
    const tangent=[dx/len,dz/len],normal=[-tangent[1],tangent[0]];
    function band(side,start,width,top,bottom,material){
      const steps=Math.max(3,Math.ceil(width/.65)),verts=[],colors=[],dripping=bottom>0;
      // Use the wall's exact world UVs and normal response. The white edges
      // match the underlying concrete; tinted vertices feather stains into it.
      const tint=new THREE.Color({damp:'#839184',dust:'#ccc7b5',runoff:'#b69d80',mineral:'#e4ddc9'}[material]);
      const point=(s,h)=>[a[0]+tangent[0]*s+normal[0]*side*({damp:.008,dust:.008,runoff:.014,mineral:.02}[material]),y+h,a[1]+tangent[1]*s+normal[1]*side*({damp:.008,dust:.008,runoff:.014,mineral:.02}[material])];
      const rows=dripping?3:2;
      const column=i=>{
        const u=i/steps,high=dripping?top:Math.max(bottom+.05,top*rng.range(.65,1));
        const low=dripping?bottom+rng.range(0,(top-bottom)*.35):bottom;
        const strength=dripping?Math.sin(u*Math.PI):Math.min(1,u*8,(1-u)*8);
        return Array.from({length:rows},(_,j)=>({p:point(start+width*u,low+(high-low)*j/(rows-1)),c:new THREE.Color(1,1,1).lerp(tint,strength*(dripping?(j===1?1:0):(j===0?1:0)))}));
      };
      let prev=column(0);
      const triangle=(a,b,c)=>{for(const v of [a,b,c]){verts.push(...v.p);colors.push(v.c.r,v.c.g,v.c.b);}};
      for(let i=1;i<=steps;i++){
        const next=column(i);
        for(let j=0;j<rows-1;j++){
          if(side>0){triangle(prev[j+1],prev[j],next[j+1]);triangle(next[j+1],prev[j],next[j]);}
          else{triangle(prev[j+1],next[j+1],prev[j]);triangle(next[j+1],next[j],prev[j]);}
        }
        prev=next;
      }
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.computeVertexNormals();addGeometry(g,'weathered');
    }
    for(const side of [1]){
      if(rng.chance(.82)){band(side,.08,len-.16,wet?rng.range(.25,1.15):rng.range(.1,.32),-.012,wet?'damp':'dust');stats.bands++;}
      if(wet&&rng.chance(.58)){
        const width=Math.min(len*.65,rng.range(.3,1.2)),start=rng.range(.05,Math.max(.05,len-width-.05));
        band(side,start,width,height-.12,height*rng.range(.18,.42),'runoff');stats.streaks++;
        if(rng.chance(.4))band(side,start+.03,width*.2,height-.2,height*.58,'mineral');
      }
      // Small spalled chips stay at the wall foot, below step height.
      if(rng.chance(.5))for(let i=0;i<2;i++){
        const at=rng.range(.2,len-.2),r=rng.range(.045,.13),g=new THREE.IcosahedronGeometry(r,0);
        g.scale(1,.28,1.5);g.rotateY(rng.range(0,6.28));g.translate(a[0]+tangent[0]*at+normal[0]*side*.22,y+.018,a[1]+tangent[1]*at+normal[1]*side*.22);addGeometry(g,'dust');stats.flakes++;
      }
    }
  }
  for(const w of plan.service.walls)wall(w.a,w.b,Math.min(w.height,4)-.2);
  for(const w of plan.oblique.walls)wall(w.a,w.b,Math.min(w.height,4)-.2);
  return stats;
}
