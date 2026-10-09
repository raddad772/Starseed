// The procedural galaxy is baked once on the native device. The seed and all
// uniforms come from Sky; the simulation and random sequence remain unchanged.
export class Background {
  constructor(device,textures,passes){Object.assign(this,{device,textures,passes});this.cubes=new Map();textures.background=this;}
  cube(source){
    // (baked again when the sky's galaxy has moved round it: sky.js placeInGalaxy)
    const version=source.userData.webgpuSky?.version||0;
    let entry=this.cubes.get(source);if(entry&&entry.version===version)return entry;
    if(entry)entry.dispose();
    const size=source.image?.[0]?.width||source.image?.width||1024;
    const mipLevelCount=1+Math.floor(Math.log2(size));
    const texture=this.device.createTexture({label:'galactic background',size:[size,size,6],format:'rgba16float',mipLevelCount,usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING});
    const owner={};
    for(let face=0;face<6;face++)this.passes.draw('galaxy',owner,{...source.userData.webgpuSky.uniforms,uFace:{value:face}},[{texture,renderView:texture.createView({dimension:'2d',baseMipLevel:0,mipLevelCount:1,baseArrayLayer:face,arrayLayerCount:1})}]);
    this.passes.names.get('galaxy').bindings.release(owner);
    this.textures.generateMips(texture,'rgba16float',mipLevelCount,6);
    entry={gpuEntry:true,version,texture,view:texture.createView({dimension:'cube'}),sampler:this.textures.mipLinear};
    entry.dispose=()=>{texture.destroy();this.cubes.delete(source);source.removeEventListener('dispose',entry.dispose);};source.addEventListener('dispose',entry.dispose);this.cubes.set(source,entry);return entry;
  }
  // the sky's star table (sky.js buildStarTable) on the device, made again when the sky rebuilds it;
  // a blank one while there's none
  stars(sky){
    const table=sky?.starTable,N=table?.size||1;
    if(this.starTables&&this.starTables.version===(table?.version||0)&&this.starTables.sky===sky)return this.starTables;
    this.starTables?.dispose();
    const make=(label,data)=>{const texture=this.device.createTexture({label,size:[N,N,6],format:'rgba32float',usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST});
      if(data)this.device.queue.writeTexture({texture},data,{bytesPerRow:N*16,rowsPerImage:N},[N,N,6]);return texture;};
    const a=make('sky star ways',table?.a),b=make('sky star colours',table?.b);
    this.starTables={sky,version:table?.version||0,a:a.createView({dimension:'2d-array'}),b:b.createView({dimension:'2d-array'}),dispose:()=>{a.destroy();b.destroy();}};
    return this.starTables;
  }
  // the infalling gas's density (sim/nebula.js) as a filterable 3D texture, made once; a blank one
  // without it
  gas(g){
    const vol=g?.volume;
    if(this.gasVolume&&this.gasVolume.source===(vol||null))return this.gasVolume;
    this.gasVolume?.texture.destroy();
    // (two channels: its density and the share of the hole's ionizing light reaching it)
    const dims=vol?vol.dims:[1,1,1],texture=this.device.createTexture({label:'infalling gas',size:dims,dimension:'3d',format:'rg16float',usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST});
    if(vol){const n=vol.density.length,half=new Uint16Array(n*2);for(let i=0;i<n;i++){half[i*2]=toHalf(vol.density[i]);half[i*2+1]=toHalf(vol.ionized[i]);}
      this.device.queue.writeTexture({texture},half,{bytesPerRow:dims[0]*4,rowsPerImage:dims[1]},dims);}
    if(!this.gasSampler)this.gasSampler=this.device.createSampler({magFilter:'linear',minFilter:'linear',addressModeU:'clamp-to-edge',addressModeV:'clamp-to-edge',addressModeW:'clamp-to-edge'});
    this.gasVolume={source:vol||null,texture,view:texture.createView({dimension:'3d'}),sampler:this.gasSampler};
    return this.gasVolume;
  }
  // a 1x1 zero texture where an input's missing (the eye's exposure before the first frame)
  get blank(){
    if(!this._blank){const texture=this.device.createTexture({label:'blank',size:[1,1],format:'rgba16float',usage:GPUTextureUsage.TEXTURE_BINDING});this._blank={texture,view:texture.createView()};}
    return this._blank;
  }
  dispose(){for(const e of [...this.cubes.values()])e.dispose();this.gasVolume?.texture.destroy();this.gasVolume=null;this.starTables?.dispose();this.starTables=null;this._blank?.texture.destroy();this._blank=null;}
}

// a float as IEEE half (for the gas volume's r16float texels; its values are 0..1)
const _f32=new Float32Array(1),_u32=new Uint32Array(_f32.buffer);
function toHalf(v){
  _f32[0]=v;const x=_u32[0],sign=(x>>>16)&0x8000;let e=((x>>>23)&0xff)-127+15,m=x&0x7fffff;
  if(e<=0)return sign;if(e>=31)return sign|0x7c00;
  return sign|(e<<10)|(m>>>13);
}
