import { CLUSTER_PARAMETERS as COMMON, CLUSTER_LIGHTING } from './cluster-shader.js';
import * as THREE from 'three';
import { shaderModule, timestampWrites } from './device.js';
import { FULLSCREEN } from './shaders.js';
import { HAND_LIGHT } from '../moonlight.js';

const TILE=64,SLICES=24,PER_CLUSTER=64,STRIDE=65;
const CULL=COMMON+/* wgsl */`
@group(0) @binding(2) var<storage,read_write> clusters:array<u32>;
@compute @workgroup_size(64) fn cull(@builtin(global_invocation_id) id:vec3u){
 let count=u32(clusterFrame.grid.x*clusterFrame.grid.y)*24u;if(id.x>=count){return;}
 let x=id.x%u32(clusterFrame.grid.x);let y=(id.x/u32(clusterFrame.grid.x))%u32(clusterFrame.grid.y);let z=id.x/u32(clusterFrame.grid.x*clusterFrame.grid.y);
 let zn=sliceDepth(f32(z));let zf=sliceDepth(f32(z+1u));
 let a=(vec2f(f32(x),f32(y))*64.0/clusterFrame.viewport.xy*2.0-1.0)*vec2f(clusterFrame.viewport.z,-clusterFrame.viewport.w);
 let b=(min(vec2f(f32(x+1u),f32(y+1u))*64.0,clusterFrame.viewport.xy)/clusterFrame.viewport.xy*2.0-1.0)*vec2f(clusterFrame.viewport.z,-clusterFrame.viewport.w);
 let lo=vec3f(min(min(a*zn,a*zf),min(b*zn,b*zf)),-zf);let hi=vec3f(max(max(a*zn,a*zf),max(b*zn,b*zf)),-zn);
 var n=0u;let base=id.x*65u;
 for(var i=0u;i<u32(clusterFrame.grid.z);i++){let l=lights[i];let delta=l.positionRange.xyz-clamp(l.positionRange.xyz,lo,hi);if(dot(delta,delta)<=l.positionRange.w*l.positionRange.w){if(n<64u){clusters[base+1u+n]=i;}n++;}}
 // An overflowing cluster falls back to the complete light list in shading.
 // No light is silently dropped, even when every lamp overlaps one tile.
 clusters[base]=n;
}
`;
const SHADE=CLUSTER_LIGHTING+FULLSCREEN+/* wgsl */`
@group(1) @binding(0) var albedo:texture_2d<f32>;
@group(1) @binding(1) var normals:texture_2d<f32>;
@group(1) @binding(2) var surface:texture_2d<f32>;
@group(1) @binding(3) var depth:texture_depth_2d;
@group(1) @binding(4) var visibility:texture_2d<f32>;
fn oct(e:vec2f)->vec3f{var n=vec3f(e,1.0-abs(e.x)-abs(e.y));let t=max(-n.z,0.0);n.x+=select(t,-t,n.x>=0.0);n.y+=select(t,-t,n.y>=0.0);return normalize(n);}
@fragment fn shade(v:Fullscreen)->@location(0) vec4f{
 let px=vec2i(v.position.xy);let d=textureLoad(depth,px,0);if(d<=0.0){discard;}
 let hp=clusterFrame.inverseVP*vec4f(v.uv*vec2f(2.0,-2.0)+vec2f(-1.0,1.0),d,1.0);let world=hp.xyz/hp.w;
 let m=textureLoad(normals,px,0);let kind=u32(m.w)%16u;let alb=textureLoad(albedo,px,0);let s=textureLoad(surface,px,0);
 return vec4f(clusterLight(world,oct(m.xy),vec4f(alb.rgb,alb.a*textureLoad(visibility,px,0).r),s,m.z,kind,v.position.xy),0.0);
}
`;
export class ClusteredLights {
 constructor(device){this.device=device;this.capacity=0;this.frame=new Float32Array(60);this.param=device.createBuffer({label:'cluster parameters',size:240,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});}
 async init(){
  const d=this.device,S=GPUShaderStage;
  const entries=type=>[{binding:0,visibility:S.COMPUTE|S.FRAGMENT,buffer:{type:'uniform'}},{binding:1,visibility:S.COMPUTE|S.FRAGMENT,buffer:{type:'read-only-storage'}},{binding:2,visibility:S.COMPUTE|S.FRAGMENT,buffer:{type}}];
  this.computeLayout=d.createBindGroupLayout({entries:entries('storage')});this.shadeLayout=d.createBindGroupLayout({entries:entries('read-only-storage')});
  this.texturesLayout=d.createBindGroupLayout({entries:[0,1,2,3,4].map(binding=>({binding,visibility:S.FRAGMENT,texture:{sampleType:binding===3?'depth':'unfilterable-float'}}))});
  const [cull,shade]=await Promise.all([shaderModule(d,'cluster light assignment',CULL),shaderModule(d,'cluster local lighting',SHADE)]);
  this.compute=await d.createComputePipelineAsync({layout:d.createPipelineLayout({bindGroupLayouts:[this.computeLayout]}),compute:{module:cull,entryPoint:'cull'}});
  this.shade=await d.createRenderPipelineAsync({layout:d.createPipelineLayout({bindGroupLayouts:[this.shadeLayout,this.texturesLayout]}),vertex:{module:shade,entryPoint:'fullscreen'},fragment:{module:shade,entryPoint:'shade',targets:[{format:'rgba16float',blend:{color:{operation:'add',srcFactor:'one',dstFactor:'one'},alpha:{operation:'add',srcFactor:'zero',dstFactor:'one'}}}]}});
 }
 collect(engine){
  const camera=engine.view.camera,view=camera.matrixWorldInverse,out=[];
  const push=(position,range,color,bounce=0,direction=new THREE.Vector3(),outer=-1,kind=0,inner=1,box=null)=>out.push([...position.toArray(),range,...color, bounce,...direction.toArray(),outer,kind,inner,box?1:0,0,...(box?.min.toArray()||[-1e20,-1e20,-1e20]),0,...(box?.max.toArray()||[1e20,1e20,1e20]),0]);
  engine.scene.traverseVisible(o=>{
   if((!o.isPointLight&&!o.isSpotLight)||o.intensity<=0||o.userData.webgpuHandLight)return;
   const p=o.getWorldPosition(new THREE.Vector3()).applyMatrix4(view),c=o.color.clone().multiplyScalar(o.intensity);
   const dir=o.isSpotLight?o.target.getWorldPosition(new THREE.Vector3()).sub(o.getWorldPosition(new THREE.Vector3())).transformDirection(view):new THREE.Vector3();
   push(p,o.distance||20000,[c.r,c.g,c.b],0,dir,o.isSpotLight?Math.cos(o.angle):-1,o.isSpotLight?1:0,o.isSpotLight?Math.cos(o.angle*(1-o.penumbra)):1);
  });
  const H=HAND_LIGHT;if(H.uHandE.value.lengthSq()>0)push(H.uHandPos.value.clone().applyMatrix4(view),20000,H.uHandE.value.toArray(),0,H.uHandDir.value.clone().transformDirection(view),H.uHandCone.value.y,2,H.uHandCone.value.x);
  engine.lightRig?.forEachNativeFixture((p,color,range,bounce,box)=>push(p,range,color,bounce,undefined,undefined,0,1,box));
  return out;
 }
 render(engine,t,inverse,shade=true){
  const lights=this.collect(engine);
  const d=this.device,n=lights.length;
  if(!this.lightBuffer||n>this.capacity){this.lightBuffer?.destroy();this.capacity=2**Math.ceil(Math.log2(Math.max(32,n)));this.lightBuffer=d.createBuffer({label:'local lights',size:this.capacity*96,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST});}
  if(n)d.queue.writeBuffer(this.lightBuffer,0,new Float32Array(lights.flat()));
  const gx=Math.ceil(t.width/TILE),gy=Math.ceil(t.height/TILE),count=gx*gy*SLICES;
  if(!t.clusters)t.clusters=d.createBuffer({label:'3D light clusters',size:count*STRIDE*4,usage:GPUBufferUsage.STORAGE});
  if(t.clusterGbuffer!==(t.activeGbuffer||t.shadedGbuffer)){t.clusterGbuffer=t.activeGbuffer||t.shadedGbuffer;t.clusterTextures=d.createBindGroup({layout:this.texturesLayout,entries:[(t.activeGbuffer||t.shadedGbuffer)[0],(t.activeGbuffer||t.shadedGbuffer)[1],(t.activeGbuffer||t.shadedGbuffer)[3],t.depth,t.ao].map((texture,binding)=>({binding,resource:texture.createView()}))});}
  const cam=engine.view.camera,data=this.frame;data.set(inverse.elements);data.set(cam.matrixWorldInverse.elements,16);data.set((engine.lightRig?.nativeToRoom||new THREE.Matrix4()).elements,32);
  const tan=Math.tan(cam.fov*Math.PI/360);data.set([t.width,t.height,tan*cam.aspect,tan,gx,gy,n,0,cam.near,20000,0,0],48);d.queue.writeBuffer(this.param,0,data);
  const group=layout=>d.createBindGroup({layout,entries:[this.param,this.lightBuffer,t.clusters].map((buffer,binding)=>({binding,resource:{buffer}}))});
  t.clusterGroup=group(this.shadeLayout);
  if(!n)return;
  const encoder=d.createCommandEncoder({label:'clustered local lights'});let pass=encoder.beginComputePass({timestampWrites:timestampWrites(d,'light clustering')});pass.setPipeline(this.compute);pass.setBindGroup(0,group(this.computeLayout));pass.dispatchWorkgroups(Math.ceil(count/64));pass.end();
  if(shade){pass=encoder.beginRenderPass({timestampWrites:timestampWrites(d,'local lights'),colorAttachments:[{view:t.hdr.createView(),loadOp:'load',storeOp:'store'}]});pass.setPipeline(this.shade);pass.setBindGroup(0,group(this.shadeLayout));pass.setBindGroup(1,t.clusterTextures);pass.draw(3);pass.end();}d.queue.submit([encoder.finish()]);
 }
 release(t){t.clusters?.destroy();}
 dispose(){this.param.destroy();this.lightBuffer?.destroy();}
}
