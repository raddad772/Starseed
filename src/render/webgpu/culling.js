import * as THREE from 'three';
import { shaderModule } from './device.js';
const CODE=/* wgsl */`
struct Params { planes:array<vec4f,6>, model:mat4x4f, sphere:vec4f, packing:vec4u, matrix:vec4i, cameraRange:vec4f };
@group(0) @binding(0) var<storage,read> jobs:array<Params>;
@group(0) @binding(4) var<storage,read> work:array<vec2u>;
@group(0) @binding(1) var<storage,read> source:array<f32>;
@group(0) @binding(2) var<storage,read_write> visible:array<f32>;
@group(0) @binding(3) var<storage,read_write> args:array<atomic<u32>>;
fn v4(at:u32)->vec4f{return vec4f(source[at],source[at+1u],source[at+2u],source[at+3u]);}
@compute @workgroup_size(64) fn cull(@builtin(workgroup_id) wg:vec3u,@builtin(local_invocation_index) lane:u32){
 let job=work[wg.x];let p=jobs[job.x];let i=job.y+lane;if(i>=p.packing.y){return;}let at=p.packing.w+i*p.packing.x;
 var center=p.sphere.xyz;var radius=p.sphere.w;
 if(p.matrix.x>=0){let a=v4(at+u32(p.matrix.x));let b=v4(at+u32(p.matrix.y));let c=v4(at+u32(p.matrix.z));let d=v4(at+u32(p.matrix.w));center=(mat4x4f(a,b,c,d)*vec4f(center,1.0)).xyz;radius*=max(length(a.xyz),max(length(b.xyz),length(c.xyz)));}
 else if(p.packing.z<0xffffffffu){let rock=v4(at+p.packing.z);center=rock.xyz;radius=max(radius,2.5*abs(rock.w));}
 let wp=(p.model*vec4f(center,1.0)).xyz;radius*=max(length(p.model[0].xyz),max(length(p.model[1].xyz),length(p.model[2].xyz)));
 for(var j=0u;j<6u;j++){if(dot(p.planes[j].xyz,wp)+p.planes[j].w < -radius){return;}}
 if(p.cameraRange.w>0.0&&distance(wp,p.cameraRange.xyz)>p.cameraRange.w+radius){return;}
 let dst=p.packing.w+atomicAdd(&args[job.x*5u+1u],1u)*p.packing.x;
 for(var j=0u;j<p.packing.x;j++){visible[dst+j]=source[at+j];}
}
`;
export class InstanceCuller {
 constructor(device){this.device=device;this.entries=new Map();this.enabled=true;this.buffers={};}
 async init(){const module=await shaderModule(this.device,'instance frustum culling',CODE);this.pipeline=await this.device.createComputePipelineAsync({label:'batched instance compaction',layout:'auto',compute:{module,entryPoint:'cull'}});}
 buffer(name,size,usage){let b=this.buffers[name];if(!b||b.size<size){b?.destroy();b=this.device.createBuffer({label:'culling '+name,size:2**Math.ceil(Math.log2(Math.max(256,size))),usage});this.buffers[name]=b;}return b;}
 encode(encoder,draws,frustum,camera){
  this.entries.clear();if(!this.enabled)return;
  const jobs=draws.filter(d=>!d.group&&d.object.instanceMatrix&&d.e.count>=2&&d.e.instances&&d.g.layout[1]?.arrayStride);
  if(!jobs.length)return;
  let bytes=0,groups=0;for(const d of jobs){bytes+=d.e.count*d.g.layout[1].arrayStride;groups+=Math.ceil(d.e.count/64);}
  const U=GPUBufferUsage,source=this.buffer('source',bytes,U.STORAGE|U.COPY_DST),output=this.buffer('visible',bytes,U.STORAGE|U.VERTEX),args=this.buffer('indirect',jobs.length*20,U.STORAGE|U.INDIRECT|U.COPY_DST|U.COPY_SRC),params=this.buffer('parameters',jobs.length*224,U.STORAGE|U.COPY_DST),work=this.buffer('work',groups*8,U.STORAGE|U.COPY_DST);
  const data=new ArrayBuffer(jobs.length*224),f=new Float32Array(data),u=new Uint32Array(data),ints=new Int32Array(data),argumentsData=new Uint32Array(jobs.length*5),dispatch=new Uint32Array(groups*2);
  let byteOffset=0,groupIndex=0;
  jobs.forEach((draw,job)=>{
   const {g,e,object}=draw,base=job*56,stride=g.layout[1].arrayStride;
   for(let j=0;j<6;j++){const p=frustum.planes[j];f.set([p.normal.x,p.normal.y,p.normal.z,p.constant],base+j*4);}
   f.set(object.matrixWorld.elements,base+24);
   if(!object.geometry.boundingSphere)object.geometry.computeBoundingSphere();const sphere=object.geometry.boundingSphere;
   const margin=draw.p.name.includes('grass')?4:draw.p.name.includes('flora')?1.5:draw.p.name.includes('rock')?2:0;
   f.set([sphere.center.x,sphere.center.y,sphere.center.z,Math.max(sphere.radius,margin)+margin],base+40);
   const offset=name=>g.fields.find(a=>a.name===name&&a.inst)?.offset/4;
   u.set([stride/4,e.count,0xffffffff,byteOffset/4],base+44);ints.set([0,1,2,3].map(n=>offset('instance'+n)??-1),base+48);
   const uniforms=object.material?.uniforms||object.material?.userData.webgpu?.uniforms||{};
   const far=camera.isPerspectiveCamera?(uniforms.uFadeEnd?.value||uniforms.uFadeR?.value||0):0;
   f.set([camera.position.x,camera.position.y,camera.position.z,far],base+52);
   const range=object.geometry.drawRange,start=range.start||0,count=Math.max(0,Math.min(g.count,start+range.count)-start);
   argumentsData.set([count,0,start,0,0],job*5);
   encoder.copyBufferToBuffer(e.instances,0,source,byteOffset,e.count*stride);
   draw.instanceBuffer=output;draw.instanceOffset=byteOffset;draw.instanceSize=e.count*stride;draw.indirect=args;draw.indirectOffset=job*20;
   this.entries.set(e,{args,offset:job*20,size:e.count*stride});
   for(let i=0;i<e.count;i+=64)dispatch.set([job,i],(groupIndex++)*2);
   byteOffset+=e.count*stride;
  });
  this.device.queue.writeBuffer(params,0,data);this.device.queue.writeBuffer(args,0,argumentsData);this.device.queue.writeBuffer(work,0,dispatch);
  const group=this.device.createBindGroup({layout:this.pipeline.getBindGroupLayout(0),entries:[params,source,output,args,work].map((buffer,binding)=>({binding,resource:{buffer}}))});
  const pass=encoder.beginComputePass({label:'batched cull and compact instances'});pass.setPipeline(this.pipeline);pass.setBindGroup(0,group);pass.dispatchWorkgroups(groups);pass.end();
 }
 dispose(){for(const b of Object.values(this.buffers))b.destroy();this.entries.clear();}
}
