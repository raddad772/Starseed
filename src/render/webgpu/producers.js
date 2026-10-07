// Scene resources remain Three descriptors. This adapter records their inputs;
// the raw device owns all rendering and asynchronous CPU copies.
import { shaderKey, snapshotUniforms } from './uniforms.js';
import { passes } from './generated/passes.js';
export class ResourceProducers {
 constructor(engine){this.engine=engine;this.isNativeWebGPU=true;this.domElement=engine.canvas;this.current=null;this.revision=0;this.supported=new Set(passes.map(p=>p.key));this.hashes=new WeakMap();this.capabilities={reversedDepthBuffer:true,getMaxAnisotropy:()=>16};this.shadowMap={enabled:true};this.debug={};}
 setRenderTarget(target){this.current=target;}
 getRenderTarget(){return this.current;}
 setPixelRatio(ratio){this.pixelRatio=ratio;}
 setSize(width,height){this.domElement.width=Math.max(2,Math.floor(width*this.pixelRatio));this.domElement.height=Math.max(2,Math.floor(height*this.pixelRatio));}
 render(scene,camera){
  const target=this.current,material=scene.children[0]?.material;
  if(!target||!camera.isOrthographicCamera||scene.children.length!==1||!material?.fragmentShader)throw Error('Unsupported resource producer');
  let key=this.hashes.get(material);if(!key){key=shaderKey(material.fragmentShader);this.hashes.set(material,key);}
  if(!this.supported.has(key))throw Error('Resource producer has no WGSL program: '+key);
  const recipe={key,revision:++this.revision,uniforms:snapshotUniforms(material.uniforms),target};
  for(const texture of target.textures)texture.userData.webgpuRecipe=recipe;
 }
 async readRenderTargetPixelsAsync(target,x,y,width,height,out){
  const gpu=await this.engine.webgpuReady;if(!gpu||gpu.disposed)throw Error('Renderer disposed before readback');
  const source=gpu.textures.get(target.texture),device=gpu.device;
  if(source.format!=='rgba16float'||!(out instanceof Uint16Array))throw Error('Resource readback requires RGBA half floats');
  const bytesPerRow=Math.ceil(width*8/256)*256,buffer=device.createBuffer({label:'resource CPU copy',size:bytesPerRow*height,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ});
  try{const encoder=device.createCommandEncoder();encoder.copyTextureToBuffer({texture:source.texture,origin:[x,y]},{buffer,bytesPerRow},[width,height]);device.queue.submit([encoder.finish()]);await buffer.mapAsync(GPUMapMode.READ);const rows=new Uint16Array(buffer.getMappedRange());for(let row=0;row<height;row++)out.set(rows.subarray(row*bytesPerRow/2,row*bytesPerRow/2+width*4),row*width*4);buffer.unmap();return out;}finally{buffer.destroy();}
 }
 dispose(){this.current=null;}
}
