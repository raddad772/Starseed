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
  gridEast: vec4f,   // its plates' grid: xyz the way east on it below the camera; w the camera's place east on the grid (mod a major cell)
  gridNorth: vec4f,  // xyz north; w the camera's place north
  grid: vec4f,       // x: a plate's width, y: plates to a major seam, z: a seam's half width, w: how dark a seam is
};
@group(0) @binding(0) var<uniform> u: Mirror;
@group(0) @binding(1) var sky: texture_cube<f32>;
@group(0) @binding(2) var skySampler: sampler;
@group(0) @binding(3) var<uniform> C: Central;
@group(0) @binding(4) var starA: texture_2d_array<f32>;
@group(0) @binding(5) var starB: texture_2d_array<f32>;
@group(0) @binding(6) var adapt: texture_2d<f32>;
struct Reflection { @location(0) color: vec4f, @builtin(frag_depth) depth: f32 };
// a grid of seams (one a cell, a its width as a share of the cell) averaged over a footprint w
// (cells) round (x, y): the share of it that's seam
fn cSeamCum(x: f32, a: f32) -> f32 { return floor(x) * a + min(fract(x), a); }
fn cSeam1(x: f32, w: f32, a: f32) -> f32 {
  let hw = max(w, 1e-4) * 0.5;
  // (centred on each cell's edge: shift so the seam runs from -a/2 to a/2)
  return clamp((cSeamCum(x + a * 0.5 + hw, a) - cSeamCum(x + a * 0.5 - hw, a)) / (2.0 * hw), 0.0, 1.0);
}
fn cSeams(x: f32, y: f32, w: f32, a: f32) -> f32 {
  let cx = cSeam1(x, w, a);
  let cy = cSeam1(y, w, a);
  return 1.0 - (1.0 - cx) * (1.0 - cy);
}
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
  let R0=vec3f(0.80,0.78,0.74);
  let F=R0+(vec3f(1.0)-R0)*pow(1.0-cosI,5.0);
  // (the sheen: the sky's glow blurred over tens of degrees, brighter than the sharp reflection's
  // dark between stars, and the hole's light spread round its reflection)
  let blur=textureSampleLevel(sky,skySampler,reflected,7.5).rgb*u.shape.y;
  let th=acos(clamp(dot(reflected,C.hole.xyz),-1.0,1.0));
  let lobe=select(0.0,C.disk.z*(0.006*exp(-th*th/0.004)+0.0006*exp(-th*th/0.09)),C.misc.w>0.5);
  let haze=u.shape.z;
  var silver=F*(col*(1.0-haze)+haze*(blur*1.6+lobe*vec3f(1.0,0.74,0.5)));
  // Its plates: a big, faint grid of seams, minor ones between plates and major ones every few, and
  // each plate a shade off its neighbours, as laid separately. Where the ray met the shell, from the
  // camera's foot on it (east and north on the grid there, in CPU doubles: f32 can't hold a seam's
  // place on a shell this size); seams thinner than a pixel fade by their share of it, and a grid
  // finer than a few pixels fades out before it shimmers
  let off=ray*distance+u.normalHeight.xyz*u.normalHeight.w;
  let gx=u.gridEast.w+dot(off,u.gridEast.xyz);
  let gy=u.gridNorth.w+dot(off,u.gridNorth.xyz);
  let fp=distance*C.stars3.x/max(cosI,0.05);
  let cell=u.grid.x;
  let major=cell*u.grid.y;
  // (seams at least a pixel wide, box-filtered over the pixel's footprint: near, crisp lines; far,
  // where plates shrink to a few pixels, they average into an even sheen of seams to the horizon
  // rather than vanishing or shimmering)
  // (the seams between plates where they're big enough to see; the major ones all the way out)
  let lineMinor=cSeams(gx/cell,gy/cell,fp/cell,clamp(1.1*fp/cell,u.grid.z/cell,0.5))*smoothstep(8.0,20.0,cell/fp);
  let lineMajor=cSeams(gx/major,gy/major,fp/major,clamp(1.5*fp/major,2.0*u.grid.z/major,0.5));
  let plate=fract(sin(dot(floor(vec2f(gx,gy)/cell),vec2f(12.9898,78.233)))*43758.5453);
  silver*=(1.0+0.035*(plate-0.5)*smoothstep(2.0,6.0,cell/fp))*(1.0-u.grid.w*max(0.55*lineMinor,lineMajor));
  out.color=vec4f(silver,1.0);
  return out;
}
`;

// the shell's plates: a plate's width and a seam's half width (world units, the camera's height
// above it ~30000 at the opening), and plates to a major seam
const PLATE=3000,PLATES_TO_SEAM=5,SEAM=6;

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
    if(!buffer){buffer={view:this.device.createBuffer({label:'mirror view',size:208,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),
      central:this.device.createBuffer({label:'mirror central black hole',size:CENTRAL_FLOATS*4,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST})};this.buffers.set(engine.view,buffer);}
    const data=new Float32Array(52);
    data.set(inverse.elements);data.set(projection.elements,16);
    data.set([...shell.normal.toArray(),shell.height],32);
    data.set([shell.radius,engine.bgMat?.uniforms.uSkyGain?.value||1,shell.haze??0.22,0],36);
    // (its plates' grid, in latitude and longitude on the shell round its own y axis: the camera's
    // foot on it, east and north there, its place on the grid in doubles, modulo a major cell)
    const n=shell.normal,cell=PLATE,major=PLATE*PLATES_TO_SEAM;
    let ex=n.z,ez=-n.x,el=Math.hypot(ex,ez);if(el<1e-9){ex=1;ez=0;el=1;}ex/=el;ez/=el;
    const north=[n.y*ez,n.z*ex-n.x*ez,-n.y*ex];
    const lat=Math.asin(Math.max(-1,Math.min(1,n.y))),lon=Math.atan2(n.x,n.z);
    const mod=(a,m)=>((a%m)+m)%m;
    data.set([ex,0,ez,mod(shell.radius*Math.cos(lat)*lon,major)],40);
    data.set([...north,mod(shell.radius*lat,major)],44);
    data.set([cell,PLATES_TO_SEAM,SEAM,0.28],48);
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
