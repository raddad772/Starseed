import { Rng,hash3f } from '../core/rng.js';

const mix=(a,b,t)=>a+(b-a)*t,clamp=v=>Math.max(0,Math.min(1,v));
// Periodic value noise: the maps wrap without a seam. Separate seed streams keep
// weathering independent of rooms, puzzle placement and recovered data.
function noise(x,y,n,seed){
  const px=x*n,py=y*n,ix=Math.floor(px),iy=Math.floor(py),fx=px-ix,fy=py-iy;
  const u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy),h=(a,b)=>hash3f((a+n)%n,(b+n)%n,0,seed);
  return mix(mix(h(ix,iy),h(ix+1,iy),u),mix(h(ix,iy+1),h(ix+1,iy+1),u),v);
}

export function surfacePixels(seed,kind,size=256){
  const rng=Rng.fromString(seed).fork('decay-map-'+kind),key=rng.u32();
  const color=new Uint8Array(size*size*4),normal=new Uint8Array(color.length),roughness=new Uint8Array(color.length),height=new Float32Array(size*size);
  const metal=kind==='metal'||kind==='rust',floor=kind==='floor';
  const base=metal?[76,96,85]:floor?[99,105,91]:[154,158,137];
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const i=y*size+x,o=i*4,u=x/size,v=y/size;
    const broad=noise(u,v,5,key),mid=noise(u,v,19,key+1),fine=hash3f(x,y,0,key+2),pits=noise(u,v,63,key+3);
    const flake=clamp((broad*.65+mid*.35-.46)*8),oxide=kind==='rust'?Math.max(.5,flake):metal?flake:0;
    const grime=clamp((noise(u,v,3,key+4)-.42)*2.5),grain=(fine-.5)*21+(pits-.5)*28;
    const chipped=mid>.71?18:0;
    for(let c=0;c<3;c++){
      const stone=base[c]*(1-grime*.17)+grain+chipped;
      color[o+c]=mix(stone,[114,76,46][c]+grain,oxide);
    }
    color[o+3]=255;height[i]=metal?(.65-oxide*.25)+(pits-.5)*.12:.5+(pits-.5)*.24+(fine-.5)*.035;
    const rough=metal?mix(.47,.96,oxide):floor?.88:.97;
    roughness[o]=roughness[o+1]=roughness[o+2]=Math.round(255*rough);roughness[o+3]=255;
  }
  function mark(x,y,rgb,depth,radius=1){
    for(let j=-radius;j<=radius;j++)for(let k=-radius;k<=radius;k++){
      if(j*j+k*k>radius*radius)continue;
      const i=((Math.round(y)+j+size)%size)*size+(Math.round(x)+k+size)%size,o=i*4;
      for(let c=0;c<3;c++)color[o+c]=rgb[c];height[i]=depth;
    }
  }
  // Branching fractures and worn scratches, rather than a regular tile grid.
  for(let crack=0;crack<(metal?7:3);crack++){
    let x=rng.int(0,size-1),y=rng.int(0,size-1),a=rng.range(0,Math.PI*2);
    const length=rng.int(size/8,size/2);
    for(let j=0;j<length;j++){
      a+=rng.range(-.09,.09);x+=Math.cos(a);y+=Math.sin(a);
      if(!metal&&!floor)mark(x+1,y+1,[140,141,124],.53,0);
      mark(x,y,metal?[120,111,83]:floor?[65,70,59]:[70,74,61],metal?.57:.33,0);
      if(j%24===0&&!metal){for(let k=0;k<13;k++)mark(x+Math.cos(a+1.1)*k,y+Math.sin(a+1.1)*k,[64,68,52],.24,0);}
    }
  }
  // Normal data is linear, unlike the sRGB albedo. Roughness uses its green channel.
  const at=(x,y)=>height[((y+size)%size)*size+(x+size)%size];
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const o=(y*size+x)*4,dx=(at(x-1,y)-at(x+1,y))*.75,dy=(at(x,y-1)-at(x,y+1))*.75,inv=1/Math.hypot(dx,dy,1);
    normal[o]=(dx*inv*.5+.5)*255;normal[o+1]=(dy*inv*.5+.5)*255;normal[o+2]=(inv*.5+.5)*255;normal[o+3]=255;
  }
  return {size,color,normal,roughness};
}
