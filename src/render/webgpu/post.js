import * as THREE from 'three';

const U = (values) => Object.fromEntries(Object.entries(values).map(([k,value])=>[k,{value}]));
export class PostPass {
  constructor(device, passes, textures, air) { Object.assign(this, {device, passes, textures, air}); }
  targets(t) {
    if (t.post) return t.post;
    const make = (label, width, height, mipLevelCount = 1) => {
      const texture = this.device.createTexture({ label, size: [width,height], format: 'rgba16float', mipLevelCount,
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_SRC });
      t.textures.push(texture);
      return { gpuEntry: true, texture, width, height, view: texture.createView(), sampler: this.textures.mipLinear };
    };
    const p = { lum: make('metered luminance',128,128,8), adapt:[make('exposure A',1,1),make('exposure B',1,1)], idx:0, reset:true, down:[], up:[], owners:new Map(), output:{gpuEntry:true,texture:t.output,view:t.output.createView(),sampler:this.textures.linear}, exposure:1 };
    let w=t.width>>1,h=t.height>>1;
    for(let i=0;i<6 && w>=8 && h>=8;i++,w>>=1,h>>=1){p.down.push(make('bloom down '+i,w,h));p.up.push(make('bloom up '+i,w,h));}
    t.post=p;return p;
  }
  draw(name, target, values, p) { this.passes.draw(name,target,U(values),[target]); if(!p.owners.has(name))p.owners.set(name,new Set());p.owners.get(name).add(target); }
  render(engine,t,hdr) {
    this.air.targets(t);
    // AirPass prepares this depth copy even for an airless view.
    const p=this.targets(t),v=engine.view,src=this.air.entry(hdr);
    const common={uDepthMode:0,uNear:v.camera.near,uFar:v.camera.far,uLogDepthFC:Math.log2(v.camera.far+1)};
    this.draw('luminance',p.lum,{...common,tColor:src,tDepth:t.sampledDepth,uRef:v.meterRef,uNearCut:v.meterNearCut||0},p);
    this.textures.generateMips(p.lum.texture,'rgba16float',8,1);
    const previous=p.adapt[p.idx],next=p.adapt[1-p.idx];
    this.draw('adapt',next,{tLum:p.lum,tPrev:previous,uDt:Math.min(engine.frameInputs?.dt||0,0.25),uLevel:7,uReset:p.reset||v.adaptReset?1:0,uRef:v.meterRef,uUp:engine.meterUp,uDown:engine.meterDown,uStrength:engine.meterStrength},p);
    p.idx=1-p.idx;p.reset=false;v.adaptReset=false;
    let bloom=next,bloomStrength=0;
    if(p.down.length && engine.bloomStrength>0){
      const size=new THREE.Vector2(1/t.width,1/t.height);
      this.draw('bright',p.down[0],{tColor:src,tAdapt:next,uNightShift:v.nightShift||0,uKey:0.18,uMinExp:engine.minExposure,uMaxExp:v.maxExposure,uTexel:size},p);
      for(let i=1;i<p.down.length;i++){const s=p.down[i-1];this.draw('bloomdown',p.down[i],{tSrc:s,uTexel:new THREE.Vector2(1/s.width,1/s.height)},p);}
      bloom=p.down.at(-1);
      for(let i=p.down.length-2;i>=0;i--){this.draw('bloomup',p.up[i],{tSrc:bloom,tBase:p.down[i],uTexel:new THREE.Vector2(1/bloom.width,1/bloom.height),uRadius:1},p);bloom=p.up[i];}
      bloomStrength=engine.bloomStrength*0.06;
    }
    const output=p.output;
    this.draw('tonemap',output,{tColor:src,tBloom:bloom,tAdapt:next,toneMappingExposure:1,uKey:0.18,uMinExp:engine.minExposure,uMaxExp:v.maxExposure,
      uExposureBias:v.exposureBias,uBloom:bloomStrength,uWhiteBalance:engine.whiteBalance,uNightShift:v.nightShift||0,uTime:engine.time,
      uVignette:engine.vignette+(v.radialBlur||0)*0.4,uFlash:v.flash,uRadial:v.radialBlur||0,uEncode:1,uContrast:engine.toneMat.uniforms.uContrast.value,uToneCurve:engine.toneCurve==='aces'?0:1},p);
    // Poll a tiny readback for the debug HUD. Adaptation itself stays entirely on GPU.
    if(!p.pending && performance.now()-(p.lastRead||0)>300){p.lastRead=performance.now();p.pending=true;this.readExposure(next.texture,p,v,engine.minExposure).catch(()=>{}).finally(()=>{p.pending=false;});}
    return output;
  }
  async readExposure(texture,p,view,minExposure){
    const b=this.device.createBuffer({size:256,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ});
    try{const e=this.device.createCommandEncoder();e.copyTextureToBuffer({texture},{buffer:b,bytesPerRow:256},[1,1]);this.device.queue.submit([e.finish()]);await b.mapAsync(GPUMapMode.READ);
      const log=THREE.DataUtils.fromHalfFloat(new Uint16Array(b.getMappedRange())[0]);
      p.exposure=Math.min(view.maxExposure,Math.max(minExposure,0.18/2**log));b.unmap();
    }finally{b.destroy();}
  }
  release(t){if(t.post)for(const [name,owners] of t.post.owners)for(const owner of owners)this.passes.names.get(name).bindings.release(owner);}
}
