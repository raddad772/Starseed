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
  dispose(){for(const e of [...this.cubes.values()])e.dispose();}
}
