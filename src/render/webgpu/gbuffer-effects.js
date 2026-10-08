import * as THREE from 'three';
import { FULLSCREEN } from './shaders.js';
import { GBUFFER_FORMATS } from './opaque.js';
import { shaderModule, timestampWrites } from './device.js';

// A renderer-only projector. Attach it to a body's or vessel's scene group;
// simulation-owned tracks/trails update these transforms without changing world generation.
export class SurfaceDecal extends THREE.Object3D {
 constructor({color=0x443326,opacity=1,roughness=0.9,wetness=0,metalness=0,emissive=0,edge=0.15}={}){super();this.userData.decal={color:new THREE.Color(color),opacity,roughness,wetness,metalness,emissive:new THREE.Color(emissive),edge};}
}
const CODE=FULLSCREEN+/* wgsl */`
struct Params { inverseVP:mat4x4f, size:vec4f, settings:vec4f };
struct Decal { inverse:mat4x4f, color:vec4f, surface:vec4f, emission:vec4f, normalEdge:vec4f };
@group(0) @binding(0) var<uniform> p:Params;
@group(0) @binding(1) var albedo:texture_2d<f32>;
@group(0) @binding(2) var normal:texture_2d<f32>;
@group(0) @binding(3) var emission:texture_2d<f32>;
@group(0) @binding(4) var surface:texture_2d<f32>;
@group(0) @binding(5) var depth:texture_depth_2d;
@group(0) @binding(6) var groundAlbedo:texture_2d<f32>;
@group(0) @binding(7) var groundNormal:texture_2d<f32>;
@group(0) @binding(8) var groundSurface:texture_2d<f32>;
@group(0) @binding(9) var groundDepth:texture_depth_2d;
@group(0) @binding(10) var<storage,read> decals:array<Decal>;
fn octDecode(e:vec2f)->vec3f{var n=vec3f(e,1.0-abs(e.x)-abs(e.y));let t=max(-n.z,0.0);n.x+=select(t,-t,n.x>=0.0);n.y+=select(t,-t,n.y>=0.0);return normalize(n);}
fn octEncode(n:vec3f)->vec2f{let q=n/(abs(n.x)+abs(n.y)+abs(n.z));return select(q.xy,(1.0-abs(q.yx))*select(vec2f(-1),vec2f(1),q.xy>=vec2f(0)),q.z<0.0);}
fn position(uv:vec2f,d:f32)->vec3f{let h=p.inverseVP*vec4f(uv*vec2f(2,-2)+vec2f(-1,1),d,1);return h.xyz/h.w;}
struct Out { @location(0) a:vec4f,@location(1) n:vec4f,@location(2) e:vec4f,@location(3) s:vec4f };
@fragment fn material(v:Fullscreen)->Out{
 let pixel=vec2i(v.position.xy);var out:Out;out.a=textureLoad(albedo,pixel,0);out.n=textureLoad(normal,pixel,0);out.e=textureLoad(emission,pixel,0);out.s=textureLoad(surface,pixel,0);
 let d=textureLoad(depth,pixel,0);if(d<=0){return out;}let world=position(v.uv,d);var N=octDecode(out.n.xy);let kind=u32(out.n.w)%16u;
 let gd=textureLoad(groundDepth,pixel,0);
 if(p.settings.x>0.5&&gd>0&&(kind==1u||kind==2u)&&out.s.x<0.01){
  let distance=length(world-position(v.uv,gd));let k=1.0-smoothstep(0.015,0.18,distance);
  let gn=textureLoad(groundNormal,pixel,0);let ga=textureLoad(groundAlbedo,pixel,0);let gs=textureLoad(groundSurface,pixel,0);
  out.a=mix(out.a,ga,k);N=normalize(mix(N,octDecode(gn.xy),k));out.n=vec4f(octEncode(N),mix(out.n.z,gn.z,k),select(out.n.w,gn.w,k>0.99));out.s=mix(out.s,gs,k);out.s.x=select(0.0,gs.x,k>0.99);
 }
 for(var i=0u;i<u32(p.size.z);i++){
  let decal=decals[i];let q=(decal.inverse*vec4f(world,1)).xyz;if(any(abs(q)>vec3f(0.5))){continue;}
  let facing=smoothstep(0.15,0.6,dot(N,decal.normalEdge.xyz));
  let edge=1.0-smoothstep(0.5-decal.normalEdge.w,0.5,max(abs(q.x),abs(q.z)));
  let mask=decal.color.w*edge*facing;
  if(u32(out.n.w)%16u==0u){out.s.x*=1.0-mask;}
  out.a=vec4f(mix(out.a.rgb,decal.color.rgb,mask),out.a.a);
  out.n.z=mix(out.n.z,decal.surface.x,mask);out.s.y=mix(out.s.y,decal.surface.y,mask);out.s.z=mix(out.s.z,decal.surface.z,mask);out.e=vec4f(mix(out.e.rgb,decal.emission.rgb,mask),out.e.a);
 }
 return out;
}
`;
export class GBufferEffects {
 constructor(device){this.device=device;this.intersections=true;this.capacity=0;this.params=device.createBuffer({size:96,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});}
 async init(){const d=this.device,S=GPUShaderStage;
  this.layout=d.createBindGroupLayout({entries:[{binding:0,visibility:S.FRAGMENT,buffer:{type:'uniform'}},...Array.from({length:9},(_,i)=>({binding:i+1,visibility:S.FRAGMENT,texture:{sampleType:i===4||i===8?'depth':'unfilterable-float'}})),{binding:10,visibility:S.FRAGMENT,buffer:{type:'read-only-storage'}}]});
  const module=await shaderModule(d,'G-buffer decals and intersections',CODE);this.pipeline=await d.createRenderPipelineAsync({layout:d.createPipelineLayout({bindGroupLayouts:[this.layout]}),vertex:{module,entryPoint:'fullscreen'},fragment:{module,entryPoint:'material',targets:GBUFFER_FORMATS.map(format=>({format}))}});
 }
 captureGround(encoder,t){for(const [a,b] of [[t.gbuffer[0],t.ground[0]],[t.gbuffer[1],t.ground[1]],[t.gbuffer[3],t.ground[2]],[t.depth,t.ground[3]]])encoder.copyTextureToTexture({texture:a},{texture:b},[t.width,t.height]);}
 plan(scene,terrain,opaque,optimized){
  const decals=[];scene.traverseVisible(o=>{if(o.userData.decal)decals.push(o);});
  const contacts=this.intersections&&terrain.length>0&&opaque.some(d=>d.p.name==='rock'||d.p.name==='flora');
  return {decals,contacts:optimized?contacts:this.intersections,capture:!optimized||contacts,process:!optimized||contacts||decals.length>0};
 }
 render(encoder,engine,t,inverse,plan){
  const {decals,contacts}=plan;
  if(!this.decalBuffer||decals.length>this.capacity){this.decalBuffer?.destroy();this.capacity=2**Math.ceil(Math.log2(Math.max(16,decals.length)));this.decalBuffer=this.device.createBuffer({label:'surface projectors',size:this.capacity*128,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST});}
  const values=new Float32Array(decals.length*32);
  decals.forEach((o,i)=>{const k=i*32,s=o.userData.decal,inverse=new THREE.Matrix4().copy(o.matrixWorld).invert(),up=new THREE.Vector3().setFromMatrixColumn(o.matrixWorld,1).normalize();values.set(inverse.elements,k);values.set([s.color.r,s.color.g,s.color.b,s.opacity,s.roughness,s.wetness,s.metalness,0,s.emissive.r,s.emissive.g,s.emissive.b,0,...up.toArray(),s.edge],k+16);});
  if(values.length)this.device.queue.writeBuffer(this.decalBuffer,0,values);
  const uniforms=new Float32Array(24);uniforms.set(inverse.elements);uniforms.set([t.width,t.height,decals.length,0,contacts?1:0,0,0,0],16);this.device.queue.writeBuffer(this.params,0,uniforms);
  const inputs=[...t.gbuffer,t.depth,...t.ground];const group=this.device.createBindGroup({layout:this.layout,entries:[{binding:0,resource:{buffer:this.params}},...inputs.map((tex,i)=>({binding:i+1,resource:tex.createView()})),{binding:10,resource:{buffer:this.decalBuffer}}]});
  const pass=encoder.beginRenderPass({label:'surface decals and contact blend',timestampWrites:timestampWrites(this.device,'material effects'),colorAttachments:t.shadedGbuffer.map(texture=>({view:texture.createView(),loadOp:'clear',storeOp:'store'}))});pass.setPipeline(this.pipeline);pass.setBindGroup(0,group);pass.draw(3);pass.end();
 }
 dispose(){this.params.destroy();this.decalBuffer?.destroy();}
}
