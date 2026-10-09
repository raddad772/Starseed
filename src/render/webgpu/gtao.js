// Horizon integration from Jimenez et al., ATVI-TR-16-01, equations 7–8:
// https://www.iryoku.com/downloads/Practical-Realtime-Strategies-for-Accurate-Indirect-Occlusion.pdf
// Fixed spatial samples avoid temporal noise; depth/normal-aware reconstruction
// keeps contact shading on its surface. Only indirect lighting consumes this map.
import { FULLSCREEN } from './shaders.js';
import { shaderModule, timestampWrites } from './device.js';
const COMMON=/* wgsl */`
// (toView: the view matrix times the inverse view-projection, made once on the CPU: a depth to its view-space
// point in one multiply, not two, for each of the search's 40 samples and the filter's nine: ~2 of its ~4.5 ms
// at 2048x1536)
struct Params { toView:mat4x4f, view:mat4x4f, size:vec4f, settings:vec4f };
@group(0) @binding(0) var<uniform> p:Params;
@group(0) @binding(1) var depth:texture_depth_2d;
@group(0) @binding(2) var normal:texture_2d<f32>;
fn oct(e:vec2f)->vec3f{var n=vec3f(e,1.0-abs(e.x)-abs(e.y));let t=max(-n.z,0.0);n.x+=select(t,-t,n.x>=0.0);n.y+=select(t,-t,n.y>=0.0);return normalize(n);}
fn position(pixel:vec2i)->vec3f{let d=textureLoad(depth,pixel,0);let uv=(vec2f(pixel)+0.5)/p.size.xy;let h=p.toView*vec4f(uv*vec2f(2.0,-2.0)+vec2f(-1.0,1.0),d,1.0);return h.xyz/h.w;}
fn normalAt(pixel:vec2i)->vec3f{return normalize((p.view*vec4f(oct(textureLoad(normal,pixel,0).xy),0.0)).xyz);}
`;
const HORIZON=COMMON+FULLSCREEN+/* wgsl */`
@fragment fn ao(v:Fullscreen)->@location(0) f32{
 let pixel=min(vec2i(v.position.xy)*2,vec2i(p.size.xy)-1);if(textureLoad(depth,pixel,0)<=0.0){return 1.0;}
 let P=position(pixel);let V=normalize(-P);let N=normalAt(pixel);let radius=p.settings.x;
 if(length(P)>250.0){return 1.0;}
 let pixelRadius=clamp(radius*p.size.y/(2.0*p.settings.y*max(-P.z,0.05)),2.0,64.0);
 let angleOffset=fract(dot(vec2f(pixel),vec2f(0.06711056,0.00583715)))*3.14159265;
 var sum=0.0;
 for(var slice=0u;slice<4u;slice++){
  let angle=(f32(slice)+0.5)*3.14159265/4.0+angleOffset;let direction=vec2f(cos(angle),sin(angle));
  let tangent=normalize(vec3f(direction.x,-direction.y,0.0)-V*dot(vec3f(direction.x,-direction.y,0.0),V));
  let axis=normalize(cross(V,tangent));let projected=N-axis*dot(N,axis);let projectedLength=length(projected);if(projectedLength<0.001){continue;}
  let gamma=atan2(dot(projected,tangent),dot(projected,V));var horizons=vec2f(-1.0);
  for(var side=0u;side<2u;side++){
   let sign=select(-1.0,1.0,side==1u);
   for(var step=1u;step<=5u;step++){
    let distancePixels=max(1.0,pixelRadius*pow(f32(step)/5.0,2.0));let q=pixel+vec2i(round(direction*sign*distancePixels));
    if(any(q<vec2i(0))||any(q>=vec2i(p.size.xy))||textureLoad(depth,q,0)<=0.0){continue;}
    let delta=position(q)-P;let distance=length(delta);if(distance<0.01||distance>=radius){continue;}
    let candidate=dot(delta/distance,V)-0.02;let weight=1.0-smoothstep(radius*0.7,radius,distance);
    horizons[side]=max(horizons[side],mix(-1.0,candidate,weight));
   }
  }
  let h1=max(-acos(clamp(horizons.x,-1.0,1.0)),gamma-1.5707963);let h2=min(acos(clamp(horizons.y,-1.0,1.0)),gamma+1.5707963);
  let value=(2.0*cos(gamma)-cos(2.0*h1-gamma)-cos(2.0*h2-gamma)+2.0*(h1+h2)*sin(gamma))*0.25;
  sum+=projectedLength*value;
 }
 return clamp(sum/4.0,0.0,1.0);
}
`;
const FILTER=COMMON+FULLSCREEN+/* wgsl */`
@group(0) @binding(3) var source:texture_2d<f32>;
@fragment fn reconstruct(v:Fullscreen)->@location(0) f32{
 let pixel=vec2i(v.position.xy);if(textureLoad(depth,pixel,0)<=0.0){return 1.0;}
 let P=position(pixel);let N=normalAt(pixel);let halfPixel=pixel/2;var total=0.0;var weight=0.0;
 for(var y=-1;y<=1;y++){for(var x=-1;x<=1;x++){
  let q=clamp(halfPixel+vec2i(x,y),vec2i(0),vec2i(textureDimensions(source))-1);let full=min(q*2,vec2i(p.size.xy)-1);
  let delta=position(full)-P;let w=exp(-abs(dot(delta,N))*30.0)*pow(max(dot(N,normalAt(full)),0.0),8.0)/(1.0+f32(x*x+y*y));
  total+=textureLoad(source,q,0).r*w;weight+=w;
 }}
 return mix(1.0,total/max(weight,1e-6),p.settings.z);
}
`;
export class GTAO {
 constructor(device){this.device=device;this.radius=1.2;this.strength=1;this.enabled=true;this.uniforms=device.createBuffer({size:160,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});}
 async init(){
  const d=this.device,S=GPUShaderStage;this.layout=d.createBindGroupLayout({entries:[{binding:0,visibility:S.FRAGMENT,buffer:{type:'uniform'}},{binding:1,visibility:S.FRAGMENT,texture:{sampleType:'depth'}},...[2,3].map(binding=>({binding,visibility:S.FRAGMENT,texture:{sampleType:'unfilterable-float'}}))]});
  const [horizon,filter]=await Promise.all([shaderModule(d,'GTAO horizons',HORIZON),shaderModule(d,'GTAO reconstruction',FILTER)]);
  const pipeline=(module,entryPoint,format)=>d.createRenderPipelineAsync({layout:d.createPipelineLayout({bindGroupLayouts:[this.layout]}),vertex:{module,entryPoint:'fullscreen'},fragment:{module,entryPoint,targets:[{format}]}});
  [this.horizon,this.filter]=await Promise.all([pipeline(horizon,'ao','r16float'),pipeline(filter,'reconstruct','r8unorm')]);
 }
 render(encoder,t,inverse,camera){
  if(!this.enabled){const pass=encoder.beginRenderPass({colorAttachments:[{view:t.ao.createView(),loadOp:'clear',storeOp:'store',clearValue:[1,1,1,1]}]});pass.end();return;}
  if(!t.aoHalf){t.aoHalf=this.device.createTexture({label:'GTAO half resolution',size:[Math.ceil(t.width/2),Math.ceil(t.height/2)],format:'r16float',usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.RENDER_ATTACHMENT});t.textures.push(t.aoHalf);}
  const toView=(this.toView||(this.toView=new inverse.constructor())).multiplyMatrices(camera.matrixWorldInverse,inverse);
  const values=new Float32Array(40);values.set(toView.elements);values.set(camera.matrixWorldInverse.elements,16);values.set([t.width,t.height,0,0,this.radius,Math.tan(camera.fov*Math.PI/360),this.strength,0],32);this.device.queue.writeBuffer(this.uniforms,0,values);
  const group=source=>this.device.createBindGroup({layout:this.layout,entries:[{binding:0,resource:{buffer:this.uniforms}},...[t.depth,(t.activeGbuffer||t.shadedGbuffer)[1],source].map((tex,i)=>({binding:i+1,resource:tex.createView()}))]});
  for(const [pipeline,texture] of [[this.horizon,t.aoHalf],[this.filter,t.ao]]){const pass=encoder.beginRenderPass({timestampWrites:timestampWrites(this.device,texture===t.aoHalf?'GTAO horizons':'GTAO reconstruction'),colorAttachments:[{view:texture.createView(),loadOp:'clear',storeOp:'store'}]});pass.setPipeline(pipeline);pass.setBindGroup(0,group(texture===t.aoHalf?t.gbuffer[0]:t.aoHalf));pass.draw(3);pass.end();}
 }
 dispose(){this.uniforms.destroy();}
}
