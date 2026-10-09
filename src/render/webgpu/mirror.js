import { FULLSCREEN } from './shaders.js';
import { shaderModule } from './device.js';
import { CENTRAL_WGSL, CENTRAL_FLOATS, centralUniforms } from './central.js';

// The mirrored enclosure's outer surface: each pixel's ray met with the shell and reflected, and what
// lies that way seen in it: the central black hole, its disk and jets and the sky bent round it
// (webgpu/central.js, the same light the sky shows), or the plain sky without one.
const CODE=FULLSCREEN+CENTRAL_WGSL+/* wgsl */`
struct Mirror {
  inverse: mat4x4f,
  projection: mat4x4f,
  normalHeight: vec4f,
  shape: vec4f,
};
@group(0) @binding(0) var<uniform> u: Mirror;
@group(0) @binding(1) var sky: texture_cube<f32>;
@group(0) @binding(2) var skySampler: sampler;
@group(0) @binding(3) var<uniform> C: Central;
@group(0) @binding(4) var starA: texture_2d_array<f32>;
@group(0) @binding(5) var starB: texture_2d_array<f32>;
@group(0) @binding(6) var adapt: texture_2d<f32>;
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
  let L=cLens(C,reflected);
  var col=L.color;
  if (L.trans>0.0) { col+=L.trans*(textureSampleLevel(sky,skySampler,L.dir,0.0).rgb*u.shape.y+cStars(C,starA,starB,adapt,L.dir,C.stars3.x)); }
  // Silvered: a metal's reflectance, a little under one and warmer than it is blue, rising to one
  // at grazing (Schlick), so the surface darkens a touch looking straight down on it and is whole
  // at its horizon; and a faint haze (u.shape.z of the light scattered a few degrees), the sky's
  // glow blurred and the hole's light spread in a soft lobe round its reflection
  let cosI=clamp(-dot(ray,normal),0.0,1.0);
  let R0=vec3f(0.92,0.90,0.86);
  let F=R0+(vec3f(1.0)-R0)*pow(1.0-cosI,5.0);
  let blur=textureSampleLevel(sky,skySampler,reflected,6.0).rgb*u.shape.y;
  let th=acos(clamp(dot(reflected,C.hole.xyz),-1.0,1.0));
  let lobe=select(0.0,C.disk.z*0.01*exp(-th*th/0.0016),C.misc.w>0.5);
  let haze=u.shape.z;
  out.color=vec4f(F*(col*(1.0-haze)+haze*(blur+lobe*vec3f(1.0,0.72,0.45))),1.0);
  return out;
}
`;

export class MirrorPass {
  constructor(device,background){this.device=device;this.background=background;this.buffers=new Map();this.centralData=new Float32Array(CENTRAL_FLOATS);}
  async init(){
    const module=await shaderModule(this.device,'mirror enclosure',CODE);
    this.pipeline=await this.device.createRenderPipelineAsync({label:'mirror enclosure',layout:'auto',
      vertex:{module,entryPoint:'fullscreen'},fragment:{module,entryPoint:'mirror',targets:[{format:'rgba16float'}]},
      depthStencil:{format:'depth32float',depthWriteEnabled:true,depthCompare:'greater'}});
  }
  render(engine,t,hdr,inverse,projection){
    const shell=engine.mirrorShell,sky=engine.frameInputs?.sky,source=sky?.cubeRT.texture;
    if(!shell||!source)return;
    const cube=this.background.cube(source),stars=this.background.stars(sky),adapt=t.post?.adapt[t.post.idx]||this.background.blank;
    let buffer=this.buffers.get(engine.view);
    if(!buffer){buffer={view:this.device.createBuffer({label:'mirror view',size:160,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),
      central:this.device.createBuffer({label:'mirror central black hole',size:CENTRAL_FLOATS*4,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST})};this.buffers.set(engine.view,buffer);}
    const data=new Float32Array(40);
    data.set(inverse.elements);data.set(projection.elements,16);
    data.set([...shell.normal.toArray(),shell.height],32);
    data.set([shell.radius,engine.bgMat?.uniforms.uSkyGain?.value||1,shell.haze??0.04,0],36);
    this.device.queue.writeBuffer(buffer.view,0,data);
    // (the hole's uniforms as the sky's own pass has them; its camera parts unused here)
    this.device.queue.writeBuffer(buffer.central,0,centralUniforms(engine,null,engine.tanHalf,[t.width,t.height],this.centralData));
    const group=this.device.createBindGroup({layout:this.pipeline.getBindGroupLayout(0),entries:[
      {binding:0,resource:{buffer:buffer.view}},{binding:1,resource:cube.view},{binding:2,resource:cube.sampler},{binding:3,resource:{buffer:buffer.central}},
      {binding:4,resource:stars.a},{binding:5,resource:stars.b},{binding:6,resource:adapt.view}]});
    const encoder=this.device.createCommandEncoder({label:'mirror enclosure'});
    const pass=encoder.beginRenderPass({colorAttachments:[{view:hdr.createView(),loadOp:'load',storeOp:'store'}],
      depthStencilAttachment:{view:t.depth.createView(),depthLoadOp:'load',depthStoreOp:'store'}});
    pass.setPipeline(this.pipeline);pass.setBindGroup(0,group);pass.draw(3);pass.end();this.device.queue.submit([encoder.finish()]);
  }
  release(view){const b=this.buffers.get(view);if(b){b.view.destroy();b.central.destroy();}this.buffers.delete(view);}
  dispose(){for(const b of this.buffers.values()){b.view.destroy();b.central.destroy();}this.buffers.clear();}
}
