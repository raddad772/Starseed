import * as THREE from 'three';
import { shaderModule,bufferWithData } from './device.js';

// Bounded, current-frame spotlight shadows for local interiors. No visibility
// readback, occlusion query or previous-frame result is used.
const SIZE=512,COUNT=4;
const VERTEX=`@group(0) @binding(0) var<uniform> mvp:mat4x4f;
@vertex fn main(@location(0) p:vec3f)->@builtin(position) vec4f{
 let q=mvp*vec4f(p,1);return vec4f(q.xy,(q.z+q.w)*0.5,q.w);
}`;
export class LocalShadows {
 constructor(device){
  this.device=device;this.geometry=new Map();this.slots=new WeakMap();this.stats={lights:0,draws:0};
  this.texture=device.createTexture({label:'local spotlight shadow maps',size:[SIZE,SIZE,COUNT],format:'depth32float',usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING});
  this.view=this.texture.createView({dimension:'2d-array'});
  this.sampler=device.createSampler({compare:'less-equal',minFilter:'linear',magFilter:'linear'});
  this.matrices=device.createBuffer({label:'local shadow projections',size:COUNT*64,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST});
 }
 async init(){
  const d=this.device,module=await shaderModule(d,'local shadow depth',VERTEX);
  this.layout=d.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.VERTEX,buffer:{type:'uniform',hasDynamicOffset:true,minBindingSize:64}}]});
  this.pipeline=await d.createRenderPipelineAsync({label:'local shadow depth',layout:d.createPipelineLayout({bindGroupLayouts:[this.layout]}),vertex:{module,entryPoint:'main',buffers:[{arrayStride:12,attributes:[{shaderLocation:0,offset:0,format:'float32x3'}]}]},primitive:{topology:'triangle-list',cullMode:'none'},depthStencil:{format:'depth32float',depthWriteEnabled:true,depthCompare:'less',depthBias:2,depthBiasSlopeScale:1.4}});
 }
 vertices(g){
  let e=this.geometry.get(g);if(e)return e;const p=g.attributes.position,a=new Float32Array(p.count*3);for(let i=0;i<p.count;i++)a.set([p.getX(i),p.getY(i),p.getZ(i)],i*3);
  e={vertices:bufferWithData(this.device,'local shadow vertices',a,GPUBufferUsage.VERTEX),indices:g.index?bufferWithData(this.device,'local shadow indices',g.index.array,GPUBufferUsage.INDEX):null,format:g.index?.array instanceof Uint16Array?'uint16':'uint32',count:g.index?.count||p.count};
  e.release=()=>{e.vertices.destroy();e.indices?.destroy();this.geometry.delete(g);g.removeEventListener('dispose',e.release);};g.addEventListener('dispose',e.release);this.geometry.set(g,e);return e;
 }
 update(engine){
  this.slots=new WeakMap();this.stats={lights:0,draws:0};if(!engine.scene.userData.localShadows)return;
  const camera=engine.view.camera,lights=[],meshes=[];
  engine.scene.traverseVisible(o=>{
   if(o.isSpotLight&&o.castShadow&&o.intensity>0&&o.position.distanceTo(camera.position)<(o.distance||100))lights.push(o);
   if(o.isMesh&&!o.isInstancedMesh&&!Array.isArray(o.material)&&o.material.visible&&!o.material.transparent&&!o.material.isMeshBasicMaterial&&o.layers.test(camera.layers))meshes.push(o);
  });
  lights.sort((a,b)=>(b.userData.shadowPriority||0)-(a.userData.shadowPriority||0)||a.position.distanceToSquared(camera.position)-b.position.distanceToSquared(camera.position));lights.length=Math.min(COUNT,lights.length);if(!lights.length)return;
  const d=this.device,needed=lights.length*meshes.length*256;
  if(!this.drawBuffer||needed>this.capacity){this.drawBuffer?.destroy();this.capacity=Math.max(256,needed);this.drawBuffer=d.createBuffer({label:'local shadow transforms',size:this.capacity,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});this.group=d.createBindGroup({layout:this.layout,entries:[{binding:0,resource:{buffer:this.drawBuffer,size:64}}]});}
  const transforms=new Float32Array(this.capacity/4),projections=new Float32Array(COUNT*16),draws=[],mvp=new THREE.Matrix4();
  for(const [slot,l] of lights.entries()){
   this.slots.set(l,slot+1);const c=new THREE.PerspectiveCamera(l.angle*360/Math.PI,1,.12,l.distance||100);c.position.copy(l.getWorldPosition(new THREE.Vector3()));c.up.set(0,0,1);c.lookAt(l.target.getWorldPosition(new THREE.Vector3()));c.updateMatrixWorld();const vp=new THREE.Matrix4().multiplyMatrices(c.projectionMatrix,c.matrixWorldInverse);projections.set(vp.elements,slot*16);
   const frustum=new THREE.Frustum().setFromProjectionMatrix(vp),list=[];
   for(const [i,o] of meshes.entries())if(frustum.intersectsObject(o)){
    const offset=(slot*meshes.length+i)*256;mvp.multiplyMatrices(vp,o.matrixWorld);transforms.set(mvp.elements,offset/4);list.push({o,e:this.vertices(o.geometry),offset});
   }draws.push(list);
  }
  d.queue.writeBuffer(this.drawBuffer,0,transforms);d.queue.writeBuffer(this.matrices,0,projections);
  const encoder=d.createCommandEncoder({label:'current frame local shadows'});
  for(const [layer,list] of draws.entries()){
   const pass=encoder.beginRenderPass({colorAttachments:[],depthStencilAttachment:{view:this.texture.createView({dimension:'2d',baseArrayLayer:layer,arrayLayerCount:1}),depthClearValue:1,depthLoadOp:'clear',depthStoreOp:'store'}});pass.setPipeline(this.pipeline);
   for(const {o,e,offset} of list){pass.setBindGroup(0,this.group,[offset]);pass.setVertexBuffer(0,e.vertices);const start=o.geometry.drawRange.start||0,count=Math.min(e.count-start,o.geometry.drawRange.count);if(e.indices){pass.setIndexBuffer(e.indices,e.format);pass.drawIndexed(count,1,start);}else pass.draw(count,1,start);this.stats.draws++;}pass.end();
  }d.queue.submit([encoder.finish()]);this.stats.lights=lights.length;
 }
 dispose(){for(const e of [...this.geometry.values()])e.release();this.texture.destroy();this.matrices.destroy();this.drawBuffer?.destroy();}
}
