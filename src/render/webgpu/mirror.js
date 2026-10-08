import { FULLSCREEN } from './shaders.js';
import { shaderModule } from './device.js';

const CODE=FULLSCREEN+/* wgsl */`
struct Mirror {
  inverse: mat4x4f,
  projection: mat4x4f,
  normalHeight: vec4f,
  shape: vec4f,
};
@group(0) @binding(0) var<uniform> u: Mirror;
@group(0) @binding(1) var sky: texture_cube<f32>;
@group(0) @binding(2) var skySampler: sampler;
struct Reflection { @location(0) color: vec4f, @builtin(frag_depth) depth: f32 };
@fragment fn mirror(v: Fullscreen) -> Reflection {
  let p=u.inverse*vec4f(v.uv.x*2.0-1.0,1.0-v.uv.y*2.0,1.0,1.0);
  let ray=normalize(p.xyz/p.w);
  // Subtract the astronomical radius in CPU double precision, then solve with
  // altitude/radius. Directly squaring the two radii erases metre-scale height.
  let radius=u.shape.x;
  let h=max(u.normalHeight.w,0.001)/radius;
  let b=(1.0+h)*dot(u.normalHeight.xyz,ray);
  let c=h*(2.0+h);
  let discriminant=b*b-c;
  if (b>=0.0 || discriminant<0.0) { discard; }
  let distance=radius*c/(-b+sqrt(discriminant));
  let normal=normalize(u.normalHeight.xyz*(1.0+h)+ray*(distance/radius));
  let reflected=reflect(ray,normal);
  let clip=u.projection*vec4f(ray*distance,1.0);
  var out: Reflection;
  out.depth=clamp(clip.z/clip.w,0.0,1.0);
  out.color=vec4f(textureSampleLevel(sky,skySampler,reflected,0.0).rgb*u.shape.y,1.0);
  return out;
}
`;

export class MirrorPass {
  constructor(device,background){this.device=device;this.background=background;this.buffers=new Map();}
  async init(){
    const module=await shaderModule(this.device,'mirror enclosure',CODE);
    this.pipeline=await this.device.createRenderPipelineAsync({label:'mirror enclosure',layout:'auto',
      vertex:{module,entryPoint:'fullscreen'},fragment:{module,entryPoint:'mirror',targets:[{format:'rgba16float'}]},
      depthStencil:{format:'depth32float',depthWriteEnabled:true,depthCompare:'greater'}});
  }
  render(engine,t,hdr,inverse,projection){
    const shell=engine.mirrorShell,source=engine.frameInputs?.sky?.cubeRT.texture;
    if(!shell||!source)return;
    const cube=this.background.cube(source);
    let buffer=this.buffers.get(engine.view);
    if(!buffer){buffer=this.device.createBuffer({label:'mirror view',size:160,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});this.buffers.set(engine.view,buffer);}
    const data=new Float32Array(40);
    data.set(inverse.elements);data.set(projection.elements,16);
    data.set([...shell.normal.toArray(),shell.height],32);
    data.set([shell.radius,engine.bgMat?.uniforms.uSkyGain?.value||1,0,0],36);
    this.device.queue.writeBuffer(buffer,0,data);
    const group=this.device.createBindGroup({layout:this.pipeline.getBindGroupLayout(0),entries:[
      {binding:0,resource:{buffer}},{binding:1,resource:cube.view},{binding:2,resource:cube.sampler}]});
    const encoder=this.device.createCommandEncoder({label:'mirror enclosure'});
    const pass=encoder.beginRenderPass({colorAttachments:[{view:hdr.createView(),loadOp:'load',storeOp:'store'}],
      depthStencilAttachment:{view:t.depth.createView(),depthLoadOp:'load',depthStoreOp:'store'}});
    pass.setPipeline(this.pipeline);pass.setBindGroup(0,group);pass.draw(3);pass.end();this.device.queue.submit([encoder.finish()]);
  }
  release(view){this.buffers.get(view)?.destroy();this.buffers.delete(view);}
  dispose(){for(const buffer of this.buffers.values())buffer.destroy();this.buffers.clear();}
}
